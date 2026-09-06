#!/usr/bin/env node
"use strict";
/*
  add-images.js — write a reviewed batch of pictures into glossary.js (window.GLOSSARY_IMAGES),
  data.js (card.image) and artefacts.js (artefact.image).  Standalone Node helper, zero deps.  Not
  part of the site.

    node .claude/add-images.js <batch.json> [--dry] [--replace]

  <batch.json> is { "glossary":  { "<slug>":   {src,title,desc,credit,alt} },
                    "cards":     { "<cardId>": {src,title,desc,credit,alt} },
                    "artefacts": { "<id>":     {src,credit,alt} } }
  — the shape `.claude/pick-images.js --build` writes.  An artefact's image is THREE fields, which
  is what `serializeArtefacts` in app.js writes and what the reliquary reads: the entry already has
  its own name, date, origin and five-sentence description, so a title and a caption would say it
  twice, and `credit` is therefore the only place the attribution can go.

  WHAT IT REFUSES, and why each rule is here rather than left to the reader's eye:
   · a `src` that is not https — the CSP allows `img-src https:` and nothing else off-origin, so
     an http link is a picture that will never load;
   · a missing `credit` — a picture on Folio is always somebody else's file, so the source line
     is not optional; `add-card.js` and the editors' media gate enforce the same rule, and this
     is the third door into the same store;
   · a missing `title` or `alt` — the frame names the picture and a reader who cannot see it gets
     the alt, and an image with neither is worse than no image;
   · a card that already carries a video — ONE FRAME PER CARD is the store's rule (see
     `retireOtherCardMedia` in app.js), and a batch must not be the thing that breaks it;
   · a DIFFERENT picture over one a card, term or artefact already carries — that is a
     replacement rather than an addition, and `--replace` is the deliberate opt-in for it, which
     prints the file it drops beside the file taking its place.  Re-running the same batch is
     still a no-op: the refusal is about a different `src`, not about a second run.

  IT MUST STAY IN STEP WITH THE TWO GLOSSARY SERIALIZERS.  `add-glossary.js` and `add-sources.js`
  both REBUILD glossary.js from a fixed list of tables, so a table neither of them carries is
  dropped on the next content batch — both already carry GLOSSARY_IMAGES, which is why this
  script writes that table and no other.
*/

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const GLOSS = path.join(ROOT, "glossary.js");
const DATA = path.join(ROOT, "data.js");

const FIELDS = ["src", "title", "desc", "credit", "alt"];

function loadWindow(file) {
  const win = {};
  new Function("window", fs.readFileSync(file, "utf8"))(win);
  return win;
}

