#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Hindi shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss
is corrected both ways at once and each direction keeps its own schedule.
Card 1 is UKRAINIAN -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in Cyrillic WITH ITS STRESS MARKED (`кни́га`), as the Russian
    decks print it -- Ukrainian stress is free and moves, and a learner has no
    other way to know it; no transliteration (the Russian precedent: the
    Ukrainian Alphabet deck comes first in the collection);
  · the meanings, grouped by part of speech, a noun's GENDER and a verb's
    ASPECT in the label;
  · one line of key forms: a noun's genitive singular and nominative plural, an
    adjective's feminine, neuter and plural, a verb's я / він / вони forms and
    its past; and for a verb its ASPECT PARTNER (`роби́ти` -> perfective
    `зроби́ти`), which Ukrainian, like Russian, learns in pairs;
  · the forms tables behind a fold (a noun's seven cases, an adjective's or
    pronoun's cases by gender, a verb's present or future by person, its past
    and imperative);
  · up to three Tatoeba sentences, the word picked out, with a speaker.

The speaker reads the `Word` field: the headword without its stress mark.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uk import fold, nfc, show, speak, PRONOUN_CASES, CASE_NAMES, tokens
from ukrainian_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'ukrainian'
COLOR = '#9F4500'
FIELDS = ['Ukrainian', 'Word', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'prep': 'preposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep_phrase': 'phrase', 'proverb': 'proverb'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = '<div class="uc-word">{{Ukrainian}}' + SAY + '</div>'
ASK = '<div class="uc-ask">Say it in Ukrainian</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_UK = WORD
BACK_UK = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape

# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here, with the
# reason.  Ukrainian homographs from unrelated sources would otherwise put "seed"
# on the card for "family".
ETYMS = {
    "сім'я": ['2'],           # "family"; etymology 1 is "seed"
    'мати': ['2', '1'],       # "to have" AND "mother", both A1; the verb is the commoner
    'ніж': ['2'],             # "than" (the inventory's conjunction); etymology 1 is "knife"
    'треба': ['2'],           # "it is necessary"; etymology 1 is "rite"
    'пара': ['2', '1'],       # "pair, couple" AND "steam"
    'тікати': ['2'],          # "to run away"; etymology 1 is "to tick (of a clock)"
    'уряд': ['1'],            # "government"; etymology 2 is the adverb "in succession"
    'ген': ['2'],             # "gene"; etymology 1 is a dialectal "far away"
}

# A PART OF SPEECH TO LEAD WITH, where Wiktionary's first is not the everyday word.
POS_FIRST = {'так': 'intj', 'гаразд': 'intj', 'привіт': 'intj'}
# A PART OF SPEECH LEFT OFF, where it is a different, rarer word spelt the same.
DROP_POS = {'під': {'noun'}}         # "pit, cavity" beside the preposition "under"
# ONE ENTRY BY ITS GLOSS, where two etymologies share Wiktionary's blank etymology number.
ENTRY_WITH = {'дружина': 'wife',     # not the prince's "band, troop" of Rus
              'стан': 'condition, status, state'}   # not "torso", "camp" or "mill"
# Wiktionary tags every sense rare or archaic, though it is the everyday word.
NOT_WEAK = {'уряд'}                  # "government"; only the adverb "in succession" is untagged
# Wiktionary files these impersonal predicatives as adjectives; the card says what they are.
PREDICATIVE = {'треба', 'можна', 'потрібно', 'ніколи', 'досить', 'чудово', 'шкода', 'варто'}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {}
# A GLOSS LEFT OFF: `я`'s second sense is the philosophical noun "ego".
GLOSS_DROP = {'я': {'ego'}}
# AN ASPECT PARTNER WRITTEN HERE, replacing Wiktionary's, where both entries name a pair a
# learner's grammar does not: `зна́ти` has no perfective (`зазна́ти` is "to undergo").
PARTNER = {'знати': []}
# A HEADWORD'S STRESS WRITTEN HERE, where Wiktionary's head line carries none.
STRESS = {'давайте': 'дава́йте', 'стривати': 'стрива́ти'}


# ---- glosses ---------------------------------------------------------------------------
TRAIL = re.compile(r'\s*[:;,]\s*$')


def entries_for(row, lex):
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    ents = [e for e in L['entries'] if any(not g['weak'] and g['g'] for g in e['glosses'])] \
        or L['entries']
    if L['word'] in NOT_WEAK:
        ents = L['entries']
    if row['pos']:
        ents = [e for e in ents if e['pos'] == row['pos']] or ents
    ents = [e for e in ents if e['pos'] not in DROP_POS.get(L['word'], ())] or ents
    if L['word'] in ENTRY_WITH:
        ents = [e for e in ents if any(g['g'] == ENTRY_WITH[L['word']] for g in e['glosses'])] \
            or ents
    groups = []
    for e in ents:
        if e.get('etym', '') not in groups:
            groups.append(e.get('etym', ''))
    keep = [g for g in ETYMS.get(L['word'], groups[:1]) if g in groups] or groups[:1]
    ents = sorted([e for e in ents if e.get('etym', '') in keep],
                  key=lambda e: keep.index(e.get('etym', '')))
    if L['word'] in POS_FIRST:
        ents = sorted(ents, key=lambda e: e['pos'] != POS_FIRST[L['word']])
    out, seen = [], {}
    for e in ents:
        if e['pos'] in seen:
            out[seen[e['pos']]]['glosses'] += e['glosses']
            continue
        seen[e['pos']] = len(out)
        out.append(dict(e, glosses=list(e['glosses'])))
    return out[:3]


def label_of(e, word=''):
    label = POS_NAME.get(e['pos'], e['pos'])
    if e['pos'] == 'adj' and word in PREDICATIVE:
        label = 'predicative'
    if e['pos'] == 'noun' and e['gender']:
        label += ', ' + e['gender'].replace('/', ' or ')
    if e['pos'] == 'verb':
        if e['aspect'] in ('perfective', 'imperfective'):
            label += ', ' + e['aspect']
        elif e['aspect'] == 'both':
            label += ', imperfective and perfective'
    return label


def english(ents, word=''):
    parts, shown = [], set()
    for e in ents:
        gl, seen = [], set()
        for g in e['glosses']:
            if g['weak'] and gl:
                continue
            t = TRAIL.sub('', g['g'])
            if t in GLOSS_DROP.get(word, ()):
                continue
            # "grandfather (diminutive)" and "grandfather (affectionate)": one line
            base = re.sub(r' \((diminutive|affectionate|augmentative)\)$', '', t)
            if base != t and any(x.startswith(base + ' (') for x in gl):
                continue
            if t and t not in seen:
                seen.add(t)
                gl.append(t)
        lead = LEAD.get(word)
        if lead:
            gl.sort(key=lambda x: lead not in x)
        gl = gl[:3]
        if not gl or all(x in shown for x in gl):
            continue
        shown.update(gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label_of(e, word))}</div>{body}</div>')
    return ''.join(parts)


