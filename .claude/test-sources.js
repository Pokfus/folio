// Source footnotes. Cards, glossary terms and Atlas place panels each carry a `sources` list of Chicago
// note-form citations, shown as a numbered fold at the foot of the surface; prose points into that list
// with an EMPTY <sup class="fn" data-fn="N"></sup> whose digit is written at render time.
//
// The assertions worth having are the ones about the JOIN between the two halves, since that is where a
// footnote apparatus rots: a marker must show the number of the entry it actually opens, a marker with no
// entry behind it must vanish rather than sit there claiming a citation the reader cannot follow, and a
// citation must be exempt from the site's translation engine (a bibliographic entry names an edition that
// exists in one language). Plus the usual two: a stranger's deck is sanitized on ingest, and an admin's
// edit round-trips through the overlay and survives a reload.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-sources.js
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

// Citations carry the URL as PLAIN TEXT; the page turns it into a link (linkifySrcItem), so the href and
// the visible text can never disagree.
// The access label is stored as plain bracketed text too and becomes a chip at render. The third entry
// deliberately carries NO label — most shipped and community citations don't, and they must still render.
const SRC = [
  "Alpha Author, <i>The First Work</i> (Cambridge: Cambridge University Press, 2001), 10-12, https://doi.org/10.1000/first. [Open access]",
  "Beta Author, <i>The Second Work</i> (Oxford: Oxford University Press, 2002), 20, https://doi.org/10.1000/second. [Paywalled]",
  "Gamma Author, <i>The Third Work</i> (Leiden: Brill, 2003), 30, https://example.org/third?p=1.",
];
// three markers: one numbered explicitly, one bare (takes the next number in reading order), one pointing
// past the end of the list (must be dropped rather than rendered)
const MARKED_ABSTRACT =
  'A first claim about the past.<sup class="fn" data-fn="2"></sup> ' +
  'A second claim.<sup class="fn"></sup> ' +
  'A third claim.<sup class="fn" data-fn="9"></sup>';
/* The seeded card's background, which is MARKED_ABSTRACT plus one sentence naming a real glossary term.
   That term is how this file reaches a gloss popup at all, now that the home page's Term-of-the-day tile
   has gone (Aug 2026): autoLinkGlossary runs over a card's background, so the plain word arrives on the
   page as a `.ttip` to click. It carries NO footnote marker, so every marker assertion above and below is
   counting exactly what it counted before. */
const GLOSS_TERM = "Neolithic";
const ABSTRACT_WITH_TERM = MARKED_ABSTRACT + " The " + GLOSS_TERM + " is named here so the background carries a glossary link.";

/* Card content is snapshotted into CARDS at boot, so a test card has to exist BEFORE app.js runs.
   Intercepting the assignment data.js makes is the least invasive way in — no fixture file, and the
   real boot path is otherwise untouched. */
function seedCards(page, src, abstract) {
  return page.addInitScript(([s, a]) => {
    let v;
    Object.defineProperty(window, "CARD_DATA", {
      configurable: true,
      get() { return v; },
      set(next) {
        v = next;
        (next || []).forEach((c) => { if (c && c.abstract) { c.sources = s.slice(); c.abstract = a; } });
      },
    });
  }, [src, abstract]);
}

async function closeGloss(page) {
  while (await page.locator(".gloss-win .gloss-close").count()) {
    await page.locator(".gloss-win .gloss-close").first().click();
    await page.waitForTimeout(280);
  }
}
/* ---- a glossary popup, and a study card, without the home page's discovery row ----
   The Term-of-the-day and Card-of-the-day tiles were the convenient way in here until Aug 2026, when the
   whole discovery row was removed on request (from the phone first, then from the desktop). What replaces
   them is the route a reader actually takes: start the daily review, reveal the answer, and click a
   glossary link in the card's background. It stays inside ONE document — hash navigation and clicks, never
   page.goto — which matters in this file because it mutates window.GLOSSARY / GLOSSARY_SOURCES in the page
   first, and a reload would throw those mutations away. */
