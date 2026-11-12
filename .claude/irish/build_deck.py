#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / Hindi / Greek / Swedish shape.  The
word is a single record and the two directions are card TEMPLATES, so a
corrected gloss is corrected both ways at once and each direction keeps its own
schedule.  Card 1 is IRISH -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword as the dictionary heads it: a noun in the nominative singular,
    a verb by its IMPERATIVE SINGULAR (`déan` "do!"), the form Irish
    dictionaries list a verb by, since Irish has no infinitive;
  · the meanings, grouped by part of speech, a noun's gender in its label --
    the gender decides how the article mutates the noun (`an fear`, `an bhean`)
    and how an adjective after it does;
  · one line of key forms: a noun with the article, its genitive singular and
    its plural (`an teach`, `tí`, `tithe`); a verb's present, past, future and
    verbal noun (`déanann`, `rinne`, `déanfaidh`, `déanamh`); an adjective's
    plural and comparative (`móra`, `níos mó`);
  · the forms tables behind a fold: a verb's tenses by person, with the
    autonomous ("one does") form; a noun's article, genitive and plural forms and
    its TWO MUTATIONS (`theach`, `dteach`); an adjective's masculine, feminine,
    genitive and plural; a preposition's personal forms (`liom`, `leat`, `leis`);
  · up to three Tatoeba sentences, the word picked out in any of its forms or
    mutations, with a speaker.

No romanisation: Irish is written in the Latin alphabet.  The speaker reads
the `Say` field, the headword.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ga import fold, nfc, variants, WORD as GAWORD
from irish_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

# a level's stamp is the day it was first built, so a re-run of a shipped level is byte-identical
STAMP = {'a1': '2026-11-12T00:00:00.000Z', 'a2': '2026-11-12T00:00:00.000Z',
         'b1': '2026-11-12T00:00:00.000Z'}[LEVEL]
WHO = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner',
       'b2': 'an upper-intermediate learner', 'c1': 'an advanced learner'}
TYPE_ID = 'irish'
COLOR = '#A84293'          # the shelf's measured hue, kept in step with "lang-irish" in app.js
FIELDS = ['Irish', 'Word', 'Say', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'prep': 'preposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep_phrase': 'phrase',
            'proverb': 'proverb', 'article': 'article'}
GENDER = {'m': 'masculine', 'f': 'feminine', 'mf': 'masculine or feminine',
          'fm': 'feminine or masculine', 'p': 'plural only', 'mp': 'masculine, plural only',
          'fp': 'feminine, plural only'}

