#!/usr/bin/env node
/* build.js — generates the round-2 home-page mockups (r2-1 … r2-6) from shared parts.
   Round 2 answers the review of round 1: keep the blue study banner, the streak box, the globe-outline
   Atlas box, the Continue Reading box, the dark-blue hero and the card preview; decks in vertical lists
   only; the quote at or near the top of every version; the games as tiles with their full names.
   `node build.js` rewrites _parts.css and the six pages. Not part of the site. */
"use strict";
const fs = require("fs"), path = require("path");
const G = JSON.parse(fs.readFileSync(path.join(__dirname, "glyphs.json"), "utf8"));

/* ---------- shared parts (markup) ---------- */
const I = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 11.4 12 4l9 7.4"/><path d="M5.5 9.8V20h13V9.8"/></svg>',
  decks: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="13" height="14" rx="2"/><path d="M7 4h11a2 2 0 0 1 2 2v11"/></svg>',
  library: '<svg viewBox="0 0 24 24"><path d="M3 5.5h5.5a2.5 2.5 0 0 1 2.5 2.5v11a2 2 0 0 0-2-2H3z"/><path d="M21 5.5h-5.5A2.5 2.5 0 0 0 13 8v11a2 2 0 0 1 2-2h6z"/></svg>',
  map: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  admin: '<svg viewBox="0 0 24 24"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
  account: '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};
const NAV = [["home","Home"],["decks","Collections"],["library","Library"],["map","Atlas"]];
const NAVR = [["search","Search"],["admin","Admin"],["account","Account"],["settings","Settings"]];
const navLinks = (list) => list.map(([k,l]) => `<a class="nl${k==="home"?" on":""}${k==="admin"?" adm":""}" href="#${k}">${I[k]}<span>${l}</span></a>`).join("");
const brand = (cls="") => `<span class="brand ${cls}">Folio<span class="dot">.</span><small>Memorise anything</small></span>`;
const topbar = () => `<header class="topbar">${brand()}<nav class="nav">${navLinks(NAV)}</nav><nav class="nav right">${navLinks(NAVR)}</nav></header>`;
const tabbar = () => `<nav class="tabbar">${[["home","Home"],["library","Library"],["map","Atlas"],["account","Account"],["settings","Settings"]].map(([k,l])=>`<a class="${k==="home"?"on":""}" href="#${k}">${I[k]}${l}</a>`).join("")}</nav>`;
const phoneHead = () => `<div class="phone-head">${brand()}<span class="adm-pill">Admin</span></div>`;

const quoteStrip = (cls="") => `<figure class="quote ${cls}"><blockquote>“Life has a limit, but knowledge has none.”</blockquote><figcaption>Zhuangzi · <i>Zhuangzi</i>, ch. 3</figcaption></figure>`;

/* THE TIME ESTIMATE IS PER DECK, NOT A CONSTANT: the line under it says where the minutes come from, which
   is the implementation note for the real thing — a running average of this reader's seconds per card in
   each deck (a history card reads longer than a vocabulary word), summed over today's pile. */
const estimate = () => `<div class="est"><b>≈ 12 min</b><span>from your pace in each deck · World History 31 s/card · Greece 22 s · Rome 26 s · Japan 14 s</span></div>`;
const pile = () => `<div class="pile"><div><b>2</b><span>New</span></div><div><b>4</b><span>Learning</span></div><div><b>23</b><span>Review</span></div></div>`;

const cardPreview = (cls="") => `<div class="preview ${cls}">
  <div class="pc c3"><span class="eb">World History</span><p>Muʿāwiya founded <u></u> in 661 and ruled it from Damascus…</p></div>
  <div class="pc c2"><span class="eb">Ancient Rome</span><p>Appius Claudius laid the <u></u> southward from Rome during his censorship…</p></div>
  <div class="pc c1"><span class="eb">Ancient Greece <em>next up</em></span><p>Open to any Greek who wished, women and slaves included, the <u></u> promised the initiate a better lot after death.</p><span class="ft">Learning · step 2 of 3</span></div>
</div>`;

const banner = (o={}) => `<section class="study ${o.cls||""}">
  <div class="study-body">
    <span class="eyebrow">Today's review</span>
    <h2><b>29 cards</b> waiting</h2>
    ${pile()}
    ${estimate()}
    <div class="acts"><a class="go" href="#review">${I.arrow}Start review</a><a class="try" href="#sample">Try ten cards — nothing is saved</a></div>
  </div>
  ${o.preview ? cardPreview("in-banner") : ""}
  ${o.globe ? '<div class="globe deco"><i></i><i></i><i></i><i></i><b></b></div>' : ""}
</section>`;

const streakBox = (cls="") => `<section class="box streak ${cls}"><span class="k">Streak</span><div class="big">12<small>days in a row</small></div><div class="best">Longest · 31 days · since 14 Jun</div>
  <div class="heat" aria-label="the last five weeks"><i class="a"></i><i class="b"></i><i class="b"></i><i></i><i class="a"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="a"></i><i></i><i></i><i class="b"></i><i class="b"></i><i class="a"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="a"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="a"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="b"></i><i class="t"></i><i></i><i></i><i></i><i></i></div></section>`;
