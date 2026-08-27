#!/usr/bin/env node
/*
  Folio — language-deck EXAMPLE SENTENCES: the ones a card repeats, and the glosses none of them fit.

    node .claude/decks/check-senses.js [--top=N] [--deck=<substring>] [--all]

  Report-only: it always exits 0. See the note at the foot of the output for why.

  WHY THIS EXISTS. A reader reported four cards: Portuguese `assim` glossed "full of; replete",
  Portuguese `estou` glossed "hello (a greeting used when answering the telephone)", Italian `natale`
  glossed "native", Indonesian `bang` glossed "a sudden percussive noise" — and Spanish `la mi`, in the
  A1 deck, glossed "mu, the Greek letter Μ". Every one of them is a real dictionary sense of a real
  word, so nothing about the card is malformed; what is wrong is that it is the WRONG sense, taken from
  a Wiktionary entry that ranks the obscure above the ordinary, or in one case from the English section
  of a word spelt the same way.

  WHAT MAKES IT CHECKABLE is that the same cards carry their own evidence. Each one comes with up to
  three real example sentences and an English translation of each, drawn from a different corpus by a
  different stage of the pipeline. `assim`'s three read "…like that", "…this way", "as I left"; `estou`'s
  are "I'm sorry", "I am accustomed", "I am so hungry"; `natale`'s are all about Christmas; `mi`'s first
  is "My mother often suffers from headaches". The examples say what the word means, and the gloss
  disagrees with all three.

  THE MEASURE is content-word overlap between the gloss and the English side of the examples, stemmed
  crudely to five characters so `give` matches `given`. A card whose gloss shares nothing with any of its
  examples is reported. IT IS A PROXY AND A NOISY ONE: about a quarter of the corpus trips it, because a
  correct gloss is often a synonym of what the sentence says rather than the same word ("to sprint" over
  "he ran off"). It is a REVIEW LIST, ranked so that the likeliest are first, not a gate — which is why
  it exits 0 and is not in CI. Read the card before rewriting it.

  THE RANKING is the number of examples that disagree, then the length of the gloss: a long, specific
  gloss that three independent sentences all fail to touch is the shape the reported five had, and a
  one-word gloss that misses is usually a synonym.

  IT ALSO REPORTS A CARD THAT SHOWS THE SAME EXAMPLE TWICE, which is exact rather than a proxy and was
  the other half of the same report. It happens two ways. The Indonesian pipeline picked a sentence once
  per SOURCE — `candidates` and `pick` both dedupe by index, and an index means nothing outside the
  corpus it came from — so a line carried by both Tatoeba and Wiktionary appeared twice, identically.
  And far more often the TARGET sentences differ while the English is word for word the same: Tatoeba
  carries "Du bist / Ihr seid / Sie sind gegen das Virus nicht immun" as three sentences and translates
  all three "You're not immune to the virus", so a card spent all three of its example slots saying one
  thing. 1,953 cards did. Both are reported here; both were cleared in Aug 2026 by keeping the first and
  dropping the rest.

  Not part of the site. See docs/lang-decks.md.
*/
const fs = require("fs"), path = require("path");
const DECKS = path.join(__dirname, "..", "..", "decks");

const STOP = new Set(("a an the to of in on at be is are was were am do does did not no or and for that with as it its one from by " +
  "any some this these those he she they we you i him her them us my your his their our there here what which who whom whose when " +
  "where how why all also more most other another such very can could will would shall should may might must have has had been being " +
  "get got make made take taken go going went out up down over under about into than then so if but because while during each every " +
  "both few many much own same too only just now new someone something used").split(" "));
const stem = (w) => (w.length > 4 ? w.slice(0, 5) : w);
const words = (t) => [...new Set(String(t).toLowerCase().match(/[a-z]{3,}/g) || [])].filter((w) => !STOP.has(w)).map(stem);
const strip = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

const args = process.argv.slice(2);
const top = Number((args.find((a) => a.startsWith("--top=")) || "--top=40").slice(6)) || 40;
const only = (args.find((a) => a.startsWith("--deck=")) || "").slice(7);
const showAll = args.includes("--all");

