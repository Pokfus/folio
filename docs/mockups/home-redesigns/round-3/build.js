#!/usr/bin/env node
/* build.js — generates the round-3 home-page mockups (r3-1 … r3-6).
   Round 3 answers the review of round 2: every design has its OWN game-tile form and its OWN active-deck
   list; the quote has the breathing space it has on the live page; each deck row shows the blue / red /
   green new / learning / review counts the live rows carry; the streak is compact. Reuses round 2's
   _parts.css for the banner, the boxes and the nav, and overrides what changes. Not part of the site. */
"use strict";
const fs = require("fs"), path = require("path");
const G = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "round-2", "glyphs.json"), "utf8"));
const R2 = fs.readFileSync(path.join(__dirname, "..", "round-2", "build.js"), "utf8");
/* borrow round 2's markup helpers by evaluating its helper section (everything before the pages) */
const helpers = R2.slice(R2.indexOf("const I = {"), R2.indexOf("/* ---------- shared parts (style)"));
const H = new Function("G", helpers + "\nreturn {I, NAV, NAVR, navLinks, brand, topbar, tabbar, phoneHead, estimate, pile, cardPreview, banner, readingBox, atlasBox, foot, greet};")(G);
const { I, NAV, NAVR, navLinks, brand, topbar, tabbar, phoneHead, estimate, pile, cardPreview, banner, readingBox, atlasBox, foot, greet } = H;

const GAMES = [["challenge","choices","Multiple Choice","done","5/5"],["chrono","timeline","Timeline","done","4/5"],["truefalse","truefalse","True or False","",""],["whosaid","whosaid","Who said it?","",""],["findit","findit","Find it","done","3/5"],["thread","thread","Common Thread","",""],["crossword","crossword","Crossword","",""],["picture","picture","Picture round","",""],["whatyear","whatyear","What year?","",""]];
/* each deck: name, hue, new, learning, review, total, done-today, decks */
const DECKS = [["World History","#4F74C2",1,2,8,810,0,8],["Ancient Greece","#2BA6A0",1,1,6,1000,0,6],["Ancient Rome","#D9544C",0,1,5,580,0,7],["Japan","#DB8B3A",0,0,4,100,0,9]];
const counts = (d, cls="") => `<span class="dkc ${cls}"><b class="n${d[2]?"":" z"}">${d[2]}</b><b class="l${d[3]?"":" z"}">${d[3]}</b><b class="r${d[4]?"":" z"}">${d[4]}</b></span>`;

/* the quote with the live page's room around it: 38px above and below, centred, a rose mark, the dash */
const quote = (cls="") => `<figure class="dq ${cls}"><span class="mark">“</span><blockquote>Life has a limit, but knowledge has none.</blockquote><figcaption><span class="who">Zhuangzi</span><span class="src"><i>Zhuangzi</i>, ch. 3</span></figcaption></figure>`;

const BASE_CSS = `
.dq{margin:0; padding:38px 16px; text-align:center;}
.dq .mark{display:block; font-family:var(--serif); font-size:34px; line-height:.6; color:var(--zh); margin-bottom:16px;}
.dq blockquote{margin:0 auto; max-width:40ch; font-family:var(--serif); font-style:italic; font-size:22px; line-height:1.45; color:var(--ink);}
.dq figcaption{margin-top:14px; font-family:var(--mono); font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-quiet);}
.dq .who::before{content:""; display:inline-block; width:16px; height:2px; background:var(--ochre); vertical-align:middle; margin-right:9px;}
.dq .src{display:block; font-family:var(--serif); font-size:13px; letter-spacing:0; text-transform:none; color:var(--ink-quiet); margin-top:6px;}
.dkc{display:inline-flex; gap:8px; font-family:var(--mono); font-size:13px; font-weight:600; font-variant-numeric:tabular-nums;}
.dkc .n{color:var(--indigo-bright);} .dkc .l{color:var(--zh);} .dkc .r{color:var(--good);} .dkc .z{color:var(--ink-faint); font-weight:500;}
.legend{font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet); display:inline-flex; gap:10px;}
.legend i{display:inline-block; width:7px; height:7px; border-radius:50%; margin-right:4px; vertical-align:1px;}
.legend .n i{background:var(--indigo-bright);} .legend .l i{background:var(--zh);} .legend .r i{background:var(--good);}
.sec-h{display:flex; justify-content:space-between; align-items:baseline; gap:12px; margin:0 0 12px; font-family:var(--mono); font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-quiet); font-weight:600;}
.sec-h a{color:var(--indigo); font-family:var(--sans); font-size:13px; font-weight:700; letter-spacing:0; text-transform:none;}
@media (max-width:640px){ .dq{padding:28px 8px;} .dq blockquote{font-size:19px;} }
`;

const legend = () => `<span class="legend"><span class="n"><i></i>New</span><span class="l"><i></i>Learning</span><span class="r"><i></i>Review</span></span>`;

