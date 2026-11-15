#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Hindi shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is AMHARIC -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in the Ethiopic script, as Wikipedia spells it most often (the
    homophone letters give many words two or three spellings: `extract.py`);
  · beneath it Wiktionary's ROMANISATION of that spelling, which also shows the
    doubled consonants the script does not write (ʿäbbay) -- the Fidäl deck,
    first in the collection, teaches the letters it stands for;
  · the meanings, grouped by part of speech, a noun's gender in its label;
  · one line of forms, each with its romanisation: a noun's plural, its
    definite form ("the ...", from Wiktionary's declension table where it has
    one), a verb's infinitive (from the infinitive's own page), the word's other
    spellings;
  · up to three example sentences (Wiktionary's own, then Tatoeba's), the word
    picked out.

NO SPEAKER BUTTON, as on the Hausa decks: few devices carry an Amharic voice, and
a browser asked for one without it reads in another voice or not at all -- a
control that answers a press with silence or with the wrong language.
`speechLang: 'am-ET'` is still declared.

`Word` is the headword as printed, which the check and the next level's
de-duplication read.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from am import key, nfc, roman, SYL
from amharic_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE, WHO

STAMP = '2026-11-15T00:00:00.000Z'
TYPE_ID = 'amharic'
COLOR = '#85063D'          # the shelf's measured hue (app.js `lang-amharic`)
FIELDS = ['Amharic', 'Roman', 'Word', 'English', 'Forms', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'conj': 'conjunction',
            'particle': 'particle', 'intj': 'interjection', 'num': 'number',
            'phrase': 'phrase', 'prep': 'preposition', 'postp': 'postposition'}
GENDER = {'m': 'masculine', 'f': 'feminine', 'm or f': 'masculine or feminine by the person meant'}

WORD = ('<div class="uc-word">{{Amharic}}</div>'
        '{{#Roman}}<div class="uc-rom">{{Roman}}</div>{{/Roman}}')
ASK = '<div class="uc-ask">Say it in Amharic</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
FRONT_AM = WORD
BACK_AM = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'ከተማ': 'city, town',          # first listed is "military camp, garrison"
    'ሻይ': 'tea (hot beverage',     # first listed is the tea plant
    'ወረራ': 'invasion',             # first listed is "infestation"
    'አቀማመጥ': 'location, placement, layout',   # first listed is "seating"
}

# A gloss that is only a pointer to another word, never shown.
POINTER = re.compile(r'^(alternative form of|alternative spelling of|form of|prothetic form of|'
                     r'aphetic form of|synonym of|infinitive of|plural of)\b', re.I)

# A gloss's first word that keeps its capital: a name, a day, a people, a faith.
KEEP_CAP = re.compile(r"^(I|God|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|"
                      r"Christian|Christianity|Catholic|Amharic|Arabic|Arab|Amhara|English|"
                      r"Ethiopia|Ethiopian|Greek|Jesus|Muslim|Islam|Orthodox|Ge'ez|Old|New|"
                      r"January|February|March|April|May|June|July|August|September|October|"
                      r"November|December|Easter|Christmas|Bible|African|Englishman|Jannat)\b")
MONTH = re.compile(r"\b(january|february|march|april|may|june|july|august|september|october|"
                   r"november|december)\b")


def lower_first(g):
    g = re.sub(r', (He|She|To|A|An|The)\b', lambda m: ', ' + m.group(1).lower(), g or '')
    if not g or KEEP_CAP.match(g) or (len(g) > 1 and g[1].isupper()):
        return g
    g = g[0].lower() + g[1:]
    if MONTH.fullmatch(g):                       # Wiktionary's "september" for መስከረም
        g = g[0].upper() + g[1:]
    return g


def entries_for(row, lex):
    """The lemma's entries for the card: THE HEADWORD'S OWN FIRST, and an entry under
    another spelling only where the two pages name each other (ውሃ / ውኃ "water") or
    share a gloss -- the fold also joins true homographs (ዓመት "year", አመት
    "maidservant"; ልዑል "prince", ሉል "pearl"), and those are not the word taught."""
    L = lex[row['key']]
    head = L['word']
    mine = [e for e in L['entries'] if e['word'] == head]
    head_alts = {a for e in mine for a in e['alts']}
    head_gl = {g['g'].lower() for e in mine for g in e['glosses']}
    ents = list(mine)
    for e in L['entries']:
        if e['word'] == head:
            continue
        if (head in e['alts'] or e['word'] in head_alts or
                head_gl & {g['g'].lower() for g in e['glosses']}):
            ents.append(e)
    ents = [e for e in ents if any(not g['weak'] for g in e['glosses'])] or ents
    ents = [dict(e, glosses=[g for g in e['glosses'] if not POINTER.match(g['g'])]) for e in ents]
    ents = [e for e in ents if e['glosses']]
    if row['pos']:
        ents = sorted(ents, key=lambda e: e['pos'] != row['pos'])
    out, seen = [], {}
    for e in ents:
        k = (e['pos'], e['g'])
        if k in seen:
            o = out[seen[k]]
            o['glosses'] += e['glosses']
            o['pl'] = o['pl'] or e['pl']
            o['table'] = o['table'] or e['table']
            o['alts'] = o['alts'] + [a for a in e['alts'] if a not in o['alts']]
            continue
        seen[k] = len(out)
        out.append(dict(e, glosses=list(e['glosses'])))
    return out[:3]


