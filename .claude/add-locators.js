#!/usr/bin/env node
/*
  Dev-only, run manually. Gives a card whose ANSWER IS A PLACE a `locator` — a globe at the foot of the
  card with that place marked (see cardLocatorHTML in app.js).

    node .claude/add-locators.js <batch.json>
    node .claude/add-locators.js --check        # report which cards carry one, fetch nothing

  The batch names a card and the Wikipedia article whose coordinate is wanted:

    { "cards": {
        "gr-008": { "title": "Knossos" },
        "gr-012": { "title": "Cyclades", "name": "Cyclades", "zoom": 5 },
        "rm-004": { "title": "Tiber", "zoom": 9 }
    } }

  `name` is what the dot is labelled and defaults to the card's own answer term — give it where the article
  and the answer are not the same words ("Cycladic civilisation" is marked at "Cyclades"). `zoom` is
  optional and overrides the default ~50° window; a river or a region wants less, a small site more.

  A PLACE WITH EXTENT DECLARES ITS SHAPE HERE, AND THE SHAPE IS THE ONE THING NOT FETCHED (Sep 2026, with
  the six peoples of Iron Age Italy). A `kind` of "region" carries an `area` of [lon, lat] points and a
  `kind` of "range" a `spine`; app.js draws the first as a washed shape under a DASHED edge and the second
  as mountains along the line, and the dash is the honesty — a people's country has no border to be right
  about, so the drawing says "about here" rather than asserting a frontier Folio surveyed.

    { "cards": { "rm-012": { "title": "Rieti", "name": "Sabine country", "kind": "region",
                             "area": [[12.42, 42.27], [12.62, 42.12], …] } } }

  AN `area` MAY ALSO BE SEVERAL RINGS, for a place that is genuinely in separate blocks — pass a list of
  rings instead of a list of points. The Etruscan civilisation is the case it was written for: Etruria,
  the Po valley colonies and the Campanian cities, with Latium and Umbria in between, which were not
  Etruscan. One ring can draw Etruria or a blob containing Rome, and the second is a false claim rather
  than a rough one.

    { "cards": { "rm-022": { "title": "Etruscan civilization", "kind": "region",
                             "area": [ [[10.2,43.9], …], [[10.9,45.1], …], [[14.0,41.2], …] ] } } }

  The `at` is STILL FETCHED even for these: it is what a region falls back to when its own shape cannot be
  read, and a hand-typed pair is the one error nothing downstream can see. The shape is validated the way
  add-card.js validates a new card's — every point a real [lon, lat], at least three of them, and neither
  `area` nor `spine` accepted on a kind that would carry it in data.js and never draw it.

  THE COORDINATE IS FETCHED AND NEVER TYPED. This is the whole reason the script exists: a hand-entered
  pair is a dot a degree out, which draws perfectly, sits in the right country and points at the wrong
  place — and nothing on the page, in the data or in any test can say so. Each coordinate is the PRIMARY
  one the named article publishes; an article with none gets no locator and is reported by name.

  A PLACE WITH NO ARTICLE OF ITS OWN NAMES A WIKIDATA ITEM INSTEAD (Sep 2026, with Nariokotome). Several
  real places are described inside somebody else's article and so have no coordinate to read off one —
  the Nariokotome site lives inside `Turkana Boy`, which carries none, and Beringia's own article carries
  none. Pass `wikidata` in place of `title` and the item's `P625` is read, which is the same published
  record Wikipedia's coordinates come from. It widens where the coordinate is fetched FROM and leaves the
  rule that matters alone: it is still fetched, never typed.

    { "cards": { "wh-021": { "wikidata": "Q55627210", "name": "Nariokotome" } } }

  ONE TITLE PER REQUEST, for the reason .claude/fetch-place-coords.js records: `prop=coordinates`
  paginates, so a batched query answers for a handful and reports the rest as having no coordinate at all,
  which is indistinguishable from the truth.
*/
const fs = require("fs"), path = require("path");
const DATA = path.join(__dirname, "..", "data.js");
const die = (m) => { console.error("ERROR: " + m); process.exit(1); };

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
const win = loadWindow(DATA);
const CARDS = win.CARD_DATA || [];
const byId = new Map(CARDS.map((c) => [c.id, c]));