const rows = [], dups = [];
let scanned = 0, withBoth = 0;
for (const f of fs.readdirSync(DECKS).filter((x) => x.endsWith(".folio-deck.json")).sort()) {
  if (only && !f.toLowerCase().includes(only.toLowerCase())) continue;
  const deck = JSON.parse(fs.readFileSync(path.join(DECKS, f), "utf8"));
  for (const c of deck.cards || []) {
    scanned++;
    const fl = c.fields || {};
    const ex = fl.Examples || "", en = fl.English || "";
    if (!ex || !en) continue;
    const engs = [...ex.matchAll(/<div class="uc-exe">([\s\S]*?)<\/div>/g)].map((m) => strip(m[1]));
    if (!engs.length) continue;
    withBoth++;
    // the exact half: an example the card shows twice, on either side
    {
      const tgts = [...ex.matchAll(/<div class="uc-exz">([\s\S]*?)<\/div>/g)].map((m) => strip(m[1]).toLowerCase());
      const key = (a) => a.map((x) => x.toLowerCase().replace(/[.!?…]+$/, "")).filter(Boolean);
      const rep = (a) => new Set(key(a)).size < key(a).length;
      if (rep(engs) || rep(tgts)) dups.push([f, c.id, strip(fl.Word || fl[Object.keys(fl)[0]] || c.id), engs]);
    }
    // the part-of-speech label is the pipeline's, not the dictionary's — it would match nothing anyway
    const gloss = strip(en.replace(/<(?:i|div) class="uc-pos">[^<]*<\/(?:i|div)>/g, " "));
    const g = words(gloss);
    if (!g.length) continue;
    const miss = engs.filter((e) => { const s = new Set(words(e)); return !g.some((w) => s.has(w)); });
    if (miss.length !== engs.length) continue;                    // at least one example agrees
    /* THE RANKING SIGNAL IS THE EXAMPLES AGREEING WITH EACH OTHER. A correct gloss that happens to be a
       synonym ("to sprint" over "he ran off") misses too, and there are thousands of those — but its
       examples are three unrelated sentences, so they share nothing either. What every one of the five
       REPORTED cards looks like is the opposite: three sentences that plainly agree about the meaning
       (Christmas three times, "I am" three times, a bench three times) and a gloss that touches none of
       it. So a word appearing in at least two examples and in none of the gloss is the thing worth
       counting, and a card with none of those sinks to the bottom of the list. */
    const shared = [];
    const tally = new Map();
    engs.forEach((e) => words(e).forEach((w) => tally.set(w, (tally.get(w) || 0) + 1)));
    tally.forEach((n, w) => { if (n >= 2 && !g.includes(w)) shared.push(w); });
    // the headword, whichever field the pipeline calls it
    const head = strip(fl.Word || fl[Object.keys(fl)[0]] || c.hanzi || c.id);
    rows.push({ f, id: c.id, head, gloss, engs, shared, score: shared.length * 1000 + engs.length * 10 + Math.min(g.length, 9) });
  }
}
rows.sort((a, b) => b.score - a.score || a.f.localeCompare(b.f));

if (dups.length) {
  console.log("THE SAME EXAMPLE TWICE ON ONE CARD — " + dups.length + " (exact, not a proxy)");
  (showAll ? dups : dups.slice(0, 20)).forEach((d) => console.log("  " + d[1].padEnd(18) + d[2] + "   " + d[3][0].slice(0, 70)));
  if (!showAll && dups.length > 20) console.log("  … " + (dups.length - 20) + " more (--all)");
  console.log("");
}
console.log("Language-deck glosses against their own example sentences");
console.log("  " + scanned.toLocaleString() + " cards, " + withBoth.toLocaleString() + " with both a gloss and an example");
console.log("  " + rows.length.toLocaleString() + " share no content word with ANY of their examples (" +
  (withBoth ? (100 * rows.length / withBoth).toFixed(1) : "0") + "%)");
console.log("");
const byDeck = {};
rows.forEach((r) => { byDeck[r.f] = (byDeck[r.f] || 0) + 1; });
Object.entries(byDeck).sort((a, b) => b[1] - a[1]).slice(0, 12)
  .forEach(([k, v]) => console.log("  " + String(v).padStart(5) + "  " + k.replace(".folio-deck.json", "")));
console.log("");
console.log("MOST LIKELY FIRST — every example disagrees, and the gloss is specific enough to notice:");
(showAll ? rows : rows.slice(0, top)).forEach((r) => {
  console.log("  " + r.id.padEnd(18) + r.head + (r.shared.length ? "   [examples agree on: " + r.shared.slice(0, 6).join(", ") + "]" : ""));
  console.log("      gloss: " + r.gloss.slice(0, 100));
  r.engs.slice(0, 3).forEach((e) => console.log("      says:  " + e.slice(0, 100)));
});
if (!showAll && rows.length > top) console.log("  … " + (rows.length - top) + " more (--top=N, --all, --deck=<substring>)");
console.log("");
console.log("A finding is a PROXY: a correct gloss is often a synonym of what the sentence says.");
console.log("Report-only by design — a list a quarter of which is right teaches the next person to ignore it.");
