#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Hindi shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is SWAHILI -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword as a learner's dictionary prints it: a verb as its INFINITIVE
    (`kusoma`), an adjective or a possessive as its STEM with a hyphen (`-zuri`,
    `-angu`), since neither is ever said bare;
  · the meanings, grouped by part of speech, a noun's CLASS in its label
    (class 7/8, ki-vi) -- every adjective, verb and possessive agrees with it;
  · one line of key forms: a noun's plural, a verb's stem and negative
    infinitive, an adjective's forms with the three commonest classes;
  · up to three Tatoeba sentences, the word picked out, with a speaker.

The speaker reads the `Word` field.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sw import norm, tokens
from swahili_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'swahili'
COLOR = '#746163'          # the shelf's measured hue (app.js `lang-swahili`)
FIELDS = ['Swahili', 'Word', 'English', 'Forms', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'conj': 'conjunction',
            'particle': 'particle', 'intj': 'interjection', 'num': 'number',
            'phrase': 'phrase', 'prep': 'preposition', 'prep_phrase': 'phrase',
            'proverb': 'proverb'}
CLASS_NAME = {'1/2': 'm-wa', '3/4': 'm-mi', '5/6': 'ji-ma', '7/8': 'ki-vi', '9/10': 'n',
              '11': 'u', '11/6': 'u-ma', '15': 'ku', '16': 'pa',
              '9/10 or 5/6': 'n or ji-ma'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = '<div class="uc-word">{{Swahili}}' + SAY + '</div>'
ASK = '<div class="uc-ask">Say it in Swahili</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
FRONT_SW = WORD
BACK_SW = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape

# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here.  Swahili
# has many homographs from unrelated sources -- `pata` "to get" and "hinge", `taka`
# "to want" and "dirt", `pua` "nose" and "steel" -- and a beginner's card that
# offers all of them teaches the noise.  Where the first etymology is NOT the
# everyday word, or two are, the card names which:
ETYMS = {
    'jua': ['2', '1'],        # "to know" AND "sun", both A1
    'basi': ['2', '1'],       # "well, then; enough!" AND "bus"
    'ua': ['3', '1'],         # "to kill" AND "flower"; 2 is "yard"
    'kaa': ['2'],             # "to sit, stay"; 1 is "charcoal", 3 "crab"
    'kadhaa': ['2'],          # "several"; 1 is "requirement"
    'fahamu': ['2', '1'],     # "to understand" AND "understanding"
    'paa': ['2'],             # "roof" (A2's home); 1 is "duiker", 3 and 4 verbs
    'tupa': ['2'],            # "to throw"; 1 is "rasp"
    'chungu': ['3', '1'],     # "bitter" AND "cooking pot"; 2 is "ant", 4 "heap"
    'panga': ['2', '1'],      # "to arrange" AND "machete"
    'mhanga': ['2'],          # "sacrifice, casualty"; 1 is "aardvark"
    'buni': ['2'],            # "to construct; invent" (B1); 1 is "coffee berry"
    'bodi': ['2'],            # "board (managing committee)"; 1 is "a body"
    'hariri': ['2'],          # "to edit" (B1's media); 1 is "silk"
    'nya': ['2'],             # "to rain, drop like rain"; 1 is "to defecate"
    'kopa': ['2'],            # "to borrow" (B2's money); 1 is "heart" (the card suit)
    'saruji': ['2'],          # "concrete, cement" (B2's home); 1 is "saddle"
    'tembe': ['2'],           # "pill, tablet"; 1 is "hen"
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech, each with its reason.
GLOSS = {
    # Wiktionary's sense is the grammarian's "focus marker"; a learner meets it as the copula
    'ni': {'particle': ['is, are, am (the same for every person)', 'it is']},
    # the infinitive is met as a preposition far more than the verb; the gloss is Wiktionary's
    # own, from its `kuhusu` entry ("infinitive of -husu: involving, about"), ahead of the stem's
    'husu': {'verb': ['about, involving', 'to relate (to connect one topic with another)',
                      'to involve, to affect']},
}


# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'simu': 'telephone',      # first listed is "telegram"
    'mpira': 'ball',          # first listed is "a kind of creeper plant"
    'kiwanda': 'factory',     # first listed is "forge"
    'wito': 'calling',        # first listed is "infection, contagion"
}


def entries_for(row, lex):
    L = lex[row['key']]
    ents = [e for e in L['entries'] if any(not g['weak'] for g in e['glosses'])] or L['entries']
    groups = []
    for e in ents:
        if e['etym'] not in groups:
            groups.append(e['etym'])
    keep = ETYMS.get(row['key'], groups[:1])
    ents = sorted([e for e in ents if e['etym'] in keep], key=lambda e: keep.index(e['etym']))
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


def headword(e, word):
    if e['pos'] == 'verb':
        return e['inf'] or 'ku' + word          # `-pa`, `-ita`, `-ambia` list no infinitive
    if e['canon'] and e['pos'] in ('adj', 'pron', 'det', 'num', 'particle'):
        return e['canon']
    return word


def english(ents, key):
    parts, shown = [], set()
    for e in ents:
        label = POS_NAME.get(e['pos'], e['pos'])
        if e['pos'] == 'noun' and e['cls']:
            label += f", class {e['cls']} ({CLASS_NAME[e['cls']]})"
            if e['anim'] and e['cls'] != '1/2':
                label += ', takes m-wa agreement'
            if e['plonly']:
                label += ', plural only'
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
            t = re.sub(r'\s*[:;,]\s*$', '', g['g'])
            if t and t not in seen:
                seen.add(t)
                gl.append(t)
        if e['pos'] in GLOSS.get(key, {}):
            gl = list(GLOSS[key][e['pos']])
        if LEAD.get(key):
            gl.sort(key=lambda x: LEAD[key] not in x)
        gl = gl[:3]
        if not gl or all(x in shown for x in gl):
            continue
        shown.update(gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label)}</div>{body}</div>')
    return ''.join(parts)


