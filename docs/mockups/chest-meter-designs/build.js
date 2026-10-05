#!/usr/bin/env node
/* build.js — six designs each, tablet and phone, for the home page's "nine games → chest" indicator
   (Oct 2026, on request). The desktop keeps its 3×3 miniature of the tile grid; a tablet lays the tiles
   two to a row and a phone one to a row, so a 3×3 is a miniature of nothing there. Each design is drawn
   in the real tokens (copied from styles.css), the real fonts (../../../fonts.css), the real chest and
   lock marks and the real game glyphs and hues, in one sample state: 5 of 9 played, 2 of them perfect,
   chest still locked. Not part of the site. `node build.js` writes tablet.html / phone.html and, with
   Playwright on NODE_PATH, the shots. */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");

const CHEST = '<svg class="chest-svg" viewBox="0 0 120 96" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g><path d="M14 40V30a46 16 0 0 1 92 0v10z" fill="currentColor" fill-opacity=".14"/><path d="M6 40h108v11H6z" fill="currentColor" fill-opacity=".22"/></g><g><path d="M14 51h92v35a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6z" fill="currentColor" fill-opacity=".14"/><path d="M52 51h16v17H52z" fill="currentColor" fill-opacity=".3"/><path d="M60 60v6"/></g></svg>';
const LOCK = '<svg class="lock-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.4"/><path d="M8 10.5V7.6a4 4 0 0 1 8 0v2.9"/></svg>';
const I = {
  choices: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="2"/><line x1="10" y1="6" x2="20" y2="6"/><circle cx="5" cy="12" r="2" fill="currentColor" stroke="none"/><line x1="10" y1="12" x2="20" y2="12"/><circle cx="5" cy="18" r="2"/><line x1="10" y1="18" x2="20" y2="18"/></svg>',
  timeline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><circle cx="6" cy="12" r="2.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="2.4" fill="currentColor" stroke="none"/></svg>',
  truefalse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 13 6 17 11 8"/><line x1="15" y1="9" x2="21" y2="15"/><line x1="21" y1="9" x2="15" y2="15"/></svg>',
  whosaid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
  findit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  thread: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.6" fill="currentColor" stroke="none"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6" fill="currentColor" stroke="none"/></svg>',
  crossword: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="6" height="6" rx="1"/><rect x="16" y="9" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="9" y="16" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" stroke="none"/></svg>',
  picture: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="15" rx="2"/><circle cx="8.6" cy="10" r="1.8" fill="currentColor" stroke="none"/><polyline points="21 16.5 15.4 10.9 6.2 19.5"/></svg>',
  whatyear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="18" x2="21" y2="18"/><line x1="7" y1="15.2" x2="7" y2="20.8"/><line x1="12" y1="15.2" x2="12" y2="20.8"/><line x1="17" y1="15.2" x2="17" y2="20.8"/><path d="M9.3 5.9a2.9 2.9 0 0 1 5.4 1.5c0 2-2.7 2.4-2.7 4"/><line x1="12" y1="13.2" x2="12" y2="13.2"/></svg>',
};
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12.5 9.5 18 20 6.5"/></svg>';
const STAR = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.8l2.7 5.9 6.4.7-4.8 4.4 1.3 6.3L12 17l-5.6 3.1 1.3-6.3L2.9 9.4l6.4-.7z"/></svg>';

// DAILY_GAMES order, the tiles' own hues, and the sample day: 5 of 9 played, 2 perfectly
const GAMES = [
  { key: "challenge", name: "Multiple Choice", c: "#D9544C", g: I.choices,   st: "done" },
  { key: "chrono",    name: "Timeline",        c: "#4F74C2", g: I.timeline,  st: "won" },
  { key: "truefalse", name: "True or False",   c: "#4F9D67", g: I.truefalse, st: "done" },
  { key: "whosaid",   name: "Who said it?",    c: "#8257C2", g: I.whosaid,   st: "" },
  { key: "findit",    name: "Find it",         c: "#2BA6A0", g: I.findit,    st: "won" },
  { key: "thread",    name: "Common Thread",   c: "#DB8B3A", g: I.thread,    st: "done" },
  { key: "crossword", name: "Crossword",       c: "#00A4D6", g: I.crossword, st: "" },
  { key: "picture",   name: "Picture round",   c: "#CE80A8", g: I.picture,   st: "" },
  { key: "whatyear",  name: "What year?",      c: "#5E8802", g: I.whatyear,  st: "" },
];
const N = GAMES.filter(g => g.st).length, NW = GAMES.filter(g => g.st === "won").length, ALL = GAMES.length;

