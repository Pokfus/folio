#!/usr/bin/env python3
"""Choose the level's words.

WHERE THE WORDS COME FROM, and this is the honest half of the whole generator.

**UKBI PUBLISHES NO VOCABULARY LIST.**  It is a proficiency test, not a
syllabus: it reports a score from 251 to 800 and a predicate from Terbatas to
Istimewa, and the Badan Pengembangan dan Pembinaan Bahasa publishes descriptors
of what a candidate at each predicate can DO, never a list of the words they are
expected to know.  Neither does BIPA -- Permendikbud No. 27/2017 sets the
Standar Kompetensi Lulusan for the seven BIPA levels, and it too is written in
competences rather than in words.  This was checked before anything was built,
because the alternative was to imply an official list that does not exist.

That is a real difference from the sibling decks on this shelf.  The Goethe
decks read the exam board's own printed Wortliste, and the DELE decks read the
Instituto Cervantes' Plan curricular inventories -- in both, the exam board
chooses the vocabulary and the generator only has to read it.  Here nobody has
chosen it, so this file chooses it, and the deck's own description says outright
that it does.  What keeps that from being arbitrary is that the two inputs are
both stated:

  · the level's SCOPE is UKBI's own descriptor -- Terbatas is "berkomunikasi
    untuk keperluan sintas", survival communication -- which is what
    `supplement.py` is an inventory of;
  · the ORDER, and the fill up to the target, is corpus frequency, so that the
    words a learner meets most often come first.

THE CASCADE, in order.  Every step below was measured on the real data before it
was written, and the measurements are in the comments where they bite.
"""
import json, re, collections

from ukbi_level import LEVEL, f as lvlf, TARGET, words_below
from build_deck import meanings   # one implementation of "has this a meaning?"
import supplement

# --------------------------------------------------------------- the classes
# A part of speech that is not a word a deck can teach.  `root` is Wiktionary's
# own tag for a bare Indonesian/Malay root that occurs only affixed.
NOT_A_WORD = {'name', 'prefix', 'suffix', 'infix', 'interfix', 'circumfix',
              'root', 'character', 'punct', 'symbol'}

# How many times a multi-word entry must occur in the sentence corpus before its
# frequency is estimated at all.  See `estimate_phrases` for the measurement:
# below this the estimate is not a measurement of anything and every phrase gets
# the same one.  A phrase the inventory asks for is unaffected -- it is forced in
# without consulting a frequency.
PHRASE_MIN = 2

# TAGS THAT MARK A FORM AS OUTSIDE THE STANDARD LANGUAGE.  UKBI tests bahasa
# baku, so these do not earn a card.
#
# `informal` AND `colloquial` ARE NOT THE SAME THING HERE, and getting that
# wrong costs the deck its most important pronouns.  `kamu` and `aku` are tagged
# `informal`: they are the familiar register OF the standard language, they are
# in the KBBI, they are taught in the first lesson of every BIPA course and they
# are the first and thirty-first commonest words in the corpus.  `nggak`, `gue`
# and `banget` are tagged `colloquial`/`Jakarta`/`alt-of`: they are a different
# variety, and UKBI marks them wrong.  So `informal` is kept and the rest are
# dropped -- measured, the narrow rule drops 584 words of the 50,000 and the
# blanket one would additionally have taken `kamu`, `aku`, `saya` and `Anda`.
NONSTANDARD = {'alt-of', 'slang', 'Jakarta', 'nonstandard', 'misspelling',
               'abbreviation', 'contraction', 'archaic', 'obsolete',
               'dialectal', 'colloquial', 'rare', 'ellipsis', 'poetic'}

# A head-template type that says outright "this entry is a form of something".
DERIVED_HT = {'verbf', 'verb form', 'nounf', 'noun form', 'adjf', 'adj form'}

# The relation a gloss states.  Split in two, because the two behave differently
# and merging them would put a plural on the front of a card:
#   INFLECTIONAL -- `anak-anak` is the plural of `anak`, `seorang` the singular
#     of `orang`.  These join their base's family and may NEVER be its headword.
#   DERIVATIONAL -- `melihat` is the active of `lihat`.  These join the family
#     AND may be its headword, because in Indonesian the affixed verb is very
#     often the form a learner actually meets: `mengerti` is used 47,243 times
#     in the corpus against nineteen for its root `erti`, which is Malay and is
#     not Indonesian at all.
# THE OPTIONAL LEADING WORD IS LOAD-BEARING.  Wiktionary qualifies the relation
# as often as not -- `menjaga` is glossed "TRANSITIVE active of jaga" -- and
# without it the pattern misses those, so the word never joins its root's family:
# no forms row, and no meaning either, since the meaning lives on the root.  It
# had to be found from the other end, by `build_deck.py` refusing to write a card
# for a common verb, because a family that fails to form is invisible -- the word
# simply ships alone, looking exactly like a word that has no relatives.
# `build_deck.py`'s own REL already allowed the modifier; the two patterns are
# asking the same question and had drifted apart.
# INFLECTION ONLY.  An abbreviation, an ellipsis, a contraction and an
# alternative spelling are LEXICAL VARIANTS rather than morphological forms, and
# they have no business in an affix family: the row exists to show a root and the
# words derived from it by prefix and suffix, which is the part of Indonesian a
# learner cannot guess.  Admitting them put `kabag` -- a syllabic abbreviation of
# `kepala bagian`, a head of division -- on the card for `kepala`, alongside
# `warnet` on `warung` and `miras` on `minuman`.  None of those is a form of
# anything; each is a separate word made by cutting two others up.
# `build_deck.py`'s own REL still drops such a gloss when it is the only thing an
# entry says, which is the job that pattern is for and a different one.
REL_INFLECTIONAL = re.compile(
    r'^(?:\w+\s+)?(?:plural|singular form|reduplication|inflection)'
    r'\s+of\s+([\w\- ]+)')
