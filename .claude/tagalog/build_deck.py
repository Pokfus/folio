#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Hindi / Romanian shape.  The
word is a single record and the two directions are card TEMPLATES, so a
corrected gloss is corrected both ways at once and each direction keeps its own
schedule.  Card 1 is TAGALOG -> ENGLISH, the easier direction and the one met
first.

WHAT A CARD CARRIES:
  · the headword as ordinary writing spells it (`maganda`), and beneath it
    Wiktionary's MARKED spelling (`magandá`) and IPA -- Tagalog writes neither
    its stress nor its final glottal stop, and both change a word (`bata`
    "child" is `batà`, `basa` "wet" is `basâ`);
  · the meanings, grouped by part of speech;
  · one line of key forms: an affixed verb's three ASPECTS, which is how a
    Tagalog verb is learnt (completed `kumain`, ongoing `kumakain`,
    contemplated `kakain`; Tagalog marks aspect, not tense), an adjective's
    plural (`magaganda`), and the ROOT with its affix where the etymology names
    them (`kain`, `-um-`) -- the root is the key to the dictionary and to every
    other verb built on it;
  · up to three Tatoeba sentences, the word picked out, with a speaker.

There is no "All forms" table: Wiktionary's Tagalog conjugation tables come
through the extraction with most cells untagged, and a table that cannot be
labelled truthfully is left off rather than guessed.

