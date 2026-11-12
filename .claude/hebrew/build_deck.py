#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / TORFL / Persian shape.  The word is a single
record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is HEBREW -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword UNPOINTED, in the full spelling, as Israelis write it and as a
    reader will meet it (`Hebrew`), RIGHT TO LEFT (`dir="rtl"` on every Hebrew
    element, so a line mixing the word and a Latin label still runs the right
    way);
  · beneath it the POINTED form, which says how it is pronounced (`Pointed`),
    and Wiktionary's ROMANISATION (`Roman`: shalóm, katáv, the stress marked);
  · the meanings, grouped by part of speech, a noun's gender with it;
  · one line of key forms: a noun's plural; a verb's infinitive, present and
    future, and its binyan (the verb pattern, which predicts its forms); an
    adjective's feminine and plurals;
  · the forms tables behind a fold: a verb's past, present, future and
    imperative by person; a noun's definite, construct and possessive forms; a
    preposition's forms with a pronoun (`שלי` "mine", `איתך` "with you");
  · up to three Tatoeba sentences, the word picked out, with a speaker.

Every form is shown in the full spelling with its pointed form beside it.  The
speaker reads the `Word` field, the bare unpointed word, as `he-IL`.
"""
import html, json, os, re, sys, unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from he import fold, nfc, unpoint, strips, WORD as WORD_RE
from hebrew_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE
from choose import choose

STAMP = '2026-11-12T00:00:00.000Z'

WHO = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner',
       'b2': 'an upper-intermediate learner', 'c1': 'an advanced learner'}
TYPE_ID = 'hebrew'
COLOR = '#5E6EC0'
FIELDS = ['Hebrew', 'Pointed', 'Roman', 'Word', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'conj': 'conjunction',
            'particle': 'particle', 'intj': 'interjection', 'num': 'number',
            'phrase': 'phrase', 'prep': 'preposition', 'prep_phrase': 'phrase',
            'proverb': 'proverb', 'name': 'proper noun', 'contraction': 'contraction',
            'adv_phrase': 'phrase'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = ('<div class="uc-word">{{Hebrew}}' + SAY + '</div>'
        '{{#Pointed}}<div class="uc-pt">{{Pointed}}</div>{{/Pointed}}'
        '{{#Roman}}<div class="uc-rom">{{Roman}}</div>{{/Roman}}')
ASK = '<div class="uc-ask">Say it in Hebrew</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_HE = WORD
BACK_HE = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape


def he(s):
    """A run of Hebrew, right to left, isolated from the Latin around it."""
    return f'<span class="uc-he" dir="rtl" lang="he">{E(s)}</span>'


# ---- glosses ---------------------------------------------------------------------------
TRAIL = re.compile(r'\s*[:;,.]\s*$')

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech, where its entry is a
# grammar note rather than a meaning a card can be answered with.
GLOSS = {
    # Wiktionary's first gloss is "to exist", then two grammar notes; the copula is "to be"
    'היה|הָיָה': {'verb': ['to be', 'to exist', 'to happen, to take place']},
    'את|אֵת': {'prep': ['marks the definite direct object (placed before it: ראיתי את הילד, I saw the boy)']},
    'זאת|זֹאת': {'det': ['this (feminine)'], 'pron': ['this (feminine)']},
    # Wiktionary files אלה as "the plural of זה", a pointer
    'אלה|אֵלֶּה': {'det': ['these']},
    # Wiktionary's det is "the same"; the word's everyday use (and its count) is the object pronoun
    'אותו|אוֹתוֹ': {'det': ['him, it (as the direct object: את + הוא)', 'the same (אותו דבר, the same thing)']},
    'אותה|אוֹתָהּ': {'det': ['her, it (as the direct object: את + היא)', 'the same (feminine)']},
    'כל|כֹּל': {'noun': ['all, every, each, the whole (כל הזמן, all the time)']},
    'כזה|כָּזֶה': {'adv': ['such, like this (masculine)']},
    'שום|שׁוּם': {'noun': []},
    # Wiktionary's noun is "sweetness"; the word's everyday use is the endearment
    'מותק|מֹתֶק': {'noun': ['sweetie, honey (a term of endearment)', 'sweetness']},
    # its second sense is vulgar slang, not tagged so
    'גמר|גָּמַר': {'verb': ['to finish, complete', 'to be through or done']},
    # Wiktionary's first gloss is a grammar note ("used with the preposition ב־")
    'פגע|פָּגַע': {'verb': ['to hit, to hurt, to harm (with ב־)', 'to meet, to encounter']},
    'אכפת|אִכְפַּת': {'adv': ['(someone) cares, minds (אכפת לי, I care)']},
    'בוקר טוב|בֹּקֶר טוֹב': {'intj': ['good morning']},
    'ימין|יָמִין': {'noun': ['right (the side or direction)', 'the right hand', 'the political right']},
    'ישראל|יִשְׂרָאֵל': {'name': ['Israel (the country)', 'the Jewish people, the children of Israel']},
    'מורה|מוֹרֶה': {'adj': []},
    # A2: Wiktionary files the feminine numbers as "feminine of …", a pointer; they are also the forms
    # used for counting, telling the time and saying a number aloud
    'אחת|אַחַת': {'num': ['one (feminine; the form for counting and the time: בשעה אחת, at one o\'clock)'],
                  'pron': []},
    'שתיים|שְׁתַּיִם': {'num': ['two (feminine; the form for counting)']},
    'שלוש|שָׁלוֹשׁ': {'num': ['three (feminine; the form for counting)']},
    'ארבע|אַרְבַּע': {'num': ['four (feminine; the form for counting)']},
    'חמש|חָמֵשׁ': {'num': ['five (feminine; the form for counting)']},
    'תשע|תֵּשַׁע': {'num': ['nine (feminine; the form for counting)']},
    'להתראות|לְהִתְרָאוֹת': {'verb': []},
    # A2: Wiktionary's adjective is "will, shall"; the word a learner meets first is the noun "the future"
    'עתיד|עָתִיד': {'adj': ['future (as an adjective); will, shall (עתיד ל־, is going to)']},
    # two words of one pointing: the fortress leads in Wiktionary, the beer in a learner's day
    'בירה|בִּירָה': {'noun': ['beer']},
    'תיכון|תִּיכוֹן': {'adj': ['middle, central', 'as a noun: high school (בית ספר תיכון)']},
    'פסח|פֶּסַח': {'name': ['Passover (the spring festival)']},
    'חנוכה|חֲנֻכָּה': {'name': ['Hanukkah (the winter festival of lights)']},
    'ראש השנה|רֹאשׁ הַשָּׁנָה': {'name': ['Rosh Hashanah, the Jewish New Year']},
    'פורים|פּוּרִים': {'name': ['Purim (the spring festival of Esther)']},
    # B1: Wiktionary's gloss of חשמל is a note on its Biblical sense; the modern word is "electricity"
    'חשמל|חַשְׁמַל': {'noun': ['electricity']},
    # two words of one pointing, from two origins: the card teaches the one the inventory named
    'מכונה|מְכוֹנָה': {'noun': ['machine']},
    'חוזה|חוֹזֶה': {'noun': ['contract (agreement)']},
    'אות|אוֹת': {'noun': ['a letter (of the alphabet)', 'a sign, a signal']},
    # Wiktionary gives only "mound, heap"; the everyday word is "wave"
    'גל|גַּל': {'noun': ['wave', 'mound, heap']},
    # Wiktionary's first gloss is "belt", an error; its second, "promise", is the word
    'הבטחה|הַבְטָחָה': {'noun': ['promise']},
    'הבא|הַבָּא': {'noun': ['next, the next one (בשבוע הבא, next week)']},
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'עבודה|עֲבוֹדָה': 'work',
    'מר|מַר': 'mister',
    'אפס|אֶפֶס': 'zero',
    'שפה|שָׂפָה': 'language',
    'חנות|חֲנוּת': 'shop',
    'עוף|עוֹף': 'chicken',
    'סרט|סֶרֶט': 'film',
    'מזל|מַזָּל': 'luck',
    'הציע|הִצִּיעַ': 'suggest',
    'גיבור|גִּבּוֹר': 'hero',
    'אזור|אֵזוֹר': 'area',
    'הוכיח|הוֹכִיחַ': 'prove',
    'חשבון|חֶשְׁבּוֹן': 'bill',
    'חומר|חֹמֶר': 'material',
    'נער|נַעַר': 'boy',
    'מנע|מָנַע': 'prevent',
    'פנה|פָּנָה': 'turn',
    'טען|טָעַן': 'claim',
    'שיעור|שִׁעוּר': 'lesson',
    'עצב|עֶצֶב': 'sorrow',
    'כף|כַּף': 'spoon',
    'כיס|כִּיס': 'pocket',
    'מזוודה|מִזְוָדָה': 'suitcase',
    'מלפפון|מְלָפְפוֹן': 'cucumber',
    'אחוז|אָחוּז': 'percent',
    'התעלם|הִתְעַלֵּם': 'ignore',
    'התחמק|הִתְחַמֵּק': 'evade',
    'גאון|גָּאוֹן': 'genius',
    'הקריב|הִקְרִיב': 'sacrifice',
    'רמה|רָמָה': 'level',
    'דף|דַּף': 'sheet',
    'בור|בּוֹר': 'pit',
    'זיהום|זִהוּם': 'pollution',
    'מחקר|מֶחְקָר': 'research',
    'עורר|עוֹרֵר': 'arouse',
    'טבח|טַבָּח': 'cook',
    'הנחה|הֲנָחָה': 'discount',
}

# A ROMANISATION BY HAND, where Wiktionary's entry gives only a Biblical or scholarly reading;
# written in the modern system the other cards use.
ROMAN_BY_HAND = {
    'עלה|עָלָה': 'alá',
    'ענה|עָנָה': 'aná',
    'רעיון|רַעֲיוֹן': 'ra\'ayón',
    'יפהפה|יְפֵהפֶה': 'yefefé',
}

# A gloss that is Wiktionary's long definition of an everyday word, shortened.
SHORT = [
    (re.compile(r'^(.{3,}?) \((?:a |an |the )[^)]{40,}\)$'), r'\1'),
    (re.compile(r'^\((?:uncountable|countable)\)\s*'), ''),
    (re.compile(r'[;,.]?\s*\(?see usage notes? below\.?\)?', re.I), ''),
    (re.compile(r'; (?:found|used to translate) .*$'), ''),
]
PROPER = re.compile(r'^[A-Z]{2}|^(I|English|Hebrew|Israel|God|Sabbath|Shabbat|Jewish|Jews?|Mr|Mrs|OK|'
                    r'Passover|Hanukkah|Purim|Rosh|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b')
DAY = re.compile(r'^(passover|hanukkah|purim|rosh|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b')


def tidy(g):
    g = TRAIL.sub('', g.strip())
    for rx, rep in SHORT:
        g = rx.sub(rep, g)
    g = TRAIL.sub('', g.strip())
    if g[:1].isupper() and not PROPER.match(g):
        g = g[0].lower() + g[1:]
    elif DAY.match(g):
        g = g[0].upper() + g[1:]
    return g


def english(ents, key):
    parts, shown = [], set()
    for e in ents:
        label = POS_NAME.get(e['pos'], e['pos'])
        if e['pos'] == 'noun' and e['g']:
            label += ', ' + e['g']
        gl, seen = [], set()
        for g in e['glosses']:
            if g['weak'] and gl:
                continue
            t = tidy(g['g'])
            if t and t.lower() not in seen:
                seen.add(t.lower())
                gl.append(t)
        if e['pos'] in GLOSS.get(key, {}):
            gl = list(GLOSS[key][e['pos']])
        lead = LEAD.get(key)
        if lead:
            gl.sort(key=lambda x: lead not in x)
        gl = gl[:3]
        if not gl or all(x.lower() in shown for x in gl):
            continue
        shown.update(x.lower() for x in gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label)}</div>{body}</div>')
    return ''.join(parts)


# ---- forms -----------------------------------------------------------------------------
def pair(t):
    """A form in the full spelling, its pointed form beside it when they differ in more than points."""
    if not t:
        return ''
    w, p = t['w'] or unpoint(t['p']), t['p']
    return he(w) + (f'<span class="uc-fr">{he(p)}</span>' if p else '')


def fi(label, t):
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{pair(t)}</span>' if t else ''


def cell(rows, *need, skip=()):
    for t in rows:
        if all(n in t['t'] for n in need) and not set(t['t']) & set(skip) and (t['w'] or t['p']):
            return t
    return None


BINYAN = {"pa'al": "pa'al", "pi'el": "pi'el", "hif'il": "hif'il", "hitpa'el": "hitpa'el",
          "nif'al": "nif'al", "pu'al": "pu'al", "huf'al": "huf'al"}


def forms_line(e):
    bits, tb, hd = [], e['table'], e['head']
    if e['pos'] == 'noun':
        pl = cell(tb, 'indefinite', 'plural', skip=('possessed-form',)) or cell(hd, 'indefinite', 'plural') \
            or cell(hd, 'plural', skip=('construct',))
        bits.append(fi('plural', pl))
    elif e['pos'] == 'verb':
        bits.append(fi('infinitive', cell(tb, 'infinitive') or cell(hd, 'infinitive')))
        bits.append(fi('present', cell(tb, 'present', 'masculine', 'singular') or cell(hd, 'present')))
        bits.append(fi('future', cell(tb, 'future', 'third-person', 'masculine', 'singular')
                       or next((t for t in hd if t['t'] == ['future'] and t['p']), None)))
    elif e['pos'] == 'adj':
        bits.append(fi('feminine', cell(hd, 'feminine', skip=('plural',))))
        bits.append(fi('plural', cell(hd, 'masculine', 'plural')))
        bits.append(fi('fem. plural', cell(hd, 'feminine', 'plural')))
    bits = [b for b in bits if b]
    out = f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''
    if e['pos'] == 'verb' and e['binyan'] in BINYAN:
        out = (f'<div class="uc-forms"><span class="uc-fi"><span class="uc-fl">binyan</span>'
               f'{E(BINYAN[e["binyan"]])}</span></div>') + out
    return out


def row(label, t, latin=False):
    if not t:
        return ''
    lab = E(label) if latin else he(label)
    return (f'<div class="uc-cjr"><span class="uc-cj-p">{lab}</span>'
            f'<span class="uc-cj-f">{pair(t)}</span></div>')


def block(head, rows):
    rows = [r for r in rows if r]
    if not rows:
        return ''
    return f'<div class="uc-cj"><div class="uc-cjh">{E(head)}</div>{"".join(rows)}</div>'


PERSONS = [('אני', ('first-person', 'singular'), ()),
           ('אתה', ('second-person', 'masculine', 'singular'), ('feminine',)),
           ('את', ('second-person', 'feminine', 'singular'), ()),
           ('הוא', ('third-person', 'masculine', 'singular'), ('feminine',)),
           ('היא', ('third-person', 'feminine', 'singular'), ()),
           ('אנחנו', ('first-person', 'plural'), ()),
           ('אתם', ('second-person', 'masculine', 'plural'), ('feminine',)),
           ('אתן', ('second-person', 'feminine', 'plural'), ()),
           ('הם', ('third-person', 'masculine', 'plural'), ()),
           ('הן', ('third-person', 'feminine', 'plural'), ())]


def by_person(tb, base, skip=()):
    out, last = [], None
    for p, need, notag in PERSONS:
        t = cell(tb, *(base + need), skip=tuple(skip) + notag)
        if p == 'הן' and t is not None and last is t:
            continue          # the past's third person plural is one form for both genders
        if p == 'הם' and t is not None and 'feminine' in t['t']:
            p = 'הם, הן'
        out.append(row(p, t))
        last = t
    return out


def table_html(e):
    tb = e['table']
    if not tb:
        return ''
    if e['pos'] == 'verb':
        blocks = [
            block('past', by_person(tb, ('past',))),
            block('present', [row('m. singular', cell(tb, 'present', 'masculine', 'singular'), True),
                              row('f. singular', cell(tb, 'present', 'feminine', 'singular'), True),
                              row('m. plural', cell(tb, 'present', 'masculine', 'plural'), True),
                              row('f. plural', cell(tb, 'present', 'feminine', 'plural'), True)]),
            block('future', by_person(tb, ('future',))),
            block('imperative', [row('אתה', cell(tb, 'imperative', 'masculine', 'singular', skip=('negative',))),
                                 row('את', cell(tb, 'imperative', 'feminine', 'singular', skip=('negative',))),
                                 row('אתם', cell(tb, 'imperative', 'masculine', 'plural', skip=('negative',))),
                                 row('אתן', cell(tb, 'imperative', 'feminine', 'plural', skip=('negative',)))]),
        ]
    elif e['pos'] == 'noun':
        S = ('possessed-form',)
        blocks = [
            block('forms', [row('singular', cell(tb, 'indefinite', 'singular', skip=S), True),
                            row('plural', cell(tb, 'indefinite', 'plural', skip=S), True),
                            row('the …', cell(tb, 'definite', 'singular', skip=S), True),
                            row('the … (plural)', cell(tb, 'definite', 'plural', skip=S), True),
                            row('… of (construct)', cell(tb, 'construct', 'singular', skip=S), True),
                            row('… of (plural)', cell(tb, 'construct', 'plural', skip=S), True)]),
            block('my, your, his …', [
                row('my', cell(tb, 'possessed-form', 'first-person', 'singular')
                    if cell(tb, 'possessed-form', 'first-person', 'singular') else None, True),
                row('your (m.)', cell(tb, 'possessed-form', 'second-person', 'masculine', 'singular', skip=('feminine',)), True),
                row('your (f.)', cell(tb, 'possessed-form', 'second-person', 'feminine', 'singular'), True),
                row('his', cell(tb, 'possessed-form', 'third-person', 'masculine', 'singular', skip=('feminine',)), True),
                row('her', cell(tb, 'possessed-form', 'third-person', 'feminine', 'singular'), True),
                row('our', cell(tb, 'possessed-form', 'first-person', 'plural'), True),
                row('their (m.)', cell(tb, 'possessed-form', 'third-person', 'masculine', 'plural', skip=('feminine',)), True)]),
        ]
    elif e['pos'] in ('prep', 'pron', 'det', 'particle', 'adv'):
        blocks = [block('with a pronoun', by_person(tb, ()))]
    else:
        return ''
    blocks = [b for b in blocks if b]
    if not blocks:
        return ''
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>'


# ---- examples --------------------------------------------------------------------------
def mark(sentence, hits):
    """Bold the matched words (a token is matched as folded, with or without its prefixes)."""
    hs = set(hits)
    s = nfc(sentence)
    out, pos = [], 0
    for m in WORD_RE.finditer(s):
        t = fold(m.group().strip('\'"'))
        if t in hs:
            a, b = m.start(), m.end()
            out.append(E(s[pos:a]) + '<b>' + E(s[a:b]) + '</b>')
            pos = b
    out.append(E(s[pos:]))
    return ''.join(out)


def mark_multi(sentence, words):
    s = nfc(sentence)
    spans = [(m.start(), m.end(), fold(m.group())) for m in WORD_RE.finditer(s)]
    n = len(words)
    for j in range(len(spans) - n + 1):
        if [x[2] for x in spans[j:j + n]] == words:
            a, b = spans[j][0], spans[j + n - 1][1]
            return E(s[:a]) + '<b>' + E(s[a:b]) + '</b>' + E(s[b:])
    return E(s)


def examples_html(exs, multi):
    out = []
    for s, en, hits in exs:
        body = mark_multi(s, hits) if multi else mark(s, hits)
        out.append(f'<div class="uc-exi"><div class="uc-exz" dir="rtl" lang="he"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(s)}"></span>{body}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>')
    return ''.join(out)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        L = lex[r['key']]
        ents = choose(L, r['pos'], r['pick'])
        main = ents[0]
        word = L['word']
        key = word + '|' + main['p']
        roman = ROMAN_BY_HAND.get(key) or main['roman'] or next((e['roman'] for e in ents if e['roman']), '')
        ex = exs.get(r['key'] + '|' + r['pick'], [])
        cards.append({'sub': '', 'fields': {
            'Hebrew': he(word),
            'Pointed': he(main['p']) if main['p'] and main['p'] != word else '',
            'Roman': E(roman),
            'Word': word,
            'English': english(ents, key),
            'Forms': forms_line(main),
            'Table': table_html(main),
            'Examples': examples_html(ex, ' ' in word),
        }})
        entries.append({'word': word, 'p': main['p'], 'pos': main['pos'], 'source': r['source'],
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
               f'{ex3} of them')
    return (
        "Both study directions in one deck: Hebrew → English (see the Hebrew, recall the meaning) "
        "and English → Hebrew (see an English meaning, recall the Hebrew). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words for {WHO[LEVEL]}, aligned to {LEVEL.upper()} of the Common European "
        f"Framework of Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
        f"is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "The Hebrew taught is the modern standard language of Israel. "
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for Hebrew, so this deck is not any examination's vocabulary and does not claim to be. It "
        f"is assembled from two things that can be stated. {from_inv} of the {n} come from a "
        f"vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words of everyday Hebrew, taken from a "
        "frequency list built from film and television subtitles and counted by the WHOLE word: "
        "every form of a noun or a verb added together, including the forms written with a "
        "prefix such as ו \"and\", ה \"the\" or ב \"in\" joined to the front. The cards are dealt by "
        "that frequency, so the words you meet most often come first. "
        "Every headword is printed as Hebrew is normally written — without vowel points, in the "
        "full spelling — with the POINTED form beneath it, which shows how it is said, and "
        "Wiktionary's romanisation with the stress marked (shalóm, katáv). Words spelt alike are "
        "separate cards where the level teaches both (שֵׁם \"name\", שָׁם \"there\"). The Hebrew "
        "Alphabet deck, the first in this collection, teaches the letters and the vowel points. "
        f"The {nouns} nouns show their gender and plural; the {verbs} verbs are given, as Hebrew "
        "dictionaries give them, in the past tense \"he\" form, with their infinitive, present, "
        "future and binyan (the verb pattern) beside them and, behind the All forms fold, their "
        "past, present, future and imperative by person. "
        + EX_NOTE + ", with the word picked out in colour and a speaker beside the sentence and the "
        "headword. Sources. Level: the Common European Framework of Reference (Council of Europe), "
        "global scale. Meanings, forms, pointing and romanisation: English Wiktionary, via the "
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
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': f'{n} words · both directions, as two cards per word',
        'desc': desc(entries, n), 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['hebrew', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Hebrew vocabulary', 'speechLang': 'he-IL',
            'fields': FIELDS,
            'cards': [
                {'name': 'Hebrew → English', 'front': FRONT_HE, 'back': BACK_HE},
                {'name': 'English → Hebrew', 'front': FRONT_EN, 'back': BACK_EN},
            ],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}

    import importlib.util as ilu
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dedupe-glosses.py')
    spec = ilu.spec_from_file_location('dedupe_glosses', p)
    dg = ilu.module_from_spec(spec)
    spec.loader.exec_module(dg)
    st = dg.dedupe(deck, 'Hebrew')
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
