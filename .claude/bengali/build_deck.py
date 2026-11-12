#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Hindi shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss
is corrected both ways at once and each direction keeps its own schedule.
Card 1 is BENGALI -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in the Bengali script, with Wiktionary's ROMANISATION beneath
    it (kôra, ami), so a learner still reading slowly is never stuck on the
    script -- the Hindi set's rule, kept for its sister;
  · the meanings, grouped by part of speech.  Bengali has NO grammatical
    gender, so a noun's label is bare;
  · one line of key forms: a noun's definite form ("the ...", -টা), its plural
    (-গুলো, or -রা for people) and its genitive ("of ...", -র / -এর); a verb's
    present and past (third person) and its "having ...-ed" participle, which
    is where the stem vowel changes (করা: করে, করল; খাওয়া: খায়, খেল, খেয়ে)
    and where the irregular verbs show (যাওয়া: গেল, গিয়ে); a pronoun's
    objective and possessive;
  · the forms tables behind a fold: a verb's present, continuous, perfect,
    past, habitual past and future by person, at the three levels of address
    (তুই intimate, তুমি familiar, আপনি polite); a noun's four cases, bare,
    definite and plural;
  · up to three Tatoeba sentences, the word picked out, with a speaker.

The speaker reads the `Word` field, the bare Bengali.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bn import fold, nfc
from bengali_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'bengali'
COLOR = '#574518'
FIELDS = ['Bengali', 'Roman', 'Word', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'postp': 'postposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep': 'preposition',
            'prep_phrase': 'phrase', 'proverb': 'proverb', 'name': 'proper noun'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = ('<div class="uc-word">{{Bengali}}' + SAY + '</div>'
        '{{#Roman}}<div class="uc-rom">{{Roman}}</div>{{/Roman}}')
ASK = '<div class="uc-ask">Say it in Bengali</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_BN = WORD
BACK_BN = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape


# ---- glosses ---------------------------------------------------------------------------
TRAIL = re.compile(r'\s*[:;,]\s*$')


# A PRONOUN'S GLOSS carries its grammar after the meaning ("I; 1st person nominative
# singular pronoun", "he, she, it; 3rd person ... ordinary pronoun; near reference"):
# the card's label already says pronoun, and its forms line the cases.
# A POINTER left inside a gloss ("dang it, fie; alternative form of ধুর") goes the same way.
GRAMMAR = re.compile(r'^\s*(\d(st|nd|rd|th) person\b|near reference$|far reference$|'
                     r'alternative (form|spelling) of\b)')


# A POINTER THAT QUOTES ITS MEANING ("umlauted form of ভিজা (bhija, “wet”)") is cut to
# the meaning it quotes: the colloquial spelling is the one a learner meets.
QUOTED = re.compile(r'^\s*(?:umlauted|alternative) form of \S+ \([^,()]+, “([^”]+)”\)\s*$', re.I)


def gloss_text(g):
    m = QUOTED.match(g)
    if m:
        g = m.group(1)
    parts = [p for p in g.split(';')]
    kept = [p for p in parts if not GRAMMAR.match(p)]
    if kept and len(kept) < len(parts):
        g = ';'.join(kept)
    g = TRAIL.sub('', g)
    if g.endswith('.') and not g.endswith('etc.') and g.count('.') == 1:
        g = g[:-1]
    return g


# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here -- the Hindi
# rule.  Bengali has homographs from unrelated sources too (`বাস` "residence",
# "smell" and "bus"; `কলা` "banana" and "art"; `তো` the particle and the oblique
# base of তুই), and a beginner's card that offers all of them teaches the noise.
# Where the first etymology is NOT the everyday word, or two are, the card names which:
ETYMS = {
    'তো': ['2'],              # the particle "so, then, after all"; 1 is "oblique base of তুই"
    'বাস': ['4'],             # "bus"; 1 and 2 are "residence" and "smell"
    'কলা': ['1'],             # "banana"; 2 is "art"
    'আম': ['1'],              # "mango"; 2 is "common"
    'বাড়ি': ['1'],            # "house; home"; 2 is "a blow"
    'নয়': ['1', '3'],         # "nine" (the inventory's number) AND "or, otherwise"
    'কি': ['1', ''],          # "what" AND the yes-no particle; 2 is a keyboard's "key"
    'পা': ['1'],              # "leg, foot"
    'বাছা': ['1'],            # "to choose"; 2 is "child" (a term of endearment)
    'বস': ['2'],              # "boss"
    'মত': ['2'],              # "like" (the inventory's মতো points here); 1 is "opinion"
    'ডাল': ['2'],             # "lentils, dal"; 1 is "branch"
}

# A PART OF SPEECH TO LEAD WITH, where the entries carry no etymology numbers and
# Wiktionary lists a rarer reading first.
POS_LEAD = {
    'খুন': 'noun',            # "murder"; the adjective "worried to death" is listed first
    'মজা': 'noun',            # "fun, joy"; the adjective "tasty" is listed first
    'বাংলা': 'name',          # the language, before the adjective
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech.  Each is the
# word's grammar stated plainly where Wiktionary's sense is only a pointer
# ("objective of আমরা") -- never a meaning Wiktionary does not give.
GLOSS = {
    'বাংলা': {'name': ['Bengali, Bangla (the language)', 'Bengal (the region)']},
    'তুমি': {'pron': ['you (familiar: to a friend, a younger relative)']},
    'আপনি': {'pron': ['you (polite: to an elder, a stranger)']},
    'তুই': {'pron': ['you (intimate: to a close friend, a child)']},
    'তোমরা': {'pron': ['you (plural, familiar)']},
    'আপনারা': {'pron': ['you (plural, polite)']},
    'আব্বা': {'noun': ['father, dad (Wiktionary: a synonym of বাবা)', 'saint, holy man']},
    'তোমার': {'pron': ['your, yours (to someone you call তুমি)']},
    'আপনার': {'pron': ['your, yours (polite: to someone you call আপনি)']},
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'শেষ': 'end',             # first listed is "remainder, balance"
    'সাদা': 'white',          # listed fourth, after "simple; easy; plain"
}


def entries_for(row, lex):
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    ents = [e for e in L['entries'] if any(not g['weak'] and g['g'] for g in e['glosses'])] \
        or L['entries']
    groups = []
    for e in ents:
        if e.get('etym', '') not in groups:
            groups.append(e.get('etym', ''))
    keep = ETYMS.get(L['word'], groups[:1])
    if L['word'] in POS_LEAD:
        ents = sorted(ents, key=lambda e: e['pos'] != POS_LEAD[L['word']])
    ents = sorted([e for e in ents if e.get('etym', '') in keep],
                  key=lambda e: keep.index(e.get('etym', '')))
    if row['pos']:
        ents = sorted(ents, key=lambda e: e['pos'] != row['pos'])
    # one block per part of speech, in the order the entries come
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
        tv = {t for g in e['glosses'] for t in g['tags']}
        if e['pos'] == 'verb':
            if 'transitive' in tv and 'intransitive' not in tv:
                label += ', transitive'
            elif 'intransitive' in tv and 'transitive' not in tv:
                label += ', intransitive'
        gl, seen = [], set()
        for g in e['glosses']:
            if g['weak'] and gl:
                continue
            t = gloss_text(g['g'])
            if not t:
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
            continue          # a block saying only what one above it said (কাল: noun, then adverb)
        shown.update(gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label)}</div>{body}</div>')
    return ''.join(parts)


# ---- forms -----------------------------------------------------------------------------
# A NOUN CELL'S ROMANISATION.  kaikki's parse of Wiktionary's noun tables runs a
# slot's colloquial and formal variants together ("(boiṭa (colloquial), boiṭi
# (formal))"), so most noun cells arrive with no clean romanisation of their own
# (`extract.clean_roman`).  The endings are regular, and each has one spelling in
# the romanisation the headword uses, so a cell that IS the headword plus an
# ending is romanised as the headword's romanisation plus the ending's -- a
# concatenation, never a guess.  A cell that is not (a stem that changes) keeps
# Wiktionary's own romanisation, or none.
SUFFIX_ROMAN = {
    'টা': 'ṭa', 'টি': 'ṭi', 'টার': 'ṭar', 'টাকে': 'ṭake', 'টাতে': 'ṭate', 'টায়': 'ṭaẏ',
    'গুলো': 'gulo', 'গুলোর': 'gulor', 'গুলোকে': 'guloke', 'গুলোতে': 'gulote',
    'রা': 'ra', 'এরা': 'era', 'দের': 'der', 'দেরকে': 'derke',
    'কে': 'ke', 'র': 'r', 'এর': 'er', 'য়ের': 'ẏer', 'তে': 'te', 'এ': 'e', 'য়': 'ẏ',
}
SUFFIX_ROMAN = {nfc(k): v for k, v in SUFFIX_ROMAN.items()}


def cells(table, *need, skip=()):
    return [t for t in table if all(n in t['t'] for n in need) and not (set(t['t']) & set(skip))]


def cell(table, *need, skip=(), prefer=(), nth=0, word=''):
    """The cell carrying every tag in `need` and none in `skip`.  Where a slot holds
    variants (টা / টি, গুলো / গুলা / গুলি), the first whose spelling contains one
    of `prefer` -- the colloquial standard's -- else the `nth` in table order."""
    cs = cells(table, *need, skip=skip)
    for p in prefer:
        for t in cs:
            # the ENDING is matched, never the stem (টাকা holds টা)
            end = t['f'][len(word):] if word and t['f'].startswith(word) else t['f']
            if end.startswith(nfc(p)) if word else nfc(p) in end:
                return t
    return cs[nth] if len(cs) > nth else None


def roman_for(t, word, roman):
    if t.get('r'):
        return t['r']
    if roman and t['f'].startswith(word):
        sfx = t['f'][len(word):]
        if sfx in SUFFIX_ROMAN:
            return roman + SUFFIX_ROMAN[sfx]
    return ''


def fi(label, t, word='', roman=''):
    if not t or t['f'] == word:
        return ''
    r = roman_for(t, word, roman)
    return (f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(t["f"])}'
            + (f'<span class="uc-fr">{E(r)}</span>' if r else '') + '</span>')


