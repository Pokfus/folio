#!/usr/bin/env node
/* ============================================================================
   fetch-glossary.js  (rate-limit resilient + resumable)

   Fetches real Wikipedia summaries for every glossary term referenced in the
   card backgrounds that has no curated description, and writes them to
   glossary-wikipedia.js (a drop-in supplement for glossary.js).

   RUN:  node fetch-glossary.js     (from your Folio site folder, Node 18+)

   If Wikipedia rate-limits you (HTTP 429), this script waits the amount it
   asks for and keeps going. If the limit is heavy, it SAVES PROGRESS and exits
   cleanly — just run it again later and it resumes where it left off (it keeps
   a small cache file, glossary-wikipedia.json). Safe to re-run any time.

   When done, load the result by adding, right after the glossary.js line in
   index.html:   <script src="glossary-wikipedia.js"></script>
   ============================================================================ */
const fs = require('fs');

/* ---- knobs you can tweak ---------------------------------------------------
   If you STILL get 429s, raise DELAY_MS (e.g. 4000). Once it runs cleanly you
   can lower it (e.g. 800) to go faster. */
const DELAY_MS = 2000;        // pause between requests (gentle ~0.5/sec)
const BATCH = 20;             // titles per request
const MAX_ERR_RETRY = 5;      // retries per batch on non-429 network errors
const RETRY_AFTER_CAP = 70;   // if asked to wait longer than this (sec), stop & resume later
const MAX_429 = 10;           // after this many 429s total, stop & resume later
// Wikipedia asks API users to identify themselves — put your real contact here:
const UA = 'FolioStudyGlossary/1.0 (personal study project; contact: you@example.com)';

const CACHE = 'glossary-wikipedia.json';
const OUT = 'glossary-wikipedia.js';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- load existing data + glossary (assign onto a global window) ----
global.window = {};
require('./data.js');
require('./glossary.js');
const CARDS = window.CARD_DATA || [];
const GLOSSARY = window.GLOSSARY || {};

// ---- resume: load anything fetched on a previous run ----
let result = {};
if (fs.existsSync(CACHE)) {
  try { result = JSON.parse(fs.readFileSync(CACHE, 'utf8')) || {}; } catch { result = {}; }
}

// ---- find referenced terms with no curated entry and not already fetched ----
const referenced = new Set();
const reKey = /data-k="([^"]+)"/g;
for (const c of CARDS) { if (!c.abstract) continue; let m; while ((m = reKey.exec(c.abstract))) referenced.add(m[1]); }
const missing = [...referenced].filter(
  (k) => (!(k in GLOSSARY) || !String(GLOSSARY[k] || '').trim()) && !(k in result)
);
console.log(
  `Referenced: ${referenced.size} | curated: ${Object.keys(GLOSSARY).length} | ` +
  `already fetched: ${Object.keys(result).length} | remaining this run: ${missing.length}`
);
if (!missing.length) { writeOut(); console.log('Nothing left to fetch — all set.'); process.exit(0); }

// ---- helpers ----
function trimSummary(text) {
  text = (text || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)/g);
  let out = sentences ? sentences.slice(0, 3).join('').trim() : text;
  const CAP = 480;
  if (out.length > CAP) {
    out = out.slice(0, CAP);
    const stop = Math.max(out.lastIndexOf('. '), out.lastIndexOf('? '), out.lastIndexOf('! '));
    out = stop > 120 ? out.slice(0, stop + 1) : out.replace(/\s+\S*$/, '') + '\u2026';
  }
  return out.trim();
}

function resolveBatch(sentToSlug, query) {
  const norm = {}; (query.normalized || []).forEach((n) => (norm[n.from] = n.to));
  const redir = {}; (query.redirects || []).forEach((r) => (redir[r.from] = r.to));
  const byTitle = {}; Object.values(query.pages || {}).forEach((p) => (byTitle[p.title] = p));
  const out = {};
  for (const [sent, slug] of Object.entries(sentToSlug)) {
    let t = sent; if (norm[t]) t = norm[t]; if (redir[t]) t = redir[t];
    const page = byTitle[t];
    if (page && !('missing' in page)) { const s = trimSummary(page.extract); if (s) out[slug] = s; }
  }
  return out;
}

