#!/usr/bin/env node
/* ============================================================================
   check-links.js — DO THE CITATIONS STILL OPEN?

     node .claude/check-links.js [--only=cards|glossary|artefacts|atlas]
                                 [--limit=N] [--all] [--refresh] [--json]

   WHY THIS EXISTS. Every citation in Folio is required to end in a URL a reader
   can open — that requirement is what the whole apparatus rests on, and
   `add-card.js`, `add-glossary.js` and `add-artefacts.js` all refuse a citation
   without one. What none of them can do is check that the URL still answers,
   and NOTHING EVER RE-CHECKED THEM. CLAUDE.md already records two hosts that
   went dark mid-pass — `hal.science` put its record pages behind a wall, and
   the ICS Quaternary subcommission MOVED DOMAIN with nothing on the old host
   saying so — which means a citation that resolved on the day it was written is
   not a citation that resolves today. A dead citation is exactly the failure the
   apparatus exists to prevent, and it is silent: the marker still renders, the
   entry still lists, the chip still says Open access.

   IT REPORTS CHANGES, NOT STATUSES. Several thousand URLs return several
   thousand lines, which is a report nobody reads twice. The answers are cached
   in `.claude/.linkcheck.json` (gitignored) and a run prints only what MOVED
   since the last one — plus, on a first run, everything that is already broken.
   `--refresh` throws the cache away.

   ============================================================================
   A 200 IS NOT AN ANSWER. Seven hosts serve an error document with a 200 status
   and this is the single most important thing the script knows, because a
   status check that does not know it reports a wall as a working link:

     · `senate.gov` serves its 404 page with a 200 — a CONSTANT 37,523 bytes,
       which is what tells it from a real page instantly;
     · `cia.gov` serves one identical 498,366-byte JavaScript shell for every
       path (the World Factbook is unreadable this way — the word "France"
       appears zero times in the page served for France);
     · `state.gov` and `2009-2017.state.gov` serve a page titled "Technical
       Difficulties" with a 200;
     · `un.org/securitycouncil/*` returns a CloudFront "Request blocked" page
       with a 200, and `un.org/press/*` a JavaScript "Client Challenge", also
       with a 200;
     · `jstor.org` serves a ~3 KB "Client Challenge";
     · `muse.jhu.edu` serves "Verification required!";
     · `link.springer.com` serves a ~3 KB "Client Challenge" under a 200;
     · `history.house.gov` serves an error document with a 200 for the readable
       SLUG form of a Historical Highlight — only the numeric
       `/HistoricalHighlight/Detail/<id>` path is real.

   Each is declared with the shape that identifies it, so it is reported as
   DEAD rather than as fine.

   ============================================================================
   AND A 403 IS A FACT ABOUT THIS SANDBOX, NOT ABOUT THE CITATION. Most of the
   scholarly web refuses a datacentre IP outright, and a run from here would
   otherwise condemn hundreds of perfectly good citations. So 401/403/429 and a
   refused connection are reported as UNREACHABLE and never as broken, in their
   own section and with their own count — the two are different claims and
   collapsing them is how a checker starts lying. Only 404/410, a redirect to a
   host that is not a plain http→https or www variant, and a declared 200-status
   wall are called broken.

   Report-only: it exits 0 whatever it finds, like `card-focus.js` and
   `book-audit.js`. It is a monthly job run by hand, not a gate — with no
   network it says so in a sentence and exits 0 rather than failing a build for
   a fact it could not check.
   ============================================================================ */

"use strict";

const fs = require("fs");
const path = require("path");
const { loadCards } = require("./card-io.js");

const ROOT = path.join(__dirname, "..");
const CACHE = path.join(__dirname, ".linkcheck.json");

const arg = (n, d) => {
  const hit = process.argv.find((a) => a.startsWith("--" + n + "="));
  return hit ? hit.slice(n.length + 3) : d;
};
const has = (n) => process.argv.includes("--" + n);

/* The URL pattern is app.js's own SRC_URL_RX, sliced out rather than copied: a citation's address is
   whatever THAT regex matches, so a checker with a looser one would test a string no reader can click
   and a tighter one would silently skip citations. */
function srcUrlRx() {
  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const m = src.match(/const SRC_URL_RX = (\/[^\n]*\/[a-z]*)\s*;/);
  if (!m) throw new Error("check-links: SRC_URL_RX not found in app.js — has it been renamed?");
  // eslint-disable-next-line no-eval
  const rx = eval(m[1]);
  return new RegExp(rx.source, rx.flags.includes("g") ? rx.flags : rx.flags + "g");
}

/* ---- the declared 200-status walls ---------------------------------------
   Each row is `{ host, why, test }`. `test` sees the status, the final URL and the body (a first
   chunk of it) and returns true when the page is the wall rather than the document. A row matches
   on the HOST as well as the shape, so a genuine page that happens to be 37 KB is never condemned. */
