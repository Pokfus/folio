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

/* The Analects' twenty book-titles, TRANSCRIBED from the headings this edition prints at the head of
   each book ("BOOK I. HSIO R.") and from its own contents list, which gives the same names. They are
   Legge's transliterations of the Chinese book names, and those names are not descriptions: a book of
   the Analects is called after the words it OPENS with, so 學而 — Legge's "Hsio R." — is simply the
   first two characters of the first sentence of book 1. That is said in the front matter rather than
   repaired here, because the alternative is composing twenty subject headings for an editor who
   deliberately gave none, which is the line the Meditations' entry draws below. Transcribed with the
   edition's own spelling and its trailing stops, hyphens and apostrophes intact. */
const ANALECTS_TITLES = [
  "Hsio R.", "Wei Chang.", "Pa Yih.", "Le Jin.", "Kung-ye Ch'ang.", "Yung Yey.", "Shu R.",
  "T'ai-po.", "Tsze Han.", "Heang Tang.", "Hsien Tsin.", "Yen Yuan.", "Tsze-lu.", "Hsien Wan.",
  "Wei Ling Kung.", "Ke She.", "Yang Ho.", "Wei Tsze.", "Tsze-chang.", "Yao Yueh.",
];

/* The Prince's twenty-six chapter titles, TRANSCRIBED from the headings this edition prints ABOVE the
   chapters themselves rather than from its contents page, and set in the title case titleCase() would
   have produced — the Republic's arrangement, and the same reason: chapterTitles() below walks
   Seneca's contents TABLE specifically, keying on a /Letter_<digits> href, and twenty-six transcribed
   strings are cheaper and easier to check than a second parser.

   WHICH OF THE TWO PRINTED LISTS TO TAKE THEM FROM had to be decided rather than assumed, because this
   volume's contents page and its chapter headings do not agree, and the disagreement is not decorative.
   Three of the contents entries are wrong where the headings are right — VII reads "the Arms of of
   others" against the heading's "the Arms of Others", XVII "better to be loved then feared" against
   "Loved Than Feared", XX "many other things to which Princes resort" against "Many Things to Which
   Princes Often Resort". The heading is what stands at the head of the text a reader is reading, it is
   the list that comes through internally consistent, and taking it means the shelf carries neither
   somebody else's typographical slip nor a correction composed here. Both lists were read in full
   before choosing; the contents page is the one that is out. */
const PRINCE_TITLES = [
  "How Many Kinds of Principalities There Are, and by What Means They Are Acquired",
  "Concerning Hereditary Principalities",
  "Concerning Mixed Principalities",
  "Why the Kingdom of Darius, Conquered by Alexander, Did Not Rebel Against the Successors of Alexander at His Death",
  "Concerning the Way to Govern Cities or Principalities Which Lived Under Their Own Laws Before They Were Annexed",
  "Concerning New Principalities Which Are Acquired by One's Own Arms and Ability",
  "Concerning New Principalities Which Are Acquired Either by the Arms of Others or by Good Fortune",
  "Concerning Those Who Have Obtained a Principality by Wickedness",
  "Concerning a Civil Principality",
  "Concerning the Way in Which the Strength of All Principalities Ought to Be Measured",
  "Concerning Ecclesiastical Principalities",
  "How Many Kinds of Soldiery There Are, and Concerning Mercenaries",
  "Concerning Auxiliaries, Mixed Soldiery, and One's Own",
  "That Which Concerns a Prince on the Subject of the Art of War",
  "Concerning Things for Which Men, and Especially Princes, Are Praised or Blamed",
  "Concerning Liberality and Meanness",
  "Concerning Cruelty and Clemency, and Whether It Is Better to Be Loved Than Feared",
  "Concerning the Way in Which Princes Should Keep Faith",
  "That One Should Avoid Being Despised and Hated",
  "Are Fortresses, and Many Things to Which Princes Often Resort, Advantageous or Hurtful?",
  "How a Prince Should Conduct Himself So as to Gain Renown",
  "Concerning the Secretaries of Princes",
  "How Flatterers Should Be Avoided",
  "Why the Princes of Italy Have Lost Their States",
  "What Fortune Can Effect in Human Affairs, and How to Withstand Her",
  "An Exhortation to Liberate Italy from the Barbarians",
];

/* This volume's ten books are transcluded under subpages titled with the number SPELLED OUT — "Book
   One" rather than "Book 1" — so the page address cannot be built from the chapter number by
   arithmetic the way the Republic's and Seneca's are. */
const NE_BOOK_WORDS = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

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

/* ---------- THE DIALOGUES, and this table IS the book ----------
   Every other multi-part book here is divided by its own edition into things that share a name and a
   numbering — 124 letters, 12 books, 12 lives — so a chapter is addressed by arithmetic. Plato's
   dialogues share neither: each has its own name, its own Perseus work id and its own Stephanus
   range, and nothing about "Crito" can be derived from the fact that it is chapter 3. So both halves
   of the book are addressed through this one table, as Suetonius's two are through CAESAR_TITLES and
   CAESAR_WORK.

   THE ORDER IS THRASYLLUS'S NINE TETRALOGIES, which is not an arrangement composed here: it is the
   ancient ordering of Plato recorded by Diogenes Laertius, and Perseus's own work numbering follows
   it exactly — tlg001–004 are Euthyphro, Apology, Crito, Phaedo, and so on in fours to tlg036. That
   correspondence was checked across all thirty-six before it was relied on, so `tet` is read off the
   work id rather than stored twice, and the reader's Contents panel groups by it.

   THE REPUBLIC IS THE ONE GAP, and it is a LICENCE gap rather than a textual one. Perseus's English
   Republic is Paul Shorey's, published 1935–37, which is not in the public domain in the United
   States and cannot be shelved here — where every other work in this table was published between
   1914 and 1929. It is in the library already as a book of its own, in Jowett's translation from a
   different printing, so nothing is actually missing from the shelf; it is missing from THIS book,
   and its slot in Tetralogy VIII is simply left out. That is also why `total` is 36 against a
   `count` of 35.

   Five of the works are of disputed authorship and were so in antiquity — Alcibiades II, Hipparchus,
   Rival Lovers, Theages, Minos, and the Epinomis and Letters are argued over too. They are kept
   because Thrasyllus's arrangement keeps them and because the Loeb edition prints them; that is a
   fact about the transmission rather than a claim about who wrote them, and the front matter says so
   rather than letting a reader assume the shelf is asserting authorship. */
const DIALOGUES = [
  { t: "Euthyphro",       w: "tlg001", grc: "grc1" },
  { t: "Apology",         w: "tlg002" },
  { t: "Crito",           w: "tlg003" },
  { t: "Phaedo",          w: "tlg004" },
  { t: "Cratylus",        w: "tlg005" },
  { t: "Theaetetus",      w: "tlg006" },
  { t: "Sophist",         w: "tlg007" },
  { t: "Statesman",       w: "tlg008" },
  { t: "Parmenides",      w: "tlg009" },
  { t: "Philebus",        w: "tlg010" },
  { t: "Symposium",       w: "tlg011" },
  { t: "Phaedrus",        w: "tlg012" },
  { t: "Alcibiades I",    w: "tlg013" },
  { t: "Alcibiades II",   w: "tlg014" },
  { t: "Hipparchus",      w: "tlg015" },
  { t: "Rival Lovers",    w: "tlg016" },
  { t: "Theages",         w: "tlg017" },
  { t: "Charmides",       w: "tlg018" },
  { t: "Laches",          w: "tlg019" },
  { t: "Lysis",           w: "tlg020" },
  { t: "Euthydemus",      w: "tlg021" },
  { t: "Protagoras",      w: "tlg022" },
  { t: "Gorgias",         w: "tlg023" },
  { t: "Meno",            w: "tlg024" },
  { t: "Greater Hippias", w: "tlg025" },
  { t: "Lesser Hippias",  w: "tlg026" },
  { t: "Ion",             w: "tlg027" },
  { t: "Menexenus",       w: "tlg028" },
  { t: "Cleitophon",      w: "tlg029" },
  /* tlg030 is the Republic — see the note above. */
  { t: "Timaeus",         w: "tlg031" },
  { t: "Critias",         w: "tlg032" },
  { t: "Minos",           w: "tlg033" },
  { t: "Laws",            w: "tlg034" },
  { t: "Epinomis",        w: "tlg035" },
  { t: "Letters",         w: "tlg036" },
];
const DIALOGUE = (n) => DIALOGUES[n - 1];
/* The tetralogy a work belongs to, derived from Perseus's work id rather than stored beside it — the
   numbering IS the tetralogical order, so a second copy could only ever drift out of step with it. */
const TETRALOGY = (d) => Math.ceil(parseInt(d.w.slice(3), 10) / 4);
const TET_ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

/* ---------- THE 313 FABLES, IN THE ORDER THIS EDITION PRINTS THEM ----------
   A table rather than arithmetic, because there is no arithmetic to do: the fables are reached by
   NAME, one Wikisource subpage each, and the only thing that says what order they come in is the
   edition's own contents. Read off that contents list once and written down here, so that page(n)
   and titleOf(n) are the same fact stated twice and cannot drift apart.

   THE TITLES ARE THE TRANSCRIPTION'S OWN, VERBATIM, and that is a decision rather than laziness.
   The printed page sets every fable's title in CAPITALS, so its capitalisation is not recoverable
   from the book at all — a case has to be chosen by somebody. titleCase() is already in this file
   and is what Seneca's contents page goes through for exactly that reason, and it was tried here
   and rejected: it would rewrite 57 of the 313, and its damage is on the hyphenated compounds this
   collection is full of — "The Charcoal-Burner and the Fuller", "The Walnut-Tree", "The Old Woman
   and the Wine-Jar". Wikisource's forms are mildly inconsistent about "his" and "her" and right
   about the hyphens; they are also the names the subpages actually carry, so a reader who goes
   looking for one finds it. Inconsistency somebody else introduced beats damage introduced here.

   FIVE TITLES OCCUR TWICE, and they are five genuinely different fables that Townsend gave the same
   name — The Kid and the Wolf, The Fox and the Monkey, The Wolf and the Lion, The Two Frogs and The
   Fox and the Lion, each printed once in the first half of the book and once in the second. The
   "(1)" and "(2)" here are Wikisource's disambiguation of its own page names, not the book's, so
   they are stripped for display by AESOP_TITLE below: the tab bar shows two tabs reading The Two
   Frogs, which is what the edition does, and the fable number beside each is the only thing that
   tells them apart. It is the sharpest argument for numbering the tabs at all. */
const AESOP_FABLES = [
  "The Lion and the Mouse", "The Wolf and the Lamb", "The Ass and the Grasshopper",
  "The Wolf and the Crane", "The Father and his Sons", "The Bat and the Weasels", "The Cock and the Jewel",
  "The Swallow and the Crow", "The Kingdom of the Lion", "The Traveller and his Dog",
  "The Ants and the Grasshopper", "The Hare and the Tortoise", "The Charcoal-burner and the Fuller",
  "The Boy hunting Locusts", "The Fisherman Piping", "The Dog and the Shadow", "Hercules and the Waggoner",
  "The Mole and his Mother", "The Herdsman and the lost Bull", "The Fawn and his Mother",
  "The Ass, the Fox, and the Lion", "The Flies and the Honey Pot", "The Lioness",
  "The Farmer and the Snake", "The Man and the Lion", "The Pomegranate, Apple-tree, and Bramble",
  "The Farmer and the Stork", "The Mountain in Labour", "The Bear and the Fox",
  "The Tortoise and the Eagle", "The Fox and the Goat", "The Raven and the Swan", "The Thirsty Pigeon",
  "The Dog in the Manger", "The Oxen and the Axle-trees", "The Farmer and the Cranes", "The Sick Lion",
  "The Bear and the Two Travellers", "The Fox who had lost his Tail", "The Cat and the Cock",
  "The Wolf in Sheep's Clothing", "The Goat and the Goatherd", "The Boasting Traveller", "The Lion in Love",
  "The Miser", "The Porker, the Sheep, and the Goat", "The Boy and the Filberts",
  "The Frogs asking for a King", "The Labourer and the Snake", "The Lion, the Mouse, and the Fox",
  "The Horse and Groom", "The Ass and the Mule", "The Ass and the Lap-dog", "The Oxen and the Butchers",
  "The Shepherd's Boy and the Wolf", "The Boys and the Frogs", "The Salt Merchant and his Ass",
  "The Mischievous Dog", "The Goatherd and the Wild Goats", "The Man and his Two Sweethearts",
  "The Sick Stag", "The Boy and the Nettles", "The Astronomer", "The Wolves and the Sheep",
  "The Cat and the Birds", "The Vain Jackdaw", "The Kid and the Wolf (1)",
  "The Old Woman and the Physician", "The Ox and the Frog", "The Farmer and his Sons",
  "The Heifer and the Ox", "The Fighting Cocks and the Eagle", "The Charger and the Miller",
  "The Fox and the Monkey (1)", "The Horse and his Rider", "The Belly and the Members",
  "The Widow and her Little Maidens", "The Vine and the Goat", "Jupiter and the Monkey",
  "The Hawk, the Kite, and the Pigeons", "The Dolphins, the Whales, and the Sprat",
  "The Swallow, the Serpent, and the Court of Justice", "The Two Pots", "The Shepherd and the Wolf",
  "The Crab and its Mother", "The Father and his Two Daughters", "The Thief and his Mother",
  "The Old Man and Death", "The Fir Tree and the Bramble", "The Æthiop",
  "The Mouse, the Frog, and the Hawk", "The Fisherman and his Nets", "The Wolf and the Sheep",
  "The Old Woman and the Wine-jar", "The Man bitten by a Dog", "The Huntsman and the Fisherman",
  "The Fox and the Crow", "The Widow and the Sheep", "The Playful Ass", "The Stag in the Ox-stall",
  "The Two Dogs", "The Wild Ass and the Lion", "The Lion and the Dolphin", "The Eagle and the Arrow",
  "The Sick Kite", "The Lion and the Boar", "The Mice in Council", "The One-eyed Doe",
  "The Mice and the Weasels", "The Shepherd and the Sea", "The Ass, the Cock, and the Lion",
  "The Rivers and the Sea", "The Wild Boar and the Fox", "The Milkwoman and her Pail",
  "The Bee and Jupiter", "The Wolf and the House-dog", "The Three Tradesmen", "The Ass carrying the Image",
  "The Master and his Dogs", "The Old Hound", "The Two Travellers and the Axe", "The Old Lion",
  "The Wolf and the Shepherds", "The Seaside Travellers", "The Ass and his Shadow",
  "The Ass and his Masters", "Mercury and the Sculptor", "The Fox and the Wood-cutter",
  "The Oak and the Reeds", "The Lion in a Farmyard", "The Wolf and the Lion (1)",
  "The Birdcatcher, the Partridge, and the Cock", "The Ant and the Dove", "The Hares and the Frogs",
  "The Monkey and the Fishermen", "The Swan and the Goose", "The Doe and the Lion",
  "The Fisherman and the Little Fish", "The Hunter and the Woodman", "The Swollen Fox", "The Two Frogs (1)",
  "The Lamp", "The Camel and the Arab", "The Miller, his Son, and their Ass", "The Cat and the Mice",
  "The Mouse and the Bull", "The Dog and the Cook", "The Thieves and the Cock", "The Dancing Monkeys",
  "The Farmer and the Fox", "The Traveller and Fortune", "The Sea-gull and the Kite",
  "The Lion, the Bear, and the Fox", "The Philosopher, the Ants, and Mercury", "The Peasant and the Eagle",
  "The Fox and the Leopard", "The Lion and the Hare", "The Image of Mercury and the Carpenter",
  "The Lion, the Fox, and the Ass", "The Bull and the Goat", "The Bald Knight", "The Oaks and Jupiter",
  "The Monkeys and their Mother", "The Hare and the Hound", "The Shepherd and the Dog",
  "The Oak and the Wood-cutters", "The Wasp and the Snake", "The Peacock and the Crane",
  "The Hen and the Golden Eggs", "The Ass and the Frogs", "The Crow and the Raven", "The Trees and the Axe",
  "The Wolves and the Sheep-dogs", "The Bull, the Lioness, and the Wild-Boar Hunter", "The Bowman and Lion",
  "The Camel", "The Crab and the Fox", "The Ass and the Old Shepherd", "The Fox and the Hedgehog",
  "The Woman and her Hen", "The Kites and the Swans", "The Dog and the Hare", "The Hares and the Foxes",
  "The Bull and the Calf", "The Stag, the Wolf, and the Sheep", "The Eagle, the Cat, and the Wild Sow",
  "The Wolf and the Fox", "The Mule", "The Prophet", "The Two Frogs (2)", "The Serpent and the Eagle",
  "The Crow and the Pitcher", "The Thief and the Innkeeper", "The Hart and the Vine",
  "The Gnat and the Lion", "The Fox and the Grapes", "The Walnut-tree", "The Kid and the Wolf (2)",
  "The Monkey and the Dolphin", "The Horse and the Stag", "The Jackdaw and the Doves",
  "The Fox and the Monkey (2)", "The Man and his Wife", "The Man, the Horse, the Ox, and the Dog",
  "The Thief and the House-Dog", "The Apes and the Two Travellers", "The Fox and the Lion (1)",
  "The Weasel and the the Mice", "The Boy Bathing", "The Peacock and Juno", "The Wolf and the Shepherd",
  "The Hares and the Lions", "The Seller of Images", "The Hawk and the Nightingale",
  "The Lark and her Young Ones", "The Dog, the Cock, and the Fox", "The Geese and the Cranes",
  "The Ass and the Wolf", "The Goat and the Ass", "The Lion and the Bull", "The Fox and the Mask",
  "The Grasshopper and the Owl", "The Fowler and the Viper", "The Horse and the Ass",
  "The Lion and the Three Bulls", "The Wolf and the Goat", "The Fly and the Draught-mule", "The Fishermen",
  "The Town Mouse and the Country Mouse", "The Wolf, the Fox, and the Ape",
  "The Wasps, the Partridges, and the Farmer", "The Brother and the Sister", "The Dogs and the Fox",
  "The Blind Man and the Whelp", "The Cobbler turned Doctor", "The Wolf and the Horse",
  "The Two Men who were Enemies", "The Game-cocks and the Partridge", "The Fox and the Lion (2)",
  "The Quack Frog", "The Lion, the Wolf, and the Fox", "The Dog's House", "The North Wind and the Sun",
  "The Crow and Mercury", "The Fox and the Crane", "The Wolf and the Lion (2)",
  "The Birds, the Beasts, and the Bat", "The Spendthrift and the Swallow", "The Trumpeter taken Prisoner",
  "The Owl and the Birds", "The Goods and the Ills", "The Ass in the Lion's Skin",
  "The Sparrow and the Hare", "The Flea and the Ox", "The Ass and his Purchaser", "The Dove and the Crow",
  "The Man and the Satyr", "Jupiter, Neptune, Minerva, and Momus", "The Eagle and the Jackdaw",
  "The Eagle and the Fox", "The Two Bags", "The Bitch and her Whelps", "The Stag at the Pool",
  "The Lark burying its Father", "The Gnat and the Bull", "The Monkey and the Camel",
  "The Dogs and the Hides", "The Jackdaw and the Fox", "Mercury and the Workmen",
  "The Peasant and the Apple-tree", "The Two Soldiers and the Robber", "The Shepherd and the Sheep",
  "The Trees under the protection of the Gods", "The Flea and the Wrestler", "The Lion and the Fox",
  "Truth and the Traveller", "The Manslayer", "The Lion and the Eagle", "The Ass and the Driver",
  "The Thrush and the Fowler", "The Mother and the Wolf", "The Hen and the Swallow",
  "The Rose and the Amaranth", "The Travellers and the Plane-tree", "The Ass and the Horse",
  "The Crow and the Sheep", "The Fox and the Bramble", "The Ass and the Charger",
  "The Lion, Jupiter, and the Elephant", "The Dog and the Oyster", "The Mules and the Robbers",
  "The Lamb and the Wolf", "The Partridge and the Fowler", "The Flea and the Man",
  "The Rich Man and the Tanner", "The Viper and the File", "The Lion and the Shepherd",
  "The Camel and Jupiter", "The Panther and the Shepherds", "The Eagle and the Kite",
  "The Eagle and his Captor", "The King's Son and the Painted Lion", "The Cat and Venus",
  "The Eagle and the Beetle", "The She-goats and their Beards", "The Bald Man and the Fly",
  "The Shipwrecked Man and the Sea", "The Buffoon and the Countryman", "The Crow and the Serpent",
  "The Hunter and the Horseman", "The Olive-tree and the Fig-tree", "The Frogs' complaint against the Sun",
  "The Brazier and his Dog",
];
/* The subpage name is the display title plus Wikisource's disambiguator, and nothing else — asserted
   over all 313 when the table was built, not assumed. */
const AESOP_TITLE = (s) => s.replace(/\s*\(\d+\)$/, "");

/* ---------- THE CLASSIC OF POETRY, and what this table is for ----------
   Legge's Sacred Books of the East volume gives one wiki page per ode, so a chapter here is one
   POEM — Aesop's shape, and for Aesop's reason: the ode is the whole unit of the work at this
   scale. What numbers it is the MAO NUMBER, the 1–305 sequence by which any poem of the Shih is
   cited in any language, and the numbers below are NOT contiguous: this edition carries 102 of the
   305, so the tabs run 13, 15, 29, 40 … and a reader meeting the gaps is told why in the front
   matter rather than finding the odes silently renumbered 1–102 into a sequence the book has not
   got. Beowulf's missing fitt XXX is the same judgement.

   THE MAO NUMBER WAS DERIVED, NOT TYPED. Chinese Wikisource's 詩經 index lists the poems in the
   traditional order, and the position in that list is the Mao number — with one correction that
   has to be made or every number from 171 on is six too high: the six 笙詩, whose titles survive
   and whose texts do not, are listed there and are NOT counted in the 305. Checked against seven
   anchors before it was believed (關雎 1, 鹿鳴 161, 文王 235, 清廟 266, 那 301, 玄鳥 303, 采蘋 15),
   and the excluded six leave exactly 305 numbered poems.

   AND A TITLE IS NOT A KEY. Four of these odes share their Chinese title with a different poem
   elsewhere in the collection (柏舟 26 and 45, 黃鳥 131 and 187, 杕杜 119 and 169, 甫田 102 and
   211) — the Shih repeats titles across the states, exactly as Townsend gave five of Aesop's
   fables one name. Matching on the title alone would have filed four odes against the wrong
   Chinese poem, silently and with nothing to show for it, so each was resolved by the section and
   book Legge's own page states. */
/* mao, the page path under .../The Shih/, Legge's title, the Chinese title, the part */
const SHIJING = [
  [13, "Lessons from the States/Book 2/Ode 2", "The Zhâi Fan", "采蘩", 1],
  [15, "Lessons from the States/Book 2/Ode 4", "The Zhâi Pin", "采蘋", 1],
  [29, "Lessons from the States/Book 3/Ode 4", "The Zăh Yüeh", "日月", 1],
  [40, "Lessons from the States/Book 3/Ode 15", "The Pei Măn, Stanza 1", "北門", 1],
  [45, "Lessons from the States/Book 4/Ode 1", "The Pai Kâu", "柏舟", 1],
  [47, "Lessons from the States/Book 4/Ode 3", "The Kün-zze Kieh Lâo, Stanza 2", "君子偕老", 1],
  [50, "Lessons from the States/Book 4/Ode 6", "The Ting kih fang Kung, Stanzas 1 and 2", "定之方中", 1],
  [58, "Lessons from the States/Book 5/Ode 4", "The Măng, Stanzas 1 and 2", "氓", 1],
  [65, "Lessons from the States/Book 6/Ode 1", "The Shû Lî, Stanza 1", "黍離", 1],
  [73, "Lessons from the States/Book 6/Ode 9", "The Tâ Kü, Stanzas 1 and 3", "大車", 1],
  [121, "Lessons from the States/Book 10/Ode 8", "The Pâo Yû, Stanza 1", "鴇羽", 1],
  [124, "Lessons from the States/Book 10/Ode 11", "The Ko Shăng", "葛生", 1],
  [131, "Lessons from the States/Book 11/Ode 6", "The Hwang Niâo, Stanza 1", "黃鳥", 1],
  [154, "Lessons from the States/Book 15/Ode 1", "The Khî Yüeh, Stanza 8", "七月", 1],
  [165, "The Minor Odes of the Kingdom/Decade 1/Ode 5", "The Fâ Mû, Stanza 1", "伐木", 2],
  [166, "The Minor Odes of the Kingdom/Decade 1/Ode 6", "The Thien Pâo", "天保", 2],
  [169, "The Minor Odes of the Kingdom/Decade 1/Ode 9", "The Tî Tû, Stanza 4", "杕杜", 2],
  [189, "The Minor Odes of the Kingdom/Decade 4/Ode 5", "The Sze Kan, Stanzas 5 to 9", "斯干", 2],
  [190, "The Minor Odes of the Kingdom/Decade 4/Ode 6", "The Wû Yang, Stanza 4", "無羊", 2],
  [191, "The Minor Odes of the Kingdom/Decade 4/Ode 7", "The Kieh Nan Shan", "節南山", 2],
  [192, "The Minor Odes of the Kingdom/Decade 4/Ode 8", "The Kăng yüeh, Stanzas 4, 5, and 7", "正月", 2],
  [193, "The Minor Odes of the Kingdom/Decade 4/Ode 9", "The Shih yüeh kih Kiâo", "十月之交", 2],
  [194, "The Minor Odes of the Kingdom/Decade 4/Ode 10", "The Yü wû Kăng, Stanzas 1 and 3", "雨無正", 2],
  [195, "The Minor Odes of the Kingdom/Decade 5/Ode 1", "The Hsiâo Min, Stanzas 1, 2, and 3", "小旻", 2],
  [196, "The Minor Odes of the Kingdom/Decade 5/Ode 2", "The Hsiâo Yüan, Stanzas 1, 2, and 5", "小宛", 2],
  [197, "The Minor Odes of the Kingdom/Decade 5/Ode 3", "The Hsiâo Pan, Stanzas 1 and 3", "小弁", 2],
  [198, "The Minor Odes of the Kingdom/Decade 5/Ode 4", "The Khiâo Yen, Stanza 1", "巧言", 2],
  [200, "The Minor Odes of the Kingdom/Decade 5/Ode 6", "The Hsiang Po, Stanzas 5 and 6", "巷伯", 2],
  [203, "The Minor Odes of the Kingdom/Decade 5/Ode 9", "The Tâ Tung", "大東", 2],
  [207, "The Minor Odes of the Kingdom/Decade 6/Ode 3", "The Hsiâo Ming, Stanzas 1, 4, and 5", "小明", 2],
  [209, "The Minor Odes of the Kingdom/Decade 6/Ode 5", "The Khû Zhze", "楚茨", 2],
  [210, "The Minor Odes of the Kingdom/Decade 6/Ode 6", "The Hsin Nan Shan", "信南山", 2],
  [211, "The Minor Odes of the Kingdom/Decade 6/Ode 7", "The Phû Thien", "甫田", 2],
  [212, "The Minor Odes of the Kingdom/Decade 6/Ode 8", "The Tâ Thien", "大田", 2],
  [215, "The Minor Odes of the Kingdom/Decade 7/Ode 1", "The Sang Hû, Stanza 1", "桑扈", 2],
  [220, "The Minor Odes of the Kingdom/Decade 7/Ode 6", "The Pin kih Khû Yen, Stanzas 1 and 2", "賓之初筵", 2],
  [229, "The Minor Odes of the Kingdom/Decade 8/Ode 5", "The Po Hwâ, Stanzas 1 and 2", "白華", 2],
  [235, "The Major Odes of the Kingdom/Decade 1/Ode 1", "The Wăn Wang", "文王", 3],
  [236, "The Major Odes of the Kingdom/Decade 1/Ode 2", "The Tâ Ming", "大明", 3],
  [237, "The Major Odes of the Kingdom/Decade 1/Ode 3", "The Mien", "緜", 3],
  [238, "The Major Odes of the Kingdom/Decade 1/Ode 4", "The Yî Pho, Stanzas 1 and 2", "棫樸", 3],
  [239, "The Major Odes of the Kingdom/Decade 1/Ode 5", "The Han Lû", "旱麓", 3],
  [240, "The Major Odes of the Kingdom/Decade 1/Ode 6", "The Sze Kâi", "思齊", 3],
  [241, "The Major Odes of the Kingdom/Decade 1/Ode 7", "The Hwang Î", "皇矣", 3],
  [243, "The Major Odes of the Kingdom/Decade 1/Ode 9", "The Hsiâ Wû", "下武", 3],
  [244, "The Major Odes of the Kingdom/Decade 1/Ode 10", "The Wăn Wang yû Shăng", "文王有聲", 3],
  [245, "The Major Odes of the Kingdom/Decade 2/Ode 1", "The Shăng Min", "生民", 3],
  [246, "The Major Odes of the Kingdom/Decade 2/Ode 2", "The Hsing Wei", "行葦", 3],
  [247, "The Major Odes of the Kingdom/Decade 2/Ode 3", "The Kî Zui", "既醉", 3],
  [248, "The Major Odes of the Kingdom/Decade 2/Ode 4", "The Hû Î", "鳬鷖", 3],
  [249, "The Major Odes of the Kingdom/Decade 2/Ode 5", "The Kiâ Lo, Stanza 1", "假樂", 3],
  [252, "The Major Odes of the Kingdom/Decade 2/Ode 8", "The Khüan Â", "卷阿", 3],
  [253, "The Major Odes of the Kingdom/Decade 2/Ode 9", "The Min Lâo, Stanza 1", "民勞", 3],
  [254, "The Major Odes of the Kingdom/Decade 2/Ode 10", "The Pan", "板", 3],
  [255, "The Major Odes of the Kingdom/Decade 3/Ode 1", "The Tang", "蕩", 3],
  [256, "The Major Odes of the Kingdom/Decade 3/Ode 2", "The Yî", "抑", 3],
  [257, "The Major Odes of the Kingdom/Decade 3/Ode 3", "The Sang Zâu, Stanzas 1, 2, 3, 4, and 7", "桑柔", 3],
  [258, "The Major Odes of the Kingdom/Decade 3/Ode 4", "The Yun Han", "雲漢", 3],
  [259, "The Major Odes of the Kingdom/Decade 3/Ode 5", "The Sung Kâo, Stanzas 1, 2, and 4", "崧高", 3],
  [260, "The Major Odes of the Kingdom/Decade 3/Ode 6", "The Kăng Min, Stanzas 1 and 7", "烝民", 3],
  [261, "The Major Odes of the Kingdom/Decade 3/Ode 7", "The Han Yî, Stanzas 1 and part of 3", "韓奕", 3],
  [262, "The Major Odes of the Kingdom/Decade 3/Ode 8", "The Kiang Han, Stanzas 4 and 5", "江漢", 3],
  [264, "The Major Odes of the Kingdom/Decade 3/Ode 10", "The Kan Zang, Stanzas 1, 5, 6, and 7", "瞻卬", 3],
  [265, "The Major Odes of the Kingdom/Decade 3/Ode 11", "The Shâo Min, Stanzas 1 and 2", "召旻", 3],
  [266, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 1/Ode 1", "The Khing Miâo", "清廟", 4],
  [267, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 1/Ode 2", "The Wei Thien Kih Ming", "維天之命", 4],
  [268, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 1/Ode 3", "The Wei Khing", "維清", 4],
  [269, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 1/Ode 4", "The Lieh Wăn", "烈文", 4],
  [270, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 1/Ode 5", "The Thien Zo", "天作", 4],
  [271, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 1/Ode 6", "The Hâo Thien yû Khăng Ming", "昊天有成命", 4],
  [272, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 1/Ode 7", "The Wo Kiang", "我將", 4],
  [273, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 1/Ode 8", "The Shih Mâi", "時邁", 4],
  [274, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 1/Ode 9", "The Kih King", "執競", 4],
  [275, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 1/Ode 10", "The Sze Wăn", "思文", 4],
  [276, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 2/Ode 1", "The Khăn Kung", "臣工", 4],
  [277, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 2/Ode 2", "The Î Hsî", "噫嘻", 4],
  [278, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 2/Ode 3", "The Kăn Lû", "振鷺", 4],
  [279, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 2/Ode 4", "The Făng Nien", "豐年", 4],
  [280, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 2/Ode 5", "The Yû Kû", "有瞽", 4],
  [281, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 2/Ode 6", "The Khien", "潛", 4],
  [282, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 2/Ode 7", "The Yung", "雝", 4],
  [283, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 2/Ode 8", "The Zâi Hsien", "載見", 4],
  [284, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 2/Ode 9", "The Yû Kho", "有客", 4],
  [285, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 2/Ode 10", "The Wû", "武", 4],
  [286, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 3/Ode 1", "The Min Yü", "閔予小子", 4],
  [287, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 3/Ode 2", "The Fang Lo", "訪落", 4],
  [288, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 3/Ode 3", "The King Kih", "敬之", 4],
  [289, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 3/Ode 4", "The Hsiâo Pî", "小毖", 4],
  [290, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 3/Ode 5", "The Zâi Shû", "載芟", 4],
  [291, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 3/Ode 6", "The Liang Sze", "良耜", 4],
  [292, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 3/Ode 7", "The Sze Î", "絲衣", 4],
  [293, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 3/Ode 8", "The Ko", "酌", 4],
  [294, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 3/Ode 9", "The Hwan", "桓", 4],
  [295, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 3/Ode 10", "The Lâi", "賚", 4],
  [296, "Odes of the Temple and the Altar/The Sacrificial Odes of Kâu/Decade 3/Ode 11", "The Pan", "般", 4],
  [299, "Odes of the Temple and the Altar/The Praise Odes of Lû/Ode 3", "The Phan Shui", "泮水", 4],
  [300, "Odes of the Temple and the Altar/The Praise Odes of Lû/Ode 4", "The Pî Kung", "閟宮", 4],
  [301, "Odes of the Temple and the Altar/The Sacrificial Odes of Shang/Ode 1", "The Nâ", "那", 4],
  [302, "Odes of the Temple and the Altar/The Sacrificial Odes of Shang/Ode 2", "The Lieh Zû", "烈祖", 4],
  [303, "Odes of the Temple and the Altar/The Sacrificial Odes of Shang/Ode 3", "The Hsüan Niâo", "玄鳥", 4],
  [304, "Odes of the Temple and the Altar/The Sacrificial Odes of Shang/Ode 4", "The Khang Fâ", "長發", 4],
  [305, "Odes of the Temple and the Altar/The Sacrificial Odes of Shang/Ode 5", "The Yin Wû", "殷武", 4],
];

/* Keyed by Mao number, since that is what `chapters` carries and what every hook is handed. */
const SHIJING_BY_MAO = {};
SHIJING.forEach((r) => { SHIJING_BY_MAO[r[0]] = r; });

/* THE SHÛ, document by document: [ n, part, pages, title ].
   `pages` is relative to "Sacred Books of the East/Volume 3/The Shu/" and is an ARRAY because four
   of these chapters are printed across two wiki pages — the book's own page, which carries Legge's
   headnote and no body text, and the section that follows it. See `page` in the entry below.

   The tabs count 59 where the Shû is traditionally counted at 58 documents, and the difference is
   one document rather than an error: Legge prints the Tribute of Yü in two numbered sections, each
   restarting its paragraph count at 1, so joining them would put two paragraphs numbered 1 in one
   chapter. The edition's own division is followed and the front matter says so. */
const SHU = [
  [1, 1, ["Part 1/Book 1"], "The Canon of Yâo"],

  [2, 2, ["Part 2/Book 1"], "The Canon of Shun"],
  [3, 2, ["Part 2/Book 2"], "The Counsels of the Great Yü"],
  [4, 2, ["Part 2/Book 3"], "The Counsels of Kâo-yâo"],
  [5, 2, ["Part 2/Book 4"], "The Yî and Kî"],

  [6, 3, ["Part 3/Book 1/Section 1"], "The Tribute of Yü, Section i"],
  [7, 3, ["Part 3/Book 1/Section 2"], "The Tribute of Yü, Section ii"],
  [8, 3, ["Part 3/Book 2"], "The Speech at Kan"],
  [9, 3, ["Part 3/Book 3"], "The Songs of the Five Sons"],
  [10, 3, ["Part 3/Book 4"], "The Punitive Expedition of Yin"],

  [11, 4, ["Part 4/Book 1"], "The Speech of Thang"],
  [12, 4, ["Part 4/Book 2"], "The Announcement of Kung-hui"],
  [13, 4, ["Part 4/Book 3"], "The Announcement of Thang"],
  [14, 4, ["Part 4/Book 4"], "The Instructions of Î"],
  [15, 4, ["Part 4/Book 5", "Part 4/Book 5/Section 1"], "The Thâi Kiâ, Section i"],
  [16, 4, ["Part 4/Book 5/Section 2"], "The Thâi Kiâ, Section ii"],
  [17, 4, ["Part 4/Book 5/Section 3"], "The Thâi Kiâ, Section iii"],
  [18, 4, ["Part 4/Book 6"], "The Common Possession of Pure Virtue"],
  [19, 4, ["Part 4/Book 7", "Part 4/Book 7/Section 1"], "The Pan-kăng, Section i"],
  [20, 4, ["Part 4/Book 7/Section 2"], "The Pan-kăng, Section ii"],
  [21, 4, ["Part 4/Book 7/Section 3"], "The Pan-kăng, Section iii"],
  [22, 4, ["Part 4/Book 8", "Part 4/Book 8/Section 1"], "The Charge to Yüeh, Section i"],
  [23, 4, ["Part 4/Book 8/Section 2"], "The Charge to Yüeh, Section ii"],
  [24, 4, ["Part 4/Book 8/Section 3"], "The Charge to Yüeh, Section iii"],
  [25, 4, ["Part 4/Book 9"], "The Day of the Supplementary Sacrifice to Kâo Zung"],
  [26, 4, ["Part 4/Book 10"], "The Chief of the West's Conquest of Lî"],
  [27, 4, ["Part 4/Book 11"], "The Count of Wei"],

  [28, 5, ["Part 5/Book 1", "Part 5/Book 1/Section 1"], "The Great Declaration, Section i"],
  [29, 5, ["Part 5/Book 1/Section 2"], "The Great Declaration, Section ii"],
  [30, 5, ["Part 5/Book 1/Section 3"], "The Great Declaration, Section iii"],
  [31, 5, ["Part 5/Book 2"], "The Speech at Mû"],
  [32, 5, ["Part 5/Book 3"], "The Successful Completion of the War"],
  [33, 5, ["Part 5/Book 4"], "The Great Plan"],
  [34, 5, ["Part 5/Book 5"], "The Hounds of Lü"],
  [35, 5, ["Part 5/Book 6"], "The Metal-bound Coffer"],
  [36, 5, ["Part 5/Book 7"], "The Great Announcement"],
  [37, 5, ["Part 5/Book 8"], "The Charge to the Count of Wei"],
  [38, 5, ["Part 5/Book 9"], "The Announcement to the Prince of Khang"],
  [39, 5, ["Part 5/Book 10"], "The Announcement about Drunkenness"],
  [40, 5, ["Part 5/Book 11"], "The Timber of the Rottlera"],
  [41, 5, ["Part 5/Book 12"], "The Announcement of the Duke of Shâo"],
  [42, 5, ["Part 5/Book 13"], "The Announcement concerning Lo"],
  [43, 5, ["Part 5/Book 14"], "The Numerous Officers"],
  [44, 5, ["Part 5/Book 15"], "Against Luxurious Ease"],
  [45, 5, ["Part 5/Book 16"], "The Prince Shih"],
  [46, 5, ["Part 5/Book 17"], "The Charge to Kung of Zhâi"],
  [47, 5, ["Part 5/Book 18"], "The Numerous Regions"],
  [48, 5, ["Part 5/Book 19"], "The Establishment of Government"],
  [49, 5, ["Part 5/Book 20"], "The Officers of Kâu"],
  [50, 5, ["Part 5/Book 21"], "The Kün-khăn"],
  [51, 5, ["Part 5/Book 22"], "The Testamentary Charge"],
  [52, 5, ["Part 5/Book 23"], "The Announcement of King Khang"],
  [53, 5, ["Part 5/Book 24"], "The Charge to the Duke of Pî"],
  [54, 5, ["Part 5/Book 25"], "The Kün-yâ"],
  [55, 5, ["Part 5/Book 26"], "The Charge to Khiung"],
  [56, 5, ["Part 5/Book 27"], "The Marquis of Lü on Punishments"],
  [57, 5, ["Part 5/Book 28"], "The Charge to the Marquis Wăn"],
  [58, 5, ["Part 5/Book 29"], "The Speech at Pî"],
  [59, 5, ["Part 5/Book 30"], "The Speech of the Marquis of Khin"],
];
const SHU_BY_N = {};
SHU.forEach((r) => { SHU_BY_N[r[0]] = r; });

/* The ten treatises of the Lî Kî that Sacred Books of the East volume 27 carries — its Books I to X,
   the whole of that volume — as [number, the Roman numeral its wiki page is titled by, title].

   THE TITLES ARE THE VOLUME'S OWN CONTENTS PAGE, read row by row rather than taken off the head of
   each book, and the two are not always the same: the contents page gives Book VIII as "Rites in the
   Formation of Character" where the book's own half-title sets CHARACTERS. The contents page is what
   `chapterTitles` reads for every other book here that has one, so it wins, and the divergence is
   recorded rather than silently resolved. Its "Wǎn Wang Shih-ᴈze" is hyphenated and the book's head
   is not; the hyphen is kept, again because the contents page is the authority.

   Legge's own "or" is kept as an em-dashed second half rather than turned into a subtitle field: it
   is part of the name he gives the treatise, and a tab reading "The Lî Yun" alone tells an English
   reader nothing whatever. */
const LIKI = [
  [1, "I", "Khü Lî — Summary of the Rules of Propriety"],
  [2, "II", "The Than Kung"],
  [3, "III", "The Royal Regulations"],
  [4, "IV", "Yüeh Ling — Proceedings of Government in the different Months"],
  [5, "V", "The Questions of Зăng-зze"],
  [6, "VI", "Wăn Wang Shih-зze — King Wăn as Son and Heir"],
  [7, "VII", "The Lî Yun — Ceremonial Usages; their Origin, Development, and Intention"],
  [8, "VIII", "The Lî Khî — Rites in the Formation of Character"],
  [9, "IX", "The Kiâo Theh Săng — the Single Victim at the Border Sacrifices"],
  [10, "X", "The Nêi Зeh — the Pattern of the Family"],
];
const LIKI_BY_N = {};
LIKI.forEach((r) => { LIKI_BY_N[r[0]] = r; });

/* The thirty-five pieces of the Poetic Edda, in the order this edition's own contents page lists
   them and under the spellings its page titles use — read off that page row by row rather than
   assembled from memory, since several of these names have three or four accepted spellings and the
   wiki's are not always the commonest. The break between the two `parts` falls after the fourteenth,
   where Bellows's contents page turns from the Lays of the Gods to the Lays of the Heroes. */
const EDDA_POEMS = [
  "Voluspo", "Hovamol", "Vafthruthnismol", "Grimnismol", "Skirnismol",
  "Harbarthsljoth", "Hymiskvitha", "Lokasenna", "Thrymskvitha", "Alvissmol",
  "Baldrs Draumar", "Rigsthula", "Hyndluljoth", "Svipdagsmol",
  "V\u00f6lundarkvitha", "Helgakvitha Hjorvarthssonar", "Helgakvitha Hundingsbana I",
  "Helgakvitha Hundingsbana II", "Fra Dautha Sinfjotla", "Gripisspo", "Reginsmol",
  "Fafnismol", "Sigrdrifumol", "Brot af Sigurtharkvithu", "Guthrunarkvitha I",
  "Sigurtharkvitha en Skamma", "Helreith Brynhildar", "Drap Niflunga",
  "Guthrunarkvitha II, en Forna", "Guthrunarkvitha III", "Oddrunargratr",
  "Atlakvitha en Gr\u00f6nlenzka", "Atlamol en Gr\u00f6nlenzku", "Guthrunarhvot", "Hamthesmol",
];

/* ---------- The City of God: how many chapters each of the twenty-two books has, and which of them
   Dods heads with a preface ----------
   Read off Wikisource's own contents lists rather than off a printed table: every one of the 22 book
   pages carries a list of its subpages, and the 665 of them are 661 numbered chapters plus four
   prefaces (books I, V, VI and VII). Both editions agree on every one of those numbers — see the
   `original` block below for the measurement — so this table is the pairing key as well as the fetch
   list, and it is written out rather than derived so that a Wikisource page moved or renamed
   announces itself as a fetch failure instead of quietly shortening a book. */
const COG_CHAPTERS = [36, 29, 31, 34, 26, 12, 35, 27, 23, 32, 34, 27, 24, 28, 27, 43, 24, 54, 28, 30, 27, 30];
const COG_PREFACE = new Set([1, 5, 6, 7]);
const COG_ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI",
  "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII"];
const COG_BASE = "Nicene and Post-Nicene Fathers: Series I/Volume II/City of God/Book ";

/* ---------- The Canterbury Tales: the twenty-five chapters, and where each one opens in each of the
   two plain-text sources ----------
   THE TITLES ARE TRANSCRIBED FROM THE TRANSLATION'S OWN CONTENTS PAGE, which lists the Prologue and
   twenty-four tales in this order and no other. The editors say in their preface that they follow
   Skeat's text throughout, and the Middle English column is that very edition, so the two divide the
   work identically and the chapter numbers below are the pairing as well as the fetch list. The
   edition's own spellings are kept, "Sumner" for the Summoner among them — a title is transcribed and
   never composed, and never quietly modernised either.

   `en` IS AN ANCHOR AND NOT A HEADING, because this translation prints no headings inside the tales.
   What it prints is Chaucer's own manuscript rubrics — "Here beginneth the Miller his Tale", "The
   Prologue of the Reeve's Tale" — set in italic between the paragraphs, and a chapter opens at the
   rubric that introduces its link or its prologue. The patterns are loose where the scan is unsure of
   a letter (it reads "Yeoman" as "Teoman" once) and they are searched FORWARD ONLY, each from where
   the last one matched, so a phrase that occurs twice in the book cannot pull a chapter backwards.

   `me` IS A HEADING, because the Middle English edition prints one over every tale, in capitals, on a
   line of its own. It is matched whole rather than by pattern: these are the strings the transcription
   carries, trailing stop and all, and a heading that has been re-typed announces itself as a fetch
   failure rather than silently folding two tales into one.

   THE KNIGHT'S TALE IS THE ONE PLACE THE TWO COLUMNS DIVIDE A BLOCK APART, and it is anchored on the
   LATIN EPIGRAPH for that reason. Both editions print the Prologue's closing rubric — "here beginneth
   the first tale, which is the knightes tale" — but the Middle English prints it BEFORE its heading
   and the translation after its last paragraph, so anchoring the English on the rubric would put it at
   the head of chapter 2 while the original kept it at the foot of chapter 1. Statius's tag, which both
   editions set immediately under the heading, falls in the same place in both. */
const CANTERBURY_TALES = [
  { t: "The Prologue",              en: /^Here beginneth the Book of the Tales of Canterbury/i,      me: "GROUP A. THE PROLOGUE." },
  { t: "The Knight's Tale",         en: /^Iamque domos patrias/i,                                    me: "THE KNIGHTES TALE." },
  { t: "The Miller's Tale",         en: /^Here follow the words between the Host and the Miller/i,   me: "THE MILLER’S PROLOGUE." },
  { t: "The Reeve's Tale",          en: /^The Prologue of the Reeve/i,                               me: "THE REEVE’S PROLOGUE" },
  { t: "The Cook's Tale",           en: /^The Prologue of the Cook/i,                                me: "THE COOK’S PROLOGUE." },
  { t: "The Man of Law's Tale",     en: /^The Words of the Host to the Company/i,                    me: "INTRODUCTION TO THE MAN OF LAW’S PROLOGUE." },
  { t: "The Shipman's Tale",        en: /^Here endeth the Tale of the Man of Law/i,                  me: "THE SHIPMAN’S PROLOGUE." },
  { t: "The Prioress's Tale",       en: /^Behold the merry words of the Host to the Shipman/i,       me: "THE PRIORESS’S PROLOGUE" },
  { t: "The Tale of Sir Thopas",    en: /^Behold the merry words of the Host to Chaucer/i,           me: "PROLOGUE TO SIR THOPAS." },
  { t: "The Tale of Melibeus",      en: /^Here the Host stinteth Chaucer of his Tale/i,              me: "PROLOGUE TO MELIBEUS." },
  { t: "The Monk's Tale",           en: /^The Monk.s Prologue/i,                                     me: "THE MONK’S PROLOGUE." },
  { t: "The Nun's Priest's Tale",   en: /^Here the Knight stinteth the Monk of his Tale/i,           me: "THE PROLOGUE OF THE NONNE PRESTES TALE." },
  { t: "The Physician's Tale",      en: /^Here followeth the Physician/i,                            me: "THE PHISICIENS TALE." },
  { t: "The Pardoner's Tale",       en: /^The words of the Host to the Physician and the Pardoner/i, me: "WORDS OF THE HOST." },
  { t: "The Wife of Bath's Tale",   en: /^The Prologue of the Wife of Bath/i,                        me: "THE WIFE OF BATH’S PROLOGUE." },
  { t: "The Friar's Tale",          en: /^The Prologue of the Friar/i,                               me: "THE FRIAR’S PROLOGUE." },
  { t: "The Sumner's Tale",         en: /^The Prologue of the Sumner/i,                              me: "THE SOMNOUR’S PROLOGUE" },
  { t: "The Clerk's Tale",          en: /^Here followeth the Prologue of the Clerk of Oxford/i,      me: "THE CLERK’S PROLOGUE." },
  { t: "The Merchant's Tale",       en: /^The Prologue of the Merchant/i,                            me: "THE MERCHANT’S PROLOGUE." },
  { t: "The Squire's Tale",         en: /^Here beginneth the Squire/i,                               me: "THE SQUIERES TALE." },
  { t: "The Franklin's Tale",       en: /^Here follow the Words of the Franklin/i,                   me: "THE FRANKLIN’S PROLOGUE." },
  { t: "The Second Nun's Tale",     en: /^The Prologue of the Second Nun/i,                          me: "THE SECONDE NONNES TALE." },
  { t: "The Canon's Yeoman's Tale", en: /^The Prologue of the Canon.s [TY]eoman/i,                   me: "THE CANON’S YEOMAN’S PROLOGUE" },
  { t: "The Manciple's Tale",       en: /^Here followeth the Prologue of the Manciple/i,             me: "THE MANCIPLE’S PROLOGUE." },
  { t: "The Parson's Tale",         en: /^Here followeth the Prologue of the Parson/i,               me: "THE PARSON’S PROLOGUE." },
];

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
        "numbers in its margins. That is why the Greek is not set beside the translation " +
        "here: two columns of a bilingual text are paired on the numbers a text " +
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

  "plato-dialogues": {
    title: "The Dialogues",
    // descriptive rather than transcribed: this gathering is Folio's, so it does not borrow a title page
    subtitle: "Thirty-five Works in Nine Tetralogies",
    author: "Plato",
    translator: "Harold North Fowler, W. R. M. Lamb and R. G. Bury",
    edition: "Loeb Classical Library, Harvard University Press, 1914–1929",
    written: "c. 399–347 BCE",

    /* ---------- THE LICENCE, and it has THREE grounds and one thing it declines to claim ----------
       WHY NOT JOWETT, since this book shipped in his translation first. Jowett's copyright is the
       easiest on the shelf and the reason for leaving him is not licensing at all: Wikisource's
       transcription of his edition is unfinished, and measured page by page it carries only eleven
       of the dialogues whole. The Loeb set is complete, and choosing it is the Thucydides trade made
       in the other direction — there the cleanest text to import (Hobbes, 1629) was refused because
       the Library is a reading room, and here the complete text and the readable one are the same
       text, so nothing is given up.

       THE ENGLISH rests on the date of publication and on nothing else. These translations were
       published between 1914 and 1929, so their United States copyright has expired: thirty of the
       thirty-five are pre-1929 outright, and the five in the Loeb volume of 1929 — Menexenus,
       Cleitophon, Timaeus, Critias and the Letters — reached the public domain on 1 January 2025,
       when the 95-year term for that year's publications ran out. That is a longer sentence than the
       other books here need and it is stated in full rather than rounded into "before 1929", which
       is the shorthand the rest of the shelf uses and which these five do not satisfy.

       WHAT IS NOT CLAIMED is a life-plus-seventy term for two of the three translators. R. G. Bury's
       dates are established (1869–1951), so his work clears that rule too. Harold North Fowler's and
       W. R. M. Lamb's death years are in nothing openable from here — no Wikidata entity for either
       — and a joint edition's term runs from the last surviving author, so no such claim is made for
       this translation anywhere. It is the Caesar entry's position exactly: half a byline that
       cannot be pinned down, publication date stated instead, and the gap named on the book's own
       page rather than rounded up. Do not fill these in from memory; the Hugo Magnus note under the
       Metamorphoses is what that costs.

       THE GREEK is Burnet's Oxford Classical Text, printed between 1903 and 1910, and Burnet died in
       1928 — so it clears the publication rule and life-plus-seventy alike, with nothing to qualify.

       AND BOTH COLUMNS NOW CARRY THE PERSEUS LAYER, which is new for this book and is why the
       disclosure moved into the book's own `rights` rather than sitting only in the original's. The
       English used to come from Wikisource and the Greek from Perseus; both now come from Perseus,
       whose digital editions are released under CC BY-SA 4.0 — verified in the canonical-greekLit
       repository itself. That is the Metamorphoses' position, not the Symposium's.

       The modern translations a reader is likeliest to own — the Hackett Complete Works edited by
       John Cooper (1997) and the Penguin and Oxford versions by Walter Hamilton, Robin Waterfield
       and Christopher Rowe — are all firmly in copyright, and are named here for the reason
       Campbell, Hays, Griffith and Lee are named above: so that nobody reaches for one later. */
    rights:
      "Public domain in the United States, on the date of publication. These Loeb Classical Library " +
      "translations were published between 1914 and 1929: thirty of the thirty-five works here were " +
      "published before 1929, and the five from the volume of 1929 — Menexenus, Cleitophon, " +
      "Timaeus, Critias and the Letters — entered the public domain on 1 January 2025, when the " +
      "95-year term for that year's publications expired. R. G. Bury died in 1951, so his share also " +
      "clears the author's-life rule; no such claim is made for Harold North Fowler's or W. R. M. " +
      "Lamb's share, because their dates could not be established here and a term running from the " +
      "last surviving translator cannot honestly be asserted without them. The Greek is John " +
      "Burnet's Oxford Classical Text, printed between 1903 and 1910, and Burnet died in 1928, so it " +
      "is public domain on both rules. Both texts are taken from the Perseus Digital Library, whose " +
      "digital editions are released under a Creative Commons Attribution-ShareAlike 4.0 " +
      "International licence. (The modern translations — the Hackett Complete Works edited by John " +
      "Cooper, 1997, and the Penguin and Oxford versions by Walter Hamilton, Robin Waterfield and " +
      "Christopher Rowe — are still in copyright and are not used here.)",
    sourceName: "Perseus Digital Library",
    sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0059/",

    /* THE FRONT MATTER — chapter 0, authored here for the reasons the Seneca entry sets out above.
       Five things a reader arriving at this book should be told rather than discover late: what a
       Platonic dialogue is and who is talking, how the thirty-five are arranged and why in that
       order, that several of them are probably not by Plato, where the Republic went, and what the
       numbers in the margin are for. */
    about: [
      "<b>The Dialogues</b> are the whole of Plato's surviving work, and they are conversations " +
        "rather than treatises. Plato wrote no lectures and argues nothing in his own voice; he " +
        "wrote scenes, with a time and a place and people who interrupt each other, and the " +
        "philosophy happens inside them. In most of them the questioner is Socrates, who wrote " +
        "nothing himself and was put to death by Athens in 399 BCE, and who here does what he was " +
        "famous for doing in life — asking men confident that they know what courage or friendship " +
        "or justice is to say what it is, and taking their answers apart. How much of the Socrates " +
        "in these pages is the historical man and how much is Plato has been argued about for two " +
        "thousand years and is not going to be settled.",
      "Plato was born in Athens around 428 BCE, into a family close to the city's politics, and " +
        "lived through its defeat by Sparta, the brief and violent oligarchy that followed, and the " +
        "restored democracy that killed his teacher. He founded the Academy in the 380s and taught " +
        "there until he died around 348. Readers usually sort the dialogues into an early group that " +
        "stays close to Socrates and ends without an answer, a middle group where Plato's own " +
        "doctrines arrive, and late works of a drier and more technical kind. That ordering is a " +
        "modern reconstruction and every part of it is disputed.",
      "They are arranged here in <i>tetralogies</i> — nine groups of four, the order in which Plato " +
        "was arranged in antiquity, credited to the scholar Thrasyllus in the first century CE and " +
        "still the order the standard reference numbering follows. It is not a chronology and was " +
        "never meant as one; the first group is a sequence of a different sort, running straight " +
        "through the end of Socrates' life — <i>Euthyphro</i> on the way in to court, the " +
        "<i>Apology</i> being his defence to the jury that condemned him, <i>Crito</i> in the cell " +
        "where he refuses to escape, and <i>Phaedo</i> on the last afternoon. Those four are where " +
        "most readers start, and they are short.",
      "Not everything here is certainly by Plato, and that was already being said in antiquity. " +
        "<i>Alcibiades II</i>, <i>Hipparchus</i>, <i>Rival Lovers</i>, <i>Theages</i> and " +
        "<i>Minos</i> are widely judged to be by someone else, the <i>Epinomis</i> is usually given " +
        "to a pupil, and the <i>Letters</i> are argued over one by one. They are kept because the " +
        "ancient arrangement keeps them and the edition prints them — this is what was transmitted " +
        "under Plato's name — and saying so is better than quietly dropping them or quietly passing " +
        "them off. <i>The Republic</i> is the one work of Plato's missing from this book, and only " +
        "because the English of it in this edition is still in copyright.",
      "The numbers in the margin are <i>Stephanus numbers</i> — the pages of Henri Estienne's " +
        "edition of 1578, by which Plato has been cited in every language ever since, so that a " +
        "reference like 'Symposium 189c' means the same passage in any edition. Because both texts " +
        "here carry them, the Greek can be set beside the English and paired on them exactly, and " +
        "every one of the thirty-five works pairs without a single gap on either side. The Greek is " +
        "John Burnet's Oxford text; the English is the Loeb Classical Library translation, by Harold " +
        "North Fowler, W. R. M. Lamb and R. G. Bury. The numbered notes folded under each dialogue " +
        "are the translators' own.",
    ],

    /* A CHAPTER IS A WHOLE DIALOGUE — a division the transmission states rather than one composed
       here, these being thirty-five separate works. Nothing is subdivided, not even the Laws, which
       is much the longest and which the edition splits across two volumes: its 327 Stephanus
       sections carry its twelve books' worth of structure, and cutting it further would mean
       composing boundaries. The sections are what the two columns pair on. */
    chapterWord: "Dialogue",
    // TRANSCRIBED, never composed — the names the edition files them under. See DIALOGUES.
    titleOf: (n) => DIALOGUE(n).t,
    chapters: DIALOGUES.map((_, i) => i + 1),
    /* The nine tetralogies, DERIVED from the table rather than written out beside it, so the groups
       and the order cannot come to disagree. Tetralogy VIII has three members here and not four,
       the Republic being absent — see the note above the table. */
    parts: TET_ROMAN.map((r, i) => {
      const idx = DIALOGUES.map((d, k) => (TETRALOGY(d) === i + 1 ? k + 1 : 0)).filter(Boolean);
      return { n: i + 1, label: "Tetralogy " + r, from: idx[0], to: idx[idx.length - 1] };
    }),

    /* BOTH COLUMNS ARE TEI NOW, one file per dialogue, which is what the whole of this rewrite buys.
       The book used to walk Wikisource for its English and read Perseus for its Greek, and the two
       had to be measured against each other afterwards. Here they are the same encoding of the same
       citation scheme from the same publisher, so the pairing is exact BY CONSTRUCTION rather than
       by luck — measured anyway, over all thirty-five, and it is 1,486 sections on each side with
       identical numbers in identical order and not one exception. That is better than the Art of
       War's facing page, which is the only other book here that pairs by construction.

       `subtype: "section"` is declared once and used by BOTH sides: teiSections defaults to
       "chapter" for Suetonius, and Burnet and the Loeb both say "section". */
    source: "tei",
    perChapter: true,
    subtype: "section",
    url: (n) =>
      "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0059/" +
      DIALOGUE(n).w + "/tlg0059." + DIALOGUE(n).w + ".perseus-eng2.xml",

    original: {
      lang: "grc",
      langName: "Greek",
      source: "tei",
      perChapter: true,
      subtype: "section",
      /* Ten of the eleven originally shipped dialogues were `perseus-grc2` and the Euthyphro was
         not; that holds across all thirty-five. Its grc1 file is the older encoding, whose divisions
         read `resp n subtype` where the newer ones read `n subtype` — inert, because teiSections
         reads a division's attributes independently of their order, but a probe that fixes the order
         reports that dialogue as having no sections whatever, which is how it was first measured. */
      url: (n) =>
        "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0059/" +
        DIALOGUE(n).w + "/tlg0059." + DIALOGUE(n).w + ".perseus-" + (DIALOGUE(n).grc || "grc2") + ".xml",
      edition: "John Burnet's Oxford Classical Text (Clarendon Press, 1903–1910), from the Perseus Digital Library",
      rights:
        "Two layers, both stated. The text is John Burnet's edition of the Greek, printed by the " +
        "Clarendon Press at Oxford between 1903 and 1910 and in the public domain — before 1929, and " +
        "Burnet died in 1928. The digital edition it is taken from is prepared by the Perseus " +
        "Digital Library at Tufts University and is released under a Creative Commons " +
        "Attribution-ShareAlike 4.0 International licence.",
      sourceName: "Perseus Digital Library",
      sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0059/",
    },
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
        "the poem. This edition prints no translator's notes, so there is no fold of them under " +
        "each chapter.",
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
        "this page: it prints no translator's notes, so there is no fold of them under each book, and Perseus's Latin file names no editor for the text it prints, so " +
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

  "aristotle-nicomachean-ethics": {
    title: "Nicomachean Ethics",
    // the running head this volume prints over the work, not a description composed here
    subtitle: "Ethica Nicomachea",
    author: "Aristotle",
    translator: "W. D. Ross",
    edition: "The Works of Aristotle Translated into English, Volume IX, Clarendon Press, Oxford, 1925",
    written: "c. 340 BCE",

    /* ---------- THE LICENCE, and this is the SECOND book here to state a LIMIT ----------
       The Art of War is the other one, and the shape is the same: the ground is publication before
       1929 and the limit is the translator's life. Ross's volume was printed at Oxford in 1925, so
       its copyright has expired in the United States; Ross lived until 1971, so in a country whose
       term is the author's life plus seventy it does not expire until 2042. Wikisource's own tag on
       the work says exactly this — public domain in the US, and elsewhere only where the term is
       life plus 54 years or less — and it is quoted rather than paraphrased into something softer.

       That limit is longer than Giles's, which runs to 2029, and it was weighed rather than waved
       through. What buys it is the second column: Ross's is the translation that carries the Bekker
       pages, and without them Aristotle cannot be set beside his own Greek here at all. The
       alternative on the same shelf is Chase's translation of 1847, whose copyright has expired
       everywhere — and it prints the Bekker numbers in Book One and in none of the other nine, so it
       could only ever ship as an English column on its own. Measured, both of them, before the choice
       was made: Chase agrees with the Greek on 18 of its 181 pages and Ross on 173 of 173.

       The Greek costs nothing on either rule. Bywater's Oxford Classical Text was printed in 1894 and
       Bywater died in 1914, so it clears the pre-1929 rule and life-plus-seventy alike, and the work
       under both columns is some twenty-four centuries old. Its DIGITAL edition carries the Perseus
       CC BY-SA 4.0 layer the Meditations' Greek introduced, which is credited in `rights` on both
       sides and on the book's own page.

       The modern translations a reader is likeliest to own — Terence Irwin's (1985, revised 1999),
       Roger Crisp's Cambridge text (2000) and Christopher Rowe's with Sarah Broadie's commentary
       (2002) — are all firmly in copyright, and are named for the reason Campbell, Hays, Griffith and
       Lee are named above. One of them needs naming with particular care: the Oxford World's Classics
       Aristotle sold today is ROSS REVISED BY LESLEY BROWN (2009), which carries this translator's
       name on its cover and is a separate copyrighted work. It is not what is here, and it is not to
       be reached for on the strength of the name. */
    rights:
      "Public domain in the United States: Ross's translation was published at Oxford in 1925 — before " +
      "1929 — so its copyright there has expired. Ross died in 1971, so it remains in copyright in " +
      "countries whose term is the author's life plus more than 54 years, including the United Kingdom " +
      "and the European Union, until 2042. The Greek beside it is Ingram Bywater's Oxford Classical " +
      "Text of 1894, and Bywater died in 1914, so that is public domain on both rules; the digital " +
      "edition of it is released by the Perseus Digital Library under a Creative Commons " +
      "Attribution-ShareAlike 4.0 International licence. Aristotle's own text is some twenty-four " +
      "centuries old. (The modern translations by Terence Irwin, 1985, Roger Crisp, 2000, and " +
      "Christopher Rowe, 2002, are still in copyright and are not used here — as is the 2009 Oxford " +
      "World's Classics revision of this very translation by Lesley Brown, which is a separate work.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/Nicomachean_Ethics_(Ross)",

    /* THE FRONT MATTER — chapter 0, authored here for the reasons the Seneca entry sets out above.
       Four things a reader arriving at this book should be told rather than discover late: it is
       lecture material and reads like it, its central question is not the one modern ethics asks,
       three of its ten books are shared with another work of Aristotle's, and the translation is a
       hundred years old and has a manner. */
    about: [
      "<b>Nicomachean Ethics</b> is Aristotle's inquiry into how a human life goes well, and it opens " +
        "by asking what the highest good for a person is rather than what our duties are. His answer " +
        "is <i>eudaimonia</i> — usually rendered 'happiness', though it means something closer to " +
        "flourishing, or living and doing well over a whole life. What follows is an attempt to say " +
        "what such a life consists in: not pleasure, not honour, not wealth, but activity of the soul " +
        "in accordance with virtue, argued for on the ground that a good anything is one that performs " +
        "its characteristic work well, and that the work characteristic of a human being is reasoning.",
      "Aristotle was born at Stagira in northern Greece in 384 BCE, came to Athens at about seventeen " +
        "and spent some twenty years in Plato's Academy, left after Plato's death, tutored the young " +
        "Alexander of Macedon, and returned to Athens in 335 to found his own school at the Lyceum. He " +
        "died in 322. This book is generally taken to be teaching material from the Lyceum years — " +
        "not a treatise written for the public but the substance of lectures, which is why it can be " +
        "abrupt, why it argues with unnamed opponents, and why it sometimes announces a plan it then " +
        "carries out in a different order. The title refers to Nicomachus, the name of both Aristotle's " +
        "father and his son; what the connection is has never been settled.",
      "The most famous doctrine in it is the mean: a virtue of character is a disposition lying between " +
        "an excess and a deficiency, courage between recklessness and cowardice, generosity between " +
        "waste and meanness. It is easy to mistake this for a recommendation of moderation in all " +
        "things, which Aristotle does not make — the mean is relative to the person and the situation, " +
        "some actions admit of no mean at all, and hitting it is the difficult thing rather than the " +
        "safe one. Virtue of character is acquired by habituation rather than teaching, and is " +
        "inseparable from <i>phronesis</i>, practical wisdom, the capacity to see what a particular " +
        "situation calls for. Nearly a fifth of the whole work — two of the ten books — is about " +
        "friendship, which Aristotle takes to be a condition of a good life rather than an ornament " +
        "of one.",
      "Three of the ten books, V, VI and VII, are shared word for word with the <i>Eudemian Ethics</i>, " +
        "another ethical work of Aristotle's; they are known as the common books, and which treatise " +
        "they were written for is an old and unresolved question. That is worth knowing before reading " +
        "them, because it is part of why the discussion of pleasure in Book VII and the one in Book X " +
        "do not sit altogether comfortably together. The last book ends by arguing that the highest " +
        "happiness is contemplative, and then turns outward: virtue needs law and upbringing to " +
        "produce it, which is a matter for the statesman — and the closing paragraphs hand the reader " +
        "straight on to the <i>Politics</i>.",
      "The numbers in the margin are <i>Bekker numbers</i> — the page and column of Immanuel Bekker's " +
        "Berlin edition of 1831, by which Aristotle has been cited in every language ever since, so " +
        "that a reference such as 'NE 1106b36' means the same passage in any edition. This work runs " +
        "from 1094a to 1181b, and because both texts here state those numbers the Greek can be set " +
        "beside the English and paired on them exactly. The Greek is Ingram Bywater's Oxford text of " +
        "1894. The bold figures running through each book are its chapter numbers, as this edition " +
        "sets them, and the numbered notes folded underneath are the translator's own. W. D. Ross " +
        "edited the Oxford Translation of Aristotle and did this volume himself in 1925; it has been " +
        "the standard English Aristotle for a century, and it is a close, careful, rather austere " +
        "rendering that follows the Greek's compression faithfully enough to be hard going in the same " +
        "places the Greek is.",
    ],

    chapterWord: "Book",
    /* The ten books have no titles: this volume heads them "BOOK I" … "BOOK X" and gives them no
       names, so that is what they are called here. The edition does carry an analytical table of
       contents, and composing titles out of it — "Pleasure", "Friendship" — would be inventing an
       apparatus the text does not have, which is the rule the Meditations' twelve books established. */
    titleOf: (n) => "Book " + toRoman(n),
    /* THE FOURTH WAY an edition marks its numbers — Bekker pages, a figure with a column letter, set
       in the margin as a nested `wst-verse`. See the note in cleanBody: neither the Gummere rule nor
       the Jowett one can read them, and this edition marks Bekker's LINE numbers the same way, which
       is what the pass has to tell them apart from. */
    sections: "bekker",
    /* The volume's half-title above Book I and each book's own head, both of which arrive as centred
       blocks and would otherwise render as a quotation at the top of a chapter already headed Book I.
       Anchored to the start of a block, as the Republic's are. */
    dropHeads: [/^ETHICA NICOMACHEA\b/i, /^BOOK\s+[IVXLCDM]+\.?$/i],
    /* This volume's subpages are titled with the book number spelled out rather than numbered. */
    page: (n) => "Nicomachean Ethics (Ross)/Book " + NE_BOOK_WORDS[n - 1],
    chapters: Array.from({ length: 10 }, (_, i) => i + 1),

    /* ---------- THE GREEK, and why it is Bywater rather than another text ----------
       The rule is the one the Meditations' entry sets out: the columns pair on numbers a text states
       about itself, so an original may ship only where BOTH sides state them. Aristotle states his
       everywhere — the Bekker page is printed in the margin of essentially every edition and
       translation in every language — so the question here was never whether the numbers exist but
       whether the two files carry them, and both do: Bywater's as `<milestone unit="page"
       resp="Bekker"/>` standing in the prose, Ross's as marginal figures.

       MEASURED BEFORE IT WAS BELIEVED, over all ten books. Bywater has 181 Bekker pages and Ross 173,
       and every one of Ross's 173 is present in the Greek — nothing on the English side that is not
       on the Greek side, which is the direction that would signal a misread. Of the eight the Greek
       has and Ross does not, five are the page a BOOK BEGINS IN THE MIDDLE OF: Bekker's pages run
       continuously across the work while the book divisions fall where they fall, so 1109b holds the
       end of Book II and the start of Book III, and the Greek marks it in both while Ross's margin
       gives it once. Those pair as an empty cell, which is the honest rendering and not a fault.
       The remaining three — 1138b in Book V, 1142a in Book VI, 1170a in Book IX — are the casualties
       of the three repeated marks described below, and are the only ones a repair would recover.

       THE THREE REPEATS ARE RECORDED AND DELIBERATELY NOT REPAIRED. This transcription marks one page
       twice in each of Books V, VI and IX — 1138a, 1142b and 1170b — and in each case lacks the page
       the Greek states next to it (1138b, 1142a, 1170a). The obvious reading is that the second mark
       of each pair is a slip for its neighbour, and the evidence for it is decent: the pattern is the
       same all three times and the missing page is exactly the one that would fill it. It is still an
       inference about somebody else's printed page, so the forward-only guard in cleanBody drops the
       repeat, the material folds into the page already open, and the Greek's own page draws beside an
       empty cell — three rows out of 181. Correcting them here would be composing an apparatus, which
       is what the Meditations' Greek was abandoned for. */
    original: {
      lang: "grc",
      langName: "Greek",
      source: "tei",
      layout: "paged",
      // the count teiPagedBooks checks itself against, so a silent under-read reports rather than ships
      pages: 181,
      url: "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0086/tlg010/tlg0086.tlg010.perseus-grc2.xml",
      edition: "Ingram Bywater's Oxford Classical Text (Clarendon Press, 1894), from the Perseus Digital Library",
      rights:
        "Two layers, both stated. The text is Ingram Bywater's edition of the Greek, printed by the " +
        "Clarendon Press at Oxford in 1894 and in the public domain — before 1929, and Bywater died in " +
        "1914. The digital edition it is taken from is prepared by the Perseus Digital Library at " +
        "Tufts University and is released under a Creative Commons Attribution-ShareAlike 4.0 " +
        "International licence.",
      sourceName: "Perseus Digital Library",
      sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0086.tlg010/",
    },
  },

  "sophocles-oedipus-rex": {
    title: "Oedipus Rex",
    // the play's own Greek title, which is what its Greek column is an edition of — the Lucretius
    // pattern. Latin gives it as both Oedipus Rex and Oedipus Tyrannus, and this edition uses the
    // second; the two are the same play and the front matter says so.
    subtitle: "Οἰδίπους Τύραννος",
    author: "Sophocles",
    translator: "Richard Jebb",
    edition: "Sophocles: The Plays and Fragments, Volume 1, Cambridge University Press, 1887",
    written: "c. 429 BCE",

    /* ---------- THE LICENCE, and it is the easiest on this shelf ----------
       The Republic's was called the only one needing no qualification at all. This one matches it and
       does so on BOTH columns at once, which no other book here manages.

       Richard Claverhouse Jebb published this translation at Cambridge in 1887 and died in 1905, so it
       is public domain on the pre-1929 publication rule, on life plus seventy, and on life plus a
       hundred. Francis Storr's Greek text was published in the Loeb Classical Library in 1912 and
       Storr died in 1919, so the same three grounds carry it. Both years were CHECKED rather than
       recalled — Wikisource's author pages give Jebb 1841–1905 and Storr 1839–1919 — because the Ovid
       entry's Hugo Magnus mistake was exactly a death year asserted from memory to hold up a licence.
       Neither needs the limit the Art of War states for Giles (in copyright in life-plus-seventy
       countries until 2029) or the Nicomachean Ethics for Ross (until 2042). The play beneath them was
       written in Athens in the fifth century BCE.

       The second layer is Perseus's, as it is for the Meditations' Greek and for both columns of Ovid,
       Suetonius and Lucretius: the digital editions of both texts are prepared by the Perseus Digital
       Library, whose canonical-greekLit repository releases its contents under CC BY-SA 4.0 unless
       otherwise indicated, and neither of these two files indicates otherwise. Credited in `rights`,
       printed on the book's own page, and named in the About page's credits.

       The translations a reader is likeliest to own — Dudley Fitts and Robert Fitzgerald's of 1949,
       David Grene's of 1942, Robert Fagles's of 1982 and Anne Carson's Antigonick-era versions — are
       all firmly in copyright, and are named here for the reason Campbell, Hays, Griffith, Lee,
       Humphries, Melville and Brown are named above: so that nobody reaches for one. */
    /* CORRECTED Aug 2026, when the Antigone was added: this said "public domain on every ground, in
       both columns" and left out that Perseus has edited the PROSE as well as digitising it. The
       English served here is Jebb MODERNIZED TO REMOVE ARCHAISMS, by Alex Sens in 1988 and reviewed
       by John Gibert, which this file's own header states — a recent derivative work carried by
       CC BY-SA 4.0 rather than by an expiry, which is the Histories' case and is now stated here as
       it is on the Antigone. Found by running the check across all three plays rather than only over
       the book being added; Coleridge's Medea carries no such note, checked rather than assumed. */
    rights:
      "Public domain in both columns, with one addition stated. Richard Jebb's translation was " +
      "published at Cambridge in 1887 and Jebb died in 1905, so its copyright has expired in the " +
      "United States on the pre-1929 publication rule and everywhere that the term is the author's " +
      "life plus a hundred years or less. The Greek beside it is Francis Storr's text of 1912, and " +
      "Storr died in 1919, so the same holds of it. Sophocles wrote the play in Athens some " +
      "twenty-four centuries ago. The English printed here is not quite Jebb's page, however: it is " +
      "his translation modernized to remove archaisms, by Alex Sens in 1988 and reviewed by John " +
      "Gibert, which the source file records in its own header. That editing is a recent work rather " +
      "than an expired one, and it — with the digital editions of both texts — is prepared by the " +
      "Perseus Digital Library at Tufts University and released under a Creative Commons " +
      "Attribution-ShareAlike 4.0 International licence. (The modern translations by David Grene, " +
      "1942, Dudley Fitts and Robert Fitzgerald, 1949, and Robert Fagles, 1982, are still in " +
      "copyright and are not used here.)",
    sourceName: "Perseus Digital Library",
    sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0011.tlg004/",

    /* THE FRONT MATTER — chapter 0. Five things a reader should be told before they start rather than
       work out late: that the story was already old when it was staged and the suspense is not
       whodunnit, what the alternating parts and the singing chorus are, how little is known about the
       date, what the play's enormous afterlife has done to how it is read, and what the small figures
       and the italic directions in the two columns are. */
    about: [
      "<b>Oedipus Rex</b> is a tragedy staged in Athens in the fifth century BCE, and it is usually " +
        "the play people mean when they talk about Greek tragedy at all. Thebes is dying of plague, " +
        "and the oracle at Delphi says the cause is the unpunished murder of the city's previous " +
        "king. Oedipus, who solved the riddle of the Sphinx and was given the throne and the widowed " +
        "queen as his reward, undertakes to find the killer. The play is the investigation, and it " +
        "takes about ninety minutes: a sequence of witnesses, each of whom knows one piece of it, and " +
        "each of whom Oedipus compels to speak against their own strong wish not to.",
      "The story was already old when Sophocles staged it, and the first audience knew the ending. " +
        "That is not a defect in the suspense but the source of it. Every scene is watched by people " +
        "who can see what the man on stage cannot, so his confidence reads as danger and his " +
        "determination to know the truth is what destroys him; the word he uses for himself again and " +
        "again is the one for a man who sees clearly, and the man who does see clearly is the blind " +
        "prophet he insults. What the play is asking is not what happened — everyone knows what " +
        "happened — but whether a man who did what Oedipus did, in ignorance and while trying to " +
        "avoid it, is guilty of it. It does not answer.",
      "It is written in the shape every Athenian tragedy uses, and this edition marks it: spoken " +
        "scenes alternating with odes sung and danced by a chorus of Theban elders, who are characters " +
        "in the story as well as commentators on it. Folio's parts follow the edition's own divisions, " +
        "and its own labels for them — a spoken part is an <i>episode</i> and a sung one a " +
        "<i>choral ode</i>. Elsewhere you will meet a more precise set of names for the same " +
        "divisions: prologue for the opening scene, parodos for the chorus's entrance song, stasimon " +
        "for each ode after it, and exodos for the final scene. Those are the standard analysis and " +
        "they are worth knowing, but they are not the words this edition uses, so they are not used " +
        "here.",
      "Almost nothing is documented about the play's first performance, including its date. It is " +
        "usually put around 429 BCE, and the argument for that is internal — the plague at Thebes is " +
        "described in terms that recall the plague which struck Athens in 430 — which is suggestive " +
        "rather than decisive. What is recorded is that it did not win first prize. Sophocles lived " +
        "from about 496 to 406 BCE, wrote some hundred and twenty plays of which seven survive whole, " +
        "and served Athens as a treasurer and a general. Two of the other six take up the same family: " +
        "<i>Oedipus at Colonus</i>, written at the very end of his life, and <i>Antigone</i>, about " +
        "Oedipus's daughter, which he wrote first — so the three are not a trilogy and were composed " +
        "in the reverse of their story's order.",
      "The translation here is Richard Jebb's of 1887, and the Greek beside it is Francis Storr's " +
        "text of 1912. One thing about the English should be said plainly: it is not quite Jebb's " +
        "page. The Perseus Digital Library, which prepared both texts, also modernized this " +
        "translation in 1988 to remove archaisms, so the wording is Jebb's revised rather than " +
        "Jebb's as printed. The small raised figures running through both columns are LINE numbers of the " +
        "Greek, which is how any passage of a tragedy is cited in any language: Jebb translates into " +
        "prose and so numbers the line each block of it begins at, while Storr's verse numbers every " +
        "line, and a figure appearing in both columns marks the same place in the play. Two things " +
        "about the page are differences between the editions rather than faults in it. Three of the " +
        "six hundred and eighty-three English passages draw beside an empty Greek cell, where Jebb " +
        "numbers a line Storr does not. And the italic stage directions are JEBB'S: the ancient text " +
        "records none, and every one printed in a modern edition is its editor's inference from what " +
        "the characters say, which is why the Greek column beside them is blank.",
    ],

    /* ---------- A PLAY: the fifth layout, and the first work here that is performed ----------
       See the drama block above teiDramaDivisions for the whole of the reasoning. The short version:
       the two columns pair on the LINE NUMBER, which both editions state on every line and which is
       the universal citation unit for Greek tragedy; the fifteen parts are the edition's own
       divisions and open at the same fifteen lines on both sides; and the speaker of each speech is
       carried through, because in a play it is not furniture around the text but part of it.

       MEASURED over the whole play before any of it was believed: 15 divisions on each side with
       identical kinds and identical opening lines, 458 speeches on each side, 683 English sections of
       which 680 draw Greek beside them. The three that do not are lines 159, 669 and 689, where Jebb
       numbers a line Storr does not; they are recorded rather than repaired, as the Nicomachean
       Ethics' three repeated Bekker pages are, because closing them would mean composing an
       apparatus.

       AND THE <del> RULE IS NOT INERT HERE, which is the thing Lucretius said to measure rather than
       assume. This edition carries exactly one, and it wraps a WHOLE line — 625a, an answer of
       Oedipus's that the edition brackets as spurious — so dropping it with its words takes the
       English from 684 sections to 683. That is the same judgement the Meditations' Greek and
       Lucretius's Latin make (what ships is the text the edition constitutes), but as there it
       changes the count, so the count is stated. */
    source: "tei",
    url: "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0011/tlg004/tlg0011.tlg004.perseus-eng2.xml",
    layout: "drama",
    /* "Part" is Folio's own neutral word for a division, and is deliberately not "Scene" or "Act":
       this edition numbers its divisions not at all, and an act is a later theatre's unit that a
       Greek tragedy does not have. The number is Folio's; the NAME of each part is the edition's. */
    chapterWord: "Part",
    // fifteen is what the edition divides the play into, and is checked against the file on every run
    chapters: Array.from({ length: 15 }, (_, i) => i + 1),

    original: {
      lang: "grc",
      langName: "Greek",
      source: "tei",
      layout: "drama",
      edition: "Francis Storr, Loeb Classical Library, William Heinemann, London, 1912",
      rights:
        "Two layers, both stated. Sophocles wrote the play in Greek in the fifth century BCE, so the " +
        "words themselves are in the public domain everywhere. The text printed here is Francis " +
        "Storr's of 1912, published before 1929 and by an editor who died in 1919, so its copyright " +
        "has expired on every rule. The digital edition is prepared by the Perseus Digital Library at " +
        "Tufts University and is released under a Creative Commons Attribution-ShareAlike 4.0 " +
        "International licence.",
      sourceName: "Perseus Digital Library",
      sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0011.tlg004/",
      url: "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0011/tlg004/tlg0011.tlg004.perseus-grc2.xml",
    },
  },

  "herodotus-histories": {
    title: "The Histories",
    // the work's own Greek title, as the Lucretius and Sophocles entries give theirs
    subtitle: "Ἱστορίαι",
    author: "Herodotus",
    translator: "A. D. Godley",
    edition: "Herodotus, with an English translation by A. D. Godley, Loeb Classical Library, Harvard University Press and William Heinemann, 1920–1925",
    written: "c. 430 BCE",

    /* ---------- THE LICENCE, and the second layer is THICKER here than anywhere else on the shelf ----------
       The expired-copyright half is the easiest kind, the Republic's and the Oedipus Rex's: Alfred Denis
       Godley published this translation and the Greek facing it in the Loeb between 1920 and 1925, and
       he died in 1925. So both columns are public domain in the United States on the pre-1929
       publication rule, and everywhere the term is the author's life plus a hundred years or less.
       CHECKED rather than recalled — Wikisource's author page gives 1856–1925 and carries the
       died-at-least-a-hundred-years-ago tag — because the Ovid entry's Hugo Magnus mistake was exactly
       a death year asserted from memory to hold up a licence. No limit needs stating, as one does for
       Giles (2029) and for Ross (2042).

       WHAT IS DIFFERENT HERE IS THE PERSEUS LAYER, and it must not be smoothed into the sentence the
       other Perseus books use. For the Meditations' Greek, and for both columns of Ovid, Suetonius,
       Lucretius and the Oedipus Rex, Perseus's contribution is the DIGITAL EDITION — the transcription,
       the markup, the CTS numbering — over a printed text left as its editor set it. Here they have
       also edited the PROSE. The file says so in its own header, and it is quoted rather than
       paraphrased: "This text was modernized by Steven Ott, to remove archaisms. It was reviewed by
       John Marincola, and revisions were made accordingly." So what ships is Godley's translation with
       its thees and thous brought up to date by a named modern hand, which is a derivative work of
       Perseus's own making and is covered by their licence rather than by an expiry.

       That is a real departure and is stated three times over — in `rights`, on the book's own front
       matter page, and in this comment — because a reader who goes looking for the 1920 printing must
       not be surprised by what they find. It is the same departure the Meditations' Greek made when
       CC BY-SA content first came onto the shelf, one degree further: the repository states "Unless
       otherwise indicated, all contents of this repository are licensed under a Creative Commons
       Attribution-ShareAlike 4.0 International License", and neither of these two files indicates
       otherwise (both were checked for an <availability> element; neither carries one).

       The translations a reader is likeliest to own — Aubrey de Sélincourt's of 1954, Robin
       Waterfield's of 1998, Andrea Purvis's for the Landmark Herodotus of 2007 and Tom Holland's of
       2013 — are all firmly in copyright, and are named here for the reason Campbell, Hays, Griffith,
       Lee, Humphries, Melville, Brown and Fagles are named above: so that nobody reaches for one. */
    rights:
      "Public domain on every ground, in both columns, with one modern layer stated plainly. A. D. " +
      "Godley's translation and the Greek text facing it were published in the Loeb Classical Library " +
      "between 1920 and 1925 — before 1929 — and Godley died in 1925, so their copyright has expired " +
      "in the United States and everywhere that the term is the author's life plus a hundred years or " +
      "less. Herodotus wrote the work in Greek some twenty-five centuries ago. The English here is " +
      "not quite the 1920 printing, however: it is Godley's translation as modernized by the Perseus " +
      "Digital Library to remove archaisms, a revision made by Steven Ott and reviewed by John " +
      "Marincola. That revision, and the digital editions of both texts, are prepared by the Perseus " +
      "Digital Library at Tufts University and are released under a Creative Commons " +
      "Attribution-ShareAlike 4.0 International licence. (The modern translations by Aubrey de " +
      "Sélincourt, 1954, Robin Waterfield, 1998, Andrea Purvis, 2007, and Tom Holland, 2013, are " +
      "still in copyright and are not used here.)",
    sourceName: "Perseus Digital Library",
    sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0016.tlg001/",

    /* THE FRONT MATTER — chapter 0. Five things a reader should be told before they start rather than
       work out late: what the book is and how little of it is the war it is named for, what Herodotus
       thought he was doing and why he is both trusted and distrusted, that the Muse names everyone
       has heard are not in this edition, who he was, and what the two columns and the small figures
       running through them are. */
    about: [
      "<b>The Histories</b> is the oldest work of history in the Western tradition that survives " +
        "whole, and it is the book that gave the enterprise its name. Herodotus set out to explain why " +
        "the Greeks and the Persians went to war, a conflict that reached its crisis in his own " +
        "parents' lifetime, when the invasions of 490 and 480 BCE were turned back at Marathon, " +
        "Salamis and Plataea. He opens by saying exactly what he is doing: \"This is the display of " +
        "the inquiry of Herodotus of Halicarnassus, so that things done by man not be forgotten in " +
        "time, and that great and marvelous deeds, some displayed by the Hellenes, some by the " +
        "barbarians, not lose their glory.\" What is surprising on first reading is how little of the " +
        "book is battle. Rather more than half of it is the story of how Persia grew large enough to " +
        "make the war possible, and the peoples it swallowed on the way — so the reader gets Egypt, " +
        "Scythia, Lydia, Babylon and Libya at length before a Persian ship reaches Greece.",
      "The word in that opening sentence translated \"inquiry\" is <i>historiē</i>, which meant asking " +
        "and finding out rather than the written record it has come to mean since. That is what he " +
        "does: he travelled, he asked people, and he set down what they told him — often several " +
        "incompatible versions of the same event, with the sources named and sometimes his own opinion " +
        "of them attached. He is candid about the method to the point of stating it as a rule, in the " +
        "middle of a story he plainly disbelieves: \"although it is my business to set down that which " +
        "is told me, to believe it is none at all of my business.\" Antiquity took both possible views " +
        "of this. Cicero called him the father of history; Plutarch wrote a whole essay accusing him " +
        "of malice and invention. Modern readers have generally come round to him, partly because " +
        "excavation and Egyptian and Near Eastern records have confirmed a good deal that used to be " +
        "dismissed — but he reports marvels as marvels, and the reader is expected to keep their wits.",
      "The work is in nine books, and you will have heard that they are named after the nine Muses — " +
        "Clio, Euterpe, Thalia and the rest. They are, by long convention, but not by Herodotus: the " +
        "division and the names are the work of later editors, first attested centuries after his " +
        "death, and this edition uses neither. It numbers its nine books and does not name them, so " +
        "Folio does the same. Their shape is roughly two movements. Books 1 to 4 are the rise of " +
        "Persia under Cyrus, Cambyses and Darius, carrying the great descriptions of the countries " +
        "they conquered — book 2, on Egypt, is nearly a separate work. Books 5 to 9 are the war " +
        "itself: the Ionian revolt, Marathon, then Xerxes' invasion and the campaigns of Thermopylae, " +
        "Salamis, Plataea and Mycale.",
      "Herodotus came from Halicarnassus, a Greek city on the coast of what is now Turkey, and was " +
        "born in about 484 BCE; he seems to have died around 425. Both dates are conventional and rest " +
        "on very little. He was a subject of the Persian empire by birth, which is worth holding onto " +
        "while reading him on Persia — he is not writing from outside it — and he travelled widely " +
        "enough that the book claims first-hand knowledge of Egypt, the Black Sea coast and " +
        "Mesopotamia. Later tradition associates him with Thurii, an Athenian colony in southern " +
        "Italy, and with public readings of the work at Athens. Almost everything else said about his " +
        "life comes from a Byzantine encyclopedia compiled well over a thousand years after he died, " +
        "and is worth about as much as that suggests.",
      "The translation here is A. D. Godley's, made for the Loeb Classical Library and published in " +
        "four volumes between 1920 and 1925, and the Greek beside it is the text Godley printed on the " +
        "facing page. One thing about the English should be said outright: it is not word for word the " +
        "1920 printing. The Perseus Digital Library has modernized it to remove archaisms — the " +
        "revision was made by Steven Ott and reviewed by John Marincola — so the thees and thous are " +
        "gone, which is why it reads more plainly than a translation of its age usually does. The " +
        "small raised figures running through both columns are CHAPTER numbers, and they are how any " +
        "passage of Herodotus is cited in any language: \"Herodotus 1.32\" means book 1, chapter 32. " +
        "Both editions state them and, measured over the whole work, they agree exactly — 1,578 " +
        "chapters on each side, the same numbers in the same order in all nine books, which is " +
        "as exact a pairing as two independently edited texts manage. Editions also divide a chapter into finer " +
        "numbered sections; those are not used for pairing here, because nine of the 1,578 chapters " +
        "number them differently in the two editions, and a passage set beside one that is not its " +
        "counterpart is worse than a longer passage. The numbered notes are the edition's own.",
    ],

    /* ---------- PROSE IN BOOKS OF NUMBERED CHAPTERS: the sixth layout ----------
       See the block above teiBookChapters for the whole of the reasoning. The short version: a Folio
       chapter is one of the nine books, the pairing runs on the CHAPTER numbers inside it, and the
       finer `section` divisions are concatenated into the chapter the way Leopold's are into a chapter
       of the Meditations.

       MEASURED over the whole work before any of it was believed: 9 books on each side; 1,578 chapters
       on each side with identical numbers in identical order in every book; 4,338 sections on each
       side, of which nine chapters number them differently — which is precisely why the chapter and
       not the section is the unit. The nine are recorded rather than repaired.

       TWO EXTRACTION FAULTS were found in this edition and both are fixed in teiInline, where they are
       described at length: Perseus's name-authority `<reg>` (4,305 of them, which put a modern Turkish
       gazetteer entry with coordinates inside the book's first sentence) and the `<choice>` element of
       the Greek. Neither throws, both leave the prose complete, and each was found only by reading the
       output rather than by counting it. */
    source: "tei",
    url: "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0016/tlg001/tlg0016.tlg001.perseus-eng2.xml",
    layout: "chaptered",
    chapterWord: "Book",
    // nine is the whole work, and it is checked against the file on every run
    chapters: Array.from({ length: 9 }, (_, i) => i + 1),
    /* No `titleOf`: this edition heads its nine books with nothing at all — measured, there is not a
       single <head> element in either file — so they are Book 1 to Book 9, exactly as the Meditations'
       twelve are. The Muse names are the obvious thing to reach for and are deliberately not used:
       they are a later convention this edition does not print, and transcribing a title rather than
       composing one is the rule. Said in the front matter instead, where it belongs. */

    original: {
      lang: "grc",
      langName: "Greek",
      source: "tei",
      layout: "chaptered",
      edition: "A. D. Godley, Loeb Classical Library, Harvard University Press and William Heinemann, 1920–1925",
      rights:
        "Two layers, both stated. Herodotus wrote the work in Greek in the fifth century BCE, so the " +
        "words themselves are in the public domain everywhere. The text printed here is the one A. D. " +
        "Godley set on the facing page of his Loeb edition, published between 1920 and 1925 by an " +
        "editor who died in 1925, so its copyright has expired on every rule. The digital edition is " +
        "prepared by the Perseus Digital Library at Tufts University and is released under a Creative " +
        "Commons Attribution-ShareAlike 4.0 International licence.",
      sourceName: "Perseus Digital Library",
      sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0016.tlg001/",
      url: "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0016/tlg001/tlg0016.tlg001.perseus-grc2.xml",
    },
  },

  "confucius-analects": {
    title: "The Analects",
    subtitle: "Confucian Analects",
    author: "Confucius",
    translator: "James Legge",
    edition: "The Chinese Classics, Vol. I, 2nd revised edition, Clarendon Press, Oxford, 1893",
    written: "c. 5th–3rd century BCE",

    /* ---------- THE LICENCE, and this is the second book here that needs no qualification ----------
       The Republic was the first. Legge published this translation in 1861 and revised it for the
       second edition of 1893, both comfortably before 1929, so it is public domain in the United
       States on the same ground as everything else on this shelf; and he died in 1897, so it is
       public domain on life-plus-seventy and on life-plus-a-hundred as well. There is no limit to
       state, as there is for Giles (2029) and Ross (2042). The Chinese underneath is some
       twenty-four centuries old and free everywhere.

       The modern translations a reader is likeliest to own are all in copyright and are named so that
       nobody reaches for one later: Arthur Waley's of 1938, D. C. Lau's Penguin of 1979, Simon Leys's
       of 1997 and Edward Slingerland's of 2003. */
    rights:
      "Public domain worldwide: Legge published this translation in 1861 and revised it for the " +
      "second edition of 1893 — both before 1929, so its United States copyright has expired — and " +
      "he died in 1897, so it is out of copyright wherever the term runs for the author's life plus " +
      "seventy or even a hundred years. The Chinese it is printed beside is some twenty-four " +
      "centuries old and is in the public domain everywhere. (The modern translations by Arthur " +
      "Waley, 1938, D. C. Lau, 1979, Simon Leys, 1997, and Edward Slingerland, 2003, are still in " +
      "copyright and are not used here.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/The_Chinese_Classics/Volume_1/Confucian_Analects",

    /* THE FRONT MATTER — chapter 0, authored here for the reasons the Seneca entry sets out above.
       Two things a reader meets at once are stated rather than smoothed over: that Confucius did not
       write this book, and that Legge's English is a Victorian missionary's, with a vocabulary that
       has since been argued over word by word. */
    about: [
      "<b>The Analects</b> is a collection of sayings, exchanges and short scenes recording what " +
        "Confucius said and how he behaved, put together by his followers after his death. The " +
        "Chinese title, <i>Lunyu</i>, means something like 'selected sayings', and that is the shape " +
        "of the book: several hundred separate passages, most of them a sentence or two long, with " +
        "no argument running through them and very little to say about who is speaking or when. A " +
        "disciple asks what filial piety is; the Master answers, and the passage ends. The next one " +
        "may be about music, or archery, or a minister of a neighbouring state.",
      "Confucius wrote none of it. He was born in the small state of Lu in 551 BCE and died there in " +
        "479, having spent much of his life trying and failing to find a ruler who would employ him, " +
        "and having taught a body of students who outlived him and taught their own. The book grew " +
        "out of that succession rather than out of a single act of composition, over a period " +
        "scholars still argue about — some of its twenty books look markedly older than others, and " +
        "the received text was not settled until the Han dynasty, four centuries after his death. " +
        "Its authority afterwards is easier to date than its making: chosen in the 12th century as " +
        "one of the Four Books, it stood at the centre of the Chinese civil service examinations " +
        "from 1313 until they were abolished in 1905.",
      "The twenty books are not chapters in any ordinary sense, and their titles here are not " +
        "descriptions. A book of the Analects is named after the words it opens with, so Legge's " +
        "'Hsio R.' is simply the first two characters of the first sentence of book 1. Within a book " +
        "the numbered chapters are the passages themselves, and it is by those numbers — book, then " +
        "chapter — that any line of the Analects is cited in any language. They are printed here on " +
        "both sides of the page, which is what lets the Chinese sit beside the English.",
      "James Legge, who made this translation, was a Scottish missionary who spent three decades in " +
        "Malacca and Hong Kong and became the first Professor of Chinese at Oxford in 1876. His " +
        "Chinese Classics, published from 1861, set the Chinese text, a literal English rendering and " +
        "a commentary far longer than either on the same page, and it is still the edition English " +
        "readers of these books most often meet. What has not aged as well is the vocabulary: Legge's " +
        "'the superior man' for <i>junzi</i>, 'benevolence' or 'perfect virtue' for <i>ren</i>, and " +
        "'the rules of propriety' for <i>li</i> are all his choices among several defensible ones, " +
        "and every translator since has argued with at least one of them. Read them as one man's " +
        "answer to a hard problem rather than as what the Chinese says.",
      "This is Legge's text and the Chinese he printed beside it, and nothing else. His notes, his " +
        "prolegomena and his commentary — which in the printed volume run to several times the length " +
        "of the translation — are not part of the transcription this comes from, so there is no " +
        "apparatus underneath these pages. What you are reading is the whole of " +
        "the work and none of the argument about it.",
    ],

    /* ---------- THE INTERLEAVED LAYOUT, a second parallel shape ----------
       The Art of War entry above describes the first: a printed page transcribed as a two-cell
       table, Chinese in one cell and English in the other. This edition is just as much a parallel
       text and is transcribed quite differently — the two languages ALTERNATE down a single column,
       each chapter's Chinese in a `wst-lang` element and its English in the paragraphs after it, with
       no table anywhere on the page.

       Neither existing extractor can read that. `cleanBody` would unwrap the Chinese containers and
       hand back one text with the two languages interleaved line by line, which is the failure mode
       the Art of War entry calls the silent one — nothing throws, nothing is short, and the book is
       simply unreadable. `extractParallel` looks for `wst-translation-table` and finds none, so it
       throws, which is the better outcome but not a book. Hence a third extractor, which separates
       the columns by their own markup rather than by table cell, and then splits each column on the
       chapter numbers its own language marks.

       They are NOT alternating one for one, which is the trap here: a run of several chapters' Chinese
       often sits in a single element, followed by that run's English. So the two columns are gathered
       whole and paired on the NUMBER, exactly as app.js pairs them at render time, and never on the
       order the markers happen to appear in. Pairing by position looks right on book 1 and drifts. */
    layout: "interleaved",
    page: (n) => "The Chinese Classics/Volume 1/Confucian Analects/" + toRoman(n),
    chapters: Array.from({ length: 20 }, (_, i) => i + 1),
    chapterWord: "Book",
    titleOf: (n) => ANALECTS_TITLES[n - 1] || "Book " + n,

    /* ---------- THE ORIGINAL, AND WHY IT PAIRS ----------
       The rule the Meditations entry sets out is that an original may ship only where its text states
       which section each passage is. This one states it twice over, in both languages, on the same
       page: the Chinese marks every chapter 【第一章】…【四七章】 and the English marks the same
       chapter "Chapter I." …"Chapter XLVII.", and the two were set beside each other by the same
       editor.

       Measured before it was believed, across all twenty books: 499 chapters on the Chinese side and
       499 on the English, each a clean 1–N run in every book, with nothing missing on either side and
       no duplicates. Only the Art of War does better, and it does so by construction.

       ONE repair, and it is recorded rather than smoothed away. In book 2 the English marker for
       chapter 18 is printed "Chapter XVII." — a second time, the previous chapter having just used
       it — while the Chinese beside it reads 【十八章】 and the passage is the one every edition of
       the Analects cites as 2.18. So the English side is numbered by a forward-only sequence: a
       printed numeral is taken where it moves the count forward and replaced by the next number where
       it does not, with a warning naming the book and both numbers. That restores what the printed
       page carries rather than composing anything — but it is a repair, so it is reported on every
       run instead of being quietly correct.

       Like the Art of War's, this original has no `wiki` or `pages` of its own: both columns come off
       the pages already being fetched, and fetchOriginal reads them back out of the same cache. */
    original: {
      lang: "zh",
      langName: "Chinese",
      edition: "The Chinese text as printed in Legge's Chinese Classics, Vol. I, Oxford, 1893",
      rights:
        "Public domain worldwide: the Chinese text is some twenty-four centuries old, and this is a " +
        "transcription of it as printed in Legge's edition of 1893.",
      sourceName: "Wikisource",
      sourceUrl: "https://en.wikisource.org/wiki/The_Chinese_Classics/Volume_1/Confucian_Analects",
    },
  },

  "machiavelli-prince": {
    title: "The Prince",
    // the work's own Italian title, which is what every edition of it in any language is called after
    subtitle: "Il Principe",
    author: "Niccolò Machiavelli",
    translator: "W. K. Marriott",
    edition: "Everyman's Library No. 280, J. M. Dent & Sons, London, 1908",
    written: "1513",

    /* ---------- THE LICENCE, and it is the third that needs no qualification at all ----------
       The Republic's and the Analects' position, and the easiest kind of answer this shelf gets.
       Marriott published in 1908 — before 1929, so the United States copyright has expired — and he
       lived from 1847 to 1927, which puts him out of copyright on life-plus-seventy (1998) and on
       life-plus-ninety-five alike. Nothing to state as the Art of War must for Giles (2029) or the
       Nicomachean Ethics for Ross (2042), and no modern editorial layer as the Histories and the
       Meditations' Greek carry. His dates are not guessed at from the printing: they are stated on
       the scan's own index page at Wikisource and on Wikidata, and the two agree.
       The Italian beside it is five centuries old, and this transcription is of an edition of 1814.

       What is NOT imported from this volume is Marriott's own introduction and the two shorter works
       the Everyman prints after The Prince — they are outside what a reader opening this book came
       for, and the introduction is the one part of the volume that argues with the text rather than
       carrying it.

       The modern translations a reader is likeliest to own — George Bull's Penguin (1961), Harvey
       Mansfield's (1985), Peter Bondanella's Oxford World's Classics (2005) and Tim Parks's Penguin
       (2009) — are all firmly in copyright, and are named here for the reason Campbell, Hays, Griffith
       and Lee are named above: so that nobody reaches for one later. */
    rights:
      "Public domain worldwide. W. K. Marriott published this translation in 1908 — before 1929, so " +
      "its United States copyright has expired — and he lived from 1847 to 1927, so it is out of " +
      "copyright wherever the term runs for the author's life plus seventy years or more. The Italian " +
      "text printed beside it is five centuries old and is in the public domain everywhere. (The " +
      "modern translations by George Bull, 1961, Harvey Mansfield, 1985, Peter Bondanella, 2005, and " +
      "Tim Parks, 2009, are still in copyright and are not used here.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/The_Prince_(Marriott)",

    /* THE FRONT MATTER — chapter 0, authored here for the reasons the Seneca entry sets out above.
       Four things a reader arriving at this book should be told plainly rather than discover late:
       what the book was written for and when, that its author spent his career serving a republic
       and wrote this out of office, that the two columns here are paired chapter by chapter because
       the work carries no finer numbering, and that the dedicatory letter is not here. Nothing in it
       is to be embroidered: where the scholarship is divided — above all on how the book squares with
       the Discourses — it says so rather than picking a side. */
    about: [
      "<b>The Prince</b> is a short book of advice on how to take a state and how to keep one, written " +
        "in 1513 by a Florentine civil servant who had just lost his post. It runs to twenty-six " +
        "chapters, each headed with the question it takes up — how many kinds of principality there " +
        "are, whether a ruler should be feared or loved, how flatterers are to be avoided — and it " +
        "argues throughout from examples rather than from principles, drawing on Roman history and on " +
        "the Italian politics its author had spent fourteen years watching at close range.",
      "Niccolò Machiavelli was born in Florence in 1469 and served the restored republic there from " +
        "1498 to 1512 as second chancellor and as secretary to the magistracy that ran its wars, which " +
        "sent him on embassies to the King of France, the Emperor, the papal court and Cesare Borgia. " +
        "When the Medici returned in 1512 he lost everything: he was dismissed, then arrested and " +
        "tortured on suspicion of conspiracy, and finally released to a small property outside the " +
        "city. He wrote this book there within the year, and dedicated it to Lorenzo de' Medici in the " +
        "hope — which came to nothing — of employment.",
      "It was read in manuscript by his friends and not printed until 1532, five years after his " +
        "death, and its reputation has been an argument ever since. Within a generation the book was " +
        "on the papal Index of Prohibited Books and its author's name had become an English adjective " +
        "for cunning; readers since have found in it everything from a handbook for tyrants to a " +
        "satire on them to the first cold description of politics as it is rather than as it ought to " +
        "be. What makes the question hard is that the same man wrote the <i>Discourses on Livy</i>, a " +
        "long and unmistakably republican work, in the same years and partly in the same room, and no " +
        "reading of the two together commands general agreement.",
      "Two words carry most of the argument and neither survives translation cleanly. <i>Virtù</i> is " +
        "not virtue in the moral sense but something closer to force of character — skill, nerve, the " +
        "capacity to act well at the moment that decides things — and <i>fortuna</i> is the run of " +
        "events that no amount of it can wholly govern. The book's most famous chapters are attempts " +
        "to say how much of a ruler's fate belongs to each, and its last chapter drops the analysis " +
        "altogether to call on the Medici to drive the foreign armies out of Italy.",
      "W. K. Marriott's translation of 1908 was made for Everyman's Library, and he says in his own " +
        "introduction that he aimed at an exact literal rendering rather than a fluent paraphrase — " +
        "which is why it reads plainly and sometimes stiffly, and why it is a good text to read " +
        "against the Italian. The numbered notes folded under a chapter are the edition's own, " +
        "gathered at the back of the printed volume and brought here to the chapters they belong to. " +
        "Most of that apparatus is not here: the printed volume annotates some fifty passages, and only " +
        "a handful of them say in the transcription this text comes from which note belongs to which " +
        "place, so only those few are shown rather than joined up by guesswork.",
      "Two things about this copy. The Prince is cited by chapter and carries no smaller numbered " +
        "divisions, so where a bilingual text is usually set beside itself passage by passage, this " +
        "one pairs the two languages <i>chapter by chapter</i> — each column is the whole " +
        "of its own chapter, beginning together and running at its own length. And Machiavelli's " +
        "dedicatory letter to Lorenzo, which stands before chapter 1 in both editions, is not included " +
        "here: the reader is given the twenty-six chapters of the book itself.",
    ],

    chapterWord: "Chapter",
    /* Transcribed from the contents page this edition prints, which gives the chapters Roman numerals
       and these titles — see PRINCE_TITLES above for the two slips carried across with them. */
    titleOf: (n) => PRINCE_TITLES[n - 1] || "Chapter " + toRoman(n),
    /* No `sections`. Neither this edition nor any other divides a chapter of The Prince into numbered
       sections — the chapter IS the unit the whole tradition cites — so every chapter comes through as
       one block and fetchEnglish will say so ("26 chapter(s) with NONE"). That is the expected result
       for this book rather than a fault to chase, and it is what decides the shape of the pairing; see
       the note on `original` at the foot of this entry. */
    /* The heading this edition prints above each chapter, in the two centred blocks it sets it in: the
       number spelled out as a word ("EIGHTEENTH CHAPTER") and the chapter's title in capitals beneath
       it. Folio prints its own number and title above the text, so left in place every chapter opens
       on its own name said twice, the first time as a quotation. The number pattern is anchored to the
       word CHAPTER so nothing else can match it; the title pattern takes an all-capitals line, which
       is a safe shape to name here because dropHeads only ever strips blocks from the START of a
       chapter and no chapter of this book opens in capitals. */
    dropHeads: [/^[A-Z]+(?:-[A-Z]+)?\s+CHAPTER$/i, /^[-A-Z\s,.'?!;:—–]+$/],
    page: (n) => "The Prince (Marriott)/Chapter " + n,
    chapters: Array.from({ length: 26 }, (_, i) => i + 1),

    /* ---------- THE NOTES ARE AT THE BACK OF THE BOOK, AND THAT IS A NEW SHAPE ----------
       (Aug 2026, adding this book — the first here whose apparatus is ENDNOTES rather than footnotes.)

       Every earlier book prints its notes at the foot of the page they belong to, so MediaWiki's own
       reference list carries the text and `notesOf` reads it straight off the chapter. This edition
       gathers them at the back of the volume instead, keyed by the page they annotate, and the markers
       in the text point AT that page: what stands in the chapter's own reference list is the words
       "See Note." and nothing else, twenty-nine times over.

       Left alone that is the quiet kind of failure this file keeps meeting. Nothing throws, the marker
       count is right, every marker resolves, `wireFootnotes` numbers them all — and the reader opens a
       fold to find a list of identical stubs pointing at a page they cannot reach. So the endnote page
       is fetched once and each stub is replaced by the note it stands for, joined on the anchor the
       marker itself carries (`cite_note-n16-1` → the endnote anchored `n16`), which is the same rule
       the footnote markers already follow: a marker carries the note it POINTS AT, never its position
       in a queue.

       MEASURED, BECAUSE THE APPARATUS TURNS OUT TO BE ONLY PARTLY WIRED: the printed volume gathers
       fifty-five notes at the back, the transcription marks fifteen places in the text, and five of
       those fifteen name the note they mean. The other ten are dropped rather than guessed at — see
       resolveEndnotes for the page-number join that was tried and measured and does not work — so what
       ships is five notes, on chapters 3 and 6, and the front matter tells the reader where the rest
       of the apparatus is. */
    endnotes: { page: "The Prince (Marriott)/Notes" },

    /* ---------- THE ORIGINAL LANGUAGE, AND WHY IT PAIRS ON THE CHAPTER ----------
       The rule the Meditations' entry sets out is that app.js pairs the two columns on the numbers the
       texts state about themselves, never on paragraph order, so an original may ship only where both
       sides say which section each passage is. The Prince passes that test at ONE level and no finer:
       both editions are divided into the same twenty-six numbered chapters, in the same order, and
       neither divides a chapter into anything smaller. That is not a gap in these two printings — it
       is how the work is cited everywhere, "Prince XVIII" and no more.

       So each chapter is a single unnumbered block on both sides, and bookRows pairs the two into one
       row: the whole English chapter beside the whole Italian one, beginning together and each running
       at its own length. It is a coarser join than the Art of War's facing page or Herodotus's
       chapters, and it is a true one — nothing is claimed about where in the Italian a given English
       sentence falls, because nothing is asserted below the chapter. The reader is told as much in the
       front matter above rather than left to infer it from a long row.

       THE REPUBLIC'S ANSWER WAS NO AND THIS IS NOT THAT CASE, which is worth stating because the two
       look alike from a distance. Plato has the best-standardised citation system of any ancient
       author and this printing of Jowett simply does not carry it, so a reader who knows Plato goes
       looking for the Stephanus numbers and finds them missing. Machiavelli has no such system to be
       missing: the chapter is the whole of it, and the chapter is here.

       The Italian is on its own wiki, one page per chapter — a shape no earlier original has used.
       Seneca's Latin gives one page per BOOK of the collection with the letters as headings inside it,
       and the two facing-page books take both columns off the translation's own page; this is the
       simple case those two are complications of, and it gets `perChapter` and a `page` of its own. */
    original: {
      lang: "it",
      langName: "Italian",
      perChapter: true,
      wiki: "it.wikisource.org",
      page: (n) => "Il Principe/Capitolo " + toRoman(n),
      edition: "Il Principe, Italy, 1814, as transcribed at Italian Wikisource",
      rights:
        "Public domain worldwide: Machiavelli died in 1527 and wrote this in 1513, so no copyright " +
        "has subsisted in the words for as long as copyright has existed. The transcription is of a " +
        "printing of 1814, itself long out of copyright.",
      sourceName: "Wikisource (Italian)",
      sourceUrl: "https://it.wikisource.org/wiki/Il_Principe",
      /* The printed page heads each chapter with "CAPITOLO XVIII." and then its title in italics on a
         line of its own. Folio prints its own chapter number and title above the text, so both would
         stand there twice; they are dropped, and the title is echoed in the run's log line so that a
         run says which title it took off each chapter rather than removing it in silence. */
      dropHead: /\bCAPITOLO\s+[IVXLCDM]+\./i,
    },
  },

  "caesar-gallic-war": {
    title: "The Gallic War",
    // the work's own Latin title, as Lucretius, the Oedipus Rex, Herodotus and The Prince give theirs
    subtitle: "Commentarii de Bello Gallico",
    author: "Julius Caesar",
    translator: "W. A. McDevitte and W. S. Bohn",
    edition: "Caesar's Commentaries, translated by W. A. McDevitte and W. S. Bohn, Harper's New Classical Library, Harper and Brothers, New York, 1870–1872",
    written: "c. 58–50 BCE",

    /* ---------- THE LICENCE, and it is the first here to rest on the PUBLICATION alone ----------
       The certain half is the easiest kind and covers everything: this translation was published by
       Harper and Brothers in 1870–1872 and the Latin beside it is T. Rice Holmes's Oxford text of
       1914, both long before 1929, so the United States copyright in both has expired. Holmes's dates
       are stated and were CHECKED rather than recalled, for the Hugo Magnus reason — 24 May 1855 to
       4 August 1933, agreed by the Dictionary of Irish Biography, the Online Books Page and Wikipedia
       — which also clears him on life-plus-seventy (2003) and life-plus-ninety.

       WHAT CANNOT BE STATED IS THE OTHER TRANSLATOR'S DEATH, and this entry says so rather than
       rounding it up. W. A. McDevitte is William Alexander McDevitte, 1834–1909, given by the Library
       of Congress name authority and by Wikisource, whose author page carries the died-at-least-a-
       hundred-years-ago tag; life-plus-seventy ran out for him in 1980. His co-translator is a byline
       and nothing else. "W. S. Bohn" has no first name, no dates and no biography in anything openable
       — the name is probably connected with Henry Bohn's Classical Library, whose series this
       translation first appeared in, but that is an inference and is not used to hold anything up. A
       joint work's life-plus-seventy term runs from the last surviving author, so with one of the two
       unknown that term cannot honestly be asserted for the whole translation, and it is not.

       That is the Lucretius judgement in a second book: there the Latin's editor was unnamed by the
       source and no editor and no date were claimed for it, and the ground stated was the age of the
       poem, which anyone can check. Here the ground stated is the date of PUBLICATION, which anyone
       can check on the title page, and the gap is named on the book's own front matter rather than
       papered over — a reader in a life-plus-seventy country is told exactly what is known and what
       is not, which is better than a confident sentence resting on a man nobody can find.

       The modern translations a reader is likeliest to own — S. A. Handford's Penguin (1951, revised
       by Jane Gardner 1982), Carolyn Hammond's Oxford World's Classics (1996) and James O'Donnell's
       (2019) — are all firmly in copyright, and are named here for the reason Campbell, Hays,
       Griffith, Lee, Humphries, Melville, Bull and de Sélincourt are named above: so that nobody
       reaches for one later. */
    rights:
      "Public domain in the United States on the publication rule, with one gap stated plainly. This " +
      "translation was published by Harper and Brothers in 1870–1872 and the Latin printed beside it " +
      "is T. Rice Holmes's Oxford text of 1914 — both well before 1929 — so the copyright in both has " +
      "expired. Caesar wrote the work in Latin some twenty centuries ago. Of the two translators, " +
      "William Alexander McDevitte lived from 1834 to 1909 and T. Rice Holmes from 1855 to 1933, so " +
      "both are also out of copyright wherever the term is the author's life plus seventy years; " +
      "nothing is recorded of the co-translator W. S. Bohn beyond the name on the title page, so for " +
      "that half of the English no life-plus-seventy date can honestly be given, and the ground " +
      "relied on here is the date of publication. The digital editions of both texts are prepared by " +
      "the Perseus Digital Library at Tufts University and are released under a Creative Commons " +
      "Attribution-ShareAlike 4.0 International licence, which both files state in their own headers. " +
      "(The modern translations by S. A. Handford, 1951, Carolyn Hammond, 1996, and James O'Donnell, " +
      "2019, are still in copyright and are not used here.)",
    sourceName: "Perseus Digital Library",
    sourceUrl: "https://scaife.perseus.org/library/urn:cts:latinLit:phi0448.phi001/",

    /* THE FRONT MATTER — chapter 0. Six things a reader should be told before they start rather than
       work out late: what the book is and that it is a dispatch rather than a history, that the man
       writing it is the man who won and what that does to the prose, that the third-person voice is a
       deliberate device, that the last of the eight books is not by Caesar at all, who he was, and
       what the two columns and the small figures running through them are. Nothing here is
       embroidered: where the scholarship is divided — on how far the book is propaganda, and on the
       casualty figures — it says so rather than picking a side. */
    about: [
      "<b>The Gallic War</b> is Julius Caesar's own account of the nine campaigning seasons, from 58 " +
        "to 50 BCE, in which he conquered the whole of Gaul — roughly modern France and Belgium with " +
        "parts of Switzerland, Germany and the Netherlands — and twice crossed into Britain. It is not " +
        "a history written at leisure afterwards. Each of the first seven books covers a single year " +
        "and seems to have been sent to Rome at or near the end of it, which makes the work something " +
        "closer to a dispatch: a serving general telling the city that pays and votes for him what he " +
        "has been doing with its legions. That is why it moves as it does, and it is also the first " +
        "thing to hold onto about it.",
      "The prose is famously plain, and the plainness is the achievement. Caesar writes short " +
        "declarative sentences, a small vocabulary and almost no rhetorical ornament, at a time when " +
        "Latin oratory was as ornate as it has ever been; Cicero, who was no friend of his politics, " +
        "said the commentaries were stripped bare of ornament like an athlete and that sensible men " +
        "were deterred from touching the subject again. It is the reason the book has been the first " +
        "real Latin put in front of schoolchildren for five centuries. It is also, as every reader " +
        "since antiquity has noticed, an extremely effective way of seeming to have no case to make.",
      "For he plainly does have one. Caesar was fighting on a legal footing that his enemies in Rome " +
        "disputed, and he needed the war to look both necessary and finished; the book explains every " +
        "campaign as a response to somebody else's aggression, and it is at its least believable at " +
        "exactly those moments. Scholars divide on how far to call it propaganda — some read it as a " +
        "sustained justification, others as a broadly accurate record whose slant is in what it leaves " +
        "out rather than in what it says — and no reading commands general agreement. The casualty " +
        "figures are the sharpest case: the numbers given for the enemy dead and enslaved are enormous, " +
        "they cannot be checked against anything, and few historians now take them at face value. " +
        "Modern readers should also be told plainly that what is described in places is the destruction " +
        "of whole peoples, reported by the man who ordered it and in the same even tone as a march.",
      "One device is worth knowing before the first page. Caesar never says \"I\": he refers to " +
        "himself throughout in the third person, as \"Caesar\", so the man giving the orders arrives on " +
        "the page as a figure being described by somebody else. The effect is of a plain report rather " +
        "than a memoir, which is exactly the effect intended. A second thing is not a device at all: " +
        "the eighth and last book is not by Caesar. He left the work unfinished, and it was completed " +
        "after his death by Aulus Hirtius, one of his officers, who says so himself in the covering " +
        "letter to Balbus that opens the book — it stands here as its own numbered chapter at the head " +
        "of book 8. Hirtius went on to be consul in 43 BCE and was killed in battle that year. His " +
        "Latin is a careful imitation and not quite the same thing, and the difference is audible.",
      "Gaius Julius Caesar was born in 100 BCE into an old but unremarkable patrician family, and was " +
        "past forty and deep in debt when he took the Gallic command in 58. The war made him: it gave " +
        "him nine years of victories, a fortune in plunder and an army loyal to him personally, and " +
        "when the senate ordered him to give up that army in 49 he crossed the Rubicon instead. He won " +
        "the civil war that followed, was made dictator, and was murdered in the senate house in March " +
        "44 BCE by a conspiracy of senators. The Gallic War is therefore the record of the campaigns " +
        "that put an end to the Roman republic, written by their commander while they were happening " +
        "and before anyone, himself included, knew what they would lead to.",
      "The translation here is W. A. McDevitte and W. S. Bohn's, published by Harper and Brothers, and " +
        "the Latin beside it is T. Rice Holmes's Oxford text of 1914 — Holmes being the scholar who " +
        "spent much of his life on this campaign and wrote the standard narrative of it. The small " +
        "raised figures running through both columns are CHAPTER numbers, and they are how any passage " +
        "of Caesar is cited in any language: \"Caesar, Gallic War 1.29\" means book 1, chapter 29. " +
        "Measured over the whole work, the two editions agree exactly — 404 chapters on each side, the " +
        "same numbers in the same order in all eight books, with nothing missing on either side and no " +
        "duplicates, which is an exact pairing of two texts edited independently a generation apart. " +
        "Editions divide a chapter into finer numbered sections as well; those are not used for " +
        "pairing, and this English does not print them at all. This edition carries almost no notes: " +
        "one, on a disputed numeral.",
    ],

    /* ---------- PROSE IN BOOKS OF NUMBERED CHAPTERS: the sixth layout, second outing ----------
       Herodotus's shape exactly, and the reason it needed no new reader — see the block above
       teiBookChapters. A Folio chapter is one of the eight books, the pairing runs on the CHAPTER
       numbers inside it, and the Latin's finer `section` divisions are concatenated into the chapter
       the way Leopold's are into a chapter of the Meditations.

       MEASURED over both editions before any of it was believed, and this is the cleanest result the
       shelf has had from two independently-edited texts: 8 books on each side; 404 chapters on each
       side, with identical numbers in identical order in every one of the eight books; no duplicates
       and no gaps; and not one chapter number carrying a letter, so none of the Nicomachean Ethics'
       or Herodotus's `data-n` sort-key trouble arises here. The two columns simply agree.

       The asymmetry is in the SUBDIVISION rather than the numbering. Holmes's Latin divides its 404
       chapters into 2,150 numbered sections; this English divides them into none at all, printing one
       paragraph per chapter. That costs nothing, because the chapter is the pairing unit on both
       sides and the Latin's sections are concatenated into it — but it is why the Latin column reads
       as several paragraphs against the English column's one, which is a fact about the two editions
       and not a rendering fault.

       BOOK 8 OPENS ON A CHAPTER 0 in both editions, and it is not an off-by-one: it is Hirtius's
       covering letter to Balbus, which every edition prints before chapter 1 and numbers apart from
       the war it introduces. Both columns carry it and it pairs like any other chapter.

       THREE ELEMENTS THIS EDITION CARRIES that Herodotus's did not, all checked before the run:
       · the Latin's eight `<head>`s ("COMMENTARIUS PRIMUS" and so on) sit between the book division
         and its first chapter, and teiBookChapters slices from the first chapter, so they fall
         outside every slice and need no `dropHeads`. That is worth stating because it is luck of the
         markup rather than design, and a future edition that puts its head INSIDE chapter 1 would
         need the rule the Meditations has.
       · the Latin's two `<sic>` elements stand BARE — there is no `<choice>` and no `<corr>` anywhere
         in either file — so the generic sweep unwraps them and keeps the reading the edition prints,
         which is right: a bare `<sic>` is the editor saying the manuscript says this odd thing, not
         offering a correction to prefer instead.
       · the English's one `<list>` is Caesar's census of the Helvetii at 1.29, and it needed a rule
         in teiInline, where it is described at length. Left alone it flattened into the sentence
         after it.
       Perseus's name-authority `<reg>`, which put a modern Turkish gazetteer entry inside the first
       sentence of the Histories, does NOT occur here: this file's revision log records it converted
       to an attribute in 2016, and a count over both files confirms zero. */
    source: "tei",
    url: "https://raw.githubusercontent.com/PerseusDL/canonical-latinLit/master/data/phi0448/phi001/phi0448.phi001.perseus-eng2.xml",
    layout: "chaptered",
    chapterWord: "Book",
    // eight is the whole work, the last of them Hirtius's; checked against the file on every run
    chapters: Array.from({ length: 8 }, (_, i) => i + 1),
    /* No `titleOf`. The Latin heads its eight books COMMENTARIUS PRIMUS to OCTAVUS, which is "book
       one" to "book eight" and no more of a title than the Meditations' "BOOK I"; the English heads
       them with nothing at all. So they are Book 1 to Book 8, and composing "The Helvetian Campaign"
       for book 1 would be an apparatus this work does not have. Said in the front matter instead. */

    original: {
      lang: "la",
      langName: "Latin",
      source: "tei",
      layout: "chaptered",
      edition: "C. Iuli Caesaris Commentarii Rerum in Gallia Gestarum VII, A. Hirti Commentarius VIII, edited by T. Rice Holmes, Scriptorum Classicorum Bibliotheca Oxoniensis, Clarendon Press, Oxford, 1914",
      rights:
        "Public domain on both grounds. Caesar wrote the work in Latin in the 50s BCE, so the words " +
        "themselves have been out of copyright for as long as copyright has existed. The text printed " +
        "here is the Oxford Classical Text edited by T. Rice Holmes and published in 1914 — before " +
        "1929, so its United States copyright has expired — and Holmes lived from 1855 to 1933, so it " +
        "is also public domain wherever the term is the editor's life plus seventy years or more. The " +
        "digital edition is prepared by the Perseus Digital Library at Tufts University and is " +
        "released under a Creative Commons Attribution-ShareAlike 4.0 International licence.",
      sourceName: "Perseus Digital Library",
      sourceUrl: "https://scaife.perseus.org/library/urn:cts:latinLit:phi0448.phi001/",
      url: "https://raw.githubusercontent.com/PerseusDL/canonical-latinLit/master/data/phi0448/phi001/phi0448.phi001.perseus-lat2.xml",
    },
  },

  "thucydides-peloponnesian-war": {
    title: "The History of the Peloponnesian War",
    /* NOT the work's own Greek title, which is the one thing it cannot be. Thucydides' history and
       Herodotus's are both Ἱστορίαι, and Herodotus is already on this shelf under that subtitle — two
       books labelled identically in Greek is precisely the confusion a subtitle exists to prevent. So
       this one is descriptive, which is well precedented here (Seneca's "Moral Letters to Lucilius",
       Sun Tzu's "The Oldest Military Treatise in the World", the Republic's "An Ideal Commonwealth"). */
    subtitle: "The War between Athens and Sparta",
    author: "Thucydides",
    translator: "Richard Crawley",
    edition: "The History of the Peloponnesian War, translated by Richard Crawley, London, 1874",
    written: "c. 431–400 BCE",

    /* ---------- THE LICENCE, and it is the easiest kind: nothing here needs qualifying ----------
       Three layers and all three are long expired. Thucydides wrote in Greek in the fifth century BCE.
       Richard Crawley's translation was published in 1874 and he lived from 1840 to 1893 — dates
       looked up rather than recalled, for the Hugo Magnus reason — so it is public domain on the
       pre-1929 publication rule, on life-plus-seventy, and on life-plus-a-hundred alike. The Greek
       beside it is Henry Stuart Jones's Oxford Classical Text, whose own Perseus header gives it as
       published in 1910 and reprinted in 1942; Stuart Jones lived from 1867 to 1939, so it clears
       both rules too. This is the Republic's and the Analects' position — a licence with no limit to
       state, unlike Giles's (in copyright in life-plus-seventy countries until 2029) and Ross's
       (until 2042).

       ONE THING IS WORTH SAYING PRECISELY, because the reprint date is the sort of figure that looks
       like a problem: the 1942 Oxford text is the same Stuart Jones edition with an apparatus by
       J. E. Powell added, and it is the TEXT that is imported here, not the apparatus. The file
       states the 1910 publication itself, which is the ground relied on.

       The modern translations a reader is likeliest to own — Rex Warner's Penguin (1954), Steven
       Lattimore's (1998) and Jeremy Mynott's Cambridge (2013), along with the Landmark Thucydides
       (1996), which prints a revised Crawley with modern maps and notes that are themselves in
       copyright — are all firmly in copyright and are named here for the reason Campbell, Hays,
       Griffith, Lee, Humphries, de Sélincourt and Handford are named above: so that nobody reaches
       for one later. What is imported is Crawley's own 1874 text, not the Landmark's revision of it. */
    rights:
      "Public domain on every ground, with nothing left to qualify. Thucydides wrote the work in " +
      "Greek in the fifth century BCE. Richard Crawley's translation was published in 1874 and he " +
      "lived from 1840 to 1893, so it is out of copyright under the pre-1929 publication rule, " +
      "wherever the term is the translator's life plus seventy years, and wherever it is life plus a " +
      "hundred. The Greek printed beside it is the Oxford Classical Text edited by Henry Stuart " +
      "Jones, published in 1910 and reprinted with an apparatus by J. E. Powell in 1942; the text " +
      "imported here is Stuart Jones's, not Powell's apparatus, and Stuart Jones lived from 1867 to " +
      "1939, so it too is public domain on both rules. The digital edition of the Greek is prepared " +
      "by the Perseus Digital Library at Tufts University and is released under a Creative Commons " +
      "Attribution-ShareAlike 4.0 International licence. (The modern translations by Rex Warner, " +
      "1954, Steven Lattimore, 1998, and Jeremy Mynott, 2013, are still in copyright and are not " +
      "used here, and neither is the revised Crawley printed in the Landmark Thucydides of 1996.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/History_of_the_Peloponnesian_War",

    /* THE FRONT MATTER — chapter 0. What a reader should be told before they start: what the war was
       and how the book ends, who wrote it and why his exile matters, what he does with the speeches
       (the single thing most likely to mislead a reader who takes them as transcripts), what is
       famous in it, and what the two columns and the small figures are. Where the scholarship is
       divided — on the speeches and on how the book was composed — it says so rather than picking a
       side, as the Gallic War's does on the propaganda question. */
    about: [
      "<b>The History of the Peloponnesian War</b> is Thucydides' account of the war fought between " +
        "Athens and Sparta, and the alliances each of them led, from 431 BCE until his narrative " +
        "stops. The war itself ran to 404 and ended in the defeat of Athens; the book does not get " +
        "there. It breaks off in the middle of a sentence in the year 411, unfinished, and no one " +
        "knows why — the likeliest explanation is simply that its author died. A reader should know " +
        "that before starting, because the ending is not an ending and arrives without warning.",
      "Thucydides was an Athenian, born around 460 BCE into a wealthy family with property in Thrace. " +
        "He caught the plague that devastated Athens in 430 and survived it, and he describes the " +
        "symptoms with a precision that has kept doctors arguing about which disease it was ever " +
        "since. In 424 he was elected general and given a command in the north; he failed to reach " +
        "Amphipolis in time to stop the Spartan Brasidas taking it, and was exiled for twenty years. " +
        "He says himself that the exile was useful to him, because it let him spend time on the " +
        "Peloponnesian side and watch the war from both. It is one of the few times he mentions " +
        "himself at all.",
      "The method is the reason the book is still read, and Thucydides sets it out at the start. He " +
        "will not put in the legendary and the marvellous, though he knows it makes for a better " +
        "listen; what he wants is an accurate record of what happened, and he says plainly that it " +
        "will be less of a pleasure to hear for it. He checked accounts against each other and found " +
        "that eyewitnesses of the same event told it differently. He looked for causes underneath " +
        "the stated ones — his own account of why the war began is that Sparta went to war because " +
        "Athens had grown powerful and Sparta was afraid, which is not what either side said at the " +
        "time. That habit of looking past the official reason for the real one is what later readers " +
        "took from him.",
      "The speeches are where a modern reader is most likely to go wrong. Roughly a quarter of the " +
        "book is people making speeches — Pericles over the Athenian dead, the Athenian and Melian " +
        "envoys arguing about whether justice means anything between unequal powers, generals before " +
        "battles — and they are not transcripts. Thucydides says so: it was difficult to remember the " +
        "exact words, so he has given what was called for on each occasion, keeping as close as he " +
        "could to the general sense of what was really said. How much is the speaker and how much is " +
        "Thucydides has been argued over for centuries and is not settled. A related question, the " +
        "composition question, is likewise open: the eighth book contains no speeches at all and " +
        "reads as though it was never revised, and scholars disagree about which parts were written " +
        "when. Read the speeches as the best surviving argument about what was at stake, made by a " +
        "writer who was present for some of it — not as a record of words anyone actually said.",
      "What people remember from it: the funeral oration, in which Pericles tells the Athenians what " +
        "their city is for; the plague arriving the next summer and the description of what it did to " +
        "the city's morals as well as its bodies; the debate over what to do with the people of " +
        "Mytilene, and the second ship sent to overtake the first; the Melian dialogue, where the " +
        "Athenians tell a small neutral island that the strong do what they can and the weak suffer " +
        "what they must, and then kill or enslave the population; and the expedition to Sicily in " +
        "books six and seven, which is the finest sustained narrative in the work and ends in the " +
        "destruction of an Athenian army and fleet. The book has been claimed since as the founding " +
        "text of realist thinking about power, and is quoted freely in modern political argument; " +
        "that reception is worth knowing about and is not the same thing as what the book says.",
      "The translation here is Richard Crawley's, published in 1874 and still the version most " +
        "English readers meet, and the Greek beside it is Henry Stuart Jones's Oxford text of 1910. " +
        "The small raised figures running through both columns are CHAPTER numbers, and they are how " +
        "any passage of Thucydides is cited in any language: \"Thucydides 2.34\" means book 2, " +
        "chapter 34. Measured over the whole work before it was believed, the two editions agree " +
        "almost exactly — 917 chapters in the Greek, running 1 to N in each of the eight books with " +
        "no gaps, no duplicates and not one number carrying a letter, and 916 of them present in the " +
        "English. The single exception is chapter 61 of book 8, where this transcription of Crawley " +
        "simply omits the number: the prose is all there, folded into the chapter before it, so the " +
        "Greek's 61 draws beside an empty cell rather than being quietly renumbered. Editions divide " +
        "a chapter into finer numbered sections as well; those are not used for pairing here. This " +
        "edition carries almost no notes — four in the whole history — so the chapters render with " +
        "no note fold.",
    ],

    /* ---------- A PLAIN WIKI TRANSCRIPTION IN BOOKS OF NUMBERED CHAPTERS ----------
       Herodotus's and the Gallic War's shape — a work divided into BOOKS of numbered CHAPTERS, one
       Folio chapter to a book — but reached down the wiki path rather than the TEI one, and it is the
       first book here to combine the two: a Wikisource English against a Perseus TEI original.

       WHY CRAWLEY AND NOT THE PERSEUS ENGLISH, which would have been less work and is the obvious
       move. Perseus's English for Thucydides is Thomas Hobbes's translation of 1629, in the same
       TEI/CTS encoding as the Greek — so it would have paired 917 against 917 by construction, out
       of one source, needing no new code at all. It was measured and rejected on the reader's behalf:
       Hobbes's English is seventeenth-century English, and the Library is a reading room. Crawley's
       1874 version is the one most English readers actually meet, and the cost of taking it is one
       missing chapter number in 917 (see the front matter) plus the three small rules below. That is
       the Nicomachean Ethics' trade made in the other direction and for the same kind of reason: the
       cleanest text to import is not always the one worth reading.

       THREE THINGS THIS PAGE NEEDS THAT NO EARLIER WIKI BOOK DID, each described where it is
       implemented in cleanBody:
       · `body: "plain"` — this is not a proofread transcription of a scan, so there is no
         .prp-pages-output wrapper and the old slice threw "no body" outright.
       · `dropHeadings: true` — Crawley's summary headings fall BETWEEN numbered chapters, and
         bookSections attaches an unmarked block to the section already open, so each one would print
         at the foot of the chapter before it.
       · `sections: "bookchapter"` — the chapter marks are wst-verse spans whose id is the full
         citation, "2:34". None of the four older marker rules can read them.

       MEASURED over both editions before any of it was believed: 8 books on each side; the Greek's
       917 chapters run 1..N in every book with no gaps, no duplicates and no lettered numbers, so
       none of Herodotus's or the Ethics' data-n trouble arises; the English carries 916 of them, in
       order, with the single omission at 8.61 recorded rather than repaired. Notes: four reference
       marks in the whole work. */
    source: "wiki",
    body: "plain",
    dropHeadings: true,
    sections: "bookchapter",
    chapterWord: "Book",
    page: (n) => "History of the Peloponnesian War/Book " + n,
    chapters: Array.from({ length: 8 }, (_, i) => i + 1),
    /* No `indexPage` and so no titleOf: the contents page lists the eight books as "Book 1" to
       "Book 8" and gives them no names, exactly as the Meditations' and the Gallic War's do.
       Composing "The Sicilian Expedition" for book 6 would be an apparatus this edition does not
       have — the front matter says what is in them instead. */

    original: {
      lang: "grc",
      langName: "Ancient Greek",
      source: "tei",
      layout: "chaptered",
      edition: "Historiae, edited by Henry Stuart Jones, Oxford Classical Texts, Clarendon Press, Oxford, 1910",
      rights:
        "Public domain on both grounds. Thucydides wrote in Greek in the fifth century BCE, so the " +
        "words themselves have been out of copyright for as long as copyright has existed. The text " +
        "printed here is the Oxford Classical Text edited by Henry Stuart Jones and published in " +
        "1910 — before 1929, so its United States copyright has expired — and Stuart Jones lived " +
        "from 1867 to 1939, so it is also public domain wherever the term is the editor's life plus " +
        "seventy years or more. The 1942 reprint of this text added an apparatus criticus by J. E. " +
        "Powell; that apparatus is not part of what is imported here. The digital edition is " +
        "prepared by the Perseus Digital Library at Tufts University and is released under a " +
        "Creative Commons Attribution-ShareAlike 4.0 International licence.",
      sourceName: "Perseus Digital Library",
      sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0003.tlg001/",
      url: "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0003/tlg001/tlg0003.tlg001.perseus-grc2.xml",
    },
  },
  "aesop-fables": {
    title: "Aesop's Fables",
    /* The edition's own title page, which claims three hundred and prints three hundred and
       thirteen. Kept as the subtitle because it is what the book calls itself and what its spine
       says; the count is corrected in the front matter rather than in the title, where correcting
       it would mean retitling somebody else's book. */
    subtitle: "Three Hundred Æsop's Fables",
    author: "Aesop",
    translator: "George Fyler Townsend",
    edition: "Three Hundred Æsop's Fables, translated by George Fyler Townsend, George Routledge and Sons, London, 1867",
    written: "c. 6th century BCE, collected later",
    /* Negative, and vaguer than any other sort key on the shelf, because the thing being dated is
       not a book. Aesop is placed in the sixth century BCE by the ancient tradition; the collection
       that carries his name was assembled and reassembled for the next two thousand years. -550
       files him where the tradition puts the man, which is the only date the shelf can honestly
       sort on. */
    year: -550,

    /* ---------- THE LICENCE, and it is the easiest class on the shelf ----------
       The fourth book here needing no qualification of any kind, after the Republic, the Analects
       and the Peloponnesian War. Both layers are long gone: the Greek is some twenty-five centuries
       old, and Townsend published in 1867 and lived from 1814 to 1900 — dates looked up on Wikidata
       rather than recalled, for the Hugo Magnus reason — so the translation clears the pre-1929
       publication rule, life-plus-seventy (expired 1970) and life-plus-a-hundred (expired 2000)
       alike. There is no limit to state as Giles's entry (in copyright in life-plus-seventy
       countries until 2029) and Ross's (until 2042) have to, and no modern editorial layer as the
       Histories and the Meditations' Greek carry: this is a scan of the printed book and nothing
       has been added to it.

       ONE FIGURE LOOKS LIKE A DISAGREEMENT AND IS NOT. The Wikisource header dates the translation
       1867 and the scan's own index page gives the printing as 1887. Routledge reprinted Townsend
       for decades and both are true of different objects — the translation's date and this copy's.
       The date relied on is 1867 and the reprint is not asserted as anything else; either is
       comfortably pre-1929 and the translator's death settles it in any case.

       The modern translations a reader is likeliest to own — S. A. Handford's Penguin (1954), the
       Temples' Penguin (1998) and Laura Gibbs's Oxford World's Classics (2002) — are all firmly in
       copyright and are named here for the reason Campbell, Hays, Griffith, Lee, Humphries, de
       Sélincourt, Handford and Warner are named above: so that nobody reaches for one later. */
    rights:
      "Public domain on every ground, with nothing left to qualify. The fables themselves are Greek " +
      "and some twenty-five centuries old, so the words behind this book have been out of copyright " +
      "for as long as copyright has existed. George Fyler Townsend's translation was published in " +
      "1867 by George Routledge and Sons, and Townsend lived from 1814 to 1900 — so it is out of " +
      "copyright under the pre-1929 publication rule, wherever the term is the translator's life " +
      "plus seventy years, and wherever it is life plus a hundred. The scan this text is taken from " +
      "is a Routledge reprint its own index page dates to 1887; the translation is the 1867 one " +
      "either way. (The modern translations by S. A. Handford, 1954, Olivia and Robert Temple, 1998, " +
      "and Laura Gibbs, 2002, are still in copyright and are not used here.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/Three_Hundred_%C3%86sop%27s_Fables",

    /* ---------- THE FRONT MATTER — chapter 0 ----------
       What a reader should be told before they start, and here that is more than usual, because the
       thing they have opened is not what its cover implies. It is not a book by an author; it is a
       corpus, and the single most useful thing the front matter can do is say so. Then: who Aesop
       was and how little of that is known, how the fables actually came down, what the morals are
       and why they should be read with some suspicion, and finally what THIS edition is — the count
       it gets wrong, the numbers it does not have, and why there is no Greek column. */
    about: [
      "<b>Aesop's Fables</b> is not a book somebody wrote. It is a collection — a few hundred very " +
        "short stories, most of them about animals who talk, that were told in Greek for centuries " +
        "before anyone gathered them up, and that have been gathered up differently by every editor " +
        "since. No two collections contain quite the same fables in quite the same order, and none " +
        "of them goes back to a manuscript by Aesop, because there was never one to go back to. " +
        "What a reader is holding is one Victorian translator's arrangement of that corpus, which " +
        "is the only kind of Aesop there is.",
      "About Aesop himself almost nothing can be said with confidence. The ancient tradition makes " +
        "him a slave in the sixth century BCE, ugly and clever, and has him killed by the people of " +
        "Delphi. The earliest surviving mention is in Herodotus: at 2.134 " +
        "he calls Aesop a story-writer and a fellow-slave of the courtesan Rhodopis under a Samian " +
        "master named Iadmon, and reports that the Delphians later paid compensation for killing " +
        "him. That is roughly a century after Aesop is supposed to have lived, and it is the best " +
        "evidence there is. A long comic <i>Life of Aesop</i> circulated in later antiquity and is " +
        "plainly a folk tale rather than a biography. Scholars differ on whether there was a real " +
        "man at the bottom of it or whether \"Aesop\" was simply the name Greeks attached to any " +
        "fable, much as jokes attach themselves to whoever is famous; the question is open and this " +
        "edition's own preface, written in 1867, takes a more confident view of it than the evidence " +
        "now supports.",
      "How the fables came down is worth knowing, because it explains why the collection has the " +
        "shape it does. They began as things people said — a fable is an argument in disguise, and " +
        "the ancient ones are quoted in court speeches and political rows rather than read for " +
        "pleasure. Around 300 BCE Demetrius of Phalerum made a collection in Athens, which is lost. " +
        "In the first century CE Phaedrus put fables into Latin verse and in the second Babrius put " +
        "them into Greek verse, and both added and invented freely. Prose collections went on being " +
        "copied and rearranged through the Byzantine centuries, one of them associated with the " +
        "scholar Maximus Planudes around 1300. Caxton printed an English Aesop in 1484, La Fontaine " +
        "turned the material into French verse in the seventeenth century, and translators have been " +
        "reshuffling it ever since. Modern scholarship refers to a fable by its number in the index " +
        "Ben Edwin Perry published in 1952, which is the first thing resembling a stable catalogue " +
        "the corpus has ever had — and which came eighty-five years too late for this edition.",
      "The morals deserve a word of warning. Most fables here end with a sentence telling you what " +
        "they mean, and those sentences are not part of the story in the way the story is. Some are " +
        "ancient, some were added by later editors, some are the translator's, and a good many fit " +
        "the tale they are attached to only loosely — the moral of the fox and the grapes has been " +
        "stated four different ways in four different centuries. They are also flatter than the " +
        "fables. A fable works by leaving the reader to do the last step, and an appended moral does " +
        "that step for them. Read them as part of the tradition rather than as the point of it, and " +
        "notice how often the story is cannier than the lesson bolted to its end.",
      "What people remember from it: the tortoise beating the hare, the fox deciding the grapes were " +
        "sour, the boy who cried wolf, the ant and the grasshopper, the lion spared by a mouse and " +
        "repaid, the dog that lost its dinner to its own reflection, the town mouse and the country " +
        "mouse, the goose that laid golden eggs, the wolf in sheep's clothing. Several have become " +
        "ordinary English idiom, which is the strongest thing that can be said about a book — that " +
        "people use it without knowing they are quoting. They are very short and they are meant to " +
        "be read a few at a time rather than straight through; a fable is a thing to stop after.",
      "This edition is George Fyler Townsend's, published by Routledge in 1867 and, in his own words " +
        "on the title page, literally translated from the Greek. Two things about it a reader should " +
        "know. It is called <i>Three Hundred Æsop's Fables</i> and it prints <b>313</b>, counted " +
        "here rather than taken on trust. And it numbers nothing at all: every fable is headed by " +
        "its title and by nothing else, and the book's own index at the back files them " +
        "alphabetically by title with a page number beside each. So the figures on the tabs here are " +
        "simply the order the fables are printed in, supplied so that they can be navigated and " +
        "cited — they are Folio's, not Townsend's. They earn their place chiefly because he gave " +
        "five pairs of quite different fables the same name, so that two tabs read The Two Frogs and " +
        "only the number tells them apart. There is no Greek column, and unlike every other book " +
        "here that lacks one the reason lies on both sides at once: this English states no section " +
        "numbers, and the Greek collections state none either — the standard text on Greek " +
        "Wikisource is Émile Chambry's of 1927, which lists 359 fables alphabetically by their Greek " +
        "titles with no numbering anywhere. Two unnumbered collections of different sizes in " +
        "different orders have nothing to pair on, and matching them fable by fable would mean " +
        "several hundred judgements made by eye, which " +
        "would be guesswork rather than editing. Better to say so than to guess three hundred times.",
    ],

    /* ---------- ONE FABLE, ONE CHAPTER — 313 of them, the most on the shelf ----------
       This is the Dialogues' shape taken to its limit: a chapter here is a whole separate WORK
       rather than a division of one, and where Plato's volumes gave eleven of those, Townsend's
       gives 313. It is also Seneca's shape — a collection of short independent pieces, each with
       its own title, reached by tab — at two and a half times Seneca's 124, which the chapter
       scroller was built for and handles.

       IT WAS WEIGHED AGAINST GROUPING THEM, which is the obvious alternative and is wrong twice
       over. Twenty-five fables to a chapter would give a tidy dozen tabs and a chapter you can read
       in one sitting — but the divisions would be composed here, and this file's standing rule is
       that a title is transcribed and never composed; and it would bury 313 titles inside twelve,
       so that the one thing a reader of Aesop actually wants to do — find the one about the fox and
       the grapes — could not be done from the contents at all. The fable is the unit the edition
       itself uses, it is the unit the book's own index uses, and it is the unit a reader's saved
       place should be measured in: "you were on The Fox and the Grapes" says something, where "38%
       of the way through chapter 5" does not.

       THE NUMBERS ARE OURS AND THE FRONT MATTER SAYS SO. The edition numbers nothing — measured, not
       assumed: the fables carry titles and no figures, and the index at the back is alphabetical
       with page numbers. What is written on the tabs is the ORDER the fables are printed in, which
       is a fact about the edition rather than an invention about it, and it is stated as such on the
       book's own first page. Below 640px the tab bar shows numbers alone, so a book of 313 chapters
       cannot go without them; and Townsend's five repeated titles mean the number is the only thing
       distinguishing two tabs even on a wide screen.

       THE EDITION'S OWN FRONT MATTER IS NOT IMPORTED — its Preface, its Life of Æsop and its list of
       illustrations. That is the Republic's precedent, where the 1901 printing's added introduction
       was left behind and what was taken was the translation; here the ground is the same and one
       more besides, that chapter 0 already covers the history in prose written for a reader now, and
       Townsend's preface is confident about Aesop's biography in a way the evidence does not support.
       Leaving it out costs the reader nothing and saves them being told something untrue. */
    source: "wiki",
    chapterWord: "Fable",
    /* The only book here that has to lower the short-chapter guard, and the reason is simply that a
       chapter is one paragraph. The shortest fable in the collection is 191 characters — fable 123,
       The Wolf and the Shepherds, read against its own source page to be sure it was complete and
       not truncated — where the shortest chapter in every other book on the shelf runs to
       thousands. 120 sits below the shortest real fable and far above anything a failed extraction
       produces, which is a handful of characters or none. */
    minChars: 120,
    page: (n) => "Three Hundred Æsop's Fables/" + AESOP_FABLES[n - 1],
    titleOf: (n) => AESOP_TITLE(AESOP_FABLES[n - 1]),
    chapters: Array.from({ length: AESOP_FABLES.length }, (_, i) => i + 1),
    /* No `indexPage`: titleOf reads the table above, which was built from the contents page once.
       No `parts` either — the edition prints the fables in one undivided run and gives them no
       volumes, so app.js falls back to a single unlabelled group, as the Meditations, the Republic
       and the Art of War do. */

    /* THE SCAN'S OWN HEADS. Every fable page opens with the fable's title set in capitals, which by
       the time dropHeads runs has become a <blockquote> — so left alone each of the 313 chapters
       would open on a quotation of the title Folio has just printed above it, which is the
       Meditations' running-head fault 313 times over. The first page carries two more, the
       collection's half-title and the caption under its frontispiece, both in the same centred
       block.

       Matched on being ALL CAPITALS rather than on any particular wording, and that is the only
       shape that can work here: the heads are 313 different strings, one per fable, so a list of
       them would be the fable table written out a second time and free to fall out of step with it.
       Capitals are safe in this edition because its prose is not set in them — Townsend's opening
       words are small capitals, which arrive as ordinary case — and the pattern requires the WHOLE
       block to be capitals, so a sentence merely beginning on a shout cannot match. Gated per book,
       like every other dropHeads, so no shipped book can be touched by it. */
    dropHeads: [/^[A-ZÆŒ][A-ZÆŒ0-9'’.,;:!?()\-— ]*$/],

    /* No `sections`. There are no section numbers to find — see the front matter — so cleanBody's
       marker rules are all left off and the chapters render with no <span class="bk-n"> at all,
       which is correct and not a wiring fault. It is the first book here where that is true of the
       ENGLISH: the Republic has no original either, but its English still carries Jowett's
       paragraphs and this one carries nothing to number.

       No `original`, and this is the second book on the shelf without one after the Republic — but
       the first whose answer is no on BOTH sides. The Republic's Greek states Stephanus numbers and
       it is Jowett who states none; here neither edition states anything, so there is not even a
       column to align badly. The whole finding is in the front matter, where the reader can see it. */
  },

  "song-of-roland": {
    title: "The Song of Roland",
    /* No subtitle. The volume's title page carries none, and the work has no second name — the two
       words are what it has been called in every language for nine hundred years. */
    author: "Anonymous",
    translator: "Charles Kenneth Scott Moncrieff",
    edition: "The Song of Roland, translated by Charles Scott Moncrieff, Chapman & Hall, London, 1919",
    written: "c. 1100",
    /* The Oxford manuscript is dated on its handwriting to somewhere in the middle of the twelfth
       century and the poem it copies is generally put around 1100 — a date argued from its language
       and from what it seems to know of the First Crusade, not from anything the poem states. 1100
       is the conventional figure and is the only one the shelf can honestly sort on; the front
       matter says how loose it is. */
    year: 1100,

    /* ---------- THE LICENCE — three layers, and the middle one is the only one to think about ----------
       The poem is around nine hundred years old and free everywhere. Bédier's constitution of the Old
       French, which is the original column, was published 1920–1922 and he lived 1864–1938 — dates
       looked up on Wikidata rather than recalled, for the Hugo Magnus reason. Scott Moncrieff's
       English was published in 1919 and he lived 1889–1930, likewise checked.

       SO IT IS THE THIRD BOOK HERE THAT MUST STATE A LIMIT AS WELL AS A GROUND, after the Art of War
       (Giles, in copyright in life-plus-seventy countries until 2029) and the Nicomachean Ethics
       (Ross, until 2042) — and the FIRST where the limit falls on BOTH columns rather than on one.
       Both halves are public domain in the United States under the pre-1929 publication rule and
       both are out of copyright wherever the term is the author's life plus seventy, which expired
       in 2001 for Scott Moncrieff and in 2009 for Bédier. Neither has yet cleared life plus a
       hundred, which runs to 2031 and 2039. The site's bar is that the copyright has expired and the
       ground the rest of the shelf is served on is US publication before 1929; this meets that bar
       on that ground, and the limit is said outright rather than smoothed into the sentence the
       easier books use.

       WHAT IS AND IS NOT TAKEN FROM THE VOLUME. Only the poem. Scott Moncrieff's 1919 book also
       carries an introduction by G. K. Chesterton, who died in 1936, and a note on technique by
       George Saintsbury, who died in 1933 — both later works by other hands, and neither is imported.
       That is the Republic's precedent, where the 1901 printing's added introduction and its engraved
       plates were left behind and what was taken was the translation.

       The modern translations a reader is likeliest to own — Dorothy L. Sayers's Penguin of 1957,
       Robert Harrison's of 1970, Frederick Goldin's of 1978, Gerard Brault's of 1978 and Glyn
       Burgess's Penguin of 1990 — are all firmly in copyright and are named here for the reason
       Campbell, Hays, Griffith, Lee, Humphries, de Sélincourt, Handford, Warner and the rest are
       named above: so that nobody reaches for one later. */
    rights:
      "Public domain, with one limit worth stating. The poem itself is Old French and around nine " +
      "hundred years old, so the words behind this book have been free for as long as copyright has " +
      "existed. Charles Scott Moncrieff's translation was published in 1919 and he lived from 1889 " +
      "to 1930; the Old French column is Joseph Bédier's text, published in 1920–1922, and he lived " +
      "from 1864 to 1938. Both are therefore public domain in the United States under the pre-1929 " +
      "publication rule, and both are out of copyright wherever the term is the author's life plus " +
      "seventy years — which expired in 2001 for Scott Moncrieff and in 2009 for Bédier. In the few " +
      "countries where the term is life plus a hundred they remain in copyright until 2031 and 2039. " +
      "The volume's introduction by G. K. Chesterton and its note on technique by George Saintsbury " +
      "are later works by other hands and are not reproduced here; what is taken is the poem. (The " +
      "modern translations by Dorothy L. Sayers, 1957, Robert Harrison, 1970, Frederick Goldin, " +
      "1978, Gerard Brault, 1978, and Glyn Burgess, 1990, are still in copyright and are not used.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/The_Song_of_Roland",

    /* ---------- THE FRONT MATTER — chapter 0 ----------
       What a reader needs before they start, and here the first thing is that the battle in the poem
       did not happen the way the poem has it. Then: what a chanson de geste is and how this one was
       performed, the manuscript and the name at the end of it, what the poem is remembered for, how
       it portrays its enemies — which cannot be left unsaid — and finally what this edition is,
       including the two misprinted numerals and why the tabs read the way they do. */
    about: [
      "<b>The Song of Roland</b> is the oldest major work of French literature and the finest of the " +
        "<i>chansons de geste</i>, the songs of deeds that were sung in France from the eleventh " +
        "century onwards. It tells how Charlemagne's rearguard, commanded by his nephew Roland, is " +
        "betrayed to a Saracen army in a pass of the Pyrenees, how Roland refuses to sound his horn " +
        "for help until it is too late, how he and every man with him is killed, and how the emperor " +
        "returns to avenge them and to try the traitor. It is about four thousand lines long and it " +
        "is, before anything else, a poem about loyalty — what a man owes his lord, his companions " +
        "and his own name, and what it costs him to pay it.",
      "The battle behind it was real and almost nothing else is. On 15 August 778 Charlemagne's army " +
        "was withdrawing from a campaign in Spain when its rearguard was ambushed in the Pyrenees and " +
        "destroyed. Einhard, writing the emperor's life some fifty years later, names three of the " +
        "dead, among them a <i>Hruodlandus</i> who was warden of the Breton March — one line, and it " +
        "is the whole of what history knows of Roland. The attackers in Einhard's account are " +
        "Basques, Christian mountain people defending their own country, and the raid was a small " +
        "disaster in a campaign that had gone badly. Three centuries later the poem has turned the " +
        "Basques into a Saracen host of hundreds of thousands, the skirmish into a holy war, and a " +
        "dead margrave into the emperor's nephew and the greatest knight in the world. Watching an " +
        "ambush become an epic is one of the best-documented cases we have of how legend works on " +
        "fact.",
      "It was made to be performed rather than read, and its shape is the shape of performance. The " +
        "lines are decasyllables, and they are grouped into <i>laisses</i> — stanzas of anything from " +
        "half a dozen lines to thirty-odd — which are held together not by rhyme but by " +
        "<b>assonance</b>: every line in a laisse ends on the same stressed vowel, and the next " +
        "laisse takes a new one. A singer could hold a stanza as long as the sense wanted and change " +
        "vowel when he turned to something new, and a listener heard each stanza as a block of sound. " +
        "The poet also uses the form to do something a modern narrative would not dare: he tells the " +
        "same moment two or three times over in successive laisses, each on a different vowel, " +
        "circling a death or a decision rather than moving past it. Those are called <i>laisses " +
        "similaires</i>, and they are not repetition by accident. Many laisses in the manuscript end " +
        "with the letters <b>AOI</b>, whose meaning nobody has established in two hundred years of " +
        "trying.",
      "The poem survives in several versions and the one everybody means is the Oxford manuscript, " +
        "Bodleian Digby 23 — an unassuming twelfth-century copy in Anglo-Norman, the oldest, the " +
        "shortest and much the best. It is the only one in assonance; the later versions rhyme, and " +
        "pad. Its last line says that here ends the <i>geste</i> that <b>Turoldus</b> " +
        "<i>declinet</i> — a verb that might mean composed, or recited, or copied out, of a man about " +
        "whom nothing else is known. Whether Turoldus wrote the poem, performed it or merely wrote it " +
        "down is the oldest unsettled question in French literature, and it is why this book is " +
        "shelved as anonymous. What can be said is that the Oxford text is the work of someone with a " +
        "very sure ear, and that the poem was famous early: a Norman chronicler writing about a " +
        "century after Hastings says a <i>cantilena Rollandi</i> was sung before the army as it " +
        "advanced.",
      "What people remember from it: Oliver seeing the Saracen host from the hill and begging Roland " +
        "to blow the oliphant, and Roland refusing three times; the line that sums the two of them up, " +
        "that Roland is brave and Oliver is wise; Archbishop Turpin absolving the whole rearguard and " +
        "then fighting beside them; Roland blowing the horn at last so hard that he bursts the veins " +
        "of his temple; his attempt to break his sword Durendal on the rock so that no pagan shall " +
        "have it, and the stone splitting instead of the blade; his death on the hill facing Spain, " +
        "having offered his glove up to God; Charlemagne holding back the sun to finish the pursuit; " +
        "and Aude, who is Oliver's sister and Roland's betrothed, being offered the emperor's own son " +
        "instead and falling dead at his feet without another word. The poem ends not in triumph but " +
        "with an exhausted old emperor called to yet another war, weeping and pulling his beard.",
      "One thing has to be said plainly, because a reader meets it in the first hundred lines. The " +
        "poem's Saracens are not Muslims as Muslims are or were: they worship an idolatrous trinity " +
        "of Mahumet, Tervagant and Apollin, they keep images in a crypt and beat them when they lose, " +
        "and they exist to be killed or converted. That is not a report of Islam but a Christian " +
        "fantasy of it, composed in the years around the First Crusade by someone who had almost " +
        "certainly never met a Muslim, and it sits at the centre of a poem of real moral seriousness " +
        "about courage, friendship and the cost of pride. Both things are true of it at once, and " +
        "reading it well means holding them together rather than choosing one — it is a document of " +
        "how medieval Christian Europe imagined its enemies, and it is one of the great poems.",
      "This edition is Charles Scott Moncrieff's, published by Chapman & Hall in 1919 — the same " +
        "translator who would shortly begin the English Proust. He renders the poem line for line and " +
        "keeps the assonance, which almost nobody attempts, and the result is strange and stiff and " +
        "much closer to the sound of the original than a smoother version would be. Beside it is the " +
        "Old French, in Joseph Bédier's text of 1920–1922, the standard edition for a century and a " +
        "conservative one — Bédier set out to print what the Oxford scribe wrote rather than to " +
        "reconstruct what the poet might have. The two are paired on the <b>laisse number</b>, which " +
        "is how any passage of the poem is cited in any language, and they agree on all <b>291</b> of " +
        "them. Two numerals are misprinted and both are left visible in this note rather than " +
        "corrected in silence: Scott Moncrieff's page 87 prints laisse 135 as CXXXXV, an X too many, " +
        "and Bédier's laisse 286 appears as CCXXXVI, having lost an L. Each is read as the place the " +
        "sequence puts it. Neither edition divides the poem above the laisse — there are no parts, " +
        "books or cantos in either — so the laisse is what the tabs here count, and a chapter is " +
        "therefore short, a median of thirteen lines. That is the poem's own unit and not a " +
        "convenience: a chanson de geste was sung one laisse at a time, and stopping at the end of " +
        "one is what it was built for.",
    ],

    /* ---------- ONE PAGE, 291 CHAPTERS — the shape that is new here ----------
       Every other wiki book on the shelf is a walk of pages, one per chapter. Both halves of this one
       are transcribed whole onto a single page per language, so the chapters are cut rather than
       fetched — see the LAISSES block above for how, and for why the French is cut at its <hr>
       separators rather than at its numerals. */
    source: "wiki",
    layout: "laisses",
    onePage: "The Song of Roland/The Song of Roland",
    chapterWord: "Laisse",
    chapters: Array.from({ length: 291 }, (_, i) => i + 1),
    /* The second book after Aesop to lower the short-chapter guard, and for the same reason: the
       guard catches an extraction that has returned wiki furniture instead of text, and 200
       characters is a broken chapter only where a chapter is a book of Herodotus. The shortest
       laisse in this translation is four lines and 230 characters of prose — measured over all 291,
       not assumed — and its Old French is 206. 150 sits below both and far above anything a failed
       extraction produces, which is a handful of characters or none. */
    minChars: 150,
    /* No `titleOf` and no `indexPage`: the laisses have no names in either edition, so the tabs read
       "Laisse 1", "Laisse 2" and so on, which is the whole of what the editions state about them.
       Composing 291 descriptive headings for a poet who gave none is the line the Meditations' entry
       draws. No `parts` either — neither edition divides the poem above the laisse, so app.js falls
       back to a single unlabelled group, as the Meditations, the Republic and the Art of War do. */

    original: {
      lang: "fro",
      langName: "Old French",
      edition: "La Chanson de Roland, edited by Joseph Bédier, L'Édition d'Art H. Piazza, Paris, 1920–1922",
      rights:
        "The poem is Old French and around nine hundred years old. Joseph Bédier's edition of it was " +
        "published in 1920–1922 and he lived from 1864 to 1938, so his text is public domain in the " +
        "United States under the pre-1929 publication rule and out of copyright wherever the term is " +
        "life plus seventy years, which expired in 2009; where the term is life plus a hundred it " +
        "runs until 2039. Bédier's own facing modern-French translation is not reproduced here — what " +
        "is taken is his Old French text.",
      sourceName: "Wikisource",
      sourceUrl: "https://fr.wikisource.org/wiki/La_Chanson_de_Roland/Joseph_B%C3%A9dier",
      wiki: "fr.wikisource.org",
      layout: "laisses",
      /* Bédier's own bilingual presentation, in the six pages Wikisource divides it into. Those
         divisions are the wiki's, not the edition's, and they are used only to fetch: the laisses are
         cut at the <hr> between one and the next and numbered straight through 1–291, so where the
         page boundaries fall makes no difference to what is written out. */
      pages: [
        "La Chanson de Roland/Joseph Bédier/La Chanson de Roland/Sequence/001-050",
        "La Chanson de Roland/Joseph Bédier/La Chanson de Roland/Sequence/051-100",
        "La Chanson de Roland/Joseph Bédier/La Chanson de Roland/Sequence/101-150",
        "La Chanson de Roland/Joseph Bédier/La Chanson de Roland/Sequence/151-200",
        "La Chanson de Roland/Joseph Bédier/La Chanson de Roland/Sequence/201-250",
        "La Chanson de Roland/Joseph Bédier/La Chanson de Roland/Sequence/251-291",
      ],
    },
  },

  "euripides-medea": {
    title: "Medea",
    // the play's own Greek title, which is what its Greek column is an edition of — the pattern
    // Lucretius set and the Oedipus Rex followed
    subtitle: "Μήδεια",
    author: "Euripides",
    translator: "Edward P. Coleridge",
    edition: "The Plays of Euripides, Volume 1, George Bell and Sons, London, 1906",
    written: "431 BCE",

    /* ---------- THE LICENCE, and it is the THIRD here to state a limit as well as a ground ----------
       The Art of War states one for Giles (in copyright where the term is life plus seventy until
       2029) and the Nicomachean Ethics for Ross (until 2042). This is the third, and the limit falls
       on the GREEK rather than on the English, which is a first — everywhere else on the shelf the
       original is the older and easier half.

       Both columns are public domain in the United States on the ground the shelf uses most: Edward
       Coleridge's translation was published by George Bell and Sons in 1906 and Gilbert Murray's
       Oxford Classical Text at the Clarendon Press in 1902, both long before 1929. Where they part
       company is on the author's-life rules. Coleridge died in 1936, so his English has been public
       domain on life-plus-seventy since 2007. MURRAY DIED IN 1957, so his Greek remains in copyright
       where the term is life plus seventy — the United Kingdom and the European Union among them —
       until 2028, and where it is life plus a hundred until 2058. Coleridge's own hundred-year term
       runs to 2037.

       BOTH DATES WERE CHECKED RATHER THAN RECALLED, against Wikisource's author pages, which give
       Coleridge 1863–1936 and Murray 1866–1957: the Ovid entry's Hugo Magnus mistake was precisely a
       death year asserted from memory to hold up a licence, and Murray's is the year the whole of this
       paragraph turns on. It is said outright in `rights` and on the book's own front matter rather
       than smoothed into the easier sentence the Oedipus Rex can honestly use, which is the judgement
       Lucretius's entry states: claim less, and put on the page what cannot be said.

       THERE WAS NO CLEANER GREEK TO REACH FOR, which is worth recording because the Ethics' entry
       makes the opposite choice look available. There it was a real trade — Chase's 1847 English is
       free everywhere and pairs on 18 of 181 pages, Ross's is limited and pairs on 173 of 173 — so the
       licence question and the pairing question were decided together. Here Perseus carries exactly
       one Greek Medea, Murray's; the older grc1 file does not exist. So the choice is this text or no
       original at all, and a second column that pairs on 500 of the translation's 502 sections is
       worth a stated limit that expires in two years.

       The translations a reader is likeliest to own — Rex Warner's of 1944, Philip Vellacott's Penguin
       of 1963 and Diane Arnson Svarlien's of 2008 — are all firmly in copyright, and are named here
       for the reason Campbell, Hays, Griffith, Lee, Humphries, Melville, Brown, Fagles and de
       Sélincourt are named above: so that nobody reaches for one. */
    rights:
      "Public domain in the United States, with one limit stated. Edward Coleridge's translation was " +
      "published in London in 1906 and Gilbert Murray's Greek text at Oxford in 1902, both before " +
      "1929, so the copyright in both has expired in the United States. Coleridge died in 1936, so " +
      "his English is also public domain everywhere the term is the author's life plus seventy years " +
      "or less. Murray, however, died in 1957, so the Greek beside it remains in copyright where the " +
      "term is life plus seventy — including the United Kingdom and the European Union — until 2028. " +
      "Euripides wrote the play in Athens some twenty-five centuries ago. The digital editions of " +
      "both texts are prepared by the Perseus Digital Library at Tufts University and are released " +
      "under a Creative Commons Attribution-ShareAlike 4.0 International licence. (The modern " +
      "translations by Rex Warner, 1944, Philip Vellacott, 1963, and Diane Arnson Svarlien, 2008, are " +
      "still in copyright and are not used here.)",
    sourceName: "Perseus Digital Library",
    sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0006.tlg003/",

    /* THE FRONT MATTER — chapter 0. Five things a reader should be told before they start rather than
       work out late: what happens and how little of the play is the thing it is famous for, what
       Euripides appears to have changed and why the argument about it is still live, what the parts
       and the chorus are, what is known about the first performance, and what the two columns, the
       small figures and the notes running through them are. */
    about: [
      "<b>Medea</b> was staged in Athens in 431 BCE, and it is the Greek tragedy that modern readers " +
        "argue about most. Jason has brought Medea back from the far edge of the Black Sea, where she " +
        "betrayed her father and killed her brother to win him the Golden Fleece; the two have been " +
        "living as exiles in Corinth with their two sons. The play opens on the morning after Jason " +
        "has married the Corinthian king's daughter. Medea is to be banished the same day, and she " +
        "asks for one more, which she is given. What she does with it is the play. The famous part of " +
        "the story occupies a few minutes at the end; almost all of what comes before is argument — " +
        "with the king, with Jason, with a visiting king of Athens, with the chorus, and at the " +
        "centre of it a long speech in which she argues with herself.",
      "Euripides seems to have made the worst of it up, and the ancient evidence for that is thin " +
        "enough to keep the question open. Older versions of the story have the children killed by " +
        "the Corinthians or dying by accident; commentators in antiquity say Euripides was the one " +
        "who had their mother do it deliberately, and some of them add that Corinth paid him to shift " +
        "the blame. What is not in doubt is what the play does with the act. Medea is given the " +
        "clearest arguments in it, and she uses them on her own position — she is a foreigner nobody " +
        "will shelter, a wife discarded once her usefulness ended, and she says so in a speech about " +
        "the lives of women that is quoted far more often than anything else in the play. The chorus " +
        "hears her plan and does not stop her. She is neither punished nor forgiven at the end, which " +
        "is the part that unsettles people.",
      "It is written in the shape every Athenian tragedy uses, and this edition marks it: spoken " +
        "scenes alternating with odes sung and danced by a chorus, here of Corinthian women, who are " +
        "characters in the story as well as commentators on it. Folio's parts follow the edition's " +
        "own divisions and its own labels for them — a spoken part is an <i>episode</i> and a sung " +
        "one a <i>choral ode</i>, thirteen in all. Elsewhere you will meet a more precise set of " +
        "names for the same divisions: prologue for the opening scene, parodos for the chorus's " +
        "entrance song, stasimon for each ode after it, and exodos for the final scene. Those are the " +
        "standard analysis and they are worth knowing, but they are not the words this edition uses, " +
        "so they are not used here.",
      "Unusually for a Greek play, the date of the first performance is recorded rather than " +
        "reconstructed: the spring of 431 BCE, at the festival of Dionysus, a few months before the " +
        "war between Athens and Sparta began. It came third of three, which is last. Euripides lived " +
        "from about 480 to 406 BCE and wrote some ninety plays, of which about nineteen survive whole " +
        "— far more than either of the other two great tragedians, largely because a volume of them " +
        "seems to have come through the Middle Ages by luck rather than by choice. He won the first " +
        "prize only a handful of times in his life and became the most read and most performed of the " +
        "three within a generation of his death.",
      "The translation here is Edward Coleridge's of 1906 and the Greek beside it is Gilbert Murray's " +
        "Oxford text of 1902. The small raised figures running through both columns are LINE numbers " +
        "of the Greek, which is how any passage of a tragedy is cited in any language: Coleridge " +
        "translates into prose and numbers the line each block of it begins at, while Murray's verse " +
        "numbers every line, and a figure appearing in both columns marks the same place in the play. " +
        "Three things about the page are differences between the editions rather than faults in it. " +
        "The italic stage directions are the English edition's: the ancient text records none, and " +
        "every one printed in a modern edition is its editor's inference from what the characters " +
        "say, which is why the Greek column beside them is blank. The numbered notes are the English " +
        "edition's too — Coleridge's own, on the manuscript readings he follows, and Perseus's, on " +
        "the handful of places where this translation parts company with Murray's Greek over who " +
        "speaks a line. And two of the five hundred and two English passages draw beside an empty " +
        "Greek cell, both in Part 12, where the children are heard crying out inside the house: " +
        "Murray runs those lines together and gives them to the two boys speaking at once, so the " +
        "numbers beside them do not stand alone on his side. The notes on those lines say so, " +
        "so a reader who meets the blank finds the reason a marker away.",
    ],

    /* ---------- A PLAY: the same shape as the Oedipus Rex, and it needed no new reader ----------
       The second play here, and the Gallic War's lesson repeated one layout along: a shape already met
       costs nothing to meet again. Both of these files divide the work with `subtype="episode"` and
       `subtype="choral"` at the top level and nest everything else — the strophe, antistrophe,
       anapests and epode of each ode — inside them, which is exactly what teiDramaDivisions selects.

       MEASURED OVER THE WHOLE PLAY BEFORE ANY OF IT WAS BELIEVED: 13 divisions on each side, of the
       same kinds, in the same order, opening at the same 13 lines; 502 English sections, of which 500
       draw Greek beside them and 2 do not; and no number in the Greek that the English has not got,
       which is the direction that would signal a misread. All of it is re-checked against the files on
       every run rather than resting on this comment.

       THE TWO EMPTY CELLS ARE EXPLAINED BY THE EDITION'S OWN NOTES, which is a first here and worth
       saying. The Oedipus Rex's three unpaired lines are simply places where Jebb constitutes the text
       differently from Storr, recorded and left alone; these two — 1271 and 1273, both in Part 12, at
       the moment the children are heard from inside the house — are places where Murray's Greek runs
       two of the translation's lines together and gives them to both children speaking at once, so
       neither number stands alone on that side. Perseus's notes on those very lines say so, and the
       notes now ship, so a reader who meets the blank cell finds the reason a marker away.

       WHAT IS NEW IS THE APPARATUS, and it is why the drama reader changed. The Oedipus Rex prints no
       notes; this edition prints 38, and the reader was stripping them. See dramaNotes for the lift,
       for the empty marker carrying its own target, and for the seven of them that stand between two
       lines and had to be attached to the line before.

       AND <del> IS LIVE HERE AND CHANGES NOTHING, which is the thing Lucretius's entry says to measure
       rather than assume. The English carries two and the Greek eleven, and — unlike the Oedipus Rex's
       single one, which wrapped a whole line and took the English from 684 sections to 683 — not one
       of these thirteen wraps a whole line. Every one sits inside a line, so dropping them with their
       words shortens thirteen lines and removes no section from either column. */
    source: "tei",
    url: "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0006/tlg003/tlg0006.tlg003.perseus-eng2.xml",
    layout: "drama",
    /* "Part" is Folio's own neutral word for a division, as it is for the Oedipus Rex: this edition
       numbers its divisions not at all, and an act is a later theatre's unit a Greek tragedy has not
       got. The number is Folio's; the NAME of each part is the edition's. */
    chapterWord: "Part",
    // thirteen is what the edition divides the play into, and is checked against the file on every run
    chapters: Array.from({ length: 13 }, (_, i) => i + 1),

    original: {
      lang: "grc",
      langName: "Greek",
      source: "tei",
      layout: "drama",
      edition: "Gilbert Murray, Euripidis Fabulae, Volume 1, Clarendon Press, Oxford, 1902",
      rights:
        "Two layers, and the first of them carries a limit. Euripides wrote the play in Greek in the " +
        "fifth century BCE, so the words themselves are in the public domain everywhere. The text " +
        "printed here is Gilbert Murray's of 1902, published well before 1929 and so public domain in " +
        "the United States — but Murray died in 1957, so his edition remains in copyright where the " +
        "term is the author's life plus seventy years, including the United Kingdom and the European " +
        "Union, until 2028. The digital edition is prepared by the Perseus Digital Library at Tufts " +
        "University and is released under a Creative Commons Attribution-ShareAlike 4.0 " +
        "International licence.",
      sourceName: "Perseus Digital Library",
      sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0006.tlg003/",
      url: "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0006/tlg003/tlg0006.tlg003.perseus-grc2.xml",
    },
  },

  "sophocles-antigone": {
    title: "Antigone",
    // the play's own Greek title, which is what its Greek column is an edition of — the pattern
    // Lucretius set and both earlier plays followed
    subtitle: "Ἀντιγόνη",
    author: "Sophocles",
    translator: "Richard Jebb",
    edition: "Sophocles: The Plays and Fragments, Volume 3, Cambridge University Press, 1891",
    /* NOT the Oedipus Rex's volume, and the difference is worth stating rather than copying across:
       that book is Jebb's volume 1 of 1887 and this is his volume 3 of 1891, the same commentary
       series a few years on. A second book by an author already on the shelf is exactly where an
       edition line gets inherited by hand and quietly made wrong. */
    written: "c. 441 BCE",

    /* ---------- THE LICENCE, and it is the OEDIPUS REX'S PLUS ONE LAYER ----------
       The two columns are the easy case twice over, and then there is a third thing that has to be
       said out loud, which is why this entry is longer than its sibling's.

       THE TWO PRINTED EDITIONS. Richard Jebb published this translation at Cambridge in 1891 and died
       in 1905; Francis Storr's Greek is the 1912 Loeb — the same volume the Oedipus Rex takes its
       Greek from, since Storr's first volume holds Oedipus the King, Oedipus at Colonus and Antigone
       together — and Storr died in 1919. So both clear the pre-1929 publication rule, life plus
       seventy, and life plus a hundred, and neither needs the limit the Art of War states for Giles
       (2029), the Nicomachean Ethics for Ross (2042), the Song of Roland for both its columns, or the
       Medea for Murray (2028). BOTH YEARS WERE CHECKED RATHER THAN RECALLED, against Wikisource's
       author pages, which give Jebb 1841–1905 and Storr 1839–1919: the Ovid entry's Hugo Magnus
       mistake was precisely a death year asserted from memory to hold up a licence. The play beneath
       them was written in Athens about twenty-five centuries ago.

       AND THE THIRD LAYER, WHICH IS THE HERODOTUS CASE A SECOND TIME. Everywhere else on this shelf
       Perseus's contribution is the DIGITAL edition over a printed text left as its editor set it.
       Here, as with Godley's Herodotus, they have also edited the PROSE: this English is Jebb
       MODERNIZED TO REMOVE ARCHAISMS, by Pierre Habel in 1988, reviewed by John Gibert, which the
       source file states in its own header — its subtitle is "Modernized by Perseus" — and which is
       quoted here rather than paraphrased into something softer. That is a recent derivative work
       carried by CC BY-SA 4.0 rather than by an expiry, so it is stated in `rights`, in the book's
       own front matter and here, exactly as the Histories' entry sets out. A reader who goes looking
       for the 1891 printing must not be surprised by what they find.

       THE SHIPPED OEDIPUS REX CARRIES THE SAME LAYER AND ITS RIGHTS STRING DID NOT SAY SO — found by
       running this check across the shelf's other two plays rather than only on the book being added,
       which is the sibling-consistency check the citation plans keep prescribing. That file's header
       records the same 1988 modernization, by Alex Sens rather than Habel and reviewed by the same
       John Gibert, and its `rights` called the book "public domain on every ground, in both columns"
       with no mention of it. Corrected in the same commit as this book landed. (Coleridge's Medea
       carries no such note — checked, not assumed — so the Medea's entry is right as it stands.)

       The translations a reader is likeliest to own — Dudley Fitts and Robert Fitzgerald's of 1939,
       Elizabeth Wyckoff's of 1954, Robert Fagles's of 1982 and Anne Carson's Antigonick of 2012 — are
       all firmly in copyright, and are named here for the reason Campbell, Hays, Griffith, Lee,
       Humphries, Melville, Brown, Warner and de Sélincourt are named above: so that nobody reaches
       for one. */
    rights:
      "Public domain in both columns, with one addition stated. Richard Jebb's translation was " +
      "published at Cambridge in 1891 and Jebb died in 1905; the Greek beside it is Francis Storr's " +
      "text of 1912, and Storr died in 1919. Both are therefore public domain in the United States on " +
      "the pre-1929 publication rule and everywhere the term is the author's life plus a hundred " +
      "years or less. Sophocles wrote the play in Athens some twenty-five centuries ago. The English " +
      "printed here is not quite Jebb's page, however: it is his translation modernized to remove " +
      "archaisms, by Pierre Habel in 1988 and reviewed by John Gibert, which the source file records " +
      "in its own header. That editing is a recent work rather than an expired one, and it — with the " +
      "digital editions of both texts — is prepared by the Perseus Digital Library at Tufts " +
      "University and released under a Creative Commons Attribution-ShareAlike 4.0 International " +
      "licence. (The modern translations by Dudley Fitts and Robert Fitzgerald, 1939, Elizabeth " +
      "Wyckoff, 1954, and Robert Fagles, 1982, are still in copyright and are not used here.)",
    sourceName: "Perseus Digital Library",
    sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0011.tlg002/",

    /* THE FRONT MATTER — chapter 0. Five things a reader should be told before they start rather than
       work out late: what the situation is and how quickly it is set up, what the argument at the
       centre of it actually is and why it is still argued about, what the parts and the chorus are,
       what is and is not known about the date and where the play sits among Sophocles' other two on
       the same family, and what the two columns, the small figures and the italic directions are —
       including the modernization, which belongs on the page and not only in a licence string. */
    about: [
      "<b>Antigone</b> is a tragedy staged in Athens in the fifth century BCE, and its situation is " +
        "set up in the first two minutes. Thebes has survived a siege; the two brothers who led the " +
        "two sides, Eteocles and Polyneices, have killed each other; and Creon, their uncle and now " +
        "the city's ruler, has buried one with full honours and forbidden anyone to bury the other, " +
        "on pain of death. Antigone, sister to both, tells her sister Ismene that she intends to bury " +
        "him anyway. She is caught doing it, and the rest of the play is what follows from two people " +
        "who will not move: Creon condemns her, and by the time he is talked out of it he has lost " +
        "his son, his wife and any reason to go on living.",
      "What the play is famous for is that both of them have a case, and it does not adjudicate. " +
        "Creon is not a tyrant when the play opens — he is a new ruler with a city just out of a " +
        "civil war, and his argument is that a state which honours its attackers has no claim on " +
        "anyone's loyalty. Antigone's is that the obligation to bury her brother is older than any " +
        "decree and not the city's to withdraw. The play gives each of them the strongest form of " +
        "their own position and then shows what it costs to hold it without bending; the chorus, " +
        "asked to take a side, mostly declines. That symmetry is why the philosopher Hegel used it as " +
        "his central example of tragedy as a collision between two goods rather than between right " +
        "and wrong, and why the play has been staged as a political argument in almost every " +
        "generation since.",
      "It is written in the shape every Athenian tragedy uses, and this edition marks it: spoken " +
        "scenes alternating with odes sung and danced by a chorus, here of Theban elders, who are " +
        "characters in the story as well as commentators on it. Folio's parts follow the edition's " +
        "own divisions and its own labels for them — a spoken part is an <i>episode</i> and a sung " +
        "one a <i>choral ode</i>, sixteen in all. Elsewhere you will meet a more precise set of names " +
        "for the same divisions: prologue for the opening scene, parodos for the chorus's entrance " +
        "song, stasimon for each ode after it, and exodos for the final scene. Those are the standard " +
        "analysis and they are worth knowing, but they are not the words this edition uses, so they " +
        "are not used here. Part 4 is the ode beginning \"Wonders are many, and none is more " +
        "wonderful than man\", which is the most quoted chorus in Greek tragedy.",
      "The date is not recorded. It is usually put at about 441 BCE on the strength of an ancient " +
        "note which says Sophocles was elected general on the back of the play's success — he did " +
        "hold that office around then — but that is a story told about the play rather than a record " +
        "of its performance, and it is worth treating as tradition. What is clearer is where it sits " +
        "among his work: Sophocles wrote three plays about this family, and <i>Antigone</i> came " +
        "first, some twelve years before <i>Oedipus Rex</i> and more than thirty before " +
        "<i>Oedipus at Colonus</i>. They are not a trilogy and were not composed in their story's " +
        "order, which is why details differ between them. Sophocles lived from about 496 to 406 BCE, " +
        "wrote some hundred and twenty plays of which seven survive whole, and served Athens as a " +
        "treasurer and a general.",
      "The translation here is Richard Jebb's of 1891 and the Greek beside it is Francis Storr's " +
        "text of 1912. One thing about the English should be said plainly: it is not quite Jebb's " +
        "page. The Perseus Digital Library, which prepared both texts, also modernized this " +
        "translation in 1988 to remove archaisms, so the wording is Jebb's revised rather than Jebb's " +
        "as printed. The small raised figures running through both columns are LINE numbers of the " +
        "Greek, which is how any passage of a tragedy is cited in any language: Jebb translates into " +
        "prose and numbers the line each block of it begins at, while Storr's verse numbers every " +
        "line, and a figure appearing in both columns marks the same place in the play. Two further " +
        "differences between the editions are visible on the page. The italic stage directions are " +
        "the English edition's — the ancient text records none, and every one printed in a modern " +
        "edition is its editor's inference from what the characters say, which is why the Greek " +
        "column beside them is blank. And the Greek tells two messengers apart where the English " +
        "calls both of them simply Messenger.",
    ],

    /* ---------- A PLAY: the drama layout a THIRD time, and it needed no new reader ----------
       The Medea's entry recorded that a shape already met costs nothing to meet again, and this is
       that a second time: all three of these files divide the work with `subtype="episode"` and
       `subtype="choral"` at the top level and nest the strophe and antistrophe of each ode inside
       them, which is exactly what teiDramaDivisions selects.

       MEASURED OVER THE WHOLE PLAY BEFORE ANY OF IT WAS BELIEVED, against both files rather than
       against this comment, and re-checked on every run: 16 divisions on each side, of the same kinds
       in the same order; 299 speeches on each side; and the Greek running 1 to 1353 against the
       English's 513 numbered blocks.

       IT IS THE CLEANEST PAIRING OF THE THREE PLAYS: 513 of 513 sections pair and NOT ONE draws an
       empty Greek cell, where the Oedipus Rex leaves three of 683 unpaired and the Medea two of 502.
       So this is the first drama here with no table of exceptions to state, and the front matter says
       nothing about empty cells because there are none to explain.

       THE ONE DIVERGENCE IS A SINGLE LINE NUMBER, AND IT COSTS THE PAGE NOTHING — which is worth
       writing down precisely, because the warning it raises on every run looks like a fault and is
       not. Fifteen of the sixteen divisions open at the same line on both sides; the fourth opens at
       332 in Jebb and 333 in Storr, which is the first line of the ode on man. Both editions carry
       the ode and neither loses a word of it — they simply number its opening line differently — and
       because the pairing is a RANGE test rather than an equality one (a Greek line joins the English
       block whose range contains its own number) the Greek's 333 falls inside the English's 332 block
       and the row draws with both columns filled. Confirmed by the run, not merely predicted here:
       513 of 513. The divergence is reported rather than smoothed away, as the Oedipus Rex's three
       unpaired lines and the Nicomachean Ethics' three repeated Bekker pages are.

       THIS EDITION PRINTS NO NOTES AT ALL — measured, zero in the whole English body, as the Oedipus
       Rex's prints none — so the book renders with no note fold, which is correct and not a wiring
       fault. dramaNotes is still run over it and reports anything that ever appears.

       AND <del> IS LIVE AND CHANGES NOTHING, which is the thing Lucretius' entry says to measure
       rather than assume. The English carries five and the Greek none, and — unlike the Oedipus Rex's
       single one, which wrapped a whole line and took that play from 684 sections to 683 — not one of
       the five wraps a whole line. Every one sits inside a line, so dropping them with their words
       shortens five lines and removes no section from either column. That is the Medea's finding a
       second time, and it is why the rule is measured per book instead of being carried over.

       ONE MORE THING THE GREEK NEEDS AND THE ENGLISH DOES NOT: five of Storr's line numbers carry a
       letter (161b, 323a, 1048a, 1261a, 1284a) where none of Jebb's does, so the `data-n` sort key
       lineSortKey writes is doing real work on this book's original column — 323 and 323a are two
       different places, and parseInt would collapse them into one row and take the ordering with it. */
    source: "tei",
    url: "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0011/tlg002/tlg0011.tlg002.perseus-eng2.xml",
    layout: "drama",
    /* "Part" is Folio's own neutral word for a division, as it is for both earlier plays: this
       edition numbers its divisions not at all, and an act is a later theatre's unit a Greek tragedy
       has not got. The number is Folio's; the NAME of each part is the edition's. */
    chapterWord: "Part",
    // sixteen is what the edition divides the play into, and is checked against the file on every run
    chapters: Array.from({ length: 16 }, (_, i) => i + 1),

    original: {
      lang: "grc",
      langName: "Greek",
      source: "tei",
      layout: "drama",
      edition: "Francis Storr, Loeb Classical Library, William Heinemann, London, 1912",
      rights:
        "Two layers, both stated, and neither carries a limit. Sophocles wrote the play in Greek in " +
        "the fifth century BCE, so the words themselves are in the public domain everywhere. The text " +
        "printed here is Francis Storr's of 1912, published before 1929 and so public domain in the " +
        "United States, and Storr died in 1919, so it is equally free where the term is the author's " +
        "life plus seventy or a hundred years. The digital edition is prepared by the Perseus Digital " +
        "Library at Tufts University and is released under a Creative Commons Attribution-ShareAlike " +
        "4.0 International licence.",
      sourceName: "Perseus Digital Library",
      sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0011.tlg002/",
      url: "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0011/tlg002/tlg0011.tlg002.perseus-grc2.xml",
    },
  },

  "epic-of-gilgamesh": {
    title: "The Epic of Gilgamesh",
    /* No subtitle. Thompson's title page reads "The Epic of Gilgamish", with his transliteration of
       the name, and the entry keeps his spelling wherever it quotes his edition — but the book is
       shelved under the spelling every reader will look for. Both are on its own first page. */
    author: "Anonymous",
    translator: "R. Campbell Thompson",
    edition:
      "The Epic of Gilgamish: A New Translation from a Collation of the Cuneiform Tablets in the " +
      "British Museum, Rendered Literally into English Hexameters, Luzac & Co., London, 1928",
    written: "c. 1200 BCE",
    /* The standard twelve-tablet version Thompson translates was put together somewhere around
       1200 BCE out of poems already six or seven centuries old, and the copies we read it from were
       written later still. No date is stated anywhere by the text; this is the conventional figure
       for the version in front of the reader and the only one the shelf can honestly sort on, which
       is the Song of Roland's position exactly. How loose it is is said on the book's own page. */
    year: -1200,

    /* ---------- THE LICENCE — one layer, and it needs a limit stated ----------
       The poem is between three and four thousand years old and free everywhere; the only modern
       layer is Thompson's translation. Published in London in 1928 and Thompson lived 1876–1941 —
       dates looked up on Wikidata rather than recalled, for the Hugo Magnus reason.

       SO IT IS THE FIFTH BOOK HERE TO STATE A LIMIT AS WELL AS A GROUND, after the Art of War
       (Giles, 2029), the Nicomachean Ethics (Ross, 2042), the Song of Roland (both columns, 2031 and
       2039) and the Medea (Murray, 2028). It is public domain in the United States — a foreign work
       published in 1928, whose 95-year term expired at the start of 2024 — and out of copyright
       wherever the term is the author's life plus seventy, which expired at the start of 2012. Where
       the term is life plus a hundred it runs until 2042.

       WHAT IS AND IS NOT TAKEN. The twelve tablets. Thompson's own preface is left behind, as the
       Republic's added introduction and the Song of Roland's Chesterton essay were — what the reader
       needs before starting is said in the book's own front matter, in Folio's voice, and a 1928
       preface addressed to Assyriologists is not that.

       The modern translations a reader is likeliest to own — Nancy Sandars's Penguin of 1960, Maureen
       Gallery Kovacs's of 1989, Andrew George's Penguin of 1999, Benjamin Foster's Norton of 2001 and
       Stephen Mitchell's version of 2004 — are all firmly in copyright and are named here for the
       reason Campbell, Hays, Griffith, Lee, Humphries, de Sélincourt, Handford, Warner and the rest
       are named above: so that nobody reaches for one later. George's is the standard scholarly text
       and is the one to buy; it is not one to copy. */
    rights:
      "Public domain, with one limit worth stating. The poem itself is Babylonian and some three " +
      "thousand years old, so the words behind this book have been free for as long as copyright has " +
      "existed. The only modern layer is the translation: R. Campbell Thompson published it in London " +
      "in 1928 and lived from 1876 to 1941. It is therefore public domain in the United States, where " +
      "the term for a work published in 1928 expired at the start of 2024, and out of copyright " +
      "wherever the term is the author's life plus seventy years, which expired at the start of 2012. " +
      "In the few countries where the term is life plus a hundred it remains in copyright until 2042. " +
      "Thompson's own preface is not reproduced here; what is taken is the twelve tablets. (The modern " +
      "translations by N. K. Sandars, 1960, Maureen Gallery Kovacs, 1989, Andrew George, 1999, " +
      "Benjamin Foster, 2001, and Stephen Mitchell, 2004, are still in copyright and are not used.)",
    /* THE FIRST BOOK HERE FROM NEITHER WIKISOURCE NOR PERSEUS, and the block above extractTablets is
       where the reasoning lives: both of the shelf's usual sources hold about a sixth of this poem
       between them, and the Internet Archive's scan of the 1928 volume has an OCR layer missing a
       third of it. The transcriber is named because a transcription is work, and because a reader
       who wants to check this text against the printed page should be told which copy they are
       reading. */
    sourceName: "Global Grey",
    sourceUrl: "https://www.globalgreyebooks.com/epic-of-gilgamesh-ebook.html",
    source: "html",
    layout: "tablets",
    url: "https://www.globalgreyebooks.com/online-ebooks/reginald-campbell-thompson_epic-of-gilgamesh_complete-text.html",
    chapterWord: "Tablet",
    chapters: Array.from({ length: 12 }, (_, i) => i + 1),
    /* The tablets have names in this edition — Thompson heads each with a line saying what happens in
       it — so the tabs carry them and nothing is composed here. `titleOf` is therefore absent: the
       titles are read off the headings by extractTablets, which is the only book on the shelf that
       takes them from the text itself rather than from a contents page or an entry in this file.

       No `parts`. The edition divides the poem into tablets and nothing above them, so the Contents
       panel falls back to a single unlabelled group, as the Meditations', the Republic's, the Art of
       War's, Aesop's and the Song of Roland's do.

       The floor stays at the default 200: the shortest tablet here is the Eighth, and even that runs
       to several thousand characters, so nothing about this book needs the lower guard Aesop and the
       Song of Roland set. */

    /* ---------- NO ORIGINAL COLUMN, AND THE REASON IS NOT THE USUAL ONE ----------
       Every other book without a facing original fails the shelf's own test — does the text say which
       section each passage is? The Republic's Jowett states no Stephanus numbers; neither of Aesop's
       two collections numbers anything at all. Gilgamesh fails one step earlier, and it is worth
       being precise about where.

       The original is Akkadian written in cuneiform on tablets that are broken. There is no edition
       of it in the sense the rest of this shelf means: what exists is a transliteration assembled
       from dozens of fragments, and the assembling is itself the scholarship. The standard one is
       Andrew George's of 2003 and it is in copyright. The Electronic Text Corpus of Sumerian
       Literature carries the five SUMERIAN Gilgamesh poems, which are a different and older set of
       texts rather than this poem in its original words. The electronic Babylonian Library carries
       the Akkadian and licenses it for non-commercial use, which is not a licence this site can build
       on and, more to the point, is not an expired copyright.

       So a book that is one of the two or three most famous poems in the world ships in translation
       alone, and its own front matter says why — a reader who goes looking for the Akkadian should
       find the reason rather than the absence, which is the Republic's judgement in a harder case. */

    /* ---------- THE FRONT MATTER — chapter 0 ----------
       What a reader needs before they start. The poem first and at length, because most people
       arriving here know the name and one anecdote; then the thing that makes it unlike anything else
       on this shelf, which is that it was lost for two and a half thousand years and had to be dug
       up; then how broken it is, which governs every page they are about to read; then this
       translation, its age, and what its brackets and dots mean; and last the two absences a reader
       will notice — no Akkadian column and no twelfth-tablet continuity. */
    about: [
      "<b>The Epic of Gilgamesh</b> is the oldest great poem in the world. It was written in " +
        "Akkadian, the language of Babylon and Assyria, on clay tablets in cuneiform, and the version " +
        "translated here was assembled around 1200 BCE out of Sumerian poems already six or seven " +
        "hundred years older. That makes it older than the <i>Iliad</i> by something like five " +
        "centuries and older than the Hebrew Bible by more. It tells of Gilgamesh, king of Uruk, a " +
        "tyrant two-thirds divine whom the gods check by creating his equal — Enkidu, a wild man of " +
        "the steppe who lives among the animals until a woman brings him into the human world. The two " +
        "fight, become inseparable, and go together to kill the guardian of the cedar forest and then " +
        "the Bull of Heaven. For that the gods take Enkidu's life, and the second half of the poem is " +
        "about what his death does to the man left behind.",
      "It is, in the end, a poem about refusing to accept mortality and having to accept it anyway. " +
        "Gilgamesh goes out to the ends of the earth looking for Uta-Napishtim, the one man granted " +
        "eternal life, and what he is given is not a cure but a story: the account of the Flood, which " +
        "stands in the Eleventh Tablet and is the most famous passage in the book. A god warns one " +
        "man, who builds a boat, loads it with his family and the animals, rides out a deluge that " +
        "drowns the world, grounds on a mountain and sends out birds to find dry land. It was read for " +
        "the first time in the modern world in 1872, and the resemblance to Noah was immediately " +
        "obvious to everyone who heard it — a discovery that changed how the Book of Genesis was read " +
        "and has been argued about ever since.",
      "That date matters, because this poem's history is unlike that of almost any other ancient book. " +
        "Homer, Plato and Herodotus were copied by hand in an unbroken line from antiquity to the " +
        "printing press and have never once been out of the world's hands. Gilgamesh was. Its language " +
        "died, its script became unreadable, and the poem was completely lost for something like two " +
        "and a half thousand years — until the palace library of Ashurbanipal at Nineveh was excavated " +
        "in the 1850s and its tablets shipped to the British Museum, where George Smith, a former " +
        "banknote engraver who had taught himself cuneiform, recognised the Flood story among them. " +
        "Everything in this book has been recovered within the last hundred and seventy years, and " +
        "fragments are still being identified now.",
      "Which is why it is full of holes, and a reader should know that before opening it rather than " +
        "be puzzled by it. The tablets are broken. Lines are chipped away, whole columns are missing, " +
        "and some of the joins between one episode and the next are simply gone. Thompson prints what " +
        "the clay carries and marks everything else: rows of dots are lacunae, words in square " +
        "brackets are his restorations of damaged text, a bracketed question mark means he is not sure " +
        "of a reading, and the notes in round brackets between passages tell you roughly how much is " +
        "lost and what is thought to have stood there. None of this is damage to the edition — it is " +
        "the edition being honest, and reading around the gaps is part of reading this poem at all.",
      "The translation is R. Campbell Thompson's of 1928, the first complete scholarly English " +
        "version, made directly from the tablets in the British Museum and set out in long verse " +
        "lines. It is nearly a century old, and that shows in two ways worth knowing. Its English is " +
        "of its period — 'twas, hallow'd, thou — and it renders names in the older forms Gilgamish and " +
        "Uta-Napishtim where a modern book writes Gilgamesh and Utnapishtim. And a great deal of clay " +
        "has been found since: Andrew George's edition of 2003 is fuller and more accurate, and is the " +
        "translation to buy if you want the current state of the text. What Thompson offers is a " +
        "complete, careful, public-domain rendering by a scholar working from the originals, and the " +
        "poem's power survives the archaisms easily.",
      "Two absences to explain. There is no facing Akkadian column here, and the reason is not that the original is unavailable but that it barely exists as a " +
        "settled text: what scholars work from is a transliteration pieced together from scattered " +
        "fragments, the piecing-together is itself modern scholarship, and every such edition is " +
        "either in copyright or licensed in a way this site cannot build on. And the Twelfth Tablet " +
        "does not continue the story — it is a partial translation of a separate Sumerian poem, " +
        "appended to the epic in antiquity, in which Enkidu is alive again and describes the " +
        "underworld. It contradicts the ending of the Eleventh Tablet, most modern editions print it " +
        "as an appendix for that reason, and it is included here because Thompson's edition includes " +
        "it and because it is genuinely part of what the ancient scribes handed down.",
    ],
  },

  "bhagavad-gita": {
    title: "The Bhagavad Gita",
    /* The edition's own title page reads "The Bhagavad-Gita" with the hyphen, which is where the
       `edition` string keeps it. The shelf drops it, that being the spelling a reader will type. */
    author: "Vyasa",
    /* THE ATTRIBUTION IS TRADITIONAL AND THE FRONT MATTER SAYS SO. Vyasa is the sage to whom Indian
       tradition ascribes the compilation of the Mahabharata, of which the Gita is a part, and both
       Wikisource's header and this edition name him. He is not an author in the sense Seneca or
       Machiavelli are, and a reader should be told so on the book's own page rather than left to
       find it out; what is NOT done is to quietly file one of the most famous books in the world
       under "Anonymous" against the naming of the edition it is taken from. */
    translator: "Annie Besant",
    edition:
      "The Bhagavad-Gita, with Samskrit text and English translation, 4th edition, " +
      "G. A. Natesan & Co., Madras, 1922",
    written: "c. 2nd century BCE – 2nd century CE",
    /* The Gita is dated by argument rather than by any statement of its own, and the range above is
       the conventional scholarly span for its composition. The sort key takes the middle of it. As
       with the Song of Roland and Gilgamesh, how loose the figure is is said on the book's page. */
    year: -50,

    /* ---------- THE LICENCE — two layers, and one of them needs a limit stated ----------
       The poem is ancient and free everywhere. The only modern layer is Besant's English.

       Annie Besant lived 1 October 1847 – 20 September 1933 — dates looked up on Wikidata rather
       than recalled, for the Hugo Magnus reason, that being the mistake this file exists not to
       repeat. Her translation first appeared in 1895 and this printing is the fourth edition of
       1922. So it is public domain in the United States, where a work published before 1929 has
       expired, and out of copyright wherever the term is the author's life plus seventy, which
       expired at the start of 2004.

       IT IS THEREFORE THE SIXTH BOOK HERE TO STATE A LIMIT AS WELL AS A GROUND, after the Art of
       War (Giles, 2029), the Nicomachean Ethics (Ross, 2042), the Song of Roland (both columns,
       2031 and 2039), the Medea (Murray, 2028) and Gilgamesh (Thompson, 2042): where the term is
       life plus a hundred it runs until the start of 2034.

       WHAT IS AND IS NOT TAKEN. The eighteen discourses, in both columns, with Besant's footnotes.
       G. A. Natesan's publisher's note of 1907 is left behind, as Thompson's preface, the Republic's
       added introduction and the Song of Roland's Chesterton essay were — it is quoted from in the
       front matter below, where it earns its place as evidence of what the edition was for, and is
       not reproduced as part of the book.

       THE SANSKRIT COLUMN NAMES NO EDITOR, AND THAT IS SAID RATHER THAN PAPERED OVER. The scan's
       index page leaves the Editor field empty; Natesan's note says only that he set out to print
       "the text in Devanagari" beside Besant's English. This is the received text of the poem, which
       is ancient and free on any reading, and no modern editor is credited anywhere in the volume —
       so none is asserted here. That is the Lucretius judgement in a second book: claim less, and
       put on the page what cannot be said.

       The modern translations a reader is likeliest to own are all firmly in copyright and are named
       so that nobody reaches for one later: Juan Mascaró's Penguin of 1962, Eknath Easwaran's of
       1985, Barbara Stoler Miller's of 1986 and Laurie Patton's Penguin of 2008. */
    rights:
      "Public domain, with one limit worth stating. The poem itself is some two thousand years old " +
      "and the Sanskrit has been free for as long as copyright has existed; the volume credits no " +
      "modern editor for it, and none is claimed here. The only modern layer is the translation: " +
      "Annie Besant lived from 1847 to 1933, her English version first appeared in 1895, and this is " +
      "the fourth edition, printed at Madras in 1922. It is therefore public domain in the United " +
      "States, where the term for a work published before 1929 has expired, and out of copyright " +
      "wherever the term is the author's life plus seventy years, which expired at the start of " +
      "2004. In the few countries where the term is life plus a hundred it remains in copyright " +
      "until 2034. The publisher's own note of 1907 is not reproduced here; what is taken is the " +
      "eighteen discourses and Besant's notes on them. (The modern translations by Juan Mascaró, " +
      "1962, Eknath Easwaran, 1985, Barbara Stoler Miller, 1986, and Laurie Patton, 2008, are still " +
      "in copyright and are not used here.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/Bhagavad-Gita_(Besant_4th)",

    /* ---------- THE SHAPE — the ninth layout, and the reasoning is above extractShloka ----------
       A facing-page edition transcribed as one interleaved column, like the Analects, but numbered
       on the ORIGINAL's side rather than the translation's — which is why it needed a reader of its
       own rather than `interleaved`. The short version: the Sanskrit carries a complete set of verse
       numerals and the English is missing eight of them, so the cut is made at the Sanskrit and the
       English numerals are used to check it.

       THE CHECK EARNED ITS KEEP ON THE SEVENTEENTH DISCOURSE, which is worth recording because it
       is the one place the two columns genuinely disagree rather than the English merely being
       damaged. Its printed English numerals run …17, 18, 20, 20, 21… — nineteen absent and twenty
       set twice — against a clean Sanskrit 1–28. Measured on the source page rather than inferred
       from the warning, which is what separates a printing slip from an off-by-one in this
       extractor: had the cut been wrong, every verse from 19 on would have disagreed, and instead
       the two columns re-agree at 21 and stay agreed to the end. So it is the 1922 printing that
       skips a number, the structural cut stands, and the reader is shown the Sanskrit's numbering,
       which is correct. Nothing is owed to the front matter here — unlike the Song of Roland's
       malformed laisse numerals, the figures a reader actually sees on this page are right.

       696 of the 701 printed English numerals agree with the place the Sanskrit puts them, and the
       five that do not are reported on every run, in two kinds. On 10.31, 11.8 and 18.32 the page
       prints no numeral at all. On 17.19 and 18.14 it prints the NEXT verse's, a numeral having been
       dropped and the sequence re-syncing immediately after by repeating the following one on its
       own verse; those two are removed, since this reader strips the printed numeral from all 701
       verses anyway and leaving them would set a figure beside a verse contradicting the number
       Folio shows. Measured over the whole book: those are the only five, and nothing else in the
       prose is touched, the rule being anchored to the end of a verse where a verse numeral sits.

       Both columns come out of ONE fetch of each discourse's page, so the original costs no extra
       requests, exactly as the Art of War's Chinese does. */
    layout: "shloka",
    page: (n) => "Bhagavad-Gita_(Besant_4th)/Discourse_" + n,
    chapters: Array.from({ length: 18 }, (_, i) => i + 1),
    chapterWord: "Discourse",
    /* NO `titleOf`, and no `indexPage`. This edition names its discourses in its own closing
       formula — "…the first discourse, entitled: THE DESPONDENCY OF ARJUNA." — and all eighteen
       carry one, checked before it was relied on. extractShloka reads them off the text, which makes
       this the second book here to take its titles from the text itself rather than from a contents
       page or from a table in this file, after Gilgamesh. The capitals are the printed page's; they
       are kept for the reason Aesop's are, that the case is unrecoverable and titleCase() is the
       thing that entry records trying and rejecting.

       One of the eighteen is misspelt on the page — the eighth reads "INDESCTRUCTIBLE" — and it is
       kept as printed. Transcribing a title means transcribing it; a silent correction to somebody
       else's page is the thing this file refuses to make, and it is recorded here so that it cannot
       later be mistaken for a fault in the import.

       No `parts`: the edition divides the poem into eighteen discourses and nothing above them, so
       the Contents panel falls back to a single unlabelled group, as the Meditations', the
       Republic's, the Art of War's, Aesop's, the Song of Roland's and Gilgamesh's do.

       The default `minChars` floor of 200 stands: a verse is a couplet and the shortest discourse
       here is the twelfth, at twenty verses, which is still thousands of characters of English. */

    original: {
      lang: "sa",
      langName: "Sanskrit",
      edition:
        "The Devanagari text as printed facing Besant's translation, G. A. Natesan & Co., Madras, 1922",
      rights:
        "Public domain. The Sanskrit of the Bhagavad Gita is some two thousand years old and is free " +
        "everywhere; this is the received text as the 1922 Madras edition prints it, and that volume " +
        "credits no modern editor for it.",
      sourceName: "Wikisource",
      sourceUrl: "https://en.wikisource.org/wiki/Bhagavad-Gita_(Besant_4th)",
    },

    /* ---------- THE FRONT MATTER — chapter 0 ----------
       What a reader needs before they start: what the book is and where it sits inside a far larger
       one; who Vyasa is and is not; what actually happens in it, since the setting is the whole
       difficulty; what it argues; this translation and who made it, which is a stranger story than
       most on this shelf; and last the two things a reader meets on the page itself — the Sanskrit
       column and the verse numbers. */
    about: [
      "<b>The Bhagavad Gita</b> — the Song of the Lord — is seven hundred verses of dialogue set on a " +
        "battlefield at the moment before the fighting starts. It is not quite a book in its own right " +
        "so much as an episode inside one: it sits in the sixth book of the <i>Mahabharata</i>, the " +
        "enormous Sanskrit epic of a war between two branches of a single royal family, and it is by a " +
        "wide margin the part of that epic which has been read, translated and argued over most. It " +
        "has been detached and printed on its own for centuries, which is how almost everyone meets " +
        "it, and how it is printed here.",
      "Tradition ascribes it, with the rest of the <i>Mahabharata</i>, to <b>Vyasa</b> — a sage who " +
        "appears inside the epic as a character as well as standing behind it as its author, and whose " +
        "name means something close to 'the compiler'. That attribution is why this book is shelved " +
        "under his name, and it should be taken for what it is. Scholars read the Gita as a composite " +
        "text assembled somewhere between the second century BCE and the second century CE, later " +
        "than much of the epic around it and probably not the work of a single hand. Nobody knows who " +
        "wrote it.",
      "The situation is the whole of the difficulty. Two armies are drawn up facing one another, and " +
        "Arjuna, the finest archer of his age, asks his charioteer to drive him into the open ground " +
        "between them so that he can see who he is about to fight. What he sees is his own family — " +
        "cousins, teachers, the grandfather who raised him. He puts down his bow and says he will not " +
        "do it: that no kingdom is worth this, and that he would sooner be killed unresisting. His " +
        "charioteer is Krishna, who is God, and the rest of the book is Krishna's answer. It is a " +
        "conversation between one man's refusal and the universe's reply, and it never leaves that " +
        "patch of ground between the armies.",
      "What Krishna offers is not one argument but several laid over each other, which is part of why " +
        "the book has been claimed by so many traditions since. He argues that the self is not the " +
        "body and cannot be killed; that a person's duty is their own and cannot be exchanged for " +
        "somebody else's, however much more attractive that other one looks; and that the way out of " +
        "the trap is not to stop acting but to stop acting <i>for what the action will get you</i> — " +
        "to do what is yours to do and let go of the fruits of it. Then, in the eleventh discourse, " +
        "the argument stops altogether and Arjuna is shown what he has been talking to, in a vision " +
        "of a form containing all worlds and all time that frightens him badly enough to beg for the " +
        "familiar face back.",
      "The translation is <b>Annie Besant's</b>, and her presence in this book is worth a word. An " +
        "Englishwoman born in 1847, she was in turn a clergyman's estranged wife, a secularist, a " +
        "birth-control campaigner prosecuted for it, a socialist organiser of the London matchgirls' " +
        "strike of 1888, and then — after 1889 — a Theosophist who moved to India, learned Sanskrit, " +
        "campaigned for Indian home rule and in 1917 was elected president of the Indian National " +
        "Congress. Her Gita first appeared in 1895. It is a devotional translation by someone who " +
        "believed the book, in a formal English that is a century old now, and it deliberately leaves " +
        "a good deal of the Sanskrit untranslated — <i>yoga</i>, <i>dharma</i>, <i>Brahman</i>, the " +
        "names of the three qualities — explaining each in her own footnotes as it arrives. There are " +
        "several hundred of those notes and they are part of what this edition is for.",
      "Two things about the page itself. The <b>Sanskrit is printed beside the English</b>, verse by " +
        "verse, because that is precisely what this edition was made to do: the publisher G. A. " +
        "Natesan wrote in 1907 that his ambition was to place a cheap edition of the Gita, with the " +
        "text in Devanagari and an English translation of the same, within reach of ordinary readers, " +
        "and Besant granted him the use of her translation for it. And the <b>verses are numbered</b> " +
        "— the figure between the double strokes ॥ in the Sanskrit, and the same number in the " +
        "English — which is the system every edition of the Gita in every language shares, so that " +
        "2.47, the most quoted line in the book, means the same passage here as anywhere else. This " +
        "edition numbers 701 verses where the traditional count is 700; the difference is one opening " +
        "verse of the thirteenth discourse which some recensions of the text carry and others do not.",
    ],
  },

  "aristophanes-lysistrata": {
    title: "Lysistrata",
    /* No subtitle, and deliberately not the Greek one. The three tragedies each carry their play's
       Greek title there because that is what their Greek COLUMN is an edition of; this book has no
       Greek column (see the licence and pairing notes below), so a Greek subtitle would advertise a
       second text that is not on the page. The volume's own half-title for the play is the single
       word, and that is what the shelf shows. */
    author: "Aristophanes",
    /* The volume names no translator. Wikisource credits "The Athenian Society", which is the body
       that printed it rather than a person, and that is the most this edition will honestly support
       — see the licence note on the Wilde attribution. */
    translator: "The Athenian Society",
    edition: "Aristophanes: The Eleven Comedies, Volume 1, printed for the Athenian Society, London, 1912",
    written: "411 BCE",
    year: -411,

    /* ---------- THE LICENCE — the simplest on the shelf, and for an unusual reason ----------
       Every other book here rests on a named person's death year as well as on a publication date,
       and four of them have to state a limit because of it (the Art of War to 2029, the Nicomachean
       Ethics to 2042, the Song of Roland to 2031/2039, the Medea to 2028). This one has no named
       translator at all. The volume was printed for the Athenian Society in London in 1912 and the
       translation is anonymous, so it is public domain in the United States under the pre-1929
       publication rule, and under the term an anonymous work gets — seventy years from publication —
       it has been free everywhere since 1983. The comedy underneath is some twenty-four centuries
       old. There is no limit to state and no death year to look up.

       THE WILDE ATTRIBUTION IS NOT REPEATED HERE, and that is a deliberate refusal rather than an
       oversight. Wikisource's own index page for the volume says the translations "are presumed to be
       the work of Oscar Wilde"; Wilde died in 1900, twelve years before the book appeared, and the
       Athenian Society was a private subscription press of exactly the kind that sold unexpurgated
       classics on the strength of a famous name. Nothing openable establishes it. Asserting it in the
       front matter would be the Hugo Magnus mistake with a better-known name attached — a biography
       taken on trust and then used to dress a book — so the book is shelved as anonymous, which is
       what the title page says, and the front matter tells the reader the attribution exists and that
       it is not supported. It changes nothing about the licence either way: an anonymous 1912 London
       printing is public domain on its date, and so is anything by a man who died in 1900.

       WHAT IS AND IS NOT TAKEN. The play and the translator's introduction to it, both from the same
       1912 volume. The volume's general Translator's Foreword and its list of authorities belong to
       the eleven comedies together rather than to this one, and are not imported — the Republic's
       precedent, where the 1901 printing's added introduction and plates were left behind.

       The translations a reader is likeliest to own — Dudley Fitts's of 1954, Douglass Parker's of
       1964, Alan Sommerstein's Penguin of 1973, Jeffrey Henderson's Loeb of 2000 and Sarah Ruden's of
       2003 — are all firmly in copyright, and are named here for the reason Campbell, Hays, Griffith,
       Lee, Humphries, Warner, de Sélincourt and the rest are named above: so that nobody reaches for
       one later. Benjamin Bickley Rogers's verse translation, which IS free (he died in 1919), is the
       one a scholar would expect to find here and is discussed under the pairing note below. */
    rights:
      "Public domain, and the shelf's simplest case. This translation was printed for the Athenian " +
      "Society in London in 1912 and published anonymously, so its United States copyright expired " +
      "under the pre-1929 publication rule, and under the seventy-years-from-publication term an " +
      "anonymous work is given it has been free everywhere since 1983 — there is no translator's " +
      "death year for it to depend on, and so no limit to state. Aristophanes staged the play in " +
      "Athens some twenty-four centuries ago. The volume is sometimes said to be the work of Oscar " +
      "Wilde; he died in 1900, twelve years before it appeared, nothing establishes the attribution, " +
      "and it is not relied on here. The volume's general foreword and its list of authorities belong " +
      "to all eleven comedies rather than to this one and are not reproduced; what is taken is the " +
      "play and the introduction printed with it. (The modern translations by Dudley Fitts, 1954, " +
      "Douglass Parker, 1964, Alan Sommerstein, 1973, Jeffrey Henderson, 2000, and Sarah Ruden, 2003, " +
      "are still in copyright and are not used here.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/Aristophanes:_The_Eleven_Comedies/Lysistrata",

    /* ---------- WHY THERE IS NO GREEK COLUMN: the Republic's answer, reached from the other side ----
       The rule this shelf pairs on is the one the Republic's entry states — not "does a text of the
       original exist?" but "does that text say which section each passage is?" — and for the first
       time the two halves of that question come apart in the opposite direction from usual.

       THE GREEK IS READY AND IS NOT THE PROBLEM. Hall and Geldart's Oxford text of 1907 sits on
       Perseus in the same TEI/CTS encoding the three tragedies' Greek comes from, and it is BETTER
       numbered than any of them: 1,443 <l> elements, every one carrying its line number, speeches
       marked as elements, and the play divided into fifty-six named divisions. It was fetched and
       measured before any of this was concluded.

       WHAT IS MISSING IS THE NUMBERS ON THE ENGLISH. This translation is prose and prints no line
       numbers anywhere — measured over the whole play, not assumed — so there is no key on which a
       row of one column could be set beside a row of the other. Pairing the nth speech with the nth
       was considered and refused for the reason the Seneca entry gives: it looks right on one screen
       and drifts thereafter. Here it would not even look right on one screen, and the measurement
       says so outright — this English divides the play into 634 speaker labels where the Greek
       carries 565 speeches, so the two columns disagree about where a speech begins some seventy
       times over before any question of drift arises.

       AND THE NUMBERED ENGLISH THAT EXISTS CANNOT BE USED, which is the Dialogues' rule biting a
       second time: ASK WHAT THE SOURCE IS MISSING BEFORE BUILDING ON IT. Benjamin Bickley Rogers's
       verse translation is the obvious answer — it is free (he died in 1919), it is the standard
       English Aristophanes, and it prints the Greek line numbers in its margin. Wikisource carries
       it, at "The Lysistrata (Rogers 1946)", and that transcription is barely begun: 52 of its scan
       leaves are untranscribed, which the rendered page shows as red "Page:…djvu/NNN" links exactly
       as the Jowett Dialogues did. Building on it would have shipped a fragment. Perseus carries no
       English Lysistrata at all — its own catalogue file for the work lists the Greek edition and
       nothing else — the Complete Greek Drama translation it once served being a 1938 work still in
       copyright. So the choice was this complete unnumbered English or no complete English, and the
       book ships in one column with the reason on its own front matter, exactly as the Republic does.
       The day a numbered transcription appears, an `original` block and an `origLang` are the whole
       of the work. */

    /* ---------- THE FRONT MATTER — chapter 0 ----------
       What a reader needs before they start: what happens and what the play is actually arguing,
       what Old Comedy is and how unlike a tragedy it is, when it was staged and against what, what
       this edition is and why it is the frank one, and — because the shelf's other three plays have
       a second column and this one does not — why the Greek is absent and what the tabs count. */
    about: [
      "<b>Lysistrata</b> was staged in Athens in 411 BCE, in the twenty-first year of a war Athens " +
        "was losing, and it is the most performed Greek comedy in the world. An Athenian woman named " +
        "Lysistrata calls the women of every Greek city to a meeting and puts a proposal to them: " +
        "until their husbands make peace, the women will refuse them. The younger women agree with " +
        "great reluctance and the older ones seize the Acropolis, where the treasury that pays for " +
        "the war is kept, so that the two halves of the plan squeeze the men from opposite " +
        "directions. What follows is a siege, a shouting match between a chorus of old men and a " +
        "chorus of women, a magistrate lectured on how to run a city as one would card wool, several " +
        "attempted desertions, one very long scene in which a wife torments her husband, and an " +
        "armistice.",
      "Underneath the farce there is a real argument, and it is put by the people least entitled to " +
        "make it in that city. Athenian women had no vote, no office and no standing to speak in " +
        "public; the joke of the play is that they take the city anyway, and the sting of it is that " +
        "they are obviously right. Lysistrata's case is that the war has been run by men who cannot " +
        "stop because stopping would mean admitting they were wrong, that the Greeks are destroying " +
        "one another while foreign powers watch, and that the people who bear the losses have no say " +
        "in whether they continue. None of that is undercut by the comedy around it. Whether the " +
        "play should be read as being about women at all, or whether they are a device for saying " +
        "something about the war that could not be said straight, is argued about still.",
      "It is an <i>Old Comedy</i>, and that is a different animal from tragedy. " +
        "A tragedy is set in the mythical past and keeps its distance; Old Comedy is set in the " +
        "audience's own city, names living people, insults the men sitting in the front rows, breaks " +
        "off in the middle so the chorus can address the audience directly about the poet's " +
        "grievances, and is obscene as a matter of course rather than by accident. The chorus here is " +
        "split in two — old men and old women, who spend the first half of the play fighting each " +
        "other — which is unusual and is the engine of several scenes. Characters from other Greek " +
        "cities speak in their own dialects, and the Spartans' broad Doric is a running joke that no " +
        "translation into English can carry without inventing an accent for them.",
      "The date is one of the few in Greek drama that is close to fixed: 411 BCE, the year of an " +
        "oligarchic coup at Athens, two years after the Sicilian expedition had destroyed a fleet and " +
        "an army and with the war twenty-one years old. Which of the two festivals it was staged at " +
        "is not recorded and is argued both ways. Aristophanes lived from about 446 to about 386 BCE " +
        "and wrote perhaps forty plays, of which eleven survive whole — far more than any other comic " +
        "poet of his time, and the only complete Old Comedies anyone has. He had been arguing for " +
        "peace on the Athenian stage since he was a young man, and had been prosecuted at least once " +
        "for what he put in a play.",
      "The translation here was printed for the Athenian Society in London in 1912 and its title page " +
        "claims to be the first complete and literal English version — which is the reason to use it " +
        "and the thing to know before starting. Nineteenth-century translators cut this play heavily " +
        "or buried what they could not print in Latin footnotes; this one does not, and a reader " +
        "expecting a decorous classic will be surprised in the first five minutes. It is anonymous. " +
        "The volume is sometimes attributed to Oscar Wilde, who died twelve years before it was " +
        "printed and whose authorship nothing establishes, so Folio shelves it as what it says it is. " +
        "The numbered notes are the translator's own.",
      "One thing this book has not got, and it is worth saying rather than leaving a reader to " +
        "wonder. This one has no Greek column beside the English, because this translation prints " +
        "no line numbers — and Folio pairs two texts on the numbers they share, never on the order of " +
        "their paragraphs, which looks right on one screen and drifts thereafter. The Greek exists " +
        "and is well numbered; the free English that carries line numbers, Benjamin Bickley Rogers's " +
        "verse of a century ago, has never been more than a quarter transcribed anywhere Folio can " +
        "reach. So the play is here in English alone. For the same reason the tabs count only what " +
        "this edition itself separates — its introduction and the play — since it divides the comedy " +
        "into no acts or scenes at all, and Folio does not invent divisions an edition has not got.",
    ],

    /* ---------- A PLAY FROM A WIKI PAGE: the tenth layout ----------
       See extractPlay for the reader and for what separates a speaker's line from a running head in
       this transcription. The whole work is on one page, so it is cut rather than walked — the Song
       of Roland's shape — and what it is cut at is the edition's own front matter, because the
       edition divides the play itself not at all. */
    layout: "play",
    onePage: "Aristophanes: The Eleven Comedies/Lysistrata",
    /* "Part" is Folio's own neutral word, as it is for the three tragedies: this edition numbers its
       divisions not at all, and an act is a later theatre's unit a Greek comedy has not got. */
    chapterWord: "Part",
    chapters: [1, 2],
    /* The cut points, each the whole text of a centred line the edition prints for itself. The
       introduction is the translator's own and is part of this edition of this play; the play proper
       opens on the cast list, which is where the second cut falls. */
    cuts: [
      { t: "Introduction", from: "INTRODUCTION" },
      { t: "Lysistrata", from: "DRAMATIS PERSONÆ" },
    ],
    /* The scan's running head and the play's half-title, which are not part of the text — matched on
       the block's WHOLE text and anchored, as dropHeads is everywhere else, so a word worth deleting
       in this edition cannot delete prose in another. Regexes, like every other book's: cleanBody
       reads this list too, where it strips a LEADING block only, and extractPlay reuses the same
       patterns for the four that stand mid-page. */
    dropHeads: [/^LYSISTRATA$/i],
  },

  "kalidasa-shakuntala": {
    title: "Sacontala",
    /* The edition's own title, spelling and all. "Shakuntala" is what a reader will type and what the
       shelf's search folds to, but the title page says Sacontala, and Jones's transliteration is not
       a mistake to be tidied away — it is how the heroine's name reached Europe, and the front matter
       explains it. The subtitle is the edition's too. */
    subtitle: "or, The Fatal Ring",
    author: "Kalidasa",
    translator: "William Jones",
    edition: "Sacontala; or, The Fatal Ring, reprinted from the translation of Sir William Jones, Charlton Tucker, London, 1870",
    /* Kalidasa is dated by argument alone — no document fixes him, and the range scholars work with
       runs across the Gupta period. The conventional placing is the 4th to 5th century CE and that is
       what is stated, with the doubt carried in the front matter rather than left to the `c.` to do
       on its own, as the Song of Roland's and Gilgamesh's entries do. The sort key takes the middle. */
    written: "c. 4th–5th century CE",
    year: 400,

    /* ---------- THE LICENCE — the shelf's easiest, and the only one clear by a full century ----------
       Three layers and not one of them is close.

       The play is some sixteen centuries old. William Jones lived 1746–1794 — dates read off
       Wikisource's own author page rather than recalled, for the Hugo Magnus reason — so his
       translation has been out of copyright on every term anyone applies for well over a century: it
       cleared life-plus-seventy in 1864 and life-plus-a-hundred in 1894. It was first published at
       Calcutta in 1789 and this is an 1870 London reprint of the third edition of 1792, so it clears
       the pre-1929 publication rule several times over. Wikisource's own tag on the work says public
       domain worldwide on the ground that the author died at least a hundred years ago.

       So there is NO LIMIT TO STATE, unlike the Art of War (Giles, 2029), the Nicomachean Ethics
       (Ross, 2042), the Song of Roland (2031 and 2039), the Medea (Murray, 2028), Gilgamesh
       (Thompson, 2042) and the Bhagavad Gita (Besant, 2034) — and no modern editorial layer either,
       unlike the Histories, the Antigone, the Oedipus Rex and the Meditations' Greek, whose Perseus
       texts carry a CC BY-SA revision on top of an expired copyright. It is simply free, everywhere,
       on every ground, and this transcription is a volunteer proofreading of a scan.

       WHAT IS AND IS NOT TAKEN. Jones's own preface, the prologue and the seven acts. The 1870
       printing's cast list is not imported as a chapter — it sits on the volume's contents page
       rather than on any of the nine transcribed subpages, and chapter 0 names the people who matter
       in prose written for a reader now, which is more use than a table of twenty names in Jones's
       transliteration. The printer's trade imprint at the foot of the last act is not text; see
       `dropTail`.

       The translations a reader is likeliest to meet — Arthur Ryder's of 1912, Michael Coulson's of
       1981, Chandra Rajan's of 1989, Barbara Stoler Miller's of 1984 and Somadeva Vasudeva's of 2006
       — are named here for the reason Campbell, Hays, Griffith, Lee, Humphries, Warner, Sayers and
       the rest are named above: so that nobody reaches for one later. Ryder's is itself free (he died
       in 1938, and it was published in 1912), and it is the one a scholar would expect to find here;
       why it is not is under the pairing note below. */
    rights:
      "Public domain worldwide, and the simplest licence on this shelf. Kalidasa wrote the play some " +
      "sixteen centuries ago. Sir William Jones lived from 1746 to 1794, so his translation cleared " +
      "the life-plus-seventy term in 1864 and the life-plus-a-hundred term in 1894 — there is no " +
      "limit anywhere that has not long since expired, and so, unlike the Art of War, the Nicomachean " +
      "Ethics, the Song of Roland, the Medea, Gilgamesh and the Bhagavad Gita, nothing here needs a " +
      "date stating. The translation was first published at Calcutta in 1789; this is an 1870 London " +
      "reprint of the third edition of 1792, published by Charlton Tucker, so it is also public " +
      "domain in the United States under the pre-1929 publication rule. Nothing in the text carries a " +
      "modern editorial layer: the transcription is a volunteer proofreading of the 1870 scan. What " +
      "is reproduced is Jones's preface, the prologue and the seven acts. (The later translations by " +
      "Arthur Ryder, 1912, Michael Coulson, 1981, Barbara Stoler Miller, 1984, Chandra Rajan, 1989, " +
      "and Somadeva Vasudeva, 2006, are not used here.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/Sacontala_(Jones_1870)",

    /* ---------- WHY THERE IS NO SANSKRIT COLUMN: three independent grounds ----------
       The rule this shelf pairs on is the Republic's — not "does a text of the original exist?" but
       "does that text say which section each passage is?" Here the answer is no three times over, and
       the three are worth keeping apart, because only the first is the usual one.

       ONE: THE ENGLISH STATES NO NUMBERS. Measured over the whole play rather than assumed — all nine
       pages fetched and swept — this transcription carries zero `wst-verse` spans, zero `<sup>`
       elements and not one standalone numeral. Jones set the play as continuous prose with the verses
       run in, and numbered nothing below the act. So the finest key both editions could share is the
       ACT, of which there are seven; a row would be a whole act, some four thousand words of English
       against a column of Sanskrit, and a reader would scroll a chapter to find the sentence facing
       them. That is not a pairing, it is two texts in the same table.

       TWO: THE TWO COLUMNS WOULD BE DIFFERENT RECENSIONS OF THE PLAY, which no other book here has had
       to weigh. Wikisource states outright that Jones translated the BENGALI recension; the standard
       printed Sanskrit, and what Sanskrit Wikisource carries, is Devanagari. These are not variant
       spellings of one text — they differ in whole verses and in readings, and which is the earlier is
       an argument that has run since Monier Williams claimed the Devanagari as the older and purer in
       the 1850s. Modern textual work counts four or five regional recensions rather than two. So even
       act by act the columns would be set beside passages that are genuinely not each other.

       THREE: THE SANSKRIT SOURCE NAMES NOTHING. The Sanskrit Wikisource text gives no editor, no
       edition, no publisher, no date and no recension — it is seven act subpages and a category. That
       is the Lucretius problem in a sharper form: there the Latin named no editor and the poem's age
       still carried the licence, whereas here nothing can honestly be said about WHICH text it is,
       which is the very question grounds one and two turn on. Naming a recension for it would be the
       Hugo Magnus mistake with a text instead of a man.

       AND THE NUMBERED ENGLISH THAT EXISTS CANNOT BE USED, which is the Dialogues' rule biting again:
       ask what the source is MISSING before building on it. Monier Williams's translation is the
       obvious answer — it is free (he died in 1899), it is the standard Victorian rendering, and it is
       made from the Devanagari recension the Sanskrit text carries. Wikisource's transcription of it,
       at Index:Sakoontala (Williams 1872).djvu, is barely begun: of roughly 300 leaves, five are
       proofread and the mainspace page does not exist at all. Building on it would have shipped a
       fragment, exactly as Wikisource's Jowett Dialogues and its Rogers Lysistrata would have. Ryder's
       1912 verse translation is not on Wikisource in any form — only his Little Clay Cart is — and
       Perseus, which carries the Greek and Latin originals for eleven books here, has no Sanskrit at
       all. So the choice was this complete English or no complete English, and the book ships in one
       column with the reason on its own front matter, as the Republic, Aesop and Lysistrata do. The
       day a numbered transcription of a Devanagari-based translation appears, an `original` block and
       an `origLang` are the whole of the work. */

    /* ---------- THE FRONT MATTER — chapter 0 ----------
       What a reader needs before starting: what happens, where the story comes from and what Kalidasa
       did to it, what a Sanskrit play IS and how unlike a Greek one it is, who Kalidasa was and how
       little is known, what this translation is and what it did to Europe — and, because it is a
       free eighteenth-century rendering with its author's attitudes in it, what to expect of it. */
    about: [
      "<b>Sacontala</b> — <i>Abhijñānaśākuntalam</i>, \"the recognition of Shakuntala\" — is the most " +
        "famous play in Sanskrit and the work by which Indian drama first became known outside India. " +
        "King Dushmanta, hunting in a forest, comes to a hermitage and falls in love with Sacontalá, " +
        "the foster-daughter of the sage who keeps it. They marry there, privately, by the form of " +
        "marriage that needs no ceremony but consent, and he returns to his capital leaving her his " +
        "ring. A visiting ascetic, slighted because she is too absorbed in her husband to notice him, " +
        "curses her: the man she is thinking of will forget her until he sees the token he gave her. " +
        "She loses the ring in a river on the way to court, and is disowned by a king who cannot " +
        "remember her. A fisherman finds it inside a fish. What follows is remorse, and a reunion " +
        "years later, in which the king meets a small boy prising open a lion cub's mouth to count its " +
        "teeth and slowly works out whose son he is.",
      "The story is not Kalidasa's. It is told in the <i>Mahabharata</i>, where Shakuntala is a much " +
        "harder figure: the king there simply denies her to her face, she argues him down in public, " +
        "and a voice from the sky settles it. The curse is Kalidasa's invention, and it changes the " +
        "whole moral weather of the piece — the king is no longer a man breaking his word but a man " +
        "who has had his memory taken from him, so that what the play is about becomes loss and " +
        "recognition rather than betrayal and vindication. Whether that is a deepening or an evasion " +
        "is one of the things people have argued about ever since; the son, Bharata, is in both " +
        "versions the ancestor after whom India is named in Sanskrit.",
      "It is worth knowing what a Sanskrit play is before starting, because it is not built like a " +
        "Greek one. It opens with a benediction and then a <i>prologue</i> in which the stage manager " +
        "and an actress step out and discuss the play they are about to perform — a convention Goethe " +
        "borrowed for <i>Faust</i>. There are seven acts and no scene divisions, the action moving " +
        "wherever the words say it is. Verse and prose alternate constantly, the verses carrying " +
        "description and feeling and the prose carrying business. In the original the characters do " +
        "not all speak the same language: the king and the sages speak Sanskrit, while the women and " +
        "the servants speak Prakrit, the vernaculars — a social register no translation into English " +
        "can show, and one this one does not attempt. And there is no tragedy in the Greek sense: the " +
        "form does not permit a disastrous ending, so the suspense is never about whether things will " +
        "come right but about what it costs to get there.",
      "Almost nothing is known about Kalidasa. He is the poet Sanskrit tradition puts first, the " +
        "author of two other surviving plays and of long poems including the <i>Meghaduta</i>, and no " +
        "document fixes his dates: he is placed by the language he writes, by whom he seems to know " +
        "and by whom seems to know him. The usual placing is the fourth or fifth century CE, at or " +
        "near the Gupta court, and estimates outside that range have been argued seriously. The " +
        "legends that grew up around him — that he began as an illiterate herdsman, that he was one of " +
        "nine jewels at a king's court — are legends, and are worth exactly as much as the stories " +
        "told about Homer.",
      "The translation is Sir William Jones's, made in Bengal and published at Calcutta in 1789, and " +
        "it is a historical document in its own right. Jones was a judge of the Supreme Court at Fort " +
        "William, the founder of the Asiatic Society, and the man who first argued in public that " +
        "Sanskrit, Greek and Latin had sprung from a common source — the proposal from which " +
        "comparative linguistics grew. His preface, which is the first chapter here, tells the story " +
        "of how he came to the play, and it is the reason the translation matters as much as the " +
        "quality of it. Georg Forster turned his English into German in 1791; Goethe read that and " +
        "wrote a four-line epigram in praise of it that became famous, Herder took the epigram as a " +
        "motto, and within a few years Schiller, the Schlegels and Humboldt had all had something to " +
        "say. Sanskrit literature entered Europe through this book.",
      "Two things to expect of it, since neither is a fault in the transcription. It is an " +
        "eighteenth-century translation and it reads like one — courtly, latinate, and free where a " +
        "modern version would be close; Jones softened what he thought his readers could not take, and " +
        "his preface carries the confidence about India, and the contempt for its conquerors, of an " +
        "Englishman writing in Bengal in 1789. It is printed here as he wrote it. And he worked from " +
        "the Bengali recension of the play, which is not the Sanskrit text usually printed today: the " +
        "play survives in several regional versions differing in whole verses, and which is closest to " +
        "Kalidasa is unsettled. That is also why this book has no Sanskrit column beside the English: " +
        "Folio pairs two texts on the numbers they share, " +
        "this translation prints none below the act, and the Sanskrit that is freely available is a " +
        "different recension whose edition names no editor at all. The tabs therefore count what this " +
        "edition itself separates: the preface, the prologue and the seven acts.",
    ],

    /* ---------- AN ORDINARY WIKI WALK ----------
       A page per division, like Seneca's letters and Aesop's fables, and no new reader at all: the
       play arrives as nine proofread transclusions in the ordinary `prp-pages-output` shape, so
       `cleanBody` reads it unchanged. It needs neither `layout: "play"` (which exists because
       Lysistrata is one page and has to be CUT) nor `layout: "drama"` (which is the Perseus TEI
       reader). The centred stage directions this edition sets become blockquotes under the generic
       div pass, which is the right rendering and not a fault — an indented centred line is what a
       stage direction looks like on a printed page. */
    source: "wiki",
    /* Folio's own neutral word, as for the four plays already here, and for a reason peculiar to this
       book: the edition numbers SOME of its divisions and not others. The seven acts carry numerals;
       the preface and the prologue do not, and both are part of what this volume prints. No single
       scheme can call all nine an act, so the running order is Part 1–9 and the tab titles carry the
       edition's own names. Aesop's rule again — state the order the book actually has rather than
       invent a structure it has not got. */
    chapterWord: "Part",
    page: (n) => "Sacontala (Jones 1870)/" + ["Preface", "Prologue", "Act 1", "Act 2", "Act 3",
                                              "Act 4", "Act 5", "Act 6", "Act 7"][n - 1],
    titleOf: (n) => ["Preface", "The Prologue", "Act I", "Act II", "Act III",
                     "Act IV", "Act V", "Act VI", "Act VII"][n - 1],
    chapters: Array.from({ length: 9 }, (_, i) => i + 1),
    /* No `indexPage`: titleOf carries the edition's own names, read off its contents page once. No
       `parts` either — Wikisource groups the nine as "Front matter" and "Acts of the Play" and says on
       its own page that neither heading is in the original, so adopting them would be presenting a
       modern editor's grouping as the edition's. Nine tabs need no grouping to be navigable, and
       app.js falls back to a single unlabelled group as it does for the Meditations and the Republic. */

    /* THE SCAN'S OWN HEADS, and this list is narrow ON PURPOSE. Every chapter opens on a centred block
       the printing sets for itself — "PREFACE.", "THE PROLOGUE.", "ACT I." — which by the time
       dropHeads runs has become a blockquote, so left alone each of the nine chapters would open on a
       quotation of the title Folio has just printed above it: the Meditations' running-head fault nine
       times over.

       What makes this book different from every other dropHeads here is that the centred block is
       ALSO how this edition sets its stage directions. "Scene—A Forest.", "Enter a Hermit and his
       Pupil.", "Mátali enters." are centred exactly as the act heads are, they immediately follow
       them, and they are the play. Aesop's rule — match anything wholly in capitals — would delete
       them; so would anything keyed on the block being centred. So the patterns name the three things
       the printing actually repeats and nothing else, and each is anchored at both ends. The loop
       peels leading blocks one at a time, so after "ACT I." goes it looks at "Scene—A Forest." next
       and correctly leaves it alone. */
    dropHeads: [/^PREFACE\s*\.?$/i, /^THE\s+PROLOGUE\s*\.?$/i, /^ACT\s+[IVX]+\s*\.?$/i],

    /* AND THE FURNITURE AT THE FOOT OF THE LAST ACT — the first book here to need it; see the note on
       dropTail in cleanBody. The seventh act ends with two more centred blocks: the printing's "THE
       END." and the trade imprint of the London printer who set the type. The imprint is plainly not
       Kalidasa, and "THE END." is the printer's furniture too — rendered as an indented quotation
       under the last line of the play it reads as a stray fragment of text rather than as a closing
       flourish, and the reader can see the chapter has ended. Both are named exactly rather than
       matched by shape, so nothing else can fall to them. */
    dropTail: [/^THE\s+END\s*\.?$/i, /^FOSTER,\s*OLD\s+STYLE\s+PRINTER,\s*LONDON\s*\.?$/i],

    /* No `sections`. There are no section numbers to find — see the pairing note above — so
       cleanBody's marker rules are all left off and the chapters render with no <span class="bk-n">
       at all, which is correct and not a wiring fault, exactly as for Aesop and Lysistrata.

       No `notesOf` work either: this printing carries NO footnotes anywhere, measured over all nine
       pages — zero reflist divs, zero Footnotes headings, zero reference marks. Jones annotated his
       first edition; this popular reprint drops the apparatus. So the book renders with no note fold,
       as Ovid, Lucretius, the Analects, the Oedipus Rex and the Antigone do. notesOf is still called
       and will warn if one ever appears. */
  },
  "beowulf": {
    title: "Beowulf",
    /* No subtitle. The poem is untitled in its manuscript — it is called Beowulf because Sharon
       Turner and the editors after him named it for its hero, and it has had no other name since. */
    author: "Anonymous",
    translator: "Francis Barton Gummere",
    edition: "The Oldest English Epic, translated by Francis Barton Gummere, Macmillan, New York, 1909",
    written: "c. 700–1000",
    /* THE DATE IS THE OPEN QUESTION OF THE FIELD and the shelf has to sort on one number anyway. The
       only certainty is the manuscript, written around the year 1000; when the poem behind it was
       composed has been argued from its language, its metre and its politics for two centuries, and
       the answers run from the early eighth century to the very decade of the copy. 700 is the early
       end of that range and is what the sort uses; the front matter says how loose it is, exactly as
       the Song of Roland's does. */
    year: 700,

    /* ---------- THE LICENCE — three layers, and only the third needs care ----------
       The poem is Old English and about a thousand years old, so it is free everywhere and on every
       ground. Gummere's translation was published in 1909 and he lived 1855–1919 — dates taken from
       Wikidata and matching the Wikisource author page's own PD-old tag, checked rather than recalled
       for the Hugo Magnus reason — so it is public domain in the United States under the pre-1929
       rule, cleared life plus seventy in 1990, and has cleared life plus a hundred as well. No limit
       to state, which puts it with the Republic, the Analects and the Peloponnesian War rather than
       with Giles (2029) or Ross (2042).

       THE ONE THING THAT CANNOT BE SAID IS WYATT'S DEATH YEAR, and it is said so rather than rounded
       up — the Gallic War's judgement, where half a byline could not be found. Wikidata gives Alfred
       John Wyatt as 1835–1935 at YEAR precision, a suspiciously round hundred years, and the
       Wikisource author page carries no dates and no public-domain tag for him at all where
       Gummere's carries PD-old. He was certainly alive in 1919, having published An Anglo-Saxon
       Reader that year. So no life-plus-seventy term is asserted for his edition; the ground stated
       is the date of publication, 1894, which is long before 1929 and which anybody can check. If
       the 1935 death is right then life plus seventy expired in 2006 and life plus a hundred runs to
       2036, and that conditional is on the book's own page rather than smoothed into a flat claim.

       WHAT IS AND IS NOT TAKEN. Only Beowulf. Gummere's 1909 volume also carries his translations of
       Finnsburg, Waldere, Deor, Widsith and the German Hildebrand, and a long introduction; Wyatt's
       carries a preface, an argument, a glossary and the Finnsburg fragment. None of that is
       imported, which is the Republic's precedent for the introduction and plates it left behind.

       The modern translations a reader is likeliest to own — Seamus Heaney's of 1999, J. R. R.
       Tolkien's prose version published in 2014, Roy Liuzza's of 2000, Michael Alexander's Penguin
       and Maria Dahvana Headley's of 2020 — are all firmly in copyright and are named here for the
       reason Campbell, Hays, Griffith, Lee, Sayers and the rest are named above: so that nobody
       reaches for one later. */
    rights:
      "Public domain, with one thing this site cannot establish and says so rather than guess. The " +
      "poem is Old English and about a thousand years old, so it is free everywhere. Francis Barton " +
      "Gummere's translation was published in 1909 and he lived from 1855 to 1919, so it is public " +
      "domain in the United States under the pre-1929 publication rule and out of copyright wherever " +
      "the term is the author's life plus seventy or even a hundred years — there is no limit to " +
      "state. The facing Old English is Alfred John Wyatt's edition of 1894, which is public domain " +
      "in the United States on the same pre-1929 ground; his dates are given elsewhere as 1835 to " +
      "1935 but only to the year and without corroboration, so no life-plus-seventy term is claimed " +
      "for it here, and if that death year is right the term expired in 2006. Gummere's volume also " +
      "contains Finnsburg, Waldere, Deor, Widsith and Hildebrand, and Wyatt's a glossary and the " +
      "Finnsburg fragment; none of that is reproduced here, and what is taken is the poem. (The " +
      "modern translations by Seamus Heaney, 1999, Roy Liuzza, 2000, J. R. R. Tolkien, published " +
      "2014, and Maria Dahvana Headley, 2020, are still in copyright and are not used.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/The_Oldest_English_Epic/Chapter_1",

    /* ---------- THE FRONT MATTER — chapter 0 ----------
       What a reader needs before they start: that this is one burnt manuscript and not a tradition;
       what the poem is about and what shape it has; how the metre works, because the translation
       keeps it and a reader who does not know what to listen for will hear only strangeness; the one
       date anything in it can be pinned to; why it is not about England; and finally what this
       edition is and how the two columns here are paired. */
    about: [
      "<b>Beowulf</b> is the longest and greatest poem to survive in Old English, and one of the " +
        "strangest survivals in European literature. It runs to <b>3,182</b> lines of alliterative " +
        "verse and it tells of a Geatish warrior who crosses the sea to help the Danish king Hrothgar, " +
        "whose hall Heorot has been emptied for twelve years by a night-walking creature called " +
        "Grendel; of how he kills Grendel bare-handed and then Grendel's mother in her lair beneath a " +
        "mere; and of how, fifty years later and an old king himself, he goes out against a dragon " +
        "that his own people's stolen cup has woken, kills it, and dies of the wound. It is a poem " +
        "about courage and about what courage cannot prevent.",
      "Everything we have of it is <b>one manuscript</b>, and it very nearly burned. Beowulf survives " +
        "in a single copy, written out by two scribes around the year 1000 and now British Library " +
        "Cotton MS Vitellius A.xv — the Nowell Codex. In 1731 a fire in Ashburnham House, where Sir " +
        "Robert Cotton's library was then kept, scorched the volume badly; the leaves were rescued but " +
        "their edges went on crumbling for decades afterwards, taking words with them. What saved " +
        "those readings was that the Icelandic scholar Grímur Jónsson Thorkelin had two transcripts " +
        "made in 1786–87, before the worst of the loss, and published the first printed edition in " +
        "1815. Every edition since, this one included, reads the burnt margins partly through his " +
        "copyists' eyes. There is no second manuscript, no earlier version and no other witness: had " +
        "the fire been an hour worse we would know the poem only as a title.",
      "The verse is built on stress and alliteration rather than on rhyme, and Gummere's translation " +
        "keeps that, which is why it reads as it does. An Old English line is two half-lines divided " +
        "by a pause — the <i>caesura</i>, shown here as a gap in both columns — with two stressed " +
        "syllables in each half, and the line is bound together by having the stresses begin with the " +
        "same sound. Nothing rhymes. The poet also names things by compounding rather than by " +
        "describing them: the sea is the whale-road, a king is a ring-giver, the body is the " +
        "bone-house. Those compounds are called <b>kennings</b>, and a poem thick with them is doing " +
        "something a modern narrative does not — it is naming the world twice over, so that a listener " +
        "hears both the thing and a judgement about it.",
      "It is set in Scandinavia and it is not about England at all. Hrothgar's Denmark and Beowulf's " +
        "Geatland, in what is now southern Sweden, are the whole geography of the poem, and it was " +
        "written in England, in English, by a Christian poet looking back at the pagan ancestors of " +
        "his own people. That doubleness runs through it: the narrator knows the characters are " +
        "heathen and says so with sorrow, while the characters themselves speak of a single God and " +
        "of fate in the same breath. One thing in it can be dated from outside. Beowulf's lord " +
        "Hygelac dies raiding the Frisians, and Gregory of Tours records that raid — a Danish king he " +
        "calls Chlochilaicus, killed on an expedition into Frankish territory early in the sixth " +
        "century. It is the single peg fastening this poem to recorded history, and everything else " +
        "in it floats free of any chronicle.",
      "For a long time it was read as a quarry rather than as a poem. Nineteenth-century scholarship " +
        "went to Beowulf for what it could yield about Germanic antiquity, the historical kings, the " +
        "old religion, and treated the monsters as childish material cluttering a valuable document. " +
        "That was turned over in 1936 by <b>J. R. R. Tolkien</b>, in a British Academy lecture called " +
        "<i>Beowulf: The Monsters and the Critics</i>, which argued that the monsters are the point — " +
        "that the poet put them at the centre deliberately, because a poem about a man against " +
        "Grendel and the dragon is a poem about a man against death, which is what it is for. Almost " +
        "everything written about Beowulf since begins from that lecture, whether it agrees with it " +
        "or not.",
      "The poem's divisions are the scribes' own, and they are odd in a way this edition preserves. " +
        "The manuscript breaks the text into numbered sections — <i>fitts</i> — a prologue and then " +
        "forty-three of them, and those are the chapters here. There is <b>no fitt numbered XXX</b>: " +
        "the numbering runs to XXVIII, then to an unnumbered section that editors supply as [XXIX], " +
        "and then straight on to XXXI. Nothing is missing, and the line numbers prove it — Wyatt's " +
        "XXVIII ends at 2038, the bracketed section runs 2039–2143, and XXXI takes up at 2144. So the " +
        "chapter numbers on these tabs carry the same gap the manuscript carries, rather than being " +
        "renumbered tidily into a sequence the poem does not have.",
      "This edition is Francis Barton Gummere's, published by Macmillan in 1909 in a volume called " +
        "<i>The Oldest English Epic</i>. He translates line for line and keeps the alliteration and " +
        "the four-stress measure, which almost nobody attempts, and the result is deliberately " +
        "archaic and much closer to the movement of the original than a smoother version would be. " +
        "Beside it is the Old English itself, in A. J. Wyatt's edition of 1894 for Cambridge, made " +
        "from Zupitza's photographic facsimile of the burnt manuscript. The two are paired on the " +
        "<b>line number</b>, printed in the margin of both every fifth line, which is how any passage " +
        "of Beowulf is cited in any language — so a reader can put a phrase of the translation " +
        "against the words it renders rather than against the page it sits on. They agree on " +
        "<b>636</b> such markers apiece across an identical range. Where Gummere runs his XXVIII " +
        "across the whole of Wyatt's XXVIII and [XXIX], the Old English of both is gathered into the " +
        "one chapter; and the two editions divide once at a different line, at 1740, so that single " +
        "block stands alone in one column. Six marginal numerals are misprinted in one edition or the " +
        "other and each is read as the place the sequence puts it, since every one is followed " +
        "immediately by a correct number.",
    ],

    /* ---------- ONE PAGE PER FITT, PAIRED ON THE LINE ----------
       The ordinary wiki walk on both sides; what is new is that the chapter and the pairing unit are
       two different things — see the FITTS block above extractFitt for the measurements. */
    source: "wiki",
    layout: "fitts",
    chapterWord: "Fitt",
    /* The manuscript's own numbering, gap and all: a prologue counted as 0, then I–XXVIII, then
       XXXI–XLIII. There is no 30 anywhere in either edition. */
    chapters: [0].concat(
      Array.from({ length: 43 }, (_, i) => i + 1).filter((n) => n !== 29 && n !== 30)
    ),
    page: (n) => "The Oldest English Epic/Chapter 1/Beowulf " + String(n).padStart(2, "0"),
    /* Chapter 0 is the poem's unnumbered opening, which both editions head "Prelude" — a title
       transcribed rather than composed. The rest have no names in either edition: Wyatt's contents
       page gives a Roman numeral and a line range and nothing else, so the tabs read "Fitt 1" and so
       on, which is the whole of what the editions state about them. Composing forty-two descriptive
       headings for a poet who gave none is the line the Meditations' entry draws. */
    titleOf: (n) => (n === 0 ? "Prelude" : "Fitt " + n),
    /* No `parts`: neither edition divides the poem above the fitt — no books, cantos or parts in
       either — so app.js falls back to a single unlabelled group, as the Meditations, the Republic
       and the Song of Roland do. The familiar "two halves" of Beowulf, Denmark and the dragon, is a
       reader's description and not a heading anybody printed.

       The short-chapter guard is lowered as Aesop's and the Song of Roland's are, and for the same
       reason: 200 characters is a broken chapter only where a chapter is a book of Herodotus. The
       shortest fitt here is the nineteen-line XLIII — measured over all 85 cached pages, not
       assumed — whose English is 780 characters and whose Old English is 700. 400 sits well below
       both and far above what a failed extraction produces, which is a handful of characters. */
    minChars: 400,

    original: {
      lang: "ang",
      langName: "Old English",
      edition: "Beowulf, edited by A. J. Wyatt, Cambridge University Press, 1894",
      rights:
        "The poem is Old English and about a thousand years old, so the words themselves are free " +
        "everywhere. This text is A. J. Wyatt's edition of 1894, made from Julius Zupitza's " +
        "photographic facsimile of the burnt manuscript, and it is public domain in the United " +
        "States under the pre-1929 publication rule. Wyatt's dates are given elsewhere as 1835 to " +
        "1935, but only to the year and without corroboration, so no life-plus-seventy term is " +
        "asserted here; if that death year is right, the term expired in 2006. Wyatt's glossary, " +
        "preface and the Finnsburg fragment printed with it are not reproduced — what is taken is " +
        "the poem.",
      sourceName: "Wikisource",
      sourceUrl: "https://en.wikisource.org/wiki/Beowulf_(Wyatt)",
      layout: "fitts",
      page: (n) => "Beowulf (Wyatt)/Beowulf " + String(n).padStart(2, "0"),
      /* Wyatt divides where the manuscript does and so carries a section Gummere does not break at:
         the bracketed [XXIX], lines 2039–2143, which Gummere runs on inside his XXVIII. It is
         FOLDED INTO CHAPTER 28 here so the two columns divide alike — the alternative is a chapter
         tab with an original and no translation, which is worse than a long chapter. Measured after
         folding: 36 line markers on each side of that chapter, 1965 to 2140. */
      foldInto: { 29: 28 },
    },
  },

  "classic-of-poetry": {
    title: "The Classic of Poetry",
    subtitle: "The Shih King",
    author: "Anonymous",
    translator: "James Legge",
    edition:
      "The Sacred Books of the East, Vol. III: The Sacred Books of China, Part I, " +
      "Clarendon Press, Oxford, 1879",
    written: "c. 11th–7th century BCE",

    /* ---------- THE LICENCE, which needs no qualification at all ----------
       Legge published this translation in 1879 — before 1929, so its United States copyright has
       expired — and died in 1897, so it is out of copyright wherever the term runs for the author's
       life plus seventy or even a hundred years. There is no limit to state and no modern editorial
       layer to declare. The Chinese printed beside it is some twenty-five centuries old and is free
       everywhere.

       The translations a reader is likeliest to own are all still in copyright and are named here so
       that nobody reaches for one later: Bernhard Karlgren's of 1950, Ezra Pound's of 1954, Arthur
       Waley's as reissued and extended by Joseph R. Allen in 1996, and Xu Yuanchong's of 1993. */
    rights:
      "Public domain worldwide. James Legge published this translation in 1879 — before 1929, so its " +
      "United States copyright has expired — and he died in 1897, so it is out of copyright wherever " +
      "the term runs for the author's life plus seventy or even a hundred years. The Chinese text " +
      "printed beside it is some twenty-five centuries old and is in the public domain everywhere. " +
      "(The modern translations by Bernhard Karlgren, 1950, Ezra Pound, 1954, Xu Yuanchong, 1993, and " +
      "Arthur Waley as extended by Joseph R. Allen, 1996, are still in copyright and are not used here.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/Sacred_Books_of_the_East/Volume_3/The_Shih",

    /* THE FRONT MATTER — chapter 0. The first thing it has to say is the thing a reader would
       otherwise discover by counting: this is a THIRD of the Classic of Poetry, because Legge's
       Sacred Books volume prints the pieces bearing on religion and not the collection entire. A book
       that let a reader assume otherwise would be lying by omission, so it is said in the first
       sentence rather than in a footnote. */
    about: [
      "<b>The Classic of Poetry</b> — the <i>Shih</i>, also called the Book of Songs or the Book of " +
        "Odes — is the oldest collection of Chinese poetry, three hundred and five poems gathered " +
        "between roughly the 11th and the 7th centuries BCE. They are short, they are built almost " +
        "entirely of four-character lines, and they are far more various than their standing as a " +
        "Confucian classic suggests: courtship and complaint, harvest and soldiering, dynastic praise " +
        "and sacrificial hymn, sitting side by side in one book. The collection is divided into four " +
        "traditional parts, and this edition keeps them: the airs of the states, the minor odes, the " +
        "major odes, and the hymns of temple and altar.",
      "<b>What is here is a third of it.</b> This text comes from Legge's Sacred Books of the East " +
        "volume of 1879, which prints not the whole collection but the poems bearing on religion — " +
        "the sacrifices, the ancestral cult, the mandate of Heaven, the dynastic hymns. It carries " +
        "102 of the 305 poems, and of those 102 about a third are not whole poems but the stanzas " +
        "Legge judged relevant, which is why so many chapters here are titled 'Stanza 1' or 'Stanzas " +
        "1 and 2'. Where a chapter says so, the English is that much of the poem and no more. Legge " +
        "did translate the whole collection, twice over, and neither of those versions has been " +
        "transcribed anywhere this could honestly be built from.",
      "The numbers on the tabs are the Mao numbers, the sequence 1 to 305 by which any poem of the " +
        "Shih is cited in any language, and they run with gaps — 13, 15, 29, 40 and so on — because " +
        "the poems Legge left out are simply absent. Renumbering what remains from 1 to 102 would " +
        "have made the book look complete and would have invented a sequence it has not got, so the " +
        "gaps are left where they fall. A reader who wants to know which poem is missing between two " +
        "tabs has the number to look it up by.",
      "James Legge was a Scottish missionary who spent three decades in Malacca and Hong Kong and " +
        "became the first Professor of Chinese at Oxford in 1876. His English is Victorian and his " +
        "purpose was scholarly rather than poetic: he renders the sense line by line and does not try " +
        "to reproduce the rhyme or the four-beat measure of the original, so what is faithful about " +
        "these versions is the meaning and not the music. He also read the poems largely as the " +
        "orthodox commentarial tradition read them, which routinely takes a love song as a political " +
        "allegory about a virtuous consort or a neglected minister; his titles and his section " +
        "headings carry that reading. Modern scholarship mostly does not. Read them as one careful " +
        "man's account rather than as what the Chinese says.",
      "There is no Chinese column here, and the reason is worth stating rather than leaving a reader " +
        "to wonder. The poems themselves are freely available and each of these 102 was found, so the " +
        "two could be set side by side; what is not available is a transcription uniform enough to " +
        "trust. The pages that carry the Chinese also carry a traditional preface explaining what each " +
        "poem is supposed to be about, and a body of annotation beneath it, and they set the verse " +
        "three different ways from one poem to the next. A column built from them would sometimes be " +
        "the poem and sometimes the commentator, with nothing on the page to say which — and a facing " +
        "text that is silently wrong is worse than none at all.",
      "Legge's own notes are here under each chapter, and they are worth opening: much of what he has " +
        "to say about who is speaking, and about the rites a hymn accompanies, is in them rather than " +
        "in the verse itself.",
    ],

    /* ---------- ONE ODE, ONE CHAPTER ----------
       This edition gives each ode a wiki page of its own, so the ordinary chapter walk reads it with
       no new extractor: `page` maps a Mao number to that page and cleanBody does the rest. What the
       book does need is a SECTION MARKER, because app.js pairs the two columns on `bk-n` and a
       chapter carrying none pairs only by the accident of both sides holding exactly one unnumbered
       block. `sections: "whole"` writes exactly one marker at the head of the chapter, carrying the
       Mao number — which is the citation a reader would use anyway, so it earns its place on the page
       rather than being scaffolding that happens to show. */
    layout: "wiki",
    sections: "whole",
    page: (n) => "Sacred Books of the East/Volume 3/The Shih/" + SHIJING_BY_MAO[n][1],
    chapters: SHIJING.map((r) => r[0]),
    chapterWord: "Ode",
    titleOf: (n) => SHIJING_BY_MAO[n][2],
    /* The four traditional divisions, as the Contents panel's groups. They partition the Mao numbers
       this edition carries without overlapping, so a range apiece is enough and no ode can fall into
       two of them. */
    parts: [
      { n: 1, from: 1, to: 160, t: "Lessons from the States" },
      { n: 2, from: 161, to: 234, t: "The Minor Odes of the Kingdom" },
      { n: 3, from: 235, to: 265, t: "The Major Odes of the Kingdom" },
      { n: 4, from: 266, to: 305, t: "Odes of the Temple and the Altar" },
    ],

    /* ---------- WHY THERE IS NO FACING ORIGINAL, AND WHAT A LATER ATTEMPT MUST HANDLE ----------
       The pairing itself is not the problem and was measured: every one of these 102 odes names its
       Chinese title on its own page, Chinese Wikisource gives each of those poems a page, and all 102
       were found there — with one glyph to normalise, Legge's 鳧鷖 against that wiki's 鳬鷖, two forms
       of the same character. The Mao number derived from the traditional order is the same number on
       both sides, so the two columns would pair one poem against one poem.

       What stopped it is that those pages are not a transcription of a printed edition and are not
       uniform. Each carries a good deal that is NOT the poem — the 毛詩序, the Mao preface, which is a
       commentator's account of what the poem is about, and a 註解 section of annotations — and the
       verse itself is set three different ways across the 102: inside `<div class="poem">`, inside a
       flat `<dl>` of `<dd>` lines, and inside nested `<dl><dd>` under no heading at all, with the
       title merely bolded. A rule that reads one shape returns nineteen characters of another, and a
       rule that takes the block whole returns the commentator instead of the poet. Both failures are
       the quiet kind: the column is full, nothing throws, and only reading the Chinese shows it.

       Two further traps are recorded so they are not rediscovered. Textual VARIANTS are marked as
       tooltips beside the character they replace, so the raw text of a three-stanza poem can run to
       ten times its length with every variant landing mid-line. And FOUR of these titles belong to
       two different poems each — 柏舟 (Mao 26 and 45), 黃鳥 (131 and 187), 杕杜 (119 and 169), 甫田
       (102 and 211), the Shih repeating titles across the states — and this wiki puts both poems on
       one page, so the block has to be chosen by the section its heading names (國風‧邶‧柏舟 against
       國風‧鄘‧柏舟) and never by the title. Taking the first would set an entirely different poem
       beside the translation, and nothing downstream could tell.

       So the book ships in English alone and its front matter says so, which is the same judgement
       the Republic's entry records: a second column that cannot be paired responsibly is worse than
       no second column. Deleting `original` and `origLang` is the whole of what that costs. */
  },

  "book-of-documents": {
    title: "The Book of Documents",
    subtitle: "The Shû King",
    author: "Anonymous",
    translator: "James Legge",
    edition:
      "The Sacred Books of the East, Vol. III: The Sacred Books of China, Part I, " +
      "Clarendon Press, Oxford, 1879",
    written: "c. 11th–4th century BCE",

    /* ---------- THE LICENCE, which needs no qualification at all ----------
       Legge published this translation in 1879 — before 1929, so its United States copyright has
       expired — and died in 1897, so it is out of copyright wherever the term runs for the author's
       life plus seventy or even a hundred years. There is no limit to state and no modern editorial
       layer to declare: this is his printed text, not a re-edited one. The Chinese underneath is
       ancient and free everywhere.

       The translations a reader is likeliest to reach for are still in copyright and are named here
       so that nobody does: Bernhard Karlgren's of 1950 and Clae Waltham's modernisation of Legge,
       published in 1971. */
    rights:
      "Public domain worldwide. James Legge published this translation in 1879 — before 1929, so its " +
      "United States copyright has expired — and he died in 1897, so it is out of copyright wherever " +
      "the term runs for the author's life plus seventy or even a hundred years. The documents " +
      "themselves are ancient and are in the public domain everywhere. (Bernhard Karlgren's " +
      "translation of 1950 and Clae Waltham's modernisation of Legge of 1971 are still in copyright " +
      "and are not used here.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/Sacred_Books_of_the_East/Volume_3/The_Shu",

    /* THE FRONT MATTER — chapter 0. Two things have to be said early because a reader would
       otherwise have to work them out by counting: that this is the whole of the received text, and
       that a good part of that text has been held to be a forgery for three hundred years. */
    about: [
      "<b>The Book of Documents</b> — the <i>Shû</i>, also called the Shû King or the Classic of " +
        "History — is the oldest collection of Chinese prose, and it is not a history but an archive: " +
        "speeches, charges, announcements, counsels and oaths, purporting to be the words of rulers " +
        "and ministers from the legendary sage-kings down to the middle of the Kâu dynasty. Much of " +
        "it is somebody addressing an army on the morning of a battle, or a regent explaining to a " +
        "young king why a dynasty lost the mandate of Heaven. It is one of the Five Classics, and for " +
        "two thousand years it was the text a Chinese statesman was expected to argue from.",
      "<b>What is here is the whole of the received text.</b> Legge's Sacred Books of the East volume " +
        "of 1879 prints the Shû entire, in the fifty-eight documents the tradition has transmitted, " +
        "arranged in five parts named for the houses they belong to — Thang, Yü, Hsiâ, Shang and Kâu. " +
        "The tabs count fifty-nine rather than fifty-eight, and the difference is a matter of " +
        "printing rather than of content: Legge sets the Tribute of Yü, which is the longest single " +
        "document in the book, in two sections that each number their paragraphs from one, so it is " +
        "left as the two he printed rather than joined into a chapter carrying two paragraphs " +
        "numbered 1.",
      "<b>A quarter of it is disputed, and has been since the seventeenth century.</b> The Shû was " +
        "reassembled after the burning of the books under the Kh in, and it survives in two layers. " +
        "Thirty-three of the documents descend from the version recovered in the second century BCE " +
        "and are broadly accepted as genuinely ancient, though how ancient is argued over. The other " +
        "twenty-five appeared only in the fourth century CE, and Chinese scholars from the 1600s " +
        "onwards demonstrated that they are a later composition — the classic case of a forgery " +
        "exposed by philology. Legge knew this and says so: where a document is one of the contested " +
        "ones his headnote to it tells you, and his introduction sets out the whole history of the " +
        "text. The disputed books are still worth reading, and they are still what Chinese readers " +
        "read for fifteen centuries; they are simply not what they claim to be.",
      "Each document opens with Legge's own headnote, set smaller than the text — who is speaking, " +
        "when, what the occasion was, and what he makes of its authenticity. The numbers running " +
        "through the text are his paragraph numbers, which is how a passage of the Shû is cited in " +
        "his edition, and his footnotes are gathered under each chapter. Eleven of the shorter " +
        "documents carry no numbers at all, because they are a few paragraphs long and he did not " +
        "number them.",
      "James Legge was a Scottish missionary who spent three decades in Malacca and Hong Kong and " +
        "became the first Professor of Chinese at Oxford in 1876. His English is Victorian and " +
        "deliberately literal: he is rendering the sense of a famously difficult text, sometimes the " +
        "most difficult in the classical language, and where the Chinese is obscure his version is " +
        "obscure too. The round brackets scattered through it are his — words he has supplied to make " +
        "an elliptical sentence run in English, marked so that you can see him doing it. That is a " +
        "scholar's honesty rather than a stylist's, and it is the reason this translation is still " +
        "cited.",
      "There is no Chinese column here, and the reason is worth stating rather than leaving a reader " +
        "to wonder. The Chinese text is freely available and every one of these documents was found; " +
        "what is missing is a shared way of pointing INTO them. Legge numbers his paragraphs and the " +
        "Chinese transcription numbers nothing, so the only way to set the two side by side would be " +
        "to pair them off in order and hope — and measured document by document, the paragraph " +
        "divisions of the two agree in eight cases out of fifty-eight. A facing text built that way " +
        "would be quietly wrong on nine pages in ten, with nothing on the page to say so, which is " +
        "worse than no facing text at all.",
    ],

    /* ---------- ONE DOCUMENT, ONE CHAPTER ----------
       The ordinary wiki walk, with one thing new: `page` may return SEVERAL pages for one chapter.
       Where Legge prints a book in sections, Wikisource puts each section on its own page and leaves
       the book's headnote — and, at the head of a Part, his introduction to the whole Part — on the
       book's page, which carries no body text. Those four pages are joined onto the front of their
       first section rather than dropped, and they carry no footnotes at all (measured), so the join
       needs no note arithmetic even though the loop does it anyway. */
    layout: "wiki",
    sections: "shu",
    dropAuxToc: true,
    page: (n) => SHU_BY_N[n][2].map((s) => "Sacred Books of the East/Volume 3/The Shu/" + s),
    chapters: SHU.map((r) => r[0]),
    chapterWord: "Document",
    titleOf: (n) => SHU_BY_N[n][3],
    parts: [
      { n: 1, from: 1, to: 1, t: "The Book of Thang" },
      { n: 2, from: 2, to: 5, t: "The Books of Yü" },
      { n: 3, from: 6, to: 10, t: "The Books of Hsiâ" },
      { n: 4, from: 11, to: 27, t: "The Books of Shang" },
      { n: 5, from: 28, to: 59, t: "The Books of Kâu" },
    ],

    /* THE RUNNING HEADS, read off the pages rather than guessed at — every centred block that opens
       a page was inventoried before this list was written. Four shapes occur: the volume's own title
       over the first page, a Part heading over the first book of each Part, the book's title over
       every book, and a bare "Section N." over each section page. The Canon of Yâo needs a line of
       its own because it is the only book in its Part and its title is printed without the "Book I."
       that prefixes all fifty-seven others.

       The patterns tolerate stray spaces because they must: these heads are set in small capitals,
       which arrives as a run of spans, and flattening one yields "THE SH Û KIN G ." rather than the
       words. Anchored at the start and tested against the block's whole text, as every dropHeads
       list is, so none of them can reach prose. */
    dropHeads: [
      /^THE\s*SH[ÛU]\s*KIN\s*G\s*\.?$/i,
      /^PART\s+[IVX]+\s*\.\s/i,
      /^Book\s+[IVXLC]+\s*\.\s/i,
      /^Section\s+\d+\s*\.?$/i,
      /^The\s+Canon\s+of\s+Yâo\s*\.?$/i,
    ],

    /* ---------- WHY THERE IS NO FACING ORIGINAL, AND WHAT A LATER ATTEMPT MUST HANDLE ----------
       The chapter-level pairing is exact and was measured: Chinese Wikisource gives every one of the
       received fifty-eight documents a page of its own under 尚書, and all fifty-eight were found,
       with the four books Legge divides into three sections appearing there as three separate
       documents apiece — which is right, since those ARE three documents in the Chinese, where the
       Tribute of Yü's two sections are one.

       What there is no shared key for is the level BELOW the chapter, and that is what app.js pairs
       on. Legge numbers his paragraphs; the Chinese transcription carries no numbering whatever, not
       a paragraph number and not a traditional 章 division. So the only available pairing is by
       position, which is the approach this file has already tried and abandoned once — and here it
       is not close: measured document by document, Legge's numbered paragraphs and the Chinese
       page's paragraphs agree in count on EIGHT of the fifty-eight. Fifty of them would be silently
       mispaired, and a facing text that is wrong with nothing on the page to say so is worse than
       none.

       Pairing at the CHAPTER level instead — one marker at the head, both columns as a single block
       — was considered and rejected on the reader's behalf rather than on the numbers: several of
       these documents run to many screens, and setting one whole column-page beside another makes a
       facing page that cannot be read across.

       Three traps are recorded so a later attempt does not rediscover them. The Chinese pages carry
       TEXTUAL VARIANTS as tooltips beside the character they replace — 19 in the Canon of Yâo, 44 in
       the Marquis of Lü on Punishments, 69 in the Tribute of Yü — which land mid-line in the raw
       text. The index at 尚書 mixes the received text with the TSINGHUA BAMBOO-SLIP documents
       (保訓, 尹至, 耆夜, 厚父, 封許之命, 尹誥 and three headed 傅說之命), which are excavated
       manuscripts rather than chapters of the Shû and must not be taken for them, and with 逸周書/世俘,
       which belongs to a different book altogether. And the received text's own titles are
       unambiguous, so a chapter list keyed on them is safe — but it has to be written out, since the
       page order on that index is not Legge's. */
  },

  "book-of-rites": {
    title: "The Book of Rites",
    subtitle: "The Lî Kî",
    author: "Anonymous",
    translator: "James Legge",
    edition:
      "The Sacred Books of the East, Vol. XXVII: The Texts of Confucianism, Part III, " +
      "Clarendon Press, Oxford, 1885",
    written: "c. 3rd–1st century BCE",

    /* ---------- THE LICENCE, which needs no qualification at all ----------
       Legge's fourth appearance on this shelf and his third easy one. He published this translation
       in 1885 — before 1929, so its United States copyright has expired — and died in 1897, so it is
       out of copyright wherever the term runs for the author's life plus seventy or even a hundred
       years. No limit to state, as Giles (2029) and Ross (2042) need, and no modern editorial layer
       to declare, as the Histories and the Meditations' Greek carry: this is his printed text.

       The translations a reader is likeliest to meet are still in copyright and are named here so
       nobody reaches for one: Séraphin Couvreur's French of 1913 is free, but the standard modern
       English of the two chapters that later became separate classics — Wing-tsit Chan's of 1963 and
       Daniel Gardner's — are not, and neither is the complete Chinese-English Lî Kî published in the
       Library of Chinese Classics in 2001. */
    rights:
      "Public domain worldwide. James Legge published this translation in 1885 — before 1929, so its " +
      "United States copyright has expired — and he died in 1897, so it is out of copyright wherever " +
      "the term runs for the author's life plus seventy or even a hundred years. The treatises " +
      "themselves are ancient and are in the public domain everywhere. (Wing-tsit Chan's translations " +
      "of 1963 and the Library of Chinese Classics edition of 2001 are still in copyright and are not " +
      "used here.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/Sacred_Books_of_the_East/Volume_27",

    /* THE FRONT MATTER — chapter 0. Two things have to be said before a reader starts counting tabs:
       what the book is, and that ten of its forty-six treatises are here and thirty-six are not. */
    about: [
      "<b>The Book of Rites</b> — the <i>Lî Kî</i>, also called the Classic of Rites — is not one " +
        "book but a collection of forty-six treatises on ceremony and conduct, assembled under the " +
        "Han dynasty out of much older material. It is the most miscellaneous of the Five Classics " +
        "and much the most human: beside the court ritual and the sacrificial calendar there is a " +
        "father teaching a son how to carry a jar of water, rules for how to behave at somebody " +
        "else's funeral, what to do with the seeds when the ruler gives you a peach, and a set of " +
        "monthly ordinances telling a government what to do in each month of the year. Ritual here " +
        "is not ceremony as opposed to real life; it is the whole of how people are supposed to " +
        "treat one another, and the book argues that a society is held together by it.",
      "<b>Ten of the forty-six treatises are here, and thirty-six are not.</b> Legge published his " +
        "translation in two volumes of the Sacred Books of the East in 1885, Books I to X in the " +
        "first and Books XI to XLVI in the second, and only the first volume has been transcribed. " +
        "That volume is complete: every one of its ten books is here entire, with Legge's own " +
        "footnotes and his section and paragraph numbering. The ten are also the long ones — they " +
        "fill four hundred and twenty pages of a volume that runs to four hundred and eighty, and " +
        "the thirty-six that remain fill a companion volume of much the same size — so what is here " +
        "is nearer half the work than the fifth that ten out of forty-six suggests. It is still not " +
        "the whole, and among the missing are two treatises that later left this collection " +
        "altogether to become classics in their own right: the Great Learning and the Doctrine of " +
        "the Mean, Books XXXIX and XXVIII. The Record on Education and the Record of Music are also " +
        "in the second volume. If a transcription of it ever appears, the rest of the book can be " +
        "added without disturbing anything here, because the tabs are numbered as Legge numbers " +
        "them.",
      "<b>How it is divided, and why the numbers start again.</b> Each book is cut into Sections, " +
        "and the longer books cut each Section again into Parts; the paragraph numbers run from one " +
        "within each of those, which is why the small figures in the margin restart several times in " +
        "a single tab. That is exactly what the printed page does, and it is how the work is cited — " +
        "a passage of the Lî Kî is given as its book, its section, its part and its paragraph. The " +
        "headings are set in their own line so the reader can see where each count begins again. In " +
        "Book I, and only there, Legge also groups the paragraphs into numbered chapters and prints " +
        "the chapter number in front of the first paragraph of each, so its openings read \"1. 1.\", " +
        "\"2. 2.\", \"3. 3.\", \"4. 6.\" — the chapter first and then the paragraph.",
      "Legge's footnotes are gathered under each book, and they are worth opening. The notes on the " +
        "section headings are not references at all but his own summaries of what the section " +
        "contains, and elsewhere he argues with the Chinese commentators, marks a passage he thinks " +
        "corrupt, or says plainly that he cannot make sense of a sentence. Book II ends with an " +
        "appendix he prints from a paper of 1853 on Chinese mourning and inheritance; its six plates " +
        "of mourning charts are not part of the transcription, so the tables it refers to are absent " +
        "while the argument around them is here.",
      "James Legge was a Scottish missionary who spent three decades in Malacca and Hong Kong and " +
        "became the first Professor of Chinese at Oxford in 1876. His English is Victorian and " +
        "deliberately literal, and the round brackets scattered through it are his — words he has " +
        "supplied to make an elliptical sentence run in English, marked so that you can see him " +
        "doing it. He also spells Chinese in a romanisation of his own that nobody uses now, so " +
        "Confucius is <i>Khung-jze</i> and the Kâu dynasty is the one usually written Zhou. There is " +
        "a letter in it that no ordinary alphabet has, a blackletter Z standing for a sound his " +
        "system distinguishes; the transcription writes it four different ways and it is written one " +
        "way here.",
      "There is no Chinese column, and the reason is the one that keeps the Book of Documents from " +
        "having one. The Chinese text is freely available and every one of these ten treatises was " +
        "found; what is missing is a shared way of pointing into them. Legge numbers his paragraphs " +
        "and the Chinese transcription numbers nothing at all, so the only way to set the two side " +
        "by side would be to pair them off in order and hope — and the two divide their prose quite " +
        "differently, one book of thirty-five Chinese paragraphs facing fifty-seven of Legge's. A " +
        "facing text built that way would be quietly wrong on most of its pages, with nothing to " +
        "say so.",
    ],

    /* ---------- ONE TREATISE, ONE CHAPTER ----------
       The ordinary wiki walk: one page per book, one book per tab. The chapters are long — Book II
       is 155,000 characters — which is within the precedent the Prose Edda set at 173,000 and is
       chosen for the same reason it was there: the tab is the unit the work is CITED by. "Lî Kî II"
       is the Than Kung; "Lî Kî II.i.iii" is a passage in it. Cutting at the Section instead would
       give forty-six tabs whose numbering runs clean, and would name none of them anything a reader
       is looking for. */
    layout: "wiki",
    sections: "liki",
    /* THE MOURNING CHARTS, taken by the handle the Republic's plates are taken by. Legge closes Book
       II's appendix with six tables of mourning degrees, printed on leaves bound in outside the
       pagination — so Wikisource labels each of them `data-page-number="table"` rather than giving it
       a number, and the structural rule written for the Republic's engraved plates removes them
       without knowing anything about what is on them. Measured across all ten books first: eight
       unnumbered leaves, every one of them in Book II, and every other page of the volume numbered.

       They are worth removing rather than keeping. Three of the six were never transcribed at all and
       arrive as Wikisource's own message box — "A table should appear at this position in the text.
       See Help:Table" — which the tag stripper would unwrap into the middle of Legge's prose as
       though he had written it. The other three ARE transcribed, and a table run through a stripper
       that has no rows is a column of nouns with every relation between them gone: "Mother's
       Grand-parents Mother's Sister. Mother's Parents. Mother's Brother." tells a reader nothing the
       chart told them. And the caption of the first is unproofread OCR — "( t>y a Man /ttr hit
       Kmamtn and Kiimpomtn." for "by a Man for his Kinsmen and Kinswomen" — which is the one thing a
       library must not ship as somebody's book. The front matter says the charts are absent. */
    dropUnnumberedPages: true,
    /* One printed letter written four ways by this transcription — see applyGlyphs, which is where
       the count and the reasoning are. Two of the four are astral-plane characters that most devices
       have no font for. */
    glyphs: [["\u{1D585}", "З"], ["\u{1D59F}", "з"], ["ℨ", "З"]],
    page: (n) => "Sacred Books of the East/Volume 27/The Lî Kî/Book " + LIKI_BY_N[n][1],
    chapters: LIKI.map((r) => r[0]),
    chapterWord: "Book",
    titleOf: (n) => LIKI_BY_N[n][2],

    /* ---------- WHY THERE IS NO FACING ORIGINAL ----------
       The same answer as the Book of Documents', reached the same way and rather more decisively.
       Chinese Wikisource carries every one of these ten treatises under 禮記 — Legge's Book I is
       曲禮上 and 曲禮下, his Book II is 檀弓上 and 檀弓下, and his Books III to X are one pian
       apiece — so the CHAPTER-level pairing exists. What does not exist is the level below it, which
       is what app.js pairs on: those pages carry no numbering whatever, not a paragraph number and
       not a traditional 章 division, so the only available key is position.

       Position does not work here, and it is not close. Measured page against page: Legge's Lî Yun
       runs to fifty-seven numbered paragraphs against thirty-five on the Chinese page, his Nêi Zeh
       to sixty-four against twenty, his Wang Kih to fifty against fifty-six. The two are dividing
       the same prose on different principles, and pairing them off in order would set most of the
       book beside passages that are not its counterpart — the approach this file has already tried
       and abandoned once, for the Meditations' Greek.

       One trap is recorded so a later attempt does not rediscover it. The index at 禮記 carries
       several pages TWICE under simplified and traditional titles — 大传 beside 大傳, 少仪 beside
       少儀, 杂记上 beside 雜記上 — so a chapter list built by reading that index rather than by
       naming the ten pian wanted will pick up duplicates of books it already has. */
  },

  "prose-edda": {
    title: "The Prose Edda",
    /* No subtitle. It is also called the Younger Edda and Snorri's Edda, and both are said in the
       front matter; putting one on the banner would pick a side in a naming quarrel the book itself
       does not have. */
    author: "Snorri Sturluson",
    translator: "Arthur Gilchrist Brodeur",
    edition:
      "The Prose Edda, translated by Arthur Gilchrist Brodeur, " +
      "The American-Scandinavian Foundation, New York, 1916",
    written: "c. 1220",
    /* Snorri lived 1179–1241 and the Edda is dated to about 1220 on the usual grounds — it is later
       than the poems it quotes and earlier than the manuscripts that carry it. One number, as the
       shelf's sort requires; the front matter says how loose it is. */
    year: 1220,

    /* ---------- THE LICENCE — three layers, and the third states a LIMIT ----------
       The work itself is free everywhere: Snorri Sturluson died in 1241, and the poems he quotes are
       older still.

       Brodeur's translation was published in 1916 by the American-Scandinavian Foundation — read off
       the volume's own title page rather than recalled — which is before 1929, so its United States
       copyright has expired and that is the ground this book is served on. He lived 1888–1971; the
       dates are Wikidata's at day precision and are corroborated by Wikisource's own PD/US tag on the
       work, which gives 1971, so unlike Wyatt's on the Beowulf shelf they are not a lone unverified
       figure. Life plus seventy therefore runs to the end of 2041, and this stays in copyright in
       those countries until 2042 — the same position as Ross's Nicomachean Ethics, and it is SAID
       OUTRIGHT here and on the book's own page rather than smoothed into the easier sentence the
       Republic and the Analects can honestly use.

       WHAT IS AND IS NOT TAKEN. The 1916 volume also carries Brodeur's own introduction, which runs
       to some fifty pages, and an index; neither is imported, which is the Republic's precedent for
       the introduction and plates it left behind. What is taken is the three parts of the Edda the
       volume translates.

       The translations a reader is likeliest to own — Jean I. Young's of 1954, Anthony Faulkes's
       Everyman of 1987 and Jesse Byock's Penguin of 2005 — are all firmly in copyright and are named
       here for the reason Campbell, Hays, Griffith, Lee, Sayers and the rest are named above: so that
       nobody reaches for one later. */
    rights:
      "Public domain in the United States, with a limit to state elsewhere. Snorri Sturluson died in " +
      "1241, so the work itself is free everywhere. Arthur Gilchrist Brodeur's translation was " +
      "published in 1916 — before 1929, so its United States copyright has expired — but he lived " +
      "from 1888 to 1971, so where the term runs for the author's life plus seventy years it stays " +
      "in copyright until 2042. Brodeur's own introduction and index are not reproduced here; what " +
      "is taken is the three parts of the Edda his volume translates. There is no Old Norse column, " +
      "and the reason is a copyright one rather than a textual one — see the front matter. (The " +
      "translations by Jean I. Young, 1954, Anthony Faulkes, 1987, and Jesse Byock, 2005, are still " +
      "in copyright and are not used here.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/The_Prose_Edda_(Brodeur_1916)",

    /* ---------- THE FRONT MATTER — chapter 0 ----------
       Four things a reader needs before they start, and none of them is guessable from the page: that
       this is a textbook rather than a scripture, and what that does to it; that its author was a
       Christian politician writing about gods he did not believe in; that the tabs are three where
       the work has four parts; and why there is no Old Norse beside it, which on this shelf is the
       question a reader is entitled to ask. */
    about: [
      "<b>The Prose Edda</b> — called also the Younger Edda, or simply Snorri's Edda — is the single " +
        "most important source for Norse mythology, and it is worth knowing from the first page that " +
        "it was not written to be one. It is a <b>handbook for poets</b>. Icelandic court poetry, " +
        "skaldic verse, is built out of <i>kennings</i>: compressed riddling substitutions in which " +
        "gold is Sif's hair, a ship is the sea-king's horse, and poetry itself is the dwarves' drink. " +
        "A kenning only works if you know the story behind it, and by about 1220 the stories were " +
        "going. So Snorri set down the myths in plain prose, as background a young poet would need, " +
        "and in doing so preserved a body of Germanic myth that would otherwise have survived only in " +
        "fragments. Nearly everything a modern reader knows about Odin, Thor, Loki and Ragnarök comes " +
        "through this book.",
      "Its author was not a bard but a <b>politician</b>. Snorri Sturluson, 1179–1241, was one of the " +
        "richest and most powerful men in Iceland, twice law-speaker of its assembly, a chieftain " +
        "deep in the feuds that ended the Icelandic commonwealth, and finally a man killed in his own " +
        "cellar by his son-in-law's men on the orders of the king of Norway. He was also a Christian, " +
        "writing more than two centuries after Iceland's conversion, about gods nobody around him " +
        "worshipped.",
      "That last fact shapes the book, and the reader should watch for it. Snorri has to explain why " +
        "a Christian may write down heathen myth at all, and his answer is <b>euhemerism</b> — the " +
        "theory that the gods were once ordinary men, remembered as divine by people who had lost the " +
        "true faith. The Prologue accordingly derives the Æsir from Troy and walks Odin northward " +
        "across Europe as a migrating king, and the frame of Gylfaginning has the whole mythology " +
        "narrated to a deceived visitor by figures who turn out to be illusions. It is a defence, and " +
        "it lets him tell the stories straight; but it means the book is <b>a Christian's account of " +
        "a religion he did not hold</b>, at two hundred years' distance. Where he seems to tidy a " +
        "myth into a neat system, that is worth remembering.",
      "The work has <b>four parts, and this edition carries three</b>. After the Prologue come " +
        "<i>Gylfaginning</i>, the Beguiling of Gylfi, which is the narrative mythology and the part " +
        "most people mean when they say they have read the Prose Edda; and <i>Skáldskaparmál</i>, the " +
        "Poesy of Skalds, which explains the kennings and in doing so tells a great many more stories " +
        "— the mead of poetry, Thor and Hrungnir, Idunn's apples, and the whole tragedy of Sigurd and " +
        "the Niflungs that lies behind the Nibelungenlied and Wagner's Ring. The fourth part is " +
        "<i>Háttatal</i>, a poem of Snorri's own in praise of two Norwegian rulers, composed in a " +
        "hundred-odd metres to demonstrate each of them in turn. It is the most technical part of the " +
        "book and the least translatable, and Brodeur did not translate it: the 1916 volume's own " +
        "contents page lists the Prologue, Gylfaginning and Skáldskaparmál and stops. So the tabs " +
        "here count three, and what is missing is missing from the edition rather than from the file.",
      "The numbers running through the text are <b>chapter numbers</b>, and they are how the Edda is " +
        "cited in any language: a reference to Gylfaginning 49 means the chapter numbered 49 in the " +
        "second tab, which is the death of Baldr. Because each part is one continuous piece here, " +
        "those numbers appear as the section marks inside it rather than as tabs of their own — which " +
        "keeps a citation meaning what it means everywhere else. One numeral is missing and is " +
        "missing from the printed page: the Prologue's first chapter opens under a drop-capital with " +
        "no number over it, and the centred numerals begin at II, so the marks in that tab run from " +
        "II rather than from I. Brodeur's Skáldskaparmál brackets its chapter XXI, and the square " +
        "brackets there are his: he uses them through that part for passages he judged probably not " +
        "Snorri's. His footnotes are gathered under each chapter.",
      "<b>There is no Old Norse column here, and the reason is a copyright one rather than a textual " +
        "one.</b> That is worth saying plainly, because on this shelf the older language is usually " +
        "the easier half to serve. The Old Norse of the Edda is nearly eight hundred years old and " +
        "free everywhere; the difficulty is that a medieval text has to be edited from its " +
        "manuscripts before anyone can read it, and an editor's constituted text is a modern work " +
        "with a modern copyright. The Old Norse Edda that is openly transcribed is Guðni Jónsson's, " +
        "and he died in 1974, so his edition is in copyright where the term is life plus seventy " +
        "until 2044 — and it is carried on Wikisource by the permission of the site that holds it " +
        "rather than because the copyright has run out, which is not the ground this library serves " +
        "books on. An older edition would be free, but none is transcribed anywhere reachable.",
      "The loss is worth measuring rather than waving at, because the pairing would have been an " +
        "unusually good one. Set against Brodeur, that Old Norse text divides the Prologue into the " +
        "same five chapters and Gylfaginning into the same fifty-four, in the same order, with the " +
        "content matching at every point checked — as exact as anything on these shelves. " +
        "Skáldskaparmál is the exception and would have failed anyway: the two number it differently, " +
        "seventy-four chapters against eighty-nine, drifting apart as they go, so pairing them by " +
        "number would have set passages beside passages that are not their counterparts. So one part " +
        "could never have been faced, and the other two could have been, and the reason they are not " +
        "is a licence rather than a text.",
      "Brodeur's English is a hundred years old and deliberately a little archaic — he is translating " +
        "a work about poetry and keeps a poet's cadence — but it is a scholar's translation, made at " +
        "the University of California by a man who spent his career on Old Norse, and it is close. " +
        "The verse quotations are the hardest thing in the book: Snorri quotes skaldic stanzas as " +
        "evidence, often several to a chapter, and skaldic verse is dense, inverted and packed with " +
        "the very kennings under discussion. Brodeur renders them line for line and lets them stay " +
        "difficult. They are meant to be read as exhibits rather than as lyrics, and a reader who " +
        "finds one impenetrable is having the intended experience of a twelfth-century apprentice.",
    ],

    /* ---------- ONE PART, ONE CHAPTER ----------
       The ordinary wiki walk: three pages, three chapters. What is new is `sections: "edda"` — the
       numbers inside each part are Roman and are set two different ways; see markEddaSections.

       WHY THE PART AND NOT THE NUMBERED CHAPTER IS THE TAB. The obvious alternative is 133 tabs, one
       per numbered chapter, grouped by `parts` the way Seneca's letters and the Shû's documents are.
       It was rejected on the citation: each of the three parts restarts its numbering at 1, so a
       single run of tabs would have to renumber them into one sequence, and "Gylfaginning 44" would
       become tab 50. Keeping the part as the chapter keeps every numeral on the page meaning what it
       means in every edition and every reference book. The cost is three long chapters, and it is
       within precedent rather than at it: measured, this book's longest is about 173,000 characters
       against 199,000 for the longest book of Herodotus already on the shelf. */
    layout: "wiki",
    sections: "edda",
    /* Snorri quotes skaldic stanzas as evidence and this transcription sets them as `<dl><dd>` lines
       — see the verse pass in cleanBody. Without this they arrive as run-on prose, which on a book
       arguing about how verse lines are built is the one thing that must not happen. */
    verse: "dl",
    chapters: [1, 2, 3],
    chapterWord: "Part",
    page: (n) =>
      "The Prose Edda (1916 translation by Arthur Gilchrist Brodeur)/" +
      ["Prologue", "Gylfaginning", "Skáldskaparmál"][n - 1],
    titleOf: (n) => ["Prologue", "Gylfaginning", "Skáldskaparmál"][n - 1],
    /* No `parts`: three chapters need no grouping above them, and the work's own divisions ARE the
       three chapters. app.js falls back to a single unlabelled group, as the Meditations and the Song
       of Roland do. */

    /* THE PART TITLE ONLY. Each page opens with two centred blocks: the part's own name, which by the
       time it is seen is a blockquote and which duplicates the tab directly above it, and then the
       text's own rubric — "HERE BEGINS THE BEGUILING OF GYLFI", "THE POESY OF SKALDS". The second is
       Snorri's heading rather than the printer's and is KEPT, and it has to be: Skáldskaparmál's
       carries a FOOTNOTE MARKER, so dropping it would leave a note in the list with no sentence
       opening it — the fault Beowulf's dropFittHead rule exists to avoid, met from the other side.
       Matched on the block's whole text and anchored, as every dropHeads list is. */
    dropHeads: [/^PROLOGUE$/, /^GYLFAGINNING$/, /^SKÁLDSKAPARMÁL$/],

    /* ---------- WHAT A LATER ATTEMPT AT AN ORIGINAL MUST HANDLE ----------
       Recorded so the measurement does not have to be made twice. The Old Norse on Icelandic
       Wikisource (`is:Snorra Edda`, four part pages plus the Nafnaþulur and Skáldatal appendices)
       states its chapter numbers outright and titles each one, so the key exists and is easy to read:
       every chapter opens `<b>N. Title.</b>`. Measured against Brodeur, the Prologue divides 5 to 5
       and Gylfaginning 54 to 54, in order, with the Icelandic chapter titles describing Brodeur's
       chapter content at every point sampled across the whole of both. Skáldskaparmál does not pair:
       74 against 89, already apart by chapter 20 and about sixteen apart by the end, because the two
       editions divide the kenning-lists differently — so that part would draw beside the wrong
       passages and must not be paired by number.

       WHAT BLOCKS IT IS THE LICENCE. That text is Guðni Jónsson's edition, 1901–1974, taken onto the
       wiki from heimskringla.no by permission rather than under an expired copyright, and life plus
       seventy runs to 2044. An edition whose copyright HAS expired would serve — Finnur Jónsson's,
       1858–1934, or the Arnamagnæan edition of 1848–87 — and none of them is transcribed on any
       Wikisource, on Perseus, or anywhere else reachable; checked on the multilingual, Danish,
       Norwegian, German and Swedish Wikisources, of which only the German has anything, and that is
       Simrock's German verse translation of 1876 rather than the Old Norse. So this is a LICENCE gap
       and not a textual one, which puts it with the Loeb Republic that keeps Plato's Republic out of
       the Dialogues rather than with the Republic's own missing Stephanus numbers. If an expired
       edition is ever transcribed, `original` needs only the Prologue and Gylfaginning; and a chapter
       the original does not carry must be left out of it rather than supplied empty, which is what
       app.js's greyed language control is for. */
  },

  "poetic-edda": {
    title: "The Poetic Edda",
    /* No subtitle. It is also called the Elder Edda and the Sæmundar Edda, and both are said in the
       front matter; putting either on the banner would assert a name the book itself never had —
       the second of them being an attribution modern scholarship rejects outright. */
    author: "Anonymous",
    translator: "Henry Adams Bellows",
    edition:
      "The Poetic Edda, translated by Henry Adams Bellows, " +
      "The American-Scandinavian Foundation, New York, 1923",
    written: "c. 900–1250",
    /* THE DATE IS THIRTY-FIVE OPEN QUESTIONS RATHER THAN ONE, which is worse than the usual case: a
       collection is only as datable as its parts, and these were composed by different people over
       something like three centuries. The one fixed point is the manuscript, written in Iceland
       around 1270. 900 is the early end of the range the poems are argued into and is what the sort
       uses; the front matter carries the doubt rather than leaving the `c.` to do all the work. */
    year: 900,

    /* ---------- THE LICENCE — three layers, and the third states a limit ----------
       The poems are anonymous, medieval and free everywhere on every ground.

       Bellows's translation was published in 1923 by the American-Scandinavian Foundation — read off
       the volume's own title page rather than recalled — which is before 1929, so its United States
       copyright has expired. He lived 1885–1939, and those dates are unusually well corroborated for
       this shelf: Wikidata carries both at DAY precision, and Wikisource's own PD/US tag on the work
       independently gives 1939, so this is not the lone unverified figure some translators here come
       down to. Life plus seventy therefore expired at the start of 2010 and this is public domain in
       those countries too.

       WHAT IS LEFT TO STATE is life plus a hundred, which runs to the start of 2040 — Mexico is the
       jurisdiction that matters — so a limit is stated outright rather than smoothed into the easier
       sentence some books here can honestly use. It is a much smaller limit than a life-plus-seventy
       one and it is still a limit.

       WHAT IS AND IS NOT TAKEN. The 1923 volume also carries Bellows's General Introduction, some
       thirty pages on the manuscript and the metres, and a Pronouncing Index of the proper names;
       neither is imported. What is taken is the thirty-five poems and the headnote and footnotes
       belonging to each, which are bound to the text rather than standing in front of the whole
       book.

       The translations a reader is likeliest to own — Lee M. Hollander's of 1928 and its revisions,
       Carolyne Larrington's Oxford of 1996 and Jackson Crawford's of 2015 — are all firmly in
       copyright and are named here so that nobody reaches for one later. */
    rights:
      "Public domain in the United States and in life-plus-seventy countries, with one limit left to " +
      "state. The poems are anonymous and medieval, so the work itself is free everywhere. Henry " +
      "Adams Bellows's translation was published in 1923 — before 1929, so its United States " +
      "copyright has expired — and he lived from 1885 to 1939, so it cleared life plus seventy at " +
      "the start of 2010; where the term runs for the author's life plus a hundred years it stays in " +
      "copyright until 2040. Bellows's General Introduction and his Pronouncing Index are not " +
      "reproduced here; what is taken is the thirty-five poems with the introductory note and the " +
      "footnotes he gave to each. There is no Old Norse column, and the reason is that no complete " +
      "edition is transcribed anywhere reachable rather than that any of them is shut — see the " +
      "front matter. (The translations by Lee M. Hollander, 1928, Carolyne Larrington, 1996, and " +
      "Jackson Crawford, 2015, are still in copyright and are not used here.)",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/The_Poetic_Edda_(tr._Bellows)",

    /* ---------- THE FRONT MATTER — chapter 0 ----------
       Five things a reader needs before they start and none of them is guessable from the page: that
       this is an anthology and not a poem; that nobody knows who made any of it; that the numbers
       are stanza numbers and are how every reference book will address them; that the manuscript has
       a hole in it which the story falls through; and why there is no Old Norse beside it. */
    about: [
      "<b>The Poetic Edda</b> — called also the Elder Edda, and sometimes still the Sæmundar Edda — " +
        "is the oldest and by a long way the most important source for the myths and heroic legends " +
        "of the Norse world. The first thing to know about it is that it is <b>not a poem but an " +
        "anthology</b>: thirty-five separate pieces by different hands, composed over perhaps three " +
        "centuries, which owe their survival to one Icelandic manuscript of about 1270 called the " +
        "<i>Codex Regius</i>. Nearly everything anyone knows about Odin, Thor, Loki, the world-ash " +
        "and Ragnarök comes from this book and from Snorri Sturluson's prose handbook, which quotes " +
        "these very poems as its authority — and where the two disagree, the verse is the older " +
        "witness.",
      "<b>Nobody knows who wrote any of it.</b> The name attached to the collection for three " +
        "centuries is an accident: when the manuscript surfaced in 1643 in the hands of an Icelandic " +
        "bishop, it was guessed to be the work of Sæmundr the Learned, a priest who had died five " +
        "hundred years earlier, and the guess stuck hard enough that the book is still occasionally " +
        "sold under his name. It is wrong, and no modern editor defends it. The poems are anonymous, " +
        "they are not all of one date or one country, and the arguments about when each was composed " +
        "run from the ninth century to the thirteenth — which is why the date on the shelf is a " +
        "range with the early end of it used for sorting.",
      "The collection falls into <b>two halves, and this edition's own contents page names them</b>. " +
        "The first fourteen poems are the <i>Lays of the Gods</i>: the <i>Voluspo</i>, in which a " +
        "seeress tells Odin the whole history of the world from its making to its burning and its " +
        "rebirth; the <i>Hovamol</i>, a long and startlingly practical book of advice on how to " +
        "behave in other people's houses, which turns at its end into an account of how Odin won the " +
        "runes by hanging nine nights on a tree; and the comic and quarrelsome poems in between, " +
        "among them Thor's recovery of his stolen hammer in women's clothing and Loki insulting " +
        "every god present, one after another, at a feast. The remaining twenty-one are the " +
        "<i>Lays of the Heroes</i>, and they are a different world — no gods to speak of, and a " +
        "single blood-soaked family story running through most of them: Sigurd, the dragon Fafnir, " +
        "Brynhild, and the Burgundian court that destroys them all. That story is the ancestor of " +
        "the German <i>Nibelungenlied</i> and, at one further remove, of Wagner's <i>Ring</i>.",
      "<b>The numbers running down the page are stanza numbers</b>, and they are how this book is " +
        "cited in every language and every reference work: <i>Voluspo</i> 21 means the twenty-first " +
        "stanza of the first poem, and it will mean that in any edition a reader picks up. They are " +
        "the section marks here for that reason. Two other things about the shape of the text are " +
        "the manuscript's rather than the translator's. Several poems are interrupted by <b>short " +
        "passages of prose</b> that set the scene or carry the story over a gap, and two of the " +
        "thirty-five pieces — <i>Fra Dautha Sinfjotla</i> and <i>Drap Niflunga</i> — are prose from " +
        "beginning to end, being narrative bridges rather than poems at all. They are printed here " +
        "as what they are.",
      "<b>There is a hole in the manuscript</b>, and a reader who does not know about it will think " +
        "the book has gone wrong. A gathering of eight leaves is missing from the <i>Codex Regius</i> " +
        "at the very centre of the Sigurd story — the meeting of Sigurd and Brynhild, and much of " +
        "what makes the ending intelligible. What survives on either side of the gap is a fragment, " +
        "printed here as <i>Brot af Sigurtharkvithu</i>, which begins in the middle of a sentence and " +
        "of an argument. Bellows's introductory notes explain at each point what has been lost and " +
        "what the prose sources let us reconstruct; the loss itself is permanent.",
      "Each poem opens with <b>Bellows's own introductory note</b> — where the poem is preserved, how " +
        "sound its condition is, what is thought about its date, and what quarrel the editors are " +
        "currently having about it — and his footnotes are gathered under the poem. They are heavy: " +
        "on some pages there is more annotation than verse. That is not an accident of this edition " +
        "but a fact about the material, which is full of names that mean nothing without a story " +
        "attached, and a reader who ignores the notes entirely will find the heroic poems in " +
        "particular very hard going. His translation is a hundred years old and keeps the metre and " +
        "something of the word order of the original, which makes it sound archaic in places; it is " +
        "close, and it is honest about the passages where the text is corrupt or the meaning is " +
        "guessed.",
      "<b>There is no Old Norse column here, and the reason is coverage rather than copyright.</b> " +
        "That is worth stating plainly, because for a medieval work the usual obstacle is the other " +
        "way round: the poems are eight hundred years old and free everywhere, but a medieval text " +
        "has to be constituted from its manuscripts by an editor, and an editor's text is a modern " +
        "work with a modern copyright. Here an edition whose copyright has expired is available and " +
        "transcribed — Sophus Bugge's of 1867, and he died in 1907 — but only three of the " +
        "thirty-five poems have been transcribed from it, and one of those three numbers no stanzas " +
        "at all. Three poems out of thirty-five is not a facing text, and pairing a book on the " +
        "tenth of it that happens to exist would leave a reader turning to an empty column on almost " +
        "every page. If the rest is ever transcribed it can be added; the numbers are already there " +
        "to pair on, which is the hard part.",
    ],

    /* ---------- ONE POEM, ONE CHAPTER ----------
       The ordinary wiki walk: thirty-five pages, thirty-five chapters. What is new is
       `layout: "eddapoem"` — the body is verse stanzas and prose links MIXED, which no earlier verse
       reader here handles; see the block comment above extractEdda.

       WHY THE POEM AND NOT THE STANZA IS THE TAB, and why the stanza is the section. Both are
       forced by the citation rather than chosen: a poem is the unit this collection is made of and
       the unit its contents page lists, and the stanza number is the unit every edition and every
       reference work addresses a passage by. Neither is a compromise, which is unusual enough on
       this shelf to be worth saying. */
    layout: "eddapoem",
    /* THE TWO PIECES THAT ARE PROSE THROUGHOUT, declared so the unnumbered-chapter warning means
       something when it fires. Fra Dautha Sinfjotla and Drap Niflunga are the manuscript's narrative
       bridges rather than poems and have no stanzas to number; both were measured rather than
       assumed, and both carry footnotes like everything else. */
    prose: [19, 28],
    chapters: Array.from({ length: 35 }, (_, k) => k + 1),
    chapterWord: "Poem",
    page: (n) => "The Poetic Edda (tr. Bellows)/" + EDDA_POEMS[n - 1],
    titleOf: (n) => EDDA_POEMS[n - 1],

    /* The edition's own two divisions, read off its contents page rather than inferred from the
       subject matter — the gods stop and the heroes begin at Völundarkvitha, which is where Bellows
       puts the break and where the manuscript puts it too. */
    parts: [
      { n: 1, label: "Lays of the Gods", from: 1, to: 14 },
      { n: 2, label: "Lays of the Heroes", from: 15, to: 35 },
    ],
  },

  "city-of-god": {
    title: "The City of God",
    subtitle: "De Civitate Dei contra Paganos",
    author: "Augustine of Hippo",
    translator: "Marcus Dods",
    edition:
      "A Select Library of the Nicene and Post-Nicene Fathers of the Christian Church, " +
      "First Series, Vol. II, ed. Philip Schaff, Buffalo, 1887",
    written: "413–426 CE",

    /* ---------- THE LICENCE, which needs no qualification at all ----------
       Three layers and every one of them is clear. Augustine finished the work in 426 and died in
       430. Marcus Dods's translation was published in Edinburgh in 1871 and reprinted in Schaff's
       American series in 1887 — both long before 1929, so the United States copyright has expired —
       and Dods lived 1834–1909, dates looked up rather than recalled, so it is also out of copyright
       wherever the term runs for the author's life plus seventy or even a hundred years. There is no
       limit to state and no modern editorial layer to declare: this is his printed text, not a
       re-edited one.

       Schaff's series added an editor's preface, a set of introductory essays and an index; none of
       that is imported, exactly as the volume's own front and back matter is left behind elsewhere.
       What is taken is the twenty-two books of the translation.

       The translations a reader is likeliest to reach for are still in copyright and are named here
       so that nobody does: Henry Bettenson's Penguin of 1972, R. W. Dyson's Cambridge text of 1998
       and William Babcock's for New City Press (2012–2013). */
    rights:
      "Public domain worldwide. Augustine finished the work in 426 and died in 430. Marcus Dods " +
      "published this translation in Edinburgh in 1871 and it was reprinted in Philip Schaff's " +
      "Nicene and Post-Nicene Fathers in 1887 — both before 1929, so its United States copyright has " +
      "expired — and Dods died in 1909, so it is out of copyright wherever the term runs for the " +
      "author's life plus seventy or even a hundred years. (Henry Bettenson's translation of 1972, " +
      "R. W. Dyson's of 1998 and William Babcock's of 2012–2013 are still in copyright and are not " +
      "used here.)",
    sourceName: "Wikisource",
    sourceUrl:
      "https://en.wikisource.org/wiki/Nicene_and_Post-Nicene_Fathers:_Series_I/Volume_II/City_of_God",

    /* THE FRONT MATTER — chapter 0. Two things have to be said early because a reader would otherwise
       have to work them out by counting: what the twenty-two books are actually doing, since the
       first ten are an argument against somebody and only the last twelve are the book most people
       think they are opening, and where the Latin beside it comes from. */
    about: [
      "<b>The City of God</b> is Augustine's longest work and the one he laboured at longest: he " +
        "began it in 413, three years after Alaric's Goths sacked Rome, and finished it in 426, four " +
        "years before he died with the Vandals at the gates of his own city. Rome had not fallen to " +
        "an enemy for eight hundred years, and the shock of it was argued about across the empire. " +
        "One explanation was ready to hand and was being made loudly: the city had abandoned the gods " +
        "who kept it, and this was what the new religion had cost. Augustine set out to answer that, " +
        "and the answer grew into a history of the world from the creation to the last judgment.",
      "<b>It is a book of two halves, and knowing which half you are in makes it far easier to " +
        "read.</b> Books I to X are the reply, and they are polemical, encyclopaedic and often very " +
        "funny: he goes through what the gods are supposed to have done for Rome, what Rome actually " +
        "suffered while worshipping them, and what the philosophers — Varro on the state religion, " +
        "Plato and the Platonists on everything above it — had already worked out and failed to act " +
        "on. Books XI to XXII are the constructive half, and they are what the title names: the story " +
        "of two cities, one founded on the love of God and one on the love of self, from the fall of " +
        "the angels through the whole of biblical and Roman history to the end of the world. He says " +
        "himself at the head of Book XI that the second part begins there.",
      "The <b>two cities are not a state and a church</b>, and reading them that way is the commonest " +
        "way to lose the argument. They are two allegiances, mixed together and indistinguishable " +
        "until the end, and a bishop may belong to the earthly one and an emperor to the heavenly. " +
        "That is why Book XIX, on what peace is and what a commonwealth is, has been read for fifteen " +
        "centuries by people who cared nothing for the rest — it is where he defines a people by what " +
        "it loves, and takes Cicero's definition of a republic apart to do it.",
      "Marcus Dods was a Scottish minister and later Principal of New College, Edinburgh; his " +
        "translation of 1871 was made for a complete Edinburgh Augustine and reprinted in 1887 in " +
        "Philip Schaff's American series, which is the printing here. It is Victorian and fairly " +
        "close, and it keeps the shape of Augustine's sentences, which are long. The chapter headings " +
        "running through it are the edition's own summaries, printed above each chapter — they are the " +
        "quickest way to find a passage in a work of six hundred and sixty-one chapters. The " +
        "paragraph at the head of each book, marked <i>Argument</i>, is the same thing at the scale of " +
        "the book. Footnotes are the translator's and the American editor's together, gathered under " +
        "each book; the ones signed P.S. are Schaff's.",
      "The Latin facing it is <b>Migne's</b>, from volume 41 of the <i>Patrologia Latina</i> of 1841, " +
        "which prints the text the Benedictines of St Maur established in the seventeenth century — " +
        "the text Dods himself was translating. The two columns are paired on the chapter number, " +
        "which is how any passage of the work is cited in any language: <i>City of God</i> XIX.24 is " +
        "book nineteen, chapter twenty-four. Measured over the whole work before it was believed, the " +
        "two agree on all 661 chapters, in the same order, in every one of the twenty-two books. " +
        "Migne's own chapter headings are printed in the Latin column as Dods's are in the English, " +
        "so the two sides describe each chapter in their own words.",
      "One thing about the Latin is worth knowing before you meet it. Migne sets the column numbers " +
        "of his own edition into the running text, and they are stripped here, because a figure like " +
        "41.0347 arriving in the middle of a sentence is a reference to a page rather than anything " +
        "Augustine wrote. His numbered subdivisions inside the longer chapters are left as he printed " +
        "them.",
    ],

    /* ---------- ONE BOOK OF THE WORK, ONE CHAPTER HERE ----------
       Augustine's chapter is far too small to be a Folio chapter — a great many of the 661 run to a
       single paragraph — and his BOOK is exactly the right size, so the book is the chapter and the
       chapter number is the section, which is what any citation of this work states anyway. That
       makes every chapter a multi-page fetch: the book's own page carries the Argument and nothing
       else, and each of its chapters (and, in four books, its preface) has a page of its own. Thirty
       to fifty-five pages a chapter, 687 in all.

       `body: "plain"` because this is not a proofread transcription of a scan. It is typed straight
       onto the page, so there is no `prp-pages-output` wrapper and the ordinary slice returns -1 and
       throws on a page holding a whole chapter of Augustine. */
    layout: "wiki",
    body: "plain",
    sections: "chapterhead",
    dropHeadings: true,
    dropLinkLists: true,
    dropHeadMarkers: true,
    dropBlankParas: true,
    chapters: Array.from({ length: 22 }, (_, k) => k + 1),
    chapterWord: "Book",
    titleOf: (n) => "Book " + COG_ROMAN[n - 1],
    page: (n) => {
      const r = COG_ROMAN[n - 1];
      const out = [COG_BASE + r];
      if (COG_PREFACE.has(n)) out.push(COG_BASE + r + "/Preface");
      for (let c = 1; c <= COG_CHAPTERS[n - 1]; c++) out.push(COG_BASE + r + "/Chapter " + c);
      return out;
    },
    /* WHICH CHAPTER EACH PAGE IS SUPPOSED TO CARRY, so the number read off the printed heading can be
       CHECKED rather than merely parsed — the discipline the chapter marks of a book-and-chapter
       edition already follow. Here it is free: the page NAME states the chapter, so a page that has
       been renamed, or a heading mistyped, is reported instead of silently filing its prose under the
       chapter before it. Returns null for a page that carries no numbered chapter (the book's own
       page, and a preface), which is what tells the section pass not to expect one. */
    pageMark: (name) => {
      const m = /\/Chapter (\d+)$/.exec(name);
      return m ? +m[1] : null;
    },

    /* THE EDITION'S OWN FURNITURE at the head of a book's page: the volume's half-title over Book I,
       the book's own number over every one of them, and the rule of em dashes the printing sets under
       it. All three are plain paragraphs rather than centred blocks, which is why this book declares
       `dropLeadParas` and not `dropHeads` — see the note on that option in cleanBody. Anchored to the
       start and tested against each block's whole text, as every list of this kind is, so none of
       them can reach prose. */
    dropLeadParas: [
      /^The City of God\.?$/i,
      /^Book\s+[IVXLC]+\s*\.?$/i,
      /^[—–-]{3,}$/,
    ],

    /* ---------- THE LATIN, AND WHY IT IS THIS COPY OF IT ----------
       Migne's Patrologia Latina 41, transcribed on Latin Wikisource from the University of Zurich's
       Corpus Corporum. It is the right column on three separate grounds and each was checked rather
       than assumed.

       IT NAMES ITS EDITOR AND ITS DATE. The other complete Latin De civitate Dei on that wiki is
       taken from thelatinlibrary.com, and its own index page records no edition at all — Wikisource
       files it under "works without an edition". A constituted Latin text is a modern editor's work
       whatever the age of the author, so an original that cannot say whose text it is cannot say
       whether it may be quoted; Migne 1841 can, and is public domain past any argument.

       IT IS THE TEXT DODS WAS TRANSLATING. Migne prints the Maurist text of 1685, which is the
       edition the Edinburgh translation was made from, so the two columns are a translation and its
       own original rather than two independent editions set beside each other.

       AND THE OBVIOUS COPY OF IT IS THE UNFINISHED ONE. `De civitate Dei (ed. Migne)` is what a
       search for this text returns first and it is INCOMPLETE: measured against the English before a
       word of it was imported, its Book XX stops in the middle of a sentence in chapter 24 and never
       reaches the last six, and its Book XII has no chapter 7. `De civitate Dei (Migne)` — the same
       text, one page name away, with no "ed." — carries all 661. Ask what a source is MISSING before
       building on it; the two look identical for nineteen books out of twenty-two.

       THE PAIRING, measured over both editions before any of it was believed: 22 books on each side,
       661 chapters on each side, the same numbers in the same order in every book, no gaps and no
       duplicates, and not one chapter number carrying a letter — so none of the sort-key trouble a
       lettered citation brings arises. Two things in the Latin had to be learned rather than assumed
       and both are recorded in extractCaput: the mark is printed four ways (CAPUT PRIMUM for the
       first of every book, then Roman numerals, with the dash after it sometimes missing and once a
       stray full stop after the word CAPUT), and Book I marks its tenth chapter a SECOND time, in
       square brackets, where Migne resumes the chapter after an inserted passage. The forward-only
       guard every section pass here uses declines that repeat and the material folds into the chapter
       already open, which is where it belongs. */
    original: {
      lang: "la",
      langName: "Latin",
      layout: "caput",
      wiki: "la.wikisource.org",
      edition:
        "Patrologiae Cursus Completus, Series Latina, Tomus XLI, ed. J.-P. Migne, Paris, 1841",
      rights:
        "Public domain worldwide. Augustine died in 430 and Migne's edition was published in Paris in " +
        "1841, so both the work and the text of it printed here are long out of copyright on every " +
        "rule. The transcription is from the University of Zurich's Corpus Corporum project.",
      sourceName: "Vicifons",
      sourceUrl: "https://la.wikisource.org/wiki/De_civitate_Dei_(Migne)",
      page: (n) => "De civitate Dei (Migne)/" + n,
      /* The book's own number, printed above its summary in seventeen of the twenty-two and set in
         the page heading in the other five — the Latin half of the running head the translation side
         drops. Written out in the ordinals this edition uses rather than matched loosely, so it can
         reach nothing else. */
      dropLeadParas: [/^LIBER(?:\s+[A-Z]+){1,2}\s*\.?$/],
      minChars: 20000,
    },
  },

  "homer-iliad": {
    title: "The Iliad",
    subtitle: "Ἰλιάς",
    author: "Homer",
    translator: "A. T. Murray",
    edition: "Loeb Classical Library, William Heinemann / G. P. Putnam's Sons, London and New York, 1924",
    written: "composed c. 750–700 BCE",

    /* ---------- THE LICENCE, and it states a LIMIT ON EACH COLUMN ----------
       The poem itself is the easiest layer on the shelf: composed some twenty-seven centuries ago and
       in the public domain everywhere, on every rule anyone has ever written.

       Both MODERN layers are 1920s scholarship, so both clear the pre-1929 publication rule outright
       and both need a limit stating beyond it — which is the Song of Roland's shape, the only other
       book here whose limit falls on both columns at once.

       · A. T. MURRAY, the translator, lived 1866–1940 and published this Iliad in two volumes in 1924.
         United States copyright expired on the publication date; life-plus-seventy expired at the
         start of 2011; LIFE PLUS A HUNDRED RUNS TO 2041.
       · MONRO AND ALLEN, the Greek. Their Oxford Classical Text was published 1908–1920, so the
         publication ground is clear. The life-plus-seventy term of a JOINT work runs from the LAST
         surviving author, which is the Gallic War's rule and matters here because the two men died
         forty-five years apart: David Binning Monro died in 1905 and Thomas William Allen not until
         1950, so the term ran from Allen and expired at the start of 2021. LIFE PLUS A HUNDRED RUNS
         TO 2051.

       So the ORIGINAL is the harder half of the pair, which is the Medea's finding rather than a new
       one: everywhere else on this shelf the original is the older and easier column, and here the
       Greek stays encumbered ten years longer than the English does. Every date above was looked up
       rather than recalled, for the Hugo Magnus reason — and it is worth saying that A. T. Murray is
       NOT Gilbert Murray, who edited the Greek of the Medea on this same shelf. The two were born in
       the same year, 1866, and are different men; taking one's dates for the other's would have put a
       wrong death year under the whole of this licence.

       BOTH DIGITAL EDITIONS carry the Perseus CC BY-SA 4.0 layer, as Ovid's, Lucretius's and
       Suetonius's do on both of their columns.

       AND NEITHER TEXT CARRIES A MODERN EDITORIAL LAYER, which was CHECKED rather than assumed — the
       Antigone found the shipped Oedipus Rex claiming to be "public domain on every ground" while
       silently carrying Perseus's own modernization of Jebb's prose. Both of these files' revision
       histories were read: they record card breaks, DTD revisions, EpiDoc conversion and four fixed
       typos, and nothing else. Perseus's OTHER English Iliad does carry such a layer and is the
       reason this one was chosen; see the note under `url` below.

       The modern translations a reader is likeliest to own — Richmond Lattimore (1951), Robert
       Fitzgerald (1974), Robert Fagles (1990), Stanley Lombardo (1997), Caroline Alexander (2015),
       Peter Green (2015) and Emily Wilson (2023) — are all firmly in copyright and none is used here.
       Named for the reason Campbell, Hays, Griffith and Lee are named above: so that nobody reaches
       for one later. So, particularly, is the LOEB ITSELF AS A READER WILL FIND IT TODAY: Murray's
       Iliad was revised by William F. Wyatt in 1999 and that revision is a separate copyrighted work.
       What is here is Murray's own 1924 text. */
    rights:
      "Three layers, and a limit on each of the two modern ones. The poem is some twenty-seven " +
      "centuries old and is in the public domain everywhere. A. T. Murray's translation was " +
      "published in 1924 — before 1929 — so its copyright has expired in the United States, and " +
      "Murray died in 1940, so it is also public domain wherever the term is the author's life plus " +
      "seventy years; where the term is life plus a hundred it remains in copyright until 2041. The " +
      "Greek is David B. Monro and Thomas W. Allen's Oxford text of 1908–1920, likewise published " +
      "before 1929; the term for a joint work runs from the last surviving author, and Allen died in " +
      "1950, so it cleared life plus seventy at the start of 2021 and remains in copyright until " +
      "2051 where the term is life plus a hundred. Both digital editions are prepared by the Perseus " +
      "Digital Library at Tufts University and are released under a Creative Commons " +
      "Attribution-ShareAlike 4.0 International licence. (The modern translations by Richmond " +
      "Lattimore, 1951, Robert Fagles, 1990, Caroline Alexander, 2015, and Emily Wilson, 2023, are " +
      "still in copyright and are not used here, nor is William F. Wyatt's 1999 revision of Murray.)",
    sourceName: "Perseus Digital Library",
    sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0012.tlg001/",

    /* THE FRONT MATTER — chapter 0, authored here for the reasons the Seneca entry sets out. It says
       what the poem is and where it stops, what the translation is and what it is not, and how the
       numbers work — and it says outright that the notes are missing, because a reader who meets a
       Loeb without its footnotes is owed the reason rather than left to assume Folio dropped them. */
    about: [
      "<b>The Iliad</b> is the oldest surviving work of European literature, and it is about roughly " +
        "seven weeks in the tenth year of a ten-year war. It does not begin at the beginning and it " +
        "does not reach the end: there is no judgement of Paris here, no abduction of Helen, no " +
        "wooden horse and no fall of Troy. What there is instead is an argument between two Greek " +
        "commanders over a captured woman, and everything that follows from one of them refusing to " +
        "fight. The poem announces its true subject in its first word — <i>mēnis</i>, wrath — and the " +
        "last line buries a man.",
      "It runs to 15,693 lines of dactylic hexameter in twenty-four books, and the division into " +
        "books is not Homer's: it is Alexandrian, the work of scholars at the Library some five " +
        "hundred years after the poem was composed, and it is why they are lettered with the " +
        "twenty-four letters of the Greek alphabet as often as they are numbered. The poem was made " +
        "to be heard rather than read. Its repeated epithets and whole repeated lines — the " +
        "wine-dark sea, swift-footed Achilles, rosy-fingered dawn — are the working equipment of oral " +
        "composition, a system of ready-made phrases that let a singer build a line in performance, " +
        "and they are not the padding they can look like on a page.",
      "Who Homer was is the oldest open question in classical scholarship and this edition cannot " +
        "settle it. The ancient world took him for a single blind poet of Chios or Smyrna; since the " +
        "eighteenth century the weight of argument has moved towards a long tradition of singers, " +
        "with the poem reaching something like its present shape in the eighth or seventh century " +
        "BCE and being written down at some point thereafter. Nothing in the text names its author. " +
        "What is not in doubt is what it did afterwards: it was the book Greeks learned to read on, " +
        "quoted in court and in argument for a thousand years, and it stands behind the Aeneid, " +
        "Dante, Milton and a great deal since.",
      "The translation here is A. T. Murray's, made for the Loeb Classical Library in 1924. It is " +
        "PROSE, and that is a real choice rather than an accident of the edition: Murray was setting " +
        "his English on the page facing the Greek for readers working between the two, so he " +
        "translates closely and keeps Homer's formulae as formulae rather than varying them for " +
        "effect. His English is deliberately a little archaic. What it is not is a poem, and a reader " +
        "who wants the hexameters in English verse should know that is a different book from this one.",
      "The small raised figures running through both columns are LINE numbers of the Greek, marking " +
        "where each passage begins — so a reference such as 'Iliad 1.348' is book 1, line 348, and " +
        "the figures are how you find it. They are also what pairs the two columns: an English " +
        "passage and a Greek one carrying the same figure are the same place in the poem. Two things " +
        "this edition does not give you. Murray's printed page carries 144 footnotes, and the " +
        "transcription used here preserves only the numbers that pointed at them and not a word of " +
        "their text, so they are dropped and there is no fold of notes under the chapters. And the " +
        "Greek is a constituted text like any other: Monro and Allen omit four lines of book 9 " +
        "altogether and bracket four more in book 8 as later insertions, so those eight places stand " +
        "empty in the Greek column where the English still translates them.",
    ],

    /* ---------- A TEI EDITION ON BOTH SIDES, and the English one had to be chosen ----------
       Perseus carries TWO English Iliads and the difference between them decided this book.

       · `perseus-eng4` is Samuel Butler's prose of 1898 — whose own copyright is the easiest on the
         shelf, Butler having died in 1902 — and it is NOT usable, because what Perseus carries is
         not Butler. Its header states it plainly: "Based on public domain editon of Samuel Butler,
         revised by Timothy Power and Gregory Nagy." That is a substantive modern revision by living
         scholars, carried by CC BY-SA rather than by an expiry, and it is visible in the text, which
         inserts transliterated Greek terms into the English ("the anger [mênis] of Achilles"). It is
         also far more thinly marked: 190 cards and 1,450 line milestones against Murray's 425 and
         3,143, so it states its line numbers less than half as often.
       · `perseus-eng3` is Murray's Loeb, complete, densely numbered, with no revision layer.

       So the easier copyright is attached to the text that cannot honestly be shipped as its named
       translator's work, and the harder one to the text that can. That is the Nicomachean Ethics'
       trade made again — there the free Chase paired on 18 Bekker pages of 181 and the encumbered
       Ross on 173 of 173 — and it is decided the same way: the licence question and the pairing
       question are settled together, and a stated limit is worth paying for a column that is
       actually what it says it is. */
    source: "tei",
    url: "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0012/tlg001/tlg0012.tlg001.perseus-eng3.xml",
    layout: "verse",
    /* The cards are real divisions in the English file and bare milestones in the Greek one, exactly
       as Ovid's two sides are, so each column says how to find its own. */
    cards: "div",
    /* THE TRANSLATION IS PROSE AND THE ORIGINAL IS VERSE, which is new — see the note in
       teiVerseBooks. Every earlier book on this path has verse on both sides. */
    cardProse: true,
    chapterWord: "Book",
    /* The twenty-four books have no titles. This edition heads them "Book 1" … "Book 24" and gives
       them no names, as Haines's Meditations and More's Ovid do. The tale headings a modern reader
       knows — "The Quarrel", "The Embassy to Achilles", "The Shield of Achilles" — are editors'
       inventions rather than anything the poem or this edition carries, and composing them here would
       be building an apparatus the book has not got. */
    titleOf: (n) => "Book " + toRoman(n),
    chapters: Array.from({ length: 24 }, (_, i) => i + 1),

    /* ---------- THE ORIGINAL, AND WHY IT PAIRS ----------
       The question that decides every original here is not "does a text of it exist?" but "does that
       text say which section each passage is?", because app.js pairs the two columns on the section
       number and never on paragraph order. Homer passes about as well as any work can: he is cited by
       BOOK AND LINE everywhere in every language, both editions state the line, and both are divided
       into the same 425 CARDS — passages of thirty-odd lines labelled with the line each one begins
       at. A card number is therefore the same claim on both sides, stated by the editions rather than
       counted off a list.

       MEASURED BEFORE IT WAS BELIEVED, over all twenty-four books: 24 books and 425 cards on each
       side; the card lists of 22 of the 24 books are IDENTICAL; 423 of the 425 numbers appear on both
       sides. That is the cleanest pairing of two independently edited texts on the shelf bar the
       Gallic War, and it needed no new reader on the Greek side at all.

       THE TWO EXCEPTIONS ARE ONE BOUNDARY EACH, drawn a line or two apart, and each was READ rather
       than assumed to be the same passage before reconcileCards was allowed to move it:
         · book 3, English card 381 against Greek 383. The English opens "But him Aphrodite snatched
           up ... and herself went to summon Helen"; the Greek opens two lines later at exactly that
           clause, αὐτὴ δʼ αὖ Ἑλένην καλέουσʼ ἴε.
         · book 13, English card 82 against Greek 81. Word for word the same sentence, one line apart:
           "On this wise spake they one to the other, rejoicing in the fury of fight" against ὣς οἳ μὲν
           τοιαῦτα πρὸς ἀλλήλους ἀγόρευον / χάρμῃ γηθόσυνοι.
       Both are a clean re-sync — every other card in both books agrees — which is the Bhagavad Gita's
       test for telling an editor's different cut from a misaligned extractor.

       THE GREEK IS SHORT OF THE STANDARD LINE COUNT AND EVERY MISSING LINE IS ACCOUNTED FOR, which is
       worth recording because a count that is nearly right is how a truncated import hides. The file
       carries 15,687 <l> elements against the traditional 15,693. Six are simply absent: 9.458–461,
       which the edition's own single note says it omits, and 11.543 and 14.269, both lines Aristarchus
       athetized. Four more are PRESENT but wrapped in <del> — 8.548 and 8.550–552 — which teiVerseBooks
       drops with their words, on the same judgement the Meditations' Greek makes: what ships is the
       text the edition constitutes. So 15,683 lines ship, 15,687 − 4, and 15,687 + 6 = 15,693.
       Measure this rather than assuming the rule is inert: Lucretius's 116 <del> marks cost that poem
       thirty whole lines.

       THIRTEEN RUN-TOGETHER WORDS ARE THE SOURCE'S OWN AND ARE LEFT AS THEY ARE — "yoke of
       horses.But Rhesus", "There Poseidon,the Shaker of Earth", "even as thou sayest,make for the
       left". Each was checked against the transcription and is present there verbatim, with no tag
       anywhere near it, so they are Perseus's typing rather than anything this importer did. They
       are recorded instead of repaired for the reason the Song of Roland records its two malformed
       numerals: a hand-written list of corrections to somebody else's text is an apparatus, and
       thirteen missing spaces in 955 KB change nothing a reader relies on. It matters mainly that
       they are WRITTEN DOWN, because the same shape — two words welded by a stripped tag — was a
       real fault of this import affecting 2,787 places, and without this paragraph the survivors
       would read as that fault not having been fixed. See the milestone rule in teiVerseBooks. */
    original: {
      lang: "grc",
      langName: "Greek",
      source: "tei",
      layout: "verse",
      cards: "milestone",
      url: "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0012/tlg001/tlg0012.tlg001.perseus-grc2.xml",
      edition:
        "Homeri Opera, ed. David B. Monro and Thomas W. Allen, editio tertia, Clarendon Press, " +
        "Oxford, 1908–1920, from the Perseus Digital Library",
      rights:
        "Two layers, both stated. The poem is some twenty-seven centuries old and is in the public " +
        "domain everywhere. Monro and Allen's Oxford text was published between 1908 and 1920 — " +
        "before 1929 — so its copyright has expired in the United States; the term for a joint work " +
        "runs from the last surviving author, and Thomas W. Allen died in 1950, so it cleared life " +
        "plus seventy at the start of 2021 and remains in copyright until 2051 where the term is " +
        "life plus a hundred. The digital edition it is taken from is prepared by the Perseus " +
        "Digital Library at Tufts University and is released under a Creative Commons " +
        "Attribution-ShareAlike 4.0 International licence.",
      sourceName: "Perseus Digital Library",
      sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0012.tlg001/",
    },
  },

  "homer-odyssey": {
    title: "The Odyssey",
    subtitle: "Ὀδύσσεια",
    author: "Homer",
    translator: "A. T. Murray",
    edition: "Loeb Classical Library, William Heinemann / G. P. Putnam's Sons, London and New York, 1919",
    written: "composed c. 725–675 BCE",

    /* ---------- THE LICENCE, and it is the SIMPLEST of any two-column book here ----------
       Every other pairing on this shelf sets two modern hands beside each other and has to reason
       about both — a translator on one side and an editor on the other, dying decades apart, with the
       longer of the two terms deciding the book. Here there is ONE modern hand and it holds both
       columns: Perseus's Greek for the Odyssey is not an Oxford Classical Text set beside the Loeb but
       the Greek printed on the facing half of the SAME 1919 Loeb volumes, and its file credits A. T.
       Murray as its editor. So the two halves clear together and there is no harder half to state.

       · A. T. MURRAY lived 1866–1940 and published this Odyssey in two volumes in 1919 (books 1–12
         and 13–24). United States copyright expired on the publication date, 1919 being well before
         1929; life-plus-seventy expired at the start of 2011; LIFE PLUS A HUNDRED RUNS TO 2041.
       · THE GREEK rests first on the same 1919 publication, which is a ground needing no attribution
         at all, and then on Murray's own death year under the attribution the source file states. NO
         OTHER EDITOR IS NAMED ANYWHERE IN THAT FILE — not in the title statement, not in the source
         description, not in the revision history, all of which were read rather than assumed — so
         nothing here rests on a name that could not be checked. That is the Gallic War's discipline
         in an easier case: claim the ground that is certain, name the attribution the source gives,
         and do not round a gap up into a fact.

       Every date was looked up rather than recalled, for the Hugo Magnus reason. It is worth writing
       down once that A. T. Murray is NOT Gilbert Murray, who edited the Greek of the Medea on this
       same shelf: the two were born in the same year, 1866, are different men, and taking one's dates
       for the other's would put a wrong death year under this whole paragraph.

       BOTH DIGITAL EDITIONS carry the Perseus CC BY-SA 4.0 layer, as the Iliad's, Ovid's, Lucretius's
       and Suetonius's do on both of their columns. NEITHER TEXT CARRIES A MODERN EDITORIAL LAYER,
       which was CHECKED and not assumed — the Antigone found the shipped Oedipus Rex claiming to be
       clean while silently carrying Perseus's own modernization of Jebb. Both revision histories were
       read: they record card breaks, proofreading, a DTD revision and the EpiDoc conversion, and
       nothing else. Perseus's OTHER English Odyssey does carry such a layer and is the reason this one
       was chosen; see the note under `url` below.

       The modern translations a reader is likeliest to own — Robert Fitzgerald (1961), Richmond
       Lattimore (1965), Robert Fagles (1996), Stanley Lombardo (2000), Emily Wilson (2017) and Peter
       Green (2018) — are all firmly in copyright and none is used here. Named so that nobody reaches
       for one later. So, particularly, is THE LOEB ITSELF AS A READER WILL FIND IT TODAY: Murray's
       Odyssey was revised by George E. Dimock and reissued in 1995 as Loeb 104 and 105, and that
       revision is a separate copyrighted work. What is here is Murray's own 1919 text. */
    rights:
      "Three layers, and the two modern ones are the same hand. The poem is some twenty-seven " +
      "centuries old and is in the public domain everywhere. A. T. Murray's translation was " +
      "published in 1919 — before 1929 — so its copyright has expired in the United States, and " +
      "Murray died in 1940, so it is also public domain wherever the term is the author's life plus " +
      "seventy years; where the term is life plus a hundred it remains in copyright until 2041. The " +
      "Greek is the text printed facing that translation in the same 1919 volumes, which the edition " +
      "used here credits to Murray as its editor and for which it names no one else, so it stands on " +
      "the same publication date and the same life. Both digital editions are prepared by the " +
      "Perseus Digital Library at Tufts University and are released under a Creative Commons " +
      "Attribution-ShareAlike 4.0 International licence. (The modern translations by Robert " +
      "Fitzgerald, 1961, Richmond Lattimore, 1965, Robert Fagles, 1996, and Emily Wilson, 2017, are " +
      "still in copyright and are not used here, nor is George E. Dimock's 1995 revision of Murray.)",
    sourceName: "Perseus Digital Library",
    sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0012.tlg002/",

    /* THE FRONT MATTER — chapter 0, authored here for the reasons the Seneca entry sets out. It says
       what the poem is, how it is put together, what the translation is and what it is not, and how
       the numbers work — and it says outright that the notes are missing and that three lines of the
       Greek are absent, because a reader who meets a Loeb without its footnotes is owed the reason
       rather than left to assume Folio dropped them. */
    about: [
      "<b>The Odyssey</b> is a poem about getting home, and it takes its hero four books to appear " +
        "in it. Troy has been sacked for ten years when it opens; every other Greek commander who " +
        "survived the war is back or dead, and Odysseus alone is still missing, held on an island by " +
        "a goddess who wants to keep him. The first four books are about his son, who was an infant " +
        "when his father sailed and is now a young man with a house full of suitors eating his " +
        "inheritance while they wait for his mother to choose one of them. The poem is as much about " +
        "what a twenty-year absence does to a household as it is about the sea.",
      "It runs to 12,110 lines of dactylic hexameter in twenty-four books, and the division into " +
        "books is not Homer's: it is Alexandrian, the work of scholars at the Library some five " +
        "hundred years after the poem was composed, which is why they are lettered with the " +
        "twenty-four letters of the Greek alphabet as often as they are numbered. The shape underneath " +
        "that division is the poem's own and is worth knowing before starting. Books 1 to 4 follow " +
        "Telemachus; 5 to 8 bring Odysseus off Calypso's island to the court of the Phaeacians; in 9 " +
        "to 12 he tells that court the story of his own wanderings, so the Cyclops, Circe, the land of " +
        "the dead, the Sirens and Scylla are all told in the first person by a man with reasons to " +
        "make himself sound well; and the remaining twelve books are Ithaca, where he comes ashore at " +
        "the opening of book 13 and spends most of what is left disguised as a beggar in his own " +
        "house, in a slow, domestic, dangerous business of being recognised.",
      "Who Homer was is the oldest open question in classical scholarship and this edition cannot " +
        "settle it. The ancient world took the Iliad and the Odyssey for the work of one blind poet; " +
        "since the eighteenth century the weight of argument has moved towards a long tradition of " +
        "singers, and many scholars now hold that the Odyssey took shape a generation or so after the " +
        "Iliad, in the late eighth or early seventh century BCE. Nothing in the text names its author. " +
        "The repeated epithets and whole repeated lines — the wine-dark sea, rosy-fingered dawn, " +
        "resourceful Odysseus — are the working equipment of oral composition, a system of ready-made " +
        "phrases that let a singer build a line in performance, and they are not the padding they can " +
        "look like on a page.",
      "The translation here is A. T. Murray's, made for the Loeb Classical Library in 1919 and " +
        "printed in two volumes, books 1 to 12 and 13 to 24. It is PROSE, and that is a real choice " +
        "rather than an accident of the edition: Murray was setting his English on the page facing " +
        "the Greek for readers working between the two, so he translates closely and keeps Homer's " +
        "formulae as formulae rather than varying them for effect. His English is deliberately a " +
        "little archaic — thou and thee, aye and sore and verily. What it is not is a poem, and a " +
        "reader who wants the hexameters in English verse should know that is a different book from " +
        "this one.",
      "The small raised figures running through both columns are LINE numbers of the Greek, marking " +
        "where each passage begins — so a reference such as 'Odyssey 9.366' is book 9, line 366, and " +
        "the figures are how you find it. They are also what pairs the two columns: an English " +
        "passage and a Greek one carrying the same figure are the same place in the poem. Two things " +
        "this edition does not give you. Murray's printed page carries 192 footnotes, and the " +
        "transcription used here preserves only the numbers that pointed at them and not a word of " +
        "their text, so they are dropped and there is no fold of notes under the chapters. And the " +
        "Greek column is three lines short of the poem's traditional 12,110: this text omits 10.456, " +
        "16.101 and 23.49, numbering straight past each of them, so those three places stand empty in " +
        "the Greek where the English still translates them.",
    ],

    /* ---------- A TEI EDITION ON BOTH SIDES, and the English one had to be chosen ----------
       Perseus carries TWO English Odysseys and the choice between them is the same one the Iliad's
       entry sets out, which is worth restating rather than cross-referencing because it is a trap on
       a different work rather than a fact about a neighbour.

       · `perseus-eng4` is Samuel Butler's prose — whose own copyright is the easiest available, Butler
         having died in 1902 — and it is NOT usable, because what Perseus carries is not Butler. Its
         header states it plainly, in the title statement as a subtitle and again in the notes: "Based
         on public domain edition of Samuel Butler, revised by Timothy Power and Gregory Nagy." That is
         a substantive modern revision by living scholars, carried by CC BY-SA rather than by an
         expiry.
       · `perseus-eng3` is Murray's Loeb, complete, densely numbered, with no revision layer.

       So the easier copyright is again attached to the text that cannot honestly be shipped as its
       named translator's work, and the harder one to the text that can — and here "harder" costs
       almost nothing, since Murray's own term is the only one either column has to answer for. */
    source: "tei",
    url: "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0012/tlg002/tlg0012.tlg002.perseus-eng3.xml",
    layout: "verse",
    /* The cards are real divisions in the English file and bare milestones in the Greek one, exactly
       as the Iliad's and Ovid's two sides are, so each column says how to find its own. */
    cards: "div",
    /* The translation is prose and the original is verse — the shape the Iliad's import gave
       teiVerseBooks its prose branch for, met a second time in the same translator's other Homer. */
    cardProse: true,
    chapterWord: "Book",
    /* THE TWENTY-FOUR BOOKS HAVE NO TITLES, and this edition prints no headings at all — measured
       rather than assumed: there is not one <head> element in either file. The names a modern reader
       knows — "The Cyclops", "The Slaying of the Suitors", the Telemachy, the Apologoi — are editors'
       and scholars' labels rather than anything the poem or this edition carries, and composing them
       here would be building an apparatus the book has not got. So the tab wears Folio's own chapter
       word and the numeral, and nothing else. */
    titleOf: (n) => "Book " + toRoman(n),
    chapters: Array.from({ length: 24 }, (_, i) => i + 1),
    /* NO `parts`, and the tempting one is the printing's rather than the poem's. The Loeb binds this
       in two volumes, books 1–12 and 13–24, and that break does fall where the poem turns for home —
       but the volume is the binder's unit, the coincidence is not something the edition claims, and
       the divisions a reader may have met (the Telemachy, the wanderings) are modern reading aids.
       Inventing two parts would be composing an apparatus, which the titleOf note above declines to
       do for the book titles for the same reason. */

    /* ---------- THE ORIGINAL, AND WHY IT PAIRS ----------
       The question that decides every original here is not "does a text of it exist?" but "does that
       text say which section each passage is?", because app.js pairs the two columns on the section
       number and never on paragraph order. Homer passes about as well as any work can: he is cited by
       BOOK AND LINE everywhere in every language, both editions state the line, and both are divided
       into the same 288 CARDS — passages of forty-odd lines labelled with the line each one begins at.
       A card number is therefore the same claim on both sides, stated by the editions rather than
       counted off a list. And here the two columns are not merely two editions that agree: they are
       the two halves of one printed opening, so the agreement is nearly by construction.

       MEASURED BEFORE IT WAS BELIEVED, over all twenty-four books: 24 books and 288 cards on each
       side; the card lists of 23 of the 24 books are IDENTICAL; 286 of the 288 numbers appear on both
       sides; no duplicate and nothing out of order on either side.

       THE TWO EXCEPTIONS ARE BOTH IN BOOK 14, one line apart each, and each was READ passage by
       passage before reconcileCards was allowed to move it — which is the discipline that matters
       here, since a Homeric card has no tale name to check a reconciled pair against:
         · English card 147 against Greek 148. The English opens "Then the much-enduring, goodly
           Odysseus answered him"; Greek 148 is τὸν δʼ αὖτε προσέειπε πολύτλας δῖος Ὀδυσσεύς, word for
           word that line, while Greek 147 (ἀλλά μιν ἠθεῖον καλέω καὶ νόσφιν ἐόντα) closes the speech
           before it.
         · English card 234 against Greek 235. The English opens "But when Zeus, whose voice is borne
           afar, devised that hateful journey which loosened the knees of many a warrior"; Greek 235–236
           are ἀλλʼ ὅτε δὴ τήν γε στυγερὴν ὁδὸν εὐρύοπα Ζεὺς / ἐφράσαθʼ, ἣ πολλῶν ἀνδρῶν ὑπὸ γούνατʼ
           ἔλυσε, and Greek 234 closes the sentence before it.
       In both the English boundary is drawn one line early and the passage is the same passage; every
       other card in book 14 agrees, which is the clean re-sync that tells an editor's different cut
       from a misaligned extractor.

       THE GREEK IS THREE LINES SHORT OF THE STANDARD COUNT AND ALL THREE ARE ACCOUNTED FOR, which is
       worth doing rather than glancing at a total, because a count that is nearly right is how a
       truncated import hides. The file carries 12,107 <l> elements. Book by book its own numbering
       runs a clean 1..N against the traditional length of every book, with exactly three gaps —
       10.456, 16.101 and 23.49 — and in each the numbering steps straight over the missing line
       (…455, 457…), so the omission is the EDITION'S and not a line this importer lost. 12,107 + 3 =
       12,110. The edition prints no note explaining them and none is invented here.

       <del> IS INERT IN THIS BOOK AND THAT WAS MEASURED, not assumed: zero <del> elements in either
       file, and zero <gap>. It is worth the measurement every time, since Lucretius's 116 <del> marks
       cost that poem thirty whole lines while the Iliad's cost it four.

       THE WELDING RULE IS WHAT THIS EDITION NEEDS MOST, and the numbers say how much. Murray prints
       Homer's line numbers every fifth line and the transcription sets them inline, hard against the
       words on both sides ("upon the sea,<milestone n="5"/>seeking to win his own life"). Of the 2,434
       line milestones in the English, 2,097 stand between two non-space characters and would weld two
       words together if the tag were simply dropped; 2 of the 192 note stubs do the same. Both are
       replaced with a space by the prose branch of teiVerseBooks rather than removed — see the rule
       there, which this book is the second to depend on and the first to confirm it on.

       TWO RUN-TOGETHER WORDS SURVIVE AND ARE THE SOURCE'S OWN — "in thy insolence,ever roaming about
       the city" at 17.245 and "whatever I shall ask thee;to speak out plainly" in book 8. Each was
       checked against the transcription and is present there verbatim with no tag anywhere near it,
       so they are Perseus's typing rather than anything this importer did, and they are recorded
       instead of repaired: a hand-written list of corrections to somebody else's text is an
       apparatus, and two missing spaces in 701 KB change nothing a reader relies on. It matters
       mainly that they are WRITTEN DOWN, because the same shape — two words welded by a stripped tag
       — is what the rule above exists to prevent in 2,097 other places, and without this paragraph
       the two survivors would read as that rule having failed. The sweep to re-run after any change
       to it is a scan of the shipped chapters for a lower-case letter on both sides of a comma, a
       semicolon or a full stop; today it returns exactly these two and nothing else. */
    original: {
      lang: "grc",
      langName: "Greek",
      source: "tei",
      layout: "verse",
      cards: "milestone",
      url: "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/master/data/tlg0012/tlg002/tlg0012.tlg002.perseus-grc2.xml",
      edition:
        "The Greek printed facing A. T. Murray's translation in the Loeb Classical Library, " +
        "William Heinemann / G. P. Putnam's Sons, London and New York, 1919, from the Perseus " +
        "Digital Library",
      rights:
        "Two layers, both stated. The poem is some twenty-seven centuries old and is in the public " +
        "domain everywhere. The Greek here is the text printed facing Murray's English in the same " +
        "1919 Loeb volumes — before 1929, so its copyright has expired in the United States — and " +
        "the edition used here credits it to Murray as editor, naming no one else; Murray died in " +
        "1940, so it is also public domain wherever the term is the author's life plus seventy " +
        "years, and where the term is life plus a hundred it remains in copyright until 2041. The " +
        "digital edition it is taken from is prepared by the Perseus Digital Library at Tufts " +
        "University and is released under a Creative Commons Attribution-ShareAlike 4.0 " +
        "International licence.",
      sourceName: "Perseus Digital Library",
      sourceUrl: "https://scaife.perseus.org/library/urn:cts:greekLit:tlg0012.tlg002/",
    },
  },

  "virgil-aeneid": {
    title: "The Aeneid",
    author: "Virgil",
    translator: "Theodore C. Williams",
    edition: "Houghton Mifflin Company, Boston, 1910",
    written: "c. 29–19 BCE",
    year: -25,

    /* ---------- THE LICENCE, and it is the EASIEST on the shelf after the four clean ones ----------
       Everything here is stated by a date that can be checked from the editions themselves, and every
       layer clears every rule, so there is no limit to state as the Art of War (Giles, 2029), the
       Nicomachean Ethics (Ross, 2042), the Song of Roland, the Medea (Murray, 2028), Gilgamesh, the
       Gita and the two Homers all need. That puts it with the Republic, the Analects, the
       Peloponnesian War, the City of God and Shakuntala.

       The poem is two thousand years old. Theodore C. Williams's translation was published in Boston
       in 1910 — before 1929, so its United States copyright has expired on exactly the ground Gummere,
       Haines, Giles and Jowett are served on — and he lived 1855–1915, so it also cleared
       life-plus-seventy in 1986 and life-plus-a-hundred in 2016. J. B. Greenough's Latin was published
       by Ginn and Company in Boston in 1881 and he lived 1833–1901, which clears the same three rules
       with a century to spare; Wikisource's author page carries the public-domain-worldwide tag for
       both men outright.

       BOTH DEATH YEARS WERE LOOKED UP RATHER THAN RECALLED, for the Hugo Magnus reason, and Williams's
       needed the Beowulf check on top of it: Wikisource's page for him carries 1855–1915 in its text
       and a stray 1864 in its metadata, which is the shape that made A. J. Wyatt's dates unusable.
       Here it resolves rather than blocking anything — Wikidata gives 1855–1915, and his own biography
       gives 2 July 1855 at Brookline and 6 May 1915 at Boston, so the two independent sources agree at
       day precision and the odd figure is a data slip. A DATE THAT EXISTS IS NOT THE SAME AS A DATE
       THAT IS ESTABLISHED; the difference is whether anything else says the same thing.

       There is a second Williams to keep apart from this one, which the Iliad's entry has already had
       to do for the two Murrays: this is Theodore CHICKERING Williams, the American Unitarian minister
       who translated Virgil and Tibullus, and not any of the several other Williamses who have
       Englished Latin poetry.

       The SECOND layer is Perseus's, and it applies to both columns because both come from there —
       the position the Metamorphoses, On the Nature of Things and the Twelve Caesars are all in.
       Neither of these two files states a licence in its own TEI header, so both are covered by the
       repository's blanket CC BY-SA 4.0, exactly as Suetonius's twenty-two older files are. Named in
       `rights`, printed on the book's own page, credited on the About page.

       BOTH REVISION HISTORIES WERE READ BEFORE THIS WAS CONCLUDED, which is the Antigone's rule and
       the reason it exists: that play found the shipped Oedipus Rex silently carrying a modern
       editorial layer while its `rights` called it clean. Neither of these carries one. The English's
       twenty-odd changes are a 1996 scan and proofread, the XML conversions, and single-word OCR fixes
       ("UIysses for Ulysses", "Glaucus, to Glaucus'"); the Latin's are the same plus a handful of
       readings corrected against the printed source and named individually ("2.338 ullo fremitus
       changed to quo fremitus verified against source", "candientem on 12.91 changed to candentem").
       Typo fixes are not a revision in the sense that matters — nobody is credited with revising the
       translation, and neither file says it has been modernised, as Perseus's Herodotus, Oedipus Rex
       and Antigone all say in their own headers.

       THE OTHER ENGLISH AENEID WAS WEIGHED AND IS NOT USED. Dryden's of 1697 is out of copyright
       everywhere and is the most famous English Virgil there is; it is also heroic couplets in
       seventeenth-century English, which is the objection that ruled out Golding's Ovid and Hobbes's
       Thucydides — the Library is a reading room, and the cleanest text to import is not always the
       one worth reading. Perseus carries no Dryden for the Aeneid in any case, so unlike the
       Nicomachean Ethics's Chase-against-Ross choice this cost nothing: here the readable column and
       the pairable column are the same column.

       The modern translations a reader is likeliest to own — Allen Mandelbaum (1971), Robert
       Fitzgerald (1983), Stanley Lombardo (2005), Robert Fagles (2006), Sarah Ruden (2008), David
       Ferry (2017) and Shadi Bartsch (2021), along with C. Day Lewis's verse of 1952 — are all firmly
       in copyright, and are named here for the reason Campbell, Hays, Griffith, Lee, Humphries and
       Graves are named above: so that nobody reaches for one later. */
    rights:
      "Two layers, both stated, and no limit on either. The poem is two thousand years old and is in " +
      "the public domain everywhere. Theodore C. Williams's translation was published in Boston in " +
      "1910 — before 1929 — so its copyright has expired in the United States; he lived 1855–1915, so " +
      "it is also public domain wherever the term is the author's life plus seventy years or plus a " +
      "hundred. The Latin printed beside it is J. B. Greenough's edition of 1881, and he lived " +
      "1833–1901, which clears the same rules. The digital editions both columns are taken from are " +
      "prepared by the Perseus Digital Library at Tufts University and are released under a Creative " +
      "Commons Attribution-ShareAlike 4.0 International licence. (The modern translations by Allen " +
      "Mandelbaum, 1971, Robert Fitzgerald, 1983, Robert Fagles, 2006, Sarah Ruden, 2008, and Shadi " +
      "Bartsch, 2021, are still in copyright and are not used here.)",
    sourceName: "Perseus Digital Library",
    sourceUrl: "https://scaife.perseus.org/library/urn:cts:latinLit:phi0690.phi003/",

    /* THE FRONT MATTER — chapter 0, authored here for the reasons the Seneca entry sets out above.
       Five things a reader should be told plainly rather than discover late: the poem was unfinished
       when its author died and he wanted it burned, it breaks off in mid-sentence, the numbers running
       through both columns are Latin line numbers, this Latin brackets fifty-four lines as spurious —
       including the whole Helen episode a reader may come looking for — and the Latin column carries no
       quotation marks. The last three would otherwise read as faults in the page. */
    about: [
      "<b>The Aeneid</b> is a poem in twelve books, some ten thousand lines of Latin hexameter, in " +
        "which Virgil follows Aeneas from the burning of Troy to the founding of the Roman race in " +
        "Italy. The first half is a voyage and the second a war: storms and a shipwreck, the queen of " +
        "Carthage who loves Aeneas and kills herself when he leaves, a descent into the underworld to " +
        "meet his father, and then seven books of fighting in Latium against Turnus. It became the " +
        "central poem of Latin literature within its author's lifetime, was taught in Roman schools " +
        "for four centuries, and carried straight on through Dante — who makes Virgil his guide — into " +
        "Milton, Dryden and almost every European epic since.",
      "It is a poem with an argument, and that is the thing most often missed about it. Virgil wrote " +
        "under Augustus, who had ended a century of civil war and claimed descent from Aeneas, and the " +
        "poem gives Rome a founding story reaching back to Troy and a prophecy of empire without end. " +
        "But it is not a celebration, or not only one: it dwells on what the founding costs — Dido " +
        "abandoned, Turnus killed, Italian towns burned — and it ends not in triumph but on Aeneas " +
        "standing over a beaten enemy who has asked for mercy. Readers have argued for two thousand " +
        "years about how much sympathy the poem asks for the losing side, and it does not settle the " +
        "question itself.",
      "Publius Vergilius Maro was born near Mantua in 70 BCE, wrote the <i>Eclogues</i> and the " +
        "<i>Georgics</i> first, and spent the last ten years of his life on this poem. He had not " +
        "finished it. In 19 BCE he went to Greece meaning to spend three more years revising, fell ill " +
        "at Megara, and died at Brundisium on the way home, aged fifty. By the ancient accounts he " +
        "asked for the manuscript to be burned; Augustus overrode him and had it published, and it is " +
        "difficult to think of a literary decision with larger consequences. What that means for a " +
        "reader is that the poem was never revised: it carries a number of half-lines, and the last " +
        "book stops on Turnus's death with no closing scene of any kind.",
      "The small raised figures running through both columns are LINE numbers of the Latin, marking " +
        "where each passage begins — so a reference such as 'Aeneid 6.847' is book 6, line 847, and " +
        "the figures are how you find it. They are also what pairs the two texts: an English passage " +
        "and a Latin one carrying the same figure are the same place in the poem. Williams's blank " +
        "verse runs about a third longer than Virgil's hexameters, so the two columns are never the " +
        "same length line for line, and five passages of the English mark a break where this Latin " +
        "does not, drawing beside an empty cell. This edition prints no translator's notes, so there " +
        "is no fold of them under each chapter.",
      "Two things about the Latin are the edition's doing rather than the poem's. Greenough brackets " +
        "fifty-four lines as not Virgil's, and they are not printed here — most of them in ones and " +
        "twos, but including the twenty-two lines of the second book in which Aeneas sees Helen " +
        "hiding at the threshold of Vesta and means to kill her. It is one of the most discussed " +
        "passages in the poem and a reader who goes looking for it should know why it is absent " +
        "rather than assume something has been lost — Williams translated it, so in the second book " +
        "you will find it in the English with nothing beside it, which is the two editors disagreeing " +
        "in the plainest way the page can show. And this Latin marks speech structurally instead " +
        "of with punctuation, so the Latin column prints no quotation marks at all where the English " +
        "has them; the speeches are still there, and where one begins is a thing the sense tells you " +
        "and the page does not.",
      "One last thing, so that it reads as what it is rather than as a fault here: the English is a " +
        "scan, and about a hundred and twenty of its words carry a capital I where the 1910 page has a " +
        "small l — <i>Iong</i> for long, <i>Ioud</i> for loud, <i>Iofty</i>, <i>Iord</i>. They are left " +
        "exactly as the transcription has them, because the same pattern spells a great many real names " +
        "in this poem — Iulus, Ilium, Italy, Ida, Iris, Ithaca — and in a handful of places there is no " +
        "telling the two apart, <i>Iove</i> being either love or Jove in a poem with room for both. " +
        "Correcting them by guesswork would put words into Williams's mouth that he may not have " +
        "written, which is worse than a reader meeting an obvious misprint and reading straight past it.",
    ],

    /* ---------- A TEI EDITION ON BOTH SIDES, the Ovid shape ----------
       Both columns are Perseus TEI, which is the shape the Metamorphoses established and On the
       Nature of Things confirmed: one file each, fetched over plain HTTPS, cached whole, and the
       section numbers are STRUCTURE rather than something read back out of the prose. There is no
       Wikisource walk here and there does not need to be — the two files carry the same citation
       scheme, which is the whole question an original has to answer.

       WHAT IS NEW IS THAT THE ENGLISH MARKS ITS CARDS TWO WAYS AT ONCE, and it is the reason this
       book needed any code at all. See the long note on cardMarks in teiVerseBooks: 327 of Williams's
       396 card boundaries are <div subtype="card"> and the other 69 are <milestone unit="card"/>
       standing INSIDE a line, because that is where the Latin line they name begins. Read with the
       Ovid setting (`cards: "div"`) the poem is complete, nothing throws, every book pairs — and 69
       passages sit against Latin that is not theirs. Hence `cards: "both"`, which matches either in
       one sweep in reading order, and the lift that moves a mid-line mark to the line's own edge so
       that slicing the book at it cannot cut an <l> in half. */
    source: "tei",
    url: "https://raw.githubusercontent.com/PerseusDL/canonical-latinLit/master/data/phi0690/phi003/phi0690.phi003.perseus-eng2.xml",
    layout: "verse",
    cards: "both",
    chapterWord: "Book",
    /* The twelve books have no titles: this edition gives them none, exactly as Haines's Meditations
       and Magnus's Ovid give theirs none. Composing names for them — "The Sack of Troy", "The
       Underworld" — would be inventing an apparatus the poem does not have. */
    titleOf: (n) => "Book " + toRoman(n),
    chapters: Array.from({ length: 12 }, (_, i) => i + 1),

    /* ---------- THE ORIGINAL, and it is the cleanest pairing of two independently edited texts here
       ----------
       The question every original has to answer is not "does a text of it exist?" but "does that text
       say which section each passage is?", and the Aeneid answers it twice over: it is cited by book
       and line, both editions state the line, and both mark the same CARD boundaries — passages of
       twenty-five or thirty lines labelled with the Latin line each one opens at, which is the one
       figure both editors state about the same thing.

       MEASURED OVER BOTH FILES BEFORE ANY OF IT WAS BELIEVED, all twelve books: 392 Latin cards and
       396 English ones, of which 390 carry the IDENTICAL number, in the same order, with no duplicate
       on either side and nothing out of sequence. NINE OF THE TWELVE BOOKS pair on every card they
       have once the two reconcilable pairs below are settled. Only the Art of War, the Analects and the Gallic War do better, and the first two do it by
       construction — one editor numbering both columns at once. The exceptions are seven rows and
       every one was read rather than reconciled on trust, since the Aeneid carries no tale names for
       reconcileCards to check a moved pair against, which is the position both Homers are in:
         · Latin 7.705 against English 7.706, one line apart. Latin "Ecce Sabinorum prisco de sanguine
           magnum / agmen agens Clausus"; English "Then, one of far-descended Sabine name, / Clausus
           advanced, the captain of a host". Clausus the Sabine on both sides — the same passage, and
           reconciled.
         · Latin 11.397 against English 11.399, two lines apart. Latin "Nulla salus bello. Capiti cane
           talia, demens, / Dardanio"; English "War will not save us? Fling that prophecy / on the
           doomed Dardan's head". Turnus answering Drances on both sides — reconciled.
         · Four English cards have no Latin counterpart at all and draw beside an empty cell, as the
           Metamorphoses' 1.650 and the Histories' 6.122 do: 2.13, 7.45, 12.672 and 12.728. Three of
           the four sit exactly on their own Latin line — English 12.728 is "Soon Turnus, reckless of
           the risk, leaped forth, / upreached his whole height to his lifted sword" against Latin 728
           "Emicat hic, impune putans, et corpore toto / alte sublatum consurgit Turnus in ensem" — so
           they are places Williams divides and Greenough does not, rather than anything mislaid. The
           fourth, 12.672, falls three lines from its content and is recorded rather than moved, there
           being no Latin card within reach to move it to.
         · AND A FIFTH, 2.567, WHICH IS THERE FOR A DIFFERENT REASON AND IS THE ONE WORTH KNOWING.
           Greenough DOES divide at 2.567; his card is the Helen episode, and he brackets every one of
           its twenty-two lines as spurious, so once the <del> rule has run there is nothing left in it
           and the card is dropped as empty — with a warning naming it on every run, which is how this
           was found rather than assumed. So 391 Latin cards ship, not 392, and the English passage in
           which Aeneas comes on Helen at Vesta's threshold draws beside an empty Latin cell. That is
           the honest rendering and it reads as one: Williams translated the passage, Greenough declined
           to print it, and the page shows exactly that.
       Note what books 2 and 7 do, because it is a pleasing check rather than a fault: the two English
       cards with no counterpart at 2.13 and 7.45 are exactly the two lines where GREENOUGH sets a
       paragraph break of his own. Both editors mark a division there; only one of them calls it a card.

       THE LINE COUNT IS ONE OVER THE STANDARD AND FIFTY-FOUR UNDER IT, and both figures are accounted
       for, which is the arithmetic to run rather than the total to glance at — a count that is nearly
       right is how a truncated import hides. The traditional Aeneid is 9,896 lines and this file holds
       9,897 <l> elements: book by book its numbering runs a clean 1..N against the traditional length
       of every book, and the one extra is book 10's <l n="62b" part="F">, a half-line Greenough sets
       apart, which the file's own revision history records being renumbered for in 2015. Of those
       9,897, fifty-four are wrapped whole in <del> — the editor's mark of what he takes to be
       spurious — and are dropped with their words on the judgement the Meditations' Greek established
       and Ovid, Lucretius and the Iliad have each followed since: what ships is the text the printed
       page constitutes. So 9,843 lines of Latin ship. That is LUCRETIUS'S FINDING AT NEARLY TWICE THE
       SCALE and it is exactly why that entry says to measure it rather than assume the rule is inert:
       116 <del> marks cost that poem thirty lines, the Iliad's cost it four, the Odyssey has none at
       all, and this one loses fifty-four — 2.567–588, the Helen episode, being twenty-two of them in
       one run. AND HERE THEY COST A WHOLE CARD, which no earlier book on this path has: that run is
       the entirety of Greenough's card 567, so the card empties and is dropped, taking the Latin from
       392 cards to 391. Lucretius's rule therefore wants stating one notch stronger than that entry
       puts it — measure what <del> costs in LINES and then measure what it costs in CARDS, because a
       card that empties changes the pairing and a line that goes does not. The book's own front matter
       tells a reader what is missing and why.

       THIRTEEN OF THE LIFTED CARD MARKS WERE KEEPING TWO WORDS APART, which is the Iliad's welding
       fault in a fourth edition and is measured rather than assumed — see the note on the lift in
       teiVerseBooks. ONE RUN-TOGETHER SURVIVES AND IS THE SOURCE'S OWN: book 6 line 1171 reads "With
       polished ivory, the.dead employ" in Perseus's file verbatim, with no tag anywhere near it, so it
       is their OCR and not anything this importer did. Recorded rather than repaired, for the Odyssey's
       reason — a hand-written list of corrections to somebody else's text is an apparatus — and
       recorded chiefly so that it cannot later be read as the space rule having failed. The sweep to
       re-run after any change to that rule is a scan of the shipped chapters for a letter on both sides
       of a full stop, comma, colon or semicolon; today it returns this one line in the English and
       nothing at all in the Latin.

       THE ENGLISH TRANSCRIPTION ALSO CARRIES ABOUT 120 l→I OCR SLIPS, and they are recorded here rather
       than repaired, which is a decision and not laziness. Perseus's scan reads a lower-case l as a
       capital I in 115 words unambiguously — "Iong" for long 20 times, "Ioud" 12, "Iost" 11, "Iofty"
       10, "Iord" 8, "Iying" 7, across 32 distinct words — and in 8 more it is genuinely undecidable,
       "Iove" being either love or Jove and this poem full of both. The file's own revision history shows
       Perseus fixing this class when they notice it ("ocr error—UIysses for Ulysses"), so these are
       simply the ones they have not reached.
       THE REASON NOT TO FIX THEM IS THAT THE PATTERN IS NOT SEPARABLE BY RULE. The same shape produces
       real Virgilian names in the same text — Iulus 37 times, Ilium 19, Italy 52, Ida, Iris, Ithaca,
       Iapyx, Ismarus, Imbrasides, Io — so any repair would be a hand-written list of corrections to
       somebody else's translation, which is the apparatus this file declines to compose everywhere else,
       and on "Iove" and "Io" it would risk substituting the wrong word outright. Deciding those eight
       would mean collating against the 1910 printing, which is a different job from importing it. So the
       count is measured, written down, and said to the reader in the front matter, which is the same
       treatment the Odyssey's two welds and the Iliad's thirteen get.

       ONE <gap extent="unknown" unit="lines" reason="lost"/> stands inside book 12 line 732, where
       Turnus's sword breaks. It marks text the edition does NOT have, so nothing this importer prints
       is short of the source; it is recorded because a lacuna vanishing into a tag sweep is the kind
       of thing that should be measured once and written down rather than discovered twice. */
    original: {
      lang: "la",
      langName: "Latin",
      source: "tei",
      layout: "verse",
      cards: "milestone",
      url: "https://raw.githubusercontent.com/PerseusDL/canonical-latinLit/master/data/phi0690/phi003/phi0690.phi003.perseus-lat2.xml",
      edition:
        "J. B. Greenough's edition, in The Bucolics, Aeneid, and Georgics of Virgil, Ginn and " +
        "Company, Boston, 1881, from the Perseus Digital Library",
      rights:
        "Two layers, both stated, and no limit on either. The poem is two thousand years old and is " +
        "in the public domain everywhere, and J. B. Greenough's edition of it was published in " +
        "Boston in 1881; he lived 1833–1901, so it is public domain on the United States publication " +
        "rule and wherever the term is the editor's life plus seventy years or plus a hundred. The " +
        "digital edition it is taken from is prepared by the Perseus Digital Library at Tufts " +
        "University and is released under a Creative Commons Attribution-ShareAlike 4.0 " +
        "International licence.",
      sourceName: "Perseus Digital Library",
      sourceUrl: "https://scaife.perseus.org/library/urn:cts:latinLit:phi0690.phi003/",
    },
  },

  "journey-to-the-west": {
    title: "Journey to the West",
    author: "Wu Cheng'en",
    /* THE ATTRIBUTION IS TRADITIONAL AND CONTESTED, and the shelf says so on the book's own page
       rather than in a hedge nobody reads. The novel was printed anonymously in 1592; Wu Cheng'en's
       name was attached to it by Qing scholars on the strength of a county gazetteer listing a work
       of that title among his writings, and a good deal of modern scholarship is unconvinced. It is
       the name under which the book is catalogued in every language, so it is the name on the spine.
       Richard's own title page says something else again — see `rights`. */
    translator: "Timothy Richard",
    edition:
      "A Mission to Heaven: A Great Chinese Epic and Allegory, The Christian Literature Society's " +
      "Depot, Shanghai, 1913",
    written: "1592",
    /* The date of the earliest surviving printing, the Shidetang edition of 1592, which is the only
       date the book itself supports; when it was composed is not known. */
    year: 1592,

    /* ---------- THE LICENCE — one modern layer, and no limit to state ----------
       The novel is a Ming work of the sixteenth century and free everywhere. The only modern layer
       is Richard's translation, published in Shanghai in 1913, and he lived 1845–1919 — dates looked
       up on Wikidata at day precision and corroborated by its own description, rather than recalled.
       So it is public domain in the United States on the pre-1929 publication rule, and out of
       copyright wherever the term is the translator's life plus seventy years (expired 1990) or plus
       a hundred (expired 2020). That puts it with the plainest licences on this shelf and there is no
       limit to state.

       WHAT IS AND IS NOT TAKEN. The hundred chapters. Richard's dedication, his long introduction
       arguing the novel is a disguised Nestorian Christian allegory, and the plates are left behind.

       THE COMPLETE MODERN TRANSLATIONS ARE ALL IN COPYRIGHT and are named here so that nobody
       reaches for one later: Arthur Waley's Monkey (1942) — which is also an abridgement, thirty of
       the hundred chapters — Anthony C. Yu's four volumes (1977–1983, revised 2012), which is the
       complete scholarly translation and the one to buy, W. J. F. Jenner's (1982–1986) and Julia
       Lovell's Monkey King (2021). */
    rights:
      "Public domain, on every ground, with nothing to qualify. The novel is a Chinese work of the " +
      "sixteenth century, first printed in 1592, so the words behind it have been free for as long " +
      "as copyright has existed. The only modern layer is the translation: Timothy Richard published " +
      "it in Shanghai in 1913 and lived from 1845 to 1919, so it is public domain in the United " +
      "States, where the term for a work published before 1929 has expired, and out of copyright " +
      "wherever the term is the translator's life plus seventy years or plus a hundred. Richard's " +
      "dedication, his introduction and the plates are not reproduced here; what is taken is the " +
      "hundred chapters. (The complete modern translations — Anthony C. Yu's of 1977–1983, revised " +
      "in 2012, W. J. F. Jenner's of 1982–1986 and Julia Lovell's of 2021, and Arthur Waley's " +
      "abridgement Monkey of 1942 — are all still in copyright and are not used.)",

    about: [
      "<i>Journey to the West</i> is one of the four great novels of Ming China and, by a wide " +
        "margin, the most read. Behind it is a real journey: in 629 a monk named Xuanzang left " +
        "Tang China without permission, walked to India, spent sixteen years there and came back " +
        "with hundreds of Buddhist texts to translate. Nine centuries of storytelling turned that " +
        "into something else entirely. In the novel the monk is a timid and rather exasperating " +
        "holy man escorted by three converted monsters, and the one everybody remembers is the " +
        "first of them — Sun Wukong, the Monkey King, born from a stone egg, who learns immortality " +
        "and seventy-two transformations, fights the entire bureaucracy of heaven to a standstill " +
        "over a stolen banquet, and is pinned under a mountain for five hundred years until the " +
        "pilgrimage gives him something better to do. The book is a comedy, a satire on officialdom " +
        "in this world and the next, and a religious allegory, usually on the same page.",
      "The English here is the first there ever was, and a reader should know exactly what it is " +
        "before opening it. Timothy Richard was a Welsh Baptist missionary who spent forty-five " +
        "years in China, and he published this in Shanghai in 1913 under the title <i>A Mission to " +
        "Heaven</i>. Most of it is not a translation. He renders about ten chapters at something " +
        "like full length — the seven that tell Monkey's story, and three near the end — and the " +
        "rest he condenses, most of them to a few hundred words. He says so himself: under the " +
        "heading of eighty-nine of the hundred chapters he prints the word <i>[outline.]</i>, and " +
        "that mark is kept exactly where he put it. The eleven he leaves unmarked average about " +
        "3,700 words and the eighty-nine marked ones about 570, so the mark is a reliable guide " +
        "even though it is not a strict one — the last chapter carries it and is the longest in the " +
        "book, and chapter 88 carries no mark and is plainly a summary all the same.",
      "That is a real limitation and it is not a hidden one. Every complete English translation is " +
        "still in copyright, and this library serves only books whose copyright has expired, so the " +
        "choice was this text or none. What makes it worth having anyway is the column beside it: " +
        "the Chinese is the whole novel, all hundred chapters, nothing summarised. This is the one " +
        "book here where the original is the fuller of the two texts, and on the chapters Richard " +
        "outlined it is not merely fuller but the only place the story is actually told.",
      "Richard also read the novel as a secretly Christian book — a Nestorian allegory smuggled " +
        "into Chinese fiction — and believed it had been written by the Taoist master Qiu Chuji, " +
        "who died three centuries before it appeared. Both ideas are on his title page and neither " +
        "is now accepted. They colour his English more than his introduction does: heaven acquires " +
        "angels and cherubim, the Jade Emperor's court starts to sound like a Christian one, and " +
        "the Buddhist vocabulary is repeatedly rendered in the words of another religion. Read it " +
        "as one missionary's account of what he thought the book was, rather than as what the " +
        "Chinese says.",
      "The chapter titles are his, in the capitals his printer set them in, and the text has been " +
        "read by a machine rather than a person: about one word in two hundred carries a slip of " +
        "the sort a scanner makes, and they are left as they are rather than corrected by guess. " +
        "Only one copy of this book has ever been transcribed, and this is it.",
    ],

    /* THE TRANSCRIPTION IS AN OCR, AND IT IS THE ONLY ONE THERE IS. Neither Wikisource nor any other
       transcription project carries this book in any language; what exists is the Internet Archive's
       scan of the Cornell copy with its machine-read text layer. Measured before it was accepted:
       about one word in two hundred carries a slip, which is a good deal better than it sounds and
       is why the book is here at all — the damage is in the letters ("Avas" for "was", "vmitcd" for
       "united", "deviL" for "devil"), never in whole lines, and it is recorded rather than repaired,
       since a repair pass over ninety thousand words would be rewriting somebody's book by guess. */
    sourceName: "Internet Archive",
    sourceUrl: "https://archive.org/details/cu31924074502034",
    source: "html",
    layout: "journey",
    url: "https://archive.org/download/cu31924074502034/cu31924074502034_djvu.txt",
    chapterWord: "Chapter",
    chapters: Array.from({ length: 100 }, (_, i) => i + 1),
    /* The one running head the OCR split across two lines, so that the line sweep can see neither
       half — see the note beside `runningHead` in extractJourney. Declared here because it is this
       edition's own running title and nobody else's, which is why dropHeads is declared per book too.
       Two of them are broken that way, and the page number is not always digits ("U2", "Mo") nor the
       title always spelled ("MISSION TO HEA^TiN"), so the stable part is "MISSION TO HEA" and what
       sits either side of it is allowed to be any short token. That cannot reach prose: it matches
       only a block whose WHOLE text is those three words with at most one short token at each end,
       and no paragraph of a novel is that. */
    runningHead: /^(?:\S{1,4}\s+)?MISSION TO HEA\S{0,4}(?:\s+\S{1,4})?$/i,
    /* THE TITLES ARE READ OFF THE BODY HEADINGS AND THE CAPITALS ARE KEPT, which is a measurement
       rather than a habit. The printed page heads each chapter in capitals, so its case is not
       recoverable there — but unlike most books set that way this one ALSO prints a contents page in
       title case, so the case looked recoverable from it. It is not: compared chapter by chapter, the
       contents page agrees with the body heading on 53 of the 100 and the disagreements are its own
       OCR ("Eeeonciliation", "Tt-rragli Dead, shall live", "Bartdhists and Taoists compete"). The
       body headings are much the cleaner reading, so they are what ships, capitals and all.
       THREE OF THEM CARRY A VISIBLE SLIP and are left as they are: "HUEN CHWA^^G'S PARENTAGE" (9),
       "COlSrVERTED BY KWANYIN" (42) and "TflE THREE DEMONS" (74). The contents page happens to read
       the second cleanly and mangles the first differently again, which is exactly why it is not
       used as a corrector: repairing three tabs by choosing between two damaged readings is editing
       somebody's book by guess, and the same judgement is made about the ~400 letter-slips in the
       prose. Leading scan dirt is a different thing and does go — see the note in extractJourney.

       No `parts`. The edition divides the book into a hundred chapters and nothing above them, so the
       Contents panel falls back to a single unlabelled group. The three movements a reader may have
       met elsewhere — Monkey's origin, Tripitaka's, and the pilgrimage — are not this edition's
       divisions and composing them here would be composing an apparatus.

       The floor stays at the default 200: Richard's shortest chapter is an outline of about seven
       hundred characters, so nothing here needs a lower guard. */

    /* ---------- THE ORIGINAL, WHICH IS THE FULLER OF THE TWO COLUMNS ----------
       Everywhere else on this shelf the translation is the complete text and the original is the
       harder thing to find. Here it is the other way about, and that is the fact this book turns on:
       the Chinese is all hundred chapters entire, and the English beside it renders about ten of
       them at length and condenses the rest.

       THE PAIRING IS THE CHAPTER, which is what the work is divided into, what both editions state
       and how any passage of it is cited in any language. Neither side numbers anything inside a
       chapter, so there is nothing finer to pair on and none is invented: one row per chapter, each
       column at its own length. It is a coarse join and a true one — nothing is claimed about where
       in the Chinese a given English sentence falls, which on a text this unevenly rendered is the
       only honest thing to claim.

       AND THE NUMBERING WAS CHECKED RATHER THAN ASSUMED, because this novel has a known place where
       two recensions disagree. The story of Tripitaka's parentage is chapter 9 in the Qing recension
       and stands outside the numbered sequence in the earlier one, so the two orderings run a chapter
       apart from there to the end. Measured on the source itself: this transcription's index and its
       own chapter 9 both carry 陳光蕊赴任逢災, the parentage story, which is Richard's chapter IX
       word for word in subject, and chapters 10, 11 and 12 follow his X, XI and XII exactly. So the
       two columns agree chapter for chapter over all hundred.
       ITS 附錄 IS NOT A 101st CHAPTER and is deliberately not fetched: it is a second copy of that
       same ninth chapter, carrying the other recension's placement in a note of its own. */
    sections: "whole",
    original: {
      lang: "zh",
      langName: "Chinese",
      perChapter: true,
      wiki: "zh.wikisource.org",
      page: (n) => "西遊記/第" + String(n).padStart(3, "0") + "回",
      /* This transcription names no printed edition anywhere on the work's own page — it says only
         that the novel is Ming, in 20 volumes and 100 chapters — so none is asserted here. What can
         be said is what it is and where it came from, which is what a reader needs to check it. */
      edition: "西遊記, as transcribed at Chinese Wikisource; the transcription names no printed edition",
      rights:
        "Public domain worldwide: the novel was first printed in 1592, so no copyright has subsisted " +
        "in the words for as long as copyright has existed.",
      sourceName: "Wikisource (Chinese)",
      sourceUrl: "https://zh.wikisource.org/wiki/%E8%A5%BF%E9%81%8A%E8%A8%98",
      /* Typed onto the wiki rather than transcluded from a scan, so there is no transclusion wrapper
         to slice at, and the novel's constant quoted verse — the poems that open a scene or describe
         a mountain — is set as a definition list, which the tag stripper would unwrap into run-on
         prose on a book that is half poetry. */
      body: "plain",
      verse: "dl",
    },
  },

  "canterbury-tales": {
    title: "The Canterbury Tales",
    author: "Geoffrey Chaucer",
    translator: "John S. P. Tatlock and Percy MacKaye",
    edition:
      "The Complete Poetical Works of Geoffrey Chaucer, Now First Put into Modern English, " +
      "The Macmillan Company, New York, 1912",
    written: "c. 1387–1400",
    /* The years Chaucer is thought to have worked on it; he died in 1400 and left it unfinished. The
       sort key is the earlier end, which is all a shelf ordered by date can use. */
    year: 1387,

    /* ---------- THE LICENCE — a limit on the translation, and nothing to say about the rest ----------
       Three layers, and two of them are clear on every ground. Chaucer died in 1400. Walter W. Skeat's
       Middle English text, which is the facing column, was published at the Clarendon Press in 1900 and
       he died in 1912, so it clears pre-1929 publication, life-plus-seventy and life-plus-a-hundred
       alike.

       THE TRANSLATION IS THE HALF THAT NEEDS A LIMIT STATED. Tatlock and MacKaye published in 1912, so
       it is public domain in the United States, where the term for a work published before 1929 has
       expired. A joint work's life-plus-seventy runs from the LAST surviving author: Tatlock lived
       1876–1948 and MacKaye 1875–1956, so in the countries whose term is life plus seventy it stays in
       copyright until the first day of 2027, and where the term is life plus a hundred until 2057.
       Their dates were looked up rather than recalled and corroborated twice over — the library
       catalogue record carried in the scan's own metadata gives both, and so does each man's
       biography. It is the closest a stated limit on this shelf has come to expiring, and it is said
       out loud rather than rounded into the easier sentence.

       WHAT IS AND IS NOT TAKEN. The Prologue and the twenty-four tales, from both editions. Left
       behind: the translators' preface, their glossary and notes and their sketch of Chaucer's life;
       Skeat's introduction, his footnotes of variant readings, his marginal summaries and his
       marginal line numbering; the plates in both volumes; and the Tale of Gamelyn, which Skeat prints
       as an appendix to Group A and says is not Chaucer's, and which the translators do not render at
       all.

       THE MODERN TRANSLATIONS ARE ALL IN COPYRIGHT and are named here so that nobody reaches for one
       later: Nevill Coghill's verse of 1951, which is the one most readers have met, David Wright's of
       1985, Burton Raffel's of 2008 and Peter Ackroyd's retelling of 2009. */
    rights:
      "Public domain in the United States, with a limit to state elsewhere. Chaucer died in 1400, so " +
      "the poem itself has been free for as long as copyright has existed, and the Middle English " +
      "column is Walter W. Skeat's text of 1900 — he died in 1912, so it is out of copyright on every " +
      "ground with nothing to qualify. The translation is the half that needs a date. John S. P. " +
      "Tatlock and Percy MacKaye published it in 1912, which puts it in the public domain in the " +
      "United States under the rule for works published before 1929; but a work of two hands runs its " +
      "term from the last of them to die, and MacKaye lived until 1956, so in countries where the " +
      "term is the authors' lives plus seventy years it remains in copyright until the beginning of " +
      "2027, and where it is life plus a hundred until 2057. The translators' preface, glossary and " +
      "notes, Skeat's introduction and apparatus, and the plates in both volumes are not reproduced; " +
      "what is taken is the Prologue and the twenty-four tales. (The modern translations — Nevill " +
      "Coghill's of 1951, David Wright's of 1985, Burton Raffel's of 2008 and Peter Ackroyd's " +
      "retelling of 2009 — are all still in copyright and are not used.)",

    about: [
      "In the spring of some year near the end of the fourteenth century, twenty-nine pilgrims fall " +
        "in together at an inn in Southwark and set out for the shrine of Thomas Becket at " +
        "Canterbury. The innkeeper rides with them and proposes a competition: two tales each on the " +
        "way out and two on the way home, and the best of them wins a supper at everyone else's " +
        "expense. Chaucer never got near that arithmetic — twenty-four tales survive and the company " +
        "never reaches Canterbury — but the frame gave him something no English poet had had before, " +
        "which is a reason to write in every register at once. A knight tells a romance of chivalry " +
        "and the miller, drunk, answers it with a filthy joke about a carpenter's wife. A pardoner " +
        "explains at length how he cheats his congregation and then tries the same trick on the " +
        "pilgrims. The Wife of Bath argues for five husbands and her own authority over the whole " +
        "tradition of writing about women. It is the first great book in English, and it is a book " +
        "about people rather than about virtue.",
      "The English here is a translation, and a reader should know what kind before opening it. " +
        "Chaucer wrote in verse, and John S. P. Tatlock and Percy MacKaye put the whole of him into " +
        "modern PROSE in 1912 — so the rhyme and the metre are gone, and with them a good deal of the " +
        "comedy, which in Chaucer often lives in the rhyme. What is gained is that a reader who has " +
        "never met Middle English can follow the story at reading speed. They worked from Skeat's " +
        "text, which is the column facing them here, so the two agree line for line about what the " +
        "poem says even where they sound nothing alike.",
      "They also cut, and the cuts are worth naming because they are not evenly spread. Two of the " +
        "tales are prose in the original and very long — the Tale of Melibeus and the Parson's Tale, " +
        "which together run to some fifty thousand words of moral argument — and the translators give " +
        "what their preface calls specimens of each: about a tenth of the whole. Five further " +
        "passages are dropped as too coarse for 1912 and marked with a row of asterisks, which is " +
        "printed here exactly where they printed it. Smaller omissions for the same reason are not " +
        "marked at all, and the preface says so. Everything they left out is in the Middle English " +
        "beside it.",
      "That column is Walter W. Skeat's, published at the Clarendon Press in 1900 and still the text " +
        "most editions descend from. It is complete: the Prologue and all twenty-four tales, some " +
        "seventeen thousand lines of verse and the two prose tales entire. Chaucer's own rubrics are " +
        "kept in both columns — the little Latin and English formulas announcing that a tale is " +
        "beginning or ended — because they are part of how the book was read. What is not reproduced " +
        "is Skeat's apparatus: the footnotes recording what each manuscript reads, the summaries he " +
        "prints in the margin, and the line numbers he sets every fifth line. The line number is the " +
        "way any passage of Chaucer is cited, and it is left out for a plain reason — the prose " +
        "column states nothing to set it against, so a number there would be pointing at a place the " +
        "facing page cannot find.",
      "The two texts are therefore set against each other one tale at a time. Neither states anything " +
        "smaller that the other also states, so nothing is claimed here about which sentence of the " +
        "prose answers to which line of the verse; the row is the tale, and each column runs at its " +
        "own length inside it. One more thing is missing on purpose: Skeat's volume closes with the " +
        "Tale of Gamelyn, a poem found in some manuscripts of the Cook's unfinished tale, which he " +
        "prints as an appendix and says is not Chaucer's. The translators do not render it, and it is " +
        "not here.",
    ],

    /* THE TRANSLATION IS A PLAIN-TEXT OCR and the only copy of this edition that can be opened at all.
       Every other transcription of it is either a lending-restricted scan or a fragment: English
       Wikisource carries the 1914 Duffield selection of the Prologue and ten tales, and that
       transcription is FRONT MATTER ONLY — the tale pages do not exist. Measured before a word was
       imported, which is the check this file keeps prescribing and the reason a shelf of complete
       books is a shelf of books somebody counted.

       The scan itself is unusually clean for a machine reading — the whole run of the Canterbury Tales
       yields about forty blocks of scanner dirt and they are reported by name on every run — but it is
       a machine reading all the same, and the odd letter is wrong. Left as it is rather than repaired
       by guess. */
    sourceName: "Internet Archive",
    sourceUrl: "https://archive.org/details/completepoetical0000chau_q3l3",
    source: "html",
    layout: "chaucer",
    url: "https://archive.org/download/completepoetical0000chau_q3l3/completepoetical0000chau_q3l3_djvu.txt",
    chapterWord: "Tale",
    chapters: Array.from({ length: CANTERBURY_TALES.length }, (_, i) => i + 1),
    titleOf: (n) => CANTERBURY_TALES[n - 1].t,
    /* THE FRAGMENTS, which is what Chaucer scholarship calls the nine groups the tales survive in and
       which this very edition prints as headings over them — Group A through Group I. They are read
       off the Middle English column's own pages rather than composed here, and they are the only
       division either edition makes above the tale. */
    parts: [
      { n: 1, from: 1,  to: 5,  t: "Group A" },
      { n: 2, from: 6,  to: 12, t: "Group B" },
      { n: 3, from: 13, to: 14, t: "Group C" },
      { n: 4, from: 15, to: 17, t: "Group D" },
      { n: 5, from: 18, to: 19, t: "Group E" },
      { n: 6, from: 20, to: 21, t: "Group F" },
      { n: 7, from: 22, to: 23, t: "Group G" },
      { n: 8, from: 24, to: 24, t: "Group H" },
      { n: 9, from: 25, to: 25, t: "Group I" },
    ],
    /* THE HEADING THE TRANSLATION PRINTS INSIDE A TALE, and there is exactly one. Every other line of
       capitals in the run of the Canterbury Tales is a running head or the caption of a plate, and
       both go; Chaucer's envoy at the end of the Clerk's Tale is a heading over the text and stays.
       Declared per book for the reason dropHeads is: a line worth deleting in one edition is the text
       in another, and every distinct line the sweep does delete is printed on the run so that a
       heading cannot go quietly. */
    keepHead: /^L.ENVOY DE CHAUCER$/i,
    /* One row per tale. Neither edition numbers anything inside a tale that the other numbers too —
       see the note on `original` below — so there is nothing finer to pair on and none is invented. */
    sections: "whole",

    /* ---------- THE ORIGINAL, WHICH IS THE COMPLETE ONE ----------
       THE PAIRING IS THE TALE, and unusually it is not a compromise between two editions but the same
       editor read twice: the translators state in their preface that they follow Skeat's text
       throughout, and Skeat's text is this column. So the two divide the work identically, in the same
       order, with the same twenty-five units — there is no reconciliation to do and no exception to
       record.

       WHAT THERE IS NO KEY FOR IS ANYTHING BELOW THE TALE. Skeat prints a line number in the margin
       every fifth line, which is how Chaucer is cited in every language; the prose translation prints
       nothing at all. A number on one side and silence on the other pairs by luck at best, so the row
       is the tale and each column runs at its own length within it. It is a coarse join and a true
       one.

       THE TWO PROSE TALES ARE WHERE THE COLUMNS DIVERGE IN LENGTH, and the figures are worth having:
       measured over the shipped files, the translation runs to about 136,000 words against the
       original's 185,000, and nearly all of that difference is the Tale of Melibeus (2,100 words
       against 18,200) and the Parson's Tale (4,100 against 32,200), which the translators abridge to
       specimens and say so. Take those two out and the verse tales run 130,000 against 135,000, which
       is prose against verse rather than anything missing.

       THE SOURCE IS PROJECT GUTENBERG, which is new to this shelf and was chosen by measurement. The
       obvious source is Wikisource, which carries Skeat's Volume IV as a title page, a contents list
       and twenty-eight red links: not one tale is transcribed. Its only complete Middle English
       Canterbury Tales is a text tagged "no source" — no edition named, no editor, no scan behind it —
       and a medieval poem has to be constituted from its manuscripts before anyone can read it, so an
       unattributed Middle English text is a text whose copyright cannot be reasoned about at all. */
    original: {
      lang: "enm",
      langName: "Middle English",
      source: "text",
      layout: "skeat",
      url: "https://www.gutenberg.org/cache/epub/22120/pg22120.txt",
      edition:
        "The Complete Works of Geoffrey Chaucer, Vol. IV: The Canterbury Tales: Text, edited by " +
        "Walter W. Skeat, second edition, Oxford at the Clarendon Press, 1900",
      rights:
        "Public domain worldwide, on every ground. Chaucer died in 1400; Walter W. Skeat published " +
        "this text at the Clarendon Press in 1894 and revised it for the second edition of 1900, and " +
        "he died in 1912 — so it is out of copyright under the rule for works published before 1929, " +
        "under the term of the editor's life plus seventy years, and under life plus a hundred. " +
        "Skeat's introduction, his footnotes of variant readings, his marginal summaries and his " +
        "appendix of the Tale of Gamelyn are not reproduced; what is taken is the Prologue and the " +
        "twenty-four tales.",
      sourceName: "Project Gutenberg",
      sourceUrl: "https://www.gutenberg.org/ebooks/22120",
    },
  },

  "divine-comedy": {
    title: "The Divine Comedy",
    author: "Dante Alighieri",
    translator: "Henry Wadsworth Longfellow",
    edition:
      "The Divine Comedy of Dante Alighieri, translated by Henry Wadsworth Longfellow, " +
      "Ticknor and Fields, Boston, 1867",
    written: "c. 1308–1321",
    /* The poem was begun in exile and finished in the year Dante died; the shelf sorts on one
       number and this is the early end of the range the front matter states. */
    year: 1308,

    /* ---------- THE LICENCE — clear on every ground, and the SEVENTH here needing no qualification
       Dante died in 1321, so the poem is free everywhere and has been for six centuries. Henry
       Wadsworth Longfellow published this translation in 1867 and lived from 1807 to 1882 — dates
       read off Wikidata and matching the Wikisource author page's own PD-old tag, checked rather
       than recalled for the Hugo Magnus reason — so it is public domain in the United States under
       the pre-1929 publication rule, cleared life plus seventy in 1953, and has cleared life plus a
       hundred as well. There is no limit to state and no modern editorial layer to declare.

       WHAT IS AND IS NOT TAKEN. Only the poem. Longfellow's 1867 volumes also carry several hundred
       pages of his own notes, a Conspectus, an index and a set of illustrations, and none of that is
       imported. Two of the transcribed canto pages carry the caption of a Blake engraving bound into
       the volume; those sit outside the verse and are dropped and reported, which the run prints.

       THE MODERN TRANSLATIONS a reader is likeliest to own — Dorothy L. Sayers's (1949–62), John
       Ciardi's (1954–70), Mark Musa's (1971–84), Allen Mandelbaum's (1980–84), Robert and Jean
       Hollander's (2000–07), Robin Kirkpatrick's (2006–07), Clive James's (2013) and Mary Jo Bang's
       — are all firmly in copyright and are named here so that nobody reaches for one later. */
    rights:
      "Public domain worldwide, on every ground. Dante Alighieri died in 1321, so the poem itself " +
      "has been free for six centuries. Henry Wadsworth Longfellow published this translation in " +
      "1867 and lived from 1807 to 1882, so it is public domain in the United States under the " +
      "pre-1929 publication rule and out of copyright wherever the term is the author's life plus " +
      "seventy or even a hundred years — there is no limit to state. Longfellow's own notes, his " +
      "Conspectus, his index and the volumes' illustrations are not reproduced; what is taken is " +
      "the hundred cantos of the poem. (The modern translations by Dorothy L. Sayers, 1949–62, " +
      "John Ciardi, 1954–70, Mark Musa, 1971–84, Allen Mandelbaum, 1980–84, Robert and Jean " +
      "Hollander, 2000–07, Robin Kirkpatrick, 2006–07, and Clive James, 2013, are still in " +
      "copyright and are not used.) There is no Italian column here, and the reason is a copyright " +
      "in the modern editing rather than in the poem — the book's own first page explains it.",
    sourceName: "Wikisource",
    sourceUrl: "https://en.wikisource.org/wiki/Divine_Comedy_(Longfellow_1867)",

    /* ---------- THE FRONT MATTER — chapter 0 ----------
       What a reader needs before they start: what the poem is and what shape it has; that its
       hundred cantos are built on a rhyme that pulls forward, which is why the translation reads as
       it does; that it is full of real people and a real quarrel; what Longfellow's version is and
       how it came to be made; why the Italian is not printed beside it, which a reader who knows
       the poem will ask first; and how this edition is set out. */
    about: [
      "<b>The Divine Comedy</b> is the account of a journey through the three realms of the " +
        "Christian afterlife, made in the week of Easter 1300 by a living man who is also the poet " +
        "writing it. Dante loses the road in a dark wood, is met by the shade of the Roman poet " +
        "<b>Virgil</b>, and is taken down through the circles of Hell, up the terraces of the " +
        "mountain of Purgatory and out through the spheres of Paradise. It runs to <b>14,233 " +
        "lines</b> in a hundred cantos, and it is the poem in which the Italian language arrived " +
        "fully formed. Dante called it simply the <i>Comedy</i> — a comedy in the medieval sense, a " +
        "story that begins in trouble and ends in joy, written in the speech of ordinary people " +
        "rather than in Latin. The <i>Divine</i> was added by later admirers and has never come off.",
      "Its architecture is as deliberate as a cathedral's, and the numbers are part of the meaning. " +
        "Three canticles — <b>Inferno</b>, <b>Purgatorio</b>, <b>Paradiso</b> — of thirty-three " +
        "cantos each, with one canto of introduction at the head of the Inferno, which makes a " +
        "hundred. Each canticle ends on the word <i>stelle</i>, the stars. The verse is " +
        "<b>terza rima</b>, a form Dante appears to have invented for it: interlocking tercets " +
        "rhyming <i>aba bcb cdc</i>, so that the middle line of every tercet plants the rhyme the " +
        "next one will take up, and the poem is pulled forward three lines at a time from the first " +
        "to the last. A canto therefore always runs to a multiple of three lines plus a single " +
        "closing line, which rhymes with the tercet before it and shuts the chain.",
      "It is also a poem about real people, and much of its force comes from that. Dante was born " +
        "in Florence in 1265, served the city as a diplomat and a prior, and in 1302 was condemned " +
        "in his absence by the faction that had seized it — sentenced to a fine, then to be burned " +
        "alive if he ever returned. He never did. The <i>Comedy</i> was written across the twenty " +
        "years of that exile, and it is populated by his contemporaries, his enemies, his teachers " +
        "and his friends, judged and placed by name: popes head-down in a rock, a neighbour frozen " +
        "in ice, the Florentine politics of one generation carried into eternity. Alongside them " +
        "stand the poets and philosophers of antiquity, the Bible, and the classical dead, all " +
        "treated as equally real. Nothing in it is allegory at the expense of the particular.",
      "The figure who governs the whole ascent is <b>Beatrice</b>. Dante had written about her " +
        "before, in the <i>Vita Nuova</i>: a Florentine girl he saw twice and barely spoke to, who " +
        "died in 1290 at twenty-four. In the <i>Comedy</i> she is the one who sets the journey in " +
        "motion from Heaven, and it is she, not Virgil, who takes over as guide at the summit of " +
        "Purgatory — because Virgil, a pagan, can go no further. That handover is the hinge of the " +
        "poem, and it is worth watching for: the greatest poet of the ancient world is left behind " +
        "without a word of farewell, and the reader feels it as a loss before understanding why it " +
        "had to happen.",
      "This translation is <b>Henry Wadsworth Longfellow's</b>, published in Boston in 1867 and the " +
        "first complete American version. He worked at it for years, and the work took its final " +
        "shape after his wife Frances died in a fire in 1861 — he translated cantos in the mornings " +
        "as a discipline against grief, and read the drafts aloud on Wednesday evenings to a small " +
        "circle of friends who came to be called the Dante Club. He renders the poem in " +
        "<b>unrhymed lines, one for one with the Italian</b>, keeping the tercets on the page but " +
        "not the rhyme. That is the trade he chose and it explains how the English reads: the " +
        "word order is often odd and the diction deliberately old, because he is following the " +
        "Italian closely rather than writing an English poem over the top of it. What a reader " +
        "gets in exchange is a translation that stays level with the original line by line.",
      "<b>There is no Italian column here, and the reason is worth stating plainly.</b> Dante's own " +
        "words are of course free — the poem is seven hundred years old. But a medieval poem " +
        "survives in dozens of hand-written copies that disagree with one another, and before " +
        "anyone can read it a modern editor has to work out, line by line, what the poet most " +
        "likely wrote. That constituted text is a new work with a copyright of its own. The " +
        "standard modern text of the <i>Comedy</i> is Giorgio Petrocchi's, published in 1966–67; " +
        "he died in 1989, so it stays in copyright until 2060 where the term is the editor's life " +
        "plus seventy years — and it is Petrocchi's text that every complete Italian <i>Comedy</i> " +
        "freely available today turns out to be. Printing it here would be publishing somebody " +
        "else's edition without their leave, so the English stands alone until a text this site " +
        "may lawfully set beside it can be had.",
      "The tabs are the hundred cantos, grouped into the three canticles, and the small raised " +
        "figures running down the text are <b>line numbers</b> — one at the head of every tercet, " +
        "carrying the number of that tercet's last line, which is how any passage of Dante is cited " +
        "in any language. They are arrived at by counting the lines, because this transcription of " +
        "Longfellow prints marginal numbers for only the first thirty-seven cantos and none at all " +
        "for the remaining sixty-three; where it does print them, all but two agree exactly with " +
        "the count. Those two are misprints in the 1867 volumes — one in Inferno IX, where 85 is " +
        "set twice and the sequence resumes correctly at 100, and one in Inferno XXXII, where 135 " +
        "stands against a line the count makes 134 — and each is read as the place the lines put " +
        "it. One footnote is folded under Purgatorio XXVI: the troubadour Arnaut Daniel answers " +
        "Dante in Provençal, which Longfellow leaves in Provençal in the verse and Englishes at the " +
        "foot of the canto.",
    ],

    /* ---------- ONE PAGE PER CANTO, PAIRED ON THE TERCET ----------
       The ordinary wiki walk on the translation's side; what is new is that the numbers are counted
       rather than read. See the block above extractTerzina for the measurements. */
    source: "wiki",
    layout: "terzine",
    chapterWord: "Canto",
    /* The three canticles, as the edition's own three volumes divide them. */
    parts: [
      { n: 1, label: "Inferno", from: 1, to: 34 },
      { n: 2, label: "Purgatorio", from: 35, to: 67 },
      { n: 3, label: "Paradiso", from: 68, to: 100 },
    ],
    chapters: Array.from({ length: 100 }, (_, i) => i + 1),
    /* Wikisource numbers the cantos WITHIN each volume, so a Folio chapter number is turned back
       into a volume and a canto to find its page. */
    page: (n) => {
      const v = n <= 34 ? 1 : n <= 67 ? 2 : 3;
      const c = n <= 34 ? n : n <= 67 ? n - 34 : n - 67;
      return "Divine Comedy (Longfellow 1867)/Volume " + v + "/Canto " + c;
    },
    /* "Inferno V", "Paradiso XXXIII" — the canticle and the canto's Roman numeral, which is how the
       poem is cited and how both editions head their pages. A bare "Canto V" would name three
       different cantos, the numbering restarting with each canticle. Neither edition gives a canto
       a title of its own, and composing a hundred descriptive headings for a poet who gave none is
       a line this file does not cross. */
    titleOf: (n) => {
      const name = n <= 34 ? "Inferno" : n <= 67 ? "Purgatorio" : "Paradiso";
      const c = n <= 34 ? n : n <= 67 ? n - 34 : n - 67;
      return name + " " + toRoman(c);
    },
    /* The short-chapter guard, which is what catches an extraction that has returned the wiki
       furniture instead of the verse. The shortest canto in the poem is Inferno VI at 115 lines,
       measured over all 100 pages rather than assumed, and its rendered verse is about 4,400
       characters. 2,000 sits well below that and far above what a failed extraction produces. */
    minChars: 2000,

    /* No `original`, and no `origLang`: see the front matter's sixth paragraph and the licence note
       above. The day a text this site may lawfully print becomes available, an `original` block and
       an `origLang` are the whole of the work — the pairing itself is already proved. Both columns
       were measured end to end before the English was imported, against Petrocchi's text, and they
       agree completely: 14,233 lines a side, the same count in every one of the hundred cantos once
       Longfellow's Provençal footnote is folded out of the verse, and identical section lists
       throughout — 4,811 tercet numbers on each side, in the same order, with no exception either
       way. Domenico Guerri's text (Laterza, Bari, 1933) is the candidate to reach for: it is
       complete, it is proofread against a scan, and it is a genuinely different constituted text
       rather than Petrocchi's under another name — Inferno I reads "E quanto a dir" where Petrocchi
       has "Ahi quanto a dir", and "rinnova" where he has "rinova". Guerri died in 1953, so it
       cleared life plus seventy at the start of 2024; it remains under copyright in the United
       States until 2029, being a 1933 foreign publication restored by the URAA and running
       ninety-five years from publication. That is the one thing standing in the way, and it expires
       on its own. */
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

/* The HTML elements that never carry a closing tag. `br` is handled a line or two below on its own,
   because it is the one void element this extractor KEEPS. */
const VOID_TAGS = new Set(["area", "base", "col", "embed", "hr", "img", "input",
                           "link", "meta", "param", "source", "track", "wbr"]);
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
    /* A VOID ELEMENT HAS NO CLOSER, AND PUSHING ONE ONTO THE STACK EATS SOMEBODY ELSE'S (Aug 2026,
       adding Aesop's Fables — the first book here whose illustrations survive as far as this pass).
       Everything not in ALLOWED is unwrapped by pushing a kept:false frame and waiting for the
       matching closer; an <img> or an <hr> never sends one, so its frame sits on top of the stack
       for the rest of the chapter and every subsequent closer is compared against IT, matches
       nothing, and is DROPPED. Townsend's frontispiece is an <img> inside a <p> inside the centred
       block that heads his first fable, so the </p> went, then the </div> that closed the block —
       and the whole of fable 1 rendered inside a <blockquote> that never closed.

       It fails the quiet way this file keeps meeting: nothing throws, not one word is lost, the
       chapter is exactly the right length, and only the indent gives it away. `br` was already
       special-cased above, which is why no earlier book met it.

       MEASURED BEFORE IT WAS FIXED, over every shipped chapter of all fifteen books and all
       fourteen originals: <p>, <blockquote>, <i>, <b> and <q> balance exactly everywhere, and the
       only imbalance anywhere on the shelf was this one chapter. So no shipped file can change —
       which was then confirmed byte-for-byte rather than left as an argument, the extractor being
       shared and the check this file's own history prescribes.

       Both tests are needed and neither implies the other: XHTML-style `<img ... />` announces
       itself with the slash, while MediaWiki emits a bare `<hr class="...">` with none. */
    if (!closing && (VOID_TAGS.has(name) || /\/>$/.test(m[0]))) continue;
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
      /* data-n is the marker's SORT KEY where the number a reader sees is not a number to sort on —
         a Bekker page is "1094a", and app.js reads this attribute in preference to the text. Carried
         through for exactly the reason the footnote marker's data-fn is carried through directly
         below: this rebuilds the tag from scratch, so an attribute not named here is silently lost,
         and losing this one collapses 1094a and 1094b onto one section without anything throwing.
         A marker with no data-n emits precisely what it always did. */
      if (keep) {
        const dn = attrs.match(/data-n="([^"]*)"/);
        out.push('<span class="bk-n"' + (dn ? ' data-n="' + dn[1] + '"' : "") + ">");
      }
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

/* THE NINTH WAY an edition marks its numbers, and the first where the number arrives on a page of its
   OWN (Aug 2026, adding The City of God).

   Every rule above reads its numbers out of a chapter's running text, because every book above puts a
   chapter on a page. Here the wiki puts each of Augustine's 661 chapters on a separate page and a
   Folio chapter is one of his twenty-two BOOKS, so each page carries exactly one number and carries it
   in the same place: a leading paragraph reading "Chapter 12.—Of the Fate of Those Christians Who
   Perished in the Sack of the City", the number and the edition's own summary of the chapter run
   together with an em dash between them.

   THE NUMBER IS READ AND THEN CHECKED, which is what makes this the safest of the nine rather than
   the laziest. It would be a line to compose the marker from the page name, which states the chapter
   outright — and composing an apparatus is what this file refuses to do everywhere else. It would be
   two lines to read the printed heading and trust it. Doing both costs nothing, because the caller
   already knows which page it asked for: the number is taken from the print and compared against
   `book.expect`, so a heading mistyped on the wiki, or a page moved under a different name, is
   reported rather than filed silently under the chapter before it.

   THE SUMMARY IS KEPT, in bold, in the paragraph the marker opens. It is the edition's own — Dods
   prints one over every chapter — and in a work of 661 chapters it is the only practical way to find
   a passage. The paragraph's inner markup survives untouched, which matters for the ten of them that
   carry a footnote marker: wrapping the run rather than rewriting it keeps the marker pointing where
   cleanBody has already aimed it.

   FOUR PRINTED FORMS, inventoried over all 665 pages rather than assumed from a sample: 659 set an
   em dash after the number, one writes that dash as a character entity, one sets no dash at all and
   one prints a space before the full stop ("Chapter 21 .—", in Book X). All four are matched here, so
   none of them loses its number — which would leave that chapter's prose swallowed into the one above
   it with nothing throwing to say so.

   AND ONE PAGE IN 665 SETS THE WHOLE HEADING IN BOLD, which is why the pattern tolerates an inline
   tag in front of the word and strips the closer off the back of the title. Book V's twenty-sixth
   chapter is that page, and it is also the one with no dash — so the two rarest forms in the book are
   on the same page, and a rule written from any sample smaller than all of them would have missed it.
   It reads exactly like every other chapter and would simply have had no number.

   A PAGE THAT CARRIES NO NUMBER IS NOT A FAILURE. Four of the twenty-two books open with a preface,
   and every book's own page carries the Argument and no chapter at all; the caller says so by passing
   `expect` as null, and those pages are left unmarked, which is what puts them at the head of the
   chapter as its opening unnumbered block. Their leading title line is still set in bold, so a
   preface reads as a preface rather than as prose that has lost its heading. */
function markChapterHead(b, book, warn) {
  const expect = book.expect;
  let found = 0;
  b = b.replace(/^<p>\s*(?:<[bi]>\s*)?Chapter\s+(\d+)\s*\.\s*(?:—|–|--|&#8212;)?\s*((?:(?!<\/p>)[\s\S])*)<\/p>/, (m, d, rest) => {
    const v = +d;
    rest = rest.replace(/<\/[bi]>\s*$/, "");
    if (expect != null && v !== expect)
      warn && warn("the page for chapter " + expect + " is headed “Chapter " + v + "” — left as printed");
    found++;
    return '<p><span class="bk-n">' + v + "</span> <b>" + rest.trim() + "</b></p>";
  });
  if (found) {
    if (expect == null && warn)
      warn("a page with no chapter of its own is headed “Chapter " + found + "”");
    return b;
  }
  /* No number on the page. Where one was expected that is a real fault and is reported; where none
     was, the leading line is a preface's or an Argument's title and is set as a heading. */
  if (expect != null) {
    warn && warn("no chapter heading found on the page for chapter " + expect +
      " — its text will fold into the chapter above it");
    return b;
  }
  return b.replace(/^<p>\s*(Preface[^<]{0,120}?)\s*<\/p>/, "<p><b>$1</b></p>");
}

/* THE SIXTH WAY an edition marks its numbers, and the first whose two forms differ in MARKUP rather
   than in wording (Aug 2026, adding the Book of Documents). Legge numbers the paragraphs of each
   document 1, 2, 3 … and this transcription writes that number two ways: as a plain run of text at
   the head of the paragraph, exactly as Haines's Meditations does, and as an ANCHOR SPAN carrying
   the citation as its id — `<span id="ch2" class="wst-anchor">2.</span>` — because the volume's
   contents page links into some paragraphs and not others. Which form a given number wears is
   decided by whether anything happens to link to it, so the two are scattered through one document
   with no pattern: the Canon of Yâo carries both.

   By the time this runs stripTags has already been over the text, so the anchor span has been
   unwrapped and BOTH forms have collapsed to the same thing: a plain "N." at the head of the
   paragraph. What the anchored form costs is therefore nothing at all — worth saying because it
   looks like the hard part and is not.

   THE HARD PART IS THAT A PARAGRAPH NEED NOT BE ONE. MediaWiki only wraps a run of text in `<p>`
   where the wikitext had a blank line before it, so a document whose first paragraph follows its
   headnote directly arrives as a BARE RUN with no tag around it — the trap a facing-page book on
   this shelf already records, met here in another edition. markLeadingSections is anchored to `<p>`
   and cannot see one: measured over the whole book, it finds 167 of the 169 numbers, and the two it
   misses are the FIRST number of the Count of Wei and of the Announcement of the Duke of Shâo. Both
   documents would ship numbered from 2, with every word of section 1 present and nothing throwing
   to say so — the quiet shape again, and invisible to any count of prose.

   Hence the second alternative below, which takes a number opening a bare run where a block has just
   closed. The two are ONE regex scanned in reading order rather than two passes, which is the
   Meditations' lesson: run as two, the first reaches the end of the document and leaves the counter
   at the last number, after which the forward-only guard declines everything the second finds as
   going backwards.

   Forward-only and never more than a few steps on, the guard every rule above uses. It earns its
   place here twice over: Legge's headnotes quote the documents' own dates ("B.C. 1401 to 1374") and
   his prose cites chapter and verse, so a bare "3." opening a sentence is not always a section. */
function markShuSections(b, warn) {
  let seq = 0, found = 0;
  /* (a) a number at the head of a paragraph, reached through whatever the head opens with; (b) a
         number opening a bare run, which is where a block has just closed and no `<p>` follows. */
  const RX = new RegExp(
    "<p>((?:\\s|<[^>]*>|&#\\d+;|&nbsp;|​)*)(\\d{1,3})\\.(?=\\s|&#\\d+;|&nbsp;|​)" +
      "|(</(?:blockquote|p|div|ol|ul|table)>[\\s​]*)(\\d{1,3})\\.(?=\\s|&#\\d+;|&nbsp;|​)",
    "g"
  );
  b = b.replace(RX, (whole, lead, pNum, close, rNum) => {
    const v = +(pNum !== undefined ? pNum : rNum);
    if (v <= seq || v > seq + 6) return whole;
    seq = v; found++;
    const mark = '<span class="bk-n">' + v + "</span>";
    /* The lead is KEPT rather than dropped, in both shapes. On (a) it is whatever styling the
       paragraph opened with and on (b) it is the closing tag of the block before it, and stripTags'
       stack expects to meet both — discarding either would leave an opener unbalanced for the rest
       of the chapter, which is the fault the void-element rule already records. */
    return pNum !== undefined ? "<p>" + lead + mark : close + mark;
  });
  if (!found && warn) warn("no section numbers found — the chapter will pair as one whole block");
  return b;
}

/* THE HEADINGS AND THE HALF-TITLES OF THE LÎ KÎ, which arrive in the SAME centred block and have to
   be told apart (Aug 2026, adding the Book of Rites). This runs before the generic div pass, where
   the class is still there to key on.

   Every one of this edition's forty-six divisions is a `wst-center` div, and so is the half-title at
   the head of each book — and at the head of a BOOK the two are one block: the title, sometimes an
   "OR" and a descriptive second line, and then "Section I. Part I." underneath, inside a single
   centred div. dropHeads cannot help, for two reasons. It matches a block's WHOLE text, so a pattern
   that reached the half-title would take the section heading with it and a pattern that spared the
   heading would leave the half-title; and Book I's block holds a nested centred div of its own (the
   volume's own title page), which none of dropHeads' three shapes can match at all. So the block is
   opened and its paragraphs sorted rather than the block being kept or dropped whole.

   THE HALF-TITLE GOES AND THE HEADING STAYS, and the heading stays because the numbering restarts at
   it. A reader meeting the small figures running 1…31 and then 1 again needs to see, on the page, the
   line that says why; this is Herodotus's chapter numbers if the book divisions were invisible.

   DROPPING A HALF-TITLE CAN DROP A FOOTNOTE MARKER, which is Beowulf's rule met in another edition.
   Legge hangs his note on the whole treatise off its TITLE — Book VII's is on the words "Ceremonial
   Usages; their Origin, Development, and Intention", Book II's on "The Than Kung" — so nine of the
   ten books would have shipped with a note 1 that no sentence opens, which is the mirror of the dead
   marker app.js's apparatus already refuses to draw. Every marker on a dropped line is carried down
   to the heading below it instead, where Legge's note on the book belongs anyway.

   THE TEST FOR A LINE THAT MAY GO IS THAT IT IS SET IN CAPITALS — this edition sets every half-title
   that way and nothing else in the book — so a line neither matching a heading nor wholly capital is
   REPORTED and kept rather than silently discarded. */
const LIKI_MARK = "@@LKH@@";
const LIKI_HEAD_RX = /^(?:Section\b|Part\b|Supplementary Section\b|Appendix to Book\b)/i;
function likiPlain(s) {
  return s.replace(/<[^>]*>/g, " ").replace(/&#160;|&nbsp;|&#32;|\u200b/g, " ").replace(/\s+/g, " ").trim();
}
function markLikiHeads(b, warn) {
  // the centred blocks, opened one at a time and sorted into headings and half-titles
  let at = 0;
  for (let k = 0; k < 200; k++) {
    const rx = /<div class="wst-center[^"]*"[^>]*>/g;
    rx.lastIndex = at;
    const m = rx.exec(b);
    if (!m) break;
    const end = blockEnd(b, m.index, "div");
    if (end < 0) { warn("a centred block is not closed — left as it stands"); break; }
    const inner = b.slice(m.index, end);
    const keep = [];
    let orphans = "";
    let p;
    const prx = /<p>([\s\S]*?)<\/p>/g;
    while ((p = prx.exec(inner))) {
      const t = likiPlain(p[1]);
      if (!t) continue;
      if (LIKI_HEAD_RX.test(t)) { keep.push(p[1]); continue; }
      /* A half-title is wholly capital. Anything else in one of these blocks is prose nobody has
         looked at, so it is kept and named rather than thrown away on a guess. */
      if (/[a-z\u00e0-\u00ff]/.test(t.replace(/&[a-z]+;/g, ""))) {
        warn('kept a centred line that is not a heading and not a half-title: "' + t.slice(0, 60) + '"');
        keep.push(p[1]);
        continue;
      }
      orphans += (p[1].match(/<sup class="fn"[^>]*><\/sup>/g) || []).join("");
    }
    if (orphans && !keep.length) warn("a half-title carried a footnote marker with no heading under it");
    const out = keep
      .map((h, i) => "<p>" + LIKI_MARK + h + (i === 0 ? orphans : "") + LIKI_MARK + "</p>")
      .join("\n");
    b = b.slice(0, m.index) + out + b.slice(end);
    at = m.index + out.length;
  }
  return b;
}

/* THE EIGHTH WAY an edition marks its numbers, and the first whose count RESTARTS inside a chapter
   (Aug 2026, adding the Book of Rites). Every rule above numbers a chapter once, straight through,
   and is guarded by a forward-only test that treats a number going backwards as prose. Legge numbers
   the paragraphs of the Lî Kî from one within each Section — and within each Part, where a Section
   has Parts — so Book I alone starts its count over eight times and Book IV thirteen. Run under the
   ordinary guard, everything after the first Part is declined as going backwards and nine tabs in ten
   ship carrying the numbers of their opening pages only.

   So the counter is reset by the HEADINGS, which markLikiHeads has just fenced off above, and the
   headings and the numbers are matched in ONE sweep in reading order — the Meditations' lesson, which
   is sharper here than anywhere: as two passes there is no reading order at all and the reset cannot
   know which numbers it precedes.

   A NUMBER NEED NOT OPEN A PARAGRAPH. Legge runs several numbered paragraphs together where the sense
   runs on, so the figure lands mid-sentence after a full stop — 4 of Book I's 31, but 82 of Book IV's
   198 — and a rule anchored to `<p>` finds the rest and leaves those out of the numbering with their
   prose swallowed into the paragraph above, which is the Art of War's bare-run trap in another dress.
   The mid-paragraph alternative is therefore matched too, and it is fenced as tightly as the evidence
   allows: it must follow a sentence ending, be followed by a capital or an opening quotation, and — as
   everywhere in this file — move the sequence forward by a step or a few. Legge's prose is full of
   figures that are not sections (a territory of 1000 lî, five gradations of rank, the age of a man in
   his eighties) and the guard is what keeps them prose.

   BOOK I NUMBERS TWICE OVER, and both figures are printed. Its paragraphs are grouped into chapters
   and the first paragraph of each carries the chapter number in front of its own — "Ch. 1. 1.", then
   "2. 2.", "3. 3.", "4. 6." — which is Legge's own analysis, set out in his note to each Part. Both
   are kept, in the order he prints them, with the PARAGRAPH number written as the marker's `data-n`
   sort key so app.js goes on pairing and ordering by the number a passage is cited by. The pair is
   accepted only when the chapter figure moves a counter of its own forward as well, or an ordinary
   paragraph opening on two numbers would be read as one. */
function markLikiSections(b, warn) {
  let seq = 0, ch = 0, found = 0, resets = 0;
  const RX = new RegExp(
    "<p>" + LIKI_MARK + "([\\s\\S]*?)" + LIKI_MARK + "</p>" +
      "|<p>((?:\\s|<[^>]*>)*)(?:(?:Ch\\.\\s*)?(\\d{1,3})\\.\\s+)?(\\d{1,3})\\.(?=\\s|<)" +
      /* A sentence ending OR the head of a printed line, then the figure, then the opening of a
         sentence. Both halves of that are load-bearing and each was measured.

         THE TAGS IN THE LOOKAHEAD ARE NOT DECORATION: Legge italicises the aspirated consonants of
         his romanisation, so a great many of his paragraphs open on `<i>K</i>ung-nî` or `<i>Kh</i>ǎng`
         rather than on a letter, and a lookahead wanting a capital immediately meets a `<`.

         AND THE SENTENCE BEFORE DOES NOT ALWAYS END IN A STOP. Three of these numbers follow no full
         stop at all — Book I's 44 follows a comma, and Book IV's 2 and Book X's 27 each follow a
         footnote marker whose stop the printing drops — so a rule keyed on punctuation alone leaves
         three paragraphs of prose swallowed into the paragraph above with nothing thrown to say so.
         What all four hundred of them DO share is that the figure opens a line: this transcription
         keeps the scan's own line breaks, and Legge starts every numbered paragraph on a fresh line.
         That is a stronger signal than the punctuation, not a looser one, and it is fenced by the
         same two guards as everything else here — the number must move the sequence on by a step or
         a few, and a sentence must open after it. */
      "|(?<=[.!?][\\s\u201d\"']{0,2}\\s|\\n)(\\d{1,3})\\.(?=\\s+(?:<[^>]*>)*[A-Z\u201c\u2018(\u0417])",
    "g"
  );
  b = b.replace(RX, (whole, head, lead, chNum, pNum, midNum) => {
    if (head !== undefined) {
      seq = 0; ch = 0; resets++;
      return '<p class="bk-head">' + head + "</p>";
    }
    const v = +(pNum !== undefined ? pNum : midNum);
    if (v <= seq || v > seq + 6) return whole;
    /* The chapter figure is taken only where it moves its own counter on. Where it does not, the
       match is left as it stands rather than half-taken: the alternative is to read Legge's chapter
       number as a paragraph number, which would put the marker on the wrong figure. */
    let text = String(v);
    if (chNum !== undefined) {
      const c = +chNum;
      if (c <= ch || c > ch + 3) return whole;
      ch = c;
      text = c + ". " + v;
    }
    seq = v; found++;
    const mark = '<span class="bk-n" data-n="' + v + '">' + text + "</span> ";
    return pNum !== undefined ? "<p>" + lead + mark : mark;
  });
  if (!found && warn) warn("no section numbers found — the chapter will pair as one whole block");
  if (!resets && warn) warn("no section headings found — the paragraph numbering cannot restart");
  return b;
}

/* A ROMAN NUMERAL, read strictly. Every other rule in this file counts in Arabic figures; the Prose
   Edda numbers its chapters I, II, III … and the only other Roman numerals on this shelf are the
   Song of Roland's laisses and Beowulf's fitts, which are read by their own extractors. It is
   deliberately a VALIDATOR and not merely a converter: `romanValue` re-renders what it parsed and
   returns 0 unless the two agree, so IIII, VV and XXXXV are rejected rather than quietly accepted as
   4, 10 and 45. That matters here because the pattern below is anchored on a bold run at the head of
   a paragraph, and Brodeur's text is full of bold that is not a chapter number — a rule that took
   anything vaguely numeral-shaped would file a stray letter as a section and take a page of prose
   with it. The Song of Roland's two malformed numerals are repaired by the forward-only rule instead,
   which is the right place for a repair; this is the place for a definition. */
const ROMAN_DIGIT = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
function romanValue(s) {
  if (!s || !/^[IVXLCDM]+$/.test(s)) return 0;
  let v = 0;
  for (let i = 0; i < s.length; i++) {
    const d = ROMAN_DIGIT[s[i]], next = ROMAN_DIGIT[s[i + 1]];
    v += next && d < next ? -d : d;
  }
  return romanNumeral(v) === s ? v : 0;
}
function romanNumeral(v) {
  const T = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],
             [10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  let out = "";
  for (const [n, s] of T) while (v >= n) { out += s; v -= n; }
  return out;
}

/* THE SEVENTH WAY an edition marks its numbers, and the first that counts in ROMAN (Aug 2026, adding
   the Prose Edda). Brodeur's chapter numbers are what the whole book is cited by — "Gylfaginning 44"
   is a chapter, not a paragraph — and because each of the work's three parts is one wiki page and so
   one chapter here, those numbers are Folio's SECTIONS. Getting them wrong does not throw and does
   not shorten the text; it silently leaves a part paired as one block, which is the quiet shape this
   file keeps meeting.

   TWO FORMS, AND THEY ARE NOT VARIANTS OF ONE PATTERN — they are set differently because the printer
   set the two parts differently, and both were inventoried over all three pages before this was
   written rather than inferred from a sample:
     (a) GYLFAGINNING AND SKÁLDSKAPARMÁL — a bold numeral WITH a full stop, run into the first
         sentence of the chapter: `<p><b>XI.</b> Then said Gangleri…`. 54 and 74 of them.
     (b) THE PROLOGUE — a CENTRED numeral with NO full stop, standing alone as its own block, which
         the generic div pass a few hundred lines above has already turned into a `<blockquote>`. 4
         of them. Left alone it renders as a quotation containing the letter V, which is the running
         head fault the Meditations' entry records, in a new coat.
   Matched in ONE sweep in reading order, which is the Meditations' lesson and is load-bearing rather
   than tidy: run as two passes the (a) rule would reach the end of Skáldskaparmál and leave `seq` at
   74, after which the forward-only guard would decline every one of the Prologue's numerals as going
   backwards — and the Prologue would ship unnumbered with nothing thrown to say so.

   THE PROLOGUE'S FIRST CHAPTER CARRIES NO NUMERAL AND NONE IS WRITTEN. Checked on the scan rather
   than assumed: page 35 sets the heading and then a drop-capital, and the centred numerals begin at
   II. So the Prologue's opening arrives as an unnumbered leading block, which is exactly what
   app.js's `bookSections` already has a path for, and the front matter says so. Composing a "1" for
   it would be composing an apparatus, which is the line the Meditations' entry draws.

   Forward-only, and never more than a few steps on, like every rule above it. It earns its keep here
   for a reason particular to this book: Brodeur's Skáldskaparmál brackets chapter XXI as probably
   spurious and prints the bracket BEFORE the numeral, so the pattern has to reach through a `[` that
   belongs to the text and must be kept. */
/* Turn a Wikisource definition list into the shelf's verse shape — a blockquote of one paragraph
   whose lines are divided by `<br>`, which is what Seneca's quoted poetry already ships as.

   IT HAS TO SCAN FOR BALANCE RATHER THAN MATCH A PAIR OF TAGS, and that is the whole of it. These
   lists NEST: Wikisource indents a continuation line by opening a fresh `<dl>` inside the `<dd>` it
   belongs to, and measured over the Prose Edda's Gylfaginning alone there are 137 lists two deep with
   72 of their items carrying another list inside. A non-greedy `<dl>…</dl>` pair closes on the INNER
   list's closing tag, so the outer one is left standing — which shipped for one run as 34 unclosed
   blockquotes and 34 unclosed paragraphs in a single chapter. Nothing threw and no word was lost;
   only counting a tag against its closer over the shipped data showed it, which is the sweep this
   file prescribes after any change near stripTags.

   The nested items are FLATTENED into the stanza rather than nested inside it, and that is a reading
   of the edition rather than a convenience: an indented sub-item here is the second half of a verse
   line, so the stanza's lines in document order are exactly what the printed page sets. Emitting the
   inner list as a blockquote of its own would put a block element inside a paragraph, which is
   invalid nesting, and would break one stanza into two on the page. */
function verseFromLists(b) {
  for (let guard = 0; guard < 5000; guard++) {
    const start = b.indexOf("<dl>");
    if (start < 0) break;
    // walk to the matching close, counting depth, so a nested list cannot end the outer one
    let depth = 0, i = start, end = -1;
    while (i < b.length) {
      if (b.startsWith("<dl>", i)) { depth++; i += 4; continue; }
      if (b.startsWith("</dl>", i)) { depth--; i += 5; if (!depth) { end = i; break; } continue; }
      i++;
    }
    // an unbalanced list is left exactly as it was, for the generic pass below to unwrap
    if (end < 0) break;
    const inner = b.slice(start + 4, end - 5);
    /* Every item in document order, however deeply the edition indented it: the list tags are dropped
       and the remainder split at each item, which flattens any nesting without needing to know how
       deep it went. */
    const lines = inner
      .replace(/<\/?dl>/g, "")
      .split("<dd>")
      .map((s) => s.replace(/<\/dd>/g, "").trim())
      .filter((s) => s && s !== "<br>");
    b =
      b.slice(0, start) +
      (lines.length ? "<blockquote><p>" + lines.join(" <br>\n") + "</p></blockquote>" : "") +
      b.slice(end);
  }
  return b;
}

function markEddaSections(b, warn) {
  let seq = 0, found = 0;
  /* (a) a bold numeral with a stop, at the head of a paragraph, reached through whatever the
         paragraph opens with — entities and the odd editorial bracket among them;
     (b) a centred numeral standing alone, which by now is a blockquote, together with the opening
         tag of the paragraph that follows it, so the marker lands at the head of the prose rather
         than in a paragraph of its own. */
  const RX = new RegExp(
    "<p>((?:\\s|&#\\d+;|&nbsp;|\\[)*)<b>([IVXLCDM]+)\\.<\\/b>" +
      "|<blockquote>\\s*(?:<p>)?\\s*([IVXLCDM]+)\\s*(?:<\\/p>)?\\s*<\\/blockquote>\\s*<p>",
    "g"
  );
  b = b.replace(RX, (whole, lead, boldNum, centreNum) => {
    const v = romanValue(boldNum !== undefined ? boldNum : centreNum);
    if (!v || v <= seq || v > seq + 6) return whole;
    seq = v; found++;
    const mark = '<span class="bk-n">' + v + "</span>";
    /* The lead is KEPT, as markShuSections keeps its own and for the same reason: it is whatever the
       paragraph opened with, stripTags' stack expects to meet it, and on chapter XXI it is Brodeur's
       own square bracket, which is part of what he printed. */
    return boldNum !== undefined ? "<p>" + lead + mark + " " : "<p>" + mark + " ";
  });
  if (!found && warn) warn("no section numbers found — the chapter will pair as one whole block");
  return b;
}

function cleanBody(h, noteIds, book, warn) {
  let b = h.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  /* WHERE THE TEXT STARTS, and until Thucydides there was only one answer (Aug 2026). Every wiki book
     before it is a PROOFREAD transcription — a transcription of a scan, page by page, transcluded into
     the chapter page, which MediaWiki wraps in .prp-pages-output. Crawley's Peloponnesian War is not
     one: it is a plain transcription typed straight onto the page, with no scan behind it and so no
     wrapper at all, so the indexOf below returned -1 and threw "no body" on a page carrying the whole
     of Book 1. The fallback is the parser's own container, which every MediaWiki page has.

     It is GATED on `body: "plain"` rather than simply tried when the wrapper is missing, and that is
     the whole care in it: on a proofread page the parser container exists TOO and sits OUTSIDE the
     transclusion wrapper, so an automatic fallback would widen the slice of any of the four books
     already shipped on the day Wikisource next moves its markup — taking the navigation furniture in
     with the text, which is the quiet failure the ws-noexport rule below exists to undo. Ungated it
     cannot fire at all; gated it can only fire on a book that asks for it. Its opening tag is dropped
     for the same reason the wrapper's is below: left standing, the container that holds the whole book
     becomes a blockquote OF the whole book. */
  let i = b.indexOf('<div class="prp-pages-output"');
  if (i < 0 && book && book.body === "plain") {
    const m = /<div class="[^"]*\bmw-parser-output\b[^"]*"[^>]*>/.exec(b);
    if (m) { i = m.index; b = b.slice(0, m.index) + b.slice(m.index + m[0].length); }
  }
  if (i < 0) throw new Error("no body");
  b = b.slice(i);
  /* THE WIKI'S OWN FURNITURE, WHEN IT FALLS INSIDE THE SLICE (Aug 2026, adding The Prince).
     Every earlier book's page puts MediaWiki's navigation header — the ← previous / next → block with
     the work's title, its author and translator, and the scan pages this chapter covers — OUTSIDE
     .prp-pages-output, so the slice above has always dropped it for free. This transcription puts the
     transclusion wrapper first and the header inside it, and the failure is the quiet one: nothing
     throws, no prose is lost, and every chapter simply opens on a quotation of its own bibliographic
     header, the previous chapter's title included.

     Wikisource marks exactly this furniture with `ws-noexport` — the class means "not part of the
     exported text", which is precisely the question being asked here — so the rule is the page's own
     rather than a guess about its wording, in the same spirit as the Republic's unnumbered-leaf rule.
     Removal is BALANCED (blockEnd) because the header nests four divs deep and a non-greedy match
     would take the opener and leave the rest of it standing.

     Scoped to DIVs deliberately: `ws-noexport` also sits on the zero-width span inside every page
     marker, which the pass below already removes and which is not a block. Verified byte-for-byte
     against the shipped Seneca, Meditations, Symposium and Republic chapters, where no such div falls
     inside the slice and this does nothing at all. */
  for (let k = 0; k < 8; k++) {
    const m = /<div class="[^"]*\bws-noexport\b[^"]*"[^>]*>/.exec(b);
    if (!m) break;
    const end = blockEnd(b, m.index, "div");
    if (end < 0) break;
    b = b.slice(0, m.index) + b.slice(end);
  }
  /* THE WIKI'S OWN AUXILIARY CONTENTS, WHEN IT FALLS INSIDE THE SLICE (Aug 2026, adding the Book of
     Documents — the first book here whose edition divides a chapter into sections that Wikisource
     gives pages of their own).

     Where a book of the Shû is printed in sections, the book's page carries Legge's headnote and then
     a `wst-auxtoc` block — a heading reading "Sections (containing the body text)" over links to
     them. That is navigation between wiki pages and no part of Legge, and it sits INSIDE
     prp-pages-output, so the slice takes it. Left alone the generic div pass turns it into two
     quotations under the headnote: a heading-shaped block and a list of the words "Section 1 Section
     2 Section 3", standing where the document should begin. The usual quiet failure — nothing throws
     and no prose is lost.

     The rule is the page's OWN marker rather than a guess at its wording, in the same spirit as the
     ws-noexport pass above: `wst-auxtoc` means an auxiliary table of contents, which is exactly the
     question being asked. Removal is BALANCED, because the block nests a header div and a poem div
     inside it and a non-greedy match would take the opener and leave both standing.

     GATED per book so it is provably inert on everything already shipped, which is the discipline
     this file's history asks for on any edit to cleanBody — the extractor is shared and its other
     callers have been proof-read by readers. */
  if (book && book.dropAuxToc) {
    for (let k = 0; k < 8; k++) {
      const m = /<div class="[^"]*\bwst-auxtoc\b[^"]*"[^>]*>/.exec(b);
      if (!m) break;
      const end = blockEnd(b, m.index, "div");
      if (end < 0) break;
      b = b.slice(0, m.index) + b.slice(end);
    }
  }
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
  /* …and `<ol class="references"` is a fourth boundary, for the same reason the Footnotes heading is a
     second one: the guards have to fail independently. MediaWiki wraps that list in a reflist div
     wherever a page asks for one, and The Prince's chapters do not ask — they carry the bare list, so
     none of the three older patterns fires and the whole apparatus arrives appended to the text as
     prose. That is the Meditations' fault again (the chapter comes through LONGER rather than shorter,
     so every count reads as healthy), and it costs nothing on a page that has the wrapper, since the
     wrapper opens before the list it contains. */
  /* …and a FIFTH boundary, for the Footnotes label dressed as a PAGE BREAK rather than as a heading
     (Aug 2026, adding the Prose Edda). Every earlier book emits it as
     `<div class="mw-heading…"><h2 id="Footnotes">`; Brodeur's pages emit `<span id="Footnotes">`
     nested inside a `wst-pagebreak` span, so all four guards above missed it. The reflist div that
     follows still cut the notes off, so the only survivor was the bare word "Footnotes" left hanging
     at the end of two chapters — the quiet shape once more: nothing throws, the note list is right,
     every marker resolves, the chapter is the correct length to within a word, and only a reader
     scrolling to the foot of Gylfaginning ever meets it.

     TWO NARROWER PATTERNS WERE TRIED FIRST AND BOTH WERE WRONG, which is why this one is shaped as it
     is. Matching the id on any element (`<[a-z0-9]+ id="Footnotes"`) looks like the tidy
     generalisation and REPLACES the fourth guard rather than joining it: measured against the shipped
     Meditations, it fires 36 characters LATER than the old pattern, because the old one cuts at the
     wrapper div and this one at the h2 inside it — leaving `<div class="mw-heading…">` behind to
     become a stray empty blockquote under the last line of all twelve books, which is the Republic's
     documented fault exactly. And cutting at `wst-pagebreak` alone is too WIDE: that class names a
     page break rather than the apparatus, so on an edition that breaks pages mid-chapter it would cut
     the text in half. So the fourth guard is left untouched and this one matches the pagebreak
     wrapper ONLY where the Footnotes id is inside it, which cuts the whole wrapper and can fire
     nowhere else. Verified against the shipped Seneca, Meditations and Peloponnesian War pages: the
     cut lands at exactly the same offset as before on every one.

     THE OPTIONAL `<p>` IS NOT DECORATION. MediaWiki wraps this label in a paragraph of its own —
     `<p><style…/><span class="wst-pagebreak">…</span></p>`, the style already gone by the time this
     runs — so cutting at the span alone leaves that paragraph's OPENER behind with its closer on the
     far side of the cut. stripTags' stack then waits for a `</p>` that never comes, and every closing
     tag after it is matched against the wrong frame: the third `<p>` imbalance this file has
     recorded, and invisible except by counting a tag against its closer over the shipped data, which
     is the sweep prescribed after any change near this pass. Measured here: 136 openers against 135
     closers in Gylfaginning and 463 against 462 in Skáldskaparmál, and zero after. */
  b = b.split(
    /<div class="reflist|<hr class="wst-rule"|<ol class="references"|<div class="mw-heading[^"]*"><h2 id="Footnotes"|(?:<p>\s*)?<span class="wst-pagebreak[^"]*"[^>]*>(?=(?:\s*<[^>]*>)*\s*<span id="Footnotes")/
  )[0];
  /* THE TRANSCRIPTION'S OWN SECTION HEADINGS, dropped like a running head and for a sharper reason
     (Aug 2026, adding the Peloponnesian War). Crawley's books are broken up by summary headings — "The
     State of Greece from the earliest Times to the Commencement of the Peloponnesian War" and four
     more in Book 1 alone — which arrive as .mw-heading divs and would become BLOCKQUOTES under the
     generic div pass below, standing between the chapters as indented quotations of themselves. That
     much is the Meditations' running-head fault again.

     What settles it is the pairing rather than the styling. These headings fall BETWEEN numbered
     chapters, and app.js's bookSections attaches a block carrying no marker to the section already
     open — so every heading would render at the FOOT of the chapter before it, pointing backwards at
     the text it does not describe rather than forwards at the text it does. A signpost placed at the
     wrong end of the road is worse than no signpost, the Greek edition beside it prints none, and
     composing a proper place for them would be building an apparatus this edition does not have.
     Removal is BALANCED, because the heading div wraps an h2 and an edit link. Gated per book, like
     dropHeads: a heading worth dropping in this transcription is a heading worth keeping in another. */
  if (book && book.dropHeadings) {
    for (let k = 0; k < 400; k++) {
      const m = /<div class="[^"]*\bmw-heading\b[^"]*"[^>]*>/.exec(b);
      if (!m) break;
      const end = blockEnd(b, m.index, "div");
      if (end < 0) break;
      b = b.slice(0, m.index) + b.slice(end);
    }
  }
  /* THE WIKI'S OWN LIST OF ITS OWN SUBPAGES (Aug 2026, adding The City of God — the first book here
     whose chapters are each a page and whose book pages therefore carry a table of contents).

     Where a work is broken up one chapter to a page, Wikisource puts a bulleted list of links to
     those pages under a "Contents" heading. The heading is a `mw-heading` div and `dropHeadings`
     takes it; the LIST is a bare `<ul>`, which neither that rule nor anything else here can see —
     and `ul` and `li` are not in ALLOWED, so stripTags unwraps both and the whole thing arrives as
     one run-on paragraph reading "Preface Chapter 1 Chapter 2 Chapter 3 …" standing where the book
     should begin. It is `dropAuxToc`'s fault in a different dress, and the usual quiet one: nothing
     throws, not a word of Augustine is lost, and the chapter is longer rather than shorter.

     THE TEST IS STRUCTURAL AND NOT A GUESS ABOUT THE WORDING: a list goes only when every one of its
     items is a single link and nothing else, which is what a navigation list IS and what a list in
     an author's prose never is — an edition that sets a genuine list of items would have text in
     them. Measured over this book before it was written: the 22 book pages carry exactly one such
     list each and the 665 chapter and preface pages carry none at all. Gated per book, so it is
     provably inert on the twenty-seven already shipped. */
  if (book && book.dropLinkLists) {
    b = b.replace(/<ul>[\s\S]*?<\/ul>/g, (list) => {
      const items = list.match(/<li>[\s\S]*?<\/li>/g) || [];
      if (!items.length) return list;
      const allLinks = items.every((li) =>
        /^<li>\s*<a\b[^>]*>[\s\S]*?<\/a>\s*<\/li>$/.test(li));
      return allLinks ? "" : list;
    });
  }
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
  /* THE THIRD WAY an edition marks its numbers, and it is a MARGINAL FLOAT rather than a raised
     numeral in the line. Jowett's Dialogues sets the Stephanus pages — the page-and-column of
     Estienne's edition of 1578, by which every edition of Plato in every language has been cited for
     four hundred years — in the outer margin, which arrives as `wst-verse wst-verse-float`. The
     Gummere rule above cannot take them: it requires a `<b>` inside the `<sup>`, and these carry none.

     Two forms, and the first is the one that would be lost in silence. The opening marker of the
     dialogue is labelled — a linked "Steph" abbreviation and then the number — where the other
     fifty-one are the bare figure, so a rule anchored to a `<sup>` holding nothing but digits finds
     every Stephanus page in the work except the very first, and the book pairs from 173 while its own
     opening passage faces nothing. Hence the inner tags are stripped and the TRAILING number taken,
     which reads both forms the same way.

     Gated on `sections: "float"`, so the four books already shipped cannot be touched by it. */
  if (book && book.sections === "float") {
    b = b.replace(/<span class="wst-verse[^"]*wst-verse-float[^"]*"[^>]*>([\s\S]*?)<\/span>/g, (whole, inner) => {
      const n = inner.replace(/<[^>]*>/g, "").match(/(\d+)\s*$/);
      return n ? '<span class="bk-n">' + n[1] + "</span>" : whole;
    });
  }
  /* THE FOURTH WAY an edition marks its numbers, and the first whose number is not an integer
     (Aug 2026, adding the Nicomachean Ethics). Aristotle is cited by BEKKER PAGE — the page and
     column of Bekker's Berlin edition of 1831, so that "1094a" and "1094b" are two different places
     and every edition in every language prints them. Ross's Oxford translation sets them in the
     margin, which arrives as `wst-verse` like Gummere's and Jowett's, but nested: the page number in
     a `<b>` with the column letter in a `<sup>` INSIDE it, `<sup><b>1094<sup>a</sup></b></sup>`.
     Neither rule above can take it — Gummere's wants nothing but digits between the `<b>` tags, and
     Jowett's takes the trailing number, which here is the page with its letter thrown away.

     THE ID IS READ RATHER THAN THE MARKUP, which is what makes this simple: Wikisource anchors each
     marker with the clean citation as its id, so the page is `id="1094a"` however the visible number
     is dressed. That also tells the two kinds of marker apart, and they must be told apart — this
     edition marks Bekker's LINE numbers the same way, every fifth line, as `wst-verse` spans whose
     id is a bare figure. There are 1,141 of them against 173 pages. Left alone they survive the
     tag strip as loose superscript digits scattered through the prose, which read as footnote
     markers that open nothing; taken as sections they would bury the page numbers under them. They
     are dropped, and the pairing runs on the pages, which is the unit both editions state.

     Two more things this pass owes the reader. The marker carries an explicit `data-n` sort key,
     because "1094a" is not a number and app.js pairs the columns on one — see the note there. And a
     page is accepted only where it moves the sequence FORWARD, the guard the Latin's bracketed
     numbers and Haines's leading numerals both use: this transcription marks a page twice in each
     of books V, VI and IX, and without the guard the second one reopens a section that is already
     closed. See the entry in BOOKS for what those three are and why they are not repaired here. */
  if (book && book.sections === "bekker") {
    let seq = 0, pages = 0, lines = 0;
    b = b.replace(/<span class="wst-verse[^"]*"[^>]*>[\s\S]*?<\/span>/g, (whole) => {
      const id = (whole.match(/\bid="([^"]*)"/) || [])[1] || "";
      const pg = /^(\d{3,4})([ab])$/.exec(id);
      /* EVERYTHING IN THIS EDITION'S MARGIN THAT IS NOT A PAGE IS A LINE NUMBER, so the fallback
         drops rather than keeps. It matters because the transcription is not perfectly regular:
         inventoried over all ten books there are 176 pages and 1,141 line numbers, and ONE marker
         that is neither — a line 5 in Book II mistyped as `id="5:"` with an empty `<sup>`. Left
         alone that survives the tag strip as a bare empty superscript sitting mid-sentence, which
         renders as nothing and reads, to anyone inspecting the markup, like a footnote marker that
         has lost its note. A span carrying visible text that is not a plain figure is reported
         before it goes, so a genuinely new kind of marker cannot leave in silence. */
      if (!pg) {
        const txt = whole.replace(/<[^>]*>/g, "").trim();
        if (txt && !/^\d{1,3}$/.test(txt) && warn) warn("dropped an unrecognised margin mark: " + JSON.stringify(txt));
        lines++;
        return "";
      }
      const key = +pg[1] * 10 + (pg[2] === "a" ? 0 : 1);
      if (key <= seq) { warn && warn("Bekker page " + id + " repeats or goes backwards — left as text"); return ""; }
      seq = key; pages++;
      return '<span class="bk-n" data-n="' + key + '">' + id + "</span>";
    });
    if (!pages && warn) warn("no Bekker pages found — the chapter will pair as one whole block");
  }
  /* THE FIFTH WAY an edition marks its numbers, and the first read ENTIRELY out of the id (Aug 2026,
     adding the Peloponnesian War). Thucydides is cited by book and chapter — "Thucydides 2.34" is book
     2, chapter 34 — and this transcription marks each chapter with a template that renders as a
     wst-verse span holding a bare superscript figure, anchored with the full citation as its id:
     id="2:34" around <sup>34</sup>.

     None of the four rules above can take it, and each fails differently: Gummere's wants a <b> inside
     the <sup> and there is none, Jowett's wants the float class and this is a default-styled span, and
     the Bekker rule wants a page-and-column id. Left unmatched the span survives the tag strip as a
     loose superscript digit mid-sentence — which reads as a footnote marker opening nothing — and the
     book pairs as one 146-chapter block against a Greek column that states every one of its numbers.
     That is this file's usual quiet failure: nothing throws and no prose is lost.

     THE ID IS READ RATHER THAN THE VISIBLE FIGURE, for the reason the Bekker rule reads it: the id is
     the citation the wiki itself asserts, where the printed figure is whatever the template chose to
     show. Here it also carries the BOOK, which is what makes it worth checking rather than merely
     parsing — a page transcluding the wrong book would announce itself as a mismatch instead of
     silently filing 146 chapters under Book 2. Hence `expect`, passed by the caller as the Folio
     chapter being fetched and compared against the id's first half.

     The chapter number is a plain integer here, so no data-n sort key is written: app.js reads the
     marker's own text where the attribute is absent, which is exactly the pre-Aristotle behaviour and
     is right for a book whose numbers are integers. Accepted only where it moves the sequence FORWARD,
     the guard every rule above uses, and zero is admitted (`>= 0`) because the Gallic War established
     that a chapter may be numbered 0 — this work has none, and the guard costs nothing either way. */
  if (book && book.sections === "bookchapter") {
    let seq = -1, chapters = 0;
    b = b.replace(/<span class="wst-verse[^"]*"[^>]*>[\s\S]*?<\/span>/g, (whole) => {
      const id = (whole.match(/\bid="([^"]*)"/) || [])[1] || "";
      const m = /^(\d+):(\d+)$/.exec(id);
      /* A span that is not a chapter mark is REPORTED before it goes, never kept: kept, it is a stray
         superscript in the prose; dropped in silence, a genuinely new kind of marker leaves without
         anyone learning it existed. The Ethics' one mistyped line number is why this is worded so. */
      if (!m) {
        const txt = whole.replace(/<[^>]*>/g, "").trim();
        if (warn) warn("dropped an unrecognised verse mark" + (id ? ' id="' + id + '"' : "") +
          (txt ? ": " + JSON.stringify(txt) : ""));
        return "";
      }
      if (book.expect != null && +m[1] !== +book.expect)
        warn && warn("chapter mark " + id + " belongs to book " + m[1] + ", not " + book.expect);
      const n = +m[2];
      if (n <= seq) { warn && warn("chapter " + id + " repeats or goes backwards — dropped"); return ""; }
      seq = n; chapters++;
      return '<span class="bk-n">' + n + "</span>";
    });
    if (!chapters && warn) warn("no chapter numbers found — the book will pair as one whole block");
  }
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
  /* VERSE SET AS A DEFINITION LIST, which is a shape this shelf had not met (Aug 2026, adding the
     Prose Edda). Snorri quotes skaldic stanzas as EVIDENCE — several to a chapter, some hundreds
     across the book — and they are the one thing in it that must not read as prose, since the whole
     argument of Skáldskaparmál is about how the lines are built. Wikisource sets them as
     `<dl><dd>line</dd><dd>line</dd></dl>`, and neither `dl` nor `dd` is in ALLOWED, so stripTags
     unwraps both and every stanza arrives as one run-on sentence. The usual quiet shape: nothing
     throws, not a word is lost, the chapter is exactly the right length, and only LOOKING at the
     rendered page shows it — which is how it was found, the golden rule's "it isn't finished until
     it has been looked at" earning its keep again.

     Converted to the shape the shelf already uses for verse — a blockquote of one paragraph whose
     lines are divided by `<br>`, which is what Seneca's quoted poetry ships as — so it needs no
     reader-side change and no new style. Gated per book, like `dropAuxToc` and `body: "plain"` and
     for the same reason: `dd` is a definition list everywhere else and could be carrying something
     other than verse in an edition nobody has looked at yet, so the rule can only fire on a book that
     asks for it and is provably inert on the twenty-five already shipped. */
  if (book && book.verse === "dl") b = verseFromLists(b);
  /* Before the centred divs become blockquotes and lose the class this has to key on — see
     markLikiHeads, which sorts a half-title from the section heading printed under it in the very
     same block. Gated per book, so it is provably inert on the twenty-six already shipped. */
  if (book && book.sections === "liki") b = markLikiHeads(b, warn || (() => {}));
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
    /* TWO SHAPES OF LEADING BLOCK, because a centred head need not be a paragraph. Seneca's and
       Haines's arrive as a <p> inside the centred div; The Prince's chapter TITLE is a bare run of
       text inside its own, so a <p>-anchored pattern reaches its "EIGHTEENTH CHAPTER" line and leaves
       the title standing underneath — a quotation of the chapter's own name, directly below the
       heading Folio has already printed. The bare form is required to open on a non-tag character, so
       it can never swallow a nested block's opening tag and take the rest of the chapter with it. */
    /* A THIRD SHAPE: a centred head of SEVERAL paragraphs (Aug 2026, adding Aesop's Fables). The
       first fable opens on one centred block holding the collection's half-title, the rules under
       it, the frontispiece and its caption — four paragraphs in one <blockquote>, where shape one
       wants exactly one <p> and shape two wants no tags at all, so neither can see it and the book
       began on a quotation of its own title page.

       It is not a loosening: the test applied to what it matches is the same one, so a block is
       still removed only when its whole text matches a pattern the book itself declares, and
       dropHeads is per book. Matching to the FIRST </blockquote> rather than the last is deliberate
       — a leading block that contains a nested one yields a partial text, which will simply fail
       the test and be left alone, where a greedy match could swallow real prose. It is listed last
       so the two older shapes keep first refusal and go on behaving exactly as they did. */
    const HEAD_SHAPES = [
      /^<blockquote>\s*<p>([\s\S]*?)<\/p>\s*<\/blockquote>\s*/,
      /^<blockquote>\s*([^<][\s\S]*?)\s*<\/blockquote>\s*/,
      /^<blockquote>\s*((?:(?!<\/?blockquote>)[\s\S])*?)<\/blockquote>\s*/,
    ];
    /* THE FURNITURE A DROPPED HEAD LEAVES BEHIND HAS TO GO ROUND THE LOOP TOO, or the SECOND head
       is unreachable (Aug 2026, adding The Dialogues). Every shape here is anchored to position 0,
       deliberately, so that only a head can go; the blank line a head sat above is a `<p><br></p>`
       that stands between it and whatever follows. With one head that never mattered — the tidy-up
       below runs after the loop and clears it. With TWO, the first head goes, its blank line is now
       at position 0, and the edition's "PERSONS OF THE DIALOGUE" label behind it can no longer be
       seen by any pattern: it stands at the top of the chapter as a quotation, in three dialogues
       out of eleven, which reads as an inconsistent transcription rather than as a rule that did
       not fire. Nothing throws, no prose is lost and the chapter is the right length — the quiet
       shape this file keeps meeting.

       So a leading paragraph holding nothing but line breaks is peeled INSIDE the loop, before each
       pass at the heads. It cannot eat prose: the `</p>` has to follow the breaks immediately, so
       `<p><br>Real text</p>` does not match. MEASURED BEFORE IT WAS MADE, over every shipped
       chapter of every book: none of them begins with an empty or break-only paragraph, so this is
       provably inert on the five older books that declare dropHeads — which is the check this
       file's own history says to run on any edit to cleanBody, the extractor being shared and its
       other callers already proof-read by readers. */
    for (let k = 0; k < 8; k++) {
      const before = b;
      b = b.replace(/^<p>\s*(?:<br>\s*)*<\/p>\s*/, "");
      for (const shape of HEAD_SHAPES) {
        b = b.replace(shape, (m, inner) => {
          const t = inner.replace(/<[^>]*>/g, " ").replace(/&#\d+;|&nbsp;/g, " ").replace(/\s+/g, " ").trim();
          return book.dropHeads.some((rx) => rx.test(t)) ? "" : m;
        });
      }
      if (b === before) break;
    }
    // the line break the head used to sit above, now opening the first paragraph on a blank line
    b = b.replace(/^<p>\s*(?:<br>\s*)+/, "<p>");
  }
  /* THE SAME FURNITURE SET AS ORDINARY PARAGRAPHS (Aug 2026, adding The City of God). dropHeads above
     is anchored to a leading `<blockquote>`, because in every edition that has needed it the running
     head arrives as a centred div. This transcription centres nothing: the volume's half-title, the
     book's own number and the rule of em dashes under it are three plain `<p>`s at the top of each
     book's page, so not one of dropHeads' three shapes can reach them and every chapter would open on
     "The City of God. / Book I. / ————————————" above the Argument that already says which book it is.

     It is a SEPARATE option rather than a fourth shape on dropHeads, and deliberately: a fourth shape
     would start dropping leading paragraphs in the six books that already declare dropHeads, whose
     patterns were written knowing that only a centred block could match them. Gated on its own key it
     cannot execute for any of them, which is the argument every other addition to this function
     rests on.

     Otherwise it shares dropHeads' whole discipline — anchored to position 0, the block's WHOLE text
     tested against a pattern the book itself declares, one block peeled per pass, the loop stopping
     the moment nothing matches — so the worst a bad pattern can do is stop early, never run into
     prose.

     AND A DROPPED HEAD MAY CARRY A FOOTNOTE MARKER, which is the one thing this had to add. Two of
     these books hang the editor's note on the book's own number — "Book V.[1]", "Book XIV.[1]" — so
     dropping the line drops the marker and the note stays in the list with no sentence to open it.
     The marker is carried down to the front of the next block instead, which is where a note about
     the whole book belongs; a heading is not a sentence, so nothing else about it is worth keeping.
     Gated again (`dropHeadMarkers`) so a book that would rather lose the marker still can. */
  if (book && book.dropLeadParas) {
    /* The markers are collected as the heads are peeled and planted afterwards, rather than left in
       the string behind a sentinel. A sentinel would sit at position 0 and every shape here is
       anchored there, so the SECOND head of a run would be unreachable the moment the first one
       carried a marker — which is the fault dropHeads records for its own blank-line peel, met again
       one option along. Peeled here rather than in dropHeads' loop for the reason the whole option
       is separate: a `<p>` at position 0 is prose in the six books that declare dropHeads. */
    const carried = [];
    for (let k = 0; k < 8; k++) {
      const before = b;
      b = b.replace(/^<p>\s*(?:<br>\s*)*<\/p>\s*/, "");
      b = b.replace(/^<p>((?:(?!<\/p>)[\s\S])*)<\/p>\s*/, (m, inner) => {
        const t = inner.replace(/<[^>]*>/g, " ").replace(/&#\d+;|&nbsp;/g, " ").replace(/\s+/g, " ").trim();
        if (!book.dropLeadParas.some((rx) => rx.test(t))) return m;
        if (book.dropHeadMarkers)
          carried.push(...(inner.match(/<sup class="fn"(?: data-fn="\d+")?><\/sup>/g) || []));
        return "";
      });
      if (b === before) break;
    }
    if (carried.length) b = b.replace(/(<p[^>]*>)/, "$1" + carried.join(""));
  }
  /* THE FURNITURE AT THE OTHER END OF THE CHAPTER (Aug 2026, adding Shakuntala — the first book here
     whose last page carries the printer's imprint inside the transcluded slice).

     dropHeads is anchored to position 0, deliberately and for a good reason: only a head can go, so
     it can never reach into prose. That leaves the FOOT of a chapter unguarded, and until now nothing
     needed it — every earlier book's closing furniture falls outside the slice, or is the footnote
     apparatus, which the reflist split above already cuts off. Jones's Sacontala ends its seventh act
     with two centred blocks the 1870 printing sets for itself: "THE END." and the trade imprint of
     the London printer who set the type. Neither is Kalidasa. Left alone they arrive as two indented
     quotations under the last line of the play — this file's usual quiet failure, since nothing
     throws, no prose is lost and the chapter is exactly the right length.

     It is the MIRROR of dropHeads and shares its whole discipline rather than relaxing it: the same
     blockquote shapes, anchored to the end instead of the start; the same test, that a block goes
     only when its WHOLE text matches a pattern the book itself declares; the same loop, so a run of
     trailing blocks is peeled one at a time; and the same per-book gate. That gate is what makes this
     provably inert on all twenty books already shipped — none of them declares `dropTail`, so the
     branch cannot execute for any of them, which is the argument `body: "plain"` and `dropHeadings`
     rest on too.

     Anchoring to the END is what keeps it as safe as its twin. A pattern loose enough to eat prose
     still cannot, because it has to match a whole trailing block and the loop stops the moment one
     fails — so the worst a bad pattern can do is stop early, never run on into the play. */
  if (book && book.dropTail) {
    const TAIL_SHAPES = [
      /\s*<blockquote>\s*<p>([\s\S]*?)<\/p>\s*<\/blockquote>\s*$/,
      /\s*<blockquote>\s*([^<][\s\S]*?)\s*<\/blockquote>\s*$/,
      /\s*<blockquote>\s*((?:(?!<\/?blockquote>)[\s\S])*?)<\/blockquote>\s*$/,
    ];
    for (let k = 0; k < 8; k++) {
      const before = b;
      // the blank line a trailing block sat under, peeled inside the loop as dropHeads peels its own
      b = b.replace(/\s*<p>\s*(?:<br>\s*)*<\/p>\s*$/, "");
      for (const shape of TAIL_SHAPES) {
        b = b.replace(shape, (m, inner) => {
          const t = inner.replace(/<[^>]*>/g, " ").replace(/&#\d+;|&nbsp;/g, " ").replace(/\s+/g, " ").trim();
          return book.dropTail.some((rx) => rx.test(t)) ? "" : m;
        });
      }
      if (b === before) break;
    }
  }
  /* A PARAGRAPH HOLDING NOTHING BUT LINE BREAKS (Aug 2026, adding The City of God). This
     transcription closes every one of its 665 pages with the blank line the printing sets under a
     chapter, which arrives as `<p><br></p>`. On a book that is one page to one chapter it falls at the
     very end and the tidy-up sweeps it; on a book whose chapter is a joined run of pages it lands
     between every pair of chapters, so the reader gets an empty block between them — and an
     unnumbered block is attached to the section already open, so each one rides silently on the end
     of the chapter above it. Gated per book, and it can only ever remove a paragraph with no text in
     it at all. */
  if (book && book.dropBlankParas) b = b.replace(/<p>\s*(?:<br>\s*)+<\/p>\s*/g, "");
  if (book && book.sections === "chapterhead") b = markChapterHead(b, book, warn);
  if (book && book.sections === "leading") b = markLeadingSections(b, warn);
  if (book && book.sections === "shu") b = markShuSections(b, warn);
  if (book && book.sections === "liki") b = markLikiSections(b, warn);
  if (book && book.sections === "edda") b = markEddaSections(b, warn);

  /* ONE SECTION FOR THE WHOLE CHAPTER, for an edition whose chapter IS the unit both columns are
     cited by — a single poem, printed on a page of its own on each wiki. There is nothing inside it
     that both texts number, so the marker goes at the head and carries the chapter's own number,
     which app.js then pairs on. Written here rather than left implicit because a chapter with no
     marker at all falls to the unnumbered path and pairs only while both sides happen to hold
     exactly one leading block — true today and an accident, not a rule. */
  if (book && book.sections === "whole" && book.mark != null) {
    b = '<p><span class="bk-n" data-n="' + book.mark + '">' + book.mark + "</span></p>" + b;
  }
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
/* ONE PRINTED LETTER WRITTEN FOUR WAYS, normalised on the page before either the prose or the notes
   is read out of it (Aug 2026, adding the Book of Rites).

   Legge romanises Chinese in a system of his own that needs a letter no alphabet has: a blackletter Z
   standing for a sound he keeps apart from plain z, so Zengzi is "Зăng-зze" and the Nêi Zeh is "Nêi
   Зeh". Unicode has no such letter, and the transcription reaches for four different characters to
   stand in for it — Cyrillic З 139 times in the running prose, a mathematical bold fraktur 𝖅 98 times
   and 𝖟 71 times in the headings and half-titles, and a blackletter ℨ twice, including on the
   volume's own contents page. It is one letter in the book and four to any reader searching for it.

   Two of the four are also outside the Basic Multilingual Plane, and a font that carries them is not
   a font anyone reads a book in: on a device with no mathematical-alphanumerics face they are empty
   boxes, and there are 169 of them here plus two chapter tabs. So all four are written the way the
   transcription itself writes them most often, in the running prose, which is the one place a reader
   meets the letter oftenest.

   THIS IS A REPAIR, so it is narrow and it is declared per book: a table of exact characters, applied
   to the fetched page before anything is extracted from it, so the prose and the footnotes and the
   chapter titles cannot come to spell the same name differently. It asserts nothing about which glyph
   Legge set — only that whatever he set, he set one. */
function applyGlyphs(h) {
  if (!BOOK || !BOOK.glyphs) return h;
  for (const [from, to] of BOOK.glyphs) h = h.split(from).join(to);
  return h;
}

function notesOf(h) {
  const m = h.match(/<ol class="references">([\s\S]*?)<\/ol>/);
  if (!m) return { notes: [], ids: [] };
  const notes = [], ids = [];
  const rx = /<li id="(cite[^"]*)"[\s\S]*?<span class="reference-text">([\s\S]*?)<\/span>\s*<\/li>/g;
  let x;
  while ((x = rx.exec(m[1]))) {
    ids.push(x[1].replace(/&#95;/g, "_"));
    notes.push(noteText(x[2]));
  }
  return { notes, ids };
}

/* One note, reduced to the small tag set a note may carry. Split out of notesOf so the endnote table
   below cleans its entries exactly as a footnote is cleaned and the two cannot drift — a note is a
   note whether the edition printed it at the foot of the page or at the back of the book. */
function noteText(s) {
  return stripWikiCSS(s)
    .replace(/<(?!\/?(i|b|em|strong)\b)[^>]*>/g, "")
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ---------- ENDNOTES: an apparatus gathered at the back of the volume ----------
   See `endnotes` in the BOOKS entry for The Prince, which is the first book here to have one. The
   page is a two-column table — the page number annotated on the left, the note on the right — and the
   left cell carries an anchor (`<span id="n16">`) that the in-text markers point at. This returns
   anchor -> note text; resolveEndnotes then swaps each chapter's stub for the note it stands for.

   The LAST cell of the row is the note, not the second: a row may carry a style link before its cells
   and the annotated-page cell is always first, so counting from the end is the stable end to count
   from. A row with no anchor is the table's own "PAGE" heading and is skipped. */
function endnoteTable(h, warn) {
  const out = {};
  const doc = h.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  for (const row of doc.split(/<tr[^>]*>/).slice(1)) {
    const a = row.match(/\bid="(n\d+)"/);
    if (!a) continue;
    const cells = row.split(/<td[^>]*>/).slice(1);
    if (cells.length < 2) { warn && warn("endnote " + a[1] + " has no note cell"); continue; }
    const txt = noteText(cells[cells.length - 1].split(/<\/td>/)[0]);
    if (txt) out[a[1]] = txt;
    else warn && warn("endnote " + a[1] + " came back empty");
  }
  return out;
}

/* Replace each stub with the endnote its own marker points at, and DROP the stubs that point at
   nothing. The join is the marker's anchor — MediaWiki names the reference after it, so
   `cite_note-n16-1` is the note anchored `n16` — which is the rule the footnote markers already follow
   and the reason `notesOf` returns its ids at all.

   WHY THE REST ARE DROPPED RATHER THAN GUESSED AT. This transcription marks fifteen places in the text
   against fifty-five notes at the back, and only five of the fifteen name the note they mean; the
   other ten carry the bare words "See Note." and no target. The obvious repair is to join them on the
   PRINTED PAGE, which is what the note table is keyed by and what the anchors turn out to be — and it
   was measured before it was believed, and it does not work: of the ten, four sit on a page carrying
   exactly one note and could be joined, three sit on a page carrying two or three, and one sits on a
   page carrying none at all. So the join would be a guess for most of them, and a marker pointing at
   the wrong note is worse than no marker — the rule the citation passes elsewhere in this project keep
   arriving at. What ships is the notes this edition's own apparatus states, and the front matter says
   that the rest of it is at the back of a book Folio does not carry.

   The dropped notes take their MARKERS with them (see pruneNotes), or wireFootnotes would renumber the
   survivors and leave every marker after the first gap pointing one entry too far. */
function resolveEndnotes(got, table, warn) {
  const keep = [], notes = [];
  got.notes.forEach((txt, i) => {
    const key = (got.ids[i].match(/^cite_note-(n\d+)-/) || [])[1];
    if (key && table[key]) { keep.push(i + 1); notes.push(table[key]); return; }
    warn("note " + (i + 1) + " points at the endnotes without saying which — marker dropped");
  });
  got.notes = notes;
  return keep;
}

/* Keep only the markers whose notes survived, and renumber them to their new places in the list.
   `keep` is the surviving notes' ORIGINAL 1-based positions, in order, which is exactly the map from
   the numbers cleanBody has just written to the numbers the shipped list will have. */
function pruneNotes(html, keep) {
  const map = {};
  keep.forEach((old, i) => (map[old] = i + 1));
  return html.replace(/<sup class="fn" data-fn="(\d+)"><\/sup>/g, (m, d) =>
    map[d] ? '<sup class="fn" data-fn="' + map[d] + '"></sup>' : "");
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

/* ---------- THE INTERLEAVED PARALLEL TEXT (the Analects) ----------
   The second shape a facing-page edition arrives in, and the reason for it is in the BOOKS entry.
   Everything below reads ONE page — one book of the Analects — and returns both of its columns.

   A Chinese numeral, in the several costumes this edition writes them in. Chapter numbers here run
   from 一 to 四七, and the marks are not one system: the first ten carry 第 and the rest do not; the
   twenties, thirties and forties are written with the compressed forms 廿 and 卅, or as a tens digit
   and a units digit run together (四五 for forty-five, which spelled out in full would be 四十五).
   All of it is read, and anything that is not returns null so the caller can say so rather than
   silently dropping a chapter — which is the one failure here that would take prose off the page. */
const CN_DIGIT = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
const CN_TEN = { 十: 10, 廿: 20, 卅: 30, 卌: 40 };
function cnNum(s) {
  s = String(s).replace(/^第/, "").trim();
  let m;
  // 十 / 十一 / 三十 / 三十二 / 廿 / 廿三 / 卅九
  if ((m = /^([一二三四五六七八九])?([十廿卅卌])([一二三四五六七八九])?$/.exec(s)))
    return (m[1] ? CN_DIGIT[m[1]] * 10 : CN_TEN[m[2]]) + (m[3] ? CN_DIGIT[m[3]] : 0);
  // 四五 — the tens word dropped, which this edition does from the twenties up
  if ((m = /^([一二三四五六七八九])([一二三四五六七八九])$/.exec(s))) return CN_DIGIT[m[1]] * 10 + CN_DIGIT[m[2]];
  if ((m = /^([一二三四五六七八九])$/.exec(s))) return CN_DIGIT[m[1]];
  return null;
}

/* The two languages, separated by the markup that already distinguishes them. Every run of Chinese on
   these pages is inside an element carrying `wst-lang`, as a span mid-paragraph or as a div holding
   several paragraphs, and nothing else on the page is. So the Chinese is lifted out in reading order
   and what remains IS the English — which is more robust than trying to split on the chapter markers
   alone, since a run of several chapters' Chinese often sits in one element with no English between.
   `blockEnd` walks the nesting rather than matching the next closing tag, so a formatting span inside
   a Chinese block cannot end it early. */
function splitInterleaved(h) {
  const zh = [];
  let en = "", i = 0;
  const rx = /<(span|div)[^>]*class="[^"]*wst-lang[^"]*"[^>]*>/g;
  for (;;) {
    rx.lastIndex = i;
    const m = rx.exec(h);
    if (!m) break;
    const e = blockEnd(h, m.index, m[1]);
    if (e < 0) break;
    en += h.slice(i, m.index);
    zh.push(h.slice(m.index + m[0].length, e).replace(/<\/(?:span|div)>\s*$/, ""));
    i = e;
  }
  en += h.slice(i);
  return { zh, en };
}

/* Classical Chinese is written without word spaces, so every space between two Chinese characters
   here is an artifact of the transcription rather than something on the printed page — mostly a
   sentence carried across two `wst-lang` elements where the printed line broke, rejoined with the
   whitespace that separated the markup. 43 of them across the twenty books, and each reads as a gap
   in the middle of a phrase. Removed only BETWEEN Chinese characters, so anything Latin in this
   column keeps the spacing that makes it readable. */
const cnPlain = (s) =>
  stripWikiCSS(s)
    .replace(/<[^>]*>/g, " ")
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .replace(/([⺀-鿿豈-﫿＀-￯])\s+(?=[⺀-鿿豈-﫿＀-￯])/g, "$1")
    .trim();

/* Both columns of one book, from one fetch of one page. */
function extractInterleaved(h, book, warn) {
  /* This transcription carries no footnotes at all — measured over all twenty books, zero reference
     marks — so the book renders with no note fold, exactly as Ovid and Lucretius do. It is still
     asked for, because a note appearing in a later revision of the transcription would otherwise be
     dropped in silence, and a silent drop is how a translator's note becomes nobody's. */
  const { notes } = notesOf(h);
  if (notes.length) warn(notes.length + " footnote(s) found — this edition carried none, so they are not wired");

  const { zh, en } = splitInterleaved(h);

  /* ---- the Chinese column ----
     Split on its own chapter marks. Inside a chapter the edition also marks Legge's numbered
     paragraphs 【一節】, and those become paragraph BREAKS rather than printed numbers: the English
     beside them prints "1." "2." itself, so the two columns line up without the bracket being
     repeated in a script most readers of this column cannot read either. They are also not always
     right — book 2's chapter 18 numbers both of its sections 一 — and a break says nothing a
     duplicate could falsify. */
  const zhBy = {};
  const zparts = zh.join("\n").split(/【([^】]{1,6})章】/);
  for (let k = 1; k < zparts.length; k += 2) {
    const n = cnNum(zparts[k]);
    if (n === null) { warn("could not read the Chinese chapter mark 【" + zparts[k] + "章】"); continue; }
    const paras = cnPlain(zparts[k + 1]).split(/【[^】]{1,6}節】/).map((s) => s.trim()).filter(Boolean);
    if (paras.length) zhBy[n] = paras;
  }

  /* ---- the English column ----
     Legge's own emphasis is set in SMALL CAPITALS — "what you do not want done to yourself, do not do
     to others" turns on a small-cap RECIPROCITY, and the transliterated Chinese words he leaves
     untranslated are set the same way. Folio's reader has no small-caps style for book prose and this
     transcription uses italics nowhere at all, so they become italics: the emphasis survives and
     nothing it could be confused with is lost. The chapter markers are the same element, so they are
     taken out first, before the rest are converted. */
  /* The sentinel is a pair of printable characters no printed page can contain, rather than a tag:
     it has to survive stripTags, which rules out markup. The chapter marker sits INSIDE its
     paragraph — <p><span…>Chapter</span> I. 1. The Master said — so the opening tag is swallowed
     with it and re-emitted after the sentinel, or every chapter would begin mid-paragraph and end
     on the next one dangling p tag. */
  const SEP = "@@CH@@";
  const CHAP = '<span class="smallcaps"[^>]*>Chapter<\\/span>\\s*([IVXLC]+)\\s*\\.?\\s*';
  let b = en.replace(new RegExp("<p>\\s*" + CHAP, "g"), (m, r) => SEP + r + SEP + "<p>");
  b = b.replace(new RegExp(CHAP, "g"), (m, r) => SEP + r + SEP);
  /* Everything before the first chapter is the page's own running head — the book's title in Chinese
     and again in English — which is not part of the text and would otherwise open every book as an
     unattributed line. Cut at the first SENTINEL rather than at the first marker in the markup, and
     this is load-bearing rather than tidy: the marker sits inside its paragraph, so cutting at the
     marker leaves the opening `<p>` behind and hands stripTags a closing tag it never saw opened,
     which its stack correctly discards — and the first chapter of every book then runs into the
     second with no paragraph break between them. Nothing throws and no prose is lost; the page just
     quietly stops having paragraphs. Cutting at the sentinel keeps the pair together. */
  const first = b.indexOf(SEP);
  if (first > 0) b = b.slice(first);
  b = b.replace(/<span class="smallcaps"[^>]*>([\s\S]*?)<\/span>/g, "<i>$1</i>");
  b = stripWikiCSS(b).replace(/<!--[\s\S]*?-->/g, "");
  b = stripTags(b).replace(/&#160;|&nbsp;/g, " ").replace(/[ \t]+/g, " ");

  const enBy = {};
  const eparts = b.split(new RegExp(SEP + "([IVXLC]+)" + SEP, "g"));
  let seq = 0;
  for (let k = 1; k < eparts.length; k += 2) {
    const printed = roman(eparts[k]);
    let n = printed;
    /* FORWARD-ONLY, and the one book where it fires is recorded in the BOOKS entry: a numeral that
       does not move the count on is a slip in the transcription, and the chapter it opens is a real
       chapter that has to keep its place. A numeral that leaps forward is left alone — an edition may
       genuinely skip a number — but it is reported, since here none does. */
    if (!(n > seq)) {
      n = seq + 1;
      warn('book chapter numbering: "' + eparts[k] + '" (' + printed + ") printed where the sequence reaches " + n + " — taking " + n);
    } else if (n > seq + 1) {
      warn("chapter numbering jumps from " + seq + " to " + n);
    }
    seq = n;
    /* The trailing <p><br></p> between chapters is the printed page's spacing, not a paragraph. */
    let t = eparts[k + 1]
      .replace(/<p>\s*(?:<br>\s*)+<\/p>/g, "")
      .replace(/<p>\s*<\/p>/g, "")
      .replace(/<br>\s*(?=<\/p>)/g, "")
      .replace(/<p>\s*(?:<br>\s*)+/g, "<p>")
      .trim();
    /* A Chinese block can interrupt an English sentence, because the printed page alternates the two
       languages line by line rather than chapter by chapter. Lifting that block out leaves the
       sentence in two paragraphs — "in the giving pay" / "or rewards to men" — which is a break the
       printed page does not have and this extractor made. 26 of them across the twenty books, every
       one in books 14–20 where the interleaving is finest.

       Rejoined on the narrowest test that identifies them: the paragraph before ends on no sentence
       punctuation at all AND the one after opens on a lower-case letter. A paragraph Legge really
       does begin here always opens on its own number ("2. The Master said"), so the rule cannot
       swallow a real break. */
    t = t.replace(/([^.!?:;"'’”)\]]\s*)<\/p>\s*<p>\s*(?=[a-z])/g, "$1 ");
    if (t) enBy[n] = t;
  }

  const enNums = Object.keys(enBy).map(Number).sort((a, b2) => a - b2);
  const zhNums = Object.keys(zhBy).map(Number).sort((a, b2) => a - b2);
  if (!enNums.length) throw new Error("no chapters found — the page's markup has changed");
  /* The pairing rests on these two runs, so what would quietly break it is asserted rather than
     hoped for: a gap in either, and a chapter one column has that the other does not. */
  const brokenRun = (a) => a.some((v, i2) => v !== i2 + 1);
  if (brokenRun(enNums)) warn("the English chapters are not a clean 1–N run (" + enNums.length + " of them, highest " + enNums[enNums.length - 1] + ")");
  if (zhNums.length && brokenRun(zhNums)) warn("the Chinese chapters are not a clean 1–N run (" + zhNums.length + " of them, highest " + zhNums[zhNums.length - 1] + ")");
  const noZh = enNums.filter((n) => !zhBy[n]);
  const noEn = zhNums.filter((n) => !enBy[n]);
  if (noZh.length) warn("no Chinese for chapter(s) " + noZh.slice(0, 8).join(", "));
  if (noEn.length) warn("no English for chapter(s) " + noEn.slice(0, 8).join(", "));

  const html = enNums
    .map((n) => {
      const mark = '<span class="bk-n">' + n + "</span> ";
      const t = enBy[n];
      return /^<p>/.test(t) ? t.replace(/^<p>/, "<p>" + mark) : "<p>" + mark + t;
    })
    .join("\n");
  const orig = zhNums
    .map((n) => zhBy[n].map((p, i2) => "<p>" + (i2 ? "" : '<span class="bk-n">' + n + "</span> ") + p + "</p>").join("\n"))
    .join("\n");
  return { html, notes: [], orig, count: enNums.length, origCount: zhNums.length };
}

/* ============================================================
   A VERSE-NUMBERED PARALLEL TEXT — the ninth shape, and the first CUT AT THE ORIGINAL'S OWN MARKS
   ============================================================
   The Bhagavad Gita is the third facing-page edition on this shelf, after the Art of War's
   two-cell tables and the Analects' interleaved column, and it needed its own reader for a
   reason worth stating: THE PRINTED NUMERALS ARE ON THE SIDE THIS SITE DOES NOT NORMALLY CUT AT.

   Every earlier parallel book takes its structure from the English. Giles's section numbers open
   an English list item; Legge's chapters are marked in both columns and the English is walked.
   Here the Sanskrit carries a complete, unbroken set of verse numerals — the traditional ॥ २ ॥
   between double dandas — and the ENGLISH IS THE DAMAGED COLUMN. Measured over all eighteen
   discourses before any of this was written: 702 Sanskrit numerals against 694 English ones, and
   the eight the English is missing are not missing verses. Four are a closing parenthesis dropped
   by the printer or the transcriber, so the marker reads "(42" where the sequence wants "(42)"
   (3.42, 6.23, 8.20, 9.14); four carry no numeral at all (10.31, 11.8, 18.14, 18.32). In every
   one of the eight the translation itself is present and complete on the page.

   So this cuts at the SANSKRIT, which is the Song of Roland's rule arrived at from the other
   side — cut at the separator the edition actually carries, not at the numerals that happen to be
   damaged — and the English numerals become a CHECK rather than the mechanism. 694 of them then
   AGREE with the position the cut gives them, which is what turns eight inferences into the only
   reading consistent with the other 694 rather than into eight guesses.

   THE ALTERNATION IS THE STRUCTURE, and it was verified rather than assumed: every Sanskrit verse
   on these pages is followed by its own translation before the next Sanskrit verse begins. Over
   the whole book, 702 verse-following segments and NOT ONE with an empty English side. That is
   the assumption the Analects entry warns about ("THEY DO NOT ALTERNATE ONE FOR ONE, and assuming
   they do is the trap") — true there, false here, and the difference is measured per book. */
const DEV_DIGIT = "०१२३४५६७८९";
function devNum(s) {
  const t = String(s).trim();
  if (!t) return null;
  let v = 0;
  for (const ch of t) {
    const i = DEV_DIGIT.indexOf(ch);
    if (i < 0) return null;
    v = v * 10 + i;
  }
  return v;
}

/* The two languages IN READING ORDER, which is what separates this from splitInterleaved. That one
   returns the Chinese as one array and the English as one string, because the Analects' columns do
   not alternate reliably and are re-paired afterwards on their chapter marks. Here the alternation
   IS the pairing, so the order has to survive the split — a segment list, not two piles.

   Same wrapper as the Analects, which is why no new markup rule was needed: every run of Sanskrit
   on these pages sits in a `wst-lang` element and nothing else on the page does. `blockEnd` walks
   the nesting rather than matching the next closing tag, so the centring and sizing divs Wikisource
   wraps a verse in cannot end the block early. */
function splitAlternating(h) {
  const out = [];
  const rx = /<(span|div)[^>]*class="[^"]*wst-lang[^"]*"[^>]*>/g;
  let i = 0;
  for (;;) {
    rx.lastIndex = i;
    const m = rx.exec(h);
    if (!m) break;
    const e = blockEnd(h, m.index, m[1]);
    if (e < 0) break;
    if (m.index > i) out.push({ lang: "en", html: h.slice(i, m.index) });
    out.push({ lang: "sa", html: h.slice(m.index + m[0].length, e).replace(/<\/(?:span|div)>\s*$/, "") });
    i = e;
  }
  if (i < h.length) out.push({ lang: "en", html: h.slice(i) });
  return out;
}

/* Sanskrit is written with word spaces, unlike the classical Chinese cnPlain has to rejoin, so this
   is an ordinary tag strip. The dandas are kept: they are the verse's own punctuation and a reader
   of this column expects them. */
const saPlain = (s) =>
  stripWikiCSS(s)
    .replace(/<[^>]*>/g, " ")
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/&#8203;/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

function extractShloka(h, book, warn) {
  const { notes, ids } = notesOf(h);

  /* The body is everything before the footnote list. Besant annotates heavily — 381 notes over the
     eighteen discourses — and they are ordinary Wikisource references, so the markers are resolved
     against their TARGETS rather than numbered by reading order, for the reason the Seneca entry
     gives at length: this edition cites one note from more than one place, and a marker numbered by
     position would point one entry too far from the first repeat onwards. */
  let body = h.split(/<div class="reflist|<div class="mw-heading[^"]*"><h2 id="Footnotes"/)[0];
  body = body.replace(/<sup id="cite[^"]*" class="reference">\s*<a href="#([^"]*)"[\s\S]*?<\/sup>/g, (m, tgt) => {
    const i = ids.indexOf(tgt.replace(/&#95;/g, "_"));
    return i < 0 ? '<sup class="fn"></sup>' : '<sup class="fn" data-fn="' + (i + 1) + '"></sup>';
  });
  body = body.replace(/<sup id="cite[^"]*" class="reference">[\s\S]*?<\/sup>/g, '<sup class="fn"></sup>');

  const segs = splitAlternating(body);

  /* ---- the walk ----
     THE SANSKRIT IS CUT AS ONE CONTINUOUS STREAM, NOT BLOCK BY BLOCK, and that distinction is the
     whole of this walk. A verse's Devanagari does not always sit in one `wst-lang` element: where
     the scan's page breaks inside a verse the transcription opens a fresh element, so the second
     discourse alone carries 76 blocks for its 72 verses, four of them holding no numeral at all.
     Reading a block as a verse therefore puts the OPENING OF THE NEXT VERSE at the end of the one
     before it — which is what shipped for an hour, and which is invisible to every count this file
     runs: the verse count is right, the two columns pair, the numbering is a clean 1–N, and only
     reading the rendered page beside the printed one shows it. It was found by looking at the page.

     So the numeral closes a verse rather than the element doing it: Sanskrit accumulates until a
     ॥ N ॥ arrives, and everything gathered up to that point is verse N however many elements it
     came in. The English then attaches to the verse the numeral just closed, which is where the
     printed page puts it. */
  const verses = [];
  let cur = null, saBuf = "";
  for (const s of segs) {
    if (s.lang === "sa") {
      const t = saPlain(s.html);
      if (t) saBuf += (saBuf ? " " : "") + t;
      const m = /॥\s*([०-९]{1,3})\s*॥\s*$/.exec(saBuf);
      const n = m ? devNum(m[1]) : null;
      if (n === null) continue;                       // a verse carried on into the next element
      if (!cur || n > cur.n) {
        if (n > (cur ? cur.n : 0) + 1) warn("verse numbering jumps from " + (cur ? cur.n : 0) + " to " + n);
        cur = { n, sa: saBuf, en: [] };
        verses.push(cur);
      } else if (cur) {
        /* A numeral that does not move the sequence on is the closing colophon — the eighteenth
           discourse's is numbered ॥ १८ ॥, the CHAPTER's number, standing after verse 78. Read as a
           verse it would overwrite the real eighteenth; it belongs to the verse it follows, which is
           where the printed page puts it. Measured: that is the only such numeral in the book. */
        cur.sa += " " + saBuf;
      }
      saBuf = "";
      continue;
    }
    /* English before the first verse is the running head — "SECOND DISCOURSE." — which is not part
       of the text and which Folio prints as the chapter's own title anyway. */
    if (cur) cur.en.push(s.html);
  }
  /* Sanskrit left over after the last numeral is the unnumbered tail of the closing formula. */
  if (saBuf && cur) cur.sa += " " + saBuf;
  if (!verses.length) throw new Error("no verses found — the page's markup has changed");

  /* ---- the title, transcribed and never composed ----
     This edition names each discourse in its own English, in the colophon: "…the first discourse,
     entitled: THE DESPONDENCY OF ARJUNA." All eighteen carry one — checked before it was relied on.
     The capitals are the printed page's and are kept, as Aesop's are: the case is unrecoverable, and
     titleCase() is the thing that entry records trying and rejecting. */
  const tail = verses.length ? saPlain(verses[verses.length - 1].en.join(" ")) : "";
  const tm = /entitled\s*:?\s*([^.]{3,90})\./i.exec(tail);
  const t = tm ? tm[1].trim().replace(/\s+/g, " ") : "";
  if (!t) warn("no colophon title found — the tab will fall back to the chapter word");

  /* ---- the English column ----
     The verse's own numeral is taken OFF the prose and re-emitted as the bk-n marker app.js pairs
     on, exactly as every other book here does; leaving it in would print the number twice. The
     forms accepted are the printed one and the damaged one, and nothing looser: a bare "(42" is
     taken only at the end of the verse it closes, which is where the eight damaged markers sit. */
  let checked = 0, absent = [], offBy = [];
  const html = verses
    .map((v) => {
      /* A VERSE IS ONE PARAGRAPH, and building it that way is what keeps the markup balanced.
         cleanBody's div→blockquote pass cannot be borrowed here: it is written for a whole page,
         and these segments are FRAGMENTS cut out of the middle of one, so a wrapper opened before
         the fragment begins closes inside it and one opened inside it closes after it ends. Mapped
         to blockquotes that way, the first discourse alone came out with 207 openers against 114
         closers — the Song of Roland's lesson exactly ("strip the whole unit before splitting it"),
         met from the other direction, and caught by counting a tag against its closer over the
         shipped data, which is the sweep this file prescribes after any stripTags-adjacent change.

         So the block furniture — Wikisource's centring and sizing wrappers, which carry no meaning
         here — is dropped outright rather than converted, and each verse is emitted as a single
         paragraph, which is what the printed page shows. Only the inline formatting and the footnote
         markers survive. */
      let b = stripWikiCSS(v.en.join(" ")).replace(/<!--[\s\S]*?-->/g, "");
      b = b.replace(/<\/?(?:div|p|blockquote|dl|dd|dt|table|tbody|tr|td|th|ul|ol|li|h[1-6])\b[^>]*>/g, " ");
      b = stripTags(b)
        .replace(/&#160;|&nbsp;/g, " ")
        .replace(/&#8203;/g, "")
        .replace(/&#32;/g, " ")
        .replace(/[ \t]+/g, " ");
      /* stripTags' stack discards a closing tag it never saw opened, which is the half of the
         problem it can solve on its own; an OPENER left over at the end of a fragment is the other
         half, and it is closed here so a stray <i> cannot italicise the rest of the discourse. */
      for (const tag of ["i", "b", "em", "strong", "q", "span"]) {
        const open = (b.match(new RegExp("<" + tag + "\\b[^>]*>", "g")) || []).length;
        const close = (b.match(new RegExp("</" + tag + ">", "g")) || []).length;
        for (let k = 0; k < open - close; k++) b += "</" + tag + ">";
      }
      /* The check the whole design rests on: does the printed English numeral agree with the place
         the Sanskrit put this verse? Where it does, it is removed. Where it is absent or damaged,
         that is recorded and the structural position stands. */
      const rx = new RegExp("\\(\\s*" + v.n + "\\s*\\)?(?=[^\\d]|$)");
      if (rx.test(b)) { b = b.replace(rx, ""); checked++; }
      else {
        /* THE NUMERAL PRINTED ONE AHEAD. Twice in the book the printer drops a verse number and the
           next one lands a verse early, repeating on its own verse immediately after so that the
           sequence re-syncs — 17.19 carries (20) and 18.14 carries (15), measured over the whole
           book and nowhere else. The numeral is furniture this reader strips from every one of the
           701 verses anyway, so leaving these two behind would not be preserving anything: it would
           print a figure beside a verse contradicting the number Folio shows, which is drawn from
           the Sanskrit and is right. Taken only at the very END of the verse, which is the one place
           a verse numeral sits, so a number inside the prose cannot be caught by it. */
        const ahead = new RegExp("\\(\\s*" + (v.n + 1) + "\\s*\\)?\\s*$");
        if (ahead.test(b)) { b = b.replace(ahead, ""); offBy.push(v.n); }
        else absent.push(v.n);
      }
      b = b.replace(/\s+([.,;:!?])/g, "$1").replace(/\s{2,}/g, " ").trim();
      const mark = '<span class="bk-n">' + v.n + "</span> ";
      return "<p>" + mark + b + "</p>";
    })
    .join("\n");

  const orig = verses
    .map((v) => {
      /* The trailing ॥ N ॥ goes the same way as the English "(N)", and for the same reason. The
         dandas that open the line and separate the half-verses stay — they are the verse, not a
         number. */
      const txt = v.sa.replace(/॥\s*[०-९]{1,3}\s*॥\s*$/, "॥").replace(/\s{2,}/g, " ").trim();
      return '<p><span class="bk-n">' + v.n + "</span> " + txt + "</p>";
    })
    .join("\n");

  /* The two kinds are reported apart, because they say different things about the printed page: one
     is a numeral the printer left out, the other a numeral he set against the wrong verse. Both are
     recorded rather than smoothed away, and in both the translation itself is present and is placed
     by the Sanskrit, which is complete. */
  if (absent.length)
    warn("no English numeral printed on verse(s) " + absent.join(", ") +
         " — the translation is present and is placed by the Sanskrit numbering");
  if (offBy.length)
    warn("the English numeral is printed one verse ahead on verse(s) " + offBy.join(", ") +
         " — dropped, since the Sanskrit numbering is complete and is what the page shows");
  if (absent.length || offBy.length)
    warn(checked + " of " + verses.length + " printed English numerals agree with the Sanskrit");

  const nums = verses.map((v) => v.n);
  if (nums.some((v, i) => v !== i + 1))
    warn("the verses are not a clean 1–N run (" + nums.length + " of them, highest " + nums[nums.length - 1] + ")");

  return { html, notes, orig, count: verses.length, origCount: verses.length, t };
}

/* A facing-page edition, whichever way it is transcribed. One choke point, so the two callers that
   want both columns — the English walk and the original's read-back out of its cache — can never
   come to disagree about which extractor a book uses. */
function bothColumns(h, book, warn) {
  if (book.layout === "shloka") return extractShloka(h, book, warn);
  return book.layout === "interleaved" ? extractInterleaved(h, book, warn) : extractParallel(h, book, warn);
}

/* ============================================================
   A POEM IN LAISSES — the eighth shape, and the first where ONE PAGE HOLDS EVERY CHAPTER
   ============================================================
   Every wiki book above walks a page per chapter: a page per letter of Seneca, per book of the
   Republic, per fable of Aesop. The Song of Roland is transcribed whole onto a single page in each
   language, so the chapters are not fetched, they are CUT — and what they are cut at is the poem's
   own laisse numbering, the assonant stanza by which any passage of the poem is cited in any
   language.

   THE LAISSE IS THE CHAPTER *AND* THE SECTION HERE, which is new and follows from the editions
   rather than from a choice made here. Neither of the two prints any division above the laisse —
   measured, not assumed: Scott Moncrieff's volume carries no part, book or canto heading anywhere in
   its 291 stanzas, and Bédier's carries none either. Composing some would be exactly the apparatus
   the Meditations' entry refuses to invent, so the smallest unit the editions DO state is what the
   reader navigates by, as Aesop's fable is. The consequence worth knowing is that a chapter is short
   — a median of 13 lines — and that is what the poem is: a chanson de geste was sung one laisse at a
   time, each on a single vowel, and stopping at the end of one is what it is built for.

   BOTH COLUMNS NUMBER FORWARD-ONLY, AND EACH EDITION NEEDS THE REPAIR EXACTLY ONCE. The rule is the
   Analects' — a numeral is taken where it carries the count on by one and replaced by the expected
   number where it does not, with a warning naming the book and both numbers on every run — and here
   it is unusually well checked, because the two editions are independent and agree on 291 laisses.
   Scott Moncrieff's page 87 prints CXXXXV where the sequence demands CXXXV: an extra X, and it is in
   the SCAN and not in the transcription, read off the page image rather than guessed at. Bédier's
   prints CCXXXVI at laisse 286, where a dropped L turns CCLXXXVI into a numeral 50 lower. Neither is
   composed away in silence; both are reported every run and recorded in the front matter.

   THE FRENCH IS CUT AT ITS OWN SEPARATOR RATHER THAN AT ITS NUMERALS, and that is the whole reason
   the original could be paired at all. Bédier's presentation drops six of its 291 numerals (188, 238,
   278, 283, 287, 288) — they are simply not in the transcription — so a cut made at the numerals
   would lose six laisses and shift everything after them. What it does carry, exactly 291 times
   across the six pages, is an <hr> between one laisse and the next, and inside each of those a first
   margin block holding the Old French and a second holding Bédier's modern French. So the cut is
   structural and the numbering is read into it: 285 of the 291 printed numerals then AGREE with the
   position the cut gives them, which is what turns the six inferences from a guess into the only
   reading consistent with the other 285. */

/* Every laisse of both editions is set as verse, and both wrap a second numbering around it — the
   running line-count of the poem, printed every fifth line in the margin. It is not the citation
   unit and it is not what the columns pair on, and left alone it survives the tag strip as a bare
   figure sitting inside a line of verse, which reads as a footnote marker opening nothing. That is
   the Nicomachean Ethics' Bekker-line fault on a third edition, so it gets the Ethics' answer: the
   gadget is removed outright, and because the two editions build it quite differently — Wikisource's
   own `wst-pline` float in the English, a `visibility:hidden` nest of four spans in the French — it
   is removed by BALANCED span-matching rather than by a non-greedy pattern that would stop at the
   first inner closer and leave the rest of the nest standing in the verse. */
function dropLineNumbers(b) {
  const marks = [/<span[^>]*class="[^"]*\bwst-pline\b[^"]*"[^>]*>/, /<span style="visibility:hidden">/];
  for (const rx of marks) {
    for (let k = 0; k < 4000; k++) {
      const m = rx.exec(b);
      if (!m) break;
      const end = blockEnd(b, m.index, "span");
      if (end < 0) break;
      b = b.slice(0, m.index) + b.slice(end);
    }
  }
  // the stylesheet links MediaWiki de-duplicates alongside them are furniture too
  return b.replace(/<link\b[^>]*>/g, "");
}

/* One laisse's verse, as the single paragraph the shelf's other verse books use: the citation number
   in a .bk-n marker, then the lines separated by <br>. Ovid and Lucretius emit exactly this shape, so
   a poem in laisses needs no styling of its own and renders beside its original the way they do. */
/* STRIP THE WHOLE LAISSE BEFORE SPLITTING IT, never line by line. stripTags balances opening tags
   against closing ones on a stack, so a fragment holding a <p> whose </p> lives in the next fragment
   is unbalanced ON ITS OWN and the opener survives into the output. Splitting first therefore emitted
   a stray <p> in most laisses of the poem — the quiet failure this file keeps meeting: nothing throws,
   not one word is lost, every line is present and in order, and only counting a tag against its closer
   over the shipped data shows it. The paragraph tags are then dropped outright, because a laisse is
   emitted as ONE paragraph with its lines separated by <br>, which is the shape Ovid and Lucretius
   already use and the shape the reader's verse styling expects. */
function laisseHtml(n, body, warn, where) {
  const lines = stripTags(dropLineNumbers(body))
    .replace(/<\/?p\b[^>]*>/g, "<br>")
    .split(/<br\s*\/?>/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    /* ONE LINE NUMBER IS TYPED AS ORDINARY TEXT rather than set in the template the other 800-odd
       use, so no amount of span-matching above can see it: the transcriber simply keyed the figure
       into the verse. The test is deliberately as narrow as the evidence — a run of digits at the
       very head of a line, a multiple of five (which is how often this edition numbers), and inside
       the poem's own line range — because a verse line could in principle open on a number and
       throwing away the first word of a line is not a repair. Measured over both cached editions
       before it was written: exactly one line in the whole poem matches, laisse 231's 3210. It is
       reported rather than dropped in silence, so a second one cannot appear unnoticed. */
    .map((s) => {
      const m = /^(\d{1,5})\s+(?=\S)/.exec(s);
      if (!m || +m[1] % 5 || +m[1] < 1 || +m[1] > 4200) return s;
      warn(where + ": a bare line number (" + m[1] + ") was typed into the verse and has been removed");
      return s.slice(m[0].length);
    });
  if (!lines.length) warn(where + " came through with no lines");
  return '<p><span class="bk-n">' + n + "</span> " + lines.join("<br>") + "</p>";
}

/* Read a numeral off a marker and carry the count forward — the shared half of both cuts below. */
function laisseNumber(raw, expect, warn, side) {
  const v = raw ? roman(raw) : 0;
  if (v === expect) return expect;
  if (raw) {
    warn(side + " laisse " + expect + " is numbered " + raw + " (" + v + ") in the edition; " +
      "read as " + expect + ", which is where the sequence puts it");
  }
  return expect;
}

/* THE ENGLISH: cut one transcribed page into its 291 laisses at the centred numerals that head them.
   The slice and the furniture removal are cleanBody's, deliberately — this book is a proofread
   transcription like every other wiki book here, and only its DIVISION is unusual — but the body
   itself is not run through cleanBody's generic div→blockquote pass, which exists for prose and would
   turn each of the centred numeral blocks into a quotation of its own number. */
function extractLaisses(h, book, warn) {
  let b = h.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  for (let k = 0; k < 8; k++) {
    const m = /<div class="[^"]*\bws-noexport\b[^"]*"[^>]*>/.exec(b);
    if (!m) break;
    const end = blockEnd(b, m.index, "div");
    if (end < 0) break;
    b = b.slice(0, m.index) + b.slice(end);
  }
  const i = b.indexOf('<div class="prp-pages-output"');
  if (i < 0) throw new Error("no body");
  b = b.slice(i);

  const rx = /<div class="wst-center[^"]*"[^>]*>\s*<p>([^<]{1,14})<\/p>\s*<\/div>/g;
  const hits = [];
  let m;
  while ((m = rx.exec(b))) {
    const t = m[1].trim();
    if (/^[IVXLC]+$/.test(t)) hits.push({ raw: t, at: m.index, end: rx.lastIndex });
  }
  if (!hits.length) throw new Error("no laisse numerals found");

  return hits.map((x, k) => {
    const n = laisseNumber(x.raw, k + 1, warn, "English");
    const body = b.slice(x.end, k + 1 < hits.length ? hits[k + 1].at : b.length);
    return { n: n, html: laisseHtml(n, body, warn, "English laisse " + n) };
  });
}

/* THE OLD FRENCH: six pages of Bédier's own bilingual presentation, each laisse an <hr>-separated
   unit whose FIRST margin block is the Old French and whose second is his modern French. Only the
   first is taken; the modern French is a second translation and this shelf already carries one. */
function extractLaissesFr(pages, warn) {
  const out = [];
  pages.forEach((h) => {
    const b = h.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<!--[\s\S]*?-->/g, "");
    const units = b.split(/<hr\s*\/?>/);
    units.shift();                        // everything before the first rule is the page's own header
    units.forEach((u) => {
      const divs = [...u.matchAll(/<div style="margin-left:\d+%; margin-right:\d+%;">/g)];
      const of = divs.length ? u.slice(divs[0].index, divs.length > 1 ? divs[1].index : u.length) : u;
      const mm = /<div style="text-align:center[^"]*">\s*([IVXLC]{1,8})\s*<\/div>/.exec(of);
      const n = laisseNumber(mm ? mm[1] : null, out.length + 1, warn, "Old French");
      if (!mm) warn("Old French laisse " + n + " carries no numeral in the transcription; " +
        "numbered from its place in the sequence");
      out.push({ n: n, html: laisseHtml(n, of.replace(/<div style="text-align:center[^"]*">\s*[IVXLC]{1,8}\s*<\/div>/, ""), warn, "Old French laisse " + n) });
    });
  });
  return out;
}

/* ---------- A POEM IN FITTS, PAIRED ON ITS PRINTED LINE NUMBERS ----------
   Aug 2026, adding Beowulf — the twenty-second book, and the tenth layout. Both columns are one
   wiki page per fitt, which is the ordinary walk; what is new is the PAIRING UNIT. Every earlier
   book pairs on a unit its editions DIVIDE into — a letter, a chapter, a Stephanus page, a laisse.
   Beowulf's editions divide into fitts, but a fitt is 50–140 lines, so pairing there would set one
   whole column-page beside another and the facing page would be useless. What both editions state
   far more finely is the LINE, printed in the margin every fifth line, and a line number is also
   how any passage of Beowulf is cited in any language. So the fitt is the CHAPTER and the printed
   line number is the SECTION — the first book here where those are two different things by design
   rather than by accident.

   THREE THINGS MEASURED BEFORE ANY OF IT WAS BELIEVED, over all 85 cached pages:

   · THE TWO EDITIONS AGREE ON 636 MARKERS EACH, over an identical range (5 to 3180), with no
     duplicate on either side. 40 of the 42 chapters pair exactly.

   · SIX PRINTED NUMERALS ARE SLIPS, and the way to tell a slip from a real divergence is the
     RE-SYNC, which is the Bhagavad Gita's rule met on a second book. Each of the six breaks a run
     that is otherwise a clean +5 and the very next marker is correct again — 1696 for 1695, 2216
     for 2215, 2885 for 2835, 2580 for 2850, 22975 for 2975, 3035 for 3065. Had the extractor been
     cutting wrongly, every marker after the first would have disagreed instead of one. They are
     repaired forward-only and each is named on every run, as the Song of Roland's two malformed
     numerals are: this restores the printed page rather than composing anything, but it is a
     repair, so it is said out loud.

   · THE ONE REAL DIVERGENCE IS A FITT BOUNDARY, and it is the Antigone case again. Wyatt opens
     fitt XXV at line 1740 and Gummere carries 1740 at the end of his XXIV, so that single block
     draws in one column beside an empty cell in the other, twice — 2 half-empty rows out of 637.
     Recorded rather than repaired: closing it would set a passage beside one that is not it.

   AND THE MANUSCRIPT HAS NO FITT XXX. Both editions run ...XXVIII, [XXIX], XXXI... — the scribe's
   own numbering skips it and no line is missing, which the continuous line ranges prove (Wyatt:
   XXVIII 1963–2038, [XXIX] 2039–2143, XXXI 2144–2220). Wyatt supplies [XXIX] in square brackets
   because the manuscript does not number that section either; Gummere does not break there at all,
   running his XXVIII across both. So the chapter numbers here carry the gap the editions carry, and
   Wyatt's [XXIX] is FOLDED INTO CHAPTER 28 so the two columns divide alike. Measured after folding:
   36 markers on each side of that chapter, 1965 to 2140. */

/* A printed line number, in the two shapes these transcriptions use: `wst-pline` on 84 of the 85
   pages and `ws-poem-versenum` on the one page set with the ppoem template (Wyatt's prelude, the
   only page in either edition transcribed that way). Anchored on digits, which is what keeps the
   FOLIO references out: Wyatt marks those `wst-pline wst-pline-r` — the same class as a line number,
   differing only in which margin it floats to — so a class-only test would take "Fol. 175a." for a
   section number. They are dropped further down instead, once the numbers have been read. */
const FITT_STEP = 5;
const FITT_MARK =
  /<span[^>]*class="[^"]*(?:\bwst-pline\b|\bws-poem-versenum\b)[^"]*"[^>]*>\s*(\d+)\s*<\/span>/g;

/* The verse body, sliced and stripped of the wiki's own furniture. cleanBody's opening moves, done
   here rather than borrowed, for the reason extractLaisses gives: that pass is written for prose and
   its generic div-to-blockquote rule would turn this poem's structure into quotations. */
function fittBody(h, where) {
  let b = stripWikiCSS(h).replace(/<!--[\s\S]*?-->/g, "");
  for (let k = 0; k < 8; k++) {
    const m = /<div class="[^"]*\bws-noexport\b[^"]*"[^>]*>/.exec(b);
    if (!m) break;
    const end = blockEnd(b, m.index, "div");
    if (end < 0) break;
    b = b.slice(0, m.index) + b.slice(end);
  }
  const i = b.indexOf('<div class="prp-pages-output');
  if (i < 0) throw new Error(where + ": no body — the page's markup has changed");
  return b.slice(i).replace(/<ol class="references">[\s\S]*$/, "");
}

/* Read the numbers off the margin and rewrite them as the shelf's own section markers, carrying the
   count forward. A value that does not continue the run is accepted where it still moves forward by
   a whole number of lines, and otherwise read as the place the sequence puts it — with a warning
   naming the fitt and both numbers, so a seventh slip cannot appear unnoticed. */
function markFittLines(b, warn, where) {
  let last = null, n = 0;
  const out = b.replace(FITT_MARK, (all, raw) => {
    let v = parseInt(raw, 10);
    if (last !== null) {
      const want = last + FITT_STEP;
      const forward = v > last && (v - last) % FITT_STEP === 0 && v - last <= FITT_STEP * 5;
      if (v !== want && !forward) {
        warn(where + ": line number " + v + " is printed where the sequence gives " + want +
             " — read as " + want + ", which is where the run puts it");
        v = want;
      }
    }
    last = v; n++;
    return '<span class="bk-n">' + v + "</span> ";
  });
  if (!n) warn(where + ": no line numbers found");
  return { html: out, count: n };
}

/* One fitt's verse as the single paragraph the shelf's other verse books emit — the lines separated
   by <br>, each printed line number a .bk-n marker where it stands. Ovid, Lucretius and the Song of
   Roland already render exactly this, so a poem in fitts needs no styling of its own.

   STRIP THE WHOLE FITT BEFORE SPLITTING IT INTO LINES, which is the Song of Roland's rule and the
   reason it is written down there: stripTags balances openers against closers on a stack, so a
   fragment holding a <p> whose </p> lives in the next fragment is unbalanced on its own and the
   opener survives into the output. */
function fittHtml(b, warn, where) {
  /* A line is blank when nothing but spacing entities is left of it — the transcriptions leave a
     `&#32;` where the scan's page marker stood, and one at the foot of most fitts. */
  const bare = (s) => s.replace(/<sup class="fn"[^>]*><\/sup>/g, "")
                       .replace(/&#32;|&#160;|&nbsp;|&#8195;/g, " ").replace(/\s+/g, " ").trim();
  const lines = stripTags(b)
    .replace(/<\/?p\b[^>]*>/g, "<br>")
    .split(/<br\s*\/?>/)
    .map((s) => s.replace(/[ \t]+/g, " ").trim())
    .filter((s) => bare(s) !== "");

  /* DROP THE PRINTED HEADING, and carry its footnote marker down rather than deleting it. Each fitt
     opens with its own numeral — "XXIII", "XXIII." in the Old English, "[XXXIX.]" where the editor
     supplies a number the manuscript lacks — and the first opens on the poem's title instead. All of
     it duplicates the chapter tab above it, so it goes, exactly as dropHeads takes a running head off
     the top of a chapter elsewhere here.

     THE MARKER IS THE WHOLE CARE IN THE RULE. Gummere's fitt XXXI carries a footnote ON its heading
     numeral and the Old English title carries another, so a rule that simply dropped the line would
     delete a marker while its note stayed in the list — an entry no sentence opens, which is the
     mirror of the dead marker the apparatus already refuses to draw. The markers are moved to the
     head of the line below instead, which is where that note's subject now begins. Anchored to the
     FIRST line only, so a numeral occurring anywhere else in the verse is untouched. */
  if (lines.length) {
    const t = bare(lines[0]);
    if (/^\[?[IVXL]+\.?\]?$/.test(t) || /^BEOWULF\.?$/i.test(t)) {
      const carried = (lines[0].match(/<sup class="fn"[^>]*><\/sup>/g) || []).join("");
      lines.shift();
      if (carried && lines.length) lines[0] = carried + lines[0];
      else if (carried) warn(where + ": the heading carried a footnote marker and has no line to carry it to");
    }
  }

  if (!lines.length) warn(where + " came through with no lines");
  return "<p>" + lines.join("<br>") + "</p>";
}

/* One fitt page, cleaned into { html, notes }. The notes are this chapter's own, in the order their
   markers appear, and a marker carries the note it POINTS AT rather than its position in the queue —
   Seneca's `data-fn` lesson, and it is live here rather than theoretical: these editions cite several
   notes twice over, so numbering by reading order would run past the end of the list. */
function extractFitt(h, warn, where) {
  const { notes, ids } = notesOf(h);
  let b = fittBody(h, where);

  const local = [], seen = {};
  b = b.replace(
    /<sup[^>]*class="reference"[^>]*>\s*<a href="#(cite[^"]*)"[^>]*>[\s\S]*?<\/a>\s*<\/sup>/g,
    (all, ref) => {
      const key = ref.replace(/&#95;/g, "_");
      const k = ids.indexOf(key);
      if (k < 0) { warn(where + ": a marker points at no note and has been dropped"); return ""; }
      if (!seen[key]) { local.push(notes[k]); seen[key] = local.length; }
      return '<sup class="fn" data-fn="' + seen[key] + '"></sup>';
    }
  );

  const marked = markFittLines(b, warn, where);
  b = marked.html;

  /* The caesura — the gap that divides an alliterative half-line, and a real feature of the metre
     rather than decoration. These transcriptions set it two ways (`wst-cesura`, whose text is
     already two em spaces, and `wst-gap`, an inline-block whose text is a newline), so both become
     the same pair of em spaces and the printed page's shape survives the tag strip. */
  b = b.replace(/<span[^>]*class="[^"]*\b(?:wst-cesura|wst-gap)\b[^"]*"[^>]*>[\s\S]*?<\/span>/g,
                "&#8195;&#8195;");

  /* What is left wearing a line-number class is a FOLIO reference — Wyatt's note of where the
     manuscript leaf turns, which is apparatus and not verse — and the scan's own page markers go
     with it, as they do in every other book here. */
  b = b.replace(/<span[^>]*class="[^"]*\bwst-pline\b[^"]*"[^>]*>[\s\S]*?<\/span>/g, "");
  for (const cls of ["pagenum", "ws-poem-linenum"]) {
    for (let k = 0; k < 400; k++) {
      const m = new RegExp('<span[^>]*class="[^"]*\\b' + cls + '\\b[^"]*"[^>]*>').exec(b);
      if (!m) break;
      const end = blockEnd(b, m.index, "span");
      if (end < 0) break;
      b = b.slice(0, m.index) + b.slice(end);
    }
  }
  b = b.replace(/<link\b[^>]*>/g, "");

  return { html: fittHtml(b, warn, where), notes: local, marks: marked.count };
}

/* ============================================================
   THE DIVINE COMEDY: A POEM IN TERCETS, NUMBERED BY COUNTING
   ============================================================
   Aug 2026, adding the Divine Comedy — the thirty-sixth book, and the fourteenth layout. The
   ordinary wiki walk, one page per canto; what is new is that the SECTION NUMBERS ARE COUNTED
   RATHER THAN READ, and that they have to be, because the translation does not print enough of
   them to pair on.

   THE ONE BOOK HERE WHOSE ENGLISH IS TRANSCRIBED TWO DIFFERENT WAYS. Longfellow's hundred cantos
   are one work in one 1867 edition, and Wikisource holds them in two shapes: the Inferno and the
   first three cantos of the Purgatorio are a PROOFREAD TRANSCLUSION of the scan, wrapped in
   `prp-pages-output` and carrying the printed marginal line number every fifth line, and the
   remaining sixty-three cantos are TYPED STRAIGHT ONTO THE WIKI as a bare `<div class="poem">`
   with no line numbers at all. Measured over all 100 pages: 37 of the first kind carrying 1,014
   numerals between them, 63 of the second carrying none. So a reader written for either half
   finds nothing on the other, and a pairing built on the printed numerals would cover a third of
   the poem.

   THE COUNT IS THEREFORE THE APPARATUS AND THE PRINTED NUMERALS ARE THE CHECK — the Bhagavad
   Gita's rule, where the side that is complete decides the cut and the other side is demoted to
   evidence. A line of verse is explicit in both transcriptions (it is what the <br> separates), so
   its number is a fact anybody can recover by counting, and the two editions then confirm the
   count 5,725 times between them. What makes that safe rather than hopeful is the arithmetic
   underneath it, measured before a word was imported:

   · THE TWO COLUMNS ARE THE SAME LENGTH, canto by canto. Dante's poem is 14,233 lines and this
     Italian carries exactly that, per canticle as well as in total — 4,720, 4,755 and 4,758.
     Longfellow translates line for line and comes to the same 14,233. So line n of the English is
     line n of the Italian in all one hundred cantos, and the pairing is exact by construction
     rather than by reconciliation.

   · EVERY CANTO IS 3n+1 LINES. Terza rima runs in tercets and each canto closes on a single line
     rhyming with the middle of the last one: 4,711 tercets and 100 closing lines. That is why the
     TERCET is the pairing unit here rather than the line — three lines of Italian beside three of
     English is the unit the poem is built in, and the alternative is 14,233 rows of one line each.

   · AND THE ITALIAN PRINTS ONE NUMERAL PER TERCET, EXACTLY. Measured: 4,711 of them, one at the
     end of every tercet in the poem, not one anywhere else, and not one disagreeing with the
     count. So the number this reader writes on a row is the number that edition prints at that
     row's own last line — read, not composed — for 4,711 of the 4,811 rows. The remaining hundred
     are the canto-closing lines, which are 3n+1 and so fall where neither edition prints anything;
     their number is the count's, and the book's front matter says so.

   TWO PRINTED NUMERALS IN LONGFELLOW ARE SLIPS, and the way to tell a slip from a bad cut is the
   RE-SYNC, which is the Gita's rule met on a third book. Inferno IX prints 85 twice — the run goes
   85, 90, 85, 100, 105, so the second is a misprint for 95 and the very next marker is right
   again — and Inferno XXXII prints 135 against a count of 134, with that canto's two columns
   agreeing at 139 lines, so nothing is missing and the numeral sits a line early. Had the cut been
   wrong, every marker after the first would have disagreed instead of one. Both are read as the
   place the sequence puts them and both are named on every run.

   LONGFELLOW'S ONE FOOTNOTE IS THE ONLY REASON THIS READER NEEDS NOTES. Arnaut Daniel answers
   Dante in Provençal at Purgatorio XXVI.140–147, and Longfellow leaves those eight lines in
   Provençal in the verse and Englishes them under the canto, cueing both ends with an asterisk.
   Counted as verse they make that canto 156 lines against the Italian's 148 — the ONLY canto of
   the hundred whose columns disagreed before this rule — and they would put a translator's gloss
   in eight rows beside an empty Italian cell. The rule is written from an inventory of the whole
   poem rather than from the example that prompted it: two asterisks in 14,241 lines, one closing
   line 147 and one opening the note, and nothing else anywhere. It is counted and reported, so a
   second cannot appear unnoticed.

   WHAT IS DROPPED AND COUNTED. The canticle and canto headings inside the body, which duplicate
   the chapter tab (39 of them — the typed pages carry none); the scan's own page markers; and the
   indentation, which the two halves of the English spell differently (a `wst-gap` span on the
   transcluded pages, a run of non-breaking spaces on the typed ones) and which the row structure
   carries here anyway. */
const TERZINA = 3;
/* A printed line number, in the two shapes these transcriptions use: `wst-pline` in Longfellow's
   margin every fifth line, `numeroriga` in the Italian's at the close of every tercet. Both are
   read for the check and then removed, so what a reader sees is the marker this file writes. */
const TERZINA_MARK =
  /<span[^>]*class="[^"]*\b(?:wst-pline|numeroriga)\b[^"]*"[^>]*>\s*(\d+)\s*<\/span>/g;
/* The headings that sit INSIDE the body and duplicate the tab above it. Anchored whole, and tested
   against the line with its inline tags removed — Longfellow's canto heading is italicised, so a
   test against the raw text reads `<i>CANTO I.</i>` and matches nothing. That is not hypothetical:
   it left one extra line at the top of each of the 37 transcluded cantos, which shifted every
   label in them by one and made all 37 disagree with their Italian while the counts looked healthy. */
const TERZINA_HEAD = /^(?:INFERNO|PURGATORIO|PARADISO|CANTO\s+[IVXLC]+\.?)$/i;
/* The sentinel a printed numeral is parked in while the tags come off. It cannot simply be left as
   text: stripTags would unwrap the span and the digits would be indistinguishable from the verse. */
const TERZINA_SENT = "";

/* The verse body, sliced and stripped of the wiki's own furniture. cleanBody's opening moves, done
   here rather than borrowed, for the reason fittBody and eddaBody give: that pass is written for
   prose and its generic div-to-blockquote rule would turn this poem into a wall of quotations.
   `before` is whatever stood between the page furniture and the verse, so the caller can say what
   it dropped rather than dropping it quietly. */
function terzinaBody(h, where) {
  let b = stripWikiCSS(h).replace(/<!--[\s\S]*?-->/g, "");
  for (let k = 0; k < 12; k++) {
    const m = /<(div|table)[^>]*class="[^"]*\bws-noexport\b[^"]*"[^>]*>/.exec(b);
    if (!m) break;
    const end = blockEnd(b, m.index, m[1]);
    if (end < 0) break;
    b = b.slice(0, m.index) + b.slice(end);
  }
  let i = b.indexOf('<div class="prp-pages-output');
  let body;
  if (i >= 0) body = b.slice(i).replace(/<ol class="references">[\s\S]*$/, "");
  else {
    i = b.indexOf('<div class="poem"');
    if (i < 0) throw new Error(where + ": no body — the page's markup has changed");
    const end = blockEnd(b, i, "div");
    body = end < 0 ? b.slice(i) : b.slice(i, end);
  }
  const before = stripTags(b.slice(0, i))
    .replace(/<[^>]*>/g, " ")
    .replace(/&#\d+;|&nbsp;/g, " ")
    /* MediaWiki's own dynamic-layout marker, which is furniture rather than anything the edition
       printed and would otherwise be reported as dropped text on every page. */
    .replace(/Layout\s*\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { body: body, before: before };
}

/* Remove every span of one class, matched on the stack so a nested span cannot leave its closer
   behind — the shape extractFitt already uses for the scan's page markers. */
function terzinaDropSpans(b, cls) {
  for (let k = 0; k < 500; k++) {
    const m = new RegExp('<span[^>]*class="[^"]*\\b' + cls + '\\b[^"]*"[^>]*>').exec(b);
    if (!m) break;
    const end = blockEnd(b, m.index, "span");
    if (end < 0) break;
    b = b.slice(0, m.index) + b.slice(end);
  }
  return b;
}

/* One canto's verse as a list of lines, each carrying whatever numeral its edition prints on it. */
function terzinaLines(b, where, warn) {
  b = b.replace(TERZINA_MARK, (all, raw) => TERZINA_SENT + raw + TERZINA_SENT);
  b = terzinaDropSpans(b, "pagenum");
  /* The verse indent. Both transcriptions set the second and third line of a tercet in from the
     margin and they do it differently; the row is what groups a tercet here, so it is normalised
     away rather than shipped in two incompatible shapes. */
  b = terzinaDropSpans(b, "wst-gap");
  b = b.replace(/<link\b[^>]*>/g, "");

  const rows = stripTags(b).replace(/<\/?p\b[^>]*>/g, "<br>").split(/<br\s*\/?>/);
  const rx = new RegExp(TERZINA_SENT + "(\\d+)" + TERZINA_SENT, "g");
  const bare = (s) => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const lines = [];
  let heads = 0, printed = 0;
  for (let raw of rows) {
    const nums = [];
    raw = raw.replace(rx, (a, d) => { nums.push(+d); return " "; });
    const txt = raw
      .replace(/&#160;|&nbsp;|&#32;|&#8195;|​| /g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!bare(txt)) continue;
    if (TERZINA_HEAD.test(bare(txt))) { heads++; continue; }
    printed += nums.length;
    lines.push({ txt: txt, nums: nums });
  }

  /* LONGFELLOW'S ONE FOOTNOTE — see the block above for the inventory this rule is written from.
     The note opens on an asterisk and runs to the end of the canto; the cue is the asterisk closing
     the last line of the passage it translates, and it becomes the marker. */
  const notes = [];
  const at = lines.findIndex((r) => /^\*/.test(r.txt));
  if (at >= 0) {
    const body = lines.slice(at).map((r) => r.txt.replace(/^\*\s*/, "").trim()).filter(Boolean);
    lines.length = at;
    notes.push(body.join("<br>"));
    const cue = lines.map((r) => r.txt).findIndex((t) => /\*$/.test(t));
    /* A note with no cue would be an entry no line opens — the mirror of the dead marker the
       apparatus already refuses to draw, and the fault Beowulf's dropFittHead exists to avoid. */
    if (cue < 0) warn(where + ": a note has no cue in the verse and its marker has been dropped");
    else lines[cue].txt = lines[cue].txt.replace(/\s*\*$/, "") + '<sup class="fn" data-fn="1"></sup>';
  }
  return { lines: lines, notes: notes, heads: heads, printed: printed };
}

/* One canto's verse as the single paragraph the shelf's other verse books emit, with a section
   marker opening each tercet. Ovid, Lucretius, the Song of Roland and Beowulf already render
   exactly this shape, so a poem in tercets needs no styling of its own.

   A MARKER OPENS ITS ROW AND CARRIES THE NUMBER THE EDITION PRINTS AT THE ROW'S CLOSE. app.js's
   bookSections cuts at a marker and gives everything after it to that number, so the marker has to
   stand at the head of the three lines it labels; the number it carries is the tercet's LAST line,
   which is the figure the Italian sets in its own margin there. The row labelled 3 is therefore
   lines 1–3. The canto's closing line is 3n+1 and gets a row and a number of its own. */
function terzinaHtml(lines, where, warn) {
  const parts = [];
  let bad = 0;
  lines.forEach((r, i) => {
    const n = i + 1;
    for (const p of r.nums) {
      if (p !== n) {
        warn(where + ": the edition prints line " + p + " where the count gives " + n +
             " — read as " + n + ", which is where the lines put it");
        bad++;
      }
    }
    if (n % TERZINA === 1)
      parts.push('<span class="bk-n">' + Math.min(n + TERZINA - 1, lines.length) + "</span> ");
    parts.push(r.txt);
    if (i < lines.length - 1) parts.push("<br>");
  });
  if (!lines.length) warn(where + " came through with no lines");
  return { html: "<p>" + parts.join("") + "</p>", bad: bad };
}

function extractTerzina(h, where, warn) {
  const b = terzinaBody(h, where);
  const got = terzinaLines(b.body, where, warn);
  const made = terzinaHtml(got.lines, where, warn);
  return {
    html: made.html, notes: got.notes, lines: got.lines.length, before: b.before,
    marks: (made.html.match(/class="bk-n"/g) || []).length,
    printed: got.printed, bad: made.bad, heads: got.heads,
  };
}

/* ---------- THE POETIC EDDA: NUMBERED STANZAS WITH PROSE LINKS BETWEEN THEM ----------
   Aug 2026, adding the Poetic Edda — the twenty-eighth book, and the eleventh layout. The ordinary
   wiki walk, one page per chapter; what is new is the SHAPE OF A CHAPTER'S BODY. Every verse book
   before it is verse all the way down — Ovid, Lucretius, the Song of Roland, Beowulf — so the reader
   can flatten the page into lines and be done. An Eddic poem is not: the manuscript sets stanzas of
   verse with PROSE NARRATIVE LINKS between them, sometimes a sentence and sometimes a page, and two
   of the thirty-five pieces are prose from beginning to end. Flattening would print those passages
   as broken verse and the poem as one undifferentiated block.

   So this reader WALKS the body in order and keeps each block as what it is: a stanza becomes a
   paragraph of <br>-joined lines with its number as a section marker, a prose link stays a paragraph,
   and a centred line stays a centred block. That last is the part it would be easy to get wrong —
   see the heading rule below.

   THE PAIRING UNIT IS THE STANZA, and it is not a choice. "Völuspá 21" is how any passage of this
   book is cited in any language, in every edition and every reference work; the poem is the chapter
   and the printed stanza number is the section, which is Beowulf's shape one level coarser.
   Measured over all thirty-five pages before it was believed: 1,564 stanza numbers, every verse poem
   running a clean 1..N with no gap and no duplicate, and not one leaf of the scan untranscribed.

   FOUR THINGS IT SETTLED ARE WORTH CARRYING.

   · A CLASS NAMED FOR A LINE NUMBER MAY HOLD A FOOTNOTE MARKER, and Beowulf's rule for that class is
     the exact opposite of the right one here. There the `ws-poem-linenum` float is apparatus — a
     folio reference — and is DROPPED; in this transcription it is used once in the whole book, in
     Sigrdrifumol, and what it holds is a reference marker and nothing else. Dropping it would delete
     the marker while its note stayed in the list, which is an entry no sentence opens — the fault
     Beowulf's dropFittHead exists to avoid, met from the other side. So it is UNWRAPPED rather than
     dropped, and a span that ever holds anything but markers is reported before its contents are
     kept. Measured over the whole book: one such span, containing one marker.

   · A NOTE IS CITED MORE THAN ONCE HERE, so Seneca's `data-fn` lesson is live rather than
     theoretical: 1,373 markers against 1,345 notes. Numbered by reading order the last 28 markers of
     the affected chapters would point one entry too far and those past the end would be DELETED by
     wireFootnotes. The marker carries the note it points AT, as everywhere else on this shelf.

   · NOT EVERY CENTRED BLOCK IS A RUNNING HEAD. The obvious rule — drop the centred block at the top,
     as dropHeads does everywhere else — is right for the title and wrong for five of the poems,
     because this edition ALSO centres its internal divisions: Svipdagsmol's two constituent poems
     (Grougaldr and Fjolsvinnsmol), the numbered prose sections of the two Helgi lays, and the
     fragment embedded in Hyndluljoth. Those are the edition's own structure and dropping them would
     silently take it off the page. So only ONE line goes — the poem's own name, which duplicates the
     chapter tab — and it is identified by matching its TEXT against the tab rather than by its
     position, with a warning when it fails to match. Everything else centred is kept.

   · AND THE INTRODUCTORY NOTE STAYS. Bellows heads each poem with a page or two on its manuscript,
     its date, its condition and its relation to the rest — a headnote bound to the text, which is
     Legge's case in the Book of Documents rather than the Republic's fifty-page introduction that
     was left behind. It carries no stanza number, so app.js files it in the unnumbered row above
     stanza 1, which is where a headnote belongs. */

/* The verse body, sliced and stripped of the wiki's own furniture. cleanBody's opening moves, done
   here rather than borrowed, for the reason fittBody gives: that pass is written for prose and its
   generic div-to-blockquote rule would turn every stanza of this poem into a quotation. */
function eddaBody(h, where) {
  let b = stripWikiCSS(h).replace(/<!--[\s\S]*?-->/g, "");
  for (let k = 0; k < 12; k++) {
    const m = /<div class="[^"]*\bws-noexport\b[^"]*"[^>]*>/.exec(b);
    if (!m) break;
    const end = blockEnd(b, m.index, "div");
    if (end < 0) break;
    b = b.slice(0, m.index) + b.slice(end);
  }
  const i = b.indexOf('<div class="prp-pages-output');
  if (i < 0) throw new Error(where + ": no body — the page's markup has changed");
  /* The wrapper occurs several times on these pages — a fresh one wherever the run of scan pages is
     interrupted — so the opener is stripped globally and the notes are cut at the list, which is the
     Republic's rule and the reason it is written down there. */
  return b.slice(i).replace(/<ol class="references">[\s\S]*$/, "");
}

/* Rewrite one class of div into a pair of allowed tags, matched with depth so a nested block cannot
   close the outer one. `open`/`close` empty drops the block and everything in it. */
function eddaRewriteDiv(b, cls, open, close) {
  const rx = new RegExp('<div[^>]*class="[^"]*\\b' + cls + '\\b[^"]*"[^>]*>');
  let out = "", i = 0;
  for (let guard = 0; guard < 20000; guard++) {
    const m = rx.exec(b.slice(i));
    if (!m) break;
    const start = i + m.index;
    const end = blockEnd(b, start, "div");
    if (end < 0) break;
    const inner = b.slice(start + m[0].length, end - "</div>".length);
    out += b.slice(i, start) + (open || close ? open + inner + close : "");
    i = end;
  }
  return out + b.slice(i);
}

/* The printed stanza numbers, rewritten as the shelf's own section markers. The number is set in a
   float of its own and OFTEN CARRIES THE STANZA'S FOOTNOTE MARKER INSIDE IT — 1,000-odd of the 1,564
   do — so the span's contents are read rather than discarded and the marker is re-emitted after the
   section mark, which is where the printed page puts it.

   Numbered forward-only, the Analects' rule: a numeral is taken where it moves the count on and read
   as the place the sequence puts it where it does not, with a warning naming the poem and both
   numbers. Measured over all thirty-five pages it never fires — every verse poem runs a clean 1..N —
   which is what makes it a guard against a transcription changing under us rather than a repair. */
function markEddaStanzas(b, warn, where, prose) {
  const rx = /<span class="ws-poem-versenum"[^>]*>/;
  let out = "", i = 0, seq = 0, n = 0;
  for (let guard = 0; guard < 20000; guard++) {
    const m = rx.exec(b.slice(i));
    if (!m) break;
    const start = i + m.index;
    const end = blockEnd(b, start, "span");
    if (end < 0) break;
    const inner = b.slice(start + m[0].length, end - "</span>".length);
    const carried = (inner.match(/<sup class="fn"[^>]*><\/sup>/g) || []).join("");
    const raw = inner.replace(/<[^>]*>/g, "").replace(/&#\d+;/g, "").trim();
    const hit = /^(\d+)/.exec(raw);
    let mark = "";
    if (!hit) {
      warn(where + ': a stanza number reading "' + raw.slice(0, 20) + '" could not be read — ' +
           "its stanza will not be numbered");
    } else {
      let v = parseInt(hit[1], 10);
      if (v <= seq) {
        warn(where + ": stanza " + v + " is printed where the sequence gives " + (seq + 1) +
             " — read as " + (seq + 1) + ", which is where the run puts it");
        v = seq + 1;
      }
      seq = v; n++;
      mark = '<span class="bk-n">' + v + "</span> ";
    }
    out += b.slice(i, start) + mark + carried;
    i = end;
  }
  out += b.slice(i);
  /* A CHAPTER WITH NO STANZA NUMBER IS NORMALLY A FAULT AND HERE IT IS SOMETIMES A FACT: two of the
     thirty-five pieces are prose from beginning to end, being the manuscript's narrative bridges
     rather than poems, so they have nothing to number. They are named in the entry and pass without
     a warning, because a warning that fires on a known fact is one nobody reads. Any OTHER chapter
     arriving unnumbered still says so. */
  if (!n && !prose)
    warn(where + ": no stanza numbers found — the chapter will pair as one whole block");
  if (n && prose)
    warn(where + " is declared as prose in the entry and carries " + n + " stanza numbers");
  return { html: out, count: n };
}

/* DROP THE POEM'S OWN NAME, which duplicates the chapter tab, and NOTHING ELSE THAT IS CENTRED.
   Matched on the line's TEXT against the tab rather than on its position, because five of the poems
   centre their internal divisions too and those are the edition's structure; see the heading rule in
   the block comment above. A line carrying a footnote marker has it carried down rather than deleted
   with it — measured, none does, and the guard is the cheap half of the rule Beowulf learned the
   expensive way. */
function dropEddaTitle(b, title, warn, where) {
  const norm = (s) => s.replace(/<[^>]*>/g, "").replace(/&#\d+;|&nbsp;/g, " ")
                       .replace(/[^A-Za-zÀ-ÿ0-9]+/g, "").toUpperCase();
  const want = norm(title);
  const rx = /<p>[\s\S]*?<\/p>/g;
  let m, hit = -1, len = 0, carried = "";
  while ((m = rx.exec(b))) {
    if (norm(m[0]) !== want) continue;
    hit = m.index; len = m[0].length;
    carried = (m[0].match(/<sup class="fn"[^>]*><\/sup>/g) || []).join("");
    break;
  }
  if (hit < 0) {
    warn(where + ": the poem's own name was not found at the head of the page and nothing was " +
         "dropped — the tab and the first line may now say the same thing twice");
    return b;
  }
  if (carried)
    warn(where + ": the title line carried a footnote marker, which has been carried down to the " +
         "line below rather than deleted with it");
  return b.slice(0, hit) + carried + b.slice(hit + len);
}

/* One poem, assembled. Blocks in the order the page sets them: a stanza is a paragraph of lines, a
   prose link is a paragraph, a centred division is a block of its own.

   STRIP THE WHOLE POEM BEFORE TIDYING IT, which is the Song of Roland's rule: stripTags balances
   openers against closers on a stack, so a fragment holding a <p> whose </p> lives in the next
   fragment is unbalanced on its own and the opener survives into the output. */
function eddaHtml(b, title, warn, where) {
  /* The stanza is the one block that has to become something else: a div the tag strip would unwrap,
     leaving its lines to run into the prose around them. Rewritten FIRST and by its full class name,
     since `\bws-poem\b` also matches inside `ws-poem-stanza` — the outer container needs no rule at
     all, the tag strip unwrapping it exactly as intended. */
  b = eddaRewriteDiv(b, "ws-poem-stanza", "<p>", "</p>");
  b = eddaRewriteDiv(b, "wst-center", "<blockquote>", "</blockquote>");
  for (const cls of ["wst-rule", "wst-dhr"]) b = eddaRewriteDiv(b, cls, "", "");
  b = dropEddaTitle(b, title, warn, where);

  /* `&#32;` IS A SPACE AND NOTHING ELSE — the transcription leaves one wherever the scan's page
     marker stood, several to a poem and one at the foot of most of them. It is turned back into a
     space here so that the emptiness test below can see through it; the em spaces are NOT touched,
     being the caesura and a feature of the metre. */
  let s = stripTags(b).replace(/&#32;/g, " ");
  /* Text is blank when nothing but spacing and markers is left of it. The em spaces are deliberately
     NOT counted as spacing: a stanza line that is nothing but a caesura is still a line. */
  const bare = (x) => x.replace(/<sup class="fn"[^>]*><\/sup>/g, "")
                       .replace(/&#160;|&nbsp;|​/g, " ").replace(/\s+/g, " ").trim();
  /* THE LINE SWEEP RUNS ON A BLOCK'S CONTENTS, NEVER ACROSS ITS TAGS, and that is the whole care in
     it. A stanza ends on a line break before its closing tag, so splitting the block WITH its tags
     leaves `</p>` alone in the last fragment — which is blank by any text test, and dropping it
     takes the closing tag with it. Nothing throws, the words are all present, and the paragraph
     simply never closes: the quiet shape this extractor keeps meeting, caught here by counting a tag
     against its closer over the output. `<p>` does not nest, so the non-greedy match is safe inside
     a blockquote as well as outside one. */
  s = s
    .replace(/<p>([\s\S]*?)<\/p>/g, (all, inner) => {
      const lines = inner
        .split(/<br\s*\/?>/)
        .map((x) => x.replace(/[ \t]+/g, " ").trim())
        .filter((x) => bare(x) !== "");
      return lines.length ? "<p>" + lines.join("<br>") + "</p>" : "";
    })
    /* A centred block emptied by that sweep goes with it — as does one that only ever held the
       poem's own name, which dropEddaTitle has just taken out. */
    .replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, (all, inner) => (bare(inner) ? all : ""))
    .replace(/\n{2,}/g, "\n")
    .trim();
  if (!s) warn(where + " came through with no text at all");
  return s;
}

/* One poem's page, cleaned into { html, notes, marks }. The notes are this chapter's own, in the
   order their markers appear, and a marker carries the note it POINTS AT rather than its position in
   the queue — live here rather than theoretical, since this edition cites several notes twice over
   and numbering by reading order would run past the end of the list. */
function extractEdda(h, title, warn, where, prose) {
  const { notes, ids } = notesOf(h);
  let b = eddaBody(h, where);

  const local = [], seen = {};
  b = b.replace(
    /<sup[^>]*class="reference"[^>]*>\s*<a href="#(cite[^"]*)"[^>]*>[\s\S]*?<\/a>\s*<\/sup>/g,
    (all, ref) => {
      const key = ref.replace(/&#95;/g, "_");
      const k = ids.indexOf(key);
      if (k < 0) { warn(where + ": a marker points at no note and has been dropped"); return ""; }
      if (!seen[key]) { local.push(notes[k]); seen[key] = local.length; }
      return '<sup class="fn" data-fn="' + seen[key] + '"></sup>';
    }
  );

  /* THE FLOAT NAMED FOR A LINE NUMBER HOLDS A MARKER HERE, so it is unwrapped rather than dropped —
     see the block comment above. Anything else inside one is reported before it is kept, so a second
     kind cannot arrive unnoticed. */
  for (let k = 0; k < 400; k++) {
    const m = /<span[^>]*class="[^"]*\bws-poem-linenum\b[^"]*"[^>]*>/.exec(b);
    if (!m) break;
    const end = blockEnd(b, m.index, "span");
    if (end < 0) break;
    const inner = b.slice(m.index + m[0].length, end - "</span>".length);
    const rest = inner.replace(/<sup class="fn"[^>]*><\/sup>/g, "").replace(/<[^>]*>/g, "").trim();
    if (rest)
      warn(where + ': a line-number float held "' + rest.slice(0, 30) + '" as well as its markers — ' +
           "kept, but this edition was measured as holding markers and nothing else");
    b = b.slice(0, m.index) + inner + b.slice(end);
  }

  /* The caesura — the gap dividing an alliterative half-line, and a feature of the metre rather than
     decoration. Set two ways here, as in Beowulf, so both become the same pair of em spaces and the
     printed page's shape survives the tag strip. */
  b = b.replace(/<span[^>]*class="[^"]*\b(?:wst-cesura|wst-gap)\b[^"]*"[^>]*>[\s\S]*?<\/span>/g,
                "&#8195;&#8195;");

  const marked = markEddaStanzas(b, warn, where, prose);
  b = marked.html;

  for (const cls of ["pagenum"]) {
    for (let k = 0; k < 600; k++) {
      const m = new RegExp('<span[^>]*class="[^"]*\\b' + cls + '\\b[^"]*"[^>]*>').exec(b);
      if (!m) break;
      const end = blockEnd(b, m.index, "span");
      if (end < 0) break;
      b = b.slice(0, m.index) + b.slice(end);
    }
  }
  b = b.replace(/<link\b[^>]*>/g, "");

  return { html: eddaHtml(b, title, warn, where), notes: local, marks: marked.count };
}

/* ---------- A PLAY ON A WIKI PAGE: the tenth layout, and the first drama NOT from a TEI file ----------
   Aug 2026, adding Lysistrata — the fourth play here and the first comedy. The three tragedies before
   it are Perseus TEI, where the speaker of each speech is an element (`<sp>`/`<speaker>`) and the
   divisions are structure. This edition is a Wikisource transcription of a printed page, so the same
   two facts are TYPOGRAPHY: a speaker is a centred line and a division is a page's worth of white
   space. teiDramaDivisions cannot see either, and the ordinary wiki path is worse than useless here —
   cleanBody turns every centred div into a <blockquote>, so every speaker label arrives as an indented
   QUOTATION of the character's name with the speech left as body text beneath. That is the
   Meditations' running-head fault multiplied by five hundred, and it is the loud kind for once: the
   book is unreadable rather than quietly wrong.

   WHAT SEPARATES A SPEAKER FROM A RUNNING HEAD IS THE SPAN INSIDE, NOT THE DIV, and it is worth
   stating because both are the same centred div. A speaker's name is set in SMALL CAPITALS
   (`<span class="smallcaps">`); the running head at the top of every scan page and the two half-titles
   are set in a larger size (`<span style="font-size:…">`) and carry no smallcaps at all. The counts
   are printed on every run rather than assumed, so a transcription that ever changed its mind would
   announce itself as a number instead of as a silently unreadable book, and a centred line carrying
   BOTH — which would mean the test no longer separates them — is warned about explicitly.

   THE MARK HAS TO SURVIVE THE TAG STRIP, so it is a control character in a TEXT node rather than a
   class on an element: stripTags keeps text and drops attributes it does not allowlist, so a class
   would be gone by the time the assembly pass ran. \u0001 opens a speaker's name and \u0002 closes it.

   AND THE CLEANING IS THE SHARED ONE. The pre-pass below only MARKS; cleanBody then does the wrapper,
   the ws-noexport furniture, the reflist cut, the footnote ids and the tag strip exactly as it does
   for every other wiki book, and the assembly pass runs on its clean, balanced output. That is the
   Song of Roland's rule met from the other side — strip the whole unit before splitting it — and it
   is why this reader needs no tag balancing of its own. */
const PLAY_WHO_OPEN = "\u0001", PLAY_WHO_CLOSE = "\u0002";

/* Mark the speaker labels and count what was seen. Returns the marked html and the two counts. */
function markPlaySpeakers(b, warn) {
  let speakers = 0, heads = 0, both = 0;
  let out = "", i = 0;
  for (;;) {
    const m = /<div class="[^"]*\bwst-center\b[^"]*"[^>]*>/.exec(b.slice(i));
    if (!m) { out += b.slice(i); break; }
    const at = i + m.index;
    const end = blockEnd(b, at, "div");
    if (end < 0) { out += b.slice(i); break; }
    const inner = b.slice(at + m[0].length, end).replace(/<\/div>\s*$/, "");
    out += b.slice(i, at);
    const hasSC = /class="smallcaps"/.test(inner);
    const hasFS = /style="font-size:/.test(inner);
    if (hasSC && hasFS) both++;
    if (hasSC) {
      /* The label is the whole centred line, not just the name: this edition prints the character's
         entrance and manner inside it — a name followed by an italic parenthesis — and that is part
         of the label rather than of the speech. The trailing full stop goes, the reader's own styling
         supplying the separation. */
      const label = inner.replace(/<\/?p[^>]*>/g, " ").replace(/\s+/g, " ").trim().replace(/\.\s*$/, "");
      out += "<p>" + PLAY_WHO_OPEN + label + PLAY_WHO_CLOSE + "</p>\n";
      speakers++;
    } else {
      /* A running head, a half-title or the line that heads the cast list. UNWRAPPED rather than kept
         as a div, and that is what makes the cut below possible at all: cleanBody turns a surviving
         div into a <blockquote>, and this edition prints the play's half-title and its "DRAMATIS
         PERSONÆ" line inside ONE centred div — so the sentinel the second chapter begins at would sit
         nested inside a quotation, where cutting would leave both halves unbalanced. Unwrapped, each
         line is a top-level paragraph, which is both what a centred head should render as and a
         boundary a cut can safely fall on. */
      heads++;
      out += "\n" + inner
        .replace(/<br\s*\/?>/gi, " ")
        // one line per paragraph: these arrive run together, and the cut below falls BETWEEN two of
        // them (the play's half-title and the line heading its cast list share a single centred div)
        .replace(/<\/p>\s*<p(?=[\s>])/gi, "</p>\n<p") + "\n";
    }
    i = end;
  }
  if (both) warn(both + " centred line(s) carry both a small-caps name and a font size — the test that "
    + "tells a speaker from a running head no longer separates them cleanly");
  if (!speakers) throw new Error("no speaker labels found — the transcription's markup has moved");
  return { html: out, speakers: speakers, heads: heads };
}

/* The cleaned html as WHOLE top-level blocks. A naive split at every newline before a <p> tears a
   blockquote into pieces — this edition's cast list is one blockquote of seventeen paragraphs, and
   split that way its opener, its contents and its closer become three separate "blocks", after which
   the speech assembly below reads sixteen character names as continuations of a speech. So the depth
   is tracked and a chunk that opens a blockquote keeps swallowing until it closes again. */
function topBlocks(s) {
  const out = [];
  let buf = null, depth = 0;
  s.split(/\n(?=<p>|<blockquote>)/).forEach((chunk) => {
    const d = (chunk.match(/<blockquote>/g) || []).length - (chunk.match(/<\/blockquote>/g) || []).length;
    buf = buf === null ? chunk : buf + "\n" + chunk;
    depth += d;
    if (depth <= 0) { out.push(buf.trim()); buf = null; depth = 0; }
  });
  if (buf !== null) out.push(buf.trim());
  return out.filter(Boolean);
}

/* Assemble the cleaned blocks into speeches, in the same markup the three TEI plays already use, so
   all four read identically. A speech is its label plus every paragraph up to the next label; the
   first paragraph wears the name and the rest are `.bk-cont` continuations, which is exactly what
   dramaHtml does and is why a long speech does not read as nobody speaking.

   NO `bk-n` MARKERS ARE WRITTEN, and that is a fact about this edition rather than an omission: it
   prints no line numbers anywhere (see the BOOKS entry for why that costs the book its Greek column).
   app.js's bookSections reads a block with no marker as unnumbered and renders it as prose, which is
   the right and only honest rendering of a text that states no numbers. */
function playHtml(b) {
  const blocks = topBlocks(b);
  const parts = [];
  let inSpeech = false;
  const whoRx = new RegExp("^<p>" + PLAY_WHO_OPEN + "([\\s\\S]*?)" + PLAY_WHO_CLOSE + "</p>$");
  blocks.forEach((blk) => {
    const who = whoRx.exec(blk);
    if (who) { parts.push({ who: who[1] }); inSpeech = true; return; }
    // a blockquote is the edition's own set-off matter — the cast list, the scene note — and is
    // neither a speech nor part of one, so it ends whatever speech was open and stands on its own
    if (/^<blockquote>/.test(blk)) { parts.push({ raw: blk }); inSpeech = false; return; }
    const m = /^<p>([\s\S]*)<\/p>$/.exec(blk);
    const text = (m ? m[1] : blk).trim();
    if (!text) return;
    parts.push(inSpeech ? { cont: text } : { raw: blk });
  });
  const html = [];
  parts.forEach((x) => {
    if (x.raw !== undefined) { html.push(x.raw); return; }
    if (x.who !== undefined) { html.push('<p class="bk-sp"><b class="bk-who">' + x.who + "</b> "); return; }
    // the first paragraph completes the block the speaker's name opened; any after it are indented
    // continuations of the same speech
    const last = html[html.length - 1];
    if (last !== undefined && last.endsWith("</b> ")) html[html.length - 1] = last + x.cont + "</p>";
    else html.push('<p class="bk-sp bk-cont">' + x.cont + "</p>");
  });
  // a label with no speech under it would leave an unclosed block; close it rather than emit one
  return html.map((s) => (s.endsWith("</b> ") ? s + "</p>" : s)).join("\n");
}

/* THE WHOLE PLAY IS ON ONE PAGE and is cut rather than walked — the Song of Roland's shape, for the
   same reason: the transcription is one page per work. What it is cut AT is the edition's own front
   matter, because this edition divides the play itself not at all (measured: no act, no scene and no
   part heading anywhere in it, the only structural rules on the page being the running heads and the
   FINIS). So the tabs count what the edition actually separates — its introduction and its play — and
   the front matter says so outright, exactly as Aesop's says that its figures are the printed order
   rather than a citation system the book has not got. */
function extractPlay(h, book, warn) {
  const got = notesOf(h);
  const marked = markPlaySpeakers(h, warn);
  console.log("  " + marked.speakers + " speaker labels, " + marked.heads + " running heads/half-titles");
  const clean = cleanBody(marked.html, got.ids, book, warn);

  /* EVERYTHING BELOW WORKS ON WHOLE TOP-LEVEL BLOCKS, never on character offsets into the html, and
     that is the Song of Roland's rule again: cleanBody hands back balanced markup, so a cut made at a
     block boundary leaves both sides balanced, where a cut made at a matched string can fall inside a
     blockquote and leave an opener on one side and its closer on the other. */
  const blocks = topBlocks(clean.replace(/<p>\s*(?:<br>\s*)*<\/p>/g, ""));   // and the blank-line spacers
  const textOf = (s) => s.replace(/<[^>]+>/g, " ").replace(/&#160;|&nbsp;/g, " ").replace(/\s+/g, " ").trim();

  // the running heads and half-titles: matched on the block's WHOLE text and declared by the book, so
  // a word worth deleting in this edition cannot delete prose in another
  const heads = book.dropHeads || [];
  const kept = blocks.filter((blk) => !(/^<p>/.test(blk) && heads.some((r) => r.test(textOf(blk)))));
  const dropped = blocks.length - kept.length;
  if (heads.length && !dropped) warn("no running head matched — the transcription may have moved");
  console.log("  " + dropped + " running head(s)/half-title(s) dropped");

  const cuts = book.cuts || [];
  const at = cuts.map((c) => {
    const i = kept.findIndex((blk) => textOf(blk).toUpperCase() === c.from.toUpperCase());
    if (i < 0) throw new Error("could not find the cut '" + c.from + "' — the transcription has moved");
    return i;
  });
  at.forEach((x, k) => {
    if (k && x <= at[k - 1]) throw new Error("the cuts are out of order at '" + cuts[k].from + "'");
  });

  /* THE NOTES ARE RENUMBERED PER CHAPTER — the Seneca `data-fn` lesson in the coat Gilgamesh's
     extractTablets already wears. cleanBody has just numbered every marker against the list for the
     WHOLE PAGE, because the page is the unit it was handed; a Folio chapter carries its own list, so
     each marker is rewritten to point at this chapter's index and the list is built in marker order
     as it goes, which is what stops the two coming apart. A note cited twice keeps ONE entry with
     both markers on it, and a marker pointing at nothing is dropped rather than left claiming a
     citation the reader cannot follow — the rule app.js's wireFootnotes enforces at the other end.

     Getting this wrong is the silent failure the Medea's entry warns about: the edition prints these
     notes, and a reader that quietly dropped them would lose the lot with every count still healthy. */
  const seen = new Set();
  const out = cuts.map((c, k) => {
    const local = [], byNum = {};
    const slice = kept.slice(at[k], k + 1 < at.length ? at[k + 1] : kept.length).join("\n");
    const html = playHtml(slice).replace(
      /<sup class="fn" data-fn="(\d+)"><\/sup>/g,
      (all, num) => {
        const note = got.notes[+num - 1];
        if (note === undefined) { warn(c.t + ": a marker points at note " + num + ", which the page has not got"); return ""; }
        seen.add(num);
        if (!byNum[num]) { local.push(note); byNum[num] = local.length; }
        return '<sup class="fn" data-fn="' + byNum[num] + '"></sup>';
      }
    );
    return { n: k + 1, t: c.t, html: html, notes: local };
  });
  if (seen.size !== got.notes.length)
    warn("the page carries " + got.notes.length + " notes and " + seen.size + " are cited — " +
         (got.notes.length - seen.size) + " reached no chapter");
  return out;
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

/* ---------- A WHOLE BOOK ON ONE PAGE THAT IS NOT A WIKI PAGE ----------
   (Aug 2026, adding the Epic of Gilgamesh — the twentieth book, the ninth layout, and the FIRST from
   a host that is neither Wikisource nor Perseus.)

   WHY THE SHELF'S TWO USUAL SOURCES BOTH FAIL HERE, because that is the whole justification for a
   third one. Wikisource carries exactly two Gilgamesh editions and BOTH are one-tablet editions of
   the Old Babylonian version — Langdon's Pennsylvania tablet of 1917 and Jastrow & Clay's
   Pennsylvania and Yale tablets of 1920. Project Gutenberg carries the second of those and nothing
   else. Perseus is Greek and Latin. So the obvious sources between them hold perhaps a sixth of the
   poem, and building on one would have shipped a book that is correct about everything it contains
   and is not the Epic of Gilgamesh — which is the Dialogues' lesson exactly: ASK WHAT THE SOURCE IS
   MISSING BEFORE BUILDING ON IT.

   THE COMPLETE PUBLIC-DOMAIN TRANSLATION IS THOMPSON'S OF 1928 and it is reachable in two places,
   one of which is unusable. sacred-texts.com is behind a Cloudflare challenge from here (the bot
   wall the citation batches record on hal.science). The Internet Archive's scan of the 1928 volume
   has a full-text layer, and it was MEASURED rather than assumed: 13,838 words against the clean
   transcription's 21,600, so it is missing about a third of the poem outright — the Twelfth Tablet's
   first column arrives as bare line numbers with the verse gone — and what survives has the marginal
   line numbers fused into the words ("1He who"), the footnote digits welded onto the names beside
   them, the running heads inline, and the quotation marks mangled throughout. On a LITERAL
   translation that last part is not untidiness: Thompson's brackets, parentheses and question marks
   are the apparatus that says which words are restored and which are guessed, and an OCR that
   corrupts them makes the text claim things the translator did not. There is no cleaning pass that
   fixes it without inventing text, so it was rejected.

   What is used instead is Global Grey's transcription, which is complete, hand-made and clean, and
   which was CHECKED AGAINST THE 1928 SCAN rather than trusted: sampled eight-word runs out of it are
   found in the scan's own OCR, it is the longer of the two by a third, and the apparatus is all
   there — 1,099 square brackets, 179 (?) marks, 439 lacuna dot-runs and the six "lines wanting"
   notes. The transcriber is credited on the book's own page beside the edition, exactly as
   Wikisource and Perseus are.

   THE MARKUP IS A GIFT compared with a wiki page, and the extractor is correspondingly small: an
   <article> holding an <h2> per chapter, verse in <p> blocks with <br> between the lines, the
   column headings as their own one-line paragraph, and a <footer class="footnotes"> of
   <div id="_ftnN"> definitions that the in-text <a href="#_ftnN"> markers point at. Four things have
   to be done to it and each is below.

   ONE REQUEST FOR THE WHOLE BOOK, cached like a TEI file — so --from/--to cost nothing, a re-extract
   needs no network, and the site the text comes from is asked once rather than twenty times. */

/* The apparatus, read off the footer. Returns note number -> text, cleaned to the small tag set a
   note may carry by the same noteText the wiki books use, so a note is cleaned identically wherever
   the edition printed it. The number is the BOOK's own continuous numbering, 1 to 166; the mapping
   onto each chapter's own list is done in extractTablets, where the markers are. */
function tabletNotes(h, warn) {
  const m = h.match(/<footer[^>]*class="footnotes"[\s\S]*$/);
  if (!m) { warn("no footnote section found"); return {}; }
  const out = {};
  const rx = /<div id="_ftn(\d+)"[^>]*>([\s\S]*?)<\/div>/g;
  let x;
  while ((x = rx.exec(m[0]))) {
    /* The definition opens with its own back-link ("[12]") — the marker, not the note.
       The nbsp is normalised to its named form FIRST, because noteText knows `&#160;` and `&nbsp;`
       and not the hex `&#xa0;` this host writes: left alone, 32 of the 166 notes ship with the raw
       entity showing in the fold. Done here rather than by widening noteText, which fourteen other
       books share and none of them needs changed. */
    const body = x[2]
      .replace(/<a href="#_ftnref\d+"[^>]*>[\s\S]*?<\/a>/, "")
      .replace(/&#xa0;/gi, "&nbsp;");
    const t = noteText(body);
    if (t) out[x[1]] = t;
  }
  return out;
}

/* THOMPSON'S MARGINAL LINE NUMBERS, which are the citation apparatus and arrive fused to the verse.
   The printed edition numbers every fifth line down the margin; the transcription sets each number
   at the head of its own line with no space after the point ("5.He 'twas discovered..."), so this
   runs over a chapter AFTER the lines have been split and turns each one into the <span class="bk-n">
   marker the reader page draws.

   THE COUNT RESTARTS PER COLUMN, NOT PER TABLET, and that is the thing to get right rather than
   assume — a guard that simply ran forward through a tablet found 138 of the book's 325 numbers and
   threw the rest away as going backwards. A cuneiform tablet is written in columns and each column
   is numbered from its own first line, so the sequence legitimately falls back to 5 every time a new
   column opens. Hence the reset here, driven by the column headings the caller has just marked.

   AND IT CAN RESTART MID-COLUMN TOO. Measured over the whole book rather than reasoned about: six
   numbers fall back inside a column, always to a low one (First Tablet column I, Fourth column I,
   Tenth column IV among them), which is what a column made of two separated fragments looks like.
   So a number is accepted when it moves the count FORWARD — the Analects' and the Song of Roland's
   rule — or when it is a plausible RESTART, meaning it goes backwards to somewhere near the top of a
   column. Everything else is left as the text it is and reported.

   OVER THE WHOLE BOOK THAT ACCEPTS 324 OF 325 CANDIDATES, and the single rejection is a real
   irregularity worth naming rather than smoothing away: the Eleventh Tablet runs
   ... 170, 175, 150, 185, 190 ..., where every other number in the run is a multiple of five in
   order, so the 150 stands exactly where 180 belongs. Whether the slip is the 1928 printing's or the
   transcriber's could NOT be settled — the Internet Archive's text layer has dropped the marginal
   numbers in that column altogether — so nothing is asserted about its cause and the number is not
   quietly rewritten to 180, which would be composing an apparatus. The guard drops the marker, that
   one line of the Flood goes unnumbered, and the run says so every time.

   The separator matters and is easy to miss: the number is welded to the word after it, so a marker
   emitted without one leaves "5He" on the page. A remainder that already opens on punctuation (a
   lacuna's dots) keeps its own spacing. */
const LINE_RESTART_MAX = 15;
function markTabletLines(html, warn, where) {
  let last = 0, n = 0, restarts = 0;
  /* A LINE STARTS AFTER A <br> AND ALSO AT THE HEAD OF A PARAGRAPH, which is not a quibble: this
     edition opens a fresh <p> at every gap in the clay, so 61 of the book's 325 marginal numbers sit
     at the top of a paragraph rather than after a line break, and splitting on <br> alone silently
     left every one of them as text. The column-heading alternative has to come FIRST in the
     alternation — it contains a <p> of its own, and a bare <p> matching earlier would cut the
     heading in half and stop the reset below from ever firing. */
  const out = html.split(/(<p>(?:<sup[^>]*><\/sup>)?<b>Column[^<]*<\/b><\/p>|<br>|<\/?p>)/).map((piece) => {
    if (/^<p>(?:<sup[^>]*><\/sup>)?<b>Column/.test(piece)) { last = 0; return piece; }   // a new column starts again at its own line 1
    if (piece === "<br>") return piece;
    return piece.replace(/^(\s*)(?:<sup class="fn"[^>]*><\/sup>)?(\d{1,3})\.(?!\d)/, (all, sp, num) => {
      const v = parseInt(num, 10);
      const forward = v > last;
      const restart = v < last && v <= LINE_RESTART_MAX;   // a column built from two broken fragments
      if (!forward && !restart) {
        warn(where + ": line number " + v + " goes backwards after " + last + " — left as text");
        return all;
      }
      if (restart) restarts++;
      last = v; n++;
      return all.slice(0, all.length - (num.length + 1)) + '<span class="bk-n">' + v + "</span> ";
    });
  }).join("");
  if (!n) warn(where + ": no line numbers found");
  return out;
}

/* One page, cut into its chapters and cleaned. Returns [{ n, t, html, notes }] in tablet order.

   The chapter is found by its HEADING rather than by counting <h2>s, because the page carries
   Thompson's own Preface as an <h2> too and the footer carries another. A heading that does not name
   a tablet is skipped and reported, so a transcription that grows a section cannot quietly shift the
   numbering — the failure this file keeps meeting is the silent one.

   THE NOTES ARE RENUMBERED PER CHAPTER, which is the Seneca `data-fn` lesson in a new coat. The
   edition numbers its 166 notes straight through the book while a Folio chapter carries its own
   list, so each marker is rewritten to point at this chapter's index — and a note cited twice keeps
   ONE entry and both markers point at it, rather than the list gaining a duplicate. */
/* ---------------------------------------------------------------------------------------------
   A BOOK THAT IS NOT MARKUP AT ALL — PLAIN OCR TEXT   (layout: "journey")

   Every other reader on this shelf is handed markup somebody has already made decisions in: a wiki
   page whose paragraphs are <p>, a TEI file whose lines are <l>. Richard's Mission to Heaven exists
   in exactly one transcription anywhere — the Internet Archive's OCR of the Cornell copy — and that
   is a plain text file with hard line wraps, running heads, hyphenation across the wrap and page
   numbers in the middle of sentences. So this is the first extractor here that has to BUILD the
   structure rather than read it, and the four things it builds are worth naming because each of them
   fails silently if it is got wrong.

   · THE RUNNING HEADS ARE MATCHED ON SHAPE, NOT ON WORDING. The verso carries "44 MISSION TO HEAVEN"
     and the recto the chapter's own title with the page number after it — and the OCR mangles the
     words differently on almost every page ("iaSSION TO HEAVEN", "SEAECH FOR BOIORTAIJTY 13",
     "VISITS DKAGONS AND 'JUDGES OF HELL 37"), so a rule that knew the words would drop some and leave
     the rest standing mid-sentence. The shape does not vary: a short line, mostly capitals, with a
     page number at one end. Measured over the whole book — 250 lines go and every one of them was
     read to confirm it is a running head.

   · LIFTING A RUNNING HEAD OUT OF A PAGE LEAVES A HOLE WHERE IT STOOD, and a blank line is what
     separates one paragraph from the next, so a sentence that ran across a page arrives as two
     paragraphs broken at the word the page turned on. 359 of them. Rejoined on the Analects' test and
     only on it — the first block must end on no sentence punctuation AND the second must open
     lower-case — which is narrow enough that no paragraph of Richard's own can be swallowed by it.

   · THE CHAPTER NUMERALS ARE OCR AND THREE OF THEM DO NOT PARSE ("XLT" for XLI, "LXVIIl" for LXVIII,
     "XCni" for XCIII), while a fourth heading carries junk in front of it ("'-' . CHAPTER XI."). What
     is reliable is that a heading line exists for every chapter and that the chapters are consecutive,
     so the line is matched loosely and NUMBERED FORWARD-ONLY — the Song of Roland's and the Analects'
     rule — with every repair named on the run. Exactly 100 heading lines are found and they number
     1..100 with no gap, which is the check that makes the loose matching safe.

   · VERSE IS TOLD FROM PROSE BY LINE LENGTH, because nothing else distinguishes them here: both
     arrive as runs of short lines. Measured over the whole book, a wrapped prose line runs to a
     median of 52 characters and a line of verse to the high thirties, so the cut is at 44. Consecutive
     short blocks are merged first, since Richard sets a couplet with a blank line between its halves
     as often as not and two stray one-line paragraphs is the Prose Edda's run-on-verse fault wearing
     the opposite coat.

   AND THE TEXT IS ESCAPED RATHER THAN STRIPPED, which is the reverse of every other reader here. They
   are given markup and take tags out; this is given prose and puts tags in, so an ampersand or an
   angle bracket in the OCR is content and has to be escaped or it becomes markup by accident. */
function extractJourney(text, book, warn) {
  const escHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const capsRatio = (s) => {
    const ls = s.replace(/[^A-Za-z]/g, "");
    return ls ? ls.replace(/[^A-Z]/g, "").length / ls.length : 0;
  };
  const editDist = (a, b) => {
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++)
        cur.push(Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0)));
      prev = cur;
    }
    return prev[b.length];
  };
  /* THE CLOSING BRACKET IS OFTEN A LETTER, and it has to come off before the word is compared or it
     is measured as part of it. The scan reads "]" as "J" or "j" about a third of the time, so
     "[ouTLrsrE.J" carries a ninth letter that no amount of editing distance can account for — it was
     one edit over the threshold and shipped as prose, which put chapter 70 in the translated column
     when Richard had marked it an outline. Stripping the first and last characters first costs
     nothing and cannot mis-read a real bracket. */
  /* THE OPENING BRACKET IS OCR TOO, and one chapter's reads "f OUTLINE.]" — so the opener is the
     handful of characters a "[" is read as, and the word inside still has to survive the distance
     test below, which is what keeps the wider class from matching anything else. */
  const isOutlineMark = (s) => {
    const t = s.trim();
    if (!/^[[({fF1lI|]/.test(t) || t.length > 16) return false;
    const core = t.slice(1, -1).replace(/[^A-Za-z]/g, "").toLowerCase();
    return core.length >= 4 && core.length <= 12 && editDist(core, "outline") <= 3;
  };
  const medianLen = (ls) => {
    const a = ls.map((x) => x.length).sort((p, q) => p - q);
    return a.length ? a[a.length >> 1] : 0;
  };
  const CHAP_LINE = /^[^A-Za-z0-9]{0,6}(?:C[HKB][AEPR][PFR]?T?E?R?)\.?\s+([A-Za-z]{1,9})\.?$/;
  /* THE PAGE NUMBER IN A RUNNING HEAD IS ALSO OCR, so it is not always digits: one head in the book
     reads "U2 MISSION TO HEAVEN" where the page is 112, and anchored to \d it survived the sweep and
     shipped as a two-line quotation in the middle of a sentence — the one leak in 251. The character
     class is the handful of letters a digit is read as and nothing else, so it stays a rule about the
     SHAPE of a head rather than becoming a rule about its words. It is widened on the LEADING form
     alone: a verso head opens on its page number, where the recto's trailing number read cleanly in
     all 106 cases, and a line ending in a lone "I" or "U" is something a page of verse can plausibly
     contain. */
  const HEAD_NUM = /^(?:[\dOoIlUu|]{1,3}\s+(.{6,45})|(.{6,45}?)\s+\d{1,3})$/;
  const VERSE_MAX = book.verseMax || 44;

  let src = String(text).replace(/\r\n?/g, "\n");
  const first = src.search(/\n[^A-Za-z0-9]{0,6}C[HKB][AEPR][PFR]?T?E?R?\.?\s+I\.?[ \t]*\n/);
  if (first < 0) throw new Error("no chapter heading — the transcription has changed shape");
  src = src.slice(first);

  let heads = 0;
  src = src
    .split("\n")
    .filter((line) => {
      const s = line.trim();
      const m = HEAD_NUM.exec(s);
      const cand = m && (m[1] || m[2]);
      if (cand && capsRatio(cand) > 0.75 && cand.replace(/[^A-Za-z]/g, "").length >= 6) { heads++; return false; }
      return true;
    })
    .join("\n");
  /* The scan's own line wrap, which breaks a word with a hyphen. Only where a lower-case letter
     follows, so a real hyphenated compound broken across the wrap keeps its hyphen. */
  src = src.replace(/([A-Za-z])-[ \t]*\n[ \t]*([a-z])/g, "$1$2");

  const lines = src.split("\n");
  const starts = [];
  lines.forEach((l, i) => {
    const m = CHAP_LINE.exec(l.trim());
    if (m) starts.push({ i: i, num: m[1] });
  });
  if (!starts.length) throw new Error("no chapter headings found");

  let seq = 0;
  const repairs = [];
  starts.forEach((s) => {
    const v = romanValue(s.num);
    if (v === seq + 1) seq = v;
    else { repairs.push('"' + s.num + '" read as ' + (seq + 1)); seq += 1; }
    s.n = seq;
  });

  const out = [];
  let outlines = 0, verseBlocks = 0, joins = 0, lateHeads = 0;
  const marks = [];
  starts.forEach((s, k) => {
    const end = k + 1 < starts.length ? starts[k + 1].i : lines.length;
    const seg = lines.slice(s.i + 1, end);
    const ti = seg.findIndex((l) => l.trim());
    /* Leading scan noise, which four of the headings carry: chapter 11's "CHAPTER XI." line is
       printed with "'-' . " in front of it and its title line with "',' - ", neither of which is
       anything but dirt on the page. Only non-letters go, so a title is never shortened. */
    const title = ti < 0 ? "" : seg[ti].trim().replace(/^[^A-Za-z0-9]+/, "").replace(/[.\s]+$/, "");
    const blocks = [];
    let cur = [];
    seg.slice(ti + 1).forEach((l) => {
      if (l.trim()) cur.push(l.trim());
      else if (cur.length) { blocks.push(cur); cur = []; }
    });
    if (cur.length) blocks.push(cur);

    for (let i = blocks.length - 1; i > 0; i--) {
      const prev = blocks[i - 1];
      if (!/[.!?:;"']\s*$/.test(prev[prev.length - 1]) && /^[a-z]/.test(blocks[i][0])) {
        blocks.splice(i - 1, 2, prev.concat(blocks[i]));
        joins++;
      }
    }

    /* RICHARD'S OWN OUTLINE MARK. He sets the one word "[outline.]" under the argument of every
       chapter he summarises rather than translates — eighty-nine of the hundred — and the OCR
       mangles it twenty-two different ways ("[ouTLrsrE.J", "[OUTLINK. j", "[ODTLLNE.J", "[outlixk]",
       "f OUTLINE.]"), brackets included at both ends. It is normalised, which asserts
       nothing about what he printed — only that whatever he printed, he printed one thing, which is
       the glyphs rule — and every raw form seen is reported on the run. It is taken out of the RUN OF
       TEXT rather than off the head of a block, because it is not always a block of its own: where
       the scan set no blank line under it the OCR runs it straight into the paragraph below, and
       reading it as a block finds 85 of the 89. */
    let outline = false;
    for (let i = 0; i < blocks.length; i++)
      blocks[i] = blocks[i].map((l) =>
        l.replace(/[[({fF1lI|][A-Za-z0-9,.\-' \t]{2,14}?[\])}Jj1](?=[\s.,]|$)[ \t.,]*/g, (tok) => {
          if (!isOutlineMark(tok)) return tok;
          outline = true;
          if (marks.indexOf(tok.trim()) < 0) marks.push(tok.trim());
          return "";
        })
      );

    /* A RUNNING HEAD THE OCR BROKE IN TWO. The sweep above works on LINES and one head in the book
       arrives as two of them — its page number on the first and "MISSION TO HEAVEN" on the second —
       so neither half carries the shape the sweep looks for and the pair shipped as a two-line
       quotation in the middle of a sentence. This catches the block instead, on a pattern the book
       declares for itself, exactly as dropHeads is declared per book: a phrase worth deleting in one
       edition is prose in another. It can match only a block that is WHOLLY the running title, which
       no chapter of a novel is, and every hit is counted so a rule that starts eating text cannot do
       it quietly. */
    if (book.runningHead)
      for (let i = blocks.length - 1; i >= 0; i--) {
        const txt = blocks[i].join(" ").replace(/\s+/g, " ").trim();
        if (book.runningHead.test(txt)) { blocks.splice(i, 1); heads++; lateHeads++; }
      }

    const shortB = (b) => b.length <= 2 && medianLen(b) <= 46;
    for (let i = blocks.length - 1; i > 0; i--)
      if (shortB(blocks[i]) && shortB(blocks[i - 1]))
        blocks.splice(i - 1, 2, blocks[i - 1].concat(blocks[i]));

    const parts = [];
    let inHead = true, argue = [];
    const flushArg = () => {
      if (!argue.length) return;
      verseBlocks++;
      parts.push('<blockquote><p>' + argue.map(escHtml).join(" <br>\n") + "</p></blockquote>");
      argue = [];
    };
    blocks.forEach((b) => {
      b = b.filter((l) => l.trim());
      if (!b.length) return;
      const med = medianLen(b);
      const argy = inHead && b.length <= 4 && med <= 46;
      const versey = b.length >= 2 && med <= VERSE_MAX;
      if (argy) { argue = argue.concat(b); return; }
      flushArg();
      if (!versey) inHead = false;
      if (versey) {
        verseBlocks++;
        parts.push("<blockquote><p>" + b.map(escHtml).join(" <br>\n") + "</p></blockquote>");
      } else parts.push("<p>" + escHtml(b.join(" ").replace(/\s+/g, " ").trim()) + "</p>");
    });
    flushArg();
    /* The mark goes back where Richard prints it — under the chapter's argument and above the summary
       it introduces — rather than wherever the OCR happened to leave it in the run of text. */
    if (outline) {
      const at = parts.findIndex((p) => /^<p>/.test(p) && p.length > 220);
      parts.splice(at < 0 ? parts.length : at, 0, '<p><i>[outline.]</i></p>');
      outlines++;
    }

    /* ONE MARKER FOR THE WHOLE CHAPTER, because the chapter is what the two columns are cited by and
       neither edition numbers anything inside it — see the note on `original` in this book's entry.
       Written here rather than by cleanBody's `sections: "whole"` branch, which this book never
       reaches: that one is for the wiki walk and this text is not markup at all. */
    out.push({
      n: s.n,
      t: title,
      outline: outline,
      html: '<p><span class="bk-n" data-n="' + s.n + '">' + s.n + "</span></p>" + parts.join("\n"),
    });
  });

  const missing = [];
  for (let i = 1; i <= out.length; i++) if (!out.some((c) => c.n === i)) missing.push(i);
  if (missing.length) warn("chapter(s) with no heading found: " + missing.join(", "));
  return { chapters: out, repairs: repairs, heads: heads, outlines: outlines, marks: marks,
    verseBlocks: verseBlocks, joins: joins, lateHeads: lateHeads };
}

/* ============================================================================================
   THE CANTERBURY TALES — the first book here whose BOTH columns are plain text with no markup at all.

   Journey to the West established that a book may arrive as an OCR rather than as a wiki page, and
   that the reader then has to BUILD a structure and ESCAPE what it finds rather than strip tags out
   of it. This book does that twice over, from two different kinds of plain text, and the pair is
   worth reading together because the two halves fail in opposite directions.

   THE TRANSLATION IS A MACHINE READING OF A PRINTED PAGE. Nothing in it is marked: a running head, a
   page number, a chapter rubric and a paragraph of prose are all just lines. What structure exists is
   in the blank lines and the shape of the words, and the page furniture has to be recognised on that
   shape and taken out — after which the holes it leaves have to be closed, because a blank line is
   what separates one paragraph from the next and a sentence that ran across a page turn arrives as
   two paragraphs broken at the word the page turned on.

   THE ORIGINAL IS A PROOFREAD TRANSCRIPTION OF A CRITICAL EDITION, which is the opposite problem: it
   is accurate to the letter and most of what it accurately carries is APPARATUS. Skeat sets his
   variant readings under every dozen lines of verse, his summaries in one margin and his line numbers
   in the other, and all of it has to come off — while an indentation that means "apparatus" in one
   block means "a paragraph of verse opens here" in the next.

   WHAT THEY SHARE is that neither can be checked by counting tags, so both of them count what they
   remove and print it, and both refuse to guess: a block the sweep cannot classify is reported by
   name rather than dropped on the assumption that it was furniture.
   ============================================================================================ */

/* The rubrics Chaucer's manuscripts carry and both editions print, set in italic between the
   paragraphs. Recognised on their opening words and on being short and closed with a stop, which is
   what separates "Here beginneth the Miller his Tale." from a sentence of prose that opens on "Here". */
const CT_RUBRIC = /^(?:Here|Thus|Behold|Explicit|Incipit|Sequitur|The Prologue|The [Ww]ords|Chaucer)\b/;

function extractChaucer(text, book, warn) {
  const escHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const capsRatio = (s) => {
    const ls = s.replace(/[^A-Za-z]/g, "");
    return ls ? ls.replace(/[^A-Z]/g, "").length / ls.length : 0;
  };
  /* A sentinel for the edition's own omission mark, so that the joins below cannot weld the paragraph
     before a cut to the paragraph after it. Written with spaces so it can never equal a line of text. */
  const GAP = "  gap  ";

  let src = String(text).replace(/\r\n?/g, "\n");
  /* THE VOLUME IS THE WHOLE OF CHAUCER and the Canterbury Tales are the first sixth of it, so the poem
     is cut out of it at its own opening and closing formulas rather than at a page number. Both are
     the printed rubrics, and if either has moved the run stops here instead of importing the minor
     poems as a twenty-sixth tale. */
  const a = src.search(/\nHere\s+beginneth\s+the\s+Book\s+of\s+the\s+Tales\s+of\s+Canterbury\./i);
  const b = src.search(/\nHere\s+is\s+ended\s+the\s+book\s+of\s+the\s+Tales\s+of\s+Canterbury/i);
  if (a < 0 || b < 0) throw new Error("the Canterbury Tales are not where they were in this transcription");
  const tail = src.slice(b + 1);
  src = src.slice(a + 1, b + 1) + tail.slice(0, tail.indexOf("\n\n"));

  /* THE PAGE FURNITURE, on shape rather than on wording. This edition's running heads are the volume's
     title on one page and the tale's on the facing one, its page numbers stand alone, and the plates
     bound between the leaves leave their engraved captions behind with nothing to caption. All of them
     are a short line of capitals or a bare figure, and none of the prose is either — with one
     exception, which the book declares for itself in `keepHead`. Every distinct line taken is counted
     and printed on the run, because a rule that starts eating headings must not do it quietly. */
  const heads = {};
  let pages = 0;
  src = src.split("\n").filter((l) => {
    const s = l.trim().replace(/\s+/g, " ");
    if (/^\d{1,3}$/.test(s)) { pages++; return false; }
    if (s.replace(/[^A-Za-z]/g, "").length >= 6 && capsRatio(s) > 0.85 && s.length <= 46 &&
        !(book.keepHead && book.keepHead.test(s))) {
      heads[s] = (heads[s] || 0) + 1;
      return false;
    }
    return true;
  }).join("\n");

  /* The printer's own line-wrap hyphen, which this scan reads as ¬ about as often as as -. Closed only
     where a lower-case letter follows, so a real hyphenated compound broken across the wrap keeps its
     hyphen. */
  let hyphens = (src.match(/[A-Za-z][¬-][ \t]*\n[ \t]*[a-z]/g) || []).length;
  src = src.replace(/([A-Za-z])[¬-][ \t]*\n[ \t]*([a-z])/g, "$1$2");

  let blocks = [];
  let cur = [];
  src.split("\n").forEach((l) => {
    const s = l.trim().replace(/\s+/g, " ");
    if (s) cur.push(s);
    else if (cur.length) { blocks.push(cur.join(" ")); cur = []; }
  });
  if (cur.length) blocks.push(cur.join(" "));

  /* THE EDITION'S OWN OMISSION MARK. Where the translators drop a whole episode as too coarse they
     print a row of asterisks and say so in their preface; the scan reads the row five different ways,
     losing some of the stars and gaining stray punctuation. Normalised, which asserts nothing about
     how many asterisks were printed — only that whatever was printed, one thing was printed — and
     every raw form seen is reported, exactly as an OCR'd mark is anywhere else here. */
  let gaps = 0;
  const rawGaps = [];
  blocks = blocks.map((p) => {
    if ((p.match(/\*/g) || []).length >= 3 && p.replace(/[^A-Za-z]/g, "").length <= 4) {
      gaps++;
      if (rawGaps.indexOf(p) < 0) rawGaps.push(p);
      return GAP;
    }
    return p;
  });

  /* CLOSING THE HOLES THE FURNITURE LEFT. A blank line is what separates two paragraphs, so lifting a
     running head out of the middle of one leaves its halves standing as two — and the same is true of
     a hyphen the page turn split, once the head between them is gone. Both are closed on the narrowest
     test that can work: the first half must end on no sentence punctuation AND the second must open
     lower-case, which no real paragraph of this edition does. */
  const rejoin = () => {
    let n = 0;
    for (let i = blocks.length - 1; i > 0; i--) {
      const prev = blocks[i - 1], next = blocks[i];
      if (prev === GAP || next === GAP) continue;
      if (/[¬-]$/.test(prev) && /^[a-z]/.test(next)) {
        blocks.splice(i - 1, 2, prev.replace(/[¬-]$/, "") + next); n++; continue;
      }
      if (!/[.!?:;"'’”]\s*$/.test(prev) && /^[a-z]/.test(next)) {
        blocks.splice(i - 1, 2, prev + " " + next); n++;
      }
    }
    return n;
  };
  /* Run BEFORE the dirt is dropped and again after it, and both passes are needed. A word the scan
     stranded on a line of its own — "j°y." at the foot of one page — is rejoined by the first pass and
     would be thrown away as dirt by the sweep below if it ran the other way about; and the dirt a
     plate leaves between "sweet-" and "heart" has to GO before those two can be closed up. */
  let joins = rejoin();
  const junk = [];
  blocks = blocks.filter((p) => {
    if (p !== GAP && !/[A-Za-z]{3,}/.test(p)) { junk.push(p); return false; }
    return true;
  });
  joins += rejoin();

  /* THE CHAPTERS, found FORWARD ONLY: each anchor is searched from where the last one matched, so a
     rubric whose wording recurs later in the book cannot pull a tale backwards. A missing anchor
     throws rather than silently folding two tales into one. */
  const starts = [];
  let from = 0;
  CANTERBURY_TALES.forEach((T, i) => {
    let at = -1;
    for (let k = from; k < blocks.length; k++) if (T.en.test(blocks[k])) { at = k; break; }
    if (at < 0) throw new Error("tale " + (i + 1) + " (" + T.t + "): its opening rubric is not in the transcription");
    starts.push({ n: i + 1, t: T.t, at: at });
    from = at + 1;
  });

  let rubrics = 0;
  const out = starts.map((s, k) => {
    const end = k + 1 < starts.length ? starts[k + 1].at : blocks.length;
    const parts = blocks.slice(s.at, end).map((p) => {
      if (p === GAP) return "<p>* * * * *</p>";
      if (p.length <= 110 && CT_RUBRIC.test(p) && /[.!]\s*$/.test(p)) {
        rubrics++;
        return "<p><i>" + escHtml(p) + "</i></p>";
      }
      return "<p>" + escHtml(p) + "</p>";
    });
    /* ONE MARKER FOR THE WHOLE TALE, because the tale is what the two columns are set against and
       neither edition numbers anything inside it that the other numbers too. Written here rather than
       by cleanBody's `sections: "whole"` branch, which this book never reaches: that one is for the
       wiki walk and this text is not markup at all. */
    return {
      n: s.n,
      t: s.t,
      gaps: blocks.slice(s.at, end).filter((p) => p === GAP).length,
      html: '<p><span class="bk-n" data-n="' + s.n + '">' + s.n + "</span></p>" + parts.join("\n"),
    };
  });

  return { chapters: out, heads: heads, pages: pages, hyphens: hyphens, joins: joins,
    junk: junk, rubrics: rubrics, gaps: gaps, rawGaps: rawGaps };
}

/* An apparatus block opens on a line number, or on a capitalised label — HEADING, COLOPHON, QUOTATION,
   TITLE — or on an italic editorial word, or on the three asterisks Skeat sets before a note about
   where Tyrwhitt puts the passage. A block of VERSE opens at the same indentation and on none of
   those, which is the whole of what separates them. The asterisks are worth the measurement rather
   than the reasoning: the transcription carries exactly three such notes, two here in the apparatus
   band and one flush left, and no line of the poem opens on them — while the printer's rule between
   sections, which is also asterisks, sets them spaced apart and so cannot match. */
const SKEAT_APP = /^ {4}(?:[A-Z]{3,12}(?:[.;:]|\s*\()|\d+[a-z]?\b|_|Between|Cf\.|N\.B\.|\*\*\*)/;

function extractSkeat(text, warn) {
  const escHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const capsRatio = (s) => {
    const ls = s.replace(/[^A-Za-z]/g, "");
    return ls ? ls.replace(/[^A-Z]/g, "").length / ls.length : 0;
  };

  let src = String(text).replace(/\r\n?/g, "\n");
  const s0 = src.indexOf("*** START OF THE PROJECT GUTENBERG");
  if (s0 >= 0) src = src.slice(src.indexOf("\n", s0) + 1);

  const first = "\n" + CANTERBURY_TALES[0].me;
  const from = src.indexOf(first);
  /* The volume ends on the Tale of Gamelyn, which Skeat prints as an appendix and says is not
     Chaucer's, and which the translation does not render — so the cut stops there. */
  const to = src.indexOf("\nAPPENDIX TO GROUP A.");
  if (from < 0 || to < 0) throw new Error("the tales are not where they were in this transcription");
  src = src.slice(from + 1, to);
  const lines = src.split("\n");

  /* THE APPARATUS. Skeat prints his variant readings under each run of verse, indented four spaces
     where the verse is indented two — but a verse PARAGRAPH also opens at four, so the indentation
     alone cannot tell them apart and a rule written on it would delete a fifth of the poem. A block is
     taken as apparatus only when its FIRST line also carries an apparatus opener, and every
     four-indent block the test does NOT take is counted and reported, so a shape the opener has never
     met announces itself instead of arriving in the middle of the verse. */
  const runs = [];
  let cur = null;
  lines.forEach((l, i) => {
    if (/^ {4}\S/.test(l)) { if (!cur) cur = { a: i, lines: [] }; cur.lines.push(l); }
    else if (cur) { cur.b = i - 1; runs.push(cur); cur = null; }
  });
  if (cur) { cur.b = lines.length - 1; runs.push(cur); }
  const dropped = new Array(lines.length).fill(false);
  let apparatus = 0, verseOpeners = 0;
  runs.forEach((r) => {
    if (SKEAT_APP.test(r.lines[0])) {
      apparatus++;
      for (let i = r.a; i <= r.b; i++) dropped[i] = true;
    } else verseOpeners++;
  });

  let pageMarks = 0, rules = 0, groups = 0, lineNums = 0, sideNotes = 0, tyrwhitt = 0, crossRefs = 0;
  const rows = [];
  lines.forEach((l, i) => {
    if (dropped[i]) return;
    let s = l.replace(/\s+$/, "");
    const t = s.trim();
    if (!t) { rows.push(null); return; }
    /* The edition's own pagination, and Tyrwhitt's line correspondence beside it. Blanked rather than
       dropped with the line, because the very last one shares a line with the rubric that opens
       Chaucer's retraction. */
    s = s.replace(/^\s*\[\d+(?::[^\]]*)?\]\s*/, (m) => { pageMarks++; return m.replace(/\S/g, " "); });
    if (!s.trim()) return;
    if (/^\*(\s+\*)+$/.test(t)) { rules++; return; }              // the transcription's own rule between sections
    if (/^GROUP [A-I]\.?$/.test(t)) { groups++; return; }         // the fragment label, which the tab bar carries
    /* Skeat's marginal summary of who is being described, set in the right margin beside the verse.
       Anchored to a NON-SPACE before it, or a rubric — which the transcription also sets between = =,
       on a line of its own — is read as the margin of an empty line and deleted whole. */
    const bs = s;
    s = s.replace(/(\S)\s{2,}=[^=]{1,60}=\s*$/, "$1");
    if (s !== bs) sideNotes++;
    /* Skeat's OTHER marginal reference — where this line stands in TYRWHITT's ordering, set in the
       margin wherever the two editions have parted company. It is not caught by the line-number rule
       below, which wants the figure at the very end of the line, so left alone it ships as a bracket
       in the middle of the verse. It wears three costumes and a naive rule reading only the first
       leaves two-thirds of them standing: "[T. 14772." is a line NUMBER, "[T. _om._" marks a line
       Tyrwhitt does not print at all (18 of those, and the transcription's own preface says so), and
       one line carries "[See p. 256." instead, pointing at the page where Tyrwhitt puts the passage.
       Measured over the whole poem: 39 lines end in a bracketed margin and every one is one of the
       three, so a rule anchored on "[T." or "[See p." covers them exactly and reaches nothing else. */
    const bt = s;
    s = s.replace(/(\S)\s{2,}\[(?:T\.\s*(?:\d{1,6}|_om\._)|See\s+p\.\s*\d{1,4})\.?\]?\s*$/, "$1");
    if (s !== bt) tyrwhitt++;
    // the marginal line number, printed every fifth line, with Tyrwhitt's in brackets beside it
    const bn = s;
    s = s.replace(/\s{2,}\(?\d{1,5}\)?\.?$/, "");
    if (s !== bn) lineNums++;
    if (!s.trim()) return;      // a marginal number the transcription set on a line of its own
    const ind = /^ */.exec(s)[0].length;
    rows.push({ k: ind >= 2 ? "verse" : "prose", s: s.trim() });
  });

  /* VERSE AND PROSE ARE TOLD APART BY INDENTATION, which is what this transcription uses: the poem is
     set two spaces in and the two prose tales flush left. A block is a run of one kind between blank
     lines, and a verse block keeps its line breaks where a prose one is joined into a paragraph. */
  let blocks = [];
  let b = null;
  rows.forEach((x) => {
    if (!x) { if (b) { blocks.push(b); b = null; } return; }
    if (!b || b.k !== x.k) { if (b) blocks.push(b); b = { k: x.k, lines: [] }; }
    b.lines.push(x.s);
  });
  if (b) blocks.push(b);

  /* THE CROSS-REFERENCE AT THE FOOT OF A PAGE, which is apparatus wearing no apparatus indent. Where
     Skeat's order of the tales parts company with Tyrwhitt's he prints a note saying where to look,
     flush left or two spaces in, so neither the four-indent rule above nor the margin rules can see
     it — and several sit directly under a tale heading and ship as that tale's opening paragraph.
     THE TEST IS THE PAGE REFERENCE ALONE, which is narrower than it sounds and was measured before it
     was written: ten blocks in the whole poem carry one, nine are these notes and the tenth is a real
     stanza of the Monk's Tale whose MARGIN carries "[See p. 256." — which is why the margin rules
     above must run first, per line, as they do. A rule reading instead the thing these notes appear
     to have in common (a Tyrwhitt line number beside the page) catches four of the nine and leaves
     five standing, since Skeat cites Tyrwhitt three ways and sometimes not at all: "(NERO _follows
     in_ T.; _see_ p. 259.)" carries no figure, "***In Tyrwhitt's text, ll. 15469 sqq.; see p. 508."
     numbers lines rather than tales, and two are bracketed editorial notes saying only that one
     prologue follows another. The length cap is a bound rather than a test — the longest of the nine
     is 118 characters — so that a rule which somehow began matching could not eat a stanza quietly. */
  blocks = blocks.filter((bl) => {
    const t = bl.lines.join(" ").replace(/_/g, "").trim();
    if (t.length <= 130 && /\bpp?\.\s*\d/.test(t)) { crossRefs++; return false; }
    return true;
  });

  const starts = [];
  blocks.forEach((bl, i) => {
    const at = CANTERBURY_TALES.findIndex((T) => T.me === bl.lines.join(" ").trim());
    if (at >= 0 && !starts.some((x) => x.n === at + 1)) starts.push({ n: at + 1, at: i });
  });
  if (starts.length !== CANTERBURY_TALES.length)
    throw new Error("found " + starts.length + " of " + CANTERBURY_TALES.length + " tale headings");

  let heads = 0, rubrics = 0, verseLines = 0;
  const chapters = starts.map((st, k) => {
    const end = k + 1 < starts.length ? starts[k + 1].at : blocks.length;
    const parts = [];
    for (let i = st.at; i < end; i++) {
      /* The printed heading duplicates the chapter tab above it, so it goes — the same judgement made
         wherever a chapter here opens on its own number. */
      if (i === st.at) { heads++; continue; }
      const bl = blocks[i];
      const whole = bl.lines.join(" ").trim();
      const isRubric = /^=.*=$/.test(whole) ||
        (capsRatio(whole) > 0.9 && whole.replace(/[^A-Za-z]/g, "").length >= 6);
      let body = bl.k === "verse" ? bl.lines.map(escHtml).join("<br>\n") : bl.lines.map(escHtml).join(" ");
      if (bl.k === "verse") verseLines += bl.lines.length;
      body = body.replace(/\/\d{1,5}/g, "/");            // the prose tales' line numbers, set in the run of text
      body = body.replace(/\s*\[\d{1,4}\]\s*/g, " ");    // and their page markers, likewise
      body = body.replace(/_([^_]+)_/g, "<i>$1</i>");    // the transcription's italic
      body = body.replace(/=/g, "").trim();              // and its bold, which marks the rubrics
      if (!body) continue;
      if (isRubric) rubrics++;
      parts.push(isRubric ? "<p><i>" + body + "</i></p>" : "<p>" + body + "</p>");
    }
    return { n: st.n, html: parts.join("\n") };
  });

  return { chapters: chapters, apparatus: apparatus, verseOpeners: verseOpeners, pageMarks: pageMarks,
    rules: rules, groups: groups, lineNums: lineNums, sideNotes: sideNotes, heads: heads,
    rubrics: rubrics, verseLines: verseLines, tyrwhitt: tyrwhitt, crossRefs: crossRefs };
}

function extractTablets(h, book, warn) {
  /* CRLF, NORMALISED AT THE DOOR, and it is worth a line because of how it fails. This host serves
     the page with Windows line endings; every other source on the shelf does not, so `esc` — which
     escapes a backslash, a quote and a newline — has never had to think about a carriage return and
     passes one straight through into the generated string literal, where it IS a line terminator and
     the file will not parse. The failure is at least loud (the importer's own re-parse catches it),
     but it is a property of this transcription's line endings rather than of its content, so it is
     stripped here rather than by widening a helper fourteen other books depend on. */
  h = h.replace(/\r\n?/g, "\n");
  const notes = tabletNotes(h, warn);
  const body = h.replace(/<footer[^>]*class="footnotes"[\s\S]*$/, "");
  const art = body.match(/<article[^>]*class="reading-body"[\s\S]*$/);
  if (!art) throw new Error("no <article class=\"reading-body\"> — the page's markup has changed");

  const secs = art[0].split(/<h2[^>]*>/).slice(1);
  const want = book.chapters.length;
  const out = [];
  const seenHead = [];

  secs.forEach((sec) => {
    const cut = sec.indexOf("</h2>");
    const title = noteText(sec.slice(0, cut)).replace(/\s+/g, " ").trim();
    const rest = sec.slice(cut + 5);
    const m = title.match(/^The\s+(\w+)\s+Tablet\s*[:.]?\s*(.*)$/i);
    seenHead.push(title);
    if (!m) return;                                   // the Preface, and anything else added later
    const n = ORDINAL_WORD[m[1].toLowerCase()];
    if (!n) { warn('heading names a tablet this entry cannot number: "' + title + '"'); return; }

    /* The chapter's own notes, in the order their markers appear. Built while the markers are
       rewritten so the list and the numbers cannot come apart. */
    const local = [], byNum = {};
    let html = rest.replace(
      /(?:&#xa0;|&nbsp;| )*<a name="_ftnref(\d+)"[^>]*>\s*<\/a>\s*<a href="#_ftn\1"[^>]*>[\s\S]*?<\/a>(?:&#xa0;|&nbsp;| )*/g,
      (all, num) => {
        if (!notes[num]) { warn("tablet " + n + ": marker [" + num + "] points at no note"); return ""; }
        if (!byNum[num]) { local.push(notes[num]); byNum[num] = local.length; }
        return '<sup class="fn" data-fn="' + byNum[num] + '"></sup>';
      }
    );

    /* The column headings. Each is a paragraph whose whole text is "Column IV." — the edition's own
       division inside a tablet, and the coarse half of how the poem is cited. Bolded so it reads as
       the heading it is; nothing else about it is changed, and no heading is composed where the
       edition gives none.

       THE OPTIONAL <sup> IS NOT DECORATION. One heading in the book — the Second Tablet's Column II —
       carries a footnote marker in the same paragraph, and the marker has already been rewritten by
       the pass above by the time this runs. Anchored hard to `<p>`, this rule missed that one, which
       cost the tablet a column heading AND, because markTabletLines resets its count at these
       headings, left the whole of that column's numbering to be judged against the column before it.
       A single unmatched heading is the quiet kind of failure this file keeps meeting: nothing
       throws, no word is lost, and the only symptom is a column of missing marginal numbers. */
    let cols = 0;
    html = html.replace(
      /<p>\s*(<sup class="fn"[^>]*><\/sup>)?\s*(Column\s+[IVXL]+)\.?\s*<\/p>/gi,
      (all, sup, c) => { cols++; return "<p>" + (sup || "") + "<b>" + c + ".</b></p>"; }
    );

    html = stripTags(html)
      .replace(/&#xa0;|&nbsp;| /g, " ")
      .replace(/<p>\s*<\/p>/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\s+<br>/g, "<br>")
      .replace(/\n+/g, "\n")
      .trim();
    html = markTabletLines(html, warn, "tablet " + n);

    out.push({ n, t: m[2] ? m[2].trim() : book.chapterWord + " " + n, html, notes: local, cols });
  });

  if (out.length !== want)
    warn("the edition carries " + out.length + " tablets; the entry expects " + want +
         " (headings seen: " + seenHead.length + ")");
  out.sort((a, b) => a.n - b.n);
  return out;
}

const ORDINAL_WORD = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6,
  seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12,
};

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

/* Turn ONE page of another wiki into one chapter's html — the `perChapter` original, added with The
   Prince (Aug 2026) and the simplest of the three wiki shapes rather than a complication of them.
   Seneca's Latin gives one page per BOOK of the collection with the letters as headings inside it, so
   originalChapters above has to split a page and read a numeral off each heading; here the page IS the
   chapter and there is nothing to split.

   What it does have that the Latin does not is a page SCAN, like the English side — so the body is
   inside .prp-pages-output and is threaded with page markers. Those markers are the Italian wiki's own
   (`numeropagina`, and a visible "[p. 66 modifica]" link inside them) rather than the English wiki's
   `pagenum`, which is why cleanBody's pass does not reach them and this does its own. They are removed
   from the INNER span outwards by a balanced walk, since they nest four deep and the outermost span
   carries no class to match on; the empty wrappers left behind are swept with the other empties below.

   No section pass. A book reaching this function pairs on its CHAPTER — see the note on `original` in
   The Prince's entry — so the chapter is returned as one block, which is what bookRows then sets
   beside the whole of the English chapter. */
function originalChapter(h, O, warn) {
  let b = h.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  /* A PAGE TYPED ONTO THE WIKI RATHER THAN TRANSCLUDED FROM A SCAN has no `prp-pages-output` wrapper
     at all, so the slice below returns -1 and this throws on a page holding the whole text. Falling
     back automatically would be wrong for the same reason it is wrong on the translation side: a
     proofread page HAS the parser's own container too, outside the transclusion wrapper, so an
     automatic fallback would silently widen the slice of every scan-backed original the day this
     wiki next moves its markup. Hence a per-book opt-in. */
  let i = b.indexOf('<div class="prp-pages-output"');
  /* A PAGE TYPED ONTO THE WIKI HAS NO TRANSCLUSION WRAPPER — the same gate cleanBody carries for the
     translation side, added here (Aug 2026) for the first original that needs it, and gated per book
     for exactly the reason the English one is: a scan-backed original has the parser's own container
     TOO, outside the wrapper, so an automatic fallback would silently widen the slice of the two
     originals already shipped on this path the day a wiki moves its markup. */
  if (i < 0 && O && O.body === "plain") {
    const m = /<div class="[^"]*\bmw-parser-output\b[^"]*"[^>]*>/.exec(b);
    if (m) { i = m.index; b = b.slice(0, m.index) + b.slice(m.index + m[0].length); }
  }
  if (i < 0) throw new Error("no body");
  b = b.slice(i);
  /* MediaWiki's own navigation header — the work's title, its author and the previous/next links.
     On a scan-backed page it sits OUTSIDE the transclusion wrapper and the slice above has always
     dropped it for free; on a typed page it is the first thing INSIDE the parser container, so
     without this every chapter opens on a quotation of its own bibliographic header. Removed with a
     BALANCED match because it holds nested tables. */
  if (O && O.body === "plain") {
    const m = /<div id="headerContainer"[^>]*>/.exec(b);
    if (m) {
      const end = blockEnd(b, m.index, "div");
      if (end > 0) b = b.slice(0, m.index) + b.slice(end);
      else warn("the page's header block is unbalanced and was left in place");
    }
  }
  b = b.split(/<div class="reflist|<ol class="references"|<div class="mw-heading[^"]*"><h2/)[0];
  b = b.replace(/<div class="prp-pages-output"[^>]*>/g, "");
  /* The edition's quoted VERSE, which this transcription sets as a definition list — see
     verseFromLists, written for the Prose Edda's skaldic stanzas. Gated per book, like every other
     rule in this function, so it is provably inert on the originals already shipped. */
  if (O && O.verse === "dl") b = verseFromLists(b);
  for (let k = 0; k < 200; k++) {
    const m = /<span class="numeropagina\b[^>]*>/.exec(b);
    if (!m) break;
    const end = blockEnd(b, m.index, "span");
    if (end < 0) break;
    b = b.slice(0, m.index) + b.slice(end);
  }
  b = b.replace(/<link[^>]*\/?>/g, "").replace(/<meta[^>]*\/?>/g, "");
  b = b.replace(/<div[^>]*>/g, "<blockquote>").replace(/<\/div>/g, "</blockquote>");
  b = stripTags(b);
  b = b.replace(/&#160;|&nbsp;/g, " ").replace(/&#32;/g, " ");
  b = b.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n");
  for (let k = 0; k < 6; k++) {
    b = b.replace(/<span>\s*<\/span>/g, "");
    /* A paragraph holding nothing but line breaks. This edition sets a blank line above and below its
       chapter title that way, so the title does not follow the heading directly and a pass looking for
       it at the head of the text finds a spacer instead — which is how the first run of this reported
       twenty-six chapters with no printed title while every one of them has one. */
    b = b.replace(/<p>(?:\s*<br>\s*)+<\/p>/g, "");
    b = b.replace(/<blockquote>\s*<\/blockquote>/g, "").replace(/<p>\s*<\/p>/g, "");
    b = b.replace(/<blockquote>\s*(<blockquote>[\s\S]*?<\/blockquote>)\s*<\/blockquote>/g, "$1");
  }
  b = b.replace(/\s+<\/p>/g, "</p>").replace(/<p>\s+/g, "<p>").replace(/\n{2,}/g, "\n").trim();

  /* The printed chapter heading, in the two pieces this edition sets it in: "CAPITOLO XVIII." centred
     — a <blockquote> by the time it is seen, exactly as Haines's running heads are — and the chapter's
     own title in italics on the line below it. Folio prints both above the text already, so left in
     place each chapter opens on its own number and title said twice, the first time as a quotation.
     Anchored to the START, so only a head can go, and the title is RETURNED rather than discarded so
     that the run's log can say which one it took off each chapter.

     THE TITLE IS NOT ALWAYS IN THE SAME BLOCK AS THE NUMBER, and assuming it is loses it on a third of
     the book. Nine of the twenty-six chapters here set "CAPITOLO IX." and the title together inside one
     centred block and the other seventeen set the title in a paragraph of its own below it — the same
     text, printed two ways, which is what an edition of 1814 transcribed page by page looks like. So
     the whole leading block goes whenever it carries the number (chapter 1's also carries the volume's
     half-title, which is not chapter 1 and would otherwise stand at the top of the book), and a
     following italic-only paragraph goes after it. Neither can run away with the prose: the first is
     bounded by the block it is in, and the second must be a paragraph containing nothing but an italic
     run, which no chapter of Machiavelli opens with. */
  let head = "";
  const takeHead = (inner) => {
    const it = inner.match(/<i>([\s\S]*?)<\/i>/);
    if (it && !head) head = it[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  };
  b = b.replace(/^<blockquote>([\s\S]*?)<\/blockquote>\s*/, (m, inner) => {
    if (/<blockquote>/.test(inner)) return m;
    const t = inner.replace(/<[^>]*>/g, " ").replace(/&#\d+;|&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    if (!O.dropHead || !O.dropHead.test(t)) return m;
    takeHead(inner);
    return "";
  });
  b = b.replace(/^<p>\s*<i>([\s\S]*?)<\/i>\s*<\/p>\s*/, (m, inner) => {
    if (/<\/?p\b/.test(inner)) return m;
    takeHead("<i>" + inner + "</i>");
    return "";
  });
  b = b.replace(/^<p>\s*(?:<br>\s*)+/, "<p>");
  /* Only where the book actually declares a head to take. An edition that prints no chapter
     heading at all has none to find, and warning once per chapter would bury the warnings that
     mean something under one per ode. */
  if (!head && warn && O.dropHead) warn("no printed title found at the head of the chapter");
  return { html: b, head: head };
}

/* ---------- AN ORIGINAL WHOSE CHAPTERS ARE MARKED IN THE PROSE BY A WORD ----------
   `layout: "caput"` (Aug 2026, adding The City of God). One page of another wiki per Folio chapter,
   like `perChapter` above, with the one thing that function does not do: it reads the section numbers
   back out of the text. Migne prints Augustine's chapter heads as "CAPUT XVII.-- <the chapter's Latin
   title>", run into the prose rather than set as headings, so there is nothing structural to walk and
   the numbers have to be found in the words — the same job the wiki shape has always had on the
   translation side, met here on the original's.

   FOUR THINGS ABOUT THIS EDITION HAD TO BE LEARNED RATHER THAN ASSUMED, and every one of them was
   found by counting its marks against the English rather than by reading a page.

   · THE MARK WEARS FOUR COSTUMES. The first chapter of every book is "CAPUT PRIMUM" — the word, not
     the numeral — and the rest are Roman. The double dash that separates the number from the title is
     missing in a handful (Book XIV's twenty-fifth, among others), and one chapter has a stray full
     stop after the word itself ("CAPUT. VII.--", Book XII). Written against the strictest of the four,
     the pass finds 650 of the 661 and the eleven it misses fold their prose silently into the chapter
     above them — which is invisible to every count, since no word is lost and the book is the right
     length.

   · A NUMBER MAY BE PRINTED TWICE, IN BRACKETS. Book I sets "[CAPUT X.]" a second time, where Migne
     resumes a chapter after an inserted passage. It is not a chapter and must not open one, and the
     forward-only guard every section pass here uses declines it for nothing but its number — so the
     material folds into chapter 10, which is what it is part of. The bracketed form is recognised
     anyway, so that it is reported rather than left in the prose as a stray heading.

   · THE MARK IS NOT IN ANY ONE KIND OF ELEMENT. Inventoried over the whole work: 478 of the 661 sit
     in a definition-list item, 153 in a paragraph and 31 in no element of their own at all, running
     on after the previous chapter's last sentence inside the same paragraph. So the marking is done
     on the TEXT, after the tags have gone, and each mark SPLITS the paragraph it was found in —
     anchoring to a `<p>` would find fewer than a quarter of them.

   · AND THE EDITION'S OWN PAGE NUMBERS ARE IN THE RUNNING TEXT. Migne threads the column numbers of
     the Patrologia through the prose as bare figures — "41.0347|" — 821 of them across the work.
     They are a reference to a page of a printed volume and read as debris in the middle of a Latin
     sentence, so they are removed and counted, and the count is reported rather than the removal
     being silent.

   Migne's numbered subdivisions inside the longer chapters are HIS and are kept. They arrive as a
   list item holding nothing but "1." and would render as a paragraph containing a single figure, so
   each is folded onto the front of the paragraph it numbers — which is where the printing puts it. */
function extractCaput(h, O, warn, where) {
  let b = h.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  const m = /<div class="[^"]*\bmw-parser-output\b[^"]*"[^>]*>/.exec(b);
  if (!m) throw new Error(where + ": no body");
  b = b.slice(0, m.index) + b.slice(m.index + m[0].length);
  b = b.slice(m.index);
  b = b.split(/<div class="reflist|<ol class="references"/)[0];
  /* The wiki's own furniture: the title block, the machine-readable data block, the previous/next
     navigation table, the [recensere] edit links and the heading blocks that carry them. Balanced,
     because each nests.

     THE CLASS IS LOOKED FOR ANYWHERE IN THE TAG, not immediately after the element name, and that is
     not tidiness: this wiki writes `<div id="ws-data" class="ws-noexport" …>` and
     `<div align="left" class="ws-noexport" …>`, so a pattern anchored to `<div class=` misses both.
     The one carrying the id holds the page's author, title and year as bare spans, which arrive as a
     quotation reading "Aurelius AugustinusDe civitate Dei0Saeculo V" at the top of the chapter — the
     attribute-order fault this file has recorded once before on a TEI milestone, met again on a div,
     and quiet in the same way: nothing throws and no prose is lost. */
  for (const cls of ["ws-noexport", "titulusHeaderBox", "mw-heading", "mw-editsection"]) {
    for (let k = 0; k < 60; k++) {
      const x = new RegExp('<(div|span)\\b[^>]*\\bclass="[^"]*\\b' + cls + '\\b[^"]*"[^>]*>').exec(b);
      if (!x) break;
      const end = blockEnd(b, x.index, x[1]);
      if (end < 0) break;
      b = b.slice(0, x.index) + b.slice(end);
    }
  }
  b = b.replace(/<table[\s\S]*?<\/table>/g, "");
  b = b.replace(/<link[^>]*\/?>/g, "").replace(/<meta[^>]*\/?>/g, "");
  // Migne's own column references, threaded through the prose as bare figures
  const cols = (b.match(/\b41\.\d{4}\s*\|/g) || []).length;
  b = b.replace(/\b41\.\d{4}\s*\|/g, "");
  // a definition list is this edition's chapter head and its paragraph numbers; both are paragraphs
  b = b.replace(/<\/?dl[^>]*>/g, "").replace(/<dd[^>]*>/g, "<p>").replace(/<\/dd>/g, "</p>");
  /* THE PAGE'S OWN CONTAINERS, dropped before the generic div pass turns them into a quotation OF the
     whole book — the fault the translation side's wrapper rule exists to prevent, in another wiki's
     markup. Each page nests two `<div class="text">` and an empty `<div title="beginning">` around
     everything; left standing they become blockquotes wrapping every word of Augustine, indented
     behind a rule and set in italic. Their closers become unmatched `</blockquote>`s and stripTags
     discards them, which is what its stack is for. The `poem` divs are NOT dropped: twelve of them
     across the work hold verse Augustine quotes, and a quotation is exactly what they are. */
  b = b.replace(/<div class="text"[^>]*>/g, "").replace(/<div title="beginning"[^>]*>/g, "");
  b = b.replace(/<div[^>]*>/g, "<blockquote>").replace(/<\/div>/g, "</blockquote>");
  b = stripTags(b);
  b = b.replace(/&#160;|&nbsp;/g, " ").replace(/&#32;/g, " ");
  b = b.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n");

  /* THE CHAPTER HEADS. Matched on the text, forward-only, and each one SPLITS the block it was found
     in — the closing and opening tags are emitted around it and the empty paragraphs that leaves are
     swept below. A number that does not move the sequence on is left exactly as it was printed and
     reported, so a bracketed resumption reads as the repetition it is rather than as a chapter. */
  let seq = 0, found = 0, refused = 0;
  b = b.replace(
    /(\[?)\s*CAPUT\s*\.?\s*(PRIMUM|[IVXLC]+)\s*\.\s*(?:--|—|–)?\s*([^\n<]*)/g,
    (whole, brack, num, title) => {
      const v = num === "PRIMUM" ? 1 : romanValue(num);
      if (!v || v <= seq) {
        refused++;
        warn && warn(where + ": “CAPUT " + num + "” repeats or goes backwards — left as printed");
        return whole;
      }
      seq = v; found++;
      return '</p><p><span class="bk-n">' + v + "</span> <b>" + title.trim() + "</b></p><p>";
    }
  );
  if (!found && warn) warn(where + ": no chapter numbers found — it will pair as one whole block");

  for (let k = 0; k < 6; k++) {
    b = b.replace(/<p>\s*(?:<br>\s*)+<\/p>/g, "");
    b = b.replace(/<blockquote>\s*<\/blockquote>/g, "").replace(/<p>\s*<\/p>/g, "");
    b = b.replace(/<blockquote>\s*(<blockquote>[\s\S]*?<\/blockquote>)\s*<\/blockquote>/g, "$1");
  }
  /* Migne's paragraph number, printed on a line of its own by this transcription and put back on the
     front of the paragraph it belongs to. */
  const folded = (b.match(/<p>\s*\d{1,3}\s*\.\s*<\/p>\s*<p>/g) || []).length;
  b = b.replace(/<p>\s*(\d{1,3})\s*\.\s*<\/p>\s*<p>/g, "<p>$1. ");
  b = b.replace(/\s+<\/p>/g, "</p>").replace(/<p>\s+/g, "<p>").replace(/\n{2,}/g, "\n").trim();
  /* THE BOOK'S OWN NUMBER, printed above its summary — the same running head the translation side
     drops, in the other language. This transcription is not consistent about where it puts it:
     seventeen of the twenty-two books set "LIBER TERTIUS." as a paragraph and the other five set it
     in the page heading, which has already gone with the rest of the wiki's furniture. Left standing
     it is a heading under a tab that already reads Book III. Anchored to the start and tested against
     the block's whole text, as every list of this kind here is, so it can only ever take a head. */
  if (O && O.dropLeadParas) {
    for (let k = 0; k < 4; k++) {
      const before = b;
      b = b.replace(/^<p>((?:(?!<\/p>)[\s\S])*)<\/p>\s*/, (m, inner) => {
        const t = inner.replace(/<[^>]*>/g, " ").replace(/&#\d+;|&nbsp;/g, " ").replace(/\s+/g, " ").trim();
        return O.dropLeadParas.some((rx) => rx.test(t)) ? "" : m;
      });
      if (b === before) break;
    }
  }
  return { html: b, marks: found, refused: refused, cols: cols, folded: folded };
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
   TEI PROSE IN BOOKS OF NUMBERED CHAPTERS   (a book declaring layout: "chaptered")
   ============================================================
   The sixth TEI reader, added Aug 2026 with Herodotus, and the shape it reads is the commonest one
   in ancient prose: a work divided into BOOKS, each divided into numbered CHAPTERS, each of those
   divided again into SECTIONS. "Herodotus 1.32.4" is book, chapter, section.

   teiChapters above walks exactly that tree already — a Folio chapter is a `book` division and the
   numbers inside it are `chapter` divisions — so the honest question was why this is not simply that
   function with another book pointed at it. Three answers, and each is a fault this file has met
   before under another name.

   · IT READS THE ATTRIBUTES INDEPENDENTLY OF THEIR ORDER, AND THE SUBTYPE WITHOUT REGARD TO CASE.
     teiChapters matches `subtype="book"` and then `n="…"` in that order, lowercase. Herodotus's Greek
     spells its divisions `subtype="book" n="1"` and its English spells them `n="1" subtype="Book"` —
     the other order AND the other case, both at once. That regex therefore returns nine books from
     the Greek and throws on the English. It is Suetonius's attribute-order fault and Ovid's
     capitalised `subtype="BOOK"` arriving together in one work, which is the argument for reading
     both robustly here rather than for the third time in a row discovering that one edition spells
     something the way the last one did not.

   · IT LIFTS THE NOTES OUT. teiChapters uses teiProse, which knows nothing about `<note>`; the
     Meditations' Greek carries none, so that has never cost anything. This edition carries 528 in
     the English and 83 in the Greek — the translator's and the Perseus editors' glosses, set at the
     point they are cited. teiProse's tag sweep would strip the wrapper and leave the note's TEXT
     standing in the middle of Herodotus's sentence, which is the Meditations' reflist fault in a new
     element and just as invisible: the prose is complete and simply says more than the author did.
     So this walks teiSectionProse instead, which is the reader Suetonius's notes were written for,
     and each marker carries the entry it points at rather than its place in the queue.

   · IT PAIRS ON THE CHAPTER, WHICH IS NOT THE DEEPEST DIVISION. The finer `section` divisions are the
     same numbered entry and are simply concatenated into it, exactly as Leopold's sections are folded
     into a chapter of the Meditations. That is a decision about this work rather than a convenience,
     and it was MEASURED over the whole of both editions before it was made:

       chapters : 1,578 on each side, and in all nine books the chapter NUMBERS are identical —
                  same count, same values, in order, nothing missing on either side.
       sections : 4,338 on each side, but nine chapters number them differently. Book 1 chapter 1
                  opens on a section the English calls `pr` and the Greek calls `0`; eight more
                  (6.11, 6.49, 6.58, 7.19, 7.37, 7.41 and two others in book 7) run 1,2,4 against
                  1,2,3 or 1,3 against 1,2, the English numbering skipping where the Greek does not.

     So the chapter is the unit both editions agree on without exception and the section is not, which
     settles it: pairing on the chapter is provably clean, and pairing on the section would have put
     nine chapters of the two columns beside passages that are not each other. The nine are recorded
     rather than repaired, as the Nicomachean Ethics' three repeated Bekker pages are — reconciling
     them would mean composing an apparatus over two editions that each state their own numbering.

   THE SPACING IS TIDIED, and only here. This edition's English is tagged so densely — 35,714 `<name>`
   elements — that the whitespace sitting between two tags survives them both and lands in front of
   the punctuation that followed: "of Halicarnassus , so that". It is an artefact of unwrapping rather
   than anything the translator wrote, there are 834 of them, and every one would read as a typo. It
   is done in this reader instead of in teiInline because teiInline is shared with five shipped books
   and a rule that rewrites their punctuation is a rule that has to be proved against all five. */
function teiBookChapters(xml, opts, warn) {
  const body = xml.slice(xml.indexOf("<body"));
  if (body.length < 1000) throw new Error("no <body> in the TEI file");

  // attributes read independently of their order, and the subtype without regard to case — see above
  const attr = (t, a) => (t.match(new RegExp("\\b" + a + '="([^"]*)"')) || [])[1] || "";
  const divs = [];
  const dre = /<div\b([^>]*)>/g;
  let m;
  while ((m = dre.exec(body))) {
    const st = (/subtype="([^"]*)"/i.exec(m[1]) || [])[1] || "";
    if (st) divs.push({ sub: st.toLowerCase(), n: attr(m[1], "n"), at: m.index });
  }
  const books = divs.filter((d) => d.sub === "book" && /^\d+$/.test(d.n));
  if (!books.length) throw new Error("no book divisions in the TEI file");

  const out = {};
  books.forEach((b, i) => {
    const end = i + 1 < books.length ? books[i + 1].at : body.length;
    const chs = divs.filter((d) => d.sub === "chapter" && d.at > b.at && d.at < end);
    if (!chs.length) { warn("book " + b.n + " has no chapter divisions"); return; }

    const notes = [];
    const skipped = [];
    /* SEQ STARTS BELOW ZERO BECAUSE A CHAPTER MAY LEGITIMATELY BE NUMBERED 0, which the Gallic War is
       the first book here to do: Hirtius's covering letter to Balbus stands at the head of book 8,
       numbered apart from the war it introduces, and both editions print it that way. With the
       counter starting at 0 the forward-only guard below read that chapter as following itself and
       warned twice on every run — a false alarm on a perfectly ordered book, which is the kind of
       noise that teaches the next person to ignore the warnings. Herodotus's chapters all start at 1
       and are unaffected: any real chapter scales to 100 or more. */
    let html = "", seq = -1, kept = 0;
    chs.forEach((ch, j) => {
      const raw = body.slice(ch.at, j + 1 < chs.length ? chs[j + 1].at : end);
      /* A CHAPTER NUMBER HERE IS NOT ALWAYS AN INTEGER, and taking it for one costs the book real
         text. 45 of this work's 1,578 chapters carry a letter — 2.121A to 2.121F, 7.10A to 7.10H,
         and so on — which is how an editor numbers a passage inserted into a sequence already fixed
         by everyone who cites it. They are Herodotus, not apparatus: 2.121A is the opening of the
         story of Rhampsinitus's treasury, one of the most famous things in the book. The first cut of
         this reader borrowed teiSections' "a division numbered with a word is not a chapter" guard,
         which is right for Suetonius's appended essays and wrong here, and it silently dropped all 45
         from both columns — nothing threw, every book was present, and the run reported a clean
         1,533-for-1,533 pairing of a book missing forty-five of its chapters.
         So the guard now admits a trailing letter, and anything else is still skipped and reported. */
      const key = /^(\d+)([A-Z])?$/.exec(ch.n);
      if (!key) { skipped.push(ch.n); return; }
      /* THE NUMBER SHOWN AND THE NUMBER SORTED ON COME APART the moment a letter is allowed, which is
         the Nicomachean Ethics' Bekker-page problem in a second work: parseInt reads 121, 121A and
         121B as one section 121, merging three rows into one and taking the ordering with it. So the
         marker carries an explicit `data-n` sort key, on a scale with room for the letter — 121 →
         12100, 121A → 12101 — and app.js's bookSections reads it in preference to the text.
         IT IS WRITTEN ON EVERY MARKER IN THIS BOOK, not only the lettered ones, and that is the part
         to keep: bookSections falls back to parsing the text where the attribute is absent, so a
         book mixing bare 121 with data-n="12101" would be sorting two scales against each other. */
      const n = +key[1] * 100 + (key[2] ? key[2].charCodeAt(0) - 64 : 0);
      /* A number that goes BACKWARDS is a fault worth hearing about; a gap is not, an edition being
         entitled to have none. Both columns run this, so the two can only disagree loudly. */
      if (n <= seq) warn("book " + b.n + ": chapter " + ch.n + " follows " + seq + " — out of order");
      seq = n;
      const text = teiSectionProse(raw, notes);
      if (!text) { warn("book " + b.n + " chapter " + ch.n + " came back empty"); return; }
      kept++;
      // the marker goes INSIDE the first paragraph, which is where bookSections looks for it
      html += (html ? "\n" : "") +
        text.replace(/^<p>/, '<p><span class="bk-n" data-n="' + n + '">' + ch.n + "</span> ");
    });
    /* The unwrapping artefact, not the translator's punctuation — see the note above. IT HAS TO REACH
       THE NOTES TOO: they are lifted out of the prose into their own list before any of this runs, so
       a tidy applied to `html` alone leaves 74 of them sitting in 59 notes, where they read exactly as
       badly ("Not the modern Red Sea , but the Persian Gulf") and are simply harder to notice. */
    const tidy = (s) => s.replace(/\s+([,.;:!?·])/g, "$1");
    out[b.n] = { html: tidy(html), notes: notes.map(tidy), chapters: kept, skipped: skipped };
  });
  return out;
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

  /* WHICH WORD THE EDITION USES FOR ITS NUMBERED UNIT is the edition's business, not ours. Suetonius
     is divided into `subtype="chapter"` and Burnet's Plato into `subtype="section"`, and both mean the
     same thing to this reader: the numbered unit a passage is cited by, which Folio pairs the two
     columns on. Declared per book and defaulting to "chapter", so the twelve lives read exactly as
     they did before this was a parameter. */
  const want = (opts.subtype || "chapter").toLowerCase();
  const marks = [];
  const dre = /<div\b([^>]*)>/g;
  let m;
  while ((m = dre.exec(body))) {
    const a = m[1];
    const st = /subtype="([^"]*)"/i.exec(a);
    const n = /\bn="([^"]*)"/.exec(a);
    if (st && st[1].toLowerCase() === want && n) marks.push({ raw: n[1], at: m.index });
  }
  if (!marks.length) throw new Error("no " + want + " divisions in the TEI file");

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

  /* PERSEUS'S NAME AUTHORITY, dropped WITH its words — and it is the quiet fault of the Herodotus
     files, which are the first here to carry it. Their English tags every person, place and people
     against a gazetteer, and a place is encoded as the authority's entry FOLLOWED by the words the
     translator actually wrote:

       <name key="tgn,7016142" type="place"><reg>Bodrum [27.466,37.5] (inhabited place), Mugla Ili,
       Ege kiyilari, Turkey, Asia </reg> <placeName key="tgn,7016142">Halicarnassus</placeName></name>

     The sweep at the foot of this function unwraps what it does not recognise and KEEPS the words, so
     left alone the first sentence of the Histories reads "the inquiry of Herodotus of Bodrum
     [27.466,37.5] (inhabited place), Mugla Ili, Ege kiyilari, Turkey, Asia Halicarnassus" — a modern
     Turkish gazetteer entry, with coordinates, inside the book's opening line. Nothing throws, no
     passage is missing and every count reads as healthy; it is only wrong. 4,305 of them.

     IT IS SCOPED TO <name> ON PURPOSE, and that is the whole care in this rule. TEI's own `<reg>` is
     the REGULARIZED form of a word — <choice><orig>ye</orig><reg>you</reg></choice> — which an editor
     means to be read and which a blanket drop would delete from some future edition's prose. What is
     dropped here is only a `<reg>` standing inside a `<name>`, which is Perseus's own use and is
     metadata rather than text. Measured over the whole work before this was written: all 4,305 sit
     inside a `<name>` and none outside one. The non-greedy match mis-reads a `<name>` nested in
     another — there are four, all of the shape "Racecourse of <name>Achilles</name>" — but none of
     the four contains a `<reg>`, so nothing is lost and the stray closing tag unwraps below. */
  b = b.replace(/<name\b[^>]*>([\s\S]*?)<\/name>/g, (whole, inner) =>
    inner.replace(/<reg\b[^>]*>[\s\S]*?<\/reg>/g, ""));

  /* THE EDITOR'S CORRECTION, kept over the reading he is correcting — the same judgement `add` and
     `del` above make, in the one element that states both halves at once. Godley's Greek marks four:
     <choice><sic>αἱ</sic> <corr>οἱ</corr></choice>. Unwrapped by the generic sweep both survive and
     the text reads "αἱ οἱ", which is a word the author did not write standing next to the word he
     did. A `<choice>` carrying no `<corr>` keeps whatever else it holds rather than emptying. */
  b = b.replace(/<choice\b[^>]*>([\s\S]*?)<\/choice>/g, (whole, inner) => {
    const corr = /<corr\b[^>]*>([\s\S]*?)<\/corr>/.exec(inner);
    return corr ? corr[1] : inner.replace(/<sic\b[^>]*>[\s\S]*?<\/sic>/g, "");
  });
  b = b.replace(/<gap\b([^>]*?)\/?>/g, (whole, a) => {
    const r = /rend="([^"]*)"/.exec(a);
    return r && r[1].trim() ? " " + r[1].trim() + " " : " … ";
  });
  /* A TABLE SET AS A LIST, kept as rows — added Aug 2026 with the Gallic War, which is the first book
     here whose translator prints one. Caesar's chapter 1.29 is the census tablets found in the
     Helvetian camp, and the edition sets the six entries as a `<list>` of `<label>`/`<item>` pairs: a
     people on the left, a number on the right. The generic sweep at the foot of this function unwraps
     all three tags and keeps the words, so left alone the passage arrives as one run-on line — "Of the
     Boii 32,000 The sum of all amounted to 368,000 Out of these, such as could bear arms…" — where the
     table's last number runs into the sentence after it and the column of figures is gone. It is the
     `wrapBareRuns` fault in a new element: nothing throws, no word is lost, and the chapter is exactly
     the right length. Folio's reader has no table, but it has `<br>`, and one row to a line carries
     what the column carried.

     IT IS SCOPED TO A `<label>` INSIDE A `<list>`, and that scoping is the whole care in the rule.
     TEI's `<label>` is also how a play marks WHO IS SPEAKING, and the Symposium's Greek — already
     shipped — carries six of them doing exactly that: `<label>ΑΠΟΛ.</label>` opening Apollodorus's
     speeches. A rule keyed on `<label>` alone would put a line break before every one of those and
     silently re-set a shipped book. Measured over every TEI file this importer reads before the rule
     was written: `<list>` occurs in this one English file and nowhere else on the shelf, so what
     follows is provably inert for all thirteen books already here — which the byte-for-byte re-run
     confirmed rather than assumed. No separator is invented between the two cells: the edition prints
     none, and a space is what the eye reads as the gap in a table of this shape. */
  b = b.replace(/<list\b[^>]*>([\s\S]*?)<\/list>/g, (whole, inner) => {
    const rows = inner
      .split(/(?=<label\b)/)
      .map((r) => r.replace(/<\/?(?:label|item)\b[^>]*>/g, " ").replace(/\s+/g, " ").trim())
      .filter(Boolean);
    return rows.length ? " " + rows.join("<br>") + "<br>" : "";
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
   TEI PROSE PAGED BY MILESTONE   (an original declaring source:"tei" with layout:"paged")
   ============================================================
   The fourth TEI reader, and it exists because the unit the two columns pair on is not always the
   unit the edition is DIVIDED into (Aug 2026, adding the Nicomachean Ethics).

   The three readers above each take their numbers from a `<div>`: teiChapters from `subtype="book"`,
   teiSections from the numbered divisions inside one file, teiVerseBooks from the card milestones of
   a poem. Bywater's Greek is divided into ten books and 116 numbered sections — but a section is a
   modern editor's paragraphing, and it is NOT what Aristotle is cited by, nor what Ross's margin
   prints. Both editions state the BEKKER PAGE, and Bywater's states it as a milestone standing inside
   the prose: `<milestone unit="page" resp="Bekker" n="1094a"/>`. So the pairing runs on those, and
   the section divisions are simply concatenated into the book the way teiChapters concatenates
   Leopold's.

   Four things it was worth measuring before writing this rather than after.
   · EVERY page milestone sits INSIDE a `<p>` — all 181 of them — so a paragraph has to be split at
     its markers rather than merely prefixed with one. Had any stood between paragraphs a `<p>`-
     anchored reader would have dropped it in silence, which is the Art of War's fault in a new file.
   · 100% of this edition's text is inside `<p>`, so nothing is lost by walking them. Measured for
     the same reason: 138 of the Art of War's English cells opened on a bare run, and nothing threw.
   · The line milestones are dropped. There are 1,330 of them against 181 pages — Bekker's every-fifth
     line — and the English side's are dropped too, so the columns carry the same apparatus.
   · The `<note>` elements go FIRST, which is Ovid's lesson: 16 of them here, all bibliographic
     references to the works Aristotle quotes. teiInline unwraps whatever it does not recognise, so
     left in place their text would land in the prose as though Aristotle had written it.

   THE MARKER TRAVELS AS A SENTINEL because teiInline strips every tag it does not know, and the
   marker is a `<span>`. Widening that keep-list would reach four shipped books through a shared
   function; a sentinel is plain text, passes through untouched, and is asserted absent from the
   source before anything relies on it. */
function teiPagedBooks(xml, opts, warn) {
  const body = xml.slice(xml.indexOf("<body"));
  if (body.length < 1000) throw new Error("no <body> in the TEI file");
  if (body.includes("@@")) throw new Error("the sentinel '@@' occurs in the source text");

  // attributes read independently of their order — the fault Lucretius's cards found in cardMarks
  const attr = (t, a) => (t.match(new RegExp("\\b" + a + '="([^"]*)"')) || [])[1] || "";
  const books = [];
  const bre = /<div\b([^>]*)>/g;
  let m;
  while ((m = bre.exec(body))) {
    if (/subtype="book"/i.test(m[1]) && attr(m[1], "n")) books.push({ n: +attr(m[1], "n"), at: m.index });
  }
  if (!books.length) throw new Error("no book divisions in the TEI file");

  const out = {};
  let total = 0;
  books.forEach((b, i) => {
    let seg = body.slice(b.at, i + 1 < books.length ? books[i + 1].at : body.length);
    seg = seg.replace(/<note\b[^>]*>[\s\S]*?<\/note>/g, "");
    let seq = 0, kept = 0;
    seg = seg.replace(/<milestone\b[^>]*?\/>/g, (t) => {
      if (attr(t, "unit") !== "page") return "";
      const pg = /^(\d{3,4})([ab])$/.exec(attr(t, "n"));
      if (!pg) return "";
      const key = +pg[1] * 10 + (pg[2] === "a" ? 0 : 1);
      /* A page that does not advance the sequence is a fault worth hearing about rather than a
         silent merge — the same guard the English side runs, so the two can only disagree loudly. */
      if (key <= seq) { warn("book " + b.n + ": Bekker page " + attr(t, "n") + " repeats or goes backwards"); return ""; }
      seq = key; kept++;
      return "@@BKP" + key + ":" + attr(t, "n") + "@@";
    });
    const ps = [...seg.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((x) => teiInline(x[1]));
    const html = ps
      .filter(Boolean)
      .map((p) => "<p>" + p + "</p>")
      .join("\n")
      .replace(/@@BKP(\d+):(\d{3,4}[ab])@@\s*/g, '<span class="bk-n" data-n="$1">$2</span> ');
    if (!html) { warn("book " + b.n + " came back empty"); return; }
    if (!kept) warn("book " + b.n + " has no Bekker pages — it will pair as one whole block");
    total += kept;
    out[b.n] = html;
  });
  if (opts && opts.expect && total !== opts.expect) warn("read " + total + " Bekker pages, expected " + opts.expect);
  return out;
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
     half-lines scattered through it. Seventy-four notes, every one of them in the Latin.

     THEY ARE COUNTED BEFORE THEY GO, and that is the Medea's lesson rather than bookkeeping. That
     play's edition prints 38 notes into a reader written for one that prints none, and would have
     lost the lot in silence. Here the count is returned and the caller prints it, so an edition whose
     apparatus is being dropped says so on every run instead of being quietly thinner than its source. */
  const dropped = (body.match(/<note\b/g) || []).length;
  /* A DROPPED NOTE LEAVES A SPACE BEHIND IT ON A PROSE COLUMN, for the reason the milestone rule
     below gives: Murray's markers sit hard against the words on both sides ("So spake he,<note>1
     </note>and Patroclus"), so removing them outright welds the sentence. 137 of the 144 sit that
     way. It is scoped to the prose branch rather than applied to everything because Ovid's Latin
     apparatus is 37 notes standing between LINES, where teiVerse joins with <br> and a space would
     change bytes in a shipped book for no gain — and that book is the check this whole change is
     held to. */
  let b = body.replace(/<note\b[^>]*>[\s\S]*?<\/note>/g, opts.prose ? " " : "");
  /* The editor's marks of SPURIOUS text, dropped with their words — the same judgement teiProse makes
     for the Meditations, and for the same reason: what ships is the text the printed page constitutes.
     Every <del> in this edition happens to sit inside a note and so has already gone, which is checked
     rather than assumed; the rule stays because the next edition's may not. */
  b = b.replace(/<del\b[^>]*>[\s\S]*?<\/del>/g, "");
  // the file's own "Book 1" head, where Folio prints its own chapter title
  b = b.replace(/<head\b[^>]*>[\s\S]*?<\/head>/g, "");

  /* A CARD BOUNDARY INSIDE A LINE IS LIFTED TO THE LINE'S EDGE, and skipping this loses the line
     (Aug 2026, adding the Aeneid). Williams sets 69 of his 396 card marks as milestones standing
     mid-line, because that is where the Latin line they name begins:

        <l n="54">their weariness consoled. <milestone ed="p" n="42" unit="card"/>The morrow morn,</l>

     Cards are cut by SLICING the book at each mark, so a mark inside a line cuts the element in
     half: the card above ends on an <l> with no </l>, the card below opens on a </l> with no <l>,
     and teiVerse — which matches a complete <l>…</l> pair and nothing else — silently matches
     NEITHER. One line of verse disappears at every one of the 69 boundaries. It is the shape this
     file keeps meeting: nothing throws, the poem is 99.5% present, all twelve books pair, and only
     counting lines against the edition shows it. The Song of Roland records the same fault from the
     other side (strip the whole unit before splitting it into lines) and the Gita from a third (cut
     the original as a stream, not block by block).

     So the mark is moved to just after the line's own </l>, which keeps the LINE whole and gives it
     to the card it begins in. The cost is that a card's first line may hold a few words belonging to
     the card above — a boundary drawn at the nearest line break rather than mid-word — which is the
     Antigone's and Beowulf's case exactly: two editions dividing at slightly different points is
     recorded rather than repaired, and here the two are never more than one line apart because the
     mark names the line it sits in. It also removes the WELD for free: 13 of the 69 sit hard against
     the words on both sides ("he voiced this word:“What pride of birth", "in general
     acclaim.Ourselves did make"), which is the Iliad's 2,787-weld fault in a third edition, and a
     tag lifted out of the line cannot weld the words left inside it.

     Gated on `cards: "both"`, so the four verse books already on this shelf cannot be touched by it
     — and measured on them as well as reasoned about: Ovid's Latin carries four milestones inside
     lines and every one is `unit="tale"`, not a card. */
  let lifted = 0;
  if (opts.cards === "both") {
    b = b.replace(/<l\b[^>]*>[\s\S]*?<\/l>/g, (line) => {
      const marks = [];
      /* THE MARK LEAVES A SPACE BEHIND IT, which is the Iliad's rule and is needed here for the same
         13 boundaries the weld count found. Williams sets a good many of these marks hard against the
         words on both sides — "he voiced this word:<milestone n="132"/>“What pride of birth", "in
         general acclaim.<milestone n="234"/>Ourselves did make" — so the tag is standing exactly
         where the space would be, and lifting it out of the line welds the two words it was keeping
         apart. Removing rather than replacing shipped that way for one run and left "word:“What" and
         "acclaim.Ourselves" in the text. It costs nothing at the other 56, where a space is already
         there, because the whitespace run is collapsed in teiVerse two steps later. */
      const stripped = line.replace(/<milestone\b[^>]*?\/>/g, (t) => {
        if (!/\bunit="card"/i.test(t)) return t;
        marks.push(t);
        return " ";
      });
      if (!marks.length) return line;
      lifted += marks.length;
      return stripped + marks.join("");
    });
  }

  /* CASE-INSENSITIVE, and that is load-bearing rather than defensive. The English file spells Book 3
     `subtype="BOOK"` in capitals and every other book lowercase, so a case-sensitive match returns
     fourteen books and quietly files Book 3's ten cards inside Book 2 — no error, no missing text, and
     a book that has silently ceased to exist as a book.

     AND THE TWO ATTRIBUTES ARE READ INDEPENDENTLY OF THEIR ORDER, which is the same fault the card
     rule below already records, met one element higher up (Aug 2026, adding the Odyssey). Every
     earlier file on this path writes the book division `<div type="textpart" subtype="book" n="1">`
     — Ovid's, Lucretius's, both of the Iliad's — and the Odyssey's Greek writes `<div n="1"
     type="textpart" subtype="book">`, the same three attributes in another order. A pattern that
     fixes the order matches NOT ONE of the twenty-four.

     This one fails LOUDLY, which is the good outcome and worth saying, since almost every fault this
     file records is silent: no book division means no book, so the guard below throws on a file
     holding the whole poem rather than returning a thinner one. The card rule's version of the same
     fault is the quiet one — it returns a poem with nothing to pair on. */
  const battr = (t, a) => (t.match(new RegExp("\\b" + a + '="([^"]*)"', "i")) || [])[1] || "";
  const bs = [];
  {
    const bre = /<div\b([^>]*)>/g;
    let bm;
    while ((bm = bre.exec(b))) {
      if (battr(bm[1], "subtype").toLowerCase() !== "book") continue;
      const bn = battr(bm[1], "n");
      if (/^\d+$/.test(bn)) bs.push({ n: +bn, index: bm.index });
    }
  }
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
  /* AN EDITION MAY MARK ITS CARDS TWO WAYS AT ONCE, AND THEN BOTH HAVE TO BE READ IN ONE SWEEP
     (Aug 2026, adding the Aeneid — the first book here whose translation does this). Every earlier
     file on this path picks one mechanism and keeps to it: Ovid's English divides into
     <div subtype="card">, its Latin marks <milestone unit="card"/>, and `cards` names which to look
     for. Williams's Aeneid uses BOTH, and not at random — the choice follows where the boundary
     falls. A card that begins where an English line begins gets a division; a card that begins
     PART WAY THROUGH a line cannot, since a division would have to break the <l> element, so it is
     set as a milestone standing inside the line at the exact word the new card opens on.

     MEASURED over all twelve books before this was written: 327 divisions and 69 milestones, one
     ascending run per book with no duplicate and nothing out of order. So they are one sequence in
     two costumes, and the Meditations' rule applies — match both forms in ONE sweep in READING
     ORDER, never as two passes, or the second pass starts from a counter the first left at the end
     of the book and the forward-only guard declines everything it finds.

     Read either alone and the failure is the quiet kind this file keeps recording. `cards: "div"`
     returns 327 of the 396 boundaries: nothing throws, every line of the poem is present, and 69
     passages fold into the card above them, where they sit against Latin that is not theirs. */
  const cardMarks = (seg) => {
    const both = opts.cards === "both";
    const tag = both
      ? /<milestone\b([^>]*?)\/?>|<div\b([^>]*)>/g
      : opts.cards === "milestone" ? /<milestone\b([^>]*?)\/?>/g : /<div\b([^>]*)>/g;
    const marks = [];
    let m;
    while ((m = tag.exec(seg))) {
      const attrs = both ? (m[1] === undefined ? m[2] : m[1]) : m[1];
      /* Which attribute says "card" depends on the element, not on the book: a milestone carries
         `unit` and a division carries `subtype`. Both are read wherever both elements are in play,
         and — the Suetonius fault this file records twice already — INDEPENDENTLY OF THEIR ORDER,
         since Williams writes `<milestone ed="p" n="42" unit="card"/>` with `n` before `unit`. */
      const k = both
        ? (m[1] === undefined ? /\bsubtype="([^"]*)"/i : /\bunit="([^"]*)"/i).exec(attrs)
        : (opts.cards === "milestone" ? /\bunit="([^"]*)"/i : /\bsubtype="([^"]*)"/i).exec(attrs);
      const n = /\bn="(\d+)"/.exec(attrs);
      if (k && k[1].toLowerCase() === "card" && n) marks.push({ n: +n[1], index: m.index });
    }
    return marks;
  };

  const out = {};
  bs.forEach((bk, i) => {
    const seg = b.slice(bk.index, i + 1 < bs.length ? bs[i + 1].index : b.length);
    const cs = cardMarks(seg);
    if (!cs.length) { warn("book " + bk.n + ": no cards — it would pair as one whole block"); return; }
    // verse before the first card would be dropped in silence; say so instead
    const unit = opts.prose ? /<p\b/g : /<l\b/g;
    const stray = (seg.slice(0, cs[0].index).match(unit) || []).length;
    if (stray) warn("book " + bk.n + ": " + stray + " line(s) stand before the first card");
    let seq = 0;
    out[bk.n] = cs.map((c, j) => {
      const raw = seg.slice(c.index, j + 1 < cs.length ? cs[j + 1].index : seg.length);
      const n = c.n;
      if (n <= seq) warn("book " + bk.n + ": card " + n + " follows " + seq + " — out of order");
      seq = n;
      /* The tale name each edition prints at this boundary — Magnus's, which BOTH files carry, and
         which reconcileCards uses to check that a reconciled pair really is the same passage. */
      const t = raw.match(/<milestone[^>]*ed="Magnus"[^>]*\bn="([^"]*)"[^>]*unit="tale"[^>]*\/>/);
      /* A CARD MAY BE PROSE RATHER THAN VERSE, and the two columns of one book may differ (Aug 2026,
         adding the Iliad — the first work here whose translation is prose and whose original is
         verse). Murray's Loeb renders Homer as continuous prose, one paragraph to a card, while
         Monro and Allen's Greek is 15,687 <l> elements; teiVerse reads <l> and nothing else, so
         pointed at the English it returns twenty-four empty books. The prose branch walks
         teiSectionProse instead — the reader Suetonius's and Herodotus's prose already use, which
         resolves <quote> to an inline <q> and unwraps Perseus's placeName tagging keeping the words.
         Measured before it was reused: none of this edition's 710 quotations crosses a card or a
         paragraph boundary and every card balances, so the tag swap cannot strand an opener. */
      /* A STRIPPED MILESTONE MUST LEAVE A SPACE BEHIND IT, and this is the fault that shipped for an
         hour and was found by LOOKING at the rendered page rather than by any count. Murray prints
         Homer's line numbers in the margin every fifth line and the transcription sets them inline,
         hard against the words on both sides — "came to fulfillment,<milestone n="5"/>from the time
         when". teiInline unwraps whatever it does not recognise, so left to the generic sweep the tag
         simply vanishes and the words on either side of it are welded: "fulfillment,from",
         "perish,because", "the old man prayedto the lord Apollo", "covered quiver.The arrows".
         MEASURED over the whole book: 2,787 of the 3,143 milestones weld two words together — nearly
         every fifth line of the poem, some 2,800 typos in a book whose every other check reads
         healthy. The section count is right, the tag balance is right, no word is lost and nothing
         throws; it is only wrong to read, which is the quiet shape this file keeps recording.
         Replacing rather than removing costs nothing where a space is already there, since teiInline
         collapses runs of whitespace at the end. Scoped to the prose branch and read independently of
         attribute order, so the verse books are untouched — Ovid and Lucretius join their lines with
         <br> and have nothing to weld. */
      const prepared = opts.prose
        ? raw.replace(/<milestone\b[^>]*?\/>/g, (t) => (/\bunit="line"/i.test(t) ? " " : t))
        : raw;
      const html = opts.prose ? teiSectionProse(prepared, []) : teiVerse(prepared);
      /* What is COUNTED as a line differs with it. The Greek states every line as an element; the
         English states Homer's line numbers as milestones every fifth line, which is the apparatus a
         printed translation carries. Reporting <l> for a prose column would report nought. */
      const lines = opts.prose
        ? (raw.match(/<milestone\b[^>]*unit="line"/g) || []).length
        : (raw.match(/<l\b/g) || []).length;
      return { n: n, tale: t ? t[1].trim() : "", html: html, lines: lines };
    }).filter((c) => { if (!c.html) warn("card " + c.n + " came back empty"); return c.html; });
  });
  return { books: out, dropped: dropped, lifted: lifted };
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
    /* A <choice> OFFERS TWO READINGS OF THE SAME WORDS AND THE TAG SWEEP KEEPS BOTH (Aug 2026,
       adding the Aeneid — the first book on this path to carry one). TEI's <choice> wraps a pair of
       alternatives, and unwrapping it the way everything else inside a line is unwrapped prints them
       one after the other: Williams's "And foul Pasiphaë are seen" arrives as "And foul Pasiphae
       Pasiphaë are seen", and Greenough's "gestare Latinis" as "gesture gestare Latinis". Four lines
       of the English and one of the Latin, every other check reading healthy — the Herodotus <reg>
       fault (4,305 gazetteer entries in the prose) in a different wrapper and at a scale small enough
       to ship unnoticed.

       ONE child is kept, and which one is the edition's own answer rather than a preference: <corr>
       over <sic>, because <sic> flags an error and <corr> supplies the reading meant to stand (the
       Latin's single case is the plainly impossible "gesture", an English word in a Latin hexameter);
       and <orig> over <reg>, because Folio ships what the printed page carries and the 1910 page sets
       "Pasiphaë" with the diaeresis Williams chose. A <choice> whose children are neither is left to
       the generic sweep rather than guessed at, and reported by the caller's line count if it ever
       shortens a line to nothing. */
    const resolved = m[1].replace(/<choice\b[^>]*>([\s\S]*?)<\/choice>/gi, (all, inner) => {
      const pick = /<corr\b[^>]*>([\s\S]*?)<\/corr>/i.exec(inner) ||
                   /<orig\b[^>]*>([\s\S]*?)<\/orig>/i.exec(inner);
      return pick ? pick[1] : all;
    });
    /* AND A MILESTONE STANDING INSIDE A LINE WELDS THE WORDS EITHER SIDE OF IT — the Iliad's rule,
       met here on the stanza break rather than on a line number. This edition sets two of its own
       paragraph marks inside a line ("incipiam.<milestone unit='para'/>Fracti bello", "maius opus
       moveo.<milestone unit='para'/>Rex arva Latinus") and Williams one, and left to the generic
       sweep the tag simply vanishes: "incipiam.Fracti", "moveo.Rex", "hastes.Then". Replacing rather
       than removing costs nothing where a space is already there, since the whitespace run is
       collapsed two steps below — which is what makes it safe to apply to every book on this path
       rather than gate it, and Ovid's four inline milestones (all `unit="tale"`, none welding) are
       the proof it is inert on what already ships. */
    const line = resolved
      .replace(/<milestone\b[^>]*?\/>/g, " ")
      .replace(/<[^>]*>/g, "").replace(/&#160;|&nbsp;/g, " ").replace(/\s+/g, " ").trim();
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

/* ============================================================
   A PLAY — the fifth shape, and the first work here that is not read but performed
   ============================================================
   Every book above is a column of prose or of verse with one voice in it. A tragedy is a score for
   several: who is speaking is not decoration around the text, it IS the text, and a page that drops
   the speaker names turns a play into an unattributed argument. So the drama reader below keeps three
   things the other four extractors have never had to carry — the speaker of each speech, the stage
   directions, and the division of the play into its own alternating scenes and choral odes.

   THE PAIRING KEY IS THE LINE NUMBER, which is how any passage of Greek tragedy is cited in any
   language, and both editions state it on every line. That is worth saying precisely, because the
   two columns state it at DIFFERENT GRAIN. Storr's Greek is verse and numbers every line, 1 to 1530.
   Jebb's English is prose, and numbers a block of it with the line that block BEGINS at — 1, then 5,
   then 10 — which is the ordinary convention of a printed translation. So the English's numbers are a
   SUBSET of the Greek's, and a Greek line joins the English block whose range contains ITS OWN stated
   number: line 163 sits under the marker 159 because 163 is at least 159 and less than 169.

   THAT IS NOT THE MOVE THE MEDITATIONS ENTRY WARNS AGAINST, and the difference is the whole of why
   this book could be added at all. That warning is against transferring one edition's numbering onto
   a text that states NONE, where every assignment is a guess about position in a list. Here both
   texts state their numbers, in the same coordinate system — the line count of the Greek play, fixed
   since the Renaissance and identical in every edition and translation of it. Nothing is inferred
   from order.

   MEASURED BEFORE IT WAS BELIEVED, over the whole play: the two files divide it into the SAME fifteen
   parts, beginning at the same fifteen lines; 683 English sections, of which 680 draw Greek beside
   them and 3 do not. Those three are places where Jebb's constitution of the text and Storr's differ —
   a line one of them numbers and the other does not — and they are left as an English cell beside an
   empty Greek one, which is what both editions saying what they say looks like. Repairing them would
   mean composing an apparatus, which is what the Meditations' Greek was abandoned for.

   THE ORIGINAL MAY CARRY MORE MARKERS THAN THE TRANSLATION, and that is correct rather than a
   miscount. Where the Greek changes speaker inside one of Jebb's blocks — Sophocles writes long
   stretches of line-for-line exchange, and a prose translation does not always break with them — that
   block is emitted as two speeches under the SAME number, so each keeps its speaker's name. app.js's
   bookSections folds consecutive blocks sharing a number back into one section, so the pair draws as
   one row with both speakers in the Greek cell. Hence the run below reports DISTINCT numbers, which
   is what pairs, rather than a count of markers, which is what would look like a discrepancy.

   THE STAGE DIRECTIONS ARE JEBB'S AND THE GREEK HAS NONE, which is not a gap in the import: the
   ancient text does not transmit them, and every one a modern edition prints is its editor's
   inference from the words. So they are marked as a different kind of thing from the spoken line, and
   the Greek column beside them is empty because Storr's page is empty there too. Said in the front
   matter as well, or it reads as a fault in this page. */

/* A line number is a figure and an optional letter, and 625 and 625a are TWO DIFFERENT PLACES —
   parseInt collapses them onto one, merging the pair into a single row and taking the ordering with
   it. It is the Bekker-page fault the Nicomachean Ethics found, on a different citation system: this
   play carries sixteen lettered lines in the English and twenty in the Greek. So every marker gets an
   explicit sort key beside the number it prints — 625 -> 6250, 625a -> 6251 — which app.js reads in
   preference to the text (see `data-n` in bookSections). */
function lineSortKey(n) {
  const m = /^(\d+)([a-z]?)$/.exec(String(n == null ? "" : n).trim());
  if (!m) return null;
  return +m[1] * 10 + (m[2] ? m[2].charCodeAt(0) - 96 : 0);
}

/* The words of one element, keeping ONLY the stage directions set inside a spoken line — Jebb marks
   four of them that way ("He exits.", "She rushes into the palace."), and they are not spoken. Strip
   the tag and they read as part of the sentence the character is saying, which is the quiet kind of
   fault this file keeps meeting: nothing throws and the words are all present. */
function dramaText(s) {
  return s
    .replace(/<stage\b[^>]*>([\s\S]*?)<\/stage>/g, (m, t) => "<i>" + t.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() + "</i>")
    /* `sup` joins `i` in the keep list for the footnote marker dramaNotes has already put in — the
       whole point of lifting a note is that something is left behind pointing at it, and the sweep
       below would take the marker out again. TEI has no `<sup>` of its own, so nothing else can come
       through this door; measured over both columns of both plays, the only ones present are ours. */
    .replace(/<(?!\/?(?:i|sup)\b)[^>]*>/g, "")
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
const dramaPlain = (s) => s.replace(/<[^>]*>/g, "").replace(/&#160;|&nbsp;/g, " ").replace(/\s+/g, " ").trim();

/* ONE DIVISION'S NOTES, LIFTED OUT INTO THE FOLD — added Aug 2026 with the Medea, the second play
   here and the first whose edition annotates itself.

   The Oedipus Rex prints no notes at all, so the drama reader was written to STRIP them, with a line
   saying the rule stayed because the next edition's might not. It did: Coleridge's Medea carries 38,
   of which 37 stand inside the play's own divisions, and stripping them would have discarded the
   whole apparatus of a text that needs one — 29 are the translator's own notes on where he departs
   from the manuscripts and which conjecture he follows, and 8 are Perseus's on where this English
   parts company with the Greek's line numbering or its attribution of a line to a speaker. That is
   exactly the quiet fault this file keeps meeting: nothing throws, every line of the play is present,
   the counts all read as healthy, and only the notes are gone.

   THE MARKER IS EMPTY AND CARRIES ITS TARGET, which is the rule teiSectionProse sets out at length:
   the digit a reader sees is written by app.js from the list at render time, so re-ordering the notes
   can never strand a stale number in a line, and `data-fn` says which entry this one opens rather
   than trusting its position in reading order.

   A MARKER STANDING BETWEEN TWO LINES BELONGS TO THE LINE BEFORE IT, and without that rule seven of
   the 37 would be lifted into the fold with nothing left pointing at them. teiDramaBlocks walks the
   `<stage>` and `<l>` elements inside a speech and nothing else, so a note sitting in the gap after a
   `</l>` — which is where Perseus puts all seven of its own, each being about the line it follows —
   has its marker dropped on the floor while its text still reaches the list. The note would then be
   unreferenced, which app.js renders as an entry no sentence opens: the mirror of the dead marker the
   apparatus already refuses to draw. Measured over the whole play before this was written: all seven
   sit immediately after a closing line tag and none anywhere else, so the move is as narrow as the
   evidence, and teiDramaDivisions reports any note it still cannot find a marker for. */
function dramaNotes(raw, notes) {
  const out = raw.replace(/<note\b([^>]*)>([\s\S]*?)<\/note>/g, (whole, attrs, inner) => {
    const t = teiInline(inner);
    if (!t) return "";
    /* A note marked place="inline" is not a footnote — TEI's `place` says where the printed page puts
       it, and `inline` means the flow of the text rather than the foot of it. Lifting one into the
       fold would move it off the page it belongs on. The rule teiSectionProse learned on Suetonius;
       this play's one such note is its cast list, which stands ahead of the first division and is
       never reached, so the rule is here for the edition after this one. */
    if (/place="inline"/.test(attrs)) return " <i>" + t + "</i> ";
    notes.push(t);
    return '<sup class="fn" data-fn="' + notes.length + '"></sup>';
  });
  return out.replace(/<\/l>(\s*)(<sup class="fn" data-fn="\d+"><\/sup>)/g, "$2</l>$1");
}

/* The play's own divisions. This encoding marks a spoken scene `subtype="episode"` and a sung one
   `subtype="choral"`, and nests everything else INSIDE those — the strophe and antistrophe of each
   ode, and in the Greek two further marks the English does not carry. So selecting the two top-level
   names is the whole of the depth question, and needs no bracket counting.

   `opts.notes` lifts each division's notes into its own list rather than dropping them; see
   dramaNotes. It is off by default, which is what keeps the Oedipus Rex byte-identical and is also
   right for every ORIGINAL column: Folio folds notes under the translation alone, so a note lifted
   out of the Greek would have nowhere to go. The count dropped that way is reported rather than
   passed over, as the chaptered branch reports Herodotus's 83. */
function teiDramaDivisions(xml, warn, opts) {
  const O = opts || {};
  const body = xml.slice(xml.indexOf("<body"));
  if (body.length < 1000) throw new Error("no <body> in the TEI file");
  let b = body;
  if (!O.notes) b = b.replace(/<note\b[^>]*>[\s\S]*?<\/note>/g, "");
  // the editor's mark of spurious text, dropped with its words — the judgement teiProse and
  // teiVerseBooks both make, and for the same reason: what ships is the text the edition constitutes
  b = b.replace(/<del\b[^>]*>[\s\S]*?<\/del>/g, "");
  b = b.replace(/<head\b[^>]*>[\s\S]*?<\/head>/g, "");

  const rx = /<div\b[^>]*subtype="(episode|choral)"[^>]*>/gi;
  const marks = [];
  let m;
  while ((m = rx.exec(b))) marks.push({ kind: m[1].toLowerCase(), index: m.index });
  if (!marks.length) throw new Error("no episode or choral divisions in the TEI file");
  return marks.map((d, i) => {
    let raw = b.slice(d.index, i + 1 < marks.length ? marks[i + 1].index : b.length);
    const notes = [];
    if (O.notes) raw = dramaNotes(raw, notes);
    const blocks = teiDramaBlocks(raw, warn);
    const nums = [];
    blocks.forEach((x) => x.kind === "sp" && x.lines.forEach((l) => l.n && nums.push(l.n)));
    if (!nums.length) warn("a " + d.kind + " division carries no numbered line");
    /* A note that reached the list with no marker left pointing at it. app.js draws that as an entry
       nothing opens — the mirror of the dead marker the apparatus already refuses to draw — so it is
       reported here rather than shipped. See the note-position rule in dramaNotes. */
    if (notes.length) {
      const seen = new Set();
      blocks.forEach((x) => x.kind === "sp" && x.lines.forEach((l) =>
        [...String(l.text).matchAll(/data-fn="(\d+)"/g)].forEach((m) => seen.add(+m[1]))));
      const lost = notes.map((t, k) => k + 1).filter((k) => !seen.has(k));
      if (lost.length) warn("note " + lost.join(", ") + " of this division has no marker in the text");
    }
    return { kind: d.kind, blocks: blocks, notes: notes, from: nums[0] || null, last: nums[nums.length - 1] || null };
  });
}

/* One division's contents in reading order: a stage direction, or a speech with its speaker and its
   numbered lines. A <stage> occurs in THREE positions in this file and each means something slightly
   different — between the speeches (the scene changing), inside a speech but outside its lines (whom
   a character turns to address), and inside a single line (an exit mid-speech). All three were found
   by counting them against the file rather than by reading one scene: a scanner that walks only
   <sp> and <l> silently drops the first two kinds, and the loss is invisible in the finished page. */
function teiDramaBlocks(raw, warn) {
  const out = [];
  const rx = /<stage\b[^>]*>([\s\S]*?)<\/stage>|<sp\b[^>]*>([\s\S]*?)<\/sp>/g;
  let m;
  while ((m = rx.exec(raw))) {
    if (m[1] !== undefined) {
      const t = dramaPlain(m[1]);
      if (t) out.push({ kind: "stage", text: t });
      continue;
    }
    const sp = m[2];
    const who = /<speaker\b[^>]*>([\s\S]*?)<\/speaker>/.exec(sp);
    const lines = [];
    // <stage> first, so a direction standing BETWEEN two lines is kept; one standing inside a line is
    // reached by the <l> arm instead, since the alternation is tried at each position in turn
    const lr = /<stage\b[^>]*>([\s\S]*?)<\/stage>|<l\b([^>]*)>([\s\S]*?)<\/l>/g;
    let l;
    while ((l = lr.exec(sp))) {
      if (l[1] !== undefined) {
        const t = dramaPlain(l[1]);
        if (t) lines.push({ n: null, stage: true, text: t });
        continue;
      }
      const n = /\bn="([^"]*)"/.exec(l[2] || "");
      const t = dramaText(l[3]);
      if (n && lineSortKey(n[1]) === null) warn("line number " + n[1] + " is not a figure and an optional letter");
      if (t) lines.push({ n: n ? n[1].trim() : null, text: t });
    }
    if (lines.length) out.push({ kind: "sp", who: who ? dramaPlain(who[1]) : "", lines: lines });
  }
  return out;
}

/* One division's blocks, cut into the numbered sections app.js pairs the columns on.
   `bounds` is null for the translation, whose own stated numbers ARE the boundaries; for the original
   it is the translation's list, and each Greek line joins the boundary containing its own number. */
function dramaSections(blocks, bounds) {
  const keys = bounds ? bounds.map(lineSortKey).filter((k) => k !== null) : null;
  const labels = {};
  if (bounds) bounds.forEach((n) => { const k = lineSortKey(n); if (k !== null) labels[k] = n; });
  const out = [];
  let cur = null;
  const open = (n, key, who) => { cur = { kind: "sec", n: n, key: key, who: who || "", lines: [] }; out.push(cur); };
  blocks.forEach((b) => {
    if (b.kind === "stage") { out.push({ kind: "stage", text: b.text }); cur = null; return; }
    let first = true;
    b.lines.forEach((l) => {
      if (l.stage) { out.push({ kind: "stage", text: l.text }); cur = null; return; }
      const k = lineSortKey(l.n);
      if (k === null) { if (!cur) open(l.n, null, first ? b.who : ""); cur.lines.push(l.text); first = false; return; }
      if (!keys) {
        // the translation: every stated number opens a section of its own
        open(l.n, k, first ? b.who : "");
      } else {
        // the original: the boundary whose range contains this line's OWN number
        let b0 = null;
        for (const c of keys) { if (c <= k) b0 = c; else break; }
        if (b0 === null) b0 = keys[0];
        if (!cur || cur.key !== b0) open(labels[b0], b0, first ? b.who : "");
        else if (first && !cur.who) cur.who = b.who;
      }
      cur.lines.push(l.text);
      first = false;
    });
    cur = null;   // a speech does not run on into the next one
  });
  return out.filter((s) => s.kind === "stage" || s.lines.length);
}

/* The sections of one division as the chapter html. ONE marker per top-level block, which is the
   shape bookSections reads most simply: it splits a block at each marker, so a block carrying one
   needs no splitting at all. A speech's opening section wears the speaker's name and the rest of it
   are marked as continuations, or the second half of a long speech reads as nobody speaking.

   THE MARKER COMES FIRST IN THE BLOCK, BEFORE THE SPEAKER'S NAME, and that is not a matter of taste.
   bookSections walks a block's own child nodes and cuts at each marker, giving everything it has
   collected SO FAR to the section that is currently open. Put the name first and it is flushed ahead
   of its own number: the speaker of every speech is handed to the PREVIOUS section, so each name
   renders at the foot of the row above the words it introduces, and the first name in each part —
   having no previous section to fall into — opens an unnumbered one of its own that pairs with the
   Greek's and adds a phantom row to every part. It shipped that way for an hour and is the quiet kind
   of fault this file keeps meeting: every count still adds up (the rows were 698 for 683 sections, one
   too many per part), no text is lost, and only a reader looking at who says what would see it. */
function dramaHtml(sections) {
  return sections
    .map((s) => {
      if (s.kind === "stage") return '<p class="bk-stage">' + s.text + "</p>";
      const mark = s.key === null ? "" :
        '<span class="bk-n" data-n="' + s.key + '">' + s.n + "</span>";
      const who = s.who ? '<b class="bk-who">' + s.who + "</b>" : "";
      return '<p class="bk-sp' + (s.who ? "" : " bk-cont") + '">' + mark + who +
        (mark || who ? " " : "") + s.lines.join("<br>") + "</p>";
    })
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
/* `langName` is the original's own language, because this function stopped being Latin-only when the
   Iliad arrived (Aug 2026) and a run that reports "Latin card 383 → 381" over a column of Greek is
   telling the reader something untrue about what it just did. It defaults to Latin so Ovid's and
   Lucretius's output is unchanged to the character. */
function reconcileCards(enBooks, laBooks, warn, log, langName) {
  const L_ = langName || "Latin";
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
        log("    book " + k + ": " + L_ + " card " + L[j].n + " → " + E[i].n +
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
    unEN + " English and " + unLA + " " + L_ + " left unpaired (they draw as an empty cell).");
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
      /* `subtype` is threaded through here for the same reason the ORIGINAL side already threads it
         (see the note in teiSections): which word an edition uses for its numbered unit is the
         edition's business, and Suetonius says `chapter` where Burnet's and the Loeb Plato say
         `section`. It defaults to "chapter" inside teiSections, so the twelve lives are untouched. */
      const got = teiSections(xml, {
        subtype: BOOK.subtype,
        renumber: (s) => (BOOK.renumber ? BOOK.renumber(s, n) : s),
      }, warn);
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

  if (BOOK.source === "tei" && BOOK.layout === "drama") {
    const warn = (m) => warnings.push(m);
    const cf = path.join(CACHE, "en-tei.xml");
    let xml;
    if (!FORCE && fs.existsSync(cf)) xml = fs.readFileSync(cf, "utf8");
    else { xml = await fetchText(BOOK.url); fs.writeFileSync(cf, xml); }
    /* Notes are LIFTED on the translation side, which is the only side Folio can fold them under.
       The Oedipus Rex's edition prints none, so this changes nothing there; Coleridge's Medea prints
       38 and would otherwise lose the lot in silence. See dramaNotes. */
    const divs = teiDramaDivisions(xml, warn, { notes: true });
    if (divs.length !== BOOK.chapters.length)
      warn("the edition divides the play into " + divs.length + " parts; the entry expects " + BOOK.chapters.length);
    divs.forEach((d, i) => {
      const n = i + 1;
      if (n < FROM || n > TO) return;
      const secs = dramaSections(d.blocks, null);
      const html = dramaHtml(secs);
      if (html.length < 200) throw new Error("part " + n + " came back short (" + html.length + " chars)");
      /* The title is the division's OWN name in this encoding — a spoken `episode` or a sung
         `choral` — with the lines it covers, which is how anyone navigates a play and is stated by
         the file rather than composed here. The end is the line before the next division opens, and
         for the last it is the play's own last line. Deliberately NOT the conventional prologue /
         parodos / stasimon / exodos: those are the standard analysis of a tragedy's shape and are
         genuinely useful, but this edition does not use them — it calls its opening division an
         episode where the convention calls it the prologue — so printing them here would be
         composing an apparatus over the top of the one the file states. Said in the front matter. */
      const to = i + 1 < divs.length
        ? String(+String(divs[i + 1].from).replace(/\D/g, "") - 1)
        : String(d.last);
      const t = (d.kind === "choral" ? "Choral ode" : "Episode") + ", lines " + d.from + "–" + to;
      const marks = secs.filter((s) => s.kind === "sec").length;
      const stage = secs.filter((s) => s.kind === "stage").length;
      chapters.push({ n: n, t: t, p: partOf(n), html: html, notes: d.notes });
      console.log("  Part " + n + " — " + t + ": " + marks + " sections, " +
        secs.filter((s) => s.kind === "sec").reduce((a, s) => a + s.lines.length, 0) + " lines, " +
        stage + " stage direction(s), " + d.notes.length + " note(s) (" +
        (html.length / 1024).toFixed(0) + " KB)");
    });
    return writeEnglish(chapters, warnings);
  }

  /* A PROSE WORK IN BOOKS OF NUMBERED CHAPTERS — see teiBookChapters. One fetch for the whole
     history, cached whole, so --from/--to cost nothing and a re-extract needs no network at all. */
  if (BOOK.source === "tei" && BOOK.layout === "chaptered") {
    const warn = (m) => warnings.push(m);
    const cf = path.join(CACHE, "en-tei.xml");
    let xml;
    if (!FORCE && fs.existsSync(cf)) xml = fs.readFileSync(cf, "utf8");
    else { xml = await fetchText(BOOK.url); fs.writeFileSync(cf, xml); }
    const books = teiBookChapters(xml, {}, warn);
    for (const n of BOOK.chapters) {
      if (n < FROM || n > TO) continue;
      const got = books[n];
      if (!got) { warn(BOOK.chapterWord + " " + n + " is missing from the edition"); continue; }
      if (got.html.length < 200) throw new Error("chapter " + n + " came back short (" + got.html.length + " chars)");
      chapters.push({ n: n, t: titles[n] || chapterTitle(n), p: partOf(n), html: got.html, notes: got.notes });
      console.log("  " + BOOK.chapterWord + " " + n + " — " + got.chapters + " chapters, " +
        got.notes.length + " notes (" + (got.html.length / 1024).toFixed(0) + " KB)");
      // AFTER the line naming the book, or the reader attributes the skips to the book above — which
      // is exactly how the 45 lettered chapters were first mis-read as belonging to the wrong books
      if (got.skipped.length) console.log("    skipped non-chapter division(s): " + got.skipped.join(", "));
    }
    return writeEnglish(chapters, warnings);
  }

  if (BOOK.source === "tei") {
    const warn = (m) => warnings.push(m);
    const cf = path.join(CACHE, "en-tei.xml");
    let xml;
    if (!FORCE && fs.existsSync(cf)) xml = fs.readFileSync(cf, "utf8");
    else { xml = await fetchText(BOOK.url); fs.writeFileSync(cf, xml); }
    const got = teiVerseBooks(xml, { cards: BOOK.cards, prose: BOOK.cardProse }, warn);
    const books = got.books;
    /* Said out loud, every run. This edition's apparatus is dropped rather than folded under the
       chapter, and on the Iliad that is 144 markers whose note TEXT Perseus never transcribed — each
       <note> holds a bare reference number and nothing else, so lifting them would build a fold of
       144 entries reading "1", "2", "161.1". A book that silently ships thinner than its source is
       the fault this line exists to prevent; the book's own front matter says the same thing. */
    if (got.dropped) console.log("  dropped " + got.dropped +
      " note(s) — this edition's apparatus is not folded under the chapters");
    /* Said out loud for the same reason: a repair the reader cannot see is one nobody re-measures. */
    if (got.lifted) console.log("  lifted " + got.lifted +
      " mid-line card mark(s) to the nearest line boundary, keeping the line whole");
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

  /* A PLAY ON ONE TRANSCRIBED PAGE — the Song of Roland's caching exactly, and for the same reason:
     one page holds the whole work, so it is cached whole and --from/--to cost nothing. See
     extractPlay for why a wiki drama needs a reader of its own. */
  if (BOOK.layout === "play") {
    const warn = (m) => warnings.push(m);
    const cf = path.join(CACHE, "en-page.html");
    let h;
    if (!FORCE && fs.existsSync(cf)) h = fs.readFileSync(cf, "utf8");
    else { h = await api(BOOK.onePage); fs.mkdirSync(CACHE, { recursive: true }); fs.writeFileSync(cf, h); }
    const got = extractPlay(h, BOOK, warn);
    if (got.length !== BOOK.chapters.length)
      warn("the cut yields " + got.length + " parts; the entry expects " + BOOK.chapters.length);
    got.forEach((c) => {
      if (c.n < FROM || c.n > TO) return;
      if (c.html.length < (BOOK.minChars || 200))
        throw new Error(BOOK.chapterWord + " " + c.n + " came back short (" + c.html.length + " chars)");
      chapters.push({ n: c.n, t: titles[c.n] || c.t, p: partOf(c.n), html: c.html, notes: c.notes });
      console.log("  " + BOOK.chapterWord + " " + c.n + " — " + c.t + ": " +
        (c.html.match(/class="bk-who"/g) || []).length + " speeches, " + c.notes.length + " notes (" +
        (c.html.length / 1024).toFixed(0) + " KB)");
    });
    return writeEnglish(chapters, warnings);
  }

  /* A POEM IN LAISSES — one transcribed page holding every chapter, cut rather than walked. The page
     is cached whole, exactly as a TEI file is, so --from/--to cost nothing and a re-extract needs no
     network at all; --force refetches it. `chapters` is filtered afterwards rather than before,
     because the cut has to see the whole sequence to number it. */
  /* A POEM IN FITTS — the ordinary wiki walk, one page per chapter, with the pairing done a level
     BELOW the chapter: see the FITTS block above extractFitt for why the line number rather than the
     fitt is what the two columns are set against, and for the six misprinted numerals it repairs. */
  if (BOOK.layout === "fitts") {
    for (const n of BOOK.chapters) {
      if (n < FROM || n > TO) continue;
      const where = BOOK.chapterWord + " " + n;
      const warn = (m) => warnings.push(m);
      const cf = path.join(CACHE, "en-" + String(n).padStart(2, "0") + ".html");
      let h;
      if (!FORCE && fs.existsSync(cf)) h = fs.readFileSync(cf, "utf8");
      else { h = await api(BOOK.page(n)); fs.writeFileSync(cf, h); await sleep(900); }
      const got = extractFitt(h, warn, where);
      if (got.html.length < (BOOK.minChars || 200))
        throw new Error(where + " came back short (" + got.html.length + " chars)");
      chapters.push({ n: n, t: titles[n] || chapterTitle(n), p: partOf(n), html: got.html, notes: got.notes });
      console.log("  " + where + ": " + got.marks + " line numbers, " + got.notes.length + " notes (" +
        (got.html.length / 1024).toFixed(1) + " KB)");
    }
    const lines = chapters.reduce((a, c) => a + (c.html.match(/<br>/g) || []).length + 1, 0);
    console.log("  " + chapters.length + " " + BOOK.chapterWord.toLowerCase() + "s, " + lines + " lines");
    return writeEnglish(chapters, warnings);
  }

  /* A POEM IN TERCETS, NUMBERED BY COUNTING — the ordinary wiki walk, one page per canto. See the
     block above extractTerzina for why the numbers here are counted rather than read, and for the
     measurements that make counting safe. */
  if (BOOK.layout === "terzine") {
    let lines = 0, printed = 0, bad = 0, heads = 0, notes = 0;
    const dropped = [];
    for (const n of BOOK.chapters) {
      if (n < FROM || n > TO) continue;
      const where = chapterTitle(n);
      const warn = (m) => warnings.push(m);
      const cf = path.join(CACHE, "en-" + String(n).padStart(3, "0") + ".html");
      let h;
      if (!FORCE && fs.existsSync(cf)) h = fs.readFileSync(cf, "utf8");
      else {
        h = await api(BOOK.page(n));
        fs.mkdirSync(CACHE, { recursive: true });
        fs.writeFileSync(cf, h);
        await sleep(900);
      }
      const got = extractTerzina(h, where, warn);
      if (got.html.length < (BOOK.minChars || 200))
        throw new Error(where + " came back short (" + got.html.length + " chars)");
      lines += got.lines; printed += got.printed; bad += got.bad;
      heads += got.heads; notes += got.notes.length;
      if (got.before) dropped.push(where + ": " + JSON.stringify(got.before.slice(0, 70)));
      chapters.push({ n: n, t: titles[n] || chapterTitle(n), p: partOf(n), html: got.html, notes: got.notes });
    }
    const marks = chapters.reduce((a, c) => a + (c.html.match(/class="bk-n"/g) || []).length, 0);
    console.log("  " + chapters.length + " " + BOOK.chapterWord.toLowerCase() + "s, " + lines +
      " lines, " + marks + " tercet numbers, " + notes + " note(s)");
    /* THE FIGURE THIS BOOK IS ABOUT, printed on every run. The numbers are counted, so what says
       the count is right is how often the printed numerals agree with it — and a change in either
       figure means the marker has stopped being recognised in one of the two transcription shapes,
       which no other check here can see (the poem would still be complete and the columns would
       still be the same length). */
    console.log("  " + printed + " printed numerals checked against the count, " +
      (printed - bad) + " agreeing, " + bad + " misprinted");
    console.log("  " + heads + " canticle and canto headings dropped from inside the body");
    /* A rule that removes text says what it removed. These are the plate captions of the Blake
       engravings bound into the volume — the Republic's precedent for the plates it left behind. */
    if (dropped.length) console.log("  " + dropped.length +
      " page(s) carried text before the verse, dropped: " + dropped.join("; "));
    return writeEnglish(chapters, warnings);
  }

  /* A COLLECTION OF POEMS IN NUMBERED STANZAS — the ordinary wiki walk, one page per poem, with the
     pairing done a level BELOW the chapter as it is for a poem in fitts. What is different is that a
     chapter's body is verse and prose MIXED; see the block comment above extractEdda for why no
     earlier verse reader here could take it, and for the line-number float that holds a footnote
     marker rather than a line number. */
  if (BOOK.layout === "eddapoem") {
    let stanzas = 0;
    for (const n of BOOK.chapters) {
      if (n < FROM || n > TO) continue;
      const t = titles[n] || chapterTitle(n);
      const where = BOOK.chapterWord + " " + n + " (" + t + ")";
      const warn = (m) => warnings.push(m);
      const cf = path.join(CACHE, "en-" + String(n).padStart(2, "0") + ".html");
      let h;
      if (!FORCE && fs.existsSync(cf)) h = fs.readFileSync(cf, "utf8");
      else { h = await api(BOOK.page(n)); fs.mkdirSync(CACHE, { recursive: true }); fs.writeFileSync(cf, h); await sleep(1200); }
      const got = extractEdda(h, t, warn, where, (BOOK.prose || []).includes(n));
      if (got.html.length < (BOOK.minChars || 200))
        throw new Error(where + " came back short (" + got.html.length + " chars)");
      chapters.push({ n: n, t: t, p: partOf(n), html: got.html, notes: got.notes });
      stanzas += got.marks;
      console.log("  " + where + ": " + got.marks + " stanzas, " + got.notes.length + " notes (" +
        (got.html.length / 1024).toFixed(1) + " KB)");
    }
    const lines = chapters.reduce((a, c) => a + (c.html.match(/<br>/g) || []).length, 0);
    console.log("  " + chapters.length + " poems, " + stanzas + " stanza numbers, " + lines + " verse lines");
    return writeEnglish(chapters, warnings);
  }

  if (BOOK.layout === "laisses") {
    const warn = (m) => warnings.push(m);
    const cf = path.join(CACHE, "en-page.html");
    let h;
    if (!FORCE && fs.existsSync(cf)) h = fs.readFileSync(cf, "utf8");
    else { h = await api(BOOK.onePage); fs.writeFileSync(cf, h); }
    const got = extractLaisses(h, BOOK, warn);
    if (got.length !== BOOK.chapters.length)
      warn("the edition carries " + got.length + " laisses; the entry expects " + BOOK.chapters.length);
    got.forEach((c) => {
      if (c.n < FROM || c.n > TO) return;
      if (c.html.length < (BOOK.minChars || 200))
        throw new Error("laisse " + c.n + " came back short (" + c.html.length + " chars)");
      chapters.push({ n: c.n, t: titles[c.n] || chapterTitle(c.n), p: partOf(c.n), html: c.html, notes: [] });
    });
    const lines = chapters.reduce((a, c) => a + (c.html.match(/<br>/g) || []).length + 1, 0);
    console.log("  " + chapters.length + " laisses, " + lines + " lines");
    return writeEnglish(chapters, warnings);
  }

  /* A WHOLE BOOK ON ONE PAGE FROM A HOST THAT IS NOT A WIKI — see the block above extractTablets for
     why this book needs a third source at all and what was measured before it was chosen. One
     request for the lot, cached exactly as a TEI file is: --from/--to cost nothing, a re-extract
     needs no network, and the site is asked once rather than once per tablet. */
  /* A WHOLE BOOK IN ONE PLAIN-TEXT FILE — see the block above extractJourney for why this book has
     no markup to read and what the reader has to build instead. One request for the lot, cached like
     a TEI file, so --from/--to cost nothing and a re-extract needs no network. */
  if (BOOK.layout === "journey") {
    const warn = (m) => warnings.push(m);
    const cf = path.join(CACHE, "en-text.txt");
    let raw;
    if (!FORCE && fs.existsSync(cf)) raw = fs.readFileSync(cf, "utf8");
    else { raw = await fetchText(BOOK.url); fs.mkdirSync(CACHE, { recursive: true }); fs.writeFileSync(cf, raw); }
    const got = extractJourney(raw, BOOK, warn);
    if (got.chapters.length !== BOOK.chapters.length)
      warn("the transcription carries " + got.chapters.length + " chapters; the entry expects " +
        BOOK.chapters.length);
    got.repairs.forEach((r) => warn("malformed chapter numeral, " + r));
    got.chapters.forEach((c) => {
      if (c.n < FROM || c.n > TO) return;
      if (c.html.length < (BOOK.minChars || 200))
        throw new Error(BOOK.chapterWord + " " + c.n + " came back short (" + c.html.length + " chars)");
      chapters.push({ n: c.n, t: titles[c.n] || c.t || chapterTitle(c.n), p: partOf(c.n), html: c.html, notes: [] });
    });
    console.log("  " + chapters.length + " chapters, " + got.heads + " running heads removed, " +
      got.joins + " paragraphs rejoined across a page break, " + got.verseBlocks + " verse blocks" +
      (got.lateHeads ? " (" + got.lateHeads + " of the heads the OCR split in two, caught as blocks)" : ""));
    /* THE ONE FIGURE THIS BOOK IS ABOUT. Richard condenses most of the novel and marks the chapters
       he condensed himself, so this count is the single most important thing a reader can be told
       about the text — and a change in it means the mark has stopped being recognised, which is how
       every one of the four OCR shapes below was found. Printed on every run for both reasons. */
    console.log("  " + got.outlines + " of " + got.chapters.length +
      " chapters carry Richard's own [outline.] mark — " + (got.chapters.length - got.outlines) +
      " are translated at length: " +
      got.chapters.filter((c) => !c.outline).map((c) => c.n).join(", "));
    console.log("  the mark is printed " + got.marks.length + " different ways by the OCR: " +
      got.marks.slice(0, 8).join(" ") + (got.marks.length > 8 ? " …" : ""));
    return writeEnglish(chapters, warnings);
  }

  /* THE CANTERBURY TALES — a plain-text OCR of one volume, of which this book is the first sixth. One
     request for the lot, cached like a TEI file, so --from/--to cost nothing and a re-extract needs no
     network at all. See the block above extractChaucer for what a text with no markup has to be given
     instead of tags. */
  if (BOOK.layout === "chaucer") {
    const warn = (m) => warnings.push(m);
    const cf = path.join(CACHE, "en-text.txt");
    let raw;
    if (!FORCE && fs.existsSync(cf)) raw = fs.readFileSync(cf, "utf8");
    else { raw = await fetchText(BOOK.url); fs.mkdirSync(CACHE, { recursive: true }); fs.writeFileSync(cf, raw); }
    const got = extractChaucer(raw, BOOK, warn);
    if (got.chapters.length !== BOOK.chapters.length)
      warn("the transcription yields " + got.chapters.length + " tales; the entry expects " + BOOK.chapters.length);
    got.chapters.forEach((c) => {
      if (c.n < FROM || c.n > TO) return;
      if (c.html.length < (BOOK.minChars || 200))
        throw new Error(BOOK.chapterWord + " " + c.n + " came back short (" + c.html.length + " chars)");
      chapters.push({ n: c.n, t: titles[c.n] || c.t, p: partOf(c.n), html: c.html, notes: [] });
    });
    const headCount = Object.values(got.heads).reduce((a, b) => a + b, 0);
    console.log("  " + chapters.length + " tales, " + headCount + " running heads and plate captions removed (" +
      Object.keys(got.heads).length + " distinct), " + got.pages + " page numbers, " +
      got.hyphens + " words rejoined across the printer's line wrap, " +
      got.joins + " paragraphs rejoined across a page turn, " + got.rubrics + " rubrics");
    /* Named rather than counted, because this is the one sweep here that could eat a heading: every
       distinct line of capitals the page-furniture rule removed, and every block of scanner dirt. */
    console.log("  heads removed: " + Object.keys(got.heads).sort().map((k) => JSON.stringify(k)).join(" "));
    if (got.junk.length) console.log("  " + got.junk.length + " block(s) of scanner dirt dropped: " +
      got.junk.map((s) => JSON.stringify(s.slice(0, 24))).join(" "));
    /* THE FIGURE THIS TRANSLATION IS ABOUT. The editors drop whole episodes they thought too coarse
       and mark each with a row of asterisks; a change in this count means the mark has stopped being
       recognised, which is how the five forms below were found. Printed for both reasons. */
    console.log("  " + got.gaps + " passage(s) the translators omit and mark with asterisks, in " +
      got.chapters.filter((c) => c.gaps).map((c) => c.t).join(", "));
    console.log("  the mark is printed " + got.rawGaps.length + " different ways by the scan: " +
      got.rawGaps.map((s) => JSON.stringify(s)).join(" "));
    return writeEnglish(chapters, warnings);
  }

  if (BOOK.layout === "tablets") {
    const warn = (m) => warnings.push(m);
    const cf = path.join(CACHE, "en-page.html");
    let h;
    if (!FORCE && fs.existsSync(cf)) h = fs.readFileSync(cf, "utf8");
    else { h = await fetchText(BOOK.url); fs.mkdirSync(CACHE, { recursive: true }); fs.writeFileSync(cf, h); }
    const got = extractTablets(h, BOOK, warn);
    let notes = 0, cols = 0, marks = 0;
    got.forEach((c) => {
      if (c.n < FROM || c.n > TO) return;
      if (c.html.length < (BOOK.minChars || 200))
        throw new Error(BOOK.chapterWord + " " + c.n + " came back short (" + c.html.length + " chars)");
      notes += c.notes.length; cols += c.cols;
      marks += (c.html.match(/class="bk-n"/g) || []).length;
      chapters.push({ n: c.n, t: titles[c.n] || c.t, p: partOf(c.n), html: c.html, notes: c.notes });
      console.log("  " + BOOK.chapterWord + " " + c.n + " — " + c.t +
        " (" + c.html.length + " chars, " + c.cols + " columns, " + c.notes.length + " notes)");
    });
    const lines = chapters.reduce((a, c) => a + (c.html.match(/<br>/g) || []).length + 1, 0);
    console.log("  " + chapters.length + " tablets, " + lines + " lines, " +
      cols + " columns, " + marks + " line numbers, " + notes + " notes");
    return writeEnglish(chapters, warnings);
  }

  /* The endnote table, fetched ONCE for the whole book rather than per chapter — it is one page at the
     back of the volume and every chapter's markers point into it. Cached beside the chapters, so a
     resumed or a --from/--to run costs no extra request; --force refetches it with everything else. */
  let endnotes = null;
  if (BOOK.endnotes) {
    const ef = path.join(CACHE, "endnotes.json");
    if (!FORCE && fs.existsSync(ef)) endnotes = JSON.parse(fs.readFileSync(ef, "utf8"));
    else {
      const eh = await api(BOOK.endnotes.page);
      endnotes = endnoteTable(eh, (m) => warnings.push("endnotes: " + m));
      if (!Object.keys(endnotes).length) throw new Error("no endnotes found on " + BOOK.endnotes.page);
      fs.writeFileSync(ef, JSON.stringify(endnotes));
      await sleep(700);
    }
    console.log("  " + Object.keys(endnotes).length + " endnotes read from " + BOOK.endnotes.page);
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
    /* A CHAPTER MAY BE PRINTED ACROSS MORE THAN ONE WIKI PAGE (Aug 2026, adding the Book of
       Documents). Every earlier book here is one page to one chapter, and `page(n)` returned a
       string. Where Legge prints a book in sections, Wikisource gives each section its own page and
       leaves the book's HEADNOTE — several paragraphs on who is speaking, when, and what the
       document is for, and in Part V an introduction to the whole Part — on the book's page, which
       carries no body text at all. Fetching only the sections would drop that prose on the floor;
       giving it a chapter of its own would put an empty tab on the bar, since one of the four books
       carries a title and nothing else.

       So `page(n)` may return an ARRAY, and the pages are cleaned in order and joined. Returning a
       string still means exactly what it always did, so no shipped book's config is touched. */
    const pageNames = [].concat(BOOK.page(n));
    const warn = (m) => warnings.push(BOOK.chapterWord + " " + n + ": " + m);
    const h = applyGlyphs(await api(pageNames[0]));
    let html, notes, orig = "", tFromText = "";
    if (BOOK.layout === "parallel" || BOOK.layout === "interleaved" || BOOK.layout === "shloka") {
      /* Both columns come off this one page, so the original is extracted here too and cached beside
         the translation — fetchOriginal then costs no requests at all. The two shapes a facing-page
         edition is transcribed in take different extractors; see the Analects entry for what
         separates them. */
      const got = bothColumns(h, BOOK, warn);
      html = got.html; notes = got.notes; orig = got.orig;
      /* A title the EXTRACTOR read off the text, for an edition that names its chapters in its own
         closing formula rather than on a contents page. It yields to `titles[n]`, so a title stated
         in this file still wins; see the Gita entry, and `titleOf` in the Meditations' for the rule
         that a title is transcribed and never composed. */
      tFromText = got.t || "";
    } else {
      const got = notesOf(h);
      const keep = endnotes && got.notes.length ? resolveEndnotes(got, endnotes, warn) : null;
      notes = got.notes;
      /* Which book this page is supposed to BE, for the one marker rule that can check (see
         `sections: "bookchapter"` in cleanBody — Thucydides' chapter marks carry the book number as
         well as the chapter). Set only for that shape, so no other book's config is touched. */
      if (BOOK.sections === "bookchapter") BOOK.expect = n;
      /* The number the single whole-chapter marker carries — the same channel `expect` uses, and
         set per chapter for the same reason: cleanBody is handed the book, not the chapter. */
      if (BOOK.sections === "whole") BOOK.mark = n;
      /* WHICH SECTION THIS PAGE IS SUPPOSED TO CARRY, on a book whose chapter is spread over many
         pages and whose sections are one to a page (Aug 2026, adding The City of God). The same
         channel `expect` already uses for a chapter mark that names its own book, set per PAGE here
         rather than per chapter because that is the grain the number arrives at. A book with no
         `pageMark` leaves it null and every rule that reads it goes on behaving exactly as it did. */
      if (BOOK.pageMark) BOOK.expect = BOOK.pageMark(pageNames[0]);
      const multi = pageNames.length > 1;
      html = cleanBody(h, got.ids, BOOK, multi ? (m) => { if (!/^no section numbers found/.test(m)) warn(m); } : warn);
      if (keep) html = pruneNotes(html, keep);
      /* THE REST OF A MULTI-PAGE CHAPTER. Each page is cleaned against its OWN note list, so the
         second page's markers count from 1 again and would open the first page's notes. `data-fn` is
         a one-based index into the chapter's notes, so every marker after the first page is shifted
         by the number of notes already gathered — which is the Seneca lesson (a marker must carry the
         note it points AT) applied across a join rather than across a reused note.

         Measured on the book that introduced this: the four pages joined here carry no notes at all,
         so the offset is provably zero on every chapter that uses it today. It is written anyway,
         because a silent mis-numbering is exactly what this file keeps finding, and the arithmetic is
         four lines. */
      /* THE "no section numbers" WARNING IS A PROPERTY OF THE CHAPTER, NOT OF THE PAGE, and on a
         multi-page chapter the per-page one is worse than useless: the book's own page carries a
         headnote and no numbered text, so it fires on every such chapter whether or not the sections
         that follow are numbered — three false alarms out of four, which is how a real one comes to
         be scrolled past. So it is swallowed while the pages are being read and asked once at the
         end, of the assembled chapter. */
      const quiet = (m) => { if (!/^no section numbers found/.test(m)) warn(m); };
      for (const extra of pageNames.slice(1)) {
        await sleep(700);
        if (BOOK.pageMark) BOOK.expect = BOOK.pageMark(extra);
        const eh = applyGlyphs(await api(extra));
        const eg = notesOf(eh);
        const ekeep = endnotes && eg.notes.length ? resolveEndnotes(eg, endnotes, warn) : null;
        let ehtml = cleanBody(eh, eg.ids, BOOK, quiet);
        if (ekeep) ehtml = pruneNotes(ehtml, ekeep);
        const off = notes.length;
        if (off) {
          ehtml = ehtml.replace(
            /<sup class="fn" data-fn="(\d+)"><\/sup>/g,
            (m, d) => '<sup class="fn" data-fn="' + (+d + off) + '"></sup>'
          );
        }
        html += "\n" + ehtml;
        notes = notes.concat(eg.notes);
      }
      if (multi && BOOK.sections && !/class="bk-n"/.test(html))
        warn("no section numbers found — the chapter will pair as one whole block");
    }
    /* THE FLOOR IS PER BOOK, because 200 characters is a broken chapter in every book here except
       one (Aug 2026, adding Aesop's Fables). This guard is what catches an extraction that has
       quietly returned the wiki furniture instead of the text, and 200 has been a safe floor while
       a chapter meant a book of Herodotus or a letter of Seneca. A fable is one paragraph: fable
       123, The Wolf and the Shepherds, is 191 characters and is complete — checked against the
       source page rather than assumed, since a short chapter is exactly what a truncation looks
       like. Lowering the floor for everybody would blunt the guard on the fourteen books that
       need it, so the book that needs a different one says so and the default is unchanged. */
    const floor = BOOK.minChars || 200;
    if (html.length < floor) throw new Error("chapter " + n + " came back short (" + html.length + " chars)");
    const rec = { n, t: titles[n] || tFromText || chapterTitle(n), p: partOf(n), html, notes };
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
  if (BOOK.layout === "parallel" || BOOK.layout === "interleaved" || BOOK.layout === "shloka") {
    console.log("\nReading the " + O.langName + " original out of the parallel text — " +
      BOOK.chapters.length + " chapters");
    for (const n of BOOK.chapters) {
      const cf = path.join(CACHE, n + ".json");
      let rec = !FORCE && fs.existsSync(cf) ? JSON.parse(fs.readFileSync(cf, "utf8")) : null;
      if (!rec || !rec.orig) {
        const h = await api(BOOK.page(n));
        const got = bothColumns(h, BOOK, (m) => warn(BOOK.chapterWord + " " + n + ": " + m));
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
  /* AN ORIGINAL THAT IS ALSO PLAIN TEXT, and the only one on this shelf. Skeat's Middle English is a
     proofread transcription of a critical edition rather than a machine reading, so the difficulty is
     not damage but APPARATUS — see the block above extractSkeat. One file, cached whole, so a
     re-extract needs no network; --force refetches it. */
  if (O.source === "text" && O.layout === "skeat") {
    console.log("\nFetching the " + O.langName + " original — " + O.edition);
    const cf = path.join(cacheDir, "text.txt");
    let raw;
    if (!FORCE && fs.existsSync(cf)) raw = fs.readFileSync(cf, "utf8");
    else { raw = await fetchText(O.url); fs.writeFileSync(cf, raw); }
    const got = extractSkeat(raw, warn);
    console.log("  " + got.apparatus + " blocks of variant readings dropped, " + got.verseOpeners +
      " four-indent blocks kept as verse, " + got.pageMarks + " page markers, " + got.rules +
      " printer's rules, " + got.groups + " fragment labels, " + got.sideNotes +
      " marginal summaries, " + got.lineNums + " marginal line numbers, " + got.tyrwhitt +
      " marginal references to Tyrwhitt, " + got.crossRefs + " cross-references to another page, " +
      got.heads + " tale headings (each duplicates its own tab)");
    console.log("  " + got.verseLines + " lines of verse, " + got.rubrics + " rubrics");
    got.chapters.forEach((c) => {
      if (c.n < FROM || c.n > TO) return;
      if (c.html.length < (O.minChars || 200))
        throw new Error(BOOK.chapterWord + " " + c.n + " came back short (" + c.html.length + " chars)");
      /* The same single marker the translation carries, and it must be written on BOTH sides or the
         two columns have nothing to pair on. */
      byNum[c.n] = BOOK.sections === "whole"
        ? '<p><span class="bk-n" data-n="' + c.n + '">' + c.n + "</span></p>" + c.html
        : c.html;
    });
    return writeOriginal(byNum, warnings);
  }

  if (O.source === "tei" && O.perChapter) {
    console.log("\nFetching the " + O.langName + " original — " + O.edition);
    for (const n of BOOK.chapters) {
      if (n < FROM || n > TO) continue;
      const w = (m) => warn(BOOK.chapterWord + " " + n + ": " + m);
      const cf = path.join(cacheDir, "tei-" + n + ".xml");
      let xml;
      if (!FORCE && fs.existsSync(cf)) xml = fs.readFileSync(cf, "utf8");
      else { xml = await fetchText(O.url(n)); fs.writeFileSync(cf, xml); await sleep(500); }
      const got = teiSections(xml, { subtype: O.subtype }, w);
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
      const enBooks = teiVerseBooks(enXml, { cards: BOOK.cards, prose: BOOK.cardProse }, warn).books;
      const laGot = teiVerseBooks(xml, { cards: O.cards, prose: O.cardProse }, warn);
      const laBooks = laGot.books;
      /* The original's notes have nowhere to go — Folio folds notes under the translation alone — so
         they are dropped and the count printed, exactly as the drama branch prints Herodotus's 83.
         Monro and Allen's Greek carries one, recording that the edition omits Iliad 9.458–461. */
      if (laGot.dropped) console.log("  dropped " + laGot.dropped + " note(s) from the " +
        O.langName + " — the reader folds notes under the translation alone");
      console.log("  reconciling the two columns' section numbers:");
      reconcileCards(enBooks, laBooks, warn, (m) => console.log(m), O.langName);
      Object.keys(laBooks).forEach((n) => { byNum[n] = teiVerseHtml(laBooks[n]); });
      return writeOriginal(byNum, warnings);
    }

    /* A PLAY pairs on the LINE NUMBER, and the two columns state it at different grain — Storr's
       Greek numbers every line, Jebb's prose numbers the line each block begins at. So the
       translation's numbers are the boundaries and each Greek line joins the one containing its own
       number; see the drama block above for why that is not the Meditations' mistake. The English
       side is read back out of its own cached TEI, so an --only-original run pairs against exactly
       the file that shipped — the same discipline the verse branch above follows. */
    if (O.layout === "drama") {
      const enCache = path.join(CACHE, "en-tei.xml");
      let enXml;
      if (fs.existsSync(enCache)) enXml = fs.readFileSync(enCache, "utf8");
      else { enXml = await fetchText(BOOK.url); fs.writeFileSync(enCache, enXml); }
      /* Neither call lifts notes. On the English side only the line NUMBERS are read here — the
         boundaries the Greek is cut against — and the text that ships was written by the English pass,
         which does lift them. On the Greek side there is nowhere to put one: Folio folds notes under
         the translation alone, so the original's are dropped, and the count is printed rather than
         passed over in silence, exactly as the chaptered branch prints Herodotus's 83. */
      const en = teiDramaDivisions(enXml, warn);
      const or = teiDramaDivisions(xml, warn);
      const orNotes = (xml.slice(xml.indexOf("<body")).match(/<note\b/g) || []).length;
      if (orNotes) console.log("  dropped " + orNotes + " note(s) from the " + O.langName +
        " — the reader folds notes under the translation alone");
      if (en.length !== or.length)
        warn("the two editions divide the play differently — " + en.length + " parts against " + or.length);
      /* The divisions must open on the SAME LINE on both sides, or the two columns are being paired
         part for part by their position in a list, which is the one thing this must never do. Checked
         rather than assumed: all fifteen agree. */
      let paired = 0, empty = 0;
      or.forEach((d, i) => {
        const e = en[i];
        if (!e) { warn("part " + (i + 1) + " has no counterpart in the translation"); return; }
        if (String(e.from) !== String(d.from))
          warn("part " + (i + 1) + " opens at line " + e.from + " in the translation and " + d.from + " in the original");
        const bounds = [];
        e.blocks.forEach((b) => b.kind === "sp" && b.lines.forEach((l) => l.n && bounds.push(l.n)));
        const secs = dramaSections(d.blocks, bounds);
        byNum[i + 1] = dramaHtml(secs);
        const got = new Set(secs.filter((s) => s.kind === "sec").map((s) => s.key));
        bounds.forEach((n) => (got.has(lineSortKey(n)) ? paired++ : empty++));
      });
      console.log("  paired " + paired + " of " + (paired + empty) + " sections; " + empty +
        " draw an empty " + O.langName + " cell (the two editions' own numbering)");
      const ns = Object.keys(byNum).map(Number).sort((a, b) => a - b);
      ns.forEach((n) => {
        // DISTINCT numbers, not markers: two speeches sharing one of the translation's blocks are
        // emitted under the same number and fold back into one row — see the drama block above
        const keys = new Set([...byNum[n].matchAll(/data-n="(\d+)"/g)].map((m) => m[1]));
        console.log("  Part " + n + " — " + keys.size + " sections (" + (byNum[n].length / 1024).toFixed(0) + " KB)");
      });
      return writeOriginal(byNum, warnings);
    }

    /* A PROSE WORK IN BOOKS OF NUMBERED CHAPTERS pairs on the CHAPTER — see teiBookChapters for the
       measurement that settled it on the chapter rather than the finer section. The two columns are
       reconciled before either is believed, and the English is read back out of its own cached TEI so
       that an --only-original run checks against exactly the file that shipped — the discipline the
       verse and drama branches above follow, and for the same reason: a pairing asserted from the
       entry rather than from the files is a pairing nobody has checked.

       THE ORIGINAL'S OWN NOTES ARE DROPPED, and that is a consequence of the page rather than a
       judgement about them. teiSectionProse lifts a note out of the prose into a list, and Folio's
       reader folds notes under the TRANSLATION alone — the original column has nowhere to put one —
       so the Greek's 83 editorial notes are removed from the text instead of being left standing in
       the middle of it. The count is printed on every run rather than passed over in silence. */
    if (O.layout === "chaptered") {
      /* WHERE THE ENGLISH SIDE IS READ BACK FROM, and until Thucydides there was only one answer
         (Aug 2026). Herodotus's and the Gallic War's translations are TEI editions, so this branch
         re-read the cached XML and ran teiBookChapters over it. Thucydides is the first book here
         whose two columns come from DIFFERENT KINDS of source — a Wikisource English against a
         Perseus TEI original — and on that shape there is no en-tei.xml at all and no BOOK.url to
         fetch one from, so the old path asked fetchText for `undefined` and died after the English
         had already been written.

         The wiki side has its own per-chapter cache, holding exactly the html that shipped, with the
         bk-n markers already in it — which is the same thing teiBookChapters returns and all the
         reconciliation below needs. So it is read from there, and the discipline the verse, drama and
         TEI branches follow is kept intact: the pairing is checked against the file that actually
         shipped rather than asserted from the entry. A chapter whose cache is missing is reported
         rather than skipped in silence, since a quietly absent English book would read as a clean
         pairing of the ones that remain. */
      let en;
      if (BOOK.source === "wiki") {
        en = {};
        for (const n of BOOK.chapters) {
          const cf = path.join(CACHE, n + ".json");
          if (!fs.existsSync(cf)) { warn(BOOK.chapterWord + " " + n + " has no cached translation to pair against"); continue; }
          en[n] = { html: JSON.parse(fs.readFileSync(cf, "utf8")).html, notes: [] };
        }
      } else {
        const enCache = path.join(CACHE, "en-tei.xml");
        let enXml;
        if (fs.existsSync(enCache)) enXml = fs.readFileSync(enCache, "utf8");
        else { enXml = await fetchText(BOOK.url); fs.writeFileSync(enCache, enXml); }
        en = teiBookChapters(enXml, {}, warn);
      }
      const or = teiBookChapters(xml, {}, warn);
      /* The chapter as the reader sees it — "121A", not the sort key behind it — because both columns
         print the same label and a human reading this report needs the citation, not the scale. */
      const nums = (o) => (o ? [...o.html.matchAll(/class="bk-n"[^>]*>([^<]+)</g)].map((m) => m[1]) : []);
      console.log("  reconciling the two columns' chapter numbers:");
      let paired = 0, blankOrig = 0, blankEng = 0, notes = 0;
      Object.keys(en).map(Number).sort((a, b) => a - b).forEach((n) => {
        if (!or[n]) { warn(BOOK.chapterWord + " " + n + " is missing from the original"); return; }
        const e = nums(en[n]), o = nums(or[n]);
        const es = new Set(e), os = new Set(o);
        const miss = e.filter((c) => !os.has(c)), extra = o.filter((c) => !es.has(c));
        paired += e.filter((c) => os.has(c)).length;
        blankOrig += miss.length; blankEng += extra.length;
        notes += or[n].notes.length;
        console.log("    " + BOOK.chapterWord + " " + n + " — " + e.length + " chapters in the " +
          "translation, " + o.length + " in the original" +
          (miss.length ? ", " + miss.length + " with no original (" + miss.slice(0, 6).join(", ") + ")" : "") +
          (extra.length ? ", " + extra.length + " with no translation (" + extra.slice(0, 6).join(", ") + ")" : ""));
      });
      console.log("  paired " + paired + " of " + (paired + blankOrig) + " chapters; " + blankOrig +
        " draw an empty " + O.langName + " cell and " + blankEng + " an empty English one");
      console.log("  " + notes + " editorial notes dropped from the original column (it has no fold)");
      Object.keys(or).forEach((n) => { byNum[n] = or[n].html; });
      return writeOriginal(byNum, warnings);
    }

    /* A PAGED edition is divided into one thing and cited by another — see teiPagedBooks. The
       sections Bywater prints are a modern editor's paragraphing; the Bekker pages standing inside
       them are what Ross's margin carries and what the two columns pair on. */
    if (O.layout === "paged") Object.assign(byNum, teiPagedBooks(xml, { expect: O.pages }, warn));
    else Object.assign(byNum, teiChapters(xml, warn));
    const ns = Object.keys(byNum).map(Number).sort((a, b) => a - b);
    ns.forEach((n) => {
      const secs = (byNum[n].match(/class="bk-n"/g) || []).length;
      console.log("  " + BOOK.chapterWord + " " + n + " — " + secs + " sections (" + (byNum[n].length / 1024).toFixed(0) + " KB)");
    });
    return writeOriginal(byNum, warnings);
  }

  /* ONE PAGE PER CHAPTER on another wiki, with the chapter numbers printed in the prose — see
     extractCaput above for what this edition does with them. Cached per chapter as raw HTML rather
     than as an extracted record, so that re-running the extractor costs no requests, which is what
     --force is for.

     THE PAIRING IS CHECKED AGAINST THE FILE THAT SHIPPED, never asserted from the entry: the English
     side is read back out of its own cache and its markers compared with the Latin's as SETS in both
     directions, because a count agreeing is not the same claim as a passage agreeing. */
  if (O.layout === "caput") {
    console.log("\nFetching the " + O.langName + " original — one page per " +
      BOOK.chapterWord.toLowerCase() + " from " + O.wiki);
    let cols = 0, folded = 0;
    for (const n of BOOK.chapters) {
      if (n < FROM || n > TO) continue;
      const where = O.langName + " " + BOOK.chapterWord.toLowerCase() + " " + n;
      const cf = path.join(cacheDir, "or-" + String(n).padStart(2, "0") + ".html");
      let h;
      if (!FORCE && fs.existsSync(cf)) h = fs.readFileSync(cf, "utf8");
      else { h = await api(O.page(n), O.wiki); fs.writeFileSync(cf, h); await sleep(1200); }
      const got = extractCaput(h, O, warn, where);
      if (got.html.length < (O.minChars || 200))
        throw new Error(where + " came back short (" + got.html.length + " chars)");
      byNum[n] = got.html;
      cols += got.cols; folded += got.folded;
      console.log("  " + where + ": " + got.marks + " chapters, " +
        (got.html.length / 1024).toFixed(0) + " KB");
    }
    console.log("  " + cols + " Migne column references removed, " + folded +
      " paragraph number(s) folded onto their paragraph");

    /* THE ENGLISH IS READ BACK OUT OF ITS OWN CACHE, which is the record writeEnglish serializes, so
       what is compared is exactly what shipped. Not out of books/<id>.js: that file is JavaScript and
       its markers are inside a quoted string, so a pattern written for HTML matches nothing there and
       reports a book that pairs perfectly as a book that pairs nowhere — which it did, before this
       was written this way. */
    const nums = (html) => (html.match(/class="bk-n"[^>]*>(\d+)</g) || []).map((s) => +s.match(/>(\d+)</)[1]);
    let pairs = 0, seen = 0;
    const onlyEn = [], onlyOr = [];
    for (const n of BOOK.chapters) {
      const cf = path.join(CACHE, n + ".json");
      if (!byNum[n] || !fs.existsSync(cf)) continue;
      seen++;
      const en = nums(JSON.parse(fs.readFileSync(cf, "utf8")).html), or = nums(byNum[n]);
      const se = new Set(en), so = new Set(or);
      const missing = en.filter((v) => !so.has(v)), extra = or.filter((v) => !se.has(v));
      onlyEn.push(...missing.map((v) => n + "." + v));
      onlyOr.push(...extra.map((v) => n + "." + v));
      if (!missing.length && !extra.length) pairs++;
    }
    if (seen) console.log("  " + pairs + " of " + seen + " " + BOOK.chapterWord.toLowerCase() +
      "s pair exactly on every chapter number");
    else console.log("  (no cached translation to pair against — run without --only-original to check)");
    /* Reported in full up to a point and then counted: a real divergence is a handful of chapters,
       and a list of six hundred is a report that the CHECK is broken rather than the book. */
    const say = (list) => list.length > 12
      ? list.slice(0, 12).join(", ") + " … and " + (list.length - 12) + " more"
      : list.join(", ");
    if (onlyEn.length) warn(onlyEn.length + " chapter(s) in the translation with no original: " + say(onlyEn));
    if (onlyOr.length) warn(onlyOr.length + " chapter(s) in the original with no translation: " + say(onlyOr));
    return writeOriginal(byNum, warnings);
  }

  /* ONE PAGE PER CHAPTER on another wiki — the simplest of the three wiki shapes; see originalChapter
     above. Cached per chapter, like the English walk, so --from/--to and a resumed run behave here
     exactly as they do there. */
  if (O.perChapter) {
    console.log("\nFetching the " + O.langName + " original — one page per " +
      BOOK.chapterWord.toLowerCase() + " from " + O.wiki);
    for (const n of BOOK.chapters) {
      if (n < FROM || n > TO) continue;
      const cf = path.join(cacheDir, n + ".json");
      let rec;
      if (!FORCE && fs.existsSync(cf)) rec = JSON.parse(fs.readFileSync(cf, "utf8"));
      else {
        const h = await api(O.page(n), O.wiki);
        rec = originalChapter(h, O, (m) => warn(BOOK.chapterWord + " " + n + ": " + m));
        if (rec.html.length < (O.minChars || 200))
          throw new Error(BOOK.chapterWord + " " + n + " came back short (" + rec.html.length + " chars)");
        fs.writeFileSync(cf, JSON.stringify(rec));
        await sleep(1200);   // this wiki rate-limits a fast walk harder than the English one
      }
      /* The same single marker the translation carries, and it must be written on BOTH sides or the
         two columns have nothing to pair on: app.js reads `bk-n`, and one column stating its number
         while the other states none is exactly the case that pairs by luck. */
      byNum[n] = BOOK.sections === "whole"
        ? '<p><span class="bk-n" data-n="' + n + '">' + n + "</span></p>" + rec.html
        : rec.html;
      console.log("  " + BOOK.chapterWord + " " + n + " — " + (rec.html.length / 1024).toFixed(1) +
        " KB" + (rec.head ? " — " + rec.head : ""));
    }
    return writeOriginal(byNum, warnings);
  }

  /* A POEM IN LAISSES on the original side too. The six pages are fetched and cached as raw HTML and
     then cut as ONE sequence, because the numbering runs straight through them and six pages cut
     independently could not carry a count across a page boundary — which is exactly what the six
     unnumbered laisses need. Cached per page all the same, so a rate-limited run resumes. */
  /* THE ORIGINAL IN FITTS — the same walk on the other edition, with one difference that is the
     whole reason this branch exists rather than reusing the English one: Wyatt divides where the
     manuscript does and Gummere does not always follow him, so a fitt of the original may belong
     inside a chapter of the translation. `foldInto` says which, and the two are joined into one
     paragraph so the chapter reads as the single run of verse it is. */
  if (O.layout === "fitts") {
    console.log("\nFetching the " + O.langName + " original — one page per " + BOOK.chapterWord.toLowerCase());
    const fold = O.foldInto || {};
    const parts = {}, marks = {};
    const all = BOOK.chapters.concat(Object.keys(fold).map(Number)).sort((a, b) => a - b);
    for (const n of all) {
      const target = fold[n] != null ? fold[n] : n;
      if (target < FROM || target > TO) continue;
      const where = O.langName + " " + BOOK.chapterWord.toLowerCase() + " " + n;
      const cf = path.join(cacheDir, "or-" + String(n).padStart(2, "0") + ".html");
      let h;
      if (!FORCE && fs.existsSync(cf)) h = fs.readFileSync(cf, "utf8");
      else { h = await api(O.page(n), O.wiki); fs.writeFileSync(cf, h); await sleep(1200); }
      const got = extractFitt(h, warn, where);
      if (got.html.length < (BOOK.minChars || 200))
        throw new Error(where + " came back short (" + got.html.length + " chars)");
      (parts[target] = parts[target] || []).push(got.html);
      marks[target] = (marks[target] || 0) + got.marks;
      console.log("  " + where + ": " + got.marks + " line numbers" +
        (target !== n ? "  — folded into " + BOOK.chapterWord.toLowerCase() + " " + target : ""));
    }
    Object.keys(parts).forEach((k) => {
      byNum[k] = parts[k].join("").replace(/<\/p>\s*<p>/g, "<br>");
    });

    /* THE PAIRING, CHECKED AGAINST THE FILES THAT SHIPPED rather than asserted from this entry — the
       discipline the verse, drama, laisses and TEI branches all share. Both columns are read back out
       of their own caches and cut again, so what is compared is what the two texts actually contain:
       the chapter numbers, and then, one level down, the line numbers inside each chapter, which is
       what app.js will actually pair on. A count agreeing is not a passage agreeing, so the markers
       are compared as SETS and both directions are reported. */
    const nums = (html) => (html.match(/class="bk-n">(\d+)</g) || []).map((s) => +s.match(/>(\d+)</)[1]);
    let pairs = 0, onlyEn = [], onlyOr = [];
    for (const n of BOOK.chapters) {
      const enCache = path.join(CACHE, "en-" + String(n).padStart(2, "0") + ".html");
      if (!fs.existsSync(enCache) || !byNum[n]) {
        if (!byNum[n]) warn(BOOK.chapterWord.toLowerCase() + " " + n + " has no original");
        continue;
      }
      const en = nums(extractFitt(fs.readFileSync(enCache, "utf8"), () => {}, "en " + n).html);
      const or = nums(byNum[n]);
      const se = new Set(en), so = new Set(or);
      const missing = en.filter((v) => !so.has(v)), extra = or.filter((v) => !se.has(v));
      onlyEn.push(...missing.map((v) => n + ":" + v));
      onlyOr.push(...extra.map((v) => n + ":" + v));
      if (!missing.length && !extra.length) pairs++;
    }
    console.log("  " + pairs + " of " + BOOK.chapters.length + " chapters pair exactly on every line number");
    if (onlyEn.length) warn("line block(s) in the translation with no original: " + onlyEn.join(", "));
    if (onlyOr.length) warn("line block(s) in the original with no translation: " + onlyOr.join(", "));
    return writeOriginal(byNum, warnings);
  }
  if (O.layout === "laisses") {
    console.log("\nFetching the " + O.langName + " original — " + O.pages.length + " pages from " + O.wiki);
    const raw = [];
    for (const page of O.pages) {
      const cf = path.join(cacheDir, page.replace(/[^\w.-]+/g, "_") + ".html");
      if (!FORCE && fs.existsSync(cf)) raw.push(fs.readFileSync(cf, "utf8"));
      else {
        const h = await api(page, O.wiki);
        fs.writeFileSync(cf, h);
        raw.push(h);
        await sleep(1200);   // this wiki rate-limits a fast walk harder than the English one
      }
      console.log("  " + page.split("/").pop() + " fetched");
    }
    const got = extractLaissesFr(raw, warn);
    got.forEach((c) => { byNum[c.n] = c.html; });
    const lines = got.reduce((a, c) => a + (c.html.match(/<br>/g) || []).length + 1, 0);
    console.log("  " + got.length + " laisses, " + lines + " lines");

    /* THE PAIRING, CHECKED AGAINST THE FILE THAT SHIPPED rather than asserted from this entry — the
       discipline the verse, drama and TEI branches share. The English is read back out of its own
       cached page and cut again, so what is compared is what the two columns actually contain. */
    const enCache = path.join(CACHE, "en-page.html");
    if (fs.existsSync(enCache)) {
      const en = extractLaisses(fs.readFileSync(enCache, "utf8"), BOOK, () => {});
      const ours = new Set(got.map((c) => c.n));
      const theirs = new Set(en.map((c) => c.n));
      const missing = en.filter((c) => !ours.has(c.n)).map((c) => c.n);
      const extra = got.filter((c) => !theirs.has(c.n)).map((c) => c.n);
      if (missing.length) warn("laisse(s) in the translation with no original: " + missing.join(", "));
      if (extra.length) warn("laisse(s) in the original with no translation: " + extra.join(", "));
      /* Counts agreeing is not passages agreeing, so the two columns' LENGTHS are correlated as well:
         a real alignment tracks closely and a column shifted by one laisse does not. Both figures are
         printed, because the shifted control is what makes the first number mean anything. */
      const lens = (a) => a.map((c) => (c.html.match(/<br>/g) || []).length + 1);
      const A = lens(en), B = lens(got);
      const r = (x, y) => {
        const n = Math.min(x.length, y.length);
        const mx = x.slice(0, n).reduce((s, v) => s + v, 0) / n, my = y.slice(0, n).reduce((s, v) => s + v, 0) / n;
        let num = 0, dx = 0, dy = 0;
        for (let i = 0; i < n; i++) { num += (x[i] - mx) * (y[i] - my); dx += (x[i] - mx) ** 2; dy += (y[i] - my) ** 2; }
        return num / Math.sqrt(dx * dy);
      };
      console.log("  line-count correlation " + r(A, B).toFixed(4) +
        " (shifted by one laisse: " + r(A.slice(1), B).toFixed(4) + ")");
    }
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
