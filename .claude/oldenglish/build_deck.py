#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the shape every language set on the shelf uses.  The word
is a single record and the two directions are card TEMPLATES, so a corrected
gloss is corrected both ways at once and each direction keeps its own schedule.
Card 1 is OLD ENGLISH -> ENGLISH, the direction a reader of the texts needs.

WHAT A CARD CARRIES:
  · the headword as Wiktionary normalises it -- macrons for long vowels, a dot
    over ċ and ġ where they are said "ch" and "y" (iċ, ġēar) -- with Wiktionary's
    reconstructed IPA beneath it.  No speaker: no browser voice reads Old English;
  · the meanings, grouped by part of speech; a noun's GENDER in its label (Old
    English has three, and the article and every adjective agree), a verb's
    CLASS (strong I-VII, weak 1-3, preterite-present, irregular);
  · one line of key forms: a noun's genitive, plural and declension, a verb's principal
    parts (past, past plural, past participle -- the forms a strong verb has to
    be learnt by), an adjective's comparative and superlative;
  · the Modern English DESCENDANT where Wiktionary traces one (cyning -> king),
    labelled as a descendant, since cniht's is "knight" and it means "boy";
  · the paradigm behind a fold, and up to three sentences behind another, each with its
    reference (Ælfric by Thorpe's page, Tatoeba by sentence id).

THE BEGINNER PASS (2026-11-27; docs/lang-decks.md, "The Old English beginner pass") found
that the commonest forms of the corpus were on no card, and why:
  · `table_html` cut a declined word's table at the first row that repeated the first row's
    tags, to drop an adjective's weak half -- but a CELL WITH TWO FORMS repeats its tags at
    once, so sē (sē, þē) showed one cell of thirty and gōd (betera, sēlra) none of its own:
    þām, þǣre, þæs and þone are 3.0% of every word Ælfric wrote.  The halves are now found
    by the first cell's tags coming round AGAIN after other cells (`halves`), and the weak
    half is shown, since "se hālga", "þā ēċan" are weak and as common as the strong;
  · a word declined by gender without a number (hwā, hwæt) or in the plural only (twēġen)
    had no table, or one with the genders run together;
  · THE TEXTS' OWN SPELLINGS.  Wiktionary prints early West Saxon and Ælfric wrote late:
    forþan for forþon, būton for būtan, þisum for þissum, sceolon for sċulon.  `also` adds one
    line to the card, "also in the texts": a spelling is printed only when TWO sources agree
    -- Wiktionary files it under this word in an entry of its own (an alternative form, or
    a form of it) AND the corpus prints it at least `ALSO_MIN` times for this word -- and no
    form already on the card is the same spelling under `oe.fold`.  The spelling is
    Wiktionary's; none is typed here;
  · a noun's declension is on its forms line (strong a-stem, weak, strong consonant stem),
    as its Wiktionary table names it -- not in the label, which is part of the English side:
    bearn and ċild are both "child", and two labels that differed only by "a-stem" and
    "z-stem" would have passed for two different questions;
  · a bracket of the English side that prints the card's own headword is wrapped in
    `.uc-eg`, which the type's CSS hides under "Say it in Old English" (swā's gloss said
    'often doubled as "swā swā"'), and a "compare Old Norse þat" is dropped.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from oe import fold
from extract import plain
from oe_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, BANDS

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'oldenglish'
COLOR = '#004E30'
FIELDS = ['OE', 'IPA', 'Word', 'English', 'Forms', 'Modern', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'article': 'article',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep': 'preposition',
            'prep_phrase': 'phrase', 'proverb': 'proverb'}
GENDER = {'m': 'masculine', 'f': 'feminine', 'n': 'neuter', 'mf': 'masculine or feminine',
          'mn': 'masculine or neuter', 'fn': 'feminine or neuter', 'mfn': 'any gender'}
ROMAN = {'I': 'I', 'II': 'II', 'III': 'III', 'IV': 'IV', 'V': 'V', 'VI': 'VI', 'VII': 'VII'}

