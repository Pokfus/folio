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

/* ============================================================================
   RULE 2 — THE LICENCE HALF, AND THE CONDITION THAT MAKES IT SAFE (Sep 2026)

   The header above refuses to widen this sweep, and it was right to: a caption
   ending "…, CC BY-SA 4.0, via Wikimedia Commons." over a credit that is a BARE
   COMMONS URL is a picture whose only attribution is that clause, and cutting it
   would be a licence breach rather than a tidy-up.

   `fix-image-credits.js` removes that condition. It reads Commons' own `Artist`
   and `LicenseShortName` and writes them into the credit, so the picture is
   attributed where an attribution belongs — and the caption's trailing clause
   becomes what the header always wanted to cut: a duplicate.

   RULE 1 STILL DOES NOT MATCH THOSE, and the reason is the whole point of this
   rule. The credit now reads "Rama, Public domain, via Wikimedia Commons." while
   the caption ends "Public domain, via Wikimedia Commons." — the caption never
   carried the author, so an exact tail comparison against the WHOLE credit
   fails. 192 cards sat in exactly that state after the credit pass.

   SO THIS COMPARES THE CAPTION AGAINST THE CREDIT'S LICENCE HALF — the credit
   with its leading author removed — and cuts only an exact match of that. Its
   guard is the condition, stated rather than assumed:

     · the credit must NAME AN AUTHOR as well as the licence. Where it does not,
       the licence clause IS the whole attribution and rule 1's refusal stands.
     · the licence half must be a real licence phrase, not any tail that happens
       to follow a comma.

   What the reader loses is nothing: every word cut is still on the card, in the
   credit line directly beneath the caption.
   ============================================================================ */
const LICENCE_HALF = /^(?:public domain|CC0(?:\s+1\.0)?|CC[ -]?BY(?:[ -]SA)?(?:\s+[\d.]+)?|GFDL|FAL|Attribution)\b[^,]*(?:,\s*via Wikimedia Commons)?\.?$/i;

function strippedLicenceHalf(it) {
  const d = norm(it && it.desc);
  const credFull = norm(String((it && it.credit) || "").split(/\s[—–-]\s|https?:\/\//)[0]).replace(/[.\s]+$/, "");
  if (!d || !credFull) return null;

  /* Split the credit at the LAST comma that leaves a licence phrase behind it. An author field may
     itself contain commas ("José-Manuel Benito Álvarez (España) —> Locutus Borg"), so the split is
     found from the right and validated, never taken at the first comma. */
  let author = "", lic = "";
  for (let i = credFull.length - 1; i >= 0; i--) {
    if (credFull[i] !== ",") continue;
    const tail = norm(credFull.slice(i + 1));
    if (LICENCE_HALF.test(tail)) { author = norm(credFull.slice(0, i)); lic = tail; break; }
  }
  if (!author || !lic) return null;          // no author named -> the clause is the attribution; refuse

  const dt = d.replace(/[.\s]+$/, "");
  const licT = lic.replace(/[.\s]+$/, "");
  if (!dt.endsWith(licT)) return null;
  const out = norm(dt.slice(0, dt.length - licT.length)).replace(/[.,;:\s]+$/, "");
  return out ? out : null;                    // never empty a caption, for rule 1's reason
}

const hits = [];
function sweep(kind, key, it) {
  const s = stripped(it) ?? strippedLicenceHalf(it);
  if (s === null || s === undefined) return;
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
