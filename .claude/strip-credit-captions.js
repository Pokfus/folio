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

   ============================================================================
   WHAT IS LEFT AFTER THIS SWEEP IS A JUDGEMENT, NOT A GAP (Sep 2026). The two
   rules below take `check-cards.js`'s source-in-caption report from 336 to 21,
   and the 21 were read one by one. Not one is a duplicate this tool is failing to
   see; each needs a person to decide what the caption should say, in two shapes:

     · THE CREDIT NAMES THE AUTHOR DIFFERENTLY, so neither rule can call the two
       the same words. A caption saying "Louis de Clercq" over a credit reading
       "Clercq, M. de (Louis), 1836-1901"; "Xiao Yuncong" over "Xiao Yuncong
       (蕭雲從), 1596-1673"; "Pietro Datri" over "Pietro Datri (editor)". And the
       harder ones, where the two name DIFFERENT PEOPLE — `wh-198`'s caption
       credits Jastrow for the photograph while Commons files the object under
       "Unknown artist", and `wh-187`'s credit names Ur-Nammu, who is the king the
       tablet is about rather than anybody who photographed it.
     · THE CAPTION CARRIES MORE THAN THE CREDIT — a date the credit has not got
       ("Photograph by Bairuilong, 2014"), a holding museum, or a source sentence
       somebody wrote on purpose ("Public domain, from Thomas Hunt Morgan, The
       Theory of the Gene, 1926"). Cutting to the credit would lose information
       that is about the picture.

   Both want an editor, and a tool that guessed at either would be inventing an
   attribution. DO NOT WIDEN THE RULES TO REACH THEM.
   ============================================================================

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

/* ============================================================================
   THE COMPARISON: WHAT MAY BE FOLDED, AND WHERE A CUT MAY BEGIN

   The credit is cut at its URL or at a dash, because a credit reads "Thomas
   Clouet, CC BY 4.0, via Wikimedia Commons. https://…" and the address is never
   in the caption. What remains — the author AND the licence — must appear at the
   END of the caption, and only that tail is removed.

   IT BEGAN AS A BYTE-FOR-BYTE MATCH, AND BYTE-FOR-BYTE MISSED THE COMMONEST SHAPE
   THERE IS (Sep 2026). Commons writes its licence tag in one case inside the file
   description and another in the licence field, so a caption ending "Reinhard
   Dietrich, public domain, via Wikimedia Commons." sat unmatched beneath a credit
   reading "Reinhard Dietrich, Public domain, via Wikimedia Commons." — the same
   sentence, and a capital P between them. The same for "CC BY-SA 3.0 FR" against
   "CC BY-SA 3.0 fr", and for an author Commons punctuates two ways ("NASA/JPL"
   against "NASA: JPL").

   So three things are folded, and nothing else is:
     · CASE AND PUNCTUATION, by reducing both sides to their letters and digits.
       The fold is UNICODE-AWARE and must stay so — under an ASCII `[^a-z0-9]` an
       author written in Cyrillic folds away to nothing, and a credit reading
       "Лапоть, CC0, via Wikimedia Commons" then compares equal to a caption
       clause naming no author at all.
     · COMMONS' LICENCE UMBRELLA. "Public domain (CC0)" is the umbrella plus the
       specific tag and means exactly "CC0"; the wrapper is dropped rather than
       the tag, the tag being the more precise of the two and what the credit
       carries.
     · A LEADING "Photograph by". A caption routinely introduces the author that
       way where the credit names them bare; the words are a label on the
       attribution rather than part of the prose. Four spellings, declared.

   AND A CUT MAY ONLY BEGIN WHERE A CLAUSE DOES. This is the guard that makes the
   fold safe, and it was added after the fold alone produced seven bad cuts on its
   first run: a caption reading "…in a plate published by Auguste Mariette. Public
   domain, via Wikimedia Commons." fold-matches a credit of "Auguste Mariette,
   public domain, via Wikimedia Commons" — and cutting there leaves "…in a plate
   published by". The author's name is doing real work in that sentence. So the
   cut point must sit at a SENTENCE boundary (or the caption's start), which is
   where an appended attribution begins and where a name inside the prose does not.
   ============================================================================ */
const BY_LABEL = /^(?:photograph|photo|image|picture)\s+by\s+/i;

/* Letters and digits of any script. `\p{L}` is what keeps a Cyrillic or Greek author's name in the
   comparison instead of silently deleting it. */
const fold = (x) => norm(x).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

/* One attribution clause, reduced to the form both sides agree on. */
const attrNorm = (x) =>
  fold(norm(x).replace(BY_LABEL, "").replace(/public domain\s*\(([^)]+)\)/gi, "$1"));

/* The credit up to its address. THE DASH IS ONLY A SEPARATOR WHEN A URL FOLLOWS IT, and that
   proviso is load-bearing: app.js's picCaption cuts at any spaced dash, and a credit reading
   "Otto Karl Friedrich Schoetensack (1850 – 1912), Public domain, via Wikimedia Commons" is then
   cut to "Otto Karl Friedrich Schoetensack (1850" — an author's dates are not a separator. A
   TRAILING COMMA comes off with the full stops, several credits writing the address after one. */
