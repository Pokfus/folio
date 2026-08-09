#!/usr/bin/env node
"use strict";
/*
  add-images.js — write a reviewed batch of pictures into glossary.js (window.GLOSSARY_IMAGES),
  data.js (card.image) and artefacts.js (artefact.image).  Standalone Node helper, zero deps.  Not
  part of the site.

    node .claude/add-images.js <batch.json> [--dry]

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
   · a card that already carries a picture or a video — ONE FRAME PER CARD is the store's rule
     (see `retireOtherCardMedia` in app.js), and a batch must not be the thing that breaks it.

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
  let text = fs.readFileSync(GLOSS, "utf8");
  /* Written in `add-glossary.js`'s exact `obj()` shape — no indent, one entry per line, keys sorted.
     Those two scripts REBUILD glossary.js from a fixed list of tables, so whichever ran last decides
     the file's formatting; matching them here is what keeps a content batch from re-laying-out all
     735 rows and burying its own two-line change in a 1,400-line diff. */
  const body = Object.keys(images).sort().map((k) => JSON.stringify(k) + ": " + JSON.stringify(images[k])).join(",\n");
  const block =
    "/* Optional illustration per term (slug -> { src, title, desc, credit, alt }) — shown at the foot of the term's popup. */\n" +
    "window.GLOSSARY_IMAGES = Object.assign(window.GLOSSARY_IMAGES || {}, {\n" + body + "\n});\n\n";

  const existing = /\/\*[^*]*illustration per term[\s\S]*?\n\}\);\n\n/;
  if (existing.test(text)) text = text.replace(existing, block);
  else {
    const anchor = text.indexOf("/* Source footnotes per term");
    if (anchor === -1) throw new Error("glossary.js: cannot find the sources block to insert before");
    text = text.slice(0, anchor) + block + text.slice(anchor);
  }
  if (!dry) { fs.writeFileSync(GLOSS, text); loadWindow(GLOSS); }
  return Object.keys(images).length;
}

/* data.js is rewritten whole, exactly as add-card.js and update-cards.js write it — one JSON
   object per line for the cards, the tree pretty-printed. */
function writeCards(cardImages, dry) {
  const win = loadWindow(DATA);
  const byId = new Map(win.CARD_DATA.map((c) => [c.id, c]));
  let n = 0;
  for (const [id, img] of Object.entries(cardImages)) {
    const card = byId.get(id);
    if (!card) throw new Error("no card with id " + id);
    if (card.video && card.video.src) throw new Error(id + " has a video — one frame per card");
    /* A re-run of the same batch must be a no-op rather than an error — this pipeline is
       resumable, and the usual reason to run it twice is a reworded caption on the SAME file.
       A different file over an existing picture is still refused: that is a replacement, and a
       batch is not the place to make one silently. */
    if (card.image && card.image.src) {
      if (card.image.src !== img.src) throw new Error(id + " already has a different picture");
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

/* artefacts.js is rewritten whole in `serializeArtefacts`'s exact output format — the same one
   add-artefacts.js and add-artefact-sources.js emit, so a hand edit and the next save from
   Admin → Artefacts cannot drift apart.  An artefact's image is three fields, not five. */
function writeArtefacts(images, dry) {
  const file = path.join(ROOT, "artefacts.js");
  const win = loadWindow(file);
  const all = win.ARTEFACTS;
  const byId = new Map(all.map((a) => [a.id, a]));
  let n = 0;
  for (const [id, img] of Object.entries(images)) {
    const a = byId.get(id);
    if (!a) throw new Error("no artefact with id " + id);
    if (a.image && a.image.src) {
      if (a.image.src !== img.src) throw new Error(id + " already has a different picture");
      continue;
    }
    a.image = { src: img.src, credit: img.credit, alt: img.alt };
    n++;
  }
  const s = (v) => JSON.stringify(String(v == null ? "" : v));
  const HEAD = fs.readFileSync(file, "utf8").split("window.ARTEFACTS")[0];
  const body = all.map((a) => {
    let out = "  {\n    id: " + s(a.id) + ",\n    name: " + s(a.name) + ",\n    rarity: " + s(a.rarity) + ",\n";
    if (a.date) out += "    date: " + s(a.date) + ",\n";
    if (a.origin) out += "    origin: " + s(a.origin) + ",\n";
    if (a.image && a.image.src) out += "    image: { src: " + s(a.image.src) + ", credit: " + s(a.image.credit) + ", alt: " + s(a.image.alt) + " },\n";
    out += "    desc: " + s(a.desc) + ",\n";
    if (Array.isArray(a.sources) && a.sources.length) out += "    sources: [\n" + a.sources.map((x) => "      " + s(x) + ",").join("\n") + "\n    ],\n";
    return out + "  },";
  }).join("\n");
  if (!dry) { fs.writeFileSync(file, HEAD + "window.ARTEFACTS = [\n" + body + "\n];\n"); loadWindow(file); }
  return n;
}

function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  const dry = args.includes("--dry");
  if (!file) { console.error("usage: node .claude/add-images.js <batch.json> [--dry]"); process.exit(1); }
  const batch = JSON.parse(fs.readFileSync(file, "utf8"));

  const gloss = batch.glossary || {};
  const cards = batch.cards || {};
  const arte = batch.artefacts || {};
  const problems = [];

  const win = loadWindow(GLOSS);
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
  const c = writeCards(cards, dry);
  const ar = writeArtefacts(arte, dry);

  const total = loadWindow(DATA).CARD_DATA;
  console.log(`${dry ? "[dry] " : ""}glossary images: +${Object.keys(gloss).length} (table now ${g} of ${Object.keys(win.GLOSSARY).length} terms)`);
  console.log(`${dry ? "[dry] " : ""}card images:     +${c} (now ${total.filter((x) => x.image && x.image.src).length} of ${total.length} cards)`);
  const arts = loadWindow(path.join(ROOT, "artefacts.js")).ARTEFACTS;
  console.log(`${dry ? "[dry] " : ""}artefact images: +${ar} (now ${arts.filter((x) => x.image && x.image.src).length} of ${arts.length} artefacts)`);
}

if (require.main === module) main();
