#!/usr/bin/env node
/* ============================================================
   fetch-book.js — import a PUBLIC DOMAIN book into books/<id>.js

     node .claude/fetch-book.js seneca-letters
     node .claude/fetch-book.js seneca-letters --from=1 --to=20
     node .claude/fetch-book.js seneca-letters --force        (ignore the cache)

   Standalone Node helper, run manually — NOT part of the site, and not loaded by it.
   Zero dependencies (Node's own fetch), resumable, and safe to re-run: every chapter is
   cached under .claude/book-cache/<id>/ so a second run costs nothing and a rate-limited
   run picks up where it stopped rather than starting again.

   THE LICENCE RULE, and it is the whole reason this script is narrow.
   Folio hosts the text itself, so only a work whose copyright has EXPIRED may be imported —
   never a modern translation. For a classical author that distinction is the entire question:
   the Latin is two thousand years old and free, and the ENGLISH is a 20th-century work with
   its own separate copyright. Seneca's letters are widely read in Robin Campbell's Penguin
   translation of 1969, which is still in copyright and must NOT be used; what is imported here
   is Richard Mott Gummere's Loeb Classical Library translation (volumes 1917 / 1920 / 1925),
   published before 1929 and therefore public domain in the United States. Wikisource carries
   the explicit PD tag. Each entry in BOOKS below records that reasoning in `rights`, which is
   printed on the book's own page — a reader (and the next person to add a book) can see on what
   grounds the text is being served.

   WHAT IT WRITES
   books/<id>.js pushes onto window.FOLIO_BOOKS_IN rather than assigning a global, exactly as
   the i18n bundles do: the file is LAZY (bundle "book:<id>" in app.js) and may land before or
   after the reader opens the page, so the ingest hook drains a queue instead of racing a slot.
   ============================================================ */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const UA = "FolioStudySite/1.0 (public-domain text import; https://github.com/pokfus/folio)";

/* ---------- the books this script knows how to fetch ----------
   `source` is a Wikisource page-title pattern; `chapters` the numbers to walk. Adding a book
   means adding an entry here — the extractor below is generic over Wikisource's ORDINARY page
   layout, a transcluded scan of a single column of prose. A book whose pages are laid out some
   other way declares `layout`, and there is one such: see "parallel" on the Art of War below. */

/* The Art of War's thirteen chapter titles, TRANSCRIBED from the contents page of Giles's own
   edition, where they read "Section I: Laying Plans" and so on. They are a table here rather than a
   walk of that page because `chapterTitles()` below reads Seneca's contents table specifically — it
   keys on a /Letter_<digits> href, and this book's contents link to /Section_<Roman numeral>. Thirteen
   transcribed strings are cheaper and easier to check than a second parser, and the house rule is the
   same either way: a title is transcribed, never composed. */
const AOW_TITLES = [
  "Laying Plans", "Waging War", "Attack by Stratagem", "Tactical Dispositions", "Energy",
  "Weak Points and Strong", "Manœuvring", "Variation of Tactics", "The Army on the March",
  "Terrain", "The Nine Situations", "The Attack by Fire", "The Use of Spies",
];

/* The Republic's ten book-titles, TRANSCRIBED from the headings this edition prints above each book
   ("BOOK V. / ON MATRIMONY AND PHILOSOPHY"). They are a table here for the reason AOW_TITLES is one:
   chapterTitles() below reads a contents TABLE, and this volume's contents page is not one. The
   printed headings are set in capitals and are given here in the same title case titleCase() would
   have produced, so a title read off the page and a title read off a contents table look alike on the
   shelf. Transcribed, never composed — these are the edition's own descriptions of its books, not a
   modern summary of what each one argues. */
const REPUBLIC_TITLES = [
  "Of Wealth, Justice, Moderation, and Their Opposites",
  "The Individual, the State, and Education",
  "The Arts in Education",
  "Wealth, Poverty, and Virtue",
  "On Matrimony and Philosophy",
  "The Philosophy of Government",
  "On Shadows and Realities in Education",
  "Four Forms of Government",
  "On Wrong or Right Government, and the Pleasures of Each",
  "The Recompense of Life",
];

/* The twelve lives' names, TRANSCRIBED from the labels this edition files them under — the same
   names Perseus's catalogue records for its twelve English texts, which are the running heads of the
   printing itself. They are a table here for the reason AOW_TITLES and REPUBLIC_TITLES are: there is
   no contents table to walk, because this edition arrives as twelve separate files rather than as one
   volume. A title is transcribed, never composed — "Caligula" is what the edition calls the fourth
   life, not a description of it that has been thought up here. */
const CAESAR_TITLES = [
  "Julius Caesar", "Augustus", "Tiberius", "Caligula", "Claudius", "Nero",
  "Galba", "Otho", "Vitellius", "Vespasian", "Titus", "Domitian",
];

/* Which of Perseus's twelve work ids holds each life, in the order the work itself puts them. The
   ids are not guessable from the numbering — the lives run abo011 to abo022 for chapters 1 to 12 —
   so both halves of the book are addressed through this one table. */
const CAESAR_WORK = (n) => "abo0" + (10 + n);

