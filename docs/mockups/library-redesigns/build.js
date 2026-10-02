#!/usr/bin/env node
/* build.js — six Library-page mockups (l-1 … l-6) in the composed home page's style (Oct 2026).
   The live shelf's 48 books, with their authors, dates, part counts, original-language pills and tile
   colours (`books.json`, pulled from the live page), plus a sample reading state. Every design keeps the
   page's functions: the search filter with its count, the sort (Last read / Title / Author / Date) and its
   direction, the help, and a tile per book that opens it. Not part of the site. */
"use strict";
const fs = require("fs"), path = require("path");
const RAW = JSON.parse(fs.readFileSync(path.join(__dirname, "books.json"), "utf8"));
const R4 = fs.readFileSync(path.join(__dirname, "..", "home-redesigns", "round-4", "build.js"), "utf8");
const R2 = fs.readFileSync(path.join(__dirname, "..", "home-redesigns", "round-2", "build.js"), "utf8");
const G = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "home-redesigns", "round-2", "glyphs.json"), "utf8"));
const h2 = R2.slice(R2.indexOf("const I = {"), R2.indexOf("const quoteStrip"));
const h4 = R4.slice(R4.indexOf("const PARTS = `"), R4.indexOf("const page = ("));
const P = new Function("G", h2 + "\n" + h4 + "\nreturn {I, topbar, tabbar, phoneHead, PARTS};")(G);
const topbar = () => P.topbar().replace('class="nl on" href="#home"', 'class="nl" href="#home"').replace('class="nl" href="#library"', 'class="nl on" href="#library"');
const tabbar = () => P.tabbar().replace('class="on" href="#home"', 'class="" href="#home"').replace('class="" href="#library"', 'class="on" href="#library"');
const { I, phoneHead } = P;

/* ---------- the books ---------- */
const BOOKS = RAW;
const READ = { "The Histories": 38, "Meditations": 100, "The Odyssey": 12, "The Prince": 64, "The Art of War": 100 };
const LAST = ["The Histories", "The Odyssey", "The Prince", "Meditations", "The Art of War"];
/* era by date, for the designs that shelve by period */
const ERA = (b) => b.year < 500 ? "Antiquity" : b.year < 1300 ? "Middle Ages" : "Early modern";
const pct = (b) => READ[b.title] || 0;
const sortBy = (list, key) => [...list].sort((a, b) => key === "title" ? a.title.replace(/^The /, "").localeCompare(b.title.replace(/^The /, "")) : a.author.localeCompare(b.author));

/* ---------- shared pieces ---------- */
const head = (sub="Historical books in the public domain, completely free to read.") => `<div class="greet"><span class="eyebrow">Library</span><h1>Books</h1><p class="sub">${sub}</p></div>`;
const tools = (sort="Last read", dir="Most recent first") => `<div class="tools"><a class="search" href="#filter">${I.search}<span>Search these books</span><em>48 books</em></a><span class="sort"><span class="lbl">Sort</span><span class="sel">${sort} ▾</span></span><span class="dir">${dir}</span><span class="help">?</span></div>`;
const quietHelp = () => `<div class="quiet"><div><span class="k">The Library</span><b>Whole books, not extracts</b> — every work here is out of copyright and complete, in a named edition. <a href="#how">How this works</a></div><span class="x">×</span></div>`;
const langPill = (b) => b.lang ? `<span class="lang">${b.lang} original</span>` : "";
const status = (b) => pct(b) === 100 ? `<span class="st done">Finished</span>` : pct(b) ? `<span class="st on">${pct(b)}% · continue</span>` : `<span class="st">Start reading</span>`;
const foot = () => `<footer class="foot"><span>About Folio · Changelog</span><span>v1.906 · 1 Oct 2026, 14:25</span></footer>`;

