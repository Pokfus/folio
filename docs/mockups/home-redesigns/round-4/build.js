#!/usr/bin/env node
/* build.js — generates the round-4 home-page mockups (r4-1 … r4-6).
   Round 4 answers the review of round 3. Kept: the Atrium study banner (now with "29 cards" in rose, the
   three pile counts in their colours, a bare "≈ 12 min" and no "try ten cards"), the Nocturne streak
   ribbon, the tile forms that were liked (list-tiles with less text, trading cards, tickets, gallery
   pieces) plus two new ones, and the Console number boxes. Every deck list carries a progress bar — the
   share of the collection learned — because learning a chosen collection is what the site is for. The
   desktop menu is horizontal at the top everywhere; the globe is decoration, not a destination; no layout
   leaves a half-empty column. Not part of the site. */
"use strict";
const fs = require("fs"), path = require("path");
const G = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "round-2", "glyphs.json"), "utf8"));
const R2 = fs.readFileSync(path.join(__dirname, "..", "round-2", "build.js"), "utf8");
const helpers = R2.slice(R2.indexOf("const I = {"), R2.indexOf("/* ---------- shared parts (style)"));
const { I, NAV, NAVR, navLinks, brand, topbar, tabbar, phoneHead, cardPreview, readingBox, foot, greet } =
  new Function("G", helpers + "\nreturn {I, NAV, NAVR, navLinks, brand, topbar, tabbar, phoneHead, cardPreview, readingBox, foot, greet};")(G);

const GAMES = [["challenge","choices","Multiple Choice","done","5/5"],["chrono","timeline","Timeline","done","4/5"],["truefalse","truefalse","True or False","",""],["whosaid","whosaid","Who said it?","",""],["findit","findit","Find it","done","3/5"],["thread","thread","Common Thread","",""],["crossword","crossword","Crossword","",""],["picture","picture","Picture round","",""],["whatyear","whatyear","What year?","",""]];
/* name, hue, new, learning, review, total cards, cards learned, decks, monogram */
const DECKS = [["World History","#4F74C2",1,2,8,810,412,8,"W"],["Ancient Greece","#2BA6A0",1,1,6,1000,655,6,"G"],["Ancient Rome","#D9544C",0,1,5,580,190,7,"R"],["Japan","#DB8B3A",0,0,4,100,71,9,"J"]];
const pct = (d) => Math.round(d[6] / d[5] * 100);
const boxes = (d) => `<span class="boxes"><i class="${d[2]?"n":"z"}">${d[2]}</i><i class="${d[3]?"l":"z"}">${d[3]}</i><i class="${d[4]?"r":"z"}">${d[4]}</i></span>`;
const nums = (d) => `<span class="dkc"><b class="n${d[2]?"":" z"}">${d[2]}</b><b class="l${d[3]?"":" z"}">${d[3]}</b><b class="r${d[4]?"":" z"}">${d[4]}</b></span>`;
const legend = () => `<span class="legend"><span class="n"><i></i>New</span><span class="l"><i></i>Learning</span><span class="r"><i></i>Review</span></span>`;
const quote = () => `<figure class="dq"><span class="mark">“</span><blockquote>Life has a limit, but knowledge has none.</blockquote><figcaption><span class="who">Zhuangzi</span><span class="src"><i>Zhuangzi</i>, ch. 3</span></figcaption></figure>`;
const globeDeco = (cls="") => `<div class="gdeco ${cls}"><i></i><i></i><i></i><i></i></div>`;

/* THE BANNER (Atrium's, revised). "29 cards" in rose against the serif; new / learning / review in their
   three colours; the estimate stands alone — the per-deck pace is the implementation, not the label. */
const banner = (o={}) => `<section class="study ${o.cls||""}">
  <div class="study-body">
    <span class="eyebrow">Today's review</span>
    <h2><b>29 cards</b> are waiting.</h2>
    <div class="pile"><div class="n"><b>2</b><span>New</span></div><div class="l"><b>4</b><span>Learning</span></div><div class="r"><b>23</b><span>Review</span></div><div class="t"><b>≈ 12 min</b><span>Estimated</span></div></div>
    <a class="go" href="#review">${I.arrow}Start review</a>
  </div>
  ${o.preview !== false ? cardPreview("in-banner") : ""}
</section>`;

/* THE STREAK RIBBON (Nocturne's): the last 14 days, the count, the longest run. */
const ribbon = (cls="") => `<div class="ribbon ${cls}"><b>12</b><span class="t">day streak</span><span class="days">${"a b b a b b b b b b b b b t".split(" ").map(c=>`<i class="${c}"></i>`).join("")}</span><span class="t">last 14 days</span><span class="r">Longest · 31 days</span></div>`;

