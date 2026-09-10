/* ============================================================================
   card-io.js — THE ONE DOOR TO THE CARD CORPUS, for every helper in .claude/.

     const { loadCards, writeCards, EXTRA_FIELDS, extraFileFor } = require("./card-io");

   WHY IT EXISTS. `data.js` is split: the light half (id, question, answer, date
   line, tags, difficulty, facts, map, locator …) stays there on the eager load
   path, and the heavy half — `abstract`, `sources`, `why`, `quote`, and every
   non-artwork card's `image` — lives in `data-extra/<prefix>.js`, one file per
   collection, fetched only when a reader actually reveals a card in it.

   That split makes `require("../data.js")` a TRAP, in both directions, and this
   module is what closes it:

   · A READER that loads data.js alone now sees every card with an EMPTY
     abstract and no sources, and will report a fully cited corpus as uncited.
     `gloss-source-audit.js` did exactly that on its first run after the
     glossary split and printed "0 of 100 cited" while 80 assertions passed over
     an empty list.
   · A WRITER that loads data.js alone, changes one field and re-serialises what
     it loaded DELETES 12.6 MB without erroring. This is not hypothetical:
     `add-card-tags.js` once kept a private copy of a field list and stripped
     `difficulty` and `undatable` from all 500 cards in a single run, and the
     only symptom was every minigame's pool quietly emptying.

   So `loadCards()` returns whole cards with the two halves joined on `id`, and
   `writeCards()` writes BOTH halves or neither. Never require `data.js`
   directly from a helper.

   THE SPLIT IS BY COLLECTION, NOT ONE BIG FILE, and that is the point. A single
   `data-extra.js` would be 3.16 MB gzipped warmed at idle for every visitor —
   bigger than the whole rest of the eager path. Per collection, a reader
   studying Ancient Greece fetches Greece's 0.7 MB and nothing else. The prefix
   is the card id's own leading segment (`gr-001` → `gr`), which is already how
   every plan, every helper and every next-id command addresses the corpus.

   AN ARTWORK CARD'S `image` STAYS EAGER, and that is a rule rather than an
   exception to tidy away later: on an artwork card the picture IS the question
   (`cardArtSpec`), so it is needed to draw the card's FRONT, where every other
   card's picture illustrates its answer. Six cards carry it and it costs 10 KB.
   ============================================================================ */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data.js");
const EXTRA_DIR = path.join(ROOT, "data-extra");

/* The fields that move. Keep this list in step with app.js's own CARD_EXTRA_FIELDS
   — the two are compared by .claude/split-cards.js --check, which fails if they
   have drifted, because a field app.js expects lazily and the splitter leaves
   eager is a field that silently doubles. */
const EXTRA_FIELDS = ["abstract", "sources", "why", "quote", "image"];

/* An artwork card's picture is its question, so it never moves. */
const keepsImage = (c) => !!c.artwork;

const prefixOf = (id) => String(id).replace(/-\d+$/, "");
const extraFileFor = (id) => path.join(EXTRA_DIR, prefixOf(id) + ".js");

function readGlobal(file, name) {
  const src = fs.readFileSync(file, "utf8");
  const sandbox = { window: {} };
  // eslint-disable-next-line no-new-func
  new Function("window", src)(sandbox.window);
  return sandbox.window[name];
}

/* ---- load ---------------------------------------------------------------- */

function loadCards() {
  const win = {};
  // eslint-disable-next-line no-new-func
  new Function("window", fs.readFileSync(DATA, "utf8"))(win);
  const cards = win.CARD_DATA || [];
  const tree = win.COLLECTION_TREE;

  if (fs.existsSync(EXTRA_DIR)) {
    for (const f of fs.readdirSync(EXTRA_DIR).filter((f) => f.endsWith(".js"))) {
      const w = { CARD_EXTRA_IN: [] };
      // eslint-disable-next-line no-new-func
      new Function("window", fs.readFileSync(path.join(EXTRA_DIR, f), "utf8"))(w);
      for (const inc of w.CARD_EXTRA_IN) {
        const t = inc.CARD_EXTRA || {};
        /* data.js WINS where it carries the field. The merge fills gaps; it does not overwrite.
           This matters the moment a writer splices a heavy field back into data.js (which several
           still do, line by line) and then re-splits: clobbering would silently restore the stale
           copy from data-extra and throw the edit away. */
        for (const c of cards) {
          const row = t[c.id];
          if (!row) continue;
          for (const k of Object.keys(row)) if (c[k] === undefined) c[k] = row[k];
        }
      }
    }
  }
  return { cards, tree };
}

/* ---- write --------------------------------------------------------------- */

/* Serialise a card with its keys in a STABLE order: the order they appear in
   the first card that has them, so a whole-file rewrite does not reorder every
   line and turn a one-card change into a 2,895-line diff. */
function orderedStringify(card, order) {
  const keys = Object.keys(card).sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    return (ia === -1 ? 1e9 : ia) - (ib === -1 ? 1e9 : ib);
  });
  const o = {};
  for (const k of keys) o[k] = card[k];
  return JSON.stringify(o);
}

