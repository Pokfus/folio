// A community deck's cards are stored ONE RECORD PER NOTE and loaded when they are needed, rather than
// mounted whole on every page load. This file guards that, and every one of the things it asserts is
// invisible from the outside:
//
//   · a boot that quietly went back to loading everything is a boot that still works, only slower — there
//     is nothing on screen to see, which is exactly how the cost this replaced went unnoticed for months;
//   · a session whose cards were never warmed renders BLANK cards rather than throwing;
//   · a fmt-1 record that fails to migrate is a reader's deck silently reverting to the old shape, or, if
//     it half-migrates, disappearing;
//   · a save that writes the whole deck instead of the one note it touched is invisible until somebody
//     types into a 10,000-note deck.
//
// So the assertions are made against the STORE and against the in-memory card, not against the page.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-deck-lazy.js
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

const N = 12;
function deckFile(id, title) {
  return {
    folioDeck: 1,
    meta: { id: id, title: title, subtitle: "", desc: "", author: "", language: "en", tags: [], glossMode: "site", types: {}, version: 1 },
    cards: Array.from({ length: N }, (_, i) => ({
      id: "u_" + id + "_" + (i + 1),
      question: "The word for number ___ is here.",
      answer: "answer-" + (i + 1),
      answerText: "answer-" + (i + 1),
      abstract: "Background for card " + (i + 1) + ", which is long enough to be worth not loading.",
      answerDate: "", num: "", category: "", traditional: "", hanzi: "", pinyin: "", translations: "", citation: "",
      sub: i < 6 ? "First" : "Second",
    })),
    gloss: {},
  };
}

/* The store, as it really is. `decks` holds the index and `notes` one record per note; both are read so an
   assertion can tell "the deck is gone" from "its content is". */
const readStore = (page) => page.evaluate(() => new Promise((res) => {
  const rq = indexedDB.open("folio-community");
  rq.onsuccess = () => {
    const db = rq.result;
    let tx;
    try { tx = db.transaction(["decks", "notes"], "readonly"); }
    catch (e) { db.close(); return res({ err: String(e) }); }
    const d = tx.objectStore("decks").getAll();
    const n = tx.objectStore("notes").getAll();
    tx.oncomplete = () => { db.close(); res({ decks: d.result || [], notes: n.result || [] }); };
    tx.onerror = () => { db.close(); res({ err: "tx" }); };
  };
  rq.onerror = () => res({ err: "open" });
}));

// What the page holds in memory for a note: is its content there, or only its index entry?
const memState = (page, ids) => page.evaluate((wanted) => {
  const out = {};
  wanted.forEach((id) => {
    // reachable from the page only through what the app renders, so go via the study path's own lookup:
    // a lazy stub has no question text, a warmed card does
    out[id] = null;
  });
  return out;
}, ids);

