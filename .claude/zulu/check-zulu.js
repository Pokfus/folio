#!/usr/bin/env node
/* The Zulu decks' own check: node .claude/zulu/check-zulu.js
   Reads every decks/Zulu-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("combining stem of …",
   "synonym of …", "plural of …"), a headword that is not plain Zulu spelling (a tone mark belongs in the
   Tone field, never the headword), a stem headword with no hyphen or a noun with one, a forms label the
   generator does not write, a locative whose prefix contradicts the noun's class (a person class makes it
   with ku-), unbalanced HTML, an id out of sequence, two notes sharing an English side (the reverse card
   would have two answers). The phrases deck is checked for what applies to a phrase: its two subdecks, no
   phrase a level teaches, balanced HTML, a unique English side. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["plural", "locative", "infinitive", "command, to several"]);
const POINTER = /^(?:combining stem of|alternative form of|form of|plural of|synonym of \S+$)/i;
const PLAIN = /^-?[A-Za-z]+(?: [A-Za-z]+)*$/;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Zulu-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Zulu deck in decks/");
const seen = new Map();
const text = (h) => h.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "");
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const classes = /Noun Classes/.test(d.meta.title);
  const phrases = /Phrases/.test(d.meta.title);
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (classes) {
      if (sides.has(F.Ask)) bad(f + ": " + w + " shares its asking side with " + sides.get(F.Ask));
      sides.set(F.Ask, w);
      if (!F.Example) bad(f + ": " + w + " has no example word");
      return;
    }
    if (phrases) {
      // a phrase or a sentence: not one plain word, so only what still applies (the file sorts after the levels)
      if (!["Phrases", "Sentences"].includes(c.sub)) bad(f + ": " + w + " is in subdeck " + c.sub);
      if (seen.has(w.replace(/[^A-Za-z ]/g, "").trim().toLowerCase())) bad(f + ": " + w + " is already taught in " + seen.get(w.replace(/[^A-Za-z ]/g, "").trim().toLowerCase()));
      if (!F.English || !F.Zulu) bad(f + ": " + w + " has an empty side");
      for (const k of ["Zulu", "English"]) for (const t of ["div", "span", "ol", "li"]) {
        const open = (F[k].match(new RegExp("<" + t + "[ >]", "g")) || []).length;
        const close = (F[k].match(new RegExp("</" + t + ">", "g")) || []).length;
        if (open !== close) bad(f + ": " + w + " " + k + " has " + open + " <" + t + "> and " + close + " closes");
      }
      if (sides.has(F.English)) bad(f + ": " + w + " shares its English side with " + sides.get(F.English));
      sides.set(F.English, w);
      return;
    }
    if (!PLAIN.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not plain Zulu spelling: " + w);
    if (seen.has(w.replace(/^-/, "").toLowerCase())) bad(f + ": " + w + " is already taught in " + seen.get(w.replace(/^-/, "").toLowerCase()));
    seen.set(w.replace(/^-/, "").toLowerCase(), f);
    if (!F.English) bad(f + ": " + w + " has no English");
    const first = (F.English.match(/class="uc-pos">([^<]*)</) || [])[1] || "";
    const stemPos = /^(verb|adjective stem|relative stem)/.test(first);
    if (/^noun/.test(first) && w.startsWith("-")) bad(f + ": noun " + w + " is printed as a stem");
    if (/^(adjective|relative) stem/.test(first) && !w.startsWith("-")) bad(f + ": stem " + w + " has no hyphen");
    if (!stemPos && /^verb/.test(first)) bad(f + ": " + w + " verb label unexpected");
    for (const g of text(F.English).split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    const cls = (first.match(/class (\w+)/) || [])[1];
    const loc = (F.Forms.match(/uc-fl">locative<\/span>([^<]*)/) || [])[1];
    if (loc && cls && (/^ku/.test(loc) !== ["1", "1a", "2", "2a"].includes(cls)))
      bad(f + ": " + w + " (class " + cls + ") has the locative " + loc);
    for (const k of ["Zulu", "English", "Forms", "Table", "Examples"]) {
      const h = F[k];
      for (const t of ["div", "span", "b", "ol", "li"]) {
        const open = (h.match(new RegExp("<" + t + "[ >]", "g")) || []).length;
        const close = (h.match(new RegExp("</" + t + ">", "g")) || []).length;
        if (open !== close) bad(f + ": " + w + " " + k + " has " + open + " <" + t + "> and " + close + " closes");
      }
    }
    if (sides.has(F.English)) bad(f + ": " + w + " shares its English side with " + sides.get(F.English));
    sides.set(F.English, w);
  });
  console.log("ok    " + f + ": " + d.cards.length + " notes" + (classes || phrases ? "" : ", " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Table).length + " with tenses, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
