/* Look at the Indonesian deck the way a reader would: import it, add it, study it, and read what is
   actually on the card.  `check-decks.js` skips the card-level checks for a deck that is not Mandarin
   (they are facts about a hanzi card), so everything Indonesian this deck is FOR — the affix family,
   the passive, the phrases, the standard-language promise — is unchecked by anything until here.

   Every fault this deck can have is quiet.  A dropped forms row leaves a perfectly good card that has
   stopped teaching the one thing Indonesian morphology makes hard; a colloquial form that slips past
   the register filter looks exactly like a word; a phrase torn into its pieces by the supplement
   reader leaves two ordinary cards and one that nobody asked for.  So this asserts what the PAGE
   says, and writes three screenshots to look at.

     FOLIO_CHROMIUM=/path/to/chrome NODE_PATH=/tmp/pw/node_modules \
       node .claude/ukbi/check-ukbi.js [1..7]

   The level is an argument rather than a constant because every assertion here is about INDONESIAN
   and not about a level, so a second level is a word on the command line rather than a second
   checker to keep in step with this one.  */
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs");
const ROOT = path.resolve(__dirname, "..", "..");
const LEVEL = process.argv[2] || "1";
const NAMES = { 1: "Terbatas", 2: "Marginal", 3: "Semenjana", 4: "Madya",
                5: "Unggul", 6: "Sangat-Unggul", 7: "Istimewa" };
