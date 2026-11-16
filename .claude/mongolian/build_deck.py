#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Amharic shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is MONGOLIAN -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in Cyrillic, as English Wiktionary files it, with NO
    romanisation (the Russian and Ukrainian precedent: Mongolian Cyrillic is
    read letter by letter, and the Alphabet deck, first in the collection,
    teaches the letters);
  · the meanings, grouped by part of speech;
  · one line of forms, every one PRINTED BY WIKTIONARY, never composed: a
    noun's plural and its genitive, dative-locative and ablative from its
    declension table (about one noun in seven has a table; the rest show
    none), a verb's causative and passive where its headword line names them,
    the word's other spellings;
  · up to three example sentences (Wiktionary's own, then Tatoeba's), the word
    picked out.

NO SPEAKER BUTTON, as on the Hausa and Amharic decks: few devices carry a
Mongolian voice, and a browser asked for one without it reads in another voice
or not at all.  `speechLang: 'mn-MN'` is still declared.

`Word` is the headword as printed, which the check and the next level's
de-duplication read.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mn import key, nfc, CYR
from mongolian_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE, WHO

STAMP = '2026-11-16T00:00:00.000Z'
TYPE_ID = 'mongolian'
COLOR = '#3C7676'          # the shelf's measured hue (app.js `lang-mongolian`)
FIELDS = ['Mongolian', 'Word', 'English', 'Forms', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'conj': 'conjunction',
            'particle': 'particle', 'intj': 'interjection', 'num': 'number',
            'phrase': 'phrase', 'postp': 'postposition'}

WORD = '<div class="uc-word">{{Mongolian}}</div>'
ASK = '<div class="uc-ask">Say it in Mongolian</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
FRONT_MN = WORD
BACK_MN = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.  Only ever one
# of Wiktionary's own glosses for the word, moved to the front -- never a new one.
LEAD = {
    'баруун': 'right (opposite of left)',   # first listed is "off"
    'мөнгө': 'money',                       # first listed is "silver"
    'эм': 'medicine',                       # first listed is "female, woman, wife"
    'даваа': 'Monday',                      # first listed is "mountain pass"
    'уул': 'mountain',                      # first listed is "root, original"
    'орших': 'to dwell',                    # first listed is the noun "entity"
    'тоо': 'number, numeral',               # first listed is the adjective "numerative"
    'тухай': 'about',                       # first listed is "occasion, time"
    # A2 (2026-11-16)
    'чулуу': 'rock, stone',                 # first listed is "calculus"
    'хөдөө': 'countryside',                 # first listed is "land (for farming)"
    'уур': 'anger, wrath',                  # first listed is "steam"
    'утас': 'telephone',                    # first listed is "thread"
    'зуух': 'hearth, oven, furnace',        # first listed is the verb "to bite"
    'зурагт': 'television',                 # first listed is the adjective "illustrated"
    'тариа': 'injection',                   # first listed is "grain, cereal"
    'паспорт': 'passport',                  # first listed is "ID card"
    'лууван': 'carrot',                     # first listed is "radish"
    'тасалбар': 'ticket',                   # first listed is "cheque, check"
    'ачаа': 'luggage',                      # first listed is "burden, load"
    'алах': 'to kill',                      # the verb is Wiktionary's fourth entry, after an adjective
}

# A gloss that is only a pointer to another word, never shown.
POINTER = re.compile(r'^(alternative form of|alternative spelling of|form of|synonym of|'
                     r'plural of)\b', re.I)

# A gloss's first word that keeps its capital: a name, a day, a people, a faith.
KEEP_CAP = re.compile(r"^(I|God|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|"
                      r"Mongol|Mongols|Mongolian|Mongolia|English|Russian|Russians|Chinese|"
                      r"Han|Buddha|Buddhism|Buddhist|Moon|Sun|Earth|January|February|March|"
                      r"April|May|June|July|August|September|October|November|December|Eurasian|Przewalski)\b")


def lower_first(g):
    g = re.sub(r', (He|She|To|A|An|The)\b', lambda m: ', ' + m.group(1).lower(), g or '')
    if not g or KEEP_CAP.match(g) or (len(g) > 1 and g[1].isupper()):
        return g
    return g[0].lower() + g[1:]


def entries_for(row, lex):
    """The lemma's entries for the card, the inventory's part of speech first."""
    L = lex[row['key']]
    ents = [e for e in L['entries'] if any(not g['weak'] for g in e['glosses'])] or L['entries']
    ents = [dict(e, glosses=[g for g in e['glosses'] if not POINTER.match(g['g'])]) for e in ents]
    ents = [e for e in ents if e['glosses']]
    if row['pos']:
        ents = sorted(ents, key=lambda e: e['pos'] != row['pos'])
    lead = LEAD.get(L['word'])
    if lead:                             # the entry holding the lead gloss is never cut off
        ents = sorted(ents, key=lambda e: not any(lead in g['g'] for g in e['glosses']))
    out, seen = [], {}
    for e in ents:
        if e['pos'] in seen:
            o = out[seen[e['pos']]]
            o['glosses'] += e['glosses']
            o['cells'] = o['cells'] or e['cells']
            o['dv'] = o['dv'] or e['dv']
            o['alts'] = o['alts'] + [a for a in e['alts'] if a not in o['alts']]
            o['ex'] = o['ex'] + e['ex']
            continue
        seen[e['pos']] = len(out)
        out.append(dict(e, glosses=list(e['glosses'])))
    return out[:3]


