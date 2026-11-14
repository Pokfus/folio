#!/usr/bin/env node
/*
  Fills missing glossary date lines (window.GLOSSARY_DATES) from Wikidata — written Nov 2026 for the
  owner's request "many glossary terms without starting/ending or birth/death dates could reasonably
  have them; you may take these from Wikipedia".

    NODE_USE_ENV_PROXY=1 node .claude/fill-gloss-dates.js --cache=<dir> [--out=<batch.json>] [--report=<tsv>]

  then review the report and apply the batch with the existing patcher:

    node .claude/fix-gloss-date.js <batch.json>

  WHAT IT DOES. For every glossary key with NO date line, the key (a decoded enwiki slug) is looked up on
  query.wikidata.org by its enwiki sitelink title (Wikipedia's Action and REST APIs are rate-limited from
  the proxy; SPARQL and index.php?action=raw are not). A key with no sitelink is read as raw wikitext: a
  "#REDIRECT [[Target]]" is followed to Target's item, a redirect to a section is not used, and every
  redirect must be reviewed and listed in fill-gloss-dates-classes.json `acceptRedirects` (a slug can
  redirect to something broader than itself). Responses are cached in --cache (keep it OUT of the repo).
  A disambiguation item is skipped. Then, by kind:

    person    P31 = Q5                     P569 / P570   ->  "1834–1913", "c. 106 – 48 BCE", "b. 1942", "d. 1616"
    event     battles, wars, treaties …    P580/P582, else P571/P576, else P585  ->  "1944", "1941–1945"
    polity    historical states, dynasties, colonies, periods: BOTH ends needed  ->  "1581–1795"
    org       organisations, agencies, units, museums: "1916–2012", or "founded 1945" with no end
    building  temples, palaces, bridges, walls: "179 BCE – 410 CE", or "built 509 BCE" with no end

  The classes are listed by QID in fill-gloss-dates-classes.json `kinds` (curated by hand from the classes
  the undated terms actually had); an item that is also a present-day country/city (`places`) is never
  dated unless it is an event. Anything else (concepts, places, peoples, features, species, works …) is
  skipped. `reject` lists results read against the articles and refused, with the reason.

  RULES (no fabrication). Only year- or decade-precision values are used (century or coarser is skipped).
  Deprecated statements are ignored; preferred rank wins; two different years for one property skip the
  term. A statement qualified "circa" (P1480 = Q5727902) gets "c. "; any other sourcing circumstance
  (possibly, presumably, disputed …) drops the statement. Years only — never a day. WDQS returns XSD
  years, where year 0 is 1 BCE (Socrates "-0469" = 470 BCE, Julius Caesar "-0099" = 100 BCE); a Julian
  day-precision date within a fortnight of New Year is dropped, since WDQS's Gregorian conversion can move
  its year. A decade is written "1930s", CE only. An ancient birth (before 500 CE) and a BCE polity's start
  are always written "c.", since Wikidata often states an estimate bare. A living person (born 1900 or
  later, no death) gets "b. YYYY"; a death with no birth "d. YYYY".

  FORMAT follows the existing entries: CE-only ranges unspaced with no era ("1834–1913"), except before
  1000 CE where the era is written and the dash spaced ("421 – 478 CE"); BCE spaced ("384 – 322 BCE");
  across the eras "59 BCE – 17 CE"; a single year "1916" / "196 BCE" / "604 CE"; circa per end,
  "c. 84 – c. 54 BCE".
*/
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const GLOSS = path.join(ROOT, "glossary.js");
const arg = (n, d) => { const a = process.argv.find((s) => s.startsWith("--" + n + "=")); return a ? a.slice(n.length + 3) : d; };
const CACHE = arg("cache");
if (!CACHE) { console.error("usage: node .claude/fill-gloss-dates.js --cache=<dir outside the repo> [--out=batch.json] [--report=report.tsv]"); process.exit(1); }
fs.mkdirSync(CACHE, { recursive: true });
const OUT = arg("out", path.join(CACHE, "batch.json"));
const REPORT = arg("report", path.join(CACHE, "report.tsv"));

