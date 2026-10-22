#!/usr/bin/env node
/* THE CARD TIMELINE (Oct 2026, on request: "a timeline section showing the card on a timeline next to the
   nearest four events (2 before, two after) in the same collection … periods a continuous coloured bar,
   single events a dash … only events and periods, never abstract or general terms").
   What is asserted is what a reader would notice going wrong, and what nothing else checks:
   · ELIGIBILITY is the `timeline` field and nothing else — a place card beside the Treaty of Versailles
     (the Polish Corridor, dated the same day) gets no section and is nobody's neighbour.
   · THE NEIGHBOURS are the two before and the two after by start date, among the cards that carry the field.
   · A PERIOD is a bar wider than a dash; an EVENT is a dash; the card's own item is marked `self` and is
     not a button, while every neighbour is a `data-kin` button like the "Nearby" rail's.
   · TWO DESIGNS: the rail (one axis, lanes) wide; the ledger (a spine, columns) on a phone — and in
     neither does a name overlap another name.
       node .claude/test-card-timeline.js
   Re-run after touching `cardTimelineSpan` / `cardTimelineItems` / `cardTimelineHTML` / `tlLayout` /
   `mountCardTimelines` / `.claude/set-timeline.js` / the `.tl-` rules in styles.css. Not part of the site. */
const { chromium } = require("playwright");
const base = require("url").pathToFileURL(require("path").join(__dirname, "..", "index.html")).href;
let pass = 0, fail = 0;
const check = (n, ok, x) => { if (ok) { pass++; console.log("ok    " + n + (x ? "  " + x : "")); } else { fail++; console.log("FAIL  " + n + "  " + (x || "")); } };
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const errs = [];
  const open = async (page, id) => {
    await page.goto(base + "#card/" + id, { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(500);
    return page.evaluate(() => {
      const tl = document.querySelector(".tl");
      if (!tl) return null;
      const ol = tl.querySelector(".tl-list");
      const items = [...ol.querySelectorAll(".tl-it")].map((li) => {
        const m = li.querySelector(".tl-mark").getBoundingClientRect(), l = li.querySelector(".tl-lab").getBoundingClientRect();
        return { id: li.querySelector("[data-kin]") ? li.querySelector("[data-kin]").dataset.kin : "self", self: li.classList.contains("self"),
          period: li.classList.contains("period"), button: !!li.querySelector("button.tl-lab"),
          title: li.querySelector(".tl-t").textContent, when: li.querySelector(".tl-w").textContent,
          mark: { w: m.width, h: m.height }, box: { x: l.left, y: l.top, w: l.width, h: l.height } };
      });
      let overlaps = 0;
      for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
        const a = items[i].box, b = items[j].box;
        if (a.x < b.x + b.w - 1 && b.x < a.x + a.w - 1 && a.y < b.y + b.h - 1 && b.y < a.y + a.h - 1) overlaps++;
      }
      return { laid: ol.classList.contains("laid"), items, overlaps, axis: !!ol.querySelector(".tl-axis"), spine: !!ol.querySelector(".tl-spine"),
        ticks: [...ol.querySelectorAll(".tl-tick-l, .tl-ytick")].map((t) => t.textContent), height: ol.getBoundingClientRect().height,
        wider: ol.scrollWidth <= ol.clientWidth + 1 };
    });
  };
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  page.on("pageerror", (e) => errs.push(String(e))); page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

  console.log("\n1) the Treaty of Versailles, on a wide screen (the rail)");
  const v = await open(page, "ww2-004");
  check("the card has a Timeline section", !!v);
  if (v) {
    check("...laid out as the rail, with an axis and no spine", v.laid && v.axis && !v.spine);
    check("...five items: two before, the card, two after", v.items.length === 5 && v.items[2].self, v.items.map((i) => i.id).join(" "));
    /* by START date: the German Revolution (November 1918) opens before the Armistice (11 November), so the
       two before Versailles are the Armistice and the Paris Peace Conference; the Kapp Putsch (March 1920)
       and Trianon (June 1920) are the two after — Lausanne (1923) is sixth and so not drawn */
    check("...in date order: Armistice, Paris Peace Conference, Versailles, Kapp Putsch, Trianon",
      v.items.map((i) => i.id).join(" ") === "ww2-002 ww2-003 self ww2-017 ww2-009", v.items.map((i) => i.title).join(" | "));
    check("...the Polish Corridor (a place, the same day) is NOT among them", !v.items.some((i) => i.id === "ww2-007"));
    check("...the card's own item is marked and is not a button", v.items[2].self && !v.items[2].button);
    check("...every neighbour is a data-kin button", v.items.filter((i) => !i.self).every((i) => i.button));
    const rev = v.items.find((i) => i.id === "ww2-003"), arm = v.items.find((i) => i.id === "ww2-002");
    check("...the Paris Peace Conference is a period: a bar wider than it is tall", rev && rev.period && rev.mark.w > 20 && rev.mark.h <= 8, rev && JSON.stringify(rev.mark));
    check("...the Armistice is an event: a dash taller than it is wide", arm && !arm.period && arm.mark.w <= 3 && arm.mark.h >= 12, arm && JSON.stringify(arm.mark));
    check("...the date stands behind the name on one line", v.items.every((i) => i.box.h < 24) && /28 June 1919/.test(v.items[2].when), v.items[2].when);
    check("...no two names overlap", v.overlaps === 0, String(v.overlaps));
    check("...the axis is in months", v.ticks.some((t) => /^[A-Z][a-z]{2} \d{4}$/.test(t)), v.ticks.join(", "));
    check("...and nothing runs past the box", v.wider);
  }

  console.log("\n2) eligibility is the field, not the date");
  check("the Polish Corridor (a place) has no section", (await open(page, "ww2-007")) === null);
  check("Article 231 (a text) has no section", (await open(page, "ww2-005")) === null);
  const w = await open(page, "ww2-001");
  check("the Second World War is a period that runs past the window: its bar is clipped with an arrow",
    !!w && w.items[w.items.findIndex((i) => i.self)].period && w.items.find((i) => i.self).mark.w > 100, w && JSON.stringify(w.items.find((i) => i.self).mark));

  console.log("\n3) on a phone, the ledger");
  const ph = await browser.newPage({ viewport: { width: 390, height: 800 } });
  ph.on("pageerror", (e) => errs.push(String(e))); ph.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  const p = await open(ph, "ww2-004");
  check("the same card lays out as the ledger: a spine, no axis", !!p && p.laid && p.spine && !p.axis);
  if (p) {
    check("...the same five items in the same order", p.items.map((i) => i.id).join(" ") === "ww2-002 ww2-003 self ww2-017 ww2-009");
    const rev = p.items.find((i) => i.id === "ww2-003");
    check("...a period is a column, taller than it is wide", rev && rev.mark.h > rev.mark.w, rev && JSON.stringify(rev.mark));
    check("...no two names overlap", p.overlaps === 0, String(p.overlaps));
    check("...nothing runs past the box", p.wider);
  }
  check("no console or page errors", errs.length === 0, errs.join(" | ").slice(0, 300));
  await browser.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
