#!/usr/bin/env node
"use strict";
/*
  latin-order.js — HOW latin-order.json IS COMPUTED (Nov 2026, the Latin beginner pass —
  docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site. The Turkish model.

    node .claude/decks/latin-order.js [--check] [--report]

  It reads the Latin decks AS latin-fix.js LEFT THEM (so the record's added cards are in place) and the pin,
  and writes the order of three decks. The order is computed from the PINNED NUMBER — the generator's order
  as first shipped, which never changes — and never from the order the file happens to be in, so running it
  twice, or after the order has been applied, gives the same list. `latin-fix.js` applies the list.

  LATIN A1. The generator deals a level by the rank of the DCC Latin Core Vocabulary: day one was
  et · sum · quī · in · nōn, salvē was note 496 of 500 and valē 499 (day 100), one to ten ran from note 48
  to note 486, the question words from 85 (ubi) to 434 (nōnne), and ab — the list's 21st word, filed under
  ā — was note 415. So:
    · HEAD, written by hand, five to a day: hello and goodbye, to be, I and you, not, and, yes and no; how
      are you, thank you, please; the pronouns and possessives; the question particles and the enclitics
      (-ne, -que, -ve); nothing, all, none; fourteen prepositions; fifteen verbs, the irregular ones and one
      model of each conjugation among them (amō, habeō, dīcō, capiō, audiō); the question words; one to
      ten; one model noun of each declension (puella, servus, bellum, rēx, manus, diēs) and three
      adjectives (bonus, magnus, fortis); the pronouns that decline like ille. A word is met before the
      formula that uses it (agō before quid agis, grātia before grātiās agō, ut before ut valēs).
    · then every other card in the pinned order, with each CLOSED SET together and in its own order at a
      note number written here: eleven to a thousand and first to third from note 121, yesterday, today
      and tomorrow from 151, the colours from 201.
  A card the record added that is named in none of these is an ERROR: it has no rank to fall to.

  LATIN A2. The generator's cards in their pinned order, then the record's: four words of the DCC list
  (adversus, falsus, praesēns, rēctus), then the Roman calendar as the deck's last fifteen cards — the
  three named days (kalendae, nōnae, īdūs) and the twelve months, in the order of the year.

  THE PHRASES. By the lowest level whose cards spell every word of the phrase, a form counting only if a
  card shows it — headword, dictionary entry, forms row or table (A1, A2, B1, B2, C1, then the phrases that
  use a word or a form no level shows); inside a tier, the pinned number, which is the order of Wikipedia's
  pageviews when the deck was first shipped. `--report` prints the tiers.

  B1, B2 and C1 have no entry: `latin-fix.js` keeps them in the order of their pinned numbers.

  `_stats`, in the same file: the figures a description states that only this script can count (how many
  phrases each level spells, how many carry sentences). `latin-fix.js` reads them for a tail's placeholders.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const IDS_FILE = path.join(__dirname, "latin-ids.json"), ORD_FILE = path.join(__dirname, "latin-order.json");
const CHECK = process.argv.includes("--check"), REPORT = process.argv.includes("--report");
const die = (m) => { console.log("FAIL  " + m); process.exit(1); };
const W = (s) => s.trim().split(/\s*\|\s*/);

const HEAD = W(`salvē | valē | ave | sum | ego |
  tū | nōn | et | ita | minimē |
  bene | quis | agō | quid agis | ut |
  ut valēs | grātia | grātiās agō | quaesō | amō |
  amābō tē | vērō | ita vērō | ecce | nōmen |
  meus | tuus | is | hic | ille |
  nōs | vōs | suī | suus | noster |
  vester | -ne | num | nōnne | -que |
  sed | aut | -ve | nihil | omnis |
  nūllus | in | ad | cum | ex |
  ab | dē | per | sine | prō |
  sub | ante | post | inter | apud |
  habeō | faciō | dīcō | videō | dō |
  eō | veniō | possum | volō | nōlō |
  mālō | capiō | ferō | audiō | sciō |
  ubi | unde | quō | quā | cūr |
  quandō | quōmodo | quot | tot | quantus |
  ūnus | duo | trēs | quattuor | quīnque |
  sex | septem | octō | novem | decem |
  puella | servus | bellum | rēx | manus |
  diēs | bonus | magnus | fortis | quī |
  alius | alter | ūllus | uterque | ipse |
  īdem | iste | aliquis | quisque | quīdam`);

