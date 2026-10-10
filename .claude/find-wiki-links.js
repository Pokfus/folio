#!/usr/bin/env node
/*
  find-wiki-links.js — which cards have a DEDICATED English Wikipedia article for their answer term,
  and what its exact title is.

    node .claude/find-wiki-links.js [--prefix=gr-] [--card=gr-010] [--cards=gr-010,gr-011] [--refresh]
                                    [--no-search] [--limit=N] [--max-wait=SECONDS]

  Writes  .claude/wiki-links.json        one entry per card: the article title, URL, how it was found
                                         and the status (see STATUSES below) — the memory the
                                         "Learn more" box at the foot of a card is built from.
          .claude/wiki-title-cache.json  every title ever asked of Wikipedia and what it resolved to,
                                         so a re-run only asks about NEW cards. --refresh drops it.
          docs/wikipedia-links-audit.md  the human-readable report: counts, and the cards that need a
                                         decision (no article found, a redirect to a broader article,
                                         a disambiguation page that could not be settled).

  A NEW CARD NEEDS NONE OF THIS BY HAND: `add-card.js` and `import-batch.js` run it for the cards they
  write (through wiki-step.js: `--cards=<ids> --max-wait=90`, then apply-wiki-links.js), so a card ships
  with its Learn-more tile the way it ships with its citations. `--max-wait` caps the total seconds spent
  waiting out Wikipedia's rate limit or a dead network; past it the cache is saved and the run exits 2,
  which the caller reports as "not resolved yet — run this command" rather than hanging a card add.

  AN ENTRY MARKED `"manual": true` IS NEVER RECOMPUTED. That is how a human decision survives a re-run:
  put the right `title` and `url` in (or `null` for both to take the tile away), add `"manual": true`,
  and neither this script nor a later prefix run will overwrite it. `apply-wiki-links.js --check` is the
  CI gate: every card must have an entry, and every card's `wiki` must match its entry.

  Needs the network (NODE_USE_ENV_PROXY=1 in a cloud session). Wikipedia rate-limits the shared proxy
  address in bursts: a 429 is waited out for the seconds it names, and if it will not lift the cache
  is saved and the run exits 2 — run it again later and it resumes.

  HOW A CARD IS MATCHED, in order (the first candidate that resolves to an article wins):

    1. glossary   The glossary keys every term on its Wikipedia slug and the rule since Aug 2026 is
                  that a card ships with a glossary entry for its own answer term, so a key whose name
                  equals the answer is the best candidate there is. Several keys can share a name
                  (`Georgia_(country)` / `Georgia_(state)`): the qualifier that appears in the card's
                  own question or background wins; otherwise the bare key goes first.
    2. answer     The answer text itself, HTML stripped, as a title.
    3. variants   American spellings (Palaeolithic → Paleolithic, civilisation → civilization,
                  colour → color), the singular, the text without a leading "the".
    4. search     For a card nothing above resolved: Wikipedia's own search, top 5. A hit is ACCEPTED
                  only when its title is the answer under normalisation (`ok`), or has exactly the
                  answer's words in another order ("Throne Room, Knossos" — `search-match`, listed in
                  the report); the rest are written to the report as suggestions for a human. Nothing
                  else is ever guessed.

  Every candidate is resolved through the API with redirects followed, so a glossary key that is
  itself a redirect (`Denisovans` → `Denisovan`) lands on the real article, and a key that is a
  disambiguation page (the glossary's `Olympia` is one) is caught rather than linked. When a
  disambiguation page is hit, its outgoing links that contain the answer's words are scored against the
  collection's hint words and the card's own text; a single clear winner is taken and said so.

  STATUSES (wiki-links.json → cards[id].status)
    ok                 the title is the article, no redirect
    redirect-variant   redirected, but only spelling / plural / a qualifier changed — same subject
    redirect-broader   redirected to a differently named article — a human should glance at it
    disambig-resolved  the answer was a disambiguation page; one of its links was chosen by hint words
    search-match       a search hit with the answer's words in another order (listed in the report)
    list-page          the only match is a list, timeline, glossary or index page ("List of governors of
                       Roman Egypt"): an index of many things, not an article about this one. No link.
    section-redirect   the only match is a redirect INTO A SECTION of another article: NOT a dedicated
                       page. No link is recorded.
    disambiguation     only a disambiguation page matched and no link could be chosen. No link.
    none               nothing matched. No link (search suggestions go to the report).

  Rules it keeps: a Wikipedia article is a destination, never a source; nothing is written into the
  data files — the implementation reads wiki-links.json. English only.
*/
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { loadCards } = require(path.join(__dirname, "card-io.js"));

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = /^--([^=]+)(?:=(.*))?$/.exec(a); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true];
}));
const PREFIX = args.prefix || "";
const ONLY = args.card || "";
const IDS = args.cards ? new Set(String(args.cards).split(",").map((x) => x.trim()).filter(Boolean)) : null;
const MAX_WAIT_MS = args["max-wait"] ? parseInt(args["max-wait"], 10) * 1000 : Infinity;
let waitedMs = 0;
const LIMIT = args.limit ? parseInt(args.limit, 10) : Infinity;
const DO_SEARCH = !args["no-search"];

