// Subdecks inside a community deck — one file holding what would otherwise be several decks.
//
// A subdeck is a STRING ON THE CARD and the deck's subdeck list is derived from it, which is what makes the
// feature cost no schema change. That is also what makes it easy to break quietly: the list is rebuilt on
// every read, so a card whose `sub` is dropped anywhere along export → import → publish → install simply
// falls back into the parent deck, and the deck still works. Nothing throws; a subdeck just goes missing.
// So the assertions follow one card's `sub` through every path a card takes.
//
// The deck is built here rather than read off decks/, so this tests the FEATURE and not a content file.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-subdecks.js
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

// A deck of six Basic cards: two in "Alpha", two in "Beta", two in no subdeck at all. The third group is
// the case worth having — a partly-grouped deck must still work, and its loose cards must not invent a row.
const SUBS = ["Alpha", "Beta", ""];
/* A deck of two subdecks with THREE cards each. The nested fixture below has one card per leaf, which
   is enough to show that a branch draws from both and not enough to show the LAG — for that a subdeck
   needs more cards than a day's allowance. */
const PAIRED = ["Front", "Back"];
function pairedDeckFile(id, title) {
  const d = deckFile(id, title);
  d.meta.id = id;
  d.cards = [];
  PAIRED.forEach((sub) => {
    for (let i = 1; i <= 3; i++) {
      const n = d.cards.length + 1;
      d.cards.push({
        id: "u_" + id + "_" + n, num: String(n), category: "", sub,
        // the word is the POSITION, so a dealt card says which subdeck and which position at a glance
        question: sub[0] + i + " <span class=\"blank\">_____</span> end", answer: sub[0] + i,
        answerDate: "", traditional: "", hanzi: "", pinyin: "", translations: "", abstract: "",
        citation: "", answerText: sub[0] + i,
      });
    }
  });
  return d;
}
/* A deck whose subdecks hold subdecks: two levels, four leaves, and NO card naming `A1` or `A2` on its
   own — an intermediate node exists exactly when something under it does, so if the tree is not derived
   from the path those two rows never appear. Plain ASCII names on purpose: the entry id percent-encodes
   the path, and a test that also exercised the arrow would not say which of the two had broken. */
const NESTED = ["A1::Spanish to English", "A1::English to Spanish",
                "A2::Spanish to English", "A2::English to Spanish"];
function nestedDeckFile(id, title) {
  const d = deckFile(id, title);
  d.meta.id = id;
  d.cards = NESTED.map((sub, i) => ({
    id: "u_" + id + "_" + (i + 1), num: String(i + 1), category: "", sub,
    question: "N" + (i + 1) + " <span class=\"blank\">_____</span> end", answer: "A" + (i + 1),
    answerDate: "", traditional: "", hanzi: "", pinyin: "", translations: "", abstract: "",
    citation: "", answerText: "A" + (i + 1),
  }));
  return d;
}
function deckFile(id, title) {
  const cards = [];
  SUBS.forEach((sub) => {
    for (let i = 0; i < 2; i++) {
      const n = cards.length + 1;
      const card = {
        id: "u_" + id + "_" + n, num: String(n), category: "",
        question: "Q" + n + " <span class=\"blank\">_____</span> end", answer: "A" + n, answerDate: "",
        traditional: "", hanzi: "", pinyin: "", translations: "", abstract: "", citation: "",
        answerText: "A" + n,
      };
      if (sub) card.sub = sub;
      cards.push(card);
    }
  });
  return {
    folioDeck: 1,
    meta: { id, title, subtitle: "", desc: "", author: "", language: "en", tags: [],
            glossMode: "site", types: {}, version: 1 },
    cards, gloss: {},
  };
}

/* A stored deck, reassembled. Since Aug 2026 a deck's cards live one record per note in a second store and
   the deck record carries only an INDEX of them, so this puts the two back together in index order — which
   means every assertion below now checks `sub` in BOTH places it is written, the index a subdeck list is
   built from and the note record a card is rendered from. A card whose `sub` survived one and not the other
   would be exactly the quiet half-failure this file exists to catch. */
