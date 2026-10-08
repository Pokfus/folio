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

   A SHUT IS ONE CLIENT'S ANSWER, AND THIS TOOL ASKS ONLY ONE.  It measures with
   Node's `fetch`, which is not what a session reads a source with.
   `psychclassics.yorku.ca` — the Psychology collection's whole primary literature —
   serves the full text under a 200 to `curl` and answers 503 to `fetch` here, and
   its certificate chain is incomplete besides, so a plain `curl` refuses it too
   until the intermediate the leaf's own AIA extension names is supplied.  It is
   deliberately NOT a row below: a row reporting SHUT for a host that serves
   everything would be worse than no row.  **Before recording any host as shut, try
   it the other way round** — `docs/psychology-card-plan.md`'s Sourcing section
   carries the commands.

   THE PROBES ARE SPACED FOR THAT REASON (`GAP`), so a run takes a minute rather
   than seconds. `--all` adds the slower per-article probes.

   Not part of the site.
   ============================================================================ */

"use strict";

/* ============================================================================
   NODE'S `fetch` DOES NOT USE THE SANDBOX PROXY, AND WITHOUT THIS THE TOOL LIES.
   Outbound HTTPS here goes through an agent proxy named by HTTPS_PROXY. curl honours it;
   Node's built-in fetch (undici) does not, so the probes went DIRECT and the egress policy
   answered for them instead of the host. Measured Sep 2026, on Node 22:

     web.archive.org   curl 200   fetch 403 "Blocked by egress policy"
     Europe PMC        curl 200   fetch 504
     Crossref          curl 200   fetch 200

   So two hosts that are plainly reachable were reported SHUT — which is exactly the false
   claim about the ENVIRONMENT this whole tool was written to prevent, and the worst possible
   failure for it: a SHUT row stops work that would have succeeded, and nothing contradicts it.

   `NODE_USE_ENV_PROXY=1` fixes it, and setting it with `process.env` HERE DOES NOT WORK —
   undici reads it once at startup, before any of this runs (verified: in-process set still
   returns 403). So the tool re-execs itself with the variable set, once, guarded so it can
   never loop. If you change this, re-check a host the policy blocks directly — Crossref is
   allowed either way and will not show the fault.
   ============================================================================ */
