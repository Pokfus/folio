#!/usr/bin/env node
"use strict";
/*
  build-beginner.js — THE FOUR MANDARIN DECKS A BEGINNER STARTS WITH (Nov 2026, the beginner pass).
  Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/build-beginner.js                    # write the four decks
    node .claude/decks/build-beginner.js --check            # build in memory, fail if a file differs
    node .claude/decks/build-beginner.js --report           # print what each deck holds, write nothing
    node .claude/decks/build-beginner.js --capture <cedict> # refill beginner-phrases.json from CC-CEDICT

  WHAT IT WRITES, and why each exists (the measurements are in docs/mandarin-review.md, "The beginner pass"):
    decks/Mandarin-Pinyin-and-Tones.folio-deck.json         hsk30pin  the sounds, the tones, the tone changes
    decks/Mandarin-Bopomofo.folio-deck.json                 hsk30bpm  the zhuyin symbols, tone marks, combinations (2026-11-16)
    decks/Mandarin-Level-1-Character-Parts.folio-deck.json  hsk30cmp  the parts Level 1's characters share
    decks/Mandarin-First-Phrases.folio-deck.json            hsk30fst  what Level 1's words already spell

  IT READS NO LIVE SOURCE. The nine HSK decks cannot be rebuilt (their inputs are not in the repo; see
  mandarin-fix.js) and the Japanese pipeline's lesson was that a generator reading live exports refreshes
  unrelated content on every run. So everything here comes from files in this repo:
    · the shipped Level 1 to 3 decks — every example word, reading, meaning, speaker, character breakdown
      and example sentence on these cards is one a shipped card already carries;
    · beginner-pinyin.json — IPA values and descriptions, quoted from two Wikipedia articles at named
      revisions;
    · beginner-bopomofo.json — each symbol's origin, IPA and pinyin, quoted from the Wikipedia article
      "Bopomofo" at a named revision (2026-11-16);
    · beginner-phrases.json — the First phrases rows, whose traditional forms and senses were CAPTURED from
      CC-CEDICT once (`--capture`) and are that dictionary's text unaltered.
  A run is therefore a pure function of the repo, and `--check` can say whether the files are current.
  RE-RUN IT AFTER mandarin-fix.js CHANGES LEVEL 1, 2 OR 3 (an example sentence, a reading, the order):
  these decks quote those.

  NOTHING IS COMPOSED. A row the table cannot source is refused, not written: a First phrases headword
  CC-CEDICT does not have, one using a character Level 1 does not, one already carded in the nine decks,
  a sentence the decks do not carry verbatim, an example word the decks do not card.

  CARD IDS ARE PINNED in mandarin-ids.json, by each note's `key` (a sound's key, the part, the headword).
  A new note takes the next free number; a note that leaves keeps its row, so its number is never reused.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const IDS = path.join(HERE, "mandarin-ids.json");
const PIN_TABLE = path.join(HERE, "beginner-pinyin.json"), BPMF_TABLE = path.join(HERE, "beginner-bopomofo.json"), PHR_TABLE = path.join(HERE, "beginner-phrases.json");
const argv = process.argv.slice(2);
const CHECK = argv.includes("--check"), REPORT = argv.includes("--report");
const CAPTURE = argv.includes("--capture") ? argv[argv.indexOf("--capture") + 1] : null;
const STAMP = Date.UTC(2026, 10, 15), STAMP_ISO = "2026-11-15T00:00:00.000Z";

const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "");
const isHan = (ch) => /\p{Script=Han}/u.test(ch);
const hanOf = (s) => [...String(s)].filter(isHan);
const HAN = 'var(--han, "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif)';
const PINYIN_FONT = "'EB Garamond', var(--serif, Georgia, serif)";

/* ---------- the shipped decks ---------- */
const FILES = { hsk30l1: "Mandarin-HSK-3.0-Level-1", hsk30l2: "Mandarin-HSK-3.0-Level-2", hsk30l3: "Mandarin-HSK-3.0-Level-3" };
const NINE_RX = /^Mandarin-(HSK-3\.0-|Everyday-Phrases|Idioms)/;
const load = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
const L = {};
for (const id of Object.keys(FILES)) L[id] = load(FILES[id] + ".folio-deck.json");
const nine = fs.readdirSync(DIR).filter((f) => NINE_RX.test(f) && f.endsWith(".folio-deck.json")).sort().map(load);
if (nine.length !== 9) fail("expected the nine HSK decks in decks/, found " + nine.length);
const carded = new Map();                                   // headword → the deck that cards it
for (const d of nine) for (const c of d.cards) if (!carded.has(c.hanzi)) carded.set(c.hanzi, d.meta.id);
const l1 = L.hsk30l1.cards, l1Word = new Map(l1.map((c, i) => [c.hanzi, { c, i }]));
const l1Chars = new Set(l1.flatMap((c) => hanOf(c.hanzi)));
/* example words: Level 1 first and in its own order, and within a level the one-syllable words first — a
   sound is easiest heard alone, and by order alone "b" would be shown in 不客气 */
const oneFirst = (cs) => cs.filter((c) => hanOf(c.hanzi).length === 1).concat(cs.filter((c) => hanOf(c.hanzi).length !== 1));
const pool = [].concat(oneFirst(l1), oneFirst(L.hsk30l2.cards), oneFirst(L.hsk30l3.cards));

const sensesOf = (c) => (String(c.fields.English || "").match(/<div class="uc-sense">[\s\S]*?<\/div>/g) || [])
  .map((x) => strip(x.replace(/<i class="uc-pos">.*?<\/i>/, "")));
/* the first thing a card says its word means: the first sense's first gloss, without a reading prefix */
const glossOf = (c) => {
  const s = (sensesOf(c)[0] || "").replace(/^\S+ — /, "");
  return s[0] === "[" ? s : s.split(/;\s*/)[0];
};
const pairsOf = (c) => {
  const ex = String(c.fields.Examples || "");
  const zh = (ex.match(/<div class="uc-exz">[\s\S]*?<\/div>/g) || []).map((m) => strip(m.replace(/<span class="uc-exsn">.*?<\/span>/, "")));
  const en = (ex.match(/<div class="uc-exe">[\s\S]*?<\/div>/g) || []).map(strip);
  return zh.map((z, i) => ({ zh: z, en: en[i] || "" })).filter((p) => p.zh && p.en);
};

