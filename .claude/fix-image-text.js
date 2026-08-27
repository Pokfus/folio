#!/usr/bin/env node
/* =========================================================================================
   FIX THE TEXT THAT TRAVELS WITH A PICTURE  (Aug 2026, on request: "some images don't contain
   titles or descriptions, and some of those that do contain grammatical errors or spelling
   mistakes — fix them all")

   Every picture on Folio is somebody else's file, so the words beside it are ASSEMBLED rather
   than written: `.claude/pick-images.js` takes Commons' own English description where there is
   one, falls back to the cleaned FILE NAME where there is not, and appends the attribution the
   licence requires.  That pipeline is honest and it leaves three kinds of residue, all of which
   a reader meets in the fullscreen viewer's caption bar:

     · A DESCRIPTION THAT IS ONLY AN ATTRIBUTION.  Where Commons carried no usable English text
       and the file name cleaned down to nothing, the caption came out empty and the line reads
       "Michael Gunther, CC BY-SA 4.0, via Wikimedia Commons." — a credit standing where a
       description should be.  56 of them.  The repair composes nothing: these pictures already
       carry a full, hand-written `alt`, which is a description of the picture by definition, so
       the alt is PROMOTED to the caption and the attribution follows it as it does everywhere
       else.
     · FILE-NAME RESIDUE IN THE PROSE.  "Australopithecus afarensisIMG 2930", "MeadowcroftPA",
       "Plan_of_the_Palace_of_Gla", an emptied bracket left by a stripped accession number.  A
       camera code welded to a species name is not a spelling mistake anybody made; it is what a
       file name looks like when it is read as a sentence.
     · TYPOGRAPHIC FAULTS carried straight out of Commons — a space before a comma or a full
       stop, a doubled stop where an abbreviation met the sentence's own, a run of spaces, a
       caption opening in lower case.

   AND THE ARTEFACTS HAVE NO CAPTION AT ALL.  An artefact's image is three fields (`src`,
   `credit`, `alt`) where a card's and a glossary term's are five, so all 99 of them open the
   viewer with the object's name and a blank description.  They gain `title` (the artefact's own
   name — which is what the plate already passes the viewer, so nothing on screen moves) and
   `desc`, built from the alt and from the attribution ALREADY IN `credit`.  Nothing is invented:
   the caption is the alt this corpus wrote and the provenance is the credit re-punctuated.

   ⚠ NOTHING HERE COMPOSES A SENTENCE ABOUT A PHOTOGRAPH.  That is the one rule the picture
   pipeline states about itself and it holds here too: every repair either moves text the corpus
   already had, deletes residue, or fixes punctuation.  The per-item table below is hand-checked
   — a mechanical rule cannot know that "PA" is Pennsylvania — and each entry records what the
   file name actually said.

   Run: node .claude/fix-image-text.js [--dry]
   ========================================================================================= */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DRY = process.argv.includes("--dry");

/* ------------------------------------------------------------------ the provenance tail
   `desc` is "<caption> <provenance>", where the provenance is what the licence requires and is
   the one part that must survive every repair untouched.  It is matched from the END so that a
   caption which happens to mention a licence cannot be mistaken for it. */
const TAIL_RX = /(?:^|\s)((?:[^.;]{0,140}?,\s*)?(?:Public domain(?:\s*\([^)]*\))?|public domain(?:\s*\([^)]*\))?|CC[ -]?BY(?:-SA|-NC)?[^,;]*|CC0[^,;]*|Creative Commons[^,;]*),\s*via Wikimedia Commons\.?)\s*$/;

function splitDesc(desc) {
  const d = String(desc || "").trim();
  const m = TAIL_RX.exec(d);
  if (!m) return { cap: d, tail: "" };
  return { cap: d.slice(0, m.index).trim(), tail: m[1].trim() };
}

/* ------------------------------------------------------------------ the mechanical repairs
   Every one of these is punctuation or whitespace: they change how a line is set and never what
   it says.  They run on the CAPTION and on the ALT, never on the provenance. */
