#!/usr/bin/env node
/*
  gloss-wiki.js — which GLOSSARY TERMS have a dedicated English Wikipedia article, and its exact title.
  The glossary popup's "Learn more" tile (glossWikiHTML in app.js) is built from the file this writes.

    node .claude/gloss-wiki.js                     resolve every key not yet in the ledger, then write
    node .claude/gloss-wiki.js --keys=A_b,C_(d)    (re-)resolve just these keys, then write
    node .claude/gloss-wiki.js --refresh           re-ask Wikipedia about EVERY key, then write
    node .claude/gloss-wiki.js --write             offline: rewrite glossary-wiki.js from the ledger
    node .claude/gloss-wiki.js --check             offline: exit 1 when a glossary key has no ledger
                                                   entry, or glossary-wiki.js lags the ledger
    node .claude/gloss-wiki.js --report            offline: counts by status, and every non-link listed
    --max-wait=SECONDS   cap the total time spent waiting out a rate limit (exit 2, progress saved)

  A NEW TERM: add-glossary.js runs `--keys=<slug> --max-wait=30` straight after it writes the term
  (`--no-wiki` skips it), so a term ships with its tile the way a card ships with its own. After a batch
  written any other way, or if that lookup could not reach Wikipedia, run the plain command (no
  arguments): it only asks about the keys the ledger has not seen. Needs the network
  (NODE_USE_ENV_PROXY=1 in a cloud session).

  FILES
    .claude/gloss-wiki.json   THE LEDGER (not shipped): every key → { s: status, t: title when it differs
                              from the key, f: fragment, m: true for a hand decision }. It is the memory
                              that makes a re-run cheap, and the record of why a term has no tile.
    glossary-wiki.js          THE SHIPPED TABLE, generated — never hand-edit. Lazy: it rides the
                              `glossExtra` data bundle beside glossary-extra.js (fetched at idle after
                              boot, awaited by the popup), so it costs the eager path nothing.

  WHY THE SHIPPED FORMAT IS EXCEPTIONS ONLY. Glossary keys ARE Wikipedia slugs (decoded) by rule, so for
  almost every term the article title is simply the key with spaces. The table therefore carries only:
    no   — one "|"-joined string of the keys that get NO tile ("|" can never occur in a Wikipedia title)
    alt  — key → article title, for the keys whose article title is not the key (a same-subject redirect,
           a first-letter normalisation)
  and every other key links to its own slug. Listing the ~10,000 linked keys instead would cost ~15× the
  bytes to say the same thing. The price of that inversion: a key added AFTER the last run is linked to
  its own slug until the next run decides it — which for a key that obeys the slug rule is the right
  link anyway, and `--check` lists every such key so nothing is left undecided.

  WHAT GETS A TILE (status in the ledger):
    ok          the key is an article, no redirect                                 → tile
    redirect    a redirect to the SAME subject: spelling, plural, a qualifier, a
                transliteration, one added word ("Eteocretan" → "Eteocretan
                language") — find-wiki-links.js's sameName rule                    → tile, title = target
    renamed     a redirect to a differently named article that Wikipedia itself
                files as ANOTHER NAME for it — the redirect page's category is
                "Redirects from alternative / former / scientific … names"
                ("Homo sapiens" → "Human", "Corcyra" → "Corfu"); see RC_ALT         → tile, title = target
    broader     any other redirect to a differently named article: one filed as a
                subtopic, member, related topic or "with possibilities", or with
                no redirect category at all ("Late Bronze Age" → "Bronze Age",
                "Inscription" → "Epigraphy")                                       → NO tile
    section     a redirect into a SECTION of another article                       → NO tile
    list        the target is a list, timeline, glossary, index or outline page    → NO tile
    disambig    the key is (or redirects to) a disambiguation page                 → NO tile
    missing     no such page                                                       → NO tile
  A ledger entry with `"m": true` is a human decision and is never recomputed: set `s` to "ok" with a
  `t`, or to "none", then run --write.

  Shares its rules with find-wiki-links.js (the cards' resolver) and reads that script's title cache,
  .claude/wiki-title-cache.json, read-only as a seed so a title it already asked about costs nothing; it
  never writes it (concurrent card adds own that file). A Wikipedia article is a destination, never a
  source. English only. Not part of the site.
*/
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const LEDGER = path.join(__dirname, "gloss-wiki.json");
const SEED = path.join(__dirname, "wiki-title-cache.json");
const OUT = path.join(ROOT, "glossary-wiki.js");
const API = "https://en.wikipedia.org/w/api.php";
const UA = "FolioGlossaryWiki/1.0 (offline data build for a study site) node";

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = /^--([^=]+)(?:=(.*))?$/.exec(a); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true];
}));
const MAX_WAIT_MS = args["max-wait"] ? parseInt(args["max-wait"], 10) * 1000 : Infinity;

