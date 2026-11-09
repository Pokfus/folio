#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the shape of every language deck on the shelf.  The word
is a single record and the two directions are card TEMPLATES, so a corrected
gloss is corrected both ways at once and each direction keeps its own schedule.
Card 1 is LATIN -> ENGLISH, the direction a reader of Latin needs first.

WHAT A CARD CARRIES (the owner's decisions, 2026-11-09):
  · the headword with its MACRONS (`amō`, `rēgīna`), Wiktionary's spelling;
  · beneath it the DICTIONARY ENTRY a Latin learner looks a word up by: a
    verb's principal parts (`amō, amāre, amāvī, amātum`), a noun's genitive and
    gender (`rēx, rēgis m.`), an adjective's three genders (`bonus, bona,
    bonum`) or its genitive (`fēlīx, gen. fēlīcis`), with its declension or
    conjugation named;
  · the meanings, grouped by part of speech; a preposition's case in its label;
  · an adjective's comparative, superlative and adverb where Wiktionary has them;
  · the full TABLE behind a fold: a noun's six cases, an adjective's or
    pronoun's three genders by case, a verb's five indicative tenses, present
    subjunctive, imperative, infinitives and participles;
  · up to three Tatoeba sentences, the word picked out, with a speaker.

THE SPEAKER READS `Word`, the headword without its marks, in an ITALIAN voice
(`speechLang: it-IT`): almost no device carries a Latin voice, an engine given
`la` reads with whatever default it has -- usually English -- and an Italian
voice gives the Italianate church pronunciation, which is a real tradition of
spoken Latin.  The plan says so, and so does the deck's description.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from la import fold, macronless, kept, ALSO
from latin_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'latin'
COLOR = '#6F69D2'           # the shelf's measured hue (app.js `lang-latin`)
FIELDS = ['Latin', 'Parts', 'Key', 'Word', 'English', 'Forms', 'Table', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'prep': 'preposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'proverb': 'proverb'}
GENDER = {'m': 'masculine', 'f': 'feminine', 'n': 'neuter', 'mf': 'masculine or feminine',
          'c': 'common gender'}
GABBR = {'m': 'm.', 'f': 'f.', 'n': 'n.', 'mf': 'm./f.', 'c': 'c.'}
CASE_NAME = {'accusative': 'accusative', 'ablative': 'ablative', 'genitive': 'genitive',
             'dative': 'dative'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = ('<div class="uc-word">{{Latin}}' + SAY + '</div>'
        '{{#Parts}}<div class="uc-pp">{{Parts}}</div>{{/Parts}}')
ASK = '<div class="uc-ask">Say it in Latin</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_LA = WORD
BACK_LA = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one (read off A1).
LEAD = {
    'putō': 'think',          # first listed: "to clean, cleanse" (the root sense)
    'iubeō': 'command',       # first listed: "to authorize, to legitimate ..."
    'exercitus': 'army',      # first listed: "exercise"
    'perīculum': 'danger',    # first listed: "trial, experiment"
    'mūtō': 'change',         # first listed: "to move, remove"
}

# THE ONE PART OF SPEECH a card keeps, where Wiktionary files an unrelated sense under
# the same spelling: `brevis` "short" is also a noun "dactyl" and "breve", `ave` "hail!"
# also a noun "a greeting".
ONLY_POS = {'brevis': 'adj', 'ave': 'intj'}

# A GLOSS WRITTEN HERE for one part of speech, where Wiktionary's is a grammarian's
# description rather than a meaning.
GLOSS = {
    'ego': {'pron': ['I']},
    'suī': {'pron': ['himself, herself, itself, themselves (reflexive; no nominative)']},
    'an': {'conj': ['or, or rather, or indeed, or perhaps']},   # Wiktionary's own words; its first
                                                                 # glosses are bare sub-headings
}

# A gloss that is not a meaning: a sub-heading Wiktionary leaves bare ("direct",
# "indirect" under `an`), a usage note that begins with the word itself ("nihil or nil
# + the enclitic ..."), and on a level deck a sexual sense (`sciō` "to have slept with").
NOT_A_MEANING = re.compile(r'^(\?|direct|indirect|in (?:in)?direct questions|used\b.*|with (?:the )?(?:indicative|subjunctive|infinitive))$|\bsex\b|\bslept with\b', re.I)
LONG = 100      # a gloss longer than this is cut back (`shorten`)


def shorten(t):
    """A gloss over LONG characters ends at its last `;` or `,` before the limit that is
    outside parentheses: "A solar or sidereal day of about 24 hours, especially
    (historical) Roman dates reckoned from one midnight to the next" -> "A solar or
    sidereal day of about 24 hours".  What is kept is Wiktionary's own words, in its
    order; a gloss with no such boundary is kept whole."""
    if len(t) <= LONG:
        return t
    depth, cut = 0, 0
    for i, ch in enumerate(t[:LONG]):
        depth += ch in '(['
        depth -= ch in ')]'
        if ch in ';,' and depth == 0 and i > 12:
            cut = i
    return t[:cut] if cut else t


# ---- the dictionary entry ---------------------------------------------------------------
def hd(e, *need, skip=()):
    """The first head-line form carrying every tag in `need` (and none in `skip`)."""
    for h in e['head']:
        t = set(h['t'])
        if all(n in t for n in need) and not (t & set(skip)):
            return h['f']
    return ''


def cell(e, *need, skip=()):
    for t in e['table']:
        tags = set(t['t'])
        if all(n in tags for n in need) and not (tags & set(skip)):
            return t['f']
    return ''


def short_class(e):
    """The declension or conjugation, and whether the verb is deponent -- and nothing
    else of Wiktionary's head line, which for `sum` runs to "irregular conjugation,
    suppletive, no passive, no supine stem except in the future active participle,
    no gerund"."""
    c = re.sub(r'\s*\(.*?\)', '', e['cls'])
    c = c.replace('first/second-declension', 'first and second declension')
    keep = [p.strip() for p in c.split(',')
            if re.search(r'declension|conjugation', p) or p.strip() in ('deponent', 'semi-deponent')]
    return ', '.join(keep)


def voice(e):
    parts = [p.strip() for p in e['cls'].split(',')]
    return 'deponent' if 'deponent' in parts else 'semi-deponent' if 'semi-deponent' in parts else ''


def parts_html(e):
    w, pos = e['canon'], e['pos']
    bits, cls = [], short_class(e)
    if pos == 'verb':
        inf = hd(e, 'infinitive', 'present')
        # TWO PERFECTS WHERE WIKTIONARY GIVES TWO (`audeō`: ausī / ausus sum, the
        # semi-deponent's), both shown rather than one chosen
        perf = ' / '.join(dict.fromkeys(
            h['f'] for h in e['head'] if 'perfect' in h['t']
            and not set(h['t']) & {'infinitive', 'participle', 'passive'}))
        sup = hd(e, 'supine') or hd(e, 'participle', 'future') or hd(e, 'participle', 'perfect')
        bits = [x for x in (w, inf, perf, sup) if x]
    elif pos == 'noun':
        gen = hd(e, 'genitive')
        g = GABBR.get(e['gender'], '')
        bits = [w] + ([gen] if gen else [])
        if g:
            bits[-1] += ' ' + g + (' pl.' if e['pl'] else '')
    elif pos in ('adj', 'det', 'pron', 'num'):
        fe, ne, gen = hd(e, 'feminine'), hd(e, 'neuter'), hd(e, 'genitive')
        if fe and fe != w:
            bits = [w, fe] + ([ne] if ne else [])
        elif ne and ne != w:
            bits = [w, ne]
        elif gen:
            bits = [w, 'gen. ' + gen]
    if len(bits) < 2:
        return E(cls[:1].upper() + cls[1:]) if cls and pos in ('noun', 'verb', 'adj') else ''
    out = f'<span class="uc-ppw">{E(", ".join(bits))}</span>'
    if cls and pos in ('noun', 'verb', 'adj'):
        out += f'<span class="uc-cls">{E(cls)}</span>'
    return out


def forms_line(e):
    if e['pos'] not in ('adj', 'adv'):
        return ''
    bits = []
    for label, tag in (('comparative', 'comparative'), ('superlative', 'superlative'),
                       ('adverb', 'adverb')):
        x = hd(e, tag)
        if x:
            bits.append(f'<span class="uc-fi"><span class="uc-fl">{label}</span>{E(x)}</span>')
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


# ---- meanings ---------------------------------------------------------------------------
def english(ents, word=''):
    parts, shown = [], set()
    for e in ents:
        label = POS_NAME.get(e['pos'], e['pos'])
        if word and e['canon'] != word:          # a second headword (`ALSO`): `hīc` on `hic`
            label += ', ' + e['canon']
        if e['pos'] == 'noun' and e['gender'] in GENDER:
            label += ', ' + GENDER[e['gender']]
        if e['pos'] == 'noun' and e['pl']:
            label += ', plural only'
        if e['pos'] == 'prep' and e['cases']:
            label += ', with the ' + ' or '.join(CASE_NAME.get(c, c) for c in e['cases'])
        tv = {t for g in e['glosses'] for t in g['tags']}
        if e['pos'] == 'verb':
            if voice(e):
                label += ', ' + voice(e)
            if 'transitive' in tv and 'intransitive' not in tv:
                label += ', transitive'
            elif 'intransitive' in tv and 'transitive' not in tv:
                label += ', intransitive'
        gl, seen = [], set()
        for g in e['glosses']:
            if g['weak'] and gl:
                continue
            t = re.sub(r'\s*[:;,]\s*$', '', g['g'])
            if not t or NOT_A_MEANING.search(t) or (gl and fold(t).startswith(fold(word) + ' ')):
                continue
            if t.lower() not in seen:
                seen.add(t.lower())
                gl.append(t)
        if e['pos'] in GLOSS.get(word, {}):
            gl = list(GLOSS[word][e['pos']])
        gl = list(dict.fromkeys(shorten(x) for x in gl))
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


# ---- the table --------------------------------------------------------------------------
CASES = ['nominative', 'genitive', 'dative', 'accusative', 'ablative', 'vocative', 'locative']
PERSONS = [('I', ('first-person', 'singular')), ('you', ('second-person', 'singular')),
           ('he, she, it', ('third-person', 'singular')), ('we', ('first-person', 'plural')),
           ('you (pl.)', ('second-person', 'plural')), ('they', ('third-person', 'plural'))]


def row(label, form):
    if not form:
        return ''
    return (f'<div class="uc-cjr"><span class="uc-cj-p">{E(label)}</span>'
            f'<span class="uc-cj-f">{E(form)}</span></div>')


def block(head, rows):
    rows = [r for r in rows if r]
    if len(rows) < 2 and head not in ('imperative',):
        return ''
    return f'<div class="uc-cj"><div class="uc-cjh">{E(head)}</div>{"".join(rows)}</div>'


def gendered(e, case, num):
    forms = [cell(e, case, g, num) for g in ('masculine', 'feminine', 'neuter')]
    if not all(forms):
        return ''
    if forms[0] == forms[1] == forms[2]:
        return forms[0]
    if forms[0] == forms[1]:
        return f'{forms[0]} · {forms[2]} (n.)'
    return ' · '.join(forms)


def table_html(e):
    if not e['table']:
        return ''
    pos = e['pos']
    if pos == 'verb':
        # a deponent's present is tagged active (`loquor`), so skipping the passive suits both;
        # its perfect is a phrase (`locūtus` + sum), which the extract leaves out
        dep = voice(e) == 'deponent'
        tense = lambda t, mood='indicative': [row(p, cell(e, mood, t, *need, skip=('passive',)))
                                              for p, need in PERSONS]
        blocks = [
            block('present', tense('present')),
            block('imperfect', tense('imperfect')),
            block('future', tense('future')),
            block('perfect', tense('perfect')),
            block('pluperfect', tense('pluperfect')),
            block('present subjunctive', tense('present', 'subjunctive')),
            block('imperative', [row('you', cell(e, 'imperative', 'present', 'second-person', 'singular',
                                                  skip=('passive',))),
                                 row('you (pl.)', cell(e, 'imperative', 'present', 'second-person', 'plural',
                                                       skip=('passive',)))]),
            block('infinitives and participles', [
                row('present infinitive', cell(e, 'infinitive', 'present', skip=('passive',))),
                row('perfect infinitive', cell(e, 'infinitive', 'perfect', 'active', skip=('potential',))),
                row('present participle', cell(e, 'participle', 'present', 'active')),
                row('perfect participle', cell(e, 'participle', 'perfect', skip=('potential', 'future'))),
                row('future participle', cell(e, 'participle', 'future', 'active', skip=('perfect',))),
                row('passive, he, she, it', cell(e, 'indicative', 'present', 'passive', 'third-person',
                                            'singular') if not dep else ''),
            ]),
        ]
    elif any('masculine' in t['t'] for t in e['table']) and \
            any('neuter' in t['t'] for t in e['table']):
        blocks = [block(f'{num}, m. · f. · n.', [row(c, gendered(e, c, num)) for c in CASES])
                  for num in ('singular', 'plural')]
    elif pos in ('noun', 'pron', 'det', 'num', 'adj'):
        blocks = [block(num, [row(c, cell(e, c, num)) for c in CASES])
                  for num in ('singular', 'plural')]
        if not any(blocks):
            blocks = [block('forms', [row(c, cell(e, c)) for c in CASES])]
    else:
        return ''
    blocks = [b for b in blocks if b]
    return '<div class="uc-cjg">' + ''.join(blocks) + '</div>' if blocks else ''


# ---- examples ---------------------------------------------------------------------------
def mark(sentence, hits):
    hs = set(hits)
    out = []
    for piece in re.split(r"([A-Za-zÀ-ɏ̀-ͯ]+)", sentence):
        if piece and fold(piece) in hs:
            out.append(f'<b>{E(piece)}</b>')
        else:
            out.append(E(piece))
    return ''.join(out)


def examples_html(exs):
    return ''.join(
        f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
        f'data-say="{E(la)}"></span>{mark(la, hits)}</div>'
        f'<div class="uc-exe">{E(en)}</div></div>' for la, en, hits in exs)


# ---- the deck ---------------------------------------------------------------------------
def entries_for(r, lex):
    ents = kept(r, lex[r['key']])
    ents = [e for e in ents if any(not g['weak'] for g in e['glosses'])] or ents
    if r['pos']:
        ents = sorted(ents, key=lambda e: e['pos'] != r['pos'])
    # ONE ETYMOLOGY PER CARD unless two are spelt alike AND kept (`cum` "with" / "when"):
    # an entry whose headword differs from the lead's in its macrons is another word
    lead = ents[0]['canon'] if ents else ''
    ents = [e for e in ents if e['canon'] == lead or e['canon'] in ALSO.get(lead, [])]
    if lead in ONLY_POS:
        ents = [e for e in ents if e['pos'] == ONLY_POS[lead]] or ents
    out, seen = [], {}
    for e in ents:
        if e['pos'] in seen:
            out[seen[e['pos']]]['glosses'] += e['glosses']
            continue
        seen[e['pos']] = len(out)
        out.append(dict(e, glosses=list(e['glosses'])))
    return out[:3]


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        main = ents[0]
        tab = next((e for e in ents if e['table']), main)
        word = main['canon']
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Latin': E(word),
            'Parts': parts_html(main),
            'Key': r['key'],
            'Word': macronless(word),
            'English': english(ents, word),
            'Forms': forms_line(main),
            'Table': table_html(tab),
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
    EX_NOTE = ('Every word carries three example sentences' if ex3 == n else
               f'Example sentences come with {n - ex0} of the {n} words, three apiece for {ex3} of them')
    return (
        "Both study directions in one deck: Latin → English (see the Latin, recall the meaning) "
        "and English → Latin (see an English meaning, recall the Latin). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words for a beginner. "
        + ("The words already taught by the levels below this one are left out. " if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no examination publishes a graded Latin word "
        "list, and the Common European Framework of Reference describes living languages, so this "
        f"deck borrows the framework's {LEVEL.upper()} band only as a SCOPE — the everyday topics whose "
        f"global descriptor begins '{SC['quote']}' — and is Folio's own list, not any examination's. "
        f"{from_inv} of the {n} words come from a vocabulary written for that scope, in the words of "
        f"Roman life: {SC['topics']}. The other {n - from_inv} are the commonest remaining words of "
        "classical Latin, by their rank in the Dickinson College Commentaries Latin Core Vocabulary, "
        "and the cards are dealt by that rank, so the words a reader of Latin meets most often come "
        "first; the few the list does not hold follow, ordered by how often they appear in the "
        "Tatoeba corpus. "
        "Every headword is printed with its macrons, the marks over a long vowel (amō, rēgīna), and "
        "with its dictionary entry beneath it: a verb's principal parts (amō, amāre, amāvī, amātum), "
        "a noun's genitive and gender (rēx, rēgis m.), an adjective's three genders (bonus, bona, "
        f"bonum). The {nouns} nouns and {verbs} verbs, and the adjectives and pronouns, carry their "
        "whole table behind the All forms fold — every case in both numbers; a verb's five "
        "indicative tenses, present subjunctive, imperative, infinitives and participles. "
        + EX_NOTE + ", with the word picked out in colour. The speaker reads Latin with an Italian "
        "voice, which gives the Italianate church pronunciation rather than the classical one, "
        "because almost no device has a Latin voice. Sources. Level: the Common European Framework "
        "of Reference (Council of Europe), global scale, as a scope only. Frequency: the Dickinson "
        "College Commentaries Latin Core Vocabulary (Christopher Francese and others, 2012–13), "
        "CC BY-SA 3.0. Meanings, gender, principal parts, macrons and tables: English Wiktionary, "
        "via the kaikki.org extraction (CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), "
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
        'tags': ['latin', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Latin vocabulary', 'speechLang': 'it-IT',
            'fields': FIELDS,
            'cards': [
                {'name': 'Latin → English', 'front': FRONT_LA, 'back': BACK_LA},
                {'name': 'English → Latin', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Latin')
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