def fi(label, form):
    if not form:
        return ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(form)}</span>'


def agree_forms(ag):
    """An adjective's or a possessive's agreeing forms, as m-wa, ki-vi and n.
    Wiktionary lists them in class order; the ki-vi pair is found by its
    spelling (ki- / ch- then vi- / vy-), and the n form follows it."""
    for i in range(2, len(ag) - 2):
        if ag[i][:2] in ('ki', 'ch') and ag[i + 1][:2] in ('vi', 'vy'):
            return [('m-wa', f'{ag[0]} · {ag[1]}'), ('ki-vi', f'{ag[i]} · {ag[i + 1]}'),
                    ('n', ag[i + 2])]
    return []


def forms_line(e, key, head):
    bits = []
    if e['pos'] == 'noun':
        for p in e['plural'][:1]:
            if p != key:
                bits.append(fi('plural', p))
    elif e['pos'] == 'verb' and ' ' not in key:
        bits.append(fi('stem', '-' + key))
        bits.append(fi('negative', e['neginf']))
    elif e['agree']:
        bits += [fi(l, x) for l, x in agree_forms(e['agree'])]
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


def mark(sentence, hits):
    hs = set(hits)
    out = []
    for piece in re.split(r"([A-Za-z]+(?:['’][A-Za-z]+)*)", sentence):
        if piece and norm(piece) in hs:
            out.append(f'<b>{E(piece)}</b>')
        else:
            out.append(E(piece))
    return ''.join(out)


def examples_html(exs):
    return ''.join(
        f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
        f'data-say="{E(s)}"></span>{mark(s, hits)}</div>'
        f'<div class="uc-exe">{E(en)}</div></div>' for s, en, hits in exs)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        main = ents[0]
        word = lex[r['key']]['word']
        head = headword(main, word)
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Swahili': f'<div class="uc-word">{E(head)}</div>',
            'Word': r['say'],
            'English': english(ents, r['key']),
            'Forms': forms_line(main, r['key'], head),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': head, 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex)})
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
        "Both study directions in one deck: Swahili → English (see the Swahili, recall the "
        "meaning) and English → Swahili (see an English meaning, recall the Swahili). Each "
        "direction is a card of its own with its own schedule, so recognising a word and "
        f"producing it are learnt separately. {n} words for {WHO[LEVEL]}, aligned to "
        f"{LEVEL.upper()} of the Common European Framework of Reference, whose global "
        f"descriptor begins '{SC['quote']}' — a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word "
        "list for Swahili that could be used here, so this deck is not any examination's "
        "vocabulary and does not claim to be. It is assembled from two things that can be "
        f"stated. {from_inv} of the {n} come from a vocabulary written for the level's scope — "
        f"{SC['topics']} — and the other {n - from_inv} are the commonest remaining words, "
        "counted by the WHOLE word (every form of a noun, every conjugated form of a verb added "
        "together) in two collections of real Swahili, " + (
            "film and television subtitles and the Global Voices news site"
            if LEVEL != 'c1' else
            "written Swahili this time — CCMatrix, sentences mined from the web, and WikiMatrix, "
            "sentences from Swahili Wikipedia — because the subtitles and news site that ranked the "
            "lower levels are too small to rank words this rare") +
        ", a word having to be common in both. The cards are dealt by "
        "that frequency, so the words you meet most often come first. "
        "Verbs are shown as their infinitive (kusoma, to read) with their stem (-soma), which "
        "every tense is built on, and their negative infinitive; adjectives and possessives as "
        "their stem (-zuri, -angu) with the forms they take after three of the noun classes. "
        f"The {nouns} nouns show their class, which every adjective, verb and possessive agrees "
        f"with, and their plural; there are {verbs} verbs. " + EX_NOTE + ", with the word picked "
        "out in colour and a speaker beside the sentence and the headword. Sources. Level: the "
        "Common European Framework of Reference (Council of Europe), global scale. Meanings, "
        "noun classes and forms: English Wiktionary, via the kaikki.org extraction (CC BY-SA "
        "4.0). Frequency: counted from " + (
            "OpenSubtitles 2024 and Global Voices (CC BY 3.0)" if LEVEL != 'c1' else
            "CCMatrix and WikiMatrix (CC BY-SA, from Wikipedia)") + ", both "
        "as distributed by OPUS" + ("; only their counts are used, and no text from them is in "
                                    "the deck" if LEVEL == 'c1' else "") + ". "
        "Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR."
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
        'tags': ['swahili', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Swahili vocabulary', 'speechLang': 'sw-KE',
            'fields': FIELDS,
            'cards': [
                {'name': 'Swahili → English', 'front': FRONT_SW, 'back': BACK_SW},
                {'name': 'English → Swahili', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Swahili')
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
