#!/usr/bin/env node
"use strict";
/*
  fetch-images.js — find a public-domain picture for every glossary term (and, through the
  answer term, for every card) from Wikimedia Commons.  Standalone Node helper, zero deps,
  resumable.  Not part of the site.

  WHY THIS IS A SCRIPT AND NOT A RESEARCH PASS BY HAND.  A glossary key IS a Wikipedia article
  slug — that is the rule `add-glossary.js` enforces — so the files ON that article are files
  somebody has already judged to be OF the thing.  What a human cannot do at this scale is check
  the LICENCE, the RESOLUTION and the WATERMARK on thousands of files, and those are exactly the
  three things that must not be guessed.  So the machine reads them off Commons' own metadata,
  refuses anything it cannot establish, and hands back a ranked candidate list to be read by eye.

  THE LEAD IMAGE ALONE IS NOT ENOUGH, and that is the finding this file is built around.  Taking
  only `pageimages` gave 128 usable pictures out of 836 terms: an article's lead image is very
  often a modern CC-BY photograph, while a public-domain engraving, map or museum scan sits three
  paragraphs further down.  Reading EVERY file on the page and ranking them takes the same number
  of requests per term and finds several times as many.

  Usage:
    node .claude/fetch-images.js [--force] [--limit=N]
    node .claude/fetch-images.js --report

  Writes .claude/image-cache/*.json (gitignored).
*/

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CACHE_DIR = path.join(__dirname, "image-cache");
const FILES_CACHE = path.join(CACHE_DIR, "files.json");      // File: -> Commons metadata
const PAGES_CACHE = path.join(CACHE_DIR, "pages.json");      // slug -> { article, lead, files[] }

const UA = "FolioImagePass/1.0 (https://github.com/Pokfus/folio; study site content pass)";

/* ---------------------------------------------------------------- licences

   THE BAR IS "FREE TO USE COMMERCIALLY, INCLUDING ON A PAID SITE".  Folio may sell premium
   accounts, so a picture must be usable in a commercial product — and that is a stronger test
   than "free".  Two facts make it tractable:

   · WIKIMEDIA COMMONS ONLY ACCEPTS LICENCES THAT PERMIT COMMERCIAL USE AND DERIVATIVES.  A
     NonCommercial or NoDerivatives file is outside its scope entirely, so the whole corpus this
     pass draws on is already past the hard part.  The NC/ND test below is therefore belt and
     braces rather than the load-bearing check — but it is kept, because a licence field is free
     text and this is the one mistake that cannot be undone by editing a caption.
   · SHARE-ALIKE DOES NOT REACH THE SITE.  CC BY-SA's copyleft binds ADAPTATIONS of the picture.
     A page that shows a picture beside prose is a COLLECTION, and CC 4.0 says so in as many
     words — the licence "does not apply to the other parts of the Collection".  Resizing to a
     thumbnail is a format change rather than an adaptation.  So a CC BY-SA illustration does not
     oblige Folio to license Folio under CC BY-SA, and does not stand in the way of charging.

   Accepted: public domain / CC0, CC BY, CC BY-SA.
   Refused: GFDL (commercial use is permitted but it wants the full licence text shipped with the
   work and a "transparent copy" made available, which is not a thing a card frame can do), the
   Free Art Licence and the various one-off national open licences (each would need reading on its
   own terms, and there are only a few dozen files between them), and anything unrecognised.     */

const PD_ID_RX = /^(pd|cc0|cc-zero|public[ -]domain)/i;
const PD_NAME_RX = /^(public domain|cc0|no restrictions|pd-|copyrighted free use)/i;
const NONFREE_RX = /\b(nc|nd|non[- ]?commercial|no[- ]?deriv)\b/i;

