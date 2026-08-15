#!/usr/bin/env node
/* Audit the LIVE cloud content overlay (`content_overrides`) against the shipped data files.
 *
 *   node .claude/check-overlay.js
 *
 * WHY THIS EXISTS. The overlay carries live admin edits as deltas keyed by CARD ID, GLOSSARY SLUG and
 * NODE ID, and it is applied on top of the shipped files for every visitor. Those keys are the only
 * thing joining an edit to its subject — so the moment an id changes meaning, a delta silently paints
 * its content onto somebody else. That is not hypothetical: the 2026-08-04 World History renumbering
 * moved 89 cards into new slots (see docs/world-history-card-plan.md) and left the overlay's deltas on
 * the old numbers, so seven cards spent the next fortnight showing another card's background — the
 * question, answer, date line and difficulty all correct, only the prose wrong. Nothing threw, every
 * count stayed healthy, and it was reported by a reader.
 *
 * RUN IT AFTER ANY RENUMBERING, and after baking the overlay down. It needs the network and is not
 * part of the site.
 *
 * It reports, and never writes: a card delta whose prose plainly belongs to another card, a delta
 * pointing at an id that no longer exists, a live collection the overlay DELETES, timeline eras that
 * differ from the shipped ones, footnote markers a delta has dropped, and what the row costs every
 * visitor on every page load.
 */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const APP = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const grab = (re, what) => { const m = re.exec(APP); if (!m) { console.error("ERROR: could not read " + what + " out of app.js"); process.exit(1); } return m[1]; };
const SUPA_URL = grab(/const SUPA_URL\s*=\s*"([^"]+)"/, "SUPA_URL");
const SUPA_KEY = grab(/const SUPA_KEY\s*=\s*"([^"]+)"/, "SUPA_KEY");

function loadWindow(files) { const win = {}; for (const f of files) vm.runInNewContext(fs.readFileSync(path.join(ROOT, f), "utf8"), { window: win }); return win; }
const W = loadWindow(["data.js", "glossary.js", "artefacts.js", "timeline.js"]);
const CARDS = W.CARD_DATA || [], byId = Object.fromEntries(CARDS.map(c => [c.id, c]));
const text = s => String(s == null ? "" : s).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const markers = s => (String(s == null ? "" : s).match(/<sup class="fn"/g) || []).length;
// a card's abstract opens on its own answer term, in bold — which is what lets a stray delta be spotted
const ownerOfAbstract = abs => { const k = text(abs).slice(0, 80); return (ownerOfAbstract._m || (ownerOfAbstract._m = new Map(CARDS.map(c => [text(c.abstract).slice(0, 80), c.id])))).get(k); };

let problems = 0, notes = 0;
const bad = (...a) => { problems++; console.log("  ✗", ...a); };
const note = (...a) => { notes++; console.log("  •", ...a); };