SAY = '<span class="uc-tts uc-say" data-say="{{Say}}"></span>'
WORDF = '<div class="uc-word">{{Irish}}' + SAY + '</div>'
ASK = '<div class="uc-ask">Say it in Irish</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_GA = WORDF
BACK_GA = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
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
        # Wiktionary may gloss a noun with the English article ("a house");
        # the card's label already says it is a noun
        g = re.sub(r'^(?:an?|the) (?=[\w(])', '', g)
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
# of speech, the first that has it), unless named here.  Read off the A1 build (2026-11-12).
ETYMS = {
    'do': ['3', '4'],           # the preposition "to, for" and "your"; etymologies 1-2 are verbal particles
    # A2 (2026-11-12)
    'staid': ['2'],             # "state, condition"; etymology 1 is "stadium"
    'ord': ['2'],               # "order"; etymology 1 is "sledgehammer"
    'iris': ['3'],              # "magazine, journal"; etymology 1 is "strap"
    'trácht': ['3', '4'],       # "traffic" and "mention"; etymology 1 is "strand", 2 "sole of the foot"
    'líon': ['2', '3'],         # "number" and "to fill"; etymology 1 is "flax"
    'ré': ['2'],                # "era, period; moon"; etymology 1 is "level ground"
    'úd': ['2'],                # "yon, that over there"; etymology 1 is "readiness"
    # B1 (2026-11-12)
    'fuath': ['2'],             # "hate"; etymology 1 is "form; phantom"
    'cainéal': ['2'],           # "channel"; etymology 1 is "cinnamon"
    'guta': ['2'],              # "vowel"; etymology 1 is "filth"
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech, where Wiktionary's
# is a grammar note, a paragraph or a pointer rather than a meaning.
GLOSS = {
    'is': {'particle': ['is, am, are (the copula, joining two nouns: is múinteoir í, "she is a teacher")',
                        'used before an adjective to form the superlative (is mó, "biggest")']},
    'ba': {'particle': ['was, were, would be (the copula in the past and conditional: ba mhúinteoir é, '
                        '"he was a teacher")']},
    'ea': {'pron': ['it (in is ea, "it is"; sea, "yes, it is")']},
    'a': {'det': ['his, its (lenites: a bhean, "his wife")', 'her, its (no lenition; h before a vowel: a hathair, "her father")', 'their (eclipses: a mbád, "their boat")']},
    'do': {'det': ['your (of one person; lenites: do bhean, "your wife")']},
    'féidir': {'noun': ['possibility (is féidir liom, "I can")']},
    'fios': {'noun': ['knowledge, information (tá a fhios agam, "I know")']},   # A2: its second is "carnal knowledge"
    'fadhb': {'noun': ['problem (a knotty problem, a poser)', 'knot (in timber)']},  # the everyday sense is Wiktionary's fifth
    'cloch': {'noun': ['stone', 'stone (unit of weight, 6.35 kg)']},   # its third is "testicle"
    'ré': {'noun': ['era, age, period (of time)', 'moon']},
    'altra': {'noun': ['nurse', 'foster father']},   # Wiktionary lists the old sense first
    'féar': {'noun': ['grass']},                      # its second is the slang "marijuana"
    'an': {'article': ['the (singular; an bhean, "the woman"; plural na)']},
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'leath': 'half; part, portion',     # first listed is "side; part, direction"
    'post': 'post, job (of employment)',  # first listed is "timber post"
    'airgead': 'money, sum of money',   # first listed is "silver"
    'deas': 'nice',
    'leagan': 'version, reading, form, phrase (of text)',   # A2: first listed is "laying"
    'cuairt': 'visit',                  # first listed is "circuit; round"
    'rang': 'class',
    'inneall': 'machine, engine',
    'sochaí': 'social community, society',   # first listed is "many"
    'deis': 'opportunity (chance for advancement, progress or profit)',   # first listed is "right (side)"
    'agallamh': 'interview',            # first listed is "argument"
    'stailc': 'strike',                 # first listed is "stubborn trait"
    'oiliúint': 'training, coaching',   # first listed is "nutrition"       # B1: first listed is "arrangement"                    # first listed is "rank"                     # first listed is "right, right-hand"
}

# A GENDER WRITTEN HERE, where the lemma's first entry is not the everyday word's.
GENDER_FIX = {}

# A PART OF SPEECH NOT SHOWN for one word: a block that is noise beside the word a beginner meets.
DROP_POS = {('nó', 'particle'), ('nua', 'noun'), ('bean', 'pron'),
            ('ainneoin', 'noun'), ('úd', 'noun')}   # A2

# THE PAST OF THE IRREGULAR VERBS, as the Official Standard writes it (third person singular).
# kaikki.org's tables for these lose the independent past (`téigh` gives only the dependent
# `deachaigh` and a dialect `théigh`; `déan` only habitual forms), and their present cells are
# northern forms (`ním`), so these eleven show the key forms line and no All forms fold.
IRREG_PAST = {'bí': 'bhí', 'abair': 'dúirt', 'beir': 'rug', 'clois': 'chuala', 'déan': 'rinne',
              'faigh': 'fuair', 'feic': 'chonaic', 'ith': "d'ith", 'tabhair': 'thug',
              'tar': 'tháinig', 'téigh': 'chuaigh'}

# NO FORMS for the months, the days and the country: Wiktionary gives them a noun's article and
# plural (an tEanáir, Eanáirí), which a learner does not meet; Irish says Eanáir, Dé Luain, Éire.
NO_FORMS = {'Eanáir', 'Feabhra', 'Márta', 'Aibreán', 'Bealtaine', 'Meitheamh', 'Iúil', 'Lúnasa',
            'Meán Fómhair', 'Deireadh Fómhair', 'Samhain', 'Luan', 'Máirt', 'Céadaoin',
            'Déardaoin', 'Aoine', 'Satharn', 'Domhnach', 'Éire'}

# A GLOSS THAT IS NOT A MEANING: a pointer to another headword or a form label.
NOT_A_MEANING = re.compile(
    r'^\*?\s*see:|^synonym of |senses\.?$|^(?:genitive|vocative|dative|plural|nominative|'
    r'present|past|future|conditional|imperative|comparative|superlative|verbal noun)[^;]* of \S+'
    r'(?: \([^)]*\))?$', re.I)


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
            if LEVEL == 'phr' and re.match(r'(?i)used other than figuratively|see \S+$|see \S+ (?:and|or) \S+$', t):
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
RARE = ('archaic', 'dated', 'rare', 'obsolete', 'dialectal', 'literary', 'Munster',
        'Connacht', 'Ulster', 'emphatic')


def cells(table, *need, skip=(), n=2):
    """Every listed form of one cell, at most `n`, joined (`bheinn / beinn`)."""
    got = []
    for t in table:
        tags = set(t['t'])
        if all(x in tags for x in need) and not (tags & (set(skip) | set(RARE))) \
                and t['f'] not in got:
            got.append(t['f'])
    return ' / '.join(got[:n]) if got else ''


def claim(table, *need, skip=()):
    """The one-word form of the first matching cell (`bhí` from `bhí sé`)."""
    for t in table:
        tags = set(t['t'])
        if all(x in tags for x in need) and not (tags & (set(skip) | set(RARE))) and t.get('k'):
            return t['k']
    return ''


PRON = {'mé', 'tú', 'sé', 'sí', 'muid', 'sibh', 'siad'}


def past_form(tb):
    """The past, third person singular, without its pronoun (`d'éirigh` from `d'éirigh sé`)."""
    for t in tb:
        tags = set(t['t'])
        if {'past', 'third-person', 'singular'} <= tags and not tags & (
                {'habitual', 'subjunctive', 'autonomous', 'dependent'} | set(RARE)):
            return ' '.join(w for w in t['f'].split() if w not in PRON)
    return ''


def fi(label, form):
    if not form:
        return ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(form)}</span>'


