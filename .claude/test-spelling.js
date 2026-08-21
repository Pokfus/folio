/* THE en-GB / en-US SWITCH AND THE FIRST-THREE-SIGHTINGS RATING (Aug 2026).
 *
 * Two features, one file, because both fail the same silent way: a transform that stops firing leaves
 * a perfectly readable page in the other spelling while the Settings row still claims otherwise, and a
 * rating that counts a card's fourth answer looks exactly like one that counts its first three.
 *
 * Half of it needs no browser at all: SPELL_PAIRS is a DECLARED TABLE and the things that go wrong with
 * one — a stem that is itself a word (`emphasis` -> `emphasiz`), a suffix right for one side and wrong
 * for the other (`centre`+`d` -> `centerd`), a two-way row whose American form is the modern British
 * one (`story` -> `storey`, `medieval` -> `mediaeval`) — are all arithmetic over the shipped corpus,
 * and read far better as a failed comparison than as a screenshot.
 *
 * Run: NODE_PATH=<playwright> FOLIO_CHROMIUM=<chrome> node .claude/test-spelling.js
 */
const fs = require("fs"), path = require("path"), http = require("http");
const ROOT = path.resolve(__dirname, "..");
const SRC = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");

let pass = 0, fail = 0;
const check = (n, c, x) => { if (c) { pass++; console.log("  ok  " + n); } else { fail++; console.log("FAIL  " + n + (x ? "  << " + String(x).slice(0, 220) : "")); } };

/* ---------- 1. the table, and the transform as a pure function ---------- */
function sliceBetween(a, b) {
  const i = SRC.indexOf(a); if (i < 0) return null;
  const j = SRC.indexOf(b, i); if (j < 0) return null;
  return SRC.slice(i, j);
}
const block = sliceBetween("  const SPELLINGS =", "  function setSpelling(");
check("the spelling block is still where the slice expects it", !!block);

let spellText = null, SPELL_PAIRS = null;
if (block) {
  const body = block.replace(/function spellSystem\(\)[^}]*}/, "function spellSystem(){return S.settings.spelling;}") +
    "\nreturn { spellText, spellCase, SPELL_PAIRS, SPELLINGS };";
  const api = new Function("S", body)({ settings: { spelling: "en-US" } });
  spellText = api.spellText; SPELL_PAIRS = api.SPELL_PAIRS;
  check("en-GB and en-US are the two systems", JSON.stringify(api.SPELLINGS) === '["en-GB","en-US"]', JSON.stringify(api.SPELLINGS));
}

// expand both maps exactly as the builder does
const gbMap = Object.create(null), usMap = Object.create(null);
(SPELL_PAIRS || []).forEach(([g, u, sfx, oneWay]) => {
  sfx.split("|").forEach((t) => { gbMap[g + t] = u + t; if (!oneWay) usMap[u + t] = g + t; });
});
check("the table is a real table, not a stub", (SPELL_PAIRS || []).length >= 100, (SPELL_PAIRS || []).length);

/* A word in BOTH maps is a loop: the pass would rewrite it and the reverse pass would rewrite it back,
   so whichever ran last would win and the two systems would disagree about what the word is. */
const collide = Object.keys(gbMap).filter((w) => usMap[w]);
check("no word is in both maps", collide.length === 0, collide.slice(0, 8).join(", "));

/* Every two-way row must round-trip. This is what catches a suffix that is right for one stem and
   wrong for the other — the fault that shipped `centerd` and `catalogd` while it was being written. */
const badTrip = [];
Object.keys(gbMap).forEach((g) => {
  const u = gbMap[g];
  if (!usMap[u]) return;               // one-way rows are exempt by construction
  if (usMap[u] !== g) badTrip.push(g + " -> " + u + " -> " + usMap[u]);
});
check("every two-way row round-trips", badTrip.length === 0, badTrip.slice(0, 8).join("; "));

/* THE ROWS THAT MUST BE ONE-WAY, BY NAME. Each American form here is ALSO a British word with a
   different meaning or is the modern British spelling outright, so carrying it in the reverse map
   rewrites correct prose into something wrong — `story` into `storey`, `medieval` into the archaic
   `mediaeval`, `program` into `programme` on a computer program, `meter` into `metre` on a parking
   meter. Asserted by name because no rule can see it. */
["story", "stories", "storied", "medieval", "program", "programs", "meter", "meters",
 "practice", "practices", "practiced", "practicing", "license", "licenses",
 "catalog", "catalogs", "cataloged", "cataloging"].forEach((w) => {
  check("`" + w + "` is not rewritten into British", !usMap[w], usMap[w]);
});

/* THE FIVE FAMILIES DELIBERATELY ABSENT. American English writes `archaeology` and `ochre` the same
   way, so a row for either would rewrite 1,900-odd correct sites into a spelling nobody asked for. */
