#!/usr/bin/env node
"use strict";
/*
  pick-images.js — turn the Commons candidate cache into a REVIEW LIST, and turn a reviewed list
  into a batch file for `.claude/add-images.js`.  Standalone Node helper, zero deps.  Not part of
  the site.

  WHY A REVIEW STEP EXISTS AT ALL.  The scorer in fetch-images.js is a name match, and a name
  match is confidently wrong in exactly the way this site must never be: the top candidate for
  `Jason_E._Lewis`, the palaeoanthropologist who dated the Lomekwi tools, was the official
  portrait of a United States congressman of the same name — public domain, high resolution, no
  watermark, and a different man.  Nothing downstream can catch that.  So the machine RANKS and a
  reader CHOOSES, and the file the reader chose is what ships.

  Usage:
    node .claude/pick-images.js --countries      # emit the 181 country flags (no review needed)
    node .claude/pick-images.js --review [--from=N] [--count=N] [--tag=kind]
    node .claude/pick-images.js --build <chosen.json>   # -> batch for add-images.js
*/

const fs = require("fs");
const path = require("path");
const { readJSON, PAGES_CACHE, FILES_CACHE, usable, score, attributableAuthor, OK_LICENCES, NEEDS_ATTRIBUTION } = require("./fetch-images.js");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(__dirname, "image-cache");

/* One load, one window.  `require` caches, so a second `require("../glossary.js")` against a
   fresh `global.window` runs nothing and hands back an empty table — which reads as a glossary
   that has lost every alias rather than as a module-cache mistake. */
let _corpus = null;
function corpus() {
  if (_corpus) return _corpus;
  global.window = {};
  // glossary.js is TWO files now — its citations and illustrations live in the lazy
  // glossary-extra.js — so load through the shared helper, which merges both. Requiring
  // glossary.js alone yields EMPTY GLOSSARY_IMAGES/GLOSSARY_SOURCES, silently.
  require("./gloss-io.js").loadGlossary(global.window);
  require(path.join(ROOT, "data.js"));
  // the pool is TWO files and an artefact's `image` is in the lazy half — see .claude/artefact-io.js
  global.window.ARTEFACTS = require("./artefact-io.js").loadArtefacts();
  const w = global.window;
  _corpus = {
    G: w.GLOSSARY || {},
    TAGS: w.GLOSSARY_TAGS || {},
    COUNTRY: w.GLOSSARY_MAP_COUNTRY || {},
    TITLES: w.GLOSSARY_TITLES || {},
    ALIASES: w.GLOSSARY_ALIASES || {},
    CARDS: w.CARD_DATA || [],
    ARTEFACTS: w.ARTEFACTS || [],
  };
  return _corpus;
}

/* ------------------------------------------------------------- candidates */

function candidates(slug, page, files) {
  if (!page || !page.files) return [];
  return page.files
    .map((t) => ({ t, info: files[t] }))
    .filter((c) => c.info && usable(c.info) === "ok")
    .map((c) => ({ ...c, s: score(slug, page.article || slug, page.lead, c.t, c.info) }))
    .sort((a, b) => b.s - a.s);
}

/* --------------------------------------------------------------- reviewing */

function review(args) {
  const { G, TAGS, COUNTRY } = corpus();
  const pages = readJSON(PAGES_CACHE, {});
  const files = readJSON(FILES_CACHE, {});
  const from = Number((args.find((a) => a.startsWith("--from=")) || "--from=0").split("=")[1]);
  const count = Number((args.find((a) => a.startsWith("--count=")) || "--count=40").split("=")[1]);
  const tag = (args.find((a) => a.startsWith("--tag=")) || "").split("=")[1];

  const have = global.window.GLOSSARY_IMAGES || {};
  let slugs = Object.keys(G)
    .filter((s) => !COUNTRY[s])
    .filter((s) => !args.includes("--missing") || !have[s])   // only terms still without a picture
    .filter((s) => !tag || (TAGS[s] || []).includes(tag));
  slugs.sort();

  const rows = [];
  for (const slug of slugs) {
    const cands = candidates(slug, pages[slug], files);
    if (!cands.length) continue;
    rows.push({ slug, page: pages[slug], cands });
  }
  const slice = rows.slice(from, from + count);
  console.log(`# ${rows.length} reviewable non-country terms; showing ${from}..${from + slice.length}`);
  for (const r of slice) {
    const kind = (TAGS[r.slug] || [])[0] || "?";
    const art = r.page.article === r.slug.replace(/_/g, " ") ? "" : ` <${r.page.article}>`;
    console.log(`${r.slug} [${kind}]${art}`);
    r.cands.slice(0, 3).forEach((c, i) => {
      const lic = c.info.licence === "pd" ? "" : "  [" + (c.info.licenceName || c.info.licence) + "]";
      console.log(`  ${i} ${c.t.replace(/^File:/, "").replace(/\.(jpg|jpeg|png|webp)$/i, "")}${lic}`);
    });
  }
}