const TOKENS = `
:root{--paper:#F7F6FB; --paper-2:#EBE9F5; --card:#FDFDFF; --ink:#1D1B29; --ink-soft:#514D68; --ink-faint:#918CA8; --ink-quiet:#69657E; --rule:#DEDAEE;
  --indigo:#45549C; --indigo-bright:#5263B0; --indigo-wash:#E9ECFA; --ochre:#9A7C55; --zh:#AE3350; --good:#4E9B7E; --gold:#C08A2E; --gold-a:#E5C765; --gold-b:#BE9829;
  --serif:"Lora", Georgia, serif; --mono:"IBM Plex Mono", ui-monospace, Menlo, monospace; --sans:"Nunito Sans", ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif;
  --shadow-sm:0 1px 2px rgba(29,27,41,.05); --fs:1;}
html.night{--paper:#131220; --paper-2:#0C0B16; --card:#1C1A2C; --ink:#EFEDFA; --ink-soft:#B6B1D0; --ink-faint:#827CA0; --ink-quiet:#8C87A8; --rule:#302C48;
  --indigo:#A6B4F0; --indigo-bright:#C2CCFF; --indigo-wash:#20203A; --ochre:#C3A47A; --zh:#EFA8B8; --good:#75C6A4; --gold:#E6C765; --gold-a:#F0D98A; --gold-b:#D2AE47; --shadow-sm:none;}
`;

const BASE = `
*{box-sizing:border-box;} html,body{margin:0;} body{background:var(--paper); color:var(--ink); font-family:var(--sans); -webkit-font-smoothing:antialiased;}
.wrap{max-width:1040px; margin:0 auto; padding:18px 24px 40px;}
.lab{display:grid; grid-template-columns:auto 1fr; gap:2px 10px; align-items:baseline; margin:30px 0 12px; padding-top:18px; border-top:1px dashed var(--rule);}
.lab:first-child{border-top:0; margin-top:4px; padding-top:0;}
.lab b{font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--indigo); font-weight:600;}
.lab span{font-family:var(--serif); font-size:15px; color:var(--ink-soft);}
.lab em{grid-column:2; font-style:normal; font-size:12.5px; line-height:1.4; color:var(--ink-quiet);}
/* the games section as it ships */
.games-sec{display:flex; flex-direction:column; gap:10px;} .ind{display:flex; flex-direction:column; gap:10px; padding:6px 0;}
.games-top{display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;}
.games-head{margin:0; text-align:left; font-family:var(--mono); font-size:10.5px; letter-spacing:.16em; text-transform:uppercase; font-weight:600; color:var(--ink-quiet);}
.game-grid{display:grid; gap:10px; grid-template-columns:repeat(2,1fr);}
.phone .game-grid{grid-template-columns:1fr;}
.game-tile{display:flex; align-items:center; gap:12px; min-height:0; padding:10px 12px 10px 10px; border-radius:12px; background:var(--card); border:1px solid var(--rule); border-left:4px solid var(--tile); box-shadow:var(--shadow-sm); text-align:left; font:inherit; color:var(--ink);}
.game-tile.done, .game-tile.won{background:color-mix(in srgb, var(--tile) 9%, var(--card));}
.gt-glyph{display:grid; place-content:center; width:40px; height:40px; border-radius:50%; background:color-mix(in srgb, var(--tile) 18%, var(--card)); color:var(--tile);}
.gt-glyph svg{width:22px; height:22px;}
.game-tile.done .gt-glyph, .game-tile.won .gt-glyph{background:var(--tile); color:#fff;} .night .game-tile.done .gt-glyph, .night .game-tile.won .gt-glyph{color:var(--paper);}
.gt-title{flex:1; font-size:15px; font-weight:600;}
.pill{display:inline-flex; align-items:center; gap:5px; padding:4px 9px 4px 7px; border-radius:999px; background:var(--tile); color:#fff; font-family:var(--mono); font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; line-height:1;}
.night .pill{color:var(--paper);} .pill svg{width:12px; height:12px;}
.fade{position:relative; max-height:118px; overflow:hidden;} .phone .fade{max-height:150px;}
.fade::after{content:""; position:absolute; inset:auto 0 0 0; height:70px; background:linear-gradient(to bottom, transparent, var(--paper));}
/* shared marks */
.chest{position:relative; display:inline-flex; align-items:center; justify-content:center; flex:none; width:38px; height:32px; padding:0; background:none; border:0; color:var(--ink-faint); opacity:.5;}
.chest .chest-svg{width:100%; height:100%;}
.chest .lock-svg{position:absolute; right:-2px; bottom:-1px; width:13px; height:13px; background:var(--paper); border-radius:50%; padding:1px;}
.count{font-family:var(--mono); font-size:11px; color:var(--ink-faint); letter-spacing:.04em; white-space:nowrap;} .count b{color:var(--ink); font-weight:600;}
i.on{background:var(--good) !important;} i.won{background:linear-gradient(100deg, var(--gold-a) 0%, var(--gold-b) 100%) !important;}
`;

