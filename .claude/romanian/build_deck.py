#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Hindi shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss
is corrected both ways at once and each direction keeps its own schedule.
Card 1 is ROMANIAN -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword, a verb in the dictionary's citation form (`a face`), with
    Wiktionary's IPA beneath it -- Romanian spelling is close to its sound, but
    its STRESS is not written and not predictable (`ˈmer.d͡ʒe`, `aˈdre.sə`);
  · the meanings, grouped by part of speech, a noun's GENDER in its label --
    Romanian has three, the neuter being masculine in the singular and feminine
    in the plural, which is what decides an adjective's form;
  · one line of key forms: a noun's plural and its definite form (the article
    is a suffix: `casă` -> `casa`), an adjective's feminine and plurals, a verb's
    first person, past participle and subjunctive -- the three forms a
    dictionary gives because the rest of the verb is built from them;
  · the forms tables behind a fold (a verb's present, imperfect, subjunctive
    and imperative by person; a noun's indefinite and definite cases; an
    adjective's four forms; a pronoun's case forms);
  · up to three Tatoeba sentences, the word picked out, with a speaker.

The speaker reads the `Word` field, the bare headword.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ro import fold, nfc, WORD as WORD_RE
from ro_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'romanian'
COLOR = '#757839'
FIELDS = ['Romanian', 'IPA', 'Word', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'prep': 'preposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep_phrase': 'phrase', 'proverb': 'proverb',
            'article': 'article', 'contraction': 'contraction'}
