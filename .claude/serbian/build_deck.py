#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the shape of every vocabulary deck on the shelf.  The
word is a single record and the two directions are card TEMPLATES, so a
corrected gloss is corrected both ways at once and each direction keeps its
own schedule.  Card 1 is SERBIAN -> ENGLISH.

WHAT A CARD CARRIES:
  · the headword in CYRILLIC, the official alphabet, WITH ITS ACCENT MARKED as
    Wiktionary writes it (`ку̏ћа`, `вре́ме`) -- Serbian's four tonal accents
    and long vowels, which nothing else shows; the speaker field (`Word`) is
    the same without the marks;
  · the headword again in GAJ'S LATIN (`kuća`), under it, since Serbian is read
    in both alphabets every day;
  · the meanings, grouped by part of speech, a noun's GENDER and a verb's
    ASPECT in the label, and "(with се)" on a sense Wiktionary tags reflexive;
  · one line of key forms: a noun's genitive singular and nominative plural, an
    adjective's feminine, neuter and plural, a verb's ја / он present forms and
    its past (the masculine participle the perfect is built on);
  · the forms tables behind a fold (a noun's seven cases, an adjective's or
    pronoun's cases by gender, a verb's present by person, its future, past and
    imperative), in Cyrillic and without accent marks;
  · up to three Tatoeba sentences in Cyrillic, the word picked out, the Latin
    spelling under each, with a speaker.

