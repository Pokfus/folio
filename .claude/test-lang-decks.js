/* test-lang-decks.js — the Collections page's LANGUAGES section (Aug 2026, on request).

     NODE_PATH=<scratch>/node_modules node .claude/test-lang-decks.js
     FOLIO_CHROMIUM=<path to chrome>   if Chromium lives outside the playwright package

   Every failure this guards is SILENT, which is why it is a file rather than a few lines appended
   elsewhere.

   THE CATALOGUE GOING STALE IS THE WORST OF THEM and no browser can see it: `lang-decks.js` is
   metadata read off the deck files, so a deck rebuilt without regenerating it leaves a row claiming
   500 words over a deck that now holds 700 — which looks exactly like a row. The check is the deck
   generators' own discipline: re-running the build must reproduce the shipped file BYTE FOR BYTE.
   It costs about a second, because the build reads 119 MB and writes 9 KB.

   THE SECTION ITSELF fails silently three times over now that a language is a COLLECTION (Aug 2026,
   on request): a banner drawn with no hue looks like a design choice rather than a missing COLL_THEME
   key, a collection that lists nothing looks like a language with no decks, and an Add that fetches
   nothing looks like a slow connection. So the browser half counts the banners against the catalogue,
   reads each one's hue, icon and studied/total bar, opens one, reads a deck row's figures back against
   the catalogue, and then really adds the smallest deck there is and checks it arrives on the page.

   THE BANNER'S `+` IS ASSERTED IN BOTH DIRECTIONS, and this file used to assert its ABSENCE — a
   language banner deliberately carried none while Add meant DOWNLOAD, since pressing one would have
   fetched 21 MB of Mandarin. Add and Download are separate presses now (Aug 2026, on request), so the
   + adds the language's deck rows' own entries and nothing is fetched; what is asserted is that it
   reaches EVERY deck of that language, that a second press takes them all out again, and — the half a
   half-working control would still pass — that it lights up only when every one of them is in. */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
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

/* `langShortTitle` out of app.js, so the row-title expectation below is the SITE'S rule rather than a
   copy of it. Sliced by text the way test-daily-quote.js takes `quoteRunningOrder`; the assertion that
   the slice was found at all is what makes a rename fail loudly instead of quietly matching nothing. */
const APP_SRC = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const SHORT_SRC = (APP_SRC.match(/\n  function langShortTitle\(title, lang\) \{[\s\S]*?\n  \}\n/) || [])[0] || "";
let shortTitle = (t) => t;
try { shortTitle = new Function(SHORT_SRC + "\nreturn langShortTitle;")(); } catch (e) { /* reported below */ }
check("langShortTitle is still in app.js and runs", !!SHORT_SRC && shortTitle("DELE A1 \u2014 Spanish", "Spanish") === "DELE A1",
  SHORT_SRC ? shortTitle("DELE A1 \u2014 Spanish", "Spanish") : "not found");

/* ---------- 1. the catalogue, with no browser at all ---------- */
const CAT = path.join(ROOT, "lang-decks.js");
const shipped = fs.readFileSync(CAT, "utf8");
{
  /* Re-running the build must reproduce the shipped file exactly. It writes in place, so the shipped
     bytes are held here and put back whatever the outcome — a check must not leave the repo changed. */
  let rebuilt = "";
  try {
    execFileSync(process.execPath, [path.join(ROOT, ".claude", "build-lang-decks.js")], { cwd: ROOT, stdio: "pipe" });
    rebuilt = fs.readFileSync(CAT, "utf8");
  } finally { fs.writeFileSync(CAT, shipped); }
  check("the catalogue reproduces byte for byte from decks/", rebuilt === shipped,
    rebuilt === shipped ? "" : "rebuild differs — run `node .claude/build-lang-decks.js`");
}

global.window = {};
require(CAT);
const ROWS = window.LANG_DECKS || [];
check("it holds rows", ROWS.length > 0, String(ROWS.length) + " decks");