DEF_SG = ('টা',)
PLURAL = ('গুলো', 'রা')
OBJ_PL = ('গুলো', 'দের')
GEN_PL = ('গুলোর', 'দের')
LOC_PL = ('গুলোতে',)


def noun_cell(tb, case, num, word=''):
    if num == 'bare':
        return cell(tb, 'indefinite', case, prefer=('কে',) if case == 'objective' else (), word=word)
    if num == 'sg':
        return cell(tb, 'definite', case, 'singular', prefer=('টা',), word=word)
    return cell(tb, 'definite', case, 'plural', word=word,
                prefer={'nominative': PLURAL, 'objective': OBJ_PL,
                        'genitive': GEN_PL, 'locative': LOC_PL}[case])


def person(tb, base, skip=()):
    """আমি, তুই, তুমি, সে, আপনি: the two familiar second persons share their tags,
    and Wiktionary's table gives the intimate (তুই) form first."""
    sk = ('participle',) + tuple(skip)
    return [('আমি', cell(tb, *base, 'first-person', skip=sk)),
            ('তুই', cell(tb, *base, 'familiar', 'second-person', skip=sk)),
            ('তুমি', cell(tb, *base, 'familiar', 'second-person', skip=sk, nth=1)),
            ('সে', cell(tb, *base, 'familiar', 'third-person', skip=sk)),
            ('আপনি', cell(tb, *base, 'polite', skip=sk))]


