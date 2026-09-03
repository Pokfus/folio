/* Folio — tag artefacts with the avatar slot they can be WORN in.
   =============================================================
   node .claude/add-artefact-slots.js <batch.json>        { "slots": { "<artefact id>": "head", … } }
   node .claude/add-artefact-slots.js --report            what is tagged today, by slot

   `slot` is "head" | "body" | "jewelry" | "hand", or "" to clear one. It decides only whether an
   artefact may be worn on the account page's avatar; EVERY artefact can stand on the scene's display
   object whatever this says, so an untagged one loses nothing and the field is genuinely optional.

   WHY THIS IS A SPLICE AND NOT A REWRITE. Re-serialising artefacts.js would normalise every entry's key
   order and turn a twenty-artefact change into a two-thousand-line diff — the lesson add-card-tags.js
   learned the hard way (see CLAUDE.md). Each tag is inserted as its own line directly after that
   artefact's `rarity:` line, so the diff is one line per artefact touched and nothing else moves.

   IT VALIDATES THE WHOLE BATCH BEFORE WRITING ANYTHING: a half-applied batch is worse than a refused
   one, and an id that does not exist is almost always a typo rather than a new artefact.

   Not part of the site. */

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "artefacts.js");
const SLOTS = ["head", "body", "jewelry", "hand"];

function pool() {
  global.window = {};
  delete require.cache[require.resolve(FILE)];
  require(FILE);
  return global.window.ARTEFACTS || [];
}

function report() {
  const by = { head: [], body: [], jewelry: [], hand: [], "(display only)": [] };
  pool().forEach((a) => (by[SLOTS.indexOf(a.slot) >= 0 ? a.slot : "(display only)"]).push(a.name));
  Object.keys(by).forEach((k) => {
    console.log("\n" + k + "  (" + by[k].length + ")");
    if (k !== "(display only)") by[k].forEach((n) => console.log("    " + n));
  });
  console.log("");
}

const arg = process.argv[2];
if (!arg || arg === "--report") { report(); process.exit(0); }

const batch = JSON.parse(fs.readFileSync(arg, "utf8"));
const want = batch.slots || batch;
const have = new Set(pool().map((a) => a.id));
const bad = [];
Object.keys(want).forEach((id) => {
  if (!have.has(id)) bad.push("no artefact with id " + JSON.stringify(id));
  else if (want[id] !== "" && SLOTS.indexOf(want[id]) < 0) bad.push(id + ": " + JSON.stringify(want[id]) + " is not one of " + SLOTS.join(" / "));
});
if (bad.length) { console.error("Refused — nothing written:\n  " + bad.join("\n  ")); process.exit(1); }

let text = fs.readFileSync(FILE, "utf8");
let set = 0, cleared = 0, same = 0;
Object.keys(want).forEach((id) => {
  const at = text.indexOf('id: "' + id + '"');
  if (at < 0) { console.error("could not locate " + id + " in the file"); process.exit(1); }
  // the entry runs to the next `  {` at entry indentation, or the end of the array
  const end = (() => { const n = text.indexOf("\n  {", at); return n < 0 ? text.length : n; })();
  let entry = text.slice(at, end);
  const cur = /\n    slot: "([a-z]*)",/.exec(entry);
  const val = want[id];
  if (cur && cur[1] === val) { same++; return; }
  if (cur) entry = entry.replace(/\n    slot: "[a-z]*",/, val ? '\n    slot: "' + val + '",' : "");
  else if (val) entry = entry.replace(/(\n    rarity: "[a-z]+",)/, '$1\n    slot: "' + val + '",');
  else { same++; return; }
  if (val) set++; else cleared++;
  text = text.slice(0, at) + entry + text.slice(end);
});
fs.writeFileSync(FILE, text);

// re-parse, or a broken artefacts.js reaches a reader as a site with no chests at all
try { pool(); } catch (e) { console.error("artefacts.js no longer parses — restore it with git checkout:\n" + e.message); process.exit(1); }
console.log("set " + set + ", cleared " + cleared + ", unchanged " + same);
report();
