#!/usr/bin/env node
/* check-gloss-source.js — THE MANDARIN DECKS' GLOSSES AND READINGS, AGAINST A SECOND DICTIONARY.

     node .claude/decks/check-gloss-source.js [--deck=<substring>] [--top=N] [--all] [--cedict=<path>]

   WHY IT EXISTS.  Every other checker here asks whether a card is INTERNALLY consistent — the pinyin
   against the bopomofo, the gloss against the card's own examples, the reading against the corpus's
   own distribution — and a whole class of fault survives all of them: a gloss that is well formed,
   fluent, and about a different word.  Sep 2026 turned one up by eye while example sentences were
   being written: `炒作` was defined as "Nest", which is the gloss of `巢穴`, the card next to it in the
   file.  Nothing in the pipeline could see it, because a wrong gloss is a perfectly good gloss.  The
   only thing that can is a SECOND, INDEPENDENTLY COMPILED SOURCE.

   THE SOURCE IS CC-CEDICT (CC BY-SA 4.0), fetched at run time and cached in `.claude/.cedict.txt`
   (gitignored).  It is NOT vendored: it is 10 MB, it is somebody else's work under a share-alike
   licence, and it is not part of the site — this is a helper, like `fetch-book.js`.

   WHAT IT CAN AND CANNOT TELL YOU, measured rather than claimed.  The decks' glosses plainly come from
   a CEDICT-shaped source to begin with — the "(coll.)", "(lit.)" and "see also" furniture is CEDICT's
   own — so agreement between the two is only weak evidence that a gloss is RIGHT.  What the comparison
   is strong at is the fault it was written for: a gloss that has been transposed, truncated or replaced
   shares no content word with the entry for its own headword, and that stands out at once.  Read it as
   a transposition check, never as a sense check; `check-senses.js` is the one that looks at sense.

   THE READING CHECK IS THE STRONGER HALF and is a genuine second opinion.  `check-pinyin.js` compares a
   card's pinyin against its own bopomofo, which catches a syllable boundary that has moved but cannot
   catch two notations that are wrong together.  Here the reading is compared against every reading
   CC-CEDICT records for the same headword, which is a source the decks' own generator never saw.

   IT IS REPORT-ONLY AND EXITS 0.  Both halves are proxies with real false-positive rates — a gloss may
   be a legitimate paraphrase, and CC-CEDICT records readings this corpus does not — so this is a ranked
   review list, never a gate.  Read the findings; do not sweep them. */
"use strict";
const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(__dirname, "..", "..");
const CACHE = path.join(__dirname, "..", ".cedict.txt");
const URL = "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz";
const args = process.argv.slice(2);
const arg = (n) => { const a = args.find((x) => x.indexOf("--" + n + "=") === 0); return a ? a.slice(n.length + 3) : null; };
const TOP = Number(arg("top") || 40);
const ALL = args.includes("--all");
const DECK = arg("deck");

function fetchCedict(dest) {
  return new Promise((res, rej) => {
    const zlib = require("zlib");
    https.get(URL, { headers: { "User-Agent": "folio-check/1.0" } }, (r) => {
      if (r.statusCode !== 200) { rej(new Error("HTTP " + r.statusCode)); return; }
      const chunks = [];
      const enc = String(r.headers["content-encoding"] || "");
      const stream = /gzip/.test(enc) ? r.pipe(zlib.createGunzip()) : r;
      stream.on("data", (c) => chunks.push(c));
      stream.on("end", () => {
        let buf = Buffer.concat(chunks);
        // the URL names a .gz; some proxies decompress it and some do not, so sniff the magic rather
        // than trusting either — a wrong guess here reads as an empty dictionary and 11,532 findings
        if (buf[0] === 0x1f && buf[1] === 0x8b) { try { buf = zlib.gunzipSync(buf); } catch (e) { rej(e); return; } }
        fs.writeFileSync(dest, buf);
        res();
      });
      stream.on("error", rej);
    }).on("error", rej);
  });
}

/* CC-CEDICT: `traditional simplified [pin1 yin1] /sense/sense/`. A headword has SEVERAL lines when it
   has several readings, and the readings are what the second half of this checker compares against, so
   every line is kept rather than the first. */
function parseCedict(text) {
  const by = new Map();
  const rx = /^(\S+)\s+(\S+)\s+\[([^\]]*)\]\s+\/(.*)\/\s*$/;
  for (const line of text.split(/\r?\n/)) {
    if (!line || line[0] === "#") continue;
    const m = rx.exec(line);
    if (!m) continue;
    const simp = m[2], read = m[3], senses = m[4].split("/").filter(Boolean);
    let e = by.get(simp);
    if (!e) { e = { reads: [], senses: [] }; by.set(simp, e); }
    e.reads.push(read);
    e.senses.push(...senses);
  }
  return by;
}

