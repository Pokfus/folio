#!/usr/bin/env node
/*
  Dev-only, run manually. Fetches the PRIMARY coordinates of the glossary's point-locations from Wikipedia
  and writes them into `window.GLOSSARY_PLACES` at the foot of glossary.js.

  This exists so the gloss popup's map-marker button (see glossPlace in app.js) can put a term on the Atlas.
  A term that names a COUNTRY needs nothing here — it is matched to world.js by name and lit up. What needs
  a coordinate is a term that names a POINT: a cave, a gorge, a dig site, a named region.

  The coordinates are FETCHED, never guessed. A glossary slug IS a Wikipedia article slug (the documented
  convention), so each term's coordinate is the one that article publishes; a term whose article has no
  primary coordinate simply gets no entry, and its popup shows no marker. Nothing here is written by hand.

    node .claude/fetch-place-coords.js            # fetch the list below
    node .claude/fetch-place-coords.js --check    # report what is stored, fetch nothing

  A CONTINENT, AN OCEAN or a whole hemisphere is deliberately NOT in the list: those articles do carry a
  centroid, but a gold dot in the middle of Africa labelled "Africa" points at nothing a reader was asking
  about. The marker is for places you can go to.
*/
const fs = require("fs"), path = require("path");
const glossPath = path.join(__dirname, "..", "glossary.js");
const worldPath = path.join(__dirname, "..", "world.js");

/* The point-locations, by glossary slug. Add to this list as location terms are written (the card→glossary
   pairing plan will bring caves and dig sites in by the dozen), then re-run. */
const SLUGS = [
  "Lomekwi", "Lomekwi_3", "Olduvai_Gorge", "Saint-Acheul", "Dmanisi", "Le_Moustier",
  "Lake_Turkana", "Gona,_Ethiopia", "Hadar,_Ethiopia", "Johannesburg", "Taung",
  "Awash_River", "Afar_Region", "Sicily", "Skhul_Cave", "Qafzeh_Cave", "Blombos_Cave",
  "Swabian_Jura", "Swabia", "Chauvet_Cave", "Lascaux", "Cave_of_Altamira", "Sungir",
  "Sulawesi", "Great_Britain", "Doggerland", "Beringia", "Siberia", "Alaska",
  "Mesopotamia", "Sahara", "Fertile_Crescent", "Near_East", "Fennoscandia",
  "Pacific_Northwest_Coast", "Laurentide_ice_sheet", "Fennoscandian_ice_sheet",
];

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
const win = loadWindow(glossPath);
const G = win.GLOSSARY || {}, HAVE = win.GLOSSARY_PLACES || {};

if (process.argv.includes("--check")) {
  const keys = Object.keys(HAVE);
  console.log("stored point-locations: " + keys.length);
  keys.forEach((k) => console.log("  " + k + "  [" + HAVE[k].join(", ") + "]"));
  const missing = SLUGS.filter((s) => !HAVE[s]);
  if (missing.length) console.log("not stored: " + missing.join(", "));
  process.exit(0);
}

const wanted = SLUGS.filter((s) => {
  if (!(s in G)) { console.warn("skipped " + s + " — no glossary term with that slug"); return false; }
  return true;
});

