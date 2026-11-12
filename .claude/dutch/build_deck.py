#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / Hindi / Greek shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is DUTCH -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword, a noun WITH ITS ARTICLE (de or het -- the way Dutch is taught,
    since nothing in the noun itself says which it takes), and Wiktionary's IPA
    beneath it (Dutch spelling is regular but not transparent: ui, ij, g, -en);
  · the meanings, grouped by part of speech, a noun's gender in its label;
  · one line of key forms: a noun's plural and diminutive, an adjective's
    inflected form, comparative and superlative, a verb's past and past
    participle (eten, at, gegeten);
  · a verb's present and past by person, imperative and participles behind a fold;
  · up to three Tatoeba sentences, the word picked out, with a speaker.

The speaker reads the `Say` field: the noun with its article, else the word.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nl import fold, nfc, LETTER
from dutch_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'dutch'
COLOR = '#934F5A'          # the shelf's measured hue (app.js `lang-dutch`)
FIELDS = ['Dutch', 'IPA', 'Word', 'Say', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'prep': 'preposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep_phrase': 'phrase',
            'proverb': 'proverb', 'article': 'article'}
# De (common gender: masculine, feminine or the two merged) or het (neuter).
GENDER = {'m': 'masculine', 'f': 'feminine', 'n': 'neuter', 'c': 'common gender',
          'mf': 'masculine or feminine', 'fm': 'feminine or masculine',
          'mn': 'masculine or neuter', 'nm': 'neuter or masculine',
          'fn': 'feminine or neuter', 'nf': 'neuter or feminine', 'p': 'plural only'}
ARTICLE = {'m': 'de', 'f': 'de', 'c': 'de', 'mf': 'de', 'fm': 'de', 'n': 'het',
           'mn': 'de/het', 'fn': 'de/het', 'nm': 'het/de', 'nf': 'het/de', 'p': 'de'}

SAY = '<span class="uc-tts uc-say" data-say="{{Say}}"></span>'
WORD = ('<div class="uc-word">{{Dutch}}' + SAY + '</div>'
        '{{#IPA}}<div class="uc-ipa">{{IPA}}</div>{{/IPA}}')
ASK = '<div class="uc-ask">Say it in Dutch</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_NL = WORD
BACK_NL = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape
TRAIL = re.compile(r'\s*[:;,]\s*$')


def gloss_text(g):
    return TRAIL.sub('', g)


# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here.
# Each read off the A1 build (2026-11-09):
ETYMS = {
    'meer': ['2', '3'],        # "more" and "anymore", not "lake" (etymology 1)
    'net': ['2'],              # "just", "neat", not "net (mesh)"
    'weer': ['1', '2'],        # "again" AND "weather" -- both are A1
    'bank': ['2', '1'],        # the bank first, then the bench and sofa
    'zijn': ['1', '2'],        # "to be" AND "his, its"
    'zeer': ['3', '1'],        # "very" first, then "sore" (A2, 2026-11-12)
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech, where
# Wiktionary's entry is a grammar note rather than a meaning.
GLOSS = {
    'de': {'article': ['the (with a common-gender noun, and with every plural)']},
    'het': {'article': ['the (with a neuter singular noun)'],
            'pron': ['it', 'there, this, that (as a dummy subject: het regent, "it is raining")']},
    'een': {'article': ['a, an']},
    'zijn': {'verb': ['to be', 'to exist',
                      'have (forming the perfect of some verbs: ik ben gegaan, "I have gone")']},
    'hebben': {'verb': ['to have, to own', 'to have (forming the perfect: ik heb gegeten, '
                        '"I have eaten")']},
    'bank': {'noun': ['bank (a financial institution)', 'bench', 'couch, sofa']},
    'dag': {'noun': ['day', 'daytime'], 'intj': ['hello; goodbye (short for goedendag, "good day")']},
    'één': {'num': ['one (the number, stressed: één kopje, "one cup")']},
    'dat': {'det': ['that (with a neuter noun: dat huis, "that house")'],
            'pron': ['that (that thing)', 'which, that (relative: het boek dat ik lees, '
                     '"the book that I am reading")']},
    'dit': {'det': ['this (with a neuter noun: dit huis, "this house")'],
            'pron': ['this (this thing)']},
    'je': {'pron': ['you (unstressed jij, jou or jullie)', 'yourself'],
           'det': ['your (unstressed jouw)']},
    'we': {'pron': ['we (unstressed wij)']},
    'me': {'pron': ['me (unstressed mij)', 'myself']},
    'meer': {'det': ['more (the comparative of veel)']},
    'waar': {'adv': ['where (in which place)', 'where (the place that)']},
    'ze': {'pron': ['she, her (unstressed zij, haar)', 'they, them (unstressed zij, hen, hun)']},
    'er': {'adv': ['there', 'of it, of them (er zijn er drie, "there are three of them")',
                   'there (as a dummy subject: er is een probleem, "there is a problem")']},
    # A2 (2026-11-12): Wiktionary's entry is "synonym of ondertussen", which prints nothing
    'intussen': {'adv': ['meanwhile, in the meantime']},
    # A2: Wiktionary's only sense is a cat's head-rub; the diminutive of kop is the cup
    'kopje': {'noun': ['cup (for coffee or tea)', 'small head']},
    # A2: Wiktionary files sommige as "inflection of sommig", the form every learner meets
    'sommige': {'det': ['some (sommige mensen, "some people")']},
    # B1: Wiktionary files zulke as "inflection of zulk"
    'zulke': {'det': ['such (zulke mensen, "such people")']},
    # B2: Wiktionary leads with the cloth; the count is the bedsheet
    'laken': {'noun': ['sheet (on a bed)', 'woollen broadcloth']},
    # B2: Wiktionary's senses end in stray gender letters ("fortune n")
    'kapitaal': {'noun': ['capital (money)', 'fortune', 'capital letter']},
    # C1: Wiktionary's entries are only "synonym of ...", which prints nothing
    'inmiddels': {'adv': ['by now, by then', 'meanwhile']},
    'esthetiek': {'noun': ['aesthetics']},
    'luidens': {'prep': ['according to (formal: luidens het rapport, "according to the report")']},
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'pen': 'pen (writing utensil)',      # first listed is "a long feather of a bird"
    'net': 'just, nearly, barely',       # first listed is "clean, tidy"
    'inflatie': 'inflation, increase',   # B2: first listed is "stomach bloat"
    'kijker': 'viewer',                  # B2: first listed is "telescope"
}

# A PART OF SPEECH NOT SHOWN for one word.
DROP_POS = {('de', 'prep'), ('hij', 'noun'), ('zij', 'noun'), ('van', 'noun'),
            ('een', 'num'), ('een', 'noun'), ('één', 'article'), ('één', 'noun'),
            ('pesten', 'noun'), ('chips', 'intj'), ('esthetiek', 'adj')}   # B1: the card game Mau Mau led over "to bully"

# A NUMBER'S NOUN BLOCK ("a four, the digit 4") is noise beside the number: dropped
# wherever the word is also a numeral.

# A GENDER CORRECTED, each with its reason.
GENDER_FIX = {
    # Wiktionary's head line gives "n, f" for the whole entry; the feminine belongs to the
    # "frame" sense, and the window is het raam
    'raam': 'n',
    # B2 (2026-11-12): Wiktionary gives no gender to the two plural-only nouns, and "nc" to
    # kapitaal, whose senses are each marked n
    'chips': 'p', 'gegevens': 'p', 'kapitaal': 'n',
    # C1: "nc" again; the compound takes dioxide's het
    'koolstofdioxide': 'n',
}

# AN IPA CORRECTED: `één` is printed from the entry of `een`, whose transcription is the
# unstressed article's /ən/; the numeral is /eːn/ (Wiktionary's own entry for één).
IPA_FIX = {'één': '/eːn/'}

# NO FORMS LINE: a month's plural and diminutive (`aprilletje`), and adjectives whose
# Wiktionary comparatives are not forms a learner would use (`allener`, `meer oké`).
MONTHS = set('januari februari maart april mei juni juli augustus september oktober '
             'november december'.split())
NO_FORMS = MONTHS | {'alleen', 'oké', 'oranje', 'Nederlands', 'Engels'}

# A GLOSS THAT IS NOT A MEANING: a pointer to another headword or a form label.
# (the phrases deck) Wiktionary's note on an expression's literal sense, "Used other than
# figuratively or idiomatically: see op, die, fiets.", is a pointer too.
NOT_A_MEANING = re.compile(r'^\*?\s*see:|^synonym of |^(?:inflection|plural|diminutive) of \S+$'
                           r'|^used other than figuratively', re.I)


def entries_for(row, lex):
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    ents = [e for e in L['entries'] if any(not g['weak'] and g['g'] for g in e['glosses'])] \
        or L['entries']
    groups = []
    for e in ents:
        if e.get('etym', '') not in groups:
            groups.append(e.get('etym', ''))
    keep = ETYMS.get(L['word'], groups[:1])
    ents = sorted([e for e in ents if e.get('etym', '') in keep],
                  key=lambda e: keep.index(e.get('etym', '')))
    if row['pos']:
        ents = sorted(ents, key=lambda e: e['pos'] != row['pos'])
    word = row['word']
    ents = [e for e in ents if (word, e['pos']) not in DROP_POS]
    if any(e['pos'] == 'num' for e in ents):
        ents = [e for e in ents if e['pos'] != 'noun']
    out, seen = [], {}
    for e in ents:
        if e['pos'] in seen:
            out[seen[e['pos']]]['glosses'] += e['glosses']
            continue
        seen[e['pos']] = len(out)
        out.append(dict(e, glosses=list(e['glosses'])))
    return out[:3]


def english(ents, word=''):
    parts, shown = [], set()
    for e in ents:
        label = POS_NAME.get(e['pos'], e['pos'])
        g = e['gender']
        if e['pos'] == 'noun' and g in GENDER:
            label += ', ' + GENDER[g]
        tv = {t for gl in e['glosses'] for t in gl['tags']}
        if e['pos'] == 'verb':
            if 'transitive' in tv and 'intransitive' not in tv:
                label += ', transitive'
            elif 'intransitive' in tv and 'transitive' not in tv:
                label += ', intransitive'
        gl, seen = [], set()
        for x in e['glosses']:
            if x['weak'] and gl:
                continue
            t = gloss_text(x['g'])
            if NOT_A_MEANING.search(t):
                continue
            if t and t not in seen:
                seen.add(t)
                gl.append(t)
        if e['pos'] in GLOSS.get(word, {}):
            gl = list(GLOSS[word][e['pos']])
        lead = LEAD.get(word)
        if lead:
            gl.sort(key=lambda x: lead not in x)
        gl = gl[:3]
        if not gl or all(x in shown for x in gl):
            continue
        shown.update(gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label)}</div>{body}</div>')
    return ''.join(parts)


