#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Hindi shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss
is corrected both ways at once and each direction keeps its own schedule.  Card
1 is TELUGU -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in Telugu script, with Wiktionary's ROMANISATION beneath it
    (nēnu, cēyu: ISO 15919, ā ē ō for the long vowels, ṭ ḍ ṇ ḷ for the
    retroflex letters), so a learner still reading slowly is never stuck;
  · the meanings, grouped by part of speech, a noun's GENDER in its label as
    Wiktionary gives it (masculine, feminine, neuter) -- in Telugu it is the
    verb that agrees, masculine against everything else;
  · one line of key forms: a noun's plural (and its oblique, where it changes:
    `ఇల్లు`, `ఇంటి`), a verb's past and future for "I", where its stem moves
    (`తిను` -> `తిన్నాను`, `తింటాను`) -- each only where Wiktionary has it;
  · the forms tables behind a fold (a noun's or pronoun's six cases; a verb's
    present continuous, past and future by person, the regular tables only --
    `extract.py` says why);
  · Tatoeba sentences, the word picked out, with a speaker -- few: Tatoeba holds
    about three hundred Telugu sentences with an English translation.

The speaker reads the `Word` field, the bare Telugu.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from te import fold
from telugu_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'telugu'
COLOR = '#228122'
FIELDS = ['Telugu', 'Roman', 'Word', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'postp': 'postposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep': 'postposition',
            'prep_phrase': 'phrase', 'proverb': 'proverb', 'name': 'proper noun'}
