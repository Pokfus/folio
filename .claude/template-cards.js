#!/usr/bin/env node
/*
  Which cards take the WAR, BATTLE and CITY date-line templates (Nov 2026, on request; the person
  template has its own report, `person-cards.js`). The templates themselves are described in
  `date-line.js` and written by `set-template-dates.js`.

    node .claude/template-cards.js                 # the summary: per kind, per collection, how many done
    node .claude/template-cards.js --list[=war]    # every card, one line each: id, kind, done?, answer
    node .claude/template-cards.js --todo[=battle] # the cards still without their template
    node .claude/template-cards.js --random=2      # two random cards of each kind still to do

  It is a REPORT, read by eye; no data is written. The rules, in order:
    person   tagged `person` — never one of these three, whatever else it is tagged (Napoleon is tagged war)
    battle   tagged `battle`, or an answer that reads "Battle of …" / "Siege of …" — sieges, raids,
             landings and operations included: a date, a place, a toll and an outcome fit them all
    war      an `event` or `era` card (or one tagged `war`) whose answer names a war, rebellion, revolt,
             uprising or campaign — and not a declaration, an entry into a war, its crimes, trials,
             cabinets, dead or memorials, which are about a war rather than the war
    city     tagged `city`, `capital` or `settlement` in a HISTORY collection (tagged `history`); the
             geography collections' map cards are not history cards and are left out
  Heuristic and deliberately simple: a writer reading the card decides in the end, and may skip.
*/
global.window = {};
require(require("path").join(__dirname, "..", "data.js"));
const CARDS = global.window.CARD_DATA;
const GEO = /^(geo|gw|gc|gru|gin|fl|fd)-/;
const label0 = (c) => ((String(c.answerDate || "").match(/^<div class="dt"><span class="dt-k">([^<]*)/) || [])[1] || "");
const FIRST = { war: "Start", battle: "Date", city: "Founding" };
const has = (c, t) => (c.tags || []).includes(t);
const NOT_A_WAR = /declaration|entry into|crimes?\b|trial|cabinet|dead\b|casualties|mistreatment|memorial|board\b|ministry|economy|bond|bride|correspondent|artists|council|plan\b|prisoners? of war|refugee|production|manpower|shipping|two-front|total war|tonnage|phoney|^war$/i;

function kindOf(c) {
  if (has(c, "person")) return null;
  const a = String(c.answerText || c.answer || "");
  if (has(c, "battle") || /^(the )?(battle|siege|sack) of\b/i.test(a)) return "battle";
  if ((has(c, "event") || has(c, "era") || has(c, "war")) &&
      /\bwars?\b|rebellions?\b|revolt\b|uprising|campaigns?\b|conflict\b|expedition\b/i.test(a) && !NOT_A_WAR.test(a)) return "war";
  if ((has(c, "city") || has(c, "capital") || has(c, "settlement")) && has(c, "history") && !GEO.test(c.id)) return "city";
  return null;
}
const rows = CARDS.map((c) => ({ c, kind: kindOf(c) })).filter((r) => r.kind)
  .map((r) => Object.assign(r, { done: label0(r.c) === FIRST[r.kind], col: r.c.id.replace(/\d+$/, "") }));

const args = process.argv.slice(2);
const arg = (n) => { const a = args.find((x) => x === "--" + n || x.startsWith("--" + n + "=")); return a == null ? null : (a.split("=")[1] || ""); };
const only = (r, k) => !k || r.kind === k;
if (arg("list") != null || arg("todo") != null) {
  const k = arg("list") || arg("todo"), todo = arg("todo") != null;
  for (const r of rows) if (only(r, k) && !(todo && r.done)) console.log(r.c.id.padEnd(10) + r.kind.padEnd(8) + (r.done ? "done  " : "      ") + r.c.answer);
} else if (arg("random")) {
  for (const k of ["war", "battle", "city"]) {
    const todo = rows.filter((r) => r.kind === k && !r.done);
    for (let i = 0; i < Number(arg("random")) && todo.length; i++) {
      const r = todo.splice(Math.floor(Math.random() * todo.length), 1)[0];
      console.log(r.c.id.padEnd(10) + k.padEnd(8) + r.c.answer);
    }
  }
} else {
  for (const k of ["war", "battle", "city"]) {
    const rs = rows.filter((r) => r.kind === k), by = {};
    rs.forEach((r) => { by[r.col] = by[r.col] || [0, 0]; by[r.col][0]++; if (r.done) by[r.col][1]++; });
    console.log(k.padEnd(7) + String(rs.length).padStart(4) + " cards, " + rs.filter((r) => r.done).length + " with the template   " +
      Object.entries(by).sort((a, b) => b[1][0] - a[1][0]).map(([p, [n, d]]) => p + n + (d ? "(" + d + ")" : "")).join(" "));
  }
}
