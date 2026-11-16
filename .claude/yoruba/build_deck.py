#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the shape of every language deck here.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is YORUBA -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in standard Yoruba spelling, WITH ITS TONE MARKS, as English
    Wiktionary's headword line gives it -- the tones are part of the word (ọkọ
    "husband", ọkọ̀ "vehicle"), and the Alphabet deck, first in the collection,
    teaches what the marks mean;
  · the meanings, grouped by part of speech.  One spelling is often several
    words (dá "to create", dá "to stop", dá "to break" ...), and the card is the
    spelling, so it shows the first meaning of each, up to four a part of speech;
  · the word's other standard spellings (ilé-ìwé, ilé ìwé), where the Yoruba
    Wikipedia uses them too;
  · up to three example sentences (Wiktionary's own, then Tatoeba's), the word
    in bold.

NO SPEAKER BUTTON, as on the Hausa and Amharic decks: few devices carry a Yoruba
voice, and a browser asked for one without it reads the word in another voice --
which for a tonal language teaches the wrong word.  `speechLang: 'yo-NG'` is
still declared, so `spellTree` leaves the card's Yoruba alone.

`Word` is the headword as printed, which the check and the next level's
de-duplication read.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from yo import nfc, key, strip_tones
from yoruba_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE, WHO

STAMP = '2026-11-15T00:00:00.000Z'
TYPE_ID = 'yoruba'
COLOR = '#3A5498'          # the shelf's measured hue (app.js `lang-yoruba`)
FIELDS = ['Yoruba', 'Word', 'English', 'Forms', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'conj': 'conjunction',
            'particle': 'particle', 'intj': 'interjection', 'num': 'number',
            'phrase': 'phrase', 'prep': 'preposition', 'prep_phrase': 'adverbial phrase'}

WORD = '<div class="uc-word">{{Yoruba}}</div>'
ASK = '<div class="uc-ask">Say it in Yoruba</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
FRONT_YO = WORD
BACK_YO = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = lambda s: html.escape(s, quote=False)

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one (a substring of it).
LEAD = {
    'oṣù': 'month',                 # first listed is "moon; new moon"
    'ìwé': 'book',                  # first listed is "paper"
    'ọjà': 'market',                # first listed is "village, town, homestead"
    'ìyàwó': 'wife',                # first listed is "junior wife" in a polygamous home
    'iṣu': 'yam tuber',                 # first listed is the plant, "any of the various species"
    'ìlú': 'town',                  # first listed is "city state"
    'ẹ̀wà': 'general name for beans',   # first listed is "the bean plant"
    'iye': 'value',                 # first listed is a title of respect; the count is "amount"
    'ìdí': 'reason',                # first listed is "buttocks"; the count is ìdí "reason"
    'ayò': 'strategy game',         # first listed is the plants whose seeds are its counters
    'ọ̀run': 'sky',                 # first listed is a long account of the place of origin of souls
}
# A spelling whose other parts of speech are a dialect's or a slip, shown by these only.
POS_ONLY = {
    'ẹni': {'noun'},                # "our", "us": not the standard language's ẹni "person"
}
# A PART OF SPEECH TO LEAD WITH, for a fill word (the inventory names its own with `:pos`).
LEAD_POS = {
    'nípasẹ̀': 'prep',             # "by, through"; Wiktionary's verb first
    'lé': 'prep',                   # "on, after"
    'pé': 'conj',                   # "that"
}

# A gloss that is only a pointer to another word, never shown.
POINTER = re.compile(r'^(alternative form of|alternative spelling of|form of|synonym of|'
                     r'contraction of|plural of)\b', re.I)

# A gloss's first word that keeps its capital.
KEEP_CAP = re.compile(r"^(I|God|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|"
                      r"Christian|Christianity|Muslim|Islam|Yoruba|English|Nigeria|Nigerian|"
                      r"Africa|African|Europe|European|Earth|Bible|Quran|Ifá|Ifa|Ọ̀ṣun|Ṣàngó|"
                      r"January|February|March|April|May|June|July|August|September|October|"
                      r"November|December|Christmas|Easter|Lagos|Ibadan|Ile-Ife|Ife|Oyo|Ọ̀yọ́)\b")


