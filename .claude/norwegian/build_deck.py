#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Swedish / Greek / Hindi shape.  The word is a single
record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1 is
NORWEGIAN -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword, a noun WITH ITS ARTICLE -- en (masculine), ei (feminine), et
    (neuter), and en/ei for the many nouns Bokmål lets take either (`en/ei jente`):
    the article is the gender, and the gender decides the definite ending
    (bilen, jenta, huset), the adjective's ending and the pronoun that stands for
    it; a plural-only noun (penger) carries none;
  · the meanings, grouped by part of speech, a noun's gender in its label;
  · one line of key forms: a noun's definite singular and plural (bilen, biler),
    an adjective's neuter and plural (stort, store), a verb's present, past and
    past participle (spiser, spiste, spist) -- the forms a learner learns a verb by;
  · the forms behind a fold (a noun's indefinite and definite in both numbers;
    a verb's imperative, passive and participles; an adjective's comparative and
    superlative);
  · up to three Tatoeba sentences, the word picked out, with a speaker.

No romanisation: Norwegian is written in the Latin alphabet.  The speaker reads the
`Say` field: the noun with its first article, else the word.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nb import fold, WORD as NBWORD
from norwegian_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

# a level's stamp is the day it was first built, so a re-run of a shipped level is byte-identical
STAMP = {'a1': '2026-11-15T00:00:00.000Z', 'a2': '2026-11-15T00:00:00.000Z',
         'b1': '2026-11-15T00:00:00.000Z', 'b2': '2026-11-15T00:00:00.000Z',
         'c1': '2026-11-15T00:00:00.000Z', 'phr': '2026-11-15T00:00:00.000Z'}[LEVEL]
WHO = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner',
       'b2': 'an upper-intermediate learner', 'c1': 'an advanced learner'}
TYPE_ID = 'norwegian'
COLOR = '#85063D'          # the shelf's measured hue, kept in step with "lang-norwegian" in app.js
FIELDS = ['Norwegian', 'Word', 'Say', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'prep': 'preposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep_phrase': 'phrase',
            'proverb': 'proverb', 'article': 'article', 'postp': 'postposition'}
GENDER = {'m': 'masculine (en)', 'f': 'feminine (ei)', 'n': 'neuter (et)',
          'mf': 'masculine or feminine (en or ei)', 'p': 'plural only'}
ARTICLE = {'m': 'en', 'f': 'ei', 'n': 'et', 'mf': 'en/ei'}

