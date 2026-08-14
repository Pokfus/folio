#!/usr/bin/env node
/* ============================================================
   THE ARTEFACT ART CONTACT SHEET
   ============================================================
   Standalone Node helper, zero dependencies. Not part of the site.

     node .claude/artefact-art-sheet.js
     open .claude/artefact-art/sheet.html

   Writes a self-contained review page for whatever `gen-artefact-art.js` has made. It exists
   because the two questions a pilot has to answer cannot be answered by looking at one plate:

     IS IT STILL THE OBJECT?   Answerable only with the source photograph beside it, at the same
                               size. Hence the COMPARE view, which is the default: reference on
                               the left, generated piece on the right, the hazard the piece was
                               chosen for printed underneath, and a checklist of the things a
                               model quietly repairs — condition, inscription, ornament, form.

     IS IT ONE SET?            Answerable only in a grid. Style drift is invisible one piece at a
                               time and obvious across eight. Hence the GRID view, which strips
                               out every label so nothing but the art is comparable.

   It also renders each piece in a MOCK PLATE carrying the real rarity border, because the art is
   never seen bare on the site — `.ar-winart .card-img` puts a 2px `--rar` border around it, and a
   piece that looks well on white can sit badly inside an orange legendary frame on a dark paper.
   The tokens below are copied from styles.css and are the folio theme's, light and night.

   NOTHING HERE IS SHIPPED. The sheet is a working file, gitignored with the reference cache.
   ============================================================================================ */

"use strict";

const fs = require("fs");
const path = require("path");
const STYLE = require("./artefact-art/style.js");

const ROOT = path.join(__dirname, "..");
const WORK = path.join(__dirname, "artefact-art");
const ART_DIR = path.join(ROOT, "art", "artefacts");
const OUT = path.join(WORK, "sheet.html");

global.window = {};
require(path.join(ROOT, "artefacts.js"));
const BY_ID = new Map((global.window.ARTEFACTS || []).map((a) => [a.id, a]));

let manifest = {};
try { manifest = JSON.parse(fs.readFileSync(path.join(WORK, "manifest.json"), "utf8")); } catch {}

const HAZARD = new Map(STYLE.PILOT.map((p) => [p.id, p.hazard]));

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* Paths are RELATIVE to the sheet, so it opens straight off the filesystem with no server. */
function artPath(id) {
  for (const ext of [".webp", ".png"]) {
    if (fs.existsSync(path.join(ART_DIR, id + ext))) return "../../art/artefacts/" + id + ext;
  }
  return null;
}
function refPath(id) {
  const dir = path.join(WORK, "ref");
  if (!fs.existsSync(dir)) return null;
  const hit = fs.readdirSync(dir).find((f) => f.replace(/\.[^.]+$/, "") === id);
  return hit ? "ref/" + hit : null;
}

/* --audit shows every cached REFERENCE photograph with the artefact it is filed under, and no
   generated art at all. It is the pre-flight check, and it is here because the first pilot run
   found `ulfberht-sword` filed against a photograph of US Marines pitching a tent — see the
   comment above `refsOnly` in gen-artefact-art.js. Ten minutes over this grid before generating
   is the cheapest check in the pipeline: a wrong reference does not produce an obviously wrong
   picture here, it produces a beautiful painting of the wrong object. */
const AUDIT = process.argv.includes("--audit");

const ids = AUDIT
  ? [...BY_ID.keys()].filter((id) => refPath(id))
  : Object.keys(manifest).length
    ? Object.keys(manifest)
    : fs.existsSync(ART_DIR)
      ? [...new Set(fs.readdirSync(ART_DIR).filter((f) => !/-256\./.test(f)).map((f) => f.replace(/\.[^.]+$/, "")))]
      : [];

if (!ids.length) {
  if (AUDIT) {
    console.error("no cached reference photographs. Fetch them first:");
    console.error("  node .claude/gen-artefact-art.js --refs");
  } else {
    console.error("nothing to show — no art in art/artefacts and no manifest.");
    console.error("run:  node .claude/gen-artefact-art.js --pilot");
  }
  process.exit(1);
}

const rows = ids.map((id) => {
  const a = BY_ID.get(id) || { name: id, rarity: "common", date: "", origin: "" };
  const m = manifest[id] || {};
  const art = artPath(id);
  const ref = refPath(id);
  return { id, a, m, art, ref, hazard: HAZARD.get(id) || "" };
});

/* In audit mode a card is the reference photograph, big, with everything a human needs to answer
   "is this that object?" — the name it is filed under, its date and origin, and the CREDIT and ALT
   beneath. Those last two matter more than they look: a mismatch usually confesses in the file
   NAME rather than in the picture's licence. The Marines photograph is credited only as "Public
   domain, via Wikimedia Commons", which tells you nothing, while its filename and alt both read
   "MRF-E 19 1- White Ulfberht" — Marine Rotational Force-Europe, on an exercise named after the
   sword. Print the filename and the eye catches what the licence line cannot say. */
