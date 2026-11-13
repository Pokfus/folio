#!/usr/bin/env node
/* ============================================================================
   verify-claims.js — DOES THE CITED SOURCE ACTUALLY SAY WHAT THE SENTENCE SAYS?

     node .claude/verify-claims.js [--prefix=rm-] [--card=rm-501] [--limit=N]   which cards
                                   [--prepare]            (default) fetch, excerpt, estimate cost — no API calls
                                   [--direct]             check now, one request at a time, full price
                                   [--run]                Batch API (half price), chunk after chunk, until --budget
                                   [--report]             rewrite the report from what has been checked
                                   [--budget=USD]         hard ceiling on what this tool may spend, all runs together
                                   [--model=claude-opus-5-5] [--effort=low|medium|high] [--chunk=1000]
                                   [--refetch]            ignore the page cache

   WHY IT EXISTS. Every other citation checker in `.claude/` checks something
   AROUND the claim: `add-card.js` that a citation ends in a URL,
   `check-links.js` that the URL still answers, `check-citations.js` and
   `check-cite-authors.js` that the authors and year match Crossref / Europe PMC.
   All of them pass a footnote whose source never says what the sentence says.
   The refinement audits (Greece, Rome, World History, China) re-read their
   sources by hand, claim by claim, and found exactly that fault again and again
   ("in no source that opened", "had no source"). Nothing does it for the rest.

   WHAT IT DOES. For every (card, footnote number) pair it gathers the sentences
   of the abstract and the "Think it through" answers that carry that marker,
   fetches the cited URL (archive.org books through their OCR text, PDFs through
   `pdftotext`, a DOI through the publisher and then Crossref's abstract), picks
   the passages of the page that best match those sentences, and asks a model:
   for each sentence — supported, partial, not in the excerpt, contradicted, or
   is this page not the cited work at all? The model must quote the passage; a
   quote that is not in the excerpt word for word is caught here and the verdict
   is marked UNVERIFIED rather than trusted.

   IT REPORTS EVIDENCE, NEVER A FIX. A "contradicted" row is a question for a
   human (or a Claude session) to open the source and decide. The excerpt is a
   keyword selection from a long text, so "not in excerpt" usually means "could
   not tell", not "unsupported" — the report keeps the two apart.

   MONEY. It needs ANTHROPIC_API_KEY (or a credential the environment injects).
   `--prepare` spends nothing and prints an estimate for each model. `--budget`
   is a ceiling over ALL runs (the ledger remembers what was spent); `--run`
   submits batches of `--chunk` requests, collects them, adds the ACTUAL cost
   from the API's usage figures, and stops before a chunk whose estimate would
   cross the ceiling. Estimates use measured averages once 50 requests of a model
   have come back. Set a spend limit in the Anthropic Console as well: this
   ceiling is the tool's promise, the Console's is the account's.

   STATE lives in `.claude/.claimcheck/` (gitignored): `pages/` (fetched text,
   gzipped), `results.jsonl` (one line per checked pair, keyed by a hash of the
   card's sentences, the source and the model — edit a card and its pairs are
   checked afresh), `ledger.json` (money and batches; a run that is killed
   resumes its batch next time), `report.md`.

   The SDK is not a dependency of the site: install it outside the repo and reach
   it through NODE_PATH, as CI does with Playwright —
     mkdir -p "$SCRATCH/sdk" && cd "$SCRATCH/sdk" && npm init -y && npm i @anthropic-ai/sdk
     NODE_PATH="$SCRATCH/sdk/node_modules" node .claude/verify-claims.js --direct --card=rm-501
   Not part of the site. 📖 docs/claim-check.md
   ============================================================================ */
"use strict";
const fs = require("fs"), path = require("path"), zlib = require("zlib"), crypto = require("crypto");
const cp = require("child_process");
const { loadCards } = require("./card-io");

const ROOT = path.join(__dirname, "..");
const DIR = path.join(__dirname, ".claimcheck");
const PAGES = path.join(DIR, "pages");
const RESULTS = path.join(DIR, "results.jsonl");
const LEDGER = path.join(DIR, "ledger.json");
const REPORT = path.join(DIR, "report.md");