{
  const bad = ROWS.filter((r) => !r.lang || !r.file || !r.id || !r.title || !(r.cards > 0) || !(r.bytes > 0));
  check("every row names a language, a file, a deck id, a title, a card count and a size", !bad.length,
    bad.map((r) => r.file).join(", "));
  const ids = new Set(ROWS.map((r) => r.id));
  check("no two rows claim the same deck id", ids.size === ROWS.length, ROWS.length + " rows, " + ids.size + " ids");
  const missing = ROWS.filter((r) => !fs.existsSync(path.join(ROOT, "decks", r.file)));
  check("every row's file is on disk", !missing.length, missing.map((r) => r.file).join(", "));
  /* AND IN THE REPO. The catalogue is built by reading `decks/` off DISK, so a deck that is here and
     gitignored is one the shelf offers and the deployed site cannot fetch — an Add button that 404s,
     on the live site only, seen by nobody but the reader who presses it. It happened once: the B1
     German deck was ignored as a build artefact and then catalogued when it was asked for by name. */
  let ignored = [];
  try {
    const out = execFileSync("git", ["check-ignore", "--"].concat(ROWS.map((r) => "decks/" + r.file)),
      { cwd: ROOT, encoding: "utf8" });
    ignored = out.split("\n").filter(Boolean);
  } catch (e) { /* git exits 1 when nothing is ignored, which is the answer we want */ }
  check("no catalogued deck is gitignored", !ignored.length, ignored.join(", "));
  /* CARDS AND NOT NOTES. A deck may ask a word both ways from ONE note by giving its type two
     templates, so a count of rows is half the pile a reader studies — and the figure on the row is
     the one they will meet. Checked on a deck whose type is known to carry two. */
  const two = ROWS.filter((r) => r.cards === r.notes * 2);
  check("some decks count two cards per note (the both-directions shape)", two.length > 0, two.length + " of " + ROWS.length);
}

