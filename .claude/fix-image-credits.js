#!/usr/bin/env node
/* ============================================================================
   fix-image-credits.js — A CREDIT THAT IS ONLY A LINK

     node .claude/fix-image-credits.js [--dry] [--limit=N] [--kind=cards|glossary|artefacts]
     node .claude/fix-image-credits.js --retrim [--dry]     (no network; applies the BLURB table)

   THE FAULT, AND WHY IT IS THE ONE TO FIX FIRST. A picture on Folio carries
   `desc` (what it shows) and `credit` (whose it is). On a great many items the
   credit is a BARE COMMONS URL and the attribution — the author's name and the
   licence — sits at the END OF THE CAPTION instead, because that is where
   Commons puts it in its own file description.

     desc:   "Lomekwi (Kenya), place of discovery of Kenyanthropus platyops.
              Chartep, CC BY-SA 4.0, via Wikimedia Commons."
     credit: "https://commons.wikimedia.org/wiki/File:Kenyanthropus-Lomekwi.jpg"

   `check-cards.js` reports that caption under `source-in-caption`, and the
   obvious repair — cut the clause — is the WRONG one and would be a licence
   breach: on a CC BY or CC BY-SA file the author's name IS the attribution, and
   the credit beside it does not carry it. `strip-credit-captions.js` says so in
   its own header and refuses to widen for exactly this reason:

     "Stripping those would not remove a duplicate; it would remove the credit,
      on a picture Folio is required to attribute. Do not widen this. Fixing
      that class means writing the credit line properly first."

   THIS IS THAT FIRST STEP. It writes the credit line and TOUCHES NO CAPTION.
   Afterwards `strip-credit-captions.js` removes the caption's tail by its own
   exact-match rule, with nothing lost — the words it cuts are now in the credit
   beside it, which is the only condition under which that cut is safe.

   ============================================================================
   THE ATTRIBUTION IS FETCHED FROM COMMONS, NEVER PARSED OUT OF THE CAPTION, and
   the reason is a measurement rather than caution. The clause's left edge cannot
   be found by rule: an author field is routinely a sentence of its own, and one
   card's reads "No machine-readable author provided. Luna04~commonswiki assumed
   (based on copyright claims).,. CC BY 2.5, via Wikimedia Commons." — three full
   stops inside the attribution. Any regex that finds that boundary also cuts a
   caption whose last sentence merely mentions a museum.

   Commons' own `extmetadata` answers it outright: `Artist` and
   `LicenseShortName` are the two fields the attribution is made of, and they are
   what the caption was built from in the first place (verified on a sample: the
   Kenyanthropus caption's "Chartep, CC BY-SA 4.0" is Commons' Artist and
   LicenseShortName exactly).

   WHAT IT REFUSES, each because the alternative is a worse state than the fault:
    · an item whose credit is NOT a bare URL — that credit is somebody's
      judgement and this tool does not overwrite one;
    · a file Commons returns no LicenceShortName for — a credit naming no
      licence is not a credit, and a guess is worse than the duplicate;
    · a src that is not a Commons file — there is nothing to ask.

   THE HOUSE FORM IS PROSE THEN THE ADDRESS AFTER A FULL STOP, which is what
   `mediaCreditHTML` renders as a link (both that and a bare URL are links since
   Sep 2026). An UNKNOWN author is written as the licence alone rather than as
   the words "Unknown author": public domain requires no attribution, and naming
   a person who is not named is worse than naming nobody.

   Not part of the site.
   ============================================================================ */

"use strict";

const { loadCards, writeCards } = require("./card-io.js");

const DRY = process.argv.includes("--dry");
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith("--" + k + "=")); return a ? a.slice(k.length + 3) : d; };
const LIMIT = Number(arg("limit", "0")) || 0;

const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
const BARE_URL = /^https?:\/\/\S+$/;
/* The same tokens check-cards.js reports on, so this tool's universe is exactly that report's. */
const CAPTION_CREDIT = /via wikimedia commons|public domain,|\bCC[ -]?BY\b|\bCC0\b/i;

/* An Artist field Commons cannot resolve. Written out rather than pattern-matched: "Unknown" is a
   real surname, and the point is to recognise Commons' own placeholders and nothing else. */
