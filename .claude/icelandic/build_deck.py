#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Norwegian / Swedish / Greek shape.  The word is a single
record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1 is
ICELANDIC -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword, in the dictionary's form: a noun in the nominative singular (a
    plural-only noun in the plural: `dyr`), an adjective in the masculine, a verb
    in the infinitive.  Icelandic has no indefinite article, so the gender is not
    a word beside the noun but a label beside its meaning (masculine, feminine,
    neuter), and the definite article is an ending, shown in the forms;
  · the meanings, grouped by part of speech, a noun's gender in its label;
  · one line of key forms -- the forms a dictionary gives a word by: a noun's
    definite, genitive singular and plural (hesturinn, hests, hestar); an
    adjective's feminine, neuter and comparative (stór, stórt, stærri); a verb's
    present "he" form, past and supine (fer, fór, farið);
  · behind a fold, the whole of it: a noun's four cases in both numbers,
    indefinite and definite; a verb's present in all six persons and its
    principal parts; an adjective's three genders and its comparison; a
    personal pronoun's four cases;
  · up to three Tatoeba sentences, the word picked out, with a speaker.

No romanisation: Icelandic is written in the Latin alphabet.  The speaker reads the
`Say` field, the word.

WHERE THE FORMS COME FROM.  A noun's, an adjective's and a pronoun's from English
Wiktionary's tables; a verb's past, supine and participle from Wiktionary's head
line and participle table; a verb's present and imperative from BÍN (the Database
of Icelandic Morphology, CC BY-SA 4.0 -- `extract.py` says how), whose terms ask
for its credit line and URL wherever the data is used: the deck's description
carries both.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from isl import fold, WORD as ISWORD
from icelandic_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

# a level's stamp is the day it was first built, so a re-run of a shipped level is byte-identical
STAMP = {'a1': '2026-11-15T00:00:00.000Z', 'a2': '2026-11-16T00:00:00.000Z',
         'b1': '2026-11-16T00:00:00.000Z', 'b2': '2026-11-16T00:00:00.000Z'}.get(LEVEL, '')
if not STAMP:
    raise SystemExit(f'no STAMP for {LEVEL}: write the day the level is first built into build_deck.py')
WHO = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner',
       'b2': 'an upper-intermediate learner', 'c1': 'an advanced learner'}
TYPE_ID = 'icelandic'
COLOR = '#303696'          # the shelf's measured hue, kept in step with "lang-icelandic" in app.js
FIELDS = ['Icelandic', 'Word', 'Say', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'prep': 'preposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep_phrase': 'phrase',
            'proverb': 'proverb', 'article': 'article', 'postp': 'postposition'}
GENDER = {'m': 'masculine', 'f': 'feminine', 'n': 'neuter', 'p': 'plural only'}

SAY = '<span class="uc-tts uc-say" data-say="{{Say}}"></span>'
WORDF = '<div class="uc-word">{{Icelandic}}' + SAY + '</div>'
ASK = '<div class="uc-ask">Say it in Icelandic</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_IS = WORDF
BACK_IS = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORDF + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape
TRAIL = re.compile(r'\s*[:;,]\s*$')
LONG = re.compile(r'^([^;()]{1,40}); (.{20,})$')
PAREN = re.compile(r'^([^()]{2,30}) \((.{25,})\)$')
CAP_OPENERS = {'Used', 'Indicates', 'Expresses', 'Specifies', 'A', 'An', 'The', 'Denotes', 'To'}


def gloss_text(g, pos):
    g = TRAIL.sub('', g).rstrip('.')
    m = LONG.match(g)
    if m and len(g) > 55:
        g = m.group(1)
    if pos == 'noun':
        g = re.sub(r'^(?:an?|the|An?|The) (?=[\w(])', '', g)
    m = PAREN.match(g)
    if m and len(g) > 60:
        g = m.group(1)
    w0 = g.split(' ', 1)[0]
    return g[:1].lower() + g[1:] if w0 in CAP_OPENERS else g