WORD = ('<div class="uc-word">{{OE}}</div>'
        '{{#IPA}}<div class="uc-ipa">{{IPA}}</div>{{/IPA}}')
ASK = '<div class="uc-ask">Say it in Old English</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
MODERN = '{{#Modern}}{{Modern}}{{/Modern}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_OE = WORD
BACK_OE = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + MODERN + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + MODERN + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()
E = html.escape


# ---- which entries, in which order ----------------------------------------------------
# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here (mǣre "boundary"
# and mǣre "famous" are two words; Ælfric's is the second).
ETYMS = {
    'mǣre': ['2'],
}

# THE PART OF SPEECH TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD_POS = {
    'swā': ['adv', 'conj', 'pron'],
    'ǣr': ['adv', 'conj', 'prep', 'adj'],
    'ōþer': ['adj', 'num'],
    'þæt': ['conj', 'pron'],
    'sē': ['article', 'det', 'pron'],
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the sense the corpus uses.
LEAD = {
    'hǣlend': 'savior',       # Ælfric's Hǣlend is "the Saviour", not a physician
    'lāc': 'gift, offering, sacrifice',
}

SYNONYM = re.compile(r'^synonym of (\S+)$', re.I)


def entries_for(L, lex):
    ents = list(L['entries'])
    groups = []
    for e in ents:
        if e['etym'] not in groups:
            groups.append(e['etym'])
    keep = ETYMS.get(L['word'], groups[:1])
    ents = [e for e in ents if e['etym'] in keep]
    order = LEAD_POS.get(L['word'])
    if order:
        ents.sort(key=lambda e: order.index(e['pos']) if e['pos'] in order else 99)
    out, seen = [], {}
    for e in ents:
        if e['pos'] in seen:
            out[seen[e['pos']]]['glosses'] += e['glosses']
            continue
        seen[e['pos']] = len(out)
        out.append(dict(e, glosses=list(e['glosses'])))
    return out[:3]


def gloss_list(e, word, lex):
    gl, seen = [], set()
    for g in e['glosses']:
        if g['weak'] and gl:
            continue
        t = re.sub(r'[;,]?\s*compare [^()]*(?=\))', '', g['g'])     # "(…; compare Old Norse þat, Dutch dat)"
        t = re.sub(r'\s*[:;,]\s*$', '', t).strip()
        m = SYNONYM.match(t)
        if m and m.group(1) in lex:                 # "synonym of missenlīċ": say what it means
            t = lex[m.group(1)]['entries'][0]['glosses'][0]['g']
        if t and t not in seen:
            seen.add(t)
            gl.append(t)
    lead = LEAD.get(word)
    if lead:
        gl.sort(key=lambda x: not x.startswith(lead))
    return gl[:3]


def label(e):
    lab = POS_NAME.get(e['pos'], e['pos'])
    if e['pos'] == 'noun' and e['gender'] in GENDER:
        lab += ', ' + GENDER[e['gender']]
    if e['pos'] == 'verb':
        st, cl = e.get('strength', ''), e.get('cls', '')
        if st == 'strong' and cl in ROMAN:
            lab += f', strong class {cl}'
        elif st == 'weak' and cl in ('1', '2', '3'):
            lab += f', weak class {cl}'
        elif st in ('irregular', 'anomalous'):
            lab += ', irregular'
        elif st == 'preterite-present':
            lab += ', preterite-present'
    return lab


BRACKET = re.compile(r'\s*\([^()]*\)')


def gloss_html(g, word):
    """A gloss as HTML.  A bracket that prints the card's own headword is wrapped in `.uc-eg`:
    the English side is the QUESTION of the English -> Old English card, and nothing on it may
    spell the answer."""
    own = fold(word)
    out, at = [], 0
    for m in BRACKET.finditer(g):
        if own in {fold(t) for t in re.findall(r"[^\W\d_]+", m.group(0))} and \
                re.search('[þðæǣāēīōūȳċġ]', m.group(0)):
            out.append(E(g[at:m.start()]))
            out.append(f'<span class="uc-eg">{E(m.group(0))}</span>')
            at = m.end()
    out.append(E(g[at:]))
    return ''.join(out)


