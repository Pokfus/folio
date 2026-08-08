#!/usr/bin/env node
/* Folio — Settings → Danger zone → Reset progress, and who the home page thinks you are.
   =====================================================================================
   Both halves of this fail SILENTLY, and one of them cannot be undone.

     · RESET must clear PROGRESS and nothing else. It used to be `S = defaultState()`, which is a factory
       reset of the whole save: it took the theme, the light/dark setting, the text size, the language, the
       day boundary, the sound and narrator settings, the Atlas home, the book sort — and the DECKS the
       reader had added. None of that is named on the button, on the row beneath it or in the confirmation,
       so the loss is discovered afterwards, and "cannot be undone" is written on the control. `RESET_KEEPS`
       is the list that survives, and it is exactly the kind of list a later edit shortens by accident:
       dropping a name from it loses a reader's decks in silence, and no other test on the shelf would see
       it. (Adding a PROGRESS_FIELD is the safe direction — an unnamed field is reset by default.)
     · The HOME PAGE must not mistake a returning reader for a first-time visitor. `fresh` gates the
       first-run hero AND hides the list of added decks, so a reader whose card history is empty for any
       reason — a reset above all — was shown the beginners' banner with their own decks taken off the page.
       It now asks for an empty history AND nothing studiable in the review, which a genuine first-timer
       still satisfies (their shipped `S.active` is one deck of the coming-soon China collection).

   Run:  NODE_PATH=<playwright>/node_modules node .claude/test-reset.js
   Env:  FOLIO_CHROMIUM=<path to chrome> if Chromium lives outside the playwright package. */

const path = require("path");
const http = require("http");
const fs = require("fs");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log("ok    " + name + (extra !== undefined ? "  " + JSON.stringify(extra) : "")); }
  else { fail++; console.log("FAIL  " + name + (extra !== undefined ? "  " + JSON.stringify(extra) : "")); }
}

function serve() {
  return http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split("?")[0]);
    const f = path.join(ROOT, u === "/" ? "index.html" : u);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  });
}