/* ---------- arguments ---------- */
const ARGS = {};
for (const a of process.argv.slice(2)) {
  const m = /^--([a-z-]+)(?:=(.*))?$/.exec(a);
  if (m) ARGS[m[1]] = m[2] === undefined ? true : m[2];
}
const MODE = ARGS.direct ? "direct" : ARGS.run ? "run" : ARGS.report ? "report" : "prepare";
const MODEL = ARGS.model || "claude-opus-5-5";
const EFFORT = ARGS.effort || null;            // null = the model's own default
const BUDGET = ARGS.budget !== undefined ? Number(ARGS.budget) : null;
const CHUNK = Number(ARGS.chunk || 1000);
const EXCERPT_CHARS = Number(ARGS["excerpt-chars"] || 14000);
const UA = "Mozilla/5.0 (compatible; citation-check/1.0)";

/* USD per million tokens at the standard rate; the Batch API is half of it. From the
   Anthropic pricing table, Nov 2026 — check it before trusting an estimate to the cent. */
const PRICE = {
  "claude-opus-5-5":   { in: 4.0, out: 20.0 },
  "claude-sonnet-5-5": { in: 2.0, out: 10.0 },
  "claude-haiku-5-5":  { in: 0.10, out: 0.50 },
  "claude-fable-5-2":  { in: 8.0, out: 40.0 },
};
/* Output per request before anything has been measured: the JSON verdicts plus thinking. */
const OUT_GUESS = { "claude-opus-5-5": 700, "claude-sonnet-5-5": 700, "claude-haiku-5-5": 600, "claude-fable-5-2": 900 };
const FALLBACK_MODELS = new Set(["claude-opus-5-5", "claude-sonnet-5-5", "claude-fable-5-2"]);

/* ---------- small helpers ---------- */
const sha = (s) => crypto.createHash("sha1").update(s).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function readJSON(f, d) { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return d; } }
function writeJSON(f, v) { fs.writeFileSync(f, JSON.stringify(v, null, 1)); }
function decode(s) {
  return s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}
