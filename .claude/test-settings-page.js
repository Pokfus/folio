#!/usr/bin/env node
/* Folio — the Settings page (#settings), as compacted and repaired out of the Nov 2026 audit.
   ==========================================================================================
   The audit measured the page at 9.6 screens on a phone and 5.7 on a laptop and found faults that throw
   nothing: a switch that could not be worked from a keyboard, a two-way switch over a four-way setting, a
   focus ring drawn in a colour that was never defined. Every one of those is the kind that comes back
   quietly, so each has an assertion here. docs/reader-settings.md "The Settings page, compacted" has the
   reasoning.

   What it guards:
     · Night mode flips ONCE per Enter / Space (two keydown listeners flipped it twice).
     · Review order is a picker of every order the daily review can take, shows the one in force (By
       difficulty where nothing is stored) and never leaves a different order behind than the one chosen.
     · Daily limits opens the "All decks" figures alone, and an untouched Save writes nothing.
     · A row's description is short, with the rest behind a "More" button that says what it does.
     · The seven day buttons sit on one line on a phone, are tall enough for a thumb and draw a focus ring.
     · The theme tiles say which one is worn (aria-pressed), not only in a class.
     · The read-aloud voice and speed are in the page only while the buttons are on.
     · The confirmation dialog has a name, a labelled field, keeps Tab inside itself, gives the focus back,
       and does not confirm on Enter while the focus is on Cancel; a restore starts on Cancel.
     · The four links (walkthrough, How Folio studies you, keyboard shortcuts, Sources and credits) are in
       one strip, and the page stays inside a length budget at both widths with no sideways overflow.

   Run:  NODE_PATH=<playwright>/node_modules node .claude/test-settings-page.js
   Env:  FOLIO_CHROMIUM=<path to chrome> if Chromium lives outside the playwright package. */
const path = require("path"), http = require("http"), fs = require("fs");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const ROOT = path.join(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
let pass = 0, fail = 0;
const check = (n, ok, extra) => { if (ok) { pass++; console.log("ok    " + n); } else { fail++; console.log("FAIL  " + n + (extra ? "  " + extra : "")); } };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("nf"); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  res.end(fs.readFileSync(f));
});

