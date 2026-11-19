#!/usr/bin/env node
"use strict";
/*
  urdu-order.js — HOW urdu-order.json IS COMPUTED (Nov 2026, the Urdu beginner pass — docs/lang-decks.md).
  Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/urdu-order.js [--check] [--report]

  It reads the Urdu decks AS urdu-fix.js LEFT THEM (so the record's added cards are in place) and the pin,
  and writes the order of three decks. The order is computed from the PINNED NUMBER — the generator's
  frequency rank, which never changes — and never from the order the file happens to be in, so running it
  twice, or after the order has been applied, gives the same list. `urdu-fix.js` applies the list.

  URDU A1. The generator deals a level by lemma frequency: day one was کا · میں · ہونا · کرنا · سے, thank
  you was note 137, one to ten ran from note 11 to note 416 and "hello" was on another deck. So:
    · HEAD, written by hand: the greetings and courtesies, a first exchange (how are you, I am fine too,
      what is your name), the pronouns and the possessives, the postpositions, fourteen verbs, the
      question words, zero to ten, the other possessives and four more greetings. A word must be met
      before the sentence that uses it (بھی before میں بھی ٹھیک ہوں).
    · then every other card in frequency order, with each CLOSED SET together and in its own order at a
      note number written here: eleven to a thousand from note 101 and the ordinals behind them, the days
      from 151 and the months behind them, the colours from 201 (left where its commonest member stood, a
      set waited for that word's rank: the days were notes 376 to 473).
    · AFTER: a card placed straight after another (a sentence after its rarest word).
  A card the record added that is named in none of these is an ERROR: it has no frequency rank to fall to.

  URDU A2. The generator's order, then the compound numbers twenty-one to ninety-nine in order (their
  pinned numbers are 751 on, in that order).

  THE PHRASES. Inside each subdeck (Phrases, Idioms, Proverbs — the app deals subdecks side by side), by
  the lowest level whose cards spell every word of the expression, a form counting only if a card shows it
  (A1, A2, B1, B2, then the expressions that use a word no level cards); inside a tier, the generator's
  order. `--report` prints the tiers.

  B1, B2 and the alphabet have no entry: they keep the order the generator wrote.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const IDS_FILE = path.join(__dirname, "urdu-ids.json"), ORD_FILE = path.join(__dirname, "urdu-order.json");
const CHECK = process.argv.includes("--check"), REPORT = process.argv.includes("--report");
const die = (m) => { console.log("FAIL  " + m); process.exit(1); };
const W = (s) => s.trim().split(/\s*\|\s*/);

const HEAD = W(`سلام علیکم | شکریہ | ہاں | جی | جی ہاں |
  نہیں | خدا حافظ | اللہ حافظ | آداب | معاف |
  ٹھیک | میں | آپ | ہونا | نام |
  کیا | اچھا | بھی | کیا حال ہے | میں بھی ٹھیک ہوں |
  میرا | آپ کا | آپ کا نام کیا ہے | تم | وہ |
  یہ | ہم | تو | کا | کو |
  سے | پر | کے لئے | کے ساتھ | اور |
  کرنا | جانا | آنا | رہنا | دینا |
  لینا | سکنا | چاہنا | کھانا | پینا |
  بولنا | کہنا | دیکھنا | کون | کہاں |
  کب | کیسے | کیوں | کتنا | کون سا |
  صفر | ایک | دو | تین | چار |
  پانچ | چھ | سات | آٹھ | نو |
  دس | تمہارا | ہمارا | اپنا | اس کا |
  ان کا | صبح بخیر | شب بخیر | خوش آمدید | کوئی مسئلہ نہیں`);