GENDER = {'m': 'masculine', 'f': 'feminine', 'n': 'neuter', 'mf': 'masculine or feminine'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = ('<div class="uc-word">{{Romanian}}' + SAY + '</div>'
        '{{#IPA}}<div class="uc-rom">{{IPA}}</div>{{/IPA}}')
ASK = '<div class="uc-ask">Say it in Romanian</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_RO = WORD
BACK_RO = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape

# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here (the Hindi
# rule): `mai` is "May", "more", "mallet" and "liver" from four sources.
ETYMS = {
    'mai': ['2', '1'],       # "more" AND "May"
    'mare': ['1', '2'],      # "big" AND "sea", both A1
    'bancă': ['2', '1'],     # "bank"; etymology 1 is "bench"
    'dura': ['2'],           # "to last"; etymology 1 is "to build", regional
    # B1
    'coș': ['2'],            # "basket"; etymology 1 is "pimple"
    'post': ['2'],           # "post, job"; etymology 1 is "a fast"
}

# A PART OF SPEECH LEFT OFF ONE CARD, each with its reason.
DROP_POS = {
    'unu': {'pron'},          # "you (plural)" is a regional reading; the card is the number
    'de': {'conj', 'pron'},   # "if" and the relative "who" are colloquial; the card is the preposition
    'tot': {'noun'},          # "a totality" repeats the pronoun "everything"
    'eu': {'noun'},           # "ego", the philosophers' noun, beside the pronoun "I"
    'bine': {'adj'},          # "handsome", a rare reading of the adverb "well"
    'nimic': {'adv', 'noun'}, # the card is the pronoun "nothing"
    'până': {'adv', 'conj'},  # the preposition says "until"; the adverb is a usage note
    'cheie': {'adj'},         # "key, chief" (a key factor) beside the key itself
    # A COLOUR'S NOUN READING is the colour's name or, for white and black, a person
    # so described; the card is the adjective.  Likewise the small-boy noun of `mic`.
    'alb': {'noun'}, 'negru': {'noun'}, 'verde': {'noun'}, 'mic': {'noun'},
    # A2
    'pacient': {'adj'},       # "patient (forbearing)", the loanword's rare reading; the card is the noun
    'animal': {'adj', 'adv'}, # "animalistic, brutal" beside the noun "animal"
    'drăguț': {'noun'},       # "lover", a colloquial reading of the adjective "cute, nice"
    'curând': {'adj'},        # "short", a dated reading; the card is the adverb "soon"
    'atâta': {'adv'},         # the adverb's one sense is a note ("Paragogic form of atât")
}

# ONE ENTRY LEFT OFF A CARD, named by its first gloss: two entries of one etymology
# and one part of speech that are different words in all but spelling.
DROP_ENTRY = {
    'membru': 'limb',         # the neuter "limb" (pl. membre) beside the masculine "member" (pl. membri)
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'urât': 'ugly',           # first listed is "hated", the participle's sense
    'ceai': 'tea',            # first listed is "tea bush"
    'slujbă': 'job, employment, post, service',   # first listed is "divine service"
    'descoperi': 'to discover',                   # first listed is "to take off one's headgear"
    'coș': 'basket, wastebasket',                 # first listed is "chimney"
}


def entries_for(row, lex):
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    ents = [e for e in L['entries'] if any(not g['weak'] and g['g'] for g in e['glosses'])] \
        or L['entries']
    ents = [e for e in ents if e['pos'] not in DROP_POS.get(L['word'], ())] or ents
    ents = [e for e in ents if (e['glosses'] or [{'g': ''}])[0]['g'] != DROP_ENTRY.get(L['word'])] or ents
    groups = []
    for e in ents:
        if e.get('etym', '') not in groups:
            groups.append(e.get('etym', ''))
    keep = ETYMS.get(L['word'], groups[:1])
    ents = sorted([e for e in ents if e.get('etym', '') in keep],
                  key=lambda e: keep.index(e.get('etym', '')))
    if row['pos']:
        ents = sorted(ents, key=lambda e: e['pos'] != row['pos'])
    # A NOUN CELL THAT IS ONLY AN ENDING (`avocat`'s definite printed as "ul") is a fault
    # in the source's table: no form of a noun longer than three letters is two.  Nouns
    # only -- a verb's imperative may be two letters (`fă`, `du`, `zi`).
    ents = [dict(e, table=[t for t in e['table'] if len(t['f']) > 2 or len(L['word']) <= 3])
            if e['pos'] == 'noun' else e for e in ents]
    out, seen = [], {}
    for e in ents:
        if e['pos'] in seen:
            o = out[seen[e['pos']]]
            o['glosses'] += e['glosses']
            # two entries of one etymology (`ceai` "tea bush" and "tea"): the gender and
            # the fuller table may be on the second
            if not o['gender']:
                o['gender'] = e['gender']
            if len(e['table']) > len(o['table']):
                o['table'] = e['table']
            continue
        seen[e['pos']] = len(out)
        out.append(dict(e, glosses=list(e['glosses'])))
    return out[:3]


NOTE = re.compile(r'^(Used|Indicates|Introduces|Expresses|Forms|Connects|Optionally|Placed|Paragogic|synonym of)\b')


def is_note(t):
    """A gloss that is a grammar note or a paragraph, not a translation: kept only
    where it is the entry's one meaning (`să` "Subordinative conjunction: to")."""
    return len(t) > 90 or bool(NOTE.match(t))


def english(ents, word=''):
    parts, shown = [], set()
    for e in ents:
        label = POS_NAME.get(e['pos'], e['pos'])
        if e['pos'] == 'noun' and e['gender'] in GENDER:
            label += ', ' + GENDER[e['gender']]
        tv = {t for g in e['glosses'] for t in g['tags']}
        if e['pos'] == 'verb':
            if 'transitive' in tv and 'intransitive' not in tv:
                label += ', transitive'
            elif 'intransitive' in tv and 'transitive' not in tv:
                label += ', intransitive'
        gl, seen = [], set()
        for g in sorted(e['glosses'], key=lambda g: is_note(g['g'])):
            if (g['weak'] or set(g['tags']) & {'slang'} or is_note(g['g'])) and gl:
                continue
            t = re.sub(r'\s*[:;,]\s*$', '', g['g'])
            if t and t not in seen:
                seen.add(t)
                gl.append(t)
        lead = LEAD.get(word)
        if lead:
            gl.sort(key=lambda x: (x != lead, lead not in x))
        gl = gl[:3]
        if not gl or all(x in shown for x in gl):
            continue
        shown.update(gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label)}</div>{body}</div>')
    return ''.join(parts)


# ---- forms -----------------------------------------------------------------------------
def cell(table, *need, skip=()):
    for t in table:
        tags = set(t['t'])
        if all(n in tags for n in need) and not (tags & set(skip)):
            return t
    return None


def fi(label, t):
    if not t:
        return ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(t["f"])}</span>'


