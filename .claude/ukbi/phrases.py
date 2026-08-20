#!/usr/bin/env python3
"""Choose the phrases and expressions, and write them as a level's wordlist.

    python3 phrases.py            # run from the cache, with UKBI_LEVEL=p

This is `select.py`'s sibling and it answers a different question.  `select.py`
picks the commonest WORDS a level's descriptor calls for; this picks the
multi-word EXPRESSIONS the seven levels leave behind, and it picks them on what
the dictionary says about them rather than on what a frequency list can measure.

WHY THE LEVELS CANNOT REACH THESE, which is what makes a deck of them worth
building at all.  A level is filled from a frequency list, and **a phrase cannot
appear in a segmented frequency list**: every segmenter treats `kambing hitam`
as `kambing` and `hitam`.  The levels' 375 phrases got in by being counted in
Tatoeba instead, under a floor (`PHRASE_MIN`) that exists because one occurrence
in 28,192 sentences is not a frequency.  Everything below that floor -- which is
most of the idioms and nearly all of the proverbs -- was never selectable by any
level, however well known it is.

THE SELECTION IS THE DICTIONARY'S OWN CLASSIFICATION, NOT A JUDGEMENT MADE HERE.
Every rule below is a statement Wiktionary makes about the entry, because the
alternative -- deciding by eye which multi-word strings are "expressions" -- is
the fabrication this project refuses.  Six things it settled:

**THE `phrase` PART OF SPEECH IS A TRAP AND MOST OF ITS ENTRIES ARE NOT
INDONESIAN.**  Of the 186 entries filed under it, the commonest are `de facto`,
`primus inter pares`, `ad hominem`, `s'il vous plaît` and `en route` -- Latin and
French that English Wiktionary files under Indonesian because Indonesian uses
them.  A deck of "common Indonesian phrases" full of French would be exactly the
quiet wrongness this generator keeps recording.  The dictionary marks them
itself, two ways: the etymology says **"Unadapted borrowing"** or **"Learned
borrowing"** (159 entries), and the category says **`Indonesian
internationalisms`** (20 more).  Neither is a guess.

**AND IT CARRIES MISSPELLINGS.**  `terimah kasih` and `selamat tinngal` are
entries in their own right, tagged `misspelling`, and a deck for a test that
marks `dimana` wrong must not teach them.  107 candidates go on a tag.

**WHAT THE DICTIONARY MARKS AS AN EXPRESSION IS TAKEN WHATEVER THE CORPUS SAYS,
AND THAT IS THE RULE THE WHOLE DECK RESTS ON.**  Measured over both corpora
(44,235 sentences of Tatoeba and Global Voices): only **9 of 38 idioms and 8 of
46 proverbs occur even once**.  Filtering those on use would delete the deck's
subject.  It is the Mandarin deck's own finding -- of 5,227 non-syllabus chengyu
only 361 are in Tatoeba at all, an idiom being literary where the corpus is
conversational -- so a corpus that does not contain a proverb is not evidence
about the proverb.  `Indonesian proverbs`, a sense tagged `idiomatic` or
`figuratively`, and `Indonesian phrasebook` are each the dictionary saying "this
is an expression", and each is enough on its own.

**WHERE ONLY THE PART OF SPEECH SUGGESTS IT, THE CORPUS MUST SHOW IT IN USE.**
`phrase`, `intj` and `prep_phrase`, and the multi-word verb and function
phrases, are a weak signal -- the same pool holds `atas nama` (24 occurrences)
and `ala ayuning dewasa` (a Javanese formula, none).  There use is the only
corroboration there is, so an unmarked candidate needs at least one.  It costs
89 of 110 and 86 of 120, and every one it costs is a string nobody says.

**A COMPOUND NOUN IS VOCABULARY, NOT AN EXPRESSION.**  5,435 of the untaught
multi-word entries are nouns like `tahun cahaya` and `kaki seribu`, and a deck
of phrases that swallowed them would be a second vocabulary deck.  A noun is
taken only where the dictionary has separately marked it an expression, which is
what keeps `kambing hitam` -- tagged `idiomatic`, glossed `scapegoat`.

**A SUBJECT CATEGORY WAS TRIED AS A TERM-OF-ART FILTER AND REFUSED.**  The
loose pool holds `tahun cahaya` (a light year, filed `Astronomy`) and
`faktor persekutuan terbesar` (`Mathematics`), which are terms rather than
expressions, and dropping every entry carrying a subject category is the obvious
rule.  Measured over the chosen list, 37 carry one and most of them are exactly
what the deck is for: `selamat makan` is filed under `Meals`, `atas nama` under
`Law`, `kuda troya` under `Computer security`, `saham gorengan` under
`Stock market`, `balik kanan` under `Drill commands`.  The rule costs far more
than it saves, so it is not applied and the first subdeck is named for what it
actually holds instead.

**AND THE PROVERB VARIANTS DEDUPLICATE THEMSELVES.**  `di mana bumi dipijak, di
situ langit dijunjung` has SEVEN spellings in the dictionary, differing in
`bumi`/`tanah`, `dipijak`/`diinjak` and `di situ`/`di sana`; six of them are
glossed `synonym of` the seventh.  Shipped as they stand that is seven cards
carrying one proverb and one meaning.  A candidate whose only gloss points at
another candidate is dropped in favour of the target -- the dictionary naming
its own canonical form.
"""
import json, os, re, collections, glob