const BOOKS = {
  "seneca-letters": {
    title: "Letters from a Stoic",
    subtitle: "Moral Letters to Lucilius",
    author: "Seneca",
    translator: "Richard Mott Gummere",
    edition: "Loeb Classical Library, 1917–1925",
    written: "c. 62–65 CE",
    rights:
      "Public domain in the United States: Gummere's translation was published in 1917, 1920 and 1925, " +
      "all before 1929, so its copyright has expired. (The widely-read Penguin translation by Robin " +
      "Campbell, 1969, is still in copyright and is not used here.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/Moral_letters_to_Lucilius",
    /* THE FRONT MATTER — the book's own opening chapter, written by hand and emitted as `intro` into
       books/<id>.js (Aug 2026, on request: "add a chapter at the start with information about the book
       itself and the used translation").

       It lives HERE, in the generator, rather than in app.js's BOOKS registry, for two reasons that
       point the same way. That registry is EAGER — it is loaded by every visitor to the site so the
       shelf can paint without fetching a word — and a page of prose nobody reads until they open the
       book has no business in it. And books/<id>.js is generated and never hand-edited, so an intro
       written straight into that file would be destroyed by the next run of this script. Written into
       the generator, it is authored once and survives every refetch.

       The book's LICENCE half is not here: app.js builds that from its own `rights` / `edition` /
       `sourceUrl` fields, which is where the reader-facing statement has always come from, and it needs
       a real link. This is the essay; that is the paperwork.

       Every claim below is the standard account of the letters and is not to be embroidered. Where the
       scholarship is divided — whether these were letters actually posted — it says so. */
    about: [
      "<b>Letters from a Stoic</b> is a collection of 124 letters written by the Roman statesman and " +
        "philosopher Lucius Annaeus Seneca to his friend Lucilius Junior, then serving as an imperial " +
        "official in Sicily. Seneca calls them <i>Epistulae Morales ad Lucilium</i> — moral letters — and " +
        "that is what they are: short essays on how to live, each opening on some small occasion and " +
        "working outwards from it. A noisy bathhouse below his window becomes a letter on concentration; " +
        "a journey down the coast, one on travel as a cure for unhappiness; the death of a friend, one on " +
        "grief.",
      "Seneca was among the richest and most powerful men of his age, and the letters were written at the " +
        "end of it. Born in Spain around the beginning of the first century, he made his name in Rome as " +
        "an orator and writer, was exiled to Corsica by the emperor Claudius, recalled to tutor the young " +
        "Nero, and then spent years as the most senior adviser to Nero's court. He withdrew from public " +
        "life around 62 CE, and it is from that retirement that these letters date. In 65 CE, implicated " +
        "in a conspiracy against the emperor, he was ordered to take his own life and did.",
      "Whether they were letters in the ordinary sense — sealed, carried, answered — has been argued over " +
        "for a long time, and no answer commands agreement. They address a real man, they refer to real " +
        "journeys and real weather, and they read as though sent; they are also carefully shaped, and " +
        "Seneca plainly expected them to be read by more people than Lucilius. What survives is 124 " +
        "letters in twenty books, and there were once more: the later Roman writer Aulus Gellius quotes a " +
        "book of them numbered beyond any we still have.",
      "They are the most approachable Stoic writing to come down to us, and the least doctrinaire. Seneca " +
        "is not building a system — Stoic physics and logic barely appear — but arguing with a friend, " +
        "and with himself, about time, fear, friendship, money, illness, crowds, old age and death. He is " +
        "also, by his own admission, not a good Stoic: the letters return again and again to the distance " +
        "between what he knows he should want and what he finds he does want, and he writes as a patient " +
        "rather than as a physician.",
      "The letters are numbered here as they have always been numbered, and the small raised figures " +
        "running through each one are its section numbers, by which any passage is cited. The numbered " +
        "notes folded under each letter are the translator's own.",
    ],
    // Gummere's three Loeb volumes, as Wikisource's own transclusions divide them
    parts: [
      { n: 1, label: "Volume I", from: 1, to: 65 },
      { n: 2, label: "Volume II", from: 66, to: 92 },
      { n: 3, label: "Volume III", from: 93, to: 124 },
    ],
    chapterWord: "Letter",
    page: (n) => "Moral letters to Lucilius/Letter " + n,
    indexPage: "Moral letters to Lucilius",
    chapters: Array.from({ length: 124 }, (_, i) => i + 1),

    /* ---------- THE ORIGINAL LANGUAGE ----------
       (Aug 2026, on request: a book should carry the language it was written in beside the
       translation.) Seneca wrote in Latin, and the Latin is the older and simpler licence
       question of the two: it is two thousand years old, so no copyright has subsisted in the
       words for as long as copyright has existed. What CAN carry a copyright is a modern
       critical edition's editorial matter — an apparatus, a conjecture, an editor's punctuation
       — and Latin Wikisource carries the plain text of the old editions rather than any of that.

       It is fetched from a DIFFERENT wiki (la.wikisource.org) and, more awkwardly, is laid out a
       different way: the English site gives one page per letter, and the Latin site gives one page
       per BOOK of the collection, with the letters inside it as headings. So `origPages` lists the
       pages to walk and each one yields several letters, keyed by the Roman numeral its heading
       opens on — which is the letter number the whole tradition uses, and the same number the
       English pages are filed under.

       THE ALIGNMENT IS BY SECTION NUMBER, NOT BY PARAGRAPH, and that is the whole reason this is
       possible at all. Gummere breaks his paragraphs where English prose wants them and the Latin
       breaks where the Latin does, so pairing the nth paragraph with the nth paragraph would drift
       apart within a page and silently mistranslate the layout. What both texts carry — because it
       is how any passage of Seneca is cited, in either language — is the section number, printed
       here as [1] [2] [3] in the Latin and already kept as <span class="bk-n"> in the English. The
       importer converts the Latin's brackets into that same marker, and app.js pairs the two texts
       on it. */
    original: {
      lang: "la",
      langName: "Latin",
      wiki: "la.wikisource.org",
      edition: "Latin Wikisource text of the Epistulae Morales",
      rights:
        "Public domain: Seneca wrote these letters in Latin in the 60s CE, so the words themselves " +
        "have been out of copyright for the whole history of copyright. The text here is the plain " +
        "edition text carried by Latin Wikisource, without a modern editor's apparatus.",
      sourceName: "Latin Wikisource",
      sourceUrl: "https://la.wikisource.org/wiki/Epistulae_morales_ad_Lucilium",
      // one page per book of the collection; the letters are the h2 headings inside each
      pages: [
        "Epistulae morales ad Lucilium/Liber I",
        "Epistulae morales ad Lucilium/Liber II",
        "Epistulae morales ad Lucilium/Liber III",
        "Epistulae morales ad Lucilium/Liber IV",
        "Epistulae morales ad Lucilium/Liber V",
        "Epistulae morales ad Lucilium/Liber VI",
        "Epistulae morales ad Lucilium/Liber VII",
        "Epistulae morales ad Lucilium/Liber VIII",
        "Epistulae morales ad Lucilium/Liber IX",
        "Epistulae morales ad Lucilium/Liber X",
        "Epistulae morales ad Lucilium/Liber XI - XIII",
        "Epistulae morales ad Lucilium/Liber XIV - XV",
        "Epistulae morales ad Lucilium/Liber XVI",
        "Epistulae morales ad Lucilium/Liber XVII - XVIII",
        "Epistulae morales ad Lucilium/Liber XIX",
        "Epistulae morales ad Lucilium/Liber XX",
      ],
      /* Two pages of that wiki are deliberately NOT walked, and both are the same point the front
         matter makes: what survives is 124 letters, and there was once more. "Liber XXI" carries no
         numbered letters at all, and "Liber XXII - Excerpta Gellii" is the fragments Aulus Gellius
         quotes from a book numbered past anything we still have. Neither has an English counterpart
         here, so neither has a column to sit beside. */
    },
  },

  "marcus-aurelius-meditations": {
    title: "Meditations",
    subtitle: "To Himself",
    author: "Marcus Aurelius",
    translator: "C. R. Haines",
    edition: "Loeb Classical Library, 1916",
    written: "c. 170–180 CE",
    /* The same two-works question Seneca's entry opens on, and here it resolves more cleanly than it
       does there. Wikisource carries an explicit split tag on this volume: the ORIGINAL is public
       domain worldwide (Marcus died in 180), and the TRANSLATION is public domain in the United States
       as a pre-1929 publication — and Haines died in 1935, so it is out of copyright in life-plus-70
       countries too, which Gummere's 1917–1925 volumes only reach on the publication-date rule.
       The modern translations a reader is likeliest to own — Hays (2002), Hammond (2006), Gregory
       Hays's and Robin Hard's Oxford and Penguin texts — are all firmly in copyright and are named
       here for the same reason Campbell is named above: so nobody reaches for one later. */
    rights:
      "Public domain in the United States: Haines's translation was published in 1916, before 1929, so " +
      "its copyright has expired. Haines died in 1935, so it is also public domain wherever the term is " +
      "the author's life plus 90 years or less. (The modern translations by Gregory Hays, 2002, and " +
      "Martin Hammond, 2006, are still in copyright and are not used here.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/Marcus_Aurelius_(Haines_1916)",

    /* THE FRONT MATTER — chapter 0, authored here for the reasons the Seneca entry sets out above.
       Every claim is the standard account and is deliberately unembroidered. Two places where the
       popular picture of this book is wrong or contested are said plainly rather than smoothed over:
       the title is not the author's, and the book was not written to be read by anybody. */
    about: [
      "<b>Meditations</b> is a private notebook kept by the Roman emperor Marcus Aurelius during the " +
        "last decade of his life, while he was on campaign on the northern frontier. It was not written " +
        "for publication and has no argument to make: it is a man setting down, over and over, the " +
        "things he wants to remember — that anger is a waste, that fame is nothing, that other people's " +
        "faults are not worth his temper, that he will shortly be dead and so will everyone annoying " +
        "him. Much of it is addressed to himself in the second person, which is why the Greek title " +
        "given it by later editors is simply <i>Ta eis heauton</i>, 'to himself'.",
      "The name <i>Meditations</i> is not the author's, and neither is any other title: the book carries " +
        "none in the manuscripts. Marcus Aurelius ruled from 161 to 180 CE, the last of the emperors " +
        "later called the Five Good Emperors, and spent much of his reign fighting on the Danube and " +
        "managing a plague that ran through the empire. He had been trained in rhetoric and turned to " +
        "philosophy in his twenties; he never taught it, published nothing on it, and appears to have " +
        "shown these notes to no one.",
      "The twelve books are not a sequence and were not composed as one. Book 1 stands apart from the " +
        "rest — it is a list of debts, naming each person who taught him something and saying what it " +
        "was, from his grandfather's good temper to his adoptive father's refusal to be flattered. The " +
        "remaining eleven are collections of short entries, some a page long and many a single " +
        "sentence, in no order that anyone has been able to establish. Two of them carry a note of " +
        "where they were written, among the Quadi and at Carnuntum, which places them on campaign in " +
        "the 170s.",
      "Its Stoicism is practical rather than systematic. Marcus took the framework from Epictetus, whose " +
        "lectures he had read closely and quotes often: that we control our own judgements and nothing " +
        "else, that everything outside them is indifferent, that the world is a single ordered whole and " +
        "a person is a part of it with work to do. What he adds is the difficulty of believing it. The " +
        "same resolutions recur because they kept failing, and the book is at its most striking when the " +
        "most powerful man alive is telling himself, again, to get out of bed.",
      "The books are numbered here as they have always been numbered, and the small raised figures " +
        "running through each one are its section numbers, by which any passage is cited — so an entry " +
        "referred to elsewhere as 'Meditations 4.17' is book 4, section 17. The numbered notes folded " +
        "under each book are the translator's own.",
    ],

    /* One volume, so no `parts`: app.js falls back to a single unlabelled group, which is what a book
       that its own edition does not divide should show. */
    chapterWord: "Book",
    /* The Meditations' twelve books have no titles — the volume's contents page heads them "BOOK I" …
       "BOOK XII" and gives them no names, so that is what they are called here. Composing titles for
       them ("On Death", "On Anger") would be inventing an apparatus the book does not have. */
    titleOf: (n) => "Book " + toRoman(n),
    /* Haines sets his section numbers as plain text at the head of a paragraph rather than as Gummere's
       raised bold numeral, so they are found by markLeadingSections after the body is cleaned rather
       than by the `wst-verse` rewrite inside cleanBody. */
    sections: "leading",
    /* The running heads this scan carries above the text: every book is headed with its own numeral,
       and book 1 additionally carries the volume's half-title. Neither is Marcus's writing. */
    dropHeads: [/^BOOK\s+[IVXLCDM]+$/i, /^MARCUS\s+AURELIUS\s+ANTONINUS$/i],
    page: (n) => "Marcus Aurelius (Haines 1916)/Book " + n,
    /* No contents page is walked: the one this volume has lists the books by numeral only, so there
       are no titles on it to read, and `titleOf` above supplies the same numerals directly. */
    chapters: Array.from({ length: 12 }, (_, i) => i + 1),

    /* ---------- THE ORIGINAL LANGUAGE: KOINE GREEK ----------
       WHY THIS IS NOT WIKISOURCE, and it is the most useful thing in this entry.

       The obvious source is Greek Wikisource's `Τα εις εαυτόν`, and it cannot be used. app.js pairs the
       original against the translation by SECTION NUMBER, never by paragraph order, because the number
       is the one thing two editions of an ancient work genuinely share. Latin Wikisource prints
       Seneca's numbers in the text as [1] [2] [3], so the Latin says which section each passage is.
       Greek Wikisource prints NO numbers at all: each book is a single <ol>, so the only handle it
       offers is a passage's POSITION in that list — and position is not the same claim as a number.
       Measured, its edition divides six of the twelve books differently from Haines (book 4 has 50
       items to Haines's 51, book 7 has 76 to his 75, and so on), so past one splice point per book the
       position runs one out from the section it would have to be. Pairing by position and correlating
       the two sides' section lengths gives 0.98–1.00 on the six books whose counts agree and 0.33–0.71
       on the six that do not. Numbering that text by transferring Leopold's divisions onto it was tried
       and abandoned too: it is a different edition with its own variants, and even where the counts
       agree 15 of 185 openings do not match, so every one of those would have been a guess.

       WHAT IS USED INSTEAD is a TEI edition prepared to the CTS standard, where the numbers are
       STRUCTURE rather than something to be read back out of the prose — `<div subtype="chapter"
       n="17">`. Nothing is inferred, so nothing can be inferred wrongly. Leopold's numbering agrees
       with Haines on 486 of the 487 sections; the single exception is a section 18 in book 12 that
       Leopold's text does not have, and because BOTH sides now state their numbers that pairs as an
       empty cell rather than as a silent one-place shift.

       THE LICENCE HAS TWO LAYERS AND BOTH ARE STATED, because this is the first book here whose
       original is not simply an expired copyright. The TEXT is Jan Hendrik Leopold's Teubner edition of
       1908 — published before 1929, and Leopold died in 1925, so it is public domain on both the
       publication and the life-plus-70/90 rules, exactly like Haines's translation beside it. What is
       NOT merely expired is the DIGITAL edition: the Perseus Digital Library releases its file under
       CC BY-SA 4.0. Folio ships Leopold's words and Leopold's section numbers, re-encoded into its own
       markup — but Perseus is where this text came from, they are credited as its source on the book's
       own page, and their licence is named in `rights` and in the generated file's header. That is a
       deliberate departure from the "expired copyright only" rule at the top of this file, made
       knowingly and recorded here rather than glossed over; if the site would rather not carry a
       CC BY-SA obligation at all, deleting this `original` block and `origLang` in app.js removes the
       Greek and leaves the English untouched. */
    original: {
      lang: "grc",
      langName: "Greek",
      source: "tei",
      url: "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0562/tlg001/tlg0562.tlg001.perseus-grc2.xml",
      edition: "Jan Hendrik Leopold's Teubner text (Leipzig, 1908), from the Perseus Digital Library",
      rights:
        "Two layers, both stated. The text is Jan Hendrik Leopold's edition of the Greek, published by " +
        "Teubner in 1908 and in the public domain — before 1929, and Leopold died in 1925. The digital " +
        "edition it is taken from is prepared by the Perseus Digital Library at Tufts University and is " +
        "released under a Creative Commons Attribution-ShareAlike 4.0 International licence.",
      sourceName: "Perseus Digital Library",
      sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0562.tlg001/",
    },
  },

  "sun-tzu-art-of-war": {
    title: "The Art of War",
    subtitle: "The Oldest Military Treatise in the World",
    author: "Sun Tzu",
    translator: "Lionel Giles",
    edition: "Luzac & Co., London, 1910",
    written: "c. 5th century BCE",

    /* ---------- THE LICENCE, and this is the first book here that has to state a LIMIT ----------
       Seneca and the Meditations both clear the bar twice over: their translators died in 1942 and
       1935, so those texts are out of copyright on the publication rule AND on the life-plus-seventy
       rule most of Europe uses. Giles clears it once. He published in 1910, comfortably before 1929,
       so the translation is public domain in the United States on exactly the same ground as the
       other two — but he lived until 1958, so where the term runs for the author's life plus seventy
       years the translation stays in copyright until the first day of 2029.

       That is said outright in `rights` below, which the book's own front matter prints, rather than
       being smoothed into the same sentence the other two books use. The site's stated bar is that
       the copyright has expired, and the ground the other two are served on is US publication before
       1929; this meets that bar on that ground, and the reader is told where it does not reach
       further. The Chinese underneath is some twenty-five centuries old and free everywhere, which is
       the one half of this that needs no argument at all.

       The modern translations a reader is likeliest to own — Samuel B. Griffith's of 1963 and Roger
       Ames's of 1993 — are firmly in copyright, and are named here for the reason Campbell and Hays
       are named above: so that nobody reaches for one later. */
    rights:
      "Public domain in the United States: Giles's translation was published in 1910 — before 1929 — " +
      "so its copyright has expired there. Giles died in 1958, so where the term is the author's life " +
      "plus seventy years this translation remains in copyright until 2029; the Chinese text it is " +
      "printed beside is roughly twenty-five centuries old and is in the public domain everywhere. " +
      "(The modern translations by Samuel B. Griffith, 1963, and Roger Ames, 1993, are still in " +
      "copyright and are not used here.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/The_Art_of_War_(Sun)",

    /* THE FRONT MATTER — chapter 0, authored here for the reasons the Seneca entry sets out above.
       Two things the popular picture of this book gets wrong are stated plainly rather than smoothed
       over: nobody knows who wrote it or when, and Giles is not a neutral narrator. */
    about: [
      "<b>The Art of War</b> is a treatise on the conduct of war in thirteen short chapters, which " +
        "the title page of this edition calls 'the oldest military treatise in the world'. It is " +
        "attributed to Sun Tzŭ, 'Master Sun', and it has far less to say about battle than its name " +
        "suggests. Its subject is everything standing around a battle: the calculations made before a " +
        "campaign is begun, what it costs to keep an army in the field, ground, weather, morale, " +
        "deception, the management of spies, and the reading of an opponent's mind. Its most quoted " +
        "claim is that the highest skill is to break an enemy's resistance without fighting at all.",
      "Who wrote it, and when, is not settled. The traditional account makes Sun Tzŭ a general named " +
        "Sun Wu who served the king of Wu at the end of the 6th century BCE, and that account is " +
        "given by the historian Sima Qian some four hundred years after the events it describes. Many " +
        "modern scholars place the text as it has come down to us considerably later, in the Warring " +
        "States period, and read it as the work of a school or of several successive hands rather " +
        "than of one man on one occasion. The two views are not wholly exclusive, and the argument " +
        "has not ended.",
      "It has been read and annotated without a break for two thousand years. The earliest commentary " +
        "to survive is by Ts‘ao Kung — the general and statesman Cao Cao, who died in 220 CE — and " +
        "others accumulated around the text after him, of whom the ones quoted most often here are Tu " +
        "Mu, Chang Yü, Li Ch‘üan and Wang Hsi. In the 11th century the book was placed at the head of " +
        "the Seven Military Classics, the canon set for China's military examinations. In 1972 bamboo " +
        "slips from Han tombs at Yinqueshan, in Shandong, produced a copy far older than any then " +
        "known, along with a separate treatise by Sun Bin — which settled a long argument about " +
        "whether the two Suns were one man.",
      "Lionel Giles was an assistant in the Department of Oriental Printed Books and Manuscripts at " +
        "the British Museum, and this is his edition of 1910. It prints the Chinese text, his " +
        "translation of it, and a running commentary several times the length of the text itself, " +
        "drawing on the Chinese commentators, on the histories, and on European military writing. It " +
        "is also, in places, an argument: Giles thought the English version published a few years " +
        "earlier by Captain E. F. Calthrop very bad indeed, and says so on almost every page. Expect " +
        "a translator with opinions, and read the notes as one man's case rather than as a verdict.",
      "The chapters are numbered here as they have always been numbered, and the small raised figures " +
        "running through each one are the section numbers by which any passage is cited — so a line " +
        "referred to elsewhere as 'Sun Tzŭ III. 18' is chapter 3, section 18. The numbered notes " +
        "folded under each chapter are Giles's own commentary, which the printed edition sets in " +
        "small type beneath the sentence it belongs to. The Chinese that he printed beside his " +
        "translation can be shown alongside it here, paired against the same section numbers.",
    ],

    chapterWord: "Chapter",
    /* Transcribed from the edition's own contents page — see AOW_TITLES above. */
    titleOf: (n) => AOW_TITLES[n - 1] || "Chapter " + n,

    /* ---------- THE PARALLEL LAYOUT ----------
       Seneca's and Marcus's pages are one column of prose, and nearly everything in cleanBody is the
       work of undoing a transcluded scan of one. This edition's pages are a PARALLEL TEXT: each
       printed page is transcribed as a two-cell table, the Chinese on the left and Giles's English on
       the right, and a chapter is a run of seven to thirty-three of them. Pointed at that, the
       ordinary extractor does not merely do a worse job — it fails, and in the worse case it would
       fail SILENTLY. `prp-pages-output` on these pages wraps only the footnote list at the foot, so
       slicing from it yields the notes and none of the text; and the two columns, both being table
       cells that the tag stripper unwraps, would come through INTERLEAVED — a line of classical
       Chinese, a line of English, all the way down, with nothing throwing to say so.

       So `layout: "parallel"` selects a second extractor, and it does three things the first cannot.
       It splits the cells and keeps the two columns apart. It lifts Giles's running commentary out of
       the English column into the book's own notes. And it reads the Chinese column's section
       numbers, which is what lets this book have an original at all — see `original` below. */
    layout: "parallel",
    page: (n) => "The Art of War (Sun)/Section " + toRoman(n),
    chapters: Array.from({ length: 13 }, (_, i) => i + 1),

    /* ---------- THE ORIGINAL, AND WHY THIS ONE PAIRS WHERE THE MEDITATIONS COULD NOT ----------
       The long note at the foot of the Meditations entry sets out the rule: app.js sets the two texts
       side by side on their SECTION NUMBERS and never on paragraph order, so an original may ship
       only where it says which section each passage is. Greek Wikisource prints the Meditations as an
       unnumbered list, position is not the same claim as a number, and that book therefore ships in
       English alone. That note ends by saying the Loeb's own facing Greek would settle it exactly,
       since it is the same edition and its divisions are the translator's by construction — and that
       those pages are not transcribed.

       Here they are. This Chinese is not another edition on another wiki: it is the text Giles
       printed on the facing half of his own page, transcribed in the same table, and the numbering is
       his. The first item of each printed page's list carries an explicit `value` and the rest run on
       from it, so the numbers are STATED by the edition rather than counted off a list, and they are
       the English side's numbers by construction.

       Measured before it was believed, across all thirteen chapters: 385 sections, with the two
       columns agreeing exactly — same count, same maximum, no number present on one side and missing
       from the other, and no duplicates. That is why there is no table of corrections here and no
       hedging in the front matter: there was nothing to correct.

       It has no `wiki` or `pages` of its own, unlike Seneca's Latin, because there is nowhere else to
       go: both columns come off the pages already being fetched, and fetchOriginal reads them out of
       the same cache rather than asking Wikisource for them a second time. */
    original: {
      lang: "zh",
      langName: "Chinese",
      edition: "The Chinese text as printed in Giles's edition, Luzac & Co., London, 1910",
      rights:
        "Public domain worldwide: the Chinese text is roughly twenty-five centuries old, and this is " +
        "a transcription of it as printed in Giles's edition of 1910.",
      sourceName: "Wikisource",
      sourceUrl: "https://en.wikisource.org/wiki/The_Art_of_War_(Sun)",
    },
  },

  "plato-republic": {
    title: "The Republic",
    // from this edition's own title page, which sets it under the title in its own line
    subtitle: "An Ideal Commonwealth",
    author: "Plato",
    translator: "Benjamin Jowett",
    edition: "The Colonial Press, New York, 1901",
    written: "c. 375 BCE",

    /* ---------- THE LICENCE, and this is the easiest of the four ----------
       Seneca's and the Meditations' translations are served on the pre-1929 publication rule and
       clear the life-plus-seventy rule as well; Giles's clears only the first, and his entry has to
       say where it stops. This one clears everything with room to spare and needs no limit at all.
       Jowett published his Plato in 1871 and revised it through the 1890s, this printing is of 1901,
       and Jowett died in 1893 — so the translation is out of copyright on the publication rule, on
       life plus seventy, and on life plus a hundred. The Greek beneath it is some twenty-four
       centuries old.

       The 1901 volume carries a Colonial Press copyright notice, which covers what the press added
       to Jowett rather than Jowett: a special introduction by William Cranston Lawton and a set of
       engraved plates. Neither is imported — what is taken is the ten books of the translation — and
       both are pre-1929 in any case.

       The modern translations a reader is likeliest to own — Desmond Lee's Penguin (1955), G. M. A.
       Grube's revised by C. D. C. Reeve (1992), Allan Bloom's (1968) — are all firmly in copyright,
       and are named here for the reason Campbell, Hays and Griffith are named above: so that nobody
       reaches for one later. */
    rights:
      "Public domain worldwide: Benjamin Jowett died in 1893 and his translation was published from " +
      "1871 onwards, this printing in 1901, so its copyright has expired everywhere — on the pre-1929 " +
      "publication rule and on the author's-life rule alike. The Greek it translates is some " +
      "twenty-four centuries old. (The modern translations by Desmond Lee, 1955, Allan Bloom, 1968, " +
      "and G. M. A. Grube revised by C. D. C. Reeve, 1992, are still in copyright and are not used " +
      "here.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/The_Republic_of_Plato",

    /* THE FRONT MATTER — chapter 0, authored here for the reasons the Seneca entry sets out above.
       Three things a reader arriving at this book should be told plainly rather than discover late:
       the argument is about a soul at least as much as about a state, the translation is a Victorian
       one with a manner of its own, and this printing does not carry the Stephanus numbers by which
       Plato is cited anywhere else — which is also why there is no Greek column here. */
    about: [
      "<b>The Republic</b> is the best known of Plato's dialogues and one of the most widely read " +
        "books of political philosophy ever written, though calling it that gives a misleading idea " +
        "of what is in it. It opens on a question about justice — what it is, and whether a just life is better " +
        "for the person living it than an unjust one — and reaches for an answer by building a city " +
        "in speech, on the reasoning that justice will be easier to make out written large in a state " +
        "than small in a single soul. Everything the book is famous for comes out of that " +
        "construction: the rulers who must be philosophers, the guardians who own nothing, the poets " +
        "turned out of the city, and the images of the sun, the divided line and the cave.",
      "Plato was born in Athens around 428 BCE, into a family close to the city's politics, and lived " +
        "through its defeat by Sparta, the brief and violent oligarchy that followed, and the " +
        "restored democracy that put Socrates to death in 399. He founded the Academy in the 380s and " +
        "taught there until he died around 348. The Republic is usually placed in the 370s, in the " +
        "middle of his writing life, and Socrates narrates the whole of it — as he does in no other " +
        "dialogue of this length — recounting the previous day's conversation at the house of " +
        "Cephalus in the Piraeus.",
      "How much of it is meant as a proposal has been argued over since antiquity, and no reading " +
        "commands agreement. Some of the city's arrangements are plainly offered as improvements on " +
        "Athens; others — the rulers' abolition of private families, the falsehood told to hold the " +
        "classes apart, the censorship of Homer — read to many as deliberately hard to swallow, and " +
        "Socrates himself calls the whole city a pattern laid up in heaven that may exist nowhere on " +
        "earth. What is not in doubt is that the city and the soul are built to mirror each other, so " +
        "that the constitutions of Book VIII are also portraits of characters, and the argument ends " +
        "where it began, on which life is worth living.",
      "Benjamin Jowett was Regius Professor of Greek at Oxford and Master of Balliol, and his Plato of " +
        "1871, revised through the rest of his life, made these dialogues English for several " +
        "generations of readers. It is a translation with a manner: fluent, dignified, Victorian, and " +
        "freer with the Greek than a modern version would be, smoothing Plato's abruptness and " +
        "occasionally saying in one graceful sentence what the original says in two awkward ones. It " +
        "is read for its English rather than for close construing, and anyone working on a particular " +
        "passage should check it against a literal modern text.",
      "The books are numbered here as they have always been numbered, and the titles above them are " +
        "this edition's own. Note that Plato is normally cited not by book but by <i>Stephanus " +
        "number</i> — the page and column of Henri Estienne's edition of 1578, which is how a " +
        "reference such as 'Republic 514a' works — and that this printing does not carry those " +
        "numbers in its margins. That is why the Greek is not set beside the translation here, as it " +
        "is for the other books in this library: the two columns are paired on the numbers a text " +
        "states about itself, and this one states none. The numbered notes folded under each book are " +
        "the translator's own.",
    ],

    chapterWord: "Book",
    /* Transcribed from the headings the edition prints — see REPUBLIC_TITLES above. */
    titleOf: (n) => REPUBLIC_TITLES[n - 1] || "Book " + toRoman(n),
    /* Neither of the two section-marking conventions this file knows applies: Jowett's text carries no
       section numbers of any kind, so there is no `sections` here and every chapter comes through as
       one block. fetchEnglish() will say so — "10 chapter(s) with NONE" — and that is the expected
       result for this book rather than a fault to chase. See `about` above and the note at the foot of
       this entry for what follows from it. */
    /* The running heads: the volume's half-title above Book I, and each book's own heading, which the
       edition sets as "BOOK V." and the title on the line beneath — so one pattern anchored to the
       numeral takes the whole block. */
    dropHeads: [/^THE REPUBLIC$/i, /^BOOK\s+[IVXLCDM]+\b/i],
    /* This printing binds engraved plates into the text; the scan labels those leaves rather than
       numbering them. See the note in cleanBody. */
    dropUnnumberedPages: true,
    page: (n) => "The Republic of Plato/Book " + n,
    /* No contents page is walked: this volume's is a list of books with no titles beside them, and the
       titles are printed above the books themselves instead — hence REPUBLIC_TITLES. */
    chapters: Array.from({ length: 10 }, (_, i) => i + 1),

    /* ---------- WHY THERE IS NO `original` HERE ----------
       This is the first book in the library to fail the test the Meditations entry sets out, and it
       fails it on the ENGLISH side, which is new. The rule is that app.js pairs the two columns on
       SECTION NUMBERS and never on paragraph order, so an original may ship only where BOTH texts say
       which section each passage is. Plato has the best-standardised citation system of any ancient
       author — the Stephanus page-and-column of 1578, used identically by every edition and
       translation in every language for four hundred years — and the Greek half is ready and waiting:
       Burnet's Oxford Classical Text of 1902 is on Perseus in the same TEI/CTS encoding the
       Meditations' Greek comes from, with the Stephanus numbers as structure rather than as something
       to be read back out of the prose.

       What is missing is the numbers on Jowett. This Colonial Press printing has no margins to put
       them in and does not carry them anywhere else either — measured over all ten books, there is
       not one Stephanus reference in the text — and it is the only complete transcription of the
       Republic in Wikisource's main namespace. (The Jowett Republic inside "The Dialogues of Plato
       (Jowett)" is an index of red links; everything else on Wikisource's list of English Republics
       is an Index: transcription project not transcluded into mainspace. Checked, all of it, before
       this was concluded.)

       Aligning them anyway would mean deciding by eye where each Stephanus page begins in Jowett's
       English — several hundred judgements per book, on a translation freer than most, with nothing
       to check them against. That is precisely what was tried and abandoned for the Meditations'
       Greek, and it would be worse here. So the Republic ships in English alone, which the reader is
       told in its own front matter, and the day a numbered transcription appears the Greek can be
       added by writing an `original` block and an `origLang` — nothing else about the book would have
       to change. */
  },

  "ovid-metamorphoses": {
    title: "Metamorphoses",
    subtitle: "Of Bodies Changed to Other Forms",
    author: "Ovid",
    translator: "Brookes More",
    edition: "Cornhill Publishing Company, Boston, 1922",
    written: "completed c. 8 CE",

    /* ---------- THE LICENCE, and it has TWO LAYERS on BOTH sides ----------
       The four books above are served on an expired copyright and nothing else; the Meditations' Greek
       was the first text here to carry a second layer, because Perseus releases its DIGITAL editions
       under CC BY-SA 4.0 even where the text they encode is long out of copyright. This is the first
       book whose ENGLISH comes from Perseus too, so the disclosure applies to both columns rather than
       only to the original — which is why it is stated in the book's own `rights` and not just in the
       original's.

       The expired-copyright half is the easiest kind. Brookes More's translation was published in
       Boston in 1922, before 1929, so it is public domain in the United States on exactly the ground
       Gummere, Haines, Giles and Jowett are served on; and More died in 1942, so it also clears the
       life-plus-seventy rule, as Gummere's and Haines's do and Giles's does not.

       For the LATIN the ground is stated by publication date and by the age of the poem, and
       deliberately NOT by the editor's death year. Hugo Magnus's edition was published between 1892 and
       1919 — all before 1929 — and the poem itself is two thousand years old. There is a Wikisource
       author page for a Hugo Magnus who died in 1907, and it is a DIFFERENT MAN, a German
       ophthalmologist; asserting a life-plus-seventy claim off it would have been a fabricated fact
       supporting a licence, which is the worst kind. The publication date is checkable from the edition
       itself and is sufficient, so that is what is claimed.

       The modern translations a reader is likeliest to own — Rolfe Humphries (1955), A. D. Melville
       (1986), Allen Mandelbaum (1993), Charles Martin (2004) and Stephanie McCarter (2022), along with
       Ted Hughes's Tales from Ovid (1997) — are all firmly in copyright, and are named here for the
       reason Campbell, Hays, Griffith and Lee are named above: so that nobody reaches for one later. */
    rights:
      "Two layers, both stated. Brookes More's translation was published in Boston in 1922 — before " +
      "1929 — so its copyright has expired in the United States; More died in 1942, so it is also " +
      "public domain wherever the term is the author's life plus seventy years or less. The digital " +
      "edition it is taken from is prepared by the Perseus Digital Library at Tufts University and is " +
      "released under a Creative Commons Attribution-ShareAlike 4.0 International licence. (The modern " +
      "translations by Rolfe Humphries, 1955, Allen Mandelbaum, 1993, Charles Martin, 2004, and " +
      "Stephanie McCarter, 2022, are still in copyright and are not used here.)",
    sourceName: "Perseus Digital Library",
    sourceUrl: "https://scaife.perseus.org/library/urn:cts:latinLit:phi0959.phi006/",

    /* THE FRONT MATTER — chapter 0, authored here for the reasons the Seneca entry sets out above.
       Three things a reader should be told plainly rather than discover late: the poem is one
       continuous song rather than a collection of separate tales, its author was banished for reasons
       he never explained, and it is numbered here by the LINE of the Latin rather than by any division
       of the English — which is also what lets the Latin sit beside it. */
    about: [
      "<b>Metamorphoses</b> is a poem in fifteen books, running to nearly twelve thousand lines, in " +
        "which Ovid tells something like two hundred and fifty stories of shape and change. It begins " +
        "with the making of the world out of chaos and ends in his own lifetime, and almost everything " +
        "in between turns on a body becoming something else: men and women into trees, birds, springs, " +
        "stones and stars. Daphne into the laurel, Actaeon into the stag his own hounds bring down, " +
        "Arachne into the spider, Narcissus into the flower — these are the versions the western world " +
        "has told ever since, and for most of them Ovid is the reason.",
      "It is not a collection, and that is the thing most often missed about it. Ovid calls it a " +
        "<i>carmen perpetuum</i>, a continuous song, and the tales are joined end to end — one " +
        "character begins another's story, a listener answers with a second, a river god takes up a " +
        "third — so that the poem runs without a break from the first line to the last. The joins are " +
        "part of the art, and some of them are jokes. It is written in dactylic hexameter, the metre " +
        "of Homer and Virgil, which sets an epic frame around subject matter that is often anything " +
        "but heroic.",
      "Publius Ovidius Naso was born at Sulmo, in the mountains east of Rome, in 43 BCE, the year after " +
        "Julius Caesar was killed. He was trained for public life, abandoned it for poetry, and was the " +
        "most celebrated poet in Rome by his forties. Then, in 8 CE, the emperor Augustus banished him " +
        "to Tomis on the Black Sea, at the far edge of the empire. Ovid says the cause was <i>carmen et " +
        "error</i> — a poem and a mistake. The poem is usually taken to be his handbook of seduction, " +
        "the <i>Ars Amatoria</i>; the mistake he never explains, and nobody since has established what " +
        "it was. He wrote from exile for years asking to be recalled, and died there around 17 CE.",
      "By his own account the poem left his hands unfinished. Writing from exile he says he burned his " +
        "copy of it when he was sent away, and that it never had the final revision he meant to give " +
        "it; it survives because friends in Rome already had copies of their own. Whether the burning " +
        "happened as he tells it is not something anyone can now check, and the poem as we have it does " +
        "not read like a draft. What is certain is that it went on being read when much else did not: " +
        "through the Middle Ages, when it was moralised into Christian allegory to keep it respectable, " +
        "and then straight into Chaucer, Shakespeare, Milton, Titian and Bernini.",
      "The translation here is Brookes More's blank verse of 1922, and the Latin printed beside it is " +
        "Hugo Magnus's edition. The small raised figures running through both are LINE numbers of the " +
        "Latin, marking where each passage begins — so a reference such as 'Metamorphoses 1.452' is " +
        "book 1, line 452, and the figures are how you find it. They are also what pairs the two " +
        "columns: an English passage and a Latin one carrying the same figure are the same place in " +
        "the poem. This edition prints no translator's notes, so unlike the other books in this " +
        "library there is no fold of them under each chapter.",
    ],

    /* ---------- A TEI EDITION ON THE ENGLISH SIDE TOO, which is new ----------
       The three source shapes this file knew were a Wikisource page-scan walk, a facing-page parallel
       table, and a TEI file — and the last was available only to an `original`. This book uses one for
       BOTH halves, and it is worth saying why rather than reaching for Wikisource out of habit.

       Wikisource has three English Metamorphoses and none of them will do. Miller's Loeb prose, which
       would have been the natural fourth Loeb after Gummere, Haines and Giles, is transcribed only as
       far as Book VIII — eight books of fifteen, with no Book IX to XV in the main namespace at all.
       Golding's of 1567 and the Garth–Dryden of 1717 are complete and both are firmly out of
       copyright, but the first is Elizabethan verse a modern reader has to decode line by line and the
       second is an eighteenth-century couplet paraphrase by a dozen different hands. More's blank
       verse is plain, complete, and the closest of the four to the register the rest of this library
       reads in.

       The deciding factor is the numbering, as it always is here. See `original` below. */
    source: "tei",
    url: "https://raw.githubusercontent.com/PerseusDL/canonical-latinLit/master/data/phi0959/phi006/phi0959.phi006.perseus-eng3.xml",
    /* The lines are VERSE and are kept as verse: one <br> per line inside the stanza breaks the edition
       marks, rather than reflowed into prose paragraphs. `teiChapters` above cannot do this — it reads
       <p> elements and this file has none, only <l> — hence the second TEI extractor. */
    layout: "verse",
    /* The cards are real divisions in the English file and bare milestones in the Latin one, so each
       side says how to find its own. */
    cards: "div",
    chapterWord: "Book",
    /* The fifteen books have no titles: this edition heads them "Book 1" … "Book 15" and gives them no
       names, exactly as Haines's Meditations does. Composing names for them — "The Creation", "The
       House of Cadmus" — would be inventing an apparatus the poem does not have, and the edition's own
       tale headings are not usable for it (see the note in reconcileCards). */
    titleOf: (n) => "Book " + toRoman(n),
    chapters: Array.from({ length: 15 }, (_, i) => i + 1),

    /* ---------- THE ORIGINAL, AND THE QUESTION THAT DECIDES EVERY ORIGINAL ----------
       The rule the Meditations entry states and the Republic entry fails: app.js pairs the two columns
       on the SECTION NUMBER and never on paragraph order, so an original may ship only where both
       texts say which section each passage is. Plato's Republic has the best citation system in
       antiquity and still ships alone, because Jowett's printing does not carry it.

       Ovid passes, and by a route neither of the shipped originals uses. He is cited by BOOK AND LINE
       — 'Metamorphoses 1.452' — and the Latin file states its line numbers as structure, <l n="452">,
       the way Leopold's Greek states its chapters. What More's translation cannot do is carry those
       numbers line for line: blank verse runs longer than hexameter, and this translation is 18,113
       English lines against 11,927 Latin ones, so its own <l> numbering is More's and not Ovid's.

       What both files DO carry is the CARD — a division of the poem into passages of fifty or sixty
       lines, numbered by the LATIN LINE EACH ONE BEGINS AT. That number is the same claim on both
       sides, stated by the edition rather than counted off a list, and it is the handle used here.

       MEASURED BEFORE IT WAS BELIEVED, over all fifteen books: 156 cards, of which 142 carry the
       identical number on both sides. Thirteen more are one to three lines apart, because the two
       editors put the same boundary at slightly different lines; those are reconciled by
       reconcileCards below, which refuses to do it silently — see the note there, and the tale-name
       check that confirms each one is genuinely the same passage. One English card, book 1 line 650,
       has no Latin counterpart at all and draws as an empty cell, exactly as the Meditations'
       section 12.18 does.

       One quiet fault in the English file was found by this and is worth recording: its Book 3 is
       spelled `subtype="BOOK"` in capitals where every other book is lowercase, so a case-sensitive
       reader silently loses Book 3 as a book and files its ten cards inside Book 2 — fourteen books
       instead of fifteen, with no error anywhere. Every book-division match here is case-insensitive
       for that reason. */
    original: {
      lang: "la",
      langName: "Latin",
      source: "tei",
      layout: "verse",
      cards: "milestone",
      url: "https://raw.githubusercontent.com/PerseusDL/canonical-latinLit/master/data/phi0959/phi006/phi0959.phi006.perseus-lat2.xml",
      edition: "Hugo Magnus's edition (Gotha, F. A. Perthes, 1892–1919), from the Perseus Digital Library",
      rights:
        "Two layers, both stated. The poem is two thousand years old and is in the public domain " +
        "everywhere, and Hugo Magnus's edition of it was published between 1892 and 1919 — before " +
        "1929. The digital edition it is taken from is prepared by the Perseus Digital Library at " +
        "Tufts University and is released under a Creative Commons Attribution-ShareAlike 4.0 " +
        "International licence.",
      sourceName: "Perseus Digital Library",
      sourceUrl: "https://scaife.perseus.org/library/urn:cts:latinLit:phi0959.phi006/",
    },
  },

  "suetonius-twelve-caesars": {
    title: "The Twelve Caesars",
    // the work's own Latin title, which is what its Latin column is an edition of
    subtitle: "De vita Caesarum",
    author: "Suetonius",
    translator: "Alexander Thomson",
    edition: "Gebbie & Co., Philadelphia, 1883",
    written: "c. 121 CE",

    /* ---------- THE LICENCE, and it is the Ovid shape: two layers on both sides ----------
       The expired-copyright half is the least anxious of the six. Thomson's translation was first
       published in 1796 and this printing, revised by J. Eugene Reed, is of 1883 — both so far before
       1929 that the United States rule is not close, and a work published in 1796 by a man writing in
       the 1760s is out of copyright under a life-plus-anything term as well. The Latin beneath it is
       Maximilian Ihm's Teubner text of 1908, also pre-1929, over a work of the early second century.

       Note what is NOT claimed. Thomson's dates are not firmly established — Wikisource records him
       only as "fl. 1761" — so the ground stated in `rights` is the publication dates, which are
       checkable from the editions themselves, and not a death year that would have to be guessed at.
       That is the discipline the Ovid entry above adopted after a Wikisource author page for a
       different Hugo Magnus nearly supplied a fabricated fact in support of a licence.

       The SECOND layer is Perseus's, and it applies to both columns because both come from there —
       the same position the Metamorphoses is in. The digital editions live in Perseus's
       canonical-latinLit repository and are released under CC BY-SA 4.0; the two files of the twelve
       that have been through Perseus's 2026 markup review state that licence in their own TEI
       headers, and the remaining twenty-two are the older release of the same repository and carry a
       bare publication statement. So the obligation is honoured the way the other two Perseus books
       honour it: named in `rights`, printed on the book's own page, and credited on the About page.

       The modern translations a reader is likeliest to own — Robert Graves's Penguin of 1957, revised
       by Michael Grant in 1979, Catharine Edwards's Oxford World's Classics of 2000 and Tom Holland's
       of 2021 — are all firmly in copyright, and are named here for the reason Campbell, Hays,
       Griffith, Lee and Humphries are named above: so that nobody reaches for one later. */
    rights:
      "Two layers, both stated. Alexander Thomson's translation was first published in 1796 and this " +
      "printing, revised by J. Eugene Reed, in 1883 — both long before 1929 — so its copyright has " +
      "expired, on the United States publication rule and on the author's-life rule alike. The Latin " +
      "it is printed beside is Maximilian Ihm's edition of 1908, over a work of the early second " +
      "century. The digital editions both columns are taken from are prepared by the Perseus Digital " +
      "Library at Tufts University and are released under a Creative Commons Attribution-ShareAlike " +
      "4.0 International licence. (The modern translations by Robert Graves, 1957, Catharine Edwards, " +
      "2000, and Tom Holland, 2021, are still in copyright and are not used here.)",
    sourceName: "Perseus Digital Library",
    sourceUrl: "https://scaife.perseus.org/library/urn:cts:latinLit:phi1348/",

    /* THE FRONT MATTER — chapter 0, authored here for the reasons the Seneca entry sets out above.
       Four things a reader should be told plainly rather than discover late: the book is arranged by
       topic and not as a story, its opening pages are lost, its translator passes over some passages
       in silence, and the numbers running through both columns are the chapter numbers Suetonius is
       cited by. The last two are the ones that would otherwise read as faults in the page. */
    about: [
      "<b>The Twelve Caesars</b> is a set of twelve biographies, running from Julius Caesar to " +
        "Domitian and covering the first century and a half of one-man rule at Rome. Suetonius wrote " +
        "it around 121 CE, while he held office in the imperial palace, and it is the reason we know " +
        "most of what we think we know about these men: that Caesar was sensitive about his baldness, " +
        "that Augustus wore extra layers in winter, that Claudius stammered, that Nero sang. Almost " +
        "every later portrait of the early emperors — the histories, the novels, the television — " +
        "runs back to this book.",
      "It is not a narrative, and that is the thing most often missed about it. Suetonius says he will " +
        "set out each life <i>per species</i>, by categories rather than by date, and he does: family " +
        "and birth, then career, then buildings and public acts, then appearance, habits, private " +
        "life, and finally death and omens. The effect is a dossier rather than a story. It also " +
        "means the same reign is gone over several times from different angles, and that the famous " +
        "damning details arrive in a list rather than in a plot — which is part of why they are so " +
        "quotable and why historians treat them with care.",
      "Gaius Suetonius Tranquillus was born around 69 CE, the year of the four emperors, into the " +
        "Roman knightly class rather than the senatorial one. He was a friend of the younger Pliny, " +
        "who wrote letters on his behalf, and he made his career as an imperial secretary, ending as " +
        "the official in charge of the emperor Hadrian's correspondence — a post that put the palace " +
        "archives within reach, and it shows: he quotes documents, wills and Augustus's own letters " +
        "in a way no other ancient biographer does. He was dismissed around 122 CE, for reasons the " +
        "sources give only vaguely, and nothing certain is known of him afterwards.",
      "The book has lost its opening. What survives begins abruptly, with Caesar already in his " +
        "sixteenth year, and the dedication to Septicius Clarus that ancient readers knew is gone " +
        "along with the first chapters — the Latin here opens on the mark an editor uses for a gap in " +
        "the manuscripts. Some of what Suetonius wrote elsewhere is lost in the same way, and the " +
        "twelve lives are themselves the surviving part of a much larger output on Roman writers, " +
        "customs and antiquities.",
      "The translation is Alexander Thomson's, first published in 1796, in the revision of 1883; the " +
        "Latin printed beside it is Maximilian Ihm's edition of 1908. Two things follow from the age " +
        "of the translation and should not be mistaken for faults in this page. Suetonius is frank " +
        "about his subjects' sexual lives, and Thomson is not: two chapters — the forty-ninth of " +
        "Julius Caesar and the twenty-ninth of Nero — are passed over entirely, with the edition " +
        "saying so in a note where the text should be, and a few others are shortened. And the small " +
        "raised figures running through both columns are the chapter numbers by which any passage is " +
        "cited, so that a reference such as 'Nero 16' is a number you can find on the page; they are " +
        "also what pairs the two texts, an English chapter and a Latin one carrying the same figure " +
        "being the same place in the book. The numbered notes folded under each life are the " +
        "translator's and his editor's.",
    ],

    /* ---------- A TEI EDITION IN TWELVE FILES, WHICH IS THE NEW SHAPE HERE ----------
       The three TEI books above are each ONE file holding the whole work, split into books inside it.
       Suetonius is catalogued the way antiquity actually transmitted him — as twelve separate lives —
       so Perseus gives twelve files per language, and a Folio CHAPTER is one whole file rather than a
       division inside one. Hence `perChapter`, and a `url` that takes the chapter number.

       THE PAIRING, which is the only question that decides whether an original can ship at all.
       Suetonius is cited by life and CHAPTER — "Divus Iulius 32", "Nero 16" — and both editions state
       their chapter numbers as STRUCTURE, `<div subtype="chapter" n="32">`, in the CTS encoding the
       Meditations' Greek comes from. Nothing has to be read back out of the prose.

       MEASURED BEFORE IT WAS BELIEVED, over all twelve lives and both languages: 541 Latin chapters
       against 551 English divisions, and eleven of the twelve lives agree with the standard chapter
       count exactly on both sides. Length correlation across the 539 paired chapters is 0.971, and
       66% of the Latin's proper names of six letters or more are present in the English chapter of
       the same number — which is what a real translation looks like through a check that has to match
       inflected Latin against English (Augustum against Augustus) on a five-letter prefix.

       TWO THINGS THE MEASUREMENT FOUND, and both would have been invisible without it.

       · THE ATTRIBUTE ORDER IS NOT STABLE ACROSS THE FILES. Divus Julius spells its divisions
         `subtype="chapter" n="1"` and the other eleven spell them `n="1" subtype="chapter"`, so a
         regex that expects one order returns 90 chapters for the whole work instead of 551 — eleven
         lives silently reduced to nothing. It is the Metamorphoses' `subtype="BOOK"` fault in a new
         coat, and the answer is the same: read the attributes independently of their order, which is
         what teiSections below does. (The first count run here was that regex, and it reported a
         perfectly plausible-looking table.)

       · AUGUSTUS'S ENGLISH NUMBERING RUNS TWO BEHIND FROM CHAPTER 59 ON, and this is the one place
         the book needs a repair rather than a reading. Perseus's English file for Augustus has 99
         chapter divisions where every edition of Suetonius has 101, and the divergence has a single
         cause: the file runs Ihm's chapters 58, 59 and 60 together into one division, and then
         numbers everything after it sequentially, so its "59" is chapter 61, its "99" is chapter 101,
         and the last two chapters appear to be missing. Left alone, forty-one chapters of Augustus
         would pair the English against the wrong Latin — the failure the Meditations entry warns
         about, arriving quietly: nothing throws, no text is lost, and every chapter faces something.

         IT IS A MARKUP ARTIFACT AND NOT THE EDITION'S NUMBERING, which is why correcting it is a
         repair and not a renumbering. The printed Thomson–Forester text prints LIX. against the
         chapter on the physician Antonius Musa, exactly where Ihm's 59 is, and runs on to CI. — so
         the edition's own printed numbers agree with the Latin's throughout, and it is Perseus's
         sequential `n` that is counting divisions rather than reading numerals. Checked against that
         printing before the offset was applied.

         The repair is `renumber` below, and it is stated rather than smoothed over: applying it takes
         Augustus's length correlation from 0.385 to 0.980 and its proper-name agreement from 45% to
         69%, and moves the unpaired Latin chapters from 100 and 101 — which would have been wrong —
         to 59 and 60, which are precisely the two the English division swallowed. Those two draw as
         empty English cells, exactly as the Meditations' section 12.18 draws as an empty Greek one,
         and their translation sits at the end of chapter 58. That is the honest rendering of an
         edition that ran three chapters together, and the alternative — splitting the merged division
         by eye at the sentence the printed page marks LIX — would be composing structure rather than
         transcribing it.

       WHAT IS DELIBERATELY NOT IMPORTED: each of the twelve English files ends with an essay headed
       "Remarks on Julius Caesar", "Remarks on Augustus" and so on — the edition's own appended
       commentary on the reign, running to a dozen kilobytes apiece. It is filed as a thirteenth
       chapter division numbered `note` (and `appendix` in Divus Julius), and it is skipped for the
       reason the Republic's engraved plates are skipped: it is not Suetonius. It has no counterpart
       in the Latin, so it would draw as a page-long block facing nothing, and it is an eighteenth-
       century editor's historical judgement rather than the text a reader opened the book for.
       teiSections reports every division it skips, so this stays a decision rather than a silence. */
    source: "tei",
    perChapter: true,
    url: (n) => "https://raw.githubusercontent.com/PerseusDL/canonical-latinLit/master/data/phi1348/" +
      CAESAR_WORK(n) + "/phi1348." + CAESAR_WORK(n) + ".perseus-eng2.xml",
    /* Chapter 2 is Augustus. See the long note above for why this exists and what was checked before
       it was written; it is applied to the ENGLISH only, the Latin's numbering being the edition's. */
    renumber: (n, chapter) => (chapter === 2 && n >= 59 ? n + 2 : n),
    chapterWord: "Life",
    titleOf: (n) => CAESAR_TITLES[n - 1] || "Life " + n,
    chapters: Array.from({ length: 12 }, (_, i) => i + 1),
    /* The eight books the work itself is divided into, which is how the lives were published and how
       the manuscripts carry them: one book each down to Nero, then the three short reigns of 69 CE
       together, then the three Flavians together. */
    parts: [
      { n: 1, label: "Book I", from: 1, to: 1 },
      { n: 2, label: "Book II", from: 2, to: 2 },
      { n: 3, label: "Book III", from: 3, to: 3 },
      { n: 4, label: "Book IV", from: 4, to: 4 },
      { n: 5, label: "Book V", from: 5, to: 5 },
      { n: 6, label: "Book VI", from: 6, to: 6 },
      { n: 7, label: "Book VII", from: 7, to: 9 },
      { n: 8, label: "Book VIII", from: 10, to: 12 },
    ],

    original: {
      lang: "la",
      langName: "Latin",
      source: "tei",
      perChapter: true,
      url: (n) => "https://raw.githubusercontent.com/PerseusDL/canonical-latinLit/master/data/phi1348/" +
        CAESAR_WORK(n) + "/phi1348." + CAESAR_WORK(n) + ".perseus-lat2.xml",
      edition: "Maximilian Ihm's edition (Leipzig, Teubner, 1908), from the Perseus Digital Library",
      rights:
        "Two layers, both stated. Suetonius wrote in Latin in the early second century, so the words " +
        "themselves are in the public domain everywhere, and Maximilian Ihm's edition of them was " +
        "published in 1908 — before 1929. The digital edition it is taken from is prepared by the " +
        "Perseus Digital Library at Tufts University and is released under a Creative Commons " +
        "Attribution-ShareAlike 4.0 International licence.",
      sourceName: "Perseus Digital Library",
      sourceUrl: "https://scaife.perseus.org/library/urn:cts:latinLit:phi1348/",
    },
  },

  "lucretius-nature-of-things": {
    title: "On the Nature of Things",
    // the work's own Latin title, which is what its Latin column is an edition of
    subtitle: "De Rerum Natura",
    author: "Lucretius",
    translator: "William Ellery Leonard",
    edition: "E. P. Dutton & Co., New York, 1916",
    written: "c. 55 BCE",

    /* ---------- THE LICENCE, the Ovid shape: two layers on both sides ----------
       The expired-copyright half is among the least anxious here. William Ellery Leonard's verse
       translation was published by Dutton in 1916 — before 1929 — so it is public domain in the
       United States on exactly the ground Gummere, Haines, Giles, Jowett and More are served on; and
       Leonard died in 1944, so it also clears the life-plus-seventy rule, as Gummere's, Haines's and
       More's do and Giles's does not. The poem beneath it was written in the 50s BCE.

       WHAT IS DELIBERATELY NOT CLAIMED, and it is the Ovid discipline applied a second time. That
       entry refused to ground a licence on an editor's death year because the Wikisource author page
       for "Hugo Magnus" turned out to be a different man. Here the gap is more basic: Perseus's Latin
       file NAMES NO EDITOR AND NO DATE — its sourceDesc imprint reads, literally, "Lost information".
       So no editor is named in `edition` or `rights`, no publication date is asserted for the Latin,
       and the ground stated is the age of the poem, which needs no edition to establish it and is
       checkable by anyone. Naming a plausible editor — Munro, Lachmann, Bailey are all one search
       away — would have been a fabricated fact holding up a licence, which is the worst place to put
       one. It is said plainly on the book's own page too, rather than smoothed over.

       The SECOND layer is Perseus's, and it applies to both columns because both come from there —
       the position the Metamorphoses and the Twelve Caesars are in. Neither of these two files
       carries a licence element of its own, so the ground is the repository's own statement: the
       README of PerseusDL/canonical-latinLit says that unless otherwise indicated all contents are
       licensed under a Creative Commons Attribution-ShareAlike 4.0 International licence. Checked
       rather than assumed from the other Perseus books. The obligation is honoured the way theirs is:
       named in `rights`, printed on the book's own page, and credited on the About page.

       The modern translations a reader is likeliest to own — Rolfe Humphries's of 1968, Martin
       Ferguson Smith's revision of the Loeb, Ronald Melville's Oxford of 1997 and A. E. Stallings's
       Penguin of 2007 — are all firmly in copyright, and are named here for the reason Campbell,
       Hays, Griffith, Lee, Humphries and Graves are named above: so that nobody reaches for one. */
    rights:
      "Two layers, both stated. William Ellery Leonard's translation was published in New York in " +
      "1916 — before 1929 — so its copyright has expired in the United States; Leonard died in 1944, " +
      "so it is also public domain wherever the term is the author's life plus seventy years or " +
      "less. The poem it translates was written in the 50s BCE and is in the public domain " +
      "everywhere. The digital editions both columns are taken from are prepared by the Perseus " +
      "Digital Library at Tufts University and are released under a Creative Commons " +
      "Attribution-ShareAlike 4.0 International licence; Perseus's file for the Latin names neither " +
      "an editor nor a date for the text it prints, so none is claimed here. (The modern " +
      "translations by Rolfe Humphries, 1968, Ronald Melville, 1997, and A. E. Stallings, 2007, are " +
      "still in copyright and are not used here.)",
    sourceName: "Perseus Digital Library",
    sourceUrl: "https://scaife.perseus.org/library/urn:cts:latinLit:phi0550.phi001/",

    /* THE FRONT MATTER — chapter 0, authored here for the reasons the Seneca entry sets out above.
       Four things a reader should be told plainly rather than discover late: the poem is an argument
       rather than a story and is trying to do something to them, almost nothing is known about the
       man who wrote it, the one biographical story they may have heard is late and hostile, and the
       small figures running through both columns are Latin line numbers — which are also what pairs
       the two texts. The last would otherwise read as a fault in the page, as would the absence of a
       note fold. */
    about: [
      "<b>On the Nature of Things</b> is a poem in six books, running to some seven thousand four " +
        "hundred lines of Latin hexameter, which sets out to explain the entire universe in physical " +
        "terms. Everything that exists, it argues, is atoms moving in empty space: the earth and the " +
        "stars, the weather, plants and animals, the human body, and the mind and soul along with " +
        "it. From that single premise Lucretius derives the mortality of the soul, the origin of the " +
        "world without a maker, the beginnings of human society and language, and the causes of " +
        "thunder, earthquakes, magnetism and disease.",
      "It is an argument rather than a story, and it is trying to do something to the reader. " +
        "Lucretius is setting out the philosophy of Epicurus, and the point of the physics is " +
        "therapeutic: if the world is atoms and void, then the gods do not intervene in it and the " +
        "soul does not survive the body, so the two great sources of human misery — fear of divine " +
        "punishment and fear of death — rest on nothing. He says himself that he is coating a bitter " +
        "medicine with honey, the honey being the verse. The result is a scientific treatise written " +
        "with the intensity of poetry, and it swings between close physical reasoning and passages of " +
        "great power: the opening hymn to Venus, the attack on the fear of death in Book III, the " +
        "anatomy of love in Book IV, and the plague at Athens on which the poem breaks off.",
      "Almost nothing is known about Titus Lucretius Carus. He was probably born around 99 BCE and " +
        "died around 55 BCE; the poem is addressed to a Roman aristocrat, Gaius Memmius, and Cicero " +
        "mentions it in a letter of 54 BCE, which is very nearly the whole of the contemporary " +
        "record. The story most often repeated about him — that he was driven mad by a love potion, " +
        "wrote in the intervals of his insanity and killed himself — comes from a note by Jerome " +
        "written more than four centuries later, in a Christian tradition with every reason to " +
        "discredit him. There is no earlier trace of it, and most scholars treat it with caution or " +
        "reject it outright.",
      "The poem very nearly did not survive. It was read and imitated in antiquity — Virgil knew it " +
        "well — but its argument had few friends in the Christian centuries that followed, and by the " +
        "Middle Ages it had all but disappeared from circulation. In 1417 the book-hunter Poggio " +
        "Bracciolini found a copy in a German monastery and had it transcribed; every later text " +
        "descends from that recovery and from two ninth-century manuscripts now at Leiden. What came " +
        "back with it was ancient atomism, and it went on to matter a great deal: to Montaigne, to " +
        "the scientific revolution's revival of the atom, and to Thomas Jefferson, who owned several " +
        "copies and once described himself as an Epicurean.",
      "The translation here is William Ellery Leonard's blank verse of 1916. The small raised figures " +
        "running through both columns are LINE numbers of the Latin, marking where each passage " +
        "begins — so a reference such as 'De Rerum Natura 3.830' is book 3, line 830, and the figures " +
        "are how you find it. They are also what pairs the two texts: an English passage and a Latin " +
        "one carrying the same figure are the same place in the poem, and here all two hundred and " +
        "thirteen of them agree exactly. Two things follow from the edition and are not faults in " +
        "this page: it prints no translator's notes, so unlike most of this library there is no fold " +
        "of them under each book, and Perseus's Latin file names no editor for the text it prints, so " +
        "this book cannot tell you whose edition the Latin is.",
    ],

    /* ---------- A VERSE TEI EDITION ON BOTH SIDES — the Ovid shape exactly ----------
       Cited by BOOK AND LINE, like the Metamorphoses, and for the same reason neither text can carry
       the numbers line for line: Leonard's blank verse runs 9,784 lines against the Latin's 7,382, so
       its own line numbering is Leonard's and not Lucretius's. What both files state is the CARD — a
       passage of thirty to sixty lines labelled with the LATIN LINE IT OPENS AT — and that number is
       the same claim on both sides, stated by the edition rather than counted off a list.

       MEASURED BEFORE IT WAS BELIEVED, over all six books: 213 cards on each side, and ALL 213 CARRY
       THE IDENTICAL NUMBER — the cleanest pairing of any book in this library, needing none of the
       reconciliation Ovid's thirteen one-to-three-line differences required. Length correlation
       across the 213 pairs is 0.968. (The proper-name check the Greek established reports a lower
       figure here, 60%, and reading the misses rather than assuming them shows why it is a floor and
       not a warning: most are line-initial Latin adverbs — Praeterea, Denique, Principio — that a
       capital-letter heuristic mistakes for names, and most of the rest are Venus in oblique cases,
       Veneris and Venerem, which a five-letter prefix cannot match to Venus. This poem simply has few
       proper names to check with, being about atoms.)

       THE FAULT THIS BOOK FOUND, which was fixed in teiVerseBooks above rather than worked around:
       Ovid's Latin writes its card boundaries `<milestone n="452" unit="card"/>` and this one writes
       them `<milestone unit="card" n="1"/>`. The old order-fixed pattern therefore returned 213 cards
       for the English and ZERO for the Latin — silently, the fetch succeeding and the whole poem
       arriving as six unpaired blocks with a flawless-looking English column. It is the Suetonius
       attribute-order fault on a different element, and the answer is the same one: read the
       attributes independently of their order. Verified byte-for-byte over Ovid's own two files
       before the change was kept, the extractor being shared.

       ONE THING THE STRIP DOES HERE THAT IT DID NOT DO FOR OVID, measured and recorded rather than
       discovered later. Magnus's <del> elements all sat inside notes and were already gone by the
       time teiVerseBooks removed them; this edition has no notes at all, so its 116 <del> marks are
       live in the text — and they are the editor's brackets round what he judges spurious. All 116
       sit inside a line rather than round whole ones: 84 lines are shortened and survive, and 30 are
       bracketed entire and drop out, taking the Latin from 7,412 lines to 7,382. That is the same
       judgement the Meditations' Greek makes and for the same reason — what ships is the text the
       edition constitutes — but here it changes the count, so the count is stated. */
    source: "tei",
    url: "https://raw.githubusercontent.com/PerseusDL/canonical-latinLit/master/data/phi0550/phi001/phi0550.phi001.perseus-eng1.xml",
    layout: "verse",
    /* The cards are real divisions in the English file and bare milestones in the Latin one — the
       same split Ovid's two files make, so each side says how to find its own. */
    cards: "div",
    chapterWord: "Book",
    /* The six books have no titles: this edition heads them "BOOK I" … "BOOK VI" and gives them no
       names, exactly as Haines's Meditations and More's Ovid do. The subjects are famous enough that
       composing names — "Atoms and Void", "The Mortality of the Soul" — would be tempting and would
       be inventing an apparatus the poem does not have. The English file's own per-card heads
       ("PROEM" and the like) are the editor's running heads, not book titles, and are stripped. */
    titleOf: (n) => "Book " + toRoman(n),
    chapters: Array.from({ length: 6 }, (_, i) => i + 1),

    original: {
      lang: "la",
      langName: "Latin",
      source: "tei",
      layout: "verse",
      cards: "milestone",
      url: "https://raw.githubusercontent.com/PerseusDL/canonical-latinLit/master/data/phi0550/phi001/phi0550.phi001.perseus-lat1.xml",
      /* No editor and no date: see the licence note above. This string says what is known, which is
         where the file came from, and does not fill the gap with a guess. */
      edition: "The Latin text from the Perseus Digital Library, which names no editor for it",
      rights:
        "Two layers, both stated. Lucretius wrote in Latin in the 50s BCE, so the words themselves " +
        "are in the public domain everywhere. The digital edition is prepared by the Perseus Digital " +
        "Library at Tufts University and is released under a Creative Commons Attribution-ShareAlike " +
        "4.0 International licence. Perseus's file names neither an editor nor a publication date " +
        "for the text it prints, so neither is claimed here.",
      sourceName: "Perseus Digital Library",
      sourceUrl: "https://scaife.perseus.org/library/urn:cts:latinLit:phi0550.phi001/",
    },
  },
};