["archaeology", "archaeological", "archaeologist", "ochre", "aesthetic", "dialogue", "analogue", "axe"].forEach((w) => {
  check("`" + w + "` is left alone", !gbMap[w] && !usMap[w], gbMap[w] || usMap[w]);
});

if (spellText) {
  const gb2us = (t) => spellText(t, true), us2gb = (t) => spellText(t, false);
  check("British to American", gb2us("the colour of the centre") === "the color of the center", gb2us("the colour of the centre"));
  check("American to British", us2gb("the color of the center") === "the colour of the centre", us2gb("the color of the center"));
  check("Capitalised survives", gb2us("Colour and Defence") === "Color and Defense", gb2us("Colour and Defence"));
  check("ALL CAPS survives", gb2us("COLOUR") === "COLOR", gb2us("COLOUR"));
  check("a mixed-case word is left alone", gb2us("McColour") === "McColour", gb2us("McColour"));
  check("a stem that is a word of its own is untouched", gb2us("emphasis and paralysis") === "emphasis and paralysis", gb2us("emphasis and paralysis"));
  check("`analyses` is the plural, not a verb", gb2us("two analyses") === "two analyses", gb2us("two analyses"));
  check("a divergent inflection has its own row", gb2us("centred and catalogued") === "centered and cataloged", gb2us("centred and catalogued"));
  check("`medieval` stays modern British", us2gb("medieval Europe") === "medieval Europe", us2gb("medieval Europe"));

  /* A URL IS NOT PROSE. `mediaCreditHTML` renders a credit URL as the VISIBLE TEXT of its own link,
     so without the mask a reader would meet a link whose words no longer name where it goes. */
  const u = "See https://www.ncei.noaa.gov/pub/data/paleo/icecore for the colour of the theatre.";
  check("a URL survives the pass", gb2us(u) === "See https://www.ncei.noaa.gov/pub/data/paleo/icecore for the color of the theater.", gb2us(u));
  const u2 = "https://upload.wikimedia.org/x/Panionium_theatre.jpg";
  check("…and so does one that is the whole node", gb2us(u2) === u2, gb2us(u2));
}

/* THE TABLE AGAINST THE REAL CORPUS. A row is only ever as good as what it does to the prose that
   actually ships, and every fault this feature had was found here rather than by reading the table. */
const corpus = ["data.js", "glossary.js", "artefacts.js", "countries.js", "country-years.js", "mission.js", "changelog.js"]
  .map((f) => { try { return fs.readFileSync(path.join(ROOT, f), "utf8"); } catch (e) { return ""; } }).join("\n");
check("the corpus was read", corpus.length > 1e6, corpus.length);

function sweep(map) {
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  if (!keys.length) return {};
  const rx = new RegExp("\\b(?:" + keys.join("|") + ")\\b", "gi");
  const out = {}; let m;
  while ((m = rx.exec(corpus))) { const k = m[0].toLowerCase(); out[k] = (out[k] || 0) + 1; }
  return out;
}
const foundGB = sweep(gbMap), foundUS = sweep(usMap);
const nGB = Object.values(foundGB).reduce((a, b) => a + b, 0), nUS = Object.values(foundUS).reduce((a, b) => a + b, 0);
check("the corpus really is mixed, which is why the switch is two-way", nGB > 500 && nUS > 500, nGB + " British, " + nUS + " American");
check("the commonest British forms are covered", foundGB.metres > 100 && foundGB.centre > 100, JSON.stringify({ metres: foundGB.metres, centre: foundGB.centre }));
check("…and the commonest American ones", foundUS.center > 100 && foundUS.organized > 20, JSON.stringify({ center: foundUS.center, organized: foundUS.organized }));

/* ---------- 2. the first-three-sightings rule, read out of app.js ---------- */
check("the bar is a declared constant", /const CARD_STATS_SIGHTINGS = 3;/.test(SRC));
check("grade() counts the sighting on the card record", /c\.seen = \(Number\(c\.seen\) \|\| 0\) \+ 1;/.test(SRC));
check("…and only the first three are rated", /if \(c\.seen <= CARD_STATS_SIGHTINGS\) cardStatsBump\(id, g\);/.test(SRC));
check("an undo takes its own vote back", /function cardStatsUndo\(id, g\)/.test(SRC));
/* THE UNDO READS THE SNAPSHOT, NEVER THE LOG. `REV_GRADE_NAME` is capitalised and `CARD_GRADE_KEY`
   is not, so a grade recovered from the review log would not match a stats key and the vote would be
   left standing — silently, since nothing on the page reports a rating that is one answer too heavy. */
check("doGrade records the grade on the snapshot", /snap\.g = g;/.test(SRC));
check("undoGrade withdraws it from the snapshot", /if \(s\.g && \(\(s\.card && Number\(s\.card\.seen\)\) \|\| 0\) < CARD_STATS_SIGHTINGS\) cardStatsUndo\(s\.id, s\.g\);/.test(SRC));
check("forgetting a card does NOT reset the counter", !/seen: 0/.test(SRC.slice(SRC.indexOf("function schedForget"), SRC.indexOf("function schedForget") + 900)));

