#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Hindi shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is GREEK -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword, a noun WITH ITS ARTICLE (ο, η, το -- the way Greek is taught,
    since the article is the gender and every adjective, article and pronoun
    agrees with it), and Wiktionary's ROMANISATION beneath it;
  · the meanings, grouped by part of speech, a noun's gender in its label;
  · one line of key forms: a noun's genitive and plural, an adjective's
    feminine and neuter, a verb's simple past and simple future -- where a Greek
    verb changes stem (τρώω, έφαγα, θα φάω);
  · the forms tables behind a fold (a verb's present, simple past, imperfect,
    future and imperative by person; a noun's four cases; an adjective's,
    article's or pronoun's by gender);
  · up to three Tatoeba sentences, the word picked out, with a speaker.

The speaker reads the `Say` field: the noun with its article, else the word.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gr import fold, nfc, translit
from greek_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'greek'
COLOR = '#6F69D2'
FIELDS = ['Greek', 'Roman', 'Word', 'Say', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'prep': 'preposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep_phrase': 'phrase',
            'proverb': 'proverb', 'article': 'article'}
GENDER = {'m': 'masculine', 'f': 'feminine', 'n': 'neuter', 'mf': 'masculine or feminine',
          'fm': 'feminine or masculine', 'mn': 'masculine or neuter', 'nm': 'neuter or masculine',
          'fn': 'feminine or neuter', 'nf': 'neuter or feminine'}
ARTICLE = {'m': 'ο', 'f': 'η', 'n': 'το', 'mf': 'ο/η', 'fm': 'η/ο',
           'mp': 'οι', 'fp': 'οι', 'np': 'τα'}
ART_ROMAN = {'ο': 'o', 'η': 'i', 'το': 'to', 'ο/η': 'o/i', 'η/ο': 'i/o', 'οι': 'oi', 'τα': 'ta'}

SAY = '<span class="uc-tts uc-say" data-say="{{Say}}"></span>'
WORD = ('<div class="uc-word">{{Greek}}' + SAY + '</div>'
        '{{#Roman}}<div class="uc-rom">{{Roman}}</div>{{/Roman}}')
ASK = '<div class="uc-ask">Say it in Greek</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_EL = WORD
BACK_EL = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape
TRAIL = re.compile(r'\s*[:;,]\s*$')


def gloss_text(g):
    return TRAIL.sub('', g)


# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here.  Where the
# first etymology is NOT the everyday word, or two are, the card names which -- each
# read off the A1 build (2026-11-09):
ETYMS = {
    'σε': ['2', '1'],          # "to, at, in" AND "you" (the pronoun is etymology 1)
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech: the particles'
# entries are grammar notes ("added before the dependent or present verb forms to form
# the different subjunctive moods ..."), `κρατάω`'s senses are its passive's headwords,
# `γυρνάω`'s a pointer, and `έχω`'s first a paragraph.
GLOSS = {
    'ο': {'article': ['the (the definite article: ο masculine, η feminine, το neuter)']},
    'να': {'particle': ['to, that (before a verb: θέλω να φάω, "I want to eat")',
                        'let, may (in wishes and suggestions)']},
    'θα': {'particle': ['will, shall (before a verb, the future: θα φάω, "I will eat")',
                        'would (with the past: θα έτρωγα, "I would eat")']},
    'ας': {'particle': ["let's, let (before a verb: ας φάμε, \"let's eat\")"]},
    'έχω': {'verb': ['to have, to own, to hold', 'to feel (pain, hunger, a fever)',
                     'have (forming the perfect: έχω φάει, "I have eaten")']},
    'κρατάω': {'verb': ['to hold, to keep', 'to last', 'to book, to reserve']},
    'γυρνάω': {'verb': ['to turn', 'to return, to come back', 'to wander, to go round']},
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'αγορά': 'market',         # first listed is the ancient agora
    'χώρα': 'country',        # first listed is "main town or village"
    'αμάξι': 'car',           # first listed is "horse carriage"
    'σύζυγος': 'spouse',      # first listed is "yokefellow"
}

# A PART OF SPEECH NOT SHOWN for one word: a block that is noise beside the word a
# beginner meets (`μου` "moo", `εγώ` "ego", `δύο` "a two at cards").
DROP_POS = {('μου', 'intj'), ('εγώ', 'noun'), ('δύο', 'noun')}

# A GLOSS THAT IS NOT A MEANING: a pointer to another headword ("see: βρίσκομαι",
# "synonym of γυρίζω"), a form label ("nominative/accusative/vocative plural of μέσο"),
# or one of Wiktionary's sense-group headers ("Plant and fruit senses.").
NOT_A_MEANING = re.compile(
    r'^\*?\s*see:|^synonym of |senses\.?$|^(?:nominative|genitive|accusative|vocative|'
    r'first|second|third)[^;]* of \S+(?: \([^)]*\))?$', re.I)


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
    ents = [e for e in ents if (L['word'], e['pos']) not in DROP_POS]
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
        if e['pos'] == 'verb' and word.endswith(('μένος', 'μενος')):
            label = 'adjective (a participle)'      # χαρούμενος, filed as a verb form
        g = e['gender']
        if e['pos'] == 'noun' and g.rstrip('p') in GENDER:
            label += ', ' + GENDER[g.rstrip('p')] + (', plural' if g.endswith('p') else '')
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
RARE = ('archaic', 'dated', 'rare', 'obsolete', 'Katharevousa', 'dialectal')


def cell(table, *need, skip=()):
    for t in table:
        tags = set(t['t'])
        if all(n in tags for n in need) and not (tags & (set(skip) | set(RARE))):
            return t
    return None


def cells(table, *need, skip=()):
    """Every listed form of one cell, at most two, joined (`το / τον`, `τρώνε / τρων`):
    Wiktionary lists both where Greek has both, and the table shows what it lists."""
    got = []
    for t in table:
        tags = set(t['t'])
        if all(n in tags for n in need) and not (tags & (set(skip) | set(RARE))) \
                and t['f'] not in [g['f'] for g in got]:
            got.append(t)
    if not got:
        return None
    got = got[:2]
    return {'f': ' / '.join(g['f'] for g in got), 'r': ' / '.join(g['r'] for g in got), 't': got[0]['t']}


def vcells(tb, *need, skip=()):
    return cells(tb, 'active', *need, skip=skip) or cells(tb, *need, skip=skip + ('active',))


def vcell(tb, *need, skip=()):
    """A verb cell: the active voice first, then whatever voice the verb has (a deponent
    like έρχομαι is all 'passive' in form)."""
    return cell(tb, 'active', *need, skip=skip) or cell(tb, *need, skip=skip + ('active',))


def fi(label, t):
    if not t:
        return ''
    return (f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(t["f"])}'
            f'<span class="uc-fr">{E(t["r"])}</span></span>')