/* ---------- args ---------- */
const argv = process.argv.slice(2);
const id = argv.find((a) => !a.startsWith("--"));
const flag = (name, dflt) => {
  const hit = argv.find((a) => a.startsWith("--" + name + "="));
  return hit ? hit.slice(name.length + 3) : dflt;
};
const FORCE = argv.includes("--force");
/* The two halves can be run apart. A book's English text and its original are separate files from
   separate wikis, and either can need a refetch on its own — most often the original, which is the
   newer half and the one whose layout is still being learned. */
const SKIP_EN = argv.includes("--skip-en") || argv.includes("--only-original");
const SKIP_ORIG = argv.includes("--skip-original");
if (!id || !BOOKS[id]) {
  console.error(
    "usage: node .claude/fetch-book.js <" + Object.keys(BOOKS).join("|") +
    "> [--from=N] [--to=N] [--force] [--only-original] [--skip-original]"
  );
  process.exit(1);
}
const BOOK = BOOKS[id];
const FROM = parseInt(flag("from", BOOK.chapters[0]), 10);
const TO = parseInt(flag("to", BOOK.chapters[BOOK.chapters.length - 1]), 10);

const CACHE = path.join(__dirname, "book-cache", id);
fs.mkdirSync(CACHE, { recursive: true });

