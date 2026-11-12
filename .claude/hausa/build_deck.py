#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / TORFL / Hindi shape.  The word is a single
record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps its own schedule.  Card 1
is HAUSA -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES:
  · the headword in the ordinary spelling, as Hausa is written (Boko, hooks
    included), with Wiktionary's TONED form beneath it (ruwā, màcḕ: the owner's
    decision, 2026-11-09) -- high tone unmarked, a grave for low, a circumflex
    for falling, a macron for a long vowel.  A hand-glossed word (`hand.py`) has
    no toned form and shows none;
  · the meanings, grouped by part of speech, a noun's GENDER in its label --
    Hausa has two, and the linker (-n / -r), the copula (ne / ce) and every
    "his / her" agree with it;
  · one line of key forms: a noun's plural (Hausa plurals are many and mostly
    unpredictable: mutum / mutane, gida / gidaje), an adjective's feminine and
    plural, a noun's feminine where it has one;
  · up to three Tatoeba sentences, the word picked out.

NO SPEAKER BUTTON.  The other language decks put one beside the headword, but
almost no device carries a Hausa voice, and a browser asked for `ha-NG` without
one reads the word in its default voice -- English, in practice -- which
teaches a wrong pronunciation rather than none.  The type still declares
`speechLang: 'ha-NG'`: the site reads it to leave the card's Hausa alone
(`spellTree`), and a voice that ever arrives is one template change away.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ha import norm, loose, untone
from hausa_level import LEVEL, LEX, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE, LEARNER

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'hausa'
COLOR = '#665487'          # measured (app.js "lang-hausa"; docs/hausa-decks-plan.md)
FIELDS = ['Hausa', 'Tone', 'Word', 'English', 'Forms', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'conj': 'conjunction',
            'particle': 'particle', 'intj': 'interjection', 'num': 'number',
            'phrase': 'phrase', 'prep': 'preposition', 'prep_phrase': 'phrase',
            'proverb': 'proverb', 'name': 'proper noun'}
GENDER = {'m': 'masculine', 'f': 'feminine', 'mf': 'masculine or feminine'}

WORD = ('<div class="uc-word">{{Hausa}}</div>'
        '{{#Tone}}<div class="uc-rom" title="tone and vowel length">{{Tone}}</div>{{/Tone}}')
ASK = '<div class="uc-ask">Say it in Hausa</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
FRONT_HA = WORD
BACK_HA = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape


# WHICH ENTRIES A CARD SHOWS.  By default: the hand entry (if any) first, then the
# FIRST etymology Wiktionary lists -- Hausa homographs from unrelated sources are many
# (`kare` "dog" and "quarter of a city", `sau` "foot" and "times") and a beginner's card
# that offers all of them teaches the noise.  A proper-name entry is never shown beside
# a common one (`uwa` "mother" is also a given name).  Where the default is wrong, the
# word is named here, with its reason; 'hand' is the hand gloss's group.
ETYMS = {
    'kai': ['1', '2'],        # "you (a man)" AND "head", both A1
    'sau': ['2'],             # "times" (sau biyu, twice); 1 is "foot, footprint"
    'bara': ['4'],            # "last year"; 1-3 are servant, beggar, aim
    'ƙawa': ['2'],            # "a woman's female friend"; 1 is "fondness"
    'tana': ['hand'],         # "she is …-ing"; Wiktionary has only "earthworm"
    'daga': ['hand'],         # "from"; Wiktionary has a bangle-charm and a struggle
    'bisa': ['hand'],         # "on, upon"; Wiktionary has only "pack animal"
    'tsada': ['hand'],        # "expensiveness"; Wiktionary has only a bird
    'fara': ['hand'],         # "to begin"; Wiktionary has only "locust"
    'jika': ['hand'],         # "grandchild"; Wiktionary has only "on the body"
    'mata': ['hand'],         # "wife; women"; Wiktionary's "woman" would share mace's English side
    'sa': ['hand'],           # "to put, to make"; Wiktionary has only "bull"
    'kada': ['hand'],         # "don't"; Wiktionary has only "crocodile"
    'fita': ['hand'],         # "to go out"; Wiktionary has only "graduation"
    'koma': ['hand'],         # "to go back"; Wiktionary has only "fishing net"
    'hau': ['hand'],          # "to climb, to ride"; Wiktionary has only "misfortune"
    'sake': ['hand'],         # "to do again"; Wiktionary has only "slackness"
    'ka': ['hand'],           # "you (completive)"; Wiktionary's only entry is an adverb "in or on"
    'wanka': ['1', '2'],      # "bathing" AND "to wash"
    'kofi': ['1', '2'],       # "cup" AND "coffee"
    # A2 (2026-11-12): verbs whose spelling Wiktionary has only as a rarer noun
    'goge': ['hand'],         # "to rub, to polish"; Wiktionary has only the fiddle
    'maye': ['hand'],         # "to replace"; Wiktionary has only "drunkenness"
    'fashe': ['hand'],        # "to burst"; Wiktionary has only a children's game
    'kori': ['hand'],         # "to chase away"; Wiktionary has only "curry"
    'makara': ['hand'],       # "to be late"; Wiktionary has only "bier"
    'taru': ['hand'],         # "to gather"; Wiktionary has only "large fishing net"
    'komo': ['hand'],         # "to come back"; Wiktionary has only "misshapen calabash"
    'sara': ['hand'],         # "to chop"; Wiktionary has only "habit, custom"
    'dage': ['hand'],         # "to persevere"; Wiktionary has only "honey badger"
    'rama': ['hand'],         # "to retaliate"; Wiktionary has hemp and emaciation
    'tofa': ['hand'],         # "to spit"; Wiktionary has only elephant grass
    'ishe': ['hand'],         # "to suffice, to reach"; Wiktionary has only "to overtake"
    'laima': ['hand'],        # "umbrella"; Wiktionary has "tent" and "dampness"
    'baƙo': ['hand'],         # "guest, stranger"; Wiktionary has only the given name
    'ango': ['hand'],         # "bridegroom"; Wiktionary has only the given name
    'maraya': ['3'],          # "orphan"; 1 is "city", 2 the kob antelope
    'lalle': ['2', '1'],      # "certainly" first, then "henna"
    'safa': ['2', '1'],       # "socks" (the clothes topic) first, then the intercity bus
    'riba': ['2', '1'],       # "profit" first, then "bank interest"
    'tsaka': ['2'],           # "in the middle" (da rana tsaka); 1 is a gecko
    'illa': ['2', '1'],       # "harm, fault" (its count) first, then "except"
    'dawa': ['1', '2'],       # "sorghum" AND "the bush" (namun dawa, wild animals)
}

