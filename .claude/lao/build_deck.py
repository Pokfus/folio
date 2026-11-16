#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

Thai's `build_deck.py`, re-keyed to Lao.  ONE NOTE, TWO CARDS: the word is a
single record and the two directions are card TEMPLATES, so a corrected gloss
is corrected both ways at once and each direction keeps its own schedule.
Card 1 is LAO -> ENGLISH.

WHAT A CARD CARRIES:
  · the headword in Lao script, with its romanisation beneath it -- read off
    Wiktionary's Vientiane IPA by `lo.romanise`, each syllable followed by its
    tone in Chao tone letters, since a Lao word said on the wrong tone is
    another word (ໃກ້ "near", ໄກ "far");
  · the meanings, grouped by part of speech;
  · for a noun, the CLASSIFIER it is counted with, where Wiktionary names one;
  · up to three example sentences, the word picked out, with a speaker.

There is no forms table: Lao does not inflect.  The speaker reads `Word`.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lo import fold
from lao_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-15T00:00:00.000Z'
TYPE_ID = 'lao'
COLOR = '#426A43'
FIELDS = ['Lao', 'Roman', 'Word', 'English', 'Forms', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'conj': 'conjunction',
            'particle': 'particle', 'intj': 'interjection', 'num': 'number',
            'phrase': 'phrase', 'prep': 'preposition', 'prep_phrase': 'phrase',
            'proverb': 'proverb', 'classifier': 'classifier', 'name': 'proper noun'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = ('<div class="uc-word">{{Lao}}' + SAY + '</div>'
        '{{#Roman}}<div class="uc-rom">{{Roman}}</div>{{/Roman}}')
ASK = '<div class="uc-ask">Say it in Lao</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
FRONT_TH = WORD
BACK_TH = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape

# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here (Thai's
# rule).  Keyed by the card's word; read off the A1 cards.
ETYMS = {
    'ສີ': ['2'],           # "colour"; 1 is "to rub"
    'ຕໍ່': ['2'],          # "to add, to link; against"; 1 is "wasp"
    'ສຸດ': ['2'],          # "to end"; 1 is "mosquito net"
    'ໂລກ': ['2'],          # "world"; 1 is "disease"
    'ຄັນ': ['4', '2'],     # "if, when" AND the classifier for vehicles; 1 is "to scratch oneself"
    'ເກືອ': ['2'],         # "salt"; 1 is "to feed"
    'ມັນ': ['2'],          # "it"; 1 is "yam"
    'ປາ': ['2'],           # "fish"; 1 is "to throw at"
    'ລົດ': ['2'],          # "vehicle, car"; 1 is "to reduce"
    'ຂໍ': ['2'],           # "to ask for"; 1 is "hook"
    'ໂຕ': ['2'],           # the classifier for animals, and a "you"; 1 is "big"
    'ສູນ': ['3'],          # "zero; centre"; 1 is "to be angry", 2 "to lose"
    'ໂດຍ': ['2', '3'],     # "by, with" AND the polite particle; 1 is the polite "yes"
}

# WHICH GLOSS LEADS, where Wiktionary's first is not the everyday one.
LEAD = {
    'ໃຊ້': 'to use',             # first is "to order, command"
    'ຈະ': 'indicating future',   # first is "to stop, discontinue"
    'ໄທ': 'Thai',                # first is "inhabitant, resident"
    'ບອກ': 'to tell',            # first is "to find"
}

# "abstract noun of ຄຶດ (khưt); idea" shows "idea" -- Lao's entries add the meaning after a
# semicolon (A2), and the parenthesis is Wiktionary's own romanisation, which the card never shows
ABS = re.compile(r'^abstract noun of [^\s(]+ \([^()]*?(?:, “([^”]+)”\)$|\)[:;] (.+)$)')
BARE = re.compile(r'^(?:abstract noun of [^\s(]+ \([^(),]*\)|Used other than figuratively or idiomatically.*)$')
LISTITEM = re.compile(r'^[\u0e80-\u0eff]+ \(“[^”]*”\)(?:,? and)?[.,;]?$')
SYN = re.compile(r'^synonym of [^\s(]+ \((?:[^,()]+, )?“([^”]+)”\)$')

# A GLOSS NEVER SHOWN: (word, substring of the gloss).
DROP = {
    ('ໃນ', 'seed'),       # an unnumbered homograph filed beside the preposition "in"
    ('ມັງກອນ', 'dragon'),  # the month's card; the noun is another word spelt alike
    ('ກັນຍາ', 'beautiful girl'),
}

# A PART OF SPEECH TO LEAD WITH, for a frequency word (an inventory word says
# its own with `:pos`).
PREFER = {'ໂດຍ': 'prep'}


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
    if 'etym' in row and row['etym'] in groups:      # the phrases deck: the entry it chose
        keep = [row['etym']]
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
    for e in ents:
        label = POS_NAME.get(e['pos'], e['pos'])
        tv = {t for g in e['glosses'] for t in g['tags']}
        if e['pos'] == 'verb':
            if 'transitive' in tv and 'intransitive' not in tv:
                label += ', transitive'
            elif 'intransitive' in tv and 'transitive' not in tv:
                label += ', intransitive'
        gl, seen = [], set()
        # a WEAK sense (rare, archaic, slang ...) only when there is nothing else --
        lead = LEAD.get(word)
        glosses = [g for g in e['glosses'] if not any(w == word and d in g['g'] for w, d in DROP)]
        # "synonym of X (…, “dog”)" shows Wiktionary's own quoted meaning, "dog"
        glosses = [dict(g, g=ABS.sub(lambda m: m.group(1) or m.group(2), SYN.sub(r'\1', g['g']))) for g in glosses]
        # "abstract noun of X" with no meaning of its own teaches nothing: dropped
        # where the entry has anything else
        glosses = [g for g in glosses if not BARE.match(g['g'])] or glosses
        # a list item Wiktionary set as a sense is a Lao word, not a meaning
        glosses = [g for g in glosses if not LISTITEM.match(g['g'])] or glosses
        strong = [g for g in glosses if not g['weak'] or (lead and lead in g['g'])]
        if LEVEL == 'phr':      # an idiom leads with its idiomatic sense
            strong.sort(key=lambda g: 'idiomatic' not in g['tags'])
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


def roman_of(word, lex):
    L = lex.get(fold(word))
    if not L or 'entries' not in L:
        return ''
    for e in L['entries']:
        if e['roman']:
            return e['roman'][0]
    return ''


def forms_line(ents, word, lex):
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
        r = roman_of(c, lex)
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
    for th, en, rom, spans in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(th)}"></span>{mark(th, spans)}</div>'
                   + (f'<div class="uc-exr">{E(rom)}</div>' if rom else '') +
                   f'<div class="uc-exe">{E(en)}</div></div>')
    return ''.join(out)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        word = r['word']
        if r.get('compose'):
            C = r['compose']
            ents = [{'pos': r['pos'], 'glosses': [{'g': C['gloss'], 'weak': False, 'tags': []}],
                     'roman': [' '.join(roman_of(p, lex) for p in C['parts'])], 'clf': []}]
        else:
            ents = entries_for(r, lex)
        if not ents:
            continue
        roman = r.get('roman') or next((e['roman'][0] for e in ents if e['roman']), '')
        ex = exs.get(r['key'], [])
        cards.append({'sub': r.get('sub', ''), 'fields': {
            'Lao': E(word),               # the template wraps it in .uc-word, beside the speaker
            'Roman': E(roman),
            'Word': word,
            'English': english(ents, word),
            'Forms': forms_line(ents, word, lex),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': ents[0]['pos'], 'source': r['source'],
                        'examples': len(ex), 'tatoeba': sum(1 for x in ex if not x[2]),
                        'roman': bool(roman), 'clf': bool(cards[-1]['fields']['Forms']),
                        'sub': r.get('sub', ''), 'count': r.get('count', 0)})
    return cards, entries


WHO = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner',
       'b2': 'an upper-intermediate learner', 'c1': 'an advanced learner'}