# ---- forms -----------------------------------------------------------------------------
# a cell carrying one of these is a real form but not the one a learner is taught first:
# the archaic and Flemish rows, the formal `u` rows (which repeat the jij row), the
# subjunctive, and a separable verb's subordinate-clause spelling (the main clause's
# `sta op` is shown; `opstaat` is the same verb in a different word order)
SKIP = {'archaic', 'dated', 'rare', 'obsolete', 'dialectal', 'Flanders', 'colloquial', 'formal',
        'majestic', 'subjunctive', 'subordinate-clause'}


def cell(table, *need):
    for t in table:
        tags = set(t['t'])
        if all(n in tags for n in need) and not (tags & SKIP):
            return t
    return None


def fi(label, form):
    if not form:
        return ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(form)}</span>'


def forms_line(e, word):
    tb, hd = e['table'], e.get('head', {})
    bits = []
    if e['pos'] == 'noun':
        if hd.get('plural') and fold(hd['plural']) != fold(word):
            bits.append(fi('plural', hd['plural']))
        if hd.get('diminutive'):
            bits.append(fi('diminutive', hd['diminutive']))
    elif e['pos'] == 'adj':
        inf = cell(tb, 'definite', 'positive')
        if inf and fold(inf['f']) != fold(word):
            bits.append(fi('inflected', inf['f']))
        bits.append(fi('comparative', hd.get('comparative')))
        bits.append(fi('superlative', hd.get('superlative')))
    elif e['pos'] == 'verb':
        past = cell(tb, 'past', 'singular', 'first-person')
        pp = cell(tb, 'participle', 'past')
        bits.append(fi('past', past and past['f']))
        bits.append(fi('past participle', pp and pp['f']))
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