(async () => {
  const out = Object.assign({}, HAVE);
  /* ONE TITLE PER REQUEST. Asking for forty at once looked economical and quietly lost most of them: with
     `prop=coordinates` the API paginates, returns the coordinate for a handful and a `continue` token for
     the rest, so a single-response reader records ten of thirty-seven and reports the other twenty-seven as
     having no coordinate at all — which is indistinguishable from the truth. One at a time is slower and
     says exactly what each article carries. */
  for (const slug of wanted) {
    const url = "https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=coordinates&coprimary=primary&titles=" +
      encodeURIComponent(slug.replace(/_/g, " "));
    // the API rate-limits an unauthenticated caller hard; back off and retry rather than recording a 429
    // as "this article has no coordinate", which is the one wrong answer this script must never give
    let j = null;
    for (let attempt = 0; attempt < 5 && !j; attempt++) {
      if (attempt) await new Promise((r) => setTimeout(r, 1500 * Math.pow(2, attempt - 1)));
      try {
        const res = await fetch(url, { headers: { "User-Agent": "folio-dev-script/1.0 (glossary place coordinates)" } });
        if (res.status === 429) { continue; }
        if (!res.ok) { console.error("HTTP " + res.status + ": " + slug); break; }
        j = await res.json();
      } catch (e) { console.error("fetch failed: " + slug + " — " + e.message); }
    }
    if (!j) { console.error("gave up (rate limited): " + slug); continue; }
    const pages = (j.query && j.query.pages) || {};
    let got = null;
    Object.keys(pages).forEach((pid) => {
      const c = pages[pid].coordinates && pages[pid].coordinates[0];
      if (c && isFinite(c.lon) && isFinite(c.lat)) got = [Math.round(c.lon * 1e4) / 1e4, Math.round(c.lat * 1e4) / 1e4];
    });
    if (!got) { console.warn("no primary coordinate: " + slug); continue; }
    out[slug] = got;
    await new Promise((r) => setTimeout(r, 900));   // be polite to the API
  }

  /* ---- and the COUNTRY join, which needs no network at all -------------------------------------------
     A term that names a country is not given a coordinate: the Atlas lights up its borders instead, which
     is what the reader asked to see. The join is done HERE, at build time, because world.js is a lazy
     1.6 MB bundle and the gloss popup has to decide whether to show its marker without it — so the answer
     ships as a table. Matching is by the term's display name, then by a few names the two spell
     differently; anything unmatched simply gets no marker, which is the honest outcome. */
  const wwin = loadWindow(worldPath);
  const GEO = wwin.WORLD_GEO || [];
  const byName = new Map(GEO.map((c) => [String(c.n).toLowerCase(), c.n]));
  const TITLES = win.GLOSSARY_TITLES || {}, TAGS = win.GLOSSARY_TAGS || {};
  const ALIAS = {   // glossary slug -> the name world.js uses
    United_States: "United States of America", Czech_Republic: "Czechia", The_Bahamas: "The Bahamas",
    The_Gambia: "The Gambia", Ivory_Coast: "Ivory Coast", East_Timor: "East Timor",
    "Georgia_(country)": "Georgia", Republic_of_the_Congo: "Republic of the Congo",
    Democratic_Republic_of_the_Congo: "Democratic Republic of the Congo",
    Federated_States_of_Micronesia: "Federated States of Micronesia",
    State_of_Palestine: "Palestine", Vatican_City: "Vatican", Cape_Verde: "Cape Verde",
    "São_Tomé_and_Príncipe": "São Tomé and Principe", Eswatini: "eSwatini",
  };
  const countries = {};
  Object.keys(G).forEach((slug) => {
    if (!(TAGS[slug] || []).includes("place")) return;
    const cand = [ALIAS[slug], TITLES[slug], slug.replace(/_/g, " ")].filter(Boolean);
    for (const c of cand) { const hit = byName.get(String(c).toLowerCase()); if (hit) { countries[slug] = hit; return; } }
  });

  // ---- write the tables at the foot of glossary.js ----------------------------------------------------
  let src = fs.readFileSync(glossPath, "utf8");
  const keys = Object.keys(out).sort();
  const block = "\n/* Point-locations for the gloss popup's map-marker button: slug -> [lon, lat], fetched from\n" +
    "   Wikipedia's own primary coordinates by .claude/fetch-place-coords.js. A term naming a COUNTRY needs no\n" +
    "   entry — it is matched to world.js by name and lit up instead. Never hand-written. */\n" +
    "window.GLOSSARY_PLACES = Object.assign(window.GLOSSARY_PLACES || {}, {\n" +
    keys.map((k) => JSON.stringify(k) + ": [" + out[k][0] + ", " + out[k][1] + "]").join(",\n") + "\n});\n" +
    "\n/* Glossary terms that name a country the Atlas draws: slug -> the name world.js uses. Joined at build\n" +
    "   time by the same script, because world.js is lazy and the popup must decide without it. */\n" +
    "window.GLOSSARY_MAP_COUNTRY = Object.assign(window.GLOSSARY_MAP_COUNTRY || {}, {\n" +
    Object.keys(countries).sort().map((k) => JSON.stringify(k) + ": " + JSON.stringify(countries[k])).join(",\n") + "\n});\n";
  const marker = "window.GLOSSARY_PLACES = Object.assign(window.GLOSSARY_PLACES || {}, {";
  if (src.indexOf(marker) >= 0) {
    const a = src.lastIndexOf("/* Point-locations for the gloss popup's map-marker button");
    src = src.slice(0, a >= 0 ? a : src.indexOf(marker)).replace(/\s*$/, "\n") + block;
  } else {
    src = src.replace(/\s*$/, "\n") + block;
  }
  fs.writeFileSync(glossPath, src);
  try { loadWindow(glossPath); } catch (e) { console.error("ERROR: glossary.js no longer parses: " + e.message); process.exit(1); }
  console.log("stored " + keys.length + " point-location(s) and " + Object.keys(countries).length + " country match(es) in glossary.js");
  {
    const un = Object.keys(G).filter((k) => (TAGS[k] || []).includes("place") && !countries[k] && !out[k]);
    if (un.length) console.log("no map target (no marker will show): " + un.length + " place-tagged term(s)");
  }
  const missing = SLUGS.filter((s) => !out[s]);
  if (missing.length) console.log("no coordinate found for: " + missing.join(", "));
})();
