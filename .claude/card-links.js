/* card-links.js — the rules for `card.why` and `card.leadsTo`, in ONE place.
 *
 * WHY THIS IS A MODULE. Two tools write these fields — `add-card.js` for a new card and
 * `add-card-links.js` for the 1,400 already shipped — and a copy of a validation goes stale on a change
 * made in the other file by somebody with no reason to look here. This repo has the scar: `add-card-tags.js`
 * kept a private copy of the serializer's field list and silently stripped `difficulty` and `undatable`
 * from all 500 cards in one run. A rule with two homes has no home.
 *
 * Both checks return an ERROR STRING or null, rather than exiting, so the caller decides whether a bad
 * entry stops a whole batch or is reported and skipped.
 *
 * Zero dependencies. Not part of the site.
 */
"use strict";

const plain = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const words = (s) => (plain(s) ? plain(s).split(" ").length : 0);

const WHY_MIN_WORDS = 4, WHY_MAX_WORDS = 24;
const LEADS_MAX = 3, HOW_MIN_WORDS = 4, HOW_MAX_WORDS = 28;

/* `card.why` — elaborative interrogation. A QUESTION, and which of the abstract's two five-sentence
 * blocks answers it. Both halves matter and neither is visible to an author when it is wrong: a
 * statement still renders, and a wrong block still opens something. */
function checkWhy(card) {
  const w = card && card.why;
  if (w == null) return null;
  if (typeof w !== "object" || Array.isArray(w) || typeof w.q !== "string" || !w.q.trim())
    return 'card.why must be { q: "<a question>", at: 1|2 }';
  if (w.at !== 1 && w.at !== 2)
    return "card.why.at must be 1 or 2 — which block of the abstract answers the question";
  if (!/\?\s*$/.test(w.q.trim()))
    return "card.why.q must be a question and end in a question mark — the reader is asked it as one";
  const n = words(w.q);
  if (n < WHY_MIN_WORDS || n > WHY_MAX_WORDS)
    return "card.why.q is " + n + " words — keep it between " + WHY_MIN_WORDS + " and " + WHY_MAX_WORDS +
           "; it sits above three hundred words of prose and has to be readable at a glance";
  const blocks = String(card.abstract || "").split(/\s*<br\s*\/?>\s*<br\s*\/?>\s*/);
  if (blocks.length !== 2)
    return "card.why names a block of the abstract, but this abstract does not split into two blocks of five";
  return null;
}

/* `card.leadsTo` — the causal edges. `ctx` supplies what only the caller can know: every card by id, a
 * function from a card id to its COLLECTION id, and app.js's own `cardYears`, so the ordering rule is
 * checked with the same parser the site sorts by rather than a second copy of the date grammar. */
function checkLeadsTo(card, ctx) {
  const a = card && card.leadsTo;
  if (a == null) return null;
  if (!Array.isArray(a) || !a.length)
    return "card.leadsTo must be a non-empty array of { id, how } — omit it if the card leads to nothing you can cite";
  if (a.length > LEADS_MAX)
    return "card.leadsTo has " + a.length + " edges — at most " + LEADS_MAX +
           ". A list of every consequence is a list nobody reads";
  const startY = (c) => { const y = ctx.cardYears(c); return y.length ? Math.min(...y) : null; };
  const mine = ctx.collectionOf(card.id);
  const seen = new Set();
  for (const e of a) {
    if (!e || typeof e !== "object" || typeof e.id !== "string" || !e.id)
      return "every card.leadsTo entry must be { id, how }";
    if (seen.has(e.id)) return "card.leadsTo names " + e.id + " twice";
    seen.add(e.id);
    if (e.id === card.id) return "card.leadsTo points at the card itself";
    const t = ctx.byId[e.id];
    if (!t) return "card.leadsTo names " + e.id + ", which is not a card — a dangling edge draws nothing at all, so nobody would ever see it";
    const hw = words(e.how);
    if (typeof e.how !== "string" || hw < HOW_MIN_WORDS)
      return "card.leadsTo[" + e.id + "].how must be a sentence saying HOW one led to the other — a bare link asserts a causal claim and explains none of it";
    if (hw > HOW_MAX_WORDS)
      return "card.leadsTo[" + e.id + "].how is " + hw + " words — keep it under " + HOW_MAX_WORDS + "; it is a caption, not a paragraph";
    const tc = ctx.collectionOf(e.id);
    if (mine && tc && tc !== mine)
      return "card.leadsTo names " + e.id + " in collection " + tc + ", but this card is in " + mine +
             " — a causal edge stays inside one collection";
    const y1 = startY(card), y2 = startY(t);
    if (y1 != null && y2 != null && y2 < y1)
      return "card.leadsTo names " + e.id + ", which starts in " + y2 + " — EARLIER than this card's " + y1 +
             ". The edge is the wrong way round";
  }
  /* A CAUSAL CLAIM IS A HISTORICAL CLAIM. `how` is one sentence of Folio's own prose asserting that one
     thing led to another, which is exactly what the source apparatus exists for. It is not exempt for
     being short. */
  if (!Array.isArray(card.sources) || !card.sources.length)
    return "card.leadsTo asserts that one thing led to another, which is a historical claim and needs citing like any other";
  return null;
}

/* app.js's own year parser, sliced out by text rather than reimplemented — the trick the no-browser
 * suites use. A second copy of the date grammar would drift from the one the deck is actually sorted by,
 * and the ordering rule above is the whole point of having it. */
function loadCardYears(appSrc) {
  const a = appSrc.indexOf("const DEEP_MAG = {");
  const b = appSrc.indexOf("// start year of a card's answer term");
  if (a < 0 || b < 0) throw new Error("could not find cardYears in app.js");
  return new Function(appSrc.slice(a, b) + "\nreturn { cardYears };")().cardYears;
}

// id -> the id of the COLLECTION it sits in, walking the shipped tree once
function collectionIndex(tree) {
  const out = {};
  for (const col of tree.collections) {
    (function w(n) {
      (n.cardIds || []).forEach((i) => { out[i] = col.id; });
      (n.children || []).forEach(w);
    })(col);
  }
  return out;
}

module.exports = { checkWhy, checkLeadsTo, loadCardYears, collectionIndex,
                   WHY_MIN_WORDS, WHY_MAX_WORDS, LEADS_MAX, HOW_MIN_WORDS, HOW_MAX_WORDS };