def pos_label(e):
    label = POS_NAME.get(e['pos'], e['pos'])
    if e['pos'] == 'noun' and e['g']:
        label += ', ' + GENDER[e['g']]
    tv = {t for g in e['glosses'] for t in g['tags']}
    if e['pos'] == 'verb':
        if 'transitive' in tv and 'intransitive' not in tv:
            label += ', transitive'
        elif 'intransitive' in tv and 'transitive' not in tv:
            label += ', intransitive'
    return label


def english(ents, word=''):
    parts, shown = [], set()
    for e in ents:
        gl, seen = [], set()
        for g in e['glosses']:
            if g['weak'] and gl:
                continue
            t = lower_first(g['g'])
            if t and t.lower() not in seen:
                seen.add(t.lower())
                gl.append(t)
        lead = LEAD.get(word)
        if lead:
            gl.sort(key=lambda x: lead not in x)
        gl = gl[:3]
        if not gl or all(x.lower() in shown for x in gl):
            continue
        shown.update(x.lower() for x in gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(pos_label(e))}</div>{body}</div>')
    return ''.join(parts)


# ---- forms -----------------------------------------------------------------------------
def fi(label, form, rom=''):
    if not form:
        return ''
    r = f'<span class="uc-fr">{E(rom)}</span>' if rom else ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(form)}{r}</span>'


def definite(e):
    """The definite form ("the house"): the declension table's masculine third-person
    possessive, which is the definite in Amharic (ቤቱ), or for a feminine noun -wa."""
    want = ('feminine', 'possessive', 'singular', 'third-person') if e['g'] == 'f' else \
           ('masculine', 'possessive', 'singular', 'third-person')
    for t in e['table']:
        if set(want) <= set(t['t']):
            # Wiktionary's generated table adds -u to a word in -w as a second ው (ሰው ->
            # "ሰውው"); the definite of such a word is not shown rather than shown wrong.
            if key(t['f']) == key(e['word']) + 'w':
                return '', ''
            # and in places a character outside the alphabet (ፀሐይ -> "ፀሐዯ"): not shown either
            if any(ch not in SYL for ch in t['f']):
                return '', ''
            return t['f'], romanise(t['f'], t['r'])
    return '', ''


def forms_line(e, L, word):
    bits = []
    if e['pos'] == 'noun':
        for p, r in e['pl'][:2]:
            # A PLURAL THAT SHARES NO CONSONANT WITH ITS NOUN is another word's, pasted onto
            # the page (አይጥ "mouse" was given ሰጎኖች, "ostriches"); a broken plural keeps
            # its root's consonants (ወፍ -> አዕዋፍ).
            if not set(re.sub('[aeiouE ]', '', key(p))) & set(re.sub('[aeiouE ]', '', key(word))):
                continue
            if key(p) != key(word):
                bits.append(fi('plural', p, romanise(p, r)))
        d, r = definite(e)
        if d and key(d) != key(word):
            bits.append(fi('the …', d, r))
    if e['pos'] == 'verb' and L.get('inf') and key(L['inf'][0]) != key(word):
        bits.append(fi('infinitive', L['inf'][0], romanise(L['inf'][0], L['inf'][1])))
    other = [s for s in L['spellings'] if s != word and
             (s in e['alts'] or word in e['alts'] or s in L.get('_alts', ()))]
    if other:
        bits.append(fi('also spelt', ' · '.join(other[:2])))
    bits = [b for b in bits if b]
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


# ---- examples --------------------------------------------------------------------------
def mark(sentence, hits):
    hs = set(hits)
    out = []
    for piece in re.split(r'([ሀ-ፚⶀ-⷟]+)', sentence):
        if piece and piece in hs:
            out.append(f'<b>{E(piece)}</b>')
        else:
            out.append(E(piece))
    return ''.join(out)


def examples_html(exs):
    return ''.join(f'<div class="uc-exi"><div class="uc-exz">{mark(am, hits)}</div>'
                   + (f'<div class="uc-exr">{E(rm)}</div>' if rm else '')
                   + f'<div class="uc-exe">{E(en)}</div></div>' for am, en, hits, rm in exs)


def skeleton(r):
    """A romanisation without its doubling, its sixth-order ə and the first-order vowel
    after h or the glottal stop (said a): what any spelling of the word must agree on."""
    r = re.sub(r'(.)\1', r'\1', r).replace('ə', '')
    for c in ('h', 'ḥ', 'ḫ', 'ʾ', 'ʿ'):
        r = r.replace(c + 'ä', c + 'a')
    return r