const page = (title, css, body) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Folio — home redesign ${title}</title>
<link rel="stylesheet" href="../../../../fonts.css" />
<link rel="stylesheet" href="../_tokens.css" />
<link rel="stylesheet" href="../round-2/_parts.css" />
<style>
${BASE_CSS}
${css}
</style>
</head>
<body>
${body}
${tabbar()}
<script src="../_theme.js"></script>
</body>
</html>
`;
const OUT = {};

/* ===== r3-1 ATRIUM — one centred column; app-icon game tiles; decks as segmented bars; streak as a pill by the greeting. */
OUT["r3-1-atrium"] = page("r3-1: Atrium", `
.wrap{max-width:900px; margin:0 auto; padding:26px 24px 60px;}
.head{display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap;}
.streak-pill{display:inline-flex; align-items:center; gap:12px; background:var(--card); border:1px solid var(--rule); border-radius:999px; padding:8px 14px 8px 10px;}
.streak-pill .n{font-size:22px; font-weight:800; color:var(--good); letter-spacing:-.03em; line-height:1;}
.streak-pill .t{font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet); line-height:1.3;}
.streak-pill .dots{display:flex; gap:4px;} .streak-pill .dots i{width:9px; height:9px; border-radius:50%; background:var(--good);} .streak-pill .dots i.t{background:transparent; border:2px solid var(--good); box-sizing:border-box;}
/* decks as segmented bars */
.seg{display:grid; gap:10px;}
.seg .row{display:grid; grid-template-columns:1fr auto; gap:6px 16px; align-items:center; background:var(--card); border:1px solid var(--rule); border-radius:14px; padding:14px 18px;}
.seg .row b.name{font-weight:700; font-size:15px;} .seg .row .meta{font-family:var(--mono); font-size:11px; color:var(--ink-faint); margin-left:10px;}
.seg .bar{grid-column:1 / -1; display:flex; height:10px; border-radius:5px; overflow:hidden; background:var(--paper-2);}
.seg .bar i{display:block; height:100%;} .seg .bar .n{background:var(--indigo-bright);} .seg .bar .l{background:var(--zh);} .seg .bar .r{background:var(--good);}
.seg .dkc{font-size:14px; gap:12px;}
/* games as app icons */
.apps{display:grid; grid-template-columns:repeat(3,1fr); gap:14px;}
.app{display:flex; flex-direction:column; align-items:center; gap:10px; padding:18px 10px 14px; background:var(--card); border:1px solid var(--rule); border-radius:18px; text-align:center;}
.app .ic{width:64px; height:64px; border-radius:18px; background:linear-gradient(145deg, var(--tile), color-mix(in srgb, var(--tile) 70%, #1D1B29)); color:#fff; display:grid; place-content:center; box-shadow:0 6px 14px color-mix(in srgb, var(--tile) 35%, transparent); position:relative;}
.app .ic svg{width:32px; height:32px;}
.app b{font-weight:700; font-size:14.5px; line-height:1.15;} .app span{font-size:11.5px; color:var(--ink-quiet);}
.app.done .ic::after{content:"✓"; position:absolute; right:-6px; top:-6px; width:22px; height:22px; border-radius:50%; background:var(--good); border:2px solid var(--card); font-size:12px; font-weight:800; display:grid; place-content:center;}
.app.done span{color:var(--good); font-weight:700;}
.two{display:grid; grid-template-columns:1fr 1fr; gap:16px;}
.gap{height:26px;}
@media (max-width:640px){ .wrap{padding:18px 16px 100px;} .apps{gap:8px;} .app{padding:12px 6px 10px; border-radius:14px;} .app .ic{width:52px; height:52px; border-radius:14px;} .app .ic svg{width:26px; height:26px;} .app b{font-size:13px;} .two{grid-template-columns:1fr;} .seg .row{padding:12px 14px;} }`, `
${topbar()}
<main class="wrap">
  ${phoneHead()}
  <div class="head">${greet()}<div class="streak-pill"><span class="n">12</span><span class="t">day streak<br>longest 31</span><span class="dots"><i></i><i></i><i></i><i></i><i></i><i></i><i class="t"></i></span></div></div>
  ${quote()}
  ${banner({preview:true})}
  <div class="gap"></div>
  <div class="sec-h"><span>Active decks · 29 today</span>${legend()}</div>
  <div class="seg">${DECKS.map(d => `<a class="row" href="#decks"><span><b class="name">${d[0]}</b><span class="meta">${d[5].toLocaleString()} cards · ${d[7]} decks</span></span>${counts(d)}<span class="bar"><i class="n" style="width:${d[2]/11*100}%"></i><i class="l" style="width:${d[3]/11*100}%"></i><i class="r" style="width:${d[4]/11*100}%"></i></span></a>`).join("")}</div>
  <div class="gap"></div>
  <div class="sec-h"><span>Minigames · 3 of 9 played</span><a href="#chest">Play all nine for the chest</a></div>
  <div class="apps">${GAMES.map(([k,g,t,d,s]) => `<a class="app ${d}" href="#${k}" style="--tile:var(--g-${k})"><span class="ic">${G[g]}</span><b>${t}</b><span>${d?`Played · ${s}`:"Play"}</span></a>`).join("")}</div>
  <div class="gap"></div>
  <div class="two">${readingBox()}${atlasBox()}</div>
  ${foot()}
</main>`);

/* ===== r3-2 LEDGER — a side rail; decks as a TABLE with totals; games as wide list-tiles; a one-line stat strip. */
OUT["r3-2-ledger"] = page("r3-2: Ledger", `
.shell{display:grid; grid-template-columns:232px 1fr; min-height:100vh;}
.rail{background:var(--card); border-right:1px solid var(--rule); padding:22px 14px; display:flex; flex-direction:column; gap:4px;}
.rail .brand{display:block; padding:4px 10px 18px; font-size:24px;} .rail .brand small{display:block; margin:2px 0 0;}
.rail .nl{padding:10px 12px; font-family:var(--sans); font-size:14px; letter-spacing:0; text-transform:none; font-weight:600; color:var(--ink-soft); border-radius:10px;}
.rail .nl.on{background:var(--indigo-wash); color:var(--indigo); box-shadow:none; border-radius:10px;} .rail .nl svg{width:18px; height:18px;} .rail .sp{flex:1;}
.main{padding:28px 36px 60px; max-width:1180px; width:100%;}
.strip{display:grid; grid-template-columns:repeat(4,1fr); background:var(--card); border:1px solid var(--rule); border-radius:14px; overflow:hidden; margin-top:4px;}
.strip div{padding:12px 18px; border-left:1px solid var(--rule);} .strip div:first-child{border-left:0;}
.strip b{display:block; font-size:24px; font-weight:800; letter-spacing:-.03em; line-height:1;} .strip span{font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet);}
.strip .g b{color:var(--good);} .strip .dots{display:inline-flex; gap:3px; margin-left:8px; vertical-align:middle;} .strip .dots i{width:8px; height:8px; border-radius:50%; background:var(--good);} .strip .dots i.t{background:transparent; border:2px solid var(--good); box-sizing:border-box;}
.cols{display:grid; grid-template-columns:1.5fr 1fr; gap:22px; margin-top:26px; align-items:start;}
table{width:100%; border-collapse:collapse; background:var(--card); border:1px solid var(--rule); border-radius:14px; overflow:hidden; font-size:14px;}
th,td{padding:12px 14px; text-align:right; border-top:1px solid var(--rule); font-variant-numeric:tabular-nums;}
th{font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-quiet); font-weight:600; border-top:0; background:var(--paper-2);}
th:first-child,td:first-child{text-align:left;} td:first-child{font-weight:700;} td:first-child i{display:inline-block; width:9px; height:9px; border-radius:2px; background:var(--c); margin-right:10px;}
th.n{color:var(--indigo-bright);} th.l{color:var(--zh);} th.r{color:var(--good);}
td.n{color:var(--indigo-bright); font-family:var(--mono); font-weight:600;} td.l{color:var(--zh); font-family:var(--mono); font-weight:600;} td.r{color:var(--good); font-family:var(--mono); font-weight:600;} td.z{color:var(--ink-faint); font-weight:500;}
td.t{color:var(--ink-quiet); font-family:var(--mono); font-size:12px;}
tr.sum td{background:var(--paper-2); font-weight:800; border-top:2px solid var(--rule);}
td .go{display:inline-block; font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--indigo); font-weight:700;}
.list{display:grid; grid-template-columns:1fr 1fr; gap:10px;}
.lt{display:grid; grid-template-columns:44px 1fr auto; align-items:center; gap:14px; background:var(--card); border:1px solid var(--rule); border-radius:12px; padding:10px 14px 10px 10px; box-shadow:inset 4px 0 0 var(--tile);}
.lt .ic{width:44px; height:44px; border-radius:50%; background:color-mix(in srgb, var(--tile) 18%, var(--card)); color:var(--tile); display:grid; place-content:center;} .lt .ic svg{width:24px; height:24px;}
.lt b{font-weight:700; font-size:15px; display:block;} .lt span{font-size:12px; color:var(--ink-quiet);}
.lt .st{font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink-faint); border:1px solid var(--rule); border-radius:999px; padding:5px 10px;}
.lt.done .st{color:var(--good); border-color:color-mix(in srgb, var(--good) 50%, var(--rule)); background:color-mix(in srgb, var(--good) 10%, var(--card));}
.side{display:grid; gap:18px;}
@media (max-width:1024px){ .shell{grid-template-columns:72px 1fr;} .rail{padding:18px 10px; align-items:center;} .rail .brand{font-size:20px; padding:2px 0 14px;} .rail .brand small{display:none;} .rail .nl{padding:11px; justify-content:center;} .rail .nl span{display:none;} .main{padding:22px 22px 48px;} .cols{grid-template-columns:1fr;} .strip{grid-template-columns:1fr 1fr;} .strip div:nth-child(3){border-left:0; border-top:1px solid var(--rule);} .strip div:nth-child(4){border-top:1px solid var(--rule);} }
@media (max-width:640px){ .shell{grid-template-columns:1fr;} .rail{display:none;} .main{padding:18px 16px 100px;} th,td{padding:10px 8px; font-size:13px;} td.t,th.t,td:last-child,th:last-child{display:none;} th{letter-spacing:.06em; font-size:9px;} .list{grid-template-columns:1fr;} .strip{grid-template-columns:1fr 1fr;} .strip div:nth-child(3){border-left:0; border-top:1px solid var(--rule);} .strip div:nth-child(4){border-top:1px solid var(--rule);} }`, `
<div class="shell">
  <aside class="rail">${brand()}${navLinks(NAV)}<a class="nl" href="#search">${I.search}<span>Search</span></a><div class="sp"></div>${navLinks(NAVR.slice(1))}</aside>
  <main class="main">
    ${phoneHead()}
    ${greet()}
    ${quote()}
    ${banner()}
    <div class="strip">
      <div class="g"><b>12<span class="dots"><i></i><i></i><i></i><i></i><i></i><i></i><i class="t"></i></span></b><span>Day streak · longest 31</span></div>
      <div><b>0<small style="color:var(--ink-faint);font-size:14px">/29</small></b><span>Studied today</span></div>
      <div><b>3<small style="color:var(--ink-faint);font-size:14px">/9</small></b><span>Games played</span></div>
      <div><b>38%</b><span>The Histories, read</span></div>
    </div>
    <div class="cols">
      <div>
        <div class="sec-h"><span>Active decks</span><a href="#decks">+ Add decks</a></div>
        <table><thead><tr><th>Deck</th><th class="n">New</th><th class="l">Learning</th><th class="r">Review</th><th class="t">Cards</th><th></th></tr></thead><tbody>
        ${DECKS.map(d => `<tr><td><i style="--c:${d[1]}"></i>${d[0]}</td><td class="n${d[2]?"":" z"}">${d[2]}</td><td class="l${d[3]?"":" z"}">${d[3]}</td><td class="r${d[4]?"":" z"}">${d[4]}</td><td class="t">${d[5].toLocaleString()}</td><td><a class="go" href="#study">Study →</a></td></tr>`).join("")}
        <tr class="sum"><td>Today</td><td class="n">2</td><td class="l">4</td><td class="r">23</td><td class="t">2,490</td><td></td></tr>
        </tbody></table>
        <div class="sec-h" style="margin-top:26px"><span>Minigames · 3 of 9</span><a href="#chest">Play all nine for the chest</a></div>
        <div class="list">${GAMES.map(([k,g,t,d,s]) => `<a class="lt ${d}" href="#${k}" style="--tile:var(--g-${k})"><span class="ic">${G[g]}</span><span><b>${t}</b><span>${d?"Today's round is done":"A new round every day"}</span></span><span class="st">${d?`Played · ${s}`:"Play"}</span></a>`).join("")}</div>
      </div>
      <div class="side">${readingBox()}${atlasBox()}</div>
    </div>
    ${foot()}
  </main>
