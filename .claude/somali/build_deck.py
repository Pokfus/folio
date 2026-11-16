#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the shape of every language deck here.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is SOMALI -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in the ordinary Somali spelling (no tone is written);
  · under it, Wiktionary's ACCENTED spelling (nín, gabádh), the `Tone` field --
    Somali tone is part of the grammar (the accent tells a masculine noun from a
    feminine, a singular from a plural), and ordinary writing leaves it out.
    It belongs to the FIRST entry shown and only when that entry is
    Wiktionary's: a hand gloss carries none (`hand.py`);
  · the meanings, grouped by part of speech, a noun's gender in its label
    ("noun, masculine");
  · a noun's plurals with their genders (Somali plurals often take the other
    gender: wiil m "boy", wiilal f "boys"), from Wiktionary's headword line;
  · up to three example sentences (Wiktionary's own, then Tatoeba's), the word
    in bold.
No verb table: Wiktionary's Somali conjugation tables are incomplete (some cells
are template residue), so none is shown rather than a partly wrong one.

NO SPEAKER BUTTON, as on the Hausa and Yoruba decks: few devices carry a Somali
voice, and a browser asked for one without it reads the word in another voice.
`speechLang: 'so-SO'` is still declared, so `spellTree` leaves the card's Somali
alone.

