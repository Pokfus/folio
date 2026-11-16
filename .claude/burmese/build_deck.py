#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Hindi shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1 is
BURMESE -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in the Myanmar script;
  · beneath it THE READING, Wiktionary's IPA, which writes the four tones (à low,
    á high, a̰ creaky, aʔ checked) and the word as it is said -- Burmese spelling
    keeps sounds that have merged, and a consonant is often voiced inside a word
    without the spelling changing.  The Alphabet deck, first in the collection,
    teaches the marks;
  · the meanings, grouped by part of speech, with the register where Wiktionary
    gives one (spoken, literary, polite, a man's or a woman's word);
  · one line of forms: a noun's CLASSIFIER, the word it is counted with (ကား: စီး),
    where Wiktionary names one; a word's induced creaky tone form, which marks
    possession in speech (မြန်မာ -> မြန်မာ့); its other forms (Wiktionary's "alternative forms": another spelling, or for a
    particle its alternants, as သ and the literary သည် for the spoken တယ်);
  · up to three example sentences (Wiktionary's own, then Tatoeba's), the word
    picked out.  No sentence carries a reading: Tatoeba gives none.

A HOMOGRAPH IS NARROWED.  Burmese short words are mostly several words in one
spelling (ကို a form of address, the object particle, "to"; ငါး "fish", "five"), and
English Wiktionary lists them historically, so the inventory names the part of
speech it teaches and the card shows only those entries; `ONLY` narrows further
where one part of speech holds several words (ကား, the noun, is a cloth, a plank
and a car).  A fill word shows its first three non-weak entries.

NO SPEAKER BUTTON, as on the Hausa and Amharic decks: few phones or browsers carry
a Burmese voice, and one asked for it without one reads in another voice or not at
all.  `speechLang: 'my-MM'` is still declared.

`Word` is the headword as printed, which the check and the next level's
de-duplication read.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from my import key
from burmese_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE, WHO

STAMP = '2026-11-15T00:00:00.000Z'
TYPE_ID = 'burmese'
COLOR = '#363B7F'          # the shelf's measured hue (app.js `lang-burmese`)
FIELDS = ['Burmese', 'Roman', 'Word', 'English', 'Forms', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'conj': 'conjunction',
            'particle': 'particle', 'intj': 'interjection', 'num': 'number',
            'phrase': 'phrase', 'prep': 'postposition', 'postp': 'postposition',
            'classifier': 'classifier'}
REGISTER = {'colloquial': 'spoken', 'informal': 'informal', 'literary': 'literary',
            'formal': 'formal', 'polite': 'polite', 'honorific': 'honorific',
            'familiar': 'familiar'}

WORD = ('<div class="uc-word">{{Burmese}}</div>'
        '{{#Roman}}<div class="uc-rom">{{Roman}}</div>{{/Roman}}')
ASK = '<div class="uc-ask">Say it in Burmese</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
FRONT_MY = WORD
BACK_MY = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape

# THE ENTRIES TO SHOW, where one part of speech holds several words: a gloss must
# contain one of these.  Each with its reason.
ONLY = {
    'ကား': (r'\bcar\b',),               # the noun is also a stretched cloth and a pestle's plank
    'တောင်': (r'mountain', r'south'),     # also a cubit and a wing
    'ကျောင်း': (r'school',),             # the noun's first gloss is "monastery; temple"
    'ဘုရား': (r'Buddha', r'pagoda'),      # its third gloss is royal and religious personages
    'မ': (r'^not\b',),                    # the particle is also a feminine suffix
    'ကျား': (r'tiger',),                 # also draughts and a roof stay
    'ရက်': (r'^day\b',),                  # also an extracted liquid
    'အင်္ဂါ': (r'Tuesday',),              # taught with the days; also a part of the body
    'ဆောင်း': (r'cold season', r'winter'),  # also a fishing basket and "to cover one's head"
    'မယ်': (r'future',),                  # the future particle; also titles for women
    'အရာ': (r'\bthing\b', r'\bobject\b'),  # its first entry is "hundreds"
    'ဓာတ်ပုံ': (r'photograph',),          # its first gloss is a reliquary stupa
    # A2 (2026-11-16)
    'မတ်': (r'^March$',),                # the noun is also a brother-in-law, a coin and the mark
    'ဇွန်': (r'^June$',),                 # also a jasmine
    'ကုတ်': (r'^coat$',),                 # the noun is also a lever
    'တူ': (r'nephew',),                  # also a hammer and chopsticks
    'ဘဲ': (r'^duck',),                   # also "boyfriend" (slang) and a ploughshare
    'ငန်း': (r'goose',),                 # also allotted work and a delirium
    'ခြင်': (r'mosquito',),              # also a rafter
    'ကျောက်': (r'^stone',),              # also smallpox and the back of an animal
    'ပိုး': (r'insect',),                # also the Pwo Karen
    'ချင်း': (r'ginger',),               # taught with food; the noun is ginger
    'ပြုတ်': (r'^to boil',),             # also "to be detached" and "to cry"
    'ဆူ': (r'^to boil',),                # also "to be noisy" and "to scold"
    'ကျွန်း': (r'island',),              # also teak
    'လယ်': (r'paddy field',),            # also the middle
    'ချေး': (r'lend',),                  # also excrement and a tree
    'ဆန်': (r'uncooked rice',),          # also "to go upstream"
    'ကြော်': (r'^to fry',),               # also "to shout loudly"
    'ဖိတ်': (r'^to invite',),             # the first verb is "to spill"
    'ဘုန်းကြီး': (r'^monk',),             # also a chess piece
    'ကိုက်': (r'^to bite', r'^to ache'),  # also "to come up to (expectations)"
    'ပွဲ': (r'public function|festival|fair',),
    # B1 (2026-11-16)
    'ထင်': (r'^to think',),                # the first verb gloss is "to be visible"
    'ခိုး': (r'^to steal',),               # also "to cause the eyes to smart"
    'ကျိုး': (r'^to break',),              # also a cripple and a consequence
    'သော': (r'particle',),                # the verb is "to joke"
    'အိမ်စာ': (r'homework',),             # also the house sparrow
    # B2 (2026-11-16)
    'ကန်': (r'^to kick',),                # the first verb is "to designate"; also a lake
    'သံ': (r'^iron',),                    # also an envoy and a voice
    'ချေ': (r'^to sneeze',),              # also "to rebut" and a barking deer
    'တူး': (r'^to dig',),                 # also "to be burnt"
    'စိန်': (r'diamond',),                # also arsenic
    'ကယ်': (r'^to save',),                # also "to be distended"
    'ခဲ': (r'^to freeze',),               # also a stone and lead
    'ဝါး': (r'^to chew',),                # also "to bluff"
}

# A GLOSS TO LEAD WITH inside an entry, where Wiktionary's first is not the everyday one.
LEAD = {
    'ကျောင်း': 'school',
    'ရထား': 'train',
    'မိုး': 'rain',
    'ငွေ': 'money',
    'ဆေး': 'medicine',
    'အရောင်': 'colour',
    'လက်မှတ်': 'ticket',                   # first listed is "certificate of qualification"
    'ဘွဲ့': 'academic degree',             # first listed is a title or award
}

POINTER = re.compile(r'^(alternative form of|alternative spelling of|form of|synonym of|'
                     r'abbreviation of|short for|contraction of|induced creaky tone form of)\b', re.I)

KEEP_CAP = re.compile(r"^(I|Buddha|Buddhist|Burmese|Myanmar|Burma|Monday|Tuesday|Wednesday|"
                      r"Thursday|Friday|Saturday|Sunday|English|January|February|March|April|"
                      r"May|June|July|August|September|October|November|December|Sir|God|"
                      r"Christian|Muslim|Hindu|Pali|Sanskrit|Shan|Mon|Karen|Chinese|Indian|American)\b")
# Wiktionary writes the Burmese months in lower case ("waso, the fourth month ..."), and the
# extraction "latin", "soviet": capitalised
BURMESE_MONTH = re.compile(r"^(tagu|kason|nayon|waso|wagaung|tawthalin|thadingyut|tazaungmon|nadaw|"
                           r"pyatho|tabodwe|tabaung|latin|soviet|islam|spanish)\b", re.I)   # and proper words (B1, B2)


def lower_first(g):
    if BURMESE_MONTH.match(g or ''):
        return g[0].upper() + g[1:]
    if not g or KEEP_CAP.match(g) or (len(g) > 1 and g[1].isupper()):
        return g
    return g[0].lower() + g[1:]


# "synonym of ရှာ (hra, “to seek, search”)": Wiktionary defines many Burmese compounds only by
# a synonym, quoting that word's gloss.  From A2 on the card takes the quoted gloss (ရှာဖွေ "to
# seek, search") rather than dropping the word; a synonym with no quoted gloss stays a pointer.
# A1 shipped before the rule and is built without it, so it stands byte for byte.
SYNONYM = re.compile(r'^synonym of \S+ \([^“”()]*“([^”]+)”\)$')