def forms_line(e, word):
    tb, hd = e['table'], e['head']
    bits = []
    if word in NO_FORMS:
        return ''
    if e['pos'] == 'noun':
        if GENDER_FIX.get(word, e['gender']).endswith('p'):
            bits.append(fi('with the article', cells(tb, 'definite', 'nominative', 'plural', n=1)))
        else:
            bits.append(fi('with the article', cells(tb, 'definite', 'nominative', 'singular', n=1)))
            bits.append(fi('genitive', hd.get('gen', '')))
            bits.append(fi('plural', hd.get('pl', '')))
    elif e['pos'] == 'adj':
        if hd.get('pl') and fold(hd['pl']) != fold(word):
            bits.append(fi('plural', hd['pl']))
        if hd.get('comp'):
            bits.append(fi('comparative', 'níos ' + hd['comp']))
    elif e['pos'] == 'verb':
        past = IRREG_PAST.get(word) or past_form(tb)
        bits += [fi('present', hd.get('pres', '')), fi('past', past),
                 fi('future', hd.get('fut', '')), fi('verbal noun', hd.get('vn', ''))]
    elif e['pos'] == 'pron' and hd.get('emph'):
        bits.append(fi('emphatic', hd['emph']))
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


PERSONS = [('I', ('first-person', 'singular')), ('you', ('second-person', 'singular')),
           ('he, she', ('third-person', 'singular')), ('we', ('first-person', 'plural')),
           ('you (plural)', ('second-person', 'plural')), ('they', ('third-person', 'plural'))]
TENSES = [('present', ('present',), ('habitual', 'subjunctive', 'conditional')),
          ('past', ('past',), ('habitual', 'subjunctive')),
          ('past habitual', ('past', 'habitual'), ('subjunctive',)),
          ('future', ('future',), ()),
          ('conditional', ('conditional',), ()),
          ('imperative', ('imperative',), ('past',))]
PREP = [('me', ('first-person', 'singular')), ('you', ('second-person', 'singular')),
        ('him, it', ('masculine', 'third-person', 'singular')),
        ('her, it', ('feminine', 'third-person', 'singular')), ('us', ('first-person', 'plural')),
        ('you (plural)', ('second-person', 'plural')), ('them', ('third-person', 'plural'))]


def table_html(e, word):
    tb, hd = e['table'], e['head']
    if not tb or word in NO_FORMS or word in IRREG_PAST:
        return ''
    if e['pos'] == 'verb':
        blocks = []
        for name, need, skip in TENSES:
            rows = [row(p, cells(tb, *need, *pt, skip=skip + ('autonomous', 'dependent')))
                    for p, pt in PERSONS]
            rows.append(row('autonomous', cells(tb, 'autonomous', *need, skip=skip + ('dependent',), n=1)))
            blocks.append(block(name, rows))
        blocks.append(block('other forms', [row('verbal noun', hd.get('vn', '')),
                                            row('past participle', hd.get('pp', ''))]))
    elif e['pos'] == 'noun':
        blocks = [
            block('singular', [row('nominative', word),
                               row('with the article', cells(tb, 'definite', 'nominative', 'singular')),
                               row('genitive', hd.get('gen', '')),
                               row('genitive, with the article', cells(tb, 'definite', 'genitive', 'singular'))]),
            block('plural', [row('nominative', hd.get('pl', '')),
                             row('with the article', cells(tb, 'definite', 'nominative', 'plural')),
                             row('genitive, with the article', cells(tb, 'definite', 'genitive', 'plural'))]),
            block('mutations', [row('lenition', cells(tb, 'mutation', 'lenition', n=1)),
                                row('eclipsis', cells(tb, 'mutation', 'eclipsis', n=1)),
                                row('h-prefix', next((t['f'] for t in tb if t['t'] == ['mutation']
                                                      and fold(t['f']) == 'h' + fold(word)), ''))]),
        ]
    elif e['pos'] == 'adj':
        blocks = [
            block('singular', [row('masculine', cells(tb, 'masculine', 'nominative', 'singular', n=1)),
                               row('feminine', cells(tb, 'feminine', 'nominative', 'singular', n=1)),
                               row('genitive, masculine', cells(tb, 'masculine', 'genitive', 'singular', n=1)),
                               row('genitive, feminine', cells(tb, 'feminine', 'genitive', 'singular', n=1))]),
            block('plural', [row('nominative', cells(tb, 'nominative', 'plural'))]),
            block('comparison', [row('comparative', cells(tb, 'comparative', n=1)),
                                 row('superlative', cells(tb, 'superlative', n=1))]),
        ]
    elif e['pos'] == 'prep':
        blocks = [block('with a pronoun', [row(p, cells(tb, *pt, n=1)) for p, pt in PREP])]
    else:
        return ''
    blocks = [b for b in blocks if b]
    if not blocks:
        return ''
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>'


