#!/usr/bin/env node
"use strict";
/*
  turkish-order.js — HOW turkish-order.json IS COMPUTED (Nov 2026, the Turkish beginner pass —
  docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site. The Urdu model.

    node .claude/decks/turkish-order.js [--check] [--report]

  It reads the Turkish decks AS turkish-fix.js LEFT THEM (so the record's added cards are in place) and the
  pin, and writes the order of two decks. The order is computed from the PINNED NUMBER — the generator's
  frequency rank as first shipped, which never changes — and never from the order the file happens to be
  in, so running it twice, or after the order has been applied, gives the same list. `turkish-fix.js`
  applies the list.

  TURKISH A1. The generator deals a level by subtitle frequency: day one was bir · bu · ben · sen · o,
  merhaba was note 132, one to ten ran from note 1 to note 322, the days from 308 to 389, the months from
  364 to 433, and good evening, thank you and goodbye were on the phrases deck, last on the shelf. So:
    · HEAD, written by hand, five to a day: the greetings and courtesies, the pronouns, a first exchange
      (how are you, my name is, pleased to meet you), sorry and excuse me, this / that / what / who,
      var / yok / değil and the two particles written apart (mi, de), ten verbs and what one eats and
      drinks, the question words and here / there, zero to ten, five postpositions, and five formulas
      for a guest, a worker, a meal and the sick. A word is met before the phrase that uses it (ad before
      benim adım, saat before saat kaç, kadar before ne kadar).
    · then every other card in frequency order, with each CLOSED SET together and in its own order at a
      note number written here: twenty to a thousand from note 121 and the ordinals behind them, the days
      from 151, the months and the seasons from 161, the colours from 201, the compass points from 301.
  A card the record added that is named in none of these is an ERROR: it has no frequency rank to fall to.

  THE PHRASES. Inside each subdeck (Phrases, Idioms, Proverbs — the app deals subdecks side by side), by
  the lowest level whose cards spell every word of the expression, a form counting only if a card shows
  it (A1, A2, B1, B2, C1, then the expressions that use a word or a form no level shows); inside a tier,
  the pinned number, which is the order of Tatoeba's counts when the deck was first shipped. `--report`
  prints the tiers.

  A2, B1, B2 and C1 have no entry: `turkish-fix.js` keeps them in the order of their pinned numbers.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const IDS_FILE = path.join(__dirname, "turkish-ids.json"), ORD_FILE = path.join(__dirname, "turkish-order.json");
const CHECK = process.argv.includes("--check"), REPORT = process.argv.includes("--report");
const die = (m) => { console.log("FAIL  " + m); process.exit(1); };
const W = (s) => s.trim().split(/\s*\|\s*/);

const HEAD = W(`merhaba | selam | evet | hayır | teşekkür ederim |
  teşekkürler | lütfen | rica ederim | bir şey değil | tamam |
  günaydın | iyi günler | iyi akşamlar | iyi geceler | hoşça kal |
  güle güle | görüşürüz | ben | sen | o |
  biz | siz | nasılsın | nasılsınız | iyi |
  ad | benim adım | adınız ne | memnun oldum | affedersiniz |
  pardon | özür dilemek | sağ ol | buyurun | efendim |
  bu | şu | ne | kim | bir |
  var | yok | değil | mi | de |
  ve | ama | çok | güzel | kötü |
  olmak | etmek | yapmak | istemek | bilmek |
  gelmek | gitmek | almak | vermek | görmek |
  demek | söylemek | yemek | içmek | su |
  nerede | nereden | burada | burası | şurası |
  orası | nasıl | neden | kaç | kadar |
  ne kadar | hangi | saat | saat kaç | şimdi |
  sıfır | iki | üç | dört | beş |
  altı | yedi | sekiz | dokuz | on |
  için | ile | gibi | daha | zaman |
  hoş geldiniz | hoş bulduk | kolay gelsin | afiyet olsun | geçmiş olsun`);

// a closed set, in its own order: `at` is the note number its first card takes, `after` puts it straight
// behind another card. In ascending order of place, so that an `at` stays where it says.
const SETS = [
  { name: "twenty to a thousand", at: 121, words: W("yirmi | otuz | kırk | elli | altmış | yetmiş | seksen | doksan | yüz | bin") },
  { name: "the ordinals", after: "bin", words: W("birinci | ikinci | üçüncü | dördüncü | beşinci") },
  { name: "the days", at: 151, words: W("pazartesi | salı | çarşamba | perşembe | cuma | cumartesi | pazar | hafta sonu") },
  { name: "the months", at: 161, words: W("ocak | şubat | mart | nisan | mayıs | haziran | temmuz | ağustos | eylül | ekim | kasım | aralık") },
  { name: "the seasons", after: "aralık", words: W("mevsim | ilkbahar | yaz | sonbahar | kış") },
  { name: "the colours", at: 201, words: W("kırmızı | mavi | yeşil | sarı | siyah | beyaz | turuncu | mor | pembe | kahverengi | gri") },
  { name: "the compass points", at: 301, words: W("kuzey | güney | doğu | batı") },
];

