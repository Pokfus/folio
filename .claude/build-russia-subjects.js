// Dev-only: build russia-subjects.js = the 83 federal subjects of the Russian Federation, and the 81
// administrative centres a card may put a dot on, from Natural Earth 10m. Run:
//   node .claude/build-russia-subjects.js [--refetch]
//
//   window.RUSSIA_SUBJECTS = [ { n, a, t, c:[labelLon,labelLat], p:[rings of [lon,lat]] } ]
//   window.RUSSIA_CENTRES  = { "<city>": { s: "<subject>", c: [lon, lat] } }
//
// The fourth shape layer a map card can be drawn on, after us-states.js, world.js and china-provinces.js,
// and it exists for the reason those do: `world.js` draws COUNTRIES, so it has one polygon for Russia and
// nothing inside it. THE SHAPE IS china-provinces.js's EXACTLY — same key names, same Douglas-Peucker
// tolerance, same 3dp quantisation — so one renderer draws a federal subject, a province and a state
// alike and none of them has to know which it is holding.
//
// WHICH SUBJECTS ARE IN THE LIST IS NOT A JUDGEMENT MADE ENTRY BY ENTRY, and on this subject it had
// better not be. It is the set carrying an ISO 3166-2:**RU** code of its own, which is a list maintained
// by a body with no stake in any of the disputes — the same test *The world*'s own deck applies one level
// up with ISO 3166-1. Two independent sources were asked and both answer 83:
//   · Natural Earth files 86 features under Russia. Two of them it codes UA-43 (Crimea) and UA-40
//     (Sevastopol) — UKRAINIAN codes, assigned by Natural Earth rather than by Folio — and one,
//     `RU-X01~`, is a 0.3-degree sliver on the Yamal coast with a NULL name, NULL type and null
//     everything else, which is Natural Earth's placeholder for an unresolved piece rather than a
//     subject. 86 - 2 - 1 = 83.
//   · Wikidata returns 89 entities typed "federal subject of Russia". Six carry no ISO 3166-2:RU code:
//     Crimea, Sevastopol (UA-40), Donetsk, Luhansk, Zaporizhzhia and Kherson. 89 - 6 = 83.
// The two 83s are the same 83, matched code by code below. Russia's own constitution as amended lists
// 89; that is the Russian Federation's account of its own territory, and the standing rule for every
// collection here is that no state's account of its own actions is repeated as established fact. The
// deck's own scope note in docs/russia-geography-card-plan.md states the position and cites the General
// Assembly resolutions rather than leaving the arithmetic to speak for itself.
//
// NATURAL EARTH HAS THE MOSCOW CODES THE WRONG WAY ROUND, AND THIS IS THE FAULT TO KNOW ABOUT. It gives
// `RU-MOS` to a one-degree shape named "Moskva" typed Federal City, and `RU-MOW` to a five-degree shape
// named "Moskovskaya" typed Region. ISO 3166-2:RU assigns them the other way — RU-MOW is Moskva, the
// federal city, and RU-MOS is Moskovskaya oblast' — and Wikidata's own P300 agrees with ISO. So the
// GEOMETRY is right and the CODE attached to it is wrong, which is the worst shape a fault can have:
// every card would render perfectly and a reader checking the code against the standard would find the
// city under the oblast's code. The two are swapped below, and the swap is not merely declared — it is
// ASSERTED FROM THE GEOMETRY, the builder refusing to write unless the shape it labels RU-MOW is the
// smaller of the two and lies inside the other's bounding box. A hand-written correction can go stale;
// a measurement cannot.
//
// AND THE NAME, THE KIND AND THE CODE ARE ALL DECLARED HERE — ONLY THE GEOMETRY AND THE LABEL POINT COME
// FROM NATURAL EARTH. That is where this builder parts company with build-china-provinces.js, which
// takes the name from the source and renames two. Here all three source fields are unusable as they
// stand:
//   · `name` is a stale or garbled transliteration on a dozen rows — "Maga Buryatdan" for Magadan,
//     "Chita" for Zabaykalsky Krai (Chita Oblast was merged into it in 2008), "Yevrey", "Gorno-Altay",
//     "Mariy-El", "Ingush". `name_en` is better but gives "Moscow" for BOTH the city and the oblast, so
//     neither field can name the 83 on its own.
//   · `type_en` is wrong on seventeen: all nine krais are "Territory", Zabaykalsky and Kamchatka are
//     "Region" when both are krais, Sakha is "Autonomous Province" when it is a republic, and the four
//     autonomous okrugs are "Autonomous Province" too. The kind is the one fact every card in this deck
//     states in its own `Kind` row, so it is declared against the constitution's own six categories
//     (Article 5) and the tally is printed on every run: 46 oblasts, 21 republics, 9 krais, 4 autonomous
//     okrugs, 2 cities of federal significance and 1 autonomous oblast.
//   · `region` is wrong outright — Chechnya, Dagestan, Krasnodar and Rostov are all filed "Volga". It is
//     not read.
// So SUBJECTS below is keyed by Natural Earth's own `name`, which is what a reader can check against the
// source, and the builder refuses a row whose left-hand side has left the file AND refuses a RU-coded
// feature the table does not name. Both directions, so neither a rename upstream nor a new subject can
// pass silently.
//
// THE OKRUGS DO NOT NEST, WHICH IS WORTH KNOWING RATHER THAN ASSUMING. Nenets is constitutionally part
// of Arkhangelsk Oblast, and Khanty-Mansi and Yamalo-Nenets part of Tyumen Oblast, so the obvious fear
// is that shading Tyumen would shade two other cards' answers as well. Natural Earth's polygons are
// MUTUALLY EXCLUSIVE and tile: measured, its Tyumen is 160,143 km2, which is the oblast PROPER
// (160,122 km2) and not the 1,464,173 km2 the official figure quotes with the okrugs in; Arkhangelsk is
// 406,927 against 413,103 proper and 589,913 with Nenets. The map therefore draws six subjects rather
// than three, which is what this deck wants. The consequence for a CARD is the other way round and is
// stated in the plan: an Area or Population row taken from an official table is usually the
// WITH-OKRUGS figure, and on Tyumen and Arkhangelsk that does not describe the shape being shaded.
//
// THE CENTRES ARE DECLARED CITY BY CITY AND THE COORDINATE IS STILL NEVER TYPED, exactly as China's
// capitals are, and for a sharper reason: Natural Earth's own admin-1 capital class is not consulted at
// all here. Each row names a city; the point comes from Natural Earth's own record of that city; and
// every point is then tested for falling INSIDE its own subject's polygon before it is written. A row
// whose city is missing from the source, or whose point lands outside, stops the build.
//   MOSCOW AND SAINT PETERSBURG HAVE NO ENTRY, deliberately. Each is a city that is itself a federal
// subject, so the shape a capital card would shade IS the city it would ask for and the question answers
// itself. The deck leaves their two capital numbers unused for the same reason, and keeping them out of
// this table is what makes add-card.js REFUSE such a card rather than the plan merely advising against
// one. That is China's four municipalities exactly.
//   TWO CENTRES ARE NOT THE CITY A READER WOULD GUESS, and both are live facts rather than errors.
// Leningrad Oblast's administrative centre is GATCHINA, not Saint Petersburg: the oblast is governed
// from a city inside itself only since a 2021 regional law moved the seat, and before that its centre
// was a different federal subject altogether. Moscow Oblast's is KRASNOGORSK, where the oblast
// government has sat since 2007. Both fall inside their own subject, so both take an ordinary dot — and
// had either still been seated outside, that capital number would have had to go unused too, a dot
// outside the shaded shape being a card that contradicts itself.
//
// NATURAL EARTH DROPS THE HYPHEN IN A CITY NAME AND DOUBLES A SPACE IN ONE. "Naryan-Mar" is filed
// "Naryan Mar", and so are Gorno-Altaysk, Yuzhno-Sakhalinsk, Khanty-Mansiysk and Yoshkar-Ola; Veliky
// Novgorod is "Velikiy Novgorod"; and St Petersburg's NAME carries two spaces where NAMEASCII carries
// one. PLACE_ALIAS below names the source's spelling where it differs, so the card asks for the city's
// name and the point is found under Natural Earth's.
//   AND ONE CENTRE IS GENUINELY ABSENT FROM THE SOURCE: MAGAS, the capital of Ingushetia, founded in
// 1994 and home to some fourteen thousand people, is below Natural Earth's populated-places threshold —
// the nearest point the file carries is Nazran, the former capital, 7.8 km away. Its coordinate is taken
// the way build-world-capitals.js takes the seventeen it cannot find: from a named published record, so
// what is declared here is an ENTITY ID a reader can look up and never a number.
//   IT IS THE ONE POINT IN THIS FILE WHERE THE INSIDE-TEST RUNS NEAR ITS LIMIT, and that is worth
// knowing rather than discovering. Magas stands less than a kilometre from the boundary with North
// Ossetia, and both published coordinates for it are rounded to the arcminute — about 1.4 km apart at
// this latitude. The English Wikipedia article's primary coordinate (44.8000, 43.1667) therefore falls
// on the WRONG SIDE of that boundary and the builder REFUSED IT, which is exactly the fault the test
// exists to catch; Wikidata's Q5222 (44.8167, 43.1667) falls inside. Nothing about the city is in doubt
// — Magas is Ingushetia's purpose-built capital and no source says otherwise — so the disagreement is
// about the PRECISION of a published figure and not about where the city is. The finer of the two is
// taken, the rejection is recorded here rather than quietly dropped, and a future session that finds a
// source giving Magas to more than arcminute precision should prefer it.
//
// The two sources are cached under .claude/ne-cache/ (gitignored) so a re-run costs no refetch; pass
// --refetch to replace them.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces_lakes.geojson";
const PLACES_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places.geojson";
const CACHE_DIR = path.join(__dirname, "ne-cache");
const CACHE = path.join(CACHE_DIR, "ne_10m_admin_1_lakes.geojson");
const PLACES_CACHE = path.join(CACHE_DIR, "ne_10m_populated_places.geojson");
const OUT = path.join(ROOT, "russia-subjects.js");

