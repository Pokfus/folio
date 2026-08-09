#!/usr/bin/env node
"use strict";
/*
  search-images.js — second pass for terms whose own Wikipedia article yielded no public-domain
  picture.  Standalone Node helper, zero deps, resumable.  Not part of the site.

  WHY A SECOND PASS EXISTS.  fetch-images.js reads the files ON a term's article, which is the
  most relevant set there is and is also a set somebody else chose: an article often illustrates
  a public-domain OBJECT with a modern, CC-BY PHOTOGRAPH of it, and the article then offers
  nothing this bar accepts even though Commons holds a dozen public-domain photographs of the
  same thing.  The Venus of Willendorf is the standing example — the figurine is 30,000 years
  old and every picture of it on its own article is somebody's copyrighted photograph.

  Searching Commons directly recovers those, at the cost of relevance: a search result is a file
  whose NAME or description matches a word, which is a far weaker claim than "an editor put this
  on that article".  So everything here is a CANDIDATE and nothing ships unreviewed.

  Usage:
    node .claude/search-images.js --cards       # answer terms of cards that still have no picture
    node .claude/search-images.js --terms       # every glossary term that still has none
    node .claude/search-images.js --artefacts   # the reliquary's objects, which have no article
    node .claude/search-images.js --review [--from=N] [--count=N] [--artefacts]
    node .claude/search-images.js --queries=<map.json>   # hand-written queries, when a name is a bad search term

  THE ARTEFACTS ARE THE ONE FAMILY WITH NO WIKIPEDIA ARTICLE TO WALK.  A glossary key is a slug and a
  card resolves to one; an artefact is a row in `artefacts.js` with a NAME, and half of those names are
  a KIND rather than a thing — "Acheulean hand axe", "Flint scraper", "Roman gold aureus".  That cuts
  both ways: a named object (the Rosetta Stone) is easy to search and easy to get wrong by finding a
  replica or a different stone, while a kind is hard to search and almost impossible to get wrong,
  since any real Acheulean hand axe IS an Acheulean hand axe.  Both are searched the same way and both
  are reviewed by eye; the difference is only in what the reviewer is watching for.
*/

const fs = require("fs");
const path = require("path");
const { readJSON, usable, licenceClass } = require("./fetch-images.js");

const ROOT = path.join(__dirname, "..");
const CACHE_DIR = path.join(__dirname, "image-cache");
const FILES_CACHE = path.join(CACHE_DIR, "files.json");
const SEARCH_CACHE = path.join(CACHE_DIR, "searches.json");

const UA = "FolioImagePass/1.0 (https://github.com/Pokfus/folio; study site content pass)";
const THUMB_W = 1600;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(host, params) {
  const qs = new URLSearchParams({ format: "json", formatversion: "2", ...params });
  for (let a = 0; a < 5; a++) {
    try {
      const r = await fetch(`https://${host}/w/api.php?${qs}`, { headers: { "User-Agent": UA, Accept: "application/json" } });
      if (r.status === 429 || r.status >= 500) { await sleep(1500 * (a + 1)); continue; }
      if (!r.ok) throw new Error(r.status + " " + r.statusText);
      return await r.json();
    } catch (e) { if (a === 4) throw e; await sleep(1500 * (a + 1)); }
  }
}

const clean = (u) => (u && u.indexOf("?") > -1 ? u.slice(0, u.indexOf("?")) : u || "");
const strip = (h) => String(h || "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/\s+/g, " ").trim();

/* `filetype:bitmap` keeps SVG and video out, and `haswbstatement:P6216=Q19652` is Commons' own
   structured statement that a file's copyright status IS public domain — which is what makes a
   15-result page worth reading rather than 15 CC-BY photographs.  It is asked for in the QUERY
   and then CHECKED again against extmetadata, because a structured statement is a claim on the
   file page and the licence template is what the file is actually served under; where the two
   disagree the stricter reading wins.
   An `incategory:"PD-old-100"|incategory:…` chain was tried first and returns nothing at all —
   the OR form is not supported the way it looks, and it fails by matching zero rather than by
   erroring, so it reads as "Commons has no public-domain picture of the Venus of Willendorf". */
function query(term, wide) {
  const t = term.replace(/_/g, " ").replace(/\s*\([^)]*\)$/, "");
  /* `wide` drops the public-domain statement and leaves `filetype:bitmap`, for a second sweep once
     CC BY and CC BY-SA are on the table.  It is a SEPARATE pass rather than the default because a
     public-domain file costs the reader nothing and the site no attribution line, so it is worth
     preferring where one exists — the wide sweep is for subjects where none does. */
  return wide ? `${t} filetype:bitmap` : `${t} filetype:bitmap haswbstatement:P6216=Q19652`;
}

