/* HSK 3.0 levels 1-3 built from the OFFICIAL VOCABULARY LISTS themselves — 300 / 200 / 500 rows, which is
   the standard's 300 / 500 / 1,000 cumulative exactly. Every earlier attempt here was built on a
   second-hand list: the 2021 extractions (elkmovie, ivankra, krmanik) are the superseded edition, and
   complete-hsk-vocabulary's `newest-1..3` is the right edition four dozen words short — measured against
   these PDFs, it is missing exactly ten (没事 哪个 那个 你好 一下 这个 冰激凌 电子书 红绿灯 检票), which
   are precisely the ten that are absent from that dataset altogether.

   Each row carries the word, its OFFICIAL PINYIN and an official definition tagged with a part of speech,
   so this file needs no reading authority of its own: the pinyin picks the form, exactly as the HSK 2.0
   build uses its syllabus's pinyin column. Everything the list does not carry — the traditional form, the
   bopomofo, the fuller range of English senses, the measure words — comes from CC-CEDICT, through
   complete.json where the word is in it and cedict.u8 where it is not.

     node build2026b.js [levels…]   → w26-1.json … w26-6.json. Every level is WALKED whatever is asked for,
   because a word is carded at the level that introduces it and the walk is what knows which that is; only
   the levels named are written, so rebuilding 4-6 cannot disturb the enrichment already added to 1-3.    */
const fs = require("fs");
const parse = require("./parsepdf.js");
const data = JSON.parse(fs.readFileSync("complete.json", "utf8"));
const numToMarks = require("./pinyin.js");

const bySimp = new Map();
data.forEach((e) => { if (!bySimp.has(e.simplified)) bySimp.set(e.simplified, []); bySimp.get(e.simplified).push(e); });

/* CC-CEDICT proper, for the ten words complete.json has never carried and for a cross-reference that leads
   out of the HSK vocabulary. Its readings are written with a tone digit. */
const cedict = new Map();
fs.readFileSync("cedict.u8", "utf8").split(/\r?\n/).forEach((l) => {
  if (!l || l[0] === "#") return;
  const m = /^(\S+) (\S+) \[([^\]]*)\] \/(.*)\/$/.exec(l);
  if (!m) return;
  if (!cedict.has(m[2])) cedict.set(m[2], []);
  cedict.get(m[2]).push({ traditional: m[1], transcriptions: { pinyin: numToMarks(m[3]), bopomofo: "" }, meanings: m[4].split("/"), classifiers: [] });
});

/* THE SYLLABLE-TO-ZHUYIN TABLE IS DERIVED, NOT WRITTEN OUT. complete.json gives both spellings for every one
   of its 12,623 readings, so splitting each pair on its spaces yields an empirical table — no hand-typed
   list of four hundred syllables to get wrong, and its coverage is measurable. It is needed only for the ten
   words that are not in that file at all. */
const syl2zh = new Map();
data.forEach((e) => (e.forms || []).forEach((f) => {
  const p = String(f.transcriptions.pinyin).trim().split(/\s+/);
  const z = String(f.transcriptions.bopomofo).trim().split(/\s+/);
  if (p.length !== z.length) return;
  p.forEach((s, i) => { const k = s.toLowerCase(); if (!syl2zh.has(k)) syl2zh.set(k, z[i]); });
}));
/* the same table with the tones taken off both sides, so a syllable the HSK vocabulary happens never to use
   in one tone (shuí, 谁's second reading) is still spellable — the zhuyin tone mark is a suffix and carries
   no information the pinyin diacritic does not */