// numbered pinyin -> bare syllables, lower case, tone marks and digits gone. u: is the ü CEDICT writes.
const bare = (s) => String(s).toLowerCase().replace(/u:/g, "v").replace(/[0-9]/g, "").replace(/\s+/g, " ").trim();
const DIAC = { "ā":"a","á":"a","ǎ":"a","à":"a","ē":"e","é":"e","ě":"e","è":"e","ī":"i","í":"i","ǐ":"i","ì":"i",
  "ō":"o","ó":"o","ǒ":"o","ò":"o","ū":"u","ú":"u","ǔ":"u","ù":"u","ǖ":"v","ǘ":"v","ǚ":"v","ǜ":"v","ü":"v","ń":"n","ň":"n","ǹ":"n" };
const bareMarked = (s) => String(s).toLowerCase().replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüńňǹ]/g, (c) => DIAC[c] || c)
  .replace(/[^a-z ]/g, "").replace(/\s+/g, " ").trim();

/* THE STOP LIST CARRIES THE PARTS OF SPEECH, and that is not tidiness — a card's English field opens
   with `<i class="uc-pos">adverb</i>`, so without it `不 "adverb not; no"` and CC-CEDICT's `not; un-`
   share the word "adverb" and nothing else, and the comparison is between two grammars rather than two
   glosses. The `not <other word>` disambiguator goes the same way: it belongs to the reverse card. */
const POS = "noun verb adjective adverb pronoun preposition conjunction numeral particle interjection " +
  "measure classifier suffix prefix idiom phrase onomatopoeia";
const STOP = new Set(("a an the to of in on for and or by with be is are was were as at from that this it its his her their our your my " +
  "sth sb someone something oneself one ones etc esp eg ie also see used usage abbr lit fig coll fml old " +
  "variant classifier form name surname used also often more most very can may make made do does did " +
  "not no nothing any all such other another same than then so up out off over about into onto per " + POS).split(" "));
const words = (s) => new Set(String(s).toLowerCase()
  .replace(/<div class="uc-pos">not [^<]*<\/div>/g, " ")   // the reverse card's disambiguator
  .replace(/<[^>]*>/g, " ")
  .replace(/\bcl:[^;\/]*/g, " ")                           // CEDICT's classifier field is not a sense
  .replace(/\[[^\]]*\]/g, " ")                             // …nor the pinyin it brackets after a cross-reference
  .replace(/[^a-z' ]/g, " ")
  .split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)));