GENDER = {'m': 'masculine', 'f': 'feminine', 'n': 'neuter'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = ('<div class="uc-word">{{Telugu}}' + SAY + '</div>'
        '{{#Roman}}<div class="uc-rom">{{Roman}}</div>{{/Roman}}')
ASK = '<div class="uc-ask">Say it in Telugu</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_TE = WORD
BACK_TE = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape
TRAIL = re.compile(r'\s*[:;,]\s*$')


def gloss_text(g):
    return TRAIL.sub('', g)


# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here (the Hindi
# rule).  Telugu homographs from unrelated roots are many -- `చెప్పు` "shoe" and "to
# tell", `అడుగు` "foot" and "to ask", `పన్ను` "tax" and "tooth", `కారు` "to trickle",
# "black", "season" and "car".  Where the first is not the everyday word:
ETYMS = {
    'అని': ['2'],             # the quotative "that, saying"; etymology 1 is "battle"
    'గంట': ['2'],             # "bell; hour"; 1 is "stub of a cornstalk"
    'పన్ను': ['2'],           # "tooth" (A1's body topic); 1 is "tax"
    'చెప్పు': ['2', '1'],     # "to tell" AND "shoe", both everyday
    'అడుగు': ['2', '1'],      # "to ask" AND "foot"
    'కారు': ['4'],            # "car"
    'కాలు': ['1'],            # "leg, foot"; 2 is "to burn"
}

# THE PART OF SPEECH TO LEAD WITH, where Wiktionary's first entry is not the reading
# a learner means: `ప్రతి` opens on "a Sanskrit particle" before the adjective "every".
PREFER = {'ప్రతి': 'adj', 'మంచి': 'adj', 'తీపి': 'adj', 'దగ్గర': 'adv'}

# THE ONLY PARTS OF SPEECH SHOWN, where Wiktionary has a stray homograph in the same
# etymology: `లేదు` "no, not" is also listed as a noun "bear", `యొక్క` "of" as a verb.
ONLY = {'లేదు': {'adv'}, 'యొక్క': {'postp'}}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'సమయము': 'time',          # first listed is "opportunity, occasion"
    'ఉదయము': 'morning',       # first listed is "birth"
    'గంట': 'hour',
    'సమస్య': 'problem',       # first listed is a term of verse composition
    'వ్యక్తి': 'person',       # first listed is "an incarnation"
    'ఉద్యోగము': 'job',
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech.
GLOSS = {
    'తెలుగు': {'name': ['Telugu (the language)']},
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
    ents = sorted([e for e in ents if e.get('etym', '') in keep],
                  key=lambda e: keep.index(e.get('etym', '')))
    if L['word'] in ONLY:
        ents = [e for e in ents if e['pos'] in ONLY[L['word']]]
    lead = row['pos'] or PREFER.get(L['word'], '')
    if lead:
        ents = sorted(ents, key=lambda e: e['pos'] != lead)
    out, seen = [], {}
    for e in ents:
        if e['pos'] in seen:
            out[seen[e['pos']]]['glosses'] += e['glosses']
            continue
        seen[e['pos']] = len(out)
        out.append(dict(e, glosses=list(e['glosses'])))
    return out[:3], L['word']


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
def cell(table, *need, skip=()):
    for t in table:
        tags = set(t['t'])
        if all(n in tags for n in need) and not (tags & set(skip)):
            return t
    return None


def verb_cell(table, tense, who):
    return next((t for t in table if t.get('tense') == tense and t.get('who') == who), None)


def fi(label, t):
    if not t:
        return ''
    r = f'<span class="uc-fr">{E(t["r"])}</span>' if t.get('r') else ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(t["f"])}{r}</span>'


def forms_line(e, word):
    tb, hd = e['table'], e.get('heads') or []
    bits = []
    if e['pos'] == 'noun':
        pl = cell(tb, 'nominative', 'plural') or cell(hd, 'plural')
        if pl and fold(pl['f']) != fold(word):
            bits.append(fi('plural', pl))
        ob = cell(tb, 'genitive', 'singular') or cell(hd, 'genitive')
        if ob and fold(ob['f']) != fold(word):
            bits.append(fi('oblique', ob))
    elif e['pos'] == 'verb':
        bits.append(fi('past, I', verb_cell(tb, 'past', '1s')))
        bits.append(fi('future, I', verb_cell(tb, 'future', '1s')))
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


def row(label, t):
    if not t:
        return ''
    r = f'<span class="uc-fr">{E(t["r"])}</span>' if t.get('r') else ''
    return (f'<div class="uc-cjr"><span class="uc-cj-p">{E(label)}</span>'
            f'<span class="uc-cj-f">{E(t["f"])}{r}</span></div>')


def block(head, rows):
    rows = [r for r in rows if r]
    if not rows:
        return ''
    return f'<div class="uc-cj"><div class="uc-cjh">{E(head)}</div>{"".join(rows)}</div>'


PERSONS = [('నేను', '1s'), ('మేము', '1p'), ('నువ్వు', '2s'), ('మీరు / వారు', '2p'),
           ('అతను', '3m'), ('ఆమె', '3f'), ('అది', '3n')]
CASES = [('nominative', 'nominative'), ('accusative', 'accusative'), ('genitive', 'genitive'),
         ('dative', 'dative'), ('locative', 'locative'), ('instrumental', 'instrumental')]


def table_html(e):
    tb = e['table']
    if not tb:
        return ''
    if e['pos'] == 'verb':
        if not any(t.get('tense') for t in tb):
            return ''
        blocks = []
        for tense in ('present continuous', 'past', 'future'):
            rows, last = [], None
            for label, who in PERSONS:
                t = verb_cell(tb, tense, who)
                if who == '3n' and t and last and t['f'] == last['f']:
                    rows[-1] = row('ఆమె / అది', last)     # one form for she and it
                    continue
                rows.append(row(label, t))
                last = t
            blocks.append(block(tense, rows))
    elif e['pos'] in ('noun', 'pron', 'det'):
        sg = [row(l, cell(tb, c, 'singular')) for l, c in CASES]
        pl = [row(l, cell(tb, c, 'plural')) for l, c in CASES]
        blocks = [block('singular' if any(pl) else 'forms', sg), block('plural', pl)]
    else:
        return ''
    blocks = [b for b in blocks if b]
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>' if blocks else ''


# ---- examples --------------------------------------------------------------------------
def mark(sentence, hits):
    hs = set(hits)
    out = []
    for piece in re.split(r'([ఀ-ౣ౦-౿‌‍]+)', sentence):
        out.append(f'<b>{E(piece)}</b>' if piece and fold(piece) in hs else E(piece))
    return ''.join(out)


def examples_html(exs):
    out = []
    for te, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(te)}"></span>{mark(te, hits)}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>')
    return ''.join(out)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents, lemma = entries_for(r, lex)
        if not ents:
            continue
        main = ents[0]
        word = r['word']
        roman = main['roman'] or next((e['roman'] for e in ents if e['roman']), '')
        # THE ROMANISATION OF THE SPELLING PRINTED, never the headword's: a card that
        # prints `పుస్తకం` says pustakaṁ, not pustakamu (`extract.py`, `spellings`)
        L = lex[r['via']] if r.get('via') else lex[r['key']]
        if r.get('via'):
            roman = lex[r['key']].get('roman') or roman
        elif word != L['word']:
            sp = (L.get('spellings') or {}).get(word)
            if not sp and word.endswith('ం') and L['word'] == word[:-1] + 'ము' and roman.endswith('mu'):
                # the -ం spelling of a word Wiktionary has only under -ము (`కోసం`, `అర్థం`):
                # its romanisation is Wiktionary's own rule for the -ం entries it does have
                # (pustakamu -> pustakaṁ), applied to this one
                sp = roman[:-2] + 'ṁ'
            roman = sp or roman
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Telugu': f'<div class="uc-word">{E(word)}</div>',
            'Roman': E(roman),
            'Word': word,
            'English': english(ents, lemma),
            'Forms': forms_line(main, word),
            'Table': table_html(main),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex), 'roman': bool(roman)})
    return cards, entries


