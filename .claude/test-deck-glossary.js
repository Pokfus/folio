// Per-deck glossaries (phase 4). The property that matters most is ISOLATION: a deck's own terms must
// auto-link inside that deck's card backgrounds and NOWHERE else — not in the curated cards, not in
// another user's deck, not in the site glossary page.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-deck-glossary.js
//   FOLIO_CHROMIUM=<path to chrome>   if Chromium lives outside the playwright package
const http = require("http");
const fs = require("fs");
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

async function typeField(page, field, text) {
  const sel = '.studio-editor [data-field="' + field + '"]';
  await page.dblclick(sel);
  await page.click(sel);
  await page.keyboard.type(text, { delay: 3 });
  await page.click(".studio-title");
  await page.waitForTimeout(120);
}
// build a deck with one card whose background uses two words: one the deck defines, one the SITE defines
async function makeDeck(page, base, title, cardText) {
  await page.click("#stNew");
  await page.waitForTimeout(400);
  await page.click(".studio-settings > summary");
  await page.fill('[data-meta="title"]', title);
  await page.waitForTimeout(200);
  await page.click("#stAddCard");
  await page.waitForTimeout(300);
  await typeField(page, "question", "A test question about the ___.");
  await typeField(page, "answer", "Thing");
  await typeField(page, "abstract", cardText);
  await page.waitForTimeout(250);
}
async function addTerm(page, name, desc) {
  await page.click('[data-tab="gloss"]');
  await page.waitForTimeout(300);
  await page.click("#stAddTerm");
  await page.waitForTimeout(200);
  await page.fill(".ip-input", name);
  await page.click(".ip-ok");
  await page.waitForTimeout(400);
  const d = '.studio-editor [data-gf="desc"]';
  await page.click(d);
  await page.keyboard.type(desc, { delay: 3 });
  await page.click(".studio-title");
  await page.waitForTimeout(300);
}
// Grading cards can raise the "Level up!" overlay, which swallows clicks until dismissed. That is the app
// behaving correctly, so the test dismisses it rather than working around it.
async function dismissPopups(page) {
  await page.evaluate(() => {
    const lu = document.querySelector(".levelup-pop");
    if (lu) lu.click();
    document.querySelectorAll(".inline-prompt").forEach((e) => e.remove());
  });
  await page.waitForTimeout(250);
}
// Navigate to a named deck's Studio view.
// NOTE: page.goto() to a URL that differs only in the fragment is a same-document navigation — the app
// keeps running and studioState survives. So "go to #studio" may land in a deck view, not the list.
async function openStudioDeck(page, base, title) {
  await dismissPopups(page);
  await page.goto(base + "#studio", { waitUntil: "load" });
  await page.waitForTimeout(1000);
  await dismissPopups(page);
  const inDeck = await page.evaluate(() => !!document.querySelector("#stAll"));
  if (inDeck) {
    const rightOne = await page.evaluate((t) => ((document.querySelector(".studio-title") || {}).textContent || "") === t, title);
    if (rightOne) return;
    await page.click("#stAll");
    await page.waitForTimeout(400);
  }
  await page.evaluate((t) => {
    const rows = [...document.querySelectorAll(".studio-deck-open")];
    const hit = rows.find((r) => ((r.querySelector(".sd-title") || {}).textContent || "") === t);
    if (hit) hit.click();
  }, title);
  await page.waitForTimeout(500);
}
async function openStudioList(page, base) {
  await dismissPopups(page);
  await page.goto(base + "#studio", { waitUntil: "load" });
  await page.waitForTimeout(1000);
  await dismissPopups(page);
  if (await page.evaluate(() => !!document.querySelector("#stAll"))) {
    await page.click("#stAll");
    await page.waitForTimeout(400);
  }
}
async function setMode(page, mode) {
  await page.click('[data-tab="cards"]');
  await page.waitForTimeout(250);
  const open = await page.evaluate(() => {
    const s = document.querySelector(".studio-settings");
    if (s && !s.open) { s.querySelector("summary").click(); return true; }
    return !!s;
  });
  await page.waitForTimeout(200);
  await page.check('input[name="glossmode"][value="' + mode + '"]');
  await page.waitForTimeout(400);
  return open;
}
// study the deck and report which terms auto-linked in the background
async function studyLinks(page, base) {
  await dismissPopups(page);
  await page.goto(base + "#decks", { waitUntil: "load" });
  await page.waitForTimeout(1000);
  await page.evaluate(() => document.querySelector(".collection.udeck [data-udeck]").click());
  await page.waitForTimeout(700);
  await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
  await page.waitForTimeout(450);
  return page.evaluate(() => {
    const ab = document.querySelector(".abstract");
    if (!ab) return null;
    return [...ab.querySelectorAll(".ttip[data-k]")].map((s) => s.getAttribute("data-k"));
  });
}