const DAY = 86400000;
// a reader with a record, some themes and no stored review order — the state the order fault needed
function seed() {
  const T = Date.now(), cards = {};
  for (let i = 1; i <= 12; i++) cards["wh-" + String(i).padStart(3, "0")] = { reps: 3, lapses: 0, ease: 2.5, interval: 6, due: T + i * DAY, status: "review", last: T - DAY, seen: T - 9 * DAY };
  return { user: { name: "Scholar", joined: T - 60 * DAY }, cards, themes: { synth: T - 30 * DAY, arcade: T - 20 * DAY, ruby: T - DAY },
    settings: { themeAuto: false, night: false, theme: "folio", fontSize: "large" } };
}

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch(LAUNCH);
  const errs = [];
  const open = async (viewport) => {
    const ctx = await browser.newContext({ viewport, hasTouch: viewport.width < 500 });
    const page = await ctx.newPage();
    page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });
    page.on("pageerror", (e) => errs.push(String(e)));
    await page.route(/supabase\.co/, (route) => route.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
    await page.addInitScript((s) => { if (!localStorage.getItem("__seeded")) { localStorage.setItem("__seeded", "1"); localStorage.setItem("folio_v1", JSON.stringify(s)); } }, seed());
    await page.goto(base + "#settings", { waitUntil: "load" });
    await page.waitForSelector("#sw-night", { timeout: 30000 });
    await page.waitForTimeout(600);
    return page;
  };
  const st = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("folio_v1")));

  /* ================= desktop ================= */
  const page = await open({ width: 1440, height: 950 });

  // ---- 1. Night mode from the keyboard
  await page.focus("#sw-night"); await page.keyboard.press("Enter"); await page.waitForTimeout(150);
  const n1 = (await st(page)).settings.night;
  await page.keyboard.press("Space"); await page.waitForTimeout(150);
  const n2 = (await st(page)).settings.night;
  check("Enter on the Night mode switch turns it on, once", n1 === true, String(n1));
  check("…and Space turns it back off", n2 === false, String(n2));

  // ---- 2. Review order
  const ord = await page.evaluate(() => { const s = document.querySelector("#reviewOrderSel"); return s ? { opts: [...s.options].map((o) => o.value), val: s.value, note: (document.querySelector("#reviewOrderNote") || {}).textContent, sw: !!document.querySelector("#sw-random") } : null; });
  check("Review order is a picker, not the two-way switch", !!ord && !ord.sw, JSON.stringify(ord));
  check("…offering every order the daily review can take", !!ord && ["ordered", "random", "difficulty"].every((m) => ord.opts.includes(m)), JSON.stringify(ord && ord.opts));
  check("…and showing By difficulty, the order in force where nothing is stored", !!ord && ord.val === "difficulty" && /\w/.test(ord.note || ""), JSON.stringify(ord));
  await page.selectOption("#reviewOrderSel", "random"); await page.waitForTimeout(100);
  const o1 = (await st(page)).settings, note1 = await page.textContent("#reviewOrderNote");
  check("choosing Random stores it under both names", o1.reviewOrder === "random" && o1.reviewRandom === true, JSON.stringify([o1.reviewOrder, o1.reviewRandom]));
  check("…and the line under the picker follows", note1 !== ord.note && /shuffl/i.test(note1), note1);
  await page.selectOption("#reviewOrderSel", "difficulty"); await page.waitForTimeout(100);
  const o2 = (await st(page)).settings;
  check("choosing By difficulty again leaves By difficulty, not Ordered", o2.reviewOrder === "difficulty" && o2.reviewRandom === false, JSON.stringify([o2.reviewOrder, o2.reviewRandom]));

  // ---- 3. Daily limits
  // a freshly opened sheet ignores a press for half a second (DECK_SHEET_ARM_MS), so each visit waits it out
  await page.click("#limitsOpen"); await page.waitForSelector('.deck-menu [data-lim="gNew"]', { timeout: 5000 }); await page.waitForTimeout(700);
  const lim = await page.evaluate(() => ({ fields: [...document.querySelectorAll(".deck-menu [data-lim]")].map((e) => e.dataset.lim), deckPane: !!document.querySelector('.deck-menu [data-pane="deck"]') }));
  check("Daily limits opens the All decks figures on their own", lim.fields.join() === "gNew,gRev" && !lim.deckPane, JSON.stringify(lim));
  await page.click('.deck-menu [data-act="save"]'); await page.waitForTimeout(400);
  check("…and saving them untouched writes nothing", !(await st(page)).settings.limitsCustom && (await page.textContent("#limitsOpen")).trim() === "Defaults");
  await page.click("#limitsOpen"); await page.waitForSelector('.deck-menu [data-lim="gNew"]'); await page.waitForTimeout(700);
  await page.fill('.deck-menu [data-lim="gNew"]', "7"); await page.click('.deck-menu [data-act="save"]'); await page.waitForTimeout(400);
  const l2 = (await st(page)).settings, lbl = (await page.textContent("#limitsOpen")).trim();
  check("a changed figure is stored and shown on the button", l2.limitsCustom === true && l2.newPerDay === 7 && /^7 \/ \d+$/.test(lbl), JSON.stringify([l2.limitsCustom, l2.newPerDay, lbl]));

  // ---- 4. "More"
  const more = await page.evaluate(() => {
    const b = [...document.querySelectorAll(".settings .set-more")];
    const first = b[0], x = document.getElementById(first.getAttribute("aria-controls"));
    const before = { hidden: x.hidden, exp: first.getAttribute("aria-expanded"), name: first.getAttribute("aria-label") };
    first.click();
    const after = { hidden: x.hidden, exp: first.getAttribute("aria-expanded"), text: first.textContent, len: x.textContent.trim().length };
    first.click();
    return { n: b.length, named: b.every((e) => /^More about \S/.test(e.getAttribute("aria-label") || "")), before, after, shut: x.hidden };
  });
  check("the long descriptions are behind More buttons that say what they are about", more.n >= 12 && more.named, JSON.stringify(more));
  check("…shut until pressed, open when pressed, and shut again", more.before.hidden && more.before.exp === "false" && !more.after.hidden && more.after.exp === "true" && more.after.text === "Less" && more.after.len > 20 && more.shut, JSON.stringify(more));

  // ---- 5. The theme tiles say which is worn
  const th0 = await page.evaluate(() => [...document.querySelectorAll(".theme-opt")].filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.dataset.theme));
  await page.click('.theme-opt[data-theme="synth"]'); await page.mouse.move(2, 2); await page.waitForTimeout(150);
  const th1 = await page.evaluate(() => [...document.querySelectorAll(".theme-opt")].filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.dataset.theme));
  check("exactly one theme tile is aria-pressed, and it follows the choice", th0.join() === "folio" && th1.join() === "synth", th0.join() + " -> " + th1.join());
  await page.click('.theme-opt[data-theme="folio"]'); await page.mouse.move(2, 2);

  // ---- 6. The day buttons draw a focus ring
  await page.focus("#reviewOrderSel");
  await page.focus('#edDays [data-ed="1"]'); await page.keyboard.press("Tab");
  const ring = await page.evaluate(() => { const e = document.activeElement, c = getComputedStyle(e); return { ed: e.dataset.ed, style: c.outlineStyle, w: parseFloat(c.outlineWidth) }; });
  check("a day button reached by Tab draws a focus ring", ring.ed === "2" && ring.style === "solid" && ring.w >= 2, JSON.stringify(ring));

  // ---- 7. Read-aloud: the voice and the speed go with the switch
  const dep = () => page.evaluate(() => [...document.querySelectorAll(".settings .tts-dep")].map((r) => r.checkVisibility()));
  const d0 = await dep();
  await page.click("#sw-tts"); const d1 = await dep();
  await page.click("#sw-tts"); const d2 = await dep();
  check("the voice and speed rows are shown while Read-aloud buttons is on", d0.length === 2 && d0.every(Boolean) && d2.every(Boolean), JSON.stringify([d0, d2]));
  check("…and are not in the page while it is off", d1.length === 2 && !d1.some(Boolean), JSON.stringify(d1));
  check("Play sample stands beside the voice it plays", await page.evaluate(() => { const s = document.querySelector("#ttsVoiceSel"), b = document.querySelector("#ttsTry"); return !!s && !!b && s.parentElement === b.parentElement; }));

  // ---- 8. Copy that had gone stale
  const copy = await page.evaluate(() => ({ text: document.querySelector("#fsRange").closest(".set-row").textContent, dayMax: document.querySelector("#dayEnd").max, acct: !!document.querySelector('#dataWhere a[href="#account"]') }));
  check("Text size no longer says the Atlas's names keep their size", !/keep their size/i.test(copy.text) && /Atlas/.test(copy.text), copy.text.slice(0, 120));
  check("Day ends at carries its noon limit", copy.dayMax === "12:00", copy.dayMax);
  check("the Data card links to the Account page", copy.acct);

  // ---- 9. Help and about
  const help = await page.evaluate(() => { const c = document.querySelector(".set-help"); return c ? ["#replayTour", "#howLink", "[data-keysheet]", "#creditsBtn"].map((q) => !!c.querySelector(q)) : null; });
  check("the walkthrough, How Folio studies you, the keyboard sheet and the credits are one strip of links", !!help && help.every(Boolean), JSON.stringify(help));

  // ---- 10. The confirmation dialog
  await page.focus("#reset"); await page.click("#reset"); await page.waitForSelector(".ip-box"); await page.waitForTimeout(80);
  const dlg = await page.evaluate(() => {
    const b = document.querySelector(".ip-box"), i = b.querySelector("input"), l = document.getElementById(b.getAttribute("aria-labelledby") || "");
    return { named: !!l && l.textContent.length > 20, input: !!(i.getAttribute("aria-label") || i.getAttribute("aria-labelledby")), extra: (b.querySelector(".ip-extra") || {}).textContent || "", focus: document.activeElement === i, msg: l ? l.textContent : "" };
  });
  check("the Reset dialog has a name and a labelled field, with the focus in it", dlg.named && dlg.input && dlg.focus, JSON.stringify(dlg));
  check("…says what goes beyond the study history, and offers a backup first", /streak/.test(dlg.msg) && /artefacts/.test(dlg.msg) && /backup/i.test(dlg.extra), dlg.msg.slice(0, 90) + " | " + dlg.extra);
  let inside = true;
  for (let i = 0; i < 6; i++) { await page.keyboard.press("Tab"); if (!(await page.evaluate(() => !!document.activeElement.closest(".ip-box")))) inside = false; }
  check("Tab stays inside the dialog", inside);
  await page.focus(".ip-cancel"); await page.keyboard.press("Enter"); await page.waitForTimeout(150);
  const afterCancel = await page.evaluate(() => ({ open: !!document.querySelector(".ip-box"), focus: document.activeElement.id, cards: Object.keys(JSON.parse(localStorage.getItem("folio_v1")).cards).length }));
  check("Enter on Cancel cancels: nothing is reset", !afterCancel.open && afterCancel.cards === 12, JSON.stringify(afterCancel));
  check("…and the focus goes back to the button that opened it", afterCancel.focus === "reset", afterCancel.focus);

  // ---- 11. A restore starts on Cancel
  await page.setInputFiles("#importFile", { name: "folio-progress.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ cards: {}, settings: {} })) });
  await page.waitForSelector(".ip-box"); await page.waitForTimeout(80);
  const rf = await page.evaluate(() => document.activeElement.className);
  await page.keyboard.press("Enter"); await page.waitForTimeout(200);
  check("the Restore confirmation starts on Cancel, so a stray Enter restores nothing", /ip-cancel/.test(rf) && Object.keys((await st(page)).cards).length === 12, rf);

  // ---- 12. Length, desktop
  const d = await page.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, vw: innerWidth, cols: new Set([...document.querySelectorAll(".settings .set-col")].map((c) => Math.round(c.getBoundingClientRect().left))).size,
    bottoms: [...document.querySelectorAll(".settings .set-col")].map((c) => Math.round(c.getBoundingClientRect().height)) }));
  check("on a laptop the page is under 4,200px (it was 5,455)", d.h < 4200, String(d.h));
  check("…in two columns that come out about level", d.cols === 2 && Math.abs(d.bottoms[0] - d.bottoms[1]) < 320, JSON.stringify(d.bottoms));
  await page.close();

  /* ================= phone ================= */
  const ph = await open({ width: 390, height: 844 });
  const p = await ph.evaluate(() => {
    const days = [...document.querySelectorAll("#edDays [data-ed]")].map((b) => b.getBoundingClientRect());
    const lines = [...document.querySelectorAll(".settings .set-row .info > p:first-of-type")].filter((e) => e.checkVisibility()).map((e) => {
      const lh = parseFloat(getComputedStyle(e).lineHeight) || parseFloat(getComputedStyle(e).fontSize) * 1.55;
      return { t: e.closest(".set-row").querySelector("h3").textContent, n: Math.round(e.getBoundingClientRect().height / lh) };
    });
    const tiles = [...document.querySelectorAll(".theme-opt")].map((b) => b.getBoundingClientRect());
    return { h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, vw: innerWidth,
      dayTops: new Set(days.map((r) => Math.round(r.top))).size, dayH: Math.min(...days.map((r) => r.height)),
      speedH: Math.min(...[...document.querySelectorAll("#ttsRatePick button")].map((b) => b.getBoundingClientRect().height)),
      long: lines.filter((l) => l.n > 3).map((l) => l.t + "=" + l.n), rows: lines.length,
      h3wrap: [...document.querySelectorAll(".settings .set-row h3")].filter((e) => e.checkVisibility() && e.getBoundingClientRect().height > parseFloat(getComputedStyle(e).fontSize) * 2).map((e) => e.textContent),
      perRow: tiles.filter((r) => Math.round(r.top) === Math.round(tiles[0].top)).length,
      hover: /hover/i.test(document.querySelector("#themeGrid").closest(".set-row").querySelector(".info").textContent) };
  });
  check("on a phone the page is under 6,500px (it was 8,074)", p.h < 6500, String(p.h));
  check("…with nothing wider than the screen", p.w <= p.vw + 1, p.w + " > " + p.vw);
  check("no description runs past three lines", p.rows >= 20 && !p.long.length, p.long.join("; "));
  check("no row's heading wraps to a second line", !p.h3wrap.length, p.h3wrap.join("; "));
  check("the seven days are on one line", p.dayTops === 1, String(p.dayTops));
  check("…and a thumb can press one: 44px tall, like the speed buttons", p.dayH >= 44 && p.speedH >= 44, p.dayH + " / " + p.speedH);
  check("the theme tiles are three across", p.perRow === 3, String(p.perRow));
  check("a touch screen is not told to hover", !p.hover);
  await ph.close();

  check("no console errors", !errs.length, errs.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