const PARTS = `
:root{--sky:#2A3478; --sky-2:#1B2150; --sky-ink:#F2F3FF; --sky-rose:#F4B9C8; --sky-blue:#9DB4FF; --sky-green:#8FD9B6;}
.night{--sky:#1A1F4D; --sky-2:#0F1230;} @media (prefers-color-scheme: dark){ :root:not(.light){--sky:#1A1F4D; --sky-2:#0F1230;} }
.eyebrow{font-family:var(--mono); font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--indigo); font-weight:600;}
.sec-h{display:flex; justify-content:space-between; align-items:baseline; gap:12px; margin:0 0 12px; font-family:var(--mono); font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-quiet); font-weight:600;}
.sec-h a{color:var(--indigo); font-family:var(--sans); font-size:13px; font-weight:700; letter-spacing:0; text-transform:none;}
.legend{font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet); display:inline-flex; gap:10px;}
.legend i{display:inline-block; width:7px; height:7px; border-radius:50%; margin-right:4px; vertical-align:1px;} .legend .n i{background:var(--indigo-bright);} .legend .l i{background:var(--zh);} .legend .r i{background:var(--good);}
/* nav (top, horizontal, everywhere) */
.brand{font-family:var(--sans); font-weight:800; font-size:22px; letter-spacing:-.02em; white-space:nowrap;} .brand .dot{color:var(--zh);}
.brand small{font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-quiet); font-weight:600; margin-left:10px;}
.topbar{display:flex; align-items:center; gap:28px; padding:0 28px; height:60px; background:var(--card); border-bottom:1px solid var(--rule); position:relative; z-index:2;}
.topbar .nav{display:flex; gap:2px;} .topbar .nav.right{margin-left:auto;}
.nl{display:flex; align-items:center; gap:7px; padding:8px 12px; border-radius:8px; font-family:var(--mono); font-size:11.5px; letter-spacing:.12em; text-transform:uppercase; font-weight:600; color:var(--ink-quiet);}
.nl svg{width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; flex:none;}
.nl.on{color:var(--indigo); box-shadow:inset 0 -2px 0 var(--indigo); border-radius:0;} .nl.adm{color:var(--admin);}
.tabbar{display:none;} .phone-head{display:none;}
.adm-pill{font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--admin); font-weight:600; border:1px solid var(--rule); border-radius:8px; padding:6px 10px;}
@media (max-width:1024px){ .topbar{padding:0 18px; gap:14px;} .topbar .brand small{display:none;} .topbar .nl{padding:8px 7px; font-size:10.5px; letter-spacing:.08em;} .topbar .nav.right .nl span{display:none;} .topbar .nav.right .nl{padding:8px;} }
@media (max-width:640px){
  .topbar{display:none;} .phone-head{display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;}
  .tabbar{display:grid; grid-template-columns:repeat(5,1fr); position:fixed; left:0; right:0; bottom:0; z-index:9; background:var(--card); border-top:1px solid var(--rule); padding:8px 6px calc(8px + env(safe-area-inset-bottom));}
  .tabbar a{display:flex; flex-direction:column; align-items:center; gap:4px; font-family:var(--mono); font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; font-weight:600; color:var(--ink-quiet); padding:4px 0;} .tabbar a.on{color:var(--indigo);}
  .tabbar svg{width:20px; height:20px; stroke:currentColor; fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round;}
}
.greet h1{font-family:var(--sans); font-weight:800; font-size:32px; letter-spacing:-.02em; margin:4px 0 0; line-height:1.1;}
/* the quote, with room */
.dq{margin:0; padding:38px 16px; text-align:center;}
.dq .mark{display:block; font-family:var(--serif); font-size:34px; line-height:.6; color:var(--zh); margin-bottom:16px;}
.dq blockquote{margin:0 auto; max-width:40ch; font-family:var(--serif); font-style:italic; font-size:22px; line-height:1.45; color:var(--ink);}
.dq figcaption{margin-top:14px; font-family:var(--mono); font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-quiet);}
.dq .who::before{content:""; display:inline-block; width:16px; height:2px; background:var(--ochre); vertical-align:middle; margin-right:9px;}
.dq .src{display:block; font-family:var(--serif); font-size:13px; letter-spacing:0; text-transform:none; color:var(--ink-quiet); margin-top:6px;}
/* the banner */
.study{position:relative; overflow:hidden; border-radius:20px; background:linear-gradient(135deg, var(--sky) 0%, var(--sky-2) 100%); color:var(--sky-ink); padding:30px 32px; display:grid; grid-template-columns:1fr auto; gap:24px; align-items:center; box-shadow:var(--shadow-md);}
.study .eyebrow{color:var(--sky-rose);}
.study h2{font-family:var(--serif); font-weight:500; font-size:40px; line-height:1.08; letter-spacing:-.015em; margin:8px 0 18px; color:#fff;} .study h2 b{font-weight:600; color:var(--sky-rose);}
.study .pile{display:flex; gap:26px; margin-bottom:22px; flex-wrap:wrap;}
.study .pile div b{display:block; font-size:28px; font-weight:800; line-height:1; font-variant-numeric:tabular-nums;}
.study .pile div span{font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; opacity:.7;}
.study .pile .n b{color:var(--sky-blue);} .study .pile .l b{color:var(--sky-rose);} .study .pile .r b{color:var(--sky-green);} .study .pile .t{padding-left:22px; border-left:1px solid rgba(255,255,255,.18);} .study .pile .t b{color:#fff;}
.go{display:inline-flex; align-items:center; gap:9px; background:#fff; color:var(--sky); font-family:var(--mono); font-size:11.5px; letter-spacing:.14em; text-transform:uppercase; font-weight:700; padding:13px 20px; border-radius:11px;}
.go svg{width:15px; height:15px; stroke:currentColor; fill:none; stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round;}
.preview{position:relative; width:300px; height:200px; flex:none;}
.pc{position:absolute; inset:0; background:var(--card); color:var(--ink); border:1px solid var(--rule); border-radius:12px; padding:16px 18px; box-shadow:var(--shadow-lg); transform-origin:50% 100%; display:flex; flex-direction:column;}
.pc.c3{transform:rotate(-6deg) translate(-12px, 4px); opacity:.85;} .pc.c2{transform:rotate(3deg) translate(10px, 2px); opacity:.93;}
.pc .eb{font-family:var(--mono); font-size:9.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--indigo); font-weight:600; display:flex; justify-content:space-between;} .pc .eb em{font-style:normal; color:var(--zh);}
.pc p{font-family:var(--serif); font-size:14.5px; line-height:1.4; margin:10px 0 0;} .pc u{display:inline-block; width:38px; border-bottom:2px solid var(--ochre); text-decoration:none;}
.pc .ft{margin-top:auto; font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-faint);}
/* the ribbon */
.ribbon{display:flex; align-items:center; gap:14px; flex-wrap:wrap; background:var(--card); border:1px solid var(--rule); border-radius:14px; padding:12px 18px; font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet);}
.ribbon b{font-size:24px; font-weight:800; color:var(--good); letter-spacing:-.03em; font-family:var(--sans);}
.ribbon .days{display:flex; gap:4px;} .ribbon .days i{width:14px; height:14px; border-radius:4px; background:var(--good);} .ribbon .days i.a{opacity:.45;} .ribbon .days i.t{background:transparent; border:2px solid var(--good); box-sizing:border-box;}
.ribbon .r{margin-left:auto;}
/* the globe, decoration only */
.gdeco{position:absolute; border-radius:50%; border:1.5px solid var(--geo); opacity:.35; pointer-events:none;}
.gdeco i{position:absolute; inset:0; border-radius:50%; border:1px solid var(--geo);}
.gdeco i:nth-child(1){transform:scaleX(.25);} .gdeco i:nth-child(2){transform:scaleX(.62);} .gdeco i:nth-child(3){transform:scaleY(.25);} .gdeco i:nth-child(4){transform:scaleY(.62);}
/* counts */
.boxes{display:inline-grid; grid-template-columns:repeat(3,32px); gap:4px;}
.boxes i{display:grid; place-content:center; height:28px; border-radius:7px; font-family:var(--mono); font-style:normal; font-weight:700; font-size:13px; color:#fff;}
.boxes .n{background:var(--indigo-bright);} .boxes .l{background:var(--zh);} .boxes .r{background:var(--good);} .boxes .z{background:var(--paper-2); color:var(--ink-faint); box-shadow:inset 0 0 0 1px var(--rule);}
.night .boxes i:not(.z){color:var(--paper-2);} @media (prefers-color-scheme: dark){ :root:not(.light) .boxes i:not(.z){color:var(--paper-2);} }
.boxes-h{display:inline-grid; grid-template-columns:repeat(3,32px); gap:4px; font-family:var(--mono); font-size:8.5px; letter-spacing:.06em; text-transform:uppercase; text-align:center; color:var(--ink-quiet);}
.dkc{display:inline-flex; gap:10px; font-family:var(--mono); font-size:14px; font-weight:600; font-variant-numeric:tabular-nums;}
.dkc .n{color:var(--indigo-bright);} .dkc .l{color:var(--zh);} .dkc .r{color:var(--good);} .dkc .z{color:var(--ink-faint); font-weight:500;}
.prog{display:block; height:6px; border-radius:3px; background:var(--paper-2); overflow:hidden;} .prog b{display:block; height:100%; background:var(--c, var(--indigo)); width:var(--w);}
.learned{font-family:var(--mono); font-size:11px; color:var(--ink-quiet); white-space:nowrap;} .learned b{color:var(--ink); font-weight:600;}
/* reading */
.box{position:relative; overflow:hidden; display:block; background:var(--card); border:1px solid var(--rule); border-radius:16px; padding:18px 20px; box-shadow:var(--shadow-sm); min-width:0;}
.k{display:block; font-family:var(--mono); font-size:10.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-quiet); font-weight:600; margin-bottom:10px;}
.reading .bk{display:flex; gap:14px; align-items:center;}
.reading .spine{width:44px; height:62px; flex:none; border-radius:4px 7px 7px 4px; background:linear-gradient(90deg, var(--indigo) 0 6px, color-mix(in srgb, var(--indigo) 78%, var(--card)) 6px); box-shadow:var(--shadow-md);}
.reading b{display:block; font-family:var(--serif); font-weight:600; font-size:16px;} .reading span{display:block; font-size:12.5px; color:var(--ink-quiet);}
.reading .bar{display:block; height:4px; border-radius:2px; background:var(--paper-2); margin-top:8px; width:150px; max-width:100%;} .reading .bar b{display:block; height:100%; width:38%; background:var(--ochre); border-radius:2px;}
.reading em{display:block; font-style:normal; font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ochre); margin-top:6px;}
.foot{display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-top:30px; font-family:var(--mono); font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-faint);}
@media (max-width:640px){
  .study{grid-template-columns:1fr; padding:22px 20px; border-radius:16px;} .study h2{font-size:32px;} .study .preview{display:none;}
  .study .pile{gap:16px;} .study .pile div b{font-size:24px;} .study .pile .t{padding-left:16px;}
  .dq{padding:28px 8px;} .dq blockquote{font-size:19px;}
  .ribbon{padding:12px 14px; gap:10px;} .ribbon .r{margin-left:0;}
  .greet h1{font-size:28px;}
}
`;