def english(ents, word, lex):
    parts, shown = [], set()
    for e in ents:
        gl = gloss_list(e, word, lex)
        if not gl or all(x in shown for x in gl):
            continue
        shown.update(gl)
        body = (f'<div class="uc-gl">{gloss_html(gl[0], word)}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{gloss_html(x, word)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label(e))}</div>{body}</div>')
    return ''.join(parts)


# ---- forms -----------------------------------------------------------------------------
def cells(rows, *need, skip=()):
    out = []
    for form, t in rows:
        T = set(t)
        if all(n in T for n in need) and not (T & set(skip)) and form not in out:
            out.append(form)
    return out


def fi(lab, forms):
    if not forms:
        return ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(lab)}</span>{E(", ".join(forms))}</span>'


def ptc(vt):
    p = vt.get('ptc_past', [])
    ge = [x for x in p if x.startswith('ġe')]
    return ge[:1] or p[:1]


def forms_line(e):
    bits = []
    if e['pos'] == 'noun':
        gs = cells(e['rows'], 'genitive', 'singular')[:1]
        pl = cells(e['rows'], 'nominative', 'plural')[:1]
        bits = [fi('genitive', gs), fi('plural', pl),
                fi('declension', [e['ncls']] if e.get('ncls') else [])]
    elif e['pos'] == 'verb' and e.get('vt'):
        vt = e['vt']
        bits = [fi('past', vt.get('past_thi', [])[:1]), fi('past plural', vt.get('past_pl', [])[:1]),
                fi('participle', ptc(vt))]
    elif e['pos'] == 'adj':
        hf = e.get('head_forms', {})
        bits = [fi('comparative', hf.get('comparative', [])[:1]),
                fi('superlative', hf.get('superlative', [])[:1])]
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


ALSO_MIN = 5
ALSO_MAX = 6
SHOWN = re.compile(r'class="uc-(?:fl">[^<]*</span>|cj-f">)([^<]*)<')


def also(L, ents, shown_html, texts):
    """The spellings the corpus prints for this word that no form on its card is (see the
    header): Wiktionary files each under the word AND the corpus has it `ALSO_MIN` times."""
    word = L['word']
    have = {fold(word)}
    for m in SHOWN.finditer(shown_html):
        for x in re.findall(r"[^\W\d_]+(?:-[^\W\d_]+)*", html.unescape(m.group(1))):
            have.add(fold(x))
    cands = {}
    for sp in list(L.get('spellings', [])) + [a for e in ents for a in e['alts']]:
        k = fold(sp)
        if k in have or re.search('[\u16a0-\u16ff]', sp) or ' ' in sp:
            continue
        n = texts['count'].get((k, word), 0)
        if n >= ALSO_MIN:
            cands.setdefault(k, []).append(sp)
    out = []
    for k, sps in cands.items():
        # of two Wiktionary spellings the fold makes one, the one the corpus prints
        best = sorted(set(sps), key=lambda x: (plain(x) != texts['surface'].get(k), x))[0]
        out.append((-texts['count'][(k, word)], best))
    return [sp for _, sp in sorted(out)[:ALSO_MAX]]


def also_html(forms):
    if not forms:
        return ''
    return (f'<div class="uc-also"><span class="uc-fl">also in the texts</span>'
            f'{E(", ".join(forms))}</div>')


def row(lab, forms):
    if not forms:
        return ''
    return (f'<div class="uc-cjr"><span class="uc-cj-p">{E(lab)}</span>'
            f'<span class="uc-cj-f">{E(", ".join(forms))}</span></div>')


def block(head, rows):
    rows = [r for r in rows if r]
    if not rows:
        return ''
    return f'<div class="uc-cj"><div class="uc-cjh">{E(head)}</div>{"".join(rows)}</div>'


CASES = ('nominative', 'accusative', 'genitive', 'dative')
CASES_I = CASES + ('instrumental',)
GENDERS = ('masculine', 'feminine', 'neuter')
HEAD_ONLY = {'comparative', 'superlative', 'adverb'}


