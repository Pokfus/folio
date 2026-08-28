#!/usr/bin/env node
/*
  check-citations.js — every citation's AUTHOR NAMES and YEAR, checked against Crossref.

    node .claude/check-citations.js [--prefix=wh-] [--card=wh-249] [--term=Fu_Hao]
                                   [--artefacts] [--all] [--verbose] [--refresh]

  Exit 1 on any mismatch, so it can guard a batch the way check-style.js does.
  Needs the network; with none it says so and exits 0 rather than failing a build
  for a fact it could not check.

  WHY IT EXISTS, which is the whole point of committing it.

  Europe PMC — the way into most of the paywalled literature from here — returns
  author lists as INITIALS: "Liu C, Sainsbury V", "Ding K, Li S, Ding A, Lu H".
  A Chicago note wants full given names, and expanding those initials by hand
  produces names that read perfectly and are wrong: Chunlin Liu for Cheng Liu,
  Vanessa Sainsbury for Victoria Sainsbury, Shuo Li for Siyang Li, Huayu Lu for
  Houyuan Lu.  In Aug 2026 EIGHT citations shipped that way across four cards and
  two glossary terms before anyone looked, and the same fault was caught in draft
  three more times in the same week.  A DOI composed from the shape of a
  publisher's identifier (s41598-020-75038-0 for the real s41598-020-75920-x)
  fails the same way and is caught here too, since Crossref simply has no record.

  NOTHING ELSE IN THE PIPELINE CAN SEE THIS.  `add-card.js` checks that a citation
  ENDS IN A URL; `source-audit.js` counts citations; `add-sources.js` checks that
  every source is pointed at by a marker.  All of them pass a citation whose author
  never wrote it.  A reader cannot see it either — the name is plausible, the DOI
  resolves, the paper is real — so it is exactly the silent failure a committed
  checker is for.  N4 of docs/glossary-citation-plan.md records the same fault
  arriving by the other route: content fetched without its metadata, and the
  metadata composed from what the prose sounded like.

  WHAT IT CHECKS, and what it deliberately does not:

  1. AUTHORS.  The names the CITATION lists must be Crossref's first authors, in
     order.  The test runs that way round on purpose: a citation is free to stop
     after three names and write "et al.", and demanding a fixed count would fail
     an honest citation for being short.  What it may never do is name somebody who
     did not write the paper, or put them out of order — which is exactly what
     expanding initials produces.  Names are read off the text before the article
     title, so the journal and the title cannot be mistaken for people.

  2. YEAR.  One of the years Crossref carries must appear in the citation.  ANY of
     them: an advance-access paper is issued online in one year and printed in the
     next, and a Chicago note cites the issue, so both are right.

  It does NOT check page numbers, volume, issue or the title's wording: Crossref's
  own records disagree with the published article often enough there that a checker
  would cry wolf.  Read those off the article.

  CROSSREF IS A RECORD, NOT AN AUTHORITY.  Three of its records are wrong about a
  name Folio has right — a dropped letter, a title-cased Dutch tussenvoegsel, a
  Catalan double surname parsed as a given name — so those three are DECLARED in
  CROSSREF_WRONG with their reasoning rather than re-derived on every run.  A row
  matches only when the DOI, the cited name AND Crossref's name all agree, so it
  can never quietly excuse a different fault on the same paper.

  A citation with no DOI and no PMC id is REPORTED AS UNCHECKED, never as passing —
  an out-of-copyright book on archive.org has no record to check against, and
  saying "ok" about it would be the checker lying.  Run with --verbose to list them.

  Answers are cached in .claude/.crossref-cache.json (gitignored) so a re-run costs
  nothing; --refresh throws the cache away.
*/
"use strict";
const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(__dirname, "..");
const CACHE = path.join(__dirname, ".crossref-cache.json");
const CHECK_AUTHORS = 5;
const UA = "FolioBot/1.0 (Folio study site; check-citations.js)";

const argv = process.argv.slice(2);
const arg = (k) => { const a = argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : null; };
const has = (k) => argv.includes(`--${k}`);

/* ---------- load the corpus ---------- */
global.window = {};
require(path.join(ROOT, "data.js"));
const CARDS = window.CARD_DATA || [];
const { loadGlossary } = require(path.join(__dirname, "gloss-io.js"));
const G = loadGlossary();

