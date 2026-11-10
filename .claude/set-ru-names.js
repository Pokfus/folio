#!/usr/bin/env node
/*
  Writes a Russia card's Russian name and its Latin transliteration.

    node .claude/set-ru-names.js [.claude/russia-names.json] [--check]

  The file maps a card id to "<Cyrillic>" or, where the mechanical transliteration below reads badly, to
  ["<Cyrillic>", "<Latin>"]. They are stored in the existing light fields `hanzi` (the script) and `pinyin`
  (the romanisation), as `set-ko-names.js` does for Korean, and `traditional` is cleared. WHICH LANGUAGE the
  answer's bubble speaks and sets its text in is decided by the card's id prefix (`answerNameLang` in app.js:
  `ru-` → Russian).

  The transliteration is the familiar English one (BGN/PCGN simplified, as Wikipedia's English titles use):
  ж zh, х kh, ц ts, ч ch, ш sh, щ shch, ю yu, я ya, ё yo, й y, ы y; е is "ye" at the start of a word and
  after a vowel, ь or ъ, else "e"; ь and ъ are dropped; a word-final -ий / -ый is "-y" (Grozny, Nevsky).
  Names were written by hand and cross-checked against Wikidata's Russian labels (Nov 2026).
  Refuses any id that is not a `ru-` card. --check reports drift without writing.
*/
const fs = require("fs"), path = require("path");
const { loadCards, writeCards } = require("./card-io");

const MAP = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l",
  м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
const VOWELS = "аеёиоуыэюяьъ";
function translit(s) {
  s = s.replace(/([иы])й(?![а-яё])/gi, (m, v) => (v === v.toUpperCase() ? "Y" : "y") + "\u0001");
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i], lo = ch.toLowerCase();
    if (ch === "\u0001") continue;
    if (!(lo in MAP)) { out += ch; continue; }
    const prev = (s[i - 1] || "").toLowerCase();
    let r = MAP[lo];
    if (lo === "е" && (!prev || !/[а-яё]/.test(prev) || VOWELS.includes(prev))) r = "ye";
    if (ch !== lo) r = r.charAt(0).toUpperCase() + r.slice(1);
    out += r;
  }
  return out;
}

if (require.main === module) {
  const file = process.argv.slice(2).find((a) => !a.startsWith("--")) || path.join(__dirname, "russia-names.json");
  const check = process.argv.includes("--check");
  const names = JSON.parse(fs.readFileSync(file, "utf8"));
  const { cards, tree } = loadCards();
  const byId = new Map(cards.map((c) => [c.id, c]));
  let changed = 0, bad = 0;
  for (const [id, v] of Object.entries(names)) {
    const c = byId.get(id);
    const cyr = Array.isArray(v) ? v[0] : v, lat = Array.isArray(v) ? v[1] : translit(String(v || ""));
    if (!c || !id.startsWith("ru-") || !cyr || !lat || !/[Ѐ-ӿ]/.test(cyr)) { console.log("REFUSED", id); bad++; continue; }
    if (c.hanzi !== cyr || c.pinyin !== lat || (c.traditional || "") !== "") {
      changed++;
      c.hanzi = cyr; c.pinyin = lat; c.traditional = "";
    }
  }
  const missing = cards.filter((c) => c.id.startsWith("ru-") && !names[c.id]);
  missing.forEach((c) => console.log("NO NAME", c.id));
  console.log((check ? "would change " : "changed ") + changed + " card(s); " + bad + " refused; " + missing.length + " ru- card(s) without a name");
  if (bad) process.exit(1);
  if (check) process.exit(changed || missing.length ? 1 : 0);
  if (changed) writeCards(cards, tree);
}
module.exports = { translit };