const NO_AUTHOR = [
  /^unknown(\s+author)?$/i,
  /^anonymous$/i,
  /^no machine-readable author provided/i,
  /^see (the )?(file )?(description|page)/i,
  /^\s*$/,
];

/* ============================================================================
   COMMONS' PERMISSION BLURBS LAND IN `Artist`, AND THEY ARE NOT AUTHOR NAMES

   A great many Commons files carry a licence-permission TEMPLATE inside the
   Artist field rather than beside it, so what the API hands back is a paragraph:

     "This Photo was taken by Supanut Arunoprayote . Feel free to use any of my
      images, but please mention me as the author and may send me a message. …"

   Written straight into a credit line that is 607 characters of boilerplate under
   a photograph, and one of them shipped a private email address. The photographer
   IS named in every one of them — the blurb is wrapped round a real attribution —
   so the fix is to keep the name and drop the template.

   THE TABLE IS DECLARED AND THE NAMES ARE VERBATIM. It is not pattern-matched,
   for the reason `CROSSREF_WRONG` and `INSTITUTIONAL` are not: a regex clever
   enough to lift a name out of arbitrary prose will eventually lift the wrong
   words, and a credit naming the wrong person is worse than one naming too many.
   Every replacement below is a substring of the blurb it replaces — the
   boilerplate and the punctuation change, never a name — and where a blurb credits
   SEVERAL people (a derivative work, a translation, a vectorisation) all of them
   are kept, because under CC BY-SA all of them are owed a credit.

   Keyed on a distinctive PREFIX of the author field, which is where the template
   always begins; `--retrim` applies it to what is already shipped, with no network.
   ============================================================================ */
const BLURB = [
  ["This illustration was made by ( User:Royonx )", "Michel Royon",
   "permission template; the uploader states the attribution he wants inside it, '© Michel Royon / Wikimedia Commons'"],
  ["This Photo was taken by Supanut Arunoprayote", "Supanut Arunoprayote",
   "permission template wrapped round the photographer's name"],
  ["This image or media was taken or created by Matt H. Wade", "Matt H. Wade",
   "permission template; the rest is a portfolio link and a copyright notice"],
  ["Greater Oklahoma City Chamber and Oklahoma City Convention", "Greater Oklahoma City Chamber and Oklahoma City Convention and Visitors Bureau",
   "the trailing parenthetical is the uploading employee's name and EMAIL ADDRESS, which must not ship in a credit"],
  ["Matteo De Stefano/MUSE This file was uploaded by MUSE", "Matteo De Stefano/MUSE",
   "the rest is Commons' note about which institution uploaded the file"],
  ["Host, Nikolaus Thomas Publisher:", "Host, Nikolaus Thomas",
   "the rest is the publisher of the 1801 volume and a note that the uploader removed the background"],
  ["Historical Atlas by William R. Shepherd 1911 edition derivative work: Cristiano64",
   "William R. Shepherd; derivative work: Cristiano64",
   "both are owed a credit; the rest is the scanning library's courtesy line, which the URL already carries"],
  ["Maison Bonfils (Beirut, Lebanon), photographers :", "Maison Bonfils, Beirut",
   "the rest is the three Bonfils' dates and a guess at which of them took it — genealogy, not attribution"],
  ["Native_Copper_Macro_Digon3.jpg :", "Jonathan Zander; derivative work: Materialscientist",
   "Commons' derivative-work chain; both authors kept, the file names dropped"],
  ["File:Dihydrogen-HOMO-phase-3D-balls.png : Benjah-bmm27", "Benjah-bmm27; derivative work: MikeRun",
   "Commons' derivative-work chain, naming one author twice over two source files"],
  ["User Qwerter at Czech wikipedia: Qwerter", "Qwerter; translated by Michal Maňas; vectorised by Magasjukur2",
   "four contributors, of whom three made the work; the fourth only transferred the file between projects"],
];

/* The licence phrase a credit's author half stops before. Kept in step with strip-credit-captions.js's
   own LICENCE_HALF, which asks the same question of the same strings. */
const LICENCE_START = /^(?:public domain|CC0|CC[ -]?BY(?:[ -]SA)?(?:\s+[\d.]+)?|GFDL|FAL|Attribution)\b/i;

function unblurb(author) {
  const a = norm(author);
  for (const row of BLURB) if (a.startsWith(row[0])) return row[1];
  return a;
}

