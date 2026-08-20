/* Import the combined French deck the way a reader would, and study it.
 *
 *     node .claude/delf/check-combined.js
 *
 * WHY THIS IS A FILE OF ITS OWN.  `check-delf.js` studies ONE level and asserts
 * what a French card says; everything it checks is true of the combined deck by
 * construction, because the cards are copied out of the six shipped files
 * unchanged.  What is NOT true by construction is the part `combine.py` builds:
 * the subdeck per level, the direction rows underneath each of them, the
 * renumbered ids, and the fact that the whole thing fits inside app.js's caps
 * and can actually be imported.  Every one of those fails SILENTLY --
 *
 *   * an id collision studies the WRONG CARD, with both decks on the shelf and
 *     their full counts showing (the fault the Spanish generator had between
 *     its own A1 and A2);
 *   * a level whose `sub` did not survive lands its cards in the deck root, so
 *     the reader gets one undivided pile of seven thousand words and nothing
 *     says so;
 *   * a mismatched type block renders one level's cards with another level's
 *     templates, which looks like a card that is merely laid out oddly;
 *   * and a file over the note cap is refused at import with a message about
 *     the file rather than about the deck.
 *
 * so none of it can be left to a glance at the generator's own output.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..", "..");
const DECK = "French-A1-C2.folio-deck.json";
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
/* The seventh subdeck is not a seventh level, and the two lists are kept apart
   here for the same reason `combine.py` keeps LEVELS and PARTS apart: the
   per-level assertions below (the exam runs in the title, the "A1 446" figures
   in the description) are false of it, and folding it in would assert there is a
   DALF paper in idiom. */
const PHRASES = "Expressions";
const PARTS = LEVELS.concat([PHRASES]);

let pass = 0, fail = 0;
const ok = (c, m, extra) => {
  if (c) { pass++; console.log("   \u2713 " + m); }
  else { fail++; console.log("   \u2717 " + m + (extra ? "  " + extra : "")); }
};