/* ---------- fetch with backoff ----------
   Wikisource rate-limits a fast walk and answers with an HTML error page rather than JSON, which
   is why this retries on a PARSE failure and not only on a bad status. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(page, host) {
  const url =
    "https://" + (host || "en.wikisource.org") + "/w/api.php?action=parse&page=" +
    encodeURIComponent(page) + "&prop=text&formatversion=2&format=json";
  let last = "";
  for (let a = 0; a < 6; a++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
      const txt = await r.text();
      const d = JSON.parse(txt);
      if (d.error) throw new Error(d.error.info || "api error");
      return d.parse.text;
    } catch (e) {
      last = e.message;
      await sleep(2500 + a * 4000);
    }
  }
  throw new Error("could not fetch " + page + ": " + last);
}

/* A plain HTTPS fetch with the same backoff as `api`, for an original that does not live on a wiki.
   The Meditations' Greek comes from a TEI file in a git repository rather than from a MediaWiki page,
   so there is no `action=parse` to call and nothing to JSON-decode — but the retry behaviour matters
   just as much, since a truncated body would silently shorten the text rather than fail. */
async function fetchText(url) {
  let last = "";
  for (let a = 0; a < 6; a++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const t = await r.text();
      if (t.length < 1024) throw new Error("suspiciously short body (" + t.length + " bytes)");
      return t;
    } catch (e) {
      last = e.message;
      await sleep(2000 + a * 3000);
    }
  }
  throw new Error("could not fetch " + url + ": " + last);
}

/* ---------- extract the prose ----------
   Wikisource renders a transcluded scan: the letter's body sits in .prp-pages-output, wrapped in
   page-number markers, per-page style links and a footnote list. Everything below reduces that to
   the small tag set Folio's reader understands, with a STACK rather than regex pairs so a dropped
   opening tag drops its closer with it (a lone </span> otherwise leaks into the page and closes
   something it does not own). */
const ALLOWED = new Set(["p", "i", "b", "em", "strong", "br", "blockquote", "sup", "span", "q", "cite"]);

function stripTags(b) {
  const out = [];
  const stack = [];
  let pos = 0;
  const rx = /<(\/?)([a-zA-Z0-9]+)([^>]*?)\/?>/g;
  let m;
  while ((m = rx.exec(b))) {
    out.push(b.slice(pos, m.index));
    pos = rx.lastIndex;
    const closing = !!m[1], name = m[2].toLowerCase(), attrs = m[3] || "";
    if (name === "br") { if (!closing) out.push("<br>"); continue; }
    if (closing) {
      if (stack.length && stack[stack.length - 1].name === name) {
        const kept = stack.pop().kept;
        if (kept) out.push("</" + name + ">");
      }
      continue;
    }
    if (!ALLOWED.has(name)) { stack.push({ name, kept: false }); continue; }
    if (name === "span") {
      // the only span we keep is the section number we made below
      const keep = /bk-n/.test(attrs);
      stack.push({ name, kept: keep });
      if (keep) out.push('<span class="bk-n">');
      continue;
    }
    if (name === "sup") {
      // the marker's data-fn is which NOTE it points at, resolved in cleanBody — carry it through, or
      // a reused note's marker silently reverts to its reading-order number
      if (/class="fn"/.test(attrs)) {
        const fn = attrs.match(/data-fn="(\d+)"/);
        out.push('<sup class="fn"' + (fn ? ' data-fn="' + fn[1] + '"' : "") + "></sup>");
        stack.push({ name, kept: false });
      }
      else { out.push("<sup>"); stack.push({ name, kept: true }); }
      continue;
    }
    out.push("<" + name + ">");
    stack.push({ name, kept: true });
  }
  out.push(b.slice(pos));
  return out.join("");
}