SAY = '<span class="uc-tts uc-say" data-say="{{Say}}"></span>'
WORDF = '<div class="uc-word">{{Norwegian}}' + SAY + '</div>'
ASK = '<div class="uc-ask">Say it in Norwegian</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_NB = WORDF
BACK_NB = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
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
    'rom': ['2'],             # et rom "a room"; etymology 1 is "rum"
    # A2 (2026-11-15)
    'kart': ['2'],            # et kart "a map"; etymology 1 is "unripe fruit"
    'lønn': ['2'],            # "salary, wage"; etymology 1 is "a maple"
    'kurs': ['2'],            # et kurs "a course (of lessons)"; etymology 1 is a ship's course
    'skuffe': ['3'],          # "to disappoint"; etymology 2 is "to shovel"
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech, where Wiktionary's
# is a grammar note, a paragraph or a pointer rather than a meaning.
GLOSS = {
    'en': {'article': ['a, an (the indefinite article: en with a masculine noun, ei with a '
                       'feminine one, et with a neuter one)']},
    'å': {'particle': ['to (before a verb: å spise, "to eat")']},
    'det': {'pron': ['it (standing for a neuter noun)',
                     'it, there (the empty subject: det regner, "it is raining"; det er, "there is")',
                     'that'],
            'article': ['the (before an adjective with a neuter noun: det store huset)']},
    'den': {'pron': ['it (standing for a masculine or feminine noun)', 'that'],
            'article': ['the (before an adjective with a masculine or feminine noun: den store bilen)']},
    'de': {'pron': ['they', 'those'],
           'article': ['the (before an adjective with a plural noun: de store bilene)']},
    'du': {'pron': ['you (one person)']},
    'han': {'pron': ['he']},
    'meg': {'pron': ['me', 'myself']},
    'deg': {'pron': ['you (as an object: one person)', 'yourself']},
    'henne': {'pron': ['her (as an object)']},
    'ikke': {'adv': ['not']},
    'hvorfor': {'adv': ['why']},
    'ha': {'verb': ['to have, to own, to possess',
                    'to have (a relative, a partner, a friend)',
                    'to have (before a past participle: jeg har spist, "I have eaten")']},
    'skulle': {'verb': ['shall, will, be going to (the future: jeg skal spise, "I am going to eat")',
                        'should, be supposed to', 'skulle: would, was going to']},
    'jo': {'adv': ['yes (answering a negative question: Kommer du ikke? – Jo!)',
                   'you know, of course (marking what is said as known)']},
    'sin': {'det': ['his, her, its, their (own: referring back to the subject)']},
    'mye': {'adj': ['much, a lot (of)']},
    'dra': {'verb': ['to pull, to draw, to drag', 'to leave, to go (dra hjem, "to go home")']},
    'slå': {'verb': ['to beat, to hit, to strike', 'to beat, to defeat']},
    'sette': {'verb': ['to put, to place, to set', 'sette seg: to sit down']},
    'sak': {'noun': ['matter, thing, issue', 'case']},
    'hjem': {'noun': ['home']},
    'reise': {'verb': ['to travel', 'to go (somewhere)']},      # its third is a drug sense
    'stikke': {'verb': ['to stick, to prick, to stab, to sting', 'stikke av: to run away, to run off']},
    'sol': {'noun': ['sun']},
    'onsdag': {'noun': ['Wednesday']},
    'men': {'conj': ['but']},
    'appelsin': {'noun': ['orange (the fruit)']},
    'brød': {'noun': ['bread']},
    'ris': {'noun': ['rice']},
    'krone': {'noun': ['krone (the Norwegian and Danish currency)', 'crown (a royal headdress)']},
    'vann': {'noun': ['water', 'lake (a body of fresh water)']},
    'hel': {'adj': ['whole, entire (hele dagen, "the whole day")', 'unbroken, in one piece']},
    # A2 (2026-11-15): a vulgar, sexual or slang sense cut, or a pointer or note written as a meaning
    'gifte': {'verb': ['to marry, to wed', 'gifte seg: to get married']},
    'slags': {'adj': ['kind of, sort of (en slags …, "a kind of …"; alle slags, "all kinds of")']},
    'nummer': {'noun': ['number']},
    'ende': {'noun': ['end']},
    'type': {'noun': ['type, kind, sort', 'guy, bloke (a boy or man)']},
    'sex': {'noun': ['sex']},
    'mål': {'noun': ['goal, aim, target', 'goal (in sport)', 'measure, measurement']},
    'onkel': {'noun': ['uncle']},
    'overalt': {'adv': ['everywhere']},
    'hær': {'noun': ['army']},
    'lande': {'verb': ['to land']},
    'sur': {'adj': ['sour', 'sulky, in a bad temper']},
    'gress': {'noun': ['grass']},
    'høne': {'noun': ['hen']},
    'film': {'noun': ['film, movie', 'film (for a camera)']},
    'pleie': {'verb': ['to usually do, to be in the habit of (jeg pleier å …, "I usually …")',
                       'to nurse, to care for, to look after']},
    'rive': {'verb': ['to tear, to rip, to scratch', 'to grate']},   # Wiktionary's carry "+ av"
    'amerikaner': {'noun': ['American (a person from America)']},
    # B1 (2026-11-15)
    'elskling': {'noun': ['darling, love (a term of address)']},
    'rote': {'verb': ['to make a mess, to untidy']},          # its second is sexual
    'eldre': {'adj': ['older, elder (the comparative of gammel)', 'elderly (de eldre, "the elderly")']},
    'hjelp': {'intj': ['help!']},
    'vogn': {'noun': ['wagon, cart, carriage']},
    'tenne': {'verb': ['to light, to set fire to', 'to turn on (a lamp)']},   # its third is sexual
    'engel': {'noun': ['angel', 'guardian, protector']},
    'majestet': {'noun': ['majesty']},
    'jøde': {'noun': ['Jew']},
    'lengre': {'adj': ['longer (the comparative of lang)', 'ikke lengre: no longer']},
    'døgn': {'noun': ['day and night, a 24-hour period']},
    'sankthans': {'noun': ['Midsummer (the observance on the evening of 23 June)']},
    'forholde': {'verb': ['to withhold', 'forholde seg til: to relate to']},
    'tyste': {'verb': ['to snitch, to inform on someone (usually to the police)']},
    # B2 (2026-11-15)
    'bag': {'noun': ['bag']}, 'skalle': {'noun': ['skull']}, 'pave': {'noun': ['pope']},
    'sete': {'noun': ['seat', 'saddle (on a bicycle, motorcycle)']},
    'koselig': {'adj': ['cosy, comfortable', 'nice, pleasant']},   # its third is "hello"
    'hamburger': {'noun': ['hamburger (the food)', 'Hamburger (a person from Hamburg)']},
    # C1 (2026-11-15)
    'pung': {'noun': ['pouch', 'purse']}, 'trekant': {'noun': ['triangle']}, 'tiss': {'noun': ['pee']},
    # PHRASES DECK (2026-11-15)
    'tusen takk': {'phrase': ['thank you very much (literally: a thousand thanks)']},
    'fra A til B': {'phrase': ['from A to B (a short distance or time)']},
}

