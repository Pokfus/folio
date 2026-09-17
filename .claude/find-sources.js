#!/usr/bin/env node
/* find-sources.js — candidate citations for a card, in the house's Chicago note form.
 *
 *   node .claude/find-sources.js "<search terms>" [--n=12] [--any] [--cited] [--check] [--from=1990]
 *
 * Every new card carries at least SRC_TARGET citations, each ending in a link the reader can follow
 * and the MAJORITY labelled [Open access] (see add-card.js and docs/citation-plan.md). Finding those
 * by hand — a web search, then a page fetch to learn whether the full text is actually free — costs
 * several calls per source and still gets the open-access question wrong, because a landing page
 * showing an abstract looks exactly like one showing the article.
 *
 * So ask OpenAlex instead. Its API is keyless, returns JSON, and carries the two things a hand search
 * cannot give cheaply: `open_access.is_oa` as a machine-readable fact, and a DOI. This prints ready
 * citation strings with the OA ones marked, so the judgement left to a person is the one that actually
 * needs judging — whether the work is any good and whether it supports the claim.
 *
 * IT PRINTS CANDIDATES, IT DOES NOT PICK THEM. OpenAlex indexes predatory journals alongside good
 * ones, so `venue` and `cited by` are printed beside every row, and a source goes on a card only after
 * a person has looked at it. Never paste a row unread: the whole point of the citation rule is that a
 * reader can check the claim, and a citation nobody opened is one nobody can.
 *
 * THREE FLAGS EARNED THEIR PLACE BY GETTING IT WRONG FIRST.
 * · Ranking is by RELEVANCE, not citations. Sorting a broad search by cited_by_count surfaces the
 *   famous rather than the pertinent — a query about the patriotic education campaign returned Spivak
 *   on the subaltern, 1,066 citations and nothing to do with it. `--cited` restores that order for the
 *   times the landmark work on a topic is what is wanted.
 * · `--check` FETCHES each link and prints what came back, because `is_oa: true` plus a publisher URL
 *   is not yet a link a reader can follow: Wiley, Taylor & Francis and SAGE all answer a non-browser
 *   client with 403 exactly as a paywall would. A repository copy — an institutional eprint, PMC,
 *   OpenEdition, ageconsearch — serves the PDF to anyone and answers 200. Prefer those.
 * · `--any` drops the open-access filter, for the landmark work a claim is actually built on.
 *
 * AND OPENALEX SOMETIMES INVENTS THE GIVEN NAME. It reconciles an initialled byline against its own
 * author index, so "H. M. Kramer" on a 2004 article about the occupation of Japan came back as
 * "Hilton Kramer", an American art critic who had nothing to do with it. That is the exact error
 * check-citations.js exists to catch, and it lands in that tools SOFTEST category (a given name
 * Crossref only abbreviates), which is easy to skim past. Old digitised journals are worse still:
 * the Crossref record for the Bulletin of Concerned Asian Scholars carries "Howard B. Schonbcrgcr"
 * and a title reading "T.A. Bison". RUN check-citations.js ON EVERY CARD, and where the two
 * disagree, prefer a source whose record is clean over one you have had to correct.
 *
 * AND OPENALEX SOMETIMES INVENTS THE GIVEN NAME. It reconciles an initialled byline against its own
 * author index, so "H. M. Kramer" on a 2004 article about the occupation of Japan came back as
 * "Hilton Kramer" — an American art critic who had nothing to do with it. That is the exact error
 * check-citations.js exists to catch, and it lands in that tool's SOFTEST category ("a given name
 * Crossref only abbreviates"), which is easy to skim past. Old digitised journals are worse still:
 * Crossref's own record for the Bulletin of Concerned Asian Scholars carries "Howard B. Schonbcrgcr"
 * and a title reading "T.A. Bison". RUN check-citations.js ON EVERY CARD, and where the two disagree,
 * prefer a source whose record is clean over one you have had to correct.
 */
"use strict";

const https = require("https");
const http = require("http");

const args = process.argv.slice(2);
const query = args.filter((a) => !a.startsWith("--")).join(" ");
const opt = (name, dflt) => {
  const a = args.find((x) => x.startsWith("--" + name + "="));
  return a ? a.slice(name.length + 3) : dflt;
};
if (!query) {
  console.error('usage: node .claude/find-sources.js "<search terms>" [--n=12] [--any] [--cited] [--check] [--from=1990]');
  process.exit(1);
}

const N = Math.min(50, Math.max(1, parseInt(opt("n", "12"), 10) || 12));
const FROM = opt("from", "");
const ANY = args.includes("--any");
const CITED = args.includes("--cited");
const CHECK = args.includes("--check");

const filters = ["type:article|book-chapter|book"];
if (!ANY) filters.push("is_oa:true");
if (FROM) filters.push("from_publication_date:" + FROM + "-01-01");

const url = "https://api.openalex.org/works?search=" + encodeURIComponent(query) +
  "&filter=" + encodeURIComponent(filters.join(",")) +
  (CITED ? "&sort=cited_by_count:desc" : "") +
  "&per_page=" + N + "&mailto=folio@example.com";

/* OpenAlex answers 429 when a burst of lookups arrives from one address, which a card needing five
   citations reaches quickly. Back off and try again rather than failing the run, since the alternative
   is a half-researched card and a person tempted to fill the gap from memory. */
