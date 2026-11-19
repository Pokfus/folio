"use strict";
/*
  bengali-common.js — what bengali-fix.js, bengali-order.js and build-bengali-alphabet.js share (Nov 2026,
  the Bengali beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

  WHICH DECKS. Every deck in `decks/` whose card type is `bengali` (the five levels and the phrases) or
  `bn-abc` (the alphabet) — found by CARD TYPE, never by file name.

  A NOTE'S KEY, which its id is pinned to: the `Word` field of a `bengali` note (the bare headword the
  speaker reads), the `Key` field of an alphabet note (`bn-abc`, and the rule cards' `bn-rule`).
*/
const fs = require("fs");
const path = require("path");

const HERE = __dirname;
const DECKS = path.join(HERE, "..", "..", "decks");
const IDS = path.join(HERE, "bengali-ids.json");
const ORDER = path.join(HERE, "bengali-order.json");
const WORD_TYPE = "bengali", ABC_TYPE = "bn-abc";
// the shelf's own order, by deck id: the alphabet, the five levels, the phrases
const SHELF = ["bnabc", "bengalia1", "bengalia2", "bengalib1", "bengalib2", "bengalic1", "bnphrase"];
const LEVELS = ["bengalia1", "bengalia2", "bengalib1", "bengalib2", "bengalic1"];
const LEVEL_NAME = { bengalia1: "A1", bengalia2: "A2", bengalib1: "B1", bengalib2: "B2", bengalic1: "C1" };
// LIMIT_DEFAULTS.lang.newPerDay in app.js: ten new cards a day, a note's two cards together
const NEW_PER_DAY = 10;

function loadDecks() {
  const out = {};
  for (const f of fs.readdirSync(DECKS).filter((x) => /\.folio-deck\.json$/.test(x)).sort()) {
    const file = path.join(DECKS, f);
    // cheap pre-filter on the file's first 32 KB (meta comes first): the shelf is 180 MB, and only
    // seven files are Bengali's
    const fd = fs.openSync(file, "r"), buf = Buffer.alloc(32768);
    const got = fs.readSync(fd, buf, 0, buf.length, 0);
    fs.closeSync(fd);
    if (!/"types":\s*\{"(?:bengali|bn-abc)"/.test(buf.toString("utf8", 0, got))) continue;
    const raw = fs.readFileSync(file, "utf8");
    const deck = JSON.parse(raw);
    const type = Object.keys(deck.meta.types || {})[0];
    if (type !== WORD_TYPE && type !== ABC_TYPE) continue;
    out[deck.meta.id] = { file, name: f, deck, type, raw };
  }
  return out;
}

const keyOf = (card) => (card.type === WORD_TYPE ? card.fields.Word : card.fields.Key);   // bn-abc and bn-rule carry a Key
const nfc = (s) => (s || "").normalize("NFC");
const fold = (s) => nfc(s).replace(/[\u200c\u200d]/g, "").trim().split(" ").map((w) => (w === "কী" ? "কি" : w)).join(" ");
const tokens = (s) => nfc(s).match(/[\u0980-\u09E5\u09F0-\u09FE\u200c\u200d]+/g) || [];
const text = (h) => (h || "").replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

// every form a note SHOWS: its headword, its Forms row, its All-forms panel
function formsShown(card) {
  const out = new Set(tokens(card.fields.Word).map(fold));
  out.add(fold(card.fields.Word));
  for (const m of (card.fields.Forms || "").matchAll(/class="uc-fl">[^<]*<\/span>([^<]*)/g)) out.add(fold(m[1]));
  for (const m of (card.fields.Table || "").matchAll(/<span class="uc-cj-f">([^<]*)/g)) out.add(fold(m[1]));
  return out;
}

const sentences = (card) => [...(card.fields.Examples || "").matchAll(/data-say="([^"]*)"/g)].map((m) => m[1]);

function readJSON(p, dflt) { return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : dflt; }

// one deck id to a line, so a diff of the pin or the order is a diff of one deck
function writeByDeck(p, obj) {
  const keys = Object.keys(obj);
  const body = keys.map((k) => JSON.stringify(k) + ":" + JSON.stringify(obj[k])).join(",\n");
  fs.writeFileSync(p, "{" + body + "}\n");
}

module.exports = { fs, path, DECKS, IDS, ORDER, WORD_TYPE, ABC_TYPE, SHELF, LEVELS, LEVEL_NAME, NEW_PER_DAY,
  loadDecks, keyOf, nfc, fold, tokens, text, formsShown, sentences, readJSON, writeByDeck };
