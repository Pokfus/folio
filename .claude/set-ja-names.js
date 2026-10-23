#!/usr/bin/env node
/*
  Writes a Japan card's Japanese name and its romanisation.

    node .claude/set-ja-names.js [.claude/japan-names.json] [--check]

  The file maps a card id to ["<Japanese>", "<Hepburn romanisation>"]. They are stored in the existing light
  fields `hanzi` (the script) and `pinyin` (the romanisation) — those are what every writer, the serializer,
  the overlay and the admin editor already carry — and `traditional` is cleared, since a Japanese name has no
  second script to show. WHICH LANGUAGE the answer's bubble speaks and sets its text in is decided by the
  card's id prefix, not by the field names: `answerNameLang` in app.js (`jp-` → Japanese).
  Refuses any id that is not a `jp-` card. --check reports drift without writing.
*/
const fs = require("fs"), path = require("path");
const { loadCards, writeCards } = require("./card-io");
const file = process.argv.slice(2).find((a) => !a.startsWith("--")) || path.join(__dirname, "japan-names.json");
const check = process.argv.includes("--check");
const names = JSON.parse(fs.readFileSync(file, "utf8"));
const { cards, tree } = loadCards();
const byId = new Map(cards.map((c) => [c.id, c]));
let changed = 0, bad = 0;
for (const [id, v] of Object.entries(names)) {
  const c = byId.get(id);
  if (!c || !id.startsWith("jp-") || !Array.isArray(v) || !v[0] || !v[1]) { console.log("REFUSED", id); bad++; continue; }
  if (c.hanzi !== v[0] || c.pinyin !== v[1] || (c.traditional || "") !== "") {
    changed++;
    c.hanzi = v[0]; c.pinyin = v[1]; c.traditional = "";
  }
}
const missing = cards.filter((c) => c.id.startsWith("jp-") && !(names[c.id]));
missing.forEach((c) => console.log("NO NAME", c.id));
console.log((check ? "would change " : "changed ") + changed + " card(s); " + bad + " refused; " + missing.length + " jp- card(s) without a name");
if (bad) process.exit(1);
if (check) process.exit(changed || missing.length ? 1 : 0);
if (changed) writeCards(cards, tree);
