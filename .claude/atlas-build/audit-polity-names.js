#!/usr/bin/env node
/* audit-polity-names.js — do the names Cliopatria gave the polities of history.bin agree with Wikidata? (Atlas v2 Phase 4, task 0c)

     node .claude/atlas-build/audit-polity-names.js [--fetch] [--fetch-qids] [--report] [--check] [--qid-table [--check]]

   WHAT IT DOES. Every polity entity of atlas/data/history.bin carries the Wikidata item (`qid`) its card-linked series was matched to. For each, the English LABEL of that item is
   compared with the entity's name (folded: case, accents, a leading "the", punctuation). A disagreement is then looked at against what Wikidata can say about the SPAN:
     · a DATED NAME STATEMENT on the item (official name P1448, name P2561, short name P1813, each with start time P580, end time P582 or point in time P585), and
     · a DATED LABEL — another item whose English label is the name and whose inception P571 and dissolution P576 cover the years (Q600018 "Kingdom of Hungary", 1920-02-29 to 1946-02-01).
   Wikidata is CC0. The answers are cached in polity-names-wikidata.json beside this script (committed, so a rebuild is reproducible offline); `--fetch` refreshes the cache through
   query.wikidata.org (wbgetentities answers 429 from this sandbox's shared address, as build-gazetteer.js notes) and never runs in CI.

   WHAT IT DECIDES. Nothing by itself: the overrides are polity-names.json, written by a person from this report. `--check` verifies that every override's evidence is in the cache with dates
   that cover its years, that its entity exists with a span that contains them, and that no two overrides of one entity overlap. `--report` prints the disagreement list.
   WHAT IT FOUND (2026-10-13): of 165 entities with a QID, 102 agree, 63 do not; no item carries a dated name statement (23 statements in all, none with a date); two disagreements
   have a dated label that contradicts the Cliopatria name for part of the span (Hungary 1920–43, Austria 1934–37) and are overridden; the rest are reported in docs/atlas-v2-design.md.

   THE QID AUDIT (2026-10-13; docs/atlas-v2-polity-qids.md). The same 63 disagreements hid 29 entities whose Wikidata item is a DIFFERENT THING (Rome -> the 1798 Roman Republic, Han dynasty -> Chauhan, Numidia -> the man
   Jugurtha), because Cliopatria's own `Wikidata` field is wrong on those rows. polity-qids.json holds the corrections (`fixes`, applied by build-history.js at the row), the polities the check below lets through
   with a reason (`allow`) and the ones that pass but are open to question (`doubtful`). polity-qids-wikidata.json caches Wikidata's label, description, class, dates and English sitelink of every item involved
   (`--fetch-qids`, network, never in CI). `--check` also fails when, for any entity of history.bin that carries a QID:
     · DATES  — the item's inception/start and dissolution/end (P571, P580, P1319 / P576, P582, P1326) do not reach 1 July of any year of the entity's span (the convention of the name overrides above); an item with
                no dates cannot fail this rule;
     · CLASS  — the item is not a polity: none of its classes (P31, through P279*) is a historical country, country, state, political territorial entity, polity, kingdom, empire or city-state; for an entity of kind `people`
                an ethnic group, a people or a historical region also passes. (A war, a person, a city, a party, a disambiguation page, a history article all fail.)
   unless polity-qids.json `allow`s it with the rules that fire and a reason; an `allow` that no longer fires is itself a failure. It also proves every fix: the new item's English sitelink is the title written, a
   `title` fix keeps Cliopatria's own title, and history.bin carries the new pair (not the old) — so the check stays red until history.bin is rebuilt (build-history.js --install). `--qid-table` writes the table. */
