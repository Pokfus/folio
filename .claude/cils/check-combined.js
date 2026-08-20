/* Check the COMBINED Italian deck — the things only the combined file can get wrong.
 *
 *   NODE_PATH=… FOLIO_CHROMIUM=… node .claude/cils/check-combined.js
 *
 * `check-cils.js` checks one level's cards: the articles, the paradigms, the
 * stress marks.  All of that is unchanged here, since the cards are the shipped
 * decks' own.  What IS new is everything about putting eight decks in one file,
 * and each of these fails silently:
 *
 *   · **A HEADWORD TWICE ACROSS BANDS.**  The six MindDory bands are strictly
 *     disjoint, so no in-band check could ever see a collision — and the accent
 *     and spelling repairs (`colonello` → `colonnello`, `elite` → `élite`) can
 *     MAKE one, by moving a word onto a spelling another band already carries.
 *     `words_below` is what prevents it and it was inert for its whole life
 *     before Aug 2026; this is the only place its working is visible.
 *
 *   · **THE IMPORT ITSELF.**  20 MB and 10,216 notes is within a fifth of
 *     app.js's `UDECK_MAX_CARDS`, which counts NOTES and REFUSES rather than
 *     trimming.  A deck that will not import is a deck nobody can report on.
 *
 *   · **THE SUBDECKS AND THEIR DIRECTIONS.**  A subdeck per level, each drawing
 *     its two direction rows from the type's two templates rather than from a
 *     `::` level this file would have to write.  A flattened `sub` looks like a
 *     working deck with one enormous subdeck.
 *
 *   · **AND THAT A SUBDECK STUDIES ITS OWN CARDS.**  Adding `A1` and being dealt
 *     C1's words is the fault the renumbered ids exist to prevent, and it is
 *     invisible unless something reads a dealt card back.
 */
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs");
const ROOT = path.resolve(__dirname, "..", "..");
const DECK = "Italian-Complete.folio-deck.json";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
               ".json": "application/json", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  fs.readFile(p, (e, b) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
    res.end(b);
  });
});
let fails = 0, checks = 0;
const ok = (c, m, extra) => {
  checks++;
  if (!c) { fails++; console.log("   ✗ " + m + (extra ? "   " + extra : "")); }
  else console.log("   ✓ " + m);
};
const strip = (s) => (s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
// The article a NOUN's headword carries, which is not part of the word — and
// only a noun's.  An expression that opens on an article (`lo stesso`,
// `l'altro ieri`) keeps it, or the phrases deck reads as teaching `stesso`,
// which A1 teaches as a determiner: two different entries reported as one word
// twice.  Measured over all eight shipped decks: every article-prefixed
// headword outside the phrases deck is a noun.  See `cils_level.strip_article`.
const ART = /^(?:il|lo|la|i|gli|le)\s+|^l'/i;
const POS = /uc-pos">([^<]*)</;
// ANCHORED, because `noun` is a substring of `pronoun`: unanchored, `il quale`
// is filed as a noun, loses its article, and is reported as A1's determiner
// `quale` taught twice — which is how this rule failed its first run.
const NOUN = /^(?:proper )?noun\b/i;
const head = (c) => {
  const w = strip(c.fields.Word);
  const m = POS.exec(c.fields.English || "");
  return (m && !NOUN.test(m[1].trim()) ? w : w.replace(ART, "")).trim().toLowerCase();
};

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const pg = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  await pg.addInitScript(() => {
    try {
      const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      s.settings = Object.assign({}, s.settings, { newPerDay: 400, maxReviewsPerDay: 500 });
      localStorage.setItem("folio_v1", JSON.stringify(s));
    } catch (e) {}
  });
  const errs = [];
  pg.on("console", (m) => { if (m.type() === "error" && !/net::ERR_/.test(m.text())) errs.push(m.text()); });
  pg.on("pageerror", (e) => errs.push(String(e)));

  const deck = JSON.parse(fs.readFileSync(path.join(ROOT, "decks", DECK), "utf8"));
  const bytes = fs.statSync(path.join(ROOT, "decks", DECK)).size;
  console.log("=== " + DECK + "   " + deck.cards.length.toLocaleString() +
              " notes, " + (bytes / 1048576).toFixed(1) + " MB");

  // ---------------------------------------------------------------- the file
  ok(deck.cards.length <= 12000, "within app.js's 12,000-note import cap",
     deck.cards.length + "");
  // …and by how much, because app.js REFUSES an over-size file rather than
  // trimming it, so the failure would be at the reader's end and not here
  console.log("   · " + (12000 - deck.cards.length).toLocaleString() +
              " notes of headroom under the cap");
  ok(bytes <= 48 * 1024 * 1024, "within app.js's 48 MB import cap");
  const idRx = new RegExp("^u_" + deck.meta.id.replace(/[^a-z0-9]/g, "") + "_\\d+$");
  ok(deck.cards.every((c) => idRx.test(c.id)),
     "every card is renumbered onto the combined deck's own id", idRx.source);
  ok(new Set(deck.cards.map((c) => c.id)).size === deck.cards.length, "no id occurs twice");

  // DERIVED from what is on disk rather than written down: an eighth deck was
  // added after this file was, and a hardcoded 7 would have failed on the rule
  // being obeyed.  One subdeck per shipped Italian deck, no more and no fewer.
  const sources = fs.readdirSync(path.join(ROOT, "decks"))
    .filter((f) => /^(CILS-.*|Italian-(Core-Vocabulary|Phrases-Expressions))\.folio-deck\.json$/.test(f));
  const subs = [...new Set(deck.cards.map((c) => c.sub))];
  ok(subs.length === sources.length,
     "one subdeck per shipped Italian deck (" + sources.length + ")", JSON.stringify(subs));
  const srcNotes = sources.reduce((n, f) =>
    n + JSON.parse(fs.readFileSync(path.join(ROOT, "decks", f), "utf8")).cards.length, 0);
  ok(srcNotes === deck.cards.length,
     "and every note of every one of them is here", srcNotes + " vs " + deck.cards.length);
  ok(subs.every((s) => s && !s.includes("::")),
     "each is one level, not a flattened or nested sub", JSON.stringify(subs));
  ok(Object.keys(deck.meta.types).length === 1 &&
     deck.meta.types.cils.cards.length === 2,
     "one card type, two templates — the directions come from the templates");

  // **THE CROSS-BAND DUPLICATE.**  Article-stripped, since `il credo` and
  // `credo` would be the same word taught twice under two spellings.
  const heads = deck.cards.map(head);
  const seen = new Map(), dup = [];
  deck.cards.forEach((c, i) => {
    const w = heads[i];
    if (seen.has(w)) dup.push(`${w} (${seen.get(w)} + ${c.sub})`);
    else seen.set(w, c.sub);
  });
  ok(dup.length === 0, "no word is taught twice across the eight levels",
     dup.slice(0, 8).join(", "));

  // ---------------------------------------------------------------- importing
  await pg.goto(base + "#studio", { waitUntil: "load" });
  await pg.waitForTimeout(500);
  const chooser = pg.waitForEvent("filechooser");
  await pg.click("#stImport");
  (await chooser).setFiles(path.join(ROOT, "decks", DECK));
  await pg.waitForSelector(".studio-deck", { timeout: 300000 });
  // **THE DECK IS VISIBLE BEFORE IT IS WRITTEN.**  20 MB is ~10,200 individual
  // note records in one IndexedDB transaction, and a page navigated away before
  // it commits loses the import in silence -- app.js's own note on the split
  // store.  So this waits past the row for the write to settle.
  await pg.waitForTimeout(12000);
  const shelf = await pg.evaluate(() => document.body.innerText);
  ok(/Italian — CILS/.test(shelf), "the deck imports and appears on the shelf");

  // ------------------------------------------------------------- the subdecks
  await pg.goto(base + "#decks", { waitUntil: "load" });
  await pg.waitForTimeout(1200);
  const rows = await pg.evaluate(() =>
    [...document.querySelectorAll("[data-uaddsub]")].map((e) => e.getAttribute("data-uaddsub")));
  const labels = await pg.evaluate(() =>
    [...document.querySelectorAll(".ud-sub-title, .udsub-title, .ud-subrow")]
      .map((e) => e.textContent.trim()).filter(Boolean));
  ok(rows.length >= 7 || labels.length >= 7,
     "every level is offered as a row of its own",
     JSON.stringify(rows.slice(0, 9)) + JSON.stringify(labels.slice(0, 9)));

  // ------------------------------------------------------------- adding A1
  const added = await pg.evaluate(() => {
    const b = [...document.querySelectorAll("[data-uaddsub]")]
      .find((e) => /(^|\/)A1$/.test(decodeURIComponent(e.getAttribute("data-uaddsub"))));
    if (b) { b.click(); return decodeURIComponent(b.getAttribute("data-uaddsub")); }
    return null;
  });
  ok(added !== null, "the A1 subdeck can be added on its own", String(added));
  await pg.waitForTimeout(700);
  await pg.goto(base + "#home", { waitUntil: "load" });
  await pg.waitForTimeout(1200);
  const home = await pg.evaluate(() => [...document.querySelectorAll(".active-deck .dk-title")]
    .map((e) => e.textContent.trim()));
  ok(home.length === 1 && /A1/.test(home[0]),
     "adding one level adds one row, not the whole deck", JSON.stringify(home));

  // ------------------------------------------- and it deals THAT level's cards
  const a1 = new Set(deck.cards.filter((c) => c.sub === "A1").map(head));
  await pg.evaluate(() => {
    const r = document.querySelector(".active-deck");
    if (r) r.click();
  });
  await pg.waitForTimeout(2500);
  const dealt = [];
  for (let i = 0; i < 6; i++) {
    const w = await pg.evaluate(() => {
      const e = document.querySelector(".uc-word");
      return e ? e.textContent.trim() : null;
    });
    if (w) dealt.push(w.replace(/^(il|lo|la|i|gli|le)\s+|^l'/i, "").trim().toLowerCase());
    const g = await pg.$("#reveal-btn");
    if (g) await g.click();
    await pg.waitForTimeout(350);
    await pg.evaluate(() => {
      const b = [...document.querySelectorAll(".grade button, .grade .gbtn, #gradebar button")]
        .find((x) => /easy/i.test(x.textContent));
      if (b) b.click();
    });
    await pg.waitForTimeout(650);
  }
  ok(dealt.length > 0 && dealt.every((w) => a1.has(w)),
     "studying that level deals that level's words and no other's",
     JSON.stringify(dealt));

  ok(errs.length === 0, "no console errors", errs.slice(0, 3).join(" | "));
  await pg.screenshot({ path: "/tmp/italian-combined.png", fullPage: false });

  await browser.close();
  server.close();
  console.log(fails ? `\n✗ ${fails} of ${checks} checks failed`
                    : `\n✓ all ${checks} checks passed`);
  process.exit(fails ? 1 : 0);
})();
