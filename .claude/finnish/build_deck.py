#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Hungarian / Greek / Hindi shape.  The word is a single
record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is FINNISH -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword as a Finnish dictionary prints it -- a verb in its first
    infinitive (`syödä` "to eat", `puhua` "to speak"), a noun and an adjective
    in the nominative singular;
  · the meanings, grouped by part of speech;
  · one line of key forms, the part a learner cannot guess under consonant
    gradation and stem changes: a noun's plural, genitive, partitive and plural
    partitive (`käsi`, `kädet`, `käden`, `kättä`, `käsiä`), an adjective's
    comparative, genitive and partitive, a verb's "I" and "he, she" forms, its
    past and its perfect (`syödä`: `syön`, `syö`, `söi`, `on syönyt`);
  · the forms tables behind a fold (a verb's present, negative, past, perfect,
    conditional and imperative by person and its passive; a noun's fourteen
    cases in both numbers);
  · up to three Tatoeba sentences, the word picked out, with a speaker.

Every form is READ from Wiktionary, never derived, by its tags (`fi.verb_table`).
The speaker reads `Say`, the word.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fi import fold, nfc
from finnish_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-15T00:00:00.000Z'
TYPE_ID = 'finnish'
COLOR = '#907227'          # the shelf's measured hue (app.js, `lang-finnish`)
FIELDS = ['Finnish', 'Word', 'Say', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'postp': 'postposition', 'prep': 'preposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'proverb': 'proverb'}

SAY = '<span class="uc-tts uc-say" data-say="{{Say}}"></span>'
WORD = '<div class="uc-word">{{Finnish}}' + SAY + '</div>'
ASK = '<div class="uc-ask">Say it in Finnish</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_HU = WORD
BACK_HU = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape
TRAIL = re.compile(r'\s*[:;,]\s*$')


# THE GRAMMAR NOTES Wiktionary writes INTO a Finnish gloss -- which case a verb or
# postposition takes ("to know with elative ‘about’", "towards with partitive or (with
# personal pronouns only) possessive suffix", "to study with translative ‘to be’") -- and its
# cross-references ("that (over there) (compare se, see usage notes)").  On a flashcard the
# gloss is the answer: both are cut (read off the A1 build, 2026-11-15).
CASES_RE = (r'(?:nominative|genitive|partitive|inessive|elative|illative|adessive|ablative|'
            r'allative|essive|translative|abessive|instructive|comitative|possessive suffix|'
            r'(?:the )?(?:illative of )?(?:first|second|third|fourth|fifth) infinitive)')
GRAMMAR = re.compile(r'\s+(?:with|and) (?:the )?' + CASES_RE + r'(?:\s+(?:or|and)\s+(?:\([^)]*\)\s+)?'
                     + CASES_RE + r')*(?:\s+‘[^’]*’)?(?:\s+or\s+\([^)]*\)\s+' + CASES_RE + r')?')
# A2 (2026-11-12): the same notes written as "or (with verbs) of verbal noun ‘doing’",
# "or of third infinitive ‘to do’", "(with verbs) along of third infinitive ‘to do’"
GRAMMAR2 = re.compile(r'[;,]?\s*(?:or\s+)?(?:\((?:with|of) [^)]*\)\s+)?(?:along\s+)?of\s+(?:the\s+)?'
                      r'(?:verbal noun|(?:first|second|third|fourth|fifth) infinitive)(?:\s+‘[^’]*’)?')
XREF = re.compile(r'\s*\((?:compare|see|cf\.)\b[^()]*\)', re.I)


def gloss_text(g):
    g = XREF.sub('', GRAMMAR2.sub('', GRAMMAR.sub('', g)))
    return TRAIL.sub('', shorten(g))


def _brackets(g):
    """The top-level bracketed spans of a gloss, nested ones included: [(start, end)]."""
    spans, depth, start = [], 0, 0
    for i, ch in enumerate(g):
        if ch == '(':
            if not depth:
                start = i
            depth += 1
        elif ch == ')' and depth:
            depth -= 1
            if not depth:
                spans.append((start, i + 1))
    return spans


def shorten(g):
    """Wiktionary's glosses carry a DEFINITION in brackets after the gloss
    ("life (the state of organisms preceding their death, characterized by ...)"); on a
    flashcard the gloss is the answer and the definition is noise.  A bracket longer than
    40 characters is cut where the gloss outside it says something -- a short one stays
    ("orange (fruit)").  Nested brackets count as
    part of the one they sit in ("salt (... sodium chloride (NaCl), ...)")."""
    out = g
    for a, b in reversed(_brackets(g)):
        if b - a - 2 > 40:
            out = out[:a].rstrip() + out[b:]
    out = re.sub(r'\s+([,;])', r'\1', out).strip()
    return out if len(re.sub(r'[^\w]', '', out)) >= 2 else g


# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here (where the first
# etymology is NOT the everyday word, or two are), each read off the A1 build (2026-11-15):
ETYMS = {
    'juuri': ['2', '1'],       # "just, exactly" (the subtitles' count) before "root"
    'rikki': ['2', '1'],       # "broken" (B1) before "sulphur"
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech, each with its reason.
GLOSS = {
    # Wiktionary glosses it only as "comparative degree of paljon", a pointer
    'enemmän': {'adv': ['more']},
    # the four "here" and "there" words are told apart by distance, which their glosses
    # do not say; each is the standard description (near the speaker, near the listener or
    # just mentioned, farther off)
    'täällä': {'adv': ['here (in this place, around the speaker)']},
    'tässä': {'adv': ['here (right here, at this very spot)']},
    'siellä': {'adv': ['there (in that place, away from the speaker)']},
    'siinä': {'adv': ['there (right there, near the listener or just mentioned)']},
    # one meaning, two registers: the reverse card needs to say which is asked for
    'sisko': {'noun': ['sister (the everyday word)']},
    'sisar': {'noun': ['sister (the formal, written word)']},
    # A2: "both" twice; kumpikin takes a singular verb, molemmat a plural one
    'kumpikin': {'pron': ['each of the two, both (with a singular verb)']},
    'molemmat': {'pron': ['both (with a plural verb)']},
    # Wiktionary's sense reads "Expresses or emphasizes an extent, a bound or a limit."
    # its first sense is a grammar note ("(with adjectives or participles); or (with verbs) ...")
    'kuulostaa': {'verb': ['to sound (like), to seem (from what one hears)']},
    'saakka': {'postp': ['until, up to, as far as (with the illative or the elative)']},
    # its senses are headings ("Senses related to turning ...", "... circular movement")
    'kiertää': {'verb': ['to go round, to circle', 'to turn, to twist, to wind', 'to avoid, to get round']},
    # Wiktionary has only "verbal noun of ääntää"
    'ääntäminen': {'noun': ['pronunciation']},
    # B2: three pairs with one English side; each says which is asked for
    'pieleen': {'adv': ['wrong, awry (going wrong: mennä pieleen)']},
    'pielessä': {'adv': ['wrong, awry (being wrong: olla pielessä)']},
    'materiaali': {'noun': ['material (stuff, matter)']},
    'aineisto': {'noun': ['material, data (collected for a study or a case)']},
    'henkilöllisyys': {'noun': ['identity (who a person is, as on an identity card)']},
    'identiteetti': {'noun': ['identity (a sense of self or of belonging)']},
    'saastuminen': {'noun': ['pollution, contamination']},    # only "verbal noun of saastua"
    'asti': {'postp': ['until, up to, as far as (with the illative or the elative)']},
}
POS_LABEL = {}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'syy': 'cause, reason',    # Wiktionary's first sense is "fibre"
    'lounas': 'lunch',         # "southwest" first
    'sade': 'rain',            # "precipitation" first
    'lista': 'list',           # "thin, narrow strip of material" first
    'lasku': 'bill',           # "descent" first, "bill, invoice" fifth
    'korko': 'interest',       # "heel (of a shoe)" first
    'kierrättää': 'recycle',   # "to take (someone) all over" first; the B1 inventory's sense
}

# A PART OF SPEECH NOT SHOWN for one word: a block that is noise beside the word a
# beginner meets.
DROP_POS = {('minä', 'noun'), ('ja', 'noun'), ('tai', 'noun'), ('mutta', 'noun'),
            ('itse', 'noun'), ('ei', 'noun')}

NOT_A_MEANING = re.compile(
    r'^\*?\s*[Ss]ee:|^See |^Used in expressions|^Used other than figuratively|^[Uu]sage notes|'
    r'senses\.?$|^[Ss]ynonym of |^(?:first|second|third)-person .* of \S+$|'
    r'^(?:comparative|superlative) degree of |^verbal noun of \S+$|'
    r'^(?:nominative|genitive|partitive|plural|singular)[^;]* of \S+(?: \([^)]*\))?$')


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
        # the inventory named a part of speech: its etymology leads
        first = [next((e['etym'] for e in ents if e['pos'] == row['pos']), groups[0])]
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
        label = POS_LABEL.get((word, e['pos'])) or POS_NAME.get(e['pos'], e['pos'])
        tv = {t for gl in e['glosses'] for t in gl['tags']}
        if e['pos'] == 'verb':
            if 'transitive' in tv and 'intransitive' not in tv:
                label += ', transitive'
            elif 'intransitive' in tv and 'transitive' not in tv:
                label += ', intransitive'
        strong = any(not x['weak'] for x in e['glosses'])
        gl, seen = [], set()
        for x in e['glosses']:
            if x['weak'] and strong:
                continue
            t = gloss_text(x['g'])
            if NOT_A_MEANING.search(t):
                continue
            if t and t not in seen:
                seen.add(t)
                gl.append(t)
        if e['pos'] in GLOSS.get(word, {}):
            gl = list(GLOSS[word][e['pos']])
        lead = LEAD.get(word)
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


# ---- forms -----------------------------------------------------------------------------
def cells(table, *need, skip=(), most=2):
    """Every listed form of one declension cell, at most two, joined."""
    got = []
    for t in table:
        tags = set(t['t'])
        if all(n in tags for n in need) and not tags & set(skip) and t['f'] not in got:
            got.append(t['f'])
    return ' / '.join(got[:most]) if got else ''


def vc(cell, most=2):
    return ' / '.join(cell[:most]) if cell else ''


def fi(label, form):
    if not form:
        return ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(form)}</span>'