/* Split a shipped credit into its author half and everything after it, so a blurb can be replaced
   without disturbing the licence, the "via Wikimedia Commons" or the URL. */
function authorHalf(credit) {
  const c = String(credit || "");
  const head = c.split(/\s+https?:\/\//)[0];
  if (/^\s*https?:/.test(head)) return null;
  for (let i = head.length - 1; i >= 0; i--) {
    if (head[i] !== ",") continue;
    if (LICENCE_START.test(head.slice(i + 1).trim())) return { author: head.slice(0, i).trim(), rest: c.slice(i) };
  }
  return null;
}

function commonsFile(src, credit) {
  for (const s of [credit, src]) {
    const m = String(s || "").match(/\/(?:wiki\/)?(?:File|Special:FilePath)[:/]([^/?#]+)/i);
    if (m) return decodeURIComponent(m[1]);
    const t = String(s || "").match(/\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/?#]+)/i);
    if (t) return decodeURIComponent(t[1]);
  }
  return null;
}

/* The Artist field is MARKUP, so the tags come out — and the ENTITIES have to come out with them.
   Commons writes an arrow between two attributed names as `&gt;`, which reached a shipped credit
   reading "José-Manuel Benito Álvarez (España) —&gt; Locutus Borg": the escape is correct in the API's
   own XML and is nonsense in a credit line, where it is rendered through esc() a second time. */
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#039": "'", "#39": "'" };
const strip = (v) => norm(String(v == null ? "" : v)
  .replace(/<[^>]*>/g, " ")
  .replace(/&(#0?39|#x27|amp|lt|gt|quot|apos|nbsp);/gi, (m, k) => ENT[String(k).toLowerCase()] || ENT["#039"] || m));

async function fetchMeta(files) {
  const out = new Map();
  for (let i = 0; i < files.length; i += 20) {
    const chunk = files.slice(i, i + 20);
    const url = "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo" +
      "&iiprop=extmetadata&iiextmetadatafilter=Artist|LicenseShortName&titles=" +
      chunk.map((f) => "File:" + encodeURIComponent(f)).join("|");
    let j = null;
    for (let attempt = 0; attempt < 4 && !j; attempt++) {
      try {
        const r = await fetch(url, { headers: { "User-Agent": "Folio/1.0 (content tooling; contact via repo)" } });
        const txt = await r.text();
        if (txt.trim().startsWith("{")) j = JSON.parse(txt);
        else await new Promise((s) => setTimeout(s, 2500 * (attempt + 1)));   // the rate limiter answers in prose
      } catch (e) { await new Promise((s) => setTimeout(s, 2500 * (attempt + 1))); }
    }
    if (!j || !j.query) { console.error("  ! no answer for a chunk of " + chunk.length + " — left alone"); continue; }
    for (const p of Object.values(j.query.pages || {})) {
      const m = (p.imageinfo && p.imageinfo[0] && p.imageinfo[0].extmetadata) || {};
      const title = String(p.title || "").replace(/^File:/, "").replace(/ /g, "_");
      out.set(title, { artist: strip(m.Artist && m.Artist.value), lic: strip(m.LicenseShortName && m.LicenseShortName.value) });
    }
    process.stdout.write("\r  fetched " + Math.min(i + 20, files.length) + " / " + files.length + "   ");
    await new Promise((s) => setTimeout(s, 900));
  }
  process.stdout.write("\n");
  return out;
}

function creditLine(meta, url) {
  if (!meta || !meta.lic) return null;
  let author = meta.artist || "";
  /* COMMONS DOUBLES A LINKED ARTIST. The Artist field is markup — an <a> round the name, with the
     same name as the link text — so stripping the tags leaves "Unknown authorUnknown author", and
     after whitespace folding "Unknown author Unknown author". Both shapes have to be halved, which
     is why the test is over WORDS rather than characters: the character test alone missed every
     case the tag strip had put a space into, and the doubled name shipped into the credit. */
  const w = author.split(" ").filter(Boolean);
  if (w.length % 2 === 0 && w.length &&
      w.slice(0, w.length / 2).join(" ") === w.slice(w.length / 2).join(" ")) {
    author = w.slice(0, w.length / 2).join(" ");
  } else if (author.length % 2 === 0 && author.slice(0, author.length / 2) === author.slice(author.length / 2)) {
    author = author.slice(0, author.length / 2);
  }
  author = unblurb(author);
  if (NO_AUTHOR.some((rx) => rx.test(author))) author = "";
  const parts = [];
  if (author) parts.push(author);
  parts.push(meta.lic);
  return parts.join(", ") + ", via Wikimedia Commons. " + url;
}

/* --retrim — apply the BLURB table to what is ALREADY SHIPPED, over all three pools, with no network.
   The table is the durable half: a future network run produces the trimmed form on its own, and this
   is what fixes the credits written before the table existed. It touches the AUTHOR HALF and nothing
   else, so a licence, a "via Wikimedia Commons" and a URL come through byte for byte. */
function retrim() {
  const { loadGlossary, writeGlossary, MAIN: GLOSS_MAIN } = require("./gloss-io.js");
  const { loadArtefacts, writeArtefacts } = require("./artefact-io.js");
  const fs = require("fs");

  const items = [];
  const { cards, tree } = loadCards();
  cards.forEach((c) => { if (c.image && c.image.credit) items.push(["card", c.id, c.image]); });
  const G = loadGlossary(); const GI = G.GLOSSARY_IMAGES || {};
  Object.keys(GI).forEach((k) => { if (GI[k] && GI[k].credit) items.push(["gloss", k, GI[k]]); });
  const arts = loadArtefacts() || [];
  arts.forEach((a) => { if (a.image && a.image.credit) items.push(["artefact", a.id, a.image]); });

  let n = 0;
  for (const [kind, key, im] of items) {
    const split = authorHalf(im.credit);
    if (!split || !split.author) continue;
    const name = unblurb(split.author);
    if (name === norm(split.author)) continue;
    const line = name + split.rest;
    console.log("  " + kind + " " + key + "\n    was: " + norm(split.author).slice(0, 110) +
      (norm(split.author).length > 110 ? " …" : "") + "\n    now: " + name);
    if (!DRY) im.credit = line;
    n++;
  }
  console.log("\nblurb credits trimmed: " + n + (DRY ? "  (dry run — nothing written)" : ""));
  if (!DRY && n) {
    writeCards(cards, tree);
    writeGlossary(G, fs.readFileSync(GLOSS_MAIN, "utf8"));
    writeArtefacts(arts);
    console.log("written.");
  }
}

(async () => {
  if (process.argv.includes("--retrim")) return retrim();
  const { cards, tree } = loadCards();

  const todo = [];
  for (const c of cards) {
    const im = c.image;
    if (!im || !im.src) continue;
    if (!CAPTION_CREDIT.test(String(im.desc || ""))) continue;
    const cred = norm(im.credit);
    if (!BARE_URL.test(cred)) continue;                 // somebody's judgement — never overwrite
    const file = commonsFile(im.src, cred);
    if (!file) continue;                                 // not a Commons file — nothing to ask
    todo.push({ card: c, file: file.replace(/ /g, "_"), url: cred });
  }

  const work = LIMIT ? todo.slice(0, LIMIT) : todo;
  console.log("captions carrying their own credit, over a BARE-URL credit: " + todo.length +
    (LIMIT ? "  (this run: " + work.length + ")" : ""));
  if (!work.length) { console.log("nothing to do."); return; }

  const meta = await fetchMeta([...new Set(work.map((w) => w.file))]);

  let wrote = 0; const skipped = [];
  for (const w of work) {
    const line = creditLine(meta.get(w.file), w.url);
    if (!line) { skipped.push(w.card.id + "  (no licence from Commons)"); continue; }
    if (norm(w.card.image.credit) === norm(line)) continue;
    if (!DRY) w.card.image.credit = line;
    wrote++;
    if (wrote <= 6) console.log("  " + w.card.id + "\n    " + line);
  }

  console.log("\ncredits rewritten: " + wrote + (DRY ? "  (dry run — nothing written)" : ""));
  if (skipped.length) {
    console.log("left alone: " + skipped.length + " — Commons named no licence, so the caption keeps its clause");
    skipped.slice(0, 10).forEach((s) => console.log("  " + s));
  }
  if (!DRY && wrote) {
    writeCards(cards, tree);
    console.log("written. Now run:  node .claude/strip-credit-captions.js");
  }
})();
