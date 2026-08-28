# China (`china`) — per-card research findings

Moved out of CLAUDE.md (Aug 2026). **Read this before writing a `cnh-` card.**

The other ten collections keep their findings in `docs/<collection>-card-plan.md`
and in the citation-pass batch logs. China's cards ship cited from the start, so
there was no citation pass and no batch log to write into, and these went into
CLAUDE.md instead until that file outgrew itself. This is their proper home.

They are findings rather than description: which sources are reachable from this
sandbox and which are not, how to read a CJK PDF, how to search an OCR'd volume
whose romanisation nobody now uses, and the traps that have already cost a card.

**`cnh-001` is worth reading before `cnh-002`** for one reason
beyond its content: the openly readable scholarship on early Chinese myth reachable from this sandbox is
almost entirely **French sinology on Persée** — `Extrême-Orient Extrême-Occident`, `Études chinoises`,
BEFEO, `Cahiers d'Extrême-Asie`, `L'Homme` — which serves an article's FIRST PAGE as HTML and its PDF as
403, so a claim has to be one the opening page actually carries. Brill, Cambridge, MDPI, Springer, JSTOR
and the Smithsonian are all shut or bot-walled here, Sino-Platonic Papers ships **encrypted** PDFs, and
`asianethnology.org` is JavaScript-driven; `ctext.org` and `archive.org` answer and carry the primary
texts and the out-of-copyright shelf. **A source in any language qualifies** (CLAUDE.md says so), and for
this subject the French is not a fallback but the literature.
**`cnh-003` WIDENED THAT SURVEY IN THREE DIRECTIONS, on request, and each is worth carrying** (Aug 2026,
"feel free to also use Chinese academic sources"). **CHINESE-LANGUAGE SCHOLARSHIP IS REACHABLE AND IS THE
BEST SOURCE THERE IS FOR THIS SUBJECT**: the Macao SAR Cultural Affairs Bureau publishes 《文化雜誌》 /
*Revista de Cultura* openly at `icm.gov.mo`, one PDF per article, and Lü Zongli's 24-page study of Pangu
carried nine of that card's ten sentences with a full apparatus — where the French first pages carry a
sentence each. **Ask whether the subject has a Chinese-language journal before settling for what English
and French happen to hold.** **A CJK PDF NEEDS A ToUnicode-AWARE EXTRACTOR**, and three faults have to be
fixed before one reads at all: `/Font` may be an INDIRECT reference (`/Font 37 0 R`) and not an inline
dictionary, so a reader that only matches `/Font <<` finds zero fonts; a `bfrange` destination may hold
several UTF-16 units, and only the LAST is incremented across the range (incrementing the codepoint throws);
and text drawn with LITERAL `(…)` strings rather than hex `<…>` must still be decoded through the CMap,
two bytes at a time. `.claude/` deliberately holds no such tool — it is scratch work — but the three
faults are the whole of it. **AND ASSERT THAT EVERY PATCH TO IT LANDED**: the literal-string fix was
applied through a shell string replacement that silently matched nothing, and the tell was BYTE-IDENTICAL
output across two "patched" runs, which reads as the fix having made no difference rather than as no fix.
**`journal.oraltradition.org` IS OPEN AND PEER-REVIEWED** and its 16/2 (2001) issue is a special number on
Chinese oral traditions; DOAJ's own API (`doaj.org/api/search/articles/<query>`) is the quickest way to
find whether an open article on a subject exists at all. `journals.openedition.org`, `muse.jhu.edu` and
`jstage.jst.go.jp` answer; `mdpi.com`, `brill.com` and `jstor.org` do not. **A journal being open is not a
reason to cite it**: two DOAJ hits on Pangu were a Girardian reading in a French-studies journal and a
phenomenological one in a literature review, neither of which states a fact a Folio card makes, and both
were passed over.
**`cnh-005` ADDS TWO MORE, and the first is a route this collection should reach for early** (Aug 2026).
**FOR A CLASSIC, THE PRIMARY TEXT IN AN OUT-OF-COPYRIGHT TRANSLATION IS THE BEST SOURCE THERE IS** — batch
25's rule and G4's, on a Chinese subject: Legge's *Yî King* (Sacred Books of the East 16, 1882) is on
archive.org in full OCR and carries the Great Appendix's own account of Fuxi drawing the trigrams, his
nets, and the tradition that gives him the figures but not the book, which no modern open article states
in one place. **Its OCR mangles the romanisation and a grep for the NAME finds nothing** — Legge writes
"Fû-hsî" and the scan renders it "F(-hst", "Ffi-hsi", "F'(-hsf" — so search on a distinctive WORD of the
passage instead (`Anciently`, seven hits, five of them the ones wanted). The same volume set already
serves the Analects and the Book of Documents in the Library, so the translator is one the site trusts
elsewhere. **AND A DOI THAT RESOLVES IS NOT AN ARTICLE THAT EXISTS**: Vampelj Suhadolnik's Fuxi-Nüwa
paper in *Asian Studies* 7.2 resolves 200 to its landing page and has **no galley deposited at all** —
brute-forcing galley ids is wasted, and the issue's own table of contents is what says so, five of that
issue's thirteen articles having none. Read the TOC before concluding a fetch failed.
**`cnh-006` EXTENDS THAT PRIMARY-TEXT RULE TO THE 19th-CENTURY SINOLOGICAL REFERENCE WORKS** (Aug 2026),
which are out of copyright for the same reason and are the best thing reachable on several of this
collection's subjects: Bretschneider's *Botanicon Sinicum* (Kelly and Walsh, 1895) carries the whole
history of the *Shennong bencao jing* — ascribed to him, 365 drugs for the days of the year, internal
evidence of Han compilation, surviving only in quotation — where no modern open article does. And **a
SECOND volume of a translation already cited is a second source, and its FOOTNOTES may be the reason to
reach for it**: Legge's Lî Kî (SBE 27) is on this shelf as a Library book, and its note on the Yueling's
summer months (p. 268 n. 3) identifies Yandi with Shennong outright and dates him — a claim nothing else
openable states. **Expect two out-of-copyright authorities to give a legendary figure DIFFERENT
traditional dates** (Legge not later than the 31st century BCE, Bretschneider the 28th), so a date line
here says "by one reckoning" and picks the one whose author the deck already follows.
**AND NEVER CONSTRUCT AN `upload.wikimedia.org` PATH** — the MD5 hash directory cannot be guessed, so
take the URL from the API's `imageinfo`; when that host rate-limits (429 on every retry, while
`commons.wikimedia.org` answers normally), `commons.wikimedia.org/wiki/Special:FilePath/<File>?width=N`
serves the bytes.
**`cnh-007` IS THE DECK'S FIRST CARD WITH AN EMPTY DATE LINE, AND THAT IS THE HONEST ANSWER RATHER THAN
A GAP** (Aug 2026). The tradition gives the Yellow Emperor no date at all: Chavannes' Introduction
records that Sima Qian stopped his exact chronology at 841 BCE and counted by generations before it, and
that Chinese scholarship accepts that limit — exact dates begin only with Yao. The tempting row is
"Exact dates from | 841 BCE", and it is a trap, because **`cardYears` reads the date line as the date of
the ANSWER TERM**, so it would file the Yellow Emperor in the 9th century BCE and the Timeline game
would print it. The 841 BCE fact belongs in the ABSTRACT, where it is a statement about the record
rather than about the man, and the field is left `""` exactly as the date-line rule already blesses.
**Ask what a date line row will make `cardYears` ASSERT before writing it**; a legendary figure the
sources decline to date is a card that should decline too.
**`cnh-008` ADDS A SECOND LEGGE SHELF, AND THE REASON TO REACH FOR IT IS ITS APPARATUS** (Aug 2026).
Legge translated these classics TWICE — the *Chinese Classics* (Hongkong, 1861–72, seven volumes, with
the Chinese text and full critical notes) and then the leaner Sacred Books of the East versions this
collection has been citing — and the earlier one keeps what the later one drops. Its Shoo King volume
preserves, in a note, a fragment of the LOST Announcement of Tang that Sima Qian quotes, in which the
founder of Shang cites Chiyou's rebellion as the precedent for punishing lords who will not serve: a
second early attestation that exists nowhere else openable. **Confirm such a volume's date from the
PREFACE SIGNATURE** ("Hongkong, 1865" here), since archive.org's metadata gives the SERIES date (1861)
and the title-page verso OCRs badly. **AND LEGGE CHANGED HIS ROMANISATION BETWEEN THE TWO**, which is the
cnh-005 grep rule in a new coat and worse: the SBE Shû King writes "Khih Yû" and the *Chinese Classics*
writes "Ch'e-yow", so a search that finds a name in one Legge volume finds nothing in the other while the
passage is sitting there. Search the CHARACTERS (蚩尤) or a distinctive word of the passage.
**AND A PERSÉE FIRST PAGE IS WORTH READING FOR ITS FRAME EVEN WHEN THE ARTICLE IS ABOUT SOMETHING ELSE**
— Vandermeersch's "Écriture et littérature en Chine" opens by saying Chinese mythology survives only
sporadically and in an entirely fragmentary state, with the epic and narrative genres long absent, which
is precisely the sentence a myth card needs to explain why its subject is four lines in the *Shiji* and a
monster in a Tang commentator's quotation of a lost book. The converse holds too and cost a fetch here:
"Un ancêtre légendaire au service du nationalisme chinois" (Perspectives chinoises 47) reads as the
on-topic hit and **its served first page never mentions Chiyou at all** — grep the page for the subject
before assuming an article about the right period carries the right claim.
**`cnh-009` REACHES PAST A SCHOLAR'S REPORT TO THE TEXT HE IS REPORTING, WHICH THIS SHELF CAN ALMOST
ALWAYS DO** (Aug 2026). Chavannes remarks in a note that the battle at Banquan was famous before Sima
Qian's time because it is alluded to in the Zuozhuan — and Legge's *Chinese Classics* vol. 5 carries that
passage in English (Duke Xi, 25th year, pp. 195–96), where a diviner reads the tortoise-shell for the
marquis of Jin and calls the omen that of the Yellow Emperor's battle at Banquan. **Where a cited
scholar's evidence is itself a classic, and an out-of-copyright translation of that classic exists, cite
the passage rather than the remark**: it is a stronger citation, it is checkable, and it costs one fetch.
**AND IN A BADLY OCR'd VOLUME, GREP AN ORDINARY WORD FROM THE PASSAGE RATHER THAN THE NAME.** OCR mangles
a proper name worst of all, being the thing its language model has never seen: "Pan-ts'euen" came out
"Fnn-ts'cucn" and "Hwang-te" as "Ilwang-tc", so every search on the name found nothing while the passage
sat there — what found it was "milfoil". This is the cnh-005 and cnh-008 grep rule a third time, and the
general form of all three: **search on the vocabulary, not on the subject.**
**A PERSÉE FIRST PAGE ALSO CARRIES DATES THE CLASSICS DECLINE TO GIVE** — Billeter's opens by placing
Huangdi in the Yellow River basin between 2697 and 2599 BCE "selon certaines chronologies", which is what
a date line needs on a card whose own sources put the reign nowhere at all.
**`cnh-010` IS THE CARD WHERE FOUR OF THE FIVE SOURCES ARE ONE TRANSLATOR, AND THAT IS THE HONEST SHAPE**
(Aug 2026). Yao exists only in the classics, so the sources are the classics: Legge's Shû King for the
Canon of Yao, his Yî King for the Great Appendix, his *Chinese Classics* vol. 1 for Confucius's praise
and vol. 2 for Mencius denying the throne was Yao's to give, with Chavannes for the *Shiji*'s portrait.
Four different WORKS by one out-of-copyright translator is variety; four citations of one work would not
be. **Watch the romanisation across his own volumes** — vol. 1 (Hongkong, 1861) writes "Yaou" where vol. 2
(Oxford, 2nd ed., 1895) writes "Yao" — which is the cnh-005/008/009 grep rule a fourth time.
**ITS REAL FINDING IS A MIS-LINK, AND IT IS A CORPUS-WIDE ONE**: a card's prose auto-links common nouns
by design, so a glossary ALIAS that is also an ordinary English word links wherever that word occurs —
"near at hand like the sun and from afar like a cloud" linked *afar* to the Afar Region of Ethiopia,
which had `Afar` as an alias. The fix is `GLOSSARY_CASESENSITIVE` on the TERM (`Afar_Region`), not a
reworded sentence: it is the `Boreal` precedent extended from a key to an alias, and it repairs every
future card at once. **Ask of every short alias whether it is also an ordinary word**, and note that only
LOOKING at the rendered card finds this — no count or test reports a link that is merely wrong.
**AND A HUGE SCAN NEEDS THE THUMB URL** — Ma Lin's scroll is 7,890 × 17,168, so `src` is the
`/thumb/<a>/<ab>/<file>/1280px-<file>` rendering the API hands back in `imageinfo`'s `thumburl` when
asked with `iiurlwidth`; shipping the original would put a 40 MB download behind one card.
**`cnh-011` IS WHERE A PAGE NUMBER WAS ESTIMATED RATHER THAN READ, AND THAT IS A FABRICATED CITATION**
(Aug 2026). Legge's "Annals of the Bamboo Books" sits in the Prolegomena of *Chinese Classics* vol. 3
pt 1, and the citation was first written "p. 116" — a figure derived from where the passage falls in a
27,000-line OCR dump, not from any printed page number read off the scan. It resolves, it looks exactly
like every other citation on the card, and **no check in this repo can see it**: `add-sources.js` tests
that a citation ends in a URL and that a marker points at it, `check-style` tests the prose, and curl
tests the host. It was replaced with "Prolegomena, ch. 4", which is what the volume's own structure
states and which a reader can actually find. **A locator must be READ, never computed from an offset** —
where the scan gives no page number, cite the division the edition itself names. **AND THE SAME CARD
SHOWS WHY THE STYLE CHECKER IS RUN ON EVERY DRAFT**: the ambiguous person-or-book names bite hardest in
this collection, and "Mencius" in a date-line label was flagged where "The <i>Mencius</i> denies…" in
the prose is both accurate and legitimately italicised — the fix is to say which of the two you mean,
not to drop the italics.
**`cnh-012` IS THE `afar` FINDING'S SECOND KIND, AND CASE CANNOT FIX THIS ONE** (Aug 2026). There the
linked word was an ordinary adverb, so `GLOSSARY_CASESENSITIVE` on the term repaired every future card
at once. Here the collision is between two REAL object classes: `Bronze_tripod_cauldron` is a Greek
term (its own description is about Olympia and the Athenian Acropolis) and it carries the bare alias
`tripod`, so the nine 鼎 the Zuo Commentary has the Xia casting linked to a Greek sanctuary dedication —
lower case on both sides, nothing for case to separate. **The obvious fix is measured and refused**:
over the whole corpus the bare alias catches 13 surfaces, of which **11 are Greek and correct** and 2
are wrong even inside Greece (`gr-070` and the `Midea` term say "a miniature tripod offering table",
which is a three-legged table and not a cauldron), so dropping it would break eleven links to mend
three. **THE FIX THAT SCALES IS TO GIVE THE OTHER OBJECT ITS OWN TERM** and let `buildGlossIndex`'s
longest-first sort do the work — a `Ding` term makes "nine ding" beat "tripod" with nothing else
touched — and until a bronze card writes one at the bar (`cnh-064` and the `cn-culture` vessels are
where it belongs) the sentence says "cauldrons" instead. **Ask of a one-word alias not only whether it
is an ordinary word but whether the THING is one more than one culture makes.** The two offering-table
mis-links are recorded rather than repaired, being on another collection's cards.
**AND A SCAN IS NOT A PAGINATION**: p. 293 for the tripods was read in `in.ernet.dli.2015.60723` and
the citation names `chineseclassics51legg`, the family the other volumes here come from, so the passage
AND its running head were checked in the second scan before it was cited — cnh-011's rule about
reading a locator, met one step earlier, at the point where two scans of one book could disagree.
**`cnh-013` IS WHERE A CARD'S CENTRAL POINT CAME OUT OF A TRANSLATOR'S FOOTNOTE** (Aug 2026). The
thing worth knowing about the Chinese flood is that it is not a deluge — no ark, no punishment, no
survival — and the sentence that says so plainly is Legge's own note on Mencius III.i.4: the calamity
"is not presented as the consequence of a deluge, or sudden accumulation of water, but from the
natural river-channels being all broken up and disordered." Nothing in the TEXT of any classic states
it, because a tradition does not think to say what it is not. **Read an out-of-copyright
translation's NOTES, not only its text** — batch 8b's museum-record rule in another form, and this
deck's fourth source of that kind after the Prolegomena, the apparatus and the contents page.
**AND THE ANSWER TERM WAS CHOSEN AGAINST COLLECTIONS THAT DO NOT EXIST YET**, which is cnh-012's
tripod finding applied before the card was written rather than after. "Great flood" is the obvious
key and measures ONE occurrence in the corpus today — so it looks free — but Deucalion, Gilgamesh and
Noah are all subjects the plans already carry, and every one of them will say "the great flood". The
key is `Chinese_flood_myth` with **no generic alias at all**, and the card's answer term is that
phrase. **Ask what a new key will match once the OTHER collections are written, not only what it
matches today.**
**ITS PICTURE IS THE CASE WHERE THE BETTER SUBJECT LOST TO THE BETTER PROVENANCE.** Commons carries a
rubbing of Yu in a conical rain hat holding a digging tool — exactly this card's argument in one
image — and its file page states no source, no date and no author, so calling it a Han relief would
be composing a fact about somebody else's image, which is the one thing the picture rules forbid. The
17th-century woodblock taken instead names its source work (the Ming novel *Youxia zhizhuan*, in the
Guben xiaoshuo jicheng) and its century, and shows an audience scene rather than a flood. **A `desc`
is a claim; pick the file whose record can support one**, and write the `alt` from what is actually
in the frame rather than from what the card is about.
**Two smaller things it settled**: the *Mencius* has Yu eight years away from home where the *Shiji*
quotes the books of Xia for thirteen, and both ship unreconciled; and a guessed
`upload.wikimedia.org` hash directory 404'd loudly, which is the rule above working rather than a new
one.
**`cnh-014` IS THE GREP RULE AT ITS LIMIT: LEGGE ROMANISES THE NAME AS A SINGLE LETTER** (Aug 2026).
Houyi is "E" in the Analects and "Î" in the Sacred Books volume, and Ao is "Ngaou" — so every search
on the name, in either volume, found nothing at all while the passages sat there. What found them was
grepping the SURROUNDING PROSE ("move a boat along upon the land", "natural death", "archery"), which
is cnh-005/008/009/010's rule with nothing left of the name to search on. **Search the vocabulary,
never the subject** — and note that a one-letter romanisation is also unfindable by eye in a
27,000-line OCR dump, so the prose is the only handle there is.
**AND THE SUBJECT IS A NAME RATHER THAN A MAN, which is what the card is about.** Giles's dictionary
files TWO entries under it — a bowman serving the legendary emperor Ku, with a descendant under Yao
who shot the false suns, and separately the archer who seized the Xia throne — and the classics
disagree about the second: the Songs of the Five Sons has him block Tai Kang's return, the Zuo
Commentary has him supersede the line and be killed in the reign of Xiang, a divergence Chavannes
notes in the same breath as citing Legge for it. **A card whose answer is a name borne by several
figures says so rather than picking one.**
**A SECOND GILES, AND HE IS NOT THE ONE ON THE LIBRARY SHELF**: Herbert A. Giles (1845–1935) wrote
the *Chinese Biographical Dictionary* cited here, where **Lionel** Giles (1875–1958) translated the
Art of War, whose 2029 limit the Library states. Father and son, forty years between their deaths, so
taking one's dates for the other would put a wrong year under a licence — the Hugo Magnus trap
wearing a surname this project already uses, exactly as the Iliad's two Murrays do.
**AND CHAVANNES' LOCATOR WAS RIGHT**, which is worth recording in a file that keeps warning about
invented ones: he gives "Tso tchoan (4e année du duc Siang, trad. Legge, p. 424)", and reading the
scan independently gives Duke Seang, Year IV, p. 424. **A cited page checked against the book is the
cheapest corroboration there is** — and the volume it needed, *Chinese Classics* vol. 5 part 2
(`chineseclassics52legg`), is the sibling of the part 1 cnh-012 uses and is fetched the same way.
**ITS PICTURE COST A QUARTER OF AN HOUR OF BACKING OFF, AND THE TITLE IS DESCRIPTIVE ON PURPOSE.**
The two best-provenanced candidates are both far too small — Xiao Yuncong's Houyi of 1645 at
306 × 500, the Wu Liang shrine rubbing at 498 × 406 — so what ships is an 18th-century album leaf
from the Bibliothèque nationale de France (CC0, 871 px), and **Commons refused it for fifteen
minutes**: 429 on `upload.wikimedia.org`, on `Special:FilePath` and on the API alike, through every
listed thumbnail width its own error message recommends. **The answer is an `until` loop in the
background, not a faster retry** — the fetch lands on its own and the writing carries on meanwhile,
which is what kept "look at the picture before using it" from being the thing that got dropped.
**AND THE FILE NAME IS AN UPLOADER'S IDENTIFICATION RATHER THAN THE ALBUM'S**: the crop is named
`(后羿crop)` while the leaf it comes from is the album's 游畋失位, which is TAI KANG's cautionary
episode, so the rider drawing his bow may be either man. The title is therefore "An archer in the
hunt" and the `alt` says what is in the frame — **where a picture's subject rests on a filename, title
it for what it SHOWS**, which here is the hunting the card is about either way.
**`cnh-015` IS THE FIRST CARD HERE WHOSE SOURCE IS WRONG ABOUT SOMETHING CHECKABLE, AND THE FIX WAS
ANOTHER SOURCE ALREADY IN HAND** (Aug 2026). Mayers's Part II article on the Moon quotes Zhang Heng's
*Ling Xian* — the oldest surviving telling of Chang'e's flight — and then dates him to "the 1st century
B.C."; he lived 78–139 CE, which Giles's dictionary gives outright at no. 55, and Giles was already
being cited on the same card for the naming taboo. **A 19th-century reference work is evidence for what
a Chinese text SAYS and is not automatically right about when it was written**: read its dates against
another of the volumes on the shelf before repeating one. The harness now asserts both halves — the
right dates present, and the wrong century absent — because a card that quietly adopts a source's error
looks exactly like a card that got it right.
**AND THE OTHER MISTAKE IT DECLINED TO REPEAT WAS THE SOURCE LIST'S OWN SHAPE.** Three of the six
citations are Mayers, which reads like leaning on one book and is not: they are three different
articles in two different Parts of a reference work, and the deck's established shape is five or six
citations across four or five WORKS (cnh-010 is four Legge volumes out of five slots). **Count the
works, not the authors** — and where one work legitimately carries three separate claims, cite the
three places rather than the book once.
**ITS PICTURE CARRIES THE CARD'S OWN STORY IN ITS INSCRIPTION, AND THAT IS EXACTLY WHAT MUST NOT BE
CITED.** Wu Youru's drawing (d. c. 1893, from the *Gujin baimei tu*) is headed 嫦娥 and its inscription
attributes the theft to Wang Chong's *Lunheng* rather than to Zhang Heng — a genuinely interesting
variant, and reading a claim off an image is composing a fact from a picture, which the picture rules
forbid. It is left out. What the image DID settle is the cnh-013 provenance rule paying off: it beat a
Japanese print of the same subject on cultural fit and beat every rival on record — named artist, named
source work, dated century — where three of the five candidates the tool offered were **the Chang'e
lunar spacecraft**, which is the name-match trap at its most literal.
**AND AN APOSTROPHE IN A GLOSSARY KEY IS SAFE, VERIFIED RATHER THAN ASSUMED.** `Chang'e` is the first
China term needing one; five keys already carry one (`Nestor's_Cup`, `'Ain_Ghazal`), `data-k` is written
into a DOUBLE-quoted attribute, and every reader of it compares (`el.dataset.k === key`) rather than
building a selector. Proved in a browser by patching the served app.js to expose `openGlossWin` — the
`test-i18n-lang.js` technique — since no card links the term yet and `setupTooltips` wires per element,
so a synthetic `.ttip` appended to the page is never wired and answers nothing.
**A HARNESS THAT FAILS ON THE NETWORK IS A HARNESS NOBODY READS**: the browser check's "no console
errors" assertion began failing on `fonts.googleapis.com` and `supabase.co`, which this sandbox cannot
reach and which the page legitimately requests. It now filters by HOST and by nothing else, so a
same-origin failure still fails; a blanket "ignore failed resources" would have retired the assertion.
**`cnh-016` IS WHERE THE ENGLISH-LANGUAGE SHELF RAN OUT AND A CHINESE UNIVERSITY REPOSITORY CARRIED
THE WHOLE CARD** (Aug 2026). Kuafu is in neither Mayers nor Herbert Giles nor Werner — the 19th- and
early-20th-century reference works cover the rulers and the great deities and stop — and every complete
English translation of the *Shanhaijing* is modern and in copyright, while Lionel Giles's Liezi is a
SELECTION that skips the passage (checked, not assumed: his book V runs from the two mountains straight
to King Mu's automaton). What answered was **`ir.nwnu.edu.cn`, Northwest Normal University's repository,
serving Zhao Kuifu's article in 《文学遗产》 2020 no. 5 as a full-text PDF** — which quotes all three
primary passages verbatim with page references to Yuan Ke's edition, and carries the name's meaning, the
Bofu variant, the genealogy, the Peach Forest identification and the Huainanzi on Yuyuan besides. **When
a subject is thin in English, search the Chinese institutional repositories on the SUBJECT'S OWN NAME in
characters**; the search that found it was `夸父 神话 山海经 论文 pdf`, and a second one the same way
(`ir.lib.shimane-u.ac.jp`, a Shimane University bulletin) supplied the ending Zhao does not quote.
**A CHINESE PDF MAY HAVE NO ToUnicode MAP AT ALL, AND THEN THE LITERALS ARE GB18030.** The cnh-003 rules
still hold and were not enough here: this file's only CMap is a 72-entry Latin one, so decoding through
it returns mojibake that looks like a broken extractor rather than a wrong encoding. **Try `gb18030` on
the raw literal bytes before debugging anything else** — `ÇØ±¾¼Í` read as latin1 is 秦本纪 read as GBK.
Its punctuation still arrives as substituted ASCII (`!` `"` `#` for the CJK quote marks) **and so do the
DIGITS**, which is why this card's citation gives the journal, year and issue — read off the running
footer, which spells 二〇二〇年第五期 in characters — **and no page numbers**: cnh-011's rule, met where
the page number is on the page and unreadable.
**AND A SECOND SOURCE QUOTED THE RIGHT WORDS UNDER THE WRONG BOOK.** The Shimane paper gives 夸父與日逐走
… 化為鄧林 as 《列子·湯問》 where it is the *Shanhaijing*'s Haiwai beijing; the Liezi's own version opens
differently (夸父不量力，欲追日影) and adds the corpse-fat detail. Zhao attributes each passage and cites
an edition and page for it, so **where two open sources disagree about which book a quotation is from,
follow the one that gives a locator** — and use the looser one only for what it alone carries, here
Yinglong killing Kuafu as he killed Chiyou.
**`cnh-017` IS WHERE A NAME COULD NOT BE WRITTEN AT ALL, AND THAT IS THE FINDING** (Aug 2026).
Jingwei's mortal name is **女娃, romanised Nüwa** — identical in pinyin to **女媧**, the goddess who
patched the sky, who is `cnh-004` and a shipped glossary term with four aliases. Writing the name in the
card's prose auto-links it to the wrong figure, and unlike the `afar` and `tripod` cases NOTHING can
separate them: they are the same string, so `GLOSSARY_CASESENSITIVE` is no help, a longer key never
matches the bare surface, and **`glossOff` is an `ADMIN_EDITS` overlay that a card in `data.js` cannot
declare**. So the name is simply left out — the passage's own "youngest daughter of Yandi" says who she
is — and the loss is recorded here rather than papered over. **Before writing a personal name into a
card, check it against the glossary's existing keys AND aliases**; where two different figures share a
romanisation, the prose has to work without one of them.
**AND FOUR OF FOUR PICTURE CANDIDATES WERE WANG JINGWEI**, the 20th-century politician — the name-match
trap at its most literal, worse than Chang'e's spacecraft because every candidate was the wrong subject.
The hand-written Commons search found two right ones and **the better-provenanced was rejected on SIZE**:
a detail from the illustrated Shanhaijing of 1597, named artist and date, at 174 × 119. What ships is the
Gujin Tushu Jicheng's own 精衛圖, from the same imperial encyclopaedia that gave `cnh-016` its Kuafu —
a different section, so the two are siblings rather than a repeat.
**ITS SOURCES ARE A GOVERNMENT CURRICULUM DOCUMENT AND FOUR OLD REFERENCE WORKS, WHICH IS WHAT WAS
THERE.** No open scholarly article on Jingwei could be found in any repository this sandbox reaches;
what carries the primary text, with glosses and Tao Yuanming's line, is the **Hong Kong Education
Bureau's 《郁文華章》 selected-readings analysis** — batch 18's rule (look for the body responsible)
reaching a ministry rather than a museum. Cite such a document for the TEXT it reproduces and not for
its didactic reading.
**AND MAYERS GIVES YANDI'S ACCESSION TWICE, ONCE MIS-OCR'd.** His Shennong entry reads "B.C. 2787" in
the scan and his Part III table of the Legendary Period reads 2737, which the run of page headers
(363, 364, 365, 366, 367, 368) confirms is p. 366 — **where one book states a figure twice, the table is
the authority and the running heads are how the page is read**, cnh-011's rule with the OCR mangling
every other digit. That 2737 is a THIRD reckoning beside the two `cnh-006` already records (Legge's 31st
century, Bretschneider's 28th), so both cards now hedge with "by one reckoning" rather than pretending
to a date the tradition has not got.
**`cnh-018` IS WHERE A CROSS-REFERENCE IN ONE SOURCE OPENED FOUR MORE, AND THE ROUTE IS WORTH COPYING**
(Aug 2026). Mayers's Gonggong entry closes "Cf. L.C., III, pp. 23, 39" — Legge's *Chinese Classics*
vol. 3, two page numbers — and following it gave the card a third of its content: 共工 is **the name of an
OFFICE**, about Minister of Works, and the Bamboo Annals have Yao appoint the Gonggong to the management
of the Ho in his 19th year, unsuccessfully, which is where the inundation comes from. Chavannes then says
the same thing independently and adds why it matters — the commentators read 共工 as an office and Kiang
Cheng objects that Yao is precisely REFUSING to give him that office, so perhaps an ancestor held it and
the office name became the family name. **A 19th-century reference work's cross-references are locators
into books this shelf already has**; follow them rather than searching afresh, and the corroboration is
free. **AND EVERY PAGE NUMBER WAS READ OFF A RUNNING HEAD, in three different layouts** — Legge sets his
in the head (`Cil. III. 9, 10. | THE CANON OF YAOU. | 23`), Herbert Giles sets his in the head with the
entry numbers in a MARGINAL column the OCR throws into a block of its own, and Chavannes sets his in the
head of a separately-numbered appendix (`ANNALES DES TROIS SOUVERAINS 11`). Where the marginal numbers
could not be aligned to their entries with confidence, **the page alone is cited and no entry number is
invented** — cnh-011's rule, met on a book that offers two locators and lets you check only one.
**ITS PICTURE SEARCH IS THE NAME-MATCH TRAP AT ITS MOST LITERAL, TWICE.** The automatic search returns
**fourteen of fifteen results for the DWARF PLANET 225088 Gonggong**, and `suggest-image.js`, searching
the term, returns two Indo-Pacific FISH (*Pelates quadrilineatus*, whose Malay name is *gonggong*) and a
Hindu deity. The hand-written Commons search on the CHARACTERS found the right one at once —
`共工氏頭觸不周山`, a Ming woodblock of the butting itself — which is cnh-016's rule again: **search the
subject's own name in its own script.** Its record names the SOURCE WORK where the Artist field should be
（按鑑演義帝王御世盤古至唐虞傳）, so the `desc` says the work and that the artist is not named, rather
than reading an artist off a field that has not got one.
**AND ITS DATE LINE HEDGES BECAUSE THE SOURCES DO.** Mayers alone gives three incompatible placements —
minister of Fuxi, vassal of Shennong, rebel against Zhuanxu — and the Liezi and Huainanzi name Zhuanxu
where Sima Zhen names Zhurong, which Chavannes reconciles by giving the fight to Gonggong's DESCENDANTS,
Gonggong being generations older than Huangdi. So the first two rows read "by 1 reckoning" and "or under",
and the sort year is Mayers's 2852 BCE — which is a **different reckoning from `cnh-005`'s 3322 BCE for
Fuxi**, recorded rather than reconciled, exactly as `cnh-006` and `cnh-017` already disagree about Yandi.
The check that matters is the SIBLING one: `cnh-016` says Kuafu descends from Gonggong three generations
back, so Gonggong has to sort earlier than Kuafu's −2697, and at −2852 he does.
**`cnh-019` IS THE FIRST CARD HERE WHOSE PICTURE IS A PHOTOGRAPH, AND THE REASON IS THE CARD'S ARGUMENT**
(Aug 2026). Kunlun is a real range on the western frontier before it is the world-mountain, and the four
candidates that ARE art each fail: the best-provenanced painting on Commons is Lu Qian's Ming scroll
titled *Cranes and Pines in the Kunlun Mountains* — named artist, Tokyo National Museum — **and what it
shows is three cranes on a pine bough**, at 1566 × 3207, which the floated slot renders as a thin column;
the Han material that shows the mountain properly is the Queen Mother's, and she is the NEXT card. A
photograph of the range makes the card's own opening claim visible. **Its identification is attributed
rather than asserted**: the `desc` says the photographer titles the view the Kunlun Mountains and names
where he stood, because Tashkurgan sits where the western Kunlun meets the Pamirs and Folio cannot settle
which range the peak belongs to — cnh-013's rule that a `desc` is a claim, met on a modern file whose
uploader is the only authority for it.
**AND KUNLUN IS OWNED BY ITS NAMESAKES IN EVERY IMAGE AND ARTICLE SEARCH.** Commons on the bare name
returns the range, a warship class and a battle; DOAJ returns 1,088 records that are glaciology, nephrite
geology and **the acupuncture point 昆仑**, with nothing on the myth in the first dozen. It is the
Gonggong dwarf planet again with more claimants, and the way through is the same: search the characters,
and search the SUBJECT rather than the name — `崑崙山` found the Ming painting where `Kunlun` found ships.
**ITS SPINE IS A CROSS-REFERENCE FOLLOWED TWICE, which is cnh-018's rule paying again.** Mayers's entry
cites "L.C., III., p. 127" for the mountain's earliest mention, and that page carries the Tribute of Yu's
one flat sentence — hair-cloth and skins from Kunlun, brought by the wild tribes of the west — which is
the whole of what the classics say before the cosmogonists start building. Legge's Bamboo Annals then give
King Mu's 17th-year expedition, and **Chavannes supplies the sentence that makes the card an argument
rather than a list**: Sima Qian leaves the journey out of his Zhou annals altogether, and on the oldest
texts the figure Mu met is a barbarian chief rather than a queen.
**AND ITS SORT YEAR IS THE LATEST-DATABLE EVENT, NOT THE EARLIEST MENTION.** A mountain has no date, the
Tribute of Yu's own composition is a Warring States question rather than Yu's, and the one hard figure any
source gives is King Mu's reign from 1001 BCE — so the card sorts at −1001, after every sovereign in the
deck, which is where the Kunlun legend's earliest datable attestation actually sits.
**`cnh-020` IS THE DECK'S FIRST MODERN PEER-REVIEWED SOURCE, AND IT WAS FOUND BY SEARCHING FOR THE
GODDESS RATHER THAN THE SUBJECT** (Aug 2026). Nineteen cards had run on 19th-century reference works,
out-of-copyright translations and one Japanese bulletin, because a bare search on a Chinese mythological
name returns almost nothing scholarly. What broke it is **DOAJ's own API on the ROMANISED DEITY NAME**
(`Xiwangmu`), which returned five modern articles where `Kunlun myth` returned none — an ancient PLACE is
owned by its namesakes, a goddess is not. The usable one is Nataša Vampelj Suhadolnik's in *Asian
Studies* (Ljubljana), which is **Slovenian in the body with an English abstract and title**, so it is
cited for what the abstract states and nothing further — the Persée first-page rule met on a whole
journal. Its galley defeated the CJK PDF extractor on an odd-length hex string, which was left alone
rather than debugged, the body being in a language the card was not going to quote.
**`journals.uni-lj.si` ANSWERS AND MDPI STILL DOES NOT**: of DOAJ's five hits three were MDPI (403 here,
as cnh-003 records) and the fourth was that press again, so one host in five was reachable. **Search
DOAJ on the romanised name of a deity, and expect to lose most of what it finds to publishers.**
**AND THE PICTURE WAS RESERVED A CARD AHEAD, WHICH IS WORTH DOING DELIBERATELY.** The Freer Gallery's
*Peach Festival of the Queen Mother of the West* — a 17th- or 18th-century handscroll, 3897 × 2130,
public domain — turned up while searching for `cnh-019`'s Kunlun and was passed over there under
cnh-013's one-picture-one-term rule, because the very next card was hers. That is why cnh-019 ended with
a photograph and this one has the best-shaped image on the shelf: **when a search turns up the right
picture for a LATER card, note it and leave it.**
**ITS ONE CORRECTION IS TO A SIBLING'S MARKER, AND IT IS THE BATCH-23 FAULT IN MINIATURE.** Giles says
the peaches ripen once in 3,000 years; Werner says the tree leafs every 3,000 years and takes 3,000 more
to fruit — so `cnh-019`'s peach clause, which carries a Werner marker among its three, points at a source
that gives a different figure. The clause is compound and each marker carries part of it, so it was left
standing; what this card does is state the divergence outright rather than pick a number. **Two sources
disagreeing about a figure is a fact to carry, not a tie to break.**
**`cnh-021` IS THE CROSS-REFERENCE RULE PAYING A THIRD TIME, AND IT IS THE CHEAPEST RESEARCH ON THE
DECK** (Aug 2026). Mayers's Penglai entry is four lines and closes "See Sü She" — a pointer to his own
no. 647, which carries the whole reason a fleet ever sailed: Xu Fu's memorial to the First Emperor, the
several thousand young men and women, and the expedition never returning. A second pointer, to An-ch'i
Shêng, gives the immortal the emperor was told to look for. **A 19th-century reference work's
cross-references are locators, and here both of them were into the SAME book** — cnh-018's rule at its
most economical, two fetches for two thirds of a card.
**PENGLAI AND XU FU ARE BOTH OWNED BY THEIR NAMESAKES, WHICH IS WHY NO MODERN SOURCE WAS FOUND.**
DOAJ on `Penglai` returns the Shandong city's geology and medicine, and on `Xu Fu` a common surname —
the Gonggong dwarf planet and the Kunlun warship a third and fourth time. Searching the characters
worked for the PICTURE and not for the literature, there being no open scholarly article on the isle
reachable from here at all; the card is carried entirely by the out-of-copyright shelf, which for this
subject is where the material is.
**FOUR PICTURES WERE REJECTED AND THE ONE TAKEN SHOWS THE VOYAGE RATHER THAN THE ISLAND**, which is the
honest answer for a place nobody has seen: the Met's *Palaces of the Immortals* is a fan, so the fan
shape and its photographic colour-calibration bar both ship with it; the Han hill censers are the right
idea and **no source connects any of them to Penglai by name**, so a `desc` would be composing one; and
the modern Penglai city model is a town. Kuniyoshi's triptych of Xu Fu's fleet, at the Museum of Fine
Arts, Boston, is named, dated and public domain.
**AND ITS ONE FALSE ALARM WAS THE HARNESS'S OWN FIXTURE.** `check12.js` seeds `newPerDay: 20`, which
had exactly equalled the corpus size, so the session dealt twenty cards and reported "no card at slot
21" — a test fixture's daily cap reading as a missing card, on the one run where a missing card was the
likeliest explanation. **A seeded limit that happens to equal the data is a limit nobody notices until
the data passes it**; it is 200 now.
**`cnh-022` FOUND THE DECK'S FOURTH REFERENCE WORK, AND IT IS THE FIRST THAT IS NEITHER A DICTIONARY NOR
A NARRATIVE** (Aug 2026). Mayers and Herbert Giles give biographies and Werner retells the tales; Henri
Doré's *Researches into Chinese Superstitions* (Shanghai, 1914–1938, on archive.org in full) is an
inventory of **PRACTICE** — what is on the wall, what the figure is holding, which class of person it
stands for — and its volume IX carried more than half this card: the classification of the Eight as old
man, youth, soldier, scholar, noble, pauper, cripple and woman; each one's identifying emblem; the two
picture series; and a "General Conclusion" that dates the group, names the three members who were real
people and observes that the legends do not keep their own chronology. **Reach for Doré whenever a card is
about something a Chinese reader would have SEEN rather than read.**
**IT IS ALSO WHERE A SOURCE PRINTED FOUR ANSWERS TO ONE QUESTION AND ALL FOUR WERE WORTH KEEPING.** Doré
sets out four early lists of the Eight from four different works, and they do not agree: one substitutes
Li Yuanzhong for Li Tieguai, one drops both Zhang Guolao and He Xiangu, and one shares almost no names
with the other three. A card built on the familiar list alone would have been true of the popular
tradition and false about its history — so **ask whether a canonical set was ever actually canonical**,
and note that the woman among them is missing from two of the four.
**AND 八仙 IS THE HYDRANGEA.** A Commons search on the characters returned twenty photographs of
*Hydrangea macrophylla*, whose Chinese name is 八仙花 — the Gonggong dwarf planet, the Kunlun warship and
the Penglai city a fifth time, and the first namesake to defeat the search-the-characters rule that beat
the other four. What worked was searching the SUBJECT in English with its religion attached ("Eight
Immortals Taoist"), and the picture taken is the argument rather than an illustration of it: an octagonal
**Longquan celadon vase of the YUAN DYNASTY**, its eight faces mould-stamped with the eight figures, at
the Asian Art Museum in San Francisco — the dating claim and the on-a-vase claim in one object.
**ITS ONE CARE IS THAT TWO CONVENTIONS DATE THE YUAN DIFFERENTLY**: Werner gives 1280–1368 and the museum
labels the vase 1271–1368, one counting from the fall of the Song and the other from Kublai's
proclamation. The date line takes Werner's, being the figure a citation on this card actually carries, and
the museum's range was **cut from the picture's own caption** rather than left to sit four inches away
from a different pair of years — a reader cannot be expected to know that is a convention rather than a
mistake, and a card must not manufacture a disagreement it is not making.
**`cnh-023` IS WHERE A ROMANISATION TURNED OUT TO BE AN ORDINARY ENGLISH WORD, WHICH IS WORSE THAN THE
`afar` CASE AND CANNOT BE FIXED THE SAME WAY** (Aug 2026). `Chinese_dragon` was drafted with the aliases
**`long`** and **`lung`** — the Wade-Giles and pinyin of 龍 — and measured over the shipped card prose
those two surfaces occur **246 times**, almost none of them about a dragon. `Afar` was rescued by
`GLOSSARY_CASESENSITIVE`, because the region is capitalised and the adverb is not; here the romanisation
is lowercase and so is the English word, so **case cannot separate them and there is no rescue** — the
alias simply may not exist. It was caught in draft, and the term ships with **no aliases at all**, the
key's own surface being what the card's answer matches. **Ask of a romanised alias not only whether it is
an ordinary word in ENGLISH but whether anything could tell the two apart**; where nothing can, the
glossary does without it. Note the `add-glossary.js` trap that goes with it (cnh-008's): an alias list is
cleared only when the `aliases` key is PRESENT, so removing one means passing `[]`, not omitting it.
**AND A RUNNING HEAD MUST BE READ AGAINST THE SEQUENCE IT SITS IN, WHICH IS cnh-011's RULE ONE NOTCH
STRONGER.** Checking a Mayers page for this card showed that the Chinese Reader's Manual scan **renders a
leading 3 as an 8 throughout its running heads** — the Part II sequence reads 331, 332, 333, 834, 885,
886, 837, 838, 339, 340 — so `cnh-022`'s citation shipped as p. 838 where the entry is on p. **338**, and
the page above the entry looked perfectly ordinary on its own. cnh-011 says a locator must be READ rather
than computed; this adds that **reading ONE header is not enough on a bad scan — read the run**, since a
single mangled digit is invisible and a sequence is not. Fixed on the card and its glossary term the same
day; Part I's headers were checked the same way and are sound.
**ITS FOURTH WORK IS THE PRIMARY TEXT, and the deck should reach there earlier than it does.** The Yi
King's first hexagram is a ladder of dragons — hid in the deep, in the field, on the wing in the sky,
exceeding its proper limits — which is the locus classicus for every later claim about the creature, and
Legge's translation was already on this deck's shelf from `cnh-005`. **A card about a Chinese idea should
ask what CLASSIC states it before assembling three reference works**; the reference works then explain it
rather than carrying it.
**AND TWO PAGE-LEVEL HONESTIES ARE WORTH NAMING.** Doré's volume V has its year OCR'd into nonsense, so
the citation gives the SERIES span rather than the 1918 that catalogues and an uploader's filename both
assert — a year, like a page, is read or it is not claimed. And the Shuowen is dated AD 100 by Doré and
AD 200 by Mayers, so the card and the date line say "a Han dictionary", which is true under both.
**`cnh-024` FOUND A RENDERING FAULT IN TWO ALREADY-SHIPPED CARDS, AND IT IS A FACT ABOUT THE WHOLE
CORPUS** (Aug 2026). A great many of this site's illustrations are woodblock plates uploaded to Commons as
PNGs with a **transparent** background — black line and nothing else — and `.card-img img` set no ground of
its own, so on a dark theme they were black ink on `--paper-2`'s near-black and **the picture was a blank
rectangle**. Nothing throws, the file decodes, `naturalWidth` is right and every count reads healthy;
**only looking at it after dark shows anything**, which is why it had been shipping since `cnh-016`.
Measured rather than argued about before it was fixed: the Kuafu, Jingwei and fenghuang plates are 95–97%
transparent and **100% of their opaque pixels are dark**. The ground is a **theme-independent literal**,
and that is the decision rather than an oversight — `var(--paper)` flips dark at night and fixes nothing,
and line art is ink on PAPER, which is a fact about the object and not about the reader's theme. **Look at
a new picture on a DARK theme as well as a light one**; the same trap waits for any scan uploaded with its
background knocked out.
**AND AN OMEN BIRD CAN CARRY A DATE LINE WHERE AN EMPEROR CANNOT.** `cnh-007` leaves that field empty
because the tradition declines to date the Yellow Emperor at all, and this card's subject is a creature
that never existed and has four dated rows — because what the sources date is not the bird but the
SIGHTINGS: Huangdi's, Shun's, the one Huo Guang got up in 84 BCE for a boy emperor, and the last in 1368
on the tomb of the father of the man then taking the throne. **Ask what the sources actually date before
concluding a legendary subject cannot be dated** — a myth about an appearance carries a chronology that a
myth about a person may not. And **`Fenghuang` is a county in Hunan**, the namesake trap a seventh time
after the dwarf planet, the warship, the Shandong city, the surname, the hydrangea and the dragon boat:
searching the characters found the plate where searching the name found a tourist town.
  **`cnh-025` IS WHERE THE PICTURE CORRECTED THE PROSE, WHICH IS THE OTHER DIRECTION FROM cnh-024's**
(Aug 2026). That card found a fault in how a picture was RENDERED; this one found a fault in what the card
SAID, by looking at the plate beside it. The draft had the qilin's single horn on the authority of the
Erya, and the 1607 painting manual plate it ships with draws the beast with **a pair of horns swept back
over its shoulders** — and Doré's own footnote, already in hand, says outright that "it had but one horn is
contradicted by later writers". So the sentence now reads "a single horn, though later pictures give it a
pair", which is what the sources carry and what the reader can see. **Read a card's picture against its
prose before shipping the two together**: neither is a source for the other, but a disagreement between
them is a question worth asking, and here the answer was already in a footnote nobody had reached for.
**AND A ROMANISATION MAY BE UNUSABLE AS AN ALIAS FOR THE cnh-023 REASON, TWICE OVER ON ONE TERM.** The
obvious aliases are the halves of the name — `qi` and `lin` — and both are ordinary words in Folio's own
prose: `lin` is a Chinese surname this deck already prints (Ma Lin, Lin Ling-su) and `qi` is a term of art
the collection will card later. Neither can be separated by case, so neither exists; the term ships with
**`Chinese unicorn` alone**, which is unambiguous, and a bare `unicorn` was refused as well, since Greece
and Rome will meet the European one. Measured over the whole corpus before it was decided: every occurrence
of all four surfaces is on this card.
**ITS SOURCES ARE FIVE VOLUMES OF THE OUT-OF-COPYRIGHT SHELF AND FOUR OF THE SEVEN CAME FROM A
CROSS-REFERENCE**, cnh-018's rule paying for the fourth time: Mayers closes his entry "cf. L. C. I, proleg.
p. 86" and Doré's footnotes name Legge's vol. 5 pt. 2 p. 834, his Bamboo Annals p. 109, and Doolittle vol.
II p. 322 — each a locator into a book this deck already has. **Every one was read and every page number
checked against the running heads**, which is how the Bamboo Annals' 109 was confirmed rather than trusted
(`108]` sits four lines above the passage) and how Legge vol. 1's Prolegomena 85–86 was read off a clean
run of 83, 84, 85.
**AND THREE SOURCES GIVE THREE DIFFERENT YEARS FOR THE ONE EVENT, so the card gives none.** The capture of
the lin is dated 479 BCE by Doré, 480 BCE by Legge's own biography, and 481 BCE by the standard conversion
of the reign year — while all three agree on **the fourteenth year of Duke Ai of Lu**, which is what both
the card and its date line say. cnh-015's rule (a reference work is evidence for what a Chinese text says
and not automatically right about when) met on a date three ways contested: **where the sources disagree
about the Western year and agree about the reign year, give the reign year**, which needs no conversion and
is how the event is cited anyway.
  **`cnh-026` IS THE SECOND CARD ON THE DECK WITH AN EMPTY DATE LINE, AND THAT IS NOW A NAMED SET RATHER
THAN A ONE-OFF** (Aug 2026). `cnh-007` leaves the field empty because the tradition declines to date the
Yellow Emperor; here nothing in any source dates the scheme at all — Chavannes, Mayers, Legge and Doré each
describe the four quarters without placing them in a year, and Doré's "at the present day" is 1914. The
tempting rows are counts (four quarters, 28 mansions, seven to each), and a row of counts is **not a date
line**: the field exists for the dates worth memorising beside the answer term, and filling it with
arithmetic to avoid an empty box is the field losing its meaning. The browser harness's exemption is
therefore a LIST rather than a card name, so a third card joining it has to be added deliberately.
**AND THE ANSWER TERM'S OWN NAME IS NOT WHAT ANY SOURCE CALLS IT**, which is worth stating because the
plan line said "Four Symbols" and every work on the shelf says something else — Mayers "the Four
Quadrants, or Divisions of the 28 Constellations", Chavannes "quatre animaux", Legge only the four names
themselves. The plan's term is kept because it is the established English name a reader will meet, and the
card says plainly what the four are rather than resting on the label; the four individual names ship as
ALIASES, which is where the reader's own vocabulary actually is. Mind that 四象 also names the Yijing's
four bigram states, an entirely different thing, so the glossary description says outright that these are
quarters of the SKY.
**ITS SHARPEST FINDING IS THAT TWO SETS OF FOUR ARE CONSTANTLY CONFLATED AND MAYERS KEEPS THEM APART IN
NUMBERED ENTRIES.** The four supernatural creatures (qilin, phoenix, tortoise, dragon — pt. II, no. 94)
are not the four celestial quadrants (pt. II, no. 91), only the dragon and the tortoise are in both, and
`cnh-023`, `cnh-024` and `cnh-025` all open on the FIRST set. A card written without checking would have
said "one of the four" and meant the wrong four. **Where a reference work numbers two similar lists
separately, that separation is itself the fact.**
**AND THE cnh-023 RUNNING-HEAD FAULT PAID FOR ITSELF A SECOND TIME.** The Mayers scan renders a leading 3
as an 8 in its running heads, so the run over this entry reads 808, 304, 305, 306, 307 — the first is
p. 303 — and reading the RUN rather than one header is what put the four quadrants on p. 307 with
confidence. Where the run gave no clean read the citation names the edition's own division instead
(pt. II, no. 313 for the 28 mansions; pt. II, no. 94), which is cnh-011's rule. Chavannes' two notes were
placed the same way, off clean runs of 43, 44, 45 and 45, 47, 48, 49.
  **`cnh-027` IS WHERE A COMMITTED TEST CAUGHT WHAT THE EYE WOULD NOT, AND THE FAULT IS THE CENTURY RULE ONE
SCALE UP** (Aug 2026). The date line read "the Shang, in the 2nd millennium BCE", which is true, reads
perfectly and is **not a date `cardYears` can parse** — so the card yielded no sort year at all and fell to
0, "timeless", which on a deck running in BCE puts it after everything. `test-date-line.js`'s "every card
that states a date yields a sort year from it" is the only thing in the repo that can see this, and it
fired. The fix is the one this file already prescribes for centuries: **write the span the unit MEANS**
(`c. 2000 – 1001 BCE`), which asserts no precision the source has not got, since that interval IS the 2nd
millennium — and NOT a change to `cardYears`, which would silently move the sort year of every date line
carrying a millennium beside a plain year.
**AND A THUMBNAIL URL IS ASKED FOR, NEVER COMPOSED.** The picture rule says `src` is the 1600px rendering
of a raster, and a hand-built `…/1600px-<file>` **400s on Commons**, which snaps a thumbnail to its own
standard widths — asking the API for `iiurlwidth=1600` hands back a `1920px-` URL for this file. It was
caught by the standing curl of every citation and image URL, and only by that: the card renders from the
harness's local stub, so the browser check is blind to it. `cnh-026` got it right by accident, having used
the API's answer; this one composed the width from the rule and was wrong.
**ITS SOURCES ARE THE FIRST ON THE DECK TO REACH OUT OF SINOLOGY INTO MUSEUM ARCHAEOLOGY**, and that is
what the second half of the card needed: the earliest text to use the name means a MAN — one of the Zuo
Commentary's four wicked ones — and nothing in the classics connects him to the face on the bronzes, so
Legge and Chavannes carry the first half and can carry no more. Berthold Laufer's *Jade* (Field Museum,
1912) and S. W. Bushell's *Chinese Art* (the Victoria and Albert Museum's own handbook, 1904) carry the
second, and both are out of copyright. **What makes them worth citing is that they do not agree**: the
tiger, the all-devouring storm god and the Tibetan mastiff were each proposed within a few years, Bushell
himself offering two of them in two different books, and Laufer gathered the readings and declined to
choose — regretting in print that no evidence had been given for any of them. A card about a famous motif
whose meaning is unknown is better served by sources that say so than by one that picks a winner.
**AND `add-images.js` REFUSES MARKUP IN A TEXT FIELD WHERE `add-card.js` ACCEPTS IT**, so a `desc`
italicising a vessel name goes in through one path and is turned away by the other; it also refuses to
OVERWRITE a picture already installed, which is right for a batch installer and means a corrected URL has
to be patched in place. Mind that it writes the glossary before the cards, so a batch that throws on the
card half has **already written the glossary half** — check both before assuming nothing landed.
  **`cnh-028` IS WHERE A CROSS-REFERENCE POINTED OUT OF THE GENRE ALTOGETHER** (Aug 2026). The rule has paid