def pron_table(e, word):
    """A personal pronoun's table holds BOTH numbers of its person (sinä beside te, hän beside
    he): the column whose nominative is the word is the word's own, relabelled singular."""
    tb = e['table']
    if e['pos'] != 'pron' or not tb:
        return tb
    num = 'plural' if any(fold(r['f']) == fold(word) and 'nominative' in r['t'] and 'plural' in r['t']
                          for r in tb) else 'singular'
    if num == 'singular':
        return tb
    return [dict(r, t=[t if t != 'plural' else 'singular' for t in r['t'] if t != 'singular'])
            for r in tb if 'plural' in r['t']]


def forms_line(e, word):
    bits = []
    tb = pron_table(e, word)
    if e['pos'] in ('noun', 'pron', 'num') and tb:
        pl = cells(tb, 'nominative', 'plural', skip=('accusative',))
        if e['pos'] == 'noun' and pl and fold(pl) != fold(word):
            bits.append(fi('plural', pl))
        bits.append(fi('genitive', cells(tb, 'genitive', 'singular', skip=('accusative',))))
        bits.append(fi('partitive', cells(tb, 'partitive', 'singular')))
        if e['pos'] == 'noun':
            bits.append(fi('plural partitive', cells(tb, 'partitive', 'plural')))
    elif e['pos'] == 'adj':
        bits.append(fi('comparative', e['head'].get('comparative', '')))
        if tb:
            bits.append(fi('genitive', cells(tb, 'genitive', 'singular', skip=('accusative',))))
            bits.append(fi('partitive', cells(tb, 'partitive', 'singular')))
    elif e['pos'] == 'verb':
        v = e.get('verb') or {}
        if v.get('pres'):
            bits.append(fi('I', vc(v['pres'][0])))
            bits.append(fi('he/she', vc(v['pres'][2])))
        if v.get('past'):
            bits.append(fi('past', vc(v['past'][2])))
        if v.get('perf') and v['perf'][2]:
            bits.append(fi('perfect', v['perf'][2][0]))
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


