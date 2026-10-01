#!/usr/bin/env node
/* build.js — the composed home page (Oct 2026), assembled from round 4 on request:
   Compass's study banner and streak ribbon; Tabular's minigame list-tiles and Continue Reading row;
   Keys' This Week box and fill-row active decks. The greeting never carries the date. Not part of the site. */
"use strict";
const fs = require("fs"), path = require("path");
const R4 = fs.readFileSync(path.join(__dirname, "..", "round-4", "build.js"), "utf8");
const G = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "round-2", "glyphs.json"), "utf8"));
const R2 = fs.readFileSync(path.join(__dirname, "..", "round-2", "build.js"), "utf8");
const helpers2 = R2.slice(R2.indexOf("const I = {"), R2.indexOf("const quoteStrip"));
const helpers2b = R2.slice(R2.indexOf("const cardPreview"), R2.indexOf("const banner"));
const helpers2c = R2.slice(R2.indexOf("const readingBox"), R2.indexOf("const GAMES"));
const helpers2d = R2.slice(R2.indexOf("const foot"), R2.indexOf("/* ---------- shared parts (style)"));
const helpers4 = R4.slice(R4.indexOf("const GAMES = ["), R4.indexOf("const page = ("));
const P = new Function("G", "fs", "path", "__dirname", helpers2 + helpers2b + helpers2c + helpers2d + "\n" + helpers4 +
  "\nreturn {I, topbar, tabbar, phoneHead, readingBox, foot, GAMES, DECKS, pct, boxes, legend, quote, globeDeco, banner, ribbon, PARTS};")(G, fs, path, path.join(__dirname, "..", "round-4"));

const bannerStacked = () => P.banner().replace(/(<div class="pile">[\s\S]*?<\/div>)\s*(<a class="go"[\s\S]*?<\/a>)/, '<div class="stack">$1$2</div>');
const greet = () => `<div class="greet"><span class="eyebrow">Good afternoon, Scholar</span><h1>Today</h1></div>`;
const thisWeek = () => `<section class="box week"><span class="k">This week</span><div class="stats"><div><b>184</b><span>cards studied</span></div><div><b>71 min</b><span>at the desk</span></div><div class="g"><b>87%</b><span>recalled</span></div></div>${P.globeDeco().replace('class="gdeco "','class="gdeco" style="right:-40px;bottom:-60px;width:150px;height:150px"')}</section>`;

const CSS = `
/* the pile's figures sit centred over their labels */
.study .pile div{text-align:center;} .study .pile .t{text-align:center;}
/* the pile and the button share one width: a stack as wide as the figures, and the button fills it */
.study .stack{display:inline-flex; flex-direction:column; align-items:stretch; width:max-content; max-width:100%;} .study .stack .pile{margin-bottom:22px;} .study .stack .go{justify-content:center;}
.wrap{max-width:1040px; margin:0 auto; padding:26px 24px 60px;}
.gap{height:22px;}
/* Keys' active decks: the row's own fill is the share of the collection learned */
.fill{display:grid; gap:8px;}
.fr{position:relative; overflow:hidden; display:grid; grid-template-columns:1fr auto auto; gap:16px; align-items:center; background:var(--card); border:1px solid var(--rule); border-radius:12px; padding:14px 18px; color:inherit;}
.fr::before{content:""; position:absolute; left:0; top:0; bottom:0; width:var(--w); background:linear-gradient(90deg, color-mix(in srgb, var(--c) 22%, var(--card)), color-mix(in srgb, var(--c) 10%, var(--card))); border-right:3px solid var(--c);}
.fr > *{position:relative;}
.fr b.name{font-weight:700; font-size:15.5px; display:block;} .fr .m{font-size:12px; color:var(--ink-quiet);}
.fr .pct{font-family:var(--mono); font-size:13px; font-weight:700; color:var(--c);}
/* Tabular's minigames: a name and a tick */
.list{display:grid; grid-template-columns:repeat(3,1fr); gap:10px;}
.lt{display:grid; grid-template-columns:40px 1fr auto; align-items:center; gap:12px; background:var(--card); border:1px solid var(--rule); border-radius:12px; padding:10px 12px 10px 10px; box-shadow:inset 4px 0 0 var(--tile); color:inherit;}
.lt .ic{width:40px; height:40px; border-radius:50%; background:color-mix(in srgb, var(--tile) 18%, var(--card)); color:var(--tile); display:grid; place-content:center;} .lt .ic svg{width:22px; height:22px;}
.lt b{font-weight:700; font-size:14.5px;}
.lt .st{width:22px; height:22px; border-radius:50%; border:1.5px solid var(--rule); display:grid; place-content:center; font-size:11px; font-weight:800; color:transparent;}
.lt.done .st{background:var(--good); border-color:var(--good); color:#fff;} .lt.done .st::after{content:"✓";}
/* Keys' This Week box */
.week{display:flex; flex-direction:column;} .week .k{align-self:flex-start;}
.week .stats{flex:1; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; align-content:center; justify-items:center; text-align:center;}
.week .stats b{display:block; font-size:26px; font-weight:800; letter-spacing:-.03em; line-height:1;} .week .stats span{display:block; font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet); margin-top:4px;}
.week .stats .g b{color:var(--good);}
.two{display:grid; grid-template-columns:1fr 1fr; gap:16px;}
@media (max-width:1024px){ .list{grid-template-columns:1fr 1fr;} }
@media (max-width:640px){ .wrap{padding:18px 16px 100px;} .fr{grid-template-columns:1fr auto; padding:12px 14px 16px;} .fr .pct{display:none;}
  .fr::before{top:auto; height:5px; border-right:0; background:var(--c); border-radius:0 3px 3px 0;} .fr .m{display:none;} .list{grid-template-columns:1fr;} .two{grid-template-columns:1fr;} }`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Folio — home redesign, composed</title>
<link rel="stylesheet" href="../../../../fonts.css" />
<link rel="stylesheet" href="../_tokens.css" />
<style>
${P.PARTS}
${CSS}
</style>
</head>
<body>
${P.topbar()}
<main class="wrap">
  ${P.phoneHead()}
  ${greet()}
  ${P.quote()}
  ${bannerStacked()}
  <div class="gap"></div>
  ${P.ribbon()}
  <div class="gap"></div>
  <div class="sec-h"><span>Your collections</span>${P.legend()}</div>
  <div class="fill">${P.DECKS.map(d => `<a class="fr" href="#study" style="--c:${d[1]}; --w:${P.pct(d)}%"><span><b class="name">${d[0]}</b><span class="m" data-pct="${P.pct(d)}">${d[6]} of ${d[5].toLocaleString()} cards learned</span></span><span class="pct">${P.pct(d)}%</span>${P.boxes(d)}</a>`).join("")}</div>
  <div class="gap"></div>
  <div class="sec-h"><span>Minigames · 3 of 9</span><a href="#chest">Play all nine for the chest</a></div>
  <div class="list">${P.GAMES.map(([k,g,t,d]) => `<a class="lt ${d}" href="#${k}" style="--tile:var(--g-${k})"><span class="ic">${G[g]}</span><b>${t}</b><span class="st"></span></a>`).join("")}</div>
  <div class="gap"></div>
  <div class="two">${P.readingBox()}${thisWeek()}</div>
  ${P.foot()}
</main>
${P.tabbar()}
<script src="../_theme.js"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, "home-composed.html"), html);
console.log("wrote home-composed.html");
