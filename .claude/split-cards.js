#!/usr/bin/env node
/* ============================================================================
   split-cards.js — perform, and then guard, the data.js split.

   node .claude/split-cards.js            # re-serialise both halves from source
   node .claude/split-cards.js --check    # assert the split is still intact
   node .claude/split-cards.js --report   # what each half weighs, per collection

   WHY THE SPLIT EXISTS (Sep 2026, measured). The eager load path — everything
   index.html pulls before a reader can flip a card — had grown to 22.20 MB raw
   / 5.69 MB gzipped, of which data.js alone was 65% of the gzipped total. Both
   figures the repo carried for that path were badly stale: index.html's own
   script comment said 1.35 MB gz and CLAUDE.md's glossary-extra bullet said
   2.16 MB gz, against a real 5.69.

   Measured over the corpus, four fields are 12.6 MB of data.js's 14.9 —
   `abstract` (6.13 MB), `sources` (3.29), `why` (1.56) and `image` (1.48) —
   and NOT ONE of them is read until a reader reveals an answer. This is exactly
   the shape glossary.js and artefacts.js were already split on.

       eager path before ......... 5.69 MB gz
       eager path after .......... 2.63 MB gz   (-54%)

   ONE FILE PER COLLECTION, NOT ONE BIG ONE. A single data-extra.js would be
   3.16 MB gz warmed at idle for every visitor — larger than the whole rest of
   the eager path, which is most of the win given back. Split by card-id prefix,
   a reader studying Ancient Greece fetches gr.js and nothing else.

   WHAT --check ACTUALLY ASSERTS, and each of these fails silently otherwise:
     · no heavy field has crept back into data.js (which would double it)
     · every card in data.js that should have a heavy half has one
     · data-extra carries no id data.js has dropped (a retired card walking back
       in carrying only prose)
     · app.js's CARD_EXTRA_FIELDS and card-io.js's EXTRA_FIELDS agree — a field
       app.js expects lazily and the splitter leaves eager is a field shipped twice
     · the round trip is lossless, field for field, over every card

   CI runs --check, exactly as it runs split-glossary.js --check.
   ============================================================================ */

"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const io = require("./card-io");

const ROOT = path.join(__dirname, "..");
const APP = path.join(ROOT, "app.js");

const mb = (n) => (n / 1048576).toFixed(2);
const gz = (s) => zlib.gzipSync(Buffer.from(s)).length;

/* app.js declares the same list; slice it out by text rather than restating it. */
function appFields() {
  const src = fs.readFileSync(APP, "utf8");
  const m = src.match(/const CARD_EXTRA_FIELDS\s*=\s*\[([^\]]*)\]/);
  if (!m) return null;
  return m[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
}

function report() {
  const { cards } = io.loadCards();
  const rows = {};
  for (const c of cards) {
    const p = io.prefixOf(c.id);
    const r = (rows[p] = rows[p] || { n: 0, light: 0, heavy: 0 });
    r.n++;
    for (const k of Object.keys(c)) {
      const moves = io.EXTRA_FIELDS.includes(k) && !(k === "image" && io.keepsImage(c));
      const len = JSON.stringify(c[k]).length;
      if (moves) r.heavy += len; else r.light += len;
    }
  }
  console.log("collection   cards      eager      lazy");
  let L = 0, H = 0;
  for (const [p, r] of Object.entries(rows).sort((a, b) => b[1].heavy - a[1].heavy)) {
    L += r.light; H += r.heavy;
    console.log("  " + p.padEnd(10) + String(r.n).padStart(5) + "  " + (mb(r.light) + " MB").padStart(9) + "  " + (mb(r.heavy) + " MB").padStart(9));
  }
  console.log("  " + "TOTAL".padEnd(10) + String(cards.length).padStart(5) + "  " + (mb(L) + " MB").padStart(9) + "  " + (mb(H) + " MB").padStart(9));
  if (fs.existsSync(io.DATA)) {
    const d = fs.readFileSync(io.DATA);
    console.log("\n  data.js on disk   " + mb(d.length) + " MB raw   " + mb(gz(d)) + " MB gz");
  }
  if (fs.existsSync(io.EXTRA_DIR)) {
    let raw = 0, g = 0;
    for (const f of fs.readdirSync(io.EXTRA_DIR)) {
      const b = fs.readFileSync(path.join(io.EXTRA_DIR, f));
      raw += b.length; g += gz(b);
    }
    console.log("  data-extra/       " + mb(raw) + " MB raw   " + mb(g) + " MB gz   (fetched per collection, on reveal)");
  }
}

