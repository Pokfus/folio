/* .claude/ocr-vote.js — a Library book read off SEVERAL OCRs of the same printing, voted word by word.
   Used by .claude/fetch-book.js for `layout: "ocrvote"` (Nov 2026: Dubs's Hsüntze and Mei's Motse, the first
   books on the shelf with no transcription anywhere — Wikisource, Gutenberg and ctext have neither; see
   docs/library-importer.md, "The ocrvote layout"). Not part of the site; zero dependencies, except that a
   witness of `kind: "pdf"` is read through poppler's `pdftotext -bbox-layout`.

   THE STEPS, each a function below:
   1. PAGES — every witness is read as words with boxes: an archive.org `_djvu.xml` (`djvuPages`) or a PDF's
      text layer (`bboxPages`). Words are grouped into printed rows (`rowsOf`).
   2. THE BODY — on each page the column is found from the rows' own ends and starts (`pageBody`): words
      outside it are margin (Dubs's side-glosses and Wang Hsien-ch'ien's folio numbers), the top row set off
      by a gap or in capitals is the running head, the run of small rows at the foot is the footnotes. Only
      the body is kept. Footnote marks in the body (raised figures, ^ ® * and their kin) are dropped.
   3. THE STREAM — rows become paragraphs (first-line indent, a short last line), verse (an indent past
      `verseInd` line heights) and heads (capitals); a line-end hyphen is joined across the break.
   4. THE VOTE — each further witness is aligned to the first (`align`: unique words as anchors, then a
      longest-common-subsequence inside each gap) and every disagreement is settled (`vote`): two witnesses
      against one win; otherwise the reading whose words are English (the shelf's other books are the
      dictionary) wins; a tie between two English readings goes to the one the shelf's word pairs support
      ("he said" over "be said"). Before alignment each token that is not a word is repaired where exactly
      one OCR confusion makes it one (`mkFixer`: b/h, li/h, rn/m, the "M" one scan reads for "hi" …).
   5. THE TEXT — prose broken without cause is rejoined, a lone indented line that reads as prose goes back
      to prose, and a rare unknown word one confusion from a frequent word of the same book takes it
      (`internalFix`). The entry's own `fixes` run after this, in fetch-book.js, as for every book.
   Every count is printed; nothing here invents a word — every reading comes from one of the scans. */
"use strict";
const fs = require("fs");
const path = require("path");
const SHELF = { dir: path.join(__dirname, "..", "books"), self: "" };
/* ---------- ocr ---------- */
/* prototype: OCR pages -> body lines */
const ent = (s) => s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
function djvuPages(xml) {
  const pages = [];
  for (const m of xml.matchAll(/<OBJECT\b([^>]*)>([\s\S]*?)<\/OBJECT>/g)) {
    const a = m[1];
    const leaf = +(/usemap="[^"]*_(\d{4})\.djvu"/.exec(a) || [])[1];
    const words = [];
    for (const l of m[2].matchAll(/<LINE\b[^>]*>([\s\S]*?)<\/LINE>/g)) {
      const lw = [];
      for (const w of l[1].matchAll(/<WORD coords="(\d+),(\d+),(\d+),(\d+)[^"]*"[^>]*>([^<]*)<\/WORD>/g)) {
        const t = ent(w[5]).trim();
        if (t) lw.push({ x0: +w[1], y1: +w[2], x1: +w[3], y0: +w[4], t });
      }
      if (lw.length) words.push(lw);
    }
    pages.push({ leaf, w: +(/width="(\d+)"/.exec(a) || [])[1], h: +(/height="(\d+)"/.exec(a) || [])[1], lines: words });
  }
  return pages;
}
function bboxPages(html) {
  const pages = []; let leaf = 0;
  for (const m of html.matchAll(/<page width="([\d.]+)" height="([\d.]+)">([\s\S]*?)<\/page>/g)) {
    const S = 10; const lines = [];
    for (const l of m[3].matchAll(/<line\b[^>]*>([\s\S]*?)<\/line>/g)) {
      const lw = [];
      for (const w of l[1].matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g)) {
        const t = ent(w[5]).trim();
        if (t) lw.push({ x0: +w[1] * S, y0: +w[2] * S, x1: +w[3] * S, y1: +w[4] * S, t });
      }
      if (lw.length) lines.push(lw);
    }
    pages.push({ leaf: leaf++, w: +m[1] * S, h: +m[2] * S, lines });
  }
  return pages;
}
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : 0; };
/* rows: group all words of a page into visual rows by vertical overlap */
function rowsOf(page) {
  const ws = [].concat(...page.lines).filter((w) => w.y1 > w.y0);
  const big = ws.filter((w) => /[A-Za-z]{3}/.test(w.t));
  const H = med(big.map((w) => w.y1 - w.y0)) || 40;
  const main = ws.filter((w) => w.y1 - w.y0 >= H * 0.5 && /[A-Za-z0-9\u4e00-\u9fff]/.test(w.t));
  const small = ws.filter((w) => !(w.y1 - w.y0 >= H * 0.5 && /[A-Za-z0-9\u4e00-\u9fff]/.test(w.t)));
  main.sort((a, b) => (a.y0 + a.y1) - (b.y0 + b.y1));
  const rows = [];
  for (const w of main) {
    const c = (w.y0 + w.y1) / 2, h = w.y1 - w.y0;
    let best = null, bd = 1e9;
    for (const r of rows.slice(-5)) { const d = Math.abs(c - r.c); if (d < Math.min(h, r.h) * 0.5 && d < bd) { best = r; bd = d; } }
    if (best) best.ws.push(w); else rows.push({ ws: [w], c, h });
    const r = best || rows[rows.length - 1];
    r.h = med(r.ws.map((x) => x.y1 - x.y0)); r.c = med(r.ws.map((x) => (x.y0 + x.y1) / 2));
  }
  for (const w of small) {
    const c = (w.y0 + w.y1) / 2; let best = null, bd = 1e9;
    for (const r of rows) { const d = Math.abs(c - r.c); if (d < r.h * 0.9 && d < bd) { best = r; bd = d; } }
    if (best) best.ws.push(w); else rows.push({ ws: [w], c, h: w.y1 - w.y0 });
  }
  rows.forEach((r) => { r.ws.sort((a, b) => a.x0 - b.x0); r.x0 = r.ws[0].x0; r.x1 = r.ws[r.ws.length - 1].x1; r.y0 = Math.min(...r.ws.map((w) => w.y0)); r.y1 = Math.max(...r.ws.map((w) => w.y1)); });
  rows.sort((a, b) => a.c - b.c);
  return rows;
}