# ONE ETYMOLOGY PER CARD, the first Wiktionary lists (or, where the inventory names a part
# of speech, the first that has it), unless named here.
ETYMS = {
    'að': ['1', '2'],         # the conjunction "that", and the infinitive marker and preposition "to"
    'við': ['1', '2'],        # the pronoun "we", and the preposition "by, at, with"
    'bjór': ['2'],            # "beer"; etymology 1 is "a beaver"
    'dalur': ['1', '2'],      # "a valley", and "a dollar" -- the subtitles' commoner sense
    # A2 (2026-11-16)
    'kokkur': ['2'],          # "a cook"; etymology 1 is "a cock"
    'lok': ['2', '1'],        # "an end" (að lokum, "finally") first, then "a lid"
    # B1 (2026-11-16)
    'benda': ['2'],           # "to point"; etymology 1 is "to bend"
    'vasi': ['2'],            # "a pocket"; etymology 1 is "a vase"
    'hagur': ['2'],           # "an advantage; finances", not the rare adjective "handy"
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech, where Wiktionary's
# is a grammar note, a paragraph or a pointer rather than a meaning.
GLOSS = {
    'við': {'pron': ['we']},
    'þær': {'pron': ['they (women or girls, or feminine nouns; the plural of hún)',
                     'them (the accusative of þær)']},
    'þau': {'pron': ['they (a mixed group, or neuter nouns; the plural of það)',
                     'them (the accusative of þau)']},
    'þeirra': {'pron': ['their, theirs (the genitive of þeir, þær and þau)']},
    'fyrir': {'prep': ['for', 'in front of, before', 'ago (with the dative: fyrir ári, "a year ago")']},
    'lag': {'noun': ['song, tune', 'layer', 'í lagi: all right, OK (allt í lagi, "it\'s all right")']},
    'peningur': {'noun': ['coin', 'peningar (plural): money']},
    'gaman': {'noun': ['fun, pleasure, enjoyment']},          # its third is sexual
    'ostur': {'noun': ['cheese']},                            # its second is anatomical slang
    'mjólk': {'noun': ['milk']},
    'hrísgrjón': {'noun': ['rice', 'a grain of rice']},      # its third is a slur
    'langa': {'verb': ['to want, to long for (with the person in the accusative: mig langar í kaffi, '
                       '"I want some coffee"; mig langar að fara, "I would like to go")']},
    # A2 (2026-11-16)
    'gras': {'noun': ['grass']},                              # its third is drug slang
    'hæna': {'noun': ['hen, chicken']},
    'óþarfi': {'noun': ['something unnecessary (það er óþarfi, "there is no need")']},
    'dreyma': {'verb': ['to dream (with the dreamer in the accusative: mig dreymdi, "I dreamt")']},
    'drífa': {'verb': ['to hurry (drífa sig: drífðu þig!, "hurry up!")', 'to drive, to push on']},
    'ríða': {'verb': ['to ride (a horse)']},                  # its slang sense is sexual
    # B1 (2026-11-16)
    'seyði': {'noun': ['broth', 'á seyði: going on, afoot (hvað er á seyði?, "what\'s going on?")']},
    'hlakka': {'verb': ['to look forward (hlakka til: ég hlakka til, "I\'m looking forward to it")']},
    'tíð': {'noun': ['time, period', 'weather conditions']},
    'kóngur': {'noun': ['king', 'king (in cards and chess)']},
    'drasl': {'noun': ['junk, rubbish, mess']},
    'rugl': {'noun': ['confusion, a mix-up', 'nonsense']},
    'spilla': {'verb': ['to spoil, to corrupt, to contaminate']},
    'drusla': {'noun': ['rag, a shred of cloth', 'an old banger, a jalopy']},
    'grey': {'noun': ['poor thing, poor wretch (greyið, "the poor thing")', 'bitch (a female dog)']},
    'skjár': {'noun': ['screen (a monitor, a television screen)']},
    # B2 (2026-11-16)
    'vonast': {'verb': ['to hope (vonast til: ég vonast til að …, "I hope that …")']},
    'limur': {'noun': ['limb']},                              # its second is anatomical
    'sýra': {'noun': ['acid', 'sour whey']},                  # its third is drug slang
    'sæði': {'noun': ['seed, seeds', 'offspring']},
    'króna': {'noun': ['króna (the Icelandic currency)', 'crown']},
    'gjörðu svo vel': {'phrase': ['here you are, there you go (handing something over)',
                                  'please (inviting someone to come in, sit down or help themselves)']},
}

# A WORD WIKTIONARY FILES ONLY AS A FORM OF ANOTHER, which a learner meets as a word of its
# own: the inventory may name it, and its card is built from what is written here.
FORM_WORDS = {
    'þeir': {'pos': 'pron', 'glosses': ['they (men, or masculine nouns; the plural of hann)']},
    'þig': {'pos': 'pron', 'glosses': ['you (as an object: one person; the accusative of þú)']},
    'hans': {'pos': 'pron', 'glosses': ['his (the genitive of hann; it does not change: bíllinn hans, '
                                        '"his car")']},
    'hennar': {'pos': 'pron', 'glosses': ['her, hers (the genitive of hún; it does not change: '
                                          'bíllinn hennar, "her car")']},
    'okkar': {'pos': 'pron', 'glosses': ['our, ours (the genitive of við "we")']},
    'ykkar': {'pos': 'pron', 'glosses': ['your, yours (more than one person; the genitive of þið)']},
    'ekkert': {'pos': 'pron', 'glosses': ['nothing (the neuter of enginn "no one")']},
    'hana': {'pos': 'pron', 'glosses': ['her (as an object: the accusative of hún)']},
    'hvað': {'pos': 'pron', 'glosses': ['what (hvað er þetta?, "what is this?")',
                                        'how (before an adjective or adverb: how much, how big)']},
    'fyrst': {'pos': 'adv', 'glosses': ['first, at first', 'since, seeing that (as a conjunction)']},
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'leiður': 'sad',                          # first listed is "wearisome, annoying"
    'hætta': 'to quit',                       # first listed is "to risk"
    'hvetja': 'to encourage',                 # first listed is "to sharpen"
    'innflytjandi': 'immigrant',              # first listed is "importer"
}

# A GENDER WRITTEN HERE, where the lemma's first entry is not the everyday word's.
GENDER_FIX = {}

# A PART OF SPEECH NOT SHOWN for one word: a block that is noise beside the word a beginner meets.
DROP_POS = {('um', 'adv'), ('en', 'adv'), ('enn', 'noun'), ('langur', 'noun'), ('átta', 'noun'),
            ('milli', 'adv'), ('gegn', 'adv'), ('megin', 'noun')}

# A FORM WIKTIONARY MIS-TAGS, not shown.
FORM_DROP = set()

NOT_A_MEANING = re.compile(
    r'^\*?\s*see:|^synonym of |senses\.?$|^(?:indefinite|definite|genitive|neuter|plural|'
    r'present|past|preterite|supine|imperative|comparative|superlative|accusative|dative|'
    r'nominative|first|second|third)[^;]* of \S+'
    r'(?: \([^)]*\))?$', re.I)


def entries_for(row, lex):
    if row['key'] in FORM_WORDS:
        fw = FORM_WORDS[row['key']]
        return [{'pos': fw['pos'], 'etym': '', 'gender': '', 'table': [],
                 'glosses': [{'g': g, 'weak': False, 'tags': []} for g in fw['glosses']]}]
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    ents = [e for e in L['entries'] if any(not g['weak'] and g['g'] for g in e['glosses'])] \
        or L['entries']
    groups = []
    for e in ents:
        if e.get('etym', '') not in groups:
            groups.append(e.get('etym', ''))
    first = groups[:1]
    if row['pos']:
        first = [next((e.get('etym', '') for e in ents if e['pos'] == row['pos']), groups[0])]
    keep = ETYMS.get(L['word'], first)
    ents = sorted([e for e in ents if e.get('etym', '') in keep],
                  key=lambda e: keep.index(e.get('etym', '')))
    if row['pos']:
        ents = sorted(ents, key=lambda e: e['pos'] != row['pos'])
    ents = [e for e in ents if (L['word'], e['pos']) not in DROP_POS]
    out, seen = [], {}
    for e in ents:
        if e['pos'] in seen:
            out[seen[e['pos']]]['glosses'] += e['glosses']
            continue
        seen[e['pos']] = len(out)
        out.append(dict(e, glosses=list(e['glosses'])))
    return out[:3]


def gender(e, word):
    return GENDER_FIX.get(word, e['gender'])


def english(ents, word=''):
    parts, shown = [], set()
    for e in ents:
        label = POS_NAME.get(e['pos'], e['pos'])
        g = gender(e, word) if e['pos'] == 'noun' else ''
        if g in GENDER:
            label += ', ' + GENDER[g]
        tv = {t for gl in e['glosses'] for t in gl['tags']} \
            if e['pos'] not in GLOSS.get(word, {}) else set()
        if e['pos'] == 'verb':
            if 'transitive' in tv and 'intransitive' not in tv:
                label += ', transitive'
            elif 'intransitive' in tv and 'transitive' not in tv:
                label += ', intransitive'
        gl, seen = [], set()
        for x in e['glosses']:
            if x['weak'] and gl:
                continue
            t = gloss_text(x['g'], e['pos'])
            if NOT_A_MEANING.search(t):
                continue
            # Wiktionary's pointer senses ("See ta sig") -- case-sensitive, or "see you" is one
            if LEVEL == 'phr' and re.match(r'(?i:used other than figuratively)|See \S+$|See \S+ (?:and|or) \S+$', t):
                continue
            if t and t not in seen:
                seen.add(t)
                gl.append(t)
        if e['pos'] in GLOSS.get(word, {}):
            gl = list(GLOSS[word][e['pos']])
        lead = LEAD.get(word)
        if lead:
            gl.sort(key=lambda x: not (x == lead or x.startswith((lead + ' ', lead + ',', lead + ';'))))
        gl = gl[:3]
        if not gl or all(x in shown for x in gl):
            continue
        shown.update(gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label)}</div>{body}</div>')
    return ''.join(parts)