const WALLS = [
  { host: /(^|\.)senate\.gov$/, why: "senate.gov serves its 404 page with a 200 (a constant 37,523 bytes)",
    test: (r) => Math.abs(r.bytes - 37523) < 400 },
  { host: /(^|\.)cia\.gov$/, why: "cia.gov serves one JavaScript shell for every path, with no country content",
    test: () => true },
  { host: /(^|\.)state\.gov$/, why: 'state.gov serves a "Technical Difficulties" page with a 200',
    test: (r) => /technical difficulties/i.test(r.head) },
  { host: /(^|\.)un\.org$/, why: "un.org blocks /securitycouncil/ and /press/ with a 200",
    test: (r) => /request blocked|client challenge/i.test(r.head) },
  { host: /(^|\.)jstor\.org$/, why: 'jstor.org serves a "Client Challenge" with a 200',
    test: (r) => r.bytes < 8000 || /client challenge/i.test(r.head) },
  { host: /(^|\.)muse\.jhu\.edu$/, why: 'muse.jhu.edu serves "Verification required!" with a 200',
    test: (r) => /verification required/i.test(r.head) },
  { host: /(^|\.)springer\.com$/, why: 'link.springer.com serves a "Client Challenge" with a 200',
    test: (r) => r.bytes < 8000 || /client challenge/i.test(r.head) },
  { host: /(^|\.)house\.gov$/, why: "history.house.gov serves an error document with a 200 for the readable slug form",
    test: (r) => /HistoricalHighlight\/[A-Za-z-]{4,}$/.test(r.url) },
];

function wallFor(u, r) {
  let host = "";
  try { host = new URL(r.url || u).hostname; } catch (e) { return null; }
  for (const w of WALLS) if (w.host.test(host) && w.test(r)) return w.why;
  return null;
}

/* ---- gathering ----------------------------------------------------------- */

function readGlobals(file, names) {
  const win = {};
  // eslint-disable-next-line no-new-func
  new Function("window", fs.readFileSync(path.join(ROOT, file), "utf8"))(win);
  const out = {};
  names.forEach((n) => { out[n] = win[n]; });
  return out;
}

function gather(only) {
  const rx = srcUrlRx();
  const seen = new Map();   // url -> [where, …]
  const add = (where, text) => {
    if (!text) return;
    const s = String(text);
    rx.lastIndex = 0;
    let m;
    while ((m = rx.exec(s))) {
      const u = m[0].replace(/[.,;)]+$/, "");
      if (!/^https?:\/\//i.test(u)) continue;
      if (!seen.has(u)) seen.set(u, []);
      const list = seen.get(u);
      if (list.length < 4 && list.indexOf(where) < 0) list.push(where);
    }
  };

  if (!only || only === "cards") {
    const { cards } = loadCards();
    cards.forEach((c) => (c.sources || []).forEach((s) => add(c.id, s)));
  }
  if (!only || only === "glossary") {
    try {
      const { loadGlossary } = require("./gloss-io.js");
      const g = loadGlossary();
      const T = g.GLOSSARY_SOURCES || g.sources || {};
      Object.keys(T).forEach((k) => (T[k] || []).forEach((s) => add("gloss:" + k, s)));
    } catch (e) { /* the glossary helper's own shape is its business — skip rather than guess */ }
  }
  if (!only || only === "artefacts") {
    try {
      const { loadArtefacts } = require("./artefact-io.js");
      (loadArtefacts() || []).forEach((a) => (a.sources || []).forEach((s) => add("art:" + a.id, s)));
    } catch (e) { /* ditto */ }
  }
  if (!only || only === "atlas") {
    try {
      const { COUNTRY_SOURCES } = readGlobals("country-sources.js", ["COUNTRY_SOURCES"]);
      const T = COUNTRY_SOURCES || {};
      Object.keys(T).forEach((k) => {
        const v = T[k];
        const lists = Array.isArray(v) ? [v] : Object.keys(v || {}).map((y) => v[y]);
        lists.forEach((l) => (l || []).forEach((s) => add("atlas:" + k, s)));
      });
    } catch (e) { /* the file may not exist in a trimmed checkout */ }
  }
  return seen;
}

/* ---- checking ------------------------------------------------------------ */

