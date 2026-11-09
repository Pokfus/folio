#!/usr/bin/env node
/* build-whatlang.js — generates whatlang.js, the pool of the What language? minigame (2026-11-09, on request).

   Usage:
     node .claude/build-whatlang.js <udhr-checkout>          writes whatlang.js
     node .claude/build-whatlang.js <udhr-checkout> --check  fails when whatlang.js differs from what it would write
     node .claude/build-whatlang.js --verify                 offline: checks whatlang.js's shape alone (CI)

   <udhr-checkout> is a clone of the UDHR in XML project (git clone --depth 1 https://github.com/eric-muller/udhr),
   kept OUTSIDE the repository. The languages, their families and branches are .claude/whatlang-languages.json; the
   text of each is Article 1 of the Universal Declaration of Human Rights, exactly as that project transcribes it
   (data/udhr/udhr_<key>.xml), its paragraphs joined by a space. Nothing is translated or written here.

   `near` (per language): the other languages whose Article 1 is so close to this one's (character-trigram Jaccard
   ≥ NEAR) that a reader could not tell them apart from the text — Croatian beside Bosnian, Indonesian beside Malay.
   The game never offers one as a decoy for the other. */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "whatlang.js");
const LIST = path.join(__dirname, "whatlang-languages.json");
const NEAR = 0.6;
const WANT = 200;

const SCRIPTS = {
  Latn: "Latin", Cyrl: "Cyrillic", Grek: "Greek", Armn: "Armenian", Geor: "Georgian", Arab: "Arabic", Hebr: "Hebrew",
  Ethi: "Ge’ez", Deva: "Devanagari", Beng: "Bengali", Guru: "Gurmukhi", Gujr: "Gujarati", Taml: "Tamil", Telu: "Telugu",
  Knda: "Kannada", Mlym: "Malayalam", Sinh: "Sinhala", Thaa: "Thaana", Tibt: "Tibetan", Mymr: "Myanmar", Thai: "Thai",
  Laoo: "Lao", Khmr: "Khmer", Hani: "Chinese characters", Hans: "Simplified Chinese characters", Hant: "Traditional Chinese characters",
  Jpan: "Japanese (kanji and kana)", Kore: "Hangul", Hang: "Hangul", Yiii: "Yi", Tfng: "Tifinagh", Syrc: "Syriac",
  Cans: "Canadian syllabics", Mong: "Mongolian",
};

function fail(msg) { console.error("build-whatlang: " + msg); process.exit(1); }
function decode(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&amp;/g, "&");
}
function trigrams(s) {
  const t = new Set(), x = " " + s.toLowerCase().replace(/[\s\p{P}]+/gu, " ").trim() + " ";
  const cps = Array.from(x);
  for (let i = 0; i + 2 < cps.length; i++) t.add(cps[i] + cps[i + 1] + cps[i + 2]);
  return t;
}
function jaccard(a, b) { let n = 0; for (const g of a) if (b.has(g)) n++; return n / (a.size + b.size - n || 1); }

function verify(langs) {
  const errs = [];
  if (!Array.isArray(langs)) fail("whatlang.js does not define window.WHATLANG.langs");
  if (langs.length !== WANT) errs.push("expected " + WANT + " languages, found " + langs.length);
  const ids = new Set(), names = new Set();
  for (const l of langs) {
    const where = "[" + (l && l.id) + "]";
    for (const k of ["id", "name", "family", "branch", "script", "text"]) if (!l || typeof l[k] !== "string" || !l[k].trim()) errs.push(where + " has no " + k);
    if (!l) continue;
    if (ids.has(l.id)) errs.push(where + " is a duplicate id"); ids.add(l.id);
    if (names.has(l.name)) errs.push(where + " is a duplicate name"); names.add(l.name);
    if (l.text && (l.text.length < 40 || l.text.length > 700)) errs.push(where + " text is " + l.text.length + " characters (40–700)");
    if (/[<>]/.test(l.text || "")) errs.push(where + " text carries markup");
    for (const k of ["near", "like"]) if (l[k] && (!Array.isArray(l[k]) || l[k].some((x) => typeof x !== "string"))) errs.push(where + " " + k + " is not a list of ids");
  }
  for (const l of langs) for (const k of ["near", "like"]) for (const x of (l && l[k]) || []) if (!ids.has(x)) errs.push("[" + l.id + "] " + k + " names an unknown id " + x);
  return errs;
}

function loadOut() {
  if (!fs.existsSync(OUT)) fail("whatlang.js does not exist");
  global.window = {};
  require(OUT);
  return window.WHATLANG;
}