# ---- forms -----------------------------------------------------------------------------
def cells(table, *need, skip=()):
    """Every form whose tags hold all of `need` and none of `skip`, as printed, once each."""
    out = []
    for t in table:
        tags = set(t['t'])
        if all(n in tags for n in need) and not (tags & set(skip)) and ' ' not in t['f']:
            s = show(t['f'])
            if s not in out:
                out.append(s)
    return ', '.join(out)


def first(s):
    return s.split(', ')[0]


def fi(label, s):
    s = first(s)
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(s)}</span>' if s else ''


def is_pf(e):
    return e['aspect'] == 'perfective'


def partners(e, lex):
    """A verb's aspect partner, kept only where the partner's own entry names this verb
    back: Wiktionary pairs `зна́ти` with `зазна́ти` ("to undergo") and `ходи́ти` with
    `походи́ти` ("to walk about for a while"), neither of which is the other aspect."""
    me = fold(e['head'])
    if me in PARTNER:
        return PARTNER[me]
    out = []
    for p in e['partner']:
        L = lex.get(fold(p), {})
        if any(me in {fold(q) for q in pe.get('partner', [])}
               for pe in L.get('entries', []) if pe['pos'] == 'verb'):
            out.append(p)
    return out


def forms_line(e, word, lex):
    tb = e['table']
    bits = []
    if tb and e['pos'] == 'noun':
        bits.append(fi('genitive', cells(tb, 'genitive', 'singular')))
        pl = cells(tb, 'nominative', 'plural')
        if pl and fold(pl) != fold(word):
            bits.append(fi('plural', pl))
    elif tb and e['pos'] == 'adj':
        bits.append(fi('feminine', cells(tb, 'feminine', 'nominative', 'singular')))
        bits.append(fi('neuter', cells(tb, 'neuter', 'nominative', 'singular')))
        bits.append(fi('plural', cells(tb, 'nominative', 'plural', skip=('masculine', 'feminine', 'neuter'))))
    elif tb and e['pos'] == 'verb':
        tense = 'future' if is_pf(e) else 'present'
        bits.append(fi('я', cells(tb, 'first-person', 'singular', tense)))
        bits.append(fi('він', cells(tb, 'third-person', 'singular', tense)))
        bits.append(fi('past', cells(tb, 'masculine', 'past', 'singular')))
    bits = [b for b in bits if b]
    out = f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''
    pp = partners(e, lex) if e['pos'] == 'verb' else []
    if pp:
        other = {'imperfective': 'perfective', 'perfective': 'imperfective'}.get(e['aspect'], 'pair')
        out += (f'<div class="uc-asp"><span class="uc-fl">{E(other)}</span>'
                f'{E(", ".join(show(p) for p in pp[:2]))}</div>')
    return out


