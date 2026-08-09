#!/usr/bin/env node
"use strict";
/*
  suggest-image.js — look for a picture for ONE new card, glossary term or artefact.  Standalone
  Node helper, zero deps.  Not part of the site.

    node .claude/suggest-image.js "Venus of Hohle Fels"
    node .claude/suggest-image.js "Boreal" --slug=Boreal

  WHY IT EXISTS.  The picture pass (`fetch-images.js` → `search-images.js` → `pick-images.js` →
  `add-images.js`) is a BATCH pipeline: it walks the whole corpus, ranks everything, and a reader
  reviews it in blocks of twenty-five.  That is the right shape for 836 terms at once and the wrong
  shape for the one term written this morning, which is why the corpus went from one picture to
  several hundred in a day and then drifted straight back out of date.  A picture is part of a
  content item the way its citations are, so it is looked for WHEN THE ITEM IS WRITTEN — and
  `add-card.js`, `add-glossary.js` and `add-artefacts.js` each call this at the end of a
  successful add and print what it found.

  WHAT IT DOES NOT DO IS CHOOSE.  Everything above the review step in that pipeline exists because
  a name match is confidently wrong in a way nothing downstream can catch — the top public-domain
  candidate for `Jason_E._Lewis`, the palaeoanthropologist, is a United States congressman of the
  same name.  So this prints candidates and the command that would install one; a person picks.
  Auto-installing the top hit would put a wrong picture on a study card silently, which is worse
  than the empty frame it replaces.

  IT IS BEST-EFFORT AND NEVER FATAL.  It runs after the content has already been written, and it
  needs the network, which the sandbox a batch runs in may not have.  A failure prints one line
  saying so and leaves the exit status alone: a content tool must not start failing because
  Commons is slow.
*/

const fs = require("fs");
const path = require("path");
const { usable, licenceClass, attributableAuthor, OK_LICENCES, NEEDS_ATTRIBUTION } = require("./fetch-images.js");

const UA = "FolioImagePass/1.0 (https://github.com/Pokfus/folio; study site content pass)";
const THUMB_W = 1600;
const TIMEOUT_MS = 20000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const clean = (u) => (u && u.indexOf("?") > -1 ? u.slice(0, u.indexOf("?")) : u || "");
const strip = (h) => String(h || "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/\s+/g, " ").trim();

async function api(params) {
  const qs = new URLSearchParams({ format: "json", formatversion: "2", ...params });
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(`https://commons.wikimedia.org/w/api.php?${qs}`,
      { headers: { "User-Agent": UA, Accept: "application/json" }, signal: ctl.signal });
    if (!r.ok) throw new Error(r.status + " " + r.statusText);
    return await r.json();
  } finally { clearTimeout(t); }
}

/* The public-domain sweep runs FIRST and the CC one only if it comes back empty.  A public-domain
   file costs the reader nothing and the caption no attribution line, so it is worth preferring
   where one exists; `haswbstatement:P6216=Q19652` is Commons' own structured claim that a file IS
   public domain, and `filetype:bitmap` keeps SVG and video out. */
async function searchOnce(term, wide) {
  const t = String(term).replace(/_/g, " ").replace(/\s*\([^)]*\)$/, "").trim();
  const srsearch = wide ? `${t} filetype:bitmap` : `${t} filetype:bitmap haswbstatement:P6216=Q19652`;
  const j = await api({ action: "query", list: "search", srsearch, srnamespace: "6", srlimit: "12" });
  return ((j.query && j.query.search) || []).map((h) => h.title);
}

async function meta(titles) {
  if (!titles.length) return {};
  const j = await api({
    action: "query", titles: titles.join("|"), prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata", iiurlwidth: String(THUMB_W),
  });
  const out = {};
  ((j.query && j.query.pages) || []).forEach((p) => {
    const ii = p.imageinfo && p.imageinfo[0];
    if (!ii) return;
    const md = ii.extmetadata || {};
    out[p.title] = {
      title: p.title, url: clean(ii.url), thumb: clean(ii.thumburl || ii.url),
      width: ii.width, height: ii.height, mime: ii.mime, page: ii.descriptionurl,
      licence: licenceClass(md),
      licenceName: strip((md.LicenseShortName && md.LicenseShortName.value) || ""),
      artist: strip((md.Artist && md.Artist.value) || ""),
      desc: strip((md.ImageDescription && md.ImageDescription.value) || ""),
      categories: strip((md.Categories && md.Categories.value) || ""),
    };
  });
  return out;
}

/* Returns the candidates that clear the same bar `pick-images.js --build` applies at the last gate:
   an accepted licence, an attributable author where the licence needs one, and enough pixels.  A
   candidate this refuses is one that could not have shipped anyway, so refusing it here is what
   keeps the suggestion honest rather than merely long. */
async function suggest(subject) {
  let hits = await searchOnce(subject, false);
  let info = await meta(hits);
  let ok = hits.filter((h) => info[h] && usable(info[h]) === "ok");
  if (!ok.length) {
    await sleep(150);
    hits = await searchOnce(subject, true);
    info = Object.assign(info, await meta(hits.filter((h) => !info[h])));
    ok = hits.filter((h) => info[h] && usable(info[h]) === "ok");
  }
  return ok
    .filter((h) => OK_LICENCES.has(info[h].licence))
    .filter((h) => !NEEDS_ATTRIBUTION.has(info[h].licence) || attributableAuthor(info[h]))
    .slice(0, 5)
    .map((h) => info[h]);
}

/* `kind` decides the line printed underneath, because the three surfaces install a picture three
   different ways: a glossary term and a card go through `add-images.js` (five fields), an artefact
   carries three fields and is written by `add-artefacts.js` or the Admin editor. */
async function report(kind, key, subject) {
  let list;
  try { list = await suggest(subject); }
  catch (e) { console.log(`  (no picture looked for: ${e.message})`); return; }
  if (!list.length) {
    console.log(`  no usable picture found for "${subject}" — ship it without one and say why, or search by hand.`);
    return;
  }
  console.log(`  ${list.length} picture candidate${list.length > 1 ? "s" : ""} for "${subject}" — CHECK EACH IS THE RIGHT SUBJECT before using one:`);
  list.forEach((i, n) => {
    const lic = i.licence === "pd" ? "public domain" : (i.licenceName || i.licence);
    console.log(`   ${n}  ${i.title.replace(/^File:/, "")}  [${lic}, ${i.width}×${i.height}]`);
    if (i.desc) console.log(`      ${i.desc.slice(0, 120)}`);
    console.log(`      ${i.page}`);
  });
  console.log(`  to install one: add { "${kind}": { "${key}": {…} } } to a batch and run \`node .claude/add-images.js <batch.json>\``);
  console.log("  (or run the pipeline: .claude/search-images.js --queries=<file> then pick-images.js --build)");
}

module.exports = { suggest, report };

if (require.main === module) {
  const args = process.argv.slice(2);
  const subject = args.find((a) => !a.startsWith("--"));
  const slug = (args.find((a) => a.startsWith("--slug=")) || "").split("=")[1] || subject;
  if (!subject) { console.error('usage: node .claude/suggest-image.js "<subject>" [--slug=<key>]'); process.exit(1); }
  report("glossary", slug, subject).catch((e) => { console.error(e.message); });
}