const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8"));
const FILES = { turkisha1: "A1", turkisha2: "A2", turkishb1: "B1", turkishb2: "B2", turkishc1: "C1", trphrase: "Phrases-and-Expressions" };
const LEVELS = ["turkisha1", "turkisha2", "turkishb1", "turkishb2", "turkishc1"];
const D = {};
for (const id of Object.keys(FILES)) {
  const f = "Turkish-" + FILES[id] + ".folio-deck.json";
  D[id] = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  if (D[id].meta.id !== id || !D[id].meta.types.turkish) die(f + " is not the Turkish deck " + id);
}
const GENERATED = 500; // the numbers the generator deals to A1; the record's are above

// ---- A1 --------------------------------------------------------------------------------------------------
function orderA1() {
  const pin = PIN.turkisha1, keys = D.turkisha1.cards.map((c) => c.fields.Word), have = new Set(keys);
  for (const w of HEAD) if (!have.has(w)) die("A1 head: " + w + " is not a card of Turkish A1");
  if (new Set(HEAD).size !== HEAD.length) die("A1 head: a word is named twice");
  const placed = new Set(HEAD);
  for (const s of SETS) for (const w of s.words) if (!have.has(w)) die("A1 set " + s.name + ": " + w + " is not a card of Turkish A1");
  const inSet = new Set(SETS.flatMap((s) => s.words.filter((w) => !placed.has(w))));
  for (const k of keys) if (pin[k] > GENERATED && !placed.has(k) && !inSet.has(k)) die("A1: " + k + " was added by the record and is named in neither the head nor a set");
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

// ---- the phrases -----------------------------------------------------------------------------------------
const fold = (s) => s.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
const toks = (s) => fold(s).match(/[a-zçğıöşüâîû]+/g) || [];
const un = (s) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
function tiers() {
  const known = new Set(), level = [];
  for (const id of LEVELS) {
    for (const c of D[id].cards) {
      for (const t of toks(c.fields.Word)) known.add(t);
      for (const m of c.fields.Forms.matchAll(/class="uc-fl">[^<]*<\/span><b>([^<]*)</g)) for (const t of toks(un(m[1]))) known.add(t);
    }
    level.push(new Set(known));
  }
  const out = {};
  for (const c of D.trphrase.cards) {
    const ts = toks(c.fields.Word), i = level.findIndex((L) => ts.every((t) => L.has(t)));
    out[c.fields.Word] = i < 0 ? LEVELS.length : i;
  }
  return out;
}
const SUBS = ["Phrases", "Idioms", "Proverbs"];
function orderPhrases(t) {
  const pin = PIN.trphrase;
  return D.trphrase.cards.slice().sort((a, b) => SUBS.indexOf(a.sub) - SUBS.indexOf(b.sub) || t[a.fields.Word] - t[b.fields.Word] || pin[a.fields.Word] - pin[b.fields.Word]).map((c) => c.fields.Word);
}

const T = tiers();
const ORDER = { turkisha1: orderA1(), trphrase: orderPhrases(T) };
const text = "{\n" + Object.keys(ORDER).map((k) => JSON.stringify(k) + ": " + JSON.stringify(ORDER[k])).join(",\n") + "\n}\n";

if (REPORT) {
  const a1 = ORDER.turkisha1, at = (w) => a1.indexOf(w) + 1, day = (n) => Math.ceil(n / 5);
  const show = (label, ws) => console.log(label + ": " + ws.map((w) => w + " " + at(w) + " (day " + day(at(w)) + ")").join(" · "));
  console.log("Turkish A1, " + a1.length + " notes, " + day(a1.length) + " days at five notes a day");
  for (let d = 0; d < 4; d++) console.log("  day " + (d + 1) + ": " + a1.slice(d * 5, d * 5 + 5).join(" · "));
  show("courtesies", W("merhaba | teşekkür ederim | lütfen | günaydın | hoşça kal | nasılsın | adınız ne | affedersiniz | afiyet olsun"));
  show("verbs", W("olmak | gitmek | içmek")); show("question words", W("ne | kim | nerede | ne kadar | hangi"));
  show("zero to ten", W("sıfır | on")); show("var, yok, değil, mi", W("var | yok | değil | mi"));
  for (const s of SETS) { const p = s.words.map(at); console.log(s.name + ": notes " + Math.min(...p) + "–" + Math.max(...p) + " (days " + day(Math.min(...p)) + "–" + day(Math.max(...p)) + ")"); }
  for (const sub of SUBS) {
    const n = [0, 0, 0, 0, 0, 0];
    for (const c of D.trphrase.cards) if (c.sub === sub) n[T[c.fields.Word]]++;
    console.log(sub + " by the lowest level that spells them: A1 " + n[0] + ", A2 " + n[1] + ", B1 " + n[2] + ", B2 " + n[3] + ", C1 " + n[4] + ", no level " + n[5]);
  }
}
const old = fs.existsSync(ORD_FILE) ? fs.readFileSync(ORD_FILE, "utf8") : "";
if (CHECK) {
  if (old !== text) die("turkish-order.json is not what turkish-order.js computes — run it, then turkish-fix.js");
  console.log("turkish-order --check: the order file is what the rules give");
} else if (old !== text) { fs.writeFileSync(ORD_FILE, text); console.log("wrote turkish-order.json — now run turkish-fix.js"); }
else console.log("turkish-order.json is current");
