#!/usr/bin/env node
/* audit-polity-names.js — do the names Cliopatria gave the polities of history.bin agree with Wikidata? (Atlas v2 Phase 4, task 0c)

     node .claude/atlas-build/audit-polity-names.js [--fetch] [--report] [--check]

   WHAT IT DOES. Every polity entity of atlas/data/history.bin carries the Wikidata item (`qid`) its card-linked series was matched to. For each, the English LABEL of that item is
   compared with the entity's name (folded: case, accents, a leading "the", punctuation). A disagreement is then looked at against what Wikidata can say about the SPAN:
     · a DATED NAME STATEMENT on the item (official name P1448, name P2561, short name P1813, each with start time P580, end time P582 or point in time P585), and
     · a DATED LABEL — another item whose English label is the name and whose inception P571 and dissolution P576 cover the years (Q600018 "Kingdom of Hungary", 1920-02-29 to 1946-02-01).
   Wikidata is CC0. The answers are cached in polity-names-wikidata.json beside this script (committed, so a rebuild is reproducible offline); `--fetch` refreshes the cache through
   query.wikidata.org (wbgetentities answers 429 from this sandbox's shared address, as build-gazetteer.js notes) and never runs in CI.

   WHAT IT DECIDES. Nothing by itself: the overrides are polity-names.json, written by a person from this report. `--check` verifies that every override's evidence is in the cache with dates
   that cover its years, that its entity exists with a span that contains them, and that no two overrides of one entity overlap. `--report` prints the disagreement list.
   WHAT IT FOUND (2026-10-13): of 165 entities with a QID, 102 agree, 63 do not; no item carries a dated name statement (23 statements in all, none with a date); two disagreements
   have a dated label that contradicts the Cliopatria name for part of the span (Hungary 1920–43, Austria 1934–37) and are overridden; the rest are reported in docs/atlas-v2-design.md. */
"use strict";
const fs = require("fs"), path = require("path");
const F = require("./lib/format.js");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..");
const CACHE = path.join(HERE, "polity-names-wikidata.json"), SPEC = path.join(HERE, "polity-names.json");
const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^the /, "").replace(/[^a-z0-9]+/g, " ").trim();
const header = () => F.read(fs.readFileSync(path.join(ROOT, "atlas", "data", "history.bin"))).header;