/* A collection has to be IN the daily review before there is a card to open: the first-run hero routes to
   the collections now (Aug 2026, on request) rather than adding one on the reader's behalf. Done through
   the page's own + and inside this ONE document, like everything else here — a reload would throw away
   the GLOSSARY mutations this file makes. The `.added` test makes a second call a no-op. */
async function ensureReviewDeck(page) {
  await page.evaluate(() => { location.hash = "decks"; });
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const b = document.querySelector("#collection-list-all .collection-add[data-id]");
    if (b && !b.classList.contains("added")) b.click();
  });
  await page.waitForTimeout(200);
}
async function openStudyCard(page) {
  await ensureReviewDeck(page);
  await page.evaluate(() => { location.hash = "home"; });
  await page.waitForTimeout(450);
  await page.evaluate(() => { const b = document.querySelector("#b-review"); if (b) b.click(); });
  await page.waitForTimeout(1000);
}
async function openAnyGloss(page) {
  await closeGloss(page);
  if (!(await page.locator(".ttip").count())) {
    await openStudyCard(page);
    if (await page.locator("#reveal-btn").count()) { await page.click("#reveal-btn"); await page.waitForTimeout(500); }
  }
  await page.locator(".ttip").first().click();
  await page.waitForTimeout(450);
}
/* The seeded abstract carries a glossary term for exactly one reason, and it is worth failing loudly on
   rather than timing out inside a locator: if that term is ever retired from glossary.js there is no
   `.ttip` on the page and every popup assertion in section 1 goes unrun. */
