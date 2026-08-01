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
      };
    });
    check("the tab bar shows on a phone", bar.shown);
    check("...spanning the full width, pinned to the bottom", bar.w === PHONE.width && bar.bottom === PHONE.height, JSON.stringify({ w: bar.w, bottom: bar.bottom }));
    check("...carrying every destination the top bar used to hold",
      ["home", "decks", "map", "mission", "account", "settings"].every((r) => bar.tabs.includes(r)), bar.tabs.join(","));
    check("...every one of them NAMED, not just the active one", bar.labelled.every((l) => l.w > 8), JSON.stringify(bar.labelled.map((l) => l.w)));
    check("...and no name clipped by the narrower cells", bar.labelled.every((l) => l.w >= l.need - 1), JSON.stringify(bar.labelled));
    // light/dark and the language picker moved to Settings, Account/Settings/Edit moved down here —
    // which leaves the top bar with nothing on it at all on a phone
    check("the top bar gives way to it entirely", !bar.topbar);

    // it routes, and the active state follows the route
    await page.evaluate(() => { [...document.querySelectorAll(".tabbar .tab")].find((t) => t.dataset.route === "decks").click(); });
    await page.waitForTimeout(900);
    const routed = await page.evaluate(() => ({
      hash: location.hash,
      active: [...document.querySelectorAll(".tabbar .tab.active")].map((t) => t.dataset.route).join(","),
    }));
    check("tapping a tab routes", routed.hash === "#decks", routed.hash);
    check("...and the active mark follows the route", routed.active === "decks", routed.active);

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
         of the card. What stops the drawing is unselecting the tool INSIDE the panel. */
      const wb = () => page.evaluate(() => {
        const t = document.querySelector(".wb-tools");
        return { panel: t.querySelector(".wb-panel").checkVisibility(),
          drawing: t.querySelector(".wb-toggle").classList.contains("on"),
          canvas: !!document.querySelector(".draw-canvas.on"),
          sel: [...t.querySelectorAll(".wb-btn.sel")].map((b) => b.className.replace(/wb-btn |sel| /g, "")).join(",") };
      });
      const marker = await page.evaluate(() => { const b = document.querySelector(".wb-tools").getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) }; });
      await page.mouse.click(marker.x, marker.y);          // open
      await page.waitForTimeout(200);
      const opened2 = await wb();
      check("[" + tag + "] opening the tools puts the pen down", opened2.panel && opened2.drawing && opened2.canvas && opened2.sel === "wb-pen", JSON.stringify(opened2));
      await page.mouse.click(marker.x, marker.y);          // close — the pen must stay down
      await page.waitForTimeout(200);
      const shut = await wb();
      check("[" + tag + "] putting the tools away leaves the pen down", !shut.panel && shut.drawing && shut.canvas, JSON.stringify(shut));
      await page.mouse.click(marker.x, marker.y);          // open again, then unselect the pen
      await page.waitForTimeout(200);
      await page.evaluate(() => { const b = document.querySelector(".wb-btn.wb-pen"); if (b) b.click(); });
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

  /* ================= 5c. light/dark and the language picker live on Settings ================= */
  for (const vp of [PHONE, DESKTOP]) {
    const page = await browser.newPage({ viewport: vp });
    watch(page);
    await page.goto(base + "#settings", { waitUntil: "load" });
    await page.waitForTimeout(1400);
    const p = await page.evaluate(() => ({
      opts: document.querySelectorAll("#langGrid .lang-opt").length,
      picked: [...document.querySelectorAll("#langGrid .lang-opt.on")].map((o) => o.dataset.lang).join(","),
      night: !!document.querySelector("#sw-night") && document.querySelector("#sw-night").checkVisibility(),
      // whatever the viewport, neither may be left behind in the top bar
      strayLang: !!document.querySelector(".topbar .lang-opt, .topbar #lang-switch"),
      strayNight: !!document.querySelector(".topbar .theme-switch"),
    }));
    const tag = vp.width + "px";
    check("[" + tag + "] every language is offered on the Settings page", p.opts === 10, String(p.opts));
    check("[" + tag + "] ...with exactly one marked as the current one", p.picked === "en", p.picked);
    check("[" + tag + "] ...beside the light/dark switch", p.night);
    check("[" + tag + "] ...and neither is left in the top bar", !p.strayLang && !p.strayNight, JSON.stringify(p));
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
