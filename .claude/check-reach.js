#!/usr/bin/env node
/* ============================================================================
   check-reach.js — WHICH SCHOLARLY HOSTS ANSWER FROM THIS SANDBOX

     node .claude/check-reach.js [--all] [--json]

   WHY THIS EXISTS. `docs/citation-plan.md`'s Pilot log records that batch 0 of
   the card citation pass was attempted and STOPPED, because "this sandbox's
   egress policy blocks every scholarly host, so no source could be opened and
   none was cited". That sentence was true when it was written and is the reason
   a whole pass did not happen — and on 2026-09-12 it was measured again and is
   no longer true: Europe PMC, DOAJ, Crossref, archive.org's full text, Persée,
   OpenEdition, the Stanford Encyclopedia, BMCR, JSTOR's stable pages and
   OpenStax all serve real content.

   A CLAIM ABOUT THE ENVIRONMENT GOES STALE SILENTLY AND STOPS WORK THAT WOULD
   HAVE SUCCEEDED, which is the worst shape a note in CLAUDE.md can have — so the
   answer is a command rather than a sentence, exactly as `check-sizes.js` is the
   answer to "how big is the eager path". Quote nothing from a past run; run it.

   ============================================================================
   IT REPORTS FOUR OUTCOMES AND THE MIDDLE TWO ARE THE POINT

     OK        a 200 carrying the content asked for.
     WALL      a 200 that is a bot challenge — "Just a moment…", "Enable
               JavaScript and cookies". `docs/glossary-citation-plan.md` records
               five varieties of 200-status error document; a status code alone
               cannot tell them from a source, so every probe also asks for a
               word the real page must contain.
     BUSY      429. **This is not a blocked host.** Probing a dozen hosts in a
               few seconds rate-limits several of them, and Crossref and Commons
               both answered 200 on a re-probe six seconds apart having just
               returned 429. A 429 means SLOW DOWN, and recording it as "shut"
               would retire a host that works.
     SHUT      403 or a refused connection — a real wall (britannica.com,
               iranicaonline.org, whc.unesco.org).

   THE PROBES ARE SPACED FOR THAT REASON (`GAP`), so a run takes a minute rather
   than seconds. `--all` adds the slower per-article probes.

   Not part of the site.
   ============================================================================ */

"use strict";

const JSON_OUT = process.argv.includes("--json");
const ALL = process.argv.includes("--all");
const GAP = 1500;                       // ms between probes — see BUSY above

/* DECLARED, with what each is FOR, so a row that stops answering names the work it was carrying. */
const HOSTS = [
  ["Crossref API",        "https://api.crossref.org/works/10.1038/nature22336", "Nature",
   "every citation's authors and year — check-citations.js reads it"],
  ["Europe PMC API",      "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=Neanderthal&format=json&pageSize=1", "hitCount",
   "a paper walled at its publisher is usually open at its Europe PMC copy"],
  ["DOAJ API",            "https://doaj.org/api/search/articles/archaeology?pageSize=1", "results",
   "finds the open-access ARTICLES"],
  ["archive.org fulltext","https://archive.org/stream/historyofsanskri00macduoft/historyofsanskri00macduoft_djvu.txt", "Sanskrit",
   "the out-of-copyright reference shelf, searchable"],
  /* PERSÉE IS TWO ANSWERS AND THIS ROW USED TO GIVE ONE.  The ARTICLE page opens and
     carries the whole bibliographic record — authors, journal, volume, pages, DOI — which
     is what a citation is written from; the PDF behind it answers 403 with an ALTCHA
     proof-of-work page, so the FULL TEXT cannot be read from here at all (measured Sep 2026,
     while re-sourcing the China mythology cards, where three modern French articles were
     found and none could be opened).  The distinction is the whole point: a metadata-only
     host lets you CITE a work you have read elsewhere and never lets you VERIFY a claim,
     and a row saying only "Persée: OK" sends the next session looking for prose it cannot get. */
  ["Persée (article)",    "https://www.persee.fr/doc/rhr_0035-1423_1990_num_207_4_1698", "Mathieu",
   "French sinology and archaeology — the record, not the text"],
  ["Persée (PDF)",        "https://www.persee.fr/docAsPDF/rhr_0035-1423_1990_num_207_4_1698.pdf", "%PDF",
   "the full text — altcha-gated; a claim cannot be checked from here"],
  ["OpenEdition",         "https://journals.openedition.org/", "OpenEdition",
   "French and Mediterranean humanities journals"],
  ["Stanford Encyclopedia","https://plato.stanford.edu/entries/levels-org-biology/", "organization",
   "philosophy and the philosophy of science; states its own preferred citation"],
  ["BMCR",                "https://bmcr.brynmawr.edu/2019/2019.04.37/", "Bryn Mawr",
   "reviews that carry the classical monographs' arguments"],
  ["OpenStax",            "https://openstax.org/books/biology-2e/pages/1-2-themes-and-concepts-of-biology", "Biology",
   "the science collections' textbook spine"],
  ["Wikimedia Commons API","https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&format=json&titles=File:Tower_of_Jericho.jpg&iiprop=url", "imageinfo",
   "every picture's licence, author and real src"],
  ["JSTOR (stable page)", "https://www.jstor.org/stable/608851", "",
   "metadata only — the full text is not open"],
  ["Britannica",          "https://www.britannica.com/biography/Kanishka", "Kanishka",
   "not citable here anyway; recorded so the wall is not re-tested every session"],
  ["Encyclopaedia Iranica","https://iranicaonline.org/articles/kanishka", "Kanishka",
   "Central Asian history — walled, so that ground needs another route"],
  ["UNESCO World Heritage","https://whc.unesco.org/en/list/", "World Heritage",
   "site inscriptions and dates"],
];

