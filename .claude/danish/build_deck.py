#!/usr/bin/env python3
#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

Swedish's builder (`.claude/swedish/build_deck.py`) adapted; the plan is
`docs/danish-decks-plan.md`.

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / Hindi / Greek / Swedish shape.  The
word is a single record and the two directions are card TEMPLATES, so a
corrected gloss is corrected both ways at once and each direction keeps its own
schedule.  Card 1 is DANISH -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword, a noun WITH ITS ARTICLE (en, et -- the way Danish is taught,
    since the article is the gender, and the gender decides the definite
    ending, the adjective's ending and the pronoun that stands for it); a
    plural-only noun (penge) carries none;
  · the meanings, grouped by part of speech, a noun's gender in its label;
  · one line of key forms: a noun's definite singular and plural (bilen,
    biler), an adjective's neuter and its e-form (stort, store), a verb's
    present, past and perfect WITH ITS AUXILIARY (spiser, spiste, har spist;
    går, gik, er gået) -- Danish chooses between have and være by the verb,
    and the choice is learnt with it;
  · the forms tables behind a fold (a verb's active and -s forms and
    participles; a noun's indefinite and definite in both numbers; an
    adjective's forms, comparative and superlative; a pronoun's forms);
  · up to three Tatoeba sentences, the word picked out, with a speaker.

No romanisation: Danish is written in the Latin alphabet.  The speaker reads
the `Say` field: the noun with its article, else the word.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from da import fold, nfc, WORD as DAWORD
from danish_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

# a level's stamp is the day it was first built, so a re-run of a shipped level is byte-identical
STAMP = {'a1': '2026-11-15T00:00:00.000Z', 'a2': '2026-11-15T00:00:00.000Z'}[LEVEL]
WHO = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner',
       'b2': 'an upper-intermediate learner', 'c1': 'an advanced learner'}
TYPE_ID = 'danish'
COLOR = '#752466'          # the shelf's measured hue, kept in step with "lang-danish" in app.js
FIELDS = ['Danish', 'Word', 'Say', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'prep': 'preposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep_phrase': 'phrase',
            'proverb': 'proverb', 'article': 'article', 'postp': 'postposition'}
GENDER = {'c': 'common gender (en)', 'n': 'neuter (et)', 'cn': 'common or neuter (en or et)',
          'nc': 'neuter or common (et or en)', 'p': 'plural only'}
ARTICLE = {'c': 'en', 'n': 'et', 'cn': 'en/et', 'nc': 'et/en'}

SAY = '<span class="uc-tts uc-say" data-say="{{Say}}"></span>'
WORDF = '<div class="uc-word">{{Danish}}' + SAY + '</div>'
ASK = '<div class="uc-ask">Say it in Danish</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_DA = WORDF
BACK_DA = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORDF + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape
TRAIL = re.compile(r'\s*[:;,]\s*$')


LONG = re.compile(r'^([^;()]{1,40}); (.{20,})$')
PAREN = re.compile(r'^([^()]{2,30}) \((.{25,})\)$')
CAP_OPENERS = {'Used', 'Indicates', 'Expresses', 'Specifies', 'A', 'An', 'The', 'Denotes'}


def gloss_text(g, pos):
    g = TRAIL.sub('', g).rstrip('.')
    # Wiktionary writes many senses as "word; a definition of it" -- "to have; to possess,
    # or to have as a property; ..."; the card keeps the word, which is the meaning, and
    # drops the definition once the whole runs long
    m = LONG.match(g)
    if m and len(g) > 55:
        g = m.group(1)
    if pos == 'noun':
        # Wiktionary glosses a Danish noun with the English article ("a car
        # (automobile)"); the card's label already says it is a noun
        g = re.sub(r'^(?:[Aa]n?|[Tt]he) (?=[\w(])', '', g)
    # a long gloss that is a word and a parenthetical definition of it ("Friday (now
    # generally considered the fifth day of the week ...)") keeps the word
    m = PAREN.match(g)
    if m and len(g) > 60:
        g = m.group(1)
    # Wiktionary opens a grammar note with a capital ("Used to ...", "Indicates ...");
    # an English proper noun keeps its capital (English, Friday, March)
    w0 = g.split(' ', 1)[0]
    return g[:1].lower() + g[1:] if w0 in CAP_OPENERS else g