`Word` is the headword as printed, which the check and the next level's
de-duplication read.
"""
import html, json, os, re, sys, unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from so import nfc, key
from somali_level import LEVEL, LEX, TARGET, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE, WHO

STAMP = '2026-11-16T00:00:00.000Z'
TYPE_ID = 'somali'
COLOR = '#485A5A'          # the shelf's measured hue (app.js `lang-somali`)
FIELDS = ['Somali', 'Tone', 'Word', 'English', 'Forms', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'conj': 'conjunction',
            'particle': 'particle', 'intj': 'interjection', 'num': 'number',
            'phrase': 'phrase', 'prep': 'preposition', 'article': 'article'}
GENDER = {'m': 'masculine', 'f': 'feminine'}

WORD = ('<div class="uc-word">{{Somali}}</div>'
        '{{#Tone}}<div class="uc-rom" title="the accent (high tone), as dictionaries mark it">'
        '{{Tone}}</div>{{/Tone}}')
ASK = '<div class="uc-ask">Say it in Somali</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
FRONT_SO = WORD
BACK_SO = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = lambda s: html.escape(s, quote=False)

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one (a substring of it).
LEAD = {
    'hel': 'to find',               # first listed is "to like"
}
# WIKTIONARY'S ENTRY IS NOT SHOWN AT ALL, only the hand row (`hand.py`): its sense is not
# the word's (miro "nut" for "fruit"), so showing it second would teach a wrong meaning.
HAND_ONLY = {'miro', 'shaati', 'qurux', 'fudud', 'gadaal',
             'cabitaan', 'sheeko', 'raadi'}     # A2
# A GENDER CORRECTED, with the evidence: the article the Somali Wikipedia writes on it.
GENDER_FIX = {
    'sanad': 'm',                   # Wiktionary's head says f; sanadka 543 articles, sanadda 2
    'askari': 'm',                  # Wiktionary's head says f; askariga / askarigii 5 each, -da none
}
# ONE ENTRY ONLY, where Wiktionary carries the same word twice (gu' "spring" and "spring, springtime").
ONE_ENTRY = {"gu'"}
# A PART OF SPEECH TO LEAD WITH, for a fill word (the inventory names its own with `:pos`).
LEAD_POS = {}

# A TONE LINE CARRIES ONLY THE ACUTE AND THE GRAVE.  Fifteen of Wiktionary's Somali heads
# also write a diaeresis (jöög, shä̀äh, gë̀ël), a vowel-quality notation the deck does not
# teach; those words show no tone line rather than a mark nothing explains.
ACCENT_ONLY = re.compile(r"[a-zA-Z' \-\u0300\u0301]+")
POINTER = re.compile(r'^(alternative form of|alternative spelling of|form of|synonym of|'
                     r'contraction of|plural of|(?:northern|southern) somali form of)\b|^[^\w(]', re.I)
KEEP_CAP = re.compile(r"^(I|God|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|"
                      r"Muslim|Islam|Somali|Somalia|Somaliness|English|Arabic|Africa|African|Europe|"
                      r"Earth|Quran|January|February|March|April|May|June|July|August|"
                      r"September|October|November|December|Ramadan|Eid)\b")


def tidy(g):
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
    ents = L['entries'][:1] if row['key'] in ONE_ENTRY else L['entries']
    if row['key'] in HAND_ONLY:
        ents = [e for e in ents if e['hand']]
    if row['key'] in GENDER_FIX:
        ents = [dict(e, g=GENDER_FIX[row['key']]) if e['pos'] == 'noun' else e for e in ents]
    ents = [e for e in ents if any(not g['weak'] for g in e['glosses'])] or ents
    ents = [dict(e, glosses=[g for g in e['glosses'] if not POINTER.match(g['g'])]) for e in ents]
    ents = [e for e in ents if e['glosses']]
    lead = row['pos'] or LEAD_POS.get(L['word'], '')
    if lead:
        ents = sorted(ents, key=lambda e: e['pos'] != lead)
    return ents


def english(ents, word=''):
    """Grouped by part of speech (a noun of each gender apart), in the order the parts first
    appear; the ordinary senses before the weak, four at most a part."""
    order, by = [], {}
    for e in ents:
        k = (e['pos'], e.get('g', '') if e['pos'] == 'noun' else '')
        if k not in by:
            order.append(k)
            by[k] = []
        by[k].append(e)
    parts, shown = [], set()
    lead = LEAD.get(word)
    for k in order:
        pos, g = k
        cand = []
        for rank in range(6):
            for e in by[k]:
                gs = e['glosses']
                if rank < len(gs):
                    cand.append((gs[rank]['weak'], rank, lower_first(gs[rank]['g']), gs[rank]['tags']))
        cand.sort(key=lambda c: c[0])
        if lead:
            cand.sort(key=lambda c: lead.lower() not in c[2].lower())
        gl = []
        for weak, rank, t, tg in cand:
            if weak and gl:
                continue
            if t and t.lower() not in shown and len(gl) < 4:
                shown.add(t.lower())
                gl.append(t)
        if not gl:
            continue
        label = POS_NAME.get(pos, pos) + (', ' + GENDER[g] if g in GENDER else '')
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label)}</div>{body}</div>')
    return ''.join(parts)


def fi(label, form):
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(form)}</span>'


def plain(w):
    """The ordinary spelling: Wiktionary writes some plurals with their accent (maalmó)."""
    d = unicodedata.normalize('NFD', w)
    return unicodedata.normalize('NFC', ''.join(c for c in d if not unicodedata.combining(c)))


def forms_line(ents):
    """The first noun entry's plurals, each with its gender where Wiktionary gives one."""
    for e in ents:
        if e['pos'] == 'noun' and e['pl']:
            ps = ' · '.join(plain(p) + (f' ({g})' if g in GENDER else '') for p, g in e['pl'][:2])
            return f'<div class="uc-forms">{fi("plural", ps)}</div>'
        if e['pos'] == 'noun':
            return ''
    return ''


def examples_html(exs):
    return ''.join(f'<div class="uc-exi"><div class="uc-exz">{so}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>' for so, en in exs)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        word = lex[r['key']]['word']
        tone = '' if ents[0]['hand'] else ents[0]['tone']
        if tone and (key(tone) != key(word) or not ACCENT_ONLY.fullmatch(
                unicodedata.normalize('NFD', tone))):
            tone = ''
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Somali': E(word),
            'Tone': E(tone),
            'Word': word,
            'English': english(ents, word),
            'Forms': forms_line(ents),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': ents[0]['pos'], 'source': r['source'],
                        'examples': len(ex), 'hand': ents[0]['hand'], 'tone': bool(tone)})
    return cards, entries