NO ASPECT PARTNER: Wiktionary's Serbo-Croatian entries do not name one, and
the card prints nothing the source does not carry.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sr import fold, nfc, bare, lat, cyr, speak, PRONOUN_CASES, CASE_NAMES, WORD_RX
from serbian_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-16T00:00:00.000Z'
TYPE_ID = 'serbian'
COLOR = '#1C4C0E'          # the measured hue (docs/serbian-decks-plan.md §5)
FIELDS = ['Word', 'Serbian', 'Latin', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'prep': 'preposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep_phrase': 'phrase', 'proverb': 'proverb'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = '<div class="uc-word">{{Serbian}}' + SAY + '</div><div class="uc-lat">{{Latin}}</div>'
ASK = '<div class="uc-ask">Say it in Serbian</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_SR = WORD
BACK_SR = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape

# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here, with the reason.
ETYMS = {
    'sto': ['1', '2'],        # "hundred" AND "table", both A1
    'svet': ['2'],            # "world"; etymology 1 is the adjective "holy"
    'po': ['2'],              # the preposition; etymology 1 is a noun-like "half"
    'pod': ['2'],             # the preposition "under"; etymology 1 is "floor"
    'postajati': ['2'],       # "to become"; etymology 1 is "to retain a position"
    # A2 (2026-11-16)
    'rad': ['2'],             # "work"; etymology 1 is the adjective "willing"
    'halo': ['2'],            # "hello" (on the phone); etymology 1 is the halo round the sun
    'tuš': ['2'],             # "shower"; etymology 1 is "India ink"
}
# A PART OF SPEECH TO LEAD WITH, where Wiktionary's first is not the everyday word.
POS_FIRST = {'da': 'particle', 'zdravo': 'intj', 'dobro': 'adv', 'hvala': 'intj',
             'do': 'prep', 'više': 'adv', 'čim': 'conj', 'van': 'adv'}
# A PART OF SPEECH LEFT OFF, where it is a different, rarer word spelt the same.
DROP_POS = {'čim': {'pron'}}   # "the, as" (the instrumental of šta) beside the conjunction "as soon as"
# ONE ENTRY BY ITS GLOSS, where two etymologies share Wiktionary's blank etymology number.
ENTRY_WITH = {}
NOT_WEAK = set()
GLOSS_DROP = {'ona': {'they (nominative plural of òno (“it”))'},
              'riba': {'(ribica, diminutive) vagina'}}
LEAD = {'razgovarati': 'to talk',
        # A2: Wiktionary's first sense is the rarer one
        'pismo': 'letter', 'pucati': 'to shoot', 'sastanak': 'meeting', 'predsednik': 'president',
        'miran': 'calm', 'vodič': 'guide', 'pečurka': 'mushroom', 'semafor': 'traffic light',
        'zanimanje': 'job', 'prevesti': 'to translate', 'uz': 'next to'}

# A GLOSS THAT IS A USAGE NOTE, NOT A MEANING ("Used to connect a noun to an adjective ...",
# "Intensity amplifier, used exclusively in phrases"): dropped wherever the entry has a
# meaning beside it.
NOTE = re.compile(r'^(Used |Intensity amplifier|idiomatic and figurative|various idiomatic|'
                  r'used in miscellaneous|Question-forming|A particle used|Placed at)')
# A pronoun's sense that is another case of it (the clitic dative `mi` "to me", a vocative).
CASE_SENSE = re.compile(r'\((?:clitic|short|vocative)[^()]*(?:\([^()]*\))?[^()]*\)')


def clean(t):
    # the case a preposition takes is a usage note in its gloss: "(…, answering the question
    # gdjȅ/gdȅ; see usage notes below)"
    t = re.sub(r',? answering the question [^);]*', '', t)
    t = re.sub(r';? see usage notes[^)]*', '', t)
    # a cross-reference to another headword, in Wiktionary's accented Latin: "(= nàprema)",
    # "(compare ȁli)", "(see also vȅć)"
    t = re.sub(r' \((?:= |compare |see also |short for )[^()]*\)', '', t)
    t = re.sub(r'\(\s*\)', '', t)
    # a pronoun's "(nominative plural of jȃ (“I”))": the card is the pronoun itself
    t = re.sub(r' \(nominative (?:singular|plural) of [^()]*\([^()]*\)\)', '', t)
    return re.sub(r'\s+', ' ', t).strip()


def disp(s):
    """A form as a card prints it: Cyrillic, no accent marks."""
    return cyr(lat(bare(nfc(s))))


# ---- glosses ---------------------------------------------------------------------------
TRAIL = re.compile(r'\s*[:;,]\s*$')


def entries_for(row, lex):
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    ents = [e for e in L['entries'] if any(not g['weak'] and g['g'] for g in e['glosses'])] \
        or L['entries']
    if L['word'] in NOT_WEAK:
        ents = L['entries']
    if row['pos']:
        ents = [e for e in ents if e['pos'] == row['pos']] or ents
    ents = [e for e in ents if e['pos'] not in DROP_POS.get(L['word'], ())] or ents
    if L['word'] in ENTRY_WITH:
        ents = [e for e in ents if any(g['g'] == ENTRY_WITH[L['word']] for g in e['glosses'])] \
            or ents
    groups = []
    for e in ents:
        if e.get('etym', '') not in groups:
            groups.append(e.get('etym', ''))
    keep = [g for g in ETYMS.get(L['word'], groups[:1]) if g in groups] or groups[:1]
    ents = sorted([e for e in ents if e.get('etym', '') in keep],
                  key=lambda e: keep.index(e.get('etym', '')))
    if L['word'] in POS_FIRST:
        ents = sorted(ents, key=lambda e: e['pos'] != POS_FIRST[L['word']])
    out, seen = [], {}
    for e in ents:
        if e['pos'] in seen:
            out[seen[e['pos']]]['glosses'] += e['glosses']
            continue
        seen[e['pos']] = len(out)
        out.append(dict(e, glosses=list(e['glosses'])))
    return out[:3]


def label_of(e):
    label = POS_NAME.get(e['pos'], e['pos'])
    if e['pos'] == 'noun' and e['gender']:
        label += ', ' + e['gender'].replace('/', ' or ')
    if e['pos'] == 'verb':
        if e['aspect'] in ('perfective', 'imperfective'):
            label += ', ' + e['aspect']
        elif e['aspect'] == 'both':
            label += ', imperfective and perfective'
    return label


def english(ents, word=''):
    parts, shown = [], set()
    for e in ents:
        gl, seen = [], set()
        real = [g for g in e['glosses'] if not NOTE.match(g['g'])
                and not (e['pos'] == 'pron' and CASE_SENSE.search(g['g']))]
        for g in (real or e['glosses']):
            if g['weak'] and gl:
                continue
            t = clean(TRAIL.sub('', g['g']))
            if t in GLOSS_DROP.get(word, ()):
                continue
            if 'reflexive' in g['tags'] and e['pos'] == 'verb':
                t += ' (with се)'
            base = re.sub(r' \((diminutive|affectionate|augmentative)\)$', '', t)
            if base != t and any(x.startswith(base + ' (') for x in gl):
                continue
            if t and t not in seen:
                seen.add(t)
                gl.append(t)
        lead = LEAD.get(word)
        if lead:
            gl.sort(key=lambda x: lead not in x)
        gl = gl[:3]
        if not gl or all(x in shown for x in gl):
            continue
        shown.update(gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label_of(e))}</div>{body}</div>')
    return ''.join(parts)


