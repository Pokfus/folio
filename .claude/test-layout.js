#!/usr/bin/env node
/* Folio — the SHELL: the layout rules that break silently.
   =========================================================
   Everything asserted here is invisible to a syntax check and to every other test in this folder, and each
   one has already broken once:

     · the phone's bottom tab bar and the chain of things anchored to the bottom of the viewport. The bar,
       the Atlas timebar and the globe stage are stacked by arithmetic (--tabbar-h / --timebar-h). Get one
       wrong and a bar sits ON another, or a page's last line hides under the tab bar — which looks like a
       scrolling bug, not a layout one, so it gets reported as "the page is cut off".
     · the Atlas rail's year labels. They are absolutely positioned off year2frac and thinned by
       layoutTicks(); when the rail is narrow they overlap into an unreadable smudge. Nothing errors.
     · the Atlas search + legend as chips on a phone. The desktop `.gs-toggle{display:none}` and the phone
       block are the SAME specificity, so source order alone decides — put the block first and the chip
       silently never appears (this happened).
     · the one-row grade bar, whose height the study page's bottom padding has to clear.
     · Settings / Account filling the stage, and coming-soon collections carrying no progress meter.
     · an overlay on document.body outliving the page that spawned it.

   Run:  NODE_PATH=<playwright>/node_modules node .claude/test-layout.js
   Env:  FOLIO_CHROMIUM=<path to chrome> if Chromium lives outside the playwright package. */

const path = require("path");
const http = require("http");
const fs = require("fs");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
const PHONE = { width: 390, height: 800 };
// GB_FOLD_MS (280) plus the margin gbFoldingFor adds — read anything sooner and it is measured mid-flight
const GB_SETTLE = 450;
const DESKTOP = { width: 1440, height: 950 };

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
}
const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1.5 : tol);

function serve() {
  return http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split("?")[0]);
    const f = path.join(ROOT, u === "/" ? "index.html" : u);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  });
}

// the Atlas's first-visit coach marks cover the whole globe; every Atlas section here needs them gone
async function atlas(page, base, ms) {
  await page.goto(base, { waitUntil: "load" });
  await page.evaluate(() => localStorage.setItem("folio_atlas_tour_v1", "1"));
  await page.goto(base + "#map", { waitUntil: "load" });
  await page.waitForTimeout(ms || 4500);
}
/* Put a collection in the daily review, the way a reader does. The first-run hero routes to the
   COLLECTIONS now (Aug 2026, on request) rather than picking a subject on the reader's behalf, so nothing
   can be studied until something has been added — and pressing the page's own + rather than writing
   S.active by hand keeps this honest about the route a first visit actually takes. Always the FIRST
   collection, and never twice, so a second call is a no-op rather than a second deck. */
async function addFirstCollection(page, base) {
  await page.goto(base + "#decks", { waitUntil: "load" });
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    const b = document.querySelector("#collection-list-all .collection-add[data-id]");
    if (b && !b.classList.contains("added")) b.click();
  });
  await page.waitForTimeout(300);
}
// grade `n` cards Easy — Easy graduates a new card outright, so each grade is a DISTINCT card
// (Good makes it a learning step that comes back later in the same queue)
async function studyEasy(page, base, n) {
  await addFirstCollection(page, base);
  await page.goto(base + "#home", { waitUntil: "load" });
  await page.waitForTimeout(1300);
  await page.evaluate(() => { const b = document.querySelector(".banner .cta .btn"); if (b) b.click(); });
  await page.waitForTimeout(1500);
  for (let i = 0; i < n; i++) {
    await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
    await page.waitForTimeout(450);
    await page.evaluate(() => { const g = document.querySelector(".grade.easy"); if (g) g.click(); });
    await page.waitForTimeout(550);
  }
}

/* NO CLASS MAY BE NAMED `ad-…` (Aug 2026, on a bug report). This is a static string check rather than a
   browser one, and it has to be: the fault it guards is an AD BLOCKER, and Playwright runs no extensions,
   so no amount of rendering can see it. A reader with a blocker had the deck's name and the bar beside it
   hidden on every row of the daily review, because `.ad-body` and `.ad-title` are also real advertisement
   class names and sit in EasyList's generic cosmetic filters — injected as an origin-level user
   stylesheet, which nothing in our CSS can outrank. It failed in the quiet way: perfect markup, no error,
   and every other page fine. The whole prefix is banned rather than the two names that were caught, since
   which names are in the lists is a matter of what real ad markup happens to use. */
function adBaitCheck() {
  const BAIT = /\b(ads?|advert(?:ising|isement)?|sponsored?|promo)-[a-z0-9-]+/i;
  const found = [];
  // selectors in the stylesheet — comments stripped first, since the block explaining this rule names the
  // very classes it bans and would otherwise fail the build for describing itself
  const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, " ");
  (css.match(/\.[A-Za-z][\w-]*/g) || []).forEach((s) => { if (BAIT.test(s.slice(1))) found.push("styles.css " + s); });
  // …and every class actually written into the markup, by app.js or by hand
  ["app.js", "index.html"].forEach((f) => {
    const src = fs.readFileSync(path.join(ROOT, f), "utf8");
    (src.match(/class="[^"]*"/g) || []).forEach((attr) => {
      attr.slice(7, -1).split(/[\s${}]+/).forEach((c) => { if (c && BAIT.test(c)) found.push(f + " ." + c); });
    });
  });
  check("no class is named ad-… (an ad blocker hides those, and no browser test can see it)",
    found.length === 0, found.slice(0, 6).join(", "));
}

/* A MODAL SCRIM MUST BE THEME-INDEPENDENT BLACK (Aug 2026, on a bug report: "the whole background is
   whited out"). Five full-screen overlays were mixes of `var(--ink)` — the darkest thing a LIGHT theme
   has, and the LIGHTEST thing a dark one has, so at night each became a 38–58% white veil over the whole
   page. It is checked statically rather than in the browser because the failure is invisible from the
   light side: every screenshot taken in light mode is correct, nothing throws, and the sheet in front is
   perfectly readable. A `var(--paper)` mix is fine and is not matched here — paper is dark at night, so
   `.gloss-scrim` and `.atlas-help` darken as they should. */
function scrimCheck() {
  const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, " ");
  const bad = [];
  (css.match(/\.[\w-]+\{[^{}]*position:\s*fixed[^{}]*\}/g) || []).forEach((rule) => {
    if (!/inset:\s*0/.test(rule)) return;                            // a full-screen overlay, not a pinned bar
    if (/background:[^;}]*var\(--ink\)/.test(rule)) bad.push((/^\.[\w-]+/.exec(rule) || [""])[0]);
  });
  check("no full-screen scrim is built from var(--ink) (it inverts to a white veil at night)",
    bad.length === 0, bad.join(", "));
}

