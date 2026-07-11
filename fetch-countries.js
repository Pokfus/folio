#!/usr/bin/env node
/* ============================================================================
   fetch-countries.js  (rate-limit resilient + resumable)

   Fetches a 5-sentence Wikipedia summary for every country/territory that can be
   clicked on the Atlas globe — present-day countries (world.js) and every
   historical-era territory (timeline.js) — and writes them to countries.js, which
   the globe's click popup reads (window.COUNTRY_INFO, keyed by lowercased name).

   RUN:  node fetch-countries.js     (from the Folio site folder, Node 18+)

   Resumable: progress is cached in countries-info.json; re-run any time to fill
   in the rest. Load the result by adding, before the app.js line in index.html:
       <script src="countries.js"></script>
   ============================================================================ */
const fs = require('fs');

const DELAY_MS = 1200;        // pause between requests
const BATCH = 20;             // titles per request
const MAX_ERR_RETRY = 5;
const RETRY_AFTER_CAP = 70;
const MAX_429 = 10;
const UA = 'FolioStudyAtlas/1.0 (personal study project; contact: you@example.com)';

const CACHE = 'countries-info.json';
const OUT = 'countries.js';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const keyOf = (name) => String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
// Natural Earth uses abbreviated names that aren't Wikipedia titles — map the resolvable ones to their articles
const NAME_MAP = {
  'Bosnia and Herz.': 'Bosnia and Herzegovina', 'N. Cyprus': 'Northern Cyprus', 'Fr. Polynesia': 'French Polynesia',
  'Antigua and Barb.': 'Antigua and Barbuda', 'St. Vin. and Gren.': 'Saint Vincent and the Grenadines',
  'Turks and Caicos Is.': 'Turks and Caicos Islands', 'Pitcairn Is.': 'Pitcairn Islands', 'Cayman Is.': 'Cayman Islands',
  'Faeroe Is.': 'Faroe Islands', 'Cook Is.': 'Cook Islands', 'British Virgin Is.': 'British Virgin Islands',
  'U.S. Virgin Is.': 'United States Virgin Islands', 'N. Mariana Is.': 'Northern Mariana Islands',
  'Wallis and Futuna Is.': 'Wallis and Futuna', 'St-Barthélemy': 'Saint Barthélemy', 'Spratly Is.': 'Spratly Islands',
  'Br. Indian Ocean Ter.': 'British Indian Ocean Territory', 'Fr. S. Antarctic Lands': 'French Southern and Antarctic Lands',
  'S. Geo. and the Is.': 'South Georgia and the South Sandwich Islands', 'Heard I. and McDonald Is.': 'Heard Island and McDonald Islands',
  'Clipperton I.': 'Clipperton Island', 'Ashmore and Cartier Is.': 'Ashmore and Cartier Islands',
  'USNB Guantanamo Bay': 'Guantanamo Bay Naval Base', 'Coral Sea Is.': 'Coral Sea Islands',
};

// ---- gather every clickable name: present-day countries + all era territories ----
global.window = {};
require('./world.js');
try { require('./timeline.js'); } catch (e) { /* timeline.js may be an empty stub */ }
const GEO = window.WORLD_GEO || [], TL = window.TIMELINE || [];
const nameByKey = {};   // key -> a display name to query Wikipedia with
for (const g of GEO) if (g && g.n) nameByKey[keyOf(g.n)] = g.n;
for (const era of TL) for (const t of (era.geo || [])) if (t && t.n) { const k = keyOf(t.n); if (!(k in nameByKey)) nameByKey[k] = t.n; }

let result = {};
if (fs.existsSync(CACHE)) { try { result = JSON.parse(fs.readFileSync(CACHE, 'utf8')) || {}; } catch { result = {}; } }
const missingKeys = Object.keys(nameByKey).filter((k) => !(k in result));
console.log(`Clickable names: ${Object.keys(nameByKey).length} | already fetched: ${Object.keys(result).length} | remaining: ${missingKeys.length}`);
if (!missingKeys.length) { writeOut(); console.log('Nothing left to fetch — all set.'); process.exit(0); }

