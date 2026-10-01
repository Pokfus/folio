#!/usr/bin/env node
/* build.js — the composed Collections page (Oct 2026): the Ledger's grouped ledger, with its decks /
   written / cards / learned columns replaced by the Shelf's fill rows — each collection is a row whose
   colour fill is the share of it studied. Everything else is the Ledger's: the tabs with the search
   beside them, the Planned fold, Your decks as a ledger with the editor under it, orphans, shared decks.
   Not part of the site. */
"use strict";
const fs = require("fs"), path = require("path");
const SRC = fs.readFileSync(path.join(__dirname, "..", "build.js"), "utf8");
/* reuse the parent generator's data and shared pieces: everything up to the first page definition */
const prelude = SRC.slice(SRC.indexOf('"use strict";') + 13, SRC.indexOf("const OUT = {};"));
const P = new Function("require", "__dirname", prelude.replace(/^const fs = require\("fs"\), path = require\("path"\);/m, 'const fs = require("fs"), path = require("path");') +
  "\nreturn {SECTIONS, LANGS, PLANNED, ACTIVE, MINE, ic, col, pct, fmt, head, search, tabs, secH, plannedFold, studioNote, studioActs, pubLabel, editor, orphans, sharedSec, page, I};")(require, path.join(__dirname, ".."));
const { SECTIONS, LANGS, ACTIVE, MINE, ic, col, pct, fmt, head, search, tabs, plannedFold, studioNote, studioActs, pubLabel, editor, orphans, sharedSec, page } = P;

const CSS = `
/* the ledger: one bordered block per tab's contents, section bands inside it, fill rows between */
.ledger{background:var(--card); border:1px solid var(--rule); border-radius:14px; overflow:hidden; margin-bottom:22px;}
.band{display:flex; justify-content:space-between; align-items:baseline; gap:12px; padding:8px 16px; background:var(--paper-2); border-top:1px solid var(--rule); font-family:var(--mono); font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-quiet); font-weight:600;}
.ledger > .band:first-child{border-top:0;} .band em{font-style:normal; color:var(--ink-faint); margin-left:8px;}
.fr{position:relative; overflow:hidden; display:grid; grid-template-columns:44px 1fr auto auto auto; gap:14px; align-items:center; padding:12px 16px; border-top:1px solid var(--rule); color:inherit;}
.fr::before{content:""; position:absolute; left:0; top:0; bottom:0; width:var(--w); background:linear-gradient(90deg, color-mix(in srgb, var(--c) 20%, var(--card)), color-mix(in srgb, var(--c) 9%, var(--card))); border-right:3px solid var(--c);}
.fr[style*="--w:0%"]::before{display:none;}
.fr > *{position:relative;} .fr b.name{font-weight:700; font-size:15px; display:block;} .fr .m{font-size:12px; color:var(--ink-quiet);}
.fr .acts2{display:flex; gap:6px; align-items:center;}
.mine{grid-template-columns:44px 1fr auto auto;} .mine .mark{border-radius:50%;}
.ledger .editor{border:0; border-radius:0; border-top:1px solid var(--rule); box-shadow:none; background:var(--paper);}
@media (max-width:640px){ .fr{grid-template-columns:40px 1fr auto; padding:12px 14px;} .fr .try, .fr .reach{display:none;} .fr::before{top:auto; height:5px; border-right:0; background:var(--c);} .fr[style*="--w:0%"]::before{display:none;} .mine .pub{display:none;} .mine .acts2 .ghost{display:none;} }`;

const row = ([id,n,have,plan,st,decks]) => `<a class="fr" href="#coll" style="--c:${col(id)}; --w:${pct(st,have)}%"><span class="mark" style="--c:${col(id)}">${ic(id)}</span><span><b class="name">${n}</b><span class="m">${decks} decks · ${fmt(have)} cards${st?` · ${st} learned · ${pct(st,have)}%`:""}</span></span><span class="reach${have>=plan?" full":""}">${have>=plan?"Complete":fmt(have)+" of "+fmt(plan)+" planned"}</span><span class="try">Try ten</span><span class="acts2"><span class="ic-btn${ACTIVE.has(id)?" on":""}" aria-label="Add to review"><svg viewBox="0 0 24 24"><path d="${ACTIVE.has(id)?"m5 12 5 5 9-10":"M12 5v14M5 12h14"}"/></svg></span><span class="ic-btn" aria-label="Expand"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span></span></a>`;
const langRow = ([id,n,cards,decks]) => `<a class="fr" href="#coll" style="--c:${col(id)}; --w:0%"><span class="mark" style="--c:${col(id)}">${ic(id)}</span><span><b class="name">${n}</b><span class="m">${decks} decks · ${fmt(cards)} cards</span></span><span class="reach">Language deck</span><span class="try" style="visibility:hidden">Try ten</span><span class="acts2"><span class="ic-btn" aria-label="Add"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span><span class="ic-btn" aria-label="Expand"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span></span></a>`;
const mineRow = ([n,c,when,hue,st], i) => `<a class="fr mine" href="#mine" style="--c:${hue}; --w:0%"><span class="mark" style="--c:${hue}"><b style="font-family:var(--serif);font-size:18px">${n[0]}</b></span><span><b class="name">${n}</b><span class="m">${c} cards · ${when}</span></span><span class="pub ${pubLabel[st][1]}">${pubLabel[st][0]}</span><span class="acts2"><span class="btn small">Study</span><span class="btn small ghost">${i===0?"Close":"Edit"}</span><span class="btn small ghost">Export</span><span class="btn small danger">Delete</span></span></a>${i===0?editor():""}`;

const html = page("composed", CSS, `
${head("Curated collections of flashcards. New subjects are on the way.")}
<div class="gap"></div>
${tabs("all", search())}
<div class="gap"></div>
<div class="ledger">
${SECTIONS.map(([label, cs]) => `<div class="band"><span>${label}<em>${cs.length}</em></span></div>` + cs.map(row).join("")).join("")}
<div class="band"><span>Languages<em>${LANGS.length}</em></span></div>${LANGS.map(langRow).join("")}
</div>
${plannedFold()}
<div class="gap"></div>
<div class="sec-h"><span>Your decks<em>${MINE.length}</em></span></div>${studioNote()}${studioActs()}
<div class="gap"></div>
<div class="ledger">${MINE.map(mineRow).join("")}</div>
${orphans()}
${sharedSec()}`);
fs.writeFileSync(path.join(__dirname, "collections-composed.html"), html);
console.log("wrote collections-composed.html");