REL_DERIVATIONAL = re.compile(
    r'^(?:\w+\s+)?(?:active|passive|actor focus|patient focus|accidental passive|'
    r'infinitive, imperative and colloquial|basic/imperative[\w/]*)\s+of\s+([\w\- ]+)')

# A LABEL IN THE id-verb PARADIGM THAT NAMES THE BASE.  The template writes
# label/value pairs and the labels vary between entries, so they are matched
# rather than indexed.
BASE_LABEL = re.compile(r'imperativ|^base|^basic|root', re.I)

# How a paradigm label or a relation gloss is said on the card.  Wiktionary's
# own wording is for lexicographers -- `basic-imperative-informal`,
# `accidental passive` -- and the deck is for a beginner, so each is reduced to
# the one word that says what the form DOES.  An unrecognised label is kept as
# it stands rather than dropped, and the run prints it, so a new one arrives
# visibly instead of silently losing a form.
LABEL_MAP = [
    # `imperati[vf]` because the paradigm writes the label in Indonesian on some
    # entries and in English on others -- `buka`'s reads `imperatif`.  The
    # imperative IS the bare root in Indonesian, which is why both say root.
    (re.compile(r'imperati[vf]|^base|^basic|root|infinit', re.I), 'root'),
    (re.compile(r'accidental', re.I), 'accidental'),
    (re.compile(r'active|actor focus', re.I), 'active'),
    (re.compile(r'passive|patient focus', re.I), 'passive'),
    (re.compile(r'plural|reduplicat', re.I), 'plural'),
    (re.compile(r'singular', re.I), 'singular'),
    (re.compile(r'jussive|emphatic', re.I), 'emphatic'),
    (re.compile(r'superlative', re.I), 'superlative'),
    (re.compile(r'comparative', re.I), 'comparative'),
]
# the order forms are shown in, whatever order the source lists them
LABEL_ORDER = ['root', 'active', 'passive', 'accidental', 'emphatic', 'plural',
               'singular', 'feminine', 'masculine', 'equative', 'comparative',
               'superlative']

# THE RELATION IS OFTEN IN THE TAGS RATHER THAN IN THE WORDING, and reading only
# the wording left a fifth of the rows with a cell that had no label against it.
# Wiktionary states a VERB's relation in the gloss -- "active of lihat" -- and
# nearly everything else's in the sense's own tags: `terbaik` is glossed
# "superlative degree of baik: best" and tagged `superlative`, `sebaik` "equative
# degree of baik: as good as" and tagged `equative`, `pergilah` is tagged
# `jussive`, `raja-raja` `plural`, `siswi` `feminine`.  An unlabelled cell is
# worse than no cell at all: it asserts that the word is a form of the headword
# without saying which form, on a row whose whole purpose is to name the
# relation.  Measured before this was written: 21 rows in level 1 and 10 in
# level 2 carried one.
TAG_LABEL = [('superlative', 'superlative'), ('equative', 'equative'),
             ('comparative', 'comparative'), ('jussive', 'emphatic'),
             ('emphatic', 'emphatic'), ('feminine', 'feminine'),
             ('masculine', 'masculine'), ('plural', 'plural'),
             ('singular', 'singular')]

# TWO KINDS OF RELATIVE ARE REAL AND ARE STILL NOT SHOWN ON THE CARD.
#
#   · A COLLOQUIAL RESPELLING -- `udah` for `sudah`, `malem` for `malam`,
#     `dapet` for `dapat`, `males` for `malas`.  The deck teaches bahasa baku,
#     its own description says outright that the standard form is what is taught
#     where a colloquial one is commoner, and printing the colloquial variant
#     beside the standard word contradicts that on the card itself.  It is also
#     not an affix family at all: `udah` is not derived from `sudah` by any
#     prefix or suffix, it is the same word with a syllable knocked off.
#
#   · THE WORD PLUS A POSSESSIVE CLITIC -- `hatiku`, `hatinya`, `sakitnya`,
#     `keadaannya`.  These are mechanical and reversible with no sound change,
#     which is why `read_frequency` already strips them; they teach nothing the
#     pronoun cards do not, and they crowd the row out (`hati` showed four cells,
#     three of which were `hati` with a pronoun on the end).
#
# HIDDEN FROM THE ROW, NOT REMOVED FROM THE FAMILY.  They stay merged, because
# the family is also what keeps them out of the pool as words in their own right
# and what the meaning falls back to; freeing them would promote each to a
# headword whose only gloss is a cross-reference.
FORM_HIDE = {'informal', 'possessive', 'alt-of', 'colloquial', 'nonstandard',
             'misspelling', 'abbreviation', 'ellipsis', 'contraction'}