/* ---------- pinyin ---------- */
const MARKS = { a: "āáǎàa", e: "ēéěèe", i: "īíǐìi", o: "ōóǒòo", u: "ūúǔùu", "ü": "ǖǘǚǜü" };
const toneOf = (s) => { for (const k of Object.keys(MARKS)) for (let t = 0; t < 4; t++) if (s.includes(MARKS[k][t])) return t + 1; return 5; };
const bare = (s) => { let o = s.toLowerCase(); for (const k of Object.keys(MARKS)) for (let t = 0; t < 4; t++) o = o.split(MARKS[k][t]).join(k); return o; };
const withTone = (s, tone) => {                             // the same syllable, said with another tone
  const b = bare(s);
  let i = b.indexOf("a"); if (i < 0) i = b.indexOf("e"); if (i < 0 && b.includes("ou")) i = b.indexOf("o");
  if (i < 0) for (let k = b.length - 1; k >= 0; k--) if (MARKS[b[k]]) { i = k; break; }
  return i < 0 ? b : b.slice(0, i) + MARKS[b[i]][tone - 1] + b.slice(i + 1);
};
const numbered = (p) => String(p).trim().split(/\s+/).map((s) => {   // CC-CEDICT's "nu:3" → "nǚ"
  const m = /^([a-zA-Zü:]+)([1-5])$/.exec(s);
  if (!m) return s;
  const w = m[1].replace(/u:/g, "ü"), up = w[0] !== w[0].toLowerCase();
  const t = withTone(w.toLowerCase(), +m[2]);
  return up ? t[0].toUpperCase() + t.slice(1) : t;
}).join(" ");
const INITIALS = ["zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "r", "z", "c", "s"];
const ALONE = { yi: "i", ya: "ia", ye: "ie", yao: "iao", you: "iu", yan: "ian", yin: "in", yang: "iang", ying: "ing", yong: "iong",
  yu: "ü", yue: "üe", yuan: "üan", yun: "ün", wu: "u", wa: "ua", wo: "uo", wai: "uai", wei: "ui", wan: "uan", wen: "un", wang: "uang", weng: "ueng" };
/* a written syllable → { initial as written (y, w, yu for none), final as the table names it } */
function parseSyl(s) {
  let b = bare(s);
  if (b.length > 2 && /r$/.test(b) && b !== "er") b = b.slice(0, -1);      // erhua is a suffix, not a final
  if (ALONE[b]) return { ini: b.startsWith("yu") ? "yu" : b[0], fin: ALONE[b] };
  const ini = INITIALS.find((x) => b.startsWith(x)) || "";
  let fin = b.slice(ini.length);
  if ("jqx".includes(ini) && ini && fin[0] === "u") fin = "ü" + fin.slice(1);
  if (["z", "c", "s", "zh", "ch", "sh", "r"].includes(ini) && fin === "i") fin = "-i";
  if (["b", "p", "m", "f"].includes(ini) && fin === "o") fin = "uo";
  return { ini, fin };
}
const single = (c) => !/[\/,;]/.test(c.pinyin);              // a note that teaches one reading
const sylsOf = (c) => c.pinyin.trim().split(/[\s'’]+/).filter(Boolean);

/* ---------- ids ---------- */
const pin = JSON.parse(fs.readFileSync(IDS, "utf8"));
let pinChanged = false;
function idFor(deckId, key) {
  if (!pin[deckId]) { pin[deckId] = {}; pinChanged = true; }
  if (!(key in pin[deckId])) {
    if (CHECK) fail(deckId + "/" + key + " has no pinned id — run without --check");
    pin[deckId][key] = Math.max(0, ...Object.values(pin[deckId])) + 1; pinChanged = true;
  }
  return "u_" + deckId + "_" + pin[deckId][key];
}
const writePin = () => fs.writeFileSync(IDS, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ":" + JSON.stringify(pin[k])).join(",\n") + "\n}\n");

/* ---------- shared markup ---------- */
const BASE_CSS = `.card {
  text-align: center;
  font-size: 17px;
  line-height: 1.6;
}
.uc-ask {
  margin-bottom: 14px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.55;
}
.uc-pinyin {
  font-family: ${PINYIN_FONT};
  margin-top: 12px;
  font-size: 21px;
  letter-spacing: 0.01em;
  color: var(--zh, #C8453C);
}
.uc-field {
  display: block;
  width: fit-content;
  max-width: 100%;
  margin: 14px auto 0;
  padding: 11px 15px;
  border: 1px solid var(--rule, rgba(0,0,0,0.12));
  border-radius: 11px;
  text-align: left;
  font-size: 16px;
  background: var(--paper-2, rgba(0,0,0,0.05));
  background: color-mix(in srgb, var(--paper-2, #EFEDE6) 58%, var(--card, #FFFFFF));
}
.uc-tts {
  background: var(--paper, #F6F5F1);
  border-color: var(--paper-2, rgba(0,0,0,0.12));
}
.uc-exsay {
  margin-right: 7px;
  font-size: 12px;
  vertical-align: 0.08em;
}
.uc-lab {
  display: block;
  margin-bottom: 5px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.5;
}
.uc-rows {
  display: block;
  width: fit-content;
  max-width: 100%;
  margin: 14px auto 0;
  padding-top: 10px;
  border-top: 1px solid var(--rule, rgba(0,0,0,0.10));
  text-align: left;
}
.uc-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 3px 0;
  font-size: 13.5px;
}
.uc-row + .uc-row {
  border-top: 1px solid var(--rule, rgba(0,0,0,0.10));
}
.uc-rz {
  font-family: ${HAN};
  font-weight: 400;
  font-size: 18px;
  line-height: 1.25;
  min-width: 3.2em;
  white-space: nowrap;
}
.uc-rp {
  font-family: ${PINYIN_FONT};
  font-size: 15px;
  min-width: 5.4em;
  opacity: 0.8;
}
.uc-rp b {
  font-weight: 400;
  color: var(--zh, #C8453C);
}
.uc-rg {
  flex: 1 1 auto;
  opacity: 0.85;
}
.uc-rs {
  display: block;
  font-size: 12px;
  opacity: 0.7;
}
hr {
  margin: 18px 0;
  border: 0;
  border-top: 1px solid currentColor;
  opacity: 0.18;
}
`;
/* one word a shipped card already carries: its speaker, itself, its reading, what it means */
function wordRow(c, mark, said) {
  const py = sylsOf(c).map((s) => (mark && mark(s) ? "<b>" + esc(s) + "</b>" : esc(s))).join(" ");
  return '<div class="uc-row"><span class="uc-rz"><span class="uc-tts uc-exsay" data-say="' + esc(c.hanzi) + '"></span>' + esc(c.hanzi) + "</span>"
    + '<span class="uc-rp">' + py + (said ? '<span class="uc-rs">said ' + esc(said) + "</span>" : "") + "</span>"
    + '<span class="uc-rg">' + esc(glossOf(c)) + "</span></div>";
}
const rows = (label, html) => (html.length ? '<span class="uc-lab">' + label + "</span>" + html.join("") : "");
function deckFile(meta, cards) {
  return { folioDeck: 1, exportedAt: STAMP_ISO, meta: Object.assign({ author: "", language: "en", glossMode: "site", version: 1,
    createdAt: STAMP, updatedAt: STAMP, forkedFrom: null }, meta), cards, gloss: {} };
}
const sourceLine = (s) => "Wikipedia, “" + s.title + "”, revision " + s.revid + " of " + s.timestamp.slice(0, 10);

/* =====================================================================================================
   1. PINYIN AND TONES
   ===================================================================================================== */
function buildPinyin() {
  const T = JSON.parse(fs.readFileSync(PIN_TABLE, "utf8"));
  const id = "hsk30pin", cards = [], thin = [], left = [];
  const pick = (test, n, onlySingleChar) => {
    /* three DIFFERENT syllables where the decks have them: by tone alone the first three first-tone
       words are 他, 她 and 它. A sound three syllables do not cover is filled with the same syllable in
       another tone, then with whatever word has it. */
    const out = [], heard = new Set(), ok = (c) => single(c) && !(onlySingleChar && hanOf(c.hanzi).length !== 1) && !out.includes(c);
    for (const key of [bare, (x) => x.toLowerCase(), () => out.length]) for (const c of pool) {
      if (out.length >= n) break;
      if (!ok(c)) continue;
      const hit = sylsOf(c).find(test);
      if (!hit || heard.has(key(hit))) continue;
      heard.add(bare(hit)); heard.add(hit.toLowerCase()); out.push(c);
    }
    return out;
  };
  const add = (key, f) => cards.push({ id: idFor(id, key), num: String(cards.length + 1), key, type: "pinyin",
    fields: Object.assign({ Sound: "", Kind: "", After: "", IPA: "", Class: "", Says: "", Alone: "", Note: "", Examples: "" }, f) });
  const named = (ws) => ws.map((w) => { const e = l1Word.get(w); if (!e || !single(e.c)) fail("pinyin table names " + w + ", which Level 1 does not card with one reading"); return e.c; });

  for (const t of T.tones) {
    const ws = pick((s) => toneOf(s) === t.tone, 3, true);
    if (ws.length < 3) thin.push(t.key);
    add(t.key, { Sound: t.show, Kind: "tone mark", Class: t.name + (t.contour ? " · pitch " + t.contour : ""),
      Says: t.says, Note: t.contour ? "Pitch is given on a five-level scale, 1 the lowest and 5 the highest." : "",
      Examples: rows("as in", ws.map((c) => wordRow(c, (s) => toneOf(s) === t.tone))) });
  }
  for (const r of T.rules) {
    const ws = named(r.words);
    const said = (c) => { const s = sylsOf(c); return s.map((x, i) => (toneOf(x) === 3 && s[i + 1] && toneOf(s[i + 1]) === 3 ? withTone(x, 2) : x)).join(" "); };
    add(r.key, { Sound: r.show, Kind: r.key === "rule:mark" ? "spelling rule" : "tone rule", Class: r.name,
      Says: r.rule + (r.also ? " " + r.also : ""), Note: r.house || "",
      Examples: rows("as in", ws.map((c) => wordRow(c, null, r.said ? said(c) : ""))) });
  }
  for (const r of T.initials) {
    const test = (s) => { const p = parseSyl(s); return p.ini === r.show; };
    const ws = pick(test, 3);
    if (ws.length < 3) thin.push(r.key + " (" + ws.length + ")");
    add(r.key, { Sound: r.show, Kind: "pinyin initial", IPA: r.ipa, Class: r.cls, Says: r.like, Note: r.note || "",
      Examples: rows("as in", ws.map((c) => wordRow(c, test))) });
  }
  for (const r of T.finals) {
    const fin = r.key.slice("final:".length);
    const test = (s) => parseSyl(s).fin === fin;
    const ws = pick(test, 3);
    if (!ws.length) { left.push(r.alone || r.show); continue; }   // no word of Levels 1 to 3 has it: not carded
    if (ws.length < 3) thin.push(r.key + " (" + ws.length + ")");
    add(r.key, { Sound: r.show, Kind: "pinyin final", After: r.after || "", IPA: r.ipa, Says: r.like,
      Alone: r.only ? r.only : (r.alone && r.alone !== r.show.split(" ")[0] ? "with no initial it is written <b>" + esc(r.alone) + "</b>" : ""),
      Examples: rows("as in", ws.map((c) => wordRow(c, test))) });
  }
  const n = cards.length, nI = T.initials.length, nF = T.finals.length - left.length;
  const odd = l1.filter((c) => sylsOf(c).some((x) => /^(zh|ch|sh|q|x|c|z|r|j)|ü|^yu/.test(bare(x)))).length;
  const type = { id: "pinyin", name: "Mandarin sounds", speechLang: "zh-CN",
    fields: ["Sound", "Kind", "After", "IPA", "Class", "Says", "Alone", "Note", "Examples"],
    cards: [{ name: "Pinyin → sound",
      front: '<div class="uc-ask">{{Kind}}</div><div class="uc-snd">{{Sound}}</div>{{#After}}<div class="uc-after">{{After}}</div>{{/After}}',
      back: '{{FrontSide}}<hr>{{#IPA}}<div class="uc-ipa">{{IPA}}</div>{{/IPA}}{{#Class}}<div class="uc-cls">{{Class}}</div>{{/Class}}'
        + '<div class="uc-field">{{Says}}</div>{{#Alone}}<div class="uc-alone">{{Alone}}</div>{{/Alone}}{{#Note}}<div class="uc-note">{{Note}}</div>{{/Note}}'
        + '{{#Examples}}<div class="uc-rows">{{Examples}}</div>{{/Examples}}' }],
    css: BASE_CSS + `.uc-snd {
  font-family: ${PINYIN_FONT};
  font-size: 54px;
  line-height: 1.15;
}
.uc-after {
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.6;
}
.uc-ipa {
  font-family: ${PINYIN_FONT};
  font-size: 24px;
  color: var(--zh, #C8453C);
}
.uc-cls {
  margin-top: 4px;
  font-size: 13px;
  letter-spacing: 0.04em;
  opacity: 0.7;
}
.uc-alone, .uc-note {
  max-width: 30em;
  margin: 10px auto 0;
  font-size: 13.5px;
  opacity: 0.8;
}
.uc-alone b {
  font-family: ${PINYIN_FONT};
  font-weight: 400;
  font-size: 1.15em;
  color: var(--zh, #C8453C);
}
` };
  const desc = "How pinyin is read, before or beside the first word: " + n + " notes, one card each — the five tone marks, "
    + "where the mark is written, the three tone changes every beginner meets (two third tones together, 不, 一), the "
    + nI + " initials (the " + (nI - 3) + " consonants and y, w, yu) and the " + nF + " finals. The front shows the letters; the back gives the "
    + "sound in the International Phonetic Alphabet, how it is made or what it resembles, how it is written with no consonant before it, and "
    + "up to three words from the Level 1 to 3 decks with a speaker beside each, the syllable in question picked out. Say it, then press the "
    + "speaker and compare: the letters j, q, x, z, c, zh, ch, sh, r and ü do not have their English values, and " + odd + " of Level 1's "
    + l1.length + " words contain one of them. THE ORDER is tones, tone changes, initials (b p m f, d t n l, g k h, j q x, zh ch sh r, z c s), finals. At the default of ten "
    + "new cards a day the deck takes " + Math.ceil(n / 10) + " days; it is meant to be studied beside Level 1, not finished first. — WHAT IS NOT HERE: "
    + "no description is written for this deck. Each is quoted from the article named below, with a cut marked […]; where the article has no "
    + "English comparison the card has none. The speaker is your device's Mandarin voice reading the example word, so a device without one "
    + "is silent." + (left.length ? " The final " + left.join(", ") + " is left out: no word of Levels 1 to 3 has it." : "") + " — Sounds, descriptions and rules: " + sourceLine(T.sources.pinyin) + ", and " + sourceLine(T.sources.phonology)
    + " (CC BY-SA 4.0). Example words, readings and meanings: the HSK 3.0 Level 1 to 3 decks on this shelf (the official HSK 3.0 "
    + "vocabulary lists, and CC-CEDICT, CC BY-SA 4.0).";
  return { file: "Mandarin-Pinyin-and-Tones.folio-deck.json", thin,
    deck: deckFile({ id, title: "Mandarin Chinese — Pinyin and tones",
      subtitle: n + " sounds, tones and tone changes — start here, beside Level 1", desc,
      tags: ["chinese", "mandarin", "pinyin", "tones", "pronunciation"], types: { pinyin: type } }, cards) };
}

/* =====================================================================================================
   1b. BOPOMOFO (zhuyin) — added 2026-11-16 on request ("add another deck to learn bopomofo")
   ===================================================================================================== */
function buildBopomofo() {
  const T = JSON.parse(fs.readFileSync(BPMF_TABLE, "utf8")), P = JSON.parse(fs.readFileSync(PIN_TABLE, "utf8"));
  const pinRow = new Map([].concat(P.tones, P.initials, P.finals).map((r) => [r.key, r]));
  const id = "hsk30bpm", cards = [], thin = [], left = [];
  /* a card whose Bopomofo field teaches ONE reading, split into its syllables as the card spells them */
  const zyOf = (c) => String(c.fields.Bopomofo || "").trim();
  const usable = (c) => single(c) && zyOf(c) && !/[\/,;]/.test(zyOf(c));
  const zySyls = (c) => zyOf(c).split(/\s+/);
  const MARK = /[ˊˇˋ˙]/;
  /* up to n words, each showing the sound in a DIFFERENT syllable; `tests` are tried in order, so a
     stricter test (ㄧ as the whole vowel, as in ㄋㄧˇ) is preferred to a looser one (ㄧ inside ㄧㄢ) */
  const pick = (tests, n, oneChar) => {
    const out = [], heard = new Set();
    for (const test of tests) for (const c of pool) {
      if (out.length >= n) break;
      if (!usable(c) || out.includes(c) || (oneChar && hanOf(c.hanzi).length !== 1)) continue;
      const hit = zySyls(c).find(test);
      if (!hit || heard.has(hit.replace(MARK, ""))) continue;
      heard.add(hit.replace(MARK, "")); out.push(c);
    }
    return out;
  };
  const zyRow = (c, test, hi) => {
    const zy = zySyls(c).map((s) => (test(s) ? (hi ? esc(s).split(hi).join("<b>" + hi + "</b>") : "<b>" + esc(s) + "</b>") : esc(s))).join(" ");
    return '<div class="uc-row"><span class="uc-rz"><span class="uc-tts uc-exsay" data-say="' + esc(c.hanzi) + '"></span>' + esc(c.hanzi) + "</span>"
      + '<span class="uc-rb">' + zy + '<span class="uc-rs">' + esc(c.pinyin) + "</span></span>"
      + '<span class="uc-rg">' + esc(glossOf(c)) + "</span></div>";
  };
  const add = (key, f) => cards.push({ id: idFor(id, key), num: String(cards.length + 1), key, type: "bopomofo",
    fields: Object.assign({ Symbol: "", Kind: "", "In pinyin": "", IPA: "", Says: "", Note: "", Origin: "", Examples: "" }, f) });
  const saysOf = (key) => { const r = pinRow.get(key); if (!r) fail("beginner-bopomofo.json names " + key + ", which beginner-pinyin.json has no row for"); return r.like || r.says; };

  for (const t of T.tones) {
    const p = pinRow.get("tone:" + t.tone);
    const test = t.tone === 1 ? (s) => !MARK.test(s) : (s) => s.includes(t.show);
    const ws = pick([test], 3, true);
    if (ws.length < 3) thin.push(t.key);
    add(t.key, { Symbol: t.show, Kind: "tone mark", "In pinyin": p.show + " · " + t.name, IPA: p.contour ? "pitch " + p.contour : "",
      Says: p.says, Note: t.note + (t.house ? " " + t.house : ""),
      Examples: rows("as in", ws.map((c) => zyRow(c, test, t.tone === 1 ? "" : t.show))) });
  }
  const ALL = T.combinations.map((r) => r.show);
  for (const r of T.symbols.concat(T.combinations)) {
    const s = r.show, alone = (x) => x.replace(MARK, "").replace(/^[ㄅ-ㄙ]/, "") === s, inside = (x) => x.includes(s);
    /* a lone medial is best heard as the whole vowel (ㄋㄧˇ), and a lone vowel outside a combination (ㄉㄚˋ, not ㄧㄚ) */
    const bareVowel = (x) => x.includes(s) && !ALL.some((k) => k !== s && x.includes(k));
    /* ㄝ never stands alone in Levels 1 to 3, only inside ㄧㄝ and ㄩㄝ: there, and only there, a vowel takes its combinations */
    let ws = r.kind === "consonant" || r.kind === "combination" ? pick([inside], 3) : pick([alone, bareVowel], 3);
    if (!ws.length) ws = pick([inside], 3);
    if (!ws.length) { left.push(s); continue; }
    if (ws.length < 3) thin.push(r.key + " (" + ws.length + ")");
    add(r.key, { Symbol: s, Kind: r.kind === "combination" ? "two symbols together" : "bopomofo " + (r.kind === "rhyme" ? "vowel" : r.kind),
      "In pinyin": r.pinyin, IPA: r.ipa, Says: r.pin ? saysOf(r.pin) : "", Note: r.note || "",
      Origin: r.origin ? r.origin.replace(/"([^"]*)"/g, "“$1”") : "",
      Examples: rows("as in", ws.map((c) => zyRow(c, inside, s))) });
  }
  const n = cards.length, nS = T.symbols.length, nC = T.combinations.length - left.length;
  const type = { id: "bopomofo", name: "Mandarin bopomofo", speechLang: "zh-CN",
    fields: ["Symbol", "Kind", "In pinyin", "IPA", "Says", "Note", "Origin", "Examples"],
    cards: [{ name: "Bopomofo → sound",
      front: '<div class="uc-ask">{{Kind}}</div><div class="uc-bpmf">{{Symbol}}</div>',
      back: '{{FrontSide}}<hr><div class="uc-pinyin">{{In pinyin}}</div>{{#IPA}}<div class="uc-cls">{{IPA}}</div>{{/IPA}}'
        + '{{#Says}}<div class="uc-field">{{Says}}</div>{{/Says}}{{#Note}}<div class="uc-note">{{Note}}</div>{{/Note}}'
        + '{{#Origin}}<div class="uc-note"><span class="uc-lab">the shape</span>{{Origin}}</div>{{/Origin}}'
        + '{{#Examples}}<div class="uc-rows">{{Examples}}</div>{{/Examples}}' }],
    css: BASE_CSS + `.uc-bpmf {
  font-family: ${HAN};
  font-size: 58px;
  font-weight: 400;
  line-height: 1.15;
}
.uc-cls {
  margin-top: 4px;
  font-family: ${PINYIN_FONT};
  font-size: 17px;
  opacity: 0.75;
}
.uc-note {
  max-width: 30em;
  margin: 10px auto 0;
  font-size: 13.5px;
  opacity: 0.8;
}
.uc-rb {
  font-family: ${HAN};
  font-size: 15px;
  min-width: 6em;
}
.uc-rb b {
  font-weight: 400;
  color: var(--zh, #C8453C);
}
.uc-rb .uc-rs {
  font-family: ${PINYIN_FONT};
}
` };
  const desc = "Bopomofo (zhuyin), the phonetic script taught in Taiwan and printed on every vocabulary card on this shelf beside the pinyin: "
    + n + " notes, one card each — the five tone marks, the " + nS + " symbols (21 consonants, 13 vowels and the three medials ㄧ ㄨ ㄩ) and the "
    + nC + " two-symbol combinations, several of which pinyin spells in a way the symbols do not suggest (ㄧㄡ is <i>-iu</i>, ㄨㄥ is <i>-ong</i>, ㄩㄥ is <i>-iong</i>). The front shows the "
    + "symbol; the back gives its pinyin, its sound in the International Phonetic Alphabet, how the sound is made, the character the shape comes from, "
    + "and up to three words from the Level 1 to 3 decks written in bopomofo, with a speaker beside each and the symbol picked out. THE ORDER is "
    + "the article's: tones, consonants (ㄅ ㄆ ㄇ ㄈ …), vowels, medials, combinations. Pinyin and tones is the deck to start with; this one is for a learner who "
    + "reads Taiwanese materials or types with a zhuyin keyboard. At the default of ten new cards a day it takes " + Math.ceil(n / 10) + " days. — WHAT IS NOT HERE: "
    + "ㄪ, ㄫ, ㄬ and ㄭ, which the article says are no longer used for Mandarin, and handwriting or stroke order. No description is written for this deck: "
    + "each is quoted, with a cut marked […]; a symbol with no exact pinyin counterpart (ㄛ, ㄝ) has no sound description, and a seal-script picture "
    + "in an origin is left out." + (left.length ? " " + left.join(", ") + " is left out: no word of Levels 1 to 3 has it." : "")
    + " — Symbols, origins, IPA, pinyin equivalents and tone notes: " + sourceLine(T.sources.bopomofo) + ". How each sound is made: "
    + sourceLine(P.sources.pinyin) + " (both CC BY-SA 4.0). Example words, bopomofo, readings and meanings: the HSK 3.0 Level 1 to 3 decks on this "
    + "shelf (the official HSK 3.0 vocabulary lists, and CC-CEDICT, CC BY-SA 4.0).";
  return { file: "Mandarin-Bopomofo.folio-deck.json", thin, left,
    deck: deckFile({ id, title: "Mandarin Chinese — Bopomofo",
      subtitle: n + " zhuyin symbols, tone marks and combinations — beside Pinyin and tones", desc,
      tags: ["chinese", "mandarin", "bopomofo", "zhuyin", "pronunciation"], types: { bopomofo: type } }, cards) };
}

/* =====================================================================================================
   2. THE PARTS LEVEL 1'S CHARACTERS SHARE
   ===================================================================================================== */
function partsOfLevel1() {
  /* each Level 1 character → the parts its card names, read off the simplified rows of `Characters` */
  const chars = new Map();
  for (const c of l1) {
    for (const row of String(c.fields.Characters || "").split('<div class="uc-ch').slice(1)) {
      if (/^[^>]*uc-chtr/.test(row)) continue;              // a traditional form's row
      const ch = strip((/<span class="uc-chc">(.*?)<\/span>/.exec(row) || [])[1]);
      if (!ch || chars.has(ch)) continue;
      const ps = [];
      for (const m of row.split('<span class="uc-pt">').slice(1)) {
        const g = strip((/<b>(.*?)<\/b>/.exec(m) || [])[1]), py = strip((/<span class="uc-ptp">(.*?)<\/span>/.exec(m) || [])[1]), en = strip((/<i>(.*?)<\/i>/.exec(m) || [])[1]);
        if (g) ps.push({ g, py, en });
      }
      chars.set(ch, ps);
    }
  }
  return chars;
}
const MIN_CHARS = 3, MAX_ROWS = 6;
/* Parts the Level 1 cards name but this deck does not card, each with its reason. The breakdowns are Make
   Me a Hanzi's as the cards carry them, and not every row of that table is a part worth a card. */
const SKIP_PART = { "丷": "the cards read it “ha” and gloss it “kwukyel”, a Korean reading mark, not a meaning" };
function buildParts() {
  const id = "hsk30cmp", chars = partsOfLevel1();
  const firstWord = new Map();                              // character → the first Level 1 note written with it
  l1.forEach((c) => hanOf(c.hanzi).forEach((ch) => { if (!firstWord.has(ch)) firstWord.set(ch, c); }));
  const parts = new Map();
  /* A character counts toward a part only where its card splits it in two or more: a card naming ONE
     part (气 → 亻, 不 → 一) has named a stroke group inside the character, not what it is written from. */
  for (const [ch, ps] of chars) if (ps.length >= 2) for (const g of new Set(ps.map((p) => p.g))) {
    if (SKIP_PART[g]) continue;
    if (!parts.has(g)) parts.set(g, { g, chars: [], py: new Map(), en: new Map() });
    const P = parts.get(g), p = ps.find((x) => x.g === g);
    P.chars.push(ch);
    P.py.set(p.py, (P.py.get(p.py) || 0) + 1); P.en.set(p.en, (P.en.get(p.en) || 0) + 1);
  }
  const top = (m) => [...m].sort((a, b) => b[1] - a[1])[0][0];
  const at = (ch) => l1Word.get(firstWord.get(ch).hanzi).i;
  const list = [...parts.values()].filter((P) => P.chars.length >= MIN_CHARS && top(P.en))
    .map((P) => { P.chars.sort((a, b) => at(a) - at(b)); P.first = at(P.chars[0]); return P; })
    .sort((a, b) => a.first - b.first || b.chars.length - a.chars.length);
  const cards = list.map((P, i) => {
    const shown = P.chars.slice(0, MAX_ROWS).map((ch) => {
      const c = firstWord.get(ch);
      return '<div class="uc-row"><span class="uc-rc">' + esc(ch) + '</span><span class="uc-rz"><span class="uc-tts uc-exsay" data-say="' + esc(c.hanzi) + '"></span>'
        + esc(c.hanzi) + '</span><span class="uc-rp">' + esc(c.pinyin) + '</span><span class="uc-rg">' + esc(glossOf(c)) + "</span></div>";
    });
    return { id: idFor(id, P.g), num: String(i + 1), key: P.g, type: "hanzipart", fields: {
      Part: P.g, Reading: top(P.py), Meaning: top(P.en),
      Count: "in " + P.chars.length + " of Level 1's " + chars.size + " characters" + (P.chars.length > MAX_ROWS ? ", the first " + MAX_ROWS + " here" : ""),
      Chars: rows("characters written with it, and their first word", shown) } };
  });
  const covered = [...chars.values()].filter((ps) => ps.length >= 2 && ps.some((p) => list.some((P) => P.g === p.g))).length;
  const type = { id: "hanzipart", name: "Mandarin character parts", speechLang: "zh-CN",
    fields: ["Part", "Reading", "Meaning", "Count", "Chars"],
    cards: [{ name: "Part → meaning",
      front: '<div class="uc-ask">Character part</div><div class="uc-part">{{Part}}</div>',
      back: '{{FrontSide}}<hr>{{#Reading}}<div class="uc-pinyin">{{Reading}}</div>{{/Reading}}<div class="uc-field">{{Meaning}}</div>'
        + '<div class="uc-count">{{Count}}</div>{{#Chars}}<div class="uc-rows">{{Chars}}</div>{{/Chars}}' }],
    css: BASE_CSS + `.uc-part {
  font-family: ${HAN};
  font-size: 58px;
  font-weight: 400;
  line-height: 1.15;
}
.uc-count {
  margin-top: 10px;
  font-size: 12.5px;
  opacity: 0.65;
}
.uc-rc {
  font-family: ${HAN};
  font-weight: 400;
  font-size: 22px;
  line-height: 1.1;
  min-width: 26px;
  color: var(--zh, #C8453C);
}
` };
  const desc = "The " + cards.length + " parts that Level 1's characters are most often written from, one card each: every part found in at least "
    + MIN_CHARS + " of the " + chars.size + " characters on Level 1's fronts, counting a character where its Level 1 card splits it into two parts or more. " + covered + " of those " + chars.size + " characters contain at least one of them, so "
    + "a character met for the first time is rarely all new. The front shows the part; the back gives its reading and meaning, how many Level 1 "
    + "characters use it, and up to " + MAX_ROWS + " of them, each with the first Level 1 word it is written in, that word's reading and meaning, and a "
    + "speaker. THE ORDER is the order Level 1 first needs them: a part stands where the first word written with it stands in the Level 1 deck, "
    + "so studied a few cards a day beside that deck it arrives before, or with, its first character. At the default of ten new cards a day the "
    + "deck takes " + Math.ceil(cards.length / 10) + " days. — WHAT IS NOT HERE: stroke order, and the " + [...parts.values()].filter((P) => P.chars.length < MIN_CHARS).length
    + " parts found in only one or two Level 1 characters, which the Level 1 cards themselves show. A part is listed as the Level 1 cards "
    + "break their characters down, one level deep. — Parts, their readings and meanings: Make Me a Hanzi, as carried on the HSK 3.0 Level 1 "
    + "cards. Words, readings and meanings: the HSK 3.0 Level 1 deck on this shelf (the official HSK 3.0 vocabulary lists, and CC-CEDICT, CC BY-SA 4.0).";
  return { file: "Mandarin-Level-1-Character-Parts.folio-deck.json", covered, chars: chars.size,
    deck: deckFile({ id, title: "Mandarin Chinese — Character parts for Level 1",
      subtitle: "The " + cards.length + " parts Level 1's characters share — beside Level 1", desc,
      tags: ["chinese", "mandarin", "characters", "radicals", "writing"], types: { hanzipart: type } }, cards) };
}

/* =====================================================================================================
   3. FIRST PHRASES
   ===================================================================================================== */
function readPhrases() { return JSON.parse(fs.readFileSync(PHR_TABLE, "utf8")); }
function writePhrases(T) {
  const line = (r) => "  " + JSON.stringify(r);
  fs.writeFileSync(PHR_TABLE, '{\n"_": ' + JSON.stringify(T._) + ',\n"cedict": ' + JSON.stringify(T.cedict) + ',\n"rows": [\n'
    + T.rows.map(line).join(",\n") + '\n],\n"sentences": [\n' + T.sentences.map(line).join(",\n") + "\n]\n}\n");
}
/* the checks a row must pass whether it is being captured or built */
function rowFaults(r) {
  const out = [];
  if (carded.has(r.w)) out.push("already carded in " + carded.get(r.w));
  const off = hanOf(r.w).filter((ch) => !l1Chars.has(ch));
  if (off.length) out.push("uses " + off.join("") + ", which Level 1 does not");
  /* the printed reading is CC-CEDICT's, but for 一 and 不 (said with another tone) and a dropped capital */
  const want = numbered(r.c).split(" "), got = r.py.split(" "), han = hanOf(r.w);
  if (want.length !== got.length || want.length !== han.length) out.push("reading " + r.py + " against " + r.c);
  else want.forEach((s, i) => {
    const a = r.lower ? s.toLowerCase() : s;
    if (a === got[i]) return;
    if ((han[i] === "一" || han[i] === "不") && bare(a) === bare(got[i])) return;
    out.push("syllable " + (i + 1) + ": " + got[i] + " against CC-CEDICT's " + s);
  });
  return out;
}
function capture(file) {
  const T = readPhrases(), ced = new Map(), head = {};
  for (const l of fs.readFileSync(file, "utf8").split("\n")) {
    if (l[0] === "#") { const m = /^#! (\w+)=(.*)$/.exec(l.trim()); if (m) head[m[1]] = m[2]; continue; }
    const m = /^(\S+) (\S+) \[(.*?)\] \/(.*)\/\s*$/.exec(l);
    if (m) { const k = m[2] + "\u0000" + m[3]; if (!ced.has(k)) ced.set(k, { trad: m[1], senses: m[4].split("/") }); }
  }
  if (!head.date || ced.size < 100000) fail(file + " does not look like CC-CEDICT (" + ced.size + " entries)");
  T.cedict = { date: head.date, entries: Number(head.entries) || ced.size, licence: "CC BY-SA 4.0", from: "https://www.mdbg.net/chinese/dictionary?page=cc-cedict" };
  const bad = [];
  for (const r of T.rows) {
    const e = ced.get(r.w + "\u0000" + r.c);
    if (!e) { bad.push(r.w + " [" + r.c + "]: no such CC-CEDICT entry"); continue; }
    const picked = r.pick.map((i) => e.senses[i]);
    if (picked.some((s) => !s || /^CL:/.test(s))) { bad.push(r.w + ": pick " + JSON.stringify(r.pick) + " of " + JSON.stringify(e.senses)); continue; }
    r.trad = e.trad === r.w ? "" : e.trad;
    r.senses = picked;
    const cl = e.senses.filter((s) => /^CL:/.test(s)).flatMap((s) => s.slice(3).split(",").map((x) => (/\|?([^\[|]+)\[/.exec(x) || [])[1]).filter(Boolean));
    if (cl.length) r.mw = cl; else delete r.mw;
    rowFaults(r).forEach((f) => bad.push(r.w + ": " + f));
  }
  if (bad.length) fail(bad.length + " row(s) refused:\n        " + bad.join("\n        "));
  writePhrases(T);
  console.log("captured " + T.rows.length + " rows from CC-CEDICT of " + head.date);
}

function buildPhrases() {
  const T = readPhrases(), id = "hsk30fst";
  if (!T.cedict || !T.cedict.date) fail("beginner-phrases.json has no captured CC-CEDICT rows — run --capture <cedict file>");
  const bad = [];
  /* what the corpus already knows, so nothing here is typed twice: a syllable's zhuyin, a character's
     breakdown rows, a measure word's rendering */
  const zhuyin = new Map(), chRow = new Map(), chRowTr = new Map(), mwItem = new Map();
  for (const d of nine) for (const c of d.cards) {
    const f = c.fields || {};
    if (single(c) && f.Bopomofo) {
      /* a syllable's zhuyin, by majority over the corpus — but not from a 一 or 不 written with its
         changed tone (bú, yí, yì), whose zhuyin keeps the dictionary's */
      const ps = sylsOf(c), zs = String(f.Bopomofo).trim().split(/\s+/), hz = hanOf(c.hanzi);
      if (ps.length === zs.length) ps.forEach((s, i) => {
        const k = s.toLowerCase();
        if (hz.length === ps.length && ((hz[i] === "不" && toneOf(k) === 2) || (hz[i] === "一" && (toneOf(k) === 2 || toneOf(k) === 4)))) return;
        if (!zhuyin.has(k)) zhuyin.set(k, new Map());
        const m = zhuyin.get(k); m.set(zs[i], (m.get(zs[i]) || 0) + 1);
      });
    }
    for (const row of String(f.Characters || "").split(/(?=<div class="uc-ch[ "])/)) {
      const ch = strip((/<span class="uc-chc">(.*?)<\/span>/.exec(row) || [])[1]);
      if (!ch) continue;
      const tr = /^<div class="uc-ch[^"]*uc-chtr/.test(row), body = row.replace(/^<div class="[^"]*">/, "");
      const m = tr ? chRowTr : chRow;
      if (!m.has(ch)) m.set(ch, body);
    }
    for (const it of String(f["Measure word"] || "").split(/(?=<span class="uc-mwi">)/)) {
      const ch = (/^<span class="uc-mwi"><span class="uc-mwc">([^<]*)<\/span>/.exec(it) || [])[1];
      if (ch && !mwItem.has(ch)) mwItem.set(ch, it);
    }
  }
  const zyTop = (k) => { const m = zhuyin.get(k); return m ? [...m].sort((a, b) => b[1] - a[1])[0][0] : null; };
  /* A NEUTRAL SYLLABLE (CC-CEDICT's tone 5) is the same syllable in any tone with its tone mark replaced
     by ˙. It is not read off the corpus, whose pinyin is the syllabus's and whose zhuyin is CC-CEDICT's,
     so that a syllable the syllabus leaves neutral often carries a full tone in its zhuyin (下 in 一下 is
     "xia" and ㄒㄧㄚˋ). The rule is checked against the two decks whose pinyin IS CC-CEDICT's. */
  const neutralOf = (k) => { for (let t = 1; t <= 4; t++) { const z = zyTop(withTone(k, t)); if (z) return z.replace(/[ˊˇˋ]$/, "") + "˙"; } return null; };
  for (const d of nine) if (d.meta.id === "hsk30phr" || d.meta.id === "hsk30idm") for (const c of d.cards) {
    if (!single(c) || !c.fields.Bopomofo) continue;
    const ps = sylsOf(c), zs = String(c.fields.Bopomofo).trim().split(/\s+/);
    if (ps.length === zs.length) ps.forEach((x, i) => { const k = x.toLowerCase(); if (toneOf(k) === 5 && /^[a-zü]+$/.test(k) && neutralOf(k) && neutralOf(k) !== zs[i]) bad.push("zhuyin rule: " + c.hanzi + " " + k + " is " + zs[i] + ", the rule gives " + neutralOf(k)); });
  }
  const zy = (s) => { const k = s.toLowerCase(); return toneOf(k) === 5 ? neutralOf(k) : zyTop(k); };
  const charsHTML = (simp, trad) => {
    const out = [], seenS = new Set();
    for (const ch of hanOf(simp)) { if (seenS.has(ch)) continue; seenS.add(ch); if (!chRow.has(ch)) return ""; out.push('<div class="uc-ch">' + chRow.get(ch)); }
    const seenT = new Set(); let first = true;
    for (const ch of hanOf(trad || "")) {
      if (seenS.has(ch) || seenT.has(ch)) continue; seenT.add(ch);
      if (!chRowTr.has(ch)) continue;
      out.push('<div class="uc-ch uc-chtr' + (first ? " uc-chgap" : "") + '">' + chRowTr.get(ch)); first = false;
    }
    return out.join("");
  };

  /* example sentences: the decks' own, where the phrase stands as a word of the sentence and not inside
     a longer one (不是 in 是不是), easiest first */
  const words = new Set(carded.keys()); T.rows.forEach((r) => words.add(r.w));
  const l1Set = new Set(l1.map((c) => c.hanzi)); T.rows.forEach((r) => l1Set.add(r.w));
  const maxLen = 8;
  const tokens = (s, set) => {                              // [{ w, at }] — longest match, `at` in characters
    const t = [...s], out = [];
    for (let i = 0; i < t.length;) {
      if (!isHan(t[i])) { i++; continue; }
      let w = t[i];
      for (let n = Math.min(maxLen, t.length - i); n >= 2; n--) { const cand = t.slice(i, i + n).join(""); if (set.has(cand)) { w = cand; break; } }
      out.push({ w, at: i }); i += [...w].length;
    }
    return out;
  };
  const l1Only = new Set(l1.map((c) => c.hanzi));
  /* A sentence shows a phrase only where the phrase is a word OF it. Three guards, each for a case the
     first run produced: it must be a token when the phrases are in the vocabulary (不是 inside 是不是
     is not); its ends must fall on word boundaries when they are not (明天见 inside 明天见面 does not);
     and a 不… phrase must not be the second half of a verb-not-verb question (不可以 in 可不可以). A
     row the guards cannot settle names its sentences itself (`ex`), or takes none (`ex: false`). */
  const bank = [], seenZh = new Set(), deckWords = new Set(carded.keys());
  for (const src of [L.hsk30l1, L.hsk30l2, L.hsk30l3]) for (const c of src.cards) for (const p of pairsOf(c)) {
    if (seenZh.has(p.zh)) continue; seenZh.add(p.zh);
    const tk = tokens(p.zh, words), plain = tokens(p.zh, deckWords);
    const cuts = new Set(); plain.forEach((x) => { cuts.add(x.at); cuts.add(x.at + [...x.w].length); });
    bank.push({ zh: p.zh, en: p.en, tk, cuts, hard: tk.filter((x) => !l1Set.has(x.w)).length, len: hanOf(p.zh).length });
  }
  const shows = (b, w) => {
    const hit = b.tk.find((x) => x.w === w);
    if (!hit) return -1;
    const t = [...b.zh], n = [...w].length;
    if (!b.cuts.has(hit.at) || !b.cuts.has(hit.at + n)) return -1;
    if (w[0] === "不" && t[hit.at - 1] === [...w][1]) return -1;
    return hit.at;
  };
  const exBlock = (b, w, at) => {
    const t = [...b.zh], n = [...w].length;
    return '<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" data-say="' + esc(b.zh) + '"></span>'
      + esc(t.slice(0, at).join("")) + "<b>" + esc(w) + "</b>" + esc(t.slice(at + n).join("")) + '</div><div class="uc-exe">' + esc(b.en) + "</div></div>";
  };
  const exFor = (r) => {
    if (r.ex === false) return "";
    if (Array.isArray(r.ex)) return r.ex.map((zh) => {
      const b = bank.find((x) => x.zh === zh), at = b ? [...zh].join("").indexOf(r.w) : -1;
      if (!b || at < 0) { bad.push(r.w + ": the decks carry no sentence “" + zh + "” holding it"); return ""; }
      return exBlock(b, r.w, [...zh.slice(0, at)].length);
    }).join("");
    return bank.map((b) => ({ b, at: shows(b, r.w) })).filter((x) => x.at >= 0 && x.b.len <= 12 && hanOf(x.b.zh).join("") !== r.w)
      .sort((x, y) => x.b.hard - y.b.hard || x.b.len - y.b.len || (x.b.zh < y.b.zh ? -1 : 1)).slice(0, 3)
      .map((x) => exBlock(x.b, r.w, x.at)).join("");
  };

  const note = (key, f, mirror) => Object.assign({ id: idFor(id, key), num: "", key, category: "First phrases",
    question: f.Simplified + (f.Traditional ? " / " + f.Traditional : ""), answer: f.Pinyin + " — " + mirror, answerDate: "", answerText: mirror,
    traditional: f.Traditional, hanzi: f.Simplified, pinyin: f.Pinyin, translations: "", abstract: "", citation: "", type: "hsk" }, { fields: f });
  const byRow = new Map(), stats = { ex0: 0, ex: 0 };
  for (const r of T.rows) {
    if (!r.senses || !r.senses.length) { bad.push(r.w + ": not captured"); continue; }
    rowFaults(r).forEach((f) => bad.push(r.w + ": " + f));
    const bo = numbered(r.c).split(" ").map((s) => zy(s));
    if (bo.some((z) => !z)) { bad.push(r.w + ": no zhuyin in the decks for " + numbered(r.c)); continue; }
    if (r.hint && !carded.has(r.hint) && !T.rows.some((x) => x.w === r.hint)) bad.push(r.w + ": hint names " + r.hint + ", which nothing cards");
    const mw = (r.mw || []).map((ch) => mwItem.get(ch));
    if (mw.some((x) => !x)) { bad.push(r.w + ": a measure word the decks have never rendered"); continue; }
    const ex = exFor(r); if (ex) stats.ex++; else stats.ex0++;
    byRow.set(r.w, note(r.w, {
      Simplified: r.w, Traditional: r.trad || "", Pinyin: r.py, Bopomofo: bo.join(" "),
      "Measure word": mw.length ? '<span class="uc-mwlab">measure word</span>' + mw.join("") : "",
      English: (r.hint ? '<div class="uc-pos">not ' + esc(r.hint) + "</div>" : "") + r.senses.map((s) => '<div class="uc-sense">' + esc(s) + "</div>").join(""),
      Characters: charsHTML(r.w, r.trad), Examples: ex,
    }, r.senses.join("; ")));
  }
  const after = new Map();
  for (const s of T.sentences) {
    const i = s.from.indexOf("/"), deckId = s.from.slice(0, i), word = s.from.slice(i + 1);
    const src = (L[deckId] || { cards: [] }).cards.find((c) => c.hanzi === word);
    const pair = src && pairsOf(src).find((p) => p.zh === s.zh);
    if (!pair) { bad.push(s.zh + ": " + s.from + " carries no such sentence"); continue; }
    /* the reading is each word's own Level 1 reading, in order */
    const tk = tokens(s.zh, l1Only).map((x) => x.w), want = [];
    let ok = true;
    for (const w of tk) { const e = l1Word.get(w); if (!e) { ok = false; bad.push(s.zh + ": " + w + " is not a Level 1 word"); break; } want.push(e.c.pinyin.split(" / ")[0]); }
    if (ok && want.join(" ").toLowerCase() !== s.py.replace(/,/g, "").toLowerCase()) bad.push(s.zh + ": reading " + s.py + " against the cards' " + want.join(" "));
    /* …and the zhuyin is each word's own, as its Level 1 card gives it */
    const bo = ok ? tk.map((w) => String(l1Word.get(w).c.fields.Bopomofo || "").split(" / ")[0]) : [null];
    if (bo.some((z) => !z)) { bad.push(s.zh + ": a word with no zhuyin on its Level 1 card"); continue; }
    const key = hanOf(s.zh).join("");
    const n = note(key, { Simplified: s.zh, Traditional: "", Pinyin: s.py, Bopomofo: bo.join(" "), "Measure word": "",
      English: '<div class="uc-sense">' + esc(pair.en) + "</div>", Characters: charsHTML(s.zh, ""), Examples: "" }, pair.en);
    if (!after.has(s.after)) after.set(s.after, []);
    after.get(s.after).push(n);
  }
  if (bad.length) fail(bad.length + " First phrases row(s) refused:\n        " + bad.join("\n        "));
  const cards = [];
  for (const r of T.rows) { cards.push(byRow.get(r.w)); (after.get(r.w) || []).forEach((n) => cards.push(n)); }
  for (const k of after.keys()) if (!byRow.has(k)) fail("a sentence is placed after " + k + ", which is not a row");
  cards.forEach((c, i) => { c.num = String(i + 1); });

  const nS = T.sentences.length, nR = T.rows.length;
  const desc = cards.length + " things a beginner can already say with Level 1's words, none of them a card in any other deck here: the replies "
    + "(不是, 没问题, 太好了), the days of the week (the syllabus lists only 星期 and Sunday), last and next week and month, the plain negatives "
    + "(不会, 不能, 不在), a few numbers, people, and everyday actions (吃饭, 回家, 买东西) — and " + nS + " whole first questions and answers (你叫什么名字？ "
    + "这个多少钱？). Every one is written only with characters the Level 1 deck uses. " + cards.length + " notes, each with TWO cards — Chinese → English "
    + "and English → Chinese — each scheduled on its own. THE ORDER is a teaching order: replies and courtesies, the first questions, the days, "
    + "time, asking and saying no, counting, people, actions, places. Study it beside or after Level 1; at the default of ten new cards a day, "
    + "both directions together, it takes " + Math.ceil(cards.length / 5) + " days. — The card is the vocabulary decks' card: simplified and traditional forms, "
    + "pinyin, bopomofo, the meaning, each character broken into its parts, and up to three example sentences with a speaker. The pinyin writes "
    + "一 and 不 with the tone they are said with (bú shì, yí ge), as the Level 1 deck does; the bopomofo keeps the dictionary's tone. " + stats.ex0
    + " of the " + nR + " phrases have no short example sentence in the decks and show none. — WHAT IS NOT HERE: anything the dictionary has no entry for. "
    + "你好吗, 多少钱 on its own, 不知道, 好的 and 我爱你 are not CC-CEDICT headwords, so they are not carded; the " + nS + " sentences are here because the "
    + "Level 1 deck already carries each of them, with its translation. Nothing was composed. — Headwords, traditional forms and meanings: "
    + "CC-CEDICT, release of " + T.cedict.date.slice(0, 10) + " (CC BY-SA 4.0), its senses quoted unaltered. Character parts and their meanings: Make Me a "
    + "Hanzi. Sentences and their translations: Tatoeba (tatoeba.org), CC BY 2.0 FR, as carried by the HSK 3.0 decks on this shelf.";
  return { file: "Mandarin-First-Phrases.folio-deck.json", stats,
    deck: deckFile({ id, title: "Mandarin Chinese — First phrases",
      subtitle: cards.length + " replies, days and first questions made of Level 1's words — beside Level 1", desc,
      tags: ["chinese", "mandarin", "phrases", "beginner", "conversation"],
      types: JSON.parse(JSON.stringify(L.hsk30l1.meta.types)) }, cards) };
}

/* ===================================================================================================== */
if (CAPTURE) { capture(CAPTURE); process.exit(0); }
const built = [buildPinyin(), buildBopomofo(), buildParts(), buildPhrases()];
if (REPORT) {
  for (const b of built) {
    console.log("\n" + b.file + "  (" + b.deck.cards.length + " notes)\n  " + b.deck.meta.subtitle);
    console.log("  " + b.deck.cards.map((c) => c.key).join(" "));
    if (b.thin && b.thin.length) console.log("  fewer than three example words: " + b.thin.join(", "));
    if (b.left && b.left.length) console.log("  left out, no example word: " + b.left.join(", "));
    if (b.stats) console.log("  phrases with examples " + b.stats.ex + ", without " + b.stats.ex0);
    if (b.covered) console.log("  " + b.covered + " of Level 1's " + b.chars + " characters contain one of these parts");
  }
  process.exit(0);
}
let stale = 0;
for (const b of built) {
  const p = path.join(DIR, b.file), text = JSON.stringify(b.deck);
  const cur = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
  if (cur === text) { console.log("  unchanged " + b.file + "  (" + b.deck.cards.length + " notes)"); continue; }
  stale++;
  if (CHECK) console.log("  STALE     " + b.file);
  else { fs.writeFileSync(p, text); console.log("  wrote     " + b.file + "  (" + b.deck.cards.length + " notes)"); }
}
if (CHECK) {
  if (stale || pinChanged) { console.log("\n  FAIL  the beginner decks are not what the tables and the shipped decks give — run without --check"); process.exit(1); }
  console.log("  ok    the four beginner decks are current");
} else if (pinChanged) { writePin(); console.log("  mandarin-ids.json: new rows written"); }
