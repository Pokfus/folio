// Reader feedback (beta): the About page's "tell us what you think" form, and the triage queue that
// replaced the Edit page's Accounts tab.
//
// Every Supabase call is answered by an in-memory stand-in, deliberately: the publishable key in app.js
// points at the REAL project, so a test that actually sent a message would write rows into it. The mock
// is only a stand-in for the RLS policies and the column guard in .claude/supabase-schema.sql — it is
// never a proof that they are right. What it CAN prove is the half that lives in the client: that a
// sender never supplies a triage status, that markup dies on ingest, and that an editor's decisions
// reach the server as the PATCHes they look like.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-feedback.js
//   FOLIO_CHROMIUM=<path to chrome>   if Chromium lives outside the playwright package
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
});

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
}

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://localhost:" + server.address().port;
  const browser = await chromium.launch(LAUNCH);
  const ctx = await browser.newContext();
  const errs = [];
  ctx.on("page", (p) => {
    // ERR_TUNNEL/ERR_CONNECTION is the styles.css @import of Google Fonts failing behind a sandbox proxy —
    // an environment artifact, filtered here exactly as the other browser tests filter it
    p.on("console", (m) => { if (m.type() === "error" && !/ERR_(TUNNEL|CONNECTION)|favicon/.test(m.text())) errs.push(m.text()); });
    p.on("pageerror", (e) => errs.push("pageerror: " + e.message));
  });

  // ---- the stand-in Supabase ----
  const store = { rows: [], posted: [], patched: [], deleted: [] };
  await ctx.route("**/*.supabase.co/**", async (route) => {
    const req = route.request(), url = req.url(), method = req.method();
    const json = (body, status) => route.fulfill({ status: status || 200, contentType: "application/json", body: JSON.stringify(body) });
    if (/\/rest\/v1\/feedback/.test(url)) {
      if (method === "POST") {
        const b = JSON.parse(req.postData() || "{}");
        store.posted.push(b);
        return json([], 201);
      }
      if (method === "PATCH") { store.patched.push(JSON.parse(req.postData() || "{}")); return json([]); }
      if (method === "DELETE") { store.deleted.push(url); return json([], 204); }
      return json(store.rows);
    }
    return json([], 200);
  });

  const page = await ctx.newPage();

  // ============================ the About page form ============================
  await page.goto(base + "/#mission");
  await page.waitForTimeout(1000);

  check("the About page carries the feedback form", (await page.locator("#fbForm").count()) === 1);
  const order = await page.$$eval(".mission > .msn-card", (els) => els.map((e) => e.className));
  check("it sits after the FAQ", order.findIndex((c) => /msn-feedback/.test(c)) > order.findIndex((c) => /msn-faq/.test(c)));
  check("and before the changelog", order.findIndex((c) => /msn-feedback/.test(c)) < order.findIndex((c) => /msn-clog/.test(c)));
  check("signed out, the optional name + email fields are offered", (await page.locator("#fbName").count()) === 1 && (await page.locator("#fbEmail").count()) === 1);

  // an empty message never reaches the network
  await page.click("#fbSend");
  await page.waitForTimeout(250);
  check("an empty message is refused on the page", /Write a message/i.test(await page.$eval("#fbStatus", (e) => e.textContent)));
  check("…and costs no request", store.posted.length === 0);

  await page.fill("#fbMsg", "The Shang card says 1600 BCE.\n\nThe glossary says 1650 — which is right?");
  await page.fill("#fbName", "Ada");
  await page.fill("#fbEmail", "ada@example.com");
  await page.selectOption("#fbKind", "correction");
  await page.click("#fbSend");
  await page.waitForTimeout(500);
  const sent = store.posted[0] || {};
  check("the message is sent once", store.posted.length === 1);
  check("the kind travels with it", sent.kind === "correction");
  check("paragraph breaks survive the plain-text sanitizer", /1600 BCE/.test(sent.message || "") && /\n\n/.test(sent.message || ""));
  check("the optional name + email travel", sent.name === "Ada" && sent.email === "ada@example.com");
  check("the route the reader was on is recorded", sent.page === "#mission");
  check("the site language and browser are recorded", !!(sent.meta && sent.meta.lang && sent.meta.ua));
  // The column guard in the schema is what ENFORCES this; the client must not even try, or an editor
  // reading the queue could not tell a sender's claim from their own decision.
  check("the sender supplies no triage status", sent.status === undefined && sent.admin_note === undefined);
  check("the reader is thanked", /thank you/i.test(await page.$eval("#fbStatus", (e) => e.textContent)));
  check("the message clears but the name is kept", (await page.inputValue("#fbMsg")) === "" && (await page.inputValue("#fbName")) === "Ada");

  // markup in a message is stripped before it is stored, so the queue can never be a delivery vector
  await page.evaluate(() => localStorage.removeItem("folio_feedback_sent_v1"));
  await page.fill("#fbMsg", '<img src=x onerror=alert(1)> and <b>bold</b> and <a href="javascript:alert(2)">a link</a>');
  await page.click("#fbSend");
  await page.waitForTimeout(500);
  const hostile = (store.posted[1] || {}).message || "";
  check("markup never reaches the row", store.posted.length === 2 && !/[<>]/.test(hostile), JSON.stringify(hostile));
  check("a javascript: URL leaves nothing behind", !/javascript:/i.test(hostile));

  await page.fill("#fbMsg", "and another, straight away");
  await page.click("#fbSend");
  await page.waitForTimeout(400);
  check("the cooldown holds the next message", store.posted.length === 2);
  check("…and says why", /moment/i.test(await page.$eval("#fbStatus", (e) => e.textContent)));

  // ============================ the Edit page queue ============================
  store.rows = [
    { id: "a", author: null, name: "", email: "", kind: "bug", message: "The globe froze when I zoomed.", page: "#map", meta: { lang: "en", ua: "Mozilla/5.0 Test" }, status: "new", admin_note: "", created_at: "2026-07-28T10:00:00Z" },
    { id: "b", author: "u1", name: "Ada", email: "ada@example.com", kind: "correction", message: "Wrong date on a card.", page: "#study", meta: { lang: "fr" }, status: "seen", admin_note: "checked", created_at: "2026-07-27T10:00:00Z" },
    { id: "c", author: "u2", name: "Bo", email: "", kind: "praise", message: "Lovely site.", page: "#home", meta: {}, status: "done", admin_note: "", created_at: "2026-07-26T10:00:00Z" },
  ];
  await page.goto(base + "/#admin");
  await page.waitForTimeout(1000);
  const tabs = await page.$$eval(".admin-tab", (e) => e.map((x) => x.dataset.atab));
  check("the Accounts tab is gone", !tabs.includes("accounts"), tabs.join(","));
  check("a Feedback tab stands in its place", tabs.includes("feedback"));

  await page.click('.admin-tab[data-atab="feedback"]');
  await page.waitForTimeout(700);
  check("the queue opens on what still needs a decision", (await page.locator(".fbq-row").count()) === 2);
  await page.click('.fbq-chip[data-flt="all"]');
  await page.waitForTimeout(250);
  check("the All filter shows every message", (await page.locator(".fbq-row").count()) === 3);
  check("the count is reported", /3 messages/.test(await page.$eval("#adminListCount", (e) => e.textContent)));
  check("an anonymous sender is labelled as one", /signed out/i.test(await page.$eval('.fbq-row[data-fb="a"]', (e) => e.textContent)));
  check("a reply address becomes a mailto link", (await page.getAttribute('.fbq-row[data-fb="b"] .fbq-mail', "href")) === "mailto:ada@example.com");
  check("the tab badge counts the unread", (await page.$eval(".admin-tab-badge", (e) => e.textContent)) === "1");

  // the colours ARE the triage: two statuses must never paint the same edge
  const edge = (id) => page.$eval('.fbq-row[data-fb="' + id + '"]', (e) => getComputedStyle(e).borderLeftColor);
  const colA = await edge("a"), colB = await edge("b"), colC = await edge("c");
  check("each status wears its own colour", colA !== colB && colB !== colC && colA !== colC, [colA, colB, colC].join(" / "));
  check("the current status is the lit swatch", await page.$eval('.fbq-row[data-fb="c"] .fbq-sw[data-st="done"]', (e) => e.classList.contains("on")));

  await page.click('.fbq-row[data-fb="a"] .fbq-sw[data-st="approved"]');
  await page.waitForTimeout(350);
  check("clicking a colour PATCHes the status", store.patched.length === 1 && store.patched[0].status === "approved");
  check("the row repaints without waiting for a reload", (await edge("a")) !== colA);
  check("the unread badge clears", !(await page.locator(".admin-tab-badge").isVisible()));
  await page.click('.fbq-row[data-fb="a"] .fbq-sw[data-st="approved"]');
  await page.waitForTimeout(350);
  check("clicking the lit colour again clears it back to New", store.patched.length === 2 && store.patched[1].status === "new");

  await page.fill('.fbq-row[data-fb="a"] .fbq-note', "emailed them");
  await page.click('.fbq-row[data-fb="b"] .fbq-note');
  await page.waitForTimeout(350);
  check("a private note saves when you leave the field", store.patched.some((p) => p.admin_note === "emailed them"));

  const del = page.locator('.fbq-row[data-fb="c"] .fbq-del');
  await del.click();
  await page.waitForTimeout(150);
  check("delete arms before it deletes", /confirm/i.test(await del.evaluate((e) => e.textContent)));
  await del.click();
  await page.waitForTimeout(350);
  check("a second click deletes", store.deleted.length === 1);
  check("the row leaves the list", (await page.locator(".fbq-row").count()) === 2);

  // A session saved while the retired tab was open must not strand the editor on a tab that no longer
  // exists — it falls through to the editor's default, which is the Dashboard (Aug 2026; it was Cards).
  // It has to be seeded in a FRESH page: this one's pagehide handler flushes the live adminState
  // over the key on the way out of a reload.
  const p2 = await ctx.newPage();
  await p2.addInitScript(() => localStorage.setItem("folio_admin_ui_v1", JSON.stringify({ tab: "accounts" })));
  await p2.goto(base + "/#admin");
  await p2.waitForTimeout(1000);
  check("a session saved on the retired tab opens on the default tab", (await p2.$eval(".admin-tab.active", (e) => e.dataset.atab)) === "dashboard");

  check("no console/page errors", errs.length === 0, [...new Set(errs)].join(" | "));

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
