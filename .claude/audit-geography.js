// Dev-only: audit the three GEOGRAPHY collections against the house rules, and against the refinement
// rules asked for in Sep 2026. Run: node .claude/audit-geography.js [--deck=<id>] [--rule=<n>] [--verbose]
//
// It exists for the reason check-sizes.js does: 626 map cards cannot be read by eye, and every fault it
// looks for is one that renders perfectly. A card ordered wrongly in its deck, a date line that
// contradicts its own background, an image that shows a museum instead of the place, a citation whose
// author is on the card three times — none of them throws, and none of them is visible in a screenshot.
//
// IT REPORTS AND NEVER FIXES. Several of its rules are proxies for a judgement (is this picture OF the
// place? is this question the simplest phrasing?) and a --fix that acted on a proxy would do damage no
// test could see. Exit 1 on any finding in the MECHANICAL rules (1-4), 0 on the judgement ones, so it can
// gate a batch without failing a build on a list of things to read.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
global.window = {};
require(path.join(ROOT, "data.js"));
const CARDS = window.CARD_DATA, TREE = window.COLLECTION_TREE;
const BY = {}; CARDS.forEach((c) => (BY[c.id] = c));

const argv = process.argv.slice(2);
const only = (argv.find((a) => a.startsWith("--deck=")) || "").split("=")[1] || null;
const ruleOnly = (argv.find((a) => a.startsWith("--rule=")) || "").split("=")[1] || null;
const verbose = argv.includes("--verbose");

function leaves(n, out) { if (n.cardIds && n.cardIds.length) out.push(n); (n.children || []).forEach((c) => leaves(c, out)); return out; }
const DECKS = [];
TREE.collections.forEach((n) => leaves(n, DECKS));
const GEO = DECKS.filter((d) => /^(geo|gw|gc)-/.test((d.cardIds || [])[0] || "")).filter((d) => !only || d.id === only);

const strip = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
let findings = 0, mechanical = 0;
function say(rule, hard, id, msg) {
  findings++; if (hard) mechanical++;
  console.log("  " + (hard ? "!" : "?") + " " + String(id).padEnd(9) + " " + msg);
}
function head(n, title) { console.log("\n" + n + ". " + title); }
const want = (n) => !ruleOnly || String(n) === ruleOnly;

/* THE POPULATION A CARD ITSELF GIVES, which is the figure the deck is ordered on. A second-seat card
   carries no Population row (its box is Country / Region / Status / Other seat), and a card whose figure
   is a range or a two-part count takes the first number — the same rule the difficulty banding uses. */
const BY_NAME = {};
CARDS.forEach((c) => { if (/^(gw|geo|gc)-/.test(c.id) && c.answerText) BY_NAME[c.answerText] = c; });
const popNum = (v) => {
  const m = String(v).replace(/,/g, "").match(/([\d.]+)\s*(million|billion|B|M|k)?/i);
  if (!m) return null;
  let x = parseFloat(m[1]); const u = (m[2] || "").toLowerCase();
  if (u === "million" || u === "m") x *= 1e6;
  if (u === "billion" || u === "b") x *= 1e9;
  if (u === "k") x *= 1e3;
  return x;
};
function cardPop(c) {
  const f = c.facts || [];
  for (const re of [/^population$/i, /pop\.$/i, /^city and county$/i, /^urban core$/i]) {
    const r = f.find((x) => re.test(x[0]));
    if (r) { const v = popNum(r[1]); if (v !== null) return v; }
  }
  const cr = f.find((x) => /^(country|territory|state|province)$/i.test(x[0]));
  if (cr) { const o = BY_NAME[String(cr[1]).split(",")[0].trim()]; if (o && o !== c) return cardPop(o); }
  return null;
}
/* A CAPITAL CARD THAT GIVES NO FIGURE OF ITS OWN is a note rather than a fault: for a village that is a
   seat of government there is often no published count, and the card says whose figure it is showing. */
