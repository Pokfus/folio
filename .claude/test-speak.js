// Automatic read-aloud on reveal — the per-deck switch, and the guard that keeps it quiet.
//
// Both halves fail silently and in opposite directions, which is why each is asserted from both sides. A
// switch that appears on a deck with nothing to say is a control that answers a press with silence; a
// switch that never appears is a feature nobody can find. And a card that speaks on every repaint — not
// only when a reader asked for the answer — is a card nobody can leave open, which no count of assertions
// about the happy path would ever notice.
//
// The deck is built here rather than read off decks/, so this tests the FEATURE and not a content file.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-speak.js
//   FOLIO_CHROMIUM=<path to chrome>   if Chromium lives outside the playwright package
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
});

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
}

// two decks of the same shape: one whose type marks text to be read aloud, one whose type does not
function deckFile(id, title, speaks, saysOther) {
  /* saysOther gives the control a data-say: it SHOWS the meaning and PRONOUNCES the word. That is what a
     pinyin button needs — a Mandarin voice handed a romanisation reads the letters — and it fails silently
     if the attribute is ever dropped, because the control still works and simply says the wrong thing. */
  const ctl = saysOther
    ? '<span class="uc-tts" data-say="{{Word}}">{{Meaning}}</span>'
    : '<span class="uc-tts">{{Word}}</span>';
  const type = {
    id: "vocab", name: "Vocab", speechLang: speaks ? "zh-CN" : "",
    fields: ["Word", "Meaning"],
    front: '<div class="uc-q">{{Meaning}}</div>',
    back: "{{FrontSide}}<hr><div class=\"uc-a\">" + (speaks ? ctl : "{{Word}}") + "</div>",
    css: ".card {\n  font-size: 17px;\n}\n",
  };
  const words = [["爱", "love"], ["八", "eight"], ["茶", "tea"]];
  return {
    folioDeck: 1,
    meta: { id, title, subtitle: "", desc: "", author: "", language: "en", tags: [],
            glossMode: "site", types: { vocab: type }, version: 1 },
    cards: words.map((w, i) => ({
      id: "u_" + id + "_" + (i + 1), num: String(i + 1), category: "",
      question: "", answer: "", answerDate: "", traditional: "", hanzi: "", pinyin: "",
      translations: "", abstract: "", citation: "", answerText: "",
      type: "vocab", fields: { Word: w[0], Meaning: w[1] },
    })),
    gloss: {},
  };
}

