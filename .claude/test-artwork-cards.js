#!/usr/bin/env node
// Regression test for ARTWORK CARDS — the Visual Art collection's own card format, where the picture
// IS the question (Sep 2026, on request).
//
//   node .claude/test-artwork-cards.js
//
// Re-run after touching cardArtSpec / cardArtAnswers / cardArtHTML / artMatch / gradeArtFields /
// cardArtReveal / cardFrontHTML's artwork branch / ART_FIELDS / ART_ARTIST_LABELS / ART_PLACE_LABELS /
// ART_YEAR_NEAR / showAnswer's grading, reveal and duplicate-slot drop / IMG_OPEN_SEL / picturePool /
// gameCardIdSet / serializeCardData / revertCard / the .art-shot and .art-ask styles, or after adding
// an artwork card.
//
// WHY THIS FILE EXISTS. Every fault this format can have RENDERS PERFECTLY:
//  · A leak. A Commons credit routinely reads "Rembrandt, The Night Watch, Rijksmuseum", so a `title`,
//    a `desc`, a `credit` or a `data-img-*` attribute reaching the FRONT of the card answers the
//    question outright — on a card that looks exactly like a working one. It is asserted first.
//  · WORDS ON THE QUESTION SIDE. The request is that the front show none: an artwork card stores an
//    empty `question` and draws the picture and three empty fields. A sentence creeping back in looks
//    like every other card on the site and is the one thing this format is not.
//  · A FIELD THAT ASKS NOTHING. All three answers are DERIVED from the card's own display fields (the
//    artist by LABEL out of `facts` — see cardArtAnswers), so a grid whose rows are labelled
//    differently silently drops a question — and the card still renders, still reveals, still looks
//    finished.
//  · WHERE THE WORK IS NOW, WHICH IS SHOWN AND NOT ASKED (Sep 2026, on request). Both halves of that
//    fail silently and in opposite directions: a fourth input coming back is a question the format no
//    longer asks, and a location that stops being PRINTED on the answer side is a fact the reader
//    simply never gets, on a card that looks complete. Asserted both ways.
//  · The alt text. It has to describe the picture without naming it, which is what makes this format
//    reachable by a reader who cannot see it at all; an alt carrying the answer is the leak again in
//    the one place nobody looks.
//  · Two pictures. `buildBack` still emits the background slot (every other surface that draws a back
//    draws it with no front), and the study page drops that copy at the reveal. If the drop stops
//    firing the reader gets the same picture twice and nothing throws.
//  · The pool. An artwork belongs in the PICTURE round and in none of the text-only games, and both
//    halves fail silently: a card missing from the picture pool is a game that simply never deals it,
//    and one that leaks into Multiple Choice is a question with a picture-less answer term.
//
// Playwright is a dev dependency and must NOT be installed into the repo. Install it in a scratch
// folder and run with NODE_PATH=<that>/node_modules; set FOLIO_CHROMIUM if Chromium lives elsewhere.
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const http = require("http"), fs = require("fs"), path = require("path");

const ROOT = path.join(__dirname, "..");
const PORT = 8149;
const MIME = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  cond ? pass++ : fail++;
  console.log((cond ? "ok   " : "FAIL ") + " " + name + (extra !== undefined ? "  " + JSON.stringify(extra).slice(0, 140) : ""));
};
const sect = (s) => console.log("\n== " + s);

/* `picturePool` is a closure variable inside app.js's single IIFE, and the alternative to reaching it
   is sweeping days of the real game until an artwork happens to be dealt — which is a coin toss (six
   artworks in a pool of a hundred), so a sweep that saw none would say nothing at all. The server
   therefore hangs the function on `window` as it serves app.js, and `patchApp` asserts the anchor was
   found: if it is renamed the suite fails loudly here rather than quietly testing an unpatched app. */
const ANCHOR = "  PAGES.picture = function (root) {";
let patched = false;
function patchApp(buf) {
  const src = buf.toString("utf8");
  if (src.indexOf(ANCHOR) < 0) return null;
  patched = true;
  return Buffer.from(src.replace(ANCHOR, "  window.__folioPicturePool = picturePool;\n  window.__folioArtMatch = artMatch;\n" + ANCHOR), "utf8");
}
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]).replace(/^\//, "") || "index.html");
  fs.readFile(p, (e, buf) => {
    if (e) { res.writeHead(404); res.end("not found"); return; }
    if (path.basename(p) === "app.js") { const out = patchApp(buf); if (out) buf = out; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
    res.end(buf);
  });
});

