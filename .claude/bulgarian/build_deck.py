#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Ukrainian shape.  The word is
a single record and the two directions are card TEMPLATES, so a corrected gloss
is corrected both ways at once and each direction keeps its own schedule.
Card 1 is BULGARIAN -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in Cyrillic WITH ITS STRESS MARKED (`кни́га`), as the Russian
    and Ukrainian decks print it -- Bulgarian stress is free and moves
    (`град`, `градове́`), and a learner has no other way to know it; no
    transliteration (the Bulgarian Alphabet deck comes first in the collection);
  · the meanings, grouped by part of speech, a noun's GENDER and a verb's
    ASPECT in the label;
  · one line of key forms: a noun's DEFINITE form (Bulgarian puts "the" on the
    end of the word: `кни́гата`), its plural and, for a masculine noun, the
    COUNT FORM used after a number (`два гра́да`); an adjective's feminine,
    neuter and plural; a verb's ти form (which shows its conjugation) and its
    past (the aorist, `че́тох`); and for a verb its ASPECT PARTNER (`чета́` ->
    perfective `прочета́`), which Bulgarian, like Russian, learns in pairs;
  · the forms tables behind a fold (a noun's definite, plural, count and
    vocative forms; an adjective's by gender; a verb's present, aorist and
    imperfect by person, its imperative and the past participle that builds
    its perfect; the personal pronouns' full and short forms);
  · up to three Tatoeba sentences, the word picked out, with a speaker.

A VERB'S HEADWORD IS ITS FIRST PERSON SINGULAR PRESENT, the Bulgarian
dictionary form (there is no infinitive), and the gloss says "to read" as
every Bulgarian-English dictionary does.

The speaker reads the `Word` field: the headword without its stress mark.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bg import fold, nfc, show, speak, PRONOUN_CASES, CASE_NAMES, tokens
from bulgarian_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-16T00:00:00.000Z'
TYPE_ID = 'bulgarian'
COLOR = '#813F8D'
FIELDS = ['Bulgarian', 'Word', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'prep': 'preposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep_phrase': 'phrase', 'proverb': 'proverb'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = '<div class="uc-word">{{Bulgarian}}' + SAY + '</div>'
ASK = '<div class="uc-ask">Say it in Bulgarian</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_BG = WORD
BACK_BG = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape

# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here, with the
# reason.  Bulgarian homographs from unrelated sources would otherwise put "to edify"
# on the card for "to drive".
ETYMS = {
    'да': ['1', '2'],         # "yes" AND the particle of every subordinate verb, both A1
    'карам': ['2'],           # "to drive; to make (someone do)"; etymology 1 is a rare "to rebuke"
    'о': ['3', '2'],          # the interjection "oh" before the preposition "against"
    'съд': ['2', '1'],        # "court" before "vessel": the subtitles' word is the court
    'чест': ['2', '1'],       # the noun "honour" before the rarer adjective "frequent"
    'клас': ['2'],
    'накажа': ['2'],          # "to punish"; etymology 1 is a rare "to say a lot of things"
    'нападам': ['2'],
    'целя': ['2'],            # "to aim"; etymology 1 is "to cure"
    'мит': ['3'],             # "myth"; etymology 1 is the adjective "slant"
    'повод': ['2'],           # "occasion, reason"; etymology 1 is "leash"
    'лига': ['2'],            # "league"; etymology 1 is "spittle"         # "to attack"; etymology 1 is "to fall a lot"
    'ранен': ['2', '1'],      # "wounded" before "early": the subtitles' word            # "class (at school)"; etymology 1 is "ear of corn"
}

# A PART OF SPEECH TO LEAD WITH, where Wiktionary's first is not the everyday word.
POS_FIRST = {'о': 'intj', 'чест': 'noun'}
# A PART OF SPEECH LEFT OFF, where it is a different, rarer word spelt the same.
DROP_POS = {'малко': {'noun'},                     # "little one" beside the adverb "a little"
            'шест': {'adv'}}                           # school slang "top marks" beside "six"
# ONE ENTRY BY ITS GLOSS, where two etymologies share Wiktionary's blank etymology number.
ENTRY_WITH = {}
# Wiktionary tags every sense rare or archaic, though it is the everyday word.
NOT_WEAK = set()
# Wiktionary files these impersonal predicatives as adjectives; the card says what they are.
PREDICATIVE = {'може'}

# GLOSSES TO LEAD WITH, in this order, where Wiktionary's first is not the everyday one.
LEAD = {
    'изглеждам': ['to seem, to appear, to look'],     # not "to watch (a film)"
    'прав': ['right, correct'],                        # прав си "you are right"
    'дори': ['even, actually'],                        # not "eventually"
    'търся': ['to look for'],                          # not a rare "to ransack"
    'струвам': ['to cost'],
    'път': ['path, road', 'time (an instance'],        # пътя "the road" and един път "once"
    'връзка': ['connection', 'relationship'],          # not "lace (for footwear)"
    'изобщо': ['at all', 'generally'],
    'прекарам': ['to pass, to spend (time)'],
    'ред': ['turn (opportunity)', 'row, rank', 'line, queue'],
    'утро': ['morning'],
    'смятам': ['to consider', 'to intend'],
    'новина': ['piece of news'],
    'пич': ['dude'],                                   # not "bastard"
    'право': ['right', 'law (as a specialty)'],
    'продължавам': ['to last, to continue'], 'продължа': ['to last, to continue'],
    'занимавам': ['to serve a certain duty; to keep oneself busy'],
    'кача': ['to go up', 'to take up'],
    'зарежа': ['to abandon'],
    'развивам': ['to develop'], 'партия': ['party (a political'], 'образование': ['education'],
    'свобода': ['freedom'],
    'шах': ['chess', 'check'], 'отмяна': ['abolition'], 'ненавиждам': ['to hate'],
    'капсула': ['capsule (soluble'], 'изследвам': ['to explore, to investigate', 'to test'],
    'тръба': ['pipe, tube'], 'представление': ['performance, show'], 'заключение': ['conclusion'],
    'стигам': ['to reach', 'to arrive'], 'пряк': ['direct, straight'],
    'настоящ': ['actual, present'], 'волан': ['steering wheel'], 'слушалка': ['receiver (phone)'],                          # not "to prune vines"
}
# A GLOSS LEFT OFF.
GLOSS_DROP = {}
# AN ASPECT PARTNER WRITTEN HERE, replacing Wiktionary's.
PARTNER = {'направя': ['пра́вя'], 'правя': ['напра́вя'],   # Wiktionary pairs напра́вя with a rare напра́вям
           'изглеждам': []}                                # "to seem" has no perfective; изгле́дам is "to watch"

# A HEADWORD'S STRESS WRITTEN HERE, where Wiktionary's head line carries none.
STRESS = {'наздраве': 'наздра́ве', 'армия': 'а́рмия',
          'засега': 'засега́', 'отбия': 'отби́я', 'чийто': 'чи́йто', 'предаване': 'предава́не',
          # B2: Wiktionary's head line and table carry no stress for these
          'терапия': 'терапи́я', 'годишно': 'годи́шно', 'трагедия': 'траге́дия', 'хумор': 'ху́мор',
          'скандал': 'сканда́л', 'персонал': 'персона́л', 'впрочем': 'впро́чем', 'терапевт': 'терапе́вт',
          'конкуренция': 'конкуре́нция', 'заседание': 'заседа́ние', 'терор': 'теро́р', 'хипотеза': 'хипоте́за',
          'конкурент': 'конкуре́нт', 'пенсионер': 'пенсионе́р', 'дефицит': 'дефици́т', 'обвинител': 'обвини́тел'}


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


def label_of(e, word=''):
    label = POS_NAME.get(e['pos'], e['pos'])
    if e['pos'] == 'adj' and word in PREDICATIVE:
        label = 'predicative'
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
        # a weak sense (rare, dialectal ...) never leads: `тъ́рся` opened on a rare "to ransack"
        for g in sorted(e['glosses'], key=lambda g: g['weak']):
            if g['weak'] and gl:
                continue
            t = TRAIL.sub('', g['g'])
            if t in GLOSS_DROP.get(word, ()):
                continue
            # "Used other than figuratively or idiomatically: see під" (the phrases deck) names
            # the literal reading's words rather than giving a meaning
            if t.startswith('Used other than figuratively or idiomatically'):
                continue
            # a cross-reference filed as a sense ("only used in по́-по́сле", "see съ́рдя се"): it
            # names another headword rather than giving a meaning
            if re.match(r'(only used in|see) ', t):
                continue
            # a usage example filed as a sense (`у́мствен бага́ж ― úmstven bagáž ― intellect`)
            if ' ― ' in t:
                continue
            # "grandfather (diminutive)" and "grandfather (affectionate)": one line
            base = re.sub(r' \((diminutive|affectionate|augmentative)\)$', '', t)
            if base != t and any(x.startswith(base + ' (') for x in gl):
                continue
            if t and t not in seen:
                seen.add(t)
                gl.append(t)
        lead = LEAD.get(word)
        if lead:
            gl.sort(key=lambda x: next((i for i, l in enumerate(lead) if l in x), len(lead)))
        gl = gl[:3]
        if not gl or all(x in shown for x in gl):
            continue
        shown.update(gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label_of(e, word))}</div>{body}</div>')
    return ''.join(parts)


# ---- forms -----------------------------------------------------------------------------
def cells(table, *need, skip=()):
    """Every form whose tags hold all of `need` and none of `skip`, as printed, once each.
    An analytic comparative (`по́-но́в`, `на́й-но́в`) is never a cell of the plain table."""
    out = []
    for t in table:
        tags = set(t['t'])
        f = fold(t['f'])
        if f.startswith('по-') or f.startswith('най-'):
            continue
        if all(n in tags for n in need) and not (tags & set(skip)) and ' ' not in t['f']:
            s = show(t['f'])
            if s not in out:
                out.append(s)
    return ', '.join(out)


def first(s):
    return s.split(', ')[0]


def fi(label, s):
    s = first(s)
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(s)}</span>' if s else ''