const atlasBox = (cls="") => `<a class="box atlas ${cls}" href="#map"><span class="k">Atlas</span><b>Every border, every year</b><span class="s">3000 BCE → today</span><div class="globe"><i></i><i></i><i></i><i></i></div></a>`;
const readingBox = (cls="") => `<a class="box reading ${cls}" href="#library"><span class="k">Continue reading</span><div class="bk"><div class="spine"></div><div><b>The Histories</b><span>Herodotus · Book II</span><div class="bar"><b></b></div><em>38% read</em></div></div></a>`;

const GAMES = [["challenge","choices","Multiple Choice","done","5/5"],["chrono","timeline","Timeline","done","4/5"],["truefalse","truefalse","True or False","",""],["whosaid","whosaid","Who said it?","",""],["findit","findit","Find it","done","3/5"],["thread","thread","Common Thread","",""],["crossword","crossword","Crossword","",""],["picture","picture","Picture round","",""],["whatyear","whatyear","What year?","",""]];
const gameTiles = (cls="") => `<section class="games ${cls}"><h3><span>Minigames</span><span class="meter"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i><i></i><i></i><i></i><i></i><em>3/9</em></span></h3><div class="tiles">${GAMES.map(([k,g,t,d,s]) => `<a class="tile ${d}" href="#${k}" style="--tile:var(--g-${k})"><span class="gl">${G[g]}</span><span class="tt">${t}</span><span class="ts">${d?`Played · ${s}`:"Play today's"}</span></a>`).join("")}</div></section>`;

const COLLS = [["World History","#4F74C2",11,"810 cards",62],["Ancient Greece","#2BA6A0",8,"1,000 cards",81],["Ancient Rome","#D9544C",6,"580 cards",34],["Japan","#DB8B3A",4,"100 cards",12]];
const collList = (cls="") => `<section class="colls ${cls}"><h3><span>Collections you study</span><a href="#decks">+ Add decks</a></h3><div class="rows">${COLLS.map(([n,c,d,t,w]) => `<a class="row" href="#decks" style="--c:${c}; --w:${w}%"><i></i><div><b>${n}</b><span class="bar"><b></b></span></div><span class="due"><b>${d}</b> due</span><span class="tot">${t}</span></a>`).join("")}</div></section>`;

const foot = () => `<footer class="foot"><span>About Folio · Changelog</span><span>v1.906 · 1 Oct 2026, 14:25</span></footer>`;
const greet = (h="Today") => `<div class="greet"><span class="eyebrow">Wednesday 1 October · Good afternoon, Scholar</span><h1>${h}</h1></div>`;