/* --------------------------------------------------------------- countries

   A country term takes its FLAG, and that is a rule rather than a pick.  The alternative is a
   photograph, and a photograph of a country is a photograph of one thing IN it: the top-ranked
   PD candidate for Georgia was a US Navy destroyer visiting Batumi and for Tanzania a giraffe.
   Both are real pictures taken in the right place and neither is a picture of the country.  A
   flag is unambiguous, universally recognised, public domain in every case, carries no
   watermark, and is an SVG, so it is sharp at any size the viewer opens it to.                */

function countries() {
  const { COUNTRY } = corpus();
  const pages = readJSON(PAGES_CACHE, {});
  const files = readJSON(FILES_CACHE, {});
  const out = {};
  const missing = [];
  for (const slug of Object.keys(COUNTRY)) {
    const page = pages[slug];
    if (!page || !page.files) { missing.push(slug + " (no article)"); continue; }
    const flags = page.files.filter((t) => /^File:Flag of /i.test(t) && /\.svg$/i.test(t));
    // The article names many flags (neighbours, organisations); the country's own is the one the
    // article LEADS with, and failing that the one naming the country.
    let chosen = page.lead && flags.includes(page.lead) ? page.lead : null;
    if (!chosen) {
      const want = (page.article || slug).replace(/_/g, " ").replace(/\s*\(.*\)$/, "").toLowerCase();
      chosen = flags.find((t) => t.replace(/^File:Flag of (the )?/i, "").replace(/\.svg$/i, "").toLowerCase() === want) || null;
    }
    if (!chosen) { missing.push(slug + " (no flag among " + flags.length + ")"); continue; }
    const info = files[chosen];
    if (!info || info.missing) { missing.push(slug + " (no metadata)"); continue; }
    if (info.licence !== "pd") { missing.push(slug + " (licence " + info.licence + ")"); continue; }
    out[slug] = chosen;
  }
  console.log(`# ${Object.keys(out).length} country flags resolved, ${missing.length} not`);
  missing.forEach((m) => console.log("  MISS " + m));
  fs.writeFileSync(path.join(OUT_DIR, "chosen-countries.json"), JSON.stringify(out, null, 1));
  console.log("wrote .claude/image-cache/chosen-countries.json");
}

/* ---------------------------------------------------------------- wording

   THE THREE TEXT FIELDS DO THREE DIFFERENT JOBS AND ARE BUILT FROM THREE DIFFERENT PLACES, which
   is the point CLAUDE.md makes about `alt`: a title NAMES the picture for a reader who can see
   it, alt DESCRIBES it to one who cannot, and folding the two together is the commonest way alt
   text ends up useless.  So the title is the TERM (what the picture is of), the alt is the FILE
   (what the picture shows), and the description is Commons' own account of the file — never a
   sentence composed here, because a composed sentence about somebody else's photograph is a
   fabricated fact of exactly the kind the house rules forbid.                                  */

const LANG_RX = /\b(Deutsch|Français|Francais|Español|Espanol|Italiano|Nederlands|Polski|Português|Portugues|Català|Catala|Magyar|Svenska|Suomi|Dansk|Norsk|Türkçe|Turkce|Čeština|Русский|Українська|中文|日本語|한국어|العربية|עברית|Ελληνικά|Slovenščina|Hrvatski|Română|Bahasa)\s*:/;

function englishPart(s) {
  if (!s) return "";
  const m = /English\s*:\s*([\s\S]*)/.exec(s);
  let t = m ? m[1] : s;
  const cut = LANG_RX.exec(t);
  if (cut) t = t.slice(0, cut.index);
  return t.trim();
}

/* Commons file names carry the photographer's camera codes, the museum's accession number, the
   digitising library's shelfmark and a pile-up of "(cropped)" from successive re-crops.  None of
   that describes anything, and left in it is what a reader meets as the picture's alt text. */