const EXTRA = [
  ["PMC article page",    "https://pmc.ncbi.nlm.nih.gov/articles/PMC7264472/", "Fechner",
   "the corpus cites these heavily; the API above serves the same articles"],
  ["OpenAlex API",        "https://api.openalex.org/works?search=Kushan&per_page=1", "results",
   "a second index when Crossref is thin"],
  ["Wikipedia API",       "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&format=json&titles=Kanishka", "Kanishka",
   "where research STARTS — never a citable source"],
];

const WALL_RX = /Just a moment|Enable JavaScript and cookies|Checking your browser|Access Denied|\baltcha\b|\bcaptcha\b/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probe(url, want) {
  let res;
  try {
    res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64)" } });
  } catch (e) { return { state: "SHUT", detail: String(e.message || e).slice(0, 60) }; }
  if (res.status === 429) return { state: "BUSY", detail: "429 — slow down and retry, NOT a wall" };
  if (!res.ok) return { state: "SHUT", detail: String(res.status) };
  let body = "";
  try { body = await res.text(); } catch (e) { return { state: "SHUT", detail: "body: " + String(e.message || e).slice(0, 40) }; }
  if (WALL_RX.test(body.slice(0, 4000))) return { state: "WALL", detail: "200, bot challenge" };
  if (want && !body.toLowerCase().includes(String(want).toLowerCase()))
    return { state: "WALL", detail: "200, " + body.length + " bytes, no “" + want + "”" };
  return { state: "OK", detail: body.length + " bytes" };
}

(async () => {
  const list = ALL ? HOSTS.concat(EXTRA) : HOSTS;
  const out = [];
  if (!JSON_OUT) console.log("Scholarly hosts, measured from this sandbox — " + new Date().toISOString().slice(0, 10) + "\n");
  for (const [name, url, want, purpose] of list) {
    const r = await probe(url, want);
    out.push({ name, url, purpose, ...r });
    if (!JSON_OUT) console.log("  " + r.state.padEnd(5) + " " + name.padEnd(24) + r.detail.padEnd(34) + purpose);
    await sleep(GAP);
  }
  if (JSON_OUT) { console.log(JSON.stringify(out, null, 2)); return; }
  const n = (s) => out.filter((o) => o.state === s).length;
  console.log("\n  " + n("OK") + " answering, " + n("WALL") + " behind a bot wall, " +
    n("SHUT") + " shut, " + n("BUSY") + " rate-limited on this run.");
  if (n("BUSY")) console.log("  A BUSY row is not a shut host — re-run it on its own before recording anything.");
})();
