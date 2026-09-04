#!/usr/bin/env node
/* Cite the artefacts — sources and footnote markers onto entries already in ../artefacts.js.
   =========================================================================================
     node .claude/add-artefact-sources.js <batch.json>

   <batch.json>  { "artefacts": { "<id>": { "sources": [ … ], "desc": "<the description, with markers>" }, … } }

   `desc` is optional: give it when the markers are being placed (which is almost always, the first time an
   artefact is cited) or when a source turned out not to bear a sentence out and the prose had to be
   corrected. Omit it to top up a list that is already marked.

   It exists for the same reason add-sources.js does one shelf over: add-artefacts.js refuses a duplicate id
   and rewrites the whole file, so it cannot be used to amend what is already there, and a hand edit that
   drifts from `serializeArtefacts`'s output format is a diff nobody can read the next time an editor saves
   from Admin → Artefacts.

   Every check is a REFUSAL, not a warning:
     · an id that is not in artefacts.js — a citation filed under a name nothing looks up is a citation
       nobody will ever see
     · fewer than ARTEFACT_SRC_TARGET sources (read out of app.js, so the bar cannot be raised in one place
       and left standing in another)
     · a citation that does not end in a URL a reader can open
     · a source no marker points at — a works list is not an apparatus
     · a marker pointing past the end of the list — wireFootnotes DELETES those at render time, so the claim
       silently loses its citation
     · a description that has stopped being five sentences or has left the 180–220-word band, which is what
       correcting prose to match a source tends to do to it

   The markers themselves are written EMPTY — <sup class="fn" data-fn="2"></sup> — exactly as a card's are:
   the digit a reader sees is drawn from the list at render time, so re-ordering the list can never leave a
   stale number sitting in a sentence. */
const fs = require("fs"), path = require("path");
const { pieces } = require("./split-abstract.js");
const root = path.join(__dirname, "..");
/* THE POOL IS TWO FILES (see .claude/split-artefacts.js) and this script re-serialises what it
   loads, so it goes through artefact-io.js — reading artefacts.js alone would append the citations
   correctly and delete every description in the pool on the way out. */
const { loadArtefacts, writeArtefacts } = require("./artefact-io.js");

// the bar, sliced out of app.js by text so this file and the site can never disagree about what it is
const APP = fs.readFileSync(path.join(root, "app.js"), "utf8");
const BAR = (() => {
  const m = APP.match(/const\s+ARTEFACT_SRC_TARGET\s*=\s*(\d+)/);
  if (!m) { console.error("ERROR: ARTEFACT_SRC_TARGET not found in app.js."); process.exit(1); }
  return parseInt(m[1], 10);
})();