# ---- forms -----------------------------------------------------------------------------
RARE = ('archaic', 'dated', 'rare', 'obsolete', 'dialectal', 'colloquial',
        'pronunciation-spelling', 'neologism', 'proscribed')


def cells(table, *need, skip=(), most=2):
    """Every listed form of one cell, at most two, joined (`hendi / hönd`)."""
    got = []
    for t in table:
        tags = set(t['t'])
        if all(n in tags for n in need) and not (tags & (set(skip) | set(RARE))) \
                and t['f'] not in got:
            got.append(t['f'])
    return ' / '.join(got[:most]) if got else ''


def first(table, *need, skip=()):
    """The FIRST listed form of a cell: an adjective's or a participle's table lists its
    singular and its plural under the same tags (stór, stórir), the singular first."""
    return cells(table, *need, skip=skip, most=1)


def fi(label, form):
    if not form:
        return ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(form)}</span>'


NOUNTAB = ('form-of', 'bin')
ADJ_SKIP = ('comparative', 'superlative', 'weak')
PERSONS = (('ég', 'first-person', 'singular'), ('þú', 'second-person', 'singular'),
           ('hann, hún, það', 'third-person', 'singular'), ('við', 'first-person', 'plural'),
           ('þið', 'second-person', 'plural'), ('þeir, þær, þau', 'third-person', 'plural'))