async function searchTerms(terms, cache, files, queryOf, wide) {
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    if (cache[term]) continue;
    let j;
    try {
      j = await api("commons.wikimedia.org", {
        action: "query", list: "search", srsearch: query((queryOf && queryOf[term]) || term, wide), srnamespace: "6", srlimit: "15",
      });
    } catch { cache[term] = { state: "error" }; continue; }
    const hits = ((j.query && j.query.search) || []).map((h) => h.title);
    cache[term] = { state: hits.length ? "hits" : "none", hits };
    // pull metadata for anything not already known
    const need = hits.filter((h) => !files[h]);
    for (let k = 0; k < need.length; k += 40) {
      const chunk = need.slice(k, k + 40);
      let m;
      try {
        m = await api("commons.wikimedia.org", {
          action: "query", titles: chunk.join("|"), prop: "imageinfo",
          iiprop: "url|size|mime|extmetadata", iiurlwidth: String(THUMB_W),
        });
      } catch { continue; }
      ((m.query && m.query.pages) || []).forEach((p) => {
        const ii = p.imageinfo && p.imageinfo[0];
        if (!ii) { files[p.title] = { missing: true }; return; }
        const md = ii.extmetadata || {};
        files[p.title] = {
          title: p.title, url: clean(ii.url), thumb: clean(ii.thumburl || ii.url),
          width: ii.width, height: ii.height, mime: ii.mime, page: ii.descriptionurl,
          licence: licenceClass(md),
          licenceName: strip((md.LicenseShortName && md.LicenseShortName.value) || ""),
          artist: strip((md.Artist && md.Artist.value) || ""),
          desc: strip((md.ImageDescription && md.ImageDescription.value) || ""),
          objectName: strip((md.ObjectName && md.ObjectName.value) || ""),
          date: strip((md.DateTimeOriginal && md.DateTimeOriginal.value) || ""),
          categories: strip((md.Categories && md.Categories.value) || ""),
        };
      });
      await sleep(120);
    }
    if (i % 10 === 0) {
      process.stderr.write(`  searched ${i}/${terms.length}\r`);
      fs.writeFileSync(SEARCH_CACHE, JSON.stringify(cache));
      fs.writeFileSync(FILES_CACHE, JSON.stringify(files));
    }
    await sleep(120);
  }
  process.stderr.write(`  searched ${terms.length}/${terms.length}\n`);
  fs.writeFileSync(SEARCH_CACHE, JSON.stringify(cache));
  fs.writeFileSync(FILES_CACHE, JSON.stringify(files));
}

/* ------------------------------------------------------------------ which */

function stillMissing() {
  global.window = {};
  require(path.join(ROOT, "glossary.js"));
  require(path.join(ROOT, "data.js"));
  const w = global.window;
  const batch = readJSON(path.join(CACHE_DIR, "batch.json"), { glossary: {}, cards: {} });
  const AL = w.GLOSSARY_ALIASES || {};
  const norm = (s) => String(s || "").toLowerCase().replace(/[_\s]+/g, " ").trim();
  const byName = {};
  Object.keys(w.GLOSSARY).forEach((k) => { byName[norm(k)] = k; });
  Object.keys(AL).forEach((k) => (AL[k] || []).forEach((a) => { if (!byName[norm(a)]) byName[norm(a)] = k; }));
  const cardTerms = [];
  for (const c of w.CARD_DATA) {
    if (batch.cards[c.id]) continue;
    const t = byName[norm(c.answerText)];
    if (t && !batch.glossary[t] && !cardTerms.includes(t)) cardTerms.push(t);
  }
  const shipped = w.GLOSSARY_IMAGES || {};
  const allTerms = Object.keys(w.GLOSSARY).filter((t) => !shipped[t] && !batch.glossary[t]);
  return { cardTerms, allTerms, batch, G: w.GLOSSARY, TAGS: w.GLOSSARY_TAGS || {} };
}

/* An artefact is keyed `artefact:<id>` in the search cache so it cannot collide with a glossary
   slug, and it is searched on its NAME plus its ORIGIN, which is where a generic name earns its
   keep.  The ORIGIN is deliberately NOT added to the query: CirrusSearch ANDs its terms, so
   "Corinthian bronze helmet The Greek world" matches nothing at all rather than matching better. */
function artefactTargets() {
  global.window = {};
  require(path.join(ROOT, "artefacts.js"));
  return (global.window.ARTEFACTS || []).filter((a) => !(a.image && a.image.src))
    .map((a) => ({ key: "artefact:" + a.id, q: a.name, id: a.id, name: a.name, rarity: a.rarity }));
}