"use strict";
const fs = require("fs"), path = require("path");
const F = require("./lib/format.js");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..");
const CACHE = path.join(HERE, "polity-names-wikidata.json"), SPEC = path.join(HERE, "polity-names.json");
const QSPEC = path.join(HERE, "polity-qids.json"), QCACHE = path.join(HERE, "polity-qids-wikidata.json"), QDOC = path.join(ROOT, "docs", "atlas-v2-polity-qids.md");
/* Q3024240 historical country, Q6256 country, Q7275 state, Q1048835 political territorial entity, Q1063239 polity, Q417175 kingdom, Q48349 empire, Q133442 city-state; a people: Q41710 ethnic group, Q2472587 people, Q1620908 historical region */
const STATE_CLASSES = ["Q3024240", "Q6256", "Q7275", "Q1048835", "Q1063239", "Q417175", "Q48349", "Q133442"], PEOPLE_CLASSES = ["Q41710", "Q2472587", "Q1620908"];
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
/* the label of an item: the names cache (the QIDs history.bin carried on 2026-10-13) or, for an item a QID fix brought in, the QID audit's cache */
const labelOf = (C, q) => C.labels[q] || ((fs.existsSync(QCACHE) ? JSON.parse(fs.readFileSync(QCACHE, "utf8")).items : {})[q] || {}).label || "";
function disagreements(H, C) {
  return H.entities.filter((e) => e.qid && norm(labelOf(C, e.qid)) !== norm(e.name)).map((e) => ({ id: e.id, name: e.name, span: e.span, qid: e.qid, label: labelOf(C, e.qid) || "(no English label)", dated: (C.statements[e.qid] || []).filter((s) => s.start || s.end || s.pit) }));
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
  const nq = qidCheck(H, bad);
  if (bad.length) { console.error("audit-polity-names --check FAILED\n  " + bad.join("\n  ")); process.exit(1); }
  console.log(`audit-polity-names --check ok: ${spec.overrides.length} overrides, every one a dated Wikidata item covering its years; ${nq} polities' Wikidata items pass the dates and class rules (${qspec().allow.length} allowed with a reason, ${qspec().fixes.length} fixes proven)`);
}
function report() {
  const H = header(), C = JSON.parse(fs.readFileSync(CACHE, "utf8")), withQid = H.entities.filter((e) => e.qid), dis = disagreements(H, C);
  console.log(`${withQid.length} entities with a QID; ${withQid.length - dis.length} agree with the Wikidata label; ${dis.length} do not; dated name statements on any of them: ${dis.reduce((n, d) => n + d.dated.length, 0)}`);
  const spec = JSON.parse(fs.readFileSync(SPEC, "utf8")), ov = new Set(spec.overrides.map((o) => o.id));
  const QS = qspec(), QC = JSON.parse(fs.readFileSync(QCACHE, "utf8")), fixed = new Set(QS.fixes.map((x) => x.series)), allowed = new Map(QS.allow.map((a) => [a.id, a])), doubt = new Set(QS.doubtful.map((d) => d.id));
  for (const d of dis) console.log(`${ov.has(d.id) ? "OVERRIDDEN " : "           "}${fixed.has(d.id.slice(4)) ? "QID-FIXED " : allowed.has(d.id) ? "QID-ALLOWED " : doubt.has(d.id) ? "DOUBTFUL " : ""}${d.id}  "${d.name}" ${d.span.join("–")}  ${d.qid} = "${d.label}"`);
  const rules = withQid.filter((e) => QC.items[e.qid] && (e.kind === "polity" || e.kind === "people")).map((e) => [e, firing(e, QC.items[e.qid])]).filter(([, f]) => f.size);
  console.log(`QID audit: ${fixed.size} polities corrected (${QS.fixes.length} pairs), ${QS.allow.length} allowed with a reason (${QS.allow.filter((a) => /^UNRESOLVED/.test(a.reason)).length} unresolved), ${QS.doubtful.length} doubtful; the dates/class rules fire on ${rules.length} of ${withQid.length} now: ${rules.map(([e, f]) => e.id.slice(4) + " [" + [...f] + "]").join(", ") || "none"}`);
}