# WHICH PARTS OF SPEECH A CARD SHOWS, where Wiktionary adds a reading that is noise on a
# beginner's card: an adverb that is only the noun's locative ("in or on the ear"), a
# noun that is only the adjective used as one, a plant named for its dye.
POS_ONLY = {
    'rawaya': ['adj'],                  # "yellow"; the noun is Cochlospermum tinctorium
    'kunne': ['noun'], 'hanci': ['noun'], 'ruwa': ['noun'],
    'baƙi': ['adj'], 'fari': ['adj'], 'ɗari': ['num'],
    'dogo': ['adj'], 'gajere': ['adj'], 'ƙarami': ['adj'],
    'albarka': ['noun'],                # its interjection is a bargaining refusal
}

# A GENDER CORRECTED, with its reason.  Wiktionary's head template is the only source
# of gender here and it is right far more often than not; where it is not, the card says
# what the standard dictionaries say.
GENDER_FIX = {
    'littafi': 'm',           # head says f, but its own possessed form littāfìn and every
                              # dictionary (littafi m., pl. littattafai) make it masculine
}

# A TONE LINE WITHHELD, where Wiktionary's toned head is another spelling of the word
# (the line must untone to the headword; `check-hausa.js` asserts it).
TONE_OFF = {
    'tsintsiya': 'tsintsinyā',    # the head spells the variant tsintsinya
}

# A WORD PRINTED OTHERWISE THAN ITS KEY: the language's name is written with a capital.
WORD_AS = {'hausa': 'Hausa',
           # Wiktionary has these only as given names, so its spelling is capitalised
           'Baƙo': 'baƙo', 'Ango': 'ango'}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech -- where its
# first senses are not the everyday ones, or a second one would mislead a beginner.
GLOSS = {
    'hutu': {'noun': ['rest, holiday']},
    "al'ada": {'noun': ['custom, practice, habit']},
    'jini': {'noun': ['blood']},
    'jaka': {'noun': ['bag']},
    'dala': {'noun': ['dollar']},
    'lamba': {'noun': ['number; sign, mark']},
    'harshe': {'noun': ['tongue; language']},
    'jirgi': {'noun': ['vehicle, craft (jirgin sama, aeroplane; jirgin ƙasa, train; jirgin ruwa, ship)']},
    'tuwo': {'noun': ['tuwo: a stiff porridge of grain or cassava, eaten with soup']},
    'miya': {'noun': ['soup, sauce (eaten with tuwo)']},
    'barka': {'intj': ['greetings!, congratulations! (barka da safe, good morning)']},
    'hausa': {'noun': ['Hausa (the language)', 'language; meaning']},
    'turanci': {'name': ['English (the language)']},
    'jimla': {'noun': ['sentence (in grammar)', 'sum, total']},
    'baba': {'noun': ['father', "a term of address for a man of one's father's age"]},
    'aboki': {'noun': ['friend', 'companion']},
    'yaro': {'noun': ['boy, child', 'servant, follower']},
    'malam': {'noun': ['teacher, a learned man', 'Mr (a title of respect)']},
    'ganye': {'noun': ['leaf', 'leafy vegetables']},
    'igiya': {'noun': ['rope, string', 'cable']},
    'ɗan': {'noun': ['son of; a native of, one who does (ɗan Kano, a man from Kano)',
                     'little, small (before a noun: ɗan yaro, a little boy)']},
}


