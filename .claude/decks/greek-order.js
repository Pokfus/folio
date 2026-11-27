#!/usr/bin/env node
"use strict";
/*
  greek-order.js — HOW greek-order.json IS COMPUTED (Nov 2026, the Greek beginner pass — docs/lang-decks.md,
  "The Greek beginner pass"). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/greek-order.js [--check] [--report]

  It reads the Greek decks AS greek-fix.js LEFT THEM (so the record's added cards are in place) and the pin,
  and writes, for Greek A1, the order the deck is dealt in, and for both decks the FACTS their descriptions
  state. The order is computed from the PINNED NUMBER — the generator's frequency rank, which never changes —
  and never from the order the file happens to be in, so running it twice, or after the order has been
  applied, gives the same list. `greek-fix.js` applies the list and writes the facts into the descriptions.

  GREEK A1. The generator deals a level by lemma frequency: day one was να · είμαι · σε · ο · και, γεια was
  note 91, καλημέρα 362, one to ten ran from note 9 to note 455 with zero on no card, the days were notes 425
  to 465, the months 472 to 493 and εμείς note 245. So:
    · HEAD, written by hand, five to a day: the greetings and courtesies, a first exchange (how are you, my
      name is, what is your name, pleased to meet you), the personal pronouns, to be and to have with the
      words every sentence is built of, the weak pronouns, the commonest prepositions, eleven verbs, what a
      traveller says when lost (I don't understand, I don't know), the question words with two questions
      made of them, zero to ten, and the other greetings. A word is met before the phrase that uses it
      (πολύ before χαίρω πολύ, ώρα before τι ώρα είναι, πόσο before πόσο κάνει).
    · then every other card in frequency order, with each CLOSED SET together and in its own order at a
      note number written here: eleven to a thousand and the ordinals, the days, the months, the colours.
  A card the record added that is named in neither is an ERROR: it has no frequency rank to fall to.

  THE ALPHABET has no order here: it keeps the one `alphabet.py` wrote (the letters in order, a rule after
  the block it needs). Its facts are what Greek A1's headwords ask of a reader.

  THE FACTS (`facts`, per deck) are every figure a description states that is not a plain count of the deck:
  where the head ends and each set stands, on which day the first greeting and the last card fall, how
  many headwords need a two-letter spelling to be read, and how much of A1's own sentences a reader who has
  finished A1 still cannot read. They are recomputed on every run; `--check` fails if the file lags.
*/
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const IDS_FILE = path.join(__dirname, "greek-ids.json"), ORD_FILE = path.join(__dirname, "greek-order.json");
const CHECK = process.argv.includes("--check"), REPORT = process.argv.includes("--report");
const die = (m) => { console.log("FAIL  " + m); process.exit(1); };
const W = (s) => s.trim().split(/\s*\|\s*/);
const PER_DAY = 5; // LIMIT_DEFAULTS.lang: ten new CARDS a day, a word being two

const HEAD = W(`γεια σου | γεια σας | ευχαριστώ | παρακαλώ | ναι |
  όχι | καλημέρα | καλησπέρα | καληνύχτα | αντίο |
  τι κάνεις | τι κάνετε | καλά | πολύ | συγγνώμη |
  με λένε | πώς σε λένε | πώς σας λένε | χαίρω πολύ | εντάξει |
  εγώ | εσύ | αυτός | αυτή | εμείς |
  εσείς | είμαι | έχω | δεν | και |
  ο | ένας | να | θα | σε |
  μου | σου | του | της | μας |
  σας | τους | με | από | για |
  θέλω | μπορώ | κάνω | πηγαίνω | έρχομαι |
  λέω | ξέρω | βλέπω | τρώω | πίνω |
  μιλάω | καταλαβαίνω | δεν καταλαβαίνω | δεν ξέρω | ευχαριστώ πολύ |
  τι | ποιος | πού | πότε | πώς |
  γιατί | πόσος | πόσο | πόσο κάνει | ώρα |
  τι ώρα είναι | μηδέν | δύο | τρεις | τέσσερις |
  πέντε | έξι | επτά | οκτώ | εννέα |
  δέκα | γεια | τα λέμε | χαίρετε | καλή όρεξη |
  στην υγειά σου`);

// a closed set, in its own order: `at` is the note number its first card takes, `after` puts it straight
// behind another card. In ascending order of place, so that an `at` stays where it says.
const SETS = [
  { name: "eleven to a thousand", key: "numbers", at: 101, words: W("έντεκα | δώδεκα | δεκατρία | δεκατέσσερα | δεκαπέντε | δεκαέξι | δεκαεπτά | δεκαοκτώ | δεκαεννέα | είκοσι | τριάντα | σαράντα | πενήντα | εξήντα | εβδομήντα | ογδόντα | ενενήντα | εκατό | χίλια") },
  { name: "the ordinals", key: "ordinals", after: "χίλια", words: W("πρώτος | δεύτερος | τρίτος") },
  { name: "the days", key: "weekdays", at: 151, words: W("Δευτέρα | Τρίτη | Τετάρτη | Πέμπτη | Παρασκευή | Σάββατο | Κυριακή") },
  { name: "the months", key: "months", after: "Κυριακή", words: W("Ιανουάριος | Φεβρουάριος | Μάρτιος | Απρίλιος | Μάιος | Ιούνιος | Ιούλιος | Αύγουστος | Σεπτέμβριος | Οκτώβριος | Νοέμβριος | Δεκέμβριος") },
  { name: "the colours", key: "colours", at: 201, words: W("χρώμα | άσπρος | μαύρος | κόκκινος | μπλε | πράσινος | κίτρινος") },
];
const GENERATED = 500; // the numbers the generator deals to A1; the record's are above

