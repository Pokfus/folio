#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / Hindi / Greek shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is SWEDISH -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword, a noun WITH ITS ARTICLE (en, ett -- the way Swedish is
    taught, since the article is the gender, and the gender decides the
    definite ending, the adjective's ending and the pronoun that stands for
    it); a plural-only noun (pengar) carries none;
  · the meanings, grouped by part of speech, a noun's gender in its label;
  · one line of key forms: a noun's definite singular and plural (bilen,
    bilar), an adjective's neuter and plural (stort, stora), a verb's present,
    past and supine (äter, åt, ätit) -- the three a learner must know by heart;
  · the forms tables behind a fold (a verb's active and -s forms; a noun's
    indefinite and definite in both numbers; an adjective's endings,
    comparative and superlative; a personal pronoun's subject, object and
    possessive forms);
  · up to three Tatoeba sentences, the word picked out, with a speaker.

No romanisation: Swedish is written in the Latin alphabet.  The speaker reads
the `Say` field: the noun with its article, else the word.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sv import fold, nfc, WORD as SVWORD
from swedish_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'swedish'
COLOR = '#757839'          # the shelf's measured hue, kept in step with "lang-swedish" in app.js
FIELDS = ['Swedish', 'Word', 'Say', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'prep': 'preposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep_phrase': 'phrase',
            'proverb': 'proverb', 'article': 'article', 'postp': 'postposition'}
GENDER = {'c': 'common gender (en)', 'n': 'neuter (ett)', 'cn': 'common or neuter (en or ett)',
          'nc': 'neuter or common (ett or en)', 'p': 'plural only'}
ARTICLE = {'c': 'en', 'n': 'ett', 'cn': 'en/ett', 'nc': 'ett/en'}