const page = (title, css, body) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Folio — home redesign ${title}</title>
<link rel="stylesheet" href="../../../../fonts.css" />
<link rel="stylesheet" href="../_tokens.css" />
<style>
${PARTS}
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

/* ===== r4-1 COMPASS — one column; deck rows with boxes at left and a full-width progress bar; gallery tiles. */
OUT["r4-1-compass"] = page("r4-1: Compass", `
.wrap{max-width:960px; margin:0 auto; padding:26px 24px 60px; position:relative; overflow:hidden;}
.wrap > .gdeco{right:-120px; top:-40px; width:320px; height:320px; opacity:.22;}
.gap{height:22px;}
.rows{display:grid; gap:8px;}
.row{display:grid; grid-template-columns:auto 1fr auto; gap:10px 18px; align-items:center; background:var(--card); border:1px solid var(--rule); border-radius:14px; padding:14px 18px; color:inherit;}
.row b.name{font-weight:700; font-size:15.5px;} .row .meta{font-size:12px; color:var(--ink-quiet); margin-left:10px;}
.row .prog{grid-column:1 / -1; height:8px; border-radius:4px;}
.row .go2{font-family:var(--mono); font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--indigo); font-weight:700;}
.gal{display:grid; grid-template-columns:repeat(3,1fr); gap:12px;}
.gt{border:1px solid var(--rule); border-radius:12px; overflow:hidden; background:var(--card); display:flex; flex-direction:column; color:inherit;}
.gt .art{height:92px; background:linear-gradient(160deg, color-mix(in srgb, var(--tile) 70%, var(--card)), color-mix(in srgb, var(--tile) 25%, var(--card))); color:#fff; display:grid; place-content:center; position:relative;} .gt .art svg{width:44px; height:44px; filter:drop-shadow(0 2px 4px rgba(0,0,0,.25));}
.gt .label{padding:8px 12px; display:flex; flex-direction:column; gap:2px; border-top:1px solid var(--rule);} .gt b{font-weight:700; font-size:14px;} .gt .st{font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet);}
.gt.done .art::after{content:"✓"; position:absolute; right:10px; top:10px; width:22px; height:22px; border-radius:50%; background:#fff; color:var(--good); font-size:13px; font-weight:800; display:grid; place-content:center;} .gt.done .st{color:var(--good); font-weight:700;}
@media (max-width:640px){ .wrap{padding:18px 16px 100px;} .wrap > .gdeco{display:none;} .row{grid-template-columns:auto 1fr; padding:12px 14px;} .row .go2{display:none;} .gal{gap:8px;} .gt .art{height:70px;} .gt .art svg{width:32px; height:32px;} .gt b{font-size:12.5px;} }`, `
${topbar()}
<main class="wrap">
  ${globeDeco()}
  ${phoneHead()}
  ${greet()}
  ${quote()}
  ${banner()}
  <div class="gap"></div>
  ${ribbon()}
  <div class="gap"></div>
  <div class="sec-h"><span>Your collections · 29 today</span>${legend()}</div>
  <div class="rows">${DECKS.map(d => `<a class="row" href="#study" style="--c:${d[1]}; --w:${pct(d)}%">${boxes(d)}<span><b class="name">${d[0]}</b><span class="meta">${d[6]} of ${d[5].toLocaleString()} cards learned · ${pct(d)}%</span></span><span class="go2">Study →</span><span class="prog"><b></b></span></a>`).join("")}</div>
  <div class="gap"></div>
  <div class="sec-h"><span>Minigames · 3 of 9</span><a href="#chest">Play all nine for the chest</a></div>
  <div class="gal">${GAMES.map(([k,g,t,d,s]) => `<a class="gt ${d}" href="#${k}" style="--tile:var(--g-${k})"><span class="art">${G[g]}</span><span class="label"><b>${t}</b><span class="st">${d?`Played · ${s}`:"Play"}</span></span></a>`).join("")}</div>
  <div class="gap"></div>
  ${readingBox()}
  ${foot()}
</main>`);