TENSES = [
    ('present', ('present',), ('continuative', 'perfect', 'past')),
    ('present continuous', ('continuative', 'present'), ('past',)),
    ('present perfect', ('perfect', 'present'), ('past',)),
    ('past', ('past',), ('continuative', 'perfect', 'habitual', 'conditional')),
    ('habitual past', ('habitual', 'past'), ()),
    ('future', ('future',), ()),
]


def forms_line(e, word, roman):
    tb = e['table']
    if not tb:
        return ''
    bits = []
    if e['pos'] == 'noun':
        bits.append(fi('the', noun_cell(tb, 'nominative', 'sg', word), word, roman))
        bits.append(fi('plural', noun_cell(tb, 'nominative', 'pl', word), word, roman))
        bits.append(fi('of', noun_cell(tb, 'genitive', 'bare', word), word, roman))
    elif e['pos'] == 'verb':
        sk = ('participle', 'continuative', 'perfect', 'habitual', 'conditional')
        bits.append(fi('present', cell(tb, 'present', 'familiar', 'third-person', skip=sk + ('past',))))
        bits.append(fi('past', cell(tb, 'past', 'familiar', 'third-person', skip=sk)))
        bits.append(fi('having done', cell(tb, 'participle', 'perfect', skip=('habitual',))))
    elif e['pos'] in ('pron', 'det'):
        bits.append(fi('objective', cell(tb, 'objective', skip=('definite',)), word))
        bits.append(fi('possessive', cell(tb, 'genitive', skip=('definite',)), word))
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


def row(label, t, word='', roman=''):
    if not t:
        return ''
    r = roman_for(t, word, roman)
    return (f'<div class="uc-cjr"><span class="uc-cj-p">{E(label)}</span>'
            f'<span class="uc-cj-f">{E(t["f"])}'
            + (f'<span class="uc-fr">{E(r)}</span>' if r else '') + '</span></div>')


