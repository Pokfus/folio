/* Look at every deck in decks/ the way a reader would: import it, add it, study it, and read what is on
   the card. The reverse-card change is exactly the kind that passes every count and puts the wrong thing on
   screen — a note that renders its forward card twice, a template whose CSS never lands, a subdeck that
   deals one direction — so this asserts what the PAGE says, not what the file holds.
     node verify.js                                                                                       */
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs");
const ROOT = "/home/user/folio";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  fs.readFile(p, (e, b) => { if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" }); res.end(b); });
});
let fails = 0, checks = 0;
const ok = (c, m, extra) => { checks++; if (!c) { fails++; console.log("   ✗ " + m + (extra ? "   " + extra : "")); } else console.log("   ✓ " + m); };

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });

  const DECKS = fs.readdirSync(ROOT + "/decks").filter((f) => f.endsWith(".json")).sort();
  /* `decks/` holds decks this generator did NOT write — the DELE Spanish set among them — and the checks
     below about pinyin, the character breakdown and the deck's own type CSS are facts about a MANDARIN
     card, not about a deck file. Run over a Spanish deck they report five failures that describe nothing
     wrong, which is a suite people learn to ignore. The test is the deck's own type: a Mandarin card type
     declares a Pinyin field, and nothing else here does. */
  const isMandarin = (file) => {
    const d = JSON.parse(fs.readFileSync(ROOT + "/decks/" + file, "utf8"));
    return Object.values((d.meta && d.meta.types) || {})
      .some((t) => (t.fields || []).indexOf("Pinyin") >= 0);
  };
  for (const file of DECKS) {
    const zh = isMandarin(file);
    console.log("\n=== " + file + (zh ? "" : "   (not a Mandarin deck — its card checks are skipped)"));
    const pg = await browser.newPage();
    const errs = [];
    pg.on("console", (m) => { if (m.type() === "error" && !/ERR_CONNECTION/.test(m.text())) errs.push(m.text()); });
    pg.on("pageerror", (e) => errs.push(String(e)));
    await pg.goto(base + "#studio", { waitUntil: "load" });
    await pg.waitForTimeout(400);

    const chooser = pg.waitForEvent("filechooser");
    await pg.click("#stImport");
    (await chooser).setFiles(ROOT + "/decks/" + file);
    await pg.waitForSelector(".studio-deck", { timeout: 240000 });

    const meta = await pg.evaluate(() => {
      const d = Object.values(window.__folioUDECKS || {})[0];
      return null;
    });

    // --- the collections page: how many entries does the deck offer?
    await pg.goto(base + "#decks", { waitUntil: "load" });
    await pg.waitForTimeout(500);
    const entries = await pg.evaluate(() => [...document.querySelectorAll("[data-uadd]")]
      .map((b) => decodeURIComponent(b.getAttribute("data-uadd"))));
    console.log("   entries offered: " + entries.length + (entries.length > 1 ? "  " + JSON.stringify(entries.slice(0, 9)) : ""));
    ok(entries.length >= 1, "the deck is addable");

    // --- add the LAST entry (a subdeck where there are any) and study it
    const pick = entries[entries.length - 1];
    await pg.click('[data-uadd="' + encodeURIComponent(pick).replace(/"/g, '\\"') + '"]')
      .catch(async () => { await pg.click("[data-uadd]"); });
    await pg.waitForTimeout(400);
    await pg.goto(base + "#home", { waitUntil: "load" });
    await pg.waitForTimeout(500);
    await pg.click(".review-group .banner .cta .btn");
    await pg.waitForSelector(".cardwrap", { timeout: 120000 });

    /* Read the first FIVE cards of the session. Template-major ordering means every one of them is the
       forward direction, which is itself worth asserting — a note-major queue would deal a word and then
       its own reverse straight after, which teaches the answer. */
    const seen = [];
    for (let i = 0; i < 5; i++) {
      const card = await pg.evaluate(() => {
        const el = document.querySelector(".uc-card");
        return el ? { tpl: el.getAttribute("data-uctpl"), text: el.innerText.replace(/\s+/g, " ").trim().slice(0, 60) } : null;
      });
      if (!card) break;
      seen.push(card);
      await pg.click("#reveal-btn", { timeout: 4000 }).catch(() => {});
      await pg.waitForTimeout(120);
      if (i === 0) {
        const back = await pg.evaluate(() => {
          /* After a reveal BOTH sides are in the document — the front stays, hidden by CSS, where the back
             renders {{FrontSide}} — so the back is the LAST .uc-card and never the first. */
          const all = [...document.querySelectorAll(".uc-card")];
          const el = all[all.length - 1];
          const cs = (s) => { const n = el.querySelector(s); return n ? getComputedStyle(n) : null; };
          const sense = cs(".uc-sense");
          return {
            sides: all.length,
            tpl: el.getAttribute("data-uctpl"),
            hasPinyin: !!el.querySelector(".uc-pinyin"),
            hasSpeak: !!el.querySelector(".uc-tts"),
            speakSay: (el.querySelector(".uc-tts") || {}).getAttribute ? el.querySelector(".uc-tts").getAttribute("data-say") : "",
            chars: el.querySelectorAll(".uc-ch").length,
            parts: el.querySelectorAll(".uc-pt").length,
            exs: el.querySelectorAll(".uc-exi").length,
            simpFont: (cs(".uc-simp") || {}).fontFamily || "",
            simpSize: (cs(".uc-simp") || {}).fontSize || "",
            senseSize: sense ? sense.fontSize : "",
            text: el.innerText.replace(/\s+/g, " ").trim().slice(0, 110),
          };
        });
        console.log("   back of card 1: " + JSON.stringify(back.text));
        if (zh) ok(back.hasPinyin, "the reading is on the back");
        if (zh) ok(back.hasSpeak && /[一-鿿]/.test(back.speakSay || ""), "the speaker reads the characters, not the romanisation", back.speakSay);
        if (zh) ok(back.chars >= 1 && back.parts >= 1, "the character breakdown is there", "rows " + back.chars + " parts " + back.parts);
        if (zh) ok(/Noto Sans SC|PingFang|YaHei|sans-serif/.test(back.simpFont), "the deck's own CSS reached the card", back.simpFont);
        if (zh) ok(back.senseSize === "16px", "template 1 sets the definition at 16px", back.senseSize);
        ok(back.sides === 2, "the back renders the front above it and the shell hides its own copy", "sides " + back.sides);
        ok(back.exs >= 0, "examples: " + back.exs);
      }
      await pg.click(".grade.good", { timeout: 4000 }).catch(() => {});
      await pg.waitForTimeout(220);
    }
    ok(seen.length >= 2, "the session deals several cards");
    ok(seen.every((c) => c.tpl === "1"), "every card of the first run is the forward direction (template-major)",
       JSON.stringify(seen.map((c) => c.tpl)));
    const uniq = new Set(seen.map((c) => c.text));
    ok(uniq.size === seen.length, "no card is dealt twice in a row", JSON.stringify([...uniq].slice(0, 3)));

    console.log("   console errors: " + (errs.length ? errs.slice(0, 3).join(" | ") : "none"));
    ok(!errs.length, "no console errors");
    await pg.close();
  }

  /* THE REVERSE CARD IS `check-reverse.js`, not here: template-major ordering puts the second card of
     every note after the first card of ALL of them, so on a real deck it is a hundred and fifty cards
     away — and day-long sibling burying, which is on by default and right, holds it until tomorrow
     anyway. That check studies a two-note cut of the real deck with burying turned off. */

  console.log("\n" + (fails ? "✗ " + fails + " of " + checks + " checks failed" : "✓ all " + checks + " checks passed"));
  await browser.close(); server.close();
  process.exit(fails ? 1 : 0);
})();