SAY = '<span class="uc-tts uc-say" data-say="{{Say}}"></span>'
WORDF = '<div class="uc-word">{{Swedish}}' + SAY + '</div>'
ASK = '<div class="uc-ask">Say it in Swedish</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_SV = WORDF
BACK_SV = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
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
        # Wiktionary glosses a Swedish noun with the English article ("a car
        # (automobile)"); the card's label already says it is a noun
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
# of speech, the first that has it), unless named here.  Read off the A1 build (2026-11-09).
ETYMS = {
    'ris': ['2'],               # rice; etymology 1 is "small shrubs, brushwood"
    'sticka': ['2'],            # "to go, to leave" (sticka hem); etymology 1's verb is "to knit"
    'att': ['1', '2'],          # the infinitive marker AND "that" (the conjunction is etymology 2)
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech, where Wiktionary's
# is a grammar note, a paragraph or a pointer rather than a meaning.
GLOSS = {
    'en': {'article': ['a, an (the indefinite article: en with a common-gender noun, '
                       'ett with a neuter one)']},
    'ska': {'verb': ['will, be going to (the future: jag ska äta, "I am going to eat")',
                     'shall, should, be supposed to', 'skulle: would, was going to']},
    'pengar': {'noun': ['money']},
    'det': {'pron': ['it (standing for a neuter noun)',
                     'it, there (the empty subject: det regnar, "it is raining"; det finns, "there is")',
                     'that (det där, "that one")'],
            'article': ['the (before an adjective with a neuter noun: det stora huset)']},
    'den': {'article': ['the (before an adjective with a common-gender noun: den stora bilen)']},
    'de': {'article': ['the (before an adjective with a plural noun: de stora bilarna)']},
    'du': {'pron': ['you (one person)']},
    'att': {'particle': ['to (before a verb: att äta, "to eat")'], 'conj': ['that']},
    'ju': {'adv': ['you know, of course (marking what is said as known: det är ju sant, '
                   '"it\'s true, you know")', 'the … the (ju förr desto bättre, "the sooner the better")']},
    'hejdå': {'intj': ['bye, goodbye']},
    'skada': {'verb': ['to injure, to harm, to hurt, to damage']},
    'vi': {'pron': ['we']}, 'han': {'pron': ['he']}, 'hon': {'pron': ['she']},
    'ni': {'pron': ['you (more than one person)']},
    'dig': {'pron': ['you (as an object: one person)', 'yourself']},
    'oss': {'pron': ['us', 'ourselves']},
    'er': {'pron': ['you (as an object: more than one person)', 'your, yours (of more than one person)']},
    'kunna': {'verb': ['can, to be able to', 'to know (a skill or a subject)', 'could, might, may']},
    'tro': {'verb': ['to believe, to think', 'to believe, to trust (someone)', 'to believe in']},
    'andra': {'adj': ['second', 'other, others (the plural of annan)']},
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'sätta': 'to put or place',   # first listed is "to sit", which is sätta sig
    'tag': 'while',               # ett tag "a while"; first listed is "a grip"
    'gång': 'time',               # en gång "once"; first listed is "walking"
    'penna': 'pen',               # first listed is "a contour feather"
    'middag': 'dinner',           # first listed is "midday"
    'krona': 'krona',             # first listed is "crown (headwear)"
}

# NO ARTICLE for a language's name, which Swedish uses without one (jag talar svenska)
NO_ART = {'svenska', 'engelska'}

# A GENDER WRITTEN HERE, where the lemma's first entry is not the everyday word's.
GENDER_FIX = {'pengar': 'p'}

# A PART OF SPEECH NOT SHOWN for one word: a block that is noise beside the word a beginner meets.
DROP_POS = {('vara', 'noun'), ('jag', 'noun'), ('det', 'noun'), ('en', 'pron'), ('en', 'adv'),
            ('en', 'noun'), ('en', 'num'), ('och', 'intj'), ('för', 'noun'), ('som', 'adv'),
            ('du', 'noun'), ('ut', 'postp'), ('ut', 'intj'), ('flicka', 'verb'), ('fisk', 'adv'),
            ('sida', 'verb'), ('klocka', 'verb'), ('bakom', 'adj'), ('eftersom', 'adv')}

# A GLOSS THAT IS NOT A MEANING: a pointer to another headword or a form label.
NOT_A_MEANING = re.compile(
    r'^\*?\s*see:|^synonym of |senses\.?$|^(?:indefinite|definite|genitive|neuter|plural|'
    r'present|past|preterite|supine|imperative|comparative|superlative)[^;]* of \S+(?: \([^)]*\))?$',
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
    """A verb cell: the active voice first, then the -s form (a deponent like hoppas
    has only those)."""
    return cells(tb, 'active', *need, skip=skip) or \
        cells(tb, 'passive', *need, skip=skip + ('active',))


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
        ne = cells(tb, 'indefinite', 'neuter', 'positive', 'singular')
        pl = cells(tb, 'indefinite', 'plural', 'positive', skip=('masculine',))
        if ne and fold(ne) != fold(word):
            bits.append(fi('neuter', ne))
        if pl and fold(pl) != fold(word):
            bits.append(fi('plural', pl))
    elif e['pos'] == 'verb':
        pr = vcells(tb, 'indicative', 'present', skip=('plural',)) or e['head'].get('present', '')
        pa = vcells(tb, 'indicative', 'past', skip=('plural',)) or e['head'].get('preterite', '')
        su = vcells(tb, 'supine') or e['head'].get('supine', '')
        bits += [fi('present', pr), fi('past', pa), fi('supine', su)]
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
                    row('present', cells(tb, v, 'indicative', 'present', skip=skip + ('plural',))),
                    row('past', cells(tb, v, 'indicative', 'past', skip=skip + ('plural',))),
                    row('supine (har …)', cells(tb, v, 'supine', skip=skip)),
                    row('imperative', cells(tb, v, 'imperative', skip=skip + ('plural',)))]
        act = voice('active', ('participle',))
        blocks = [block('forms', act) if any(act) else '',
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
                row('neuter (ett)', cells(tb, 'indefinite', 'neuter', 'positive', 'singular')),
                row('plural', cells(tb, 'indefinite', 'plural', 'positive', skip=('masculine',))),
                row('definite', cells(tb, 'definite', 'positive', skip=('masculine',)))]),
            block('comparative', [row('more …', cells(tb, 'comparative', 'indefinite',
                                                      skip=('neuter', 'plural', 'masculine')))]),
            block('superlative', [
                row('most …', cells(tb, 'superlative', 'indefinite',
                                    skip=('neuter', 'plural', 'masculine'))),
                row('definite', cells(tb, 'superlative', 'definite', skip=('masculine',)))]),
        ]
    elif e.get('personal'):
        blocks = [block('forms', [
            row('subject', cells(tb, 'nominative')),
            row('object', cells(tb, 'oblique')),
            row('possessive (en)', cells(tb, 'possessive', 'possessed-common')),
            row('possessive (ett)', cells(tb, 'possessive', 'possessed-neuter')),
            row('possessive (plural)', cells(tb, 'possessive', 'possessed-many'))])]
    else:
        return ''
    blocks = [b for b in blocks if b]
    if not blocks:
        return ''
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>'


