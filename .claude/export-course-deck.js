/* ============================================================================
   export-course-deck.js — write a curated collection out as a COMMUNITY deck file.

     node .claude/export-course-deck.js <collectionId> <deckId> <out.folio-deck.json> [--color=#RRGGBB] [--subtitle=…]

   Written in Oct 2026 when the three courses (Politics: East Asia, The EU as an External Power,
   Gateway to Global Affairs) left the curated collections for the Shared decks list, where the Tea
   deck already stood. The output is the shape `uDeckImportText` reads and the Studio publishes:
   `{ folioDeck: 1, meta, cards, gloss }`, one card per curated card, in the tree's order, each filed
   in a subdeck named after its tree leaf (`sub`). The deck uses the site glossary (`glossMode: "site"`).

   ONLY WHAT A COMMUNITY CARD CAN CARRY TRAVELS (`uCardSanitize`): CARD_FIELDS, the `questions` pool,
   `sources`, `image` and `sub`. A curated card's `why`, `wiki`, `tags`, `difficulty`, `locator`,
   `places` and `undatable` have no community field and are dropped — the script prints the counts.
   Card ids are `u_<deckId>_<n>`, numbered from 1 in output order, so a re-export keeps them stable.
   ============================================================================ */
"use strict";
const fs = require("fs");
const { loadCards } = require("./card-io");

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const opt = (k) => { const a = process.argv.find((x) => x.startsWith("--" + k + "=")); return a ? a.slice(k.length + 3) : ""; };
const [colId, deckId, out] = args;
if (!colId || !deckId || !out) { console.error("usage: export-course-deck.js <collectionId> <deckId> <out> [--color=#RRGGBB] [--subtitle=…]"); process.exit(1); }
if (!/^[a-z0-9]{4,16}$/.test(deckId)) { console.error("deckId must be 4–16 lowercase letters or digits (uDeckSanitizeMeta)"); process.exit(1); }

// the community card's fields, as app.js's CARD_FIELDS lists them
const CARD_FIELDS = ["num", "category", "question", "answer", "answerDate", "traditional", "hanzi", "pinyin", "translations", "abstract", "citation", "answerText"];

const { cards, tree } = loadCards();
const col = tree.collections.find((c) => c.id === colId);
if (!col) { console.error("no collection " + colId); process.exit(1); }
const byId = new Map(cards.map((c) => [c.id, c]));

const outCards = [], dropped = {};
const walk = (node, path) => {
  (node.cardIds || []).forEach((id) => {
    const c = byId.get(id);
    if (!c) throw new Error("tree names a missing card " + id);
    const o = { id: "u_" + deckId + "_" + (outCards.length + 1) };
    CARD_FIELDS.forEach((f) => { if (c[f] != null && c[f] !== "") o[f] = c[f]; });
    if (Array.isArray(c.questions) && c.questions.length) o.questions = c.questions;
    if (Array.isArray(c.sources) && c.sources.length) o.sources = c.sources;
    if (c.image && c.image.src) o.image = c.image;
    if (path) o.sub = path;
    Object.keys(c).forEach((k) => {
      if (k === "id" || k in o || CARD_FIELDS.includes(k)) return;
      const v = c[k];
      if (v == null || v === "" || (Array.isArray(v) && !v.length)) return;
      dropped[k] = (dropped[k] || 0) + 1;
    });
    outCards.push(o);
  });
  (node.children || []).forEach((k) => walk(k, path ? path + "::" + k.title : k.title));
};
(col.children || []).forEach((k) => walk(k, k.title));

const meta = {
  id: deckId,
  title: col.title,
  subtitle: opt("subtitle") || (outCards.length + " cards · a university course"),
  desc: col.blurb || "",
  author: "Folio",
  language: "en",
  tags: ["course", "politics", "international relations"],
  color: opt("color"),
  glossMode: "site",
};
if (!meta.color) delete meta.color;
fs.writeFileSync(out, JSON.stringify({ folioDeck: 1, meta, cards: outCards, gloss: {} }, null, 2) + "\n");
const subs = new Set(outCards.map((c) => c.sub));
console.log(out + ": " + outCards.length + " cards in " + subs.size + " subdecks");
if (Object.keys(dropped).length) console.log("  dropped (no community field): " + Object.entries(dropped).map(([k, n]) => k + " ×" + n).join(", "));