const norm = (s) => decode(s).toLowerCase().replace(/[‘’“”"'`]/g, "").replace(/[\s­]+/g, " ").trim();

/* ---------- 1. the claims: sentences that carry each footnote ---------- */
function sentencesOf(html) {
  const t = html
    .replace(/<sup class="fn" data-fn="(\d+)"><\/sup>/g, "⟦$1⟧")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "");
  const text = decode(t).replace(/\s+/g, " ").trim();
  if (!text) return [];
  /* split after a full stop and any markers that follow it, before a capital or an opening quote */
  const parts = text.split(/(?<=[.!?]["”’)]?(?:⟦\d+⟧)*)\s+(?=[A-Z“"‘(0-9])/);
  return parts.map((p) => {
    const fns = [...p.matchAll(/⟦(\d+)⟧/g)].map((m) => +m[1]);
    return { text: p.replace(/⟦\d+⟧/g, "").trim(), fns: [...new Set(fns)] };
  }).filter((s) => s.fns.length && s.text.length > 10);
}
function urlOf(src) {
  const m = String(src).match(/https?:\/\/[^\s"'<>]+/g);
  if (!m) return null;
  return m[m.length - 1].replace(/[.,;)\]]+$/, "");
}
function pairsFor(card) {
  const sents = [...sentencesOf(card.abstract || "")];
  for (const w of Array.isArray(card.why) ? card.why : []) sents.push(...sentencesOf(w.a || ""));
  const byFn = new Map();
  for (const s of sents) for (const n of s.fns) {
    if (!byFn.has(n)) byFn.set(n, []);
    byFn.get(n).push({ text: s.text, others: s.fns.length - 1 });
  }
  const out = [];
  for (const [n, list] of byFn) {
    const source = (card.sources || [])[n - 1];
    if (!source) continue;
    const plain = decode(String(source).replace(/<[^>]+>/g, ""));
    out.push({ card: card.id, n, source: plain, url: urlOf(plain), sentences: list });
  }
  return out.sort((a, b) => a.n - b.n);
}

/* ---------- 2. the source: fetch once, cache, turn into text ---------- */
async function get(url, asText = true) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,application/pdf,text/plain;q=0.9,*/*;q=0.5" },
    redirect: "follow", signal: AbortSignal.timeout(45000) });
  const type = res.headers.get("content-type") || "";
  const buf = Buffer.from(await res.arrayBuffer());
  return { status: res.status, type, final: res.url, buf, text: asText ? buf.toString("utf8") : null };
}
function htmlToText(h) {
  return decode(h.replace(/<(script|style|noscript|svg|nav|header|footer|form)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|div|li|h\d|tr|br|section|article|blockquote)>/gi, "\n").replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")).replace(/[ \t\f\v]+/g, " ").replace(/\n\s*\n+/g, "\n\n").trim();
}
function pdfToText(buf) {
  const tmp = path.join(DIR, "tmp-" + process.pid + ".pdf");
  fs.writeFileSync(tmp, buf);
  try { return cp.execFileSync("pdftotext", ["-q", "-enc", "UTF-8", tmp, "-"], { maxBuffer: 1 << 28 }).toString("utf8"); }
  catch { return ""; } finally { fs.rmSync(tmp, { force: true }); }
}
async function archiveText(id) {
  const meta = JSON.parse((await get("https://archive.org/metadata/" + encodeURIComponent(id))).text || "{}");
  const f = (meta.files || []).find((x) => /_djvu\.txt$/.test(x.name)) || (meta.files || []).find((x) => /\.txt$/.test(x.name));
  if (!f) return null;
  const r = await get("https://archive.org/download/" + encodeURIComponent(id) + "/" + f.name.split("/").map(encodeURIComponent).join("/"));
  return r.status === 200 ? r.text : null;
}
async function crossrefAbstract(doi) {
  const r = await get("https://api.crossref.org/works/" + encodeURIComponent(doi));
  if (r.status !== 200) return null;
  const m = JSON.parse(r.text).message || {};
  return m.abstract ? htmlToText(m.abstract) : null;
}
async function fetchPage(url) {
  const file = path.join(PAGES, sha(url) + ".json.gz");
  if (!ARGS.refetch && fs.existsSync(file)) return JSON.parse(zlib.gunzipSync(fs.readFileSync(file)).toString("utf8"));
  let page = { url, ok: false, kind: "", note: "", text: "" };
  try {
    const ia = /^https?:\/\/(?:www\.)?archive\.org\/details\/([^/?#]+)/.exec(url);
    if (ia) {
      const t = await archiveText(ia[1]);
      if (t) page = { url, ok: true, kind: "archive.org OCR text", note: "", text: t };
      else page.note = "archive.org item without a text file (borrow-only or images only)";
    }
    /* PubMed Central answers a script with a JavaScript challenge; Europe PMC serves the same
       article's full text as XML (the Rome audit's standing workaround). */
    const pmc = /ncbi\.nlm\.nih\.gov\/(?:pmc\/)?articles\/(PMC\d+)/i.exec(url);
    if (pmc) {
      const r = await get(`https://www.ebi.ac.uk/europepmc/webservices/rest/${pmc[1]}/fullTextXML`);
      if (r.status === 200 && r.text.length > 1000) page = { url, ok: true, kind: "Europe PMC full text", note: "", text: htmlToText(r.text) };
      else page.note = "no Europe PMC full text for " + pmc[1];
    }
    if (!page.ok && !pmc) {
      const r = await get(url, false);
      if (r.status >= 400) page.note = "HTTP " + r.status;
      else if (/pdf/i.test(r.type) || r.buf.slice(0, 5).toString() === "%PDF-") {
        const t = pdfToText(r.buf);
        if (t.trim()) page = { url, ok: true, kind: "PDF text", note: "", text: t };
        else page.note = "PDF without a text layer";
      } else {
        const t = /html|xml/i.test(r.type) ? htmlToText(r.buf.toString("utf8")) : r.buf.toString("utf8");
        if (t.length > 400) page = { url, ok: true, kind: "web page", note: "", text: t };
        else page.note = "page has almost no text (" + t.length + " characters)";
      }
      const doi = /doi\.org\/(10\.[^?#\s]+)/i.exec(url);
      if (doi && (!page.ok || page.text.length < 3000)) {
        const a = await crossrefAbstract(decodeURIComponent(doi[1])).catch(() => null);
        if (a) page = { url, ok: true, kind: "Crossref abstract only", note: page.note, text: a + (page.ok ? "\n\n" + page.text : "") };
      }
    }
  } catch (e) { page.note = "fetch failed: " + (e.cause && e.cause.code || e.name || e.message); }
  page.text = page.text.slice(0, 6e6);
  fs.writeFileSync(file, zlib.gzipSync(JSON.stringify(page)));
  return page;
}

/* ---------- 3. the excerpt: the passages that best match the sentences ---------- */
const STOP = new Set("that this with from were which their there they have been also into than then when what where while would could after before about other these those such only some more most over under between during because though although being its his her them first later until upon".split(" "));
const terms = (s) => (s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").match(/[\p{L}\p{N}]{4,}|\d{2,}/gu) || []).filter((w) => !STOP.has(w));
function excerpt(text, sentences) {
  text = text.replace(/(\p{Ll})-\s*\n?\s+(\p{Ll})/gu, "$1$2");   // OCR's broken words: "repeat- edly"
  if (text.length <= EXCERPT_CHARS) return { text, whole: true };
  const words = text.split(/\s+/);
  const W = 160, STEP = 110, chunks = [];
  for (let i = 0; i < words.length; i += STEP) chunks.push({ i, text: words.slice(i, i + W).join(" ") });
  const sets = chunks.map((c) => new Set(terms(c.text)));
  const df = new Map();
  for (const st of sets) for (const w of st) df.set(w, (df.get(w) || 0) + 1);
  /* Each sentence ranks the chunks by its OWN rare words (idf squared, so a name found in two places
     outweighs five words found everywhere); the sentences then take turns choosing their best
     unchosen chunk until the excerpt is full. One sentence's common words cannot crowd out another's. */
  const ranks = sentences.map((s) => {
    const q = [...new Set(terms(s.text))].filter((w) => df.has(w));
    return chunks.map((c, k) => {
      let sc = 0;
      for (const w of q) if (sets[k].has(w)) { const idf = Math.log(chunks.length / df.get(w)); sc += idf * idf * (/^\d+$/.test(w) ? 1.5 : 1); }
      return { k, sc };
    }).filter((x) => x.sc > 0).sort((a, b) => b.sc - a.sc);
  });
  const chosen = new Set();
  let len = 0, progress = true;
  while (progress && len < EXCERPT_CHARS) {
    progress = false;
    for (const r of ranks) {
      while (r.length && chosen.has(r[0].k)) r.shift();
      if (!r.length) continue;
      const c = chunks[r.shift().k];
      if (len + c.text.length > EXCERPT_CHARS) continue;
      chosen.add(chunks.indexOf(c)); len += c.text.length + 5; progress = true;
    }
  }
  if (!chosen.size) return { text: text.slice(0, EXCERPT_CHARS), whole: false };
  const pick = [...chosen].sort((a, b) => a - b);
  /* neighbouring windows overlap by 50 words: join them without repeating the overlap */
  const parts = [];
  let last = -9;
  for (const k of pick) {
    if (k === last + 1) parts[parts.length - 1] += " " + words.slice(chunks[k].i + (W - STEP), chunks[k].i + W).join(" ");
    else parts.push(chunks[k].text);
    last = k;
  }
  return { text: parts.join("\n[…]\n"), whole: false };
}

/* ---------- 4. the request ---------- */
const SYSTEM = `You check footnotes on an educational history and science flashcard site.

You are given numbered sentences from one card and an excerpt of the ONE source a footnote on each of them points to. The excerpt was fetched automatically, so it may be incomplete: only an abstract, a keyword-selected set of passages from a long book (joined by […]), OCR text with errors, or a page that did not load the work at all.

For each sentence, decide whether the excerpt supports the part of the sentence this source is cited for. A sentence may cite other sources too (you are told how many); this source then needs to support only some of it — say which part.

Verdicts:
- "supported": the excerpt states it, allowing for paraphrase, translation and rounding.
- "partial": the excerpt supports some of what the sentence says and is silent on the rest (say what is missing), or supports a weaker version (say how it is weaker).
- "not_in_excerpt": the excerpt does not address it. Use this whenever you cannot tell; it is not an accusation.
- "contradicted": the excerpt states something incompatible — a different date, number, name, place, order of events, or attribution. Say exactly what differs.

Judge ONLY from the excerpt, never from your own knowledge, even when you are sure the sentence is true or false.
"quote": copy, character for character, the shortest passage of the excerpt (at most 300 characters) that supports or contradicts the sentence; an empty string for "not_in_excerpt".
"note": one short sentence; empty for a plain "supported".
"source_usable": false when the excerpt is plainly not the cited work (an error page, a paywall or cookie notice, a search page, a different document); then give every sentence "not_in_excerpt".`;

const SCHEMA = {
  type: "object", additionalProperties: false, required: ["source_usable", "sentences"],
  properties: {
    source_usable: { type: "boolean" },
    sentences: { type: "array", items: { type: "object", additionalProperties: false, required: ["i", "verdict", "quote", "note"],
      properties: { i: { type: "integer" }, verdict: { type: "string", enum: ["supported", "partial", "not_in_excerpt", "contradicted"] },
        quote: { type: "string" }, note: { type: "string" } } } },
  },
};

function userText(p, ex, page) {
  const s = p.sentences.map((x, i) => `${i + 1}. ${x.text}${x.others ? `  [also cites ${x.others} other source${x.others > 1 ? "s" : ""}]` : ""}`).join("\n");
  return `CITED SOURCE: ${p.source}\nFETCHED AS: ${page.kind}${ex.whole ? " (whole text)" : " (selected passages)"}\n\nSENTENCES:\n${s}\n\nEXCERPT:\n<<<\n${ex.text}\n>>>`;
}
function params(p, ex, page) {
  const o = {
    model: MODEL, max_tokens: 8000, system: SYSTEM,
    messages: [{ role: "user", content: userText(p, ex, page) }],
    output_config: { format: { type: "json_schema", schema: SCHEMA } },
  };
  if (EFFORT) o.output_config.effort = EFFORT;
  return o;
}

/* ---------- 5. results, money ---------- */
function loadResults() {
  const m = new Map();
  if (!fs.existsSync(RESULTS)) return m;
  for (const line of fs.readFileSync(RESULTS, "utf8").split("\n")) if (line.trim()) { try { const r = JSON.parse(line); m.set(r.key, r); } catch {} }
  return m;
}
function ledger() { return readJSON(LEDGER, { spent: 0, requests: 0, byModel: {}, batches: [] }); }
function cost(usage, model, batch) {
  const pr = PRICE[model] || PRICE["claude-opus-5-5"], k = batch ? 0.5 : 1;
  const inTok = (usage.input_tokens || 0) + (usage.cache_creation_input_tokens || 0) * 1.25 + (usage.cache_read_input_tokens || 0) * 0.1;
  return k * (inTok * pr.in + (usage.output_tokens || 0) * pr.out) / 1e6;
}
function estimate(reqChars, model, batch, L) {
  const pr = PRICE[model] || PRICE["claude-opus-5-5"], k = batch ? 0.5 : 1;
  const m = L.byModel[model];
  const outAvg = m && m.n >= 50 ? m.out / m.n : OUT_GUESS[model] || 700;
  const inTok = reqChars / 3.6;   // English prose ≈ 3.6–4 characters a token; the lower figure errs high
  return k * (inTok * pr.in + outAvg * pr.out) / 1e6;
}
function checkQuotes(parsed, ex) {
  const hay = norm(ex.text).replace(/\s*\[…\]\s*/g, " ");
  for (const s of parsed.sentences || []) {
    if (s.quote && s.verdict !== "not_in_excerpt") {
      const q = norm(s.quote);
      /* whole, or — when the model elided the middle with an ellipsis — every piece of it */
      const pieces = q.split(/\s*(?:…|\.\.\.)\s*/).filter((x) => x.length >= 8);
      const ok = hay.includes(q) || pieces.length > 1 && pieces.every((x) => hay.includes(x));
      if (!ok) { s.quote_found = false; s.verdict_model = s.verdict; s.verdict = "unverified"; }
    }
  }
  return parsed;
}
function record(job, parsed, usage, batch, L, extra = {}) {
  const c = cost(usage, MODEL, batch);
  const row = { key: job.key, card: job.p.card, n: job.p.n, url: job.p.url, source: job.p.source, kind: job.page.kind, whole: job.ex.whole,
    model: MODEL, effort: EFFORT, at: new Date().toISOString(), sentences: job.p.sentences.map((s) => s.text),
    result: parsed ? checkQuotes(parsed, job.ex) : null, usage, cost: +c.toFixed(6), ...extra };
  fs.appendFileSync(RESULTS, JSON.stringify(row) + "\n");
  L.spent += c; L.requests++;
  const b = L.byModel[MODEL] || (L.byModel[MODEL] = { n: 0, in: 0, out: 0, spent: 0 });
  b.n++; b.in += usage.input_tokens || 0; b.out += usage.output_tokens || 0; b.spent += c;
  return c;
}
function parseMessage(msg) {
  if (msg.stop_reason === "refusal") return { parsed: null, extra: { error: "refused" } };
  const t = (msg.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
  try { return { parsed: JSON.parse(t), extra: {} }; } catch { return { parsed: null, extra: { error: "unparsable (" + msg.stop_reason + ")" } }; }
}

/* ---------- 6. preparing the work ---------- */
async function prepare(results) {
  const { cards } = loadCards();
  let pick = cards.filter((c) => (!ARGS.prefix || c.id.startsWith(ARGS.prefix)) && (!ARGS.card || String(ARGS.card).split(",").includes(c.id)));
  if (ARGS.limit) pick = pick.slice(0, Number(ARGS.limit));
  const pairs = pick.flatMap(pairsFor);
  const urls = [...new Set(pairs.map((p) => p.url).filter(Boolean))];
  const pages = new Map();
  let done = 0;
  const CONC = 8;
  await Promise.all(Array.from({ length: CONC }, async () => {
    while (urls.length) {
      const u = urls.shift();
      pages.set(u, await fetchPage(u));
      if (++done % 25 === 0) process.stderr.write(`  fetched ${done} pages\r`);
    }
  }));
  const jobs = [], skipped = [];
  for (const p of pairs) {
    if (!p.url) { skipped.push({ p, why: "no URL in the citation" }); continue; }
    const page = pages.get(p.url);
    if (!page.ok) { skipped.push({ p, why: page.note }); continue; }
    const ex = excerpt(page.text, p.sentences);
    const key = sha([MODEL, p.card, p.n, p.source, ...p.sentences.map((s) => s.text)].join("\u0001"));
    const job = { key, p, page, ex, params: params(p, ex, page) };
    job.chars = SYSTEM.length + job.params.messages[0].content.length + 400;
    if (!results.has(key)) jobs.push(job);
  }
  return { cards: pick.length, pairs, jobs, skipped };
}

/* ---------- 7. modes ---------- */
function client() {
  let Anthropic;
  try { Anthropic = require("@anthropic-ai/sdk"); Anthropic = Anthropic.default || Anthropic; }
  catch { console.error("The Anthropic SDK is not installed. See this file's header (NODE_PATH)."); process.exit(2); }
  return new Anthropic({ maxRetries: 4 });
}
function overBudget(L, next) { return BUDGET !== null && L.spent + next > BUDGET; }

async function runDirect(jobs, L) {
  const api = client();
  let n = 0;
  for (const job of jobs) {
    const est = estimate(job.chars, MODEL, false, L);
    if (overBudget(L, est)) { console.log(`Budget reached: $${L.spent.toFixed(2)} of $${BUDGET} spent.`); break; }
    const body = { ...job.params };
    if (FALLBACK_MODELS.has(MODEL)) { body.betas = ["server-side-fallback-2026-07-01"]; body.fallbacks = "default"; }
    let msg;
    try { msg = await api.beta.messages.create(body); }
    catch (e) {
      const A = api.constructor;
      if (e instanceof A.AuthenticationError) { console.error("No valid API key."); process.exit(2); }
      if (e instanceof A.BadRequestError) { console.error(`${job.p.card} fn ${job.p.n}: rejected — ${e.message}`); continue; }
      console.error(`${job.p.card} fn ${job.p.n}: ${e.message}`); continue;
    }
    const { parsed, extra } = parseMessage(msg);
    const c = record(job, parsed, msg.usage, false, L, extra);
    writeJSON(LEDGER, L);
    n++;
    const v = parsed ? (parsed.sentences || []).map((s) => s.verdict).join(",") : extra.error;
    console.log(`${job.p.card} fn ${job.p.n}  ${v}  $${c.toFixed(4)}`);
  }
  console.log(`${n} checked; this tool has spent $${L.spent.toFixed(2)} in all.`);
}

async function collect(api, b, byKey, L) {
  let actual = 0;
  for await (const r of await api.messages.batches.results(b.id)) {
    const job = byKey.get(r.custom_id);
    if (!job) continue;   // the card changed since the batch was sent; its pair is checked afresh later
    if (r.result.type === "succeeded") {
      const { parsed, extra } = parseMessage(r.result.message);
      actual += record(job, parsed, r.result.message.usage, true, L, extra);
    }
  }
  b.status = "collected"; b.actual = +actual.toFixed(4);
  writeJSON(LEDGER, L);
  console.log(`  batch ${b.id}: collected, $${actual.toFixed(2)} (estimate $${b.est.toFixed(2)}); $${L.spent.toFixed(2)} spent in all.`);
}
async function waitFor(api, id) {
  for (;;) {
    const s = await api.messages.batches.retrieve(id);
    if (s.processing_status === "ended") return s;
    process.stderr.write(`  batch ${id}: ${s.request_counts.succeeded} done, ${s.request_counts.processing} processing\r`);
    await sleep(60000);
  }
}
async function runBatches(jobs, L) {
  if (BUDGET === null) { console.error("--run needs --budget=USD. It is the ceiling this tool may spend over all runs."); process.exit(2); }
  const api = client();
  const byKey = new Map(jobs.map((j) => [j.key.slice(0, 64), j]));
  for (const b of L.batches.filter((b) => b.status !== "collected")) {   // a run that was stopped mid-batch
    console.log(`Resuming batch ${b.id}…`);
    await waitFor(api, b.id);
    await collect(api, b, byKey, L);
  }
  const done = loadResults();
  let queue = jobs.filter((j) => !done.has(j.key));
  while (queue.length) {
    const chunk = [];
    let est = 0;
    for (const j of queue) {
      const e = estimate(j.chars, MODEL, true, L);
      if (chunk.length >= CHUNK || overBudget(L, est + e)) break;
      chunk.push(j); est += e;
    }
    if (!chunk.length) { console.log(`Budget reached: $${L.spent.toFixed(2)} of $${BUDGET} spent; ${queue.length} pairs left.`); return; }
    const batch = await api.messages.batches.create({ requests: chunk.map((j) => ({ custom_id: j.key.slice(0, 64), params: j.params })) });
    const b = { id: batch.id, model: MODEL, n: chunk.length, est: +est.toFixed(4), at: new Date().toISOString(), status: "sent" };
    L.batches.push(b); writeJSON(LEDGER, L);
    console.log(`Sent batch ${b.id}: ${chunk.length} pairs, estimate $${est.toFixed(2)}.`);
    await waitFor(api, b.id);
    await collect(api, b, byKey, L);
    queue = queue.slice(chunk.length);
  }
  console.log("Everything selected has been checked.");
}

/* ---------- 8. report ---------- */
function writeReport(skipped) {
  const rows = [...loadResults().values()];
  const tally = { supported: 0, partial: 0, not_in_excerpt: 0, contradicted: 0, unverified: 0 };
  const flags = [], unusable = new Map(), errors = [];
  for (const r of rows) {
    if (!r.result) { errors.push(r); continue; }
    if (r.result.source_usable === false) {
      const h = (() => { try { return new URL(r.url).host; } catch { return "?"; } })();
      unusable.set(h, (unusable.get(h) || 0) + 1);
      continue;
    }
    for (const s of r.result.sentences || []) {
      tally[s.verdict] = (tally[s.verdict] || 0) + 1;
      if (s.verdict === "contradicted" || s.verdict === "unverified" || s.verdict === "partial")
        flags.push({ r, s, rank: { contradicted: 0, unverified: 1, partial: 2 }[s.verdict] });
    }
  }
  flags.sort((a, b) => a.rank - b.rank || a.r.card.localeCompare(b.r.card) || a.r.n - b.r.n);
  const L = ledger();
  const out = [`# Claim check — ${new Date().toISOString().slice(0, 10)}`, "",
    `${rows.length} card–source pairs checked; $${L.spent.toFixed(2)} spent in all.`, "",
    "| verdict | sentences |", "|---|---|", ...Object.entries(tally).map(([k, v]) => `| ${k} | ${v} |`), "",
    "A row below is a QUESTION, not a finding: open the source and decide. `unverified` means the model's quote is not in the excerpt, so its verdict was not trusted.", ""];
  for (const v of ["contradicted", "unverified", "partial"]) {
    const list = flags.filter((f) => f.s.verdict === v);
    if (!list.length) continue;
    out.push(`## ${v} (${list.length})`, "");
    for (const { r, s } of list) {
      out.push(`- **${r.card}** fn ${r.n} — ${r.sentences[s.i - 1] || "?"}`);
      if (s.note) out.push(`  - ${s.note}`);
      if (s.quote) out.push(`  - > ${s.quote.replace(/\n/g, " ")}`);
      out.push(`  - ${r.url}${r.whole ? "" : " (excerpt)"} · ${r.kind}`);
    }
    out.push("");
  }
  if (unusable.size) out.push("## Pages that were not the cited work", "", ...[...unusable].sort((a, b) => b[1] - a[1]).map(([h, n]) => `- ${h}: ${n}`), "");
  if (errors.length) out.push("## No verdict", "", ...errors.map((r) => `- ${r.card} fn ${r.n}: ${r.error || "?"}`), "");
  if (skipped && skipped.length) {
    const why = new Map();
    for (const s of skipped) why.set(s.why, (why.get(s.why) || 0) + 1);
    out.push("## Not sent (could not read the source)", "", ...[...why].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([w, n]) => `- ${w}: ${n}`), "");
  }
  fs.writeFileSync(REPORT, out.join("\n"));
  return REPORT;
}

/* ---------- main ---------- */
(async () => {
  fs.mkdirSync(PAGES, { recursive: true });
  if (MODE === "report") { console.log("Report: " + path.relative(ROOT, writeReport())); return; }
  if (!PRICE[MODEL]) console.warn(`No price for ${MODEL}; estimates use Opus 5.5's.`);
  const results = loadResults();
  const L = ledger();
  const { cards, pairs, jobs, skipped } = await prepare(results);
  const chars = jobs.reduce((a, j) => a + j.chars, 0);
  console.log(`${cards} cards, ${pairs.length} card–source pairs: ${jobs.length} to check, ${pairs.length - jobs.length - skipped.length} already checked, ${skipped.length} unreadable.`);
  if (MODE === "prepare") {
    console.log(`Input ≈ ${(chars / 3.6 / 1e6).toFixed(2)} M tokens. Estimated cost of checking them all:`);
    for (const m of Object.keys(PRICE)) {
      const batch = jobs.reduce((a, j) => a + estimate(j.chars, m, true, L), 0);
      console.log(`  ${m.padEnd(18)} batch $${batch.toFixed(2)}   direct $${(batch * 2).toFixed(2)}`);
    }
    const why = new Map();
    for (const s of skipped) why.set(s.why, (why.get(s.why) || 0) + 1);
    if (why.size) console.log("Unreadable sources:\n" + [...why].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([w, n]) => `  ${n}  ${w}`).join("\n"));
    if (ARGS.show && jobs[0]) console.log("\n--- first request ---\n" + jobs[0].params.messages[0].content);
    console.log(`\nThis tool has spent $${L.spent.toFixed(2)} so far.`);
    return;
  }
  if (MODE === "direct") await runDirect(jobs, L);
  else await runBatches(jobs, L);
  console.log("Report: " + path.relative(ROOT, writeReport(skipped)));
})().catch((e) => { console.error(e); process.exit(1); });