/* ---------- name rules (the same as find-wiki-links.js) ---------- */
const deacc = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const norm = (s) => deacc(String(s || "")).toLowerCase().replace(/[_\s]+/g, " ").replace(/^the /, "").replace(/[’'"().,:;!?\-–—]/g, "").replace(/\s+/g, " ").trim();
const noQual = (t) => t.replace(/\s*\([^)]*\)\s*$/, "").replace(/,\s[^,]+$/, "");
const spaced = (k) => k.replace(/_/g, " ").trim();
const canon = (s) => deacc(norm(s)).replace(/\bst\b/g, "saint").replace(/isation/g, "ization").replace(/ise\b/g, "ize").replace(/our/g, "or").replace(/ae/g, "e").replace(/oe/g, "e")
  .replace(/[^a-z0-9 ]/g, "").split(" ").filter(Boolean).map((w) => w.replace(/ies$/, "y").replace(/(ch|sh|x|s)es$/, "$1").replace(/([^s])s$/, "$1")).join(" ");
const translit = (s) => canon(s).replace(/kh|ch/g, "c").replace(/k/g, "c").replace(/ph/g, "f").replace(/th/g, "t").replace(/ai|ei|oi|ae|oe/g, "e").replace(/ou/g, "u").replace(/y/g, "i").replace(/(.)\1/g, "$1").replace(/[aeiou]+/g, "a");
// a redirect's two ends name the same subject — find-wiki-links.js's sameName, plus three cases the
// glossary has and the cards rarely do: the same letters spaced or hyphenated otherwise ("Al Mina" →
// "Al-Mina", "Baosi" → "Bao Si"), a "the" inside the name ("Battle of the Ticinus" → "Battle of Ticinus"),
// and a key that adds only one generic word the target drops ("Hadza people" → "Hadza", "Cenozoic Era" →
// "Cenozoic", "Battle of the Aegates Islands" → "Battle of the Aegates")
const GENERIC = new Set(["people", "language", "culture", "tribe", "dynasty", "era", "epoch", "period", "site", "island"]);
function sameName(a, b) {
  const ca = canon(noQual(a)).replace(/\bthe /g, ""), cb = canon(noQual(b)).replace(/\bthe /g, "");
  if (ca === cb || translit(ca) === translit(cb) || ca.replace(/ /g, "") === cb.replace(/ /g, "")) return true;
  const head = (s) => s.split(/ (of|at|in|on|from) /)[0];
  if (canon(head(noQual(a))) === cb || ca === canon(head(noQual(b)))) return true;
  const ta = new Set(ca.split(" ")), tb = new Set(cb.split(" "));
  const extra = [...tb].filter((w) => !ta.has(w)), missing = [...ta].filter((w) => !tb.has(w));
  if (missing.length === 0 && extra.length <= 1) return true;
  return extra.length === 0 && missing.length === 1 && GENERIC.has(missing[0]) && tb.size >= 1;
}
const LIST_RX = /^(List|Lists|Timeline|Glossary|Index|Outline) of /i;
const LINKED = new Set(["ok", "redirect", "renamed"]);

/* ---------- Wikipedia (the two channels of find-wiki-links.js) ---------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let waitedMs = 0, lastCall = 0, apiCooldownUntil = 0;
let ledger = {};
const saveLedger = () => {
  const sorted = {}; Object.keys(ledger).sort().forEach((k) => { sorted[k] = ledger[k]; });
  fs.writeFileSync(LEDGER, "{\n" + Object.keys(sorted).map((k) => JSON.stringify(k) + ":" + JSON.stringify(sorted[k])).join(",\n") + "\n}\n");
};
async function backoff(ms) {
  waitedMs += ms;
  if (waitedMs > MAX_WAIT_MS) { saveLedger(); console.error("Wikipedia did not answer within --max-wait; progress is saved. Run: node .claude/gloss-wiki.js"); process.exit(2); }
  await sleep(ms);
}
async function paced() { const gap = 250 - (Date.now() - lastCall); if (gap > 0) await sleep(gap); lastCall = Date.now(); }
async function api(params) {
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
      if (++limited >= 2) { apiCooldownUntil = Date.now() + 10 * 60 * 1000; process.stderr.write("  API rate-limited twice; using raw wikitext for 10 min\n"); return null; }
      const ra = Math.min(60, parseInt(res.headers.get("retry-after") || "20", 10) || 20);
      await backoff(ra * 1000 + 500); continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${u}`);
    return res.json();
  }
  return null;
}
const DAB_RX = /\{\{\s*(disambiguation|disambig|dab|disamb|dmbox|hndis|geodis|numberdis|surname|given name|set index article|sia|ship index|shipindex|mountainindex|roadindex|place name disambiguation|human name disambiguation|first name|nickname)\s*[|}]/i;
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
async function rawText(title) {
  const u = "https://en.wikipedia.org/w/index.php?title=" + encodeURIComponent(title.replace(/ /g, "_")) + "&action=raw";
  for (let attempt = 0; attempt < 6; attempt++) {
    await paced();
    let res;
    try { res = await fetch(u, { headers: { "User-Agent": UA } }); }
    catch (e) { await backoff(3000 * (attempt + 1)); continue; }
    if (res.status === 404) return null;
    if (res.status === 429 || res.status === 503) { await backoff(Math.min(60, parseInt(res.headers.get("retry-after") || "20", 10) || 20) * 1000 + 500); continue; }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${u}`);
    return res.text();
  }
  saveLedger(); console.error("Wikipedia would not lift its rate limit; progress is saved — run again later."); process.exit(2);
}
// the cards' cache shape: { status: ok|redirect|section-redirect|disambig|missing, title, from, fragment }
async function resolveRaw(t) {
  let cur = cap(t), hops = 0, fragment = "";
  for (;;) {
    const body = await rawText(cur);
    if (body == null) return { status: "missing", title: t };
    const m = /^\s*#\s*REDIRECT\s*:?\s*\[\[([^\]|#]+)(?:#([^\]|]*))?/i.exec(body);
    if (m && hops < 5) { cur = cap(m[1].replace(/_/g, " ").trim()); if (m[2]) fragment = m[2].trim(); hops++; continue; }
    if (DAB_RX.test(body) || /may (also )?refer to:/i.test(body.slice(0, 3000))) return { status: "disambig", title: cur };
    if (hops && fragment) return { status: "section-redirect", title: cur, fragment };
    return { status: hops ? "redirect" : "ok", title: cur };
  }
}
async function resolveBatch(titles) {
  const out = {};
  const data = await api({ action: "query", prop: "pageprops", ppprop: "disambiguation", redirects: 1, titles: titles.join("|") });
  if (!data) { for (const t of titles) out[t] = await resolveRaw(t); return out; }
  const q = data.query || {};
  const normMap = {}; (q.normalized || []).forEach((n) => { normMap[n.from] = n.to; });
  const redir = {}; (q.redirects || []).forEach((r) => { redir[r.from] = r; });
  const pages = {}; (q.pages || []).forEach((p) => { pages[p.title] = p; });
  for (const t of titles) {
    let cur = normMap[t] || t, hops = 0, fragment = "";
    while (redir[cur] && hops < 5) { fragment = redir[cur].tofragment || fragment; cur = redir[cur].to; hops++; }
    const p = pages[cur];
    if (!p || p.missing || p.invalid) out[t] = { status: "missing", title: t };
    else if (p.pageprops && "disambiguation" in p.pageprops) out[t] = { status: "disambig", title: p.title };
    else if (hops && fragment) out[t] = { status: "section-redirect", title: p.title, fragment };
    else out[t] = { status: hops ? "redirect" : "ok", title: p.title };
  }
  return out;
}
/* A redirect to a differently named article is the same subject only when Wikipedia's own editors say so:
   the redirect PAGE carries a redirect category ("rcat"), {{R from alternative name}}, {{R from scientific
   name}}, {{R from former name}}… → "Redirects from alternative names", and so on. One that says the key is
   a PART or a NEIGHBOUR of the target ({{R from subtopic}}, {{R to related topic}}, {{R from member}},
   {{R with possibilities}} — "could have its own article") is not, and neither is a redirect with no rcat
   at all: nothing then vouches for it. Asked of the redirect page itself (no `redirects=1`). */
const RC_ALT = /Redirects from (alternative|alternate|other|former|historic|ancient|modern|short|long|full|scientific|common|plurals?|modifications|ASCII|titles with(out)? diacritics|transliterations|romanizations|[\w -]+-language terms|synonyms|moves|birth names|personal names|names with titles|abbreviations|acronyms|initialisms|unnecessary disambiguation|incorrect names|misspellings|[\w ]*spellings|non-English|[\w ]*names)/i;
const RC_SUB = /Redirects (from|to) (subtopics|members|related|broader|list|lists|sections|embedded anchors|merges|meronyms|holonyms)|Redirects with possibilities|Redirects to (a )?(related|list|section)/i;
const RC_RAW_ALT = /\{\{\s*R(edirect)? (from )?(title with|alternative|alternate|other|former|historic|ancient|modern|short|long|full|scientific|common|plural|modification|ASCII|diacritic|transliteration|romani[sz]ation|synonym|move|birth name|personal name|name with title|abbreviation|acronym|initialism|unnecessary disambiguation|incorrect name|misspelling|alternative spelling|alternative language|[\w ]*language)/i;
const RC_RAW_SUB = /\{\{\s*R(edirect)? (from |to |with )?(subtopic|member|related|broader|list|section|anchor|merge|possibilities|meronym|holonym)/i;
function rcOf(cats) {
  if (cats.some((c) => RC_SUB.test(c))) return "sub";
  return cats.some((c) => RC_ALT.test(c)) ? "alt" : "none";
}
async function rcatPass(keys) {
  for (let i = 0; i < keys.length; i += 50) {
    const batch = keys.slice(i, i + 50), titles = batch.map(spaced);
    const cats = {}; titles.forEach((t) => { cats[t] = []; });
    let ok = true, cont = {};
    for (let guard = 0; guard < 10; guard++) {
      const data = await api({ action: "query", prop: "categories", clshow: "hidden", cllimit: "max", titles: titles.join("|"), ...cont });
      if (!data) { ok = false; break; }
      const q = data.query || {};
      const normMap = {}; (q.normalized || []).forEach((n) => { normMap[n.to] = n.from; });
      (q.pages || []).forEach((p) => { const t = normMap[p.title] || p.title; if (cats[t]) (p.categories || []).forEach((c) => cats[t].push(c.title)); });
      if (!data.continue) break;
      cont = data.continue;
    }
    for (const k of batch) {
      if (ok) ledger[k].rc = rcOf(cats[spaced(k)]);
      else {
        const body = (await rawText(spaced(k))) || "";
        ledger[k].rc = RC_RAW_SUB.test(body) ? "sub" : RC_RAW_ALT.test(body) ? "alt" : "none";
      }
      if (ledger[k].rc === "alt") ledger[k].s = "renamed";
    }
    saveLedger();
  }
}
// a resolved title → the ledger's entry for a key
function decide(key, r) {
  const sp = spaced(key);
  let s;
  if (r.status === "missing") s = "missing";
  else if (r.status === "disambig") s = "disambig";
  else if (r.status === "section-redirect") s = "section";
  else if (LIST_RX.test(r.title)) s = "list";
  else if (r.status === "ok") s = "ok";
  else s = sameName(sp, r.title) ? "redirect" : "broader";
  const e = { s };
  if (r.title && r.title !== sp && s !== "missing") e.t = r.title;
  if (r.fragment) e.f = r.fragment;
  return e;
}

/* ---------- the shipped table ---------- */
function shippedText(keys) {
  const no = [], alt = {};
  for (const k of keys) {
    const e = ledger[k];
    if (!e) continue;   // not yet decided: links to its own slug until a run decides it (see the header)
    if (!LINKED.has(e.s)) { no.push(k); continue; }
    if (e.t && e.t !== spaced(k)) alt[k] = e.t;
  }
  return "/* GENERATED by .claude/gloss-wiki.js — do not hand-edit. Which glossary terms have a dedicated English\n" +
    "   Wikipedia article (the \"Learn more\" tile at the foot of a gloss popup, glossWikiHTML in app.js). EXCEPTIONS\n" +
    "   ONLY: every key links to its own slug unless it is in `no` (\"|\"-joined: no dedicated article) or has an\n" +
    "   `alt` title. Lazy — rides the glossExtra bundle. Source: en.wikipedia.org. */\n" +
    "window.GLOSSARY_WIKI = {\n\"no\": " + JSON.stringify(no.sort().join("|")) + ",\n\"alt\": {\n" +
    Object.keys(alt).sort().map((k) => JSON.stringify(k) + ": " + JSON.stringify(alt[k])).join(",\n") + "\n}\n};\n";
}

(async () => {
  global.window = global.window || {};
  require(path.join(ROOT, "glossary.js"));
  const keys = Object.keys(window.GLOSSARY || {});
  if (fs.existsSync(LEDGER)) ledger = JSON.parse(fs.readFileSync(LEDGER, "utf8"));

  if (args.check) {
    const undecided = keys.filter((k) => !ledger[k]);
    const stale = !fs.existsSync(OUT) || fs.readFileSync(OUT, "utf8") !== shippedText(keys);
    if (undecided.length) console.error(`${undecided.length} glossary key(s) not yet checked against Wikipedia: ${undecided.slice(0, 20).join(", ")}${undecided.length > 20 ? " …" : ""}`);
    if (stale) console.error("glossary-wiki.js lags the ledger.");
    if (undecided.length || stale) { console.error("Run: NODE_USE_ENV_PROXY=1 node .claude/gloss-wiki.js"); process.exit(1); }
    console.log(`gloss-wiki: ${keys.length} keys decided, glossary-wiki.js current.`); return;
  }
  if (args.report) {
    const by = {};
    for (const k of keys) { const s = ledger[k] ? ledger[k].s : "undecided"; (by[s] = by[s] || []).push(k); }
    for (const s of Object.keys(by).sort()) {
      console.log(`${s}: ${by[s].length}`);
      if (!LINKED.has(s)) by[s].forEach((k) => console.log("   " + k + (ledger[k] && ledger[k].t ? " → " + ledger[k].t + (ledger[k].f ? "#" + ledger[k].f : "") : "")));
    }
    return;
  }
  /* the name rule may have grown since an entry was decided: re-test every broader redirect offline (a
     human decision, `m`, excepted) — cheap, and it keeps the ledger equal to what a fresh run would say */
  if (!args.check && !args.report) for (const k of Object.keys(ledger)) { const e = ledger[k]; if (e.s === "broader" && !e.m && e.t && sameName(spaced(k), e.t)) { e.s = "redirect"; delete e.rc; } }
  if (args.write) saveLedger();
  if (!args.write) {
    let want;
    if (args.keys) want = String(args.keys).split(",").map((x) => x.trim()).filter((k) => k in window.GLOSSARY);
    else if (args.refresh) want = keys.slice();
    else want = keys.filter((k) => !ledger[k]);
    want = want.filter((k) => !(ledger[k] && ledger[k].m));
    // the cards' title cache answers what it already knows (never on --refresh or for named keys)
    let seed = {};
    if (!args.refresh && !args.keys && fs.existsSync(SEED)) { try { seed = JSON.parse(fs.readFileSync(SEED, "utf8")); } catch (e) { seed = {}; } }
    const ask = [];
    let seeded = 0;
    for (const k of want) {
      const r = seed[spaced(k)];
      if (r && r.status) { ledger[k] = decide(k, r); seeded++; } else ask.push(k);
    }
    process.stderr.write(`${want.length} key(s) to decide: ${seeded} from the cards' title cache, ${ask.length} to ask Wikipedia\n`);
    for (let i = 0; i < ask.length; i += 50) {
      const batch = ask.slice(i, i + 50);
      const res = await resolveBatch(batch.map(spaced));
      batch.forEach((k) => { ledger[k] = decide(k, res[spaced(k)]); });
      if (i % 1000 === 0) { saveLedger(); process.stderr.write(`  ${Math.min(i + 50, ask.length)}/${ask.length}\n`); }
    }
    // a key that left the glossary leaves the ledger
    const live = new Set(keys);
    if (!args.keys) Object.keys(ledger).forEach((k) => { if (!live.has(k)) delete ledger[k]; });
    saveLedger();
    // every broader redirect not yet asked about: does Wikipedia file it as another name for the same subject?
    const pend = Object.keys(ledger).filter((k) => live.has(k) && ledger[k].s === "broader" && !ledger[k].rc && !ledger[k].m);
    if (pend.length) { process.stderr.write(`${pend.length} redirect(s) to a differently named article: reading their redirect categories\n`); await rcatPass(pend); }
    if (args.keys) want.forEach((k) => { const e = ledger[k]; console.log(`  ${k}: ${LINKED.has(e.s) ? "Learn-more tile → " + (e.t || spaced(k)) : "no tile (" + e.s + (e.t ? " → " + e.t + (e.f ? "#" + e.f : "") : "") + ")"}`); });
  }
  fs.writeFileSync(OUT, shippedText(keys));
  const counts = {};
  keys.forEach((k) => { const s = ledger[k] ? ledger[k].s : "undecided"; counts[s] = (counts[s] || 0) + 1; });
  console.log("gloss-wiki: " + JSON.stringify(counts) + " → glossary-wiki.js " + fs.statSync(OUT).size + " bytes");
})().catch((e) => { try { saveLedger(); } catch (_) {} console.error(e.stack || e.message); process.exit(1); });