/* ---------- shared parts (style) ---------- */
const PARTS_CSS = `/* _parts.css — generated by build.js; the components every round-2 page shares. */
:root{--sky:#2A3478; --sky-2:#1B2150; --sky-ink:#F2F3FF; --sky-rose:#F4B9C8;}
.night{--sky:#1A1F4D; --sky-2:#0F1230;}
@media (prefers-color-scheme: dark){ :root:not(.light){--sky:#1A1F4D; --sky-2:#0F1230;} }
.eyebrow{font-family:var(--mono); font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--indigo); font-weight:600;}
.k{display:block; font-family:var(--mono); font-size:10.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-quiet); font-weight:600; margin-bottom:10px;}
h3{display:flex; justify-content:space-between; align-items:baseline; gap:12px; font-family:var(--mono); font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-quiet); font-weight:600; margin:0 0 12px;}
h3 a{color:var(--indigo); font-family:var(--sans); font-size:13px; font-weight:700; letter-spacing:0; text-transform:none;}
/* nav */
.brand{font-family:var(--sans); font-weight:800; font-size:22px; letter-spacing:-.02em; white-space:nowrap;}
.brand .dot{color:var(--zh);}
.brand small{font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-quiet); font-weight:600; margin-left:10px;}
.topbar{display:flex; align-items:center; gap:28px; padding:0 28px; height:60px; background:var(--card); border-bottom:1px solid var(--rule);}
.topbar .nav{display:flex; gap:2px;} .topbar .nav.right{margin-left:auto;}
.nl{display:flex; align-items:center; gap:7px; padding:8px 12px; border-radius:8px; font-family:var(--mono); font-size:11.5px; letter-spacing:.12em; text-transform:uppercase; font-weight:600; color:var(--ink-quiet);}
.nl svg{width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; flex:none;}
.nl.on{color:var(--indigo); box-shadow:inset 0 -2px 0 var(--indigo); border-radius:0;} .nl.adm{color:var(--admin);}
.tabbar{display:none;} .phone-head{display:none;}
.adm-pill{font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--admin); font-weight:600; border:1px solid var(--rule); border-radius:8px; padding:6px 10px;}
@media (max-width:1024px){
  .topbar{padding:0 18px; gap:14px;} .topbar .brand small{display:none;}
  .topbar .nl{padding:8px 7px; font-size:10.5px; letter-spacing:.08em;} .topbar .nav.right .nl span{display:none;} .topbar .nav.right .nl{padding:8px;}
}
@media (max-width:640px){
  .topbar{display:none;}
  .phone-head{display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;}
  .tabbar{display:grid; grid-template-columns:repeat(5,1fr); position:fixed; left:0; right:0; bottom:0; z-index:9; background:var(--card); border-top:1px solid var(--rule); padding:8px 6px calc(8px + env(safe-area-inset-bottom));}
  .tabbar a{display:flex; flex-direction:column; align-items:center; gap:4px; font-family:var(--mono); font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; font-weight:600; color:var(--ink-quiet); padding:4px 0;}
  .tabbar a.on{color:var(--indigo);}
  .tabbar svg{width:20px; height:20px; stroke:currentColor; fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round;}
}
/* greeting + quote */
.greet h1{font-family:var(--sans); font-weight:800; font-size:32px; letter-spacing:-.02em; margin:4px 0 0; line-height:1.1;}
.quote{margin:0; text-align:center;}
.quote blockquote{margin:0; font-family:var(--serif); font-style:italic; font-size:19px; line-height:1.45; color:var(--ink);}
.quote figcaption{font-family:var(--mono); font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-quiet); margin-top:8px;}
.quote figcaption::before{content:""; display:inline-block; width:14px; height:2px; background:var(--ochre); vertical-align:middle; margin-right:8px;}
.quote.strip{display:flex; align-items:center; gap:18px; text-align:left; background:var(--card); border:1px solid var(--rule); border-radius:14px; padding:14px 20px;}
.quote.strip blockquote{font-size:17px; flex:1; min-width:0;} .quote.strip figcaption{margin:0; white-space:nowrap;}
.quote.strip::before{content:"“"; font-family:var(--serif); font-size:44px; line-height:.6; color:var(--zh); flex:none;}
/* the study banner */
.study{position:relative; overflow:hidden; border-radius:20px; background:linear-gradient(135deg, var(--sky) 0%, var(--sky-2) 100%); color:var(--sky-ink); padding:28px 30px; display:grid; grid-template-columns:1fr auto; gap:24px; align-items:center; box-shadow:var(--shadow-md);}
.study .eyebrow{color:var(--sky-rose);}
.study h2{font-family:var(--serif); font-weight:500; font-size:36px; line-height:1.1; letter-spacing:-.015em; margin:8px 0 14px;}
.study h2 b{font-weight:600; color:#fff;}
.pile{display:flex; gap:22px; margin-bottom:14px;}
.pile div b{display:block; font-size:26px; font-weight:800; line-height:1; color:#fff;}
.pile div span{font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; opacity:.7;}
.est{display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; margin-bottom:18px; padding:10px 14px; border-radius:10px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.14);}
.est b{font-size:20px; font-weight:800; color:#fff; white-space:nowrap;} .est span{font-size:12px; opacity:.78; line-height:1.4;}
.acts{display:flex; align-items:center; gap:16px; flex-wrap:wrap;}
.go{display:inline-flex; align-items:center; gap:9px; background:#fff; color:var(--sky); font-family:var(--mono); font-size:11.5px; letter-spacing:.14em; text-transform:uppercase; font-weight:700; padding:13px 20px; border-radius:11px;}
.go svg{width:15px; height:15px; stroke:currentColor; fill:none; stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round;}
.try{font-family:var(--serif); font-style:italic; font-size:14px; color:var(--sky-ink); opacity:.8; text-decoration:underline; text-decoration-color:var(--sky-rose); text-underline-offset:3px;}
.study .globe.deco{position:absolute; right:-70px; bottom:-90px; width:300px; height:300px; opacity:.35; pointer-events:none;}
/* globe outline (the Atlas box's, and the banner's) */
.globe{position:relative; border-radius:50%; border:1.5px solid var(--geo);}
.globe i{position:absolute; inset:0; border-radius:50%; border:1px solid var(--geo);}
.globe i:nth-child(1){transform:scaleX(.25);} .globe i:nth-child(2){transform:scaleX(.62);} .globe i:nth-child(3){transform:scaleY(.25);} .globe i:nth-child(4){transform:scaleY(.62);}
.globe b{position:absolute; width:7px; height:7px; border-radius:50%; background:var(--sky-rose); box-shadow:0 0 0 6px rgba(244,185,200,.25); left:44%; top:30%;}
.study .globe, .study .globe i{border-color:rgba(255,255,255,.6);}
/* boxes */
.box{position:relative; overflow:hidden; display:block; background:var(--card); border:1px solid var(--rule); border-radius:16px; padding:18px 20px; box-shadow:var(--shadow-sm); min-width:0;}
.streak .big{font-size:44px; font-weight:800; letter-spacing:-.04em; line-height:1; color:var(--good);}
.streak .big small{display:block; font-family:var(--mono); font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet); font-weight:600; margin-top:6px;}
.streak .best{font-family:var(--mono); font-size:10.5px; letter-spacing:.08em; color:var(--ink-quiet); margin-top:12px;}
.heat{display:grid; grid-template-columns:repeat(7,11px); gap:3px; margin-top:12px;}
.heat i{width:11px; height:11px; border-radius:3px; background:var(--paper-2);}
.heat i.a{background:color-mix(in srgb, var(--good) 45%, var(--paper-2));} .heat i.b{background:var(--good);} .heat i.t{outline:2px solid var(--indigo); outline-offset:1px;}
.atlas{background:radial-gradient(circle at 85% 115%, color-mix(in srgb, var(--geo) 34%, var(--card)), var(--card) 62%);}
.atlas > b{display:block; font-weight:800; font-size:17px; letter-spacing:-.01em; line-height:1.2; max-width:60%;}
.atlas .s{display:block; font-size:12.5px; color:var(--ink-quiet); margin-top:4px;}
.atlas .globe{position:absolute; right:-28px; bottom:-34px; width:150px; height:150px; opacity:.75;}
.reading .bk{display:flex; gap:14px; align-items:center;}
.reading .spine{width:44px; height:62px; flex:none; border-radius:4px 7px 7px 4px; background:linear-gradient(90deg, var(--indigo) 0 6px, color-mix(in srgb, var(--indigo) 78%, var(--card)) 6px); box-shadow:var(--shadow-md);}
.reading b{display:block; font-family:var(--serif); font-weight:600; font-size:16px;}
.reading span{display:block; font-size:12.5px; color:var(--ink-quiet);}
.reading .bar{display:block; height:4px; border-radius:2px; background:var(--paper-2); margin-top:8px; width:150px; max-width:100%;}
.reading .bar b{display:block; height:100%; width:38%; background:var(--ochre); border-radius:2px;}
.reading em{display:block; font-style:normal; font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ochre); margin-top:6px;}
/* game tiles — the current site's tile, kept: hue wash from the left, glyph bleeding off the corner, full name */
.meter{display:inline-flex; align-items:center; gap:3px;} .meter i{width:12px; height:5px; border-radius:2px; background:var(--paper-2);} .meter i.on{background:var(--good);} .meter em{font-style:normal; margin-left:6px;}
.tiles{display:grid; grid-template-columns:repeat(3,1fr); gap:12px;}
.tile{position:relative; overflow:hidden; min-height:118px; display:flex; flex-direction:column; justify-content:flex-end; padding:16px; border-radius:14px; border:1px solid var(--rule); border-left:4px solid var(--tile); box-shadow:var(--shadow-sm);
  background:linear-gradient(105deg, color-mix(in srgb, var(--tile) 20%, transparent), transparent 64%), linear-gradient(150deg, var(--card) 56%, color-mix(in srgb, var(--tile) 16%, var(--card)));}
.tile .gl{position:absolute; right:-12px; top:-12px; width:96px; height:96px; color:var(--tile); opacity:.16;} .tile .gl svg{width:100%; height:100%;}
.tile .tt{font-family:var(--sans); font-weight:600; font-size:17px; letter-spacing:-.01em; line-height:1.1; color:var(--ink);}
.tile .ts{font-size:12px; color:var(--ink-quiet); margin-top:4px;}
.tile.done{border-left-color:var(--good);} .tile.done .ts{color:var(--good); font-weight:700;}
.tile.done::after{content:"✓"; position:absolute; right:12px; bottom:12px; width:22px; height:22px; border-radius:50%; background:var(--good); color:#fff; font-size:13px; font-weight:800; display:grid; place-content:center;}
/* collections list — always vertical */
.rows{display:flex; flex-direction:column; background:var(--card); border:1px solid var(--rule); border-radius:14px; overflow:hidden;}
.row{display:grid; grid-template-columns:10px 1fr auto auto; align-items:center; gap:14px; padding:13px 18px; border-top:1px solid var(--rule); color:inherit;}
.row:first-child{border-top:0;}
.row i{width:10px; height:10px; border-radius:3px; background:var(--c);}
.row b{font-weight:700; font-size:14.5px;}
.row .bar{display:block; height:4px; border-radius:2px; background:var(--paper-2); margin-top:6px; overflow:hidden; max-width:260px;}
.row .bar b{display:block; height:100%; background:var(--c); width:var(--w);}
.row .due{font-family:var(--mono); font-size:12px; color:var(--ink-quiet); white-space:nowrap;} .row .due b{color:var(--zh); font-weight:600;}
.row .tot{font-family:var(--mono); font-size:11px; color:var(--ink-faint); white-space:nowrap;}
/* the card preview (a fanned pile) */
.preview{position:relative; width:300px; height:200px; flex:none;}
.pc{position:absolute; inset:0; background:var(--card); color:var(--ink); border:1px solid var(--rule); border-radius:12px; padding:16px 18px; box-shadow:var(--shadow-lg); transform-origin:50% 100%; display:flex; flex-direction:column;}
.pc.c3{transform:rotate(-6deg) translate(-12px, 4px); opacity:.85;} .pc.c2{transform:rotate(3deg) translate(10px, 2px); opacity:.93;}
.pc .eb{font-family:var(--mono); font-size:9.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--indigo); font-weight:600; display:flex; justify-content:space-between;}
.pc .eb em{font-style:normal; color:var(--zh);}
.pc p{font-family:var(--serif); font-size:14.5px; line-height:1.4; margin:10px 0 0;}
.pc u{display:inline-block; width:38px; border-bottom:2px solid var(--ochre); text-decoration:none;}
.pc .ft{margin-top:auto; font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-faint);}
.foot{display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-top:30px; font-family:var(--mono); font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-faint);}
@media (max-width:640px){
  .study{grid-template-columns:1fr; padding:22px 20px; border-radius:16px;} .study h2{font-size:30px;}
  .study .preview.in-banner{display:none;}
  .pile{gap:16px;} .pile div b{font-size:22px;}
  .est{gap:6px 10px;} .est b{font-size:18px;} .est span{font-size:11.5px;}
  .tiles{grid-template-columns:repeat(3,1fr); gap:8px;} .tile{min-height:104px; padding:12px 10px; border-radius:12px;} .tile .tt{font-size:14px;} .tile .ts{font-size:10.5px;}
  .tile .gl{width:70px; height:70px; right:-10px; top:-10px;}
  .row{grid-template-columns:10px 1fr auto; padding:12px 14px;} .row .tot{display:none;}
  .quote.strip{flex-direction:column; align-items:flex-start; gap:8px;} .quote.strip::before{display:none;}
  .greet h1{font-size:28px;}
  .study .globe.deco{right:-120px; bottom:-140px;}
}
`;