four times by following a note into another volume of a book already on the shelf; here Doré's footnote on
the Shan-hai-king cites **Wylie's *Notes on Chinese Literature***, which is not a reference work or a
translation but a BIBLIOGRAPHY OF CHINESE BOOKS — and that is what a card about a book needs and what none
of Mayers, Werner, Doré or Legge can give: how the Chinese themselves classify the work, that it has long
been read with distrust, that its defenders concluded only that it is at least as old as the Zhou, and that
it professes to describe the charts on Yu's nine vessels. **Ask what KIND of work a claim wants before
searching for the claim**; for a text, that is the bibliographer.
**AND THE PAGE NUMBER MOVES BETWEEN EDITIONS**, which is cnh-011's rule on two printings of one book: Doré
cites p. 43, and in the 1867 edition the passage is on **p. 35**, read off a clean run of running heads
(GEOGRAPHY. 35, then 36). Follow a cross-reference to the PASSAGE and then find its page in the copy you
actually have — and see `cnh-029`, which measured both halves of this and found the offset is not a
constant.
**ITS SHARPEST FINDING IS THAT THE SAME MEASUREMENT cnh-012 RAN GAVE THE OPPOSITE ANSWER.** There a shared
alias scored 11 right against 3 wrong and was KEPT, on the reasoning that the fix which scales is to give
the other thing its own term. Here the alias `Chinese` on `China` scores **1 apt use against 40**: measured
over every card abstract and glossary description, all but one occurrence is the ADJECTIVE (Chinese myth,
Chinese tradition, Chinese literature, Chinese bibliographers) or the LANGUAGE (known in Chinese as, what
Chinese itself calls the bird), and neither of those is the country. **It is not a FALSE link the way
`afar` was** — a reader who follows it gets a real description of a relevant country — **it is NOISE, on
nearly every card of a collection, which is what teaches a reader that the mark means little.** Case cannot
separate the two, both being capitalised, so the alias is simply gone and the key `China` still matches
"China" everywhere. **Ask not only whether an alias is ever right but how often, and measure over the
CORPUS rather than over the card in front of you.**
**AND IT IS THE FIRST CARD ON THE SITE WHOSE ANSWER IS A BOOK TITLE**, so the first `<b><i>`: bold marks the
answer term and italics mark a title, and the two NEST rather than one giving way. Nothing in `answer` or
`answerText` carries markup — no card's does — so the title is set plain in the answer box and italic
everywhere it is a title in a sentence.
  **`cnh-029` IS THE CROSS-REFERENCE RULE AT ITS CHEAPEST, AND IT SETTLED cnh-028's OPEN QUESTION** (Aug 2026).
