/* gloss-io.js — load and write the glossary, which is TWO files.
 *
 * The glossary's citations and illustrations were split out of glossary.js into the lazy
 * glossary-extra.js, because together they were 54% of a file on the EAGER load path and
 * neither is read until a popup opens (see .claude/split-glossary.js). In Oct 2026 the
 * DEFINITIONS followed them: the texts were 87% of what was left of glossary.js, and nothing
 * reads one before a popup, the glossary page, the search or a game asks for it. glossary.js now
 * carries every KEY with an EMPTY STRING for its text — the key set is what the auto-linker, the
 * progress meters and `k in window.GLOSSARY` everywhere need at boot — and glossary-extra.js
 * carries the texts under the same global's name, `GLOSSARY`, in its staging queue.
 *
 * That split has one consequence for every helper script here, and it is silent:
 * `require("../glossary.js")` run through `new Function` or `vm` yields an EMPTY text for every
 * term and EMPTY GLOSSARY_SOURCES / GLOSSARY_IMAGES. A reader script then reports a fully-written
 * glossary as blank; a WRITER script re-serialises the file it loaded and deletes 5.5 MB of real
 * content without erroring. Nothing throws either way. (A plain Node `require` of glossary.js is
 * safe: the file's own Node-only tail rejoins the halves, exactly as data.js's does.)
 *
 * So every script goes through here instead:
 *
 *   const { loadGlossary, writeGlossary, EXTRA_KEYS } = require("./gloss-io.js");
 *   const win = loadGlossary();          // both files, merged, exactly as the browser sees them
 *   ...mutate win.GLOSSARY / win.GLOSSARY_SOURCES etc...
 *   writeGlossary(win, mainText);        // mainText = your serialised glossary.js — texts and all;
 *                                        // the texts are BLANKED here and written to the lazy file
 *
 * writeGlossary REFUSES a window whose GLOSSARY carries no text (a caller that loaded glossary.js
 * alone), because the only other outcome is a glossary-extra.js with every definition deleted.
 *
 * Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const MAIN = path.join(ROOT, "glossary.js");
const EXTRA = path.join(ROOT, "glossary-extra.js");
/* The keys the lazy file stages. GLOSSARY is the texts of the eager table's keys; the other two
   are whole tables that the eager file no longer carries at all. */
const EXTRA_KEYS = ["GLOSSARY", "GLOSSARY_IMAGES", "GLOSSARY_SOURCES"];
const BLOCK_KEYS = ["GLOSSARY_IMAGES", "GLOSSARY_SOURCES"];   // the two that must never reappear as blocks in glossary.js

/* Load glossary.js and glossary-extra.js into one window, draining the staging queue the
   way app.js's glossExtraIngest does. Returns the window object. */
function loadGlossary(win) {
  const w = win || {};
  vm.runInNewContext(fs.readFileSync(MAIN, "utf8"), { window: w }, { timeout: 30000 });
  if (fs.existsSync(EXTRA)) {
    vm.runInNewContext(fs.readFileSync(EXTRA, "utf8"), { window: w }, { timeout: 30000 });
    for (const inc of w.GLOSSARY_EXTRA_IN || []) {
      // a text for a key glossary.js no longer carries is a RETIRED term and stays retired: the eager
      // file decides what a term is, exactly as data.js decides what a card is
      const G = (w.GLOSSARY = w.GLOSSARY || {});
      for (const k of Object.keys(inc.GLOSSARY || {})) if (k in G) G[k] = inc.GLOSSARY[k];
      for (const k of BLOCK_KEYS) w[k] = Object.assign(w[k] || {}, inc[k] || {});
    }
    delete w.GLOSSARY_EXTRA_IN;
  }
  for (const k of EXTRA_KEYS) w[k] = w[k] || {};
  return w;
}

/* The Node-only tail that glossary.js carries so a plain `require` of it sees whole terms.
   writeGlossary appends it to any glossary.js that lacks it, so a writer that rebuilds the file
   from a template of its own cannot lose it by forgetting it exists (data.js learned this the hard
   way — see docs/eager-path.md). Kept in step with app.js's serializeGlossary by hand. */
