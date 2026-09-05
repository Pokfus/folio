// Dev-only: build world-capitals.js = the capital city of every country and territory Folio cards, as a
// POINTS TABLE for a map card's gold dot. Run: node .claude/build-world-capitals.js
//
//   window.WORLD_CAPITALS = { "<city>": { s: "<world.js country name>", c: [lon, lat] } }
//
// It is `world.js`'s companion exactly as us-states.js's US_CAPITALS is the companion of its own shapes,
// and it exists for the same reason: a capital card's ANSWER is a city, so its map has to put a dot on
// that city, which needs a coordinate — and two hundred and thirty hand-entered coordinates are two
// hundred and thirty chances to be quietly wrong about a place nobody will check. A dot a degree out
// still draws, inside the shaded country, on a card that looks entirely correct.
//
// `s` names the world.js COUNTRY the city stands in, and it rides along so the join can be CHECKED rather
// than assumed: add-card.js refuses a card whose `dot` sits in a country other than the one its `key`
// shades (test-map-cards asserts the same).
//
// THREE SOURCES, IN THIS ORDER, AND EACH IS A DIFFERENT KIND OF ANSWER:
//
//  1. Natural Earth 10m populated places, the `Admin-0 capital` / `Admin-0 capital alt` /
//     `Admin-0 region capital` classes, joined to world.js by ISO_A2. That is 218 of the 258 world.js
//     entries and every sovereign state.
//  2. The same file's `Admin-1 capital` class, where the point's own ADM0NAME is a DEPENDENCY in
//     world.js — Natural Earth files San Juan, Tórshavn, Avarua, Alofi and Capitol Hill as admin-1
//     capitals of a territory rather than as capitals of a country, which they are not. The ADM0NAME
//     join also recovers the two entries whose ISO_A2 is -99 (Kosovo, Somaliland).
//  3. SUPPLEMENT, below: seventeen micro-territories whose seat Natural Earth carries no point for at
//     all — Road Town, Charlotte Amalie, The Valley, Saint Helier. They are fetched from the named
//     WIKIPEDIA ARTICLE'S OWN PUBLISHED PRIMARY COORDINATE, the route .claude/add-locators.js uses, so
//     what is declared here is an ARTICLE TITLE — a name a reader can check — and never a number.
//
// `cities.js` is the wrong source and was checked, for the two reasons build-us-states.js records: it
// lives in the ~9.9 MB `atlas` bundle, which a map card must never pull in, and it drops small places.
//
// The 19 MB source is cached under .claude/ne-cache/ (gitignored) so a re-run costs no refetch; pass
// --refetch to replace it, and --no-net to skip the supplement (the shipped file's own values are
// re-read, so a no-net run still reproduces it byte for byte).
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const PLACES_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places.geojson";
const CACHE_DIR = path.join(__dirname, "ne-cache");
const PLACES_CACHE = path.join(CACHE_DIR, "ne_10m_populated_places.geojson");
const OUT = path.join(ROOT, "world-capitals.js");
const DP = 4;                                  // ~11 m; a dot is a dot, and world.js's own 2dp is 1.1 km
const Q = (v) => Math.round(v * Math.pow(10, DP)) / Math.pow(10, DP);

/* THE NAME A CARD ASKS FOR IS THE NAME A READER WOULD GIVE, AND NATURAL EARTH'S IS SOMETIMES NEITHER
   CURRENT NOR ENGLISH. Each row is a judgement, so each carries its reason; the builder refuses a row
   whose left-hand side is not in the source, so a name Natural Earth later corrects fails loudly here
   rather than leaving a rename that silently matches nothing. */
