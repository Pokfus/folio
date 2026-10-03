#!/usr/bin/env node
/* import-batch.js — load a batch of cards + glossary terms (e.g. written by ChatGPT from
 * docs/card-authoring.md) through the real validators, in one command.
 *
 *   node .claude/import-batch.js <batch.json> [--overwrite-glossary] [--no-locators]
 *
 * <batch.json> is { "cards": [ { "deck": "<leaf deck id>", ...card fields } ],
 *                   "glossary": [ { "slug": ..., ...term fields } ] }
 * as specified in docs/card-authoring.md. A ```json fence around it is tolerated.
 *
 * What it does, in order:
 *   1. Each glossary term goes through add-glossary.js — EXCEPT a slug that already exists, which is
 *      skipped and reported (add-glossary.js overwrites in silence; pass --overwrite-glossary to allow).
 *   2. Each card goes through add-card.js <card> <deck>. `deck`, `notes` and a `locator` that carries
 *      no `at` are taken off first. A refusal does not stop the batch.
 *   3. Cards that were added and asked for a locator ({ title, name?, zoom?, kind? }) are passed to
 *      add-locators.js, which fetches the real coordinate (needs the network).
 *   3b. Each added card's dedicated Wikipedia article is resolved in ONE pass (wiki-step.js) and written
 *      onto the card as `wiki`, which the Learn-more tile at the foot of the card links to. A card whose
 *      answer has no article gets none and shows no tile; if Wikipedia does not answer, the exact command
 *      that finishes the job is printed (CI's `apply-wiki-links.js --check` fails until it is run).
 *   4. Everything refused is written to <batch>.rejected.json with the validator's message beside it,
 *      so it can be fixed and re-imported. Each card's `notes` are printed.
 *
 * It checks the SHAPE of every citation (the validators do) and NOT whether the work exists or says
 * what is claimed. Verify citations before committing. Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path"), os = require("os");
const { spawnSync } = require("child_process");
const HERE = __dirname;

const file = process.argv[2];
if (!file) { console.error("usage: node .claude/import-batch.js <batch.json> [--overwrite-glossary] [--no-locators]"); process.exit(1); }
const OVERWRITE = process.argv.includes("--overwrite-glossary");
const NO_LOC = process.argv.includes("--no-locators");

let raw = fs.readFileSync(file, "utf8").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
let batch;
try { batch = JSON.parse(raw); } catch (e) { console.error("ERROR: not valid JSON — " + e.message); process.exit(1); }
const cards = Array.isArray(batch.cards) ? batch.cards : [];
const terms = Array.isArray(batch.glossary) ? batch.glossary : [];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "folio-import-"));
const run = (script, args) => {
  const r = spawnSync(process.execPath, [path.join(HERE, script), ...args], { encoding: "utf8" });
  return { ok: r.status === 0, out: ((r.stdout || "") + (r.stderr || "")).trim() };
};
const errOf = (out) => (out.split("\n").filter((l) => /ERROR/.test(l)).join("\n") || out.split("\n").slice(-5).join("\n"));

/* ---- 1. glossary ---- */
global.window = {};
const { loadGlossary } = require("./gloss-io.js");
const existing = new Set(Object.keys(loadGlossary().GLOSSARY || {}));
const rejected = { cards: [], glossary: [] };
let gAdded = 0, gSkipped = [];
for (const t of terms) {
  if (!t || !t.slug) { rejected.glossary.push({ ...t, error: "no slug" }); continue; }
  if (existing.has(t.slug) && !OVERWRITE) { gSkipped.push(t.slug); continue; }
  const p = path.join(tmp, "g-" + t.slug.replace(/[^\w-]/g, "_") + ".json");
  fs.writeFileSync(p, JSON.stringify(t));
  const r = run("add-glossary.js", [p, "--no-image"]);
  if (r.ok) gAdded++; else rejected.glossary.push({ ...t, error: errOf(r.out) });
}