# ONE ETYMOLOGY PER CARD, the first Wiktionary lists (or, where the inventory names a part
# of speech, the first that has it), unless named here.  Read off the A1 build (2026-11-15).
ETYMS = {
    # A2 (2026-11-15)
    'skab': ['2'],              # "a cupboard"; etymology 1 is "mange"
    'mål': ['2'],               # "a goal, a measure"; etymology 1 is "language"
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech, where Wiktionary's
# is a grammar note, a paragraph or a pointer rather than a meaning.
GLOSS = {
    'en': {'article': ['a, an (the indefinite article: en with a common-gender noun, '
                       'et with a neuter one)']},
    'de': {'article': ['the (before an adjective with a plural noun: de store biler)'],
           'pron': ['they', 'those']},
    'den': {'article': ['the (before an adjective with a common-gender noun: den store bil)'],
            'pron': ['it (standing for a common-gender noun)', 'that, that one']},
    'det': {'article': ['the (before an adjective with a neuter noun: det store hus)'],
            'pron': ['it (standing for a neuter noun)',
                     'it, there (the empty subject: det regner, "it is raining")', 'that']},
    'du': {'pron': ['you (one person)']},
    'mig': {'pron': ['me', 'myself']},
    'dig': {'pron': ['you (as an object: one person)', 'yourself']},
    'hende': {'pron': ['her']},
    'jer': {'pron': ['you (as an object: more than one person)', 'yourselves']},
    'os': {'pron': ['us', 'ourselves']},
    'sig': {'pron': ['himself, herself, itself, themselves (reflexive)']},
    'min': {'pron': ['my, mine']},
    'sin': {'pron': ['his, her, its, their (own: referring back to the subject)']},
    'hos': {'prep': ['at (someone\'s home or place: hos lægen, "at the doctor\'s")', 'with']},
    'om': {'prep': ['about', 'in (a time from now: om en uge, "in a week")', 'around']},
    'hvorfor': {'adv': ['why']},
    'lide': {'verb': ['kunne lide: to like (jeg kan lide kaffe, "I like coffee")', 'to suffer']},
    'ske': {'verb': ['to happen, to occur, to take place']},
    'gud': {'noun': ['god, God']},
    'blå': {'adj': ['blue']},
    'nødt': {'adj': ['være nødt til: to have to, to be obliged to (jeg er nødt til at gå, '
                     '"I have to go")']},
    'rejse': {'verb': ['to travel, to go', 'to leave, to depart', 'to raise, to put up']},
    'tak': {'intj': ['thank you, thanks']},
    'nu': {'adv': ['now']},
    'fatte': {'verb': ['to understand, to grasp']},
    # A2 (2026-11-15)
    'forbi': {'adv': ['over, finished', 'past, by'], 'prep': ['past, by']},
    'stole': {'verb': ['stole på: to trust, to rely on']},
    'tøj': {'noun': ['clothes, clothing', 'fabric, material']},
    'skidt': {'adj': ['bad, poor'], 'intj': ["never mind, it doesn't matter"]},
    'aftes': {'noun': ['i aftes: last night, yesterday evening']},
    'hær': {'noun': ['army']},
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {'gang': 'time (an occurrence, an incidence)'}

MONTHS = set('januar februar marts april maj juni juli august september oktober november '
             'december'.split())

# NO ARTICLE for a language's name, which Danish uses without one (jeg taler dansk)
NO_ART = {'dansk', 'engelsk', 'tysk', 'fransk', 'svensk', 'norsk', 'spansk',
          'fru', 'aftes'}   # a title (fru Hansen) and a noun met only in i aftes

# A GENDER WRITTEN HERE, where the lemma's first entry is not the everyday word's.
GENDER_FIX = {'penge': 'p', 'forældre': 'p', 'farfar': 'c', 'kuglepen': 'c',
              # A2: Wiktionary gives these no gender
              'maskine': 'c', 'kursus': 'n', 'busstoppested': 'n', 'oberst': 'c', 'forskel': 'c'}

# A PART OF SPEECH NOT SHOWN for one word: a block that is noise beside the word a beginner meets.
DROP_POS = {('kende', 'adv'), ('lukke', 'noun'), ('færdig', 'intj'), ('nu', 'noun'), ('om', 'adv'),
            ('han', 'noun'), ('hun', 'noun'), ('hvad', 'intj'), ('spise', 'noun'), ('øje', 'verb'),
            ('skole', 'verb'), ('få', 'noun'), ('stå', 'noun'), ('tak', 'noun'),
            # A2
            ('herre', 'adv'), ('kæreste', 'verb'), ('gemme', 'noun'), ('pleje', 'noun'), ('brænde', 'noun'),
            ('skidt', 'noun'), ('tosse', 'verb'), ('tæppe', 'verb'), ('tåge', 'verb'), ('ægte', 'verb'),
            ('dække', 'noun'), ('skifte', 'noun')}

# A GLOSS THAT IS NOT A MEANING: a pointer to another headword or a form label.
NOT_A_MEANING = re.compile(
    r'^\*?\s*see:|^synonym of |senses\.?$|^(?:indefinite|definite|genitive|neuter|plural|'
    r'present|past|preterite|participle|imperative|comparative|superlative)[^;]* of \S+(?: \([^)]*\))?$',
    re.I)


def entries_for(row, lex):
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


def english(ents, word=''):
    parts, shown = [], set()
    for e in ents:
        label = POS_NAME.get(e['pos'], e['pos'])
        g = GENDER_FIX.get(word, e['gender']) if e['pos'] == 'noun' else ''
        if g in GENDER:
            label += ', ' + GENDER[g]
        tv = {t for gl in e['glosses'] for t in gl['tags']}
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
RARE = ('archaic', 'dated', 'rare', 'obsolete', 'dialectal', 'subjunctive', 'colloquial',
        'pronunciation-spelling', 'neologism')


def cells(table, *need, skip=()):
    """Every listed form of one cell, at most two, joined (`sen / sent`)."""
    got = []
    for t in table:
        tags = set(t['t'])
        if all(n in tags for n in need) and not (tags & (set(skip) | set(RARE))) \
                and t['f'] not in got:
            got.append(t['f'])
    return ' / '.join(got[:2]) if got else ''


def vcells(tb, *need, skip=()):
    """A verb cell: the active voice first, then the -s form (a deponent like findes
    has only those -- Wiktionary files its forms as active)."""
    return cells(tb, 'active', *need, skip=skip) or \
        cells(tb, 'passive', *need, skip=skip + ('active',))


AUX = (('aux-have', 'har'), ('aux-være', 'er'))


def perfect(e):
    """The perfect, auxiliary and participle (`har spist`, `er gået`): the past
    participle cell of the table with the auxiliary it was written with, else the
    headword line's perfect or participle."""
    for t in e['table']:
        tags = set(t['t'])
        if {'participle', 'past'} <= tags:
            aux = ' / '.join(a for x, a in AUX if x in tags)
            return (aux + ' ' if aux else '') + t['f']
    h = e['head']
    return h.get('perfect', '') or h.get('participle', '')


def fi(label, form):
    if not form:
        return ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(form)}</span>'


def forms_line(e, word):
    tb = e['table']
    bits = []
    if e['pos'] == 'noun' and tb:
        if GENDER_FIX.get(word, e['gender']) == 'p':
            bits.append(fi('definite', cells(tb, 'definite', 'nominative', 'plural')))
        else:
            ds = cells(tb, 'definite', 'nominative', 'singular')
            ip = cells(tb, 'indefinite', 'nominative', 'plural')
            bits.append(fi('definite', ds))
            bits.append(fi('plural', ip))
    elif e['pos'] == 'adj' and tb:
        ne = cells(tb, 'neuter')
        pl = cells(tb, 'attributive', 'plural') or cells(tb, 'plural')
        if ne and fold(ne) != fold(word):
            bits.append(fi('neuter', ne))
        if pl and fold(pl) != fold(word):
            bits.append(fi('plural', pl))
    elif e['pos'] == 'verb':
        pr = vcells(tb, 'present') or e['head'].get('present', '')
        pa = vcells(tb, 'past', skip=('participle',)) or e['head'].get('past', '')
        bits += [fi('present', pr), fi('past', pa), fi('perfect', perfect(e))]
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
        def voice(v, skip):
            return [row('infinitive', cells(tb, v, 'infinitive', skip=skip)),
                    row('present', cells(tb, v, 'present', skip=skip)),
                    row('past', cells(tb, v, 'past', skip=skip)),
                    row('imperative', cells(tb, v, 'imperative', skip=skip))]
        act = voice('active', ('participle',))
        blocks = [block('forms', act + [row('perfect', perfect(e))]) if any(act) else '',
                  block('-s forms (passive)' if any(act) else 'forms', voice('passive', ('active',))),
                  block('participles', [row('present', cells(tb, 'participle', 'present')),
                                        row('past', cells(tb, 'participle', 'past', skip=('present',)))])]
    elif e['pos'] == 'noun':
        blocks = [block(num, [row('indefinite', cells(tb, 'indefinite', 'nominative', num)),
                              row('definite', cells(tb, 'definite', 'nominative', num))])
                  for num in ('singular', 'plural')]
    elif e['pos'] == 'adj':
        blocks = [
            block('positive', [
                row('common (en)', word),
                row('neuter (et)', cells(tb, 'neuter')),
                row('definite', cells(tb, 'attributive', 'definite', 'singular')),
                row('plural', cells(tb, 'attributive', 'plural') or cells(tb, 'plural'))]),
            block('comparative', [row('more …', cells(tb, 'comparative'))]),
            block('superlative', [
                row('most …', cells(tb, 'superlative', 'predicative') or
                    cells(tb, 'superlative', skip=('attributive',))),
                row('definite', cells(tb, 'superlative', 'attributive'))]),
        ]
    elif e['pos'] in ('pron', 'det'):
        blocks = [block('forms', [
            row('subject', cells(tb, 'nominative')),
            row('object', cells(tb, 'accusative') or cells(tb, 'objective')),
            row('possessive', cells(tb, 'possessive') or cells(tb, 'genitive', skip=('neuter', 'plural'))),
            row('neuter (et)', cells(tb, 'neuter')),
            row('plural', cells(tb, 'plural')),
            row('definite', cells(tb, 'definite'))])]
    else:
        return ''
    blocks = [b for b in blocks if b]
    if not blocks:
        return ''
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>'


# ---- examples --------------------------------------------------------------------------
SPLIT = re.compile('(' + DAWORD.pattern + ')')


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
    for da, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(da)}"></span>{mark(da, hits)}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>')
    return ''.join(out)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        main = ents[0]
        word = r['word']
        g = GENDER_FIX.get(word, main['gender'])
        # no article on a month (Danish says i april, never "en april") or a language
        art = ARTICLE.get(g, '') if main['pos'] == 'noun' and word not in MONTHS \
            and word not in NO_ART else ''
        head = (f'<span class="uc-art">{E(art)}</span> ' if art else '') + E(word)
        ex = exs.get(r['key'], [])
        cards.append({'sub': r.get('sub', ''), 'fields': {
            'Danish': head,
            'Word': word,
            'Say': (art.split('/')[0] + ' ' if art else '') + word,
            'English': english(ents, word),
            'Forms': forms_line(main, word),
            'Table': table_html(main, word),
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
        "Both study directions in one deck: Danish → English (see the Danish, recall the meaning) "
        "and English → Danish (see an English meaning, recall the Danish). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words of Danish for {WHO[LEVEL]}, aligned to {LEVEL.upper()} of the "
        f"Common European Framework of Reference, whose global descriptor begins '{SC['quote']}' — "
        f"a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: Danish has examinations at these levels — "
        "Prøve i Dansk 1, 2 and 3 and Studieprøven — but none was found to publish a word list, so "
        "this deck is not an examination's vocabulary and does not claim to be. It is assembled from "
        f"two things that can be stated. {from_inv} of the {n} come from a vocabulary written for the "
        f"level's scope — {SC['topics']} — and the other {n - from_inv} are the commonest remaining "
        "words of everyday Danish, taken from a frequency list built from film and television "
        "subtitles and counted by the WHOLE word, every form of a noun or a verb added together. The "
        "cards are dealt by that frequency, so the words you meet most often come first. "
        f"The {nouns} nouns are printed with their article — en or et — because the article is the "
        "gender, which decides the noun's definite ending, the adjective's ending and the pronoun "
        "that stands for it, and they show their definite singular and their plural (bilen, biler); "
        f"the {verbs} verbs show their present, their past and their perfect with its auxiliary "
        "(spiser, spiste, har spist; går, gik, er gået), since Danish chooses between have and være "
        "by the verb, and behind the All forms fold their imperative, -s forms and participles. " +
        EX_NOTE + ", with the word picked out in colour and a speaker beside the sentence and the "
        "headword. Sources. Level: the Common European Framework of Reference (Council of Europe), "
        "global scale. Meanings, gender and forms: English Wiktionary, via the kaikki.org extraction "
        "(CC BY-SA 4.0). Frequency: a word list built from OpenSubtitles (hermitdave/FrequencyWords, "
        "CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR."
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
    subtitle = f'{n} words · both directions, as two cards per word'
    description = desc(entries, n)
    tags = ['danish', 'vocabulary', LEVEL, NAMES[LEVEL].lower()]
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': subtitle,
        'desc': description, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': tags,
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Danish vocabulary', 'speechLang': 'da-DK',
            'fields': FIELDS,
            'cards': [
                {'name': 'Danish → English', 'front': FRONT_DA, 'back': BACK_DA},
                {'name': 'English → Danish', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Danish')
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