/* The tolerance and quantisation are us-states.js's and china-provinces.js's, and the arithmetic behind
   them is in the first of those files' header: the card map's zoom ceiling is CMAP_ZMAX, at which one CSS
   pixel is 0.0041 degrees, so a 2dp grid is two and a half pixels and a coastline becomes a row of
   triangles. The layers are traced identically on purpose — they are drawn by the same code into the
   same window. */
const TOL = 0.002, DP = 3;
const Q = (v) => Math.round(v * Math.pow(10, DP)) / Math.pow(10, DP);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const CAP_DP = 4;                              // ~11 m, world-capitals.js's own; a dot is a dot
const CQ = (v) => Math.round(v * Math.pow(10, CAP_DP)) / Math.pow(10, CAP_DP);

/* Natural Earth's own `name` on the left — the field a reader can check against the source — and on the
   right the three things this file declares rather than reads: the subject's English name, its ISO
   3166-2:RU suffix and its KIND. The header says why none of the three can be taken from the source.
     The names are the form English reference works use, with the type spelled out only where it is
   needed to tell two subjects apart: `Altai Krai` and `Altai Republic` are neighbours, so both carry it,
   while Komi and Karelia carry none because nothing else is called either.
     The kinds are the constitution's own six categories (Article 5): republic, krai, oblast, city of
   federal significance, autonomous oblast and autonomous okrug. */
