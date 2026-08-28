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
const { isNoise } = require("./test-noise.js");
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
  /* the real rule from deckcore.js: a covering face FIRST, because appending after var(--serif) puts a
     GENERIC in the middle of the list and the generic matches everything. */
  ".uc-pinyin { font-family: 'EB Garamond', var(--serif, Georgia, serif); font-size: 21px; }",
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
      id: "vt", name: "Vocab", fields: ["Word", "Pinyin", "English", "Example", "Notes"], css: TYPE_CSS,
      cards: [
        { name: "Forward", front: '<div class="uc-simp">{{Word}}</div><div class="uc-pinyin">{{Pinyin}}</div>', back: BACK },
        { name: "Reverse", front: '<div class="uc-field">{{English}}</div>', back: BACK },
      ],
    } },
  },
  cards: Array.from({ length: 8 }, (_, i) => ({
    id: "u_uxprobe1_" + (i + 1), sub: i < 4 ? "Level 1" : "Level 2", type: "vt",
    /* nǐ hǎo carries TWO of the ten characters Newsreader lacks — see deckcore.js. Both are third-tone
       carons, which is the class the bug was reported on. */
    fields: { Word: "词" + (i + 1), Pinyin: "nǐ hǎo " + (i + 1), English: "meaning " + (i + 1),
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
  pg.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });

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

  /* ---- 6. THE PINYIN IS SET IN A FACE THAT HAS THE THIRD TONE ----------------------------------
     Reported as "the letter ǒ appears larger than other pinyin letters". The card inherits the site's body
     serif and Newsreader — the default — has NONE of the ten pinyin characters at issue (ǎǐǒǔ, ǖǘǚǜ, ǹḿ;
     it does have ě, which is why one letter was named). Google Fonts declares its latin-ext face with a
     unicode-range that COVERS them, so the browser picks that face, finds nothing, and falls back per
     character to whatever last-resort font the operating system keeps.

     THE ASSERTION IS ABOUT THE ORDER OF THE CHAIN, and that is not fussiness — it is the fix that was tried
     first and did nothing. Appending a covering face after `var(--serif)` leaves a GENERIC family in the
     middle of the list (`--serif` ends in `serif`), and a generic matches every character, so the browser
     resolves the caron against the system default and never reaches the name after it. Measured on the
     rendered card at the time: identical ink height before and after. So what has to hold is that a
     covering face comes BEFORE any generic — which is a rule a screenshot cannot check and which no count
     of anything would notice, since the text is all present either way.

     It is deliberately network-free: this sandbox cannot reach Google Fonts, and a test that measured
     glyphs would pass or fail on that rather than on the CSS. The four covering families were measured
     once, in a browser, against every family the stylesheet imports — see deckcore.js. */
  console.log("\n=== 6. the pinyin is set in a face that has the third tone");
  {
    const COVERING = ["EB Garamond", "Cormorant Garamond", "Inter", "Noto Sans SC"];
    await study();
    await pg.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
    await pg.waitForTimeout(500);
    const pin = await pg.evaluate(() => {
      const el = [...document.querySelectorAll(".uc-pinyin")].pop();
      if (!el) return null;
      return { text: el.textContent.trim(), ff: getComputedStyle(el).fontFamily };
    });
    ok(!!pin && /[\u01ce\u01d0\u01d2\u01d4\u01d6\u01d8\u01da\u01dc\u01f9\u1e3f]/u.test(pin.text),
      "the card shows a reading with a third-tone caron in it", pin && pin.text);
    const fams = (pin ? pin.ff : "").split(",").map((x) => x.trim().replace(/^["']|["']$/g, ""));
    const iCover = fams.findIndex((f) => COVERING.indexOf(f) >= 0);
    const iGeneric = fams.findIndex((f) => ["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui"].indexOf(f) >= 0);
    ok(iCover >= 0, "…in a chain naming a face that actually has those glyphs", fams.join(" | "));
    /* the whole of the bug: a generic ahead of the covering face swallows the fallback */
    ok(iCover >= 0 && (iGeneric < 0 || iCover < iGeneric),
      "…and no generic family stands in front of it, which would swallow it", "cover@" + iCover + " generic@" + iGeneric);
  }

  /* ---- 7. …AND THE SHIPPED DECK FILES CARRY THE SAME RULE ---------------------------------------
     deckcore.js is the source and every built deck file carries a COPY, so an edit there does not reach a
     reader until the decks are rebuilt or patched. A fixture proves the rule; only the files prove that the
     decks people actually study got it. */
  console.log("\n=== 7. the shipped Mandarin decks carry it too");
  {
    const dir = path.join(ROOT, "decks");
    const files = fs.readdirSync(dir).filter((f) => /Mandarin/.test(f));
    ok(files.length > 0, "there are Mandarin decks to check", files.length);
    for (const f of files) {
      const types = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")).meta.types;
      const css = types[Object.keys(types)[0]].css;
      const runs = ["uc-pinyin", "uc-mwp", "uc-ptp"];
      const bad = runs.filter((sel) => {
        const i = css.indexOf("." + sel + " {");
        if (i < 0) return true;
        const rule = css.slice(i, css.indexOf("}", i));
        const m = /font-family:\s*([^;]+)/.exec(rule);
        if (!m) return true;
        const list = m[1].split(",").map((x) => x.trim().replace(/^["']|["']$/g, ""));
        const c = list.findIndex((x) => ["EB Garamond", "Cormorant Garamond", "Inter", "Noto Sans SC"].indexOf(x) >= 0);
        const g = list.findIndex((x) => /^(serif|sans-serif|monospace)$/.test(x));
        return c < 0 || (g >= 0 && g < c);
      });
      ok(bad.length === 0, f.replace(".folio-deck.json", "") + " sets every pinyin run in a covering face", bad.join(","));
    }
  }

  /* ---- 8. STUDYING PAST THE DAILY LIMIT STAYS IN THE SUBDECK, AND KEEPS BOTH DIRECTIONS ---------
     Reported as two things and it is one fault: "when I keep studying beyond the daily limit it stops
     showing both directions and becomes one directional again", and "it shows in the top right how many
     cards are remaining in that entire collection instead of that specific subdeck".

     The ahead pile was built from `uDeckStudyIds(ud.cardIds)` — the WHOLE deck, and the raw expansion,
     which is TEMPLATE-MAJOR. So it reached past the subdeck being studied (hence the count), and it
     skipped `studyOrder`, which is what interleaves the subdecks and what pulls a note's two cards
     together under "both directions together" (hence the one direction). Every other queue in the session
     is `studyOrder(entry, entryCardIds(entry))`; this one was not.

     BOTH HALVES ARE ASSERTED BECAUSE EITHER ALONE PASSES ON THE OTHER'S BUG: a pile of the right SIZE can
     still be in the wrong order, and a correctly ordered pile can still be the whole deck's. Neither
     throws, and the cards are all real cards, so nothing but the numbers says anything is wrong. */
  console.log("\n=== 8. studying past the daily limit stays in the subdeck, both directions");
  {
    /* Level 1 is 4 notes × 2 templates = 8 cards, of 16 in the deck. A limit of 2 leaves 6 behind in the
       subdeck and 14 in the deck — two numbers far enough apart that the count cannot pass by luck.
       Seeded through localStorage and a REAL reload: a hash-only goto is a same-document navigation, so
       the next save() would put the in-memory state straight back over it. */
    const L1 = "u:" + DECK + "/" + encodeURIComponent("Level 1");
    await pg.evaluate((entry) => {
      const st = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      st.deckOpts = st.deckOpts || {};
      st.deckOpts[entry] = Object.assign({}, st.deckOpts[entry], { newPerDay: 2, pairNew: true });
      /* …and START FROM NOTHING STUDIED. The sections above graded cards out of this very deck, so the
         day's allowance is already spent by the time this one runs and the session would open straight on
         the placard with no card to grade. Clearing the schedule is what makes the two figures below mean
         what they say. */
      st.cards = {}; st.deckDay = {}; st.intro = {}; st.buried = {};
      localStorage.setItem("folio_v1", JSON.stringify(st));
      /* …and the SESSION with it. A study session survives a reload (folio_study_v1, sessionStorage), so
         without this the reload lands back on section 6's card, already revealed, and there is no Reveal
         button to press. */
      try { sessionStorage.removeItem("folio_study_v1"); } catch (e) {}
    }, L1);
    await pg.reload({ waitUntil: "load" });
    await pg.waitForTimeout(600);

    await study();                                    // opens a session on Level 1
    /* study() reveals its first card for section 1's sake, so the reveal is conditional here rather than
       unconditional — the alternative is a helper that means two different things to two callers. */
    for (let i = 0; i < 2; i++) {                     // spend the allowance
      const rev = await pg.$("#reveal-btn");
      if (rev) { await rev.click(); await pg.waitForTimeout(220); }
      /* EASY, not Good: a new card graded Good goes to its ten-minute learning step and is requeued inside
         the session, so the queue never empties and the placard never appears. Easy graduates it. */
      await pg.click(".grade.easy");
      await pg.waitForTimeout(450);
    }
    /* THE PLACARD IS REACHED THE WAY THE READER REACHES IT — "Keep studying" on the completion screen,
       which is the phrase in the bug report. The cram branch runs when a session is BUILT with an empty
       queue, not when one drains, so grading to the end gives "Session complete" and the button re-routes
       into a fresh session that has nothing left to offer. */
    await pg.click("#more");
    await pg.waitForTimeout(700);
    const placard = await pg.evaluate(() => {
      const b = document.querySelector("#cram");
      return { text: b ? b.textContent.trim() : null,
               limit: (document.querySelector(".placard p") || {}).textContent || "" };
    });
    const offered = placard.text && +(/\d+/.exec(placard.text) || [0])[0];
    ok(offered === 6, "the ahead pile is the SUBDECK's remaining, not the whole deck's", 
      JSON.stringify({ offered: placard.text, want: "6 (deck-wide would be 14)" }));
    /* the sentence quotes the allowance too, and it used to quote the GLOBAL default rather than the one
       this entry is actually being held to */
    ok(/\(2\/day\)/.test(placard.limit), "…and the placard quotes this entry's own limit, not the global default",
      placard.limit.slice(0, 90));

    await pg.click("#cram");
    await pg.waitForTimeout(900);   // the pile is warmed first, behind the same loading line a session uses
    const counts = await pg.evaluate(() => {
      const n = document.querySelector(".cnt.new");
      return n ? +n.textContent.trim() : null;
    });
    ok(counts === 6, "…and the top-right count follows it, because it counts the queue", String(counts));

    /* Walk the pile. The forward template shows the word (词N), the reverse shows the gloss (meaning N),
       so each card says both WHICH NOTE it is and WHICH DIRECTION — which is the whole of what is being
       asserted. Level 1 is 词1..词4; anything above 4 came from Level 2. */
    /* Each read WAITS FOR THE CARD TO CHANGE before the next. Grading and then reading on a timer looked
       fine and was not: a grade click that did not land leaves the same card on screen, the walk records it
       again, and "each word's two cards side by side" then passes on two reads of ONE card. Hence the
       distinctness assertion below — a walk that has stopped stepping must fail, not agree with itself. */
    const readCard = () => pg.evaluate(() => {
      const c = [...document.querySelectorAll(".uc-card")].pop();
      if (!c) return null;
      const m = /(?:词|meaning )(\d+)/.exec(c.innerText || "");
      return m ? { note: +m[1], dir: c.querySelector(".uc-simp") ? "f" : "r" } : null;
    });
    const seen = [];
    for (let i = 0; i < 6; i++) {
      const one = await readCard();
      if (!one) break;
      seen.push(one);
      const key = one.note + one.dir;
      /* clicked through evaluate, not pg.click: the grade bar animates in, and Playwright's actionability
         check waits for an element that is still moving and times out */
      await pg.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
      await pg.waitForTimeout(180);
      const graded = await pg.evaluate(() => { const g = document.querySelector(".grade.easy"); if (!g) return false; g.click(); return true; });
      if (!graded) break;
      // …and wait for a DIFFERENT card, rather than for a fixed number of milliseconds
      for (let w = 0; w < 25; w++) {
        await pg.waitForTimeout(80);
        const nxt = await readCard();
        if (!nxt || nxt.note + nxt.dir !== key) break;
      }
    }
    ok(seen.length === 6, "the ahead pile deals every card it offered", seen.length);
    ok(seen.length > 0 && seen.every((x) => x.note >= 1 && x.note <= 4),
      "…all of them from the subdeck being studied, none from its neighbour",
      JSON.stringify(seen.map((x) => x.note + x.dir)));
    /* "both directions together" is ON, so studyOrder pairs a note's two cards. Without studyOrder the
       raw template-major expansion deals every forward card first — which is the reported symptom. */
    const dirs = seen.map((x) => x.dir).join("");
    ok(/r/.test(dirs.slice(0, 2)), "…and both directions arrive together rather than every forward first", dirs);
    const keys = seen.map((x) => x.note + x.dir);
    ok(new Set(keys).size === seen.length, "…each a different card, so the walk really stepped", keys.join(" "));
    const paired = seen.length === 6 && seen[0].note === seen[1].note &&
      seen[2].note === seen[3].note && seen[4].note === seen[5].note;
    ok(paired, "…each word's two cards side by side, which is what the switch asks for",
      JSON.stringify(seen.map((x) => x.note + x.dir)));
  }

  console.log("\nconsole errors: " + errs.length + (errs.length ? " " + JSON.stringify(errs.slice(0, 3)) : ""));
  ok(errs.length === 0, "no console errors anywhere in the run", errs.slice(0, 3));

  await b.close();
  server.close();
  console.log("\n" + (checks - fails) + " passed, " + fails + " failed");
  process.exit(fails ? 1 : 0);
})();
