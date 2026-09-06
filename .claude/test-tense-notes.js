#!/usr/bin/env node
/* A CONJUGATION HEADING THAT EXPLAINS ITSELF — the guard for `TENSE_NOTES` / `ucMarkTenses`.
   (Sep 2026, on request: "for the titles of conjugation tenses … users should be able to click them
   and see a popup explaining the tense and its use".)

   No browser and no dependency: the table and the marking pass are sliced out of the real app.js by
   text, so they cannot drift from what ships, and they are run over every deck in `decks/`.

   Every check here is for a failure that is SILENT on the page.
   · A heading nothing marks is a heading a reader never learns is clickable — and the feature simply
     is not there for that language, with the table looking complete from the inside.
   · A heading marked with the WRONG key gives a confident, wrong explanation, which is worse than
     none: `Presente` under Subjuntivo is not the present tense.
   · A one-off German NOUN label (Anwalt, Architektin) marked as a tense would put an explanation of
     the imperfect under a word for a lawyer.
   · And an entry whose text is empty renders a popup with a heading and nothing in it. */
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
let pass = 0, fail = 0;
const ok = (c, m, d) => { if (c) { pass++; console.log("ok    " + m); } else { fail++; console.log("FAIL  " + m + (d === undefined ? "" : "  " + JSON.stringify(d))); } };

// ---- slice the real implementation out of app.js -------------------------------------------------
const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const a = src.indexOf("const TENSE_NOTES = {");
const b = src.indexOf("let tenseWinEl = null;");
ok(a > 0 && b > a, "the tense table and its marking pass are still in app.js", [a, b]);
if (a < 0 || b < a) { console.log("\n" + pass + " passed, " + fail + " failed"); process.exit(1); }
const esc = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const mod = { exports: {} };
new Function("esc", "module", src.slice(a, b) + "\nmodule.exports = { TENSE_NOTES, tenseNote, ucMarkTenses };")(esc, mod);
const { TENSE_NOTES, tenseNote, ucMarkTenses } = mod.exports;

// ---- the table itself ----------------------------------------------------------------------------
const keys = Object.keys(TENSE_NOTES);
ok(keys.length >= 30, "the table covers the moods and tenses of all five conjugated languages", keys.length);
ok(keys.every((k) => k.indexOf("|") >= 0), "every key is <mood>|<heading>, with a bare | for a heading that means one thing anywhere");
ok(keys.every((k) => Array.isArray(TENSE_NOTES[k]) && TENSE_NOTES[k].length === 2 &&
   TENSE_NOTES[k][0].trim() && TENSE_NOTES[k][1].trim().length > 40),
   "every entry has a name AND a real explanation — a popup with an empty body says nothing");
ok(tenseNote("Indicativo", "Presente")[0] === "Present" &&
   tenseNote("Subjuntivo", "Presente")[0] === "Present subjunctive",
   "THE MOOD RESOLVES THE HEADING: Presente is two different tenses and the table gives two answers");
ok(tenseNote("", "Imparfait") && tenseNote("Indicativo", "Imparfait"),
   "a heading that means one thing anywhere answers under any mood, through the bare-| fallback");
ok(!tenseNote("", "Architektin"), "an ordinary word is not in the table");

// ---- the marking pass, over every shipped deck ----------------------------------------------------
const decks = fs.readdirSync(path.join(ROOT, "decks")).filter((f) => f.endsWith(".folio-deck.json"));
ok(decks.length > 40, "every deck in decks/ is swept", decks.length);
const unmarked = new Map(), marked = new Map();
let injected = 0, headings = 0;
for (const f of decks) {
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, "decks", f), "utf8"));
  for (const c of d.cards || []) {
    const h = c.fields && c.fields.Conjugation;
    if (!h) continue;
    const out = ucMarkTenses(h);
    for (const m of h.matchAll(/class="uc-cj-(?:h|mood)">([^<]+)</g)) headings++;
    for (const m of out.matchAll(/data-tense="([^"]+)"/g)) marked.set(m[1], (marked.get(m[1]) || 0) + 1);
    for (const m of out.matchAll(/class="uc-cj-(?:h|mood)">([^<]+)</g)) unmarked.set(m[1].trim(), (unmarked.get(m[1].trim()) || 0) + 1);
    // the attribute is written from OUR key, never from the deck's own text
    for (const m of out.matchAll(/data-tense="([^"]+)"/g)) if (!TENSE_NOTES[m[1]]) injected++;
  }
}
ok(headings > 1000, "the decks really do carry conjugation headings to mark", headings);
ok(injected === 0, "no data-tense attribute carries anything but a key of our own table", injected);
const missed = [...unmarked.entries()].filter(([, n]) => n >= 20).sort((x, y) => y[1] - x[1]);
ok(missed.length === 0, "EVERY heading occurring 20+ times across all decks is explained", missed.slice(0, 8));
ok([...marked.keys()].length >= 30, "and the marks are spread across the languages, not just Spanish", [...marked.keys()].length);

// a Spanish verb's whole table is covered, heading by heading
const dele = JSON.parse(fs.readFileSync(path.join(ROOT, "decks", "DELE-A1-Spanish.folio-deck.json"), "utf8"));
const verb = (dele.cards || []).find((c) => c.fields && c.fields.Conjugation);
const out = ucMarkTenses(verb.fields.Conjugation);
const left = [...out.matchAll(/class="uc-cj-(?:h|mood)">([^<]+)</g)].map((m) => m[1]);
ok(left.length === 0, "a Spanish verb card has no unexplained heading left", left);
ok((out.match(/tabindex="0"/g) || []).length === (out.match(/data-tense=/g) || []).length,
   "every marked heading is reachable from the keyboard as well as by pointer");
ok(out.indexOf('role="button"') > 0, "and announces itself as a control to a screen reader");

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