// a closed set, in its own order: `at` is the note number its first card takes, `after` puts it straight
// behind another card. In ascending order of place, so that an `at` stays where it says.
const SETS = [
  { name: "eleven to a thousand", at: 121, words: W("ūndecim | duodecim | vīgintī | quīnquāgintā | centum | mīlle") },
  { name: "first to third", after: "mīlle", words: W("prīmus | secundus | tertius") },
  { name: "yesterday, today and tomorrow", at: 151, words: W("heri | hodiē | crās | māne | vesper") },
  { name: "the colours", at: 201, words: W("albus | niger | ruber | caeruleus | viridis | flāvus") },
];

// Latin A2's last cards, after the generator's own: the record's, in this order
const A2_TAIL = W(`adversus | falsus | praesēns | rēctus | kalendae | nōnae | īdūs |
  Iānuārius | Februārius | Mārtius | Aprīlis | Maius | Iūnius | Iūlius | Augustus | September | Octōber | November | December`);

const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8"));
const FILES = { latina1: "A1", latina2: "A2", latinb1: "B1", latinb2: "B2", latinc1: "C1", laphrase: "Phrases-and-Mottos" };
const LEVELS = ["latina1", "latina2", "latinb1", "latinb2", "latinc1"];
const GENERATED = { latina1: 500, latina2: 750 }; // the numbers the generator deals; the record's are above
const D = {};
for (const id of Object.keys(FILES)) {
  const f = "Latin-" + FILES[id] + ".folio-deck.json";
  D[id] = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  if (D[id].meta.id !== id || !(D[id].meta.types.latin || D[id].meta.types.latinphrase)) die(f + " is not the Latin deck " + id);
}

// ---- A1 --------------------------------------------------------------------------------------------------
function orderA1() {
  const pin = PIN.latina1, keys = D.latina1.cards.map((c) => c.fields.Latin), have = new Set(keys);
  for (const w of HEAD) if (!have.has(w)) die("A1 head: " + w + " is not a card of Latin A1");
  if (new Set(HEAD).size !== HEAD.length) die("A1 head: a word is named twice");
  const placed = new Set(HEAD);
  for (const s of SETS) for (const w of s.words) if (!have.has(w)) die("A1 set " + s.name + ": " + w + " is not a card of Latin A1");
  const inSet = new Set(SETS.flatMap((s) => s.words.filter((w) => !placed.has(w))));
  for (const k of keys) if (pin[k] > GENERATED.latina1 && !placed.has(k) && !inSet.has(k)) die("A1: " + k + " was added by the record and is named in neither the head nor a set");
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
function orderA2() {
  const pin = PIN.latina2, keys = D.latina2.cards.map((c) => c.fields.Latin), have = new Set(keys);
  for (const w of A2_TAIL) if (!have.has(w)) die("A2 tail: " + w + " is not a card of Latin A2");
  if (new Set(A2_TAIL).size !== A2_TAIL.length) die("A2 tail: a word is named twice");
  const tail = new Set(A2_TAIL);
  for (const k of keys) if (pin[k] > GENERATED.latina2 && !tail.has(k)) die("A2: " + k + " was added by the record and is not named in the tail");
  return keys.filter((k) => !tail.has(k)).sort((a, b) => pin[a] - pin[b]).concat(A2_TAIL);
}

// ---- the phrases -----------------------------------------------------------------------------------------
// the generator's fold (`la.fold`): no marks, lower case, j as i, v as u
const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/æ/g, "ae").replace(/œ/g, "oe").replace(/j/g, "i").replace(/v/g, "u");
const un = (s) => s.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const toks = (s) => fold(un(s)).match(/[a-z]+/g) || [];
function shown(c) { // every form a level card shows: headword, dictionary entry, forms row, table
  const F = c.fields, out = new Set(toks(F.Latin));
  for (const t of toks(F.Parts.replace(/<span class="uc-cls">.*?<\/span>/, ""))) out.add(t);
  for (const m of F.Forms.matchAll(/<\/span>([^<]+)<\/span>/g)) for (const t of toks(m[1])) out.add(t);
  for (const m of F.Table.matchAll(/<span class="uc-cj-f">(.*?)<\/span>/g)) for (const t of toks(m[1].replace(/\((?:n|m|f)\.\)/g, ""))) out.add(t);
  return out;
}
function tiers() {
  const known = new Set(), level = [];
  for (const id of LEVELS) {
    for (const c of D[id].cards) for (const t of shown(c)) known.add(t);
    level.push(new Set(known));
  }
  const out = {};
  for (const c of D.laphrase.cards) {
    const ts = toks(c.fields.Latin), i = level.findIndex((L) => ts.every((t) => L.has(t)));
    out[c.fields.Latin] = i < 0 ? LEVELS.length : i;
  }
  return out;
}
function orderPhrases(t) {
  const pin = PIN.laphrase;
  return D.laphrase.cards.slice().sort((a, b) => t[a.fields.Latin] - t[b.fields.Latin] || pin[a.fields.Latin] - pin[b.fields.Latin]).map((c) => c.fields.Latin);
}