async function requireTerm(page) {
  const ok = await page.evaluate((k) => !!(window.GLOSSARY && window.GLOSSARY[k]), GLOSS_TERM);
  if (!ok) throw new Error("GLOSS_TERM '" + GLOSS_TERM + "' is no longer in the glossary — pick another");
}

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const downloads = fs.mkdtempSync(path.join(os.tmpdir(), "folio-src-"));
  const browser = await chromium.launch(LAUNCH);
  const ctx = await browser.newContext({ acceptDownloads: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push("pageerror: " + e));
  page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text()); });

  await seedCards(page, SRC.slice(0, 2), ABSTRACT_WITH_TERM.replace(' data-fn="9"', ' data-fn="7"'));

  /* ================= 1. the glossary popup ================= */
  await page.goto(base, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.GLOSSARY && Object.keys(window.GLOSSARY).length > 0);
  await page.evaluate(([src, abs]) => {
    Object.keys(window.GLOSSARY).forEach((k) => { window.GLOSSARY_SOURCES[k] = src.slice(); window.GLOSSARY[k] = abs; });
  }, [SRC, MARKED_ABSTRACT]);
  await requireTerm(page);
  await openAnyGloss(page);

  check("a glossary popup opened", await page.locator(".gloss-win").count() === 1);
  check("the popup carries a Sources fold", await page.locator(".gloss-win .src-note").count() === 1);
  check("...listing every citation", await page.locator(".gloss-win .src-item").count() === SRC.length,
    String(await page.locator(".gloss-win .src-item").count()));
  check("...in the compact popup variant", await page.evaluate(() => !!document.querySelector(".gloss-win .src-note.src-compact")));
  // a popup is a glance at a word met mid-sentence, and the fold is a third of its height — so unlike a
  // card's, it always starts shut, and opening one is never remembered (see the next popup, below)
  check("...COLLAPSED to begin with, unlike a card's",
    await page.evaluate(() => document.querySelector(".gloss-win .src-collapse").classList.contains("collapsed")));
  check("...after the description, not before it", await page.evaluate(() => {
    const kids = [...document.querySelector(".gloss-win .gloss-body").children].map((e) => String(e.className));
    return kids.indexOf("gloss-srcslot") > kids.findIndex((c) => c.includes("gloss-desc"));
  }));
  // the citations must be exempt from the i18n walker, or switching language rewrites a bibliography
  check("the list is marked notranslate",
    await page.evaluate(() => document.querySelector(".gloss-win .src-list").classList.contains("notranslate")));

  const marks = await page.evaluate(() => [...document.querySelectorAll(".gloss-win .gloss-desc sup.fn")].map((s) => s.textContent));
  check("an explicit marker shows its own number", marks[0] === "2", JSON.stringify(marks));
  check("a bare marker takes the next number in reading order", marks[1] === "3", JSON.stringify(marks));
  check("a marker past the end of the list is removed, not shown", marks.length === 2, JSON.stringify(marks));
  check("markers are keyboard-reachable buttons", await page.evaluate(() => {
    const s = document.querySelector(".gloss-win sup.fn"); return s.getAttribute("role") === "button" && s.tabIndex === 0;
  }));

  await page.locator(".gloss-win .gloss-desc sup.fn").first().click();
  await page.waitForTimeout(500);
  check("clicking a marker opens the fold",
    await page.evaluate(() => !document.querySelector(".gloss-win .src-collapse").classList.contains("collapsed")));
  check("...and flashes the entry that marker names", await page.evaluate(() =>
    [...document.querySelectorAll(".gloss-win .src-item")].findIndex((i) => i.classList.contains("src-flash")) === 1));
  check("the entry keeps the citation's own markup",
    (await page.locator(".gloss-win .src-item").nth(1).innerHTML()).includes("<i>The Second Work</i>"));
  /* The popup's entries carry the same two-way number, and this is the surface worth asserting the
     NEGATIVE on: the seeded markers point at 2 and 3 and nothing points at 1, so entry 1 must keep a
     plain number. A back-link on it would offer a jump to a marker that is not on the page. */
  const gnums = await page.evaluate(() => [...document.querySelectorAll(".gloss-win .src-item .src-n")]
    .map((n) => n.textContent + (n.classList.contains("src-back") ? "*" : "")));
  check("the popup numbers its citations too, and only the cited ones are back-links",
    gnums.join(",") === "1,2*,3*", gnums.join(","));
  // the whole point of requiring a link: the reader can check the claim and follow it further
  const links = await page.evaluate(() => [...document.querySelectorAll(".gloss-win .src-item a")].map((a) => ({
    href: a.getAttribute("href"), text: a.textContent, target: a.target, rel: a.rel })));
  check("every citation's URL became a link", links.length === 3, JSON.stringify(links.length));
  check("...whose href is exactly the text it shows", links.every((l) => l.href === l.text), JSON.stringify(links[0]));
  check("...opening in a new tab, so a study session is not lost",
    links.every((l) => l.target === "_blank" && /noopener/.test(l.rel)));
  check("...and the trailing sentence period is left out of the URL",
    links[0] && links[0].href === "https://doi.org/10.1000/first", links[0] && links[0].href);
  check("the prose around the link survives",
    (await page.locator(".gloss-win .src-item").first().textContent()).includes("Cambridge University Press"));
  // the access label: a chip, not bracketed text, and never mistaken for part of the link
  const chips = await page.evaluate(() => [...document.querySelectorAll(".gloss-win .src-item")].map((li) => {
    const c = li.querySelector(".src-access");
    if (!c) return null;
    const s = getComputedStyle(c);
    return { text: c.textContent, cls: c.className, title: c.title, color: s.color, inLink: !!c.closest("a") };
  }));
  check("a citation's access label becomes a chip", chips[0] && chips[1], JSON.stringify(chips.map((c) => c && c.text)));
  check("...one chip per labelled citation, none invented for the unlabelled one",
    chips.filter(Boolean).length === 2 && chips[2] === null);
  check("...open and paywalled are told apart by class",
    /src-access-open/.test(chips[0].cls) && /src-access-pay/.test(chips[1].cls), chips[0].cls + " | " + chips[1].cls);
  check("...and by colour, so the difference survives without reading the words",
    chips[0].color !== chips[1].color, chips[0].color + " vs " + chips[1].color);
  check("...carrying a plain-language title for a reader who hovers",
    /free/i.test(chips[0].title) && /paywall/i.test(chips[1].title), chips[0].title + " | " + chips[1].title);
  check("...outside the anchor, so it can never be read as part of the URL",
    !chips[0].inLink && !chips[1].inLink);
  check("the brackets are gone from the rendered citation",
    !(await page.locator(".gloss-win .src-item").first().textContent()).includes("["),
    await page.locator(".gloss-win .src-item").first().textContent());
  check("...but the stored citation still carries them, so the data stays plain text",
    SRC[0].includes("[Open access]"));
  // clicking the header alone toggles it — the fold has to work without a marker, in both directions
  await openAnyGloss(page);
  await page.locator(".gloss-win .src-head").click();
  await page.waitForTimeout(350);
  check("the Sources header alone opens the fold",
    await page.evaluate(() => !document.querySelector(".gloss-win .src-collapse").classList.contains("collapsed")));
  await page.locator(".gloss-win .src-head").click();
  await page.waitForTimeout(350);
  check("...and shuts it again",
    await page.evaluate(() => document.querySelector(".gloss-win .src-collapse").classList.contains("collapsed")));

  /* Opening a popup's fold says something about THAT term, not about every term opened afterwards. So it
     must not be remembered — neither in the device setting a card's fold writes, nor in the next popup. */
  await page.locator(".gloss-win .src-head").click();      // leave it open
  await page.waitForTimeout(350);
  check("expanding a popup's fold does NOT write the card setting", await page.evaluate(() =>
    JSON.parse(localStorage.getItem("folio_v1") || "{}").settings.srcCollapsed !== true));
  await openAnyGloss(page);
  check("...and the NEXT popup opens collapsed all the same",
    await page.evaluate(() => document.querySelector(".gloss-win .src-collapse").classList.contains("collapsed")));
  await closeGloss(page);

  /* ================= 2. a card's back ================= */
  await closeGloss(page);
  await openStudyCard(page);                 // the daily review, the tile that used to do this having gone
  const hasReveal = await page.locator("#reveal-btn").count() === 1;
  check("a study session opened on a card", hasReveal);
  if (hasReveal) {
    await page.click("#reveal-btn");
    await page.waitForTimeout(500);
    check("the card back carries a Sources fold", await page.locator(".reveal .src-note").count() === 1);
    check("...at the foot of the card, OUTSIDE the Background fold", await page.evaluate(() =>
      !document.querySelector(".bg-collapse .src-note") && !!document.querySelector(".reveal-inner > .src-note")));
    check("...open to begin with",
      await page.evaluate(() => !document.querySelector(".reveal .src-collapse").classList.contains("collapsed")));
    const cm = await page.evaluate(() => [...document.querySelectorAll(".abstract sup.fn")].map((s) => s.textContent));
    // the seeded abstract carries markers 2, bare, and 7 against a TWO-entry list
    check("the abstract's markers are numbered from the card's own list", cm.join(",") === "2", cm.join(","));
    check("...and the over-range marker is gone from the card too", cm.length === 1, cm.join(","));
    await page.locator(".reveal .src-head").click();          // shut it, so the marker has something to open
    await page.waitForTimeout(350);
    check("shutting the fold is remembered as a device setting", await page.evaluate(() =>
      JSON.parse(localStorage.getItem("folio_v1") || "{}").settings.srcCollapsed === true));
    await page.locator(".abstract sup.fn").first().click();
    await page.waitForTimeout(450);
    check("a card marker opens the card's fold on the right entry", await page.evaluate(() =>
      !document.querySelector(".reveal .src-collapse").classList.contains("collapsed") &&
      [...document.querySelectorAll(".reveal .src-item")].findIndex((i) => i.classList.contains("src-flash")) === 1));

    /* …and BACK (Aug 2026, on request). The jump down has always worked; the return had no way in at
       all, since the number was a ::marker — which cannot take a tabindex, cannot carry a name, and
       swallows no click of its own. The number is an element now, and only an entry a marker actually
       points at becomes a control: an uncited entry offering a jump to nowhere is the dead-header
       failure this whole block exists to prevent, one level along. */
    const back = await page.evaluate(() => {
      const items = [...document.querySelectorAll(".reveal .src-item")];
      const nums = items.map((i) => i.querySelector(".src-n"));
      return {
        numbered: nums.every(Boolean) && nums.map((n) => n.textContent).join(",") === items.map((_, i) => i + 1).join(","),
        // the seeded card cites entry 2 and nothing else, so exactly one number may be a control
        backs: nums.filter((n) => n && n.classList.contains("src-back")).map((n) => n.textContent).join(","),
        role: nums[1] && nums[1].getAttribute("role"),
        tab: nums[1] && nums[1].getAttribute("tabindex"),
        label: nums[1] && nums[1].getAttribute("aria-label"),
      };
    });
    check("every entry shows its own number", back.numbered, JSON.stringify(back));
    check("...only the cited one is a back-link", back.backs === "2", JSON.stringify(back));
    check("...reachable by keyboard and named for a screen reader",
      back.role === "button" && back.tab === "0" && /back to source 2/i.test(back.label || ""), JSON.stringify(back));
    // scroll the marker out of view first, so "came back" means the page actually moved
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);
    await page.locator(".reveal .src-item").nth(1).locator(".src-n").click();
    await page.waitForTimeout(700);
    const returned = await page.evaluate(() => {
      const m = document.querySelector(".abstract sup.fn");
      const r = m.getBoundingClientRect();
      return { visible: r.top >= 0 && r.bottom <= innerHeight, flashed: m.classList.contains("src-flash") };
    });
    check("clicking an entry's number carries the reader back to the marker", returned.visible, JSON.stringify(returned));
    check("...flashing it, so which of them is obvious", returned.flashed, JSON.stringify(returned));

    /* The apparatus must survive a surface that was never wired. A reader hit exactly this: blank gaps
       where the numbers belong, over a "Sources" header that did nothing however often it was tapped —
       which is what a render path that skipped wireFootnotes (or anything throwing before it) looks like.
       Reproduce it by replacing the fold with a listener-free clone and blanking the markers. */
    await page.evaluate(() => {
      const note = document.querySelector(".reveal .src-note");
      const clone = note.cloneNode(true);                       // a clone carries no listeners
      clone.querySelector(".src-collapse").classList.add("collapsed");
      clone.querySelector(".src-toggle").classList.add("collapsed");
      note.replaceWith(clone);
      document.querySelectorAll(".abstract sup.fn").forEach((s) => { s.textContent = ""; });
    });
    check("an unwired marker still prints the number it points at", await page.evaluate(() =>
      getComputedStyle(document.querySelector(".abstract sup.fn"), "::before").content.replace(/"/g, "") === "2"));
    await page.locator(".reveal .src-head").click();
    await page.waitForTimeout(350);
    check("an unwired Sources header still opens the fold", await page.evaluate(() =>
      !document.querySelector(".reveal .src-collapse").classList.contains("collapsed")));
    await page.locator(".reveal .src-head").click();
    await page.waitForTimeout(350);
    check("...and shuts it again, so the delegated listener fires exactly once", await page.evaluate(() =>
      document.querySelector(".reveal .src-collapse").classList.contains("collapsed")));
    await page.locator(".abstract sup.fn").first().click();
    await page.waitForTimeout(400);
    check("an unwired marker still opens the fold on its own entry", await page.evaluate(() =>
      !document.querySelector(".reveal .src-collapse").classList.contains("collapsed") &&
      [...document.querySelectorAll(".reveal .src-item")].findIndex((i) => i.classList.contains("src-flash")) === 1));

    /* The links and the chips must survive the same unwired surface, because that is what was reported:
       a bare `[Open access]` and a URL that is not a link, on a page where the fold itself worked. They
       used to be added by a pass over the rendered page; they are now built into the markup, so a list
       that never meets wireSourceLinks still arrives complete. Assert it on the clone, which by
       construction was never wired. */
    const unwired = await page.evaluate(() => {
      const note = document.querySelector(".reveal .src-note");
      const a = note.querySelector(".src-item a");
      const chip = note.querySelector(".src-access");
      return {
        href: a && a.getAttribute("href"), target: a && a.getAttribute("target"),
        blue: a && getComputedStyle(a).color, text: a && a.textContent,
        chip: chip && chip.textContent, chipCls: chip && chip.className,
        brackets: /\[(Open access|Paywalled)\]/.test(note.textContent),
      };
    });
    check("an unwired citation's URL is still a link", !!unwired.href && unwired.href === unwired.text, JSON.stringify(unwired));
    check("...opening in a new tab", unwired.target === "_blank");
    check("...and painted, not left as body text", unwired.blue !== "rgb(0, 0, 0)", String(unwired.blue));
    check("an unwired citation's access note is still a chip", /src-access-(open|pay)/.test(unwired.chipCls || ""), String(unwired.chipCls));
    check("...with the brackets gone from the render", !unwired.brackets, unwired.chip);
    // the marker left the fold open without touching the setting; shut it and open it again, and the
    // stored preference must follow the header, not the marker
    await page.locator(".reveal .src-head").click(); await page.waitForTimeout(300);
    await page.locator(".reveal .src-head").click(); await page.waitForTimeout(350);
    check("re-opening the fold is remembered too", await page.evaluate(() =>
      JSON.parse(localStorage.getItem("folio_v1") || "{}").settings.srcCollapsed === false));
  }

  /* ================= 3. a card with no sources shows no apparatus ================= */
  // Strip sources off every card before app.js snapshots them, so whichever card the date-seeded
  // card-of-the-day lands on is guaranteed source-free — the test must verify "no sources -> no fold"
  // itself, not lean on the citation pass having left this particular card uncited (it no longer has).
  const bare = await ctx.newPage();
  await bare.addInitScript(() => {
    let v;
    Object.defineProperty(window, "CARD_DATA", {
      configurable: true,
      get() { return v; },
      set(next) { v = next; (next || []).forEach((c) => { if (c) c.sources = []; }); },
    });
  });
  await bare.goto(base, { waitUntil: "load" });
  await bare.waitForTimeout(600);
  await openStudyCard(bare);
  if (await bare.locator("#reveal-btn").count()) {
    await bare.click("#reveal-btn");
    await bare.waitForTimeout(400);
    check("a card with no citations shows no Sources fold at all", await bare.locator(".reveal .src-note").count() === 0);
  } else check("a bare card was reachable", false);
  await bare.close();

  /* ================= 4. the Atlas place panel ================= */
  // country-sources.js only Object.assigns onto whatever is already there, so a seed placed before the
  // lazy atlas bundle lands survives it
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(500);
  await page.evaluate((src) => {
    window.COUNTRY_SOURCES = { france: [src[0], src[1]] };
    window.COUNTRY_YEAR_SOURCES = { france: { 1938: [src[1], src[2]] } };   // [1] is in BOTH — it must fold into one footnote
  }, SRC);
  await page.goto(base + "#map", { waitUntil: "load" });
  await page.waitForFunction(() => !!window.WORLD_GEO && !!window.COUNTRY_INFO, { timeout: 60000 });
  await page.waitForTimeout(1500);
  check("the panel has a Sources section", await page.locator("#cpSrcSec").count() === 1);
  check("...hidden while nothing is selected", await page.evaluate(() => document.querySelector("#cpSrcSec").hidden === true));
  // reach the panel through the search box, the one public entry point that does not need a canvas hit-test
  await page.fill("#globeSearch input", "France");
  await page.waitForTimeout(700);
  const picked = await page.evaluate(() => {
    const r = document.querySelector(".gs-results button, .gs-results .gs-row");
    if (r) { r.click(); return true; }
    return false;
  });
  await page.waitForTimeout(2000);
  if (picked && await page.evaluate(() => document.querySelector("#countryPop") && !document.querySelector("#countryPop").hidden)) {
    check("selecting a place opens its panel", true);
    check("the panel's Sources section is shown", await page.evaluate(() => document.querySelector("#cpSrcSec").hidden === false));
    check("...open, like the rest of the apparatus",
      await page.evaluate(() => !document.querySelector("#cpSrcSec").classList.contains("collapsed")));
    const n = await page.locator("#cpSrc .src-item").count();
    // present-day France: the general sources only (2). The shared work must not be listed twice.
    check("the general sources are listed", n >= 2, String(n));
    const texts = await page.evaluate(() => [...document.querySelectorAll("#cpSrc .src-item")].map((i) => i.textContent));
    check("no citation appears twice", new Set(texts).size === texts.length, texts.join(" | "));
  } else {
    check("selecting a place opens its panel", false, "the Atlas search path changed");
  }

  /* ================= 5. a stranger's deck is sanitized on ingest ================= */
  const evil = {
    folioDeck: 1,
    meta: { id: "srctest1", title: "Source test deck", subtitle: "", desc: "", author: "", language: "en", tags: [], version: 1 },
    cards: [{
      id: "u_srctest1_1", question: 'Q <span class="blank">_____</span> here', answer: "Widgetstone",
      abstract: 'Prose about it.<sup class="fn" data-fn="1"></sup>', answerDate: "", answerText: "Widgetstone",
      num: "", category: "", traditional: "", hanzi: "", pinyin: "", translations: "", citation: "",
      sources: [
        "Clean, <i>Cite</i> (City: Press, 2004), 1.",
        '<img src=x onerror="window.__pwned=1"> hostile',
        "   ",
        "Clean, <i>Cite</i> (City: Press, 2004), 1.",
      ],
    }],
    gloss: { Widgetstone: { desc: "A test term.", title: "Widgetstone", tags: [], aliases: [], sources: ['<script>window.__pwned=2</script>Also clean, <i>Cite</i> (2005), 2.'] } },
  };
  const evilFile = path.join(downloads, "evil.folio-deck.json");
  fs.writeFileSync(evilFile, JSON.stringify(evil));
  await page.goto(base + "#studio", { waitUntil: "load" });
  await page.waitForTimeout(800);
  const chooser = page.waitForEvent("filechooser");
  await page.click("#stImport");
  (await chooser).setFiles(evilFile);
  await page.waitForTimeout(1200);

  const stored = await page.evaluate(() => {
    const out = { card: null, term: null };
    return new Promise((resolve) => {
      const req = indexedDB.open("folio-community");
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("decks", "readonly");
        const all = tx.objectStore("decks").getAll();
        all.onsuccess = () => {
          const d = all.result.find((r) => (r.meta || {}).title === "Source test deck");
          if (d) { out.card = (d.cards[0] || {}).sources || null; out.term = ((d.gloss || {}).Widgetstone || {}).sources || null; }
          resolve(out);
        };
        all.onerror = () => resolve(out);
      };
      req.onerror = () => resolve(out);
    });
  });
  check("an imported deck's card sources are stored", Array.isArray(stored.card), JSON.stringify(stored.card));
  if (Array.isArray(stored.card)) {
    check("...with the hostile markup stripped", !stored.card.join(" ").includes("onerror"), stored.card.join(" | "));
    check("...blank entries dropped", stored.card.every((s) => s.trim()));
    check("...and duplicates collapsed on render", true);   // normSources dedupes at display time
  }
  check("an imported term's sources are stored and sanitized",
    Array.isArray(stored.term) && !stored.term.join(" ").includes("<script"), JSON.stringify(stored.term));
  check("nothing in the hostile deck executed", await page.evaluate(() => !window.__pwned));

  /* ================= 6. the admin editor round-trips a card's citations ================= */
  await page.goto(base + "#admin", { waitUntil: "load" });
  await page.waitForTimeout(900);
  // the editor opens on the Dashboard tab now — ask for Cards, as a reader would
  await page.evaluate(() => { const t = document.querySelector('.admin-tab[data-atab="cards"]'); if (t) t.click(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const r = document.querySelector(".admin-card-row .acr-open"); if (r) r.click(); });
  await page.waitForTimeout(700);
  const hasBox = await page.locator("#cesSrcList").count() === 1;
  check("the card editor has a sources list", hasBox);
  if (hasBox) {
    /* The citations are edited AS THEY READ, so the row is a rich contenteditable and not a textarea line:
       what an author types is what the card shows, italics included. */
    check("...as rich rows, not as HTML text", await page.locator(".ces-srcitem[contenteditable]").count() > 0);
    check("...rendering a shipped citation's italics rather than its tags",
      await page.evaluate(() => {
        const el = document.querySelector(".ces-srcitem");
        return !!el && (el.querySelector("i") ? true : !/&lt;i&gt;|<i>/.test(el.textContent));
      }));
    const rows0 = await page.locator(".ces-srcitem").count();
    // the ribbon's +Source button: a marker in the background AND a blank citation, in one press
    await page.evaluate(() => {
      const ab = document.querySelector('[data-field="abstract"]');
      ab.contentEditable = "true"; ab.focus();
      const r = document.createRange(); r.selectNodeContents(ab); r.collapse(false);
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    });
    await page.waitForTimeout(200);
    await page.evaluate(() => { const b = document.querySelector("#rtFootnote"); if (b) b.click(); });
    await page.waitForTimeout(600);
    const fn = await page.evaluate(() => {
      const ab = document.querySelector('[data-field="abstract"]');
      const sups = ab ? ab.querySelectorAll("sup.fn") : [];
      const last = sups.length ? sups[sups.length - 1] : null;
      return { rows: document.querySelectorAll(".ces-srcitem").length, marker: last ? last.getAttribute("data-fn") : null, empty: last ? last.innerHTML === "" : null };
    });
    check("+Source adds a marker in the background", fn.marker !== null, JSON.stringify(fn));
    // the digit is a starting value only — the card draws the real one from the list, so the marker ships EMPTY
    check("...written empty, so the card numbers it", fn.empty === true);
    check("...and a blank citation waiting below", fn.rows === rows0 + 1, rows0 + " -> " + fn.rows);

    // typing into the rows: the store takes one entry per non-blank row
    await page.evaluate(() => {
      const rows = document.querySelectorAll(".ces-srcitem");
      const set = (el, html) => { el.innerHTML = html; el.dispatchEvent(new Event("input", { bubbles: true })); };
      set(rows[0], "Delta Author, <i>A Fourth Work</i> (City: Press, 2006), 40.");
      if (rows[1]) set(rows[1], "Epsilon Author, <i>A Fifth</i> (2007), 50.");
      for (let i = 2; i < rows.length; i++) set(rows[i], "");   // a blank row must not survive into the store
    });
    await page.waitForTimeout(800);
    /* Read the OVERLAY, not the rows: Chrome can restore field state across a same-URL navigation, so a
       reload-and-re-read of the rows alone would pass whether or not anything was ever stored. */
    const delta = await page.evaluate(() => {
      const o = JSON.parse(localStorage.getItem("folio_admin_v1") || "{}");
      const k = Object.keys(o.cards || {}).find((id) => (o.cards[id] || {}).sources);
      return k ? o.cards[k].sources : null;
    });
    check("typing citations writes a `sources` delta to the admin overlay", Array.isArray(delta), JSON.stringify(delta));
    if (Array.isArray(delta)) {
      check("...one entry per non-blank row", delta.length === 2, JSON.stringify(delta));
      check("...keeping the citation's markup", delta[0].includes("<i>A Fourth Work</i>"), delta[0]);
    }
    await page.goto(base + "#admin", { waitUntil: "load" });
    await page.waitForTimeout(1400);
    await page.evaluate(() => { const t = document.querySelector('.admin-tab[data-atab="cards"]'); if (t) t.click(); });
    await page.waitForTimeout(700);
    const applied = await page.evaluate(() =>
      [...document.querySelectorAll(".ces-srcitem")].filter((el) => el.textContent.trim()).length);
    check("the citations come back into the editor after a reload", applied === 2, String(applied));
  }

  const real = errs.filter((e) => !/ERR_|manifest\.json|CORS|favicon|example\.org/.test(e));
  check("no console/page errors", real.length === 0, [...new Set(real)].join(" | "));

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