function check(where, img) {
  const bad = [];
  if (!img || typeof img !== "object") return [where + ": not an object"];
  const extra = Object.keys(img).filter((k) => !FIELDS.includes(k));
  if (extra.length) bad.push(`${where}: unknown field(s) ${extra.join(", ")}`);
  if (!/^https:\/\//.test(img.src || "")) bad.push(`${where}: src must be an https URL`);
  if (!String(img.credit || "").trim()) bad.push(`${where}: no credit — a picture is always someone else's file`);
  if (!String(img.title || "").trim()) bad.push(`${where}: no title`);
  if (!String(img.alt || "").trim()) bad.push(`${where}: no alt text`);
  if (/[<>]/.test([img.title, img.desc, img.alt].join(""))) bad.push(`${where}: markup in a text field`);
  return bad;
}

/* glossary.js is a run of `window.GLOSSARY_* = Object.assign(...)` blocks, each under a comment.
   The images table is written in the position the two serializers emit it in — after the tags
   and before the sources — so a later `add-glossary.js` run reproduces the same file order. */
function writeGlossary(images, dry) {
  /* THE IMAGES TABLE LIVES IN glossary-extra.js NOW, not in glossary.js. It was split onto the lazy
     path with the citations because together they were 54% of a file every visitor downloads before
     flipping a card, and neither is read until a popup opens. The old body of this function did a
     surgical text splice into glossary.js to keep a two-line change from re-laying-out 735 rows;
     that is no longer needed, because gloss-io.js owns the whole of the extra file's format and
     writes it the same way every time -- so a batch's diff is its own rows and nothing else.
     It still round-trips the file to confirm it parses. */
  const io = require("./gloss-io.js");
  if (!dry) {
    const win = io.loadGlossary();
    win.GLOSSARY_IMAGES = images;
    fs.writeFileSync(io.EXTRA, io.serializeExtra(win));
    io.loadGlossary();   // re-parse to confirm valid JS
  }
  return Object.keys(images).length;
}

/* data.js is rewritten whole, exactly as add-card.js and update-cards.js write it — one JSON
   object per line for the cards, the tree pretty-printed. */
function writeCards(cardImages, dry, replace) {
  const win = loadWindow(DATA);
  const byId = new Map(win.CARD_DATA.map((c) => [c.id, c]));
  let n = 0;
  for (const [id, img] of Object.entries(cardImages)) {
    const card = byId.get(id);
    if (!card) throw new Error("no card with id " + id);
    if (card.video && card.video.src) throw new Error(id + " has a video — one frame per card");
    /* A re-run of the same batch must be a no-op rather than an error — this pipeline is
       resumable, and the usual reason to run it twice is a reworded caption on the SAME file.
       A different file over an existing picture is refused unless --replace is passed: that is a
       replacement, and a batch is not the place to make one SILENTLY.  With the flag it is not
       silent — the file being dropped and the file taking its place are both printed. */
    if (card.image && card.image.src) {
      if (card.image.src !== img.src) {
        if (!replace) throw new Error(id + " already has a different picture (pass --replace)");
        console.log("replace " + id + "\n  was: " + card.image.src + "\n  now: " + img.src);
      }
      if (JSON.stringify(card.image) === JSON.stringify(img)) continue;
    }
    card.image = img;
    n++;
  }
  const out =
    "/* Card data. Add cards one at a time with `node .claude/add-card.js <card.json> [deckId]` (see CLAUDE.md). */\n" +
    "window.CARD_DATA = [\n" + win.CARD_DATA.map((c) => JSON.stringify(c)).join(",\n") + "\n];\n\n" +
    "/* Collection -> deck -> sub-deck tree. Leaf decks carry a `cardIds` array. */\n" +
    "window.COLLECTION_TREE = " + JSON.stringify(win.COLLECTION_TREE, null, 2) + ";\n";
  if (!dry) { fs.writeFileSync(DATA, out); loadWindow(DATA); }
  return n;
}

/* THE ARTEFACT POOL IS TWO FILES and both are written through .claude/artefact-io.js — never from an
   emitter of this script's own.

   IT USED TO CARRY ONE, AND THAT IS THE WHOLE ARGUMENT FOR THE SHARED MODULE. An artefact's image was
   three fields and has been FIVE since Aug 2026 (the plate's picture opens the fullscreen viewer, and
   with no title or desc it opened on a blank caption) — and this script's private emitter did not learn
   the two, so one run to replace one picture silently stripped `title` and `desc` from all 99. Nothing
   threw; the captions simply went. A copy of a serializer goes stale on a change made in another file by
   someone with no reason to look here, and the split has now added a second way for that to happen: an
   emitter that writes artefacts.js alone would take every description in the pool with it. */
function writeArtefacts(images, dry, replace) {
  const io = require("./artefact-io.js");
  const all = io.loadArtefacts();     // BOTH files — the eager index and the lazy desc/sources/image
  const byId = new Map(all.map((a) => [a.id, a]));
  let n = 0;
  for (const [id, img] of Object.entries(images)) {
    const a = byId.get(id);
    if (!a) throw new Error("no artefact with id " + id);
    if (a.image && a.image.src) {
      if (a.image.src === img.src) continue;
      if (!replace) throw new Error(id + " already has a different picture (pass --replace)");
      console.log("replace " + id + "\n  was: " + a.image.src + "\n  now: " + img.src);
    }
    /* A batch supplies the five card fields; an artefact takes all five where they are given,
       keeping whatever it already carried for any the batch leaves out. */
    a.image = Object.assign({}, a.image, { src: img.src, credit: img.credit, alt: img.alt });
    if (img.title) a.image.title = img.title;
    if (img.desc) a.image.desc = img.desc;
    n++;
  }
  if (!dry) io.writeArtefacts(all);
  return n;
}

function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  const dry = args.includes("--dry");
  /* A picture already installed is never overwritten by accident: a batch naming a DIFFERENT file
     for a card or an artefact that already has one is refused, and --replace is the deliberate
     opt-in, which prints what it drops. */
  const replace = args.includes("--replace");
  if (!file) { console.error("usage: node .claude/add-images.js <batch.json> [--dry] [--replace]"); process.exit(1); }
  const batch = JSON.parse(fs.readFileSync(file, "utf8"));

  const gloss = batch.glossary || {};
  const cards = batch.cards || {};
  const arte = batch.artefacts || {};
  const problems = [];

  // both files: GLOSSARY comes from glossary.js and GLOSSARY_IMAGES from the lazy
  // glossary-extra.js, and the merge below needs the existing images to be real.
  const win = require("./gloss-io.js").loadGlossary();
  for (const [slug, img] of Object.entries(gloss)) {
    if (!win.GLOSSARY[slug]) problems.push(`glossary ${slug}: no such term`);
    problems.push(...check("glossary " + slug, img));
  }
  for (const [id, img] of Object.entries(cards)) problems.push(...check("card " + id, img));
  /* An artefact's image is the three-field shape, so it is checked against those three rather
     than against the five a card and a term carry. */
  for (const [id, img] of Object.entries(arte)) {
    if (!/^https:\/\//.test(img.src || "")) problems.push(`artefact ${id}: src must be an https URL`);
    if (!String(img.credit || "").trim()) problems.push(`artefact ${id}: no credit`);
    if (!String(img.alt || "").trim()) problems.push(`artefact ${id}: no alt text`);
    const extra = Object.keys(img).filter((k) => !["src", "credit", "alt"].includes(k));
    if (extra.length) problems.push(`artefact ${id}: unknown field(s) ${extra.join(", ")}`);
  }

  if (problems.length) { problems.forEach((p) => console.error("ERROR: " + p)); process.exit(1); }

  const merged = Object.assign({}, win.GLOSSARY_IMAGES || {}, gloss);
  const g = writeGlossary(merged, dry);
  const c = writeCards(cards, dry, replace);
  const ar = writeArtefacts(arte, dry, replace);

  const total = loadWindow(DATA).CARD_DATA;
  console.log(`${dry ? "[dry] " : ""}glossary images: +${Object.keys(gloss).length} (table now ${g} of ${Object.keys(win.GLOSSARY).length} terms)`);
  console.log(`${dry ? "[dry] " : ""}card images:     +${c} (now ${total.filter((x) => x.image && x.image.src).length} of ${total.length} cards)`);
  const arts = loadWindow(path.join(ROOT, "artefacts.js")).ARTEFACTS;
  console.log(`${dry ? "[dry] " : ""}artefact images: +${ar} (now ${arts.filter((x) => x.image && x.image.src).length} of ${arts.length} artefacts)`);
}

if (require.main === module) main();