const T = tiers();
const ORDER = { latina1: orderA1(), latina2: orderA2(), laphrase: orderPhrases(T) };
const tierN = [0, 0, 0, 0, 0, 0];
for (const c of D.laphrase.cards) tierN[T[c.fields.Latin]]++;
const nEx = (c) => (c.fields.Examples.match(/class="uc-exi"/g) || []).length;
const STATS = { laphrase: { byA1: tierN[0], byA2: tierN[1], byB1: tierN[2], byB2: tierN[3], byC1: tierN[4], byNone: tierN[5],
  withEx: D.laphrase.cards.filter((c) => nEx(c) > 0).length, withEx3: D.laphrase.cards.filter((c) => nEx(c) === 3).length } };
const text = "{\n" + Object.keys(ORDER).map((k) => JSON.stringify(k) + ": " + JSON.stringify(ORDER[k])).join(",\n") + ",\n" + JSON.stringify("_stats") + ": " + JSON.stringify(STATS) + "\n}\n";

if (REPORT) {
  const a1 = ORDER.latina1, at = (w) => a1.indexOf(w) + 1, day = (n) => Math.ceil(n / 5);
  const show = (label, ws) => console.log(label + ": " + ws.map((w) => w + " " + at(w) + " (day " + day(at(w)) + ")").join(" · "));
  console.log("Latin A1, " + a1.length + " notes, " + day(a1.length) + " days at five notes a day");
  for (let d = 0; d < 5; d++) console.log("  day " + (d + 1) + ": " + a1.slice(d * 5, d * 5 + 5).join(" · "));
  show("courtesies", W("salvē | valē | quid agis | grātiās agō | quaesō | amābō tē | ita | minimē"));
  show("pronouns", W("ego | tū | is | nōs | vōs | suī | hic | ille | iste | ipse | quī | quis"));
  show("particles", W("-ne | num | nōnne | -que | -ve"));
  show("prepositions", W("in | ab | apud | propter | contrā | super | trāns | circum"));
  show("verbs", W("sum | habeō | possum | mālō | sciō")); show("question words", W("ubi | cūr | quantus | quālis"));
  show("one to ten", W("ūnus | decem"));
  for (const s of SETS) { const p = s.words.map(at); console.log(s.name + ": notes " + Math.min(...p) + "–" + Math.max(...p) + " (days " + day(Math.min(...p)) + "–" + day(Math.max(...p)) + ")"); }
  const a2 = ORDER.latina2;
  console.log("Latin A2, " + a2.length + " notes: the calendar is notes " + (a2.indexOf("kalendae") + 1) + "–" + a2.length);
  console.log("phrases by the lowest level that spells them: A1 " + tierN[0] + ", A2 " + tierN[1] + ", B1 " + tierN[2] + ", B2 " + tierN[3] + ", C1 " + tierN[4] + ", no level " + tierN[5]);
  console.log("  first ten: " + ORDER.laphrase.slice(0, 10).join(" · "));
}
const old = fs.existsSync(ORD_FILE) ? fs.readFileSync(ORD_FILE, "utf8") : "";
if (CHECK) {
  if (old !== text) die("latin-order.json is not what latin-order.js computes — run it, then latin-fix.js");
  console.log("latin-order --check: the order file is what the rules give");
} else if (old !== text) { fs.writeFileSync(ORD_FILE, text); console.log("wrote latin-order.json — now run latin-fix.js"); }
else console.log("latin-order.json is current");