(async () => {
  const from = arg("cedict");
  let text = "";
  if (from) text = fs.readFileSync(from, "utf8");
  else {
    if (!fs.existsSync(CACHE)) {
      process.stdout.write("fetching CC-CEDICT (once; cached in .claude/.cedict.txt) … ");
      try { await fetchCedict(CACHE); process.stdout.write("ok\n"); }
      catch (e) {
        console.log("failed: " + e.message);
        console.log("  no network, or the export moved. Pass --cedict=<path> to a local copy.");
        process.exit(0);
      }
    }
    text = fs.readFileSync(CACHE, "utf8");
  }
  const dict = parseCedict(text);
  if (dict.size < 10000) { console.log("the dictionary parsed to " + dict.size + " entries, which is not CC-CEDICT — refusing to report"); process.exit(0); }

  const files = fs.readdirSync(path.join(ROOT, "decks")).filter((f) => /^Mandarin.*\.folio-deck\.json$/.test(f)).sort();
  let notes = 0, known = 0, glossHits = [], readHits = [], swapHits = [], unknown = 0;
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(ROOT, "decks", f), "utf8"));
    const id = d.meta.id;
    if (DECK && id.indexOf(DECK) < 0 && f.indexOf(DECK) < 0) continue;
    for (let ci = 0; ci < d.cards.length; ci++) {
      const c = d.cards[ci];
      const fl = c.fields || {};
      const w = String(fl.Simplified || "");
      if (!w) continue;
      notes++;
      let e = dict.get(w);
      /* AN ENTRY THAT IS ONLY A POINTER IS FOLLOWED. CC-CEDICT records 好玩儿 as "erhua variant of 好玩",
         which carries no sense at all, so comparing a card's gloss against it finds nothing shared and
         reports a card that is perfectly right. Where every sense is such a pointer, the word it points
         at is read instead. */
      if (e) {
        const ptr = e.senses.length && e.senses.every((x) => /^(erhua |old |)variant of /.test(x));
        if (ptr) {
          const m = /variant of ([^\[|]+)/.exec(e.senses[0]);
          const base = m && dict.get(m[1].trim().replace(/.*\|/, ""));
          if (base) e = base;
        }
      }
      if (!e) { unknown++; continue; }
      known++;
      // ---- gloss overlap
      const mine = words(fl.English || "");
      const theirs = words(e.senses.join(" "));
      if (mine.size && theirs.size) {
        let shared = 0;
        mine.forEach((x) => { if (theirs.has(x)) shared++; });
        const plain = String(fl.English || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        if (!shared) {
          glossHits.push({ id, w, mine: plain, theirs: e.senses.slice(0, 3).join("; ") });
          /* THE SHARP VERSION OF THE SAME QUESTION, and the one this checker was really written for.
             Nine per cent of glosses share no content word with the dictionary, which is what happens
             when a three-word card gloss meets a fifteen-word dictionary entry — a list that size is a
             sludge nobody reads. But a gloss that matches the dictionary's entry for the card NEXT TO IT
             IN THE FILE is not a paraphrase, it is a copy: that is exactly the shape of the 炒作 fault,
             where the gloss read "Nest" and 巢穴 sat beside it. Two neighbours either way, since a batch
             tool that shifted a column by one is as likely to have shifted it by two. */
          for (const off of [-2, -1, 1, 2]) {
            const nb = d.cards[ci + off];
            const nw = nb && nb.fields ? String(nb.fields.Simplified || "") : "";
            const ne = nw && dict.get(nw);
            if (!ne) continue;
            const nwords = words(ne.senses.join(" "));
            let n2 = 0;
            mine.forEach((x) => { if (nwords.has(x)) n2++; });
            if (n2 && n2 >= mine.size) {
              swapHits.push({ id, w, mine: plain, theirs: e.senses.slice(0, 2).join("; "),
                              nb: nw, nbs: ne.senses.slice(0, 2).join("; "), off: off });
              break;
            }
          }
        }
      }
      // ---- reading
      /* A CARD MAY TEACH TWO READINGS, written `dōu / dū`, and each is compared on its own — joined,
         neither matches and every polyphone in the deck is a finding. ERHUA is folded too: CC-CEDICT
         writes 面条儿 as three syllables `mian4 tiao2 r5` where the card writes two, `miàn tiáor`, which
         is the same word said the same way and a difference of notation only. */
      const erhua = (x) => x.replace(/\br\b/g, "").replace(/r(?= |$)/g, "").replace(/\s+/g, " ").trim();
      const mineRs = String(fl.Pinyin || "").split("/").map(bareMarked).filter(Boolean);
      if (mineRs.length) {
        const theirR = e.reads.map(bare);
        const ok = mineRs.every((mr) => theirR.some((r) => r === mr || erhua(r) === erhua(mr)));
        if (!ok) readHits.push({ id, w, mine: String(fl.Pinyin || "").trim(), theirs: e.reads.join(" | ") });
      }
    }
  }

  console.log("\nMandarin glosses and readings, against CC-CEDICT (" + dict.size.toLocaleString() + " entries)");
  console.log("  " + notes.toLocaleString() + " notes, " + known.toLocaleString() + " found in the dictionary, " +
    unknown.toLocaleString() + " not in it\n");

  const show = (title, list, note) => {
    console.log(title + ": " + list.length.toLocaleString() +
      (known ? "  (" + ((list.length / known) * 100).toFixed(1) + "% of the notes it could check)" : ""));
    (ALL ? list : list.slice(0, TOP)).forEach((h) => {
      console.log("   " + h.w + "  [" + h.id + "]");
      console.log("      card: " + h.mine.slice(0, 96));
      console.log("      dict: " + h.theirs.slice(0, 96));
    });
    if (!ALL && list.length > TOP) console.log("   … " + (list.length - TOP) + " more (--top=N, --all)");
    console.log("   " + note + "\n");
  };
  console.log("GLOSSES that match a NEIGHBOURING card's dictionary entry instead of their own: " + swapHits.length);
  swapHits.forEach((h) => {
    console.log("   " + h.w + "  [" + h.id + "]  — its gloss matches " + h.nb + ", " +
      Math.abs(h.off) + (Math.abs(h.off) === 1 ? " card" : " cards") + (h.off < 0 ? " before" : " after") + " it");
    console.log("      card says: " + h.mine.slice(0, 90));
    console.log("      " + h.w + " is:   " + h.theirs.slice(0, 90));
    console.log("      " + h.nb + " is:   " + h.nbs.slice(0, 90));
  });
  console.log("   This is the transposition itself rather than a proxy for it — check every one.\n");
  show("GLOSSES sharing no content word with the dictionary's own entry", glossHits,
    "A transposition check, not a sense check — a legitimate paraphrase lands here too. Read each one.");
  show("READINGS the dictionary does not record for that word", readHits,
    "A genuine second opinion on the reading, where check-pinyin.js only compares a card against itself.");
  console.log("report only — CC-CEDICT is a source, not an authority; read a finding before changing a card.\n");
})();