def desc(entries, n):
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    ex3 = sum(1 for e in entries if e['examples'] == 3)
    ex0 = sum(1 for e in entries if e['examples'] == 0)
    clf = sum(1 for e in entries if e['clf'])
    SC = SCOPE[LEVEL]
    EX_NOTE = ('Every word carries three example sentences' if ex3 == n else
               f'Example sentences come with {n - ex0} of the {n} words, three apiece for '
               f'{ex3} of them')
    return (
        "Both study directions in one deck: Lao → English (see the Lao, recall the meaning) "
        "and English → Lao (see an English meaning, recall the Lao). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words for {WHO[LEVEL]}, aligned to {LEVEL.upper()} of the Common European "
        f"Framework of Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
        f"is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for Lao, so this deck is not any examination's vocabulary and does not claim to be. It "
        f"is assembled from two things that can be stated. {from_inv} of the {n} come from a "
        f"vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words of Lao, counted in the articles of the "
        "Lao Wikipedia. The greetings and pronouns are dealt first and the rest in that frequency "
        "order. Every meaning comes from English Wiktionary, whose Lao is far smaller than its "
        "Thai, and a handful of everyday words it has no entry for — among them ວ່າ, ຍັງ, ເອົາ and "
        "ຢາກ — are left out rather than given a meaning written here. "
        "Every headword is printed in Lao script with a romanisation beneath it: the sounds as "
        "Wiktionary transcribes the Vientiane pronunciation, written in the style of the Paiboon "
        "system the Thai decks use (a doubled vowel is long; ɛ, ɔ, ʉ and ə are the vowels of "
        "English 'bed', 'law', a 'u' said with spread lips, and 'the'), and after each syllable its "
        "TONE drawn as a pitch line in Chao tone letters — ˧˥ rising, ˩˧ low rising, ˧ mid, ˥˨ high "
        "falling, ˧˩ low falling — because a Lao word said on the wrong tone is a different word. "
        "The Lao Alphabet deck, the first in this collection, teaches the script and the rules "
        f"that decide a tone. {clf} nouns show the classifier they are counted with, and there are "
        "no forms to learn: Lao words never change shape. "
        + EX_NOTE + ", with the word picked out in colour and a speaker beside the sentence and "
        "the headword; Tatoeba holds only some 230 Lao sentences, so most come from Wiktionary. "
        "Sources. Level: the Common European Framework of Reference (Council of Europe), global "
        "scale. Meanings, pronunciation, classifiers and some example sentences: English "
        "Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Frequency: word counts made "
        "from the Lao Wikipedia (CC BY-SA 4.0); no Wikipedia text is in the deck. Example "
        "sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR, and Wiktionary."
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
    if LEVEL == 'phr':
        by = {k: sum(1 for e in entries if e['sub'] == k) for k in ('Phrases', 'Idioms', 'Proverbs')}
        subtitle = (f"{n} expressions · {by['Phrases']} everyday, {by['Idioms']} idioms, "
                    f"{by['Proverbs']} proverbs · both directions")
        raise SystemExit('the Lao phrases deck is not built yet')
        tags = ['lao', 'phrases', 'idioms', 'proverbs']
    else:
        subtitle = f'{n} words · both directions, as two cards per word'
        description = desc(entries, n)
        tags = ['lao', 'vocabulary', LEVEL, NAMES[LEVEL].lower()]
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': subtitle,
        'desc': description, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': tags,
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Lao vocabulary', 'speechLang': 'lo-LA',
            'fields': FIELDS,
            'cards': [
                {'name': 'Lao → English', 'front': FRONT_TH, 'back': BACK_TH},
                {'name': 'English → Lao', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Lao')
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