PERSONS = ['minä', 'sinä', 'hän', 'me', 'te', 'he']
CASES = [('nominative', 'nominative'), ('genitive (of)', 'genitive'),
         ('partitive (some, part of)', 'partitive'), ('in', 'inessive'), ('out of', 'elative'),
         ('into', 'illative'), ('on, at', 'adessive'), ('off, from', 'ablative'),
         ('onto, to', 'allative'), ('as', 'essive'), ('becoming', 'translative'),
         ('without', 'abessive'), ('by means of', 'instructive'), ('with', 'comitative')]


def table_html(e, word):
    tb = pron_table(e, word)
    if e['pos'] == 'verb':
        v = e.get('verb') or {}

        def persons(k, most=2):
            return [row(p, vc(c, most)) for p, c in zip(PERSONS, v.get(k) or [])]
        blocks = [
            block('present', persons('pres')),
            block('negative', persons('neg')),
            block('past', persons('past')),
            block('perfect', persons('perf')),
            block('conditional (would …)', persons('cond')),
            block('imperative', persons('imp')),
            block('passive (one, people)', [row('present', (v.get('pass') or ['', ''])[0]),
                                            row('past', (v.get('pass') or ['', ''])[1])]),
        ]
    elif e['pos'] in ('noun', 'adj', 'pron', 'num') and tb:
        cases = CASES if e['pos'] != 'pron' else CASES[:1] + [('accusative', 'accusative')] + CASES[1:]
        blocks = []
        for num in ('singular', 'plural'):
            rs = []
            if e['pos'] == 'pron' and num == 'plural':
                continue            # a pronoun shows its own number only (`pron_table`)
            for l, c in cases:
                if c == 'accusative':
                    # a personal pronoun's own accusative (minut), not the nominative's or the
                    # genitive's double that every noun's table also tags accusative
                    got = cells(tb, 'accusative', num, skip=('nominative', 'genitive'))
                else:
                    got = cells(tb, c, num, skip=('accusative',))
                rs.append(row(l, got))
            blocks.append(block('cases' if e['pos'] == 'pron' else num, rs))
    else:
        return ''
    blocks = [b for b in blocks if b]
    if not blocks:
        return ''
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>'