const PIN = JSON.parse(fs.readFileSync(IDS_FILE, "utf8"));
const A1 = JSON.parse(fs.readFileSync(path.join(DIR, "Greek-A1.folio-deck.json"), "utf8"));
const ABC = JSON.parse(fs.readFileSync(path.join(DIR, "Greek-Alphabet.folio-deck.json"), "utf8"));
if (A1.meta.id !== "greeka1" || !A1.meta.types.greek) die("Greek-A1.folio-deck.json is not the Greek deck greeka1");
if (ABC.meta.id !== "elabc" || !ABC.meta.types["el-abc"]) die("Greek-Alphabet.folio-deck.json is not the Greek deck elabc");

// ---- A1's order -----------------------------------------------------------------------------------------
function orderA1() {
  const pin = PIN.greeka1, keys = A1.cards.map((c) => c.fields.Word), have = new Set(keys);
  for (const w of HEAD) if (!have.has(w)) die("A1 head: " + w + " is not a card of Greek A1");
  if (new Set(HEAD).size !== HEAD.length) die("A1 head: a word is named twice");
  const placed = new Set(HEAD);
  for (const s of SETS) for (const w of s.words) if (!have.has(w)) die("A1 set " + s.name + ": " + w + " is not a card of Greek A1");
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

// ---- what a card shows, and what a sentence asks -------------------------------------------------------------
const dec = (s) => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const fold = (s) => s.normalize("NFC").toLowerCase().replace(/ς/g, "σ");
const toks = (s) => s.normalize("NFC").match(/[Ͱ-Ͽἀ-῿]+/g) || [];
function forms(c) {
  const F = c.fields, out = new Set();
  const add = (s) => { for (const t of toks(dec(s))) out.add(fold(t)); };
  add(F.Word); add(F.Greek.replace(/<[^>]+>/g, " "));
  for (const m of (F.Forms || "").matchAll(/<\/span>([^<]+)<span class="uc-fr">/g)) add(m[1]);
  for (const m of (F.Table || "").matchAll(/class="uc-cj-f">([^<]*)</g)) add(m[1]);
  return out;
}
const sentences = (c) => [...(c.fields.Examples || "").matchAll(/data-say="([^"]*)"/g)].map((m) => toks(dec(m[1])).map(fold));

function facts(order) {
  const by = new Map(A1.cards.map((c) => [c.fields.Word, c]));
  const at = (w) => order.indexOf(w) + 1, day = (n) => Math.ceil(n / PER_DAY);
  const f = { head: HEAD.length, headDays: day(HEAD.length), firstWord: order[0], generated: GENERATED, added: order.length - GENERATED };
  // the A1 description says "a greeting, thank you, please, yes and no on days 1 and 2" in words
  for (const w of ["γεια σου", "ευχαριστώ", "παρακαλώ", "ναι", "όχι"]) if (day(at(w)) > 2) die("A1 head: " + w + " is no longer on days 1 and 2, which the description says");
  f.thanksDay = day(at("ευχαριστώ")); f.howAreYouDay = day(at("τι κάνεις")); f.nameDay = day(at("με λένε"));
  f.pronounsFrom = day(at("εγώ")); f.pronounsTo = day(at("εσείς"));
  f.verbsFrom = day(at("θέλω")); f.verbsTo = day(at("μιλάω"));
  f.questionsFrom = day(at("τι")); f.questionsTo = day(at("πόσος"));
  f.zeroAt = at("μηδέν"); f.tenAt = at("δέκα"); f.zeroDay = day(at("μηδέν")); f.tenDay = day(at("δέκα"));
  for (const s of SETS) {
    const p = s.words.map(at);
    f[s.key + "From"] = Math.min(...p); f[s.key + "To"] = Math.max(...p); f[s.key + "Day"] = day(Math.min(...p)); f[s.key + "N"] = s.words.length;
    if (Math.max(...p) - Math.min(...p) !== s.words.length - 1) die("A1 set " + s.name + " is not together in the order");
  }
  // the sentences, in arrival order: a word of a sentence is MET only if a card dealt so far shows that form
  const met = new Set(), all = new Set();
  for (const c of A1.cards) for (const x of forms(c)) all.add(x);
  let tot = 0, hit = 0, whole = 0, n = 0, none = 0, lens = [];
  for (const w of order) {
    const c = by.get(w);
    for (const x of forms(c)) met.add(x);
    for (const s of sentences(c)) {
      const h = s.filter((t) => met.has(t)).length;
      tot += s.length; hit += h; n++; if (h === s.length) whole++;
      none += s.filter((t) => !all.has(t)).length; lens.push(s.length);
    }
  }
  lens.sort((a, b) => a - b);
  f.sentences = n; f.sentenceMedian = lens[lens.length >> 1]; f.metPct = (100 * hit / tot).toFixed(0); f.wholeSentences = whole;
  f.noCardPct = (100 * none / tot).toFixed(0);
  // the grammar the cards show
  const pos = (c) => (/class="uc-pos">([^<]*)</.exec(c.fields.English) || [])[1] || "";
  const nouns = A1.cards.filter((c) => /^noun/.test(pos(c))), verbs = A1.cards.filter((c) => /^verb/.test(pos(c)));
  f.nouns = nouns.length; f.nounTables = nouns.filter((c) => /vocative/.test(c.fields.Table)).length;
  f.stressMoves = nouns.filter((c) => /uc-fs/.test(c.fields.Forms)).length;
  f.verbs = verbs.length; f.verbsAfterNa = verbs.filter((c) => /after θα/.test(c.fields.Table)).length;
  f.ipa = A1.cards.filter((c) => c.fields.IPA).length;
  // what the romanisation hides: it follows the spelling
  f.romanMisread = A1.cards.filter((c) => /ai|aí|ei|eí|oi|oí|y|ý|gk|nt|mp/.test(dec(c.fields.Roman).normalize("NFC").toLowerCase())).length;
  return f;
}

// what Greek A1's headwords ask of a reader (the alphabet deck's description states it)
function reading(order) {
  const PAIR = /αι|αί|ει|εί|οι|οί|ου|ού|υι|υί|αυ|αύ|ευ|εύ|μπ|ντ|γκ|γγ|γχ|τσ|τζ/;
  let pair = 0, spelled = 0, accent = 0, sigma = 0, caps = 0;
  for (const w of order) {
    const s = w.normalize("NFC").toLowerCase();
    if (PAIR.test(s)) pair++;
    // an [i], [e] or [o] written otherwise than ι, ε, ο: η, υ (outside ου αυ ευ), ω, or a pair
    if (/[ηήωώ]|αι|αί|ει|εί|οι|οί|υι|υί/.test(s) || /[υύ]/.test(s.replace(/[οαε][υύ]/g, ""))) spelled++;
    if (/[άέήίόύώΐΰ]/.test(s)) accent++;
    if (/ς/.test(s)) sigma++;
    if (w[0] !== w[0].toLowerCase()) caps++;
  }
  const questions = A1.cards.reduce((a, c) => a + [...(c.fields.Examples || "").matchAll(/data-say="([^"]*)"/g)].filter((m) => /;/.test(dec(m[1]))).length, 0);
  return { a1Words: order.length, pairWords: pair, spelledWords: spelled, accentWords: accent, sigmaWords: sigma, capitalWords: caps, questionSentences: questions,
    rules: ABC.cards.filter((c) => c.type === "el-read").length, letters: ABC.cards.filter((c) => c.type === "el-abc").length };
}

const ORDER = orderA1();
const OUT = { elabc: { facts: reading(ORDER) }, greeka1: { order: ORDER, facts: facts(ORDER) } };
const text = "{\n" + Object.keys(OUT).map((k) => JSON.stringify(k) + ": " + JSON.stringify(OUT[k])).join(",\n") + "\n}\n";

if (REPORT) {
  const at = (w) => ORDER.indexOf(w) + 1, day = (n) => Math.ceil(n / PER_DAY);
  console.log("Greek A1, " + ORDER.length + " notes, " + day(ORDER.length) + " days at five notes a day; the head is " + HEAD.length + " notes");
  for (let d = 0; d < 4; d++) console.log("  day " + (d + 1) + ": " + ORDER.slice(d * 5, d * 5 + 5).join(" · "));
  for (const s of SETS) { const p = s.words.map(at); console.log(s.name + ": notes " + Math.min(...p) + "–" + Math.max(...p) + " (days " + day(Math.min(...p)) + "–" + day(Math.max(...p)) + ")"); }
  console.log("A1 facts: " + JSON.stringify(OUT.greeka1.facts));
  console.log("alphabet facts: " + JSON.stringify(OUT.elabc.facts));
}
const old = fs.existsSync(ORD_FILE) ? fs.readFileSync(ORD_FILE, "utf8") : "";
if (CHECK) {
  if (old !== text) die("greek-order.json is not what greek-order.js computes — run it, then greek-fix.js");
  console.log("greek-order --check: the order and the facts are what the rules give");
} else if (old !== text) { fs.writeFileSync(ORD_FILE, text); console.log("wrote greek-order.json — now run greek-fix.js"); }
else console.log("greek-order.json is current");
