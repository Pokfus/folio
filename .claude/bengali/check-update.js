/* check-update.js — A READER WHO HOLDS THE OLD BENGALI DECKS KEEPS THEIR PROGRESS THROUGH THE UPDATE PRESS
   (Nov 2026, the Bengali beginner pass — docs/lang-decks.md).

     NODE_PATH=<scratch>/node_modules node .claude/bengali/check-update.js

   Until 2026-11-19 every Bengali deck was numbered by position, and the pass re-ordered A1, A2 and the
   phrases, moved eight notes from the phrases deck to A1 and rebuilt the alphabet deck with 24 more notes.
   A note is one note with two card templates, so a reader's schedule hangs off `u_<deck>_<n>` and
   `u_<deck>_<n>~2`; the Update press merges by id. This drives the real page: it serves the decks AS SHIPPED
   AT THE SEED COMMIT (read out of git), adds and downloads the Alphabet, A1 and the phrases, writes a
   schedule for both directions of a sample of notes, then serves the working tree, reloads, presses every
   Update and reads the store back. It asserts that every sampled id still names the same word (a letter's
   id the same letter), that both directions' schedules are untouched, and that a note a deck has lost (the
   eight that moved to A1) is still on the device, under its old id, with its progress.
   Not a CI step: it needs a browser and the seed commit's objects. */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..", "..");
const SEED = "2b3cf5c";                         // the commit bengali-ids.json was seeded from
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const DECKS = { bnabc: "Bengali-Alphabet", bengalia1: "Bengali-A1", bnphrase: "Bengali-Phrases-and-Expressions" };
const old = {};
const gitShow = (p) => execFileSync("git", ["show", SEED + ":" + p], { cwd: ROOT, maxBuffer: 1 << 28 });
for (const f of Object.values(DECKS)) old["/decks/" + f + ".folio-deck.json"] = gitShow("decks/" + f + ".folio-deck.json");
old["/lang-decks.js"] = gitShow("lang-decks.js");
let phase = "old";

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  if (phase === "old" && old[p]) { res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] }); res.end(old[p]); return; }
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
});

let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) pass++; else fail++; console.log((ok ? "ok    " : "FAIL  ") + name + (extra ? "  " + extra : "")); };
const text = (h) => String(h || "").replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").trim();
// what a note IS, whatever the deck's vintage: a word, or a letter
const what = (c) => (c && c.fields ? (c.fields.Word && !c.fields.Letter ? c.fields.Word : text(c.fields.Letter)) : null);

const oldDeck = (id) => JSON.parse(old["/decks/" + DECKS[id] + ".folio-deck.json"].toString("utf8"));
const newDeck = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "decks", DECKS[id] + ".folio-deck.json"), "utf8"));
// the sample: spread through each old deck, plus every note the new deck no longer has
const SAMPLE = {};
for (const id of Object.keys(DECKS)) {
  const o = oldDeck(id), nIds = new Set(newDeck(id).cards.map((c) => c.id));
  const n = o.cards.length, pick = new Set([0, 1, 2, Math.floor(n / 5), Math.floor(n / 3), Math.floor(n / 2), Math.floor((2 * n) / 3), n - 2, n - 1]);
  o.cards.forEach((c, i) => { if (!nIds.has(c.id)) pick.add(i); });
  if (id === "bengalia1") [79, 473, 470, 55].forEach((i) => pick.add(i));     // ধন্যবাদ, নমস্কার, সালাম, এক
  SAMPLE[id] = [...pick].sort((a, b) => a - b).map((i) => ({ id: o.cards[i].id, what: what(o.cards[i]), dropped: !nIds.has(o.cards[i].id) }));
}

const readStore = (page, deckIds, cardIds) => page.evaluate((args) => new Promise((res) => {
  const q = indexedDB.open("folio-community");
  q.onsuccess = () => {
    const db = q.result, tx = db.transaction(["decks", "notes"]), out = { decks: {}, notes: {} };
    for (const d of args[0]) { const g = tx.objectStore("decks").get(d); g.onsuccess = () => { const r = g.result; out.decks[d] = r ? { langRev: r.langRev, n: (r.index || []).length, ids: (r.index || []).map((e) => e.id) } : null; }; }
    for (const [d, c] of args[1]) { const g = tx.objectStore("notes").get(d + "/" + c); g.onsuccess = () => { out.notes[c] = g.result ? g.result.c : null; }; }
    tx.oncomplete = () => { db.close(); out.sched = (JSON.parse(localStorage.getItem("folio_v1") || "{}").cards) || {}; res(out); };
  };
  q.onerror = () => res(null);
}), [deckIds, cardIds]);