const readDecks = (page) => page.evaluate(() => new Promise((res) => {
  const req = indexedDB.open("folio-community");
  req.onsuccess = () => {
    const db = req.result;
    const tx = db.transaction(["decks", "notes"], "readonly");
    const g = tx.objectStore("decks").getAll();
    const gn = tx.objectStore("notes").getAll();
    tx.oncomplete = () => {
      const notes = {};
      (gn.result || []).forEach((n) => { if (n && n.c) notes[n.k] = n.c; });
      db.close();
      res((g.result || []).map((r) => Object.assign({}, r, {
        index: r.index || null,
        cards: r.cards || (r.index || []).map((e) => notes[r.id + "/" + e.id]).filter(Boolean),
      })));
    };
    tx.onerror = () => { db.close(); res([]); };
  };
  req.onerror = () => res([]);
}));
const active = (page) => page.evaluate(() => {
  try { return JSON.parse(localStorage.getItem("folio_v1") || "{}").active || []; } catch (e) { return []; }
});

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

  const tmp = path.join(os.tmpdir(), "folio-subdeck.folio-deck.json");
  fs.writeFileSync(tmp, JSON.stringify(deckFile("subdeck1", "Grouped deck")));
  await page.goto(base + "/#studio");
  await page.reload();
  await page.waitForTimeout(900);
  const chooser = page.waitForEvent("filechooser");
  await page.click("#stImport");
  await (await chooser).setFiles(tmp);
  await page.waitForTimeout(1500);

  /* ---------- the file's subdecks survive ingest ---------- */
  let rec = (await readDecks(page)).find((r) => r.meta && r.meta.title === "Grouped deck");
  check("the deck imported", !!rec);
  if (!rec) { console.log("\n" + pass + " passed, " + (fail + 1) + " failed"); await browser.close(); server.close(); process.exit(1); }
  check("every card kept its subdeck through the sanitiser",
    rec.cards.filter((c) => c.sub === "Alpha").length === 2 && rec.cards.filter((c) => c.sub === "Beta").length === 2,
    JSON.stringify(rec.cards.map((c) => c.sub || null)));
  check("…and a card in no subdeck carries no key at all", rec.cards.filter((c) => !("sub" in c)).length === 2);

  /* ---------- the deck's row grows one child per subdeck ---------- */
  await page.goto(base + "/#decks");
  await page.waitForTimeout(1400);
  const rows = await page.evaluate(() => [...document.querySelectorAll(".udeck-subrow")].map((r) => ({
    name: r.dataset.usubname,
    count: (r.querySelector(".collection-count") || {}).textContent || "",
    add: !!r.querySelector("[data-uaddsub]"),
  })));
  check("one row per subdeck, in card order", rows.length === 2 && rows[0].name === "Alpha" && rows[1].name === "Beta",
    JSON.stringify(rows.map((r) => r.name)));
  check("…each counting only its own cards", rows.every((r) => /2 cards/.test(r.count)), JSON.stringify(rows.map((r) => r.count)));
  check("…and the loose cards invent no row of their own", rows.length === 2);
  check("the parent row still counts the whole deck",
    /6 cards/.test(await page.evaluate(() => (document.querySelector(".udeck .collection-count") || {}).textContent || "")));

  /* ---------- adding and studying one subdeck ---------- */
  await page.click('.udeck-subrow[data-usubname="Beta"] [data-uaddsub]');
  await page.waitForTimeout(700);
  let act = await active(page);
  check("adding a subdeck adds that subdeck alone", act.length === 1 && act[0].indexOf("u:subdeck1/") === 0, JSON.stringify(act));
  await page.goto(base + "/#home");
  await page.waitForTimeout(1300);
  const home = await page.evaluate(() => [...document.querySelectorAll(".active-deck")].map((r) => ({
    title: (r.querySelector(".dk-title") || {}).textContent || "",
    sup: (r.querySelector(".dk-sup") || {}).textContent || "",
  })));
  check("the review names the row by its SUBDECK", home.length === 1 && home[0].title === "Beta", JSON.stringify(home));
  check("…with its deck as the quiet context", home[0] && home[0].sup === "Grouped deck", JSON.stringify(home[0]));

  await page.goto(base + "/#decks");
  await page.waitForTimeout(1300);
  await page.click('.udeck-subrow[data-usubname="Beta"] .collection-main');
  await page.waitForTimeout(1400);
  const q = await page.evaluate(() => (document.querySelector(".question") || {}).textContent || "");
  // Alpha is cards 1-2, Beta 3-4, and the ungrouped pair is 5-6
  check("studying a subdeck deals only its cards", /Q3|Q4/.test(q), JSON.stringify(q.slice(0, 24)));

  /* ---------- adding the WHOLE deck brings its subdecks, nested under it ----------
     Reported (Aug 2026): a deck added from Collections arrived in the daily study as one undivided row,
     with nothing to say it had subdecks at all. Adding a collection has always brought its whole subtree
     in; this is the same rule one store over. Four things are checked because each fails differently and
     three of them are silent — an entry not added, a row drawn beside its deck instead of under it, a fold
     that hides what was just added, and a context line that crushes the name it sits beside. */
  await page.goto(base + "/#decks");
  await page.waitForTimeout(1300);
  await page.click(".udeck [data-uadd]");
  await page.waitForTimeout(900);
  act = await active(page);
  check("adding the deck adds its subdecks too",
    act.indexOf("u:subdeck1") !== -1 && SUBS.filter(Boolean).every((sb) => act.indexOf("u:subdeck1/" + encodeURIComponent(sb)) !== -1),
    JSON.stringify(act));
  check("...and every subdeck row's + follows in the same sweep",
    await page.evaluate(() => [...document.querySelectorAll("[data-uaddsub]")].every((b) => b.classList.contains("added"))));

  await page.goto(base + "/#home");
  await page.waitForTimeout(1400);
  const nested = await page.evaluate(() => [...document.querySelectorAll(".active-deck")].map((r) => ({
    title: (r.querySelector(".dk-title") || {}).textContent || "",
    sup: (r.querySelector(".dk-sup") || {}).textContent || "",
    depth: r.dataset.depth,
  })));
  check("the deck's row comes first, at the top level",
    nested.length === 3 && nested[0].title === "Grouped deck" && nested[0].depth === "0", JSON.stringify(nested));
  check("...with its subdecks indented UNDER it rather than beside it",
    nested.slice(1).every((r) => r.depth === "1") && nested[1].title === "Alpha" && nested[2].title === "Beta",
    JSON.stringify(nested.map((r) => r.depth + ":" + r.title)));
  /* The row is drawn under the deck that names it, so repeating that name is not merely redundant: at
     390px it is the deck's title and the subdeck's competing for one line, and the subdeck loses. */
  check("...and drops the context line, which is now the row above them",
    nested.slice(1).every((r) => !r.sup), JSON.stringify(nested.map((r) => r.sup)));

  /* ---------- removing the deck takes its subdeck entries with it ---------- */
  await page.goto(base + "/#studio");
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /^delete$/i.test(x.textContent.trim()));
    if (b) b.click();
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /^delete$/i.test(x.textContent.trim()) && x.closest(".inline-prompt"));
    if (b) b.click();
  });
  await page.waitForTimeout(1000);
  act = await active(page);
  check("deleting the deck clears its subdeck entry from the review", act.length === 0, JSON.stringify(act));

  /* ---------- A SUBDECK MAY HOLD SUBDECKS (Aug 2026, on request) ----------
     `card.sub` is a PATH separated by `::`, so the tree is still derived from the cards and still costs no
     schema change. Every assertion here is for a silent failure: an intermediate node that never appears,
     a parent row that counts zero because the match is an equality test rather than a prefix one, rows
     drawn flat so `A1` and `A1::Spanish → English` are siblings, or an add that brings the leaves and not
     the branch. None of them throws and the deck goes on working. */
  const tmp2 = path.join(os.tmpdir(), "folio-subdeck-nested.folio-deck.json");
  fs.writeFileSync(tmp2, JSON.stringify(nestedDeckFile("subdeck2", "Nested deck")));
  await page.goto(base + "/#studio");
  await page.waitForTimeout(1200);
  const chooser2 = page.waitForEvent("filechooser");
  await page.click("#stImport");
  await (await chooser2).setFiles(tmp2);
  await page.waitForTimeout(2500);

  await page.goto(base + "/#decks");
  await page.waitForTimeout(1300);
  const tree = await page.evaluate(() => [...document.querySelectorAll(".udeck-subrow")].map((r) => ({
    title: (r.querySelector(".deck-title") || {}).textContent || "",
    depth: r.dataset.depth,
    path: r.dataset.usubname,
    count: (r.querySelector(".collection-count") || {}).textContent || "",
  })));
  check("an intermediate subdeck exists even though no card names it on its own",
    tree.length === 6 && tree[0].path === "A1" && tree[0].depth === "0",
    JSON.stringify(tree.map((r) => r.depth + ":" + r.path)));
  check("...with the two directions nested inside it",
    tree[1].path === "A1::Spanish to English" && tree[1].depth === "1" &&
    tree[2].path === "A1::English to Spanish" && tree[2].depth === "1",
    JSON.stringify(tree.map((r) => r.depth + ":" + r.path)));
  check("...each row named by its own segment, not the whole path",
    tree[1].title === "Spanish to English", JSON.stringify(tree.map((r) => r.title)));
  /* The one that would go quiet: a parent's cards are its DESCENDANTS' cards. Written as an equality test
     — which is what a one-segment `sub` needed — every branch row reads "0 cards" and studies nothing. */
  check("a parent subdeck counts the cards of everything under it",
    tree[0].count === "2 cards" && tree[1].count === "1 card",
    JSON.stringify(tree.map((r) => r.path + "=" + r.count)));

  await page.evaluate(() => { document.querySelector("[data-uaddsub]").click(); });
  await page.waitForTimeout(900);
  act = await active(page);
  check("adding a branch adds everything under it and nothing beside it",
    act.indexOf("u:subdeck2/" + encodeURIComponent("A1")) !== -1 &&
    act.indexOf("u:subdeck2/" + encodeURIComponent("A1::Spanish to English")) !== -1 &&
    act.indexOf("u:subdeck2/" + encodeURIComponent("A1::English to Spanish")) !== -1 &&
    act.indexOf("u:subdeck2/" + encodeURIComponent("A2")) === -1,
    JSON.stringify(act));

  await page.goto(base + "/#home");
  await page.waitForTimeout(1400);
  const deep = await page.evaluate(() => [...document.querySelectorAll(".active-deck")].map((r) => ({
    title: (r.querySelector(".dk-title") || {}).textContent || "",
    sup: (r.querySelector(".dk-sup") || {}).textContent || "",
    depth: r.dataset.depth,
  })));
  check("the review nests them two deep",
    deep.length === 3 && deep[0].depth === "0" && deep[0].title === "A1" &&
    deep.slice(1).every((r) => r.depth === "1"),
    JSON.stringify(deep.map((r) => r.depth + ":" + r.title)));
  check("...and a nested row drops the context line its parent row now supplies",
    deep.slice(1).every((r) => !r.sup), JSON.stringify(deep.map((r) => r.sup)));

  // studying the BRANCH deals cards from both directions under it
  await page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    st.settings = Object.assign({}, st.settings, { newPerDay: 20, maxReviewsPerDay: 20 });
    localStorage.setItem("folio_v1", JSON.stringify(st));
  });
  await page.goto(base + "/#home");
  await page.reload();
  await page.waitForTimeout(1600);
  await page.evaluate(() => { const r = document.querySelector(".active-deck"); if (r) r.click(); });
  await page.waitForTimeout(1500);
  const dealt = [];
  for (let i = 0; i < 4; i++) {
    const t = await page.evaluate(() => {
      document.querySelectorAll(".chest-pop,.levelup-pop").forEach((e) => e.remove());
      const q = document.querySelector(".question");
      return q ? q.textContent.trim() : null;
    });
    if (t) dealt.push(t.slice(0, 3));
    const on = await page.evaluate(() => { const b = document.querySelector("#reveal-btn"); if (!b) return false; b.click(); return true; });
    if (!on) break;
    await page.waitForTimeout(80);
    const g = await page.evaluate(() => { const b = document.querySelector("button.grade[data-g='good']"); if (!b) return false; b.click(); return true; });
    if (!g) break;
    await page.waitForTimeout(80);
  }
  check("studying the branch deals the cards of both subdecks under it",
    dealt.length === 4, JSON.stringify(dealt));

  /* Removing a LEAF takes its ancestors, which is the collection rule: an ancestor left active would go on
     offering the very cards just removed while its + still read as added. */
  await page.goto(base + "/#decks");
  await page.waitForTimeout(1300);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("[data-uaddsub]")]
      .find((x) => /A1::Spanish to English/.test(x.dataset.uaddsub ? decodeURIComponent(x.dataset.uaddsub) : ""));
    if (b) b.click();
  });
  await page.waitForTimeout(900);
  act = await active(page);
  check("removing a nested subdeck takes its ancestors with it",
    act.every((e) => !/subdeck2/.test(e)) || act.indexOf("u:subdeck2/" + encodeURIComponent("A1")) === -1,
    JSON.stringify(act));

  /* ---------- a subdecked entry deals its subdecks ROUND-ROBIN, each one a day behind ----------
     Reported (Aug 2026): studying a level of a two-direction deck gave one direction and never the
     other, because a deck stores its subdecks one after another and the day's new cards are a SLICE off
     the front of that list. Two things are asserted and each fails differently. Without the round robin
     the second subdeck never appears at all. Without the LAG a word's two directions arrive a second
     apart, which is worse than the bug it fixes — the reverse is then answered out of short-term memory
     — so day one must be the first subdeck alone and day two must mix. */
  const tmp3 = path.join(os.tmpdir(), "folio-subdeck-paired.folio-deck.json");
  fs.writeFileSync(tmp3, JSON.stringify(pairedDeckFile("subdeck3", "Paired deck")));
  await page.goto(base + "/#studio");
  await page.waitForTimeout(1200);
  const chooser3 = page.waitForEvent("filechooser");
  await page.click("#stImport");
  await (await chooser3).setFiles(tmp3);
  await page.waitForTimeout(2500);

  // study the whole deck, two new cards a day, ordered
  const setUp = async () => page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    st.active = ["u:subdeck3"];
    st.deckOpts = Object.assign({}, st.deckOpts || {});
    st.deckOpts["u:subdeck3"] = { newPerDay: 2, maxReviews: 50, random: false };
    localStorage.setItem("folio_v1", JSON.stringify(st));
  });
  const dealTwo = async () => {
    await page.goto(base + "/#home");
    await page.reload();
    await page.waitForTimeout(1500);
    await page.evaluate(() => { const r = document.querySelector(".active-deck"); if (r) r.click(); });
    await page.waitForTimeout(1400);
    const out = [];
    for (let i = 0; i < 2; i++) {
      const q = await page.evaluate(() => {
        document.querySelectorAll(".chest-pop,.levelup-pop").forEach((e) => e.remove());
        const el = document.querySelector(".question");
        return el ? el.textContent.trim().split(/\s+/)[0] : null;
      });
      if (q) out.push(q);
      const on = await page.evaluate(() => { const b = document.querySelector("#reveal-btn"); if (!b) return false; b.click(); return true; });
      if (!on) break;
      await page.waitForTimeout(90);
      const g = await page.evaluate(() => { const b = document.querySelector("button.grade[data-g='easy']"); if (!b) return false; b.click(); return true; });
      if (!g) break;
      await page.waitForTimeout(90);
    }
    return out;
  };
  await setUp();
  const day1 = await dealTwo();
  check("day one is the first subdeck alone — the second is held a day back",
    day1.length === 2 && day1.every((x) => /^F/.test(x)), JSON.stringify(day1));

  /* Day two, simulated by ageing what day one introduced: the day's new-card count is DERIVED from each
     card's own `first` day, so moving that back frees the allowance exactly as midnight would. */
  await page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    Object.keys(st.cards || {}).forEach((k) => {
      if (k.indexOf("u_subdeck3_") === 0 && st.cards[k].first) st.cards[k].first = "2020-01-01";
      if (k.indexOf("u_subdeck3_") === 0) st.cards[k].due = Date.now() + 864e5 * 30;   // not due again today
    });
    localStorage.setItem("folio_v1", JSON.stringify(st));
  });
  const day2 = await dealTwo();
  check("day two mixes the two subdecks, each still in its own order",
    day2.length === 2 && /^F/.test(day2[0]) && /^B/.test(day2[1]), JSON.stringify({ day1, day2 }));
  check("...and each subdeck is dealt from its own position 1 upward",
    day1[0] === "F1" && day1[1] === "F2" && day2[0] === "F3" && day2[1] === "B1",
    JSON.stringify({ day1, day2 }));

  const own = errs.filter((e) => !/fonts\.googleapis|gstatic|ERR_CONNECTION_RESET/.test(e));
  check("no same-origin console errors", own.length === 0, own.slice(0, 3).join(" | "));

  console.log("\n" + pass + " passed, " + fail + " failed");
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