(async () => {
  const url = SUPA_URL + "/rest/v1/content_overrides?id=eq.1&select=data,updated_at";
  let rows;
  try {
    const r = await fetch(url, { headers: { apikey: SUPA_KEY } });
    if (!r.ok) { console.error("ERROR: " + r.status + " fetching the overlay — is the table migrated?"); process.exit(1); }
    rows = await r.json();
  } catch (e) { console.error("ERROR: could not reach Supabase (" + e.message + ")"); process.exit(1); }
  if (!Array.isArray(rows) || !rows.length) { console.log("No overlay row — the shipped files are what every reader sees. Nothing to check."); return; }

  const row = rows[0], d = row.data || {};
  const bytes = JSON.stringify(d).length;
  console.log("Live overlay — published " + row.updated_at);
  console.log("Every visitor downloads this row on every page load (cloudBootOverrides selects `data`).");
  console.log("  raw size: " + (bytes / 1048576).toFixed(2) + " MB\n");

  console.log("CARD DELTAS");
  const cards = d.cards || {};
  if (!Object.keys(cards).length) console.log("  (none)");
  for (const id of Object.keys(cards).sort()) {
    const ov = cards[id], real = byId[id];
    if (!real) { bad(id + " — no such card any more (delta is orphaned)"); continue; }
    if (ov.abstract) {
      const owner = ownerOfAbstract(ov.abstract);
      if (owner && owner !== id) bad(id + " (" + real.answerText + ") — its abstract is " + owner + "'s (" + (byId[owner] || {}).answerText + ")");
      else {
        const lost = markers(real.abstract) - markers(ov.abstract);
        if (lost > 0) bad(id + " (" + real.answerText + ") — abstract has lost " + lost + " footnote marker(s); its citations point at nothing");
      }
    }
    if (ov.image && ov.image.src && !ov.image.credit) bad(id + " — image has no credit (add-card.js refuses this)");
    if (ov.image && ov.image.src && !ov.image.alt) note(id + " — image has no alt text");
  }

  console.log("\nGLOSSARY DELTAS");
  const gl = d.glossary || {}, G = W.GLOSSARY || {};
  if (!Object.keys(gl).length) console.log("  (none)");
  for (const k of Object.keys(gl).sort()) {
    if (!G[k]) { bad(k + " — no such glossary term any more"); continue; }
    const lost = markers(G[k]) - markers(gl[k]);
    if (lost > 0) bad(k + " — has lost " + lost + " footnote marker(s)");
    const n = text(gl[k]).split(/(?<=[.!?])\s+/).filter(Boolean).length;
    if (n !== 3) bad(k + " — " + n + " sentences (a glossary description is exactly three)");
  }
  const gi = d.glossaryImages || {}, GI = W.GLOSSARY_IMAGES || {};
  for (const k of Object.keys(gi).sort()) {
    const o = gi[k], s = GI[k];
    if (s && s.alt && !o.alt) bad("glossary image " + k + " — has lost its alt text");
    if (s && /public domain|CC BY/i.test(String(s.desc)) && !/public domain|CC BY/i.test(String(o.desc))) bad("glossary image " + k + " — has lost its licence attribution");
  }

  console.log("\nTREE");
  const T = d.tree || {};
  const live = new Set(); (function walk(ns) { (ns || []).forEach(n => { live.add(n.id); walk(n.children); }); })((W.COLLECTION_TREE || {}).collections || W.COLLECTION_TREE);
  for (const id of Object.keys(T.deleted || {})) if (live.has(id)) bad("deletes " + id + ", which is a live collection in data.js — readers cannot see it");
  for (const id of Object.keys(T.created || {})) if (live.has(id)) note("re-creates " + id + ", which already ships");
  for (const [parent, kids] of Object.entries(T.order || {})) for (const k of kids) if (!live.has(k)) note("orders " + k + " under \"" + (parent || "(root)") + "\", which no longer exists");
  if (!problems && !notes) console.log("  (nothing)");

  console.log("\nTIMELINE");
  const ov = d.timeline;
  if (!Array.isArray(ov)) console.log("  (none — the shipped timeline.js is what readers get)");
  else {
    const canon = v => JSON.stringify(v, (k, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.keys(x).sort().reduce((o, k2) => (o[k2] = x[k2], o), {}) : x));
    const shipped = Object.fromEntries((W.TIMELINE || []).map(e => [e.year, e]));
    let same = 0;
    for (const e of ov) { if (canon(e) === canon(shipped[e.year])) same++; else bad("era " + e.year + " differs from the shipped timeline.js and overrides it"); }
    console.log("  " + same + " of " + ov.length + " eras identical to timeline.js (those are dead weight — " + (JSON.stringify(ov).length / 1048576).toFixed(2) + " MB of the row)");
  }

  console.log("\n" + (problems ? problems + " problem(s)" : "no problems") + (notes ? ", " + notes + " note(s)" : "") + ".");
  if (problems) {
    console.log("\nA delta is keyed by id. If ids were renumbered, remap or clear the overlay in the same pass —");
    console.log("see docs/world-history-card-plan.md's renumbering table and CLAUDE.md's overlay hygiene rule.");
  }
  process.exit(problems ? 1 : 0);
})();
