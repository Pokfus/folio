#!/usr/bin/env node
/* THE EXAMPLE SECTION (2026-11-20, on request: ph-049 "between the background section and sources section, add an
   Example section showcasing a truth table"). A card's optional heavy field `example` ({ intro, table: { head, rows },
   note }) is drawn by cardExampleHTML as `.card-example`:
   · ph-049 has the section, labelled "Example", with a header row and four body rows of T/F;
   · it stands AFTER the Background fold and BEFORE the sources;
   · a card without the field (ph-022) has no section;
   · on a phone the table never widens the page (it scrolls inside `.ex-scroll`).
       node .claude/test-card-example.js
   Re-run after touching `cardExampleHTML`, the `example` field in card-io.js / CARD_EXTRA_FIELDS, or the
   `.card-example` rules in styles.css. Not part of the site. */
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
    await page.waitForFunction(() => document.querySelector(".abstract"), null, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(300);
    return page.evaluate(() => {
      const ex = document.querySelector(".card-example");
      const after = (a, b) => !!(a && b) && !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING);
      if (!ex) return { has: false };
      const bg = document.querySelector(".bg-collapse"), src = document.querySelector(".src-label");
      return { has: true, label: (ex.querySelector(".label") || {}).textContent,
        head: [...ex.querySelectorAll("thead th")].map((t) => t.textContent),
        rows: [...ex.querySelectorAll("tbody tr")].map((r) => [...r.cells].map((c) => c.textContent).join("")),
        afterBg: after(ex, bg), beforeSrc: !src || after(src, ex),
        pageFits: document.documentElement.scrollWidth <= window.innerWidth + 1 };
    });
  };
  for (const vp of [{ name: "desktop", width: 1200, height: 900 }, { name: "phone", width: 390, height: 844 }]) {
    console.log("\n" + vp.name);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    page.on("pageerror", (e) => errs.push(String(e)));
    const t = await open(page, "ph-049");
    check("ph-049 has an Example section", t.has && /example/i.test(t.label || ""), t.label);
    check("...with a header row and four rows of T/F", t.head && t.head.length >= 3 && t.rows.length === 4 && t.rows.every((r) => /^[TF]+$/.test(r)), JSON.stringify(t.rows));
    check("...after the Background and before the sources", t.afterBg && t.beforeSrc);
    check("...and the page does not scroll sideways", t.pageFits);
    const n = await open(page, "ph-022");
    check("ph-022 (no example field) has no section", !n.has);
    await page.close();
  }
  check("no page errors", !errs.length, errs.slice(0, 3).join(" | "));
  await browser.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
