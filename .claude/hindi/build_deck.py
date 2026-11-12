#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL shape.  The word is a single
record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is HINDI -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in Devanagari, with Wiktionary's ROMANISATION beneath it
    (khānā, ma͠i: the owner's decision, 2026-11-09), so a learner still reading
    slowly is never stuck on the script;
  · the meanings, grouped by part of speech, a noun's GENDER in its label --
    Hindi has two and every adjective, postposition and past verb agrees;
  · one line of key forms: a noun's plural and oblique plural, an adjective's
    feminine, a verb's past (perfective) forms, which is where a Hindi verb is
    irregular (गया, किया, दिया, लिया, हुआ);
  · the forms tables behind a fold (a verb's present, future, subjunctive and
    imperative by person; a noun's cases; a pronoun's case forms);
  · up to three Tatoeba sentences, the word picked out, with a speaker.

The speaker reads the `Word` field, the bare Devanagari.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hi import fold, nfc
from hindi_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'hindi'
COLOR = '#9F51B4'
FIELDS = ['Hindi', 'Roman', 'Word', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'postp': 'postposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep': 'preposition',
            'prep_phrase': 'phrase', 'proverb': 'proverb', 'name': 'proper noun'}
GENDER = {'m': 'masculine', 'f': 'feminine', 'mf': 'masculine or feminine'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = ('<div class="uc-word">{{Hindi}}' + SAY + '</div>'
        '{{#Roman}}<div class="uc-rom">{{Roman}}</div>{{/Roman}}')
ASK = '<div class="uc-ask">Say it in Hindi</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_HI = WORD
BACK_HI = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape


# ---- glosses ---------------------------------------------------------------------------
TRAIL = re.compile(r'\s*[:;,]\s*$')


# A GLOSS THAT ONLY NAMES A SYNONYM ("synonym of जल्दी (jaldī)") is given the synonym's
# own first meaning, the synonym named after it: a card defined by a pointer teaches
# nothing (A2: जल्द, असल, निजी).
SYNONYM = re.compile(r'^synonym of (\S+) \(([^()]+)\)$')
LEX = {}

# A ROMANISATION Wiktionary's page carries in its Hindi headword but the extract lost.
ROMAN = {'फ़िल्म': 'film', 'गर्भवती': 'garbhvatī', 'उपग्रह': 'upgrah'}  # A2, B1


# "hyperforeign form of रिवाज" (the nukta added where it does not belong) is a note on
# spelling, not a meaning; the entry's other sense carries the meaning (B1).
HYPER = re.compile(r'^hyperforeign form of ', re.I)


def gloss_text(g):
    g = TRAIL.sub('', g)
    if HYPER.match(g):
        return ''
    m = SYNONYM.match(g)
    if m:
        tgt = LEX.get(fold(m.group(1))) or {}
        mean = next((x['g'] for e in tgt.get('entries', []) for x in e['glosses']
                     if x['g'] and not x['weak'] and not SYNONYM.match(x['g'])), '')
        if mean:
            g = f'{TRAIL.sub("", mean)} (= {m.group(1)}, {m.group(2)})'
    return g


# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here.  Hindi is
# full of homographs from unrelated sources -- `में` "in" and "baa (of a sheep)",
# `पाना` "to get" and "spanner", `मत` "not" and "opinion", `काम` "work" and "lust"
# -- and a beginner's card that offers all of them teaches the noise.  Where the
# first etymology is NOT the everyday word, or two are, the card names which:
ETYMS = {
    'अगर': ['2'],             # "if"; etymology 1 is agarwood
    'कार': ['3'],             # "car"; 1 and 2 are "tax" and "action" (Sanskrit, literary)
    'वाह': ['2'],             # "wow"; 1 is "carrier"
    'आराम': ['2'],            # "rest"; 1 is "sensual pleasure"
    'पर': ['1', '2'],         # "on" AND "but", both everyday
    'खाना': ['1', '2'],       # "food" AND "to eat"
    'सोना': ['2', '1'],       # "to sleep" AND "gold"
    'बस': ['1', '3'],         # "only, enough" AND "bus"
    'आम': ['1', '2'],         # "mango" AND "common"
    'सर': ['4', '1'],
    'राय': ['2'],             # "opinion"; 1 is "king" (A2)
    'पीठ': ['2'],             # "back (of the body)"; 1 is "seat, bench"
    'सीना': ['2', '1'],       # "chest" AND "to sew"
    'जरा': [''],              # "a little" (ज़रा); 1 is "infirmity"
    'धरना': ['1', '2'],       # "to hold" AND "sit-in"
    'शुक्र': ['2'],           # "gratitude" (शुक्र है); 1 is "resplendent; semen" (B1)
    'बिल': ['2', '1'],        # "bill" AND "hole"
    'हिंदी': [None, ''],      # the language (a proper noun, no etymology number) leads         # "sir" (the subtitles' count) AND "head"
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech: its entry for
# the language is three encyclopaedia sentences on dialect zones.
GLOSS = {
    'हिंदी': {'name': ['Hindi (the language)']},
    # Wiktionary's third sense is vulgar slang; a level deck leaves it out (A2)
    'हथियार': {'noun': ['weapon, arm', 'any instrument']},
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'चीनी': 'sugar',          # first listed is "Chinese person"
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
    if L['word'] == 'हिंदी':
        ents = sorted(ents, key=lambda e: e['pos'] != 'name')
        keep = [e.get('etym', '') for e in ents]
    ents = sorted([e for e in ents if e.get('etym', '') in keep],
                  key=lambda e: keep.index(e.get('etym', '')))
    if row['pos']:
        ents = sorted(ents, key=lambda e: e['pos'] != row['pos'])
    # one block per part of speech, in the order the entries come
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
        if e['pos'] == 'noun' and e['gender'] in GENDER:
            label += ', ' + GENDER[e['gender']]
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
            t = gloss_text(g['g'])
            if not t:
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
            continue          # a block saying only what one above it said (कल: adverb, then noun)
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
    return (f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(t["f"])}'
            f'<span class="uc-fr">{E(t["r"])}</span></span>')


def forms_line(e, word):
    tb = e['table']
    if not tb:
        return ''
    bits = []
    if e['pos'] == 'noun':
        dp = cell(tb, 'direct', 'plural')
        op = cell(tb, 'oblique', 'plural')
        if dp and fold(dp['f']) != fold(word):
            bits.append(fi('plural', dp))
        bits.append(fi('oblique plural', op))
    elif e['pos'] == 'adj':
        fe = cell(tb, 'feminine', 'singular', 'direct') or cell(tb, 'feminine', 'singular')
        if fe and fold(fe['f']) != fold(word):
            bits.append(fi('feminine', fe))
            bits.append(fi('plural', cell(tb, 'direct', 'masculine', 'plural')))
    elif e['pos'] == 'verb':
        bits.append(fi('past', cell(tb, 'direct', 'masculine', 'perfective', 'singular',
                                    skip=('adjectival',))))
        bits.append(fi('feminine', cell(tb, 'feminine', 'perfective', 'singular',
                                        skip=('adjectival', 'indicative'))))
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


def row(label, t, extra=''):
    if not t:
        return ''
    return (f'<div class="uc-cjr"><span class="uc-cj-p">{E(label)}</span>'
            f'<span class="uc-cj-f">{E(t["f"])}<span class="uc-fr">{E(t["r"])}</span></span></div>')


def block(head, rows):
    rows = [r for r in rows if r]
    if not rows:
        return ''
    return f'<div class="uc-cj"><div class="uc-cjh">{E(head)}</div>{"".join(rows)}</div>'


PERSONS = [('मैं', ('first-person', 'singular'), ()),
           ('तू / वह', ('third-person', 'singular'), ()),
           ('तुम', ('second-person', 'plural'), ('formal',)),
           ('हम / वे', ('third-person', 'plural'), ('formal',)),
           ('आप', ('second-person', 'plural', 'formal'), ())]


def by_person(tb, base, skip=()):
    return [row(p, cell(tb, *(base + need), skip=skip + sk)) for p, need, sk in PERSONS]


def table_html(e):
    tb = e['table']
    if not tb:
        return ''
    if e['pos'] == 'verb':
        blocks = [
            block('key forms', [row('stem', cell(tb, 'stem')),
                                row('infinitive', cell(tb, 'infinitive')),
                                row('having …-ed', cell(tb, 'conjunctive')),
                                row('habitual', cell(tb, 'direct', 'habitual', 'masculine', 'singular',
                                                     skip=('adjectival',))),
                                row('past, m. sg.', cell(tb, 'direct', 'masculine', 'perfective', 'singular',
                                                         skip=('adjectival',))),
                                row('past, m. pl.', cell(tb, 'masculine', 'perfective', 'plural',
                                                         skip=('adjectival', 'indicative', 'oblique'))),
                                row('past, f. sg.', cell(tb, 'feminine', 'perfective', 'singular',
                                                         skip=('adjectival', 'indicative')))]),
            block('present (masculine)', by_person(tb, ('indicative', 'present', 'masculine'),
                                                   skip=('feminine', 'perfect', 'past'))),
            block('future (masculine)', by_person(tb, ('future', 'indicative', 'masculine'),
                                                  skip=('feminine',))),
            block('subjunctive', by_person(tb, ('future', 'subjunctive'))),
            block('imperative', [row('तू', cell(tb, 'imperative', 'present', 'singular')),
                                 row('तुम', cell(tb, 'imperative', 'present', 'plural', 'second-person',
                                                 skip=('formal',))),
                                 row('आप', cell(tb, 'imperative', 'present', 'formal', 'second-person'))]),
        ]
        # the present's persons share their tags with the habitual past only through
        # `past`; the subjunctive's 2sg and 3sg are one form, so its person rows are the same
    elif e['pos'] == 'noun':
        blocks = [block('singular', [row('direct', cell(tb, 'direct', 'singular')),
                                     row('oblique', cell(tb, 'oblique', 'singular')),
                                     row('vocative', cell(tb, 'vocative', 'singular'))]),
                  block('plural', [row('direct', cell(tb, 'direct', 'plural')),
                                   row('oblique', cell(tb, 'oblique', 'plural')),
                                   row('vocative', cell(tb, 'vocative', 'plural'))])]
    elif e['pos'] == 'adj':
        blocks = [block('masculine', [row('direct singular', cell(tb, 'direct', 'masculine', 'singular')),
                                      row('plural, oblique', cell(tb, 'masculine', 'plural', skip=('vocative',)))]),
                  block('feminine', [row('every form', cell(tb, 'feminine', 'singular', 'direct'))])]
    elif e['pos'] in ('pron', 'det'):
        cases = [('direct', 'direct'), ('oblique', 'indirect'), ('with ने', 'ergative'),
                 ('of (का)', 'genitive'), ('to (को)', 'dative')]
        sg = [row(l, cell(tb, t, skip=('plural',))) for l, t in cases]
        pl = [row(l, cell(tb, t, 'plural')) for l, t in cases]
        blocks = [block('singular' if any(pl) else 'forms', sg), block('plural', pl)]
    else:
        return ''
    blocks = [b for b in blocks if b]
    if len(blocks) < 1:
        return ''
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>'


# ---- examples --------------------------------------------------------------------------
def mark(sentence, hits):
    hs = set(hits)
    out = []
    for piece in re.split(r'([ऀ-ॣ०-ॿ‌‍]+)', sentence):
        if piece and fold(piece) in hs:
            out.append(f'<b>{E(piece)}</b>')
        else:
            out.append(E(piece))
    return ''.join(out)


def examples_html(exs, multi):
    out = []
    for hi, en, hits in exs:
        if multi:
            hits = list(hits)
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(hi)}"></span>{mark(hi, hits)}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>')
    return ''.join(out)


def build(rows, lex, exs):
    LEX.update(lex)
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        main = ents[0]
        word = r['word']
        roman = main['roman'] or next((e['roman'] for e in ents if e['roman']), '') \
            or ROMAN.get(word, '')
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Hindi': f'<div class="uc-word">{E(word)}</div>',
            'Roman': E(roman),
            'Word': word,
            'English': english(ents, word),
            'Forms': forms_line(main, word),
            'Table': table_html(main),
            'Examples': examples_html(ex, ' ' in word),
        }})
        entries.append({'word': word, 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex), 'roman': bool(roman)})
    return cards, entries


