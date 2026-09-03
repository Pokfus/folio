#!/usr/bin/env node
"use strict";
/*
  fetch-geo-images.js — a picture for every card in a GEOGRAPHY collection, to the two rules the
  request sets. Standalone Node helper, zero deps, resumable. Not part of the site.

    node .claude/fetch-geo-images.js <batch.json> [--out=<file>] [--limit=N] [--force]

  THE TWO RULES, which are the whole reason this is not `fetch-images.js` (Sep 2026, on request):
  "cards about regions like states, provinces, etc., should feature a picture of the most famous or
  significant natural wonder/landmark. Cards about cities should feature a picture of the city — NOT a
  particular building or small place within the city, but the city zoomed out, as a skyline or aerial
  view."

  · A REGION'S PICTURE IS OF A NAMED LANDMARK, AND THE NAME IS DECLARED IN THE BATCH. Which of Arizona's
    landmarks is "the most famous" is an editorial judgement and there is no metadata anywhere that makes
    it for you — a lead-image grab returns the state FLAG, which is what `pageimages` gives for
    `Arizona`. So the batch says `{"subject": "Grand Canyon"}` and this fetches the lead image of THAT
    article. The judgement stays with the author; the licence, the size and the attribution are read off
    Commons, which is the division `fetch-images.js`'s header argues for and this keeps.
  · A CITY'S PICTURE HAS TO BE THE CITY FROM A DISTANCE, and that IS machine-checkable — not perfectly,
    but far better than a name match. Commons is searched for the city's own views and a candidate is
    kept only if its file name or description carries one of `SKYLINE_RX`: skyline, aerial, panorama,
    cityscape, downtown, "from above", "seen from", birds-eye. A file called "St Josephs Cathedral,
    Hartford" fails that test, which is exactly the picture the request rules out.

  WHAT IT REFUSES, in every case:
   · a licence that is not public domain, CC0, CC BY or CC BY-SA — never NC, never ND, never fair use.
     Read from Commons' own `extmetadata`, never inferred from the page.
   · anything under 900px on the long side, which is the pipeline's bar everywhere else.
   · an SVG for a city or a landmark — a diagram is not a photograph of a place. (A flag is an SVG, and
     a flag is what this exists to avoid returning.)
   · a file whose author cannot be established where the licence requires attribution.

  IT WRITES A CANDIDATE FILE AND INSTALLS NOTHING. That is the standing rule for every image helper here
  and it is not weakened for volume: the output is `add-images.js`'s own batch shape, to be read and then
  applied. `--limit` and the cache make a long run resumable, since Commons rate-limits hard.

  Cache: .claude/image-cache/geo-*.json (gitignored).
*/
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CACHE = path.join(__dirname, "image-cache");
const UA = "folio-dev/1.0 (geography card pictures; contact via repo)";
const MIN_W = 900;
const SKYLINE_RX = /skyline|aerial|panorama|cityscape|downtown|from above|seen from|bird'?s.?eye|overlook|from the air/i;
/* A licence is judged by its own short name. Anything carrying NC or ND is refused outright rather than
   matched against a list of the acceptable ones, since Commons spells a licence a dozen ways. */
const OK_LIC = /^(cc0|public domain|pd|cc by(-sa)?([ -][0-9.]+)?( [a-z]+)?|attribution([ -]sharealike)?)/i;
const BAD_LIC = /\b(nc|nd|noncommercial|non-commercial|noderiv|fair use|non-free)\b/i;

/* NOT A PICTURE OF A PLACE — the two families a sheet of 38 turned up (Sep 2026), and BOTH need
   the leading word boundary LEFT OFF. Commons filenames run words together (`Chesapeakelandsat.jpeg`
   is the whole of why this is written twice rather than once), so `\blandsat\b` matches nothing on
   the very file it was written for. `sentinel` keeps its hyphen — the satellites are Sentinel-1 and
   Sentinel-2, and Sentinel Peak is a real Tucson landmark a card may legitimately want. */
/* `seen from orbit`, an `STS\d\d` shuttle frame and an `ISS\d` expedition frame are all the same
   picture as a Landsat scene wearing a different name — a photograph OF a place from outside the
   atmosphere, which is a diagram of it rather than a view. `montage` and `banner` are here for a
   different reason: a montage is several pictures in one and a wiki banner is a 7:1 sliver, and
   neither renders as a card illustration. */