function creditText(it) {
  return norm(String((it && it.credit) || "")
    .split(/\s[—–-]\s(?=https?:\/\/)|https?:\/\//)[0]).replace(/[.,\s]+$/, "");
}

/* Every index in `dt` at which a clause begins: the start, or just after a sentence's terminator.
   Descending, so the EARLIEST boundary — the longest tail — is offered first. */
function clauseStarts(dt) {
  const at = [0];
  for (let i = 1; i < dt.length; i++) {
    if (/[.;:!?]/.test(dt[i - 1]) && /\s/.test(dt[i])) {
      let j = i;
      while (j < dt.length && /\s/.test(dt[j])) j++;
      if (j < dt.length) at.push(j);
    }
  }
  return at;
}

/* A CAPTION MAY NOT BE CUT MID-SENTENCE, AND A DANGLING FUNCTION WORD IS HOW THAT SHOWS. One shipped
   caption is exactly that case — Commons' own text reads "Jastrow, released into the public domain,
   via Wikimedia Commons" with a stray full stop after "the", so a licence phrase begins mid-clause and
   cutting it leaves "…Jastrow, released into the". The list is DECLARED and short: no real caption ends
   on one of these words, so refusing them costs nothing and catches the whole shape. */
const DANGLING = /\b(?:the|an?|of|in|on|at|to|by|for|from|with|into|and|or|as|its|their)$/i;
/* `her` and `his` were in that list and came out again: they are POSSESSIVE and OBJECT pronouns both,
   so "…with the Renaissance twins beneath her" is a finished sentence and was refused as a fragment.
   A false refusal only leaves a duplicated credit, which is harmless — but it leaves one that should
   have gone, so the list holds only words that genuinely cannot end an English sentence. */

/* A FULL STOP IS NOT ALWAYS A SENTENCE'S. Cutting a licence clause off "…Drawn after Huang Kejia
   et al.; CC BY-SA 4.0." leaves a semicolon to trim and then an abbreviation's own period behind it,
   and stripping that writes "et al" into a shipped caption. Declared, and short: these are the
   abbreviations a picture caption actually uses. */
const ABBREV = /\b(?:et al|etc|ed|eds|vol|vols|no|nos|pl|p|pp|cf|ca|c|fig|figs|trans|St|Mt)$/i;

function tidy(head) {
  let out = norm(head).replace(/[,;:\s]+$/, "");
  const dots = out.match(/\.+$/);
  if (dots) {
    const stem = out.slice(0, out.length - dots[0].length);
    out = ABBREV.test(stem) ? stem + "." : stem;
  }
  out = out.replace(/[,;:\s]+$/, "");
  /* A caption that is NOTHING BUT its own credit would be emptied, and an empty caption is a worse
     outcome than a duplicated one: the viewer draws the slot and the reader is told nothing at all. */
  if (!out) return null;
  if (DANGLING.test(out)) return null;
  return out;
}

/* RULE 1 — the caption ends in the WHOLE credit, author and licence together. */
function stripped(it) {
  const d = norm(it && it.desc);
  const cred = creditText(it);
  if (!d || !cred) return null;
  const dt = d.replace(/[.\s]+$/, "");
  const want = attrNorm(cred);
  if (!want) return null;
  const starts = clauseStarts(dt);
  for (const i of starts) {
    if (i === 0) continue;                       // would empty the caption; tidy() refuses it anyway
    if (attrNorm(dt.slice(i)) === want) return tidy(dt.slice(0, i));
  }
  return null;
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
   carried the author, so a tail comparison against the WHOLE credit fails. 192
   cards sat in exactly that state after the credit pass.

   SO THIS COMPARES THE CAPTION AGAINST THE CREDIT'S LICENCE HALF — the credit
   with its leading author removed — and cuts only a match of that. Its guard is
   the condition, stated rather than assumed:

     · the credit must NAME AN AUTHOR as well as the licence. Where it does not,
       the licence clause IS the whole attribution and rule 1's refusal stands.
     · the licence half must be a real licence phrase, not any tail that happens
       to follow a comma.

   What the reader loses is nothing: every word cut is still on the card, in the
   credit line directly beneath the caption.
   ============================================================================ */
/* "No restrictions" is Commons' own tag for a file a holding institution has released outright; it is
   a licence statement like the rest and a caption writes it as "Public domain (No restrictions)". */
const LICENCE_HALF = /^(?:public domain|no restrictions|CC0(?:\s+1\.0)?|CC[ -]?BY(?:[ -]SA)?(?:\s+[\d.]+)?|GFDL|FAL|Attribution)\b[^,]*(?:,\s*via Wikimedia Commons)?\.?$/i;

function strippedLicenceHalf(it) {
  const d = norm(it && it.desc);
  const credFull = creditText(it);
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
  const want = attrNorm(lic);
  if (!want) return null;

  /* Same clause-boundary rule as rule 1, for the same reason. */
  for (const i of clauseStarts(dt)) {
    if (i === 0) continue;
    if (attrNorm(dt.slice(i)) === want) return tidy(dt.slice(0, i));
  }
  return null;
}

const hits = [];
function sweep(kind, key, it) {
  const r1 = stripped(it);
  const s = r1 ?? strippedLicenceHalf(it);
  if (s === null || s === undefined) return;
  hits.push({ kind: kind, key: key, from: it.desc, to: s, it: it, rule: r1 == null ? 2 : 1 });
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
  console.log("\n  [rule " + h.rule + "] " + h.kind + " " + h.key);
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
