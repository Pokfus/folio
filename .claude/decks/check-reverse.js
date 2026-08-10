/* THE REVERSE CARD. Template-major ordering puts the second card of every note after the first card of all
   of them, so on a real deck it is 150 cards away; a two-note cut of the real deck — same type, same CSS,
   same fields — reaches it in four. Grade EASY rather than Good: Good sends a new card to its ten-minute
   learning step and straight back into the queue, so the third and fourth cards of a Good run are the same
   two words again and never the reverse ones. */
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs");
const ROOT = "/home/user/folio";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const server = http.createServer((q, r) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]));
  fs.readFile(p, (e, b) => { if (e) { r.writeHead(404); r.end(); return; }
    r.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" }); r.end(b); });
});
let fails = 0, checks = 0;
const ok = (c, m, x) => { checks++; console.log((c ? "   ✓ " : "   ✗ ") + m + (!c && x ? "   " + x : "")); if (!c) fails++; };
(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";
  const b = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const src = JSON.parse(fs.readFileSync(ROOT + "/decks/HSK1-Mandarin.folio-deck.json", "utf8"));
  src.meta.id = "revtest"; src.meta.title = "Reverse check";
  src.cards = src.cards.slice(0, 2).map((c, i) => ({ ...c, id: "u_revtest_" + (i + 1) }));
  const tmp = "/tmp/rev-check.folio-deck.json";
  fs.writeFileSync(tmp, JSON.stringify(src));

  const pg = await b.newPage();
  const errs = [];
  pg.on("pageerror", (e) => errs.push(String(e)));
  await pg.goto(base + "#studio", { waitUntil: "load" }); await pg.waitForTimeout(400);
  const ch = pg.waitForEvent("filechooser"); await pg.click("#stImport");
  (await ch).setFiles(tmp);
  await pg.waitForSelector(".studio-deck", { timeout: 60000 });
  await pg.goto(base + "#decks", { waitUntil: "load" }); await pg.waitForTimeout(400);
  await pg.click("[data-uadd]"); await pg.waitForTimeout(300);
  console.log("   shelf says: " + await pg.evaluate(() => {
    const e = document.querySelector(".collection-count, .udeck-sub");
    return e ? e.innerText.trim() : "(none)";
  }));
  /* BURY SIBLINGS IS ON BY DEFAULT and is right: answering 爱 → love and then love → 爱 an hour later
     tests the last hour rather than the word. It also means the reverse card is not dealt today, so it is
     turned off here — the thing being checked is that template 2 RENDERS, which is a fact about the deck,
     where burying is a fact about the scheduler and test-card-types.js already covers it. */
  await pg.goto(base + "#home", { waitUntil: "load" }); await pg.waitForTimeout(500);
  await pg.evaluate(() => {
    const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    S.deckOpts = S.deckOpts || {};
    // S.active is an ARRAY of entry ids, not an object — Object.keys gives "0" and writes the option
    // under a key nothing ever reads, which is why the first attempt changed nothing at all
    (Array.isArray(S.active) ? S.active : Object.keys(S.active || {}))
      .forEach((k) => { S.deckOpts[k] = { ...(S.deckOpts[k] || {}), burySiblings: false }; });
    S.deckOpts["review:all"] = { ...(S.deckOpts["review:all"] || {}), burySiblings: false };
    localStorage.setItem("folio_v1", JSON.stringify(S));
  });
  await pg.reload({ waitUntil: "load" }); await pg.waitForTimeout(600);
  await pg.click(".review-group .banner .cta .btn");
  await pg.waitForSelector(".cardwrap", { timeout: 60000 });

  const run = [];
  for (let i = 0; i < 4; i++) {
    const c = await pg.evaluate(() => {
      const el = document.querySelector(".uc-card");
      return el ? { tpl: el.getAttribute("data-uctpl"), front: el.innerText.replace(/\s+/g, " ").trim().slice(0, 60) } : null;
    });
    if (!c) break;
    await pg.click("#reveal-btn", { timeout: 4000 }).catch(() => {});
    await pg.waitForTimeout(200);
    const back = await pg.evaluate(() => {
      const all = [...document.querySelectorAll(".uc-card")];
      const el = all[all.length - 1];
      const s = el.querySelector(".uc-sense");
      return { size: s ? getComputedStyle(s).fontSize : "", simp: !!el.querySelector(".uc-simp"),
               txt: el.innerText.replace(/\s+/g, " ").trim().slice(0, 70) };
    });
    run.push({ ...c, ...back });
    await pg.click(".grade.easy", { timeout: 4000 }).catch(() => {});
    await pg.waitForTimeout(260);
  }
  console.log("   after the run: " + JSON.stringify(await pg.evaluate(() => {
    const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    return { active: Object.keys(S.active || {}), opts: S.deckOpts, cards: Object.keys(S.cards || {}),
             done: (document.querySelector(".page") || {}).innerText ? document.querySelector(".page").innerText.replace(/\s+/g," ").slice(0,120) : "" };
  })));
  run.forEach((r) => console.log("   card tpl " + r.tpl + "  front " + JSON.stringify(r.front.slice(0, 30)) +
    "  back " + JSON.stringify(r.txt.slice(0, 42)) + "  sense " + r.size));
  ok(run.length === 4, "four cards come out of two notes", "got " + run.length);
  ok(run.slice(0, 2).every((r) => r.tpl === "1") && run.slice(2).every((r) => r.tpl === "2"),
     "both forward cards come before either reverse card", JSON.stringify(run.map((r) => r.tpl)));
  ok(run.slice(2).every((r) => /SAY IT IN CHINESE/i.test(r.front)),
     "the reverse card asks in English", JSON.stringify(run.slice(2).map((r) => r.front.slice(0, 34))));
  ok(run.slice(2).every((r) => r.size === "18px"),
     "template 2's own CSS rule lands — the prompt is set larger", JSON.stringify(run.map((r) => r.size)));
  ok(run.slice(2).every((r) => r.simp), "the reverse card's answer shows the characters");
  ok(!errs.length, "no page errors", errs.slice(0, 2).join(" | "));
  console.log(fails ? "\n✗ " + fails + " of " + checks + " failed" : "\n✓ all " + checks + " passed");
  await b.close(); server.close();
  process.exit(fails ? 1 : 0);
})();
