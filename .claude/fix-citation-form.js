/* ============================================================================
   fix-citation-form.js — A TRANSLATED ANCIENT WORK IS CITED BY ITS OWN AUTHOR
   OR ITS OWN TITLE, NEVER BY ITS TRANSLATOR.

     node .claude/fix-citation-form.js            # report: what would change, and what is left
     node .claude/fix-citation-form.js --emit=<f> # write an add-sources.js batch of the changes
     node .claude/fix-citation-form.js --prefix=cnh-   # narrow to one collection

   WHY IT EXISTS.  CLAUDE.md's rule is that `Livy, The History of Rome 2.1, trans.
   Canon Roberts` is right and `Canon Roberts, trans., The History of Rome` is wrong,
   and that an ANONYMOUS work opens on its own title (`The Shû King, trans. James
   Legge`).  That is not merely tidiness.  `check-cards.js` takes a citation's author
   from the slot before the first comma, so a translator sitting there IS the author as
   far as every count is concerned: five different Chinese classics translated by one
   Victorian read as one modern scholar cited five times, which is the exact inversion
   of what rule 1 exists to find.  `check-cards.js`'s own ANCIENT list already carries
   `the shû king`, `the shoo king`, `the ch'un ts'ëw` and `the annals of the bamboo
   books` BY TITLE, written for the form this pass produces.

   THE WORKS ARE DECLARED, NEVER PATTERN-MATCHED, for the reason `CROSSREF_WRONG` and
   `INSTITUTIONAL` are: "anything with `trans.` in the author slot" would sweep up a
   translator's own prolegomena, a compilation that is really the compiler's book, and a
   journal article that happens to carry a translation — three shapes where the
   translator IS the author and the present form is correct.  A work reaches the table
   only after somebody has read a citation of it, and everything else is REPORTED rather
   than changed.

   THE PROLEGOMENA RULE IS WHAT MAKES THE REST SAFE.  Legge's Chinese Classics volumes
   carry a hundred-page prolegomena of his own; a card citing `vol. 5, part 1, The Ch'un
   Ts'ëw … Prolegomena, 108` is citing LEGGE, not the Ch'un Ts'ëw, and must keep him in
   the author slot.  So a citation whose locator names Prolegomena, an Introduction or a
   preface is left exactly as it stands — and that is per CITATION, where the table is
   per WORK.

   IT WRITES NOTHING ITSELF.  `--emit` produces a batch for `add-sources.js`, which is
   the tool that already knows how to write a card's sources: it re-checks the marker
   rules, refuses a citation with no URL, and resplits so the heavy half lands in
   data-extra rather than fattening data.js.  Not part of the site.
   ============================================================================ */

"use strict";

const fs = require("fs");
const path = require("path");
const { loadCards } = require("./card-io");

/* ---- the declared table ---------------------------------------------------
   Key: the work's title exactly as the citation prints it, with tags stripped.
   `author`: the ancient author the work is conventionally cited under, or null for a
   work that is anonymous and therefore opens on its own title.
   A key is matched as a PREFIX of the citation's remainder, so `The Chinese Classics`
   entries are keyed on the volume's own work title, which the citation names after the
   volume number. */
