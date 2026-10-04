#!/usr/bin/env node
/* precheck.js <id> — check a drafted $S/out/<id>.json against the real guards, without writing.
   Run from /home/user/folio. */
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const { S } = require("./cfg.js"), REPO = require("path").resolve(__dirname, "..", "..");
const id = process.argv[2];
if (!id) { console.error("usage: precheck.js <id>"); process.exit(2); }
const out = JSON.parse(fs.readFileSync(path.join(S, "out", id + ".json"), "utf8"));
const P = out.patch; let bad = 0;
const fail = (m) => { bad++; console.log("  FAIL " + m); };

/* 1. add-card.js, every guard, no write */
const tmp = path.join(S, "out", "." + id + ".patch.json");
fs.writeFileSync(tmp, JSON.stringify(P));
const r = cp.spawnSync("node", [".claude/add-card.js", tmp, "--replace", "--no-image", "--dry-run"], { cwd: REPO, encoding: "utf8" });
const txt = (r.stdout + r.stderr).trim();
if (r.status !== 0) fail("add-card.js: " + txt.split("\n").filter((l) => /ERROR|error/i.test(l)).join(" | ").slice(0, 900) || txt.slice(0, 900));
else if (/WARN/i.test(txt)) console.log("  warn " + txt.split("\n").filter((l) => /WARN/i.test(l)).join(" | ").slice(0, 600));

/* 2. the audit, on the merged card */
const cio = require(path.join(REPO, ".claude", "card-io.js"));
const orig = cio.loadCards;
cio.loadCards = function () {
  const o = orig.apply(this, arguments);
  o.cards = o.cards.map((c) => (c.id === id ? Object.assign(JSON.parse(JSON.stringify(c)), P, out.locator !== undefined && out.locator !== null ? { locator: { at: [0, 0], name: "x" } } : {}) : c));
  return o;
};
const log = console.log, lines = [];
console.log = (...a) => lines.push(a.join(" "));
const { AUDIT } = require("./cfg.js");
process.argv = [process.argv[0], AUDIT, "--card=" + id];
require(path.join(REPO, ".claude", AUDIT));
console.log = log;
lines.filter((l) => /^\s{4}\S/.test(l)).forEach((l) => {
  if (/W\.not-why|Q\.sibling/.test(l)) console.log("  note " + l.trim()); else fail("audit " + l.trim());
});

/* 2b. check-questions.js's pronoun-opening rule (not in the audit) */
{ const CAT = /^(Its|It|He|She|They|Their|His|Her|There|Here|Such|This|These|Those)\b/, DUM = /^It (?:was|is|has been|had been|had|would|will|may|might|seems|appears)\b/;
  [P.question].concat(P.questions || []).forEach((q, i) => { const t = String(q || "").replace(/<[^>]*>/g, "").trim();
    if (CAT.test(t) && !DUM.test(t)) fail("phrasing " + (i + 1) + " opens on a pronoun"); }); }
/* 3. evidence: every quote in its saved file; every source has evidence; URLs match */
const N = (s) => String(s || "").normalize("NFKC").replace(/[­​]/g, "").replace(/[‘’ʼ′]/g, "'").replace(/[“”″]/g, '"')
  .replace(/[‐‑‒–—−]/g, "-").replace(/\s+/g, " ").toLowerCase().trim();
const srcs = P.sources || [];
const ev = out.evidence || [];
srcs.forEach((s, i) => {
  const e = ev.filter((x) => x.source === i + 1);
  if (!e.length) { fail("source " + (i + 1) + " has no evidence entry"); return; }
  const url = (/(https?:\/\/\S+?)\.?(?:\s+\[[^\]]+\])*\s*$/.exec(s.replace(/<[^>]+>/g, "")) || [])[1];
  if (url && !e.some((x) => x.url && N(x.url).replace(/\.$/, "") === N(url).replace(/\.$/, ""))) fail("source " + (i + 1) + " URL " + url + " differs from its evidence URL");
});
ev.forEach((e) => {
  const f = path.join(S, e.file || "");
  if (!e.file || !fs.existsSync(f)) { fail("evidence for source " + e.source + ": file missing " + e.file); return; }
  const t = N(fs.readFileSync(f, "utf8"));
  if (t.length < 200) fail("evidence file " + e.file + " is nearly empty (" + t.length + " chars)");
  (e.quotes || []).forEach((q) => { if (t.indexOf(N(q)) < 0) fail("source " + e.source + " quote not in " + e.file + ": \"" + String(q).slice(0, 90) + "\""); });
  if (!(e.quotes || []).length) fail("source " + e.source + " has no quotes");
});

/* 4. glossary draft */
const g = out.glossary;
if (g) {
  const plain = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const w = plain(g.description).replace(/\s*\((?=[^)]*\d)[^)]*\)/g, "").split(" ").filter((x) => /[\p{L}\p{N}]/u.test(x)).length;
  if (w < 90 || w > 110) fail("glossary description " + w + " words (90–110)");
  const marks = (g.description.match(/<sup class="fn" data-fn="\d+"><\/sup>/g) || []).length;
  const sents = plain(g.description).split(/(?<=[.!?])\s+(?=[A-Z<])/).length;
  if (sents !== 3) console.log("  note glossary looks like " + sents + " sentences (3 wanted) — check by eye");
  if (!marks) fail("glossary has no markers");
  if (!Array.isArray(g.sources) || g.sources.length < 2) fail("glossary needs ≥2 sources");
  if (!g.slug) fail("glossary has no slug");
}
console.log(bad ? id + ": " + bad + " problem(s)" : id + ": OK");