def say_label(lab):
    for rx, out in LABEL_MAP:
        if rx.search(lab):
            return out
    return lab.replace('-', ' ').strip().lower()

# ------------------------------------------------------- hand-checked overrides
# Measured false positives.  Each is here because the rules above get it wrong
# and the reason is written beside it; this is the same escape hatch the German
# generator's FORCE_POS and the Spanish one's AUTHORED table are.
EXCLUDE = {
    # `kan` is the tag-question particle and the `-kan` suffix, which is where
    # all of its corpus frequency comes from.  Its only surviving dictionary
    # senses are a rare noun ("jug, pot") and an apheretic form of `bukan`, so
    # a card for it would teach a beginner the word for a jug on the strength of
    # a particle's frequency.
    'kan',
    # same shape: the frequency belongs to the clitics, the surviving senses do
    # not.  `ku` survives as "Ang ku kueh, a Chinese sweet dumpling".
    'ku', 'mu', 'nya',
    # `dr` / `tn` / `s` are subtitle abbreviations that happen to have entries.
    'dr', 'tn', 's',
    # THE THIRD OF THIS SHAPE, and the one that shows why it cannot be automated.
    # `kayak` is very common in speech as the colloquial preposition "like, such
    # as"; that sense is tagged colloquial and correctly refused, which leaves
    # the untagged noun -- `kayak`, the boat, an English loanword a Semenjana
    # candidate has no use for.  `tau` was caught by widening `LETTER_NAME`,
    # because its surviving sense was recognisably not an Indonesian word at all;
    # here the surviving sense is a perfectly good Indonesian noun, so no rule
    # can see it and the exclusion is by hand.  The harm is worse than a useless
    # card: the example sentences are drawn from a corpus in which nearly every
    # `kayak` is the preposition, so the card would gloss it "a canoe" and then
    # print three sentences meaning "like".  Found by `check-ukbi.js`, which
    # lists it among the colloquial forms that must never be taught.
    'kayak',
    # THE SAME SHAPE AT LEVEL 5, WHERE THE OTHER FORM IS ENGLISH OR A NAME.  The
    # deck goes 2,000 words deep into a corpus of film subtitles, and a subtitle
    # file is full of English -- so a word spelled like a common English one
    # collects that word's count, and what the reader is then shown is whatever
    # marginal Indonesian sense the dictionary happens to file under the
    # spelling.  Each of these is a real entry and every one of them is absurd at
    # the rank the count buys it:
    #   `station`  an obstetric measurement (the position of the foetal head)
    #   `cup`      "sound of something immersed in water"
    #   `along`    "abundant catch of fishermen"
    #   `lukas`    a fish species, ranked on the given name Lucas
    #   `jamal`    "male camel", ranked on the given name Jamal
    #   `Aditya`   a solar deity, and a Javanese given name
    # TWO RULES FOR THIS WERE MEASURED AND BOTH REFUSED, which is the finding
    # rather than the six words.  Dropping Wiktionary's "unadapted borrowing"
    # etymology would take `bank`, `si`, `laptop`, `tank`, `tsunami` and `siku`
    # to catch four; dropping anything spelled like a common English word would
    # take `digital`, `legal`, `formal`, `vitamin`, `stadium`, `diagnosis` and
    # `proposal` -- ordinary Indonesian, and several of them this level's own
    # subject matter.  Indonesian has borrowed too well for either test to
    # separate a borrowing from an intruder, so this stays a hand list and will
    # grow by a few at every level.
    # KEPT DELIBERATELY, for contrast: `bridge` (the card game), `port` (port
    # wine) and `flat` (an apartment) are ranked by their English homographs too,
    # and their cards are HONEST -- inflated rank, true gloss.  The test is not
    # whether the count is borrowed but whether the card teaches something false.
    'station', 'cup', 'along', 'lukas', 'jamal', 'Aditya',
}

KEEP = {
    # `kereta` is the everyday word for a train and the rules drop it, because
    # the dictionary files it as an ellipsis of `kereta api`.  That is true and
    # it is still the word on the front of the train.
    'kereta',
}


# --------------------------------------------------------------- the dictionary
def load():
    ents = json.load(open(lvlf('wikt.json'), encoding='utf-8'))
    byword = collections.defaultdict(list)
    for e in ents:
        byword[e['w']].append(e)
    return byword