const WORKS = [
  /* Chinese classics — Legge's Sacred Books of the East and Chinese Classics volumes.
     All anonymous but the two the tradition names. */
  { t: "The Shû King", author: null },
  { t: "The Shu King", author: null },
  { t: "The Shoo King", author: null },
  { t: "The Yî King", author: null },
  { t: "The Yi King", author: null },
  { t: "The Lî Kî", author: null },
  { t: "The Li Ki", author: null },
  { t: "The She King", author: null },
  { t: "The Shih King", author: null },
  { t: "The Religious Portions of the Shih King", author: null },
  { t: "The Ch’un Ts’ëw, with the Tso Chuen", author: null },
  { t: "The Ch’un Ts’ew, with the Tso Chuen", author: null },
  { t: "The Annals of the Bamboo Books", author: null },
  { t: "The Works of Mencius", author: "Mencius" },
  { t: "Confucian Analects, The Great Learning and The Doctrine of the Mean", author: "Confucius" },
  { t: "Confucian Analects", author: "Confucius" },
  { t: "The Sacred Books of China: The Texts of Tâoism", author: null },
  { t: "The Sacred Books of China: The Texts of Confucianism", author: null },
  { t: "Taoist Teachings from the Book of Lieh Tzŭ", author: "Lieh Tzŭ" },
  { t: "Sun Tzŭ on the Art of War: The Oldest Military Treatise in the World", author: "Sun Tzŭ" },
  { t: "The Works of Hsüntze", author: "Hsün Tzŭ" },
  { t: "The Book of Lord Shang: A Classic of the Chinese School of Law", author: null },
  { t: "Les Mémoires historiques de Se-ma Ts’ien", author: "Sima Qian" },
  { t: "Les Mémoires historiques de Se-ma Ts'ien", author: "Sima Qian" },
  { t: "Les mémoires historiques de Se-ma Ts’ien", author: "Sima Qian" },

  /* Japan */
  { t: "Nihongi: Chronicles of Japan from the Earliest Times to A.D. 697", author: null },

  /* India and Iran */
  { t: "The Laws of Manu", author: null },
  { t: "Vinaya Texts", author: null },
  { t: "The Hymns of the Rigveda", author: null },
  { t: "The Zend-Avesta", author: null },
  { t: "The Upanishads", author: null },
  { t: "The Thirteen Principal Upanishads", author: null },
  { t: "Hymns of the Tamil Śaivite Saints", author: null },
  { t: "Hymns of the Alvars", author: null },

  /* Elsewhere */
  { t: "The Periplus of the Erythraean Sea: Travel and Trade in the Indian Ocean by a Merchant of the First Century", author: null },
  { t: "The Trial of Jeanne d’Arc", author: null },
  { t: "The Trial of Jeanne d'Arc", author: null },
  { t: "The Glass Palace Chronicle of the Kings of Burma", author: null },
];

/* WORKS THAT STAY AS THEY ARE, each with the reason.  These are the shapes the header
   warns a pattern would sweep up: a compiler's own book, a journal article carrying a
   translation inside the translator's own commentary, and a database resource.  They
   are listed rather than merely omitted so the next session can see they were read. */
const LEAVE = [
  ["Ancient India as Described by Megasthenes and Arrian", "McCrindle's own compilation of the Greek fragments, with his introduction and notes"],
  ["Algebra, with Arithmetic and Mensuration", "one volume carrying two authors (Brahmegupta and Bháscara) plus Colebrooke's dissertation"],
  ["History of the Heung-noo", "a journal article: Wylie's translation inside his own apparatus"],
  ["The Story of Chang K’ien", "a journal article: Hirth's translation inside his own commentary"],
  ["Histoire et fabrication de la porcelaine chinoise", "Julien's own study, built round translated passages"],
  ["Art militaire des Chinois", "an 18th-century compilation, edited by de Guignes"],
  ["Southeast Asia in the Ming Shi-lu", "a database resource, not an edition of a text"],
  ["Japanese Feudal Law", "quoted at second hand inside Murdoch's history"],
  ["Nipon o daï itsi ran", "Titsingh's translation as edited by Klaproth, cited as that edition"],
  ["Gaina Sutras", "cited both ways on one card — Jacobi's introduction is his, the Akaranga Sutra is not"],
  ["Genji Monogatari", "one citation inside Wilson's anthology, cited as that anthology"],
  ["Ancient China. The Shoo King", "Medhurst's own edition, cited as such"],
];

/* A citation whose locator names the translator's OWN scholarship keeps him in the
   author slot.  Per citation, not per work. */
const OWN_WORK = /\b(Prolegomena|Introduction|Preface|introduction to)\b/;

/* …AND SO DOES A LOCATOR THAT IS NOTHING BUT LOWER-CASE ROMAN NUMERALS.  Front matter is
   the translator's, whether or not the citation says the word: `The Zend-Avesta … xliii-xliv`
   is Darmesteter's essay, not the Vendîdâd.  Only a locator that is ENTIRELY roman counts —
   a MIXED one (`xxiii-xxv and 378-80`) cites the text as well, so it is rewritten and
   reported, since which half the marker means is a judgement no rule can make. */