/* ---- the QID audit ---- */
const qspec = () => JSON.parse(fs.readFileSync(QSPEC, "utf8"));
const frac = (iso) => { const m = /^(-?)(\d+)-(\d\d)-(\d\d)/.exec(iso || ""); return m ? (m[1] ? -1 : 1) * Number(m[2]) + ((Number(m[3]) || 1) - 1) / 12 + ((Number(m[4]) || 1) - 1) / 372 : null; };   // Wikidata's years are astronomical (509 BCE is -0508); the span's are Cliopatria's and differ by at most a year before the common era, which the rule does not resolve
const dateIv = (it) => { const s = (it.start || []).map(frac).filter((x) => x != null), e = (it.end || []).map(frac).filter((x) => x != null); return { s: s.length ? Math.min(...s) : null, e: e.length ? Math.max(...e) : null }; };
const fmtY = (y) => (y == null ? "?" : y < 0 ? Math.abs(y) + " BCE" : y + " CE");
const fmtW = (a) => (a == null ? "?" : a <= 0 ? Math.floor(1 - a) + " BCE" : Math.floor(a) + " CE");   // a Wikidata (astronomical) year
const ivText = (it) => { const v = dateIv(it); return v.s == null && v.e == null ? "no dates" : `${v.s == null ? "…" : fmtW(v.s)} – ${v.e == null ? "…" : fmtW(v.e)}`; };
/* the rules that fire for an item against an entity: "dates" and/or "class" */
function firing(e, it) {
  const f = new Set(), v = dateIv(it), mid = (y) => y + 0.5;   // a year is shown by its middle: the item must be in force on 1 July of some year of the span
  if ((v.s != null && v.s > mid(e.span[1])) || (v.e != null && v.e < mid(e.span[0]))) f.add("dates");
  if (!(it.state || (e.kind === "people" && it.people))) f.add("class");
  return f;
}
async function fetchQids() {
  const H = header(), QS = qspec(), qids = new Set();
  for (const e of H.entities) { if (e.qid) qids.add(e.qid); for (const a of e.alsoWiki || []) if (a.qid) qids.add(a.qid); }
  for (const f of QS.fixes) { qids.add(f.from.qid); qids.add(f.to.qid); }
  for (const a of QS.allow.concat(QS.doubtful)) { qids.add(a.qid); for (const c of a.candidates || []) qids.add(c); }
  const Q = [...qids].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))), items = {};
  for (const q of Q) items[q] = { label: null, desc: null, enwiki: null, classes: [], start: [], end: [], state: false, people: false };
  const dt = (v) => (/^http/.test(v) ? null : String(v).split("T")[0]);   // a "somevalue" date comes back as a URL: no date
  for (let i = 0; i < Q.length; i += 25) {
    const vals = Q.slice(i, i + 25).map((x) => "wd:" + x).join(" ");
    const rows = await sparql(`SELECT ?item ?prop ?val WHERE { VALUES ?item { ${vals} }
      { ?item rdfs:label ?val . FILTER(lang(?val)="en") BIND("label" AS ?prop) }
      UNION { ?item schema:description ?val . FILTER(lang(?val)="en") BIND("desc" AS ?prop) }
      UNION { ?item wdt:P31 ?c . ?c rdfs:label ?val . FILTER(lang(?val)="en") BIND("class" AS ?prop) }
      ${["P571", "P580", "P1319"].map((p) => `UNION { ?item wdt:${p} ?val BIND("start" AS ?prop) }`).join("\n      ")}
      ${["P576", "P582", "P1326"].map((p) => `UNION { ?item wdt:${p} ?val BIND("end" AS ?prop) }`).join("\n      ")}
      UNION { ?s schema:about ?item; schema:isPartOf <https://en.wikipedia.org/>; schema:name ?val BIND("enwiki" AS ?prop) } }`);
    for (const b of rows) {
      const it = items[b.item.value.split("/").pop()], p = b.prop.value, v = b.val.value;
      if (p === "label") it.label = v; else if (p === "desc") it.desc = v; else if (p === "enwiki") it.enwiki = v;
      else if (p === "class") { if (!it.classes.includes(v)) it.classes.push(v); }
      else { const d = dt(v); if (d && !it[p].includes(d)) it[p].push(d); }
    }
  }
  for (const [flag, cls] of [["state", STATE_CLASSES], ["people", PEOPLE_CLASSES]]) {
    for (let i = 0; i < Q.length; i += 40) {
      const rows = await sparql(`SELECT DISTINCT ?item WHERE { VALUES ?item { ${Q.slice(i, i + 40).map((x) => "wd:" + x).join(" ")} } ?item wdt:P31/wdt:P279* ?c . VALUES ?c { ${cls.map((x) => "wd:" + x).join(" ")} } }`);
      for (const b of rows) items[b.item.value.split("/").pop()][flag] = true;
    }
  }
  for (const it of Object.values(items)) { it.classes.sort(); it.start.sort(); it.end.sort(); }
  fs.writeFileSync(QCACHE, JSON.stringify({ retrieved: new Date().toISOString().slice(0, 10), source: "query.wikidata.org (Wikidata, CC0): for every item a polity of history.bin points at (or pointed at, or could point at): English label and description, direct classes (P31), inception/start and dissolution/end dates, the English Wikipedia sitelink, and whether a class of P31/P279* is one of the polity classes (state) or the people classes (people) named in audit-polity-names.js", state_classes: STATE_CLASSES, people_classes: PEOPLE_CLASSES, items }, null, 1) + "\n");
  console.log("qid cache written:", Q.length, "items");
}
function qidCheck(H, bad) {
  const QS = qspec(), QC = JSON.parse(fs.readFileSync(QCACHE, "utf8")), byId = new Map(H.entities.map((e) => [e.id, e])), allow = new Map();
  for (const a of QS.allow) { if (allow.has(a.id)) bad.push(a.id + ": two allow entries"); allow.set(a.id, a); if (!a.reason || a.reason.length < 40) bad.push(`${a.id}: an allow entry needs a reason`); }
  let nChecked = 0;
  for (const e of H.entities) {
    if (!e.qid || (e.kind !== "polity" && e.kind !== "people")) continue;
    nChecked++;
    const it = QC.items[e.qid]; if (!it) { bad.push(`${e.id}: ${e.qid} is not in polity-qids-wikidata.json (run --fetch-qids)`); continue; }
    const f = firing(e, it), a = allow.get(e.id);
    if (a && a.qid !== e.qid) { bad.push(`${e.id}: the allow entry is for ${a.qid} but the polity now carries ${e.qid}`); continue; }
    if (a) { const want = [...(a.rules || [])].sort().join(","), got = [...f].sort().join(","); if (want !== got) bad.push(`${e.id}: allowed for [${want}] but ${got ? "[" + got + "] fires" : "no rule fires any more (remove the entry)"}`); }
    else if (f.size) bad.push(`${e.id} "${e.name}" ${e.span.join("–")}: ${e.qid} "${it.label}" (${it.desc || "no description"}) fails ${[...f].map((r) => r === "dates" ? "DATES (" + ivText(it) + " against the span)" : "CLASS (" + (it.classes.join(", ") || "no class") + ")").join(" and ")} — correct it in polity-qids.json fixes or allow it with a reason`);
  }
  for (const a of QS.allow) if (!byId.has(a.id) || !byId.get(a.id).qid) bad.push(`${a.id}: an allow entry for an entity without a QID`);
  for (const d of QS.doubtful) { const e = byId.get(d.id); if (!e || e.qid !== d.qid) bad.push(`${d.id}: the doubtful entry names ${d.qid} but the polity carries ${e && e.qid}`); if (!d.note) bad.push(`${d.id}: a doubtful entry needs a note`); }
  const seen = new Set();
  for (const x of QS.fixes) {
    const k = x.series + "|" + x.from.qid + "|" + x.from.wiki; if (seen.has(k)) bad.push(`${x.series}: two fixes for ${x.from.qid} "${x.from.wiki}"`); seen.add(k);
    const e = byId.get("pol:" + x.series), to = QC.items[x.to.qid], from = QC.items[x.from.qid];
    if (!e) { bad.push(`${x.series}: a fix for a series that is not in history.bin`); continue; }
    if (!to || to.enwiki !== x.to.wiki) bad.push(`${x.series}: ${x.to.qid} has the English sitelink "${to && to.enwiki}", not "${x.to.wiki}"`);
    if (!from) bad.push(`${x.series}: the cache has no facts for the replaced item ${x.from.qid}`);
    if (x.basis === "title" && norm(x.from.wiki) !== norm(x.to.wiki)) bad.push(`${x.series}: a title fix keeps Cliopatria's own title (${x.from.wiki} / ${x.to.wiki})`);
    if (!["title", "label"].includes(x.basis)) bad.push(`${x.series}: basis must be title or label`);
    if (x.basis === "label" && !(x.note && x.note.length > 60)) bad.push(`${x.series}: a label fix needs a note saying why this item and no other`);
    const carries = (e.qid === x.to.qid && e.wiki === x.to.wiki) || (e.alsoWiki || []).some((w) => w.qid === x.to.qid && w.wiki === x.to.wiki);
    const stale = (e.qid === x.from.qid && e.wiki === x.from.wiki) || (e.alsoWiki || []).some((w) => w.qid === x.from.qid && w.wiki === x.from.wiki);
    if (stale || !carries) bad.push(`${x.series}: history.bin still carries ${stale ? "the replaced pair " + x.from.qid + " \"" + x.from.wiki + "\"" : "no " + x.to.qid + " \"" + x.to.wiki + "\""} — rebuild it (build-history.js --install)`);
  }
  return nChecked;
}
function qidTable() {
  const H = header(), QS = qspec(), QC = JSON.parse(fs.readFileSync(QCACHE, "utf8")), byId = new Map(H.entities.map((e) => [e.id, e])), I = (q) => QC.items[q] || {};
  const desc = (q) => { const it = I(q); return `**${q}** “${it.label}” — ${it.desc || "no description"}; ${(it.classes || []).join(", ") || "no class"}; ${ivText(it)}`; };
  const span = (e) => `${fmtY(e.span[0])} – ${fmtY(e.span[1])}`, esc = (s) => String(s).replace(/\|/g, "\\|");
  const n = H.entities.filter((e) => e.qid && (e.kind === "polity" || e.kind === "people")).length;
  const L = [];
  L.push("# Atlas v2 — the polities that carried the wrong Wikidata item", "",
    "*Generated by `.claude/atlas-build/audit-polity-names.js --qid-table` from `polity-qids.json`, `polity-qids-wikidata.json` and `atlas/data/history.bin`; do not edit. Wikidata is CC0.*", "",
    "Where this comes from. Cliopatria names a Wikidata item and an English Wikipedia article on every row; `build-history.js` takes, for each series, the pair of the rows covering the most years. On some series that pair is a different thing from the polity (Han dynasty → Chauhan, a medieval Indian clan; Numidia → Jugurtha, a man). Phase 4's name audit found 63 of the 165 entities with a QID whose Wikidata label differs from their name, 102 agreeing; most of the 63 differ only in wording (“Venice” / “Republic of Venice”) and their item is right. This file is about the ones whose item is another thing.", "",
    "## Counts", "",
    `| | entities |`, `|---|---|`,
    `| carry a QID (polities ${H.entities.filter((e) => e.qid && e.kind === "polity").length}, peoples ${H.entities.filter((e) => e.qid && e.kind === "people").length}) | ${n} |`,
    `| **corrected** (wrong item, the right one unambiguous) | ${new Set(QS.fixes.filter((x) => x.basis).map((x) => x.series)).size} |`,
    `| **unresolved** (wrong item, no unambiguous replacement; allowed by the check with a reason) | ${QS.allow.filter((a) => /^UNRESOLVED/.test(a.reason)).length} |`,
    `| right item, let through by the check with a reason | ${QS.allow.filter((a) => !/^UNRESOLVED/.test(a.reason)).length} |`,
    `| doubtful, kept | ${QS.doubtful.length} |`,
    `| unchanged otherwise | ${n - new Set(QS.fixes.map((x) => x.series)).size - QS.allow.length - QS.doubtful.length} |`, "",
    `Besides the ${new Set(QS.fixes.map((x) => x.series)).size} series whose main pair was replaced, ${QS.fixes.filter((x) => { const e = byId.get("pol:" + x.series); return e && !(e.qid === x.to.qid && e.wiki === x.to.wiki); }).length} secondary pairs (“Also in the source” on the place card) were replaced. The check's two rules are in the header of \`audit-polity-names.js\`.`, "",
    "## A. Corrected", "",
    "| series | name | span | pointed at (was) | points at (now) | basis and evidence |", "|---|---|---|---|---|---|");
  for (const x of QS.fixes) {
    const e = byId.get("pol:" + x.series), was = I(x.from.qid), now = I(x.to.qid), main = e.qid === x.to.qid && e.wiki === x.to.wiki, f0 = firing(e, was);
    const why = [];
    if (!main) why.push("*secondary pair*");
    if (x.basis === "title") why.push(`Cliopatria's own Wikipedia title “${x.from.wiki}” is the English sitelink of ${x.to.qid} and of no other item`);
    else why.push(x.note);
    if (main) why.push(`the old item ${[...f0].length ? "fails " + [...f0].join(" and ") : "passes both rules but is another thing: " + (was.desc || was.label)}`);
    L.push(`| \`${x.series}\` | ${esc(e.name)} | ${span(e)} | ${esc(desc(x.from.qid))}; Wikipedia “${esc(x.from.wiki)}” | ${esc(desc(x.to.qid))}; Wikipedia “${esc(x.to.wiki)}” | ${esc(why.join("; "))} |`);
  }
  L.push("", "## B. Unresolved, and right items the check lets through", "", "| series | name | span | points at | fires | reason | candidates |", "|---|---|---|---|---|---|---|");
  for (const a of QS.allow) { const e = byId.get(a.id); L.push(`| \`${a.id.slice(4)}\` | ${esc(e.name)} | ${span(e)} | ${esc(desc(a.qid))} | ${a.rules.join(", ")} | ${esc(a.reason)} | ${esc((a.candidates || []).map(desc).join("<br>") || "—")} |`); }
  L.push("", "## C. Doubtful, kept (both rules pass)", "", "| series | name | span | points at | note | other candidates |", "|---|---|---|---|---|---|");
  for (const d of QS.doubtful) { const e = byId.get(d.id); L.push(`| \`${d.id.slice(4)}\` | ${esc(e.name)} | ${span(e)} | ${esc(desc(d.qid))} | ${esc(d.note)} | ${esc((d.candidates || []).map(desc).join("<br>") || "—")} |`); }
  L.push("", "## Re-running", "", "`node .claude/atlas-build/audit-polity-names.js --check` (offline; CI) proves the rules and the fixes against the committed Wikidata cache and `history.bin`. `--fetch-qids` refreshes the cache (network). After editing `polity-qids.json`: `--fetch-qids` for a new item, then `node --max-old-space-size=12000 .claude/atlas-build/build-history.js --no-cache --install` (docs/atlas-v2-build.md step 3: fresh, because a cache replay is not byte-identical), then `build-polity-index.js --install`, `node .claude/migrate-places.js` (see `check-places.js` for place rows that now duplicate a polity), and this table (`--qid-table`).", "");
  return L.join("\n");
}
if (process.argv.includes("--fetch-qids")) fetchQids().catch((e) => { console.error(e); process.exit(1); });
else if (process.argv.includes("--qid-table")) {
  const body = qidTable();
  if (process.argv.includes("--check")) { const cur = fs.existsSync(QDOC) ? fs.readFileSync(QDOC, "utf8") : ""; if (cur !== body) { console.error("docs/atlas-v2-polity-qids.md lags: run audit-polity-names.js --qid-table"); process.exit(1); } console.log("audit-polity-names --qid-table --check ok"); }
  else { fs.writeFileSync(QDOC, body); console.log("wrote " + path.relative(ROOT, QDOC)); }
}
else if (process.argv.includes("--fetch")) fetchCache().catch((e) => { console.error(e); process.exit(1); });
else if (process.argv.includes("--check")) check();
else report();
