/* .claude/book-audit.js — WHAT CANNOT BE RIGHT IN A SHIPPED BOOK, WHATEVER ITS SOURCE.
   node .claude/book-audit.js

   The third scanner, beside book-scan.js (probable transcription slips) and book-vary.js (one name
   written two ways), and it asks a different question from both: not "is this word right?" but "is
   this a thing a finished book should contain at all?" — a replacement character, a double-escaped
   entity, an unresolved [Greek: ] marker, a Gutenberg sentinel, an empty paragraph, an unbalanced
   tag, a page number sitting in the run of prose. It reads the shipped `books/*.js` rather than a
   cache, so it measures what a reader actually gets, and it needs no network and no dictionary.

   IT PRODUCES EVIDENCE, NEVER A VERDICT, like its two siblings. Several of its checks fire on things
   that are perfectly correct: Marco Polo's seven bare ampersands are all `&c.` for *et cetera*, which
   is what Yule prints; the Summa's one page reference is inside a note that is citing a page. Read
   the finding before repairing it.

   ITS FIRST RUN (Sep 2026, batch E33) FOUND DON QUIXOTE'S 86 ITALIC PASSAGES SHIPPING AS LITERAL
   UNDERSCORES — a fault nothing else on the shelf could see, because every word in the book is
   spelled correctly and every tag is balanced. That is the argument for a check written against the
   FORM of a finished text rather than against its words.

   Not part of the site. */

const fs = require("fs"), path = require("path");
const DIR = "/home/user/folio/books";
global.window = { FOLIO_BOOKS_IN: [], FOLIO_BOOK_ORIG_IN: [] };
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".js"));
for (const f of files) require(path.join(DIR, f));
const en = window.FOLIO_BOOKS_IN, or = window.FOLIO_BOOK_ORIG_IN;
console.log(en.length + " English books, " + or.length + " originals\n");

const CHECKS = [
  ["U+FFFD replacement character", /�/g],
  ["a double-escaped entity", /&amp;(?:amp|lt|gt|quot|#\d+|nbsp);/g],
  ["a raw ampersand that is not an entity", /&(?!amp;|lt;|gt;|quot;|#\d+;|#x[0-9a-f]+;|nbsp;|mdash;|hellip;)/gi],
  ["an unresolved beta-code Greek marker", /\[Greek:/g],
  ["a Gutenberg illustration sentinel", /\[Illustration/gi],
  ["a Gutenberg transcriber sentinel", /\[Transcriber/gi],
  ["a control character", /[\x00-\x08\x0B\x0C\x0E-\x1F]/g],
  ["a doubled space inside prose", /(?<=[a-z,;.])  +(?=[A-Za-z])/g],
  ["an empty paragraph", /<p[^>]*>\s*<\/p>/g],
  ["an empty emphasis", /<(i|b|em|strong)>\s*<\/\1>/g],
  ["a stray closing tag with no text", /<\/(p|i|b)>\s*<\/\1>/g],
  ["a page-number artefact inside prose", /\s\[?p{1,2}\.?\s?\d{1,4}\]?\s/g],
  ["an OCR sentinel run of punctuation", /[~^_]{1,}[A-Za-z]|[A-Za-z][~^_]{1,}[A-Za-z]/g],
];

function tagsBalanced(html) {
  const VOID = new Set(["br", "hr", "img", "input", "meta", "link"]);
  const stack = [];
  const rx = /<(\/?)([a-z][a-z0-9]*)\b[^>]*?(\/?)>/gi;
  let m;
  while ((m = rx.exec(html))) {
    const close = m[1] === "/", tag = m[2].toLowerCase(), self = m[3] === "/";
    if (VOID.has(tag) || self) continue;
    if (!close) stack.push(tag);
    else { if (!stack.length) return "closes </" + tag + "> with nothing open"; const t = stack.pop(); if (t !== tag) return "closes </" + tag + "> over an open <" + t + ">"; }
  }
  return stack.length ? "leaves <" + stack.join("><") + "> open" : null;
}

const rows = [];
for (const [side, list] of [["en", en], ["or", or]]) {
  for (const b of list) {
    const hits = {};
    let chars = 0, badTags = [];
    for (const c of b.chapters || []) {
      const html = c.html || "";
      chars += html.length;
      for (const [name, rx] of CHECKS) {
        const r = new RegExp(rx.source, rx.flags);
        const found = html.match(r);
        if (found) { hits[name] = (hits[name] || 0) + found.length; if (!hits["_ex" + name]) hits["_ex" + name] = found[0]; }
      }
      const bal = tagsBalanced(html);
      if (bal) badTags.push(c.n + ": " + bal);
    }
    if (b.intro && b.intro.html) { const bal = tagsBalanced(b.intro.html); if (bal) badTags.push("intro: " + bal); }
    const named = Object.keys(hits).filter((k) => !k.startsWith("_ex"));
    if (named.length || badTags.length) rows.push([side, b.id, chars, hits, named, badTags]);
  }
}
for (const [side, id, chars, hits, named, badTags] of rows) {
  console.log("== " + id + (side === "or" ? "  (original)" : "") + "   " + (chars / 1024).toFixed(0) + " KB");
  for (const n of named) console.log("     " + String(hits[n]).padStart(6) + "  " + n + "   e.g. " + JSON.stringify(hits["_ex" + n]).slice(0, 90));
  for (const t of badTags.slice(0, 4)) console.log("     TAGS  " + t);
  if (badTags.length > 4) console.log("     TAGS  … and " + (badTags.length - 4) + " more");
}
console.log("\n" + rows.length + " of " + (en.length + or.length) + " files have at least one finding");
