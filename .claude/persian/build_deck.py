#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Hindi shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss
is corrected both ways at once and each direction keeps its own schedule.
Card 1 is PERSIAN -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in the Persian script, RIGHT TO LEFT (`dir="rtl"` on every
    Persian element, so a line mixing the word and a Latin label still runs the
    right way), with Wiktionary's Iranian ROMANISATION beneath it (ketâb, xâne:
    â for the long a), since Persian writes no short vowels and a beginner
    cannot otherwise tell `کرد` kard from kord;
  · the meanings, grouped by part of speech (Persian has no gender);
  · one line of key forms: a noun's plural(s) -- the Arabic plural beside the
    Persian one where Wiktionary gives both (کتب, کتاب‌ها) -- a verb's PRESENT
    STEM, which no rule derives from the infinitive (رفتن -> رو, دیدن -> بین)
    and which every present, subjunctive and imperative is built on, an
    adjective's comparative and superlative, and the SPOKEN form where
    Tehrani speech differs from the written word (خانه, spoken خونه xune);
  · the forms tables behind a fold: a verb's present, simple past, future,
    subjunctive and imperative by person; a noun's plural, object and ezafe
    forms and its possessives;
  · up to three Tatoeba sentences, the word picked out, with a speaker.

The speaker reads the `Word` field, the bare Persian, as `fa-IR`.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fa import fold, nfc, WORD as WORD_RE
from persian_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'persian'
COLOR = '#2A8424'
FIELDS = ['Persian', 'Roman', 'Word', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'postp': 'postposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep': 'preposition',
            'prep_phrase': 'phrase', 'proverb': 'proverb', 'name': 'proper noun'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = ('<div class="uc-word">{{Persian}}' + SAY + '</div>'
        '{{#Roman}}<div class="uc-rom">{{Roman}}</div>{{/Roman}}')
ASK = '<div class="uc-ask">Say it in Persian</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_FA = WORD
BACK_FA = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape


def fa(s):
    """A run of Persian, right to left, isolated from the Latin around it."""
    return f'<span class="uc-fa" dir="rtl" lang="fa">{E(s)}</span>'


# ---- glosses ---------------------------------------------------------------------------
TRAIL = re.compile(r'\s*[:;,]\s*$')

# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here.  Persian
# homographs from unrelated sources are many -- `من` "I" and "maund", `آن` "that"
# and "moment", `شیر` "milk" and "lion" and "tap" -- and a beginner's card that
# offers all of them teaches the noise.
ETYMS = {
    'شیر': ['1'],
    'زنگ': ['2'],             # "bell, ring, call"; etymology 1 is "rust"
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech, where its
# entry is a grammar note rather than a meaning a card can be answered with.
GLOSS = {
    'را': {'particle': ['marks the definite direct object (placed after it)']},
    'باید': {'verb': ['must, have to, should']},
    # Wiktionary files the everyday spelling as "unhamzated form of الآن", with "now" beneath
    'الان': {'adv': ['now']},
    'کی': {'pron': ['who? (spoken)'], 'adv': ['when?']},
    # Wiktionary's noun is "soldier; guy"; the word's everyday use is as the counter of people
    'نفر': {'noun': ['person (counting people: سه نفر, three people)', 'guy, fellow']},
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'نفر': 'person',
    'برنامه': 'program',
    'حرف': 'word',
    'نظر': 'opinion',
    'قرار': 'appointment',
    'قرمز': 'red',
}


def entries_for(row, lex):
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    ents = [e for e in L['entries'] if any(not g['weak'] and g['g'] for g in e['glosses'])] \
        or L['entries']
    groups = []
    for e in ents:
        if e.get('etym', '') not in groups:
            groups.append(e.get('etym', ''))
    keep = ETYMS.get(L['word'], groups[:1])
    if row['pos'] and L['word'] not in ETYMS:
        # the inventory named a part of speech (روی:prep): its etymology, not the first
        keep = [e.get('etym', '') for e in ents if e['pos'] == row['pos']][:1] or keep
    ents = sorted([e for e in ents if e.get('etym', '') in keep],
                  key=lambda e: keep.index(e.get('etym', '')))
    if row['pos']:
        ents = sorted(ents, key=lambda e: e['pos'] != row['pos'])
    out, seen = [], {}
    for e in ents:
        if e['pos'] in seen:
            o = out[seen[e['pos']]]
            o['glosses'] = o['glosses'] + e['glosses']
            for k in ('plural', 'colloq', 'compar', 'stems'):
                o[k] = o[k] or e[k]
            continue
        seen[e['pos']] = len(out)
        out.append(dict(e, glosses=list(e['glosses'])))
    return out[:3]


def english(ents, word=''):
    parts, shown = [], set()
    for e in ents:
        label = POS_NAME.get(e['pos'], e['pos'])
        tv = {t for g in e['glosses'] for t in g['tags']}
        if e['pos'] == 'verb':
            if 'transitive' in tv and 'intransitive' not in tv:
                label += ', transitive'
            elif 'intransitive' in tv and 'transitive' not in tv:
                label += ', intransitive'
        gl, seen = [], set()
        for g in e['glosses']:
            if g['weak'] and gl:
                continue
            t = TRAIL.sub('', g['g'])
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


# A ROMANISATION BY HAND, where Wiktionary's entry gives none.
ROMAN_BY_HAND = {'حس': 'hess'}


# ---- forms -----------------------------------------------------------------------------
CLASSICAL = re.compile('[āīūḵ]')


def unstress(r):
    """Wiktionary's tables mark the stress (raftán, mí-ravam, xâne-hấ) and its head lines do
    not (raftan); a card prints both, so the mark is dropped for one consistent spelling."""
    import unicodedata
    return unicodedata.normalize('NFC', re.sub('\u0301', '', unicodedata.normalize('NFD', r or '')))


def iran(r):
    """The Iranian romanisation of a cell: the last of `a / b`, the first of `a, b`."""
    r = re.split(r'\s*/\s*', unstress(r).strip())[-1].split(', ')[0].strip()
    return '' if CLASSICAL.search(r) else r


def fi(label, form, roman=''):
    return (f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{fa(form)}'
            + (f'<span class="uc-fr">{E(roman)}</span>' if roman else '') + '</span>')


def plural_roman(p, word, wr):
    if p['r']:
        return iran(p['r'])
    if p['f'] == word + '‌ها' and wr:
        return wr + '-hâ'
    return ''


def cell(table, *need, skip=()):
    """The first cell with these tags.  Wiktionary's tables come in an Iranian reading and, for
    some verbs, only a Classical one (dāštam); a Classical cell is shown WITHOUT its romanisation
    rather than with one a learner of Iranian Persian would mispronounce.  A cell with no
    romanisation at all is the extraction's stray header row (`باش` tagged a past stem) and is
    skipped."""
    hit = [t for t in table if all(n in t['t'] for n in need) and not set(t['t']) & set(skip)
           and t['r']]
    for t in hit:
        if not CLASSICAL.search(t['r']):
            return t
    return dict(hit[0], r='') if hit else None


def forms_line(e, word, wr):
    bits = []
    if e['pos'] == 'noun':
        for p in e['plural'][:2]:
            bits.append(fi('plural', p['f'], plural_roman(p, word, wr)))
    elif e['pos'] == 'verb':
        pr = cell(e['table'], 'present', 'stem')
        pa = cell(e['table'], 'past', 'stem')
        for t, c in (('present', pr), ('past', pa)):
            h = next((s for s in e['stems'] if s['t'] == t and s['r']), None) \
                or next((s for s in e['stems'] if s['t'] == t), None)
            if c and (iran(c['r']) or not h):
                bits.append(fi(t + ' stem', c['f'], iran(c['r'])))
            elif h:
                bits.append(fi(t + ' stem', h['f'], iran(h['r'])))
    elif e['pos'] == 'adj':
        for t in ('comparative', 'superlative'):
            c = next((c for c in e['compar'] if c['t'] == t and c['r']), None) \
                or next((c for c in e['compar'] if c['t'] == t), None)
            if c:
                r = iran(c['r']) or (wr + ('tar' if t == 'comparative' else 'tarin') if wr else '')
                bits.append(fi(t, c['f'], r))
    for c in e['colloq'][:1]:
        if fold(c['f']) != fold(word):
            bits.append(fi('spoken', c['f'], iran(c['r'])))
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


def row(label, t, latin=False):
    if not t:
        return ''
    lab = E(label) if latin else fa(label)
    return (f'<div class="uc-cjr"><span class="uc-cj-p">{lab}</span>'
            f'<span class="uc-cj-f">{fa(t["f"])}<span class="uc-fr">{E(unstress(t["r"]))}</span></span></div>')


def block(head, rows):
    rows = [r for r in rows if r]
    if not rows:
        return ''
    return f'<div class="uc-cj"><div class="uc-cjh">{E(head)}</div>{"".join(rows)}</div>'


PERSONS = [('من', ('first-person', 'singular')), ('تو', ('second-person', 'singular')),
           ('او', ('third-person', 'singular')), ('ما', ('first-person', 'plural')),
           ('شما', ('second-person', 'plural')), ('آنها', ('third-person', 'plural'))]


def by_person(tb, base, skip=(), only=None):
    out = []
    for p, need in PERSONS:
        cands = [t for t in tb if all(n in t['t'] for n in base + need)
                 and not set(t['t']) & set(skip) and t['r']]
        if only:
            cands = [t for t in cands if only(t)]
        iranian = [t for t in cands if not CLASSICAL.search(t['r'])]
        out.append(row(p, iranian[0] if iranian else (dict(cands[0], r='') if cands else None)))
    return out


def table_html(e):
    tb = e['table']
    # A TABLE WITH NO IRANIAN READING IS NOT SHOWN.  For some verbs Wiktionary's only table is
    # the Classical / Dari one (mē-aftam, dar hāl-i aftādan astam); printed without its
    # romanisation it would still teach another variety's forms as this deck's.
    if not tb or not any(t['r'] and not CLASSICAL.search(t['r']) for t in tb):
        return ''
    if e['pos'] == 'verb':
        imp = lambda t: not re.search(r'(^| )ن?می‌', t['f'])
        blocks = [
            block('key forms', [row('infinitive', cell(tb, 'infinitive'), True),
                                row('present stem', cell(tb, 'present', 'stem'), True),
                                row('past stem', cell(tb, 'past', 'stem'), True),
                                row('past participle', cell(tb, 'participle', 'past'), True)]),
            block('present', by_person(tb, ('indicative', 'present'),
                                       skip=('progressive', 'perfect', 'aorist', 'past'))),
            block('past', by_person(tb, ('indicative', 'past'), skip=('progressive', 'perfect'),
                                    only=imp)),
            block('future', by_person(tb, ('future', 'indicative'))),
            block('subjunctive', by_person(tb, ('present', 'subjunctive'))),
            block('imperative', [row('تو', cell(tb, 'imperative', 'singular')),
                                 row('شما', cell(tb, 'imperative', 'plural'))]),
        ]
    elif e['pos'] == 'noun':
        blocks = [
            block('forms', [row('plural', cell(tb, 'plural', skip=('possessive', 'ezafe', 'definite',
                                                                   'indefinite', 'direct-object')), True),
                            row('the … (object)', cell(tb, 'definite', 'direct-object', 'singular'), True),
                            row('ezafe (… of)', cell(tb, 'ezafe', 'singular'), True),
                            row('a …', cell(tb, 'indefinite', 'singular'), True)]),
            block('my, your, his …', [
                row('my', cell(tb, 'first-person', 'possessive', 'singular', skip=('plural',)), True),
                row('your', cell(tb, 'second-person', 'possessive', 'singular', skip=('plural',)), True),
                row('his, her', cell(tb, 'third-person', 'possessive', 'singular', skip=('plural',)), True),
                row('our', cell(tb, 'first-person', 'possessive', 'plural'), True),
                row('your (pl.)', cell(tb, 'second-person', 'possessive', 'plural'), True)]),
        ]
    elif e['pos'] == 'adj':
        blocks = [block('… is / am / are', by_person(tb, ('predicative',)))]
    else:
        return ''
    blocks = [b for b in blocks if b]
    if not blocks:
        return ''
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>'


# ---- examples --------------------------------------------------------------------------
def mark(sentence, hits):
    """Bold the matched words; a lone می / نمی and the verb after it are one match."""
    hs = set(hits)
    s = nfc(sentence)
    spans = [(m.start(), m.end(), fold(m.group())) for m in WORD_RE.finditer(s)]
    bold = []
    i = 0
    while i < len(spans):
        a, b, t = spans[i]
        if t in ('می', 'نمی') and i + 1 < len(spans) and t + spans[i + 1][2] in hs:
            bold.append((a, spans[i + 1][1]))
            i += 2
            continue
        if t in hs:
            bold.append((a, b))
        elif len(hits) and any(' ' in h for h in hits):
            pass
        i += 1
    # a compound verb's hits are its words in sequence
    if not bold:
        for h in hits:
            for a, b, t in spans:
                if t == h:
                    bold.append((a, b))
    out, pos = [], 0
    for a, b in sorted(set(bold)):
        if a < pos:
            continue
        out.append(E(s[pos:a]) + '<b>' + E(s[a:b]) + '</b>')
        pos = b
    out.append(E(s[pos:]))
    return ''.join(out)


def examples_html(exs):
    out = []
    for s, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz" dir="rtl" lang="fa"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(s)}"></span>{mark(s, hits)}</div>'
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
        roman = main['roman'] or next((e['roman'] for e in ents if e['roman']), '') \
            or ROMAN_BY_HAND.get(word, '')
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Persian': fa(word),
            'Roman': E(roman),
            'Word': word,
            'English': english(ents, word),
            'Forms': forms_line(main, word, roman),
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
        "Both study directions in one deck: Persian → English (see the Persian, recall the meaning) "
        "and English → Persian (see an English meaning, recall the Persian). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words for a beginner, aligned to {LEVEL.upper()} of the Common European "
        f"Framework of Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
        f"is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "The Persian taught is the standard written language of Iran (Farsi), with the everyday "
        "spoken form shown beside a word where Tehran speech says it differently. "
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for Persian, so this deck is not any examination's vocabulary and does not claim to be. It "
        f"is assembled from two things that can be stated. {from_inv} of the {n} come from a "
        f"vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words of everyday Persian, taken from a "
        "frequency list built from film and television subtitles and counted by the WHOLE word, "
        "every form of a noun or a verb, and its spoken form, added together. The cards are dealt "
        "by that frequency, so the words you meet most often come first. "
        "Every headword is printed in the Persian script with a romanisation beneath it, "
        "Wiktionary's Iranian one (â for the long a, x for kh, š for sh: ketâb, xâne), since the "
        "script writes no short vowels; the Persian Alphabet deck, the first in this collection, "
        f"teaches the script itself. The {nouns} nouns show their plural; the {verbs} verbs show "
        "their present stem, which no rule derives from the infinitive and on which every present "
        "tense is built, and behind the All forms fold their present, past, future, subjunctive "
        "and imperative by person. "
        + EX_NOTE + ", with the word picked out in colour and a speaker beside the sentence and the "
        "headword. Sources. Level: the Common European Framework of Reference (Council of Europe), "
        "global scale. Meanings, forms and romanisation: English Wiktionary, via the "
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
        'tags': ['persian', 'farsi', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Persian vocabulary', 'speechLang': 'fa-IR',
            'fields': FIELDS,
            'cards': [
                {'name': 'Persian → English', 'front': FRONT_FA, 'back': BACK_FA},
                {'name': 'English → Persian', 'front': FRONT_EN, 'back': BACK_EN},
            ],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}

    import importlib.util as ilu
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dedupe-glosses.py')
    spec = ilu.spec_from_file_location('dedupe_glosses', p)
    dg = ilu.module_from_spec(spec)
    spec.loader.exec_module(dg)
    st = dg.dedupe(deck, 'Persian')
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