const tiles = (n) => GAMES.slice(0, n).map(g =>
  `<div class="game-tile ${g.st}" style="--tile:${g.c}"><span class="gt-glyph">${g.g}</span><span class="gt-title">${g.name}</span>${g.st === "won" ? `<span class="pill">${STAR}Perfect</span>` : g.st === "done" ? `<span class="pill">${CHECK}Played</span>` : ""}</div>`).join("");
const chest = (cls = "") => `<button type="button" class="chest ${cls}" disabled title="Finish all nine of today's minigames to unlock a chest" aria-label="Locked: finish all nine minigames to unlock today's chest">${CHEST}<span aria-hidden="true">${LOCK}</span></button>`;
const pips = (cls) => GAMES.map(g => `<i class="${cls} ${g.st === "won" ? "won" : g.st ? "on" : ""}" title="${g.name}"></i>`).join("");
const sec = (device, indicator, below = "") =>
  `<section class="games-sec ${device}"><div class="ind"><div class="games-top"><h2 class="games-head">Minigames</h2>${indicator}</div>${below}</div><div class="fade"><div class="game-grid">${tiles(device === "phone" ? 3 : 4)}</div></div></section>`;
const block = (n, title, note, body) => `<div class="lab"><b>${n}</b><span>${title}</span><em>${note}</em></div>${body}`;

