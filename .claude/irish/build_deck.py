#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Hindi shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss
is corrected both ways at once and each direction keeps its own schedule.
Card 1 is IRISH -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword, with Wiktionary's IPA beneath it, EACH TRANSCRIPTION LABELLED
    WITH ITS DIALECT -- Irish has no standard pronunciation (the Official
    Standard fixes spelling and grammar only), and Wiktionary gives Munster,
    Connacht and Ulster separately, so the card prints what it gives rather
    than choosing one and calling it Irish;
  · the meanings, grouped by part of speech, a noun's GENDER in its label --
    it decides how the article mutates the noun (`an bhean`, `an fear`);
  · one line of key forms: a noun's genitive, plural and form with the article;
    an adjective's comparative and plural; a verb's past, verbal noun and
    future -- the past from the table, or for an irregular verb from
    Wiktionary's own entry for it (`rinne` "past of déan");
  · the forms behind a fold: a noun with and without the article, and its
    lenited and eclipsed forms; a regular verb's past, present, future and
    conditional by person; a preposition's forms with each pronoun (`agam`,
    `agat`, `aige` ...).  An irregular verb whose table Wiktionary's extraction
    garbles (`déan`, `faigh`, `abair`, `tabhair`, `téigh`, `ith`) shows no table
    rather than a wrong one -- its key forms are still on the card;
  · up to three Tatoeba sentences, the word picked out, with a speaker.

The speaker reads the `Word` field.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ga import low, plain, PRON
from irish_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'irish'
COLOR = '#2A8424'
FIELDS = ['Irish', 'IPA', 'Word', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'article': 'article',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep': 'preposition',
            'prep_phrase': 'phrase', 'proverb': 'proverb', 'name': 'proper noun',
            'contraction': 'contraction'}
GENDER = {'m': 'masculine', 'f': 'feminine'}
DIALECTS = ['Connacht', 'Galway', 'Mayo', 'Cois-Fharraige', 'Ulster', 'Donegal', 'Munster',
            'Kerry', 'Cork', 'Waterford']

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = ('<div class="uc-word">{{Irish}}' + SAY + '</div>'
        '{{#IPA}}<div class="uc-ipa">{{IPA}}</div>{{/IPA}}')
ASK = '<div class="uc-ask">Say it in Irish</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_GA = WORD
BACK_GA = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape

# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here.  Irish
# homographs from unrelated sources are many -- `sí` "she" and "fairy mound",
# `inis` "to tell" and "island", `má` "if" and "plain" -- and a beginner's card
# that offers all of them teaches the noise.  Each override with its reason:
ETYMS = {
    'an': ['1', '2'],        # the article AND the question particle, both everyday
    'is': ['2'],             # the copula; the other entry is the abbreviation "IS" (AI)
    'do': ['3', '4'],        # "to, for" AND "your"
    'ní': ['3', '1'],        # "not" AND "thing"
    'sí': ['2'],             # "she"; 1 is "fairy mound"
    'sé': ['1', '2'],        # "he" AND "six"
    'ná': ['1', '2'],        # "don't" AND "nor"
    'trí': ['1', '2'],       # "three" AND "through"
    'má': ['2'],             # "if"; 1 is "plain (land)"
    'inis': ['2'],           # "to tell"; 1 is "island" (literary)
    'dóigh': ['2'],          # "hope, likelihood" (is dóigh liom); 1 is "to burn"
    'céad': ['1', '2'],      # "hundred" AND "first"
    'éasca': ['2'],          # "easy"; 1 is "moon" (literary)
    'glan': ['1', '2'],      # "clean" AND "to clean"
    'dún': ['2', '1'],       # "close" AND "fort"
    'aird': ['1', '2'],      # "direction" AND "attention"
    'míle': ['1', '2'],      # "thousand" AND "mile"
    'os': ['2'],             # "over, above"; 1 is "deer" (literary)
    'glac': ['2'],           # "to take, accept"; 1 is "clutch, handful"
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
# Every lead is a gloss Wiktionary itself lists for the word, moved to the front -- never
# a gloss written here.
LEAD = {
    'saor': 'cheap', 'daor': 'expensive', 'ríomhaire': 'computer', 'teanga': 'language',
    'airgead': 'money', 'fadhb': 'problem', 'post': 'job', 'lón': 'lunch', 'éasca': 'easy',
    'glasra': 'vegetable', 'tinn': 'sick', 'tinneas': 'sickness', 'botún': 'mistake',
    'deas': 'nice', 'iarr': 'to ask', 'leath': 'half', 'fáth': 'reason', 'alt': 'article',
    'tuilleadh': 'more', 'seoladh': 'address', 'oideachas': 'education', 'déanach': 'late',
    'luath': 'early', 'coinne': 'appointment',
}

IPA_OK = re.compile(r'^/[^()/;]+/(?: ~ /[^()/;]+/)*$')

POINTER = re.compile(r'^(?:alternative|obsolete) (?:form|spelling) of |^inflection of ', re.I)


LED = set()


def entries_for(row, lex):
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    ents = [e for e in L['entries'] if any(not g['weak'] and g['g'] for g in e['glosses'])] \
        or L['entries']
    ents = [e for e in ents if e['pos'] != 'name' or len(ents) == 1]
    groups = []
    for e in ents:
        if e.get('etym', '') not in groups:
            groups.append(e.get('etym', ''))
    keep = ETYMS.get(L['word'], groups[:1])
    ents = sorted([e for e in ents if e.get('etym', '') in keep],
                  key=lambda e: keep.index(e.get('etym', '')))
    # a PARTICLE reading goes after the word's other readings: `ag` is "at" before it is
    # the progressive particle, and a card should open on the meaning a learner looks up
    ents = sorted(ents, key=lambda e: e['pos'] == 'particle' and len(ents) > 1)
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
            t = re.sub(r'\s*[:;,]\s*$', '', g['g'])
            if t and t not in seen and not POINTER.match(t):
                seen.add(t)
                gl.append(t)
        lead = LEAD.get(word)
        if lead and any(lead in x for x in gl):
            gl.sort(key=lambda x: lead not in x)
            LED.add(word)
        gl = gl[:3]
        if not gl or all(x in shown for x in gl):
            continue
        shown.update(gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label)}</div>{body}</div>')
    return ''.join(parts)


def ipa_html(ents):
    seen = {}
    for e in ents:
        for ipa, tags in e['ipa']:
            # a transcription, not a note: `/ɡə/(as if spelled go; do and go ...` is dropped
            if not IPA_OK.match(ipa):
                continue
            d = [t.replace('-', ' ') for t in tags if t in DIALECTS]
            seen.setdefault(ipa, [])
            for x in d:
                if x not in seen[ipa]:
                    seen[ipa].append(x)
        if seen:
            break
    out = []
    for ipa, d in list(seen.items())[:3]:
        lab = f'<span class="uc-dial">{E(", ".join(d))}</span>' if d else ''
        out.append(f'<span class="uc-ip">{E(ipa)}{lab}</span>')
    return ''.join(out)


# ---- forms -----------------------------------------------------------------------------
NOISE = {'error-unrecognized-form', 'archaic', 'dialectal', 'habitual', 'subjunctive',
         'autonomous', 'dependent', 'relative', 'emphatic', 'Munster', 'Ulster', 'Connacht',
         'error-unknown-tag', 'alternative', 'obsolete', 'nonstandard'}


def cell(table, *need, skip=()):
    for t in table:
        tags = set(t['t'])
        if all(n in tags for n in need) and not (tags & (NOISE | set(skip))):
            return t['f']
    return ''


def fi(label, v):
    if not v:
        return ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(v)}</span>'


def bare_verb(form):
    """`cheannaigh sé` -> cheannaigh: a table's analytic cell without its pronoun."""
    ws = form.split()
    return ' '.join(ws[:-1]) if len(ws) > 1 and low(ws[-1]) in PRON else form


def verb_past(L, e):
    if L.get('past'):
        return L['past']
    if table_ok(e):
        return bare_verb(cell(e['table'], 'indicative', 'past', 'singular', 'third-person'))
    return ''