const TONE = ["", "ˊ", "ˇ", "ˋ"];
const bareSyl = new Map();
syl2zh.forEach((z, k) => {
  const b = k.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!bareSyl.has(b)) bareSyl.set(b, z.replace(/[˙ˊˇˋ]$/, ""));
});
function sylZhuyin(sy) {
  const k = sy.toLowerCase();
  if (syl2zh.has(k)) return syl2zh.get(k);
  const d = k.normalize("NFD");
  const base = bareSyl.get(d.replace(/[\u0300-\u036f]/g, ""));
  if (!base) return "";
  const mark = /\u0304/.test(d) ? 0 : /\u0301/.test(d) ? 1 : /\u030c/.test(d) ? 2 : /\u0300/.test(d) ? 3 : -1;
  return mark < 0 ? base + "˙" : base + TONE[mark];
}
function toZhuyin(pinyin) {
  const parts = String(pinyin).trim().split(/\s+/).map(sylZhuyin);
  return parts.every(Boolean) ? parts.join(" ") : "";
}
/* THE TWO LINES ON THE CARD MUST COUNT THE SAME. Where the official pinyin leaves the erhua unwritten —
   好玩儿 is printed hǎo wán, two syllables — CC-CEDICT's form carries the r, so the bopomofo taken off it
   comes out three symbols long and the card shows a mark the romanisation above it has no counterpart for.
   The bopomofo follows what is printed. And where the list gives two readings in one cell (谁 shéi/shuí)
   both are spelled out rather than only the one CC-CEDICT happens to key. */
function alignZhuyin(pinyin, zh) {
  if (!zh) return zh;
  const np = String(pinyin).trim().split(/\s+/).length, nz = zh.trim().split(/\s+/).length;
  if (nz === np + 1 && /ㄦ[˙ˊˇˋ]?$/.test(zh) && !/([\s]r|ér|r)$/i.test(String(pinyin).trim()))
    return zh.trim().split(/\s+/).slice(0, -1).join(" ");
  return zh;
}

/* THE CHARACTER ON THE CARD MUST HAVE A READING, and for five words in the list it had none (Aug 2026,
   on a report about 好玩儿). Where the syllabus leaves the erhua unwritten the headword still prints its
   三 characters, so 好玩儿 came out hǎo wán, 一点儿 yì diǎn, 有点儿 yǒu diǎn, 聊天儿 liáo tiān and 差点儿
   chà diǎn — a card showing a character whose sound it does not give. The r is written onto the last
   syllable, which is the modern convention and the deck's own majority form (miàn tiáor, yí huìr, gàn
   huór); alignZhuyin then leaves the ㄦ alone, so the two lines count the same without being cut down.
   It fires ONLY where the reading carries no counterpart for the 儿 at all, so a word whose 儿 is a full
   syllable in its own right — 女儿 nǚ ér, 婴儿 yīng ér, 孤儿 gū ér — is untouched. */
function writeErhua(word, pinyin) {
  if (!/儿$/.test(word) || [...word].length < 2) return pinyin;
  return String(pinyin).split("/").map((alt) => {
    const a = alt.trim();
    return /(?:r|ér|er)$/i.test(a) ? a : a + "r";
  }).join(" / ");
}

// a cross-reference, a classifier note, a surname, or a pronunciation note is not a translation
const DROP = /^(CL:|variant of|old variant of|erhua variant of|surname |abbr\. for|see [一-鿿]|also written|used in |also pr\.|Taiwan pr\.)|\(surname\)/i;
const TOPONYM = /^[A-Z][a-zü]+(?:\s[A-Z][a-zü]+)*\s(County|Province|City|District|Prefecture|Autonomous|Township|Island|Mountain|River)\b/;
const NOT_STANDARD = /\((old|archaic|literary|[A-Za-z]*\s?dialect|Tw|obsolete)\)/i;
const STRIP_MARK = /^\((bound form)\)\s*/i;
function cleanSense(s) {
  s = s.replace(STRIP_MARK, "");
  s = s.replace(/\((?:[^()]*(?:[一-鿿]|pr\.\s*\[)[^()]*)\)/g, " ");
  s = s.replace(/\[[^\]]*\]/g, " ");
  s = s.replace(/\s+/g, " ").replace(/\s+([,;.])/g, "$1").trim().replace(/[,;]$/, "").trim();
  // a gloss ending in the characters it cross-refers to, unless the English needs them to finish
  return s.replace(/^(.*\S)\s+[一-鿿]+$/, (m, head) =>
    /\b(in|see|of|to|as|with|than|by|like|e\.g\.|and|or|for)$/i.test(head) ? m : head);
}
/* NFC, because the two sides spell ü differently. numToMarks builds lüè by combining, and the level 7-9
   list writes it precomposed, so 略, 掠夺, 虐待 and eleven more matched nothing at all until both were put
   in the same normal form. The strip list gains the hyphen and the curly apostrophe for the same reason it
   already has the space: that band writes an idiom's reading as zìshǐ-zhìzhōng and zǒng’é, which is the
   same reading under a different convention rather than a different reading. And complete.json never
   turns CC-CEDICT's u: into ü — it stores lu:è where the syllabus writes lüè — so that is undone too. */