const ROMAN_ONLY = /,\s*[ivxl]+(?:[–-][ivxl]+)?(?:,\s*[ivxl]+(?:[–-][ivxl]+)?)*\s*,\s*https?:/;
const ROMAN_ANY  = /,\s*[ivxl]{2,}(?:[–-][ivxl]+)?\s*(?:,|and|\s)/;

/* ---- run ------------------------------------------------------------------ */

const args = process.argv.slice(2);
const emit = (args.find((a) => a.startsWith("--emit=")) || "").slice(7);
const prefix = (args.find((a) => a.startsWith("--prefix=")) || "").slice(9);

const plain = (s) => String(s).replace(/<[^>]*>/g, "");
const norm = (s) => plain(s).replace(/\s+/g, " ").trim();

/* The imprint is the first parenthetical carrying a 4-digit year: "(Oxford: Clarendon
   Press, 1882)".  Everything before it is the title block and everything from it on is
   left untouched, so a page range, a section number and the URL all survive verbatim. */
function splitImprint(rest) {
  const m = rest.match(/\s\((?=[^)]*\b\d{4}\b)/);
  if (!m) return null;
  return [rest.slice(0, m.index), rest.slice(m.index)];
}

const { cards } = loadCards();
const out = {};
const mixed = [];
let changed = 0, kept = 0, left = 0;
const leftRows = [];