const SUBJECTS = {
  // cities of federal significance — 2
  "Moskva":                   { n: "Moscow",                      a: "MOW", t: "City of federal significance" },
  "City of St. Petersburg":   { n: "Saint Petersburg",            a: "SPE", t: "City of federal significance" },
  // republics — 21
  "Adygey":                   { n: "Adygea",                      a: "AD",  t: "Republic" },
  "Gorno-Altay":              { n: "Altai Republic",              a: "AL",  t: "Republic" },
  "Bashkortostan":            { n: "Bashkortostan",               a: "BA",  t: "Republic" },
  "Buryat":                   { n: "Buryatia",                    a: "BU",  t: "Republic" },
  "Dagestan":                 { n: "Dagestan",                    a: "DA",  t: "Republic" },
  "Ingush":                   { n: "Ingushetia",                  a: "IN",  t: "Republic" },
  "Kabardin-Balkar":          { n: "Kabardino-Balkaria",          a: "KB",  t: "Republic" },
  "Kalmyk":                   { n: "Kalmykia",                    a: "KL",  t: "Republic" },
  "Karachay-Cherkess":        { n: "Karachay-Cherkessia",         a: "KC",  t: "Republic" },
  "Karelia":                  { n: "Karelia",                     a: "KR",  t: "Republic" },
  "Komi":                     { n: "Komi",                        a: "KO",  t: "Republic" },
  "Mariy-El":                 { n: "Mari El",                     a: "ME",  t: "Republic" },
  "Mordovia":                 { n: "Mordovia",                    a: "MO",  t: "Republic" },
  "Sakha (Yakutia)":          { n: "Sakha (Yakutia)",             a: "SA",  t: "Republic" },
  "North Ossetia":            { n: "North Ossetia–Alania",   a: "SE",  t: "Republic" },
  "Tatarstan":                { n: "Tatarstan",                   a: "TA",  t: "Republic" },
  "Tuva":                     { n: "Tuva",                        a: "TY",  t: "Republic" },
  "Udmurt":                   { n: "Udmurtia",                    a: "UD",  t: "Republic" },
  "Khakass":                  { n: "Khakassia",                   a: "KK",  t: "Republic" },
  "Chechnya":                 { n: "Chechnya",                    a: "CE",  t: "Republic" },
  "Chuvash":                  { n: "Chuvashia",                   a: "CU",  t: "Republic" },
  // krais — 9
  "Altay":                    { n: "Altai Krai",                  a: "ALT", t: "Krai" },
  "Chita":                    { n: "Zabaykalsky Krai",            a: "ZAB", t: "Krai" },
  "Kamchatka":                { n: "Kamchatka Krai",              a: "KAM", t: "Krai" },
  "Krasnodar":                { n: "Krasnodar Krai",              a: "KDA", t: "Krai" },
  "Krasnoyarsk":              { n: "Krasnoyarsk Krai",            a: "KYA", t: "Krai" },
  "Perm'":                    { n: "Perm Krai",                   a: "PER", t: "Krai" },
  "Primor'ye":                { n: "Primorsky Krai",              a: "PRI", t: "Krai" },
  "Stavropol'":               { n: "Stavropol Krai",              a: "STA", t: "Krai" },
  "Khabarovsk":               { n: "Khabarovsk Krai",             a: "KHA", t: "Krai" },
  // oblasts — 46
  "Amur":                     { n: "Amur Oblast",                 a: "AMU", t: "Oblast" },
  "Arkhangel'sk":             { n: "Arkhangelsk Oblast",          a: "ARK", t: "Oblast" },
  "Astrakhan'":               { n: "Astrakhan Oblast",            a: "AST", t: "Oblast" },
  "Belgorod":                 { n: "Belgorod Oblast",             a: "BEL", t: "Oblast" },
  "Bryansk":                  { n: "Bryansk Oblast",              a: "BRY", t: "Oblast" },
  "Chelyabinsk":              { n: "Chelyabinsk Oblast",          a: "CHE", t: "Oblast" },
  "Irkutsk":                  { n: "Irkutsk Oblast",              a: "IRK", t: "Oblast" },
  "Ivanovo":                  { n: "Ivanovo Oblast",              a: "IVA", t: "Oblast" },
  "Kaliningrad":              { n: "Kaliningrad Oblast",          a: "KGD", t: "Oblast" },
  "Kaluga":                   { n: "Kaluga Oblast",               a: "KLU", t: "Oblast" },
  "Kemerovo":                 { n: "Kemerovo Oblast",             a: "KEM", t: "Oblast" },
  "Kirov":                    { n: "Kirov Oblast",                a: "KIR", t: "Oblast" },
  "Kostroma":                 { n: "Kostroma Oblast",             a: "KOS", t: "Oblast" },
  "Kurgan":                   { n: "Kurgan Oblast",               a: "KGN", t: "Oblast" },
  "Kursk":                    { n: "Kursk Oblast",                a: "KRS", t: "Oblast" },
  "Leningrad":                { n: "Leningrad Oblast",            a: "LEN", t: "Oblast" },
  "Lipetsk":                  { n: "Lipetsk Oblast",              a: "LIP", t: "Oblast" },
  "Maga Buryatdan":           { n: "Magadan Oblast",              a: "MAG", t: "Oblast" },
  "Moskovskaya":              { n: "Moscow Oblast",               a: "MOS", t: "Oblast" },
  "Murmansk":                 { n: "Murmansk Oblast",             a: "MUR", t: "Oblast" },
  "Nizhegorod":               { n: "Nizhny Novgorod Oblast",      a: "NIZ", t: "Oblast" },
  "Novgorod":                 { n: "Novgorod Oblast",             a: "NGR", t: "Oblast" },
  "Novosibirsk":              { n: "Novosibirsk Oblast",          a: "NVS", t: "Oblast" },
  "Omsk":                     { n: "Omsk Oblast",                 a: "OMS", t: "Oblast" },
  "Orenburg":                 { n: "Orenburg Oblast",             a: "ORE", t: "Oblast" },
  "Orel":                     { n: "Oryol Oblast",                a: "ORL", t: "Oblast" },
  "Penza":                    { n: "Penza Oblast",                a: "PNZ", t: "Oblast" },
  "Pskov":                    { n: "Pskov Oblast",                a: "PSK", t: "Oblast" },
  "Rostov":                   { n: "Rostov Oblast",               a: "ROS", t: "Oblast" },
  "Ryazan'":                  { n: "Ryazan Oblast",               a: "RYA", t: "Oblast" },
  "Sakhalin":                 { n: "Sakhalin Oblast",             a: "SAK", t: "Oblast" },
  "Samara":                   { n: "Samara Oblast",               a: "SAM", t: "Oblast" },
  "Saratov":                  { n: "Saratov Oblast",              a: "SAR", t: "Oblast" },
  "Smolensk":                 { n: "Smolensk Oblast",             a: "SMO", t: "Oblast" },
  "Sverdlovsk":               { n: "Sverdlovsk Oblast",           a: "SVE", t: "Oblast" },
  "Tambov":                   { n: "Tambov Oblast",               a: "TAM", t: "Oblast" },
  "Tomsk":                    { n: "Tomsk Oblast",                a: "TOM", t: "Oblast" },
  "Tula":                     { n: "Tula Oblast",                 a: "TUL", t: "Oblast" },
  "Tver'":                    { n: "Tver Oblast",                 a: "TVE", t: "Oblast" },
  "Tyumen'":                  { n: "Tyumen Oblast",               a: "TYU", t: "Oblast" },
  "Ul'yanovsk":               { n: "Ulyanovsk Oblast",            a: "ULY", t: "Oblast" },
  "Vladimir":                 { n: "Vladimir Oblast",             a: "VLA", t: "Oblast" },
  "Volgograd":                { n: "Volgograd Oblast",            a: "VGG", t: "Oblast" },
  "Vologda":                  { n: "Vologda Oblast",              a: "VLG", t: "Oblast" },
  "Voronezh":                 { n: "Voronezh Oblast",             a: "VOR", t: "Oblast" },
  "Yaroslavl'":               { n: "Yaroslavl Oblast",            a: "YAR", t: "Oblast" },
  // autonomous okrugs — 4
  "Nenets":                   { n: "Nenets Autonomous Okrug",     a: "NEN", t: "Autonomous okrug" },
  "Khanty-Mansiy":            { n: "Khanty-Mansi Autonomous Okrug", a: "KHM", t: "Autonomous okrug" },
  "Chukchi Autonomous Okrug": { n: "Chukotka Autonomous Okrug",   a: "CHU", t: "Autonomous okrug" },
  "Yamal-Nenets":             { n: "Yamalo-Nenets Autonomous Okrug", a: "YAN", t: "Autonomous okrug" },
  // autonomous oblast — 1
  "Yevrey":                   { n: "Jewish Autonomous Oblast",    a: "YEV", t: "Autonomous oblast" },
};