const auditCard = (r) => `
<article class="piece" data-rar="${esc(r.a.rarity)}">
  <header>
    <h2>${esc(r.a.name)}</h2>
    <p class="meta"><span class="rar">${esc(r.a.rarity)}</span> · ${esc(r.a.date)} · ${esc(r.a.origin)}</p>
  </header>
  <div class="pair one">
    <figure>
      ${r.ref ? `<img src="${esc(r.ref)}" alt="reference photograph filed under ${esc(r.a.name)}">`
              : `<div class="missing">no cached reference</div>`}
    </figure>
  </div>
  <p class="credit">${esc((r.a.image && r.a.image.credit) || "no credit")}</p>
  <p class="alt">alt: ${esc((r.a.image && r.a.image.alt) || "—")}</p>
</article>`;

const card = (r) => `
<article class="piece" data-rar="${esc(r.a.rarity)}">
  <header>
    <h2>${esc(r.a.name)}</h2>
    <p class="meta"><span class="rar">${esc(r.a.rarity)}</span> · ${esc(r.a.date)} · ${esc(r.a.origin)}</p>
    ${r.hazard ? `<p class="hazard">chosen for: ${esc(r.hazard)}</p>` : ""}
  </header>

  <div class="pair">
    <figure>
      <figcaption>the real object</figcaption>
      ${r.ref ? `<img src="${esc(r.ref)}" alt="reference photograph of ${esc(r.a.name)}">`
              : `<div class="missing">no cached reference</div>`}
    </figure>
    <figure>
      <figcaption>generated</figcaption>
      ${r.art ? `<img class="plate" src="${esc(r.art)}" alt="generated illustration of ${esc(r.a.name)}">`
              : `<div class="missing">not generated</div>`}
    </figure>
  </div>

  <ul class="check">
    <li>Condition kept? <b>chips, cracks, corrosion, missing parts still there and no worse</b></li>
    <li>Inscription and ornament <b>only where the real object has them</b> — nothing invented</li>
    <li>Form and proportions match — nothing straightened, completed or made symmetrical</li>
    <li>No frame, border, glow, text, stand or shadow-on-a-surface in the image</li>
    <li>Reads at tile size (the strip below) as well as on the plate</li>
  </ul>

  ${r.m.prompt ? `<details><summary>recipe — ${esc(r.m.provider || "?")} / ${esc(r.m.model || "?")} · round ${esc(r.m.round || "?")}${r.m.exemplar ? " · exemplar " + esc(path.basename(r.m.exemplar)) : " · no exemplar"}</summary><pre>${esc(r.m.prompt)}</pre></details>` : ""}
</article>`;