def pos_label(e):
    label = POS_NAME.get(e['pos'], e['pos'])
    tv = {t for g in e['glosses'] for t in g['tags']}
    if e['pos'] == 'verb':
        if 'transitive' in tv and 'intransitive' not in tv:
            label += ', transitive'
        elif 'intransitive' in tv and 'transitive' not in tv:
            label += ', intransitive'
    return label


def english(ents, word=''):
    parts, shown = [], set()
    lead = LEAD.get(word)
    if lead:                             # the entry that holds the lead gloss comes first
        ents = sorted(ents, key=lambda e: not any(lead in g['g'] for g in e['glosses']))
    for e in ents:
        gl, seen = [], set()
        for g in e['glosses']:
            if g['weak'] and gl:
                continue
            t = lower_first(g['g'])
            if t and t.lower() not in seen:
                seen.add(t.lower())
                gl.append(t)
        if lead:
            gl.sort(key=lambda x: lead not in x)
        gl = gl[:3]
        if not gl or all(x.lower() in shown for x in gl):
            continue
        shown.update(x.lower() for x in gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(pos_label(e))}</div>{body}</div>')
    return ''.join(parts)


# ---- forms -----------------------------------------------------------------------------
CELL_LABEL = [('pl', 'plural'), ('gen', 'of …'), ('dat', 'in, at …'), ('abl', 'from …')]


def fi(label, form):
    if not form:
        return ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(form)}</span>'


def forms_line(ents, word):
    bits = []
    for e in ents:
        if e['pos'] == 'noun' and e['cells']:
            for name, label in CELL_LABEL:
                fm = e['cells'].get(name, '')
                if fm and key(fm) != key(word):
                    bits.append(fi(label, fm))
            break
    for e in ents:
        if e['pos'] == 'verb' and e['dv']:
            for name in ('causative', 'passive'):
                if e['dv'].get(name):
                    bits.append(fi(name, e['dv'][name]))
            break
    other = []
    for e in ents:
        other += [a for a in e['alts'] if key(a) != key(word) and a not in other]
    if other:
        bits.append(fi('also spelt', ' · '.join(other[:2])))
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


# ---- examples --------------------------------------------------------------------------
def mark(sentence, hits):
    hs = set(hits)
    out = []
    for piece in re.split(f'([{CYR}]+(?:-[{CYR}]+)*)', sentence):
        if piece and piece in hs:
            out.append(f'<b>{E(piece)}</b>')
        else:
            out.append(E(piece))
    return ''.join(out)


def examples_html(exs):
    return ''.join(f'<div class="uc-exi"><div class="uc-exz">{mark(mn, hits)}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>' for mn, en, hits in exs)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        word = lex[r['key']]['word']
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Mongolian': f'<div class="uc-word">{E(word)}</div>',
            'Word': word,
            'English': english(ents, word),
            'Forms': forms_line(ents, word),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': ents[0]['pos'], 'source': r['source'],
                        'examples': len(ex)})
    return cards, entries


def desc(entries, n):
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    ex_any = sum(1 for e in entries if e['examples'])
    SC = SCOPE[LEVEL]
    return (
        "Both study directions in one deck: Mongolian → English (see the Mongolian, recall the "
        "meaning) and English → Mongolian (see an English meaning, recall the Mongolian). Each "
        "direction is a card of its own with its own schedule, so recognising a word and "
        f"producing it are learnt separately. {n} words for {WHO[LEVEL]}, aligned to "
        f"{LEVEL.upper()} of the Common European Framework of Reference, whose global descriptor "
        f"begins '{SC['quote']}' — a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no graded Mongolian word list for learners "
        "is published under an open licence, so this deck is not any examination's vocabulary and "
        f"does not claim to be. It is assembled from two things that can be stated. {from_inv} of "
        f"the {n} come from a vocabulary written for the level's scope — {SC['topics']} — and the "
        f"other {n - from_inv} are the commonest remaining words of the Mongolian Wikipedia, "
        "counted by the WHOLE word: Mongolian adds its case and tense endings to the word (байшин "
        "'house', байшинд 'in the house', байшингаас 'from the house'; явах 'to go', явна 'goes', "
        "явсан 'went'), so those forms are added together. That corpus is encyclopaedic, which "
        "shows in the fill (history, government, geography). The cards are dealt by that "
        "frequency, so the words met most often come first. Only words English Wiktionary has an "
        "entry for can be taught here, and some common ones are missing from it (хэцүү "
        "'difficult', эсвэл 'or', хэрэв 'if', буцах 'to return'). Every word is in the Cyrillic "
        "alphabet, as Mongolian is written in Mongolia, with no romanisation; the Alphabet deck, "
        "first in this collection, teaches the letters. A verb is shown by its dictionary form in "
        "-х (явах 'to go'). A noun shows its plural and three of its cases where Wiktionary prints "
        "its declension table, and a verb its causative and passive where Wiktionary names them; "
        "no form is composed here. Example "
        f"sentences: {ex_any} of the {n} words have one, from Wiktionary's usage examples and "
        "from Tatoeba, which holds about 2,600 Mongolian sentences with a translation; none is "
        "invented. There is no speaker button: few devices have a Mongolian voice. Sources. Level: "
        "the Common European Framework of Reference (Council of Europe), global scale. Meanings "
        "and forms: English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Frequency: "
        "the Mongolian Wikipedia, articles of the 2026-11-01 dump (CC BY-SA 4.0). Example "
        "sentences: English Wiktionary (CC BY-SA 4.0) and Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))['lemmas']
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
        'tags': ['mongolian', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Mongolian vocabulary', 'speechLang': 'mn-MN',
            'fields': FIELDS,
            'cards': [
                {'name': 'Mongolian → English', 'front': FRONT_MN, 'back': BACK_MN},
                {'name': 'English → Mongolian', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Mongolian')
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