/* Natural Earth files these under a Ukrainian ISO code, which is the source's own answer rather than
   Folio's, so they never reach the RU filter. Named here so a reader grepping for either finds the
   reason rather than nothing, and so the builder can report them by name on every run. */
const UA_CODED = { "UA-43": "Crimea", "UA-40": "Sevastopol" };

/* The subject's administrative centre. Moscow and Saint Petersburg are deliberately absent — see the
   header. 80 rows written, for 83 subjects: Moscow and Saint Petersburg need none, and Khakassia's is
   DEFERRED — see that table. */
const CENTRES = {
  "Adygea": "Maykop", "Altai Republic": "Gorno-Altaysk", "Bashkortostan": "Ufa", "Buryatia": "Ulan-Ude",
  "Dagestan": "Makhachkala", "Ingushetia": "Magas", "Kabardino-Balkaria": "Nalchik", "Kalmykia": "Elista",
  "Karachay-Cherkessia": "Cherkessk", "Karelia": "Petrozavodsk", "Komi": "Syktyvkar",
  "Mari El": "Yoshkar-Ola", "Mordovia": "Saransk", "Sakha (Yakutia)": "Yakutsk",
  "North Ossetia–Alania": "Vladikavkaz", "Tatarstan": "Kazan", "Tuva": "Kyzyl", "Udmurtia": "Izhevsk",
  "Chechnya": "Grozny", "Chuvashia": "Cheboksary",
  "Altai Krai": "Barnaul", "Zabaykalsky Krai": "Chita", "Kamchatka Krai": "Petropavlovsk-Kamchatsky",
  "Krasnodar Krai": "Krasnodar", "Krasnoyarsk Krai": "Krasnoyarsk", "Perm Krai": "Perm",
  "Primorsky Krai": "Vladivostok", "Stavropol Krai": "Stavropol", "Khabarovsk Krai": "Khabarovsk",
  "Amur Oblast": "Blagoveshchensk", "Arkhangelsk Oblast": "Arkhangelsk", "Astrakhan Oblast": "Astrakhan",
  "Belgorod Oblast": "Belgorod", "Bryansk Oblast": "Bryansk", "Chelyabinsk Oblast": "Chelyabinsk",
  "Irkutsk Oblast": "Irkutsk", "Ivanovo Oblast": "Ivanovo", "Kaliningrad Oblast": "Kaliningrad",
  "Kaluga Oblast": "Kaluga", "Kemerovo Oblast": "Kemerovo", "Kirov Oblast": "Kirov",
  "Kostroma Oblast": "Kostroma", "Kurgan Oblast": "Kurgan", "Kursk Oblast": "Kursk",
  "Leningrad Oblast": "Gatchina", "Lipetsk Oblast": "Lipetsk", "Magadan Oblast": "Magadan",
  "Moscow Oblast": "Krasnogorsk", "Murmansk Oblast": "Murmansk",
  "Nizhny Novgorod Oblast": "Nizhny Novgorod", "Novgorod Oblast": "Veliky Novgorod",
  "Novosibirsk Oblast": "Novosibirsk", "Omsk Oblast": "Omsk", "Orenburg Oblast": "Orenburg",
  "Oryol Oblast": "Oryol", "Penza Oblast": "Penza", "Pskov Oblast": "Pskov",
  "Rostov Oblast": "Rostov-on-Don", "Ryazan Oblast": "Ryazan", "Sakhalin Oblast": "Yuzhno-Sakhalinsk",
  "Samara Oblast": "Samara", "Saratov Oblast": "Saratov", "Smolensk Oblast": "Smolensk",
  "Sverdlovsk Oblast": "Yekaterinburg", "Tambov Oblast": "Tambov", "Tomsk Oblast": "Tomsk",
  "Tula Oblast": "Tula", "Tver Oblast": "Tver", "Tyumen Oblast": "Tyumen",
  "Ulyanovsk Oblast": "Ulyanovsk", "Vladimir Oblast": "Vladimir", "Volgograd Oblast": "Volgograd",
  "Vologda Oblast": "Vologda", "Voronezh Oblast": "Voronezh", "Yaroslavl Oblast": "Yaroslavl",
  "Nenets Autonomous Okrug": "Naryan-Mar", "Khanty-Mansi Autonomous Okrug": "Khanty-Mansiysk",
  "Chukotka Autonomous Okrug": "Anadyr", "Yamalo-Nenets Autonomous Okrug": "Salekhard",
  "Jewish Autonomous Oblast": "Birobidzhan",
};

