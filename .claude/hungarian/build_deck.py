#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / TORFL / Hindi / Greek shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is HUNGARIAN -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword as a Hungarian dictionary prints it -- a verb in its third
    person singular present (`eszik` "eats", `lát` "sees"), which is the
    stem the endings go on;
  · the meanings, grouped by part of speech;
  · one line of key forms, the part a learner cannot guess under vowel harmony
    and stem changes: a noun's plural, accusative and "his/her" form (`ló`,
    `lovak`, `lovat`, `lova`), an adjective's comparative and plural, a verb's
    "I" form, its past and its infinitive (`eszik`, `eszem`, `evett`, `enni`);
  · the forms tables behind a fold (a verb's present -- indefinite and
    definite --, past, conditional and imperative by person; a noun's sixteen
    cases in both numbers and its possessive; a pronoun's cases);
  · up to three Tatoeba sentences, the word picked out, with a speaker.

Every form is READ from Wiktionary, never derived; the verb blocks are the ones
`hu.verb_table` read by position and checked.  The speaker reads `Say`, the word.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hu import fold, nfc
from hungarian_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'hungarian'
COLOR = '#14659F'          # the shelf's measured hue (app.js, `lang-hungarian`)
FIELDS = ['Hungarian', 'Word', 'Say', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'postp': 'postposition', 'prep': 'preposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'proverb': 'proverb', 'article': 'article'}

SAY = '<span class="uc-tts uc-say" data-say="{{Say}}"></span>'
WORD = '<div class="uc-word">{{Hungarian}}' + SAY + '</div>'
ASK = '<div class="uc-ask">Say it in Hungarian</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_HU = WORD
BACK_HU = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape
TRAIL = re.compile(r'\s*[:;,]\s*$')


def gloss_text(g):
    return TRAIL.sub('', shorten(g))


def _brackets(g):
    """The top-level bracketed spans of a gloss, nested ones included: [(start, end)]."""
    spans, depth, start = [], 0, 0
    for i, ch in enumerate(g):
        if ch == '(':
            if not depth:
                start = i
            depth += 1
        elif ch == ')' and depth:
            depth -= 1
            if not depth:
                spans.append((start, i + 1))
    return spans


def shorten(g):
    """Wiktionary's Hungarian glosses carry a DEFINITION in brackets after the gloss
    ("life (the state of organisms preceding their death, characterized by ...)"); on a
    flashcard the gloss is the answer and the definition is noise.  A bracket longer than
    40 characters is cut where the gloss outside it says something -- a short one stays
    ("near (used with -hoz/-hez/-höz)", "orange (fruit)").  Nested brackets count as
    part of the one they sit in ("salt (... sodium chloride (NaCl), ...)")."""
    out = g
    for a, b in reversed(_brackets(g)):
        if b - a - 2 > 40:
            out = out[:a].rstrip() + out[b:]
    out = re.sub(r'\s+([,;])', r'\1', out).strip()
    return out if len(re.sub(r'[^\w]', '', out)) >= 2 else g


# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here.  Where the
# first etymology is NOT the everyday word, or two are, the card names which -- each
# read off the A1 build (2026-11-09):
ETYMS = {
    'ki': ['2', '1'],          # "who?" first, then the adverb and prefix "out"
    'fog': ['2', '1'],         # "tooth" (the inventory's) and the verb "to hold; will"
    'fél': ['2', '1'],         # "half" (the numbers') and the verb "to be afraid"
    'vár': ['2', '1'],         # "to wait" before "castle"
    'áll': ['2'],              # "to stand", not "chin"
    'ér': ['3'],               # "to reach, to be worth", not "blood vessel" or "brook"
    'hát': ['2', '1'],         # "well, …" (the conversational word) and "back"
    'mi': ['1', '2'],          # "we" AND "what?" -- two etymologies, both A1
    'jobb': ['2'],             # "right; better", not the adverb "rather" (`jobban`)
    'sír': ['2', '1'],         # "to cry" (A2's everyday verbs) before "grave"
    'fogoly': ['2', '1'],      # "prisoner" before "partridge" (B2)
    'szán': ['2', '1'],        # "to intend, to pity" (the subtitles' count) before "sleigh"
    'bejárat': ['2', '1'],     # "entrance" before "to run in" (a machine)
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech: the prefixes'
# entries miss the prefix, and some verbs' senses are definitions, not glosses
# ("To force someone or something to remain in place ...").
GLOSS = {
    'meg': {'conj': ['a verbal prefix marking a finished action, often written apart from its '
                     'verb (megeszik "eats up"; meg kell csinálni "it must be done")',
                     'and, plus']},
    'tart': {'verb': ['to hold, to keep', 'to last, to take (time)', 'to consider, to regard as']},
    'ér': {'verb': ['to reach, to get to', 'to be worth']},
    # Wiktionary files "will" under the conjugation tables ("the infinitive plus the
    # conjugated auxiliary verb fog"), not as a sense of `fog`
    'fog': {'verb': ['to hold, to take, to catch',
                     'will (with an infinitive, the future: enni fog, "he will eat")']},
    # "better" is Wiktionary's "comparative degree of jó", a form-of sense the extract drops
    'jobb': {'adj': ['better (the comparative of jó)', 'right (not left)']},
}
POS_LABEL = {('meg', 'conj'): 'prefix; conjunction'}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'tűnik': 'to seem',
    'pontosan': 'precisely',
}

# A PART OF SPEECH NOT SHOWN for one word: a block that is noise beside the word a
# beginner meets (`én` "the self, ego", `a` "that").
DROP_POS = {('én', 'noun'), ('a', 'pron'), ('el', 'intj')}

NOT_A_MEANING = re.compile(
    r'^\*?\s*see:|^See |^Used in expressions|Usage notes|^synonym of |senses\.?$|^(?:first|second|third)-person .* of \S+$|'
    r'^(?:nominative|accusative|dative|plural|singular)[^;]* of \S+(?: \([^)]*\))?$', re.I)


def entries_for(row, lex):
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    ents = [e for e in L['entries'] if any(not g['weak'] and g['g'] for g in e['glosses'])] \
        or L['entries']
    groups = []
    for e in ents:
        if e.get('etym', '') not in groups:
            groups.append(e.get('etym', ''))
    first = groups[:1]
    if row['pos']:
        # the inventory named a part of speech: its etymology leads
        first = [next((e['etym'] for e in ents if e['pos'] == row['pos']), groups[0])]
    keep = ETYMS.get(L['word'], first)
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
        label = POS_LABEL.get((word, e['pos'])) or POS_NAME.get(e['pos'], e['pos'])
        tv = {t for gl in e['glosses'] for t in gl['tags']}
        if e['pos'] == 'verb':
            if 'transitive' in tv and 'intransitive' not in tv:
                label += ', transitive'
            elif 'intransitive' in tv and 'transitive' not in tv:
                label += ', intransitive'
        strong = any(not x['weak'] for x in e['glosses'])
        gl, seen = [], set()
        for x in e['glosses']:
            if x['weak'] and strong:
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
def cells(table, *need, skip=(), most=2):
    """Every listed form of one declension cell, at most two, joined."""
    got = []
    for t in table:
        tags = set(t['t'])
        if all(n in tags for n in need) and not tags & set(skip) and t['f'] not in got:
            got.append(t['f'])
    return ' / '.join(got[:most]) if got else ''


def vc(cell, most=2):
    return ' / '.join(cell[:most]) if cell else ''


def fi(label, form):
    if not form:
        return ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(form)}</span>'


NOUN_SKIP = ('possessive',)


def forms_line(e, word):
    bits = []
    tb = e['table']
    if e['pos'] == 'noun' and tb:
        pl = cells(tb, 'nominative', 'plural', skip=NOUN_SKIP)
        if pl and fold(pl) != fold(word):
            bits.append(fi('plural', pl))
        bits.append(fi('accusative', cells(tb, 'accusative', 'singular', skip=NOUN_SKIP)))
        bits.append(fi('his/her', cells(tb, 'possessive', 'possessed-single', 'third-person',
                                        'singular')))
    elif e['pos'] == 'adj':
        bits.append(fi('comparative', e['head'].get('comparative', '')))
        if tb:
            bits.append(fi('plural', cells(tb, 'nominative', 'plural', skip=NOUN_SKIP)))
    elif e['pos'] == 'verb':
        v = e.get('verb') or {}
        if v.get('pres') and fold(vc(v['pres'][0])) != fold(word):
            bits.append(fi('I', vc(v['pres'][0])))
        if v.get('past'):
            bits.append(fi('past', vc(v['past'][2])))
        if v.get('inf'):
            bits.append(fi('infinitive', v['inf'][0]))
    elif e['pos'] == 'pron' and tb:
        acc = cells(tb, 'accusative', skip=('plural',) if cells(tb, 'singular') else ())
        if acc and fold(acc) != fold(word):
            bits.append(fi('accusative', acc))
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


def row(label, form):
    if not form:
        return ''
    return (f'<div class="uc-cjr"><span class="uc-cj-p">{E(label)}</span>'
            f'<span class="uc-cj-f">{E(form)}</span></div>')


def block(head, rows):
    rows = [r for r in rows if r]
    if not rows:
        return ''
    return f'<div class="uc-cj"><div class="uc-cjh">{E(head)}</div>{"".join(rows)}</div>'


PERSONS = ['én', 'te', 'ő, ön', 'mi', 'ti', 'ők, önök']
CASES = [('nominative', 'nominative'), ('accusative', 'accusative'),
         ('dative (to, for)', 'dative'), ('with', 'instrumental'), ('for (the sake of)', 'causal-final'),
         ('becoming', 'translative'), ('as far as', 'terminative'), ('as', 'essive-formal'),
         ('in', 'inessive'), ('on', 'superessive'), ('at', 'adessive'), ('into', 'illative'),
         ('onto', 'sublative'), ('to', 'allative'), ('out of', 'elative'),
         ('off, about', 'delative'), ('from', 'ablative')]
POSS = [('my', ('first-person', 'singular')), ('your', ('second-person', 'singular')),
        ('his, her', ('third-person', 'singular')), ('our', ('first-person', 'plural')),
        ('your (pl.)', ('second-person', 'plural')), ('their', ('third-person', 'plural'))]


def table_html(e):
    tb = e['table']
    if e['pos'] == 'verb':
        v = e.get('verb') or {}

        def persons(k, most=2):
            return [row(p, vc(c, most)) for p, c in zip(PERSONS, v.get(k) or [])]
        blocks = [
            block('present', persons('pres')),
            block('present, definite (it, them)', persons('presdef')),
            block('past', persons('past')),
            block('past, definite (it, them)', persons('pastdef')),
            block('conditional (would …)', persons('cond')),
            block('imperative, subjunctive', persons('subj', 3)),
        ]
    elif e['pos'] == 'noun' and tb:
        blocks = [block(num, [row(l, cells(tb, c, num, skip=NOUN_SKIP)) for l, c in CASES])
                  for num in ('singular', 'plural')]
        blocks.append(block('possessive (one thing)',
                            [row(l, cells(tb, 'possessive', 'possessed-single', *need))
                             for l, need in POSS]))
    elif e['pos'] == 'pron' and tb and not cells(tb, 'plural', skip=('possessive',)):
        blocks = [block('cases', [row(l, cells(tb, c)) for l, c in CASES])]
    else:
        return ''
    blocks = [b for b in blocks if b]
    if not blocks:
        return ''
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>'


# ---- examples --------------------------------------------------------------------------
SPLIT = re.compile(r"([a-záéíóöőúüűõôûA-ZÁÉÍÓÖŐÚÜŰÕÔÛ]+)")


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
    for hu, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(hu)}"></span>{mark(hu, hits)}</div>'
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
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Hungarian': E(word),
            'Word': word,
            'Say': word,
            'English': english(ents, word),
            # a word spelt as Wiktionary's alternative of another headword (`gyerek`, filed
            # under `gyermek`) has that headword's forms, not its own: none are shown
            'Forms': '' if r.get('via') else forms_line(main, word),
            'Table': '' if r.get('via') else table_html(main),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex)})
    return cards, entries