def tidy(g):
    """Wiktionary's gloss, shortened where it runs on: a pointer to its table dropped, and only
    the first sentence of a gloss that has several (the perfect particle `ti`, ìyá)."""
    g = re.sub(r'\s*\(see (?:the )?table below\)', '', g)
    m = re.search(r'[a-z)]\. [A-Z]', g)
    if m and m.start() > 15:
        g = g[:m.start() + 1]
    return g


def lower_first(g):
    g = tidy(g)
    if not g or KEEP_CAP.match(g) or (len(g) > 1 and g[1].isupper()):
        return g
    return g[0].lower() + g[1:]


def entries_for(row, lex):
    L = lex[row['key']]
    ents = [e for e in L['entries'] if e['pos'] in POS_ONLY.get(L['word'], {e['pos']})]
    ents = [e for e in ents if any(not g['weak'] for g in e['glosses'])] or ents
    ents = [dict(e, glosses=[g for g in e['glosses'] if not POINTER.match(g['g'])]) for e in ents]
    ents = [e for e in ents if e['glosses']]
    lead = row['pos'] or LEAD_POS.get(L['word'], '')
    if lead:
        ents = sorted(ents, key=lambda e: e['pos'] != lead)
    return ents


def english(ents, word=''):
    """Grouped by part of speech, in the order the parts first appear.  Within one part,
    the FIRST gloss of each of Wiktionary's entries comes before any entry's second (each
    entry being another word spelt alike), the ordinary senses before the weak, four at most."""
    order, by = [], {}
    for e in ents:
        if e['pos'] not in by:
            order.append(e['pos'])
            by[e['pos']] = []
        by[e['pos']].append(e)
    parts, shown = [], set()
    lead = LEAD.get(word)
    for pos in order:
        cand = []
        for rank in range(6):
            for e in by[pos]:
                gs = e['glosses']
                if rank < len(gs):
                    cand.append((gs[rank]['weak'], rank, lower_first(gs[rank]['g']), gs[rank]['tags']))
        cand.sort(key=lambda c: c[0])                       # stable: weak senses last
        if lead:
            cand.sort(key=lambda c: lead.lower() not in c[2].lower())
        gl, tags = [], set()
        for weak, rank, t, tg in cand:
            if weak and gl:
                continue
            if t and t.lower() not in shown and len(gl) < 4:
                shown.add(t.lower())
                gl.append(t)
                tags.update(tg)
        if not gl:
            continue
        label = POS_NAME.get(pos, pos)
        if pos == 'verb' and len(gl) == 1:
            if 'transitive' in tags and 'intransitive' not in tags:
                label += ', transitive'
            elif 'intransitive' in tags and 'transitive' not in tags:
                label += ', intransitive'
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label)}</div>{body}</div>')
    return ''.join(parts)


def fi(label, form):
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(form)}</span>'


def letters(w):
    """The word's letters, dots kept, without its tones, spaces, hyphens and apostrophes."""
    return re.sub(r"[ \-']", '', strip_tones(w).lower())


def forms_line(ents, word, counts, ptr_from):
    """Other spellings of the SAME LETTERS -- written apart, together or hyphenated, or with
    the tones of a vowel run written otherwise (ilé-ìwé / iléèwé, márùn-ún / márùnún) --
    that the Yoruba Wikipedia writes too (three articles or more), and the inventory word
    a pointer resolved from (tàbí -> àbí).  Wiktionary files a dialect's forms as plain
    "alternatives" too (mo / mi, ara / ọra, rẹ̀ / ẹ̀), and those, being other letters, are not
    shown: the card teaches the standard word."""
    other = []
    for s in ptr_from + [a for e in ents for a in e['alts']]:
        if s.lower() == word.lower() or s in other:
            continue
        if s in ptr_from or (counts.get(s.lower(), 0) >= 3 and letters(s) == letters(word)):
            other.append(s)
    return (f'<div class="uc-forms">{fi("also spelt", " · ".join(other[:3]))}</div>'
            if other else '')


def examples_html(exs):
    return ''.join(f'<div class="uc-exi"><div class="uc-exz">{yo}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>' for yo, en in exs)


def build(rows, lex, exs, counts, ptr):
    cards, entries = [], []
    back = {}
    for k, t in ptr.items():
        back.setdefault(nfc(t).lower(), []).append(k)
    from inventory import INVENTORY
    inv = {nfc(i.partition(':')[0].replace('_', ' ')).lower()
           for _, ws in INVENTORY.get(LEVEL, []) for i in ws.split()}
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        word = lex[r['key']]['word']
        ptr_from = [w for w in back.get(r['key'], []) if w in inv and w not in lex]   # tàbí -> àbí
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Yoruba': E(word),
            'Word': word,
            'English': english(ents, word),
            'Forms': forms_line(ents, word, counts, ptr_from),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': ents[0]['pos'], 'source': r['source'],
                        'examples': len(ex)})
    return cards, entries


