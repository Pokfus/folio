/* Import the all-languages deck the way a reader would, and MEASURE it.
 *
 *     node .claude/decks/check-all-languages.js
 *
 * WHY THIS IS A FILE OF ITS OWN.  `check-combined.js` covers one language's
 * levels; everything it asserts is true of this file by construction, because
 * the cards are copied out of the 23 shipped decks unchanged.  What is NOT true
 * by construction is the part `combine-decks.py` builds — the branch per
 * language, the source decks' own subdecks hanging below it, six card types in
 * one file, 39,830 renumbered ids — and, above all, whether a file this size is
 * USABLE.  It is twice the row cap and well over the byte cap that stood before
 * it, so raising those caps is a claim about performance, and a claim about
 * performance that nobody measured is a guess.  Hence the timings below: they
 * are the evidence for the new numbers and the thing to re-read before anyone
 * raises them again — AND THE THING TO RE-RUN, since they are a measurement of
 * one file on one machine and go out of date the moment a language is added.
 *
 * Every failure here is silent on a real device:
 *   * an id collision studies the WRONG CARD, with both decks on the shelf;
 *   * a lost `sub` lands 40,000 words in one undivided pile;
 *   * a missing card type renders that language's cards as raw prose;
 *   * and an import that never finishes writing looks exactly like one that did
 *     until the next reload, when the deck is simply not there.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..", "..");
const DECK = "All-Languages.folio-deck.json";
/* THE LANGUAGES ARE READ OUT OF THE COMBINER'S OWN TABLE, NEVER WRITTEN DOWN
   HERE.  They were the literal ["French","German","Italian","Mandarin",
   "Spanish"] and a `TYPES = 6`, which is exactly the trap CLAUDE.md keeps
   recording about a test that hard-codes a figure: adding Portuguese made both
   stale in the same commit, and a stale expectation does not guard the rule, it
   pins the answer the rule used to give.  `PARTS` is where the order is decided,
   so `PARTS` is what this compares against — and a language added there fails
   here on the RULE (one branch per language, in the table's order) rather than
   on a number somebody forgot to bump. */
