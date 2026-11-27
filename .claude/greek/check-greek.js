#!/usr/bin/env node
/* The Greek decks' own check: node .claude/greek/check-greek.js
   Reads every decks/Greek-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("inflection of …",
   "nominative plural of …", "see: …", "synonym of …"), a headword that is not Greek, a level card with no
   romanisation, a noun with no article, a forms label the generator does not write, unbalanced HTML, an id
   that is not the note's PINNED number (.claude/decks/greek-ids.json — since the beginner pass of
   2026-11-27 a deck is no longer numbered by position), two notes sharing an English side (the reverse
   card would have two answers), an English side that prints the card's own Greek outside the `.uc-eg`
   wrapper the English → Greek card hides, and on the alphabet deck two notes sharing a sound side, a sound
   side that prints its own letter outside a quotation, or a reading rule with no quotation or source. */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["genitive", "plural", "feminine", "neuter", "past", "future", "also", "short", "before a vowel"]);
const PIN = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "decks", "greek-ids.json"), "utf8"));
const strip = (h) => String(h || "").replace(/<[^>]+>/g, "");
const dec = (h) => h.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
const fold = (w) => w.normalize("NFC").toLowerCase().replace(/ς/g, "σ");
const toks = (h) => dec(h).normalize("NFC").match(/[Ͱ-Ͽἀ-῿]+/g) || [];
// a gloss that IS a pointer, anchored at its start
const POINTER = /^(?:alternative|obsolete|dated|rare|polytonic|Katharevousa) (?:form|spelling) of |^(?:inflection|synonym) of |^\*?\s*see:|^(?:nominative|genitive|accusative|vocative|first|second|third)[^;]* of \S+(?: \([^)]*\))?$/i;
const GREEK = /^[Ͱ-Ͽἀ-῿ ]+$/;
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Greek-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Greek deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const alphabet = /Alphabet/.test(d.meta.title);
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    const key = c.type === "el-abc" ? strip(F.Letter) : c.type === "el-read" ? F.Key : w;
    if (!(PIN[id] && PIN[id][key]) || c.id !== "u_" + id + "_" + PIN[id][key]) bad(f + ": " + key + " has id " + c.id + ", its pinned number is " + (PIN[id] && PIN[id][key]));
    if (!GREEK.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not Greek: " + w);
    if (c.type === "el-read") {
      if (!F.Quote || !/revision \d+/.test(F.Source)) bad(f + ": " + key + " quotes nothing, or names no revision");
      return;
    }
    if (alphabet) {
      const front = strip(dec(F.Sound.replace(/<span class="uc-q">.*?<\/span>/g, "")));
      if ([...key].some((x) => x !== " " && front.includes(x))) bad(f + ": " + key + " prints itself on its sound side");
      if (sides.has(F.Sound)) bad(f + ": " + w + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, w);
      return;
    }
    if (seen.has(w)) bad(f + ": " + w + " is already taught in " + seen.get(w));
    seen.set(w, f);
    if (!F.Roman) bad(f + ": " + w + " has no romanisation");
    if (!F.English) bad(f + ": " + w + " has no English");
    if (/>noun/.test(F.English) && F.English.indexOf('class="uc-pos">noun') === F.English.indexOf('class="uc-pos">') &&
        !/uc-art/.test(F.Greek)) bad(f + ": " + w + " is a noun with no article");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l) && !/^\+ [Ͱ-Ͽ]+$/.test(l)) bad(f + ": " + w + " forms label " + l);
    // the English side is the QUESTION of the English → Greek card: none of the card's own Greek outside .uc-eg
    const own = new Set(toks(w).map(fold));
    for (const [, x] of F.Table.matchAll(/class="uc-cj-f">([^<]*)</g)) for (const t of toks(x)) own.add(fold(t));
    const shown = toks(strip(F.English.replace(/<span class="uc-eg">.*?<\/span>/g, ""))).filter((t) => own.has(fold(t)));
    if (shown.length) bad(f + ": " + w + " prints its own answer on the English side: " + shown.join(" "));
    for (const k of ["Greek", "English", "Forms", "Table", "Examples"]) {
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
  console.log("ok    " + f + ": " + d.cards.length + " notes" + (alphabet ? "" : ", " +
    d.cards.filter((c) => c.fields.Forms).length + " with forms, " +
    d.cards.filter((c) => c.fields.Examples).length + " with sentences"));
}
console.log(fail ? fail + " failed" : "all passed");
process.exit(fail ? 1 : 0);