from ukbi_level import LEVEL, f as lvlf

DECKS = os.path.abspath(os.path.join('..', '..', 'decks'))
RAW = 'kaikki-id.jsonl'

# The three subdecks, in the order a learner meets them: what you would say,
# then what you would have to be told, then what you would have to be taught.
# THE FIRST SUBDECK IS `Phrases` AND NOT `Everyday expressions`, which is a
# correction rather than a preference.  It holds whatever the dictionary files
# as a phrase, an interjection or a verb phrase and a corpus shows in use, and
# that includes `tahun cahaya` -- a light year, which is a set phrase and is not
# everyday.  A label the contents do not answer to is the fault `SCOPE` records
# one file up; `Phrases`, `Idioms`, `Proverbs` is three labels each of which is
# true of everything under it.
EVERYDAY, IDIOM, PROVERB = 'Phrases', 'Idioms', 'Proverbs'
KIND_ORDER = [EVERYDAY, IDIOM, PROVERB]

# Parts of speech that can hold an expression.  `noun` and `name` are absent on
# purpose -- see the header -- and reached only through a marked sense.
PHRASE_POS = {'phrase', 'intj', 'prep_phrase', 'proverb'}
GRAMMAR_POS = {'verb', 'adv', 'prep', 'conj', 'pron', 'det', 'adj'}

# Tags that say the entry is not a phrase to teach: a misspelling, a variant of
# something else, an abbreviation, or a form the language has stopped using.
DROP_TAG = {'misspelling', 'alt-of', 'abbreviation', 'initialism',
            'obsolete', 'archaic'}
# …and the register filter, kept in step with `select.py`'s `entry_nonstandard`
# and `build_deck.sense_refused`: `formal` beside a nonstandard tag is the
# source disagreeing with itself, and the tag naming the register UKBI examines
# is the one to believe.
NONSTANDARD = {'slang', 'colloquial', 'informal', 'dialectal', 'nonstandard',
               'vulgar', 'derogatory'}

SYN = re.compile(r'^(?:synonyms?|alternative (?:form|spelling)) of\s+(.+?)\.?$', re.I)
# A gloss that only names another form -- `passive of beri tahu`, `plural of X`.
# Kept in step with `build_deck.REL`, which refuses to card one.
REL = re.compile(r'^(?:\w+\s+)?(?:active|passive|actor focus|patient focus|plural'
                 r'|singular|basic form|root form|informal form|misspelling'
                 r'|alternative form|alternative spelling|synonym|abbreviation)'
                 r'\s+of\s+', re.I)

# LANGUAGES A MULTI-WORD ENTRY CAN ONLY HAVE COME FROM WHOLE.  `in situ` says
# merely "Borrowed from Latin", with no `Unadapted` and no internationalism
# category, so the two rules above miss it; a phrase borrowed entire from one of
# these is a foreign phrase used in Indonesian rather than an Indonesian one.
# A CALQUE IS THE OPPOSITE AND IS KEPT: `tahun cahaya` is a calque of Dutch
# `lichtjaar` and is made of two Indonesian words, which is what a calque means.
FOREIGN = re.compile(r'[Bb]orrowed from (?:New )?'
                     r'(Latin|French|Italian|German|Ancient Greek|Portuguese)')


def cats(rs):
    out = set()
    for r in rs:
        for c in (r.get('categories') or []):
            out.add(c.get('name') if isinstance(c, dict) else c)
        for s in (r.get('senses') or []):
            for c in (s.get('categories') or []):
                out.add(c.get('name') if isinstance(c, dict) else c)
    return out