def is_pf(e):
    return e['aspect'] == 'perfective'


def partners(e, lex):
    """A verb's aspect partner, kept only where the partner's own entry names this verb
    back, so a prefixed verb of another meaning is never offered as the other aspect."""
    me = fold(e['head'])
    if me in PARTNER:
        return PARTNER[me]
    out = []
    for p in e['partner']:
        L = lex.get(fold(p), {})
        if any(me in {fold(q) for q in pe.get('partner', [])}
               for pe in L.get('entries', []) if pe['pos'] == 'verb'):
            out.append(p)
    return out


# A verb's finite forms: never a participle's, nor a mood built on one.
VSKIP = ('participle', 'renarrative', 'dubitative', 'conditional', 'conclusive', 'adverbial')


def definite(tb, *need):
    """The definite form, and for a masculine word both articles: the full `-ът` / `-ят`
    of a subject and the short `-а` / `-я` of everything else."""
    full = cells(tb, 'definite', *need, 'subjective')
    if full:
        short = cells(tb, 'definite', *need, 'objective')
        return full, short
    return cells(tb, 'definite', *need, skip=('objective', 'participle')), ''


def forms_line(e, word, lex):
    tb = e['table']
    bits = []
    if tb and e['pos'] == 'noun':
        d, _ = definite(tb, 'singular')
        if not d:
            d, _ = definite(tb, 'plural')
        bits.append(fi('the', d))
        pl = cells(tb, 'indefinite', 'plural', skip=('rare',))
        if pl and fold(pl) != fold(word):
            bits.append(fi('plural', pl))
        cf = cells(tb, 'count-form', 'plural')
        if cf and fold(first(cf)) != fold(first(pl)):
            bits.append(fi('after a number', cf))
    elif tb and e['pos'] == 'adj':
        bits.append(fi('feminine', cells(tb, 'feminine', 'indefinite', 'singular', skip=VSKIP)))
        bits.append(fi('neuter', cells(tb, 'neuter', 'indefinite', 'singular', skip=VSKIP)))
        bits.append(fi('plural', cells(tb, 'indefinite', 'plural', skip=VSKIP)))
    elif tb and e['pos'] == 'verb':
        bits.append(fi('ти', cells(tb, 'present', 'second-person', 'singular', skip=VSKIP)))
        bits.append(fi('past', cells(tb, 'aorist', 'first-person', 'singular', skip=VSKIP)))
    bits = [b for b in bits if b]
    out = f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''
    pp = partners(e, lex) if e['pos'] == 'verb' else []
    if pp:
        other = {'imperfective': 'perfective', 'perfective': 'imperfective'}.get(e['aspect'], 'pair')
        out += (f'<div class="uc-asp"><span class="uc-fl">{E(other)}</span>'
                f'{E(", ".join(show(p) for p in pp[:2]))}</div>')
    return out


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