/* ===== r4-2 TABULAR — the Ledger table with a progress column; list-tiles with less text, three across. */
OUT["r4-2-tabular"] = page("r4-2: Tabular", `
.wrap{max-width:1120px; margin:0 auto; padding:26px 24px 60px;}
.head{display:grid; grid-template-columns:1fr auto; gap:20px; align-items:center; position:relative;}
.head .ribbon{padding:10px 16px;}
.gap{height:22px;}
table{width:100%; border-collapse:collapse; background:var(--card); border:1px solid var(--rule); border-radius:14px; overflow:hidden; font-size:14px;}
th,td{padding:13px 14px; text-align:right; border-top:1px solid var(--rule); font-variant-numeric:tabular-nums; vertical-align:middle;}
th{font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-quiet); font-weight:600; border-top:0; background:var(--paper-2);}
th:first-child,td:first-child,th.p,td.p{text-align:left;} td:first-child{font-weight:700;} td:first-child i{display:inline-block; width:9px; height:9px; border-radius:2px; background:var(--c); margin-right:10px;}
th.n{color:var(--indigo-bright);} th.l{color:var(--zh);} th.r{color:var(--good);}
td.n{color:var(--indigo-bright); font-family:var(--mono); font-weight:600;} td.l{color:var(--zh); font-family:var(--mono); font-weight:600;} td.r{color:var(--good); font-family:var(--mono); font-weight:600;} td.z{color:var(--ink-faint); font-weight:500;}
td.p{width:34%;} td.p .prog{margin-top:5px;} td.p .learned{display:block;}
tr.sum td{background:var(--paper-2); font-weight:800; border-top:2px solid var(--rule);}
.list{display:grid; grid-template-columns:repeat(3,1fr); gap:10px;}
.lt{display:grid; grid-template-columns:40px 1fr auto; align-items:center; gap:12px; background:var(--card); border:1px solid var(--rule); border-radius:12px; padding:10px 12px 10px 10px; box-shadow:inset 4px 0 0 var(--tile); color:inherit;}
.lt .ic{width:40px; height:40px; border-radius:50%; background:color-mix(in srgb, var(--tile) 18%, var(--card)); color:var(--tile); display:grid; place-content:center;} .lt .ic svg{width:22px; height:22px;}
.lt b{font-weight:700; font-size:14.5px;}
.lt .st{width:22px; height:22px; border-radius:50%; border:1.5px solid var(--rule); display:grid; place-content:center; font-size:11px; font-weight:800; color:transparent;}
.lt.done .st{background:var(--good); border-color:var(--good); color:#fff;}
.lt.done .st::after{content:"✓";}
.two{display:grid; grid-template-columns:1fr 1fr; gap:16px;}
@media (max-width:1024px){ .list{grid-template-columns:1fr 1fr;} .head{grid-template-columns:1fr;} }
@media (max-width:640px){ .wrap{padding:18px 16px 100px;} th,td{padding:10px 8px; font-size:13px;} td.p,th.p{display:none;} .mob-prog{display:block;} .list{grid-template-columns:1fr;} .two{grid-template-columns:1fr;} }
@media (min-width:641px){ .mob-prog{display:none;} }`, `
${topbar()}
<main class="wrap">
  ${phoneHead()}
  <div class="head">${greet()}${ribbon()}</div>
  ${quote()}
  ${banner()}
  <div class="gap"></div>
  <div class="sec-h"><span>Your collections</span><a href="#decks">+ Add decks</a></div>
  <table><thead><tr><th>Collection</th><th class="n">New</th><th class="l">Learning</th><th class="r">Review</th><th class="p">Learned</th></tr></thead><tbody>
  ${DECKS.map(d => `<tr><td><i style="--c:${d[1]}"></i>${d[0]}<span class="mob-prog prog" style="--c:${d[1]}; --w:${pct(d)}%; margin-top:6px"><b></b></span></td><td class="n${d[2]?"":" z"}">${d[2]}</td><td class="l${d[3]?"":" z"}">${d[3]}</td><td class="r${d[4]?"":" z"}">${d[4]}</td><td class="p"><span class="learned"><b>${d[6]}</b> of ${d[5].toLocaleString()} · ${pct(d)}%</span><span class="prog" style="--c:${d[1]}; --w:${pct(d)}%"><b></b></span></td></tr>`).join("")}
  <tr class="sum"><td>Today</td><td class="n">2</td><td class="l">4</td><td class="r">23</td><td class="p"><span class="learned"><b>1,328</b> of 2,490 · 53%</span></td></tr>
  </tbody></table>
  <div class="gap"></div>
  <div class="sec-h"><span>Minigames · 3 of 9</span><a href="#chest">Play all nine for the chest</a></div>
  <div class="list">${GAMES.map(([k,g,t,d,s]) => `<a class="lt ${d}" href="#${k}" style="--tile:var(--g-${k})"><span class="ic">${G[g]}</span><b>${t}</b><span class="st"></span></a>`).join("")}</div>
  <div class="gap"></div>
  <div class="two">${readingBox()}<a class="box" href="#search" style="display:flex;align-items:center;gap:12px;color:var(--ink-quiet);font-size:14px">${I.search.replace('<svg','<svg style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2"')}Search 4,857 cards, 4,776 terms and 48 books</a></div>
  ${foot()}
</main>`);

