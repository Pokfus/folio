#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Hindi shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is ZULU -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword as a Zulu dictionary prints it: a noun whole (umuntu), a verb,
    an adjective or a relative by its STEM with a hyphen (-hamba, -khulu,
    -bomvu), since none of them stands alone without a prefix;
  · beneath it Wiktionary's TONE-MARKED spelling (umúntu, -hámba), where it
    differs, because ordinary writing marks no tone and Zulu is a tone language;
  · the meanings, grouped by part of speech, a noun's NOUN CLASS in its label
    (class 1, plural class 2) -- the class is what every adjective, verb and
    pronoun in the sentence agrees with, as gender is in Hindi or German;
  · one line of key forms: a noun's plural and its locative ("at, in, to");
    a verb's infinitive (ukuhamba, the form a learner hears named) and its
    plural command;
  · a verb's tenses behind a fold -- present, not (present negative), past
    (the perfect in -ile) and future (-zo-) by person -- picked from
    Wiktionary's own `zu-infl-verb` table (`verb_table`), never generated;
  · up to three example sentences (Wiktionary's own, then Tatoeba's), the word
    picked out, with a speaker.

The speaker reads the `Say` field: the headword, or for a verb its infinitive
(a bare stem with a hyphen is not something anyone says).  `Word` is the
headword as printed, which the check and the next level's de-duplication read.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zu import fold, nfc, tokens
from zulu_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE, WHO

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'zulu'
COLOR = '#9A012F'
FIELDS = ['Zulu', 'Tone', 'Word', 'Say', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'rel': 'relative',
            'adv': 'adverb', 'pron': 'pronoun', 'det': 'determiner', 'conj': 'conjunction',
            'particle': 'particle', 'intj': 'interjection', 'phrase': 'phrase',
            'prep': 'preposition'}

SAY = '<span class="uc-tts uc-say" data-say="{{Say}}"></span>'
WORD = ('<div class="uc-word">{{Zulu}}' + SAY + '</div>'
        '{{#Tone}}<div class="uc-tone">{{Tone}}</div>{{/Tone}}')
ASK = '<div class="uc-ask">Say it in Zulu</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>Tenses</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_ZU = WORD
BACK_ZU = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'umuthi': 'medicine',      # first listed is "tree"; A1 files it under feeling ill
    'isithupha': 'six',        # first listed is "thumb"; A1 files it under numbers
    'isikhombisa': 'seven',    # first listed is "index finger"
    'isonto': 'week',          # the page holds iSonto "Sunday" and isonto "week; church"
}

# AN ENTRY LEFT OFF A CARD, where the page holds an unrelated word that would only
# be noise on a beginner's card.  (word, part of speech, noun class) -> reason.
DROP = {
    ('khona', 'conj', ''): 'the rare "so that, although" sense; A1 teaches "there"',
    ('de', 'verb', ''): 'the auxiliary "always", a grammar item, not the adjective "long"',
    ('ni', 'pron', ''): '"combining stem of nina", a grammar note, not the word "what"',
    ('ukudla', 'noun', '17'): '"right side" (class 17), a rare homograph of ukudla "food"',
}

# A NOUN CLASS TO LEAD WITH, where the page holds two nouns and the commoner is second.
CLASS_FIRST = {
    'umsebenzi': '3',          # "work, job" (class 3) before "worker" (class 1)
}

# A VERB WHOSE WIKTIONARY TABLE IS WRONG, so the card prints neither forms nor tenses.
# -azi "to know" ends in -i, and the table Wiktionary generates for it treats it as a
# verb in -a: "ukwazia", "yaziani" (read 2026-11-09). -ba "to be, to become" is the
# copulative and irregular, and its generated perfect "ngibile" could not be confirmed.
NO_TABLE = {'azi', 'ba'}

# A gloss that is only a grammar pointer, never shown.
POINTER = re.compile(r'^(combining stem of|alternative form of|form of)\b', re.I)
SYNONYM = re.compile(r'^synonym of (-?[a-zA-Z]+)$')


