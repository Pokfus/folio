#!/usr/bin/env node
"use strict";
/*
  dynasty-numerals.js — "Third Dynasty" → "3rd Dynasty" in the prose of cards and glossary terms (2026-11-26, on
  request: "Ensure that Egyptian dynasties are always written as numbers (3rd Dynasty, not Third Dynasty)").
  Standalone Node helper, zero deps. Not part of the site.

    node .claude/dynasty-numerals.js            report what would change
    node .claude/dynasty-numerals.js --write    write the cards (card-io) and print the glossary entries to change

  ONLY a CAPITALISED ordinal before a capitalised Dynasty / Dynasties is touched, so China's "the first dynasty of
  traditional history" stays words. A run ("Eighteenth and Nineteenth Dynasties", "Twentieth to Twenty-Sixth")
  is converted whole. Only EGYPT's: a "Dynasty of X" for any X but Egypt (the Third Dynasty of Ur) keeps its words. NEVER touched: `sources` (a book's title is its own), `wiki`, `answer` / `answerText` (the
  term a reader types), and anything inside <i>…</i> (a title). Re-running is a no-op.
*/
const fs = require("fs"), path = require("path");
const W = ["", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth", "Eleventh",
  "Twelfth", "Thirteenth", "Fourteenth", "Fifteenth", "Sixteenth", "Seventeenth", "Eighteenth", "Nineteenth"];
const TENS = { Twenty: 20, Thirty: 30 }, TENTH = { Twentieth: 20, Thirtieth: 30 };
const val = (w) => {
  let i = W.indexOf(w); if (i > 0) return i;
  if (TENTH[w]) return TENTH[w];
  const m = /^(Twenty|Thirty)-(First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth)$/i.exec(w);
  if (m) return TENS[m[1][0].toUpperCase() + m[1].slice(1).toLowerCase()] + W.indexOf(m[2][0].toUpperCase() + m[2].slice(1).toLowerCase());
  return 0;
};
const ord = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th");
const ORD = "(?:Twenty|Thirty)-(?:[Ff]irst|[Ss]econd|[Tt]hird|[Ff]ourth|[Ff]ifth|[Ss]ixth|[Ss]eventh|[Ee]ighth|[Nn]inth)|Twentieth|Thirtieth|" + W.slice(1).join("|");
const RUN = new RegExp("\\b((?:" + ORD + ")(?:(?:,\\s+|\\s+and\\s+|\\s+or\\s+|\\s+to\\s+|–)(?:" + ORD + "))*)(\\s+|-)(Dynast(?:y|ies))\\b(?!\\s+of\\s+(?!Egypt))", "g");
// a text about Mesopotamia (Ur, Kish, Lagash, Uruk, Sumer) is not about Egypt's dynasties: left alone whole
const NOT_EGYPT = /\b(?:Ur|Kish|Lagash|Uruk|Sumer|Sumerian|Babylon|Isin|Larsa)\b/;
function convText(s) {
  if (NOT_EGYPT.test(String(s)) && !/Egypt/.test(String(s))) return String(s);
  // leave <i>…</i> alone: split on it and convert only the outside
  return String(s).split(/(<i>[\s\S]*?<\/i>)/).map((part, i) => (i % 2 ? part : part.replace(RUN, (m, run, sep, dyn) =>
    run.replace(new RegExp(ORD, "g"), (w) => { const n = val(w); return n ? ord(n) : w; }) + " " + dyn))).join("");
}
function walk(v) {
  if (typeof v === "string") return convText(v);
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === "object") { const o = {}; for (const k of Object.keys(v)) o[k] = SKIP.has(k) ? v[k] : walk(v[k]); return o; }
  return v;
}
const SKIP = new Set(["sources", "wiki", "answer", "answerText", "id", "deck", "src", "credit", "places", "locator", "war", "map", "i18n"]);
module.exports = { convText };
if (require.main === module) {
  const WRITE = process.argv.includes("--write");
  const io = require("./card-io.js");
  const { cards, tree } = io.loadCards();
  let n = 0;
  const changed = [];
  for (const c of cards) {
    const before = JSON.stringify(c);
    for (const k of Object.keys(c)) if (!SKIP.has(k)) c[k] = walk(c[k]);
    if (JSON.stringify(c) !== before) { n++; changed.push(c.id); }
  }
  console.log(n + " card(s) carry a dynasty in words: " + changed.slice(0, 30).join(" ") + (changed.length > 30 ? " …" : ""));
  const g = require("./gloss-io.js").loadGlossary();
  const gl = Object.keys(g.GLOSSARY).filter((k) => convText(g.GLOSSARY[k]) !== g.GLOSSARY[k]);
  console.log(gl.length + " glossary term(s) do");
  if (WRITE) {
    io.writeCards(cards, tree);
    const out = gl.map((k) => ({ slug: k, description: convText(g.GLOSSARY[k]), skipSources: true }));
    const f = process.argv[process.argv.indexOf("--write") + 1];
    if (f && !f.startsWith("--")) fs.writeFileSync(f, JSON.stringify(out));
    console.log("cards written" + (f && !f.startsWith("--") ? "; glossary entries in " + f : ""));
  }
}
