// WRITING AND SHARING A DECK, AS SOMEONE WHO HAS NEVER SEEN FOLIO (Nov 2026, the authoring audit).
//
// The audit walked the Studio as a first-time author, on a phone, and found that nearly every fault in it
// failed SILENTLY: "Add a card" worked and scrolled the reader away from the card it had added; a field
// could not be opened by a tap and said nothing; a list imported as questions with no answers and said
// "Imported"; a blank card was dealt in a session and uploaded in a publish. None of those throws, and none
// is visible to a suite that drives the Studio by selector and reads the store — which is why they shipped.
// So this suite asserts what a READER would notice: where the page is after a press, where the caret is,
// what a sheet says it understood before it stores anything.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-deck-authoring.js
//   FOLIO_CHROMIUM=<path to chrome>   if Chromium lives outside the playwright package
//
// Nothing here reaches into app.js: every step is a press, a key or a file handed to the page's own picker.
// Re-run after touching studioRenderDeck, studioRenderCardEditor, studioAddCard, wireLiveCardEditor's
// `tapEdit` / `compact`, ankiTextToDeck, openPasteCards, uDeckImportFile, openShareSheet or deckDetailRender.
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
  if (ok) { pass++; console.log("ok    " + name + (extra !== undefined && extra !== "" ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra !== undefined && extra !== "" ? "  " + extra : "")); }
}
const SHEET_ARM = 650;   // a sheet ignores presses for its first half second (DECK_SHEET_ARM_MS)