# A WORD WIKTIONARY FILES ONLY AS A FORM OF ANOTHER, which a learner meets as a word of its
# own: the inventory may name it, and its card is built from what is written here.
FORM_WORDS = {
    'hans': {'pos': 'det', 'glosses': ['his (the possessive of han; it does not change: hans bil, '
                                       'hans hus)']},
    # A2 (2026-11-15)
    'senere': {'pos': 'adv', 'glosses': ['later (the comparative of sen: vi ses senere, "see you later")']},
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'gang': 'time (to express frequency)',   # en gang "once"; first listed is "hall, hallway"
    'trenge': 'to need, require',             # first listed is "to press"
    'love': 'to promise',                     # first listed is "to praise"
    'flott': 'splendid, excellent, great',    # first listed is "generous, liberal"
    'kone': 'wife',                           # first listed is "housewife"
    'middag': 'dinner',                       # first listed is "noon, midday"
    'kjøtt': 'meat (animal flesh as food)',   # first listed is "flesh"
    'forbrytelse': 'crime',                   # first listed is "forfeiture"
    'pusse': 'to polish, to brush',           # first listed is "to incite"
}

# NO ARTICLE for a language's name, which Norwegian uses without one (jeg snakker norsk)
NO_ART = {'norsk', 'engelsk', 'dansk', 'latin'}

# THE MONTHS carry no article and no forms: Norwegian uses a month's name bare (i mai), and
# Wiktionary's `maien`, `maier` are not what a learner needs on the card.
MONTHS = set('januar februar mars april mai juni juli august september oktober november '
             'desember'.split())

# A GENDER WRITTEN HERE, where the lemma's first entry is not the everyday word's.
GENDER_FIX = {'mann': 'm',     # Wiktionary's senses carry both tags; en mann
              'folk': 'n',    # et folk; Wiktionary's head line says plural only
              'dømmekraft': 'mf'}   # B2: no gender given; its forms are kraft's (en/ei)

# A PART OF SPEECH NOT SHOWN for one word: a block that is noise beside the word a beginner meets.
DROP_POS = {('bak', 'noun'), ('lege', 'verb'), ('godt', 'noun'), ('ut', 'intj'),
            ('glemme', 'noun'), ('stå', 'noun'), ('tro', 'adj'), ('tro', 'noun'), ('vente', 'noun'),
            ('vise', 'noun'), ('virke', 'noun'), ('slå', 'noun'), ('egen', 'adj'),
            # A2
            ('hyggelig', 'intj'), ('straks', 'noun'), ('straks', 'conj'), ('særlig', 'intj'),
            ('hylle', 'verb'), ('ende', 'adv'), ('le', 'adj'), ('le', 'noun'), ('kul', 'noun'),
            ('konge', 'adj'), ('gift', 'noun'), ('røre', 'noun'), ('skille', 'noun'),
            # B1
            ('rulle', 'noun'), ('helse', 'verb'), ('spy', 'noun'), ('øse', 'noun'), ('trosse', 'noun'),
            # B2
            ('porno', 'adj'), ('stokk', 'adv'), ('bøye', 'noun'), ('skjør', 'noun')}