def desc(entries, n):
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    ex_any = sum(1 for e in entries if e['examples'])
    SC = SCOPE[LEVEL]
    return (
        "Both study directions in one deck: Yoruba → English (see the Yoruba, recall the "
        "meaning) and English → Yoruba (see an English meaning, recall the Yoruba). Each "
        "direction is a card of its own with its own schedule, so recognising a word and "
        f"producing it are learnt separately. {n} words for {WHO[LEVEL]}, aligned to "
        f"{LEVEL.upper()} of the Common European Framework of Reference, whose global descriptor "
        f"begins '{SC['quote']}' — a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        ("AT THIS LEVEL THE SOURCES RUN THIN: English Wiktionary lacks much of what a B1 topic list "
         "would hold (government, law, health), so the written part was chosen from the everyday "
         "words Wiktionary does have, and the last words dealt by frequency appear in only one or "
         "two articles, so their order says little. " if LEVEL == 'b1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for Yoruba, so this deck is not any examination's vocabulary and does not claim to be. "
        f"It is assembled from two things that can be stated. {from_inv} of the {n} come from a "
        f"vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words of the Yoruba Wikipedia (its articles "
        "of 150 words or more, the one-line stubs left out). About half of that Wikipedia is "
        "written with its tone marks, and the counts of the carefully marked articles decide "
        "how an unmarked spelling is shared out among the words it could be (ti, tí, tì). The "
        "corpus is encyclopaedic, which shows in the fill (government, history, sport), and the "
        "cards are dealt by that frequency, so the words met most often come first. Only words "
        "English Wiktionary has an entry for can be taught here, and some of the commonest are "
        "missing from it (ta ni 'who', ibo 'where', nísinsìnyí 'now', tún 'again', burú 'to be "
        "bad'). Every word is written in standard Yoruba spelling WITH ITS TONE MARKS — an acute "
        "for a high tone (á), a grave for a low one (à), no mark for a mid tone — because the "
        "tones are part of the word: ọkọ is 'husband', ọkọ̀ 'vehicle', ọkọ́ 'hoe'. The Alphabet "
        "deck, first in this collection, teaches the letters and the marks. One spelling is "
        "often several words (dá 'to create', 'to stop', 'to break'); the card is the spelling "
        "and gives the first meaning of each. Many Yoruba adjectives are verbs ('to be big', "
        "'to be good'), and are taught as Wiktionary gives them. Example sentences are few: "
        f"{ex_any} of the {n} words have one, from Wiktionary's usage examples and from Tatoeba, "
        "which holds about 60 Yoruba sentences with a translation; none is invented. There is no "
        "speaker button: few devices have a Yoruba voice, and one without it would read the "
        "word in another language's sounds. Sources. Level: the Common European Framework of "
        "Reference (Council of Europe), global scale. Meanings, spellings and tone marks: English "
        "Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Frequency: the Yoruba "
        "Wikipedia, articles of the 2026-11-01 dump (CC BY-SA 4.0). Example sentences: English "
        "Wiktionary (CC BY-SA 4.0) and Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    D = json.load(open('lex.json', encoding='utf-8'))
    lex, ptr = D['lemmas'], D['pointers']
    exs = json.load(open(f('examples.json'), encoding='utf-8'))
    counts = json.load(open('yo_counts.json', encoding='utf-8'))['df']
    cards, entries = build(rows, lex, exs, counts, ptr)
    DECK = DECK_IDS[LEVEL]
    for i, c in enumerate(cards, 1):
        c['id'] = f'u_{DECK}_{i}'
        c['type'] = TYPE_ID
    n = len(cards)
    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': f'{n} words · both directions, as two cards per word',
        'desc': desc(entries, n), 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['yoruba', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Yoruba vocabulary', 'speechLang': 'yo-NG',
            'fields': FIELDS,
            'cards': [
                {'name': 'Yoruba → English', 'front': FRONT_YO, 'back': BACK_YO},
                {'name': 'English → Yoruba', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Yoruba')
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
