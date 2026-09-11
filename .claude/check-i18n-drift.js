#!/usr/bin/env node
/* WHAT THE NINE TRANSLATIONS STILL TRANSLATE (Sep 2026, out of the field audit).
 *
 * Folio ships English-only behind `MULTILANG = false`, and has since Aug 2026. The card and glossary
 * translations were DELETED on request the same month; what survives is the engine and three lazy
 * families of chrome — `i18n/ui-<lang>.js`, `games-<lang>.js`, `places-<lang>.js`, nine languages each.
 * No reader can reach any of it, so nothing on the page reports when a translated string stops matching
 * the English it was written against. It simply falls through to English, silently, for ever.
 *
 * THIS MEASURES THE ROT, and the figure is the point of the file: a decision about whether to revive
 * nine languages rests on how much of them is still true, and that is a number nobody had.
 *
 * WHAT IT ASKS is the cheap half and the only half that can be asked without a browser: does the
 * ENGLISH KEY of each `I18N` / `I18N_HTML` row still occur anywhere in `app.js`? A key that occurs
 * nowhere translates text the site no longer prints.
 *
 * IT IS A FLOOR, NEVER A CENSUS, and the header says so rather than the reader having to derive it:
 *   - a string ASSEMBLED at runtime ("Level " + n) is in no source file whole, so a live row can read
 *     as dead — which inflates the figure;
 *   - a key still present in app.js may sit in a comment, or in a surface that has since moved behind a
 *     flag — which deflates it;
 *   - and it says NOTHING about the other direction, which is much the larger number: every English
 *     string added since the gate went up has no translation in any language at all, and counting those
 *     needs the page rendered.
 * So: report-only, exits 0, and the number is a lower bound on the drift.
 *
 *   node .claude/check-i18n-drift.js [--verbose]
 */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const LANGS = ["es", "fr", "de", "it", "nl", "ru", "ar", "zh", "ja"];
const verbose = process.argv.includes("--verbose");

const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");

function load(file, lang) {
  const w = { I18N: {}, I18N_RULES: {}, I18N_HTML: {} };
  try { new Function("window", fs.readFileSync(file, "utf8"))(w); } catch (e) { return null; }
  return {
    exact: (w.I18N || {})[lang] || {},
    html: (w.I18N_HTML || {})[lang] || {},
    rules: (w.I18N_RULES || {})[lang] || [],
  };
}

let totKeys = 0, totDead = 0, bytes = 0;
const deadEverywhere = new Map();
console.log("\nTHE SITE-CHROME TRANSLATIONS, AGAINST THE ENGLISH THEY WERE WRITTEN FOR\n");
console.log("  lang   strings   rules   keys app.js no longer contains");
for (const L of LANGS) {
  const f = path.join(ROOT, "i18n", "ui-" + L + ".js");
  if (!fs.existsSync(f)) { console.log("  " + L + "     (no file)"); continue; }
  bytes += fs.statSync(f).size;
  const t = load(f, L);
  if (!t) { console.log("  " + L + "     (will not parse)"); continue; }
  const keys = Object.keys(t.exact).concat(Object.keys(t.html));
  const dead = keys.filter((k) => app.indexOf(k) === -1);
  dead.forEach((k) => deadEverywhere.set(k, (deadEverywhere.get(k) || 0) + 1));
  totKeys += keys.length; totDead += dead.length;
  console.log("  " + L.padEnd(5) + String(keys.length).padStart(8) + String(t.rules.length).padStart(8) +
    String(dead.length).padStart(8) + "  (" + Math.round((dead.length / Math.max(1, keys.length)) * 100) + "%)");
}
// the other two families are per-language pools rather than keyed on English text, so they are SIZED here
// and not audited: a game statement or a country name has no English key in app.js to test against.
for (const fam of ["games", "places"]) {
  let n = 0, b = 0;
  LANGS.forEach((L) => { const f = path.join(ROOT, "i18n", fam + "-" + L + ".js"); if (fs.existsSync(f)) { n++; b += fs.statSync(f).size; } });
  console.log("\n  " + fam + ": " + n + " files, " + Math.round(b / 1024) + " KB — not audited (a pool, not keyed on English text)");
  bytes += b;
}
console.log("\n  " + totDead + " of " + totKeys + " chrome strings (" +
  Math.round((totDead / Math.max(1, totKeys)) * 100) + "%) translate text app.js no longer contains.");
console.log("  " + Math.round(bytes / 1024) + " KB of translations in all, every byte of it lazy and unreachable while MULTILANG is false.");
console.log("\n  This is a FLOOR on the drift, never a census — see the header. It says nothing about the\n" +
  "  much larger other direction: every English string written since the gate went up.\n");
if (verbose) {
  const all = [...deadEverywhere.entries()].filter(([, n]) => n === LANGS.length).map(([k]) => k).sort();
  console.log("  Dead in ALL nine languages (" + all.length + "):");
  all.slice(0, 80).forEach((k) => console.log("    " + JSON.stringify(k.length > 90 ? k.slice(0, 90) + "…" : k)));
  if (all.length > 80) console.log("    …and " + (all.length - 80) + " more");
  console.log("");
}
process.exit(0);