# A "gloss" that is a dictionary citation the extraction kept as a sense (အရေးယူ: "“အရေးယူ” in
# Myanmar–English Dictionary (Myanmar Language Commission 1993). Searchable online at SEAlang.net").
CITATION = re.compile(r'SEAlang|Myanmar–English Dictionary')


def resolve_synonym(g):
    m = SYNONYM.match(g['g']) if LEVEL != 'a1' else None
    return dict(g, g=m.group(1)) if m else g


def entries_for(row, lex):
    L = lex[row['key']]
    ents = [dict(e, glosses=[g for g in map(resolve_synonym, e['glosses'])
                             if not POINTER.match(g['g']) and not CITATION.search(g['g'])])
            for e in L['entries']]
    ents = [e for e in ents if e['glosses']]
    if row['pos']:
        ents = [e for e in ents if e['pos'] in row['pos']]
        ents.sort(key=lambda e: row['pos'].index(e['pos']))
    only = ONLY.get(row['key'])
    if only:
        ents = [e for e in ents if any(re.search(o, g['g']) for g in e['glosses'] for o in only)] or ents
    strong = [e for e in ents if any(not g['weak'] for g in e['glosses'])]
    ents = strong or ents
    return ents[:3]


def pos_label(e, own_register=True):
    label = POS_NAME.get(e['pos'], e['pos'])
    tv = {t for g in e['glosses'][:3] for t in g['tags']}
    if not own_register:            # the card is headed by another spelling (မနက် for နံနက်)
        tv -= set(REGISTER)
    reg = [REGISTER[t] for t in ('colloquial', 'informal', 'literary', 'formal', 'polite',
                                 'honorific', 'familiar') if t in tv and
           all(t in g['tags'] for g in e['glosses'][:3])]
    if reg:
        label += ', ' + ', '.join(reg)
    qs = {g['q'] for g in e['glosses'][:3] if g['q']}
    if len(qs) == 1 and all(g['q'] for g in e['glosses'][:3]):
        label += ', ' + qs.pop()
    if e['pos'] == 'verb':
        if 'transitive' in tv and 'intransitive' not in tv:
            label += ', transitive'
        elif 'intransitive' in tv and 'transitive' not in tv:
            label += ', intransitive'
    return label


def english(ents, k='', own_register=True):
    parts, shown = [], set()
    lead = LEAD.get(k)
    only = ONLY.get(k)
    for e in ents:
        gl, seen = [], set()
        src = e['glosses']
        if only:
            src = [g for g in src if any(re.search(o, g['g']) for o in only)] or src
        for g in src:
            if g['weak'] and gl:
                continue
            t = lower_first(g['g'])
            if t and t.lower() not in seen:
                seen.add(t.lower())
                gl.append(t)
        if lead:
            gl.sort(key=lambda x: lead not in x)
        gl = gl[:3]
        if not gl or all(x.lower() in shown for x in gl):
            continue
        shown.update(x.lower() for x in gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(pos_label(e, own_register))}</div>{body}</div>')
    return ''.join(parts)


def reading(ents, L, own=''):
    """The IPA of the first shown entry that has one, without its slashes; for a card
    headed by a pointer's spelling (မနက်), that page's own."""
    pool = [own] if own else [e['ipa'] for e in ents] + [e['ipa'] for e in L['entries']]
    for ipa in pool:
        r = (ipa or '').split(',')[0].strip().strip('/[]').strip()
        if r:
            return r
    return ''


# ---- forms -----------------------------------------------------------------------------
def fi(label, form):
    if not form:
        return ''
    return f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(form)}</span>'


def forms_line(ents, word, lemma_word):
    bits = []
    cls = []
    for e in ents:
        if e['pos'] == 'noun':
            cls += [c for c in e['cls'] if c not in cls]
    if cls:
        bits.append(fi('counted with', ' · '.join(cls[:2])))
    cr = next((e['creaky'] for e in ents if e.get('creaky')), '')
    if cr and key(cr) != key(word):
        bits.append(fi('possessive', cr))
    alts = [lemma_word] if key(lemma_word) != key(word) else []
    for e in ents:
        alts += [a for a in e['alts'] if key(a) != key(word) and a not in alts]
    if alts:
        bits.append(fi('other forms', ' · '.join(alts[:2])))
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