const SPACEBORNE = /(satellite|landsat|sentinel-\d|from space|from orbit|copernicus|modis|nlcd|\bsts\d\d|\biss\d)/i;
const NOTAPHOTO = /(montag|banner|non.political|\bpng$)/i;
/* `Txu-…` / `…pclmaps…` are the University of Texas map library's scans, which are enormous and so
   win any largest-file tie-break: they gave Inner Mongolia a topographic sheet and Qinghai a geological
   one, neither of which says "map" anywhere in its name. */
const SURVEY = /(usgs|topograph|survey photo|geological survey|^file:txu-|pclmaps)/i;

const die = (m) => { console.error("ERROR: " + m); process.exit(1); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(host, params, tries) {
  const url = "https://" + host + "/w/api.php?" + new URLSearchParams(Object.assign({ format: "json", formatversion: "2" }, params));
  /* SIX TRIES, NOT FOUR, AND A LONGER FLOOR. Commons throttles a sustained run hard, and a throttled
     request that runs out of retries is recorded as "no file info for File:X" — which reads as a file
     that does not exist and is nothing of the kind. Two states were written off that way (Delicate Arch,
     Crater Lake) before the same URLs were tried by hand and answered at once. A miss must mean the
     picture is unusable, never that the network was busy. */
  for (let i = 0; i < (tries || 6); i++) {
    if (i) await sleep(1500 * Math.pow(2, i - 1));
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (r.status === 429 || r.status >= 500) continue;
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { /* retry */ }
  }
  return null;
}

// the lead image of an article, as a File: title
async function leadFile(title) {
  const j = await api("en.wikipedia.org", { action: "query", redirects: "1", prop: "pageimages", piprop: "name", titles: title });
  const p = j && j.query && j.query.pages && j.query.pages[0];
  return p && p.pageimage ? "File:" + p.pageimage : null;
}

/* ---- WHICH FILES ARE OF THIS CITY, AND HOW THAT IS ESTABLISHED ----
   A FREE-TEXT COMMONS SEARCH IS NOT EVIDENCE OF SUBJECT, and the first version of this learned it the
   hard way: searching `"Phoenix, Arizona" skyline` returned `File:Top of Rock Cropped.jpg`, which is a
   photograph of NEW YORK from the Rockefeller Center — the Empire State Building plainly in it — because
   somewhere in that file's text the words matched. It passed every other test: CC BY-SA, 1,724px, a
   description carrying one of the view words. That is exactly the failure `pick-images.js`'s header
   warns about, and it would have shipped a picture of New York on the card asking for Arizona's capital.

   SO SUBJECT COMES FROM CATEGORY MEMBERSHIP, which is a claim somebody made about the file rather than a
   word that happens to appear near it. Commons files the views of a city under its own categories, and
   this walks the ones that mean "the whole place from a distance" in the order they are most likely to:
   an aerial-photographs category first, then skyline, then the general views category. A file is kept
   only if it is IN one of them.
   AND THE NAME MUST STILL BE THERE, as a second, independent check: the city's own name (before the
   comma, so "Phoenix" rather than "Phoenix, Arizona") has to appear in the file's title or description.
   Either test alone can be fooled; a file that is both categorised as a view OF this city and named
   after it is one two different editors have said the same thing about. */
const CITY_CATS = (city) => {
  const bare = city.split(",")[0].trim();
  const out = [];
  for (const c of [city, bare]) {
    out.push("Category:Aerial photographs of " + c);
    out.push("Category:Skyline of " + c);
    out.push("Category:Views of " + c);
    out.push("Category:" + c + " skyline");
  }
  return out.filter((v, i) => out.indexOf(v) === i);
};
async function cityFiles(city, article) {
  const bare = city.split(",")[0].trim().toLowerCase();
  const out = [];
  for (const cat of CITY_CATS(city)) {
    const j = await api("commons.wikimedia.org", { action: "query", list: "categorymembers", cmtitle: cat, cmtype: "file", cmlimit: "40" });
    const hits = (j && j.query && j.query.categorymembers) || [];
    hits.forEach((h) => {
      // the second, independent check: the file is named for the place as well as filed under it
      if (String(h.title).toLowerCase().indexOf(bare) < 0) return;
      if (out.indexOf(h.title) < 0) out.push(h.title);
    });
    if (out.length >= 24) break;
  }
  /* …AND THE FILES ON THE CITY'S OWN ARTICLE, which is the second honest source of subject and covers
     the cities Commons has not categorised (Denver and Juneau both missed on categories alone). A file
     USED ON the article about a place is a file an editor put there to illustrate that place, which is
     the same kind of claim a category is; the name test and the wide-view test below both still apply,
     so a picture of one building on the article does not get through. `prop=images` rather than
     `pageimages`, because the lead image of a city article is very often a MONTAGE of several small
     pictures — which is not "the city zoomed out" — and the wide view is usually further down. */
  if (out.length < 6) {
    const j = await api("en.wikipedia.org", { action: "query", redirects: "1", prop: "images", imlimit: "160", titles: article || city });
    const p0 = j && j.query && j.query.pages && j.query.pages[0];
    ((p0 && p0.images) || []).forEach((im) => {
      const t = im.title;
      if (!/\.(jpe?g|png)$/i.test(t)) return;
      if (String(t).toLowerCase().indexOf(bare) < 0) return;
      if (out.indexOf(t) < 0) out.push(t);
    });
  }
  return out;
}

// everything needed to judge and to credit one file
async function fileInfo(fileTitle) {
  const j = await api("commons.wikimedia.org", {
    action: "query", titles: fileTitle, prop: "imageinfo",
    iiprop: "url|size|extmetadata|mime",
    iiurlwidth: "1920",
  });
  const p = j && j.query && j.query.pages && j.query.pages[0];
  const ii = p && p.imageinfo && p.imageinfo[0];
  if (!ii) return null;
  const em = ii.extmetadata || {};
  const val = (k) => (em[k] && typeof em[k].value === "string" ? em[k].value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "");
  /* THE URL IS CLEANED, AND BOTH HALVES OF THAT ARE NECESSARY. Commons' `imageinfo` appends a
     `?utm_source=…&utm_campaign=imageinfo` query to every URL it hands back — tracking parameters that
     would be committed into data.js and served to every reader — and it returns the newer
     `thumb.wikimedia.org` host, where every picture already in the corpus is on `upload.wikimedia.org`.
     Neither is wrong in itself; both would make these 100 cards' pictures differ from the other 700's
     for no reason a later session could explain. */
  const clean = (u) => String(u || "").split("?")[0].replace(/^https:\/\/thumb\.wikimedia\.org\//, "https://upload.wikimedia.org/");
  return {
    title: p.title,
    src: clean(ii.thumburl || ii.url),
    width: ii.thumbwidth || ii.width,
    fullWidth: ii.width,
    mime: ii.mime || "",
    licence: val("LicenseShortName") || val("License"),
    artist: val("Artist"),
    desc: val("ImageDescription"),
    page: ii.descriptionurl || ("https://commons.wikimedia.org/wiki/" + encodeURIComponent(p.title)),
  };
}

function licenceOK(f) {
  const l = String(f.licence || "");
  if (!l) return false;
  if (BAD_LIC.test(l)) return false;
  return OK_LIC.test(l) || /^cc[ -]/i.test(l);
}
/* THE HOUSE CREDIT SHAPE IS `Author, LICENCE, via Wikimedia Commons. <url>` — the URL LAST, after a
   full stop, and never in brackets. That is what 567 of the site's 2,281 existing credits already say
   (the other 1,714 are a bare URL, which `mediaCreditHTML` turns into a link); a Commons file name is
   full of parentheses — `Historic Entrance (Mammoth Cave, Kentucky, USA) 2 (37773583192).jpg` — so a
   URL wrapped in another pair of them ends on `))` and reads as a typo wherever a reader copies it. */
function creditLine(f) {
  const bits = [];
  if (f.artist) bits.push(f.artist);
  if (f.licence) bits.push(f.licence);
  bits.push("via Wikimedia Commons");
  return bits.join(", ") + ". " + f.page;
}

(async () => {
  const batchPath = process.argv[2];
  if (!batchPath) die("usage: node .claude/fetch-geo-images.js <batch.json> [--out=file] [--limit=N]");
  const outArg = (process.argv.find((a) => a.startsWith("--out=")) || "").slice(6);
  const limit = +((process.argv.find((a) => a.startsWith("--limit=")) || "").slice(8)) || Infinity;
  const force = process.argv.includes("--force");
  const OUT = outArg || path.join(__dirname, "geo-images.batch.json");
  let batch;
  try { batch = JSON.parse(fs.readFileSync(batchPath, "utf8")); } catch (e) { die("could not read the batch: " + e.message); }
  const want = batch.cards || batch;
  if (!fs.existsSync(CACHE)) fs.mkdirSync(CACHE, { recursive: true });

  const win = {}; new Function("window", fs.readFileSync(path.join(ROOT, "data.js"), "utf8"))(win);
  const byId = new Map((win.CARD_DATA || []).map((c) => [c.id, c]));

  const result = { cards: {} };
  const missed = [];
  let n = 0;
  for (const id of Object.keys(want)) {
    if (n >= limit) break;
    const spec = want[id];
    const card = byId.get(id);
    if (!card) { missed.push([id, "not a card in data.js"]); continue; }
    const cachePath = path.join(CACHE, "geo-" + id + ".json");
    if (!force && fs.existsSync(cachePath)) {
      const hit = JSON.parse(fs.readFileSync(cachePath, "utf8"));
      if (hit.image) result.cards[id] = hit.image; else missed.push([id, hit.why || "cached miss"]);
      continue;
    }
    n++;
    let picked = null, why = "";
    if (spec.file) {
      /* A NAMED FILE, WHICH IS WHAT A REVIEW PRODUCES. The searches here find a subject's pictures;
         they cannot judge one, and the standing rule is that a picture is looked at before it is
         applied. So the sheet is read, and the handful the search got wrong are named outright —
         `White Sands National Park`'s article really does offer its VISITOR CENTRE as the only file
         over 900px, and no scoring rule can turn that into a photograph of the dunes. The named file
         still goes through `fileInfo` and `licenceOK`, so a pinned choice cannot smuggle in a
         non-free or undersized picture; it is the SUBJECT that is being asserted by hand, never the
         licence. */
      const t = /^File:/i.test(spec.file) ? spec.file : "File:" + spec.file;
      const f = await fileInfo(t);
      if (!f) why = "no file info for " + t;
      else if (f.fullWidth < MIN_W) why = t + " is only " + f.fullWidth + "px";
      else if (!licenceOK(f)) why = t + " is " + (f.licence || "unlicensed");
      else picked = f;
    } else if (spec.city) {
      /* EVERY CANDIDATE IS SCORED AND THE BEST TAKEN, rather than the first that passes. Taking the
         first gave Phoenix a sepia aerial from the 1970s and Boston one from 1975 — both genuinely of
         the right city, both the wrong picture for a card, because the categories are walked
         aerial-first and the oldest photographs are the ones that have been catalogued longest.
         What the score prefers, in order: a file that calls itself a SKYLINE over one that calls itself
         an aerial (a skyline is the view the request asks for; an aerial is often straight down), a
         recent photograph over an old one (a year in the name before 2000 is what dates these), and a
         larger file over a smaller. It is a ranking rather than a filter, so a city with only one
         usable picture still gets it. */
      /* SCORED ON THE NAME FIRST, AND ONLY THE BEST FEW ARE FETCHED. `fileInfo` asks for `extmetadata`,
         which is the expensive call, and asking it for two dozen candidates a city was costing minutes
         per card and being throttled hard — fifty capitals would have run for hours. Every term the
         score uses except the width is in the FILE NAME, so the ranking is done on titles alone and the
         full record is fetched for the top few only. The licence and the size are still read off Commons
         before anything is used; what is skipped is reading them for candidates that were never going to
         win. */
      const files = await cityFiles(spec.city, spec.article);
      const nameScore = (t) => {
        let sc = 0;
        if (/skyline/i.test(t)) sc += 6;
        if (/panorama|cityscape/i.test(t)) sc += 4;
        if (/aerial|from above|from the air|bird/i.test(t)) sc += 2;
        if (/downtown/i.test(t)) sc += 1;
        const yr = (String(t).match(/\b(1[89]\d{2}|20\d{2})\b/) || [])[1];
        if (yr && +yr < 2000) sc -= 6;                 // a dated photograph of a city is a picture of the past
        if (/cockpit|windshield|window|wing|propeller/i.test(t)) sc -= 5;
        return sc;
      };
      const shortlist = files
        .filter((t) => !/\.svg$/i.test(t) && SKYLINE_RX.test(t))
        .map((t) => [nameScore(t), t])
        .sort((a, b) => b[0] - a[0])
        .slice(0, 5)
        .map((x) => x[1]);
      const cands = [];
      for (const t of shortlist) {
        const f = await fileInfo(t);
        if (!f) continue;
        if (/svg/i.test(f.mime)) continue;
        if (f.fullWidth < MIN_W) continue;
        if (!licenceOK(f)) continue;
        /* THE RULE: THE CITY FROM A DISTANCE, NOT A BUILDING IN IT. A `Views of` category holds street
           scenes and single buildings too, so the file itself still has to read as a wide view — and it
           is tested on the TITLE alone rather than on the description, which is where the New York file
           slipped through. A photographer names a skyline "…skyline"; a description can mention one in
           passing while the picture is of something else. */
        cands.push([nameScore(t) + Math.min(3, Math.floor(f.fullWidth / 2000)), f]);
      }
      cands.sort((a, b) => b[0] - a[0]);
      picked = cands.length ? cands[0][1] : null;
      if (!picked) why = "no freely-licensed wide view found for " + spec.city;
    } else if (spec.subject) {
      /* THE LEAD IMAGE FIRST, THEN THE REST OF THE ARTICLE. The lead is the picture an editor chose to
         stand for the subject, so it is tried first and taken when it passes — but it fails often enough
         to need a fallback: it may be absent (`pageimages` returns nothing for Boundary Waters), too
         small (Cape Hatteras at 467px), or an SVG. Falling back to every file ON the article keeps the
         subject established the same way — a file on the article about a place is one an editor put
         there to illustrate that place — and picks the LARGEST that passes, which on a national park is
         almost always a landscape rather than a sign or a map.
         A file whose name says map, diagram, sign, logo, seal or chart is skipped outright: those are on
         these articles in numbers and none of them is a picture of the place. */
      const tried = [];
      const lead = await leadFile(spec.subject);
      if (lead) tried.push(lead);
      const consider = async (t) => {
        if (/\.svg$/i.test(t)) return null;
        /* WHAT IS NEVER A PICTURE OF A PLACE, found by looking at a sheet of 38 (Sep 2026). Maps, signs,
           seals and diagrams are on these articles in numbers. So is SATELLITE imagery — the lead image
           of `Chesapeake Bay` is a false-colour Landsat scene with a black corner, which is a diagram of
           the bay rather than a view of it — and so are the USGS survey photographs, which are a
           century old and monochrome (Mammoth Cave's lead was one). Both are legitimate pictures and
           neither is what a card asking a reader to recognise a place should show. */
        if (/\b(map|diagram|sign|logo|seal|chart|graph|plaque|flag|coat.of.arms|locator)\b/i.test(t)) return null;
        if (SPACEBORNE.test(t) || SURVEY.test(t) || NOTAPHOTO.test(t)) return null;
        const f = await fileInfo(t);
        if (!f || /svg/i.test(f.mime)) return null;
        if (f.fullWidth < MIN_W) return null;
        if (!licenceOK(f)) return null;
        return f;
      };
      if (lead) picked = await consider(lead);
      if (!picked) {
        const j = await api("en.wikipedia.org", { action: "query", redirects: "1", prop: "images", imlimit: "160", titles: spec.subject });
        const p0 = j && j.query && j.query.pages && j.query.pages[0];
        const files = ((p0 && p0.images) || []).map((im) => im.title).filter((t) => /\.(jpe?g|png)$/i.test(t));
        const cands = [];
        for (const t of files.slice(0, 26)) {
          const f = await consider(t);
          if (f) cands.push(f);
        }
        cands.sort((a, b) => b.fullWidth - a.fullWidth);
        picked = cands[0] || null;
        if (!picked) why = tried.length
          ? "nothing usable on " + spec.subject + " (lead " + tried[0] + " refused, " + files.length + " other file(s) tried)"
          : "no usable picture on " + spec.subject;
      }
    } else { missed.push([id, "the batch entry names none of `file`, `subject` or `city`"]); continue; }

    if (picked) {
      const label = spec.city || spec.subject || spec.name || "";
      const image = {
        src: picked.src,
        title: spec.name || label,
        desc: (spec.desc || (spec.city ? label + ", seen from a distance." : label + ".")),
        credit: creditLine(picked),
        alt: spec.alt || (spec.city ? "A wide view of " + label + "." : "A view of " + label + "."),
      };
      result.cards[id] = image;
      fs.writeFileSync(cachePath, JSON.stringify({ image }, null, 1));
      console.log("ok    " + id.padEnd(9) + label.padEnd(24) + String(picked.licence).padEnd(14) + picked.fullWidth + "px  " + picked.title.slice(0, 52));
    } else {
      missed.push([id, why]);
      fs.writeFileSync(cachePath, JSON.stringify({ why }, null, 1));
      console.log("MISS  " + id.padEnd(9) + (spec.city || spec.subject || spec.name || "").padEnd(26) + why.slice(0, 70));
    }
    await sleep(400);
  }
  fs.writeFileSync(OUT, JSON.stringify(result, null, 1));
  console.log("\n" + Object.keys(result.cards).length + " picture(s) written to " + path.relative(ROOT, OUT));
  if (missed.length) {
    console.log(missed.length + " without one:");
    missed.forEach((m) => console.log("  " + m[0] + "  " + m[1]));
  }
  console.log("\nLOOK AT EACH PICTURE before applying — a name match is confidently wrong in exactly the");
  console.log("way this site must not be. Then: node .claude/add-images.js " + path.relative(ROOT, OUT));
})();