if (process.env.NODE_USE_ENV_PROXY !== "1" && (process.env.HTTPS_PROXY || process.env.https_proxy)) {
  const { spawnSync } = require("child_process");
  const r = spawnSync(process.execPath, [__filename, ...process.argv.slice(2)],
    { stdio: "inherit", env: { ...process.env, NODE_USE_ENV_PROXY: "1" } });
  process.exit(r.status === null ? 1 : r.status);
}

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
  /* THE HOSTS THE CORPUS ACTUALLY LEANS ON WERE MISSING FROM THIS TABLE (added Sep 2026, after
     counting them). Ranked by citations in `data-extra/` + `glossary-extra.js`, the top hosts are
     upload.wikimedia (5,206), commons.wikimedia (4,896), perseus.tufts (4,338), doi.org (4,021),
     archive.org (3,175), penelope.uchicago (1,884), pmc (1,476), bmcr (1,091), web.archive (870),
     history.state.gov (817), hdl.handle.net (699) and sites.dartmouth (474) — and five of those
     twelve had no row here at all. A reachability table that omits the third-biggest host is the
     shape of stale-environment claim this whole tool exists to prevent. */
  /* PERSEUS IS TWO ANSWERS, EXACTLY AS PERSÉE IS ABOVE, AND THIS IS NOT A THEORETICAL SPLIT.
     Measured Sep 2026: `/hopper/text` answered 200 while `/hopper/artifact` answered 503 "Backend
     fetch failed", and the hopper HOME page served 200 from cache throughout — so a single probe of
     perseus.tufts.edu reports the host UP and says nothing about the 39 citations across `gr.js` and
     `glossary-extra.js` (25 distinct objects, the Greece collection's sculpture and vases) that hang
     off the artifact endpoint. Which endpoint you probe IS the answer.
     AND THAT ENDPOINT FLAPS: ten consecutive 503s over about eight minutes, then 200 the next
     evening. Ten failures in a row still did not mean it was gone — see the DOWN branch below. */
  ["Perseus (text)",      "https://www.perseus.tufts.edu/hopper/text?doc=Aesch.%20PB%201", "Aeschylus",
   "4,299 citations — the Greek and Latin texts the collections quote"],
  ["Perseus (artifact)",  "https://www.perseus.tufts.edu/hopper/artifact?name=Athens,+Acropolis+679&object=sculpture", "Acropolis",
   "39 citations — the object records; FLAPS (503 for ~8 min, then 200) while the text endpoint is fine"],
  ["LacusCurtius",        "https://penelope.uchicago.edu/Thayer/E/Gazetteer/Places/Europe/Italy/Lazio/Roma/Rome/_Texts/PLATOP%2A/Argiletum.html", "Argiletum",
   "1,884 citations — Platner-Ashby and the classical texts, the Rome collection's spine"],
  ["Wayback Machine",     "https://web.archive.org/web/20260807193514/https://data.un.org/en/iso/in.html", "General Information",
   "870 citations, and load-bearing since the UNdata migration — every country profile is here now"],
  ["Office of the Historian", "https://history.state.gov/countries/albania", "Albania",
   "817 citations — the recognition guide behind the world-geography backgrounds"],
  ["Handle resolver",     "https://hdl.handle.net/10125/104152", "Shang",
   "699 citations — resolves to whichever repository holds the paper"],
  ["Dartmouth Aegean",    "https://sites.dartmouth.edu/aegean-prehistory/chronology/", "Aegean",
   "474 citations — the Greece collection's concentration this audit exists to reduce"],
  /* THE ATLAS v2 SOURCES (Oct 2026; docs/atlas-v2-design.md §7 Phase 0, .claude/atlas-build/sources.json).
     Each row is the download URL the build fetches, probed by HEAD (see probe). Two things learned on
     the first probe and worth keeping here: github.com's archive/ and api.github.com answer 403 from
     this sandbox, so Cliopatria is pinned at raw.githubusercontent.com under its TAG, not a release
     zip; and ETOPO 2022's THREDDS fileServer paths answer 404 — the GeoTIFFs live under
     /mgg/global/relief/ETOPO2022/data/, and the 15-arc-second grid is 288 tiles of 15° under
     …/15s/15s_surface_elev_gtif/ETOPO_2022_v1_15s_N<lat>E|W<lon>_surface.tif. */
  ["Natural Earth (CDN)",  "https://naciscdn.org/naturalearth/10m/physical/ne_10m_coastline.zip", "HEAD",
   "Atlas v2 — the 10m coastline, admin-0 and populated places (PD)"],
  ["Cliopatria (raw, tag)","https://raw.githubusercontent.com/Seshat-Global-History-Databank/cliopatria/v0.2.0/cliopatria.geojson.zip", "HEAD",
   "Atlas v2 — the polity steps (CC BY 4.0); github.com/…/archive and api.github.com are 403 here"],
  ["ETOPO 2022 (NOAA)",    "https://www.ngdc.noaa.gov/mgg/global/relief/ETOPO2022/data/60s/60s_surface_elev_gtif/ETOPO_2022_v1_60s_N90W180_surface.tif", "HEAD",
   "Atlas v2 — relief (PD); the THREDDS paths are 404, this one answers"],
  ["HydroSHEDS",           "https://data.hydrosheds.org/file/hydrolakes/HydroLAKES_polys_v10_shp.zip", "HEAD",
   "Atlas v2 — HydroLAKES (CC BY 4.0); HydroRIVERS is BLOCKED by its licence (sources.json `blocked`)"],
  ["Natural Earth rivers", "https://naciscdn.org/naturalearth/10m/physical/ne_10m_rivers_lake_centerlines_scale_rank.zip", "HEAD",
   "Atlas v2 — the rivers (PD), the stand-in for HydroRIVERS"],
  ["OSM land polygons",    "https://osmdata.openstreetmap.de/download/land-polygons-complete-4326.zip", "HEAD",
   "Atlas v2 — the finest coastline, a data file of its own (ODbL)"],
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
  /* A ROW WHOSE WORD IS "HEAD" IS A DOWNLOAD, NOT A PAGE (Oct 2026, the Atlas v2 sources): the
     files are hundreds of megabytes to a gigabyte, so the probe asks only whether the host answers
     for the file and how big it says it is. The sha256 pins in .claude/atlas-build/sources.json are
     the test of the bytes themselves; this is the test of the door. */
  if (want === "HEAD") {
    try { res = await fetch(url, { method: "HEAD", redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64)" } }); }
    catch (e) { return { state: "DOWN", detail: String(e.message || e).slice(0, 52) }; }
    if (res.status === 429) return { state: "BUSY", detail: "429 — slow down and retry, NOT a wall" };
    if (res.status >= 500) return { state: "DOWN", detail: res.status + " — origin not answering" };
    if (!res.ok) return { state: "SHUT", detail: String(res.status) };
    const len = Number(res.headers.get("content-length")) || 0;
    return { state: "OK", detail: "HEAD 200" + (len ? ", " + (len / 1048576).toFixed(0) + " MB" : "") };
  }
  try {
    res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64)" } });
  } catch (e) {
    /* A THROW IS NOT A REFUSAL EITHER. The host may be dead (ENOTFOUND) or the sweep may simply
       have been cut off mid-connection — measured Sep 2026, the Wayback row returned 27,019 bytes
       on one run and threw "fetch failed" on the next, four minutes apart, with nothing changed.
       The tool cannot tell those apart from one probe, so it says so and keeps the message, where
       a SHUT row would have been a claim it had not earned. */
    return { state: "DOWN", detail: String(e.message || e).slice(0, 52) };
  }
  if (res.status === 429) return { state: "BUSY", detail: "429 — slow down and retry, NOT a wall" };
  /* A 5xx IS THE ORIGIN NOT ANSWERING, WHICH IS A DIFFERENT FACT FROM A REFUSAL, and collapsing
     the two is how this tool would come to say a host is shut when it is merely having a bad
     minute. Measured Sep 2026: Europe PMC returned 503 inside the sweep and 200 on three probes
     spaced four seconds apart; Perseus's artifact endpoint returned 503 on TEN consecutive probes
     over about eight minutes and then 200 the next evening. Ten in a row is not a flake by any
     ordinary standard and it still did not mean the endpoint was dead — a 503 bounds how long you
     watched and nothing else. So the tool reports DOWN and says to re-probe alone rather than
     deciding for you, and NOTHING should be migrated off a host on the strength of a 5xx. */
  if (res.status >= 500) return { state: "DOWN", detail: res.status + " — origin not answering" };
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
    n("SHUT") + " shut, " + n("DOWN") + " not answering, " + n("BUSY") + " rate-limited on this run.");
  if (n("DOWN")) console.log("  A DOWN row may be this sweep's own pressure. Re-probe it on its own before recording it.");
  if (n("BUSY")) console.log("  A BUSY row is not a shut host — re-run it on its own before recording anything.");
})();