const norm = (p) => String(p).normalize("NFC").toLowerCase()
  .replace(/u:/g, "\u00fc").replace(/[\s'’·\-\u02d90-9]/g, "");
const toneless = (p) => norm(p).normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* THE OFFICIAL PINYIN AND CC-CEDICT'S KEY DISAGREE IN THREE SYSTEMATIC WAYS, and none of them is an error
   on either side — they are writing the same reading under different conventions. Measured over the 1,000
   rows: 43 words fail an exact match and all 43 are one of these three.
     · TONE SANDHI on 不 and 一. The list writes what is said — bú cuò, yí xià, yì qǐ — and CC-CEDICT keys
       the citation reading, bù / yī. Undone only where the word actually contains that character, so a
       syllable that is bú or yì for some other reason is left alone.
     · THE NEUTRAL TONE. The list writes the full tone (nà biān, xué shēng, cōng míng) where CC-CEDICT
       writes the neutral (nà bian, xué sheng, cōng ming) — and once the other way round, 网上 wǎng shang
       against wǎng shàng. Covered by comparing without tones at all, as the last resort.
     · ERHUA. The list drops the 儿 syllable (hǎo wán), writes it out (nǎ ér) or runs it on (yí huìr);
       CC-CEDICT always keys a separate r.
   The official spelling is what the card PRINTS either way; this only decides which dictionary entry the
   traditional form, the bopomofo and the extra senses come from. */
function readingKeys(word, pinyin) {
  const outs = new Set();
  String(pinyin).split("/").forEach((alt) => {
    let base = alt.trim();
    const variants = [base];
    if (word.includes("不")) variants.push(base.replace(/bú/gi, "bù"));
    if (word.includes("一")) variants.push(base.replace(/y[íì]/gi, "yī"));
    if (word.includes("不") && word.includes("一")) variants.push(base.replace(/bú/gi, "bù").replace(/y[íì]/gi, "yī"));
    variants.slice().forEach((v) => {
      outs.add(v);
      if (word.endsWith("儿")) {                       // written out, run on, or dropped entirely
        outs.add(v.replace(/\s*ér$/i, " r"));
        outs.add(v.replace(/\s*er$/i, " r"));         // toneless, as the 7-9 list writes it: kǒu shào er
        outs.add(v.replace(/r$/i, " r"));
        outs.add(v + " r");
      }
    });
  });
  return [...outs];
}
/* TWO WORDS WHERE THE DICTIONARY'S FIRST ENTRY IS NOT THE READING THE SYLLABUS TEACHES, and the card's
   own example sentences are what say so (Aug 2026, on a report). 后 came out glossed "queen, empress;
   behind, after" while all three of its examples are "after" (晚饭后, 几分钟后, 出去后) and every one of
   the eleven compounds in the deck — 以后, 然后, 最后, 后来, 后面 — is "after / behind"; the empress
   sense is a different character in traditional (后 against 後) and is already taught by 皇后. And 背 came
   out bēi "to carry on the back" while its three examples are all the body part (请帮我洗背, 帮我搓一下背,
   他们的背都有毛病), which is bèi. THE EXAMPLES ARE THE EVIDENCE: they are drawn from a corpus rather than
   from the same dictionary entry, so where they and the gloss disagree the gloss is what is wrong.
   Written down here rather than inferred, because no rule can see it — both cards were well formed, the
   right length and internally consistent, and only reading the sentences under the reading shows it. */
const AUTHORED = {
  "后": { pinyin: "hòu", zhuyin: "ㄏㄡˋ", senses: ["(n.) behind, after"] },
  "背": { pinyin: "bèi / bēi", zhuyin: "ㄅㄟˋ / ㄅㄟ",
          senses: ["bèi — (n.) back (of the body)", "bēi — (v.) to carry on the back"] },
};

/* A "VARIANT OF X" ENTRY IS A CROSS-REFERENCE, NOT THE WORD, and complete.json lists it FIRST. The
   traditional form is read off the first matching form, so 岸 came out 㟁, 纸 came out 帋, 时 came out 旹
   and 和 came out 咊 — obscure variants standing where the ordinary traditional character belongs, on 71
   words across the six levels and on fourteen of the three already shipped. Every one of those entries
   glosses as nothing but "variant of …", and the real form sits directly under it, so they are dropped
   wherever a non-variant form survives — and kept where one does not, since a word listed only as a
   variant still has to render. */
const variantOnly = (f) => (f.meanings || []).length &&
  (f.meanings || []).every((m) => /^\s*(old |archaic |Japanese |erhua )?variant of\b/i.test(m));
const dropVariants = (list) => {
  const real = list.filter((f) => !variantOnly(f));
  return real.length ? real : list;
};
function matchForms(word, pinyin, forms) {
  const keys = readingKeys(word, pinyin).map(norm);
  let hit = forms.filter((f) => keys.includes(norm(f.transcriptions.pinyin)));
  if (hit.length) return { forms: dropVariants(hit), loose: false };
  const tl = readingKeys(word, pinyin).map(toneless);
  hit = forms.filter((f) => tl.includes(toneless(f.transcriptions.pinyin)));
  const distinct = new Set(hit.map((f) => norm(f.transcriptions.pinyin)));
  return { forms: dropVariants(hit), loose: hit.length > 0, ambiguous: distinct.size > 1 };
}
const surnameOnly = (f) => (f.meanings || []).length && (f.meanings || []).every((m) => /^surname\b/i.test(m));

function formsOf(w) {
  const out = [];
  (bySimp.get(w) || []).forEach((e) => (e.forms || []).forEach((f) => out.push(f)));
  if (!out.length) (cedict.get(w) || []).forEach((f) => out.push(f));
  const real = out.filter((f) => !surnameOnly(f));
  return real.length ? real : out;
}
function sensesOf(fl) {
  const out = [];
  fl.forEach((f) => (f.meanings || []).forEach((m) => m.split(/;\s*/).forEach((raw) => {
    const t = raw.trim();
    if (!t || DROP.test(t) || NOT_STANDARD.test(t) || TOPONYM.test(t)) return;
    const c = cleanSense(t);
    if (c && !/^[一-鿿\s]*$/.test(c) && !out.some((x) => x.toLowerCase() === c.toLowerCase())) out.push(c);
  })));
  return out;
}
const XREF = /^(?:see|variant of|old variant of|erhua variant of|also written)\s+([一-鿿]+)/i;
function followXref(fl) {
  for (const f of fl) for (const m of (f.meanings || [])) {
    const hit = XREF.exec(m.trim());
    if (!hit) continue;
    const got = sensesOf(formsOf(hit[1]));
    if (got.length) return { senses: got, via: hit[1] };
  }
  return null;
}

/* 7 is the 七至九级 band, which the standard counts as ONE level and not three. It comes from a page
   rather than a PDF (see extract79.js) and so arrives as JSON already parsed into rows. */
const LEVELS = [1, 2, 3, 4, 5, 6, 7];
const WRITE = process.argv.slice(2).map(Number).filter((n) => LEVELS.includes(n));
const WANT = WRITE.length ? WRITE : LEVELS;

const seen = new Set();
const report = { later: [], noForm: [], noZh: [], multi: [], xref: [], fromCedict: [], ambiguous: [], reading: [], kept: [], authored: [] };
/* complete.json's pinyin field is not always clean: it keeps CC-CEDICT's u: for ü and sometimes a trailing
   neutral-tone digit (méifǎr5), and writes a raised dot before a neutral syllable. None of that may reach
   a card, so a reading taken from it is tidied on the way. */
const tidyReading = (p) => String(p).replace(/u:/g, "\u00fc").replace(/[0-9\u02d9]/g, "").replace(/\s+/g, " ").trim();

LEVELS.forEach((LEVEL) => {
  const rows = fs.existsSync("up" + LEVEL + ".json")
    ? JSON.parse(fs.readFileSync("up" + LEVEL + ".json", "utf8"))
    : parse("up" + LEVEL + ".txt").rows;
  const count = {};
  rows.forEach((r) => { count[r.simp] = (count[r.simp] || 0) + 1; });

  const out = [], done = new Set();
  rows.forEach((row) => {
    const w = row.simp;
    if (done.has(w)) return;                       // its second row is handled with the first
    done.add(w);
    if (seen.has(w)) { report.later.push("L" + LEVEL + " " + w); return; }
    seen.add(w);

    /* the rows for this word: one, or the two the list prints where a graph has two readings to learn.
       Each carries its OWN official pinyin and definition, so nothing has to be inferred about which. */
    /* A GRAPH LISTED TWICE IS NOT ALWAYS TWO READINGS. 花 appears twice at level 2, both times huā — once
       as the verb "spend" and once as the noun "flower" — so the two rows are two senses of one reading and
       are merged, where 过 guò / guo and 得 dé / děi are genuinely two. */
    const rawRows = rows.filter((r) => r.simp === w);
    const mine = [];
    rawRows.forEach((r) => {
      const same = mine.find((x) => norm(x.pinyin) === norm(r.pinyin));
      /* KEPT AS TWO DEFINITIONS, not run together with a semicolon. Each official row opens with its own
         part of speech, and joining them buried the second one mid-string where the card could not spell it
         out: 花 read "verb spend; (n./adj.) flower; blossom" with one marker expanded and one left in
         brackets. Two rows are two entries, so they are two lines. */
      if (same) same.defs.push(r.def); else mine.push({ ...r, defs: [r.def] });
    });
    if (!bySimp.has(w) && cedict.has(w)) report.fromCedict.push("L" + LEVEL + " " + w);

    const forms = formsOf(w);
    const picked = mine.map((r) => {
      const m = matchForms(w, r.pinyin, forms);
      const fl = m.forms;
      if (!fl.length) report.noForm.push("L" + LEVEL + " " + w + " [" + r.pinyin + "]");
      else if (m.ambiguous) report.ambiguous.push("L" + LEVEL + " " + w + " [" + r.pinyin + "] -> " +
        [...new Set(fl.map((f) => f.transcriptions.pinyin))].join(", "));
      let senses = sensesOf(fl);
      if (!senses.length) {
        const x = followXref(fl.length ? fl : forms);
        if (x) { senses = x.senses; report.xref.push("L" + LEVEL + " " + w + " -> " + x.via); }
      }
      const alts = writeErhua(w, r.pinyin).split("/").map((x) => x.trim()).filter(Boolean);
      const zh = alts.map((alt, i) => {
        const own = i === 0 && fl[0] && fl[0].transcriptions.bopomofo;
        return alignZhuyin(alt, own || toZhuyin(alt));
      }).filter(Boolean).join(" / ");
      if (!zh) report.noZh.push("L" + LEVEL + " " + w + " [" + r.pinyin + "]");
      const fall = dropVariants(forms);
      /* A READING THAT MATCHES NO ENTRY IN A 124,000-WORD DICTIONARY IS USUALLY A TYPO IN THE LIST, and
         the level 7-9 band has a couple of dozen: 露面 is printed "lò umià", 器重 "qǐ yòng", 抽查 "chōu
         zhā", 强劲 "qiáng jìn". The dictionary's reading is taken instead — but ONLY where the dictionary
         has a single reading for the word, which is the whole of the care here. Substituting on the first
         form regardless was tried and DAMAGED three readings that were right: 壳 ké became qiào, 血 xiě
         became xuè and 嗯 ǹg became ēn, all of them words with two readings where the list names the one
         the learner wants and CC-CEDICT happens to list the other first. Where the dictionary is itself
         of two minds, the syllabus keeps the floor. Every substitution is reported, this being the one
         place in the build where the card does not print what the list prints. */
      let printed = r.pinyin;
      /* NEVER ON A SINGLE CHARACTER. A character usually has several readings and the syllabus names the
         one it teaches, which is the whole point of listing it: 壳 is ké here and qiào in the dictionary's
         first entry, 血 is xiě and xuè, 嗯 is ǹg and ēn. All three were quietly overwritten before this
         line, and all three were right as the list had them. */
      if (!fl.length && fall.length && [...w].length > 1) {
        const readings = [...new Set(fall.map((f) => norm(f.transcriptions.pinyin)))];
        if (readings.length === 1) {
          printed = tidyReading(fall[0].transcriptions.pinyin);
          report.reading.push("L" + LEVEL + " " + w + "  [" + r.pinyin + "] -> " + printed);
        } else report.kept.push("L" + LEVEL + " " + w + " [" + r.pinyin + "]  (" + readings.length + " readings in the dictionary)");
      }
      printed = writeErhua(w, printed);
      return { row: { ...r, pinyin: printed }, forms: fl, trad: (fl[0] || fall[0] || {}).traditional || w, zhuyin: zh, senses };
    });

    const multi = picked.length > 1;
    if (multi) report.multi.push("L" + LEVEL + " " + w + "  " + picked.map((p) => p.row.pinyin).join(" / "));

    /* THE OFFICIAL DEFINITION AND NOTHING ELSE, on request (Aug 2026). CC-CEDICT's fuller range of senses
       used to follow it — the deck's first brief asked for every translation a word has — and a beginner's
       card ended up carrying eight or ten glosses for a word the exam means one thing by. The dictionary
       senses are still gathered (`picked[].senses`, and the cross-reference chase that fills them for a
       word entered only as a pointer), so putting them back is one line rather than a rebuild. */
    const senses = multi
      ? picked.flatMap((p) => p.row.defs.map((d) => p.row.pinyin + " — " + d))
      : picked[0].row.defs.slice();

    const ts = picked.map((p) => p.trad);
    const classifiers = [];
    picked.forEach((p) => p.forms.forEach((f) => (f.classifiers || []).forEach((c) => { if (!classifiers.includes(c)) classifiers.push(c); })));

    const auth = AUTHORED[w];
    if (auth) report.authored.push("L" + LEVEL + " " + w + "  [" + picked.map((p) => p.row.pinyin).join(" / ") + "] -> " + auth.pinyin);
    out.push({
      simp: w,
      trad: ts.every((t) => t === ts[0]) ? (ts[0] === w ? "" : ts[0]) : ts.join(" / "),
      pinyin: auth ? auth.pinyin : picked.map((p) => p.row.pinyin).join(" / "),
      zhuyin: auth ? auth.zhuyin : picked.map((p) => p.zhuyin).join(" / "),
      senses: auth ? auth.senses.slice() : senses,
      cls: classifiers, mw: [],
    });
  });

  if (!WANT.includes(LEVEL)) return;
  fs.writeFileSync("w26-" + LEVEL + ".json", JSON.stringify(out, null, 1));
  console.log("L" + LEVEL + ": " + rows.length + " official rows -> " + out.length + " cards"
    + "  (carried from a lower level " + (rows.length - out.length) + ", identical simp/trad "
    + out.filter((w) => !w.trad).length + ")");
});

console.log("\n-- adjudications --");
console.log("  syllable→zhuyin table derived from " + syl2zh.size + " syllables");
report.multi.forEach((x) => console.log("  two readings: " + x));
if (report.fromCedict.length) console.log("  data taken from CC-CEDICT direct, not in the HSK dataset (" + report.fromCedict.length + "): " + report.fromCedict.join(", "));
if (report.xref.length) console.log("  entered only as a cross-reference, followed one level: " + report.xref.join(", "));
if (report.ambiguous.length) console.log("  MATCHED SEVERAL READINGS WITHOUT TONES (" + report.ambiguous.length + "): " + report.ambiguous.join(", "));
if (report.noForm.length) console.log("  NO CC-CEDICT FORM AT THE OFFICIAL READING (" + report.noForm.length + "): " + report.noForm.join(", "));
if (report.reading.length) console.log("  READING TAKEN FROM THE DICTIONARY, THE LIST'S MATCHING NOTHING (" + report.reading.length + "): " + report.reading.join(", "));
if (report.kept.length) console.log("  LIST'S READING KEPT, THE DICTIONARY BEING OF TWO MINDS (" + report.kept.length + "): " + report.kept.join(", "));
if (report.authored.length) console.log("  WRITTEN BY HAND, THE DICTIONARY'S FIRST ENTRY NOT BEING THE TAUGHT READING (" + report.authored.length + "): " + report.authored.join(", "));
if (report.noZh.length) console.log("  NO BOPOMOFO (" + report.noZh.length + "): " + report.noZh.join(", "));
console.log("  carded at a lower level already (" + report.later.length + "): " + report.later.join(", "));