/* ---------- the six pages ---------- */
const page = (title, layoutCss, body) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Folio — home redesign ${title}</title>
<link rel="stylesheet" href="../../../../fonts.css" />
<link rel="stylesheet" href="../_tokens.css" />
<link rel="stylesheet" href="_parts.css" />
<style>
${layoutCss}
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

/* r2-1 RAIL — Ledger's side rail; the blue banner replaces the stat panel; quote strip under the heading. */
OUT["r2-1-rail"] = page("r2-1: Rail", `
/* Layout: a 232px rail, then a 3-column grid. Tablet: icon rail, 2 columns. Phone: bottom bar, 1 column. */
.shell{display:grid; grid-template-columns:232px 1fr; min-height:100vh;}
.rail{background:var(--card); border-right:1px solid var(--rule); padding:22px 14px; display:flex; flex-direction:column; gap:4px;}
.rail .brand{display:block; padding:4px 10px 18px; font-size:24px;} .rail .brand small{display:block; margin:2px 0 0;}
.rail .nl{padding:10px 12px; font-family:var(--sans); font-size:14px; letter-spacing:0; text-transform:none; font-weight:600; color:var(--ink-soft); border-radius:10px;}
.rail .nl.on{background:var(--indigo-wash); color:var(--indigo); box-shadow:none; border-radius:10px;} .rail .nl svg{width:18px; height:18px;}
.rail .sp{flex:1;} .rail .ver{font-family:var(--mono); font-size:10.5px; color:var(--ink-faint); padding:0 12px;}
.main{padding:28px 36px 60px; max-width:1200px; width:100%;}
.head{display:flex; justify-content:space-between; align-items:flex-end; gap:18px; margin-bottom:18px;}
.search{display:flex; align-items:center; gap:10px; background:var(--card); border:1px solid var(--rule); border-radius:999px; padding:9px 14px; color:var(--ink-quiet); font-size:13.5px; min-width:250px;}
.search svg{width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:2;} .search kbd{margin-left:auto; font-family:var(--mono); font-size:10.5px; border:1px solid var(--rule); border-radius:5px; padding:1px 6px;}
.grid{display:grid; grid-template-columns:2fr 1fr; gap:18px; margin-top:18px;}
.grid .study{grid-column:1;} .grid .streak{grid-column:2;}
.lower{display:grid; grid-template-columns:1fr 1fr 1fr; gap:18px; margin-top:18px;}
.lower .games{grid-column:span 2;}
.side{display:grid; gap:18px; align-content:start;}
@media (max-width:1024px){
  .shell{grid-template-columns:72px 1fr;} .rail{padding:18px 10px; align-items:center;}
  .rail .brand{font-size:20px; padding:2px 0 14px;} .rail .brand small{display:none;} .rail .nl{padding:11px; justify-content:center;} .rail .nl span{display:none;} .rail .ver{display:none;}
  .main{padding:22px 22px 48px;} .search{min-width:0; width:190px;}
  .grid{grid-template-columns:1fr;} .grid .study,.grid .streak{grid-column:auto;}
  .lower{grid-template-columns:1fr 1fr;} .lower .games{grid-column:1 / -1;}
}
@media (max-width:640px){
  .shell{grid-template-columns:1fr;} .rail{display:none;} .main{padding:18px 16px 100px;}
  .head{flex-direction:column; align-items:stretch; gap:12px;} .search{width:100%;}
  .lower{grid-template-columns:1fr;}
}`, `
<div class="shell">
  <aside class="rail">${brand()}${navLinks(NAV)}<a class="nl" href="#search">${I.search}<span>Search</span></a><div class="sp"></div>${navLinks(NAVR.slice(1))}<div class="ver">v1.906 · 1 Oct 2026</div></aside>
  <main class="main">
    ${phoneHead()}
    <div class="head">${greet()}<div class="search">${I.search}Search cards, terms and books<kbd>/</kbd></div></div>
    ${quoteStrip("strip")}
    <div class="grid">${banner({preview:true})}${streakBox()}</div>
    <div class="lower">
      ${gameTiles()}
      <div class="side">${readingBox()}${atlasBox()}</div>
    </div>
    <div style="margin-top:18px">${collList()}</div>
    ${foot()}
  </main>
</div>`);