/* ---- 2. cards ---- */
let cAdded = [];
const locBatch = { cards: {} };
const notes = [];
for (const c0 of cards) {
  const c = { ...c0 };
  const deck = c.deck; delete c.deck;
  if (c.notes) { notes.push([c.id, c.notes]); delete c.notes; }
  let loc = null;
  if (c.locator && !Array.isArray(c.locator.at)) { loc = c.locator; delete c.locator; }
  if (!deck) { rejected.cards.push({ ...c0, error: "no `deck` — add-card.js would file it into China" }); continue; }
  const p = path.join(tmp, "c-" + String(c.id).replace(/[^\w-]/g, "_") + ".json");
  fs.writeFileSync(p, JSON.stringify(c));
  const r = run("add-card.js", [p, deck, "--no-image", "--no-wiki"]);   // the batch's Wikipedia links are resolved together below
  if (!r.ok) { rejected.cards.push({ ...c0, error: errOf(r.out) }); continue; }
  cAdded.push(c.id);
  if (loc && loc.title) locBatch.cards[c.id] = loc;
}

/* ---- 3. locators ---- */
let locOut = "";
if (!NO_LOC && Object.keys(locBatch.cards).length) {
  const p = path.join(tmp, "locators.json");
  fs.writeFileSync(p, JSON.stringify(locBatch, null, 1));
  const r = run("add-locators.js", [p]);
  locOut = r.ok ? "added " + Object.keys(locBatch.cards).length + " locator(s)"
                : "add-locators.js refused — fix and re-run with " + p + ":\n" + errOf(r.out);
}

/* ---- 3b. Wikipedia links: one pass for the whole batch (see wiki-step.js) ---- */
let wikiOut = "";
if (cAdded.length) {
  const w = require("./wiki-step.js").linkNewCards(cAdded, { quiet: true });
  if (w.ok) wikiOut = "Learn-more link on " + w.linked.length + " of " + cAdded.length + " card(s)" + (w.none.length ? "; no dedicated article for " + w.none.join(", ") : "") + (w.glance.length ? "\n          CHECK these links (redirect / disambiguation / search match): " + w.glance.join(", ") + " — see docs/wikipedia-links-audit.md" : "");
  else wikiOut = "NOT RESOLVED (Wikipedia did not answer) — the cards are written. Finish with:\n          " + w.retry;
}

/* ---- 4. report ---- */
console.log("\nglossary: " + gAdded + " added" + (gSkipped.length ? ", " + gSkipped.length + " skipped as already present (" + gSkipped.join(", ") + ")" : "") + ", " + rejected.glossary.length + " refused");
console.log("cards:    " + cAdded.length + " added (" + cAdded.join(", ") + "), " + rejected.cards.length + " refused");
if (locOut) console.log("locators: " + locOut);
if (wikiOut) console.log("wikipedia: " + wikiOut);
for (const [id, n] of notes) console.log("notes " + id + ": " + (Array.isArray(n) ? n.join(" | ") : n));
for (const r of rejected.glossary) console.log("\nREFUSED term " + r.slug + ":\n  " + r.error.replace(/\n/g, "\n  "));
for (const r of rejected.cards) console.log("\nREFUSED card " + r.id + ":\n  " + r.error.replace(/\n/g, "\n  "));
if (rejected.cards.length || rejected.glossary.length) {
  const out = file.replace(/\.json$/i, "") + ".rejected.json";
  fs.writeFileSync(out, JSON.stringify(rejected, null, 1) + "\n");
  console.log("\nwrote the refusals to " + out + " — fix them and import that file.");
}
console.log("\nNEXT: verify every citation (curl each URL; node .claude/check-citations.js --card=<id>), then check-style.js, check-questions.js, test-card-plans.js.");
process.exit(rejected.cards.length || rejected.glossary.length ? 1 : 0);