def desc(entries, n):
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    ex1 = sum(1 for e in entries if e['examples'])
    nouns = sum(1 for e in entries if e['pos'] == 'noun')
    verbs = sum(1 for e in entries if e['pos'] == 'verb')
    SC = SCOPE[LEVEL]
    return (
        "Both study directions in one deck: Telugu → English (see the Telugu, recall the meaning) "
        "and English → Telugu (see an English meaning, recall the Telugu). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words for a beginner, aligned to {LEVEL.upper()} of the Common European "
        f"Framework of Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
        f"is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for Telugu, so this deck is not any examination's vocabulary and does not claim to be. It "
        f"is assembled from two things that can be stated. {from_inv} of the {n} come from a "
        f"vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words in a frequency list built from film "
        "and television subtitles, with the words the subtitles' machine translation had "
        "garbled taken out by hand. The cards are dealt by that frequency, so the words you meet "
        "most often come first. Every word is a dictionary word: one that English Wiktionary does "
        "not have was left out rather than given a meaning, which is why a few everyday loanwords "
        "are missing. Verbs are given in their dictionary form, the one ending in -u (తిను tinu, "
        "'to eat'). Every headword is printed in Telugu script with a romanisation beneath it, "
        "Wiktionary's own (ā ē ō for the long vowels, ṭ ḍ ṇ ḷ for the retroflex letters), so the "
        "deck can be studied before the script is fluent; the Telugu Alphabet deck, the first in "
        f"this collection, teaches the script itself. The {nouns} nouns show their gender where "
        "Wiktionary records it, and their plural; where Wiktionary has their tables, verbs show "
        "their past and future and behind the All forms fold their present continuous, past and "
        f"future by person, and nouns their six cases. Real example sentences come with {ex1} of "
        f"the {n} words — Tatoeba holds only a few hundred Telugu sentences with an English "
        "translation — with the word picked out in colour and a speaker beside the sentence and "
        "the headword. Sources. Level: the Common European Framework of Reference (Council of "
        "Europe), global scale. Meanings, gender, forms and romanisation: English Wiktionary, via "
        "the kaikki.org extraction (CC BY-SA 4.0). Frequency: a word list built from OpenSubtitles "
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
        'tags': ['telugu', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Telugu vocabulary', 'speechLang': 'te-IN',
            'fields': FIELDS,
            'cards': [
                {'name': 'Telugu → English', 'front': FRONT_TE, 'back': BACK_TE},
                {'name': 'English → Telugu', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Telugu')
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