def entries_for(row, lex):
    L = lex[row['key']]
    ents = [e for e in L['entries'] if any(not g['weak'] for g in e['glosses'])] or L['entries']
    ents = [e for e in ents if (fold(L['word']), e['pos'], e['cls']) not in DROP]
    ents = [dict(e, glosses=[g for g in e['glosses'] if not POINTER.match(g['g'])]) for e in ents]
    ents = [e for e in ents if e['glosses']]
    ents = sorted(ents, key=lambda e: e['canon'] != e['canon'].lower())   # isonto before iSonto
    if fold(L['word']) in CLASS_FIRST:
        ents = sorted(ents, key=lambda e: e['cls'] != CLASS_FIRST[fold(L['word'])])
    if row['pos']:
        ents = sorted(ents, key=lambda e: e['pos'] != row['pos'])
    # one block per part of speech (and noun class), in the order the entries come
    out, seen = [], {}
    for e in ents:
        key = (e['pos'], e['cls'])
        if key in seen:
            out[seen[key]]['glosses'] += e['glosses']
            continue
        seen[key] = len(out)
        out.append(dict(e, glosses=list(e['glosses'])))
    return out[:3]


def pos_label(e):
    label = POS_NAME.get(e['pos'], e['pos'])
    if e['pos'] == 'noun' and e['cls']:
        label += ', class ' + e['cls']
        if e['pcls']:
            label += ', plural class ' + e['pcls']
    if e['pos'] in ('adj', 'rel'):
        label += ' stem'
    tv = {t for g in e['glosses'] for t in g['tags']}
    if e['pos'] == 'verb':
        if 'transitive' in tv and 'intransitive' not in tv:
            label += ', transitive'
        elif 'intransitive' in tv and 'transitive' not in tv:
            label += ', intransitive'
    if 'addressee-singular' in tv and 'addressee-plural' not in tv:
        label += ', to one person'
    elif 'addressee-plural' in tv and 'addressee-singular' not in tv:
        label += ', to several people'
    return label


def resolve(t, lex):
    """'synonym of -fuphi' -> 'short (a synonym of -fuphi)': the target's own first glosses."""
    m = SYNONYM.match(t)
    if not m or not lex:
        return t
    L = lex.get(fold(m.group(1).lstrip('-')))
    if not L:
        return t
    tg = [g['g'] for e in L['entries'] for g in e['glosses'] if not SYNONYM.match(g['g'])][:2]
    return f'{", ".join(tg)} (a synonym of {m.group(1)})' if tg else t


def english(ents, word='', lex=None):
    parts, shown = [], set()
    for e in ents:
        gl, seen = [], set()
        for g in e['glosses']:
            if g['weak'] and gl:
                continue
            t = resolve(g['g'], lex)
            if t and t not in seen:
                seen.add(t)
                gl.append(t)
        lead = LEAD.get(fold(word))
        if lead:
            gl.sort(key=lambda x: lead not in x)
        gl = gl[:3]
        if not gl or all(x in shown for x in gl):
            continue
        shown.update(gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(pos_label(e))}</div>{body}</div>')
    return ''.join(parts)


# ---- forms -----------------------------------------------------------------------------
def first(tb, need, skip=()):
    for t in tb:
        tags = set(t['t'])
        if set(need) <= tags and not (tags & set(skip)):
            return t['f']
    return ''


def fi(label, form):
    if not form:
        return ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(form)}</span>'


def strip_tone(s):
    """The plain spelling of a tone-marked form (the card's forms are written plain)."""
    import unicodedata
    out = unicodedata.normalize('NFD', s)
    out = ''.join(ch for ch in out if not unicodedata.combining(ch))
    return unicodedata.normalize('NFC', out)