if (process.argv.includes("--check")) {
  const have = CARDS.filter((c) => c.locator && Array.isArray(c.locator.at));
  console.log("cards carrying a locator: " + have.length + " of " + CARDS.length);
  have.forEach((c) => console.log("  " + c.id + "  " + (c.locator.name || c.answerText) + "  [" + c.locator.at.join(", ") + "]" + (c.locator.zoom ? "  zoom " + c.locator.zoom : "")));
  process.exit(0);
}

const batchPath = process.argv[2];
if (!batchPath) die("usage: node .claude/add-locators.js <batch.json>");
let batch;
try { batch = JSON.parse(fs.readFileSync(batchPath, "utf8")); } catch (e) { die("could not read the batch: " + e.message); }
const want = batch.cards || batch;
if (!want || typeof want !== "object") die("the batch needs a `cards` object");

/* VALIDATE THE WHOLE BATCH BEFORE FETCHING ANYTHING. A half-applied batch is worse than a refused one —
   the same rule add-card-difficulty.js states — and here it also means half the requests were wasted. */
const jobs = [];
for (const id of Object.keys(want)) {
  const spec = typeof want[id] === "string" ? { title: want[id] } : want[id] || {};
  const card = byId.get(id);
  if (!card) die(id + " is not a card in data.js");
  const title = String(spec.title || "").trim();
  /* …OR A WIKIDATA ITEM, WHICH IS WHERE THE COORDINATE COMES FROM ANYWAY (Sep 2026, with Nariokotome).
     Several real places have no enwiki article of their own and so no coordinate to read off one: the
     Nariokotome site is described inside `Turkana Boy`, which carries none, and Beringia's article
     carries none either. Wikidata has both, as `P625` on an item, and it is the same published record
     Wikipedia's own coordinates are drawn from — so this widens WHERE the coordinate is fetched from
     without touching the rule that matters, which is that it is FETCHED. A hand-typed pair is still the
     one error nothing downstream can see. */
  const qid = String(spec.wikidata || "").trim();
  if (qid && !/^Q\d+$/.test(qid)) die(id + ": `wikidata` must be an item id like \"Q190927\" — got " + JSON.stringify(spec.wikidata));
  if (!title && !qid) die(id + ": no `title` or `wikidata` — name the Wikipedia article or the Wikidata item whose coordinate is wanted");
  const zoom = spec.zoom == null ? 0 : Number(spec.zoom);
  if (spec.zoom != null && (!isFinite(zoom) || zoom <= 0)) die(id + ": `zoom` must be a positive number");
  const name = String(spec.name || card.answerText || "").trim();
  if (!name) die(id + ": no `name` and the card has no answerText to fall back on");
  /* A MAP LABEL NAMES A PLACE, so it does not open on "The" (Sep 2026, on request) — no atlas prints
     "The Apennines" beside the range. Refused rather than stripped, for the reason add-card.js gives: The
     Hague and The Valley are real names this same window draws. */
  if (/^the\s/i.test(name)) die(id + ": `name` opens on \"The\" — write " + JSON.stringify(name.replace(/^the\s+/i, "")));
  /* The authored half, validated before a single request is made — the same rule this file already
     follows for everything else: a half-applied batch is worse than a refused one, and here a refusal
     after the fetches would also have wasted them. */
  const KINDS = ["point", "battle", "river", "range", "region", "sea", "shelf"];
  const kind = spec.kind == null ? "point" : String(spec.kind);
  if (KINDS.indexOf(kind) < 0) die(id + ": `kind` must be one of " + KINDS.join(", ") + " — got " + JSON.stringify(spec.kind));
  // a SEA and a SHELF each carry an `area` exactly as a region does; what differs is how app.js draws
  // it and what it is clipped to (see LOC_KINDS)
  const shapeKey = kind === "region" || kind === "sea" || kind === "shelf" ? "area" : kind === "range" ? "spine" : null;
  const pts = (v) => {
    if (!Array.isArray(v) || v.length < 3) return null;
    const out = [];
    for (const p of v) {
      if (!Array.isArray(p) || p.length !== 2) return null;
      const lon = Number(p[0]), lat = Number(p[1]);
      if (!isFinite(lon) || !isFinite(lat) || Math.abs(lon) > 180 || Math.abs(lat) > 90) return null;
      out.push([lon, lat]);
    }
    return out;
  };
  let shape = null;
  if (shapeKey === "area") {
    /* AN AREA MAY BE SEVERAL RINGS (Sep 2026, with the Etruscan civilisation). At its height the Etruscan
       world was three separate blocks — Etruria between the Arno and the Tiber, the Po valley colonies,
       and the Campanian cities — with Latium and Umbria in between, which were not Etruscan. One ring can
       draw Etruria or it can draw a blob containing Rome; neither is the civilisation, and the second is
       a claim rather than an approximation. So `area` takes a flat ring OR a list of rings, and every
       ring is validated on its own — a flat one is what every locator written before this carries and is
       still exactly right for a place with a single extent. */
    const v = spec.area;
    const nested = Array.isArray(v) && Array.isArray(v[0]) && Array.isArray(v[0][0]);
    const rings = (nested ? v : [v]).map(pts);
    if (!Array.isArray(v) || !v.length || rings.some((r) => !r)) die(id + ": `area` must be at least three [lon, lat] points, or a list of such rings — without a valid one the card falls back to a dot, which is the mark this kind exists to replace");
    shape = nested ? rings : rings[0];
  } else if (shapeKey) {
    shape = pts(spec[shapeKey]);
    if (!shape) die(id + ": a locator of kind \"" + kind + "\" needs a `" + shapeKey + "` of at least three [lon, lat] points — without it the card falls back to a dot, which is the mark this kind exists to replace");
  }
  for (const extra of ["area", "spine"]) {
    if (spec[extra] != null && extra !== shapeKey) die(id + ": `" + extra + "` is only read on a locator of kind \"" + (extra === "area" ? "region\", \"sea\" or \"shelf" : "range") + "\" — this one is \"" + kind + "\", so the shape would sit in data.js and never be drawn");
  }
  const within = spec.within == null ? "" : String(spec.within).trim();
  /* WHERE A REGION'S NAME IS WRITTEN, when the middle of its own shape is the wrong place for it. app.js
     names an area at its bounding box's centre, which is right for a single block and wrong for a shape
     in several: the Etruscan civilisation's three blocks put that centre in Umbria, between them, which
     was never Etruscan — so the name is placed in the heartland instead. It is a POINT and is authored,
     like the shape it belongs to; `at` stays fetched. */
  let label = null;
  if (spec.label != null) {
    const L = spec.label;
    if (!Array.isArray(L) || L.length !== 2 || !isFinite(Number(L[0])) || !isFinite(Number(L[1])) || Math.abs(Number(L[0])) > 180 || Math.abs(Number(L[1])) > 90) die(id + ": `label` must be a [lon, lat] pair");
    if (kind !== "region" && kind !== "sea" && kind !== "shelf") die(id + ": `label` is only read on a region, a sea or a shelf — this one is \"" + kind + "\", so it would sit in data.js and never be used");
    label = [Number(L[0]), Number(L[1])];
  }
  jobs.push({ id, card, title, qid, name, zoom, kind, shapeKey, shape, within, label });
}