(async () => {
  await new Promise((r) => server.listen(5641, r));
  const base = "http://127.0.0.1:5641/";
  const browser = await chromium.launch(LAUNCH);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "folio-auth-"));
  // A PHONE. The scroll fault was worst there (the editor opens a screen and a half below the list), and a
  // tap is the only way in to a field.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, acceptDownloads: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push("pageerror: " + String(e).slice(0, 240)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errs.push("console: " + m.text().slice(0, 240)); });
  // Supabase is not part of this suite: every request to it is refused, so the page is a signed-out reader's
  await page.route(/supabase\.co/, (r) => r.abort());

  const toast = () => page.evaluate(() => { const t = document.getElementById("toast"); return t && t.classList.contains("show") ? t.textContent : ""; });
  const active = () => page.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.dataset.field || a.dataset.ufield || a.tagName) : ""; });
  const inView = (sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight * 0.75; }, sel);
  const rows = () => page.evaluate(() => [...document.querySelectorAll("#stRows .studio-cardrow")].filter((r) => !r.hidden).map((r) => r.querySelector(".scr-title").textContent));
  const html = (f) => page.evaluate((f) => document.querySelector('.studio-editor [data-field="' + f + '"]').innerHTML, f);

  await page.goto(base + "#studio", { waitUntil: "load" });
  await page.waitForTimeout(900);

  // ---- 1. a new deck is named where its name is read ----
  check("the dead \"Browse shared decks\" button is gone", await page.evaluate(() => !document.querySelector("#udBrowse") && !!document.querySelector("#stPasteNew")));
  await page.click("#stNew");
  await page.waitForTimeout(450);
  check("a new deck opens with its name in focus", (await active()) === "stTitleH");
  await page.keyboard.type("French basics");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
  check("typing names the deck", (await page.textContent("#stTitleH")) === "French basics");
  check("…and the row above follows it", (await page.textContent(".studio-deck .collection-title")) === "French basics");
  check("the editor's head has one menu, not a second Export", await page.evaluate(() => !!document.querySelector("#stMore") && !document.querySelector("#stExport")));

  // ---- 2. an empty deck asks what kind of card, and the press leaves the reader AT the card ----
  check("an empty deck offers the kinds of card", await page.evaluate(() => document.querySelectorAll('#stEditor [data-addkind]').length >= 6));
  await page.click('#stEditor [data-addkind="basic"]');
  await page.waitForTimeout(450);
  check("adding a card does not throw the page to the top", await page.evaluate(() => scrollY > 100), "scrollY=" + await page.evaluate(() => scrollY));
  check("…the new card's editor is on screen", await inView("#stEditor"));
  check("…and the caret is in its question", (await active()) === "question" && await page.evaluate(() => document.activeElement.isContentEditable));

  // ---- 3. Enter walks the fields; the answer gets no stray line break ----
  await page.keyboard.type("What is the capital of France?");
  await page.keyboard.press("Enter");
  check("Enter moves from the question to the answer", (await active()) === "answer");
  await page.keyboard.type("Paris");
  await page.keyboard.press("Enter");
  check("Enter moves on to the notes", (await active()) === "abstract");
  check("the answer holds no line break", (await html("answer")) === "Paris", JSON.stringify(await html("answer")));
  check("the question was stored as typed", /capital of France/.test(await html("question")));
  check("the card's row is named by its answer", (await rows())[0] === "Paris");

  // ---- 4. the long form is folded, and nothing in it is lost ----
  check("the long form starts folded", await page.evaluate(() => {
    const vis = (s) => { const e = document.querySelector(".studio-editor " + s); return !!e && e.offsetParent !== null; };
    return !vis("#cesAnswerText") && !vis("#cesSrcAdd") && !vis("#cesQAdd") && !vis('[data-field="answerDate"]') && vis("#cesMore");
  }));
  await page.click("#cesMore");
  await page.waitForTimeout(120);
  check("\"More options\" shows it", await page.evaluate(() => {
    const vis = (s) => { const e = document.querySelector(".studio-editor " + s); return !!e && e.offsetParent !== null; };
    return vis("#cesAnswerText") && vis("#cesSrcAdd") && vis("#cesQAdd") && vis('[data-field="answerDate"]');
  }));
  await page.click("#cesMore");
  await page.waitForTimeout(120);

  // ---- 5. one tap opens a field (a phone has no double-click) ----
  await page.click("#stTitleH");   // somewhere else first, so the field is closed again
  await page.keyboard.press("Enter");
  await page.waitForTimeout(100);
  check("a field at rest is not editable", await page.evaluate(() => !document.querySelector('.studio-editor [data-field="abstract"]').isContentEditable));
  await page.tap('.studio-editor [data-field="abstract"]');
  await page.waitForTimeout(150);
  check("one tap makes it editable and focused", await page.evaluate(() => { const e = document.querySelector('.studio-editor [data-field="abstract"]'); return e.isContentEditable && document.activeElement === e; }));
  await page.keyboard.type("On the Seine.");
  check("the fields are tab stops", await page.evaluate(() => [...document.querySelectorAll(".studio-editor .ces-field")].every((e) => e.tabIndex === 0)));

  // ---- 6. the next card: same kind, never a second blank ----
  await page.click("#stAddNext");
  await page.waitForTimeout(350);
  check("\"Add another card\" adds one and takes the caret to it", (await rows()).length === 2 && (await active()) === "question");
  await page.click("#stAddCard");
  await page.waitForTimeout(300);
  check("a second press over a blank card does not stack another", (await rows()).length === 2, String((await rows()).length));

  // ---- 7. the Blank button writes the gap and the answer ----
  await page.keyboard.type("Rome is the capital of Italy.");
  await page.evaluate(() => {
    const q = document.querySelector('.studio-editor [data-field="question"]'), tn = q.firstChild;
    const rg = document.createRange(); rg.setStart(tn, 0); rg.setEnd(tn, 4);
    const sel = getSelection(); sel.removeAllRanges(); sel.addRange(rg);
  });
  await page.click("#rtBlank");
  await page.waitForTimeout(150);
  check("Blank replaces the selected words with the gap", /<span class="blank">_____<\/span> is the capital of Italy\./.test(await html("question")), await html("question"));
  check("…and they become the answer", (await html("answer")) === "Rome", await html("answer"));

  // ---- 8. a ready-made kind from the split button: made on the spot, and kept for the next card ----
  await page.click("#stAddKind");
  await page.waitForTimeout(SHEET_ARM);
  check("the kinds sheet lists the ready-made shapes", await page.evaluate(() => ["two-way", "cloze", "vocabulary", "picture", "definition", "event", "person", "formula", "choice"].every((k) => !!document.querySelector('.deck-menu [data-addkind="' + k + '"]'))));
  await page.click('.deck-menu [data-addkind="two-way"]');
  await page.waitForTimeout(500);
  check("choosing one makes the type and a card of it", (await page.inputValue("#cesCardType")) === "two-way" && (await active()) === "Front");
  await page.keyboard.type("bonjour\nsalut");
  await page.keyboard.press("Tab");
  await page.keyboard.type("hello");
  await page.waitForTimeout(150);
  check("a line break typed into a field is a line break on the card", await page.evaluate(() => {
    // the preview shows the card turned over, where the front is drawn once, inside the back: measure the drawn one
    const q = [...document.querySelectorAll("#stCardPv .uc-q")].find((e) => e.getBoundingClientRect().height > 0);
    return !!q && getComputedStyle(q).whiteSpace === "pre-line" && q.getBoundingClientRect().height > parseFloat(getComputedStyle(q).lineHeight) * 1.6;
  }));
  check("a typed card's boxes are prose boxes, not code boxes", await page.evaluate(() => !/mono/i.test(getComputedStyle(document.querySelector("[data-ufield]")).fontFamily)));
  await page.click("#stAddNext");
  await page.waitForTimeout(350);
  check("the next card starts as the same kind", (await page.inputValue("#cesCardType")) === "two-way");

  // ---- 9. delete is one press, with a way back ----
  await page.evaluate(() => document.querySelectorAll("[data-copen]")[0].click());
  await page.waitForTimeout(300);
  const before = (await rows()).length;
  await page.click("#stDelCard");
  await page.waitForTimeout(250);
  check("delete does not ask, and offers Undo", (await rows()).length === before - 1 && await page.evaluate(() => !document.querySelector(".inline-prompt") && !!document.querySelector("#toast .toast-btn")));
  await page.click("#toast .toast-btn");
  await page.waitForTimeout(300);
  check("Undo puts the card back where it was", (await rows())[0] === "Paris" && (await rows()).length === before, JSON.stringify(await rows()));

  // ---- 10. leaving sweeps the blank; a blank is never studied ----
  await page.click("#stAll");
  await page.waitForTimeout(400);
  check("leaving the editor removes the card nothing was written on", /1 empty card removed/.test(await toast()), await toast());
  check("…and the row counts only real cards", /4 cards/.test(await page.textContent(".studio-deck .collection-count")), await page.textContent(".studio-deck .collection-count"));

  // ---- 11. paste a list INTO the deck: the sheet says what it understood ----
  await page.click(".studio-deck [data-uedit]");
  await page.waitForTimeout(500);
  await page.click("#stPaste");
  await page.waitForTimeout(SHEET_ARM);
  const preview = () => page.evaluate(() => ({
    rows: [...document.querySelectorAll("#pcPreview tbody tr")].map((r) => [...r.children].map((c) => c.textContent)),
    text: document.querySelector("#pcPreview").textContent,
    sep: document.querySelector("#pcSep").options[0].textContent,
    header: document.querySelector("#pcHeader").checked,
    go: document.querySelector("#pcGo b").textContent, off: document.querySelector("#pcGo").disabled,
  }));
  check("an empty sheet offers nothing to add", (await preview()).off);
  await page.fill("#pcText", "chat - cat\nchien - dog\npain - bread");
  await page.waitForTimeout(150);
  let pv = await preview();
  check("a dash is found as the divider", /Dash/.test(pv.sep) && pv.rows[0][0] === "chat" && pv.rows[0][1] === "cat", JSON.stringify(pv.rows[0]) + " " + pv.sep);
  check("…and every line has a back", !/no back/.test(pv.text) && /Add 3 cards/.test(pv.go), pv.go);
  await page.fill("#pcText", "Term,Definition\nParis,The capital of France, on the Seine\nRome,The capital of Italy");
  await page.waitForTimeout(150);
  pv = await preview();
  check("a heading line is taken as one", pv.header && pv.rows.length === 2, JSON.stringify(pv.rows));
  check("a comma inside a definition is prose, not a third column", pv.rows[0][1] === "The capital of France, on the Seine", pv.rows[0][1]);
  await page.fill("#pcText", "only a question\nanother line with nothing after it");
  await page.waitForTimeout(150);
  pv = await preview();
  check("lines with no back are counted and said", /2 lines have no back/.test(pv.text), pv.text);
  await page.fill("#pcText", "The capital of {{c1::France}} is {{c2::Paris}}\t\nmerci\tthank you\nfromage\tcheese\nlait\tmilk\nvin\twine\neau\twater");
  await page.waitForTimeout(150);
  pv = await preview();
  check("a cloze line is recognised", /fill-in-the-blank/.test(pv.text) && /Add 7 cards/.test(pv.go), pv.go);
  await page.click("#pcGo");
  await page.waitForTimeout(600);
  // the list has a row per NOTE: Paris, Rome and the two-way bonjour (two cards, one row), then the six pasted
  check("the cards join the deck in one press", (await rows()).length === 9 && /6 cards added/.test(await toast()), (await rows()).length + " " + await toast());
  check("…the cloze line as a fill-in-the-blank card", await page.evaluate(() => [...document.querySelector("#cesCardType").options].some((o) => o.value === "cloze")) && (await page.inputValue("#cesCardType")) === "cloze");

  // ---- 12. the list can be searched, in place ----
  check("a long list gets a search box", await page.evaluate(() => !!document.querySelector("#stCardQ")));
  await page.fill("#stCardQ", "cheese");
  await page.waitForTimeout(120);
  // searched by the FRONT ("fromage"), and the one row left is named by its answer, as every built-in card's is
  await page.fill("#stCardQ", "fromage");
  await page.waitForTimeout(120);
  check("the search filters the rows without repainting", JSON.stringify(await rows()) === JSON.stringify(["cheese"]) && (await active()) === "stCardQ", JSON.stringify(await rows()));
  await page.fill("#stCardQ", "");

  // ---- 13. sharing while signed out is a question with a button ----
  await page.click("#stPublish");
  await page.waitForTimeout(300);
  check("sharing signed out asks, with a way to sign in", await page.evaluate(() => { const b = document.querySelector(".inline-prompt .ip-ok"); return !!b && /sign in/i.test(b.textContent) && /account/i.test(document.querySelector(".inline-prompt .ip-msg").textContent); }));
  await page.click(".inline-prompt .ip-cancel");
  check("the share bar speaks one vocabulary", /Not shared/.test(await page.textContent(".sp-state")) && /Share/.test(await page.textContent("#stPublish")));

  // ---- 14. another deck opens on its cards, whatever tab this one was left on ----
  await page.click('.studio-tab[data-tab="gloss"]');
  await page.waitForTimeout(250);
  await page.click("#stAll");
  await page.waitForTimeout(300);
  await page.click("#stPasteNew");
  await page.waitForTimeout(SHEET_ARM);
  await page.fill("#pcText", "uno | one\ndos | two\ntres | three");
  await page.selectOption("#pcKind", "two-way");
  await page.fill("#pcTitle", "Spanish numbers");
  await page.waitForTimeout(150);
  pv = await preview();
  check("a bar is found as the divider, and two-way doubles the count", /Bar/.test(pv.sep) && /deck of 6 cards/.test(pv.go), pv.sep + " / " + pv.go);
  await page.click("#pcGo");
  await page.waitForTimeout(900);
  check("pasted cards become a deck, open for editing", (await page.textContent("#stTitleH")) === "Spanish numbers" && (await rows()).length === 3);
  check("…on its Cards tab, not the tab the last deck was left on", await page.evaluate(() => document.querySelector(".studio-tab.active").dataset.tab === "cards"));
  check("…and the toast offers the next step", /Imported/.test(await toast()) && await page.evaluate(() => /daily study/i.test((document.querySelector("#toast .toast-btn") || {}).textContent || "")), await toast());

  // ---- 15. files are read by what is IN them ----
  const pick = async (name, body) => {
    const f = path.join(tmp, name);
    fs.writeFileSync(f, body);
    const [fc] = await Promise.all([page.waitForEvent("filechooser"), page.click("#stImport")]);
    await fc.setFiles(f);
    await page.waitForTimeout(900);
  };
  await page.click("#stAll");
  await page.waitForTimeout(300);
  await pick("deck.apkg", "PK\u0003\u0004 not a real package");
  check("an Anki package is answered with what to export instead", /Anki package/.test(await toast()) && /Plain Text/.test(await toast()), await toast());
  await pick("list-without-extension", "bonjour\thello\nmerci\tthank you\n");
  check("a list with no extension is shown, not refused as bad JSON", await page.evaluate(() => !!document.querySelector(".deck-menu #pcText") && /bonjour/.test(document.querySelector("#pcText").value)));
  check("…with its two cards previewed", (await preview()).rows.length === 2);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(350);
  await pick("anki.txt", "#separator:tab\n#html:false\n#notetype column:1\nBasic (and reversed card)\tpomme\tapple\nCloze\tThe {{c1::Seine}} runs through Paris\t\n");
  check("an Anki export keeps its note types", await page.evaluate(() => /fill-in-the-blank/.test(document.querySelector("#pcPreview").textContent) && /3 cards/.test(document.querySelector("#pcGo b").textContent)), await page.evaluate(() => document.querySelector("#pcGo b").textContent));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(350);

  // ---- 16. an author can get from a card they are studying to its editor ----
  await page.click(".studio-deck [data-udeck]");
  await page.waitForTimeout(1500);
  check("studying your own deck offers Edit", await page.evaluate(() => { const b = document.querySelector("#admin-edit-fab"); return !!b && /edit/i.test(b.textContent); }));
  await page.click("#admin-edit-fab");
  await page.waitForTimeout(1300);
  check("…which opens that card in the Studio", await page.evaluate(() => !!document.querySelector("#stInline .studio-cardrow.active") && !!document.querySelector("#stEditor .admin-ed-title")));

  // ---- 17. the layout holds on a phone ----
  check("the editor does not run wider than the phone", await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), await page.evaluate(() => document.documentElement.scrollWidth + " > " + innerWidth));

  check("no console/page errors", errs.length === 0, [...new Set(errs)].join(" | "));
  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