def forms_line(e, word):
    tb = e['table']
    bits = []
    if e['pos'] == 'noun':
        if e['pl'] and fold(e['pl']) != fold(word):
            bits.append(fi('plural', strip_tone(e['pl'])))
        loc = (first(tb, ('locative', 'singular')) if e['cls'] not in ('6', '10')
               else first(tb, ('locative', 'plural')))
        # A PAGE WITH TWO NOUNS CAN CARRY ONE NOUN'S TABLE ON BOTH (umsebenzi class 3 "work"
        # was given class 1 "worker"'s kumsebenzi).  A person class (1, 1a, 2, 2a) makes its
        # locative with ku-, every other class with e- or o-; a table that disagrees is not shown.
        if loc and (fold(loc).startswith('ku') != (e['cls'] in ('1', '1a', '2', '2a'))):
            loc = ''
        bits.append(fi('locative', loc))
    elif e['pos'] == 'verb':
        bits.append(fi('infinitive', first(tb, ('infinitive',), skip=('negative',))))
        bits.append(fi('command, to several', first(tb, ('imperative', 'plural'),
                                                    skip=('object-concord',))))
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


# THE VERB'S TENSES, read off Wiktionary's `zu-infl-verb` table.  Every verb that has
# one lists, for each of the four tagged persons, 18 forms in a fixed order (measured
# over all 845 such verbs on 2026-11-09): [0] the long present (ngiyahamba), [4] its
# negative (angihambi), [7] the perfect, "past" (ngihambile), [11] its negative
# (angihambanga) -- then the immediate future under its own tag (ngizohamba).  The
# third person (class 1, "he, she") is untagged in the extract: its present is the
# first untagged present form and its negative the first in aka-/ak- (akahambi,
# akenzi); its past and future are the tagged first-person forms with the class 1
# prefix in place of ngi-, kept ONLY where Wiktionary's own table lists that form.
PERSONS = [('I', ('first-person', 'singular')), ('you', ('second-person', 'singular')),
           ('we', ('first-person', 'plural')), ('you (pl.)', ('second-person', 'plural'))]


def person_forms(tb, need, extra=()):
    return [t['f'] for t in tb if set(need) | set(extra) <= set(t['t'])
            and 'subjunctive' not in t['t'] and 'potential' not in t['t']]


def verb_table(e):
    tb = e['table']
    if not tb:
        return ''
    allforms = {fold(t['f']) for t in tb}
    rows = {'present': [], 'not': [], 'past': [], 'future': []}
    for label, need in PERSONS:
        pr = person_forms(tb, need, ('present',))
        fu = person_forms(tb, need, ('immediate-future',))
        if len(pr) < 12:
            return ''
        rows['present'].append((label, pr[0]))
        rows['not'].append((label, pr[4]))
        rows['past'].append((label, pr[7]))
        if fu:
            rows['future'].append((label, fu[0]))
    third = [t['f'] for t in tb if t['t'] == ['present']]
    tfu = [t['f'] for t in tb if t['t'] == ['immediate-future']]
    if third:
        he = [('he, she', third[0])]
        neg = next((x for x in third if fold(x).startswith('ak') and not fold(x).endswith('anga')), '')
        s1past = rows['past'][0][1]
        stem = fold(s1past)[3:] if fold(s1past).startswith('ngi') else fold(s1past)[2:]
        past = next((p + stem for p in ('u', 'w') if p + stem in allforms), '')
        rows['present'].insert(2, he[0])
        if neg:
            rows['not'].insert(2, ('he, she', neg))
        if past:
            rows['past'].insert(2, ('he, she', past))
        if tfu:
            rows['future'].insert(2, ('he, she', tfu[0]))

    def block(head, rs):
        if not rs:
            return ''
        body = ''.join(f'<div class="uc-cjr"><span class="uc-cj-p">{E(p)}</span>'
                       f'<span class="uc-cj-f">{E(strip_tone(fm))}</span></div>' for p, fm in rs)
        return f'<div class="uc-cj"><div class="uc-cjh">{E(head)}</div>{body}</div>'

    return ('<div class="uc-cjg">' + block('present', rows['present']) +
            block('present, not', rows['not']) + block('past', rows['past']) +
            block('future', rows['future']) + '</div>')


# ---- examples --------------------------------------------------------------------------
def mark(sentence, hits):
    hs = set(hits)
    out = []
    for piece in re.split(r'([^\W\d_]+)', sentence):
        if piece and fold(piece) in hs:
            out.append(f'<b>{E(piece)}</b>')
        else:
            out.append(E(piece))
    return ''.join(out)