/* ===== r4-3 MARKS — collection cards with a mastery ring and the number boxes; trading-card tiles. */
OUT["r4-3-marks"] = page("r4-3: Marks", `
.wrap{max-width:1040px; margin:0 auto; padding:26px 24px 60px;}
.gap{height:22px;}
.cards{display:grid; grid-template-columns:1fr 1fr; gap:14px;}
.cc{display:grid; grid-template-columns:72px 1fr; gap:16px; align-items:center; background:var(--card); border:1px solid var(--rule); border-radius:16px; padding:16px 18px; color:inherit; position:relative; overflow:hidden;}
.cc::before{content:""; position:absolute; left:0; top:0; bottom:0; width:5px; background:var(--c);}
.cc svg{width:72px; height:72px; transform:rotate(-90deg);} .cc .pc2{position:absolute; left:18px; top:50%; width:72px; text-align:center; transform:translateY(-50%); font-weight:800; font-size:15px; letter-spacing:-.02em;}
.cc b.name{font-weight:800; font-size:16px; display:block;} .cc .m{font-size:12px; color:var(--ink-quiet); margin:2px 0 8px;}
.cc .foot2{display:flex; justify-content:space-between; align-items:center; gap:10px;}
.cc .prog{height:5px; margin-top:8px;}
.tcs{display:grid; grid-template-columns:repeat(3,1fr); gap:12px;}
.tc{border:1px solid var(--rule); border-radius:12px; overflow:hidden; background:var(--card); display:flex; flex-direction:column; color:inherit;}
.tc .band{height:66px; background:linear-gradient(135deg, var(--tile), color-mix(in srgb, var(--tile) 65%, #1D1B29)); color:#fff; display:grid; place-content:center; position:relative;} .tc .band svg{width:34px; height:34px;}
.tc .in{padding:10px 12px 12px;} .tc b{display:block; font-weight:700; font-size:14px; line-height:1.15;} .tc .st{display:block; font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet); margin-top:4px;}
.tc.done .band::after{content:"✓"; position:absolute; right:8px; top:8px; width:20px; height:20px; border-radius:50%; background:#fff; color:var(--good); font-size:12px; font-weight:800; display:grid; place-content:center;} .tc.done .st{color:var(--good);}
.two{display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:start;}
@media (max-width:1024px){ .two{grid-template-columns:1fr;} }
@media (max-width:640px){ .wrap{padding:18px 16px 100px;} .cards{grid-template-columns:1fr;} .tcs{gap:8px;} .tc .band{height:54px;} .tc b{font-size:12.5px;} }`, `
${topbar()}
<main class="wrap">
  ${phoneHead()}
  ${greet()}
  ${quote()}
  ${banner()}
  <div class="gap"></div>
  ${ribbon()}
  <div class="gap"></div>
  <div class="sec-h"><span>Your collections · 29 today</span>${legend()}</div>
  <div class="cards">${DECKS.map(d => { const C=2*Math.PI*30; return `<a class="cc" href="#study" style="--c:${d[1]}; --w:${pct(d)}%"><svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="30" fill="none" stroke="var(--paper-2)" stroke-width="7"/><circle cx="36" cy="36" r="30" fill="none" stroke="${d[1]}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C*pct(d)/100} ${C}"/></svg><span class="pc2">${pct(d)}%</span><span><b class="name">${d[0]}</b><span class="m">${d[6]} of ${d[5].toLocaleString()} cards learned · ${d[7]} decks</span><span class="foot2">${boxes(d)}<span class="learned">today</span></span></span></a>`; }).join("")}</div>
  <div class="gap"></div>
  <div class="two">
    <div><div class="sec-h"><span>Minigames · 3 of 9</span><a href="#chest">All nine for the chest</a></div><div class="tcs">${GAMES.map(([k,g,t,d,s]) => `<a class="tc ${d}" href="#${k}" style="--tile:var(--g-${k})"><span class="band">${G[g]}</span><span class="in"><b>${t}</b><span class="st">${d?`Played · ${s}`:"Play"}</span></span></a>`).join("")}</div></div>
    <div><div class="sec-h"><span>Keep going</span></div>${readingBox()}<div class="gap"></div><section class="box" style="position:relative;min-height:150px"><span class="k">This week</span><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px"><div><b style="font-size:26px;font-weight:800;letter-spacing:-.03em">184</b><div class="k" style="margin:4px 0 0">cards studied</div></div><div><b style="font-size:26px;font-weight:800;letter-spacing:-.03em">71 min</b><div class="k" style="margin:4px 0 0">at the desk</div></div><div><b style="font-size:26px;font-weight:800;letter-spacing:-.03em;color:var(--good)">87%</b><div class="k" style="margin:4px 0 0">recalled</div></div></div>${globeDeco().replace('class="gdeco "','class="gdeco" style="right:-40px;bottom:-60px;width:170px;height:170px"')}</section></div>
  </div>
  ${foot()}
</main>`);