/* ============================================================================
   THE GUARD THAT MAKES THE COMMONEST CATASTROPHE IMPOSSIBLE (Sep 2026).

   Twenty-one helpers in this directory read data.js with `new Function("window", src)(win)`. Inside a
   MODULE that body sees neither `require` nor `__dirname`, so data.js's own rejoin block never runs and
   what comes back is the LIGHT half: every card with no abstract, no sources, no `why`, no picture.
   Hand THAT set to this function and it serialises a data-extra with nothing in it — 12.6 MB deleted,
   no error thrown, and every card still rendering its question, its answer and its date line. It
   happened, in a run that was otherwise perfect, and it took a restore from git.

   So the write now compares what it has been given with what the corpus already holds, field by field,
   and REFUSES when it is being asked to drop heavy fields wholesale. A genuine removal — retiring a
   card, clearing one abstract — passes; losing them all cannot. `{ allowLoss: true }` is the explicit
   way to say a large removal is meant, and no helper here passes it.
   ============================================================================ */
function heavyCount(list) {
  let n = 0;
  for (const c of list || []) for (const k of EXTRA_FIELDS) if (c[k] !== undefined) n++;
  return n;
}

function writeCards(cards, tree, opts) {
  if (!(opts && opts.allowLoss)) {
    let had = 0;
    try { had = heavyCount(loadCards().cards); } catch (e) { had = 0; }
    const has = heavyCount(cards);
    /* A tenth of the corpus is far more than any real edit removes and far less than the light half
       reports, which is zero. The message names the cause, because the cause is always the same one. */
    if (had > 100 && has < had * 0.9) {
      throw new Error(
        "card-io: refusing to write — the cards handed in carry " + has + " heavy fields where the corpus holds " + had + ".\n" +
        "  This is what loading data.js with `new Function` inside a module looks like: that body cannot see\n" +
        "  `require`, so the file's rejoin block never runs and every abstract, source, `why` and picture is\n" +
        "  missing. Load through loadCards(). If the removal is genuinely meant, pass { allowLoss: true }.");
    }
  }
  const order = [];
  for (const c of cards) for (const k of Object.keys(c)) if (!order.includes(k)) order.push(k);

  const light = [];
  const heavy = {};   // prefix -> { id -> {fields} }

  for (const c of cards) {
    const l = {}, h = {};
    for (const k of Object.keys(c)) {
      const moves = EXTRA_FIELDS.includes(k) && !(k === "image" && keepsImage(c));
      if (moves) h[k] = c[k]; else l[k] = c[k];
    }
    light.push(l);
    if (Object.keys(h).length) {
      const p = prefixOf(c.id);
      (heavy[p] = heavy[p] || {})[c.id] = h;
    }
  }

  /* THE NODE-ONLY REJOIN BLOCK IS WRITTEN BY THIS FUNCTION, not preserved from the file (Sep 2026).
     It was appended once, by hand, and then SILENTLY DELETED by the first writer that rebuilt data.js
     from a template of its own — `add-images.js`, in a run that was otherwise perfect. Nothing broke
     that day: the block does nothing in a browser, and under Node its absence only means the next
     helper to `require("../data.js")` sees every abstract as empty and reports a fully cited corpus as
     uncited. Owning it here means a writer cannot lose it by forgetting it exists. */
  const REJOIN = `/* ============================================================================
   NODE-ONLY: rejoin the lazy half, so a helper that requires this file sees WHOLE cards.

   In a BROWSER this block does nothing — there is no \`require\` and no \`__dirname\`, and the
   heavy half arrives through the \`cardExtra:<collection>\` bundles when a reader actually
   reveals a card (see CARD_EXTRA_FIELDS in app.js).

   Under NODE it is what stops the split silently breaking forty helpers at once. A READER
   that saw only the light half would report a fully cited corpus as uncited — \`gloss-source-audit.js\`
   did exactly that after the glossary split, printing "0 of 100 cited" while its assertions
   passed over an empty list. This makes \`require("../data.js")\` keep meaning what it always meant.

   IT DOES NOT MAKE WRITING SAFE, and nothing here can. A helper that re-serialises what it
   loaded would write the heavy fields back into this file and undo the split — so every WRITER
   goes through \`.claude/card-io.js\`'s writeCards(), and \`split-cards.js --check\` (which CI runs)
   fails the build if a heavy field reappears here.
   ============================================================================ */
try {
  if (typeof require === "function" && typeof __dirname === "string" && typeof document === "undefined") {
    var _fs = require("fs"), _p = require("path");
    var _dir = _p.join(__dirname, "data-extra");
    if (_fs.existsSync(_dir)) {
      var _by = {};
      window.CARD_DATA.forEach(function (c) { _by[c.id] = c; });
      _fs.readdirSync(_dir).filter(function (f) { return /\\.js$/.test(f); }).forEach(function (f) {
        var _w = { CARD_EXTRA_IN: [] };
        new Function("window", _fs.readFileSync(_p.join(_dir, f), "utf8"))(_w);
        _w.CARD_EXTRA_IN.forEach(function (inc) {
          Object.keys(inc.CARD_EXTRA || {}).forEach(function (id) {
            var _c = _by[id]; if (!_c) return;
            // fill gaps only — data.js wins where it carries the field (see card-io.js)
            Object.keys(inc.CARD_EXTRA[id]).forEach(function (k) { if (_c[k] === undefined) _c[k] = inc.CARD_EXTRA[id][k]; });
          });
        });
      });
    }
  }
} catch (e) { /* a helper running this through new Function has no require — it uses card-io.js */ }`;
  // data.js — one card per line, the tree spliced back verbatim, and the rejoin block after it
  const prev = fs.readFileSync(DATA, "utf8");
  const treeAt = prev.indexOf("\nwindow.COLLECTION_TREE");
  let tail = treeAt >= 0 ? prev.slice(treeAt + 1) : "window.COLLECTION_TREE = " + JSON.stringify(tree, null, 1) + ";\n";
  const rejoinAt = tail.indexOf("/* ===================");
  if (rejoinAt >= 0) tail = tail.slice(0, rejoinAt);
  tail = tail.replace(/\n+$/, "\n") + "\n" + REJOIN + "\n";
  const head =
    "/* Card data — the LIGHT half. Add cards one at a time with `node .claude/add-card.js <card.json> [deckId]`.\n" +
    " *\n" +
    " * The heavy half of every card — abstract, sources, why, quote, and a non-artwork card's image —\n" +
    " * lives in data-extra/<collection>.js and is fetched only when a reader reveals a card in that\n" +
    " * collection. Nothing here reads those fields; nothing there is needed to deal or draw a card FRONT.\n" +
    " * Read .claude/card-io.js before touching either file, and never require this one directly from a\n" +
    " * helper: a reader that does sees every abstract as empty, and a writer that does deletes 12.6 MB\n" +
    " * without erroring. */\n" +
    "window.CARD_DATA = [\n";
  fs.writeFileSync(DATA, head + light.map((c) => orderedStringify(c, order)).join(",\n") + "\n];\n\n" + tail);

  // data-extra/<prefix>.js
  fs.mkdirSync(EXTRA_DIR, { recursive: true });
  const want = new Set(Object.keys(heavy).map((p) => p + ".js"));
  for (const f of fs.readdirSync(EXTRA_DIR)) if (f.endsWith(".js") && !want.has(f)) fs.unlinkSync(path.join(EXTRA_DIR, f));

  for (const [p, rows] of Object.entries(heavy)) {
    const body =
      "/* The heavy half of the " + p + " cards — GENERATED, never hand-edited.\n" +
      " *\n" +
      " * abstract / sources / why / quote / image, for the cards whose ids begin `" + p + "-`. None of it is\n" +
      " * read until a reader REVEALS a card in this collection, so it is fetched then (bundle\n" +
      " * `cardExtra:" + p + "`) rather than downloaded by every visitor before they can flip one.\n" +
      " *\n" +
      " * IT STAGES ONTO A QUEUE rather than assigning, for the reason glossary-extra.js does: app.js\n" +
      " * snapshots PRISTINE_CARDS at boot, which is BEFORE this file lands, so a plain assignment would\n" +
      " * leave the editor's revert baseline empty and Revert would DELETE a shipped abstract rather than\n" +
      " * restore it. cardExtraIngest drains the queue and re-seeds that baseline.\n" +
      " *\n" +
      " * An id data.js does not carry is not resurrected — the light half decides what a card is. */\n" +
      "(function () {\n" +
      "  var CARD_EXTRA = {\n" +
      Object.entries(rows).map(([id, v]) => "    " + JSON.stringify(id) + ": " + JSON.stringify(v)).join(",\n") +
      "\n  };\n" +
      "  (window.CARD_EXTRA_IN = window.CARD_EXTRA_IN || []).push({ CARD_EXTRA: CARD_EXTRA });\n" +
      "})();\n";
    fs.writeFileSync(path.join(EXTRA_DIR, p + ".js"), body);
  }

  // re-parse both halves before returning, so a helper can never leave the corpus unloadable
  const back = loadCards();
  if (back.cards.length !== cards.length) throw new Error("card-io: wrote " + cards.length + " and read back " + back.cards.length);
  return { files: 1 + Object.keys(heavy).length };
}

/* Re-split after a helper has spliced a change straight into data.js. Every writer calls this as
   its last act: without it a heavy field edited line-by-line stays in data.js, the file re-fattens
   one card at a time, and `split-cards.js --check` fails on the next CI run. */
function resplit() {
  const { cards, tree } = loadCards();
  return writeCards(cards, tree);
}

module.exports = { loadCards, writeCards, resplit, EXTRA_FIELDS, extraFileFor, prefixOf, keepsImage, DATA, EXTRA_DIR };