(async () => {
  adBaitCheck();
  scrimCheck();
  const server = serve();
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM || undefined });
  const errs = [];
  /* …and suppresses the LIBRARY's first-visit coach marks (Aug 2026). They are a full-screen overlay on
     document.body, and the swipe section below lands on #library — a scrim there swallows every gesture
     after it, which reads as the swipe having broken rather than as an overlay being in the way. The
     home page's walkthrough OFFER is left alone deliberately: it is inline markup, it blocks nothing, and
     section 6 asserts the home page as a first-time reader actually meets it. */
  const watch = (p) => {
    p.on("pageerror", (e) => errs.push("pageerror: " + e));
    p.on("console", (m) => { if (m.type() === "error" && !/ERR_|net::|Failed to load|favicon/.test(m.text())) errs.push("console: " + m.text()); });
    return p.addInitScript(() => { try { localStorage.setItem("folio_library_tour_v1", "1"); } catch (e) {} });
  };

  /* ================= 1. the bottom tab bar ================= */
  {
    const page = await browser.newPage({ viewport: PHONE });
    await watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(1400);

    const bar = await page.evaluate(() => {
      const t = document.querySelector(".tabbar");
      const b = t.getBoundingClientRect();
      return {
        shown: t.checkVisibility(),
        bottom: Math.round(b.bottom), h: Math.round(b.height), w: Math.round(b.width),
        topbar: document.querySelector(".topbar").checkVisibility(),
        // only the tabs actually on screen: Edit is admin-only and applyMode() hides it, so a visitor's
        // row is six and an editor's is seven
        tabs: [...t.querySelectorAll(".tab")].filter((x) => x.checkVisibility()).map((x) => x.dataset.route),
        // the top bar's labels collapse to max-width:0 and unfold only on hover / .active. Down here every
        // tab must be named all the time — a row of bare icons is the problem this bar exists to solve,
        // and a phone has no hover to unfold them with. A label must also not be CLIPPED to nothing by the
        // narrower cells six or seven tabs leave: compare each against the text it is meant to show.
        labelled: [...t.querySelectorAll(".tab")].filter((x) => x.checkVisibility()).map((x) => {
          const l = x.querySelector(".tab-label");
          return { w: Math.round(l.getBoundingClientRect().width), need: l.scrollWidth };
        }),
        // a tab's name sits UNDER its icon, so both must share a centre. The top bar's
        // `.tab.active .tab-label` opens the label with margin-inline-start:8px and outranked the tab bar's
        // own rule at two classes against three — so the SELECTED tab, and only that one, drew its name 8px
        // to the right of the icon above it. A screenshot of one state cannot tell that from a design.
        centred: [...t.querySelectorAll(".tab")].filter((x) => x.checkVisibility()).map((x) => {
          const ic = x.querySelector(".tab-ic").getBoundingClientRect(), l = x.querySelector(".tab-label").getBoundingClientRect();
          return { route: x.dataset.route, active: x.classList.contains("active"), off: Math.round(Math.abs((ic.left + ic.width / 2) - (l.left + l.width / 2)) * 10) / 10 };
        }),
      };
    });
    check("the tab bar shows on a phone", bar.shown);
    check("...spanning the full width, pinned to the bottom", bar.w === PHONE.width && bar.bottom === PHONE.height, JSON.stringify({ w: bar.w, bottom: bar.bottom }));
    check("...carrying every destination it is meant to",
      ["home", "map", "account", "settings"].every((r) => bar.tabs.includes(r)), bar.tabs.join(","));
    // Library left the bar for the home page's own banner — the tab bar is not where it is reached now
    check("...and NOT the Library, which the home page's review lip carries", !bar.tabs.includes("decks"), bar.tabs.join(","));
    // …and About left it the same way, for the grey line under that banner
    check("...nor About, which the home page's own link carries", !bar.tabs.includes("mission"), bar.tabs.join(","));
    check("...every one of them NAMED, not just the active one", bar.labelled.every((l) => l.w > 8), JSON.stringify(bar.labelled.map((l) => l.w)));
    check("...and no name clipped by the narrower cells", bar.labelled.every((l) => l.w >= l.need - 1), JSON.stringify(bar.labelled));
    check("...each name centred under its own icon, the SELECTED tab included",
      bar.centred.every((c) => c.off <= 1), JSON.stringify(bar.centred));
    check("...and the selected tab is one of them", bar.centred.some((c) => c.active), JSON.stringify(bar.centred.map((c) => c.route + ":" + c.active)));
    // light/dark and the language picker moved to Settings, Account/Settings/Edit moved down here —
    // which leaves the top bar with nothing on it at all on a phone
    check("the top bar gives way to it entirely", !bar.topbar);

    // it routes, and the active state follows the route
    await page.evaluate(() => { [...document.querySelectorAll(".tabbar .tab")].find((t) => t.dataset.route === "account").click(); });
    await page.waitForTimeout(900);
    const routed = await page.evaluate(() => ({
      hash: location.hash,
      active: [...document.querySelectorAll(".tabbar .tab.active")].map((t) => t.dataset.route).join(","),
    }));
    check("tapping a tab routes", routed.hash === "#account", routed.hash);
    check("...and the active mark follows the route", routed.active === "account", routed.active);

    // a study session is a place you finish, not browse from — and the grade bar owns that edge
    await studyEasy(page, base, 0);
    await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
    await page.waitForTimeout(600);
    check("the tab bar hides while grading", await page.evaluate(() => !document.querySelector(".tabbar").checkVisibility()));
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    await watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(1200);
    const d = await page.evaluate(() => ({
      tabbar: document.querySelector(".tabbar").checkVisibility(),
      topNav: document.querySelector(".topbar .nav.left").checkVisibility(),
      tabbarH: getComputedStyle(document.documentElement).getPropertyValue("--tabbar-h").trim(),
      barH: getComputedStyle(document.documentElement).getPropertyValue("--bar-h").trim(),
    }));
    check("above the breakpoint the tab bar is gone", !d.tabbar);
    check("...and the top bar's nav is back", d.topNav);
    check("...with --bar-h back to its full height", !/^0/.test(d.barH), d.barH);
    check("...with --tabbar-h at zero, so nothing reserves room for it", /^0/.test(d.tabbarH), d.tabbarH);
    await page.close();
  }

  /* ================= 2. everything anchored to the bottom, stacked without overlap =================
     The globe stage, the Atlas timebar and the tab bar are three fixed elements whose positions are pure
     arithmetic over --timebar-h and --tabbar-h. Nothing throws when that arithmetic is wrong: one bar just
     sits on top of another, or a gap opens under the last one. */
  for (const vp of [PHONE, { width: 560, height: 820 }, DESKTOP]) {
    const page = await browser.newPage({ viewport: vp });
    await watch(page);
    await atlas(page, base);
    const g = await page.evaluate(() => {
      const r = (s) => { const e = document.querySelector(s); if (!e || !e.checkVisibility()) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height) }; };
      return { stage: r(".globe-stage"), timebar: r(".atlas-timebar"), tabbar: r(".tabbar"), vh: window.innerHeight };
    });
    const tag = vp.width + "px";
    const bottomMost = g.tabbar || g.timebar;
    check("[" + tag + "] the globe stage ends exactly where the timeline begins",
      !!g.stage && !!g.timebar && near(g.stage.bottom, g.timebar.top), JSON.stringify({ stage: g.stage && g.stage.bottom, timebar: g.timebar && g.timebar.top }));
    if (g.tabbar) {
      check("[" + tag + "] ...the timeline ends exactly where the tab bar begins",
        near(g.timebar.bottom, g.tabbar.top), JSON.stringify({ timebar: g.timebar.bottom, tabbar: g.tabbar.top }));
    } else {
      check("[" + tag + "] ...and with no tab bar the timeline sits on the viewport floor", near(g.timebar.bottom, g.vh), g.timebar.bottom + " vs " + g.vh);
    }
    check("[" + tag + "] nothing is left over below the last bar", near(bottomMost.bottom, g.vh), bottomMost.bottom + " vs " + g.vh);
    await page.close();
  }
  {
    // an ordinary page: its content must not end underneath the tab bar
    const page = await browser.newPage({ viewport: PHONE });
    await watch(page);
    await page.goto(base + "#mission", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const clear = await page.evaluate(() => {
      const st = document.querySelector(".stage");
      const pad = parseFloat(getComputedStyle(st).paddingBottom) || 0;
      const barH = document.querySelector(".tabbar").getBoundingClientRect().height;
      return { pad: Math.round(pad), barH: Math.round(barH) };
    });
    check("a page's bottom padding clears the tab bar", clear.pad >= clear.barH, JSON.stringify(clear));
    await page.close();
  }

  /* ================= 3. the Atlas rail's year labels never overlap =================
     They are positioned off year2frac, so a label that would collide is DROPPED by layoutTicks() rather
     than nudged — moving one off its year would make it a lie. The two ENDS are what fix the scale and
     are always kept. */
  for (const vp of [PHONE, { width: 480, height: 820 }, { width: 900, height: 900 }, DESKTOP]) {
    const page = await browser.newPage({ viewport: vp });
    await watch(page);
    await atlas(page, base);
    const t = await page.evaluate(() => {
      const all = [...document.querySelectorAll(".tl-tick")];
      const box = document.querySelector(".tl-ticks").getBoundingClientRect();
      const vis = all.filter((e) => e.checkVisibility()).map((e) => { const b = e.getBoundingClientRect(); return { txt: e.textContent.trim(), l: b.left, r: b.right }; });
      return { n: all.length, vis: vis, first: all[0].checkVisibility(), last: all[all.length - 1].checkVisibility(), box: { l: box.left, r: box.right } };
    });
    const tag = vp.width + "px";
    let overlap = null;
    for (let i = 1; i < t.vis.length; i++) if (t.vis[i].l < t.vis[i - 1].r) overlap = t.vis[i - 1].txt + " / " + t.vis[i].txt;
    check("[" + tag + "] no two year labels overlap", !overlap, overlap || t.vis.map((v) => v.txt).join(" · "));
    check("[" + tag + "] ...the two ends are always kept", t.first && t.last, JSON.stringify({ first: t.first, last: t.last }));
    check("[" + tag + "] ...and at least three of them survive", t.vis.length >= 3, String(t.vis.length));
    check("[" + tag + "] ...none hanging outside the rail", t.vis.every((v) => v.l >= t.box.l - 2 && v.r <= t.box.r + 2),
      JSON.stringify({ box: [Math.round(t.box.l), Math.round(t.box.r)], out: t.vis.filter((v) => v.l < t.box.l - 2 || v.r > t.box.r + 2).map((v) => v.txt) }));
    await page.close();
  }

  /* ================= 4. the Atlas chrome as chips on a phone ================= */
  {
    const page = await browser.newPage({ viewport: PHONE, hasTouch: true });
    await watch(page);
    await atlas(page, base);
    const chips = await page.evaluate(() => {
      const r = (s) => { const e = document.querySelector(s); const b = e.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), shown: e.checkVisibility() }; };
      const stage = document.querySelector(".globe-stage").getBoundingClientRect();
      const legend = document.querySelector("#globeLegend").getBoundingClientRect();
      const search = document.querySelector("#globeSearch").getBoundingClientRect();
      return { toggle: r("#gsToggle"), legend: r("#globeLegend"), field: r("#gsInput"),
        cover: Math.round(((legend.width * legend.height) + (search.width * search.height)) / (stage.width * stage.height) * 1000) / 10 };
    });
    // this is the assertion that would have caught the source-order bug: the desktop `display:none` and the
    // phone rule have equal specificity, so the chip silently never rendered
    check("the search collapses to a chip", chips.toggle.shown && chips.toggle.w <= 40, JSON.stringify(chips.toggle));
    check("...and the legend to another", chips.legend.shown && chips.legend.w <= 40, JSON.stringify(chips.legend));
    check("...with the field itself put away", !chips.field.shown);
    check("together they cover under 3% of the map", chips.cover < 3, chips.cover + "%");

    // .click() on an element the CSS has hidden waits 30s and then THROWS, taking the rest of the file with
    // it — and a missing chip is exactly what this section exists to catch, so it has to REPORT, not abort
    await page.evaluate(() => { const b = document.querySelector("#gsToggle"); if (b) b.click(); });
    await page.waitForTimeout(400);
    const open = await page.evaluate(() => {
      const i = document.querySelector("#gsInput"), b = i.getBoundingClientRect();
      return { w: Math.round(b.width), focused: document.activeElement === i, legend: document.querySelector("#globeLegend").checkVisibility(), stageW: Math.round(document.querySelector(".globe-stage").getBoundingClientRect().width) };
    });
    check("tapping it gives the field the width of the stage", open.w > open.stageW * 0.8, open.w + " of " + open.stageW);
    check("...with the cursor already in it", open.focused);
    check("...and the legend chip out of its way", !open.legend);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    check("Escape puts it back to a chip", await page.evaluate(() => document.querySelector("#gsToggle").checkVisibility() && !document.querySelector("#gsInput").checkVisibility()));

    await page.evaluate(() => { const b = document.querySelector("#legendCollapse"); if (b) b.click(); });
    await page.waitForTimeout(350);
    const leg = await page.evaluate(() => { const b = document.querySelector("#globeLegend").getBoundingClientRect(); return { w: Math.round(b.width), rows: document.querySelectorAll("#globeLegend .legend-row").length, bodyShown: document.querySelector("#legendBody").checkVisibility() }; });
    check("tapping the legend chip opens the legend", leg.bodyShown && leg.w > 90, JSON.stringify(leg));
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    await watch(page);
    await atlas(page, base);
    const d = await page.evaluate(() => ({
      chip: document.querySelector("#gsToggle").checkVisibility(),
      field: document.querySelector("#gsInput").checkVisibility(),
      legendBody: document.querySelector("#legendBody").checkVisibility(),
    }));
    check("on a desktop the search is a plain field, not a chip", d.field && !d.chip, JSON.stringify(d));
    check("...and the legend opens on arrival", d.legendBody);

    // Copy link was taken off the place panel (Aug 2026, on request). The #map/<year>/<slug> deep link
    // itself stays — links already shared have to go on working, and nothing on screen says they do.
    await page.evaluate(() => { const i = document.querySelector("#gsInput"); i.focus(); i.value = "France"; i.dispatchEvent(new Event("input", { bubbles: true })); });
    await page.waitForTimeout(700);
    await page.evaluate(() => { const r = document.querySelector(".gs-row"); if (r) r.click(); });
    await page.waitForTimeout(2500);
    const cp = await page.evaluate(() => ({
      open: !!document.querySelector("#countryPop") && !document.querySelector("#countryPop").hidden,
      tools: [...document.querySelectorAll(".cp-tools .cp-tool")].map((b) => b.textContent.trim()),
      copy: !!document.querySelector("#cpCopyLink"),
    }));
    check("a place panel opens", cp.open, JSON.stringify(cp));
    check("...carrying no Copy link chip", !cp.copy && !cp.tools.some((t) => /copy/i.test(t)), cp.tools.join(" · "));
    check("...but keeping Through the ages", cp.tools.some((t) => /ages/i.test(t)), cp.tools.join(" · "));
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    await watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.evaluate(() => localStorage.setItem("folio_atlas_tour_v1", "1"));
    await page.goto(base + "#map/1938/france", { waitUntil: "load" });
    await page.waitForTimeout(5000);
    const deep = await page.evaluate(() => ({
      open: !!document.querySelector("#countryPop") && !document.querySelector("#countryPop").hidden,
      name: ((document.querySelector("#cpName") || {}).textContent || "").trim(),
    }));
    check("a link shared before the chip was removed still resolves", deep.open && /fren|fran/i.test(deep.name), JSON.stringify(deep));
    await page.close();
  }

  /* ================= 5. the one-row grade bar under 430px ================= */
  {
    const page = await browser.newPage({ viewport: PHONE });
    await watch(page);
    await studyEasy(page, base, 0);

    /* THE CLOZE FIELD IS AS WIDE AS WHAT IS TYPED IN IT (Aug 2026, on a bug report: "the blank underscores
       always extend far beyond the typed text"). It was sized in `ch`, the advance of the digit "0", which
       in the card's serif is far wider than a lowercase letter — so the underline trailed a third of a line
       past the last word. Measured against the hidden sizer span rather than against a number written down
       here, since the right width IS the text's width and depends on the face, the letter-spacing and the
       reader's text-size setting. Both ends matter: an EMPTY field must still be the static blank's width,
       or an untouched question changes shape for no reason. */
    {
      const cz = await page.evaluate(() => {
        const i = document.querySelector(".blank-input");
        if (!i) return null;
        const read = (t) => {
          i.value = t; i.dispatchEvent(new Event("input", { bubbles: true }));
          const s = i.parentElement.querySelector(".blank-sizer");
          return { box: parseFloat(getComputedStyle(i).width), text: s ? s.getBoundingClientRect().width : null };
        };
        const empty = read("");
        const short = read("Cy");
        const long = read("Cycladic civilization");
        i.value = ""; i.dispatchEvent(new Event("input", { bubbles: true }));
        return { empty, short, long };
      });
      check("a typed cloze answer sizes the field to the TEXT, not to a character count",
        cz && Math.abs(cz.long.box - cz.long.text) <= 2, JSON.stringify(cz && cz.long));
      check("...and an empty one keeps the static blank's width",
        cz && cz.empty.box > cz.short.text && Math.abs(cz.empty.box - cz.short.box) <= 1, JSON.stringify(cz && cz.empty));
    }

    await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
    await page.waitForTimeout(700);
    const gb = await page.evaluate(() => {
      const bar = document.querySelector("#gradebar").getBoundingClientRect();
      return {
        cols: getComputedStyle(document.querySelector(".grades")).gridTemplateColumns.split(/\s+/).length,
        gk: document.querySelector(".grade .gk").checkVisibility(),
        h: Math.round(bar.height),
        pad: Math.round(parseFloat(getComputedStyle(document.querySelector(".stage")).paddingBottom) || 0),
        vh: window.innerHeight,
      };
    });
    check("the four grades sit on ONE row", gb.cols === 4, String(gb.cols));
    check("...without the digits, which name keys a phone has not got", !gb.gk);
    check("...taking under a fifth of the screen", gb.h < gb.vh * 0.2, gb.h + " of " + gb.vh);
    // the card's last line must not end underneath it
    check("the study page's bottom padding clears the bar", gb.pad >= gb.h, JSON.stringify({ pad: gb.pad, bar: gb.h }));

    /* …and its HEIGHT is the reader's, by the grip along its top edge (Aug 2026, on request). Two positions
       and no third: the short one is a different ARRANGEMENT, not the same bar smaller. What this pins is
       that the short one is genuinely half the tall one (a "compact" state that saves 15px is not what was
       asked for), that nothing is LOST getting there — the ?, Suspend and the four grades are all still on
       screen and still named to a screen reader, which a display:none would have taken away — and that the
       page's bottom padding follows it down, since a bar that shrinks under a padding that doesn't leaves
       a band of dead card. */
    const read = () => page.evaluate(() => {
      const bar = document.querySelector("#gradebar").getBoundingClientRect();
      const gs = [...document.querySelectorAll(".grade")];
      const vis = (s) => { const e = document.querySelector(s); return !!(e && e.checkVisibility()); };
      return {
        h: Math.round(bar.height),
        compact: document.body.classList.contains("gb-compact"),
        rows: new Set(gs.map((g) => Math.round(g.getBoundingClientRect().top))).size,
        // the words are gone from the buttons — the interval is what a reader SEES disappear
        gi: gs.some((g) => g.querySelector(".gi").checkVisibility()),
        // the LABEL is measured, not asked: it is clipped to a pixel rather than display:none, and
        // checkVisibility() reports a clipped element as visible
        gl: gs.some((g) => g.querySelector(".gl").getBoundingClientRect().width > 4),
        // …and clipped is exactly what keeps it in the accessibility tree, which display:none would not
        named: gs.every((g) => { const cs = getComputedStyle(g.querySelector(".gl")); return cs.display !== "none" && cs.visibility !== "hidden" && (g.textContent || "").trim().length > 0; }),
        help: vis(".grade-help"), suspend: vis(".suspendbtn"),
        // the ? and Suspend join the colours on the same line rather than being dropped
        oneLine: (() => {
          const b = [document.querySelector(".grade-help"), document.querySelector(".suspendbtn"), gs[0]]
            .filter(Boolean).map((e) => e.getBoundingClientRect());
          return Math.max(...b.map((r) => r.top)) < Math.min(...b.map((r) => r.bottom));
        })(),
        pad: Math.round(parseFloat(getComputedStyle(document.querySelector(".stage")).paddingBottom) || 0),
      };
    });
    /* A CHEVRON since Aug 2026, not a drag grip (on request): the bar has exactly two heights, so a drag
       was a gesture whose whole range mapped onto one bit. What is asserted is unchanged — the short state
       must genuinely halve the bar, keep the four grades named to a screen reader, and take the page's
       padding down with it — only the way in is a press. */
    /* 450ms, not 250: the fold is ANIMATED since Aug 2026 (on request — it was a hard cut), and the
       bar's height is part of what moves. Reading it before GB_FOLD_MS has elapsed measures a height
       half way between the two states, which fails an assertion about the short one for a reason that
       has nothing to do with the short one. */
    const fold = () => page.evaluate(async () => {
      document.querySelector(".gb-fold").click();
      await new Promise((r2) => setTimeout(r2, 450));
    });
    const foldSeen = await page.evaluate(() => {
      const g = document.querySelector(".gb-fold");
      return g && g.checkVisibility() ? (g.tagName + ":" + g.getAttribute("aria-expanded")) : "";
    });
    check("the grade bar carries a chevron to fold it", foldSeen === "BUTTON:true", foldSeen || "no .gb-fold");
    const tall = await read();
    await fold();
    const short = await read();
    check("...pressing it halves the bar", short.compact && short.h <= tall.h * 0.6,
      JSON.stringify({ tall: tall.h, short: short.h }));
    check("...and says which state it is in", await page.evaluate(() => document.querySelector(".gb-fold").getAttribute("aria-expanded")) === "false");
    check("...leaving the four grades side by side as bare colours",
      short.rows === 1 && !short.gi && !short.gl, JSON.stringify(short));
    check("...still named to a screen reader, which display:none would not be", short.named);
    check("...with the ? and Suspend beside them, not dropped", short.help && short.suspend && short.oneLine, JSON.stringify(short));
    check("...and the page's bottom padding down with it", short.pad < tall.pad && short.pad >= short.h,
      JSON.stringify({ tall: tall.pad, short: short.pad, bar: short.h }));
    await fold();
    const back = await read();
    check("...pressing it again restores the bar", !back.compact && back.h === tall.h && back.gi,
      JSON.stringify({ tall: tall.h, back: back.h }));
    await page.close();
  }
  {
    // the height is remembered on the device, so the next card opens the way the last one was left
    const page = await browser.newPage({ viewport: PHONE });
    await watch(page);
    await studyEasy(page, base, 0);
    await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
    await page.waitForTimeout(600);
    await page.evaluate(async () => {
      document.querySelector(".gb-fold").click();
      await new Promise((r2) => setTimeout(r2, 250));
    });
    await studyEasy(page, base, 0);
    await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
    await page.waitForTimeout(600);
    check("...and remembered for the next card", await page.evaluate(() => document.body.classList.contains("gb-compact")));
    await page.close();
  }
  {
    /* THE FOLD MUST NOT LEAVE THE GRADES UN-PRESSABLE (Aug 2026, on a bug report: "the chevron to
       expand/collapse the grading buttons sometimes bugs out after a few times and the buttons can no
       longer be pressed"). A fold FLIPs about twenty elements, and nothing used to cancel the previous
       set — so pressing the chevron again mid-flight left up to fifty concurrent transform animations on
       the four grade buttons. While those run, Chromium's hit-testing and getBoundingClientRect disagree:
       elementFromPoint at a button's own centre returns #gradebar, so a real tap lands on the bar's
       background and the grade never fires — and a tap that lands in that gap can leave the bar
       un-hittable with no animation left running at all.
       It is asserted with REAL MOUSE INPUT and by the CARD CHANGING, not by clicking the element from
       script: el.click() bypasses hit-testing entirely, which is the whole of what breaks here, so a
       scripted version passes on the bug. Every count reads healthy throughout — the buttons are there, the
       right size, in the right place, with their listeners attached — so nothing but this can see it. */
    const page = await browser.newPage({ viewport: PHONE });
    await watch(page);
    await studyEasy(page, base, 0);
    const chev = async () => {
      const b = await page.$(".gb-fold");
      const r = await b.boundingBox();
      await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2);
    };
    /* Six grades takes a fresh reader past level 2 (XP_PER_LEVEL is 5), and a level buys an artefact
       chest whose overlay sits over the card and swallows every REAL pointer event — so the chevron
       presses land on nothing, the grade's own centre hit-tests to the overlay, and the round reports a
       jam that is the reward working exactly as designed. It shows as 1 of 6 because the scripted reveal
       (`el.click()`) goes through regardless, so only the real-input half of the round is blocked. The
       chests are dismissed at the head of each round and COUNTED, since a dismissal that silently stopped
       firing would put the false failure back. */
    let jammed = 0, ungraded = 0, chests = 0;
    for (let i = 0; i < 6; i++) {
      if (await page.$(".chest-pop")) { await page.keyboard.press("Escape"); await page.waitForTimeout(250); chests++; }
      await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
      await page.waitForTimeout(420);
      // hammer it: the second press lands while the first fold is still in flight, which is the case
      await chev(); await page.waitForTimeout(90);
      await chev(); await page.waitForTimeout(90);
      await chev(); await page.waitForTimeout(GB_SETTLE);
      const hit = await page.evaluate(() => {
        const g = document.querySelector(".grade.good"); if (!g) return "none";
        const r = g.getBoundingClientRect();
        const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return el && el.closest(".grade") ? "grade" : (el ? el.tagName + "." + el.className : "null");
      });
      if (hit !== "grade") jammed++;
      const before = await page.evaluate(() => { try { return JSON.parse(sessionStorage.getItem("folio_study_v1")).id; } catch (e) { return null; } });
      const box = await (await page.$(".grade.good")).boundingBox();
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(700);
      const after = await page.evaluate(() => { try { return JSON.parse(sessionStorage.getItem("folio_study_v1")).id; } catch (e) { return null; } });
      if (after === before) ungraded++;
    }
    check("the grade buttons stay hit-testable through repeated folding", jammed === 0, jammed + "/6 rounds the button's own centre hit something else");
    check("...and a real tap still grades the card", ungraded === 0, ungraded + "/6 rounds the tap did nothing");
    check("...with the level-up chest dismissed rather than left to swallow the taps", chests > 0, chests + " chests met");
    /* …and while a fold IS running the bar's contents are inert rather than half-moved targets — the other
       half of the fix, and the half no amount of cancelling afterwards can replace. The CHEVRON stays live
       throughout, or a reader could not fold it back. */
    /* The loop ends on a GRADE, which moves to the next card and hides the bar — and `#gradebar` is only
       `pointer-events:auto` while it carries `.show`, so a probe run here reads `none` on everything and
       reports a fold that never started. (It passed before the chest was dismissed above, for the wrong
       reason: round 6's grade was being swallowed, so the bar was still up.) Reveal again first, and clear
       any chest that grade may have bought. */
    if (await page.$(".chest-pop")) { await page.keyboard.press("Escape"); await page.waitForTimeout(250); }
    await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
    await page.waitForTimeout(500);
    check("...the grade bar is up again to fold", await page.evaluate(() => {
      const b = document.querySelector("#gradebar");
      return !!(b && b.classList.contains("show"));
    }));
    const mid = await page.evaluate(async () => {
      document.querySelector(".gb-fold").click();
      await new Promise((r) => setTimeout(r, 60));
      const inner = getComputedStyle(document.querySelector(".gradebar-inner")).pointerEvents;
      const chevPE = getComputedStyle(document.querySelector(".gb-fold")).pointerEvents;
      return { folding: document.body.classList.contains("gb-folding"), inner: inner, chev: chevPE };
    });
    check("...while it moves, the bar's contents do not hit-test", mid.folding && mid.inner === "none", JSON.stringify(mid));
    check("...but the chevron does, so the reader can fold it back", mid.chev !== "none", mid.chev);
    await page.waitForTimeout(GB_SETTLE);
    const done2 = await page.evaluate(() => ({ folding: document.body.classList.contains("gb-folding"), inner: getComputedStyle(document.querySelector(".gradebar-inner")).pointerEvents }));
    check("...and they are live again the moment it settles", !done2.folding && done2.inner !== "none", JSON.stringify(done2));
    await page.close();
  }
  {
    // above the breakpoint there is nothing to reclaim: one comfortable row already, and no chevron
    const page = await browser.newPage({ viewport: DESKTOP });
    await watch(page);
    await studyEasy(page, base, 0);
    await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
    await page.waitForTimeout(600);
    check("the chevron is phone-only", !(await page.evaluate(() => { const g = document.querySelector(".gb-fold"); return !!(g && g.checkVisibility()); })));
    await page.close();
  }

  /* ================= 5b. Undo, in the grade bar on a phone =================
     The study bar sits above a card that runs several screens, so on a phone the one way back from a
     misclicked grade was scrolled off the top at exactly the moment it was wanted. It is repeated in the
     grade bar beside the ? that explains it — and the study bar's copy steps aside while it is there, so
     a card never shows two. Both halves have to hold, or a reader gets a duplicate or nothing at all. */
  for (const vp of [PHONE, DESKTOP]) {
    const page = await browser.newPage({ viewport: vp });
    await watch(page);
    await studyEasy(page, base, 1);            // one graded card is what makes Undo exist at all
    await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
    await page.waitForTimeout(700);
    const u = await page.evaluate(() => {
      const gbU = document.querySelector("#undoGradeBar"), sbU = document.querySelector("#undoGrade");
      const help = document.querySelector(".grade-help");
      const r = (e) => { const b = e.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top) }; };
      return {
        inBar: !!gbU && gbU.checkVisibility(), inStudyBar: !!sbU && sbU.checkVisibility(),
        pos: gbU && gbU.checkVisibility() ? r(gbU) : null, help: r(help),
        grades: r(document.querySelector(".grades")),
      };
    });
    const tag = vp.width + "px";
    if (vp === PHONE) {
      check("[" + tag + "] Undo is in the grade bar", u.inBar);
      check("[" + tag + "] ...just right of the ? and below the four grades",
        !!u.pos && u.pos.l > u.help.l && u.pos.t > u.grades.t, JSON.stringify(u));
      check("[" + tag + "] ...and the study bar's copy has stepped aside", !u.inStudyBar);
    } else {
      check("[" + tag + "] the grade bar carries no second Undo", !u.inBar);
      check("[" + tag + "] ...the study bar keeps the only one", u.inStudyBar);
    }
    await page.close();
  }

  /* ================= 5d. the whiteboard marker drags anywhere =================
     The handle IS the toggle button, so every press has to be classified: under the slop it toggles
     drawing, past it it moves the marker and the click that follows pointerup must be swallowed. Both
     failures are silent and opposite — a marker that cannot be moved, or one that turns drawing on every
     time you move it. The panel is anchored to the button rather than sharing a flex column with it, so
     the button must not jump when the panel opens, and the panel must open on the side there is room on.

     THE MARKER HAS MOMENTUM SINCE AUG 2026, so a drag has to end the way a reader ending one does — by
     coming to rest before letting go. Released still moving, it is a THROW and carries on past the
     pointer, which is the whole point of the feature; this section's "follows the pointer" therefore
     pauses before the lift, and the throw is asserted separately below. Both directions matter: a drag
     that overshoots where it was put is as wrong as a throw that stops dead. */
  for (const vp of [PHONE, DESKTOP]) {
    const page = await browser.newPage({ viewport: vp, hasTouch: vp === PHONE });
    await watch(page);
    await studyEasy(page, base, 0);
    const at = await page.evaluate(() => {
      const t = document.querySelector(".wb-tools");
      if (!t || !t.checkVisibility()) return null;
      const b = t.getBoundingClientRect();
      return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2), w: Math.round(b.width), h: Math.round(b.height) };
    });
    const tag = vp.width + "px";
    check("[" + tag + "] the marker is on the study page", !!at, at);
    if (at) {
      // to the top-left quarter — far enough that it has to flip the panel on a phone
      const target = { x: Math.round(vp.width * 0.25), y: Math.round(vp.height * 0.3) };
      await page.mouse.move(at.x, at.y);
      await page.mouse.down();
      await page.mouse.move(at.x - 30, at.y - 30, { steps: 5 });
      await page.mouse.move(target.x, target.y, { steps: 10 });
      await page.waitForTimeout(220);   // come to rest before letting go — this is a PLACEMENT, not a throw
      await page.mouse.up();
      await page.waitForTimeout(400);   // long enough that any fling would have finished
      const pos = () => page.evaluate(() => {
        const t = document.querySelector(".wb-tools"), b = t.getBoundingClientRect();
        return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2), l: Math.round(b.left), t: Math.round(b.top),
          drawing: t.classList.contains("active"), stored: !!localStorage.getItem("folio_wb_pos_v1") };
      });
      const moved = await pos();
      check("[" + tag + "] dragging it follows the pointer", Math.abs(moved.x - target.x) <= 3 && Math.abs(moved.y - target.y) <= 3, JSON.stringify(moved));
      check("[" + tag + "] ...without the drag also switching drawing on", !moved.drawing);
      check("[" + tag + "] ...and where it was put is remembered", moved.stored);
      /* …and released STILL MOVING it is a throw, which must carry on past the pointer and still come to
         rest on screen. Two failures this catches, and they are opposite: a fling that never fires (the
         marker stops dead, which is the behaviour the momentum request replaced) and one that fires too
         hard (the first cut could carry ~500px, which on a 390px phone is the whole screen — a drag felt
         like the marker had been fired out of the reader's hand). */
      await page.mouse.move(moved.x, moved.y);
      await page.mouse.down();
      for (let i = 1; i <= 6; i++) { await page.mouse.move(moved.x + i * 13, moved.y + i * 4); await page.waitForTimeout(14); }
      const atLift = await pos();
      await page.mouse.up();
      await page.waitForTimeout(700);
      const flung = await pos();
      const carried = Math.hypot(flung.x - atLift.x, flung.y - atLift.y);
      check("[" + tag + "] ...and a throw carries on past the release", carried > 6,
        JSON.stringify({ carried: Math.round(carried), atLift: [atLift.x, atLift.y], flung: [flung.x, flung.y] }));
      check("[" + tag + "] ...but never off the screen, or further than a screen's worth",
        flung.l >= 4 && flung.t >= 4 && flung.l <= vp.width - 40 && flung.t <= vp.height - 40 && carried < 260,
        JSON.stringify({ carried: Math.round(carried), l: flung.l, t: flung.t, vp: [vp.width, vp.height] }));
      // put it back where the rest of this section expects to find it
      await page.mouse.move(flung.x, flung.y);
      await page.mouse.down();
      await page.mouse.move(target.x, target.y, { steps: 8 });
      await page.waitForTimeout(220);
      await page.mouse.up();
      await page.waitForTimeout(300);
      Object.assign(moved, await pos());
      await page.mouse.click(moved.x, moved.y);
      await page.waitForTimeout(250);
      const opened = await page.evaluate(() => {
        const t = document.querySelector(".wb-tools"), b = t.getBoundingClientRect(), p = t.querySelector(".wb-panel").getBoundingClientRect();
        return { on: t.classList.contains("active"), l: Math.round(b.left), t: Math.round(b.top),
          p: { l: Math.round(p.left), t: Math.round(p.top), r: Math.round(p.right), b: Math.round(p.bottom) }, vw: innerWidth, vh: innerHeight };
      });
      check("[" + tag + "] a press that did not move it still toggles drawing", opened.on);
      check("[" + tag + "] ...the button stays put as the panel opens", near(opened.l, moved.l, 2) && near(opened.t, moved.t, 2), JSON.stringify({ moved, opened }));
      check("[" + tag + "] ...and the panel opens fully on screen",
        opened.p.l >= 0 && opened.p.t >= 0 && opened.p.r <= opened.vw && opened.p.b <= opened.vh, JSON.stringify(opened.p));
      // it is a device setting, so it has to survive leaving the page and coming back
      await studyEasy(page, base, 0);
      const again = await page.evaluate(() => { const b = document.querySelector(".wb-tools").getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) }; });
      check("[" + tag + "] the marker comes back where it was left", Math.abs(again.x - target.x) <= 3 && Math.abs(again.y - target.y) <= 3, JSON.stringify(again));

      /* …AND IT SNAPS HOME (Aug 2026, on request). Let go within WB_SNAP_HOME of the corner it started in
         and it slides the rest of the way and FORGETS the position, so it lines up with everything else in
         that corner again. Three things are asserted and all three fail silently:
         · a drop well outside the threshold must NOT snap — a marker that jumps home from anywhere is a
           marker that cannot be placed near its own corner at all;
         · the stored position must be GONE rather than set to the default's numbers, or the marker would
           sit still while `body.grading` lifted the corner out from under it;
         · and THE SLIDE MUST AIM AT THE STYLESHEET'S CORNER, which has to be read MID-FLIGHT. That is the
           real bug this had: `.wb-tools` transitions `bottom`, so the probe that measures the default read
           the marker's own current bottom instead of the CSS one, the snap test became right-axis-only and
           the slide travelled somewhere the stylesheet never chose. **The finished position cannot see
           it** — the timer then forgets the position and the CSS takes over, so the marker ends up right
           whatever the slide aimed at (asserted with the bug deliberately reintroduced: the settled
           position passed unchanged). What differs is the inline right/bottom written when the slide
           begins, so those are what is compared against the corner captured before this section moved
           anything. Same rule as the chapter slide and the page swipe: a movement is asserted while it is
           moving, or a hard cut passes for it. */
      const home = at;   // where the stylesheet put it before any of this section moved it
      const homeRB = await page.evaluate((h) => ({ r: innerWidth - (h.x + h.w / 2), b: innerHeight - (h.y + h.h / 2) }), home);
      const drop = async (x, y) => {
        const p = await pos();
        await page.mouse.move(p.x, p.y);
        await page.mouse.down();
        await page.mouse.move(x, y, { steps: 8 });
        await page.waitForTimeout(220);         // a PLACEMENT, not a throw
        await page.mouse.up();
        // the slide's TARGET, read before it has travelled — this is the only place the aim is visible
        const aim = await page.evaluate(() => {
          const t = document.querySelector(".wb-tools");
          return { homing: t.classList.contains("wb-homing"), r: parseFloat(t.style.right), b: parseFloat(t.style.bottom) };
        });
        await page.waitForTimeout(450);         // past WB_HOME_MS and any fling
        return Object.assign(await pos(), { aim });
      };
      const outside = await drop(home.x - 90, home.y - 90);
      check("[" + tag + "] dropped well clear of its corner, it stays put",
        Math.hypot(outside.x - home.x, outside.y - home.y) > 40 && outside.stored && !outside.aim.homing, JSON.stringify(outside));
      const homed = await drop(home.x - 12, home.y - 12);
      check("[" + tag + "] ...but dropped near it, it SLIDES rather than jumping", homed.aim.homing, JSON.stringify(homed.aim));
      check("[" + tag + "] ...aimed at the stylesheet's own corner, on BOTH axes",
        near(homed.aim.r, homeRB.r, 1) && near(homed.aim.b, homeRB.b, 1), JSON.stringify({ aim: homed.aim, want: homeRB }));
      check("[" + tag + "] ...and arrives there", Math.abs(homed.x - home.x) <= 2 && Math.abs(homed.y - home.y) <= 2, JSON.stringify({ homed, home }));
      check("[" + tag + "] ...forgetting the position, so the stylesheet's corner rules again", !homed.stored);

      /* The pen and the tools are two states. They were one until Aug 2026, when putting the tools away
         also put the pen down — you could not draw with the panel out of the way, which on a phone is most
         of the card. What stops the drawing is unselecting the tool INSIDE the panel — and since the Draw
         button went (Aug 2026, on request) the SIZES are that tool: `.wb-size.on` is the pen, down at that
         width, and clicking it again is what lifts it. */
      const wb = () => page.evaluate(() => {
        const t = document.querySelector(".wb-tools");
        const on = [...t.querySelectorAll(".wb-btn.sel, .wb-size.on")].map((b) => (b.classList.contains("wb-size") ? "pen" : b.className.replace(/wb-btn |sel| /g, "")));
        return { panel: t.querySelector(".wb-panel").checkVisibility(),
          drawing: t.querySelector(".wb-toggle").classList.contains("on"),
          canvas: !!document.querySelector(".draw-canvas.on"),
          sel: on.join(",") };
      });
      const marker = await page.evaluate(() => { const b = document.querySelector(".wb-tools").getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) }; });
      await page.mouse.click(marker.x, marker.y);          // open
      await page.waitForTimeout(200);
      const opened2 = await wb();
      /* Opening the tools selects NOTHING (Aug 2026, on request; this asserted the opposite until then).
         `enabled` lays a canvas over the whole page, so a reader who opened the menu to reach Undo, Clear,
         a colour or the stylus row had the card taken away from them for asking. The panel is a menu, and
         choosing from it is what starts drawing — which is the next assertion, and the two fail in opposite
         directions: without both, "nothing is selected" would also pass on a marker that had stopped
         working at all. */
      check("[" + tag + "] opening the tools selects no tool", opened2.panel && !opened2.drawing && !opened2.canvas && opened2.sel === "", JSON.stringify(opened2));
      await page.evaluate(() => { const b = document.querySelector(".wb-size"); if (b) b.click(); });
      await page.waitForTimeout(200);
      const picked = await wb();
      check("[" + tag + "] ...and choosing one is what starts drawing", picked.drawing && picked.canvas && picked.sel === "pen", JSON.stringify(picked));
      await page.mouse.click(marker.x, marker.y);          // close — the pen must stay down
      await page.waitForTimeout(200);
      const shut = await wb();
      check("[" + tag + "] putting the tools away leaves the pen down", !shut.panel && shut.drawing && shut.canvas, JSON.stringify(shut));
      await page.mouse.click(marker.x, marker.y);          // open again, then unselect the pen
      await page.waitForTimeout(200);
      await page.evaluate(() => { const b = document.querySelector(".wb-size.on"); if (b) b.click(); });
      await page.waitForTimeout(200);
      const off = await wb();
      check("[" + tag + "] unselecting the tool is what stops the drawing", off.panel && !off.drawing && !off.canvas && off.sel === "", JSON.stringify(off));
    }
    await page.close();
  }

  /* ================= 5e. the editor's way in =================
     Edit left the phone's tab bar (six destinations a reader shares; the editor is one person's tool) for a
     button at the top right of the page — plain on Home, and on a study card pointing at THAT card. Above
     the breakpoint the top bar's Edit tab is still the way in and the plain copy must not double it. */
  for (const vp of [PHONE, DESKTOP]) {
    const page = await browser.newPage({ viewport: vp });
    await watch(page);
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1400);
    const tag = vp.width + "px";
    const home = await page.evaluate(() => {
      const f = document.querySelector("#admin-edit-fab");
      const b = f && f.getBoundingClientRect();
      return { shown: !!f && f.checkVisibility(), plain: !!f && f.classList.contains("aef-plain"),
        right: b ? Math.round(innerWidth - b.right) : null, top: b ? Math.round(b.top) : null, vw: innerWidth, vh: innerHeight,
        tabbarEdit: !!document.querySelector(".tabbar .tab[data-route='admin']"), topbarEdit: !!document.querySelector(".topbar .tab[data-route='admin']"),
        adminTabs: [...document.querySelectorAll(".tab.tab-admin")].map((t) => t.dataset.route) };
    });
    check("[" + tag + "] the tab bar no longer carries Edit", !home.tabbarEdit);
    check("[" + tag + "] ...the top bar still does", home.topbarEdit);
    if (vp === PHONE) {
      check("[" + tag + "] Home carries the editor button", home.shown && home.plain, JSON.stringify(home));
      check("[" + tag + "] ...at the TOP right", home.shown && home.right < 40 && home.top < home.vh / 4, JSON.stringify(home));
      await page.evaluate(() => document.querySelector("#admin-edit-fab").click());
      await page.waitForTimeout(900);
      check("[" + tag + "] ...and it opens the editor", (await page.evaluate(() => location.hash)) === "#admin");
    } else {
      check("[" + tag + "] Home does NOT double the top bar's Edit tab", !home.shown, JSON.stringify(home));
    }

    // on a study card it points at that card, at every width
    await studyEasy(page, base, 0);
    const study = await page.evaluate(() => {
      const f = document.querySelector("#admin-edit-fab");
      const b = f && f.getBoundingClientRect();
      const q = document.querySelector(".study-card .question");
      return { shown: !!f && f.checkVisibility(), plain: !!f && f.classList.contains("aef-plain"),
        right: b ? Math.round(innerWidth - b.right) : null, top: b ? Math.round(b.top) : null, vh: innerHeight,
        overlapsQuestion: !!(b && q && b.bottom > q.getBoundingClientRect().top && b.top < q.getBoundingClientRect().bottom && b.right > q.getBoundingClientRect().left) };
    });
    check("[" + tag + "] a study card carries it too", study.shown && !study.plain, JSON.stringify(study));
    if (vp === PHONE) check("[" + tag + "] ...also at the top right, clear of the question", study.right < 40 && study.top < study.vh / 4 && !study.overlapsQuestion, JSON.stringify(study));
    await page.evaluate(() => document.querySelector("#admin-edit-fab").click());
    await page.waitForTimeout(1200);
    const routed2 = await page.evaluate(() => ({ hash: location.hash, card: !!document.querySelector(".admin-live-card") }));
    check("[" + tag + "] ...and opens THAT card in the editor", routed2.hash === "#admin" && routed2.card, JSON.stringify(routed2));

    /* A reader must never see it — it used to be built on every study card, admin or not.
       A READER IS SOMEBODY `adminEligible()` SAYS NO TO, and until Aug 2026 this faked one by writing
       `settings.adminMode = false`, the Editor / Visitor chip's own flag. That chip is gone from the menu
       bar, and `load()` now clears a stored `false` — the chip was the only thing that ever wrote it, so
       leaving it set would strand an editor in the visitor view with no control to return with. So the
       flag no longer makes a reader, and faking one that way would be asserting against a state the app
       repairs on sight.
       What makes a reader on a dev origin is a LEGACY LOCAL ACCOUNT whose role is not admin:
       `adminEligible()` reads `currentUser().role` before it ever reaches the guest-on-dev-origin branch,
       so this is a reader by the same test the live site applies to a signed-in non-admin.
       reload(), not goto(#hash): a URL differing only in the fragment is a same-document navigation, so
       the app keeps running and the module state would never see this write (see the note in CLAUDE.md). */
    await page.evaluate(() => localStorage.setItem("folio_acct_v1", JSON.stringify({
      users: { reader: { name: "reader", role: "user", friends: [], requests: { in: [], out: [] } } },
      current: "reader", guest: null,
    })));
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1200);
    await studyEasy(page, base, 0);
    check("[" + tag + "] a reader gets no Edit button at all", !(await page.evaluate(() => !!document.querySelector("#admin-edit-fab"))));
    /* An admin-only TAB is hidden the same way, and is asserted separately because it fails differently:
       the Edit tab has a button of its own to fall back on and War of Ages has none, so a tab left showing
       is the only thing between a reader and a page written for nobody but the editor. */
    const readerTabs = await page.evaluate(() =>
      [...document.querySelectorAll(".tab.tab-admin")].map((t) => ({ r: t.dataset.route, on: t.checkVisibility() })));
    check("[" + tag + "] ...nor any admin-only tab", readerTabs.length > 0 && readerTabs.every((t) => !t.on), JSON.stringify(readerTabs));
    /* …and the guard is the ROUTE rather than the hidden tab, since the address is typeable. Boot renders
       directly rather than through route(), so a cold load is a second door and is checked as one. */
    await page.goto(base + "?cold=1#warofages", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    const cold = await page.evaluate(() => ({ hash: location.hash, wa: !!document.querySelector(".woa-page") }));
    check("[" + tag + "] ...and a typed admin address sends a reader home", cold.hash !== "#warofages" && !cold.wa, JSON.stringify(cold));
    await page.evaluate(() => localStorage.removeItem("folio_acct_v1"));
    await page.close();
  }

  /* ================= 5c. light/dark on Settings, and NO language picker =================
     The site is English-only for now (MULTILANG in app.js, Aug 2026, on request), so the picker that used
     to be asserted here must be gone from the page — a control offering nine languages nothing routes to
     is a control that lies. The light/dark switch beside it is unaffected and still has to be there.
     `test-i18n-lang.js` covers the other half: that the machinery behind the flag still works. */
  for (const vp of [PHONE, DESKTOP]) {
    const page = await browser.newPage({ viewport: vp });
    await watch(page);
    await page.goto(base + "#settings", { waitUntil: "load" });
    await page.waitForTimeout(1400);
    const p = await page.evaluate(() => ({
      opts: document.querySelectorAll("#langGrid .lang-opt").length,
      night: !!document.querySelector("#sw-night") && document.querySelector("#sw-night").checkVisibility(),
      lang: (JSON.parse(localStorage.getItem("folio_v1") || "{}").settings || {}).lang,
      // whatever the viewport, neither may be left behind in the top bar
      strayLang: !!document.querySelector(".topbar .lang-opt, .topbar #lang-switch"),
      strayNight: !!document.querySelector(".topbar .theme-switch"),
    }));
    const tag = vp.width + "px";
    check("[" + tag + "] the Settings page offers no language picker", p.opts === 0, String(p.opts));
    check("[" + tag + "] ...the light/dark switch is still there", p.night);
    check("[" + tag + "] ...and neither is left in the top bar", !p.strayLang && !p.strayNight, JSON.stringify(p));
    await page.close();
  }
  {
    /* …and the way OUT of a language chosen before the picker went. This is the one way removing a
       setting can really strand someone: a reader who picked Spanish would be held in Spanish with no
       control left on the page to change it back. Also: a ?lang= link must no longer switch. */
    const page = await browser.newPage({ viewport: PHONE });
    await watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(900);
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      s.settings = s.settings || {}; s.settings.lang = "es";
      localStorage.setItem("folio_v1", JSON.stringify(s));
    });
    await page.goto(base + "?lang=ja#settings", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const after = await page.evaluate(() => ({
      lang: (JSON.parse(localStorage.getItem("folio_v1") || "{}").settings || {}).lang,
      html: document.documentElement.lang || "", dir: document.documentElement.dir || "",
      i18n: [...document.querySelectorAll("script[src*='/i18n/']")].map((s) => s.src.split("/").pop()),
    }));
    check("a language stored before the picker went is brought back to English", after.lang === "en", JSON.stringify(after));
    check("...and a ?lang= link no longer switches", after.lang === "en" && after.i18n.length === 0, JSON.stringify(after));
    await page.close();
  }

  /* ================= 5f. Text size (Aug 2026, on request) =================
     It scales EVERY px font-size in the stylesheet now — the reading prose, the shell, the buttons, the
     nav — after a second request; it used to reach a card's question and background, a glossary popup and
     an Atlas panel and nothing else. What it still does NOT do is move the layout: the boxes are laid out
     in px and only the text inside them grows, which is what keeps a four-cell grade bar a four-cell grade
     bar at Large. So this checks that the prose AND the chrome both follow, that nothing in the shell is
     clipped by the growth, and that the setting survives a reload — a text size a reader has to set every
     time is worse than none. */
  {
    const page = await browser.newPage({ viewport: PHONE });
    await watch(page);
    await page.goto(base + "#settings", { waitUntil: "load" });
    await page.waitForTimeout(1400);
    /* A SLIDER since Aug 2026, not buttons on the left (on request). The sizes are an ordered scale and
       the control now says so — and it spans the row, which is the visible half of the request and
       therefore the thing to assert. The value is the INDEX into FONT_SIZES, so the range and the
       setting cannot drift apart.
       FIVE stops since Aug 2026, "very small" and "very large" having been added at the ends on request.
       The tick labels are read back as WORDS rather than counted, because the two new ones are two words
       each and the row is 390px wide — a label that has been quietly abbreviated to fit is exactly the
       kind of thing nobody notices. */
    const pick = await page.evaluate(() => {
      const g = document.querySelector("#fsPick");
      const r0 = document.querySelector("#fsRange");
      if (!g || !r0) return null;
      const r = g.getBoundingClientRect(), row = g.closest(".set-row").getBoundingClientRect();
      const ticks = [...g.querySelectorAll(".fs-tick")];
      return { range: r0.type, max: +r0.max, val: +r0.value, ticks: ticks.length,
        labels: ticks.map((t) => { const l = t.querySelector(".fs-lbl"); return l ? l.textContent : ""; }),
        on: ticks.filter((t) => t.classList.contains("on")).map((t) => t.dataset.fs),
        vt: r0.getAttribute("aria-valuetext"),
        fs: document.body.dataset.fs, fits: r.right <= row.right + 1,
        // the point of the change: it fills the row rather than sitting in the left third of it
        wide: r.width >= row.width - 2,
        // …and five labels still fit across it rather than being cut off
        clipped: g.scrollWidth > g.clientWidth + 1 };
    });
    check("Settings offers a text size", !!pick && pick.range === "range" && pick.max === 4 && pick.ticks === 5, JSON.stringify(pick));
    check("...from very small to very large",
      !!pick && pick.labels.join("|") === "Very small|Small|Medium|Large|Very large", JSON.stringify(pick && pick.labels));
    check("...as a slider spanning the whole row, not buttons on the left", !!pick && pick.wide, JSON.stringify(pick));
    check("...with exactly one mark lit, matching the setting in force",
      !!pick && pick.on.length === 1 && pick.on[0] === pick.fs, JSON.stringify(pick));
    check("...and announcing which size it is on", !!pick && (pick.vt || "") === "Medium", JSON.stringify(pick));
    check("...without overflowing its row", !!pick && pick.fits && !pick.clipped, JSON.stringify(pick));
    const sizes = async () => {
      // the review has to hold a collection before the banner deals a card — the first-run hero routes to
      // the collections now (Aug 2026), so pressing it on an empty review lands on that page instead
      await addFirstCollection(page, base);
      await page.goto(base + "#home", { waitUntil: "load" });
      await page.waitForTimeout(1200);
      await page.evaluate(() => { const b = document.querySelector(".banner .cta .btn"); if (b) b.click(); });
      await page.waitForTimeout(1400);
      await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
      await page.waitForTimeout(600);
      return page.evaluate(() => {
        const px = (s) => { const e = document.querySelector(s); return e ? Math.round(parseFloat(getComputedStyle(e).fontSize) * 10) / 10 : null; };
        const el = document.querySelector(".tabbar .tab-label");
        return { fs: document.body.dataset.fs, q: px(".study-card .question"), bg: px(".abstract"),
          tab: px(".tabbar .tab-label"), btn: px(".grade .gl"),
          // the shell has to survive the growth, not merely take part in it
          tabClipped: el ? el.scrollWidth > el.clientWidth + 1 : null,
          gradeRows: new Set([...document.querySelectorAll(".grade")].map((g) => Math.round(g.getBoundingClientRect().top))).size };
      });
    };
    const setFs = async (v) => {
      await page.goto(base + "#settings", { waitUntil: "load" });
      await page.waitForTimeout(1100);
      // the slider's own event, dispatched by hand: setting .value programmatically fires nothing
      await page.evaluate((f) => {
        const r2 = document.querySelector("#fsRange");
        const i = ["tiny", "small", "medium", "large", "huge"].indexOf(f);
        if (r2 && i >= 0) { r2.value = String(i); r2.dispatchEvent(new Event("input", { bubbles: true })); }
      }, v);
      await page.waitForTimeout(250);
    };
    const med = await sizes();
    await setFs("large"); const big = await sizes();
    await setFs("small"); const small = await sizes();
    check("...that grows the card's question and background", big.q > med.q && big.bg > med.bg, JSON.stringify({ med, big }));
    check("...and shrinks them", small.q < med.q && small.bg < med.bg, JSON.stringify({ med, small }));
    check("...and the shell with them — every page, not just the reading prose",
      big.tab > med.tab && small.tab < med.tab && big.btn > med.btn,
      JSON.stringify({ med, big, small }));
    check("...without breaking it: the tab label still fits and the grades stay on one row",
      !big.tabClipped && big.gradeRows === 1 && !small.tabClipped && small.gradeRows === 1,
      JSON.stringify({ big: { clip: big.tabClipped, rows: big.gradeRows }, small: { clip: small.tabClipped, rows: small.gradeRows } }));
    await setFs("large");
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    check("...and it is still there after a reload", (await page.evaluate(() => document.body.dataset.fs)) === "large");
    await setFs("medium");
    await page.close();
  }

  /* ================= 6. Settings and Account fill the stage ================= */
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    await watch(page);
    await page.goto(base + "#settings", { waitUntil: "load" });
    await page.waitForTimeout(1400);
    const s = await page.evaluate(() => {
      const head = document.querySelector(".page-head").getBoundingClientRect();
      const cards = [...document.querySelectorAll(".settings > .set-card")].map((c) => { const b = c.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), top: Math.round(b.top), wide: c.classList.contains("set-wide") || c.classList.contains("danger") }; });
      const grid = document.querySelector(".settings").getBoundingClientRect();
      // two cards sharing a row is the two-column layout
      const rows = {};
      cards.forEach((c) => { rows[c.top] = (rows[c.top] || 0) + 1; });
      return { head: { l: Math.round(head.left), r: Math.round(head.right) }, grid: { l: Math.round(grid.left), r: Math.round(grid.right) }, paired: Object.values(rows).some((n) => n === 2), wideSpan: cards.filter((c) => c.wide).every((c) => c.r - c.l > (grid.width * 0.9)) };
    });
    check("the settings column fills the stage under its heading",
      near(s.grid.l, s.head.l, 2) && near(s.grid.r, s.head.r, 2), JSON.stringify(s));
    check("...pairing the cards into two columns when there is room", s.paired);
    check("...with the theme picker and the danger zone spanning both", s.wideSpan);
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    await watch(page);
    await page.goto(base + "#account", { waitUntil: "load" });
    await page.waitForTimeout(1600);
    const a = await page.evaluate(() => {
      const card = document.querySelector(".auth-card"), perks = document.querySelector(".auth-perks");
      if (!card || !perks) return null;
      const c = card.getBoundingClientRect(), p = perks.getBoundingClientRect();
      const head = document.querySelector(".page-head").getBoundingClientRect();
      return { sameRow: Math.abs(c.top - p.top) < c.height, perksRight: p.left > c.right - 2, reach: Math.round(p.right), headRight: Math.round(head.right) };
    });
    check("signed out, the perks sit BESIDE the form, not under it", !!a && a.sameRow && a.perksRight, JSON.stringify(a));
    check("...so the page reaches the width of its own heading", !!a && a.reach > a.headRight * 0.75, JSON.stringify(a));
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: PHONE });
    await watch(page);
    await page.goto(base + "#account", { waitUntil: "load" });
    await page.waitForTimeout(1600);
    const a = await page.evaluate(() => {
      const c = document.querySelector(".auth-card").getBoundingClientRect(), p = document.querySelector(".auth-perks").getBoundingClientRect();
      return { stacked: p.top >= c.bottom - 2, noOverflow: document.body.scrollWidth <= document.body.clientWidth + 1 };
    });
    check("on a phone they stack again", a.stacked, JSON.stringify(a));
    check("...without pushing the page sideways", a.noOverflow);
    await page.close();
  }

  /* ================= 7. the Library's collection rows ================= */
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    await watch(page);
    await page.goto(base + "#decks", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const lib = await page.evaluate(() => {
      const groupLabel = (document.querySelector(".collection-group .group-label") || {}).textContent || "";
      const soon = document.querySelector(".collection.placeholder");
      const live = [...document.querySelectorAll(".collection:not(.placeholder):not(.udeck)")][0];
      const has = (el, sel) => !!(el && el.querySelector(sel));
      // with the XP bar gone, the title row's bottom margin was 9px of nothing under the title, inside a
      // flex item the row centres as a whole — so the title rode above the middle of its own banner
      let off = null;
      if (soon) {
        const t = soon.querySelector(".collection-title").getBoundingClientRect();
        const r = soon.querySelector(".collection-row").getBoundingClientRect();
        off = +((t.top + t.height / 2 - r.top) - r.height / 2).toFixed(2);
      }
      return {
        groupLabel: groupLabel.trim(), soonTitleOffset: off,
        soonBadge: has(soon, ".coll-ic"), soonXp: has(soon, ".xp"), soonPill: has(soon, ".pill.soon"),
        liveBadge: has(live, ".coll-ic"), liveXp: has(live, ".deck-prog"), liveCount: has(live, ".collection-count"),
        // …and the DECK rows inside keep theirs, which is what makes the line above a rule rather than a loss
        deckCount: !!document.querySelector(".node .node-count"), deckBar: !!document.querySelector(".node .deck-prog"),
        anyNumeral: !!document.querySelector(".collection-row .lb-num"),
      };
    });
    /* THE FIRST HEADING'S NAME IS READ OFF app.js, NEVER WRITTEN DOWN HERE. It was the literal
       "Collections" and stayed passing for a fortnight after the heading was renamed to "History" on
       request — a test that hard-codes a label is not guarding the label, it is pinning the stale one
       (test-tour.js's own lesson about a control's caption). It comes from `COLLECTION_SECTIONS`, the
       same table the page builds the heading from, with a second check that the table was found at all
       so a rename of the constant fails loudly rather than matching nothing. */
    const secTable = /const COLLECTION_SECTIONS = \[([\s\S]*?)\];/.exec(fs.readFileSync(path.join(ROOT, "app.js"), "utf8"));
    const firstSection = secTable && (/label: "([^"]+)"/.exec(secTable[1]) || [])[1];
    check("COLLECTION_SECTIONS is still where the headings come from", !!firstSection, String(firstSection));
    check("the first group is named after the first section", lib.groupLabel === firstSection, lib.groupLabel + " vs " + firstSection);
    // a level meter towards a level in a collection that cannot be studied, over a "0 / 3 cards" figure that
    // reads as a card count when the collection holds none
    check("a coming-soon collection carries no icon", !lib.soonBadge);
    check("...and no progress bar", !lib.soonXp);
    check("...just the Planned pill", lib.soonPill);
    check("...with its title centred in the banner", lib.soonTitleOffset !== null && Math.abs(lib.soonTitleOffset) <= 1.5, lib.soonTitleOffset);
    // Aug 2026, on request: collections lost their level. The banner carries a SUBJECT ICON where the
    // per-script numeral was and a studied/total bar where the XP bar was — see test-artefacts.js, which
    // pins the pair properly. Here it is only the shell: both present, and no numeral left anywhere.
    /* A LIVE COLLECTION STATES ITS SIZE ONCE, ON THE BAR (Aug 2026, on request): the `.collection-count`
       behind the title said the same number the bar under it says, so the row read "412 cards" beside
       "0 / 412 cards". Asserted in BOTH directions in one line, since a count with no bar and a bar with no
       count are opposite regressions and either alone would pass half of it. */
    check("a live collection keeps its icon and bar, and states its size once", lib.liveBadge && lib.liveXp && !lib.liveCount, JSON.stringify(lib));
    check("...and no level numeral survives on any collection banner", !lib.anyNumeral);
    // the DECK rows inside are the other half of that rule: they have no bar, so they keep their count
    check("...while a deck row inside keeps its card count, having no bar to state it", lib.deckCount && !lib.deckBar, JSON.stringify(lib));
    await page.close();
  }

  /* ================= 7b. the home page: the day's work, in one column =================
     Three swiped panes became one column (Aug 2026, on request): the day's card, the day's term and the
     Atlas teaser were dropped from the phone, and the games moved up under the review with a heading of
     their own. A fortnight later the request was to bring the DESKTOP into line with the phone rather than
     the other way round, so the discovery row is built at no width at all, the taglines are gone from every
     tile, and the lip and the heading ship everywhere — which is why the desktop block further down now
     asserts the same page rather than the opposite one. Every failure here is silent: a tile that is still
     built costs ~1.6 MB of globe for something nobody looks at, and the ONE route to the collections is now
     a lip the size of a word, easy to lose and impossible to notice the loss of. */
  {
    const page = await browser.newPage({ viewport: PHONE });
    await watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(1600);
    const h = await page.evaluate(() => {
      const grp = document.querySelector(".review-group"), grid = document.querySelector(".game-grid");
      const head = document.querySelector(".games-head"), lip = document.querySelector(".home-collections");
      const quote = document.querySelector(".daily-quote, .dq, figure");
      const tiles = [...document.querySelectorAll(".game-tile")];
      const top = (el) => Math.round(el.getBoundingClientRect().top);
      return {
        pager: !!document.querySelector("#homePager"), dots: !!document.querySelector("#homeDots"),
        atlasTile: !!document.querySelector("#exp-atlas"), cod: !!document.querySelector("#exp-card"),
        tod: !!document.querySelector("#exp-term"), explore: !!document.querySelector(".explore-grid"),
        libBanner: !!document.querySelector("#b-library"),
        /* IT WENT BACK INTO THE CARD, AS ITS BOTTOM ROW (Aug 2026, on request — the third placement in a
           month and the reader's own choice when asked). It was a tab hanging off the review group's
           bottom-right corner, then a small free-standing button centred below the card with air around
           it, and the objection to the second was where it left the reader on a phone: a page-length of
           deck rows, then a gap, then a button belonging to nothing. So it is a full-width row INSIDE the
           group now, closing the stack the banner opens — which inverts the two fields below rather than
           retiring them, since a control that has silently fallen out of the card looks exactly like one
           that was put there on purpose. It must be a DESCENDANT of the group, it must sit under the deck
           list rather than above it, and it must span the card rather than floating in the middle of it. */
        lip: lip ? lip.textContent.trim() : "",
        lipInCard: !!(lip && grp && grp.contains(lip)),
        lipBelowDecks: (() => {
          const l = document.querySelector(".active-decks");
          if (!lip) return false;
          if (!l) return true;   // no decks added yet — there is no list for it to be below
          return Math.round(lip.getBoundingClientRect().top) >= Math.round(l.getBoundingClientRect().bottom) - 1;
        })(),
        lipCentreOff: lip && grp ? Math.round(Math.abs((lip.getBoundingClientRect().left + lip.getBoundingClientRect().width / 2)
          - (grp.getBoundingClientRect().left + grp.getBoundingClientRect().width / 2))) : 999,
        /* THE CHEST AND "+ NEW GROUP" HAVE BOTH LEFT THE BANNER (Aug 2026, on request). Each is asserted
           in both directions, since a control that has merely stopped rendering looks the same from one
           side as one that has moved: the chip must be GONE from the banner and the notice must be a real
           slot ABOVE it, and the group control must be out of the banner and present under the deck list.
           This reader has studied nothing, so no chest is owed and no deck is added — hence the slot and
           the button are read for their PLACE (`#chestSlot` is always in the markup; the button is drawn
           with the list) rather than for being filled. */
        chestChip: !!document.querySelector(".banner .chest-chip, .banner [data-chest]"),
        chestSlotAbove: (() => {
          const s = document.querySelector("#chestSlot"), b = document.querySelector("#b-review");
          return !!(s && b && s.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
        })(),
        // the group function left the daily study block altogether in Aug 2026 (on request) — it is not
        // in the banner, and it is not under the deck list either
        newGroupAnywhere: !!document.querySelector("#b-newgroup, .rv-newgroup, [data-newgroup]"),
        // …and it spans the card, which is what makes it read as the card's own bottom edge rather than as
        // something dropped on top of it
        lipFrac: lip && grp ? +(lip.getBoundingClientRect().width / grp.getBoundingClientRect().width).toFixed(2) : 0,
        /* …and BLUE (Aug 2026, on request): the site's own primary-button indigo, read off a probe rather
           than hard-coded, so a theme that re-tones --indigo moves the button with it. Paper-on-paper it
           read as part of the card's bottom edge, which is the failure this pins. */
        lipBlue: (() => {
          if (!lip) return "";
          const p = document.createElement("i");
          p.style.cssText = "background:var(--indigo);position:absolute;left:-9999px";
          document.body.appendChild(p);
          const want = getComputedStyle(p).backgroundColor; p.remove();
          const got = getComputedStyle(lip).backgroundColor;
          return got === want ? "ok" : got + " ≠ " + want;
        })(),
        aboutPad: (() => {
          const a = document.querySelector(".home-about"); if (!a) return [0, 0];
          const cs = getComputedStyle(a); return [parseFloat(cs.paddingTop), parseFloat(cs.paddingBottom)];
        })(),
        // the games, under a heading, under the review
        mgHead: head ? head.textContent.trim() : "",
        /* The heading's TEXT left edge against the grid's, measured through a Range — NOT its computed
           text-align, which was once "center" while the words sat hard left: the class was first called
           `.mg-head`, which is the MAP GAME's card header, and that rule's `display:flex` beats
           text-align outright. A block-level h2 spans the column whatever it does with its text, so
           only the text's own box can tell the two apart. The heading went back to CENTRED in Aug 2026
           on request (it was centred, then left for a fortnight, then centred again), so what is measured
           is the same box's centre against the grid's. */
        headOff: (() => {
          if (!head || !grid) return 999;
          const r = document.createRange(); r.selectNodeContents(head);
          const t = r.getBoundingClientRect(), g = grid.getBoundingClientRect();
          return Math.round((t.left + t.width / 2) - (g.left + g.width / 2));
        })(),
        headBelowReview: !!(head && grp && top(head) >= Math.round(grp.getBoundingClientRect().bottom) - 1),
        gridBelowHead: !!(head && grid && top(grid) >= Math.round(head.getBoundingClientRect().bottom) - 1),
        cols: grid ? getComputedStyle(grid).gridTemplateColumns.split(/\s+/).length : 0,
        rows: new Set(tiles.map(top)).size, tiles: tiles.length,
        // the taglines are gone at three tiles to a row: an unplayed tile carries a name and nothing else
        subs: tiles.filter((t) => t.querySelector(".gt-sub")).length,
        quoteAbove: !!(quote && grp && quote.getBoundingClientRect().bottom <= grp.getBoundingClientRect().top + 1),
        about: (() => { const a = document.querySelector(".home-about"); return a && a.checkVisibility() ? a.textContent.trim() : ""; })(),
        aboutLast: (() => {
          const a = document.querySelector(".home-about");
          return !!(a && grid && a.getBoundingClientRect().top >= grid.getBoundingClientRect().bottom - 1);
        })(),
        seenTotal: [...document.querySelectorAll(".banner .stat span")].map((s) => s.textContent.trim()),
      };
    });
    check("the phone's home page is one column again — no pager", !h.pager && !h.dots, JSON.stringify({ pager: h.pager, dots: h.dots }));
    check("...with no card of the day and no gloss of the day", !h.cod && !h.tod && !h.explore, JSON.stringify(h));
    check("...and no Atlas teaser: a phone never fetches the globe for an ornament", !h.atlasTile);
    check("the collections banner is gone, replaced by a Collections button under the review",
      !h.libBanner && /^collections$/i.test(h.lip), JSON.stringify({ banner: h.libBanner, label: h.lip }));
    check("...as the card's own bottom row, under the deck list rather than loose beneath the card",
      h.lipInCard && h.lipBelowDecks, JSON.stringify({ inCard: h.lipInCard, belowDecks: h.lipBelowDecks }));
    check("the banner never counts chests: the notice is a slot above it instead",
      !h.chestChip && h.chestSlotAbove, JSON.stringify({ chip: h.chestChip, above: h.chestSlotAbove }));
    check("...and the group function is gone from the daily study block entirely", !h.newGroupAnywhere);
    /* CENTRED AND FULL WIDTH — the two together are what "the card's bottom edge" means. A row that has
       lost its width reads as a button dropped inside the card, which is the placement this replaced, and
       the centre test alone cannot see that: a narrow centred button is centred too. */
    check("...spanning the card, which is what makes it the bottom edge rather than a button on it",
      h.lipCentreOff <= 2 && h.lipFrac > 0.9,
      JSON.stringify({ offCentre: h.lipCentreOff, frac: h.lipFrac }));
    check("...filled in the same indigo as Start review, not paper on paper", h.lipBlue === "ok", h.lipBlue);
    check("...and routing to the collections", await page.evaluate(async () => {
      document.querySelector(".home-collections").click();
      await new Promise((r) => setTimeout(r, 700));
      return location.hash;
    }) === "#decks");
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    check("the games sit under the review, under a Minigames heading",
      /minigames/i.test(h.mgHead) && h.headBelowReview && h.gridBelowHead, JSON.stringify({ head: h.mgHead, below: h.headBelowReview, grid: h.gridBelowHead }));
    check("...centred over the grid it names", Math.abs(h.headOff) <= 2, h.headOff);
    /* Three to a row, in FULL rows — the count is derived from the tiles rather than written down, because
       the grid has gone from four games to six to nine and a hard-coded 6 is one more thing to remember
       when it grows again. What matters at this width is that it stays three wide (a fourth column at
       390px is unreadable) and that the last row is not a ragged one or two. */
    check("...three to a row, in full rows",
      h.cols === 3 && h.tiles >= 6 && h.tiles % 3 === 0 && h.rows === h.tiles / 3,
      JSON.stringify({ cols: h.cols, rows: h.rows, tiles: h.tiles }));
    check("...with the description sentences gone", h.subs === 0, h.subs + " tiles still carry one");
    check("...the quote still above it all", h.quoteAbove);
    check("...and the About link last, About having left the tab bar", /about/i.test(h.about) && h.aboutLast, JSON.stringify({ about: h.about, last: h.aboutLast }));
    check("...routing to the About page", await page.evaluate(async () => {
      document.querySelector(".home-about").click();
      await new Promise((r) => setTimeout(r, 700));
      return location.hash;
    }) === "#mission");
    // …with room around it (Aug 2026, on request): it was 4px over 2px, crowded against the game grid
    check("...with room above and below it", h.aboutPad[0] >= 14 && h.aboutPad[1] >= 12, JSON.stringify(h.aboutPad));
    // removed on request: the xp bar right above it already counts the distinct cards studied
    check("the review banner no longer carries a Seen total", !h.seenTotal.some((t) => /total/i.test(t)), h.seenTotal.join("|"));

    /* Anki's three piles, in Anki's order, each in its own colour — three numbers in one colour say nothing,
       and the labels are the only thing that would tell them apart. Read AFTER a card is graded: until the
       first one the banner is the first-run hero and carries no stats at all. The same three, unlabelled,
       must open the deck's own row, computed by the same function so a row cannot outrun the banner.
       THE STAT ROW IS NOT ONLY PILES, AND THE EXCLUSIONS ARE THE ASSERTION'S SCOPE RATHER THAN A LOOSENING.
       Two CHIPS share `.stat` with them by design — the day-streak chip and, since Aug 2026, the chest chip
       that says a chest is waiting. This block excluded the streak alone and passed for months because the
       test's reader never had a chest; the day badges began earning them it went red on a banner that was
       rendering exactly as designed. Both are matched off in the SELECTOR now rather than filtered after,
       so the four reads cannot come to disagree about what a pile is. A chip also has no number to speak of
       (the chest's `<b>` is "🗝 1"), so leaving one in fed a NaN to the colour and zero checks below. */
    await studyEasy(page, base, 1);
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1600);
    const piles = await page.evaluate(() => ({
      stats: [...document.querySelectorAll(".banner .stat:not(.streak):not(.chest-chip)")].map((s) => ({
        label: s.querySelector("span").textContent.trim(),
        n: +s.querySelector("b").textContent.trim(),
        col: getComputedStyle(s.querySelector("b")).color,
      })),
      row: [...document.querySelectorAll(".active-deck .dk-counts .dkc")].map((s) => ({ n: +s.textContent.trim(), col: getComputedStyle(s).color })),
      rowLabels: (document.querySelector(".active-deck .dk-counts") || {}).title || "",
      // the big gold numeral is GONE (Aug 2026, on request) — it carried the day's whole pile unlabelled,
      // over three labelled counts that break the same total up. So is the line that described them.
      badge: !!document.querySelector(".review-group .banner .level-badge"),
      desc: (document.querySelector(".review-group .banner .desc") || {}).textContent || "",
      xpLevel: (document.querySelector(".review-group .banner .xp-lvl") || {}).textContent || "",
      // each figure centred over its own label, and the whole row on the button's line
      centred: [...document.querySelectorAll(".review-group .banner .stat:not(.streak):not(.chest-chip)")].map((s) => {
        const w = s.getBoundingClientRect(), n = s.querySelector("b").getBoundingClientRect(), l = s.querySelector("span").getBoundingClientRect();
        return Math.round(Math.abs((n.left + n.width / 2) - (l.left + l.width / 2)) * 10) / 10;
      }),
      onCtaRow: (() => {
        const cta = document.querySelector(".review-group .banner .cta").getBoundingClientRect();
        return [...document.querySelectorAll(".review-group .banner .stat:not(.streak):not(.chest-chip)")]
          .every((s) => { const b = s.getBoundingClientRect(); return b.top < cta.bottom && b.bottom > cta.top; });
      })(),
      // …and centred against them rather than sat on their baseline (Aug 2026, on request). The row was
      // align-items:flex-end on a phone, so a one-line button lined up with the bottom of a two-line column
      // and read as having slipped down.
      ctaOffset: (() => {
        const cta = document.querySelector(".review-group .banner .cta .btn").getBoundingClientRect();
        const st = [...document.querySelectorAll(".review-group .banner .stat:not(.streak):not(.chest-chip)")]
          .map((s) => s.getBoundingClientRect());
        if (!st.length) return 999;
        const mid = (Math.min(...st.map((b) => b.top)) + Math.max(...st.map((b) => b.bottom))) / 2;
        return Math.round(Math.abs((cta.top + cta.bottom) / 2 - mid) * 10) / 10;
      })(),
    }));
    check("the review banner counts Anki's three piles, in order",
      piles.stats.map((p) => p.label.toLowerCase()).join(",") === "new,learning,review", JSON.stringify(piles.stats.map((p) => p.label)));
    /* No two piles that HAVE work share a colour — and a pile at zero is grey, which is the point of the
       colours: they say where the day's work is, so they have nothing to say on a 0 (Aug 2026, on request).
       Before that rule all three were always coloured and this simply counted three distinct ones. */
    {
      const nz = piles.stats.filter((p) => p.n > 0), z = piles.stats.filter((p) => p.n === 0);
      check("...no two piles with work in them the same colour",
        new Set(nz.map((p) => p.col)).size === nz.length, JSON.stringify(piles.stats));
      check("...and a pile at zero is grey, not coloured",
        z.every((p) => !nz.some((q) => q.col === p.col)), JSON.stringify(piles.stats));
    }
    /* …and the same three, unlabelled, open EVERY added deck's row in the same colours. This used to
       assert `row.length === 3`, i.e. exactly one added row; since Aug 2026 adding a collection brings its
       decks and subdecks in with it, so there are as many rows as the reader added things. The CLAIM is
       unchanged and is now stated for any number of them: every row carries three counts, a count of zero
       is grey wherever it appears, and each of the three positions keeps one colour of its own across the
       banner and every row — which is what "the same colours" meant. */
    {
      const grey = piles.stats.concat(piles.row).filter((p) => p.n === 0).map((p) => p.col);
      const greySet = new Set(grey);
      const byPos = [0, 1, 2].map((i) =>
        [...new Set(piles.stats.filter((_, j) => j === i).concat(piles.row.filter((_, j) => j % 3 === i))
          .filter((p) => p.n > 0).map((p) => p.col))]);
      check("...and the same three, unlabelled, open each added deck's row in the same colours",
        piles.row.length >= 3 && piles.row.length % 3 === 0 &&
        greySet.size <= 1 &&                                   // one grey, whichever pile happens to be empty
        byPos.every((c) => c.length <= 1) &&                   // each position keeps ONE colour of its own…
        new Set(byPos.flat()).size === byPos.filter((c) => c.length).length,   // …and no two positions share it
        JSON.stringify({ rows: piles.row.length / 3, byPos, greys: [...greySet] }));
    }
    check("...naming themselves only in the row's tooltip", /\S/.test(piles.rowLabels), piles.rowLabels);
    check("...each figure centred over its own label", piles.centred.every((d) => d <= 1), JSON.stringify(piles.centred));
    check("...and the three of them on the button's own line", piles.onCtaRow);
    check("...with the button centred against them, not on their baseline", piles.ctaOffset <= 1.5, piles.ctaOffset);
    check("the banner carries no big gold numeral over them", !piles.badge);
    check("...nor the sentence that described them in words", !/scheduled/i.test(piles.desc), piles.desc);
    check("...with the level still spelled out in the xp bar", /level/i.test(piles.xpLevel), piles.xpLevel);

    /* The added deck's row is ONE horizontal line (Aug 2026, on request) — piles and name on the same
       level, with the bar moved to the row's bottom edge so it costs the line no width. Two lines and one
       line look equally deliberate in a screenshot, and the failure this pins is the row quietly wrapping
       again the moment something in it grows: the deck's name is the only part with a shorter form, so if
       the arithmetic stops working it is the name that gets cut off.

       The N/N figure left the row for the options sheet (Aug 2026, on request), so its ABSENCE is asserted
       here and its presence in the sheet below — the two halves of one move, and each looks deliberate on
       its own. */
    /* …with the folds opened first. An added collection is drawn as a group header (Aug 2026) and its decks
       start SHUT under it, so a selector reaching straight for the first deck row would measure one that is
       `display:none` — height 0, title width 0 — and report a row that never wrapped as having collapsed. */
    for (let i = 0; i < 4; i++) {
      const opened = await page.evaluate(() => {
        const shut = [...document.querySelectorAll(".active-deck:not(.dk-shut) .dk-chev:not(.open)")];
        shut.forEach((c) => c.click());
        return shut.length;
      });
      await page.waitForTimeout(300);
      if (!opened) break;
    }
    const row = await page.evaluate(() => {
      /* …a DECK row, not a group header, and one that is actually on screen. Since Aug 2026 an added
         collection is drawn as a thinner group header, which carries a card count where a deck row carries
         the bar — so a selector that took the first row in the list would be measuring a header against a
         deck row's rules and reading its missing bar as a regression. The header's own shape is asserted
         separately below. */
      const r = document.querySelector(".active-deck[data-review]:not(.deck-group):not(.dk-shut)"); if (!r) return null;
      const rb = r.getBoundingClientRect();
      const t = r.querySelector(".dk-title"), k = r.querySelector(".dk-prog .track");
      const parts = [r.querySelector(".dk-counts"), t].filter(Boolean);
      const boxes = parts.map((e) => e.getBoundingClientRect());
      return {
        n: parts.length,
        // one line ⇔ every part overlaps one horizontal band
        band: Math.max(...boxes.map((b) => b.top)) < Math.min(...boxes.map((b) => b.bottom)),
        rowH: Math.round(rb.height),
        figure: !!r.querySelector(".dk-prog .count"),
        titleClipped: t ? t.scrollWidth > t.clientWidth + 1 : true,
        /* …and that it is DRAWN AT ALL. The clip test above passes on a name that has been hidden — a
           display:none title measures scrollWidth 0 against clientWidth 0 — which is exactly how an ad
           blocker's cosmetic filter on the old `.ad-title` name went unseen here for weeks. The text, its
           painted width and the body around it are each read separately: an empty string, a hidden element
           and a collapsed flex item are three different faults with the same appearance. */
        titleText: t ? t.textContent.trim() : "",
        titleW: t ? Math.round(t.getBoundingClientRect().width) : 0,
        bodyW: (() => { const b = r.querySelector(".dk-body"); return b ? Math.round(b.getBoundingClientRect().width) : 0; })(),
        trash: !!r.querySelector(".dk-trash"),
        // the bar underlines the row rather than sitting in the line
        trackWide: k ? k.getBoundingClientRect().width > rb.width * 0.8 : false,
        trackAtFoot: k ? Math.abs(k.getBoundingClientRect().bottom - rb.bottom) <= 1 : false,
        fills: !!r.querySelector(".dk-prog .fill"),
      };
    });
    check("an added deck's row is one horizontal line", !!row && row.band && row.n === 2, JSON.stringify(row));
    // the bin is gone — Remove moved into the row's options sheet, held down (Aug 2026, on request)
    check("...with no bin taking a column of its own", !!row && !row.trash, JSON.stringify(row));
    check("...and no N/N figure either, that having moved into the sheet", !!row && !row.figure, JSON.stringify(row));
    check("...its bar underlining the row instead of taking width from it",
      !!row && row.trackWide && row.trackAtFoot && row.fills, JSON.stringify(row));
    check("...and the deck's name not cut off at 390px", !!row && !row.titleClipped, JSON.stringify(row));
    check("...the name actually rendered, with width, inside a body that has not collapsed",
      !!row && row.titleText.length > 0 && row.titleW > 0 && row.bodyW > 0, JSON.stringify(row));
    /* THE GROUP HEADER IS THE THINNER OF THE TWO (Aug 2026, on request: "a group should appear as a thinner
       banner"). Both halves are asserted, because each is true of a header that has stopped being one: it
       must be SHORTER than a deck row, and it must be DARKER — a header at the rows' own strength is just a
       row with a different font, which is what the wash exists to prevent. */
    const grpRow = await page.evaluate(() => {
      const g = document.querySelector(".active-deck.deck-group:not(.dk-shut)"), d = document.querySelector(".active-deck[data-review]:not(.deck-group):not(.dk-shut)");
      if (!g || !d) return null;
      /* The wash is compared as the COMPUTED background-image string rather than as a luminance: the
         gradient is built out of `color-mix`, which different engines serialise differently (and Chrome
         may leave it in a colour space a naive rgb() regex cannot read), so parsing a number out of it is
         a check that can fail on a browser update while the page is perfect. What the assertion is about
         is that the header is painted DIFFERENTLY from the rows under it, and two strings say that. */
      const wash = (el) => getComputedStyle(el).backgroundImage || "";
      return {
        gh: Math.round(g.getBoundingClientRect().height), dh: Math.round(d.getBoundingClientRect().height),
        count: !!g.querySelector(".dg-count"), bar: !!g.querySelector(".dk-prog"),
        gWash: wash(g).slice(0, 60), dWash: wash(d).slice(0, 60), differs: wash(g) !== wash(d) && /gradient/.test(wash(g)),
        /* THE HEADER IS SET LIKE THE ROWS UNDER IT (Aug 2026, on request). Read as the computed font
           shorthand of each title, which carries family, size and weight at once — the header used to take
           a smaller, heavier, letterspaced, uppercased face of its own, and the request is that it stop. */
        gFont: getComputedStyle(g.querySelector(".dk-title")).font,
        dFont: getComputedStyle(d.querySelector(".dk-title")).font,
        gCase: getComputedStyle(g.querySelector(".dk-title")).textTransform,
      };
    });
    /* It carries the BAR now, where it used to carry a small "N cards" line instead (Aug 2026, on request):
       a header and the decks under it should not answer the same question two different ways. Both halves
       are asserted, since a header that kept both would pass either one alone. */
    check("a group header is thinner than a deck row, and carries a progress bar like the rows inside it",
      !!grpRow && grpRow.gh < grpRow.dh && grpRow.bar && !grpRow.count, JSON.stringify(grpRow));
    check("...in a deeper wash of the same colour, so the run below reads as belonging to it",
      !!grpRow && grpRow.differs, JSON.stringify(grpRow));
    check("...and its title is set in the same face as the decks within, not capitalised into a label",
      !!grpRow && grpRow.gFont === grpRow.dFont && grpRow.gCase === "none", JSON.stringify(grpRow));

    /* …and the sheet it moved into: the figure on the title's own LINE (a figure that has merely landed
       somewhere in the head is not what was asked for), and Remove carrying its red in the TEXT with no
       wash behind it — a highlighted row in a menu reads as one already chosen, which is exactly how it
       was reported. The wash was a HOVER state, so the pointer is really put on the row: reading the
       resting style would pass whatever the rule says. */
    await page.evaluate(async () => {
      document.querySelector(".active-deck[data-review]")
        .dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
      await new Promise((res) => setTimeout(res, 400));
    });
    let sheet = await page.evaluate(() => {
      const ov = document.querySelector(".deck-menu"); if (!ov) return null;
      const t = ov.querySelector(".dm-title"), f = ov.querySelector(".dm-studied");
      const mid = (e) => { const b = e.getBoundingClientRect(); return (b.top + b.bottom) / 2; };
      return {
        label: f ? f.textContent.trim() : "",
        // same line as the title, and to the RIGHT of it
        sameLine: !!(t && f) && Math.abs(mid(t) - mid(f)) <= 3,
        right: !!(t && f) && f.getBoundingClientRect().left > t.getBoundingClientRect().right,
        inBox: !!(f && f.getBoundingClientRect().right <= ov.querySelector(".dm-box").getBoundingClientRect().right),
        remove: !!ov.querySelector(".dm-item.dm-danger"),
      };
    });
    check("holding the row puts its N/N studied in the sheet's head",
      !!sheet && /^\d+\/\d+ studied$/.test(sheet.label), sheet && sheet.label);
    check("...on the title's own line, at its right",
      !!sheet && sheet.sameLine && sheet.right && sheet.inBox, JSON.stringify(sheet));
    if (sheet && sheet.remove) {
      // hovered against hovered: an ordinary row's own hover wash is the thing Remove must not exceed
      await page.hover(".deck-menu .dm-item:not(.dm-danger)");
      await page.waitForTimeout(220);
      const plain = await page.evaluate(() => {
        const el = document.querySelector(".deck-menu .dm-item:not(.dm-danger)");
        return { bg: getComputedStyle(el).backgroundColor, text: getComputedStyle(el.querySelector("b")).color };
      });
      await page.hover(".deck-menu .dm-item.dm-danger");
      await page.waitForTimeout(220);
      const rm = await page.evaluate(() => {
        const el = document.querySelector(".deck-menu .dm-item.dm-danger");
        return { bg: getComputedStyle(el).backgroundColor, text: getComputedStyle(el.querySelector("b")).color };
      });
      check("...with Remove's red kept in its text", rm.text !== plain.text, JSON.stringify({ rm, plain }));
      check("...and no wash of its own behind it, hovered", rm.bg === plain.bg, JSON.stringify({ rm, plain }));
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    // clear the day: Easy graduates a new card outright, so the allowance runs out with nothing in learning
    await studyEasy(page, base, 6);
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1600);
    const cleared = await page.evaluate(() => ({
      badge: !!document.querySelector(".review-group .banner .level-badge"),
      // the THREE pile stats only: the banner's row also carries the streak chip and the chest chip, whose
      // figures are not counts of work (and whose "🗝 1" parses as NaN, quietly poisoning the sum)
      piles: [...document.querySelectorAll(".review-group .banner .stat.st-new b, .review-group .banner .stat.st-learn b, .review-group .banner .stat.st-rev b")].map((x) => +x.textContent.trim()),
      desc: (document.querySelector(".review-group .banner .desc") || {}).textContent || "",
    }));
    check("...and a cleared day says so in words, with still no numeral",
      cleared.piles.reduce((a, n) => a + n, 0) === 0 && !cleared.badge && /caught up/i.test(cleared.desc),
      JSON.stringify(cleared));
    await page.close();
  }
  /* ================= 7c. the review list's SUBDECK FOLD =================
     Adding a collection brings its whole subtree in, so the list can run to forty rows; a row with children
     carries a chevron and starts shut (Aug 2026, on request). Every failure mode here is silent, and one of
     them shipped for an hour while this was being written:

       · the chevron sits INSIDE a row whose own click starts a study session and whose own hold opens the
         options sheet. The click is stopped — but `wireHoldMenu` ALSO binds Enter/Space on the row, and a
         native <button> activated from the keyboard fires a keydown that bubbles before the click it
         synthesises, so a keyboard reader folding the row was carried off into a session instead. A mouse
         cannot see it, which is why it is asserted from the keyboard here.
       · the rounded bottom corner. `:last-child` cannot see a folded row, so with the list shut by default
         the bottom of the card squares off under a row nobody can see.
       · what starts OPEN. `addActive` takes a node's subtree and NOT its ancestors, so a reader who added
         one subdeck gets a greyed signpost row for each ancestor. Folding those by default hides the
         reader's OWN deck behind a row they cannot even tap — the one way this feature can take something
         away, and it looks exactly like the deck having been dropped from the review. */
  {
    const page = await browser.newPage({ viewport: PHONE });
    await watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(1200);
    // add a whole collection the way addActive does — its subtree, and deliberately not its ancestors
    const seeded = await page.evaluate(() => {
      const coll = (window.COLLECTION_TREE.collections || []).find((c) => !c.placeholder && (c.children || []).length);
      if (!coll) return null;
      const ids = []; (function w(n) { ids.push(n.id); (n.children || []).forEach(w); })(coll);
      const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      s.active = ids;
      localStorage.setItem("folio_v1", JSON.stringify(s));
      return { id: coll.id, n: ids.length };
    });
    if (!seeded) { check("a collection with decks inside it exists to fold", false); }
    else {
      await studyEasy(page, base, 1);               // until a card is graded the banner is the first-run hero
      await page.goto(base + "#home", { waitUntil: "load" });
      await page.waitForTimeout(1400);
      const read = () => page.evaluate((top) => {
        const rows = [...document.querySelectorAll(".active-deck")];
        const vis = rows.filter((r) => r.offsetParent !== null);
        const t = document.querySelector(`.active-deck[data-node="${top}"]`);
        const last = vis[vis.length - 1];
        return {
          rows: rows.length, vis: vis.length,
          topChev: !!(t && t.querySelector(".dk-chev")),
          expanded: t && t.querySelector(".dk-chev") ? t.querySelector(".dk-chev").getAttribute("aria-expanded") : null,
          named: t && t.querySelector(".dk-chev") ? (t.querySelector(".dk-chev").getAttribute("aria-label") || "") : "",
          // a leaf has nothing to fold and must carry no chevron — but must still reserve its width, or the
          // bars down the list stop at different places
          leafChev: vis.some((r) => !r.querySelector(".dk-chev") && !r.querySelector(".dk-chev-gap")),
          /* THE CARD'S BOTTOM CORNER MOVED WHEN THE COLLECTIONS BUTTON CAME INSIDE THE GROUP (Aug 2026,
             on request). It used to belong to the last VISIBLE deck row; it now belongs to whatever is
             last in the group, which is the button — and the row above gives its corners up, or it would
             round into the row beneath it. Both halves are asserted, since a card that has lost its
             rounded foot altogether and a card whose last row kept a corner it should not have look the
             same from one side: the group must END rounded, and the last deck row must be square
             whenever something follows it inside the card. */
          lastRounded: last ? parseFloat(getComputedStyle(last).borderBottomLeftRadius) : 0,
          /* …and the corner belongs to the COLLECTIONS ROW, which is the card's last row — not to
             whatever is last in `.review-group`, since `.rv-foot` (the day's timer and the Edit button)
             sits BELOW the card on the page's own paper and carries no radius of its own. With no button
             there at all the last deck row keeps the corner, which is the pre-Aug-2026 arrangement and is
             still what a first run draws. */
          cardRounded: (() => {
            const btn = document.querySelector(".review-group .home-collections");
            const tail = btn || last;
            return tail ? parseFloat(getComputedStyle(tail).borderBottomLeftRadius) : 0;
          })(),
          rowIsTail: !document.querySelector(".review-group .home-collections"),
          hash: location.hash,
        };
      }, seeded.id);

      let f = await read();
      check("the review list folds: a collection's decks start shut",
        f.rows > 1 && f.vis === 1, JSON.stringify({ rows: f.rows, visible: f.vis }));
      check("...behind a chevron that says which way it points", f.topChev && f.expanded === "false" && /\S/.test(f.named),
        JSON.stringify({ chev: f.topChev, expanded: f.expanded, name: f.named }));
      check("...every row reserving the chevron's width, folded or not", !f.leafChev);
      check("...and the card still ending in a rounded corner, carried by whatever is last in it",
        f.cardRounded > 0 && (f.rowIsTail ? f.lastRounded > 0 : f.lastRounded === 0),
        JSON.stringify({ card: f.cardRounded, lastRow: f.lastRounded, rowIsTail: f.rowIsTail }));

      // the KEYBOARD half — the bug a mouse cannot see
      await page.focus(`.active-deck[data-node="${seeded.id}"] .dk-chev`);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
      f = await read();
      check("...opening from the keyboard reveals the decks inside", f.vis > 1, JSON.stringify({ visible: f.vis }));
      check("...WITHOUT the row's own Enter carrying the reader into a session",
        f.hash !== "#study" && !/study/.test(f.hash), f.hash || "(none)");
      check("...and the chevron's name flips with its state", f.expanded === "true" && /\S/.test(f.named),
        JSON.stringify({ expanded: f.expanded, name: f.named }));
      check("...and the card's foot still rounded once the decks are showing",
        f.cardRounded > 0 && (f.rowIsTail ? f.lastRounded > 0 : f.lastRounded === 0),
        JSON.stringify({ card: f.cardRounded, lastRow: f.lastRounded, rowIsTail: f.rowIsTail }));

      // a click on the chevron must not start one either
      await page.click(`.active-deck[data-node="${seeded.id}"] .dk-chev`);
      await page.waitForTimeout(450);
      f = await read();
      check("...and clicking it folds rather than studying",
        f.vis === 1 && f.expanded === "false" && !/study/.test(f.hash), JSON.stringify({ visible: f.vis, hash: f.hash }));

      /* …while a SIGNPOST above what the reader added stays open. Adding one deep subdeck leaves its
         ancestors as untappable context rows; folding those by default would hide the reader's own deck. */
      const deep = await page.evaluate(() => {
        let best = null;
        (window.COLLECTION_TREE.collections || []).forEach((c) => {
          if (c.placeholder) return;
          (function w(n, d) {
            const kids = n.children || [];
            if (!kids.length && (n.cardIds || []).length && (!best || d > best.d)) best = { id: n.id, d };
            kids.forEach((k) => w(k, d + 1));
          })(c, 0);
        });
        if (!best || best.d < 1) return null;
        const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
        s.active = [best.id];
        localStorage.setItem("folio_v1", JSON.stringify(s));
        return best;
      });
      if (deep) {
        await page.reload({ waitUntil: "load" });
        await page.waitForTimeout(1400);
        const d = await page.evaluate((id) => {
          const el = document.querySelector(`.active-deck[data-node="${id}"]`);
          return {
            found: !!el,
            visible: !!el && el.offsetParent !== null,
            tappable: !!el && el.hasAttribute("data-review"),
            signposts: [...document.querySelectorAll(".active-deck.context")].filter((r) => r.offsetParent !== null).length,
          };
        }, deep.id);
        check("a deck added on its own is never folded behind its signposts",
          d.found && d.visible && d.tappable, JSON.stringify(d));
        check("...with the signpost rows above it left open", d.signposts >= 1, JSON.stringify(d));
      }
    }
    await page.close();
  }
  {
    /* Above the breakpoint the home page is now the SAME page (Aug 2026, on request: the desktop was brought
       into line with the phone). It was the opposite assertion for a fortnight, which is why every clause
       here is stated in both directions — the discovery row must be gone, the lip and the heading must be
       present, and the ONE remaining difference (the About line, which a desktop reaches from its top bar)
       must still be a difference. The `world` bundle is watched as well as the markup: the Atlas teaser's
       ornament was the only thing outside the Atlas that fetched it, so a tile creeping back would show up
       here as a 1.6 MB request on a page nobody asked to see a globe on. */
    const asked = [];
    const page = await browser.newPage({ viewport: DESKTOP });
    await watch(page);
    page.on("request", (r) => asked.push(r.url()));
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const d = await page.evaluate(() => {
      const top = (s) => { const el = document.querySelector(s); return el ? Math.round(el.getBoundingClientRect().top) : -1; };
      const grp = document.querySelector(".review-group"), grid = document.querySelector(".game-grid");
      const head = document.querySelector(".games-head"), lip = document.querySelector(".home-collections");
      return {
        order: [top(".review-group"), top(".games-head"), top(".game-grid")],
        explore: !!document.querySelector(".explore-grid"),
        atlasTile: !!document.querySelector("#exp-atlas"),
        cod: !!document.querySelector("#exp-card"), tod: !!document.querySelector("#exp-term"),
        cols: getComputedStyle(grid).gridTemplateColumns.split(/\s+/).length,
        subs: [...document.querySelectorAll(".game-tile")].filter((t) => t.querySelector(".gt-sub")).length,
        mgHead: head ? head.textContent.trim() : "",
        lip: lip ? lip.textContent.trim() : "",
        // …a SIBLING of the review group drawn directly after it — see the phone block above for why
        // it went INSIDE the review group in Aug 2026, on request, as the card's own bottom row — so what
        // is asserted is that it is a descendant sitting under the deck list, not a sibling after the card
        lipInCard: !!(lip && grp && grp.contains(lip)),
        lipBelowDecks: (() => {
          const l = document.querySelector(".active-decks");
          if (!lip) return false;
          if (!l) return true;
          return Math.round(lip.getBoundingClientRect().top) >= Math.round(l.getBoundingClientRect().bottom) - 1;
        })(),
        about: !!document.querySelector(".home-about"),
        // Collections left the top bar with the tile row; that button is the only way to it now
        decksTab: !!document.querySelector('.topbar [data-route="decks"]'),
        // …and About left it a fortnight later, so the home page's own line is the only way there too
        aboutTab: !!document.querySelector('.topbar [data-route="mission"]'),
      };
    });
    check("[desktop] the home page is the phone's page now: no discovery row",
      !d.explore && !d.atlasTile && !d.cod && !d.tod, JSON.stringify(d));
    check("[desktop] ...so the globe is not fetched for an ornament",
      !asked.some((u) => /\/world\.js/.test(u)), asked.filter((u) => /\/world\.js/.test(u)).join(","));
    check("[desktop] ...the games three to a row, and no taglines on them", d.cols === 3 && d.subs === 0, JSON.stringify({ cols: d.cols, subs: d.subs }));
    check("[desktop] ...under a Minigames heading, under the review", /minigames/i.test(d.mgHead) && d.order[0] < d.order[1] && d.order[1] < d.order[2], JSON.stringify(d.order));
    check("[desktop] ...with the Collections button closing the review card, under the deck list",
      /^collections$/i.test(d.lip) && d.lipInCard && d.lipBelowDecks,
      JSON.stringify({ label: d.lip, inCard: d.lipInCard, belowDecks: d.lipBelowDecks }));
    check("[desktop] ...and Collections gone from the top bar, that button being the way to it", !d.decksTab);
    /* About left the DESKTOP's top bar too (Aug 2026, on request), a fortnight after Collections did and
       for the same reason: the two bars now name the same destinations, and the home page's own line is
       the only route to the page at every width. This assertion was the opposite way round while the tab
       existed — it is the pair of them that matters, since a link removed from both places would leave
       #mission reachable only by typing it. */
    check("[desktop] ...and About reached from the home page's line, its tab having left the top bar too",
      d.about && !d.aboutTab, JSON.stringify({ line: d.about, tab: d.aboutTab }));
    check("[desktop] ...but #decks itself still resolves — every shared link points at it", await page.evaluate(async () => {
      location.hash = "decks";
      await new Promise((r) => setTimeout(r, 700));
      return !!document.querySelector(".collection-list, .collection");
    }));
    await page.close();
  }

  /* ================= 7b2. the version line in the home page's top-left corner =================
     Aug 2026, on request. Every failure here is silent, and the last one is the reason the feature exists:
     a version number that STOPS following `window.FOLIO_VERSION` still prints a plausible number, and the
     reader quoting it in a bug report is then telling you about a build nobody shipped. So the record is
     mutated in the page and the line re-rendered — a boot-time capture passes every other assertion here
     and fails that one. */
  {
    for (const [label, vp] of [["desktop", DESKTOP], ["phone", PHONE]]) {
      const page = await browser.newPage({ viewport: vp });
      await watch(page);
      await page.goto(base + "#home", { waitUntil: "load" });
      await page.waitForTimeout(1500);
      const v = await page.evaluate(() => {
        const el = document.querySelector(".page .site-ver");
        if (!el) return null;
        const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
        const head = document.querySelector(".page .page-head").getBoundingClientRect();
        return {
          text: el.textContent.trim(), fs: parseFloat(cs.fontSize),
          x: Math.round(r.left), y: Math.round(r.top), bottom: Math.round(r.bottom),
          headX: Math.round(head.left), headY: Math.round(head.top),
          first: document.querySelector(".page").firstElementChild === el,
          notranslate: el.classList.contains("notranslate"),
          // the site's own quiet token, so High contrast re-tones it with every other caption (test-a11y)
          faint: (() => {
            const p = document.createElement("i");
            p.style.cssText = "color:var(--ink-faint);position:absolute;left:-9999px";
            document.body.appendChild(p);
            const want = getComputedStyle(p).color; p.remove();
            return cs.color === want ? "ok" : cs.color + " ≠ " + want;
          })(),
          // and nothing painted over it — the phone's Edit button holds the opposite corner
          clear: document.elementFromPoint(Math.round(r.left) + 2, Math.round(r.top + r.height / 2)) === el,
        };
      });
      check("[" + label + "] the home page carries a version line", !!v, v ? v.text : "missing");
      if (!v) { await page.close(); continue; }
      check("[" + label + "] ...reading as a version and a timestamp", /^v\d+\.\d+ · .*\d/.test(v.text), v.text);
      check("[" + label + "] ...very small and in the quiet ink", v.fs <= 11 && v.faint === "ok", JSON.stringify({ fs: v.fs, col: v.faint }));
      /* TOP-LEFT in both layouts, and the left half is the one that breaks: below 640px `.page-head` is
         CENTRED, and a version line that inherited that would sit in the middle of the page reading as a
         title rather than as a stamp. It is a sibling before the head, so it must clear it upward too. */
      check("[" + label + "] ...first on the page, above the head", v.first && v.bottom <= v.headY, JSON.stringify({ first: v.first, bottom: v.bottom, head: v.headY }));
      check("[" + label + "] ...and flush LEFT with it, not centred", v.x === v.headX, JSON.stringify({ x: v.x, headX: v.headX }));
      check("[" + label + "] ...with nothing painted over it", v.clear);
      check("[" + label + "] ...and marked notranslate", v.notranslate);
      await page.close();
    }

    const page = await browser.newPage({ viewport: DESKTOP });
    await watch(page);
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1400);
    check("the version line is the home page's alone", await page.evaluate(async () => {
      location.hash = "#decks";
      await new Promise((r) => setTimeout(r, 700));
      return !document.querySelector(".page .site-ver");
    }));
    // read at RENDER, never captured at boot — see the section header
    const live = await page.evaluate(async () => {
      window.FOLIO_VERSION = { v: "9.9", released: "2031-01-02T03:04Z" };
      location.hash = "#home";
      await new Promise((r) => setTimeout(r, 800));
      const el = document.querySelector(".page .site-ver");
      return el ? el.textContent.trim() : "";
    });
    check("...and is read from FOLIO_VERSION at render, not captured at boot", /^v9\.9 · /.test(live) && /2031/.test(live), live);
    // a build that somehow ships without a record prints NOTHING — a placeholder version is a lie
    const none = await page.evaluate(async () => {
      delete window.FOLIO_VERSION;
      location.hash = "#decks";
      await new Promise((r) => setTimeout(r, 500));
      location.hash = "#home";
      await new Promise((r) => setTimeout(r, 800));
      return { ver: !!document.querySelector(".site-ver"), head: !!document.querySelector(".page-head h1") };
    });
    check("...printing nothing at all when the record is missing", !none.ver && none.head, JSON.stringify(none));
    await page.close();
  }

  /* ================= 7c. the Atlas panel's discovery chip and its pages ================= */
  {
    const page = await browser.newPage({ viewport: PHONE });
    await watch(page);
    await atlas(page, base);
    const cp = await page.evaluate(() => {
      const el = document.querySelector("#countryPop");
      const name = document.querySelector("#cpName"), chip = document.querySelector("#cpNew");
      // the chip only shows on a place's FIRST opening, so it is filled by hand here — its POSITION is what
      // this asserts, and the first-sight path is covered by test-discovery.js
      chip.innerHTML = '<span class="disc-chip"><b>New place!</b></span>';
      chip.hidden = false;
      name.textContent = "France";
      el.hidden = false;
      const a = name.getBoundingClientRect(), b = chip.getBoundingClientRect();
      const secs = [...document.querySelectorAll(".cp-cols > .cp-sec")];
      return {
        sameRow: b.top < a.bottom - 2 && b.bottom > a.top + 2,   // vertically overlapping = one horizontal bar
        beside: b.left >= a.right - 1,
        stop: secs.length ? getComputedStyle(secs[0]).scrollSnapStop : "",
        headed: !!document.querySelector(".cp-titlerow #cpName") && !!document.querySelector(".cp-titlerow #cpNew"),
      };
    });
    check("the discovery chip shares the popup title's row", cp.sameRow && cp.beside, JSON.stringify(cp));
    check("...as its sibling in the title row", cp.headed);
    // a big swipe used to carry from the description straight to the figures, skipping the year paragraph
    check("...and a swipe can never skip the year section", cp.stop === "always", cp.stop);
    await page.close();
  }

  /* ================= 7d. the whiteboard marker on a phone =================
     Three failures that all look like something else. A marker parked ON the tab bar looks like a design
     decision. A pen you cannot put down without also putting the tools away is a state machine bug that
     reads as stiffness. And the ink canvas covering Show answer looks like a dead button — the canvas spans
     the whole visible page, and `.page`/`.cardwrap` both animate, so no z-index inside them can ever lift a
     control above it; the pass-through in setupWhiteboard is the only thing holding this up. */
  {
    const page = await browser.newPage({ viewport: PHONE, hasTouch: true });
    await watch(page);
    await studyEasy(page, base, 0);
    const place = await page.evaluate(() => {
      const w = document.querySelector(".wb-tools").getBoundingClientRect();
      const t = document.querySelector(".tabbar").getBoundingClientRect();
      return { wbBottom: Math.round(w.bottom), wbRight: Math.round(w.right), tabTop: Math.round(t.top), vw: innerWidth };
    });
    check("the marker sits clear of the tab bar, not on it", place.wbBottom <= place.tabTop, JSON.stringify(place));
    check("...at the bottom RIGHT", place.vw - place.wbRight < 40, JSON.stringify(place));
    // …and while the question is still up: a phone must not be handed the keyboard on every card. (Checked
    // here, before the answer is revealed — revealing replaces the blanks with the graded spans.)
    check("a touch screen is not given the keyboard on each card",
      await page.evaluate(() => !!document.querySelector(".blank-input") && !/blank-input/.test((document.activeElement || {}).className || "")));

    await page.evaluate(() => document.querySelector(".wb-toggle").click());
    await page.waitForTimeout(300);
    const panel = await page.evaluate(() => ({
      draw: !!document.querySelector(".wb-pen"),
      markWithSizes: !!document.querySelector(".wb-sizes-row .wb-hl"),
      custom: !!document.querySelector(".wb-custom"),
      nativeDialog: !!document.querySelector(".wb-custom input[type=color]"),
      pickShut: (() => { const p = document.querySelector(".wb-pick"); return !!p && !p.checkVisibility(); })(),
      /* Erase over Undo, Clear over Redo: two columns, and which cell each lands in is the request.
         The last two VISIBLE rows — the stylus row sits between them in the markup and is `hidden` until
         a pen has been seen, and querySelectorAll finds a hidden element like any other. Read off the
         raw list this had been comparing a hidden row against undo/redo ever since the stylus row
         landed, and reporting the panel as wrong when it was right (found Aug 2026, while adding the
         book's ink; it fails identically on the commit before that work). */
      grid: [...document.querySelectorAll(".wb-panel .wb-row")].filter((r) => !r.hidden).slice(-2).map((r) => [...r.children].map((c) => c.className.replace(/wb-btn ?/, "")).join("+")).join(" / "),
      penDown: document.querySelector(".draw-canvas").classList.contains("on"),
      sizeOn: (document.querySelector(".wb-size.on") || {}).dataset,
    }));
    check("the panel has no Draw button — the sizes are the pen", !panel.draw);
    check("...Mark beside them", panel.markWithSizes);
    check("...Erase above Undo and Clear above Redo", panel.grid === "wb-eraser+wb-clear / wb-undo+wb-redo", panel.grid);
    check("...and a custom colour of the reader's own", panel.custom && panel.pickShut, JSON.stringify({ swatch: panel.custom, shut: panel.pickShut }));
    // the platform's own dialog is a full-screen sheet of sliders over the card being annotated; the picker
    // is inline now, so an <input type=color> anywhere here means the change was reverted
    check("...chosen inline, not in the platform's colour dialog", !panel.nativeDialog);
    /* OPENING THE TOOLS SELECTS NOTHING (Aug 2026, on request; this asserted the opposite until then).
       `enabled` lays a canvas over the whole page, so picking the pen for a reader who has merely opened
       the menu takes the card away from anyone who came for Undo, Clear, a colour or the stylus row. Both
       halves are asserted, because they fail in opposite directions and each looks like the feature working
       from the other side: nothing is selected on open, and choosing a tool IS what starts drawing. */
    check("...opening the tools selects no tool", !panel.penDown && !panel.sizeOn, JSON.stringify({ pen: panel.penDown, size: panel.sizeOn || null }));

    const toggled = await page.evaluate(async () => {
      const btn = document.querySelector(".wb-size");
      btn.click(); await new Promise((r) => setTimeout(r, 120));
      const down = document.querySelector(".draw-canvas").classList.contains("on");
      btn.click(); await new Promise((r) => setTimeout(r, 120));
      return { down, up: !document.querySelector(".draw-canvas").classList.contains("on") };
    });
    check("choosing a size is what puts the pen down", toggled.down, JSON.stringify(toggled));
    check("...and clicking it again picks the pen up", toggled.up, JSON.stringify(toggled));

    /* The custom colour: open the picker off the dashed swatch, then press into each field. A press has to
       set the colour where it lands (the fields are dragged, so pointerdown IS the gesture), the hue bar has
       to move the hue and the field the saturation and brightness, and the result has to outlive the
       session — the picker is the ONLY way to a colour outside the five presets. */
    const pick = await page.evaluate(async () => {
      const press = (el, fx, fy) => {
        const r = el.getBoundingClientRect();
        const o = { bubbles: true, pointerId: 7, button: 0, clientX: r.left + r.width * fx, clientY: r.top + r.height * fy };
        el.dispatchEvent(new PointerEvent("pointerdown", o));
        el.dispatchEvent(new PointerEvent("pointerup", o));
      };
      document.querySelector(".wb-custom").click();
      await new Promise((r) => setTimeout(r, 150));
      const sv = document.querySelector(".wb-sv"), hue = document.querySelector(".wb-hue");
      if (!sv || !hue || !document.querySelector(".wb-pick").checkVisibility()) return { open: false };
      press(hue, 0.5, 0.5);                       // half way along the bar: cyan
      await new Promise((r) => setTimeout(r, 80));
      const afterHue = document.querySelector(".wb-hex").textContent.trim();
      press(sv, 1, 0);                            // top-right of the field: the pure hue
      await new Promise((r) => setTimeout(r, 120));
      return {
        open: true, afterHue,
        hex: document.querySelector(".wb-hex").textContent.trim(),
        stored: localStorage.getItem("folio_wb_custom_v1") || "",
        // the knob follows the choice, or the field says nothing about what is selected
        knob: (() => { const k = document.querySelector(".wb-sv .wb-knob"); return { l: k.style.left, t: k.style.top }; })(),
      };
    });
    check("the custom swatch opens an inline picker", pick.open);
    // half way along the bar is cyan, so green and blue come up equal and above red — whatever saturation
    // and brightness the swatch happened to carry in
    check("...whose hue bar sets the hue alone", (() => {
      const m = /^#(..)(..)(..)$/.exec(pick.afterHue || "");
      if (!m) return false;
      const [r, g, b] = m.slice(1).map((x) => parseInt(x, 16));
      return pick.afterHue !== "#7A4FC2" && g === b && g > r;
    })(), pick.afterHue);
    // top-right of the field is full saturation at full brightness: the pure hue, and nothing else can be
    check("...and whose field sets saturation and brightness",
      pick.hex === "#00FFFF" && parseFloat(pick.knob.l) === 100 && parseFloat(pick.knob.t) === 0,
      JSON.stringify({ hex: pick.hex, knob: pick.knob }));
    check("...with the chosen colour surviving the session", /00ffff/i.test(pick.stored), pick.stored);
    await page.evaluate(() => document.querySelector(".wb-custom").click());   // shut it again — the ink test needs the card

    // the real test: TAP Show answer with the pen down. A click through page.evaluate would bypass the very
    // hit-testing this is about, so it goes through the mouse.
    const rb = await page.evaluate(() => document.querySelector("#reveal-btn").getBoundingClientRect().toJSON());
    await page.mouse.click(rb.x + rb.width / 2, rb.y + rb.height / 2);
    await page.waitForTimeout(700);
    check("Show answer still works under the ink", await page.evaluate(() => !!document.querySelector("#gradebar.show")));
    const reach = await page.evaluate(() => {
      const out = {};
      [".grade.again", ".grade.easy", ".grade-help", "#gradebar .suspendbtn"].forEach((s) => {
        const el = document.querySelector(s);
        if (!el) { out[s] = "missing"; return; }
        const b = el.getBoundingClientRect();
        const at = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
        out[s] = at && at.closest(s) ? "reachable" : "blocked";
      });
      return out;
    });
    check("...as do the grades and the row under them", Object.keys(reach).every((k) => reach[k] === "reachable"), JSON.stringify(reach));
    await page.close();
  }

  /* ================= 7d2. swiping between pages on a phone (Aug 2026, on request) =================
     A false positive here TAKES A PAGE AWAY, so what is guarded is as much what must NOT navigate as what
     must: a diagonal (a scroll that wandered), a short drag, and the Atlas, which is excluded outright
     because a drag there turns the globe. The gesture is dispatched as real PointerEvents rather than
     through page.touchscreen: the handler is bound to `document` and keys off pointerType.

     Two things were added Aug 2026, on request, and both fail silently. COLLECTIONS is out of the order —
     it has no tab, so the swipe was landing readers on a page the bar cannot reach, with nothing lit in it
     to say where they were; a swipe that still reaches it looks exactly like one that does not, since the
     page renders fine either way. And the transition is a full CROSS-SLIDE rather than the 26px nudge it
     was, which was reported as "a hard cut": that one is measured MID-FLIGHT, because the finished state
     of a slide and the finished state of a cut are the same page in the same place. */
  {
    const page = await browser.newPage({ viewport: PHONE, hasTouch: true, isMobile: true });
    await watch(page);
    const swipe = (dx, dy) => page.evaluate(async ([d, v]) => {
      const send = (t, x, y) => document.dispatchEvent(new PointerEvent(t, { pointerId: 7, pointerType: "touch", clientX: x, clientY: y, bubbles: true, cancelable: true }));
      const y0 = 340, x0 = d < 0 ? 300 : 90;
      send("pointerdown", x0, y0);
      await new Promise((r) => setTimeout(r, 40));
      send("pointermove", x0 + d / 2, y0 + v / 2);
      await new Promise((r) => setTimeout(r, 40));
      send("pointerup", x0 + d, y0 + v);
      await new Promise((r) => setTimeout(r, 750));
    }, [dx, dy || 0]);
    const where = () => page.evaluate(() => location.hash || "#");
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    await swipe(-120);
    check("a swipe left moves to the next page", (await where()) === "#library", await where());
    check("...and that page is NOT Collections, which has no tab and is out of the order",
      (await where()) !== "#decks", await where());
    await swipe(-120);
    check("...and on to the one after it", (await where()) === "#account", await where());
    await swipe(120);
    check("...a swipe right comes back", (await where()) === "#library", await where());
    await swipe(-30);
    check("...a short drag is not a swipe", (await where()) === "#library", await where());
    await swipe(-120, 220);
    check("...nor is a diagonal, which is a scroll that wandered", (await where()) === "#library", await where());
    await swipe(120);
    await swipe(120);
    check("...and the ends are ends, not a carousel", (await where()) === "#", await where());
    /* The order IS the tab bar's, minus the Atlas — asserted against the bar itself rather than against a
       list written out here, so a tab added or removed later fails on the rule instead of on a copy of it
       that nobody remembered to update. */
    const order = await page.evaluate(() =>
      ({ tabs: [...document.querySelectorAll(".tabbar .tab:not(.tab-admin)")].map((t) => t.dataset.route) }));
    const appjs = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
    const swipeOrder = (appjs.match(/const SWIPE_ORDER = \[([^\]]*)\]/) || [])[1] || "";
    const swipeNames = swipeOrder.split(",").map((s) => s.trim().replace(/^"|"$/g, "")).filter(Boolean);
    /* …minus the ADMIN-ONLY tabs too (Aug 2026, with War of Ages). A swipe must not be able to land a
       reader on a page most readers cannot reach at all, and deriving the order from what is VISIBLE
       would make it a different order for an editor than for everybody else — so the rule is about the
       kind of destination rather than about who is looking. */
    check("the swipe order is the tab bar's, minus the Atlas and the admin-only pages",
      swipeNames.join(",") === order.tabs.filter((t) => t !== "map").join(","),
      swipeNames.join(",") + "  vs bar " + order.tabs.join(","));

    /* IT IS A SLIDE, NOT A CUT — measured 60ms into the transition, since by the end the two are
       indistinguishable. Both halves have to be there: the outgoing page must still exist (a ghost, or
       there is nothing to slide off) and the incoming one must be genuinely off to the side rather than
       nudged. `page-next` means the finger went left, so the arriving page starts to the RIGHT. */
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1400);
    const mid = await page.evaluate(async () => {
      const send = (t, x, y) => document.dispatchEvent(new PointerEvent(t, { pointerId: 8, pointerType: "touch", clientX: x, clientY: y, bubbles: true, cancelable: true }));
      send("pointerdown", 300, 340);
      await new Promise((r) => setTimeout(r, 40));
      send("pointerup", 160, 340);
      await new Promise((r) => setTimeout(r, 60));
      const pg = document.querySelector("#view > .page"), gh = document.querySelector(".page-ghost");
      return {
        dirClass: pg && pg.className,
        pageLeft: pg && pg.getBoundingClientRect().left,
        ghostLeft: gh && gh.getBoundingClientRect().left,
        ghost: !!gh, w: innerWidth,
        clipped: getComputedStyle(document.querySelector(".stage")).overflowX,
      };
    });
    check("a swiped page carries its direction", /page-next/.test(mid.dirClass || ""), String(mid.dirClass));
    check("...the outgoing page is still there to slide off", mid.ghost, JSON.stringify(mid));
    check("...the incoming one is a whole page-width off to the side, not a 26px nudge",
      mid.pageLeft > mid.w * 0.4, mid.pageLeft + " of " + mid.w);
    check("...and the outgoing one has set off the other way", mid.ghostLeft < -10, String(mid.ghostLeft));
    check("...with the stage clipped so neither can be scrolled into", mid.clipped === "clip", mid.clipped);
    await page.waitForTimeout(600);
    const settled = await page.evaluate(() => ({
      left: document.querySelector("#view > .page").getBoundingClientRect().left,
      ghost: !!document.querySelector(".page-ghost"),
      clipped: getComputedStyle(document.querySelector(".stage")).overflowX,
    }));
    check("...and it lands, the copy removed and the clip released",
      Math.abs(settled.left - 16) < 30 && !settled.ghost && settled.clipped !== "clip", JSON.stringify(settled));
    /* …and the same gesture as a REAL touch, which is the assertion that was missing (Aug 2026, on a
       report that the book's chapter swipe did nothing on a phone — this one was broken in exactly the
       same way and had been since it shipped). Everything above dispatches PointerEvents by hand, which
       bypasses the browser's own gesture arbitration: under the default touch-action a real finger has
       the drag claimed for scrolling the moment it passes the slop, POINTERCANCEL is fired, pointerup
       never arrives, and a handler that measures the gesture at pointerup can never see one. `.page`
       carries `touch-action:pan-y pinch-zoom` for it, which no JS can substitute — so it is asserted
       through CDP touch input, and paired with the vertical drag that must still scroll. */
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const cdp = await page.context().newCDPSession(page);
    const realSwipe = async (x0, y0, dx, dy) => {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0, id: 1 }] });
      for (let i = 1; i <= 6; i++) {
        await page.waitForTimeout(25);
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + dx * i / 6, y: y0 + (dy || 0) * i / 6, id: 1 }] });
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(700);
    };
    await realSwipe(320, 500, -170);
    check("a REAL touch swipe moves page, not just a synthesised one", (await where()) === "#library", await where());
    await realSwipe(80, 500, 170);
    check("...and back the other way", /^#(home)?$/.test(await where()), await where());
    await page.evaluate(() => window.scrollTo(0, 0));
    await realSwipe(200, 620, 0, -280);
    check("...while a vertical drag still scrolls the page rather than navigating",
      (await where()) === "#home" || (await where()) === "#", await where());
    await cdp.detach();
    // the Atlas is out of the order in BOTH directions — a drag there turns the globe
    await atlas(page, base);
    await swipe(-140);
    check("a swipe on the Atlas turns the globe rather than leaving it", (await where()) === "#map", await where());
    await page.close();
  }
  {
    // …and above the breakpoint it is not wired at all: a mouse drag is a selection
    const page = await browser.newPage({ viewport: DESKTOP, hasTouch: true });
    await watch(page);
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1400);
    await page.evaluate(async () => {
      const send = (t, x, y) => document.dispatchEvent(new PointerEvent(t, { pointerId: 9, pointerType: "touch", clientX: x, clientY: y, bubbles: true, cancelable: true }));
      send("pointerdown", 900, 400); send("pointermove", 800, 400); send("pointerup", 700, 400);
      await new Promise((r) => setTimeout(r, 700));
    });
    // "#home" or "" — the app only clears the hash when it ROUTES home, and booting there leaves what was typed
    check("the swipe is phone-only", /^(#home)?$/.test(await page.evaluate(() => location.hash)),
      await page.evaluate(() => location.hash));
    await page.close();
  }

  /* ================= 7e. the Atlas sheet's height =================
     TWO rules, and the second was added Aug 2026 on request. The height is the reader's to drag — shorter
     must still show the title (the floor is measured through offsetTop, since the head is a scroller inside
     the box being shrunk and its rect collapses along with it), and what it is left at carries to the next
     place, which is the only reason to set it. And the CEILING is what the page on screen actually needs:
     "the max height should always be the point where everything is displayed fully, so we are never left
     with empty space at the bottom." So a drag upward stops at the content, not at the top of the screen,
     and swiping to a shorter page pulls the sheet down to fit it. Both failures are silent — a sheet half
     full of nothing looks like a sheet. */
  {
    const page = await browser.newPage({ viewport: PHONE, hasTouch: true });
    await watch(page);
    await atlas(page, base);
    await page.evaluate(() => { location.hash = "#map/2026/france"; });
    await page.waitForTimeout(2500);
    // how much of the scroller is NOT filled by the page in it — the "empty space at the bottom"
    const slack = () => page.evaluate(() => {
      const cols = document.querySelector(".cp-cols");
      const panes = [...cols.children].filter((c) => !c.hidden && !c.classList.contains("cp-blank"));
      const i = Math.max(0, Math.min(panes.length - 1, Math.round(cols.scrollLeft / (cols.clientWidth || 1))));
      const p = document.querySelector("#countryPop").getBoundingClientRect();
      return { slack: Math.round(cols.clientHeight - panes[i].scrollHeight), h: Math.round(p.height), top: Math.round(p.top), pane: i, panes: panes.length };
    });
    /* THE DRAG IS GONE (Aug 2026, on request — "remove the size dragging system, and keep only the
       chevron"). Asserted as an ABSENCE from the DOM rather than as a hidden element: a grip that is
       merely display:none is still a pointer target on any width where the rule stops matching, and the
       whole point of removing it is that there is one control and not two. */
    const start = await page.evaluate(() => {
      const p = document.querySelector("#countryPop");
      return { hidden: p.hidden, grip: !!document.querySelector("#cpGrab"), h: Math.round(p.getBoundingClientRect().height) };
    });
    check("the place sheet has no resize grip", !start.hidden && !start.grip, JSON.stringify(start));

    /* SHUT BY DEFAULT since Aug 2026, on request: "the popup panel at the bottom should only open far
       enough to reveal the name of the state, but have a chevron that can reveal the information sections,
       which should always be collapsed by default." Asserted BEFORE the content-fit checks below, and they
       are made to open it first — with the sheet shut `.cp-cols` is display:none, so every measurement of
       it reads zero and the fit assertions pass on nothing at all, which is the shape this file keeps
       warning about. */
    const shut = await page.evaluate(() => {
      const p = document.querySelector("#countryPop"), t = document.querySelector(".cp-titlerow");
      const more = document.querySelector("#cpMore");
      const pr = p.getBoundingClientRect(), tr = t.getBoundingClientRect();
      const cs = getComputedStyle(more);
      const mr = more.getBoundingClientRect();
      return {
        h: Math.round(pr.height),
        shut: p.classList.contains("cp-shut"),
        titleShown: tr.top >= pr.top - 1 && tr.bottom <= pr.bottom + 1,
        name: (document.querySelector("#cpName") || {}).textContent || "",
        chevron: !!more && !more.hidden && cs.display !== "none",
        expanded: more && more.getAttribute("aria-expanded"),
        colsShown: getComputedStyle(document.querySelector(".cp-cols")).display !== "none",
        border: parseFloat(cs.borderTopWidth) || 0,
        bg: cs.backgroundColor,
        cw: Math.round(mr.width), ch: Math.round(mr.height),
      };
    });
    check("a place opens SHUT — its name and nothing else", shut.shut && !shut.colsShown, JSON.stringify(shut));
    check("...still showing the name it was opened for", shut.titleShown && shut.name.length > 0, shut.name);
    check("...with a chevron offering the rest", shut.chevron && shut.expanded === "false", JSON.stringify(shut));
    check("...and covering a fraction of the map", shut.h < PHONE.height * 0.3, shut.h + " of " + PHONE.height);
    /* No border and no fill (Aug 2026, on request — "remove the darkened background square behind the
       chevron"), and still a real target: the box was never what made it tappable, so losing it must not
       shrink the hit area. */
    check("...drawn bare rather than as a boxed tile",
      shut.border === 0 && /rgba\(0, 0, 0, 0\)|transparent/.test(shut.bg), JSON.stringify({ border: shut.border, bg: shut.bg }));
    check("...at a tappable size all the same", shut.cw >= 28 && shut.ch >= 28, shut.cw + "x" + shut.ch);

    await page.click("#cpMore");
    await page.waitForTimeout(500);
    const opened = await page.evaluate(() => {
      const p = document.querySelector("#countryPop");
      return {
        h: Math.round(p.getBoundingClientRect().height),
        shut: p.classList.contains("cp-shut"),
        expanded: document.querySelector("#cpMore").getAttribute("aria-expanded"),
        colsShown: getComputedStyle(document.querySelector(".cp-cols")).display !== "none",
      };
    });
    check("...pressing it reveals the sections", !opened.shut && opened.colsShown && opened.expanded === "true"
      && opened.h > shut.h, JSON.stringify({ shut: shut.h, opened: opened.h }));

    const s0 = await slack();
    check("...and opens no taller than the page in it needs", s0.slack <= 24, JSON.stringify(s0));

    /* IT FOLDS RATHER THAN CUTTING (Aug 2026, on request), and both halves are measured MID-FLIGHT — a
       settled fold and a jumpcut end in exactly the same place, so anything asserted afterwards passes on
       either. The height must genuinely be BETWEEN the two states part way through; and the sections must
       still be on the page while it shrinks, since `display:none` cannot be transitioned and taking the
       content away before the box closes is the jumpcut the request is about. */
    const folding = await page.evaluate(async () => {
      const p = document.querySelector("#countryPop");
      const from = p.getBoundingClientRect().height;
      document.querySelector("#cpMore").click();
      await new Promise((r) => setTimeout(r, 90));
      const mid = p.getBoundingClientRect().height;
      const colsShown = getComputedStyle(document.querySelector(".cp-cols")).display !== "none";
      await new Promise((r) => setTimeout(r, 600));
      return { from: Math.round(from), mid: Math.round(mid), to: Math.round(p.getBoundingClientRect().height), colsShown };
    });
    check("...and shutting it EASES rather than cutting", folding.mid < folding.from - 4 && folding.mid > folding.to + 4,
      JSON.stringify(folding));
    check("...with its sections still on the page while it closes", folding.colsShown, JSON.stringify(folding));

    await page.click("#cpMore");
    await page.waitForTimeout(600);
    // …and a swipe to another page re-fits it. The figures grid is far shorter than the description.
    const tall = await slack();
    await page.evaluate(async () => {
      const cols = document.querySelector(".cp-cols");
      cols.scrollLeft = cols.clientWidth * ([...cols.children].filter((c) => !c.hidden && !c.classList.contains("cp-blank")).length - 1);
      cols.dispatchEvent(new Event("scroll"));
      await new Promise((r) => setTimeout(r, 500));
    });
    await page.waitForTimeout(400);
    const swiped = await slack();
    check("...swiping to a shorter page shrinks the sheet to fit it", swiped.slack <= 24 && swiped.h <= tall.h + 1,
      JSON.stringify({ tall: tall, swiped: swiped }));

    /* THE NEXT PLACE OPENS SHUT, AND THEN TO ITS OWN PAGE'S HEIGHT — there is nothing remembered now, which
       is what removing the drag bought. Both halves are asserted because they fail in opposite directions:
       a sheet still carrying a height from the last place would be the thing the grip was removed for, and
       one that would not open at all is worse than either. */
    await page.evaluate(() => { location.hash = "#map/2026/spain"; });
    await page.waitForTimeout(1800);
    const next = await page.evaluate(() => {
      const p = document.querySelector("#countryPop");
      return { h: Math.round(p.getBoundingClientRect().height), shut: p.classList.contains("cp-shut") };
    });
    check("...and the NEXT place opens shut too", next.shut && next.h < PHONE.height * 0.3,
      JSON.stringify(next));
    await page.click("#cpMore");
    await page.waitForTimeout(600);
    const reopened = await slack();
    check("...and opens to what ITS own page needs", reopened.slack <= 24 && reopened.h > next.h,
      JSON.stringify({ shut: next.h, opened: reopened }));
    await page.close();
  }

  /* ================= 7f. the daily quote does not resize the page =================
     Flipping the quote to its original language swaps in a block that rarely wraps to the same number of
     lines, and everything under it — the review banner and the games below it — used to lift or drop by one. */
  {
    const page = await browser.newPage({ viewport: PHONE });
    await watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(1700);
    const q = await page.evaluate(async () => {
      const fig = document.querySelector(".daily-quote.dq-flip");
      if (!fig) return null;   // not every day's quote has a documented original
      const below = document.querySelector(".review-group");   // the first thing under the quote on a phone
      const before = { h: Math.round(fig.getBoundingClientRect().height), y: Math.round(below.getBoundingClientRect().top) };
      fig.click();
      await new Promise((r) => setTimeout(r, 900));
      const after = { h: Math.round(fig.getBoundingClientRect().height), y: Math.round(below.getBoundingClientRect().top) };
      return { before, after, flipped: fig.classList.contains("dq-showing-original") };
    });
    if (!q) check("the day's quote has no original to flip to — skipped", true);
    else {
      check("flipping the quote does flip it", q.flipped, JSON.stringify(q));
      check("...without changing the height of its box", Math.abs(q.after.h - q.before.h) <= 1, JSON.stringify(q));
      check("...so nothing below it moves", Math.abs(q.after.y - q.before.y) <= 1, JSON.stringify(q));
    }
    await page.close();
  }

  /* ================= 8. no overlay outlives the page that spawned it =================
     A back/forward, a deep link and any programmatic hash change move the route without a click, and an
     overlay living on document.body then sits over whatever renders next. render() owns those, so it has to
     clear them — and a hash change is the probe, never a click, since a click dismisses several of them
     anyway and would prove nothing.

     WHAT LEVELLING UP RAISES IS THE CHEST, NOT A CONFETTI CARD. This section watched `.levelup-pop` until
     Aug 2026, and the Reliquary retired that path deliberately: `announceLevelUps` calls `grantChest()` and
     `openChestPop({level})`, and the chest overlay IS the celebration, there being no sense in two overlays
     for one event. The assertion went on looking for the popup and failed on a feature working exactly as
     designed. `congratsPopup` itself is NOT dead — it survives for anything else that wants it, and
     `closeCongrats` is still in render()'s close list — but nothing reaches it from a level-up, so testing
     it here would be testing an unreachable path. The level is asserted on the overlay too: a chest opened
     from the home banner's chip carries no `.chest-lvl`, and without that line this would pass on any chest
     at all rather than on the level-up that was supposed to raise one. */
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    await watch(page);
    // Folio level 1 costs XP_PER_LEVEL cards, and Easy graduates a new card outright, so the last grade levels
    // up. The figure is READ OUT OF app.js rather than written here: it was 3 and is 5 (Aug 2026), and a
    // hard-coded 3 turns a deliberate change to the curve into a failure that reads as a broken overlay.
    const XP_STEP = Number((/const XP_PER_LEVEL = (\d+);/.exec(fs.readFileSync(path.join(ROOT, "app.js"), "utf8")) || [, 3])[1]);
    /* …and the day has to be willing to SHOW that many. The default allowance is 3 new cards a day, which is
       fewer than a level now costs, so the day has to be widened first — otherwise this section studies the
       whole day out, never levels up, and reports a limit as a broken overlay.
       It takes two phases because a fresh visitor's state lives in memory: `folio_v1` is not written until the
       app first saves, so there is nothing to patch until one card has been graded. Grade one, widen the day,
       reload so the app reads it, then grade the rest. */
    await studyEasy(page, base, 1);
    await page.addInitScript((n) => {
      try {
        const raw = localStorage.getItem("folio_v1");
        if (!raw) return;
        const st = JSON.parse(raw);
        if (!st || !st.settings) return;
        st.settings.newPerDay = n;
        localStorage.setItem("folio_v1", JSON.stringify(st));
      } catch (e) { /* leave the day as it is; the assertion below will say so */ }
    }, XP_STEP + 2);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(900);
    await studyEasy(page, base, XP_STEP - 1);
    const up = await page.locator(".chest-pop").count();
    check("levelling up raises its chest", up === 1, XP_STEP + " cards studied → " + up + " overlay(s)");
    check("...and no confetti card behind it", await page.locator(".levelup-pop").count() === 0);
    if (up) {
      // the level is announced ON the chest — that is what makes this one the celebration rather than
      // an ordinary chest opened from the home banner's chip, which carries no such line
      check("...announcing the level reached", /level/i.test((await page.locator(".chest-lvl").first().textContent().catch(() => "")) || ""),
        (await page.locator(".chest-lvl").first().textContent().catch(() => "")) || "no .chest-lvl");
      // a hash change, NOT a click — a click would dismiss it and prove nothing
      await page.evaluate(() => { location.hash = "#decks"; });
      await page.waitForTimeout(900);
      check("...and a hash change takes it away with the page", await page.locator(".chest-pop").count() === 0);
      await page.evaluate(() => { location.hash = "#settings"; });
      await page.waitForTimeout(700);
      check("...leaving nothing behind on the next page either", await page.locator(".chest-pop").count() === 0);
    }
    await page.close();
  }

  const real = errs.filter((e) => !/ERR_|manifest\.json|CORS|favicon|example\.org/.test(e));
  check("no console/page errors", real.length === 0, [...new Set(real)].join(" | "));

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
