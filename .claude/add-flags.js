#!/usr/bin/env node
"use strict";
/*
 * add-flags.js — fetch a flag from Wikimedia Commons and write `answerFlag` onto a card that already
 * exists.
 *
 *   node .claude/add-flags.js <batch.json> [--dry]
 *
 * The batch is `{ "cards": { "gw-117": { "file": "Flag of Finland.svg", "alt": "…" }, … } }`.
 * `file` is optional and defaults to `Flag of <the card's answer term>.svg`, which is what Commons
 * names all but a handful of them.
 *
 * WHY IT EXISTS. 115 of World Geography's 233 country cards carry a flag and 118 do not — the earlier
 * pass stopped at `gw-116` — and there was NO batch writer for the field at all: the 115 were written
 * inline by `add-card.js` at card creation, so a card already shipped could only gain one by hand. The
 * Flags deck needs all 233 (see docs/flags-card-plan.md), and the same fetch serves both decks, so this
 * writes the twin and the flag card is then built from it by `add-flag-cards.js`.
 *
 * THE `src` IS COPIED FROM THE API AND NEVER COMPOSED. An upload URL carries a two-character shard that
 * is the head of the file name's MD5 and cannot be guessed; a hand-typed one is a 404 on a card that
 * otherwise looks finished. This asks `imageinfo` for `url` and takes what comes back, and does not
 * rewrite the host it answers with — `thumb.wikimedia.org` and `upload.wikimedia.org` both resolve, and
 * overriding the API on a consistency preference is how a working URL becomes a broken one.
 *
 * IT REFUSES RATHER THAN GUESSES, in four places, and each is a fault that would otherwise ship looking
 * finished:
 *   · A FILE THAT IS NOT THERE. A redirect is FOLLOWED and the file it lands on is REPORTED, because
 *     that is the Afghanistan case: `Flag_of_Afghanistan.svg` resolves to `Flag_of_the_Taliban.svg`,
 *     whose own page describes the Islamic Emirate's flag, and drawing it unlabelled would assert who
 *     legitimately governs. **Read the target's description before accepting a redirect.**
 *   · A LICENCE OUTSIDE THE BAR. PD, CC0, CC BY or CC BY-SA and nothing else, which is the pipeline's
 *     bar everywhere. A national flag is nearly always PD — a government work, or below the threshold
 *     of originality — and the file page states it.
 *   · AN UNCREDITED FILE. `answerFlag` refuses a `src` with no `credit` in app.js and in `add-card.js`,
 *     so one written here would be silently absent on the page.
 *   · A PAGE URL CARRYING `'`, `(` or `)`. `SRC_URL_RX` stops at all three, so such a credit ships
 *     TRUNCATED and the reader gets a dead address. They are percent-encoded (`%27`, `%28`, `%29`),
 *     which resolves on Commons and matches the pattern whole.
 *
 * THE `alt` IS AUTHORED AND IS NEVER FETCHED. Commons' own description names the country in the first
 * three words, which on the flag card is the answer. The batch may supply one; where it does not, the
 * tool writes the twin's shipped house form — "The flag of <country>: " plus a description it asks you
 * to write — and REFUSES rather than inventing one. What it will do unasked is print the file's own
 * description so there is something to write from.
 *
 * Not part of the site. See docs/flags-card-plan.md.
 */

/* THE PROXY, AND WITHOUT IT THIS TOOL LIES. Outbound HTTPS here goes through the agent proxy named by
   HTTPS_PROXY; curl honours it and Node's built-in fetch does not, so every request would go direct and
   the egress policy would answer for Commons. `NODE_USE_ENV_PROXY=1` fixes it and setting it with
   `process.env` does not work — undici reads it once at startup — so the tool re-execs itself once,
   guarded so it can never loop. This is `check-reach.js`'s own finding; see its header. */