function getJSON(u, tries) {
  return new Promise((resolve, reject) => {
    https.get(u, { headers: { "User-Agent": "folio-find-sources/1.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return getJSON(res.headers.location, tries).then(resolve, reject);
      }
      if (res.statusCode === 429 && (tries || 0) < 3) {
        res.resume();
        const wait = 4000 * ((tries || 0) + 1);
        console.error("  (rate limited by OpenAlex — waiting " + (wait / 1000) + "s)");
        return setTimeout(() => getJSON(u, (tries || 0) + 1).then(resolve, reject), wait);
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error("HTTP " + res.statusCode + (res.statusCode === 429 ? " — rate limited; wait a minute and retry" : ""))); }
      let s = "";
      res.setEncoding("utf8");
      res.on("data", (d) => (s += d));
      res.on("end", () => { try { resolve(JSON.parse(s)); } catch (e) { reject(e); } });
    }).on("error", reject);
  });
}

// what a reader actually gets when they follow the link — status and content type, redirects followed
function head(u, depth) {
  return new Promise((resolve) => {
    if ((depth || 0) > 5) return resolve("too many redirects");
    let done = false;
    const finish = (v) => { if (!done) { done = true; resolve(v); } };
    let lib;
    try { lib = new URL(u).protocol === "http:" ? http : https; } catch (e) { return finish("bad url"); }
    const req = lib.get(u, { headers: { "User-Agent": "Mozilla/5.0 (folio-find-sources)" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        let next;
        try { next = new URL(res.headers.location, u).toString(); } catch (e) { return finish("bad redirect"); }
        return head(next, (depth || 0) + 1).then(finish);
      }
      const ct = String(res.headers["content-type"] || "").split(";")[0];
      res.resume();
      finish(res.statusCode + (ct ? " " + ct : ""));
    });
    req.on("error", (e) => finish("ERR " + (e.code || e.message)));
    req.setTimeout(15000, () => { req.destroy(); finish("TIMEOUT"); });
  });
}

/* Chicago note form, as the corpus already writes it:
     First Last, "Title," <i>Journal</i> 38, no. 3 (2010): 395-422, https://doi.org/... [Open access]
   Up to three authors are named; four or more take the first and "et al.", which is what Chicago
   prescribes for a note and what the citations already on cards do. */
function chicago(w) {
  const names = (w.authorships || []).map((a) => a.author && a.author.display_name).filter(Boolean);
  let who = "";
  if (names.length === 1) who = names[0];
  else if (names.length === 2) who = names[0] + " and " + names[1];
  else if (names.length === 3) who = names[0] + ", " + names[1] + ", and " + names[2];
  else if (names.length > 3) who = names[0] + " et al.";

  const src = w.primary_location && w.primary_location.source;
  const venue = src ? String(src.display_name).replace(/&amp;?/g, "&") : "";
  const b = w.biblio || {};
  const vol = b.volume ? " " + b.volume : "";
  const iss = b.issue ? ", no. " + b.issue : "";
  const pages = b.first_page
    ? (b.last_page && b.last_page !== b.first_page ? b.first_page + "–" + b.last_page : b.first_page)
    : "";
  const year = w.publication_year || "n.d.";
  /* THE DOI IS THE LINK WHENEVER THERE IS ONE, and that is a correctness decision rather than a
     stylistic one. check-citations.js verifies author names and years against Crossref BY DOI, and a
     citation carrying only a repository PDF URL comes back "UNCHECKED — no record to check against,
     which is not the same as correct" — so the one guard against a mangled or invented author name
     never runs. The repository copy is still printed on the info line below, for the reader who needs
     it and for the works that have no DOI at all. */
  const link = w.doi || (w.open_access && w.open_access.oa_url) || "";
  const title = String(w.title || "").replace(/\s+/g, " ").trim().replace(/\.$/, "");

  let s = (who ? who + ", " : "") + "“" + title + ",” ";
  if (venue) s += "<i>" + venue + "</i>" + vol + iss + " (" + year + ")" + (pages ? ": " + pages : "");
  else s += "(" + year + ")";
  if (link) s += ", " + link;
  s += ".";
  if (w.open_access && w.open_access.is_oa) s += " [Open access]";
  return s;
}

getJSON(url).then(async (j) => {
  const rows = j.results || [];
  if (!rows.length) { console.log("no results — try broader terms, or --any to include paywalled work"); return; }
  console.log("# " + (j.meta ? j.meta.count : rows.length) + " matches for: " + query +
    (ANY ? "  (open access NOT required)" : "  (open access only)"));
  console.log("# Read before using. OpenAlex indexes predatory journals too — judge the venue.\n");
  console.log("# Given names may be OPENALEX GUESSES at an initialled byline. Verify with check-citations.js." + String.fromCharCode(10));
  for (let i = 0; i < rows.length; i++) {
    const w = rows[i];
    const src = w.primary_location && w.primary_location.source;
    const flags = [];
    if (src && src.is_in_doaj) flags.push("DOAJ");
    if (w.open_access && w.open_access.is_oa) flags.push("OA");
    if (!(w.open_access && w.open_access.oa_url) && !w.doi) flags.push("NO LINK");
    console.log(String(i + 1).padStart(2) + ". " + chicago(w));
    console.log("    cited by " + (w.cited_by_count || 0) + (flags.length ? "  [" + flags.join(" ") + "]" : "") +
      (src ? "  venue: " + String(src.display_name).replace(/&amp;?/g, "&") +
        (src.host_organization_name ? " (" + src.host_organization_name + ")" : "") : ""));
    const oa = w.open_access && w.open_access.oa_url;
    if (oa && w.doi) console.log("    free copy: " + oa);
    if (CHECK) {
      const link = w.doi || (w.open_access && w.open_access.oa_url) || "";
      console.log("    link: " + (link ? await head(link) : "none"));
    }
    console.log("");
  }
}).catch((e) => { console.error("lookup failed:", e.message); process.exit(1); });
