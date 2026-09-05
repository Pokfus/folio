#!/usr/bin/env node
/* Turn a citation PLAN into a batch for add-artefact-sources.js.
   =============================================================
     node .claude/mark-artefact-sources.js <plan.json> <out.json>

   <plan.json>  { "<id>": { "sources": [ … ], "marks": { "1": [1], "2": [2,3], … } }, … }

   `marks` maps a SENTENCE NUMBER (1–5, in the description's own order) to the source numbers that carry
   it. This script splits the shipped description with split-abstract.js, appends the markers to the
   sentences named, and writes the merged description into a batch the citation tool can take.

   It exists because the alternative is hand-editing a 200-word HTML string per artefact, which is how a
   marker ends up inside a tag, or a sentence quietly loses its full stop, or the five-sentence count
   breaks. Everything here is mechanical; the JUDGEMENT — which work carries which sentence — is in the
   plan, where it can be read.

   Two rules it enforces before writing anything:
     · a sentence number outside the description's own range (the description is five sentences; a plan
       naming a sixth has been written against a different version of the text)
     · a source number outside the list, which would put a marker past the end and have wireFootnotes
       delete it at render time — the failure that leaves a claim looking cited and pointing at nothing */
const fs = require("fs"), path = require("path");
const { pieces } = require("./split-abstract.js");

const [planFile, outFile] = process.argv.slice(2);
if (!planFile || !outFile) { console.error("usage: node .claude/mark-artefact-sources.js <plan.json> <out.json>"); process.exit(1); }
const plan = JSON.parse(fs.readFileSync(planFile, "utf8"));

global.window = {};
// the pool is TWO files — artefacts.js is the eager index and carries no `desc` at all, which is
// exactly what this script places markers into. See .claude/split-artefacts.js.
global.window.ARTEFACTS = require("./artefact-io.js").loadArtefacts();
const byId = {};
(global.window.ARTEFACTS || []).forEach((a) => { byId[a.id] = a; });

const errs = [];
const out = { artefacts: {} };
Object.keys(plan).forEach((id) => {
  const a = byId[id];
  if (!a) { errs.push(id + ": not in artefacts.js."); return; }
  const p = plan[id], src = p.sources || [];
  /* Markers go on the shipped text unless the plan supplies a `desc`, which is how a CORRECTION travels:
     where a source turns out not to bear a sentence out, the sentence is rewritten to what the source does
     say and the markers are placed on the new text in the same pass. Both halves are then visible in one
     diff, which is the point — a correction made separately reads as an unexplained prose edit. */
  const sents = pieces(p.desc == null ? a.desc : p.desc);
  const add = {};
  Object.keys(p.marks || {}).forEach((k) => {
    const i = Number(k);
    if (!(i >= 1 && i <= sents.length)) { errs.push(id + ": sentence " + k + " — the description has " + sents.length + "."); return; }
    (p.marks[k] || []).forEach((n) => {
      if (!(n >= 1 && n <= src.length)) { errs.push(id + ": marker points at source " + n + " and the list has " + src.length + "."); return; }
      (add[i] = add[i] || []).push(n);
    });
  });
  /* The marker sits AFTER the sentence's own terminal punctuation and BEFORE the space that follows it,
     which is where a card's sits and is what split-abstract.js is taught to read past — appended after the
     space instead, the very next run of this script sees one sentence where there were five. `pieces` keeps
     each sentence's own trailing whitespace, so the join is "" and the spacing comes back byte for byte.
     Written EMPTY: the digit a reader sees is drawn from the list at render time. */
  const desc = sents.map((s, i) => {
    const ns = add[i + 1] || [];
    if (!ns.length) return s;
    const m = s.match(/^([\s\S]*?)(\s*)$/);
    return m[1] + ns.map((n) => '<sup class="fn" data-fn="' + n + '"></sup>').join("") + m[2];
  }).join("");
  out.artefacts[id] = { sources: src, desc };
});
if (errs.length) { errs.forEach((e) => console.error("ERROR: " + e)); process.exit(1); }
fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
console.log("planned " + Object.keys(out.artefacts).length + " artefacts → " + outFile);
