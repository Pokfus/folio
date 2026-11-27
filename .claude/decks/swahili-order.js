#!/usr/bin/env node
"use strict";
/*
  swahili-order.js — HOW swahili-order.json IS COMPUTED (Nov 2026, the Swahili beginner pass —
  docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site. The Turkish model.

    node .claude/decks/swahili-order.js [--check] [--report]

  It reads the Swahili decks AS swahili-fix.js LEFT THEM (so the record's added cards are in place) and the
  pin, and writes the order of two decks. The order is computed from the PINNED NUMBER — the generator's
  frequency rank as first shipped, which never changes — and never from the order the file happens to be
  in, so running it twice, or after the order has been applied, gives the same list. `swahili-fix.js`
  applies the list.

  SWAHILI A1. The generator deals a level by corpus frequency: day one was na · kwa · ni · kuwa · hii,
  `jambo` was note 64, `asante` 380, `shikamoo` 498, one to ten ran from note 22 to note 495 (`mbili`, two,
  the last but five), the days from 457 to 481, and `hujambo`, good morning, my name is and thank you very
  much were on B1 or the phrases deck. So:
    · HEAD, written by hand, five to a day: the greetings and their answers, the courtesies, the six
      pronouns, is and is not, a first exchange (my name is, what is your name, where are you from), the
      farewells and the greetings of respect, this and that with "of" and to have, the possessives beside
      one noun of each of two classes (mtu, kitu), fifteen verbs, the question words, zero to eleven, the
      clock, the parts of the day, and what a traveller asks for. A word is met before the phrase that uses
      it (jina and -angu before jina langu ni, saa and -ngapi before ni saa ngapi, kuwa na before nina njaa).
    · then every other card in frequency order, with each CLOSED SET together and in its own order at a
      note number written here: twenty to a thousand from note 131 and first and second behind them, the
      days from 151 (numbered from Saturday: Jumamosi is day one, mosi; Jumapili day two), the months from
      161, the colours from 201.
  A card the record added that is named in none of these is an ERROR: it has no frequency rank to fall to.

  THE PHRASES. One list (the deck has no subdecks): by the lowest level whose cards spell every word of the
  expression, a form counting only if a card shows it (A1, A2, B1, B2, C1, then the expressions that use a
  word or a form no level shows); inside a tier, the pinned number, which is the order of the corpus counts
  when the deck was first shipped. `--report` prints the tiers.

  A2, B1, B2 and C1 have no entry: `swahili-fix.js` keeps them in the order of their pinned numbers.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const IDS_FILE = path.join(__dirname, "swahili-ids.json"), ORD_FILE = path.join(__dirname, "swahili-order.json");
const CHECK = process.argv.includes("--check"), REPORT = process.argv.includes("--report");
const die = (m) => { console.log("FAIL  " + m); process.exit(1); };
const W = (s) => s.trim().split(/\s*\|\s*/);

// the keys are the cards' `Word` fields: a verb is its infinitive, an agreeing word its stem without the hyphen
const HEAD = W(`hujambo | sijambo | jambo | habari | nzuri |
  habari gani | asante | asante sana | tafadhali | karibu |
  ndiyo | hapana | sawa | samahani | pole |
  mimi | wewe | yeye | sisi | ninyi |
  wao | ni | si | jina | angu |
  jina langu ni | ako | nani | jina lako nani | kuitwa |
  wapi | kutoka | unatoka wapi | Kiswahili | Kiingereza |
  habari ya asubuhi | habari ya jioni | usiku mwema | lala salama | kwa heri |
  tuonane baadaye | siku njema | safari njema | karibu tena | mambo |
  shikamoo | marahaba | hodi | sijui | polepole |
  hii | hiyo | le | nini | a |
  kuwa | kuwa na | kuwako | na | ake |
  etu | enu | ao | mtu | kitu |
  kutaka | kuweza | kufanya | kwenda | kuja |
  kusema | kujua | kuona | kula | kunywa |
  kupenda | kuelewa | kuongea | kusoma | kuandika |
  lini | gani | ngapi | vipi | kwani |
  sifuri | moja | mbili | wili | tatu |
  nne | tano | sita | saba | nane |
  tisa | kumi | kumi na moja | ishirini | saa |
  ni saa ngapi | dakika | nusu | robo | kasoro |
  asubuhi | mchana | jioni | usiku | leo |
  kesho | jana | sasa | maji | chakula |
  nina njaa | nina kiu | choo | pesa | bei`);

// a closed set, in its own order: `at` is the note number its first card takes, `after` puts it straight
// behind another card. In ascending order of place, so that an `at` stays where it says.
const SETS = [
  { name: "thirty to a thousand", at: 131, words: W("thelathini | arobaini | hamsini | sitini | sabini | themanini | tisini | mia | elfu") },
  { name: "first and second", after: "elfu", words: W("a kwanza | pili") },
  { name: "the days", at: 151, words: W("Jumamosi | Jumapili | Jumatatu | Jumanne | Jumatano | Alhamisi | Ijumaa | wiki") },
  { name: "the months", at: 161, words: W("mwezi | Januari | Februari | Machi | Aprili | Mei | Juni | Julai | Agosti | Septemba | Oktoba | Novemba | Desemba | mwaka") },
  { name: "the colours", at: 201, words: W("rangi | eupe | eusi | ekundu | a kijani | a njano | a bluu") },
];

