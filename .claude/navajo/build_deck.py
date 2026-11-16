#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / TORFL / Hausa shape.  The word is a single
record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is NAVAJO -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in the standard spelling, which already marks tone (á), nasal
    vowels (ą), long vowels (aa) and the glottal stop (ʼ) -- so, unlike Hausa,
    no second "toned" line; in its place, Wiktionary's IPA where it gives one;
  · the meanings, grouped by part of speech, as Wiktionary words them -- a verb
    in its third person ("he/she is eating it"), the form Navajo dictionaries
    cite a verb by;
  · one line of key forms: a noun's "my" and "his/her" forms (`shimá`, `bimá`)
    and its plural where it has one; a verb's "I" and "you" forms where
    Wiktionary has entries for them (`yáshtiʼ`, `yáníłtiʼ`);
  · up to three example sentences (examples.py), the word picked out.

NO SPEAKER BUTTON.  No browser or phone carries a Navajo voice, and a browser
asked for `nv` without one reads the word in its default voice -- English, in
practice -- which teaches a wrong pronunciation rather than none.  The type still
declares `speechLang: 'nv'`: the site reads it to leave the card's Navajo alone
(`spellTree`).
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nv import norm
from navajo_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE, LEARNER

STAMP = '2026-11-16T00:00:00.000Z'
TYPE_ID = 'navajo'
COLOR = '#3C7676'          # measured (app.js "lang-navajo"; docs/navajo-decks-plan.md)
FIELDS = ['Navajo', 'Say', 'Word', 'English', 'Forms', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'conj': 'conjunction',
            'particle': 'particle', 'intj': 'interjection', 'num': 'number',
            'phrase': 'phrase', 'postp': 'postposition'}

WORD = ('<div class="uc-word">{{Navajo}}</div>'
        '{{#Say}}<div class="uc-rom" title="pronunciation (IPA)">{{Say}}</div>{{/Say}}')
ASK = '<div class="uc-ask">Say it in Navajo</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
FRONT_NV = WORD
BACK_NV = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape

# WHICH PARTS OF SPEECH A CARD SHOWS, where Wiktionary files a second reading that would
# mislead on a beginner's card.  Each with its reason.
POS_ONLY = {
    'ní': ['verb'],          # "he/she says"; the pronoun "you" is `ni`, its own card
    'óola': ['noun'],        # both readings are nouns ("gold", "hour"); see GLOSS
    'bił': ['postp'],        # "with him/her"; the noun is "drowsiness"
    'doo': ['particle'],     # the negative; the verb reading is a past-conjecture construction
    'ádin': ['verb'],        # "there is none"; the number reading is "zero"
    'dinééh': ['noun'],      # "young man"; the verb is "he/she moves house"
    # A2 (2026-11-16)
    'náhookǫs': ['noun'],    # "north"; the verb is "to turn over and over"
    'haʼaʼaah': ['noun'],    # "east"; the verb is "to take something out"
    'shádiʼááh': ['noun'],   # "south"; the verb is "a solid roundish object starts to be carried"
    'tłʼéʼííłnííʼ': ['adv'], # "midnight"; Wiktionary's noun reading ("bee") is a stray sense
    'ndikʼąʼ': ['noun'],     # "cotton, cloth"; the verb is "it burns"
    'naʼniyęęsh': ['noun'],  # "irrigation"; the verb is "to flow about"
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech, where its first
# sense is not the one the card teaches.  Each is one of Wiktionary's own senses, reordered
# or trimmed -- never a meaning it does not give.
GLOSS = {
    'óola': {'noun': ['hour, the hour', 'gold']},
    # A2 (2026-11-16)
    'bighaaʼ': {'noun': ['wool, fleece', 'fur']},
    'náhookǫs': {'noun': ['north', 'the Big Dipper']},
    # B1 (2026-11-16)
    'tʼáá shį́į́': {'adv': ['probably, in all probability']},  # its second "gloss" is a citation  # its third sense, the whirling-log sign, is not A2's
    'tsésǫʼ': {'noun': ['glass, window, pane', 'mica']},
}


# A GLOSS THAT IS A GRAMMATICAL POINTER, NOT A MEANING: Wiktionary files `naaltsoos` "book" with a
# verb reading "Simple passive form of neiłtsoos", `óltaʼ` "school" with "simple passive form of
# ółtaʼ".  A part of speech left with nothing else is not shown.
NOT_A_MEANING = re.compile(r'(?i)^(simple passive|reciprocal of|unpossessed form of|IPA)|\b(im)?perfective of\b|\bfuture (form )?of\b')


def entries_for(row, lex):
    L = lex[row['key']]
    ents = [e for e in L['entries'] if any(not g['weak'] for g in e['glosses'])] or L['entries']
    ents = [e for e in ents if any(not NOT_A_MEANING.search(g['g']) for g in e['glosses'])] or ents
    word = L['word']
    if norm(word) in POS_ONLY:
        ents = [e for e in ents if e['pos'] in POS_ONLY[norm(word)]] or ents
    if row['pos']:
        ents = sorted(ents, key=lambda e: e['pos'] != row['pos'])
    out, seen = [], {}
    for e in ents:
        if e['pos'] in seen:
            out[seen[e['pos']]]['glosses'] += e['glosses']
            continue
        seen[e['pos']] = len(out)
        out.append(dict(e, glosses=list(e['glosses'])))
    return out[:3]


def english(ents, word):
    parts, shown = [], set()
    for e in ents:
        label = POS_NAME.get(e['pos'], e['pos'])
        gl, seen = [], set()
        for g in e['glosses']:
            if g['weak'] and gl:
                continue
            if NOT_A_MEANING.search(g['g']):
                continue
            t = re.sub(r'\s*[:;,]\s*$', '', g['g'])
            if t and t not in seen:
                seen.add(t)
                gl.append(t)
        if e['pos'] in GLOSS.get(norm(word), {}):
            gl = list(GLOSS[norm(word)][e['pos']])
        gl = gl[:3]
        if not gl or all(x in shown for x in gl):
            continue
        shown.update(gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label)}</div>{body}</div>')
    return ''.join(parts)