const opts = (page) => page.evaluate(() => {
  try { return JSON.parse(localStorage.getItem("folio_v1") || "{}").deckOpts || {}; } catch (e) { return {}; }
});
const sheetInfo = (page) => page.evaluate(() => {
  const sp = document.querySelector('[data-act="speak"]');
  return {
    open: !!document.querySelector(".dm-head"),
    title: (document.querySelector(".dm-title") || {}).textContent || "",
    has: !!sp,
    label: sp ? (sp.querySelector("b") || {}).textContent : "",
    note: sp ? (sp.querySelector("small") || {}).textContent : "",
    on: sp ? sp.querySelector(".switch").classList.contains("on") : null,
  };
});
// the sheet is opened by a long press; contextmenu is the same way in and is what a mouse uses
const holdRow = (page, match) => page.evaluate((m) => {
  const r = [...document.querySelectorAll(".active-deck")].find((e) => new RegExp(m, "i").test(e.textContent));
  if (!r) return false;
  r.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }));
  return true;
}, match);

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch(LAUNCH);
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  // the spy goes in before any page script, so it is watching from the first frame
  await ctx.addInitScript(() => {
    window.__spoke = [];
    try {
      const orig = speechSynthesis.speak.bind(speechSynthesis);
      speechSynthesis.speak = (u) => { window.__spoke.push({ text: u.text, lang: u.lang }); try { orig(u); } catch (e) {} };
    } catch (e) {}
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });

  check("the browser has a speech engine to gate on",
    await page.evaluate(() => !!(window.speechSynthesis && window.SpeechSynthesisUtterance)));

  for (const [id, title, speaks, saysOther] of [["spkdeck", "Speaking deck", true, false],
                                                 ["quietdeck", "Quiet deck", false, false],
                                                 ["saydeck", "Says other", true, true]]) {
    const tmp = path.join(os.tmpdir(), "folio-" + id + ".folio-deck.json");
    fs.writeFileSync(tmp, JSON.stringify(deckFile(id, title, speaks, saysOther)));
    await page.goto(base + "/#studio");
    await page.reload();
    await page.waitForTimeout(900);
    const chooser = page.waitForEvent("filechooser");
    await page.click("#stImport");
    await (await chooser).setFiles(tmp);
    await page.waitForTimeout(1300);
  }

  /* ---------- the switch is offered only where something can speak ---------- */
  await page.goto(base + "/#decks");
  await page.waitForTimeout(1300);
  for (const id of ["spkdeck", "quietdeck"]) {
    const add = await page.$('[data-uadd="' + id + '"]');
    if (add) { await add.click(); await page.waitForTimeout(600); }
  }
  await page.goto(base + "/#home");
  await page.waitForTimeout(1200);

  check("the speaking deck has a row on the home page", await holdRow(page, "Speaking deck"));
  await page.waitForTimeout(600);
  let s = await sheetInfo(page);
  check("holding it opens its options", s.open, JSON.stringify(s.title));
  check("…which offer 'Read aloud automatically'", s.has, JSON.stringify(s.label));
  /* IT STARTS ON since Aug 2026, on request — where it was opt-in, on the reasoning that a site making a
     noise by itself should be asked first. What makes that safe is the gate one line above: the row is
     drawn only where the deck's own card type MARKS something to read, so the author of the deck has
     already asked for it, and a deck that marks nothing is silent whatever this says. */
  check("…starting ON, the deck's own type having asked for it", s.on === true, String(s.on));
  check("…and saying what it is doing", /revealed/i.test(s.note), JSON.stringify(s.note));

  await page.click('[data-act="speak"]');
  await page.waitForTimeout(500);
  s = await sheetInfo(page);
  check("throwing it leaves the sheet open (a switch is a setting, not a command)", s.open);
  check("…the switch reads off", s.on === false);
  check("…and its note now says how to hear a card instead", /speaker/i.test(s.note), JSON.stringify(s.note));
  const stored = await opts(page);
  check("the choice is stored against that deck alone",
    stored["u:spkdeck"] && stored["u:spkdeck"].autoSpeak === false && !(stored["u:quietdeck"] || {}).autoSpeak,
    JSON.stringify(stored["u:spkdeck"] || null));
  // …and back on, so the study section below meets the behaviour the deck ships with
  await page.click('[data-act="speak"]');
  await page.waitForTimeout(500);
  check("…and throwing it back writes the other value", (await opts(page))["u:spkdeck"].autoSpeak === true);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  check("a deck whose type marks nothing to read offers no switch", await holdRow(page, "Quiet deck"));
  await page.waitForTimeout(600);
  s = await sheetInfo(page);
  check("…its sheet opened", s.open, JSON.stringify(s.title));
  check("…and carries no read-aloud row", s.open && s.has === false);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  // the pooled review answers for whatever is added to it right now
  await page.evaluate(() => {
    const b = document.querySelector(".review-group .banner");
    if (b) b.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }));
  });
  await page.waitForTimeout(600);
  check("the pooled review offers it too, a speaking deck being added to it", (await sheetInfo(page)).has);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  /* ---------- revealing speaks, and nothing else does ---------- */
  await page.goto(base + "/#decks");
  await page.waitForTimeout(1300);
  await (await page.$('[data-udeck="spkdeck"]')).click();
  await page.waitForTimeout(1300);
  await page.evaluate(() => { window.__spoke = []; });
  const rev = await page.$("#reveal-btn");
  check("a card of the speaking deck is showing", !!rev);
  check("…and showing it has said nothing yet", (await page.evaluate(() => window.__spoke)).length === 0);
  if (rev) { await rev.click(); await page.waitForTimeout(900); }
  const spoke = await page.evaluate(() => window.__spoke);
  check("revealing speaks, with no button pressed", spoke.length === 1, JSON.stringify(spoke));
  if (spoke.length) {
    check("…it speaks the marked run", spoke[0].text === "爱", JSON.stringify(spoke[0].text));
    check("…in the language the type declares", /^zh/i.test(spoke[0].lang || ""), spoke[0].lang);
  }

  /* The restore path must stay SILENT. showAnswer() runs again from renderCard's own tail whenever an
     already-revealed card is re-opened — after a reload, a language switch, or an undo. A RELOAD is the
     one to drive it with: undo stopped re-opening a revealed card in Aug 2026, when it was changed on
     request to bring the card back AT ITS QUESTION (a card whose answer is on screen cannot be answered
     again, only re-scored), and this suite went on asserting the old behaviour for a fortnight. `rev` is
     part of what `STUDY_KEY` records, so a reload restores the revealed card down the same branch — and
     `addInitScript` re-arms the speech spy on the new document, so an empty `__spoke` after it is the
     assertion. */
  await page.keyboard.press("3");
  await page.waitForTimeout(900);
  if (await page.$(".chest-pop")) { await page.keyboard.press("Escape"); await page.waitForTimeout(500); }
  check("grading moves on to the next card, unrevealed",
    await page.evaluate(() => !document.querySelector(".uc-card.uc-back")));
  const before = (await page.evaluate(() => window.__spoke)).length;
  await page.keyboard.press("Control+z");
  await page.waitForTimeout(1000);
  const undone = await page.evaluate(() => ({ back: !!document.querySelector(".uc-card.uc-back"), card: !!document.querySelector(".uc-card"), n: window.__spoke.length }));
  check("undo brings the card back at its question", undone.card && !undone.back);
  check("…and it does NOT speak, an unrevealed card having nothing to say", undone.n === before, before + " -> " + undone.n);

  const rev1 = await page.$("#reveal-btn");
  if (rev1) { await rev1.click(); await page.waitForTimeout(900); }
  check("revealing it again speaks", (await page.evaluate(() => window.__spoke)).length > before);
  await page.reload({ waitUntil: "load" });
  /* WAIT FOR THE CARD, NOT FOR A CLOCK. A community deck's cards live in the notes store and are warmed
     after boot, so `PAGES.study` renders its loading placard first and the resumed queue resolves only
     once they land -- a fixed 1,400ms found an empty page and read it as the reveal not having been
     restored. */
  await page.waitForFunction(() => !!document.querySelector(".uc-card"), null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(600);
  const restored = await page.evaluate(() => ({ back: !!document.querySelector(".uc-card.uc-back"), n: window.__spoke.length }));
  check("a reload brings the revealed card back revealed", restored.back);
  check("…and the restore path says nothing — only a reader's own reveal speaks", restored.n === 0, String(restored.n));

  /* ---------- and the quiet deck stays quiet ---------- */
  await page.goto(base + "/#decks");
  await page.waitForTimeout(1300);
  await (await page.$('[data-udeck="quietdeck"]')).click();
  await page.waitForTimeout(1300);
  await page.evaluate(() => { window.__spoke = []; });
  const rev2 = await page.$("#reveal-btn");
  if (rev2) { await rev2.click(); await page.waitForTimeout(900); }
  check("a deck with nothing marked to read says nothing on reveal",
    (await page.evaluate(() => window.__spoke)).length === 0);

  /* ---------- a control may show one thing and say another ---------- */
  await page.goto(base + "/#decks");
  await page.waitForTimeout(1300);
  await (await page.$('[data-udeck="saydeck"]')).click();
  await page.waitForTimeout(1300);
  await page.evaluate(() => { window.__spoke = []; });
  const rev3 = await page.$("#reveal-btn");
  if (rev3) { await rev3.click(); await page.waitForTimeout(900); }
  const ds = await page.evaluate(() => {
    const el = document.querySelector(".uc-card.uc-back .uc-tts");
    return el ? { say: el.getAttribute("data-say"), shown: el.textContent.trim(), aria: el.getAttribute("aria-label") } : null;
  });
  check("data-say survives the sanitiser", ds && ds.say === "\u7231", JSON.stringify(ds && ds.say));
  check("…while the control still shows its own words", ds && ds.shown === "love", JSON.stringify(ds && ds.shown));
  check("…and is named by what it will SAY", ds && /\u7231/.test(ds.aria || ""), JSON.stringify(ds && ds.aria));
  await page.evaluate(() => { window.__spoke = []; });
  await page.click(".uc-card.uc-back .uc-tts");
  await page.waitForTimeout(800);
  const said = await page.evaluate(() => window.__spoke);
  check("pressing it speaks data-say, not the visible text",
    said.length === 1 && said[0].text === "\u7231", JSON.stringify(said));

  /* \u2026AND IT IS STILL PRESSABLE WITH THE MARKER OUT (Aug 2026, on request: "while the whiteboard marker is
     selected, all buttons are still clickable, including the tts button on user imported/shared cards").
     The ink layer covers the whole visible page, and this control is a `role="button"` SPAN inside the
     card's prose \u2014 so `CTL_SEL`, which only knows real controls, cannot see it and the press landed on the
     canvas. It is a `TIP_SEL` target instead, taking the glossary term's rule: a tap presses it, a drag
     through it draws. **`CTL_SEL` must NOT be widened to `[role="button"]` to fix this** \u2014 a card's picture
     is one too, and half a background would stop taking ink.
     Driven with real mouse input rather than `el.click()`, which would bypass the very hit-test under
     test: the whole question is what a POINTER landing on that spot does while a canvas is over it. */
  const penDown = await page.evaluate(() => {
    const t = document.querySelector(".wb-toggle");
    if (!t) return "no marker button";
    t.click();                                                   // open the tools
    const pen = document.querySelector(".wb-panel .wb-size, .wb-panel .wb-btn");
    if (!pen) return "no tool to choose";
    pen.click();                                                 // choosing a tool is what puts the pen down
    return document.querySelector(".draw-canvas") ? "" : "no canvas";
  });
  check("the marker can be put down over a card", penDown === "", penDown);
  if (penDown === "") {
    await page.waitForTimeout(400);
    await page.evaluate(() => { window.__spoke = []; });
    const box = await page.evaluate(() => {
      const el = document.querySelector(".uc-card.uc-back .uc-tts");
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
    });
    await page.mouse.move(box.x, box.y);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(800);
    const underPen = await page.evaluate(() => window.__spoke);
    check("\u2026and the read-aloud button still answers a tap with the pen down",
      underPen.length === 1 && underPen[0].text === "\u7231", JSON.stringify(underPen));
    /* \u2026while a DRAG through it still draws, which is the other half of the same rule and the reason this
       could not simply join `CTL_SEL`: a real control claims the gesture at pointerdown, and a card's
       prose is dense with these. */
    await page.evaluate(() => { window.__spoke = []; });
    await page.mouse.move(box.x - 40, box.y);
    await page.mouse.down();
    await page.mouse.move(box.x + 40, box.y, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(600);
    check("\u2026while a drag through it draws instead of pressing it",
      (await page.evaluate(() => window.__spoke)).length === 0);
  }

  const own = errs.filter((e) => !/fonts\.googleapis|gstatic|ERR_CONNECTION_RESET/.test(e));
  check("no same-origin console errors", own.length === 0, own.slice(0, 3).join(" | "));

  console.log("\n" + pass + " passed, " + fail + " failed");
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
