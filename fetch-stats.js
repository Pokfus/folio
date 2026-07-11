#!/usr/bin/env node
/* ============================================================================
   fetch-stats.js  — present-day country statistics for the Atlas click popup.

   Pulls Population (P1082), Area (P2046), nominal GDP (P2131) and nominal GDP
   per capita (P2132) from Wikidata for every present-day country, matched to
   world.js by ISO-3166 alpha-2 code, and writes country-stats.js
   (window.COUNTRY_STATS, keyed by lowercased country name). The popup shows
   these only at the present year; historical years / missing values show a dash.

   RUN:  node fetch-stats.js     (from the Folio site folder, Node 18+)
   Load the result by adding, before the app.js line in index.html:
       <script src="country-stats.js"></script>
   ============================================================================ */
const fs = require('fs');
const UA = 'FolioStudyAtlas/1.0 (personal study project; contact: you@example.com)';

global.window = {};
require('./world.js');
const GEO = window.WORLD_GEO || [];
const keyOf = (n) => String(n || '').trim().toLowerCase().replace(/\s+/g, ' ');
const isoToKey = {};
for (const g of GEO) if (g && g.i && g.n) { const k = g.i.toLowerCase(); if (!(k in isoToKey)) isoToKey[k] = keyOf(g.n); }   // first (major) entry wins — don't let a tiny dependency sharing an ISO (Clipperton vs France) steal the stats

const stripZero = (s) => s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
const fmtPop = (n) => { n = +n; if (!n) return null; if (n >= 1e9) return stripZero((n / 1e9).toFixed(2)) + ' billion'; if (n >= 1e6) return stripZero((n / 1e6).toFixed(2)) + ' million'; return Math.round(n).toLocaleString('en-US'); };
const fmtArea = (n) => { n = +n; if (!n) return null; if (n >= 1e6) return stripZero((n / 1e6).toFixed(2)) + 'M km²'; return Math.round(n).toLocaleString('en-US') + ' km²'; };
const fmtUSD = (n) => { n = +n; if (!n) return null; if (n >= 1e12) return '$' + stripZero((n / 1e12).toFixed(2)) + 'T'; if (n >= 1e9) return '$' + stripZero((n / 1e9).toFixed(2)) + 'B'; if (n >= 1e6) return '$' + stripZero((n / 1e6).toFixed(1)) + 'M'; return '$' + Math.round(n).toLocaleString('en-US'); };
const fmtPc = (n) => { n = +n; if (!n) return null; return '$' + Math.round(n).toLocaleString('en-US'); };

const QUERY = `SELECT ?iso ?pop ?area ?gdp ?gdppc WHERE {
  ?c wdt:P297 ?iso .
  OPTIONAL { ?c wdt:P1082 ?pop. }
  OPTIONAL { ?c wdt:P2046 ?area. }
  OPTIONAL { ?c wdt:P2131 ?gdp. }
  OPTIONAL { ?c wdt:P2132 ?gdppc. }
}`;

(async () => {
  const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(QUERY);
  let j;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' } });
    if (!r.ok) { console.error('SPARQL HTTP ' + r.status); process.exit(1); }
    j = await r.json();
  } catch (e) { console.error('SPARQL fetch error: ' + e.message); process.exit(1); }
  const rows = (j.results && j.results.bindings) || [];
  const acc = {};
  for (const row of rows) {
    const iso = ((row.iso && row.iso.value) || '').toLowerCase(); const key = isoToKey[iso]; if (!key) continue;
    const num = (b) => (b && b.value && isFinite(+b.value)) ? +b.value : null;
    const o = acc[key] || (acc[key] = {});
    const p = num(row.pop), a = num(row.area), g = num(row.gdp), gp = num(row.gdppc);   // keep the largest (≈ latest) of any multi-valued field
    if (p && (!o.pop || p > o.pop)) o.pop = p;
    if (a && (!o.area || a > o.area)) o.area = a;
    if (g && (!o.gdp || g > o.gdp)) o.gdp = g;
    if (gp && (!o.gdppc || gp > o.gdppc)) o.gdppc = gp;
  }
  const out = {};
  for (const k in acc) {
    const v = acc[k], e = {};
    const pop = fmtPop(v.pop), area = fmtArea(v.area), gdp = fmtUSD(v.gdp), gdppc = fmtPc(v.gdppc);
    if (pop) e.pop = pop; if (area) e.area = area; if (gdp) e.gdp = gdp; if (gdppc) e.gdppc = gdppc;
    if (Object.keys(e).length) out[k] = e;
  }
  const keys = Object.keys(out).sort();
  let js = '/* Present-day country statistics (Wikidata) for the Atlas click popup — keyed by lowercased name.\n';
  js += '   Built by fetch-stats.js. Shown only at the present year; historical years / missing values show a dash. */\n';
  js += 'window.COUNTRY_STATS = {\n';
  js += keys.map((k) => '  "' + k.replace(/"/g, '\\"') + '": ' + JSON.stringify(out[k])).join(',\n');
  js += '\n};\n';
  fs.writeFileSync('country-stats.js', js);
  console.log('Wrote country-stats.js with stats for ' + keys.length + ' countries (of ' + Object.keys(isoToKey).length + ' with ISO codes).');
})();
