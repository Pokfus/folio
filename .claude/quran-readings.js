/* .claude/quran-readings.js — PICKTHALL'S 1930 WORDING, RECOVERED FROM SIX OCRs OF THE PRINTED BOOK.

   NODE_PATH=<dir with the npm package `diff`> node .claude/quran-readings.js [--fetch]

   Writes .claude/quran-readings.json, which .claude/fetch-book.js (layout "pickthall") applies to the
   Gutenberg text. Offline and not part of the site; `diff` (jsdiff) is reached through NODE_PATH exactly
   as Playwright is, and never ships.

   WHY THIS EXISTS. The only complete transcription of Pickthall's Koran is Project Gutenberg #16955, and
   it is NOT the translation of 1930. Compared with the printed book it carries a later, unattributed
   revision: "there is no God save Him" made "no Allah save Him", "adore" made "prostrate", "the Night of
   Power" made "the Night of Predestination", "friend" made "guardian", Mecca made "Makka", phrases added
   ("His omniscience and His omnipotence", 2:19) and at least one verse turned round (43:81, "If the
   Beneficent One hath a son, then I shall be first among the worshippers" for Pickthall's "The Beneficent
   One hath no son. I am first among the worshippers"). Wikisource's transcription of the 1930 scan is no
   help for this: where it exists (about half the book) it was seeded from the same revised e-text, and
   reads "guardian" at 2:107 where every scan of the book reads "friend".

   THE WITNESSES are six OCR texts of the 1930 printing on archive.org (OCR_SOURCES below): two scans
   read by the Internet Archive's own engine, one more of the same kind, and three Digital Library of
   India scans read by an older, different engine. Gutenberg supplies the verse division (it is right:
   114 sûrahs, 6,236 verses) and every word the witnesses do not overrule.

   THE RULE. Each witness is aligned with Gutenberg sûrah by sûrah (jsdiff), and every stretch where any
   witness differs becomes a region. A region is changed only when AT LEAST FOUR of the six witnesses
   read the same thing there and AT MOST ONE reads Gutenberg's text. Two scans read by one engine make
   the same mistakes (both Internet Archive texts read "As a raid" as "Asa raid"), so four means at least
   one witness from the other engine agrees. Then, whatever the vote:
   · a reading with a word found neither in Gutenberg nor in Wikisource's typed text is held back for a
     person (five of those were the printed book's own misprints: "whosover", "commiteth", "measureeth");
   · a change that only moves a hyphen or a space inside a compound (wrong-doers / wrongdoers) is NOT
     taken — a hyphen at a line's end cannot be told from a hyphen in the word, so Gutenberg's form stands;
   · a stray apostrophe or asterisk is dropped (it is a footnote marker the OCR read as a character);
   · a region that adds more than two words or deletes more than three, or crosses a verse, is held back.
   What is held back is listed in book-cache/quran/held.json for review, and the readings a person has
   checked against the OCR texts are settled in ACCEPT and REJECT below.

   Four engines agreeing on a misreading that is itself a word does happen ("camest" read as "earnest" by
   four of six, 5:110) — so EVERY change with fewer than six votes was read by hand before this shipped.
*/
"use strict";
const fs = require("fs"), path = require("path");
let diffArrays;
try { ({ diffArrays } = require("diff")); } catch (e) {
  console.error("needs the npm package `diff` on NODE_PATH (install it outside the repo)"); process.exit(1);
}

const ROOT = path.join(__dirname, "..");
const CACHE = path.join(__dirname, "book-cache", "quran");
const OUT = path.join(__dirname, "quran-readings.json");
const OCR_SOURCES = {
  A: "meaningofgloriou0000unse_l1d9/meaningofgloriou0000unse_l1d9_djvu.txt", // New York, Knopf, 1930
  B: "dli.ministry.16944/E02033_The_Meaning_of_the_Glorious_Koran_djvu.txt", // London, Allen & Unwin, 1930
  C: "in.ernet.dli.2015.283503/2015.283503.The-Meaning_djvu.txt",
  D: "dli.csl.6685/6685_djvu.txt",
  E: "in.ernet.dli.2015.216140/2015.216140.The-Meaning_djvu.txt",
  F: "dli.csl.3756/3756_djvu.txt",
};

/* Readings settled by a person, keyed "sûrah:verse|Gutenberg's text|the reading". ACCEPT takes a held
   reading; REJECT refuses one the vote would take. Each was checked in the OCR texts themselves. */