/* The SECOND way a printed edition marks its section numbers, and it needs its own pass.

   Gummere's Loeb sets them as a raised bold numeral, which arrives as its own `wst-verse` element and
   is converted inside cleanBody below — the number is already fenced off in markup of its own, so it
   can simply be rewritten. Haines's Loeb sets them as plain text at the head of the paragraph ("1. Say
   to thyself at daybreak"), which is indistinguishable in the markup from any other sentence opening
   on a figure. So this runs LAST, over the cleaned text, where the paragraph boundaries are finally
   `<p>` and nothing else, and it is guarded the way the Latin's bracketed numbers are: a number is a
   section only when it moves the sequence FORWARD, by a step or a few. A year, a cross-reference or a
   quoted line beginning on a numeral goes backwards or leaps, and is left as the text it is.

   Two forms, and the second is the whole reason this is a function rather than one regex.
   · At the head of a paragraph, optionally after a `<br>` — Book 1's opening section is set under the
     title block and reaches here as `<p><br>\n1. From my Grandfather Verus`, so a rule anchored hard
     to `<p>` finds every section in the work except the very first one a reader meets.
   · MID-PARAGRAPH, in round brackets. There is exactly ONE in the whole of the Meditations — Book 12
     `(15.)` — because Haines runs that section on rather than breaking it out, while keeping the
     traditional number so the passage can still be cited. It is kept for that reason: these markers
     are the citation apparatus, and dropping it would leave book 12 numbered 14, 16, 17. */
function markLeadingSections(b, warn) {
  let seq = 0, found = 0;
  /* ONE pass over both forms, in document order, and that matters: run as two passes the paragraph
     rule reaches the end of the book and leaves `seq` at the last section, after which the
     forward-only guard rejects every parenthesised number as going backwards — so book 12's (15.)
     was silently declined and the book shipped numbered 14, 16, 17. The sequence has to advance in
     READING order, which means the alternatives have to be matched in one sweep. */
  b = b.replace(/<p>(\s*(?:<br>\s*)?)(\d{1,3})\.\s+|\((\d{1,3})\.\)\s*/g, (m, lead, d, paren) => {
    const v = +(d === undefined ? paren : d);
    if (v <= seq || v > seq + 6) return m;
    seq = v; found++;
    const mark = '<span class="bk-n">' + v + "</span> ";
    return d === undefined ? mark : "<p>" + lead + mark;
  });
  if (!found && warn) warn("no section numbers found — the chapter will pair as one whole block");
  return b;
}