# A FORM WIKTIONARY MIS-TAGS, not shown: `dradd` is listed as a past of dra (dro).
FORM_DROP = {('dra', 'dradd'),
             ('drive', 'drivende'),   # the present participle, tagged a present
             ('rense', 'rensende'), ('ydmyke', 'pparticiple ydmykende')}

NOT_A_MEANING = re.compile(
    r'^\*?\s*see:|^synonym of |senses\.?$|^(?:indefinite|definite|genitive|neuter|plural|'
    r'present|past|preterite|supine|imperative|comparative|superlative|objective)[^;]* of \S+'
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
    """The gender to print.  BOKMÅL LETS EVERY FEMININE NOUN BE MASCULINE (ei/en jente, jenta/
    jenten), and Wiktionary tags some such nouns one way only (datter "masculine", seng
    "feminine") while listing both definite forms; a noun whose definite singular is listed
    in both -a and -en is printed en/ei."""
    g = GENDER_FIX.get(word, e['gender'])
    if g in ('m', 'f'):
        ds = [t['f'] for t in e['table'] if {'definite', 'singular'} <= set(t['t'])
              and 'plural' not in t['t']]
        if any(d.endswith('a') for d in ds) and any(d.endswith('en') for d in ds):
            return 'mf'
    return g


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
        'pronunciation-spelling', 'neologism')


def cells(table, *need, skip=()):
    """Every listed form of one cell, at most two, joined (`jenta / jenten`)."""
    got = []
    for t in table:
        tags = set(t['t'])
        if all(n in tags for n in need) and not (tags & (set(skip) | set(RARE))) \
                and t['f'] not in got:
            got.append(t['f'])
    return ' / '.join(got[:2]) if got else ''


def perfect(tb):
    """The past participle, the form after har (har spist): Wiktionary tags it `supine`
    on some verbs (være -> vært) and `participle past` on the rest."""
    return cells(tb, 'supine') or cells(tb, 'participle', 'past',
                                        skip=('present', 'definite', 'neuter', 'plural'))


def adj_plural(tb):
    """An adjective's definite and plural form: the head line's "definite singular and plural"
    cell first -- Wiktionary mis-tags some superlatives as plurals (kort -> kortest)."""
    skip = ('comparative', 'superlative', 'participle')
    return cells(tb, 'definite', 'plural', 'singular', skip=skip) or cells(tb, 'plural', skip=skip)


def fi(label, form):
    if not form:
        return ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(form)}</span>'


def forms_line(e, word):
    tb = e['table']
    bits = []
    if e['pos'] == 'noun' and tb:
        if gender(e, word) == 'p':
            bits.append(fi('definite', cells(tb, 'definite', 'plural')))
        else:
            bits.append(fi('definite', cells(tb, 'definite', 'singular', skip=('plural',))))
            bits.append(fi('plural', cells(tb, 'indefinite', 'plural', skip=('singular',))))
    elif e['pos'] == 'adj' and tb:
        ne = cells(tb, 'neuter', skip=('comparative', 'superlative', 'participle'))
        pl = adj_plural(tb)
        if ne and fold(ne) != fold(word):
            bits.append(fi('neuter', ne))
        if pl and fold(pl) != fold(word):
            bits.append(fi('plural', pl))
    elif e['pos'] == 'verb':
        bits += [fi('present', cells(tb, 'present', skip=('participle', 'perfect'))),
                 fi('past', cells(tb, 'past', skip=('participle',))),
                 fi('perfect', perfect(tb))]
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