def examples_html(exs):
    return ''.join(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(zu)}"></span>{mark(zu, hits)}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>' for zu, en, hits in exs)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        main = ents[0]
        if fold(r['word']) in NO_TABLE:
            main = dict(main, table=[])
        stem = main['canon'].startswith('-')
        word = ('-' if stem else '') + r['word']
        canon = re.sub(r'^-[\u0300-\u036f]+', '-', main['canon'])   # a stray mark on the hyphen (-́zwa)
        tone = canon if canon != word else ''
        if tone and strip_tone(tone) == tone:
            tone = ''                     # no tone mark to show (lapha, manje)
        say = word.lstrip('-')
        if main['pos'] == 'verb':
            say = first(main['table'], ('infinitive',), skip=('negative',)) or say
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Zulu': f'<div class="uc-word">{E(word)}</div>',
            'Tone': E(tone),
            'Word': word,
            'Say': E(strip_tone(say)),
            'English': english(ents, r['word'], lex),
            'Forms': forms_line(main, r['word']),
            'Table': verb_table(main) if main['pos'] == 'verb' else '',
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex)})
    return cards, entries


def desc(entries, n):
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    ex_any = sum(1 for e in entries if e['examples'])
    nouns = sum(1 for e in entries if e['pos'] == 'noun')
    verbs = sum(1 for e in entries if e['pos'] == 'verb')
    SC = SCOPE[LEVEL]
    return (
        "Both study directions in one deck: Zulu → English (see the Zulu, recall the meaning) "
        "and English → Zulu (see an English meaning, recall the Zulu). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words for {WHO[LEVEL]}, aligned to {LEVEL.upper()} of the Common European "
        f"Framework of Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
        f"is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for Zulu, so this deck is not any examination's vocabulary and does not claim to be. It "
        f"is assembled from two things that can be stated. {from_inv} of the {n} come from a "
        f"vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words of the Zulu Wikipedia, counted by the "
        "WHOLE word: Zulu joins its prefixes to the word (abantu, kumuntu, ngiyahamba), so every "
        "form of a noun or a verb is added together. That corpus is encyclopaedic, which shows in "
        "the fill (history, government, sport). The cards are dealt by that frequency, so the "
        "words met most often come first. Only words English Wiktionary has an entry for can be "
        "taught here, and a few everyday words are missing from it (kodwa 'but', namuhla "
        "'today', nini 'when'). "
        "A noun is shown whole with its NOUN CLASS — the prefix family that every adjective, verb "
        "and pronoun agreeing with it echoes; the Zulu Noun Classes deck, first in this collection, "
        f"teaches them — and its plural and locative ('at, in, to'): {nouns} nouns here. A verb, "
        "an adjective or a relative is shown by its stem with a hyphen (-hamba, -khulu), as Zulu "
        f"dictionaries print it, since none stands without a prefix; the {verbs} verbs give their "
        "infinitive and plural command, and behind the Tenses fold their present, negative, past "
        "and future by person, taken from Wiktionary's own tables. Beneath each headword is "
        "Wiktionary's tone-marked spelling (umúntu, -hámba): ordinary Zulu writing marks no tone, "
        f"but the language has it. Example sentences are few: {ex_any} of the {n} words have one, "
        "from Wiktionary's usage examples and from Tatoeba, which holds about a hundred Zulu "
        "sentences; none is invented. A speaker reads the word and each sentence where the device "
        "has a Zulu voice. Sources. Level: the Common European Framework of Reference (Council of "
        "Europe), global scale. Meanings, noun classes, forms, tables and tones: English "
        "Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Frequency: the Zulu Wikipedia, "
        "articles of the 2026-11-01 dump (CC BY-SA 4.0). Example sentences: English Wiktionary "
        "(CC BY-SA 4.0) and Tatoeba (tatoeba.org), CC BY 2.0 FR."
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
        'tags': ['zulu', 'isizulu', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Zulu vocabulary', 'speechLang': 'zu-ZA',
            'fields': FIELDS,
            'cards': [
                {'name': 'Zulu → English', 'front': FRONT_ZU, 'back': BACK_ZU},
                {'name': 'English → Zulu', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Zulu')
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
