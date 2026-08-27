/* gloss-io.js — load and write the glossary, which is TWO files.
 *
 * The glossary's citations and illustrations were split out of glossary.js into the lazy
 * glossary-extra.js, because together they were 54% of a file on the EAGER load path and
 * neither is read until a popup opens (see .claude/split-glossary.js).
 *
 * That split has one consequence for every helper script here, and it is silent:
 * `require("../glossary.js")` now yields EMPTY GLOSSARY_SOURCES and GLOSSARY_IMAGES.
 * A reader script then reports a fully-cited glossary as having no citations at all; a
 * WRITER script re-serialises the file it loaded and deletes 1.29 MB of real content
 * without erroring. Nothing throws either way.
 *
 * So every script goes through here instead:
 *
 *   const { loadGlossary, writeGlossary, EXTRA_KEYS } = require("./gloss-io.js");
 *   const win = loadGlossary();          // both files, merged, exactly as the browser sees them
 *   ...mutate win.GLOSSARY_SOURCES etc...
 *   writeGlossary(win, mainText);        // mainText = your serialised glossary.js, minus the two
 *
 * Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const MAIN = path.join(ROOT, "glossary.js");
const EXTRA = path.join(ROOT, "glossary-extra.js");
const EXTRA_KEYS = ["GLOSSARY_IMAGES", "GLOSSARY_SOURCES"];

/* Load glossary.js and glossary-extra.js into one window, draining the staging queue the
   way app.js's glossExtraIngest does. Returns the window object. */
function loadGlossary(win) {
  const w = win || {};
  vm.runInNewContext(fs.readFileSync(MAIN, "utf8"), { window: w }, { timeout: 30000 });
  if (fs.existsSync(EXTRA)) {
    vm.runInNewContext(fs.readFileSync(EXTRA, "utf8"), { window: w }, { timeout: 30000 });
    for (const inc of w.GLOSSARY_EXTRA_IN || [])
      for (const k of EXTRA_KEYS) w[k] = Object.assign(w[k] || {}, inc[k] || {});
    delete w.GLOSSARY_EXTRA_IN;
  }
  for (const k of EXTRA_KEYS) w[k] = w[k] || {};
  return w;
}

/* The head comment and shape are kept in step with app.js's serializeGlossaryExtra by hand;
   both write the same file, and `node .claude/split-glossary.js --check` verifies the result
   loads and carries its keys whichever wrote it. */
function serializeExtra(win) {
  const ob = (o) => "{\n" + Object.keys(o).map((k) => JSON.stringify(k) + ": " + JSON.stringify(o[k])).join(",\n") + "\n}";
  return `/* The glossary's CITATIONS and ILLUSTRATIONS — split out of glossary.js and LAZY.
 *
 * WHY THIS FILE EXISTS. glossary.js is on the eager load path, so every visitor downloads it
 * before flipping a card, and these two tables were 54% of it. Neither is read until a glossary
 * popup OPENS. They are fetched now by the \`glossExtra\` data bundle: warmed at idle after boot,
 * and awaited by openGlossWin for the reader who opens a popup before the warm lands.
 *
 * IT STAGES ONTO A QUEUE RATHER THAN ASSIGNING, for the same reason i18n/gloss-<lang>.js does.
 * app.js snapshots PRISTINE_GLOSS_SOURCES / PRISTINE_GLOSS_IMAGES at boot — which is BEFORE this
 * file lands — so a plain assignment would leave the admin editor's revert baseline empty and
 * "Revert" would silently delete a shipped citation list instead of restoring it. The bundle's
 * \`after\` hook (glossExtraIngest) drains the queue, re-seeds those baselines and re-applies the
 * admin overlay on top.
 *
 * GENERATED — do not hand-edit. Written by .claude/gloss-io.js (the helper scripts) and by
 * app.js's serializeGlossaryExtra (the in-app editor). \`node .claude/split-glossary.js --check\`
 * verifies the split is still intact. */
(function () {
  var GLOSSARY_IMAGES = ${ob(win.GLOSSARY_IMAGES || {})};
  var GLOSSARY_SOURCES = ${ob(win.GLOSSARY_SOURCES || {})};
  (window.GLOSSARY_EXTRA_IN = window.GLOSSARY_EXTRA_IN || []).push({ GLOSSARY_IMAGES: GLOSSARY_IMAGES, GLOSSARY_SOURCES: GLOSSARY_SOURCES });
})();
`;
}

/* Write both files. `mainText` is the caller's serialised glossary.js; if it still carries a
   GLOSSARY_IMAGES or GLOSSARY_SOURCES block that block is STRIPPED, because leaving it there
   puts 1.29 MB back on the eager path and the only symptom is a slower site. */
function writeGlossary(win, mainText) {
  let main = mainText;
  for (const k of EXTRA_KEYS) {
    const rx = new RegExp("\\n*window\\." + k + " *= *Object\\.assign\\(window\\." + k + " *\\|\\| *\\{\\}, *\\{[\\s\\S]*?\\n\\}\\);\\n", "g");
    main = main.replace(rx, "\n");
  }
  fs.writeFileSync(MAIN, main.replace(/\n{3,}/g, "\n\n"));
  fs.writeFileSync(EXTRA, serializeExtra(win));
}

module.exports = { loadGlossary, writeGlossary, serializeExtra, EXTRA_KEYS, MAIN, EXTRA, ROOT };