const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8"));
const FILES = { swahilia1: "A1", swahilia2: "A2", swahilib1: "B1", swahilib2: "B2", swahilic1: "C1", swahiliphr: "Phrases-and-Expressions" };
const LEVELS = ["swahilia1", "swahilia2", "swahilib1", "swahilib2", "swahilic1"];
const D = {};
for (const id of Object.keys(FILES)) {
  const f = "Swahili-" + FILES[id] + ".folio-deck.json";
  D[id] = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  if (D[id].meta.id !== id || !D[id].meta.types.swahili) die(f + " is not the Swahili deck " + id);
}
const GENERATED = 500; // the numbers the generator deals to A1; the record's are above

// ---- A1 --------------------------------------------------------------------------------------------------
function orderA1() {
  const pin = PIN.swahilia1, keys = D.swahilia1.cards.map((c) => c.fields.Word), have = new Set(keys);
  for (const w of HEAD) if (!have.has(w)) die("A1 head: " + w + " is not a card of Swahili A1");
  if (new Set(HEAD).size !== HEAD.length) die("A1 head: a word is named twice");
  if (HEAD.length % 5) die("A1 head: " + HEAD.length + " notes is not a whole number of days");
  const placed = new Set(HEAD);
  for (const s of SETS) for (const w of s.words) if (!have.has(w)) die("A1 set " + s.name + ": " + w + " is not a card of Swahili A1");
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
const un = (s) => s.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const toks = (s) => un(s).toLowerCase().replace(/[’‘`´ʼ]/g, "'").match(/[a-z]+(?:'[a-z]+)*/g) || [];
function shown(c) {
  // every spelling a card shows: its headword's words and every form of its Forms row
  const out = toks(c.fields.Word);
  for (const m of c.fields.Forms.matchAll(/class="uc-fl">[^<]*<\/span>([^<]*)</g)) if (!m[1].trim().startsWith("-")) out.push(...toks(m[1]));
  return out;
}
function tiers() {
  const known = new Set(), level = [];
  for (const id of LEVELS) {
    for (const c of D[id].cards) for (const t of shown(c)) known.add(t);
    level.push(new Set(known));
  }
  const out = {};
  for (const c of D.swahiliphr.cards) {
    const ts = toks(c.fields.Word), i = level.findIndex((L) => ts.every((t) => L.has(t)));
    out[c.fields.Word] = i < 0 ? LEVELS.length : i;
  }
  return out;
}
function orderPhrases(t) {
  const pin = PIN.swahiliphr;
  return D.swahiliphr.cards.slice().sort((a, b) => t[a.fields.Word] - t[b.fields.Word] || pin[a.fields.Word] - pin[b.fields.Word]).map((c) => c.fields.Word);
}

const T = tiers();
const tierCount = [0, 0, 0, 0, 0, 0];
for (const c of D.swahiliphr.cards) tierCount[T[c.fields.Word]]++;
const ORDER = { swahilia1: orderA1(), swahiliphr: orderPhrases(T) };
// the figures a description states that only this script can count
const STATS = { head: HEAD.length, phraseTiers: tierCount };
const text = "{\n" + Object.keys(ORDER).map((k) => JSON.stringify(k) + ": " + JSON.stringify(ORDER[k])).join(",\n") + ",\n" + JSON.stringify("_stats") + ": " + JSON.stringify(STATS) + "\n}\n";

if (REPORT) {
  const a1 = ORDER.swahilia1, at = (w) => a1.indexOf(w) + 1, day = (n) => Math.ceil(n / 5);
  const show = (label, ws) => console.log(label + ": " + ws.map((w) => w + " " + at(w) + " (day " + day(at(w)) + ")").join(" · "));
  console.log("Swahili A1, " + a1.length + " notes, " + day(a1.length) + " days at five notes a day; head " + HEAD.length);
  for (let d = 0; d < 4; d++) console.log("  day " + (d + 1) + ": " + a1.slice(d * 5, d * 5 + 5).join(" · "));
  show("courtesies", W("hujambo | asante | tafadhali | samahani | jina langu ni | habari ya asubuhi | kwa heri | shikamoo"));
  show("pronouns", W("mimi | wao")); show("possessives", W("angu | ako | ake | etu | enu | ao"));
  show("verbs", W("kuwa | kuwa na | kutaka | kunywa | kuandika")); show("question words", W("nani | wapi | nini | lini | kwani"));
  show("zero to eleven", W("sifuri | kumi na moja")); show("the clock", W("saa | ni saa ngapi | kasoro"));
  for (const s of SETS) { const p = s.words.map(at); console.log(s.name + ": notes " + Math.min(...p) + "–" + Math.max(...p) + " (days " + day(Math.min(...p)) + "–" + day(Math.max(...p)) + ")"); }
  console.log("phrases by the lowest level that spells them: A1 " + tierCount[0] + ", A2 " + tierCount[1] + ", B1 " + tierCount[2] + ", B2 " + tierCount[3] + ", C1 " + tierCount[4] + ", no level " + tierCount[5]);
}
const old = fs.existsSync(ORD_FILE) ? fs.readFileSync(ORD_FILE, "utf8") : "";
if (CHECK) {
  if (old !== text) die("swahili-order.json is not what swahili-order.js computes — run it, then swahili-fix.js");
  console.log("swahili-order --check: the order file is what the rules give");
} else if (old !== text) { fs.writeFileSync(ORD_FILE, text); console.log("wrote swahili-order.json — now run swahili-fix.js"); }
else console.log("swahili-order.json is current");