const html = `<!doctype html>
<meta charset="utf-8">
<title>Folio — artefact art contact sheet</title>
<style>
  :root{
    --paper:#F6F5F1; --paper-2:#EFEDE6; --card:#FFFFFF;
    --ink:#1B1A17; --ink-soft:#4A4843; --ink-faint:#8B887F; --rule:#E3E0D7;
    --rar-common:#8A867C; --rar-rare:#3A6FB0; --rar-epic:#7B4BA8; --rar-legendary:#C2701E;
  }
  body.night{
    --paper:#161619; --paper-2:#1F1F24; --card:#26262C;
    --ink:#ECEAE3; --ink-soft:#D6D2C8; --ink-faint:#8A877F; --rule:#34343C;
    --rar-common:#ADA99E; --rar-rare:#7FAEE8; --rar-epic:#B98BE0; --rar-legendary:#E9A24E;
  }
  [data-rar=common]{--rar:var(--rar-common)} [data-rar=rare]{--rar:var(--rar-rare)}
  [data-rar=epic]{--rar:var(--rar-epic)} [data-rar=legendary]{--rar:var(--rar-legendary)}

  *{box-sizing:border-box}
  body{margin:0; background:var(--paper); color:var(--ink);
       font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}
  .bar{position:sticky; top:0; z-index:5; display:flex; gap:10px; align-items:center; flex-wrap:wrap;
       padding:12px 20px; background:var(--card); border-bottom:1px solid var(--rule);}
  .bar h1{font-size:15px; margin:0 12px 0 0; font-weight:600;}
  .bar .n{color:var(--ink-faint); font-size:13px;}
  button{font:inherit; font-size:13px; padding:6px 12px; border-radius:8px; cursor:pointer;
         border:1px solid var(--rule); background:var(--paper-2); color:var(--ink);}
  button[aria-pressed=true]{background:var(--ink); color:var(--paper); border-color:var(--ink);}

  .wrap{padding:20px; max-width:1180px; margin:0 auto;}

  /* GRID — art only, nothing else, so drift is the only thing left to see. */
  .grid{display:none; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:14px;}
  body.view-grid .grid{display:grid}
  body.view-grid .compare{display:none}
  .grid figure{margin:0}
  .grid img{width:100%; aspect-ratio:1/1; object-fit:cover; border-radius:10px; display:block;
            border:2px solid color-mix(in srgb,var(--rar,var(--rule)) 70%,transparent);}
  .grid figcaption{font-size:11px; color:var(--ink-faint); margin-top:5px; text-align:center;}

  .piece{background:var(--card); border:1px solid var(--rule); border-radius:14px;
         padding:18px; margin-bottom:18px;}
  .piece h2{margin:0; font-size:19px;}
  .meta{margin:3px 0 0; font-size:13px; color:var(--ink-faint);}
  .rar{color:var(--rar); font-weight:600; text-transform:capitalize;}
  .hazard{margin:6px 0 0; font-size:12.5px; color:var(--ink-soft);
          border-left:3px solid var(--rar); padding-left:9px;}

  .pair{display:grid; grid-template-columns:1fr 1fr; gap:16px; margin:16px 0 0;}
  .pair figure{margin:0}
  .pair figcaption{font-size:11px; text-transform:uppercase; letter-spacing:.06em;
                   color:var(--ink-faint); margin-bottom:6px;}
  /* Both sides are shown at the SAME square size on purpose. A reference photograph shown larger
     than the piece is a comparison nobody can make. */
  .pair img{width:100%; aspect-ratio:1/1; object-fit:contain; background:var(--paper-2);
            border-radius:10px; display:block;}
  /* The mock plate: the real border .ar-winart .card-img puts round the picture on the site. */
  .pair img.plate{object-fit:cover;
                  border:2px solid color-mix(in srgb,var(--rar,var(--rule)) 70%,transparent);}
  .missing{aspect-ratio:1/1; display:grid; place-items:center; border-radius:10px;
           background:var(--paper-2); color:var(--ink-faint); font-size:13px;}

  .check{margin:14px 0 0; padding-left:20px; font-size:13px; color:var(--ink-soft);}
  .check li{margin:3px 0}
  .check b{color:var(--ink); font-weight:600;}

  details{margin-top:12px; font-size:12.5px;}
  summary{cursor:pointer; color:var(--ink-faint);}
  pre{white-space:pre-wrap; background:var(--paper-2); padding:12px; border-radius:8px;
      font-size:11.5px; line-height:1.45; margin:8px 0 0;}

  /* audit mode: one big photograph per card, and the grid shows whole photographs rather than
     square crops — a crop can hide exactly the part that proves the picture is the wrong thing. */
  .pair.one{grid-template-columns:1fr; max-width:520px;}
  .grid.refs img{object-fit:contain; background:var(--paper-2);}
  .credit{margin:10px 0 0; font-size:11.5px; color:var(--ink-faint); word-break:break-word;}
  .alt{margin:3px 0 0; font-size:11.5px; color:var(--ink-faint);}

  @media (max-width:720px){ .pair{grid-template-columns:1fr} }
</style>

<body class="${AUDIT ? "view-grid" : ""}">

<div class="bar">
  <h1>${AUDIT ? "Reference audit" : "Artefact art"}</h1>
  <span class="n">${rows.length} ${AUDIT ? "photograph" : "piece"}${rows.length === 1 ? "" : "s"}</span>
  <button id="v-compare" aria-pressed="${AUDIT ? "false" : "true"}">${AUDIT ? "Detail" : "Compare"}</button>
  <button id="v-grid" aria-pressed="${AUDIT ? "true" : "false"}">Grid</button>
  <button id="t-dark" aria-pressed="false">Dark paper</button>
  <span class="n">${AUDIT
    ? "— One question only: is each photograph the object it is filed under? Flag anything that is not."
    : "— Compare answers “is it still the object?”, Grid answers “is it one set?”"}</span>
</div>

<div class="wrap">
  <div class="grid${AUDIT ? " refs" : ""}">
    ${rows.map((r) => {
      const img = AUDIT ? r.ref : r.art;
      return `<figure data-rar="${esc(r.a.rarity)}">
      ${img ? `<img src="${esc(img)}" alt="${esc(r.a.name)}">` : `<div class="missing">—</div>`}
      <figcaption>${esc(r.a.name)}</figcaption></figure>`;
    }).join("\n    ")}
  </div>
  <div class="compare">
    ${rows.map(AUDIT ? auditCard : card).join("\n")}
  </div>
</div>

<script>
  const b = document.body;
  const set = (grid) => {
    b.classList.toggle('view-grid', grid);
    document.getElementById('v-grid').setAttribute('aria-pressed', String(grid));
    document.getElementById('v-compare').setAttribute('aria-pressed', String(!grid));
  };
  document.getElementById('v-grid').onclick = () => set(true);
  document.getElementById('v-compare').onclick = () => set(false);
  document.getElementById('t-dark').onclick = (e) => {
    const on = !b.classList.contains('night');
    b.classList.toggle('night', on);
    e.currentTarget.setAttribute('aria-pressed', String(on));
  };
</script>
`;

fs.mkdirSync(WORK, { recursive: true });
fs.writeFileSync(OUT, html);
console.log("wrote " + path.relative(ROOT, OUT) + "  (" + rows.length + " piece" + (rows.length === 1 ? "" : "s") + ")");
if (!AUDIT) {
  const missing = rows.filter((r) => !r.art).map((r) => r.id);
  if (missing.length) console.log("not yet generated: " + missing.join(", "));
}
console.log("open it:  " + OUT);
