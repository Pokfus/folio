#!/usr/bin/env node
/* THE SUMMA AGAINST A SECOND TRANSCRIPTION OF THE SAME TRANSLATION (Sep 2026, batch E38).
   Not part of the site.  Usage:  node .claude/summa-witness.js [--verbose]

   WHY A FOURTH SCANNER. The three already here ask questions about the text in hand: is this word a
   word (check-style and the slip sweeps), does this chapter repeat itself (E35's duplication check),
   is this a thing a finished book should contain at all (book-audit). NONE OF THEM CAN SEE TEXT THAT
   IS SIMPLY GONE. E35 and E36 both found lost text, and both found it only because the loss left a
   DUPLICATE behind to trip over; a loss that leaves nothing behind is invisible to every instrument
   this programme had. A second independent transcription is the only thing that can see it, and this
   is that comparison, run over the whole book rather than over the two questions E35 had reason to
   doubt.

   WHAT IT COMPARES. Project Gutenberg carries the same Fathers of the English Dominican Province
   translation in four volumes — Part I (17611), I-II (17897), II-II (18755) and III (19950) — which
   is 512 of Folio's 614 questions. THERE IS NO GUTENBERG VOLUME FOR THE SUPPLEMENT OR THE APPENDIX,
   so 102 questions have no second witness at all and the report says so rather than passing them.

   THREE CHECKS, and the second and third need no witness, which is why they cover the Supplement too:
     1. ARTICLES — every article the witness has, against every article Folio numbers.
     2. TITLE AGAINST PROLOGUE — the chapter title comes from the edition's contents page and the
        prologue from the question's own page, so they are two independent statements of one fact.
        This is what finds a whole question standing in another's place.
     3. BYTE-IDENTICAL CHAPTERS — two questions with the same text is a fault whatever the cause.

   READ THE HEADING'S ORDINAL WORD, NOT ITS BRACKET. Gutenberg heads each article
   `NINTH ARTICLE [I, Q. 19, Art. 8]`, and the two disagree seventeen times across the four volumes —
   so a comparison keyed on the bracket reports Folio as having an article the witness has not, and
   the first run of this check produced 33 such phantoms. The ordinal word is the running position
   and is the reliable half. The bracket ALSO carries `I.` for `I,`, `A.` for `Art.` and sometimes no
   part letter at all, each of which cost a batch of phantom findings before the pattern was widened.

   A DISAGREEMENT IS A HYPOTHESIS, AND EVERY ONE IS NOW ADJUDICATED (Sep 2026, batch E46). Both
   transcriptions have faults, and a count on its own says only that they disagree — not which is
   wrong. So each disagreement is settled by the one question that settles it, DOES THE OTHER BOOK
   HAVE THIS TEXT AT ALL, and the report is by KIND: an article missing from Folio entirely, one
   present but unnumbered, or one where the OTHER book's heading or citation is at fault. Only the
   first two are anybody's here to repair, and today there are none of either.
   Run with `--selftest` to ask whether the adjudicator can still see and still hear; see the note
   beside it, and read it before believing a clean run. */
const fs = require("fs"), path = require("path"), https = require("https");
const VERBOSE = process.argv.includes("--verbose");
const CACHE = path.join(__dirname, "book-cache", "summa-witness");
const VOL = { 17611: "I", 17897: "I-II", 18755: "II-II", 19950: "III" };
const ORD = ["", "FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH", "SEVENTH", "EIGHTH", "NINTH",
  "TENTH", "ELEVENTH", "TWELFTH", "THIRTEENTH", "FOURTEENTH", "FIFTEENTH", "SIXTEENTH", "SEVENTEENTH",
  "EIGHTEENTH", "NINETEENTH", "TWENTIETH"];
const ORDN = {}; ORD.forEach((w, i) => { if (w) ORDN[w] = i; });
const HEAD = /^([A-Z]+)(?:-[A-Z]+)? ARTICLE \[\s*(?:([IVX-]+)[.,]?\s*)?Q\.?\s*(\d+)[.,]?\s*(?:Art|A)\.?\s*(\d+)\s*\]/gm;