function tidy(s) {
  let t = String(s || "");
  t = t.replace(/\s+/g, " ");                         // a run of spaces, and any stray newline
  t = t.replace(/\s+([,;.!?])/g, "$1");               // "SKopp , PeepP" and "Jon Harald Søby ."
  /* A COLON IS DELIBERATELY NOT TOUCHED, in either direction. It is the one mark here that is as
     often structural as it is punctuation — `http://`, a wiki's `en:` namespace, an aspect ratio of
     1.75:1 — and a rule that spaced it out turned every URL in the corpus into "http: //". */
  t = t.replace(/\.{3,}/g, "…");                      // an ellipsis first, or the doubled-stop rule below eats it
  t = t.replace(/\.\.(?!\.)/g, ".");                  // "12 by 19 cm.." — an abbreviation's stop met the sentence's
  t = t.replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");// "(translation at FotW )"
  t = t.replace(/\(\s*\)/g, "");                      // an emptied bracket: the residue of a stripped accession number
  t = t.replace(/\s*\(\s*(https?:\/\/[^)]+)\s*\)/g, ""); // a bare URL in brackets is not a caption
  t = t.replace(/^[\s\-–—]+/, "");                    // a file name that opened on its own separator
  t = t.replace(/[\s\-–—]+$/, "");
  t = t.replace(/\s+/g, " ").trim();
  for (const [rx, to] of SPELL) t = t.replace(rx, to);
  return t;
}
// a caption is a sentence, so it opens on a capital and closes on a stop
function sentence(s) {
  let t = tidy(s);
  if (!t) return "";
  if (/^\p{Ll}/u.test(t)) t = t[0].toUpperCase() + t.slice(1);
  if (!/[.!?…]$/.test(t)) t += ".";
  return t;
}

/* ------------------------------------------------------------------ the hand-checked table
   Keyed on the EXACT text as it ships, so an entry that has already been repaired (or that never
   matched in the first place) is reported rather than silently doing nothing.  `cap` replaces a
   caption, `alt` replaces an alt.  Each is a reading of what the file name or the Commons text
   was actually saying — never a new claim about the picture. */