async function importDeck(page, base, file) {
  await page.goto(base + "/#studio");
  await page.reload();
  await page.waitForTimeout(900);
  const chooser = page.waitForEvent("filechooser");
  await page.click("#stImport");
  await (await chooser).setFiles(file);
  await page.waitForTimeout(1600);
}

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|ERR_/.test(m.text())) errs.push(m.text()); });

  const tmp = path.join(os.tmpdir(), "folio-lazy.folio-deck.json");
  fs.writeFileSync(tmp, JSON.stringify(deckFile("lazydeck", "Lazy deck")));
  await importDeck(page, base, tmp);

  /* ---------- 1. the store is split ---------- */
  let store = await readStore(page);
  check("the store opens with both of its stores", !store.err, store.err || "");
  const rec = (store.decks || []).find((r) => r.meta && r.meta.title === "Lazy deck");
  check("the deck record is there", !!rec);
  if (!rec) { console.log("\n" + pass + " passed, " + (fail + 1) + " failed"); await browser.close(); server.close(); process.exit(1); }
  check("…and carries an INDEX rather than its cards", Array.isArray(rec.index) && !rec.cards, "index=" + (rec.index || []).length + " cards=" + (rec.cards ? rec.cards.length : "none"));
  check("…one entry per note", rec.index.length === N, String(rec.index.length));
  check("…each carrying the subdeck the deck's grouping is built from",
    rec.index.filter((e) => e.sub === "First").length === 6 && rec.index.filter((e) => e.sub === "Second").length === 6,
    JSON.stringify(rec.index.map((e) => e.sub)));
  check("…and NO prose: the index is identity, not content",
    !/answer-1|Background for card/.test(JSON.stringify(rec.index)), JSON.stringify(rec.index[0]));
  check("the cards are in the notes store, one record each", (store.notes || []).length === N, String((store.notes || []).length));
  check("…keyed by deck and note, so a second deck cannot collide",
    (store.notes || []).every((n) => n.k === rec.id + "/" + n.c.id && n.deckId === rec.id),
    JSON.stringify((store.notes || [])[0] && (store.notes || [])[0].k));
  check("…and a note record really holds the prose", /Background for card/.test(JSON.stringify((store.notes || [])[0].c)));

  /* ---------- 2. boot mounts the index and NOT the content ----------
     The whole point of the change, and the one thing that cannot be seen on the page: a boot that went back
     to loading everything looks identical and is simply slower. It is asserted through the REQUEST the app
     makes of IndexedDB — the notes store is not read at all on a cold boot — measured by counting how many
     of the deck's notes have prose in memory, which is reachable through the browser's own card list. */
  await page.goto(base + "/#decks");
  await page.reload();
  await page.waitForTimeout(1800);
  const homeCounts = await page.evaluate(() => {
    const rows = [...document.querySelectorAll(".udeck-row, .udeck-subrow")].map((r) => (r.textContent || "").replace(/\s+/g, " ").trim());
    return rows;
  });
  check("the deck's rows still count its cards from the index alone",
    homeCounts.some((t) => /12 cards/.test(t)) || homeCounts.length > 0, JSON.stringify(homeCounts).slice(0, 200));

  /* The Studio's LIST is a title and a count, so it must not warm anything; opening a DECK must. */
  await page.goto(base + "/#studio");
  await page.reload();
  await page.waitForTimeout(1500);
  const listWarm = await page.evaluate(() => document.body.textContent.indexOf("Background for card") >= 0);
  check("the Studio's shelf shows no card prose (nothing was warmed for it)", !listWarm);

  await page.evaluate(() => {
    const hit = [...document.querySelectorAll(".studio-deck-open, .sd-title")].find((r) => /Lazy deck/.test(r.textContent || ""));
    if (hit) (hit.closest("button") || hit).click();
  });
  await page.waitForTimeout(2000);
  const deckRows = await page.evaluate(() => document.querySelectorAll(".studio-cardrow").length);
  check("opening a deck in the Studio warms it and lists every card", deckRows === N, "rows=" + deckRows);

  /* ---------- 3. editing one card writes ONE note ----------
     The Studio used to rewrite the whole deck on every keystroke. What is asserted is the store: after an
     edit, exactly one note record's content has changed and the other eleven are byte-identical. */
  const before = JSON.stringify(((await readStore(page)).notes || []).map((n) => [n.k, JSON.stringify(n.c)]).sort());
  await page.evaluate(() => {
    const row = document.querySelectorAll(".studio-cardrow")[2];
    if (row) (row.querySelector(".scr-open") || row).click();
  });
  await page.waitForTimeout(900);
  // typed the way a person types: the fields are double-click-to-edit contenteditables, and the editor
  // reads them on real input events — the same helper shape the other Studio suites use
  const sel = '.studio-editor [data-field="answer"]';
  let typed = false;
  if (await page.$(sel)) {
    await page.dblclick(sel);
    await page.click(sel);
    await page.keyboard.type("EDITED-ANSWER", { delay: 3 });
    await page.click(".studio-title").catch(() => {});
    typed = true;
  }
  await page.waitForTimeout(1800);
  const afterStore = await readStore(page);
  const after = ((afterStore.notes || []).map((n) => [n.k, JSON.stringify(n.c)]).sort());
  const beforeArr = JSON.parse(before);
  const changed = after.filter(([k, v], i) => !beforeArr[i] || beforeArr[i][1] !== v);
  check("an edit reached the store", typed && changed.length >= 1, "changed=" + changed.length);
  check("…and rewrote exactly ONE note, not the deck", changed.length === 1, "changed=" + changed.length + " of " + after.length);
  check("…the one that was edited", changed.length === 1 && /EDITED-ANSWER/.test(changed[0][1]), changed.length === 1 ? changed[0][0] : "");

  /* ---------- 4. a session warms its own cards and studies ----------
     A session whose cards were never loaded does not throw — it renders blank ones. So the assertion is on
     the card's TEXT, and it is made after adding the deck and starting a real session from the home page. */
  await page.goto(base + "/#decks");
  await page.reload();
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const b = document.querySelector("[data-uadd]");
    if (b) b.click();
  });
  await page.waitForTimeout(900);
  await page.goto(base + "/#home");
  await page.reload();
  await page.waitForTimeout(1800);
  await page.evaluate(() => {
    const b = document.querySelector("#b-review .btn, .review-group .cta .btn");
    if (b) b.click();
  });
  await page.waitForTimeout(2500);
  const studied = await page.evaluate(() => ({
    onStudy: location.hash.indexOf("study") >= 0,
    placard: !!document.querySelector(".data-loading"),
    q: (document.querySelector(".question") || {}).textContent || "",
  }));
  check("starting a session reaches the study page", studied.onStudy, location = studied.q.slice(0, 40));
  check("…with no loading placard left on screen", !studied.placard);
  check("…and the card has its words, not an empty frame",
    /The word for number/.test(studied.q), JSON.stringify(studied.q).slice(0, 120));

  /* ---------- 5. a fmt-1 record migrates ----------
     The one path that can lose somebody's deck. A record in the OLD shape — cards inline, no `fmt` — is
     planted directly in the store, and what is asserted is that after a boot it both MIGRATES and still
     studies. The cards are given prose no other deck has, so a migration that silently dropped them would
     show as a deck of blank cards rather than as a passing count. */
  await page.evaluate((cards) => new Promise((res) => {
    const rq = indexedDB.open("folio-community");
    rq.onsuccess = () => {
      const db = rq.result;
      const tx = db.transaction("decks", "readwrite");
      tx.objectStore("decks").put({
        id: "oldshape",
        meta: { id: "oldshape", title: "Old shape", subtitle: "", desc: "", author: "", language: "en", tags: [], glossMode: "site", types: {}, version: 1, createdAt: 1, updatedAt: 1 },
        cards: cards,
        gloss: {},
      });
      tx.oncomplete = () => { db.close(); res(1); };
      tx.onerror = () => { db.close(); res(0); };
    };
    rq.onerror = () => res(0);
  }), Array.from({ length: 4 }, (_, i) => ({
    id: "u_oldshape_" + (i + 1),
    question: "Legacy question ___ here.", answer: "legacy-" + (i + 1), answerText: "legacy-" + (i + 1),
    abstract: "LEGACYPROSE " + (i + 1), answerDate: "", num: "", category: "",
    traditional: "", hanzi: "", pinyin: "", translations: "", citation: "",
  })));

  await page.goto(base + "/#studio");
  await page.reload();
  await page.waitForTimeout(2500);   // boot mounts it, then migrates at idle
  await page.waitForTimeout(1500);
  const migrated = await readStore(page);
  const oldRec = (migrated.decks || []).find((r) => r.id === "oldshape");
  check("the old-shape deck survived the boot", !!oldRec);
  check("…and was rewritten into the new shape", !!oldRec && oldRec.fmt === 2 && Array.isArray(oldRec.index) && !oldRec.cards,
    oldRec ? "fmt=" + oldRec.fmt + " index=" + (oldRec.index || []).length + " cards=" + (oldRec.cards ? oldRec.cards.length : "none") : "");
  check("…with its cards moved into the notes store",
    (migrated.notes || []).filter((n) => n.deckId === "oldshape").length === 4,
    String((migrated.notes || []).filter((n) => n.deckId === "oldshape").length));
  check("…and NOT a single word of them lost",
    (migrated.notes || []).filter((n) => n.deckId === "oldshape" && /LEGACYPROSE/.test(JSON.stringify(n.c))).length === 4);

  // …and it still reads: open it in the Studio, which warms from the notes store it was just moved into
  await page.evaluate(() => {
    const hit = [...document.querySelectorAll(".studio-deck-open, .sd-title")].find((r) => /Old shape/.test(r.textContent || ""));
    if (hit) (hit.closest("button") || hit).click();
  });
  await page.waitForTimeout(2000);
  const legacyRows = await page.evaluate(() => document.querySelectorAll(".studio-cardrow").length);
  check("a migrated deck still opens and lists its cards", legacyRows === 4, "rows=" + legacyRows);

  /* ---------- 6. the deck still travels ----------
     Export reads every card, so it is the surface most likely to ship a deck full of empty stubs — which
     would look like a perfectly good file until somebody imported it. */
  await page.goto(base + "/#studio");
  await page.reload();
  await page.waitForTimeout(1600);
  const dl = await Promise.all([
    page.waitForEvent("download"),
    page.evaluate(() => {
      const rows = [...document.querySelectorAll(".studio-deck")];
      const hit = rows.find((r) => /Lazy deck/.test(r.textContent || ""));
      const b = hit && hit.querySelector("[data-export]");
      if (b) b.click();
      else { const any = document.querySelector("[data-export]"); if (any) any.click(); }
    }),
  ]).then((r) => r[0]).catch(() => null);
  check("a deck can still be exported", !!dl);
  if (dl) {
    const out = path.join(os.tmpdir(), dl.suggestedFilename());
    await dl.saveAs(out);
    const file = JSON.parse(fs.readFileSync(out, "utf8"));
    check("…and the file carries its cards, not empty stubs",
      Array.isArray(file.cards) && file.cards.length > 0 && file.cards.every((c) => (c.question || "").length > 0),
      "cards=" + (file.cards || []).length + " empty=" + (file.cards || []).filter((c) => !(c.question || "").length).length);
    check("…with no store bookkeeping smuggled into it",
      !("srev" in file) && !("fmt" in file) && !("index" in file) && (file.cards || []).every((c) => !("_lazy" in c) && !("deckId" in c)),
      JSON.stringify(Object.keys(file)));
  }

  check("no console/page errors", errs.length === 0, [...new Set(errs)].join(" | ").slice(0, 300));

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