const REJOIN_TAIL = `
/* ============================================================================
   NODE-ONLY: rejoin the lazy half, so a helper that requires this file sees WHOLE terms.

   In a BROWSER this block does nothing — there is no \`require\` and no \`__dirname\`, and the texts,
   citations and pictures arrive through the \`glossExtra\` bundle (glossary-extra.js), warmed at
   idle after boot and awaited by whatever needs one before the warm lands.

   Under NODE it is what stops the split silently blinding the helpers that \`require\` this file:
   without it every term reads as an empty string and a checker passes over nothing. A helper that
   evaluates the file through \`new Function\` or \`vm\` has no \`require\` here and must go through
   .claude/gloss-io.js instead, which merges the two files itself.

   IT DOES NOT MAKE WRITING SAFE, and nothing here can: every WRITER goes through gloss-io.js's
   writeGlossary(), which blanks the texts in this file and writes them to the lazy one, and
   \`node .claude/split-glossary.js --check\` (which CI runs) fails if a text reappears here.
   ============================================================================ */
try {
  if (typeof require === "function" && typeof __dirname === "string" && typeof document === "undefined") {
    var _fs = require("fs"), _p = require("path"), _f = _p.join(__dirname, "glossary-extra.js");
    if (_fs.existsSync(_f)) {
      var _w = { GLOSSARY_EXTRA_IN: [] };
      new Function("window", _fs.readFileSync(_f, "utf8"))(_w);
      _w.GLOSSARY_EXTRA_IN.forEach(function (inc) {
        var G = window.GLOSSARY || {}, T = inc.GLOSSARY || {};
        // texts for the keys this file carries — a key it has dropped is a retired term and stays out
        Object.keys(T).forEach(function (k) { if (k in G && !G[k]) G[k] = T[k]; });
        ["GLOSSARY_IMAGES", "GLOSSARY_SOURCES"].forEach(function (k) { window[k] = Object.assign(window[k] || {}, inc[k] || {}); });
      });
    }
  }
} catch (e) { /* a helper running this through new Function has no require — it uses gloss-io.js */ }
`;
const TAIL_MARK = "NODE-ONLY: rejoin the lazy half";

/* Blank every text in the `window.GLOSSARY = {…};` block of a serialised glossary.js, keeping the
   keys, their order and their lines. The block is one entry per line, \`"key": "text",\` — JSON on
   both sides, so a value never spans lines — and a line in any other shape is refused rather than
   guessed at, because the alternative is a text that quietly ships eagerly. */