# ---- forms -----------------------------------------------------------------------------
def cells(table, *need, skip=()):
    """Every form whose tags hold all of `need` and none of `skip`, as printed, once each."""
    out = []
    for t in table:
        tags = set(t['t'])
        if all(n in tags for n in need) and not (tags & set(skip)) and ' ' not in t['f']:
            s = disp(t['f'])
            if s not in out:
                out.append(s)
    return ', '.join(out)


def first(s):
    return s.split(', ')[0]


def fi(label, s):
    s = first(s)
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(s)}</span>' if s else ''


PERSONS = ['ја', 'ти', 'он, она', 'ми', 'ви', 'они']

# BITI'S PRESENT, WRITTEN OUT: its table interleaves the plain forms with the emphatic
# (`jesam`) and perfective (`budem`) ones and a `jeste` untagged as either.  The standard
# paradigm, as every grammar gives it.
PRESENT = {'biti': ['сам', 'си', 'је', 'смо', 'сте', 'су'],
           # videti's table adds an archaic `viđu` to the first person alone
           'videti': ['видим', 'видиш', 'види', 'видимо', 'видите', 'виде']}


def by_person(tb, tense, word=''):
    """A tense's six cells in person order, each cell's variants joined (`знам, знадем`).
    The extraction tags only the third persons and the number, so the cells are read in
    the table's own order: the singular non-third cells are ја then ти, split in half
    (each person has as many variants as the other), and so for the plural.  A future
    keeps the one-word Serbian spelling (`радићу`), never `radit ću`."""
    if tense == 'present' and fold(word) in PRESENT:
        return PRESENT[fold(word)]
    rows = [t for t in tb if tense in t['t'] and ' ' not in t['f']]
    if tense == 'present':
        rows = [t for t in rows if 'future' not in t['t']]
    if tense == 'future':
        rows = [t for t in rows if 'future-i' in t['t']]
    out = []
    for num in ('singular', 'plural'):
        two = [t for t in rows if num in t['t'] and 'third-person' not in t['t']]
        three = [t for t in rows if num in t['t'] and 'third-person' in t['t']]
        if not two or len(two) % 2 or not three:
            return []
        h = len(two) // 2
        for part in (two[:h], two[h:], three):
            out.append(', '.join(dict.fromkeys(disp(t['f']) for t in part)))
    return out


def forms_line(e, word, lex):
    tb = e['table']
    bits = []
    if tb and e['pos'] == 'noun':
        bits.append(fi('genitive', cells(tb, 'genitive', 'singular')))
        pl = cells(tb, 'nominative', 'plural')
        if pl and fold(pl) != fold(word) and 'plural only' not in e['gender']:
            bits.append(fi('plural', pl))
    elif tb and e['pos'] == 'adj':
        sk = ('definite', 'comparative', 'superlative')
        bits.append(fi('feminine', cells(tb, 'feminine', 'nominative', 'singular', skip=sk)))
        bits.append(fi('neuter', cells(tb, 'neuter', 'nominative', 'singular', skip=sk)))
        bits.append(fi('plural', cells(tb, 'masculine', 'nominative', 'plural', skip=sk)))
    elif tb and e['pos'] == 'verb':
        pr = by_person(tb, 'present', word)
        if pr:
            bits.append(fi('ја', pr[0]))
            bits.append(fi('он', pr[2]))
        bits.append(fi('past', cells(tb, 'l-participle', 'masculine', 'singular')))
    if e.get('aspect_of'):
        # the verb Wiktionary files this one as the aspect partner of ("imperfective form of
        # báciti"), whose meanings the card carries
        B = [x for x in lex.get(e['aspect_of'], {}).get('entries', []) if x['pos'] == 'verb']
        if B:
            other = {'imperfective': 'perfective', 'perfective': 'imperfective'}.get(e['aspect'], 'pair')
            bits.append(fi(other, disp(B[0].get('cyr') or B[0]['head'])))
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


