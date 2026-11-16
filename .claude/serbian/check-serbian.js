#!/usr/bin/env node
/* The Serbian decks' own check: node .claude/serbian/check-serbian.js
   Reads every decks/Serbian-*.folio-deck.json and fails on the faults this pipeline has had or could have:
   a word taught on two levels, a card defined by a pointer rather than English ("inflection of …",
   "alternative form of …", a letter's name), a speaker field that is not Serbian Cyrillic or carries an accent
   mark, a Latin field that is not the Cyrillic letter for letter, an accented headword that is not the speaker
   field with marks added, a forms label the generator does not write, unbalanced HTML, an id out of sequence,
   two notes sharing an English side (the reverse card would have two answers). */
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "..", "decks");
const LABELS = new Set(["genitive", "plural", "feminine", "neuter", "ја", "он", "past", "perfective", "imperfective"]);
const POINTER = /^(?:alternative|obsolete|dated|rare) (?:form|spelling) of |^(?:inflection|synonym) of |^The name of the |letter of the .* alphabet/i;
const SR = /^[абвгдђежзијклљмнњопрстћуфхцчџшАБВГДЂЕЖЗИЈКЛЉМНЊОПРСТЋУФХЦЧЏШ \-]+$/;
const ACC = /[̏́̀̑̄]/g;
const C2L = { а: "a", б: "b", в: "v", г: "g", д: "d", ђ: "đ", е: "e", ж: "ž", з: "z", и: "i", ј: "j", к: "k", л: "l",
  љ: "lj", м: "m", н: "n", њ: "nj", о: "o", п: "p", р: "r", с: "s", т: "t", ћ: "ć", у: "u", ф: "f", х: "h", ц: "c",
  ч: "č", џ: "dž", ш: "š" };
const lat = (s) => [...s].map((ch) => {
  const lo = ch.toLowerCase(), t = C2L[lo];
  return t === undefined ? ch : ch === lo ? t : t[0].toUpperCase() + t.slice(1);
}).join("");
const bare = (s) => s.normalize("NFD").replace(ACC, "").normalize("NFC");
let fail = 0;
const bad = (m) => { fail++; console.log("FAIL  " + m); };
const files = fs.readdirSync(DIR).filter((f) => /^Serbian-.*\.folio-deck\.json$/.test(f)).sort();
if (!files.length) bad("no Serbian deck in decks/");
const seen = new Map();
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const id = d.meta.id;
  const alphabet = /Alphabet/.test(d.meta.title);
  const sides = new Map();
  d.cards.forEach((c, i) => {
    const F = c.fields, w = F.Word;
    if (c.id !== "u_" + id + "_" + (i + 1)) bad(f + ": card " + (i + 1) + " has id " + c.id);
    if (!SR.test(w || "")) bad(f + ": card " + (i + 1) + " Word is not Serbian Cyrillic: " + w);
    if (alphabet) {
      if (sides.has(F.Sound)) bad(f + ": " + w + " shares its sound side with " + sides.get(F.Sound));
      sides.set(F.Sound, w);
      return;
    }
    if (bare(F.Serbian) !== w) bad(f + ": " + F.Serbian + " is not the speaker field " + w + " with accent marks");
    if (F.Latin !== lat(w)) bad(f + ": Latin " + F.Latin + " is not " + w + " letter for letter");
    const key = w.toLowerCase();
    if (seen.has(key)) bad(f + ": " + w + " is already taught in " + seen.get(key));
    seen.set(key, f);
    if (!F.English) bad(f + ": " + w + " has no English");
    for (const g of F.English.replace(/<\/(li|div)>/g, "\n").replace(/<[^>]+>/g, "").split("\n"))
      if (POINTER.test(g.trim())) bad(f + ": " + w + " is defined by a pointer: " + g.trim());
    for (const [, l] of F.Forms.matchAll(/class="uc-fl">([^<]*)</g)) if (!LABELS.has(l)) bad(f + ": " + w + " forms label " + l);
    const cellsOf = (h, rx) => [...h.matchAll(rx)].map((m) => m[1]).join(" ");
    const printed = cellsOf(F.Forms, /<\/span>([^<]*)<\/span>/g) + " " + cellsOf(F.Table, /class="uc-cj-f">([^<]*)</g);
    if (/[a-zčćđšž]/i.test(printed)) bad(f + ": " + w + " prints a Latin letter in its forms: " + printed);
    for (const k of ["English", "Forms", "Table", "Examples"]) {
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