function prettyFile(title) {
  let s = title.replace(/^File:/, "").replace(/\.(jpe?g|png|webp|svg)$/i, "").replace(/_/g, " ");
  s = s.replace(/\s*\((?:\d+(?:[x.]\d+)*\s*)?(?:close\s*)?(?:cropped|crop|retouched|restored|edited|detail|photo|version \d+|\d+ of \d+)\)\s*/gi, " ");
  s = s.replace(/\s*-?\s*\b(?:DSC|DSCN|IMG|IMGP|CIMG)[ _]?\d{3,}\b/gi, " ");
  s = s.replace(/\s*-\s*(?:Google Art Project|DPLA)\s*-?\s*[0-9a-f]*\s*/gi, " ");
  s = s.replace(/\s*\bbtv1b\w+\s*/gi, " ");                                   // BnF Gallica shelfmark
  s = s.replace(/\s*\bLCCN\s?\d+\b/gi, " ").replace(/\s*\bBHL\d+\b/gi, " ");
  s = s.replace(/\s*\b(?:KAS|NPG|MNB|Ma|Inv\.?|inv\.?|no\.?)\s?\d{3,}\b/g, " ");
  s = s.replace(/\s*-\s*Walters\s+\d+\s*/gi, " ");
  s = s.replace(/\s*\bWGA\d+\b/g, " ").replace(/\s*\bMET\s+[A-Za-z]{0,3}[\d.]{3,}[\w.]*/g, " ");
  s = s.replace(/^\s*(?:Ubekendt|Unknown|Anonymous|Ukjent|Okänd)\s*,\s*/i, "");
  s = s.replace(/\s*\b\d{6,}\b\s*/g, " ");
  /* An emptied bracket is the residue of the rules above — a Flickr id, an accession number or a
     find reference stripped from inside one — and it reads as a picture whose caption has lost a
     word ("Postmedieval gunflints (FindID )").  A bracket left holding only punctuation goes with
     whatever was in it, and a word that only ever precedes a number goes with the bracket. */
  s = s.replace(/\s*\(\s*(?:FindID|ID|No\.?|Nr\.?|inv\.?|n[°º])?\s*[\s,;:.\-–—]*\)/gi, "");
  s = s.replace(/\s*,\s*(?=,)/g, "").replace(/\s*,\s*$/, "");                  // ", ," and a trailing comma
  s = s.replace(/\s*[-—]\s*$/, "").replace(/\s{2,}/g, " ").trim();
  return s;
}

/* THE LICENCE LINE IS PART OF THE CAPTION, and for a CC picture it is the ATTRIBUTION the licence
   requires rather than a courtesy.  CC BY and CC BY-SA grant the use on condition the creator is
   named, the licence is identified and the source can be reached; the caption carries the first
   two and the `credit` field is the link that carries the third.  A public-domain file needs none
   of it and says so plainly, which is also the line that shows the corpus clearing its own bar. */
function provenance(info) {
  const n = (info.licenceName || "").trim();
  if (info.licence === "pd") return n && !/^public domain$/i.test(n)
    ? `Public domain (${n}), via Wikimedia Commons.`
    : "Public domain, via Wikimedia Commons.";
  const who = attributableAuthor(info);
  return `${who}, ${n || "Creative Commons"}, via Wikimedia Commons.`;
}

function termTitle(slug, titles) {
  if (titles[slug]) return titles[slug];
  return slug.replace(/_/g, " ").replace(/\s*\([^)]*\)$/, "").trim();
}

/* A CAPTION IN A SCRIPT THE READER CANNOT READ IS NOT A CAPTION.  `englishPart` splits a
   multilingual Commons description and takes the English; where the uploader wrote only in their
   own language there is no English part to take, and the raw text then arrives under an English
   term as a line of Belarusian or Arabic.  Translating it here would be composing a sentence about
   somebody else's photograph, which is the one thing this pipeline must not do — so the text is
   simply not used, and the cleaned file name carries the caption instead. */
const NON_LATIN_RX = /[Ѐ-ԯ֐-ࣿऀ-෿฀-࿿ᄀ-ᇿ぀-ヿ㐀-鿿가-힯]/g;
function mostlyNonLatin(s) {
  const letters = s.replace(/[^\p{L}]/gu, "");
  if (letters.length < 8) return false;
  return (s.match(NON_LATIN_RX) || []).length / letters.length > 0.3;
}