const BASE = `
.wrap{max-width:1100px; margin:0 auto; padding:26px 24px 60px;}
.greet .sub{margin:8px 0 0; color:var(--ink-quiet); font-size:15px; max-width:60ch;}
.gap{height:22px;}
.quiet{display:flex; justify-content:space-between; gap:14px; background:var(--card); border:1px solid var(--rule); border-left:4px solid var(--indigo); border-radius:12px; padding:12px 16px; font-size:13.5px; color:var(--ink-soft); line-height:1.5; margin-bottom:18px;}
.quiet .k{margin-bottom:4px;} .quiet b{color:var(--ink);} .quiet a{color:var(--indigo); font-weight:700; margin-left:6px;} .quiet .x{color:var(--ink-faint); font-size:18px; line-height:1;}
.tools{display:grid; grid-template-columns:1fr auto auto auto; gap:10px; align-items:center;}
.search{display:flex; align-items:center; gap:10px; background:var(--card); border:1px solid var(--rule); border-radius:12px; padding:11px 14px; color:var(--ink-quiet); font-size:14px; min-width:0;}
.search svg{width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:2; flex:none;} .search span{flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;} .search em{font-style:normal; font-family:var(--mono); font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink-faint);}
.sort{display:inline-flex; align-items:center; gap:8px; background:var(--card); border:1px solid var(--rule); border-radius:12px; padding:9px 12px; font-size:13.5px;} .sort .lbl{font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet);}
.dir{font-family:var(--mono); font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink-quiet); border:1px solid var(--rule); border-radius:12px; padding:10px 12px; background:var(--card); white-space:nowrap;}
.help{display:grid; place-content:center; width:38px; height:38px; border-radius:50%; border:1px solid var(--rule); color:var(--ink-quiet); font-family:var(--mono); font-weight:700; background:var(--card);}
.sec-h{display:flex; justify-content:space-between; align-items:baseline; gap:12px; margin:0 0 12px; font-family:var(--mono); font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-quiet); font-weight:600;} .sec-h em{font-style:normal; color:var(--ink-faint); margin-left:8px;}
.au{font-family:var(--mono); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--c); font-weight:600;} .ti{font-family:var(--serif); font-weight:600; font-size:17px; line-height:1.2; color:var(--ink);} .wh{font-family:var(--serif); font-style:italic; font-size:12.5px; color:var(--ink-quiet);}
.pa{font-family:var(--mono); font-size:10.5px; letter-spacing:.06em; color:var(--ink-faint); white-space:nowrap;}
.lang{font-family:var(--mono); font-size:9.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-quiet); border:1px solid var(--rule); border-radius:999px; padding:3px 8px; white-space:nowrap;}
.st{font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; font-weight:700; color:var(--indigo); white-space:nowrap;} .st.on{color:var(--ochre);} .st.done{color:var(--good);}
.prog{display:block; height:4px; border-radius:2px; background:var(--paper-2); overflow:hidden;} .prog b{display:block; height:100%; background:var(--ochre); width:var(--w);}
.foot{display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-top:30px; font-family:var(--mono); font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-faint);}
@media (max-width:640px){ .wrap{padding:18px 16px 100px;} .foot{justify-content:center; text-align:center;} .tools{grid-template-columns:1fr 1fr;} .tools .search{grid-column:1 / -1;} .tools .help{display:none;} .dir{text-align:center;} .quiet{font-size:13px;} }
`;
const page = (title, css, body) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Folio — library redesign ${title}</title>
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
const byLast = [...LAST.map((t) => BOOKS.find((b) => b.title === t)), ...BOOKS.filter((b) => !LAST.includes(b.title))];

