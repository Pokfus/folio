#!/usr/bin/env node
/* rm-audit.js — every MECHANICAL rule of the Ancient Rome refinement audit, per card. REPORT-ONLY.
 *
 *     node .claude/rm-audit.js [--range=rm-001:rm-010] [--card=rm-008] [--summary] [--all] [--worst]
 *
 *   --range / --card / --summary / --all   as in greece-audit.js
 *   --worst    one line per batch of ten (plan order), with its finding count, worst first — the list
 *              the batches are picked from
 *
 * THE RULES ARE THE GREECE AUDIT'S, AND SO IS THE CODE (Oct 2026). docs/rome-refinement-audit.md adopts the
 * settled rules of docs/greece-refinement-audit.md unchanged, so this file does not copy greece-audit.js:
 * it hands it a config (prefix, chronology file) and requires it, exactly as wh-audit.js does. A rule
 * changed there is changed here. What Rome adds is configured below:
 *
 *   Q.date     also an AUC year ("AUC", "A.U.C.") — a year counted from the founding is a date as surely
 *              as "509" is. (World History's deep-time extension is not carried: Rome has no prehistory.)
 *   L.missing  also a STATE (a kingdom or empire has somewhere to stand, as a battle does).
 *   G.none     the card's answer term has no glossary entry (key, display title or alias).
 *   G.date     the glossary entry's date and the card's date line share no year — a lead, read by eye,
 *              since an entry may date the whole term where the card dates one moment of it.
 *
 * Exits 0 whatever it finds: it is the batch's report, not a gate. Zero dependencies. Not part of the site.
 */
"use strict";
const { loadGlossary } = require("./gloss-io.js");

const PREFIX = "rm";
const G = loadGlossary();
const norm = (s) => String(s || "").replace(/<[^>]*>/g, "").replace(/_/g, " ").replace(/\s*\([^)]*\)\s*$/, "")
  .normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
const TERM = new Map();   // normalised surface → glossary key
for (const k of Object.keys(G.GLOSSARY || {})) {
  TERM.set(norm(k), k);
  const t = (G.GLOSSARY_TITLES || {})[k]; if (t) TERM.set(norm(t), k);
  ((G.GLOSSARY_ALIASES || {})[k] || []).forEach((a) => TERM.set(norm(a), k));
}
const years = (s) => new Set([...String(s || "").replace(/<[^>]*>/g, " ").matchAll(/\b\d+(?:\.\d+)?\b/g)].map((m) => m[0]));

function extraChecks(c, finding) {
  const key = TERM.get(norm(c.answerText || c.answer)) || TERM.get(norm(c.answer));
  if (!key) { finding("G.none", "no glossary entry for \"" + norm(c.answer) + "\""); return; }
  const gd = (G.GLOSSARY_DATES || {})[key];
  if (gd && c.answerDate) {
    const a = years(gd), b = years(c.answerDate);
    if (a.size && b.size && ![...a].some((y) => b.has(y))) finding("G.date", "glossary " + key + " dates it \"" + gd + "\"; the date line shares no figure");
  }
}

global.AUDIT_CFG = {
  prefix: PREFIX, chronology: "rome-chronology.md", name: "rm-audit", max: 1000,
  extraQDate: /\bA\.?U\.?C\.?(?![\w])/,
  extraPlaceKinds: ["state"],
  extraChecks,
};

if (process.argv.includes("--worst")) {
  /* Run the audit quietly over the whole collection and rank the batches of ten by finding count. */
  const log = console.log; const lines = [];
  console.log = (...a) => lines.push(a.join(" "));
  process.argv = process.argv.filter((a) => a !== "--worst" && a !== "--summary");
  require("./greece-audit.js");
  console.log = log;
  const per = {}; let cur = null;
  const ID = new RegExp("^(" + PREFIX + "-\\d+)\\s");
  for (const l of lines) {
    const m = ID.exec(l); if (m) { cur = m[1]; per[cur] = 0; continue; }
    if (cur && /^\s{4}\S/.test(l)) per[cur]++;
  }
  const batches = {};
  Object.keys(per).forEach((id) => { const b = Math.ceil(+id.slice(PREFIX.length + 1) / 10); batches[b] = (batches[b] || 0) + per[id]; });
  Object.keys(batches).sort((a, b) => batches[b] - batches[a] || a - b).forEach((b) => {
    const lo = (b - 1) * 10 + 1, hi = b * 10, p = (n) => PREFIX + "-" + String(n).padStart(3, "0");
    log("B" + String(b).padEnd(4) + p(lo) + "–" + p(hi) + "  " + batches[b] + " finding(s)");
  });
} else {
  require("./greece-audit.js");
}