const LANGS = (() => {
  const py = fs.readFileSync(path.join(ROOT, ".claude", "combine-decks.py"), "utf8");
  const table = /^PARTS = \[$([\s\S]*?)^\]$/m.exec(py);
  if (!table) throw new Error("PARTS is not in combine-decks.py under that name");
  const out = [];
  for (const m of table[1].matchAll(/'[^']+\.folio-deck\.json',\s*\n?\s*'([^']+)'/g)) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  if (!out.length) throw new Error("PARTS parsed to no languages");
  return out;
})();

let pass = 0, fail = 0;
const ok = (c, m, extra) => {
  if (c) { pass++; console.log("   ✓ " + m); }
  else { fail++; console.log("   ✗ " + m + (extra ? "  " + extra : "")); }
};
const ms = (t) => (t >= 1000 ? (t / 1000).toFixed(1) + " s" : Math.round(t) + " ms");

(async () => {
  const file = path.join(ROOT, "decks", DECK);
  if (!fs.existsSync(file)) {
    console.log("   ✗ " + DECK + " is not built; run combine-decks.py first");
    process.exit(1);
  }

  // ------------------------------------------------------------ the file
  const bytes = fs.statSync(file).size;
  const t0 = Date.now();
  const deck = JSON.parse(fs.readFileSync(file, "utf8"));
  console.log(`   · ${(bytes / 1048576).toFixed(2)} MB, ${deck.cards.length.toLocaleString()} notes`
    + `, JSON.parse ${ms(Date.now() - t0)} in node`);

  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const capN = +(/UDECK_MAX_CARDS\s*=\s*(\d+)/.exec(app) || [])[1];
  const capB = eval((/UDECK_MAX_BYTES\s*=\s*([\d*\s]+);/.exec(app) || [])[1] || "0");
  ok(deck.cards.length <= capN, `under app.js's note cap (${deck.cards.length.toLocaleString()}`
     + ` of ${capN.toLocaleString()})`);
  ok(bytes <= capB, `under app.js's byte cap (${(bytes / 1048576).toFixed(0)}`
     + ` of ${(capB / 1048576).toFixed(0)} MB)`);

  const ids = new Set(deck.cards.map((c) => c.id));
  ok(ids.size === deck.cards.length, "every card id is distinct");
  ok(deck.cards.every((c) => /^u_alldecks_\d+$/.test(c.id)),
     "and carries the COMBINED deck's id, not a source deck's",
     deck.cards.find((c) => !/^u_alldecks_\d+$/.test(c.id))?.id);

  const subs = [...new Set(deck.cards.map((c) => c.sub))];
  const roots = [...new Set(subs.map((s) => s.split("::")[0]))];
  ok(JSON.stringify(roots) === JSON.stringify(LANGS),
     "one branch per language, in order", JSON.stringify(roots));
  ok(subs.every((s) => s.split("::").length <= 4),
     "and nothing is deeper than app.js's SUB_MAX_DEPTH");
  // THE SOURCE DECKS' OWN SUBDECKS SURVIVE BELOW THE LANGUAGE, which is the
  // whole reason the tree nests: flattened, HSK 3.0's nine levels and the four
  // Spanish levels' two directions would all be gone and nothing would say so.
  ok(subs.includes("Mandarin::HSK 3.0::Level 1"),
     "HSK 3.0 keeps its own levels under Mandarin");
  ok(subs.some((s) => /^Spanish::B2::/.test(s)),
     "and the Spanish levels keep their directions");
  ok(subs.includes("French::Expressions"), "and French keeps its expressions");
  ok(subs.includes("Italian::Core vocabulary"),
     "and Italian keeps its core deck beside its bands");

  /* THE TYPES ARE CHECKED AS A SET AGAINST THE CARDS, not against a count.  What
     matters is that the two agree in BOTH directions, and each direction fails
     differently: a card naming a type the file has not got renders as raw prose,
     and a type no card names is a definition that has quietly lost its cards --
     which is what a botched collision split would leave behind, since the cards
     of the file that lost the name are repointed and nothing else would say so. */
  const types = Object.keys(deck.meta.types || {}).sort();
  const used = [...new Set(deck.cards.map((c) => c.type).filter(Boolean))].sort();
  const orphan = deck.cards.find((c) => c.type && !deck.meta.types[c.type]);
  ok(!orphan, "no card names a type the file has not got", orphan && orphan.type);
  const dead = types.filter((t) => !used.includes(t));
  ok(dead.length === 0, `and all ${types.length} card types that travel are used`,
     JSON.stringify(dead));

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

  const tImport = Date.now();
  await pg.waitForSelector(".studio-deck", { timeout: 1800000 });
  const tVisible = Date.now() - tImport;
  // The store is written note by note inside ONE transaction, and the deck is
  // usable from memory before it commits — so "visible" is not "saved", and a
  // page closed in between loses the import silently. uImportDone waits on the
  // write and says "Saving…" past 400 ms, which is what this waits out.
  await pg.waitForFunction(() => !/Saving/i.test(document.body.textContent || ""),
                           null, { timeout: 1800000 });
  const tWritten = Date.now() - tImport;
  ok(true, `it imports — visible in ${ms(tVisible)}, written in ${ms(tWritten)}`);

  // BOOT IS THE COST EVERY LATER VISIT PAYS, and it is the one the split store
  // exists to keep small: boot reads the note INDEX and no prose at all.  Timed
  // to the moment the deck's own rows are on the page and NOT with a settling
  // wait added afterwards — a fixed `waitForTimeout` lands in the figure and
  // makes a fast boot read as a slow one, which is a measurement that would
  // then be quoted at somebody.
  const tBoot = Date.now();
  await pg.goto(base + "#decks", { waitUntil: "load" });
  await pg.waitForSelector("[data-uaddsub]", { timeout: 120000 });
  console.log(`   · a later visit boots in ${ms(Date.now() - tBoot)} with the deck installed`);

  const offered = await pg.evaluate(() =>
    [...document.querySelectorAll("[data-uaddsub]")]
      .map((b) => decodeURIComponent(b.getAttribute("data-uaddsub"))));
  ok(LANGS.every((l) => offered.some((o) => o.endsWith("/" + l))),
     "every language is offered as a subdeck of its own",
     JSON.stringify(offered.slice(0, 6)));

  // ADD ONE LANGUAGE AND STUDY IT.  The id-collision check made where it bites:
  // a renumbering fault deals a card from whatever else is in the shared store.
  // The button is found by DECODING each attribute in the page rather than by
  // re-encoding the path here: `data-uaddsub` holds the percent-encoded sub, and
  // encodeURIComponent is not the inverse of whatever encoded it — a selector
  // built that way matches nothing and throws on a deck that is perfectly fine.
  const added = await pg.evaluate(() => {
    const b = [...document.querySelectorAll("[data-uaddsub]")].find(
      (e) => decodeURIComponent(e.getAttribute("data-uaddsub")).endsWith("/French"));
    if (b) b.click();
    return !!b;
  });
  ok(added, "the French branch has an add button");
  await pg.waitForTimeout(1200);
  await pg.goto(base + "#home", { waitUntil: "load" });
  await pg.waitForTimeout(2500);
  const rows = await pg.evaluate(() =>
    [...document.querySelectorAll(".active-deck .dk-title")].map((e) => e.textContent.trim()));
  ok(rows.some((r) => /French/.test(r)), "adding French puts French in the review",
     JSON.stringify(rows.slice(0, 5)));

  await pg.click(".review-group .cta .btn");
  await pg.waitForSelector(".question", { timeout: 120000 });
  await pg.waitForTimeout(800);
  const dealt = await pg.evaluate(() => {
    const e = document.querySelector(".uc-word");
    return e ? e.textContent.trim() : "";
  });
  ok(dealt.length > 0, "and a card comes up with a word on it", dealt);
  const french = new Set(deck.cards.filter((c) => /^French/.test(c.sub))
    .map((c) => (c.fields || {}).French?.replace(/<[^>]+>/g, "").trim()).filter(Boolean));
  ok(french.has(dealt), "and the word is one of French's", dealt);

  ok(errs.length === 0, "no page errors", errs.slice(0, 2).join(" | "));
  await browser.close();

  console.log(`\n${fail ? "✗" : "✓"} ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