def entries_for(row, lex):
    L = lex[row['key']]
    ents = [e for e in L['entries'] if any(not g['weak'] and g['g'] for g in e['glosses'])] \
        or L['entries']
    if any(e['pos'] != 'name' for e in ents):
        ents = [e for e in ents if e['pos'] != 'name']
    groups = []
    for e in ents:
        g = e.get('etym', '')
        if g not in groups:
            groups.append(g)
    word = untone(L['word'])
    if word in ETYMS:
        keep = ETYMS[word]
    else:
        keep = (['hand'] if 'hand' in groups else []) + [g for g in groups if g != 'hand'][:1]
    ents = sorted([e for e in ents if e.get('etym', '') in keep],
                  key=lambda e: keep.index(e.get('etym', '')))
    if word.lower() in POS_ONLY:
        ents = [e for e in ents if e['pos'] in POS_ONLY[word.lower()]]
    if row['pos']:
        ents = sorted(ents, key=lambda e: e['pos'] != row['pos'])
    out, seen = [], {}
    for e in ents:
        k = (e['pos'], e['src'])
        if k in seen:
            out[seen[k]]['glosses'] += e['glosses']
            continue
        seen[k] = len(out)
        out.append(dict(e, glosses=list(e['glosses']), forms=list(e['forms']),
                        gender=GENDER_FIX.get(word, e['gender']) if e['pos'] == 'noun' else e['gender']))
    return out[:3]


def english(ents, word='', toned=''):
    parts, shown = [], set()
    word = word.lower()
    for e in ents:
        label = POS_NAME.get(e['pos'], e['pos'])
        if e['pos'] == 'noun' and e['gender'] in GENDER:
            label += ', ' + GENDER[e['gender']]
        # A READING SAID DIFFERENTLY from the one under the headword says so in its own
        # label: `kai` "you" is kai, `kai` "head" is kâi.
        if e['src'] == 'wiktionary' and e['toned'] and e['toned'] != toned:
            label += ' · ' + e['toned']
        gl, seen = [], set()
        for g in e['glosses']:
            if g['weak'] and gl:
                continue
            t = re.sub(r'\s*[:;,]\s*$', '', g['g'])
            if t and t not in seen:
                seen.add(t)
                gl.append(t)
        if e['src'] == 'wiktionary' and e['pos'] in GLOSS.get(word, {}):
            gl = list(GLOSS[word][e['pos']])
        gl = gl[:3]
        if not gl or all(x in shown for x in gl):
            continue
        shown.update(gl)
        body = (f'<div class="uc-gl">{E(gl[0])}</div>' if len(gl) == 1 else
                '<ol class="uc-gls">' + ''.join(f'<li>{E(x)}</li>' for x in gl) + '</ol>')
        parts.append(f'<div class="uc-sense"><div class="uc-pos">{E(label)}</div>{body}</div>')
    return ''.join(parts)


def fi(label, fm, word):
    if not fm:
        return ''
    plain = untone(fm['f'])
    tone = fm['t'] if fm['t'] and fm['t'] != plain else ''
    return (f'<span class="uc-fi"><span class="uc-fl">{E(label)}</span>{E(plain)}'
            + (f'<span class="uc-fr">{E(tone)}</span>' if tone else '') + '</span>')


def forms_line(ents, word):
    bits = []
    for e in ents:
        if e['pos'] not in ('noun', 'adj'):
            continue
        pl = [x for x in e['forms'] if x['k'] == 'plural' and norm(x['f']) != norm(word)]
        fe = [x for x in e['forms'] if x['k'] == 'feminine' and norm(x['f']) != norm(word)]
        for x in fe[:1]:
            bits.append(fi('feminine', x, word))
        for x in pl[:2]:
            bits.append(fi('plural', x, word))
        if bits:
            break
    return f'<div class="uc-forms">{"".join(bits)}</div>' if bits else ''


def mark(sentence, hits):
    hs = set(hits)
    out = []
    for piece in re.split(r"([^\W\d_]+(?:['’ʼ][^\W\d_]+)*)", sentence):
        if piece and norm(piece) in hs:
            out.append(f'<b>{E(piece)}</b>')
        else:
            out.append(E(piece))
    return ''.join(out)


