#!/usr/bin/env node
/* build.js — six Collections-page mockups (c-1 … c-6), in the composed home page's style (Oct 2026).
   Every design folds the Studio page into Collections: "Your decks" lives on this page with New deck,
   Import, Export, Delete, Study and Edit, and the deck editor (details, cards, card types, glossary,
   publishing) opens in place. The shared parts (top bar, phone head, tokens, boxes, number boxes, fill
   rows, mono labels) come from the home page's generator so the two pages read as one site. Not part of
   the site. */
"use strict";
const fs = require("fs"), path = require("path");
const ICONS = JSON.parse(fs.readFileSync(path.join(__dirname, "collicons.json"), "utf8"));
const R4 = fs.readFileSync(path.join(__dirname, "..", "home-redesigns", "round-4", "build.js"), "utf8");
const R2 = fs.readFileSync(path.join(__dirname, "..", "home-redesigns", "round-2", "build.js"), "utf8");
const G = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "home-redesigns", "round-2", "glyphs.json"), "utf8"));
const h2 = R2.slice(R2.indexOf("const I = {"), R2.indexOf("const quoteStrip"));
const h4 = R4.slice(R4.indexOf("const PARTS = `"), R4.indexOf("const page = ("));
const P = new Function("G", h2 + "\n" + h4 + "\nreturn {I, navLinks, topbar, tabbar, phoneHead, PARTS};")(G);
const topbar = () => P.topbar().replace('class="nl on" href="#home"', 'class="nl" href="#home"').replace('class="nl" href="#decks"', 'class="nl on" href="#decks"');
const { I, phoneHead, tabbar } = P;

/* ---------- the data: the live tree's collections, with the home page's sample study state ---------- */
const SECTIONS = [
  ["History", [["china","China",339,1000,0,7],["col-8","World History",810,1000,412,8],["col-13","Ancient Greece",1000,1000,655,6],["col-40","Ancient Rome",580,1000,190,7],["col-41","United States",100,1000,0,9],["col-42","Russia",100,1000,0,9],["egypt","Ancient Egypt",10,1000,0,9],["ww2","World War II",160,1000,0,8],["japan","Japan",100,1000,71,9],["korea","Korea",99,1000,0,9]]],
  ["Geography", [["geo-world","World Geography",468,471,0,2],["flags","Flags",458,466,0,2],["geo-us","United States",133,133,0,3],["geo-china","China",58,58,0,2],["geo-russia","Russia",162,163,0,2]]],
  ["Science", [["psych","Psychology",50,1000,0,9],["bio","Biology",100,1000,0,9]]],
  ["The Arts", [["art","Visual Art",30,1000,0,9]]],
  ["Special", [["pea","Politics: East Asia",100,100,0,24]]],
];
const LANGS = [["lang-mandarin-chinese","Mandarin Chinese",22064,9],["lang-spanish","Spanish",16764,7],["lang-portuguese","Portuguese",12074,8],["lang-german","German",25094,6],["lang-french","French",15296,7],["lang-italian","Italian",23156,8],["lang-indonesian","Indonesian",19956,10]];
const PLANNED = ["India","The First World War","Architecture","Middle-earth","Westeros","The Cold War","The Viking Age","Philosophy","Dinosaurs","Astronomy","Economics","France","Ancient Mesopotamia"];
const ACTIVE = new Set(["col-8","col-13","col-40","japan"]);
const MINE = [["Dutch irregular verbs",84,"edited yesterday","#5263B0","shared"],["Art history dates",31,"edited 3 days ago","#AE3350","local"],["Birds of the garden",12,"edited last week","#4E9B7E","stale"]];
const ic = (id) => ICONS[id] ? ICONS[id].svg : "";
const col = (id) => ICONS[id] ? ICONS[id].bg : "#888";
const pct = (a, b) => Math.round(a / b * 100);
const fmt = (n) => n.toLocaleString("en-GB");