(async () => {
  await new Promise((r) => server.listen(5650, r));
  const base = "http://127.0.0.1:5650/";
  const browser = await chromium.launch(LAUNCH);
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push("pageerror: " + String(e).slice(0, 220)));
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push("console: " + t.slice(0, 300)); });

  // "Paleolithic" is a real term in Folio's curated glossary; "Kestrelstone" is invented, so only this
  // deck can possibly define it. Using both in one background is what makes the three modes distinguishable.
  const CARD_TEXT = "The Kestrelstone was found in a Paleolithic layer near the river.";

  await page.goto(base + "#studio", { waitUntil: "load" });
  await page.waitForTimeout(1000);
  await makeDeck(page, base, "Glossary Deck", CARD_TEXT);
  await addTerm(page, "Kestrelstone", "A stone tool named for its shape, invented purely for this test.");
  check("term appears in the deck's glossary list", await page.evaluate(() => document.querySelectorAll("[data-topen]").length === 1));
  check("glossary tab shows the count", /Glossary\s*1/.test((await page.textContent(".studio-tabs")) || ""), (await page.textContent(".studio-tabs")).replace(/\s+/g, " "));

  // ---- mode "site" (the default): the deck's own term must NOT link ----
  //
  // THE PAIRING BELOW IS LOAD-BEARING: DO NOT DELETE A POSITIVE ASSERTION AND KEEP ITS
  // NEGATIVE NEIGHBOUR. Each isolation check is written `!(links || []).some(...)`, which
  // is VACUOUSLY TRUE when `links` is null -- and `studyLinks` returns null whenever the
  // page did not render, a selector broke or the function it reads was renamed. Read alone,
  // such an assertion PASSES on exactly the failure this file exists to catch.
  //
  // What makes it sound is that every negative runs against the same `links` value as a
  // POSITIVE assertion one line above it ("default mode links the site glossary"), which
  // fails loudly on null. The pair is the guard; neither half is one on its own. If you add
  // a new isolation check, give it a positive partner on the same value -- or assert
  // `links` is an array first.
  let links = await studyLinks(page, base);
  check("default mode links the site glossary", (links || []).some((k) => k === "Paleolithic"), JSON.stringify(links));
  check("default mode ignores the deck's own term", !(links || []).some((k) => /^u:/.test(k)), JSON.stringify(links));

  // ---- mode "own": only the deck's term links ----
  await openStudioDeck(page, base, "Glossary Deck");
  await setMode(page, "own");
  links = await studyLinks(page, base);
  check("own mode links the deck's term", (links || []).some((k) => /^u:[a-z0-9]+:Kestrelstone$/.test(k)), JSON.stringify(links));
  check("own mode drops the site glossary", !(links || []).some((k) => k === "Paleolithic"), JSON.stringify(links));

  // the popup for a deck term must render its own text, and offer no admin "edit" jump
  const popup = await page.evaluate(async () => {
    const t = document.querySelector('.abstract .ttip[data-k^="u:"]');
    if (!t) return null;
    t.click();
    await new Promise((r) => setTimeout(r, 500));
    const w = document.querySelector(".gloss-win");
    return w ? { title: (w.querySelector(".gloss-title") || {}).textContent, desc: (w.querySelector(".gloss-desc") || {}).textContent, edit: !!w.querySelector(".gloss-edit") } : null;
  });
  check("deck term opens a popup", !!popup && popup.title === "Kestrelstone", JSON.stringify(popup));
  check("popup shows the author's description", !!popup && /invented purely for this test/.test(popup.desc || ""));
  check("no admin edit button on a deck term", !!popup && popup.edit === false);

  // ---- mode "both": deck term AND site glossary ----
  await openStudioDeck(page, base, "Glossary Deck");
  await setMode(page, "both");
  links = await studyLinks(page, base);
  check("both mode links the deck's term", (links || []).some((k) => /^u:/.test(k)), JSON.stringify(links));
  check("both mode also links the site glossary", (links || []).some((k) => k === "Paleolithic"), JSON.stringify(links));

  // ---- ISOLATION: a curated card must never link the deck's term ----
  await page.goto(base + "#decks", { waitUntil: "load" });
  await page.waitForTimeout(900);
  const curated = await page.evaluate(async () => {
    const c = document.querySelector("#collection-list-all .collection .collection-row");
    if (!c) return null;
    c.click();
    await new Promise((r) => setTimeout(r, 900));
    const out = [];
    for (let i = 0; i < 4; i++) {
      const rb = document.querySelector("#reveal-btn");
      if (!rb) break;
      rb.click();
      await new Promise((r) => setTimeout(r, 350));
      const ab = document.querySelector(".abstract");
      if (ab) out.push(...[...ab.querySelectorAll(".ttip[data-k]")].map((s) => s.getAttribute("data-k")));
      const g = document.querySelector(".grade.good");
      if (!g) break;
      g.click();
      await new Promise((r) => setTimeout(r, 350));
    }
    return out;
  });
  check("curated cards never link a deck's term", Array.isArray(curated) && curated.length > 0 && !curated.some((k) => /^u:/.test(k)),
    "checked " + (curated || []).length + " links");

  // ---- ISOLATION: a second deck must not see the first deck's terms ----
  await openStudioList(page, base);
  await makeDeck(page, base, "Another Deck", CARD_TEXT);
  await setMode(page, "both");
  const links2 = await page.evaluate(async () => {
    // study the deck that is NOT the one with the glossary
    const rows = [...document.querySelectorAll(".collection.udeck [data-udeck]")];
    return rows.length;
  });
  await page.goto(base + "#decks", { waitUntil: "load" });
  await page.waitForTimeout(900);
  const second = await page.evaluate(async () => {
    const rows = [...document.querySelectorAll(".collection.udeck")];
    const target = rows.find((r) => /Another Deck/.test(r.textContent || ""));
    if (!target) return null;
    target.querySelector("[data-udeck]").click();
    await new Promise((r) => setTimeout(r, 800));
    const rb = document.querySelector("#reveal-btn");
    if (rb) rb.click();
    await new Promise((r) => setTimeout(r, 400));
    const ab = document.querySelector(".abstract");
    return ab ? [...ab.querySelectorAll(".ttip[data-k]")].map((s) => s.getAttribute("data-k")) : null;
  });
  check("a second deck sees the site glossary", (second || []).some((k) => k === "Paleolithic"), JSON.stringify(second));
  check("a second deck does NOT see the first deck's terms", !(second || []).some((k) => /^u:/.test(k)), JSON.stringify(second));

  // ---- the glossary survives export/import and stays sanitized ----
  await openStudioList(page, base);
  const exported = await page.evaluate(async () => {
    // reach into the same code path the Export button uses, without a download round-trip
    const rows = [...document.querySelectorAll(".studio-deck")];
    const t = rows.find((r) => /Glossary Deck/.test(r.textContent || ""));
    if (!t) return null;
    t.querySelector("[data-export]").click();
    return true;
  });
  check("export button present for a deck with a glossary", exported === true);

  // ---- a hostile glossary entry is neutralised on ingest ----
  const hostile = await page.evaluate(async () => {
    const payload = {
      folioDeck: 1,
      meta: { id: "hostil01", title: "Hostile Gloss", language: "en", tags: [] },
      cards: [{ id: "u_hostil01_1", question: "Q ___", answer: "A", abstract: "The Widgetstone is here.", answerDate: "", answerText: "A", num: "", category: "", traditional: "", hanzi: "", pinyin: "", translations: "", citation: "" }],
      gloss: {
        Widgetstone: { title: "Widgetstone", desc: '<img src=x onerror="window.__glosspwn=1">A <b>stone</b> <a href="javascript:window.__glosspwn=2">link</a>', date: "", tags: [], aliases: [] },
        "bad slug!!": { title: "Nope", desc: "should be dropped", tags: [], aliases: [] },
      },
    };
    const inp = document.createElement("input");
    inp.type = "file";
    const dt = new DataTransfer();
    dt.items.add(new File([JSON.stringify(payload)], "h.json", { type: "application/json" }));
    inp.files = dt.files;
    window.__hostileText = JSON.stringify(payload);
    return true;
  });
  const fixture = path.join(require("os").tmpdir(), "hostile-gloss.folio-deck.json");
  fs.writeFileSync(fixture, await page.evaluate(() => window.__hostileText));
  const chooser = page.waitForEvent("filechooser");
  await page.click("#stImport");
  (await chooser).setFiles(fixture);
  await page.waitForTimeout(900);
  const hostileState = await page.evaluate(async () => {
    const rows = [...document.querySelectorAll(".studio-deck-open")];
    const t = rows.find((r) => /Hostile Gloss/.test(r.textContent || ""));
    if (!t) return { found: false };
    t.click();
    await new Promise((r) => setTimeout(r, 500));
    document.querySelector('[data-tab="gloss"]').click();
    await new Promise((r) => setTimeout(r, 400));
    const host = document.querySelector(".studio-editor");
    const desc = host && host.querySelector('[data-gf="desc"]');
    return {
      found: true,
      pwned: typeof window.__glosspwn !== "undefined",
      terms: [...document.querySelectorAll("[data-topen]")].map((b) => b.dataset.topen),
      handlers: desc ? [...desc.querySelectorAll("*")].filter((el) => [...el.attributes].some((a) => /^on/i.test(a.name))).length : -1,
      jsHref: desc ? [...desc.querySelectorAll("a[href]")].filter((a) => /javascript:/i.test(a.getAttribute("href"))).length : -1,
      keptBold: desc ? desc.querySelectorAll("b").length : -1,
    };
  });
  check("hostile deck with a glossary imports", hostileState.found);
  check("hostile glossary executes nothing", !hostileState.pwned);
  check("invalid slug dropped", Array.isArray(hostileState.terms) && hostileState.terms.length === 1 && hostileState.terms[0] === "Widgetstone", JSON.stringify(hostileState.terms));
  check("no on* handlers in a term description", hostileState.handlers === 0, "handlers=" + hostileState.handlers);
  check("javascript: link stripped from a term", hostileState.jsHref === 0);
  check("legitimate formatting kept in a term", hostileState.keptBold === 1, "b=" + hostileState.keptBold);

  check("no console/page errors", errs.length === 0, [...new Set(errs)].join(" | "));

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