def table_html(e, word, art):
    tb = e['table']
    if not tb:
        return ''
    if e['pos'] == 'verb':
        blocks = [block('forms', [
            row('infinitive', 'å ' + word),
            row('present', cells(tb, 'present', skip=('participle', 'perfect'))),
            row('past', cells(tb, 'past', skip=('participle',))),
            row('perfect (har …)', perfect(tb)),
            row('imperative', cells(tb, 'imperative')),
            row('passive (-s)', cells(tb, 'passive'))]),
            block('participles', [row('present', cells(tb, 'participle', 'present', skip=('past',))),
                                  row('past', cells(tb, 'participle', 'past',
                                                    skip=('present', 'definite', 'neuter', 'plural')))])]
    elif e['pos'] == 'noun':
        if gender(e, word) == 'p':
            blocks = [block('plural', [row('indefinite', word),
                                       row('definite', cells(tb, 'definite', 'plural'))])]
        else:
            blocks = [block('singular', [row('indefinite', (art.split('/')[0] + ' ' if art else '') + word),
                                         row('definite', cells(tb, 'definite', 'singular', skip=('plural',)))]),
                      block('plural', [row('indefinite', cells(tb, 'indefinite', 'plural', skip=('singular',))),
                                       row('definite', cells(tb, 'definite', 'plural', skip=('singular',)))])]
    elif e['pos'] == 'adj':
        pos = ('comparative', 'superlative', 'participle')
        blocks = [
            block('positive', [
                row('masculine / feminine', word),
                row('neuter', cells(tb, 'neuter', skip=pos)),
                row('definite and plural', adj_plural(tb))]),
            block('comparison', [
                row('comparative', cells(tb, 'comparative')),
                row('superlative', cells(tb, 'superlative', skip=('definite',))),
                row('superlative, definite', cells(tb, 'superlative', 'definite'))]),
        ]
    else:
        return ''
    blocks = [b for b in blocks if b]
    # a table that only repeats the forms line adds nothing behind its fold
    if not blocks:
        return ''
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>'


# ---- examples --------------------------------------------------------------------------
SPLIT = re.compile('(' + NBWORD.pattern + ')')


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
    for nb, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(nb)}"></span>{mark(nb, hits)}</div>'
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
        g = gender(main, word)
        if word in MONTHS:
            main = dict(main, table=[])
        # no article on a noun Wiktionary gives no forms, nor on a month (i mai, not "en mai")
        art = ARTICLE.get(g, '') if main['pos'] == 'noun' and main['table'] \
            and word not in NO_ART and ' ' not in word else ''
        head = (f'<span class="uc-art">{E(art)}</span> ' if art else '') + E(word)
        ex = exs.get(r['key'], [])
        cards.append({'sub': r.get('sub', ''), 'fields': {
            'Norwegian': head,
            'Word': word,
            'Say': (art.split('/')[0] + ' ' if art else '') + word,
            'English': english(ents, word),
            'Forms': forms_line(main, word),
            'Table': table_html(main, word, art),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex), 'sub': r.get('sub', ''), 'count': r.get('count', 0)})
    return cards, entries


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
        "Both study directions in one deck: Norwegian → English (see the Norwegian, recall the "
        "meaning) and English → Norwegian (see an English meaning, recall the Norwegian). Each "
        "direction is a card of its own with its own schedule, so recognising a word and producing "
        f"it are learnt separately. {n} words of Norwegian Bokmål — the written standard most "
        f"Norwegians use — for {WHO[LEVEL]}, aligned to {LEVEL.upper()} of the Common European "
        f"Framework of Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
        f"is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: Norway examines learners at these levels — "
        "Norskprøven and Bergenstesten — but neither was found to publish a word list, so this deck "
        "is not an examination's vocabulary and does not claim to be. It is assembled from two "
        f"things that can be stated. {from_inv} of the {n} come from a vocabulary written for the "
        f"level's scope — {SC['topics']} — and the other {n - from_inv} are the commonest remaining "
        "words of everyday Norwegian, taken from a frequency list built from film and television "
        "subtitles and counted by the WHOLE word, every form of a noun or a verb added together. "
        "The cards are dealt by that frequency, so the words you meet most often come first. "
        f"The {nouns} nouns are printed with their article — en, ei or et, and en/ei where Bokmål "
        "allows either — because the article is the gender, which decides the noun's definite "
        "ending, the adjective's ending and the pronoun that stands for it, and they show their "
        f"definite singular and their plural (bilen, biler); the {verbs} verbs show their present, "
        "past and past participle, the forms a Norwegian verb is learnt by (spiser, spiste, spist), "
        "and behind the All forms fold their imperative, passive and participles. " + EX_NOTE +
        ", with the word picked out in colour and a speaker beside the sentence and the headword. "
        "Sources. Level: the Common European Framework of Reference (Council of Europe), global "
        "scale. Meanings, gender and forms: English Wiktionary, via the kaikki.org extraction "
        "(CC BY-SA 4.0). Frequency: a word list built from OpenSubtitles "
        "(hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), "
        "CC BY 2.0 FR."
    )


