// The sanitizer revision stamp — what lets boot skip re-cleaning a deck it already cleaned.
//
// A community deck is sanitized at ONE choke point (uDeckNormalize), and that used to run over every field
// of every card on every single page load, including the records we had written ourselves. On a 10,896-note
// deck that was ~5.7 SECONDS of work per load — and provably wasted work, because sanitizeHTML returns a
// FIXED POINT: re-running it on its own output cannot change a character. So a record we store carries
// `srev`, and communityBoot skips the string cleaning when it matches.
//
// The whole guarantee therefore rests on the stamp, and this file is what holds it up. Two directions, and
// they fail in opposite ways — either alone would pass on a build that had stopped working:
//   · a record with NO srev (what an older, possibly buggier sanitizer left) is still cleaned;
//   · a record we wrote ourselves really does carry the stamp, or the skip never happens and the deck that
//     prompted all this is slow again with nothing on screen to say so.
// The second is the one no other test can see: it is a performance guarantee, and a performance guarantee
// that quietly stops holding looks exactly like one that holds.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-deck-trust.js
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

// A deck as an OLDER build would have left it in the store: hostile markup, and no srev.
const STALE = {
  id: "stale001",
  meta: { id: "stale001", title: "Stale <img src=x onerror='window.__pwned=1'>", version: 1 },
  cards: [{
    id: "u_stale001_1",
    question: "<img src=x onerror='window.__pwned=1'>Ask me",
    answer: "<b>keep this</b><a href=\"javascript:window.__pwned=1\">go</a>",
    answerText: "keep this", answerDate: "", abstract: "", num: "", category: "",
    traditional: "", hanzi: "", pinyin: "", translations: "", citation: "",
  }],
  gloss: {},
};

// Read the store back the way the app does. Closed afterwards: an idle handle blocks the app's own open,
// which silently pushes it onto the localStorage fallback and makes every later assertion measure nothing.
const readStore = (page) => page.evaluate(() => new Promise((res) => {
  let req;
  try { req = indexedDB.open("folio-community"); } catch (e) { res(null); return; }
  req.onsuccess = () => {
    const db = req.result;
    try {
      const g = db.transaction("decks", "readonly").objectStore("decks").getAll();
      g.onsuccess = () => { const r = g.result; db.close(); res(r); };
      g.onerror = () => { db.close(); res(null); };
    } catch (e) { db.close(); res(null); }
  };
  req.onerror = () => res(null);
}));

// …and plant one, into WHICHEVER store this browser is using: cdbAll falls back to localStorage wherever
// IndexedDB is unusable, and a fixture written only to the store the app is not reading proves nothing.
const plant = (page, rec) => page.evaluate((r) => new Promise((res) => {
  try {
    const rows = JSON.parse(localStorage.getItem("folio_community_v1") || "[]");
    localStorage.setItem("folio_community_v1", JSON.stringify(rows.filter((x) => x.id !== r.id).concat([r])));
  } catch (e) {}
  let req;
  try { req = indexedDB.open("folio-community"); } catch (e) { res(); return; }
  req.onsuccess = () => {
    const db = req.result;
    try {
      const tx = db.transaction("decks", "readwrite");
      tx.objectStore("decks").put(r);
      tx.oncomplete = () => { db.close(); res(); };
      tx.onerror = () => { db.close(); res(); };
    } catch (e) { db.close(); res(); }
  };
  req.onerror = () => res();
}), rec);

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  /* The fixture's own `<img src=x>` is REQUESTED by the browser before the sanitizer ever sees the string,
     so it 404s on every run by design. Resource failures are therefore not counted here; what is counted is
     script errors, which is what this file is actually about. */
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });

  /* ---------- 1. a record with no srev is re-sanitized ---------- */
  await page.goto(base + "/#studio");
  await page.waitForTimeout(1200);
  await plant(page, STALE);
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => [...document.querySelectorAll(".studio-deck")].some((d) => /Stale/.test(d.textContent)),
    null, { timeout: 20000 }).catch(() => {});

  const mounted = await page.evaluate(() => {
    const el = [...document.querySelectorAll(".studio-deck")].find((d) => /Stale/.test(d.textContent));
    return { found: !!el, html: el ? el.innerHTML : "", pwned: !!window.__pwned };
  });
  check("a stored deck carrying no srev is still mounted", mounted.found);
  check("…with its title cleaned rather than trusted", mounted.found && mounted.html.indexOf("onerror") < 0);
  check("…and nothing in it executed", !mounted.pwned);

  // the card's fields too, not just the meta — the meta is one string and the cards are the bulk of the work
  await page.evaluate(() => {
    const el = [...document.querySelectorAll(".studio-deck")].find((d) => /Stale/.test(d.textContent));
    const open = el && el.querySelector("[data-open]");
    if (open) open.click();
  });
  await page.waitForTimeout(1200);
  const card = await page.evaluate(() => ({
    body: document.body.innerHTML,
    pwned: !!window.__pwned,
  }));
  check("a card's fields are cleaned too", card.body.indexOf("onerror") < 0 && card.body.indexOf("javascript:") < 0);
  check("…and still nothing executed", !card.pwned);

  /* ---------- 2. what we write back carries the stamp ---------- */
  /* Re-saving is what stamps it: the deck was just re-cleaned, so this is the migration path an older
     record takes — cleaned once, stamped, and skipped from then on. Any Studio edit calls uDeckSave.
     RELOAD rather than goto: we are inside the deck editor and already at #studio, so a same-URL goto is a
     fragment navigation that renders nothing and leaves the editor open with no #stNew on the page. */
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => !!document.querySelector("#stNew"), null, { timeout: 20000 }).catch(() => {});
  const made = await page.evaluate(() => {
    const b = document.querySelector("#stNew");
    if (b) { b.click(); return true; }
    return false;
  });
  await page.waitForTimeout(1500);
  check("a deck can be created", made);

  const rows = await readStore(page);
  const fresh = (rows || []).filter((r) => r.id !== "stale001");
  check("a deck we wrote carries the sanitizer revision", fresh.length > 0 && fresh.every((r) => typeof r.srev === "number"),
    JSON.stringify((fresh || []).map((r) => r.srev)));
  /* The stamp lives at the TOP level of the record and NOT inside `meta`, which is what an export copies:
     a deck FILE must never carry it, since a file is not our store and is never trusted. */
  check("…at the top level, never inside meta so an export cannot claim it",
    fresh.every((r) => !r.meta || r.meta.srev === undefined));

  check("no console/page errors", errs.length === 0, [...new Set(errs)].join(" | "));

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
