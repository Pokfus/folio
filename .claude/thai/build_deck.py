#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Hindi shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss
is corrected both ways at once and each direction keeps its own schedule.
Card 1 is THAI -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in Thai script, with its PAIBOON ROMANISATION beneath it --
    the system that writes the tone (à low, â falling, á high, ǎ rising, no
    mark mid), since a Thai word said on the wrong tone is another word
    (ใกล้ glâi "near", ไกล glai "far");
  · the meanings, grouped by part of speech;
  · for a noun, the CLASSIFIER it is counted with (บ้าน: หลัง lǎng), where
    Wiktionary names one -- Thai cannot count a noun without it;
  · up to three example sentences, the word picked out, with a speaker.

There is no forms table: Thai does not inflect.  The speaker reads the `Word`
field, the bare Thai.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from th import fold
from thai_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'thai'
COLOR = '#014764'
FIELDS = ['Thai', 'Roman', 'Word', 'English', 'Forms', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'conj': 'conjunction',
            'particle': 'particle', 'intj': 'interjection', 'num': 'number',
            'phrase': 'phrase', 'prep': 'preposition', 'prep_phrase': 'phrase',
            'proverb': 'proverb', 'classifier': 'classifier', 'name': 'proper noun'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = ('<div class="uc-word">{{Thai}}' + SAY + '</div>'
        '{{#Roman}}<div class="uc-rom">{{Roman}}</div>{{/Roman}}')
ASK = '<div class="uc-ask">Say it in Thai</div><div class="uc-field">{{English}}</div>'
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

# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here.  Thai has
# many homographs from unrelated sources -- เขา "he, she" and "hill" and "horn",
# วัน "day" and "fly" -- and a beginner's card that offers all of them teaches the
# noise.  Wiktionary often lists the rare word FIRST (กับ "trap" before "with",
# จาก "nipa palm" before "from", คำ "gold" before "word"), so each word of A1 with
# more than one etymology was read and, where the first is not the everyday word
# or two are, the card names which -- in the order shown.  Keyed by the CARD's
# word, so a pointer (ล่ะ, filed under เล่า) picks its own.
ETYMS = {
    'ที่': ['1', '2'],          # "at; place" AND the relative "that, which"
    'กับ': ['2'],               # "with; and"; 1 is "trap"
    'แต่': ['3', '2'],          # "but; only" AND "from, since"; 1 is "each and every"
    'จาก': ['2'],               # "from; to leave"; 1 is the nipa palm
    'ยัง': ['3', '1'],          # "still, yet" AND "to exist"
    'เพราะ': ['2'],             # "because"; 1 is "melodious"
    'มัน': ['3', '1'],          # "it" AND "fat, oily"
    'ผม': ['2', '1'],           # "I" (a man speaking) AND "hair"
    'คำ': ['2'],                # "word"; 1 is "gold"
    'หา': ['2'],                # "to look for"; 1 is an interjection
    'ต่อ': ['2', '4'],          # "to connect; next" AND "per; to"; 1 is "wasp"
    'จน': ['2', '1'],           # "until" AND "poor"
    'ถูก': ['1', '2'],          # "cheap" AND "to touch; correct; (passive)"
    'บาง': ['3', '2'],          # "some" AND "thin"; 1 is "watercourse"
    'ต่าง': ['2'],              # "different; each"; 1 is "shoulder pole"
    'แก่': ['2', '1'],          # "old" AND "to (a person)"
    'ขอ': ['2'],                # "to ask for"; 1 is "hook"
    'กำลัง': ['2', '1'],        # the "-ing" auxiliary AND "strength"
    'ตา': ['1', '2'],           # "eye" AND "grandfather (mother's father)"
    'ดัง': ['1', '2'],          # "loud; famous" AND "like, as"
    'ตั้ง': ['3'],              # "to set up"; 1 and 2 are a classifier and "as many as"
    'ล่ะ': ['2'],               # the particle; 1 is เล่า "to tell"
    'ตอน': ['3'],               # "part; when"; 1 and 2 are "to castrate", "to graft"
    'ยก': ['2'],                # "to lift"; 1 is "round (of a fight)"
    'บาท': ['2'],               # "baht"; 1 is "foot" (royal), 3 "priest"
    'สาย': ['2', '1'],          # "late" AND "line, wire"
    'กี่': ['2'],               # "how many"; 1 is "loom"
    'พัน': ['2'],               # "thousand"; 1 is "to bind"
    'ล้าน': ['2'],              # "million"; 1 is "bald"
    'บ่าย': ['2'],              # "afternoon"; 1 is "to turn"
    'เท้า': ['2'],              # "foot"; 1 is "to lean on"
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one -- its
# senses run in historical order, so หนังสือ opens on "letter; script" and reaches
# "book" sixth, โลก opens on "land; country" before "world".  Each is a substring
# of the gloss that leads; read off the A1 cards.
LEAD = {
    'หา': 'to seek',            # first listed is "to call; to summon"
    'ขึ้น': 'to move or go up',  # first is "to wax" (of the moon)
    'ออก': 'to come or go out',  # first is "to pay"
    'หนังสือ': 'book',
    'โลก': 'world',
    'ร้าน': 'place for selling',  # first is "platform"
    'น้ำตาล': 'sugar (of any kind)',  # first is "palmyra palm juice"
    'แฟน': 'lover',             # "boyfriend, girlfriend" before "fan"
    'จำ': 'to keep in mind',    # first is "to stay or remain"
    'หนู': 'mouse',             # first is "murid"
    'จัด': 'to arrange',        # first is "to consider; to deem"
    'จับ': 'to grab',           # first is "to touch"
    'ภาพ': 'picture',           # first is "condition, state (in compounds)"
    'ตอบ': 'to answer',         # first is "to counter"
    'ติด': 'to attach',         # first is "to apply (to)"
    'เก็บ': 'to keep',
    'ไทย': 'Thai person',
    'เงิน': 'money',            # first is "silver (metal)"
    'ดิฉัน': 'by a female',     # the woman's "I"; Wiktionary lists a rare man's use first
}

# A PART OF SPEECH TO LEAD WITH, for a frequency word (an inventory word says
# its own with `:pos`): เพื่อน opens on a pronoun before "friend", คุณ on the
# noun "attribute" before the pronoun "you".
PREFER = {'กว่า': 'prep', 'หาก': 'conj', 'จน': 'conj', 'แต่': 'conj', 'คุณ': 'pron',
          'เพื่อน': 'noun', 'เมื่อ': 'conj', 'ใต้': 'prep', 'ข้าง': 'noun', 'มัก': 'adv',
          'ทุ่ม': 'noun', 'เก็บ': 'verb', 'ต้อง': 'verb', 'จาก': 'prep', 'แล้ว': 'adv'}


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
        # ต้อง's first sense, "to touch", is literary; its everyday "must" is fourth
        lead = LEAD.get(word)
        strong = [g for g in e['glosses'] if not g['weak'] or (lead and lead in g['g'])]
        for g in strong or e['glosses'][:1]:
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
                     'roman': ['-'.join(roman_of(p, lex) for p in C['parts'])], 'clf': []}]
        else:
            ents = entries_for(r, lex)
        if not ents:
            continue
        roman = r.get('roman') or next((e['roman'][0] for e in ents if e['roman']), '')
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Thai': E(word),               # the template wraps it in .uc-word, beside the speaker
            'Roman': E(roman),
            'Word': word,
            'English': english(ents, word),
            'Forms': forms_line(ents, word, lex),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': ents[0]['pos'], 'source': r['source'],
                        'examples': len(ex), 'tatoeba': sum(1 for x in ex if not x[2]),
                        'roman': bool(roman), 'clf': bool(cards[-1]['fields']['Forms'])})
    return cards, entries


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
        "Both study directions in one deck: Thai → English (see the Thai, recall the meaning) "
        "and English → Thai (see an English meaning, recall the Thai). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words for a beginner, aligned to {LEVEL.upper()} of the Common European "
        f"Framework of Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
        f"is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for Thai, so this deck is not any examination's vocabulary and does not claim to be. It "
        f"is assembled from two things that can be stated. {from_inv} of the {n} come from a "
        f"vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words of Thai, taken from the word counts of "
        "the Thai National Corpus, a large collection of written Thai. The cards are dealt by that "
        "frequency, so the words you meet most often come first. "
        "Every headword is printed in Thai script with a romanisation beneath it in the Paiboon "
        "system, which marks the TONE on every syllable — no mark for mid, à low, â falling, á high, "
        "ǎ rising — because a Thai word said on the wrong tone is a different word; the Thai "
        "Alphabet deck, the first in this collection, teaches the script and the rules that decide "
        f"a tone. {clf} nouns show the classifier they are counted with (a house is counted in "
        "หลัง, an animal in ตัว), and there are no forms to learn: Thai words never change shape. "
        + EX_NOTE + ", with the word picked out in colour and a speaker beside the sentence and "
        "the headword. Sources. Level: the Common European Framework of Reference (Council of "
        "Europe), global scale. Meanings, romanisation, classifiers and some example sentences: "
        "English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Frequency: the Thai "
        "National Corpus word list as distributed by PyThaiNLP (CC0). Example sentences: Tatoeba "
        "(tatoeba.org), CC BY 2.0 FR."
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
        'tags': ['thai', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Thai vocabulary', 'speechLang': 'th-TH',
            'fields': FIELDS,
            'cards': [
                {'name': 'Thai → English', 'front': FRONT_TH, 'back': BACK_TH},
                {'name': 'English → Thai', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Thai')
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
