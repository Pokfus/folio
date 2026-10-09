/* lib/wikidata.js — the one way the Atlas build asks Wikidata anything (Phase 1c sitelinks, Phase 1d labels).

   query.wikidata.org/sparql answers a VALUES clause of 50 items in one call; the wbgetentities API answers
   429 to every call from a cloud session's shared address (measured 2026-10-09), so SPARQL it is. The
   service rate-limits too: a refused batch waits 10, 30, 60, 120, 120 s before trying again, and every
   answer is written into the cache file at once, so a run that dies keeps what arrived. Nothing here is
   ever written from memory: a title or a label is the service's answer or null (= asked, none).

     const W = require("./lib/wikidata.js");
     W.fetchMissing(cache, "titles", qids, W.sitelinkQuery)   // cache.titles[Q] = enwiki title | null
     W.fetchMissing(cache, "labels", qids, W.labelQuery)      // cache.labels[Q] = English label | null
*/
"use strict";
const fs = require("fs");
const { spawnSync } = require("child_process");
const UA = "folio-atlas-build/0.1 (https://folio.study) curl";

function sparql(q) {
  const r = spawnSync("curl", ["-sS", "-m", "90", "-A", UA, "-H", "Accept: application/sparql-results+json", "--data-urlencode", "query=" + q, "-w", "\n%{http_code}", "https://query.wikidata.org/sparql"], { encoding: "utf8", maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error("curl failed: " + r.stderr);
  const nl = r.stdout.lastIndexOf("\n"), code = r.stdout.slice(nl + 1).trim(), body = r.stdout.slice(0, nl);
  if (code !== "200") throw new Error("HTTP " + code + " (the query service rate-limits a shared address; the build backs off and retries)");
  let j; try { j = JSON.parse(body); } catch (e) { throw new Error("SPARQL did not answer JSON: " + body.slice(0, 120).replace(/\s+/g, " ")); }
  return j.results.bindings;
}
/* the enwiki sitelink of each item → { Q: "Title" } */
function sitelinkQuery(batch) {
  const q = "SELECT ?item ?article WHERE { VALUES ?item { " + batch.map((x) => "wd:" + x).join(" ") + " } ?article schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> . }";
  const out = {};
  for (const b of sparql(q)) { const qid = b.item.value.split("/").pop(); const title = decodeURIComponent(b.article.value.split("/wiki/")[1] || "").replace(/_/g, " "); if (title) out[qid] = title; }
  return out;
}
/* the English label (rdfs:label @en) of each item → { Q: "Label" } */
function labelQuery(batch) {
  const q = "SELECT ?item ?label WHERE { VALUES ?item { " + batch.map((x) => "wd:" + x).join(" ") + " } ?item rdfs:label ?label . FILTER(LANG(?label) = \"en\") }";
  const out = {};
  for (const b of sparql(q)) { const qid = b.item.value.split("/").pop(); if (b.label && b.label.value) out[qid] = b.label.value; }
  return out;
}
/* ask for every qid not yet under cache[field] (all of them with refetch), 50 a call, writing the cache file after each */
function fetchMissing(cache, field, qids, query, file, opts) {
  opts = opts || {};
  cache[field] = cache[field] || {};
  const missing = qids.filter((q) => opts.refetch || !(q in cache[field]));
  if (!missing.length) return 0;
  const log = opts.log || console.log;
  log(`Wikidata ${field}: ${missing.length} of ${qids.length} items not in the cache — fetching in batches of 50…`);
  for (let i = 0; i < missing.length; i += 50) {
    const batch = missing.slice(i, i + 50);
    let got = null;
    for (let attempt = 0; attempt < 5 && !got; attempt++) {
      try { got = query(batch); } catch (e) { const wait = [10, 30, 60, 120, 120][attempt]; log("  batch " + (i / 50) + " refused (" + e.message.slice(0, 90) + "), waiting " + wait + " s"); spawnSync("sleep", [String(wait)]); }
    }
    if (!got) throw new Error("Wikidata did not answer; re-run later (the cache keeps what arrived)");
    for (const q of batch) cache[field][q] = got[q] || null;
    cache.retrieved = new Date().toISOString().slice(0, 10);
    if (file) fs.writeFileSync(file, JSON.stringify(cache, null, 1) + "\n");
    process.stdout.write(`  ${Math.min(i + 50, missing.length)}/${missing.length}\r`);
    spawnSync("sleep", ["2.5"]);
  }
  log("");
  return missing.length;
}
module.exports = { sparql, sitelinkQuery, labelQuery, fetchMissing };