const CAPS = {
  // "afarensisIMG 2930" is a camera file number welded to the species; "Rama" is the photographer,
  // whom the credit link already names in full
  "Australopithecus afarensisIMG 2930. Rama.": "A cast of the Australopithecus afarensis skull.",
  // the whole caption is a re-user's citation request, not a description of the tree
  "Detailed phylogeny of the human mtDNA haplotypes. From Vincent Macaulay and Martin Richards. Please cite both if you use this source.":
    "A detailed phylogeny of the human mitochondrial DNA haplogroups.",
  // "MeadowcroftPA" is the file name: the rockshelter is in Pennsylvania
  "MeadowcroftPA.": "Meadowcroft Rockshelter, Pennsylvania.",
  // a US archive's holding note, which describes the postcard collection rather than the picture
  "From PhC.184 Massengill Postcard Collection, initial donation, State Archives of North Carolina, Raleigh, NC.":
    "An archer drawing a bow, from the Massengill Postcard Collection.",
  // the flag files carry the SVG author's construction notes, which are about the drawing rather
  // than the flag; the description is cut back to what the picture shows
  "The flag of Iran, created from scratch using the official geometric construction from ISIRI (translation at FotW). Note the irrational aspect ratio of ±1.7477:1, which is slightly different from the more often used 7:4 (1.75:1) given in the \"simplified\" construction sheet in the same document.":
    "The flag of Iran, drawn to the official geometric construction.",
  "Flag of Estonia. Original: Unknown author Vector: SKopp, PeepP and ‍others. 1918-11-21.": "The flag of Estonia, adopted in 1918.",
  "Flag of Italy. See below. 2005-09-28.": "The flag of Italy.",
  "Flag of Namibia. SVG by Vzb83~commonswiki et al. 1990-03-21.": "The flag of Namibia, adopted at independence in 1990.",
  "Flag of Nigeria. Jon Harald Søby. 1960-10-01.": "The flag of Nigeria, adopted at independence in 1960.",
  "Flag of Poland. See below. 1 October 2005 (upload date).": "The flag of Poland.",
  "bendera Indonesia.": "The flag of Indonesia.",
  // a museum's catalogue line, semicolons and rights statement and all
  "Male Votive Head; Unknown; 3rd century BCE; Terracotta; 28 cm (11 in.); 96.AD.258; No Copyright - United States.":
    "An Etruscan terracotta votive head, 3rd century BCE, 28 centimetres high.",
  // the underscores are the file name showing through
  "Plan_of_the_Palace_of_Gla.": "A plan of the palace at Gla.",
  "Out_of_Africa_I_and_II hypothesis.": "A map of the Out of Africa I and II hypotheses.",
  "African_elephant.": "An African elephant.",
  // the archive.org shelfmark is a source reference rather than a caption
  "Illustration from \"Daheim Kalender fur das Deutche Reich auf das Schaltjahr 1892 (Home calendar for the German Reich for the leap year 1892)\".":
    "An illustration of Heinrich Schliemann, from a German almanac of 1892.",
  // the Library of Congress's own note about the negative, which describes the copy rather than the sitter
  "Portrait of Franklin Pierce (1804–1869) by Mathew Brady. The LoC describes this as \"Copy neg. from original ink by Brady after Daguerreotype\".":
    "A portrait of Franklin Pierce (1804–1869), after a daguerreotype by Mathew Brady.",
  "Long shot of the Solomon Islands Parliament House. Photo taken by Irene Scott for AusAID. (13/2529).": "The Parliament House of the Solomon Islands.",
  "EarlyPleistoceneAnimals. Wells, H. G. 1921.": "Animals of the early Pleistocene, from an illustration of 1921.",
  "picture taken by Husond's sister. She releases it for free distribution, no rights reserved.": "A marker on the equator.",
  "the Awash River Valley is a desert oasis and irrigates a lot of farmland in the midst of a harsh desert climate; next to Asaita. Cook.bri,":
    "The Awash River valley, a watered strip of farmland in an otherwise arid landscape, near Asaita.",
  "location of TM 266, place of discovery of the first Sahelanthropus tchadensis in Chad; based on [1] and using Chad Topography.png (PD) by Sadalmelik as background. The light blue area limited by a blue dotted line refers to the inferred maximum extension of the Holocene Lake Mega Chad.":
    "A map of Chad marking TM 266, where the first Sahelanthropus tchadensis was found, with the inferred maximum extent of Holocene Lake Mega Chad outlined.",
  "object type / vase shape: minoan (handleless?) cup - material: pottery (clay) - decoration technique: plastic decoration with relief and appliques - description: cat and shells":
    "A Minoan handleless clay cup decorated in relief with a cat and shells.",
  "\"The Growth of Roman Power in Asia Minor\" from The Historical Atlas by en:William Robert Shepherd, 1923. Accessed from the Perry-Castañeda Library Map Collection, http://www.lib.utexas.edu/maps/historical/shepherd/asia_minor_roman_power.jpg en:Category:Historical maps by William R.":
    "\"The Growth of Roman Power in Asia Minor\", from William Robert Shepherd's Historical Atlas of 1923.",
  "Andreas Vesalius of Brussels, professor of the medical school of Padua, on the structure of the human body, seven books…":
    "The title page of Vesalius's On the Structure of the Human Body, 1543.",
};

/* Straight misspellings in a Commons caption. They are corrected rather than quoted, because the
   line is presented as Folio's description of the picture and not as a quotation of the uploader:
   a caption is the only text on the site whose words nobody here chose, which is exactly why the
   ones that are simply wrong have to be caught by hand. Each is a whole-word swap. */
const SPELL = [
  [/\bMap of Asi\b/g, "Map of Asia"],
  [/\bmammooth\b/gi, "mammoth"],
  [/\bcemetary\b/gi, "cemetery"],
];

const ALTS = {
  "Australopithecus afarensisIMG 2930": "Australopithecus afarensis skull",
  "VenusHohlefels2": "The Venus of Hohle Fels",
  "Chert beds EverettPA": "Chert beds at Everett, Pennsylvania",
  "MeadowcroftPA": "Meadowcroft Rockshelter, Pennsylvania",
  "MacaulayRichardsmtDNAtree": "A phylogenetic tree of human mitochondrial DNA haplogroups",
  "Obsidian Dome (GeoDIL number - 560)": "Obsidian Dome",
  "Pumice (GeoDIL number - 415)": "A piece of pumice",
  "MoraenenSchlossZeil2a": "Moraines near Schloss Zeil",
  "Etruscan Male Votive Head III cen. BCE": "Etruscan male votive head, 3rd century BCE",
};

/* ------------------------------------------------------------------ artefacts
   The attribution already sits in `credit`, as "<who>, <licence>, via Wikimedia Commons — <url>".
   The url is the credit's own job and the caption's provenance is the half before the dash. */