(async () => {
  const port = 8600 + Math.floor(Math.random() * 300);
  await new Promise((r) => server.listen(port, r));
  const base = "http://127.0.0.1:" + port + "/";
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  const ids = Object.keys(DECKS), all = [].concat(...ids.map((d) => SAMPLE[d].map((s) => [d, s.id])));

  console.log("\n1) the decks as shipped at " + SEED + ": add, download, study\n");
  await page.goto(base + "#decks", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const added = await page.evaluate((deckIds) => {
    const out = [];
    for (const id of deckIds) {
      const el = [...document.querySelectorAll("#langDecks .node-add")].find((e) => (e.dataset.id || "") === "u:" + id || (e.dataset.id || "").startsWith("u:" + id + "/"));
      if (!el) { out.push(id + ": no add control"); continue; }
      const coll = el.closest(".lang-coll"), kids = coll.querySelector(".node-children");
      if (!kids.classList.contains("open")) coll.querySelector(".collection-actions > .chev").click();
      el.click(); out.push(el.dataset.id);
    }
    return out;
  }, ids);
  check("the three decks can be added", added.every((x) => /^u:/.test(x)), added.join(", "));
  await page.waitForTimeout(1200);
  await page.goto(base + "#home", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  for (let i = 0; i < 6; i++) {
    const left = await page.evaluate(() => { const b = document.querySelector("[data-langdl]"); if (b) b.click(); return document.querySelectorAll("[data-langdl]").length; });
    if (!left) break;
    await page.waitForTimeout(5000);
  }
  let st = await readStore(page, ids, all);
  for (const id of ids) check(id + " landed whole", !!st.decks[id] && st.decks[id].n === oldDeck(id).cards.length, st.decks[id] && String(st.decks[id].n));
  check("every sampled note is the one the old file gave that id", all.every(([d, c]) => what(st.notes[c]) === SAMPLE[d].find((s) => s.id === c).what));
  await page.evaluate((cards) => {
    const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    s.cards = s.cards || {};
    cards.forEach(([, id], i) => {
      s.cards[id] = { due: 9999999999999, ivl: 20 + i, ease: 2.5, status: "review", reps: 3 + i, first: "2026-11-10" };
      s.cards[id + "~2"] = { due: 9999999999999, ivl: 120 + i, ease: 2.3, status: "review", reps: 2 + i, first: "2026-11-11" };
    });
    localStorage.setItem("folio_v1", JSON.stringify(s));
  }, all);
  console.log("      " + all.length + " notes given a schedule in both directions (" + ids.map((d) => SAMPLE[d].length + " of " + d).join(", ") + ")");

  console.log("\n2) the working tree: the Update press\n");
  phase = "new";
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(3000);
  const offered = await page.evaluate(() => [...document.querySelectorAll("[data-langup]")].map((b) => b.dataset.langup));
  check("an Update is offered on each of the three", ids.every((d) => offered.includes(d)), offered.join(", "));
  const pops = [];
  for (let i = 0; i < 6; i++) {
    const more = await page.evaluate(() => { const b = document.querySelector("[data-langup]"); if (b) b.click(); return !!b; });
    if (!more) break;
    await page.waitForTimeout(9000);
    const pop = await page.evaluate(() => { const m = document.querySelector(".deck-menu .dm-box"); const t = m ? m.textContent.replace(/\s+/g, " ") : ""; const x = document.querySelector(".deck-menu .dm-close, .deck-menu [data-close]"); if (x) x.click(); else document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); return t; });
    if (pop) pops.push(pop);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(2500);
  }
  for (const p of pops) console.log("      popup: " + p.slice(0, 260));
  st = await readStore(page, ids, all);
  const rows = (() => { const w = {}; new Function("window", fs.readFileSync(path.join(ROOT, "lang-decks.js"), "utf8"))(w); return w.LANG_DECKS; })();
  for (const id of ids) {
    const row = rows.find((r) => r.id === id), dropped = SAMPLE[id].filter((s) => s.dropped).length;
    check(id + " is at the shipped revision", !!st.decks[id] && st.decks[id].langRev === row.rev);
    check("…and holds the shipped notes" + (dropped ? " plus the " + dropped + " it kept" : ""), !!st.decks[id] && st.decks[id].n === row.notes + dropped, st.decks[id] && st.decks[id].n + " vs " + row.notes + " + " + dropped);
  }
  let same = 0, wrong = [], sched = 0, keptDropped = 0;
  all.forEach(([d, c], i) => {
    const s = SAMPLE[d].find((x) => x.id === c), now = what(st.notes[c]);
    if (now === s.what) same++; else wrong.push(c + ": " + s.what + " → " + now);
    const a = st.sched[c], b = st.sched[c + "~2"];
    if (a && b && a.ivl === 20 + i && a.reps === 3 + i && b.ivl === 120 + i && b.reps === 2 + i && a.status === "review" && b.status === "review") sched++;
    if (s.dropped && now === s.what && st.decks[d].ids.includes(c)) keptDropped++;
  });
  const nDropped = all.filter(([d, c]) => SAMPLE[d].find((x) => x.id === c).dropped).length;
  check("every sampled id still names the same word or letter", same === all.length, same + " of " + all.length + (wrong.length ? "  " + wrong.slice(0, 4).join("; ") : ""));
  check("…with both directions' schedules untouched", sched === all.length, sched + " of " + all.length);
  check("a note its deck has lost is still on the device, under its id", keptDropped === nDropped && nDropped > 0, keptDropped + " of " + nDropped);
  check("no page error", !errs.length, errs.slice(0, 2).join(" | "));
  console.log("\n" + pass + " passed, " + fail + " failed");
  await browser.close(); server.close();
  process.exit(fail ? 1 : 0);
})();