/* ===== r4-4 HALL — a wide/narrow pair: deck rows with a bar beneath on the left, the ticket list on the right, balanced. */
OUT["r4-4-hall"] = page("r4-4: Hall", `
.wrap{max-width:1180px; margin:0 auto; padding:26px 24px 60px;}
.gap{height:22px;}
.pair{display:grid; grid-template-columns:1.45fr 1fr; gap:22px; align-items:start;}
.col{display:grid; gap:22px;}
.panel{background:var(--card); border:1px solid var(--rule); border-radius:16px; padding:18px 20px;}
.dr{display:grid; grid-template-columns:44px 1fr auto; gap:10px 14px; align-items:center; padding:12px 0; border-top:1px solid var(--rule); color:inherit;}
.dr:first-child{border-top:0; padding-top:4px;}
.dr .mg{width:44px; height:44px; border-radius:11px; background:var(--c); color:#fff; display:grid; place-content:center; font-family:var(--serif); font-weight:600; font-size:19px;}
.dr b.name{font-weight:700; font-size:15px; display:block;} .dr .m{font-size:12px; color:var(--ink-quiet);}
.dr .prog{grid-column:2 / -1;}
.tickets{display:grid; gap:8px;}
.tk{display:grid; grid-template-columns:56px 1fr; border:1px solid var(--rule); border-radius:10px; overflow:hidden; background:var(--paper); min-height:54px; color:inherit;}
.tk .stub{background:var(--tile); color:#fff; display:grid; place-content:center; border-right:2px dashed var(--card); position:relative;} .tk .stub svg{width:24px; height:24px;}
.tk .stub::before,.tk .stub::after{content:""; position:absolute; right:-7px; width:12px; height:12px; border-radius:50%; background:var(--card);} .tk .stub::before{top:-6px;} .tk .stub::after{bottom:-6px;}
.tk .in{display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 12px;} .tk b{font-weight:700; font-size:14px;} .tk .st{font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet);}
.tk.done .stub{background:color-mix(in srgb, var(--tile) 55%, var(--card));} .tk.done .st{color:var(--good); font-weight:700;} .tk.done .in::after{content:"✓"; color:var(--good); font-weight:800;}
.stats{display:grid; grid-template-columns:repeat(3,1fr); gap:12px;}
.stats div b{display:block; font-size:28px; font-weight:800; letter-spacing:-.03em; line-height:1;} .stats div span{font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet);}
.stats .g b{color:var(--good);}
@media (max-width:1024px){ .pair{grid-template-columns:1fr;} }
@media (max-width:640px){ .wrap{padding:18px 16px 100px;} .dr{grid-template-columns:40px 1fr;} .dr .boxes{grid-column:2; justify-self:start;} }`, `
${topbar()}
<main class="wrap">
  ${phoneHead()}
  ${greet()}
  ${quote()}
  ${banner()}
  <div class="gap"></div>
  ${ribbon()}
  <div class="gap"></div>
  <div class="pair">
    <div class="col">
      <section class="panel">
        <div class="sec-h"><span>Your collections · 29 today</span><a href="#decks">+ Add decks</a></div>
        <div style="display:flex;justify-content:flex-end;margin-bottom:2px"><span class="boxes-h"><span>New</span><span>Learn</span><span>Review</span></span></div>
        ${DECKS.map(d => `<a class="dr" href="#study" style="--c:${d[1]}; --w:${pct(d)}%"><span class="mg">${d[8]}</span><span><b class="name">${d[0]}</b><span class="m">${d[6]} of ${d[5].toLocaleString()} cards learned · ${pct(d)}%</span></span>${boxes(d)}<span class="prog"><b></b></span></a>`).join("")}
      </section>
      <section class="panel" style="position:relative;overflow:hidden">
        <div class="sec-h"><span>This week</span></div>
        <div class="stats"><div><b>184</b><span>cards studied</span></div><div><b>71 min</b><span>at the desk</span></div><div class="g"><b>87%</b><span>recalled</span></div></div>
        ${globeDeco().replace('class="gdeco "','class="gdeco" style="right:-30px;bottom:-70px;width:160px;height:160px"')}
      </section>
      ${readingBox()}
    </div>
    <div class="col">
      <section class="panel">
        <div class="sec-h"><span>Minigames · 3 of 9</span></div>
        <div class="tickets">${GAMES.map(([k,g,t,d,s]) => `<a class="tk ${d}" href="#${k}" style="--tile:var(--g-${k})"><span class="stub">${G[g]}</span><span class="in"><b>${t}</b><span class="st">${d?`Played · ${s}`:"Admit one"}</span></span></a>`).join("")}</div>
      </section>
    </div>
  </div>
  ${foot()}
</main>`);

