#!/usr/bin/env node
/* .claude/book-spell.js — A SHIPPED BOOK READ AGAINST A DICTIONARY (Nov 2026, the Library audit).

     node .claude/book-spell.js <bookId> [--json] [--max=N]
     node .claude/book-spell.js --all            # one line per book, for sizing a pass
     node .claude/book-spell.js --all --json     # every candidate, for a reviewed pass

   The fourth word scanner, beside book-scan.js (a rare word one scan-confusion from a common one, the
   book as its own dictionary), book-vary.js (one name written two ways) and book-audit.js (what a
   finished book cannot contain). Those three were written with NO dictionary on purpose — there was
   none in the sandbox — and that leaves three kinds of slip none of them reaches:

     · a slip whose right reading is NOT elsewhere in the book four times (book-scan's floor);
     · a slip that is a dropped, added or swapped letter rather than a confused shape
       ("goverment", "recieve", "thier"), which book-scan refuses because without a dictionary a
       shortened word reaches every shorter real word;
     · a REAL word in the wrong place, the scan's commonest silent fault: "arid" for "and",
       "modem" for "modern", "lie was" for "he was", "tbe". A dictionary passes every one, so these
       are a short declared list of improbable PAIRS, read in their sentence.

   A CANDIDATE IS EVIDENCE AND NEVER A VERDICT — the shelf's standing rule. Most of what an 1890s
   translation writes that a modern wordlist lacks is the translation ("shew", "connexion", "to-day").
   A candidate becomes a `fixes` row in fetch-book.js only when the printed page has been read.

   THE DICTIONARY IS NOT IN THE REPO (the golden rule: nothing but vendor/ ships a library). Install it
   outside and reach it through NODE_PATH, exactly as Playwright is:

     mkdir -p "$SCRATCH/dict" && cd "$SCRATCH/dict" && npm init -y && npm i an-array-of-english-words wordlist-english
     NODE_PATH="$SCRATCH/dict/node_modules" node .claude/book-spell.js <bookId>

   Without it the script says so and exits 0: a check that cannot run must not fail a build.

   WHAT IS NOT A CANDIDATE, each measured over the shelf:
     · a word the book writes three times or more — an author's own word, not a slip;
     · a word three or more BOOKS write — the period's spelling (.claude/book-spell-allow.json holds
       the ones this pass read and passed, with the reason for each group);
     · a word carrying a letter outside a–z — a name, a transliteration, a ligature;
     · a word that only ever stands capitalised — a name. (A slip in a name is book-vary's job.)
     · text inside <i>, which on this shelf is a quoted foreign phrase far more often than emphasis.

   Not part of the site. */

const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "books");
const args = process.argv.slice(2);
const JSON_OUT = args.includes("--json");
const ALL = args.includes("--all");
const MAX = +(args.find((a) => a.startsWith("--max=")) || "--max=400").slice(6);
const ID = args.find((a) => !a.startsWith("--"));
if (!ALL && !ID) { console.log("usage: node .claude/book-spell.js <bookId> | --all  [--json] [--max=N]"); process.exit(0); }

let words, scowl;
try { words = require("an-array-of-english-words"); scowl = require("wordlist-english"); }
catch (e) {
  console.log("book-spell: no dictionary on NODE_PATH — see this file's header for the two-line install. Skipped.");
  process.exit(0);
}
const DICT = new Set(words);
const COMMON = new Set();
for (const k of Object.keys(scowl)) {
  const tier = +(k.split("/").pop());
  for (const w of scowl[k]) { const l = w.toLowerCase(); DICT.add(l); if (tier && tier <= 50) COMMON.add(l); }
}
let ALLOW = {};
try { ALLOW = JSON.parse(fs.readFileSync(path.join(__dirname, "book-spell-allow.json"), "utf8")); } catch (e) {}
const ALLOW_ALL = new Set([].concat(...Object.values(ALLOW.shelf || {})));
const allowFor = (id) => new Set((ALLOW.books && ALLOW.books[id]) || []);