function imageObject(slug, file, info, titles) {
  const alt = prettyFile(file);
  let desc = englishPart(info.desc || "");
  if (mostlyNonLatin(desc)) desc = "";
  if (desc.length < 15 || desc.replace(/\W+/g, "").toLowerCase() === alt.replace(/\W+/g, "").toLowerCase()) desc = "";
  if (desc.length > 300) {
    const cut = desc.slice(0, 300);
    const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
    desc = stop > 120 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, "") + "…";
  }
  if (!desc) {
    const bits = [alt];
    /* A Commons USERNAME is not an attribution a reader wants in a caption — the credit link
       carries the full author line, which is where an attribution belongs. */
    if (info.licence === "pd" && info.artist && !/^(unknown|anonymous|user:|see (file )?(history|source))/i.test(info.artist) && info.artist.length < 90) bits.push(info.artist);
    if (info.date && /\d{3}/.test(info.date) && info.date.length < 40) bits.push(info.date.replace(/\s*\.\s*$/, ""));
    desc = bits.join(". ").replace(/\.?$/, ".");
  } else if (!/[.!?…]$/.test(desc)) desc += ".";

  /* Where the file is named after the subject the cleaned name IS the title, and an alt that
     repeats the title is the useless kind CLAUDE.md warns about.  Commons' description is a
     description of the PICTURE, so its opening clause is exactly what alt wants. */
  let altOut = alt;
  if (desc && altOut.toLowerCase() === termTitle(slug, titles).toLowerCase()) {
    const first = desc.split(/(?<=[.;])\s/)[0].replace(/\.$/, "").trim();
    if (first.length > altOut.length + 4 && first.length <= 140) altOut = first;
  }
  desc += " " + provenance(info);
  /* An SVG keeps its own file — it is scalable, so it is sharp at any size the viewer opens it
     to, and it is a fraction of the bytes.  A raster takes the 1600px rendering rather than the
     original, which is high-resolution for a frame that caps at 680 CSS px while sparing the
     reader a 40 MB museum scan. */
  const src = /\.svg$/i.test(file) ? info.url : (info.thumb || info.url);
  return {
    src,
    title: termTitle(slug, titles),
    desc,
    credit: info.page,
    alt: altOut,
  };
}

/* --------------------------------------------------------------- the build */