const SENTENCES = 5, WORD_MIN = 180, WORD_MAX = 220;
const IMPERIAL_PAREN = /\s*\((?=[^)]*\d)[^)]*\b(?:miles?|foot|feet|ft|inch(?:es)?|in|yards?|pounds?|lbs?|ounces?|oz|tons?|acres?|gallons?|pints?|quarts?|sq\s?mi|°F)\b[^)]*\)/gi;
const URL_RX = /https?:\/\/[^\s<>"')\]]+/;

const arg = process.argv[2];
if (!arg) { console.error("usage: node .claude/add-artefact-sources.js <batch.json>"); process.exit(1); }
const batch = JSON.parse(fs.readFileSync(arg, "utf8"));
const patch = batch.artefacts || batch;
if (!patch || typeof patch !== "object" || !Object.keys(patch).length) { console.error("ERROR: batch holds no artefacts."); process.exit(1); }

const all = loadArtefacts();   // both files, merged, exactly as the browser sees them
const byId = {};
all.forEach((a) => { byId[a.id] = a; });

/* Which sources a description actually points at, and whether it points past the end of the list.
   A marker with no data-fn takes the next number in reading order, which is what wireFootnotes does. */
function markersOf(desc) {
  const out = [];
  let seq = 0;
  String(desc || "").replace(/<sup[^>]*class="[^"]*\bfn\b[^"]*"[^>]*>/gi, (tag) => {
    const m = tag.match(/data-fn="(\d+)"/i);
    const n = m ? parseInt(m[1], 10) : ++seq;
    if (m) seq = Math.max(seq, n);
    out.push(n);
    return tag;
  });
  return out;
}

const errs = [];
Object.keys(patch).forEach((id) => {
  const at = "artefact " + id;
  const a = byId[id];
  if (!a) { errs.push(at + ": not in artefacts.js."); return; }
  const p = patch[id] || {};
  const src = Array.isArray(p.sources) ? p.sources.map((s) => String(s).replace(/\s+/g, " ").trim()).filter(Boolean) : null;
  if (!src) { errs.push(at + ": no sources array."); return; }
  if (src.length < BAR) errs.push(at + ": " + src.length + " sources — the bar is " + BAR + ".");
  src.forEach((s, i) => { if (!URL_RX.test(s)) errs.push(at + ": source " + (i + 1) + " carries no URL."); });
  if (new Set(src).size !== src.length) errs.push(at + ": the same citation appears twice.");

  const desc = p.desc == null ? a.desc : String(p.desc);
  const marks = markersOf(desc);
  if (!marks.length) errs.push(at + ": the description points at nothing — every source needs a marker.");
  marks.forEach((n) => { if (n > src.length) errs.push(at + ": a marker points at source " + n + " and the list has " + src.length + "."); });
  for (let i = 1; i <= src.length; i++) if (marks.indexOf(i) < 0) errs.push(at + ": source " + i + " is not referenced by any marker.");

  const n = pieces(desc).length;
  if (n !== SENTENCES) errs.push(at + ": desc is " + n + " sentences — it must be exactly " + SENTENCES + ".");
  const words = desc.replace(/<[^>]+>/g, "").replace(IMPERIAL_PAREN, "").trim().split(/\s+/).length;
  if (words < WORD_MIN || words > WORD_MAX) errs.push(at + ": desc is " + words + " words — the bar is " + WORD_MIN + "–" + WORD_MAX + ".");
  IMPERIAL_PAREN.lastIndex = 0;
});
if (errs.length) { errs.forEach((e) => console.error("ERROR: " + e)); process.exit(1); }

// merge, then rewrite the whole file in serializeArtefacts()'s exact output format
Object.keys(patch).forEach((id) => {
  const p = patch[id];
  const a = byId[id];
  a.sources = p.sources.map((s) => String(s).replace(/\s+/g, " ").trim());
  if (p.desc != null) a.desc = String(p.desc);
});

/* Write BOTH files through artefact-io.js rather than from a serializer of this script's own. The
   copy that used to live here had gone stale in exactly the way a copy does: it emitted an image as
   `{ src, credit, alt }`, having been written before the fullscreen viewer's `title` and `desc` were
   added in Aug 2026 — so one run of this citation tool would have stripped the caption off all 100
   pictures, silently, while doing its own job perfectly. One serializer, in one place. */
writeArtefacts(all);

// re-load both, so a malformed write is caught here rather than by a reader with a blank plate
const back = loadArtefacts();
if (back.length !== all.length) { console.error("ERROR: re-parse returned the wrong count."); process.exit(1); }
const lost = back.filter((a) => !a.desc || !a.desc.trim());
if (lost.length) { console.error("ERROR: " + lost.length + " artefacts came back with no description."); process.exit(1); }

const at = back.filter((a) => (a.sources || []).length >= BAR).length;
const none = back.filter((a) => !(a.sources || []).length).length;
console.log("cited " + Object.keys(patch).length + " — " + at + " of " + back.length + " artefacts are at the " + BAR + "-source bar" +
  (none ? ", " + none + " still carry none" : "") + ".");