def row(label, s):
    if not s:
        return ''
    return (f'<div class="uc-cjr"><span class="uc-cj-p">{E(label)}</span>'
            f'<span class="uc-cj-f">{E(s)}</span></div>')


def block(head, rows):
    rows = [r for r in rows if r]
    if not rows:
        return ''
    return f'<div class="uc-cj"><div class="uc-cjh">{E(head)}</div>{"".join(rows)}</div>'


CASES = ['nominative', 'genitive', 'dative', 'accusative', 'vocative', 'instrumental', 'locative']
GENDERS = ['masculine', 'neuter', 'feminine']


def table_html(e, word):
    tb = e['table']
    pc = PRONOUN_CASES.get(fold(word)) if e['pos'] == 'pron' else None
    if pc:
        blocks = [block('cases', [row(c, x) for c, x in zip(CASE_NAMES, pc) if x != '—'])]
    elif not tb:
        return ''
    elif e['pos'] == 'verb':
        pr, fu = by_person(tb, 'present', word), by_person(tb, 'future')
        blocks = [
            block('present', [row(p, x) for p, x in zip(PERSONS, pr)]),
            block('future', [row(p, x) for p, x in zip(PERSONS, fu)]),
            block('past (participle)', [
                row('он', cells(tb, 'l-participle', 'masculine', 'singular')),
                row('она', cells(tb, 'l-participle', 'feminine', 'singular')),
                row('оно', cells(tb, 'l-participle', 'neuter', 'singular')),
                row('они', cells(tb, 'l-participle', 'masculine', 'plural'))]),
        ]
        imp = [t for t in tb if 'imperative' in t['t'] and 'third-person' not in t['t']
               and ' ' not in t['f']]
        sg = [t for t in imp if 'singular' in t['t']]
        pl = [t for t in imp if 'plural' in t['t']]
        if sg and pl and not len(pl) % 2:
            h = len(pl) // 2
            j = lambda part: ', '.join(dict.fromkeys(disp(t['f']) for t in part))
            blocks.append(block('imperative', [row('ти', j(sg)), row('ми', j(pl[:h])),
                                               row('ви', j(pl[h:]))]))
    elif e['pos'] == 'noun':
        blocks = [block(n, [row(c, cells(tb, c, n)) for c in CASES]) for n in ('singular', 'plural')]
    elif any(set(t['t']) & set(GENDERS) for t in tb):
        sk = ('definite', 'comparative', 'superlative')

        def gcell(c, g):
            if g == 'plural':
                return cells(tb, c, 'masculine', 'plural', skip=sk + (('animate',) if c == 'accusative' else ()))
            skip = sk + (('plural', 'animate') if c == 'accusative' else ('plural',))
            return cells(tb, c, g, skip=skip)
        heads = [g for g in GENDERS + ['plural'] if any(gcell(c, g) for c in CASES)]
        blocks = [block(g, [row(c, gcell(c, g)) for c in CASES]) for g in heads]
    else:
        blocks = [block('cases', [row(c, cells(tb, c)) for c in CASES])]
    blocks = [b for b in blocks if b]
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>' if blocks else ''


# ---- examples --------------------------------------------------------------------------
def mark(sentence, hits):
    hs = set(hits)
    out, last = [], 0
    for m in WORD_RX.finditer(sentence):
        out.append(E(sentence[last:m.start()]))
        w = m.group(0)
        out.append(f'<b>{E(w)}</b>' if fold(w) in hs else E(w))
        last = m.end()
    out.append(E(sentence[last:]))
    return ''.join(out)