def romanise(word, wikt):
    """Wiktionary's romanisation of the headword, in the system of the rest of the deck.

    A few Amharic pages write their own romanisation by hand in another system (q for
    ḳ, j for ǧ, ǝ for ə, no glottal stop before an opening vowel: ቆዳ "qoda", አሮጌ
    "aroge"); those letters are put into Wiktionary's standard system, which the Fidäl
    deck teaches.  A romanisation that still disagrees with the script (ምክንያት
    "mikiniyati", for məknəyat) or is missing is replaced by the character
    romanisation (`am.roman`) without its final ə -- correct letter for letter, if
    blind to the doubling and the unsaid ə the script does not show."""
    r = nfc(wikt).replace('ǝ', 'ə').replace('ʼ', 'ʾ').replace('q', 'ḳ').replace('j', 'ǧ')
    if r and word[:1] in 'አኡኢኣኤእኦ' and not r.startswith('ʾ'):
        r = 'ʾ' + r
    if r and word[:1] in 'ዐዑዒዓዔዕዖ' and not r.startswith('ʿ'):
        r = 'ʿ' + r
    gen = ' '.join(re.sub(r'ə$', '', roman(w)) for w in word.split())
    return r if r and skeleton(r) == skeleton(gen) else gen


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        L = lex[r['key']]
        main = ents[0]
        word = L['word']
        L = dict(L, _alts={a for e in ents for a in e['alts']} |
                 {e['word'] for e in ents})
        rom = romanise(word, next((e['roman'] for e in ents if e['word'] == word and e['roman']), ''))
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Amharic': f'<div class="uc-word">{E(word)}</div>',
            'Roman': E(rom),
            'Word': word,
            'English': english(ents, word),
            'Forms': forms_line(main, L, word),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': main['pos'], 'source': r['source'],
                        'examples': len(ex)})
    return cards, entries


def desc(entries, n):
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    ex_any = sum(1 for e in entries if e['examples'])
    SC = SCOPE[LEVEL]
    return (
        "Both study directions in one deck: Amharic → English (see the Amharic, recall the "
        "meaning) and English → Amharic (see an English meaning, recall the Amharic). Each "
        "direction is a card of its own with its own schedule, so recognising a word and "
        f"producing it are learnt separately. {n} words for {WHO[LEVEL]}, aligned to "
        f"{LEVEL.upper()} of the Common European Framework of Reference, whose global descriptor "
        f"begins '{SC['quote']}' — a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for Amharic, so this deck is not any examination's vocabulary and does not claim to be. "
        f"It is assembled from two things that can be stated. {from_inv} of the {n} come from a "
        f"vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words of the Amharic Wikipedia, counted by "
        "the WHOLE word: Amharic writes its prepositions and endings onto the word (ቤት 'house', "
        "ቤቱ 'the house', በቤቱ 'in the house'), so those forms are added together. That corpus "
        "is encyclopaedic, which shows in the fill (history, government, religion), and verbs "
        "are counted less well than nouns, so they rank lower than they are used. The cards are "
        "dealt by that frequency, so the words met most often come first. Only words English "
        "Wiktionary has an entry for can be taught here, and some of the commonest are missing "
        "from it (አዎ 'yes', እና 'and', ግን 'but', ለምን 'why', ሄደ 'to go'). "
        "Every word is in the Ethiopic script (fidäl), as Amharic is written; the Fidäl deck, "
        "first in this collection, teaches the letters. Beneath it is Wiktionary's "
        "romanisation, which also marks the doubled consonants the script leaves unwritten. A "
        "verb is shown by its dictionary form, the past 'he did' (ገዛ 'he bought', taught as 'to "
        "buy'), with its infinitive where Wiktionary gives one; a few verbs Wiktionary has "
        "only as an infinitive are taught by that (መምጣት 'to come'). A noun shows its gender, "
        "plural and definite form where Wiktionary has them. Several Amharic letters are said "
        "alike (ሀ ሐ ኀ, ሰ ሠ, አ ዐ, ጸ ፀ), so many words have two or three spellings; the card "
        "heads with the one the Amharic Wikipedia uses most and names the others. Example "
        f"sentences are few: {ex_any} of the {n} words have one, from Wiktionary's usage examples "
        "and from Tatoeba, which holds about 250 Amharic sentences with a translation; none is "
        "invented. There is no speaker button: few devices have an Amharic voice. Sources. Level: "
        "the Common European Framework of Reference (Council of Europe), global scale. Meanings, "
        "forms and romanisation: English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). "
        "Frequency: the Amharic Wikipedia, articles of the 2026-11-01 dump (CC BY-SA 4.0). Example "
        "sentences: English Wiktionary (CC BY-SA 4.0) and Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))['lemmas']
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
        'tags': ['amharic', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Amharic vocabulary', 'speechLang': 'am-ET',
            'fields': FIELDS,
            'cards': [
                {'name': 'Amharic → English', 'front': FRONT_AM, 'back': BACK_AM},
                {'name': 'English → Amharic', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Amharic')
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
