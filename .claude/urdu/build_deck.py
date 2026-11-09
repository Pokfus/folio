#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Hindi shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is URDU -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in the Urdu script, RIGHT TO LEFT, written as Urdu is written
    -- without the short-vowel marks Wiktionary's tables carry (`ur.plain`) --
    with Wiktionary's ROMANISATION beneath it (khānā, ma͠i), which is where the
    vowels the script leaves out are shown;
  · the meanings, grouped by part of speech, a noun's GENDER in its label --
    Urdu has two and every adjective, postposition and past verb agrees;
  · one line of key forms: a noun's plural and oblique plural, an adjective's
    feminine, a verb's past (perfective), where Urdu verbs are irregular
    (گیا, کیا, دیا, لیا, ہوا);
  · the forms tables behind a fold (a verb's key forms and its tenses for میں
    "I", which is what Wiktionary's generated Urdu tables give; a noun's cases;
    a pronoun's case forms);
  · up to three Tatoeba sentences, the word picked out, with a speaker.

EVERY PIECE OF URDU IS ITS OWN `dir="rtl"` SPAN (`ur()`), and a romanisation
stands OUTSIDE it, so the Latin letters never take the Urdu face or direction.
The speaker reads the `Word` field, the bare Urdu.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ur import fold, nfc, plain, WORD as URWORD
from urdu_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'urdu'
COLOR = '#7066D0'
FIELDS = ['Urdu', 'Roman', 'Word', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'postp': 'postposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep': 'preposition',
            'prep_phrase': 'phrase', 'proverb': 'proverb', 'name': 'proper noun'}
GENDER = {'m': 'masculine', 'f': 'feminine', 'mf': 'masculine or feminine'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = ('<div class="uc-word">{{Urdu}}' + SAY + '</div>'
        '{{#Roman}}<div class="uc-rom">{{Roman}}</div>{{/Roman}}')
ASK = '<div class="uc-ask">Say it in Urdu</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_UR = WORD
BACK_UR = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape


def ur(s, inner=None):
    """A span of Urdu: right to left, in the Urdu face, isolated from the line around it."""
    return f'<span class="uc-ur" dir="rtl" lang="ur">{inner if inner is not None else E(s)}</span>'


# ---- glosses ---------------------------------------------------------------------------
TRAIL = re.compile(r'\s*[:;,]\s*$')


def gloss_text(g):
    return TRAIL.sub('', g)


# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here -- Hindi's
# rule (`.claude/hindi/build_deck.py`), for the same reason: a beginner's card that
# offers every homograph teaches the noise.  Where the first etymology is NOT the
# everyday word, or two are, the card names which:
ETYMS = {
    'اگر': ['2'],             # "if"; 1 is agarwood
    'سر': ['4'],              # sar "head"; 1 is "arrow", and seven more homographs follow
    'کل': ['2'],              # "yesterday; tomorrow"; 1 is "dumb, hoarse"
    'سو': ['2', '1'],         # "hundred" AND "so, hence"
    'منگل': ['2'],            # "Tuesday"; 1 is "auspicious"
    'بدھ': ['1'],             # "Wednesday" (a proper noun); 2 is "Buddha"
    'پیر': ['2'],             # pīr "Monday" (and "saint"); 1 is pair "foot", which is پاؤں here
    'طور': ['2'],             # "manner, way" (طور پر); 1 is "hill, mount" (Sinai)
    'بہتر': ['2'],            # "better"; 1 is the number seventy-two
    'اہم': ['2'],             # "important"; 1 is "ego"
    'ٹیم': ['2'],             # "team"; 1 is a lamp's flame
    'کھانا': ['1', '2'],      # "to eat" AND "food"
    'سونا': ['3', '2'],       # "to sleep" AND "gold"; 1 is sūnā "empty"
    'بس': ['1', '2'],         # "enough, only" AND "bus"
    'آم': ['1', '2'],         # "mango" AND "common"
    'اردو': [None, ''],       # the language (a proper noun, no etymology number) leads
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech.
GLOSS = {
    'اردو': {'name': ['Urdu (the language)']},
    # THE POSSESSIVES are two words in Urdu (`آپ کا`) and Wiktionary defines them only by
    # pointing at the pronoun ("genitive of آپ"); the card says what they mean
    'آپ کا': {'pron': ['yours (polite)'], 'det': ['your (polite)']},
    'ان کا': {'pron': ['theirs; his, hers (respectful)'], 'det': ['their; his, her (respectful)']},
}

# A PART OF SPEECH TO LEAD WITH, where Wiktionary's first is not the one a beginner
# meets: `اور` is "and" before it is "more", `بند` "closed" before it is "dam".
POS_LEAD = {
    'اور': 'conj', 'بند': 'adj', 'بعد': 'prep', 'کیا': 'pron', 'ہمیشہ': 'adv',
    'بغیر': 'prep', 'چینی': 'noun', 'بدھ': 'name',
}

# A ROMANISATION BY HAND, where Wiktionary's entry gives none (in its own system).
ROMAN_BY_HAND = {
    'فلم': 'film',
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'وجہ': 'reason',          # first listed is "face, visage"
    'چینی': 'sugar',          # first listed may be "Chinese"
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
    if L['word'] == 'اردو':
        ents = sorted(ents, key=lambda e: e['pos'] != 'name')
        keep = [e.get('etym', '') for e in ents]
    ents = sorted([e for e in ents if e.get('etym', '') in keep],
                  key=lambda e: keep.index(e.get('etym', '')))
    if L['word'] in POS_LEAD:
        ents = sorted(ents, key=lambda e: e['pos'] != POS_LEAD[L['word']])
    if row['pos']:
        ents = sorted(ents, key=lambda e: e['pos'] != row['pos'])
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
        if e['pos'] == 'noun' and e['gender'] in GENDER:
            label += ', ' + GENDER[e['gender']]
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
# WIKTIONARY HAS TWO SHAPES OF URDU VERB TABLE, and the forms code reads both:
#   · the GENERATED table (`ur-conj-auto`, most verbs): participles by gender and
#     number, and each tense for میں "I" alone, untagged for person;
#   · the FULL table (about 130 verbs, the commonest among them: کرنا, دینا,
#     دیکھنا, سمجھنا): every tense by person, the participles tagged only by gender
#     and number (habitual first, then perfective), and the future and subjunctive
#     written WITH their pronoun inside the cell ("مَیں کَرُوں گا"), which a table
#     here never prints beside a pronoun label of its own.
PERSON = {'first-person', 'second-person', 'third-person'}


#   · and one table of its own, `ہونا` "to be": its present, past, preterite and
#     future by person (ہوں, ہے, تھا, ہوا, ہو گا), with no aspects.
# The full tables tag NO cell masculine: a masculine and a feminine cell share one
# set of tags, the masculine first -- so `nth=1` is the feminine.
def is_full(tb):
    return any(set(t['t']) & PERSON and set(t['t']) & {'habitual', 'perfective', 'continuative'}
               for t in tb)


def is_be(tb):
    return not is_full(tb) and any(set(t['t']) & PERSON and 'preterite' in t['t'] for t in tb)


def cell(table, *need, skip=(), person=False, nth=0):
    for t in table:
        tags = set(t['t'])
        if bool(tags & PERSON) != person:
            continue
        if all(n in tags for n in need) and not (tags & set(skip)):
            if nth == 0:
                return t
            nth -= 1
    return None


AUX = re.compile(r'\s+ہ[َ]?ے$')


def bare_past(t):
    """The full table's perfective participle, read off its present perfect ("کیا ہے" -> "کیا")."""
    if not t:
        return None
    f_, r_ = t['f'], t['r']
    if not AUX.search(nfc(f_)) or not r_.endswith(' hai'):
        return None
    return {'f': AUX.sub('', nfc(f_)), 'r': r_[:-4], 't': t['t']}


def past_forms(tb):
    if is_full(tb):
        m = bare_past(cell(tb, 'perfective', 'present', 'third-person', 'singular', person=True))
        fe = bare_past(cell(tb, 'perfective', 'present', 'third-person', 'singular', person=True, nth=1))
        return m, fe
    if is_be(tb):
        return cell(tb, 'preterite', 'third-person', 'singular', person=True), None
    return (cell(tb, 'masculine', 'perfective', 'singular', skip=('adjectival', 'agentive')),
            cell(tb, 'feminine', 'perfective', 'singular', skip=('adjectival', 'agentive', 'indicative')))


def fi(label, t):
    if not t:
        return ''
    return (f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{ur(plain(t["f"]))}'
            f'<span class="uc-fr">{E(t["r"])}</span></span>')


def forms_line(e, word):
    tb = e['table']
    if not tb:
        return ''
    bits = []
    if e['pos'] == 'noun':
        dp = cell(tb, 'direct', 'plural')
        op = cell(tb, 'oblique', 'plural')
        if dp and fold(dp['f']) != fold(word):
            bits.append(fi('plural', dp))
        bits.append(fi('oblique plural', op))
    elif e['pos'] == 'adj':
        fe = cell(tb, 'feminine', 'singular', 'direct') or cell(tb, 'feminine', 'singular')
        if fe and fold(fe['f']) != fold(word):
            bits.append(fi('feminine', fe))
            bits.append(fi('plural', cell(tb, 'direct', 'masculine', 'plural')))
    elif e['pos'] == 'verb':
        m, fe = past_forms(tb)
        bits.append(fi('past', m))
        bits.append(fi('feminine', fe))
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


def row(label, t):
    if not t:
        return ''
    return (f'<div class="uc-cjr"><span class="uc-cj-p">{label}</span>'
            f'<span class="uc-cj-f">{ur(plain(t["f"]))}<span class="uc-fr">{E(t["r"])}</span></span></div>')


def lab(en, u=''):
    """A row label: English, with the Urdu word it stands for in its own RTL span."""
    return E(en) + (' ' + ur(u) if u else '')


def block(head, rows):
    rows = [r for r in rows if r]
    if not rows:
        return ''
    return f'<div class="uc-cj"><div class="uc-cjh">{head}</div>{"".join(rows)}</div>'


FULL_PERSONS = [('I', 'میں', ('first-person', 'singular')),
                ('you, intimate; he, she, it', 'تو، وہ', ('third-person', 'singular')),
                ('you, familiar', 'تم', ('second-person', 'plural')),
                ('we; you, polite; they', 'ہم، آپ، وہ', ('third-person', 'plural'))]


def by_person(tb, *aspect):
    return [row(lab(en, u), cell(tb, *(aspect + need), person=True))
            for en, u, need in FULL_PERSONS]


def verb_table(tb):
    if is_be(tb):
        imp = [t for t in tb if set(t['t']) == {'error-unrecognized-form', 'infinitive'}]
        return [
            block('key forms', [row('infinitive', cell(tb, 'direct', 'infinitive')),
                                row('having …-ed', cell(tb, 'conjunctive')),
                                row('became, m. sg.', cell(tb, 'preterite', 'third-person', 'singular', person=True))]),
            block('present', by_person(tb, 'indicative', 'present')),
            block('past (masculine)', by_person(tb, 'imperfect', 'past')),
            block('future (masculine)', by_person(tb, 'future', 'indicative')),
            block('imperative', [row(lab('you, familiar', 'تم'), imp[0] if imp else None)]),
        ]
    if is_full(tb):
        m, fe = past_forms(tb)
        imp = [t for t in tb if set(t['t']) == {'error-unrecognized-form', 'infinitive'}]
        return [
            block('key forms', [row('infinitive', cell(tb, 'direct', 'infinitive')),
                                row('having …-ed', cell(tb, 'conjunctive')),
                                row('habitual, m. sg.', next((t for t in tb if set(t['t']) == {'masculine', 'singular'}), None)),
                                row('past, m. sg.', m),
                                row('past, f. sg.', fe)]),
            block('present (masculine)', by_person(tb, 'habitual', 'present')),
            block('present continuous (masculine)', by_person(tb, 'continuative', 'present')),
            # NOT the table's present perfect ("میں کیا ہوں"): a transitive verb's is
            # ergative (میں نے کیا ہے), and the table's cells would teach the wrong sentence
            # the full table's imperative cells are, in order, the intimate, the familiar
            # and the polite (دیکھ, دیکھو, دیکھیں / دیکھئے)
            block('imperative', [row(lab('you, intimate', 'تو'), imp[0] if len(imp) > 0 else None),
                                 row(lab('you, familiar', 'تم'), imp[1] if len(imp) > 1 else None),
                                 row(lab('you, polite', 'آپ'), imp[2] if len(imp) > 2 else None)]),
        ]
    return [
        block('key forms', [row('stem', cell(tb, 'stem')),
                            row('infinitive', cell(tb, 'infinitive', skip=('oblique', 'masculine', 'feminine'))),
                            row('having …-ed', cell(tb, 'conjunctive')),
                            row('habitual', cell(tb, 'habitual', 'masculine', 'singular')),
                            row('past, m. sg.', cell(tb, 'masculine', 'perfective', 'singular',
                                                     skip=('adjectival', 'agentive'))),
                            row('past, m. pl.', cell(tb, 'masculine', 'perfective', 'plural',
                                                     skip=('adjectival', 'agentive'))),
                            row('past, f. sg.', cell(tb, 'feminine', 'perfective', 'singular',
                                                     skip=('adjectival', 'agentive')))]),
        # Wiktionary's generated Urdu table gives each tense for میں "I" alone
        block('with ' + ur('میں') + ' “I” (masculine)', [
            row('present', cell(tb, 'indicative', 'present', 'masculine', skip=('past',))),
            row('past', cell(tb, 'indicative', 'past', 'masculine', skip=('present',))),
            row('future', cell(tb, 'future', 'indicative', 'masculine')),
            row('may / should', cell(tb, 'subjunctive', skip=('present', 'future', 'past')))]),
        block('imperative', [row(lab('you, intimate', 'تو'), cell(tb, 'imperative', 'present'))]),
    ]


def table_html(e):
    tb = e['table']
    if not tb:
        return ''
    if e['pos'] == 'verb':
        blocks = verb_table(tb)
    elif e['pos'] == 'noun':
        blocks = [block('singular', [row('direct', cell(tb, 'direct', 'singular')),
                                     row('oblique', cell(tb, 'oblique', 'singular')),
                                     row('vocative', cell(tb, 'vocative', 'singular'))]),
                  block('plural', [row('direct', cell(tb, 'direct', 'plural')),
                                   row('oblique', cell(tb, 'oblique', 'plural')),
                                   row('vocative', cell(tb, 'vocative', 'plural'))])]
    elif e['pos'] == 'adj':
        blocks = [block('masculine', [row('direct singular', cell(tb, 'direct', 'masculine', 'singular')),
                                      row('plural, oblique', cell(tb, 'masculine', 'plural', skip=('vocative',)))]),
                  block('feminine', [row('every form', cell(tb, 'feminine', 'singular', 'direct'))])]
    elif e['pos'] in ('pron', 'det'):
        cases = [('direct', 'direct'), ('oblique', 'indirect'), (lab('with', 'نے'), 'ergative'),
                 (lab('of', 'کا'), 'genitive'), (lab('to', 'کو'), 'dative')]
        sg = [row(l, cell(tb, t, skip=('plural',))) for l, t in cases]
        pl = [row(l, cell(tb, t, 'plural')) for l, t in cases]
        blocks = [block('singular' if any(pl) else 'forms', sg), block('plural', pl)]
    else:
        return ''
    blocks = [b for b in blocks if b]
    if not blocks:
        return ''
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>'


# ---- examples --------------------------------------------------------------------------
def mark(sentence, hits):
    hs = set(hits)
    out = []
    for piece in re.split('(' + URWORD.pattern + ')', sentence):
        if piece and fold(piece) in hs:
            out.append(f'<b>{E(piece)}</b>')
        else:
            out.append(E(piece))
    return ''.join(out)


def examples_html(exs):
    out = []
    for u, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz">{ur(u, mark(u, hits))}'
                   f'<span class="uc-tts uc-exsay" data-say="{E(u)}"></span></div>'
                   f'<div class="uc-exe">{E(en)}</div></div>')
    return ''.join(out)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        main = ents[0]
        word = plain(r['word'])
        roman = main['roman'] or next((e['roman'] for e in ents if e['roman']), '') \
            or ROMAN_BY_HAND.get(r['word'], '')
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Urdu': ur(word),
            'Roman': E(roman),
            'Word': word,
            'English': english(ents, r['word']),
            'Forms': forms_line(main, word),
            'Table': table_html(main),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex), 'roman': bool(roman)})
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
               f'{ex3} of them (Tatoeba has only a few thousand Urdu sentences)')
    return (
        "Both study directions in one deck: Urdu → English (see the Urdu, recall the meaning) "
        "and English → Urdu (see an English meaning, recall the Urdu). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words for a beginner, aligned to {LEVEL.upper()} of the Common European "
        f"Framework of Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
        f"is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for Urdu, so this deck is not any examination's vocabulary and does not claim to be. It "
        f"is assembled from two things that can be stated. {from_inv} of the {n} come from a "
        f"vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words of Urdu, by two frequency lists "
        "averaged, one built from film and television subtitles and one from written Urdu "
        "(Wikipedia, the web and social media), each counted by the WHOLE word, every form of a "
        "noun or a verb added together. The cards are dealt by that frequency, so the words you "
        "meet most often come first; because half the count is written Urdu, the news's words "
        "(government, minister, court) come earlier than a phrase book would put them. "
        "Every headword is printed in the Urdu script, right to left and without the short-vowel "
        "marks, as Urdu is written, with a romanisation beneath it, Wiktionary's own (ā ī ū for "
        "the long vowels, a tilde for nasalisation: khānā, ma͠i), which shows the vowels the script "
        "leaves out; the Urdu Alphabet deck, the first in this collection, teaches the script "
        f"itself. The {nouns} nouns show their gender, masculine or feminine, which every "
        "adjective, postposition and past-tense verb agrees with, and their plural; the "
        f"{verbs} verbs show their past forms, where Urdu verbs are irregular, and behind the All "
        "forms fold their key forms and their tenses. "
        + EX_NOTE + ", with the word picked out in colour and a speaker beside the sentence and the "
        "headword (whether it speaks depends on an Urdu voice being installed on your device). "
        "Sources. Level: the Common European Framework of Reference (Council of Europe), global "
        "scale. Meanings, gender, forms and romanisation: English Wiktionary, via the kaikki.org "
        "extraction (CC BY-SA 4.0). Frequency: a word list built from OpenSubtitles "
        "(hermitdave/FrequencyWords, CC BY-SA 4.0) and the wordfreq project's Urdu list "
        "(CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR."
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
        'tags': ['urdu', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Urdu vocabulary', 'speechLang': 'ur-PK',
            'fields': FIELDS,
            'cards': [
                {'name': 'Urdu → English', 'front': FRONT_UR, 'back': BACK_UR},
                {'name': 'English → Urdu', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Urdu')
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