# ---- examples --------------------------------------------------------------------------
SPLIT = re.compile('(' + GAWORD.pattern + ')')


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
    for ga, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(ga)}"></span>{mark(ga, hits)}</div>'
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
        ex = exs.get(r['key'], [])
        cards.append({'sub': r.get('sub', ''), 'fields': {
            'Irish': E(word),
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
        "Both study directions in one deck: Irish → English (see the Irish, recall the meaning) "
        "and English → Irish (see an English meaning, recall the Irish). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words of Irish (Gaeilge) for {WHO[LEVEL]}, aligned to {LEVEL.upper()} of the "
        f"Common European Framework of Reference, whose global descriptor begins '{SC['quote']}' — "
        f"a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: Irish has a graded examination at these "
        "levels — the Teastas Eorpach na Gaeilge (TEG) of Maynooth University — whose syllabuses "
        "describe each level but do not publish a complete word list, so this deck is not an "
        f"examination's vocabulary and does not claim to be. It is assembled from two things that "
        f"can be stated. {from_inv} of the {n} come from a vocabulary written for the level's scope "
        f"— {SC['topics']} — and the other {n - from_inv} are the commonest remaining words of "
        "written Irish, counted over the articles of the Irish-language Wikipedia by the WHOLE word: "
        "every form of a noun or a verb added together, and every spelling its initial mutations "
        "give it (bean, bhean, mbean). No subtitle frequency list exists for Irish, and an "
        "encyclopaedia's commonest words lean towards history, places and people, which is why the "
        "deck leads with the hand-written vocabulary. The cards are dealt by that frequency, so the "
        "words you meet most often come first. "
        f"The {nouns} nouns carry their gender, which decides how the article changes them (an fear, "
        "an bhean), and show the noun with the article, its genitive and its plural (an teach, tí, "
        f"tithe); the {verbs} verbs are headed by the imperative, the form Irish dictionaries list a "
        "verb by (déan, \"do\"), and show their present, past, future and verbal noun (déanann, "
        "rinne, déanfaidh, déanamh). Behind the All forms fold a verb's tenses go by person, a noun "
        "shows its lenited and eclipsed forms (theach, dteach) and a preposition its forms with a "
        "pronoun (liom, leat, leis). The spelling is the Official Standard (An Caighdeán Oifigiúil) "
        "as Wiktionary gives it. " + EX_NOTE + ", with the word picked out in colour and a speaker "
        "beside the sentence and the headword; few devices have an Irish voice, so the speaker may "
        "be silent. Sources. Level: the Common European Framework of Reference (Council of Europe), "
        "global scale. Meanings, gender and forms: English Wiktionary, via the kaikki.org extraction "
        "(CC BY-SA 4.0). Frequency: the Irish Wikipedia (ga.wikipedia.org), its articles as of "
        "1 November 2026, counted for this deck (CC BY-SA 4.0). Example sentences: Tatoeba "
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
    subtitle = f'{n} words · both directions, as two cards per word'
    description = desc(entries, n)
    tags = ['irish', 'gaeilge', 'vocabulary', LEVEL, NAMES[LEVEL].lower()]
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': subtitle,
        'desc': description, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': tags,
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Irish vocabulary', 'speechLang': 'ga-IE',
            'fields': FIELDS,
            'cards': [
                {'name': 'Irish → English', 'front': FRONT_GA, 'back': BACK_GA},
                {'name': 'English → Irish', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Irish')
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