def forms_line(e, word):
    tb = e['table']
    if not tb:
        return ''
    bits = []
    if e['pos'] == 'noun':
        gs = cell(tb, 'genitive', 'singular')
        np_ = cell(tb, 'nominative', 'plural')
        bits.append(fi('genitive', gs))
        if np_ and fold(np_['f']) != fold(word):
            bits.append(fi('plural', np_))
    elif e['pos'] == 'adj':
        fe = cell(tb, 'feminine', 'nominative', 'singular')
        ne = cell(tb, 'neuter', 'nominative', 'singular')
        if fe and fold(fe['f']) != fold(word):
            bits.append(fi('feminine', fe))
        if ne and fold(ne['f']) != fold(word):
            bits.append(fi('neuter', ne))
    elif e['pos'] == 'verb':
        bits.append(fi('past', vcell(tb, 'past', 'perfective', 'indicative', 'first-person', 'singular')))
        bits.append(fi('future', vcell(tb, 'future', 'perfective', 'first-person', 'singular')))
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


def row(label, t):
    if not t:
        return ''
    return (f'<div class="uc-cjr"><span class="uc-cj-p">{E(label)}</span>'
            f'<span class="uc-cj-f">{E(t["f"])}<span class="uc-fr">{E(t["r"])}</span></span></div>')


def block(head, rows):
    rows = [r for r in rows if r]
    if not rows:
        return ''
    return f'<div class="uc-cj"><div class="uc-cjh">{E(head)}</div>{"".join(rows)}</div>'


PERSONS = [('εγώ', ('first-person', 'singular')), ('εσύ', ('second-person', 'singular')),
           ('αυτός, -ή, -ό', ('third-person', 'singular')), ('εμείς', ('first-person', 'plural')),
           ('εσείς', ('second-person', 'plural')), ('αυτοί, -ές, -ά', ('third-person', 'plural'))]
CASES = [('nominative', 'nominative'), ('genitive', 'genitive'), ('accusative', 'accusative'),
         ('vocative', 'vocative')]


def by_person(tb, base):
    return [row(p, vcells(tb, *(base + need))) for p, need in PERSONS]