/* r2-2 MOSAIC — the bento, with the quote as the top tile and the nine games as real tiles in the grid. */
OUT["r2-2-mosaic"] = page("r2-2: Mosaic", `
/* Layout: a floating pill nav; a 4-column mosaic whose rows size to content. Tablet 3 columns, phone 2. */
.top{position:sticky; top:0; z-index:5; display:flex; justify-content:center; padding:14px 16px 0;}
.pill{display:flex; align-items:center; gap:2px; background:color-mix(in srgb, var(--card) 88%, transparent); backdrop-filter:blur(14px); border:1px solid var(--rule); border-radius:999px; padding:6px 8px 6px 16px; box-shadow:var(--shadow-md); width:min(100%, 1120px);}
.pill .brand{margin-right:auto;} .pill .brand small{display:none;} .pill .nav{display:flex; gap:2px;}
.pill .nl{border-radius:999px; font-family:var(--sans); font-size:13.5px; letter-spacing:0; text-transform:none; font-weight:700; color:var(--ink-soft);}
.pill .nl.on{background:var(--indigo); color:var(--on-indigo); box-shadow:none;} .pill .nav.right .nl span{display:none;} .pill .nav.right .nl{padding:8px;}
.wrap{max-width:1120px; margin:0 auto; padding:30px 16px 60px;}
.hello{display:flex; justify-content:space-between; align-items:baseline; margin:0 6px 16px;}
.hello h1{font-family:var(--serif); font-weight:600; font-size:28px; margin:0;}
.grid{display:grid; grid-template-columns:repeat(4,1fr); grid-auto-flow:dense; gap:14px;}
.w2{grid-column:span 2;} .w4{grid-column:1 / -1;} .h2{grid-row:span 2;}
.grid .box, .grid .tile{border-radius:20px;}
.grid .study{border-radius:22px;}
.grid .tile{min-height:140px;}
.grid .games{grid-column:1 / -1; margin-top:6px;} .grid .games h3{margin:0 6px 12px;} .grid .games .tiles{gap:14px;}
.mini{display:flex; flex-direction:column; justify-content:space-between; min-height:120px;} .mini svg{width:26px; height:26px; stroke:var(--indigo); fill:none; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round;}
.mini b{display:block; font-weight:800; font-size:16px;} .mini span{font-size:12.5px; color:var(--ink-quiet);}
.srch{display:flex; align-items:center; gap:10px; background:var(--paper-2); border-style:dashed; color:var(--ink-quiet); font-size:13.5px;} .srch svg{width:18px; height:18px; stroke:currentColor; fill:none; stroke-width:2;} .srch kbd{margin-left:auto; font-family:var(--mono); font-size:10.5px; border:1px solid var(--rule); border-radius:5px; padding:1px 6px;}
.grid .colls{grid-column:span 2; grid-row:span 2;} .grid .colls .rows{border-radius:20px;}
.grid .quote.strip{grid-column:1 / -1; border-radius:20px;}
.foot{margin:26px 6px 0;}
@media (max-width:1024px){
  .grid{grid-template-columns:repeat(3,1fr);} .pill .nav .nl span{display:none;} .pill .nl{padding:8px 10px;}
  .grid .colls{grid-column:1 / -1; grid-row:auto;}
}
@media (max-width:640px){
  .top{display:none;} .wrap{padding:18px 16px 100px;}
  .hello{flex-direction:column; gap:2px; align-items:flex-start;} .hello h1{font-size:24px;}
  .grid{grid-template-columns:1fr 1fr; gap:10px;} .grid .tile{min-height:110px;} .grid .study{grid-column:1 / -1;}
  .grid .reading.w2,.grid .colls,.grid .srch{grid-column:1 / -1;}
}`, `
<div class="top"><nav class="pill">${brand()}<div class="nav">${navLinks(NAV)}</div><div class="nav right">${navLinks(NAVR)}</div></nav></div>
<main class="wrap">
  ${phoneHead()}
  <div class="hello"><h1>Good afternoon, Scholar.</h1><span class="eyebrow">Wednesday 1 October · v1.906</span></div>
  <div class="grid">
    ${quoteStrip("strip")}
    ${banner({cls:"w2 h2", globe:true})}
    ${streakBox()}
    ${atlasBox()}
    ${readingBox("w2")}
    ${collList()}
    <a class="box mini" href="#account">${I.account}<div><b>Account</b><span>Synced · 2 min ago</span></div></a>
    <a class="box mini" href="#mission">${I.library}<div><b>About Folio</b><span>Changelog · v1.906</span></div></a>
    <a class="box srch w2" href="#search">${I.search}Search 4,857 cards, 4,776 terms and 48 books<kbd>/</kbd></a>
    ${gameTiles()}
  </div>
  ${foot()}
</main>`);