for (const c of cards) {
  if (prefix && !c.id.startsWith(prefix)) continue;
  const src = c.sources || [];
  let touched = false;
  const next = src.map((s) => {
    const raw = String(s);
    /* THE WORD `trans.` IS NOT ALWAYS THERE, AND ITS ABSENCE IS THE SAME FAULT WEARING LESS.
       A third of the Chavannes citations read simply `Édouard Chavannes, <i>Les Mémoires
       historiques de Se-ma Ts'ien</i>, vol. 1 (…)`: the translator in the author slot with
       nothing to say he is one, which `authorOf` reads exactly as it reads a scholar's book.
       It is safe to treat that shape as the same fault ONLY because the work is declared —
       the only name that ever precedes one of these titles is its translator's. */
    let m = raw.match(/^([^,<"“]{2,80}),\s*trans\.,\s*(.+)$/);
    if (!m && !/\btrans\./.test(raw)) {
      /* THE GUARD IS `trans.` ANYWHERE IN THE CITATION, and it is what makes the pass
         idempotent.  Without it a citation this pass has already corrected —
         `Confucius, <i>Confucian Analects</i>, trans. James Legge, …` — matches the bare
         shape all over again, reads Confucius as the translator, and emits
         `trans. Confucius, trans. James Legge`.  Caught by reading the second run's diff;
         nothing downstream would have failed on it. */
      const bare = raw.match(/^([^,<"“]{2,80}),\s*(<i>[^<]+<\/i>.*)$/);
      if (bare && WORKS.some((w) => plain(bare[2]).startsWith(w.t))) m = bare;
    }
    if (!m) return raw;
    const translator = m[1].trim(), rest = m[2];

    /* A QUOTED WORK TITLE LEADING THE CITATION IS A TEXT, WHEREVER IT IS PRINTED, and that
       is what separates it from the case below.  Legge printed the Annals of the Bamboo
       Books inside his prolegomena to the Shoo King, so those citations end in
       "Prolegomena, ch. 4" — but the Annals are not Legge's scholarship, they are a
       chronicle he translated, and the locator only says where in the volume it sits.  The
       corpus already carries one of them in the right form, which is the form used here. */
    const q = rest.match(/^([“"][^”"]+[,]?[”"])\s+in\s+(.+)$/);
    if (q) {
      const wPlain = plain(q[1]).replace(/^[“"]|[,]?[”"]$/g, "").trim();
      const w = WORKS.filter((x) => wPlain.startsWith(x.t)).sort((a, b) => b.t.length - a.t.length)[0];
      if (w) {
        touched = true; changed++;
        return (w.author ? w.author + ", " : "") + q[1] + " trans. " + translator + ", in " + q[2];
      }
    }

    /* THE CHINESE CLASSICS NAME THE VOLUME AND THEN THE VOLUME'S OWN WORK, so the work is
       not at the front where the table looks for it.  Lift it out and put it there, leaving
       the series and volume as the container it is.  A locator naming the Prolegomena here
       really is Legge's own essay on that classic, so it keeps him in the author slot. */
    const cc = rest.match(/^(<i>The Chinese Classics<\/i>,\s*vol\.\s*\d+(?:,\s*part\s*\d+)?),\s*(<i>[^<]+<\/i>)(.*)$/);
    if (cc) {
      if (OWN_WORK.test(plain(cc[3]))) { kept++; return raw; }
      const wPlain = plain(cc[2]);
      const w = WORKS.filter((x) => wPlain === x.t).sort((a, b) => b.t.length - a.t.length)[0];
      if (!w) {
        left++;
        leftRows.push([c.id, translator, wPlain.slice(0, 72), "Chinese Classics volume whose work is not in the table"]);
        return raw;
      }
      touched = true; changed++;
      return (w.author ? w.author + ", " : "") + cc[2] + ", in " + translator + ", trans., " + cc[1] + cc[3];
    }

    if (OWN_WORK.test(plain(rest)) || ROMAN_ONLY.test(plain(rest))) { kept++; return raw; }

    const restPlain = plain(rest);
    const hit = WORKS
      .filter((w) => restPlain.startsWith(w.t))
      .sort((a, b) => b.t.length - a.t.length)[0];
    if (!hit) {
      const why = LEAVE.find(([t]) => restPlain.indexOf(t) >= 0);
      left++;
      leftRows.push([c.id, translator, restPlain.slice(0, 72), why ? why[1] : "NOT IN THE TABLE — read it"]);
      return raw;
    }

    const parts = splitImprint(rest);
    if (!parts) {
      left++;
      leftRows.push([c.id, translator, restPlain.slice(0, 72), "no imprint parenthetical to place `trans.` before"]);
      return raw;
    }
    /* `trans.` goes immediately after the TITLE, not merely before the imprint: CLAUDE.md's
       own example is `The Shû King, trans. James Legge`, and a series statement standing
       between the two ("Sacred Books of the East 16, trans. James Legge") reads as though
       the series were what was translated. */
    const [head, tail] = parts;
    const lead = hit.author ? hit.author + ", " : "";
    const it = head.match(/^(<i>[^<]*<\/i>)(.*)$/);
    if (ROMAN_ANY.test(plain(tail))) mixed.push([c.id, plain(rest).slice(0, 76)]);
    touched = true; changed++;
    return it ? lead + it[1] + ", trans. " + translator + it[2] + tail
              : lead + head + ", trans. " + translator + tail;
  });
  if (touched) out[c.id] = { sources: next };
}

/* Works the table does not name, grouped, so the residue is a reading list rather than
   a wall.  A shape that appears once is as interesting as one that appears forty times:
   both are a judgement nobody has made yet. */
const byWork = new Map();
for (const [id, tr, rest, why] of leftRows) {
  const k = tr + " || " + rest.split(/,\s*(?:Sacred Books|vol\.|Part |Book |pt\.)|\s+\(/)[0];
  if (!byWork.has(k)) byWork.set(k, { n: 0, why, ids: [] });
  const e = byWork.get(k);
  e.n++; if (e.ids.length < 3) e.ids.push(id);
}

console.log("citations rewritten      " + changed + "  across " + Object.keys(out).length + " cards");
console.log("kept (own prolegomena)   " + kept);
console.log("left for judgement       " + left);
if (byWork.size) {
  console.log("\n  left, by work:");
  for (const [k, e] of [...byWork].sort((a, b) => b[1].n - a[1].n))
    console.log("   " + String(e.n).padStart(3) + "  " + k + "\n        " + e.why + "   (" + e.ids.join(", ") + ")");
}

if (mixed.length) {
  console.log("\n  rewritten, but the locator names front matter AND text — read these " + mixed.length + ":");
  for (const [id, t] of mixed) console.log("     " + id + "  " + t);
}

if (emit) {
  fs.writeFileSync(emit, JSON.stringify({ cards: out }, null, 1));
  console.log("\nbatch written to " + emit + " — apply with: node .claude/add-sources.js " + emit);
}