/* ---------- shared pieces ---------- */
const head = (sub) => `<div class="greet"><span class="eyebrow">Study</span><h1>Collections</h1>${sub ? `<p class="sub">${sub}</p>` : ""}</div>`;
const search = () => `<a class="search" href="#search">${I.search}<span>Search cards, terms and books</span><kbd>/</kbd></a>`;
const tabs = (on="all", extra="") => `<div class="tabrow"><div class="tabs">${[["history","History"],["geography","Geography"],["language","Language"],["other","Other"],["community","Your decks"],["all","All"]].map(([k,l]) => `<button class="ctab${k===on?" on":""}">${l}</button>`).join("")}</div>${extra}</div>`;
const secH = (label, n, extra="") => `<div class="sec-h"><span>${label}<em>${n}</em></span>${extra}</div>`;
const plannedFold = () => `<details class="planned"><summary><span class="sec-h"><span>Planned<em>${PLANNED.length}</em></span><span class="hint">collections still being written</span></span></summary><div class="planned-list">${PLANNED.map(n => `<span class="pl">${n}</span>`).join("")}</div></details>`;
const studioNote = () => `<p class="note">Decks you write yourself, and decks you install from other people. They study exactly like Folio's own, but they are <b>not fact-checked by Folio</b>. Everything stays on this device unless you share it.</p>`;
const studioActs = () => `<div class="acts"><a class="btn" href="#new">${I.arrow.replace('M5 12h14M13 6l6 6-6 6','M12 5v14M5 12h14')}New deck</a><a class="btn ghost" href="#import">Import a deck…</a><a class="btn ghost" href="#shared">Browse shared decks</a></div>`;
const pubLabel = { shared: ["Shared", "good"], local: ["On this device", "quiet"], stale: ["Shared · edits unpublished", "ochre"] };
/* THE DECK EDITOR, the Studio's core, opened in place under the deck it edits. */
const editor = (cls="") => `<section class="editor ${cls}">
  <div class="ed-head"><div><span class="k">Editing</span><b class="ed-title">Dutch irregular verbs</b><span class="ed-meta">84 cards · Shared · edits unpublished</span></div>
    <div class="ed-acts"><a class="btn small" href="#study">Study</a><a class="btn small ghost" href="#export">Export</a><a class="btn small" href="#publish">Publish changes</a><a class="btn small ghost" href="#unpub">Unpublish</a><a class="btn small danger" href="#del">Delete</a></div></div>
  <div class="ed-tabs"><button class="et on">Cards <em>84</em></button><button class="et">Deck details</button><button class="et">Card types <em>2</em></button><button class="et">Glossary <em>17</em></button></div>
  <div class="ed-cols">
    <div class="ed-list"><div class="ed-list-h"><span>84 cards</span><a class="btn small" href="#add">+ Add a card</a></div>
      ${[["zijn — to be","was · geweest"],["hebben — to have","had · gehad"],["gaan — to go","ging · gegaan"],["komen — to come","kwam · gekomen"],["zien — to see","zag · gezien"],["doen — to do","deed · gedaan"]].map(([q,a],i) => `<div class="ed-row${i===2?" on":""}"><span class="n">${i+1}</span><span class="q">${q}</span><span class="a">${a}</span><span class="mv">▲ ▼</span></div>`).join("")}
      <div class="ed-more">… and 78 more</div>
      <div class="ed-ai">Writing a lot of these? <a href="#ai">Prompts for generating them with an AI</a></div></div>
    <div class="ed-card"><div class="f"><span class="k">Front</span><div class="in">gaan — to go</div></div><div class="f"><span class="k">Back</span><div class="in">ging · gegaan</div></div><div class="f"><span class="k">Note</span><div class="in muted">Strong verb, class VII. Takes <i>zijn</i> in the perfect.</div></div><div class="f two"><div><span class="k">Card type</span><div class="in">Vocabulary (read aloud · nl)</div></div><div><span class="k">Tags</span><div class="in">verbs, irregular</div></div></div></div>
  </div>
</section>`;
const orphans = () => `<div class="orphans"><span class="k">Published, but not on this device</span><div class="orow"><b>Greek irregular aorists</b><span>62 cards · shared · 14 installs</span><a class="btn small ghost" href="#reinstall">Install</a><a class="btn small danger" href="#rm">Remove</a></div></div>`;
const sharedSec = () => `<section class="shared"><div class="sec-h"><span>Shared decks</span><span class="hint">by other people using Folio · not fact-checked</span></div>
  <div class="shared-row"><a class="search" href="#search-shared">${I.search}<span>Search shared decks…</span></a><button class="ctab">✦ Staff picks</button></div>
  <div class="shared-grid">${[["Latin declensions, drilled","Mira K.",240,4.8,"#45549C"],["Capital cities quickfire","Tomás R.",195,4.6,"#1E7A85"],["Impressionists by brushwork","Studio Berlin",64,4.9,"#AE3350"]].map(([t,by,n,r,c]) => `<a class="sd" href="#sd" style="--c:${c}"><i></i><b>${t}</b><span>${by} · ${n} cards · ★ ${r}</span><em>+ Add</em></a>`).join("")}</div></section>`;
const foot = () => `<footer class="foot"><span>About Folio · Changelog</span><span>v1.906 · 1 Oct 2026, 14:25</span></footer>`;