def compound_numeral(word, byword):
    """True for a multi-word cardinal number, which is arithmetic and not a word.

    `delapan puluh sembilan` is eighty-nine.  A learner who has `delapan`,
    `puluh` and `sembilan` -- all three of them level-1 words -- can produce it
    and every other number in the language without being shown one, so a card
    for it teaches nothing at all.  The dictionary states the part of speech
    (`num`) and multi-word is the whole of the test, so single numerals are
    untouched: `sepuluh`, `seratus` and `seribu` are words and stay.

    THE DECKS HAD BEEN SLOWLY FILLING UP WITH THESE, which is why the rule is
    worth having rather than a tidy-up of one level.  Measured across the four
    shipped decks before it was written: level 2 had `tiga puluh`, level 3 four
    of them, level 4 nine -- including `puluh ribu`, which is not even a number
    but "tens of thousands" -- and level 5 seven more.  Twenty-three cards of
    counting practice, arriving a few at a time and never enough at once to be
    noticed.

    IT IS APPLIED TO THE POOL AND NOT TO THE SUPPLEMENT, which is the whole
    reason it can be this blunt.  Level 1's inventory asks for `sebelas`, `dua
    belas` and `dua puluh` deliberately -- as the PATTERN, its own comment says,
    rather than as a run -- and a hand-written entry is forced in without
    consulting this.  So what the rule removes is precisely the numbers nobody
    chose: the ones a film happened to say aloud.
    """
    if ' ' not in word:
        return False
    return any(e['pos'] == 'num' for e in byword.get(word, []))


def sense_tags(s):
    return set(s.get('tags') or [])


def entry_nonstandard(e):
    """True when EVERY sense of the entry is outside the standard language.

    Every sense, not the first -- which is the fault the first cut of this had.
    `bumi`, `kereta`, `pasukan`, `ratu` and `tangkap` all open on an alt-of or an
    ellipsis and carry the ordinary meaning further down, and a rule reading
    `senses[0]` threw all five out along with `Anda` and `kamu`.
    """
    return all(sense_tags(s) & NONSTANDARD for s in e['s'])


def entry_relation(e, word, byword):
    """(base, kind) this entry is a form of, or (None, None).

    kind is 'infl' or 'deriv'.  A base that is not itself in the dictionary is
    not a base at all -- Wiktionary occasionally names one that has no entry
    (`mulai` is glossed "basic/imperative/intransitive/colloquial of me"), and
    merging into it would lose the word entirely.
    """
    for s in e['s']:
        for b in (s.get('form_of') or []):
            if b != word and b in byword:
                t = sense_tags(s)
                kind = 'infl' if (t & {'plural', 'singular', 'form-of'}) else 'deriv'
                return b, kind
        g = (s.get('glosses') or [''])[0]
        for rx, kind in ((REL_INFLECTIONAL, 'infl'), (REL_DERIVATIONAL, 'deriv')):
            m = rx.match(g)
            if m:
                # A MULTI-WORD TARGET IS TAKEN WHOLE OR NOT AT ALL.  Reducing it
                # to its first word invents a relation: the gloss "syllabic
                # abbreviation of kepala bagian" names a two-word phrase, and
                # taking `kepala` from it claims a kinship that does not exist.
                # Longest first, so `di sini` beats `di`.
                parts = m.group(1).strip().split(' ')
                for n in range(len(parts), 0, -1):
                    cand = ' '.join(parts[:n])
                    if cand != word and cand in byword:
                        return cand, kind
                    if n > 1:
                        continue
                    break
    if e.get('ht') in DERIVED_HT:
        for lab, val in e.get('pairs') or []:
            if val != word and val in byword and BASE_LABEL.search(lab):
                return val, 'deriv'
    return None, None


def is_live_word(word, byword):
    """True when the dictionary carries this spelling as a word in its own right.

    The same two tests `classify` opens with -- a part of speech a deck can
    teach, and at least one entry that is not wholly outside the standard
    language -- pulled out because `read_frequency` needs to ask the question of
    a LOWERCASE form before anything has been classified.
    """
    for e in byword.get(word, []):
        if e['pos'] not in NOT_A_WORD and not entry_nonstandard(e):
            return True
    return False


def classify(word, byword):
    """(state, base, kind) for a word.

    state is one of: 'notword', 'nonstandard', 'derived', 'headword'.

    A WORD WITH ANY LIVE ENTRY OF ITS OWN IS A HEADWORD, whatever else it also
    is, and that single line is what saves `mereka`.  `mereka` carries two
    entries -- the third-person plural pronoun, and a verb form glossed "active
    of reka" -- and a rule that merged on the existence of any derived entry
    would have filed the pronoun `they` under the root `reka`, "to devise", and
    deleted the commonest plural pronoun in the language from a beginners' deck.
    Measured on the top 1,500: 128 words carry a derived reading, and eleven of
    them also carry an unrelated live one.
    """
    # A SINGLE CHARACTER IS NOT A WORD THIS DECK TEACHES.  Indonesian has none --
    # its shortest are two letters (`di`, `ke`, `ya`) -- so this can never refuse
    # a real one, and it is what keeps a letter of the alphabet out of the deck
    # when the letter ALSO carries some live non-letter sense that the meaning
    # test therefore lets through: `P` reached level 4 glossed "used to ping or
    # otherwise start a text messaging conversation", its `character` entry
    # correctly ignored and its interjection entry perfectly good.
    if len(word) < 2:
        return 'notword', None, None
    ents = [e for e in byword.get(word, []) if e['pos'] not in NOT_A_WORD]
    if not ents:
        return 'notword', None, None
    live = [e for e in ents if not entry_nonstandard(e)]
    if not live:
        return 'nonstandard', None, None
    rels = [entry_relation(e, word, byword) for e in live]
    if all(b for b, _ in rels):
        base, kind = rels[0]
        # a form that is inflectional in EVERY reading is inflectional
        kind = 'deriv' if any(k == 'deriv' for _, k in rels) else 'infl'
        return 'derived', base, kind
    return 'headword', None, None