/* ===== l-1 SHELF — the home page's fill rows: the fill is how far the book is read. */
OUT["l-1-shelf"] = page("l-1: Shelf", `
.rows{display:grid; gap:8px;}
.fr{position:relative; overflow:hidden; display:grid; grid-template-columns:8px 1fr auto auto auto; gap:16px; align-items:center; background:var(--card); border:1px solid var(--rule); border-radius:12px; padding:12px 16px 12px 14px; color:inherit;}
.fr::before{content:""; position:absolute; left:0; top:0; bottom:0; width:var(--w); background:linear-gradient(90deg, color-mix(in srgb, var(--c) 20%, var(--card)), color-mix(in srgb, var(--c) 9%, var(--card))); border-right:3px solid var(--c);}
.fr[style*="--w:0%"]::before{display:none;} .fr > *{position:relative;}
.fr .sp{width:8px; height:42px; border-radius:2px; background:var(--c);}
.fr .ti{display:block;} .fr .wh{display:block; margin-top:2px;}
@media (max-width:640px){ .fr{grid-template-columns:8px 1fr auto; padding:12px 14px 12px 12px;} .fr .pa, .fr .lang{display:none;} .fr::before{top:auto; height:5px; border-right:0; background:var(--c);} .fr[style*="--w:0%"]::before{display:none;} }`, `
${quietHelp()}${head()}
<div class="gap"></div>${tools()}<div class="gap"></div>
<div class="rows">${byLast.map((b) => `<a class="fr" href="#book" style="--c:${b.c}; --w:${pct(b)}%"><span class="sp"></span><span><span class="au">${b.author}</span><span class="ti">${b.title}</span><span class="wh">${b.when}</span></span><span class="pa">${b.parts}</span>${langPill(b)}${status(b)}</a>`).join("")}</div>`);

/* ===== l-2 COVERS — upright covers six across, the title set on the cover, a read bar in the foot. */
OUT["l-2-covers"] = page("l-2: Covers", `
.grid{display:grid; grid-template-columns:repeat(6,1fr); gap:14px;}
.cv{display:flex; flex-direction:column; background:var(--card); border:1px solid var(--rule); border-radius:10px; overflow:hidden; color:inherit;}
.cv .cover{aspect-ratio:2 / 3; background:linear-gradient(160deg, color-mix(in srgb, var(--c) 82%, #fff), var(--c) 45%, color-mix(in srgb, var(--c) 72%, #1D1B29)); color:#fff; padding:14px 12px 12px 16px; display:flex; flex-direction:column; justify-content:space-between; position:relative; box-shadow:inset 6px 0 0 rgba(0,0,0,.18), inset 8px 0 0 rgba(255,255,255,.12);}
.cv .cover .au{color:rgba(255,255,255,.8);} .cv .cover .ti{color:#fff; font-size:15.5px; text-shadow:0 1px 2px rgba(0,0,0,.3);} .cv .cover .wh{color:rgba(255,255,255,.75);}
.cv .cover .done{position:absolute; right:8px; top:8px; width:20px; height:20px; border-radius:50%; background:#fff; color:var(--good); font-size:11px; font-weight:800; display:grid; place-content:center;}
.cv .in{padding:8px 10px 10px; display:grid; gap:5px;} .cv .row{display:flex; justify-content:space-between; align-items:center; gap:6px;}
@media (max-width:1024px){ .grid{grid-template-columns:repeat(4,1fr);} }
@media (max-width:640px){ .grid{grid-template-columns:repeat(3,1fr); gap:8px;} .cv .cover{padding:10px 8px 8px 12px;} .cv .cover .ti{font-size:12.5px;} .cv .cover .wh{display:none;} .cv .in{padding:6px 8px 8px;} .cv .pa{display:none;} }`, `
${quietHelp()}${head()}
<div class="gap"></div>${tools()}<div class="gap"></div>
<div class="grid">${byLast.map((b) => `<a class="cv" href="#book" style="--c:${b.c}"><span class="cover">${pct(b)===100?'<span class="done">✓</span>':""}<span><span class="au">${b.author}</span><br><span class="ti">${b.title}</span></span><span class="wh">${b.when}</span></span><span class="in"><span class="prog" style="--w:${pct(b)}%"><b></b></span><span class="row"><span class="pa">${b.parts}</span>${status(b)}</span></span></a>`).join("")}</div>`);