def examples_html(exs):
    out = []
    for sr_, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(sr_)}"></span>{mark(sr_, hits)}</div>'
                   f'<div class="uc-exl">{E(lat(sr_))}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>')
    return ''.join(out)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        main = ents[0]
        src = lex[r['key']] if r.get('via') else None
        latin = bare(r['word'])
        head = main.get('cyr') if not src else ''
        if not head or fold(head) != fold(latin):
            head = cyr(latin)
        elif bare(head) != cyr(latin):
            print('  NOTE: Wiktionary writes', head, 'where the converter gives', cyr(latin))
        ex = exs.get(r['key'], [])
        # A SPELLING FILED AS ANOTHER WORD'S ALTERNATIVE (`ćerka` -> `kći`) borrows that word's
        # meanings, never its forms: kći declines kćeri, ćerka ćerke.
        same = not r.get('via') or fold(main['head']) == fold(latin)
        cards.append({'sub': r.get('sub', ''), 'fields': {
            'Word': E(speak(head)),
            'Serbian': E(nfc(head)),
            'Latin': E(lat(bare(head))),
            'English': english(ents, r['word']),
            'Forms': forms_line(main, r['word'], lex) if same else '',
            'Table': table_html(main, r['word']) if same else '',
            'Examples': examples_html(ex),
        }})
        entries.append({'word': r['word'], 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex), 'sub': r.get('sub', ''), 'count': r.get('count', 0)})
    return cards, entries


LEARNER = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner',
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
        "Both study directions in one deck: Serbian → English (see the Serbian, recall the "
        "meaning) and English → Serbian (see an English meaning, recall the Serbian). Each "
        "direction is a card of its own with its own schedule, so recognising a word and producing "
        f"it are learnt separately. {n} words for {LEARNER[LEVEL]}, aligned to {LEVEL.upper()} of the "
        f"Common European Framework of Reference, whose global descriptor begins '{SC['quote']}' — "
        f"a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no graded Serbian word list could be used, "
        "so this deck is not any examination's vocabulary and does not claim to be. It is assembled "
        f"from two things that can be stated. {from_inv} of the {n} come from a vocabulary written "
        f"for the level's scope — {SC['topics']} — and the other {n - from_inv} are the commonest "
        "remaining words of everyday Serbian, taken from a frequency list built from film and "
        "television subtitles and counted by the WHOLE word, every form of a noun or a verb added "
        "together. The cards are dealt by that frequency, so the words you meet most often come "
        "first. The Serbian is the standard of Serbia: Ekavian (млеко, време, леп, not the "
        "Ijekavian млијеко, вријеме, лијеп of Bosnia and Montenegro), and words Wiktionary marks "
        "as only Croatian or Bosnian are left out. Every headword is printed in Cyrillic, the "
        "official alphabet, with its accent marked as Wiktionary gives it (ку̏ћа, вре́ме), and "
        "again in the Latin alphabet beneath (kuća, vreme), since Serbian is read in both every "
        "day; the Serbian Alphabet deck, the first in this collection, teaches the letters, the "
        f"two alphabets and the accent marks. The {nouns} nouns show their gender, their genitive "
        f"and their plural; the {verbs} verbs show their aspect, imperfective or perfective, their "
        "ја and он forms and their past; and behind the All forms fold every noun's seven cases "
        "and every verb's present, future, past and imperative. " + EX_NOTE +
        ", in Cyrillic with the Latin spelling beneath, the word picked out in colour and a speaker "
        "beside the sentence and the headword. Sources. Level: the Common European Framework of "
        "Reference (Council of Europe), global scale. Meanings, gender, aspect, accents and forms: "
        "English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Frequency: a word list "
        "built from OpenSubtitles (hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: "
        "Tatoeba (tatoeba.org), CC BY 2.0 FR."
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
        'tags': ['serbian', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Serbian vocabulary', 'speechLang': 'sr-RS',
            'fields': FIELDS,
            'cards': [
                {'name': 'Serbian → English', 'front': FRONT_SR, 'back': BACK_SR},
                {'name': 'English → Serbian', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Serbian')
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
