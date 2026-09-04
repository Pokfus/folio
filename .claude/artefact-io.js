/* artefact-io.js — load and write the artefact pool, which is TWO files.
 *
 * An artefact's DESCRIPTION, CITATIONS and PICTURE were split out of artefacts.js into the lazy
 * artefacts-extra.js, because together they were 94% of a file on the EAGER load path and not one
 * of the three is read until a chest opens or the Reliquary is visited (see .claude/split-artefacts.js).
 *
 * That split has one consequence for every helper script here, and it is silent — the same one
 * gloss-io.js exists for, one shelf over. `require("../artefacts.js")` now yields a pool of
 * entries with EMPTY `desc`, no `sources` and no `image`. A reader script then reports a fully
 * cited pool as having no citations at all; a WRITER script re-serialises what it loaded and
 * deletes 240 KB of real content without erroring. Nothing throws either way.
 *
 * So every script goes through here instead:
 *
 *   const { loadArtefacts, writeArtefacts } = require("./artefact-io.js");
 *   const list = loadArtefacts();        // both files, merged, exactly as the browser sees them
 *   ...mutate...
 *   writeArtefacts(list);                // writes BOTH files, in serializeArtefacts's own format
 *
 * WHY THE QUEUE'S KEY IS `ARTEFACTS_EXTRA` AND NOT SOMETHING SHORTER: a one-off inspection that
 * reaches past this module has to read `window.ARTEFACTS_EXTRA_IN[0].ARTEFACTS_EXTRA`. The wrong
 * form returns `undefined`, which reads as *this artefact has no description* — and that is the
 * shape of the fault that overwrote a shipped glossary illustration in Aug 2026. Confirm the
 * table's SIZE before trusting what it says about one id.
 *
 * Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const MAIN = path.join(ROOT, "artefacts.js");
const EXTRA = path.join(ROOT, "artefacts-extra.js");
const HEAVY = ["desc", "sources", "image"];

/* Load both files into one window and merge, draining the staging queue the way app.js's
   artefactExtraIngest does. Returns the ARTEFACTS array, each entry whole. */
function loadArtefacts() {
  const w = {};
  vm.runInNewContext(fs.readFileSync(MAIN, "utf8"), { window: w }, { timeout: 30000 });
  const list = Array.isArray(w.ARTEFACTS) ? w.ARTEFACTS : [];
  if (fs.existsSync(EXTRA)) {
    vm.runInNewContext(fs.readFileSync(EXTRA, "utf8"), { window: w }, { timeout: 30000 });
    const by = {};
    list.forEach((a) => { if (a && a.id) by[a.id] = a; });
    for (const inc of w.ARTEFACTS_EXTRA_IN || []) {
      const t = inc.ARTEFACTS_EXTRA || {};
      for (const id of Object.keys(t)) {
        if (!by[id]) continue;                       // an id the index does not carry is not resurrected
        for (const k of HEAVY) if (t[id][k] !== undefined) by[id][k] = t[id][k];
      }
    }
  }
  list.forEach((a) => { if (a && a.desc === undefined) a.desc = ""; });
  return list;
}

const s = (v) => JSON.stringify(String(v == null ? "" : v));

/* The index — everything a reader needs before a chest is opened. Its head comment is written out
   in full rather than preserved from disk, exactly as app.js's serializeArtefacts does: once the
   file has been round-tripped through the editor this is the only copy of the shape's documentation,
   and a serializer that drops it is how a file stops explaining itself. */
function serializeIndex(list) {
  return "/* ============================================================\n" +
    "   ARTEFACTS — the pool a level-up chest draws from (THE INDEX)\n" +
    "   ============================================================\n" +
    "   Every entry is a REAL historical object. The same rule the cards and the glossary run on applies here\n" +
    "   without exception: nothing is invented — not a date, not a museum, not a measurement — and where the\n" +
    "   scholarship is unsettled the description says so rather than picking a side.\n\n" +
    "   THIS FILE IS THE INDEX ONLY, AND IT IS EAGER. Each artefact's DESCRIPTION, CITATIONS and PICTURE\n" +
    "   live in the lazy artefacts-extra.js (bundle `artefactExtra`, warmed at idle). Together those three\n" +
    "   were 94% of this file — 237 KB of 251 — and not one of them is read until a chest opens or the\n" +
    "   Reliquary is visited, while every visitor downloaded all of it before flipping a card. What stays\n" +
    "   here is what a reader needs BEFORE a chest is opened: `progStats` counts legendaries on every grade\n" +
    "   and needs `rarity` alone. See .claude/split-artefacts.js, and `--check` to verify the split.\n\n" +
    "   Shape:\n" +
    "     id      a stable slug. It is what the reader's own inventory (S.artefacts) is keyed by, so it must\n" +
    "             NEVER be reused for a different object and never renamed once shipped — a renamed id takes\n" +
    "             the artefact out of every collection that holds it. It is also the JOIN to artefacts-extra.js.\n" +
    "     name    the title shown when it is looted.\n" +
    "     rarity  \"common\" | \"rare\" | \"epic\" | \"legendary\" — grey, blue, purple, orange. It decides the drop\n" +
    "             odds (60 / 25 / 12 / 3) and how expansive the chest animation and its sound are. THE POOL'S\n" +
    "             OWN SHAPE MUST MIRROR THOSE ODDS: rollArtefact renormalises over whatever rarities still\n" +
    "             hold something unowned, so a tier under-represented here empties early and drops out of the\n" +
    "             roll — which a reader experiences as bad luck and never reports.\n" +
    "     date    a short date line, in the compact notation the cards use.\n" +
    "     origin  where it is from, and where it is now if that is worth knowing.\n\n" +
    "   Written and edited in Admin → Artefacts, which shows the reader's plate live beside the form and can\n" +
    "   also hand both files back as JS literals. GENERATED by .claude/artefact-io.js — do not hand-edit. */\n" +
    "window.ARTEFACTS = [\n" +
    list.map((a) => {
      let out = "  {\n    id: " + s(a.id) + ",\n    name: " + s(a.name) + ",\n    rarity: " + s(a.rarity) + ",\n";
      if (a.date) out += "    date: " + s(a.date) + ",\n";
      if (a.origin) out += "    origin: " + s(a.origin) + ",\n";
      return out + "  },";
    }).join("\n") + "\n];\n";
}

