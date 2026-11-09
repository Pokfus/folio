#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Hindi shape.  The word is a single
record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is TAMIL -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in Tamil script, with Wiktionary's ROMANISATION beneath it
    (vīṭu, pōkiṟēṉ -- ISO 15919, which tells ṉ from n, ṟ from r and ḷ ḻ from
    l), as the Hindi decks carry theirs;
  · the meanings, grouped by part of speech; a verb is cited by its stem, which
    is its plain imperative (`போ` "go!"), as Wiktionary cites it;
  · one line of key forms: a noun's plural, accusative and locative (Tamil
    nouns change their stem before a case ending: `வீடு` -> `வீட்டை`,
    `மரம்` -> `மரத்தில்`), a pronoun's accusative and dative (`என்னை`,
    `எனக்கு`), a verb's past, infinitive and adverbial participle, which is
    where a Tamil verb is irregular (`போனேன்`, `வந்தேன்`, `சொன்னேன்`);
  · the forms tables behind a fold (a verb's present, past and future by
    person, and its everyday non-finite forms; a noun's or pronoun's cases);
  · Tatoeba sentences where there are any, the word picked out, with a speaker.

The speaker reads the `Word` field, the bare Tamil.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ta import fold, nfc, bare
from tamil_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'tamil'
COLOR = '#6F69D2'
FIELDS = ['Tamil', 'Roman', 'Word', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'postp': 'postposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep': 'preposition',
            'prep_phrase': 'phrase', 'proverb': 'proverb', 'name': 'proper noun'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = ('<div class="uc-word">{{Tamil}}' + SAY + '</div>'
        '{{#Roman}}<div class="uc-rom">{{Roman}}</div>{{/Roman}}')
ASK = '<div class="uc-ask">Say it in Tamil</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_TA = WORD
BACK_TA = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape


# ---- glosses ---------------------------------------------------------------------------
TRAIL = re.compile(r'\s*[:;,]\s*$')


def gloss_text(g):
    g = re.sub(r'\s*\(see usage notes?\)', '', g)
    g = TRAIL.sub('', g)
    # Tamil Wiktionary ends many glosses with a full stop; no other deck's do
    if g.endswith('.') and not g.endswith('etc.') and g.count('.') == 1:
        g = g[:-1]
    return g


SYN = re.compile(r'^synonym of (\S+)', re.I)


# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here.  Tamil, like
# Hindi, is full of homographs from unrelated sources -- `கார்` "car" and "blackness,
# the monsoon", `மணி` "hour" and "bell" and "gem", `கால்` "leg" and "channel" and
# "forest" -- and a beginner's card that offers all of them teaches the noise.  (An
# inventory word that names its part of speech, `நீ:pron`, is filtered by that
# instead: `select.py`.)  Where the first etymology is NOT the everyday word:
ETYMS = {
    'கார்': ['4'],            # "car"; 1-3 are blackness / the monsoon, to darken, to be pungent
    'மணி': ['2'],             # "hour, o'clock"; 1 is "bell; blackness", 3 is "gem"
    'நகரம்': ['2'],           # "city"; 1 is the name of the letter ந
    'மாலை': ['2'],            # "evening"; 1 is "garland"
    'கல்': ['2'],             # "to learn" (கற்று, the subtitles' count); 1 is "stone"
    'கூறு': ['2'],            # "to say" (கூறினார்); 1 is "knowledge, part"
    'கூடு': ['2'],            # "to join; to be possible" (கூடாது "must not"); 1 is "nest"
    'முறை': ['2'],            # "order, manner; time, occasion" (ஒரு முறை "once"); 1 is "to stiffen"
    'கிடை': ['2'],            # "to be obtained" (கிடைத்தது); 1 is "lying down"
    'சார்': ['4'],            # "sir"; 1 is "to depend upon"
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech: its entry for
# the language is a list of the language's three traditional divisions.
GLOSS = {
    'தமிழ்': {'name': ['Tamil (the language)']},
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'அதனால்': 'therefore',    # first listed is "instrumental case of அது"
    'முடி': 'to can',         # the subtitles' count is முடியும் / முடியாது, "can" / "cannot"
}


def resolve_syn(e, lex):
    """An entry whose every sense is "Synonym of X" (இப்போது -> இப்பொழுது) takes X's
    meanings for the same part of speech; the card would otherwise define by pointer."""
    gl = [g for g in e['glosses'] if g['g']]
    if not gl or not all(SYN.match(g['g']) for g in gl):
        return e
    tgt = lex.get(fold(SYN.match(gl[0]['g']).group(1)))
    for te in (tgt or {}).get('entries', []):
        if te['pos'] == e['pos'] and te['glosses']:
            return dict(e, glosses=te['glosses'], table=e['table'] or te['table'])
    return e


def entries_for(row, lex):
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    ents = [resolve_syn(e, lex) for e in L['entries']]
    ents = [e for e in ents if any(not g['weak'] and g['g'] for g in e['glosses'])] or ents
    if row['pos']:
        want = row['pos'].split('+')
        ents = sorted([e for e in ents if e['pos'] in want], key=lambda e: want.index(e['pos']))
    else:
        groups = []
        for e in ents:
            if e.get('etym', '') not in groups:
                groups.append(e.get('etym', ''))
        keep = ETYMS.get(L['word'], groups[:1])
        ents = sorted([e for e in ents if e.get('etym', '') in keep],
                      key=lambda e: keep.index(e.get('etym', '')))
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
            if SYN.match(g['g']) and gl:
                continue          # "synonym of நாம் (nām) (inclusive)" after a real meaning
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
            continue          # a block saying only what one above it said (இன்று: adverb, then noun)
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


# A NOUN'S CASES.  Wiktionary's Tamil table tags the nominative, accusative, dative,
# benefactive, instrumental and ablative, but leaves the genitive, locative and
# sociative cells as "error-unrecognized-form"; they are told apart here by their
# ending, in the romanisation (marattiṉ, marattil, marattōṭu).
CASES = [('nominative', 'nominative'), ('accusative', 'accusative'), ('dative', 'dative'),
         ('genitive', 'gen'), ('locative', 'loc'), ('instrumental', 'instrumental'),
         ('sociative', 'soc'), ('ablative', 'ablative')]


def case_of(t):
    tags = set(t['t'])
    for _, c in CASES:
        if c in tags:
            return c
    if 'genitive' in tags:
        return 'gen' if not t['r'].endswith('uṭaiya') else 'gen2'
    if 'locative' in tags:
        return 'loc'
    r = t['r']
    if r.endswith('uṭaiya'):
        return 'gen2'
    if r.endswith('iṭam'):
        return 'loc2'
    if r.endswith('il'):
        return 'loc'
    if r.endswith('ōṭu'):
        return 'soc'
    if r.endswith('uṭaṉ'):
        return 'soc2'
    if r.endswith('ṉ'):
        return 'gen'
    return ''


def case_cell(tb, case, number):
    for t in tb:
        if number in t['t'] and case_of(t) == case:
            return t
    return None


def forms_line(e, word):
    tb = e['table']
    if not tb:
        return ''
    bits = []
    if e['pos'] == 'noun':
        pl = case_cell(tb, 'nominative', 'plural')
        if pl and fold(pl['f']) != fold(word):
            bits.append(fi('plural', pl))
        bits.append(fi('accusative', case_cell(tb, 'accusative', 'singular')))
        bits.append(fi('locative', case_cell(tb, 'loc', 'singular')))
    elif e['pos'] in ('pron', 'det', 'num'):
        num = 'singular' if case_cell(tb, 'accusative', 'singular') else 'plural'
        bits.append(fi('accusative', case_cell(tb, 'accusative', num)))
        bits.append(fi('dative', case_cell(tb, 'dative', num)))
    elif e['pos'] == 'verb':
        bits.append(fi('past (நான்)', cell(tb, 'first-person', 'past', 'singular', skip=VSKIP)))
        bits.append(fi('infinitive', cell(tb, 'infinitive', skip=('negative', 'future'))))
        bits.append(fi('having …', cell(tb, 'adverbial', 'participle', skip=('negative',))))
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


# The finite cells of a tense.  Every person a Tamil verb agrees with, the third
# person by gender and respect: he, she, he or she (respectful), it.
VSKIP = ('negative', 'participle', 'gerund', 'imperative', 'adjectival', 'conditional',
         'potential', 'cohortative', 'infinitive')
PERSONS = [('நான்', ('first-person', 'singular')),
           ('நீ', ('second-person', 'singular')),
           ('அவன்', ('third-person', 'masculine', 'singular')),
           ('அவள்', ('third-person', 'feminine', 'singular')),
           ('அவர்', ('third-person', 'honorific', 'singular')),
           ('அது', ('third-person', 'neuter', 'singular')),
           ('நாம் / நாங்கள்', ('first-person', 'plural')),
           ('நீங்கள்', ('second-person', 'plural')),
           ('அவர்கள்', ('third-person', 'epicene', 'plural')),
           ('அவை', ('third-person', 'neuter', 'plural'))]


def by_person(tb, tense):
    return [row(p, cell(tb, tense, *need, skip=VSKIP)) for p, need in PERSONS]


def table_html(e):
    tb = e['table']
    if not tb:
        return ''
    if e['pos'] == 'verb':
        blocks = [
            block('key forms', [
                row('infinitive', cell(tb, 'infinitive', skip=('negative', 'future'))),
                row('having …-ed', cell(tb, 'adverbial', 'participle', skip=('negative',))),
                row('without …-ing', cell(tb, 'adverbial', 'participle', 'negative')),
                row('if …', cell(tb, 'conditional', skip=('negative', 'future', 'informal'))),
                row('may …', cell(tb, 'potential', skip=('negative', 'future'))),
                row('let … (cohortative)', cell(tb, 'cohortative', skip=('negative', 'future'))),
                row('did not …', cell(tb, 'negative', 'first-person', 'second-person', 'singular')),
                row('that …-ed (past participle)', cell(tb, 'adjectival', 'participle', 'past',
                                                         skip=('negative',))),
            ]),
            block('present', by_person(tb, 'present')),
            block('past', by_person(tb, 'past')),
            block('future', by_person(tb, 'future')),
            block('imperative', [row('to one person', cell(tb, 'imperative', 'singular',
                                                           skip=('negative', 'perfect'))),
                                 row('polite / plural', cell(tb, 'imperative', 'plural',
                                                             skip=('negative', 'perfect', 'future'))),
                                 row('don\'t!', cell(tb, 'imperative', 'negative', 'singular')),
                                 row('don\'t! (polite)', cell(tb, 'imperative', 'negative', 'plural'))]),
        ]
    elif e['pos'] in ('noun', 'pron', 'det', 'num'):
        LABEL = {'nominative': 'nominative', 'accusative': 'accusative', 'dative': 'dative (to)',
                 'gen': 'genitive (of)', 'loc': 'locative (in, at)',
                 'instrumental': 'instrumental (by)', 'soc': 'sociative (with)',
                 'ablative': 'ablative (from)'}
        blocks = [block(num, [row(LABEL[c], case_cell(tb, c, num)) for _, c in CASES])
                  for num in ('singular', 'plural')]
        if e['pos'] != 'noun':
            blocks = [b for b in blocks if b]
            if len(blocks) == 1:
                blocks = [blocks[0].replace('>singular<', '>forms<').replace('>plural<', '>forms<')]
    else:
        return ''
    blocks = [b for b in blocks if b]
    if not blocks:
        return ''
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>'


# ---- examples --------------------------------------------------------------------------
def mark(sentence, hits):
    hs = set(hits)
    out = []
    for piece in re.split(r'([஀-௥௰-௿‌‍]+)', sentence):
        if piece and (fold(piece) in hs or bare(fold(piece)) in hs):
            out.append(f'<b>{E(piece)}</b>')
        else:
            out.append(E(piece))
    return ''.join(out)


def examples_html(exs, multi):
    out = []
    for ta_s, en, hits in exs:
        if multi:
            hits = list(hits)
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(ta_s)}"></span>{mark(ta_s, hits)}</div>'
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
        roman = main['roman'] or next((e['roman'] for e in ents if e['roman']), '')
        if r.get('via'):
            # A SPELLING WIKTIONARY FILES UNDER ANOTHER (வயது under வயசு, ரயில் under
            # இரயில்): the meanings are the target's, but its romanisation and its
            # tables spell the OTHER word, so the card takes the spelling's own
            # romanisation and shows no forms rather than forms of a different spelling.
            roman = r.get('roman', '')
            main = dict(main, table=[])
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Tamil': f'<div class="uc-word">{E(word)}</div>',
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


def desc(entries, n):
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    ex3 = sum(1 for e in entries if e['examples'] == 3)
    ex0 = sum(1 for e in entries if e['examples'] == 0)
    nouns = sum(1 for e in entries if e['pos'] == 'noun')
    verbs = sum(1 for e in entries if e['pos'] == 'verb')
    SC = SCOPE[LEVEL]
    if ex0 == n:
        EX_NOTE = 'No word carries an example sentence yet'
    elif ex3 == n:
        EX_NOTE = 'Every word carries three real example sentences'
    else:
        EX_NOTE = (f'Real example sentences come with only {n - ex0} of the {n} words — Tatoeba, '
                   'the open sentence collection, holds just a few hundred translated Tamil '
                   'sentences — ')
    return (
        "Both study directions in one deck: Tamil → English (see the Tamil, recall the meaning) "
        "and English → Tamil (see an English meaning, recall the Tamil). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words for a beginner, aligned to {LEVEL.upper()} of the Common European "
        f"Framework of Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
        f"is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for learners of Tamil, so this deck is not any examination's vocabulary and does not "
        "claim to be. It "
        f"is assembled from two things that can be stated. {from_inv} of the {n} come from a "
        f"vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words of Tamil, taken from a "
        "frequency list built from film and television subtitles and counted by the WHOLE word, "
        "every form of a noun or a verb added together. The cards are dealt by that frequency, so "
        "the words you meet most often come first. "
        "WHICH TAMIL: the written standard. Tamil is diglossic — people speak a colloquial Tamil "
        "that differs from the written language in its verb endings and many common words "
        "(written போகிறேன் pōkiṟēṉ, 'I go', is said pōṟēṉ) — and the dictionary forms taught "
        "here are the written ones, which every reader of signs, books and news needs and from "
        "which the spoken forms can be learnt. "
        "Every headword is printed in Tamil script with a romanisation beneath it, Wiktionary's own "
        "(ā ī ū ē ō for the long vowels, ṭ ṇ ḷ ḻ for the retroflex sounds, ṉ and ṟ for the "
        "alveolar n and r: vīṭu, pōkiṟēṉ), so the deck can be studied before the script is "
        "fluent; the Tamil Alphabet deck, the first in this collection, teaches the script "
        f"itself. A verb is shown, as dictionaries show it, by its stem, which is also its plain "
        f"command (போ, 'go!'). The {nouns} nouns show their plural and the stem their cases are "
        f"built on (வீடு, வீட்டை, வீட்டில் — house, the house, in the house); the {verbs} verbs "
        "show their past, where Tamil verbs are irregular, their infinitive and their 'having "
        "done' form, and behind the All forms fold their present, past and future by person. "
        + EX_NOTE + "with the word picked out in colour and a speaker beside the sentence and the "
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
        'tags': ['tamil', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Tamil vocabulary', 'speechLang': 'ta-IN',
            'fields': FIELDS,
            'cards': [
                {'name': 'Tamil → English', 'front': FRONT_TA, 'back': BACK_TA},
                {'name': 'English → Tamil', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Tamil')
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