if (process.env.NODE_USE_ENV_PROXY !== "1" && (process.env.HTTPS_PROXY || process.env.https_proxy)) {
  const { spawnSync } = require("child_process");
  const r = spawnSync(process.execPath, [__filename, ...process.argv.slice(2)],
    { stdio: "inherit", env: { ...process.env, NODE_USE_ENV_PROXY: "1" } });
  process.exit(r.status === null ? 1 : r.status);
}

const fs = require("fs");
const path = require("path");

const UA = "FolioFlagPass/1.0 (https://github.com/Pokfus/folio; study site content pass)";
const TIMEOUT_MS = 25000;
const OK_LICENCE = /^(pd|cc0|cc-by(-sa)?(-\d(\.\d)?)?)$/i;
const PD_WORDS = /public domain|^pd[- ]|copyright[- ]free|no known copyright/i;
const CC_WORDS = /^cc[ -]?(by|zero|0)/i;

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const file = args.find((a) => !a.startsWith("--"));
if (!file) { console.error("usage: node .claude/add-flags.js <batch.json> [--dry]"); process.exit(1); }
const batch = JSON.parse(fs.readFileSync(file, "utf8"));
const want = batch && batch.cards;
if (!want || typeof want !== "object" || Array.isArray(want)) {
  console.error('ERROR: the batch is { "cards": { "gw-117": { "file": "…", "alt": "…" }, … } }');
  process.exit(1);
}

global.window = {};
const { loadCards, writeCards } = require("./card-io.js");

/* A 429 IS A BUSY HOST AND NOT A SHUT ONE, which is `check-reach.js`'s own finding: probing Commons a
   dozen times in a few seconds rate-limits it, and a sweep that treats that as a refusal reports a
   working host as blocked. Measured here on the first run — two of four files came back 429 at 350ms
   between calls and both resolved on a retry. So a 429 backs off and tries again, three times, and only
   then is it an error. */
async function api(params, tries) {
  const qs = new URLSearchParams({ format: "json", formatversion: "2", ...params });
  for (let n = 0; ; n++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
    let r;
    try {
      r = await fetch("https://commons.wikimedia.org/w/api.php?" + qs, { headers: { "User-Agent": UA }, signal: ctl.signal });
    } finally { clearTimeout(t); }
    if (r.ok) return await r.json();
    if (r.status !== 429 || n >= (tries == null ? 3 : tries)) throw new Error("HTTP " + r.status);
    await new Promise((res) => setTimeout(res, 1500 * (n + 1)));
  }
}

