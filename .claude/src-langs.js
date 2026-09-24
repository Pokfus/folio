/*
  THE LANGUAGES A CITATION MAY DECLARE ITSELF TO BE IN, read out of app.js rather than restated here.

  A non-English source carries a bracketed marker at the end of its Chicago note — `[in French]`,
  `[in Chinese]` — which app.js lifts out into a chip beside the `[Open access]` one (see SRC_LANG_RX
  there, and the long comment above it for why the language is DECLARED rather than guessed from the
  work's title). This module is what lets the content tools refuse a marker app.js cannot draw.

  IT SLICES THE LIST AND STOPS IF THE SLICE FAILS, which is the house rule for a rule two files enforce
  (`add-card.js`'s IMPERIAL_PAREN, `check-cards.js`'s exemptions, `spanish-fix.js`'s SPELL_PAIRS): a
  second copy of a 44-row word list goes stale on a change made in a file nobody editing a citation has
  reason to open, and the two would then disagree about which languages exist. A typo would then ship as
  a citation with no chip — the quietest failure this feature has, since nothing on the page says a chip
  was meant to be there.

  Not part of the site.
*/
const fs = require("fs");
const path = require("path");

const APP = path.join(__dirname, "..", "app.js");

function sliceLangs() {
  const src = fs.readFileSync(APP, "utf8");
  const m = src.match(/const SRC_LANG_NAMES = \[([\s\S]*?)\];/);
  if (!m) {
    console.error("ERROR: could not slice SRC_LANG_NAMES out of app.js — the tools and the site would disagree about which languages a citation may declare.");
    process.exit(2);
  }
  let names;
  try { names = eval("[" + m[1] + "]"); } catch (e) { names = null; }
  if (!Array.isArray(names) || !names.length || names.some((n) => typeof n !== "string")) {
    console.error("ERROR: SRC_LANG_NAMES in app.js did not parse as a list of language names.");
    process.exit(2);
  }
  return names;
}

const LANGS = sliceLangs();
const LANG_SET = new Set(LANGS);
// the same shape app.js builds, so a tool tests exactly what the page will draw
const LANG_RX = new RegExp("\\[in (" + LANGS.join("|") + ")\\]", "g");
// anything bracketed that OPENS on "in " — used to catch a marker whose language app.js does not know
const LANG_CANDIDATE_RX = /\[in ([^\]]+)\]/g;

/* The language a citation declares, or null. Returns the FIRST — a work is in one language, and a
   citation carrying two markers is an error the caller reports rather than a fact to average. */
function declaredLang(s) {
  LANG_RX.lastIndex = 0;
  const m = LANG_RX.exec(String(s || ""));
  return m ? m[1] : null;
}

/* Every `[in …]` marker in a citation, declared or not, so a caller can tell "no marker" from
   "a marker naming a language app.js cannot draw". */
function markers(s) {
  const out = [];
  LANG_CANDIDATE_RX.lastIndex = 0;
  let m;
  while ((m = LANG_CANDIDATE_RX.exec(String(s || "")))) out.push(m[1]);
  return out;
}

/* The one check a tool runs over a citation: null when it is fine, else a sentence saying what is
   wrong. A citation with NO marker is fine — English is the corpus's default and the overwhelming
   majority, so silence is the honest state rather than a fault. */
function checkCitationLang(s) {
  const found = markers(s);
  if (!found.length) return null;
  if (found.length > 1) return "carries " + found.length + " language markers (" + found.join(", ") + "); a work is in one language";
  if (!LANG_SET.has(found[0])) {
    return "declares [in " + found[0] + "], which app.js cannot draw — it would ship as a citation with no chip at all. " +
      "Use one of the names in SRC_LANG_NAMES, or add it there first.";
  }
  return null;
}

module.exports = { LANGS, LANG_SET, LANG_RX, declaredLang, markers, checkCitationLang };