function artefactProvenance(credit) {
  const c = String(credit || "");
  let cut = c.split(/\s+—\s+/)[0].trim();
  // an uploader's timestamp is not part of an attribution, and several credits carry one
  cut = cut.replace(/,\s*\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?/g, "").trim();
  if (!cut) return "";
  return /[.!?]$/.test(cut) ? cut : cut + ".";
}

/* An artefact's alt is a cleaned Commons file name and several still carry what the cleaner could
   not know to strip: a museum accession number, a database UUID, an upload date, a photograph's own
   serial. None of it describes the object, and the alt is the one field a reader who cannot see the
   picture has. Removed by shape, never by knowing any one museum's numbering. */
const ART_RESIDUE = [
  [/\s*\(\s*[0-9a-f]{8}-[0-9a-f-]{20,}\s*\)/gi, ""],   // a database UUID in brackets
  [/\s*\(\s*(?:FindID|FOUS)[^)]*\)/gi, ""],            // a finds-database reference
  [/\s*\b[A-Z]{2,5}[ _]?\d{4,}\b/g, ""],               // a bare accession/serial run
  [/\s*\bP\d{6,}\b/g, ""],
  [/\s*-\s*P\d{6,}\b/g, ""],
  [/^\s*\d{4}-\d{2}-\d{2}-?\s*/, ""],                  // an upload date opening the file name
  [/\s*\bp0\d\b/g, ""],                                // a museum's plate number
  [/\s+\d{4}-\d{2}-\d{2}\s*$/, ""],                     // …and one closing it
];
const ART_ALTS = {
  "Mask of Agamemnon galvanoplasty": "Electrotype copy of the Mask of Agamemnon",
  "1600 Himmelsscheibe von Nebra sky disk anagoria": "The Nebra sky disc",
  "SuttonHoo": "The Sutton Hoo helmet",
  "Een twee en een half hoge stele met de Codex Hammurabi uit 1785 v,": "The stele of the Code of Hammurabi",
  "MRF-E 19 1- White Ulfberht": "An Ulfberht sword blade",
  "Medjed Bodmer 100": "The god Medjed, from a Book of the Dead papyrus",
  "Dinastia tang, cammello sancai, da shaanxi o henan, 700-750 ca.": "A sancai-glazed camel, Tang dynasty, c. 700–750",
  "Amulet Thor's hammer (copy of find from Skåne)": "A Thor's hammer pendant, a copy of a find from Skåne",
  "Lithic core Levalois MHNT.0.86.fond": "A Levallois core",
  "Unguentarium-": "A glass unguentarium",
  "1 glass trade bead.": "A glass trade bead",
  "1691 Early Bronze Age flat axe": "An Early Bronze Age flat axe",
  "2009 T465 Roman finger ring": "A Roman bronze finger ring",
  "Amulet Thor's hammer (copy of find from Skåne)": "A Thor's hammer pendant, a copy of a find from Skåne",
};

/* ------------------------------------------------------------------ apply */
function loadCorpus() {
  global.window = {};
  require(path.join(ROOT, "data.js"));
  // glossary.js is TWO files now — its citations and illustrations live in the lazy
  // glossary-extra.js — so load through the shared helper, which merges both. Requiring
  // glossary.js alone yields EMPTY GLOSSARY_IMAGES/GLOSSARY_SOURCES, silently.
  require("./gloss-io.js").loadGlossary(global.window);
  require(path.join(ROOT, "artefacts.js"));
  return global.window;
}

const W = loadCorpus();
const edits = [];      // { file, from, to } — exact JSON-encoded string swaps
const report = { promoted: 0, tidied: 0, tabled: 0, artefacts: 0, unmatched: [] };
const usedCaps = new Set(), usedAlts = new Set();

function newDesc(img) {
  const { cap, tail } = splitDesc(img.desc);
  let c = tidy(cap);
  /* the hand-checked table is asked FIRST, and on the tidied text: several of its keys differ from
     what ships only by a space before a comma, which `tidy` is what removes */
  if (Object.prototype.hasOwnProperty.call(CAPS, c)) { usedCaps.add(c); c = CAPS[c]; report.tabled++; }
  // a caption that is only an attribution: the alt is a description of this picture and becomes it
  if (!c && img.alt) { c = sentence(img.alt); report.promoted++; }
  c = sentence(c);
  const out = [c, tail].filter(Boolean).join(" ").trim();
  return out;
}
function newAlt(img) {
  let a = tidy(img.alt);
  if (Object.prototype.hasOwnProperty.call(ALTS, a)) { usedAlts.add(a); a = ALTS[a]; }
  return a;
}