const ACCEPT = new Set([
  "2:106|our|Our revelations as We", "2:153|steadfastness|stedfastness", "2:160|those|such of them as",
  "3:161|embezzle|deceive ( mankind )", "4:119|cattle|cattle's", "5:60|and|! Worse is he",
  "6:72|be|ward off ( evil )", "7:2|mayst|mayest", "7:126|steadfastness|stedfastness",
  "8:16|maneuvering|manoeuvring", "9:92|shouldst|shouldest", "10:92|mayst|mayest", "16:69|divers|diverse",
  "17:7|judgments|judgements", "17:59||- but they did wrong in respect of her . We send not portents",
  "17:106|mayst|mayest", "21:5|Allah's|God's", "22:71||hath been revealed unto them", "26:194|mayst|mayest",
  "28:46|mayst|mayest", "30:47|Then|They brought them clear proofs ( of Allah's Sovereignty ) . Then",
  "33:4|saith|sayeth", "33:50|uncle|uncles", "37:97|red-hotfire|red-hot fire", "38:86|simulating|impostor",
  "42:7|mayst|mayest", "46:32|he|ye ( can find )", "64:4||all that is in", "67:22|straight|beaten",
  "71:7|mayst|mayest", "76:19||of everlasting youth",
  // held as weakly supported (an OCR variant split the vote), read in the texts and taken
  "14:31|bargaining|traffick", "41:37|prostrate|adore", "6:73|Visible|visible", "37:164|us|Us",
  // held for a word the four-witness vocabulary did not know: the edition's own words, read in the texts
  "4:128|ill|ill-treatment", "5:1|indentures|undertakings", "5:23|out|outspake", "5:44||barter not",
  "39:16|appall|appal", "56:45|heretofore|heretofor", "59:2|reckoned|recked",
  "78:33|voluptuous|maidens for companions ,", "88:21|an|a remembrancer", "91:14|razed|rased",
]);
const REJECT = new Set([
  "17:110|Say|no . Say", "12:1||Merciful .", "72:11|.|. 12", // a verse number or the invocation, read as text
  "5:110|camest|earnest", "7:129|camest|earnest", "20:40|camest|earnest", "30:58|camest|earnest",
]);

/* Readings a person wrote where no single region carries them: the vote split between two OCR forms of a
   word broken at a line's end, or the tail of a verse the vote rewrote only in part. Each names the verse,
   Gutenberg's tokens (which must occur exactly once there, or at the token `at` names) and the 1930 text, read in the OCR texts. */
const FIXES = [
  // "the God-\nfearing" at a line's end: three witnesses joined it, three kept the hyphen apart
  { s: 2, v: 66, g: "Allah-fearing", t: "God-fearing" },
  // the vote turned the verse into Pickthall's; Gutenberg's added "(But there is no son.)" lost its brackets
  // and four other words by six votes, and these last three by four votes to Gutenberg's two
  // (tokens 28–29 and 31 of "… worshippers. (But there is no son).": the brackets and "But there is" went by vote)
  { s: 43, v: 81, at: 28, g: "no son", t: "" },
  { s: 43, v: 81, at: 31, g: ".", t: "" },
];

/* ---------- fetch (once) ---------- */
async function fetchAll() {
  fs.mkdirSync(CACHE, { recursive: true });
  for (const k in OCR_SOURCES) {
    const f = path.join(CACHE, "ocr-" + k + ".txt");
    if (fs.existsSync(f) && fs.statSync(f).size > 500000) continue;
    const r = await fetch("https://archive.org/download/" + OCR_SOURCES[k]);
    if (!r.ok) throw new Error(k + ": HTTP " + r.status);
    fs.writeFileSync(f, await r.text());
    console.log("  fetched witness " + k);
  }
}

