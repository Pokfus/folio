/* NESTED SUBDECKS AND THE CASCADE — run with Playwright, as check-decks.js is.
   NESTED SUBDECKS AND THE CASCADE (Aug 2026, on request — curated collections have always done both).
   A deck whose cards name a PATH should draw a tree on Collections, and adding the deck should put every
   subdeck on the home page the way adding a collection puts every deck there.
   Both fail QUIETLY: a missing cascade looks like a deck with no subdecks, and a missing ancestor row
   makes a child look top-level. */
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
const ok = (c, m, x) => { checks++; console.log((c ? "   ✓ " : "   ✗ ") + m + (!c && x !== undefined ? "   " + JSON.stringify(x) : "")); if (!c) fails++; };

// a deck of 8 notes: two levels, each split two ways, plus a flat "Idioms" — the shape asked for, in little
const SUBS = ["Level 1::Chinese to English", "Level 1::English to Chinese",
              "Level 2::Chinese to English", "Level 2::English to Chinese", "Idioms"];
const deck = {
  folioDeck: 1,
  meta: { id: "nest1", title: "Nesting check", subtitle: "", desc: "", author: "", language: "en",
          tags: [], glossMode: "site", types: {}, version: 1, createdAt: Date.parse("2026-08-10"),
          updatedAt: Date.parse("2026-08-10"), forkedFrom: null },
  cards: SUBS.flatMap((sub, i) => [0, 1].map((k) => ({
    id: "u_nest1_" + (i * 2 + k + 1), num: String(i * 2 + k + 1), category: "", sub: sub,
    question: sub + " q" + k, answer: sub + " a" + k, answerDate: "", answerText: "a" + k,
    traditional: "", hanzi: "", pinyin: "", translations: "", abstract: "", citation: "",
  }))),
  gloss: {},
};

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";
  const b = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const pg = await b.newPage();
  const errs = [];
  pg.on("pageerror", (e) => errs.push(String(e)));
  const tmp = "/tmp/nest-check.folio-deck.json";
  fs.writeFileSync(tmp, JSON.stringify(deck));

  await pg.goto(base + "#studio", { waitUntil: "load" }); await pg.waitForTimeout(400);
  const ch = pg.waitForEvent("filechooser"); await pg.click("#stImport");
  (await ch).setFiles(tmp);
  await pg.waitForSelector(".studio-deck", { timeout: 60000 });

  // ---- 1. the Collections page draws the tree
  await pg.goto(base + "#decks", { waitUntil: "load" }); await pg.waitForTimeout(500);
  const rows = await pg.evaluate(() => [...document.querySelectorAll(".udeck-subrow")].map((e) => ({
    name: (e.querySelector(".node-title") || {}).textContent || "",
    depth: e.getAttribute("data-depth"),
    // the depth indent is a MARGIN since the rows became curated .node rows — each is the same 46px
    // box as its parent and is stepped in from it, rather than a padded row growing its own left gutter
    pad: parseInt(getComputedStyle(e).marginInlineStart, 10) || 0,
    count: (e.querySelector(".node-count") || {}).textContent || "",
    sub: e.getAttribute("data-usubname"),
  })));
  rows.forEach((r) => console.log("   depth " + r.depth + "  pad " + r.pad + "  " + r.name.padEnd(20) + r.count));
  ok(rows.length === 7, "seven rows: two parents, four children and the flat one", rows.length);
  ok(rows.filter((r) => r.depth === "1").length === 4, "four rows are one level in",
     rows.map((r) => r.depth));
  ok(rows.map((r) => r.sub)[0] === "Level 1" && rows.map((r) => r.sub)[1] === "Level 1::Chinese to English",
     "a parent is listed immediately before its children", rows.map((r) => r.sub));
  ok(rows.every((r) => !/::/.test(r.name)), "a row is named by its own last part, not the whole path",
     rows.map((r) => r.name));
  const pads = rows.map((r) => r.pad);
  ok(pads[1] > pads[0], "a child is indented past its parent", pads);
  ok(/^2 cards/.test(rows[1].count) && /^4 cards/.test(rows[0].count),
     "a parent counts its children's cards, a child its own", [rows[0].count, rows[1].count]);

  // ---- 2. adding the DECK cascades
  await pg.click("[data-uadd]");
  await pg.waitForTimeout(400);
  await pg.goto(base + "#home", { waitUntil: "load" }); await pg.waitForTimeout(600);
  const home = await pg.evaluate(() => [...document.querySelectorAll(".active-deck")].map((e) => ({
    title: (e.querySelector(".dk-title, .deck-title, .dk-body") || e).innerText.replace(/\s+/g, " ").trim().slice(0, 34),
    depth: e.getAttribute("data-depth"), shut: e.classList.contains("dk-shut"),
  })));
  home.forEach((r) => console.log("   home depth " + r.depth + (r.shut ? " (folded)" : "") + "  " + r.title));
  ok(home.length >= 8, "the deck and its whole tree are on the home page", home.length);
  ok(home.some((r) => r.depth === "1") && home.some((r) => r.depth === "2"),
     "they are drawn as a tree, two levels deep", home.map((r) => r.depth));

  // ---- 3. removing the deck takes the subdecks with it
  await pg.goto(base + "#decks", { waitUntil: "load" }); await pg.waitForTimeout(400);
  await pg.click("[data-uadd]");
  await pg.waitForTimeout(400);
  const left = await pg.evaluate(() => {
    const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    return (S.active || []).filter((x) => String(x).indexOf("u:nest1") === 0);
  });
  ok(left.length === 0, "removing the deck removes every subdeck entry with it", left);

  // ---- 4. adding ONE branch adds only that branch, and removing a child frees its parent
  await pg.evaluate(() => {
    const el = [...document.querySelectorAll("[data-uaddsub]")]
      .find((e) => decodeURIComponent(e.getAttribute("data-uaddsub")).endsWith("/Level 1"));
    el.click();
  });
  await pg.waitForTimeout(400);
  const branch = await pg.evaluate(() => {
    const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    return (S.active || []).filter((x) => String(x).indexOf("u:nest1") === 0).map(decodeURIComponent);
  });
  console.log("   after adding Level 1: " + JSON.stringify(branch));
  ok(branch.length === 3, "Level 1 brings its two children and nothing else", branch);
  ok(!branch.some((x) => /Level 2|Idioms/.test(x)), "the other branches stay out", branch);

  /* ---- 5. DIRECTION AS A SUBDECK (Aug 2026, on request).
     A word is one note with two cards, so `sub` can never name the direction — the TEMPLATE does, and a
     type's templates are the last level of the tree. Three things fail quietly here: a direction row that
     deals BOTH templates (the narrowing lost), a direction row drawn over a container that only groups
     (the same cards offered a third time under a name that says nothing new), and the deck file needing to
     change at all — it must not, the templates being in the type already. */
  const TWO = {
    folioDeck: 1,
    meta: { id: "dir1", title: "Direction check", subtitle: "", desc: "", author: "", language: "en",
            tags: [], glossMode: "site", version: 1, createdAt: Date.parse("2026-08-10"),
            updatedAt: Date.parse("2026-08-10"), forkedFrom: null,
            types: { vv: { id: "vv", name: "Two-way", fields: ["Front", "Back"], cards: [
              { name: "Chinese to English", front: "<div>{{Front}}</div>", back: "{{FrontSide}}<hr><div>{{Back}}</div>" },
              { name: "English to Chinese", front: "<div>{{Back}}</div>", back: "{{FrontSide}}<hr><div>{{Front}}</div>" },
            ], css: "" } } },
    // eight notes a level, so a six-card allowance can tell a template-major gather from a note-major one:
    // six forward cards against three words both ways. Four notes would leave the shuffle check on four
    // items, where an unshuffled order is reproduced once in 24.
    cards: ["Level 1", "Level 2"].flatMap((sub, i) => [0, 1, 2, 3, 4, 5, 6, 7].map((k) => ({
      id: "u_dir1_" + (i * 8 + k + 1), num: String(i * 8 + k + 1), sub: sub, type: "vv",
      fields: { Front: sub + " front " + k, Back: sub + " back " + k },
      question: "", answer: "", answerDate: "", answerText: "", category: "",
      traditional: "", hanzi: "", pinyin: "", translations: "", abstract: "", citation: "",
    }))),
    gloss: {},
  };
  const tmp2 = "/tmp/dir-check.folio-deck.json";
  fs.writeFileSync(tmp2, JSON.stringify(TWO));
  await pg.goto(base + "#studio", { waitUntil: "load" }); await pg.waitForTimeout(400);
  const ch2 = pg.waitForEvent("filechooser"); await pg.click("#stImport");
  (await ch2).setFiles(tmp2);
  await pg.waitForSelector(".studio-deck", { timeout: 60000 });

  await pg.goto(base + "#decks", { waitUntil: "load" }); await pg.waitForTimeout(500);
  const dr = await pg.evaluate(() => {
    const deck = [...document.querySelectorAll(".udeck")].find((e) => /Direction check/.test(e.textContent));
    return [...deck.querySelectorAll(".udeck-subrow")].map((e) => ({
      name: (e.querySelector(".node-title") || {}).textContent || "",
      depth: e.getAttribute("data-depth"), tpl: e.getAttribute("data-usubtpl"),
      sub: e.getAttribute("data-usubname"),
      count: (e.querySelector(".node-count") || {}).textContent || "",
    }));
  });
  dr.forEach((r) => console.log("   depth " + r.depth + "  tpl " + r.tpl + "  " + r.name.padEnd(22) + r.count));
  ok(dr.length === 6, "two levels, each split into its two directions", dr.length);
  ok(dr.map((r) => r.tpl).join(",") === "-1,0,1,-1,0,1", "each level is followed by its own directions",
     dr.map((r) => r.tpl));
  ok(dr.every((r) => r.sub !== ""), "the deck itself gets no directions — it only groups",
     dr.map((r) => r.sub));
  ok(/^16 cards/.test(dr[0].count) && /^8 cards/.test(dr[1].count) && /^8 cards/.test(dr[2].count),
     "a level counts both directions and each direction counts one", dr.map((r) => r.count));
  ok(dr[1].name === "Chinese to English" && dr[2].name === "English to Chinese",
     "a direction is named by its template", [dr[1].name, dr[2].name]);

  /* ADDING THE DECK BRINGS THE LEVELS AND NOT THE DIRECTIONS. A subdeck holds cards nothing else holds, so
     the cascade must bring it; a direction holds a subset of its own parent's, so bringing it too would
     surface reverses in the pooled draw from the first day — where the level's own template-major list
     deals every forward card first. Choosing a direction is what makes it mean anything. */
  const dirAdd = () => pg.evaluate(() => {
    const deck = [...document.querySelectorAll(".udeck")].find((e) => /Direction check/.test(e.textContent));
    deck.querySelector("[data-uadd]").click();
  });
  const dirActive = () => pg.evaluate(() => {
    const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    return (S.active || []).filter((x) => String(x).indexOf("u:dir1") === 0).map(decodeURIComponent);
  });
  await dirAdd();
  await pg.waitForTimeout(400);
  const act = await dirActive();
  console.log("   active: " + JSON.stringify(act));
  ok(act.length === 3, "the deck and its two levels", act);
  ok(!act.some((x) => /#\d$/.test(x)), "the directions are the reader's own choice, not the cascade's", act);

  /* A direction is added and removed ALONE. Everywhere else an active ancestor goes with the row — it
     would go on offering the cards just removed — but a direction is a VIEW of its level's cards rather
     than a share of them, so taking the level away with it is the opposite of what hiding one means.
     It still goes when its level goes: add narrow, remove wide. */
  const dirTpl = () => pg.evaluate(() => {
    const deck = [...document.querySelectorAll(".udeck")].find((e) => /Direction check/.test(e.textContent));
    [...deck.querySelectorAll("[data-uaddsub]")]
      .find((e) => decodeURIComponent(e.getAttribute("data-uaddsub")).endsWith("/Level 1#0")).click();
  });
  await dirTpl();
  await pg.waitForTimeout(400);
  ok((await dirActive()).some((x) => /Level 1#0$/.test(x)), "a direction can be added on its own",
     await dirActive());
  await dirTpl();                       // …and off again
  await pg.waitForTimeout(400);
  ok((await dirActive()).length === 3 && !(await dirActive()).some((x) => /#\d$/.test(x)),
     "removing a direction leaves its level and the deck alone", await dirActive());
  await dirTpl();                       // back on, so the deck has one to take with it
  await pg.waitForTimeout(400);
  await dirAdd();                       // remove the whole deck
  await pg.waitForTimeout(400);
  ok((await dirActive()).length === 0, "removing the deck takes the chosen direction with it",
     await dirActive());
  await dirAdd();
  await pg.waitForTimeout(400);

  // …and studying a direction deals ONLY that template's cards
  await pg.evaluate(() => {
    const deck = [...document.querySelectorAll(".udeck")].find((e) => /Direction check/.test(e.textContent));
    [...deck.querySelectorAll(".udeck-subrow")].find((e) => e.getAttribute("data-usubtpl") === "1").click();
  });
  await pg.waitForTimeout(700);
  const sess = await pg.evaluate(() => JSON.parse(sessionStorage.getItem("folio_study_v1") || "{}"));
  console.log("   queue: " + JSON.stringify(sess.queue));
  ok((sess.queue || []).length === 5, "the direction deals only its own cards, not the level's sixteen",
     (sess.queue || []).length);
  ok((sess.queue || []).every((id) => /~2$/.test(id)), "every card dealt is the second template",
     sess.queue);

  /* ---- 6. BOTH DIRECTIONS TOGETHER (Aug 2026, on request: "I want them interleaved").
     Default off, so the day's new cards are all forward — template-major, the reverses waiting for the
     forward pass to finish. On, the gather is note-major: the day's new WORDS, each way, shuffled. Three
     silent failures: the gather not changing at all (the queue looks fine, it is just all one way), the
     shuffle missing (each word dealt immediately followed by its own reverse, which teaches the answer),
     and burying left on (it would take the reverse straight back out and halve the session). */
  /* Writing localStorage behind the app's back needs a REAL reload, or the next save() puts the in-memory
     state straight back over it — a goto that differs only in the #fragment is a same-document navigation
     and does not reload. This is the house gotcha; it cost two runs here. */
  const dirSeed = async (fn) => {
    await pg.evaluate(fn);
    await pg.reload({ waitUntil: "load" });
    await pg.waitForTimeout(500);
  };
  const dirStudy = async (sub) => {
    await pg.goto(base + "#decks", { waitUntil: "load" }); await pg.waitForTimeout(400);
    await pg.evaluate((s) => {
      const deck = [...document.querySelectorAll(".udeck")].find((e) => /Direction check/.test(e.textContent));
      [...deck.querySelectorAll(".udeck-subrow")]
        .find((e) => e.getAttribute("data-usubname") === s && e.getAttribute("data-usubtpl") === "-1").click();
    }, sub);
    await pg.waitForTimeout(700);
    return pg.evaluate(() => (JSON.parse(sessionStorage.getItem("folio_study_v1") || "{}").queue) || []);
  };
  await dirSeed(() => {                           // a clean slate: nothing studied, six new cards a day
    const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    S.cards = {}; S.buried = {}; S.settings = S.settings || {}; S.settings.newPerDay = 6;
    S.deckOpts = {}; localStorage.setItem("folio_v1", JSON.stringify(S));
  });
  const before = await dirStudy("Level 1");
  console.log("   default: " + JSON.stringify(before));
  ok(before.length === 6 && before.every((id) => !/~/.test(id)),
     "by default the day's new cards are all one direction", before);

  await dirSeed(() => {
    const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    S.cards = {}; S.buried = {};
    S.deckOpts = { "u:dir1": { pairNew: true } };      // set on the DECK — the levels must inherit it
    localStorage.setItem("folio_v1", JSON.stringify(S));
  });
  const after = await dirStudy("Level 1");
  console.log("   paired:  " + JSON.stringify(after));
  const notes = new Set(after.map((id) => id.split("~")[0]));
  ok(after.length === 6 && after.filter((id) => /~2$/.test(id)).length === 3 && notes.size === 3,
     "with pairing on it is the day's WORDS, each way — set on the deck and inherited by the level", after);
  // the unshuffled note-major order is exactly n1,n1~2,n2,n2~2,n3,n3~2 — a shuffle reproduces it once in
  // 720, which is the flake this trades for a test that cannot pass on a missing shuffle
  const flat = ["u_dir1_1", "u_dir1_1~2", "u_dir1_2", "u_dir1_2~2", "u_dir1_3", "u_dir1_3~2"].join(",");
  ok(after.join(",") !== flat, "…and shuffled, not each word beside its own reverse", after);

  /* BURYING IS DERIVED OFF, or the reverse would be taken straight back out and the session would be half
     what it promised. Grade the first card and its sibling must still be in the queue. */
  await pg.click("#reveal-btn", { timeout: 4000 }).catch(() => {});
  await pg.waitForTimeout(150);
  await pg.click(".grade.good", { timeout: 4000 }).catch(() => {});
  await pg.waitForTimeout(400);
  const left2 = await pg.evaluate(() => (JSON.parse(sessionStorage.getItem("folio_study_v1") || "{}").queue) || []);
  const sib = after[0].indexOf("~") < 0 ? after[0] + "~2" : after[0].split("~")[0];
  console.log("   after grading " + after[0] + ": " + JSON.stringify(left2));
  ok(left2.indexOf(sib) !== -1, "grading one direction does not bury the other", { sib, left: left2 });

  ok(!errs.length, "no page errors", errs.slice(0, 2));
  console.log(fails ? "\n✗ " + fails + " of " + checks + " failed" : "\n✓ all " + checks + " passed");
  await b.close(); server.close();
  process.exit(fails ? 1 : 0);
})();