/* ===== l-3 READING ROOM — the current books in the study banner's blue, then the shelf by era. */
OUT["l-3-room"] = page("l-3: Reading room", `
.now{position:relative; overflow:hidden; border-radius:20px; background:linear-gradient(135deg, var(--sky), var(--sky-2)); color:var(--sky-ink); padding:26px 30px; box-shadow:var(--shadow-md);}
.now .eyebrow{color:var(--sky-rose);} .now h2{font-family:var(--serif); font-weight:500; font-size:30px; margin:6px 0 16px; color:#fff;} .now h2 b{font-weight:600; color:var(--sky-rose);}
.now .bks{display:grid; grid-template-columns:repeat(3,1fr); gap:12px;}
.nb{display:grid; grid-template-columns:44px 1fr; gap:12px; align-items:center; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.14); border-radius:12px; padding:10px 12px; color:inherit;}
.nb .sp{width:44px; height:62px; border-radius:3px 6px 6px 3px; background:linear-gradient(90deg, rgba(0,0,0,.3) 0 6px, var(--c) 6px); box-shadow:var(--shadow-md);}
.nb .ti{color:#fff; font-size:15px; display:block;} .nb .wh{color:rgba(255,255,255,.7); display:block; font-style:normal; font-family:var(--sans);} .nb .prog{background:rgba(255,255,255,.18); margin-top:6px;} .nb .prog b{background:var(--sky-rose);} .nb .st{color:var(--sky-rose); display:block; margin-top:4px;}
.era{margin-top:24px;}
.rows{display:grid; grid-template-columns:1fr 1fr; gap:8px;}
.rw{display:grid; grid-template-columns:8px 1fr auto; gap:12px; align-items:center; background:var(--card); border:1px solid var(--rule); border-radius:12px; padding:10px 14px 10px 12px; color:inherit;}
.rw .sp{width:8px; height:40px; border-radius:2px; background:var(--c);} .rw .ti{display:block; font-size:15.5px;} .rw .wh{display:block;} .rw .r{display:grid; justify-items:end; gap:4px;}
@media (max-width:1024px){ .now .bks{grid-template-columns:1fr 1fr 1fr;} }
@media (max-width:640px){ .now{padding:20px;} .now h2{font-size:24px;} .now .bks{grid-template-columns:1fr;} .rows{grid-template-columns:1fr;} .rw .lang{display:none;} }`, `
${quietHelp()}${head()}
<div class="gap"></div>
<section class="now"><span class="eyebrow">Your reading</span><h2><b>3 books</b> open, <b>2</b> finished.</h2><div class="bks">${["The Histories","The Odyssey","The Prince"].map((t) => BOOKS.find((b) => b.title === t)).map((b) => `<a class="nb" href="#book" style="--c:${b.c}"><span class="sp"></span><span><span class="ti">${b.title}</span><span class="wh">${b.author} · ${b.parts}</span><span class="prog" style="--w:${pct(b)}%"><b></b></span><span class="st">${pct(b)}% · continue</span></span></a>`).join("")}</div></section>
<div class="gap"></div>${tools("Date", "Oldest first")}
${["Antiquity","Middle Ages","Early modern"].map((era) => { const list = BOOKS.filter((b) => ERA(b) === era).sort((a, b) => a.year - b.year); return `<div class="era"><div class="sec-h"><span>${era}<em>${list.length}</em></span></div><div class="rows">${list.map((b) => `<a class="rw" href="#book" style="--c:${b.c}"><span class="sp"></span><span><span class="au">${b.author}</span><span class="ti">${b.title}</span><span class="wh">${b.when}</span></span><span class="r">${langPill(b)}${status(b)}</span></a>`).join("")}</div></div>`; }).join("")}`);