function parseRetryAfter(res) {
  const h = res.headers.get('retry-after');
  if (!h) return null;
  if (/^\d+$/.test(h.trim())) return parseInt(h, 10);
  const when = Date.parse(h);
  return isNaN(when) ? null : Math.max(0, Math.ceil((when - Date.now()) / 1000));
}

function writeOut() {
  fs.writeFileSync(CACHE, JSON.stringify(result));
  const keys = Object.keys(result).sort();
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  let out = '/* Auto-generated from Wikipedia summaries by fetch-glossary.js.\n';
  out += '   Load this AFTER glossary.js (or append it to the end of glossary.js). */\n';
  out += 'Object.assign(window.GLOSSARY, {\n';
  out += keys.map((k) => `  "${esc(k)}": "${esc(result[k])}"`).join(',\n');
  out += '\n});\n';
  fs.writeFileSync(OUT, out);
}

class RateLimited extends Error {}
let total429 = 0;

async function fetchBatch(slugs) {
  const sentToSlug = {};
  for (const slug of slugs) sentToSlug[slug.replace(/_/g, ' ')] = slug; // titles use spaces
  const params = new URLSearchParams({
    action: 'query', format: 'json', prop: 'extracts',
    exintro: '1', explaintext: '1', exlimit: 'max', redirects: '1',
    titles: Object.keys(sentToSlug).join('|'),
  });
  const url = 'https://en.wikipedia.org/w/api.php?' + params.toString();
  let errs = 0;
  while (true) {
    let res;
    try {
      res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
    } catch (e) {
      if (++errs >= MAX_ERR_RETRY) { console.warn('\n  batch failed (kept on fallback):', e.message); return {}; }
      await sleep(1500 * errs); continue;
    }
    if (res.status === 429) {
      if (++total429 > MAX_429) throw new RateLimited('hit Wikipedia\'s rate limit repeatedly');
      const wait = parseRetryAfter(res) ?? Math.min(60, 8 * total429);
      if (wait > RETRY_AFTER_CAP) throw new RateLimited(`Wikipedia asked to wait ${wait}s`);
      process.stdout.write(`\n  rate limited (429) — waiting ${wait}s, then continuing...   `);
      await sleep(wait * 1000); continue;
    }
    if (!res.ok) {
      if (++errs >= MAX_ERR_RETRY) { console.warn('\n  batch failed (kept on fallback): HTTP ' + res.status); return {}; }
      await sleep(1500 * errs); continue;
    }
    try { const data = await res.json(); return resolveBatch(sentToSlug, data.query || {}); }
    catch (e) { if (++errs >= MAX_ERR_RETRY) { console.warn('\n  parse failed:', e.message); return {}; } await sleep(1500 * errs); continue; }
  }
}

// save progress if you press Ctrl+C
process.on('SIGINT', () => { console.log('\nInterrupted — saving progress...'); writeOut(); process.exit(0); });

(async () => {
  let batchNo = 0;
  for (let i = 0; i < missing.length; i += BATCH) {
    let got;
    try { got = await fetchBatch(missing.slice(i, i + BATCH)); }
    catch (e) {
      if (e instanceof RateLimited) {
        writeOut();
        console.log(`\n\nStopped: ${e.message}.`);
        console.log(`Progress saved — ${Object.keys(result).length} descriptions so far.`);
        console.log('Wait a few minutes (or raise DELAY_MS near the top), then run "node fetch-glossary.js" again to resume.');
        process.exit(0);
      }
      throw e;
    }
    Object.assign(result, got);
    process.stdout.write(`\rFetched ${Math.min(i + BATCH, missing.length)}/${missing.length}  (descriptions: ${Object.keys(result).length})        `);
    if (++batchNo % 10 === 0) writeOut(); // checkpoint every 10 batches
    await sleep(DELAY_MS);
  }
  console.log('');
  writeOut();
  console.log(`Done. Wrote ${OUT} with ${Object.keys(result).length} descriptions.`);
  console.log('Tip: skim the output before shipping — Wikipedia lead paragraphs vary in quality.');
})();