</div>`);

/* ===== r3-3 NOCTURNE — the dark-blue hero; decks as cover cards (2-up, vertical); stamp tiles; a streak ribbon. */
OUT["r3-3-nocturne"] = page("r3-3: Nocturne", `
.hero{position:relative; overflow:hidden; background:radial-gradient(ellipse at 85% 110%, var(--sky), var(--sky-2) 62%); color:var(--sky-ink);}
.hero .topbar{background:transparent; border:0; max-width:1200px; margin:0 auto;} .hero .brand{color:#fff;} .hero .brand small{color:rgba(255,255,255,.65);}
.hero .nl{color:rgba(242,243,255,.75);} .hero .nl.on{color:#fff; box-shadow:inset 0 -2px 0 var(--sky-rose);} .hero .nl.adm{color:#E7B6F0;}
.hero-in{max-width:1200px; margin:0 auto; padding:30px 28px 34px; display:grid; grid-template-columns:1fr auto; gap:30px; align-items:center;}
.hero .eyebrow{color:var(--sky-rose);} .hero h1{font-family:var(--serif); font-weight:500; font-size:50px; line-height:1.06; letter-spacing:-.02em; margin:10px 0 16px;} .hero h1 b{font-weight:600; color:var(--sky-rose);}
.hero .est{max-width:560px;} .hero .globe{width:280px; height:280px; border-color:rgba(255,255,255,.55);} .hero .globe i{border-color:rgba(255,255,255,.35);}
.phone-head .brand{color:#fff;} .phone-head .adm-pill{color:#E7B6F0; border-color:rgba(255,255,255,.3);}
.ribbon{background:var(--card); border-bottom:1px solid var(--rule);}
.ribbon-in{max-width:1200px; margin:0 auto; padding:12px 28px; display:flex; align-items:center; gap:18px; flex-wrap:wrap; font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet);}
.ribbon b{font-size:22px; font-weight:800; color:var(--good); letter-spacing:-.03em; font-family:var(--sans);}
.ribbon .days{display:flex; gap:4px;} .ribbon .days i{width:14px; height:14px; border-radius:4px; background:var(--good);} .ribbon .days i.a{opacity:.45;} .ribbon .days i.t{background:transparent; border:2px solid var(--good); box-sizing:border-box;}
.ribbon .r{margin-left:auto;}
.wrap{max-width:1200px; margin:0 auto; padding:10px 28px 60px;}
.body{display:grid; grid-template-columns:1.5fr 1fr; gap:24px; align-items:start;}
.deckgrid{display:grid; grid-template-columns:1fr 1fr; gap:14px;}
.dc{background:var(--card); border:1px solid var(--rule); border-radius:16px; overflow:hidden; display:flex; flex-direction:column;}
.dc .cover{height:54px; background:linear-gradient(120deg, var(--c), color-mix(in srgb, var(--c) 60%, #1D1B29)); position:relative;}
.dc .cover::after{content:attr(data-n); position:absolute; left:16px; bottom:10px; color:#fff; font-weight:800; font-size:16px; letter-spacing:-.01em;}
.dc .in{padding:12px 16px 14px;}
.dc .chips{display:flex; gap:6px; flex-wrap:wrap;}
.dc .chip{font-family:var(--mono); font-size:11px; font-weight:600; border-radius:8px; padding:5px 9px; border:1px solid var(--rule); background:var(--paper);}
.dc .chip b{font-size:14px; margin-right:5px;} .dc .chip.n b{color:var(--indigo-bright);} .dc .chip.l b{color:var(--zh);} .dc .chip.r b{color:var(--good);} .dc .chip.z b{color:var(--ink-faint);}
.dc .meta{display:flex; justify-content:space-between; margin-top:10px; font-size:12px; color:var(--ink-quiet);} .dc .meta a{color:var(--indigo); font-weight:700;}
.stamps{display:grid; grid-template-columns:repeat(3,1fr); gap:14px;}
.stamp{position:relative; background:var(--card); padding:6px; border-radius:6px; background-image:radial-gradient(circle, var(--paper) 2.5px, transparent 3px); background-size:12px 12px; background-position:0 0;}
.stamp .in{border:1px solid color-mix(in srgb, var(--tile) 45%, var(--rule)); background:linear-gradient(170deg, color-mix(in srgb, var(--tile) 22%, var(--card)), var(--card) 70%); border-radius:3px; padding:16px 12px 12px; text-align:center; min-height:122px; display:flex; flex-direction:column; align-items:center; gap:8px; position:relative;}
.stamp .in svg{width:40px; height:40px; color:var(--tile);}
.stamp b{font-weight:700; font-size:14px; line-height:1.15;} .stamp .st{font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet);}
.stamp.done .in::after{content:"PLAYED"; position:absolute; right:-6px; top:10px; transform:rotate(-14deg); font-family:var(--mono); font-size:9px; letter-spacing:.18em; color:var(--good); border:2px solid var(--good); border-radius:50%; width:52px; height:52px; display:grid; place-content:center; opacity:.85;}
.stamp.done .st{color:var(--good); font-weight:700;}
.side{display:grid; gap:18px;}
@media (max-width:1024px){ .hero-in{grid-template-columns:1fr; padding:26px 24px 24px;} .hero .globe{position:absolute; right:-60px; top:70px; width:210px; height:210px; opacity:.5;} .hero h1{font-size:40px;} .body{grid-template-columns:1fr;} .wrap{padding:10px 22px 56px;} .ribbon-in{padding:12px 22px;} }
@media (max-width:640px){ .hero{padding-top:16px;} .phone-head{padding:0 18px;} .hero-in{padding:8px 18px 18px;} .hero h1{font-size:34px;} .hero .globe{width:240px; height:240px; right:-110px; top:-30px; opacity:.3;} .wrap{padding:6px 16px 100px;} .deckgrid{grid-template-columns:1fr;} .stamps{gap:8px;} .stamp{padding:4px; background-size:10px 10px;} .stamp .in{padding:12px 6px 10px; min-height:108px;} .stamp.done .in::after{width:40px; height:40px; font-size:7px; right:-4px; top:4px;} .stamp .in svg{width:30px; height:30px;} .stamp b{font-size:12.5px;} .ribbon .r{margin-left:0;} }`, `
<section class="hero">
  ${topbar()}${phoneHead()}
  <div class="hero-in">
    <div><span class="eyebrow">Wednesday 1 October · Good afternoon, Scholar</span><h1><b>29 cards</b> are waiting.</h1>${pile()}${estimate()}
      <div class="acts"><a class="go" href="#review">${I.arrow}Start review</a><a class="try" href="#sample">Try ten cards — nothing is saved</a></div></div>
    <div class="globe"><i></i><i></i><i></i><i></i><b></b></div>
  </div>
</section>
<div class="ribbon"><div class="ribbon-in"><b>12</b><span>day streak</span><span class="days"><i class="a"></i><i></i><i></i><i class="a"></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i class="t"></i></span><span>last 14 days</span><span class="r">Longest · 31 days</span></div></div>
<main class="wrap">
  ${quote()}
  <div class="body">
    <div>
      <div class="sec-h"><span>Active decks</span>${legend()}</div>
      <div class="deckgrid">${DECKS.map(d => `<div class="dc"><div class="cover" style="--c:${d[1]}" data-n="${d[0]}"></div><div class="in"><div class="chips"><span class="chip n${d[2]?"":" z"}"><b>${d[2]}</b>new</span><span class="chip l${d[3]?"":" z"}"><b>${d[3]}</b>learning</span><span class="chip r${d[4]?"":" z"}"><b>${d[4]}</b>review</span></div><div class="meta"><span>${d[5].toLocaleString()} cards · ${d[7]} decks</span><a href="#study">Study →</a></div></div></div>`).join("")}</div>
      <div class="sec-h" style="margin-top:26px"><span>Minigames · 3 of 9</span><a href="#chest">Play all nine for the chest</a></div>
      <div class="stamps">${GAMES.map(([k,g,t,d,s]) => `<a class="stamp ${d}" href="#${k}" style="--tile:var(--g-${k})"><span class="in">${G[g]}<b>${t}</b><span class="st">${d?`Played · ${s}`:"Daily"}</span></span></a>`).join("")}</div>
    </div>
    <div class="side">${readingBox()}${atlasBox()}</div>
  </div>
  ${foot()}
</main>`);

/* ===== r3-4 SPREAD — an open book: the left page is the day, the right page the shelves. Rings per deck; trading-card tiles. */
OUT["r3-4-spread"] = page("r3-4: Spread", `
.book{max-width:1240px; margin:26px auto 60px; padding:0 24px; display:grid; grid-template-columns:1fr 1fr; gap:0;}
.pg{background:var(--card); border:1px solid var(--rule); padding:30px 32px 34px; min-width:0;}
.pg.l{border-radius:18px 0 0 18px; border-right:0; box-shadow:inset -18px 0 24px -22px rgba(29,27,41,.25);}
.pg.r{border-radius:0 18px 18px 0; box-shadow:inset 18px 0 24px -22px rgba(29,27,41,.25);}
.pg .num{font-family:var(--mono); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:14px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px 12px;}
.pg .study{margin-top:6px;}
.tally{display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:16px;}
.tally .box{padding:14px 16px;} .tally .streak .big{font-size:36px;} .tally .heat{grid-template-columns:repeat(14,9px); gap:2px; margin-top:8px;} .tally .heat i{width:9px; height:9px;}
.tally .streak{display:grid; grid-template-columns:auto 1fr; gap:4px 16px; align-items:center;} .tally .streak .k{grid-column:1 / -1; margin-bottom:2px;} .tally .streak .best{grid-column:1 / -1; margin-top:4px;}
.rings{display:grid; gap:8px;}
.ring{display:grid; grid-template-columns:48px 1fr auto; gap:14px; align-items:center; padding:10px 12px; border:1px solid var(--rule); border-radius:12px; background:var(--paper);}
.ring svg{width:48px; height:48px; transform:rotate(-90deg);}
.ring b.name{font-weight:700; font-size:15px; display:block;} .ring .m{font-size:12px; color:var(--ink-quiet);}
.pills{display:flex; gap:5px;} .pill{font-family:var(--mono); font-size:12px; font-weight:600; min-width:28px; text-align:center; padding:4px 7px; border-radius:7px;}
.pill.n{background:color-mix(in srgb, var(--indigo-bright) 14%, var(--card)); color:var(--indigo-bright);} .pill.l{background:color-mix(in srgb, var(--zh) 14%, var(--card)); color:var(--zh);} .pill.r{background:color-mix(in srgb, var(--good) 14%, var(--card)); color:var(--good);} .pill.z{background:var(--paper-2); color:var(--ink-faint);}
.cards{display:grid; grid-template-columns:repeat(3,1fr); gap:12px;}
.tc{border:1px solid var(--rule); border-radius:12px; overflow:hidden; background:var(--paper); display:flex; flex-direction:column;}
.tc .band{height:66px; background:linear-gradient(135deg, var(--tile), color-mix(in srgb, var(--tile) 65%, #1D1B29)); color:#fff; display:grid; place-content:center;} .tc .band svg{width:34px; height:34px;}
.tc .in{padding:10px 12px 12px;} .tc b{display:block; font-weight:700; font-size:14px; line-height:1.15;} .tc .st{display:block; font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet); margin-top:4px;}
.tc.done .band{position:relative;} .tc.done .band::after{content:"✓"; position:absolute; right:8px; top:8px; width:20px; height:20px; border-radius:50%; background:#fff; color:var(--good); font-size:12px; font-weight:800; display:grid; place-content:center;} .tc.done .st{color:var(--good);}
.duo{display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:12px;} .duo .box{padding:14px 16px;} .pg.l .duo .atlas > b{font-size:15px;}
@media (max-width:1024px){ .book{grid-template-columns:1fr; margin-top:20px;} .pg.l{border-radius:18px 18px 0 0; border-right:1px solid var(--rule); border-bottom:0; box-shadow:none;} .pg.r{border-radius:0 0 18px 18px; box-shadow:none;} .pg{padding:24px 24px 28px;} }
@media (max-width:640px){ .book{padding:0 16px; margin-bottom:100px;} .pg{padding:18px 16px 22px;} .tally{grid-template-columns:1fr;} .cards{gap:8px;} .tc .band{height:54px;} .tc b{font-size:12.5px;} .duo{grid-template-columns:1fr;} .ring{grid-template-columns:42px 1fr; } .ring .pills{grid-column:2;} }`, `
${topbar()}
<div class="book">
  <section class="pg l">
    ${phoneHead()}
    <div class="num"><span>Wednesday 1 October</span><span>Good afternoon, Scholar</span></div>
    ${quote()}
    ${banner()}
    <div class="tally">
      <section class="box streak"><span class="k">Streak</span><div class="big">12<small>days in a row</small></div><div class="heat"><i class="a"></i><i class="b"></i><i class="b"></i><i></i><i class="a"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="a"></i><i></i><i></i><i class="b"></i><i class="b"></i><i class="a"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="a"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="a"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="t"></i></div><div class="best">Longest · 31 days</div></section>
      ${readingBox()}
    </div>
    <div class="duo">${atlasBox()}<a class="box" href="#search" style="display:flex;align-items:center;gap:10px;color:var(--ink-quiet);font-size:13.5px">${I.search.replace('<svg','<svg style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2"')}Search cards, terms and books</a></div>
  </section>
  <section class="pg r">
    <div class="num"><span>Active decks · 29 today</span>${legend()}</div>
    <div class="rings">${DECKS.map(d => { const tot = d[2]+d[3]+d[4]; const C = 2*Math.PI*20; const seg = (v, off, col) => `<circle cx="24" cy="24" r="20" fill="none" stroke="${col}" stroke-width="6" stroke-dasharray="${C*v/tot} ${C}" stroke-dashoffset="${-C*off/tot}"/>`;
      return `<a class="ring" href="#study"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="none" stroke="var(--paper-2)" stroke-width="6"/>${d[2]?seg(d[2],0,"var(--indigo-bright)"):""}${d[3]?seg(d[3],d[2],"var(--zh)"):""}${seg(d[4],d[2]+d[3],"var(--good)")}</svg><span><b class="name">${d[0]}</b><span class="m">${tot} due · ${d[5].toLocaleString()} cards</span></span><span class="pills"><span class="pill n${d[2]?"":" z"}">${d[2]}</span><span class="pill l${d[3]?"":" z"}">${d[3]}</span><span class="pill r${d[4]?"":" z"}">${d[4]}</span></span></a>`; }).join("")}</div>
    <div class="num" style="margin-top:24px"><span>Minigames · 3 of 9</span><span>Play all nine for the chest</span></div>
    <div class="cards">${GAMES.map(([k,g,t,d,s]) => `<a class="tc ${d}" href="#${k}" style="--tile:var(--g-${k})"><span class="band">${G[g]}</span><span class="in"><b>${t}</b><span class="st">${d?`Played · ${s}`:"Play"}</span></span></a>`).join("")}</div>
  </section>
</div>
<div style="max-width:1240px;margin:0 auto;padding:0 24px 30px">${foot()}</div>`);

/* ===== r3-5 CONSOLE — a dense three-column console; monogram deck rows with a scoreboard; ticket tiles; a heat strip. */
OUT["r3-5-console"] = page("r3-5: Console", `
.wrap{max-width:1280px; margin:0 auto; padding:22px 28px 60px;}
.top-row{display:grid; grid-template-columns:1fr auto; gap:20px; align-items:center;}
.heatstrip{display:flex; align-items:center; gap:12px; background:var(--card); border:1px solid var(--rule); border-radius:12px; padding:10px 14px;}
.heatstrip b{font-size:26px; font-weight:800; color:var(--good); letter-spacing:-.03em; line-height:1;}
.heatstrip .t{font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet); line-height:1.35;}
.heatstrip .hs{display:grid; grid-template-columns:repeat(21,8px); gap:2px;} .heatstrip .hs i{width:8px; height:8px; border-radius:2px; background:var(--paper-2);} .heatstrip .hs i.b{background:var(--good);} .heatstrip .hs i.a{background:color-mix(in srgb, var(--good) 45%, var(--paper-2));} .heatstrip .hs i.t{outline:2px solid var(--indigo); outline-offset:1px;}
.grid{display:grid; grid-template-columns:1.3fr 1fr 1fr; gap:20px; margin-top:16px; align-items:start;}
.grid .study{grid-column:1 / -1; grid-template-columns:1fr auto;}
.panel{background:var(--card); border:1px solid var(--rule); border-radius:16px; padding:18px 20px;}
.mono-rows{display:grid; gap:6px;}
.mr{display:grid; grid-template-columns:40px 1fr auto; gap:12px; align-items:center; padding:8px 8px; border-radius:10px;}
.mr:hover{background:var(--paper);}
.mr .mg{width:40px; height:40px; border-radius:10px; background:var(--c); color:#fff; display:grid; place-content:center; font-family:var(--serif); font-weight:600; font-size:18px;}
.mr b{display:block; font-weight:700; font-size:14.5px;} .mr .m{font-size:11.5px; color:var(--ink-quiet);}
.score{display:grid; grid-template-columns:repeat(3,34px); gap:4px;}
.score i{display:grid; place-content:center; height:30px; border-radius:7px; font-family:var(--mono); font-style:normal; font-weight:700; font-size:13px; color:#fff;}
.score .n{background:var(--indigo-bright);} .score .l{background:var(--zh);} .score .r{background:var(--good);} .score .z{background:var(--paper-2); color:var(--ink-faint);}
.score-h{display:grid; grid-template-columns:repeat(3,34px); gap:4px; justify-content:end; font-family:var(--mono); font-size:8.5px; letter-spacing:.08em; text-transform:uppercase; text-align:center; color:var(--ink-quiet); margin-bottom:4px;}
.tickets{display:grid; grid-template-columns:1fr; gap:8px;}
.tk{display:grid; grid-template-columns:56px 1fr; border:1px solid var(--rule); border-radius:10px; overflow:hidden; background:var(--paper); min-height:54px;}
.tk .stub{background:var(--tile); color:#fff; display:grid; place-content:center; border-right:2px dashed var(--card); position:relative;} .tk .stub svg{width:24px; height:24px;}
.tk .stub::before,.tk .stub::after{content:""; position:absolute; right:-7px; width:12px; height:12px; border-radius:50%; background:var(--card);} .tk .stub::before{top:-6px;} .tk .stub::after{bottom:-6px;}
.tk .in{display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 12px;} .tk b{font-weight:700; font-size:14px;} .tk .st{font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet);}
.tk.done .stub{background:color-mix(in srgb, var(--tile) 55%, var(--card));} .tk.done .st{color:var(--good); font-weight:700;} .tk.done .in::after{content:"✓"; color:var(--good); font-weight:800;}
.col3{display:grid; gap:20px;}
@media (max-width:1024px){ .wrap{padding:20px 22px 48px;} .grid{grid-template-columns:1fr 1fr;} .col3{grid-column:1 / -1; grid-template-columns:1fr 1fr;} .top-row{grid-template-columns:1fr;} .heatstrip .hs{grid-template-columns:repeat(21,7px);} .heatstrip .hs i{width:7px; height:7px;} }
@media (max-width:640px){ .wrap{padding:18px 16px 100px;} .grid{grid-template-columns:1fr;} .col3{grid-template-columns:1fr;} .heatstrip{flex-wrap:wrap;} .score{grid-template-columns:repeat(3,30px);} .score-h{grid-template-columns:repeat(3,30px);} }`, `
${topbar()}
<main class="wrap">
  ${phoneHead()}
  <div class="top-row">${greet()}<div class="heatstrip"><b>12</b><span class="t">day streak<br>longest 31</span><span class="hs">${"a b b 0 a b b b a 0 0 b b a b b b a b b t".split(" ").map(c => `<i class="${c==="0"?"":c}"></i>`).join("")}</span></div></div>
  ${quote()}
  <div class="grid">
    ${banner({preview:true})}
    <section class="panel">
      <div class="sec-h"><span>Active decks</span><a href="#decks">+ Add decks</a></div>
      <div class="score-h"><span>New</span><span>Learn</span><span>Review</span></div>
      <div class="mono-rows">${DECKS.map(d => `<a class="mr" href="#study"><span class="mg" style="--c:${d[1]}">${d[0][0]}</span><span><b>${d[0]}</b><span class="m">${d[5].toLocaleString()} cards · ${d[7]} decks</span></span><span class="score"><i class="${d[2]?"n":"z"}">${d[2]}</i><i class="${d[3]?"l":"z"}">${d[3]}</i><i class="${d[4]?"r":"z"}">${d[4]}</i></span></a>`).join("")}</div>
    </section>
    <section class="panel">
      <div class="sec-h"><span>Minigames · 3 of 9</span></div>
      <div class="tickets">${GAMES.map(([k,g,t,d,s]) => `<a class="tk ${d}" href="#${k}" style="--tile:var(--g-${k})"><span class="stub">${G[g]}</span><span class="in"><b>${t}</b><span class="st">${d?`Played · ${s}`:"Admit one"}</span></span></a>`).join("")}</div>
    </section>
    <div class="col3">${readingBox()}${atlasBox()}</div>
  </div>
  ${foot()}
</main>`);

/* ===== r3-6 GALLERY — a wide column with gallery-label tiles and deck cards with a three-colour ring. */
OUT["r3-6-gallery"] = page("r3-6: Gallery", `
.wrap{max-width:1100px; margin:0 auto; padding:26px 24px 60px;}
.greet{text-align:center;} .greet h1{font-size:38px;}
.two{display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-top:22px; align-items:start;}
.deckcards{display:grid; grid-template-columns:1fr 1fr; gap:12px;}
.dk{display:grid; grid-template-columns:64px 1fr; gap:14px; align-items:center; background:var(--card); border:1px solid var(--rule); border-radius:16px; padding:14px 16px;}
.dk svg{width:64px; height:64px; transform:rotate(-90deg);}
.dk .tot{font-weight:800; font-size:15px; display:block;}
.dk .ls{display:grid; gap:3px; margin-top:6px; font-family:var(--mono); font-size:11.5px; color:var(--ink-quiet);} .dk .ls i{display:inline-block; width:7px; height:7px; border-radius:50%; margin-right:6px;}
.dk .ls b{font-weight:700; width:18px; display:inline-block;} .dk .ls .n i{background:var(--indigo-bright);} .dk .ls .n b{color:var(--indigo-bright);} .dk .ls .l i{background:var(--zh);} .dk .ls .l b{color:var(--zh);} .dk .ls .r i{background:var(--good);} .dk .ls .r b{color:var(--good);} .dk .ls .z b{color:var(--ink-faint);}
.gal{display:grid; grid-template-columns:repeat(3,1fr); gap:12px;}
.gt{border:1px solid var(--rule); border-radius:12px; overflow:hidden; background:var(--card); display:flex; flex-direction:column;}
.gt .art{height:92px; background:linear-gradient(160deg, color-mix(in srgb, var(--tile) 70%, var(--card)), color-mix(in srgb, var(--tile) 25%, var(--card))); color:#fff; display:grid; place-content:center; position:relative;} .gt .art svg{width:44px; height:44px; filter:drop-shadow(0 2px 4px rgba(0,0,0,.25));}
.gt .label{padding:8px 12px; display:flex; flex-direction:column; gap:2px; border-top:1px solid var(--rule);} .gt b{font-weight:700; font-size:14px;} .gt .st{font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet); white-space:nowrap;}
.gt.done .art::after{content:"✓"; position:absolute; right:10px; top:10px; width:22px; height:22px; border-radius:50%; background:#fff; color:var(--good); font-size:13px; font-weight:800; display:grid; place-content:center;} .gt.done .st{color:var(--good); font-weight:700;}
.three{display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:22px;}
.three .box{padding:14px 16px; display:flex; flex-direction:column; justify-content:center;}
.sk{margin-top:12px; padding:14px 16px;} .sk.streak{display:grid; grid-template-columns:auto 1fr auto; gap:2px 18px; align-items:center;} .sk.streak .k{grid-column:1 / -1; margin-bottom:4px;} .sk.streak .big{font-size:36px;} .sk .heat{grid-template-columns:repeat(14,10px); gap:2px; margin:0;} .sk .heat i{width:10px; height:10px;} .sk.streak .best{margin:0; align-self:center;}
@media (max-width:1024px){ .two{grid-template-columns:1fr;} }
@media (max-width:640px){ .wrap{padding:18px 16px 100px;} .greet h1{font-size:30px;} .deckcards{grid-template-columns:1fr;} .gal{gap:8px;} .gt .art{height:70px;} .gt .art svg{width:32px; height:32px;} .gt .label{padding:8px 10px;} .gt b{font-size:12.5px;} .three{grid-template-columns:1fr;} .sk.streak{grid-template-columns:auto 1fr;} .sk.streak .best{grid-column:1 / -1;} }`, `
${topbar()}
<main class="wrap">
  ${phoneHead()}
  ${greet()}
  ${quote()}
  ${banner({preview:true})}
  <div class="two">
    <div>
      <div class="sec-h"><span>Active decks</span><a href="#decks">+ Add decks</a></div>
      <div class="deckcards">${DECKS.map(d => { const tot=d[2]+d[3]+d[4]; const C=2*Math.PI*26; const seg=(v,off,col)=>`<circle cx="32" cy="32" r="26" fill="none" stroke="${col}" stroke-width="8" stroke-dasharray="${C*v/tot} ${C}" stroke-dashoffset="${-C*off/tot}"/>`;
        return `<a class="dk" href="#study"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="var(--paper-2)" stroke-width="8"/>${d[2]?seg(d[2],0,"var(--indigo-bright)"):""}${d[3]?seg(d[3],d[2],"var(--zh)"):""}${seg(d[4],d[2]+d[3],"var(--good)")}</svg><span><span class="tot">${d[0]}</span><span class="ls"><span class="n${d[2]?"":" z"}"><i></i><b>${d[2]}</b>new</span><span class="l${d[3]?"":" z"}"><i></i><b>${d[3]}</b>learning</span><span class="r${d[4]?"":" z"}"><i></i><b>${d[4]}</b>review</span></span></span></a>`; }).join("")}</div>
      <section class="box streak sk"><span class="k">Streak</span><div class="big">12<small>days in a row</small></div><div class="heat"><i class="a"></i><i class="b"></i><i class="b"></i><i></i><i class="a"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="a"></i><i></i><i></i><i class="b"></i><i class="b"></i><i class="a"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="a"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="a"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="t"></i></div><div class="best">Longest · 31 days</div></section>
    </div>
    <div>
      <div class="sec-h"><span>Minigames · 3 of 9</span><a href="#chest">Play all nine for the chest</a></div>
      <div class="gal">${GAMES.map(([k,g,t,d,s]) => `<a class="gt ${d}" href="#${k}" style="--tile:var(--g-${k})"><span class="art">${G[g]}</span><span class="label"><b>${t}</b><span class="st">${d?`Played · ${s}`:"Play"}</span></span></a>`).join("")}</div>
    </div>
  </div>
  <div class="three">${readingBox()}${atlasBox()}</div>
  ${foot()}
</main>`);

for (const [n, h] of Object.entries(OUT)) fs.writeFileSync(path.join(__dirname, n + ".html"), h);
console.log("wrote", Object.keys(OUT).join(", "));