The speaker reads the `Word` field, the plain headword.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tl import fold, nfc, is_tl
from tl_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'tagalog'
COLOR = '#2A72DB'
FIELDS = ['Tagalog', 'Marked', 'IPA', 'Word', 'English', 'Forms', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'prep': 'preposition',
            'conj': 'conjunction', 'particle': 'particle', 'intj': 'interjection',
            'num': 'number', 'phrase': 'phrase', 'prep_phrase': 'phrase', 'proverb': 'proverb',
            'article': 'marker', 'contraction': 'contraction'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = ('<div class="uc-word">{{Tagalog}}' + SAY + '</div>'
        '{{#Marked}}<div class="uc-rom"><span class="uc-acc">{{Marked}}</span></div>{{/Marked}}'
        '{{#IPA}}<div class="uc-rom">{{IPA}}</div>{{/IPA}}')
ASK = '<div class="uc-ask">Say it in Tagalog</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
FRONT_TL = WORD
BACK_TL = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape

# ONE ETYMOLOGY PER CARD, the first Wiktionary lists, unless named here.
ETYMS = {
    'kaya': ['2', '1'],      # "so, therefore" before "ability"
    'baka': ['2', '1'],      # "maybe, might" before "cattle"
    'malaman': ['2'],        # "to come to be known"; etymology 1 is "fleshy"
    'siya': ['1'],           # the pronoun; 2 is "saddle", 3 "satisfaction"
    # A2 (2026-11-12)
    'sala': ['2'],           # "living room"; 1 is "fault, sin"
    'kilo': ['2'],           # "kilogram"; 1 is "bent, crooked"
    'basa': ['2'],           # "wet" (basâ); 1 is "reading"
    'suka': ['2'],           # "vinegar"; 1 is "vomit"
    'alas': ['2'],           # "o'clock" (alas-dos); 1 is "ace"
    'tahanan': ['2'],        # "home"; 1 is "simultaneous stopping"
    'mama': ['2'],           # "mum"; 1 is "a term for addressing an unknown man"
    # B1 (2026-11-12)
    'patas': ['2'],          # "even, fair"; 1 is "heap, pile"
    'malas': ['2'],          # "bad luck, unlucky"; 1 is "intent look"
    'bisa': ['2', '1'],      # "visa" before "efficacy"
    'pila': ['2'],           # C1: "line, queue"; 1 is "clay for earthenware"
}

# A PART OF SPEECH LEFT OFF ONE CARD, each with its reason.
DROP_POS = {
    'siya': {'noun', 'intj'},     # "the very same" and "so! well!" beside the pronoun
    'isipin': {'noun', 'adj'},    # "something to think about" before the verb "to think about"
    'marumi': {'noun', 'verb'},   # "dirty laundry", "to soil oneself" -- madumi's, beside "dirty"
    # A2 (2026-11-12): a rarer reading listed before the verb or adjective the word is learnt as
    'sagutin': {'noun'},          # "liabilities" before "to answer"
    'masabi': {'adj'},            # "chatty" before "to be able to say"
    'pakainin': {'noun'},         # "a dependant" beside "to feed"
    'tapusin': {'adj'},           # "obligatory to finish" beside "to finish"
    'tanggapin': {'adj'},         # "acceptor" beside "to accept"
    'sabihan': {'noun'},          # "rumour" beside "to tell, to notify"
}

# A GLOSS LEFT OFF A CARD: a homograph's sense merged into one entry, or a gloss
# that is not the word's meaning to a learner.
DROP_GLOSS = {
    'kailangan': {'distant uninhabited expanse',
                  'isolatedness; unfrequentedness (of some distant place)'},   # from ilang "wilderness"
    'kapatid': {'an employee of the TV5 Network',      # the network's own in-house usage
                'regular viewer or supporter of the TV5 Network'},
    # A2 (2026-11-12): slang or a rare sense that reads as the meaning
    'patatas': {'odor of dirty socks still being worn or just shed off'},
    'halaman': {'a person incapable of feeling anything related to love'},
    'kalihim': {'pan de regla'},                     # a bread, a homograph
    'barangay': {'local polity or settlement during the Philippine precolonial period'},
    'mani': {'clitoris'},                            # B2: beside "peanut"
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'piso': 'one-peso coin',  # first listed is the peso of the Spanish-speaking Americas
    'mahusay': 'skillful',    # first listed is "methodical; orderly"
    'tapat': 'sincere',       # first listed is "facing the front"
    'depresyon': 'depression (severe sadness)',   # first listed is the weather's
}


def entries_for(row, lex):
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    word = row['word']
    ents = [e for e in L['entries'] if any(not g['weak'] and g['g'] for g in e['glosses'])] \
        or L['entries']
    ents = [e for e in ents if e['pos'] not in DROP_POS.get(word, ())] or ents
    drop = DROP_GLOSS.get(word, set())
    ents = [dict(e, glosses=[g for g in e['glosses'] if g['g'] not in drop]) for e in ents]
    ents = [e for e in ents if e['glosses']] or ents
    groups = []
    for e in ents:
        if e.get('etym', '') not in groups:
            groups.append(e.get('etym', ''))
    keep = ETYMS.get(word)
    if not keep:
        # the first etymology, unless the inventory asked for a part of speech another holds
        first = next((e.get('etym', '') for e in ents if e['pos'] == row['pos']), None) \
            if row['pos'] else None
        keep = [first if first is not None else groups[0]]
    ents = sorted([e for e in ents if e.get('etym', '') in keep],
                  key=lambda e: keep.index(e.get('etym', '')))
    if row['pos']:
        ents = sorted(ents, key=lambda e: e['pos'] != row['pos'])
    out, seen = [], {}
    for e in ents:
        if e['pos'] in seen:
            o = out[seen[e['pos']]]
            o['glosses'] += e['glosses']
            for k, v in e['head'].items():
                o['head'].setdefault(k, v)
            continue
        seen[e['pos']] = len(out)
        out.append(dict(e, glosses=list(e['glosses']), head=dict(e['head'])))
    return out[:3]


NOTE = re.compile(r'^(Used|Indicates|Introduces|Expresses|Forms|Connects|Placed|Replaces|marks|'
                  r'added to|used)\b')


def is_note(t):
    """A gloss that is a grammar note or a paragraph, not a translation: kept only
    where it is the entry's one meaning (`ang` "marks the pivot ...")."""
    return len(t) > 90 or bool(NOTE.match(t))


def shorten(t):
    """A note kept as a marker's one meaning is cut at its first clause: `ang`'s runs
    to four lines ('...; in verbal clauses, the verb's trigger affix ...')."""
    if len(t) <= 90:
        return t
    t = t.replace('."', '".')
    cut = re.split(r'(?<=[a-z\)"])(?:[;:.] |, i\.e\.)', t)[0]
    return cut if len(cut) >= 20 else t


def english(ents, word=''):
    parts, shown = [], set()
    for e in ents:
        label = POS_NAME.get(e['pos'], e['pos'])
        gl, seen = [], set()
        for g in sorted(e['glosses'], key=lambda g: is_note(g['g'])):
            if (g['weak'] or set(g['tags']) & {'slang'} or is_note(g['g'])) and gl:
                continue
            t = shorten(re.sub(r'\s*[:;,]\s*$', '', g['g']))
            if t and t not in seen:
                seen.add(t)
                gl.append(t)
        lead = LEAD.get(word)
        if lead:
            gl.sort(key=lambda x: (x != lead, lead not in x))
        gl = gl[:3]
        if not gl or all(x in shown for x in gl):
            continue
        shown.update(gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label)}</div>{body}</div>')
    return ''.join(parts)


# ---- forms -----------------------------------------------------------------------------
ROOT = re.compile(r'^From (\S+) \+ (\S+?)\.?$')