CASES = ('nominative', 'accusative', 'dative', 'genitive')


def present(tb, person, number):
    return cells(tb, 'present', 'indicative', person, number,
                 skip=('subjunctive', 'mediopassive', 'past'))


def past(tb, number='singular'):
    return cells(tb, 'indicative', 'past', 'third-person', number,
                 skip=('subjunctive', 'mediopassive', 'bin', 'form-of'), most=1)


def supine(tb):
    return cells(tb, 'supine', skip=('mediopassive',), most=1)


def participle(tb):
    """The past participle's masculine nominative singular (farinn, borðaður): the first such
    row of the participle table, which carries no tag of its own."""
    return first(tb, 'masculine', 'nominative', skip=('bin', 'form-of', 'weak', 'plural'))


def forms_line(e, word):
    tb = e['table']
    bits = []
    if e['pos'] == 'noun' and tb:
        if gender(e, word) == 'p':
            bits.append(fi('definite', cells(tb, 'definite', 'nominative', 'plural')))
            bits.append(fi('genitive', cells(tb, 'indefinite', 'genitive', 'plural')))
        else:
            bits.append(fi('definite', cells(tb, 'definite', 'nominative', 'singular')))
            bits.append(fi('genitive', cells(tb, 'indefinite', 'genitive', 'singular')))
            bits.append(fi('plural', cells(tb, 'indefinite', 'nominative', 'plural')))
    elif e['pos'] in ('adj', 'num', 'det') and tb:
        fe = first(tb, 'feminine', 'nominative', skip=ADJ_SKIP)
        ne = first(tb, 'neuter', 'nominative', skip=ADJ_SKIP)
        if fe and ne and (fold(fe) != fold(word) or fold(ne) != fold(word)):
            bits.append(fi('feminine', fe))
            bits.append(fi('neuter', ne))
        comp = first(tb, 'comparative')
        if e['pos'] == 'adj' and comp and fold(comp) != fold(word):
            bits.append(fi('comparative', comp))
    elif e['pos'] == 'verb':
        bits += [fi('hann …', present(tb, 'third-person', 'singular')),
                 fi('past', past(tb)),
                 fi('supine', supine(tb))]
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