const RENAME = {
  "Nur-Sultan": "Astana",              // renamed back in 2022; Natural Earth still carries the 2019 name
  "København": "Copenhagen",      // the Danish name, where every other capital is in English
  Bogota: "Bogotá",               // the accent is part of the name
  Sanaa: "Sana'a",
  Agana: "Hagåtña",          // renamed 1998; Agana is the pre-1998 spelling
  Macau: "Macau",                      // the territory and its city share a name — kept, and disambiguated below
  "Grand Turk": "Cockburn Town",       // Grand Turk is the ISLAND; the town on it is Cockburn Town
  Melekeok: "Ngerulmud",               // NE marks the STATE; the seat of government built in it is Ngerulmud
  /* Four capitals Natural Earth names after the country they are in. The bare form is what the country
     is called, so a card asking for the capital of Andorra and answering "Andorra" asks nothing; each of
     these has a fuller name that its own government uses. */
  Andorra: "Andorra la Vella",
  Luxembourg: "Luxembourg City",
  "San Marino": "City of San Marino",
  Djibouti: "Djibouti City",
};

/* THREE KINDS OF POINT IN THOSE CLASSES ARE NOT A CAPITAL, and each is dropped with its reason. Left
   uncleaned the file says Kyoto is a seat of Japan and Edinburgh one of the United Kingdom — both of
   which add-card.js's own dot-in-country check would happily pass, because both really are in the
   country. A table of "capitals" that carries a former capital is the sort of error a card inherits.
     · CAPIN "Former capital"  — Kyoto, Lagos, Yangon, Baguio: a seat that was, not one that is.
     · CAPIN "Claimed as …"    — Laayoune under Morocco and Bir Lehlou under Western Sahara: each is one
       side's claim about the same disputed territory, so neither can be the answer to "what is the
       capital of X". Western Sahara therefore has no capital here, deliberately.
     · An "Admin-0 region capital" of a country that ALSO has an Admin-0 capital — Edinburgh, Cardiff,
       Belfast, Funchal, Ponta Delgada, Novi Sad, Batumi, Sukhumi, Banja Luka. Natural Earth uses that
       class for two different things: the seat of a DEPENDENCY (Nuuk, Hamilton, Stanley), which is what
       this file wants, and the seat of an autonomous REGION inside a country, which it does not. Having
       the country's own capital already is what tells the two apart.
   DROP is for a point none of those rules reaches. */
const DROP = {
  "Johannesburg|South Africa": "not a capital: South Africa's three seats are Pretoria, Cape Town and Bloemfontein, and Natural Earth files a fourth point here",
  "Kyoto|Japan": "not a capital: Natural Earth marks Kyoto Japan's \"official\" capital and Tokyo the de facto one, which no Japanese law says — the seat moved in 1868 and nothing was left behind",
  "Baguio|Philippines": "not a capital: designated the SUMMER capital in 1903, which is a place the government goes in April, not the seat",
};

/* A SECOND SEAT NATURAL EARTH HAS NOT CAUGHT UP WITH. Where a country's government has moved, the
   `Admin-0 capital` class goes on saying what it said, and the new seat — if the file has it at all —
   sits in the `Admin-1 capital` class, which rule 2 above admits only for a dependency. So the row is
   DECLARED, with the reason beside it, exactly as DROP and RENAME are: the alternative is a rule clever
   enough to guess which of a country's provincial capitals is really the seat of its government, which
   is not a judgement a heuristic can make. The builder refuses a row it cannot find in the source, so a
   row Natural Earth later fixes fails loudly here rather than quietly duplicating a point.
   The country keeps its Admin-0 point as well: a country with two seats has two cards. */
const SECOND_SEAT = {
  "Gitega|Burundi": "Burundi moved its political capital from Bujumbura to Gitega in 2019 — Natural Earth still files Bujumbura as the Admin-0 capital, and carries Gitega only as an Admin-1 capital, under the wrong province at that (ADM1NAME reads Muramvya, where Gitega is the seat of Gitega province)",
};
const SECOND_SEAT_NAMES = new Set(Object.keys(SECOND_SEAT).map((k) => k.split("|")[0]));

/* Seventeen seats Natural Earth carries no point for. The VALUE is an article title, not a coordinate:
   the number is fetched from that article's own published primary coordinate, so a wrong row is a wrong
   NAME, which is visible, rather than a wrong number, which is not. */