const strip = (h) => String(h || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"')
  .replace(/&#0?39;|&apos;/g, "'").replace(/\s+/g, " ").trim();

/* A Commons page URL with an apostrophe or a bracket in it ships a TRUNCATED credit, `SRC_URL_RX`
   stopping at all three. Percent-encoding carries none of the stopped characters, resolves, and matches
   the pattern whole — the rule CLAUDE.md records for `gw-722`. */
const pageURL = (title) =>
  "https://commons.wikimedia.org/wiki/" + title.replace(/ /g, "_")
    .replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");

async function lookOne(cardId, spec, card) {
  const asked = String((spec && spec.file) || ("Flag of " + card.answerText + ".svg")).replace(/^File:/i, "");
  const j = await api({
    action: "query", titles: "File:" + asked, redirects: "1",
    prop: "imageinfo", iiprop: "url|size|extmetadata", iiextmetadatalanguage: "en",
  });
  const q = (j && j.query) || {};
  const page = (q.pages || [])[0];
  if (!page || page.missing) return { err: "no such file on Commons: File:" + asked };
  const info = (page.imageinfo || [])[0];
  if (!info) return { err: "no imageinfo for File:" + page.title };
  const meta = info.extmetadata || {};
  const val = (k) => strip((meta[k] || {}).value || "");

  /* A REDIRECT IS FOLLOWED AND REPORTED. This is the Afghanistan case: the target may be a file named
     for a faction rather than the country's flag, and only its own description says so. */
  const redirect = (q.redirects || []).find((r) => ("File:" + asked).toLowerCase() === String(r.from || "").toLowerCase());

  const shortName = val("LicenseShortName");
  const licence = val("License");
  const free = OK_LICENCE.test(licence) || PD_WORDS.test(shortName) || CC_WORDS.test(shortName) || PD_WORDS.test(licence);
  const author = val("Artist");
  const credit = [author && !/^unknown/i.test(author) ? author : "", shortName || licence, "via Wikimedia Commons"]
    .filter(Boolean).join(", ") + " (" + pageURL(page.title) + ")";

  return {
    title: page.title, src: info.url, w: info.width, h: info.height,
    licence: shortName || licence || "(none stated)", free: free, author: author,
    desc: val("ImageDescription").slice(0, 160), credit: credit,
    redirect: redirect ? redirect.to : "",
  };
}

(async () => {
  const cards = loadCards().cards;
  const byId = new Map(cards.map((c) => [c.id, c]));
  const ids = Object.keys(want).sort();
  const found = [];
  const bad = [];

  for (const id of ids) {
    const card = byId.get(id);
    if (!card) { bad.push(`${id}: not in data.js`); continue; }
    if (card.answerFlag && card.answerFlag.src && !(want[id] || {}).replace) {
      bad.push(`${id}: already carries a flag — pass "replace": true to overwrite`);
      continue;
    }
    let r;
    try { r = await lookOne(id, want[id], card); }
    catch (e) { bad.push(`${id}: ${e.message}`); continue; }
    if (r.err) { bad.push(`${id}: ${r.err}`); continue; }
    if (!r.free) { bad.push(`${id}: licence outside the bar — "${r.licence}" on ${r.title}`); continue; }
    if (!String(r.credit || "").trim()) { bad.push(`${id}: no credit could be built for ${r.title}`); continue; }
    found.push({ id, card, r, alt: String((want[id] || {}).alt || "").trim() });
    await new Promise((res) => setTimeout(res, 1200));   // Commons' api.php rate-limits a fast sweep
  }

  console.log(`\n${found.length} flag${found.length === 1 ? "" : "s"} resolved, ${bad.length} refused:\n`);
  for (const f of found) {
    console.log(`  ${f.id}  ${f.card.answerText}`);
    console.log(`      ${f.r.title}   ${f.r.w}x${f.r.h}   ${f.r.licence}`);
    if (f.r.redirect) console.log(`      ⚠ REDIRECT: the name asked for resolves to this file — READ ITS PAGE before accepting`);
    if (f.r.desc) console.log(`      Commons says: ${f.r.desc}`);
    console.log(`      credit: ${f.r.credit}`);
    console.log(`      alt:    ${f.alt || "(NONE SUPPLIED — write one; see below)"}`);
  }
  if (bad.length) { console.log("\nrefused:"); bad.forEach((b) => console.log("  " + b)); }

  const noAlt = found.filter((f) => !f.alt);
  if (noAlt.length) {
    console.log(`\n${noAlt.length} of them have no \`alt\`. It is AUTHORED, never fetched: Commons' own`);
    console.log("description names the country in its first three words, which on a flag card is the answer.");
    console.log("Write each as the house form — \"The flag of <country>: <the field, the colours, the charge>\" —");
    console.log("and re-run. Nothing is written until every flag in the batch has one.");
    process.exit(1);
  }
  if (!found.length) process.exit(bad.length ? 1 : 0);
  if (dry) { console.log("\n--dry: nothing written."); process.exit(0); }

  for (const f of found) {
    f.card.answerFlag = { src: f.r.src, credit: f.r.credit, alt: f.alt };
  }
  writeCards(cards, null);
  console.log(`\nwrote answerFlag onto ${found.length} card${found.length === 1 ? "" : "s"}.`);
  console.log("Now run: node .claude/check-flag-twins.js && node .claude/split-cards.js --check");
})().catch((e) => { console.error("FAILED: " + e.message); process.exit(1); });