def examples_html(exs):
    return ''.join(f'<div class="uc-exi"><div class="uc-exz">{mark(ha, hits)}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>' for ha, en, hits in exs)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        word = untone(r['word'])
        word = WORD_AS.get(word, word)
        # THE TONE LINE IS THE FIRST READING'S, and only when that reading is Wiktionary's:
        # under a hand-glossed `suna` "they are …-ing" the toned sūnā of "name" would be a
        # wrong pronunciation of the word the card opens on.
        toned = ents[0]['toned'] if ents[0]['src'] == 'wiktionary' else ''
        if word in TONE_OFF:
            toned = ''
        if word in WORD_AS.values() and toned:
            toned = toned[:1].upper() + toned[1:]
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Hausa': E(word),
            'Tone': E(toned),
            'Word': word,
            'English': english(ents, word, ents[0]['toned'] if ents[0]['src'] == 'wiktionary' else ''),
            'Forms': forms_line(ents, word),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': ents[0]['pos'], 'source': r['source'],
                        'examples': len(ex), 'toned': bool(toned),
                        'hand': any(e['src'] == 'hand' for e in ents)})
    return cards, entries


def desc(entries, n):
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    ex3 = sum(1 for e in entries if e['examples'] == 3)
    ex0 = sum(1 for e in entries if e['examples'] == 0)
    hand = sum(1 for e in entries if e['hand'])
    toned = sum(1 for e in entries if e['toned'])
    SC = SCOPE[LEVEL]
    EX_NOTE = ('Every word carries three real example sentences' if ex3 == n else
               f'Real example sentences come with {n - ex0} of the {n} words, three apiece for '
               f'{ex3} of them')
    return (
        "Both study directions in one deck: Hausa → English (see the Hausa, recall the meaning) "
        "and English → Hausa (see an English meaning, recall the Hausa). Each direction is a card "
        "of its own with its own schedule, so recognising a word and producing it are learnt "
        f"separately. {n} words for {LEARNER[LEVEL]}, aligned to {LEVEL.upper()} of the Common European "
        f"Framework of Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
        f"is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: no exam board publishes a graded word list "
        "for Hausa, so this deck is not any examination's vocabulary and does not claim to be. It "
        f"is assembled from two things that can be stated. {from_inv} of the {n} come from a "
        f"vocabulary written for the level's scope — {SC['topics']} — and the other "
        f"{n - from_inv} are the commonest remaining words in the Tatoeba collection of Hausa "
        "sentences, counted by the WHOLE word (a noun's plural and its forms with the linker and "
        "the possessive endings added together). The cards are dealt by that frequency, so the "
        "words you meet most often come first. "
        "Every headword is printed as Hausa is ordinarily written, in the Latin alphabet with its "
        "hooked letters (ɓ ɗ ƙ and 'y); beneath it, where English Wiktionary gives one, is the "
        "same word with its TONES and VOWEL LENGTH marked, which ordinary writing leaves out: a "
        "high tone is unmarked, a low tone takes a grave accent (à), a falling tone a circumflex "
        f"(â), and a long vowel a macron (ā) — ruwā 'water', màcḕ 'woman'. {toned} of the {n} "
        f"words have that line. {hand} of the {n} are glossed by Folio itself rather than taken "
        "from Wiktionary, which lacks some of the commonest words in the language (yi 'to do', "
        "tafi 'to go', da 'and, with'); those carry no tone line, since a tone that no source "
        f"states is not printed. The nouns show their gender, masculine or feminine, and their "
        "plural, which in Hausa is seldom predictable, wherever the source gives them. " + EX_NOTE + ", with the word picked "
        "out in colour; the sentences are as Tatoeba's contributors wrote them, which is not always "
        "with the hooks. There is no read-aloud button: few devices carry a Hausa voice, and one "
        "without it reads the word in English. The Hausa Alphabet deck, the first in this "
        "collection, teaches the hooked letters and the other sounds English spelling has no "
        "letter for. Sources. Level: the Common European Framework of Reference (Council of "
        "Europe), global scale. Meanings, tone, gender and plurals: English Wiktionary, via the "
        "kaikki.org extraction (CC BY-SA 4.0), and Folio's own glosses for the words it lacks. "
        "Frequency and example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open(LEX, encoding='utf-8'))
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
        'tags': ['hausa', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Hausa vocabulary', 'speechLang': 'ha-NG',
            'fields': FIELDS,
            'cards': [
                {'name': 'Hausa → English', 'front': FRONT_HA, 'back': BACK_HA},
                {'name': 'English → Hausa', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Hausa')
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
