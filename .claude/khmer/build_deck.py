#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Thai / Hindi / TORFL shape.  The word is a single
record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1 is
KHMER -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in Khmer script, with WIKTIONARY'S ROMANISATION beneath it
    (`romanise.py` says where it is read from) -- a phonetic transcription that
    shows the vowel each consonant series gives a letter, which the spelling
    alone does not: ក + ា is kaa, គ + ា is kiə;
  · the meanings, grouped by part of speech;
  · for a noun, the CLASSIFIER it is counted with, where Wiktionary names one
    (it rarely does for Khmer);
  · up to three example sentences, the word picked out.

There is no forms table: Khmer does not inflect.  NO SPEAKER BUTTON -- the
Amharic and Hausa rule: few of the devices Folio runs on have a Khmer voice, and a
button that answers a press with silence or with another language's voice is
worse than none.  `speechLang: 'km-KH'` is still declared.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from km import key
from khmer_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-15T00:00:00.000Z'
TYPE_ID = 'khmer'
COLOR = '#76281C'
FIELDS = ['Khmer', 'Roman', 'Word', 'English', 'Forms', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'conj': 'conjunction',
            'particle': 'particle', 'intj': 'interjection', 'num': 'number',
            'phrase': 'phrase', 'prep': 'preposition', 'prep_phrase': 'phrase',
            'proverb': 'proverb', 'classifier': 'classifier', 'name': 'proper noun'}

WORD = ('<div class="uc-word">{{Khmer}}</div>'
        '{{#Roman}}<div class="uc-rom">{{Roman}}</div>{{/Roman}}')
ASK = '<div class="uc-ask">Say it in Khmer</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
FRONT_KM = WORD
BACK_KM = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape

# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here (Thai's
# rule).  Read off the A1 cards; each with its reason, in the order shown.
ETYMS = {
    'តែ': ['2', '1'],           # "but; only" AND "tea"
    'លុយ': ['2'],               # "money"; 1 is "to wade"
    'ហាង': ['3'],               # "shop, store"; 1 is "pungent", 2 "tail"
    'ពុក': ['2'],               # "father"; 1 is "rotten", 3 "beard"
    'ពង': ['2'],                # "egg"; 1 is "blister"
    'រឿង': ['2'],               # "story, matter"; 1 is "brilliant"
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.  Each is
# a substring of the gloss that leads; read off the A1 cards.
LEAD = {
    'សង្សារ': 'boyfriend',      # first is the Buddhist samsara
    'ក្បាល': 'head',            # first are "lot, plot" and a weed (DROP)
}

ABS = re.compile(r'^abstract noun of [^\s(]+ \([^()]*?(?:, “([^”]+)”\)$|\): (.+)$)')
BARE = re.compile(r'^(?:abstract noun of [^\s(]+ \([^(),]*\)|Used other than figuratively or idiomatically.*)$')
SYN = re.compile(r'^synonym of [^\s(]+ \((?:[^,()]+, )?“([^”]+)”\)$')

# A GLOSS NEVER SHOWN.  (word, substring of the gloss.)
DROP = {
    ('បាទ', 'foot'),            # a formal noun under the man's "yes"
    ('ពេល', 'marvel of Peru'),  # a garden plant spelt like "time"
    ('រាជ', 'catfish'),         # the Mekong giant catfish, spelt like "king"
    ('ប្រាក់', 'button orchid'),  # a vine, spelt like "money"
    ('ក្រដាស', 'bougainvillea'),  # a climber, spelt like "paper"
    ('ក្បាល', 'lot, plot'),     # land, before "head"
    ('ក្បាល', 'ash fleabane'),  # a weed, before "head"
}

# A PART OF SPEECH TO LEAD WITH, for a frequency word (an inventory word says its
# own with `:pos`).
PREFER = {}


def entries_for(row, lex):
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    ents = [e for e in L['entries'] if any(not g['weak'] and g['g'] for g in e['glosses'])] \
        or L['entries']
    # a NAME entry only when the word has nothing else, or the inventory asked for it
    if row.get('pos') != 'name' and any(e['pos'] != 'name' for e in ents):
        ents = [e for e in ents if e['pos'] != 'name']
    groups = []
    for e in ents:
        if e.get('etym', '') not in groups:
            groups.append(e.get('etym', ''))
    keep = [k for k in ETYMS.get(row['word'], groups[:1]) if k in groups] or groups[:1]
    ents = sorted([e for e in ents if e.get('etym', '') in keep],
                  key=lambda e: keep.index(e.get('etym', '')))
    lead_pos = row.get('pos') or PREFER.get(row['word'])
    if lead_pos:
        ents = sorted(ents, key=lambda e: e['pos'] != lead_pos)
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
    lead = LEAD.get(word)
    for e in ents:
        label = POS_NAME.get(e['pos'], e['pos'])
        tv = {t for g in e['glosses'] for t in g['tags']}
        if e['pos'] == 'verb':
            if 'transitive' in tv and 'intransitive' not in tv:
                label += ', transitive'
            elif 'intransitive' in tv and 'transitive' not in tv:
                label += ', intransitive'
        glosses = [g for g in e['glosses'] if not any(w == word and d in g['g'] for w, d in DROP)]
        glosses = [dict(g, g=ABS.sub(lambda m: m.group(1) or m.group(2), SYN.sub(r'\1', g['g'])))
                   for g in glosses]
        glosses = [g for g in glosses if not BARE.match(g['g'])] or glosses
        strong = [g for g in glosses if not g['weak'] or (lead and lead in g['g'])]
        gl, seen = [], set()
        for g in strong or glosses[:1]:
            t = g['g'].rstrip(' :;,')
            if t and t not in seen:
                seen.add(t)
                gl.append(t)
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


def roman_of(word, lex, tr):
    """The page's romanisation (`romanise.py`), else the extraction's."""
    if tr.get(word):
        return tr[word]
    L = lex.get(key(word))
    if not L:
        return ''
    if 'entries' not in L:
        return (L.get('roman') or [''])[0]
    for e in L['entries']:
        if e['roman']:
            return e['roman'][0]
    return ''


def forms_line(ents, lex, tr):
    """A noun's classifier(s), with their romanisation."""
    clf = []
    for e in ents:
        if e['pos'] == 'noun':
            for c in e.get('clf', []):
                if c not in clf:
                    clf.append(c)
    if not clf:
        return ''
    bits = []
    for c in clf[:3]:
        r = roman_of(c, lex, tr)
        bits.append(f'{E(c)}<span class="uc-fr">{E(r)}</span>' if r else E(c))
    label = 'classifier' if len(bits) == 1 else 'classifiers'
    return (f'<div class="uc-forms"><span class="uc-fi"><span class="uc-fl">{label}</span>'
            + ' · '.join(bits) + '</span></div>')


def mark(text, spans):
    out, pos = [], 0
    for a, b in sorted(spans):
        if a < pos:
            continue
        out.append(E(text[pos:a]))
        out.append(f'<b>{E(text[a:b])}</b>')
        pos = b
    out.append(E(text[pos:]))
    return ''.join(out)


def examples_html(exs):
    out = []
    for km_, en, rom, spans in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz">{mark(km_, spans)}</div>'
                   + (f'<div class="uc-exr">{E(rom)}</div>' if rom else '') +
                   f'<div class="uc-exe">{E(en)}</div></div>')
    return ''.join(out)


