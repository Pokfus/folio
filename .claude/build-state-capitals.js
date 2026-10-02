#!/usr/bin/env node
/* build-state-capitals.js — each historical state's CAPITALS, year by year, for the atlas.

     NODE_USE_ENV_PROXY=1 node .claude/build-state-capitals.js [--dry]

   WHAT IT IS FOR (Oct 2026, on request: "historical capitals … make sure that Historical capitals are year
   specific and not state specific, since historical states sometimes move capitals"). A state drawn on the
   atlas (a card whose first tag is state / dynasty / empire, with a region locator) gets its capital as a
   square, in the years that city WAS its capital: Kyiv under the Rus', Medina then Kufa under the Rashidun,
   Söğüt, Bursa, Edirne and Constantinople in turn under the Ottomans.

   THE SOURCE IS WIKIDATA (CC0): each state's `capital` (P36) statements, with their `start time` (P580),
   `end time` (P582) or `point in time` (P585) qualifiers, and each capital's coordinate (P625). The state
   is the Wikidata item of a NAMED Wikipedia article (`.claude/state-capitals-spec.json`), not Cliopatria's
   QID, which is shared between unrelated polities in several places (Song state / Song dynasty, Qin /
   Former Qin).

   THE YEAR RULE — what makes it year-specific rather than state-specific, and honest where the data is thin:
     · A DATED statement holds from its start to its end. With a start and no end it holds until the next
       dated statement of the same state starts, or until the state is no longer drawn. A point in time is
       read as a start.
     · Where a state has dated statements, its UNDATED ones are ignored — except one of PREFERRED rank, which
       fills the years no dated statement covers (`fill`).
     · Where a state has NO dated statement, an undated capital is used only if it is the only one (after
       merging two items within 5 km — Patna and Pataliputra are one place). Several undated capitals
       (the Achaemenids' Babylon, Susa, Persepolis, Pasargadae and Ecbatana) say nothing about WHICH was the
       capital in a given year, so none is drawn: silence rather than a guess.
     · Two dated capitals in force in one year (the Qing's Beijing and Mukden) are both drawn.
     · A capital with no coordinate is not drawn, and does not unlock an undated rival.

   OUTPUT: `state-capitals.js` (lazy, `DATA_BUNDLES.statecaps` in app.js):
     window.STATE_CAPITALS = { "<card id>": [[from|null, to|null, name, lon, lat, fill?], …], … };

   Zero dependencies. Not part of the site. */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const SPEC = path.join(__dirname, "state-capitals-spec.json");