def row(label, t):
    if not t:
        return ''
    return (f'<div class="uc-cjr"><span class="uc-cj-p">{E(label)}</span>'
            f'<span class="uc-cj-f">{E(t["f"])}</span></div>')


def block(head, rows):
    rows = [r for r in rows if r]
    if not rows:
        return ''
    return f'<div class="uc-cj"><div class="uc-cjh">{E(head)}</div>{"".join(rows)}</div>'


PERSONS = [('ik', ('first-person', 'singular')), ('jij', ('second-person', 'singular')),
           ('hij, zij, het', ('third-person', 'singular')), ('wij, jullie, zij', ('plural',))]


def table_html(e):
    tb = e['table']
    if not tb or e['pos'] != 'verb':
        return ''
    blocks = [
        block('present', [row(p, _pc(tb, 'present', need)) for p, need in PERSONS]),
        block('past', [row(p, _pc(tb, 'past', need)) for p, need in PERSONS]),
        block('imperative', [row('to one or many', cell(tb, 'imperative', 'singular'))]),
        block('participles', [row('present', cell(tb, 'participle', 'present')),
                              row('past', cell(tb, 'participle', 'past'))]),
    ]
    blocks = [b for b in blocks if b]
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>' if blocks else ''


def _pc(tb, tense, need):
    for t in tb:
        tags = set(t['t'])
        if tense in tags and all(n in tags for n in need) and 'imperative' not in tags \
                and 'participle' not in tags and not (tags & SKIP):
            return t
    return None


# ---- examples --------------------------------------------------------------------------
SPLIT = re.compile(rf"([{LETTER}]+(?:['’\-][{LETTER}]+)*)")


def mark(sentence, hits):
    hs = set(hits)
    out = []
    for piece in SPLIT.split(sentence):
        if piece and fold(piece) in hs:
            out.append(f'<b>{E(piece)}</b>')
        else:
            out.append(E(piece))
    return ''.join(out)


def examples_html(exs):
    out = []
    for nl, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(nl)}"></span>{mark(nl, hits)}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>')
    return ''.join(out)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        main = ents[0]
        word = r['word']
        ipa = IPA_FIX.get(word) or main['ipa'] or next((e['ipa'] for e in ents if e['ipa']), '')
        if word in GENDER_FIX:
            ents = [dict(e, gender=GENDER_FIX[word]) if e['pos'] == 'noun' else e for e in ents]
            main = ents[0]
        art = ARTICLE.get(main['gender'], '') if main['pos'] == 'noun' else ''
        head = (f'<span class="uc-art">{E(art)}</span> ' if art else '') + E(word)
        ex = exs.get(r['key'], [])
        cards.append({'sub': r.get('sub', ''), 'fields': {
            'Dutch': head,
            'IPA': E(ipa),
            'Word': word,
            'Say': (art.split('/')[0] + ' ' if art else '') + word,
            'English': english(ents, word),
            'Forms': '' if word in NO_FORMS else forms_line(main, word),
            'Table': table_html(main),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex), 'ipa': bool(ipa), 'sub': r.get('sub', ''),
                        'count': r.get('count', 0)})
    return cards, entries