let ART = [];
try {
  const w = {};
  new Function("window", fs.readFileSync(path.join(ROOT, "artefacts.js"), "utf8"))(w);
  ART = w.ARTEFACTS || [];
} catch (e) { /* artefacts are optional */ }

/* ---------- collect the citations we were asked about ---------- */
const prefix = arg("prefix");
const oneCard = arg("card");
const oneTerm = arg("term");
const all = has("all") || (!prefix && !oneCard && !oneTerm && !has("artefacts"));

const items = []; // { where, cite }
const push = (where, list) => (list || []).forEach((cite) => items.push({ where, cite }));

for (const c of CARDS) {
  if (oneCard) { if (c.id === oneCard) push(c.id, c.sources); continue; }
  if (prefix) { if (String(c.id).startsWith(prefix)) push(c.id, c.sources); continue; }
  if (all) push(c.id, c.sources);
}
const GS = G.GLOSSARY_SOURCES || {};
for (const k of Object.keys(GS)) {
  if (oneTerm) { if (k === oneTerm) push(k, GS[k]); continue; }
  if (oneCard || prefix) continue;
  if (all) push(k, GS[k]);
}
if (all || has("artefacts")) for (const a of ART) push(a.id || a.name, a.sources);

/* ---------- one row per distinct WORK, remembering where it is used ---------- */
const works = new Map(); // key -> { cite, where:Set }
for (const it of items) {
  const m = it.cite.match(/https?:\/\/[^\s,)\]]+/);
  const key = (m ? m[0] : it.cite).replace(/[.,]$/, "");
  if (!works.has(key)) works.set(key, { cite: it.cite, where: new Set() });
  works.get(key).where.add(it.where);
}

/* ---------- resolve each key to a DOI ---------- */
function doiFromKey(key) {
  let m = key.match(/doi\.org\/(10\.[^\s]+)$/i);
  if (m) return { doi: decodeURIComponent(m[1]), via: "doi" };
  m = key.match(/(PMC\d+)/i);
  if (m) return { pmc: m[1].toUpperCase(), via: "pmc" };
  return null;
}


/* ---------- the names a citation actually lists ----------
   The author region is everything before the article title (which house style opens
   with a curly quote) or, for a book, before the italicised title.  Splitting that on
   commas and "and" gives the names; the role words are dropped, "et al." simply ends
   the list, and anything with no space in it is not a person's full name. */
