/* PAST STATES — the Historical States collection's map cards (2026-11-19; docs/historical-states-card-plan.md).
 *
 *   node .claude/test-past-states.js
 *
 * A card of the collection asks "which state was this?" of a window drawn on the borders of ONE YEAR of the past — the year of the state's
 * greatest extent as the Atlas draws it. Everything that can go wrong with it goes wrong quietly:
 *
 *   · the YEAR is in three places — the layer's row (atlas/data/card-faces.js, generated from history.bin), the card's question and its date
 *     line — and a rebuild of the history can move the first without anyone touching the other two (§1);
 *   · a window that draws TODAY'S map with nothing shaded still looks like a map, and so does one that names its own answer before the
 *     reader has given it (§2);
 *   · where the year cannot be drawn (no WebGL2; the history refused) the card must say so in a sentence, not show a present-day map (§3, §4).
 *
 * Playwright, one browser per section 2-4. Re-run after touching `pastLayer` in atlas/atlas-windows.js, `PAST_LAYERS` in
 * .claude/atlas-build/build-card-faces.js, `entityExtent` in build-glossary-places.js, the `past-states` rows of CARD_MAP_LAYERS (app.js) and
 * MAP_LAYERS (add-card.js), or any `hs-` card's question, date line or places.
 */
"use strict";
const path = require("path"), fs = require("fs");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const WE = require("./test-window-env.js");
const ROOT = path.join(__dirname, "..");
const LAUNCH = { executablePath: process.env.FOLIO_CHROMIUM || undefined };

let pass = 0, fail = 0;
const check = (what, cond, extra) => { if (cond) { pass++; console.log("  ok    " + what); } else { fail++; console.log("  FAIL  " + what + (extra === undefined || extra === "" ? "" : "  [" + extra + "]")); } };
const yearText = (y) => (y < 0 ? -y + " BCE" : y < 1000 ? y + " CE" : String(y));
const namesYear = (text, y) => new RegExp("(^|[^0-9,])" + yearText(y).replace(/ /g, "\\s") + "([^0-9]|$)").test(String(text || "").replace(/<[^>]+>/g, " "));

const CFw = {}; new Function("window", fs.readFileSync(path.join(ROOT, "atlas/data/card-faces.js"), "utf8"))(CFw);
const LAYER = CFw.ATLAS_CARD_FACES.layers["past-states"] || {};
const NBw = {}; new Function("window", fs.readFileSync(path.join(ROOT, "atlas/data/card-neighbours.js"), "utf8"))(NBw);
const NBR = (NBw.ATLAS_CARD_NEIGHBOURS.layers || {})["past-states"] || {};
const CARDS = require("./card-io.js").loadCards().cards.filter((c) => c.map && c.map.layer === "past-states");
const byEntity = new Map(Object.entries(LAYER).map(([k, row]) => [row[0], { key: k, row }]));
const rowOf = (c) => { const ids = (c.places || []).filter((id) => byEntity.has(id)); return ids.length === 1 ? byEntity.get(ids[0]) : null; };

async function open(browser, base, id, o) {
  o = o || {};
  const ctx = await browser.newContext({ viewport: { width: 520, height: 900 } });
  if (o.refuseHistory) await ctx.route(/\/atlas\/data\/history\.bin(\?|$)/, (r) => r.abort());
  const page = await ctx.newPage(), errs = [];
  page.on("pageerror", (e) => errs.push(String(e.message || e)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errs.push(m.text()); });
  await page.addInitScript((cid) => {
    localStorage.setItem("folio_tour_v1", "1"); localStorage.setItem("folio_atlas_tour_v1", "1"); localStorage.setItem("folio_library_tour_v1", "1");
    sessionStorage.setItem("folio_study_v1", JSON.stringify({ scope: { type: "card", id: cid }, queue: [cid], id: cid, qi: 0, rev: false, studied: 0 }));
  }, id);
  await page.goto(base + "#study");
  await page.waitForSelector(".map-card", { timeout: 30000 });
  return { ctx, page, errs };
}
const settled = (page, ms) => page.waitForFunction(() => { const h = document.querySelector(".map-card"); return !!(h && h._folioMap && (h.classList.contains("mc-plain") || (h._folioMap.ready() && h._folioMap.settled()))); }, null, { timeout: ms || 120000 });

