#!/usr/bin/env node
// Regression test for FLAG CARDS — the Flags collection's own card format, where the flag IS the
// question (Sep 2026, on request).
//
//   node .claude/test-flag-cards.js
//
// Re-run after touching cardFlagSpec / cardFlagHTML / cardFrontHTML's flag branch / gameCardIdSet /
// serializeCardData / revertCard / whyExempt / IMG_OPEN_SEL / the delegated media `error` listener /
// the .flag-shot styles / add-card.js's flagCard guards / check-questions.js's exemptions /
// add-flag-cards.js / check-flag-twins.js, or after a batch of flag cards.
//
// WHY THIS FILE EXISTS. Every fault this format can have RENDERS PERFECTLY:
//  · A LEAK, and here it is worse than on an artwork card. A national flag's Commons credit reads
//    "Government of India, public domain, via Wikimedia Commons" — the country's NAME is in the credit
//    of nearly every one of the 233 — so a `title`, a `credit` or a `data-img-*` attribute reaching the
//    FRONT answers the question outright, on a card that looks exactly like a working one. Asserted
//    first, from both ends: the builder as a string, and the rendered card.
//  · THE ALT. It has to describe the flag without naming whose it is, which is what makes this format
//    reachable by a reader who cannot see it at all — and 115 of the descriptions were written for the
//    ANSWER side, where they open "The flag of <country>: " because the answer is already on screen.
//    An untrimmed one is the leak in the one place nobody looks.
//  · CROPPING. Flags run 1:1 to 11:28 and Nepal's is not a rectangle, so a frame that fills rather than
//    contains cuts the canton off the flags that most need it — and a cropped flag is still a picture of
//    a flag, so nothing looks broken.
//  · THE TWINNING. `fl-NNN` copies `gw-NNN`'s whole answer side, and a correction made to one and not
//    the other leaves BOTH cards rendering perfectly while saying different things about one country.
//    `check-flag-twins.js` is the standing report; this asserts the rule itself holds today.
//  · THE POOL. A flag card in a text-only game is a question whose answer term has a picture the game
//    cannot show, and a card missing from a pool is a game that simply never deals it.
//  · A DEAD FILE. On this format it is the whole question gone, and a browser's own fallback paints the
//    alt text at full size in the frame — which is the question in words, and reads as a broken page.
//
// Playwright is a dev dependency and must NOT be installed into the repo. Install it in a scratch
// folder and run with NODE_PATH=<that>/node_modules; set FOLIO_CHROMIUM if Chromium lives elsewhere.
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const http = require("http"), fs = require("fs"), path = require("path");

const ROOT = path.join(__dirname, "..");
const PORT = 8153;
const MIME = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  cond ? pass++ : fail++;
  console.log((cond ? "ok   " : "FAIL ") + " " + name + (extra !== undefined ? "  " + JSON.stringify(extra).slice(0, 160) : ""));
};
const sect = (s) => console.log("\n== " + s);

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]).replace(/^\//, "") || "index.html");
  fs.readFile(p, (e, buf) => {
    if (e) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
    res.end(buf);
  });
});