def sense_tags(rs):
    out = set()
    for r in rs:
        for s in (r.get('senses') or []):
            out |= set(s.get('tags') or [])
    return out


def taught_words():
    """Every word the seven shipped levels teach, read off the decks themselves.

    Off the DECKS rather than off a working file, exactly as `words_below` does,
    so the exclusion cannot drift from what a reader actually has.
    """
    out = set()
    for p in sorted(glob.glob(os.path.join(DECKS, 'UKBI-[1-7]-*.folio-deck.json'))):
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            out.add(c['fields']['Word'])
    return out


def corpus_counts(words):
    """How often each phrase occurs in the two sentence corpora already here.

    A count rather than a rank: the subtitle frequency list this generator
    orders its levels by is SEGMENTED and cannot see a phrase at all.
    """
    blob = []
    for ln in open('ind_sent.tsv', encoding='utf-8'):
        p = ln.split('\t')
        if len(p) > 2:
            blob.append(p[2])
    tat = len(blob)
    blob += [l.rstrip('\n') for l in open('gv.id', encoding='utf-8')]
    hay = '\n'.join(blob).lower()
    return {w: hay.count(w.lower()) for w in words}, tat


def main():
    taught = taught_words()
    by = collections.defaultdict(list)
    for line in open(RAW, encoding='utf-8'):
        r = json.loads(line)
        if r.get('lang_code') == 'id' and ' ' in r.get('word', ''):
            by[r['word']].append(r)

    drops = collections.Counter()
    kind, glosses = {}, {}
    for w, rs in by.items():
        if w in taught:
            drops['already taught by a level'] += 1
            continue
        ety = ' '.join(r.get('etymology_text') or '' for r in rs)
        cs, tags = cats(rs), sense_tags(rs)
        if (('nadapted borrowing' in ety or 'earned borrowing' in ety
             or FOREIGN.search(ety)) and 'alque' not in ety):
            drops['a foreign phrase, the etymology says so'] += 1
            continue
        if 'Indonesian internationalisms' in cs:
            drops['an internationalism, the category says so'] += 1
            continue
        if tags & DROP_TAG:
            drops['a misspelling, variant or dead form'] += 1
            continue
        if (tags & NONSTANDARD) and 'formal' not in tags:
            drops['outside the standard language UKBI tests'] += 1
            continue
        marked = ('Indonesian proverbs' in cs or 'Indonesian phrasebook' in cs
                  or bool(tags & {'idiomatic', 'figuratively'}))
        loose = any(r['pos'] in PHRASE_POS | GRAMMAR_POS for r in rs)
        if not (marked or loose):
            drops['a compound noun rather than an expression'] += 1
            continue
        if 'Indonesian proverbs' in cs:
            kind[w] = PROVERB
        elif tags & {'idiomatic', 'figuratively'}:
            kind[w] = IDIOM
        else:
            kind[w] = EVERYDAY
        kind[w] = (kind[w], marked)
        glosses[w] = [(s.get('glosses') or [''])[0] for r in rs
                      for s in (r.get('senses') or [])]

    # THE VARIANTS NAME THEIR OWN CANONICAL FORM.  A candidate every one of
    # whose glosses points at another candidate is that one wearing a different
    # spelling, and shipping both is two cards with one meaning.
    aliased = {}
    for w, gs in list(glosses.items()):
        real = [g for g in gs if g.strip()]
        if not real:
            continue
        tgts = {SYN.match(g.strip()).group(1).strip() for g in real if SYN.match(g.strip())}
        if len(tgts) == 1 and len(tgts) == len(set(real)) and tgts != {w}:
            t = tgts.pop()
            if t in kind or t in taught:
                aliased[w] = t
    # how many spellings the worst-served proverb has, counted: the description
    # names it, and `di mana bumi dipijak…` having seven is a fact about this
    # dump rather than a constant.
    tally = collections.Counter(aliased.values())
    variants = (max(tally.values()) + 1) if tally else 0
    for w in aliased:
        kind.pop(w, None)
        drops['a spelling variant of another entry'] += 1

    # …AND A FORM IS NOT AN EXPRESSION.  `diberi tahu` is glossed "passive of
    # beri tahu" and `direka ulang` "passive of reka ulang": the phrase is
    # already in the deck and this is one of its inflections, so carding it is
    # the same word twice.  `build_deck` would refuse it anyway -- it cards no
    # meaning at all -- but refusing it HERE keeps the counts honest.
    for w in [w for w in kind if all(REL.match((g or '').strip())
                                     for g in glosses[w] if (g or '').strip())
              and any((g or '').strip() for g in glosses[w])]:
        kind.pop(w, None)
        drops['an inflected form of another entry'] += 1

    # A CANDIDATE WITH NO MEANING IS NOT A CARD.  `build_deck` refuses one --
    # `jalur belakang` is tagged `no-gloss` and has none -- and refusing it here
    # instead keeps the wordlist and the shipped deck agreeing about the count.
    for w in [w for w in kind if not any((g or '').strip() for g in glosses[w])]:
        kind.pop(w, None)
        drops['no meaning in the dictionary at all'] += 1

    cnt, tatoeba_n = corpus_counts(list(kind))
    # AN UNMARKED CANDIDATE MUST BE SHOWN IN USE; a marked one need not be.
    chosen = []
    for w, (k, marked) in kind.items():
        if marked or cnt[w] >= 1:
            chosen.append(w)
        else:
            drops['unmarked and never used in either corpus'] += 1

    # Commonest first inside each subdeck, which is the levels' own convention.
    # Below a handful of occurrences the count has stopped ranking anything and
    # the order falls back on the alphabet; the deck's description says so.
    order = {k: i for i, k in enumerate(KIND_ORDER)}
    chosen.sort(key=lambda w: (order[kind[w][0]], -cnt[w], w))

    # THE MARKED SENSE GOES FIRST, AND IT IS DONE AS DATA RATHER THAN AS CODE.
    # Wiktionary lists `kambing hitam` as "black goat" and then "scapegoat", and
    # `meja hijau` as "green desk" and then "court" -- the literal reading of an
    # idiom before the idiom.  `build_deck` takes the dictionary's own order,
    # which is right everywhere else and is exactly backwards on an idioms card:
    # a card glossed "black goat" teaches the words the expression is made of
    # instead of what it means.
    #
    # The literal sense is KEPT, because it is what makes the metaphor legible;
    # only the order moves, and it moves in `wikt-p.json` rather than in
    # `build_deck.py`.  That file is shared with all seven levels and has to
    # stay byte-identical for them, so the reordering is written into this
    # level's own copy of the dictionary and the card builder is untouched.
    # It rewrites this level's own copy of the dictionary IN PLACE, so it has
    # to be idempotent -- and the number it reports is the STATE rather than
    # the change, or a second run over the same cache would print 0 and read
    # exactly like a rule that had stopped firing.
    MARK = {'idiomatic', 'figuratively'}
    wikt = json.load(open(lvlf('wikt.json'), encoding='utf-8'))
    want, marked_first = set(chosen), 0
    for e in wikt:
        if e['w'] not in want or len(e.get('s') or []) < 2:
            continue
        first = [x for x in e['s'] if MARK & set(x.get('tags') or [])]
        if not first:
            continue
        if not MARK & set(e['s'][0].get('tags') or []):
            e['s'] = first + [x for x in e['s'] if x not in first]
        marked_first += 1
    json.dump(wikt, open(lvlf('wikt.json'), 'w', encoding='utf-8'), ensure_ascii=False)

    fams = {w: [w] for w in chosen}          # an expression has no affix family
    json.dump({'words': chosen, 'families': fams,
               'forms': {w: [[w, 'root']] for w in chosen},
               'freq': {w: cnt[w] for w in chosen},
               'from_inventory': 0},
              open(lvlf('wordlist.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    # THE DROP COUNTS TRAVEL WITH THE LIST.  The deck's description says how
    # many foreign phrases and compound nouns were left out and why, and a
    # figure typed into that prose is a figure that goes stale the next time
    # the dictionary is refreshed -- the fault `SCOPE` records one file up.
    json.dump({'kinds': {w: kind[w][0] for w in chosen},
               'drops': dict(drops),
               'variants': variants,
               'tatoeba': tatoeba_n},
              open(lvlf('kinds.json'), 'w', encoding='utf-8'), ensure_ascii=False)

    per = collections.Counter(kind[w][0] for w in chosen)
    print(f'    {marked_first} entries carry both a literal and a figurative '
          'sense; the figurative one is put first')
    print(f'    {len(by)} multi-word entries; {len(chosen)} expressions chosen')
    for k in KIND_ORDER:
        ws = [w for w in chosen if kind[w][0] == k]
        used = sum(1 for w in ws if cnt[w])
        print(f'      {k:22} {per[k]:4}   {used} of them used in a corpus')
    for k, v in drops.most_common():
        print(f'      dropped: {k:48} {v}')


if __name__ == '__main__':
    main()