/* ===== r4-5 KEYS — the streak ribbon under the top bar as a full-width strip; rows whose progress is the row's own fill; keycap tiles. */
OUT["r4-5-keys"] = page("r4-5: Keys", `
.strip{background:var(--card); border-bottom:1px solid var(--rule);}
.strip .ribbon{border:0; border-radius:0; max-width:1040px; margin:0 auto; padding:10px 24px;}
.wrap{max-width:1040px; margin:0 auto; padding:22px 24px 60px;}
.gap{height:22px;}
.fill{display:grid; gap:8px;}
.fr{position:relative; overflow:hidden; display:grid; grid-template-columns:1fr auto auto; gap:16px; align-items:center; background:var(--card); border:1px solid var(--rule); border-radius:12px; padding:14px 18px; color:inherit;}
.fr::before{content:""; position:absolute; left:0; top:0; bottom:0; width:var(--w); background:linear-gradient(90deg, color-mix(in srgb, var(--c) 22%, var(--card)), color-mix(in srgb, var(--c) 10%, var(--card))); border-right:3px solid var(--c);}
.fr > *{position:relative;}
.fr b.name{font-weight:700; font-size:15.5px; display:block;} .fr .m{font-size:12px; color:var(--ink-quiet);}
.fr .pct{font-family:var(--mono); font-size:13px; font-weight:700; color:var(--c);}
.keys{display:grid; grid-template-columns:repeat(3,1fr); gap:14px;}
.key{display:flex; flex-direction:column; align-items:center; gap:10px; padding:14px 10px 12px; background:var(--card); border:1px solid var(--rule); border-radius:14px; box-shadow:0 4px 0 var(--rule), var(--shadow-sm); color:inherit; text-align:center;}
.key .cap{width:100%; height:64px; border-radius:10px; background:linear-gradient(180deg, color-mix(in srgb, var(--tile) 85%, #fff), var(--tile)); box-shadow:inset 0 -4px 0 rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.4); color:#fff; display:grid; place-content:center; position:relative;} .key .cap svg{width:30px; height:30px;}
.key b{font-weight:700; font-size:14px; line-height:1.15;} .key .st{font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet);}
.key.done .cap::after{content:"✓"; position:absolute; right:8px; top:8px; width:20px; height:20px; border-radius:50%; background:#fff; color:var(--good); font-size:12px; font-weight:800; display:grid; place-content:center;} .key.done .st{color:var(--good); font-weight:700;}
.two{display:grid; grid-template-columns:1fr 1fr; gap:16px;}
@media (max-width:640px){ .wrap{padding:18px 16px 100px;} .strip .ribbon{padding:10px 16px;} .fr{grid-template-columns:1fr auto; padding:12px 14px;} .fr .pct{display:none;} .keys{gap:8px;} .key{padding:10px 6px 8px;} .key .cap{height:52px;} .key .cap svg{width:24px; height:24px;} .key b{font-size:12.5px;} .two{grid-template-columns:1fr;} }`, `
${topbar()}
<div class="strip">${ribbon()}</div>
<main class="wrap">
  ${phoneHead()}
  ${greet()}
  ${quote()}
  ${banner()}
  <div class="gap"></div>
  <div class="sec-h"><span>Your collections · 29 today</span>${legend()}</div>
  <div class="fill">${DECKS.map(d => `<a class="fr" href="#study" style="--c:${d[1]}; --w:${pct(d)}%"><span><b class="name">${d[0]}</b><span class="m">${d[6]} of ${d[5].toLocaleString()} cards learned</span></span><span class="pct">${pct(d)}%</span>${boxes(d)}</a>`).join("")}</div>
  <div class="gap"></div>
  <div class="sec-h"><span>Minigames · 3 of 9</span><a href="#chest">Play all nine for the chest</a></div>
  <div class="keys">${GAMES.map(([k,g,t,d,s]) => `<a class="key ${d}" href="#${k}" style="--tile:var(--g-${k})"><span class="cap">${G[g]}</span><b>${t}</b><span class="st">${d?`Played · ${s}`:"Play"}</span></a>`).join("")}</div>
  <div class="gap"></div>
  <div class="two">${readingBox()}<section class="box" style="position:relative"><span class="k">This week</span><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px"><div><b style="font-size:26px;font-weight:800;letter-spacing:-.03em">184</b><div class="k" style="margin:4px 0 0">cards studied</div></div><div><b style="font-size:26px;font-weight:800;letter-spacing:-.03em">71 min</b><div class="k" style="margin:4px 0 0">at the desk</div></div><div><b style="font-size:26px;font-weight:800;letter-spacing:-.03em;color:var(--good)">87%</b><div class="k" style="margin:4px 0 0">recalled</div></div></div>${globeDeco().replace('class="gdeco "','class="gdeco" style="right:-40px;bottom:-60px;width:150px;height:150px"')}</section></div>
  ${foot()}
</main>`);