(async () => {
  const srv = serve();
  await new Promise((r) => srv.listen(0, r));
  const base = "http://127.0.0.1:" + srv.address().port + "/";
  const browser = await chromium.launch(LAUNCH);
  const errs = [];
  const page = await browser.newPage({ viewport: { width: 1100, height: 950 } });
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !/net::ERR_|favicon|manifest/.test(t)) errs.push(t); });
  page.on("pageerror", (e) => errs.push(String(e)));

  const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem("folio_v1") || "{}"));
  const readHome = () => page.evaluate(() => ({
    hero: !!document.querySelector(".banner.hero"),
    decks: document.querySelectorAll(".active-deck[data-review]").length,
    cta: (document.querySelector("#b-review .cta") || {}).textContent,
  }));
  // A hash-only goto is a SAME-DOCUMENT navigation — the app keeps running and its in-memory S survives,
  // so anything written into localStorage behind its back has to be read back through a real reload or the
  // next save() simply overwrites it. (The house gotcha; see the Testing section of CLAUDE.md.)
  const seedHome = async (fn) => {
    await page.evaluate(fn);
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(700);
    return readHome();
  };
  const home = async () => {   // navigate as a reader does, without a reload — the live render is the point
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(600);
    return readHome();
  };

  /* ================= 1. a genuine first-time visitor is unchanged ================= */
  await page.goto(base + "#home", { waitUntil: "load" });
  // the walkthrough offer and the coach marks are not what this file is about
  let v = await seedHome(() => { localStorage.clear(); localStorage.setItem("folio_tour_v1", "1"); });
  check("a first-time visitor still gets the first-run hero", v.hero && v.decks === 0, v);

  /* ================= 2. …and a reader with decks does not, even before studying =================
     This is the case that used to be indistinguishable from a first visit: someone who pressed
     "+ Add decks", added a collection and came back before turning a single card over. */
  v = await seedHome(() => {
    const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    s.active = ["col-8", "col-13"];
    localStorage.setItem("folio_v1", JSON.stringify(s));
  });
  check("a reader with a studiable deck gets the ordinary banner and their decks", !v.hero && v.decks >= 2, v);

  /* ================= 3. seed a long-standing reader and reset through the real control ================= */
  v = await seedHome(() => {
    const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    s.cards = {
      "wh-001": { reps: 3, lapses: 1, ease: 2.3, interval: 9, due: Date.now() + 864e5, status: "review", last: Date.now() },
      "wh-002": { reps: 1, lapses: 0, ease: 2.5, interval: 1, due: Date.now() - 1000, status: "review", last: Date.now() },
    };
    s.suspended = { "wh-003": true };
    s.active = ["col-8", "col-13"];
    s.deckOpts = { "col-8": { newPerDay: 12 } };
    s.reading = { "seneca-letters": { ch: 7, y: 0.4, at: Date.now() } };
    s.bookFavs = { beowulf: 1750000000001 };
    s.achievements = { first: Date.now() };
    s.streak = { count: 6, last: "2026-08-08" };
    s.artefacts = { "some-artefact": Date.now() };
    s.chests = 2;
    s.showcase = ["some-artefact"];
    s.glossSeen = { Polis: Date.now() };
    s.placesSeen = { Greece: Date.now() };
    // settings is SHALLOW-merged over the defaults on load, so build on the app's own saved object
    s.settings = Object.assign({}, s.settings, { theme: "synth", night: true, themeAuto: false, fontSize: "large", sfx: false, bookSort: "title", dayEnd: 180 });
    s.user = { name: "Pok", joined: 1750000000000 };
    localStorage.setItem("folio_v1", JSON.stringify(s));
  });
  check("…and so does a reader who has studied", !v.hero && v.decks >= 2, v);

  await page.goto(base + "#settings", { waitUntil: "load" });
  await page.waitForTimeout(500);
  await page.click("#reset");
  await page.waitForTimeout(300);
  const prompt = await page.evaluate(() => { const p = document.querySelector(".inline-prompt"); return p ? p.innerText.replace(/\s+/g, " ") : ""; });
  check("the confirmation says what it KEEPS, not only what it clears", /decks/i.test(prompt) && /settings/i.test(prompt), prompt.slice(0, 120));
  const box = await page.$(".inline-prompt input, .inline-prompt textarea");
  check("…and asks for a typed confirmation", !!box);
  await box.fill("RESET");
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll(".inline-prompt button")];
    (btns.find((b) => /ok|confirm|reset|yes/i.test(b.textContent)) || btns[0]).click();
  });
  await page.waitForTimeout(700);

  /* ---- what it cleared ---- */
  const s2 = await saved();
  check("the card history is cleared", Object.keys(s2.cards || {}).length === 0);
  check("…and the suspended list", Object.keys(s2.suspended || {}).length === 0);
  check("…the streak and the badges the dialog names", (s2.streak || {}).count === 0 && Object.keys(s2.achievements || {}).length === 0);
  check("…the artefacts, chests and showcase a level bought", Object.keys(s2.artefacts || {}).length === 0 && !s2.chests && (s2.showcase || []).length === 0);
  check("…and the discovery registers", Object.keys(s2.glossSeen || {}).length === 0 && Object.keys(s2.placesSeen || {}).length === 0);

  /* ---- what it kept: RESET_KEEPS, plus settings and user ---- */
  check("the DECKS are kept — the reported symptom", JSON.stringify(s2.active) === JSON.stringify(["col-8", "col-13"]), s2.active);
  check("…with their per-deck daily limits", !!(s2.deckOpts && s2.deckOpts["col-8"] && s2.deckOpts["col-8"].newPerDay === 12), s2.deckOpts);
  check("the Library reading position is kept", !!(s2.reading && s2.reading["seneca-letters"] && s2.reading["seneca-letters"].ch === 7), s2.reading);
  check("…and the starred books", !!(s2.bookFavs && s2.bookFavs.beowulf), s2.bookFavs);
  check("every setting is kept", s2.settings.theme === "synth" && s2.settings.night === true && s2.settings.fontSize === "large" && s2.settings.sfx === false && s2.settings.bookSort === "title" && s2.settings.dayEnd === 180,
    { theme: s2.settings.theme, fontSize: s2.settings.fontSize, night: s2.settings.night, sfx: s2.settings.sfx, bookSort: s2.settings.bookSort, dayEnd: s2.settings.dayEnd });
  check("…and the name and the join date the heatmap starts from", s2.user.name === "Pok" && s2.user.joined === 1750000000000, s2.user);

  /* ================= 4. the home page afterwards ================= */
  v = await home();
  check("a reset does NOT turn the home page into a first-time visitor's", !v.hero, v);
  check("…the Daily study decks are still listed", v.decks >= 2, v.decks);
  check("…and there is something to start", /start/i.test(v.cta || ""), v.cta);

  /* ================= 5. …and all of it survives a reload ================= */
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => ({
    hero: !!document.querySelector(".banner.hero"),
    decks: document.querySelectorAll(".active-deck[data-review]").length,
    theme: document.body.dataset.theme,
    night: document.body.classList.contains("night"),
  }));
  check("…and none of it is undone by a reload", !after.hero && after.decks >= 2 && after.theme === "synth" && after.night, after);

  check("no console errors", errs.length === 0, errs.slice(0, 3));

  console.log("\n" + pass + " passed, " + fail + " failed");
  await browser.close();
  srv.close();
  process.exit(fail ? 1 : 0);
})();