# ---- examples --------------------------------------------------------------------------
SPLIT = re.compile('(' + SVWORD.pattern + ')')


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
    for sv, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(sv)}"></span>{mark(sv, hits)}</div>'
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
        # no article on a noun Wiktionary gives no table (the months: juli, not "en juli")
        art = ARTICLE.get(g, '') if main['pos'] == 'noun' and main['table'] \
            and word not in NO_ART else ''
        head = (f'<span class="uc-art">{E(art)}</span> ' if art else '') + E(word)
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Swedish': head,
            'Word': word,
            'Say': (art.split('/')[0] + ' ' if art else '') + word,
            'English': english(ents, word),
            'Forms': forms_line(main, word),
            'Table': table_html(main, word),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex)})
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
        "Both study directions in one deck: Swedish → English (see the Swedish, recall the meaning) "
        "and English → Swedish (see an English meaning, recall the Swedish). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words of Swedish for a beginner, aligned to {LEVEL.upper()} of the "
        f"Common European Framework of Reference, whose global descriptor begins '{SC['quote']}' — "
        f"a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: Swedish has examinations at these levels — "
        "Swedex and Tisus — but neither was found to publish a word list, so this deck is not an "
        f"examination's vocabulary and does not claim to be. It is assembled from two things that "
        f"can be stated. {from_inv} of the {n} come from a vocabulary written for the level's scope "
        f"— {SC['topics']} — and the other {n - from_inv} are the commonest remaining words of "
        "everyday Swedish, taken from a frequency list built from film and television subtitles and "
        "counted by the WHOLE word, every form of a noun or a verb added together. The cards are "
        "dealt by that frequency, so the words you meet most often come first. "
        f"The {nouns} nouns are printed with their article — en or ett — because the article is "
        "the gender, which decides the noun's definite ending, the adjective's ending and the "
        "pronoun that stands for it, and they show their definite singular and their plural (bilen, "
        f"bilar); the {verbs} verbs show their present, past and supine, the three forms a Swedish "
        "verb is learnt by (äter, åt, ätit), and behind the All forms fold their imperative, -s "
        "forms and participles. " + EX_NOTE + ", with the word picked out in colour and a speaker "
        "beside the sentence and the headword. Sources. Level: the Common European Framework of "
        "Reference (Council of Europe), global scale. Meanings, gender and forms: English "
        "Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Frequency: a word list built from "
        "OpenSubtitles (hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba "
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
        'tags': ['swedish', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Swedish vocabulary', 'speechLang': 'sv-SE',
            'fields': FIELDS,
            'cards': [
                {'name': 'Swedish → English', 'front': FRONT_SV, 'back': BACK_SV},
                {'name': 'English → Swedish', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Swedish')
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