const OUT = path.join(ROOT, "state-capitals.js");
const DRY = process.argv.includes("--dry");
const UA = { "User-Agent": "folio-dev-script/1.0 (atlas state capitals)" };
const die = (m) => { console.error("ERROR: " + m); process.exit(1); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const spec = JSON.parse(fs.readFileSync(SPEC, "utf8"));
const { loadCards } = require("./card-io.js");
const { cards } = loadCards();
const byId = new Map(cards.map((c) => [c.id, c]));
const STATE = new Set(["state", "dynasty", "empire"]);
for (const id of Object.keys(spec.cards)) {
  const c = byId.get(id);
  if (!c) die("the spec names " + id + ", which is not a card");
  if (!STATE.has(String((c.tags || [])[0] || ""))) console.warn("  note: " + id + " is not tagged a state, so the atlas draws no extent for its capitals to sit in");
}

async function getJSON(url, init) {
  for (let a = 0; a < 6; a++) {
    const r = await fetch(url, init || { headers: UA });
    const tx = await r.text();
    try { return JSON.parse(tx); } catch (e) { console.warn("  retry " + (a + 1) + ": " + tx.slice(0, 60).replace(/\s+/g, " ")); await sleep(15000 * (a + 1)); }
  }
  die("gave up on " + url.slice(0, 120));
}
/* a Wikidata time value ("-0311-01-01T00:00:00Z", or a URL for "unknown value") → a signed year in Folio's
   reckoning. THE QUERY SERVICE COUNTS YEARS ASTRONOMICALLY — XSD 1.1, where year 0 is 1 BCE — so "-0026" is
   27 BCE (Augustus) and "-0585" is 586 BCE (Jerusalem); Folio's −27 is 27 BCE, with no year 0. */
function year(t) {
  if (!t || !/^[+-]?\d{1,6}-/.test(t)) return null;
  const m = t.match(/^([+-]?)(\d+)-/), n = Number(m[2]);
  return m[1] === "-" || n === 0 ? -(n + 1) : n;
}
function km(a, b) { const dx = (a[0] - b[0]) * Math.cos((a[1] + b[1]) / 2 * Math.PI / 180), dy = a[1] - b[1]; return Math.hypot(dx, dy) * 111; }

(async () => {
  // 1. the named articles → their Wikidata items
  const titles = [...new Set(Object.values(spec.cards).flat())];
  const qid = {};
  for (let i = 0; i < titles.length; i += 40) {
    const batch = titles.slice(i, i + 40);
    const j = await getJSON("https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&redirects=1&format=json&titles=" + encodeURIComponent(batch.join("|")));
    const to = new Map(batch.map((t) => [t, t]));
    for (const k of ["normalized", "redirects"]) (j.query[k] || []).forEach((n) => { for (const [t, v] of to) if (v === n.from) to.set(t, n.to); });
    const pages = Object.values(j.query.pages);
    for (const t of batch) { const p = pages.find((x) => x.title === to.get(t)); if (p && p.pageprops) qid[t] = p.pageprops.wikibase_item; else console.warn("  no Wikidata item for the article " + JSON.stringify(t)); }
    await sleep(1000);
  }
  // 2. every capital statement of those items
  const qs = [...new Set(Object.values(qid))];
  const sparql = `SELECT ?state ?st ?cap ?capLabel ?coord ?start ?end ?pit ?rank WHERE {
    VALUES ?state { ${qs.map((x) => "wd:" + x).join(" ")} }
    ?state p:P36 ?st . ?st ps:P36 ?cap . ?st wikibase:rank ?rank . FILTER(?rank != wikibase:DeprecatedRank)
    OPTIONAL { ?st pq:P580 ?start } OPTIONAL { ?st pq:P582 ?end } OPTIONAL { ?st pq:P585 ?pit }
    OPTIONAL { ?cap wdt:P625 ?coord }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }`;
  const res = await getJSON("https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(sparql), { headers: Object.assign({ Accept: "application/sparql-results+json" }, UA) });
  const rows = res.results.bindings.map((b) => {
    const pt = b.coord && b.coord.value.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
    return {
      state: b.state.value.split("/").pop(), st: b.st.value, cap: b.cap.value.split("/").pop(), label: b.capLabel.value,
      at: pt ? [Math.round(Number(pt[1]) * 1e4) / 1e4, Math.round(Number(pt[2]) * 1e4) / 1e4] : null,
      from: year(b.start && b.start.value) != null ? year(b.start.value) : year(b.pit && b.pit.value), to: year(b.end && b.end.value),
      pref: /PreferredRank$/.test(b.rank.value),
    };
  });
  // one row per statement (OPTIONALs can repeat a statement)
  const seenSt = new Set(), stmts = rows.filter((r) => { const k = r.st + "|" + r.from + "|" + r.to; if (seenSt.has(k)) return false; seenSt.add(k); return true; });
  const drop = new Set(spec.drop || []), label = spec.label || {};
  // 3. the year rule, per state item
  function capitalsOf(q) {
    const all = stmts.filter((r) => r.state === q && !drop.has(r.cap));
    const dated = all.filter((r) => r.from != null || r.to != null);
    const undated = all.filter((r) => r.from == null && r.to == null);
    const name = (r) => label[r.cap] || r.label;
    // merge undated items within 5 km of each other (one place under two items), the preferred one's name kept
    const places = [];
    for (const r of undated) {
      const p = places.find((x) => x.cap === r.cap || (x.at && r.at && km(x.at, r.at) < 5));
      if (!p) { places.push(Object.assign({}, r)); continue; }
      if (r.pref && !p.pref) Object.assign(p, r, { at: r.at || p.at });
      else if (!p.at && r.at) p.at = r.at;
    }
    const out = [];
    if (dated.length) {
      const starts = dated.map((r) => r.from).filter((y) => y != null).sort((a, b) => a - b);
      for (const r of dated) {
        if (!r.at) continue;
        let to = r.to;
        if (to == null && r.from != null) { const nx = starts.find((y) => y > r.from); if (nx != null) to = nx - 1; }
        out.push([r.from, to, name(r), r.at[0], r.at[1]]);
      }
      const pref = places.filter((p) => p.pref && p.at);
      if (pref.length === 1) out.push([null, null, name(pref[0]), pref[0].at[0], pref[0].at[1], 1]);
    } else if (places.length === 1 || places.filter((p) => p.pref).length === 1) {
      const p = places.length === 1 ? places[0] : places.find((x) => x.pref);
      if (p.at) out.push([null, null, name(p), p.at[0], p.at[1]]);
    }
    // the same city twice in one span (two items, or a label override) is one entry
    return out.filter((e, i) => !out.slice(0, i).some((f) => f[0] === e[0] && f[1] === e[1] && f[2] === e[2]));
  }
  const result = {}, report = [];
  for (const id of Object.keys(spec.cards).sort()) {
    const list = [];
    for (const t of spec.cards[id]) { const q = qid[t]; if (q) capitalsOf(q).forEach((e) => list.push(e)); }
    list.sort((a, b) => (a[0] == null ? -Infinity : a[0]) - (b[0] == null ? -Infinity : b[0]));
    if (list.length) result[id] = list;
    report.push(id.padEnd(9) + (list.length ? list.map((e) => e[2] + (e[0] != null || e[1] != null ? " " + (e[0] == null ? "…" : e[0]) + "–" + (e[1] == null ? "…" : e[1]) : "") + (e[5] ? " (fills gaps)" : "")).join(", ") : "— none (no capital, several undated, or no coordinate)"));
  }
  console.log(report.join("\n"));
  const n = Object.keys(result).length;
  console.log("\n" + n + " of " + Object.keys(spec.cards).length + " state cards have a capital");
  const head = `/* state-capitals.js — GENERATED by .claude/build-state-capitals.js from .claude/state-capitals-spec.json. Do not edit.
   Each historical state's capitals, year by year: [from, to, name, lon, lat, fill?] — null for an open end;
   \`fill\` marks an undated capital of preferred rank, drawn only in years no dated one covers. See the builder
   for the rule that keeps this year-specific and silent where the source is.
   SOURCE: Wikidata (CC0, https://creativecommons.org/publicdomain/zero/1.0/) — each state's P36 statements with
   their P580 / P582 / P585 qualifiers and each capital's P625. A few labels are replaced by the name a map prints
   (the spec's \`label\`). */
`;
  const body = head + "window.STATE_CAPITALS = {\n" + Object.keys(result).map((k) => "  " + JSON.stringify(k) + ": " + JSON.stringify(result[k])).join(",\n") + "\n};\n";
  if (DRY) { console.log("dry run — nothing written"); return; }
  fs.writeFileSync(OUT, body);
  console.log("wrote " + path.relative(ROOT, OUT) + " (" + (body.length / 1024).toFixed(1) + " KB)");
})();
