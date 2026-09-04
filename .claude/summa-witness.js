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

   A DISAGREEMENT IS A HYPOTHESIS. Both transcriptions have faults, and the direction matters: where
   the witness has an article Folio has not, the text may be lost OR merely unnumbered, and only
   looking for the words settles it. `--verbose` prints, for each disagreement, whether the witness's
   own wording is anywhere in Folio's chapter — which is the check that told E38's two real losses
   from its fourteen numbering faults. */
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

  /* 1 — the articles */
  let cmp = 0, none = 0, agree = 0, fShort = 0, fLong = 0;
  for (const c of chs) {
    const k = keyOf(c.t); if (!k) continue;
    const w = wit.get(k); if (!w) { none++; continue; }
    cmp++;
    const mine = new Set([...c.html.matchAll(/<span class="bk-n">(\d+)<\/span>/g)].map((m) => +m[1]));
    const miss = [...w.keys()].filter((a) => !mine.has(a)).sort((a, b) => a - b);
    const extra = [...mine].filter((a) => !w.has(a)).sort((a, b) => a - b);
    if (!miss.length && !extra.length) { agree++; continue; }
    if (miss.length) fShort++;
    if (extra.length) fLong++;
    console.log("  ARTICLES  ch " + c.n + "  " + k +
      (miss.length ? "   witness has " + miss.join(",") + " and Folio does not" : "") +
      (extra.length ? "   Folio has " + extra.join(",") + " and the witness does not" : ""));
    if (VERBOSE) for (const a of miss) {
      const h = w.get(a), b = norm(body(h)), nc = norm(c.html), nb = norm(chs.map((x) => x.html).join(" "));
      const probe = b.slice(Math.floor(b.length * 0.45), Math.floor(b.length * 0.45) + 60);
      console.log("      art " + a + "  " + (body(h).split("\n").map((s) => s.trim()).filter(Boolean)[0] || "").slice(0, 74) +
        "\n         wording is " + (nc.includes(probe) ? "in this chapter (unnumbered, not lost)"
          : nb.includes(probe) ? "elsewhere in the book" : "NOWHERE IN THE BOOK"));
    }
  }
  console.log("\n  " + cmp + " question(s) compared, " + agree + " agreeing; " + none +
    " have no second witness (the Supplement and the Appendix)");
  console.log("  " + fShort + " where the witness has an article Folio has not, " + fLong + " the other way");
  /* IT EXITS 0 WHATEVER IT FINDS, deliberately. This is a MEASURE, like card-focus.js, not a gate
     like check-questions.js: its residue is the numbering family E38 measured and left standing, so
     a non-zero exit would be a permanent red that teaches everyone to ignore it. Read the figures. */
  process.exit(0);
})();