def fi(label, form):
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(form)}</span>'


ASPECTS = {'perfective', 'imperfective', 'future', 'iterative', 'optative', 'progressive', 'usitative'}


def verb_forms(key, back):
    """A verb's "I" and "you" forms: Wiktionary entries that are its first- and second-person
    singular, the imperfective preferred (the aspect the headword is cited in)."""
    out = []
    for person, label in (('first-person', 'I'), ('second-person', 'you')):
        # the imperfective, or a neuter verb's only form (no aspect tag) -- never a perfective or
        # future form beside an imperfective headword
        cands = [x for x in back.get(key, []) if person in x['tags'] and 'singular' in x['tags']
                 and 'duoplural' not in x['tags'] and 'plural' not in x['tags']
                 and ('imperfective' in x['tags'] or not ASPECTS & set(x['tags']))]
        cands.sort(key=lambda x: ('imperfective' not in x['tags'], x['word']))
        if cands:
            out.append(fi(label, cands[0]['word']))
    return out


def forms_line(ents, word, key, back):
    bits = []
    e = ents[0]
    if e['pos'] == 'noun':
        fs = e['forms']
        for k in ('my', 'his/her'):
            # (the a- form's own table carries the 'my' cell; a folded bi- form's is the same)
            x = next((x for x in fs if x['k'] == k and norm(x['f']) != norm(word)), None)
            if x:
                bits.append(fi(k, x['f']))
        for x in [x for x in fs if x['k'] == 'plural'][:1]:
            bits.append(fi('plural', x['f']))
    elif e['pos'] == 'verb':
        bits = verb_forms(key, back)
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


TOKEN_SPLIT = re.compile(r"([^\W\d_](?:[^\W\d_]|[̀-ͯʼ'’])*)")


def mark(sentence, hits):
    hs = set(hits)
    out = []
    for piece in TOKEN_SPLIT.split(sentence):
        if piece and norm(piece) in hs:
            out.append(f'<b>{E(piece)}</b>')
        else:
            out.append(E(piece))
    return ''.join(out)


def clean_en(en):
    return re.sub(r'^Audio:\s*\(file\)\s*[—-]\s*', '', en)


def examples_html(exs):
    return ''.join(f'<div class="uc-exi"><div class="uc-exz">{mark(nv, hits)}</div>'
                   f'<div class="uc-exe">{E(clean_en(en))}</div></div>' for nv, en, hits in exs)