# ------------------------------------------------------------------ frequency
CLITIC = re.compile(r'^(.{3,}?)(ku|mu|nya)$')


def read_frequency(byword):
    """The corpus counts, folded onto dictionary words.

    TWO NORMALISATIONS, both of which recover counts that would otherwise be
    lost, and both of which are safe in a way that stripping `meN-` is not.

    · THE CLITICS.  Indonesian writes the possessive and object clitics onto the
      word: `ayahku` (my father), `padamu` (to you), `melihatnya` (to see it).
      A surface-frequency list counts each as a word of its own, and 342 of the
      top 1,500 are absent from the dictionary largely because of it.  Stripping
      them is mechanical and reversible -- they are pure suffixes with no sound
      change -- which is exactly what `meN-` is not: `menulis` drops the `t` of
      `tulis` and `menanti` keeps the `n` of `nanti`, so no rule can undo that
      prefix without a dictionary, and this generator never tries.  Affix
      families are read from the dictionary instead.

    · CASE.  The frequency list is lowercased and several headwords are not:
      `Anda`, `Senin`, `Januari`, `Indonesia`.  The count is looked up
      case-insensitively, so the capitalised headword is ranked on the real
      frequency of its lowercase surface rather than on nothing.

      **BUT ONLY WHERE THE LOWERCASE FORM IS NOT ITSELF A WORD**, which is the
      other half of that rule and was missing until level 4 reached far enough
      down the list to meet it.  The corpus is lowercased, so a count filed under
      `maya` cannot be attributed to `Maya`: handed it, the deck carded `Maya`
      (an ethnonym and a very common given name) on the frequency of `maya`
      ("virtual"), `Nabi` ("Master, Confucius") on that of `nabi` ("prophet"),
      `BA` (a West Sumatra number-plate code) on that of `ba`, and `Insinyur` (a
      degree) on that of `insinyur` (an engineer) -- four cards teaching the
      wrong word each, every count healthy.  The fold exists for `Anda`, `Senin`
      and `Januari`, whose lowercase forms are NOT live words (`anda` is filed as
      an alternative letter-case form and the calendar has no lowercase entry at
      all), and that is exactly the test.  `Minggu` is the one case where both
      are live and both are wanted -- Sunday and week -- and it is unaffected,
      being a supplement word that is forced in whatever it ranks.
    """
    raw = {}
    for line in open('id_50k.txt', encoding='utf-8'):
        p = line.split()
        if len(p) == 2:
            raw[p[0]] = raw.get(p[0], 0) + int(p[1])
    folded = collections.Counter()
    for w, c in raw.items():
        if w in byword:
            folded[w] += c
            continue
        m = CLITIC.match(w)
        if m and m.group(1) in byword:
            folded[m.group(1)] += c
            continue
        for p in ('ku', 'kau'):
            if w.startswith(p) and len(w) - len(p) >= 3 and w[len(p):] in byword:
                folded[w[len(p):]] += c
                break
        else:
            folded[w] += c
    # case-insensitive view, so `Anda` can be ranked on `anda`
    lower = collections.Counter()
    for w, c in folded.items():
        lower[w.lower()] += c
    # the lowercase spellings that are words of their own, which is what the
    # fold must NOT reach across
    live_lower = {w for w in byword if w == w.lower() and is_live_word(w, byword)}
    return folded, lower, live_lower


TOKEN = re.compile(r"[a-z]+(?:-[a-z]+)?")


