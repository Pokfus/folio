/* FOUR THINGS ASKED FOR IN AUG 2026, and every one of them fails SILENTLY.
   Run: NODE_PATH=<pw>/node_modules FOLIO_CHROMIUM=<chrome> node .claude/test-deck-ux.js
   Nothing here reaches into app.js: the deck is imported through the Studio's own file picker, the card is
   read off a REAL study session, and the sheet is opened the way a mouse opens it. A debug surface added
   for a test is a debug surface every reader downloads.

   · A CARD TYPE'S <details> REMEMBERS BEING OPEN. A restore that has stopped working looks exactly like a
     reader who never opened the panel — the card is right, nothing throws, and the only symptom is having
     to open it again on all twenty of the day's cards. Asserted across a real card change AND across a
     RELOAD, since the two fail differently: one is the in-memory map, the other is localStorage.
   · CLOSED IS REMEMBERED TOO, which is the half a "restore open" implementation gets wrong by falling back
     to the template — and a panel NEVER TOUCHED keeps the template's own default, which is the third state
     and the one that disappears if the stored map is read as a plain boolean rather than as "is there a
     value at all". All three are asserted, because each looks right from the other two's side.
   · THE STRUCTURE LINE IS SMALLER AND THINNER, measured against the sentence it annotates rather than
     against a hard-coded 9px: what was asked for is a relationship — a caption under the thing it
     describes — and a figure written into a test pins today's number instead of the rule.
   · A COMMUNITY DECK IS OFFERED A COLOUR, and the colour reaches the subdecks under it. Both halves: the
     inheritance already worked before this change, so asserting only the swatches would pass on a control
     that does nothing; and the row appearing is worthless if nothing downstream reads it.
   · EVERY SHEET HAS A ×, IT CLOSES, AND IT DOES NOT TAKE THE INITIAL FOCUS. That last is why deckSheet
     skips it when choosing what to focus; without the assertion a later tidy-up puts it back and every
     sheet opens with the ring on the way out. */
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml" };
const server = http.createServer((q, r) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]));
  fs.readFile(p, (e, b) => { if (e) { r.writeHead(404); r.end(); return; }
    r.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" }); r.end(b); });
});
let fails = 0, checks = 0;
const ok = (c, m, x) => { checks++; console.log((c ? "   ✓ " : "   ✗ ") + m + (x !== undefined ? "   " + JSON.stringify(x) : "")); if (!c) fails++; };

/* TWO <details> on the back, one shipped shut and one shipped OPEN. Two of them because the key is the
   SUMMARY's own text: with a single panel the test cannot tell "remembers THIS panel" from "remembers that
   a panel somewhere was open", and the shipped-open one is what pins the never-touched default.
   The structure line copies the Mandarin decks' own markup and CSS, so what is measured is the real rule
   rather than a stand-in for it. */
const TYPE_CSS = [
  ".uc-simp { font-size: 34px; }",
  ".uc-exz { font-size: 18px; font-weight: 500; }",
  ".uc-exst { margin-bottom: 4px; font-size: 9px; font-weight: 400; letter-spacing: 0.08em;",
  "  line-height: 1.45; text-transform: uppercase; color: var(--ink-faint, #6C6A63); }",
  ".uc-exst b { font-weight: 500; color: var(--zh, #C8453C); }",
].join("\n");

const BACK =
  '{{FrontSide}}<hr><div class="uc-field">{{English}}</div>' +
  '<details class="uc-ex"><summary>In a sentence</summary><div class="uc-exs">' +
    '<div class="uc-exi"><div class="uc-exst">PRONOUN + <b>VERB</b> + NOUN</div>' +
    '<div class="uc-exz">{{Example}}</div></div>' +
  "</div></details>" +
  '<details class="uc-ex2" open><summary>Notes</summary><div class="uc-nt">{{Notes}}</div></details>';