if (!NAMES[LEVEL]) { console.error("level must be 1..7"); process.exit(2); }
const DECK = "UKBI-" + LEVEL + "-" + NAMES[LEVEL] + "-Indonesian.folio-deck.json";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
               ".json": "application/json", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  fs.readFile(p, (e, b) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
    res.end(b);
  });
});
let fails = 0, checks = 0;
const ok = (c, m, extra) => {
  checks++;
  if (!c) { fails++; console.log("   ✗ " + m + (extra ? "   " + extra : "")); }
  else console.log("   ✓ " + m);
};

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";

  // THE DECK IS READ BEFORE THE BROWSER IS LAUNCHED, because which cards the walk below has to reach
  // is a property of THIS deck and is measured off it rather than guessed.  See `SPECIMENS`.
  const deck = JSON.parse(fs.readFileSync(ROOT + "/decks/" + DECK, "utf8"));
  const words = deck.cards.map((c) => c.fields.Word);
  const wordSet = new Set(words);
  const byWord = new Map(deck.cards.map((c) => [c.fields.Word, c]));
  const strip = (h) => (h || "").replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"')
                                .replace(/&#x27;/g, "'").replace(/&amp;/g, "&");

  /* THE THREE SPECIMENS ARE SEEDED AS DUE RATHER THAN WALKED TO, AND THAT IS THE THIRD ANSWER TO A
     QUESTION THIS FILE KEPT GETTING WRONG.  The walk exists to prove that a card carrying an affix
     family, a card carrying a phrase and a card carrying three sentences all RENDER — and it used to
     reach them by grading real cards until they turned up, under a cap written down as a number.  The
     cap was 240, then 600, and it was wrong both times for the same reason: all three are properties
     of the WORD, the deck is ordered by frequency, and so the higher the level the later the first one
     falls.  The first family sits at note 91 at level 1, then 114, 167, 383, 462 and **886**; the
     first phrase sits at note 14 at level 1 and at **2,445** at level 6, because level 6's phrases are
     all hand-written inventory items with no corpus frequency at all and the deck sorts them last.
     Walking to 2,485 costs eight minutes and fifty artefact chests to prove something about markup.

     A DUE CARD IS IN THE QUEUE WHATEVER THE DAY'S NEW-CARD ALLOWANCE IS, and that -- rather than any
     claim about order -- is what makes the seeding work.  `reviewQueue` builds the day's due cards and
     its `newPerDay` slice of unseen ones, so a session is at most `ALLOW` cards plus the seeds; the
     three specimens are in it by being due, and a walk of `WALK_CAP` therefore reaches them at every
     level however deep in the deck they sit.  Note that seeding does NOT put them FIRST: the review's
     Ordered presentation re-sorts the whole queue into in-deck order (`buildSession`'s review branch),
     so a specimen from the far end of the deck is dealt at the far end of the SESSION -- which is why
     the cap has to clear the allowance rather than being a small number.

     What the old walk incidentally proved is that a reader working the deck normally will meet these,
     and that is given up here, so the positions are PRINTED on every run instead: a first family at
     note 886 and a first phrase at note 2,445 are facts about the deck worth reading rather than
     hiding.  A specimen the deck does not contain AT ALL is still a failure, asserted below, never
     skipped -- which is what caught level 6 shipping with no phrases in it. */
  const firstIdx = (test) => deck.cards.findIndex(test);
  const SPECIMENS = {
    family: firstIdx((c) => {
      const f = (c.fields || {}).Forms || "";
      return (f.match(/uc-fl">/g) || []).length >= 3 && /uc-fl">passive</.test(f);
    }),
    phrase: firstIdx((c) => ((c.fields || {}).Word || "").includes(" ")),
    sentences: firstIdx((c) => (((c.fields || {}).Examples || "").match(/uc-exi/g) || []).length >= 3),
  };
  // WHICH SPECIMENS A LEVEL OWES is declared, for the reason set out beside the family range below:
  // level 7 has no verb family to render, and asserting one of it would be asserting something
  // untrue rather than guarding anything.  Everything else is owed by every level.
  const WANT = Number(LEVEL) <= 6 ? ["family", "phrase", "sentences"] : ["phrase", "sentences"];
  const seedIds = WANT.map((k) => SPECIMENS[k]).filter((i) => i >= 0).map((i) => deck.cards[i].id);
  console.log("   specimens at notes: "
              + Object.entries(SPECIMENS).map(([k, v]) => k + " " + v).join(", ")
              + "   (this level owes: " + WANT.join(", ") + ")");
  // The day's new-card allowance, and the cap DERIVED from it: the session is at most `ALLOW` cards
  // plus the seeds, so a walk of `ALLOW + 40` cannot fail to reach a specimen that is in the queue.
  // Keep them in this relation -- two independent numbers is how the old cap came to be wrong twice.
  const ALLOW = 200;
  const WALK_CAP = ALLOW + 40;

  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  // REDUCED MOTION, or every screenshot is a card caught half way through its fade-in: the page
  // animates each card in, and a shot taken the moment the walk finds what it was looking for shows a
  // washed-out ghost of the thing being checked.  It also makes the walk itself deterministic.
  const pg = await browser.newPage({ viewport: { width: 1100, height: 900 },
                                     reducedMotion: "reduce" });
  // The day's allowance is five new cards, which is right for a reader and useless here: the deck is
  // ordered by frequency, so five cards is five function words and no affix family is ever reached.
  // PATCH the saved settings rather than seeding a whole state -- this runs on every load, and a seed
  // would put the deck back to un-added on the first reload after importing it.  The three specimens
  // are planted as OVERDUE review cards for the reason set out beside `SPECIMENS`; a record for a card
  // whose deck is not installed yet is inert, so this is safe to run on every load, import included.
  await pg.addInitScript((cfg) => {
    try {
      const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      s.settings = Object.assign({}, s.settings,
                                 { newPerDay: cfg.n, maxReviewsPerDay: cfg.n + 100 });
      s.cards = s.cards || {};
      const day = 86400000;
      for (const id of cfg.seed) {
        if (s.cards[id]) continue;              // already graded by this run's walk — leave it alone
        s.cards[id] = { reps: 1, lapses: 0, ease: 2.5, interval: 10, step: 0,
                        status: "review", due: Date.now() - day, last: Date.now() - day };
      }
      localStorage.setItem("folio_v1", JSON.stringify(s));
    } catch (e) {}
  }, { n: ALLOW, seed: seedIds });
  const errs = [];
  // ERR_* is the sandbox failing to reach fonts.googleapis.com (the stylesheet's one @import), not
  // the deck; everything else is the deck's and is a failure.
  pg.on("console", (m) => { if (m.type() === "error" && !/net::ERR_/.test(m.text())) errs.push(m.text()); });
  pg.on("pageerror", (e) => errs.push(String(e)));

  console.log("=== " + DECK + "   " + deck.cards.length + " notes"
              + "   (walking to " + WALK_CAP + ")");

  // THE LEVELS BELOW, read off the shipped files exactly as `words_below()` reads them.  A level is
  // taught ON TOP of the ones under it, so what a learner working the stack has met is the union --
  // and the closed sets a lower level guarantees have to be asserted against that union rather than
  // against this deck, or every one of them fails at level 2 for the entirely correct reason that
  // level 1 already taught the days of the week.
  const below = new Map();       // level -> Set of its words
  for (let l = 1; l < Number(LEVEL); l++) {
    const f = ROOT + "/decks/UKBI-" + l + "-" + NAMES[l] + "-Indonesian.folio-deck.json";
    if (!fs.existsSync(f)) continue;
    below.set(l, new Set(JSON.parse(fs.readFileSync(f, "utf8"))
                             .cards.map((c) => c.fields.Word)));
  }
  const taught = new Set(wordSet);
  for (const s of below.values()) for (const w of s) taught.add(w);

  // ---------------------------------------------------------------- the file
  const type = deck.meta.types.ukbi;
  ok(type && type.cards && type.cards.length === 2, "the type declares two card templates");
  ok(type.speechLang === "id-ID", "the speech language is Indonesian", type && type.speechLang);
  ok(deck.cards.every((c) => c.type === "ukbi"), "every note carries the type");
  ok(new Set(deck.cards.map((c) => c.id)).size === deck.cards.length, "no id occurs twice");
  ok(deck.cards.every((c) => /^u_ukbi\d+_\d+$/.test(c.id) && c.id.startsWith("u_ukbi" + LEVEL + "_")),
     "every id carries the deck");
  ok(new Set(words).size === words.length, "no word occurs twice");
  ok(deck.cards.every((c) => c.fields.English && c.fields.English.trim()),
     "every card has a meaning on it");

  // ------------------------------------------------- the standard-language promise
  // THE DECK'S CENTRAL CLAIM AND THE ONE NOTHING ON THE PAGE COULD SHOW.  UKBI tests bahasa baku, so
  // the register filter is what makes the deck fit for it -- and a colloquial form that slips through
  // is indistinguishable from a word.  `informal` is deliberately NOT excluded (aku, kamu are
  // standard and essential), which is why the standard members of each pair are asserted present.
  const colloquial = ["nggak", "gak", "gue", "lo", "banget", "dimana", "disini", "disana",
                      "kayak", "udah", "aja", "tau", "bilangin", "ngapain",
                      // FOUND BY AUDITING THE GLOSSES RATHER THAN THE WORDS, which is
                      // the only way these two could be found: neither carries a tag the
                      // register filter can act on -- `enggak` is `informal`, which this
                      // deck deliberately keeps for `aku` and `kamu`, and `momod` is
                      // tagged nothing at all.  What gave them away is that their only
                      // gloss named another Indonesian word, which is what a variant's
                      // entry looks like.
                      "enggak", "momod"];
  const leaked = colloquial.filter((w) => wordSet.has(w));
  ok(leaked.length === 0, "no colloquial form is taught as a word", JSON.stringify(leaked));

  // ------------------------------------------------- a card must teach ENGLISH
  // THE COMMONEST DEFECT THE FINISHED DECKS HAD, and one that no count could see: 62 cards
  // across the seven levels were defined in INDONESIAN, because Wiktionary writes "synonym of
  // paham" where it means "to understand" and nothing dropped it.  Eighteen carried no English
  // anywhere at all.  The card was well formed, the deck was the right length, and the reader
  // was shown a word they do not know glossed with another word they do not know.
  const xref = /\b(?:synonym of|basic form of|used in the form)\b/i;
  const notEnglish = deck.cards.filter((c) => xref.test(strip(c.fields.English)))
                               .map((c) => c.fields.Word);
  ok(notEnglish.length === 0, "no card is defined by naming another Indonesian word",
     JSON.stringify(notEnglish.slice(0, 8)));

  // THE TWO WORST CARDS IN THE STACK WERE BOTH ON LEVEL 1 AND BOTH MEANT "TO GIVE".
  // `beri` is tagged `['dialectal', 'formal']`, so the register filter refused it and left the
  // English loanword for a berry; `memberi` and `memberikan` take their meaning from it, and
  // `memberikan` additionally falls back to `berikan`, whose first two entries are `ber-` +
  // `ikan` and mean "have a fish".  A survival deck defined its word for giving as fruit.
  // Asserted by MEANING rather than by presence: the cards were there all along.
  const giving = ["memberi", "memberikan"].filter((w) => wordSet.has(w));
  const wrong = giving.filter((w) => !/\bgive\b/i.test(strip(byWord.get(w).fields.English)));
  ok(giving.length === 0 || wrong.length === 0,
     "the words for giving are glossed as giving", JSON.stringify(wrong));
  ok(!wordSet.has("kejam"),
     "a word whose only standard sense the filter refuses is not taught with a rarer one");
  const baku = ["tidak", "di mana", "mengapa", "saya", "Anda", "aku", "kamu", "tetapi"];
  const missingBaku = baku.filter((w) => !taught.has(w));
  ok(missingBaku.length === 0, "the standard forms are all present", JSON.stringify(missingBaku));

  // ------------------------------------------------- each level's core is guaranteed
  // What `supplement.py` exists for.  A frequency list leaves the closed classes out -- `Kamis` is
  // outside the top 3,000 of the subtitle corpus -- and a survival deck with no word for Thursday in
  // it is not a survival deck.  Asserted as whole closed SETS, because a set with a hole in it is the
  // failure and one missing member is invisible.
  //
  // A LEVEL'S SETS ARE ASSERTED AT AND ABOVE THAT LEVEL, against everything taught so far.  The
  // alternative -- checking only this deck -- reports level 2 as having no word for Monday, which is
  // true and is the whole point of `words_below()`; and dropping the lower levels' sets once past
  // them would stop watching the thing they were written to watch.  So the union is the subject, and
  // a level-1 regression fails a level-2 run as well.
  const CORE = {
    1: {
      "days of the week": ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
      "months": ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus",
                 "September", "Oktober", "November", "Desember"],
      "one to ten": ["satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan",
                     "sembilan", "sepuluh"],
      "question words": ["apa", "siapa", "kapan", "mengapa", "bagaimana", "berapa", "mana"],
      "politeness": ["terima kasih", "maaf", "permisi", "tolong", "silakan", "selamat pagi"],
      "survival nouns": ["air", "makanan", "uang", "rumah sakit", "dokter", "kamar mandi", "harga"],
    },
    // Marginal is "keperluan keseharian" -- everyday life -- and these are the three groups its
    // inventory adds that a survival level deliberately has none of.  Clothes is the cleanest of
    // them: not one of the five is in level 1.
    2: {
      "clothes": ["baju", "celana", "sepatu", "topi", "tas"],
      "feelings beyond the basics": ["marah", "bosan", "kecewa", "bangga"],
      "narrative connectives": ["akhirnya", "tiba-tiba", "setuju", "sebaiknya"],
    },
    // Semenjana opens `keprofesian yang tidak kompleks`, and these are the three groups that
    // door lets in -- the workplace, money at a bank, and the abstract `ke-...-an` /
    // `peN-...-an` nouns a paragraph is built out of.  Level 2's header says in as many words
    // that the workplace belongs to a level Marginal cannot reach; this is that level, so the
    // set that would have been WRONG one level down is the right one to assert here.
    3: {
      "workplace": ["karyawan", "jabatan", "rapat", "gaji", "cuti", "kontrak", "wawancara"],
      "money at a bank": ["rekening", "tabungan", "pinjaman", "pajak", "anggaran", "modal"],
      "abstract nouns": ["proses", "tahap", "akibat", "syarat", "pengaruh", "perubahan",
                         "peningkatan", "penyelesaian"],
    },
    // Madya's descriptor is Semenjana's `dengan baik` -- the same purposes, done well -- so it
    // adds no new DOMAIN the way clothes or the workplace did, and the three groups below are
    // instead where doing it well takes the vocabulary: the shape of an organisation, the
    // running of a meeting, and the `ke-...-an` abstractions a formal sentence is built out of.
    // Every member was checked to be in level 4 and in none of the levels below it, or the
    // assertion would pass on a lower level's word and say nothing about this one.
    4: {
      "organisations and roles": ["panitia", "divisi", "struktur", "tanggung jawab",
                                  "pengelolaan"],
      "meetings and discussion": ["musyawarah", "diskusi", "pembahasan", "kesimpulan"],
      "ke-...-an abstractions": ["kebijakan", "kemajuan", "kepentingan", "ketentuan"],
    },
    // Unggul lifts the one ceiling Madya names as its own -- "keprofesian, baik yang sederhana
    // maupun kompleks" -- so these four sets are the complex professional register itself.  The
    // last is the level's own finding: at this register a great deal of the vocabulary is a
    // COMPOUND that a segmented frequency list cannot see, so the multi-word machinery is what
    // carries it, and an assertion on single words alone would miss the half that matters.
    // `mengunggah` rather than `unggah` because the family's headword is the form a learner
    // meets; the root is shown in its forms row.
    5: {
      "agreements": ["klausul", "wanprestasi", "adendum", "pembatalan"],
      "the books": ["neraca", "piutang", "akuntansi", "audit", "pembukuan", "dividen"],
      "computing in standard Indonesian": ["unduh", "mengunggah", "daring", "luring",
                                           "peramban", "tautan"],
      "courts": ["gugatan", "penggugat", "tergugat", "arbitrase", "notaris"],
      "professional compounds": ["arus kas", "tata kelola", "pemangku kepentingan",
                                 "pemutusan hubungan kerja", "perseroan terbatas"],
    },
    // Sangat Unggul constrains only "kepentingan akademik yang KOMPLEKS", which is a statement
    // that the ordinary academic case is within reach -- so these are the student's register:
    // the apparatus a paper cannot do without, the degrees, the words for an argument and for
    // judging one, and the language a test OF Indonesian uses to talk about Indonesian, which
    // is not a flourish but what a candidate meets in the reading paper itself.
    6: {
      "the apparatus of citation": ["pustaka", "sitasi", "indeks", "glosarium", "jilid"],
      "the university": ["skripsi", "tesis", "disertasi", "magister", "kurikulum", "silabus"],
      "argument": ["premis", "dalil", "nalar", "penalaran", "deduksi", "induksi"],
      "language about language": ["kaidah", "ejaan", "imbuhan", "sinonim", "antonim", "semantik"],
      "judging a claim": ["objektif", "valid", "sahih", "andal", "patokan", "kriteria"],
    },
    // Level 7 is the formal register itself rather than a subject area, so its sets are
    // MORPHOLOGICAL: the suffix families Indonesian builds scholarly prose out of.  That is what
    // the inventory was mined on, and a set of five from each is what would catch the mine
    // silently returning nothing -- which for a level whose words have no corpus frequency at all
    // is exactly the failure nothing else could see.
    7: {
      "doctrines": ["determinisme", "fatalisme", "kolonialisme", "liberalisme", "strukturalisme"],
      "measurable qualities": ["abnormalitas", "fleksibilitas", "mobilitas", "netralitas", "validitas"],
      "abstractions": ["keandalan", "kecermatan", "kemandirian", "keterbacaan", "ketersediaan"],
      "processes": ["pembakuan", "pembedaan", "pemidanaan", "pematuhan", "penangkalan"],
      "the formal compounds": ["alih aksara", "alat bukti", "kata majemuk", "tata negara",
                               "hak asasi manusia"],
    },
  };
  for (let l = 1; l <= Number(LEVEL); l++) {
    for (const [name, members] of Object.entries(CORE[l] || {})) {
      const miss = members.filter((w) => !taught.has(w));
      ok(miss.length === 0, "the " + name + " are all taught", JSON.stringify(miss));
    }
  }

  // ------------------------------------------------- a level teaches nothing the ones below it did
  // `words_below()` reads the SHIPPED lower deck files so the levels cannot drift apart, and the
  // failure if it stops working is not an error but a duplicate: the learner meets the same word
  // twice, on two decks, with two schedules, and nothing anywhere says so.
  for (const [l, s] of below) {
    const dup = words.filter((w) => s.has(w));
    ok(dup.length === 0, "no word is taught again from level " + l,
       dup.length + (dup.length ? ": " + dup.slice(0, 8).join(", ") : ""));
  }

  // ------------------------------------------------- the phrases survived intact
  // `kopi teh susu` on one line of the supplement was resolved as `kopi` plus the entry `teh susu`
  // (milk tea), which silently cost the deck its words for tea and for milk.  Both halves are
  // asserted, because either alone passes on the bug.
  ok(taught.has("teh") && taught.has("susu"), "tea and milk are separate words");
  ok(!taught.has("teh susu"), "and were not swallowed into one phrase");
  const phrases = words.filter((w) => w.includes(" "));
  ok(phrases.length >= 10, "multi-word entries are taught as single items",
     phrases.length + ": " + phrases.slice(0, 6).join(", "));

  /* ------------------------------------------------- the example sentences
     THREE SOURCES FEED THIS FIELD AND ONLY THE FIRST IS HAND-ALIGNED, so what has to be asserted
     is the property all three must share rather than which one a row came from: every sentence
     shown carries the word it is illustrating, and every one is paired with an English.  A row
     with no pair is what a half-read corpus leaves behind, and a sentence that does not contain
     the word is what an over-eager matcher leaves behind -- and both render as an ordinary card.
     The clitic is allowed for on purpose: `peradangannya` illustrates `peradangan`, which is why
     the matcher tolerates one and why this assertion has to as well. */
  const exRows = [];
  for (const c of deck.cards) {
    const ex = c.fields.Examples || "";
    if (!ex) continue;
    const ids = [...ex.matchAll(/<div class="uc-exz">([\s\S]*?)<\/div>/g)].map((m) => strip(m[1]));
    const ens = [...ex.matchAll(/<div class="uc-exe">([\s\S]*?)<\/div>/g)].map((m) => strip(m[1]));
    const bolds = [...ex.matchAll(/<b>([\s\S]*?)<\/b>/g)].map((m) => strip(m[1]));
    exRows.push({ w: c.fields.Word, ids, ens, bolds });
  }
  ok(exRows.length > 0, "the deck carries example sentences", exRows.length + " cards");
  ok(exRows.every((r) => r.ids.length === r.ens.length && r.ids.length === r.bolds.length),
     "every sentence is paired with an English and has its word marked");
  const notIn = exRows.filter((r) => !r.ids.every((s, i) =>
    s.toLowerCase().includes(r.bolds[i].toLowerCase().replace(/(ku|mu|nya)$/, ""))));
  ok(notIn.length === 0, "every sentence contains the form it is credited to",
     JSON.stringify(notIn.slice(0, 4).map((r) => r.w)));

  /* ------------------------------------------------- the affix families
     THE CARD'S CENTREPIECE STOPS APPLYING AT THE TOP LEVEL, AND THAT IS A FACT ABOUT ISTIMEWA
     RATHER THAN A REGRESSION.  Levels 1-6 teach roots and the verbs built on them, so 67-89 cards
     a level carry a root/active/passive row and the assertion is a real guarantee: a dropped forms
     row leaves a good card that has quietly stopped teaching the hard part.  Level 7's vocabulary
     IS the derived morphology -- `keandalan`, `absurditas`, `pemidanaan`, `keterbacaan` -- and
     Wiktionary rightly lists each as a headword in its own right rather than as a form of anything,
     so 15 of its 1,500 carry a family and only four show a passive.  Forcing that number up would
     mean teaching roots at level 7 that belong at level 2.

     So the bound is a RANGE, per level, and it is pinned in BOTH directions rather than skipped:
     if level 7's families climbed to 50 its inventory would have changed character, and if they
     fell to nothing the miner would have broken.  A skip written as a pass is the one thing this
     file must not do -- but neither may it assert of a level something that is not true of it. */
  const withForms = deck.cards.filter((c) => c.fields.Forms);
  const FAM_RANGE = Number(LEVEL) <= 6 ? [50, Infinity] : [5, 40];
  ok(withForms.length >= FAM_RANGE[0] && withForms.length <= FAM_RANGE[1],
     "the affix family is on as many cards as this level's words allow",
     withForms.length + " in [" + FAM_RANGE.join(", ") + "]");
  const labels = new Set();
  for (const c of withForms)
    for (const m of c.fields.Forms.matchAll(/uc-fl">([^<]+)</g)) labels.add(m[1]);
  // The passive needs a transitive verb to exist at all, and level 7 has almost none.
  ok(labels.has("root") && labels.has("active")
     && (labels.has("passive") || Number(LEVEL) === 7),
     "root, active and passive are all labelled", [...labels].join(" "));
  ok(withForms.every((c) => /uc-fhead/.test(c.fields.Forms)),
     "every forms row marks which form the card is asking for");

  // ---------------------------------------------------------------- import
  await pg.goto(base + "#studio", { waitUntil: "load" });
  await pg.waitForTimeout(400);
  const chooser = pg.waitForEvent("filechooser");
  await pg.click("#stImport");
  (await chooser).setFiles(ROOT + "/decks/" + DECK);
  await pg.waitForSelector(".studio-deck", { timeout: 240000 });

  // ------------------------------------------------- the rows it offers
  await pg.goto(base + "#decks", { waitUntil: "load" });
  await pg.waitForTimeout(600);
  const entries = await pg.evaluate(() => [...document.querySelectorAll("[data-uadd]")]
    .map((b) => decodeURIComponent(b.getAttribute("data-uadd"))));
  ok(entries.length >= 1, "the deck is addable", JSON.stringify(entries));
  const dirs = await pg.evaluate(() => [...document.querySelectorAll("[data-usubtpl]")]
    .map((r) => r.querySelector(".deck-title").textContent.trim()));
  ok(dirs.some((r) => /Indonesian . English/.test(r)) && dirs.some((r) => /English . Indonesian/.test(r)),
     "each direction is offered as a row of its own", JSON.stringify(dirs));
  await pg.click("[data-uadd]");
  await pg.waitForTimeout(500);
  await pg.goto(base + "#home", { waitUntil: "load" });
  await pg.waitForTimeout(700);
  const rows = await pg.evaluate(() => [...document.querySelectorAll(".active-deck .dk-title")]
    .map((e) => e.textContent.trim()));
  ok(rows.length === 1 && /UKBI/.test(rows[0]),
     "adding the deck adds the deck and not both directions with it", JSON.stringify(rows));

  // The seeds have to have survived the import, and this is the one thing that would fail SILENTLY:
  // a seed that never reached `S.cards` leaves the walk falling back on the natural queue, which
  // passes at every level whose specimens happen to sit early and fails only at the deepest one.
  // `every` over an empty list is true, so the COUNT is asserted as well: with no specimens to seed
  // this would otherwise pass vacuously and hand the walk back to the natural queue in silence.
  ok(seedIds.length === WANT.length && await pg.evaluate((ids) => {
        const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
        return ids.every((i) => s.cards && s.cards[i] && s.cards[i].status === "review");
      }, seedIds),
     "every specimen this level owes is seeded as due", seedIds.join(" "));

  // ---------------------------------------------------------------- study
  await pg.click(".review-group .cta .btn");
  await pg.waitForSelector(".question", { timeout: 20000 });
  await pg.waitForTimeout(400);

  const front = await pg.evaluate(() => {
    const w = document.querySelector(".uc-word");
    return {
      text: w ? w.textContent.trim() : "",
      size: w ? getComputedStyle(w).fontSize : "",
      speaker: !!document.querySelector(".uc-word .uc-tts"),
      backYet: !!document.querySelector(".uc-field"),
      formsYet: !!document.querySelector(".uc-forms"),
    };
  });
  console.log("   front: " + JSON.stringify(front.text));
  ok(front.text.length > 0, "the Indonesian word is on the front");
  ok(parseFloat(front.size) > 24, "it is set large", front.size);
  ok(front.speaker, "a speaker sits beside it");
  ok(!front.backYet && !front.formsYet, "neither the meaning nor the forms are on the front");
  await pg.screenshot({ path: "/tmp/ukbi-" + LEVEL + "-front.png" });

  await pg.click("#reveal-btn");
  await pg.waitForTimeout(500);
  const back = await pg.evaluate(() => {
    const t = (s) => { const e = document.querySelector(s); return e ? e.textContent.trim() : ""; };
    return {
      meaning: t(".uc-field"), pos: t(".uc-pos"),
      folds: [...document.querySelectorAll(".uc-fold summary")].map((e) => e.textContent.trim()),
      exCount: document.querySelectorAll(".uc-exi").length,
      fieldBorder: (() => { const e = document.querySelector(".uc-field");
        return e ? getComputedStyle(e).borderTopWidth : ""; })(),
    };
  });
  console.log("   back:  " + JSON.stringify(back.meaning).slice(0, 90) + "  [" + back.pos + "]");
  ok(back.meaning.length > 0, "the meaning is on the back");
  ok(back.pos.length > 0, "the part of speech is labelled", back.pos);
  ok(back.fieldBorder !== "0px", "the deck's own CSS reached the card", back.fieldBorder);
  await pg.screenshot({ path: "/tmp/ukbi-" + LEVEL + "-back.png" });

  // ------------------------------------------- walk to a card with an affix family
  // Grade EASY, never Good: a new card graded Good requeues as a learning step and comes straight
  // back, so the walk stands still.  THE BACK IS THE LAST `.uc-card`, not the first -- after a reveal
  // both sides are in the document, the front hidden by CSS, because the back renders {{FrontSide}}.
  // STUDYING 240 CARDS LEVELS THE READER UP, AND A LEVEL BUYS AN ARTEFACT CHEST.  The chest overlay
  // is modal and deliberately not dismissed by a backdrop click, so it intercepts the pointer and the
  // walk stops dead on a timeout that names an SVG.  It is dismissed the way a reader dismisses it,
  // by its own "Save for later", and clicked through the DOM rather than through Playwright's
  // actionability check, which would wait for an element the overlay is still animating.
  const clearOverlays = () => pg.evaluate(() => {
    let n = 0;
    for (const sel of [".chest-pop", ".levelup-pop", ".artefact-pop"]) {
      const pop = document.querySelector(sel);
      if (!pop) continue;
      const btns = [...pop.querySelectorAll("button")];
      const later = btns.find((b) => /save for later|close|done|continue/i.test(b.textContent));
      (later || btns[btns.length - 1] || pop).click();
      n++;
    }
    return n;
  });

  let famCard = null, phraseCard = null, exOK = null, i = 0, chests = 0;
  // The cap is `WALK_CAP`, measured off this deck up at the top of the file -- see the comment there.
  for (; i < WALK_CAP && (!famCard || !phraseCard || !exOK); i++) {
    const card = await pg.evaluate(() => {
      const cards = [...document.querySelectorAll(".uc-card")];
      const c = cards[cards.length - 1] || document;
      const t = (s) => { const e = c.querySelector(s); return e ? e.textContent.trim() : ""; };
      const fi = [...c.querySelectorAll(".uc-forms .uc-fi")].map((e) => ({
        label: (e.querySelector(".uc-fl") || {}).textContent || "",
        form: (e.querySelector("b") || {}).textContent || "",
        head: e.classList.contains("uc-fhead"),
        colour: getComputedStyle(e.querySelector("b") || e).color,
      }));
      const exs = [...c.querySelectorAll(".uc-exi")].map((e) => ({
        id: (e.querySelector(".uc-exz") || {}).textContent || "",
        en: (e.querySelector(".uc-exe") || {}).textContent || "",
        bold: (e.querySelector(".uc-exz b") || {}).textContent || "",
        boldColour: e.querySelector(".uc-exz b")
          ? getComputedStyle(e.querySelector(".uc-exz b")).color : "",
      }));
      return { word: t(".uc-word"), pos: t(".uc-pos"), meaning: t(".uc-field"), fi, exs };
    });
    if (!famCard && card.fi.length >= 3 && card.fi.some((f) => f.label === "passive")) famCard = card;
    if (!phraseCard && / /.test(card.word)) phraseCard = card;
    if (!exOK && card.exs.length === 3 && card.exs.every((e) => e.bold && e.en)) exOK = card;
    if (famCard && !fs.existsSync("/tmp/ukbi-" + LEVEL + "-family.png")) {
      // open the sentence fold too, so the one screenshot kept shows both of the things an
      // Indonesian card exists for: the affix family, and the word in use
      await pg.evaluate(() => {
        const d = [...document.querySelectorAll(".uc-card")].pop();
        const f = d && d.querySelector(".uc-fold");
        if (f) f.open = true;
      });
      await pg.waitForTimeout(500);          // let the card settle before looking at it
      await pg.screenshot({ path: "/tmp/ukbi-" + LEVEL + "-family.png" });
    }
    if (await pg.$(".chest-pop, .levelup-pop, .artefact-pop")) {
      chests += await clearOverlays();
      await pg.waitForTimeout(140);
    }
    if (!(await pg.$(".grade[data-g='easy']"))) break;
    await pg.evaluate(() => document.querySelector(".grade[data-g='easy']").click());
    await pg.waitForTimeout(70);
    if (await pg.$("#reveal-btn")) {
      await pg.evaluate(() => document.querySelector("#reveal-btn").click());
      await pg.waitForTimeout(70);
    }
  }
  console.log("   walked " + i + " cards, dismissed " + chests + " reward overlays");

  if (WANT.includes("family")) ok(!!famCard, "a card shows a full affix family");
  if (famCard) {
    console.log("   family: " + famCard.word + "  "
      + famCard.fi.map((f) => f.label + " " + f.form).join(" · "));
    ok(famCard.fi.filter((f) => f.head).length === 1,
       "exactly one form is marked as the headword");
    ok(famCard.fi.find((f) => f.head).form === famCard.word,
       "and it is the word the card is asking for",
       famCard.fi.find((f) => f.head).form + " vs " + famCard.word);
    const head = famCard.fi.find((f) => f.head), other = famCard.fi.find((f) => !f.head);
    ok(head.colour !== other.colour, "the headword is coloured apart from its relatives",
       head.colour + " vs " + other.colour);
    ok(famCard.fi.every((f) => f.form && f.form !== famCard.pos),
       "every form in the row is a word");
  }
  ok(!!phraseCard, "a phrase is dealt as a card of its own",
     phraseCard ? phraseCard.word : "");
  ok(!!exOK, "a card carries three sentences, each with an English pair and the word picked out");
  if (exOK) {
    console.log("   sentence: " + JSON.stringify(exOK.exs[0].id).slice(0, 96));
    ok(exOK.exs.every((e) => e.id.toLowerCase().includes(e.bold.toLowerCase())),
       "the bolded run really is in the sentence");
    ok(exOK.exs[0].boldColour !== "rgb(0, 0, 0)", "and is coloured", exOK.exs[0].boldColour);
  }

  // ---------------------------------------------------------------- the reverse direction
  await pg.goto(base + "#decks", { waitUntil: "load" });
  await pg.waitForTimeout(500);
  const rev = await pg.evaluate(() => {
    const r = [...document.querySelectorAll("[data-usubtpl]")]
      .find((x) => /English . Indonesian/.test(x.textContent));
    if (!r) return null;
    r.querySelector("[data-usubtpl]") ? 0 : 0;
    (r.querySelector("button[data-usubtpl]") || r).click();
    return true;
  });
  ok(rev, "the English → Indonesian direction can be added");

  ok(errs.length === 0, "no console errors", errs.slice(0, 3).join(" | "));
  console.log("\n" + (fails ? "FAIL " + fails + " of " + checks : "PASS all " + checks + " checks"));
  console.log("screenshots: /tmp/ukbi-" + LEVEL + "-{front,back,family}.png");
  await browser.close();
  server.close();
  process.exit(fails ? 1 : 0);
})();