FOR = {'a1': 'for a beginner', 'a2': 'for an elementary learner', 'b1': 'for an intermediate learner',
       'b2': 'for an upper-intermediate learner', 'c1': 'for an advanced learner'}


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
        "Both study directions in one deck: Hungarian → English (see the Hungarian, recall the "
        "meaning) and English → Hungarian (see an English meaning, recall the Hungarian). Each "
        "direction is a card of its own with its own schedule, so recognising a word and producing "
        f"it are learnt separately. {n} words of Hungarian {FOR[LEVEL]}, aligned to "
        f"{LEVEL.upper()} of the Common European Framework of Reference, whose global descriptor "
        f"begins '{SC['quote']}' — a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: Hungarian has examinations at these levels, "
        "but no graded word list for any of them was found published, so this deck is not an "
        f"examination's vocabulary and does not claim to be. It is assembled from two things that "
        f"can be stated. {from_inv} of the {n} come from a vocabulary written for the level's scope "
        f"— {SC['topics']} — and the other {n - from_inv} are the commonest remaining words of "
        "everyday Hungarian, taken from a frequency list built from film and television subtitles "
        "and counted by the WHOLE word, every case of a noun and every form of a verb added "
        "together. The cards are dealt by that frequency, so the words you meet most often come "
        "first. Verbs are given as Hungarian dictionaries give them, in the third person singular "
        "(eszik \"eats\", lát \"sees\"), the form the endings are built on. The "
        f"{nouns} nouns show their plural, their accusative and their \"his, her\" form, the part "
        "vowel harmony makes hard to guess (ló, lovak, lovat, lova), and behind the All forms fold "
        f"every case in both numbers; the {verbs} verbs show their \"I\" form, their past and their "
        "infinitive (eszik, eszem, evett, enni), and behind the fold the present in both "
        "conjugations — the definite one is used when the object is definite (látok egy házat, "
        "\"I see a house\"; látom a házat, \"I see the house\") — the past, the conditional and the "
        "imperative by person. The Hungarian Alphabet deck, the first in this collection, teaches "
        "the letters and their sounds. "
        + EX_NOTE + ", with the word picked out in colour and a speaker beside the sentence and the "
        "headword. Sources. Level: the Common European Framework of Reference (Council of Europe), "
        "global scale. Meanings and forms: English Wiktionary, via the kaikki.org extraction "
        "(CC BY-SA 4.0). Frequency: a word list built from OpenSubtitles (hermitdave/FrequencyWords, "
        "CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR."
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
        'tags': ['hungarian', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Hungarian vocabulary', 'speechLang': 'hu-HU',
            'fields': FIELDS,
            'cards': [
                {'name': 'Hungarian → English', 'front': FRONT_HU, 'back': BACK_HU},
                {'name': 'English → Hungarian', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Hungarian')
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