def forms_line(e, word):
    tb = e['table']
    bits = []
    if e['pos'] == 'noun' and tb:
        pl = cell(tb, 'nominative', 'indefinite', 'plural')
        df = cell(tb, 'nominative', 'definite', 'singular')
        if pl and fold(pl['f']) != fold(word):
            bits.append(fi('plural', pl))
        bits.append(fi('the …', df))
    elif e['pos'] == 'adj' and tb:
        fe = cell(tb, 'feminine', 'indefinite', 'singular')
        mp = cell(tb, 'masculine', 'indefinite', 'plural')
        fp = cell(tb, 'feminine', 'indefinite', 'plural')
        if fe and fold(fe['f']) != fold(word):
            bits.append(fi('feminine', fe))
        if mp and fold(mp['f']) != fold(word):
            bits.append(fi('plural', mp))
        if fp and mp and fold(fp['f']) != fold(mp['f']):
            bits.append(fi('fem. plural', fp))
    elif e['pos'] == 'verb' and tb:
        bits.append(fi('I', cell(tb, 'first-person', 'indicative', 'present', 'singular')))
        bits.append(fi('participle', cell(tb, 'participle', 'past')))
        bits.append(fi('subjunctive', cell(tb, 'present', 'singular', 'subjunctive', 'third-person')))
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


PERSONS = [('eu', ('first-person', 'singular')), ('tu', ('second-person', 'singular')),
           ('el / ea', ('third-person', 'singular')), ('noi', ('first-person', 'plural')),
           ('voi', ('second-person', 'plural')), ('ei / ele', ('third-person', 'plural'))]


def by_person(tb, base, skip=()):
    return [row(p, cell(tb, *(base + need), skip=skip)) for p, need in PERSONS]


def table_html(e):
    tb = e['table']
    if not tb:
        return ''
    if e['pos'] == 'verb':
        blocks = [
            block('key forms', [row('infinitive', cell(tb, 'infinitive')),
                                row('gerund', cell(tb, 'gerund')),
                                row('past participle', cell(tb, 'participle', 'past'))]),
            block('present', by_person(tb, ('indicative', 'present'))),
            block('imperfect', by_person(tb, ('indicative', 'imperfect'))),
            block('subjunctive', by_person(tb, ('present', 'subjunctive'))),
            block('imperative', [row('tu', cell(tb, 'imperative', 'second-person', 'singular',
                                                skip=('negative',))),
                                 row('voi', cell(tb, 'imperative', 'second-person', 'plural',
                                                 skip=('negative',))),
                                 row('tu, negative', cell(tb, 'imperative', 'negative', 'singular')),
                                 row('voi, negative', cell(tb, 'imperative', 'negative', 'plural'))]),
        ]
    elif e['pos'] == 'noun':
        def side(num):
            return [row('a / some', cell(tb, 'nominative', 'indefinite', num)),
                    row('the', cell(tb, 'nominative', 'definite', num)),
                    row('of / to a', cell(tb, 'genitive', 'indefinite', num)),
                    row('of / to the', cell(tb, 'genitive', 'definite', num)),
                    row('vocative', cell(tb, 'vocative', num))]
        blocks = [block('singular', side('singular')), block('plural', side('plural'))]
    elif e['pos'] == 'adj':
        def g(gender, num, *more, skip=()):
            return cell(tb, gender, num, *more, skip=skip)
        blocks = [block('indefinite', [row('masc. / neut. singular', g('masculine', 'singular', 'indefinite')),
                                       row('feminine singular', g('feminine', 'singular', 'indefinite')),
                                       row('masculine plural', g('masculine', 'plural', 'indefinite')),
                                       row('fem. / neut. plural', g('feminine', 'plural', 'indefinite'))]),
                  block('definite', [row('masc. / neut. singular', g('masculine', 'singular', 'definite')),
                                     row('feminine singular', g('feminine', 'singular', 'definite')),
                                     row('masculine plural', g('masculine', 'plural', 'definite')),
                                     row('fem. / neut. plural', g('feminine', 'plural', 'definite'))])]
    elif e['pos'] in ('pron', 'det', 'article', 'num'):
        LABEL = [('nominative', 'subject'), ('accusative', 'object'), ('dative', 'to'),
                 ('genitive', 'of'), ('possessive', 'possessive')]
        rows, seen = [], set()
        for t in tb:
            tags = set(t['t'])
            bits = [lab for tg, lab in LABEL if tg in tags]
            if 'stressed' in tags:
                bits.append('stressed')
            for tg in ('masculine', 'feminine', 'neuter', 'singular', 'plural'):
                if tg in tags:
                    bits.append({'masculine': 'm.', 'feminine': 'f.', 'neuter': 'n.',
                                 'singular': 'sg.', 'plural': 'pl.'}[tg])
            if 'definite' in tags:
                bits.append('def.')
            label = ' '.join(bits) or '·'
            key = (label, t['f'])
            if key in seen:
                continue
            seen.add(key)
            rows.append(row(label, t))
        blocks = [block('forms', rows)]
    else:
        return ''
    blocks = [b for b in blocks if b]
    if not blocks:
        return ''
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>'