def block(head, rows):
    rows = [r for r in rows if r]
    if not rows:
        return ''
    return f'<div class="uc-cj"><div class="uc-cjh">{E(head)}</div>{"".join(rows)}</div>'


def table_html(e, word, roman):
    tb = e['table']
    # A MULTI-WORD VERB (মনে করা, অনুভব করা) has no table: kaikki's is garbled to one
    # "habitual past" row (তুই করতি, তুই প্রমাণকরতিস), and the verb's whole table is on its
    # own card (করা, A1).  Found on reading B1; A2's ten such cards lost the same row.
    if not tb or ' ' in word:
        return ''
    if e['pos'] == 'verb':
        blocks = [block('key forms', [
            row('verbal noun', cell(tb, 'noun-from-verb')),
            row('infinitive', cell(tb, 'infinitive')),
            row('having done', cell(tb, 'participle', 'perfect', skip=('habitual',))),
            row('if (one) does', cell(tb, 'conditional', 'participle'))])]
        for name, need, skip in TENSES:
            blocks.append(block(name, [row(p, t) for p, t in person(tb, need, skip)]))
    elif e['pos'] in ('noun', 'pron', 'det') and any('nominative' in t['t'] for t in tb):
        CASES = [('subject', 'nominative'), ('object', 'objective'),
                 ('of', 'genitive'), ('in, at', 'locative')]
        blocks = [block(head, [row(l, noun_cell(tb, c, num, word), word, roman) for l, c in CASES])
                  for head, num in (('bare', 'bare'), ('the (one)', 'sg'), ('plural', 'pl'))]
    else:
        return ''
    blocks = [b for b in blocks if b]
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>' if blocks else ''


# ---- examples --------------------------------------------------------------------------
def mark(sentence, hits):
    hs = set(hits)
    out = []
    for piece in re.split(r'([\u0980-\u09e5\u09f0-\u09fe\u200c\u200d]+)', sentence):
        if piece and fold(piece) in hs:
            out.append(f'<b>{E(piece)}</b>')
        else:
            out.append(E(piece))
    return ''.join(out)


def examples_html(exs, multi):
    out = []
    for hi, en, hits in exs:
        if multi:
            hits = list(hits)
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(hi)}"></span>{mark(hi, hits)}</div>'
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
        roman = r.get('roman') or main['roman'] or next((e['roman'] for e in ents if e['roman']), '')
        ex = exs.get(r['key'], [])
        cards.append({'sub': r.get('sub', ''), 'fields': {
            'Bengali': f'<div class="uc-word">{E(word)}</div>',
            'Roman': E(roman),
            'Word': word,
            'English': english(ents, word),
            'Forms': forms_line(main, word, main['roman']),
            'Table': table_html(main, word, main['roman']),
            'Examples': examples_html(ex, ' ' in word),
        }})
        entries.append({'word': word, 'pos': main['pos'], 'source': r['source'], 'sub': r.get('sub', ''),
                        'examples': len(ex), 'roman': bool(roman)})
    return cards, entries


WHO = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner',
       'b2': 'an upper-intermediate learner', 'c1': 'an advanced learner'}