function licenceClass(md) {
  const id = String((md.License && md.License.value) || "").trim();
  const name = String((md.LicenseShortName && md.LicenseShortName.value) || "").trim();
  if (NONFREE_RX.test(id) || NONFREE_RX.test(name)) return "nonfree";
  if (PD_ID_RX.test(id) || PD_NAME_RX.test(name)) return "pd";
  if (/^cc-by-sa/i.test(id) || /^cc by-sa/i.test(name)) return "cc-by-sa";
  if (/^cc-by/i.test(id) || /^cc by/i.test(name)) return "cc-by";
  /* Commons' bare {{Attribution}} template: freely reusable, commercially, on the single
     condition that the author is named — so it is a CC BY in all but name and is treated as one. */
  if (/^attribution$/i.test(name) || /^attribution$/i.test(id)) return "cc-by";
  if (/^gfdl/i.test(id)) return "gfdl";
  return id || name ? "other" : "unknown";
}

/* The licences that may be used, and the ones that need a CREDIT LINE NAMING THE AUTHOR.  For a
   CC licence attribution is not politeness, it is the condition of the grant: a file whose author
   cannot be established from its own record cannot be attributed and so cannot be used, however
   good the picture is. */
const OK_LICENCES = new Set(["pd", "cc-by", "cc-by-sa"]);
const NEEDS_ATTRIBUTION = new Set(["cc-by", "cc-by-sa"]);

/* "Unknown author" is a real and citable answer for a public-domain scan; it is not an answer for
   a CC licence, where somebody is exercising a copyright they hold. */
const NO_AUTHOR_RX = /^\s*(unknown|anonymous|unbekannt|no author|not (given|stated)|see (file )?(history|source|below))/i;

function attributableAuthor(info) {
  const a = String((info && info.artist) || "").replace(/\s+/g, " ").trim();
  if (!a || a.length > 120 || NO_AUTHOR_RX.test(a)) return "";
  return a;
}

/* A watermark cannot be seen from here, so what IS checkable is checked: Commons categorises and
   tags files that carry one, and a description that mentions one is a description worth heeding.
   This cannot catch every case — a sample is looked at by eye before anything ships.            */
const WATERMARK_RX = /\bwatermark(ed|s)?\b|\bwith logo\b|logo overlay|stock photo/i;

const MIME_OK = new Set(["image/jpeg", "image/png", "image/webp"]);

/* Display sizes are modest (a card frame caps at 680 CSS px, a gloss popup at 150 px tall), so
   "high resolution" here means comfortably past a 2× card frame with room to open fullscreen.  */
const MIN_LONG = 900;
const MIN_SHORT = 450;

const THUMB_W = 1600; // what a reader downloads: high-res without being a 40 MB original

/* Wiki furniture and things that are never an illustration OF a subject. */
const JUNK_RX = new RegExp([
  "commons-logo", "wikidata", "wiktionary", "wikisource", "wikiquote", "wikibooks", "wikinews",
  "wikiversity", "wikispecies", "wikimedia", "^file:question_book", "^file:edit-", "ambox",
  "^file:symbol_", "^file:increase", "^file:decrease", "^file:steady", "^file:red_pog",
  "^file:blue_pog", "^file:green_pog", "^file:location_dot", "^file:cscr-", "^file:disambig",
  "^file:folder", "^file:portal-", "^file:padlock", "^file:merge-", "^file:crystal",
  "^file:nuvola", "^file:gnome-", "^file:office-book", "^file:p_", "^file:wiki_letter",
  "^file:searchtool", "^file:text_document", "^file:speaker_icon", "^file:loudspeaker",
  "^file:sound-icon", "^file:magnify-clip", "^file:star_full", "^file:yes_check",
  "^file:x_mark", "^file:oojs", "^file:cc-", "^file:gfdl", "^file:pd-icon", "^file:heckert",
  "^file:free_and_open", "^file:open_access", "^file:information_icon", "^file:emblem-",
  "^file:vote_icon", "^file:un_flag", "^file:flag_of_the_united_nations",
].join("|"), "i");