def halves(R):
    """A declined word's table as (strong, weak).  An adjective's table is its strong
    declension and then its weak one; the weak half begins where the FIRST cell's tags come
    round again after other cells have intervened -- not at the next row with those tags,
    which is only that cell's second form (sē, þē).  A third run (a variant paradigm, as
    under miċel) is left out.  A word with one declension (sē, þēs) has no weak half."""
    R = [r for r in R if not set(r[1]) & HEAD_ONLY]
    if not R:
        return [], []
    starts = [i for i in range(len(R)) if R[i][1] == R[0][1] and (i == 0 or R[i - 1][1] != R[0][1])]
    cut = starts[1:3] + [len(R), len(R)]
    return R[:cut[0]], R[cut[0]:cut[1]]



def table_html(e):
    R = e['rows']
    if e['pos'] == 'verb':
        vt = e.get('vt')
        if not vt:
            return ''
        g = vt.get
        blocks = [
            block('present', [row('iċ', g('pres_fir')), row('þū', g('pres_sec')),
                              row('hē, hēo, hit', g('pres_thi')), row('wē, ġē, hīe', g('pres_pl'))]),
            block('past', [row('iċ', g('past_fir')), row('þū', g('past_sec')),
                           row('hē, hēo, hit', g('past_thi')), row('wē, ġē, hīe', g('past_pl'))]),
            block('subjunctive', [row('present singular', g('subj_pres_sg')),
                                  row('present plural', g('subj_pres_pl')),
                                  row('past singular', g('subj_past_sg')),
                                  row('past plural', g('subj_past_pl'))]),
            block('other forms', [row('infinitive', g('inf')), row('to …', g('inf2')),
                                  row('imperative sg.', g('imp_sg')), row('imperative pl.', g('imp_pl')),
                                  row('present participle', g('ptc_pres')),
                                  row('past participle', g('ptc_past'))]),
        ]
    elif e['pos'] == 'noun':
        blocks = [block(n, [row(c, cells(R, c, n)) for c in CASES]) for n in ('singular', 'plural')]
    elif e['pos'] in ('adj', 'det', 'article', 'pron', 'num'):
        strong, weak = halves(R)
        genders = [x for x in GENDERS if cells(strong, x)]
        numbered = any(set(t) & {'singular', 'plural', 'dual'} for _, t in strong)
        if genders and not numbered:
            # declined by gender with no number at all (hwā, hwæt): one block, a row a cell
            seen, rows_ = [], []
            for _, t in strong:
                key = tuple(x for x in CASES_I + GENDERS if x in t)
                if key in seen or not set(key) & set(CASES_I):
                    continue
                seen.append(key)
                rows_.append(row(', '.join(key), [f_ for f_, t2 in strong
                                                   if tuple(x for x in CASES_I + GENDERS if x in t2) == key]))
            blocks = [block('forms', rows_)]
        elif genders:
            blocks = []
            for name, half in (('strong ' if weak else '', strong), ('weak ', weak)):
                if not half:
                    continue
                sg = [block(f'{name}{x} singular', [row(c, cells(half, c, x, 'singular')) for c in CASES_I])
                      for x in genders]
                if any(sg):
                    blocks += sg
                    blocks.append(block(f'{name}plural', [row(c, cells(half, c, 'plural')) for c in CASES_I]))
                else:                                  # the plural only, by gender: twēġen, twā, tū
                    blocks += [block(f'{name}{x} plural', [row(c, cells(half, c, x, 'plural')) for c in CASES_I])
                               for x in genders]
        else:
            sg = [row(c, cells(R, c, skip=('plural', 'dual'))) for c in CASES]
            pl = [row(c, cells(R, c, 'plural')) for c in CASES]
            blocks = [block('forms', sg), block('plural', pl)]
    else:
        return ''
    blocks = [b for b in blocks if b]
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>' if blocks else ''


def modern_html(ents, word):
    m = next((e['modern'] for e in ents if e['modern']), '')
    if not m or fold(m) == fold(word):
        return ''
    return (f'<div class="uc-mod"><span class="uc-fl">Modern English descendant</span>'
            f'{E(m)}</div>')