# ---- examples --------------------------------------------------------------------------
def mark(sentence, hits):
    hs = set(hits)
    out, last = [], 0
    for m in re.finditer(r"[^\W\d_]+", sentence):
        out.append(E(sentence[last:m.start()]))
        piece = m.group(0)
        out.append(f'<b>{E(piece)}</b>' if fold(piece) in hs else E(piece))
        last = m.end()
    out.append(E(sentence[last:]))
    return ''.join(out)


def examples_html(exs):
    out = []
    for ro, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(ro)}"></span>{mark(ro, hits)}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>')
    return ''.join(out)


def headword(word, pos):
    if pos == 'verb':
        return f'<div class="uc-word"><span class="uc-a">a</span> {E(word)}</div>'
    return f'<div class="uc-word">{E(word)}</div>'


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        main = ents[0]
        word = r['word']
        ipa = main['ipa'] or next((e['ipa'] for e in ents if e['ipa']), '')
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Romanian': headword(word, main['pos']),
            'IPA': E(ipa),
            'Word': word,
            'English': english(ents, word),
            'Forms': forms_line(main, word),
            'Table': table_html(main),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex), 'ipa': bool(ipa)})
    return cards, entries


FOR = {'a1': 'for a beginner', 'a2': 'for an elementary learner', 'b1': 'for an intermediate learner',
       'b2': 'for an upper-intermediate learner', 'c1': 'for an advanced learner'}
BELOW_NAMES = {'a1': '', 'a2': 'A1', 'b1': 'A1 or A2', 'b2': 'A1, A2 or B1', 'c1': 'A1 to B2'}


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
        "Both study directions in one deck: Romanian → English (see the Romanian, recall the meaning) "
        "and English → Romanian (see an English meaning, recall the Romanian). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words {FOR[LEVEL]}, aligned to {LEVEL.upper()} of the Common European "
        f"Framework of Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
        f"is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: this deck is not any examination's "
        "vocabulary and does not claim to be — no openly licensed graded word list for Romanian was "
        f"found to build it from. It is assembled from two things that can be stated. {from_inv} of "
        f"the {n} come from a vocabulary written for the level's scope — {SC['topics']} — and the "
        f"other {n - from_inv} are the commonest remaining words of everyday Romanian, taken from a "
        "frequency list built from film and television subtitles and counted by the WHOLE word, "
        "every form of a noun or a verb added together. The cards are dealt by that frequency, so "
        "the words you meet most often come first. "
        "Every headword carries its pronunciation in the International Phonetic Alphabet, "
        "Wiktionary's own, because Romanian does not write where the stress falls. Verbs are given "
        f"in the dictionary's form, with the infinitive's a (a face, to do). The {nouns} nouns show "
        "their gender — masculine, feminine or neuter, the neuter being masculine in the singular "
        "and feminine in the plural — their plural, and their definite form, the article being a "
        f"suffix (casă, a house; casa, the house); the {verbs} verbs show their first person, past "
        "participle and subjunctive, and behind the All forms fold their present, imperfect, "
        "subjunctive and imperative by person. "
        + EX_NOTE + ", with the word picked out in colour and a speaker beside the sentence and the "
        "headword. Sources. Level: the Common European Framework of Reference (Council of Europe), "
        "global scale. Meanings, gender, forms and pronunciation: English Wiktionary, via the "
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
        'subtitle': (f'{n} words · both directions, as two cards per word' if LEVEL == 'a1' else
                     f'{n:,} more words, none of them in {BELOW_NAMES[LEVEL]} · both directions, '
                     'as two cards per word'),
        'desc': desc(entries, n), 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['romanian', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Romanian vocabulary', 'speechLang': 'ro-RO',
            'fields': FIELDS,
            'cards': [
                {'name': 'Romanian → English', 'front': FRONT_RO, 'back': BACK_RO},
                {'name': 'English → Romanian', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Romanian')
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