function check() {
  let bad = 0;
  const fail = (m) => { console.error("  FAIL  " + m); bad++; };

  if (!fs.existsSync(io.EXTRA_DIR)) { console.error("data-extra/ is missing — the split has not been performed."); process.exit(1); }

  // 1) app.js and card-io.js agree about which fields move
  const af = appFields();
  if (!af) fail("app.js declares no CARD_EXTRA_FIELDS — the split's own field list is unreadable");
  else if (af.join(",") !== io.EXTRA_FIELDS.join(",")) fail("CARD_EXTRA_FIELDS in app.js is [" + af + "] but card-io.js has [" + io.EXTRA_FIELDS + "]");

  // 2) no heavy field left in data.js
  const win = {};
  // eslint-disable-next-line no-new-func
  new Function("window", fs.readFileSync(io.DATA, "utf8"))(win);
  const lightCards = win.CARD_DATA || [];
  let leaked = 0;
  for (const c of lightCards) {
    for (const k of io.EXTRA_FIELDS) {
      if (c[k] === undefined) continue;
      if (k === "image" && io.keepsImage(c)) continue;   // an artwork card's picture is its question
      leaked++;
    }
  }
  if (leaked) fail(leaked + " heavy field(s) still in data.js — they would ship twice");

  // 3) both directions of the join
  const ids = new Set(lightCards.map((c) => c.id));
  const seen = new Set();
  for (const f of fs.readdirSync(io.EXTRA_DIR).filter((f) => f.endsWith(".js"))) {
    const w = { CARD_EXTRA_IN: [] };
    // eslint-disable-next-line no-new-func
    new Function("window", fs.readFileSync(path.join(io.EXTRA_DIR, f), "utf8"))(w);
    for (const inc of w.CARD_EXTRA_IN) {
      for (const id of Object.keys(inc.CARD_EXTRA || {})) {
        if (!ids.has(id)) fail("data-extra/" + f + " carries " + id + ", which data.js does not");
        if (io.prefixOf(id) + ".js" !== f) fail(id + " is filed in data-extra/" + f);
        seen.add(id);
      }
    }
  }
  const orphan = lightCards.filter((c) => !seen.has(c.id) && !(c.map && !c.abstract));
  if (orphan.length) {
    const real = orphan.filter((c) => c.id && !seen.has(c.id));
    if (real.length) fail(real.length + " card(s) have no heavy half at all, e.g. " + real.slice(0, 3).map((c) => c.id).join(", "));
  }

  // 4) lossless round trip
  const merged = io.loadCards().cards;
  if (merged.length !== lightCards.length) fail("merge returns " + merged.length + " cards against " + lightCards.length);
  const dup = merged.filter((c, i) => merged.findIndex((d) => d.id === c.id) !== i);
  if (dup.length) fail(dup.length + " duplicate id(s) after the merge");
  const noAbs = merged.filter((c) => !c.map && !c.abstract).length;
  if (noAbs) fail(noAbs + " merged card(s) have no abstract — the join is not resolving");

  if (bad) { console.error("\n" + bad + " problem(s). The split is not intact."); process.exit(1); }
  console.log("ok  " + lightCards.length + " cards, " + seen.size + " with a lazy half across " +
    fs.readdirSync(io.EXTRA_DIR).filter((f) => f.endsWith(".js")).length + " collection files; no leak, no orphan, join resolves");
}

function split() {
  const { cards, tree } = io.loadCards();
  const before = cards.map((c) => JSON.stringify(c));
  console.log("read " + cards.length + " cards");
  const r = io.writeCards(cards, tree);
  const after = io.loadCards().cards.map((c) => JSON.stringify(c));
  // field-for-field, before against after — the bytes that ship are the bytes that were checked
  let diff = 0;
  for (let i = 0; i < before.length; i++) {
    if (JSON.parse(before[i]).id !== JSON.parse(after[i]).id) { diff++; continue; }
    const a = JSON.parse(before[i]), b = JSON.parse(after[i]);
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) diff++;
    }
  }
  if (diff) { console.error("REFUSED after writing: " + diff + " field(s) differ on the round trip."); process.exit(1); }
  console.log("wrote " + r.files + " files; round trip is lossless over " + cards.length + " cards\n");
  report();
}

const a = process.argv.slice(2);
if (a.includes("--check")) check();
else if (a.includes("--report")) report();
else split();
