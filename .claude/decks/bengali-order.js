#!/usr/bin/env node
"use strict";
/*
  bengali-order.js — HOW bengali-order.json IS COMPUTED (Nov 2026, the Bengali beginner pass —
  docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/bengali-order.js            # write bengali-order.json
    node .claude/decks/bengali-order.js --report   # print the measurements, write nothing

  WHY. The generator deals every level by a subtitle frequency list, so Bengali A1 opened on আমি · করা ·
  তুমি · না · আছে, the first greeting (ধন্যবাদ) was note 80, নমস্কার note 474 of 500, one to ten ran from
  note 56 to 446 and the days of the week from 470 to 495. The order is a list inside ONE deck: the app
  deals subdecks in parallel, a day apart, so a subdeck could not do this.

  EVERY ORDER IS COMPUTED FROM THE PINNED NUMBER (bengali-ids.json: the generator's frequency rank on the
  day the ids were seeded, then the next free number for a later note), never from the file's own order —
  so this script gives the same list whatever order the deck file happens to be in, and running it twice
  changes nothing. A note with no pinned number is an error: run `bengali-fix.js --pin` first.

  A1  · HEAD, a list written by hand (below): the courtesies of both communities, a first exchange, the
        subject pronouns at their levels of address, the commonest verbs, the question words, zero to
        ten, and the words every sentence is built from;
      · then every other note by its pinned number, with the CLOSED SETS kept together: a set either
        stands where its commonest member would (`at: "first"`) or begins at a note number (`at: N`, or just
        after it where another set is in the way: no set is ever split).
  A2  · by pinned number, with the months, the seasons and the numbers together.
  The phrases · inside each of its three subdecks, by READING LEVEL (the lowest level whose cards, with the
        levels below it, show every word of the expression as a headword, in a Forms row or in an
        All-forms panel), then by pinned number. The subdecks stay in their order.
  B1, B2 and C1 have no entry and are dealt by pinned number.

  bengali-order.json MAY BE EDITED BY HAND afterwards; bengali-fix.js refuses a list that is not exactly
  the deck's headwords. Re-running this script rewrites it from the rules here.
*/
const C = require("./bengali-common.js");

const W = (s) => s.trim().split(/\s+/).map((w) => w.replace(/_/g, " "));

const A1_HEAD = [].concat(
  // the courtesies, both communities' (Wiktionary labels নমস্কার Hinduism, সালাম and আসসালামু আলাইকুম Islam)
  W("নমস্কার আসসালামু_আলাইকুম সালাম হ্যাঁ না জ্বী ধন্যবাদ দয়া_করে দুঃখিত মাফ স্বাগত শুভ_সকাল বিদায় খোদা_হাফেজ আচ্ছা ঠিক ভালো"),
  // a first exchange
  W("আপনি_কেমন_আছেন তুমি_কেমন_আছো নাম আপনার_নাম_কি তোমার_নাম_কি আমি_জানি_না আমি_বুঝি_না"),
  // the pronouns: I, the three "you", the "he / she" of each level, the plurals, the possessives
  W("আমি তুমি আপনি তুই সে তিনি ও উনি এ আমরা তোমরা আপনারা তারা তাঁরা ওরা এরা আমার তোমার আপনার"),
  // there is / there is not, and the commonest verbs
  W("আছে নেই হওয়া করা যাওয়া আসা থাকা দেওয়া নেওয়া বলা দেখা পারা খাওয়া চাওয়া জানা পাওয়া"),
  // the question words
  W("কী কে কোথায় কখন কেন কেমন কত কোন কীভাবে কার"),
  // zero to ten
  W("শূন্য এক দুই তিন চার পাঁচ ছয় সাত আট নয় দশ"),
  // this and that, the joining words, the postpositions the case endings lean on
  W("এটা ওটা সেটা এই ওই সেই আর এবং কিন্তু বা থেকে দিয়ে জন্য সাথে সঙ্গে কাছে নিয়ে মধ্যে মতো")
);

const SETS = {
  bengalia1: [
    { name: "the days of the week", at: 151, words: W("সোমবার মঙ্গলবার বুধবার বৃহস্পতিবার শুক্রবার শনিবার রবিবার") },
    { name: "the colours", at: 201, words: W("রং লাল নীল হলুদ সবুজ কালো সাদা") },
    { name: "the numbers above ten", at: 251, words: W("এগারো বারো বিশ পঞ্চাশ একশ হাজার প্রথম দ্বিতীয় তৃতীয়") },
    { name: "the parts of the day", at: "first", words: W("সকাল দুপুর বিকাল সন্ধ্যা রাত") },
    { name: "where a thing is", at: "first", words: W("উপরে নিচে ভিতরে বাইরে সামনে পিছনে") },
    { name: "the family", at: "first", words: W("মা বাবা ভাই বোন ছেলে মেয়ে স্বামী স্ত্রী দাদা দিদি") },
  ],
  bengalia2: [
    { name: "the numbers", at: 51, words: W("তেরো চোদ্দ পনেরো ষোলো সতেরো আঠারো উনিশ ত্রিশ তিরিশ চল্লিশ ষাট সত্তর আশি নব্বই শত লাখ") },
    { name: "the months", at: 101, words: W("জানুয়ারি ফেব্রুয়ারি মার্চ এপ্রিল মে জুন জুলাই আগস্ট সেপ্টেম্বর অক্টোবর নভেম্বর ডিসেম্বর") },
    { name: "the seasons", at: "first", words: W("গ্রীষ্ম বর্ষা শরৎ হেমন্ত বসন্ত") },
  ],
};
const HEADS = { bengalia1: A1_HEAD };
const SUBS = ["Phrases", "Idioms", "Proverbs"];