function blankDefs(main) {
  const lines = main.split("\n");
  const a = lines.findIndex((l) => /^window\.GLOSSARY *= *\{\s*$/.test(l));
  if (a < 0) throw new Error("gloss-io: glossary.js has no `window.GLOSSARY = {` block to blank");
  let b = -1;
  for (let i = a + 1; i < lines.length; i++) if (/^\};?\s*$/.test(lines[i])) { b = i; break; }
  if (b < 0) throw new Error("gloss-io: the GLOSSARY block never closes");
  const entry = /^("(?:[^"\\]|\\.)*"): "(?:[^"\\]|\\.)*"(,?)\s*$/;
  for (let i = a + 1; i < b; i++) {
    if (!lines[i].trim()) continue;
    const m = lines[i].match(entry);
    if (!m) throw new Error("gloss-io: line " + (i + 1) + " of the GLOSSARY block is not `\"key\": \"text\"` — refusing to blank it: " + lines[i].slice(0, 80));
    lines[i] = m[1] + ': ""' + m[2];
  }
  return lines.join("\n");
}

/* The head comment and shape are kept in step with app.js's serializeGlossaryExtra by hand;
   both write the same file, and `node .claude/split-glossary.js --check` verifies the result
   loads and carries its keys whichever wrote it. */
function serializeExtra(win) {
  const ob = (o) => "{\n" + Object.keys(o).map((k) => JSON.stringify(k) + ": " + JSON.stringify(o[k])).join(",\n") + "\n}";
  return `/* The glossary's DEFINITIONS, CITATIONS and ILLUSTRATIONS — split out of glossary.js and LAZY.
 *
 * WHY THIS FILE EXISTS. glossary.js is on the eager load path, so every visitor downloads it
 * before flipping a card. The citations and illustrations were 54% of it and moved here in Sep
 * 2026; the definitions were 87% of what remained and followed in Oct 2026. None of the three is
 * read until a glossary popup OPENS, the glossary page or the search is used, or a game shows a
 * term's note. glossary.js keeps every KEY (with an empty text), which is what the auto-linker and
 * \`k in window.GLOSSARY\` need at boot. All three are fetched by the \`glossExtra\` data bundle:
 * warmed at idle after boot, and awaited by openGlossWin and the pages for the reader who gets
 * there before the warm lands.
 *
 * IT STAGES ONTO A QUEUE RATHER THAN ASSIGNING, for the same reason i18n/gloss-<lang>.js does.
 * app.js snapshots PRISTINE_GLOSS / PRISTINE_GLOSS_SOURCES / PRISTINE_GLOSS_IMAGES at boot — which
 * is BEFORE this file lands — so a plain assignment would leave the admin editor's revert baseline
 * empty and "Revert" would silently delete a shipped definition instead of restoring it. The
 * bundle's \`after\` hook (glossExtraIngest) drains the queue, re-seeds those baselines and re-applies
 * the admin overlay on top.
 *
 * GENERATED — do not hand-edit. Written by .claude/gloss-io.js (the helper scripts) and by
 * app.js's serializeGlossaryExtra (the in-app editor). \`node .claude/split-glossary.js --check\`
 * verifies the split is still intact. */
(function () {
  var GLOSSARY = ${ob(win.GLOSSARY || {})};
  var GLOSSARY_IMAGES = ${ob(win.GLOSSARY_IMAGES || {})};
  var GLOSSARY_SOURCES = ${ob(win.GLOSSARY_SOURCES || {})};
  (window.GLOSSARY_EXTRA_IN = window.GLOSSARY_EXTRA_IN || []).push({ GLOSSARY: GLOSSARY, GLOSSARY_IMAGES: GLOSSARY_IMAGES, GLOSSARY_SOURCES: GLOSSARY_SOURCES });
})();
`;
}

/* Write both files. `mainText` is the caller's serialised glossary.js, texts and all: the texts
   are blanked here (they ship in glossary-extra.js), the Node rejoin tail is appended if the
   caller's template lacks it, and if the text still carries a GLOSSARY_IMAGES or GLOSSARY_SOURCES
   block that block is STRIPPED, because leaving it there puts 1.29 MB back on the eager path and
   the only symptom is a slower site. */
function writeGlossary(win, mainText) {
  const G = win.GLOSSARY || {};
  const n = Object.keys(G).length, filled = Object.keys(G).filter((k) => G[k]).length;
  if (n && filled < n / 2) {
    throw new Error("gloss-io: refusing to write — win.GLOSSARY holds text for " + filled + " of " + n +
      " terms. Load through loadGlossary(), never glossary.js alone, or the lazy file is written empty.");
  }
  let main = mainText;
  for (const k of BLOCK_KEYS) {
    const rx = new RegExp("\\n*window\\." + k + " *= *Object\\.assign\\(window\\." + k + " *\\|\\| *\\{\\}, *\\{[\\s\\S]*?\\n\\}\\);\\n", "g");
    main = main.replace(rx, "\n");
  }
  main = blankDefs(main);
  main = main.replace(/\n{3,}/g, "\n\n");
  if (main.indexOf(TAIL_MARK) < 0) main = main.replace(/\s*$/, "\n") + REJOIN_TAIL;
  fs.writeFileSync(MAIN, main);
  fs.writeFileSync(EXTRA, serializeExtra(win));
}

module.exports = { loadGlossary, writeGlossary, serializeExtra, blankDefs, EXTRA_KEYS, BLOCK_KEYS, REJOIN_TAIL, TAIL_MARK, MAIN, EXTRA, ROOT };