def row(label, form):
    if not form:
        return ''
    return (f'<div class="uc-cjr"><span class="uc-cj-p">{E(label)}</span>'
            f'<span class="uc-cj-f">{E(form)}</span></div>')


def block(head, rows):
    rows = [r for r in rows if r]
    if not rows:
        return ''
    return f'<div class="uc-cj"><div class="uc-cjh">{E(head)}</div>{"".join(rows)}</div>'


def table_html(e, word):
    tb = e['table']
    if not tb:
        return ''
    if e['pos'] == 'verb':
        blocks = [block('present', [row(p, present(tb, a, b)) for p, a, b in PERSONS]),
                  block('principal parts', [
                      row('infinitive', 'að ' + word),
                      row('past (hann …)', past(tb)),
                      row('past (þeir …)', past(tb, 'plural')),
                      row('supine (hef …)', supine(tb)),
                      row('past participle', participle(tb)),
                      row('imperative', cells(tb, 'imperative', 'singular', most=1))])]
    elif e['pos'] == 'noun':
        nums = ('plural',) if gender(e, word) == 'p' else ('singular', 'plural')
        blocks = [block(n, [row(c, ' · '.join(x for x in (
                      cells(tb, 'indefinite', c, n), cells(tb, 'definite', c, n)) if x))
                      for c in CASES]) for n in nums]
    elif e['pos'] in ('adj', 'num', 'det'):
        blocks = [block('nominative', [
                      row('masculine', first(tb, 'masculine', 'nominative', skip=ADJ_SKIP) or word),
                      row('feminine', first(tb, 'feminine', 'nominative', skip=ADJ_SKIP)),
                      row('neuter', first(tb, 'neuter', 'nominative', skip=ADJ_SKIP))])]
        if e['pos'] == 'adj':
            blocks.append(block('comparison', [
                row('comparative', first(tb, 'comparative')),
                row('superlative', first(tb, 'superlative'))]))
    elif e['pos'] == 'pron':
        blocks = [block('cases', [row(c, first(tb, c)) for c in CASES])]
    else:
        return ''
    blocks = [b for b in blocks if b]
    if not blocks:
        return ''
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>'


# ---- examples --------------------------------------------------------------------------
SPLIT = re.compile('(' + ISWORD.pattern + ')')


def mark(sentence, hits):
    hs = set(hits)
    out = []
    for piece in SPLIT.split(sentence):
        if piece and fold(piece) in hs:
            out.append(f'<b>{E(piece)}</b>')
        else:
            out.append(E(piece))
    return ''.join(out)