function ownFigure(c) { return (c.facts || []).some((r) => /^population$/i.test(r[0])); }

/* 1. DECK ORDER, largest population first. */
if (want(1)) {
  head(1, "Deck order — largest population first");
  for (const d of GEO) {
    const rows = d.cardIds.map((i) => [i, cardPop(BY[i])]);
    const missing = rows.filter((r) => r[1] === null).map((r) => r[0]);
    let bad = 0;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] !== null && rows[i - 1][1] !== null && rows[i][1] > rows[i - 1][1]) {
        bad++;
        if (verbose) say(1, true, rows[i][0], "sits after " + rows[i - 1][0] + " but is larger (" + rows[i][1] + " > " + rows[i - 1][1] + ")");
      }
    }
    if (bad && !verbose) say(1, true, d.id, bad + " card(s) out of descending population order (pass --verbose to list)");
    const noOwn = d.cardIds.filter((i) => !ownFigure(BY[i]));
    if (missing.length) say(1, true, d.id, missing.length + " card(s) cannot be ranked at all: " + missing.slice(0, 6).join(" "));
    if (noOwn.length) say(1, false, d.id, noOwn.length + " card(s) give no population of their own and are ranked on their country's");
    if (!bad && !missing.length) console.log("  ok " + d.id.padEnd(22) + " " + rows.length + " cards, descending");
  }
}

/* 2. THE BACKGROUND IS TWO BLOCKS OF FIVE. The block break is ` <br><br> `, which is what buildBack
   splits a quotation on, so a background without exactly one of them is a rendering fault as well. */
if (want(2)) {
  head(2, "Background — 5 + 5 sentences, 270-330 words");
  const split = require(path.join(__dirname, "split-abstract.js"));
  for (const d of GEO) for (const id of d.cardIds) {
    const c = BY[id], a = c.abstract || "";
    const blocks = a.split(" <br><br> ");
    if (blocks.length !== 2) { say(2, true, id, "background has " + (blocks.length - 1) + " block breaks, not 1"); continue; }
    if (split && split.pieces) {
      const n = blocks.map((b) => split.pieces(b).length);
      if (n[0] !== 5 || n[1] !== 5) say(2, true, id, "background splits " + n[0] + "+" + n[1] + ", not 5+5");
    }
    const words = strip(a).replace(/\([^)]*\b(mile|miles|sq mi|foot|feet|inch|inches|acre|acres|°F)\b[^)]*\)/g, "").split(/\s+/).filter(Boolean).length;
    if (words < 270 || words > 330) say(2, true, id, "background is " + words + " words (270-330)");
  }
}

/* 3. EVERY CARD HAS A DATE LINE AND A PICTURE, or a stated reason for having neither. A map card's
   subject is a place, and a place has a date; the exceptions are declared here rather than inferred. */
const NO_PICTURE_OK = new Set([]);          // an answer term that cannot be authentically depicted
if (want(3)) {
  head(3, "Date line and picture present");
  for (const d of GEO) for (const id of d.cardIds) {
    const c = BY[id];
    if (!strip(c.answerDate)) say(3, true, id, "no date line");
    if (!c.image && !c.video && !NO_PICTURE_OK.has(id)) say(3, true, id, "no picture, and not declared undepictable");
    if (c.image && !String(c.image.desc || "").trim()) say(3, true, id, "picture has no description");
    if (c.image && /\b(source|via|courtesy|wikimedia|commons|flickr|photograph by)\b/i.test(c.image.desc || ""))
      say(3, true, id, "picture description names its source — that belongs in the credit alone");
  }
}

/* 4. THE QUESTION IS ONE OF THE DECK'S OWN TEMPLATES, and a country with more than one seat must not
   have one of them asking the bare "the capital": the map shades the country, so both cards would be
   correct answers to the same words. */