def estimate_phrases(byword, lower):
    """A frequency for the multi-word entries, calibrated onto the same scale.

    A PHRASE CANNOT APPEAR IN A SEGMENTED FREQUENCY LIST AT ALL, so every one of
    them scores zero and sorts last -- which put `terima kasih`, `selamat pagi`
    and `apa kabar` at the very bottom of a survival deck, behind `sialan`.  They
    are among the first things anybody learns to say.

    THE OBVIOUS FALLBACK IS WRONG and the Spanish generator has already measured
    why: giving a phrase the rank of its rarest component is a true ceiling on
    how often it can be said and a hopeless estimate of it, because a phrase
    built out of very common words gets a very high one.  `terima kasih` would
    inherit the count of `terima`.

    So the phrases are COUNTED in the Tatoeba corpus this pipeline already
    downloads for its example sentences, and that count is calibrated onto the
    subtitle scale through the single words, which carry both.  The factor is the
    MEDIAN ratio rather than the mean, so that one word whose two corpora
    disagree wildly -- and film subtitles and a sentence bank disagree about
    plenty -- cannot drag the whole scale with it.

    ONE OCCURRENCE IS NOT A FREQUENCY, AND `PHRASE_MIN` IS WHERE THAT BITES.
    A count of 1 says only that the phrase exists somewhere in 28,192 sentences;
    multiplying it by the factor dresses that up as a number with three
    significant figures, and worse, EVERY hapax gets the SAME number -- so they
    do not spread out along the ranking, they arrive together as one
    undifferentiated block sorted alphabetically, which is visibly not the
    frequency ordering the deck's own description promises.

    Measured before the floor was set.  Of the 579 multi-word entries Tatoeba
    contains at all, 263 occur exactly once, and at level 5 those filled 234 of
    the deck's 360 phrases -- a run of cards from about rank 1200 reading `air
    putih, air tenang menghanyutkan, akal imitasi, aksi terorisme, alat bantu`,
    straight down the alphabet.  Not one of them is a bad Indonesian word; what
    is missing is any evidence that they belong at THIS rank rather than three
    levels further on.  The floor costs the shipped levels nothing at all: 0, 1,
    0 and 0 of levels 1-4's phrases rest on a single occurrence, and the one is
    `hari raya`, which is in level 2's inventory and is forced in regardless.
    """
    grams = collections.Counter()
    for line in open('ind_sent.tsv', encoding='utf-8'):
        p = line.split('\t')
        if len(p) < 3:
            continue
        toks = TOKEN.findall(p[2].lower())
        grams.update(toks)
        grams.update(' '.join(toks[i:i + 2]) for i in range(len(toks) - 1))
        grams.update(' '.join(toks[i:i + 3]) for i in range(len(toks) - 2))
    ratios = sorted(lower[w] / grams[w] for w in grams
                    if ' ' not in w and grams[w] >= 20 and lower.get(w, 0) > 0)
    if not ratios:
        return {}, 0.0
    factor = ratios[len(ratios) // 2]
    est = {}
    for w in byword:
        if ' ' in w:
            c = grams.get(w.lower(), 0)
            if c >= PHRASE_MIN:
                est[w] = int(c * factor)
    return est, factor


# ------------------------------------------------------------------- families
def family_forms(head, members, byword, state):
    """The affix family as [[form, label], ...], for the card's forms row.

    THIS IS INDONESIAN'S ANSWER TO A CONJUGATION TABLE, and it is the one thing
    a vocabulary card in this language most has to carry.  Indonesian marks no
    tense, no person and no number, so there is no paradigm to print -- what
    there is instead is a family of affixed words around a root, and knowing
    `lihat` without knowing that `melihat` is how you say it and `dilihat` is
    how it is said of you leaves a learner unable to read a sentence.

    The labels come from the dictionary's own id-verb paradigm where the entry
    has one, and from the relation stated in the gloss otherwise, so nothing
    here is derived by stripping affixes.  That matters: `meN-` assimilates and
    deletes the root's first consonant, so `menulis` is `tulis` but `menanti` is
    `nanti`, and no rule can tell those apart without a dictionary.
    """
    # A PARADIGM ARGUMENT LIST IS NOT PURELY LABEL/VALUE, so a label this file
    # cannot name is held back rather than printed.  The id-adj template writes
    # `superlative | paling aman | or | teraman` -- the periphrastic superlative
    # as a proper pair, then the literal word `or` introducing the affixed
    # alternative -- and the id-verb template writes `used in the form |
    # menyanyi`.  Read as pairs those label `teraman` "or" and `menyanyi` "used
    # in the form", both of which reached the card.  Deferring to the sense's own
    # tags and gloss names them correctly (superlative; active of nyanyi), and an
    # unrecognised label is still used where nothing else names the form at all,
    # and is reported when it is -- so a template shape the source starts using
    # arrives visibly rather than silently losing a form.
    seen, weak, hide, out = {}, {}, set(), []
    for m in members:
        for e in byword.get(m, []):
            for lab, val in e.get('pairs') or []:
                if val in members or val == head:
                    l = say_label(lab)
                    (seen if l in LABEL_ORDER else weak).setdefault(val, l)
    for m in members:
        if m in seen:
            continue
        for e in byword.get(m, []):
            for s in e['s']:
                # only a sense that actually states a relation TO THIS FAMILY --
                # `apa-apa` opens on the pronoun "anything" and states its
                # relation to `apa` in its second sense
                g = (s.get('glosses') or [''])[0]
                rel = REL_INFLECTIONAL.match(g) or REL_DERIVATIONAL.match(g)
                if not rel and not (set(s.get('form_of') or []) & set(members)):
                    continue
                tags = sense_tags(s)
                if tags & FORM_HIDE:
                    hide.add(m)
                    break
                for tag, lab in TAG_LABEL:
                    if tag in tags:
                        seen[m] = lab
                        break
                else:
                    if rel:
                        seen[m] = say_label(g[:rel.start(1)])
                if m in seen:
                    break
            if m in seen or m in hide:
                break
    # AN UNLABELLED MEMBER THAT STANDS ON ITS OWN IS THE ROOT.  The paradigm
    # never labels its own base -- `ambil`'s template names the active and the
    # passive and says nothing about `ambil` -- so the root would otherwise be
    # the one form on the card with no label against it.
    for m in members:
        if m not in seen and m in weak:
            seen[m] = weak[m]
    for m in members:
        if m not in seen and state.get(m, ('',))[0] == 'headword':
            seen[m] = 'root'
    # ANYTHING STILL UNNAMED IS HIDDEN AND REPORTED.  See the note on FORM_HIDE:
    # a cell with no label makes a claim it cannot state.  Reporting it is what
    # keeps a relation shape the source starts using from being lost in silence,
    # which is the same discipline `say_label` follows for a label it does not
    # recognise.
    for m in members:
        if m not in seen:
            hide.add(m)
    # THE HEADWORD IS NEVER HIDDEN, AND UNNAMED IT IS THE ROOT.  It is the word
    # the card is asking for, so a row that dropped it would mark none of its
    # cells as the answer; and a head that nothing above named is the base of
    # its family by construction, since a head that is an affixed form -- the
    # very common case, `mengerti` over `erti` -- states its own relation in its
    # gloss and is labelled by the pass above.  This also covers the calendar,
    # whose entries are proper nouns and so carry no state of their own.
    if head in hide:
        hide.discard(head)
        seen.setdefault(head, 'root')
    for m in members:
        if m not in hide:
            out.append([m, seen[m]])
    out.sort(key=lambda r: (LABEL_ORDER.index(r[1]) if r[1] in LABEL_ORDER
                            else len(LABEL_ORDER), r[0]))
    odd = sorted({l for _f, l in out if l not in LABEL_ORDER})
    return out, sorted(hide), odd


class Union:
    def __init__(self):
        self.p = {}

    def find(self, a):
        self.p.setdefault(a, a)
        while self.p[a] != a:
            self.p[a] = self.p[self.p[a]]
            a = self.p[a]
        return a

    def join(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.p[ra] = rb


def main():
    byword = load()
    folded, lower, live_lower = read_frequency(byword)
    phrase_est, factor = estimate_phrases(byword, lower)
    for p, c in phrase_est.items():
        lower[p.lower()] = max(lower.get(p.lower(), 0), c)

    def freq(w):
        # a capitalised headword is ranked on its own count where the lowercase
        # spelling is a different word -- see `read_frequency`
        if w != w.lower() and w.lower() in live_lower:
            return folded.get(w, 0)
        return lower.get(w.lower(), 0)

    # every word the dictionary knows, so the supplement can be resolved
    json.dump(sorted(byword), open(lvlf('known.json'), 'w'), ensure_ascii=False)
    supp_items, supp_missing = supplement.candidates(set(byword))
    supp = []
    seen = set()
    for w, _sec in supp_items:
        if w not in seen:
            seen.add(w)
            supp.append(w)

    # ---- classify every word that has any corpus presence, plus the supplement
    universe = set(w for w in byword if freq(w) > 0) | set(supp)
    state = {}
    for w in universe:
        state[w] = classify(w, byword)

    # ---- union the derived forms onto their bases
    #
    # THE RELATION POINTS BOTH WAYS IN THE SOURCE, which is why this is a
    # union-find and not a walk.  `mengirim`'s paradigm names `kirim` as its
    # base, and `kirim`'s own entry is glossed "infinitive, imperative and
    # colloquial of mengirim" -- a two-element cycle.  Chains occur too
    # (`kata` -> `katakan` -> `mengatakan`).  Union-find flattens both without
    # having to decide which direction is the true one, and the headword is then
    # chosen from the whole family on evidence rather than on the arrow.
    uf = Union()
    pending = list(state.items())
    while pending:
        w, (st, base, _k) = pending.pop()
        if st == 'derived' and base:
            uf.join(w, base)
            # a base may itself be derived (`kata` -> `katakan` -> `mengatakan`)
            # and may be outside the corpus universe entirely, so it is
            # classified and queued rather than assumed to be a root
            if base not in state:
                state[base] = classify(base, byword)
                pending.append((base, state[base]))
    fam = collections.defaultdict(set)
    for w in state:
        fam[uf.find(w)].add(w)

    # ---- pick each family's headword
    #
    # The most frequent member that may hold the front of a card: not
    # inflectional (a plural is never a headword), not outside the standard
    # language, and a word at all.  Ties and empties fall back to the base.
    heads = {}
    for root, members in fam.items():
        elig = []
        for m in members:
            st, _b, kind = state.get(m, ('notword', None, None))
            if st in ('notword', 'nonstandard'):
                continue
            if st == 'derived' and kind == 'infl':
                continue
            elig.append(m)
        if not elig:
            continue
        head = max(elig, key=lambda m: (freq(m), -len(m), m))
        heads[root] = head

    # ---- the ranked pool
    #
    # A WORD WHOSE WHOLE FAMILY ONLY EVER POINTS AT ANOTHER WORD IS NOT CHOSEN.
    # `memberitahu` is glossed "to inform" nowhere: every sense of it and of its
    # relatives is a cross-reference, so the card would have carried a headword,
    # a forms row, three sentences and no definition.  `build_deck.py` refuses to
    # write such a card -- and refusing it THERE leaves the level short, because
    # the count has already been struck.  So the same test is applied here, where
    # a refusal costs nothing but the next word in the ranking.
    pool = []
    numerals = []
    for root, head in heads.items():
        if head in EXCLUDE:
            continue
        if compound_numeral(head, byword):
            numerals.append(head)
            continue
        st = state.get(head, ('notword',))[0]
        if st in ('notword', 'nonstandard') and head not in KEEP:
            continue
        if not meanings(head, sorted(fam[root]), byword):
            continue
        total = sum(freq(m) for m in fam[root])
        pool.append((head, total, sorted(fam[root])))
    pool.sort(key=lambda r: (-r[1], r[0]))

    below = words_below()
    pool = [r for r in pool if r[0] not in below]

    # ---- the level: the supplement first, then frequency up to the target
    # A SUPPLEMENT WORD IS FORCED IN, WHICH MEANS IT BYPASSES THE POOL'S OWN
    # CHECKS -- so the meaning test has to be repeated here or a hand-written
    # inventory entry with no usable gloss reaches `build_deck.py`, is refused
    # there, and leaves the level short of its target with nothing said about
    # why.  Rejects are REPORTED rather than dropped quietly: an inventory entry
    # the dictionary cannot gloss is a fault in this file, and the run is where
    # it should surface.
    supp_heads, supp_bad = [], []
    for w in supp:
        h = heads.get(uf.find(w), w)
        if h in supp_heads or h in below or h in EXCLUDE:
            continue
        if not meanings(h, sorted(fam[uf.find(h)]) or [h], byword):
            supp_bad.append(w)
            continue
        supp_heads.append(h)
    chosen = list(supp_heads)
    have = set(chosen)
    for head, _t, _m in pool:
        if len(chosen) >= TARGET[LEVEL]:
            break
        if head not in have:
            have.add(head)
            chosen.append(head)

    # ordered by frequency for output, so the commonest words come first
    chosen.sort(key=lambda w: -freq(w))
    fams = {w: sorted(fam[uf.find(w)]) for w in chosen}
    labelled, hidden, oddlab = {}, collections.Counter(), collections.Counter()
    for w in chosen:
        labelled[w], hid, odd = family_forms(w, fams[w], byword, state)
        for h in hid:
            hidden[h] += 1
        for o in odd:
            oddlab[o] += 1

    # HOW MANY CAME FROM WHICH INPUT IS CARRIED THROUGH, because the deck's own
    # description states it and the split moves a great deal between levels --
    # 378 of level 1's 500 are the inventory's and 200 of level 3's 1,000 are.
    # A sentence written once with level 1's proportion in it would be false at
    # every level after it, which is the fault `SCOPE` records.
    from_supp = len([w for w in supp_heads if w in have])

    json.dump({'words': chosen, 'families': fams, 'forms': labelled,
               'freq': {w: freq(w) for w in chosen},
               'from_inventory': from_supp},
              open(lvlf('wordlist.json'), 'w', encoding='utf-8'), ensure_ascii=False)

    # ------------------------------------------------------------- the numbers
    st_count = collections.Counter(s for s, _b, _k in state.values())
    phr = [w for w in chosen if ' ' in w]
    print(f'    dictionary {len(byword)} words; corpus universe {len(universe)}')
    print(f'    phrases: {len(phrase_est)} estimated at x{factor:.1f} off the '
          f'sentence corpus, {len(phr)} of them chosen')
    for k, v in st_count.most_common():
        print(f'      {v:6d}  {k}')
    print(f'    families {len(fam)}; multi-word families '
          f'{sum(1 for m in fam.values() if len(m) > 1)}')
    if hidden:
        print(f'    kept in the family, off the card ({len(hidden)}): '
              + ', '.join(sorted(hidden)))
    if oddlab:
        print('    form labels this file does not recognise, shown as they '
              'stand: ' + ', '.join(f'{k} x{v}' for k, v in oddlab.most_common()))
    # REPORTED RATHER THAN DROPPED IN SILENCE: a rule that quietly stops firing
    # looks exactly like a rule with nothing to do, and this one is meant to
    # find a handful per level and not a hundred.
    if numerals:
        print(f'    compound numerals not chosen ({len(numerals)}): '
              + ', '.join(sorted(numerals)))
    print(f'    chose {len(chosen)} of a target {TARGET[LEVEL]}: '
          f'{from_supp} from the survival inventory, '
          f'{len(chosen) - from_supp} by frequency')
    if supp_missing:
        print(f'    supplement items the dictionary does not carry '
              f'({len(supp_missing)}): '
              + ', '.join(f'{w}[{s}]' for w, s in supp_missing))
    if supp_bad:
        print(f'    supplement items the dictionary cannot gloss '
              f'({len(supp_bad)}): ' + ', '.join(supp_bad))
    if len(chosen) < TARGET[LEVEL]:
        raise SystemExit(f'    SHORT: {len(chosen)} words for a target of '
                         f'{TARGET[LEVEL]} -- the pool has run out')


if __name__ == '__main__':
    main()