/* A locator map is a legitimate picture of a place, but it is a poor one where anything else
   exists, so it is ranked down rather than refused. */
const WEAK_RX = /location|locator|orthographic|_map_|\bmap of\b|coat of arms|\bseal of\b|blank_|template/i;

/* ------------------------------------------------------------------ http */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(host, params) {
  const qs = new URLSearchParams({ format: "json", formatversion: "2", ...params });
  const url = `https://${host}/w/api.php?${qs}`;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
      if (r.status === 429 || r.status >= 500) { await sleep(1200 * (attempt + 1)); continue; }
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      return await r.json();
    } catch (e) {
      if (attempt === 4) throw e;
      await sleep(1200 * (attempt + 1));
    }
  }
  throw new Error("unreachable");
}

/* A Commons file URL arrives with tracking parameters bolted on by the API.  They are not part
   of the file's address and must not be stored — a URL carrying "utm_campaign=api" says the link
   was scraped rather than chosen. */
function cleanUrl(u) {
  if (!u) return "";
  const i = u.indexOf("?");
  return i === -1 ? u : u.slice(0, i);
}

function stripTags(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ").trim();
}

/* ------------------------------------------------------------- the corpus */

function loadCorpus() {
  global.window = {};
  require(path.join(ROOT, "glossary.js"));
  require(path.join(ROOT, "data.js"));
  return {
    glossary: Object.keys(global.window.GLOSSARY || {}),
    cards: global.window.CARD_DATA || [],
  };
}

const readJSON = (p, dflt) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : dflt);

/* ------------------------------------------------------- step 1: articles */

/* ONE TITLE PER REQUEST, and that is not laziness.  `imlimit=max` is a cap on the WHOLE query,
   not per page, so batching twenty titles returns the first article's file list and silently
   hands back nothing for most of the rest — 221 of 836 terms came back "no-image" that way,
   France and Homo erectus among them, which is what showed it up.  A truncation that reports as
   an absence is the worst shape a bug can take here, since a term with no picture looks exactly
   like a term whose article has none. */
async function fetchPages(slugs, pages) {
  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    let j;
    try {
      j = await api("en.wikipedia.org", {
        action: "query",
        titles: slug.replace(/_/g, " "),
        prop: "images|pageimages",
        imlimit: "max",
        piprop: "name",
        pilicense: "free",
        redirects: "1",
      });
    } catch { pages[slug] = { state: "error" }; continue; }
    const p = ((j.query && j.query.pages) || [])[0];
    if (!p || p.missing) { pages[slug] = { state: "no-article" }; }
    else {
      const files = (p.images || []).map((im) => im.title).filter((t) => !JUNK_RX.test(t));
      pages[slug] = {
        state: files.length ? "ok" : "no-image",
        article: p.title,
        lead: p.pageimage ? "File:" + p.pageimage.replace(/_/g, " ") : null,
        files,
      };
    }
    if (i % 25 === 0) process.stderr.write(`  articles ${i}/${slugs.length}\r`);
    await sleep(60);
  }
  process.stderr.write(`  articles ${slugs.length}/${slugs.length}\n`);
}

/* A glossary key is a Wikipedia slug BY RULE, but the rule is about the slug that existed when
   the term was written: articles get renamed and merged.  Where the title no longer resolves,
   the article is searched for rather than the term being written off — but only the top hit is
   taken and it is recorded as a SEARCH result, so a wrong match can be told from a direct one. */
