#!/usr/bin/env node
/*
  Which cards are about ONE INDIVIDUAL PERSON, and which of them already carry the person template
  (Nov 2026; the template is described in `set-person-dates.js` and `date-line.js`).

    node .claude/person-cards.js              # the summary per collection
    node .claude/person-cards.js --list       # every card, one line each: id, class, template?, answer
    node .claude/person-cards.js --todo       # the individuals still without the template
    node .claude/person-cards.js --random=3   # three random individuals still without it

  It is a REPORT, read by eye — no data is written. A card is a candidate when it is tagged `person`
  or its date line opens with Born / Died; then:
    individual  a historical person — the template applies
    legendary   tagged mythology / hero / troy, or a figure the date line places only "In Homer",
                "Traditional", "Iliad composed" … — no birth to give, the template does not apply
    not-person  the answer is an event or a group ("death of …", "… Lords …", "… Gracchi"): the card is
                about something that happened to a person, or several people, not one life
  The heuristic is deliberately simple and errs towards `individual`; a writer reading the Wikipedia
  page decides in the end. A person whose birth is unknown (the date line says Lived / Flourished /
  Active) is still an individual — the template opens with "Birth c. …" or the card keeps its line.
*/
global.window = {};
require(require("path").join(__dirname, "..", "data.js"));
const CARDS = global.window.CARD_DATA;
const LEGEND_TAGS = new Set(["mythology", "hero", "troy", "homer"]);
const LEGEND_LABELS = /^(In Homer|Traditional|Iliad composed|Odyssey composed|Hesiod writing|In myth|Myth)/i;
const label0 = (c) => ((String(c.answerDate || "").match(/dt-k">([^<]*)/) || [])[1] || "");
// the template opens with "Birth", or — where no birth is dated — carries a "Death" row (the old lines say Born / Died)
const hasTemplate = (c) => label0(c) === "Birth" || /dt-k">Death</.test(String(c.answerDate || ""));

function classify(c) {
  const a = String(c.answerText || c.answer || "");
  if (/^(death|assassination|murder|execution|trial|exile|reign|reforms?|accession|abdication) of\b/i.test(a)) return "not-person";
  if (/\b(lords|brothers|gracchi|sisters|kings|emperors|family|dynasty|twins)\b/i.test(a) || /\band\b/.test(a)) return "not-person";
  if ((c.tags || []).some((t) => LEGEND_TAGS.has(t)) || LEGEND_LABELS.test(label0(c))) return "legendary";
  return "individual";
}
const cand = CARDS.filter((c) => (c.tags || []).includes("person") || /^(Born|Died|Birth|Death)$/.test(label0(c)))
  .map((c) => ({ c, cls: classify(c), tpl: hasTemplate(c), col: c.id.replace(/\d+$/, "") }));

const args = process.argv.slice(2);
const rnd = (args.find((a) => a.startsWith("--random=")) || "").split("=")[1];
if (args.includes("--list") || args.includes("--todo")) {
  for (const r of cand) {
    if (args.includes("--todo") && (r.cls !== "individual" || r.tpl)) continue;
    console.log(r.c.id.padEnd(10) + r.cls.padEnd(12) + (r.tpl ? "template  " : "          ") + r.c.answer);
  }
} else if (rnd) {
  const todo = cand.filter((r) => r.cls === "individual" && !r.tpl);
  for (let i = 0; i < Number(rnd) && todo.length; i++) {
    const r = todo.splice(Math.floor(Math.random() * todo.length), 1)[0];
    console.log(r.c.id.padEnd(10) + r.c.answer);
  }
} else {
  const by = {};
  for (const r of cand) {
    const b = (by[r.col] = by[r.col] || { individual: 0, legendary: 0, "not-person": 0, template: 0 });
    b[r.cls]++; if (r.tpl) b.template++;
  }
  console.log("prefix    individual  legendary  not-person  with template");
  const tot = { individual: 0, legendary: 0, "not-person": 0, template: 0 };
  for (const [k, b] of Object.entries(by).sort((x, y) => y[1].individual - x[1].individual)) {
    console.log(k.padEnd(10) + String(b.individual).padStart(10) + String(b.legendary).padStart(11) + String(b["not-person"]).padStart(12) + String(b.template).padStart(15));
    for (const t in tot) tot[t] += b[t];
  }
  console.log("total     " + String(tot.individual).padStart(10) + String(tot.legendary).padStart(11) + String(tot["not-person"]).padStart(12) + String(tot.template).padStart(15));
}
