#!/usr/bin/env node
/*
  Dev-only, run manually. Gives a card whose ANSWER IS A PLACE a `locator` — a globe at the foot of the
  card with that place marked (see cardLocatorHTML in app.js).

    node .claude/add-locators.js <batch.json>
    node .claude/add-locators.js --check        # report which cards carry one, fetch nothing

  The batch names a card and the Wikipedia article whose coordinate is wanted:

    { "cards": {
        "gr-008": { "title": "Knossos" },
        "gr-012": { "title": "Cyclades", "name": "The Cyclades", "zoom": 5 },
        "rm-004": { "title": "Tiber", "zoom": 9 }
    } }

  `name` is what the dot is labelled and defaults to the card's own answer term — give it where the article
  and the answer are not the same words ("Cycladic civilisation" is marked at "The Cyclades"). `zoom` is
  optional and overrides the default ~50° window; a river or a region wants less, a small site more.

  A PLACE WITH EXTENT DECLARES ITS SHAPE HERE, AND THE SHAPE IS THE ONE THING NOT FETCHED (Sep 2026, with
  the six peoples of Iron Age Italy). A `kind` of "region" carries an `area` of [lon, lat] points and a
  `kind` of "range" a `spine`; app.js draws the first as a washed shape under a DASHED edge and the second
  as mountains along the line, and the dash is the honesty — a people's country has no border to be right
  about, so the drawing says "about here" rather than asserting a frontier Folio surveyed.

    { "cards": { "rm-012": { "title": "Rieti", "name": "The Sabine country", "kind": "region",
                             "area": [[12.42, 42.27], [12.62, 42.12], …] } } }

  The `at` is STILL FETCHED even for these: it is what a region falls back to when its own shape cannot be
  read, and a hand-typed pair is the one error nothing downstream can see. The shape is validated the way
  add-card.js validates a new card's — every point a real [lon, lat], at least three of them, and neither
  `area` nor `spine` accepted on a kind that would carry it in data.js and never draw it.

  THE COORDINATE IS FETCHED AND NEVER TYPED. This is the whole reason the script exists: a hand-entered
  pair is a dot a degree out, which draws perfectly, sits in the right country and points at the wrong
  place — and nothing on the page, in the data or in any test can say so. Each coordinate is the PRIMARY
  one the named article publishes; an article with none gets no locator and is reported by name.

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
  if (!title) die(id + ": no `title` — name the Wikipedia article whose coordinate is wanted");
  const zoom = spec.zoom == null ? 0 : Number(spec.zoom);
  if (spec.zoom != null && (!isFinite(zoom) || zoom <= 0)) die(id + ": `zoom` must be a positive number");
  const name = String(spec.name || card.answerText || "").trim();
  if (!name) die(id + ": no `name` and the card has no answerText to fall back on");
  /* The authored half, validated before a single request is made — the same rule this file already
     follows for everything else: a half-applied batch is worse than a refused one, and here a refusal
     after the fetches would also have wasted them. */
  const KINDS = ["point", "battle", "river", "range", "region"];
  const kind = spec.kind == null ? "point" : String(spec.kind);
  if (KINDS.indexOf(kind) < 0) die(id + ": `kind` must be one of " + KINDS.join(", ") + " — got " + JSON.stringify(spec.kind));
  const shapeKey = kind === "region" ? "area" : kind === "range" ? "spine" : null;
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
  if (shapeKey) {
    shape = pts(spec[shapeKey]);
    if (!shape) die(id + ": a locator of kind \"" + kind + "\" needs a `" + shapeKey + "` of at least three [lon, lat] points — without it the card falls back to a dot, which is the mark this kind exists to replace");
  }
  for (const extra of ["area", "spine"]) {
    if (spec[extra] != null && extra !== shapeKey) die(id + ": `" + extra + "` is only read on a locator of kind \"" + (extra === "area" ? "region" : "range") + "\" — this one is \"" + kind + "\", so the shape would sit in data.js and never be drawn");
  }
  const within = spec.within == null ? "" : String(spec.within).trim();
  jobs.push({ id, card, title, name, zoom, kind, shapeKey, shape, within });
}

(async () => {
  const done = [];
  for (const j of jobs) {
    const url = "https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=coordinates&coprimary=primary&titles=" +
      encodeURIComponent(j.title);
    let res = null;
    // the API rate-limits an unauthenticated caller hard; back off and retry rather than recording a 429
    // as "this article has no coordinate", which is the one wrong answer this script must never give
    for (let attempt = 0; attempt < 5 && !res; attempt++) {
      if (attempt) await new Promise((r) => setTimeout(r, 1500 * Math.pow(2, attempt - 1)));
      try {
        const r = await fetch(url, { headers: { "User-Agent": "folio-dev-script/1.0 (card locator coordinates)" } });
        if (r.status === 429) continue;
        if (!r.ok) { console.error("HTTP " + r.status + ": " + j.title); break; }
        res = await r.json();
      } catch (e) { console.error("fetch failed: " + j.title + " — " + e.message); }
    }
    if (!res) { console.error("gave up (rate limited): " + j.id + " / " + j.title); continue; }
    const pages = (res.query && res.query.pages) || {};
    let got = null, redirected = "";
    Object.keys(pages).forEach((pid) => {
      if (pages[pid].missing !== undefined) return;
      redirected = pages[pid].title || "";
      const c = pages[pid].coordinates && pages[pid].coordinates[0];
      if (c && isFinite(c.lon) && isFinite(c.lat)) got = [Math.round(c.lon * 1e4) / 1e4, Math.round(c.lat * 1e4) / 1e4];
    });
    if (!got) { console.warn("no primary coordinate: " + j.id + " / " + j.title + (redirected ? "" : "  (no such article)")); continue; }
    const loc = { name: j.name, at: got };
    if (j.zoom) loc.zoom = j.zoom;
    if (j.kind && j.kind !== "point") loc.kind = j.kind;
    if (j.shapeKey && j.shape) loc[j.shapeKey] = j.shape;
    if (j.within) loc.within = j.within;
    j.card.locator = loc;
    done.push(j.id + "  " + j.name + "  " + (j.kind === "point" ? "" : j.kind + (j.shape ? " (" + j.shape.length + " pts)" : "") + "  ") + "[" + got.join(", ") + "]" + (redirected && redirected !== j.title ? "  ← " + redirected : ""));
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