if (want(4)) {
  head(4, "Question — unambiguous within its own deck");
  const seats = {};
  for (const d of GEO) for (const id of d.cardIds) {
    const c = BY[id];
    if (!c.map || !c.map.dot) continue;
    const k = Array.isArray(c.map.key) ? c.map.key.join("|") : c.map.key;
    (seats[k] = seats[k] || []).push(c);
  }
  for (const k of Object.keys(seats)) {
    const v = seats[k]; if (v.length < 2) continue;
    for (const c of v) {
      const q = strip(c.question);
      if (/\bmarks\s*,?\s*the capital of the (country|territory|province)/i.test(q))
        say(4, true, c.id, "asks for “the capital” of " + k + ", which has " + v.length + " seat cards — the role must be qualified");
    }
  }
  for (const d of GEO) for (const id of d.cardIds) {
    const c = BY[id], q = strip(c.question);
    const words = q.split(/\s+/).filter(Boolean).length;
    if (words < 5 || words > 20) say(4, true, id, "question is " + words + " words (a map card's prompt is 5-20)");
  }
}

/* 5. THE DATE LINE AND THE BACKGROUND MUST NOT CONTRADICT EACH OTHER. The rule is agreement, not
   repetition: a date line is a summary and a 300-word background cannot restate every year in it, so an
   ABSENT year is no finding at all — the first cut of this rule reported 92 of them and every one was a
   card whose prose simply had no room. What IS a finding is the same EVENT dated twice, differently. So
   each date-line row is matched to the background sentence that talks about the same thing, by the row's
   own label, and the two are compared. */