# ---- examples --------------------------------------------------------------------------
SPLIT = re.compile(r"([a-zA-ZåäöÅÄÖšžŠŽéÉüÜ]+)")


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
    for fi_, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(fi_)}"></span>{mark(fi_, hits)}</div>'
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
            'Finnish': E(word),
            'Word': word,
            'Say': word,
            'English': english(ents, word),
            # a word spelt as Wiktionary's alternative of another headword has that
            # headword's forms, not its own: none are shown
            'Forms': '' if r.get('via') else forms_line(main, word),
            'Table': '' if r.get('via') else table_html(main, word),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex), 'sub': r.get('sub', ''), 'count': r.get('count', 0)})
    return cards, entries


FOR = {'a1': 'for a beginner', 'a2': 'for an elementary learner', 'b1': 'for an intermediate learner',
       'b2': 'for an upper-intermediate learner', 'c1': 'for an advanced learner'}


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
        "Both study directions in one deck: Finnish → English (see the Finnish, recall the "
        "meaning) and English → Finnish (see an English meaning, recall the Finnish). Each "
        "direction is a card of its own with its own schedule, so recognising a word and producing "
        f"it are learnt separately. {n} words of Finnish {FOR[LEVEL]}, aligned to "
        f"{LEVEL.upper()} of the Common European Framework of Reference, whose global descriptor "
        f"begins '{SC['quote']}' — a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: Finnish has an examination graded to these "
        "levels (the National Certificates of Language Proficiency, YKI), but no graded word list "
        "for it was found published, so this deck is not an examination's vocabulary and does not "
        f"claim to be. It is assembled from two things that can be stated. {from_inv} of the {n} "
        f"come from a vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words of everyday Finnish, taken from a "
        "frequency list built from film and television subtitles and counted by the WHOLE word, "
        "every case of a noun and every form of a verb added together. The cards are dealt by that "
        "frequency, so the words you meet most often come first. Verbs are given as Finnish "
        "dictionaries give them, in the first infinitive (syödä \"to eat\", puhua \"to speak\"). "
        f"The {nouns} nouns show their plural, their genitive, their partitive and their plural "
        "partitive, the forms consonant gradation and stem changes make hard to guess (käsi, "
        "kädet, käden, kättä, käsiä), and behind the All forms fold every case in both numbers; "
        f"the {verbs} verbs show their \"I\" and \"he, she\" forms, their past and their perfect "
        "(syödä: syön, syö, söi, on syönyt), and behind the fold the present, the negative, the "
        "past, the perfect, the conditional and the imperative by person, and the passive. The "
        "Finnish Alphabet deck, the first in this collection, teaches the letters and their sounds. "
        + EX_NOTE + ", with the word picked out in colour and a speaker beside the sentence and the "
        "headword. Sources. Level: the Common European Framework of Reference (Council of Europe), "
        "global scale. Meanings and forms: English Wiktionary, via the kaikki.org extraction "
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
    tags = ['finnish', 'vocabulary', LEVEL, NAMES[LEVEL].lower()]
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': subtitle,
        'desc': description, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': tags,
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Finnish vocabulary', 'speechLang': 'fi-FI',
            'fields': FIELDS,
            'cards': [
                {'name': 'Finnish → English', 'front': FRONT_HU, 'back': BACK_HU},
                {'name': 'English → Finnish', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Finnish')
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