/* Where Natural Earth's spelling of a city is not the city's name. Every one of these is the source
   dropping a hyphen or writing a fuller form of the same name, not a different place. */
const PLACE_ALIAS = {
  "Naryan-Mar": "Naryan Mar", "Gorno-Altaysk": "Gorno Altaysk", "Yuzhno-Sakhalinsk": "Yuzhno Sakhalinsk",
  "Khanty-Mansiysk": "Khanty Mansiysk", "Yoshkar-Ola": "Yoshkar Ola", "Veliky Novgorod": "Velikiy Novgorod",
  "Petropavlovsk-Kamchatsky": "Petropavlovsk Kamchatskiy",
  "Arkhangelsk": "Archangel",   // the source uses the old English name of the city
  "Oryol": "Orel",              // the source romanises the ё as e
  /* The source calls it plain "Rostov", and so does a DIFFERENT town of 33,000 in Yaroslavl Oblast —
     Rostov Veliky. Both are in the file under that one name, and nothing in this table can tell them
     apart. What does is the inside-test below: only one of the two falls within Rostov Oblast, which is
     the subject the card shades. This row is the reason that filter is written to take the hits INSIDE
     the shape rather than the first hit by name. */
  "Rostov-on-Don": "Rostov",
};

/* The three centres Natural Earth cannot supply. The VALUE is a WIKIDATA ENTITY ID, not a coordinate:
   the number is fetched from that entity's own published P625 claim, so a wrong row is a wrong ENTITY —
   a thing a reader can look up, and one whose own description says which city it is — rather than a
   wrong number, which nobody would check. Every point is still tested for falling inside its subject.
     THE ID IS LOOKED UP, NEVER COMPOSED. Two were guessed while writing this table and both were wrong:
   Q140380 is an asteroid and Q171131 a village in Botswana. `wbsearchentities` returns the id beside the
   entity's own one-line description, which is what makes the row checkable at a glance.
     They are here for THREE DIFFERENT REASONS and the third is the one to watch for:
   · Magas is BELOW THE SOURCE'S THRESHOLD — fourteen thousand people, founded 1994; the nearest point
     the file carries is Nazran, 7.8 km away. See the header for why this is Wikidata's figure and not
     the English Wikipedia article's, which the inside-test rejected.
   · Krasnogorsk is a NAME COLLISION the source loses. It carries exactly one Krasnogorsk — a village of
     3,304 people on SAKHALIN, 7,559 km from Moscow Oblast — and not the town of 175,000 that the oblast
     is governed from. The inside-test caught it, which is the whole reason the test is not merely a
     formality on a name the file does carry.
   (A third was tried here and became the DEFERRED row below: Abakan is a point the source has, files
   under the wrong subject, and — the part no coordinate can fix — draws outside its own republic.) */
const WIKI_POINT = {
  "Magas": "Q5222",        // capital of Ingushetia — below the source's threshold
  "Krasnogorsk": "Q155569",// Moscow Oblast's seat — the source has only the Sakhalin village of the name
};

/* A centre this layer cannot carry, so the deck leaves its capital number unwritten. It is NOT a
   political refusal like the two *The world* defers, nor a sourcing one like its third: it is a DATA
   refusal, and the measurement behind it is this.
     ABAKAN IS THE CAPITAL OF KHAKASSIA AND NATURAL EARTH DRAWS IT OUTSIDE KHAKASSIA. The republic's
   easternmost vertex near the city's latitude is 91.4135; the city stands at about 91.43, between the
   Abakan river and the Yenisei and therefore west of the boundary the two actually share. Three
   independent coordinates were tested against the source's RAW geometry — Natural Earth's own populated
   place (91.4450, 53.7037), Wikidata's Q875 (91.4167, 53.7167) and the city centre (91.4292, 53.7156) —
   and all three fall four to five kilometres inside KRASNOYARSK KRAI. So the fault is not the point's
   precision, which is what the Magas row is about; it is the polygon, and no choice of coordinate
   reaches a shape that does not contain the city.
     THE DOT IS NOT MOVED AND THE POINT IS NOT SNAPPED TO THE BOUNDARY. build-world-capitals.js states
   that rule for the fifteen capitals that fall just outside their own simplified coastline — snapping
   would move a city to flatter the map — and a gold dot sitting outside the shaded shape is worse than
   an absent card, because the card would render perfectly while contradicting itself.
     Keeping Abakan out of RUSSIA_CENTRES is what makes add-card.js REFUSE that card rather than the plan
   merely advising against it. If Natural Earth corrects the boundary, or a finer shape source is taken,
   move this row back into CENTRES and write the card. */
