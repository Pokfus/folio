#!/usr/bin/env node
/*
  Writes an Ancient Greece card's ancient Greek name and its romanisation (2026-11-26, on request: "For all cards in
  the Ancient Greece collection where the main answer isn't a modern academic term (but an ancient originally Greek
  one), add (ancient) Greek translations to the main answer term").

    node .claude/set-grc-names.js [.claude/greece-names.json] [--check]

  The file maps a card id to ["<polytonic Greek>", "<romanisation>"]. They are stored in the existing light fields
  `hanzi` (the script) and `pinyin` (the romanisation), as set-ru-names.js does for Russian, and `traditional` is
  cleared. WHICH LANGUAGE the answer's bubble speaks and sets its text in is decided by the id prefix
  (`answerNameLang` in app.js: `gr-` → Ancient Greek, spoken by a modern Greek voice).

  The Greek is nominative, polytonic, Attic unless the term is another dialect's; the romanisation is plain
  (kh, ph, th, y for υ, ou, h for the rough breathing, no macrons). A card whose answer is a modern academic term
  (Linear B, the Geometric period) has no entry. Refuses any id that is not a `gr-` card, a Greek value with no Greek
  letter in it, and a romanisation with one. --check reports drift without writing.
*/
const fs = require("fs"), path = require("path");
const { loadCards, writeCards } = require("./card-io");

const GREEK = /[Ͱ-Ͽἀ-῿]/;
const file = process.argv.slice(2).find((a) => !a.startsWith("--")) || path.join(__dirname, "greece-names.json");
const check = process.argv.includes("--check");
const names = JSON.parse(fs.readFileSync(file, "utf8"));
const { cards, tree } = loadCards();
const byId = new Map(cards.map((c) => [c.id, c]));
let changed = 0, bad = 0;
for (const [id, v] of Object.entries(names)) {
  const c = byId.get(id);
  if (!/^gr-\d+$/.test(id) || !c) { console.error("  not a gr- card: " + id); bad++; continue; }
  if (!Array.isArray(v) || v.length !== 2) { console.error("  " + id + ": want [Greek, romanisation]"); bad++; continue; }
  const gk = String(v[0]).normalize("NFC").trim(), ro = String(v[1]).trim();
  if (!GREEK.test(gk) || /[A-Za-z]/.test(gk)) { console.error("  " + id + ": the Greek is not Greek: " + gk); bad++; continue; }
  if (!ro || GREEK.test(ro)) { console.error("  " + id + ": the romanisation is missing or not Latin: " + ro); bad++; continue; }
  if (c.hanzi === gk && c.pinyin === ro && !c.traditional) continue;
  changed++;
  if (check) { console.log("  would set " + id + ": " + gk + " · " + ro); continue; }
  c.hanzi = gk; c.pinyin = ro; c.traditional = "";
}
if (!check && changed) writeCards(cards, tree);
console.log((check ? "would change " : "set ") + changed + " card(s)" + (bad ? ", " + bad + " refused" : ""));
process.exit(bad || (check && changed) ? 1 : 0);