def root_of(e, word):
    """(root, affix) from an etymology 'From ma- + ganda.' / 'From kain + -um-.'"""
    m = ROOT.match(e.get('etymtext', '').strip())
    if not m:
        return '', ''
    a, b = m.group(1), m.group(2)
    affix, root = (a, b) if a.endswith('-') or a.startswith('-') else (b, a)
    if root.endswith('-') or root.startswith('-') or not (affix.endswith('-') or affix.startswith('-')):
        return '', ''
    if not is_tl(root) or fold(root) == fold(word):
        return '', ''
    return root, affix


def fi(label, form):
    if not form:
        return ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(form)}</span>'


def forms_line(e, word):
    h = e['head']
    bits = []
    if e['pos'] == 'verb':
        bits.append(fi('completed', h.get('completive')))
        bits.append(fi('ongoing', h.get('progressive')))
        bits.append(fi('contemplated', h.get('contemplative')))
    elif e['pos'] == 'adj':
        pl = h.get('plural')
        if pl and fold(pl) != fold(word):
            bits.append(fi('plural', pl))
    if e['pos'] in ('verb', 'adj', 'noun'):
        root, affix = root_of(e, word)
        if root:
            bits.append(fi('root', f'{root} + {affix}'))
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


# ---- examples --------------------------------------------------------------------------
def mark(sentence, hits):
    hs = set(hits)
    out, last = [], 0
    for m in re.finditer(r"[^\W\d_]+(?:-[^\W\d_]+)*", sentence):
        out.append(E(sentence[last:m.start()]))
        piece = m.group(0)
        out.append(f'<b>{E(piece)}</b>' if fold(piece) in hs else E(piece))
        last = m.end()
    out.append(E(sentence[last:]))
    return ''.join(out)


def examples_html(exs):
    out = []
    for tl, en, hits in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(tl)}"></span>{mark(tl, hits)}</div>'
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
        ipa = main['ipa'] or next((e['ipa'] for e in ents if e['ipa']), '')
        acc = main['acc'] or next((e['acc'] for e in ents if e['acc']), '')
        if fold(acc) != fold(word):
            acc = ''
        if r.get('via') and fold(r['via']) != fold(word):
            # a common spelling Wiktionary files under another (`marumi` under
            # `madumi`): the target's pronunciation and forms are not this spelling's
            ipa = ''
        ex = exs.get(r['key'], [])
        cards.append({'sub': r.get('sub', ''), 'fields': {
            'Tagalog': E(word),
            'Marked': E(acc) if acc and acc != word else '',
            'IPA': E(ipa),
            'Word': word,
            'English': english(ents, word),
            'Forms': forms_line(main if not r.get('via') or fold(r['via']) == fold(word)
                                else dict(main, head={}), word),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex), 'ipa': bool(ipa), 'sub': r.get('sub', ''),
                        'count': r.get('count', 0)})
    return cards, entries


FOR = {'a1': 'for a beginner', 'a2': 'for an elementary learner', 'b1': 'for an intermediate learner',
       'b2': 'for an upper-intermediate learner', 'c1': 'for an advanced learner'}
BELOW_NAMES = {'a1': '', 'a2': 'A1', 'b1': 'A1 or A2', 'b2': 'A1, A2 or B1', 'c1': 'A1 to B2'}