GENDERS = ['masculine', 'feminine', 'neuter']
PERSONS = [('аз', ('first-person', 'singular')), ('ти', ('second-person', 'singular')),
           ('той, тя', ('third-person', 'singular')), ('ние', ('first-person', 'plural')),
           ('вие', ('second-person', 'plural')), ('те', ('third-person', 'plural'))]


def def_rows(tb, *need):
    full, short = definite(tb, *need)
    if short and short != full:
        return [row('definite, subject', full), row('definite, object', short)]
    return [row('definite', full)]


def table_html(e, word):
    tb = e['table']
    pc = PRONOUN_CASES.get(fold(word)) if e['pos'] == 'pron' else None
    if pc:
        blocks = [block('forms', [row(c, show(x)) for c, x in zip(CASE_NAMES, pc)])]
    elif not tb:
        return ''
    elif e['pos'] == 'verb':
        blocks = [
            block('present', [row(p, cells(tb, 'present', *need, skip=VSKIP)) for p, need in PERSONS]),
            block('past (aorist)', [row(p, cells(tb, 'aorist', *need, skip=VSKIP)) for p, need in PERSONS]),
            block('past (imperfect)', [row(p, cells(tb, 'imperfect', *need, skip=VSKIP))
                                       for p, need in PERSONS]),
            block('imperative', [row('ти', cells(tb, 'imperative', 'second-person', 'singular')),
                                 row('вие', cells(tb, 'imperative', 'second-person', 'plural'))]),
            block('past participle (for the perfect)', [
                row('masculine', cells(tb, 'participle', 'aorist', 'indefinite', 'masculine')),
                row('feminine', cells(tb, 'participle', 'aorist', 'indefinite', 'feminine')),
                row('neuter', cells(tb, 'participle', 'aorist', 'indefinite', 'neuter')),
                row('plural', cells(tb, 'participle', 'aorist', 'indefinite', 'plural'))]),
        ]
    elif e['pos'] == 'noun':
        blocks = [
            block('singular', [row('indefinite', cells(tb, 'indefinite', 'singular'))] +
                  def_rows(tb, 'singular') + [row('vocative', cells(tb, 'vocative', 'singular'))]),
            block('plural', [row('indefinite', cells(tb, 'indefinite', 'plural', skip=('rare',)))] +
                  def_rows(tb, 'plural') +
                  [row('after a number', cells(tb, 'count-form', 'plural')),
                   row('vocative', cells(tb, 'vocative', 'plural', skip=('rare',)))]),
        ]
    elif any(set(t['t']) & set(GENDERS) for t in tb):
        # an adjective, or a pronoun, determiner or number that agrees like one (`мой`, `един`)
        def gblock(g):
            need = (g, 'singular') if g != 'plural' else ('plural',)
            return block(g, [row('indefinite', cells(tb, 'indefinite', *need, skip=VSKIP))] +
                         def_rows(tb, *need))
        blocks = [gblock(g) for g in GENDERS + ['plural']]
    else:
        return ''
    blocks = [b for b in blocks if b]
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>' if blocks else ''