def build(rows, lex, exs, tr):
    cards, entries = [], []
    for r in rows:
        word = r['word']
        if r.get('compose'):
            C = r['compose']
            ents = [{'pos': r['pos'], 'glosses': [{'g': C['gloss'], 'weak': False, 'tags': []}],
                     'roman': [' '.join(roman_of(p, lex, tr) for p in C['parts'])], 'clf': []}]
            roman = ents[0]['roman'][0]
        else:
            ents = entries_for(r, lex)
            roman = tr.get(word) or r.get('roman') or \
                next((e['roman'][0] for e in ents if e['roman']), '')
        if not ents:
            continue
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Khmer': E(word),
            'Roman': E(roman),
            'Word': word,
            'English': english(ents, word),
            'Forms': forms_line(ents, lex, tr),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': ents[0]['pos'], 'source': r['source'],
                        'examples': len(ex), 'tatoeba': sum(1 for x in ex if not x[2]),
                        'roman': bool(roman), 'clf': bool(cards[-1]['fields']['Forms'])})
    return cards, entries


WHO = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner',
       'b2': 'an upper-intermediate learner', 'c1': 'an advanced learner'}


def desc(entries, n):
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    ex3 = sum(1 for e in entries if e['examples'] == 3)
    ex0 = sum(1 for e in entries if e['examples'] == 0)
    SC = SCOPE[LEVEL]
    EX_NOTE = ('Every word carries three example sentences' if ex3 == n else
               f'Real example sentences come with {n - ex0} of the {n} words, three apiece for '
               f'{ex3} of them — the sources hold few Khmer sentences —')
    return (
        "Khmer is the language of Cambodia. Both study directions in one deck: Khmer → English "
        "(see the Khmer, recall the meaning) and English → Khmer (see an English meaning, recall "
        "the Khmer). Each direction is a card of its own with its own schedule, so recognising a "
        f"word and producing it are learnt separately. {n} words for {WHO[LEVEL]}, aligned to "
        f"{LEVEL.upper()} of the Common European Framework of Reference, whose global descriptor "
        f"begins '{SC['quote']}' — a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for Khmer, so this deck is not any examination's vocabulary and does not claim to be. It "
        f"is assembled from two things that can be stated. {from_inv} of the {n} come from a "
        f"vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words of Khmer, counted in the articles of the "
        "Khmer Wikipedia. The first day's greetings come first and the rest are dealt by that count, "
        "so the words you meet most often come early; an encyclopaedia's commonest words lean "
        "towards the written language. Every headword is printed in Khmer script with Wiktionary's "
        "romanisation beneath it, a phonetic spelling that shows the vowel each letter's series "
        "gives it (ក with ា is kaa, គ with ា is kiə) — the Khmer Alphabet deck, the first in this "
        "collection, teaches the script and the two series. There are no forms to learn: Khmer "
        "words never change shape. " + EX_NOTE + " with the word picked out in colour. There is "
        "no speaker button, since few devices have a Khmer voice. Sources. Level: the Common "
        "European Framework of Reference (Council of Europe), global scale. Meanings, romanisation "
        "and some example sentences: English Wiktionary (CC BY-SA 4.0), via the kaikki.org "
        "extraction and the entries' own pages. Frequency: the Khmer Wikipedia, the dump of "
        "1 November 2026 (CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    exs = json.load(open(f('examples.json'), encoding='utf-8'))
    tr = json.load(open('wikt-tr.json', encoding='utf-8'))
    cards, entries = build(rows, lex, exs, tr)
    DECK = DECK_IDS[LEVEL]
    for i, c in enumerate(cards, 1):
        c['id'] = f'u_{DECK}_{i}'
        c['type'] = TYPE_ID
    n = len(cards)
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': f'{n} words · both directions, as two cards per word',
        'desc': desc(entries, n), 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['khmer', 'cambodian', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Khmer vocabulary', 'speechLang': 'km-KH',
            'fields': FIELDS,
            'cards': [
                {'name': 'Khmer → English', 'front': FRONT_KM, 'back': BACK_KM},
                {'name': 'English → Khmer', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Khmer')
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