async function searchArticles(slugs, pages) {
  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    let j;
    try {
      j = await api("en.wikipedia.org", {
        action: "query", list: "search",
        srsearch: slug.replace(/_/g, " "), srlimit: "1", srnamespace: "0",
      });
    } catch { continue; }
    const hit = ((j.query && j.query.search) || [])[0];
    if (!hit) { pages[slug] = { state: "no-article" }; continue; }
    let k;
    try {
      k = await api("en.wikipedia.org", {
        action: "query", titles: hit.title,
        prop: "images|pageimages", imlimit: "max", piprop: "name", pilicense: "free", redirects: "1",
      });
    } catch { continue; }
    const p = ((k.query && k.query.pages) || [])[0];
    if (!p || p.missing) { pages[slug] = { state: "no-article" }; continue; }
    const files = (p.images || []).map((im) => im.title).filter((t) => !JUNK_RX.test(t));
    pages[slug] = {
      state: files.length ? "ok" : "no-image",
      article: p.title, via: "search",
      lead: p.pageimage ? "File:" + p.pageimage.replace(/_/g, " ") : null,
      files,
    };
    if (i % 10 === 0) process.stderr.write(`  searches ${i}/${slugs.length}\r`);
    await sleep(80);
  }
  process.stderr.write(`  searches ${slugs.length}/${slugs.length}\n`);
}

/* ---------------------------------------------------------- step 2: files */

async function fetchFiles(titles, files) {
  const todo = titles.filter((t) => !files[t]);
  for (let i = 0; i < todo.length; i += 40) {
    const chunk = todo.slice(i, i + 40);
    const j = await api("commons.wikimedia.org", {
      action: "query",
      titles: chunk.join("|"),
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: String(THUMB_W),
    });
    const q = (j && j.query) || {};
    const back = new Map();
    const norm = (s) => String(s || "").toLowerCase().replace(/_/g, " ");
    chunk.forEach((f) => back.set(norm(f), f));
    (q.normalized || []).forEach((n) => { const f = back.get(norm(n.from)); if (f) back.set(norm(n.to), f); });
    (q.pages || []).forEach((p) => {
      const key = back.get(norm(p.title));
      if (!key) return;
      const ii = p.imageinfo && p.imageinfo[0];
      if (!ii) { files[key] = { missing: true }; return; }
      const md = ii.extmetadata || {};
      files[key] = {
        title: p.title,
        url: cleanUrl(ii.url),
        thumb: cleanUrl(ii.thumburl || ii.url),
        width: ii.width, height: ii.height, mime: ii.mime,
        page: ii.descriptionurl,
        licence: licenceClass(md),
        licenceName: stripTags((md.LicenseShortName && md.LicenseShortName.value) || ""),
        artist: stripTags((md.Artist && md.Artist.value) || ""),
        credit: stripTags((md.Credit && md.Credit.value) || ""),
        desc: stripTags((md.ImageDescription && md.ImageDescription.value) || ""),
        objectName: stripTags((md.ObjectName && md.ObjectName.value) || ""),
        date: stripTags((md.DateTimeOriginal && md.DateTimeOriginal.value) || ""),
        categories: stripTags((md.Categories && md.Categories.value) || ""),
      };
    });
    process.stderr.write(`  files ${Math.min(i + 40, todo.length)}/${todo.length}\r`);
    await sleep(120);
  }
  if (todo.length) process.stderr.write("\n");
}

/* -------------------------------------------------------------- selection */

function usable(info) {
  if (!info || info.missing) return "no-file";
  if (!OK_LICENCES.has(info.licence)) return "licence:" + info.licence;
  if (NEEDS_ATTRIBUTION.has(info.licence) && !attributableAuthor(info)) return "no-author";
  if (!MIME_OK.has(info.mime)) return "mime:" + (info.mime || "?");
  const long = Math.max(info.width || 0, info.height || 0);
  const short = Math.min(info.width || 0, info.height || 0);
  if (long < MIN_LONG || short < MIN_SHORT) return "small";
  if (WATERMARK_RX.test(`${info.desc} ${info.categories} ${info.title}`)) return "watermark";
  return "ok";
}

const words = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter((w) => w.length > 2);

/* Relevance is read off the FILE NAME against the term, which is the one signal Commons gives
   for free and which is right far more often than it has any business being: a file called
   "Levallois preferencial.jpg" on the Levallois article is a picture of a Levallois core.     */
