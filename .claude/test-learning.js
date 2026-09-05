#!/usr/bin/env node
/* test-learning.js — the learning-science batch (Sep 2026).
 *
 * WHAT THIS GUARDS, AND WHY EACH OF IT IS SILENT. Everything in this batch changes how a reader MEETS a
 * card, and not one of the failures throws:
 *
 *   · THE CRITERION (CRIT_DAYS) writes a day key on a correct first attempt. If it stops writing, every
 *     card reads "recalled on 0 of 3 days" for ever, the Learned tile reads 0, and the site looks like a
 *     reader who never gets anything right. If it writes TWICE in a day, the criterion means nothing and
 *     says so in gold pips.
 *   · THE PRETEST MUST NOT WRITE `S.cards`. Folio's XP is the count of distinct cards with a record and a
 *     level buys an artefact chest, so a pretest that seeded twelve records would hand a brand-new reader
 *     several levels and their chests for answering twelve questions. Nothing would throw; the only
 *     symptom is a reader being congratulated for nothing. This is the assertion that matters most here.
 *   · THE ORDER PICKER intercepts the FIRST study of a deck. Asked twice it is a wall; asked never it is a
 *     feature nobody meets. Both look like "working" from one side.
 *   · ANSWER BEFORE REVEALING has three doors (the button, Enter, Space) and one guard. A guard that
 *     misses one door is a policy that silently does nothing on a keyboard.
 *   · THE ELABORATION BUDGET is one prompt per session. Two prompts a card is prompt fatigue; zero is a
 *     feature that shipped inert.
 *   · THE CONFUSION REGISTER reads the typed guess `gradeCloze` used to discard. If the capture breaks,
 *     the register stays empty for ever and reads exactly like a reader who never confuses anything.
 *
 * Two halves. Sections 1–5 need no browser: the pure functions are sliced out of app.js by text, which is
 * the trick every no-browser suite here uses and what keeps them from drifting from what ships. Sections
 * 6+ drive a real browser, because the rest of it is a closure.
 *
 *     node .claude/test-learning.js
 *     Env: FOLIO_CHROMIUM=<path to chrome>, NODE_PATH=<playwright's node_modules>
 *
 * Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");

let pass = 0, fail = 0;
const check = (m, c, d) => { if (c) { pass++; console.log("  \x1b[32mok\x1b[0m    " + m); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + m + (d ? "  \x1b[2m" + d + "\x1b[0m" : "")); } };
const head = (t) => console.log("\n\x1b[1m" + t + "\x1b[0m\n");

// slice a top-level function (or const) out of app.js by name, up to its closing two-space brace
function fn(name) {
  const i = src.indexOf("function " + name + "(");
  if (i < 0) throw new Error("could not find function " + name + " in app.js");
  const j = src.indexOf("\n  }\n", i);
  return src.slice(i, j + 4);
}
function konst(decl) {
  const i = src.indexOf(decl);
  if (i < 0) throw new Error("could not find `" + decl + "` in app.js");
  return src.slice(i, src.indexOf("\n", i) + 1);
}

head("1) the relearning criterion is a set of DAYS, not a count");
{
  const env = new Function("todayStr",
    konst("const CRIT_DAYS = ") + konst("const critDays = ") + fn("critMark") +
    "\nreturn { CRIT_DAYS, critDays, critMark };");
  let today = "2026-09-05";
  const M = env(() => today);
  const c = {};
  M.critMark(c);
  check("a correct first attempt records the day", M.critDays(c).length === 1, JSON.stringify(c.crit));
  M.critMark(c);
  check("a SECOND correct answer the same day records nothing", M.critDays(c).length === 1, JSON.stringify(c.crit));
  today = "2026-09-06"; M.critMark(c);
  today = "2026-09-07"; M.critMark(c);
  check("three separate days reach the criterion", M.critDays(c).length === M.CRIT_DAYS, JSON.stringify(c.crit));
  today = "2026-09-08"; M.critMark(c);
  check("it never grows past the criterion", M.critDays(c).length === M.CRIT_DAYS, JSON.stringify(c.crit));
  check("the criterion is three, which is where the evidence flattens", M.CRIT_DAYS === 3, String(M.CRIT_DAYS));
  check("a record with no crit array reads as zero, not as a crash", M.critDays({}).length === 0);
  check("grade() marks it only on a correct FIRST attempt of the day",
    /if \(g !== "again" && firstToday\) critMark\(c\);/.test(src));
  check("schedAnswer is not involved — the scheduler stays pure",
    src.indexOf("critMark") > src.indexOf("function schedAnswer") &&
    !/function schedAnswer[\s\S]{0,4000}critMark/.test(src));
}

head("2) the warm-up defers rather than shuffles");
{
  const seen = new Set(["a", "b", "c"]);
  const M = new Function("isSeen", konst("const WARMUP_N = ") + fn("warmUpFirst") + "\nreturn { warmUpFirst, WARMUP_N };")((id) => seen.has(id));
  let q = ["n1", "n2", "n3", "a", "b"];
  M.warmUpFirst(q);
  check("the session opens on cards the reader has met", q[0] === "a" && q[1] === "b", JSON.stringify(q));
  check("nothing is lost or duplicated", q.length === 5 && new Set(q).size === 5, JSON.stringify(q));
  check("the rest keeps its order", q.slice(2).join(",") === "n1,n2,n3", JSON.stringify(q));
  q = ["n1", "n2", "n3"];
  M.warmUpFirst(q);
  check("a first-ever session is left exactly as it was", q.join(",") === "n1,n2,n3", JSON.stringify(q));
  q = ["a", "b", "n1"];
  M.warmUpFirst(q);
  check("a queue whose first two are already met is untouched", q.join(",") === "a,b,n1", JSON.stringify(q));
  q = ["a", "n1", "b", "n2"];
  M.warmUpFirst(q);
  check("it fills BOTH warm-up places, not just the first", q[0] === "a" && q[1] === "b", JSON.stringify(q));
  q = ["n1", "n2", "a"];
  M.warmUpFirst(q);
  check("with only one met card it takes the one and stops", q[0] === "a" && q.length === 3, JSON.stringify(q));
  check("it runs BEFORE the sibling pass, which is the one that can fix what it moves",
    src.indexOf("warmUpFirst(queue);") < src.indexOf("spreadNoteSiblings(queue);"));
}

head("3) the answer matcher forgives a slip and nothing more");
{
  const M = new Function(fn("pretestMatch") + fn("nearMiss") + fn("editDistanceLE1") + "\nreturn { pretestMatch };")();
  const t = (a, b) => M.pretestMatch(a, { answerText: b });
  check("exact", t("Mousterian", "Mousterian"));
  check("case and accents are folded", t("chatelperronian", "Châtelperronian"));
  check("a leading article is ignored", t("the polis", "polis"));
  check("a bracketed aside is ignored", t("Georgia", "Georgia (country)"));
  check("one transposition — the commonest typing slip there is", t("Mousterain", "Mousterian"));
  check("one substitution", t("Mousterien", "Mousterian"));
  check("one deletion", t("Mousteran", "Mousterian"));
  check("one insertion", t("Mousteriann", "Mousterian"));
  check("two slips are a miss", !t("Moustarein", "Mousterian"));
  check("a different term is a miss", !t("Acheulean", "Mousterian"));
  check("a short word is matched strictly", !t("axe", "axes"));
  check("an empty guess is never a match", !t("", "Mousterian"));
  check("an HTML answer is compared as text", M.pretestMatch("polis", { answer: "<b>polis</b>" }));
}

head("4) the defining sentence, lifted safely");
{
  const M = new Function(fn("cardFirstSentence") + "\nreturn { cardFirstSentence };")();
  const s = M.cardFirstSentence({ abstract: 'The <b>polis</b> was a citizen state.<sup class="fn" data-fn="1"></sup> It had walls. <br><br> Second block.' });
  check("it takes the first sentence of block one", /^The <b>polis<\/b> was a citizen state\.$/.test(s), s);
  check("footnote markers are stripped — an empty sup prints its own digit", s.indexOf("<sup") < 0, s);
  check("an abstract with no block break still yields a sentence",
    M.cardFirstSentence({ abstract: "One sentence only." }) === "One sentence only.");
  check("no abstract yields nothing rather than throwing", M.cardFirstSentence({}) === "");
}

head("5) the wiring that cannot be seen from the page");
{
  check("the four deck orders include the hybrid", /DECK_ORDERS = \["ordered", "random", "difficulty", "hybrid"\]/.test(src));
  check("every order has a label", ["ordered", "random", "difficulty", "hybrid"].every((k) => new RegExp(k + ':\\s*"').test(src.slice(src.indexOf("DECK_ORDER_LABEL"), src.indexOf("DECK_ORDER_LABEL") + 300))));
  check("every order has a note", ["ordered", "random", "difficulty", "hybrid"].every((k) => new RegExp("^\\s+" + k + ":", "m").test(src.slice(src.indexOf("const DECK_ORDER_NOTE"), src.indexOf("const HYBRID_N")))));
  check("`attempt` is a POLICY, so it cascades", /DECK_OPT_INHERIT = \[[^\]]*"attempt"/.test(src));
  check("the three new registers are in PROGRESS_FIELDS",
    /PROGRESS_FIELDS = \[[^\]]*"confused"[^\]]*"pretest"[^\]]*"orderPicked"/.test(src));
  check("the three new registers have defaults", /confused: \{\}/.test(src) && /pretest: \{\}/.test(src) && /orderPicked: \{\}/.test(src));
  check("the new routes are in the `valid` list", /valid = \[[^\]]*"order"[^\]]*"pretest"[^\]]*"how"/.test(src));
  check("each new route has a PAGE_META row", /\n    order:\s+\[/.test(src) && /\n    pretest:\s+\[/.test(src) && /\n    how:\s+\[/.test(src));
  check("the answer index is busted with the other derived caches", /function uCacheBust\(\)[^\n]*_answerIdx = null/.test(src));
  check("…and is DECLARED with them, not beside the function that fills it (temporal dead zone)",
    src.indexOf("let _answerIdx = null;") < src.indexOf("function uCacheBust"));
  check("gradeCloze hands the typed guess back", /function gradeCloze\(qEl, answer\) \{\s*\n\s*if \(!qEl\) return \[\];/.test(src));
  check("the pretest is offered on the difficulty order and no other",
    /function pretestOffer[\s\S]{0,320}deckOrderMode\(entry\) !== "difficulty"/.test(src));
  check("…and never writes S.cards", !/S\.cards\[[^\]]*\]\s*=/.test(src.slice(src.indexOf("const PRETEST_N"), src.indexOf("PAGES.order = function"))));
  check("styles exist for every new block",
    [".crit-pip", ".op-card", ".pt-q", ".elab", ".miss-lead", ".leadsto", ".confuse-row", ".fg-track", ".how-claim", ".reveal-hint"]
      .every((c) => css.indexOf(c) >= 0));
  // the ad-blocker trap: never name a class `ad-…` (see CLAUDE.md)
  const newClasses = ["crit-row", "op-card", "pt-row", "elab", "miss-lead", "leadsto", "lt-go", "confuse-row", "fg-col", "how-claim"];
  check("no new class is one an ad blocker hides", newClasses.every((c) => !/^ads?[-_]/.test(c)));
}

head("5b) the two readings of the review log");
{
  /* THE STATISTICS LIVE ON THE SIGNED-IN ACCOUNT PAGE, which needs a session token to reach — so the two
     builders are exercised HERE, as functions, and only their PLACEMENT is checked statically. That split
     is deliberate: what can go wrong in them is arithmetic and a threshold, and neither needs a browser. */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const S = { marker: "the reader's own progress object" };
  const M = new Function("esc", "revRead", "cardById", "cardLocalized", "CRIT_DAYS", "S",
    konst("const CURVE_MIN_ROWS = ") +
    src.slice(src.indexOf("const CURVE_BUCKETS = ["), src.indexOf("];", src.indexOf("const CURVE_BUCKETS = [")) + 3) +
    fn("forgettingCurveHTML") + fn("seenOnceIds") + konst("const SEEN_ONCE_MAX = ") + fn("seenOnceHTML") +
    "\nreturn { forgettingCurveHTML, seenOnceIds, seenOnceHTML };")(
      esc,
      (row) => ({ id: row[0], t: row[1], g: row[2], prevDays: row[4] / 1440 }),
      (id) => ({ id, answerText: "Term " + id }),
      (c) => c, 3, S);
  const DAY = 1440;
  const rows = [];
  // 12 reviews in each of two buckets, one bucket with a miss; and 3 reviews in a third, which is too few
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].forEach((d, i) => rows.push(["a", 0, i === 0 ? 1 : 3, 3, d * DAY, 0, 250, 30]));
  for (let i = 0; i < 12; i++) rows.push(["b", 0, 3, 3, 20 * DAY, 0, 250, 30]);
  for (let i = 0; i < 3; i++) rows.push(["c", 0, 1, 3, 60 * DAY, 0, 250, 30]);
  const curve = M.forgettingCurveHTML({ revlog: rows });
  check("the curve is drawn from the reader's own rows", /rs-curve/.test(curve));
  check("a bucket with enough rows behind it is plotted", (curve.match(/fg-col/g) || []).length === 2, String((curve.match(/fg-col/g) || []).length));
  check("…and one with too few is left out rather than guessed at", curve.indexOf("1\u20133 months") < 0);
  check("the arithmetic is right — 11 of 12 correct reads 92%", /92%/.test(curve), curve.slice(0, 200));
  check("one plotted point is not a curve", M.forgettingCurveHTML({ revlog: rows.slice(0, 12) }) === "");
  check("an empty log draws nothing at all", M.forgettingCurveHTML({ revlog: [] }) === "");
  const prog = { cards: { a: { crit: ["d1"], last: 3 }, b: { crit: ["d1"], last: 1 }, c: { crit: ["d1", "d2"], last: 2 },
                          d: { crit: ["d1"], last: 2 }, e: { crit: [], last: 9 } }, suspended: {} };
  const once = M.seenOnceIds(prog);
  check("recalled-once counts exactly one separate day", once.join(",") === "b,d,a", once.join(","));
  check("…so a card at two days is not in it", once.indexOf("c") < 0);
  check("…nor one never recalled at all", once.indexOf("e") < 0);
  check("a suspended card is left out", M.seenOnceIds({ cards: prog.cards, suspended: { b: 1 } }).indexOf("b") < 0);
  const mineProg = Object.assign(S, prog);
  check("the card offers to study them, on your OWN page", /soStudy/.test(M.seenOnceHTML(mineProg)));
  check("…and a FRIEND's copy offers no button — it is a fact about them, not a session anybody else can start",
    !/soStudy/.test(M.seenOnceHTML(prog)));
  check("under three cards it says nothing rather than nagging",
    M.seenOnceHTML({ cards: { a: { crit: ["d1"], last: 1 } }, suspended: {} }) === "");
  check("both are placed in the statistics grid", /forgettingCurveHTML\(prog\)[\s\S]{0,80}seenOnceHTML\(prog\)/.test(src));
}