const win = {};
new Function("window", fs.readFileSync(GLOSS, "utf8"))(win);
const TERMS = win.GLOSSARY || {}, DATES = win.GLOSSARY_DATES || {};
const keys = Object.keys(TERMS).filter((k) => !(k in DATES));

// ---- classes whose dates are reasonable to show (curated by hand from the classes the candidates had) ----
// value: which date properties to read ("span" = P580/P582 then P571/P576 then P585)
const CLASSES = require("./fill-gloss-dates-classes.json");
const WHITELIST = CLASSES.kinds;                 // class QID -> "event" | "polity" | "org" | "building"
const PLACES = new Set(Object.keys(CLASSES.places)); // a present-day country / city / region: never dated, even if also an org
// a slug that is a REDIRECT dates its target, which may be broader than the term (a battle redirecting to its
// war): only redirects reviewed by hand and listed here, slug -> target title, are used
const ACCEPT_REDIRECTS = CLASSES.acceptRedirects || {};
// results read against the Wikipedia articles and refused (slug -> reason): legendary dates, a start year for
// something ongoing, approximate dates Wikidata states as exact, values the article contradicts
const REJECT = CLASSES.reject || {};
const PRIORITY = ["event", "polity", "org", "building"];
function kindOf(cls) {
  if ("Q5" in cls) return "person";
  const ks = Object.keys(cls).map((q) => WHITELIST[q]).filter(Boolean);
  if (!ks.length) return null;
  const best = PRIORITY.find((k) => ks.includes(k));
  if (best !== "event" && Object.keys(cls).some((q) => PLACES.has(q))) return null;
  return best;
}

const SPARQL = "https://query.wikidata.org/sparql";
const UA = "FolioGlossaryDates/1.0 (offline data tool)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function sparql(q, cacheName) {
  const f = path.join(CACHE, cacheName);
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, "utf8"));
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(SPARQL, { method: "POST", headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded", Accept: "application/sparql-results+json" }, body: "query=" + encodeURIComponent(q) });
    if (res.ok) { const j = await res.json(); fs.writeFileSync(f, JSON.stringify(j)); return j; }
    console.error("  " + cacheName + ": HTTP " + res.status + ", retrying");
    await sleep(5000 * (attempt + 1));
  }
  throw new Error("SPARQL failed for " + cacheName);
}
const lit = (t) => JSON.stringify(t) + "@en";
const Q = (iri) => iri.replace("http://www.wikidata.org/entity/", "");