def desc(entries, n):
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    ex3 = sum(1 for e in entries if e['examples'] == 3)
    ex0 = sum(1 for e in entries if e['examples'] == 0)
    nouns = sum(1 for e in entries if e['pos'] == 'noun')
    verbs = sum(1 for e in entries if e['pos'] == 'verb')
    SC = SCOPE[LEVEL]
    EX_NOTE = ('Every word carries three real example sentences' if ex3 == n else
               f'Real example sentences come with {n - ex0} of the {n} words, three apiece for '
               f'{ex3} of them')
    return (
        "Both study directions in one deck: Dutch → English (see the Dutch, recall the meaning) "
        "and English → Dutch (see an English meaning, recall the Dutch). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words of Dutch for {'a beginner' if LEVEL == 'a1' else 'an elementary learner' if LEVEL == 'a2' else 'an intermediate learner' if LEVEL == 'b1' else 'an upper-intermediate learner' if LEVEL == 'b2' else 'an advanced learner'}, aligned to {LEVEL.upper()} of the "
        f"Common European Framework of Reference, whose global descriptor begins '{SC['quote']}' — "
        f"a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: Dutch has examinations at these levels — "
        "the inburgeringsexamen, the Staatsexamen NT2 and the CNaVT — but no graded word list for "
        "them was found published, so this deck is not any examination's vocabulary and does not "
        f"claim to be. It is assembled from two things that can be stated. {from_inv} of the {n} "
        f"come from a vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words of everyday Dutch, taken from a "
        "frequency list built from film and television subtitles and counted by the WHOLE word, "
        "every form of a verb or an adjective added together. The cards are dealt by that "
        "frequency, so the words you meet most often come first. "
        "Every headword has its pronunciation beneath it in the International Phonetic Alphabet, "
        f"Wiktionary's own. The {nouns} nouns are printed with their article — de or het — because "
        "nothing in a Dutch noun says which it takes, and they show their plural and diminutive; "
        f"the {verbs} verbs show their past and past participle (eten, at, gegeten), and behind "
        "the All forms fold their present and past by person, imperative and participles. "
        + EX_NOTE + ", with the word picked out in colour and a speaker beside the sentence and the "
        "headword. Sources. Level: the Common European Framework of Reference (Council of Europe), "
        "global scale. Meanings, gender, forms and pronunciation: English Wiktionary, via the "
        "kaikki.org extraction (CC BY-SA 4.0). Frequency: a word list built from OpenSubtitles "
        "(hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), "
        "CC BY 2.0 FR."
    )