async function sparql(q) {
  for (let a = 0; a < 5; a++) {
    const r = await fetch("https://query.wikidata.org/sparql?format=json", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/sparql-results+json", "User-Agent": "FolioAtlasBuild/1.0 (https://folio.study; audit of display names)" }, body: "query=" + encodeURIComponent(q) });
    if (r.ok) return (await r.json()).results.bindings;
    await new Promise((s) => setTimeout(s, 4000 * (a + 1)));
  }
  throw new Error("query.wikidata.org did not answer");
}
const iso = (v) => (v ? String(v).replace(/^http.*$/, "").slice(0, 10) : null);   // a "somevalue" date comes back as a URL: no date
async function fetchCache() {
  const H = header(), ents = H.entities.filter((e) => e.qid), qids = [...new Set(ents.map((e) => e.qid))];
  const labels = {}, statements = {};
  for (let i = 0; i < qids.length; i += 40) {
    const vals = qids.slice(i, i + 40).map((x) => "wd:" + x).join(" ");
    const rows = await sparql(`SELECT ?item ?prop ?val ?start ?end ?pit WHERE { VALUES ?item { ${vals} }
      { ?item rdfs:label ?val . FILTER(lang(?val)="en") BIND("label" AS ?prop) }
      ${["P1448", "P2561", "P1813"].map((p) => `UNION { ?item p:${p} ?st . ?st ps:${p} ?val . FILTER(lang(?val)="en") OPTIONAL{?st pq:P580 ?start} OPTIONAL{?st pq:P582 ?end} OPTIONAL{?st pq:P585 ?pit} BIND("${p}" AS ?prop) }`).join("\n      ")} }`);
    for (const b of rows) { const id = b.item.value.split("/").pop(); if (b.prop.value === "label") labels[id] = b.val.value; else (statements[id] = statements[id] || []).push({ prop: b.prop.value, val: b.val.value, start: iso(b.start && b.start.value), end: iso(b.end && b.end.value), pit: iso(b.pit && b.pit.value) }); }
  }
  const spec = JSON.parse(fs.readFileSync(SPEC, "utf8"));
  const names = [...new Set(ents.filter((e) => norm(labels[e.qid] || "") !== norm(e.name)).flatMap((e) => [e.name, ...(e.sourceNames || [])]).concat(spec.overrides.map((o) => o.item)))];
  const datedItems = {};
  for (let i = 0; i < names.length; i += 25) {
    const vals = names.slice(i, i + 25).map((n) => JSON.stringify(n) + "@en").join(" ");
    const rows = await sparql(`SELECT ?l ?item ?inc ?dis WHERE { VALUES ?l { ${vals} } ?item rdfs:label ?l . ?item wdt:P571 ?inc . FILTER(?inc < "1950-01-01"^^xsd:dateTime) OPTIONAL{?item wdt:P576 ?dis} }`);
    for (const r of rows) (datedItems[r.l.value] = datedItems[r.l.value] || []).push({ item: r.item.value.split("/").pop(), inc: iso(r.inc.value), dis: iso(r.dis && r.dis.value) });
  }
  fs.writeFileSync(CACHE, JSON.stringify({ retrieved: new Date().toISOString().slice(0, 10), source: "query.wikidata.org (Wikidata, CC0): English labels, official-name / name / short-name statements with their date qualifiers, and items whose label is a Cliopatria name or an override's, inception before 1950", labels, statements, datedItems }, null, 1) + "\n");
  console.log("cache written:", qids.length, "items,", Object.keys(datedItems).length, "names");
}
function disagreements(H, C) {
  return H.entities.filter((e) => e.qid && norm(C.labels[e.qid] || "") !== norm(e.name)).map((e) => ({ id: e.id, name: e.name, span: e.span, qid: e.qid, label: C.labels[e.qid] || "(no English label)", dated: (C.statements[e.qid] || []).filter((s) => s.start || s.end || s.pit) }));
}
function check() {
  const H = header(), C = JSON.parse(fs.readFileSync(CACHE, "utf8")), spec = JSON.parse(fs.readFileSync(SPEC, "utf8")), bad = [];
  const byId = new Map(H.entities.map((e) => [e.id, e]));
  const mid = (y) => String(y).padStart(4, "0") + "-07-01";   // a year is shown by its middle: the item must be in force on 1 July of the first and of the last year shown
  for (const o of spec.overrides) {
    const e = byId.get(o.id); if (!e) { bad.push(o.id + ": no such entity"); continue; }
    if (o.from > o.to || o.from < e.span[0] || o.to > e.span[1]) bad.push(`${o.id}: ${o.from}–${o.to} is outside the entity's span ${e.span.join("–")}`);
    const it = (C.datedItems[o.item] || []).find((x) => x.item === o.qid);
    if (!it) bad.push(`${o.id}: the cache has no dated item ${o.qid} labelled "${o.item}"`);
    else if (!it.inc || !it.dis || it.inc > mid(o.from) || it.dis < mid(o.to)) bad.push(`${o.id}: ${o.qid} is dated ${it.inc}..${it.dis}, which does not cover 1 July of ${o.from} to 1 July of ${o.to}`);
    if (o.name !== o.item) bad.push(`${o.id}: the displayed name must be the item's label`);
  }
  for (const a of spec.overrides) for (const b of spec.overrides) if (a !== b && a.id === b.id && a.from <= b.to && b.from <= a.to) bad.push(a.id + ": two overrides overlap");
  if (bad.length) { console.error("audit-polity-names --check FAILED\n  " + bad.join("\n  ")); process.exit(1); }
  console.log(`audit-polity-names --check ok: ${spec.overrides.length} overrides, every one a dated Wikidata item covering its years`);
}
function report() {
  const H = header(), C = JSON.parse(fs.readFileSync(CACHE, "utf8")), withQid = H.entities.filter((e) => e.qid), dis = disagreements(H, C);
  console.log(`${withQid.length} entities with a QID; ${withQid.length - dis.length} agree with the Wikidata label; ${dis.length} do not; dated name statements on any of them: ${dis.reduce((n, d) => n + d.dated.length, 0)}`);
  const spec = JSON.parse(fs.readFileSync(SPEC, "utf8")), ov = new Set(spec.overrides.map((o) => o.id));
  for (const d of dis) console.log(`${ov.has(d.id) ? "OVERRIDDEN " : "           "}${d.id}  "${d.name}" ${d.span.join("–")}  ${d.qid} = "${d.label}"`);
}
if (process.argv.includes("--fetch")) fetchCache().catch((e) => { console.error(e); process.exit(1); });
else if (process.argv.includes("--check")) check();
else report();