function review(args) {
  const cache = readJSON(SEARCH_CACHE, {});
  const files = readJSON(FILES_CACHE, {});
  const from = Number((args.find((a) => a.startsWith("--from=")) || "--from=0").split("=")[1]);
  const count = Number((args.find((a) => a.startsWith("--count=")) || "--count=40").split("=")[1]);
  const wantArtefacts = args.includes("--artefacts");
  const TAGS = wantArtefacts ? {} : stillMissing().TAGS;
  const terms = Object.keys(cache)
    .filter((t) => wantArtefacts === t.startsWith("artefact:"))
    .filter((t) => (cache[t].hits || []).some((h) => files[h] && usable(files[h]) === "ok"));
  terms.sort();
  console.log(`# ${terms.length} terms with a searchable public-domain candidate; showing ${from}..${from + count}`);
  for (const t of terms.slice(from, from + count)) {
    console.log(`${t} [${(TAGS[t] || [])[0] || "?"}]`);
    (cache[t].hits || []).filter((h) => files[h] && usable(files[h]) === "ok").slice(0, 4)
      .forEach((h, i) => {
        const lic = files[h].licence === "pd" ? "" : "  [" + (files[h].licenceName || files[h].licence) + "]";
        console.log(`  ${i} ${h.replace(/^File:/, "").replace(/\.(jpg|jpeg|png|webp)$/i, "")}${lic}`);
      });
  }
}

async function main() {
  const args = process.argv.slice(2);
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  if (args.includes("--review")) return review(args);
  const cache = readJSON(SEARCH_CACHE, {});
  const files = readJSON(FILES_CACHE, {});
  let want, queryOf = null;
  const wide = args.includes("--wide");

  /* A HAND-WRITTEN QUERY IS THE LAST RESORT AND IT HAS TO EXIST, because the automatic one is the
     subject's own NAME and a name is sometimes the worst search term there is.  "Gladius" returns
     the swordfish, "Malia" a president's daughter, "Roman as" nothing at all — CirrusSearch ANDs
     its terms and `as` is a stopword.  What works is naming the thing the way a MUSEUM catalogues
     it ("Roman sword Mainz type", "Kangxi Tongbao"), and that is a judgement no rule makes.
     The file is `{ "<key>": "<query>" }` and the keys are the ordinary ones (`artefact:<id>`, a
     glossary slug), suffixed here with `|q` so a hand query's results sit beside the automatic
     sweep's rather than overwriting them. */
  const qf = args.find((a) => a.startsWith("--queries="));
  if (qf) {
    const map = JSON.parse(fs.readFileSync(qf.split("=").slice(1).join("="), "utf8"));
    want = Object.keys(map).map((k) => k + "|q");
    queryOf = Object.fromEntries(Object.keys(map).map((k) => [k + "|q", map[k]]));
    console.log(`${want.length} hand-written queries`);
    await searchTerms(want, cache, files, queryOf, true);
    const got = want.filter((t) => (cache[t].hits || []).some((h) => files[h] && usable(files[h]) === "ok"));
    console.log(`${got.length} of them returned a usable candidate`);
    return;
  }
  if (args.includes("--artefacts")) {
    let t = artefactTargets();
    if (wide) {
      /* only the ones the narrow sweep could not serve; a fresh key so both result sets survive */
      const done = readJSON(path.join(CACHE_DIR, "chosen-a1.json"), {});
      /* `in`, not a truthiness test: a chosen candidate INDEX is very often 0, and `!done[key]`
         reads that as "not chosen" — which sent 89 artefacts to the wide sweep instead of 50. */
      t = t.filter((x) => !(x.key in done)).map((x) => ({ ...x, key: x.key + "|wide" }));
    }
    want = t.map((x) => x.key);
    queryOf = Object.fromEntries(t.map((x) => [x.key, x.q]));
    console.log(`${want.length} artefacts to search`);
  } else {
    const { cardTerms, allTerms } = stillMissing();
    const base = args.includes("--terms") ? allTerms : cardTerms;
    want = wide ? base.map((t) => t + "|wide") : base;
    if (wide) queryOf = Object.fromEntries(base.map((t) => [t + "|wide", t]));
    console.log(`${want.length} terms to search`);
  }
  await searchTerms(want, cache, files, queryOf, wide);
  const ok = want.filter((t) => (cache[t].hits || []).some((h) => files[h] && usable(files[h]) === "ok"));
  console.log(`${ok.length} of them have at least one usable public-domain candidate`);
}

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
