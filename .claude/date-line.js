/*
  The DATE LINE — the `answerDate` field, the key/value list of dates under a card's answer term.

  Shared by set-date-line.js (which writes it) and add-card.js (which holds a new card to it), so the
  two can never disagree about what a date line is. It is a glance: the dates worth memorising with the
  term and nothing else. It grew into a paragraph once, one card at a time, and nothing was checking —
  these numbers are the check.
*/
const MAX_ROWS = 4;        // including continuation lines
const LABEL_MAX = 16;      // "Way of life" was a category label; "Born" / "Named" / "In use" are date labels
const VALUE_MAX = 64;
const VALUE_MAX_WORDS = 10;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// [label, value] rows -> the markup. A row with an EMPTY label is a continuation line under the value
// above it (a place under a birth date). An empty array is an empty date line. `fail(msg)` must throw
// or exit — nothing here returns an error.
function buildDateLine(id, rows, fail) {
  if (!Array.isArray(rows)) fail(id + ": value must be an array of [label, value] rows (or [] for no date line)");
  if (!rows.length) return "";
  if (rows.length > MAX_ROWS) fail(id + ": " + rows.length + " rows — at most " + MAX_ROWS + ". Keep the dates worth memorising and drop the rest.");
  let html = '<div class="dt">';
  rows.forEach((row, i) => {
    if (!Array.isArray(row) || row.length !== 2) fail(id + " row " + (i + 1) + ": each row is [label, value]");
    const label = String(row[0] == null ? "" : row[0]).trim();
    const value = String(row[1] == null ? "" : row[1]).trim();
    if (!value) fail(id + " row " + (i + 1) + ": the value is empty — drop the row, or pass [] for no date line at all");
    if (/[<>]/.test(label + value)) fail(id + " row " + (i + 1) + ": no markup in a date line — the writer builds the tags");
    if (value.length > VALUE_MAX) fail(id + " row " + (i + 1) + ": the value is " + value.length + " characters — at most " + VALUE_MAX + ". A date line states dates, not what happened on them.");
    if (value.split(/\s+/).length > VALUE_MAX_WORDS) fail(id + " row " + (i + 1) + ": the value runs to " + value.split(/\s+/).length + " words — at most " + VALUE_MAX_WORDS + ". The background is where the prose goes.");
    // A trailing full stop after a WORD is a sentence; after an abbreviation it is spelling ("…Roberts
    // Jr.", "Washington, D.C."), so only the first is refused.
    if (/(?:^|\s)[A-Za-z]{4,}\.$/.test(value)) fail(id + " row " + (i + 1) + ": the value ends in a full stop — it is a list entry, not a sentence.");
    if (/;$/.test(value)) fail(id + " row " + (i + 1) + ": the value ends in a semicolon — it is a list entry, not a clause.");
    if (/;/.test(value)) fail(id + " row " + (i + 1) + ": semicolons chain clauses — give each date its own row instead.");
    if (label) {
      if (label.length > LABEL_MAX) fail(id + " row " + (i + 1) + ": the label “" + label + "” is " + label.length + " characters — at most " + LABEL_MAX + ". It names WHAT the date is (Era, Lived, Found, Named), in a word or two.");
      if (!/\d/.test(value)) fail(id + " row " + (i + 1) + ": “" + value + "” has no number in it. A labelled row states a date; leave the label empty for a continuation line (a place under a date).");
      html += '<span class="dt-k">' + esc(label) + '</span><span class="dt-v">' + esc(value) + "</span>";
    } else {
      if (!i) fail(id + " row 1: the first row needs a label — a continuation line has nothing to continue.");
      html += '<span class="dt-v dt-sub">' + esc(value) + "</span>";
    }
  });
  return html + "</div>";
}

/* Is an EXISTING date line a date list rather than the paragraph this replaces? The tags are not the
   test — an old date line is the same `<div class="dt">` with a paragraph inside it, so a structural
   check calls the whole deck converted. What tells them apart is the length of the values. */
const SHAPE = /^<div class="dt">(?:<span class="dt-k">[^<]*<\/span><span class="dt-v">[^<]*<\/span>|<span class="dt-v dt-sub">[^<]*<\/span>)+<\/div>$/;
function isDateList(html) {
  if (!html) return true;                                 // an empty line is a finished line
  if (!SHAPE.test(html)) return false;
  const vals = [...html.matchAll(/<span class="dt-v[^"]*">([^<]*)<\/span>/g)].map((m) => m[1]);
  return vals.length <= MAX_ROWS && vals.every((v) => v.length <= VALUE_MAX && v.split(/\s+/).length <= VALUE_MAX_WORDS);
}

module.exports = { MAX_ROWS, LABEL_MAX, VALUE_MAX, VALUE_MAX_WORDS, buildDateLine, isDateList };