def build(rows, lex, exs, back):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        word = lex[r['key']]['word']
        ipa = next((e['ipa'] for e in ents if e['ipa']), '')
        ex = exs.get(r['key'], [])
        cards.append({'sub': r.get('sub', ''), 'fields': {
            'Navajo': E(r.get('show') or word),
            'Say': E(ipa),
            'Word': word,
            'English': english(ents, word),
            'Forms': forms_line(ents, word, r['key'], back),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': ents[0]['pos'], 'source': r['source'], 'sub': r.get('sub', ''),
                        'examples': len(ex), 'ipa': bool(ipa)})
    return cards, entries


def desc(entries, n):
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    ex3 = sum(1 for e in entries if e['examples'] == 3)
    ex0 = sum(1 for e in entries if e['examples'] == 0)
    ipa = sum(1 for e in entries if e['ipa'])
    SC = SCOPE[LEVEL]
    return (
        "Both study directions in one deck: Navajo → English (see the Navajo, recall the meaning) "
        "and English → Navajo (see an English meaning, recall the Navajo). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words for {LEARNER[LEVEL]}, aligned to {LEVEL.upper()} of the Common European "
        f"Framework of Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
        f"is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for Navajo (Diné bizaad), so this deck is not any examination's vocabulary and does not claim "
        + (f"to be. It is assembled from two things that can be stated. {from_inv} of the {n} come from a "
           f"vocabulary written for the level's scope — {SC['topics']} — and the other {n - from_inv} are "
           "the commonest remaining words found in BOTH of two small corpora: the Navajo Wikipedia and the "
           "example sentences of English Wiktionary's Navajo entries. Each word is counted by the WHOLE word "
           "(a noun's possessed forms and a verb's persons added together), and a word must be in both, "
           "since the Wikipedia is mostly short articles about animals and plants. The cards are dealt by "
           "that count, so the words you meet most often come first. " if from_inv < n else
           # B1: the levels below took every word both corpora count, so all of it is the written
           # vocabulary, and the corpora only order it where they know it at all
           f"to be. All {n} of its words come from a vocabulary written for the level's scope — "
           f"{SC['topics']} — chosen from English Wiktionary's Navajo entries, since the levels below "
           "already teach every word that both the Navajo Wikipedia and Wiktionary's own example sentences "
           "use. The cards are dealt by those two counts where a word has one, and the rest follow. ")
        + "Every headword is printed in the standard Navajo spelling, which writes what English spelling "
        "has no letter for: a high tone with an acute accent (á), a nasal vowel with a hook (ą), a long "
        "vowel doubled (aa), the glottal stop as ʼ, and ł for the sound of Welsh ll. "
        f"{ipa} of the {n} words also show their pronunciation in the International Phonetic Alphabet, "
        "where English Wiktionary gives it. A verb is given as Navajo dictionaries cite it, in the third "
        "person ('he/she is eating it'), with its 'I' and 'you' forms where the source has them; a noun "
        "for a relative or a part of the body is always somebody's in Navajo, and the card prints it as "
        "'my …' and 'his/her …' (shimá, bimá 'mother'). "
        + ('Every word carries three real example sentences' if ex3 == n else
           f'Real example sentences come with {n - ex0} of the {n} words, three apiece for {ex3} of them')
        + ", with the word picked out in colour; they are English Wiktionary's own usage examples and, "
        "for a few, Tatoeba's. There is no read-aloud button: no device carries a Navajo voice, and one "
        "without it reads the word in English. The Navajo Alphabet deck, the first in this collection, "
        "teaches the letters and sounds. Sources. Level: the Common European Framework of Reference "
        "(Council of Europe), global scale. Meanings, forms, pronunciation and most example sentences: "
        "English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Frequency: the Navajo "
        "Wikipedia (dump of 2026-11-01, CC BY-SA 4.0) and Wiktionary's examples. A few sentences: "
        "Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    D = json.load(open('lex.json', encoding='utf-8'))
    lex = D['lemmas']
    back = {}
    for p, ps in D['pointers'].items():
        for x in ps:
            back.setdefault(x['to'], []).append(x)
    exs = json.load(open(f('examples.json'), encoding='utf-8'))
    cards, entries = build(rows, lex, exs, back)
    DECK = DECK_IDS[LEVEL]
    for i, c in enumerate(cards, 1):
        c['id'] = f'u_{DECK}_{i}'
        c['type'] = TYPE_ID
    n = len(cards)
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': f'{n} words · both directions, as two cards per word',
        'desc': desc(entries, n),
        'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['navajo', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Navajo vocabulary', 'speechLang': 'nv',
            'fields': FIELDS,
            'cards': [
                {'name': 'Navajo → English', 'front': FRONT_NV, 'back': BACK_NV},
                {'name': 'English → Navajo', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Navajo')
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