def desc(entries, n):
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    ex3 = sum(1 for e in entries if e['examples'] == 3)
    ex0 = sum(1 for e in entries if e['examples'] == 0)
    verbs = sum(1 for e in entries if e['pos'] == 'verb')
    ipas = sum(1 for e in entries if e['ipa'])
    SC = SCOPE[LEVEL]
    EX_NOTE = ('Every word carries three real example sentences' if ex3 == n else
               f'Real example sentences come with {n - ex0} of the {n} words, three apiece for '
               f'{ex3} of them')
    return (
        "Both study directions in one deck: Tagalog → English (see the Tagalog, recall the meaning) "
        "and English → Tagalog (see an English meaning, recall the Tagalog). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words {FOR[LEVEL]}, aligned to {LEVEL.upper()} of the Common European "
        f"Framework of Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
        f"is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: this deck is not any examination's "
        "vocabulary and does not claim to be — Tagalog has no CEFR examination, and no openly "
        "licensed graded word list was found to build it from. It is assembled from two things that "
        f"can be stated. {from_inv} of the {n} come from a vocabulary written for the level's scope "
        f"— {SC['topics']} — and the other {n - from_inv} are the commonest remaining words, by a "
        "frequency that averages two sources: a word list built from film and television subtitles, "
        "and the Tagalog sentences of Tatoeba, each counted per million words. The cards are dealt by "
        "that frequency, so the words you meet most often come first. "
        "Every headword is spelt as ordinary Tagalog writing spells it, and beneath it Wiktionary's "
        f"pronunciation in the International Phonetic Alphabet ({ipas} of the {n}) and, where the "
        "word carries one, its marked spelling, because ordinary writing shows neither the stress "
        f"nor the final glottal stop (bata, a child, is batà). Verbs are given as the affixed verb you say (kumain, to eat), and the {verbs} verbs "
        "show their three aspects — completed, ongoing and contemplated (kumain, kumakain, kakain) — "
        "since Tagalog marks whether an action is done rather than when; where Wiktionary names "
        "it, a word shows its root and affix (kain + -um-). "
        + EX_NOTE + ", with the word picked out in colour and a speaker beside the sentence and the "
        "headword. Sources. Level: the Common European Framework of Reference (Council of Europe), "
        "global scale. Meanings, spellings, aspects and pronunciation: English Wiktionary, via the "
        "kaikki.org extraction (CC BY-SA 4.0). Frequency: a word list built from OpenSubtitles "
        "(hermitdave/FrequencyWords, CC BY-SA 4.0) and the Tatoeba corpus. Example sentences: "
        "Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )


def desc_phr(entries, n):
    by = {s: [e for e in entries if e['sub'] == s] for s in ('Phrases', 'Idioms', 'Proverbs')}
    ex3 = sum(1 for e in entries if e['examples'] == 3)
    ex0 = sum(1 for e in entries if e['examples'] == 0)
    found = sum(1 for e in entries if e['count'])
    eg = lambda s: ', '.join(e['word'] for e in by[s][:3])
    return (
        f"{n} Tagalog set phrases, idioms and proverbs, in three subdecks: {len(by['Phrases'])} "
        f"everyday phrases, {len(by['Idioms'])} idioms and {len(by['Proverbs'])} proverbs. Both study "
        "directions come as two cards of one expression — Tagalog → English (see the Tagalog, recall the "
        "meaning) and English → Tagalog (see an English meaning, recall the Tagalog) — each with a "
        "schedule of its own. This is a companion to the five level decks, Tagalog A1 to C1, and not one "
        "of them: a level is a list of words, and an expression is a unit a list of words cannot see. "
        "Nothing here is taught by any of the five, so the two can be studied together without "
        "repeating an entry. The PHRASES are the expressions Wiktionary files as phrases and does not "
        f"mark as idiomatic — mostly the everyday formulas a Tagalog speaker uses as one piece "
        f"({eg('Phrases')} …). The IDIOMS are expressions whose meaning is not their words' "
        f"({eg('Idioms')} …), and the PROVERBS the sayings Wiktionary files as proverbs "
        f"({eg('Proverbs')} …). Within each subdeck the expressions come in the order of how many of "
        f"Tatoeba's Tagalog sentences contain them; only {found} of the {n} are found there at all, and "
        "the rest follow in the order of a frequency estimate from film and television subtitles and "
        "Tatoeba. Every expression is spelt as ordinary writing spells it, with Wiktionary's marked "
        "spelling and pronunciation beneath it where Wiktionary gives them. "
        f"Real example sentences come with {n - ex0} of the {n} expressions, three apiece for {ex3}, "
        "with the expression picked out in colour and a speaker beside the sentence and the headword. "
        "Sources. Expressions, meanings, spellings and the idiom and proverb labels: English "
        "Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Order: Tatoeba (tatoeba.org), "
        "CC BY 2.0 FR, and a word list built from OpenSubtitles (hermitdave/FrequencyWords, CC BY-SA "
        "4.0). Example sentences: Tatoeba, CC BY 2.0 FR."
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
    if LEVEL == 'phr':
        by = {k: sum(1 for e in entries if e['sub'] == k) for k in ('Phrases', 'Idioms', 'Proverbs')}
        subtitle = (f"{n} expressions · {by['Phrases']} everyday, {by['Idioms']} idioms, "
                    f"{by['Proverbs']} proverbs · both directions")
        description = desc_phr(entries, n)
        tags = ['tagalog', 'filipino', 'phrases', 'idioms', 'proverbs']
    else:
        subtitle = (f'{n} words · both directions, as two cards per word' if LEVEL == 'a1' else
                    f'{n:,} more words, none of them in {BELOW_NAMES[LEVEL]} · both directions, '
                    'as two cards per word')
        description = desc(entries, n)
        tags = ['tagalog', 'filipino', 'vocabulary', LEVEL, NAMES[LEVEL].lower()]
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': subtitle,
        'desc': description, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': tags,
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Tagalog vocabulary', 'speechLang': 'fil-PH',
            'fields': FIELDS,
            'cards': [
                {'name': 'Tagalog → English', 'front': FRONT_TL, 'back': BACK_TL},
                {'name': 'English → Tagalog', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Tagalog')
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