if (!process.env.FOLIO_SKIP_BROWSER) {
  (async () => {
    let chromium;
    try { chromium = require("playwright").chromium; }
    catch (e) { console.log("\n  (playwright not installed — sections 6+ skipped)"); done(); return; }
    const { watchErrors } = require("./test-noise.js");
    const FILE = "file://" + path.join(ROOT, "index.html");
    const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM || undefined });
    const page = await browser.newPage();
    const errs = watchErrors(page);
    const clearOverlays = () => page.evaluate(() => {
      document.querySelectorAll(".levelup-pop, .chest-pop, .chest-ov, .page-help, .folio-tour").forEach((e) => e.remove());
    });
    /* Seeding has to land on the HOME page, and that is not automatic: a study session survives a
       reload (see STUDY_KEY), so reloading while the hash is still `#study` resumes the session instead
       of drawing the page every section below starts from. Clearing sessionStorage and the hash first is
       what makes each section independent of the one before it. */
    const seed = async (patch) => {
      await page.evaluate((p) => {
        const st = JSON.parse(localStorage.getItem("folio_v1") || "{}");
        Object.assign(st, p);
        localStorage.setItem("folio_v1", JSON.stringify(st));
        try { sessionStorage.clear(); } catch (e) { /* private mode */ }
        location.hash = "";
      }, patch);
      await page.reload(); await page.waitForTimeout(1200);
      await page.click("#b-tour-no").catch(() => {});
      await clearOverlays();
    };
    await page.goto(FILE); await page.waitForTimeout(1500);

    head("6) the first-session order picker");
    /* It is asked on a DECK, not on the pooled review — see orderAskEntry — so the session has to be
       started from the deck's own row on the home page rather than from the Daily study banner. */
    const studyDeck = async () => {
      const row = await page.$(".active-deck[data-review], [data-review]:not(.banner)");
      if (!row) return false;
      await row.click(); await page.waitForTimeout(750);
      return true;
    };
    await seed({ active: ["wh-evolution"], cards: {}, orderPicked: {}, pretest: {}, confused: {} });
    check("a deck row is on the home page to study", await studyDeck());
    check("the first study of a deck asks how to study it", (await page.evaluate(() => location.hash)) === "#order");
    check("all four orders are offered", (await page.$$(".op-card")).length === 4);
    check("each carries a real explanation, not a label",
      (await page.$$eval(".op-card .op-p", (n) => n.map((x) => x.textContent.length))).every((l) => l > 120));
    check("the current default is marked", (await page.$$(".op-card.op-cur")).length === 1);
    check("it says how to change it later", /press and hold/i.test(await page.$eval(".op-foot p", (e) => e.textContent)));
    check("and offers a way past it in one press", !!(await page.$("#opSkip")));
    await page.click("#opSkip"); await page.waitForTimeout(700);
    check("skipping goes straight to studying", (await page.evaluate(() => location.hash)) === "#study");
    await page.evaluate(() => (location.hash = "")); await page.waitForTimeout(600);
    await studyDeck();
    check("it is asked ONCE, not on every session", (await page.evaluate(() => location.hash)) === "#study");
    await page.evaluate(() => (location.hash = "")); await page.waitForTimeout(600);
    await page.click("#b-review"); await page.waitForTimeout(700);
    check("the pooled daily review is never interrupted by it", (await page.evaluate(() => location.hash)) === "#study");

    head("7) the deck pretest gives no XP");
    await seed({ active: ["wh-evolution"], cards: {}, orderPicked: {}, pretest: {} });
    await studyDeck();
    await page.click('.op-card[data-order="difficulty"]'); await page.waitForTimeout(700);
    check("choosing the difficulty order offers the pretest", (await page.evaluate(() => location.hash)) === "#pretest");
    await page.click("#ptGo"); await page.waitForTimeout(400);
    check("it asks one question at a time, with a blank", (await page.$$(".pt-qtext .blank-input")).length === 1);
    for (let i = 0; i < 12; i++) { await page.click("#ptDunno"); await page.waitForTimeout(90); }
    check("it ends on a result", (await page.$$(".pt-row")).length === 12);
    const afterPre = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem("folio_v1"));
      return { cards: Object.keys(st.cards || {}).length, pre: Object.keys(st.pretest || {}).length };
    });
    check("*** IT WRITES NO CARD RECORDS — no XP, no levels, no chests ***", afterPre.cards === 0, JSON.stringify(afterPre));
    check("…and it does record the result", afterPre.pre === 1, JSON.stringify(afterPre));
    await page.click("#ptStudy"); await page.waitForTimeout(700);
    check("and then studying begins", (await page.evaluate(() => location.hash)) === "#study" && !!(await page.$(".question")));

    head("8) answer before revealing");
    await seed({ active: ["wh-evolution"], cards: {}, orderPicked: { "review:all": "" }, settings: Object.assign({}, await page.evaluate(() => JSON.parse(localStorage.getItem("folio_v1")).settings), { attemptFirst: true }) });
    await page.click("#b-review"); await page.waitForTimeout(800);
    check("Reveal is held back", await page.$eval("#reveal-btn", (e) => e.disabled));
    check("an escape hatch is offered beside it", !!(await page.$("#dunno-btn")));
    check("and the hint says why", /Type your answer/.test(await page.$eval("#revealHint", (e) => e.textContent)));
    await page.keyboard.press("Space"); await page.waitForTimeout(250);
    check("Space does not get past it either", !(await page.$eval("#reveal", (e) => e.classList.contains("show"))));
    await page.keyboard.press("Enter"); await page.waitForTimeout(250);
    check("nor does Enter", !(await page.$eval("#reveal", (e) => e.classList.contains("show"))));
    await page.click(".question .blank-input");
    await page.type(".question .blank-input", "Stone Age");
    await page.waitForTimeout(200);
    check("typing anything opens it — an ATTEMPT, not the right answer", !(await page.$eval("#reveal-btn", (e) => e.disabled)));
    await page.click("#reveal-btn"); await page.waitForTimeout(500);
    check("a missed card is told what the thing was, not just its name", !!(await page.$(".miss-lead")));

    head("9) the confusion register, and one elaboration prompt per session");
    await seed({ active: ["wh-evolution"], cards: {}, confused: {}, orderPicked: { "review:all": "" },
                 settings: Object.assign({}, await page.evaluate(() => JSON.parse(localStorage.getItem("folio_v1")).settings), { attemptFirst: false }) });
    await page.click("#b-review"); await page.waitForTimeout(800);
    const elab = [];
    for (let i = 0; i < 6; i++) {
      await clearOverlays();
      const f = await page.$(".question .blank-input");
      if (f) { await f.click(); await f.type("Stone Age"); }
      await page.click("#reveal-btn").catch(() => {});
      await page.waitForTimeout(280);
      elab.push((await page.$$(".elab")).length);
      await page.click('.grade[data-g="good"]').catch(() => {});
      await page.waitForTimeout(320);
    }
    check("at most one elaboration prompt is drawn per card", elab.every((n) => n <= 1), JSON.stringify(elab));
    check("exactly one is drawn in the whole session", elab.reduce((a, b) => a + b, 0) === 1, JSON.stringify(elab));
    const conf = await page.evaluate(() => JSON.parse(localStorage.getItem("folio_v1")).confused || {});
    check("typing one card's answer into another's blank is recorded", Object.keys(conf).length > 0, JSON.stringify(conf));
    check("…and a repeated pair is counted, not just noted", Object.values(conf).some((n) => n >= 2), JSON.stringify(conf));
    await page.evaluate(() => (location.hash = "")); await page.waitForTimeout(700);
    check("the home page offers to drill the pair", !!(await page.$("#confuseRow")));
    await page.click("#confuseRow"); await page.waitForTimeout(700);
    check("and the drill is a real session", (await page.evaluate(() => location.hash)) === "#study" && !!(await page.$(".question")));

    head("10) the criterion, the causal strip and the explanation page");
    await seed({ active: ["wh-evolution"], cards: {}, orderPicked: { "review:all": "" } });
    await page.click("#b-review"); await page.waitForTimeout(800);
    await page.click("#reveal-btn"); await page.waitForTimeout(300);
    check("a card met for the first time shows no pips", (await page.$$(".crit-pip")).length === 0);
    await page.click('.grade[data-g="good"]'); await page.waitForTimeout(400);
    await clearOverlays();
    const crit = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem("folio_v1"));
      return Object.values(st.cards || {}).map((c) => (c.crit || []).length);
    });
    check("a correct answer records one separate day", crit.length === 1 && crit[0] === 1, JSON.stringify(crit));
    await page.evaluate(() => (location.hash = "how")); await page.waitForTimeout(600);
    check("the explanation page names four beliefs to correct", (await page.$$(".how-claim")).length === 4);
    check("each says what Folio does about it", (await page.$$(".how-so")).length === 4);
    check("it is reachable from Settings", src.indexOf('id="howLink"') > 0 && /howLink[\s\S]{0,120}route\("how"\)/.test(src));

    check("no console or page errors throughout", errs.length === 0, errs.slice(0, 4).join(" | "));
    await browser.close();
    done();
  })().catch((e) => { console.error(e); process.exit(1); });
} else { done(); }

function done() {
  console.log("\n" + pass + " passed, " + fail + " failed\n");
  process.exit(fail ? 1 : 0);
}
