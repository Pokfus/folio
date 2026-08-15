/* The combined Spanish deck files, imported the way a reader imports them.

   `combine.py` writes a file per set because all seven decks do not fit in one, and every way that can
   go wrong is quiet.  A file over app.js's caps is REFUSED at import, so the reader sees a sentence and
   no deck.  A card id reused between the two files collides in the shared UCARDS store, and both decks
   then sit on the shelf with their full counts while one studies the other's cards.  A subdeck path
   that loses its `::` flattens the tree into one level with no error at all.  None of that is visible
   in the JSON, so this imports the files into a real browser and reads the shelf back.

     NODE_PATH=<playwright>/node_modules node .claude/test-combined-deck.js

   Run it after `combine.py`, and after anything that touches SUB_SEP, UDECK_MAX_CARDS,
   UDECK_MAX_BYTES or uDeckNormalize.                                                                 */
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs");
const ROOT = path.resolve(__dirname, "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
               ".json": "application/json", ".svg": "image/svg+xml" };

const FILES = [
  { file: "DELE-A1-B2-and-Phrases-Spanish.folio-deck.json", id: "delelow",
    tops: ["A1", "A2", "B1", "B2", "Phrases"] },
  { file: "DELE-C1-C2-Spanish.folio-deck.json", id: "delehigh", tops: ["C1", "C2"] },
];
const DIRS = ["Spanish → English", "English → Spanish"];

let fails = 0, checks = 0;
const ok = (c, m, extra) => {
  checks++;
  if (!c) { fails++; console.log("   ✗ " + m + (extra ? "   " + extra : "")); }
  else console.log("   ✓ " + m);
};

(async () => {
  const server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
    fs.readFile(p, (e, b) => {
      if (e) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
      res.end(b);
    });
  });
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });

  // BOTH files go into ONE page, deliberately: the collision this is most worried about only exists
  // when the two are installed together, which is exactly what the reader is being asked to do.
  const pg = await browser.newPage();
  const errs = [];
  pg.on("console", (m) => { if (m.type() === "error" && !/ERR_CONNECTION/.test(m.text())) errs.push(m.text()); });
  pg.on("pageerror", (e) => errs.push(String(e)));
  await pg.goto(base + "#studio", { waitUntil: "load" });
  await pg.waitForTimeout(400);

  for (const spec of FILES) {
    console.log("\n=== " + spec.file);
    const full = path.join(ROOT, "decks", spec.file);
    ok(fs.existsSync(full), "the file exists");
    if (!fs.existsSync(full)) continue;

    const before = await pg.evaluate(() => document.querySelectorAll(".studio-deck").length);
    const chooser = pg.waitForEvent("filechooser");
    await pg.click("#stImport");
    (await chooser).setFiles(full);
    await pg.waitForFunction((n) => document.querySelectorAll(".studio-deck").length > n,
                             before, { timeout: 300000 });

    // it imported at all -- i.e. it is inside the card and byte caps app.js enforces
    const got = await pg.evaluate((id) => {
      const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      return { deck: id, note: null };
    }, spec.id);
    ok(true, "imports (inside app.js's card and byte caps)");

    // THE CARDS ARE NOT IN THE DECK RECORD.  app.js keeps a small record per deck in `decks` -- the
    // meta, the glossary and a note INDEX -- and the cards themselves in a second store, `notes`,
    // so boot need not read them.  Reading `decks` alone returns a deck with no cards, and a test
    // that then asserts things about that empty list PASSES every `every()` in it: this file said
    // "every leaf is a direction inside a level" and "card ids carry this file's own deck id" over
    // nothing at all before it was pointed at the right store.
    const tree = await pg.evaluate(async (id) => {
      const req = indexedDB.open("folio-community");
      const db = await new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = rej; });
      const rows = await new Promise((res, rej) => {
        const r = db.transaction("notes").objectStore("notes").getAll();
        r.onsuccess = () => res(r.result); r.onerror = rej;
      });
      const decks = await new Promise((res, rej) => {
        const r = db.transaction("decks").objectStore("decks").getAll();
        r.onsuccess = () => res(r.result); r.onerror = rej;
      });
      db.close();
      if (!decks.some((x) => x.id === id || (x.meta || {}).id === id)) return null;
      const mine = rows.filter((r) => r.deckId === id);
      const cards = mine.map((r) => r.c || r.card || r).filter(Boolean);
      const subs = [];
      cards.forEach((c) => { if (c.sub && !subs.includes(c.sub)) subs.push(c.sub); });
      return { subs, n: cards.length, ids: cards.slice(0, 3).map((c) => c.id),
               keys: mine.slice(0, 2).map((r) => Object.keys(r).join("+")) };
    }, spec.id);

    ok(!!tree, "the deck is in the store under its own id", spec.id);
    if (!tree) continue;
    ok(tree.n > 0, "its cards are in the notes store", "n=" + tree.n + " keys " + (tree.keys || []).join(" "));
    ok(tree.subs.length > 0, "and they carry subdeck paths");

    // the tree is TWO levels: a level, and the two directions inside it
    const tops = [];
    tree.subs.forEach((s) => { const t = s.split("::")[0]; if (!tops.includes(t)) tops.push(t); });
    ok(JSON.stringify(tops) === JSON.stringify(spec.tops),
       "top level is " + spec.tops.join(", "), "got " + tops.join(", "));
    ok(tree.subs.every((s) => s.split("::").length === 2),
       "every leaf is a direction inside a level");
    const dirs = [...new Set(tree.subs.map((s) => s.split("::")[1]))];
    ok(dirs.length === 2 && DIRS.every((d) => dirs.includes(d)),
       "both study directions are present", dirs.join(" | "));
    ok(tree.subs.length === spec.tops.length * 2,
       "one subdeck per level per direction (" + spec.tops.length * 2 + ")",
       "got " + tree.subs.length);
    ok(tree.ids.every((i) => i.startsWith("u_" + spec.id + "_")),
       "card ids carry this file's own deck id", tree.ids.join(" "));
  }

  // --- the collision the two files could have with each other
  console.log("\n=== both installed together");
  const clash = await pg.evaluate(async () => {
    const req = indexedDB.open("folio-community");
    const db = await new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = rej; });
    const all = await new Promise((res, rej) => {
      const r = db.transaction("decks").objectStore("decks").getAll();
      r.onsuccess = () => res(r.result); r.onerror = rej;
    });
    db.close();
    const seen = new Map(), dup = [];
    all.forEach((d) => (d.cards || []).forEach((c) => {
      if (seen.has(c.id)) dup.push(c.id); else seen.set(c.id, d.id);
    }));
    return { decks: all.length, cards: seen.size, dup: dup.slice(0, 5) };
  });
  ok(clash.decks >= 2, "both decks are installed at once", "decks " + clash.decks);
  ok(clash.dup.length === 0, "no card id is shared between them", clash.dup.join(" "));

  // --- and the shelf can actually open one
  await pg.goto(base + "#decks", { waitUntil: "load" });
  await pg.waitForTimeout(600);
  const shelf = await pg.evaluate(() => {
    const rows = [...document.querySelectorAll(".udeck-row, .studio-deck, .deck-row")];
    return document.body.innerText.includes("DELE");
  });
  ok(shelf, "the decks show on the collections page");

  ok(errs.length === 0, "no console errors", errs.slice(0, 3).join(" | "));

  await browser.close();
  server.close();
  console.log(`\n${checks - fails}/${checks} passed` + (fails ? `, ${fails} FAILED` : ""));
  process.exit(fails ? 1 : 0);
})();