Doré's two footnotes on the Li Sao name Mayers p. 107, Mayers p. 196 and Wylie p. 226 — three locators for
three different facts — and reading them gave four of the card's five sources in a sitting. **Wylie's page
was then MEASURED rather than inferred**: the 1902 reprint really does carry the Elegies of Tsoo on p. 226
and the Shan hae king on p. 43, both exactly as Doré cites, where the 1867 edition has them on 181 and 35 —
and Mayers, writing in 1874, independently cites "W.N., p. 181" for the same passage. So Doré cites the
1902 throughout and nobody is wrong; the offset is 45 in one place and 8 in the other, because the reprint
was reset. **An edition offset is not a constant and must never be applied — look the passage up in the
copy you have.**
**ITS FIRST FINDING IS ABOUT THE TOOLING RATHER THAN THE BOOK: NUMBER THE LINES, NEVER COUNT THEM.** Placing
Mayers's Qu Yuan entry by counting into a `sed` range put it on p. 106 when it is on 107 — the range came
back 66 lines where the count assumed 65, so every relative index after the first was one out, and the page
head that settles it sat fourteen lines from where it appeared to. `awk 'NR>=a && NR<=b {printf "%d| %s\n",
NR, $0}'` costs nothing and cannot drift. cnh-011's rule that a locator is READ, met one level down.
**A SLIP IN ONE SOURCE IS CORRECTED BY TWO.** Wylie puts the Dragon Boat Festival on "the fifth day of the
fifteenth month", a month the calendar has not got, where Giles and Mayers both give the fifth of the fifth
moon; the card follows the two and says nothing about the third. cnh-015's rule — a reference work is
evidence for what a Chinese text says and is not automatically right about a date — with the majority
deciding rather than a judgement.
**AND THE PICTURE AGREED WITH THE TRANSLATION, WHICH IS cnh-025's TEST PASSING RATHER THAN FIRING.** Giles
renders the ninth of the Nine Songs as a genius "clad in wistaria, girdled with ivy … riding on the red
pard", and Xiao Yuncong's plate of 1645 for that very poem shows a figure in leaf robes on a spotted
leopard, with the poem itself printed on the facing page. **Read a card's picture against its prose in both
directions**: where they disagree one of them is wrong, and where they agree the picture is doing the work
a picture is for.
  **`cnh-030` HAS THREE INCOMPATIBLE ORIGINS IN THE SOURCES AND GIVES ALL THREE** (Aug 2026). Doré and Werner
put the god's entry into the state cult at the Song emperor Zhenzong's fraud of 1012; Mayers dates the
worship to 1116 under Huizong and the Taoist Lin Lingsu; and Giles's dictionary makes him a magician named
Chang who raced another to heaven on dragons and won. A popular god has no single origin, and a card that
picks one is tidier and less true — cnh-014's rule about a name borne by several figures, met one level up,
on a single figure with several beginnings.
**THE OFFICIAL HISTORY'S OWN WORDING IS WHAT MAKES THE 1012 CLAIM SAFE, AND THE SUMMARY AROUND IT IS NOT.**
Werner writes that the god "was born of a fraud, and came ready-made from the brain of an emperor", which is
more than the evidence carries — the title is older than Zhenzong. What Doré quotes from the *Zizhi tongjian
gangmu* is narrower and checkable: at that date "the name of Yuh-hwang figures for the first time on the list
of divinities to be worshipped". The card says the second and not the first. **Where a source's summary
reaches further than the document it quotes, cite the document.**
**AND THE STYLE CHECKER'S AMBIGUOUS-NAME LIST CANNOT BE SILENCED, WHICH IS HOW IT FOUND A REAL ERROR.**
`check-style` reports every un-italicised occurrence of nine person-or-book names — Laozi, Mencius, Zhuangzi,
Liezi and the rest — as "fix by hand", and there is no annotation that records a decision, so a card
legitimately naming the PERSON would leave a standing finding for ever, and a checker carrying two permanent
findings is one nobody reads. Rather than accept that, the draft went back to the sources, and **they do not
say Laozi at all**: Werner writes "Lao Chun" and Doré "Lao-kiin", both 老君, **Lord Lao** — the deified
Laozi, not the philosopher. The paraphrase had gone a step past the record and the flag is what sent me
back. **Treat a name on that list as a prompt to check which of the two you mean AND whether your source
says it.** Two tooling notes go with the fix: `fix-field.js` reaches `abstract` and cannot reach the
`questions` array, so one word in both takes two tools, and `add-questions.js` needs `--partial` while the
site is English-only, since it still asks for nine translated pools.
**WHEN COMMONS RATE-LIMITS, VERIFY A `src` BY SHA1 RATHER THAN BY A 200.** `upload.wikimedia.org` answered
429 to every retry for the best part of an hour across these three cards, which makes the standing
curl-every-URL check impossible — and the API's `imageinfo` will still hand back the file's `sha1` and
`size`. Comparing those against the copy already downloaded proves the URL names the file that was looked
at, which is what the check is actually for; a 200 only proves the CDN is answering today.
  **`cnh-031` PROVED THAT WIKIMEDIA'S 429s WERE NEVER RATE LIMITING, AND THIS CORRECTS THE NOTE UNDER