def examples_html(exs):
    out = []
    for isl, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(isl)}"></span>{mark(isl, hits)}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>')
    return ''.join(out)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        word = r['word']
        ents = [dict(e, table=[t for t in e['table'] if (word, t['f']) not in FORM_DROP]) for e in ents]
        main = ents[0]
        ex = exs.get(r['key'], [])
        cards.append({'sub': r.get('sub', ''), 'fields': {
            'Icelandic': E(word),
            'Word': word,
            'Say': word,
            'English': english(ents, word),
            'Forms': forms_line(main, word),
            'Table': table_html(main, word),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex), 'sub': r.get('sub', ''), 'count': r.get('count', 0)})
    return cards, entries


BIN_CREDIT = ('The Database of Icelandic Morphology (Beygingarlýsing íslensks nútímamáls). The Árni '
              'Magnússon Institute for Icelandic Studies. Author and editor Kristín Bjarnadóttir. '
              'https://bin.arnastofnun.is (CC BY-SA 4.0)')


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
        "Both study directions in one deck: Icelandic → English (see the Icelandic, recall the "
        "meaning) and English → Icelandic (see an English meaning, recall the Icelandic). Each "
        "direction is a card of its own with its own schedule, so recognising a word and producing "
        f"it are learnt separately. {n} words of Icelandic for {WHO[LEVEL]}, aligned to "
        f"{LEVEL.upper()} of the Common European Framework of Reference, whose global descriptor "
        f"begins '{SC['quote']}' — a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no graded word list for Icelandic as a "
        "foreign language was found published, so this deck is not an examination's vocabulary and "
        "does not claim to be. It is assembled from two things that can be stated. "
        f"{from_inv} of the {n} come from a vocabulary written for the level's scope — "
        f"{SC['topics']} — and the other {n - from_inv} are the commonest remaining words of "
        "everyday Icelandic, taken from a frequency list built from film and television subtitles "
        "and counted by the WHOLE word, every form of a noun or a verb added together. The cards "
        "are dealt by that frequency, so the words you meet most often come first. "
        f"Icelandic has no word for 'a', so the {nouns} nouns carry their gender beside their "
        "meaning — masculine, feminine or neuter, which decides every ending the noun and its "
        "adjective take — and show the forms a dictionary gives a noun by: the definite (the "
        "article is an ending: hesturinn, 'the horse'), the genitive singular and the plural "
        "(hests, hestar); behind the All forms fold are its four cases, nominative, accusative, "
        f"dative and genitive, in both numbers. The {verbs} verbs show their present 'he' form, "
        "past and supine (fer, fór, farið — the forms an Icelandic verb is learnt by), and behind "
        "the fold the present in all six persons, the past plural, the past participle and the "
        "imperative. Adjectives show their three genders and their comparison. " + EX_NOTE +
        ", with the word picked out in colour and a speaker beside the sentence and the headword. "
        "Sources. Level: the Common European Framework of Reference (Council of Europe), global "
        "scale. Meanings, gender and the forms of nouns, adjectives and pronouns, and the past and "
        "supine of verbs: English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). The "
        f"present tense and imperative of verbs: {BIN_CREDIT} — six present forms and the "
        "imperative are taken for each verb, unchanged; nothing else is used. Frequency: a word "
        "list built from OpenSubtitles (hermitdave/FrequencyWords, CC BY-SA 4.0), whose "
        "mis-encoded letters (đ for ð, ū for þ) were mapped back before counting. Example "
        "sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )


def main():
    if LEVEL == 'phr':
        raise SystemExit('the Icelandic phrases deck is not built yet (docs/icelandic-decks-plan.md)')
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
        'tags': ['icelandic', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Icelandic vocabulary', 'speechLang': 'is-IS',
            'fields': FIELDS,
            'cards': [
                {'name': 'Icelandic → English', 'front': FRONT_IS, 'back': BACK_IS},
                {'name': 'English → Icelandic', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Icelandic')
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