/* ---------- body ---------- */
/* classify one page's rows: returns {head, body:[{t, x0, x1, ind, words}], notes:[...], margin:[...], L, R, H} */
function pageBody(p, opt = {}) {
  let rows = rowsOf(p);
  const longRows = rows.filter((r) => r.ws.length >= 5);
  if (!longRows.length) return { body: [], notes: [], margin: [], drop: rows.map((r) => r.ws.map((w) => w.t).join(" ")) };
  const hs0 = longRows.map((r) => r.h).sort((a, b) => a - b); let H = opt.H || hs0[Math.floor(hs0.length * 0.75)];
  /* A page that is mostly footnote (a chapter opening with a long note) has the NOTES' size as its commonest
     row height; the book's body size, measured over the full pages, is the floor. */
  if (opt.Hglob && H < opt.Hglob * 0.9) H = opt.Hglob;
  rows = rows.filter((r) => r.h >= H * 0.45 || /[A-Za-z]{2}/.test(r.ws.map((w) => w.t).join("")) && r.h >= H * 0.3);
  // column: right edge = median x1 of the long rows, after removing margin words estimated from the page centre
  const x1s = longRows.map((r) => r.ws.filter((w) => w.x1 < p.w * 0.97)).filter((a) => a.length).map((a) => a[a.length - 1].x1);
  let R = med(x1s);
  // lower bound on the column's right: use 60th percentile of row ends that are near R
  const x0s = longRows.map((r) => r.ws[0].x0);
  let L = med(x0s);
  const gap = H * 0.6;
  const margin = [], out = [];
  // the justified edges: the most populated cluster of row ends / row starts
  const cluster = (vals, prefer) => { let best = null, bc = -1; for (const e of vals) { const c = vals.filter((v) => Math.abs(v - e) <= H * 0.4).length; if (c > bc || (c === bc && (prefer < 0 ? e < best : e > best))) { bc = c; best = e; } } return best; };
  R = cluster(longRows.map((r) => r.x1), -1);
  // a row's end may be a margin word: use, for each row, the last word whose x1 <= cluster+0.4H if one exists
  L = cluster(longRows.map((r) => r.x0), 1);
  // L: rows mostly start at L (unindented); margin words on the left make some starts smaller, indents larger.
  const st = longRows.map((r) => { const w = r.ws.find((w) => w.x0 >= L - H * 0.4); return w ? w.x0 : r.x0; });
  L = cluster(st, -1);
  const en = longRows.map((r) => { const ws = r.ws.filter((w) => w.x1 <= R + H * 0.4); return ws.length ? ws[ws.length - 1].x1 : r.x1; });
  R = cluster(en, 1);
  if (opt.Wpx && Math.abs(L - (R - opt.Wpx)) > H * 1.5) L = R - opt.Wpx;
  for (const r of rows) {
    const keep = [], marg = [];
    // a word is margin if it lies outside the column, or is separated from the column words by a wide gap at the outer side
    for (const w of r.ws) {
      const punct = !/[A-Za-z0-9]/.test(w.t);
      if ((w.x0 >= R - H * 0.05 && !(punct && w.x0 < R + H * 0.6)) || (w.x1 <= L + H * 0.05 && !(punct && w.x1 > L - H * 0.6)) || (keep.length === 0 && w.x0 < L - H * 0.8)) marg.push(w); else keep.push(w);
    }
    // a run at the row's outer end separated by >1.5H gap and crossing the edge
    if (marg.length) margin.push(marg.map((w) => w.t).join(" "));
    if (!keep.length) continue;
    out.push({ ws: keep, x0: keep[0].x0, x1: keep[keep.length - 1].x1, c: r.c, h: med(keep.map((w) => w.y1 - w.y0)), y0: Math.min(...keep.map((w) => w.y0)), t: keep.map((w) => w.t).join(" ") });
  }
  // spacing
  const sp = [];
  for (let i = 1; i < out.length; i++) sp.push(out[i].c - out[i - 1].c);
  const S = med(sp.filter((d) => d > H * 0.8 && d < H * 3)) || H * 1.6;
  // running head: first row near the top followed by a gap
  const drop = [];
  let head = null;
  const capsy = (t) => { const l = t.replace(/[^A-Za-z]/g, ""); return l.length >= 4 && l.replace(/[^A-Z]/g, "").length / l.length > 0.6; };
  while (out.length > 1 && out[0].c < p.h * 0.2 && !/[A-Za-z0-9]{2}/.test(out[0].t)) drop.push(out.shift().t);
  while (out.length > 1 && out[0].c < p.h * (opt.headTop || 0.12) && !(opt.headExempt && opt.headExempt.test(out[0].t)) &&
    ((out[1].c - out[0].c) > S * 1.3 || capsy(out[0].t) || /W\S{1,3}KS\s+O/i.test(out[0].t) || out[0].h < H * 0.5)) { head = (head ? head + " | " : "") + out.shift().t; }
  // page number alone at the bottom
  if (out.length && /^[\divxlcIVXLC.,'’]{1,5}$/.test(out[out.length - 1].t.replace(/\s/g, "")) && out[out.length - 1].c > p.h * 0.85) drop.push(out.pop().t);
  // footnotes: the first row (after at least one body row) that is small and set off by a gap, or small and opening on a marker
  let fi = out.length;
  /* the notes cannot begin above the last full-size row of four words or more (a section head in small capitals
     above body text is not the start of the notes) */
  let lastBig = 0;
  out.forEach((r, i) => { if (r.h >= H * 0.97 && r.ws.length >= 4 && i < out.length - 1 && out[i + 1].h >= H * 0.97) lastBig = i; });
  for (let i = Math.max(1, lastBig + 1); i < out.length; i++) {
    const r = out[i];
    const small = r.h < H * opt.noteRatio;
    const gapAbove = r.c - out[i - 1].c > S * 1.25;
    if (small && !capsy(r.t) && (gapAbove || i === out.length - 1 || out[i + 1].h < H * opt.noteRatio)) {
      // all following rows mostly small?
      const rest = out.slice(i);
      const nsmall = rest.filter((x) => x.h < H * opt.noteRatio).length;
      if (nsmall >= rest.length * 0.6) { fi = i; break; }
    }
  }
  const notes = out.slice(fi).map((r) => r.t);
  const body = out.slice(0, fi).map((r) => ({ t: r.t, ws: r.ws, ind: (r.x0 - L) / H, short: (R - r.x1) / H, c: r.c, h: r.h }));
  return { head, body, notes, margin, drop, L, R, H, S, W: R - L };
}

/* ---------- stream ---------- */
/* Marks that are never text in these books: footnote marks the engine reads as these glyphs. */
function cleanTok(t, opt) {
  // glued marker chars
  t = t.replace(/[\^®©■•°¤¶§†‡¹²³⁴⁵⁶⁷⁸⁹⁰*♦»«]+/g, "");
  if (opt.digitMarks) t = t.replace(/([A-Za-zÀ-ɏ][.,;:!?)”’"']*)\d{1,2}$/, "$1").replace(/([.,;:!?)”’"])\d{1,2}$/, "$1");
  return t;
}
function isMarkTok(t, opt) {
  if (/^[\^®©■•°*’'‘"“”¤¶§†‡¹²³⁴⁵⁶⁷⁸⁹⁰]+$/.test(t) && !/^[“”"‘’']+$/.test(t)) return true;
  if (opt.digitMarks && /^\d{1,2}$/.test(t)) return true;
  return false;
}
function calibrate(pages, opt) {
  const Ws = [], Hs = [];
  for (const p of pages) { if (p.leaf < opt.from || p.leaf > opt.to) continue; const b = pageBody(p, Object.assign({}, opt, { W: 0 })); if (b.body && b.body.length > 15) { Ws.push(b.W); Hs.push(b.H); } }
  Ws.sort((a, b) => a - b); Hs.sort((a, b) => a - b);
  return { wr: Ws[Ws.length >> 1], Hglob: Hs[Hs.length >> 1] };
}
function bookStream(pages, opt) {
  const cal = calibrate(pages, opt);
  opt = Object.assign({}, opt, { Wpx: cal.wr, Hglob: cal.Hglob });
  const blocks = []; // {k:'p'|'v'|'h', words:[], leaf, cont}
  const stats = { pages: 0, heads: 0, notes: 0, margin: 0, marks: 0 };
  let cur = null;
  const flush = () => { if (cur && cur.words.length) blocks.push(cur); cur = null; };
  for (const p of pages) {
    if (p.leaf < opt.from || p.leaf > opt.to) continue;
    const b = pageBody(p, opt);
    stats.pages++;
    if (b.head) stats.heads++;
    stats.notes += b.notes.length; stats.margin += b.margin.length;
    (b.body || []).forEach((r, i) => {
      /* A ROW OF ASTERISKS, the printer's mark for a passage the translator left out: three to nine short tokens
         spread across the column, one of them a star (the OCR reads the rest as anything: "1|( * He 9it"). */
      const ts = r.ws.map((w) => w.t), span = (r.ws[r.ws.length - 1].x1 - r.ws[0].x0) / (b.R - b.L);
      if (ts.length >= 3 && ts.length <= 9 && ts.every((t) => t.length <= 3) && span > 0.45 && /[*♦]/.test(r.t)) {
        flush(); blocks.push({ k: "o", words: [], leaf: p.leaf }); stats.omissions = (stats.omissions || 0) + 1; return;
      }
      // tokens
      const words = [];
      for (let wi = 0; wi < r.ws.length; wi++) {
        const w = r.ws[wi];
        // a figure in brackets is an enumeration, "(1) When …", never a footnote mark
        if (/^\d{1,2}\)?$/.test(w.t) && wi > 0 && /\($/.test(r.ws[wi - 1].t)) { words.push(w.t); continue; }
        const raised = (w.y1 - w.y0) < r.h * 0.62 && (w.y1 < r.c + r.h * 0.1);
        if (isMarkTok(w.t, opt) || (raised && /^[\d*’'^®]{1,3}$/.test(w.t) && !/^[’']$/.test(w.t))) { stats.marks++; continue; }
        const t = cleanTok(w.t, opt); if (t !== w.t) stats.marks++;
        if (t) words.push(t);
      }
      // detached punctuation joins its word, as the other witnesses print it
      for (let k = 0; k < words.length; k++) {
        if (words[k] === "-" && k > 0) { if (k < words.length - 1) { words[k - 1] += "-" + words[k + 1]; words.splice(k, 2); } else { words[k - 1] += "-"; words.splice(k, 1); } k--; }
        else if (/^[,;:.?!)\]”’']+$/.test(words[k]) && k > 0) { words[k - 1] += words[k]; words.splice(k, 1); k--; }
        else if (/^[(\[“‘]+$/.test(words[k]) && k < words.length - 1) { words[k + 1] = words[k] + words[k + 1]; words.splice(k, 1); k--; }
      }
      if (!words.length) return;
      const txt = words.join(" ");
      /* A HEAD is a row set in capitals (eighty per cent of its letters or more) that does not run to the column's
         end, or a centred BOOK / CHAPTER line. Heads are not voted on: the tab's title is the entry's own. */
      const letters = txt.replace(/[^A-Za-z]/g, "");
      const isHead = (letters.length > 3 && r.short > 1 && letters.replace(/[^A-Z]/g, "").length / letters.length > 0.8) ||
        (/^(BOOK|CHAPTER)\b/i.test(txt) && r.ind > 2) ||
        // a centred line straight after a BOOK / CHAPTER head is its title, whatever case the OCR read it in
        (r.ind > 2 && r.short > 2 && blocks.length && !cur && blocks[blocks.length - 1].k === "h" && opt.headExempt && opt.headExempt.test(blocks[blocks.length - 1].words.join(" ")));
      const verse = !isHead && ((r.ind >= opt.verseInd && r.short > 1.0) || r.ind >= opt.verseInd + 1.2);
      const paraStart = !verse && r.ind >= 0.7 && r.ind < opt.verseInd + 1.2;
      if (isHead) { flush(); blocks.push({ k: "h", words, leaf: p.leaf }); return; }
      if (verse) {
        if (!cur || cur.k !== "v") flush(), cur = { k: "v", lines: [], words: [], leaf: p.leaf };
        cur.lines.push(words); cur.words.push(...words, "\n");
        return;
      }
      if (paraStart || !cur || cur.k !== "p") { flush(); cur = { k: "p", words: [], leaf: p.leaf, open: !paraStart }; }
      // hyphen join with previous line
      const last = cur.words[cur.words.length - 1];
      if (last && /[A-Za-z]-$/.test(last)) { cur.words[cur.words.length - 1] = last + "­" + words[0]; words.shift(); }
      cur.words.push(...words);
      if (r.short > 1.6 && !/-$/.test(cur.words[cur.words.length - 1] || "")) { flush(); }
    });
  }
  flush();
  return { blocks, stats };
}

/* ---------- merge ---------- */
/* align token arrays and vote */
const norm = (t) => t.replace(/­/g, "").toLowerCase().replace(/[^a-z0-9à-ɏ]/g, "");
/* patience-style alignment: returns array m where m[i] = j (index in b) or -1 */
function align(a, b) {
  const na = a.map(norm), nb = b.map(norm);
  const m = new Array(a.length).fill(-1);
  function lcsDP(a0, a1, b0, b1) {
    const n = a1 - a0, k = b1 - b0;
    if (!n || !k) return;
    if (n * k > 4e6) { // too big: fall back to anchoring recursively with looser uniqueness
      return;
    }
    const W = k + 1; const dp = new Uint16Array((n + 1) * W);
    for (let i = n - 1; i >= 0; i--) for (let j = k - 1; j >= 0; j--)
      dp[i * W + j] = na[a0 + i] && na[a0 + i] === nb[b0 + j] ? dp[(i + 1) * W + j + 1] + 1 : Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1]);
    let i = 0, j = 0;
    while (i < n && j < k) {
      if (na[a0 + i] && na[a0 + i] === nb[b0 + j]) { m[a0 + i] = b0 + j; i++; j++; }
      else if (dp[(i + 1) * W + j] >= dp[i * W + j + 1]) i++; else j++;
    }
  }
  function rec(a0, a1, b0, b1, depth) {
    if (a1 <= a0 || b1 <= b0) return;
    if ((a1 - a0) * (b1 - b0) <= 2.5e5 || depth > 6) return lcsDP(a0, a1, b0, b1);
    // unique tokens in both ranges
    const ca = new Map(), cb = new Map();
    for (let i = a0; i < a1; i++) if (na[i].length > 2) { const e = ca.get(na[i]); ca.set(na[i], e === undefined ? i : -2); }
    for (let j = b0; j < b1; j++) if (nb[j].length > 2) { const e = cb.get(nb[j]); cb.set(nb[j], e === undefined ? j : -2); }
    const pairs = [];
    for (const [t, i] of ca) { if (i < 0) continue; const j = cb.get(t); if (j !== undefined && j >= 0) pairs.push([i, j]); }
    pairs.sort((x, y) => x[0] - y[0]);
    // LIS on j
    const tails = [], prev = new Array(pairs.length), tailIdx = [];
    pairs.forEach((p, idx) => {
      let lo = 0, hi = tails.length;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (tails[mid] < p[1]) lo = mid + 1; else hi = mid; }
      tails[lo] = p[1]; tailIdx[lo] = idx; prev[idx] = lo ? tailIdx[lo - 1] : -1;
    });
    const anchors = []; let k = tailIdx[tails.length - 1];
    while (k !== undefined && k >= 0) { anchors.push(pairs[k]); k = prev[k]; }
    anchors.reverse();
    if (!anchors.length) return lcsDP(a0, a1, b0, b1);
    let pa = a0, pb = b0;
    for (const [i, j] of anchors) { rec(pa, i, pb, j, depth + 1); m[i] = j; pa = i + 1; pb = j + 1; }
    rec(pa, a1, pb, b1, depth + 1);
  }
  rec(0, a.length, 0, b.length, 0);
  return m;
}
/* vote: primary tokens a, others [{t:tokens, m:alignment from a}] , dict Set; returns {out: tokens array same length as a with replacements, ins: Map(i -> tokens to insert after i), del:Set, log} */
function sim(x, y) {
  const n = (r) => r.map((t) => t.toLowerCase().replace(/[^a-z]/g, "")).filter((t) => t.length > 1);
  const X = n(x), Y = n(y); if (!X.length || !Y.length) return 0;
  const cnt = new Map(); X.forEach((t) => cnt.set(t, (cnt.get(t) || 0) + 1)); let c = 0;
  Y.forEach((t) => { const v = cnt.get(t); if (v) { c++; cnt.set(t, v - 1); } });
  return c / Math.max(X.length, Y.length);
}
function vote(a, others, dict, extra) {
  const core = (t) => t.replace(/­/g, "").replace(/^[^A-Za-zÀ-ɏ0-9]+|[^A-Za-zÀ-ɏ0-9]+$/g, "");
  const known = (t) => { if (/-\u00ad/.test(t)) { const j = core(t.replace(/-\u00ad/, "")).toLowerCase(); if (dict.has(j) || (extra && extra.has(j))) return true; const ps = t.split(/-\u00ad/).map((x) => core(x).toLowerCase()); if (ps.every((x) => dict.has(x))) return true; } const c = core(t).toLowerCase().replace(/’/g, "'"); if (!c) return true; if (/^\d+$/.test(c)) return true; if (dict.has(c) || (extra && extra.has(c))) return true; const parts = c.split(/[-­]/); return parts.length > 1 && parts.every((p) => dict.has(p)); };
  const out = a.slice(), del = new Set(), ins = new Map(), pre = new Map(), ties = [], log = { sub: 0, ins: 0, del: 0, blocks: 0 };
  // per other: inverse segments: for each a-gap region (between matched i's), the unmatched run in other
  const segs = others.map(({ t, m }) => {
    const s = []; // list of {i0,i1 (exclusive) in a, j0,j1 in t}
    let pi = -1, pj = -1;
    for (let i = 0; i <= a.length; i++) {
      const j = i < a.length ? m[i] : t.length;
      if (i < a.length && j < 0) continue;
      if (i - pi > 1 || j - pj > 1) s.push({ i0: pi + 1, i1: i, j0: pj + 1, j1: j });
      pi = i; pj = j;
    }
    return s;
  });
  // matched-but-different tokens (equal norm, different raw): punctuation/case differences
  for (let i = 0; i < a.length; i++) {
    const raws = [a[i]]; others.forEach(({ t, m }) => { if (m[i] >= 0) raws.push(t[m[i]]); });
    if (raws.length >= 3 && raws[1] === raws[2] && raws[1] !== a[i]) { out[i] = raws[1]; log.sub++; }
  }
  const C = others[0];
  const runOf = (o, i0, i1) => { // other o's reading of a[i0..i1), when the span's boundaries are matched in o
    const L = i0 === 0 ? -1 : o.m[i0 - 1], R = i1 === a.length ? o.t.length : o.m[i1];
    if ((i0 > 0 && L < 0) || (i1 < a.length && R < 0) || R <= L - 0) return null;
    return o.t.slice(L + 1, R);
  };
  for (const g of segs[0]) {
    const i0 = g.i0, i1 = g.i1;
    // widen to the nearest positions matched in the third witness as well, so the spans line up
    const regs = [C.t.slice(g.j0, g.j1)].concat(others.slice(1).map((o) => runOf(o, i0, i1)));
    const aRun = a.slice(i0, i1);
    // a region is consistent for other k if it exists (other k's matches surround it too)
    const alts = regs.filter((r) => r !== null);
    if (!alts.length) continue;
    const cand = [aRun].concat(alts);
    const keyOf = (r) => r.map((x) => core(x).toLowerCase()).join(" ");
    // majority on normalized content
    const counts = new Map(); cand.forEach((r, k) => { const kk = keyOf(r); counts.set(kk, (counts.get(kk) || []).concat(k)); });
    let pick = 0;
    let best = [...counts.values()].sort((x, y) => y.length - x.length)[0];
    const B = cand.length >= 3 ? cand[2] : null;
    const lowerKnown = (r) => r.length <= 2 && r.every((x) => known(x) && !/[A-Z0-9]/.test(x.replace(/^[^A-Za-z0-9]+/, "").slice(1)) && !/\d/.test(x));
    if (best.length >= 2 && cand.length >= 3) pick = best.includes(0) ? 0 : best[0];
    else if (!aRun.length) { if (B === null && lowerKnown(cand[1])) pick = 1; else if (B && B.length && B.length <= 5 && cand[1].length <= 5 && sim(cand[1], B) >= 0.6) pick = 1; }
    else if (!cand[1].length) { if (aRun.every((x) => !/[A-Za-z]{2}/.test(x) || !known(x))) pick = 1; else if (B && !B.length && aRun.length >= 4) pick = 1; }
    else {
      if (aRun.length > 14 || alts.some((r) => r.length > 14)) continue;
      const score = (r) => (r.length ? r.filter(known).length / r.length : 0);
      const sa = score(aRun); let bs = sa;
      cand.forEach((r, k) => { if (!r.length) return; const s = score(r); if (s > bs + 0.01) { bs = s; pick = k; } });
      const tied = cand.map((r, k) => k).filter((k) => cand[k].length && Math.abs(score(cand[k]) - bs) <= 0.01 && keyOf(cand[k]) !== keyOf(cand[pick]));
      if (tied.length && bs > 0.99 && aRun.length <= 3) ties.push({ i0, i1, cands: [cand[pick]].concat(tied.map((k) => cand[k])), pickK: pick });
    }
    if (pick === 0) continue;
    const rep = cand[pick];
    log.blocks++;
    // replace a[i0..i1) with rep
    for (let i = i0; i < i1; i++) { del.add(i); }
    if (i1 > i0) pre.set(i0, rep); else ins.set(i0 - 1, (ins.get(i0 - 1) || []).concat(rep));
    if (extra && extra.trace) extra.trace.push([aRun.join(" "), rep.join(" "), alts.map((r) => r.join(" ")).join(" | ")]);
  }
  // resolve ties by context (bigram counts supplied by extra.bigram(w1, w2))
  if (extra && extra.bigram) for (const t of ties) {
    const lw = (x) => x.replace(/\u00ad/g, "").toLowerCase().replace(/[^a-z']/g, "");
    const prev = lw(a[t.i0 - 1] || ""), next = lw(a[t.i1] || "");
    const sc = (r) => Math.log(1 + extra.bigram(prev, lw(r[0]))) + Math.log(1 + extra.bigram(lw(r[r.length - 1]), next));
    let bi = 0, bv = sc(t.cands[0]);
    t.cands.forEach((r, k) => { const v = sc(r); if (v > bv + 0.7) { bv = v; bi = k; } });
    if (extra.tieLog) extra.tieLog.push([a.slice(t.i0, t.i1).join(" "), t.cands.map((r) => r.join(" ")).join(" / "), "=>", t.cands[bi].join(" ")]);
    const cur = t.pickK === 0 ? a.slice(t.i0, t.i1) : null;
    const want = t.cands[bi];
    if (cur && cur.join(" ") === want.join(" ")) continue;
    for (let i = t.i0; i < t.i1; i++) del.add(i);
    const k = t.i0;
    // replace whatever an earlier pick inserted for this span
    pre.set(k, want);
    log.ties = (log.ties || 0) + 1;
  }
  return { out, del, ins, pre, log, ties };
}
/* bigram counter over the shelf, restricted to pairs that include one of `words` */
function shelfBigrams(words) {
  const dir = SHELF.dir;
  const W = new Set(words), cnt = new Map();
  for (const f of fs.readdirSync(dir)) {
    if (!DICT_SHELF.includes(f.replace(/\.js$/, "")) || f === SHELF.self + ".js") continue;
    const toks = fs.readFileSync(path.join(dir, f), "utf8").replace(/<[^>]+>/g, " ").replace(/\\u00ad|\u00ad/g, "").toLowerCase().replace(/’/g, "'").match(/[a-z']+/g) || [];
    for (let i = 1; i < toks.length; i++) if (W.has(toks[i]) || W.has(toks[i - 1])) { const k = toks[i - 1] + " " + toks[i]; cnt.set(k, (cnt.get(k) || 0) + 1); }
  }
  return (x, y) => cnt.get(x + " " + y) || 0;
}

/* ---------- fixtok ---------- */
/* single-token OCR repair against a dictionary: only where the token is not a word and exactly the confusion makes one */
const RULES = [
  ["M", "hi"], ["b", "h"], ["h", "b"], ["li", "h"], ["ii", "u"], ["n", "u"], ["u", "n"], ["rn", "m"], ["in", "m"], ["m", "in"], ["iu", "m"],
  ["c", "e"], ["e", "c"], ["o", "c"], ["c", "o"], ["E", "F"], ["E", "R"], ["B", "R"], ["O", "C"], ["G", "C"], ["f", "t"], ["t", "f"], ["l", "i"], ["i", "l"],
  ["1", "l"], ["I", "l"], ["fi", "ff"], ["s", "a"], ["a", "s"], ["cl", "d"], ["d", "cl"], ["k", "h"], ["tli", "th"], ["Tli", "Th"], ["Wli", "Wh"], ["wli", "wh"],
  ["J", "I"], ["y", "v"], ["v", "y"], ["0", "o"], ["e", "o"], ["o", "e"], ["a", "o"], ["ri", "n"], ["nn", "m"], ["Ih", "lh"], ["X", "U"], ["Z", "L"],
];
function mkFixer(dict, never) {
  const isWord = (c) => { const l = c.toLowerCase().replace(/’/g, "'"); return dict.has(l) && !never.has(c); };
  return function fix(t) {
    const m = /^([^A-Za-z]*)([A-Za-z][A-Za-z’']*[A-Za-z]|[A-Za-z])([^A-Za-z]*)$/.exec(t.replace(/­/g, ""));
    if (!m || t.includes("­")) return t;
    const c = m[2];
    if (isWord(c)) return t;
    const tried = new Set();
    const res = new Set(), res2 = new Set();
    const step = (w, depth) => {
      for (const [x, y] of RULES) {
        let k = w.indexOf(x);
        while (k >= 0) {
          const v = w.slice(0, k) + y + w.slice(k + x.length);
          if (!tried.has(v)) { tried.add(v); if (isWord(v)) (depth ? res2 : res).add(v); else if (depth < 1) next.push(v); }
          k = w.indexOf(x, k + 1);
        }
      }
    };
    let next = [];
    /* the rules are in order of how often this engine makes them: the first rule that makes exactly one word wins */
    for (const [x, y] of RULES) {
      const got = new Set(); let k = c.indexOf(x);
      while (k >= 0) { const v = c.slice(0, k) + y + c.slice(k + x.length); if (isWord(v)) got.add(v); k = c.indexOf(x, k + 1); }
      if (got.size === 1) { let v = [...got][0]; if (x !== "M" && /^[A-Z]/.test(c) && /^[a-z]/.test(v)) v = v[0].toUpperCase() + v.slice(1); return m[1] + v + m[3]; }
      if (got.size > 1) break;
    }
    step(c, 0);
    let pick = res;
    if (!res.size) { const n0 = next; next = []; n0.forEach((w) => step(w, 1)); pick = res2; }
    if (pick.size !== 1) return t;
    let v = [...pick][0];
    if (/^[A-Z]/.test(c) && /^[a-z]/.test(v)) v = v[0].toUpperCase() + v.slice(1);
    return m[1] + v + m[3];
  };
}

/* ---------- internal ---------- */
/* rare unknown words one OCR slip from a frequent word of the same book */
const SUBS = [["b","h"],["h","b"],["f","‘"],["4","‘"],["d","‘"],["*","‘"],["'","‘"],["’","‘"],["i","ü"],["u","ü"],["ii","ü"],["n","u"],["u","n"],["c","e"],["e","c"],["o","c"],["O","C"],["G","C"],["l","i"],["i","l"],["t","f"],["f","t"],["a","s"],["s","a"],["rn","m"],["M","hi"],["Ih","h"],["li","h"],["E","F"],["E","R"],["B","R"],["y","v"],["J","I"]];
function internalFix(texts, dict, opt = {}) {
  const core = (x) => x.replace(/^[^A-Za-zÀ-ɏ‘]+|[^A-Za-zÀ-ɏ]+$/g, "");
  const freq = new Map();
  for (const t of texts) for (const w of t.split(/[\s—]+/)) { const c = core(w); if (c) freq.set(c, (freq.get(c) || 0) + 1); }
  const known = (c) => dict.has(c.toLowerCase().replace(/’/g, "'"));
  const map = new Map();
  for (const [c, n] of freq) {
    if (known(c) || n > (opt.maxRare || 2)) continue;
    const cands = new Map();
    for (const [x, y] of SUBS) { let k = c.indexOf(x); while (k >= 0) { const v = c.slice(0, k) + y + c.slice(k + x.length); const f = freq.get(v) || 0; if (f >= (opt.minAnchor || 4) && v !== c) cands.set(v, f); k = c.indexOf(x, k + 1); } }
    if (cands.size === 1) map.set(c, [...cands.keys()][0]);
  }
  const apply = (t) => t.replace(/[A-Za-zÀ-ɏ‘’'*4]+/g, (w) => { const c = core(w); return map.has(c) ? w.replace(c, map.get(c)) : w; });
  return { map, apply };
}

/* ---------- render ---------- */
/* blocks -> chapters html */
function spacing(s) {
  return s.replace(/\s+([,;:.?!)\]”’])/g, "$1").replace(/([,;:])\1+/g, "$1").replace(/([(\[“‘])\s+/g, "$1").replace(/\s*—\s*/g, "—").replace(/\s+/g, " ").trim();
}
function dehyphen(t, dict) {
  return t.replace(/([A-Za-zÀ-ɏ‘’']+)-­([A-Za-zÀ-ɏ‘’']+)/g, (m, a, b) => dict.has((a + b).toLowerCase()) ? a + b : (dict.has(a.toLowerCase()) && dict.has(b.toLowerCase()) ? a + "-" + b : a + b)).replace(/­/g, "");
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function render(blocks, cfg, dict) {
  const counts = { joined: 0, junk: 0, prosed: 0 };
  // text of each block
  let bs = blocks.map((b) => ({ k: b.k, leaf: b.leaf, open: b.open, lines: b.lines.map((l) => dehyphen(l.join(" "), dict)).filter((l) => l.trim()) })).filter((b) => b.lines.length);
  // junk: no word of 2+ letters
  bs = bs.filter((b) => { const ok = b.k === "o" || /[A-Za-z]{2}/.test(b.lines.join(" ")); if (!ok) counts.junk++; return ok; });
  // a one-line verse "block" that reads as prose goes back to prose
  bs.forEach((b, i) => {
    if (b.k !== "v") return;
    const prev = bs[i - 1], t = b.lines.join(" ");
    const prevEnd = prev ? prev.lines[prev.lines.length - 1].trim() : "";
    if (b.lines.length === 1 && !/[:—]\W*$/.test(prevEnd) && !/^["“‘]/.test(t)) { b.k = "p"; b.open = /^[a-z]/.test(t); counts.prosed++; }
  });
  // a one-line paragraph opening a quotation just before a verse block is the verse's first line
  bs.forEach((b, i) => { const nx = bs[i + 1], pv = bs[i - 1]; if (b.k === "p" && b.lines.length === 1 && nx && nx.k === "v" && /^[“"‘]/.test(b.lines[0].trim()) && pv && /[:—]\W*$/.test(pv.lines[pv.lines.length - 1].trim())) { nx.lines.unshift(b.lines[0]); b.k = "x"; } });
  bs = bs.filter((b) => b.k !== "x");
  // join prose blocks broken without cause
  const out = [];
  for (const b of bs) {
    const prev = out[out.length - 1];
    if (b.k === "p" && prev && prev.k === "p" && prev.leaf !== undefined) {
      const pe = prev.lines.join(" ").trim(), t = b.lines.join(" ").trim();
      if (/[A-Za-z]-$/.test(pe)) { const L = prev.lines; L[L.length - 1] = dehyphen(L[L.length - 1] + "\u00ad" + b.lines[0], dict); prev.lines.push(...b.lines.slice(1)); counts.joined++; continue; }
      if (/^[a-z(]/.test(t) || !/[.?!:;”’)—"'\]]$/.test(pe)) { prev.lines.push(...b.lines); counts.joined++; continue; }
    }
    out.push(b);
  }
  return { blocks: out, counts, toHtml: (b) => b.k === "v" ? "<blockquote><p>" + b.lines.map((l) => esc(spacing(l))).join("<br>") + "</p></blockquote>" : b.k === "sh" ? '<p class="bk-head">' + esc(spacing(b.lines.join(" "))) + "</p>" : "<p>" + esc(spacing(b.lines.join(" "))) + "</p>" };
}

/* ---------- the shelf as dictionary ---------- */
/* THE DICTIONARY IS PINNED to the English books on the shelf when the Xunzi and the Mozi were checked (Nov 2026),
   not to whatever the shelf holds on the day of a run. Read off the live shelf, books added later (some with OCR
   noise of their own) changed tie-breaks: a re-run after a merge turned "Yu" into "Yh" and "of" into "oe". A
   listed file that has gone is skipped; a book added later never enters. */
const DICT_SHELF = [
  // each of the two ocrvote books is in the other's dictionary (never its own: see SHELF.self)
  "xunzi", "mozi",
  "aesop-fables", "anglo-saxon-chronicle", "apollodorus-library", "aristophanes-lysistrata",
  "aristotle-nicomachean-ethics", "augustus-res-gestae", "bede-history", "beowulf", "bhagavad-gita",
  "boethius-consolation", "book-of-documents", "book-of-rites", "caesar-gallic-war", "canterbury-tales",
  "cassius-dio-roman-history", "city-of-god", "classic-of-poetry", "classic-of-tea", "confessions",
  "confucius-analects", "darwin-origin-of-species", "declaration-of-independence", "descartes-discourse-on-method",
  "diodorus-library", "divine-comedy", "don-quixote", "douglass-narrative", "epic-of-gilgamesh", "euclid-elements",
  "euripides-medea", "freud-interpretation-of-dreams", "hamlet", "herodotus-histories", "hobbes-leviathan",
  "homer-iliad", "homer-odyssey", "james-principles-of-psychology", "jerome-letters", "journey-to-the-west",
  "julius-caesar", "kalidasa-shakuntala", "kant-critique-of-pure-reason", "king-james-bible", "livy-history-of-rome",
  "lucretius-nature-of-things", "luther-ninety-five-theses", "macbeth", "machiavelli-prince", "magna-carta",
  "marco-polo", "marcus-aurelius-meditations", "mencius", "more-utopia", "morte-darthur", "ovid-metamorphoses",
  "paine-common-sense", "pausanias-description-of-greece", "petrie-egyptian-tales", "plato-dialogues",
  "plato-republic", "plutarch-lives", "poetic-edda", "polybius-histories", "prose-edda", "ptahhotep", "quran",
  "ramayana", "rigveda", "romeo-and-juliet", "rousseau-social-contract", "russian-primary-chronicle", "satyricon",
  "seneca-letters", "song-of-roland", "sophocles-antigone", "sophocles-oedipus-rex", "strabo-geography",
  "suetonius-twelve-caesars", "summa-theologica", "sun-tzu-art-of-war", "tacitus-annals", "tempest",
  "three-kingdoms", "thucydides-peloponnesian-war", "treaty-of-versailles", "virgil-aeneid", "voltaire-candide"
];
function shelfDict() {
  const cnt = new Map();
  for (const id of DICT_SHELF) {
    const f = id + ".js";
    if (id === SHELF.self || !fs.existsSync(path.join(SHELF.dir, f))) continue;
    const s = fs.readFileSync(path.join(SHELF.dir, f), "utf8").replace(/<[^>]+>/g, " ").replace(/\\u00ad|­/g, "");
    for (const w of s.match(/[A-Za-z]+(?:['’][a-z]+)?/g) || []) { const k = w.toLowerCase().replace(/’/g, "'"); cnt.set(k, (cnt.get(k) || 0) + 1); }
  }
  return new Set([...cnt].filter(([, n]) => n >= 2).map(([k]) => k));
}

const TITLE_SMALL = new Set(["a", "an", "and", "as", "at", "by", "for", "from", "in", "of", "on", "or", "the", "to", "with"]);
function titleCase(s) {
  return s.toLowerCase().split(/(\s+)/).map((w, i) => (i && TITLE_SMALL.has(w) ? w : w.replace(/^([^a-z]*)([a-z])/, (m, p, c) => p + c.toUpperCase()))).join("");
}

/* The text-level tidy every reading needs, logged. `{` for `(` is this engine's commonest misreading of a
   bracket; a token holding | < > € ~ is speck; a full stop between two lower-case words is a misread space. */
function tidy(t, o, counts) {
  const n0 = t;
  t = t.replace(/\{/g, "(").replace(/(^|\s)\S*[|<>€~]\S*(?=\s|$)/g, (m) => { counts.specks++; return ""; })
    .replace(/\b([a-z]{2,})\.([a-z]{2,})\b/g, (m, a, b) => { counts.spaces++; return a + " " + b; })
    .replace(/([A-Za-z])- ([a-z])/g, "$1-$2");
  if (o.aspiration) t = t.replace(/\b(Ch|Ts|Tz|K|P|T|ch|ts|tz|k|p|t)['’](?=[aeiouü])(?!s\b)/g, "$1" + o.aspiration);
  if (o.curly) {
    t = t.replace(/(\w)'(\w)/g, "$1’$2").replace(/(\w)'/g, "$1’").replace(/'(\w)/g, "‘$1");
    /* a straight double quote is paired within its paragraph: the first opens, the next closes */
    let open = false;
    t = t.replace(/[“”"]/g, (q) => { if (q === "“") { open = true; return q; } if (q === "”") { open = false; return q; } open = !open; counts.quotes++; return open ? "“" : "”"; })
      .replace(/“\s+/g, "“").replace(/\s+”/g, "”");
    if (open) counts.oddQuotes++;
  }
  return t;
}

/* The entry's `ocr` block drives everything:
     witnesses: [{ url, kind: "djvu" | "pdf", from, to, opt }]  — the FIRST is the primary (its paragraphs,
       verse and heads are the ones kept); `from`/`to` are leaves, the first and last page of the text.
     opt: { noteRatio, verseInd, headExempt }  — see pageBody / bookStream.
     never: tokens the dictionary knows that are always misreadings here ("Ms" for "his").
     starts: [[leaf, n], …]  — the primary's leaf on which chapter n opens (its heads are dropped; the tab's
       title is the entry's own). Must be in order; a chapter must open on a head. */
async function ocrVoteBook(BOOK, ctx) {
  const o = BOOK.ocr, log = ctx.log;
  SHELF.self = ctx.id;
  const files = [];
  for (let k = 0; k < o.witnesses.length; k++) {
    const w = o.witnesses[k];
    const cf = path.join(ctx.cache, "w" + k + (w.kind === "pdf" ? ".bbox.html" : ".djvu.xml"));
    if (ctx.force || !fs.existsSync(cf)) {
      fs.mkdirSync(ctx.cache, { recursive: true });
      if (w.kind === "pdf") {
        const pdf = path.join(ctx.cache, "w" + k + ".pdf");
        if (ctx.force || !fs.existsSync(pdf)) fs.writeFileSync(pdf, await ctx.fetchBuffer(w.url));
        require("child_process").execFileSync("pdftotext", ["-bbox-layout", pdf, cf]);
      } else fs.writeFileSync(cf, await ctx.fetchText(w.url));
    }
    files.push(fs.readFileSync(cf, "utf8"));
  }
  const dict = shelfDict();
  const never = new Set(o.never || []); for (const w of never) dict.delete(w.toLowerCase());
  const fix = mkFixer(dict, never);
  let prefixed = 0;
  const ws = o.witnesses.map((w, k) => {
    const pages = w.kind === "pdf" ? bboxPages(files[k]) : djvuPages(files[k]);
    const st = bookStream(pages, Object.assign({}, o.opt, w.opt || {}, { from: w.from, to: w.to }));
    const toks = [], pos = [];
    st.blocks.forEach((b, bi) => {
      if (b.k === "h" || b.k === "o") return;
      let ln = 0;
      b.words.forEach((t) => { if (t === "\n") { ln++; return; } const v = fix(t); if (v !== t) prefixed++; toks.push(v); pos.push([bi, ln]); });
    });
    log("  witness " + (k + 1) + ": " + st.stats.pages + " pages, " + toks.length + " words; dropped " + st.stats.heads +
      " running head(s), " + st.stats.notes + " footnote row(s), " + st.stats.margin + " margin row(s), " + st.stats.marks + " footnote mark(s); " + (st.stats.omissions || 0) + " row(s) of asterisks kept as omission marks");
    return { st, toks, pos };
  });
  const A = ws[0];
  const others = ws.slice(1).map((w) => ({ t: w.toks, m: align(A.toks, w.toks) }));
  others.forEach((x, k) => log("  witness " + (k + 2) + " aligned on " + x.m.filter((j) => j >= 0).length + " of " + A.toks.length + " words"));
  const extra = new Set();
  let r = vote(A.toks, others, dict, extra);
  const lw = (x) => x.replace(/­/g, "").toLowerCase().replace(/[^a-z']/g, "");
  const words = new Set(); r.ties.forEach((t) => t.cands.forEach((c) => c.forEach((x) => words.add(lw(x)))));
  extra.bigram = shelfBigrams([...words]);
  r = vote(A.toks, others, dict, extra);
  log("  " + prefixed + " token(s) repaired by a single confusion; " + r.log.sub + " punctuation reading(s) and " + r.log.blocks +
    " disagreement(s) settled for another witness, " + (r.log.ties || 0) + " of them by the shelf's word pairs");
  const blocks = A.st.blocks.map((b) => ({ k: b.k, leaf: b.leaf, open: b.open, lines: b.k === "h" ? [b.words.slice()] : b.k === "o" ? [["*"]] : [[]] }));
  const put = (i, t) => { const [bi, ln] = i < 0 ? [0, 0] : A.pos[i]; const L = blocks[bi].lines; while (L.length <= ln) L.push([]); L[ln].push(t); };
  for (let i = -1; i < A.toks.length; i++) {
    if (i >= 0 && r.pre.has(i)) r.pre.get(i).forEach((t) => put(i, t));
    if (i >= 0 && !r.del.has(i)) put(i, r.out[i]);
    if (r.ins.has(i)) r.ins.get(i).forEach((t) => put(i, t));
  }
  const R = render(blocks, o, dict);
  const counts = { specks: 0, spaces: 0, quotes: 0, oddQuotes: 0 };
  const I = internalFix(R.blocks.filter((b) => b.k !== "h").map((b) => b.lines.join(" ")), dict);
  log("  " + R.counts.joined + " paragraph(s) rejoined, " + R.counts.prosed + " stray indented line(s) returned to prose, " +
    R.counts.junk + " speck block(s) dropped; " + I.map.size + " rare word(s) taken to a frequent one of the book: " +
    [...I.map].map(([a, b]) => a + "→" + b).join(", "));
  // cut into chapters
  const starts = o.starts;
  const chapters = [];
  let si = -1, cur = null;
  for (const b of R.blocks) {
    while (si + 1 < starts.length && b.leaf >= starts[si + 1][0]) {
      si++;
      if (b.k !== "h") throw new Error("ocrvote: chapter " + starts[si][1] + " should open on a head at leaf " + starts[si][0] + ", found: " + b.lines.join(" ").slice(0, 60));
      cur = { n: starts[si][1], parts: [], lead: true, needTitle: true };
      chapters.push(cur);
    }
    if (!cur) continue;
    if (b.k === "h") {
      /* The chapter's own heads (BOOK II, CHAPTER VIII, A PARAGRAPH FROM …) and the one title after them; the tab
         carries the title. A head after those is a section head inside the chapter (Dubs's Book VII and VIII). */
      if (cur.lead) {
        const t = b.lines.join(" ");
        if (o.opt.headExempt.test(t)) { cur.needTitle = !/^A GLOSS/i.test(t) && t.replace(/^\s*(?:A PARA\S* \S+ )?(?:BOOK|CHAPTER)\s+\S+\s*/i, "").trim().split(/\s+/).filter(Boolean).length < 2; continue; }
        if (cur.needTitle) { cur.needTitle = false; continue; }
      }
      const prev = cur.parts[cur.parts.length - 1];
      const t = tidy(I.apply(b.lines.join(" ")), o, counts);
      if (prev && prev.k === "h") prev.t += " " + t; else cur.parts.push({ k: "h", t });
      continue;
    }
    cur.lead = false;
    cur.parts.push(b);
  }
  if (chapters.length !== starts.length) throw new Error("ocrvote: " + chapters.length + " chapters cut, " + starts.length + " declared");
  let heads = 0;
  const out = chapters.map((c) => {
    const html = c.parts.map((b) => {
      if (b.k === "o") return "<p>* * * * *</p>";
      if (b.k === "h") { heads++; return '<p class="bk-head">' + escH(titleCase(spacing(b.t)).replace(/\.$/, "")) + "</p>"; }
      if (b.k !== "v") { const t = escH(tidy(spacing(I.apply(b.lines.join(" "))), o, counts)); return t ? "<p>" + t + "</p>" : ""; }
      const lines = b.lines.map((l) => escH(tidy(spacing(I.apply(l)), o, counts))).filter((l) => l);
      return lines.length ? "<blockquote><p>" + lines.join("<br>") + "</p></blockquote>" : "";
    }).filter(Boolean).join("\n");
    return { n: c.n, html, notes: [] };
  });
  log("  " + out.length + " chapters; " + heads + " head(s) inside them; " + counts.specks + " speck token(s) dropped, " + counts.spaces + " misread space(s) restored" +
    (o.curly ? "; " + counts.quotes + " straight double quote(s) paired, " + counts.oddQuotes + " paragraph(s) left with one open" : ""));
  return out;
}
const escH = (s) => s.replace(/&(?!amp;|lt;|gt;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
module.exports = { ocrVoteBook, djvuPages, bboxPages, pageBody, align };