# ---- examples --------------------------------------------------------------------------
def mark(sentence, hits):
    hs = set(hits)
    out = []
    for piece in re.split(r"([^\W\d_]+)", sentence):
        if piece and fold(piece) in hs:
            out.append(f'<b>{E(piece)}</b>')
        else:
            out.append(E(piece))
    return ''.join(out)


def examples_html(exs):
    return ''.join(f'<div class="uc-exi"><div class="uc-exz">{mark(s, hits)}</div>'
                   f'<div class="uc-exe">{E(en)}</div><div class="uc-exsrc">{E(ref)}</div></div>'
                   for s, en, hits, ref in exs)


def text_counts(lex):
    """(folded token, lemma) -> how often the corpus prints it for that lemma, and each folded
    token's commonest spelling: what `also` asks."""
    freq = json.load(open('freq.json', encoding='utf-8'))
    count = {}
    for key, (n, hs) in freq.items():
        h = max(hs, key=lambda x: (lex[x]['freq'], x))
        k = key.rstrip('^')
        count[(k, h)] = count.get((k, h), 0) + n
    return {'count': count, 'surface': json.load(open('surface.json', encoding='utf-8'))}


def build(rows, lex, exs):
    cards, entries = [], []
    texts = text_counts(lex)
    for r in rows:
        L = lex[r['word']]
        ents = entries_for(L, lex)
        if not ents:
            continue
        main = ents[0]
        word = L['word']
        ipa = next((e['ipa'] for e in ents if e['ipa']), '')
        ex = exs.get(word, [])
        forms = forms_line(main)
        table = next((t for t in map(table_html, ents) if t), '')
        cards.append({'sub': '', 'fields': {
            'OE': E(word),
            'IPA': E(ipa),
            'Word': word,
            'English': english(ents, word, lex),
            'Forms': forms + also_html(also(L, ents, forms + table, texts)),
            'Modern': modern_html(ents, word),
            'Table': table,
            'Examples': examples_html(ex),
        }})
        F = cards[-1]['fields']
        shown = {fold(word)}
        for m in SHOWN.finditer(F['Forms'] + F['Table']):
            shown.update(fold(x) for x in re.findall(r"[^\W\d_]+(?:-[^\W\d_]+)*", html.unescape(m.group(1))))
        entries.append({'word': word, 'pos': main['pos'], 'examples': len(ex),
                        'aelfric': sum(1 for x in ex if x[3].startswith('Ælfric')),
                        'modern': bool(F['Modern']), 'ipa': bool(ipa), 'shown': sorted(shown),
                        'also': 'uc-also' in F['Forms'],
                        'tabled': bool(F['Table'])})
    return cards, entries


def coverage(entries, upto=None):
    """The share of the corpus's running words that are a form some card (of the first `upto`)
    prints -- headword, key forms, table, the texts' spellings -- under `oe.fold`."""
    toks = json.load(open('tokens.json', encoding='utf-8'))
    shown = {k for e in entries[:upto] for k in e['shown']}
    return sum(n for k, n in toks.items() if k in shown) / sum(toks.values())