const deck = {
  folioDeck: 1,
  meta: {
    id: "uxprobe1", title: "UX probe deck", subtitle: "", desc: "", author: "", language: "en",
    tags: [], glossMode: "site", version: 1,
    createdAt: Date.parse("2026-08-14"), updatedAt: Date.parse("2026-08-14"), forkedFrom: null,
    types: { vt: {
      id: "vt", name: "Vocab", fields: ["Word", "English", "Example", "Notes"], css: TYPE_CSS,
      cards: [
        { name: "Forward", front: '<div class="uc-simp">{{Word}}</div>', back: BACK },
        { name: "Reverse", front: '<div class="uc-field">{{English}}</div>', back: BACK },
      ],
    } },
  },
  cards: Array.from({ length: 8 }, (_, i) => ({
    id: "u_uxprobe1_" + (i + 1), sub: i < 4 ? "Level 1" : "Level 2", type: "vt",
    fields: { Word: "词" + (i + 1), English: "meaning " + (i + 1),
              Example: "sentence " + (i + 1), Notes: "note " + (i + 1) },
  })),
  gloss: {},
};

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";
  const b = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const pg = await b.newPage();
  await pg.setViewportSize({ width: 1280, height: 900 });
  const errs = [];
  pg.on("pageerror", (e) => errs.push(String(e)));
  pg.on("console", (m) => { if (m.type() === "error" && !/ERR_CONNECTION/.test(m.text())) errs.push(m.text()); });

  const tmp = "/tmp/ux-probe.folio-deck.json";
  fs.writeFileSync(tmp, JSON.stringify(deck));

  await pg.goto(base + "#studio", { waitUntil: "load" });
  await pg.waitForTimeout(400);
  const ch = pg.waitForEvent("filechooser");
  await pg.click("#stImport");
  (await ch).setFiles(tmp);
  await pg.waitForSelector(".studio-deck", { timeout: 60000 });

  // add the deck (which brings its two levels) so the home page has rows to work with
  await pg.goto(base + "#decks", { waitUntil: "load" });
  await pg.waitForTimeout(500);
  /* THE INSTALLED DECK ID IS READ OFF THE PAGE, NEVER ASSUMED FROM THE FILE. An import mints a fresh id
     whenever the file's own is already taken — and, as this test found the hard way, whenever the file's
     own is not a legal id at all (`[a-z0-9]{4,16}`, so a 3-character one is silently replaced and every
     later assertion looks for a deck nobody installed). Everything below is keyed off what shipped. */
  const DECK = await pg.evaluate(() => {
    const d = [...document.querySelectorAll(".udeck")].find((e) => /UX probe deck/.test(e.textContent));
    const add = d && d.querySelector("[data-uadd]");
    if (add) add.click();
    return add ? add.getAttribute("data-uadd") : null;
  });
  await pg.waitForTimeout(400);
  console.log("   installed deck id: " + JSON.stringify(DECK));
  ok(!!DECK, "the probe deck installed and is on the Collections page", DECK);

  // …and a curated collection beside it, so the parity half of the colour check has a row to open
  const COLL = await pg.evaluate(() => {
    /* A CURATED collection's add button carries data-id, where one of the reader's own carries data-uadd
       — two markups for the same control, so the selector has to say which. And NO "coming soon" filter:
       a live collection is full of soon pills for its own empty subdecks (378 of them on this page), so
       excluding on one matches nothing. A coming-soon collection has no add button at all, which is
       already the whole of the test. */
    const add = document.querySelector(".collection-add[data-id]");
    if (add) add.click();
    return add ? add.getAttribute("data-id") : null;
  });
  await pg.waitForTimeout(500);
  console.log("   curated collection added: " + JSON.stringify(COLL));

  /* ---- 1. THE STRUCTURE LINE, off a real revealed card ---------------------------------------- */
  console.log("\n=== 1. the structure line is a caption, not a heading");
  const study = async () => {
    await pg.goto(base + "#decks", { waitUntil: "load" });
    await pg.waitForTimeout(400);
    await pg.evaluate(() => {
      const d = [...document.querySelectorAll(".udeck")].find((e) => /UX probe deck/.test(e.textContent));
      [...d.querySelectorAll(".udeck-subrow")].find((e) => e.getAttribute("data-usubtpl") === "-1").click();
    });
    await pg.waitForTimeout(700);
    await pg.click("#reveal-btn");
    await pg.waitForTimeout(400);
  };
  await study();

  const type = await pg.evaluate(() => {
    const st = document.querySelector(".uc-back .uc-exst") || document.querySelector(".uc-exst");
    const zh = document.querySelector(".uc-back .uc-exz") || document.querySelector(".uc-exz");
    const mk = st && st.querySelector("b");
    if (!st || !zh) return null;
    const g = (e) => getComputedStyle(e);
    return {
      structPx: parseFloat(g(st).fontSize), structWeight: parseInt(g(st).fontWeight, 10),
      sentPx: parseFloat(g(zh).fontSize), sentWeight: parseInt(g(zh).fontWeight, 10),
      markWeight: mk ? parseInt(g(mk).fontWeight, 10) : null,
    };
  });
  if (!type) ok(false, "the revealed card carries a structure line", type);
  else {
    ok(type.structPx < type.sentPx, "smaller than the sentence it annotates", type);
    ok(type.structWeight <= 400, "…and thin rather than bold", type.structWeight);
    ok(type.structWeight < type.sentWeight, "…thinner than that sentence too", type);
    ok(type.markWeight > type.structWeight,
      "…while the marked term keeps a weight of its own, so colour is not the only signal", type);
  }

  /* ---- 2. THE DISCLOSURE REMEMBERS ------------------------------------------------------------ */
  console.log("\n=== 2. a card type's <details> remembers how the reader left it");
  const panels = () => pg.evaluate(() => {
    const back = document.querySelector(".uc-back") || document;
    const one = back.querySelector("details.uc-ex"), two = back.querySelector("details.uc-ex2");
    return { one: one ? one.open : null, two: two ? two.open : null };
  });
  const toggle = async (cls) => {
    await pg.evaluate((c) => {
      const back = document.querySelector(".uc-back") || document;
      back.querySelector("details." + c).querySelector("summary").click();
    }, cls);
    await pg.waitForTimeout(150);
  };
  // move to the next card and reveal it, which is a fresh cardTypeSideHTML
  const nextCard = async () => {
    await pg.click(".grade.good");
    await pg.waitForTimeout(500);
    await pg.click("#reveal-btn");
    await pg.waitForTimeout(350);
  };

  const first = await panels();
  ok(first.one === false, "a panel the template ships SHUT opens shut on a first meeting", first);
  ok(first.two === true, "…and one it ships OPEN keeps the author's default", first);

  await toggle("uc-ex");
  await nextCard();
  const afterOpen = await panels();
  ok(afterOpen.one === true, "opening it is remembered on the NEXT card", afterOpen);
  ok(afterOpen.two === true, "…and the panel beside it is left exactly as it was", afterOpen);

  await toggle("uc-ex2");
  await nextCard();
  const afterClose = await panels();
  ok(afterClose.two === false, "closing a shipped-OPEN panel is remembered too", afterClose);
  ok(afterClose.one === true, "…and does not disturb the one already opened", afterClose);

  const stored = await pg.evaluate(() => localStorage.getItem("folio_uc_open_v1"));
  ok(!!stored && stored.indexOf(DECK + "__vt|In a sentence") >= 0 && stored.indexOf(DECK + "__vt|Notes") >= 0,
    "each panel is recorded under its own summary text, scoped to the card type", stored);

  console.log("\n=== 3. …and it survives a reload, which is the localStorage half");
  await study();
  const afterReload = await panels();
  ok(afterReload.one === true && afterReload.two === false,
    "both panels come back as the reader left them, in a new session after a reload", afterReload);

  await toggle("uc-ex");
  await nextCard();
  const reClosed = await panels();
  ok(reClosed.one === false, "closing it again is remembered — the switch works both ways", reClosed);

  /* ---- 4. A COMMUNITY DECK'S COLOUR ------------------------------------------------------------ */
  console.log("\n=== 4. a community deck can be given a colour, and it reaches the decks inside");
  await pg.goto(base + "#home", { waitUntil: "load" });
  await pg.waitForTimeout(600);

  const rowSel = async (entry) => pg.evaluate((e) => {
    const r = [...document.querySelectorAll(".active-deck[data-drag]")]
      .find((x) => decodeURIComponent(x.dataset.drag) === e);
    return !!r;
  }, entry);
  ok(await rowSel("u:" + DECK), "the deck has a row on the home page");

  // a right-click opens the same sheet a long press does — that is what gives a mouse its way in
  await pg.evaluate((deckId) => {
    const r = [...document.querySelectorAll(".active-deck[data-drag]")]
      .find((x) => decodeURIComponent(x.dataset.drag) === "u:" + deckId);
    r.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
  }, DECK);
  await pg.waitForTimeout(300);

  const sheet = await pg.evaluate(() => {
    const ov = document.querySelector(".deck-menu");
    if (!ov) return null;
    return {
      hasColour: !!ov.querySelector(".dm-colors"),
      swatches: ov.querySelectorAll(".dm-swatch").length,
      note: (ov.querySelector(".dm-colors small") || {}).textContent || "",
    };
  });
  ok(sheet && sheet.hasColour, "its options sheet offers a Colour, as a collection's does", sheet);
  ok(sheet && sheet.swatches >= 9, "…with the same palette and a default swatch", sheet && sheet.swatches);
  ok(sheet && /inside/.test(sheet.note),
    "…and the note promises what a deck WITH subdecks can keep", sheet && sheet.note);

  const applied = await pg.evaluate(async (deckId) => {
    const ov = document.querySelector(".deck-menu");
    [...ov.querySelectorAll(".dm-swatch")].find((s) => s.dataset.color === "#7A8A2E").click();
    await new Promise((r) => setTimeout(r, 300));
    const pick = (id) => {
      const el = [...document.querySelectorAll(".active-deck[data-drag]")]
        .find((r) => decodeURIComponent(r.dataset.drag) === id);
      return el ? getComputedStyle(el).getPropertyValue("--coll-bg").trim().toLowerCase() : null;
    };
    const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    return { stored: ((S.deckGroups || {})["u:" + deckId] || {}).color || "",
             deck: pick("u:" + deckId),
             sub1: pick("u:" + deckId + "/Level 1"), sub2: pick("u:" + deckId + "/Level 2") };
  }, DECK);
  ok(applied.stored.toLowerCase() === "#7a8a2e", "the colour is stored against the deck's own entry", applied);
  ok(applied.deck === "#7a8a2e", "the deck's row takes it", applied);
  ok(applied.sub1 === "#7a8a2e" && applied.sub2 === "#7a8a2e",
    "…and so does every subdeck under it — the whole point of setting it on the deck", applied);

  /* PARITY IS THE WHOLE REQUEST — "the same way they can with curated ones" — so the curated side is
     asserted too. A collection is the row a colour is inherited FROM on that side, exactly as the
     whole-deck row is on this one, and its note has to read the same. */
  const curated = await pg.evaluate(async (collId) => {
    const ov0 = document.querySelector(".deck-menu");
    if (ov0) ov0.querySelector(".dm-x").click();
    await new Promise((r) => setTimeout(r, 340));
    const row = [...document.querySelectorAll(".active-deck[data-drag]")]
      .find((x) => x.dataset.drag === collId);
    if (!row) return { skipped: true };
    row.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    await new Promise((r) => setTimeout(r, 260));
    const ov = document.querySelector(".deck-menu");
    const out = { id: row.dataset.drag, hasColour: !!ov.querySelector(".dm-colors"),
                  note: (ov.querySelector(".dm-colors small") || {}).textContent || "" };
    ov.querySelector(".dm-x").click();
    await new Promise((r) => setTimeout(r, 340));
    return out;
  }, COLL);
  ok(!curated.skipped, "a curated collection is on the home page to compare against", curated);
  ok(curated.hasColour, "a curated collection is offered the same Colour row — that is the parity asked for", curated);
  ok(/inside/.test(curated.note), "…worded the same way", curated);

  // re-open the deck's own sheet for the clear-and-× assertions below
  await pg.evaluate((deckId) => {
    const r = [...document.querySelectorAll(".active-deck[data-drag]")]
      .find((x) => decodeURIComponent(x.dataset.drag) === "u:" + deckId);
    r.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
  }, DECK);
  await pg.waitForTimeout(280);

  const cleared = await pg.evaluate(async (deckId) => {
    const ov = document.querySelector(".deck-menu");
    ov.querySelector(".dm-swatch-off").click();
    await new Promise((r) => setTimeout(r, 300));
    const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    const el = [...document.querySelectorAll(".active-deck[data-drag]")]
      .find((r) => decodeURIComponent(r.dataset.drag) === "u:" + deckId);
    return { stored: ((S.deckGroups || {})["u:" + deckId] || {}).color || "",
             row: el ? getComputedStyle(el).getPropertyValue("--coll-bg").trim() : "?" };
  }, DECK);
  ok(!cleared.stored, "the default swatch clears it again", cleared);

  /* ---- 5. THE × ------------------------------------------------------------------------------- */
  console.log("\n=== 5. every options sheet carries a × that closes it");
  const x = await pg.evaluate(() => {
    const ov = document.querySelector(".deck-menu");
    const btn = ov && ov.querySelector(".dm-x");
    if (!btn) return { present: false };
    const bb = btn.getBoundingClientRect(), box = ov.querySelector(".dm-box").getBoundingClientRect();
    /* NOT "right of the head" — `.dm-head` spans the whole box, so that is false by construction and
       says nothing. What matters is that the × does not sit ON the head's CONTENT: the title, and the
       studied count that shares its line. That is what the head's own right padding buys. */
    const hits = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return bb.left < r.right - 1 && bb.right > r.left + 1 && bb.top < r.bottom - 1 && bb.bottom > r.top + 1;
    };
    return {
      present: true, label: btn.getAttribute("aria-label"), isButton: btn.tagName === "BUTTON",
      topRight: (box.right - bb.right) < 22 && (bb.top - box.top) < 22,
      clearsTitle: !hits(ov.querySelector(".dm-title")) && !hits(ov.querySelector(".dm-studied")),
      sticky: getComputedStyle(btn).position === "sticky",
      focused: document.activeElement === btn,
      focusIsReal: !!(document.activeElement && document.activeElement.closest(".deck-menu")),
    };
  });
  ok(x.present, "the sheet has a ×", x);
  ok(x.isButton && x.label === "Close", "…a real button with an accessible name", x);
  ok(x.topRight, "…in the top right of the box", x);
  ok(x.clearsTitle, "…overlapping neither the title nor the studied count on its line", x);
  ok(x.sticky, "…sticky, so it stays put in the one sheet whose whole box scrolls", x);
  ok(!x.focused && x.focusIsReal,
    "…and it does NOT take the initial focus, which still lands inside the sheet", x);

  const closed = await pg.evaluate(async () => {
    document.querySelector(".deck-menu .dm-x").click();
    await new Promise((r) => setTimeout(r, 340));
    return !document.querySelector(".deck-menu");
  });
  ok(closed, "pressing it closes the sheet");

  // …and it is built by deckSheet, so it is on every sheet rather than on the one that asked for it
  const others = await pg.evaluate(async (deckId) => {
    const open = async (act) => {
      const r = [...document.querySelectorAll(".active-deck[data-drag]")]
        .find((x) => decodeURIComponent(x.dataset.drag) === "u:" + deckId);
      r.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
      await new Promise((s) => setTimeout(s, 220));
      const ov = document.querySelector(".deck-menu");
      const row = [...ov.querySelectorAll(".dm-item")].find((e) => e.dataset.act === act);
      if (!row) return "no row";
      row.click();
      await new Promise((s) => setTimeout(s, 260));
      const has = !!document.querySelector(".deck-menu .dm-x");
      const xb = document.querySelector(".deck-menu .dm-x");
      if (xb) xb.click();
      await new Promise((s) => setTimeout(s, 340));
      return has;
    };
    return { limits: await open("limits"), custom: await open("custom"), sched: await open("sched") };
  }, DECK);
  ok(others.limits === true && others.custom === true && others.sched === true,
    "…and so does every sheet it opens onto, because deckSheet builds it", others);

  console.log("\nconsole errors: " + errs.length + (errs.length ? " " + JSON.stringify(errs.slice(0, 3)) : ""));
  ok(errs.length === 0, "no console errors anywhere in the run", errs.slice(0, 3));

  await b.close();
  server.close();
  console.log("\n" + (checks - fails) + " passed, " + fails + " failed");
  process.exit(fails ? 1 : 0);
})();