WHO = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner',
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
        "Both study directions in one deck: Hindi → English (see the Hindi, recall the meaning) "
        "and English → Hindi (see an English meaning, recall the Hindi). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words for {WHO[LEVEL]}, aligned to {LEVEL.upper()} of the Common European "
        f"Framework of Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
        f"is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for Hindi, so this deck is not any examination's vocabulary and does not claim to be. It "
        f"is assembled from two things that can be stated. {from_inv} of the {n} come from a "
        f"vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words of everyday Hindi, taken from a "
        "frequency list built from film and television subtitles and counted by the WHOLE word, "
        "every form of a noun or a verb added together. The cards are dealt by that frequency, so "
        "the words you meet most often come first. "
        "Every headword is printed in Devanagari with a romanisation beneath it, Wiktionary's own "
        "(ā ī ū for the long vowels, a tilde or a dot for nasalisation: khānā, ma͠i), so the deck "
        "can be studied before the script is fluent; the Hindi Alphabet deck, the first in this "
        f"collection, teaches the script itself. The {nouns} nouns show their gender, masculine or "
        "feminine, which every adjective, postposition and past-tense verb agrees with, and their "
        f"plural; the {verbs} verbs show their past forms, where Hindi verbs are irregular, and "
        "behind the All forms fold their present, future, subjunctive and imperative by person. "
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
        'tags': ['hindi', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Hindi vocabulary', 'speechLang': 'hi-IN',
            'fields': FIELDS,
            'cards': [
                {'name': 'Hindi → English', 'front': FRONT_HI, 'back': BACK_HI},
                {'name': 'English → Hindi', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Hindi')
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
