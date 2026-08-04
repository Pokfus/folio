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
// grade `n` cards Easy — Easy graduates a new card outright, so each grade is a DISTINCT card
// (Good makes it a learning step that comes back later in the same queue)
async function studyEasy(page, base, n) {
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

(async () => {
  const server = serve();
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM || undefined });
  const errs = [];
  const watch = (p) => {
    p.on("pageerror", (e) => errs.push("pageerror: " + e));
    p.on("console", (m) => { if (m.type() === "error" && !/ERR_|net::|Failed to load|favicon/.test(m.text())) errs.push("console: " + m.text()); });
  };

  /* ================= 1. the bottom tab bar ================= */
  {
    const page = await browser.newPage({ viewport: PHONE });
    watch(page);
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
    watch(page);
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
    watch(page);
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
    watch(page);
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
    watch(page);
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
    watch(page);
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
    watch(page);
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
    watch(page);
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
    watch(page);
    await studyEasy(page, base, 0);
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
    const fold = () => page.evaluate(async () => {
      document.querySelector(".gb-fold").click();
      await new Promise((r2) => setTimeout(r2, 250));
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
    watch(page);
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
    // above the breakpoint there is nothing to reclaim: one comfortable row already, and no chevron
    const page = await browser.newPage({ viewport: DESKTOP });
    watch(page);
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
    watch(page);
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
     the button must not jump when the panel opens, and the panel must open on the side there is room on. */
  for (const vp of [PHONE, DESKTOP]) {
    const page = await browser.newPage({ viewport: vp, hasTouch: vp === PHONE });
    watch(page);
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
      await page.mouse.up();
      await page.waitForTimeout(300);
      const moved = await page.evaluate(() => {
        const t = document.querySelector(".wb-tools"), b = t.getBoundingClientRect();
        return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2), l: Math.round(b.left), t: Math.round(b.top),
          drawing: t.classList.contains("active"), stored: !!localStorage.getItem("folio_wb_pos_v1") };
      });
      check("[" + tag + "] dragging it follows the pointer", Math.abs(moved.x - target.x) <= 3 && Math.abs(moved.y - target.y) <= 3, JSON.stringify(moved));
      check("[" + tag + "] ...without the drag also switching drawing on", !moved.drawing);
      check("[" + tag + "] ...and where it was put is remembered", moved.stored);
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
      check("[" + tag + "] opening the tools puts the pen down", opened2.panel && opened2.drawing && opened2.canvas && opened2.sel === "pen", JSON.stringify(opened2));
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
    watch(page);
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1400);
    const tag = vp.width + "px";
    const home = await page.evaluate(() => {
      const f = document.querySelector("#admin-edit-fab");
      const b = f && f.getBoundingClientRect();
      return { shown: !!f && f.checkVisibility(), plain: !!f && f.classList.contains("aef-plain"),
        right: b ? Math.round(innerWidth - b.right) : null, top: b ? Math.round(b.top) : null, vw: innerWidth, vh: innerHeight,
        tabbarEdit: !!document.querySelector(".tabbar .tab-admin"), topbarEdit: !!document.querySelector(".topbar .tab-admin") };
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

    // a reader must never see it — it used to be built on every study card, admin or not.
    // reload(), not goto(#hash): a URL differing only in the fragment is a same-document navigation, so
    // the app keeps running and `S` in memory would never see this write (see the note in CLAUDE.md).
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("folio_v1")); s.settings.adminMode = false; localStorage.setItem("folio_v1", JSON.stringify(s)); });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1200);
    await studyEasy(page, base, 0);
    check("[" + tag + "] a reader gets no Edit button at all", !(await page.evaluate(() => !!document.querySelector("#admin-edit-fab"))));
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("folio_v1")); s.settings.adminMode = true; localStorage.setItem("folio_v1", JSON.stringify(s)); });
    await page.close();
  }

  /* ================= 5c. light/dark on Settings, and NO language picker =================
     The site is English-only for now (MULTILANG in app.js, Aug 2026, on request), so the picker that used
     to be asserted here must be gone from the page — a control offering nine languages nothing routes to
     is a control that lies. The light/dark switch beside it is unaffected and still has to be there.
     `test-i18n-lang.js` covers the other half: that the machinery behind the flag still works. */
  for (const vp of [PHONE, DESKTOP]) {
    const page = await browser.newPage({ viewport: vp });
    watch(page);
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
    watch(page);
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
    watch(page);
    await page.goto(base + "#settings", { waitUntil: "load" });
    await page.waitForTimeout(1400);
    const pick = await page.evaluate(() => {
      const g = document.querySelector("#fsPick");
      if (!g) return null;
      const r = g.getBoundingClientRect(), row = g.closest(".set-row").getBoundingClientRect();
      return { n: g.children.length, on: [...g.children].filter((b) => b.classList.contains("on")).map((b) => b.dataset.fs),
        fs: document.body.dataset.fs, fits: r.right <= row.right + 1,
        clipped: [...g.children].some((b) => b.scrollWidth > b.clientWidth + 1) };
    });
    check("Settings offers a text size", !!pick && pick.n === 3, JSON.stringify(pick));
    check("...with exactly one marked, matching the setting in force",
      !!pick && pick.on.length === 1 && pick.on[0] === pick.fs, JSON.stringify(pick));
    check("...and no cell of it clipped or overflowing its row", !!pick && pick.fits && !pick.clipped, JSON.stringify(pick));
    const sizes = async () => {
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
      await page.evaluate((f) => { const b = document.querySelector('#fsPick [data-fs="' + f + '"]'); if (b) b.click(); }, v);
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
    watch(page);
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
    watch(page);
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
    watch(page);
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
    watch(page);
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
        soonBadge: has(soon, ".level-badge"), soonXp: has(soon, ".xp"), soonPill: has(soon, ".pill.soon"),
        liveBadge: has(live, ".level-badge"), liveXp: has(live, ".xp"), liveCount: has(live, ".collection-count"),
      };
    });
    check("the first group is called Collections", lib.groupLabel === "Collections", lib.groupLabel);
    // a level meter towards a level in a collection that cannot be studied, over a "0 / 3 cards" figure that
    // reads as a card count when the collection holds none
    check("a coming-soon collection carries no level badge", !lib.soonBadge);
    check("...and no XP bar", !lib.soonXp);
    check("...just the Coming soon pill", lib.soonPill);
    check("...with its title centred in the banner", lib.soonTitleOffset !== null && Math.abs(lib.soonTitleOffset) <= 1.5, lib.soonTitleOffset);
    check("a live collection keeps both, and its card count", lib.liveBadge && lib.liveXp && lib.liveCount, JSON.stringify(lib));
    await page.close();
  }

  /* ================= 7b. the phone's home page: the day's work, in one column =================
     Three swiped panes became one column again (Aug 2026, on request): the day's card, the day's term and
     the Atlas teaser are not built on a phone at all, and the games moved up under the review with a heading
     of their own. Every failure here is silent — a tile that is still built costs a phone the ~1.6 MB globe
     for something nobody can see, and the ONE route to the Library on a phone is now a lip the size of a
     word, which is easy to lose and impossible to notice the loss of. */
  {
    const page = await browser.newPage({ viewport: PHONE });
    watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(1600);
    const h = await page.evaluate(() => {
      const grp = document.querySelector(".review-group"), grid = document.querySelector(".game-grid");
      const head = document.querySelector(".games-head"), lip = document.querySelector(".rv-lip");
      const quote = document.querySelector(".daily-quote, .dq, figure");
      const tiles = [...document.querySelectorAll(".game-tile")];
      const top = (el) => Math.round(el.getBoundingClientRect().top);
      return {
        pager: !!document.querySelector("#homePager"), dots: !!document.querySelector("#homeDots"),
        atlasTile: !!document.querySelector("#exp-atlas"), cod: !!document.querySelector("#exp-card"),
        tod: !!document.querySelector("#exp-term"), explore: !!document.querySelector(".explore-grid"),
        libBanner: !!document.querySelector("#b-library"),
        // the lip hangs off the BOTTOM of the review group, under the deck list it adds to — and centred,
        // which is the whole of "a lip" as against "a button somebody left there"
        lip: lip ? lip.textContent.trim() : "",
        lipLast: !!(lip && grp && lip.parentElement === grp && lip === grp.lastElementChild),
        lipCentred: lip && grp ? Math.round(Math.abs((lip.getBoundingClientRect().left + lip.getBoundingClientRect().width / 2)
          - (grp.getBoundingClientRect().left + grp.getBoundingClientRect().width / 2))) : 999,
        lipAtBottom: lip && grp ? Math.round(lip.getBoundingClientRect().bottom - grp.getBoundingClientRect().bottom) : 999,
        // a TAB, not another full-width banner — which is what it replaced
        lipFrac: lip && grp ? +(lip.getBoundingClientRect().width / grp.getBoundingClientRect().width).toFixed(2) : 1,
        /* …and BLUE (Aug 2026, on request): the site's own primary-button indigo, read off a probe rather
           than hard-coded, so a theme that re-tones --indigo moves the lip with it. Paper-on-paper it read
           as part of the card's bottom edge, which is the failure this pins. */
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
    check("the Library banner is gone, replaced by a lip on the review", !h.libBanner && /add decks/i.test(h.lip), JSON.stringify({ banner: h.libBanner, lip: h.lip }));
    check("...hanging off the bottom edge of the review group", h.lipLast && Math.abs(h.lipAtBottom) <= 1, JSON.stringify({ last: h.lipLast, edge: h.lipAtBottom }));
    check("...centred on it, and a tab rather than a second banner", h.lipCentred <= 2 && h.lipFrac < 0.7, JSON.stringify({ off: h.lipCentred, frac: h.lipFrac }));
    check("...filled in the same indigo as Start review, not paper on paper", h.lipBlue === "ok", h.lipBlue);
    check("...and routing to the collections", await page.evaluate(async () => {
      document.querySelector(".rv-lip").click();
      await new Promise((r) => setTimeout(r, 700));
      return location.hash;
    }) === "#decks");
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    check("the games sit under the review, under a Minigames heading",
      /minigames/i.test(h.mgHead) && h.headBelowReview && h.gridBelowHead, JSON.stringify({ head: h.mgHead, below: h.headBelowReview, grid: h.gridBelowHead }));
    check("...centred over the grid it names", Math.abs(h.headOff) <= 2, h.headOff);
    check("...three wide and two tall", h.cols === 3 && h.rows === 2 && h.tiles === 6, JSON.stringify({ cols: h.cols, rows: h.rows, tiles: h.tiles }));
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
       must open the deck's own row, computed by the same function so a row cannot outrun the banner. */
    await studyEasy(page, base, 1);
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1600);
    const piles = await page.evaluate(() => ({
      stats: [...document.querySelectorAll(".banner .stat")].filter((s) => !s.classList.contains("streak")).map((s) => ({
        label: s.querySelector("span").textContent.trim(),
        n: +s.querySelector("b").textContent.trim(),
        col: getComputedStyle(s.querySelector("b")).color,
      })),
      row: [...document.querySelectorAll(".active-deck .ad-counts .adc")].map((s) => ({ n: +s.textContent.trim(), col: getComputedStyle(s).color })),
      rowLabels: (document.querySelector(".active-deck .ad-counts") || {}).title || "",
      // the big gold numeral is GONE (Aug 2026, on request) — it carried the day's whole pile unlabelled,
      // over three labelled counts that break the same total up. So is the line that described them.
      badge: !!document.querySelector(".review-group .banner .level-badge"),
      desc: (document.querySelector(".review-group .banner .desc") || {}).textContent || "",
      xpLevel: (document.querySelector(".review-group .banner .xp-lvl") || {}).textContent || "",
      // each figure centred over its own label, and the whole row on the button's line
      centred: [...document.querySelectorAll(".review-group .banner .stat")].filter((s) => !s.classList.contains("streak")).map((s) => {
        const w = s.getBoundingClientRect(), n = s.querySelector("b").getBoundingClientRect(), l = s.querySelector("span").getBoundingClientRect();
        return Math.round(Math.abs((n.left + n.width / 2) - (l.left + l.width / 2)) * 10) / 10;
      }),
      onCtaRow: (() => {
        const cta = document.querySelector(".review-group .banner .cta").getBoundingClientRect();
        return [...document.querySelectorAll(".review-group .banner .stat")].filter((s) => !s.classList.contains("streak"))
          .every((s) => { const b = s.getBoundingClientRect(); return b.top < cta.bottom && b.bottom > cta.top; });
      })(),
      // …and centred against them rather than sat on their baseline (Aug 2026, on request). The row was
      // align-items:flex-end on a phone, so a one-line button lined up with the bottom of a two-line column
      // and read as having slipped down.
      ctaOffset: (() => {
        const cta = document.querySelector(".review-group .banner .cta .btn").getBoundingClientRect();
        const st = [...document.querySelectorAll(".review-group .banner .stat")].filter((s) => !s.classList.contains("streak"))
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
    check("...and the same three, unlabelled, open each added deck's row in the same colours",
      piles.row.length === 3 && piles.row.map((r) => r.col).join("|") === piles.stats.map((p) => p.col).join("|"),
      JSON.stringify({ row: piles.row, banner: piles.stats.map((p) => p.col) }));
    check("...naming themselves only in the row's tooltip", /\S/.test(piles.rowLabels), piles.rowLabels);
    check("...each figure centred over its own label", piles.centred.every((d) => d <= 1), JSON.stringify(piles.centred));
    check("...and the three of them on the button's own line", piles.onCtaRow);
    check("...with the button centred against them, not on their baseline", piles.ctaOffset <= 1.5, piles.ctaOffset);
    check("the banner carries no big gold numeral over them", !piles.badge);
    check("...nor the sentence that described them in words", !/scheduled/i.test(piles.desc), piles.desc);
    check("...with the level still spelled out in the xp bar", /level/i.test(piles.xpLevel), piles.xpLevel);

    /* The added deck's row is ONE horizontal line (Aug 2026, on request) — piles, name, figure and bin all
       on the same level, with the bar moved to the row's bottom edge so it costs the line no width. Two
       lines and one line look equally deliberate in a screenshot, and the failure this pins is the row
       quietly wrapping again the moment something in it grows: the deck's name is the only part with a
       shorter form, so if the arithmetic stops working it is the name that gets cut off. */
    const row = await page.evaluate(() => {
      const r = document.querySelector(".active-deck[data-review]"); if (!r) return null;
      const rb = r.getBoundingClientRect();
      const t = r.querySelector(".ad-title"), c = r.querySelector(".ad-prog .count"), k = r.querySelector(".ad-prog .track");
      const parts = [r.querySelector(".ad-counts"), t, c].filter(Boolean);
      const boxes = parts.map((e) => e.getBoundingClientRect());
      return {
        n: parts.length,
        // one line ⇔ every part overlaps one horizontal band
        band: Math.max(...boxes.map((b) => b.top)) < Math.min(...boxes.map((b) => b.bottom)),
        rowH: Math.round(rb.height),
        label: c ? c.textContent.trim() : "",
        titleClipped: t ? t.scrollWidth > t.clientWidth + 1 : true,
        trash: !!r.querySelector(".ad-trash"),
        // the bar underlines the row rather than sitting in the line
        trackWide: k ? k.getBoundingClientRect().width > rb.width * 0.8 : false,
        trackAtFoot: k ? Math.abs(k.getBoundingClientRect().bottom - rb.bottom) <= 1 : false,
        fills: !!r.querySelector(".ad-prog .fill"),
      };
    });
    check("an added deck's row is one horizontal line", !!row && row.band && row.n === 3, JSON.stringify(row));
    // the bin is gone — Remove moved into the row's options sheet, held down (Aug 2026, on request)
    check("...with no bin taking a column of its own", !!row && !row.trash, JSON.stringify(row));
    check("...its progress figure shortened to N/N studied", !!row && /^\d+\/\d+ studied$/.test(row.label), row && row.label);
    check("...its bar underlining the row instead of taking width from it",
      !!row && row.trackWide && row.trackAtFoot && row.fills, JSON.stringify(row));
    check("...and the deck's name not cut off at 390px", !!row && !row.titleClipped, JSON.stringify(row));
    // clear the day: Easy graduates a new card outright, so the allowance runs out with nothing in learning
    await studyEasy(page, base, 6);
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1600);
    const cleared = await page.evaluate(() => ({
      badge: !!document.querySelector(".review-group .banner .level-badge"),
      piles: [...document.querySelectorAll(".review-group .banner .stat b")].map((x) => +x.textContent.trim()),
      desc: (document.querySelector(".review-group .banner .desc") || {}).textContent || "",
    }));
    check("...and a cleared day says so in words, with still no numeral",
      cleared.piles.reduce((a, n) => a + n, 0) === 0 && !cleared.badge && /caught up/i.test(cleared.desc),
      JSON.stringify(cleared));
    await page.close();
  }
  {
    // above the breakpoint nothing about the home page changed: one column, in the order it always had, with
    // the day's card, the day's term and the Atlas teaser all still in it
    const page = await browser.newPage({ viewport: DESKTOP });
    watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(1600);
    const d = await page.evaluate(() => {
      const top = (s) => { const el = document.querySelector(s); return el ? Math.round(el.getBoundingClientRect().top) : -1; };
      return {
        order: [top(".review-group"), top(".game-grid"), top(".explore-grid")],
        atlasTile: !!document.querySelector("#exp-atlas"),
        cod: !!document.querySelector("#exp-card"), tod: !!document.querySelector("#exp-term"),
        cols: getComputedStyle(document.querySelector(".game-grid")).gridTemplateColumns.split(/\s+/).length,
        // the taglines are a phone-only removal: three to a row is what left no room for them
        subs: [...document.querySelectorAll(".game-tile")].filter((t) => t.querySelector(".gt-sub")).length,
        lip: !!document.querySelector(".rv-lip"), head: !!document.querySelector(".games-head"),
        about: !!document.querySelector(".home-about"),
      };
    });
    check("[desktop] the home page keeps the order it always had", d.order[0] < d.order[1] && d.order[1] < d.order[2], JSON.stringify(d.order));
    check("[desktop] ...with the day's card, the day's term and the Atlas teaser still in it", d.atlasTile && d.cod && d.tod, JSON.stringify(d));
    check("[desktop] ...the games three to a row, taglines and all", d.cols === 3 && d.subs === 6, JSON.stringify({ cols: d.cols, subs: d.subs }));
    check("[desktop] ...and no lip, no Minigames heading and no About link: the top bar carries both tabs",
      !d.lip && !d.head && !d.about, JSON.stringify(d));
    await page.close();
  }

  /* ================= 7c. the Atlas panel's discovery chip and its pages ================= */
  {
    const page = await browser.newPage({ viewport: PHONE });
    watch(page);
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
    watch(page);
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
      // Erase over Undo, Clear over Redo: two columns, and which cell each lands in is the request
      grid: [...document.querySelectorAll(".wb-panel .wb-row")].slice(-2).map((r) => [...r.children].map((c) => c.className.replace(/wb-btn ?/, "")).join("+")).join(" / "),
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
    check("...opening the tools puts the pen down", panel.penDown && !!panel.sizeOn, JSON.stringify(panel.sizeOn || null));

    const toggled = await page.evaluate(async () => {
      const s = document.querySelector(".wb-size.on").dataset.s;
      const btn = document.querySelector('.wb-size[data-s="' + s + '"]');
      btn.click(); await new Promise((r) => setTimeout(r, 120));
      const up = document.querySelector(".draw-canvas").classList.contains("on");
      btn.click(); await new Promise((r) => setTimeout(r, 120));
      return { up, down: document.querySelector(".draw-canvas").classList.contains("on") };
    });
    check("clicking the selected size again picks the pen up", !toggled.up && toggled.down, JSON.stringify(toggled));

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

  /* ================= 7e. the Atlas sheet's height is the reader's =================
     Dragged shorter, the sheet must still show its title — the floor is measured through offsetTop, since
     the head is a scroller inside the box being shrunk and its rect collapses along with it. Dragged taller
     it must stop at the top of the screen. And the height carries to the next place opened, which is the
     only reason to set it. */
  {
    const page = await browser.newPage({ viewport: PHONE, hasTouch: true });
    watch(page);
    await atlas(page, base);
    await page.evaluate(() => { location.hash = "#map/2026/france"; });
    await page.waitForTimeout(2500);
    const start = await page.evaluate(() => {
      const p = document.querySelector("#countryPop");
      return { hidden: p.hidden, grip: getComputedStyle(document.querySelector("#cpGrab")).display, h: Math.round(p.getBoundingClientRect().height) };
    });
    check("the place sheet carries a resize grip", !start.hidden && start.grip !== "none", JSON.stringify(start));
    const drag = async (toY) => {
      const g = await page.evaluate(() => document.querySelector("#cpGrab").getBoundingClientRect().toJSON());
      await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2);
      await page.mouse.down();
      await page.mouse.move(g.x + g.width / 2, toY, { steps: 12 });
      await page.mouse.up();
      await page.waitForTimeout(350);
    };
    await drag(80);
    const tall = await page.evaluate(() => {
      const p = document.querySelector("#countryPop").getBoundingClientRect();
      return { h: Math.round(p.height), top: Math.round(p.top) };
    });
    check("...dragging it up gives it more of the screen", tall.h > start.h + 80, JSON.stringify({ was: start.h, now: tall.h }));
    check("...stopping at the top of the screen", tall.top >= 4, JSON.stringify(tall));
    await page.evaluate(() => { location.hash = "#map/2026/spain"; });
    await page.waitForTimeout(1800);
    const next = await page.evaluate(() => Math.round(document.querySelector("#countryPop").getBoundingClientRect().height));
    check("...and the next place opens at the height the last was left at", Math.abs(next - tall.h) <= 4, next + " vs " + tall.h);
    await drag(PHONE.height - 10);
    const small = await page.evaluate(() => {
      const p = document.querySelector("#countryPop").getBoundingClientRect();
      const t = document.querySelector(".cp-titlerow").getBoundingClientRect();
      return { h: Math.round(p.height), titleShown: t.top >= p.top - 1 && t.bottom <= p.bottom + 1 };
    });
    check("...shrunk to the floor it still shows its title bar", small.titleShown && small.h < 220, JSON.stringify(small));
    await page.close();
  }

  /* ================= 7f. the daily quote does not resize the page =================
     Flipping the quote to its original language swaps in a block that rarely wraps to the same number of
     lines, and everything under it — the review banner and the games below it — used to lift or drop by one. */
  {
    const page = await browser.newPage({ viewport: PHONE });
    watch(page);
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
     The level-up card is dismissed by a click ANYWHERE, which hides the problem: clicking a nav tab takes it
     away. But a back/forward, a deep link and any programmatic hash change move the route without a click,
     and the overlay then sits over whatever renders next. It lives on document.body, so render() owns it. */
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    watch(page);
    // Folio level 1 costs 3 cards, and Easy graduates a new card outright, so the third grade levels up
    await studyEasy(page, base, 3);
    const up = await page.locator(".levelup-pop").count();
    check("levelling up raises its card", up === 1, "3 cards studied → " + up + " popup(s)");
    if (up) {
      // a hash change, NOT a click — a click would dismiss it and prove nothing
      await page.evaluate(() => { location.hash = "#decks"; });
      await page.waitForTimeout(900);
      check("...and a hash change takes it away with the page", await page.locator(".levelup-pop").count() === 0);
      await page.evaluate(() => { location.hash = "#settings"; });
      await page.waitForTimeout(700);
      check("...leaving nothing behind on the next page either", await page.locator(".levelup-pop").count() === 0);
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