/* Kept in step with app.js's serializeArtefactsExtra by hand; both write this file, and
   `node .claude/split-artefacts.js --check` verifies the result loads and carries every id's
   three fields whichever wrote it. */
function serializeExtra(list) {
  const rows = list.map((a) => {
    let out = "";
    if (a.image && a.image.src) out += "  image: { src: " + s(a.image.src) +
      (a.image.title ? ", title: " + s(a.image.title) : "") +
      (a.image.desc ? ", desc: " + s(a.image.desc) : "") +
      ", credit: " + s(a.image.credit) + ", alt: " + s(a.image.alt) + " },\n";
    out += "  desc: " + s(a.desc) + ",\n";
    const src = Array.isArray(a.sources) ? a.sources.map((x) => String(x).replace(/\s+/g, " ").trim()).filter(Boolean) : [];
    if (src.length) out += "  sources: [\n" + src.map((x) => "    " + s(x) + ",").join("\n") + "\n  ],\n";
    return s(a.id) + ": {\n" + out + "}";
  }).join(",\n");
  return "/* An artefact's DESCRIPTION, CITATIONS and PICTURE — split out of artefacts.js and LAZY.\n" +
    " *\n" +
    " * WHY THIS FILE EXISTS. artefacts.js is on the eager load path, so every visitor downloads it\n" +
    " * before flipping a card, and these three fields were 94% of it — 237 KB of 251. Not one of them\n" +
    " * is read until a CHEST OPENS or the Reliquary is visited; the only boot-adjacent reader of the\n" +
    " * pool is progStats, which counts legendaries and so needs `rarity` alone. They are fetched now by\n" +
    " * the `artefactExtra` data bundle: warmed at idle after boot, and awaited by the chest reveal, the\n" +
    " * Reliquary, a friend's collection and Admin → Artefacts.\n" +
    " *\n" +
    " * IT STAGES ONTO A QUEUE RATHER THAN ASSIGNING, for the same reason glossary-extra.js does. The\n" +
    " * file lands AFTER boot, where refreshArtefacts() has already built the pool from the index alone\n" +
    " * and applyAdminEdits() has already run — so a plain assignment would leave Admin → Artefacts'\n" +
    " * Revert comparing a real description against nothing and DELETING it rather than restoring it.\n" +
    " * The bundle's `after` hook (artefactExtraIngest) drains the queue, merges the three fields back\n" +
    " * into window.ARTEFACTS and rebuilds the pool, which re-applies the admin overlay on top.\n" +
    " *\n" +
    " * The key is the artefact's `id`, which is the join to the index and is never renamed.\n" +
    " *\n" +
    " * GENERATED — do not hand-edit. Written by .claude/artefact-io.js (the helper scripts) and by\n" +
    " * app.js's serializeArtefactsExtra (the in-app editor). `node .claude/split-artefacts.js --check`\n" +
    " * verifies the split is still intact. */\n" +
    "(function () {\n" +
    "  var ARTEFACTS_EXTRA = {\n" + rows + "\n};\n" +
    "  (window.ARTEFACTS_EXTRA_IN = window.ARTEFACTS_EXTRA_IN || []).push({ ARTEFACTS_EXTRA: ARTEFACTS_EXTRA });\n" +
    "})();\n";
}

/* Write BOTH files. Never write one alone: the index and the extra are joined on `id`, so an id
   added to one and not the other is an artefact that either has no prose or is unreachable. */
function writeArtefacts(list) {
  fs.writeFileSync(MAIN, serializeIndex(list));
  fs.writeFileSync(EXTRA, serializeExtra(list));
}

module.exports = { loadArtefacts, writeArtefacts, serializeIndex, serializeExtra, MAIN, EXTRA, HEAVY };