/* a ring of nine arcs, drawn once with SVG — `r` the radius, `w` the stroke */
const ring = (size, r, w) => {
  const c = size / 2, gapDeg = 7, seg = 360 / ALL - gapDeg;
  const arc = (i, cls) => {
    const a0 = (-90 + i * 360 / ALL + gapDeg / 2) * Math.PI / 180, a1 = a0 + seg * Math.PI / 180;
    return `<path class="${cls}" d="M${(c + r * Math.cos(a0)).toFixed(2)} ${(c + r * Math.sin(a0)).toFixed(2)} A${r} ${r} 0 0 1 ${(c + r * Math.cos(a1)).toFixed(2)} ${(c + r * Math.sin(a1)).toFixed(2)}"/>`;
  };
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" fill="none" stroke-width="${w}" stroke-linecap="round" aria-hidden="true">
    <defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--gold-a)"/><stop offset="1" stop-color="var(--gold-b)"/></linearGradient></defs>
    ${GAMES.map((g, i) => arc(i, g.st === "won" ? "rw" : g.st ? "ro" : "rx")).join("")}</svg>`;
};

/* ============================ TABLET (641–1024px: the tiles are two to a row) ============================ */
const TABLET_CSS = `
/* T1 two-by-five miniature */
.t1 .meter{display:flex; align-items:center; gap:10px;} .t1 .mini{display:grid; grid-template-columns:repeat(2, auto); gap:3px 3px;}
.t1 .mini i{display:block; width:22px; height:4px; border-radius:99px; background:var(--rule);} .t1 .mini i.on{box-shadow:0 0 0 1px color-mix(in srgb, var(--good) 35%, transparent);}
.t1 .mini i:last-child{grid-column:1 / -1; width:22px;}
.t1.row{display:flex; align-items:center; gap:14px;}
/* T2 nine-segment bar */
.t2.row{display:flex; align-items:center; gap:12px;} .t2 .bar{display:flex; gap:3px;} .t2 .bar i{display:block; width:18px; height:6px; border-radius:99px; background:var(--rule);}
.t2 .bar i:first-child{border-radius:99px 3px 3px 99px;} .t2 .bar i:last-child{border-radius:3px 99px 99px 3px;}
.t2 .count{font-size:12px;}
/* T3 the ring */
.t3.row{display:flex; align-items:center; gap:10px;} .t3 .ringwrap{position:relative; width:52px; height:52px; display:grid; place-items:center;}
.t3 .ring{position:absolute; inset:0;} .t3 .ring .rx{stroke:var(--rule);} .t3 .ring .ro{stroke:var(--good);} .t3 .ring .rw{stroke:url(#gg);}
.t3 .chest{width:28px; height:24px;} .t3 .chest .lock-svg{display:none;} .t3 .lbl{display:flex; flex-direction:column; line-height:1.15;}
.t3 .lbl b{font-family:var(--mono); font-size:13px; font-weight:600; color:var(--ink);} .t3 .lbl span{font-family:var(--mono); font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-faint);}
/* T4 the glyph rail, full width under the heading */
.t4 .rail{display:flex; align-items:center; gap:0; margin:2px 0 4px; padding:10px 14px; border:1px solid var(--rule); border-radius:12px; background:var(--card); box-shadow:var(--shadow-sm);}
.t4 .rail .count{margin-right:16px; font-size:12px;} .t4 .steps{flex:1; display:flex; align-items:center;}
.t4 .step{position:relative; display:grid; place-items:center; width:30px; height:30px; border-radius:50%; border:1.5px solid var(--rule); color:var(--ink-faint); background:var(--card); flex:none;}
.t4 .step svg{width:15px; height:15px;} .t4 .step.on{border-color:var(--c); background:color-mix(in srgb, var(--c) 16%, var(--card)); color:var(--c);}
.t4 .step.won{background:linear-gradient(100deg, var(--gold-a), var(--gold-b)); border-color:var(--gold-b); color:#fff;} .night .t4 .step.won{color:var(--paper);}
.t4 .link{flex:1; height:2px; background:var(--rule); min-width:8px;} .t4 .link.on{background:var(--good);}
.t4 .rail .chest{margin-left:12px; width:40px; height:34px;}
/* T5 the trail */
.t5.row{display:flex; align-items:center; gap:12px;} .t5 .trail{display:flex; align-items:center;}
.t5 .dot{width:9px; height:9px; border-radius:50%; background:var(--rule); flex:none; box-sizing:border-box;} .t5 .dot.on{background:var(--good);} .t5 .dot.won{background:linear-gradient(135deg, var(--gold-a), var(--gold-b)); width:11px; height:11px; margin:0 -1px;}
.t5 .seg{width:10px; height:2px; background:var(--rule);} .t5 .seg.on{background:var(--good);} .t5 .seg.dash{background:repeating-linear-gradient(90deg, var(--rule) 0 3px, transparent 3px 5px);}
.t5 .seg.last{width:14px;} .t5 .togo{font-family:var(--sans); font-size:12.5px; color:var(--ink-quiet);} .t5 .togo b{color:var(--ink); font-weight:700;}
/* T6 the filling chest */
.t6.row{display:flex; align-items:center; gap:14px;} .t6 .fillchest{position:relative; width:46px; height:38px; color:var(--ink-faint);}
.t6 .fillchest .chest-svg{position:absolute; inset:0; width:100%; height:100%;}
.t6 .fillchest .liquid .chest-svg{color:var(--good); clip-path:inset(${100 - Math.round(N / ALL * 100)}% 0 0 0);} .t6 .fillchest .liquid path{fill-opacity:.6;}
.t6 .fillchest .lock-svg{position:absolute; right:-3px; bottom:-2px; width:14px; height:14px; background:var(--paper); border-radius:50%; padding:1px; color:var(--ink-faint);}
.t6 .words{display:flex; flex-direction:column; line-height:1.2;} .t6 .words b{font-family:var(--mono); font-size:13px; font-weight:600; color:var(--ink);} .t6 .words span{font-size:12.5px; color:var(--ink-quiet);}
.t6 .words span em{font-style:normal; color:var(--gold-b); font-weight:600;} .night .t6 .words span em{color:var(--gold);}
`;

const tablet = () => {
  const t1 = sec("tablet", `<div class="t1 row"><div class="meter" role="img" aria-label="${N} of ${ALL} minigames finished today"><div class="mini">${pips("")}</div><span class="count"><b>${N}</b>/${ALL}</span></div>${chest()}</div>`);
  const t2 = sec("tablet", `<div class="t2 row"><div class="bar" role="img" aria-label="${N} of ${ALL} minigames finished today">${pips("")}</div><span class="count"><b>${N}</b>/${ALL}</span>${chest()}</div>`);
  const t3 = sec("tablet", `<div class="t3 row"><div class="lbl"><b>${N} of ${ALL}</b><span>played today</span></div><div class="ringwrap">${ring(52, 23, 3.5)}${chest()}</div></div>`);
  const steps = GAMES.map((g, i) => `<span class="step ${g.st}" style="--c:${g.c}" title="${g.name}">${g.g}</span>` + (i < ALL - 1 ? `<span class="link ${GAMES[i].st && GAMES[i + 1].st ? "on" : ""}"></span>` : "")).join("");
  const t4 = sec("tablet", `<span class="count t4c" style="font-size:12px"><b>${N}</b>/${ALL} today</span>`, `<div class="t4"><div class="rail"><span class="count"><b>${N}</b> of ${ALL}</span><div class="steps">${steps}</div>${chest()}</div></div>`)
    .replace(/<span class="count t4c"[^>]*>.*?<\/span>/, "");
  const trail = GAMES.map((g, i) => `<span class="dot ${g.st === "won" ? "won" : g.st ? "on" : ""}" title="${g.name}"></span>` + `<span class="seg ${i === ALL - 1 ? "last dash" : g.st && GAMES[i + 1].st ? "on" : "dash"}"></span>`).join("");
  const t5 = sec("tablet", `<div class="t5 row"><span class="togo"><b>${ALL - N}</b> to go</span><div class="trail" role="img" aria-label="${N} of ${ALL} minigames finished today">${trail}</div>${chest()}</div>`);
  const t6 = sec("tablet", `<div class="t6 row"><div class="words"><b>${N} / ${ALL}</b><span>${ALL - N} more to unlock${NW ? ` · <em>${NW} perfect</em>` : ""}</span></div><div class="fillchest" role="img" aria-label="${N} of ${ALL} minigames finished today">${CHEST}<span class="liquid">${CHEST.replace('class="chest-svg"', 'class="chest-svg"')}</span>${LOCK}</div></div>`);
  return [
    block("T1", "Two-by-five miniature", "the honest mirror: pips laid out as the tablet lays out the tiles (two to a row, the ninth alone), so the lit pip is still the tile it names", t1),
    block("T2", "Nine-segment bar", "one meter in reading order, left to right, top to bottom — the tile order without pretending to be the tile layout", t2),
    block("T3", "Ring around the chest", "the nine segments wrap the chest itself; the count stands beside it in words", t3),
    block("T4", "Glyph rail", "the width a tablet has: a strip under the heading with each game's own glyph in its hue once played, gold when perfect, joined by a line that runs to the chest", t4),
    block("T5", "Trail to the chest", "nine stations on a path, the played stretch drawn solid and the rest dashed; the words say how many are left", t5),
    block("T6", "The chest fills", "the chest is the meter — it fills from the floor as games are played, with the figures and the perfect count beside it", t6),
  ].join("");
};

/* ============================ PHONE (≤640px: the tiles are one to a row) ============================ */
const PHONE_CSS = `
.phone .games-top{gap:8px 12px;}
/* P1 the ladder */
.p1.row{display:flex; align-items:center; gap:10px;} .p1 .ladder{display:grid; gap:2px;} .p1 .ladder i{display:block; width:16px; height:3px; border-radius:99px; background:var(--rule);}
/* P2 compact segmented bar */
.p2.row{display:flex; align-items:center; gap:9px;} .p2 .bar{display:flex; gap:2.5px;} .p2 .bar i{display:block; width:11px; height:5px; border-radius:99px; background:var(--rule);}
.p2 .bar i:first-child{border-radius:99px 2px 2px 99px;} .p2 .bar i:last-child{border-radius:2px 99px 99px 2px;}
/* P3 the ring, phone size */
.p3.row{display:flex; align-items:center; gap:8px;} .p3 .ringwrap{position:relative; width:40px; height:40px; display:grid; place-items:center;}
.p3 .ring{position:absolute; inset:0;} .p3 .ring .rx{stroke:var(--rule);} .p3 .ring .ro{stroke:var(--good);} .p3 .ring .rw{stroke:url(#gg);}
.p3 .chest{width:21px; height:18px;} .p3 .chest .lock-svg{display:none;}
.p3 .cpill{font-family:var(--mono); font-size:11px; font-weight:600; color:var(--ink); padding:3px 8px; border-radius:999px; background:var(--paper-2); border:1px solid var(--rule);} .p3 .cpill small{font-weight:500; color:var(--ink-faint); font-size:11px;}
/* P4 the full-width rail under the heading */
.p4 .rail{display:flex; align-items:center; gap:10px; margin:0 0 2px;} .p4 .track{flex:1; display:flex; gap:3px;} .p4 .track i{flex:1; height:6px; border-radius:99px; background:var(--rule);}
.p4 .track i:first-child{border-radius:99px 3px 3px 99px;} .p4 .track i:last-child{border-radius:3px 99px 99px 3px;}
.p4 .rail .count{font-size:11.5px;} .p4 .rail .chest{width:34px; height:28px;}
/* P5 the chest alone, with a badge */
.p5.row{display:flex; align-items:center; padding:4px 6px 0 14px;} .p5 .badge{position:relative; display:inline-grid; place-items:center;}
.p5 .badge .chest{width:40px; height:34px;} .p5 .badge .chest .lock-svg{right:-3px; bottom:-1px;}
.p5 .num{position:absolute; top:-8px; left:-16px; font-family:var(--mono); font-size:10px; font-weight:600; letter-spacing:.02em; color:#fff; background:var(--good); border-radius:999px; padding:2px 6px; line-height:1.2; box-shadow:0 0 0 2px var(--paper);}
.night .p5 .num{color:var(--paper);}
.p5 .arc{position:absolute; inset:-4px; width:auto; height:auto;} .p5 .arc .rx{stroke:var(--rule);} .p5 .arc .ro{stroke:var(--good);} .p5 .arc .rw{stroke:url(#gg);}
/* P6 words on the heading row, the rule beneath is the meter */
.p6.row{display:flex; align-items:center; gap:10px;} .p6 .words{font-family:var(--mono); font-size:11px; color:var(--ink-faint); letter-spacing:.02em;}
.p6 .words b{color:var(--ink); font-weight:600;} .p6 .words em{font-style:normal; color:var(--gold-b); font-weight:600;} .night .p6 .words em{color:var(--gold);}
.p6 .hair{position:relative; height:3px; border-radius:2px; background:var(--rule); margin:-2px 0 4px; overflow:hidden;}
.p6 .hair i{position:absolute; left:0; top:0; bottom:0; width:${(N / ALL * 100).toFixed(1)}%; background:var(--good); border-radius:2px;}
.p6 .hair i::after{content:""; position:absolute; right:0; top:0; bottom:0; width:${(NW / N * 100).toFixed(1)}%; background:linear-gradient(90deg, var(--gold-a), var(--gold-b));}
`;

const phone = () => {
  const p1 = sec("phone", `<div class="p1 row"><div class="ladder" role="img" aria-label="${N} of ${ALL} minigames finished today">${pips("")}</div><span class="count"><b>${N}</b>/${ALL}</span>${chest()}</div>`);
  const p2 = sec("phone", `<div class="p2 row"><div class="bar" role="img" aria-label="${N} of ${ALL} minigames finished today">${pips("")}</div><span class="count"><b>${N}</b>/${ALL}</span>${chest()}</div>`);
  const p3 = sec("phone", `<div class="p3 row"><span class="cpill">${N}<small>/${ALL}</small></span><div class="ringwrap">${ring(40, 17.5, 3)}${chest()}</div></div>`);
  const p4 = sec("phone", "", `<div class="p4"><div class="rail"><span class="count"><b>${N}</b> of ${ALL}</span><div class="track" role="img" aria-label="${N} of ${ALL} minigames finished today">${pips("")}</div>${chest()}</div></div>`);
  const p5 = sec("phone", `<div class="p5 row"><span class="badge">${ring(50, 22, 2.5).replace('class="ring"', 'class="arc"')}${chest()}<span class="num">${N}/${ALL}</span></span></div>`);
  const p6 = sec("phone", `<div class="p6 row"><span class="words"><b>${N}</b> of ${ALL} played${NW ? ` · <em>${NW} perfect</em>` : ""}</span>${chest()}</div>`, `<div class="p6"><div class="hair" role="img" aria-label="${N} of ${ALL} minigames finished today"><i></i></div></div>`);
  return [
    block("P1", "The ladder", "the honest mirror of a phone's single column: nine short rungs, one per tile, top to bottom", p1),
    block("P2", "Compact segmented bar", "the nine as one small meter on the heading row, with the figures and the chest", p2),
    block("P3", "Ring and pill", "the segments wrap the chest; the count is a pill beside it", p3),
    block("P4", "Full-width rail", "the heading keeps its own line; under it the meter runs the whole width and the chest caps its right end", p4),
    block("P5", "Chest with a badge", "the smallest footprint — the chest alone, a count badge on its shoulder, a thin segmented arc round it", p5),
    block("P6", "Words, and the rule is the meter", "the count in words on the heading row; the hairline beneath fills green with a gold tail for the perfect runs", p6),
  ].join("");
};

const page = (title, device, css, body) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="../../../fonts.css">
<script>(function(){var t=new URLSearchParams(location.search).get("theme");if(t==="dark")document.documentElement.classList.add("night");})();</script>
<style>${TOKENS}${BASE}${css}</style></head>
<body class="${device}"><div class="wrap">${body}</div></body></html>`;

const here = __dirname;
fs.writeFileSync(path.join(here, "tablet.html"), page("Chest indicator — tablet designs", "tablet", TABLET_CSS, tablet()));
fs.writeFileSync(path.join(here, "phone.html"), page("Chest indicator — phone designs", "phone", PHONE_CSS, phone()));
console.log("wrote tablet.html, phone.html");

/* ---- shots: serve the repo root over HTTP (fonts.css is three levels up) and screenshot each page ---- */
let pw; try { pw = require("playwright"); } catch (e) { console.log("no playwright on NODE_PATH — html only"); process.exit(0); }
const ROOT = path.resolve(here, "..", "..", "..");
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2", ".png": "image/png" };
const srv = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  fs.readFile(p, (err, buf) => { if (err) { res.writeHead(404); return res.end(); } res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }); res.end(buf); });
});
(async () => {
  await new Promise(r => srv.listen(0, r));
  const port = srv.address().port, rel = "/docs/mockups/chest-meter-designs/";
  const br = await pw.chromium.launch();
  const out = path.join(here, "shots"); fs.mkdirSync(out, { recursive: true });
  const shots = [["tablet", 834], ["phone", 390]];
  for (const [dev, w] of shots) for (const theme of ["light", "dark"]) {
    const pg = await br.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
    await pg.goto(`http://127.0.0.1:${port}${rel}${dev}.html?theme=${theme}`, { waitUntil: "networkidle" });
    await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(150);
    await pg.screenshot({ path: path.join(out, `${dev}-${theme}.png`), fullPage: true });
    await pg.close();
  }
  /* a side-by-side sheet per device: light beside night */
  for (const [dev, w] of shots) {
    const a = fs.readFileSync(path.join(out, `${dev}-light.png`)).toString("base64"), b = fs.readFileSync(path.join(out, `${dev}-dark.png`)).toString("base64");
    const pg = await br.newPage({ viewport: { width: w * 2 + 60, height: 900 }, deviceScaleFactor: 1 });
    await pg.setContent(`<body style="margin:0;background:#8E8AA6;display:flex;gap:20px;padding:20px"><img style="width:${w}px;height:auto;display:block" src="data:image/png;base64,${a}"><img style="width:${w}px;height:auto;display:block" src="data:image/png;base64,${b}"></body>`);
    await pg.waitForTimeout(100);
    await pg.screenshot({ path: path.join(out, `${dev}-sheet.png`), fullPage: true });
    await pg.close();
  }
  /* detail sheets: each design's indicator row cropped at 3x, light beside night */
  const titles = { tablet: ["Two-by-five miniature", "Nine-segment bar", "Ring around the chest", "Glyph rail", "Trail to the chest", "The chest fills"],
                   phone: ["The ladder", "Compact segmented bar", "Ring and pill", "Full-width rail", "Chest with a badge", "Words, and the rule is the meter"] };
  for (const [dev, w] of shots) {
    const crops = { light: [], dark: [] };
    for (const theme of ["light", "dark"]) {
      const pg = await br.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 3 });
      await pg.goto(`http://127.0.0.1:${port}${rel}${dev}.html?theme=${theme}`, { waitUntil: "networkidle" });
      await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(150);
      const els = await pg.$$(".ind");
      for (const el of els) crops[theme].push((await el.screenshot()).toString("base64"));
      await pg.close();
    }
    const cw = w - 48, rows = crops.light.map((a, i) => `<div class="r"><div class="l"><b>${dev[0].toUpperCase()}${i + 1}</b><span>${titles[dev][i]}</span></div><img style="width:${cw}px" src="data:image/png;base64,${a}"><img style="width:${cw}px" src="data:image/png;base64,${crops.dark[i]}"></div>`).join("");
    const pg = await br.newPage({ viewport: { width: cw * 2 + 220, height: 300 }, deviceScaleFactor: 1.5 });
    await pg.setContent(`<link rel="stylesheet" href="http://127.0.0.1:${port}/fonts.css"><body style="margin:0;background:#E9E7F1;padding:18px;font-family:'Nunito Sans',sans-serif">
      <div style="display:grid;grid-template-columns:140px ${cw}px ${cw}px;gap:12px 16px;align-items:center">
        <div></div><div style="font:600 11px 'IBM Plex Mono',monospace;letter-spacing:.14em;color:#69657E">LIGHT</div><div style="font:600 11px 'IBM Plex Mono',monospace;letter-spacing:.14em;color:#69657E">NIGHT</div>${rows}</div>
      <style>.r{display:contents}.r img{display:block;height:auto;border-radius:8px;box-shadow:0 1px 3px rgba(29,27,41,.12)}.r .l b{display:block;font:600 11px 'IBM Plex Mono',monospace;letter-spacing:.14em;color:#45549C}.r .l span{font:15px 'Lora',serif;color:#1D1B29;line-height:1.25}</style></body>`);
    await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
    await pg.screenshot({ path: path.join(out, `${dev}-detail.png`), fullPage: true });
    await pg.close();
  }
  await br.close(); srv.close();
  console.log("shots written to", out);
})();