(async () => {
  server.listen(PORT);

  /* ---------- 1. the cards on disk, and the code that reads them ---------------------------- */
  sect("1. the cards on disk, and the code that reads them");
  global.window = {};
  const { loadCards } = require("./card-io.js");
  const CARDS = loadCards().cards;
  const byId = new Map(CARDS.map((c) => [c.id, c]));
  const flags = CARDS.filter((c) => c.flagCard === true).sort((a, b) => a.id.localeCompare(b.id));
  ok("cards carry `flagCard: true`", flags.length > 0, flags.length + " of " + CARDS.length);
  ok("…and every one of them is an fl- card", flags.every((c) => /^fl-\d{3}$/.test(c.id)),
     flags.filter((c) => !/^fl-\d{3}$/.test(c.id)).map((c) => c.id));

  /* THE PROMPT IS ONE SENTENCE SHARED BY THE WHOLE DECK, and it is read off the cards rather than
     restated here: what matters is that all 233 ask the same thing, since two wordings for one question
     is the reader being asked two questions. */
  const prompts = [...new Set(flags.map((c) => String(c.question || "")))];
  ok("…all asking one question, word for word", prompts.length === 1, prompts);

  flags.forEach((c) => {
    const fl = c.answerFlag || {};
    const ansT = String(c.answerText || "~~~");
    const has = (s) => String(s || "").toLowerCase().indexOf(ansT.toLowerCase()) >= 0;
    ok(c.id + ": the flag is there and is a link", !!fl.src && /^https?:/.test(String(fl.src)));
    ok(c.id + ": …and is credited", String(fl.credit || "").trim().length > 0);
    /* The alt DESCRIBES and does not NAME. Both halves are failures and only the second is a leak: a
       generic alt answers nothing, and the answer term answers everything. */
    ok(c.id + ": …and describes the flag", String(fl.alt || "").trim().length > 20, String(fl.alt || "").slice(0, 70));
    ok(c.id + ": …without naming the answer", !has(fl.alt), String(fl.alt || "").slice(0, 80));
    ok(c.id + ": …and not as an ANSWER-side caption", !/^the flag of /i.test(String(fl.alt || "")), String(fl.alt || "").slice(0, 40));
    ok(c.id + ": …and the credit is not on the card twice over", !c.image || !c.image.src);
    ok(c.id + ": the prompt blanks the answer", /class="blank"/.test(String(c.question || "")));
    ok(c.id + ": …and offers no extra phrasings", !Array.isArray(c.questions) || c.questions.length === 0);
    ok(c.id + ": …and is one format, not two", !c.map && c.artwork !== true);
    /* the answer side, which is the twin's */
    const t = byId.get("gw-" + c.id.slice(3));
    ok(c.id + ": its World Geography twin exists", !!t, "gw-" + c.id.slice(3));
    if (t) {
      ok(c.id + ": …and the background is the twin's, word for word", String(c.abstract || "") === String(t.abstract || ""));
      ok(c.id + ": …and so are the citations", JSON.stringify(c.sources || []) === JSON.stringify(t.sources || []));
      ok(c.id + ": …and the figures grid", JSON.stringify(c.facts || []) === JSON.stringify(t.facts || []));
      ok(c.id + ": …and the date line", String(c.answerDate || "") === String(t.answerDate || ""));
      ok(c.id + ": …and the same flag file", String(fl.src) === String((t.answerFlag || {}).src || ""));
      /* the difficulty rates how well known the ANSWER TERM is, and the term is the same country, so the
         number is the same number — it does NOT rate how hard the flag is to recognise */
      ok(c.id + ": …and the same difficulty rating", c.difficulty === t.difficulty, [c.difficulty, t.difficulty]);
      ok(c.id + ": …with the twin's leading kind tag", (c.tags || [])[0] === (t.tags || [])[0], [(c.tags || [])[0], (t.tags || [])[0]]);
    }
    ok(c.id + ": …and a `flag` tag to group on", (c.tags || []).includes("flag"), c.tags);
  });

  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const slice = (name) => { const i = src.indexOf("function " + name + "("); return i < 0 ? "" : src.slice(i, i + 2600); };
  ok("cardFlagSpec is a separate name from the reader's own cardFlag",
     /function cardFlagSpec\(c\)/.test(src) && (src.match(/^\s*function cardFlag\(/gm) || []).length === 1);
  ok("cardFrontHTML draws the flag ABOVE the prompt",
     /const flg = cardFlagSpec\(c\);[\s\S]{0,80}return flg \? cardFlagHTML\(flg\) \+ q : q;/.test(slice("cardFrontHTML")));
  /* THE FRONT IS BARE, AS A STRING. The browser half below reads the rendered card and this reads the
     builder, so a leak added at either end is caught by the other. */
  const built = slice("cardFlagHTML");
  ok("…and the front markup carries no credit", !/credit/.test(built), built.slice(0, 200));
  ok("…and no data-img-* attribute to open the viewer with", !/data-img-/.test(built));
  ok("…and does not fall back to the credit for its alt", !/f\.credit/.test(built));
  ok("gameCardIdSet keeps flag cards out of the text-only games",
     /difficultyOK\(c\) && !cardMapSpec\(c\) && !cardArtSpec\(c\) && !cardFlagSpec\(c\)/.test(src));
  ok("…and the front's flag is deliberately NOT what the viewer opens", !/flag-shot/.test((src.match(/const IMG_OPEN_SEL = [^\n]+/) || [""])[0]));
  ok("…while the answer box's small flag still is", /\.av-flag/.test((src.match(/const IMG_OPEN_SEL = [^\n]+/) || [""])[0]));
  ok("a dead flag file says so rather than painting the alt in the frame",
     /closest\("\.card-img, \.art-shot, \.flag-shot"\)/.test(src));
  ok("serializeCardData carries `flagCard` through", /o\.flagCard = true/.test(slice("serializeCardData")));
  ok("revertCard restores it", /\.flagCard = p\.flagCard/.test(src));
  const links = fs.readFileSync(path.join(__dirname, "card-links.js"), "utf8");
  ok("whyExempt covers a flag card", /card\.flagCard === true/.test(links));
  const cq = fs.readFileSync(path.join(__dirname, "check-questions.js"), "utf8");
  ok("check-questions gives it the map card's short range", /const short = isMap \|\| isFlag;/.test(cq));
  const cc = fs.readFileSync(path.join(__dirname, "check-cards.js"), "utf8");
  ok("check-cards knows its picture is its flag", /c\.flagCard === true && c\.answerFlag && c\.answerFlag\.src/.test(cc));

  /* ---------- 2. the front says nothing but the flag --------------------------------------- */
  sect("2. the front says nothing but the flag");
  const browser = await chromium.launch(process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {});
  const page = await browser.newPage();
  /* THE FLAG IS SERVED LOCALLY, and that is not a convenience — it is the artwork suite's own lesson.
     A flag card's `src` is a Commons URL, so without this the suite is a test of whether Wikimedia is
     reachable, and when it is not the card's own dead-file handling fires and reads as this format being
     broken. It is a real 2:1 PNG so that `load` fires, the LIVE path is what gets tested, and the frame
     has a picture whose shape is not the frame's to check the contain rule against. The dead path is
     exercised deliberately in section 4. */
  const PNG2x1 = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAIAAADwyuo0AAAAFklEQVR4nGP8//8/AzpgYkAHRIkCAJ0hA/ivbYWlAAAAAElFTkSuQmCC",
    "base64");
  let flagBlocked = false;
  await page.route("**/upload.wikimedia.org/**", (route) =>
    flagBlocked ? route.abort() : route.fulfill({ status: 200, contentType: "image/png", body: PNG2x1 }));
  const errs = [];
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });
  page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));

  const card = flags[0];
  let visit = 0;
  const study = async (id) => {
    await page.addInitScript((cid) => {
      localStorage.setItem("folio_tour_v1", "1");
      localStorage.setItem("folio_marker_tour_v1", "1");
      sessionStorage.setItem("folio_study_v1", JSON.stringify({ scope: { type: "card", id: cid }, queue: [cid], id: cid, qi: 0, rev: false, studied: 0 }));
    }, id);
    await page.goto("http://localhost:" + PORT + "/?c=" + (++visit) + "#study");
    await page.waitForSelector(".flag-shot", { timeout: 20000 });
    await page.waitForFunction(() => !document.querySelector(".page-ghost"), null, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(250);
  };
  await study(card.id);

  const front = await page.evaluate(() => {
    const fig = document.querySelector(".flag-shot");
    const im = fig.querySelector("img");
    const q = document.querySelector(".question");
    const cs = getComputedStyle(im), fs2 = getComputedStyle(fig);
    return {
      html: fig.outerHTML,
      attrs: [...fig.attributes].map((a) => a.name),
      imgAttrs: [...im.attributes].map((a) => a.name),
      cap: !!fig.querySelector("figcaption"),
      imgs: document.querySelectorAll(".study-card img").length,
      fit: cs.objectFit,
      boxH: Math.round(im.getBoundingClientRect().height),
      boxW: Math.round(im.getBoundingClientRect().width),
      natural: [im.naturalWidth, im.naturalHeight],
      border: fs2.borderTopWidth, ground: fs2.backgroundColor,
      alt: im.getAttribute("alt") || "",
      qtext: q.textContent.replace(/\s+/g, " ").trim(),
      blanks: q.querySelectorAll(".blank-input, .blank").length,
      dead: fig.classList.contains("media-dead"),
    };
  });
  /* EVERY STRING THAT WOULD ANSWER THE QUESTION, looked for in the front's own markup — EXCEPT the
     `src`, which is the one accepted leak on this format and is stated rather than papered over.

     COMMONS NAMES EVERY NATIONAL FLAG `Flag_of_<Country>.svg`, and a picture's `src` is copied from the
     API and never composed or rewritten (see CLAUDE.md), so the answer is in the URL on all 233 cards
     and there is nothing to be done about it short of not linking the file. What follows from that is
     narrow: no reader is SHOWN a src — it is not rendered as text, a screen reader reads the `alt`, and
     the alt on this format is authored to describe rather than name — so the answer is reachable only by
     opening devtools, viewing source, or long-pressing the picture on a phone to read its file name. A
     reader who does any of those has gone looking for the answer, which they could do on any card here.
     Measured: 20 of 20 flag cards have it, against 0 of 10 artwork cards, whose Commons file names do
     not happen to match their titles — so it is this format's property rather than the site's.
     THE ASSERTION IS THEREFORE THE SRC AND NOTHING ELSE: the country may appear there and nowhere else
     on the front, so a leak into a title, a credit, a caption, an attribute or the visible text is still
     caught, and the accepted one cannot quietly widen. */
  const stripSrc = front.html.replace(/src="[^"]*"/g, 'src=""');
  const leaks = [String(card.answerFlag.credit || ""), String(card.answerText || "")]
    .filter((s) => s.trim().length > 3).filter((s) => stripSrc.indexOf(s) >= 0);
  ok("nothing a reader is SHOWN on the front names the country", leaks.length === 0, leaks);
  ok("…and the file name is the one accepted place it appears", front.html.indexOf(String(card.answerText)) >= 0
     && stripSrc.indexOf(String(card.answerText)) < 0, "Commons names it Flag_of_<Country>.svg");
  ok("…the flag arrived (a dead one would read as the format being broken)", !front.dead && front.natural[0] > 0, front.natural);
  ok("…there is no caption", !front.cap);
  ok("…no data-img-* attribute to open the viewer with", !front.attrs.concat(front.imgAttrs).some((a) => a.indexOf("data-img") === 0), front.imgAttrs);
  ok("…and the flag is not announced as a control", !front.attrs.includes("role") && !front.attrs.includes("title") && !front.imgAttrs.includes("title"), front.attrs);
  ok("…and exactly one picture is on the card", front.imgs === 1, front.imgs);
  /* THE FLAG IS CONTAINED, NEVER CROPPED — `.card-img`'s fixed 16:9 box and height:100% are exactly
     wrong here, so the frame is a MAXIMUM and the picture keeps its own shape inside it. */
  ok("the flag is CONTAINED and not cropped", front.fit === "contain", front.fit);
  ok("…in a frame that is a maximum rather than a shape", front.boxH >= 150 && front.boxH <= 280, front.boxH);
  /* IT IS DRAWN ON A RULED GROUND: Japan, Qatar's hoist and every white-bordered flag lose their own
     edge without one. */
  ok("…on a ruled ground, so a white-edged flag keeps its edge", parseFloat(front.border) >= 1, front.border);
  ok("…which is not transparent", front.ground !== "rgba(0, 0, 0, 0)" && front.ground !== "transparent", front.ground);
  ok("the alt describes the flag for a reader who cannot see it", front.alt.length > 20 && front.alt === card.answerFlag.alt, front.alt.slice(0, 60));
  ok("the prompt is there and says what to do", /whose flag is shown/i.test(front.qtext), front.qtext.slice(0, 90));
  ok("…with a blank to type the answer into", front.blanks >= 1, front.blanks);

  /* ---------- 3. the reveal is the World Geography answer side ----------------------------- */
  sect("3. the reveal is its twin's answer side, and credits the flag");
  await page.fill(".blank-input", card.answerText);
  await page.evaluate(() => document.querySelector("#reveal-btn").click());
  await page.waitForTimeout(400);
  const back = await page.evaluate(() => {
    const av = document.querySelector(".answer .av-flag");
    return {
      term: (document.querySelector(".answer .val") || {}).textContent || "",
      facts: [...document.querySelectorAll(".card-facts .cf-k")].map((k) => k.textContent.trim()),
      dates: [...document.querySelectorAll(".answer .dt .dt-k")].map((k) => k.textContent.trim()),
      avFlag: !!av,
      avTitle: av ? av.getAttribute("title") || "" : "",
      avOpens: !!(av && av.closest(".card-img, .av-flag, .art-shot.revealed")),
      frontStill: !!document.querySelector(".flag-shot img"),
      frontHTML: (document.querySelector(".flag-shot") || {}).outerHTML || "",
      sources: document.querySelectorAll(".src-item").length,
      why: !!document.querySelector(".elab-box, .elab-tab"),
    };
  });
  const twin = byId.get("gw-" + card.id.slice(3));
  ok("the answer names the country", back.term.trim().toLowerCase() === String(card.answerText).toLowerCase(), back.term);
  ok("…with the twin's figures grid beside it", back.facts.join("|") === (twin.facts || []).map((r) => r[0]).join("|"), back.facts);
  ok("…and its date line", back.dates.length > 0, back.dates);
  ok("…and its citations", back.sources === (card.sources || []).length, [back.sources, (card.sources || []).length]);
  /* THE CREDITED, ENLARGEABLE COPY IS THE SMALL ONE IN THE ANSWER BOX. That is where the licence's
     attribution is given — on the same card, one press away — which is what lets the front carry none. */
  ok("the flag is credited in the answer box", back.avFlag && back.avTitle === card.answerFlag.credit, back.avTitle.slice(0, 70));
  ok("…and that copy is what the viewer opens", back.avOpens);
  ok("…while the front's copy still carries no credit", back.frontStill && back.frontHTML.indexOf(card.answerFlag.credit) < 0);
  /* Geography is out of the Think-it-through pass, and a flag card is out with it — see whyExempt. */
  ok("no Think-it-through section is manufactured", !back.why);

  /* ---------- 4. a dead flag file is the whole question gone ------------------------------- */
  sect("4. a dead flag file says so");
  flagBlocked = true;
  await study(card.id);
  const dead = await page.evaluate(() => {
    const fig = document.querySelector(".flag-shot");
    return { dead: fig.classList.contains("media-dead"), imgShown: getComputedStyle(fig.querySelector("img")).display };
  });
  ok("the frame says the flag could not be loaded", dead.dead);
  ok("…and does not paint the alt text at full size in it", dead.imgShown === "none", dead.imgShown);
  flagBlocked = false;

  /* ---------- 5. the collection is on the shelf, under Geography --------------------------- */
  sect("5. the collection is on the shelf, under Geography");
  await page.goto("http://localhost:" + PORT + "/?c=" + (++visit) + "#decks");
  await page.waitForSelector(".collection", { timeout: 20000 });
  await page.waitForTimeout(300);
  const shelf = await page.evaluate(() => {
    const row = [...document.querySelectorAll('[data-libitem="flags"]')][0];
    const geo = document.getElementById("collection-list-geo");
    return {
      there: !!row,
      inGeo: !!(row && geo && geo.contains(row)),
      title: row ? (row.querySelector(".collection-title") || {}).textContent : "",
      icon: !!(row && row.querySelector(".coll-ic svg")),
      planned: !!(row && row.querySelector(".pill.soon")),
      hue: row ? getComputedStyle(row.closest(".collection") || row).getPropertyValue("--coll-bg").trim() : "",
    };
  });
  ok("the Flags collection is on the Collections page", shelf.there);
  ok("…in the Geography section", shelf.inGeo);
  ok("…under its own name", shelf.title === "Flags", shelf.title);
  ok("…wearing a mark of its own", shelf.icon);
  ok("…and no longer marked Planned, now that it holds cards", !shelf.planned);
  ok("…with a hue of its own", /#|rgb/.test(shelf.hue), shelf.hue);

  ok("no console errors anywhere in the run", errs.length === 0, errs.slice(0, 3));
  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); server.close(); process.exit(1); });