PHR_SUBS = ('Phrases', 'Fixed expressions', 'Particle verbs', 'Idioms', 'Proverbs')


def desc_phr(entries, n):
    by = {s: [e for e in entries if e['sub'] == s] for s in PHR_SUBS}
    ex3 = sum(1 for e in entries if e['examples'] == 3)
    ex0 = sum(1 for e in entries if e['examples'] == 0)
    found = sum(1 for e in entries if e['count'])
    eg = lambda s: ', '.join(e['word'] for e in by[s][:3])
    return (
        f"{n} Norwegian (Bokmål) set phrases, fixed expressions, particle verbs, idioms and proverbs, in "
        f"five subdecks: {len(by['Phrases'])} everyday phrases, {len(by['Fixed expressions'])} fixed "
        f"expressions, {len(by['Particle verbs'])} particle verbs, {len(by['Idioms'])} idioms and "
        f"{len(by['Proverbs'])} proverbs. Both study directions come as two cards of one expression — "
        "Norwegian → English (see the Norwegian, recall the meaning) and English → Norwegian (see an English "
        "meaning, recall the Norwegian) — each with a schedule of its own. This is a companion to the five "
        "level decks, Norwegian A1 to C1, and not one of them: a level is a list of words, and an expression is "
        "a unit a list of words cannot see. Nothing here is taught by any of the five, so the two can be studied "
        "together without repeating an entry. The PHRASES are the expressions Wiktionary files as phrases and "
        f"does not mark as idiomatic — mostly the everyday formulas ({eg('Phrases')} …). The FIXED EXPRESSIONS "
        "are the multi-word adverbs, prepositions and conjunctions sentences are built from "
        f"({eg('Fixed expressions')} …). The PARTICLE VERBS are a verb and a particle or a preposition that "
        f"together mean something the verb alone does not ({eg('Particle verbs')} …). The IDIOMS are "
        f"expressions whose meaning is not their words' ({eg('Idioms')} …), and the PROVERBS the sayings "
        f"Wiktionary files as proverbs ({eg('Proverbs')} …). Within each subdeck the expressions come in the "
        "order of how many of Tatoeba's Norwegian sentences contain them, a particle verb being counted with its "
        f"verb in any form; {found} of the {n} are found there, and the rest follow in the order of how common "
        "their words are in film and television subtitles. English Wiktionary lists fewer Bokmål expressions "
        "than it does for larger languages, so this deck is smaller than the level decks and takes every "
        "expression that passes its filters rather than the commonest of many. "
        f"Real example sentences come with {n - ex0} of the {n} expressions, three apiece for {ex3}, with the "
        "expression picked out in colour and a speaker beside the sentence and the headword. Sources. "
        "Expressions, meanings, forms and the idiom and proverb labels: English Wiktionary, via the kaikki.org "
        "extraction (CC BY-SA 4.0). Order: Tatoeba (tatoeba.org), CC BY 2.0 FR, then a word list built from "
        "OpenSubtitles (hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba, CC BY 2.0 FR."
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
        by = {k: sum(1 for e in entries if e['sub'] == k) for k in PHR_SUBS}
        subtitle = (f"{n} expressions · {by['Phrases']} everyday, {by['Fixed expressions']} fixed, "
                    f"{by['Particle verbs']} particle verbs, {by['Idioms']} idioms, "
                    f"{by['Proverbs']} proverbs · both directions")
        description = desc_phr(entries, n)
        tags = ['norwegian', 'bokmål', 'phrases', 'particle verbs', 'idioms', 'proverbs']
    else:
        subtitle = f'{n} words · both directions, as two cards per word'
        description = desc(entries, n)
        tags = ['norwegian', 'bokmål', 'vocabulary', LEVEL, NAMES[LEVEL].lower()]
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': subtitle,
        'desc': description, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': tags,
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Norwegian vocabulary', 'speechLang': 'nb-NO',
            'fields': FIELDS,
            'cards': [
                {'name': 'Norwegian → English', 'front': FRONT_NB, 'back': BACK_NB},
                {'name': 'English → Norwegian', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Norwegian')
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
