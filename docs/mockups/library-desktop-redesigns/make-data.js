// node docs/mockups/library-desktop-redesigns/make-data.js — writes books.json for the six desktop designs
// from the live catalogue (app.js BOOKS + BOOK_AUTHOR_COLOR). The two groupings below (`tradition`, `form`)
// are the MOCKUP's: the shelf has no such field yet, and several designs depend on one existing.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", "..");
const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const a0 = app.indexOf("\n  const BOOKS = ["), a1 = app.indexOf("\n  ];", a0);
const BOOKS = (0, eval)(app.slice(app.indexOf("[", a0), a1 + 4));
const c0 = app.indexOf("const BOOK_AUTHOR_COLOR = {"), c1 = app.indexOf("\n  };", c0);
const COL = {}; (app.slice(c0, c1).match(/^\s*"((?:[^"\\]|\\.)+)":\s*"#[0-9A-Fa-f]{6}"/gm) || []).forEach((l) => { const m = /"((?:[^"\\]|\\.)+)":\s*"(#[0-9A-Fa-f]{6})"/.exec(l); COL[m[1]] = m[2]; });
const G = `
seneca-letters|Rome|Philosophy
marcus-aurelius-meditations|Rome|Philosophy
sun-tzu-art-of-war|China|Philosophy
plato-republic|Greece|Philosophy
plato-dialogues|Greece|Philosophy
ovid-metamorphoses|Rome|Epic and poetry
suetonius-twelve-caesars|Rome|History
tacitus-annals|Rome|History
plutarch-lives|Greece|History
cassius-dio-roman-history|Rome|History
lucretius-nature-of-things|Rome|Philosophy
aristotle-nicomachean-ethics|Greece|Philosophy
sophocles-oedipus-rex|Greece|Drama
euripides-medea|Greece|Drama
sophocles-antigone|Greece|Drama
aristophanes-lysistrata|Greece|Drama
kalidasa-shakuntala|India|Drama
beowulf|Medieval Europe|Epic and poetry
herodotus-histories|Greece|History
confucius-analects|China|Philosophy
mencius|China|Philosophy
machiavelli-prince|Renaissance and early modern|Law and politics
caesar-gallic-war|Rome|History
livy-history-of-rome|Rome|History
thucydides-peloponnesian-war|Greece|History
polybius-histories|Greece|History
aesop-fables|Greece|Tales and fiction
song-of-roland|Medieval Europe|Epic and poetry
epic-of-gilgamesh|Egypt and Mesopotamia|Epic and poetry
bhagavad-gita|India|Scripture and religion
classic-of-poetry|China|Epic and poetry
book-of-documents|China|History
book-of-rites|China|Philosophy
prose-edda|Medieval Europe|Scripture and religion
poetic-edda|Medieval Europe|Epic and poetry
don-quixote|Renaissance and early modern|Tales and fiction
satyricon|Rome|Tales and fiction
ramayana|India|Epic and poetry
ptahhotep|Egypt and Mesopotamia|Philosophy
boethius-consolation|Medieval Europe|Philosophy
morte-darthur|Medieval Europe|Tales and fiction
marco-polo|Medieval Europe|Travel and memoir
bede-history|Medieval Europe|History
rigveda|India|Scripture and religion
summa-theologica|Scripture and the Church|Scripture and religion
confessions|Scripture and the Church|Travel and memoir
city-of-god|Scripture and the Church|Scripture and religion
homer-iliad|Greece|Epic and poetry
homer-odyssey|Greece|Epic and poetry
virgil-aeneid|Rome|Epic and poetry
journey-to-the-west|China|Tales and fiction
three-kingdoms|China|Tales and fiction
canterbury-tales|Medieval Europe|Tales and fiction
divine-comedy|Medieval Europe|Epic and poetry
macbeth|Renaissance and early modern|Drama
romeo-and-juliet|Renaissance and early modern|Drama
julius-caesar|Renaissance and early modern|Drama
hamlet|Renaissance and early modern|Drama
tempest|Renaissance and early modern|Drama
classic-of-tea|China|Science
declaration-of-independence|Enlightenment and revolution|Law and politics
magna-carta|Medieval Europe|Law and politics
pausanias-description-of-greece|Greece|Travel and memoir
strabo-geography|Greece|Science
diodorus-library|Greece|History
apollodorus-library|Greece|Scripture and religion
anglo-saxon-chronicle|Medieval Europe|History
treaty-of-versailles|Modern science and thought|Law and politics
russian-primary-chronicle|Medieval Europe|History
novgorod-chronicle|Medieval Europe|History
luther-ninety-five-theses|Scripture and the Church|Scripture and religion
king-james-bible|Scripture and the Church|Scripture and religion
quran|Scripture and the Church|Scripture and religion
hobbes-leviathan|Renaissance and early modern|Law and politics
rousseau-social-contract|Enlightenment and revolution|Law and politics
kant-critique-of-pure-reason|Enlightenment and revolution|Philosophy
augustus-res-gestae|Rome|History
descartes-discourse-on-method|Renaissance and early modern|Philosophy
jerome-letters|Scripture and the Church|Travel and memoir
more-utopia|Renaissance and early modern|Law and politics
darwin-origin-of-species|Modern science and thought|Science
euclid-elements|Greece|Science
voltaire-candide|Enlightenment and revolution|Tales and fiction
book-of-the-dead|Egypt and Mesopotamia|Scripture and religion
erman-egyptian-literature|Egypt and Mesopotamia|Tales and fiction
james-principles-of-psychology|Modern science and thought|Science
pavlov-conditioned-reflexes|Modern science and thought|Science
darwin-expression-of-emotions|Modern science and thought|Science
freud-interpretation-of-dreams|Modern science and thought|Science
thorndike-animal-intelligence|Modern science and thought|Science
petrie-egyptian-tales|Egypt and Mesopotamia|Tales and fiction
douglass-narrative|Enlightenment and revolution|Travel and memoir
paine-common-sense|Enlightenment and revolution|Law and politics
us-constitution|Enlightenment and revolution|Law and politics
us-bill-of-rights|Enlightenment and revolution|Law and politics
washington-farewell-address|Enlightenment and revolution|Law and politics
marx-communist-manifesto|Enlightenment and revolution|Law and politics
breasted-ancient-records|Egypt and Mesopotamia|History
ebbinghaus-memory|Modern science and thought|Science
xunzi|China|Philosophy
mozi|China|Philosophy
`.trim().split("\n").reduce((m, l) => { const [id, t, f] = l.split("|"); m[id] = [t, f]; return m; }, {});
/* a SAMPLE reader, so the designs can show progress, favourites and read counts: deterministic, not real */
const reading = { "herodotus-histories": [3, 42, 2], "seneca-letters": [47, 38, 9], "homer-odyssey": [9, 36, 30], "marcus-aurelius-meditations": [12, 100, 60], "sun-tzu-art-of-war": [13, 100, 75], "darwin-origin-of-species": [2, 8, 1] };
const favs = new Set(["homer-odyssey", "marcus-aurelius-meditations", "plato-republic"]);
const rnd = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
const out = BOOKS.map((b) => {
  const unit = b.count === 1 ? b.chapterWord.toLowerCase() : (b.chapterWordPlural || b.chapterWord + "s").toLowerCase();
  const r = reading[b.id];
  if (!G[b.id]) throw new Error("no grouping for " + b.id);
  return { id: b.id, title: b.title, subtitle: b.subtitle || "", author: b.author, written: b.written, year: b.year, translator: b.translator || "",
    len: b.total > b.count ? b.count + " of " + b.total + " " + unit : b.count + " " + unit, word: b.chapterWord, count: b.count,
    orig: b.origName || "", color: COL[b.author === "Anonymous" ? b.id : b.author] || "#3b4a8c",
    tradition: G[b.id][0], form: G[b.id][1], fav: favs.has(b.id),
    reads: Math.round(Math.pow(rnd(b.id), 2.2) * 900) + (r ? 120 : 3),
    at: r ? { ch: r[0], pct: r[1], daysAgo: r[2] } : null };
});
fs.writeFileSync(path.join(__dirname, "books.json"), JSON.stringify(out, null, 1));
console.log(out.length + " books → books.json; traditions: " + [...new Set(out.map((b) => b.tradition))].join(", ") + "; forms: " + [...new Set(out.map((b) => b.form))].join(", "));
