#!/usr/bin/env node
/* CHECK THE AUTHOR NAMES IN EVERY PMC-BACKED CITATION AGAINST THE RECORD.
 *
 *   node .claude/check-cite-authors.js [--prefix=ps-] [--gloss] [--all]
 *
 * WHY THIS EXISTS. `add-card.js` and `add-sources.js` check that a citation ENDS IN A URL, and the
 * standing rule is to curl every URL before committing — but a URL that returns 200 says nothing
 * about the name in front of it. N4 recorded the whole-citation version of this fault (an author
 * composed because WebFetch returned a paper's content without its metadata). This is the same
 * fault one level down and it is easier to commit: a search result prints "Wani PD", the citation
 * wants a given name, and an expansion that FEELS right gets written. It was Pinaki, not Pooja.
 *
 * Measured over the corpus in Aug 2026 this found seventeen wrong given names across eleven works —
 * Hayden Schill written as Hannah, Samantha Gray as Steven, Wren Gould as William, Piotr Fedurek as
 * Pawel, Jessica Bates as Jennifer — every one of them on a citation whose URL resolved perfectly.
 *
 * WHAT IT REPORTS, AND WHAT IT DELIBERATELY DOES NOT. Only a mismatch where BOTH the citation and
 * the record carry a full given name: "Barbara Cavalazzi" against a record holding "B Cavalazzi" is
 * NOT reported, because Europe PMC often stores initials for a paper whose byline prints the name in
 * full, and flagging those would bury the real findings in a hundred false ones. An initial that
 * matches the record's first letter passes. Read a finding before acting on it — check the PMC page
 * itself, since the record can be wrong too.
 *
 * Needs the network. Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const args = process.argv.slice(2);
const prefixArg = (args.find((a) => a.startsWith("--prefix=")) || "").slice(9);
const wantGloss = args.includes("--gloss") || args.includes("--all") || !prefixArg;
const wantCards = !args.includes("--gloss") || args.includes("--all");

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }

const win = loadWindow(path.join(ROOT, "data.js"));
const gloss = require(path.join(ROOT, ".claude", "gloss-io.js")).loadGlossary();
const GS = gloss.GLOSSARY_SOURCES || (global.window && global.window.GLOSSARY_SOURCES) || {};

/* The author segment of a Chicago note is everything before the first quotation mark or italic
   title. Both quote styles occur in this corpus and missing one turns a whole title into names. */
const authorSegment = (s) => {
  const t = String(s).replace(/<[^>]+>/g, "");
  const i = t.search(/[“"]|\bin\s|<i>/);
  return (i > 0 ? t.slice(0, i) : t).trim();
};

const rows = [];
if (wantCards) {
  for (const c of win.CARD_DATA || []) {
    if (prefixArg && !c.id.startsWith(prefixArg)) continue;
    for (const s of c.sources || []) {
      const m = String(s).match(/PMC\d+/);
      if (m) rows.push({ owner: c.id, pmc: m[0], seg: authorSegment(s) });
    }
  }
}
if (wantGloss) {
  for (const [k, arr] of Object.entries(GS)) {
    for (const s of arr || []) {
      const m = String(s).match(/PMC\d+/);
      if (m) rows.push({ owner: "gloss:" + k, pmc: m[0], seg: authorSegment(s) });
    }
  }
}

const strip = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\./g, "");
const PARTICLE = new Set(["van", "den", "der", "de", "la", "le", "di", "da", "von", "dos", "el", "ter", "ten"]);

function namesIn(seg) {
  const out = [];
  for (let raw of seg.replace(/\set\sal\.?/g, "").split(/,\s*|\s+and\s+/)) {
    let nm = raw.replace(/^and\s+/i, "").trim().replace(/,$/, "");
    if (!nm || /^(jr\.?|eds?\.|ii|iii)$/i.test(nm)) continue;
    let toks = nm.split(/\s+/);
    if (/^jr\.?$/i.test(toks[toks.length - 1])) toks = toks.slice(0, -1);
    if (toks.length < 2) continue;
    let k = toks.length - 1;
    while (k - 1 > 0 && PARTICLE.has(strip(toks[k - 1]))) k--;
    out.push({ given: toks.slice(0, k), last: toks.slice(k).join(" "), text: nm });
  }
  return out;
}

(async () => {
  const ids = [...new Set(rows.map((r) => r.pmc))];
  const rec = {};
  for (let i = 0; i < ids.length; i += 20) {
    const batch = ids.slice(i, i + 20);
    const q = batch.map((x) => "PMCID:" + x).join(" OR ");
    const u = "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=" +
      encodeURIComponent(q) + "&resultType=core&format=json&pageSize=" + batch.length;
    let d;
    try { d = await (await fetch(u)).json(); }
    catch (e) { console.error("  fetch failed for", batch[0], "-", e.message); continue; }
    for (const r of (d.resultList && d.resultList.result) || []) {
      rec[r.pmcid] = ((r.authorList && r.authorList.author) || [])
        .map((a) => ({ first: (a.firstName || "").trim(), last: (a.lastName || "").trim() }));
    }
    await new Promise((res) => setTimeout(res, 500));
  }

  const findings = [];
  let checked = 0, unknown = 0;
  const seen = new Set();
  for (const r of rows) {
    const key = r.pmc + "|" + r.seg;
    if (seen.has(key)) continue;
    seen.add(key);
    const al = rec[r.pmc];
    if (!al) { unknown++; continue; }
    checked++;
    for (const nm of namesIn(r.seg)) {
      const cand = al.filter((a) => strip(a.last) === strip(nm.last));
      if (!cand.length) continue;                 // a surname we cannot match is usually a parse artefact
      /* TRY EVERY AUTHOR WITH THAT SURNAME. A paper with two Hamiltons on it is not a finding, and
         taking the first candidate reported one on `ps-025`, whose citation names them both. */
      let ok = false;
      for (const a of cand) {
        const theirs = a.first.replace(/\./g, " ").split(/\s+/).filter(Boolean);
        let good = true;
        for (let j = 0; j < nm.given.length && j < theirs.length; j++) {
          const mine = strip(nm.given[j]), rf = strip(theirs[j]);
          if (mine.length === 1 || rf.length === 1 || mine.includes("-") || rf.includes("-")) continue;
          if (mine !== rf) { good = false; break; }
        }
        if (good) { ok = true; break; }
      }
      if (!ok) findings.push({ owner: r.owner, pmc: r.pmc, wrote: nm.text,
        record: cand.map((a) => a.first + " " + a.last).join(" / ") });
    }
  }

  console.log(`\nCitation author names — ${checked} citations checked, ${unknown} records unavailable\n`);
  if (!findings.length) { console.log("  no full-given-name mismatches"); return; }
  const uniq = [...new Map(findings.map((f) => [f.owner + f.pmc + f.wrote, f])).values()];
  console.log(`  ${uniq.length} to check by eye:\n`);
  for (const f of uniq.sort((a, b) => a.owner.localeCompare(b.owner))) {
    console.log(`  ${f.owner}  ${f.pmc}`);
    console.log(`      wrote:  ${f.wrote}`);
    console.log(`      record: ${f.record}`);
  }
  console.log("\n  Verify on the PMC page itself before rewriting — the record can be wrong too.");
  process.exitCode = 1;
})();