// proper sentence segmentation: keeps all text, and does NOT break at decimals ("9.6") or abbreviations ("U.S.", "St.")
const ABBR = /^(?:[A-Za-z]|e\.g|i\.e|etc|vs|approx|ca|c|Mr|Mrs|Ms|Dr|Prof|St|Mt|Ft|No|Jr|Sr|Co|Inc|Ltd|Gen|Col|Capt|Sgt|Rev|Hon|U\.S|U\.K|U\.N)$/;
function trimSummary(text) {
  text = (text || '').replace(/\s+/g, ' ').trim(); if (!text) return '';
  const parts = []; let start = 0;
  for (let i = 0; i < text.length && parts.length < 5; i++) {
    const ch = text[i]; if (ch !== '.' && ch !== '!' && ch !== '?') continue;
    if (text[i + 1] !== ' ') continue;                                  // decimals ("9.6") have no space after the dot
    const nx = text[i + 2]; if (!nx || !/[A-Z0-9"“(]/.test(nx)) continue;   // next sentence starts with a capital / number / quote
    const tok = (text.slice(start, i).match(/(\S+)$/) || ['', ''])[1].replace(/[.,;:]+$/, '');
    if (ABBR.test(tok)) continue;                                       // abbreviation / single initial → not a boundary
    parts.push(text.slice(start, i + 1).trim()); start = i + 1;
  }
  if (parts.length < 5 && start < text.length) parts.push(text.slice(start).trim());
  let out = parts.slice(0, 5).join(' ').trim();
  const CAP = 820;
  if (out.length > CAP) { out = out.slice(0, CAP); const stop = Math.max(out.lastIndexOf('. '), out.lastIndexOf('? '), out.lastIndexOf('! ')); out = stop > 200 ? out.slice(0, stop + 1) : out.replace(/\s+\S*$/, '') + '…'; }
  return out.trim();
}
function resolveBatch(titleToKey, query) {
  const norm = {}; (query.normalized || []).forEach((n) => (norm[n.from] = n.to));
  const redir = {}; (query.redirects || []).forEach((r) => (redir[r.from] = r.to));
  const byTitle = {}; Object.values(query.pages || {}).forEach((p) => (byTitle[p.title] = p));
  const out = {};
  for (const [title, key] of Object.entries(titleToKey)) {
    let t = title; if (norm[t]) t = norm[t]; if (redir[t]) t = redir[t];
    const page = byTitle[t];
    if (page && !('missing' in page)) { const s = (page.extract || '').replace(/\s+/g, ' ').trim(); if (s) out[key] = s; }   // cache the raw lead; trim to 5 sentences at write time
  }
  return out;
}
function parseRetryAfter(res) { const h = res.headers.get('retry-after'); if (!h) return null; if (/^\d+$/.test(h.trim())) return parseInt(h, 10); const when = Date.parse(h); return isNaN(when) ? null : Math.max(0, Math.ceil((when - Date.now()) / 1000)); }
function writeOut() {
  fs.writeFileSync(CACHE, JSON.stringify(result));
  const keys = Object.keys(result).sort();
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  let out = '/* Country / territory descriptions (5-sentence Wikipedia summaries) for the Atlas globe click popup.\n';
  out += '   Built by fetch-countries.js; keyed by lowercased name. Load before app.js. Safe to re-generate. */\n';
  out += 'window.COUNTRY_INFO = {\n';
  out += keys.map((k) => `  "${esc(k)}": "${esc(trimSummary(result[k]))}"`).join(',\n');
  out += '\n};\n';
  fs.writeFileSync(OUT, out);
}

class RateLimited extends Error {}
let total429 = 0;
async function fetchBatch(keys) {
  const titleToKey = {};
  for (const k of keys) titleToKey[NAME_MAP[nameByKey[k]] || nameByKey[k]] = k;   // query by display name (or its mapped article); map page back to key
  const params = new URLSearchParams({ action: 'query', format: 'json', prop: 'extracts', exintro: '1', explaintext: '1', exlimit: 'max', redirects: '1', titles: Object.keys(titleToKey).join('|') });
  const url = 'https://en.wikipedia.org/w/api.php?' + params.toString();
  let errs = 0;
  while (true) {
    let res;
    try { res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } }); }
    catch (e) { if (++errs >= MAX_ERR_RETRY) { console.warn('\n  batch failed:', e.message); return {}; } await sleep(1500 * errs); continue; }
    if (res.status === 429) { if (++total429 > MAX_429) throw new RateLimited('rate limited repeatedly'); const wait = parseRetryAfter(res) ?? Math.min(60, 8 * total429); if (wait > RETRY_AFTER_CAP) throw new RateLimited(`asked to wait ${wait}s`); process.stdout.write(`\n  rate limited — waiting ${wait}s...`); await sleep(wait * 1000); continue; }
    if (!res.ok) { if (++errs >= MAX_ERR_RETRY) { console.warn('\n  batch failed: HTTP ' + res.status); return {}; } await sleep(1500 * errs); continue; }
    try { const data = await res.json(); return resolveBatch(titleToKey, data.query || {}); }
    catch (e) { if (++errs >= MAX_ERR_RETRY) { console.warn('\n  parse failed:', e.message); return {}; } await sleep(1500 * errs); continue; }
  }
}
process.on('SIGINT', () => { console.log('\nInterrupted — saving progress...'); writeOut(); process.exit(0); });

(async () => {
  for (let i = 0; i < missingKeys.length; i += BATCH) {
    let got;
    try { got = await fetchBatch(missingKeys.slice(i, i + BATCH)); }
    catch (e) { if (e instanceof RateLimited) { writeOut(); console.log(`\n\nStopped: ${e.message}. Progress saved (${Object.keys(result).length}). Re-run later to resume.`); process.exit(0); } throw e; }
    Object.assign(result, got);
    process.stdout.write(`\rFetched ${Math.min(i + BATCH, missingKeys.length)}/${missingKeys.length}  (descriptions: ${Object.keys(result).length})        `);
    if ((i / BATCH) % 10 === 9) writeOut();
    await sleep(DELAY_MS);
  }
  console.log('');
  writeOut();
  console.log(`Done. Wrote ${OUT} with ${Object.keys(result).length} descriptions (of ${Object.keys(nameByKey).length} names).`);
})();
