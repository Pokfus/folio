#!/usr/bin/env node
/* The Swahili decks' own check: node .claude/swahili/check-swahili.js
   Reads every deck in decks/ of card type `swahili` (the five levels and the phrases; the sounds deck is
   build-swahili-sounds.js's) and fails on the faults this pipeline has had or could have: a headword taught
   twice (on one level or two), a card defined by a pointer rather than English ("inflected form of …",
   "[[Appendix:…"), a headword that is not Swahili, a verb card whose headword is not an infinitive, a noun
   class label the generator does not write, a forms label the generator does not write, unbalanced HTML, an
   id that is not the note's PINNED number (.claude/decks/swahili-ids.json — until the beginner pass of Nov
   2026 an id was the card's position), two notes sharing an English side (the reverse card would have two
   answers), a verb row without its cells, an agreeing word's row that is not the five class pairs in order. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["plural", "stem", "present", "past", "future", "perfect", "negative", "command", "there is", "there is not", "to several people", "m-wa", "m-mi", "ji-ma", "ki-vi", "n"]);
const PIN = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "decks", "swahili-ids.json"), "utf8"));
const CLASS_ORDER = ["m-wa", "m-mi", "ji-ma", "ki-vi", "n"];
// `si`, "is not": a form that is a card of its own (inserts.py, RAW), filed as a verb and printed bare
const BARE = new Set(["si"]);
const CLASSES = new Set(["1/2 (m-wa)", "3/4 (m-mi)", "5/6 (ji-ma)", "7/8 (ki-vi)", "9/10 (n)", "11 (u)", "11/6 (u-ma)", "15 (ku)", "16 (pa)", "9/10 or 5/6 (n or ji-ma)"]);
const POINTER = /\[\[|Appendix:|inflected form of|^(?:infinitive|alternative form|alternative spelling|plural|habitual) of |class form of|subject inflected/i;
const SW = /^-?[A-Za-z' -]+$/;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const text = (h) => h.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const files = fs.readdirSync(DIR).filter((f) => /^Swahili-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Swahili deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  if (!d.meta.types || !d.meta.types.swahili) continue;   // the sounds deck: card type swsound
  if (!PIN[id]) { bad(f + ": swahili-ids.json has no deck " + id); continue; }
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, h = text(F.Swahili);
    if (c.id !== "u_" + id + "_" + PIN[id][F.Word]) bad(f + ": " + F.Word + " has id " + c.id + ", pinned to " + PIN[id][F.Word]);
    if (!SW.test(h)) bad(f + ": card " + (i + 1) + " headword is not Swahili: " + h);
    if (!F.Word) bad(f + ": " + h + " has no Word for the speaker");
    if (seen.has(h)) bad(f + ": " + h + " is already taught in " + seen.get(h));
    seen.set(h, f);
    if (!F.English) bad(f + ": " + h + " has no English");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + h + " is defined by a pointer: " + g.trim());
    for (const [, cl] of F.English.matchAll(/class="uc-pos">[^<]*?class ([^,<]*\))/g)) if (!CLASSES.has(cl)) bad(f + ": " + h + " class label " + cl);
    const pos = (F.English.match(/class="uc-pos">([^<,]*)/) || [])[1];
    // ku- + a vowel stem is kw-: kwenda. (Until Nov 2026 the call below stood inside this comment and never ran.)
    if (pos === "verb" && !/^(ku|kw)/.test(h) && !BARE.has(h)) bad(f + ": verb " + h + " is not shown as its infinitive");
    const labels = [...F.Forms.matchAll(/class="uc-fl">([^<]*)</g)].map((m) => m[1]);
    for (const l of labels) if (!LABELS.has(l)) bad(f + ": " + h + " forms label " + l);
    if (labels.includes("present") && !labels.includes("negative")) bad(f + ": " + h + " shows a present and no negative");
    const cls = labels.filter((l) => CLASS_ORDER.includes(l));
    if (cls.length && cls.join() !== CLASS_ORDER.join()) bad(f + ": " + h + " shows the classes " + cls.join(" ") + ", not the five pairs in order");
    for (const k of ["Swahili", "English", "Forms", "Examples"]) {
      const v = F[k];
      for (const t of ["div", "span", "b", "ol", "li"]) {
        const open = (v.match(new RegExp("<" + t + "[ >]", "g")) || []).length;
        const close = (v.match(new RegExp("</" + t + ">", "g")) || []).length;
        if (open !== close) bad(f + ": " + h + " " + k + " has " + open + " <" + t + "> and " + close + " closes");
      }
    }
    if (F.Examples && !/<b>/.test(F.Examples)) bad(f + ": " + h + " has a sentence with no word picked out");
    if (sides.has(F.English)) bad(f + ": " + h + " shares its English side with " + sides.get(F.English));
    sides.set(F.English, h);
  });
  console.log("ok    " + f + ": " + d.cards.length + " notes, " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences");
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