function cleanBody(h, noteIds, book, warn) {
  let b = h.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  const i = b.indexOf('<div class="prp-pages-output"');
  if (i < 0) throw new Error("no body");
  b = b.slice(i);
  /* Drop the WRAPPER's own opening tag before the generic div→blockquote pass below, which would
     otherwise turn the container that holds the whole letter into a quotation of the whole letter —
     every paragraph indented behind a rule and set in italic, which is not what Seneca is doing. Its
     closing </div> becomes an unmatched </blockquote> and stripTags discards it (a closer whose opener
     was never pushed is dropped, which is exactly what that stack is for). Wikisource's markup has
     moved under us once already, so this is asserted rather than assumed: whether the wrapper's closer
     falls inside the slice is a property of THEIR page, not of ours.

     THERE CAN BE MORE THAN ONE OF THESE, which is why the match is global rather than anchored to the
     start (Aug 2026, adding the Republic — the first book here whose pages carry two). A transclusion
     is broken into a fresh wrapper wherever something interrupts the run of scan pages: an inserted
     illustration leaf, or the footnote apparatus at the foot. Anchored to position 0 only the first
     wrapper was dropped, and every later one survived as an opener with no closer inside the slice —
     so each of the Republic's ten books ended on a stray empty <blockquote>, an indented rule under
     the last line of Plato that nothing in the text accounts for. The failure is the quiet kind this
     file keeps meeting: nothing throws, no prose is lost, and the chapter is the right length.
     Verified byte-for-byte against the shipped Seneca and Meditations chapters, where there is one
     wrapper and it leads, so a global match and an anchored one do the same thing. */
  b = b.replace(/<div class="prp-pages-output"[^>]*>/g, "");
  /* Cut the note list off the end of the prose. THE CLASS IS A PREFIX, NOT THE WHOLE ATTRIBUTE, and
     that was a real fault: this used to match `<div class="reflist"` with the closing quote, which is
     exactly what Seneca's pages carry — and Haines's carry `<div class="reflist wst-smallrefs">`, so
     the split never fired and every one of the twelve books came through with its entire footnote
     apparatus appended to the text as prose. It is the fifth extraction fault of the same family and
     the same shape as the other four: nothing throws, the chapter is LONGER rather than shorter, the
     note count is right, and only a reader scrolling to the foot of a book meets a wall of "↑ cp.
     Epict. i. 2" where the last section should be. The Footnotes heading is taken as a boundary too —
     MediaWiki emits it whatever the reflist is dressed as, so the two guards fail independently. */
  b = b.split(/<div class="reflist|<hr class="wst-rule"|<div class="mw-heading[^"]*"><h2 id="Footnotes"/)[0];
  /* AN ILLUSTRATION PLATE IS A LEAF THE EDITION NEVER NUMBERED, and that is the handle to take it by
     (Aug 2026, adding the Republic). This printing binds engraved plates into the text — a facsimile
     of a Venetian frontispiece before Book V, the Gemma Augustea cameo before Book VII — each a
     caption, a paragraph about the engraving, and the picture. None of it is Plato, and Folio's
     reader drops images anyway (no <img> in ALLOWED), so left alone they arrive as a heading-shaped
     block, a paragraph on sixteenth-century Venetian printing, and an orphaned caption standing where
     the book ought to begin.

     Matching that prose by its wording would be guesswork about somebody else's page. The scan states
     it instead: Wikisource's page markers carry the edition's OWN pagination in data-page-number, and
     these leaves are labelled "Caption" and "Plate" rather than given a number, because the binder
     inserted them outside the sequence. So the rule is structural — drop a scan page the edition did
     not number, from its marker to the next one — and it needs no knowledge of what is printed on it.
     Measured over all ten books: exactly two such leaves, both in the two books that carry plates,
     and every other page numbered.

     It also fixes the headings for free. dropHeads below only strips blocks from the START of a
     chapter, so while the plates stood in front of them Books V and VII kept their running heads
     where the other eight lost theirs — one of those quiet inconsistencies that reads as a rendering
     fault in two chapters rather than as a rule that did not fire. With the plates gone the heads are
     leading again and the ordinary pass reaches them.

     Declared per book, like dropHeads and for the same reason: an unnumbered leaf is an inserted
     plate in this edition, and could be something else in another. */
  if (book && book.dropUnnumberedPages) {
    b = b.replace(/<span><span class="pagenum[^>]*data-page-number="(?!\d)[^"]*"[\s\S]*?(?=<span><span class="pagenum|$)/g, "");
  }
  b = b.replace(/<span><span class="pagenum[\s\S]*?<\/span><\/span>/g, "");
  b = b.replace(/<span class="pagenum[\s\S]*?<\/span>/g, "");
  b = b.replace(/<link[^>]*\/?>/g, "");
  // the scan's own centred running head — the reader gets our chapter title instead
  b = b.replace(/<div class="wst-center[^"]*"[^>]*>\s*<p>\s*[IVXLC]+\.[^<]*<\/p>\s*<\/div>/g, "");
  // Gummere's section numbers, which are how this text is cited — keep them, as our own marker
  b = b.replace(
    /<span class="wst-verse[^"]*"[^>]*>\s*<sup>\s*<b>\s*(\d+)\.?\s*<\/b>\s*<\/sup>\s*<\/span>/g,
    '<span class="bk-n">$1</span>'
  );
  /* A footnote reference becomes Folio's own marker, and it carries the note it actually points at.
     wireFootnotes still writes the DIGIT — the number in the prose can never disagree with the list —
     but which entry a marker resolves to is decided here, from the href MediaWiki put on it.

     A bare marker takes the next number in reading order, which is right only while every note is
     cited exactly once. Wikisource REUSES a note wherever the translator repeats himself: letter 114
     cites one note four times and another three times, so its 21 notes carry 26 markers. Numbered by
     reading order, every marker after the first repeat points one entry too far, and the five that
     run past the end of the list are DELETED by wireFootnotes — so the letter silently loses the
     markers on its last five annotated claims and mis-points the twenty before them. Six of the
     letters added here do this (80, 82, 85, 94, 95, 114); none of the first 65 does, which is why it
     went unnoticed, and it is invisible to every count: the notes are all present and correct, the
     prose is intact, and nothing throws.

     Resolving the target keeps the two apart — repeats render as a repeated number, which is what a
     note cited twice should look like, and nothing is dropped. Note the id attribute escapes its
     underscore as &#95; while the href does not, so only the note ids need normalising. A marker
     whose target is missing falls back to the bare form rather than inventing a number. */
  b = b.replace(/<sup id="cite[^"]*" class="reference">\s*<a href="#([^"]*)"[\s\S]*?<\/sup>/g, (m, tgt) => {
    const i = noteIds ? noteIds.indexOf(tgt.replace(/&#95;/g, "_")) : -1;
    return i < 0 ? '<sup class="fn"></sup>' : '<sup class="fn" data-fn="' + (i + 1) + '"></sup>';
  });
  b = b.replace(/<sup id="cite[^"]*" class="reference">[\s\S]*?<\/sup>/g, '<sup class="fn"></sup>');
  b = b.replace(/<div class="(?:poem|wst-block-center|wst-center)[^"]*"[^>]*>/g, "<blockquote>");
  b = b.replace(/<\/div>/g, "</blockquote>").replace(/<div[^>]*>/g, "<blockquote>");
  b = stripTags(b);
  b = b.replace(/&#160;|&nbsp;/g, " ").replace(/&#32;/g, " ");
  b = b.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n");
  b = b.replace(/<blockquote>\s*<p>\s*THE EPISTLES OF SENECA\s*<\/p>\s*<\/blockquote>/gi, "");
  b = b.replace(/<blockquote>\s*<p>(Greetings from Seneca[^<]*)<\/p>\s*<\/blockquote>/g, '<p class="bk-salut">$1</p>');
  for (let k = 0; k < 6; k++) {
    b = b.replace(/<blockquote>\s*<\/blockquote>/g, "").replace(/<p>\s*<\/p>/g, "");
    b = b.replace(/<blockquote>\s*(<blockquote>[\s\S]*?<\/blockquote>)\s*<\/blockquote>/g, "$1");
  }
  b = b.replace(/\s+<\/p>/g, "</p>").replace(/<p>\s+/g, "<p>").replace(/\n{2,}/g, "\n").trim();
  /* THE SCAN'S OWN RUNNING HEAD, which is not part of the text and must not be read as part of it.
     Seneca's is handled above, where it arrives as a centred div holding a bare Roman numeral. Haines's
     survives that rule — his heads are "BOOK IV" and, on the first page, the volume's half-title
     "MARCUS AURELIUS ANTONINUS" — and by this point every centred div has become a <blockquote>, so a
     head left in place renders as a QUOTATION at the top of the chapter: the words "BOOK IV", indented
     behind a rule and set in italic, directly beneath a tab and a heading already reading Book IV.
     Matched on the block's TEXT rather than on the markup it arrived in, anchored to the start so only
     a head can go, and declared per book — a phrase worth deleting in one edition is ordinary prose in
     another. The loop is for the first chapter, which carries two of them. */
  if (book && book.dropHeads) {
    for (let k = 0; k < 4; k++) {
      const before = b;
      b = b.replace(/^<blockquote>\s*<p>([\s\S]*?)<\/p>\s*<\/blockquote>\s*/, (m, inner) => {
        const t = inner.replace(/<[^>]*>/g, " ").replace(/&#\d+;|&nbsp;/g, " ").replace(/\s+/g, " ").trim();
        return book.dropHeads.some((rx) => rx.test(t)) ? "" : m;
      });
      if (b === before) break;
    }
    // the line break the head used to sit above, now opening the first paragraph on a blank line
    b = b.replace(/^<p>\s*(?:<br>\s*)+/, "<p>");
  }
  if (book && book.sections === "leading") b = markLeadingSections(b, warn);
  return b;
}

/* The translator's own footnotes — these are the explanatory notes the reader gets.

   The <style> BLOCK is stripped BEFORE the tags are, and that order is the whole of it. Wikisource
   ships each note's font templates as an inline <style> element — the Greek face for a quotation, the
   small caps for A.D./B.C., the no-wrap rule for an ellipsis — and dropping tags first leaves the tags
   gone and the CSS TEXT behind, so a note read
     "A reference to the murder of Caligula, on the Palatine, .mw-parser-output .wst-asc{font-variant:
      all-small-caps}…{padding-left:0}A.D. 41."
   with a paragraph of stylesheet sitting mid-sentence. It shipped in 24 of Seneca's 335 notes, and it
   is invisible to every check here — the note is a non-empty string of the right shape, and only a
   reader opening the fold ever sees it. cleanBody has always stripped <style> first for the prose;
   this is the same guard on the same page's other half.

   The .mw-parser-output sweep after it is belt and braces: MediaWiki also serves these rules through
   TemplateStyles link elements whose CSS the parser may inline without a <style> wrapper, and a rule
   set is recognisable — it starts at that class and runs through balanced { } blocks. */
function stripWikiCSS(s) {
  return s
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/\.mw-parser-output(?:[^{}]*\{[^{}]*\})+/g, "");
}
/* Returns the notes AND their ids, in list order. The ids are what cleanBody resolves each marker's
   href against, so the two must be read from the SAME pass — a note list and a marker map derived
   separately are one Wikisource layout change away from disagreeing with each other.

   Pairing the id with its text in one match also avoids a trap worth writing down: the notes cannot
   be split on "<li", because MediaWiki serves its font templates as <link rel="mw-deduplicated-inline-
   style"> elements INSIDE a note, and "<link" starts with "<li". */
function notesOf(h) {
  const m = h.match(/<ol class="references">([\s\S]*?)<\/ol>/);
  if (!m) return { notes: [], ids: [] };
  const notes = [], ids = [];
  const rx = /<li id="(cite[^"]*)"[\s\S]*?<span class="reference-text">([\s\S]*?)<\/span>\s*<\/li>/g;
  let x;
  while ((x = rx.exec(m[1]))) {
    ids.push(x[1].replace(/&#95;/g, "_"));
    notes.push(
      stripWikiCSS(x[2])
        .replace(/<(?!\/?(i|b|em|strong)\b)[^>]*>/g, "")
        .replace(/&#160;|&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    );
  }
  return { notes, ids };
}

/* ============================================================
   THE PARALLEL-TEXT LAYOUT   (a book declaring layout: "parallel")
   ============================================================
   Giles's Art of War is transcribed one PRINTED PAGE per table, two cells wide: the Chinese on the
   left, his English on the right. A chapter is a run of seven to thirty-three of those tables, and
   everything below exists because the single-column extractor above cannot read them — see the long
   note on `layout` in the BOOKS entry for what it does instead, which is worse than throwing.

   These functions share stripTags and stripWikiCSS with the main extractor and deliberately do NOT
   reuse cleanBody itself. cleanBody is a delicate sequence tuned against two books that are guarded
   by test-library.js, and half of it (the prp-pages-output slice, the reflist split, Gummere's verse
   numbers, Seneca's salutation) is meaningless here while the half that matters is a dozen lines. A
   third book's worth of conditionals threaded through it would put the two shipped books at risk to
   save that dozen; the duplication is the cheaper and the safer of the two. */

/* The matching close for the element opening at `i`. The commentary blocks nest a size-block inside a
   size-block, so a non-greedy regex stops at the inner closer and takes half the note. */
function blockEnd(s, i, tag) {
  const rx = new RegExp("<\\/?" + tag + "\\b[^>]*>", "g");
  rx.lastIndex = i;
  let depth = 0, m;
  while ((m = rx.exec(s))) {
    if (m[0][1] === "/") { depth--; if (depth === 0) return rx.lastIndex; }
    else depth++;
  }
  return -1;
}

/* One page's tables, split into the two columns. The body is everything before the footnote list —
   which on these pages is the ONLY thing inside prp-pages-output, so the slice the main extractor
   opens with would return exactly the part of the page that is not the book. */
function parallelCells(h) {
  const body = h.split(/<div class="reflist|<div class="mw-heading[^"]*"><h2 id="Footnotes"/)[0];
  const tables = body.match(/<table[^>]*class="wst-translation-table"[\s\S]*?<\/table>/g) || [];
  const out = { orig: [], en: [] };
  for (const t of tables) {
    const cs = [];
    const rx = /<td[^>]*>([\s\S]*?)<\/td>/g;
    let m;
    while ((m = rx.exec(t))) cs.push(m[1]);
    if (cs.length < 2) continue;
    out.orig.push(cs[0]);
    out.en.push(cs[1]);
  }
  return out;
}

/* The chapter's own head — "I. Laying Plans." on the English side, "I. 計篇." on the Chinese — which
   is the first thing in the first cell and is a real part of the page rather than a running head.
   It is KEPT, as the leading unnumbered line of the chapter, for a reason that is not decoration:
   twelve of the thirteen chapters open with a note of Giles's ON THE TITLE ("The heading means
   literally 'The Nine Variations', but as Sun Tzŭ does not appear to enumerate these…"), and with the
   head dropped those notes would have to be hung on section 1, which is a different claim about a
   different sentence. Kept, each sits where the printed page puts it. The two heads also pair across
   the columns, so a bilingual reader gets the Chinese chapter title beside the English one. */
function takeHead(cell) {
  const i = cell.search(/<div class="wst-center/);
  if (i < 0) return { head: "", rest: cell };
  const e = blockEnd(cell, i, "div");
  if (e < 0) return { head: "", rest: cell };
  const head = cell.slice(i, e).replace(/<[^>]*>/g, " ").replace(/&#160;|&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  return { head, rest: cell.slice(0, i) + cell.slice(e) };
}

/* MediaWiki wraps a paragraph in <p> only where the wikitext put a blank line before it, so a
   sentence that merely follows a commentary block — or follows another sentence on the same printed
   page — arrives as a BARE TEXT RUN at the top level of the cell. 138 of this book's 163 English
   cells open on one, and fourteen section numbers sit in one mid-cell.

   markGilesSections anchors on <p>, exactly as the main extractor's equivalent does, so a number in a
   bare run is invisible to it — and the failure is the quiet kind this file keeps meeting. Nothing
   throws, the chapter is the right length and the prose is complete; the section simply drops out of
   the numbering, its sentence is swallowed into the section above it, and the Chinese line it should
   have paired with is left facing nothing. It was found by counting the two columns against each
   other, which is the only check that can see it. Every bare run at the top level of a cell is
   therefore wrapped in the paragraph it plainly already is. */
function wrapBareRuns(cell) {
  const wrap = (s) => (/\S/.test(s.replace(/<[^>]*>/g, "")) ? "<p>" + s.trim() + "</p>\n" : s);
  const openRx = /<(p|div|ol|ul|table|blockquote)\b[^>]*>/g;
  let out = "", i = 0;
  for (;;) {
    openRx.lastIndex = i;
    const m = openRx.exec(cell);
    if (!m) { out += wrap(cell.slice(i)); break; }
    out += wrap(cell.slice(i, m.index));
    const e = blockEnd(cell, m.index, m[1]);
    if (e < 0) { out += cell.slice(m.index); break; }
    out += cell.slice(m.index, e);
    i = e;
  }
  return out;
}

/* One commentary block, reduced to the text of a note.

   Giles's own footnotes — twenty in the book, and every one of them inside a commentary block rather
   than on Sun Tzŭ's text — are spliced in here, AT THE POINT THEY WERE CITED, in square brackets. A
   note cannot contain a note: the apparatus numbers markers against one flat list per chapter, so a
   marker inside a note would either point into that list at random or be deleted by wireFootnotes as
   running past its end. Splicing keeps the wording, keeps the position, and the brackets say plainly
   that the join was made here rather than by Giles. */
function commentaryNote(block, refs, refIds) {
  let s = stripWikiCSS(block);
  s = s.replace(/<sup id="cite[^"]*" class="reference">\s*<a href="#([^"]*)"[\s\S]*?<\/sup>/g, (m, tgt) => {
    const i = refIds ? refIds.indexOf(tgt.replace(/&#95;/g, "_")) : -1;
    return i < 0 || !refs[i] ? "" : " [" + refs[i] + "]";
  });
  return s
    /* a space where the block's own paragraphs met, or two sentences are welded into one word */
    .replace(/<\/p>/g, "</p> ")
    .replace(/<(?!\/?(i|b|em|strong)\b)[^>]*>/g, "")
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* Giles's running commentary → the book's notes.

   This edition is a text WITH a commentary, and the proportions are the whole argument: Sun Tzŭ's
   thirteen chapters run to some six thousand words and Giles's notes on them to roughly ten times
   that, set in small type beneath the sentence each belongs to. Folio already has the apparatus for
   exactly this — the numbered fold under a chapter that carries Gummere's and Haines's translators'
   notes — so the commentary is lifted into it rather than left in the flow. Nothing is dropped and
   nothing is invented: one block becomes one note, anchored by a marker at the point the printed page
   anchors it.

   Leaving it inline was the alternative and it loses twice. It buries the text a reader opened the
   book for under ten times its own length of philology and textual argument; and it would make the
   bilingual page useless, setting a line of classical Chinese beside a page of discussion about it,
   since the columns pair by section and one side would be twenty times the height of the other. */
function extractCommentary(en, refs, refIds) {
  const notes = [];
  let out = "", pos = 0;
  const open = /<div class="wst-size-block wst-smaller/g;
  let m;
  while ((m = open.exec(en))) {
    const end = blockEnd(en, m.index, "div");
    if (end < 0) break;
    out += en.slice(pos, m.index);
    notes.push(commentaryNote(en.slice(m.index, end), refs, refIds));
    out += '<sup class="fn" data-fn="' + notes.length + '"></sup>';
    pos = end;
    open.lastIndex = end;
  }
  out += en.slice(pos);
  return { html: out, notes };
}

/* Giles's section numbers, and the one shape of them no other book here has.

   He sets them as plain text at the head of a sentence, as Haines does, so the same forward-only
   guard applies: a number is a section only where it moves the sequence on by a step or a few, and
   anything else — a date, a cross-reference, a quoted line opening on a figure — is left as the text
   it is. What is new is that he sometimes renders two of Sun Tzŭ's sentences as one and heads the
   result with BOTH numbers: "5, 6." in chapter 1 and "13, 14." in chapter 2, twice in 385 sections.

   The label is kept exactly as printed, so the citation a reader copies is the one the edition gives.
   app.js pairs on the first number it can parse out of the marker, and the SAME label is put on the
   matching run of Chinese lines by the caller, so the two columns still agree section for section
   rather than one of them carrying an orphan row. That is why this returns the groups it found. */
function markGilesSections(b, warn) {
  let seq = 0;
  const groups = [];
  b = b.replace(/<p>(\s*(?:<br>\s*)?)((?:\d{1,3}\s*,\s*)*\d{1,3})\.\s+/g, (m, lead, label) => {
    const nums = label.split(",").map((x) => +x.trim());
    if (nums[0] <= seq || nums[0] > seq + 6) return m;
    // a combined head is a RUN — "5, 6", never "5, 9" — or it is not one label for one passage
    if (nums.some((v, i) => i && v !== nums[i - 1] + 1)) return m;
    seq = nums[nums.length - 1];
    groups.push(nums);
    return "<p>" + lead + '<span class="bk-n">' + nums.join(", ") + "</span> ";
  });
  if (!groups.length && warn) warn("no section numbers found — the chapter will pair as one whole block");
  return { html: b, groups };
}

/* The Chinese column, grouped to the English column's own sections.

   The numbering is read off the list rather than counted: the first item of each printed page's list
   carries an explicit `value` and the rest run on from it, so what is recorded here is the edition's
   statement about its own text. An item MediaWiki emits empty is the continuation of the one before
   it across a page break — it is skipped, and the explicit `value` that follows re-anchors the count
   in any case.

   The grouping then follows `groups` from the English side, so that where Giles heads one sentence
   "5, 6." both Chinese lines sit in one row under the same label instead of the second becoming a row
   with an empty English cell. */
function parallelOriginalHtml(cells, groups, head, warn) {
  const lines = {};
  let cur = 0;
  for (const cell of cells) {
    const rx = /<li([^>]*)>([\s\S]*?)<\/li>/g;
    let m;
    while ((m = rx.exec(cell))) {
      const v = (m[1] || "").match(/value="(\d+)"/);
      if (v) cur = +v[1]; else cur++;
      const inner = stripWikiCSS(m[2] || "")
        .replace(/<(?!\/?(i|b|em|strong)\b)[^>]*>/g, "")
        .replace(/&#160;|&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (!inner) continue;
      lines[cur] = lines[cur] ? lines[cur] + " " + inner : inner;
    }
  }
  const nums = Object.keys(lines).map(Number).sort((a, b) => a - b);
  /* The pairing rests on these numbers, so the two things that would quietly break it are asserted
     rather than hoped for: a gap in the run, and a section the English side never claimed. */
  if (nums.length && (nums[0] !== 1 || nums[nums.length - 1] !== nums.length)) {
    warn("original: section numbers are not a clean 1–N run (" + nums.length + " lines, highest " + nums[nums.length - 1] + ")");
  }
  const out = [];
  if (head) out.push('<p class="bk-head">' + head + "</p>");
  const used = new Set();
  for (const g of groups) {
    const parts = g.map((n) => { used.add(n); return lines[n]; }).filter(Boolean);
    if (!parts.length) { warn("original: no text for section " + g.join(", ")); continue; }
    out.push('<p><span class="bk-n">' + g.join(", ") + "</span> " + parts.join("</p>\n<p>") + "</p>");
  }
  const orphan = nums.filter((n) => !used.has(n));
  if (orphan.length) warn("original: " + orphan.length + " section(s) the translation never numbers: " + orphan.slice(0, 6).join(", "));
  return out.join("\n");
}

/* Both columns of one chapter, from one fetch of one page. */
function extractParallel(h, book, warn) {
  const { notes: refs, ids: refIds } = notesOf(h);
  const cols = parallelCells(h);
  if (!cols.en.length) throw new Error("no translation tables found");

  let enHead = "", origHead = "";
  const enCells = cols.en.map((c, i) => {
    let s = c.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<link[^>]*\/?>/g, "").replace(/<!--[\s\S]*?-->/g, "");
    if (i === 0) { const t = takeHead(s); enHead = t.head; s = t.rest; }
    return s;
  });
  const origCells = cols.orig.map((c, i) => {
    let s = c.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<link[^>]*\/?>/g, "").replace(/<!--[\s\S]*?-->/g, "");
    if (i === 0) { const t = takeHead(s); origHead = t.head; s = t.rest; }
    return s;
  });

  const comm = extractCommentary(enCells.map(wrapBareRuns).join("\n"), refs, refIds);
  let b = comm.html;
  /* Everything centred that is NOT the head is real: chapter 4 sets two lines of Browning that way.
     They become blockquotes, as the main extractor's centred blocks do. */
  b = b.replace(/<div class="(?:poem|wst-block-center|wst-center)[^"]*"[^>]*>/g, "<blockquote>");
  b = b.replace(/<\/div>/g, "</blockquote>").replace(/<div[^>]*>/g, "<blockquote>");
  b = stripTags(b);
  b = b.replace(/&#160;|&nbsp;/g, " ").replace(/&#32;/g, " ");
  b = b.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n");
  /* A commentary block sits BETWEEN paragraphs, so its marker lands outside them and would render as
     a lone superscript on a line of its own. Put it back inside the sentence it annotates. */
  b = b.replace(/<\/p>\s*(<sup class="fn"[^>]*><\/sup>)/g, "$1</p>");
  for (let k = 0; k < 6; k++) {
    b = b.replace(/<blockquote>\s*<\/blockquote>/g, "").replace(/<p>\s*<\/p>/g, "");
    b = b.replace(/<blockquote>\s*(<blockquote>[\s\S]*?<\/blockquote>)\s*<\/blockquote>/g, "$1");
  }
  b = b.replace(/\s+<\/p>/g, "</p>").replace(/<p>\s+/g, "<p>").replace(/\n{2,}/g, "\n").trim();

  const marked = markGilesSections(b, warn);
  b = marked.html;
  /* The head goes on AFTER stripTags, which drops attributes from every tag it keeps — the same
     reason the main extractor adds Seneca's .bk-salut at the end rather than in the markup. Any
     title note left stranded before the first section is drawn back onto the head, which is what it
     annotates. */
  if (enHead) {
    let note = "";
    b = b.replace(/^(<sup class="fn"[^>]*><\/sup>)\s*/, (m, s) => { note = s; return ""; });
    b = '<p class="bk-head">' + enHead + note + "</p>\n" + b;
  }
  return {
    html: b,
    notes: comm.notes,
    orig: parallelOriginalHtml(origCells, marked.groups, origHead, warn),
  };
}

/* ---------- the chapter titles, from the book's own contents page ---------- */
/* ---------- the chapter titles, from the book's own contents page ----------
   Read ROW BY ROW, pairing the numeral cell with the title cell beside it, rather than trusting the
   href on each link. The contents page is a table — a numeral column, a title column, a page column —
   and both cells of a row link to the same letter, so keying off the href looks equivalent and is
   cheaper. It is not: on the CIII row Wikisource's own markup hyperlinks the TITLE cell to Letter
   104 while the numeral beside it correctly links to Letter 103. Keyed by href, letter 103's title is
   filed under 104 and then discarded (104's own title, later in the document, overwrites it), and 103
   is left with nothing but a bare numeral — which the guard below drops, so it falls back to the
   generic "Letter 103" while every other letter in the book is titled.

   The row is the structure the page actually means, and it is also the more robust reading: it needs
   the numeral's href alone, and survives the title link being wrong, absent or pointed anywhere. */
async function chapterTitles() {
  /* A book need not have chapter titles at all, and the Meditations does not: its twelve books are
     headed "BOOK I" … "BOOK XII" on its own contents page and nowhere given names. `titleOf` is how
     such a book says so, and it is deliberately the book's own numbering rather than an invented
     name — a title here is transcribed, never composed. */
  if (!BOOK.indexPage) return {};
  const h = await api(BOOK.indexPage);
  const txt = h.replace(/<style[\s\S]*?<\/style>/g, "");
  const d = {};
  for (const row of txt.split(/<tr[^>]*>/).slice(1)) {
    let n = null, title = null;
    for (const cell of row.split(/<td[^>]*>/).slice(1)) {
      const a = cell.match(/<a href="\/wiki\/[^"]*\/Letter_(\d+)"[^>]*>([^<]*)<\/a>/);
      if (!a) continue;
      const t = a[2].trim();
      if (/^[IVXLC]+\.$/.test(t)) { if (n === null) n = +a[1]; }   // the numeral column
      else if (title === null) title = t;                          // the title column
    }
    if (n !== null && title) d[n] = titleCase(title);
  }
  return d;
}
// the contents page shouts its titles in capitals; the page sets them in small caps instead
function titleCase(s) {
  const small = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "of", "on", "or", "the", "to", "with"]);
  return s
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((w, i) => {
      if (/^\s+$|^-$/.test(w)) return w;
      if (i > 0 && small.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join("");
}

/* ============================================================
   THE ORIGINAL LANGUAGE
   ============================================================
   A second, smaller extractor, and it is separate from the English one on purpose: the two wikis
   render different things. The English side is a transcluded page SCAN (page-number markers, per-page
   style links, a reflist) and cleanBody above is mostly the work of undoing that. The Latin side is
   plain wikitext — headings and paragraphs — so almost none of that machinery applies, and pointing
   cleanBody at it would mean guarding every one of those rules against a page that has none of them.

   What the two DO share is the section number, and that is the one thing this must get right, because
   app.js pairs the columns on it. */
/* Roman numerals both ways. `roman` READS one, for the Latin wiki's letter headings; `toRoman` WRITES
   one, for a book whose own contents page numbers its chapters that way and titles them no other way.
   A function declaration, so the BOOKS table at the top of the file may call it from a `titleOf`. */
const ROMAN = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
function toRoman(n) {
  const t = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
             [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [v, s] of t) while (n >= v) { out += s; n -= v; }
  return out;
}
function roman(s) {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const v = ROMAN[s[i]], nx = ROMAN[s[i + 1]];
    if (!v) return 0;
    n += nx && nx > v ? -v : v;
  }
  return n;
}

/* Turn one page of the Latin site into { n -> html }.

   The heading is doing two jobs at once: its Roman numeral is the letter number, and the rest of it
   ("SENECA LUCILIO SUO SALUTEM") is the salutation the English prints as its own opening line. It is
   emitted as the same .bk-salut paragraph, so the two columns start level with each other rather than
   with the Latin a line high. Some books drop the salutation and head the letter with a bare numeral;
   those simply get no salutation line, exactly as the page has none. */
function originalChapters(h, warn) {
  const out = {};
  const doc = h.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  const parts = doc.split(/<div class="mw-heading mw-heading2">/).slice(1);
  for (const part of parts) {
    const hm = part.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    if (!hm) continue;
    const head = hm[1].replace(/<[^>]*>/g, "").replace(/&#160;|&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    const num = head.match(/^([IVXLCDM]+)\s*\.\s*(.*)$/);
    if (!num) { warn("heading without a numeral: " + head.slice(0, 60)); continue; }
    const n = roman(num[1]);
    if (!n) { warn("unreadable numeral: " + head.slice(0, 60)); continue; }

    let b = part.slice(part.indexOf("</h2>") + 5);
    // the [recensere] edit link that follows every heading, and the </div> closing the heading block
    b = b.replace(/^\s*<span class="mw-editsection">[\s\S]*?<\/div>/, "");
    b = b.split(/<div class="mw-heading/)[0];
    // the site's own furniture: the prev/next navigation table, the export bar, the ToC placeholder
    b = b.replace(/<table[\s\S]*?<\/table>/g, "");
    b = b.replace(/<div class="ws-noexport"[\s\S]*?<\/div>/g, "");
    b = b.replace(/<meta[^>]*\/?>/g, "").replace(/<link[^>]*\/?>/g, "");

    /* [1] [2] [3] → the marker the English already uses.

       THREE of this wiki's own habits had to be learned rather than assumed, and every one of them was
       invisible until the section counts were compared against the English. Some books print the
       numeral in BOLD inside the brackets ([<b>1</b>], all through Libri VI and VII) and Liber XX
       prints it in ROUND brackets ((1) rather than [1]) — the same marker wearing different clothes
       both times, and normalised first. Without that, seventeen letters came through with no section
       numbers at all, which does not throw, does not shorten the text and does not look wrong: it
       simply leaves those letters with nothing to pair against.

       And the numbering is not always unbroken: letter 23 has no [2], letter 30 jumps from [1] to [5],
       letter 48 skips [8]. Those gaps are in the edition, not in this script, so a marker is accepted
       whenever it moves the sequence FORWARD by a step or a few. What is still refused is a number
       that goes backwards or leaps — which is what an editor's bracketed supplement looks like, and
       what must never be mistaken for a section, since app.js pairs the two texts on these numbers and
       a wrong one would sit the Latin beside the wrong English. Anything refused is left as the
       literal text it is, and reported at the end of the run. */
    b = b.replace(/([[(])\s*<b>\s*(\d{1,3})\s*<\/b>\s*([\])])/g, "$1$2$3");
    let seq = 0;
    b = b.replace(/\[(\d{1,3})\]|\((\d{1,3})\)/g, (m, d, d2) => {
      d = d === undefined ? d2 : d;
      const v = +d;
      if (v <= seq || v > seq + 6) return m;
      seq = v;
      return '<span class="bk-n">' + v + "</span>";
    });
    const left = b.match(/\[\d{1,3}\]/g);
    if (left) warn("letter " + n + ": " + left.length + " bracketed number(s) left as text (" + left.slice(0, 4).join(" ") + ")");
    if (!seq) warn("letter " + n + ": no section numbers found — it will pair as one whole block");

    b = stripTags(b);
    b = b.replace(/&#160;|&nbsp;/g, " ").replace(/&#32;/g, " ");
    b = b.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n");
    for (let k = 0; k < 4; k++) {
      b = b.replace(/<blockquote>\s*<\/blockquote>/g, "").replace(/<p>\s*<\/p>/g, "");
    }
    b = b.replace(/\s+<\/p>/g, "</p>").replace(/<p>\s+/g, "<p>").replace(/\n{2,}/g, "\n").trim();

    /* The salutation, so the two columns start level rather than with the Latin a line high. It is in
       one of two places depending on the book: in the HEADING beside the numeral, or — where the
       heading is a bare numeral, as it is through Libri VI and VII — as the letter's own first
       paragraph. Either way it becomes the .bk-salut line the English side already prints. The second
       case is recognised by shape rather than by book: a short opening paragraph, before any section
       number, ending on the word the salutation always ends on. */
    const salut = num[2].trim();
    if (salut) b = '<p class="bk-salut">' + titleCase(salut) + "</p>\n" + b;
    else b = b.replace(/^<p>((?:(?!<\/p>)[\s\S]){0,90}?salutem\.?)<\/p>/i, '<p class="bk-salut">$1</p>');
    if (b.length < 120) { warn("letter " + n + " came back short (" + b.length + " chars)"); continue; }
    out[n] = b;
  }
  return out;
}

/* ---------- the original as a TEI edition ----------
   The second shape an original-language text can arrive in, and the better one. A wiki gives prose with
   the section numbers printed in it, which have to be read back out of the words; a TEI edition
   prepared to the CTS standard gives the numbers as STRUCTURE — `<div subtype="chapter" n="17">` — so
   there is nothing to infer and nothing that can be inferred wrongly.

   That distinction is the whole reason the Meditations has a Greek column at all. Greek Wikisource
   prints no section numbers, so the only handle it offers is a passage's POSITION in a list, and
   position is not the same claim as a number: its edition divides six of the twelve books differently
   from Haines, so past one splice point per book the position runs one out from the section it would
   have to be. Leopold's numbering is stated rather than counted, and it agrees with Haines on 486 of
   the 487 sections — the single exception being a section 18 in book 12 that Leopold's text does not
   have, which pairs as an empty cell because both sides now say what they are.

   The mapping onto Folio's model: a CHAPTER here is one of the twelve books, and the numbers running
   through it are Leopold's chapter numbers — which are what "Meditations 4.17" means and what Haines
   prints. Leopold's own `section` divisions are a finer split inside a long chapter; they are the same
   numbered entry and are simply concatenated into it. */
function teiChapters(xml, warn) {
  const body = xml.slice(xml.indexOf("<body"));
  if (body.length < 1000) throw new Error("no <body> in the TEI file");
  const marks = (re) => {
    const out = []; let m;
    while ((m = re.exec(body))) out.push({ n: +m[1], at: m.index });
    return out;
  };
  const books = marks(/<div[^>]*subtype="book"[^>]*\bn="(\d+)"[^>]*>/g);
  if (!books.length) throw new Error("no book divisions in the TEI file");
  const out = {};
  books.forEach((b, i) => {
    const seg = body.slice(b.at, i + 1 < books.length ? books[i + 1].at : body.length);
    const cre = /<div[^>]*subtype="chapter"[^>]*\bn="(\d+)"[^>]*>/g;
    const cs = []; let c;
    while ((c = cre.exec(seg))) cs.push({ n: +c[1], at: c.index });
    if (!cs.length) { warn("book " + b.n + " has no chapter divisions"); return; }
    let html = "", seq = 0;
    cs.forEach((ch, j) => {
      const raw = seg.slice(ch.at, j + 1 < cs.length ? cs[j + 1].at : seg.length);
      /* The edition's own numbering is not always unbroken — Leopold's book 12 runs 17, 19, 20, having
         no 18 — so a number that goes BACKWARDS is a fault worth hearing about while a gap is not. */
      if (ch.n <= seq) warn("book " + b.n + ": chapter " + ch.n + " follows " + seq + " — out of order");
      seq = ch.n;
      const text = teiProse(raw);
      if (!text) { warn("book " + b.n + " chapter " + ch.n + " came back empty"); return; }
      // the marker goes INSIDE the first paragraph, which is where bookSections looks for it
      html += text.replace(/^<p>/, '<p><span class="bk-n">' + ch.n + "</span> ");
    });
    out[b.n] = html.trim();
  });
  return out;
}

/* One chapter of TEI down to the small tag set Folio's reader understands. The vocabulary is tiny —
   this file uses only div, p, add, del, quote and lb — but two of those are editorial judgements and
   have to be resolved rather than passed through:

   · `<add>` is text the EDITOR SUPPLIED and the edition prints as part of the text (an article, a
     missing verb). It is kept, because without it the sentence is not the sentence Leopold constituted.
   · `<del>` is text the editor marks as SPURIOUS — the reading he judged does not belong. It is
     dropped, because keeping it would present as Marcus's words something this edition says are not.
     Dropping it yields exactly the text the printed page carries, which is what a reader following the
     English alongside is entitled to. Both are single words or short phrases and there are 82 and 36 of
     them in the whole work.

   A `<quote>` becomes an inline `<q>` rather than a `<blockquote>`, because these quotations sit MID
   SENTENCE ("if to all of them you can still say: <quote>…</quote>, then…") and a block element inside
   a paragraph is invalid nesting that would break the paragraph in two. `<lb/>` becomes `<br>`, which
   is what keeps the verse quotations as verse. */
function teiProse(raw) {
  let b = raw.replace(/<del\b[^>]*>[\s\S]*?<\/del>/g, "");   // the editor's deletions, and their text
  b = b.replace(/<\/?add\b[^>]*>/g, "");                     // the editor's supplements: keep the words
  b = b.replace(/<lb\s*\/?>/g, "<br>");
  b = b.replace(/<quote\b[^>]*>/g, "<q>").replace(/<\/quote>/g, "</q>");
  const ps = [...b.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((m) => m[1]);
  return ps
    .map((p) => p.replace(/<[^>]*>/g, (t) => (/^<\/?(q|br)\b/.test(t) ? (t === "<br>" ? "<br>" : t) : "")))
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((p) => "<p>" + p + "</p>")
    .join("\n");
}

/* ============================================================
   TEI, ONE FILE PER CHAPTER   (a book declaring source:"tei" with perChapter)
   ============================================================
   teiChapters above reads a TEI edition holding a whole work, and finds Folio's chapters as `book`
   divisions inside it. Suetonius is catalogued as antiquity transmitted him — twelve separate lives,
   twelve separate files per language — so here a Folio CHAPTER is one whole file and the numbered
   divisions inside it are its SECTIONS: the chapter numbers any passage of Suetonius is cited by.

   Three things this reader does that teiChapters does not, each of them learned from a file rather
   than anticipated.

   · IT READS THE ATTRIBUTES INDEPENDENTLY OF THEIR ORDER. One of the twelve lives spells its
     divisions `subtype="chapter" n="1"` and the other eleven spell them `n="1" subtype="chapter"`.
     A regex fixing either order returns one life and silently loses the other eleven — the same
     quiet shape as the Metamorphoses' capitalised `subtype="BOOK"`, and just as invisible, since
     what comes back is a shorter book rather than an error.

   · IT LIFTS THE NOTES OUT. This edition's notes are the translator's and his editor's, set inline
     at the point they are cited, and there are about eight hundred of them across the twelve lives —
     historical glosses, dates in the Roman calendar, the Latin behind a rendering. They become
     Folio's per-chapter note fold, each marker carrying the entry it points at rather than its
     position in the queue, which is the rule Seneca's reused notes established.

   · IT SKIPS DIVISIONS THAT ARE NOT CHAPTERS, and says which. Each English file ends with the
     edition's own appended essay on the reign, filed as a division numbered `note` or `appendix`;
     it is not Suetonius and is not imported. Reporting the skips is what keeps that a decision. */
function teiSections(xml, opts, warn) {
  const body = xml.slice(xml.indexOf("<body"));
  if (body.length < 500) throw new Error("no <body> in the TEI file");

  const marks = [];
  const dre = /<div\b([^>]*)>/g;
  let m;
  while ((m = dre.exec(body))) {
    const a = m[1];
    const st = /subtype="([^"]*)"/i.exec(a);
    const n = /\bn="([^"]*)"/.exec(a);
    if (st && st[1].toLowerCase() === "chapter" && n) marks.push({ raw: n[1], at: m.index });
  }
  if (!marks.length) throw new Error("no chapter divisions in the TEI file");

  const notes = [];
  const skipped = [];
  let html = "", seq = 0, kept = 0;
  marks.forEach((c, i) => {
    const raw = body.slice(c.at, i + 1 < marks.length ? marks[i + 1].at : body.length);
    // the appended essay, filed as a division with a word for a number
    if (!/^\d+$/.test(c.raw)) { skipped.push(c.raw); return; }
    const n = opts.renumber ? opts.renumber(+c.raw) : +c.raw;
    /* A number that goes BACKWARDS is a fault worth hearing about; a gap is not, since an edition may
       genuinely have none — and after a renumber the sequence must still climb, which is the cheapest
       check that the repair has not crossed two chapters over each other. */
    if (n <= seq) warn("section " + n + " follows " + seq + " — out of order");
    seq = n;
    const text = teiSectionProse(raw, notes);
    if (!text) { warn("section " + n + " came back empty"); return; }
    kept++;
    // the marker goes INSIDE the first paragraph, which is where bookSections looks for it
    html += (html ? "\n" : "") + text.replace(/^<p>/, '<p><span class="bk-n">' + n + "</span> ");
  });
  return { html: html, notes: notes, count: kept, skipped: skipped };
}

/* One numbered section down to paragraphs, with its notes lifted out into `notes` as it goes.

   THE NOTES COME OUT FIRST and are replaced where they stood by an EMPTY marker carrying the entry
   it points at in `data-fn`. Both halves of that matter. Empty, because the digit a reader sees is
   written by app.js at render time from the list itself, so re-ordering the notes can never leave a
   stale number in a sentence; and carrying its target, because a marker numbered by its position in
   reading order is right only while every note is cited exactly once — the assumption that cost
   Seneca's letter 114 five deleted markers. Notes are collected per LIFE, which is the unit Folio
   folds them under, so the entry number and the reading order do agree here — the attribute is
   written anyway rather than relied upon not to be needed. */
function teiSectionProse(raw, notes) {
  const b = raw.replace(/<note\b([^>]*)>([\s\S]*?)<\/note>/g, (whole, attrs, inner) => {
    const t = teiInline(inner);
    if (!t) return "";
    /* A NOTE MARKED place="inline" IS NOT A FOOTNOTE, and this edition has ten of them: the asterisk
       marks it prints IN THE TEXT where the translator passes something over — "* * * Thomson omits
       material here * * *". TEI's `place` says where the printed page puts a note, and `inline` means
       the text flow rather than the foot, so lifting these into the fold moves them off the page they
       belong on. It also loses a section outright: Nero's chapter 29 is nothing BUT one of these
       marks, so with it gone the paragraph held only a marker, the section came back empty, and the
       Latin's chapter 29 was left facing nothing — which is how the first run of this book shipped 56
       of Nero's 57 chapters with one line of warning to say so. Set in italic, as an editorial
       interpolation in someone else's text should be. */
    if (/place="inline"/.test(attrs)) return " <i>" + t + "</i> ";
    notes.push(t);
    return '<sup class="fn" data-fn="' + notes.length + '"></sup>';
  });
  const ps = [...b.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((x) => teiInline(x[1]));
  return ps.filter(Boolean).map((p) => "<p>" + p + "</p>").join("\n");
}

/* TEI's inline vocabulary down to the four tags Folio's reader understands, plus the footnote marker
   teiSectionProse has already put in. The editorial elements are resolved rather than passed through,
   exactly as teiProse resolves them for the Meditations: `<add>` is the editor's supplement and is
   part of the constituted text, so its words are kept; `<del>` is what he marks as spurious, so it
   goes with its words. Ihm's text carries 125 of the second across the twelve lives.

   `<gap>` KEEPS THE MARK THE EDITION PRINTS, and that is not decoration. Two of them are load-
   bearing: the lacuna at the head of Divus Julius, where the book's lost opening was, and the
   ellipsis this translator leaves in place of the chapters he passes over. Stripped as an unknown
   empty tag — which is what the ordinary sweep would do to it — a chapter Thomson omitted comes
   through as a bare footnote marker floating in an otherwise empty paragraph, and the reader is left
   to guess whether the page has failed. With the mark kept it reads as what it is.

   A `<quote>` becomes an inline `<q>` for teiProse's reason: these sit mid-sentence, and a block
   element inside a paragraph is invalid nesting. Verse quoted inside prose keeps its line breaks —
   Suetonius quotes a good deal of it, epigrams and lines of Homer and Euripides — and `<foreign>`
   becomes italic, which is how the printed page sets the Latin and Greek it glosses. */
function teiInline(s) {
  let b = s;
  b = b.replace(/<del\b[^>]*>[\s\S]*?<\/del>/g, "");
  b = b.replace(/<\/?add\b[^>]*>/g, "");
  b = b.replace(/<gap\b([^>]*?)\/?>/g, (whole, a) => {
    const r = /rend="([^"]*)"/.exec(a);
    return r && r[1].trim() ? " " + r[1].trim() + " " : " … ";
  });
  b = b.replace(/<lb\s*\/?>/g, "<br>");
  b = b.replace(/<\/l>\s*<l\b[^>]*>/g, "<br>").replace(/<\/?l\b[^>]*>/g, "");
  b = b.replace(/<quote\b[^>]*>/g, "<q>").replace(/<\/quote>/g, "</q>");
  b = b.replace(/<foreign\b[^>]*>/g, "<i>").replace(/<\/foreign>/g, "</i>");
  b = b.replace(/<q\b[^>]*>/g, "<q>");
  // everything else unwraps: the words stay, the tagging goes — but never the footnote marker
  b = b.replace(/<(?!\/?(?:i|q|br)\b)(?!sup class="fn")(?!\/sup)[^>]*>/g, "");
  b = b.replace(/&#160;|&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  // a paragraph that held nothing but a page break or a stray anchor is not a paragraph
  return /[^\s<>]/.test(b.replace(/<[^>]*>/g, "")) ? b : "";
}

/* ============================================================
   TEI VERSE   (a book declaring layout: "verse")
   ============================================================
   teiChapters above reads a TEI edition of PROSE: it walks <div> chapters and pulls <p> elements out
   of them. A poem has no <p> at all — every line is an <l>, and the paragraphing is carried by
   milestones between them — so pointing that function at Ovid returns fifteen empty books. This is
   its verse counterpart, and it is used for BOTH halves of the Metamorphoses.

   A CARD is the unit, and the number on it is the LATIN LINE the passage begins at, which is how Ovid
   is cited and the only figure both editions state about the same thing. It is spelled as a real
   division in the English file and as a bare milestone in the Latin one, so the caller says which. */
function teiVerseBooks(xml, opts, warn) {
  const body = xml.slice(xml.indexOf("<body"));
  if (body.length < 1000) throw new Error("no <body> in the TEI file");

  /* THE APPARATUS COMES OUT FIRST, and getting this order wrong is the quiet fault in this file.
     Magnus's notes are a critical apparatus and they CONTAIN <l> elements — the vulgate readings he
     rejects, and the lines he brackets as spurious, each written out as a line of verse inside the
     note. A line sweep run before the notes are removed therefore pulls the apparatus into the poem:
     nothing throws, no book is missing, and the text is simply longer than Ovid wrote it with variant
     half-lines scattered through it. Seventy-four notes, every one of them in the Latin. */
  let b = body.replace(/<note\b[^>]*>[\s\S]*?<\/note>/g, "");
  /* The editor's marks of SPURIOUS text, dropped with their words — the same judgement teiProse makes
     for the Meditations, and for the same reason: what ships is the text the printed page constitutes.
     Every <del> in this edition happens to sit inside a note and so has already gone, which is checked
     rather than assumed; the rule stays because the next edition's may not. */
  b = b.replace(/<del\b[^>]*>[\s\S]*?<\/del>/g, "");
  // the file's own "Book 1" head, where Folio prints its own chapter title
  b = b.replace(/<head\b[^>]*>[\s\S]*?<\/head>/g, "");

  /* CASE-INSENSITIVE, and that is load-bearing rather than defensive. The English file spells Book 3
     `subtype="BOOK"` in capitals and every other book lowercase, so a case-sensitive match returns
     fourteen books and quietly files Book 3's ten cards inside Book 2 — no error, no missing text, and
     a book that has silently ceased to exist as a book. */
  const bs = [...b.matchAll(/<div[^>]*subtype="book"[^>]*\bn="(\d+)"[^>]*>/gi)];
  if (!bs.length) throw new Error("no book divisions in the TEI file");
  /* THE ATTRIBUTES ARE READ INDEPENDENTLY OF THEIR ORDER, and that is load-bearing rather than
     tidiness — it is the Suetonius fault (`subtype` before `n` in one file of twelve and after it in
     the other eleven) arriving on a different element. Ovid's Latin writes its card boundaries
     `<milestone n="452" unit="card"/>` and Lucretius's writes them `<milestone unit="card" n="1"/>`,
     so a pattern that fixes the order returns every card of the one and NOT ONE CARD of the other.

     It fails the quiet way this file keeps meeting: nothing throws, the fetch succeeds, the poem is
     all present — and the whole original comes through as six unpaired blocks, because with no card
     boundaries there is nothing for app.js to pair the two columns on. The English side would look
     perfect throughout. Measured on Lucretius before this was changed: 213 English cards against 0
     Latin ones. */
  const cardMarks = (seg) => {
    const tag = opts.cards === "milestone" ? /<milestone\b([^>]*?)\/?>/g : /<div\b([^>]*)>/g;
    const key = opts.cards === "milestone" ? /\bunit="([^"]*)"/i : /\bsubtype="([^"]*)"/i;
    const marks = [];
    let m;
    while ((m = tag.exec(seg))) {
      const k = key.exec(m[1]);
      const n = /\bn="(\d+)"/.exec(m[1]);
      if (k && k[1].toLowerCase() === "card" && n) marks.push({ n: +n[1], index: m.index });
    }
    return marks;
  };

  const out = {};
  bs.forEach((bk, i) => {
    const seg = b.slice(bk.index, i + 1 < bs.length ? bs[i + 1].index : b.length);
    const cs = cardMarks(seg);
    if (!cs.length) { warn("book " + bk[1] + ": no cards — it would pair as one whole block"); return; }
    // verse before the first card would be dropped in silence; say so instead
    const stray = (seg.slice(0, cs[0].index).match(/<l\b/g) || []).length;
    if (stray) warn("book " + bk[1] + ": " + stray + " line(s) stand before the first card");
    let seq = 0;
    out[+bk[1]] = cs.map((c, j) => {
      const raw = seg.slice(c.index, j + 1 < cs.length ? cs[j + 1].index : seg.length);
      const n = c.n;
      if (n <= seq) warn("book " + bk[1] + ": card " + n + " follows " + seq + " — out of order");
      seq = n;
      /* The tale name each edition prints at this boundary — Magnus's, which BOTH files carry, and
         which reconcileCards uses to check that a reconciled pair really is the same passage. */
      const t = raw.match(/<milestone[^>]*ed="Magnus"[^>]*\bn="([^"]*)"[^>]*unit="tale"[^>]*\/>/);
      return { n: n, tale: t ? t[1].trim() : "", html: teiVerse(raw), lines: (raw.match(/<l\b/g) || []).length };
    }).filter((c) => { if (!c.html) warn("card " + c.n + " came back empty"); return c.html; });
  });
  return out;
}

/* One card's lines, as verse rather than as a paragraph of prose. The para milestones are the
   edition's own stanza breaks; within a stanza the lines are joined with <br>, which is what keeps a
   poem looking like one. Everything else inside a line — the placeName and persName wrappers the
   English file marks its geography with — is unwrapped, keeping the words and dropping the tagging. */
function teiVerse(raw) {
  const paras = [];
  let cur = [];
  const rx = /<milestone[^>]*unit="para"[^>]*\/>|<l\b[^>]*>([\s\S]*?)<\/l>/g;
  let m;
  while ((m = rx.exec(raw))) {
    if (m[1] === undefined) { if (cur.length) { paras.push(cur); cur = []; } continue; }
    const line = m[1].replace(/<[^>]*>/g, "").replace(/&#160;|&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    if (line) cur.push(line);
  }
  if (cur.length) paras.push(cur);
  return paras.map((p) => "<p>" + p.join("<br>") + "</p>").join("\n");
}

/* The cards of one book, assembled into the chapter html, each opening on its own section marker. The
   marker goes INSIDE the first paragraph, which is where bookSections looks for it. */
function teiVerseHtml(cards) {
  return cards
    .map((c) => c.html.replace(/^<p>/, '<p><span class="bk-n">' + c.n + "</span> "))
    .join("\n");
}

/* ---------- reconciling the two columns' card numbers ----------
   142 of the 156 cards carry the identical number on both sides and need nothing. Thirteen are one to
   three Latin lines apart, because Magnus and the editor who aligned More's translation put the same
   tale boundary at slightly different lines. app.js pairs on the marker exactly, so left alone each of
   those thirteen becomes TWO half-empty rows — an English passage facing nothing, then the same Latin
   passage facing nothing — twenty-six broken rows through the poem.

   WHY NUDGING THEM IS NOT THE MISTAKE THE MEDITATIONS ENTRY WARNS ABOUT. That warning is against
   transferring one edition's numbering onto a text that states NONE, where every assignment is a guess
   and 15 of 185 openings proved wrong. Here both texts state their numbers, in the SAME coordinate
   system — the line count of the Latin poem — so a card at 567 and a card at 568 are two editors'
   statements about one boundary, a line apart, not two guesses about position in a list. The move is
   bounded (never more than a few lines), one-to-one, order-preserving, and reported line by line.

   AND IT IS CHECKED AGAINST SOMETHING OTHER THAN THE NUMBERS, which is the discipline the Greek's
   proper-name check established: both files carry Magnus's own tale names, so a reconciled pair whose
   two sides name DIFFERENT tales is not the same passage and is refused rather than nudged. Measured
   over the thirteen: eight name a tale on both sides and all eight agree, five carry no name on either
   side, and none disagrees.

   (Those names are read for this check only and are never printed. More's tale names in the English
   file are run together in places — two headings concatenated into one string — and splitting them
   would mean guessing where one ends, which is composing an apparatus rather than transcribing it.) */
function reconcileCards(enBooks, laBooks, warn, log) {
  const TOL = 4;
  let exact = 0, moved = 0, unEN = 0, unLA = 0;
  Object.keys(laBooks).forEach((k) => {
    const E = enBooks[k] || [], L = laBooks[k];
    let i = 0, j = 0;
    while (i < E.length && j < L.length) {
      const d = L[j].n - E[i].n;
      if (d === 0) { exact++; i++; j++; continue; }
      if (Math.abs(d) <= TOL) {
        const a = E[i].tale, c = L[j].tale;
        if (a && c && a !== c) {
          // two different tales: not one boundary seen twice, so leave both where they are
          warn("book " + k + ": cards " + E[i].n + " and " + L[j].n + " are " + Math.abs(d) +
            " line(s) apart but name different tales (\"" + a + "\" / \"" + c + "\") — left unpaired");
          if (d < 0) { unLA++; j++; } else { unEN++; i++; }
          continue;
        }
        log("    book " + k + ": Latin card " + L[j].n + " → " + E[i].n +
          " (" + Math.abs(d) + " line" + (Math.abs(d) === 1 ? "" : "s") + ", " +
          (a && c ? "tale name agrees" : "no tale name on either side") + ")");
        L[j].n = E[i].n;
        moved++; i++; j++;
        continue;
      }
      if (d > 0) { unEN++; i++; } else { unLA++; j++; }
    }
    unEN += E.length - i;
    unLA += L.length - j;
  });
  log("  " + exact + " cards pair exactly, " + moved + " reconciled, " +
    unEN + " English and " + unLA + " Latin left unpaired (they draw as an empty cell).");
  return { exact: exact, moved: moved, unEN: unEN, unLA: unLA };
}

/* ---------- serialize ---------- */
function esc(s) { return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n"); }
function partOf(n) {
  const p = (BOOK.parts || []).find((x) => n >= x.from && n <= x.to);
  return p ? p.n : 1;
}
// what a chapter is called when the book's contents page gives it no name of its own
function chapterTitle(n) {
  return BOOK.titleOf ? BOOK.titleOf(n) : BOOK.chapterWord + " " + n;
}

async function fetchEnglish() {
  console.log("Fetching " + BOOK.title + " (" + BOOK.translator + ") — chapters " + FROM + "–" + TO);
  const titles = await chapterTitles();
  const warnings = [];
  const chapters = [];

  /* A TEI EDITION ON THE ENGLISH SIDE — one file for the whole book, rather than a page per chapter.
     Until Ovid this shape was available only to an `original`; the Metamorphoses uses it for both
     halves, because no complete English of it on Wikisource is both readable and numbered (see the
     BOOKS entry). One fetch, cached whole, so --from/--to cost nothing and a re-extract needs no
     network at all. The cache holds the XML rather than the extracted prose precisely because the
     original's reconciliation pass has to read the English cards back out of it later. */
  /* A TEI EDITION IN ONE FILE PER CHAPTER. Suetonius's twelve lives are twelve separate texts in
     Perseus's catalogue, so a Folio chapter is a whole file and the numbers inside it are its
     sections. Each file is cached under its own chapter number, which is what makes --from/--to and a
     re-extract behave here exactly as they do for a walk of wiki pages. */
  if (BOOK.source === "tei" && BOOK.perChapter) {
    console.log("  one TEI file per " + BOOK.chapterWord.toLowerCase() + " — " + BOOK.sourceName);
    for (const n of BOOK.chapters) {
      if (n < FROM || n > TO) continue;
      const warn = (m) => warnings.push(BOOK.chapterWord + " " + n + ": " + m);
      const cf = path.join(CACHE, "en-tei-" + n + ".xml");
      let xml;
      if (!FORCE && fs.existsSync(cf)) xml = fs.readFileSync(cf, "utf8");
      else { xml = await fetchText(BOOK.url(n)); fs.writeFileSync(cf, xml); await sleep(500); }
      const got = teiSections(xml, { renumber: (s) => (BOOK.renumber ? BOOK.renumber(s, n) : s) }, warn);
      if (got.html.length < 200) throw new Error("chapter " + n + " came back short (" + got.html.length + " chars)");
      /* Say what was left out, every run. The appended "Remarks on …" essay is skipped deliberately
         (see the BOOKS entry) and a silent skip is how a deliberate omission turns into a forgotten
         one three books later. */
      if (got.skipped.length) console.log("    skipped non-chapter division(s): " + got.skipped.join(", "));
      chapters.push({ n: n, t: titles[n] || chapterTitle(n), p: partOf(n), html: got.html, notes: got.notes });
      console.log("  " + BOOK.chapterWord + " " + n + " — " + (titles[n] || chapterTitle(n)) + ": " +
        got.count + " sections, " + got.notes.length + " notes (" + (got.html.length / 1024).toFixed(0) + " KB)");
    }
    return writeEnglish(chapters, warnings);
  }

  if (BOOK.source === "tei") {
    const warn = (m) => warnings.push(m);
    const cf = path.join(CACHE, "en-tei.xml");
    let xml;
    if (!FORCE && fs.existsSync(cf)) xml = fs.readFileSync(cf, "utf8");
    else { xml = await fetchText(BOOK.url); fs.writeFileSync(cf, xml); }
    const books = teiVerseBooks(xml, { cards: BOOK.cards }, warn);
    for (const n of BOOK.chapters) {
      if (n < FROM || n > TO) continue;
      const cards = books[n];
      if (!cards || !cards.length) { warn(BOOK.chapterWord + " " + n + " is missing from the edition"); continue; }
      const html = teiVerseHtml(cards);
      if (html.length < 200) throw new Error("chapter " + n + " came back short (" + html.length + " chars)");
      chapters.push({ n: n, t: titles[n] || chapterTitle(n), p: partOf(n), html: html, notes: [] });
      console.log("  " + BOOK.chapterWord + " " + n + " — " + cards.length + " sections, " +
        cards.reduce((a, c) => a + c.lines, 0) + " lines (" + (html.length / 1024).toFixed(0) + " KB)");
    }
    return writeEnglish(chapters, warnings);
  }

  for (const n of BOOK.chapters) {
    if (n < FROM || n > TO) continue;
    const cf = path.join(CACHE, n + ".json");
    if (!FORCE && fs.existsSync(cf)) {
      // the cache holds the extracted prose only — the title and the part are re-derived on every
      // run, so re-titling or re-dividing a book costs no refetch
      const c = JSON.parse(fs.readFileSync(cf, "utf8"));
      chapters.push({ n, t: titles[n] || c.t || chapterTitle(n), p: partOf(n), html: c.html, notes: c.notes || [] });
      continue;
    }
    const h = await api(BOOK.page(n));
    const warn = (m) => warnings.push(BOOK.chapterWord + " " + n + ": " + m);
    let html, notes, orig = "";
    if (BOOK.layout === "parallel") {
      /* Both columns come off this one page, so the original is extracted here too and cached beside
         the translation — fetchOriginal then costs no requests at all. */
      const got = extractParallel(h, BOOK, warn);
      html = got.html; notes = got.notes; orig = got.orig;
    } else {
      const got = notesOf(h);
      notes = got.notes;
      html = cleanBody(h, got.ids, BOOK, warn);
    }
    if (html.length < 200) throw new Error("chapter " + n + " came back short (" + html.length + " chars)");
    const rec = { n, t: titles[n] || chapterTitle(n), p: partOf(n), html, notes };
    if (orig) rec.orig = orig;
    fs.writeFileSync(cf, JSON.stringify(rec));
    chapters.push(rec);
    console.log("  " + BOOK.chapterWord + " " + n + " — " + rec.t + " (" + html.length + " chars, " + notes.length + " notes)");
    await sleep(700);
  }
  return writeEnglish(chapters, warnings);
}

/* Serialize the translation. Split out of fetchEnglish so the TWO ways of gathering it — a walk of
   Wikisource pages and a single TEI edition — share one way of writing it out and one report at the
   end, and so cannot drift apart in what they emit. The same split, and the same reason, as
   writeOriginal below. */
function writeEnglish(chapters, warnings) {
  chapters.sort((a, b) => a.n - b.n);

  const outDir = path.join(ROOT, "books");
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, id + ".js");
  const lines = [];
  lines.push("/* " + BOOK.title + " — " + BOOK.author + ", translated by " + BOOK.translator + ".");
  lines.push("   " + BOOK.edition + ". " + BOOK.rights);
  lines.push("   Source: " + BOOK.sourceName + " — " + BOOK.sourceUrl);
  lines.push("");
  lines.push("   GENERATED by .claude/fetch-book.js — do not edit by hand; re-run the script instead.");
  lines.push("   LAZY: bundle \"book:" + id + "\" in app.js. It pushes onto window.FOLIO_BOOKS_IN rather than");
  lines.push("   assigning a global, so a file that lands before its ingest hook is not lost. */");
  lines.push("window.FOLIO_BOOKS_IN = window.FOLIO_BOOKS_IN || [];");
  lines.push("window.FOLIO_BOOKS_IN.push({");
  lines.push('  id: "' + id + '",');
  /* The front matter, as ONE html string in the same shape a chapter's is — so the reader page can
     treat it as a chapter and needs no second renderer for it. Written before `chapters` because it
     reads first. */
  if (BOOK.about && BOOK.about.length) {
    lines.push('  intro: "' + esc(BOOK.about.map((p) => "<p>" + p + "</p>").join("\n")) + '",');
  }
  lines.push("  chapters: [");
  chapters.forEach((c) => {
    lines.push(
      "    { n: " + c.n + ', p: ' + c.p + ', t: "' + esc(c.t) + '", html: "' + esc(c.html) + '"' +
      (c.notes.length ? ", notes: [" + c.notes.map((x) => '"' + esc(x) + '"').join(", ") + "]" : "") +
      " },"
    );
  });
  lines.push("  ],");
  lines.push("});");
  const text = lines.join("\n") + "\n";
  fs.writeFileSync(out, text);

  // re-parse, exactly as the other content helpers do, so a broken escape can't ship
  global.window = {};
  delete require.cache[require.resolve(out)];
  require(out);
  const got = global.window.FOLIO_BOOKS_IN[0];
  console.log(
    "\nWrote books/" + id + ".js — " + got.chapters.length + " chapters, " +
    (text.length / 1024).toFixed(0) + " KB, " +
    got.chapters.reduce((a, c) => a + (c.notes ? c.notes.length : 0), 0) + " notes. Re-parsed OK."
  );
  /* Say what the extractor was unsure of. A chapter that comes through with no section numbers is the
     quietest failure this script has: it does not throw, it does not shorten the text and it does not
     look wrong on the page — it simply leaves that chapter with nothing to cite and nothing to pair. */
  if (warnings.length) {
    console.log("\n  " + warnings.length + " warning(s):");
    warnings.forEach((w) => console.log("    " + w));
  }
  const secs = got.chapters.map((c) => (c.html.match(/class="bk-n"/g) || []).length);
  console.log("  " + secs.reduce((a, b) => a + b, 0) + " section numbers across " + secs.length + " chapters" +
    (secs.some((s) => !s) ? "  — " + secs.filter((s) => !s).length + " chapter(s) with NONE" : ""));
}

/* The original-language half, written to its OWN file — books/<id>.<lang>.js, its own lazy bundle.

   It is not folded into the book's file, and that is the same decision the book file itself is: a
   reader who only wants the English should not download the Latin to get it. Seneca's English runs to
   1.37 MB and the Latin is of the same order, so putting the two together would double what every
   reader of the translation pays for a column they may never turn on. Kept apart, the original is
   fetched the first time it IS turned on, and never after. */
async function fetchOriginal() {
  const O = BOOK.original;
  const warnings = [];
  const warn = (m) => { warnings.push(m); };
  const byNum = {};

  /* A PARALLEL book's original needs no wiki of its own and no second walk: it was printed on the
     facing half of the same page and was extracted when the translation was. This reads it back out
     of that cache, and fetches a chapter only where the cache has none — which is what an
     --only-original run on a clean checkout looks like. */
  if (BOOK.layout === "parallel") {
    console.log("\nReading the " + O.langName + " original out of the parallel text — " +
      BOOK.chapters.length + " chapters");
    for (const n of BOOK.chapters) {
      const cf = path.join(CACHE, n + ".json");
      let rec = !FORCE && fs.existsSync(cf) ? JSON.parse(fs.readFileSync(cf, "utf8")) : null;
      if (!rec || !rec.orig) {
        const h = await api(BOOK.page(n));
        const got = extractParallel(h, BOOK, (m) => warn(BOOK.chapterWord + " " + n + ": " + m));
        rec = rec || { n, t: chapterTitle(n), p: partOf(n), html: got.html, notes: got.notes };
        rec.orig = got.orig;
        fs.writeFileSync(cf, JSON.stringify(rec));
        await sleep(700);
      }
      if (rec.orig) byNum[n] = rec.orig;
    }
    return writeOriginal(byNum, warnings);
  }

  const cacheDir = path.join(CACHE, O.lang);
  fs.mkdirSync(cacheDir, { recursive: true });

  /* A TEI edition is one FILE rather than a walk of wiki pages, so like the parallel branch above it
     short-circuits the walk below. `warnings` / `warn` / `byNum` are already declared at the top of
     this function — all three source shapes share them. */
  /* One TEI file per chapter, the shape the English side above uses — see the note there. The
     ORIGINAL is never renumbered: the repair applied to Suetonius's Augustus corrects Perseus's
     English divisions back to the numbers the printed translation itself carries, and those are the
     Latin edition's own numbers already. */
  if (O.source === "tei" && O.perChapter) {
    console.log("\nFetching the " + O.langName + " original — " + O.edition);
    for (const n of BOOK.chapters) {
      if (n < FROM || n > TO) continue;
      const w = (m) => warn(BOOK.chapterWord + " " + n + ": " + m);
      const cf = path.join(cacheDir, "tei-" + n + ".xml");
      let xml;
      if (!FORCE && fs.existsSync(cf)) xml = fs.readFileSync(cf, "utf8");
      else { xml = await fetchText(O.url(n)); fs.writeFileSync(cf, xml); await sleep(500); }
      const got = teiSections(xml, {}, w);
      if (!got.html) { w("came back empty"); continue; }
      if (got.skipped.length) console.log("    skipped non-chapter division(s): " + got.skipped.join(", "));
      byNum[n] = got.html;
      console.log("  " + BOOK.chapterWord + " " + n + " — " + got.count + " sections (" +
        (got.html.length / 1024).toFixed(0) + " KB)");
    }
    return writeOriginal(byNum, warnings);
  }

  if (O.source === "tei") {
    console.log("\nFetching the " + O.langName + " original — " + O.edition);
    const cf = path.join(cacheDir, "tei.xml");
    let xml;
    if (!FORCE && fs.existsSync(cf)) xml = fs.readFileSync(cf, "utf8");
    else { xml = await fetchText(O.url); fs.writeFileSync(cf, xml); }

    /* A VERSE edition pairs on CARDS rather than on prose chapters, and the two sides' card numbers
       have to be reconciled before either is written — see reconcileCards, which is where the thirteen
       one-to-three-line differences between Magnus and More's aligner are resolved, checked against
       the tale names, and reported. The English cards are read back out of that side's own cached TEI,
       so an --only-original run reconciles against exactly the file that shipped. */
    if (O.layout === "verse") {
      const enCache = path.join(CACHE, "en-tei.xml");
      let enXml;
      if (fs.existsSync(enCache)) enXml = fs.readFileSync(enCache, "utf8");
      else { enXml = await fetchText(BOOK.url); fs.writeFileSync(enCache, enXml); }
      const enBooks = teiVerseBooks(enXml, { cards: BOOK.cards }, warn);
      const laBooks = teiVerseBooks(xml, { cards: O.cards }, warn);
      console.log("  reconciling the two columns' section numbers:");
      reconcileCards(enBooks, laBooks, warn, (m) => console.log(m));
      Object.keys(laBooks).forEach((n) => { byNum[n] = teiVerseHtml(laBooks[n]); });
      return writeOriginal(byNum, warnings);
    }

    Object.assign(byNum, teiChapters(xml, warn));
    const ns = Object.keys(byNum).map(Number).sort((a, b) => a - b);
    ns.forEach((n) => {
      const secs = (byNum[n].match(/class="bk-n"/g) || []).length;
      console.log("  " + BOOK.chapterWord + " " + n + " — " + secs + " sections (" + (byNum[n].length / 1024).toFixed(0) + " KB)");
    });
    return writeOriginal(byNum, warnings);
  }

  console.log("\nFetching the " + O.langName + " original — " + O.pages.length + " pages from " + O.wiki);
  for (const page of O.pages) {
    const cf = path.join(cacheDir, page.replace(/[^\w.-]+/g, "_") + ".json");
    let got;
    if (!FORCE && fs.existsSync(cf)) {
      got = JSON.parse(fs.readFileSync(cf, "utf8"));
    } else {
      const h = await api(page, O.wiki);
      got = originalChapters(h, warn);
      if (!Object.keys(got).length) throw new Error("no chapters found on " + page);
      fs.writeFileSync(cf, JSON.stringify(got));
      await sleep(1200);   // this wiki rate-limits a fast walk harder than the English one
    }
    const ns = Object.keys(got).map(Number).sort((a, b) => a - b);
    console.log("  " + page.split("/").pop() + " — " + ns.length + " chapters (" + ns[0] + "–" + ns[ns.length - 1] + ")");
    Object.assign(byNum, got);
  }

  return writeOriginal(byNum, warnings);
}

/* Serialize the original-language half. Split out from fetchOriginal so the THREE ways of GATHERING
   it — a walk of another wiki, a read of the parallel text's own cache, and a single TEI edition —
   share one way of writing it out and one report at the end, and so cannot drift apart in what they
   emit. */
function writeOriginal(byNum, warnings) {
  const O = BOOK.original;
  const nums = Object.keys(byNum).map(Number).sort((a, b) => a - b);
  const outDir = path.join(ROOT, "books");
  const out = path.join(outDir, id + "." + O.lang + ".js");
  const lines = [];
  lines.push("/* " + BOOK.title + " — " + BOOK.author + ", in the " + O.langName + " he wrote it in.");
  lines.push("   " + O.rights);
  lines.push("   Source: " + O.sourceName + " — " + O.sourceUrl);
  lines.push("");
  lines.push("   GENERATED by .claude/fetch-book.js — do not edit by hand; re-run the script instead.");
  lines.push("   LAZY: bundle \"bookOrig:" + id + "\" in app.js, loaded only when a reader asks for the");
  lines.push("   original. The <span class=\"bk-n\"> markers are the SECTION numbers, and they are what");
  lines.push("   app.js pairs this text against the translation on — never the paragraph order, which the");
  lines.push("   two languages do not share. */");
  lines.push("window.FOLIO_BOOK_ORIG_IN = window.FOLIO_BOOK_ORIG_IN || [];");
  lines.push("window.FOLIO_BOOK_ORIG_IN.push({");
  lines.push('  id: "' + id + '",');
  lines.push('  lang: "' + O.lang + '",');
  lines.push('  langName: "' + esc(O.langName) + '",');
  lines.push('  edition: "' + esc(O.edition) + '",');
  lines.push('  rights: "' + esc(O.rights) + '",');
  lines.push('  sourceName: "' + esc(O.sourceName) + '",');
  lines.push('  sourceUrl: "' + esc(O.sourceUrl) + '",');
  lines.push("  chapters: [");
  nums.forEach((n) => lines.push("    { n: " + n + ', html: "' + esc(byNum[n]) + '" },'));
  lines.push("  ],");
  lines.push("});");
  const text = lines.join("\n") + "\n";
  fs.writeFileSync(out, text);

  global.window = {};
  delete require.cache[require.resolve(out)];
  require(out);
  const got = global.window.FOLIO_BOOK_ORIG_IN[0];
  const missing = BOOK.chapters.filter((n) => !byNum[n]);
  console.log(
    "\nWrote books/" + id + "." + O.lang + ".js — " + got.chapters.length + " chapters, " +
    (text.length / 1024).toFixed(0) + " KB. Re-parsed OK."
  );
  /* Say what is NOT there. A bilingual page falls back to the translation alone for a chapter with no
     original, which is the right behaviour and also a completely silent one — so the gap is reported
     here rather than left to be discovered by a reader turning the column on and finding nothing. */
  if (missing.length) console.log("  no original for " + missing.length + " chapter(s): " + missing.join(", "));
  if (warnings.length) {
    console.log("\n  " + warnings.length + " warning(s):");
    warnings.forEach((w) => console.log("    " + w));
  }
}


async function main() {
  if (!SKIP_EN) await fetchEnglish();
  if (BOOK.original && !SKIP_ORIG) await fetchOriginal();
}

main().catch((e) => { console.error("\n" + e.message); process.exit(1); });