const BASE = `
.wrap{max-width:1100px; margin:0 auto; padding:26px 24px 60px;}
.greet .sub{margin:8px 0 0; color:var(--ink-quiet); font-size:15px; max-width:60ch;}
.gap{height:22px;}
.search{display:flex; align-items:center; gap:10px; background:var(--card); border:1px solid var(--rule); border-radius:12px; padding:11px 14px; color:var(--ink-quiet); font-size:14px; min-width:0;}
.search svg{width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:2; flex:none;} .search span{flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
.search kbd{font-family:var(--mono); font-size:10.5px; border:1px solid var(--rule); border-radius:5px; padding:1px 6px;}
.tabrow{display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;}
.tabs{display:flex; gap:6px; flex-wrap:wrap;}
.ctab{font-family:var(--mono); font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; font-weight:600; color:var(--ink-quiet); background:var(--card); border:1px solid var(--rule); border-radius:999px; padding:7px 13px;}
.ctab.on{background:var(--indigo); color:var(--on-indigo); border-color:var(--indigo);}
.sec-h em{font-style:normal; color:var(--ink-faint); margin-left:8px;} .sec-h .hint{font-family:var(--sans); font-size:12.5px; letter-spacing:0; text-transform:none; color:var(--ink-quiet); font-weight:400;}
.btn{display:inline-flex; align-items:center; gap:8px; background:var(--indigo); color:var(--on-indigo); font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; font-weight:700; padding:11px 16px; border-radius:10px; white-space:nowrap;}
.btn svg{width:14px; height:14px; stroke:currentColor; fill:none; stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round;}
.btn.ghost{background:transparent; color:var(--indigo); border:1px solid var(--rule);} .btn.small{padding:7px 11px; font-size:10px; border-radius:8px;} .btn.danger{background:transparent; color:var(--zh); border:1px solid color-mix(in srgb, var(--zh) 40%, var(--rule));}
.acts{display:flex; gap:8px; flex-wrap:wrap;}
.note{font-size:13.5px; color:var(--ink-quiet); margin:0 0 14px; max-width:70ch; line-height:1.5;} .note b{color:var(--ink);}
.mark{display:grid; place-content:center; width:44px; height:44px; border-radius:12px; background:color-mix(in srgb, var(--c) 16%, var(--card)); color:var(--c); flex:none;} .mark svg{width:26px; height:26px;}
.cnt{font-family:var(--mono); font-size:11.5px; color:var(--ink-quiet); white-space:nowrap;} .cnt b{color:var(--ink); font-weight:600;}
.reach{font-family:var(--mono); font-size:10.5px; letter-spacing:.06em; color:var(--ink-faint);} .reach.full{color:var(--good); font-weight:700;}
.ic-btn{display:grid; place-content:center; width:34px; height:34px; border-radius:50%; border:1px solid var(--rule); color:var(--ink-quiet); background:var(--card);} .ic-btn svg{width:15px; height:15px; stroke:currentColor; fill:none; stroke-width:2.2; stroke-linecap:round;}
.ic-btn.on{background:var(--good); border-color:var(--good); color:#fff;}
.try{font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--indigo); font-weight:700; border:1px solid var(--rule); border-radius:999px; padding:7px 11px; white-space:nowrap;}
.pub{font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase; font-weight:700; border-radius:6px; padding:3px 7px;}
.pub.good{color:var(--good); background:color-mix(in srgb, var(--good) 12%, var(--card));} .pub.quiet{color:var(--ink-quiet); background:var(--paper-2);} .pub.ochre{color:var(--ochre); background:color-mix(in srgb, var(--ochre) 14%, var(--card));}
.planned{margin-top:4px;} .planned summary{list-style:none; cursor:pointer;} .planned summary::-webkit-details-marker{display:none;} .planned .sec-h{margin:0; padding:10px 0; border-top:1px solid var(--rule); border-bottom:1px solid var(--rule);}
.planned-list{display:flex; flex-wrap:wrap; gap:6px; padding:12px 0 4px;} .pl{font-size:12.5px; color:var(--ink-quiet); border:1px dashed var(--rule); border-radius:999px; padding:5px 11px;}
/* the editor */
.editor{background:var(--card); border:1px solid var(--rule); border-radius:16px; padding:18px 20px; box-shadow:var(--shadow-md);}
.ed-head{display:flex; justify-content:space-between; align-items:flex-start; gap:14px; flex-wrap:wrap; margin-bottom:12px;}
.ed-title{display:block; font-family:var(--serif); font-weight:600; font-size:22px;} .ed-meta{font-size:12.5px; color:var(--ink-quiet);} .ed-acts{display:flex; gap:6px; flex-wrap:wrap;}
.ed-tabs{display:flex; gap:2px; border-bottom:1px solid var(--rule); margin-bottom:14px;} .et{font-family:var(--mono); font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; font-weight:600; color:var(--ink-quiet); padding:9px 12px; background:none; border:0;} .et.on{color:var(--indigo); box-shadow:inset 0 -2px 0 var(--indigo);} .et em{font-style:normal; color:var(--ink-faint); margin-left:5px;}
.ed-cols{display:grid; grid-template-columns:1.1fr 1fr; gap:18px;}
.ed-list-h{display:flex; justify-content:space-between; align-items:center; font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet); margin-bottom:8px;}
.ed-row{display:grid; grid-template-columns:24px 1fr 1fr auto; gap:10px; align-items:center; padding:8px 10px; border-radius:8px; font-size:13.5px;} .ed-row.on{background:var(--indigo-wash);} .ed-row .n{font-family:var(--mono); font-size:11px; color:var(--ink-faint);} .ed-row .a{color:var(--ink-quiet);} .ed-row .mv{font-size:9px; color:var(--ink-faint);}
.ed-more{font-family:var(--mono); font-size:11px; color:var(--ink-faint); padding:8px 10px;} .ed-ai{font-size:12.5px; color:var(--ink-quiet); padding:8px 10px;} .ed-ai a{color:var(--indigo); font-weight:700;}
.ed-card{background:var(--paper); border:1px solid var(--rule); border-radius:12px; padding:14px 16px; display:grid; gap:12px; align-content:start;} .ed-card .k{margin-bottom:4px;} .ed-card .in{background:var(--card); border:1px solid var(--rule); border-radius:8px; padding:9px 11px; font-size:14px;} .ed-card .in.muted{color:var(--ink-quiet); font-size:13px;} .ed-card .two{display:grid; grid-template-columns:1fr 1fr; gap:10px;}
.orphans{margin-top:14px; padding:12px 16px; border:1px dashed var(--rule); border-radius:12px;} .orow{display:flex; align-items:center; gap:12px; flex-wrap:wrap; font-size:13.5px;} .orow span{color:var(--ink-quiet); flex:1;}
.shared{margin-top:26px;} .shared-row{display:grid; grid-template-columns:1fr auto; gap:10px; margin-bottom:12px; align-items:center;}
.shared-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:12px;}
.sd{display:grid; grid-template-columns:auto 1fr auto; gap:4px 12px; align-items:center; background:var(--card); border:1px solid var(--rule); border-radius:12px; padding:12px 14px; color:inherit;} .sd i{width:10px; height:38px; border-radius:3px; background:var(--c); grid-row:span 2;} .sd b{font-weight:700; font-size:14px;} .sd span{font-size:12px; color:var(--ink-quiet);} .sd em{grid-row:span 2; font-style:normal; font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--indigo); font-weight:700;}
.foot{display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-top:30px; font-family:var(--mono); font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-faint);}
@media (max-width:1024px){ .ed-cols{grid-template-columns:1fr;} .shared-grid{grid-template-columns:1fr 1fr;} }
@media (max-width:640px){ .wrap{padding:18px 16px 100px;} .foot{justify-content:center; text-align:center;} .shared-grid{grid-template-columns:1fr;} .shared-row{grid-template-columns:1fr;} .ed-row{grid-template-columns:20px 1fr auto;} .ed-row .a{display:none;} .ed-card .two{grid-template-columns:1fr;} .tabrow{gap:8px;} }
`;
const page = (title, css, body) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Folio — collections redesign ${title}</title>
<link rel="stylesheet" href="../../../fonts.css" />
<link rel="stylesheet" href="../home-redesigns/_tokens.css" />
<style>
${P.PARTS}
${BASE}
${css}
</style>
</head>
<body>
${topbar()}
<main class="wrap">
${phoneHead()}
${body}
${foot()}
</main>
${tabbar()}
<script src="../home-redesigns/_theme.js"></script>
</body>
</html>
`;
const OUT = {};

/* ===== c-1 SHELF — the home page's fill rows: the fill is the share studied; sections as headings. */
OUT["c-1-shelf"] = page("c-1: Shelf", `
.rows{display:grid; gap:8px; margin-bottom:24px;}
.fr{position:relative; overflow:hidden; display:grid; grid-template-columns:44px 1fr auto auto auto; gap:14px; align-items:center; background:var(--card); border:1px solid var(--rule); border-radius:12px; padding:12px 16px; color:inherit;}
.fr::before{content:""; position:absolute; left:0; top:0; bottom:0; width:var(--w); background:linear-gradient(90deg, color-mix(in srgb, var(--c) 20%, var(--card)), color-mix(in srgb, var(--c) 9%, var(--card))); border-right:3px solid var(--c);}
.fr > *{position:relative;} .fr b.name{font-weight:700; font-size:15.5px; display:block;} .fr .m{font-size:12px; color:var(--ink-quiet);}
.fr .acts2{display:flex; gap:6px; align-items:center;}
.fr.mine{grid-template-columns:44px 1fr auto auto;} .fr.mine .mark{border-radius:50%;}
.fr.new{border-style:dashed; background:transparent; justify-items:start;} .fr.new::before{display:none;}
@media (max-width:640px){ .fr{grid-template-columns:40px 1fr auto; padding:12px 14px;} .fr .try, .fr .reach{display:none;} .fr::before{top:auto; height:5px; border-right:0; background:var(--c);} }`, `
${head("Curated collections of flashcards. New subjects are on the way.")}
<div class="gap"></div>
${search()}
<div class="gap"></div>
${tabs("all", '<span class="hint" style="font-size:12.5px;color:var(--ink-quiet)">4 collections in your review · 1,328 cards learned</span>')}
<div class="gap"></div>
${SECTIONS.map(([label, cs]) => secH(label, cs.length) + `<div class="rows">${cs.map(([id,n,have,plan,st,decks]) => `<a class="fr" href="#coll" style="--c:${col(id)}; --w:${pct(st,have)}%"><span class="mark" style="--c:${col(id)}">${ic(id)}</span><span><b class="name">${n}</b><span class="m">${decks} decks · ${fmt(have)} cards${st?` · ${st} learned · ${pct(st,have)}%`:""}</span></span><span class="reach${have>=plan?" full":""}">${have>=plan?"Complete":fmt(have)+" of "+fmt(plan)+" planned"}</span><a class="try" href="#try">Try ten</a><span class="acts2"><a class="ic-btn${ACTIVE.has(id)?" on":""}" href="#add" aria-label="Add to review"><svg viewBox="0 0 24 24"><path d="${ACTIVE.has(id)?"m5 12 5 5 9-10":"M12 5v14M5 12h14"}"/></svg></a><a class="ic-btn" href="#open" aria-label="Expand"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></a></span></a>`).join("")}</div>`).join("")}
${secH("Languages", LANGS.length)}<div class="rows">${LANGS.map(([id,n,cards,decks]) => `<a class="fr" href="#coll" style="--c:${col(id)}; --w:0%"><span class="mark" style="--c:${col(id)}">${ic(id)}</span><span><b class="name">${n}</b><span class="m">${decks} decks · ${fmt(cards)} cards</span></span><span class="reach">Language deck</span><span></span><span class="acts2"><a class="ic-btn" href="#add" aria-label="Add"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></a><a class="ic-btn" href="#open" aria-label="Expand"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></a></span></a>`).join("")}</div>
${plannedFold()}
<div class="gap"></div>
${secH("Your decks", MINE.length)}${studioNote()}${studioActs()}
<div class="gap"></div>
<div class="rows">${MINE.map(([n,c,when,hue,st],i) => `<a class="fr mine" href="#mine" style="--c:${hue}; --w:0%"><span class="mark" style="--c:${hue}"><b style="font-family:var(--serif);font-size:18px">${n[0]}</b></span><span><b class="name">${n}</b><span class="m">${c} cards · ${when}</span></span><span class="pub ${pubLabel[st][1]}">${pubLabel[st][0]}</span><span class="acts2"><a class="btn small" href="#study">Study</a><a class="btn small ghost" href="#edit">${i===0?"Close":"Edit"}</a><a class="btn small ghost" href="#export">Export</a></span></a>${i===0?editor():""}`).join("")}</div>
${orphans()}
${sharedSec()}`);

/* ===== c-2 COVERS — two-up cover cards with a band; Your decks as cards with a dashed New card. */
OUT["c-2-covers"] = page("c-2: Covers", `
.cards{display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px;}
.cv{background:var(--card); border:1px solid var(--rule); border-radius:16px; overflow:hidden; display:flex; flex-direction:column; color:inherit;}
.cv .band{height:58px; background:linear-gradient(120deg, var(--c), color-mix(in srgb, var(--c) 62%, #1D1B29)); color:#fff; display:flex; align-items:center; gap:12px; padding:0 16px;} .cv .band svg{width:28px; height:28px;} .cv .band b{font-weight:800; font-size:16px; letter-spacing:-.01em;} .cv .band .reach{margin-left:auto; color:rgba(255,255,255,.85);} .cv .band .reach.full{color:#fff;}
.cv .in{padding:12px 16px 14px; display:grid; gap:8px;}
.cv .m{font-size:12.5px; color:var(--ink-quiet);} .cv .prog{height:6px;}
.cv .row{display:flex; justify-content:space-between; align-items:center; gap:8px;}
.cv.new{border:2px dashed var(--rule); background:transparent; align-items:center; justify-content:center; min-height:150px; text-align:center; color:var(--indigo); font-weight:800;}
@media (max-width:640px){ .cards{grid-template-columns:1fr;} .cv .band{height:50px;} .cv .band .reach{display:none;} }`, `
${head("Curated collections of flashcards. New subjects are on the way.")}
<div class="gap"></div>
<div style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center">${search()}${tabs("all")}</div>
<div class="gap"></div>
${SECTIONS.map(([label, cs]) => secH(label, cs.length) + `<div class="cards">${cs.map(([id,n,have,plan,st,decks]) => `<a class="cv" href="#coll" style="--c:${col(id)}"><span class="band">${ic(id)}<b>${n}</b><span class="reach${have>=plan?" full":""}">${have>=plan?"Complete":pct(have,plan)+"% written"}</span></span><span class="in"><span class="m">${decks} decks · ${fmt(have)} cards${st?` · <b>${st} learned</b>`:""}</span><span class="prog" style="--c:${col(id)}; --w:${pct(st,have)}%"><b></b></span><span class="row"><span class="cnt">${st?pct(st,have)+"% learned":"not started"}</span><span class="acts2" style="display:flex;gap:6px"><a class="try" href="#try">Try ten</a><a class="btn small${ACTIVE.has(id)?"":" ghost"}" href="#add">${ACTIVE.has(id)?"✓ In review":"+ Add"}</a></span></span></span></a>`).join("")}</div>`).join("")}
${secH("Languages", LANGS.length)}<div class="cards">${LANGS.map(([id,n,cards,decks]) => `<a class="cv" href="#coll" style="--c:${col(id)}"><span class="band">${ic(id)}<b>${n}</b><span class="reach">${decks} decks</span></span><span class="in"><span class="m">${fmt(cards)} cards · pick the decks you want</span><span class="row"><span class="cnt">not started</span><a class="btn small ghost" href="#add">+ Add</a></span></span></a>`).join("")}</div>
${plannedFold()}
<div class="gap"></div>
${secH("Your decks", MINE.length, '<a href="#import">Import a deck…</a>')}${studioNote()}
<div class="cards">${MINE.map(([n,c,when,hue,st]) => `<a class="cv" href="#mine" style="--c:${hue}"><span class="band"><b style="font-family:var(--serif);font-size:20px;font-weight:600">${n[0]}</b><b>${n}</b></span><span class="in"><span class="m">${c} cards · ${when}</span><span class="row"><span class="pub ${pubLabel[st][1]}">${pubLabel[st][0]}</span><span style="display:flex;gap:6px"><a class="btn small" href="#study">Study</a><a class="btn small ghost" href="#edit">Edit</a><a class="btn small ghost" href="#export">Export</a></span></span></span></a>`).join("")}<a class="cv new" href="#new">+ New deck<br><span style="font-size:12px;color:var(--ink-quiet);font-weight:400">write your own flashcards</span></a></div>
${editor()}
${orphans()}
${sharedSec()}`);

/* ===== c-3 LEDGER — the table, by section, with decks / cards / written / learned columns. */
OUT["c-3-ledger"] = page("c-3: Ledger", `
table{width:100%; border-collapse:collapse; background:var(--card); border:1px solid var(--rule); border-radius:14px; overflow:hidden; font-size:14px; margin-bottom:22px;}
th,td{padding:11px 12px; text-align:right; border-top:1px solid var(--rule); font-variant-numeric:tabular-nums; vertical-align:middle;}
th{font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-quiet); font-weight:600; border-top:0; background:var(--paper-2);}
th:first-child,td:first-child,th.p,td.p{text-align:left;} td.name{font-weight:700;} td.name .mark{width:32px; height:32px; border-radius:9px; display:inline-grid; vertical-align:middle; margin-right:10px;} td.name .mark svg{width:19px; height:19px;}
tr.grp td{background:var(--paper-2); font-family:var(--mono); font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-quiet); font-weight:600; padding:8px 12px;}
td.num{font-family:var(--mono); color:var(--ink-quiet);} td.p{width:26%;} td.p .prog{margin-top:5px;} td.acts2{white-space:nowrap;} td.acts2 a{margin-left:4px;}
@media (max-width:640px){ th,td{padding:9px 8px; font-size:13px;} td.p,th.p,td.num.d,th.d,td.num.w,th.w{display:none;} td.name .mark{width:26px; height:26px; margin-right:6px;} td.acts2 .try, td.acts2 .ghost, td.acts2 .danger{display:none;} td.acts2 .btn{padding:6px 8px;} }`, `
${head("Curated collections of flashcards. New subjects are on the way.")}
<div class="gap"></div>
${tabs("all", search())}
<div class="gap"></div>
<table><thead><tr><th>Collection</th><th class="d">Decks</th><th class="w">Written</th><th>Cards</th><th class="p">Learned</th><th></th></tr></thead><tbody>
${SECTIONS.map(([label, cs]) => `<tr class="grp"><td colspan="6">${label} · ${cs.length}</td></tr>` + cs.map(([id,n,have,plan,st,decks]) => `<tr><td class="name"><span class="mark" style="--c:${col(id)}">${ic(id)}</span>${n}</td><td class="num d">${decks}</td><td class="num w"><span class="reach${have>=plan?" full":""}">${have>=plan?"Complete":pct(have,plan)+"%"}</span></td><td class="num">${fmt(have)}</td><td class="p"><span class="cnt">${st?`<b>${st}</b> · ${pct(st,have)}%`:"—"}</span><span class="prog" style="--c:${col(id)}; --w:${pct(st,have)}%"><b></b></span></td><td class="acts2"><a class="try" href="#try">Try ten</a><a class="ic-btn${ACTIVE.has(id)?" on":""}" href="#add" style="display:inline-grid;vertical-align:middle"><svg viewBox="0 0 24 24"><path d="${ACTIVE.has(id)?"m5 12 5 5 9-10":"M12 5v14M5 12h14"}"/></svg></a></td></tr>`).join("")).join("")}
<tr class="grp"><td colspan="6">Languages · ${LANGS.length}</td></tr>
${LANGS.map(([id,n,cards,decks]) => `<tr><td class="name"><span class="mark" style="--c:${col(id)}">${ic(id)}</span>${n}</td><td class="num d">${decks}</td><td class="num w"><span class="reach">Deck</span></td><td class="num">${fmt(cards)}</td><td class="p"><span class="cnt">—</span></td><td class="acts2"><a class="ic-btn" href="#add" style="display:inline-grid;vertical-align:middle"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></a></td></tr>`).join("")}
</tbody></table>
${plannedFold()}
<div class="gap"></div>
${secH("Your decks", MINE.length)}${studioNote()}${studioActs()}
<div class="gap"></div>
<table><thead><tr><th>Deck</th><th>Cards</th><th class="p">Edited</th><th>Sharing</th><th></th></tr></thead><tbody>
${MINE.map(([n,c,when,hue,st]) => `<tr><td class="name"><span class="mark" style="--c:${hue}"><b style="font-family:var(--serif)">${n[0]}</b></span>${n}</td><td class="num">${c}</td><td class="p"><span class="cnt">${when}</span></td><td><span class="pub ${pubLabel[st][1]}">${pubLabel[st][0]}</span></td><td class="acts2"><a class="btn small" href="#study">Study</a><a class="btn small ghost" href="#edit">Edit</a><a class="btn small ghost" href="#export">Export</a><a class="btn small danger" href="#del">Delete</a></td></tr>`).join("")}
</tbody></table>
${editor()}
${orphans()}
${sharedSec()}`);

/* ===== c-4 ATLAS — a summary banner in the study banner's blue; compact tiles with a mini ring; Your decks tiles. */
OUT["c-4-atlas"] = page("c-4: Atlas", `
.sum{position:relative; overflow:hidden; border-radius:20px; background:linear-gradient(135deg, var(--sky), var(--sky-2)); color:var(--sky-ink); padding:26px 30px; display:grid; grid-template-columns:1fr auto; gap:20px; align-items:center; box-shadow:var(--shadow-md);}
.sum .eyebrow{color:var(--sky-rose);} .sum h2{font-family:var(--serif); font-weight:500; font-size:34px; margin:6px 0 10px; line-height:1.1; color:#fff;} .sum h2 b{font-weight:600; color:var(--sky-rose);}
.sum .pile{display:flex; gap:24px;} .sum .pile div{text-align:center;} .sum .pile b{display:block; font-size:26px; font-weight:800; line-height:1;} .sum .pile span{font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; opacity:.7;}
.sum .gdeco{right:-60px; bottom:-90px; width:260px; height:260px; border-color:rgba(255,255,255,.6);} .sum .gdeco i{border-color:rgba(255,255,255,.4);}
.tiles{display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:22px;}
.tl{display:grid; grid-template-columns:auto 1fr; gap:4px 12px; align-items:center; background:var(--card); border:1px solid var(--rule); border-radius:14px; padding:12px 14px; color:inherit; position:relative;}
.tl .ring{grid-row:span 2; width:44px; height:44px; position:relative;} .tl .ring svg{width:44px; height:44px; transform:rotate(-90deg);} .tl .ring .ic{position:absolute; inset:0; display:grid; place-content:center; color:var(--c);} .tl .ring .ic svg{width:20px; height:20px; transform:none;}
.tl b{font-weight:700; font-size:14px; line-height:1.15;} .tl .m{font-size:11.5px; color:var(--ink-quiet);}
.tl .on{position:absolute; right:10px; top:10px; width:16px; height:16px; border-radius:50%; background:var(--good); color:#fff; font-size:10px; font-weight:800; display:grid; place-content:center;}
.tl.new{border:2px dashed var(--rule); background:transparent; grid-template-columns:1fr; text-align:center; color:var(--indigo); font-weight:800;}
@media (max-width:1024px){ .tiles{grid-template-columns:repeat(3,1fr);} }
@media (max-width:640px){ .tiles{grid-template-columns:1fr 1fr; gap:8px;} .sum{grid-template-columns:1fr; padding:20px;} .sum h2{font-size:28px;} .sum .pile{gap:16px;} }`, `
${head()}
<div class="gap"></div>
<section class="sum"><div><span class="eyebrow">Your study</span><h2><b>4 collections</b> in your review.</h2><div class="pile"><div><b>1,328</b><span>cards learned</span></div><div><b>2,490</b><span>in your decks</span></div><div><b>29</b><span>due today</span></div><div><b>3</b><span>decks of your own</span></div></div></div>${'<div class="gdeco"><i></i><i></i><i></i><i></i></div>'}</section>
<div class="gap"></div>
<div style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center">${search()}${tabs("all")}</div>
<div class="gap"></div>
${SECTIONS.map(([label, cs]) => secH(label, cs.length) + `<div class="tiles">${cs.map(([id,n,have,plan,st,decks]) => { const C=2*Math.PI*19; return `<a class="tl" href="#coll" style="--c:${col(id)}">${ACTIVE.has(id)?'<span class="on">✓</span>':""}<span class="ring"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" fill="none" stroke="var(--paper-2)" stroke-width="4"/><circle cx="22" cy="22" r="19" fill="none" stroke="${col(id)}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${C*pct(st,have)/100} ${C}"/></svg><span class="ic">${ic(id)}</span></span><b>${n}</b><span class="m">${fmt(have)} cards${st?` · ${pct(st,have)}%`:""} · <span class="reach${have>=plan?" full":""}">${have>=plan?"complete":pct(have,plan)+"% written"}</span></span></a>`; }).join("")}</div>`).join("")}
${secH("Languages", LANGS.length)}<div class="tiles">${LANGS.map(([id,n,cards,decks]) => `<a class="tl" href="#coll" style="--c:${col(id)}"><span class="ring"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" fill="none" stroke="var(--paper-2)" stroke-width="4"/></svg><span class="ic">${ic(id)}</span></span><b>${n}</b><span class="m">${decks} decks · ${fmt(cards)} cards</span></a>`).join("")}</div>
${plannedFold()}
<div class="gap"></div>
${secH("Your decks", MINE.length, '<a href="#import">Import a deck…</a>')}${studioNote()}
<div class="tiles">${MINE.map(([n,c,when,hue,st]) => `<a class="tl" href="#mine" style="--c:${hue}"><span class="ring"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" fill="none" stroke="${hue}" stroke-width="4"/></svg><span class="ic"><b style="font-family:var(--serif);font-size:18px">${n[0]}</b></span></span><b>${n}</b><span class="m">${c} cards · <span class="pub ${pubLabel[st][1]}" style="padding:1px 5px">${pubLabel[st][0]}</span></span></a>`).join("")}<a class="tl new" href="#new">+ New deck</a></div>
${editor()}
${orphans()}
${sharedSec()}`);

/* ===== c-5 WORKBENCH — two columns on desktop: the catalogue left, your decks and the editor right. */
OUT["c-5-workbench"] = page("c-5: Workbench", `
.wrap{max-width:1240px;}
.cols{display:grid; grid-template-columns:1.15fr 1fr; gap:24px; align-items:start;}
.list{display:grid; gap:6px; margin-bottom:20px;}
.cr{display:grid; grid-template-columns:36px 1fr auto auto; gap:12px; align-items:center; padding:9px 12px; border-radius:10px; background:var(--card); border:1px solid var(--rule); color:inherit;}
.cr .mark{width:36px; height:36px; border-radius:10px;} .cr .mark svg{width:20px; height:20px;}
.cr b{font-weight:700; font-size:14px; display:block;} .cr .m{font-size:11.5px; color:var(--ink-quiet);} .cr .prog{height:4px; margin-top:5px; max-width:220px;}
.cr .reach{text-align:right;}
.bench{background:var(--paper-2); border:1px solid var(--rule); border-radius:18px; padding:18px; display:grid; gap:14px; position:sticky; top:16px;}
.bench .editor{box-shadow:none;}
.mine-row{display:grid; grid-template-columns:36px 1fr auto; gap:12px; align-items:center; padding:9px 12px; border-radius:10px; background:var(--card); border:1px solid var(--rule); color:inherit;}
.mine-row.on{border-color:var(--indigo); box-shadow:inset 0 0 0 1px var(--indigo);} .mine-row b{font-weight:700; font-size:14px; display:block;} .mine-row .m{font-size:11.5px; color:var(--ink-quiet);}
.bench .ed-cols{grid-template-columns:1fr;}
@media (max-width:1024px){ .cols{grid-template-columns:1fr;} .bench{position:static;} }
@media (max-width:640px){ .cr{grid-template-columns:32px 1fr auto;} .cr .reach{display:none;} }`, `
${head("Curated collections on the left; your own decks on the right.")}
<div class="gap"></div>
<div class="cols">
  <div>
    ${tabs("all")}
    <div class="gap"></div>
    ${search()}
    <div class="gap"></div>
    ${SECTIONS.map(([label, cs]) => secH(label, cs.length) + `<div class="list">${cs.map(([id,n,have,plan,st,decks]) => `<a class="cr" href="#coll" style="--c:${col(id)}"><span class="mark">${ic(id)}</span><span><b>${n}</b><span class="m">${decks} decks · ${fmt(have)} cards${st?` · ${st} learned`:""}</span><span class="prog" style="--w:${pct(st,have)}%"><b></b></span></span><span class="reach${have>=plan?" full":""}">${have>=plan?"Complete":pct(have,plan)+"%<br>written"}</span><a class="ic-btn${ACTIVE.has(id)?" on":""}" href="#add"><svg viewBox="0 0 24 24"><path d="${ACTIVE.has(id)?"m5 12 5 5 9-10":"M12 5v14M5 12h14"}"/></svg></a></a>`).join("")}</div>`).join("")}
    ${secH("Languages", LANGS.length)}<div class="list">${LANGS.map(([id,n,cards,decks]) => `<a class="cr" href="#coll" style="--c:${col(id)}"><span class="mark">${ic(id)}</span><span><b>${n}</b><span class="m">${decks} decks · ${fmt(cards)} cards</span></span><span class="reach">Deck</span><a class="ic-btn" href="#add"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></a></a>`).join("")}</div>
    ${plannedFold()}
  </div>
  <aside class="bench">
    <div class="sec-h" style="margin:0"><span>Your decks<em>${MINE.length}</em></span><a href="#import">Import…</a></div>
    ${MINE.map(([n,c,when,hue,st],i) => `<a class="mine-row${i===0?" on":""}" href="#mine"><span class="mark" style="--c:${hue};width:36px;height:36px;border-radius:50%"><b style="font-family:var(--serif)">${n[0]}</b></span><span><b>${n}</b><span class="m">${c} cards · ${when}</span></span><span class="pub ${pubLabel[st][1]}">${pubLabel[st][0]}</span></a>`).join("")}
    <a class="btn" href="#new" style="justify-self:start">+ New deck</a>
    ${editor()}
    ${orphans()}
  </aside>
</div>
${sharedSec()}`);

/* ===== c-6 SPINES — upright cover cards four across, like a shelf of books; Your decks as hand-labelled spines. */
OUT["c-6-spines"] = page("c-6: Spines", `
.shelf{display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:26px;}
.sp{display:flex; flex-direction:column; background:var(--card); border:1px solid var(--rule); border-radius:12px; overflow:hidden; color:inherit; min-height:190px;}
.sp .cover{flex:1; background:linear-gradient(160deg, color-mix(in srgb, var(--c) 88%, #fff), var(--c) 55%, color-mix(in srgb, var(--c) 70%, #1D1B29)); color:#fff; padding:14px; display:flex; flex-direction:column; justify-content:space-between; position:relative;}
.sp .cover svg{width:30px; height:30px; opacity:.95;} .sp .cover b{font-weight:800; font-size:15px; line-height:1.15; letter-spacing:-.01em; text-shadow:0 1px 2px rgba(0,0,0,.25);}
.sp .cover .on{position:absolute; right:10px; top:10px; width:20px; height:20px; border-radius:50%; background:#fff; color:var(--good); font-size:11px; font-weight:800; display:grid; place-content:center;}
.sp .in{padding:9px 12px 11px; display:grid; gap:5px;} .sp .m{font-size:11.5px; color:var(--ink-quiet);} .sp .prog{height:4px;}
.sp .row{display:flex; justify-content:space-between; align-items:center; margin-top:2px;}
.sp.new .cover{background:transparent; border:2px dashed var(--rule); border-radius:12px; color:var(--indigo); align-items:center; justify-content:center; text-align:center; font-weight:800;}
@media (max-width:1024px){ .shelf{grid-template-columns:repeat(3,1fr);} }
@media (max-width:640px){ .shelf{grid-template-columns:1fr 1fr; gap:8px;} .sp{min-height:160px;} .sp .cover{padding:10px;} .sp .cover b{font-size:13.5px;} .sp .row .try{display:none;} }`, `
${head("Curated collections of flashcards. New subjects are on the way.")}
<div class="gap"></div>
${tabs("all", search())}
<div class="gap"></div>
${SECTIONS.map(([label, cs]) => secH(label, cs.length) + `<div class="shelf">${cs.map(([id,n,have,plan,st,decks]) => `<a class="sp" href="#coll" style="--c:${col(id)}"><span class="cover">${ACTIVE.has(id)?'<span class="on">✓</span>':""}${ic(id)}<b>${n}</b></span><span class="in"><span class="m">${fmt(have)} cards · <span class="reach${have>=plan?" full":""}">${have>=plan?"complete":pct(have,plan)+"% written"}</span></span><span class="prog" style="--w:${pct(st,have)}%"><b></b></span><span class="row"><span class="cnt">${st?pct(st,have)+"% learned":"not started"}</span><a class="try" href="#try">Try ten</a></span></span></a>`).join("")}</div>`).join("")}
${secH("Languages", LANGS.length)}<div class="shelf">${LANGS.map(([id,n,cards,decks]) => `<a class="sp" href="#coll" style="--c:${col(id)}"><span class="cover">${ic(id)}<b>${n}</b></span><span class="in"><span class="m">${decks} decks · ${fmt(cards)} cards</span><span class="row"><span class="cnt">not started</span><a class="try" href="#add">+ Add</a></span></span></a>`).join("")}</div>
${plannedFold()}
<div class="gap"></div>
${secH("Your decks", MINE.length, '<a href="#import">Import a deck…</a>')}${studioNote()}
<div class="shelf">${MINE.map(([n,c,when,hue,st]) => `<a class="sp" href="#mine" style="--c:${hue}"><span class="cover"><b style="font-family:var(--serif);font-size:26px;font-weight:600">${n[0]}</b><b>${n}</b></span><span class="in"><span class="m">${c} cards · ${when}</span><span class="row"><span class="pub ${pubLabel[st][1]}">${pubLabel[st][0]}</span><a class="try" href="#edit">Edit</a></span></span></a>`).join("")}<a class="sp new" href="#new"><span class="cover">+ New deck</span></a></div>
${editor()}
${orphans()}
${sharedSec()}`);

const unnest = (h) => h.replace(/<a class="(try|ic-btn[^"]*|btn small[^"]*)" href="#[^"]*"([^>]*)>([\s\S]*?)<\/a>/g, '<span class="$1"$2>$3</span>');
for (const [n, h] of Object.entries(OUT)) fs.writeFileSync(path.join(__dirname, n + ".html"), unnest(h));
console.log("wrote", Object.keys(OUT).join(", "));