/* ---------- 2. the section on the page ---------- */
(async () => {
  await new Promise((r) => server.listen(5661, r));
  const base = "http://localhost:5661/";
  const browser = await chromium.launch(LAUNCH);
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  ctx.on("weberror", (e) => errs.push(String(e.error())));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errs.push(String(e)));

  await page.goto(base + "#decks", { waitUntil: "load" });
  await page.waitForTimeout(1200);

  const sec = await page.evaluate(() => {
    const s = document.querySelector("#langDecks");
    if (!s) return null;
    return {
      label: (s.querySelector(".group-label") || {}).textContent || "",
      count: (s.querySelector(".group-count") || {}).textContent || "",
      intro: (s.querySelector(".udeck-intro") || {}).textContent || "",
      colls: [...s.querySelectorAll(".lang-coll")].map((c) => {
        const row = c.querySelector(".collection-row");
        return {
          id: c.dataset.langcoll || "",
          title: (c.querySelector(".collection-title") || {}).textContent || "",
          span: (c.querySelector(".collection-span") || {}).textContent || "",
          bar: (c.querySelector(".deck-prog .xp-count") || {}).textContent || "",
          hue: row ? getComputedStyle(row).getPropertyValue("--coll-bg").trim() : "",
          deco: !!c.querySelector(".collection-deco"),
          icon: !!c.querySelector(".coll-ic svg path"),
          chev: !!c.querySelector(".collection-actions > .chev"),
          plus: !!c.querySelector(".collection-add"),
          open: c.querySelector(".node-children").classList.contains("open"),
          rows: c.querySelectorAll(".node.lang-deck").length,
        };
      }),
    };
  });
  check("the Collections page carries a Languages section", !!sec);
  const langs = [...new Set(ROWS.map((r) => r.lang))];
  /* HOW MANY ROWS A LANGUAGE DRAWS IS NOT HOW MANY DECK FILES IT HAS (Aug 2026, on request: "The
     Mandarin Chinese collection should only contain its nine subdecks … i.e. unwrap them", and "for
     indonesian, unwrap 'Indonesian Phrases and Expressions'"). A deck the catalogue marks `flat`
     contributes its top-level subdecks as the language's own decks and draws no row for the file, so
     the expectation is DERIVED from the same catalogue flag the page reads rather than being a count
     of files — which is the whole point of the flag being in the catalogue. */
  const topRows = (lang) => ROWS.filter((r) => r.lang === lang)
    .reduce((n, r) => n + (r.flat && r.tree && r.tree.length ? r.tree.length : 1), 0);
  if (sec) {
    check("…headed Languages", sec.label === "Languages", sec.label);
    /* COUNTING LANGUAGES, not decks. The section holds one collection per language exactly as the
       Collections group above it holds one banner per subject, and the figure beside a group head is
       how many rows are under it. */
    check("…counting the languages, one collection each", sec.count === String(langs.length),
      sec.count + " vs " + langs.length);
    check("…and drawing one collection per language", sec.colls.length === langs.length,
      sec.colls.map((c) => c.title).join(", "));
    check("…titled by the language", sec.colls.map((c) => c.title).join("|") === langs.join("|"),
      sec.colls.map((c) => c.title).join("|"));
    check("…each saying how many decks it holds", sec.colls.every((c) =>
      c.span === topRows(c.title) + (topRows(c.title) === 1 ? " deck" : " decks")),
      sec.colls.map((c) => c.title + ":" + c.span).join(" "));

    /* THE BANNER IS THE CURATED ONE. Each of these is a thing a history collection's banner has, and
       each is invisible when it goes: a missing hue reads as a design choice, a missing icon as a
       collection nobody drew a mark for, a missing bar as a collection with no cards. */
    check("…drawn with the curated banner's wash", sec.colls.every((c) => c.deco));
    check("…and its subject icon", sec.colls.every((c) => c.icon));
    check("…and its studied/total bar", sec.colls.every((c) => /cards$/.test(c.bar)),
      sec.colls.map((c) => c.bar).join(" | "));
    /* THE DENOMINATOR IS THE CATALOGUE'S, which is the honest figure for a deck that is not on the
       device yet: an untouched language reads 0 of 23,666 rather than 0 of 0. */
    check("…whose total is the language's own card count", sec.colls.every((c) => {
      const want = ROWS.filter((r) => r.lang === c.title).reduce((n, r) => n + r.cards, 0);
      return c.bar.split("/")[1].replace(/[^\d]/g, "") === String(want);
    }), sec.colls.map((c) => c.title + ":" + c.bar).join(" | "));

    /* EVERY BANNER CARRIES A HUE AND NO TWO SHARE ONE — the whole point of measuring them. A language
       with no COLL_THEME key renders with no wash at all, which looks deliberate. */
    check("…each with a hue of its own", sec.colls.every((c) => /^#[0-9A-Fa-f]{6}$/.test(c.hue)),
      sec.colls.map((c) => c.title + ":" + (c.hue || "—")).join(" "));
    check("…and no two the same", new Set(sec.colls.map((c) => c.hue)).size === sec.colls.length,
      sec.colls.map((c) => c.hue).join(" "));

    /* SHUT, and the rows still THERE. Flat this is 38 rows on a page whose subject is the curated
       collections; the two are asserted together because a collection that is shut and empty looks
       identical to one that is shut and full. */
    check("…all shut", sec.colls.every((c) => !c.open));
    check("…and full all the same", sec.colls.every((c) => c.rows > 0),
      sec.colls.map((c) => c.title + ":" + c.rows).join(" "));
    /* `.node.lang-deck` is the TOP-LEVEL row and `.node.lang-sub` a nested one, which is what keeps this
       tally honest: without the distinction Spanish would count its seven levels and their fourteen
       direction rows as twenty-one decks. */
    check("…each holding exactly its own decks", sec.colls.every((c) => c.rows === topRows(c.title)),
      sec.colls.map((c) => c.title + ":" + c.rows + " vs " + topRows(c.title)).join(" "));

    /* AND A COLLECTION-LEVEL + ON EVERY ONE (Aug 2026, on request: "language collections should be
       able to be added as one complete package, the same way as History collections"). This assertion
       used to run the other way — the banner deliberately carried none, because Add meant DOWNLOAD and
       there is no study scope for "several community decks" — and BOTH halves of that reasoning have
       since gone: Add and Download were split, so the + costs nothing to press, and it adds the deck
       rows' own ENTRIES rather than minting a scope of its own. Section 3b asserts the behaviour. */
    check("…and a + on every one of them", sec.colls.every((c) => c.plus),
      sec.colls.map((c) => c.title + ":" + (c.plus ? "+" : "—")).join(" "));
    check("…while every one can be opened", sec.colls.every((c) => c.chev));

    /* AND NO PARAGRAPH SAYING ADD DOWNLOADS, because it no longer does (Aug 2026, on request: "Adding a
       deck from the collections page shouldn't download anything; it should merely move the decks to the
       active decks list, where a download button in the banner (with file size) can be clicked").  The
       line used to promise a fetch and would now be telling the reader something untrue; the curated
       collections carry no such paragraph either, which is the parity this shelf is held to. Section 3
       asserts the behaviour itself. */
    check("…and no paragraph claiming Add downloads a deck", !/download/i.test(sec.intro),
      sec.intro.slice(0, 70) || "(no intro)");
  }

  /* THE CHEVRON REALLY OPENS IT, which the shut-and-full pair above cannot show: those rows are in the
     DOM either way, and a fold whose height never changes is a collection nobody can read. */
  const opened = await page.evaluate(() => {
    const c = document.querySelector(".lang-coll");
    const before = c.querySelector(".node-children").getBoundingClientRect().height;
    c.querySelector(".collection-actions > .chev").click();
    return { before, after: c.querySelector(".node-children").getBoundingClientRect().height };
  });
  await page.waitForTimeout(500);
  const openedNow = await page.evaluate(() =>
    document.querySelector(".lang-coll .node-children").getBoundingClientRect().height);
  check("the chevron opens a language", opened.before === 0 && openedNow > 100,
    opened.before + " → " + Math.round(openedNow));

  /* A row's figures come from the catalogue rather than from anywhere else. It takes the first deck that
     is neither FLAT nor foldable, because the "not itself pressable" assertion below is only true of one:
     a deck with subdecks is a fold and is deliberately pressable, and a flat deck draws no row of its own
     at all. Rows are found by their + button's ENTRY id — `data-id`, the curated tree's own attribute —
     since the shelf's rows are now the curated `.node` in every respect (Aug 2026). */
  const plain = ROWS.find((r) => !(r.tree && r.tree.length)) || ROWS[0];
  const row = await page.evaluate((entry) => {
    const b = document.querySelector('#langDecks .node-add[data-id="' + entry + '"]');
    if (!b) return null;
    const el = b.closest(".node");
    return { title: (el.querySelector(".node-title") || {}).textContent || "",
             count: (el.querySelector(".node-count") || {}).textContent || "",
             size: (el.querySelector(".node-size") || {}).textContent || "",
             sizeTitle: (el.querySelector(".node-size") || {}).getAttribute
               ? el.querySelector(".node-size").getAttribute("title") : "",
             num: (el.querySelector(".node-num") || {}).textContent || "",
             /* THE FIGURES ARE ON A LINE OF THEIR OWN, UNDER THE TITLE (Aug 2026, on request: "language
                decks should say the card number and file size below their title, the same way history
                decks do"). They used to share the title's line and WRAP when they would not fit, so the
                same shelf read differently at different widths and neither could be pointed at as "the
                way the other one does it" — which is why both halves are asserted: that the figures are
                inside `.node-meta`, AND that the title's own line carries neither of them. */
             meta: !!el.querySelector(".node-meta"),
             metaHasFigures: !!(el.querySelector(".node-meta .node-count") && el.querySelector(".node-meta .node-size")),
             titleRowClean: !el.querySelector(".node-title-row .node-count") && !el.querySelector(".node-title-row .node-size"),
             /* THE DECK ROW IS THE CURATED TREE'S `.node` (Aug 2026, on request), so it is the same box
                as a collection's decks one section up — but it is NOT a button, since there is nothing
                to study until it has been added and downloaded, and a row click would mean a 21 MB
                download off a stray tap. */
             isNode: el.classList.contains("node"),
             pressable: el.getAttribute("role") === "button" || el.hasAttribute("tabindex") };
  }, "u:" + plain.id);
  check("a row is drawn for a plain deck in the catalogue", !!row, plain.title);
  if (row) {
    check("…in the curated tree's own row shape", row.isNode);
    check("…and not itself pressable", !row.pressable);
    check("…numbered like a curated deck", /^\d\d$/.test(row.num.trim()), row.num);
    /* THE TITLE IS THE CATALOGUE'S WITH THE LANGUAGE TRIMMED OFF (Aug 2026, on request: "language decks
       do not need to name the language in their title, since its already mentioned in the collection
       name"). The expectation is the SITE'S OWN `langShortTitle`, sliced out of app.js and run here, for
       the reason a label is never written into a test: a literal pins the wording of the day it was
       written rather than the rule, and this one would go stale the first time the trim is refined. Both
       halves are asserted, since a trim that stopped firing and one that ate the whole title look
       identical from one side. */
    check("…titled from the catalogue, without the language", row.title === shortTitle(plain.title, plain.lang),
      row.title + " vs " + shortTitle(plain.title, plain.lang));
    check("…and still saying something", row.title.trim().length > 0, row.title);
    check("…and stating its card count", row.count.replace(/[^\d]/g, "") === String(plain.cards), row.count);
    /* THE FIGURE IS THE BYTES AND NOTHING ELSE, on BOTH shelves, which is the request's own "one fact in
       one place on both" — what differs between them is what the figure MEANS, and that is in the title
       where it belongs rather than appended to every row. */
    check("…and how big it is", /^[\d.,]+ (KB|MB)$/.test(row.size.trim()), row.size);
    check("…with the title saying it is a download", /download/i.test(row.sizeTitle || ""), row.sizeTitle);
    check("…on a line of their own below the title", row.meta && row.metaHasFigures);
    check("…and not on the title's line", row.titleRowClean);
  }

  /* ---------- 2b. a deck's own decks, and the size on the curated shelf ----------
     Aug 2026, on request: "when I open the Mandarin Chinese collection, I should see the 9 decks inside
     it, and any subdecks if there are, displayed in the same way as History decks and subdecks. But make
     it so that both Language decks and now also History decks mention the file size to download."

     Both halves fail SILENTLY. A deck whose subdecks are never drawn looks exactly like a deck that has
     none — the catalogue is the only thing that knows, and a reader deciding whether to fetch 21 MB has
     no other way to find out what is in it. A size that stops rendering looks like a deck nobody measured.
     So the rows are asserted against the CATALOGUE rather than against a number written down here.

     A FLAT deck is excluded: its subdecks ARE the language's rows and there is no fold to look inside,
     which section 2c asserts instead. */
  const withSubs = ROWS.filter((r) => Array.isArray(r.tree) && r.tree.length && !r.flat);
  const leaves = ROWS.filter((r) => !r.tree || !r.tree.length);
  check("the catalogue carries at least one wrapped deck with subdecks", withSubs.length > 0, String(withSubs.length));
  if (withSubs.length) {
    // the deepest tree there is, so a nested subdeck is exercised wherever one exists
    const countAll = (l) => l.reduce((n, x) => n + 1 + (x.k ? countAll(x.k) : 0), 0);
    const target = withSubs.slice().sort((a, b) => countAll(b.tree) - countAll(a.tree))[0];
    const want = countAll(target.tree);
    const titles = [];
    (function walk(l) { l.forEach((x) => { titles.push(x.n); if (x.k) walk(x.k); }); })(target.tree);
    const sub = await page.evaluate((entry) => {
      const b = document.querySelector('#langDecks .node-add[data-id="' + entry + '"]');
      if (!b) return null;
      const g = b.closest(".node-group");
      if (!g) return { group: false };
      const row = g.querySelector(":scope > .node.branch");
      return {
        group: true,
        branch: !!row,
        chev: !!(row && row.querySelector(":scope > .chev")),
        rows: g.querySelectorAll(".node.lang-sub").length,
        titles: [...g.querySelectorAll(".node.lang-sub .node-title")].map((e) => e.textContent),
        // a subdeck row must not claim to BE a deck — the collection's own deck tally counts .lang-deck
        alsoDeck: [...g.querySelectorAll(".node.lang-sub")].some((e) => e.classList.contains("lang-deck")),
        add: !!g.querySelector(".node.lang-sub .node-add[data-id]"),
      };
    }, "u:" + target.id);
    check("a deck with subdecks is drawn as a fold", !!sub && sub.group && sub.branch, target.title);
    if (sub && sub.group) {
      check("…with a chevron of its own", sub.chev);
      check("…holding every node the catalogue names", sub.rows === want, sub.rows + " vs " + want);
      check("…titled from the catalogue", sub.titles.join("|") === titles.join("|"), sub.titles.join("|"));
      /* A subdeck row is NOT a deck row: the collection's deck tally counts `.node.lang-deck`, so a
         subdeck wearing that class would make every language claim more decks than it has. */
      check("…and a subdeck is not counted as a deck", !sub.alsoDeck);
      /* AND IT DOES CARRY AN ADD, which is the reverse of what it was before Aug 2026 and follows from
         Add no longer downloading: adding is now writing an entry into `S.active`, and a subdeck entry
         is a study scope like any other — it is how a reader takes one HSK level rather than nine. The
         file is still fetched whole, once, from the Download button in Daily study. */
      check("…and offers Add on a subdeck too", sub.add);
    }
    /* THE FOLD REALLY OPENS, which the count above cannot show: the rows are in the DOM either way, and
       a fold whose height never changes is a deck nobody can look inside. */
    const dfold = await page.evaluate(async (entry) => {
      const b = document.querySelector('#langDecks .node-add[data-id="' + entry + '"]');
      const coll = b.closest(".lang-coll");
      if (!coll.querySelector(":scope > .node-children").classList.contains("open"))
        coll.querySelector(":scope > .collection-row > .collection-actions > .chev").click();
      await new Promise((r) => setTimeout(r, 600));
      const g = b.closest(".node-group");
      const kids = [...g.children].find((c) => c.classList.contains("node-children"));
      const before = kids.getBoundingClientRect().height;
      g.querySelector(":scope > .node.branch > .chev").click();
      await new Promise((r) => setTimeout(r, 700));
      return { before, after: kids.getBoundingClientRect().height };
    }, "u:" + target.id);
    check("…and its chevron opens it", dfold.before === 0 && dfold.after > 60,
      dfold.before + " → " + Math.round(dfold.after));
  }
  if (leaves.length) {
    const none = await page.evaluate((entry) => {
      const b = document.querySelector('#langDecks .node-add[data-id="' + entry + '"]');
      return b ? { group: !!b.closest(".node-group"), chev: !!b.closest(".node").querySelector(".chev") } : null;
    }, "u:" + leaves[0].id);
    /* A deck with nothing inside it stays the flat row it has always been — a chevron over an empty fold
       is a control that answers a press by doing nothing. */
    check("a deck with no subdecks stays a flat row", !!none && !none.group && !none.chev, leaves[0].title);
  }

  /* ---------- 2c. UNWRAPPING ----------
     Aug 2026, on request. A deck the catalogue marks `flat` puts its top-level subdecks on the shelf as
     the language's own decks and draws NO row for the file — so Mandarin lists its nine levels rather
     than one folder called "Mandarin Chinese — HSK 3.0, phrases and idioms".

     BOTH HALVES ARE ASSERTED because they fail in opposite directions and either alone looks deliberate:
     a shelf that still wraps looks like a fold nobody opened, and one that unwraps a DIRECTION PAIR would
     put fourteen identical "Spanish → English" rows on the Spanish shelf with nothing to say which level
     each belongs to. */
  const flats = ROWS.filter((r) => r.flat && r.tree && r.tree.length);
  check("the catalogue marks at least one deck for unwrapping", flats.length > 0,
    flats.map((r) => r.id).join(", "));
  if (flats.length) {
    const f = flats[0];
    const un = await page.evaluate((o) => {
      const coll = [...document.querySelectorAll("#langDecks .lang-coll")]
        .find((c) => (c.querySelector(".collection-title") || {}).textContent === o.lang);
      if (!coll) return null;
      const tops = [...coll.querySelectorAll(".node.lang-deck")]
        .filter((e) => e.closest(".node-children") === coll.querySelector(":scope > .node-children"));
      return {
        wrapper: !!coll.querySelector('.node-add[data-id="u:' + o.id + '"]'),
        titles: [...coll.querySelectorAll(":scope > .node-children .node.lang-deck .node-title")].map((e) => e.textContent),
        subEntries: [...coll.querySelectorAll(".node-add[data-id]")].map((e) => e.dataset.id)
          .filter((x) => x.indexOf("u:" + o.id + "/") === 0).length,
      };
    }, { lang: f.lang, id: f.id });
    check("…and the file itself draws no row", !!un && !un.wrapper, f.title);
    check("…while every one of its subdecks does", !!un && un.subEntries === f.tree.length,
      un ? un.subEntries + " vs " + f.tree.length : "no collection");
    check("…titled by the subdeck rather than the file",
      !!un && f.tree.every((n) => un.titles.indexOf(n.n) >= 0), un ? un.titles.join("|") : "");
  }
  /* AND A DIRECTION PAIR STAYS WRAPPED, which is what stops the rule running away with the Spanish shelf.
     The catalogue decides it (see `.claude/build-lang-decks.js`); this asserts the outcome. */
  const paired = ROWS.filter((r) => r.tree && r.tree.some((n) => n.n.indexOf("→") >= 0));
  check("a deck whose subdecks are DIRECTIONS is not unwrapped",
    paired.length > 0 && paired.every((r) => !r.flat),
    paired.length ? paired.map((r) => r.id + (r.flat ? "!" : "")).join(" ") : "none in catalogue");

  /* The other half of the request: the curated shelf says it too. A curated deck has no file of its own,
     so the figure is what its cards weigh inside data.js — read off the page and required to be a real
     size rather than merely present, since "0 KB" is what a broken measurement looks like. */
  const cur = await page.evaluate(() => {
    const rows = [...document.querySelectorAll(".collection:not(.lang-coll) .node")];
    const sized = rows.filter((r) => r.querySelector(":scope .node-size"));
    const counted = rows.filter((r) => r.querySelector(":scope .node-count"));
    return {
      rows: rows.length, counted: counted.length, sized: sized.length,
      texts: sized.slice(0, 4).map((r) => r.querySelector(".node-size").textContent),
      allReal: sized.every((r) => /^[\d.,]+ (KB|MB)$/.test(r.querySelector(".node-size").textContent.trim())),
      titled: sized.every((r) => /download/i.test(r.querySelector(".node-size").getAttribute("title") || "")),
      /* The same `.node-meta` line the language shelf draws — the request is that the two shelves set
         their figures alike, so it is asserted on BOTH or a divergence would show on one of them only. */
      meta: counted.every((r) => r.querySelector(":scope > .node-main > .node-meta > .node-count")),
      titleRowClean: counted.every((r) => !r.querySelector(".node-title-row .node-count") && !r.querySelector(".node-title-row .node-size")),
    };
  });
  check("the curated shelf draws deck rows at all", cur.rows > 0, String(cur.rows));
  /* EVERY ROW THAT STATES A CARD COUNT STATES A SIZE, and no other — an empty deck has nothing to weigh
     and "0 KB" beside "Empty" would be a second way of saying the same nothing. */
  check("…and every one holding cards says how much they weigh", cur.sized === cur.counted,
    cur.sized + " sized vs " + cur.counted + " counted");
  check("…as a real figure", cur.allReal, cur.texts.join(" | "));
  /* AND SAYS WHAT THE FIGURE IS. These cards arrive with the site, so a bare size beside a language
     deck's would say nothing about the difference between them. */
  check("…explaining that curated cards ship with the site", cur.titled);
  check("…with the figures on their own line under the title", cur.meta);
  check("…and the title's line carrying neither", cur.titleRowClean);

  /* ---------- 3. Add adds and NOTHING is downloaded ----------
     Aug 2026, on request: "Adding a deck from the collections page shouldn't download anything; it should
     merely move the decks to the active decks list, where a download button in the banner (with file
     size) can be clicked to download the deck's cards."

     THE SPLIT IS THE WHOLE POINT AND IT IS WHY THE DECKS REACH A SECOND DEVICE AT ALL: `S.active` rides in
     the synced progress blob and the cards live in this device's own IndexedDB, so a deck added on a phone
     arrives on a laptop as an entry with nothing behind it — and the Download button is the one control
     that can do anything about that. Both halves are asserted, since a press that silently fetched 21 MB
     and a press that did nothing at all look identical on the Collections page. */
  const small = ROWS.slice().sort((a, b) => a.bytes - b.bytes)[0];
  const smallEntry = small.flat && small.tree && small.tree.length
    ? "u:" + small.id + "/" + encodeURIComponent(small.tree[0].n)
    : "u:" + small.id;
  const fetches = [];
  page.on("request", (r) => { if (/\/decks\//.test(r.url())) fetches.push(r.url().split("/").pop()); });
  await page.evaluate((entry) => {
    const el = document.querySelector('#langDecks .node-add[data-id="' + entry + '"]');
    if (!el) return;
    // its collection may be a different one from the one opened above, so open that too before pressing
    const coll = el.closest(".lang-coll");
    const kids = coll.querySelector(".node-children");
    if (!kids.classList.contains("open")) coll.querySelector(".collection-actions > .chev").click();
    el.click();
  }, smallEntry);
  await page.waitForTimeout(1500);
  const added = await page.evaluate((entry) => ({
    active: (JSON.parse(localStorage.getItem("folio_v1") || "{}").active || []).indexOf(entry) >= 0,
    marked: !!document.querySelector('#langDecks .node-add.added[data-id="' + entry + '"]'),
  }), smallEntry);
  check("pressing + puts the deck in the daily study", added.active, smallEntry);
  check("…and the row says so", added.marked);
  check("…and fetches nothing at all", fetches.length === 0, fetches.join(", ") || "no requests");

  /* THE HOME ROW, which is where the cards are actually asked for. A pending deck gets ONE row whichever
     of its entries the reader happens to hold — nine "Level" rows each offering to download the same
     21 MB file would be nine answers to one question — and it carries no counts and no bar, there being
     nothing to study yet. */
  await page.goto(base + "#home", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  const pend = await page.evaluate(() => {
    const els = [...document.querySelectorAll(".active-deck[data-pending]")];
    return els.map((e) => ({
      deck: e.dataset.pending,
      title: (e.querySelector(".dk-title") || {}).textContent || "",
      sup: (e.querySelector(".dk-sup") || {}).textContent || "",
      dl: (e.querySelector("[data-langdl]") || {}).textContent || "",
      counts: !!e.querySelector(".dk-counts"),
      review: e.hasAttribute("data-review"),
      parent: e.dataset.parent || "",
      ctxTitle: ((document.querySelector('.active-deck[data-drag="' + (e.dataset.parent || "\u0000") + '"] .dk-title') || {}).textContent) || "",
    }));
  });
  check("a deck that is not on this device draws a row in Daily study", pend.length === 1,
    JSON.stringify(pend));
  if (pend.length === 1) {
    /* IT IS DRAWN UNDER ITS LANGUAGE, like every other row of that language (Aug 2026, on request:
       "they should still automatically appear grouped together in the active decks list under their
       respective collection"), so the two halves of its name are on two rows: the container states the
       language and the row states the rest. Both are asserted, since a row that had fallen out of its
       container would keep the full title and read as perfectly correct on its own. */
    check("…drawn under its own language rather than loose in the list",
      /^langctx:/.test(pend[0].parent) && pend[0].ctxTitle === small.lang,
      pend[0].parent + " → " + pend[0].ctxTitle);
    check("…named after the deck file it will fetch, less the language above it",
      pend[0].title && small.title.indexOf(pend[0].title) >= 0 &&
      pend[0].title.indexOf(small.lang) < 0, pend[0].title);
    check("…saying it is not here yet", /not on this device/i.test(pend[0].sup), pend[0].sup);
    /* THE SIZE IS ON THE BUTTON, which is the request's own wording ("a download button in the banner
       (with file size)"): a reader about to spend 21 MB is told so on the control that spends it. */
    check("…and offering Download with the file size",
      /^Download [\d.,]+ (KB|MB)$/.test(pend[0].dl.trim()), pend[0].dl);
    check("…with no counts and nothing to study", !pend[0].counts && !pend[0].review);
  }

  /* AND THE BUTTON REALLY FETCHES, once, and the row becomes the deck. This is the assertion the whole
     split rests on: without it a Download button that quietly did nothing would look exactly like a deck
     whose cards had not finished arriving. */
  fetches.length = 0;
  await page.evaluate(() => {
    const b = document.querySelector("[data-langdl]");
    if (b) b.click();
  });
  await page.waitForTimeout(8000);
  const landed = await page.evaluate(() => ({
    pending: document.querySelectorAll(".active-deck[data-pending]").length,
    rows: [...document.querySelectorAll(".active-deck")].map((e) => (e.querySelector(".dk-title") || {}).textContent || ""),
  }));
  check("Download fetches the deck file", fetches.length === 1, fetches.join(", ") || "nothing fetched");
  check("…exactly the one the row named", fetches[0] === small.file, fetches[0] || "—");
  check("…and the pending row becomes the deck", landed.pending === 0, JSON.stringify(landed.rows));

  /* ---------- 3b. the collection-level + ----------
     Aug 2026, on request: "language collections should be able to be added as one complete package, the
     same way as History collections."

     IT REACHES EVERY DECK OF THE LANGUAGE, which is the only thing worth asserting: a + that added the
     first row, or the file rather than its unwrapped subdecks, would light up and look exactly like one
     that worked. The expectation is derived from the CATALOGUE (the same `flat` flag the page reads), so
     a deck that starts or stops being unwrapped changes what is expected here without anybody
     remembering to. A language other than the one section 3 just added is used, so the press starts from
     a language wholly out of the review and the before/after counts mean something. */
  await page.goto(base + "#decks", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  const target = [...new Set(ROWS.map((r) => r.lang))].find((l) => l !== small.lang) || small.lang;
  const wantEntries = ROWS.filter((r) => r.lang === target).reduce((a, r) => a.concat(
    r.flat && r.tree && r.tree.length
      ? r.tree.map((n) => "u:" + r.id + "/" + encodeURIComponent(n.n))
      : ["u:" + r.id]), []);
  const bannerFetches = [];
  page.removeAllListeners("request");
  page.on("request", (r) => { if (/\/decks\//.test(r.url())) bannerFetches.push(r.url().split("/").pop()); });
  const press = async () => {
    await page.evaluate((lang) => {
      const c = [...document.querySelectorAll("#langDecks .lang-coll")]
        .find((x) => (x.querySelector(".collection-title") || {}).textContent === lang);
      if (c) c.querySelector(".collection-add").click();
    }, target);
    await page.waitForTimeout(700);
    return page.evaluate((lang) => {
      const c = [...document.querySelectorAll("#langDecks .lang-coll")]
        .find((x) => (x.querySelector(".collection-title") || {}).textContent === lang);
      return {
        active: JSON.parse(localStorage.getItem("folio_v1") || "{}").active || [],
        on: !!(c && c.querySelector(".collection-add.added")),
        rowsOn: c ? [...c.querySelectorAll(".node-add.added")].length : -1,
        rowsAll: c ? [...c.querySelectorAll(".node-add[data-id]")].length : -1,
      };
    }, target);
  };
  const on = await press();
  check("the banner + adds every deck of its language",
    wantEntries.every((e) => on.active.indexOf(e) >= 0),
    target + ": " + wantEntries.filter((e) => on.active.indexOf(e) < 0).join(", "));
  /* AND MARKS THEM. `refreshAddButtons` re-reads every + on the page after a press, so a row still
     offering to add a deck it already holds is what a missed sweep looks like. */
  check("…and marks every row under it", on.rowsOn === on.rowsAll, on.rowsOn + " of " + on.rowsAll);
  check("…lighting the banner itself", on.on);
  check("…while fetching nothing", bannerFetches.length === 0, bannerFetches.join(", ") || "no requests");
  const off = await press();
  check("…and a second press takes them all out again",
    wantEntries.every((e) => off.active.indexOf(e) < 0) && !off.on,
    off.active.filter((e) => wantEntries.indexOf(e) >= 0).join(", ") || "none left");

  check("no uncaught page errors", errs.length === 0, errs.join(" | "));

  console.log("");
  console.log(pass + " passed, " + fail + " failed");
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