`cnh-030` DIRECTLY** (Aug 2026). Three cards running, `upload.wikimedia.org` answered 429 to every request
for the best part of an hour and the response was treated as congestion — background retry loops,
`Special:FilePath` as a way round, and a sha1 comparison standing in for the curl check the file's standing
rule demands. **The body of the 429 says what it actually is**: "Your request does not comply with our robot
policy". It is the USER-AGENT, not the rate — curl's default identifies nothing, and Wikimedia's policy
refuses it. One `-H "User-Agent: <name>/<version> (<contact URL>; purpose) curl/8"` fetched the file **first
try**, at full size, seconds after two hundred patient retries had failed. **READ THE BODY OF AN ERROR
BEFORE INFERRING WHAT IT MEANS FROM ITS STATUS CODE** — a 429 with `retry-after: 2` looks exactly like a
condition that will pass, and this one never would have. The sha1 workaround stays useful and is no longer
needed here: the standing curl of every citation and image URL is possible again, and all nine of this
card's returned 200.
**A CROSS-REFERENCE CHAIN PAID FOR THE FOURTH TIME AND THE BOOK IT NAMED WAS ALREADY ON DISK.** Doré's
footnote on the Taoist handbook cites "Wylie. Notes on Chinese Literature, p. 224", and `cnh-028` and
`cnh-029` had already cached both of Wylie's editions for unrelated reasons — so the fifth work cost one
grep and supplied what no other source states: that the *Yuli chaozhuan* is a late Taoist production by a
monk named Tan Chi who claimed to have visited the regions of darkness and come back with the account.
**A caches directory built for one card is a library for the next**; before searching for a new work, grep
what is already there. (Note the edition offset `cnh-029` records, working here in reverse: the passage is
p. 224 in the 1902 reprint Doré cites and **p. 179** in the 1867 this deck cites, and neither is derivable
from the other.)
**ITS SUBJECT IS A NATURALISATION, AND THE PICTURE RESERVED FOR `cnh-032` DISAGREES WITH IT ABOUT THE
DATE — WHICH IS SAID HERE SO THAT CARD CANNOT INHERIT IT QUIETLY.** Doré puts the ten courts and the Jade
Emperor's rule over hell under the Song, and the British Museum's *Kshitigarbha with the Ten Kings of Hell*
from Dunhuang — the obvious illustration for the next card — is dated late 9th to early 10th century, which
is before it. This card says what its source says; **`cnh-032` must settle the tension rather than carry
both**, and the Dunhuang scroll is the picture to reach for there. `cnh-031` takes the Metropolitan Museum's
Jin Chushi instead, whose record was corroborated against the **museum's own API** (`Ten Kings of Hell`, Jin
Chushi, before 1195) rather than against the uploader's title, which names a king the Met does not — so the
caption states the set the museum names and **attributes the identification of Yama to the uploader**, which
is `cnh-019`'s rule.
**AND THE PICTURE AGREES WITH THE PROSE, WHICH IS WORTH SAYING BECAUSE `cnh-025` IS THE CASE WHERE IT DID
NOT.** The scroll's upper register is a king at a desk with a clerk in green leaning in holding out an open
document — the life-register the card's last sentence is about — with a soul dragged towards a mirror below
and torments at the foot. Read the two against each other every time; here the agreement is the check
passing rather than a coincidence.
**A THREE-DIGIT YEAR IS INVISIBLE TO `cardYears`, SO A DATE LINE SPANNING ONE SORTS FROM ITS LATER END.**
The obvious first row was "the Song, 960 – 1279", and the year pattern matches `1\d{3}` and `20\d{2}` and
nothing shorter, so that line would have sorted the card at **1279 — the end of the span it opens** — with
nothing thrown and every count healthy. Huizong's reign (1101 – 1126) states the same fact in four digits
and sorts at 1101. **Measured over the whole corpus before it was written up: no shipped card is affected
today**, so this is a rule for writing a date line rather than a bug to fix — and it is the century problem
`cnh-027` records, one order of magnitude down.
**AND A MIS-LINK WAS MEASURED AND DELIBERATELY LEFT, WHICH IS THE OTHER HALF OF `cnh-010` AND `cnh-012`.**
"walking to an iron gate" auto-links `Iron`, the metal — noise on a card about hell, and **not a category
error**: the gate is made of the substance the term defines, where `afar` pointed at an Ethiopian region and
`tripod` at a Greek cauldron. The term is lower-case by necessity (the deck says "smelting iron", "iron
tools"), so `GLOSSARY_CASESENSITIVE` would break the majority to mend a distraction. **Ask whether a link is
WRONG or merely loud before reaching for the tools that fix a wrong one.**
  **`cnh-032` SETTLED THE TENSION `cnh-031` FLAGGED BY FINDING WHAT COULD BE SAID RATHER THAN PICKING A
SIDE** (Aug 2026). That card recorded that Doré dates the ten-court legend to the Song while the British
Museum's Dunhuang *Kshitigarbha with the Ten Kings* is late 9th to early 10th century, and left the question
for this one. The earlier attestation **could not be cited from here** — `britishmuseum.org` and `idp.bl.uk`
are both 403 even with a proper user agent, and the one open scholarly article DOAJ finds on the Dunhuang
*Ten Kings Sutra* is in *Religions*, which is MDPI and 403 as `cnh-003` records — so it is **not asserted**.
What the card says instead is stronger and better sourced: not WHEN the scheme arose but WHERE IT COMES
FROM, which is one Taoist monk's handbook, per Doré's own footnote citing Wylie. And the picture chosen is a
**Southern Song** album leaf, which agrees with the card rather than contradicting it. **A flagged tension is
resolved by narrowing the claim to what the open sources carry, and by not shipping a picture that argues
with the prose.**
**A MUSEUM'S ONLINE RECORD CAN BE THE SOURCE THAT STATES THE CENTRAL THING**, which is batch 18's rule
paying at the top of a card rather than at its edges: the Cleveland Museum of Art's page for accession
2004.1.29 says outright that "the netherworld is divided into ten realms, each ruled by one of these kings"
and dates the leaf to the 1200s, and it is the fifth work on a five-work card. It is also unusually
**cautious** — "his identity remains unclear", "could show a specific mountain", "would represent a unique
treatment" — which is exactly what makes it worth citing, and what the caption copies rather than tidies up.
**DORÉ'S FOOTNOTE NAMED A PAGE THIS DECK HAD ALREADY READ OFF THE RUNNING HEADS**: he cites Giles p. 245 for
Han Qinhu, which is where `cnh-031` independently placed that entry. **A cited page that matches one you
found yourself is the cheapest corroboration there is** — the converse of `cnh-011`'s computed locator, and
worth noticing when it happens rather than only when it fails.
**AND AN AUTO-LINK ASSERTION THAT FAILS MAY BE THE PROSE'S FAULT RATHER THAN THE GLOSSARY'S.** The harness
asserted that `Diyu` links from this card and it did not: the abstract said "the Chinese underworld" and
never named it, and the corpus has no `Buddhism`, `Taoism` or `Song_dynasty` term either, so `ttips` was
legitimately **empty**. Naming Diyu in the first sentence fixed it and is better writing besides. **Where two
consecutive cards are about one subject, check that the second NAMES the first** — the link is the only thing
on the page that joins them.
**A GLOSSARY KEY MAY DIFFER FROM THE CARD'S ANSWER TERM, AND THE ALIAS IS WHAT JOINS THEM.** The answer is
`ten courts of hell`, which carries no article as the rule requires, while the key is `Ten_Kings_of_Hell` —
the name Wikipedia uses and the name the Met and Cleveland both give their paintings. The answer is an alias
of it, which is what makes `autoLinkGlossary`'s answer-suppression work on this card and what lets a reader
who has met either name find the entry.
  **`cnh-033` SPLITS WIKIMEDIA'S 429 IN TWO, WHICH IS `cnh-031`'s RULE EARNING ITS KEEP RATHER THAN
REPEATING IT** (Aug 2026). That card found that the 429s were the ROBOT POLICY refusing curl's default
user agent, and the fix was one header. With that header in place a 429 came back anyway — and its body is
a **different message**: "Too many requests … or instead use thumbnail images in sizes listed on
https://w.wiki/GHai". This one is genuine congestion, and it names its own workaround. **Read the body every
time; one status code can hide more than one condition, and the second one does not go away because the
first was fixed.** Two follow-ons worth knowing. **THE THUMBNAIL ADVICE HAS NOTHING TO OFFER ON A SMALL
FILE**: where the original is under the standard widths MediaWiki generates no thumbnail at all, and
`iiurlwidth=640` hands back the ORIGINAL url with the requested dimensions beside it — so there is nothing
to fall back to and a backoff is what remains (it landed on the second try). And **THAT is the case
`cnh-030`'s sha1 check was written for**: with the CDN throttling, comparing the API's `sha1` and `size`
against the bytes already downloaded proves the `src` names the file that was looked at, where a 200 only
proves the CDN is answering this minute. The workaround is the right tool here and was the wrong one there.
**THE STANDING CURL OF EVERY CITATION URL CAUGHT A DEAD ARCHIVE.ORG IDENTIFIER, AND THE CAUSE WAS A
TRUNCATED GREP.** `https://archive.org/details/researchesintoch05doru` is a 404 — the identifier is
`…doruoft` — and it reached both the card and its glossary term because it was copied out of a
`grep -o "…\{0,150\}"` whose output had been **cut mid-URL**, and `…05doru` reads as a complete
archive.org id. The corpus was otherwise clean, so it was introduced rather than inherited, and it was
found in the one second it takes to curl five links. **Grep the IDENTIFIERS rather than a window of
characters** (`grep -o "researchesintoch0[0-9][a-z]*" data.js glossary.js | sort | uniq -c` shows the whole
distribution at once and makes the odd one out obvious) — and `cnh-006`'s rule stands: the tools check that
a citation ENDS in a URL and never that the URL opens.
**TWO SOURCES DISAGREE ABOUT HOW THE CULT'S FOUNDER ENDED, SO THE CARD ASSERTS NEITHER.** Werner has Li
Shaojun put to death after forging a script inside an ox's stomach; Giles's dictionary entry says only that
he pretended to have discovered the elixir of immortality and that he died while the emperor's expedition
to the Isles of the Immortals was away. The ox forgery is told at the same court of a different magician,
so the card says the legend has the worship beginning with a Han magician who persuaded Emperor Wu to offer
the first sacrifice, and stops. `cnh-015`'s rule on a second card: a reference work is evidence for what a
Chinese text says and is not automatically right about the rest of the story.
**AND DORÉ CONTRADICTS HIMSELF ABOUT WHEN THE GOD COMES BACK** — the 4th day of the New Year in his note in
volume 5, the last day of the old year in his narrative twenty-five pages later — so the date line carries
only the ASCENT, on the 24th of the 12th moon, which he and Doolittle agree on. **A date line carries what
the sources agree on**; the divergence belongs in the prose or nowhere. (`add-images.js` refused the `<i>`
in the picture's description again, which `cnh-027` already records and which recurs on every illustrated
card whose caption names a book.)
  **`cnh-034` REACHES PAST FOUR REFERENCE WORKS TO THE TEXT THEY ARE ALL REPORTING, AND THAT TEXT WAS
ALREADY ON THE SHELF** (Aug 2026). Doré's footnotes on the door gods point to his own volume 3, page 261,
which turns out to be a bare list — Menshen as the fourth of six tutelary household gods invoked in charms,
beside the ancestral tablets and the god of the stove — one good sentence and no legend at all. What
carried the card is `cnh-009`'s rule at full strength: the legend is quoted in **Wang Chong's *Lunheng*,
Alfred Forke's translation of 1907 being open on archive.org**, and Wang Chong is quoting the *Classic of
Mountains and Seas*, which is `cnh-028` and already a card. The mountain, the peach tree three thousand li
round, the ghosts' door in its north-eastern boughs, the two spirits, the reeds, the tigers and the Yellow
Emperor's peach-wood figure are all in one paragraph there, where the four mythographies each carry a
retelling of it. **Before assembling reference works, ask which ancient text they are all retelling and
whether a translation of it is free.**
**TWO SOURCES QUOTE TWO DIFFERENT ANCIENT BOOKS FOR THE SAME LEGEND, AND THE DIVERGENCE IS THE FACT.**
Forke's *Lunheng* cites the *Shanhaijing* and Mayers cites the *Fengsu tongyi*; the two brothers, the cords
of reed and the tigers are the same in both, and what happens NEXT is not — the *Lunheng* has the Yellow
Emperor paint the two spirits on house doors, the *Fengsu tongyi* has officials cut peach-wood figures on
the year's last night and paint a TIGER on the doorway, and Mayers adds that in his own century what was
pasted up was often the two NAMES on squares of paper and no picture at all. The card gives the practice as
three stages rather than picking one, which is `cnh-030`'s rule about several origins applied to a custom.
**AND THE BIBLIOGRAPHER IS WHAT SAYS HOW MUCH OF THE QUOTED BOOK SURVIVES** — `cnh-028`'s rule paying a
second time: Wylie's *Notes on Chinese Literature* (p. 131) records that the *Fengsu tongyi* left Ying
Shao's hand in 30 books and an appendix and has been "sorely mutilated in the course of transmission", the
present edition standing at 10. That is a fact about the EVIDENCE which no mythography states.
**A RUNNING HEAD CAN BE MIS-OCR'd INTO A FOUR-DIGIT NUMBER, AND ONLY THE RUN SHOWS IT.** Giles's page 151
reads "A Chinese Biographical Dictionary 454" in the scan, and the run around it is 149, 150, **454**, 152,
153. `cnh-023` found the same scanning house turning a leading 3 into an 8 in Mayers's heads; this is that
rule on another book and another mangling, and it is what decided whether the citation reads 152 or 151–52.
**Read the RUN, never one header** — and note that Giles's marginal entry numbers arrive as an unalignable
block of five, so the citation gives the page alone, which is `cnh-018`'s rule.
**A MOUNTAIN'S NAME WAS DROPPED RATHER THAN ROMANISED.** Werner writes "Mount Tu Shuo", Forke "the Tu So
Mountain" and Mayers "mount Tu So", and not one of the three prints the characters in a form the OCR keeps.
The deck's convention is pinyin, and composing one from characters nobody has read would be inventing a
transliteration — so the card says "a mountain in the eastern sea" and does not name it. **Where the
sources give two romanisations and the characters cannot be read, the NAME is what goes, not the sentence.**
**AND A COMPOSED THUMBNAIL WIDTH 400s WHERE THE API'S OWN ANSWER WORKS**, which is `cnh-027`'s rule met on
a rendering rather than an original: MediaWiki snaps to its own set of widths, so a hand-built `1600px-`
URL is a 400 on a file for which it generated 1920. Ask with `iiurlwidth` and take the `thumburl` that
comes back, stripped of its `utm_*` query — and expect `cnh-033`'s congestion 429 on the way, which cleared
on a retry and handed back bytes identical to the ones that had been looked at. The picture taken shows the
PRACTICE rather than the gods — a pair of studded doors with an armed figure on each leaf — which beat a
better-provenanced colour photograph of a temple whose doors were standing open. (The seven citations
reading "Henri Doré" were restandardised to the "Henry Doré" of the volume's own title page, which the
other nineteen already used.)
  **`cnh-035` IS THE FIRST CARD ON THE DECK WHOSE OWN ANSWER TERM IS A MISNOMER, AND SAYING SO IS THE
CARD** (Aug 2026). Mayers files the twelve animals at pt. II no. 303 and, separately at no. 302½, "The
Twelve Divisions of the Ecliptic", which he quotes John Williams calling "in some degree analogous to
our signs of the Zodiac" — so the ANIMALS are not the Chinese zodiac in the astronomical sense and the
ecliptic divisions are. The English name is what a reader will meet, so it stays the answer term, and
the fifth sentence of the abstract says what it actually is: twelve animals attached to a counting
series, the earthly branches, which also number the double hours and the points of the compass. **Where
the established English name for a thing misdescribes it, keep the name and spend a sentence on the
correction** — the alternative is a key nobody searches for.
**`cnh-034`'s NEW SOURCE PAID FOR ITSELF THE NEXT DAY, WHICH IS THE ARGUMENT FOR NOTING WHAT A CACHE
NOW HOLDS.** Forke's *Lun-hêng* was fetched for the door gods; its Part I carries Wang Chong taking the
whole elemental scheme apart on the evidence — if water beats fire, why does the rat not drive off the
horse, and why does the cock not eat the hare? — and its Part II carries an entire **Appendix II on the
cycle of the twelve animals**, with the list, the statement that Wang Chong is "perhaps our oldest
source", Chavannes's estimate of the 1st or 2nd century BCE, and the divided opinion on a Turkic
origin. Two of the card's seven citations and its whole closing argument came out of a book already on
disk. **Before searching, grep the caches** — `cnh-031`'s rule, met on a book fetched for an unrelated
card one day earlier.
**AND PART II'S SCAN IS A 1962 REPRINT WHERE PART I'S IS THE ORIGINAL, WHICH ONLY THE TITLE PAGE
SAYS.** The two archive.org items look alike and are cited alike everywhere else; Part II's front matter
reads "SECOND EDITION … PARAGON BOOK GALLERY, New York, 1962 … an unaltered and unabridged reprint of
the last (1911) edition", so the citation names the 1911 edition and the reprint that was actually
read. **Check the front matter of every scan for a reprint notice** rather than trusting the year an
item's title carries; the page numbers are only the 1911's because the reprint says it is unaltered.
**THE MAYERS SCAN'S LEADING 3 IS AN 8 AGAIN, ON A THIRD SET OF PAGES.** The run over the sexagenary
entry reads 849, 850, 351, [352 lost], 353 — that is 349 and 350 mangled — which `cnh-023` first found
in this book and `cnh-034` met as a 151 rendered "454" in Giles. It is the same scanning house and the
same digit, and reading the RUN rather than one header is what put the citations at 348–49 and 351–52.
**THE DATE LINE CARRIES THREE ATTEMPTS AT DATING ONE THING AND THAT IS HONEST RATHER THAN UNTIDY**: the
oldest witness (Wang Chong, born 27 CE, off Forke's own biography), Chavannes's guess at the 1st or 2nd
century BCE, and Chao Yih's 2nd century CE for naming years by animals. `cardYears` reads only the
first, so the card sorts at 27 CE — the earliest attestation, which is `cnh-019`'s rule for a subject
older than anything that can date it. Note what the probe found while the rows were being chosen:
**a bare three-digit year is invisible to `cardYears` and a three-digit year followed by CE is not**
(`627 – 650` yields nothing, `627 – 650 CE` yields both), so the blind spot `cnh-031` recorded is
narrower than it looked — it is the missing ERA MARKER rather than the digit count.
  **`cnh-036` IS THE FIRST CARD ON THE DECK WHOSE TITLE COULD NOT GO IN THE DATE LINE, AND THE CHECKER
IS WHAT FOUND IT** (Aug 2026). The line opened `Oldest notice | the Huainanzi, by 122 BCE`, which reads
well and is exactly right — and `check-style`'s `title-plain` rule flagged it, because a **date line
carries no markup** (`date-line.js` refuses it) and a literature title that cannot be italicised is a
title the house rules will not have. The two rules meet head-on and neither gives way, so the ROW gives
way instead: `a Han treatise, by 122 BCE`, which is what the glossary term already says and which asserts
nothing extra. **Where a date line wants to name a book, name what KIND of book it is** — and note that
`cnh-034`'s `Told again in | the Fengsu tongyi` passed the same checker, so the rule is a list of known
titles rather than a general one and a second offender will not always announce itself.
**A DATE-LINE FIGURE NEEDS ITS OWN CITATION, AND NOTHING IN THE REPO CHECKS THAT.** The line asserts
122 BCE, the year Liu An died, and the abstract's *Huainanzi* sentence was marked to Mayers no. 311 and
Wylie — neither of which gives the year. `add-sources.js` was satisfied (every source referenced, no
marker past the end), `test-date-line.js` was satisfied (the span parses, the card sorts at −122), and
the figure rested on nothing. It is `cnh-011`'s invented page number in another coat: **the apparatus
checks the SHAPE of a citation and never what it carries**, so a date line's numbers have to be walked
against the source list by hand. Fixed by citing Mayers pt. I no. 412 as a sixth work for Liu An's death,
which pushed the abstract to 331 words and cost two compensating trims — **budget for the length rule
when a correction adds a clause**, which this file has said once before and which bites hardest at the
end of a card rather than at the start.
**AND THE PICTURE WITH THE BETTER PROVENANCE WAS REJECTED FOR WHAT THE DIGITISATION SHOWS.** The National
Palace Museum's fan of the subject is named, dated and public domain, and its Commons file is a
photograph of the fan on its mount **with a Kodak colour-calibration bar down one side** — which is a
picture of a museum's imaging setup as much as of the painting, and which `cnh-021`'s Met fan already
records shipping with. The Long Corridor panel taken instead names no painter and shows the thing the
card is about: the two of them meeting on the bridge of magpies, with the children between them. **Where
two candidates are both honest, prefer the one whose FRAME is the picture** — a calibration bar is a fact
about the scan and a `desc` that ignores it is a caption that does not describe its own image.

  **`cnh-037` IS WHERE THE 19th-CENTURY SHELF FINALLY RAN OUT, AND THE TOOL THAT REPLACED IT SHOULD HAVE
BEEN INSTALLED THIRTY CARDS AGO** (Aug 2026). Every card before this one is carried by Mayers, Giles,
Legge, Doré, Werner, Doolittle, Wylie, Forke and Chavannes; **not one of them mentions the White Snake**
— checked across every cached volume, and Dennys's *Folk-Lore of China* and Couling's *Encyclopaedia
Sinica* were fetched and searched as well. That is a fact about Victorian sinology rather than about the
search: it worked on the canon, and this is a vernacular story. So the card is the deck's first built
entirely on modern scholarship, and what unlocked it was **`pip install pypdf` in a venv**. Two of the
three best sources are PDFs whose fonts carry no ToUnicode map, and a hand-rolled stream reader returns
a substitution cipher — the UW dissertation decodes into readable English only after cracking about
forty characters by crib, and the *Asian Folklore Studies* article does not decode at all. **`pypdf`
reads both perfectly in one line.** The system `pypdf` is unusable here (its `cryptography` import
panics); `python3 -m venv` plus `pip install pypdf cryptography` works, and that venv should be the
first thing reached for on any PDF from now on — see `cnh-003`, which wrote three CJK-PDF rules the
hard way for exactly this reason.
**AND THE CIPHER GOT A DATE WRONG, WHICH IS THE POINT.** Read through the crib the dissertation's own
title page gave "12/14/2018" and a fluent, confident 2018; read by `pypdf` it is **2020**, examined
12/16/2019, and Feng Menglong's dates are 1574–1645 where the cipher offered two incompatible readings.
`cnh-011`'s rule is that a locator must be READ and never computed — this is the same rule about a
DECODING, and the failure is worse than an unreadable page, because a cracked cipher reads as clean
prose and gives no sign of which characters are still wrong.
**FOUR ACCESS FINDINGS GO WITH IT.** **A DEAD LINK ON A JOURNAL'S OWN SITE MAY BE ALIVE IN THE WAYBACK
MACHINE**, and that is a citable URL: `asianethnology.org` is JavaScript-driven (`cnh-001`) and 404s on
every path to Lai's article, while `http://archive.org/wayback/available?url=…` finds a 200 snapshot
that serves the PDF. **THE FREE BIBLIOGRAPHIC APIs HAVE CLOSED**: OpenAlex now answers "Insufficient
budget" without a key and Semantic Scholar 429s, so DOAJ's `api.ctext`-style open endpoint and plain
site-scoped search are what remain. **`nhuir.nhu.edu.tw` RESETS THE CONNECTION** — checked against
`$HTTPS_PROXY/__agentproxy/status`, which reported no relay failures, so it is that host and not the
proxy, and a refused connection is a different fact from a paywall. **AND `api.ctext.org/gettext`
REQUIRES AUTHENTICATION** where `ctext.org/wiki.pl?if=gb&chapter=N` is open, which is how both primary
texts were cited; a query-string URL with a bare `&` is already used by 61 shipped citations and
`SRC_URL_RX` takes it.
**ITS MIS-LINK WAS MEASURED AND DELIBERATELY KEPT, which is `cnh-031`'s question answered the other
way.** "the European stories of marriage with a demon woman" links *European*, an alias of `Europe`, and
the surface occurs **114 times across the corpus, every one of them the adjective**. That looks like
`cnh-028`'s `Chinese` alias, which was removed at 1 apt use against 40 — and it is the opposite case:
*Chinese* myth is not the country, where *European* fossils really are of Europe, so the link's referent
is right in all 114. **Ask whether the adjective means the PLACE before reading a loud link as a wrong
one.**

  **`cnh-038` IS WHERE A MANGLED FIGURE WAS DECODED, CONFIDENTLY, AND THE DECODING WAS WRONG** (Aug 2026).
  Williams's *Middle Kingdom* gives the Ningbo Mazu temple as "founded by Fuhkien men in the **liJth**
  century" in the Google scan this deck has been using — and `liJth` reads as `13th` at a glance (l for 1,
  J for 3), which is what the draft said. A second copy of the same 1883 volume, the Wellcome scan
  `b29352897_0001`, prints it clean: **12th century**. `cnh-011`'s rule is that a locator must be READ and
  never computed and `cnh-023`'s is that a bad scan needs the RUN of running heads rather than one header;
  this is the same rule on a FIGURE IN THE PROSE, where it matters more, because a page number that is
  wrong sends a reader to the wrong page and a century that is wrong is simply a false statement about the
  world. **The fault is invisible to everything**: "13th century" is a well-formed sentence, `check-style`
  passes it, the date line takes it, and no count anywhere can see it. **Where an OCR mangles a figure,
  fetch a second scan rather than reading the mangling** — and then cite the copy a reader can actually
  read, which is why the citation names the Wellcome scan and not the Google one.
  **FINDING A SECOND SCAN IS TWO REQUESTS.** `archive.org/advancedsearch.php?q=title:(…)+AND+creator:(…)&output=json`
  lists every copy of a book with its year, and where `download/<id>/<id>_djvu.txt` answers **500** — which
  it does for a good half of these items — **`stream/<id>/<id>_djvu.txt` answers 200**, returning an HTML
  wrapper with the whole OCR inside it, which greps exactly as well. The clean copy also confirmed the page
  independently (its plate list reads "Temple of the Goddess Ma Tsu-pu, Ningpo, . . . to face 123" and its
  running head "NINGPO, CHINHAI, AND THE ARCHIPELAGO. 123" sits directly above the passage) and its
  signature marks "Vol. I.—1" onward confirm the volume, which is what a citation asserts.
  **THE PICTURE CORRECTED THE PROSE, WHICH IS `cnh-025`'s TEST FIRING A SECOND TIME.** The draft read "In
  her temples she stands between two assistants", and the Qing statue chosen shows her ENTHRONED — which
  sent me back to Doolittle, who writes that the goddess "has two principal assistants, whose images stand
  one on each side of her own in her temples". It is the ATTENDANTS who stand, and the draft had it the
  wrong way round. **Read a card's picture against its prose in both directions**: a disagreement between
  them is a question worth asking, and here the answer was in the source all along.
  **THE 19th-CENTURY SHELF DELIVERS HERE, AND ONLY UNDER EACH AUTHOR'S OWN ROMANISATION.** Doolittle's
  Fuzhou goddess is **"Ma Chu"** and Williams's Ningbo one is **"Ma Tsupu"**; a search for *Mazu* finds
  neither, which is `cnh-005`/`008`/`009`/`010`/`014`'s grep rule for the sixth time. **AND TWO NAME
  COLLISIONS HAD TO BE CLEARED BEFORE ANY OF IT COULD BE USED**: Doré's "Ma-tsu" is **Mazu Daoyi**
  (馬祖道一), the Chan patriarch, a different person by seven centuries, and Giles's "Goddess of Sailors" is
  Lung Mu. So `Ma-tsu` was drafted as a glossary alias and **dropped before shipping**, on `cnh-023`'s rule
  that an alias another real subject can claim must not exist — the collection will card Chan Buddhism
  later, and that is when it would have bitten.
  **AND ITS HEADLINE FIGURES ARE CONTESTED, SO THE CARD CARRIES NONE OF THEM.** Three open papers, two of
  them a year apart, give the cult's reach as 200 million followers in 33 countries with 5,000 temples,
  300 million in 46 with 10,000, and 300 million in 49 with 10,000 — a half again on the first figure. The
  card says the cult spread with emigration and stops. **Where several open sources state a headline figure
  and disagree about it, that figure is not something the card knows**; what they agree on — the UNESCO
  inscription of 2009, which two of them date to the day — is what it carries.
  **`cnh-039` IS WHERE A FOOTNOTE NAMED A WHOLE VOLUME THE DECK DID NOT HAVE** (Aug 2026). The
  cross-reference rule has paid five times by pointing at a page; here Doré's note on the Buddhist legend
  cites "Chinese Superstitions. Vol. VI. p. 71-88" — a seventeen-page article on the God of War in a volume
  that had never been fetched — and that article carries the entire deification sequence with its dates, the
  Qing elevation of 1856, the temple count and the reason a war god is worshipped by scholars. **Follow a
  footnote that names a volume as readily as one that names a page**; four of this card's six citations came
  out of it and its neighbour.
  **FOUR INDEPENDENT WITNESSES, AND THE MOST CITED OF THEM PUTS HIM IN THE WRONG PROVINCE.** Mayers, Werner
  and Doré each make Guan Yu a native of Jiezhou in **Shanxi**; Herbert Giles's dictionary says **Shandong**.
  The card follows the three, which is `cnh-029`'s rule that a slip in one source is corrected by two — and
  the thing to carry is which source slipped, since Giles is the authority the other three keep citing in
  their own footnotes. **A reference work being everybody's authority is not the same as its being right.**
  **AND A PAGE CITED BY ONE SOURCE AND FOUND INDEPENDENTLY IN ANOTHER IS THE CHEAPEST CORROBORATION THERE
  IS** — `cnh-032`'s rule again: Doré's footnotes give "Giles. Chinese Biographical Dictionary, p. 383" and
  "p. 384", and reading the run of Giles's own running heads (381 through 388) puts entry 1009 on exactly
  those two pages.
  **BOTH ARCHIVE.ORG IDENTIFIERS WERE WRITTEN FROM MEMORY AND BOTH WERE WRONG BY ONE LETTER** —
  `chinesereadersma00maye` for `chinesereadersm00maye`, `chinesebiographi00gile` for `chinesebiograph00gile`,
  each of which is a 404 and neither of which any tool here can see, `cnh-006`'s rule being that the checks
  test that a citation ENDS in a URL and never that the URL opens. What caught them before a single fetch was
  **grepping the shipped corpus for the identifiers it already cites**
  (`grep -o "archive.org/details/[a-zA-Z0-9._-]*" data.js glossary.js | sort -u`), which costs nothing and
  additionally keeps one book cited one way. **Do that first whenever a card reaches for a work the deck has
  used before**, and copy the whole citation form while you are there — this deck writes Doré as "trans.
  M. Kennelly, second part, vol. N (Shanghai: T'usewei Printing Press, YEAR)", and the volume's own title
  page is what says which part and which year rather than the archive.org item's metadata.
  **AND THE BEST PICTURE FOR THE CARD'S BEST FACT WAS NOT THE ONE SHIPPED.** Commons carries a wall painting
  of Guan Yu reading the Spring and Autumn Annals by candlelight — the card's closing sentence exactly, red
  face and all — and it is an undated modern mural photographed by a traveller, where the Metropolitan
  Museum's hanging scroll is catalogued to about 1700 with a medium, a size and an accession number that its
  own API confirms. `cnh-013`'s rule settled it: **a `desc` is a claim, so prefer the file whose record can
  support one.** The cost is named rather than hidden — the scroll paints his face a warm tan where the
  legend makes it red, and the dark-faced figure in it is an attendant, so the caption identifies the central
  figure instead of leaving a reader to pick him out.
  **`cnh-040` IS WHERE TWO PICTURE RECORDS FAILED IN OPPOSITE DIRECTIONS AND ONLY LOOKING TOLD THEM
APART** (Aug 2026). The Vanderbilt Fine Arts Gallery's *Ink Rubbing of Reliefs from the Offering Shrine
of Wu Liang* (4589 × 3071, accession 1985.022, public domain) is a record that is TRUE and misleading:
the Wu Liang shrine is famous for its register of ancient sovereigns, and what is in this particular
frame is three bands of chariots, horses and a procession. The Übersee-Museum Bremen photographs
described as "Grabstein aus der Zeit der Han-Dynastie … Teil eines Reliefs vom Grab der Familie Wu in
Jianxiang" (4752 × 3168, CC BY-SA, the largest candidate by a wide margin) are the other kind: a seated
Buddha with a mandorla between two attendants under an inscription — a **Buddhist votive stele**, not a
Han relief and not the Wu family shrine, with the file's own second Commons category, "Buddhist
gravestones in China", carrying the accurate reading. **A record can be right and misleading, or wrong
outright, and the picture is the only thing that says which** — cnh-013's rule that a `desc` is a claim,
met on a record whose claim is false rather than merely thin. Had either been trusted on its resolution
and its description, a procession or a Buddhist stele would have shipped as the legendary sovereigns.
  **SO THE PICTURE TAKEN IS SMALL, AND THAT IS THE TRADE STATED RATHER THAN HIDDEN**: Chavannes's own
plate of 武梁祠第一石 at **617 × 815**, under the ~900 px bar, because it is the only free image showing
the sovereigns AS A SEQUENCE — a row of robed figures each framed in his own compartment, which is what
a card about a legendary PERIOD is about, where a single sovereign is not. Two things fell out of it.
The man who published the plate, 沙畹, **is Édouard Chavannes**, cited twice on this same card, so the
illustration and the apparatus come from one hand. And the record names the STONE and not the figures on
it, so the caption names the stone and the `alt` describes what is in the frame — cnh-019's rule, which
is what keeps a picture from being read as a source.
  **A COMPOSED THUMBNAIL WIDTH RETURNS 400, NOT 404**, which is cnh-027's rule one notch sharper:
Commons generates a fixed set of widths and answers any other with "Error: 400, Use thumbnail sizes
listed on …", so a hand-built `1024px-` URL fails differently from a wrong file name and reads like a
missing file. Ask the API and take the `thumburl` it hands back. And when the standing curl of every
image URL came back **429** — the congestion kind, with a proper user agent already in place (cnh-031,
cnh-033) — the file was verified by **SHA1 against the API** and matched byte for byte before a retry got
its 200, which is cnh-030's check doing the job it was written for.
  **THE DECK NOW DISAGREES WITH ITSELF ABOUT TWO DATES, AND THIS IS THE ONE CARD WHERE THAT IS THE
SUBJECT.** `cnh-005` gives Fuxi 3322 BCE and this card 2852; `cnh-010` gives Yao 2357 and this card
2356. Every figure is cited and hedged, and the divergences are exactly what Mayers's own footnote under
the table says they are — numerous dissimilar schemes whose "mutually antagonistic views" are the
evidence against every date. What the card does about it is **one word**: "**The** standard table" became
"**A** standard table", so a reader who has met 3322 on the Fuxi card reads this one as another reckoning
rather than as an error. **Where a deck's sources genuinely disagree, write "a" and not "the".**
  **AND THE ANSWER TERM WAS CHOSEN AGAINST SLOTS THE PLAN HAS ALREADY RESERVED.** `Gonghe regency`,
`Sima Qian`, `Records of the Grand Historian` and `Chinese historiography` are cnh-134, cnh-240, cnh-241
and cnh-736, so none of them could be this card's answer; *euhemerism* appears in none of the forty
cached volumes and DOAJ returns nothing usable on it, so it was refused rather than composed. What is
left is Mayers's own heading — THE LEGENDARY PERIOD, which his prose glosses as "the legendary — as
distinct from the purely mythical — period of Chinese history" — and the key carries **no bare "legendary
period" alias**, on cnh-013's rule, since Greece, Rome and Egypt all have one. Its six citations were
each placed off a RUN of running heads, and the Mayers scan mangles a leading 3 **two different ways on
one opening** (866 for 366, 967 for 367), which is cnh-023's fault on a third set of pages.
  **It is the ONLY plan written onto a tree that already existed**, and the four changes it made are listed
at the top of the file: the **duplicate `col-9 Xin`** is dropped (Xin stays at `col-11`, inside Han, which
is where Wang Mang belongs); **`col-30 Jin` is retitled `Jurchen Jin`**, the tree having carried two decks
called Jin nine centuries apart (`col-17` 晉 266–420 and `col-30` 金 1115–1234); **`col-2 Xia` is retitled
`Neolithic China and the Xia`**, since it is the earliest deck and therefore the only home for Yangshao,
Longshan, Liangzhu and Sanxingdui, none of which is Xia; and **three thematic decks are added**
(`cn-state`, `cn-belief`, `cn-culture`, 300 cards). That last is the substantial one: **China needed
thematic decks more than any other collection and had none**, because the dynastic frame is so strong that
the examinations (605–1905), Confucianism, the characters, silk and the standard histories had nowhere to
live. Four more decisions are arguments rather than lists. **The dynastic decks are deliberately unequal,
8 cards to 45** — the Xin lasted 14 years and the Tang 289, so an equal share would be a false claim.
**`cnh-703 The dynastic cycle` is a card, not the tree's silent assumption**, being a Chinese
historiographical theory bound up with the Mandate of Heaven rather than a description of what happened.
**The standard histories were each compiled by the dynasty that replaced the one they describe**, which is
the collection's central source-critical fact (`cnh-736`–`cnh-738`). And **"China" is not only the Han**:
`cn-peoples` gets 28 cards, the conquest dynasties are part of the history rather than interruptions of
it. Conventions it fixes: **pinyin**, except where a non-pinyin form IS the English name (Confucius,
Mencius, Taoism, the *Tao Te Ching*, Peking opera, the Yangtze); aliases mandatory; conventional dynastic
dates named as conventional. Two names to watch — *Jin* is two dynasties, and *li* is two different
central concepts (禮 ritual propriety `cnh-831`, 理 principle `cnh-861`). The glossary has `China`,
`Mongolia`, `Taiwan`, `Zhoukoudian` and `Sima_Qian` and nothing else Chinese, so write terms **cited from
the start** at the `GLOSS_SRC_TARGET` bar — and mind that romanised Chinese names collide on their
syllables (*Yang Yan* against *yin and yang*, *Ban Zhao* against *Han-Zhao*), so prefer the fuller head
word.

  **`cnh-041` IS WHERE THE DECK'S WHOLE SOURCE SPINE STOPS WORKING, AND THAT IS A FACT ABOUT THE
SUBJECT RATHER THAN ABOUT THE SEARCH** (Aug 2026). Every card from `cnh-001` to `cnh-040` is carried by
Mayers, Legge, Herbert Giles, Doré, Werner, Doolittle, Wylie, Forke and Chavannes; **not one of them
knows that Neolithic China exists**, Yangshao having been found in 1921 and the Yangtze rice cultures
much later still, so the shelf that answered forty questions answers none of this one's. `cnh-037` met
the same wall on a vernacular story and reached for `pypdf`; here the replacement is **modern
open-access science, fetched from PMC directly**. Three access findings go with it. **`pmc.ncbi.nlm.nih.gov/articles/<PMCID>/`
serves papers Europe PMC marks `isOpenAccess: N`** — both PNAS papers behind this card's Cishan and
Liangzhu sentences are in that class and both read in full. **`europepmc.org/article/PMC/<id>` is a
JavaScript shell**, and the tell is that it is **29,128 bytes for every id you ask for**, which is
`cnh-003`'s "assert that the patch landed" in another coat: identical output across different inputs is
the signature of a page that never had the content. And `/europepmc/webservices/rest/<PMCID>/fullTextXML`
**404s outside the OA subset**, so a fetch failing there says nothing about whether the paper is readable.
`cambridge.org` is 403 while a Cambridge journal at its DOI is not (`doi.org/10.1017/ehs.2024.31`).
  **THE OVERVIEW WAS FOUND BY SEARCHING FOR AN ANIMAL, AND THE ROUTE IS THE REUSABLE PART.** Europe PMC
on `TITLE:"Neolithic China"` returns kinship genomics and commensal rats; DOAJ on `title:(neolithic AND
china)` returns 49 records and they are almost all site reports, which is the shape of this literature —
**the specialist papers are everywhere and the syntheses are rare**. What carried five of this card's ten
sentences is the INTRODUCTION of Hongo, Kikuchi and Nasu's review of pig management in *Animal Frontiers*,
which sets its subject up by stating the north/south division, the Qinling–Huai line between them, the
crops on each side, the Yangshao subsistence pattern and the West Asian wheat, cattle, sheep and goats
arriving in the Longshan. **Where an overview is wanted and no overview is open, read the introduction of
a specialist REVIEW** — it is written to do exactly that job for its own readers.
  **ITS DATE LINE'S THREE ROWS REST ON THREE DIFFERENT WORKS, ON PURPOSE**, which is `cnh-036`'s rule
applied while writing rather than after: the Early Neolithic at c. 7000–5000 BCE is Liu et al.'s
9000–7000 cal BP, the millet cultures at c. 5000–3000 BCE are Stevens et al.'s figure in those words, and
Liangzhu at c. 3300–2300 BCE is Liu Bin et al.'s 5,300–4,300 cal BP. **Converting cal BP to BCE is
arithmetic and safe; asserting a period's END is not** — nothing openable here says when the Chinese
Neolithic closes, so the card's date line does not say, and it sorts at −7000 rather than at the 20,000-year-old
pottery its second sentence names, which would have filed a Neolithic card in the Upper Palaeolithic.
  **THE PICTURE BEAT A BETTER-DESCRIBED RIVAL ON ITS FRAME, AND THE PROVENANCE WAS IN THE CATEGORIES.**
Gary Todd's CC0 photograph of eleven Yangshao vessels names the Zhengzhou City Museum and dates the group
in its own description, and what it shows is a display case — plinths, bilingual labels, wall panels and
reflections, `cnh-036`'s calibration bar in another form. Windmemories' basin from the Dahecun site has a
one-line description and looked the thinner record until its **Commons CATEGORIES** were read
(`Collections of Dahecun Site Museum`, `Yangshao pottery from Dahecun Site`, `November 2024 in Zhengzhou`),
which carry everything a `desc` needs. **Read a file's categories before calling its record thin.** The
glossary term's own picture states the opposite kind of limit: the millet heaped on the Peiligang quern is
the museum's display dressing and not an excavated deposit, so the `desc` says so.
  **AND THE AUTO-LINKS WERE SIMULATED RATHER THAN EYEBALLED.** `cnh-010`'s `afar` and `cnh-012`'s `tripod`
were both found by looking at a rendered card, which finds a mis-link only if you happen to look at the
right word; running the glossary's own longest-first surface list over the finished abstract lists every
link it will make in one command, and this one makes twelve, of which `China` (in "northern China") and
`Asia` (in "western Asia") are the two worth checking and both point at the right place.
  **`cnh-042` IS WHERE THE SECOND CARD ON ONE SUBJECT HAD TO BE PLANNED AGAINST THE FIRST, AND THE PLAN
LINE IS WHAT SAYS HOW** (Aug 2026). `cnh-041 Neolithic China`, `cnh-042 The origins of Chinese
agriculture` and `cnh-043 Millet and rice in early China` are three cards over one body of evidence, and
the way to keep them from being one card written three times is to give each a different QUESTION rather
than a different slice of the same answer: 41 is the period, 42 is the PROCESS and the ARGUMENT about it,
43 will be the two crops. So 42 owns what 41 could not carry — how long the transition took, what
low-level food production is, how domestication is read off shape, and the live dispute about where it
started — and it deliberately restates none of 41's Cishan, Shangshan or Qinling–Huai sentences. **Before
writing a card next to one already shipped, read the sibling's ten sentences and write down which
question each card is answering**; the overlap is invisible in a word count and obvious on the page.
  **THE OVERVIEW SOURCE WAS AGAIN A SPECIALIST PAPER'S FRAME RATHER THAN A SURVEY**, which makes it twice
in two cards: `cnh-041` was carried by the introduction of a pig-management review, and this card's spine
is a two-page PNAS **COMMENTARY** — Crawford's on the Cishan millet paper — which exists to say what a
result means and therefore states the frame outright: that the timing puts Chinese agricultural origins at
the Pleistocene–Holocene boundary as in Southwest Asia, Mexico and South America, and that pottery there
long predates any trace of farming. **A commentary or a "News and Views" piece is a synthesis with a DOI**,
and Europe PMC finds them by title like any other paper.
  **THE CARD STATES A LIVE DISAGREEMENT AS A DISAGREEMENT, WHICH IS THE PLAN'S OWN RULE MET FOR THE FIRST
TIME IN THIS DECK.** Barton et al. set out both accounts — agriculture spreading from a single Yangtze
core in a farming diaspora, against its beginning in many places almost simultaneously — and add that
broomcorn millet "appears early and suddenly from an as-yet-unidentified wild progenitor". A card that
picked one and sounded neutral would be worse than one that picks openly, so the tenth sentence names both
and settles neither.
  **ITS DATE LINE IS BUILT BACKWARDS FROM WHAT `cardYears` WILL ASSERT.** The card's own second sentence
dates deliberate grass-seed gathering to about 30,000 years ago, and putting that figure in the date line
would have sorted a card about the origins of FARMING into the Upper Palaeolithic — `cnh-007`'s trap
exactly, and the same test the `undatable` rule applies. The rows are the millet domestication window, the
rice one and the arrival of full farming, so the card sorts at −8300, which is the onset a reader would
give; the 30,000-year figure lives in the abstract, where it is a statement about gathering rather than
about agriculture, and no `undatable` flag is needed.
  **AND A COMMONS 429 CAN BE SCOPED TO ONE FILE RATHER THAN TO THE HOST, WHICH `cnh-014`'s CONGESTION
FINDING DOES NOT COVER.** The Hemudu bone spade at `commons/8/8f/…1974.jpg` refused every request —
original, `Special:FilePath`, and a composed `800px-` thumb that additionally returned cnh-040's
**400 "Use thumbnail sizes listed on…"** — for the better part of an hour, while other files on the same
host, including the one eventually shipped, fetched cleanly throughout. **The until-loop was still the
right answer and it did land the file** — after about fifty minutes rather than cnh-014's fifteen — and a
probe an hour later 429s again on that object while its neighbour returns 200, so the refusal is
**per-file and intermittent** rather than permanent. What the neighbour probe is FOR, then, is not deciding
whether to loop but knowing what the loop is up against: **fetch a known-good file from the same host, and
where it answers, keep the loop running in the background and go and find another picture in parallel**,
which is what got this card its illustration inside the hour. What
replaced it was found by cnh-016's rule, searching Commons on the characters: `河姆渡 骨耜` returned five
bone spades where the English name returned one. Two candidates were rejected by LOOKING: a Hemudu bowl
whose record calls it 稻纹陶钵, a bowl with a rice-ear design, shows no design at all in the frame, and the
National Museum's single sickle sits beside a case label reading "Stone Quern and Roller" that belongs to
the next object along — cnh-040's "a record can be right and misleading" arriving twice in one search.
  **`cnh-043` IS WHERE THE PLAN LINE WAS NOT AN ANSWER TERM, AND FINDING ONE WAS THE WHOLE PROBLEM**
(Aug 2026). "Millet and rice in early China" is a subject, not a thing a reader can be asked to name, and
the two obvious keys were already taken: `Millet_domestication` and `Rice_domestication` have been in the
glossary since before this deck existed and own the shattering loss, the japonica origin, the Dadiwan
grains and — worth knowing before drafting — **the yield comparison between the two crops**. What was left
unclaimed is the FARMING rather than the plants, so the answer term is **`Millet_and_rice_farming`** and
the term is written entirely about the two SYSTEMS: dry-sown grain against fields that had to be built,
the paddies' development, the overlap zone, the two directions of spread. **Read the existing glossary
terms nearest a new one before choosing its head word** — L10's re-registration rule met at the moment a
term is created rather than during a length pass, which is far cheaper.
  **AND IT IS THE THIRD CARD ON ONE SUBJECT, SO THE FIRST QUESTIONS WERE CHECKED AGAINST EACH OTHER.**
Multiple Choice asks a card's FIRST phrasing and draws its wrong answers by tag kinship, so three cards
sharing five of six tags would offer each other as distractors: "Neolithic China", "origins of Chinese
agriculture" and "millet and rice farming" are close enough that a loose clue would be answerable by more
than one. The kinds differ deliberately (`era`, `concept`, `practice`), which caps the kinship score, and
each first question was written to fit ONE of the three — potters at sixteen sites, a transition among the
slowest known, a northern crop on loess against a southern one in built fields. **When a run of cards
shares a subject, read their opening questions as a set.**
  **ITS BEST SOURCE WAS FOUND BY SEARCHING FOR THE PEOPLE RATHER THAN THE CROPS.** Europe PMC on rice and
millet returns plant genetics and food chemistry by the page; what carried the card's closing pair of
sentences is a **paleopathology** paper comparing Yangtze delta rice farmers with northern millet farmers
and finding more skeletal stress markers among the rice farmers, heaviest late, as paddy cultivation grew.
That is the one thing in this run of three cards that is about what farming did to bodies rather than to
landscapes, and no crop-shaped query would have found it. **Ask what a subject did to people, and search
that.**
  **THE 429 CAME BACK AND THE CORRECTED RULE WORKED.** Two files new to the cache both refused while the
sickle image shipped on `cnh-042` returned 200 on the same host, so the refusal is per-file as recorded
above; both loops were started in the background and both landed within minutes while the glossary term was
being drafted. **Probe a known-good file, start the loop, and keep writing** — the answer the previous
card's entry was corrected to.
  **AND A PICTURE'S FRAME DECIDED WHICH OF THE TWO WENT WHERE.** The Liangzhu stone ploughshare has the
better record — the Liangzhu Museum's own label is legible in the shot and names the object and the
Miaoqian site — and the frame is a display case with reflections, a strong shadow and a diorama figure
behind the glass, in portrait. The broomcorn millet panicle is a clean landscape photograph against open
sky, and its record is a botanist's: species, subspecies, and the Vienna roadside it grew on, which the
`desc` states so that nobody reads it as a Chinese field. The card takes the picture that reads at card
size and the term takes the one that survives being 150px high.
  **`cnh-044` IS THE DECK'S FIRST CARD CARRIED BY A CHINESE MUSEUM'S OWN COLLECTION RECORD, AND THAT IS
THE ROUTE TO REACH FOR WHEN THE JOURNALS GO QUIET** (Aug 2026). Jiahu's flutes are famous and the paper
that reported them is in *Nature*, which is shut here; `metmuseum.org` answers **429 behind a JavaScript
challenge**; `cambridge.org` is 403, so the *Antiquity* paper on the site's signs is unreachable and its
old `antiquity.ac.uk` article paths are **404** since the journal moved. What answered is **`chnmus.net`,
the Henan Museum**, whose 镇院之宝 (museum treasures) pages carry a full record for 贾湖骨笛 — the crane
ulna it is cut from, the joints sawn off the hollow bone, the hole counts across the thirty-odd flutes
(two, five, six, seven or eight, most of them seven), the equal-division marks showing the spacing was set
out before drilling, and the tomb and year for the one on show. **`kaogu.cssn.cn`, the CASS Institute of
Archaeology, also answers 200**, and `chnmuseum.cn` and `en.chnmuseum.cn` with it, so the Chinese
institutional shelf is open even where the Anglophone journals are not — batch 18's "look for the body
responsible" rule, pointed at a provincial museum. The page is reached through a redirect
(`/content/redirect?id=…` → `/ch/collection/treasure/details.html?id=…`) and the **detail URL is what to
cite**, since it is the one a reader can open.
  **AND THAT SAME PAGE STATES ITS OBJECT'S LENGTH TWICE AND DISAGREES WITH ITSELF** — 长23.6厘米 in the
specification block against 全长23.1厘米 in the prose — which is `cnh-017`'s Mayers fault on a modern web
page rather than in an OCR'd scan. Neither figure is cited and the card gives no length. **Where one
source states a figure twice, either reconcile it from a third or leave the figure out**; a card does not
need every number a record carries.
  **THE CARD SAYS LESS THAN IT COULD BECAUSE THE MEDIUM OF THE SIGNS IS NOT IN ANY SOURCE IT CITES.** Two
open papers describe Jiahu as having yielded "possibly the earliest Chinese pictographic writing" and
neither says what the signs are cut on; the tortoise shells are common knowledge and common knowledge is
not a citation. So the abstract says "marks" and not "tortoise shells", and the claim is given as the
hedge its own reporters give it. The GLOSSARY TERM's picture is a shell all the same — the Henan Museum's
Hebu 314, whose Commons record names the museum, the site, the county and a date — because **a `desc`
reporting a museum's record is not the prose asserting a fact**, and the two are allowed to know different
things. **Watch for the pull of a fact you know but cannot cite**; it is strongest on a famous site.
  **ITS SPINE IS A SILK PAPER, WHICH IS THE `cnh-043` LESSON AGAIN AT ONE REMOVE.** A bare `Jiahu` search
in Europe PMC returns robotics and orthopaedics — the syllable is a common Chinese surname pair in author
strings — and what works is **`ABSTRACT:"Jiahu"`**, ten hits, among them the PLOS ONE paper reporting silk
fibroin in three 8,500-year-old graves. Its introduction then does the work an overview would: it lists,
with references, the four things the site is famous for, so one open paper supplies both the silk and the
frame. **Search the abstract field when a site name collides with a personal name.**
  **`cnh-045` IS THE FIRST CARD IN THIS DECK WHOSE GLOSSARY TERM ALREADY EXISTED, AND THAT CHANGES WHAT
THE CARD IS FOR** (Aug 2026). `Yangshao_culture` has been in the glossary since before the collection was
opened — cited, at the bar, with its own picture — so the pairing rule was already satisfied and no term
was written. What the rule then asks instead is that the CARD not be the term at greater length: the term
owns the definition, the three provinces, the 3,000 Henan sites, the manured loess and the demic reading,
so the card takes the things three sentences had no room for — the seven regions the culture reached, the
broomcorn-to-foxtail changeover, the pigs fed by hand at Xipo, the gene flow between the two river basins,
and the migration west that carried a way of brewing with it. **Read the existing term first and write
what it could not hold**; the alternative is a card that teaches nothing to a reader who has met the
popup.
  **ITS ONE REAL FAULT WAS A MIS-LINK, CAUGHT BY THE SIMULATION AND NOT BY EYE.** The abstract listed the
regions Yangshao influence reached, and "Inner **Mongolia**" auto-linked to `Mongolia`, the modern country
— an autonomous region of China pointed at a different state, which is `cnh-010`'s `afar` and `cnh-012`'s
`tripod` a third time. Neither `GLOSSARY_CASESENSITIVE` nor a longer key can separate them, since the
surface really is the country's name; the fix that would scale is an `Inner_Mongolia` term, which the
collection will want eventually, and the fix taken here was to **reword** — the sentence now says how many
regions and names five that carry no such trap. **Run the longest-first surface simulation over every new
abstract**: it costs one command, and it found this where reading did not.
  **AND A DOI IN THE SHIPPED GLOSSARY POINTS AT A HOST THIS SANDBOX CANNOT OPEN.** `Yangshao_culture` cites
Liu et al. 2022 as `doi.org/10.1073/pnas.2212006119`, which resolves to `pnas.org` and is **403 here**, as
`cnh-001` recorded for that host. The DOI is a perfectly good link for an ordinary reader and the citation
is not wrong, but this deck's own convention is to cite a PNAS paper at its **PMC** address — every one of
`cnh-041` to `cnh-044` does — so the card cites the same work at `pmc.ncbi.nlm.nih.gov/articles/PMC9907151/`
and the two forms now differ across surfaces. **Prefer the URL you have actually opened**, and expect a
glossary citation written during an earlier pass to have been checked against a different set of hosts.

  **`cnh-046` IS THE FIRST CARD IN THIS DECK WHOSE SUBJECT IS FAMOUS AND WHOSE SOURCES ARE NOT, AND THE
GAP BETWEEN THOSE TWO THINGS IS THE FINDING.** Banpo is in every survey of Chinese prehistory and on every
Xi'an itinerary, and it is the source-poorest card written for `col-2` so far: `TITLE:"Banpo"` returns **0
hits** in Europe PMC, `"Banpo site"` returns ten of which four are usable, `bpmuseum.com` answers **418**,
`kaogu.cssn.cn` does not resolve and `kaogu.net.cn` is **503**, DOAJ's `Banpo` query is swamped by the
Seoul district of the same name, and every result a plain web search returns — Baidu Baike, China Daily,
travel operators, a study-notes site — is barred by the citation rules. The figures those pages agree on
(a 50,000 m² site, 45 or 46 houses, 200 storage pits, 250 tombs, a defensive ditch 5–6 m deep and 6–8 m
wide) are **not on the card**, because not one of them could be tied to a work that opens here. **A
well-known site is not a well-sourced one**, and the honest card is the narrower one.
  **WHAT CARRIED IT WAS SIX PAPERS THAT ARE ABOUT SOMETHING ELSE.** None of the nine citations is a study
of Banpo; each is a study of diet, of pigs, of millet, of genomes or of heated floors that passes through
Banpo on its way. The dates came from a **table row** in a meta-analysis of isotope data (Liu and Reid
2020: `Banpo | Shaanxi | Yangshao | 4800–4300`), the pens from a pig-husbandry paper's discussion, the
burnt-earth floors from a paper about the **Amur** river basin, the phase and its pottery from an
archaeobotany paper about Gansu. **Grep the cache before searching the web**: five of the nine were
already on disk from `cnh-041`–`cnh-045` and had never been read for this subject. The corollary is a
limit worth stating — a claim reached this way is a claim about whatever the host paper measured, so the
card can say what Banpo's people ate and how their floors were made, and cannot say how big the village
was.
  **AND TWO OF ITS BEST-KNOWN FACTS BELONG TO ITS NEIGHBOUR, NOT TO IT.** The ring ditch enclosing the
houses with the cemetery and the kilns outside it is attested for the **Banpo phase** (at Gedachuan, and
at Jiangzhai, which the sources compare it to) and not, in anything openable here, for Banpo itself; the
2-metre ditch that a 2025 PNAS paper illustrates is **Jiangzhai's**. The card therefore says "villages of
that phase were laid out to a pattern" rather than "Banpo had a moat", which is the difference between
what the sources carry and what the reader expects. `cnh-045` already spends the Jiangzhai settlement
model as its picture, so leaning further on that site would also have doubled it. **When a site's
diagnostic feature is published under the PHASE rather than the site, say phase.**
  **ONE FIGURE WAS DELIBERATELY LEFT OUT.** A 2025 review of turnip-rape genetics relays that "a large
number of carbonized mustard and cabbage seeds were excavated" at Banpo. It is openable and it is a real
citation, but it relays a 1950s identification of charred seeds that has been argued over since, and a
review in a plant-breeding journal is not where that argument is settled. **A claim can be citable and
still not be safe to assert**; the seeds are recorded here instead.
  **PICTURE: THE EXCAVATION HALL, NOT A POT — AND THE TWO SURFACES SPLIT THE JOB.** The card takes the
exposed village floor under its museum roof (house outlines, storage pits, vessels standing where they
were found), because the card is about a settlement; the glossary term takes the **pointed-bottom
cord-marked bottle** in the Musée Guimet, the form the sources name as diagnostic of the phase. Its
Commons categories were checked before use (`Banpo Site`, `Yangshao pottery Ping`, `Collections of the
Musée Guimet`) — the file has no description at all, so the categories are the only evidence that the
name on it is true.
  **TOOLING: A `1400px` THUMBNAIL DOES NOT EXIST AND AN `until` LOOP WILL RETRY THAT FOREVER.** Commons
serves only the widths its API offers, so a composed `.../1400px-<file>` returns a **2 KB HTML error page
with a 200 status** — which `getimg.sh`'s loop treats as a transient failure and re-fetches, and which,
left running in the background, **overwrote a good 890 KB download from a later command with the error
page**. Take `thumburl` from `imageinfo` verbatim (here `1920px`), and stop a background fetch before
re-fetching the same path.

  **`cnh-047` IS THE DECK'S FIRST NEOLITHIC CARD WITH A GENUINE ANCHOR PAPER, AND THE CONTRAST WITH
`cnh-046` IS THE FINDING.** Banpo, a household name in China, is studied by nobody reachable; Hongshan,
which is not, has **Peterson, Lu, Drennan and Zhu 2010 in PNAS** — a settlement-survey paper whose
introduction alone carries the culture's dates, its core zone, the tiered platforms and their pottery
cylinders, the jade-only burials, the Goddess Temple, the house plans, the subsistence list and the
Chifeng district survey. Seven of this card's ten sentences rest on it. **Before assembling a card out of
six papers that pass through the subject, spend one search looking for the paper that is ABOUT it** —
`"Niuheliang"` returned sixteen hits where `TITLE:"Banpo"` returned none, and the difference is which
name the archaeological literature happens to use in its titles.
  **A BARE CULTURE NAME IS A BAD EUROPE PMC QUERY AND ITS TYPE SITE IS A GOOD ONE.** `"Hongshan"` alone
returns **7,466 hits**, nearly all of them Korean and Chinese author surnames and place names in
biomedical papers, exactly as `"Banpo"` was swamped by the Seoul district; `"Niuheliang"` returns 16 and
`"Hongshan culture"` 36, and between them they contain every source used here. **Query the site, not the
culture.**
  **THE CARD'S LAST SENTENCE CORRECTS THE STORY MOST READERS WILL HAVE MET.** Hongshan is routinely said
to have collapsed suddenly under a worsening climate; Xu et al. 2019 shows that ritual at the great
centres peaked around 5800–5300 cal BP and stopped, but that this "does not imply a total collapse … it
marked the disappearance of elite power with associated material symbols", with small settlements
continuing for centuries. **A card about a culture that ended is a card about what exactly ended**, and
here it is the elite and their jades rather than the people.
  **AND THE MONGOLIA MIS-LINK CAME BACK, IN THE SAME PLACE, ONE CARD LATER.** `cnh-045` was reworded
because "Inner **Mongolia**" auto-linked to `Mongolia`, the modern country; this card's second sentence
was drafted "from Inner Mongolia into Liaoning" and did it again. Both drafts were written from a source
that names the autonomous region, so the phrase will keep arriving as long as the sources use it. The
reword also had to be done TWICE — the first attempt gave "of what is now northeastern China", which put
that phrase in two consecutive sentences, caught by reading the rendered page rather than by any checker.
**Two strikes: the collection should have an `Inner_Mongolia` term before a third card needs one.**
  **A CITATION SWEEP THAT THIS CARD FORCED, AND THE TWO METHOD ERRORS IN IT.** Choosing between a DOI and
a PMC address for these sources led to testing every citation URL in `cnh-041`–`cnh-047` and their seven
glossary terms — 40 links — and **nine pointed at a page this sandbox cannot open**: `academic.oup.com`
403, `mdpi.com` 403, `pnas.org` 403, and BMC Biology and Elsevier's `linkinghub` each serving a **~3 KB
stub with a 200 status**. All nine were repointed to `pmc.ncbi.nlm.nih.gov`, on five cards
(`cnh-045`, `cnh-046`, `wh-130`, `wh-147`, and this one's drafts) and two terms. Two things went wrong on
the way and both are worth remembering. **`curl -I`, and `curl` without `-L`, report the REDIRECT and not
the destination**: `nature.com` answered 303 and looked shut, so two Nature Communications citations were
repointed that never needed it — followed properly they serve 472 KB and 540 KB. And **a 200 is not an
article**: the BMC and Elsevier stubs are 3,038 and 3,007 bytes. **Measure a citation with `curl -sSL`
and look at the SIZE**, and remember the rule the deck already followed without writing down: cite at the
address that opens from here, which is the DOI where it resolves to a reachable page and the PMC record
otherwise.

  **`cnh-048` IS THE FIRST CARD IN THIS DECK WHERE THE PICTURE WAS THE HARD PART, AND THE REASON IS
WORTH KNOWING BEFORE ANY CARD ABOUT A SITE WITH A VISITOR PARK.** Liangzhu's sources were easy — the
whole card rests on five open works and the anchor, Bin Liu et al. 2017 in PNAS, carries seven of its
ten sentences with figures nobody has to hedge (a city of 300 ha at roughly 1.9 × 1.7 km, Tangshan
levees of 5 km at 2–7 m, 30 km of canals through eight water gates, 3,000 people for eight years moving
2.88 million m³). What was hard was finding a photograph of the ANCIENT thing. Commons' large
`Archaeological Ruins of Liangzhu City` set — fourteen files, all CC BY 2.0 and well shot — is entirely
the modern interpretive park: **wire-mesh sculptures of Neolithic villagers paddling a wire canoe, and a
reconstructed well beside a bilingual signboard.** They are honest photographs of a real place and they
teach a reader nothing about the Liangzhu culture, which is the third variety of the picture trap this
deck has met, after the wrong person of the same name and the unlabelled plaster cast. **A World
Heritage site with a park will have far more pictures of its park than of itself**; search for the
excavation (`Liangzhu site excavation OR Liangzhu wall OR Mojiaoshan`) rather than for the ruins, and
LOOK at every candidate. Two files answered — the south wall cut open under a shelter, showing the layer
of loose rock the earth rampart stands on, and the same stone footing on the west wall — and one that
sounded perfect did not: `Mojiaoshan Relic Site of Liangzhu Culture` is a boardwalk and a handrail on a
winter mound.
  **THE CARD LEAVES ITS MOST FAMOUS SUBJECT ALONE ON PURPOSE.** Liangzhu is best known for its jade, and
the plan gives jade its own card at `cnh-049`, so this one spends a single clause on it and puts the
words into the city, the dams and the collapse instead. **When two consecutive plan lines split a
subject, decide the split before drafting either** — the alternative is a culture card that is mostly
about jade and a jade card with nothing left to say.
  **ITS SEVENTH SENTENCE IS HISTORIOGRAPHY WRITTEN SO THE MEASURE CANNOT SEE IT, AND THAT IS THE RIGHT
OUTCOME RATHER THAN A LOOPHOLE.** The Liangzhu waterworks are the standard modern test case for
Wittfogel's hydraulic hypothesis, and Liu et al. spend four paragraphs on it, so a card that ignored the
argument would be hiding something its own source thinks central. `card-focus.js` reports `historio: 0`
because the sentence names **the theory and not the theorist** — "the old argument that water control is
what builds despotic states" — which is exactly the fix `docs/history-focus-plan.md` prescribes: keep the
claim, drop the name, and the sentence gets shorter as well as better.
  **AND A `cd` INSIDE A COMPOUND COMMAND MADE SEVEN PASSING SUITES REPORT `MODULE_NOT_FOUND`.** The
scratchpad `cd` used to open a browser harness persisted across the `;` into the checker loop, so every
no-browser suite failed to resolve `../data.js` and printed a stack trace that looks exactly like a
broken test. **Run the checkers from `/home/user/folio` in a command of their own**; a suite that fails
on its `require` line has not run at all, and the distinction is invisible in a tail of the output.

  **`cnh-049` FOUND A WHOLE SHELF THIS DECK DID NOT KNOW IT HAD: `ASIAN PERSPECTIVES`, OPEN, FULL TEXT,
BACK TO THE 1960s.** Liangzhu jade is an art-historical and archaeometric subject, so Europe PMC is
nearly blind to it — `"Liangzhu" AND "jade"` returns 28 hits of which four are relevant, `"cong" AND
"Liangzhu"` returns 51 dominated by Chinese author surnames, and the jade-specific results that do
surface are **preprints** on `preprints.org` and `researchsquare`, which the citation rules do not
accept. What answered was **ScholarSpace, the University of Hawai'i repository**
(`scholarspace.manoa.hawaii.edu`), which publishes *Asian Perspectives* — the standard English journal
for the archaeology of this region — in full and free. Its web search is a JavaScript shell and returns
nothing, but its **DSpace REST API is open**: `/server/api/discover/search/objects?query=Liangzhu` gives
titles, authors, citations and handles, and each item's `TEXT` bundle holds the OCR'd article, reached
through `/server/api/core/items/<uuid>/bundles` → `/core/bundles/<uuid>/bitstreams` →
`/bitstreams/<uuid>/download`. Three of its articles carry this card: Li Liu on prestige-goods
production, Green on the *bi*, and Lopes on jade-working technique. **Reach for ScholarSpace before
concluding a Chinese or Pacific archaeology subject has no open literature.**
  **THE MUSEUM APIs ARE THE OTHER HALF, AND THEY ARE NOT EQUAL.** Three were probed. **The Cleveland
Museum of Art is the best source of the three and its public page opens** (`openaccess-api.clevelandart.org`
for the record, `clevelandart.org/art/<accession>` for the citation): its Liangzhu *bi* record carries a
written curatorial paragraph — that the culture "excelled in jade working", that large discs "usually
occupied pride of place on the chest of the buried", and that *bi* and *cong* "form an essential ritual
pair" — which is a citable claim rather than a catalogue line. **The Art Institute of Chicago's API is
open and its object pages are 403**, so a citation there would point at a page the reader cannot open;
its records are also bare (`description: null`). The **British Museum (403)**, the **Met** (bot-walled,
recorded earlier), **`asia.si.edu` (403)**, **`dpm.org.cn`** (connection reset) and
**`zhejiangmuseum.com`** (TLS failure) are all shut. **Check that a museum's PUBLIC page opens before
citing its API.**
  **THE ANSWER TERM WAS ARGUED OVER AND THE PLAN WON.** `cnh-048` answers *Liangzhu culture* and this one
answers *Liangzhu jade*, which are similar surfaces one card apart; the alternative was to answer *cong*,
the object the card actually turns on. The plan was kept because it puts this card in a deliberate family
with `cnh-085 Shang jade` and `cnh-954 Chinese jade`, and because the collision is harmless where it
would matter: the two cards' first tags differ (`culture` against `object`), so `cardKinship` caps their
score, and both are difficulty 4, above `GAME_MAX_DIFFICULTY`, so neither reaches a minigame at all.
**Check the tag kinds and the difficulty before worrying about two similar answers.**
  **AND A COMMONS THUMBNAIL 429 CLEARED ON THE SECOND TRY, NOT THE FIFTIETH.** `cnh-042`'s finding was
that a rate-limited file can take an hour of looping; the V&A *bi* here returned the 2,190-byte error
page once and the real 809 KB file ten seconds later. **A short retry loop with a size test is the right
first move** — `[ "$s" -gt 50000 ] && break` — and only a file that fails several of those is worth
backgrounding.

  **`cnh-050` IS THE FIRST CARD IN THIS DECK WHOSE ANSWER ALREADY HAD BOTH A GLOSSARY TERM AND A FULL
CARD, AND THE RULE IT FORCED IS SHARPER THAN `cnh-045`'s.** `Yangshao_culture` existed as a three-sentence
popup and the card had to say what three sentences could not hold; here `wh-148` is a whole ten-sentence
World History card on the same answer term, so the question is not what a popup left out but what a CARD
left out. Reading it first showed `wh-148` spends itself on the black pottery, the Songshan site counts,
the arrival of cattle and scapulimancy, the diet change at 4.2 ka and Shimao. **So this card was written
around the one thing `wh-148` mentions once and drops: the walls.** Its whole spine — Longshan as a set of
REGIONAL cultures rather than one, the type site at Chengziyai, the ten or so walled towns in clusters,
what was buried in the wall bases, and the Taosi ditch — appears nowhere in the sibling. **Read the
sibling card before drafting, and make the list of what it spent** ; the alternative is two cards that
teach the same five facts under one answer.
  **NO NEW GLOSSARY TERM WAS WRITTEN, AND THAT IS THE RIGHT ANSWER RATHER THAN A SKIPPED STEP.**
`Longshan_culture` is already at the two-source bar and inside the length band, and its three sentences
are accurate; adding a second term or rewriting a sound one to match a new card is churn. The pairing rule
asks that a card's answer HAVE an entry, not that every card create one.
  **`ASIAN PERSPECTIVES` CARRIED THIS CARD ENTIRELY — FIVE SOURCES, ALL FROM THE ONE JOURNAL** — which is
`cnh-049`'s find paying immediately and is worth stating as an expectation rather than a surprise: the
archaeology of Neolithic and Bronze Age China is largely published in Anglophone journals that
Europe PMC does not index, and ScholarSpace's DSpace API reaches it. Dematté 1999 on Longshan urbanism,
Yang 2019 on wall-construction ritual, Underhill 1994 on settlement variation, Shi 2021 on copper and Xie
et al. 2020 on settlement relocation were all found by one query and fetched with the same three-call
bundle walk.
  **AND THE NEAR-MISS OF THE SESSION WAS FIVE INVENTED HANDLES.** The first draft's citations carried
`hdl.handle.net/10125/17103`, `/68297`, `/17045`, `/79240` and `/70118` — plausible-looking numbers
composed from the pattern of the two handles actually seen, exactly N4's fabricated-author fault in a new
coat. **A DSpace item's handle is in its own metadata** (`/server/api/core/items/<uuid>` → `handle`), and
the real ones are `/17124`, `/76786`, `/17047`, `/108232` and `/104160` — not one of the five guesses was
right. Two things go with it: the same record carries `dc.identifier.citation` with the **page range** for
older volumes and NOTHING for the recent ones, so three of these five are cited **without pages** rather
than with a range inferred from the printed page numbers in the OCR; and **all five handles were opened
before the card was added**. **Never compose an identifier from a pattern.**
  **ONE FIGURE WAS DELIBERATELY NOT USED BECAUSE THE OCR COULD NOT BE READ SAFELY.** Dematté's site table
is two-column and the OCR interleaves the columns, so a "metal fragment (bronze alloy of lead, tin, and
copper)" sits between the entries for **Wangchenggang** and **Dinggong** with no way to tell which it
belongs to. The claim was dropped and the metallurgy sentence rests on Shi 2021 instead, which names
Zhoujiazhuang outright. **A two-column table in an OCR'd PDF is a place where a fact can be attached to
the wrong site without anything looking wrong**; if the column cannot be resolved, the fact is not
available.
  **A THIRD `Inner Mongolia` DRAFT WAS CAUGHT, THIS TIME BY THE WORD BUDGET.** The fourth sentence
originally listed "Hubei, Inner Mongolia and Sichuan"; the abstract came in 26 words over and Inner
Mongolia went out in the trim, which happens to remove the mis-link that bit `cnh-045` and `cnh-047`.
**That is luck, not process** — the collection still wants an `Inner_Mongolia` term.

  **`cnh-051` IS THE THIRD CARD IN A ROW WHOSE SUBJECT WAS ALREADY PARTLY SPENT, AND THE ANSWER WAS TO
NARROW TO THE ONE THING NOBODY ELSE COVERS: HOW A POT WAS ACTUALLY MADE.** `wh-128` answers *pottery* for
the whole world and already carries China's claim to the oldest pots; `cnh-041` carries the sixteen sites
and the 20,000-year date; `wh-148` carries the Longshan black ware and `cnh-045` the Yangshao painted
ware. What was left, and what no card had, is the **craft** — the temper, the wall thickness, the forming
methods, the firing temperatures, the kilns and the clay sources — and Tracey Lu's *Early Pottery in South
China* supplies almost all of it in figures a card can use (walls 2.9–3.6 cm, unsieved crushed calcite or
quartz, pinched by hand, 600–700 °C, Zengpiyan below 250 °C, slab building then coiling, and the marks on
the earliest surfaces being a hand smoothing clay rather than decoration). **When three siblings have
taken a subject's history, take its technique.**
  **A PAINTED-WARE CLAUSE WAS DROPPED BECAUSE NO SOURCE IN HAND CARRIED IT.** The first plan had a date
line row for `Painted wares c. 5000 – 3000 BCE` and a sentence pairing Yangshao red-painted with Longshan
black. Neither of the five sources describes Yangshao painting; the figure would have come from
`cnh-045`'s date line, which is a Folio card and not a source. Both went, and the card is about making
rather than about styles. **A date-line row needs a source as much as a sentence does.**
  **THE PICTURE SEARCH RETURNED GERMANY.** `File:Neolithic Pottery (28724096376).jpg`, CC0 and 5184 px,
came back top of a `Neolithic China pottery` search because its photographer is based in Xinzheng, Henan
— the vessels are **Corded Ware in the Neues Museum, Berlin**, and the file's own categories say so. That
is the deck's fourth variety of picture trap, after the wrong person of the same name, the unlabelled
plaster cast and the visitor park. **Read the CATEGORIES, not the title and not the photographer**; the
Yuchanyan pot and the Peiligang tripod that shipped were both confirmed that way.
  **A NEW GLOSSARY KEY CAN SWALLOW AN OLDER ONE'S ALIAS, AND THE SIMULATION SAYS SO WHERE THE PAGE DOES
NOT.** `Neolithic_China` carries the alias "Chinese Neolithic", which sits inside the new answer term
"Chinese Neolithic pottery"; the offline longest-first simulation reported the shorter alias winning
inside the term's own opening words. **It was wrong** — `buildGlossIndex` sorts the 25-character surface
above the 17-character alias, and the renderer additionally excludes a card's own answer term — and both
the card and the popup were checked in a browser to confirm it. Worth writing down in both directions:
the simulation over-reports where a new key is a superset of an old alias, and **a browser check is what
settles it**.

  **`cnh-052` IS THE FOURTH IN A ROW WHOSE SUBJECT WAS ALREADY PARTLY SPENT, AND THE ANSWER WAS TO MAKE
THE CARD ABOUT THE ARGUMENT RATHER THAN ABOUT THE PLACE.** `cnh-047` to `cnh-051` had already carried
Hongshan, Liangzhu, Longshan and the pottery, so a *Central Plain* card written as a description of the
middle Yellow River would have been five sixths of it a list of what the reader has just read. What no
card had is the **claim** those five cards bear on: that complexity spread outward from the Zhongyuan by
conquest and imitation. The card states the traditional model, gives Erlitou as the one thing genuinely
peculiar to the region — an unbroken Neolithic-to-Shang sequence — and then sets the walled towns of
Shandong, Hubei and Sichuan and the dammed city on the Yangtze delta against it. **Where the siblings
have taken a region's contents, take the region's claim.**
  **THE SANDBOX'S ANSWER TO CHINESE ARCHAEOLOGY IS STILL SCHOLARSPACE, AND IT CARRIED THREE OF FIVE.**
Shelach 1994 (*Asian Perspectives* 33(2)) is the challenge to the Zhongyuan model with the Yuxi/Chifeng
comparison behind it; Lee 2002 (41(1)) has Erlitou's 400 hectares, its four phases, and the stratigraphy
between Miaodigou II and Erligang; Dematté 1999 has the walled towns in their regional clusters. The
other two are PMC — Peterson et al. 2010 for the Hongshan chiefdoms, Bin Liu et al. 2017 for Liangzhu's
dams. **Every handle was read off `/server/api/core/items/<uuid>` and opened before it was cited**, which
is the rule this deck learned the hard way on `cnh-050`, where five invented handle numbers were composed
from the pattern of two real ones and not one of them was right.
  **THE PICTURE IS A MAP, AND IT IS THE CARD'S ARGUMENT IN ONE IMAGE.** `File:Late Neolithic cultures in
China.jpg` numbers fifteen late-Neolithic culture areas across the country, so a reader sees at a glance
that the Central Plain is one region among many — which is exactly what the abstract spends five
sentences saying. Its base-map place names are German while the fifteen keyed areas are English, and the
description says so rather than leaving a reader to discover it.
  **A STALE CROSS-REFERENCE IN THE PLAN WAS FIXED IN THE SAME COMMIT.** `docs/china-card-plan.md` argued
the Xia historicity question under `cnh-048` and the Chronology Project under `cnh-053`, where the running
order gives `cnh-061` and `cnh-065` — and by now those two numbers name *Liangzhu culture* and
*Sanxingdui*, two cards that exist. **A number in a plan's prose is not checked by anything**; the running
order is, so read the prose against it when passing.

  **`cnh-053` BREAKS THE RUN OF FOUR CARDS WRITTEN AROUND THEIR SIBLINGS: NOTHING IN THE DECK OR THE
GLOSSARY HAD TOUCHED SANXINGDUI AT ALL.** `cnh-047` to `cnh-052` were each shaped by what was already
said elsewhere; this one had a clear field, and the shape it wanted was the ordinary one — what the place
is, how big, when, and what came out of it. The abstract gives the city first (500 ha walled, some 1,200
with its neighbourhoods, inner walls dividing palace from workshop quarters) and the pits second, which
puts the famous objects where they belong: as the deposit of a capital, rather than as curiosities.
  **THE SANDBOX'S ANSWER TO CHINESE ARCHAEOLOGY IS NOW TWO SOURCES DEEP, AND THEY DIVIDE BY KIND.**
ScholarSpace carried the settlement archaeology — Flad et al. 2013 (*Asian Perspectives* 52(1)) for the
Chengdu Plain sequence, the Baodun walled towns that preceded it and the possibly violent transition to
Jinsha; Lin 2019 (58(2)) for the enclosure's size, its quarters and the fact that every contemporary
site near it is small. Europe PMC carried the SCIENCE — the *National Science Review* 2021 news feature
(PMC8310767) for the 1929 and 1986 discoveries, the object measurements and the eight pits; *Scientific
Reports* 2024 (PMC11589763) for silk in the ash; and *PNAS* 2026 (PMC12913004) for the pits at
1200–1000 BCE and for carnelian carried from far to the north. **Ask ScholarSpace what a site WAS and
Europe PMC what was IN it.**
  **THE BROWSER HARNESS CANNOT LOAD AN EXTERNAL PICTURE AT ALL, AND ITS `naturalWidth` MUST NOT BE READ
AS A VERDICT ON THE FILE.** Every card image has rendered `0x0 complete=false` in the render harness;
diagnosed here rather than assumed — headless Chromium's request to `upload.wikimedia.org` is refused by
the agent proxy with `ERR_CONNECTION_RESET`, on a direct `goto` as well as inside a page, with
`--ignore-certificate-errors`, `ignoreHTTPSErrors` and an explicit `--proxy-server` all set. The same URL
serves 430 KB to `curl`. **Verify a card image by fetching it and LOOKING at it**; the harness can only
tell you the figure was built and that no `.media-dead` fired.
  **A COMPOSED THUMBNAIL WIDTH FAILED AGAIN, AND IT COST NOTHING BECAUSE THE SIZE WAS TESTED.** A
`1200px-` path for the standing figure returned 2,010 bytes with a 200 status; the width Commons actually
offers is the `1920px-` one in `imageinfo`'s own `thumburl`. That is `cnh-046`'s finding recurring, and
the retry-until-the-file-is-big-enough loop is what turned it into a five-second correction rather than a
silently truncated picture.
  **THE GLOSSARY IMAGE IS THE OBJECT THE ABSTRACT MEASURES.** The card's picture is a bronze mask and the
term's is the 2.62 m standing figure from Pit 2 — the two most-named objects in the card, one each, so a
reader who opens the popup from the card sees something new rather than the same photograph twice. Two
files were rejected on the way: `Sanxingdui Bronze Standing Figure (9950550395).jpg` is a detail of the
robe with no head in frame, and the "largest mask" file is an oblique three-quarter rear view. **Look at
the frame, not only at the subject.**

  **`cnh-054` IS THE FIRST CARD IN THE DECK WHOSE SUBJECT MAY NOT HAVE EXISTED, AND THE SHAPE THAT WORKS
IS TO WRITE ABOUT THE CLAIM RATHER THAN AROUND IT.** Six later cards take the traditional account
(`cnh-055`), Yu as founder (`cnh-056`), the transmitted texts (`cnh-059`), the historicity question
(`cnh-061`) and Erlitou (`cnh-062`–`064`), so the overview card had to say what the Xia IS in the Chinese
historical scheme without spending any of them: first of the Three Dynasties, seventeen kings, the first
turn of the dynastic cycle, and a name that archaeology has been trying to attach to a site for seventy
years. **The received chronology's own disagreement is what gives the card its teeth** — Chavannes sets
out two systems side by side, one opening the dynasty in 2205 BCE for 439 years and one in 1989 for 432,
and the 2000 state chronology's 2070–1600 is a third answer; three figures for one dynasty says more
about the evidence than any sentence of commentary could.
  **THE TEXTUAL HALF CAME OFF ARCHIVE.ORG AND THE ARCHAEOLOGICAL HALF OFF SCHOLARSPACE, AND BOTH WERE
ALREADY IN THE DECK.** Chavannes' *Mémoires historiques* vol. 1 (`lesmemoireshisto0001edou`) carries the
rival chronologies at cxc–cxciii of its introduction and the fall of Jie at pp. 167–71 — cited twice, at
different pages, as `cnh-040` already does. Shelach 1994 states the traditional claim outright ("the
earliest Chinese state was the Xia dynasty… located in the Zhongyuan"), Lee 2002 carries the Three
Dynasties, the Mandate, the Zhou construction and the backward growth of the legendary period, and Xie et
al. 2020 carries Taosi and Erlitou as the two sites matched to Xia capitals. **Read the page furniture for
the citation**: the running heads in the OCR (`CXC INTRODUCTION`, `170 LES HIA`) are what turn a located
passage into a page number, and they are the only thing that does.
  **NAME THE THEORY, NOT THE THEORIST — TWICE, AND IT COST NOTHING.** Lee attributes the Zhou-construction
argument to one scholar and the backward-growth argument to another; the card states both claims and names
neither, exactly as the historiography rule prescribes, and `card-focus` returns `historio: 0` with an
empty `qNamed`. The sentences are shorter for it.
  **A BARE `Xia` ALIAS WAS DRAFTED AND DROPPED BEFORE IT SHIPPED, ON N7's RULE.** The plan has a whole
Western Xia collection at `cnh-465`–`472`, and "Western Xia" contains "Xia" as a whole word — so the alias
would have linked every mention of an 11th-century Tangut state to a Bronze Age one, which is the `Inner
Mongolia` → `Mongolia` fault in a new coat. **Before adding a one-word alias, grep the PLAN, not just the
shipped corpus**: the sibling term that will break it may not exist yet.
  **A NEW KIND TAG WAS OPENED: `dynasty`.** Nothing in 680 cards or 1,266 glossary terms used it — periods
have been `era` — but it is in the documented vocabulary, this collection has about forty dynasty cards
coming, and filing the Xia under `era` would have made the tag mean two different things. It groups
nothing today and will group forty by the end.
  **THE ARTICLE WAS MISSING FROM ALL THREE PHRASINGS AND ONLY THE BROWSER SHOWED IT.** The answer term
carries no article, so the question must supply one — and "Chinese tradition makes Xia dynasty the first
of the Three Dynasties" reads as a headline rather than a sentence. It is invisible in the JSON, where the
blank hides it, and obvious the moment the card is revealed. **Read the REVEALED question, not the
authored one**; the fix is `fix-field.js` for `question` and `add-questions.js` for the two extras, since
`fix-field.js` refuses an array.

  **`cnh-055` IS THE FIRST PLAN LINE THIS DECK HAS HAD TO RENAME, AND THE REASON IS THAT IT NAMED NO
ANSWER TERM.** "The traditional account of the Xia" is a subject, not a word a reader can be asked to
recall, and the four cards after it already take Yu, Qi, Jie and the transmitted texts. What was left —
and what no card had — is the middle of the received story: the dynasty LOST to usurpers for a generation
and won back. The line is now `cnh-055 Shaokang and the restoration of the Xia`, changed in the same
commit as the card. **A plan line that is a topic rather than a term has to be resolved into one before
it can be researched**, and the resolution is a judgement about what the neighbouring cards leave.
  **THE CARD'S BEST FACT IS AN ABSENCE: THE SHIJI SKIPS THE WHOLE EPISODE.** Chavannes' text runs
"L'empereur T'ai-k'ang perdit son royaume… Tchong-k'ang… Siang… Son fils, l'empereur Chao-k'ang, prit
le pouvoir", with nothing between Xiang's death and Shaokang's accession; it is the COMMENTATORS, in a
footnote, who supply thirty to forty years and two usurpers from the Zuo Commentary. **Read the
commentary apparatus, not only the text** — the note at p. 167 carries more of the traditional account
than the annals it hangs under.
  **AND THE ZUO COMMENTARY TELLS IT TWICE, AS ARGUMENT RATHER THAN AS RECORD.** Duke Hsiang year 4
(Legge V.ii.424–25) is a minister dissuading his marquis from a war against the Rong; Duke Ai year 1
(794) is Wu Zixu urging his king not to spare a beaten Yue — *the ruler of Yue is greater than
Shaokang*, and Shaokang began with ten li square and five hundred men. The second is the fuller telling
and carries the queen's escape through a hole in the wall, the shepherd's post, the cook's post, the two
daughters and the town of Lun. **Where a legendary episode survives, look for the SPEECH it was told
in**; the point being argued is what preserved the story.
  **COMMONS NOW REFUSES BOTH THE ORIGINAL FILE AND MOST COMPOSED THUMBNAIL WIDTHS, AND THAT EXPLAINS AN
EARLIER FINDING PROPERLY.** Fetching the original returns **429, "Too many requests… instead use
thumbnails"**, and a composed width returns **400, "Use thumbnail sizes listed on
https://w.wiki/GHai"** — the 2,010-byte error page this deck has now met three times. Probed on one
file: **320, 640, 800, 1024, 1200, 1400 and 2560 all 400; 1280 and 1920 answer.** So the rule is not
"any width" and it is not "the original": **build the `/thumb/…/1920px-…` path and test the byte count**,
and never ship the original URL in a card, since a reader would meet the same 429.
  **THE STYLE CHECKER CAUGHT `Shiji` AS AN AMBIGUOUS PERSON-OR-BOOK NAME**, in the glossary description
and, by inspection, in a question too — both now `<i>Shiji</i>`. It is a rule worth remembering before
drafting rather than after: this deck will write that word on every card about the transmitted record,
and `fix-field.js` cannot reach a `questions` array, so the repair goes through `add-questions.js`.

  **`cnh-056` IS THE SECOND PLAN LINE RENAMED IN TWO CARDS, AND FOR THE OPPOSITE REASON TO THE FIRST.**
`cnh-055` had to be renamed because its line named no answer term; `cnh-056 Yu the Great as founder` named
one, and it was **already spent** — `cnh-012` in the myth deck, written before the plan existed, carries
the flood, the four conveyances, the nine provinces, the Tribute of Yu, the nine cauldrons, Yi withdrawing
and the princes going to Qi, Mencius's defence and the received chronologies, in ten sentences. There was
no card left to write about Yu as founder. What there was, and what nothing in the deck or the 1,267-term
glossary had, is **the survey itself**: `cnh-056` is now `Tribute of Yu`. **Before researching a plan line,
grep the shipped corpus for its subject** — a collection written onto a tree that already had cards will
keep meeting this, and the check costs one command.
  **THE CARD'S BEST FACT IS AGAIN A COUNT, AND IT COMES OUT OF A FOOTNOTE.** Chavannes' note at pp. 102–3
records that the chapter **names Yu exactly twice, in its first sentence and its last**, so that removing
two sentences leaves the record of a settlement spreading over drained ground; and that the works described
are far beyond one man, tradition having credited him alone with the labour of several generations. That is
the second card running whose sharpest sentence is in Chavannes' apparatus rather than in his text — the
first being `cnh-055`'s interregnum. **Read the notes.**
  **THE SOURCES ARE FOUR PRIMARY AND ONE MODERN, AND THAT IS THE RIGHT RATIO FOR A CARD ABOUT A TEXT.**
Legge's *Shû King* carries the chapter (64–76) and, separately, his own account of how it came to be
written (Introduction, 16–19); Chavannes carries Sima Qian's reproduction of it (100–102) and the critical
note (102–3); Lee 2002 supplies the one thing the primary sources cannot — that the Three Dynasties era
held dozens of polities at once, so the nine provinces are a scheme rather than a survey. **Two page ranges
from one volume count as two citations** and `add-card.js` accepts them, which is what makes a
text-centred card reachable at the five-source bar.
  **THE IMAGE IS THE CARD'S SUBJECT AS A MAP.** The *Yuji tu*, carved in stone in 1136 and now in the Stele
Forest at Xi'an, is drawn on a ruled grid and its title panel names the mountains and rivers of the Tribute
of Yu — a Song attempt to draw the chapter this card is about. The Library of Congress rubbing is on
Commons at 9,849 px; the **1280px** thumb is 1.16 MB where the 1920px is 2.28 MB, and for a near-square
image in a 16:9 `contain` frame the smaller one loses nothing a reader can see.
  **`check-style` CAUGHT AN UN-ITALICISED `Book of Documents`** in the abstract, and the same rule will
fire on every card in this deck that names a classic. `fix-field.js` repairs it inside `abstract` in one
call; the glossary description was written italic from the start because the card had already been caught.

  **`cnh-057` KEPT ITS PLAN LINE, WHICH AFTER TWO RENAMES IS WORTH SAYING.** `Qi of Xia` names a real
answer term and `cnh-012` had spent only the accession dispute — one sentence of it — so the card had a
whole reign to itself. **The test is not "has the subject been mentioned" but "has the CARD that could be
written about it been written"**; on `cnh-056` the answer was yes, here it was no, and the check is the
same grep either way.
  **THE CENTRE OF THE CARD IS THE SPEECH AT KAN, AND THE CALENDAR IS WHAT MAKES IT HISTORY.** The charge
against the lord of Hu — wasting the five elements, abandoning the three commencements of the year — reads
as ritual nonsense until Legge's note explains it: each dynasty fixed the month its year began in, so to
begin the year on another month was to refuse the new house's authority. **A charge that sounds like
superstition is usually a charge about submission**; the same will be true of most of the accusations this
deck meets in the Documents.
  **AND CHAVANNES' NOTE TURNS THE CLOSING THREAT INTO A DESCRIPTION OF HOW AUTHORITY WORKED.** "Rewarded
before my ancestors, put to death before the altar of the land" is not rhetoric: a king on campaign carried
both sets of tablets with him, the ancestral one in a chariot of its own, so that his rewards came from the
tutelary spirit and his punishments from the god of the earth. That is the third card running whose best
sentence is in an apparatus rather than a text.
  **THE ANSWER TERM IS `Qi of Xia` AND THE GLOSSARY KEY IS `Qi_of_Xia`, WITH NO BARE `Qi` ALIAS — AND THAT
IS NOT A CLOSE CALL.** The plan carries the state of Qi (`cnh-152`), Duke Huan of Qi, Wu Qi, Bai Qi,
Southern Qi, Northern Qi, and *li* and *qi* as a pair of philosophical terms (`cnh-861`). This is `cnh-054`'s
Western Xia rule at seven times the scale: **grep the plan for a one-word alias before adding it**, and on
this deck expect the answer to be no.
  **NO WOODBLOCK PORTRAIT OF QI EXISTS IN THE SERIES `cnh-055` USED.** The `夏商合傳` category holds
nineteen files — Yu, Shaokang, Kong Jia, Tang, Yi Yin, Daji, King Wu, King Zhou and the rest — and no Qi.
What answered instead was `File:启 清人绘.jpg`, a Qing painting on silk in the Commons category *King Qi of
Xia*. **List the CATEGORY rather than searching the series title**: one API call returns every file in it
and settles in seconds whether the subject is there.
  **THE ABSTRACT CAME IN 23 WORDS OVER AND THE TRIM INTRODUCED A COMMA SPLICE.** Replacing a clause that
carried a colon dropped the colon with it, and the sentence read "…the one with whom the dynasty properly
begins, he took his father Yu's place…" — invisible to every checker, since punctuation is not what any of
them measure. **Read the trimmed block back as prose**, not just its word count.

  **`cnh-058`'s BEST SENTENCE IS THE ONE THAT SAYS THE STORY IS A TEMPLATE.** Chavannes' note records that
the tyrant imprisoning the founder who will replace him is told of the LAST SHANG KING too, so one account
is evidently modelled on the other; and that the personal name Sima Qian gives Jie ends in a cyclical
character, which is a Shang habit and no other Xia king's, so an early commentator assigns that name to
Tang instead. **The bad last king is a type before he is a person**, and the deck should expect the Shang's
own last king to arrive with the same furniture.
  **THE SPEECH OF TANG IS BETTER THAN THE ANNALS BECAUSE TANG HAS TO ARGUE HIS OWN PEOPLE INTO THE WAR.**
They ask what the crimes of the Xia are to them and why they are being called away from their fields; he
answers with Heaven's charge and closes by threatening to kill their children with them. That is the second
Documents speech in two cards (`cnh-057` was the Speech at Kan) to end on exactly that threat, which is
worth knowing before drafting: **the formula is the genre's, not the speaker's.**
  **A QUOTATION WITH AN INTERNAL QUESTION MARK BREAKS `split-abstract.js`, AND A `.”` DOES NOT BREAK IT
AT ALL.** Drafted with Legge's "When wilt thou, O sun, expire? We will all perish with thee." the block
split 4 instead of 5 — the splitter cut at the question mark and ran straight through the closing quote.
**Run `split-abstract.js` over a block that carries a direct quotation before adding the card**; the fix
here was to render the curse as indirect speech, which costs the ring of it and keeps the count honest.
  **AN IMAGE `desc` IS ESCAPED, SO A WORK TITLE IN IT CANNOT BE ITALICISED — REWORD INSTEAD.**
`cardImageHTML` writes `esc(img.desc)`, so an `<i>` there would print the tag on the page; and rule 1 of
`check-style` flags the bare title all the same, which is how "the Book of Documents" in this plate's
caption was caught in `glossary-extra.js`. The caption now names the Shujing. Note the repair path:
`fix-field.js` cannot reach an object field, so the CARD's copy goes through `update-cards.js` with the
whole `image` object, and the TERM's through `add-glossary.js`.
  **THE PICTURE IS THE EPISODE, FROM THE VERY BOOK THE CARD CITES.** `欽定書經圖說` — the *Imperially
Commissioned Illustrated Explanations of the Book of Documents*, 1905 — has a plate for the banishment of
Jie, with the rider labelled 夏桀 and the walled gate 南巢. **A Qing illustrated edition of a classic is the
place to look when a card is about a passage rather than an object**; the same series will serve the Shang
cards.

  **`cnh-059` IS THE THIRD RENAME IN FIVE CARDS, AND THE HARDEST, BECAUSE THE OBVIOUS ANSWERS WERE ALL
ALLOCATED ELSEWHERE.** "The Xia in the transmitted texts" names no term, and the two texts a reader would
reach for are already booked — `cnh-126 Book of Documents` and `cnh-241 Records of the Grand Historian` —
so the card had to be a text that is BOTH about the Xia and not one of those. Four candidates were worked
and dropped, and each refusal is worth the line: the ***Xia Xiaozheng*** (the almanac Confucius is said to
have found in Qi) — Legge carries the story and calls the identification "very uncertain", but **nothing
reachable here describes the almanac's contents**, so ten sentences could not be written; the **state of Qi
杞**, whose name collides with 齊 exactly as `cnh-057`'s did; the **Bin Gong xu**, the Western Zhou vessel
carrying the oldest known mention of Yu, which ScholarSpace and Europe PMC between them do not cover; and
the **Xia annals of the *Shiji***, which `cnh-054`–`056` have already emptied. The line is now
`cnh-059 Songs of the Five Sons`.
  **AND THE CHAPTER THAT ANSWERED IS THE ONE WHOSE TRANSMISSION IS THE STORY.** It carries the most quoted
line in the collection — *the people are the root of a country* — and it sits in the DISPUTED half of the
*Documents*: not among the 29 that a scholar hid in a wall before the burning of the books and recovered
under the Han, but among the further ones deciphered from tablets found in another wall and presented in
97 BCE, which critics from the Song onwards have called a later fabrication. **A card about "how the Xia
reaches us" is better written about ONE text with a route than about the corpus**, and the route is in
Legge's Introduction at pp. 7–11.
  **THE ABSTRACT CAME IN 49 WORDS OVER — THE WORST OF THE RUN — AND PATCHING IT TWICE MOVED IT BY NOTHING.**
Two rounds of clause-level substitutions netted 0 words, because each cut was paid back by the rewording
around it. What worked was rewriting the ten sentences from scratch at the target length and then trimming
three specific phrases. **When a first draft is more than about 20 words over, redraft rather than patch.**
  **`check-style` CAUGHT `twenty-nine` AS A NUMBER-WORD.** Non-round numbers above 20 are numerals, and the
temptation here is that the source's own prose says "twenty-nine" — but the abstract is not quoting Legge,
it is summarising him, so the rule applies. Repaired with `fix-field.js` on `abstract`.
  **THE PICTURE IS THE NEXT PLATE IN THE SERIES, AND THE CAPTION SAYS SO.** The 1905 illustrated *Shujing*
has no plate for the Songs; it has `仲康肇位圖`, Zhongkang taking the throne his elder brother lost, which
is the chapter immediately after. **A neighbouring plate, labelled as one, beats an unrelated object** —
and listing the Commons category (15 files) settled in one call what a title search could not.

  **`cnh-060` NEEDED NO RENAME — THE FIRST IN THREE — AND THE REASON IS THAT ITS SUBJECT IS AN OBJECT.**
"Bamboo Annals" names a thing with a discovery, a date, a text and a controversy, where "the traditional
account of the Xia" and "the Xia in the transmitted texts" named topics. **A plan line survives contact
with research in proportion to how much of a THING it names.**
  **THE WHOLE CARD IS IN LEGGE'S PROLEGOMENA, AT TWO WIDELY SEPARATED PLACES.** Pages 105–7 carry the
discovery — robbers opening King Xiang of Wei's grave in 279 CE, tablets in small seal script with more
than 100,000 words, fifteen works made out, two of them worth keeping, two years of transcription, and Du
Yu's independent testimony from the year after; pages 176–77 carry the criticism — Wang Mingsheng's verdict
that the whole thing was "imposed on the world" by one of its transcribers, Legge's refusal of it, the
tablets lost and disordered, the eleven books of *Fragmentary Sayings* whose matter drifted in, and the
showers of gold and changes of sex he compares to the marvels in Livy. Page 117 has the Xia section itself,
opening Yu's first year at **1989 BCE** — Chavannes' "second system" seen from the other side. **When a
19th-century translator gives a text a Prolegomena, the card is usually in it twice: once as narrative and
once as judgement.**
  **THE CARD ALSO CLOSES A THREAD THAT `cnh-059` OPENED, AND LEGGE MAKES THE JOKE HIMSELF.** Having just
written a card about a chapter recovered from a wall, this one is about a chronicle recovered from a tomb —
and Legge writes that his reader "has read so much of the recovery of portions of the Shoo from the walls
of houses that he must be tired of this mode of finding lost treasures, and smiles when he is now called on
to believe that an old tomb opened". **Two neighbouring cards can share a theme without repeating**, and
here the sources noticed it first.
  **THE PICTURE IS THE MEDIUM, NOT THE TEXT, AND THE CAPTION SAYS SO IN ITS FIRST FOUR WORDS.** No tablet of
the Bamboo Annals survives; what does survive from the same period and material is a case of Eastern Zhou
slips from a Chu grave in the Henan Provincial Museum, each sealed in a tube of preservative with a bronze
blade beside them. **"Not the annals, which survive only as a text" is the honest opening for any card whose
subject has no surviving object.**
  **COMMONS CATEGORY LISTING FAILED THREE TIMES ON A 429 AND ONE MALFORMED TITLE.** `Category:Bamboo and
wooden slips` returned zero members and three other category names returned unparseable bodies under rapid
requests; a plain keyword search two minutes later found the file at once. **Space the Commons calls and
prefer a search when a category guess returns empty** — an empty category listing looks identical to a
category that does not exist.

  **`cnh-061` IS THE FIRST CARD IN THIS DECK TO USE THE HISTORIOGRAPHY EXEMPTION, AND THE RENAME IS WHAT
EARNED IT.** "The question of the Xia's historicity" is a debate, not a term, and the historiography rule
would have refused the card outright — an abstract may not be mostly about the modern argument. The
exemption is for a card whose ANSWER TERM *is* a modern theory, debate, method or scholar, so naming the
term `Doubting Antiquity School` both gives the reader something to recall and puts the card inside the one
gate that lets it be written at all. **`"cnh-061"` is added to `EXEMPT` in `card-focus.js` with its
justification**, as that list requires; the measure now reports `historio: 0`, `modern: 3`, `qNamed: []`.
  **THE PLAN ASKED FOR A CARD THAT PICKS OPENLY RATHER THAN ONE THAT SOUNDS NEUTRAL, AND THE SHAPE THAT
DELIVERS IT IS TO GIVE EACH SIDE ITS BEST ARGUMENT AND NAME WHAT IS STILL OPEN.** The sceptical case is the
backward-growing legendary age — the Western Zhou knew only Yu, Confucius knew Yao and Shun before him, the
Warring States knew Huangdi and Shennong — and the answering case is Erlitou, found in 1959 by a survey that
went looking where the texts said. The card then states the two things neither side disputes: **the Erlitou
identification rests on place and date rather than on writing**, and a programme that sets archaeology to
find the capitals named in texts lets written history decide what archaeology looks for. Lee 2002's own
sentence carries both, which is why it is source 1.
  **THE 1990 SEMINAR IS THE SINGLE MOST USEFUL FACT AND IT IS ONE SENTENCE IN THE SOURCE**: at the
International Seminar of Xia Culture at UCLA "the Western scholars were about equally split on the question
of whether the Xia Dynasty actually existed, while the Chinese participants were in unanimous agreement
that it did". **A measured disagreement beats any amount of even-handed phrasing** — it tells the reader
the shape of the argument without the card taking a position in it.
  **THE DOUBT IS OLDER THAN THE SCHOOL, AND TWO 19th-CENTURY SOURCES ALREADY IN THE DECK PROVE IT.** Legge
quotes an 18th-century Chinese scholar calling the Bamboo Annals a fabrication "imposed on the world"
(Prolegomena 176–77, used on `cnh-060` the card before), and Chavannes writes in 1895 that the five emperors
and the Xia "belong to prehistory rather than to history", reconstructed by a method like palaeontology and
with "more art than science" (Introduction clxv–clxvi). **A card about a modern debate is stronger for
showing when the debate actually started**, and both citations were already paid for.
  **NO THUMBNAIL WIDTH ANSWERS FOR A SMALL COMMONS FILE, AND THE ORIGINAL DOES.** `Gu_Jiegang_1920s.png` is
688 px wide; 512, 640 and 688 all returned the 2,010-byte 400 page, and the plain original served 410 KB
first time. That qualifies `cnh-055`'s finding: **the 429 on originals is rate limiting under rapid repeats,
not a bar** — where no listed width exists, the original is the address, and a reader fetching one image
will not be throttled.
  **AND `set-date-line.js` REFUSED A 24-CHARACTER LABEL**, which is the guard doing its job: a row's label
names WHAT the date is in a word or two, so "Debating Ancient History" became `Published` with the title in
the value. Worth knowing before drafting a date line for a card about a book.

  **`cnh-062` IS THE FIRST OF THREE ERLITOU CARDS AND THE SPLIT HAD TO BE MADE BEFORE THE RESEARCH.**
`cnh-063` takes the SITE and `cnh-064` the BRONZE, so this one is the CULTURE — the chronology, the phases,
the ceramic signature and the distribution — and the site's 400 hectares appear here only as the one fact
that makes the distribution intelligible. **Where a plan gives three cards to one subject, write down which
facts belong to which before opening a source**; every paper on Erlitou carries all three and the temptation
is to spend them on the first card written.
  **THE CARD'S BEST FACT IS A CHRONOLOGICAL ONE AND IT COMPLICATES THE WHOLE DEBATE `cnh-061` DESCRIBES.**
Shelach 1994 records that the rammed-earth foundations and the bronze vessels — the things that make
Erlitou look like a state — appear only in phases three and four, so they date to the 18th and 17th
centuries BCE. **Most of what makes the culture look like a dynasty is late in it.** That is worth having
directly after the historicity card, and neither side of that argument disputes it.
  **LIU LI 2003 IS THE SOURCE FOR WHAT AN ARCHAEOLOGICAL CULTURE ACTUALLY *IS* HERE.** Its ritual pottery —
white and fine grey vessels on three legs, the form derived from Dawenkou *gui* in Shandong — is made in the
Yiluo basin and grows scarcer with distance; the same vessels appear in western Henan and southern Shanxi in
phase III, so alike in shape that they were probably carried rather than copied, which reads as prestige
goods passed down to peripheral elites and a shared ritual rather than a shared population. **A culture card
needs one class of object followed all the way out to the edge of the distribution**, and this is it.
  **AND SHI 2021 ANSWERS WHY THE EXPANSION WENT WHERE IT DID**: Dongxiafeng, 25 hectares and one of the
largest sites of the period in the Jinnan basin, sits five kilometres from the copper and salt of the
Zhongtiao mountains. Liu Li's phrase is "organized population movement to resource-rich regions"; Shi names
the resources. **Two ScholarSpace papers seventeen years apart, one saying where and one saying why.**
  **THE `imageinfo` THUMB PATH MUST BE TAKEN VERBATIM — THE HASH PREFIX IS NOT GUESSABLE.** A composed
`/thumb/9/9c/…` path for the Erlitou pottery returned the 1,930-byte error page; the API's own `thumburl`
gives `/thumb/4/47/…`. That is a different failure from the width problem recorded on `cnh-055`: the two
hex characters are an MD5 fragment of the filename, so **copy the whole path out of `imageinfo` and change
nothing but the width**.