function get(url) {
  return new Promise((ok, no) => https.get(url, { headers: { "User-Agent": "FolioBookImporter/1.0" } }, (r) => {
    if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) return ok(get(r.headers.location));
    if (r.statusCode !== 200) return no(new Error(url + " -> " + r.statusCode));
    let b = ""; r.setEncoding("utf8"); r.on("data", (d) => (b += d)); r.on("end", () => ok(b));
  }).on("error", no));
}
async function volume(id) {
  fs.mkdirSync(CACHE, { recursive: true });
  const f = path.join(CACHE, "pg" + id + ".txt");
  if (fs.existsSync(f)) return fs.readFileSync(f, "utf8");
  const t = await get("https://www.gutenberg.org/cache/epub/" + id + "/pg" + id + ".txt");
  fs.writeFileSync(f, t);
  return t;
}
const norm = (t) => t.replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/g, " ")
  .replace(/[^A-Za-z]+/g, " ").toLowerCase().trim();

(async () => {
  const heads = [], text = {};
  for (const id of Object.keys(VOL)) {
    let t;
    try { t = await volume(id); } catch (e) { console.log("  ! " + VOL[id] + ": " + e.message); continue; }
    text[id] = t;
    let m; HEAD.lastIndex = 0;
    while ((m = HEAD.exec(t))) {
      const ord = ORDN[m[1]]; if (!ord) continue;
      heads.push({ id, key: (m[2] || VOL[id]) + " q." + m[3], ord, at: m.index, end: HEAD.lastIndex });
    }
  }
  if (!heads.length) { console.log("no witness reachable — nothing checked"); process.exit(0); }
  const wit = new Map();
  for (const h of heads) { if (!wit.has(h.key)) wit.set(h.key, new Map()); wit.get(h.key).set(h.ord, h); }
  const body = (h) => {
    const nx = heads.filter((x) => x.id === h.id && x.at > h.at).sort((a, b) => a.at - b.at)[0];
    return text[h.id].slice(h.end, nx ? nx.at : h.end + 8000);
  };

  global.window = { FOLIO_BOOKS_IN: [], FOLIO_BOOK_ORIG_IN: [] };
  require(path.join(__dirname, "..", "books", "summa-theologica.js"));
  const chs = window.FOLIO_BOOKS_IN[0].chapters;
  const keyOf = (t) => {
    const m = t.match(/^((?:I{1,3}|I-II|II-II|Suppl|App)\.?)\s*q\.\s*(\d+)/i);
    return m ? m[1].replace(/\.$/, "") + " q." + m[2] : null;
  };

  /* 3 — two chapters with the same text */
  const seen = new Map(); let dup = 0;
  for (const c of chs) {
    if (seen.has(c.html)) {
      dup++;
      console.log("  BYTE-IDENTICAL: chapter " + seen.get(c.html) + " and chapter " + c.n +
        "\n      " + chs.find((x) => x.n === seen.get(c.html)).t + "\n      " + c.t);
    } else seen.set(c.html, c.n);
  }
  console.log((dup ? "" : "  ") + dup + " chapter(s) carry another chapter's text\n");

  /* 2 — the title against the prologue, no witness needed */
  const STOP = new Set(("of the and or as to in on a an is are be for its it his her their with which what " +
    "whether there this that from by at we must now consider treat inquiry inquire points head under " +
    "concerning shall have has had was were been about first second third").split(" "));
  const sig = (s) => (s.toLowerCase().match(/[a-z]+/g) || []).filter((w) => w.length > 3 && !STOP.has(w));
  let odd = 0;
  for (const c of chs) {
    const T = new Set(sig(c.t.replace(/^.*?—\s*/, ""))); if (!T.size) continue;
    const pro = c.html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").slice(0, 700).toLowerCase();
    let hit = 0; for (const w of T) if (pro.includes(w.slice(0, Math.max(4, w.length - 2)))) hit++;
    if (hit / T.size >= 0.5) continue;
    odd++;
    if (VERBOSE || hit === 0)
      console.log("  TITLE/PROLOGUE (" + (hit / T.size).toFixed(2) + ")  ch " + c.n + "  " + c.t +
        "\n      " + pro.trim().slice(0, 118));
  }
  console.log("  " + odd + " chapter(s) whose prologue does not speak about their title" +
    (VERBOSE ? "" : " (those scoring 0 shown; --verbose for all)") + "\n");

  /* 1 — THE ARTICLES, AND EVERY DISAGREEMENT ADJUDICATED IN BOTH DIRECTIONS (Sep 2026, batch E46).
     A count on its own says only that two books disagree; it does not say which is wrong, and for
     sixteen questions this reported a disagreement that in every case was the WITNESS's. So each one
     is now settled by the only question that settles it — DOES THE OTHER BOOK HAVE THIS TEXT AT ALL?
     — and the report is by KIND rather than by direction, because the direction is not the finding.

       · the witness has an article and Folio's chapter does not NUMBER it, but the words are there
         → a numbering fault in Folio, which is what E39 repaired twenty-seven of;
       · the words are somewhere ELSE in the other book
         → that book's own heading or citation is at fault, and neither text has lost anything. All
           sixteen standing when this was written are of this kind: Gutenberg heads an article
           `[I, Q. 4, Art. 4]` where the article is q.42's (the Son equal to the Father in greatness)
           and `[I, Q. 109, Art. 6]` where it is I-II q.109's (a man preparing himself for grace), so
           ONE citation typo produces TWO findings — the article appears under a question it does not
           belong to and is missing from the one it does. The other twelve are headings Gutenberg
           simply does not print; the check below finds each of Folio's articles in the witness's own
           volume, which is what turns E38's assertion that they are "Gutenberg's own missing
           headings" into something measured article by article.
       · the words are NOWHERE in the other book
         → a real loss, and the only kind that is anybody's to repair. E40 put back two of these.

     THE PROBE IS FIVE RUNS OF SIXTY CHARACTERS, NOT ONE, AND THAT IS NOT REDUNDANCY. Sixty characters
     because a shorter run matches Aquinas's formulae ("I answer that", "on the contrary") in the wrong
     article; spread across the article rather than taken from one point because THE TWO TRANSCRIPTIONS
     DIFFER MOST IN THEIR CITATION APPARATUS, and a single probe can land in exactly that. III q.5 art
     4 is the case that showed it: "Whether the Son of God Assumed a Human Mind or Intellect?" is in
     both books, and a lone mid-article probe reported it MISSING FROM THE WITNESS ENTIRELY because it
     fell on "…(Jn. 10:17: 'I lay down my soul' [Douay: 'life'])", where Folio carries a reference the
     witness sets differently. Sampled at a fifth, a third, a half, three fifths and three quarters,
     three of the five match and the answer is plain. The question being asked is "does this text exist
     over there AT ALL", so a match anywhere is the answer and a miss anywhere means nothing. */
  const ALL_FOLIO = norm(chs.map((x) => x.html).join(" "));
  const ALL_WIT = {}; for (const id of Object.keys(text)) ALL_WIT[VOL[id]] = norm(text[id]);
  const PROBE_AT = [0.2, 0.33, 0.45, 0.6, 0.75];
  const probesOf = (t) => {
    const b = norm(t);
    if (b.length < 200) return [];
    return PROBE_AT.map((f) => b.slice(Math.floor(b.length * f), Math.floor(b.length * f) + 60))
      .filter((x) => x.length === 60);
  };
  const anyIn = (hay, ps) => ps.some((x) => hay.includes(x));
  /* Folio's article, as text: from its own marker to the next one. */
  const folioArt = (c, a) => {
    const m = new RegExp('<span class="bk-n">' + a + '<\\/span>([\\s\\S]*?)(?=<span class="bk-n">|$)').exec(c.html);
    return m ? m[1] : "";
  };

  let cmp = 0, none = 0, agree = 0, lost = 0, unnumbered = 0, theirs = 0, odd2 = 0;
  for (const c of chs) {
    const k = keyOf(c.t); if (!k) continue;
    const w = wit.get(k); if (!w) { none++; continue; }
    cmp++;
    const mine = new Set([...c.html.matchAll(/<span class="bk-n">(\d+)<\/span>/g)].map((m) => +m[1]));
    const miss = [...w.keys()].filter((a) => !mine.has(a)).sort((a, b) => a - b);
    const extra = [...mine].filter((a) => !w.has(a)).sort((a, b) => a - b);
    if (!miss.length && !extra.length) { agree++; continue; }
    const lines = [];
    for (const a of miss) {
      const h = w.get(a), ps = probesOf(body(h));
      const head = (body(h).split("\n").map((s) => s.trim()).filter(Boolean)[0] || "").slice(0, 66);
      let verdict;
      if (!ps.length) { verdict = "?  the witness's article is too short to probe"; odd2++; }
      else if (anyIn(norm(c.html), ps)) { verdict = "FOLIO does not number it, but the words are here"; unnumbered++; }
      else if (anyIn(ALL_FOLIO, ps)) { verdict = "the WITNESS's own citation is wrong — Folio has it elsewhere"; theirs++; }
      else { verdict = "MISSING FROM FOLIO ENTIRELY"; lost++; }
      lines.push("      witness art " + a + "  " + head + "\n         " + verdict);
    }
    for (const a of extra) {
      const part = (k.match(/^(I-II|II-II|III|I|Suppl|App)/) || [])[1];
      const ps = probesOf(folioArt(c, a));
      const vol = ALL_WIT[part] || "";
      let verdict;
      if (!ps.length) { verdict = "?  Folio's article is too short to probe"; odd2++; }
      else if (anyIn(vol, ps)) { verdict = "the WITNESS's own heading is missing or misnumbered — it has the text"; theirs++; }
      else { verdict = "NOT IN THE WITNESS AT ALL"; odd2++; }
      lines.push("      Folio art " + a + "  " + norm(folioArt(c, a)).slice(0, 66) + "\n         " + verdict);
    }
    console.log("  ARTICLES  ch " + c.n + "  " + k +
      (miss.length ? "   witness has " + miss.join(",") + " and Folio does not" : "") +
      (extra.length ? "   Folio has " + extra.join(",") + " and the witness does not" : ""));
    lines.forEach((l) => console.log(l));
  }
  console.log("\n  " + cmp + " question(s) compared, " + agree + " agreeing; " + none +
    " have no second witness (the Supplement and the Appendix)");
  console.log("  of the disagreements: " + lost + " article(s) missing from Folio entirely, " +
    unnumbered + " present but unnumbered, " + theirs + " where the OTHER book's heading or citation " +
    "is at fault" + (odd2 ? ", " + odd2 + " that this cannot adjudicate" : ""));
  if (!lost && !unnumbered) console.log("  nothing here is Folio's to repair");

  /* --selftest — IS THE ADJUDICATOR BLIND, OR DEAF? (Sep 2026, batch E46.) It now answers "the other
     book's heading is at fault" for every disagreement on the shelf, which is the most comfortable
     answer it could give and therefore the one most in need of testing: a probe that matched anything
     would say exactly that, and a probe that matched nothing would too, in the other direction.
     So take articles Folio HAS, in questions the two books agree about, and ask both halves —
       · the witness must be FOUND to have them (or the check is blind and every finding is a phantom);
       · and with Folio's own copy removed they must be reported MISSING (or it is deaf and a real loss
         would be waved through as the other book's problem).
     It is a flag rather than part of every run because the second half rewrites a 14 MB string once per
     article. Measured when it was written: 33 of 33 and 33 of 33. */
  if (process.argv.includes("--selftest")) {
    const vol = ALL_WIT[VOL[Object.keys(text)[0]]] || "";
    let n = 0, sees = 0, hears = 0;
    for (const num of [2, 12, 25, 44, 75]) {
      const c = chs.find((x) => x.n === num); if (!c) continue;
      for (const m of c.html.matchAll(/<span class="bk-n">(\d+)<\/span>/g)) {
        const t = folioArt(c, +m[1]), ps = probesOf(t);
        if (!ps.length) continue;
        n++;
        if (anyIn(vol, ps)) sees++;
        if (!anyIn(ALL_FOLIO.split(norm(t)).join(" "), ps)) hears++;
      }
    }
    console.log("\n  self-test over " + n + " articles of five questions of Part I: " + sees +
      " found in the witness (not blind), " + hears + " reported missing when removed (not deaf)");
    if (sees !== n || hears !== n) console.log("  !! the adjudicator does not answer correctly on text it can see — do not believe the run above");
  }
  /* IT EXITS 0 WHATEVER IT FINDS, deliberately. This is a MEASURE, like card-focus.js, not a gate
     like check-questions.js: its residue is the numbering family E38 measured and left standing, so
     a non-zero exit would be a permanent red that teaches everyone to ignore it. Read the figures. */
  process.exit(0);
})();