# ---- examples --------------------------------------------------------------------------
from bg import WORD_RX


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
    for uk, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(uk)}"></span>{mark(uk, hits)}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>')
    return ''.join(out)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        main = ents[0]
        head = lex[r['key']].get('head') if r.get('via') else main['head']
        head = show(STRESS.get(fold(r['word'])) or head or r['word'])
        ex = exs.get(r['key'], [])
        cards.append({'sub': r.get('sub', ''), 'fields': {
            'Bulgarian': E(head),
            'Word': E(speak(head)),
            'English': english(ents, r['word']),
            'Forms': forms_line(main, r['word'], lex),
            'Table': table_html(main, r['word']),
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
        "Both study directions in one deck: Bulgarian → English (see the Bulgarian, recall the "
        "meaning) and English → Bulgarian (see an English meaning, recall the Bulgarian). Each "
        "direction is a card of its own with its own schedule, so recognising a word and producing "
        f"it are learnt separately. {n} words for {LEARNER[LEVEL]}, aligned to {LEVEL.upper()} of the "
        f"Common European Framework of Reference, whose global descriptor begins '{SC['quote']}' — "
        f"a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no graded Bulgarian word list is published "
        "that a deck could take whole, so this deck is not any examination's vocabulary and does not "
        "claim to be. It is assembled from two things that can be stated. "
        f"{from_inv} of the {n} come from a vocabulary written for the level's scope — "
        f"{SC['topics']} — and the other {n - from_inv} are the commonest remaining words of "
        "everyday Bulgarian, taken from a frequency list built from film and television subtitles "
        "and counted by the WHOLE word, every form of a noun or a verb added together. The cards "
        "are dealt by that frequency, so the words you meet most often come first. "
        "Every headword is printed in Cyrillic with its stress marked (кни́га, чета́), because "
        "Bulgarian stress can fall on any syllable and move as the word changes (град, градове́), "
        "and nothing else shows it; there is no transliteration, and the Bulgarian Alphabet deck, "
        "the first in this collection, teaches the letters. A verb is given in its first person "
        "singular present, the form a Bulgarian dictionary lists (чета́ 'I read', glossed 'to "
        f"read'), since Bulgarian has no infinitive. The {nouns} nouns show their gender, their "
        "definite form (Bulgarian puts 'the' on the end of the word: кни́гата), their plural and, "
        f"where it differs, the form used after a number; the {verbs} verbs show their aspect, "
        "imperfective or perfective, with the other verb of the pair beside them, their ти form "
        "and their past; and behind the All forms fold every noun's forms and every verb's present, "
        "past tenses and imperative by person, with the personal pronouns' full and short forms. "
        + EX_NOTE + ", with the word picked out in colour and a speaker beside the sentence and the "
        "headword. Sources. Level: the Common European Framework of Reference (Council of Europe), "
        "global scale. Meanings, gender, aspect, stress and forms: English Wiktionary, via the "
        "kaikki.org extraction (CC BY-SA 4.0). Frequency: a word list built from OpenSubtitles "
        "(hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), "
        "CC BY 2.0 FR."
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
    tags = ['bulgarian', 'vocabulary', LEVEL, NAMES[LEVEL].lower()]
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': subtitle,
        'desc': description, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': tags,
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Bulgarian vocabulary', 'speechLang': 'bg-BG',
            'fields': FIELDS,
            'cards': [
                {'name': 'Bulgarian → English', 'front': FRONT_BG, 'back': BACK_BG},
                {'name': 'English → Bulgarian', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Bulgarian')
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