(async () => {
  console.log("\n\x1b[1m1) the layer, the cards and the year (no browser)\x1b[0m\n");
  {
    const keys = Object.keys(LAYER);
    check("card-faces.js carries the past-states layer", keys.length > 100, keys.length + " keys");
    const rome = LAYER["Roman Empire"];
    check("the Roman Empire is pol:rome at 117 CE, with a view and a zoom", !!rome && rome[0] === "pol:rome" && rome[7] === 117 && rome.length === 11 && rome[10] > 0, JSON.stringify(rome));
    check("every row has an entity, a year, a view and a zoom inside the window's range", keys.every((k) => { const r = LAYER[k]; return /^pol:/.test(r[0]) && Number.isInteger(r[7]) && isFinite(r[8]) && isFinite(r[9]) && r[10] >= 0.85 && r[10] <= 400; }));
    check("one key per entity, and no 1920 snapshot series among them", byEntity.size === keys.length && !keys.some((k) => /_1920$/.test(LAYER[k][0])));
    const AF = require(path.join(ROOT, "atlas/atlas-format.js")), G = require("./atlas-build/build-glossary-places.js");
    const HT = AF.read(new Uint8Array(fs.readFileSync(path.join(ROOT, "atlas/data/history.bin"))));
    const lag = keys.filter((k) => { const x = G.entityExtent(HT, LAYER[k][0]); return !x || x.year !== LAYER[k][7]; });
    check("every row's year is history.bin's own year of greatest extent (the glossary windows' rule)", lag.length === 0, lag.slice(0, 6).join(", "));
    check("the neighbours table has a row for every key", keys.every((k) => Array.isArray(NBR[k])), keys.filter((k) => !Array.isArray(NBR[k])).slice(0, 6).join(", "));
    const APP = fs.readFileSync(path.join(ROOT, "app.js"), "utf8"), ADD = fs.readFileSync(path.join(__dirname, "add-card.js"), "utf8");
    check("app.js CARD_MAP_LAYERS flags the layer `past`", /"past-states": \{ what: "state", plural: "states", past: true \}/.test(APP));
    check("add-card.js MAP_LAYERS carries the layer, read from card-faces.js", /"past-states": \{[^}]*fromCardFaces: true[^}]*past: true/.test(ADD));

    check("the collection has cards", CARDS.length >= 1, CARDS.length + " cards");
    const noRow = CARDS.filter((c) => !rowOf(c));
    check("every card's places name exactly one state of the layer, and it carries no map.key", noRow.length === 0 && CARDS.every((c) => c.map.key == null), noRow.map((c) => c.id).join(", "));
    const live = CARDS.filter((c) => rowOf(c));
    const qBad = live.filter((c) => !namesYear(c.question, rowOf(c).row[7]));
    check("every question names the year its window is drawn in", qBad.length === 0, qBad.map((c) => c.id + " wants " + yearText(rowOf(c).row[7])).join("; "));
    const dBad = live.filter((c) => { const m = /<span class="dt-k">Map year<\/span><span class="dt-v">([^<]*)<\/span><\/div>$/.exec(String(c.answerDate || "")); return !m || m[1].trim() !== yearText(rowOf(c).row[7]); });
    check("every date line ends on `Map year`, the same year", dBad.length === 0, dBad.map((c) => c.id).join(", "));
    const fBad = live.filter((c) => !(c.facts || []).some((r) => r[0] === "Area as drawn" && /km²/.test(r[1])) || (Array.isArray(c.questions) && c.questions.length));
    check("every card has an `Area as drawn` fact and no extra phrasings", fBad.length === 0, fBad.map((c) => c.id).join(", "));
    const prefixBad = CARDS.filter((c) => !/^hs-\d{3}$/.test(c.id));
    check("the layer is the Historical States collection's (hs- cards only)", prefixBad.length === 0, prefixBad.map((c) => c.id).join(", "));
  }
  const card = CARDS.find((c) => c.id === "hs-001") || CARDS[0];
  if (!card || !rowOf(card)) { console.log("\n" + pass + " passed, " + (fail + 1) + " failed (no card to open)"); process.exit(1); }
  const R = rowOf(card), year = R.row[7], answer = String(card.answerText || card.answer);
  const srv = await WE.serve(ROOT), base = srv.base;

  console.log("\n\x1b[1m2) the window: " + card.id + ", " + answer + " at " + yearText(year) + "\x1b[0m\n");
  {
    const browser = await WE.launch(chromium, LAUNCH);
    const { page, errs } = await open(browser, base, card.id);
    await settled(page);
    const front = await page.evaluate(() => {
      const h = document.querySelector(".map-card"), m = h._folioMap, p = m.probe(), c = h.querySelector(".mc-canvas"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
      let gold = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 215 && d[i + 1] > 150 && d[i + 1] < 235 && d[i + 2] < 190 && d[i] - d[i + 2] > 45) gold++;
      return { engine: h.getAttribute("data-map-engine"), year: h.getAttribute("data-map-year"), key: h.getAttribute("data-map-key"), plain: h.classList.contains("mc-plain"), names: m.boxes().names.map((n) => n.text), states: m.stateNames().length,
        spec: p ? { year: p.spec.year, neutral: !!p.spec.layers.neutral, provinces: !!p.spec.layers.provinces, hl: (p.spec.highlights || []).map((x) => ({ ids: x.ids, exact: !!x.exact })) } : null,
        view: m.view(), scope: !!h.querySelector(".mc-scope"), gold: gold / (d.length / 4), label: c.getAttribute("aria-label"), q: (document.querySelector(".card") || document.body).textContent };
    });
    check("drawn by the engine with WebGL2, not the plain sentence", front.engine === "v2" && !front.plain, front.engine);
    check("the window stands on the layer's year", front.year === String(year) && !!front.spec && front.spec.year === year, front.year + " / " + (front.spec && front.spec.year));
    check("the state's entity is the one highlight, exact, on the neutral history, without today's provinces", !!front.spec && front.spec.neutral && !front.spec.provinces && front.spec.hl.length === 1 && front.spec.hl[0].exact && front.spec.hl[0].ids.join() === R.row[0], JSON.stringify(front.spec));
    check("the gold is on the pixels (the state is shaded)", front.gold > 0.004, (front.gold * 100).toFixed(2) + " % of the window");
    check("framed by the layer's own view and zoom", Math.abs(front.view.home[0] - R.row[8]) < 0.01 && Math.abs(front.view.home[1] - R.row[9]) < 0.01 && Math.abs(front.view.home[2] - R.row[10]) < 0.01, JSON.stringify(front.view.home));
    check("NOTHING is named before the answer — no name of its own, no other state's", front.names.length === 0 && front.states === 0, front.names.join(", "));
    check("no Collection / All switch: a place studied in another year is not on this map", !front.scope);
    check("the canvas says what it shows without naming it", /year of the past/.test(front.label || "") && front.label.indexOf(answer) < 0);
    check("the question on the card names the year", namesYear(front.q, year));
    await page.evaluate(() => document.querySelector("#reveal-btn").click());
    await page.waitForFunction((a) => { const h = document.querySelector(".map-card"); return !!(h && h._folioMap && h._folioMap.boxes().names.some((n) => n.text === a)); }, answer, { timeout: 60000 });
    await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h._folioMap.stateNames().length > 0; }, null, { timeout: 60000 }).catch(() => {});
    const back = await page.evaluate(() => { const m = document.querySelector(".map-card")._folioMap; return { names: m.boxes().names.map((n) => n.text), own: m.boxes().names.filter((n) => n.own).map((n) => n.text), states: m.stateNames().map((s) => s.n), year: document.querySelector(".map-card").getAttribute("data-map-year") }; });
    check("after the answer the state is named by the card's own answer", back.own.join() === answer, back.names.join(", "));
    check("…and the other states of that year by the Atlas's names", back.states.length >= 1, back.states.join(", "));
    check("the year did not move on the reveal", back.year === String(year));
    check("no console or page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
    await browser.close();
  }

  console.log("\n\x1b[1m3) no WebGL2: the plain sentence, never today's map\x1b[0m\n");
  {
    const browser = await WE.launch(chromium, Object.assign({}, LAUNCH, { args: ["--disable-webgl", "--disable-3d-apis"] }));
    const { page } = await open(browser, base, card.id);
    await settled(page, 60000).catch(() => {});
    const s = await page.evaluate(() => { const h = document.querySelector(".map-card"), n = h.querySelector(".mc-plain-note"); return { plain: h.classList.contains("mc-plain"), engine: h.getAttribute("data-map-engine"), note: n ? n.textContent : "", canvasHidden: h.querySelector(".mc-canvas").hidden, q: !!document.querySelector("#reveal-btn") }; });
    check("the window is the plain sentence", s.plain && s.engine === "none" && s.canvasHidden, JSON.stringify(s));
    check("the sentence says a state of the past cannot be drawn here", /state of the past/.test(s.note) && /WebGL2/.test(s.note), s.note);
    await page.evaluate(() => document.querySelector("#reveal-btn").click());
    await page.waitForTimeout(600);
    const txt = await page.evaluate(() => (document.querySelector(".card") || document.body).textContent);
    check("the answer and the rest of the card are still there", txt.indexOf(answer) >= 0);
    await browser.close();
  }

  console.log("\n\x1b[1m4) the history refused: the plain sentence\x1b[0m\n");
  {
    const browser = await WE.launch(chromium, LAUNCH);
    const { page } = await open(browser, base, card.id, { refuseHistory: true });
    await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return !!(h && h.classList.contains("mc-plain")); }, null, { timeout: 60000 }).catch(() => {});
    const s = await page.evaluate(() => { const h = document.querySelector(".map-card"), n = h.querySelector(".mc-plain-note"); return { plain: h.classList.contains("mc-plain"), note: n ? n.textContent : "", year: h.getAttribute("data-map-year") }; });
    check("a window whose history did not arrive is the plain sentence, not a present-day map", s.plain && /borders of the past/.test(s.note), JSON.stringify(s));
    await browser.close();
  }

  srv.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