def table_ok(e):
    """A verb's table is shown only when it is ONE clean table: Wiktionary's extraction of the
    irregular verbs' pages merges a dialect table into the standard one (`déan` gives `ním`
    and no past at all), and a beginner's card must not teach that as the verb."""
    return (e['pos'] == 'verb' and e['ttag'] in ('conjugation-1', 'conjugation-2', 'irregular')
            and bool(cell(e['table'], 'indicative', 'past', 'singular', 'third-person')))


def forms_line(L, e, word):
    h, tb, bits = e['head'], e['table'], []
    if e['pos'] == 'noun':
        gen = h.get('genitive singular', '')
        pl = h.get('nominative plural', '')
        art = cell(tb, 'definite', 'nominative', 'singular')
        bits = [fi('genitive', gen), fi('plural', pl), fi('the', art)]
    elif e['pos'] == 'adj':
        comp = h.get('comparative', '')
        bits = [fi('comparative', ('níos ' + comp) if comp else ''), fi('plural', h.get('plural', ''))]
    elif e['pos'] == 'verb':
        vn = h.get('verbal noun', '').replace('(', '').replace(')', '') if '(' not in \
            h.get('verbal noun', '') else h['verbal noun'].split('(')[0]
        bits = [fi('past', verb_past(L, e)), fi('verbal noun', vn),
                fi('future', h.get('future analytic', ''))]
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


def row(label, v):
    if not v:
        return ''
    return (f'<div class="uc-cjr"><span class="uc-cj-p">{E(label)}</span>'
            f'<span class="uc-cj-f">{E(v)}</span></div>')


def block(head, rows):
    rows = [r for r in rows if r]
    if not rows:
        return ''
    return f'<div class="uc-cj"><div class="uc-cjh">{E(head)}</div>{"".join(rows)}</div>'


PERSONS = [('mé', ('first-person', 'singular')), ('tú', ('second-person', 'singular')),
           ('sé, sí', ('third-person', 'singular')), ('muid', ('first-person', 'plural')),
           ('sibh', ('second-person', 'plural')), ('siad', ('third-person', 'plural'))]


def tense(tb, *t):
    return [row(p, cell(tb, *(t + need), skip=('imperative',) if 'imperative' not in t else ()))
            for p, need in PERSONS]


def table_html(L, e):
    tb, h = e['table'], e['head']
    if e['pos'] == 'verb' and table_ok(e):
        blocks = [
            block('past', tense(tb, 'indicative', 'past')),
            block('present', tense(tb, 'indicative', 'present')),
            block('future', tense(tb, 'indicative', 'future')),
            block('conditional', tense(tb, 'conditional')),
            block('imperative', [row('you (one)', cell(tb, 'imperative', 'second-person', 'singular')),
                                 row('you (all)', cell(tb, 'imperative', 'second-person', 'plural'))]),
            block('other forms', [row('verbal noun', h.get('verbal noun', '')),
                                  row('past participle', h.get('past participle', ''))]),
        ]
    elif e['pos'] == 'noun':
        blocks = [block('singular', [row('a, one', L['word']),
                                     row('of a', h.get('genitive singular', '')),
                                     row('the', cell(tb, 'definite', 'nominative', 'singular')),
                                     row('of the', cell(tb, 'definite', 'genitive', 'singular'))]),
                  block('plural', [row('some', h.get('nominative plural', '')),
                                   row('the', cell(tb, 'definite', 'nominative', 'plural')),
                                   row('of the', cell(tb, 'definite', 'genitive', 'plural'))]),
                  block('mutated', [row('lenited', cell(tb, 'lenition')),
                                    row('eclipsed', cell(tb, 'eclipsis'))])]
    elif e['pos'] == 'prep':
        blocks = [block('with a pronoun', [
            row('me', cell(tb, 'first-person', 'singular')),
            row('you (one)', cell(tb, 'second-person', 'singular')),
            row('him, it', cell(tb, 'third-person', 'singular', 'masculine')),
            row('her, it', cell(tb, 'third-person', 'singular', 'feminine')),
            row('us', cell(tb, 'first-person', 'plural')),
            row('you (all)', cell(tb, 'second-person', 'plural')),
            row('them', cell(tb, 'third-person', 'plural'))])]
    elif e['pos'] == 'adj':
        blocks = [block('forms', [row('masculine', cell(tb, 'masculine', 'nominative', 'singular')),
                                  row('feminine', cell(tb, 'feminine', 'nominative', 'singular')),
                                  row('plural', h.get('plural', '')),
                                  row('comparative', ('níos ' + h['comparative'])
                                      if h.get('comparative') else '')])]
    else:
        return ''
    blocks = [b for b in blocks if b]
    # a table of one row says nothing the forms line does not
    if sum(b.count('uc-cjr') for b in blocks) < 2:
        return ''
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>'