/* r2-3 SKY — the dark-blue hero with the globe and the time estimate; the quote sits inside the hero's foot. */
OUT["r2-3-sky"] = page("r2-3: Sky", `
/* Layout: a full-bleed indigo hero that holds the nav, the headline, the estimate and the quote; then a
   wide/narrow two-column body. Tablet: body one column; phone: bottom bar. */
.hero{position:relative; overflow:hidden; background:radial-gradient(ellipse at 85% 110%, var(--sky), var(--sky-2) 62%); color:var(--sky-ink);}
.hero .topbar{background:transparent; border:0; max-width:1240px; margin:0 auto;}
.hero .brand{color:#fff;} .hero .brand small{color:rgba(255,255,255,.65);}
.hero .nl{color:rgba(242,243,255,.75);} .hero .nl.on{color:#fff; box-shadow:inset 0 -2px 0 var(--sky-rose);} .hero .nl.adm{color:#E7B6F0;}
.hero-in{max-width:1240px; margin:0 auto; padding:36px 28px 34px; display:grid; grid-template-columns:1fr auto; gap:30px; align-items:center;}
.hero .eyebrow{color:var(--sky-rose);}
.hero h1{font-family:var(--serif); font-weight:500; font-size:52px; line-height:1.06; letter-spacing:-.02em; margin:10px 0 16px;} .hero h1 b{font-weight:600; color:var(--sky-rose);}
.hero .est{max-width:560px;}
.hero .globe{width:300px; height:300px; border-color:rgba(255,255,255,.55);} .hero .globe i{border-color:rgba(255,255,255,.35);}
.hero .quote{text-align:left; max-width:1240px; margin:0 auto; padding:16px 28px 26px; border-top:1px solid rgba(255,255,255,.14); display:flex; gap:16px; align-items:baseline;}
.hero .quote blockquote{color:#fff; font-size:17px; flex:1;} .hero .quote figcaption{color:rgba(255,255,255,.6); margin:0; white-space:nowrap;} .hero .quote figcaption::before{background:var(--sky-rose);}
.wrap{max-width:1240px; margin:0 auto; padding:28px 28px 60px; display:grid; grid-template-columns:1.6fr 1fr; gap:22px; align-items:start;}
.col{display:grid; gap:22px;}
.phone-head .brand{color:#fff;} .phone-head .adm-pill{color:#E7B6F0; border-color:rgba(255,255,255,.3);}
@media (max-width:1024px){
  .hero-in{grid-template-columns:1fr; padding:28px 24px 24px;} .hero .globe{position:absolute; right:-60px; top:70px; width:220px; height:220px; opacity:.5;}
  .hero h1{font-size:42px;} .wrap{grid-template-columns:1fr; padding:24px 24px 56px;}
}
@media (max-width:640px){
  .hero{padding-top:16px;} .phone-head{padding:0 18px;}
  .hero-in{padding:10px 18px 18px;} .hero h1{font-size:34px;} .hero .globe{width:240px; height:240px; right:-110px; top:-30px; opacity:.3;}
  .hero .quote{padding:14px 18px 22px; flex-direction:column; gap:6px;}
  .wrap{padding:20px 16px 100px;}
}`, `
<section class="hero">
  ${topbar()}${phoneHead()}
  <div class="hero-in">
    <div>
      <span class="eyebrow">Wednesday 1 October · Good afternoon, Scholar</span>
      <h1><b>29 cards</b> are waiting.</h1>
      ${pile()}${estimate()}
      <div class="acts"><a class="go" href="#review">${I.arrow}Start review</a><a class="try" href="#sample">Try ten cards — nothing is saved</a></div>
    </div>
    <div class="globe"><i></i><i></i><i></i><i></i><b></b></div>
  </div>
  ${quoteStrip()}
</section>
<main class="wrap">
  <div class="col">${collList()}${gameTiles()}</div>
  <div class="col">${streakBox()}${readingBox()}${atlasBox()}</div>
</main>
<div style="max-width:1240px; margin:0 auto; padding:0 28px 40px">${foot()}</div>`);