(async () => {
  server.listen(PORT);

  /* ---------- 1. the data and the wiring, with no browser ---------------------------------- */
  sect("1. the cards on disk, and the code that reads them");
  global.window = {}; require(path.join(ROOT, "data.js"));
  const CARDS = global.window.CARD_DATA;
  /* THE LABEL TABLES ARE SLICED OUT OF app.js, never copied: they are what decides whether a reader is
     asked for the artist and the location at all, and a second copy here would go stale on a change made
     in a file nobody had reason to open. The run STOPS if the slice fails, rather than checking nothing. */
  const appSrc = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const rxOf = (name) => {
    const m = appSrc.match(new RegExp("const " + name + " = (/\\^[^\\n]+/i);"));
    if (!m) { console.error("FATAL: " + name + " not found in app.js — this suite cannot check the labels."); process.exit(1); }
    // eslint-disable-next-line no-eval
    return eval(m[1]);
  };
  const ARTIST_RX = rxOf("ART_ARTIST_LABELS"), PLACE_RX = rxOf("ART_PLACE_LABELS");
  const art = CARDS.filter((c) => c.artwork === true);
  ok("cards carry `artwork: true`", art.length > 0, art.length + " of " + CARDS.length);

  art.forEach((c) => {
    const img = c.image || {};
    ok(c.id + ": the picture is there and is a link", !!img.src && /^https?:/.test(String(img.src)));
    ok(c.id + ": …and is credited", String(img.credit || "").trim().length > 0);
    /* The alt is the only thing a reader who cannot see the picture is given, so it has to DESCRIBE
       without NAMING. A generic fallback would answer nothing and the answer term would answer
       everything; both are failures and only the second is a leak. */
    const alt = String(img.alt || "");
    ok(c.id + ": …and describes what is depicted", alt.trim().length > 20, alt.slice(0, 60));
    const ansIn = (s) => String(s || "").toLowerCase().indexOf(String(c.answerText || "~~").toLowerCase()) >= 0;
    ok(c.id + ": …without naming the answer", !ansIn(alt), alt.slice(0, 80));
    /* NO WORDS ON THE QUESTION SIDE. The field is stored empty rather than holding a sentence nothing
       renders, which a later reader of the data could not tell from a bug. */
    ok(c.id + ": …and stores no question at all", !String(c.question || "").trim(), JSON.stringify(c.question));
    ok(c.id + ": …and offers no extra phrasings", !Array.isArray(c.questions) || c.questions.length === 0);
    /* The three derived answers. A grid this cannot read is a card that asks fewer questions than the
       format promises and looks perfectly finished doing it. */
    const facts = Array.isArray(c.facts) ? c.facts : [];
    const lab = (r) => String((r || [])[0] || "").trim();
    ok(c.id + ": …carries an artist row the format can read",
       facts.some((r) => ARTIST_RX.test(lab(r))), facts.map(lab));
    /* SHOWN, NOT ASKED: the row is still required, because it is what states on the answer side where
       the work is now. `cardFactsHTML` prints it; only `ART_FIELDS` stopped asking for it. */
    ok(c.id + ": …and a location row for the answer side to state", facts.some((r) => PLACE_RX.test(lab(r))), facts.map(lab));
    ok(c.id + ": …and no Date row, the date line being the date", !facts.some((r) => /^date$/i.test(lab(r))));
    ok(c.id + ": …and a date line with a labelled row",
       /<span class="dt-k">[^<]+<\/span><span class="dt-v">[^<]+<\/span>/.test(String(c.answerDate || "")));
  });

  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const slice = (name) => { const i = src.indexOf("function " + name + "("); return i < 0 ? "" : src.slice(i, i + 2600); };
  ok("cardFrontHTML draws the picture and NOT the question",
     /const art = cardArtSpec\(c\);[\s\S]{0,120}return art \? cardArtHTML\(art, c\) : q;/.test(slice("cardFrontHTML")));
  ok("…and the fields are built from the card's own answers", /cardArtAnswers\(c\)/.test(slice("cardArtHTML")));
  /* THE ASKED SET IS THREE. Read off the declaration rather than the rendered page as well as from it,
     so a fourth field added back is caught whichever end it is added at. */
  const fieldKeys = (appSrc.match(/const ART_FIELDS = \[([\s\S]*?)\];/) || [, ""])[1].match(/k: "(\w+)"/g) || [];
  ok("ART_FIELDS asks three things and not four",
     fieldKeys.join(",") === 'k: "title",k: "artist",k: "date"', fieldKeys);
  ok("…and `location` is still derived, for the grid's sake", /location: pick\(ART_PLACE_LABELS\)/.test(slice("cardArtAnswers")));
  ok("…each marked by its own kind of comparison", /function artMatch\(kind, typed, answer\)/.test(src) && /kind === "date"/.test(slice("artMatch")));
  ok("…and the reveal replaces the fields rather than disabling them", /input\.replaceWith\(out\)/.test(slice("gradeArtFields")));
  /* THE FRONT IS BARE, AS A STRING. cardArtHTML must emit the src and the alt and nothing else — the
     browser half below reads the rendered card, and this reads the builder, so a leak added to either
     one is caught by the other. */
  const built = slice("cardArtHTML");
  ok("…and the front markup carries no title, credit or desc", !/spec\.title|spec\.credit|spec\.desc/.test(built.split("cardArtReveal")[0]));
  ok("…and no data-img-* attribute", !/data-img-/.test(built.split("function cardArtReveal")[0]));
  ok("cardArtReveal is what adds them", /fig\.classList\.add\("revealed"\)/.test(slice("cardArtReveal")) && /data-img-credit/.test(slice("cardArtReveal")));
  ok("the revealed picture is what the viewer opens", /IMG_OPEN_SEL = ".card-img, .av-flag, .art-shot.revealed"/.test(src));
  ok("gameCardIdSet keeps artworks out of the text-only games", /difficultyOK\(c\) && !cardMapSpec\(c\) && !cardArtSpec\(c\)/.test(src));
  ok("picturePool takes them in", /const c = cardById\(id\), spec = cardArtSpec\(c\);/.test(src) && /const artIds = availableCardIdSet\(\);/.test(src));
  ok("serializeCardData carries `artwork` through", /o\.artwork = true/.test(slice("serializeCardData")));
  ok("revertCard restores it", /\.artwork = p\.artwork/.test(src));

  /* ---------- 2. the card on screen ------------------------------------------------------- */
  sect("2. the front says nothing but the picture, and asks three things");
  const browser = await chromium.launch(process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {});
  const page = await browser.newPage();
  /* THE PICTURE IS SERVED LOCALLY, and that is not a convenience. An artwork card's `src` is a Commons
     URL, so without this the suite is a test of whether Wikimedia is reachable — and when it is not, the
     card's own dead-file handling fires (`.art-shot.media-dead`) and the viewer correctly REFUSES to
     open, which reads as this format being broken. It is served as a real 2x2 PNG so the `load` event
     fires and the live path is what gets tested; the dead path is exercised deliberately further down. */
  const PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEklEQVR4nGP8//8/AzJgYkAFRPIBaIUDvHBOP2sAAAAASUVORK5CYII=",
    "base64");
  let pictureBlocked = false;
  await page.route("**/upload.wikimedia.org/**", (route) =>
    pictureBlocked ? route.abort() : route.fulfill({ status: 200, contentType: "image/png", body: PNG }));
  const errs = [];
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });
  page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));

  const card = art[0];
  let visit = 0;
  const study = async (id) => {
    await page.addInitScript((cid) => {
      localStorage.setItem("folio_tour_v1", "1");
      sessionStorage.setItem("folio_study_v1", JSON.stringify({ scope: { type: "card", id: cid }, queue: [cid], id: cid, qi: 0, rev: false, studied: 0 }));
    }, id);
    await page.goto("http://localhost:" + PORT + "/?c=" + (++visit) + "#study");
    await page.waitForSelector(".art-shot", { timeout: 20000 });
    await page.waitForFunction(() => !document.querySelector(".page-ghost"), null, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(200);
  };
  await study(card.id);

  const front = await page.evaluate(() => {
    const fig = document.querySelector(".art-shot");
    const q = document.querySelector(".question");
    return { html: fig.outerHTML, qhtml: q.innerHTML, cap: !!fig.querySelector("figcaption"),
             attrs: [...fig.attributes].map((a) => a.name),
             imgs: document.querySelectorAll(".study-card img").length,
             fields: [...document.querySelectorAll(".question .art-input")].map((i) => i.dataset.artf),
             values: [...document.querySelectorAll(".question .art-input")].map((i) => i.value),
             labels: [...document.querySelectorAll(".question .art-lab")].map((l) => l.textContent.trim()),
             /* the words on the question side, with the form's own labels taken out: anything left is a
                sentence that should not be there. */
             words: (() => { const c = q.cloneNode(true); c.querySelectorAll(".art-ask").forEach((n) => n.remove());
                             return c.textContent.replace(/\s+/g, " ").trim(); })() };
  });
  const leaks = [String(card.image.title || ""), String(card.image.credit || ""), String(card.image.desc || ""), String(card.answerText || "")]
    .filter((s) => s.trim().length > 3).filter((s) => front.html.indexOf(s) >= 0);
  ok("nothing on the front names the work", leaks.length === 0, leaks);
  /* THE REQUEST, ASSERTED DIRECTLY: "on the question side it should show no words but an image". */
  ok("…and the question side carries no prose at all", front.words === "", front.words.slice(0, 80));
  ok("…there is no caption yet", !front.cap);
  ok("…and no data-img-* attribute to open the viewer with", !front.attrs.some((a) => a.indexOf("data-img") === 0), front.attrs);
  ok("…and the picture is not announced as a control", !front.attrs.includes("role") && !front.attrs.includes("title"), front.attrs);
  ok("…and exactly one picture is on the card", front.imgs === 1, front.imgs);
  ok("the answer box asks for the title, the artist and the date", front.fields.join(",") === "title,artist,date", front.fields);
  /* THE REQUEST, ASSERTED DIRECTLY: "remove the 'where is it now' from the question". */
  ok("…and not for where the work is now", front.fields.indexOf("location") < 0, front.fields);
  ok("…and every field starts empty", front.values.every((v) => v === ""), front.values);
  ok("…under labels that say what to type", front.labels.length === 3 && front.labels[0] === "Title", front.labels);
  /* A label may not be the answer wearing a label's clothes. */
  const inLabels = front.labels.join(" ").toLowerCase();
  ok("…and no label leaks an answer", !inLabels.includes(String(card.answerText).toLowerCase().slice(0, 12)), front.labels);

  sect("3. the reveal marks each answer and gives the credit the licence asks for");
  /* Type one right answer, one nearly-right date and one wrong one, so all three verdicts are exercised
     on a real card rather than asserted from the source. */
  const wantDate = await page.evaluate(() => {
    const d = document.querySelector("#artf-date"); return d ? true : false;
  });
  await page.fill("#artf-title", card.answerText);
  await page.fill("#artf-artist", "Definitely Not The Artist");
  if (wantDate) await page.fill("#artf-date", "c. 39,000 years ago");
  await page.evaluate(() => document.querySelector("#reveal-btn").click());
  await page.waitForTimeout(400);
  const marks = await page.evaluate(() => {
    const out = {};
    document.querySelectorAll(".question .art-f").forEach((f) => {
      const g = f.querySelector(".art-graded");
      out[f.dataset.artrow] = { cls: g ? g.className : "", said: (f.querySelector(".art-said") || {}).textContent || "",
                                truth: (f.querySelector(".art-true") || {}).textContent || "",
                                live: !!f.querySelector("input") };
    });
    return out;
  });
  ok("the right title is marked right", /\bok\b/.test(marks.title.cls), marks.title);
  ok("…a wrong artist is marked wrong", /\bbad\b/.test(marks.artist.cls), marks.artist);
  ok("…and is shown the answer it missed", marks.artist.truth.length > 0, marks.artist.truth);
  /* THE BAND SCALES WITH THE WORK'S AGE (see artYearBand). A thousand years out on a 40,000-year-old
     carving is the answer; on a dated painting it would not be. Both directions are asserted, because a
     band that has quietly become infinite passes the first check and says nothing. */
  ok("…a date a thousand years out on a 40,000-year-old work is CLOSE", /\bnear\b/.test(marks.date.cls), marks.date);
  ok("…and the graded rows are the three asked for", Object.keys(marks).join(",") === "title,artist,date", Object.keys(marks));
  /* No editable copy survives the reveal, or a reader can improve an answer after seeing it. */
  ok("…no field is still typeable", Object.values(marks).every((m) => !m.live), Object.values(marks).map((m) => m.live));
  /* The other direction, asserted on the real function rather than through the page: the band is a
     proportion of the age with a floor, so it must still REFUSE a guess that is wildly out — and must
     still be tight on a dated picture, which is the case a scaling band is most likely to lose. */
  const bands = await page.evaluate(() => {
    const f = window.__folioArtMatch;
    return f ? { far: f("date", "c. 20,000 years ago", "c. 40,000 years ago"),
                 near: f("date", "c. 39,000 years ago", "c. 40,000 years ago"),
                 painting_close: f("date", "1640", "1642"),
                 painting_far: f("date", "1600", "1642") } : null;
  });
  ok("…and the band still refuses a guess half the age of the work", bands && bands.far === "bad", bands);
  ok("…while a painting keeps a tight band", bands && bands.painting_close === "near" && bands.painting_far === "bad", bands);
  const back = await page.evaluate(() => {
    const fig = document.querySelector(".art-shot");
    return { revealed: fig.classList.contains("revealed"), cap: (fig.querySelector(".art-cap") || {}).textContent || "",
             role: fig.getAttribute("role"), src: fig.getAttribute("data-img-src") || "",
             sameSrc: [...document.querySelectorAll(".study-card img")].filter((i) => i.getAttribute("src") === fig.querySelector("img").getAttribute("src")).length,
             facts: [...document.querySelectorAll(".study-card .card-facts .cf-tile")].map((t) =>
               ({ k: (t.querySelector(".cf-k") || {}).textContent || "", v: (t.querySelector(".cf-v") || {}).textContent || "" })),
             slot: document.querySelectorAll(".study-card .card-imgslot").length };
  });
  /* THE OTHER HALF OF THE REQUEST: "ensure it's mentioned on the answer side". It is not asked for any
     more, so the ONE thing that now carries it to the reader is the figures grid — and a grid that
     stopped drawing it would look exactly like a card that never had a location. */
  const place = (card.facts || []).find((r) => PLACE_RX.test(String(r[0] || "").trim())) || [];
  ok("the answer side still states where the work is now",
     back.facts.some((t) => PLACE_RX.test(t.k) && t.v === String(place[1] || "~")), back.facts);
  ok("the picture is credited once the answer is out", back.revealed && back.cap.indexOf(String(card.image.credit).slice(0, 12)) >= 0, back.cap.slice(0, 80));
  ok("…and can now be enlarged", back.role === "button" && back.src === card.image.src);
  /* buildBack draws the background picture slot for every other surface; the study page drops that copy
     at the reveal, and if the drop stops firing the same picture is on screen twice. */
  ok("…and the back's own copy of it is gone", back.slot === 0 && back.sameSrc === 1, back);

  await page.evaluate(() => document.querySelector(".art-shot").click());
  await page.waitForTimeout(250);
  const viewer = await page.evaluate(() =>
    ({ open: !!document.querySelector(".img-viewer, .media-viewer, #imgViewer"),
       overlays: [...document.body.children].map((n) => n.className || n.id).filter(Boolean).slice(-6) }));
  ok("clicking it opens the fullscreen viewer", viewer.open, viewer.overlays);
  await page.keyboard.press("Escape");

  /* A field left blank must SAY so and give up its answer, rather than rendering as an empty row that
     reads like a field the card had nothing to put in. It used to be checked on the location, which was
     the one field the pass above never filled; with three fields all of them are filled, so it is its
     own reveal — which is the stronger check anyway, asking it of every field at once. */
  await study(card.id);
  await page.evaluate(() => document.querySelector("#reveal-btn").click());
  await page.waitForTimeout(400);
  const blanks = await page.evaluate(() =>
    [...document.querySelectorAll(".question .art-f")].map((f) => {
      const g = f.querySelector(".art-graded");
      return { k: f.dataset.artrow, cls: g ? g.className : "", truth: (f.querySelector(".art-true") || {}).textContent || "" };
    }));
  ok("an unanswered field says so rather than staying blank",
     blanks.length === 3 && blanks.every((b) => /\bempty\b/.test(b.cls)), blanks);
  ok("…and every one of them is shown what the answer was",
     blanks.every((b) => b.truth.trim().length > 0), blanks);

  /* ---------- 3a. a file that never arrives ------------------------------------------------- */
  sect("3a. a picture that cannot load says so");
  /* On every other card a dead picture is simply hidden. Here it is the WHOLE QUESTION, so hiding it
     would leave four empty fields under nothing — and the browser's own fallback paints the alt text,
     which describes the work, at full size in the frame. `.art-shot` is in the delegated error
     listener's selector for that reason, and the viewer refuses a frame with no file behind it. */
  pictureBlocked = true;
  await study(card.id);
  await page.waitForTimeout(500);
  const dead = await page.evaluate(() => {
    const fig = document.querySelector(".art-shot");
    return { marked: fig.classList.contains("media-dead"),
             imgShown: getComputedStyle(fig.querySelector("img")).display !== "none",
             note: getComputedStyle(fig, "::after").content || "",
             fields: document.querySelectorAll(".question .art-input").length };
  });
  ok("a dead file marks the frame", dead.marked, dead);
  ok("…the browser's alt-text fallback is not painted in it", !dead.imgShown, dead);
  ok("…the frame says what happened", /could not be loaded/i.test(dead.note), dead.note);
  ok("…and the three fields are still there to answer into", dead.fields === 3, dead.fields);
  pictureBlocked = false;
  await study(card.id);

  /* ---------- 3b. the answer-before-revealing policy sees these fields ---------------------- */
  sect("3b. \"Answer before revealing\" recognises the three fields");
  /* ATTEMPT_SEL had to learn about `.art-input`, and a gate that silently stops engaging on one format
     looks exactly like a reader who has not turned the policy on. Re-studied with `attemptFirst` set. */
  await page.addInitScript(() => {
    const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    S.settings = Object.assign({}, S.settings, { attemptFirst: true });
    localStorage.setItem("folio_v1", JSON.stringify(S));
  });
  await study(card.id);
  const gate = await page.evaluate(() => ({
    held: !!document.querySelector("#reveal-btn").disabled,
    hint: !!document.querySelector("#revealHint"),
    dunno: !!document.querySelector("#dunno-btn"),
  }));
  ok("the reveal is held back until something is typed", gate.held && gate.hint && gate.dunno, gate);
  await page.fill("#artf-artist", "x");
  await page.waitForTimeout(200);
  ok("…and any one of the three fields releases it",
     !(await page.evaluate(() => !!document.querySelector("#reveal-btn").disabled)));
  await page.evaluate(() => { const d = document.querySelector("#dunno-btn"); if (d) d.click(); });
  await page.waitForTimeout(300);
  ok("…while \"I don't know\" reveals without one", await page.evaluate(() => !!document.querySelector(".answer")));

  /* ---------- 4. the picture round ------------------------------------------------------- */
  sect("4. the picture round deals them");
  ok("app.js was patched to expose the pool", patched);
  await page.goto("http://localhost:" + PORT + "/?c=" + (++visit) + "#home");
  await page.waitForFunction(() => !!window.__folioPicturePool, null, { timeout: 20000 });
  /* The artefacts' prose is in the lazy `artefactExtra` bundle, warmed at idle; the pool is read after
     it lands so the two halves are counted against each other rather than against a warming race. */
  await page.waitForTimeout(3000);
  const pool = await page.evaluate(() => window.__folioPicturePool().map((p) => ({ label: p.label, tag: p.tags[0], note: (p.note || "").length })));
  const wanted = art.map((c) => c.answerText);
  const got = pool.filter((p) => p.tag === "artwork").map((p) => p.label);
  ok("every artwork card is in the pool", wanted.every((w) => got.indexOf(w) >= 0), { wanted: wanted.length, got: got });
  ok("…each filed under `artwork`, which is what keeps the draw apart", got.length === wanted.length);
  ok("…and carries its own background for the reveal", pool.filter((p) => p.tag === "artwork").every((p) => p.note > 200));
  ok("…beside the artefacts, which have not gone anywhere", pool.filter((p) => p.tag === "artefact").length > 90,
    pool.filter((p) => p.tag === "artefact").length);
  ok("…and no ordinary card's illustration came back with them", pool.every((p) => p.tag === "artwork" || p.tag === "artefact"));

  ok("no console errors", errs.length === 0, errs.slice(0, 3));
  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed.");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