const args = process.argv.slice(2);
if (args[0] === "--verify") {
  const W = loadOut();
  const errs = verify(W && W.langs);
  if (!W || typeof W.english !== "string" || !W.english) errs.push("no english reference text");
  if (errs.length) { errs.forEach((e) => console.error("  " + e)); fail(errs.length + " problem(s)"); }
  console.log("build-whatlang --verify: " + W.langs.length + " languages, all well formed.");
  process.exit(0);
}

const dir = args[0];
if (!dir || !fs.existsSync(path.join(dir, "data", "udhr", "index.xml"))) fail("pass a clone of github.com/eric-muller/udhr (no data/udhr/index.xml under " + dir + ")");
const index = fs.readFileSync(path.join(dir, "data", "udhr", "index.xml"), "utf8");
const meta = new Map();
for (const m of index.matchAll(/<udhr\s+f='([^']+)'[^>]*>/g)) {
  const attr = (k) => { const r = m[0].match(new RegExp(k + "='([^']*)'")); return r ? r[1] : ""; };
  meta.set(m[1], { script: attr("iso15924"), dir: attr("dir"), stage: +attr("stage") || 0 });
}
function article1(key) {
  const file = path.join(dir, "data", "udhr", "udhr_" + key + ".xml");
  if (!fs.existsSync(file)) fail("no " + file);
  const xml = fs.readFileSync(file, "utf8");
  const art = xml.match(/<article number=["']1["']>([\s\S]*?)<\/article>/);
  if (!art) fail(key + ": no Article 1");
  const paras = [...art[1].matchAll(/<para[^>]*>([\s\S]*?)<\/para>/g)].map((p) => decode(p[1]).replace(/\s+/g, " ").trim()).filter(Boolean);
  if (!paras.length) fail(key + ": Article 1 is empty");
  return paras.join(" ");
}

const list = JSON.parse(fs.readFileSync(LIST, "utf8")).languages;
const langs = list.map(([key, id, name, family, branch, like]) => {
  const m = meta.get(key);
  if (!m) fail(key + " is not in the project's index");
  if (m.stage < 3) fail(key + " is at stage " + m.stage + " (no checked text)");
  const o = { id, name, family, branch, script: SCRIPTS[m.script] || fail(key + ": unknown script " + m.script), text: article1(key), src: key };
  if (m.dir === "rtl") o.dir = "rtl";
  if (like && like.length) o.like = like;
  return o;
});
const grams = langs.map((l) => trigrams(l.text));
langs.forEach((l, i) => {
  const near = langs.filter((o, j) => j !== i && jaccard(grams[i], grams[j]) >= NEAR).map((o) => o.id);
  if (near.length) l.near = near;
});
const errs = verify(langs);
if (errs.length) { errs.forEach((e) => console.error("  " + e)); fail(errs.length + " problem(s)"); }

const english = article1("eng");
const head = `/* What language? — the minigame's pool (2026-11-09, on request; docs/minigames.md "What language?").
   GENERATED by .claude/build-whatlang.js from .claude/whatlang-languages.json — never hand-edit; re-run the builder.
   Lazy: loaded by the \`whatlang\` bundle when the game opens, never on the eager path.

   sources: Article 1 of the Universal Declaration of Human Rights (United Nations General Assembly resolution 217 A,
   10 December 1948), in each language as transcribed by the UDHR in XML project (formerly UDHR in Unicode),
   https://github.com/eric-muller/udhr — data/udhr/udhr_<src>.xml; the translations are collected by the Office of the
   UN High Commissioner for Human Rights, https://www.ohchr.org/en/human-rights/universal-declaration/universal-declaration-human-rights/about-universal-declaration-human-rights-translation-project.
   The families and branches are Folio's, one row per language in .claude/whatlang-languages.json.

   { id, name, family, branch, script, text, src: the project's file key, dir?: "rtl", like?: similar-looking
   languages for a small family, near?: languages whose text is too close to this one's to be told apart (never a decoy) } */
`;
const body = "window.WHATLANG = {\n  english: " + JSON.stringify(english) + ",\n  langs: [\n" +
  langs.map((l) => "    " + JSON.stringify(l)).join(",\n") + "\n  ]\n};\n";
const out = head + body;
if (args.includes("--check")) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (cur !== out) fail("whatlang.js lags its builder — run node .claude/build-whatlang.js <udhr-checkout>");
  console.log("build-whatlang --check: whatlang.js is current.");
} else {
  fs.writeFileSync(OUT, out);
  const nearN = langs.filter((l) => l.near).length;
  console.log("build-whatlang: wrote whatlang.js — " + langs.length + " languages, " + nearN + " with a near twin, " + (out.length / 1024).toFixed(0) + " KB.");
  langs.filter((l) => l.near).forEach((l) => console.log("  near: " + l.id + " ~ " + l.near.join(", ")));
}