global.window = { FOLIO_BOOKS_IN: [], FOLIO_BOOK_ORIG_IN: [] };
const files = fs.readdirSync(DIR).filter((f) => /^[a-z0-9-]+\.js$/.test(f));
for (const f of files) if (ALL || f === ID + ".js") require(path.join(DIR, f));
const books = window.FOLIO_BOOKS_IN;
if (!books.length) { console.log("no such book: " + ID); process.exit(1); }

const ENT = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&nbsp;": " " };
function plain(html) {
  return String(html || "")
    .replace(/<i\b[^>]*>[\s\S]*?<\/i>/g, " ¦ ")           // quoted foreign phrases; ¦ keeps pairs from forming across the gap
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/g, " ")
    .replace(/<(?:table|pre)\b[\s\S]*?<\/(?:table|pre)>/g, " ¦ ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:amp|lt|gt|quot|nbsp);/g, (m) => ENT[m])
    .replace(/&#(\d+);/g, (m, d) => String.fromCharCode(+d))
    .replace(/\s+/g, " ");
}
const stem = (w) => {
  if (DICT.has(w)) return true;
  if (/'s$/.test(w) && DICT.has(w.slice(0, -2))) return true;
  if (/s'$/.test(w) && DICT.has(w.slice(0, -1))) return true;
  // the period's regular forms a modern list lacks: -eth, -est, un-, -ness, -ly, -'d, a- and be- prefixes
  const m = /^(.*?)(eth|est|edst|'d|'st|ings?|ness|less|ly|like|ward|wards|ship|hood|wise)$/.exec(w);
  if (m && m[1].length > 2 && (DICT.has(m[1]) || DICT.has(m[1] + "e") || (/(.)\1$/.test(m[1]) && DICT.has(m[1].slice(0, -1))) || (/i$/.test(m[1]) && DICT.has(m[1].slice(0, -1) + "y")))) return true;
  const p = /^(un|re|over|under|out|fore|mis|non|pre|self|well|ill|a|be|en|dis|in|co|counter|after|up)(.+)$/.exec(w);
  if (p && p[2].length > 3 && DICT.has(p[2])) return true;
  return false;
};

/* one edit away, by the edits a compositor or a typist makes: a letter dropped, added, changed or two
   swapped — and the scan's own shape confusions, which are more than one letter wide */
const SHAPES = [["rn", "m"], ["m", "rn"], ["li", "h"], ["h", "li"], ["cl", "d"], ["d", "cl"], ["ii", "n"], ["ii", "u"], ["vv", "w"], ["w", "vv"],
  ["tb", "th"], ["lh", "th"], ["ih", "th"], ["Ii", "h"], ["nn", "m"], ["in", "m"], ["m", "in"], ["iu", "in"], ["ni", "m"], ["ri", "n"], ["fi", "h"], ["ti", "h"]];
const ABC = "abcdefghijklmnopqrstuvwxyz";
function neighbours(w) {
  const out = new Set();
  for (let i = 0; i <= w.length; i++) {
    if (i < w.length) {
      out.add(w.slice(0, i) + w.slice(i + 1));                                   // dropped
      for (const c of ABC) if (c !== w[i]) out.add(w.slice(0, i) + c + w.slice(i + 1)); // changed
      if (i < w.length - 1) out.add(w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2)); // swapped
    }
    for (const c of ABC) out.add(w.slice(0, i) + c + w.slice(i));                // added
  }
  for (const [a, b] of SHAPES) { let k = w.indexOf(a); while (k >= 0) { out.add(w.slice(0, k) + b + w.slice(k + a.length)); k = w.indexOf(a, k + 1); } }
  out.delete(w);
  return out;
}

/* A REAL WORD IN THE WRONG PLACE. Each row is a pattern no English sentence of these books should hold
   and the reading it is a scan of. Kept short and read in context: every one fires on something right
   somewhere ("he bad them farewell" is Malory's own past tense), which is why the output is a list. */
const PAIRS = [
  [/\b(?:lie|ho|bo|lic|hc) (?:was|had|said|would|could|did|has|came|went|saw|took|gave|made|himself)\b/g, "he …"],
  [/\b(?:to|will|shall|would|may|might|must|can|could|should|cannot) (?:bo|bc)\b/g, "to be"],
  [/\barid (?:the|a|an|he|she|they|it|we|I|his|her|their|in|of|to|that|this|when|then|so|not|all|was|were|had|with|for|by|from)\b/g, "and"],
  [/\b(?:the|a|this|that|his|her|their|of|in|and) modem\b|\bmodem (?:times|writers|world|history|days|authors|science|languages?|nations?|philosophers?|critics|editors|readers|sense|name)\b/g, "modern"],
  [/\b(?:of|in|to|by|from|with|and|for|on|at|upon|into|all|that) (?:tile|tlie|tbe|thc|tiie|tne|ihe|llie|tlic|thie|tlio) (?=[a-z])/g, "the"],
  [/\b(?:tlie|tbe|thc|tiie|tne|ihe|llie|tlic|tlio|aud|aiid|amd|anid|wlio|wliich|wbich|whicli|witli|wilh|bave|liave|tbat|tliat|thal|tbis|tliis|tbey|tliey|tbere|tliere|tbeir|tlieir|wben|wlien|wbat|wliat|bim|liim|sbe|slie|wero|bcen|heen|bcing|froin|frcm|fiom|irom|iuto|iato|uot|nnd|nud|oue|ouly|ofthe|inthe|tothe|iu|ot|aro|nre|wns|wus|waa|hns|hnd|hud|hia|bia|thau|tban|tlian|tbem|tliem|tbus|tlius|tbou|tliou|tby|tliy|tbee|tliee|sucb|sucli|mucb|mucli|eacb|eacli|otber|otlier|motber|fatber|brotber|wbo|wbom|wliom|wbose|wliose|wbere|wliere|wbile|wliile|wbole|wliole|tbing|tliing|tbings|tliings|tbrough|tlirough|tbose|tliose|tbese|tliese|tben|tlien|witb|upou|npon|uuder|nnder|auy|nny|mauy|mnny|maii|meu|mcn|kiug|kmg|gieat|grcat|bcfore|beforo|aftcr|agaiu|agaiust|betweeu|becanse|bccause|sball|sliall|sbould|sliould|wbicb|wlieu|wlieii|theni|thein|sonie|soine|tinie|tiine|nanie|naine|caine|conie|coine|honie|hoine|niade|inade|niake|inake|niore|inore|niost|inost|niust|inust|niuch|inuch|niight|inight|nien|rnan|rnen|frorn|thern|sarne|narne|tirne|sorne|horne|corne|carne|rnade|rnake|rnore|rnost|rnust|rnuch)\b/g, "a scan's reading"],
  [/\b(?:he|she|they|we|I|it|who|which|that) (?:liad|liave|lias) /g, "had / have"],
  [/\b(?:the the|and and|of of|to to|a a|an an|with with|from from|for for|was was|were were|but but|they they|their their|which which|been been|would would|when when|have have|this this|his his|not not|in in|on on|by by|at at|he he|she she|we we|or or|as as|be be|are are|has has|into into|upon upon|them them|him him|my my|our our|your your|its its|who who|what what|if if|then then|than than|there there|shall shall|should should|could could|may may|must must)\b/g, "a doubled word"],
];

/* A FOREIGN RUN IS NOT A LIST OF SLIPS. A translator's note quotes Latin, French and German by the
   line, mostly outside <i>, and every word of it is missing from an English list: measured on the
   first run, 345 of the Republic's 728 candidates were Shorey quoting somebody. A word is a candidate
   only where it stands ALONE — at most one other unknown word among the three on each side. */
const known = (l) => DICT.has(l) || stem(l);
function scan(b) {
  const allow = allowFor(b.id);
  const freq = new Map(), lowerSeen = new Set(), where = new Map();
  const pairHits = [], hyph = [];
  for (const c of b.chapters) {
    const parts = [c.html].concat((c.notes || []).map((n) => (typeof n === "string" ? n : n && (n.html || n.t || n.text)) || ""));
    parts.forEach((h, pi) => {
      const text = plain(h);
      const re = /[A-Za-z]+(?:['’][a-z]+)?/g; let m;
      const toks = [];
      while ((m = re.exec(text))) {
        const raw = m[0].replace(/’/g, "'");
        // a letter outside a–z on either side means this is a piece of a name or a transliteration
        const odd = /[^\x00-\x7f]/.test(text[m.index - 1] || "") || /[^\x00-\x7f]/.test(text[re.lastIndex] || "");
        const l = raw.toLowerCase();
        toks.push({ l, raw, i: m.index, odd, ok: odd || raw.length < 3 || known(l) });
      }
      toks.forEach((t, k) => {
        if (t.odd) return;
        freq.set(t.l, (freq.get(t.l) || 0) + 1);
        if (t.raw === t.l) lowerSeen.add(t.l);
        if (t.ok) return;
        let bad = 0;
        for (let j = Math.max(0, k - 3); j <= Math.min(toks.length - 1, k + 3); j++) if (j !== k && !toks[j].ok) bad++;
        const alone = bad <= 1;
        const prev = where.get(t.l);
        if (!prev || (alone && !prev.alone))
          where.set(t.l, { alone, ch: c.n, note: pi > 0, ctx: text.slice(Math.max(0, t.i - 70), t.i + t.raw.length + 70) });
      });
      for (const [rx, reading] of PAIRS) {
        rx.lastIndex = 0; let pm;
        while ((pm = rx.exec(text))) pairHits.push({ ch: c.n, note: pi > 0, hit: pm[0], reading, ctx: text.slice(Math.max(0, pm.index - 70), pm.index + pm[0].length + 70).trim() });
      }
      /* A LINE-BREAK HYPHEN LEFT IN A WORD ("obliter- ated", "pas- senger"): the printed line ended
         there and the transcription kept both the hyphen and the space. Not "two- or three-fold". */
      const hy = /\b([A-Za-z]{2,})- ([a-z]{2,})\b/g; let hm;
      while ((hm = hy.exec(text))) {
        if (/^(?:and|or|nor|to|but|as|than|if|not|the|a|an|of|in|on|for|by|with|at|from|is|was|are|were|be|it|he|she|they|we|that|this|which|who|his|her|their|so|then|when|what|how|no|yes|i|you|my|me|him|them|us|our|your|all|one|two|had|has|have|will|shall|would|should|may|might|can|could|do|did|does|let|go|come|said|say|see|there|here|now|thou|thy|thee|ye|oh|ah|alas|nay|aye|well|why|where|whence|whither|more|most|some|any|each|every|both|either|neither|such|only|even|still|yet|just|also|too|very|much|many|few|little|great|good|old|new|first|last|next|other|another|same|own|like|unlike|into|upon|unto|over|under|after|before|between|among|through|against|without|within|about|above|below|behind|beyond|near|far|out|up|down|off|away|back|again|once|twice|never|ever|always|often|sometimes|perhaps|indeed|truly|surely|certainly|however|therefore|thus|hence|because|since|though|although|unless|until|till|while|whilst|whereas)$/.test(hm[2])) continue;
        const joined = (hm[1] + hm[2]).toLowerCase();
        if (known(joined) && !(known(hm[2]) && COMMON.has(hm[2]) && hm[2].length > 4 && !COMMON.has(joined)))
          hyph.push({ ch: c.n, note: pi > 0, hit: hm[0], to: hm[1] + hm[2], ctx: text.slice(Math.max(0, hm.index - 50), hm.index + hm[0].length + 50).trim() });
      }
    });
  }
  const cands = [];
  for (const [w, x] of where) {
    const n = freq.get(w) || 0;
    if (!x.alone || n > 2 || w.length < 3 || !lowerSeen.has(w)) continue;
    if (ALLOW_ALL.has(w) || allow.has(w)) continue;
    if (/^[ivxlcdm]+$/.test(w)) continue;                       // a roman numeral
    let best = null, score = 0;
    for (const nb of neighbours(w)) {
      if (!DICT.has(nb)) continue;
      const inBook = freq.get(nb) || 0;
      const s = (inBook >= 4 ? 3 : inBook ? 2 : 0) + (COMMON.has(nb) ? 2 : 1);
      if (s > score) { score = s; best = nb; }
    }
    // two words run together ("formy", "ofthe"), both of them everyday words
    for (let k = 2; k <= w.length - 2; k++) {
      const p = w.slice(0, k), q = w.slice(k);
      if (COMMON.has(p) && COMMON.has(q) && (p.length > 2 || /^(?:of|to|in|on|at|by|it|is|he|we|my|as|an|be|or|so|no|if|up|do|me|us)$/.test(p)) && (q.length > 2 || /^(?:of|to|in|on|at|by|it|is|he|we|my|as|an|be|or|so|no|if|up|do|me|us)$/.test(q)) && score < 5) { best = p + " " + q; score = 4; }
    }
    cands.push({ w, n, guess: best, score, ch: x.ch, note: x.note, ctx: x.ctx.trim() });
  }
  cands.sort((a, b2) => b2.score - a.score || a.w.localeCompare(b2.w));
  return { cands, pairHits, hyph, freq };
}

/* A WORD THREE BOOKS WRITE IS THE PERIOD'S, NOT A SLIP — but only --all can know it, so a single-book
   run reads the shelf's count from the cache the last --all left beside the allow list. */
const SHELF_CACHE = path.join(__dirname, "book-cache", "spell-shelf.json");
let shelf = null;
if (ALL) {
  shelf = {};
  var results = books.map((b) => { const r = scan(b); for (const c of r.cands) shelf[c.w] = (shelf[c.w] || 0) + 1; return [b, r]; });
  try { fs.mkdirSync(path.dirname(SHELF_CACHE), { recursive: true }); fs.writeFileSync(SHELF_CACHE, JSON.stringify(shelf)); } catch (e) {}
} else {
  try { shelf = JSON.parse(fs.readFileSync(SHELF_CACHE, "utf8")); } catch (e) { shelf = {}; }
  var results = books.map((b) => [b, scan(b)]);
}
const out = {};
let total = 0, totalPairs = 0, totalHyph = 0;
for (const [b, r] of results) {
  const cands = r.cands.filter((c) => (shelf[c.w] || 0) < 3);
  out[b.id] = { words: cands, pairs: r.pairHits, hyphens: r.hyph };
  total += cands.length; totalPairs += r.pairHits.length; totalHyph += r.hyph.length;
  if (JSON_OUT) continue;
  if (ALL) { console.log(String(cands.length).padStart(6) + " words  " + String(r.pairHits.length).padStart(5) + " pairs  " + String(r.hyph.length).padStart(5) + " hyphens   " + b.id); continue; }
  console.log("== " + b.id + " — " + cands.length + " word(s) no dictionary has, " + r.pairHits.length + " improbable pair(s), " + r.hyph.length + " line-break hyphen(s)\n");
  for (const c of cands.slice(0, MAX))
    console.log("  " + c.w.padEnd(18) + (c.guess ? "→ " + c.guess.padEnd(16) : "".padEnd(18)) + " ch" + c.ch + (c.note ? " note" : "") + "  …" + c.ctx + "…");
  if (cands.length > MAX) console.log("  … and " + (cands.length - MAX) + " more (--max=N)");
  if (r.pairHits.length) console.log("");
  for (const p of r.pairHits.slice(0, MAX)) console.log("  [" + p.reading + "]  ch" + p.ch + (p.note ? " note" : "") + "  …" + p.ctx + "…");
  for (const p of r.hyph.slice(0, MAX)) console.log("  [" + p.hit + " → " + p.to + "]  ch" + p.ch + (p.note ? " note" : "") + "  …" + p.ctx + "…");
}
if (JSON_OUT) console.log(JSON.stringify(out));
else if (ALL) console.log("\n" + total + " word candidates, " + totalPairs + " improbable pairs and " + totalHyph + " line-break hyphens in " + results.length + " books.\nA candidate is evidence and never a verdict: read it against the printed page.");