const DEFERRED = {
  "Khakassia": "Abakan",  // the source draws the city outside its own republic — see above
};

function dp(pts, tol) {
  const n = pts.length; if (n < 3) return pts.slice();
  const keep = new Uint8Array(n); keep[0] = 1; keep[n - 1] = 1; const t2 = tol * tol, st = [[0, n - 1]];
  while (st.length) {
    const s = st.pop(), a = s[0], b = s[1], ax = pts[a][0], ay = pts[a][1], dx = pts[b][0] - ax, dy = pts[b][1] - ay, L2 = dx * dx + dy * dy || 1e-12;
    let md = -1, mi = -1;
    for (let i = a + 1; i < b; i++) {
      const px = pts[i][0], py = pts[i][1], t = clamp(((px - ax) * dx + (py - ay) * dy) / L2, 0, 1), qx = ax + t * dx, qy = ay + t * dy, d = (px - qx) ** 2 + (py - qy) ** 2;
      if (d > md) { md = d; mi = i; }
    }
    if (md > t2 && mi > 0) { keep[mi] = 1; st.push([a, mi]); st.push([mi, b]); }
  }
  const o = []; for (let i = 0; i < n; i++) if (keep[i]) o.push(pts[i]); return o;
}
/* Rings are stored CLOSED (first vertex === last), which is what world.js, us-states.js and
   china-provinces.js all do and what lets a caller stroke every edge including the closing one without a
   modular index. A ring that simplifies below four points has no area left and is dropped — at this
   tolerance those are the one-pixel islets of the Arctic and the Kuril chain, of which there are many. */
function ringsOf(g) {
  const o = [];
  const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
  for (const poly of polys) for (const r of poly) {
    const s = dp(r, TOL).map((p) => [Q(p[0]), Q(p[1])]);
    if (s.length < 4) continue;
    if (s[0][0] !== s[s.length - 1][0] || s[0][1] !== s[s.length - 1][1]) s.push([s[0][0], s[0][1]]);
    o.push(s);
  }
  return o;
}
// even-odd, over every ring of the subject: a point in a lake hole is NOT in the subject, which is the
// answer this test should give — a centre that fell in one would be a city in the middle of a lake
function inRings(lon, lat, rings) {
  let inside = false;
  for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const xi = r[i][0], yi = r[i][1], xj = r[j][0], yj = r[j][1];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi || 1e-12) + xi) inside = !inside;
  }
  return inside;
}
const bboxOf = (rings) => {
  let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
  for (const r of rings) for (const p of r) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  return [x0, y0, x1, y1];
};
/* Shoelace weighted by the ring's own mean latitude — good to a per cent at these sizes, which is all
   the Moscow assertion and the okrug report need it to be. */
const areaOf = (rings) => rings.reduce((a, r) => {
  let s = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[j][0] - r[i][0]) * (r[j][1] + r[i][1]);
  const lat = r.reduce((t, p) => t + p[1], 0) / r.length;
  return a + Math.abs(s / 2) * Math.cos((lat * Math.PI) / 180) * 111.32 * 110.57;
}, 0);

async function grab(url, file) {
  if (fs.existsSync(file) && process.argv.indexOf("--refetch") < 0) return JSON.parse(fs.readFileSync(file, "utf8"));
  process.stdout.write("fetching " + path.basename(file) + " …\n");
  const r = await fetch(url); if (!r.ok) throw new Error("fetch " + r.status + " " + url);
  const t = await r.text(); fs.mkdirSync(CACHE_DIR, { recursive: true }); fs.writeFileSync(file, t);
  return JSON.parse(t);
}
/* One entity per request, reading the P625 claim off the entity itself rather than through a query
   service — no SPARQL, no rate-limited batch, and the answer is the entity's own published statement.
   The API rate-limits a RUN of requests and answers 429, and a run that treats that as "no coordinate"
   is a run that silently drops a centre, so a non-200 THROWS. */
async function wikiPoint(qid) {
  const url = "https://www.wikidata.org/w/api.php?action=wbgetclaims&format=json&property=P625&entity=" + encodeURIComponent(qid);
  const r = await fetch(url, { headers: { "User-Agent": "Folio/1.0 (static study site; build-russia-subjects.js)" } });
  if (!r.ok) throw new Error("wikidata " + r.status + " for " + JSON.stringify(qid));
  const j = await r.json();
  const claims = (j.claims && j.claims.P625) || [];
  const v = claims.length && claims[0].mainsnak && claims[0].mainsnak.datavalue && claims[0].mainsnak.datavalue.value;
  if (!v || typeof v.longitude !== "number" || typeof v.latitude !== "number") throw new Error("no P625 coordinate on " + JSON.stringify(qid));
  return [v.longitude, v.latitude];
}
const die = (m) => { console.error("ERROR: " + m); process.exit(1); };