/* r2-4 DEAL — the card preview is the hero: the pile on the left, the blue panel on the right. */
OUT["r2-4-deal"] = page("r2-4: Deal", `
/* Layout: the current top bar; a centred 1100px column; the quote as the page's dateline; a two-cell hero
   (preview | banner); a three-box row; the games; the collections. Tablet keeps the hero stacked. */
.wrap{max-width:1100px; margin:0 auto; padding:26px 24px 60px;}
.head{display:grid; grid-template-columns:auto 1fr; gap:24px 40px; align-items:end; margin-bottom:22px;}
.head .quote{text-align:right;} .head .quote blockquote{font-size:17px;}
.hero{display:grid; grid-template-columns:1fr 1.25fr; gap:24px; align-items:center; margin-bottom:18px;}
.stage{position:relative; height:280px; display:grid; place-items:center; background:var(--card); border:1px solid var(--rule); border-radius:20px; overflow:hidden; box-shadow:var(--shadow-sm);}
.stage::before{content:""; position:absolute; inset:0; background:radial-gradient(circle at 50% 60%, color-mix(in srgb, var(--indigo) 12%, transparent), transparent 60%);}
.stage .preview{width:340px; height:210px;} .stage .pc{padding:18px 20px;} .stage .pc p{font-size:15.5px;}
.stage .k{position:absolute; left:18px; top:16px; margin:0;}
.hero .study{grid-template-columns:1fr; height:100%; padding:26px 28px;}
.three{display:grid; grid-template-columns:1fr 1fr 1fr; gap:18px; margin-bottom:22px;}
.two{display:grid; grid-template-columns:1.4fr 1fr; gap:22px; align-items:start;}
@media (max-width:1024px){
  .head{grid-template-columns:1fr;} .head .quote{text-align:left;}
  .hero{grid-template-columns:1fr;} .stage{height:250px;}
  .three{grid-template-columns:1fr 1fr;} .three .atlas{grid-column:1 / -1;} .two{grid-template-columns:1fr;}
}
@media (max-width:640px){
  .wrap{padding:18px 16px 100px;} .stage{height:220px;} .stage .preview{width:290px; height:180px;} .stage .pc{padding:14px 16px;} .stage .pc p{font-size:14px;}
  .three{grid-template-columns:1fr;}
}`, `
${topbar()}
<main class="wrap">
  ${phoneHead()}
  <div class="head">${greet()}${quoteStrip()}</div>
  <div class="hero">
    <div class="stage"><span class="k">Next up</span>${cardPreview()}</div>
    ${banner()}
  </div>
  <div class="three">${streakBox()}${readingBox()}${atlasBox()}</div>
  <div class="two">${gameTiles()}${collList()}</div>
  ${foot()}
</main>`);