def desc_phr(entries, n):
    by = {s: [e for e in entries if e['sub'] == s] for s in ('Phrases', 'Idioms', 'Proverbs')}
    ex3 = sum(1 for e in entries if e['examples'] == 3)
    ex0 = sum(1 for e in entries if e['examples'] == 0)
    found = sum(1 for e in entries if e['count'])
    eg = lambda s: ', '.join(e['word'] for e in by[s][:3])
    return (
        f"{n} Dutch set phrases, idioms and proverbs, in three subdecks: {len(by['Phrases'])} "
        f"everyday phrases, {len(by['Idioms'])} idioms and {len(by['Proverbs'])} proverbs. Both study "
        "directions come as two cards of one expression — Dutch → English (see the Dutch, recall the "
        "meaning) and English → Dutch (see an English meaning, recall the Dutch) — each with a schedule "
        "of its own. This is a companion to the five level decks, Dutch A1 to C1, and not one of them: "
        "a level is a list of words, and an expression is a unit a list of words cannot see. Nothing "
        "here is taught by any of the five, so the two can be studied together without repeating an "
        "entry. The PHRASES are the expressions Wiktionary files as phrases and does not mark as "
        f"idiomatic — mostly the everyday formulas a Dutch speaker uses as one piece ({eg('Phrases')} …), "
        "with the greetings for the holidays and some sayings Wiktionary files the same way. The IDIOMS "
        f"are expressions whose meaning is not their words' ({eg('Idioms')} …), and the PROVERBS the "
        f"sayings Wiktionary files as proverbs ({eg('Proverbs')} …). Only expressions made of Dutch words "
        "are here: the Latin and French tags Dutch writing borrows (in vitro, mea culpa) are left out. "
        "Within each subdeck the expressions come in the order of how many of Tatoeba's Dutch sentences "
        "contain them — an expression that is a verb being counted with its verb in any form and in "
        "either place, since a Dutch main clause moves the verb away from the rest (in de war zijn: "
        f"ik ben helemaal in de war) — and only {found} of the {n} are found there at all; the rest "
        "follow in the order of how common their words are in film and television subtitles. Every "
        "expression has Wiktionary's pronunciation beneath it where Wiktionary gives one. "
        f"Real example sentences come with {n - ex0} of the {n} expressions, three apiece for {ex3}, "
        "with the expression picked out in colour and a speaker beside the sentence and the headword. "
        "Sources. Expressions, meanings, pronunciation and the idiom and proverb labels: English "
        "Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Order: Tatoeba (tatoeba.org), "
        "CC BY 2.0 FR, then a word list built from OpenSubtitles (hermitdave/FrequencyWords, CC BY-SA "
        "4.0). Example sentences: Tatoeba, CC BY 2.0 FR."
    )


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    exs = json.load(open(f('examples.json'), encoding='utf-8'))
    cards, entries = build(rows, lex, exs)
    DECK = DECK_IDS[LEVEL]
    for i, c in enumerate(cards, 1):
        c['id'] = f'u_{DECK}_{i}'
        c['type'] = TYPE_ID
    n = len(cards)
    if LEVEL == 'phr':
        by = {k: sum(1 for e in entries if e['sub'] == k) for k in ('Phrases', 'Idioms', 'Proverbs')}
        subtitle = (f"{n} expressions · {by['Phrases']} everyday, {by['Idioms']} idioms, "
                    f"{by['Proverbs']} proverbs · both directions")
        description = desc_phr(entries, n)
        tags = ['dutch', 'phrases', 'idioms', 'proverbs']
    else:
        subtitle = f'{n} words · both directions, as two cards per word'
        description = desc(entries, n)
        tags = ['dutch', 'vocabulary', LEVEL, NAMES[LEVEL].lower()]
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': subtitle,
        'desc': description, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': tags,
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Dutch vocabulary', 'speechLang': 'nl-NL',
            'fields': FIELDS,
            'cards': [
                {'name': 'Dutch → English', 'front': FRONT_NL, 'back': BACK_NL},
                {'name': 'English → Dutch', 'front': FRONT_EN, 'back': BACK_EN},
            ],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}

    # EVERY ENGLISH SIDE UNIQUE, LAST OF ALL -- the shelf-wide pass (`.claude/dedupe-glosses.py`).
    import importlib.util as ilu
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dedupe-glosses.py')
    spec = ilu.spec_from_file_location('dedupe_glosses', p)
    dg = ilu.module_from_spec(spec)
    spec.loader.exec_module(dg)
    st = dg.dedupe(deck, 'Dutch')
    if st['groups']:
        print('  labelled %d notes in %d groups that shared an English side'
              % (st['labelled'], st['groups']))

    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                       '..', '..', 'decks', DECK_FILES[LEVEL]))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out)
    print(f'  notes {n} = cards {n * 2} | bytes {os.path.getsize(out)}')
    json.dump(entries, open(f('entries.json'), 'w', encoding='utf-8'), ensure_ascii=False)


if __name__ == '__main__':
    main()