def desc(entries, n):
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    ex3 = sum(1 for e in entries if e['examples'] == 3)
    ex0 = sum(1 for e in entries if e['examples'] == 0)
    nouns = sum(1 for e in entries if e['pos'] == 'noun')
    verbs = sum(1 for e in entries if e['pos'] == 'verb')
    SC = SCOPE[LEVEL]
    EX_NOTE = ('Every word carries three real example sentences' if ex3 == n else
               f'Real example sentences come with {n - ex0:,} of the {n:,} words, three apiece for '
               f'{ex3} of them')
    return (
        "Both study directions in one deck: Bengali → English (see the Bengali, recall the meaning) "
        "and English → Bengali (see an English meaning, recall the Bengali). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n:,} words for {WHO[LEVEL]}, aligned to {LEVEL.upper()} of the Common European "
        f"Framework of Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
        f"is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        SC.get('note', '') +
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for learners of Bengali, so this deck is not any examination's vocabulary and does not "
        f"claim to be. It is assembled from two things that can be stated. {from_inv} of the {n:,} "
        f"come from a vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words of everyday Bengali, taken from a "
        "frequency list built from film and television subtitles and counted by the WHOLE word, "
        "every form of a noun or a verb added together. The cards are dealt by that frequency, so "
        "the words you meet most often come first. The deck teaches the standard colloquial "
        "language (cholito bhasha) shared by West Bengal and Bangladesh; where an everyday word "
        "differs between the two — জল and পানি for water, নমস্কার and সালাম for a greeting — "
        "both are taught. Every headword is printed in the Bengali script with a romanisation "
        "beneath it, Wiktionary's own (ô for the open o of the inherent vowel, ō where the "
        "o-sign is written, a dot under the retroflex letters, ẏ and ẇ for the glides: kôra, "
        "bhalō), so the deck can be studied before the script is fluent; the Bengali Alphabet "
        "deck, the first in this collection, teaches the script itself. Bengali has no "
        f"grammatical gender. The {nouns} nouns show their definite form ('the …', with -টা), "
        "their plural and their genitive ('of …'); "
        f"the {verbs} verbs show their present, their past and their 'having done' form, where "
        "the stem's vowel changes and the irregular verbs show, and behind the All forms fold "
        "every tense by person, at the three levels of address — তুই intimate, তুমি familiar, "
        "আপনি polite. " + EX_NOTE + ", with the word picked out in colour and a speaker beside "
        "the sentence and the headword. Sources. Level: the Common European Framework of "
        "Reference (Council of Europe), global scale. Meanings, forms and romanisation: English "
        "Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Frequency: a word list built "
        "from OpenSubtitles (hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: "
        "Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )


def desc_phr(entries, n):
    """The phrases deck's description: no CEFR band, the three subdecks, and what was left out."""
    by = {k: sum(1 for e in entries if e['sub'] == k) for k in ('Phrases', 'Idioms', 'Proverbs')}
    ex = sum(1 for e in entries if e['examples'])
    return (
        f"{n} Bengali set phrases, idioms and proverbs, in three subdecks: {by['Phrases']} everyday "
        f"phrases, {by['Idioms']} idioms and {by['Proverbs']} proverbs. Both study directions come as "
        "two cards of one expression — Bengali → English (see the Bengali, recall the meaning) and "
        "English → Bengali (see an English meaning, recall the Bengali) — each with a schedule of its "
        "own. This is a companion to the five level decks, Bengali A1 to C1, and not one of them: a "
        "level is a list of words, and an expression is a unit a list of words cannot see. Nothing "
        "here is taught by any of the levels. The Phrases subdeck holds greetings and wishes of both "
        "communities (শুভ সকাল, ঈদ মোবারক, শুভ বিজয়া), the phrasebook sentences a learner needs whole "
        "(আপনি কেমন আছেন, আমি বুঝি না, আমার সাহায্য লাগবে), with তুই, তুমি and আপনি where the "
        "dictionary gives them, and the set everyday expressions (কিছু না, বার বার, দেখতে পাওয়া); "
        "the Idioms are expressions whose meaning is not their words' (ঘোড়ার ডিম, 'a horse's egg', "
        "means nothing at all); the Proverbs are complete sayings. WHERE THESE COME FROM: every "
        "expression of English Wiktionary's Bengali that no level teaches was read, and these were "
        "chosen by hand; compound nouns (bird and plant names, 'laptop computer'), second spellings, "
        "personal sentences about one's faith or nationality, partisan slogans, religious formulas "
        "in Arabic, and vulgarities were left out. The dictionary's Bengali is small, so this deck is "
        "too. Within each subdeck the commonest expressions come first, by a frequency list built "
        "from film and television subtitles. Every expression is printed in the Bengali script with "
        "Wiktionary's romanisation beneath it. "
        + (f"Real example sentences come with {ex} of the {n} expressions. " if ex else "")
        + "Sources. Meanings and romanisation: English Wiktionary, via the kaikki.org extraction "
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
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': (f'{n:,} words · both directions, as two cards per word' if LEVEL != 'phr' else
                     f'{n} expressions · ' + ', '.join(
                         f"{sum(1 for e in entries if e['sub'] == k)} {w}"
                         for k, w in (('Phrases', 'everyday'), ('Idioms', 'idioms'),
                                      ('Proverbs', 'proverbs'))) + ' · both directions'),
        'desc': desc(entries, n) if LEVEL != 'phr' else desc_phr(entries, n),
        'author': '', 'language': 'en', 'color': COLOR,
        'tags': (['bengali', 'bangla', 'vocabulary', LEVEL, NAMES[LEVEL].lower()] if LEVEL != 'phr'
                 else ['bengali', 'bangla', 'phrases', 'idioms', 'proverbs']),
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Bengali vocabulary', 'speechLang': 'bn-IN',
            'fields': FIELDS,
            'cards': [
                {'name': 'Bengali → English', 'front': FRONT_BN, 'back': BACK_BN},
                {'name': 'English → Bengali', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Bengali')
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