/* A shape is a polyline (a spine) or a list of RINGS (an area) — say which, so the run's own report
   makes it obvious whether a multi-block area went in as one ring by mistake. */
function shapeSize(shape) {
  const nested = Array.isArray(shape[0]) && Array.isArray(shape[0][0]);
  if (!nested) return shape.length + " pts";
  return shape.length + " rings, " + shape.reduce((a, r) => a + r.length, 0) + " pts";
}

// the same backoff for both sources: the API rate-limits an unauthenticated caller hard, and recording a
// 429 as "this has no coordinate" is the one wrong answer this script must never give
async function getJSON(url, label) {
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 1500 * Math.pow(2, attempt - 1)));
    try {
      const r = await fetch(url, { headers: { "User-Agent": "folio-dev-script/1.0 (card locator coordinates)" } });
      if (r.status === 429) continue;
      if (!r.ok) { console.error("HTTP " + r.status + ": " + label); return null; }
      return await r.json();
    } catch (e) { console.error("fetch failed: " + label + " — " + e.message); }
  }
  return null;
}

(async () => {
  const done = [];
  for (const j of jobs) {
    let got = null, redirected = "", source = j.qid || j.title;
    if (j.qid) {
      // Special:EntityData rather than the API's wbgetentities: it is the plain, cacheable JSON route
      const e = await getJSON("https://www.wikidata.org/wiki/Special:EntityData/" + j.qid + ".json", j.qid);
      if (!e) { console.error("gave up (rate limited): " + j.id + " / " + j.qid); continue; }
      const ent = e.entities && e.entities[j.qid];
      const cl = ent && ent.claims && ent.claims.P625 && ent.claims.P625[0].mainsnak.datavalue;
      redirected = (ent && ent.labels && ent.labels.en && ent.labels.en.value) || j.qid;
      if (cl && isFinite(cl.value.longitude) && isFinite(cl.value.latitude)) {
        got = [Math.round(cl.value.longitude * 1e4) / 1e4, Math.round(cl.value.latitude * 1e4) / 1e4];
      }
      if (!got) { console.warn("no P625 coordinate: " + j.id + " / " + j.qid + " (" + redirected + ")"); continue; }
    } else {
    const url = "https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=coordinates&coprimary=primary&titles=" +
      encodeURIComponent(j.title);
    const res = await getJSON(url, j.title);
    if (!res) { console.error("gave up (rate limited): " + j.id + " / " + j.title); continue; }
    const pages = (res.query && res.query.pages) || {};
    Object.keys(pages).forEach((pid) => {
      if (pages[pid].missing !== undefined) return;
      redirected = pages[pid].title || "";
      const c = pages[pid].coordinates && pages[pid].coordinates[0];
      if (c && isFinite(c.lon) && isFinite(c.lat)) got = [Math.round(c.lon * 1e4) / 1e4, Math.round(c.lat * 1e4) / 1e4];
    });
    }
    if (!got) { console.warn("no primary coordinate: " + j.id + " / " + source + (redirected ? "" : "  (no such article)")); continue; }
    const loc = { name: j.name, at: got };
    if (j.zoom) loc.zoom = j.zoom;
    if (j.kind && j.kind !== "point") loc.kind = j.kind;
    if (j.shapeKey && j.shape) loc[j.shapeKey] = j.shape;
    if (j.within) loc.within = j.within;
    if (j.label) loc.label = j.label;
    j.card.locator = loc;
    done.push(j.id + "  " + j.name + "  " + (j.kind === "point" ? "" : j.kind + (j.shape ? " (" + shapeSize(j.shape) + ")" : "") + "  ") + "[" + got.join(", ") + "]" + (redirected && redirected !== source ? "  ← " + redirected : ""));
    await new Promise((r) => setTimeout(r, 900));   // be polite to the API
  }

  if (!done.length) { console.error("nothing to write"); process.exit(1); }

  // ---- serialize, mirroring the other helpers' formatting -------------------------------------------
  const src = fs.readFileSync(DATA, "utf8");
  const startMark = "window.CARD_DATA = ";
  const start = src.indexOf(startMark);
  if (start < 0) die("could not find `window.CARD_DATA = ` in data.js");
  const arrStart = src.indexOf("[", start);
  let depth = 0, arrEnd = -1, inStr = null, esc = false;
  for (let i = arrStart; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (ch === "\\") { esc = true; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; continue; }
    if (ch === "[") depth++;
    else if (ch === "]") { depth--; if (!depth) { arrEnd = i; break; } }
  }
  if (arrEnd < 0) die("could not find the end of the CARD_DATA array");
  // ONE card per line, the shape every other helper writes
  fs.writeFileSync(DATA, src.slice(0, arrStart) + "[\n" + CARDS.map((c) => JSON.stringify(c)).join(",\n") + "\n]" + src.slice(arrEnd + 1));

  // re-parse to confirm we did not corrupt the file
  try { loadWindow(DATA); } catch (e) { die("data.js no longer parses: " + e.message); }

  console.log("wrote " + done.length + " locator(s):");
  done.forEach((d) => console.log("  " + d));
  const missed = jobs.filter((j) => !j.card.locator);
  if (missed.length) console.log("no locator for: " + missed.map((j) => j.id).join(", "));
  const total = CARDS.filter((c) => c.locator).length;
  console.log("cards carrying a locator: " + total + " of " + CARDS.length);
})();