async function main() {
  const B = 150, rows = { items: {}, classes: {}, times: [], redirects: {} };
  // 1. slug -> item, by the enwiki sitelink title
  for (let i = 0; i < keys.length; i += B) {
    const chunk = keys.slice(i, i + B), vals = chunk.map((k) => lit(k.replace(/_/g, " "))).join(" ");
    const a = await sparql(`SELECT ?title ?item WHERE { VALUES ?title { ${vals} } ?art schema:name ?title; schema:isPartOf <https://en.wikipedia.org/>; schema:about ?item. }`, "title-" + String(i / B).padStart(3, "0") + ".json");
    for (const b of a.results.bindings) rows.items[b.title.value] = Q(b.item.value);
    process.stderr.write("\r  titles " + Math.min(i + B, keys.length) + " / " + keys.length);
  }
  process.stderr.write("\n");
  // 2. a slug with no sitelink is usually a redirect. Wikipedia's Action and REST APIs are rate-limited from
  //    the proxy, but a page's raw wikitext (index.php?action=raw) is not: it says "#REDIRECT [[Target]]"
  //    without following it. A redirect to a SECTION ("Target#Part") names something narrower than the
  //    article and is not used; the target's item comes from WDQS by its title, like step 1.
  const rawFile = path.join(CACHE, "raw.json");
  const raw = fs.existsSync(rawFile) ? JSON.parse(fs.readFileSync(rawFile, "utf8")) : {};
  const missing = keys.map((k) => k.replace(/_/g, " ")).filter((t) => !rows.items[t]);
  let n = 0;
  for (const t of missing) {
    if (!(t in raw) || raw[t].error) {
      let rec = null;
      for (let attempt = 0; attempt < 3 && !rec; attempt++) {
        const res = await fetch("https://en.wikipedia.org/w/index.php?action=raw&title=" + encodeURIComponent(t.replace(/ /g, "_")), { headers: { "User-Agent": UA } });
        if (res.status === 404) rec = { missing: true };
        else if (res.ok) {
          const txt = await res.text(), m = /^\s*#redirect\s*:?\s*\[\[([^\]|]+)/i.exec(txt);
          if (m) rec = { target: m[1].trim() };
          else rec = { article: true, dab: /\{\{\s*(disambiguation|disambig|dab|hndis|geodis|surname|given name)\b/i.test(txt) };
        } else await sleep(2000 * (attempt + 1));
      }
      raw[t] = rec || { error: true };
      if (++n % 25 === 0) fs.writeFileSync(rawFile, JSON.stringify(raw));
      await sleep(120);
    }
    process.stderr.write("\r  redirects " + (missing.indexOf(t) + 1) + " / " + missing.length);
  }
  fs.writeFileSync(rawFile, JSON.stringify(raw));
  process.stderr.write("\n");
  const norm = (s) => { s = s.replace(/_/g, " ").replace(/\s+/g, " ").trim(); return s.charAt(0).toUpperCase() + s.slice(1); };
  const targets = {};
  for (const t of missing) {
    const r = raw[t];
    if (!r || !r.target) continue;
    if (r.target.includes("#")) { rows.redirects[t] = { title: r.target, section: true }; continue; }
    targets[t] = norm(r.target);
  }
  const tl = [...new Set(Object.values(targets))].sort();
  const titem = {};
  for (let i = 0; i < tl.length; i += B) {
    const a = await sparql(`SELECT ?title ?item WHERE { VALUES ?title { ${tl.slice(i, i + B).map(lit).join(" ")} } ?art schema:name ?title; schema:isPartOf <https://en.wikipedia.org/>; schema:about ?item. }`, "target-" + String(i / B).padStart(3, "0") + "-" + tl.length + ".json");
    for (const b of a.results.bindings) titem[b.title.value] = Q(b.item.value);
  }
  for (const [t, tt] of Object.entries(targets)) { rows.redirects[t] = { title: tt }; if (titem[tt]) rows.items[t] = titem[tt]; }
  // 3. classes and dates, by item
  const items = [...new Set(Object.values(rows.items))].sort();
  for (let i = 0; i < items.length; i += B) {
    const vals = items.slice(i, i + B).map((q) => "wd:" + q).join(" "), tag = String(i / B).padStart(3, "0");
    const a = await sparql(`SELECT ?item ?cls ?clsLabel WHERE { VALUES ?item { ${vals} } ?item wdt:P31 ?cls. OPTIONAL { ?cls rdfs:label ?clsLabel. FILTER(LANG(?clsLabel)="en") } }`, "icls-" + tag + ".json");
    for (const b of a.results.bindings) (rows.classes[Q(b.item.value)] = rows.classes[Q(b.item.value)] || {})[Q(b.cls.value)] = b.clsLabel ? b.clsLabel.value : "";
    const t2 = await sparql(`SELECT ?item ?p ?time ?prec ?cal ?rank ?sc WHERE { VALUES ?item { ${vals} } VALUES (?p ?pp ?psv) { ("P569" p:P569 psv:P569) ("P570" p:P570 psv:P570) ("P571" p:P571 psv:P571) ("P576" p:P576 psv:P576) ("P580" p:P580 psv:P580) ("P582" p:P582 psv:P582) ("P585" p:P585 psv:P585) } ?item ?pp ?st. ?st ?psv ?v; wikibase:rank ?rank. ?v wikibase:timeValue ?time; wikibase:timePrecision ?prec; wikibase:timeCalendarModel ?cal. OPTIONAL { ?st pq:P1480 ?sc } }`, "itime-" + tag + ".json");
    for (const b of t2.results.bindings) rows.times.push({ item: Q(b.item.value), p: b.p.value, time: b.time.value, prec: +b.prec.value, julian: Q(b.cal.value) === "Q1985786", rank: b.rank.value.replace("http://wikiba.se/ontology#", ""), sc: b.sc ? Q(b.sc.value) : null });
    process.stderr.write("\r  items " + Math.min(i + B, items.length) + " / " + items.length);
  }
  process.stderr.write("\n");
  return rows;
}

// ---- formatting -----------------------------------------------------------------------------------------
// WDQS returns XSD 1.1 years, where year 0 is 1 BCE: Socrates "-0469" = 470 BCE, Julius Caesar "-0099" =
// 100 BCE (the entity JSON says -0470 / -0100). So `y` below is astronomical: y <= 0 means (1 - y) BCE.
function yearOf(t) {
  const m = /^([+-]?)(\d+)-(\d\d)-(\d\d)/.exec(t.time);
  if (!m) return null;
  return { y: (m[1] === "-" ? -1 : 1) * +m[2], md: m[3] + m[4] };
}
const CIRCA = "Q5727902";
// one year (or CE decade) for an item + property, or { skip: reason }, or null when there is no statement
function pick(times, item, p) {
  let st = times.filter((t) => t.item === item && t.p === p && t.rank !== "DeprecatedRank");
  if (!st.length) return null;
  if (st.some((t) => t.rank === "PreferredRank")) st = st.filter((t) => t.rank === "PreferredRank");
  st = st.filter((t) => !t.sc || t.sc === CIRCA);        // possibly / presumably / disputed … -> not used
  if (!st.length) return { skip: "uncertain" };
  const vals = new Map();
  let calendar = false;
  for (const t of st) {
    if (t.prec < 8) continue;                            // century or coarser
    const o = yearOf(t); if (!o) continue;
    // WDQS converts a Julian day to Gregorian; within a fortnight of New Year that can move the year
    if (t.julian && t.prec >= 10 && (o.md >= "1218" || o.md <= "0114")) { calendar = true; continue; }
    const decade = t.prec === 8, y = decade ? Math.floor(o.y / 10) * 10 : o.y;
    const k = (decade ? "d" : "y") + y;
    const prev = vals.get(k) || { y, decade, circa: false };
    if (t.sc === CIRCA) prev.circa = true;
    vals.set(k, prev);
  }
  if (!vals.size) return { skip: calendar ? "calendar" : "coarse" };
  const ys = [...vals.values()], years = ys.filter((v) => !v.decade);
  if (years.length > 1) return { skip: "conflict" };
  if (years.length === 1) {                              // a year and a decade: they must agree
    const y = years[0];
    if (ys.some((v) => v.decade && Math.floor(y.y / 10) * 10 !== v.y)) return { skip: "conflict" };
    return y;
  }
  if (ys.length > 1) return { skip: "conflict" };
  return ys[0];
}
const bce = (v) => v.y <= 0;
const num = (v) => (v.decade ? v.y + "s" : String(bce(v) ? 1 - v.y : v.y));
const c = (v) => (v.circa ? "c. " : "");
const ok = (v) => v && !v.skip;
function single(v) {
  if (v.decade && v.y < 1000) return null;               // decades only for CE years with four digits
  if (bce(v)) return c(v) + num(v) + " BCE";
  if (v.y < 1000) return c(v) + num(v) + " CE";
  return c(v) + num(v);
}
function range(a, b) {
  if ((a.decade && a.y < 1000) || (b.decade && b.y < 1000)) return null;
  if (bce(a) && bce(b)) return c(a) + num(a) + " – " + c(b) + num(b) + " BCE";
  if (bce(a)) return c(a) + num(a) + " BCE – " + c(b) + num(b) + " CE";
  if (a.y < 1000 && b.y < 1000) return c(a) + num(a) + " – " + c(b) + num(b) + " CE";
  if (a.y < 1000) return c(a) + num(a) + " CE – " + c(b) + num(b);
  return c(a) + num(a) + "–" + c(b) + num(b);
}
function span(s, e) {
  if (s.y > e.y) return null;
  if (s.y === e.y && s.decade === e.decade && s.circa === e.circa) return single(s);
  return range(s, e);
}
const why = (...vs) => vs.map((v) => v && v.skip).find(Boolean) || "no usable dates";

function format(kind, times, item) {
  if (kind === "person") {
    const b = pick(times, item, "P569"), d = pick(times, item, "P570");
    if (ok(b) && b.y < 500) b.circa = true;      // an ancient birth year is an estimate even when Wikidata omits "circa"
    if (ok(b) && ok(d)) return b.y < d.y ? { v: range(b, d) } : { skip: "birth not before death" };
    if (ok(b) && !d) return b.y >= 1900 && !b.decade ? { v: "b. " + single(b) } : { skip: "birth only, before 1900" };
    if (ok(d) && !b) { const s = single(d); return s ? { v: "d. " + s } : { skip: "coarse" }; }
    return { skip: why(b, d) };
  }
  for (const [ps, pe] of [["P580", "P582"], ["P571", "P576"]]) {
    const s = pick(times, item, ps), e = pick(times, item, pe);
    if (!s && !e) continue;
    if (kind === "polity" && ok(s) && s.y <= 0) s.circa = true;   // a BCE polity's or period's start is a scholarly estimate
    if (ok(s) && ok(e)) { const v = span(s, e); return v ? { v } : { skip: "start after end" }; }
    if (ok(s) && !e) {
      if (kind === "event") return { v: single(s) };                  // a one-off event dated by its start
      if (kind === "org") return single(s) ? { v: "founded " + single(s) } : { skip: "coarse" };
      if (kind === "building") return single(s) ? { v: "built " + single(s) } : { skip: "coarse" };
      return { skip: "start only" };                                  // a polity or period needs both ends
    }
    return { skip: ok(e) ? "end only" : why(s, e) };
  }
  if (kind === "event") { const p = pick(times, item, "P585"); if (ok(p)) return { v: single(p) }; if (p) return { skip: p.skip }; }
  return { skip: "no usable dates" };
}

(async () => {
  const rows = await main();
  const batch = { dates: {} }, report = [], skips = {}, kinds = {};
  const bump = (o, k) => (o[k] = (o[k] || 0) + 1);
  for (const k of keys) {
    const t = k.replace(/_/g, " "), item = rows.items[t];
    const red0 = rows.redirects[t];
    if (!item) { bump(skips, red0 && red0.section ? "redirect to a section" : "no Wikidata item for the slug"); continue; }
    const cls = rows.classes[item] || {};
    if ("Q4167410" in cls) { bump(skips, "disambiguation"); continue; }
    const kind = kindOf(cls);
    const hasTime = rows.times.some((x) => x.item === item);
    if (!kind) { bump(skips, hasTime ? "class not dated (concept/place/work…)" : "no dates on Wikidata"); report.push([k, item, "-", Object.values(cls).join("; "), "", "class"]); continue; }
    const r = format(kind, rows.times, item);
    if (r.skip || !r.v) { bump(skips, kind + ": " + (r.skip || "unformattable")); report.push([k, item, kind, Object.values(cls).join("; "), "", r.skip || "?"]); continue; }
    if (REJECT[k]) { bump(skips, "reviewed and rejected: " + REJECT[k]); report.push([k, item, kind, Object.values(cls).join("; "), r.v, "REJECTED"]); continue; }
    const red = rows.redirects[t];
    if (red && !(ACCEPT_REDIRECTS[k] === red.title)) { bump(skips, "redirect, not reviewed"); report.push([k, item, kind, Object.values(cls).join("; "), r.v, "REDIRECT -> " + red.title]); continue; }
    batch.dates[k] = { to: r.v }; bump(kinds, kind);
    report.push([k, item, kind, Object.values(cls).join("; "), r.v, "OK" + (red ? " (via " + red.title + ")" : "")]);
  }
  fs.writeFileSync(OUT, JSON.stringify(batch, null, 1));
  fs.writeFileSync(REPORT, report.map((r) => r.join("\t")).join("\n") + "\n");
  console.log("candidates (undated keys): " + keys.length);
  console.log("dated by kind:", kinds);
  console.log("skipped:", skips);
  console.log("batch -> " + OUT + "\nreport -> " + REPORT);
})().catch((e) => { console.error(e); process.exit(1); });