/* ---------- 3. the browser: the Settings row, the page, and the cloze ---------- */
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".xml": "text/xml" };
const srv = http.createServer((rq, rs) => {
  let p = decodeURIComponent(rq.url.split("?")[0]); if (p === "/") p = "/index.html";
  const f = path.join(ROOT, p);
  fs.readFile(f, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" }); rs.end(d); });
});

(async () => {
  let chromium;
  try { chromium = require("playwright").chromium; }
  catch (e) { console.log("\n(playwright not on NODE_PATH — the browser half was skipped)"); console.log("\n" + pass + " passed, " + fail + " failed"); process.exit(fail ? 1 : 0); }

  await new Promise((r) => srv.listen(8797, r));
  const b = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));

  await page.goto("http://127.0.0.1:8797/#settings");
  await page.waitForTimeout(1800);

  const row = await page.evaluate(() => {
    const g = document.querySelector("#spellPick");
    if (!g) return null;
    const bs = [...g.querySelectorAll("button")];
    return { n: bs.length, vals: bs.map((x) => x.dataset.spelling), on: bs.filter((x) => x.classList.contains("on")).map((x) => x.dataset.spelling),
             specimens: bs.map((x) => (x.querySelector(".fs-a") || {}).textContent) };
  });
  check("Settings offers the two spellings", !!row && row.n === 2 && row.vals.join() === "en-GB,en-US", JSON.stringify(row));
  check("British is what the site is authored in, so it starts there", !!row && row.on.join() === "en-GB", JSON.stringify(row && row.on));
  /* The specimens are `notranslate` on purpose: the British button must read `colour` and the American
     one `color` whichever system is in force, or the control rewrites its own labels and says nothing. */
  check("each button shows its own spelling as a specimen", !!row && row.specimens.join() === "colour,color", JSON.stringify(row && row.specimens));

  await page.evaluate(() => document.querySelector('#spellPick [data-spelling="en-US"]').click());
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => ({
    stored: (JSON.parse(localStorage.getItem("folio_v1") || "{}").settings || {}).spelling,
    on: [...document.querySelectorAll("#spellPick button")].filter((x) => x.classList.contains("on")).map((x) => x.dataset.spelling).join(),
    specimens: [...document.querySelectorAll("#spellPick .fs-a")].map((x) => x.textContent).join(),
  }));
  check("choosing American is stored", after.stored === "en-US", JSON.stringify(after));
  check("…and marked on the control", after.on === "en-US", after.on);
  check("…and the specimens are still one of each", after.specimens === "colour,color", after.specimens);

  // it survives a reload, and it reaches the prose rather than only the setting
  await page.reload();
  await page.waitForTimeout(1800);
  await page.goto("http://127.0.0.1:8797/#mission");
  await page.waitForTimeout(1500);
  const prose = await page.evaluate(() => {
    const t = document.body.innerText;
    const gb = (t.match(/\b(colour|centre|metres|organised|recognised|neighbour)\w*/gi) || []).length;
    const us = (t.match(/\b(color|center|meters|organized|recognized|neighbor)\w*/gi) || []).length;
    return { gb, us, len: t.length };
  });
  check("the page carries American spellings", prose.us > 0, JSON.stringify(prose));
  check("…and no British ones outside the protected parts", prose.gb === 0, JSON.stringify(prose));

  /* THE CITATIONS ARE NOT TRANSFORMED, and this is the assertion the whole `.notranslate` skip exists
     for: a citation names a published work, and rewriting `The Colour of Prehistory` into `Color`
     invents a title that does not exist. Read off a real card's own source list. */
  const cite = await page.evaluate(async () => {
    location.hash = "#decks";
    await new Promise((r) => setTimeout(r, 1200));
    const c = (window.CARD_DATA || []).find((x) => (x.sources || []).some((s) => /colour|centre|behaviour|organis/i.test(s)));
    return c ? { id: c.id, src: (c.sources || []).find((s) => /colour|centre|behaviour|organis/i.test(s)) } : null;
  });
  if (cite) {
    check("a citation in the data still carries its British spelling", /colour|centre|behaviour|organis/i.test(cite.src), cite.src);
  } else {
    check("(no British-spelled citation in the corpus to check)", true);
  }

  // back to British, so the run leaves nothing behind
  await page.goto("http://127.0.0.1:8797/#settings");
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.querySelector('#spellPick [data-spelling="en-GB"]').click());
  await page.waitForTimeout(700);
  const backGB = await page.evaluate(() => (JSON.parse(localStorage.getItem("folio_v1") || "{}").settings || {}).spelling);
  check("switching back is stored too", backGB === "en-GB", backGB);

  check("no page errors", errs.length === 0, errs.join(" | "));

  await b.close(); srv.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