const EVENT = [
  [/independen/i, /independen/i],
  [/recognition|recognised|recognized/i, /recogni[sz]/i],
  [/membership|UN member/i, /joined the United Nations|United Nations on|admitted to the United Nations/i],
  [/statehood/i, /statehood|became a state|admitted to the Union/i],
  [/founded|founding/i, /founded|foundation/i],
  [/settled|settlement/i, /settled|settlement/i],
  [/capital since|became capital|capital moved|move/i, /capital/i],
  [/constitution/i, /constitution/i],
  [/census/i, /census/i],
];
if (want(5)) {
  head(5, "Date line \u2194 background \u2014 the same event dated twice, differently");
  for (const d of GEO) for (const id of d.cardIds) {
    const c = BY[id];
    const ab = strip(c.abstract);
    const sentences = ab.split(/(?<=\.)\s+/);
    const rows = [...String(c.answerDate || "").matchAll(/dt-k">([^<]*)<\/span><span class="dt-v">([^<]*)</g)];
    for (const [, label, value] of rows) {
      const ys = (value.match(/\b(1[0-9]{3}|20[0-9]{2})\b/g) || []);
      if (!ys.length) continue;
      const pair = EVENT.find((e) => e[0].test(label));
      if (!pair) continue;
      /* THE YEAR MUST DATE THE EVENT, not merely share a sentence with it. Requiring a dating
         preposition and a short gap is what separates "independent on 12 December 1963" from "joined the
         Commonwealth in 1972 after independence" — the loose form reported 56 findings of which every one
         sampled was the second shape. */
      const near = new RegExp("(?:" + pair[1].source + ")[^.]{0,60}?\\b(?:in|on|of|since|until|from)\\s+(?:\\d{1,2}\\s+[A-Z][a-z]+\\s+)?(?<yr>1[0-9]{3}|20[0-9]{2})\\b", "gi");
      const prose = [];
      for (const t of sentences) { let m; near.lastIndex = 0; while ((m = near.exec(t))) prose.push(m.groups.yr); }
      if (!prose.length) continue;
      /* REPORTED, NEVER ENFORCED, and the measurement is why. Sampled across the whole corpus this rule
         is dominated by false positives — the sentence that mentions the event also mentions a NEIGHBOUR
         event with its own date ("Capital since 1963" against a Capital Development Authority founded in
         1960; "Constitution 1 January 2009" against a constitution approved in 2008 and in force on that
         very day). Every card sampled agreed with its own date line. So this is a list to read, and a
         checker that cries wolf is one nobody runs. */
      if (!ys.some((y) => prose.includes(y)))
        say(5, false, id, "\u201c" + label.trim() + " " + value.trim() + "\u201d, but the background dates that event " + prose.join("/"));
    }
  }
}

/* 6. CITATIONS. An institution publishing three datasets is not a scholar publishing three papers, so
   the two are counted apart: a PERSONAL name repeated is a finding, an institutional one is a note. */
/* AN INSTITUTION IS NOT AN AUTHOR, and the difference is the whole of what rule 6 measures. The World
   Bank publishing three indicator series on one card is good practice; one scholar's three papers on one
   card is the fault the rule is about. So the test is a keyword list, and anything it does not match is
   read as a person — the safe direction, since a false personal reading is a line to read and a false
   institutional one is a fault gone quiet. */
const INSTITUTIONAL = /\b(Bank|Bureau|Office|Ministry|Department|Commission|Council|Statistics|Institute|Institut|Instituto|Secretariat|Agency|Administration|Service|Authority|Government|Nations|Union|Association|Organi[sz]ation|Board|Cent(?:er|re)|Survey|Library|Museum|University|Press|States|State|Committee|Programme|Fund|Court|Assembly|Parliament|Congress|Society|Corporation|Company|Trust|Foundation|National|Federal|Royal|Census|Eurostat|UNESCO|Historian|Archives|Treaty|Community|Conference|Collectivit|Pr\u00e9fecture|Majesty|Editorial|Project|Republic|Islands|Kingdom|Territory|Territories|Overseas|Secretary|Division|Directorate|Alliance|Bundesamt|Ufficio|Amt|Agence|Bureau)\b/i;
const PERSONAL = (a) => !INSTITUTIONAL.test(a);
if (want(6)) {
  head(6, "Citations — repeated authors, language mix, shape");
  for (const d of GEO) for (const id of d.cardIds) {
    const c = BY[id], srcs = c.sources || [];
    const auth = {};
    for (const s of srcs) { const a = s.split(",")[0].replace(/^[“"]/, "").trim(); auth[a] = (auth[a] || 0) + 1; }
    for (const [a, n] of Object.entries(auth)) {
      if (n > 2 && PERSONAL(a)) say(6, true, id, "personal author “" + a + "” cited " + n + " times");
      else if (n > 2 && verbose) say(6, false, id, "institution “" + a + "” cited " + n + " times (datasets, not papers)");
    }
    for (const s of srcs) {
      if (!/https?:\/\/\S+\.?\s*\[/.test(s) && !/https?:\/\/\S+\.\s*\[/.test(s)) say(6, true, id, "citation does not end in a URL before its access label: " + s.slice(0, 70));
      if (!/\[(Open access|Paywalled)\]/.test(s)) say(6, true, id, "citation carries no access label: " + s.slice(0, 70));
    }
    /* A NON-ENGLISH SOURCE IS ALLOWED AND MORE THAN ONE PER CARD IS NOT. Detected by the title, which is
       what is quoted: a run of non-English function words inside the quotation marks. */
    const FOREIGN = /\u201c[^\u201d]*\b(de|du|des|la|le|les|el|los|las|der|die|das|und|von|zur|und|el|dos|da|do|na|sur|aux|pour|projet|plan|territorial|\u00eeles|Collectivit\u00e9|Pr\u00e9fecture)\b[^\u201d]*\u201d/;
    const foreign = srcs.filter((s) => FOREIGN.test(s));
    if (foreign.length > 1) say(6, false, id, foreign.length + " non-English sources (at most one per card): " + foreign.map((s) => (s.match(/\u201c([^\u201d]{0,40})/) || [])[1]).join(" | "));
  }
}

console.log("\n" + findings + " finding(s), of which " + mechanical + " mechanical.");
process.exit(mechanical ? 1 : 0);