(async () => {
  const file = path.join(ROOT, "decks", DECK);
  if (!fs.existsSync(file)) {
    console.log("   \u2717 " + DECK + " is not built; run combine.py first");
    process.exit(1);
  }

  // ------------------------------------------------------------ the file
  const deck = JSON.parse(fs.readFileSync(file, "utf8"));
  const n = deck.cards.length;
  ok(n <= 12000, `under app.js's 12,000-note cap (${n.toLocaleString()})`);
  ok(Buffer.byteLength(JSON.stringify(deck), "utf8") <= 48 * 1024 * 1024,
     "under app.js's 48 MB cap");

  const ids = new Set(deck.cards.map((c) => c.id));
  ok(ids.size === n, "every card id is distinct");
  ok(deck.cards.every((c) => /^u_delfall_\d+$/.test(c.id)),
     "and carries the COMBINED deck's id, not a level's",
     deck.cards.find((c) => !/^u_delfall_\d+$/.test(c.id))?.id);

  const subs = [...new Set(deck.cards.map((c) => c.sub))];
  ok(JSON.stringify(subs) === JSON.stringify(PARTS),
     "one subdeck per level plus the expressions, in order", JSON.stringify(subs));
  ok(subs.every((s) => !s.includes("::")),
     "and the tree is FLAT -- the directions are templates, not subdecks");

  const types = Object.keys(deck.meta.types || {});
  ok(types.length === 1, "one card type", JSON.stringify(types));
  ok((deck.meta.types[types[0]].cards || []).length === 2,
     "carrying two templates, which is what makes a note two cards");

  /* The description's figures are COUNTED, so they must agree with the cards.
     Matched on the numbers and the word "cards" rather than on one phrasing:
     the sentence is worded differently with the expressions in ("Between them
     that is N words and expressions, on M cards") and without them ("N in all,
     on M cards"), and a pattern pinned to one of those reports a correct deck as
     broken the moment the other is used. */
  const words = (deck.meta.desc.match(/([\d,]+)(?: words and expressions| in all),? on ([\d,]+) cards/) || []);
  ok(words[1] && +words[1].replace(/,/g, "") === n,
     "the description's word count is the deck's", words[1]);
  ok(words[2] && +words[2].replace(/,/g, "") === n * 2,
     "and its card count is twice it", words[2]);
  for (const lv of LEVELS) {
    const c = deck.cards.filter((x) => x.sub === lv).length;
    ok(deck.meta.desc.includes(`${lv} ${c.toLocaleString()}`),
       `and it states ${lv}'s own count (${c.toLocaleString()})`);
  }
  const nph = deck.cards.filter((x) => x.sub === PHRASES).length;
  ok(deck.meta.desc.includes(`adds ${nph.toLocaleString()} more`),
     `and the expressions' count (${nph.toLocaleString()})`);
  ok(/DELF A1.B2 . DALF C1.C2/.test(deck.meta.title),
     "the title says DELF of A1-B2 and DALF of C1-C2", deck.meta.title);
  /* AND NAMES THE EXPRESSIONS SEPARATELY.  Folded into the exam runs the title
     would read "DALF C1–Expressions", which claims a paper that does not exist. */
  ok(/expressions/i.test(deck.meta.title) && !/DALF C1.Expressions/i.test(deck.meta.title),
     "and names the expressions apart from the exam runs", deck.meta.title);

  // ---------------------------------------------------------- in a browser
  const browser = await chromium.launch({
    executablePath: process.env.FOLIO_CHROMIUM || undefined,
  });
  const pg = await browser.newPage();
  const errs = [];
  pg.on("pageerror", (e) => errs.push(String(e)));
  const base = "file://" + path.join(ROOT, "index.html");

  await pg.goto(base + "#studio", { waitUntil: "load" });
  await pg.waitForTimeout(400);
  const chooser = pg.waitForEvent("filechooser");
  await pg.click("#stImport");
  (await chooser).setFiles(file);
  // 14,500 cards is a real import; the store is written note by note
  await pg.waitForSelector(".studio-deck", { timeout: 600000 });
  ok(true, "it imports");

  await pg.goto(base + "#decks", { waitUntil: "load" });
  await pg.waitForTimeout(1200);

  const offered = await pg.evaluate(() =>
    [...document.querySelectorAll("[data-uaddsub]")]
      .map((b) => decodeURIComponent(b.getAttribute("data-uaddsub"))));
  ok(PARTS.every((lv) => offered.some((o) => o.endsWith("/" + lv))),
     "every level and the expressions are offered as subdecks of their own",
     JSON.stringify(offered));

  const dirs = await pg.evaluate(() =>
    [...document.querySelectorAll("[data-usubtpl]")]
      .map((r) => r.querySelector(".deck-title")?.textContent.trim()));
  ok(dirs.some((r) => /French . English/.test(r || "")) &&
     dirs.some((r) => /English . French/.test(r || "")),
     "and each direction under it, which the file never names",
     JSON.stringify(dirs.slice(0, 4)));

  // ADDING A LEVEL ADDS THE LEVEL, not the deck and not both directions.
  const a1 = offered.find((o) => o.endsWith("/A1"));
  await pg.click(`[data-uaddsub="${encodeURIComponent(a1).replace(/"/g, '\\"')}"]`)
    .catch(async () => {
      await pg.evaluate((s) => document.querySelector(
        `[data-uaddsub="${s}"]`).click(), a1.replace(/[^\w:/]/g, (c) =>
          encodeURIComponent(c)));
    });
  await pg.waitForTimeout(600);
  await pg.goto(base + "#home", { waitUntil: "load" });
  await pg.waitForTimeout(1500);
  const rows = await pg.evaluate(() =>
    [...document.querySelectorAll(".active-deck .dk-title")]
      .map((e) => e.textContent.trim()));
  ok(rows.length >= 1 && rows.some((r) => /A1/.test(r)),
     "adding A1 puts A1 in the review", JSON.stringify(rows));

  // ------------------------------------------------------------- study it
  await pg.click(".review-group .cta .btn");
  await pg.waitForSelector(".question", { timeout: 60000 });
  await pg.waitForTimeout(600);
  const card = await pg.evaluate(() => ({
    word: document.querySelector(".uc-word")?.textContent.trim() || "",
    id: (window.__studyId || ""),
  }));
  ok(card.word.length > 0, "and a card comes up with a word on it", card.word);

  // THE CARD DEALT MUST BE ONE OF A1's, which is the id-collision check made
  // where it actually bites: a renumbering fault would deal a card from
  // whatever else is in the shared store.
  const dealt = await pg.evaluate(() => {
    const w = document.querySelector(".uc-word")?.textContent.trim();
    return w;
  });
  const a1words = new Set(deck.cards.filter((c) => c.sub === "A1")
    .map((c) => (c.fields || {}).French?.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean));
  ok([...a1words].some((w) => w === dealt),
     "and the word is one of A1's", dealt);

  ok(errs.length === 0, "no page errors", errs.join(" | "));
  await browser.close();

  console.log(`\n${fail ? "\u2717" : "\u2713"} ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
