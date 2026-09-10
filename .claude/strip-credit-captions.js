#!/usr/bin/env node
/* ============================================================================
   strip-credit-captions.js — A CAPTION THAT ENDS BY CREDITING ITSELF

     node .claude/strip-credit-captions.js [--check] [--verbose]

   THE FAULT. A picture on Folio carries `desc` (what it shows) and `credit`
   (whose it is). Both are read off Wikimedia Commons, and Commons puts the
   attribution INSIDE its own file description — so a great many captions end
   with the very sentence the credit line beside them already says:

     desc:   "The gold death mask of Tutankhamun, from his burial in the Valley
              of the Kings. Thomas Clouet, CC BY 4.0, via Wikimedia Commons."
     credit: "Thomas Clouet, CC BY 4.0, via Wikimedia Commons."

   In the fullscreen viewer those two lines sit one above the other, so the
   reader is told the same thing twice, and the second telling is the half that
   is not about the picture.

   ============================================================================
   THE RULE IS AN EXACT MATCH AGAINST THAT ITEM'S OWN CREDIT, AND IT IS THE ONLY
   SAFE ONE. It was solved once already, in the picture round (`picCaption` in
   app.js), and this is the same rule applied at the data level rather than at
   the draw: the credit's text up to its URL is compared with the END of the
   caption, and only a byte-for-byte tail is removed. So it cannot eat a caption
   that merely mentions a photographer, and it can never remove an attribution
   the reader would otherwise lose — the credit beside it says the same words.

   IT IS NOT THE LOOSER RULE, AND THE MEASUREMENT IS WHY. Sweeping instead for a
   caption that merely ENDS in something attribution-shaped ("…, CC BY-SA 4.0,
   via Wikimedia Commons.") finds 1,522 more — and on nearly every one of them
   the `credit` field is a BARE COMMONS URL, so the licence named in the caption
   is the only attribution the picture has. Stripping those would not remove a
   duplicate; it would remove the credit, on a picture Folio is required to
   attribute. **Do not widen this.** Fixing that class means writing the credit
   line properly first, which is a judgement per file.

   Report-only under `--check` (exit 1 if anything is left to strip, so CI can
   hold the line once a sweep has run); otherwise it writes.
   ============================================================================ */

"use strict";

const { loadCards, writeCards } = require("./card-io.js");
const { loadGlossary, writeGlossary, MAIN: GLOSS_MAIN } = require("./gloss-io.js");
const fs = require("fs");
const { loadArtefacts, writeArtefacts } = require("./artefact-io.js");

const CHECK = process.argv.includes("--check");
const VERBOSE = process.argv.includes("--verbose");

const norm = (x) => String(x || "").replace(/\s+/g, " ").trim();

/* app.js's picCaption, exactly. The credit is cut at its URL or at a dash, because a credit reads
   "Thomas Clouet, CC BY 4.0, via Wikimedia Commons. https://…" and the address is never in the caption. */
function stripped(it) {
  const d = norm(it && it.desc);
  const cred = norm(String((it && it.credit) || "").split(/\s[—–-]\s|https?:\/\//)[0]).replace(/[.\s]+$/, "");
  if (!d || !cred) return null;
  const dt = d.replace(/[.\s]+$/, "");
  if (!dt.endsWith(cred)) return null;
  const out = norm(dt.slice(0, dt.length - cred.length)).replace(/[.,;:\s]+$/, "");
  /* A caption that is NOTHING BUT its own credit would be emptied, and an empty caption is a worse
     outcome than a duplicated one: the viewer draws the slot and the reader is told nothing at all.
     Measured over the whole corpus this never happens, and it is refused rather than trusted. */
  return out ? out : null;
}

const hits = [];
function sweep(kind, key, it) {
  const s = stripped(it);
  if (s === null) return;
  hits.push({ kind: kind, key: key, from: it.desc, to: s, it: it });
}

const { cards, tree } = loadCards();
cards.forEach((c) => { if (c.image) sweep("card", c.id, c.image); });

const G = loadGlossary();
const GI = G.GLOSSARY_IMAGES || {};
Object.keys(GI).forEach((k) => { if (GI[k]) sweep("gloss", k, GI[k]); });

const arts = loadArtefacts() || [];
arts.forEach((a) => { if (a.image) sweep("artefact", a.id, a.image); });

const by = (k) => hits.filter((h) => h.kind === k).length;
console.log("Captions ending in their own credit: " + hits.length +
  "  (" + by("card") + " cards, " + by("gloss") + " glossary terms, " + by("artefact") + " artefacts)");

if (VERBOSE) hits.forEach((h) => {
  console.log("\n  " + h.kind + " " + h.key);
  console.log("    was: " + h.from);
  console.log("    now: " + h.to);
});

if (CHECK) {
  if (hits.length) {
    console.log("\n--check: " + hits.length + " still carry it. Run without --check to strip them.");
    process.exit(1);
  }
  console.log("--check: none left.");
  process.exit(0);
}

if (!hits.length) { console.log("Nothing to do."); process.exit(0); }

hits.forEach((h) => { h.it.desc = h.to; });
writeCards(cards, tree);
/* writeGlossary takes the caller's serialised glossary.js, because most of its callers have just
   rewritten it. Nothing here touches that half — an image lives in glossary-extra.js — so the file
   is handed straight back, which the door then round-trips byte for byte (verified). Going through
   it rather than writing the extra file directly is what keeps every writer on one path. */
writeGlossary(G, fs.readFileSync(GLOSS_MAIN, "utf8"));
writeArtefacts(arts);
console.log("\nWritten. " + hits.length + " captions no longer repeat the credit beside them.");