const ROLE = /^(trans|ed|eds|comp|rev)\.?$/i;
function citedAuthors(plain) {
  let head = plain.split(/[\u201c"]/)[0];
  const cut = head.search(/\bet al\.?/i);
  if (cut >= 0) head = head.slice(0, cut);
  return head
    .split(/,| and /)
    .map((s) => s.trim().replace(/[.,;]+$/, "").trim())
    .filter((s) => s && !ROLE.test(s) && /\s/.test(s) && /^[A-Z\u00C0-\u024F]/.test(s));
}

/* Comparing a name to a Crossref record, in the two ways it can go wrong.
   Crossref is inconsistent about given names — "F. Diez-Martin" for one paper,
   "Fernando Diez-Martin" for the next — so the test has to be in two tiers.
   A SURNAME that differs, or a FULL given name that differs from a full given
   name, is an error.  A citation that spells out a name Crossref abbreviates
   cannot be verified from here at all: that is reported for the eye, because it
   is the one place a fabricated given name can hide. */
const ENT = { amp:"&", lt:"<", gt:">", quot:'"', apos:"'", nbsp:" ", eacute:"é", Eacute:"É", egrave:"è",
  agrave:"à", aacute:"á", Aacute:"Á", uacute:"ú", iacute:"í", oacute:"ó", ntilde:"ñ", ccedil:"ç",
  uuml:"ü", ouml:"ö", auml:"ä", euml:"ë", iuml:"ï", ocirc:"ô", ecirc:"ê", acirc:"â", ucirc:"û", icirc:"î",
  aring:"å", oslash:"ø", szlig:"ß", scaron:"š", ccaron:"č", zcaron:"ž", rsquo:"\u2019", lsquo:"\u2018" };
const unent = (s) => s.replace(/&(#x?[0-9a-f]+|[a-zA-Z]+);/gi, (m, k) =>
  k[0] === "#" ? String.fromCodePoint(parseInt(k[1] === "x" || k[1] === "X" ? k.slice(2) : k.slice(1), k[1] === "x" || k[1] === "X" ? 16 : 10)) : (ENT[k] !== undefined ? ENT[k] : m));

/* Crossref writes a hyphenated surname with U+2010 (Marie‐Helene Moncel) where the
   citation has an ASCII hyphen, and both spellings are the same name.  Fold the
   dash family together, or three good citations are reported as three wrong ones. */
const fold = (s) => unent(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
  .replace(/[.\u2019'\u2018]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

/* SUFFIXES are a Crossref field of their own, so a citation carrying "Jr" is not
   disagreeing with a record that omits it. */
const SUFFIX = /^(jr|sr|ii|iii|iv)$/;
/* "G.M. MacDonald", "I.S.O. Matero" and "J.C Long" are Crossref writing several
   initials as one token; split them so they compare against a spelled-out name
   letter by letter.  THE TEST IS PER TOKEN, ON THE RAW TEXT — decided from the
   whole string (does this NAME contain an initials cluster anywhere?) it splits
   every short surname into letters as soon as an initial appears beside one, so
   "Jeffrey C. Long" and "J.C Long" compared as different people and Long, Wang,
   Chen and Ma were all reported wrong. */
const CLUSTER = /^(?:[A-Za-z]\.){1,4}[A-Za-z]?\.?$/;
function words(s) {
  return unent(s).split(/\s+/).flatMap((raw) => {
    const w = fold(raw);
    return CLUSTER.test(raw.trim()) ? w.split("") : [w];
  }).filter((w) => w && !SUFFIX.test(w));
}
const parts = (s) => { const w = words(s); return { given: w.slice(0, -1), family: w[w.length - 1] || "" }; };
const isInitial = (w) => w.length === 1;
/* CROSSREF IS A RECORD, NOT AN AUTHORITY, and three of its records are wrong about
   a name Folio has right.  A checker that cries wolf on them is a checker nobody
   runs, so they are DECLARED, with the reason and the evidence, rather than left to
   be re-derived every time.  A row is (DOI, what the citation says, what Crossref
   says): all three must match, so it can never quietly excuse a different fault on
   the same paper.  Add one only after reading the article's own byline. */
const CROSSREF_WRONG = [
  // The article's own title page spells it Jacques; Crossref has dropped the c.
  ["10.14430/arctic1218", "Jacques Cinq-Mars", "Jaques Cinq-Mars"],
  // Radiocarbon's own page gives van der Plicht, a Dutch tussenvoegsel Crossref has
  // both title-cased and misspelt.
  ["10.1017/S0033822200030666", "Johannes van der Plicht", "Johannes Van Der Plight"],
  // Crossref has parsed the Catalan double surname as a given name, giving
  // "Autuori Josep Cervello"; the article is by Josep Cervello-Autuori.
  ["10.3406/arnil.2005.896", "Josep Cervelló-Autuori", "Autuori Josep Cervelló"],
  // Family name first and the Polish diacritics stripped: the byline is Sławomir Karaś.
  ["10.12691/ajcea-5-6-3", "Sławomir Karaś", "Karas Slawomir"],
  // Crossref has dropped the c: the sinologist is Léon Vandermeersch.
  ["10.3406/oroc.1986.927", "Léon Vandermeersch", "Léon Vandermeersh"],
  // Crossref has split the hyphenated surname and abbreviated the given names.
  ["10.1038/srep45027", "Juan Antonio Ballesteros-Cánovas", "J. A. Ballesteros Cánovas"],
  // A transliteration variant of one archaeologist: Elena Efimovna Kuz'mina.
  ["10.3406/arasi.1983.1162", "Elena E. Kuz'mina", "Elen Efimovna Kuz'mina"],
  // Crossref has captured the honorific where the given name belongs; the paper is A. P. Laurie's.
  ["10.9750/psas.057.41.45", "A. P. Laurie", "Principal Laurie"],
  // Crossref carries the shorter of a two-part surname: Aubin Nzeukou Nzeugang.
  ["10.1016/j.heliyon.2021.e07608", "Aubin Nzeukou Nzeugang", "A.N. Nzeukou"],
  // Crossref stores the nickname in brackets, as the journal registered it; the
  // psychologist publishes as Jinjing Jenny Wang.
  ["10.1162/opmi_a_00028", "Jinjing Jenny Wang", "Jinjing (Jenny) Wang"],
  // MOJIBAKE IN THE RECORD ITSELF, not in this script: the API's own UTF-8 decodes
  // to "JosÃ© M.", so Frontiers registered the name double-encoded. Checked at the
  // byte level before this row was written — the raw response holds neither the
  // proper "José" bytes nor a second layer of mangling.
  // A row is per (DOI, name), so a record mangled throughout needs one per author.
  ["10.3389/fnhum.2015.00256", "José M. Medina", "JosÃ© M. Medina"],
  ["10.3389/fnhum.2015.00256", "José A. Díaz", "JosÃ© A. DÃ­az"],
];
/* The same, for a YEAR Crossref states in a published-print record and gets wrong.
   A row is (DOI, the year the citation gives, the year Crossref gives). */
const CROSSREF_YEAR_WRONG = [
  // Tyche: Beiträge zur Alten Geschichte, Band 7 is 1992; Crossref prints 1993.
  ["10.15661/tyche.1992.007.20", 1992, 1993],
];
const yearAllowed = (doi, plain, years) => CROSSREF_YEAR_WRONG.some(
  (r) => r[0].toLowerCase() === String(doi).toLowerCase() && plain.includes(String(r[1])) && years.includes(r[2]));
const allowed = (doi, cited, real) => CROSSREF_WRONG.some(
  (r) => r[0].toLowerCase() === String(doi).toLowerCase() && fold(r[1]) === fold(cited) && fold(r[2]) === fold(real));
function compareName(cited, real) {
  const a = parts(cited), b = parts(real);
  if (a.family !== b.family) return "wrong";
  const n = Math.min(a.given.length, b.given.length);
  let expanded = false;
  for (let i = 0; i < n; i++) {
    const x = a.given[i], y = b.given[i];
    if (x === y) continue;
    if (isInitial(y) && x[0] === y) { expanded = true; continue; }   // citation spells out what Crossref abbreviates
    if (isInitial(x) && y[0] === x) continue;                        // and the other way round is safe
    return "wrong";
  }
  return expanded ? "expanded" : "ok";
}
/* ---------- network, with a cache ---------- */
let cache = {};
const CACHE_REV = 2; // bump when the shape of a cached record changes
if (!has("refresh")) { try { const c = JSON.parse(fs.readFileSync(CACHE, "utf8")); if (c._rev === CACHE_REV) cache = c; } catch (e) {} }
cache._rev = CACHE_REV;
let netFailed = false;

function get(url) {
  return new Promise((res) => {
    const req = https.get(url, { headers: { "User-Agent": UA } }, (r) => {
      let d = "";
      r.setEncoding("utf8");
      r.on("data", (c) => (d += c));
      r.on("end", () => res({ code: r.statusCode, body: d }));
    });
    req.on("error", () => res({ code: 0, body: "" }));
    req.setTimeout(30000, () => { req.destroy(); res({ code: 0, body: "" }); });
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* does doi.org lead anywhere? cached like the rest */
async function resolves(doi) {
  const k = "live:" + doi.toLowerCase();
  if (cache[k] !== undefined) return cache[k];
  const r = await new Promise((res) => {
    const req = https.request("https://doi.org/" + encodeURI(doi), { method: "HEAD", headers: { "User-Agent": UA } }, (x) => res(x.statusCode));
    req.on("error", () => res(0));
    req.setTimeout(20000, () => { req.destroy(); res(0); });
    req.end();
  });
  const ok = r >= 200 && r < 400;
  cache[k] = ok;
  return ok;
}

async function pmcToDoi(pmc) {
  const k = "pmc:" + pmc;
  if (cache[k]) return cache[k];
  const u = "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=" +
            encodeURIComponent("PMCID:" + pmc) + "&format=json&pageSize=1&resultType=core";
  for (let a = 0; a < 3; a++) {
    await sleep(a ? 2000 : 0);
    const r = await get(u);
    if (r.code !== 200) continue;
    try {
      const doi = JSON.parse(r.body).resultList.result[0].doi;
      if (doi) { cache[k] = doi; return doi; }
    } catch (e) {}
  }
  return null;
}

async function crossref(doi) {
  const k = "doi:" + doi.toLowerCase();
  if (cache[k] && (cache[k].missing || cache[k].years)) return cache[k];
  const u = "https://api.crossref.org/works/" + encodeURI(doi);
  for (let a = 0; a < 4; a++) {
    await sleep(a ? 2500 : 600);
    const r = await get(u);
    if (r.code === 404) { cache[k] = { missing: true }; return cache[k]; }
    if (r.code !== 200) continue;
    try {
      const m = JSON.parse(r.body).message;
      const yr = (k) => (m[k] && m[k]["date-parts"] && m[k]["date-parts"][0] || [])[0] || null;
      const rec = {
        authors: (m.author || []).map((a) => ((a.given || "") + " " + (a.family || "")).trim()).filter(Boolean),
        title: (m.title || [])[0] || "",
        years: [...new Set(["issued", "published-print", "published-online"].map(yr).filter(Boolean))],
        print: !!yr("published-print"),
      };
      cache[k] = rec;
      return rec;
    } catch (e) {}
  }
  netFailed = true;
  return null;
}

/* ---------- run ---------- */
(async () => {
  const bad = [];
  const eyes = [];
  let declared = 0;
  const unchecked = [];
  let checked = 0;

  for (const [key, w] of works) {
    const id = doiFromKey(key);
    if (!id) { unchecked.push({ key, w, why: "no DOI or PMC id" }); continue; }
    const doi = id.doi || (await pmcToDoi(id.pmc));
    if (!doi) { unchecked.push({ key, w, why: "PMC id did not resolve to a DOI" }); continue; }
    const rec = await crossref(doi);
    if (!rec) { unchecked.push({ key, w, why: "Crossref unreachable" }); continue; }
    if (rec.missing) {
      /* Crossref is not the only registration agency. A DOI it has never heard of may
         still resolve — DataCite registers PaleoAnthropology and the Journal of
         Anthropological Sciences among others — so ask doi.org before calling it an
         error. A DOI that resolves is simply unCHECKABLE here; one that does not is. */
      const live = await resolves(doi);
      if (live) unchecked.push({ key, w, why: "the DOI resolves, but Crossref holds no metadata for it" });
      else bad.push({ w, doi, problem: "this DOI resolves nowhere and Crossref has no record of it" });
      continue;
    }
    checked++;

    const plain = w.cite.replace(/<[^>]*>/g, "");
    const listed = citedAuthors(plain);
    if (!rec.authors.length) { unchecked.push({ key, w, why: "Crossref lists no authors" }); continue; }
    if (!listed.length) { unchecked.push({ key, w, why: "no author names could be read from the citation" }); continue; }

    /* A DOI pointing at a DIFFERENT PAPER shows up as a wrong first author, which
       sends the repair the wrong way — the names are not the thing to fix. Compare
       the titles first so the two are told apart. */
    if (rec.title) {
      /* A title can carry quotation marks of its own — “The “I” in egalitarianism: …” —
         and a matcher that stops at the first closing quote captures four characters and
         then reports a perfectly good DOI as a DIFFERENT PAPER.  Chicago ends an article
         title with a comma or full stop INSIDE the closing quote, so look for that; fall
         back to the simple form for a citation punctuated some other way. */
      const q = plain.match(/[\u201c"]([\s\S]{12,}?)[,.][\u201d"]/) ||
                plain.match(/[\u201c"]([^\u201d"]{12,})[\u201d"]/);
      if (q) {
        /* Crossref titles carry markup and are often TRUNCATED at the first tag —
           "Diet of", "When did", "Metopic suture of Taung (" — so a head-to-head
           comparison would call half the corpus a wrong DOI. Strip the markup, accept
           either title being a prefix of the other, and otherwise measure how many of
           the shorter title's words the longer one carries. */
        const flat = (s) => fold(s.replace(/<[^>]*>/g, " ")).replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
        const a = flat(q[1]), b = flat(rec.title);
        let same = a.startsWith(b) || b.startsWith(a);
        if (!same) {
          const A = a.split(" "), B = b.split(" ");
          const [short, long] = A.length <= B.length ? [A, new Set(B)] : [B, new Set(A)];
          same = short.filter((x) => long.has(x)).length / short.length >= 0.5;
        }
        /* A journal that publishes bilingually registers ONE of its two titles, so a
           Croatian chapter title against its English original, or a Slovenian one
           against the English, looks like a wrong DOI and is not.  Where the FIRST
           AUTHOR still matches, the DOI is almost certainly right and the titles are
           two names for one paper — that is a judgement, so it goes to the eye rather
           than being called an error or waved through. */
        if (!same && rec.authors.length && listed.length &&
            compareName(listed[0], rec.authors[0]) !== "wrong") {
          eyes.push({ w, doi, names: [`title: Crossref registers this as "${rec.title}"; the author matches, so read the two against each other`] });
        } else if (!same) { bad.push({ w, doi, problem: "this DOI is a DIFFERENT PAPER", real: rec.title }); continue; }
      }
    }

    let clash = null, expanded = [];
    for (let i = 0; i < Math.min(listed.length, rec.authors.length); i++) {
      const verdict = compareName(listed[i], rec.authors[i]);
      if (verdict === "wrong" && allowed(doi, listed[i], rec.authors[i])) { declared++; continue; }
      if (verdict === "wrong") { clash = `author ${i + 1} is "${listed[i]}"; Crossref has "${rec.authors[i]}"`; break; }
      if (verdict === "expanded") expanded.push(`${listed[i]} (Crossref: ${rec.authors[i]})`);
    }
    if (clash) {
      bad.push({ w, doi, problem: clash, real: rec.authors.slice(0, Math.max(3, listed.length) + 1).join(", ") });
      continue;
    }
    /* A YEAR CROSSREF CANNOT ADJUDICATE IS NOT AN ERROR, and where a record has no
       published-print date it cannot adjudicate at all: all it holds is when the
       record went online, which is a DEPOSIT date and may fall either side of the
       issue.  It runs late — Nature Human Behaviour 7, no. 2 is Feb 2023 for a paper
       Crossref dates 2022 — and it runs years early, because a society digitising its
       back catalogue deposits a 1995 volume in 1996 and a 2010 one in 2017.  Chicago
       cites the ISSUE.  So a record with no print date is reported FOR THE EYE and
       never as a mismatch; only a print year the citation does not carry is an error,
       and the three good citations that produced (PSAS 125, PSAS 145, BGSG 43) were
       every one of them a back-catalogue deposit. */
    if (rec.years.length && !rec.years.some((y) => plain.includes(String(y)))) {
      if (rec.print && !yearAllowed(doi, plain, rec.years)) {
        bad.push({ w, doi, problem: `Crossref gives the year as ${rec.years.join(" or ")}, which the citation does not carry` });
        continue;
      }
      eyes.push({ w, doi, names: [`year: Crossref has ${rec.years.join("/")} and the citation cites another issue year`] });
    }
    if (expanded.length) eyes.push({ w, doi, names: expanded });
  }

  try { fs.writeFileSync(CACHE, JSON.stringify(cache)); } catch (e) {}

  console.log("Citation authors and years, against Crossref\n");
  console.log(`  works cited   ${works.size}`);
  console.log(`  checked       ${checked}`);
  console.log(`  unchecked     ${unchecked.length}`);
  console.log(`  mismatched    ${bad.length}`);
  if (declared) console.log(`  declared      ${declared}   (rows of CROSSREF_WRONG — Crossref is the one that is wrong)`);
  console.log(`  to check by eye ${eyes.length}   (a given name Crossref only abbreviates)\n`);

  if (has("verbose") && unchecked.length) {
    console.log("UNCHECKED — no record to check against, which is not the same as correct:");
    for (const u of unchecked) console.log(`  ${[...u.w.where].join(", ")}  (${u.why})\n    ${u.w.cite.replace(/<[^>]*>/g, "").slice(0, 120)}`);
    console.log("");
  }

  if (has("verbose") && eyes.length) {
    console.log("TO CHECK BY EYE — the citation spells out a name Crossref abbreviates, which cannot be");
    console.log("verified from here and is where a fabricated given name hides:");
    for (const e of eyes) console.log(`  ${[...e.w.where].join(", ")}  ${e.doi}\n    ${e.names.join("; ")}`);
    console.log("");
  }

  if (bad.length) {
    console.log("MISMATCHED:");
    for (const b of bad) {
      console.log(`  ${[...b.w.where].join(", ")}  ${b.doi || ""}`);
      console.log(`    ${b.problem}`);
      if (b.real) console.log(`    Crossref: ${b.real}`);
      console.log(`    cite:     ${b.w.cite.replace(/<[^>]*>/g, "").slice(0, 140)}`);
    }
    console.log("\nNEVER EXPAND AN AUTHOR'S INITIALS AND NEVER COMPOSE A DOI — look both up.");
    process.exit(1);
  }

  if (netFailed && !checked) {
    console.log("Crossref could not be reached, so nothing was checked. Not a failure.");
    process.exit(0);
  }
  console.log("every checkable citation matches its record.");
})();