def desc(entries, n):
    a, b = BANDS[LEVEL]
    ex3 = sum(1 for e in entries if e['examples'] == 3)
    ex0 = sum(1 for e in entries if e['examples'] == 0)
    exa = sum(1 for e in entries if e['aelfric'])
    mod = sum(1 for e in entries if e['modern'])
    nouns = sum(1 for e in entries if e['pos'] == 'noun')
    verbs = sum(1 for e in entries if e['pos'] == 'verb')
    adjs = sum(1 for e in entries if e['pos'] == 'adj')
    also_n = sum(1 for e in entries if e['also'])
    noipa = sum(1 for e in entries if not e['ipa'])
    cov = coverage(entries)
    band = ('the 500 commonest words of Old English prose' if a == 1 else
            f'the words ranked {a:,} to {b:,} in frequency in Old English prose, after the '
            f'{a - 1:,} the levels below this one teach')
    return (
        "Both study directions in one deck: Old English → English (see the Old English, recall "
        "the meaning) and English → Old English (see an English meaning, recall the Old English). "
        "Each direction is a card of its own with its own schedule, so recognising a word and "
        f"producing it are learnt separately. {n} words: {band}. "
        "WHERE THESE WORDS COME FROM, since it matters: Old English has no examination and no "
        "graded word list, so a level here is a band of frequency, not a stage of conversation. "
        "The words were counted over about 112,000 words of Old English prose — Ælfric's Catholic "
        "Homilies (Thorpe's 1844 edition), the reading texts of Sweet's Anglo-Saxon Primer and "
        "Tatoeba's Old English sentences — by the WHOLE word, every form of a noun or a verb "
        "added together. Ælfric was a "
        "preacher and most surviving prose is religious, so God, Christ, heaven and the apostles "
        "come early; the vocabulary of the poetry is not here. "
        "Every headword is printed as modern editions and Wiktionary print it: a macron marks a "
        "long vowel (stān, 'stone') and a dot marks ċ and ġ where they are said 'ch' and 'y' "
        "(iċ, ġēar), with a reconstructed pronunciation in IPA beneath"
        + (f" ({noipa} words have none: Wiktionary gives none)" if noipa else "") +
        "; the Old English Alphabet "
        "deck, the first in this collection, teaches how to read both. There is no speaker, "
        f"because no voice reads Old English. The {nouns} nouns show their gender, "
        f"genitive, plural and declension; the {verbs} verbs show their class and their principal "
        "parts — past, past plural, past participle — which is how a strong verb is learnt; the "
        f"All forms fold holds the paradigm: a noun's four cases, a verb's present, past and "
        f"subjunctive, and for the {adjs} adjectives the strong and the weak declension. "
        "THE TEXTS DO NOT SPELL AS THE DICTIONARY DOES: Wiktionary prints early West Saxon and "
        f"Ælfric wrote late, so {also_n} cards carry a line, 'also in the texts', with the "
        "spellings the corpus really prints for that word (forþan for forþon, þisum for þissum) — "
        "only those Wiktionary itself files under the word. With them, the forms printed on these "
        f"cards are {cov:.0%} of all the running words of the corpus. "
        f"{mod} of the {n} words show their Modern English descendant "
        "where one survives (cyning → king), labelled as a descendant, not a translation. "
        + (f"Sentences come with {n - ex0} of the {n} words, three apiece for {ex3} of them, the "
           f"word picked out in colour and the source under each. On {exa} cards at least one is "
           "Ælfric's own, in Thorpe's spelling — no macron, no dot, ð as often as þ, an acute here "
           "and there — with Thorpe's facing translation of 1844 and the page it stands on. The "
           "rest are Tatoeba's, by sentence number: written by that site's contributors in our own "
           "time, short and plain, and not evidence of the language. " if ex0 < n else "") +
        "Sources. Meanings, gender, class, forms, pronunciation and descendants: English "
        "Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Frequency: counted by this "
        "deck's generator over B. Thorpe (ed.), The Homilies of the Anglo-Saxon Church, vol. 1 "
        "(1844) and H. Sweet, An Anglo-Saxon Primer, 8th ed. (1905), both public domain via "
        "Project Gutenberg, and Tatoeba. Example sentences: Thorpe's edition and translation "
        "(public domain) and Tatoeba (tatoeba.org), CC BY 2.0 FR."
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
    a, b = BANDS[LEVEL]
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': (f'The {n} commonest words · both directions, as two cards per word' if a == 1
                     else f'{n} words, ranked {a:,}–{a + n - 1:,} · both directions, as two cards per word'),
        'desc': desc(entries, n), 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['old english', 'anglo-saxon', 'vocabulary', LEVEL],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Old English vocabulary',
            'fields': FIELDS,
            'cards': [
                {'name': 'Old English → English', 'front': FRONT_OE, 'back': BACK_OE},
                {'name': 'English → Old English', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Old English')
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