const SUPPLEMENT = {
  "British Virgin Is.": { city: "Road Town", article: "Road Town" },
  "U.S. Virgin Is.": { city: "Charlotte Amalie", article: "Charlotte Amalie, U.S. Virgin Islands" },
  Anguilla: { city: "The Valley", article: "The Valley, Anguilla" },
  "Sint Maarten": { city: "Philipsburg", article: "Philipsburg, Sint Maarten" },
  "St-Martin": { city: "Marigot", article: "Marigot, Saint Martin" },
  "St-Barthélemy": { city: "Gustavia", article: "Gustavia, Saint Barthélemy" },
  Montserrat: { city: "Brades", article: "Brades" },
  "St. Pierre and Miquelon": { city: "Saint-Pierre", article: "Saint-Pierre, Saint Pierre and Miquelon" },
  "Saint Helena": { city: "Jamestown", article: "Jamestown, Saint Helena" },
  Jersey: { city: "Saint Helier", article: "Saint Helier" },
  Guernsey: { city: "Saint Peter Port", article: "Saint Peter Port" },
  "Wallis and Futuna Is.": { city: "Mata-Utu", article: "Mata-Utu" },
  "Norfolk Island": { city: "Kingston", article: "Kingston, Norfolk Island" },
  "Pitcairn Is.": { city: "Adamstown", article: "Adamstown, Pitcairn Islands" },
  Nauru: { city: "Yaren", article: "Yaren District" },
  Palau: { city: "Ngerulmud", article: "Ngerulmud" },
  Tuvalu: { city: "Funafuti", article: "Funafuti" },
};

/* Natural Earth's ADM0NAME for an entry whose ISO_A2 does not join — either because the code is -99 or
   because the point is filed as an admin-1 capital of a dependency. Left side is ADM0NAME, right side is
   the world.js country name. */
const ADM0_FIX = {
  Kosovo: "Kosovo",
  Somaliland: "Somaliland",
  "Puerto Rico": "Puerto Rico",
  "Faroe Islands": "Faeroe Is.",
  "Cook Islands": "Cook Is.",
  Niue: "Niue",
  "Northern Mariana Islands": "N. Mariana Is.",
};
/* …and the admin-1 capital to take for each of those, where the territory has more than one. Without it
   the Faroes would take Klaksvík as readily as Tórshavn, on nothing but file order. */
const ADM1_PICK = { "Faeroe Is.": "Tórshavn", "N. Mariana Is.": "Capitol Hill", Greenland: "Nuuk", Somaliland: "Hargeisa" };

function die(m) { console.error("ERROR: " + m); process.exit(1); }

async function fetchTo(url, file) {
  const r = await fetch(url, { headers: { "User-Agent": "folio-dev-script/1.0 (world capitals)" } });
  if (!r.ok) die("fetch " + url + " -> HTTP " + r.status);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
}

/* One title per request. `prop=coordinates` paginates, so a batched query records a handful and reports
   the rest as having no coordinate — which is indistinguishable from the truth. (.claude/add-locators.js
   records the same finding; it cost a run there.) */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function wikiCoord(title) {
  const url = "https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=coordinates&coprimary=primary&titles=" + encodeURIComponent(title);
  /* THE API RATE-LIMITS A RUN OF REQUESTS AND ANSWERS 429, and a run that treats that as "no coordinate"
     writes a file with fifteen capitals missing — which is the whole supplement, lost in a way that reads
     exactly like Wikipedia not carrying them. Backed off and retried; a failure still falls back to the
     value already shipped rather than dropping the city. */
  let r = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt) await sleep(2000 * Math.pow(2, attempt - 1));
    r = await fetch(url, { headers: { "User-Agent": "folio-dev-script/1.0 (world capitals)" } });
    if (r.status !== 429) break;
  }
  if (!r.ok) return { err: "HTTP " + r.status };
  const j = await r.json(), q = j.query || {}, pages = q.pages || {};
  const red = (q.redirects || [])[0];
  const pid = Object.keys(pages)[0];
  if (!pid || pid === "-1") return { err: "no such article" };
  const c = pages[pid].coordinates && pages[pid].coordinates[0];
  if (!c) return { err: "no primary coordinate" };
  return { c: [Q(c.lon), Q(c.lat)], to: red ? red.to : null };
}

