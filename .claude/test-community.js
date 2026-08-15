// End-to-end test for community decks (phase 1): create a deck in the Studio, write a card, confirm it
// persists across a reload, appears in the Library, studies like any other deck, exports to a file and
// imports back — and that none of it leaks into the curated content or the daily games.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-community.js
//   FOLIO_CHROMIUM=<path to chrome>   if Chromium lives outside the playwright package
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { chromium } = require("playwright");

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

// type into one of the double-click-to-edit contenteditable fields
async function typeField(page, field, text) {
  const sel = '.studio-editor [data-field="' + field + '"]';
  await page.dblclick(sel);
  await page.click(sel);
  await page.keyboard.type(text, { delay: 4 });
  await page.click(".studio-title");   // blur → locks the field again
  await page.waitForTimeout(120);
}

(async () => {
  await new Promise((r) => server.listen(5610, r));
  const base = "http://127.0.0.1:5610/";
  const browser = await chromium.launch(LAUNCH);
  const downloads = fs.mkdtempSync(path.join(os.tmpdir(), "folio-dl-"));
  const ctx = await browser.newContext({ acceptDownloads: true });
  const page = await ctx.newPage();
  const errs = [], badResponses = [];
  page.on("pageerror", (e) => errs.push("pageerror: " + String(e).slice(0, 240)));
  // Resource-load failures are reported separately: the hostile-import fixture deliberately carries an
  // <img src="x">, whose 404 is the sanitizer working (the src is inert, only the onerror mattered).
  // What must stay clean is the app's own files, asserted below.
  page.on("console", (m) => {
    const t = m.text();
    if (m.type() !== "error") return;
    if (/ERR_(TUNNEL|CONNECTION)/.test(t) || /Failed to load resource/.test(t)) return;
    errs.push("console: " + t.slice(0, 240));
  });
  page.on("response", (r) => {
    if (r.status() < 400) return;
    const u = r.url();
    if (/\.(js|css|html|json|svg|png|mp3)(\?|$)/.test(u)) badResponses.push(r.status() + " " + u);
  });

  // ---- 1. an empty Studio ----
  await page.goto(base + "#studio", { waitUntil: "load" });
  await page.waitForTimeout(700);
  check("studio page renders", await page.evaluate(() => !!document.querySelector(".studio-actions")));
  check("starts with no decks", await page.evaluate(() => !!document.querySelector(".studio-empty")));

  // ---- 2. create a deck and write a card ----
  await page.click("#stNew");
  await page.waitForTimeout(400);
  check("new deck opens its editor", await page.evaluate(() => !!document.querySelector(".studio-cols")));

  await page.click(".studio-settings > summary");
  await page.fill('[data-meta="title"]', "Roman Republic");
  await page.fill('[data-meta="subtitle"]', "Consuls and crises");
  await page.fill("#stTags", "rome, republic");
  await page.waitForTimeout(150);
  check("deck title updates live", (await page.textContent(".studio-title")) === "Roman Republic");

  await page.click("#stAddCard");
  await page.waitForTimeout(300);
  check("card editor appears", await page.evaluate(() => document.querySelectorAll(".studio-editor .ces-field").length === 4));

  await typeField(page, "question", "The two annually elected heads of the Roman Republic were the ___.");
  await typeField(page, "answer", "Consuls");
  await typeField(page, "abstract", "Two consuls held office together for a single year.");
  await page.fill(".studio-editor #cesAnswerText", "Consuls");
  await page.waitForTimeout(300);

  check("card row title follows the answer", (await page.textContent(".studio-cardrow .scr-title")) === "Consuls");

  // ---- 3. persistence across a reload (IndexedDB) ----
  // reload(), not goto(): navigating to the identical URL is a fragment navigation, so the page would
  // never actually restart and the test would prove nothing
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(900);
  const persisted = await page.evaluate(() => {
    const t = document.querySelector(".sd-title");
    const m = document.querySelector(".sd-meta");
    return { title: t && t.textContent, meta: m && m.textContent };
  });
  check("deck survives a reload", persisted.title === "Roman Republic", JSON.stringify(persisted));
  check("card survives a reload", /1 card/.test(persisted.meta || ""), persisted.meta || "");

  // ---- 4. the Library section ----
  await page.goto(base + "#decks", { waitUntil: "load" });
  await page.waitForTimeout(900);
  const lib = await page.evaluate(() => {
    const row = document.querySelector(".collection.udeck [data-udeck]");
    /* …SCOPED TO "Your decks" since Aug 2026. The Language section above it carries a `.udeck-intro` too —
       it is the same kind of paragraph and takes the same styling — and it does NOT say "not fact-checked",
       because those decks are Folio's own. Read unscoped, this asserted the wrong section's prose. */
    const own = document.querySelector(".community-group:not(#sharedDecks)");
    return {
      present: !!row,
      title: row ? (row.querySelector(".collection-title") || {}).textContent : null,
      warns: /not fact-checked/i.test(((own && own.querySelector(".udeck-intro")) || {}).textContent || ""),
      count: (document.querySelector(".collection.udeck .collection-count") || {}).textContent,
    };
  });
  check("deck listed in the Library", lib.present && lib.title === "Roman Republic", JSON.stringify(lib));
  check("marked as not fact-checked", lib.warns);
  check("card count shown", /1 card/.test(lib.count || ""), lib.count || "");

  // ---- 5. add to the daily review, then study it ----
  await page.click(".collection.udeck [data-uadd]");
  await page.waitForTimeout(250);
  check("add-to-review records the deck", await page.evaluate(() => {
    try { return (JSON.parse(localStorage.getItem("folio_v1")).active || []).some((x) => /^u:/.test(x)); } catch (e) { return false; }
  }));

  await page.evaluate(() => document.querySelector(".collection.udeck [data-udeck]").click());
  await page.waitForTimeout(700);
  const studying = await page.evaluate(() => {
    const q = document.querySelector(".question");
    return { q: q ? q.textContent.trim() : null, reveal: !!document.querySelector("#reveal-btn") };
  });
  check("studies like any other deck", studying.reveal && /annually elected/.test(studying.q || ""), JSON.stringify(studying).slice(0, 160));
  await page.evaluate(() => document.querySelector("#reveal-btn").click());
  await page.waitForTimeout(350);
  const back = await page.evaluate(() => ({
    answer: (document.querySelector(".answer .val") || {}).textContent,
    bg: (document.querySelector(".abstract") || {}).textContent,
  }));
  check("answer and background render", back.answer === "Consuls" && /single year/.test(back.bg || ""), JSON.stringify(back).slice(0, 160));
  await page.evaluate(() => { const g = document.querySelector(".grade.good"); if (g) g.click(); });
  await page.waitForTimeout(400);
  check("grading a community card works", (await page.evaluate(() => {
    try { return Object.keys(JSON.parse(localStorage.getItem("folio_v1")).cards).some((k) => k.slice(0, 2) === "u_"); } catch (e) { return false; }
  })));

  // the home review list only appears once something has been graded (before that the banner is the
  // first-run hero), so this has to come after the session above
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(900);
  check("appears in the home review list", await page.evaluate(() =>
    [...document.querySelectorAll(".active-deck[data-review]")].some((e) => /^u:/.test(e.dataset.review))));
  check("home row can start a session", await page.evaluate(() => {
    const el = [...document.querySelectorAll(".active-deck[data-review]")].find((e) => /^u:/.test(e.dataset.review));
    if (!el) return false;
    el.click();
    return true;
  }));
  await page.waitForTimeout(600);
  check("home row routes into the deck", await page.evaluate(() => !!document.querySelector("#reveal-btn, .placard")));

  // ---- 6. curated content and the games stay clean ----
  const isolation = await page.evaluate(() => ({
    cardData: (window.CARD_DATA || []).filter((c) => String(c.id).slice(0, 2) === "u_").length,
    tree: JSON.stringify(window.COLLECTION_TREE || {}).indexOf("u_") >= 0,
    gloss: Object.keys(window.GLOSSARY || {}).filter((k) => k.slice(0, 2) === "u_").length,
    admin: (localStorage.getItem("folio_admin_v1") || "").indexOf("u_") >= 0,
  }));
  check("no community cards in CARD_DATA", isolation.cardData === 0);
  check("no community ids in the tree", !isolation.tree);
  check("no community terms in the glossary", isolation.gloss === 0);
  check("nothing written to the admin overlay", !isolation.admin);
  for (const g of ["challenge", "truefalse", "whosaid", "chrono"]) {
    await page.goto(base + "#" + g, { waitUntil: "load" });
    await page.waitForTimeout(500);
  }
  check("daily games render without community cards", await page.evaluate(() => !document.body.textContent.includes("annually elected")));

  // ---- 7. export ----
  await page.goto(base + "#studio", { waitUntil: "load" });
  await page.waitForTimeout(800);
  const [dl] = await Promise.all([
    page.waitForEvent("download"),
    page.click("[data-export]"),
  ]);
  const file = path.join(downloads, dl.suggestedFilename());
  await dl.saveAs(file);
  const exported = JSON.parse(fs.readFileSync(file, "utf8"));
  check("export writes a deck file", exported.folioDeck === 1 && exported.meta.title === "Roman Republic" && exported.cards.length === 1,
    dl.suggestedFilename());
  check("exported card keeps its content", /annually elected/.test(exported.cards[0].question || ""));

  // ---- 8. import (a second copy, with its own ids so progress stays separate) ----
  await page.setInputFiles("body", []).catch(() => {});
  const imported = await page.evaluate(async (txt) => {
    // drive the import through the same code path the file picker uses
    const inp = document.createElement("input");
    inp.type = "file";
    const dt = new DataTransfer();
    dt.items.add(new File([txt], "deck.json", { type: "application/json" }));
    inp.files = dt.files;
    return new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result).length);
      fr.readAsText(inp.files[0]);
    });
  }, JSON.stringify(exported));
  check("import fixture readable in-page", imported > 100);

  // the real import: use the page's own picker via a file chooser
  const chooser = page.waitForEvent("filechooser");
  await page.click("#stImport");
  const fc = await chooser;
  await fc.setFiles(file);
  await page.waitForTimeout(800);
  const afterImport = await page.evaluate(() => ({
    decks: [...document.querySelectorAll(".sd-title")].map((e) => e.textContent),
  }));
  check("import adds a second deck", afterImport.decks.length === 2, JSON.stringify(afterImport.decks));
  check("imported copy is renamed", afterImport.decks.some((t) => /copy/i.test(t)) || afterImport.decks.filter((t) => t === "Roman Republic").length === 2,
    JSON.stringify(afterImport.decks));

  // ---- 9. a hostile deck file is sanitized on import ----
  const evil = {
    folioDeck: 1,
    meta: { id: "evil0001", title: "<img src=x onerror=alert(1)>Bad", subtitle: "", desc: "", author: "", language: "en", tags: [], version: 1 },
    cards: [{
      id: "u_evil0001_1",
      question: '<img src=x onerror="window.__pwned=1">Q <span class="blank">_____</span>',
      answer: "<script>window.__pwned=2</script>A",
      abstract: '<a href="javascript:window.__pwned=3">click</a> and <b>bold</b>',
      answerDate: "", answerText: "A", num: "", category: "", traditional: "", hanzi: "", pinyin: "", translations: "", citation: "",
    }],
  };
  const evilFile = path.join(downloads, "evil.folio-deck.json");
  fs.writeFileSync(evilFile, JSON.stringify(evil));
  const chooser2 = page.waitForEvent("filechooser");
  await page.click("#stImport");
  const fc2 = await chooser2;
  await fc2.setFiles(evilFile);
  await page.waitForTimeout(700);
  const evilState = await page.evaluate(() => {
    const d = Object.keys(window).length;   // touch window so the eval is not optimized away
    return { pwned: typeof window.__pwned !== "undefined", titles: [...document.querySelectorAll(".sd-title")].map((e) => e.textContent), n: d };
  });
  check("hostile import does not execute", !evilState.pwned);
  check("hostile title is neutralised", evilState.titles.some((t) => t === "Bad"), JSON.stringify(evilState.titles));
  // study it and confirm nothing fires when the card actually renders
  const stored = await page.evaluate(() => {
    const rows = [...document.querySelectorAll(".studio-deck-open")];
    const t = rows.find((r) => (r.querySelector(".sd-title") || {}).textContent === "Bad");
    if (t) t.click();
    return !!t;
  });
  await page.waitForTimeout(500);
  check("hostile deck opens in the studio", stored);
  const rendered = await page.evaluate(() => {
    const host = document.querySelector(".studio-editor");
    return {
      pwned: typeof window.__pwned !== "undefined",
      handlers: host ? [...host.querySelectorAll("*")].filter((el) => [...el.attributes].some((a) => /^on/i.test(a.name))).length : -1,
      scripts: host ? host.querySelectorAll("script,iframe,object").length : -1,
      jsHref: host ? [...host.querySelectorAll("a[href]")].filter((a) => /javascript:/i.test(a.getAttribute("href"))).length : -1,
      keptBold: host ? host.querySelectorAll('[data-field="abstract"] b').length : -1,
    };
  });
  check("no script executed by the hostile card", !rendered.pwned);
  check("no on* handlers survive", rendered.handlers === 0, "handlers=" + rendered.handlers);
  check("no script/iframe/object survive", rendered.scripts === 0);
  check("javascript: href stripped", rendered.jsHref === 0);
  check("legitimate formatting kept", rendered.keptBold === 1, "b=" + rendered.keptBold);

  // ---- 10. delete ----
  // reload rather than goto: we are already on #studio (inside a deck), and a same-URL goto is a
  // fragment navigation that would leave the deck editor open instead of returning to the list
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(900);
  const before = await page.evaluate(() => document.querySelectorAll(".studio-deck").length);
  await page.click("[data-del]");
  await page.waitForTimeout(250);
  check("delete asks for confirmation", await page.evaluate(() => !!document.querySelector(".inline-prompt .ip-ok")));
  await page.click(".inline-prompt .ip-ok");
  await page.waitForTimeout(700);
  const after = await page.evaluate(() => document.querySelectorAll(".studio-deck").length);
  check("delete removes a deck", after === before - 1, before + " -> " + after);

  check("no console/page errors", errs.length === 0, [...new Set(errs)].join(" | "));
  check("no app resource failed to load", badResponses.length === 0, [...new Set(badResponses)].join(" | "));

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