const OUT = path.join(__dirname, "wiki-links.json");
const CACHE = path.join(__dirname, "wiki-title-cache.json");
const REPORT = path.join(ROOT, "docs", "wikipedia-links-audit.md");
const API = "https://en.wikipedia.org/w/api.php";
const UA = "FolioWikiLinks/1.0 (https://github.com/Pokfus/folio; sirfrogemail@gmail.com) node";

/* ---------- text helpers ---------- */
const strip = (s) => String(s || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const deacc = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
// the loose key two titles are compared under: case, accents, underscores, a leading "the", punctuation
const norm = (s) => deacc(strip(s)).toLowerCase().replace(/[_\s]+/g, " ").replace(/^the /, "").replace(/[’'"().,:;!?\-–—]/g, "").replace(/\s+/g, " ").trim();
const noQual = (t) => t.replace(/\s*\([^)]*\)\s*$/, "").replace(/,\s[^,]+$/, "");   // "Olympia (Washington)" → "Olympia"; "Olympia, Greece" → "Olympia"
const qualOf = (t) => { const m = /\(([^)]*)\)\s*$/.exec(t) || /,\s([^,]+)$/.exec(t); return m ? m[1] : ""; };
const titleOf = (s) => strip(s).replace(/_/g, " ").trim();
const spaced = (t) => t.replace(/_/g, " ");

// British → American spellings that Wikipedia titles use (the site is authored in British spelling)
const SPELL = [
  [/Palaeo/g, "Paleo"], [/palaeo/g, "paleo"], [/Mediaeval/g, "Medieval"], [/mediaeval/g, "medieval"],
  [/isation\b/g, "ization"], [/ising\b/g, "izing"], [/ised\b/g, "ized"], [/ise\b/g, "ize"], [/ises\b/g, "izes"],
  [/our\b/g, "or"], [/ours\b/g, "ors"], [/ourite\b/g, "orite"],
  [/\bdefence\b/gi, (m) => m[0] === "D" ? "Defense" : "defense"], [/\bcentre\b/gi, (m) => m[0] === "C" ? "Center" : "center"],
  [/\btheatre\b/gi, (m) => m[0] === "T" ? "Theater" : "theater"], [/\bgrey\b/gi, (m) => m[0] === "G" ? "Gray" : "gray"],
  [/\bprogramme\b/gi, (m) => m[0] === "P" ? "Program" : "program"], [/\bsulphur/gi, (m) => m[0] === "S" ? "Sulfur" : "sulfur"],
  [/\bartefact/gi, (m) => m[0] === "A" ? "Artifact" : "artifact"], [/\bencyclopaedia/gi, (m) => m[0] === "E" ? "Encyclopedia" : "encyclopedia"],
  [/ae/g, "e"],   // last resort: archaeology stays (Wikipedia spells it so), but haematite → hematite
];
function variants(answer) {
  const out = [];
  const push = (t) => { t = t.trim(); if (t && !out.includes(t)) out.push(t); };
  let t = answer;
  if (/^the /i.test(t)) push(t.replace(/^the /i, ""));
  const bases = [t, ...out];
  for (const b of bases) {
    let cur = b;
    for (const [rx, rep] of SPELL) { const n = cur.replace(rx, rep); if (n !== cur) { push(n); cur = n; } }
  }
  for (const b of [...bases, ...out]) {
    if (/ies$/.test(b)) push(b.replace(/ies$/, "y"));
    else if (/(ch|sh|x|s)es$/.test(b)) push(b.replace(/es$/, ""));
    else if (/s$/.test(b) && !/ss$/.test(b)) push(b.replace(/s$/, ""));
  }
  return out.filter((v) => norm(v) !== norm(answer) || v !== answer);
}
// what a collection is about, for settling a disambiguation page or scoring a search hit
const HINTS = {
  wh: ["history"], gr: ["Greece", "Greek", "ancient", "Crete", "Minoan", "Mycenaean", "Athens", "Sparta"], rm: ["Rome", "Roman", "Italy", "Latin"],
  us: ["United States", "American", "U.S."], geo: ["state", "United States", "U.S.", "city", "capital"], ru: ["Russia", "Russian", "Soviet", "Rus"],
  gru: ["Russia", "oblast", "krai", "republic", "federal"], in: ["India", "Indian"], cnh: ["China", "Chinese", "dynasty"], gc: ["China", "province", "Chinese"],
  eg: ["Egypt", "Egyptian", "pharaoh"], ww2: ["World War II", "Second World War", "1939", "1945", "Nazi"], ww1: ["World War I", "First World War", "1914", "1918"],
  jp: ["Japan", "Japanese"], ko: ["Korea", "Korean"], ps: ["psychology", "psychological", "cognitive"], bio: ["biology", "biological", "cell", "organism"],
  art: ["art", "painting", "sculpture", "artist"], pea: ["China", "Chinese", "Communist", "politics", "Taiwan", "Korea", "Japan"],
  gw: ["country", "nation"], fl: ["country", "flag"], fd: ["country", "flag"], ec: ["economics"], ph: ["philosophy"], astro: ["astronomy"],
  dino: ["dinosaur"], cw: ["Cold War"], vk: ["Viking", "Norse"], fr: ["France", "French"], me: ["Mesopotamia", "Sumer", "Babylon", "Assyria"],
  arch: ["architecture", "building"], mid: ["Middle-earth", "Tolkien"], wes: ["Westeros", "A Song of Ice and Fire"],
  eep: ["European Union", "EU", "foreign policy", "defence", "enlargement", "Council of the European Union", "treaty"],
};
const prefixOf = (id) => id.replace(/-?\d+[a-z]?$/, "").replace(/-$/, "");

/* ---------- Wikipedia ---------- */
let cache = {};
if (!args.refresh && fs.existsSync(CACHE)) { try { cache = JSON.parse(fs.readFileSync(CACHE, "utf8")); } catch (e) { cache = {}; } }
let dirty = 0;
const saveCache = () => { fs.writeFileSync(CACHE, JSON.stringify(cache, null, 0)); dirty = 0; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// every wait on Wikipedia (a rate limit, a dead network) is spent from one budget; past --max-wait the
// cache is saved and the run stops, so a caller that is only linking one new card is never held up
async function backoff(ms) {
  waitedMs += ms;
  if (waitedMs > MAX_WAIT_MS) { saveCache(); console.error("Wikipedia did not answer within --max-wait=" + Math.round(MAX_WAIT_MS / 1000) + "s; progress is saved."); process.exit(2); }
  await sleep(ms);
}
let lastCall = 0;
async function paced() { const gap = 250 - (Date.now() - lastCall); if (gap > 0) await sleep(gap); lastCall = Date.now(); }
/* TWO CHANNELS. `api.php` answers fifty titles a call but the shared proxy address trips its rate limit
   in bursts (429, "You are making too many requests"), sometimes for minutes. `index.php?action=raw`
   — the plain wikitext of one page — is served by the ordinary page path and has never refused here,
   so when the API says 429 twice running the batch is resolved title by title from raw wikitext
   instead, and the API is left alone for ten minutes before it is tried again. A redirect page's raw
   text is `#REDIRECT [[Target#Section]]`; a disambiguation page carries one of the templates below.
   The null return from api() is what tells a caller to use raw. */
let apiCooldownUntil = 0;
async function api(params, optional) {
  if (Date.now() < apiCooldownUntil) return null;
  const u = new URL(API);
  Object.entries({ format: "json", formatversion: 2, ...params }).forEach(([k, v]) => u.searchParams.set(k, v));
  let limited = 0;
  for (let attempt = 0; attempt < 6; attempt++) {
    await paced();
    let res;
    try { res = await fetch(u, { headers: { "User-Agent": UA, "Api-User-Agent": UA } }); }
    catch (e) { process.stderr.write(`  network: ${e.message}; retrying\n`); await backoff(3000 * (attempt + 1)); continue; }
    if (res.status === 429 || res.status === 503) {
      limited++;
      if (limited >= 2) { apiCooldownUntil = Date.now() + 10 * 60 * 1000; process.stderr.write(`  API rate-limited twice; using raw wikitext for 10 min\n`); return null; }
      const ra = Math.min(60, parseInt(res.headers.get("retry-after") || "20", 10) || 20);
      process.stderr.write(`  ${res.status} from the API; waiting ${ra}s\n`);
      await backoff(ra * 1000 + 500); continue;
    }
    if (!res.ok) { if (optional) return null; throw new Error(`HTTP ${res.status} for ${u}`); }
    return res.json();
  }
  return null;
}
const DAB_RX = /\{\{\s*(disambiguation|disambig|dab|disamb|dmbox|hndis|geodis|numberdis|letter-number ?comb(ination)? ?disambig(uation)?|mil-unit-dis|school disambiguation|species latin name disambiguation|surname|given name|set index article|sia|ship index|shipindex|mountainindex|roadindex|hospitaldis|call sign disambiguation|chemistry index|chinese title disambiguation|airport disambiguation|biology disambiguation|genus disambiguation|place name disambiguation|station disambiguation|taxonomy disambiguation|wp disambig|human name disambiguation|mathdab|math disambiguation|road disambiguation|music disambiguation|caselaw disambiguation|letter disambiguation|phonetics disambiguation|opus number disambiguation|species name disambiguation|storm index|tndis|first name|nickname|molecular formula index|fungus common name)\s*[|}]/i;
async function rawText(title) {
  const u = "https://en.wikipedia.org/w/index.php?title=" + encodeURIComponent(title.replace(/ /g, "_")) + "&action=raw";
  for (let attempt = 0; attempt < 6; attempt++) {
    await paced();
    let res;
    try { res = await fetch(u, { headers: { "User-Agent": UA } }); }
    catch (e) { process.stderr.write(`  network: ${e.message}; retrying\n`); await backoff(3000 * (attempt + 1)); continue; }
    if (res.status === 404) return null;
    if (res.status === 429 || res.status === 503) { const ra = Math.min(60, parseInt(res.headers.get("retry-after") || "20", 10) || 20); process.stderr.write(`  ${res.status} from raw; waiting ${ra}s\n`); await backoff(ra * 1000 + 500); continue; }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${u}`);
    return res.text();
  }
  saveCache();
  console.error("Wikipedia would not lift its rate limit on either channel; progress is saved — run again later.");
  process.exit(2);
}
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
async function resolveRaw(t) {
  let cur = cap(t), hops = 0, fragment = "";
  const from = cur;
  for (;;) {
    const body = await rawText(cur);
    if (body == null) return { status: "missing", title: t };
    const m = /^\s*#\s*REDIRECT\s*:?\s*\[\[([^\]|#]+)(?:#([^\]|]*))?/i.exec(body);
    if (m && hops < 5) { cur = cap(m[1].replace(/_/g, " ").trim()); if (m[2]) fragment = m[2].trim(); hops++; continue; }
    const dab = DAB_RX.test(body) || /may (also )?refer to:/i.test(body.slice(0, 3000));
    if (dab) { const e = { status: "disambig", title: cur, from }; e.rawLinks = [...body.matchAll(/\[\[([^\]|#]+)/g)].map((x) => x[1].trim()).filter((l) => !/^(File|Image|Category|Wikipedia|Template|Help|Portal|wikt|Special):/i.test(l)); return e; }
    if (hops && fragment) return { status: "section-redirect", title: cur, from, fragment };
    if (hops) return { status: "redirect", title: cur, from };
    return { status: "ok", title: cur };
  }
}
/* Resolve up to 50 titles in one call. Each becomes a cache entry:
     { status: "ok" | "redirect" | "section-redirect" | "disambig" | "missing", title, from, fragment } */
async function resolve(titles) {
  const want = [...new Set(titles.map(titleOf).filter(Boolean))].filter((t) => !cache[t]);
  for (let i = 0; i < want.length; i += 50) {
    const batch = want.slice(i, i + 50);
    const data = await api({ action: "query", prop: "pageprops", ppprop: "disambiguation", redirects: 1, titles: batch.join("|") });
    if (!data) {
      for (const t of batch) { cache[t] = await resolveRaw(t); dirty++; if (dirty >= 100) saveCache(); }
      continue;
    }
    const q = data.query || {};
    const normMap = {}; (q.normalized || []).forEach((n) => { normMap[n.from] = n.to; });
    const redir = {}; (q.redirects || []).forEach((r) => { redir[r.from] = r; });
    const pages = {}; (q.pages || []).forEach((p) => { pages[p.title] = p; });
    for (const t of batch) {
      let cur = normMap[t] || t, hops = 0, fragment = "";
      const from = cur;
      while (redir[cur] && hops < 5) { fragment = redir[cur].tofragment || fragment; cur = redir[cur].to; hops++; }
      const p = pages[cur];
      let e;
      if (!p || p.missing) e = { status: "missing", title: t };
      else if (p.pageprops && "disambiguation" in p.pageprops) e = { status: "disambig", title: p.title, from };
      else if (hops && fragment) e = { status: "section-redirect", title: p.title, from, fragment };
      else if (hops) e = { status: "redirect", title: p.title, from };
      else e = { status: "ok", title: p.title };
      cache[t] = e; dirty++;
    }
    if (dirty >= 200) saveCache();
  }
  return titles.map((t) => cache[titleOf(t)]);
}
// the outgoing links of a disambiguation page (first 500 — a dab page has a few dozen)
async function dabLinks(title) {
  const key = "dab:" + title;
  if (cache[key]) return cache[key];
  const data = await api({ action: "query", prop: "links", plnamespace: 0, pllimit: 500, titles: title }, true);
  let links;
  if (data) { const p = ((data.query || {}).pages || [])[0] || {}; links = (p.links || []).map((l) => l.title); }
  else { const r = await resolveRaw(title); links = r.rawLinks || []; }
  cache[key] = links; dirty++;
  return cache[key];
}
// search has no raw equivalent: while the API is cooling down it is simply not asked, and the card's
// entry is left without suggestions for the next run to fill (the cache key is only written on an answer)
async function search(q) {
  const key = "search:" + q;
  if (cache[key]) return cache[key];
  const data = await api({ action: "query", list: "search", srlimit: 5, srsearch: q }, true);
  if (!data) return null;
  cache[key] = ((data.query || {}).search || []).map((s) => s.title); dirty++;
  return cache[key];
}

/* ---------- the cards and the glossary ---------- */
const loaded = loadCards();
const cards = (loaded.cards || loaded).filter((c) => (!PREFIX || c.id.startsWith(PREFIX)) && (!ONLY || c.id === ONLY) && (!IDS || IDS.has(c.id))).slice(0, LIMIT);
global.window = global.window || {};
require(path.join(ROOT, "glossary.js"));
const GLOSS = Object.keys(window.GLOSSARY || {});
const glossByName = {};
for (const k of GLOSS) (glossByName[norm(noQual(spaced(k)))] = glossByName[norm(noQual(spaced(k)))] || []).push(spaced(k));

/* The QUESTION and tags only, never the background: a 300-word abstract mentions plants, films and
   bands often enough that "Croton (plant)" and "The Middle Kingdom (album)" were once chosen from it. */
function cardText(c) { return " " + norm([c.question, (c.tags || []).join(" ")].map(strip).join(" ")) + " "; }
// words that say nothing about WHICH subject a title is ("state" and "capital" are in every capital card's question)
const STOP = new Set(["the", "and", "of", "in", "for", "from", "with", "city", "town", "modern", "also", "a", "an", "at", "on", "de", "la", "le", "state", "capital", "county", "district"]);
// a word that says the link is a work, a taxon, an institution or a person's name is never the answer to a history card
const BAD_WORD = /\b(album|band|song|single|film|movie|novel|book|play|opera|game|series|magazine|newspaper|journal|company|brand|corporation|holdings|ship|hms|uss|horse|butterfly|trilobite|moth|genus|plant|fungus|beetle|spider|fish|bird|insect|given name|surname|name|singer|musician|rapper|actor|actress|footballer|cricketer|tv|television|video|comics|character|episode|record label|software|programming|crater|asteroid|star|constellation|restaurant|wrestler|racehorse|theatre|theater|hotel|school|university|college|academy|railway station|station|park|airport|parish|municipality|township|borough|electoral|constituency|stadium|arena|festival|award)\b/i;
const tokens = (s) => canon(s).split(" ").filter((w) => w && !STOP.has(w));
/* How well a candidate article title fits THIS card, counted over the words the title has that the answer
   does not (its qualifier and any extra words): +3 for a word in the card's own question or tags, +2 for a
   word of the collection's hints, and −∞ for a word naming a work, a taxon, an institution or a name. */
function hintScore(title, c, answer) {
  const extras = [...new Set([...tokens(noQual(title)), ...tokens(qualOf(title))])].filter((w) => !tokens(answer || "").includes(w));
  if (BAD_WORD.test(qualOf(title)) || BAD_WORD.test(extras.join(" ")) || /: /.test(title)) return -1;
  const text = cardText(c), hints = (HINTS[prefixOf(c.id)] || []).map((h) => canon(h));
  let s = 0;
  for (const w of extras) {
    if (w.length < 3) continue;
    if (text.includes(" " + w + " ") || text.includes(" " + w)) s += 3;
    else if (hints.some((h) => h === w || h.split(" ").includes(w))) s += 2;
  }
  return s;
}
const extrasOf = (title, answer) => [...new Set([...tokens(noQual(title)), ...tokens(qualOf(title))])].filter((w) => !tokens(answer || "").includes(w)).length;
function candidatesFor(c) {
  const answer = titleOf(c.answerText || c.answer);
  const out = [];
  const push = (t, via) => { const k = titleOf(t); if (k && !out.some((o) => o.t === k)) out.push({ t: k, via }); };
  const g = glossByName[norm(answer)] || [];
  const scored = g.map((t) => ({ t, s: hintScore(t, c), bare: !qualOf(t) }))
    .sort((a, b) => (b.s - a.s) || ((b.bare ? 1 : 0) - (a.bare ? 1 : 0)));
  scored.forEach((x) => push(x.t, "glossary"));
  push(answer, "answer");
  variants(answer).forEach((v) => push(v, "variant"));
  return { answer, cands: out };
}
/* The loosest key two names are compared under: no accents, American spelling, every word in the
   singular, no punctuation. "Behavioural modernity" and "Behavioral modernity" are one key; so are
   "Minoan sealstones" and "Minoan seals"? No — and that is right, a human looks at that one. */
const canon = (s) => deacc(norm(s)).replace(/\bst\b/g, "saint").replace(/isation/g, "ization").replace(/ise\b/g, "ize").replace(/our/g, "or").replace(/ae/g, "e").replace(/oe/g, "e")
  .replace(/[^a-z0-9 ]/g, "").split(" ").filter(Boolean).map((w) => w.replace(/ies$/, "y").replace(/(ch|sh|x|s)es$/, "$1").replace(/([^s])s$/, "$1")).join(" ");
/* …and the key under which two TRANSLITERATIONS of one Greek or Latin name meet: Kalaureia and Calauria,
   Herakleidai and Heracleidae, Hephaisteion and Hephaestion. k→c, every diphthong to one vowel, no doubled
   letters. Only ever applied to a redirect's two ends, which Wikipedia already says are one page. */
const translit = (s) => canon(s).replace(/kh|ch/g, "c").replace(/k/g, "c").replace(/ph/g, "f").replace(/th/g, "t").replace(/ai|ei|oi|ae|oe/g, "e").replace(/ou/g, "u").replace(/y/g, "i").replace(/(.)\1/g, "$1").replace(/[aeiou]+/g, "a");
// "redirect-variant" when the target is the same name modulo spelling / plural / qualifier / "the", a
// transliteration, the answer minus its "of Samos", or the answer plus one word ("Eteocretan" → "Eteocretan
// language", "Tarquinius Priscus" → "Lucius Tarquinius Priscus"). A target MISSING a word of the answer is
// never a variant: "Laetoli footprints" → "Laetoli" is a broader page, and a human looks at it.
function sameName(a, b) {
  const ca = canon(noQual(a)), cb = canon(noQual(b));
  if (ca === cb || translit(ca) === translit(cb)) return true;
  const head = (s) => s.split(/ (of|at|in|on|from) /)[0];
  if (canon(head(noQual(a))) === cb || ca === canon(head(noQual(b)))) return true;
  const ta = new Set(ca.split(" ")), tb = new Set(cb.split(" "));
  const extra = [...tb].filter((w) => !ta.has(w)), missing = [...ta].filter((w) => !tb.has(w));
  return missing.length === 0 && extra.length <= 1;
}
const LIST_RX = /^(List|Lists|Timeline|Glossary|Index|Outline) of /i;
const urlFor = (title) => "https://en.wikipedia.org/wiki/" + encodeURIComponent(title.replace(/ /g, "_")).replace(/%2C/g, ",").replace(/%3A/g, ":");

/* ---------- main ---------- */
(async () => {
  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { cards: {} };
  const result = { cards: {} };
  // a hand-decided entry is kept exactly as it is, and its card is not even looked up
  for (const c of cards.slice()) {
    const pv = prev.cards && prev.cards[c.id];
    if (pv && pv.manual) { result.cards[c.id] = pv; cards.splice(cards.indexOf(c), 1); }
  }
  // ask about every candidate of every card in bulk first, 50 to a call
  const all = [];
  const plans = cards.map((c) => { const p = candidatesFor(c); p.cands.forEach((x) => all.push(x.t)); return { c, ...p }; });
  process.stderr.write(`${cards.length} cards, ${new Set(all).size} candidate titles (${Object.keys(cache).length} cached)\n`);
  for (let i = 0; i < all.length; i += 50) {
    await resolve(all.slice(i, i + 50));
    if (i % 500 === 0) process.stderr.write(`  resolved ${Math.min(i + 50, all.length)}/${all.length}\n`);
  }
  let n = 0;
  for (const { c, answer, cands } of plans) {
    n++;
    const entry = { answer, title: null, url: null, via: null, status: "none" };
    let dabHit = null, secHit = null;
    for (const { t, via } of cands) {
      const r = cache[titleOf(t)]; if (!r) continue;
      if (r.status === "ok") { Object.assign(entry, { title: r.title, via, status: "ok" }); break; }
      if (r.status === "redirect") {
        Object.assign(entry, { title: r.title, via, from: r.from, status: sameName(r.from, r.title) || sameName(answer, r.title) ? "redirect-variant" : "redirect-broader" });
        break;
      }
      if (r.status === "disambig" && !dabHit) dabHit = { r, via };
      if (r.status === "section-redirect" && !secHit) secHit = { r, via };
    }
    // a disambiguation page: pick the one link that begins with the answer and matches the hints
    if (!entry.title && dabHit) {
      // the links that CONTAIN the answer's words ("Olympia, Greece", "Ancient Corinth"), scored by what they add
      const at = tokens(answer);
      const links = (await dabLinks(dabHit.r.title)).filter((l) => at.length && at.every((w) => tokens(noQual(l)).includes(w)) && !/^List of /.test(l));
      // best score first; on a tie the title that ADDS least ("St. George's, Grenada" over "Saint George Parish, Grenada")
      const scored = links.map((l) => ({ l, s: hintScore(l, c, answer), x: extrasOf(l, answer) })).sort((a, b) => (b.s - a.s) || (a.x - b.x));
      if (scored.length && scored[0].s >= 2 && (scored.length === 1 || scored[0].s > scored[1].s || scored[0].x < scored[1].x)) {
        const r = (await resolve([scored[0].l]))[0];
        if (r && (r.status === "ok" || r.status === "redirect")) Object.assign(entry, { title: r.title, via: "disambiguation", from: dabHit.r.title, status: "disambig-resolved" });
      }
      if (!entry.title) { entry.status = "disambiguation"; entry.from = dabHit.r.title; entry.suggestions = scored.slice(0, 6).map((x) => x.l); }
    }
    if (!entry.title && !dabHit && secHit) { entry.status = "section-redirect"; entry.from = secHit.r.from; entry.target = secHit.r.title + "#" + secHit.r.fragment; }
    // nothing at all: ask search, accept only a title that IS the answer, keep the rest as suggestions
    const at = tokens(answer);
    if (!entry.title && DO_SEARCH && entry.status === "none") {
      const hits = await search(answer + " " + (HINTS[prefixOf(c.id)] || [""])[0]);
      const same = hits && hits.find((h) => norm(noQual(h)) === norm(answer));
      // …or the same words in another order or punctuation ("Throne Room, Knossos" for "Throne Room at Knossos"):
      // taken, but filed as `search-match` so the report shows every one for a glance
      const close = hits && !same && hits.find((h) => { const b = tokens(noQual(h)); return at.length && at.length === b.length && at.every((w) => b.includes(w)) && !BAD_WORD.test(h); });
      if (same || close) {
        const r = (await resolve([same || close]))[0];
        if (r && r.status === "ok") Object.assign(entry, { title: r.title, via: "search", status: same ? "ok" : "search-match" });
      }
      if (!entry.title && hits) entry.suggestions = hits;
    }
    // A redirect INTO an index page ("prefect of Egypt" → "List of governors of Roman Egypt") is not a
    // dedicated article about the term: it is the same case as a section redirect, so no link is recorded
    if (entry.title && LIST_RX.test(entry.title)) { entry.target = entry.title; entry.title = null; entry.status = "list-page"; }
    if (entry.title) entry.url = urlFor(entry.title);
    result.cards[c.id] = entry;
    if (n % 250 === 0) process.stderr.write(`  ${n}/${cards.length} cards decided\n`);
  }
  saveCache();
  // merge with a previous run when this one was partial (--prefix / --card)
  const merged = (PREFIX || ONLY || IDS || isFinite(LIMIT)) ? { ...prev.cards, ...result.cards } : result.cards;
  const counts = {};
  Object.values(merged).forEach((e) => { counts[e.status] = (counts[e.status] || 0) + 1; });
  fs.writeFileSync(OUT, JSON.stringify({ generated: new Date().toISOString().slice(0, 16) + "Z", source: "en.wikipedia.org", counts, cards: merged }, null, 1));
  writeReport(merged, counts);
  console.log(JSON.stringify(counts));
})();

function writeReport(all, counts) {
  const ids = Object.keys(all).sort();
  const total = ids.length;
  const linked = ids.filter((id) => all[id].url).length;
  const line = (id) => { const e = all[id]; return `- \`${id}\` **${e.answer}**`; };
  const sec = (title, status, how) => {
    const rows = ids.filter((id) => all[id].status === status);
    if (!rows.length) return "";
    return `\n## ${title} (${rows.length})\n\n${how}\n\n` + rows.map((id) => {
      const e = all[id];
      if (status === "redirect-broader") return `${line(id)} → [${e.title}](${e.url}) (from \`${e.from}\`)`;
      if (status === "disambig-resolved") return `${line(id)} → [${e.title}](${e.url}) (via the disambiguation page \`${e.from}\`)`;
      if (status === "search-match") return `${line(id)} → [${e.title}](${e.url})`;
      if (status === "disambiguation") return `${line(id)} — \`${e.from}\` is a disambiguation page${e.suggestions && e.suggestions.length ? "; its links: " + e.suggestions.map((s) => `\`${s}\``).join(", ") : ""}`;
      if (status === "list-page") return `${line(id)} — only an index page matched: \`${e.target}\``;
      if (status === "section-redirect") return `${line(id)} — \`${e.from}\` only redirects into \`${e.target}\``;
      return `${line(id)}${e.suggestions && e.suggestions.length ? " — search suggests " + e.suggestions.map((s) => `\`${s}\``).join(", ") : ""}`;
    }).join("\n") + "\n";
  };
  const md = `# Wikipedia links for the cards — the audit

*Generated by \`node .claude/find-wiki-links.js\` on ${new Date().toISOString().slice(0, 10)}. The machine-readable result is
\`.claude/wiki-links.json\`; this file is the part a human has to look at. Re-run the script after adding
cards — it only asks Wikipedia about titles it has not seen.*

Not part of the site.

## What it is for

The "Learn more" box at the foot of a card (Oct 2026, on request: "for cards whose answer term has a
dedicated wikipedia page, at the bottom of the card, below the sources, should be a tile … that the user
can click to be redirected straight to that dedicated wikipedia page") links to the English Wikipedia
article **on the answer term itself**. A Wikipedia article is a destination here, never a source: it is
not counted in the Sources fold and nothing on a card is cited to it.

## How a card was matched

The script's header documents the full method. In short: the glossary key with the answer's name (the
glossary keys its terms on Wikipedia slugs), then the answer text, then its American spelling and
singular, every one resolved through the API with redirects followed; a disambiguation page is settled by
the links on it that match the collection's hint words; Wikipedia search is asked last and its hit is
accepted only when the title IS the answer. Nothing is guessed.

## Counts

| status | cards | meaning |
|---|---:|---|
| \`ok\` | ${counts.ok || 0} | the title is the article |
| \`redirect-variant\` | ${counts["redirect-variant"] || 0} | spelling / plural / qualifier differed; same subject |
| \`disambig-resolved\` | ${counts["disambig-resolved"] || 0} | chosen from a disambiguation page by hint words — listed below |
| \`search-match\` | ${counts["search-match"] || 0} | a search hit with the answer's words in another order — listed below |
| \`redirect-broader\` | ${counts["redirect-broader"] || 0} | redirected to a differently named article — listed below, a glance each |
| \`list-page\` | ${counts["list-page"] || 0} | only a list / timeline / index page matched: no dedicated article, no link |
| \`section-redirect\` | ${counts["section-redirect"] || 0} | only a redirect into a section exists: no dedicated page, no link |
| \`disambiguation\` | ${counts.disambiguation || 0} | only a disambiguation page; no link could be chosen |
| \`none\` | ${counts.none || 0} | nothing matched; no link |

**${linked} of ${total} cards get a link.** The three "no link" rows are the honest state: a card whose
answer is a descriptive phrase ("Palace storerooms and pithoi") has no dedicated article, and the box
simply does not render for it.
${sec("Redirected to a differently named article — check each", "redirect-broader", "The answer redirects to an article with another name. Most are the same subject under Wikipedia's preferred title; a few will be a broader article the term is only a part of. Strike a line here and set that card's entry to `none` in `wiki-links.json` where the target is too broad.")}${sec("Settled from a disambiguation page", "disambig-resolved", "The answer alone is a disambiguation page; the link below was chosen because its qualifier matched the card's own question or the collection's hints.")}${sec("Matched by search — check each", "search-match", "No title was the answer, but one search hit has exactly the answer's words in another order or punctuation.")}${sec("Disambiguation pages that could not be settled", "disambiguation", "Pick the right article by hand, or leave the card without a link.")}${sec("Index pages — no dedicated article", "list-page", "The only match is a list, timeline or index page. Not a dedicated article, so no link; if a better article exists, put its title and URL in the entry and add `\"manual\": true`.")}${sec("Section redirects — no dedicated page", "section-redirect", "Wikipedia treats these as part of another article. No link.")}${sec("No article found", "none", "Search suggestions are listed where Wikipedia returned any; none was accepted automatically because none has the answer as its title.")}`;
  fs.writeFileSync(REPORT, md);
}