// the shipped file's own values, so --no-net reproduces it rather than dropping the supplement
function shippedTable() {
  if (!fs.existsSync(OUT)) return {};
  const w = {}; new Function("window", fs.readFileSync(OUT, "utf8"))(w);
  return w.WORLD_CAPITALS || {};
}

(async function main() {
  const args = process.argv.slice(2);
  const noNet = args.includes("--no-net");
  if (args.includes("--refetch") && fs.existsSync(PLACES_CACHE)) fs.unlinkSync(PLACES_CACHE);
  if (!fs.existsSync(PLACES_CACHE)) { console.log("fetching " + PLACES_URL + " …"); await fetchTo(PLACES_URL, PLACES_CACHE); }

  const win = {}; new Function("window", fs.readFileSync(path.join(ROOT, "world.js"), "utf8"))(win);
  const WORLD = win.WORLD_GEO || [];
  if (!WORLD.length) die("world.js carried no WORLD_GEO — build it first.");
  const byIso2 = {}, byName = {};
  for (const c of WORLD) { byName[c.n] = c; if (c.i) (byIso2[c.i.toLowerCase()] = byIso2[c.i.toLowerCase()] || []).push(c); }

  const gj = JSON.parse(fs.readFileSync(PLACES_CACHE, "utf8"));
  const out = {};                                  // city -> { s, c }
  const perCountry = {};                           // world.js name -> [city]
  const seenSrcName = new Set();

  /* A CLASH IS RESOLVED BY RANK, NOT BY FILE ORDER. Kingston is Jamaica's capital and Norfolk Island's;
     the bare key goes to the point of the stronger class — a sovereign state's own Admin-0 capital beats
     a territory's region capital or a supplement row — and the other says which it is. Where two points
     of EQUAL rank clash, both are qualified, since nothing distinguishes them. */
  function add(city, country, lon, lat, rank) {
    /* Natural Earth ships "Washington,  D.C." with two spaces, and a key nobody can type by eye is a key
       no card will match — the failure being a map window that says it could not be loaded. Collapsed
       here rather than in a RENAME row, since it is a whitespace fault and not a naming judgement. */
    city = String(city).replace(/\s+/g, " ").trim();
    const key = RENAME[city] || city;
    seenSrcName.add(city);
    const qual = (k, c) => k + " (" + c + ")";
    const place = (k, rec) => { out[k] = rec; (perCountry[rec.s] = perCountry[rec.s] || []).push(k); };
    const rec = { s: country, c: [Q(lon), Q(lat)], r: rank };
    if (out[key] && out[key].s !== country) {
      const other = out[key];
      if (other.r === rank) {
        delete out[key];
        const oi = perCountry[other.s].indexOf(key); if (oi >= 0) perCountry[other.s][oi] = qual(key, other.s);
        place(qual(key, other.s), other); place(qual(key, country), rec);
        console.log("  ~ name clash on " + JSON.stringify(key) + " at equal rank — both qualified");
      } else if (rank < other.r) {
        delete out[key];
        const oi = perCountry[other.s].indexOf(key); if (oi >= 0) perCountry[other.s][oi] = qual(key, other.s);
        place(qual(key, other.s), other); place(key, rec);
        console.log("  ~ name clash on " + JSON.stringify(key) + " — kept for " + country + ", qualified for " + other.s);
      } else {
        place(qual(key, country), rec);
        console.log("  ~ name clash on " + JSON.stringify(key) + " — kept for " + other.s + ", qualified for " + country);
      }
      return;
    }
    if (out[key]) return;                          // the same city twice (the alt classes overlap)
    place(key, rec);
  }

  // 1 + 2 — Natural Earth
  const RANK = { "Admin-0 capital": 0, "Admin-0 capital alt": 1, "Admin-0 region capital": 2, "Admin-1 capital": 3 };
  const hasOwnCapital = new Set();
  for (const f of gj.features) {
    const p = f.properties;
    if (!/^Admin-0 capital( alt)?$/.test(p.FEATURECLA || "")) continue;
    const iso = (p.ISO_A2 || "").toLowerCase();
    if (iso && iso !== "-99" && byIso2[iso]) hasOwnCapital.add(byIso2[iso][0].n);
    else if (ADM0_FIX[p.ADM0NAME]) hasOwnCapital.add(ADM0_FIX[p.ADM0NAME]);
  }
  const dropped = [];
  const seenSecondSeat = new Set();
  for (const f of gj.features) {
    const p = f.properties, cls = p.FEATURECLA || "";
    if (!(cls in RANK)) continue;
    const admin1 = cls === "Admin-1 capital";
    let country = null;
    const iso = (p.ISO_A2 || "").toLowerCase();
    /* An admin-1 capital normally has no country here at all (rule 2 resolves one only through
       ADM0_FIX). A SECOND_SEAT row names a city that IS one, so the ISO join has to be allowed for it
       before the class gate below can ask whether the row exists. */
    if ((!admin1 || SECOND_SEAT_NAMES.has(p.NAME)) && iso && iso !== "-99" && byIso2[iso]) country = byIso2[iso][0].n;
    if (!country && ADM0_FIX[p.ADM0NAME]) country = ADM0_FIX[p.ADM0NAME];
    if (!country) continue;
    if (!byName[country]) die("ADM0_FIX maps to " + JSON.stringify(country) + ", which world.js has not got.");
    // an admin-1 capital counts only for a territory named in ADM0_FIX, for the seat asked for by name,
    // or for a SECOND_SEAT row declaring that this is a capital Natural Earth has not caught up with
    const secondSeat = SECOND_SEAT[p.NAME + "|" + country];
    if (secondSeat) seenSecondSeat.add(p.NAME + "|" + country);
    if (admin1 && !ADM0_FIX[p.ADM0NAME] && !secondSeat) continue;
    if (ADM1_PICK[country] && (admin1 || cls === "Admin-0 region capital") && ADM1_PICK[country] !== p.NAME) continue;
    const capin = p.CAPIN || "";
    if (/^Former/i.test(capin)) { dropped.push(p.NAME + " (" + country + ") — former capital"); continue; }
    if (/^Claimed/i.test(capin)) { dropped.push(p.NAME + " (" + country + ") — a claim over disputed territory"); continue; }
    if (cls === "Admin-0 region capital" && hasOwnCapital.has(country)) { dropped.push(p.NAME + " (" + country + ") — an autonomous region's seat, not the country's"); continue; }
    if (DROP[p.NAME + "|" + country]) { dropped.push(p.NAME + " (" + country + ") — " + DROP[p.NAME + "|" + country]); continue; }
    add(p.NAME, country, p.LONGITUDE, p.LATITUDE, RANK[cls]);
  }
  for (const k of Object.keys(SECOND_SEAT)) if (!seenSecondSeat.has(k)) die("SECOND_SEAT row " + JSON.stringify(k) + " matched nothing in the source — has Natural Earth changed how it files it?");
  for (const k of Object.keys(RENAME)) if (!seenSrcName.has(k)) console.warn("  ! RENAME row " + JSON.stringify(k) + " matched nothing in the source — has Natural Earth corrected it?");

  // 3 — the supplement
  const shipped = shippedTable();
  for (const country of Object.keys(SUPPLEMENT)) {
    const s = SUPPLEMENT[country];
    if (!byName[country]) die("SUPPLEMENT names " + JSON.stringify(country) + ", which world.js has not got.");
    if (out[s.city] && out[s.city].s === country) continue;
    /* The shipped value may be under the QUALIFIED key (Kingston is Jamaica's and Norfolk Island's), so
       look for both and take only the one whose own country matches — the bare key alone finds Jamaica's
       and reads as "Norfolk Island has no shipped value". */
    const already = [shipped[s.city + " (" + country + ")"], shipped[s.city]].find((x) => x && x.s === country);
    if (noNet) {
      if (already && already.s === country) add(s.city, country, already.c[0], already.c[1], 4);
      else console.warn("  ! --no-net and no shipped value for " + s.city + " (" + country + ")");
      continue;
    }
    const r = await wikiCoord(s.article);
    await sleep(1200);                             // be a good citizen; the whole supplement is 17 requests
    if (r.err) {
      /* A FETCH THAT FAILS FALLS BACK TO WHAT IS ALREADY SHIPPED. Dropping the city instead would rewrite
         the file with a capital missing on a bad afternoon, and the only symptom is a card whose map says
         it could not be loaded — months later, on somebody else's machine. */
      if (already && already.s === country) { add(s.city, country, already.c[0], already.c[1], 4); console.warn("  ! " + s.city + " (" + country + "): " + r.err + " — KEPT the value already in world-capitals.js"); }
      else console.warn("  ! " + s.city + " (" + country + "): " + s.article + " — " + r.err);
      continue;
    }
    if (r.to && r.to !== s.article) console.log("  ← " + s.article + " redirected to " + r.to + " — check that is the same place");
    add(s.city, country, r.c[0], r.c[1], 4);
  }

  const names = Object.keys(out).sort((a, b) => a.localeCompare(b, "en"));
  const body = names.map((k) => "  " + JSON.stringify(k) + ": {\"s\":" + JSON.stringify(out[k].s) + ",\"c\":[" + out[k].c[0] + "," + out[k].c[1] + "]}").join(",\n");
  const head =
    "/* The capital city of every country and territory on the map, as a POINTS TABLE for a map card's dot\n" +
    "   (see CARD_MAP_LAYERS in app.js). Keyed by the city name a card's `map.dot` gives; `s` is the\n" +
    "   world.js country it stands in, which is what lets add-card.js CHECK that a card's dot falls inside\n" +
    "   the country its `key` shades. GENERATED by .claude/build-world-capitals.js — never hand-edited.\n" +
    "   A country with more than one seat carries all of them, so a card chooses rather than the file. */\n";
  fs.writeFileSync(OUT, head + "window.WORLD_CAPITALS = {\n" + body + "\n};\n");

  /* DOES EACH DOT FALL INSIDE THE SHAPE THE CARD WILL SHADE? Measured rather than assumed, because the
     two layers are drawn at different precisions: the dot is this file's 4dp (~11 m) and the coast is
     world.js's 2dp (~1.1 km), so a coastal capital can sit a kilometre OUTSIDE a simplified shoreline.
     It is sub-pixel on a country and visible on an atoll, which is why the count is printed rather than
     left to be discovered on a card. Not an error and not snapped — snapping would move the city to
     flatter the map. */
  function inRings(rings, lon, lat) {
    let inside = false;
    for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const xi = r[i][0], yi = r[i][1], xj = r[j][0], yj = r[j][1];
      if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  const offshore = Object.keys(out).filter((k) => { const c = byName[out[k].s]; return c && !inRings(c.p, out[k].c[0], out[k].c[1]); });

  const covered = new Set(Object.values(out).map((v) => v.s));
  console.log("\nworld-capitals.js: " + names.length + " cities across " + covered.size + " countries and territories" +
    " (" + (fs.statSync(OUT).size / 1024).toFixed(1) + " KB)");
  if (dropped.length) { console.log("\ndropped as not a current capital (" + dropped.length + "):"); dropped.sort().forEach((d) => console.log("  - " + d)); }
  const multi = Object.keys(perCountry).filter((k) => perCountry[k].length > 1).sort();
  if (multi.length) { console.log("\nmore than one seat (a card picks one, and the plan says which):"); multi.forEach((k) => console.log("  " + k + ": " + perCountry[k].join(", "))); }
  if (offshore.length) console.log("\noutside world.js's own simplified coastline (" + offshore.length + ", all coastal or island): " + offshore.join(", "));
  const missing = WORLD.map((c) => c.n).filter((n) => !covered.has(n)).sort();
  console.log("\nno capital in the table (" + missing.length + "): " + missing.join(", "));
})();