# ---- examples --------------------------------------------------------------------------
def mark(sentence, hits):
    hs = {low(h) for h in hits}
    out = []
    for piece in re.split(r"([A-Za-zÁÉÍÓÚáéíóú][A-Za-zÁÉÍÓÚáéíóú'’\-]*)", sentence):
        core = piece.rstrip("'-")
        if piece and low(core) in hs:
            out.append(f'<b>{E(core)}</b>{E(piece[len(core):])}')
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
        L = lex[r['via']] if r.get('via') else lex[r['key']]
        main = ents[0]
        word = r['word']
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Irish': f'<div class="uc-word">{E(word)}</div>',
            'IPA': ipa_html(ents),
            'Word': word,
            'English': english(ents, word),
            'Forms': forms_line(L, main, word),
            'Table': table_html(L, main),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex), 'ipa': bool(cards[-1]['fields']['IPA']),
                        'gender': main['gender']})
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
        f"separately. {n} words for a beginner, aligned to {LEVEL.upper()} of the Common European "
        f"Framework of Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
        f"is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: Irish has a CEFR examination, Teastas "
        "Eorpach na Gaeilge (TEG), but it publishes syllabuses of topics and grammar rather than "
        "a graded word list, so this deck is not TEG's vocabulary or any examination's, and does "
        f"not claim to be. It is assembled from two things that can be stated. {from_inv} of the "
        f"{n} come from a vocabulary written for the level's scope — {SC['topics']} — and the "
        f"other {n - from_inv} are the commonest remaining words, counted by the WHOLE word "
        "(every form of a noun or a verb together) over two corpora: a treebank of written Irish "
        "and a collection of everyday sentences, a word joining only if the everyday sentences "
        "use it. The cards are dealt by that frequency, so the words you meet most often come "
        "first. Spellings are the Official Standard's (An Caighdeán Oifigiúil), and verbs are "
        "given, as Irish dictionaries give them, by their command form (déan, 'do!'). Under each "
        "headword is its pronunciation in IPA, labelled with the dialect it belongs to — Irish "
        "has no single standard pronunciation, and Connacht, Munster and Ulster differ. "
        f"The {nouns} nouns show their gender, which decides how the article changes the noun "
        "(an bhean, 'the woman'; an fear, 'the man'), with their genitive and plural, and behind "
        "the All forms fold their forms with the article and their lenited and eclipsed forms; "
        f"the {verbs} verbs show their past, verbal noun and future, and a regular verb its "
        "tenses by person; a preposition shows its forms with each pronoun (agam, agat, aige …). "
        + EX_NOTE + ", with the word picked out in colour and a speaker beside the sentence and the "
        "headword. Sources. Level: the Common European Framework of Reference (Council of Europe), "
        "global scale. Meanings, gender, forms and pronunciation: English Wiktionary, via the "
        "kaikki.org extraction (CC BY-SA 4.0). Frequency: the Irish Dependency Treebank "
        "(Universal Dependencies UD_Irish-IDT, CC BY-SA 3.0) and Tatoeba. Example sentences: "
        "Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    exs = json.load(open(f('examples.json'), encoding='utf-8'))
    cards, entries = build(rows, lex, exs)
    words = {r['word'] for r in rows}
    stale = sorted(w for w in LEAD if w in words and w not in LED)
    if stale:
        raise SystemExit('LEAD names a gloss the word no longer has: ' + ', '.join(stale))
    DECK = DECK_IDS[LEVEL]
    for i, c in enumerate(cards, 1):
        c['id'] = f'u_{DECK}_{i}'
        c['type'] = TYPE_ID
    n = len(cards)
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': f'{n} words · both directions, as two cards per word',
        'desc': desc(entries, n), 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['irish', 'gaeilge', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
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
