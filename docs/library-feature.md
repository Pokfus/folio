# The Library — how the reading room is wired

Moved out of CLAUDE.md (Aug 2026). **Read this before touching `PAGES.library`,
`PAGES.book`, the facing-original columns, the chapter bar, the marker's ink or
the highlights.**

- **THE LIBRARY — whole books, read on the site** (`PAGES.library` at `#library`, `PAGES.book` at
  `#book/<id>`, the `THE LIBRARY` block in app.js; Aug 2026, on request). A reading room beside the
  flashcards. **The page that used to be called the Library is now Collections** — its route, hash and
  markup are untouched (`#decks`, every shared link still works); only the label, the eyebrow and its
  `PAGE_META` title changed. Two pages called Library, one titled Collections, is how a reader lands on the
  wrong one.
  · **IT EXPLAINS ITSELF ON A FIRST VISIT, IN TWO HALVES** (Aug 2026, on request), the Atlas's pattern one
    page over. It was ONE card on the shelf covering five features, and three of the five are about the
    inside of a book — the chapter bar, the facing original, the marker and the highlights. A reader
    standing at the shelf has not opened a book yet, so those three describe furniture that is not on the
    screen and cannot be tried, which is the surest way to have an explanation read past. Split at the
    obvious seam: **the SHELF card** (`LIB_HELP_TIPS`) says what may be shelved and why, how to search,
    sort and hold, and that your place is kept; **the BOOK card** (`BOOK_HELP_TIPS`) says how to read one
    and is shown the first time a book is actually opened, beside the bar it is talking about. Both are
    built on `document.body` by `pageHelp` and NOT written into their page — see that bullet under "How the
    app is wired" for the reason, which is `.page` being the containing block for anything
    `position:fixed`. Each has a "?" bringing it back (`#libHelpBtn` beside the sort, `#bkHelp` at the end
    of the chapter bar). **TWO KEYS, because they are answered at different moments and one must not retire
    the other**: the shelf's is untouched (`folio_library_tour_v1`), so a reader who met the old card is
    not shown that half again — and DOES meet the book half, which is new to them and is the part they were
    likeliest to have skimmed. Beside `folio_book_tour_v1` sits a session flag (`_bookHelpShown`), because
    **the book page RE-RENDERS under the reader**: the original-language bundle lands a moment after the
    page opens and calls `render()`, which closes every overlay on the body, so on the stored value alone
    the card would be taken away and rebuilt mid-sentence with the focus reset.
    **`test-library.js` must suppress BOTH keys**, not just the shelf's — the book half sits over the very
    page its gesture sections swipe, and it announced itself by silently eating one real-touch swipe.
  · **WHAT MAY BE SHELVED, and it is the only content rule.** Folio serves the text itself, so a book goes
    up only where the copyright has **expired**. For a classical author the trap is that the original and
    the TRANSLATION are separate works: Seneca's Latin is free and the English is a 20th-century work with
    its own copyright. Seneca ships in **Gummere's Loeb translation (1917/1920/1925)**, public domain in the
    US as pre-1929 publication; the familiar Penguin translation (Campbell, 1969) is **still in copyright
    and must not be used**, and is named in `fetch-book.js` so nobody reaches for it later. The Meditations
    ships in **Haines's Loeb translation (1916)** on the same pre-1929 grounds — and clears the bar more
    widely, Haines having died in 1935, so it is also PD wherever the term is life plus 90 or less; the
    modern Hays (2002) and Hammond (2006) translations are **still in copyright** and are likewise named so
    nobody reaches for one. The Art of War ships in **Giles's translation (1910)** on the same pre-1929
    ground — Griffith (1963) and Ames (1993) are named as the ones not to reach for — and it is **the first
    book here whose licence states a LIMIT as well as a ground**: Gummere and Haines died in 1942 and 1935,
    so their translations clear the life-plus-seventy rule as well, while **Giles lived until 1958, so his
    stays in copyright in life-plus-seventy countries until 2029**. The site's bar is that the copyright has
    expired and the ground the other two are served on is US publication before 1929; this meets that bar on
    that ground, and the limit is **said outright in `rights` rather than smoothed into the sentence the
    other two use**. (The Chinese underneath is ~25 centuries old and free everywhere.) The Republic ships
    in **Jowett's translation (1871, revised through the 1890s; this printing 1901)**, and it is the
    easiest licence of the four — **needing no qualification at all**, which only the Analects has
    matched since: Jowett died in 1893, so
    it is PD on the pre-1929 publication rule, on life-plus-seventy, and on life-plus-a-hundred. The 1901
    Colonial Press volume carries a copyright notice, which covers what the press ADDED to Jowett — a
    special introduction by W. C. Lawton and a set of engraved plates — and neither is imported; what is
    taken is the ten books of the translation. Lee (1955), Bloom (1968) and Grube/Reeve (1992) are named
    as the ones not to reach for. The Metamorphoses ships in **Brookes More's blank verse (Boston, 1922)**
    — pre-1929, and More died in 1942, so it clears both rules as Gummere's and Haines's do — and it is
    **the first book here where BOTH columns carry the Perseus CC BY-SA 4.0 layer** as well as an expired
    copyright, the Meditations' Greek having introduced that layer on an original alone. Its Latin is
    grounded on the PUBLICATION date (Magnus, 1892–1919) and on the age of the poem, and deliberately not
    on the editor's death year: Wikisource's author page for a "Hugo Magnus" who died in 1907 is a
    DIFFERENT MAN, a German ophthalmologist, and citing it would have been a fabricated fact holding up a
    licence — the worst place to put one. Humphries (1955), Mandelbaum (1993), Martin (2004) and McCarter
    (2022) are named as the ones not to reach for. **On the Nature of Things ships in William Ellery
    Leonard's verse (Dutton, New York, 1916)** — pre-1929, and Leonard died in 1944, so it clears both
    rules as Gummere's, Haines's and More's do — over a poem of the 50s BCE, with the Perseus CC BY-SA 4.0
    layer on both columns as Ovid and Suetonius have. **It is where the Ovid discipline bit hardest and
    the honest answer was to claim LESS**: Perseus's Latin file names no editor and gives its imprint as
    the words "Lost information", so no editor and no publication date are asserted for the Latin
    anywhere — not in `edition`, not in `rights` — and the ground stated is the age of the poem, which
    needs no edition to establish and anyone can check. Munro, Lachmann and Bailey are each one search
    away and naming one would have been exactly the Hugo Magnus mistake; instead the book's own page
    **tells the reader that it cannot say whose edition the Latin is**, which is better than a confident
    wrong answer. Humphries (1968), Melville (1997) and Stallings (2007) are named as the ones not to
    reach for. **The Nicomachean Ethics ships in W. D. Ross's translation (Clarendon Press, Oxford,
    1925)**, and it is **the SECOND book here whose licence states a LIMIT as well as a ground**, the Art
    of War being the first — and the longer of the two: pre-1929 publication makes it public domain in the
    US, and **Ross lived until 1971, so it stays in copyright in life-plus-seventy countries until 2042**,
    against Giles's 2029. Wikisource's own tag on the work says exactly that (US public domain; elsewhere
    only where the term is life plus 54 or less) and is quoted rather than paraphrased into something
    softer. **The trade was weighed rather than waved through, and what buys it is the second column.**
    Chase's translation of 1847 is on the same shelf, its copyright expired everywhere, needing no
    qualification at all — and it prints the Bekker numbers in Book One and in none of the other nine, so
    it could only ever have shipped as an English column on its own. **Both were measured over all ten
    books before the choice was made: Chase agrees with the Greek on 18 of its 181 pages, Ross on 173 of
    173.** So the rule to carry is that **the licence question and the pairing question are decided
    together** — the cleanest copyright on the shelf may be attached to the text that cannot be paired,
    and which of the two matters more is a decision for the person whose site it is, not one to settle
    quietly in an importer entry. Bywater's Greek (1894, and he died in 1914) costs nothing on either
    rule and carries the Perseus CC BY-SA 4.0 layer. Irwin (1985), Crisp (2000) and Rowe (2002) are named
    as the ones not to reach for — and with them, particularly, **Ross REVISED BY LESLEY BROWN (Oxford
    World's Classics, 2009)**, which carries this translator's name on its cover, is the edition a reader
    is likeliest to own, and is a separate copyrighted work. **The Histories is the first book here whose
    SECOND LAYER IS THICKER THAN A DIGITAL EDITION, and that has to be said rather than smoothed over**
    (Aug 2026). Godley's translation and the Greek facing it are the Republic's and the Oedipus Rex's
    easy case — published 1920–1925, and he died in 1925, so both columns are public domain on the
    pre-1929 rule, on life-plus-seventy and on life-plus-a-hundred, with no limit to state as Giles
    (2029) and Ross (2042) need. What is different is that everywhere else Perseus's contribution is the
    *digital* edition over a printed text left as its editor set it, while here **they have also edited
    the PROSE**: this English is Godley modernized to remove archaisms, by Steven Ott and reviewed by
    John Marincola, which the source file states in its own header and which is quoted rather than
    paraphrased. That is a recent derivative work carried by CC BY-SA 4.0 rather than by an expiry, so it
    is stated in `rights`, in the book's front matter and in the importer entry — a reader who goes
    looking for the 1920 printing must not be surprised by what they find. De Sélincourt (1954),
    Waterfield (1998), Purvis (2007) and Holland (2013) are named as the ones not to reach for.
    **The Analects is the shelf's EASIEST licence and the second needing no qualification at all**
    (Aug 2026), the Republic being the first: Legge published in 1861 and revised for the second
    edition of 1893 — both pre-1929 — and **died in 1897**, so it is PD on the publication rule, on
    life-plus-seventy and on life-plus-a-hundred, with no limit to state as Giles (2029) and Ross
    (2042) need and no modern editorial layer as the Histories and the Meditations' Greek carry. The
    Chinese beside it is ~24 centuries old. Waley (1938), Lau (1979), Leys (1997) and Slingerland
    (2003) are named as the ones not to reach for.
    **The Gallic War is the first here whose ground is the PUBLICATION DATE and nothing else** (Aug
    2026), and the reason is a translator who cannot be found. McDevitte and Bohn's English was
    published by Harper in 1870–1872 and T. Rice Holmes's Latin at Oxford in 1914, both long pre-1929,
    so the United States copyright in both has expired and that much is certain. But a joint work's
    life-plus-seventy term runs from the LAST surviving author, and while McDevitte's dates are known
    (1834–1909, Library of Congress and Wikisource) and Holmes's are (1855–1933, Dictionary of Irish
    Biography and Wikipedia), **"W. S. Bohn" has no first name, no dates and no biography in anything
    openable** — probably connected with Henry Bohn's Classical Library, whose series the translation
    first appeared in, but that is an inference and is not used to hold anything up. So no
    life-plus-seventy date is claimed for that half, the gap is stated in `rights` and on the book's own
    front matter, and the reader is told what is known and what is not. It is the Lucretius judgement in
    a second book — **claim less rather than round up** — and it is the honest shape for any future book
    whose byline outruns the record. Handford (1951), Hammond (1996) and O'Donnell (2019) are named as
    the ones not to reach for.
    **The Book of Documents needs no qualification either** (Aug 2026), on exactly the Analects' grounds
    and from the same volume: Legge published in 1879 and died in 1897, so it is public domain on the
    pre-1929 publication rule, on life-plus-seventy and on life-plus-a-hundred, with no limit to state and
    no modern editorial layer to declare. The documents underneath are ancient. Karlgren's translation of
    1950 and Waltham's modernisation of Legge of 1971 are named as the ones not to reach for.
    **The Book of Rites is Legge's third easy licence and needs no qualification either** (Aug 2026):
    published 1885, died 1897, so it clears the pre-1929 rule, life-plus-seventy and life-plus-a-hundred
    alike, with no limit to state and no modern editorial layer. Chan's translations of 1963 and the
    Library of Chinese Classics edition of 2001 are named as the ones not to reach for. What its `rights`
    does state, and no other book's has had to, is a piece of the printed volume that is NOT reproduced —
    the six mourning charts of Book II's appendix — because they are absent for a transcription reason
    rather than a copyright one and a reader meeting the appendix's argument without its tables is owed
    the reason. **Its `BOOK_AUTHOR_COLOR` row widened the band downward a SECOND time**, which the Prose
    Edda's row did first and Beowulf's predicted: with twenty-six colours placed, nothing in the shelf's
    own band clears 21.6 of its nearest neighbour once the 4.5:1 bar is applied, and every candidate at
    that number is an eighth red. Dropping the floor to L 12 opens it again — and needs a SECOND FLOOR
    that is new, since a colour dark enough stops being a colour and becomes the body ink: every
    candidate is now also held 22 clear of all six light themes' inks, which is what rules out the L 10
    swatches that scored 26. Of the three survivors the **Euripides test picked against the raw number**
    for the second time: the best is a blue-violet at 23.3 and the third a dark burnt brown at 22.8 that
    lands 24.2 from Confucius — who is the ANALECTS, the one book on the shelf a reader is likeliest to
    hold beside the Lî Kî. So the dark plum `#460030` at 22.6, clearing Plato, Snorri and Beowulf by
    22.6/22.8/23.0 evenly, 36.6 from the Classic of Poetry and 48.5 from Confucius, reading 9.70:1 on the
    tightest of the sixteen light papers.
    **Its `BOOK_AUTHOR_COLOR` row is where only two hue families were left** — a sweep of the whole RGB
    cube inside the shelf's own lightness and chroma band found candidates clearing 20 of their nearest
    neighbour in red (20.1) and green (22.5) and nowhere else, which is the Beowulf row's prediction
    arriving. **The red was rejected on the EURIPIDES TEST**: its 20.1 is against Sun Tzu's rust, and Sun
    Tzu is the other ancient Chinese work on the shelf, so a red here would say the two are a set. The
    green the Vyasa and Kalidasa rows turned down is not this one — their objection was that every green
    clearing Lucretius and Aesop sat at the TOP of the chroma band, bright enough to glow beside twenty
    muted colours, where `#0F4503` sits at chroma 44 of a 18–64 range and lightness 25 of a 25–48 one, the
    dark end of both. It clears Gilgamesh, Aesop and Lucretius by 22.1–22.2 evenly and reads 6.75:1 on the
    tightest of the sixteen light papers. Keyed by id, the documents being anonymous.
    **The Peloponnesian War is the THIRD needing no qualification at all** (Aug 2026), after the Republic
    and the Analects, and all three of its layers are clear: Thucydides wrote in the fifth century BCE,
    Richard Crawley published in 1874 and died in 1893, and the Greek is Henry Stuart Jones's Oxford text
    of 1910 (he died in 1939) — so every layer clears the pre-1929 publication rule, life-plus-seventy and
    life-plus-a-hundred alike, with no limit to state as Giles (2029) and Ross (2042) need. **One figure
    looks like a problem and is not**: this Greek is usually met as the 1942 Oxford printing, which is the
    same Stuart Jones text with an apparatus criticus added by J. E. Powell — it is the TEXT that is
    imported and not the apparatus, and the source file states the 1910 publication itself. Warner (1954),
    Lattimore (1998) and Mynott (2013) are named as the ones not to reach for, and **with them the Landmark
    Thucydides of 1996, which is the edition a reader is likeliest to own and prints a REVISED Crawley**;
    what is here is Crawley's own 1874 text. **The choice of translation was itself a licence-and-pairing
    decision**, the Ethics' trade made the other way: Perseus's English for Thucydides is Hobbes's of 1629,
    in the same TEI encoding as the Greek, which would have paired 917 against 917 by construction out of
    one source and needed no new code — and it was rejected on the reader's behalf, because the Library is
    a reading room and Hobbes's English is seventeenth-century English. **The cleanest text to import is
    not always the one worth reading**; the cost was one missing chapter number in 917.
    **The Song of Roland is the THIRD book to state a LIMIT as well as a ground, and the first where
    the limit falls on BOTH columns** (Aug 2026) — the Art of War (Giles, 2029) and the Nicomachean
    Ethics (Ross, 2042) being the earlier two, each with the limit on one side only. The poem is
    around nine hundred years old and free everywhere, but both modern layers are works of the 1920s:
    Scott Moncrieff's translation of 1919 (he lived 1889–1930) and Bédier's Old French text of
    1920–1922 (1864–1938), so both clear the pre-1929 publication rule and life-plus-seventy —
    expired 2001 and 2009 — and **neither has yet cleared life plus a hundred, which runs to 2031 and
    2039**. Said outright in `rights` rather than smoothed into the easier sentence, as Lucretius's
    entry says: claim less, and put on the page what cannot be said. Dates looked up rather than
    recalled, for the Hugo Magnus reason. **Only the poem is imported**: the 1919 volume also carries
    an introduction by G. K. Chesterton (d. 1936) and a note on technique by George Saintsbury
    (d. 1933), later works by other hands, left behind exactly as the Republic's 1901 introduction and
    plates were. Sayers (1957), Harrison (1970), Goldin (1978), Brault (1978) and Burgess (1990) are
    named as the ones not to reach for.
    **Medea is the FOURTH to state a LIMIT, and the first where the limit falls on the ORIGINAL**
    (Aug 2026) — the Art of War (Giles, 2029), the Nicomachean Ethics (Ross, 2042) and the Song of
    Roland (both columns, 2031 and 2039 on life-plus-a-hundred) being the earlier three. Everywhere
    else on this shelf the original is the older and easier half; here it is the harder one. Both
    columns clear the pre-1929 rule — Edward Coleridge's translation was published in London in 1906
    and Gilbert Murray's Greek at Oxford in 1902 — and Coleridge died in 1936, so his English also
    cleared life-plus-seventy in 2007. **Murray died in 1957, so his Greek stays in copyright where
    the term is life plus seventy — the UK and the EU among them — until 2028.** Said outright in
    `rights` and on the book's own front matter rather than smoothed into the easier sentence the
    Oedipus Rex can honestly use; both years were checked against Wikisource's author pages rather
    than recalled, for the Hugo Magnus reason, and Murray's is the year the whole licence turns on.
    **THERE WAS NO CLEANER GREEK TO REACH FOR**, which is worth recording because the Ethics makes
    the opposite choice look available: there it was a real trade (Chase's free 1847 English pairs on
    18 of 181 Bekker pages, Ross's limited one on 173 of 173), where Perseus carries exactly one
    Greek Medea and the older `grc1` file does not exist. So the choice was this text or no original
    at all, and a second column pairing on 500 of the translation's 502 sections is worth a stated
    limit that expires in two years. Warner (1944), Vellacott (1963) and Arnson Svarlien (2008) are
    named as the ones not to reach for.
    **The Bhagavad Gita is the SIXTH to state a LIMIT** (Aug 2026), after the Art of War (Giles,
    2029), the Nicomachean Ethics (Ross, 2042), the Song of Roland (both columns, 2031 and 2039), the
    Medea (Murray, 2028) and Gilgamesh (Thompson, 2042). The poem is some two thousand years old and
    free everywhere; the only modern layer is Annie Besant's English, first published 1895 and printed
    here in the fourth edition of 1922. She lived 1847–1933 — dates looked up on Wikidata rather than
    recalled, for the Hugo Magnus reason — so it is public domain in the United States on the
    pre-1929 rule and cleared life-plus-seventy at the start of 2004, while life plus a hundred runs
    to 2034. **Its Sanskrit column names no editor and none is invented**, which is the Lucretius
    judgement in a second book: the volume's index page leaves the Editor field empty and the
    publisher's note claims only to have printed "the text in Devanagari" beside the translation, so
    what is stated is that this is the received text and that no modern editor is credited. Natesan's
    own 1907 note is left behind as Thompson's preface and the Republic's introduction were — it is
    quoted in the front matter as evidence of what the edition was FOR, and not reproduced as part of
    the book. Mascaró (1962), Easwaran (1985), Stoler Miller (1986) and Patton (2008) are named as the
    ones not to reach for.
    **Beowulf is the first book here where the thing that cannot be established is a DATE rather than a
    NAME** (Aug 2026), and it is the Gallic War's judgement in a new coat: claim less, and put on the
    page what cannot be said. The poem is Old English and about a thousand years old, so it is free
    everywhere; Gummere's translation was published in 1909 and he lived 1855–1919, so it clears the
    pre-1929 rule, life-plus-seventy (1990) and life-plus-a-hundred alike — no limit to state, which
    puts it with the Republic, the Analects, the Peloponnesian War and Kalidasa rather than with Giles
    (2029) or Ross (2042). What could not be settled is **A. J. Wyatt**, whose 1894 Cambridge text is
    the facing column. Where the Gallic War's "W. S. Bohn" could not be found at all, Wyatt CAN be
    found and the answer is not trustworthy: Wikidata gives 1835–1935 at **year precision**, a
    suspiciously round hundred years, and Wikisource's author page carries no dates and no
    public-domain tag for him where Gummere's carries PD-old. He was certainly alive in 1919, having
    published an Anglo-Saxon Reader that year. **A date that exists is not the same as a date that is
    established** — check the precision and the corroboration, not merely whether a field is filled —
    so no life-plus-seventy term is asserted for that column, the ground stated is the 1894
    publication, and the conditional (expired 2006 if the 1935 death is right) is given on the book's
    own page rather than smoothed into a flat claim. Heaney (1999), Liuzza (2000), Tolkien's prose
    version (published 2014) and Headley (2020) are named as the ones not to reach for.
    **The Prose Edda is the SEVENTH to state a LIMIT** (Aug 2026), after the Art of War (Giles, 2029),
    the Nicomachean Ethics (Ross, 2042), the Song of Roland, the Medea (Murray, 2028), Gilgamesh and the
    Bhagavad Gita. Snorri Sturluson died in 1241, so the work is free everywhere; Brodeur's translation
    was published by the American-Scandinavian Foundation in 1916 — read off the volume's own title page
    rather than recalled — so it is public domain in the United States on the pre-1929 rule, and he
    lived 1888–1971, so it stays in copyright where the term is life plus seventy until 2042, the same
    position as Ross. **His dates are unusually well corroborated for this shelf** and that is worth
    noting against Wyatt's: Wikidata gives them at DAY precision and Wikisource's own PD/US tag on the
    work independently gives 1971, so this is not the lone unverified figure the Beowulf entry had to
    hedge around. Brodeur's fifty-page introduction and his index are not imported, which is the
    Republic's precedent for the introduction and plates it left behind. Young (1954), Faulkes (1987)
    and Byock (2005) are named as the ones not to reach for. Its `BOOK_AUTHOR_COLOR` row is where the
    band was WIDENED as the Book of Documents' row predicted — see that row for the search, and for the
    Euripides test doing real work: the one book a reader genuinely pairs with the Prose Edda is
    BEOWULF, the shelf's only other Germanic work, so the two candidates nearer his oxblood were
    rejected and this dark violet is both the best-separated colour in the widened band and the one
    furthest from him.
    **The City of God is the FOURTH licence needing no qualification at all** (Aug 2026), after the
    Republic, the Analects and the Peloponnesian War, and all three of its layers are clear:
    Augustine died in 430, Marcus Dods published his translation in Edinburgh in 1871 and Philip
    Schaff reprinted it in 1887 — both long pre-1929 — and Dods died in 1909, so the English clears
    the publication rule, life-plus-seventy and life-plus-a-hundred alike, with no limit to state as
    Giles (2029) and Ross (2042) need and no modern editorial layer as the Histories and the
    Meditations' Greek carry. Migne's Latin of 1841 is free on the same three grounds. Schaff's own
    introductory essays and index are not imported, which is the Republic's precedent for the
    introduction and plates it left behind. Bettenson (1972), Dyson (1998) and Babcock (2012–2013)
    are named as the ones not to reach for. Its `BOOK_AUTHOR_COLOR` row is the easy case the last
    several have not been: with twenty-seven colours placed, only three hue families still hold
    anything inside the shelf's band under the Book of Rites' ink floor and the 4.5:1 bar, and the
    best NUMBER and the right grammar were the same colour for once — a very dark brown clearing
    Sophocles, Confucius and Beowulf by 23.0, 23.2 and 24.0, against the shelf's tightest pair at
    18.2, and reading 9.42:1 on the tightest of the sixteen light papers, the highest of any swatch
    here. The blue at 22.6 was rejected on Thucydides' rule, being a fourth colour in a quarter that
    already holds Aristotle, Machiavelli, Herodotus, the Song of Roland, Snorri and Seneca. The band
    did not have to be widened again.
    **The Iliad states a LIMIT ON EACH COLUMN** (Aug 2026), which puts it with the Song of Roland
    rather than with the four needing no qualification, and every date was looked up rather than
    recalled. The poem is free everywhere; both modern layers are 1920s scholarship, clearing the
    pre-1929 rule and life-plus-seventy and neither yet clearing life plus a hundred — Murray died in
    1940 so the English runs to 2041, and the Greek is a JOINT work whose term runs from the last
    surviving author (Monro 1905, Allen 1950), so it runs to 2051. **The original is therefore the
    harder half**, which is the Medea's position rather than a new one. **A. T. MURRAY IS NOT GILBERT
    MURRAY**, who edited the Medea's Greek on this same shelf: both born 1866, different men, and
    taking one's death year for the other's would have put a wrong date under the whole licence —
    the Hugo Magnus trap wearing a surname this shelf already uses.
    **AND THE EASIER COPYRIGHT WAS ATTACHED TO THE TEXT THAT CANNOT BE SHIPPED**, which is the
    Nicomachean Ethics' trade in a new form. Perseus carries two English Iliads: Butler's of 1898,
    whose own copyright expired long ago (he died in 1902), and Murray's Loeb. Butler's is NOT usable
    — its header states it is "revised by Timothy Power and Gregory Nagy", a substantive modern
    revision by living scholars carried by CC BY-SA rather than by an expiry, and visible in the text,
    which inserts transliterated Greek into the English ("the anger [mênis] of Achilles"). It is also
    half as densely numbered (190 cards and 1,450 line milestones against 425 and 3,143). So the
    licence question and the pairing question were settled together again, and a stated limit was
    worth paying for a column that is actually what it says it is. **Both files' revision histories
    were READ before this was concluded** — the Antigone found the shipped Oedipus Rex silently
    carrying exactly such a layer while its `rights` called it clean.
    Its `BOOK_AUTHOR_COLOR` row **REVERSES the City of God's decision above and says so**: `#001270`
    is the deep blue-indigo that row measured at 22.6 and rejected on Thucydides' rule. Three things
    changed. It is no longer a near-tie — with twenty-eight colours placed the field is 22.6 against
    19.9 for the next best and 19.7 for a green reading 4.63:1, so avoiding a crowded hue now costs
    2.7 points of separation and most of the contrast headroom. The quarter is crowded in HUE and
    empty at this LIGHTNESS (every existing blue sits at L 30–46, this at L 13.2), and counting
    swatches within 40 rather than counting the hue family it has FIVE neighbours, fewer than any
    other family's best. And its nearest is Snorri at 22.6 rather than Herodotus at 24.3, so the
    Euripides test is asked about Homer against the Prose Edda, which nobody reads as a pair.
    **The band was TESTED rather than assumed full**: with the lightness and chroma limits removed
    the search returns a pure electric blue at chroma 133, which is what the band exists to prevent.
    It reads 9.58:1, second only to the Book of Rites' 9.70 — which also corrects the City of God
    row's claim that its 9.42 was the highest on the shelf.
    **The Odyssey COSTS NO COLOUR AT ALL, and that is the point of keying them by author** (Aug 2026):
    `BOOK_AUTHOR_COLOR` is keyed on the `author` string the banner already prints, so Homer's second
    book takes Homer's blue-indigo with no row added and no search run — which is exactly the outcome
    the two Platos were the argument for. The band being as full as the Beowulf row records, a shelf
    that keyed colour per BOOK rather than per author would by now be picking between a pair nobody
    can tell apart and a hue that asserts a kinship the shelf does not mean.
    **AND IT IS THE SIMPLEST LICENCE OF ANY TWO-COLUMN BOOK HERE** — the counterpart of the Iliad's,
    on the same shelf and by the same translator, which is worth stating because the difference is
    instructive rather than lucky. Perseus's Greek for the ILIAD is Monro and Allen's Oxford text, a
    separate edition by two other men, so that book has to reason about a joint work's term and the
    original comes out the harder half at 2051. Perseus's Greek for the ODYSSEY is the text printed on
    the facing half of Murray's OWN 1919 Loeb volumes, credited to Murray: one publication, one life,
    one date, both columns, life plus a hundred running to 2041 and nothing else to say. **Ask whose
    text the original actually is before assuming a facing-page book inherits the translation's
    licence** — and equally before assuming it does not. Its three layers were checked the same way
    the Iliad's were: both revision histories READ (card breaks, proofreading, a DTD revision and the
    EpiDoc conversion, and nothing else), and Perseus's OTHER English Odyssey rejected for the same
    reason as its other Iliad — `perseus-eng4` is Butler "revised by Timothy Power and Gregory Nagy",
    a modern layer carried by CC BY-SA rather than by an expiry. The easier copyright is attached to
    the text that cannot honestly be shipped as its named translator's work, twice over now.
    **The Aeneid is the FIFTH licence needing no qualification at all** (Aug 2026), after the Republic,
    the Analects, the Peloponnesian War and the City of God, and it is the plainest of the five: the
    poem is two thousand years old, Theodore C. Williams published his blank verse in Boston in 1910
    and lived 1855–1915, and J. B. Greenough's Latin was published in 1881 and he lived 1833–1901, so
    every layer clears the pre-1929 rule, life-plus-seventy AND life-plus-a-hundred, with the Perseus
    CC BY-SA 4.0 layer on both columns as Ovid, Lucretius and Suetonius carry. Neither TEI header states
    a licence, so both are covered by the repository's blanket grant, which is Suetonius's position.
    **WILLIAMS'S DATES NEEDED THE BEOWULF CHECK ON TOP OF THE HUGO MAGNUS ONE**: Wikisource carries a
    stray 1864 in its metadata beside 1855–1915 in its text, which is the shape that made A. J. Wyatt's
    dates unusable — here it RESOLVES rather than blocking anything, Wikidata and his biography agreeing
    at day precision, so the odd figure is a data slip. **A date that exists is not the same as a date
    that is established, and the difference is whether anything else says the same thing.** There is
    also a second Williams to keep apart from this one, as the Iliad has two Murrays: this is Theodore
    CHICKERING Williams, the American Unitarian minister who Englished Virgil and Tibullus. Both
    revision histories were READ, on the Antigone's rule, and neither carries a modern editorial layer —
    they are scans, XML conversions and single-word OCR fixes. **DRYDEN WAS WEIGHED AND COST NOTHING TO
    REFUSE**, which is the Nicomachean Ethics' trade in its easy direction: his 1697 Aeneid is free
    everywhere and is seventeenth-century heroic couplets, the objection that ruled out Golding's Ovid
    and Hobbes's Thucydides — and Perseus carries no Dryden here anyway, so unlike the Ethics the
    readable column and the pairable column are the same column. Mandelbaum (1971), Fitzgerald (1983),
    Lombardo (2005), Fagles (2006), Ruden (2008), Ferry (2017) and Bartsch (2021), with C. Day Lewis
    (1952), are named as the ones not to reach for. Its `BOOK_AUTHOR_COLOR` row is where the EURIPIDES
    TEST had two kinship risks to clear rather than one — the Aeneid is the poem written in answer to
    HOMER and the other great hexameter poem of the Augustan moment beside OVID — and three of the six
    best candidates fail on exactly that (a blue 24 from Homer, a magenta-crimson 20 from Ovid, and the
    best number of all, a green-teal at 19.7, 20 from LUCRETIUS). The dark oxblood taken instead is the
    HOMER row's argument applied to a hue rather than a quarter: red holds three at L 22–34 and this
    sits at L 13.3, so the family is crowded in hue and empty at this lightness; it is the only
    candidate clearing all three kinship risks by more than the shelf's tightest pair (Ovid 29, Homer
    62, Lucretius 72), and at 9.57:1 it is second on the shelf for contrast where three rivals scrape
    4.60. The band was not widened, and was tested rather than assumed.
    **Journey to the West is the SIXTH licence needing no qualification at all** (Aug 2026), after
    the Republic, the Analects, the Peloponnesian War, the City of God and the Aeneid, and its
    interest is not in the licence but in what the licence RULED OUT. The novel was first printed in
    1592 and Timothy Richard published his English in Shanghai in 1913, living 1845–1919 — dates read
    off Wikidata at day precision and corroborated by its own description — so both layers clear the
    pre-1929 rule, life-plus-seventy and life-plus-a-hundred, with no limit to state and no modern
    editorial layer. **THE HARD PART WAS THAT NO PUBLIC-DOMAIN ENGLISH TRANSLATION OF THIS NOVEL IS
    ACTUALLY A TRANSLATION OF IT**, which was established rather than assumed: Anthony C. Yu's
    complete four volumes (1977–1983, revised 2012), W. J. F. Jenner's (1982–1986) and Julia
    Lovell's (2021) are all in copyright; Arthur Waley's *Monkey* (1942) is both in copyright until
    2037 and an abridgement of thirty chapters; Helen M. Hayes's *The Buddhist Pilgrim's Progress*
    (1930) is six chapters; and the Project Gutenberg text that search results offer as a
    public-domain English *Journey to the West* is the CHINESE — checked, not inferred. So the shelf's
    own bar left exactly one candidate, and it is a condensation. **The choice made was to ship it and
    say so on the book's first page**, which is the Classic of Poetry's judgement (102 of 305 poems)
    applied to a book that is short WITHIN its chapters rather than short OF them — and what makes it
    bearable here is the Chinese column, which is complete. Richard's dedication, his introduction
    arguing the novel is a disguised Nestorian Christian allegory, and the plates are left behind, as
    the Republic's introduction and plates were. Two facts about his edition are stated on the page
    rather than smoothed over, because a reader will meet them in the prose: he believed the Taoist
    master Qiu Chuji wrote the novel, three centuries before it appeared, and his English renders the
    Buddhist heaven in the vocabulary of another religion — cherubim, angels, Providence. Its
    `BOOK_AUTHOR_COLOR` row is where the band is genuinely FULL rather than nearly so; see the note
    beside `"Wu Cheng'en"` in app.js for the search, and for the Euripides test being run and NOT
    biting — the alternative it offered was a fifth blue at 18.5, below the shelf's own tightest pair.
    **The Divine Comedy is the SEVENTH licence needing no qualification at all** (Aug 2026), after the
    Republic, the Analects, the Peloponnesian War, the City of God, the Aeneid and Journey to the
    West — and like Journey to the West its interest is in what the licence RULED OUT rather than in
    what it allowed. Dante died in 1321 and Longfellow published this translation in 1867, living
    1807–1882, so both layers clear the pre-1929 rule, life-plus-seventy and life-plus-a-hundred, with
    no limit to state and no modern editorial layer; Longfellow's own notes, his index and the
    volumes' illustrations are left behind, as the Republic's introduction and plates were. **WHAT IT
    RULED OUT IS THE ITALIAN**, and that is recorded in full under `books/<id>.<lang>.js` above,
    because the reasoning is about a constituted text rather than about this translation: every
    complete Italian Commedia reachable is Petrocchi's, in copyright until 2060, and the one usable
    alternative is encumbered in the United States until 2029. Sayers (1949–62), Ciardi (1954–70),
    Musa (1971–84), Mandelbaum (1980–84), the Hollanders (2000–07), Kirkpatrick (2006–07) and Clive
    James (2013) are named as the ones not to reach for. Its `BOOK_AUTHOR_COLOR` row is where the best
    NUMBER was rejected outright for the second time on the shelf (after Euripides): the whole band
    yields one colour clearing 19.6 and it is a chroma-60 green at 4.54:1 — the Vyasa row's candidate
    exactly, glowing beside thirty-two muted colours and hugging two boundaries — so a deep blue-violet
    clearing 18.5 at 8.12:1 was taken instead, above the shelf's own tightest pair at 18.2. **The
    kinship risk here is not another blue but VIRGIL**, Dante's guide and a character in the poem, and
    the colour taken sits 53 from his oxblood.
    **The Rigveda is the NINTH licence needing no qualification at all** (Aug 2026), after the
    Republic, the Analects, the Peloponnesian War, the City of God, the Aeneid, Journey to the West,
    the Divine Comedy and the Confessions, and every layer is clear on every ground: the hymns are
    around three thousand years old and were composed before writing reached the subcontinent, and
    Ralph T. H. Griffith published his translation at Benares in 1889–92, revised it for the second
    edition of 1896 and lived 1826–1906 — dates read off the Wikisource author page AND confirmed
    against the volume's own title page rather than recalled, for the Hugo Magnus reason — so the
    English clears the pre-1929 rule, life-plus-seventy (1976) and life-plus-a-hundred (2006) alike.
    Jamison and Brereton (2014), Doniger (1981) and Maurer (1986) are named as the ones not to reach
    for; Griffith's preface and appendices are left behind, as the Republic's introduction and plates
    were. **ITS SANSKRIT IS THE LUCRETIUS CASE AND THE GAP IS WEAKER THAN LUCRETIUS'S, WHICH IS
    WORTH SAYING RATHER THAN LEAVING TO BE INFERRED**: the transcription names no editor for the
    samhita, so none is claimed and the ground stated is the age of the text — but where Lucretius
    survives in two ninth-century manuscripts whose readings editors dispute by the hundred, and that
    entry therefore treats its unnamed editor as a real limitation, the Rigveda was transmitted by a
    recitation discipline built to make variation impossible and the received Shakala samhita is what
    every printed edition prints. **Ask what an unnamed edition COSTS, rather than treating every
    unnamed edition alike.** Its `BOOK_AUTHOR_COLOR` row is keyed by ID, the hymns being anonymous,
    and is the second colour taken with the band as full as the Beowulf row predicted — see the
    `"rigveda"` note in app.js for the search, and for the Euripides test rejecting the best magenta
    because it lands 19.4 from the SONG OF ROLAND, which is both the shelf's other anonymous work and
    the colour this book would otherwise have inherited.
    **Don Quixote is the TENTH licence needing no qualification at all** (Aug 2026), after the
    Republic, the Analects, the Peloponnesian War, the City of God, the Aeneid, Journey to the West,
    the Divine Comedy, the Confessions and the Rigveda. Cervantes published the two parts in 1605 and
    1615 and died in 1616; John Ormsby published this translation in London in 1885 and lived
    1829–1895, so the English clears the pre-1929 rule, life-plus-seventy (1966) and
    life-plus-a-hundred (1996) alike, with no limit to state and no modern editorial layer to
    declare. **ORMSBY'S DATES ARE WHY THE LOOK-UP RULE EXISTS**: 1889 is what comes to mind and it is
    wrong, and what makes 1829–1895 usable where A. J. Wyatt's was not is that two places give the
    same pair — Wikisource's author page and Wikidata — over a span of sixty-six years rather than a
    suspiciously round hundred. Cervantes's own are corroborated to the day, and the line that he and
    Shakespeare died on the same date is a calendar artefact, Spain being on the Gregorian calendar
    and England still on the Julian. Putnam (1949), Cohen (1950), Raffel (1995), Rutherford (2000),
    Grossman (2003) and Lathrop (2005) are named as the ones not to reach for. **WHAT ITS LICENCE DID
    NOT DECIDE IS WHICH COPY TO SHIP**, and that is the interesting half — two free transcriptions of
    the same free translation, one of which has quietly lost sixty words; see the `don-quixote` entry
    in the File map. Its `BOOK_AUTHOR_COLOR` row is the band at 35 colours, where nothing anywhere in
    it clears 19.3 — in line with Chaucer's 19.7 at 31, so the band was not widened again — and the
    whole clear field is one rose-crimson family. **The choice inside it was CONTRAST**: the best
    number reads 4.53:1 on the tightest light paper, right at the bar, where `#B10960` clears 19.0
    and reads 5.46:1 there and 6.82:1 on white. The Euripides test picked what to avoid rather than
    what to take — the violet family's best lands 19 from the SONG OF ROLAND, and Don Quixote is
    written against the chivalric romance while Roland is this shelf's chanson de geste, which is the
    one pair a reader would read as a set.
    **The Ramayana is the ELEVENTH licence needing no qualification at all** (Aug 2026), and its
    interest is neither in the licence nor in what it ruled out but in **what it cost to establish
    that the two columns could be set side by side at all.** Válmíki's poem is some two thousand
    years old; Ralph T. H. Griffith published this translation in five volumes at London and Benares
    between 1870 and 1874 while Principal of the Benares College — the date and the imprint read off
    the volume's own title page, which the transcription reproduces, rather than recalled — and he
    lived 1826–1906, so the English clears the pre-1929 rule, life plus seventy and life plus a
    hundred alike. Goldman's Princeton translation (1984–2017), Shastri's (1952–59) and Sattar's
    (1996) are named as the ones not to reach for; Griffith's appendix, which prints in Latin and
    Italian the passages he would not English, his additional notes and his index are left behind as
    the Republic's introduction and plates were.
    **IT IS THE SECOND BOOK HERE FROM PROJECT GUTENBERG AND, LIKE THE FIRST, CHOSEN BY ELIMINATION.**
    Wikisource's own Ramayana is the Plato-Jowett case at its plainest — 270 of the poem's cantos in
    mainspace, Books IV and V entirely absent, and the scan-backed index behind it forty pages
    proofread — and it was measured before anything else was tried. **One trap for anyone who comes
    back to this**: a Project Gutenberg search for the Ramayana returns, above everything else, the
    four volumes of the *Yoga-Vasishtha Maharamayana of Valmiki*, which is a philosophical dialogue
    attributed to the same poet and is not the epic. It is the Avellaneda case on a different shelf.
    **THE HARD QUESTION WAS THE PAIRING, AND IT IS THE PART WORTH READING** — a translation that
    ships 493 cantos against its original's 645, three books whose totals disagree, and two places
    where the editions genuinely divide the same words differently. See the `ramayana` entry in the
    File map for the measurements, and `RAM_BOOKS` in `.claude/fetch-book.js` for the passages each
    one rests on. Its `BOOK_AUTHOR_COLOR` row is the band at 37 colours, where nothing anywhere in it
    clears 19.0 and the whole clear field is one violet-magenta family; the choice inside it was
    CONTRAST, on the Cervantes row's precedent, and **the Euripides test is sharper here than
    anywhere on the shelf** — this library holds the other Sanskrit epic, and the Bhagavad Gita is
    part of it, so the one colour this must not be a near-miss of is Vyasa's. It stands 77 away.
    **The Satyricon states a LIMIT and it is the Odyssey's easy case underneath** (Aug 2026), which
    puts it with the Song of Roland, the Gita and the two Homers rather than with the eleven needing no
    qualification. Petronius died in 66 CE. Michael Heseltine published this translation in 1913 and
    lived 4 September 1886 – 13 March 1952, so it clears the pre-1929 rule and life-plus-seventy
    (2023) and **not life plus a hundred, which runs to 2053** — said outright rather than smoothed
    into the easier sentence. **BOTH COLUMNS ARE ONE HAND, AND ON A FACING-PAGE LOEB THAT IS WORTH
    CHECKING IN EITHER DIRECTION**: the Iliad's Greek is a separate Oxford text and drags that book's
    original out to 2051, where both Perseus files here name Heseltine as editor and nobody else, so
    one life answers for both columns. His dates were corroborated twice for the A. J. Wyatt reason —
    Wikidata at day precision with the death referenced to Britannica, and Wikisource's author page
    giving (1886–1952) and listing exactly ONE work for him, this Satyricon — and **there is another
    Michael Heseltine to keep him apart from**, the living British politician, whose entity a search
    returns first. Both revision histories were READ on the Antigone's rule and record only tagging,
    a composite split and a Unicode conversion.
    **THE OTHER FREE ENGLISH WAS MEASURED AND REJECTED, and not for its age.** W. C. Firebaugh's of
    1922 is out of copyright, is complete where Heseltine is not, and says on its own title page that
    it incorporates "the forgeries of Nodot and Marchena" — two eighteenth-century fabrications
    passed off as newly found Petronius. An edition that weaves those into the text without marking
    them is not the Satyricon however unexpurgated it is: **ask what text an edition actually IS, not
    only whether it is free and complete**, which is the Divine Comedy's question answered the same
    way. Burnaby's of 1694 is free and is seventeenth-century English, the objection that ruled out
    Golding's Ovid and Hobbes's Thucydides. So the choice was a genuine text with ten sections left
    in Latin or a complete one with forgeries in it, and the front matter says which was taken and
    what it costs. Arrowsmith (1959), Sullivan (1965), Walsh (1996) and Ruden (2000) are named as the
    ones not to reach for, and with them **E. H. Warmington's 1969 revision of THIS translation**,
    which is the Loeb in shops today and which fills in exactly the passages Heseltine left.

    **The Maxims of Ptahhotep states a LIMIT, and the interesting half is why it has no facing
    Egyptian** (Aug 2026). The licence is the ordinary shape: the poem is around four thousand years
    old and free everywhere on any reading; Battiscombe George Gunn published this translation in
    John Murray's Wisdom of the East series in 1906 and lived 30 June 1883 – 27 February 1950 —
    corroborated twice for the A. J. Wyatt reason, once from the transcription's own bibliographic
    record and once from his biography, which independently gives the 1906 volume — so the English
    clears the pre-1929 rule and cleared life plus seventy on 1 January 2021, and **has not cleared
    life plus a hundred, which runs to 2051**, said outright rather than smoothed into the easier
    sentence the ancient half can honestly use.
    **WHAT IS WORTH CARRYING IS THAT THE ORIGINAL FAILS ON THE TRANSLATION'S SIDE, not on its own** —
    the Republic's case at its plainest, and see the `books/<id>.<lang>.js` bullet for the
    measurement. Everything about the Egyptian looks available and none of it matters, because Gunn
    prints no reference to the papyrus anywhere.
    **AND THE VOLUME HOLDS THREE WORKS, of which this is one.** Gunn translated the Instruction of
    Ke'gemni and, in an appendix, the Instruction of Amenemhe'et; both are different works by other
    hands and neither is here. His thirty-page introduction, his explanation of names and his
    bibliography are left behind for the reason an editor's front matter always is; his footnotes on
    the poem ARE taken, being notes on the text rather than matter around it. Lichtheim (1973),
    Parkinson (1997) and Simpson are named as the ones not to reach for.

    **Romance of the Three Kingdoms states a LIMIT, and its interest is that the LICENCE was the easy
    half and the RECENSION was the hard one** (Aug 2026). The licence is the ordinary shape: the
    novel is fourteenth-century, the text used on both sides is the recension Mao Lun and his son Mao
    Zonggang published in 1679, and the only modern layer is C. H. Brewitt-Taylor's English, printed
    at Shanghai in 1925 — read off the volumes' own title pages, which set "COPYRIGHT, 1925, BY C. H.
    BREWITT-TAYLOR. First Printing, December, 1925" — so it is public domain in the United States on
    the pre-1929 rule. He lived 11 December 1857 – 4 March 1938, corroborated at day precision on
    Wikidata and independently on Wikisource's author page, so it cleared life plus seventy in 2009
    and **has not cleared life plus a hundred, which runs to 2039**, said outright rather than
    smoothed into the easier sentence.
    **WHAT HAD TO BE ESTABLISHED FIRST IS WHICH TEXT EACH COLUMN IS**, because this novel has two
    recensions that divide the story differently — the oldest surviving printing, of 1522, runs to
    240 sections and the Maos' to 120 chapters — so a column taken from the wrong one could not be
    paired at all, and the failure would be a book of 120 tabs facing 120 tabs of something else.
    **The transcription answers it on its own front page** (此為毛綸、毛宗崗父子修改、批注後的版本,
    with a link to the Jiajing text carried separately under another title), which is a better
    answer than any measurement, and it was measured as well. **Ask what recension a text IS before
    asking whether it pairs**; Journey to the West's entry says the same thing about a different
    novel, and here the source volunteers it.
    **THE OTHER FREE ENGLISH IS HALF A BOOK AND WAS REJECTED AT THE DOOR**: Project Gutenberg carries
    Brewitt-Taylor as ebook 77416, which is volume 1 — chapters 1 to 60 — and volume 2 has never been
    added, its author page listing the one book. Wikisource carries both volumes complete, proofread
    against the scans, which is why the shelf's ordinary wiki path served here with no new reader at
    all. Moss Roberts's complete translation of 1991, the abridgement he made of it in 1976 and Yu
    Sumei's of 2014 are named as the ones not to reach for. Its `BOOK_AUTHOR_COLOR` row is where the
    band was widened for the third time and where, for the first time, the shelf could say WHICH of
    its three axes was binding — see the note beside `"Luo Guanzhong"` in app.js: relaxing lightness
    changes nothing in either direction, and only the chroma ceiling opens the field.

    **The Consolation of Philosophy states a LIMIT ON EACH COLUMN, and the interesting half is that
    it REFUSED a pairing that was free** (Aug 2026). The licence is the ordinary shape: Boethius was
    executed around 524; H. R. James published this translation in London in 1897 and lived
    1862–1931 — years given at year precision on Wikidata with four references behind them and
    stated independently by Wikisource's own public-domain tag on this very translation, which is
    the corroboration this file has insisted on since A. J. Wyatt's suspiciously round hundred — so
    the English clears the pre-1929 rule and cleared life plus seventy in 2002 and has NOT cleared
    life plus a hundred, which runs to 2032. The Latin is E. K. Rand's text of 1918, printed in a
    Loeb volume JOINTLY with H. F. Stewart, and a joint work runs its term from the last of its
    authors to die: Rand 1871–1945 and Stewart 1863–1948, both at day precision, so that column
    cleared life plus seventy in 2019 and stays in copyright until 2049. Both columns therefore carry
    a limit and the ORIGINAL's runs thirty years the longer, which is the Medea's position.
    **WHAT MAKES IT WORTH READING IS THE ENGLISH THAT WAS TURNED DOWN.** That same 1918 volume
    carries a complete English translation on its facing pages, and the transcription linearises the
    two into one file — so taking BOTH columns from it would have paired them by construction, out
    of one request, with no second source, no reconciliation and no second extractor: by a distance
    the cleanest import this shelf has been offered. It is refused because that English is "I.T."'s
    of 1609 revised by Stewart, and Jacobean English is what already ruled out Golding's Ovid,
    Hobbes's Thucydides and Burnaby's Satyricon. *"While I ruminated these things with myself, and
    determined to set forth my woful complaint in writing, methought I saw a woman stand above my
    head"* against James's *"While I was thus mutely pondering within myself, and recording my
    sorrowful complainings with my pen, it seemed to me that there appeared above my head a woman of
    a countenance exceeding venerable."* **The cleanest text to import is not always the one worth
    reading**, and the cost of refusing it was measured rather than assumed: all seventy-eight
    sections are present in both Englishes and in the Latin, in the same order, and James tracks the
    Latin's length section by section as closely as the Loeb's own version does, so nothing was given
    up but the convenience. Only the poems and the prose are taken: James's preface, his life of
    Boethius and his index of the verse interludes are left behind as the Republic's introduction and
    plates were — but his SUMMARIES of the five books are not front matter and do ship, at the head
    of the book each describes. From the Latin side the four theological tractates printed in the
    same volume are different works by the same hand, and Symmachus's epigram, which the manuscripts
    append after the last line, is not Boethius. Richard Green (1962), V. E. Watts (1969), P. G.
    Walsh (1999), Joel Relihan (2001) and David Slavitt (2008) are named as the ones not to reach
    for, and with them **S. J. Tester's 1973 revision of this very Loeb**, which is the volume in
    shops today and is a separate copyrighted work. Its `BOOK_AUTHOR_COLOR` row is the band at forty
    colours, where only TWO hue families still hold anything at all and **the better NUMBER was
    refused for the third time on the shelf** — see the note beside `"Boethius"` in app.js, where a
    scarlet separating by 21.1 loses to a very dark green separating by 18.2 because the scarlet is a
    ninth colour in the red quarter at a lightness the quarter already occupies, while the green's
    family is crowded in hue and empty here; the green also reads 9.80:1 on the tightest of the
    eighteen light papers, the highest contrast of any swatch on this shelf.

    **Confessions is the EIGHTH licence needing no qualification at all, and it is the SAME LICENCE as
    the City of God's** (Aug 2026) — the same series, the same editor and the same decade, which is
    the point of it: Augustine died in 430, J. G. Pilkington published this translation in Schaff's
    Nicene and Post-Nicene Fathers in 1886 and lived 1841–1919, so it clears the pre-1929 rule,
    life-plus-seventy and life-plus-a-hundred alike, and Migne's Latin of 1841 is free on the same
    three grounds. Dates were looked up rather than recalled, for the Hugo Magnus reason. **THE
    QUESTION WORTH ASKING WAS WHICH FREE ENGLISH, NOT WHETHER ONE EXISTED**, and it is the
    Nicomachean Ethics' trade in a new form: **Pusey's translation of 1838 is equally free, is the
    one a reader is likeliest to have met, and is CHAPTERLESS at the source** — Wikisource carries it
    as thirteen long pages with the paragraph numbers alone, so it could only ever have shipped as an
    English column with nothing to pair on, and the Latin column would have gone with it. Pilkington
    is two chapters short and pairs on 276 of 278. **The licence question and the pairing question
    are decided together, and the cleaner reading is not always the shippable one.** CCEL's copy was
    checked and rejected a step earlier, being JavaScript-driven. Outler (1955), Chadwick (1991),
    Boulding (1997), Wills (2006) and Ruden (2017) are named as the ones not to reach for —
    **Outler's particularly, since Wikisource carries it directly beside this one** and it is in
    copyright until 2060. It needed no `BOOK_AUTHOR_COLOR` row at all, Augustine's `#3F1800` having
    been placed with the City of God — which is the argument for keying them by author, made for the
    third time after the two Platos and the two Homers.
    **The Summa Theologica is the SECOND book here whose ground is the PUBLICATION DATE and nothing
    else** (Aug 2026), after the Gallic War, and it is the same fault in the byline for a different
    reason: not a translator who cannot be traced but a translator who is not a person. Aquinas died
    in 1274, so the work is free everywhere; the translation was published in London in **1920**, so
    its United States copyright has expired and anyone can check that. What cannot honestly be
    asserted is a life-plus-seventy term, because **"the Fathers of the English Dominican Province" is
    a CORPORATE byline** — the twenty-one volumes name no individual anywhere, the work was done by a
    changing group of friars over fifteen years, and a term running from the last surviving author
    cannot be computed from a name belonging to nobody. So the ground stated is the publication date,
    the gap is named in `rights` and on the book's own front matter, and no year is rounded up to fill
    it. Lucretius's judgement in a third book: **claim less, and put on the page what cannot be said.**
    Leo XIII's encyclical, the editor's note to the Supplement and the volumes' indexes are printed in
    the same edition and are left behind, as the Republic's introduction and plates were. The
    Blackfriars edition (1964–1981), Timothy McDermott's abridgement (1989) and Alfred Freddoso's
    translation are named as the ones not to reach for. Its `BOOK_AUTHOR_COLOR` row is where an
    INHERITED OBJECTION WAS RE-MEASURED AND DROPPED — see the note beside `"Thomas Aquinas"` in
    app.js: the Vyasa and Dante rows each turned down a chroma-64 green because it would "glow beside
    thirty muted colours", and six of the placed colours now sit at chroma 59–64, so that is where the
    shelf's own ceiling already is. **Re-measure an inherited objection before applying it.**
    **The Canterbury Tales states a LIMIT THAT IS ALMOST UP, which is the nearest any on this shelf has
    come to expiring** (Aug 2026), and it falls on the middle of three layers rather than on the
    original. Chaucer died in 1400 and Skeat's Middle English text of 1900 is clear on every ground (he
    died in 1912) — but Tatlock and MacKaye's translation, published in 1912, is public domain in the
    United States on the pre-1929 rule and **a work of two hands runs its term from the LAST of them to
    die**: MacKaye lived until 1956, so it stays in copyright in life-plus-seventy countries until the
    first day of **2027** and in life-plus-a-hundred ones until 2057. **Do the arithmetic from the later
    death, not the earlier**, and say the year out loud rather than rounding into the easier sentence.
    Both men's dates were looked up rather than recalled and corroborated twice over — the library
    catalogue record carried inside the scan's own metadata gives them, and so does each biography — the
    check the Aeneid's row calls for after Hugo Magnus and A. J. Wyatt. Coghill (1951), Wright (1985),
    Raffel (2008) and Ackroyd's retelling (2009) are named as the ones not to reach for. Its
    `BOOK_AUTHOR_COLOR` row is the band one book fuller again: with thirty-one colours placed the best
    anywhere in it clears 19.7 where the shelf's own tightest pair is now 18.2, and the Euripides test
    picked the family — the best blue is 18.5 from Snorri Sturluson, which is both below that pair and a
    kinship claim between the two medieval vernacular poets on the shelf.

    **The Ecclesiastical History is the SECOND book here whose ground is the PUBLICATION DATE and
    nothing else** (Aug 2026), after the Gallic War, and the reason is the same shape: half the
    byline cannot be found. Bede finished in 731 and died in 735, so the work is free everywhere on
    any reading. A. M. Sellar's translation was published in London by George Bell and Sons in 1907 —
    read off the volume's own title page — so its United States copyright has expired and anyone can
    check that. What cannot be established is when she died: the title page gives "A. M. Sellar, Late
    Vice-Principal of Lady Margaret Hall, Oxford" and nothing more, her own preface is unsigned, and
    there is **no Wikidata entity, no Wikipedia article and no Wikisource author page** for her. So
    no life-plus-seventy term is asserted, the ground stated is the publication date, and the gap is
    named in `rights` and on the book's own first page rather than rounded up.
    **THE CLEANER LICENCE WAS ATTACHED TO THE TEXT WITH NO NOTES, which is the Nicomachean Ethics'
    trade in a third form.** Wikisource carries L. C. Jane's Temple Classics edition of 1910 — John
    Stevens's translation of 1723 revised — complete, scan-backed, pairing with the Latin exactly as
    this one does, and with **both** its names traceable (Stevens d. 1726; Jane 1879–1932, on
    Wikidata with an author page). Measured over all five books it carries **zero reference marks**,
    where Sellar's carries 1,081 with a new introduction and a life of Bede, made against Plummer's
    critical text. On a book in which almost every name needs a note that is not a refinement, so the
    apparatus won and a stated gap in the byline was the price. Neither English is the Jacobean prose
    that ruled out Golding, Hobbes, Burnaby and I.T.: Sellar keeps the Old English titles ("with your
    ealdormen and thegns" where Jane has "with your commanders and ministers") and Jane is the more
    literal in places, so on the text alone there was little in it. **THE LATIN NAMES AN EDITION IT
    DOES NOT PRINT** — see the `bede-history.la.js` entry for the measurement — so no editor is
    asserted for that column either; every candidate is a century or more out of copyright.
    Sherley-Price's Penguin (1955) and Colgrave and Mynors's Oxford Medieval Texts edition (1969),
    which is the scholarly standard and prints the Latin facing it, are named as the ones not to
    reach for. Its `BOOK_AUTHOR_COLOR` row is where **the band ran out of COLOURS rather than of
    room** — see the note beside `"Bede"` in app.js: the seven best-separated swatches left anywhere
    in it are greys at chroma 2–10 against a shelf whose own floor is 18, and re-running the search
    with that floor applied tops out at 17.5, which is still above the shelf's own tightest pair (now
    16.6, Aristotle against Ptahhotep — it was 18.2 when Malory was placed and has closed as books
    were added). The Euripides test then decided between the top three rather than merely passing:
    the runner-up lands 17 from the Poetic Edda, which is a Germanic-world kinship claim this must
    not make, and the third sits at the very top of the chroma band.
    **The Travels of Marco Polo is the TWELFTH licence needing no qualification at all** (Aug 2026),
    and it is the plainest of the recent ones — which is worth saying because everything hard about
    that book is elsewhere. Polo dictated it in 1298 and was dead by 1324; Yule published the
    translation in 1871 and Cordier revised it for the third edition of 1903, so it is public domain
    in the United States on the pre-1929 rule; and **a joint work's term runs from the LAST of its
    authors to die**, which here is Cordier (Yule 1820–1889, Cordier 1849–1925), so it cleared life
    plus seventy in 1995 and life plus a hundred at the start of 2026. Both pairs of dates were
    looked up rather than recalled and each corroborated twice, the volume's own memoir giving
    Yule's and Wikisource's author page giving Cordier's under a public-domain tag reading "died at
    least 100 years ago". Latham (1958), Cliff (2015) and Kinoshita (2016) are named as the ones not
    to reach for. **WHAT THE LICENCE DID NOT DECIDE IS WHETHER IT COULD HAVE A SECOND COLUMN**, and
    for once the answer turns on the translation rather than on the original — see its File map entry
    and the fifth answer recorded under `books/<id>.<lang>.js`. Its `BOOK_AUTHOR_COLOR` row is the
    THIRD widening of the chroma ceiling and the first time the shelf's own band held nothing at all:
    with 43 colours placed the best inside it clears 16.5 against a tightest pair of 16.6, so the
    band's best would itself have become the tightest pair. Which axis binds was measured rather than
    assumed, and it is Three Kingdoms' answer again — lightness relaxed either way returns a
    byte-identical top eight, the chroma FLOOR reaches 17.4 and only near-greys scraping 4.53:1, and
    only the chroma CEILING opens the field (71 → 85, 16.5 → 25.1).
    Each book's
    `rights` string states the grounds and **the book's own page prints it** — the reasoning is shown to the
    reader, not buried in a commit message.
    **`BOOK_AUTHOR_COLOR` GAINED AN `"Anonymous"` KEY with it**, and the reasoning is worth keeping
    because the obvious answer was to do nothing: `bookColor` already falls through to the generic
    indigo for an author it does not know, so the Song of Roland would have rendered. It would also
    have been the first of an unbounded set of anonymous works all sharing one colour that is ALSO the
    shelf's default. Keyed like every other, it stays one book one colour. The search behind
    `#42426F` settled a question the earlier colour notes had not: **hue coverage is not separation.**
    The shelf's largest EMPTY hue quarter is the 74° between Marcus Aurelius's teal and Aristotle's
    steel, and it is reachable only at the bottom of the shelf's chroma band, so the best colour
    anywhere in it clears its nearest neighbour by **19.1 — below the shelf's own tightest pair at
    20.4**. Searched over the whole band instead, this dark slate-violet is the best available at
    **24.5** from Herodotus's indigo and reads 5.64:1 on the tightest of the sixteen papers. It is a
    fourth colour in the blue quarter, which Thucydides' entry warns about, and the warning does not
    bite: what it forbids is a crowding that asserts a KINSHIP the shelf does not mean — a sober blue
    beside Herodotus would tie the two Greek historians together — and nobody reads a French chanson
    de geste against Herodotus, Aristotle, Machiavelli or Seneca.
    **`"Euripides"` (`#72187F`) IS THE FIRST TIME THE BEST NUMBER WAS REJECTED OUTRIGHT** (Aug 2026),
    and it is the Thucydides rule finally biting rather than being reasoned around. Searched over the
    shelf's own lightness and chroma band, the best-separated colour left anywhere in it is a crimson
    at **24.0** — and it is a RED for the second Athenian tragedian, landing 27.7 from Sophocles's dark
    brick. Euripides and Sophocles are read against each other more constantly than any other two
    writers here, so a red beside his would say they are a set, which is exactly the kinship that kept
    Thucydides out of the sober blues beside Herodotus. Obeying it cost two tenths of a point: this
    deep magenta-purple clears Thucydides's mulberry and Seneca's violet by **23.8 and 24.0** against
    the tightest pair at 20.4, stands **57.7** from Sophocles where no reading of the two as a pair is
    possible, and reads **5.87:1** on the tightest of the sixteen papers where the crimson scrapes 4.66
    against a bar of 4.5. So the accessibility figure and the grammar agreed against the raw number —
    and note that the number is only ever measured against the SIXTEEN LIGHT papers, not all 34: a
    swatch this dark reads 1.5–3.0 on the dark ones, as every shipped colour does.
    **`"Vyasa"` (`#743C00`) IS WHERE THE PALETTE RAN OUT, and that is the finding** (Aug 2026). With
    nineteen colours on the shelf, **nothing anywhere in its lightness and chroma band clears 25 of its
    nearest neighbour** — the Song of Roland could still find 24.5 and Euripides 23.8. The best number
    at any hue is a saturated green at 24.4 from Lucretius, and it was REJECTED for the reason the
    Analects' row already records: green is where Lucretius and Aesop both sit, and the only greens
    that clear them sit at the very top of the band's chroma, which is what "bright enough to glow"
    means. This deep saffron-brown is the best colour in a family that asserts no false kinship — the
    Euripides test rather than the raw number — clearing Caesar's burnt orange and Sun Tzu's rust by
    **22.6**, Confucius by 22.7 and Suetonius by 23.4, evenly enough that it reads as its own colour
    against all four rather than as a near-miss of one, against the shelf's tightest pair at 20.4. It
    reads **5.29:1** on the tightest of the sixteen light papers. Saffron also happens to be the right
    colour for the book, which is worth saying only because it cost nothing: the numbers led there.
    **The next book added will have to widen the band or accept a pair tighter than 20.4** — say so
    then rather than quietly shipping a colour nobody can tell from its neighbour.
    **`"beowulf"` (`#55303C`) IS THAT NEXT BOOK, and the answer was NEITHER** (Aug 2026). Searched over
    the shelf's own lightness and chroma band with twenty-one colours already placed, nothing anywhere
    in it clears 24 of its nearest neighbour, and **only TWO hue families clear the shelf's tightest
    pair at all** — red, held by Sophocles, Ovid and Aristophanes, and green, held by Lucretius and
    Aesop. So the band was not widened and no pair tighter than 20.4 was taken: this dark oxblood
    clears Sophocles by **23.3** and Plato by 23.9, still wider than the shelf's own closest pair, and
    reads **6.75:1** on the tightest of the sixteen light papers, the highest of any swatch here. The
    **Euripides test picked the family rather than the number**: a fourth red asserts no kinship,
    because nobody reads an Old English heroic elegy against Greek tragedy or Latin love poetry, where
    a fourth green beside Lucretius and Aesop could only clear them from the very top of the band's
    chroma — bright enough to glow beside twenty muted colours, which is what Vyasa's row rejected.
    Keyed by ID, the poem being anonymous. **The band genuinely is full now**: the twenty-third colour
    will have to widen it or accept a tighter pair, and there is no third hue family left to move to.
  · **THE ORIGINAL BESIDE THE TRANSLATION** (`bookSections` / `bookRows` / `applyLangMode` /
    `anchorNow` + `restoreAnchor`, Aug 2026, on request). Side by side on a wide screen, one at a time on
    a phone where **tapping the page turns it over**, as the daily quote does.
    · **PAIRED ON SECTION NUMBERS, NEVER ON PARAGRAPH ORDER**, and the obvious implementation is the
      wrong one. Pairing the nth paragraph with the nth looks right on one screen and then drifts, because
      Gummere breaks where English prose wants a break and the Latin breaks where the Latin does — a
      reader who trusted the columns would be reading one passage against another. What the two editions
      genuinely share is the **section number**, the `[1] [2] [3]` by which any passage of Seneca is cited
      in either language, kept as `<span class="bk-n">` on both sides. Measured: **2,141 sections, 15
      unpaired (0.7%), in 7 letters**, and those are gaps in the Latin edition's own numbering. The
      Meditations pairs the same way and better — **486 of 487, one unpaired** — because its Greek comes
      from a TEI edition that states its numbers rather than from a wiki that prints none; see the
      `books/<id>.<lang>.js` bullet, which is the case worth reading before adding an original.
      A row whose other side is empty is still DRAWN — closing the gap would sit each column beside a
      passage it is not.
    · **The page is always built as paired ROWS once the original is loaded**, with CSS choosing the
      columns (`data-lang` = `en` / `or` / `both`). That is what makes turning it on a class change rather
      than a re-render, and it is the whole reason the reader's place survives exactly: the row they were
      looking at is the same element before and after, so it can be put back where it was. **The scroll
      offset is exactly what the switch invalidates** — Latin runs ~0.7 the length of Gummere's English,
      so restoring the pixel position lands further from the reader's sentence the deeper in they were.
    · **The salutation is folded into the first numbered row when only one side has one.** The Latin heads
      all 124 letters with one and Gummere's transcription prints it once, so a row of its own is a row
      with one empty cell at the top of 123 letters — which reads as a fault in the page rather than as a
      difference between editions.
    · **The glossary is linked through the ENGLISH only.** Folio's glossary is an English glossary of
      prehistory and geography and its keys collide with plain Latin far harder than with English —
      `genus` is the example. `linkProperNounsOnly` exists because that already bites in translated prose;
      in the original language it would be the rule rather than the exception.
    · **It is a DOUBLE tap** (Aug 2026, on request — it was a single one, and the wording above is what
      that gesture was for). A single tap is far too cheap a target for something that swaps the whole
      text out from under a reader: it is also how you put a keyboard away, dismiss a selection or
      simply hold the phone. The gloss window made the same move for the same reason, so a double tap
      on a body of text now means one thing across the site. The deliberate cost is discoverability,
      which is what the **LATIN button in the chapter bar** is for and why it must stay.
    · **…AND IT DOES NOTHING ON THE FRONT MATTER** (Aug 2026, on request). Chapter 0 is written HERE, in
      English, about this edition, and has no facing original to turn over to. It used to flip the
      stored preference anyway, and the shape of that bug is the reason it is worth a bullet: nothing on
      screen changed — `applyLangMode` finds no `.bk-bi` to switch — so the reader's NEXT real chapter
      opened in a language they had not asked for and could not see themselves asking for. The guard is
      `cur.intro`, deliberately NOT "this chapter happens to have no rows": a numbered chapter whose
      original is still loading is a chapter the gesture should keep working on. `syncLangBtn` greys the
      button there for the same reason, **disabled rather than removed** — a control that vanishes on one
      chapter and returns on the next reads as a page that failed to draw, where a greyed one with a
      reason in its title reads as a fact about the chapter. (A book with no `origLang` at all still has
      no control, which is a different case and unchanged.) Guarded by `test-library.js`, in both
      directions: the gesture must do nothing here AND must still work one chapter along.
    · **A horizontal SWIPE steps between chapters** (Aug 2026, on request), and the two gestures cannot
      be classified independently — a swipe ends in a pointerup indistinguishable from a tap unless the
      movement is measured. So the tap half rejects anything that MOVED (`BK_TAP_SLOP`) and the swipe
      half rejects anything short or mostly-downward (`SWIPE_MIN` / `SWIPE_RATIO`, **shared with the
      page swipe** so the two gestures cannot come to disagree about what a swipe is); a swipe also
      **clears the pending tap**, or the finger that stepped a chapter counts as half a language flip.
    · **STEPPING A CHAPTER IS A SLIDE** (`slideChapter` / `BK_SLIDE_OUT` / `BK_SLIDE_IN`, Aug 2026, on
      request) — it was an `innerHTML` swap and nothing else, so on a phone the finger said "carry this
      away" and the page said nothing back. The panel leaves the way the finger went and the next one
      arrives from the opposite side, the swap happening at the midpoint while nothing is on screen.
      · **It is NOT the page swipe's cross-slide, and the difference is a cost rather than an oversight**:
        that one has both pages in hand at once (a clone laid over the stage), where a chapter's prose does
        not exist until it is painted and one chapter of this book can be thirty screens of it. Hence the
        travel is 10% of the panel's own width rather than a whole one, with a fade — with nothing behind
        it a full slide is mostly a wait.
      · **It is `Element.animate` and there is deliberately NO CSS for it**, which is the trap worth
        carrying: `.bk-page` is a direct child of `.page`, so the `sectIn` entrance stagger matches it, and
        a **`both`-filled animation goes on applying its last keyframe for the life of the page** —
        `transform:none`, which outranks any ordinary declaration. A `.bk-page.bk-out-next{transform:…}`
        rule is ignored silently and for ever: the class goes on, the computed transform stays the identity
        matrix, and the chapter changes exactly as abruptly as before (it shipped that way for an hour and
        is invisible unless something reads the transform MID-flight). A script animation sorts after CSS
        animations and wins, which is why `flipMove` is written the same way.
      · The incoming animation is created **before** the outgoing one is cancelled — the newer of two
        script animations wins, so its first keyframe holds the panel off the other side from the same
        tick; cancel first and there is a frame with the new chapter in place at full opacity.
      · The scroll to the top of the chapter goes **under** the slide, instantly, where it used to be a
        smooth scroll afterwards: a reader thirty screens into a letter is not travelling anywhere they
        want to watch, and a smooth scroll against an incoming panel is two motions disagreeing.
      · `queued` is the chapter a slide is on its way to, and `step()` counts from it rather than from
        `cur` (which the midpoint paint is what updates) — without it a reader swiping twice quickly asks
        for the same next chapter twice and stands still.
      The book page is deliberately absent from `SWIPE_ORDER`, so the site-wide page swipe is inert here
      and the two can never fight over one gesture.
      **It did nothing on a real phone for its whole life, and the fix is CSS** (Aug 2026, on a report):
      see the `touch-action` bullet under "How the app is wired" — the same fault, and the same one line,
      covers the site-wide page swipe too. `test-library.js` now drives this one through real CDP touch
      input beside the synthetic version, since the synthetic version passed throughout.
    · **The guards are the whole of it**, because a false positive swaps the language out from under a
      reader mid-sentence: a real target (link, `.ttip`, footnote marker, notes fold, any control) keeps
      its own behaviour, a live SELECTION is not a tap, nothing fires while a gloss popup or any other
      overlay is up, and a swipe out of a horizontal scroller belongs to that scroller (the chapter bar
      is one — walked up the ancestors by `swipeScrollerUnder`, not named). Narrow screens only: above
      the breakpoint both columns already show, so a stray tap would take one AWAY rather than reveal
      anything, and the chapters are reached by the tabs, the ‹ › steps and the arrow keys.
      **Both listeners go on `root`** — a fresh `.page` div per render — so they die with the page;
      one on the persistent `#view` would accumulate a copy per navigation.
    · The choice is device-local (`folio_book_orig_v1`), like the marker's position and the place sheet's
      height. **The front matter is rebuilt on every paint**, not once, because the original's licence box
      is built from the original's own file, which lands after the page was set up.
  · **`BOOKS` is EAGER and the text is not.** The registry holds a tile's worth of metadata per book (a few
    hundred bytes) so the shelf can paint, say how long a book is and show where the reader got to **without
    fetching a word**. `BOOK_TEXT` fills from the lazy bundle only when a book is opened. Guarded by
    `test-library.js`, which watches the request log — a book reaching the eager path makes the site slower
    for every visitor who never opens one, and the only symptom is a slower site.
  · **Chapters are TABS on a bar that SCROLLS** (`.bk-bar` / `.bk-tabs`), plus ‹ › steps, ←/→ keys and a
    **Contents** panel grouped by the volume the edition itself divides the book into. Seneca now has all
    124: a wrapped grid of 124 buttons is not a menu bar, it is the page — the scroller was built for the
    finished book rather than for the 65 it then had, which is why completing it needed no layout change.
    Below 640px the tab titles give way to their numbers.
    **`count` and `total` are equal now and BOTH are kept**: `count` is what Folio holds and `total` what
    the work contains, and they part company again the moment a book arrives in instalments. Seneca's own
    `total` is the EXTANT letters, not everything he wrote — Aulus Gellius quotes a book numbered past
    anything that survives. **The chip says the two figures and stops** (Aug 2026, on request): it read
    "235 of 235 chapters <i>on Folio so far</i>", and those last three words are a promise about the future
    on a chip whose job is to state a quantity — and they were doubly odd on a book that is complete, where
    the chip drops the "of N" too and simply says how long the book is.
    **The bar and the Contents panel are ONE sticky block** (`.bk-barwrap`, Aug 2026, on a bug report). The
    bar has always been sticky and the panel sat below it in the FLOW, so opening it a few screens into a
    chapter drew the contents back at the top of the DOCUMENT — off screen, nowhere near the button just
    pressed, and the reader's own scroll position unchanged. The wrapper carries the `position:sticky` now
    (which also makes it the containing block) and the panel is `position:absolute; top:calc(100% + 6px)`,
    so it hangs off the bar's own bottom edge at any scroll depth and OVERLAYS the prose rather than
    shoving it down, which is what a menu opened from a pinned bar has to do. Its ceiling is
    `min(52vh, calc(100vh - var(--bar-h) - var(--tabbar-h) - 96px))` — half the screen, or what is actually
    left between the pinned bar and the bottom bar, whichever is smaller. **A phone rule that used to set
    `.bk-bar{top:4px}` now sets `.bk-barwrap{top:4px}`**; a `top` on the inner box is inert. Guarded by
    `test-library.js`, which opens it 2,400px down and measures the gap to the bar.
  · **THE FRONT MATTER IS CHAPTER 0** (`bookIntroChapter` / `BOOK_INTRO` / `BOOK_GLYPH`, Aug 2026, on
    request). A real chapter rather than a panel — it takes a tab, it steps with the arrows, it is what a
    first-time reader lands on — because that is where front matter goes in a book, and because the "About
    this text" box it replaces sat at the FOOT of every chapter, which made it the last thing under letter 1
    and the last thing under letter 65 alike. Its `n` is **0 as a NUMBER, not an index**: `S.reading[id].ch`
    stores the chapter number precisely so a book gaining chapters cannot move a reader's place, and 0 sits
    below every letter Seneca wrote without disturbing one. Its tab wears a **book glyph** where the others
    wear their number (a "0" beside 1, 2, 3 reads as a chapter the author did not write, and on a phone the
    titles are hidden and the number is all there is) and is **`position:sticky` at the left of the
    scroller**, or the way back to it is sixty tabs behind wherever the reader has got to.
    **A BOOK'S FRONT MATTER STANDS ON ITS OWN AND NAMES NO OTHER BOOK ON THE SHELF** (Aug 2026, on
    request). Fifteen of the twenty-three intros explained a point about their own edition by comparing it
    with a neighbour — how Seneca's notes are laid out, what was abandoned for the Meditations' Greek,
    which other books print a facing original, "the most cleanly paired text on these shelves" — and every
    one of those sentences is useless to a reader who has not opened the book being compared with, which is
    most readers. The FACT each was making is kept and restated without the comparison ("so there is no
    fold of them under each chapter"; "as exact a pairing as two independently edited texts manage").
    **The edit has to be made in BOTH places**: `.claude/fetch-book.js`'s `about` is the source, and
    `books/<id>.js`'s `intro` is what ships, and a fix to only one of them either never reaches a reader or
    is destroyed by the next import. Note that the importer's prose is a JS concatenation broken across
    lines while the shipped text is contiguous, so the two need different find-strings — assert every
    replacement lands on exactly one match on each side, and re-read the two against each other afterwards.
    **The split is the part to keep**: the ESSAY travels with the text (authored in `.claude/fetch-book.js`'s
    `about`, emitted as `intro` into the generated file) and the LICENCE half is built in app.js from the
    registry's own `rights` / `edition` / `sourceUrl`. The essay cannot live in the eager `BOOKS` registry
    (a page of prose every visitor pays for and nobody reads until they open the book) and cannot be written
    into `books/<id>.js` by hand (the next `fetch-book.js` run would destroy it); the licence half needs a
    live link and has always been built from those fields. A reader still in the front matter is told so on
    the shelf — "About this book", never "Letter 0".
    **A BOOK WITH NO TRANSLATOR IS NOT A BOOK WITH A FIELD MISSING** (Aug 2026, adding Le Morte d'Arthur —
    the first). Both places that named one had to grow a branch: the rights box, which said "This English
    translation is by <b.translator>" and would have printed the word *undefined* in the one box on the site
    that exists to state true things, and which now heads itself **"About this text"** and names the EDITION
    instead — a heading calling something a translation being the same claim one line further up; and
    `PAGES.book`'s **byline**, which ran off the end of the page reading "· translated by" with nothing after
    it. **The byline was found by LOOKING at the page and by nothing else** — no test on the shelf could have
    seen it, and it was on screen within a second of opening the book. The importer needed the same branch in
    two more places (its run header and the generated file's own comment), which is four in all: reach for
    `b.translator ? … : …` wherever a book's provenance is worded.
    **AN ADMIN EDITS THE ESSAY IN PLACE** (`bookIntroMerged` / `setBookIntroEdit` / `ADMIN_EDITS.bookIntros`
    / `wireIntroEdit` / `.bk-intro-essay`, Aug 2026, on request). Same gesture and the same finish paths as
    the About page's prose (see PAGES.mission) — click, Esc cancels, Ctrl+Enter or clicking away saves — and
    it follows the QUOTES pattern rather than the Mission's, because of where the words can live. **THE
    OVERLAY IS THE STORAGE**: the Mission has mission.js to bake back into, and a book's essay has nowhere,
    since `books/<id>.js` is generated and `.claude/fetch-book.js`'s `about` is a repo edit an editor cannot
    reach from a phone. So the edit persists in `folio_admin_v1`, travels to every reader through
    `content_overrides` with no deploy, and is what a lasting change should be copied INTO `fetch-book.js`
    from when someone is next at the repo. **Nothing serializes it, deliberately** — a serializer pointed at
    a generated file is a serializer that fights the importer. Five things are load-bearing.
    **`bookIntros` had to go into `normalizeAdminEdits`** — this file's standing warning that a load path
    missing an overlay key silently drops those edits on reload, which is what happened to `mission` once.
    **Only the ESSAY is wrapped**: the two boxes under it are the LICENCE, built from the registry rather
    than typed, and an editable region that swallowed them would let a wrong copyright statement be typed
    into the one place on the site that exists to state the right one. **It edits the RAW source**, because
    what is on screen has been through `autoLinkGlossary` and the units pass and saving that would bake a
    page of `.ttip` spans and one measurement system into the stored essay — and bake them again on every
    later save. **It repaints with `paint(cur)`, not `render()`**, which would resolve the chapter from the
    reader's stored place and could land them somewhere other than the front matter they were editing.
    And **`[contenteditable='true']` joined `BK_TAP_SKIP`**: on a phone the book turns its page on a tap and
    steps a chapter on a swipe, and a finger placed in a paragraph to put the caret somewhere is both.
    It is wired from `paint()` rather than at set-up, since the front matter is rebuilt on every repaint.
  · **The shelf is one full-width BANNER per book** (`.book-grid` at `1fr`), reading left to right: author,
    title and the **year it was written** on the left, how much of the work is on Folio and where you had got
    to on the right, with the reading bar along the banner's own bottom edge (absolutely positioned, so it
    costs the row no height). It was 320px tiles two to a row with a paragraph of blurb in each, then briefly
    210px tiles two-up on a phone; all of that is gone. **The `blurb` field went with it** — a book is chosen
    from its author, title and date, and what it is about is a tap away in its own front matter — and that is
    what lets a full-width banner still be short. **`b.year` is an explicit signed sort key** beside the prose
    `written`, because a shelf that sorts by date needs one number per book and "c. 62–65 CE" is not one.
    · **A BOOK'S COLOUR IS ITS AUTHOR'S** (`BOOK_AUTHOR_COLOR` / `bookColor(b)`, Aug 2026, on request).
      It was a per-book `color` field, and with two books by Plato on the shelf that was already saying
      the wrong thing — the spine and the author line above the title are painted in it, so a colour
      changing between one man's two books tells a reader they are unrelated. Keyed by the `author`
      string the banner already prints, so the two cannot come apart, and a book whose author is
      missing falls through to the `var(--tile, var(--indigo))` fallback every rule in styles.css
      already declares rather than to a second default kept in step by hand. **The per-book field is
      GONE, not merely ignored** — a dead `color:` beside a live table is the next person's bug.
      Plato took the Symposium's plum rather than the Republic's blue: three of the eleven books were
      blue, and merging the pair was a chance to spend one of them. The colours are **measured, not
      eyeballed** — in CIELAB the shelf's own closest pair is ΔE 20 (Seneca against Herodotus) and
      Confucius's walnut is 26 from its nearest neighbour. The obvious green for the Analects was
      measured and REJECTED: every green that sits inside this palette lands 12–17 from Lucretius, and
      the only greens clearing that are bright enough to glow beside ten muted colours.
    · **…AND ON A DARK PAPER IT IS A LIGHTER SHADE OF THAT COLOUR** (`--bk-accent`, Aug 2026, on a bug
      report: "in night mode some of the books' authors and 'Start reading' are too dark to read"). Every
      swatch above was chosen inside a deliberately dark lightness band and **measured against the SIXTEEN
      LIGHT papers alone** — the Euripides row says outright that a swatch this dark reads 1.5–3.0 on the
      dark ones. That is right for a SPINE seen against white and wrong the moment the same value is set
      as TEXT on night's `--card`: the Book of Rites' dark plum reads **1.08:1** there, which is not low
      contrast but none at all, and the spine that identifies the book disappears with the words.
      **The lesson is that a palette is only measured against the papers somebody thought to measure it
      against** — nothing here was wrong when it was chosen, and the same numbers stopped being the right
      numbers when the accent was given a second job.
      Three decisions. It is a **derived property** rather than a re-toned `--tile`, because `--tile` is
      set INLINE by `bookColor` and a stylesheet cannot override an inline custom property — `.book-tile`
      declares `--bk-accent`, `body.night .book-tile` redeclares it, and the seven rules that paint the
      banner (spine, author, Start-reading/resume, the reading bar, the wash, the hover border, the focus
      ring) all read the derived one. It is a **MIX toward white rather than a second table of colours**,
      so a book added later is covered by having a colour at all. And **45% is measured, not guessed**: it
      is the strongest mix at which the darkest swatch on the shelf still clears 4.5:1 on the lightest
      night `--card` (#460030 → 5.0:1; all thirty books land 5.0–6.5; at 50% it falls to 4.3 and misses).
      It keeps each hue and takes only chroma, so two books by one hand still wash, spine and read alike.
    · **…AND THAT WHITE MIX IS WHY THE SHELF WENT GREY, WHICH IS THE SAME FAULT AS THE DAY SHELF'S**
      (Aug 2026, on a report: "too dark in day mode and too whited out in dark mode"). **Lightening a
      colour by adding white raises lightness by TAKING CHROMA AWAY** — measured over all 28 swatches,
      `color-mix(… 45%, #FFF)` cuts the Book of Rites' chroma from 11.1 to 4.9 and Augustine's from 7.1 to
      2.7, so what a reader met after dark was not a lighter plum and a lighter brown but two greys; and by
      day the raw swatches are so muted that at full strength on white the hue barely declares itself. One
      fault, seen from either side. Both are now derived in **OKLCh, where lightness and chroma are separate
      axes**: day keeps the lightness it always had and takes **50% more chroma**, night sets lightness to
      **0.74 and takes 30% MORE chroma** rather than less, and the washes go up with them (26% → 34% by day,
      15% → 20% at night), a wash of a greyish colour being what made the banner itself look flat.
      **Measured against every theme's `--card`, it is better on CONTRAST as well as on colour** — day's
      worst case 3.88 → 3.96 (gazette's paper, the tightest of the sixteen; 4.85 → 4.94 on white, which is
      what `test-a11y.js` measures) and night's 5.03 → 5.62. **It is gated on `@supports (color: oklch(from
      red l c h))` rather than layered as a fallback declaration, and that is the load-bearing part**: a
      custom property accepts ANY token stream at parse time, so an unsupported `oklch(from …)` would not be
      dropped in favour of the declaration above it — it would be invalid at computed-value time and poison
      every property that reads it. A browser without relative colour keeps the raw swatch by day and the
      white mix at night, which is exactly what shipped before.
    **The banner carries its book's colour as a WASH, not only on the spine** (Aug 2026, on request —
    "similar to the collection banners"). It is the collection banner's own bookplate treatment written
    the way `.active-deck` writes it: a gradient of the accent laid OVER `var(--card)` rather than mixed
    into it, so the fade target is whatever paper the theme is using and no theme needs a rule of its own
    (night takes a weaker mix, for the reason the collection pair does). The accent is `--tile`, which
    `bookColor` sets from the AUTHOR — so two books by one hand wash the same, exactly as their spines do.
    A **sort picker** (`BOOK_SORTS`, shared `sortPickerHTML` with the glossary record) ships whatever the
    shelf holds, one book included: it was asked for outright, and a control that appears the day a second
    book lands is one nobody knows to look for. Its `written` row is **labelled "Date"** (renamed from
    "Written" on request, Aug 2026 — the key is untouched, so no stored preference migrates).
    · **EVERY ORDER REVERSES, and the choice is REMEMBERED** (`sortDirHTML` / `setBookSort` /
      `bookSortKey()` / `bookSortRev()`, Aug 2026, on request). Both halves changed how the control is
      written. A `BOOK_SORTS` row is now `[key, field, forward, reverse]`: the **select names the FIELD**
      and the **button names the DIRECTION**, because the labels used to carry the direction ("Title
      (A – Z)", "Oldest first") and a reverse button beside those makes the two controls contradict each
      other. The direction is given IN WORDS, in that field's own words — a bare ascending/descending
      arrow makes the reader translate, and "A – Z" and "Oldest first" are the same direction wearing
      different clothes. Reversing negates the WHOLE comparator, tie-break included, or two books of the
      same year would swap about between renders for no reason a reader could see.
      And unlike the glossary record's picker — a way of looking at a list, deliberately module-level and
      not in `S` — this one is a PREFERENCE: `S.settings.bookSort` / `bookSortRev`, device-local like the
      theme, read back through a whitelist so a retired key falls back rather than leaving the shelf
      sorted by nothing.
    · **A SEARCH BOX beside the sort** (`bookQuery` / `bookFold` / `bookMatches` / `shelfHTML` / `#bkFilter`
      / `.lib-search`, Aug 2026, on request). It matches TITLE, AUTHOR and the year written — the three
      things the banner itself shows, so a reader can always see why a book matched — folding diacritics
      (`normalize("NFD")`, marks stripped) so `sun tzu` finds Sun Tzŭ, and requiring every word of the query
      somewhere in any order, since "seneca letters" and "letters seneca" are the same request.
      Three decisions are load-bearing. It repaints the shelf **IN PLACE** rather than through `render()` —
      a re-render per keystroke takes the caret out of the box being typed in — which means the banners it
      paints have to be **RE-WIRED** (`wireShelf`), the hold sheet being a per-element gesture rather than a
      delegated one, or a book found by searching is a book that cannot be opened. The query lives in a
      **module-level `bookQuery`, not in `S`**: it is a way of looking at the shelf rather than a preference
      about Folio, the same call the glossary record's picker makes — and module-level rather than local to
      the page precisely because `setBookSort` re-renders, so without it changing the order would silently
      throw away what the reader had typed (the glossary page's own documented lesson, one page over). And
      the favourites/rest split SURVIVES filtering, so the shelf narrows rather than rearranging itself.
      Nothing matching draws `.lib-none` and says so; an empty shelf reads as a page that failed to draw.
      Guarded by `test-library.js`, which opens a book from a banner the search painted.
    · **…AND HOW MANY BOOKS ARE ON IT** (`countLine` / `#bkCount` / `.lib-count`, Aug 2026, on request:
      "somewhere at the top of the library page it should mention how many books are listed, with current
      filters on"). Beside the search box that changes it, and repainted by that box's own handler for the
      reason the shelf is — a `render()` per keystroke takes the caret out of the field being typed in.
      Two things it does deliberately. It reads the **same `hits` the shelf is built from** rather than
      counting the banners afterwards, so the line and the list cannot come to disagree about what is on
      screen. And while a search is narrowing it says **both** numbers ("3 of 41 books"), because "3 books"
      over a filtered shelf reads as a library of three; unfiltered it is the one number, "41 of 41" being
      a sum nobody asked for. It is `--ink-faint`, so it joins the quiet tokens `body.hc` re-tones and
      `test-a11y.js` covers it with no change of its own.
    · **FAVOURITES SIT IN A SECTION OF THEIR OWN AT THE TOP** (`S.bookFavs`, `isBookFav` /
      `toggleBookFav`, `.lib-sec` / `.lib-sec-head` / `.bk-star`, Aug 2026, on request). The register is
      **id → when it was starred**, in `defaultState` AND `PROGRESS_FIELDS`, for the reason `reading` is:
      a favourite is a fact about the reader, so the shelf a phone shows is the shelf the laptop shows.
      Two decisions worth keeping. **A starred book is NOT repeated below** — one book, one banner, or a
      reader scrolling past their own favourite twice has to work out which of the two is the real one —
      which is what lets the lower heading be honest ("Everything else"); and **both headings disappear
      when nothing is starred**, so an unstarred shelf is exactly the page it always was. The favourites
      keep the CHOSEN SORT rather than the order they were starred in: it is the same shelf, split. The
      star on the banner is a **mark, not a control** (`pointer-events:none`) — the way to set and clear
      one is the sheet below, and a second target 8px from the first is two answers to one question.
    · **HOLDING A BANNER opens the book's own options** (`openBookMenu`, `wireHoldMenu` + `deckSheet` —
      the same gesture, shell and classification as an added deck's row on the home page, so Escape, the
      backdrop, the focus trap and the exit animation are written once and `render()` closes it through
      `closeDeckMenu`). Two rows, as asked for: **favourite** and **share**. `wireHoldMenu` installs the
      TAP listener itself, so the tile must NOT also carry a click handler — two would open the book from
      under the sheet the hold had just raised. `shareBook` uses the platform's own share sheet where
      there is one (on a phone that is the point of it) and the clipboard otherwise; an **AbortError is
      the reader dismissing the sheet and must not fall through to a copy**, or dismissing it would
      silently take the clipboard. The URL is built from `location.origin + pathname`, so it is right on
      the live site, on a local server and from a `file://` copy alike.
    **The shelf's licence paragraph (`.lib-note`) is gone** (Aug 2026, on request) and the blurb under the
    heading is now one line. **The RULE it stated is not weakened by its going** and must not be quietly
    dropped with it: it still governs `.claude/fetch-book.js`, which is what decides what may be shelved,
    and it is still shown to the reader — in each book's own front matter, beside the edition it is
    actually about, which is where a statement about one book's copyright belongs. Both halves are
    asserted by `test-library.js`, since they fail in opposite directions.
  · **The reader's place is the point of the feature** (`S.reading[bookId] = { ch, y, at }`, in
    `defaultState` + `PROGRESS_FIELDS`, so it back-fills and SYNCS — a letter begun on a phone opens on the
    same paragraph on a laptop). `ch` is the chapter **number, not an index**: a book gains chapters between
    visits (Seneca will), and an index would silently move a reader's place the day the rest arrive. `y` is
    a **fraction of the chapter's own height**, not a pixel offset, so the place survives a text-size
    change, a rotation and a narrower screen — none of which preserve pixels. It is sampled a third of the
    way down the viewport (roughly where the eye is) and written only on a move of more than ~2% of the
    chapter, or a scroll would push the synced blob on every frame. **A deliberate move to another chapter
    starts it at the top; only a RESUME restores a depth.**
  · The scroll listener is on `window`, which outlives the page, and `render()` replaces `#view` without
    telling anyone — so it **takes itself off when it notices its own page is detached** (`isConnected`), the
    self-stopping shape `startMiniGlobe` uses. There is no teardown hook to hang it on.
  · **The notes are the site's own footnote apparatus** (`bookNotesHTML` emits `.src-note` / `.src-item`, so
    `wireFootnotes` numbers the markers and the delegated fold handler opens it with no new wiring). It is
    NOT `sourcesHTML`, because that carries caps written for a card — `normSources` trims a citation to 600
    characters (Gummere's longest note is 729, and a note cut mid-sentence is worse than none) and drops
    everything past 24, which would leave `wireFootnotes` deleting the markers that pointed at them.
    **It renders OPEN** (Aug 2026, on request — it was shut for a fortnight), like a card's sources and
    the Atlas panel's and for the same reason: an apparatus a reader has to go looking for is one they
    will not look at, and here it is the translator's own commentary rather than a works list. It keeps
    `src-compact` for the OTHER half of what that class buys — opening or shutting it never rewrites the
    reader's card-wide `S.settings.srcCollapsed` — and for the smaller type. **So the class no longer
    implies a starting state**: the two surfaces using it now differ there, a gloss popup still opening
    shut. Its being shut was also why every marker jump had to expand the fold first, which is exactly
    the case `openFootnote` used to get wrong (next bullet but one).
  · **`linkProperNounsOnly` — a book links only what the prose CAPITALISES.** Folio's glossary is a glossary
    of prehistory, palaeoanthropology, geography and heads of state; run unrestricted over Roman philosophy
    it links the right proper nouns (Greece, Sicily, Syria, Egypt, Hesiod) and then four words that mean
    something else entirely in Seneca — `genus` is a logical category to a Stoic, `epoch` a stretch of time,
    `iron` and `bronze` metals in a simile. Those look exactly like any other glossary link while telling
    the reader something untrue about the sentence in front of them. It cannot be fixed by a term blocklist:
    the SAME key is right or wrong depending on the sentence, and only the matched surface can tell you
    which. Deliberately narrower than a card's linking and **books-only** — a card's background is written
    against this glossary and should keep linking `knapping`. A book may still name keys in `glossOff`.
  · **WRITING IN THE BOOK — the marker's notes, kept** (`BOOK INK` block: `BOOK_INK_KEY` / `bookInkMount` /
    `inkRecord` / `inkReplay`; `setupWhiteboard({fixed:true})`; Aug 2026, on request). The same floating
    marker as a study card's, over the book instead — but the storage underneath is different, and it had
    to be.
    · **A CARD'S WHITEBOARD CANNOT BE SAVED, which is the whole reason this exists.** A card's ink is a
      raster canvas and its history a stack of full-canvas bitmaps: at a chapter's height that is megabytes
      per chapter, it cannot be re-drawn at another text size or on another screen, and it is exactly the
      wrong thing to put in localStorage. A book's ink is a VECTOR list — the strokes themselves — written
      to disk as it is drawn. `WB.onInk` / `WB.onRedraw` / `WB.onScroll` (plus the undo/redo/clear hooks the
      Atlas already used) are what select that backend; see the `WB` declaration for the three cases.
    · **THE CANVAS IS THE SIZE OF THE SCREEN, not of the chapter** (`WB.fixed`, `wbResize`'s fixed branch,
      `.draw-canvas.wb-fixed`), and this is not an optimisation. **Measured: a book of the Republic is
      ~41,500px tall, which at 1280px wide is a 200 MB backing store** reallocated on every chapter turn —
      and on a phone at devicePixelRatio 3 it is past the area Chrome will allocate at all, where a canvas
      does not throw but **silently stops drawing**. So the book paints only what is on screen and repaints
      on scroll, skipping every stroke whose band is off-viewport. It shipped as a full-height absolute
      canvas for an hour and the first symptom was **the language flip going from 40ms to 380ms**, which is
      what an A/B of the timing against HEAD found; the memory was the real fault behind it.
    · **A POINT IS A FRACTION OF THE CHAPTER PANEL** (`inkFrame`), not a pixel and not a fraction of the
      canvas. The same chapter is a different height on a phone, at Very large text and with the Latin
      column showing, so a pixel offset would put a reader's own note somewhere they never made it — worst
      exactly where notes matter most, deep in a long chapter. It is the same promise `readingPos` makes
      about the reader's place. The honest cost: a note is anchored to the chapter, not to a sentence, so a
      big width change lands it beside the line it was drawn on. That is what the HIGHLIGHTS below are for.
    · **The sticky chapter bar is CLIPPED OUT rather than painted over.** The bar lives inside `.page`,
      which animates with a fill mode and is therefore a stacking context, so nothing inside it can be
      raised above a canvas that is a child of the stage — **no z-index settles this** (the same fact behind
      the controls-under-the-ink pass-through). Both the bar and the canvas are pinned to the viewport, so
      the band is simply excluded and a stroke running under it is cut at its edge. Mounting the canvas
      INSIDE the page was tried and had to be abandoned: `position:fixed` inside a transformed ancestor is
      not fixed at all.
    · **`bkGestureOK` returns false while `WB.enabled`.** With the pen down the finger draws, and a
      horizontal line drawn under a passage is exactly the shape the chapter-swipe handler reads as "turn
      the page".
    · Keyed by **book AND chapter** — a chapter change swaps the whole list, history included — and
      **device-local**, like where the marker sits: this is ink on a screen, not something for the synced
      progress blob. History is a stack of whole LISTS rather than of single strokes, which is what makes
      **Clear undoable**; with an empty past and strokes on the page (every chapter reopened from disk)
      undo peels the last stroke instead, or reopening a book would leave Clear as the only way to remove
      one mark.
  · **HIGHLIGHTING THE WORDS THEMSELVES** (`BOOK HIGHLIGHTS`: `BOOK_HL_KEY` / `bkTextNodes` / `bkOffsetOf` /
    `bkPaintHl` / `bookHlApply`; `wireBookCtxMenu`; Aug 2026, on request). Right-click a selection for
    **Highlight · Copy · Select all · Web search · Read aloud**, plus **Remove highlight** where the click
    lands on one.
    · The marker draws OVER the page; a highlight is made OF it, and **that is what each survives**. Ink is
      a proportion of the chapter and drifts if the column is re-shaped; a highlight is a CHARACTER RANGE in
      the chapter's own prose, so it stays on its sentence at any width, any text size and in either column
      (`k` is `"en"` or `"or"`). Offsets are taken AFTER the glossary linking and the units pass, so what is
      measured is what the reader is looking at; switching measurement systems mid-book is the one thing
      that moves them, and it is recoverable by switching back.
    · **The span carries the highlight's own id, NEVER its index in the list.** An index shifts the moment
      anything before it is removed — it shipped that way for an hour, which took the marks off the page and
      left the record on disk to put them back on the next reload.
    · Ranges are painted **from the end of the chapter backwards**, since every one was measured against the
      un-split text and wrapping splits the nodes under it. `surroundContents` cannot be used at all: a
      range over prose crosses element boundaries (an italic title, a glossary link, a footnote marker), so
      each text node is split and its middle wrapped on its own.
    · Deliberately NOT `wireReadAloudMenu`, which is a two-item menu for a card's background and is gated on
      `ttsEnabled()` — that gate turns the whole read-aloud SYSTEM off, and a reader who has selected a
      phrase and asked for it to be read has asked for one thing rather than turned a system on, so this
      calls `ttsSay` directly and shows the row only where `ttsSupported()`. **Remove highlight is not
      decoration**: Highlight writes something permanent, and an item that can only ever be added is a trap
      the first time a reader mis-drags. Web search opens Google in a new tab.
    · An item may carry `colors` instead of an action (`showCtxMenu`), drawn as a swatch row IN PLACE rather
      than as a submenu: five swatches take less room than the words naming them, and a menu inside a menu
      is a target inside a target on a phone.
  · TTS is otherwise **not** wired: `ttsEnabled()` returns false site-wide (see the read-aloud bullet), so a
    play control here would render and do nothing.