/* ===== l-4 LEDGER — one ledger with a band per original language, the Collections page's shape. */
OUT["l-4-ledger"] = page("l-4: Ledger", `
.ledger{background:var(--card); border:1px solid var(--rule); border-radius:14px; overflow:hidden;}
.band{display:flex; justify-content:space-between; padding:8px 16px; background:var(--paper-2); border-top:1px solid var(--rule); font-family:var(--mono); font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-quiet); font-weight:600;} .ledger > .band:first-child{border-top:0;} .band em{font-style:normal; color:var(--ink-faint); margin-left:8px;}
.lr{display:grid; grid-template-columns:36px 1fr auto auto auto; gap:14px; align-items:center; padding:11px 16px; border-top:1px solid var(--rule); color:inherit;}
.lr .mg{width:36px; height:36px; border-radius:9px; background:var(--c); color:#fff; display:grid; place-content:center; font-family:var(--serif); font-weight:600; font-size:17px;}
.lr .ti{display:inline; font-size:15.5px;} .lr .au{display:inline; margin-left:8px;} .lr .wh{display:block;}
.lr .pr{display:grid; gap:4px; justify-items:end; min-width:120px;} .lr .prog{width:120px;}
@media (max-width:640px){ .lr{grid-template-columns:32px 1fr auto; padding:10px 12px;} .lr .pa, .lr .lang{display:none;} .lr .pr{min-width:0;} .lr .prog{width:70px;} .lr .au{display:block; margin:0;} }`, `
${quietHelp()}${head()}
<div class="gap"></div>${tools("Title", "A to Z")}<div class="gap"></div>
<div class="ledger">${["Greek","Latin","Chinese","Sanskrit","English","Other languages"].map((lg) => { const list = sortBy(BOOKS.filter((b) => lg === "English" ? /English/.test(b.lang) : lg === "Other languages" ? !/Greek|Latin|Chinese|Sanskrit|English/.test(b.lang) : b.lang === lg), "title"); return `<div class="band"><span>${lg === "Other languages" ? lg : lg + " originals"}<em>${list.length}</em></span></div>` + list.map((b) => `<a class="lr" href="#book" style="--c:${b.c}"><span class="mg">${b.title.replace(/^The /, "")[0]}</span><span><span class="ti">${b.title}</span><span class="au">${b.author}</span><span class="wh">${b.when}</span></span><span class="pa">${b.parts}</span>${langPill(b)}<span class="pr">${status(b)}<span class="prog" style="--w:${pct(b)}%"><b></b></span></span></a>`).join(""); }).join("")}</div>`);

/* ===== l-5 TIMELINE — the shelf as a line through time, oldest first, each book a card off the line. */
OUT["l-5-timeline"] = page("l-5: Timeline", `
.tl{position:relative; padding-left:34px;} .tl::before{content:""; position:absolute; left:11px; top:0; bottom:0; width:2px; background:var(--rule);}
.mark{position:relative; margin:22px 0 10px; font-family:var(--mono); font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--indigo); font-weight:700;} .mark::before{content:""; position:absolute; left:-29px; top:3px; width:12px; height:12px; border-radius:50%; background:var(--indigo); box-shadow:0 0 0 4px var(--paper);}
.tc{position:relative; display:grid; grid-template-columns:auto 1fr auto; gap:14px; align-items:center; background:var(--card); border:1px solid var(--rule); border-radius:12px; padding:10px 14px; margin-bottom:8px; color:inherit;}
.tc::before{content:""; position:absolute; left:-27px; top:50%; width:8px; height:8px; margin-top:-4px; border-radius:50%; background:var(--c);} .tc::after{content:""; position:absolute; left:-19px; top:50%; width:18px; height:1px; background:var(--rule);}
.tc .sp{width:30px; height:44px; border-radius:2px 4px 4px 2px; background:linear-gradient(90deg, rgba(0,0,0,.25) 0 4px, var(--c) 4px);}
.tc .ti{display:block;} .tc .wh{display:block;} .tc .r{display:grid; justify-items:end; gap:4px;}
@media (min-width:1025px){ .tl{display:grid; grid-template-columns:1fr 1fr; column-gap:14px;} .tl .mark{grid-column:1 / -1;} }
@media (max-width:640px){ .tl{padding-left:26px;} .tl::before{left:7px;} .mark::before{left:-25px; width:10px; height:10px;} .tc::before{left:-23px;} .tc::after{left:-15px; width:14px;} .tc .lang{display:none;} }`, `
${quietHelp()}${head("Every work on the shelf, oldest first.")}
<div class="gap"></div>${tools("Date", "Oldest first")}
<div class="tl">${[["Before 500 BCE", (b) => b.year < -500],["500 BCE to 1 CE", (b) => b.year >= -500 && b.year < 1],["1 CE to 500", (b) => b.year >= 1 && b.year < 500],["500 to 1300", (b) => b.year >= 500 && b.year < 1300],["After 1300", (b) => b.year >= 1300]].map(([label, test]) => { const list = BOOKS.filter(test).sort((a, b) => a.year - b.year); return `<div class="mark">${label} · ${list.length}</div>` + list.map((b) => `<a class="tc" href="#book" style="--c:${b.c}"><span class="sp"></span><span><span class="au">${b.author}</span><span class="ti">${b.title}</span><span class="wh">${b.when}</span></span><span class="r">${langPill(b)}${status(b)}</span></a>`).join(""); }).join("")}</div>`);