def row(label, s):
    if not s:
        return ''
    return (f'<div class="uc-cjr"><span class="uc-cj-p">{E(label)}</span>'
            f'<span class="uc-cj-f">{E(s)}</span></div>')


def block(head, rows):
    rows = [r for r in rows if r]
    if not rows:
        return ''
    return f'<div class="uc-cj"><div class="uc-cjh">{E(head)}</div>{"".join(rows)}</div>'


CASES = ['nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'locative', 'vocative']
GENDERS = ['masculine', 'neuter', 'feminine']


def table_html(e, word):
    tb = e['table']
    pc = PRONOUN_CASES.get(fold(word)) if e['pos'] == 'pron' else None
    if pc:
        blocks = [block('cases', [row(c, show(x)) for c, x in zip(CASE_NAMES, pc) if x != '—'])]
    elif not tb:
        return ''
    elif e['pos'] == 'verb':
        tense = 'future' if is_pf(e) else 'present'
        persons = [('я', ('first-person', 'singular')), ('ти', ('second-person', 'singular')),
                   ('він, вона', ('third-person', 'singular')), ('ми', ('first-person', 'plural')),
                   ('ви', ('second-person', 'plural')), ('вони', ('third-person', 'plural'))]
        blocks = [
            block(tense, [row(p, cells(tb, tense, *need)) for p, need in persons]),
            block('past', [row('він', cells(tb, 'masculine', 'past', 'singular')),
                           row('вона', cells(tb, 'feminine', 'past', 'singular')),
                           row('воно', cells(tb, 'neuter', 'past', 'singular')),
                           row('вони', cells(tb, 'past', 'plural', 'masculine'))]),
            block('imperative', [row('ти', cells(tb, 'imperative', 'second-person', 'singular')),
                                 row('ми', cells(tb, 'imperative', 'first-person', 'plural')),
                                 row('ви', cells(tb, 'imperative', 'second-person', 'plural'))]),
        ]
        if not is_pf(e) and cells(tb, 'future', 'first-person', 'singular'):
            blocks.insert(1, block('future', [row(p, cells(tb, 'future', *need)) for p, need in persons]))
    elif e['pos'] == 'noun':
        blocks = [block(n, [row(c, cells(tb, c, n)) for c in CASES]) for n in ('singular', 'plural')]
    elif any(set(t['t']) & set(GENDERS) for t in tb):
        # an adjective, a pronoun or determiner that declines like one, `один`, `два`
        def gcell(c, g):
            if g == 'plural':
                return cells(tb, c, 'plural', skip=('animate',)) if c == 'accusative' \
                    else cells(tb, c, 'plural')
            skip = ('plural', 'animate') if c == 'accusative' else ('plural',)
            return cells(tb, c, g, skip=skip)
        heads = [g for g in GENDERS + ['plural'] if any(gcell(c, g) for c in CASES)]
        blocks = [block(g, [row(c, gcell(c, g)) for c in CASES[:6]]) for g in heads]
    else:
        blocks = [block('cases', [row(c, cells(tb, c)) for c in CASES])]
    blocks = [b for b in blocks if b]
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>' if blocks else ''


# ---- examples --------------------------------------------------------------------------
from uk import WORD_RX


def mark(sentence, hits):
    hs = set(hits)
    out, last = [], 0
    for m in WORD_RX.finditer(sentence):
        out.append(E(sentence[last:m.start()]))
        w = m.group(0)
        out.append(f'<b>{E(w)}</b>' if fold(w) in hs else E(w))
        last = m.end()
    out.append(E(sentence[last:]))
    return ''.join(out)


def examples_html(exs):
    out = []
    for uk, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(uk)}"></span>{mark(uk, hits)}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>')
    return ''.join(out)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        main = ents[0]
        head = lex[r['key']].get('head') if r.get('via') else main['head']
        head = show(STRESS.get(fold(r['word'])) or head or r['word'])
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Ukrainian': E(head),
            'Word': E(speak(head)),
            'English': english(ents, r['word']),
            'Forms': forms_line(main, r['word'], lex),
            'Table': table_html(main, r['word']),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': r['word'], 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex)})
    return cards, entries