function score(slug, article, lead, title, info) {
  const term = new Set([...words(slug), ...words(article)]);
  const name = words(title.replace(/^file:/i, ""));
  let hits = 0;
  name.forEach((w) => { if (term.has(w)) hits++; });
  let s = hits * 10;
  if (term.size) s += Math.round((hits / term.size) * 10);
  if (lead && title.toLowerCase() === lead.toLowerCase()) s += 25;      // the article's own choice
  if (WEAK_RX.test(title)) s -= 12;                                     // a locator map, if nothing else
  const px = (info.width || 0) * (info.height || 0);
  s += Math.min(8, Math.round(px / 2_000_000));                          // prefer the bigger scan
  if (/\.(jpg|jpeg)$/i.test(title)) s += 1;
  return s;
}

function pick(slug, page, files) {
  if (!page || page.state === "no-article") return { state: "no-article" };
  const cands = (page.files || []).map((t) => ({ t, info: files[t], why: usable(files[t]) }));
  const ok = cands.filter((c) => c.why === "ok");
  if (!ok.length) {
    const near = {};
    cands.forEach((c) => { near[c.why] = (near[c.why] || 0) + 1; });
    return { state: cands.length ? "none-usable" : "no-image", near };
  }
  ok.forEach((c) => { c.score = score(slug, page.article, page.lead, c.t, c.info); });
  ok.sort((a, b) => b.score - a.score);
  return {
    state: "ok",
    article: page.article,
    best: ok[0].t,
    score: ok[0].score,
    alts: ok.slice(1, 4).map((c) => c.t),
  };
}

/* ------------------------------------------------------------------- main */

async function main() {
  const args = process.argv.slice(2);
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const pages = readJSON(PAGES_CACHE, {});
  const files = readJSON(FILES_CACHE, {});

  if (args.includes("--report")) return report(pages, files);

  const { glossary } = loadCorpus();
  const force = args.includes("--force");
  const limitArg = args.find((a) => a.startsWith("--limit="));
  let todo = glossary.filter((s) => force || !pages[s]);
  if (limitArg) todo = todo.slice(0, Number(limitArg.split("=")[1]));

  console.log(`${glossary.length} glossary terms, ${todo.length} articles to read`);
  if (todo.length) {
    await fetchPages(todo, pages);
    fs.writeFileSync(PAGES_CACHE, JSON.stringify(pages));
  }

  const lost = glossary.filter((s) => pages[s] && pages[s].state === "no-article");
  if (lost.length && !args.includes("--no-search")) {
    console.log(`${lost.length} slugs resolve to no article — searching`);
    await searchArticles(lost, pages);
    fs.writeFileSync(PAGES_CACHE, JSON.stringify(pages));
  }

  const want = new Set();
  Object.values(pages).forEach((p) => (p.files || []).forEach((t) => want.add(t)));
  const missing = [...want].filter((t) => !files[t]);
  console.log(`${want.size} distinct files referenced, ${missing.length} to look up`);
  if (missing.length) {
    await fetchFiles(missing, files);
    fs.writeFileSync(FILES_CACHE, JSON.stringify(files));
  }

  report(pages, files);
}

function report(pages, files) {
  const tally = {};
  let ok = 0;
  for (const slug of Object.keys(pages)) {
    const p = pick(slug, pages[slug], files);
    tally[p.state] = (tally[p.state] || 0) + 1;
    if (p.state === "ok") ok++;
  }
  console.log("\n--- terms ---");
  Object.keys(tally).sort((a, b) => tally[b] - tally[a]).forEach((k) => console.log(String(tally[k]).padStart(5), k));
  console.log(String(ok).padStart(5), "USABLE of", Object.keys(pages).length);
}

module.exports = { pick, usable, score, readJSON, PAGES_CACHE, FILES_CACHE, stripTags, MIN_LONG, MIN_SHORT,
  licenceClass, attributableAuthor, OK_LICENCES, NEEDS_ATTRIBUTION };

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