// a closed set, in its own order: `at` is the note number its first card takes, `after` puts it straight
// behind another card. In ascending order of place, so that an `at` stays where it says.
const SETS = [
  { name: "eleven to a thousand", at: 101, words: W("گیارہ | بارہ | تیرہ | چودہ | پندرہ | سولہ | سترہ | اٹھارہ | انیس | بیس | تیس | چالیس | پچاس | ساٹھ | ستر | اسی | نوے | سو | ہزار") },
  { name: "the ordinals", after: "ہزار", words: W("پہلا | دوسرا | تیسرا") },
  { name: "the days", at: 151, words: W("پیر | منگل | بدھ | جمعرات | جمعہ | ہفتہ | اتوار") },
  { name: "the months", after: "اتوار", words: W("جنوری | فروری | مارچ | اپریل | مئی | جون | جولائی | اگست | ستمبر | اکتوبر | نومبر | دسمبر") },
  { name: "the colours", at: 201, words: W("رنگ | سفید | کالا | لال | نیلا | ہرا | پیلا") },
  { name: "a sentence after its rarest word", after: "سوال", words: ["میرا ایک سوال ہے"] },
];

const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8"));
const load = (file) => JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"));
const FILES = { urdua1: "Urdu-A1.folio-deck.json", urdua2: "Urdu-A2.folio-deck.json", urdub1: "Urdu-B1.folio-deck.json", urdub2: "Urdu-B2.folio-deck.json", urphrase: "Urdu-Phrases-and-Expressions.folio-deck.json" };
const D = {};
for (const id of Object.keys(FILES)) { D[id] = load(FILES[id]); if (D[id].meta.id !== id || !D[id].meta.types.urdu) die(FILES[id] + " is not the Urdu deck " + id); }
const GENERATED = { urdua1: 500, urdua2: 750 }; // the numbers the generator deals; the record's are above

// ---- A1 --------------------------------------------------------------------------------------------------
function orderA1() {
  const pin = PIN.urdua1, keys = D.urdua1.cards.map((c) => c.fields.Word), have = new Set(keys);
  for (const w of HEAD) if (!have.has(w)) die("A1 head: " + w + " is not a card of Urdu A1");
  if (new Set(HEAD).size !== HEAD.length) die("A1 head: a word is named twice");
  const placed = new Set(HEAD);
  for (const s of SETS) for (const w of s.words) { if (!have.has(w)) die("A1 set " + s.name + ": " + w + " is not a card of Urdu A1"); }
  const inSet = new Set(SETS.flatMap((s) => s.words.filter((w) => !placed.has(w))));
  for (const k of keys) if (pin[k] > GENERATED.urdua1 && !placed.has(k) && !inSet.has(k)) die("A1: " + k + " was added by the record and is named in neither the head nor a set");
  let rest = keys.filter((k) => !placed.has(k) && !inSet.has(k)).sort((a, b) => pin[a] - pin[b]);
  for (const s of SETS) {
    const members = s.words.filter((w) => !placed.has(w));
    if (!members.length) continue;
    let at;
    if (s.after) {
      at = rest.indexOf(s.after);
      if (at < 0) die("A1 set " + s.name + ": its anchor " + s.after + " is not placed before it");
      at += 1;
    } else if (s.at) {
      at = s.at - 1 - HEAD.length;
      if (at < 0 || at > rest.length) die("A1 set " + s.name + ": note " + s.at + " is not in the frequency part");
    } else die("A1 set " + s.name + ": it needs `at` or `after`");
    rest = rest.slice(0, at).concat(members, rest.slice(at));
    members.forEach((w) => placed.add(w));
  }
  const out = HEAD.concat(rest);
  for (const s of SETS) if (s.at && out[s.at - 1] !== s.words.filter((w) => !HEAD.includes(w))[0]) die("A1 set " + s.name + ": a later set moved it from note " + s.at + " — keep SETS in ascending order of place");
  return out;
}

// ---- A2 --------------------------------------------------------------------------------------------------
const orderA2 = () => D.urdua2.cards.map((c) => c.fields.Word).sort((a, b) => PIN.urdua2[a] - PIN.urdua2[b]);