def desc(entries, n):
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    hand = sum(1 for e in entries if e['hand'])
    tone = sum(1 for e in entries if e['tone'])
    ex_any = sum(1 for e in entries if e['examples'])
    SC = SCOPE[LEVEL]
    return (
        "Both study directions in one deck: Somali → English (see the Somali, recall the "
        "meaning) and English → Somali (see an English meaning, recall the Somali). Each "
        "direction is a card of its own with its own schedule, so recognising a word and "
        f"producing it are learnt separately. {n} words for {WHO[LEVEL]}, aligned to "
        f"{LEVEL.upper()} of the Common European Framework of Reference, whose global descriptor "
        f"begins '{SC['quote']}' — a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        (f"A2 WAS PLANNED AT {TARGET[LEVEL]} WORDS AND HOLDS {n}: after A1, that is every word English "
         "Wiktionary has that the Somali Wikipedia uses at all and that is not a variant spelling, a "
         "definite form filed as a word, or a slur; padding to the plan would teach the noise. The "
         "last words dealt appear in only one or two articles, so their order says little. "
         if n < TARGET[LEVEL] else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for Somali, so this deck is not any examination's vocabulary and does not claim to be. "
        f"It is assembled from two things that can be stated. {from_inv} of the {n} come from a "
        f"vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words of the Somali Wikipedia (its articles "
        "of 150 words or more), each counted over its forms, since Somali writes the article and "
        "the endings onto the word (buugga 'the book', cunay 'ate'). The corpus is encyclopaedic, "
        "which shows in the fill (places, history, government), and the cards are dealt by that "
        "frequency, so the words met most often come first. THE SOURCES ARE THIN: English "
        "Wiktionary has about a thousand Somali words and lacks some of the commonest (tag 'go', "
        f"lacag 'money', hadda 'now'), so {hand} of the {n} are glossed by Folio itself with the "
        "standard meaning a course or dictionary gives. Words are written in the ordinary Somali "
        "spelling, which marks no tone; "
        f"under {tone} of them is the accented spelling English Wiktionary gives (nín 'man', "
        "gabádh 'girl'), the accent marking the high tone that tells, for instance, a masculine "
        "noun from a feminine one. Folio's own glosses carry none, since an accent from memory "
        "would be a claim with no source. A noun's gender is in its label and its plural is "
        "given with the plural's own gender, which is often the other one (wiil 'boy' is "
        "masculine, wiilal 'boys' feminine). The Alphabet deck, first in this collection, "
        "teaches the letters, among them c, x, q, dh and the long vowels. Example sentences are "
        f"few: {ex_any} of the {n} words have one, from Wiktionary's usage examples and from "
        "Tatoeba, which holds about 125 Somali sentences with a translation; none is invented. "
        "There is no speaker button: few devices have a Somali voice, and one without it would "
        "read the word in another language's sounds. Sources. Level: the Common European "
        "Framework of Reference (Council of Europe), global scale. Meanings, accents, genders "
        "and plurals: English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0), and "
        "Folio's own glosses for the words it lacks. Frequency: the Somali Wikipedia, articles "
        "of the 2026-11-01 dump (CC BY-SA 4.0). Example sentences: English Wiktionary (CC BY-SA "
        "4.0) and Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open(LEX, encoding='utf-8'))['lemmas']
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
        'tags': ['somali', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Somali vocabulary', 'speechLang': 'so-SO',
            'fields': FIELDS,
            'cards': [
                {'name': 'Somali → English', 'front': FRONT_SO, 'back': BACK_SO},
                {'name': 'English → Somali', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Somali')
    if st['groups']:
        print('  labelled %d notes in %d groups that shared an English side'
              % (st['labelled'], st['groups']))

    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                       '..', '..', 'decks', DECK_FILES[LEVEL]))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out)
    print(f'  notes {n} = cards {n * 2} | bytes {os.path.getsize(out)} | hand {sum(e["hand"] for e in entries)}'
          f' | tone {sum(e["tone"] for e in entries)} | sentences {sum(1 for e in entries if e["examples"])}')
    json.dump(entries, open(f('entries.json'), 'w', encoding='utf-8'), ensure_ascii=False)


if __name__ == '__main__':
    main()