LEARNER = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner',
           'b2': 'an upper-intermediate learner', 'c1': 'an advanced learner'}


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
        "Both study directions in one deck: Ukrainian → English (see the Ukrainian, recall the "
        "meaning) and English → Ukrainian (see an English meaning, recall the Ukrainian). Each "
        "direction is a card of its own with its own schedule, so recognising a word and producing "
        f"it are learnt separately. {n} words for {LEARNER[LEVEL]}, aligned to {LEVEL.upper()} of the "
        f"Common European Framework of Reference, whose global descriptor begins '{SC['quote']}' — "
        f"a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: Ukraine certifies proficiency in the "
        "language but publishes no graded word list, so this deck is not any examination's "
        f"vocabulary and does not claim to be. It is assembled from two things that can be stated. "
        f"{from_inv} of the {n} come from a vocabulary written for the level's scope — "
        f"{SC['topics']} — and the other {n - from_inv} are the commonest remaining words of "
        "everyday Ukrainian, taken from a frequency list built from film and television subtitles "
        "and counted by the WHOLE word, every form of a noun or a verb added together. The cards "
        "are dealt by that frequency, so the words you meet most often come first. "
        "Every headword is printed in Cyrillic with its stress marked (кни́га, роблю́), because "
        "Ukrainian stress can fall on any syllable and move as the word changes, and nothing else "
        "shows it; there is no transliteration, and the Ukrainian Alphabet deck, the first in this "
        f"collection, teaches the letters. The {nouns} nouns show their gender, their genitive and "
        f"their plural; the {verbs} verbs show their aspect, imperfective or perfective, with the "
        "other verb of the pair beside them, their я and він forms and their past; and behind the "
        "All forms fold every noun's seven cases and every verb's tenses by person. "
        + EX_NOTE + ", with the word picked out in colour and a speaker beside the sentence and the "
        "headword. Sources. Level: the Common European Framework of Reference (Council of Europe), "
        "global scale. Meanings, gender, aspect, stress and forms: English Wiktionary, via the "
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
        'tags': ['ukrainian', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Ukrainian vocabulary', 'speechLang': 'uk-UA',
            'fields': FIELDS,
            'cards': [
                {'name': 'Ukrainian → English', 'front': FRONT_UK, 'back': BACK_UK},
                {'name': 'English → Ukrainian', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Ukrainian')
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