# ---- examples --------------------------------------------------------------------------
def mark(sentence, hits):
    """Bold the matched words.  The sentence has no spaces between words, so each hit is
    found as text -- only where the word cut found it (examples.py), longest first."""
    out = E(sentence)
    for h in sorted(set(hits), key=len, reverse=True):
        out = out.replace(E(h), f'\x00{E(h)}\x01', 1)
    return out.replace('\x00', '<b>').replace('\x01', '</b>')


def examples_html(exs):
    return ''.join(f'<div class="uc-exi"><div class="uc-exz">{mark(my, hits)}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>' for my, en, hits in exs)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        L = lex[r['key']]
        word = r['word']
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Burmese': f'<div class="uc-word">{E(word)}</div>',
            'Roman': E(reading(ents, L, r.get('ipa', ''))),
            'Word': word,
            'English': english(ents, r['key'], key(word) == r['key']),
            'Forms': forms_line(ents, word, L['word']),
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
        "Both study directions in one deck: Burmese → English (see the Burmese, recall the "
        "meaning) and English → Burmese (see an English meaning, recall the Burmese). Each "
        "direction is a card of its own with its own schedule, so recognising a word and "
        f"producing it are learnt separately. {n} words for {WHO[LEVEL]}, aligned to "
        f"{LEVEL.upper()} of the Common European Framework of Reference, whose global descriptor "
        f"begins '{SC['quote']}' — a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for Burmese, so this deck is not any examination's vocabulary and does not claim to be. "
        f"It is assembled from two things that can be stated. {from_inv} of the {n} come from a "
        f"vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words of the Burmese Wikipedia. Burmese "
        "writes no spaces between words, so that text was cut into words against the "
        "dictionary, and only words of two syllables or more are taken from the count (a "
        "one-syllable count also holds every piece the cut could not place). Burmese has two "
        "registers, the written and the spoken" +
        (". This level begins with the WRITTEN one: the literary particles and words (သည်, ၏, "
         "နှင့်, ဤ, ထို) that the A1 and A2 decks leave out and that a reader of a newspaper or a "
         "notice meets on every line; its fill is the written language of the Burmese Wikipedia, "
         "encyclopaedic in places (government, history, religion). English Wiktionary has fewer "
         "of this level's everyday words, so the vocabulary written for the level is short and "
         "the commonest remaining words are most of it. " if LEVEL == 'b1' else
         ". The literary particles were taught at B1; this level goes on with the written "
         "vocabulary of the Burmese Wikipedia, encyclopaedic in places (government, history, "
         "religion, science), and its own short list carries the everyday one-syllable verbs and "
         "nouns that a count of written text cannot reach. " if LEVEL == 'b2' else
         "; this deck teaches the SPOKEN one (တယ်, ရဲ့, နဲ့, ဒီ), while Wikipedia is written in "
         "the literary one (သည်, ၏, နှင့်, ဤ), whose particles are left for a later level — and "
         "its fill is encyclopaedic in places (government, history, religion). ") +
        "The cards are dealt by that frequency, so the words "
        "met most often come first. Only words English Wiktionary has an entry for can be "
        "taught here. Every word is in the Myanmar script, as Burmese is written; the Alphabet "
        "deck, first in this collection, teaches the letters and the tone marks. Beneath each "
        "word is its pronunciation in the International Phonetic Alphabet, as Wiktionary gives "
        "it, with the four tones marked: à low, á high, a̰ creaky, aʔ checked (short, with a "
        "catch). Many short Burmese words are several words in one spelling, so a card shows "
        "the meanings of the part of speech it teaches (ကို, the object particle; ငါး, five "
        "and fish). A noun shows the classifier it is counted with where Wiktionary names one. "
        f"Example sentences are few: {ex_any} of the {n} words have one, from Wiktionary's usage "
        "examples and from Tatoeba, which holds about 590 Burmese sentences; none is invented. "
        "There is no speaker button: few devices have a Burmese voice. Sources. Level: the "
        "Common European Framework of Reference (Council of Europe), global scale. Meanings, "
        "pronunciation and classifiers: English Wiktionary, via the kaikki.org extraction "
        "(CC BY-SA 4.0). Frequency: the Burmese Wikipedia, articles of the 2026-11-01 dump "
        "(CC BY-SA 4.0). Example sentences: English Wiktionary (CC BY-SA 4.0) and Tatoeba "
        "(tatoeba.org), CC BY 2.0 FR."
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
        'tags': ['burmese', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Burmese vocabulary', 'speechLang': 'my-MM',
            'fields': FIELDS,
            'cards': [
                {'name': 'Burmese → English', 'front': FRONT_MY, 'back': BACK_MY},
                {'name': 'English → Burmese', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Burmese')
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