/* ===== r4-6 FRAMES — a wide column; deck rows in two columns with icon, bar and boxes; polaroid tiles. */
OUT["r4-6-frames"] = page("r4-6: Frames", `
.wrap{max-width:1120px; margin:0 auto; padding:26px 24px 60px; overflow:hidden;}
.gap{height:22px;}
.hdr{display:grid; grid-template-columns:1fr auto; align-items:center; gap:20px; position:relative;}
.hdr .gdeco{right:-60px; top:-70px; width:260px; height:260px; opacity:.2;}
.decks{display:grid; grid-template-columns:1fr 1fr; gap:12px;}
.dk{display:grid; grid-template-columns:48px 1fr auto; gap:8px 14px; align-items:center; background:var(--card); border:1px solid var(--rule); border-radius:14px; padding:14px 16px; color:inherit;}
.dk .mg{width:48px; height:48px; border-radius:50%; background:var(--c); color:#fff; display:grid; place-content:center; font-family:var(--serif); font-weight:600; font-size:20px;}
.dk b.name{font-weight:700; font-size:15px; display:block;} .dk .m{font-size:12px; color:var(--ink-quiet);}
.dk .prog{grid-column:2 / -1;}
.polas{display:grid; grid-template-columns:repeat(3,1fr); gap:14px;}
.pola{background:#fff; border:1px solid var(--rule); border-radius:4px; padding:8px 8px 10px; box-shadow:var(--shadow-md); color:#1D1B29; transform:rotate(var(--rot)); display:flex; flex-direction:column; gap:8px;}
.night .pola{background:#F3F1F7;} @media (prefers-color-scheme: dark){ :root:not(.light) .pola{background:#F3F1F7;} }
.pola .pic{height:96px; border-radius:2px; background:radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--tile) 70%, #fff), var(--tile) 70%); color:#fff; display:grid; place-content:center; position:relative;} .pola .pic svg{width:40px; height:40px; filter:drop-shadow(0 2px 4px rgba(0,0,0,.25));}
.pola b{font-family:var(--serif); font-style:italic; font-weight:600; font-size:15px; padding:0 4px;} .pola .st{font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:#69657E; padding:0 4px;}
.pola.done .pic::after{content:"✓"; position:absolute; right:8px; top:8px; width:22px; height:22px; border-radius:50%; background:#fff; color:#4E9B7E; font-size:13px; font-weight:800; display:grid; place-content:center;} .pola.done .st{color:#4E9B7E; font-weight:700;}
.two{display:grid; grid-template-columns:1fr 1fr; gap:16px;}
@media (max-width:1024px){ .hdr{grid-template-columns:1fr;} }
@media (max-width:640px){ .wrap{padding:18px 16px 100px;} .hdr .gdeco{display:none;} .decks{grid-template-columns:1fr;} .polas{gap:10px;} .pola{padding:5px 5px 7px;} .pola .pic{height:64px;} .pola .pic svg{width:28px; height:28px;} .pola b{font-size:12.5px;} .pola .st{font-size:8.5px;} .two{grid-template-columns:1fr;} }`, `
${topbar()}
<main class="wrap">
  ${phoneHead()}
  <div class="hdr">${greet()}${ribbon()}${globeDeco()}</div>
  ${quote()}
  ${banner()}
  <div class="gap"></div>
  <div class="sec-h"><span>Your collections · 29 today</span>${legend()}</div>
  <div class="decks">${DECKS.map(d => `<a class="dk" href="#study" style="--c:${d[1]}; --w:${pct(d)}%"><span class="mg">${d[8]}</span><span><b class="name">${d[0]}</b><span class="m">${d[6]} of ${d[5].toLocaleString()} learned · ${pct(d)}%</span></span>${boxes(d)}<span class="prog"><b></b></span></a>`).join("")}</div>
  <div class="gap"></div>
  <div class="sec-h"><span>Minigames · 3 of 9</span><a href="#chest">Play all nine for the chest</a></div>
  <div class="polas">${GAMES.map(([k,g,t,d,s],i) => `<a class="pola ${d}" href="#${k}" style="--tile:var(--g-${k}); --rot:${[-1.2,.8,-.6,1,-.9,.7,-.5,1.1,-.8][i]}deg"><span class="pic">${G[g]}</span><b>${t}</b><span class="st">${d?`Played · ${s}`:"Play"}</span></a>`).join("")}</div>
  <div class="gap"></div>
  <div class="two">${readingBox()}<section class="box"><span class="k">This week</span><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px"><div><b style="font-size:26px;font-weight:800;letter-spacing:-.03em">184</b><div class="k" style="margin:4px 0 0">cards studied</div></div><div><b style="font-size:26px;font-weight:800;letter-spacing:-.03em">71 min</b><div class="k" style="margin:4px 0 0">at the desk</div></div><div><b style="font-size:26px;font-weight:800;letter-spacing:-.03em;color:var(--good)">87%</b><div class="k" style="margin:4px 0 0">recalled</div></div></div></section></div>
  ${foot()}
</main>`);

for (const [n, h] of Object.entries(OUT)) fs.writeFileSync(path.join(__dirname, n + ".html"), h);
console.log("wrote", Object.keys(OUT).join(", "));