function fail(m) { console.error("bengali-order: " + m); process.exit(1); }

// the lowest level at which every word of an expression has been shown: 0 = A1 … 4 = C1, 5 = no deck
function readingLevels(decks) {
  const known = [];
  let acc = new Set();
  for (const id of C.LEVELS) {
    acc = new Set(acc);
    for (const c of decks[id].deck.cards) for (const f of C.formsShown(c)) acc.add(f);
    known.push(acc);
  }
  return (word) => {
    const ts = C.tokens(word).map(C.fold);
    const i = known.findIndex((k) => ts.every((t) => k.has(t)));
    return i < 0 ? C.LEVELS.length : i;
  };
}

function compute(decks, ids) {
  const out = {};
  const num = (id) => (k) => {
    const n = (ids[id] || {})[k];
    if (!n) fail(id + ": " + k + " has no pinned number — run bengali-fix.js --pin first");
    return n;
  };
  for (const id of ["bengalia1", "bengalia2"]) {
    if (!decks[id]) continue;
    const n = num(id);
    const keys = decks[id].deck.cards.map(C.keyOf);
    const has = new Set(keys);
    const head = HEADS[id] || [];
    const used = new Set();
    for (const w of head) {
      if (!has.has(w)) fail(id + ": the head names " + w + ", which is not a card of the deck");
      if (used.has(w)) fail(id + ": the head names " + w + " twice");
      used.add(w);
    }
    const sets = SETS[id] || [];
    for (const s of sets) for (const w of s.words) {
      if (!has.has(w)) fail(id + ": " + s.name + " names " + w + ", which is not a card of the deck");
      if (used.has(w)) fail(id + ": " + w + " is placed twice (" + s.name + ")");
      used.add(w);
    }
    // BLOCKS: a word alone, or a whole set, so that no set is ever split by another
    let blocks = keys.filter((k) => !used.has(k)).sort((a, b) => n(a) - n(b)).map((k) => [k]);
    // a set that stands where its commonest member would
    for (const s of sets.filter((x) => x.at === "first")) {
      const first = Math.min(...s.words.map(n));
      let i = blocks.findIndex((b) => Math.min(...b.map(n)) > first);
      if (i < 0) i = blocks.length;
      blocks.splice(i, 0, s.words);
    }
    blocks = head.map((k) => [k]).concat(blocks);
    // a set that begins at a note number -- or at the first block boundary after it
    for (const s of sets.filter((x) => x.at !== "first").sort((a, b) => a.at - b.at)) {
      if (s.at - 1 < head.length) fail(id + ": " + s.name + " is placed inside the head");
      let count = 0, i = 0;
      while (i < blocks.length && count < s.at - 1) count += blocks[i++].length;
      blocks.splice(i, 0, s.words);
    }
    const order = [].concat(...blocks);
    out[id] = order;
  }
  if (decks.bnphrase) {
    const lvl = readingLevels(decks), n = num("bnphrase");
    const cards = decks.bnphrase.deck.cards;
    out.bnphrase = [];
    for (const sub of SUBS) {
      const part = cards.filter((c) => c.sub === sub).map(C.keyOf);
      part.sort((a, b) => lvl(a) - lvl(b) || n(a) - n(b));
      out.bnphrase.push(...part);
    }
    if (out.bnphrase.length !== cards.length) fail("bnphrase: a card is in no known subdeck");
  }
  return out;
}

function report(decks, order) {
  const day = (i) => Math.ceil(((i + 1) * 2) / C.NEW_PER_DAY);
  for (const id of ["bengalia1", "bengalia2"]) {
    const o = order[id];
    console.log("\n" + id + ": " + o.length + " notes, " + day(o.length - 1) + " days at " + C.NEW_PER_DAY + " new cards a day");
    console.log("  first 30: " + o.slice(0, 30).join(" · "));
    for (const s of SETS[id] || []) console.log("  " + s.name + ": notes " + (o.indexOf(s.words[0]) + 1) + " to " + (o.indexOf(s.words[s.words.length - 1]) + 1));
  }
  const lvl = readingLevels(decks);
  const tier = {};
  for (const k of order.bnphrase) { const l = lvl(k); tier[l] = (tier[l] || 0) + 1; }
  console.log("\nbnphrase by reading level: " + [...C.LEVELS.map((id, i) => C.LEVEL_NAME[id] + " " + (tier[i] || 0)), "no deck " + (tier[C.LEVELS.length] || 0)].join(", "));
  console.log("  first 12: " + order.bnphrase.slice(0, 12).join(" · "));
}

if (require.main === module) {
  const decks = C.loadDecks();
  const ids = C.readJSON(C.IDS, {});
  const order = compute(decks, ids);
  if (process.argv.includes("--report")) report(decks, order);
  else {
    const out = { _: "bengali-order.json — the order each Bengali deck is dealt in, as a full list of its headwords. Written by bengali-order.js (the rules are in its header), applied by bengali-fix.js, which moves a note with its id and never changes one. It may be edited by hand: a list that is not exactly the deck's headwords is refused. A deck with no entry is dealt in the order of its pinned numbers (bengali-ids.json)." };
    for (const id of Object.keys(order)) out[id] = order[id];
    C.writeByDeck(C.ORDER, out);
    console.log("bengali-order: wrote " + Object.keys(order).map((id) => id + " " + order[id].length).join(", "));
  }
}

module.exports = { compute, readingLevels, SETS, HEADS, SUBS };