def table_html(e):
    tb = e['table']
    if not tb:
        return ''
    if e['pos'] == 'verb':
        blocks = [
            block('present', by_person(tb, ('present', 'imperfective', 'indicative'))),
            block('simple past', by_person(tb, ('past', 'perfective', 'indicative'))),
            block('imperfect (was …-ing)', by_person(tb, ('imperfect', 'imperfective', 'indicative'))),
            block('future (θα + …)', by_person(tb, ('future', 'perfective'))),
            block('imperative', [row('once, to one', vcells(tb, 'imperative', 'perfective', 'singular')),
                                 row('once, to many', vcells(tb, 'imperative', 'perfective', 'plural')),
                                 row('ongoing, to one', vcells(tb, 'imperative', 'imperfective', 'singular')),
                                 row('ongoing, to many', vcells(tb, 'imperative', 'imperfective', 'plural'))]),
        ]
    elif e['pos'] == 'noun':
        blocks = [block(num, [row(l, cells(tb, c, num)) for l, c in CASES])
                  for num in ('singular', 'plural')]
    elif any({'masculine', 'feminine', 'neuter'} & set(t['t']) for t in tb):
        # an adjective, the article, a pronoun or a determiner declined by gender
        blocks = []
        for g in ('masculine', 'feminine', 'neuter'):
            rows = [row(f'{l}, sg.', cells(tb, c, g, 'singular')) for l, c in CASES[:3]] + \
                   [row(f'{l}, pl.', cells(tb, c, g, 'plural')) for l, c in CASES[:3]]
            blocks.append(block(g, rows))
    else:
        return ''
    blocks = [b for b in blocks if b]
    if not blocks:
        return ''
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>'


# ---- examples --------------------------------------------------------------------------
SPLIT = re.compile(r'([Ͱ-Ͽἀ-῿]+)')


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
    for el, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(el)}"></span>{mark(el, hits)}</div>'
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
        roman = main['roman'] if not r.get('via') else translit(word)
        roman = roman or next((e['roman'] for e in ents if e['roman']), '') or translit(word)
        art = ARTICLE.get(main['gender'], '') if main['pos'] == 'noun' else ''
        head = (f'<span class="uc-art">{E(art)}</span> ' if art else '') + E(word)
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Greek': head,
            'Roman': E((ART_ROMAN[art] + ' ' if art else '') + roman),
            'Word': word,
            'Say': (art.split('/')[0] + ' ' if art else '') + word,
            'English': english(ents, word),
            'Forms': forms_line(main, word),
            'Table': table_html(main),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex), 'roman': bool(roman)})
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
        "Both study directions in one deck: Greek → English (see the Greek, recall the meaning) "
        "and English → Greek (see an English meaning, recall the Greek). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words of Modern Greek for a beginner, aligned to {LEVEL.upper()} of the "
        f"Common European Framework of Reference, whose global descriptor begins '{SC['quote']}' — "
        f"a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: Greek has an examination at these levels, "
        "the Certificate of Attainment in Greek of the Centre for the Greek Language, but no graded "
        "word list for it was found published, so this deck is not that examination's vocabulary "
        f"and does not claim to be. It is assembled from two things that can be stated. {from_inv} "
        f"of the {n} come from a vocabulary written for the level's scope — {SC['topics']} — and "
        f"the other {n - from_inv} are the commonest remaining words of everyday Greek, taken from "
        "a frequency list built from film and television subtitles and counted by the WHOLE word, "
        "every form of a noun or a verb added together. The cards are dealt by that frequency, so "
        "the words you meet most often come first. "
        "Every headword has a romanisation beneath it, Wiktionary's own (spíti, tróo, the accent "
        "kept), so the deck can be studied before the alphabet is fluent; the Greek Alphabet deck, "
        f"the first in this collection, teaches the letters themselves. The {nouns} nouns are "
        "printed with their article — ο, η or το — because the article is the gender, which every "
        "adjective, article and pronoun agrees with, and they show their genitive and plural; the "
        f"{verbs} verbs show their simple past and future, where a Greek verb often changes stem "
        "(τρώω, έφαγα, θα φάω), and behind the All forms fold their present, simple past, "
        "imperfect, future and imperative by person. "
        + EX_NOTE + ", with the word picked out in colour and a speaker beside the sentence and the "
        "headword. Sources. Level: the Common European Framework of Reference (Council of Europe), "
        "global scale. Meanings, gender, forms and romanisation: English Wiktionary, via the "
        "kaikki.org extraction (CC BY-SA 4.0). Frequency: a word list built from OpenSubtitles "
        "(hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), "
        "CC BY 2.0 FR."
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
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': f'{n} words · both directions, as two cards per word',
        'desc': desc(entries, n), 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['greek', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Greek vocabulary', 'speechLang': 'el-GR',
            'fields': FIELDS,
            'cards': [
                {'name': 'Greek → English', 'front': FRONT_EL, 'back': BACK_EL},
                {'name': 'English → Greek', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Greek')
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