async function probe(u) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20000);
  try {
    // HEAD first — a citation check has no business downloading a 60 MB PDF. Several archives answer
    // 405 or 403 to a HEAD and 200 to a GET, so a refusal falls through rather than being believed.
    let r = await fetch(u, { method: "HEAD", redirect: "follow", signal: ctl.signal });
    if (r.status === 405 || r.status === 501 || (r.status >= 400 && r.status !== 404 && r.status !== 410)) {
      r = await fetch(u, { method: "GET", redirect: "follow", signal: ctl.signal });
    }
    let head = "", bytes = Number(r.headers.get("content-length") || 0);
    if (r.body && r.status === 200) {
      const buf = await r.arrayBuffer().catch(() => null);
      if (buf) { bytes = buf.byteLength || bytes; head = Buffer.from(buf).toString("utf8", 0, 4000); }
    }
    return { status: r.status, url: r.url || u, head: head, bytes: bytes };
  } catch (e) {
    return { status: 0, url: u, head: "", bytes: 0, err: String(e && e.message || e).slice(0, 60) };
  } finally { clearTimeout(t); }
}

const sameSite = (a, b) => {
  try {
    const A = new URL(a).hostname.replace(/^www\./, ""), B = new URL(b).hostname.replace(/^www\./, "");
    return A === B;
  } catch (e) { return false; }
};

function verdict(u, r) {
  if (r.status === 0) return { kind: "unreachable", note: r.err || "no answer" };
  if (r.status === 401 || r.status === 403 || r.status === 429) return { kind: "unreachable", note: "HTTP " + r.status };
  if (r.status === 404 || r.status === 410) return { kind: "dead", note: "HTTP " + r.status };
  if (r.status >= 500) return { kind: "unreachable", note: "HTTP " + r.status };
  const w = wallFor(u, r);
  if (w) return { kind: "dead", note: w };
  // a redirect off the site is a citation pointing at something else now; within it, it is housekeeping
  if (r.url && r.url !== u && !sameSite(u, r.url)) return { kind: "moved", note: "→ " + r.url.slice(0, 90) };
  return { kind: "ok", note: "HTTP " + r.status };
}

async function main() {
  const only = arg("only", "");
  const limit = parseInt(arg("limit", "0"), 10) || 0;
  const urls = gather(only);
  const list = [...urls.keys()].sort();
  const work = limit ? list.slice(0, limit) : list;

  let cache = {};
  if (!has("refresh")) { try { cache = JSON.parse(fs.readFileSync(CACHE, "utf8")); } catch (e) { cache = {}; } }
  const first = !Object.keys(cache).length;

  // one cheap probe first: with no network at all this is a report about nothing, and saying so is
  // better than printing several thousand "unreachable" lines that mean only that the wire is down
  const canary = await probe("https://example.com/");
  if (canary.status === 0) {
    console.log("check-links: no network from here — nothing was checked, and nothing is claimed.");
    process.exit(0);
  }

  const out = { dead: [], moved: [], unreachable: [], recovered: [], ok: 0 };
  let done = 0;
  const CONC = 6;
  const queue = work.slice();
  async function worker() {
    for (;;) {
      const u = queue.shift();
      if (!u) return;
      const r = await probe(u);
      const v = verdict(u, r);
      const was = cache[u] && cache[u].kind;
      cache[u] = { kind: v.kind, note: v.note, at: Date.now() };
      done++;
      if (v.kind === "ok") { out.ok++; if (was && was !== "ok") out.recovered.push({ u: u, where: urls.get(u) }); }
      else if (was === v.kind && !first) { /* already known and unchanged — the whole point of the cache */ }
      else out[v.kind].push({ u: u, where: urls.get(u), note: v.note, was: was || "" });
      if (done % 50 === 0) process.stderr.write("  …" + done + " of " + work.length + "\r");
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  try { fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1)); } catch (e) {}

  if (has("json")) { console.log(JSON.stringify(out, null, 1)); process.exit(0); }

  const section = (title, rows, why) => {
    console.log("\n" + title + "  (" + rows.length + ")");
    if (why) console.log("  " + why);
    if (!rows.length) return console.log("  (nothing new)");
    rows.slice(0, 200).forEach((r) => {
      console.log("  " + r.u);
      console.log("      " + r.note + (r.was ? "   [was " + r.was + "]" : "") + "   " + (r.where || []).join(", "));
    });
    if (rows.length > 200) console.log("  …and " + (rows.length - 200) + " more");
  };

  console.log("\nCitation links — " + work.length + " addresses across " +
    (only || "cards, glossary, artefacts and the atlas"));
  section("BROKEN", out.dead, "a 404, a 410, or one of the declared pages that serve an error with a 200 status");
  section("MOVED OFF SITE", out.moved, "the address now redirects to another host — check it is still the same work");
  section("UNREACHABLE FROM HERE", out.unreachable, "403, 429, 5xx or no answer: a fact about this machine, NOT about the citation");
  if (out.recovered.length) section("ANSWERING AGAIN", out.recovered, "these were failing on the last run");
  console.log("\n" + out.ok + " answered normally." +
    (first ? "  (first run: everything already broken is listed)" : "  (only changes since the last run are listed)"));
  process.exit(0);
}

main();