// ---- the phrases -----------------------------------------------------------------------------------------
const fold = (s) => s.normalize("NFC").replace(/[ً-ْٰ‌‍ـ]/g, "").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/ه/g, "ہ");
const toks = (s) => fold(s).split(/[^ؠ-ٟٮ-ۓە-ۯۺ-ۿ]+/).filter(Boolean);
function tiers() {
  const known = new Set(), level = {};
  for (const id of ["urdua1", "urdua2", "urdub1", "urdub2"]) {
    for (const c of D[id].cards) for (const m of (c.fields.Urdu + c.fields.Forms + c.fields.Table).matchAll(/lang="ur">([^<]*)</g)) for (const t of toks(m[1])) known.add(t);
    level[id] = new Set(known);
  }
  const out = {};
  for (const c of D.urphrase.cards) {
    const ts = toks(c.fields.Word);
    out[c.fields.Word] = ["urdua1", "urdua2", "urdub1", "urdub2"].findIndex((id) => ts.every((t) => level[id].has(t)));
    if (out[c.fields.Word] < 0) out[c.fields.Word] = 4;
  }
  return out;
}
const SUBS = ["Phrases", "Idioms", "Proverbs"];
function orderPhrases(t) {
  const pin = PIN.urphrase;
  return D.urphrase.cards.slice().sort((a, b) => SUBS.indexOf(a.sub) - SUBS.indexOf(b.sub) || t[a.fields.Word] - t[b.fields.Word] || pin[a.fields.Word] - pin[b.fields.Word]).map((c) => c.fields.Word);
}

const T = tiers();
const ORDER = { urdua1: orderA1(), urdua2: orderA2(), urphrase: orderPhrases(T) };
const text = "{\n" + Object.keys(ORDER).map((k) => JSON.stringify(k) + ": " + JSON.stringify(ORDER[k])).join(",\n") + "\n}\n";

if (REPORT) {
  const a1 = ORDER.urdua1, at = (w) => a1.indexOf(w) + 1, day = (n) => Math.ceil(n / 5);
  const show = (label, ws) => console.log(label + ": " + ws.map((w) => w + " " + at(w) + " (day " + day(at(w)) + ")").join(" · "));
  console.log("Urdu A1, " + a1.length + " notes, " + day(a1.length) + " days at five notes a day");
  for (let d = 0; d < 4; d++) console.log("  day " + (d + 1) + ": " + a1.slice(d * 5, d * 5 + 5).join(" · "));
  show("courtesies", W("سلام علیکم | شکریہ | خدا حافظ | آداب | معاف | کیا حال ہے | آپ کا نام کیا ہے | میں بھی ٹھیک ہوں | صبح بخیر"));
  show("verbs", W("ہونا | کرنا | بولنا")); show("question words", W("کیا | کون | کون سا"));
  show("zero to ten", W("صفر | دس")); show("ergative", ["نے"]);
  for (const s of SETS) { const p = s.words.map(at); console.log(s.name + ": notes " + Math.min(...p) + "–" + Math.max(...p) + " (days " + day(Math.min(...p)) + "–" + day(Math.max(...p)) + ")"); }
  const n = [0, 0, 0, 0, 0]; for (const w of ORDER.urphrase) n[T[w]]++;
  console.log("phrases by the lowest level that spells them: A1 " + n[0] + ", A2 " + n[1] + ", B1 " + n[2] + ", B2 " + n[3] + ", no level " + n[4]);
}
const old = fs.existsSync(ORD_FILE) ? fs.readFileSync(ORD_FILE, "utf8") : "";
if (CHECK) {
  if (old !== text) die("urdu-order.json is not what urdu-order.js computes — run it, then urdu-fix.js");
  console.log("urdu-order --check: the order file is what the rules give");
} else if (old !== text) { fs.writeFileSync(ORD_FILE, text); console.log("wrote urdu-order.json — now run urdu-fix.js"); }
else console.log("urdu-order.json is current");