/* r2-5 TWIN — a split: a sticky left pane with the day's essentials, a scrolling right pane with the rest. */
OUT["r2-5-twin"] = page("r2-5: Twin", `
/* Layout: two panes. Left (sticky, 420px): brand, nav, the study banner in its tall form, the streak,
   the quote. Right: collections, games, reading, atlas. Tablet: panes 360px + 1fr; phone: stacked. */
.shell{display:grid; grid-template-columns:440px 1fr; min-height:100vh;}
.left{background:var(--paper-2); border-right:1px solid var(--rule); padding:24px 24px 28px; display:flex; flex-direction:column; gap:16px;}
.left .nav{display:flex; flex-wrap:wrap; gap:2px; margin:-4px 0 4px;} .left .nl{padding:6px 9px; font-size:10.5px;}
.left .study{grid-template-columns:1fr; padding:24px;} .left .study h2{font-size:32px;}
.left .quote{margin-top:auto; padding-top:8px;}
.right{padding:28px 36px 60px; display:grid; gap:24px; align-content:start; max-width:980px;}
.duo{display:grid; grid-template-columns:1fr 1fr; gap:18px;}
.right .greet{margin-bottom:-6px;}
@media (max-width:1024px){
  .shell{grid-template-columns:360px 1fr;} .left{padding:20px 18px;} .left .study{padding:20px;} .left .study h2{font-size:28px;}
  .right{padding:24px 22px 48px;} .duo{grid-template-columns:1fr;}
}
@media (max-width:640px){
  .shell{grid-template-columns:1fr;} .left{border-right:0; border-bottom:1px solid var(--rule); padding:16px 16px 20px;}
  .left .nav{display:none;} .lhead{order:-2;} .left .quote{order:-1; margin:4px 0 6px;}
  .right{padding:20px 16px 100px;}
}`, `
<div class="shell">
  <aside class="left">
    <div class="lhead" style="display:flex; justify-content:space-between; align-items:center">${brand()}<span class="adm-pill">Admin</span></div>
    <nav class="nav">${navLinks(NAV)}${navLinks(NAVR)}</nav>
    ${banner()}
    ${streakBox()}
    ${quoteStrip()}
  </aside>
  <main class="right">
    ${greet()}
    ${collList()}
    ${gameTiles()}
    <div class="duo">${readingBox()}${atlasBox()}</div>
    ${foot()}
  </main>
</div>`);

/* r2-6 COLUMN — the current page's shape (one centred column) rebuilt from the liked parts. */
OUT["r2-6-column"] = page("r2-6: Column", `
/* Layout: the current top bar and a single 860px column, section by section — the smallest step from
   today's page. The quote is centred under the heading exactly as it is now. */
.wrap{max-width:860px; margin:0 auto; padding:28px 24px 60px; display:grid; gap:26px;}
.greet{text-align:center;} .greet h1{font-size:40px;}
.greet h1::after{content:""; display:block; width:120px; height:2px; margin:14px auto 0; background:linear-gradient(90deg, var(--indigo), transparent);}
.quote blockquote{font-size:21px;}
.quote blockquote::before{content:"“"; display:block; font-size:40px; line-height:.5; color:var(--zh); font-style:normal; margin-bottom:12px;}
.three{display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px;}
.about{text-align:center;}
@media (max-width:640px){ .wrap{padding:18px 16px 100px; gap:22px;} .greet h1{font-size:32px;} .three{grid-template-columns:1fr;} }`, `
${topbar()}
<main class="wrap">
  ${phoneHead()}
  ${greet()}
  ${quoteStrip()}
  ${banner({preview:true})}
  <div class="three">${streakBox()}${readingBox()}${atlasBox()}</div>
  ${collList()}
  ${gameTiles()}
  ${foot()}
</main>`);

fs.writeFileSync(path.join(__dirname, "_parts.css"), PARTS_CSS);
for (const [n, h] of Object.entries(OUT)) fs.writeFileSync(path.join(__dirname, n + ".html"), h);
console.log("wrote", Object.keys(OUT).join(", "));