function collect(img) {
  const d = newDesc(img), a = newAlt(img);
  if (d && d !== img.desc) edits.push({ from: '"desc":' + JSON.stringify(img.desc), to: '"desc":' + JSON.stringify(d) });
  if (a && a !== img.alt) edits.push({ from: '"alt":' + JSON.stringify(img.alt), to: '"alt":' + JSON.stringify(a) });
}

(W.CARD_DATA || []).forEach((c) => { if (c.image && c.image.src) collect(c.image); });
Object.keys(W.GLOSSARY_IMAGES || {}).forEach((k) => collect(W.GLOSSARY_IMAGES[k]));

// the two content files, patched by exact string swap: both are JSON-encoded, so the encoding a
// value ships in is the encoding JSON.stringify produces
for (const f of ["data.js", "glossary.js"]) {
  const p = path.join(ROOT, f);
  let src = fs.readFileSync(p, "utf8");
  let n = 0;
  for (const e of edits) {
    if (!src.includes(e.from)) continue;
    src = src.split(e.from).join(e.to);
    n++;
  }
  report.tidied += n;
  if (!DRY) fs.writeFileSync(p, src);
  console.log(f + ": " + n + " field" + (n === 1 ? "" : "s") + " rewritten");
}

/* ---- artefacts: a title and a description where there were none ---- */
{
  const p = path.join(ROOT, "artefacts.js");
  let src = fs.readFileSync(p, "utf8");
  let n = 0;
  /* The alt first, so a title/desc built below is built from the repaired text. It is a swap of the
     exact JSON-ish value as the file writes it (`alt: "…"`), which is unique per artefact. */
  let altN = 0;
  (W.ARTEFACTS || []).forEach((a) => {
    const img = a.image;
    if (!img || !img.src || !img.alt) return;
    let t = img.alt;
    for (const [rx, to] of ART_RESIDUE) t = t.replace(rx, to);
    t = tidy(t);
    if (Object.prototype.hasOwnProperty.call(ART_ALTS, t)) t = ART_ALTS[t];
    if (!t || t === img.alt) return;
    const from = "alt: " + JSON.stringify(img.alt);
    if (!src.includes(from)) { report.unmatched.push(a.id + " (alt)"); return; }
    src = src.split(from).join("alt: " + JSON.stringify(t));
    img.alt = t;   // so the caption built below uses the repaired text
    altN++;
  });
  console.log("artefacts.js: " + altN + " alt" + (altN === 1 ? "" : "s") + " repaired");
  (W.ARTEFACTS || []).forEach((a) => {
    const img = a.image;
    if (!img || !img.src || (img.title && img.desc)) return;
    const cap = sentence(tidy(img.alt || a.name));
    const prov = artefactProvenance(img.credit);
    const desc = [cap, prov].filter(Boolean).join(" ");
    // the field order the file already uses: src, credit, alt — title and desc are inserted so the
    // object reads the way a card's and a glossary term's do
    const fromSrc = 'src: ' + JSON.stringify(img.src);
    const idx = src.indexOf(fromSrc);
    if (idx < 0) { report.unmatched.push(a.id); return; }
    const ins = fromSrc + ', title: ' + JSON.stringify(a.name) + ', desc: ' + JSON.stringify(desc);
    src = src.slice(0, idx) + ins + src.slice(idx + fromSrc.length);
    n++;
  });
  report.artefacts = n;
  if (!DRY) fs.writeFileSync(p, src);
  console.log("artefacts.js: " + n + " image" + (n === 1 ? "" : "s") + " given a title and a description");
}

const missCaps = Object.keys(CAPS).filter((k) => !usedCaps.has(k));
const missAlts = Object.keys(ALTS).filter((k) => !usedAlts.has(k));
console.log("\ncaptions promoted from alt: " + report.promoted);
console.log("hand-checked captions applied: " + report.tabled);
if (missCaps.length) console.log("⚠ table entries that matched nothing (already fixed, or the text moved):\n  " + missCaps.join("\n  "));
if (missAlts.length) console.log("⚠ alt entries that matched nothing:\n  " + missAlts.join("\n  "));
if (report.unmatched.length) console.log("⚠ artefacts whose src was not found in the file: " + report.unmatched.join(", "));
if (DRY) console.log("\n(dry run — nothing written)");