(async () => {
  const src = await grab(URL, CACHE);
  const all = src.features.filter((f) => (f.properties.adm0_a3 || "") === "RUS");
  if (!all.length) die("no Russia admin-1 features in " + path.basename(CACHE));

  /* Natural Earth has RU-MOS and RU-MOW the wrong way round — see the header. The swap is applied here
     and ASSERTED from the geometry below, so it cannot quietly rot if the source is ever corrected. */
  const swap = (iso) => (iso === "RU-MOS" ? "RU-MOW" : iso === "RU-MOW" ? "RU-MOS" : iso);

  const ua = [], out = [];
  for (const f of all) {
    const p = f.properties, raw = p.name, iso = String(p.iso_3166_2 || "");
    if (UA_CODED[iso]) { ua.push(UA_CODED[iso] + " (" + iso + ")"); continue; }
    if (raw == null) {
      const b = bboxOf(ringsOf(f.geometry));
      console.log("  dropped the unnamed feature " + JSON.stringify(iso) + " at " + b.map((v) => v.toFixed(2)).join(",") + " — no name, no type, not a federal subject (see header)");
      continue;
    }
    if (!/^RU-[A-Z]{2,3}$/.test(iso)) die(JSON.stringify(raw) + " has an ISO 3166-2 code this builder does not recognise: " + JSON.stringify(iso));
    const dec = SUBJECTS[raw];
    if (!dec) die("Natural Earth carries a Russian subject SUBJECTS does not name: " + JSON.stringify(raw) + " (" + iso + ") — add it, or say here why it is not one of the 83");
    const want = swap(iso).slice(3);
    if (dec.a !== want) die(JSON.stringify(raw) + " is declared " + dec.a + " but the source (swap applied) says " + want);
    const rings = ringsOf(f.geometry);
    if (!rings.length) die(dec.n + " simplified to nothing");
    const c = [Q(Number(p.longitude)), Q(Number(p.latitude))];
    if (!isFinite(c[0]) || !isFinite(c[1])) die(dec.n + " has no label point");
    if (!inRings(c[0], c[1], rings)) die(dec.n + "'s label point does not fall inside its own shape");
    out.push({ n: dec.n, a: dec.a, t: dec.t, c, p: rings, _area: areaOf(rings), _bbox: bboxOf(rings) });
  }
  for (const k of Object.keys(SUBJECTS)) if (!all.some((f) => f.properties.name === k)) die("SUBJECTS names " + JSON.stringify(k) + ", which is not in the source any more — check what Natural Earth calls it now");
  if (out.length !== 83) die("expected 83 federal subjects, got " + out.length);

  /* THE MOSCOW SWAP, ASSERTED RATHER THAN TRUSTED. The city is the smaller shape and lies inside the
     oblast's bounding box; the oblast is the larger. If Natural Earth ever corrects its codes, `swap`
     starts producing the wrong answer and this is what says so. */
  const city = out.find((s) => s.a === "MOW"), obl = out.find((s) => s.a === "MOS");
  if (!city || !obl) die("Moscow or Moscow Oblast is missing after the swap");
  if (city.n !== "Moscow" || obl.n !== "Moscow Oblast") die("the Moscow swap has produced " + city.n + "=MOW and " + obl.n + "=MOS");
  if (!(city._area < obl._area / 3)) die("RU-MOW is meant to be the CITY of Moscow but its shape (" + Math.round(city._area).toLocaleString() + " km2) is not much smaller than RU-MOS's (" + Math.round(obl._area).toLocaleString() + " km2) — Natural Earth may have corrected its codes; re-read the header before changing `swap`");
  if (!(city._bbox[0] >= obl._bbox[0] && city._bbox[2] <= obl._bbox[2] && city._bbox[1] >= obl._bbox[1] && city._bbox[3] <= obl._bbox[3]))
    die("the shape labelled RU-MOW does not lie inside RU-MOS's bounding box — see the header on the swap");
  console.log("  Moscow swap asserted: RU-MOW is " + Math.round(city._area).toLocaleString() + " km2 inside RU-MOS's " + Math.round(obl._area).toLocaleString() + " km2");

  const places = await grab(PLACES_URL, PLACES_CACHE);
  const ruPts = places.features.filter((f) => (f.properties.ADM0NAME || "") === "Russia");
  const centres = {};
  for (const subj of Object.keys(CENTRES)) {
    const cityName = CENTRES[subj], shape = out.find((s) => s.n === subj);
    if (!shape) die("CENTRES names " + JSON.stringify(subj) + ", which is not one of the 83 subjects");
    let pt;
    if (WIKI_POINT[cityName]) {
      pt = await wikiPoint(WIKI_POINT[cityName]);
      console.log("  " + cityName + " is not in Natural Earth's populated places — took " + pt.map((v) => v.toFixed(4)).join(",") + " from Wikidata " + WIKI_POINT[cityName] + "'s own P625");
    } else {
      const srcName = PLACE_ALIAS[cityName] || cityName;
      /* NE writes St Petersburg's NAME with two spaces and its NAMEASCII with one, so whitespace is
         collapsed before comparing rather than trusting either field. */
      const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
      const hits = ruPts.filter((f) => norm(f.properties.NAME) === srcName || norm(f.properties.NAMEASCII) === srcName);
      if (!hits.length) die("no Natural Earth point named " + JSON.stringify(srcName) + " in Russia (the centre of " + subj + ") — add a PLACE_ALIAS row, or a WIKI_POINT one if the city is below the source's threshold");
      // where NE carries the name twice, the point inside the subject is the one meant — the same test
      // everything else here rests on, so it is made once and used for both jobs
      const good = hits.filter((f) => inRings(f.geometry.coordinates[0], f.geometry.coordinates[1], shape.p));
      if (!good.length) die(JSON.stringify(cityName) + " is Natural Earth's point at " + hits[0].geometry.coordinates.join(",") + ", which does not fall inside " + subj + " — the dot would land outside the shaded shape");
      if (good.length > 1) die("Natural Earth has " + good.length + " points named " + JSON.stringify(srcName) + " inside " + subj);
      pt = good[0].geometry.coordinates;
    }
    if (!inRings(pt[0], pt[1], shape.p)) die(JSON.stringify(cityName) + " at " + pt.join(",") + " does not fall inside " + subj);
    if (centres[cityName]) die("two subjects claim a centre named " + JSON.stringify(cityName));
    centres[cityName] = { s: subj, c: [CQ(pt[0]), CQ(pt[1])] };
  }
  if (Object.keys(centres).length !== 80) die("expected 80 centres, got " + Object.keys(centres).length);
  for (const subj of Object.keys(DEFERRED)) {
    if (!out.some((s2) => s2.n === subj)) die("DEFERRED names " + JSON.stringify(subj) + ", which is not one of the 83 subjects");
    if (CENTRES[subj]) die(JSON.stringify(subj) + " is in both CENTRES and DEFERRED");
    console.log("  deferred: " + DEFERRED[subj] + " (" + subj + ") — the source draws the city outside its own subject; no capital card, see the table's note");
  }
  /* THE NEAR MISS IS THE SIGNAL, as check-counts.js puts it one directory over. A centre a kilometre
     inside its own boundary passed the test on a simplified polygon and may not pass the next time the
     source is rebuilt — and Magas, at 0.9 km, is the case that proves the band is real rather than
     theoretical. Reported, never failed: these are correct today. */
  const NEAR_KM = 3;
  const near = [];
  for (const city of Object.keys(centres)) {
    const rec = centres[city], shape = out.find((s2) => s2.n === rec.s);
    let best = Infinity;
    for (const r of shape.p) for (const pt2 of r) {
      const d = Math.hypot((pt2[0] - rec.c[0]) * Math.cos((rec.c[1] * Math.PI) / 180) * 111.32, (pt2[1] - rec.c[1]) * 110.57);
      if (d < best) best = d;
    }
    if (best < NEAR_KM) near.push(city + " (" + rec.s + ") " + best.toFixed(2) + " km");
  }
  console.log("  within " + NEAR_KM + " km of their own boundary, so worth re-reading after any rebuild: " + (near.length ? near.join("; ") : "none"));

  const head =
`/* The 83 federal subjects of the Russian Federation — 46 oblasts, 21 republics, 9 krais, 4 autonomous
   okrugs, 2 cities of federal significance and 1 autonomous oblast — and the 80 administrative centres
   (Natural Earth 10m admin-1, Douglas-Peucker tol=${TOL}, ${DP}dp). Each entry: n=name, a=ISO 3166-2:RU
   suffix, t=kind, c=[labelLon,labelLat] (Natural Earth's own published label point), p=[rings of
   [lon,lat]] (even-odd). The same SHAPE as us-states.js, china-provinces.js and world.js, so the card map
   draws a federal subject with the code that draws a state.
   THE 83 ARE THE SUBJECTS CARRYING AN ISO 3166-2:RU CODE OF THEIR OWN — the list a body with no stake in
   any of the disputes maintains, which Natural Earth's own coding and Wikidata's independently agree on.
   Crimea and Sevastopol are not here because Natural Earth files them under UKRAINIAN codes (UA-43,
   UA-40); see the builder's header and docs/russia-geography-card-plan.md.
   RUSSIA_CENTRES holds the 80 centres a card may put a gold dot on; \`s\` names the subject the city
   stands in, and every point in this file was tested for falling inside that subject's own polygon
   before it was written. Moscow and Saint Petersburg have no entry, deliberately — each is a city that is
   itself a federal subject, so the shape would be the answer; nor has Khakassia, whose capital Abakan
   this source draws outside the republic — see the builder's DEFERRED table.
   GENERATED — never hand-edited. Run: node .claude/build-russia-subjects.js
   LAZY — loaded by the \`russubj\` bundle when a Russia map card is rendered, never on the eager path. */
`;
  const clean = out.map((s) => ({ n: s.n, a: s.a, t: s.t, c: s.c, p: s.p }));
  const body =
    "window.RUSSIA_SUBJECTS = [\n" + clean.map((s) => JSON.stringify(s)).join(",\n") + "\n];\n\n" +
    "window.RUSSIA_CENTRES = " + JSON.stringify(centres, null, 0) + ";\n";
  fs.writeFileSync(OUT, head + body);

  const verts = clean.reduce((a, s) => a + s.p.reduce((b, r) => b + r.length, 0), 0);
  const kinds = clean.reduce((m, s) => ((m[s.t] = (m[s.t] || 0) + 1), m), {});
  /* A plural table rather than a trailing "s": the kinds include "City of federal significance" and
     "Autonomous oblast", neither of which pluralises by suffix, and a run that prints "2 city of federal
     significances" is a run nobody reads twice. */
  const PLURAL = {
    "Oblast": "oblasts", "Republic": "republics", "Krai": "krais",
    "Autonomous okrug": "autonomous okrugs", "City of federal significance": "cities of federal significance",
    "Autonomous oblast": "autonomous oblasts",
  };
  for (const k of Object.keys(kinds)) if (!PLURAL[k]) die("PLURAL has no row for the kind " + JSON.stringify(k));
  console.log("  " + Object.keys(kinds).sort((a, b) => kinds[b] - kinds[a]).map((k) => kinds[k] + " " + (kinds[k] === 1 ? k.toLowerCase() : PLURAL[k])).join(", "));
  console.log("  not federal subjects, filed by Natural Earth under Ukrainian codes: " + ua.join(", "));
  /* The okrugs do not nest — reported rather than asserted, because the figure a CARD should quote is
     usually the with-okrugs one and this is where that divergence is visible. See the header. */
  [["Tyumen Oblast", ["Khanty-Mansi Autonomous Okrug", "Yamalo-Nenets Autonomous Okrug"]], ["Arkhangelsk Oblast", ["Nenets Autonomous Okrug"]]].forEach(([parent, kids]) => {
    const pa = clean.find((s) => s.n === parent), sum = kids.reduce((a, k) => a + areaOf(clean.find((s) => s.n === k).p), 0);
    console.log("  " + parent + " is drawn at " + Math.round(areaOf(pa.p)).toLocaleString() + " km2 — the okrugs inside it (" + Math.round(sum).toLocaleString() + " km2) are drawn separately, so an official with-okrugs figure does not describe this shape");
  });
  console.log("wrote russia-subjects.js — " + clean.length + " subjects, " + Object.keys(centres).length + " centres, " +
    verts.toLocaleString() + " vertices, " + (fs.statSync(OUT).size / 1024).toFixed(0) + " KB");
})().catch((e) => { console.error(e); process.exit(1); });