/* ---------- text handling shared by every witness ---------- */
const fold = (s) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[’‘ʼ`]/g, "'")
  .replace(/[“”]/g, '"').replace(/[—–]/g, " - ");
const TOK = /[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*|[^\sA-Za-z0-9]/g;

function gutenberg() {
  let g = fs.readFileSync(path.join(CACHE, "en-pg.txt"), "utf8").replace(/\r/g, "");
  g = g.slice(g.indexOf("*** START OF"), g.indexOf("*** END OF"));
  const parts = g.split(/\n Chapter (\d+):\n/), G = {};
  for (let i = 1; i < parts.length; i += 2) {
    const lines = parts[i + 1].split("\n"), vs = [];
    for (let k = 0; k < lines.length; k++) {
      if (!/^P: /.test(lines[k])) continue;
      const buf = [lines[k].slice(3)];
      while (k + 1 < lines.length && lines[k + 1].trim() && !/^[YS]: /.test(lines[k + 1])) buf.push(lines[++k]);
      vs.push(buf.join(" ").replace(/\s+/g, " ").trim());
    }
    G[+parts[i]] = vs;
  }
  return G;
}

/* An OCR text → one stream of tokens with the page's furniture taken out: page numbers, running heads
   and sûrah headings (lines mostly in capitals), "Revealed at …", footnotes (a block opening on a marker
   and a space), the invocation, verse numbers, footnote markers glued to a word. */
function prepOcr(raw, vocab) {
  let t = fold(raw).replace(/\r/g, "").replace(/[ \t]+/g, " ");
  const keep = [];
  for (const para of t.split(/\n\s*\n/)) {
    const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (/^(?:[1-4]|[tI*^¥†‡§'"«])\s+[A-Za-z]/.test(lines[0])) continue;
    const out = [];
    for (let L of lines) {
      const letters = L.replace(/[^A-Za-z]/g, ""), caps = L.replace(/[^A-Z]/g, "");
      if (/^\d{1,3}$/.test(L) || /GLORIOUS\s*KORAN/i.test(L) || /^Revealed at /.test(L)) continue;
      if (letters.length >= 3 && caps.length / letters.length > 0.7) continue;
      out.push(L.replace(/^[~\s]*(?:\d{1,3}|g\d{0,2}|\dg|[Il]\d{0,2}|\d[Il])\s?[.,•■·]\s+/, ""));
    }
    if (out.length) keep.push(out.join("\n"));
  }
  t = keep.join("\n").replace(/(\w)[-¬­]\s*\n\s*(\w)/g, "$1\u0001$2").replace(/\s+/g, " ");
  t = t.replace(/In the name of Allah, the [A-Za-z]{4,14}, the Merciful\./g, " ");
  t = t.replace(/([a-z])[123](?=[\s.,;:!?)]|$)/g, "$1").replace(/\s?[*^†‡§®™•■¥«»]/g, "").replace(/TM\b/g, "");
  // a word broken at a line's end: joined if Gutenberg knows it joined, hyphened if it knows that, a dash
  // if the second half is capitalised, else joined
  t = t.replace(/(\w+)\u0001(\w+)/g, (m, a, b) => {
    const j = (a + b).toLowerCase(), h = (a + "-" + b).toLowerCase();
    if (vocab.has(j)) return a + b;
    if (vocab.has(h)) return a + "-" + b;
    return /^[A-Z]/.test(b) ? a + " - " + b : a + b;
  });
  return t.match(TOK) || [];
}

/* Each sûrah's stretch of a witness, found by 6-grams that occur once in Gutenberg and once in the
   witness, keeping the longest chain that rises on both sides. */
function windows(W, gTok) {
  const N = 6, gCount = new Map();
  for (const s in gTok) for (let i = 0; i + N <= gTok[s].length; i++) {
    const k = gTok[s].slice(i, i + N).join(" "); gCount.set(k, (gCount.get(k) || 0) + 1);
  }
  const lw = W.map((x) => x.toLowerCase()), idx = new Map();
  for (let i = 0; i + N <= lw.length; i++) { const k = lw.slice(i, i + N).join(" "); idx.set(k, idx.has(k) ? -1 : i); }
  const win = {};
  for (const s in gTok) {
    const gt = gTok[s], hits = [];
    for (let i = 0; i + N <= gt.length; i++) {
      const k = gt.slice(i, i + N).join(" ");
      if (gCount.get(k) === 1 && idx.get(k) >= 0) hits.push([i, idx.get(k)]);
    }
    if (!hits.length) continue;
    const tails = [], prev = Array(hits.length).fill(-1);
    hits.forEach(([, p], h) => {
      let lo = 0, hi = tails.length;
      while (lo < hi) { const m = (lo + hi) >> 1; if (hits[tails[m]][1] < p) lo = m + 1; else hi = m; }
      if (lo > 0) prev[h] = tails[lo - 1];
      tails[lo] = h;
    });
    const ok = []; for (let h = tails[tails.length - 1]; h >= 0; h = prev[h]) ok.unshift(hits[h]);
    const f = ok[0], l = ok[ok.length - 1];
    const a = Math.max(0, f[1] - f[0] - 3), b = l[1] + (gt.length - l[0]) + 3;
    // a stretch much shorter or longer than the sûrah is a scan with pages missing, or a stray match
    if ((b - a) / gt.length >= 0.9 && (b - a) / gt.length <= 2.5) win[s] = [a, b];
  }
  return win;
}

/* A witness against Gutenberg's tokens: for each token what the witness has in its place, and what it
   has inserted before it. */
function slots(gt, wt) {
  const ins = Array(gt.length + 1).fill(null), rep = Array(gt.length).fill(null);
  const parts = diffArrays(gt, wt);
  let gi = 0;
  for (let k = 0; k < parts.length; k++) {
    let p = parts[k];
    if (!p.added && !p.removed) { gi += p.count; continue; }
    if (p.added && parts[k + 1] && parts[k + 1].removed) { parts[k] = parts[k + 1]; parts[k + 1] = p; p = parts[k]; }
    if (p.removed) {
      const nx = parts[k + 1], add = nx && nx.added ? nx.value : [];
      if (nx && nx.added) k++;
      for (let j = 0; j < p.count; j++) rep[gi + j] = j === 0 ? add.join(" ") : "";
      gi += p.count;
    } else ins[gi] = (ins[gi] ? ins[gi] + " " : "") + p.value.join(" ");
  }
  return { ins, rep };
}

async function main() {
  if (process.argv.includes("--fetch") || !fs.existsSync(path.join(CACHE, "ocr-A.txt"))) await fetchAll();
  if (!fs.existsSync(path.join(CACHE, "en-pg.txt"))) throw new Error("run `node .claude/fetch-book.js quran` first (it caches the Gutenberg text)");
  const G = gutenberg();
  const vocab = new Set(), gTok = {};
  for (let s = 1; s <= 114; s++) {
    gTok[s] = [];
    G[s].forEach((v) => (fold(v).match(TOK) || []).forEach((t) => { vocab.add(t.toLowerCase()); gTok[s].push(t.toLowerCase()); }));
  }
  const WIT = {}, WIN = {};
  for (const k in OCR_SOURCES) {
    WIT[k] = prepOcr(fs.readFileSync(path.join(CACHE, "ocr-" + k + ".txt"), "utf8"), vocab);
    WIN[k] = windows(WIT[k], gTok);
  }
  /* A word is KNOWN if Gutenberg has it, or if at least four witnesses each read it twice or more
     somewhere in the book — so the edition's own spellings (stedfast, judgement, mayest) pass, and a
     one-off misreading or misprint (whch, whosover) is held for a person. */
  const VOC = new Set(vocab), seen = new Map();
  for (const k in WIT) {
    const c = new Map(); WIT[k].forEach((w) => { const l = w.toLowerCase(); c.set(l, (c.get(l) || 0) + 1); });
    for (const [w, n] of c) if (n >= 2) seen.set(w, (seen.get(w) || 0) + 1);
  }
  for (const [w, n] of seen) if (n >= 4) VOC.add(w);
  const edits = [], held = [];
  const tally = { taken: 0, accepted: 0, rejected: 0, held: 0, compound: 0 };
  for (let s = 1; s <= 114; s++) {
    const gt = [], verseOf = [], posIn = [];
    G[s].forEach((v, vi) => (fold(v).match(TOK) || []).forEach((t, ti) => { gt.push(t); verseOf.push(vi); posIn.push(ti); }));
    const SL = {};
    for (const k in WIT) if (WIN[k][s]) SL[k] = slots(gt, WIT[k].slice(WIN[k][s][0], WIN[k][s][1]));
    const n2 = 2 * gt.length + 1;
    const val = (k, x) => (x % 2 === 0 ? SL[k].ins[x / 2] : SL[k].rep[(x - 1) / 2]);
    const changed = new Uint8Array(n2);
    for (const k in SL) for (let x = 0; x < n2; x++) if (val(k, x) !== null) changed[x] = 1;
    const text = (k, a, b) => {
      const r = [];
      for (let x = a; x <= b; x++) {
        const v = k ? val(k, x) : null, g = x % 2 ? gt[(x - 1) / 2] : null, t = v !== null ? v : g;
        if (t) r.push(t);
      }
      return r.join(" ").replace(/\s+/g, " ").trim();
    };
    for (let a = 0; a < n2; a++) {
      if (!changed[a]) continue;
      let b = a; while (b + 1 < n2 && changed[b + 1]) b++;
      const region = [a, b]; a = b;
      const gtxt = text(null, ...region);
      const score = new Map();
      for (const k in SL) { const t = text(k, ...region); score.set(t, (score.get(t) || 0) + 1); }
      const gs = score.get(gtxt) || 0;
      let best = null, bs = 0;
      for (const [x, sc] of score) if (x !== gtxt && sc > bs) { best = x; bs = sc; }
      const t0 = Math.ceil((region[0] - 1) / 2), t1 = Math.floor((region[1] - 1) / 2); // tokens replaced
      const anchor = Math.min(region[0] % 2 ? (region[0] - 1) / 2 : region[0] / 2, gt.length - 1);
      const v0 = verseOf[anchor], v1 = t1 >= t0 ? verseOf[t1] : v0;
      const ref = s + ":" + (v0 + 1);
      if (s === 1 && v0 === 0) continue; // the invocation is the first verse of Sûrah I, and is stripped from the witnesses
      const votes = [...score].sort((p, q) => q[1] - p[1]).map(([x, sc]) => sc + "×" + JSON.stringify(x)).join(" ");
      let take = best !== null && bs >= 4 && gs <= 1 ? best : null;
      if (take !== null) take = take.split(" ").filter((w) => w !== "'").join(" ");
      const key = (t) => ref + "|" + gtxt + "|" + t;
      let why = "";
      if (take !== null && REJECT.has(key(take))) { tally.rejected++; continue; }
      if (take === null) {
        // a held reading a person has accepted
        const acc = [...score.keys()].find((x) => ACCEPT.has(key(x)));
        if (!acc) { if (gs <= 2) held.push({ ref, g: gtxt, votes, why: "Gutenberg weakly supported" }); continue; }
        take = acc; tally.accepted++; why = "accepted";
      } else if (ACCEPT.has(key(take))) { tally.accepted++; why = "accepted"; }
      if (take === gtxt) continue;
      if (!why) {
        const unk = (take.match(/[A-Za-z]+(?:['-][A-Za-z]+)*/g) || []).filter((w) => !VOC.has(w.toLowerCase()));
        const ga = gtxt.split(" ").filter(Boolean), ta = take.split(" ").filter(Boolean);
        if (take.replace(/[\s-]/g, "") === gtxt.replace(/[\s-]/g, "")) { tally.compound++; continue; }
        if (unk.length) why = "unknown word " + unk.join(",");
        else if (ta.length - ga.length > 2 || ga.length - ta.length > 3) why = "too large";
        else if (/[^A-Za-z0-9'\-,.;:!?() "]/.test(take)) why = "odd characters";
        else if (/\b[A-Z]{2,}\b/.test(take) && !/\b[A-Z]{2,}\b/.test(gtxt)) why = "capitals";
        if (why) { held.push({ ref, g: gtxt, votes, why }); tally.held++; continue; }
        tally.taken++;
      }
      if (v0 !== v1) { held.push({ ref, g: gtxt, votes, why: "crosses a verse" }); tally.held++; continue; }
      // verse-local position: `at` the first token replaced (or the insertion point), `del` tokens replaced
      const del = t1 >= t0 ? t1 - t0 + 1 : 0;
      const at = del ? posIn[t0] : region[0] / 2 < gt.length ? posIn[region[0] / 2] : (fold(G[s][v0]).match(TOK) || []).length;
      edits.push({ s, v: v0 + 1, at, del, g: gtxt, t: take, votes: bs || "manual" });
    }
  }
  for (const f of FIXES) {
    const toks = fold(G[f.s][f.v - 1]).match(TOK) || [], want = f.g.split(" ");
    // positions the vote has not already edited, so the fix lands on what is left of Gutenberg's text
    const done = new Set(edits.filter((e) => e.s === f.s && e.v === f.v).flatMap((e) => Array.from({ length: e.del }, (_, i) => e.at + i)));
    const hits = [];
    for (let i = 0; i + want.length <= toks.length; i++)
      if ((f.at === undefined || f.at === i) && want.every((w, j) => toks[i + j] === w && !done.has(i + j))) hits.push(i);
    if (hits.length !== 1) throw new Error("fix " + f.s + ":" + f.v + " \"" + f.g + "\" found " + hits.length + " times");
    edits.push({ s: f.s, v: f.v, at: hits[0], del: want.length, g: f.g, t: f.t, votes: "manual" });
    tally.accepted++;
  }
  edits.sort((p, q) => p.s - q.s || p.v - q.v || p.at - q.at);
  const out = {
    about: "Pickthall's 1930 wording over Project Gutenberg #16955, generated by .claude/quran-readings.js — do not edit by hand",
    witnesses: OCR_SOURCES,
    edits,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 0).replace(/\},\{/g, "},\n{") + "\n");
  fs.writeFileSync(path.join(CACHE, "held.json"), JSON.stringify(held, null, 1));
  console.log("  " + edits.length + " readings written (" + tally.taken + " by vote, " + tally.accepted + " accepted by hand); " +
    tally.rejected + " refused by hand, " + tally.compound + " compound-word changes left to Gutenberg, " + held.length +
    " regions held (book-cache/quran/held.json)");
}
main().catch((e) => { console.error(e); process.exit(1); });