/* ===== l-6 DESK — a sticky "Your reading" pane beside a compact three-across shelf. */
OUT["l-6-desk"] = page("l-6: Desk", `
.wrap{max-width:1240px;}
.cols{display:grid; grid-template-columns:300px 1fr; gap:24px; align-items:start;}
.pane{position:sticky; top:16px; display:grid; gap:12px; background:var(--paper-2); border:1px solid var(--rule); border-radius:18px; padding:18px;}
.pane .k{margin:0;}
.pb{display:grid; grid-template-columns:36px 1fr; gap:10px; align-items:center; background:var(--card); border:1px solid var(--rule); border-radius:10px; padding:8px 10px; color:inherit;}
.pb .sp{width:36px; height:50px; border-radius:2px 5px 5px 2px; background:linear-gradient(90deg, rgba(0,0,0,.25) 0 5px, var(--c) 5px);} .pb .ti{font-size:14px; display:block;} .pb .wh{display:block; font-style:normal; font-family:var(--sans);} .pb .prog{margin-top:5px;}
.pane .stats{display:grid; grid-template-columns:1fr 1fr; gap:8px;} .pane .stats div{background:var(--card); border:1px solid var(--rule); border-radius:10px; padding:10px 12px;} .pane .stats b{display:block; font-size:22px; font-weight:800; letter-spacing:-.03em; line-height:1;} .pane .stats span{font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-quiet);}
.grid{display:grid; grid-template-columns:repeat(3,1fr); gap:10px;}
.cc{display:grid; grid-template-columns:34px 1fr; gap:10px; align-items:start; background:var(--card); border:1px solid var(--rule); border-radius:12px; padding:10px 12px; color:inherit; min-height:86px;}
.cc .sp{width:34px; height:48px; border-radius:2px 5px 5px 2px; background:linear-gradient(90deg, rgba(0,0,0,.25) 0 5px, var(--c) 5px);}
.cc .ti{display:block; font-size:14.5px;} .cc .wh{display:block;} .cc .row{display:flex; justify-content:space-between; align-items:center; gap:6px; margin-top:6px;}
@media (max-width:1024px){ .cols{grid-template-columns:1fr;} .pane{position:static;} .pane .bks{display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;} .grid{grid-template-columns:1fr 1fr;} }
@media (max-width:640px){ .pane .bks{grid-template-columns:1fr;} .grid{grid-template-columns:1fr;} .cc .pa{display:none;} }`, `
${quietHelp()}${head()}
<div class="gap"></div>
<div class="cols">
  <aside class="pane"><span class="k">Your reading</span><div class="bks">${["The Histories","The Odyssey","The Prince"].map((t) => BOOKS.find((b) => b.title === t)).map((b) => `<a class="pb" href="#book" style="--c:${b.c}"><span class="sp"></span><span><span class="ti">${b.title}</span><span class="wh">${b.author} · ${pct(b)}%</span><span class="prog" style="--w:${pct(b)}%"><b></b></span></span></a>`).join("")}</div><div class="stats"><div><b>2</b><span>finished</span></div><div><b>3</b><span>open</span></div><div><b>14</b><span>highlights</span></div><div><b>6 h 20</b><span>read this month</span></div></div></aside>
  <div>${tools()}<div class="gap"></div><div class="grid">${byLast.map((b) => `<a class="cc" href="#book" style="--c:${b.c}"><span class="sp"></span><span><span class="au">${b.author}</span><span class="ti">${b.title}</span><span class="wh">${b.when}</span><span class="row"><span class="pa">${b.parts}</span>${status(b)}</span></span></a>`).join("")}</div></div>
</div>`);

for (const [n, h] of Object.entries(OUT)) fs.writeFileSync(path.join(__dirname, n + ".html"), h);
console.log("wrote", Object.keys(OUT).join(", "), "·", BOOKS.length, "books; unparsed:", BOOKS.filter((b) => !b.when).length);