function build() {
  const { G, TITLES: titles, ALIASES: AL, CARDS, ARTEFACTS } = corpus();
  const pages = readJSON(PAGES_CACHE, {});
  const files = readJSON(FILES_CACHE, {});

  /* Two kinds of reviewed list, and the FILE NAME says which.  `chosen-N.json` numbers the
     candidates on a term's own Wikipedia article (fetch-images.js); `chosen-sN.json` numbers the
     Commons search results (search-images.js).  Both are indices rather than file names on
     purpose: a name copied out of a review listing has lost its extension, and `.jpg` guessed
     for a `.JPG` resolves to nothing — which drops the picture silently. */
  const searches = readJSON(path.join(OUT_DIR, "searches.json"), {});
  const searchHits = (slug) => ((searches[slug] || {}).hits || []).filter((h) => files[h] && usable(files[h]) === "ok");

  const chosen = {};   // slug -> File:
  const chosenArt = {}; // artefact id -> File:
  for (const f of fs.readdirSync(OUT_DIR).filter((n) => /^chosen-.*\.json$/.test(n)).sort()) {
    const fromSearch = /^chosen-(s|a)\d/.test(f);
    const d = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), "utf8"));
    for (const [key, v] of Object.entries(d)) {
      let file = null;
      if (typeof v === "number") {
        file = fromSearch ? searchHits(key)[v] : (candidates(key, pages[key], files)[v] || {}).t;
        if (!file) { console.warn("  no candidate " + v + " for " + key + " (" + f + ")"); continue; }
      } else if (typeof v === "string") file = v;
      if (!file) continue;
      /* An artefact is keyed `artefact:<id>`; a candidate list carries a `|wide` suffix from the
         CC-inclusive sweep and a `|q…` one from a hand-written round, so every sweep's results live
         in one cache without overwriting each other.  Any trailing `|token` is stripped, since a
         glossary slug and an artefact id never contain a pipe and a later round only needs a name. */
      const id = key.replace(/\|[A-Za-z0-9]+$/, "");
      if (id.startsWith("artefact:")) chosenArt[id.slice(9)] = file;
      else chosen[id] = file;
    }
  }

  /* ONE PICTURE MAY NOT STAND FOR TWO TERMS.  Several sibling terms share a Wikipedia article, so
     the same file ranks top for all of them; a reader meeting the identical photograph under
     "Minoan civilisation" and "Minoan trade with Egypt" learns that Folio is guessing.  The first
     term to claim a file keeps it and the rest go without. */
  /* A CAST IS NOT THE THING, and on a study card the difference matters.  The top public-domain
     picture for the Venus of Willendorf is a white plaster cast on a mounting block with an
     accession number inked on it — a faithful likeness of the figurine and not the figurine, and
     nothing in its Commons description says so.  Palaeoanthropology is full of these, because
     the originals are rarely lent to a photographer, and most of them ARE labelled: "museum
     replica", "(cast)", "Facsimile", "reconstitution".  A labelled cast is honest and stays; an
     unlabelled one is dropped, because the reader has no way to tell.
     It reads the FILE NAME and the CATEGORIES and deliberately not the free-text description:
     Rutherford B. Hayes's portrait was dropped by a first cut because his biography mentions
     votes CAST.  And it cannot catch everything — the Willendorf cast says nothing anywhere in
     its metadata and was found by looking at the picture, which is why the sample check exists. */
  const CAST_RX = /\b(cast|casts|replica|replika|facsimile|nachbildung|maquette|diorama|reconstruction|reconstitution|reconstruccion)\b/i;
  const DECLARED_RX = /\b(cast|replica|facsimile|reconstruction|reconstitution|reconstruccion|nachbildung|model|copy)\b/i;

  const seen = new Map();
  const glossary = {};
  const dropped = [];
  for (const slug of Object.keys(chosen)) {
    if (!G[slug]) { dropped.push(slug + " (no such term)"); continue; }
    const file = chosen[slug];
    const info = files[file];
    if (!info || info.missing) { dropped.push(slug + " (no metadata)"); continue; }
    /* The LICENCE and the ATTRIBUTION are re-checked here rather than trusted from the review
       list, because this is the last gate before the file reaches the site.  Resolution and
       format are NOT re-checked: the country flags are chosen by a rule of their own and are
       SVG on purpose, so `usable()` would refuse every one of them. */
    if (!OK_LICENCES.has(info.licence)) { dropped.push(slug + " (licence " + info.licence + ")"); continue; }
    if (NEEDS_ATTRIBUTION.has(info.licence) && !attributableAuthor(info)) { dropped.push(slug + " (no attributable author)"); continue; }
    if (seen.has(info.url)) { dropped.push(slug + " (same file as " + seen.get(info.url) + ")"); continue; }
    const obj = imageObject(slug, file, info, titles);
    if (CAST_RX.test(`${file} ${info.categories}`) && !DECLARED_RX.test(`${obj.alt} ${obj.desc}`)) {
      dropped.push(slug + " (undeclared cast or replica)"); continue;
    }
    /* With no English description the file NAME carries the caption, so a file named in another
       script leaves the picture with no text a reader of this site can use — alt included, which
       is the one field that exists for the reader who cannot see it at all. */
    if (mostlyNonLatin(obj.alt)) { dropped.push(slug + " (no caption in Latin script)"); continue; }
    seen.set(info.url, slug);
    glossary[slug] = obj;
  }

  /* A card takes its ANSWER TERM's picture.  That is not a shortcut: the pairing rule already
     says every card ships with a glossary entry for its own answer, so the term IS the card's
     subject, and one picture per subject is what keeps the two surfaces agreeing. */
  const norm = (s) => String(s || "").toLowerCase().replace(/[_\s]+/g, " ").trim();
  const byName = {};
  Object.keys(G).forEach((k) => { byName[norm(k)] = k; });
  Object.keys(AL).forEach((k) => (AL[k] || []).forEach((a) => { if (!byName[norm(a)]) byName[norm(a)] = k; }));
  /* A KEY MAY CARRY A DISAMBIGUATOR THE CARD DOES NOT.  `Lucy_(Australopithecus)` is the glossary's
     key and `Lucy` is what the card answers, and matching only the full key leaves that card with
     no picture while its own term has one.  Registered second, so a bare key of the same name
     always wins. */
  Object.keys(G).forEach((k) => {
    const bare = norm(k.replace(/\s*\([^)]*\)$/, ""));
    if (bare && !byName[bare]) byName[bare] = k;
  });
  /* AND THE CARD'S ANSWER IS OFTEN THE PLURAL OF THE TERM — "Denisovans", "Mesara tholos tombs",
     "bronze tripod cauldrons".  The site's own auto-linker pluralises a glossary key when it scans
     prose; this is the same rule read backwards, and without it the pairing rule ("every card ships
     with a glossary entry for its own answer") silently stops delivering the picture that entry has.
     A COMPOUND answer is deliberately NOT resolved to its head noun: "Euboean trade" is not Euboea
     and "Chalcis and Eretria" is neither of them, and giving those a term's picture would be the
     one-picture-two-subjects fault the dedupe below exists to prevent. */
  const resolveTerm = (answer) => {
    const n = norm(answer);
    if (byName[n]) return byName[n];
    for (const sing of [n.replace(/ies$/, "y"), n.replace(/es$/, ""), n.replace(/s$/, "")]) {
      if (sing !== n && byName[sing]) return byName[sing];
    }
    return null;
  };

  const cards = {};
  const cardless = [];
  for (const c of CARDS) {
    if (c.image && c.image.src) continue;          // never overwrite a picture already chosen
    if (c.video && c.video.src) continue;          // one frame per card
    const term = resolveTerm(c.answerText);
    if (!term) { cardless.push(c.id + ' "' + c.answerText + '" (no glossary term)'); continue; }
    if (!glossary[term]) continue;
    cards[c.id] = { ...glossary[term], title: c.answerText };
  }

  /* An artefact's picture is keyed by its own id and titled with its own NAME.  It does not share
     the glossary's one-file-one-subject register: an artefact and a glossary term may legitimately
     be the same object seen twice (the Mask of Agamemnon is both), so the dedupe map is separate —
     but WITHIN the reliquary a file is still claimed once. */
  const artefacts = {};
  const seenArt = new Map();
  for (const a of ARTEFACTS) {
    const file = chosenArt[a.id];
    if (!file) continue;
    if (a.image && a.image.src) { dropped.push("artefact " + a.id + " (already has a picture)"); continue; }
    const info = files[file];
    if (!info || info.missing) { dropped.push("artefact " + a.id + " (no metadata)"); continue; }
    if (!OK_LICENCES.has(info.licence)) { dropped.push("artefact " + a.id + " (licence " + info.licence + ")"); continue; }
    if (NEEDS_ATTRIBUTION.has(info.licence) && !attributableAuthor(info)) { dropped.push("artefact " + a.id + " (no attributable author)"); continue; }
    if (seenArt.has(info.url)) { dropped.push("artefact " + a.id + " (same file as " + seenArt.get(info.url) + ")"); continue; }
    const obj = imageObject(a.id, file, info, {});
    if (CAST_RX.test(`${file} ${info.categories}`) && !DECLARED_RX.test(`${obj.alt} ${obj.desc}`)) {
      dropped.push("artefact " + a.id + " (undeclared cast or replica)"); continue;
    }
    if (mostlyNonLatin(obj.alt)) { dropped.push("artefact " + a.id + " (no caption in Latin script)"); continue; }
    seenArt.set(info.url, a.id);
    /* AN ARTEFACT'S IMAGE CARRIES ONLY src / credit / alt, which is what `serializeArtefacts` in
       app.js writes and what `artefactArtHTML` reads — the entry already has its own name, date,
       origin and five-sentence description, so a picture title and caption would say it twice.
       That makes `credit` the ONLY place the attribution can go, and it renders as plain text
       rather than as a link, so the whole line goes in it: who made the picture, under what
       licence, and where the file is. */
    artefacts[a.id] = {
      src: obj.src,
      credit: provenance(info).replace(/\.$/, "") + " — " + info.page,
      alt: obj.alt,
    };
  }

  const out = { glossary, cards, artefacts };
  fs.writeFileSync(path.join(OUT_DIR, "batch.json"), JSON.stringify(out, null, 1));
  console.log(`glossary images: ${Object.keys(glossary).length}`);
  console.log(`card images:     ${Object.keys(cards).length}`);
  console.log(`artefact images: ${Object.keys(artefacts).length}`);
  if (dropped.length) { console.log(`dropped ${dropped.length}:`); dropped.forEach((d) => console.log("  " + d)); }
  /* Reported rather than silent: a card whose answer resolves to no glossary term breaks the
     card→glossary pairing rule, and the picture pass is where that shows up first. */
  if (cardless.length) { console.log(`${cardless.length} card(s) whose answer names no term:`); cardless.forEach((d) => console.log("  " + d)); }
  console.log("wrote .claude/image-cache/batch.json");
}

module.exports = { candidates, corpus, prettyFile, englishPart };

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes("--countries")) countries();
  else if (args.includes("--review")) review(args);
  else if (args.includes("--build")) build();
  else console.log("see header for usage");
}
