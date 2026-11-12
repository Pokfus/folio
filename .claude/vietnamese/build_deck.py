#!/usr/bin/env python3
"""Build the cards and write the .folio-deck.json file.

    python3 build_deck.py      (from the cache directory, by run.py)

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / TORFL / Hindi shape.  The word is a
single record and the two directions are card TEMPLATES, so a corrected gloss
is corrected both ways at once and each direction keeps its own schedule.
Card 1 is VIETNAMESE -> ENGLISH, the easier direction and the one met first.

WHAT A CARD CARRIES -- and what it does not, since Vietnamese does not inflect:
no plural, no gender, no conjugation, so no forms line and no tables.  In their
place, the three things a Vietnamese word does carry:
  · its TONES, one name per syllable (ngang, huyền, sắc, hỏi, ngã, nặng), read
    off the spelling's own marks (`vi.tone`) -- a fact of the spelling, so it
    cannot disagree with the headword above it;
  · a noun's CLASSIFIERS, the words that stand between a number and the noun
    (`hai CON mèo`, `một CÁI bàn`), as Wiktionary lists them;
  · for a Sino-Vietnamese word, the CHARACTERS it was borrowed from (học sinh,
    學生), from Wiktionary's etymology -- never guessed for a word it does not
    trace;
  · the pronunciation in IPA, Hanoi and Saigon side by side where Wiktionary
    gives both, because the two standards differ audibly (`nhà` is alike in
    both, `không` is [xəwŋ͡m] and [kʰəwŋ͡m]);
  · up to three Tatoeba sentences, the word picked out, with a speaker.

The speaker reads the `Word` field, the bare headword (`vi-VN`).
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vi import fold, nfc, tokens, tone, TONE_NAMES
from vietnamese_level import LEVEL, f, TITLES, DECK_IDS, DECK_FILES, NAMES, SCOPE

STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'vietnamese'
COLOR = '#14659F'          # the measured hue (`app.js`, `lang-vietnamese`)
FIELDS = ['Vietnamese', 'Word', 'Tones', 'English', 'Notes', 'Sound', 'Examples']

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'det': 'determiner', 'conj': 'conjunction',
            'particle': 'particle', 'intj': 'interjection', 'num': 'number',
            'phrase': 'phrase', 'prep': 'preposition', 'proverb': 'proverb',
            'classifier': 'classifier'}
TAG_NAME = {'Northern': 'Northern', 'Southern': 'Southern', 'colloquial': 'colloquial',
            'formal': 'formal', 'informal': 'informal', 'familiar': 'familiar',
            'polite': 'polite', 'honorific': 'honorific', 'slang': 'slang'}

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = ('<div class="uc-word">{{Vietnamese}}' + SAY + '</div>'
        '{{#Tones}}<div class="uc-tone">{{Tones}}</div>{{/Tones}}')
ASK = '<div class="uc-ask">Say it in Vietnamese</div><div class="uc-field">{{English}}</div>'
NOTES = '{{#Notes}}{{Notes}}{{/Notes}}'
TAIL = ('{{#Sound}}<div class="uc-ipa">{{Sound}}</div>{{/Sound}}'
        '{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
FRONT_VI = WORD
BACK_VI = '{{FrontSide}}' + NOTES + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + NOTES + TAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card.css'),
           encoding='utf-8').read()

E = html.escape

TRAIL = re.compile(r'\s*[:;,]\s*$')

# ONE ETYMOLOGY PER CARD.  Vietnamese is full of homographs from unrelated sources,
# which Wiktionary files as numbered etymologies -- `là` "to be" and "fine silk" and
# "to iron", `cần` "to need" and "water parsnip", `thích` "to like" and "maple", `bố`
# "father" and "burlap" -- and a beginner's card that offers all of them teaches the
# noise (and shows the wrong one's classifier and characters).  The etymology kept is
# the one holding the part of speech the inventory names, else the first with a
# meaning that is not weak, unless it is named here:
ETYMS = {
    'là': ['2'],        # "to be"; 1 is "fine silk"
    'kẻ': ['1'],        # "person, (pejorative) guy"; 2 is "to draw a line"
    'chỉ': ['2', '3'],  # "only" and "to point"; 1 is "thread"
    'ba': ['2', '1'],   # "three" and (Southern) "father", both everyday
    'má': ['2'],        # (Southern) "mother"; 1 is "cheek"
    'trà': ['2'],       # "tea"; 1 is "one's spectrum of age"
    'súng': ['2'],      # "gun"; 1 is "water lily"
    'đồng': ['3'],      # "dong (the currency); copper"; 1 is "field"
    'ôi': ['2'],        # "oh, alas"; 1 is "tainted (meat)"
    # read off the A2 deck (2026-11-12)
    'thắng': ['2'],     # "to win; victory"; 1 is "brake"
    'dù': ['2'],        # "even if, although"; 1 is "umbrella"
    'báo': ['2'],       # "to report; newspaper"; 1 is "leopard"
    'bài': ['2'],       # "lesson; exercise"; 1 is "playing card"
    'thương': ['2'],    # "to love, to feel sorry for"; 1 is "spear"
    'ghét': ['2'],      # "to hate"; 1 is "dirt"
    'dừng': ['2'],      # "to stop"; 1 is a bamboo wall material
    'kiếm': ['2'],      # "to seek, to find"; 1 is "sword"
    'bức': ['2'],       # the classifier for walls, letters, pictures; 1 is "to coerce"
    'tí': ['2'],        # "a little bit"; 1 is "breast"
    'công': ['3', '2'], # "work, accomplishment" and "labour"; 1 is "peafowl"
    'cầu': ['2'],       # "bridge"; 1 is "shuttlecock"
    'đông': ['2'],      # "east" (the inventory's sense); 1 is "winter", which mùa đông teaches
    'chả': ['2'],       # "not at all", the subtitles' word; 1 is "patty"
    'lừa': ['3', '1'],  # "to trick" and "donkey"; 2 is "to pick out"
    'thú': ['2'],       # "animal"; 1 is "a hobby"
    'sang': ['2'],      # "to go over, to cross"; 1 is "luxurious"
    'may': ['2'],       # "lucky"; 1 is "to sew"
    'mối': ['3'],       # the classifier for relationships; 1 is "termite"
    'ca': ['4', '3'],   # "shift" and "case"; 1 is "mug"
    'cú': ['3', '1'],   # the classifier for a blow or a shot, and "owl"
    'động': ['2'],      # "to touch" (đừng động vào); 1 is "cave"
    'đàn': ['1', '2'],  # "flock, herd" and "a string instrument; to play one"
    # read off the B1 deck (2026-11-12)
    'hầm': ['2', '1'],  # "basement, cellar" (the subtitles' bunker) and "to stew"
    'tiểu': ['2'],      # "to urinate"; 1 is a terracotta sarcophagus
    'dần': ['2'],       # "gradually"; 1 is "to tenderize (meat)"
    'sát': ['2'],       # "very close to"; 1 is a fortune-telling term
    'chớ': ['1'],       # "do not"; 2 is "four"
    'tách': ['2'],      # "to separate"; 1 is "cup"
    'phân': ['2'],      # "to divide; a centimetre"; 1 is "faeces"
    'thức': ['2'],      # "to stay awake"; 1 is "food"
    'thông': ['2'],     # "to go through; to understand"; 1 is "pine"
    'cút': ['3'],       # "get lost!"; 1 is "quail"
    'nguyên': ['2'],    # "intact, whole"; 1 is "yuan"
    'lao': ['2'],       # "to dash, to plunge; javelin"; 1 is "tuberculosis"
    'bớt': ['2'],       # "to reduce"; 1 is "birthmark"
    'lau': ['2'],       # "to wipe" (the inventory's chores); 1 is "reed"
    'toán': ['2'],      # "mathematics" (the inventory's); 1 is "gang"
    'bầu': ['2', '1'],  # "to vote, to elect" and "gourd; pregnant"
    # read off the B2 deck (2026-11-12)
    'két': ['2'],       # "safe, strongbox"; 1 is "parrot"
    'chế': ['2'],       # "to mock, to parody"; 1 is "to pour"
    'can': ['2', '3'],  # "to concern; to be involved" and "to intervene"; 1 is "liver"
    'nốt': ['3'],       # "finish (doing something)"; 1 is "(musical) note"
    'ối': ['3'],        # the exclamation; 1 is "amniotic fluid"
    'kì': ['3', '2'],   # "strange" and "period, term"; 1 is "to rub off"
    'tất': ['2'],       # "all, the whole of"; 1 is "then surely"
    'đăng': ['2'],      # "to publish, to post"; 1 is "fixed gillnet"
    'còng': ['2'],      # "handcuffs"; 1 is a fiddler crab
    'ám': ['2'],        # "to haunt; clandestine"; 1 is a fish dish
    'tra': ['2'],       # "to investigate"; 1 is "to haft"
    'sướng': ['2'],     # "very happy"; 1 is a rice-seedling field
    'ráng': ['2'],      # "to try hard"; 1 is "evening glow"
    'vạn': ['1'],       # "ten thousand"; 2 is a temple for whale worship
    'căm': ['1'],       # "to resent"; 2 is "spoke (of a wheel)"
    'dạo': ['2', '3'],  # "to stroll" and "lately"; 1 is a musician's prelude
    # read off the C1 deck (2026-11-12)
    'mò': ['2'],        # "to grope"; 1 is a herbaceous plant
    'cáu': ['2'],       # "to be angry"; 1 is "dirt"
    'ưng': ['2'],       # "to like and accept"; 1 is "hawk"
    'xui': ['1'],       # "unlucky"; 2 is "to induce"
    'bê': ['2', '1'],   # "to carry with both hands" and "calf"
    'phà': ['2'],       # "ferry"; 1 is "to blow air out"
}

# A PART OF SPEECH TO LEAD WITH, where Wiktionary's first entry is not the everyday word.
LEAD_POS = {
    'bị': 'verb',       # the passive of misfortune; the noun is "sack"
    'của': 'prep',      # "of"; the noun is "property"
    'ồ': 'intj',        # "oh, wow"; the verb is "to rush"
    'bài': 'noun',      # "lesson; exercise"; the verb is "to oppose"
    'máy': 'noun',      # "machine"; the verb is "to move around"
    'tấm': 'classifier',
    'kẹo': 'noun',
    'bấm': 'verb',      # "to press, to click"; the noun is "nail clipper"
    'chĩa': 'verb',     # "to point (a weapon) at"; the noun is "pitchfork"
    'mớ': 'noun',       # "a whole lot, a bundle"; the verb is "to talk in one's sleep"      # "sweets, candy"; the adjective is "thickened by boiling"    # for flat things; the noun is "broken rice"
}

# A GLOSS TO LEAD WITH, where Wiktionary's first is not the everyday one.
LEAD = {
    'máy': 'machine',   # Wiktionary's first noun gloss is "effect; mechanism", tagged rare
    'thú': 'animal',    # its first is "non-avian beast"
    'thẻ': 'card',      # its first is a stick in the game of pitch-pot
    'sân khấu': 'stage',    # its first is a royal court, tagged historical
}

# A GLOSS WRITTEN HERE, replacing Wiktionary's for one part of speech, each with its reason.
GLOSS = {
    # Wiktionary's own "big" gloss, which it tags Southern-colloquial (weak here) and puts after
    # "covered (with)", a sense the subtitles hardly use
    'bự': {'adj': ['big (in size or importance); great; influential']},
    # Wiktionary's own "maize, corn" (tagged Southern) and "muscle", without "blossom, inflorescence" first
    'bắp': {'noun': ['maize, corn', 'muscle']},
}

# Entries of these parts of speech are left off a card whose word has others, each with its reason.
DROP_POS = {
    'có': {'noun'},     # "the left side of the balance sheet", an accountant's term
    'ba': {'adj', 'det'},   # "secondborn", "some": they crowded "father" off the card
    'máy': {'verb'},    # "to move around; to touch", which crowded "machine" down the card
    'tấm': {'noun'},    # "broken rice grains", a different word from the classifier
    'kẹo': {'adj', 'num'},  # "thickened by boiling" and a dialect "five"
}

# Glosses left off a card, by a piece of their text, each with its reason.
CUT = {
    'của': ['given kind of food', 'such trash'],   # colloquial uses that mislead on a card for "of"
    'xe': ['chariot', 'rook'],                     # the xiangqi piece, not the vehicle
    'em': ['described by the noun em above'],      # refers to Wiktionary's own layout
    'cô bé': ['vulva'],                            # a slang sense, on a card for "little girl"
    'gái': ['whores'],                             # a slur, on a card for "girls and women"
    'trai': ['gigolos'],                           # likewise, on a card for "boys and men"
    'chủ nhà': ['Used other than'],                # refers to Wiktionary's own layout
    'chi': ['genus'],                              # the biologist's term, ahead of "to spend"
    'tâm hồn': ['breasts'],                        # a slang sense, on a card for "soul"
    'hôn mê': ['retarded', 'mentally challenged'], # a slur ahead of "comatose", the word's meaning
    'nháy': ['sex'],                               # a slang sense, on a card for "to flash, to wink"
}

# Wiktionary's note on a sum-of-parts entry ("Used other than figuratively or idiomatically: see
# không, dám") points at its own layout rather than giving a meaning: never a gloss on a card.
SUM_OF_PARTS = 'Used other than figuratively or idiomatically'


def entries_for(row, lex):
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    word = row['word']
    allents = L['entries']
    good = lambda e: any(not g['weak'] for g in e['glosses'])
    groups = []
    for e in allents:
        if e['etym'] not in groups:
            groups.append(e['etym'])
    keep = ETYMS.get(word)
    want = row['pos'] or LEAD_POS.get(word, '')
    if not keep and want and any(e['pos'] == want for e in allents):
        keep = [next((e['etym'] for e in allents if e['pos'] == want and good(e)),
                     next(e['etym'] for e in allents if e['pos'] == want))]
    if not keep:
        keep = [next((e['etym'] for e in allents if good(e)), groups[0])]
    ents = [e for e in allents if e['etym'] in keep]
    # an entry is dropped when every meaning is weak -- unless it is the part of speech
    # the inventory asked for (`họ` "they" is tagged formal and dialectal, `anh trai`
    # "elder brother" literary, and each is still the word the card is for)
    ents = [e for e in ents if good(e) or (row['pos'] and e['pos'] == row['pos'])] or ents
    ents.sort(key=lambda e: keep.index(e['etym']))
    if word in DROP_POS:
        ents = [e for e in ents if e['pos'] not in DROP_POS[word]] or ents
    lead = row['pos'] or LEAD_POS.get(word, '')
    if lead:
        ents = sorted(ents, key=lambda e: e['pos'] != lead)
    out, seen = [], {}
    for e in ents:
        if e['pos'] in seen:
            out[seen[e['pos']]]['glosses'] += e['glosses']
            continue
        seen[e['pos']] = len(out)
        out.append(dict(e, glosses=list(e['glosses'])))
    return out[:3]


def gloss_line(g):
    t = TRAIL.sub('', g['g'])
    tags = [TAG_NAME[x] for x in g['tags'] if x in TAG_NAME]
    if 'Northern' in tags and 'Southern' in tags:      # both is neither (`trà` "tea")
        tags = [x for x in tags if x not in ('Northern', 'Southern')]
    if tags and t:
        t += ' (' + ', '.join(tags) + ')'
    return t


def english(ents, word=''):
    parts, shown = [], set()
    for e in ents:
        label = POS_NAME.get(e['pos'], e['pos'])
        tv = {t for g in e['glosses'] for t in g['tags']}
        gl, seen = [], set()
        for g in e['glosses']:
            if g['weak'] and gl:
                continue
            if any(c in g['g'] for c in CUT.get(word, ())) or g['g'].startswith(SUM_OF_PARTS):
                continue
            t = gloss_line(g)
            if t and t not in seen:
                seen.add(t)
                gl.append(t)
        if e['pos'] in GLOSS.get(word, {}):
            gl = list(GLOSS[word][e['pos']])
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


def tones_line(word):
    return ' · '.join(TONE_NAMES[tone(s)] for s in tokens(word))


def notes_line(ents):
    bits = []
    # THE LEAD ENTRY'S OWN classifier and characters, never another part of speech's
    cls = ents[0]['cls'] if ents[0]['pos'] == 'noun' else []
    if cls:
        bits.append(f'<span class="uc-ni"><span class="uc-fl">classifier</span>{E(", ".join(cls[:4]))}</span>')
    sino = ents[0]['sino']
    if sino:
        bits.append(f'<span class="uc-ni"><span class="uc-fl">Sino-Vietnamese</span>'
                    f'<span class="uc-han" lang="zh-Hant">{E(sino)}</span></span>')
    return f'<div class="uc-notes">{"".join(bits)}</div>' if bits else ''


def sound_line(ents):
    e = next((e for e in ents if e['hn'] or e['sg']), None)
    if not e:
        return ''
    out = []
    if e['hn']:
        out.append(f'<span>Hanoi {E(e["hn"])}</span>')
    if e['sg'] and e['sg'] != e['hn']:
        out.append(f'<span>Saigon {E(e["sg"])}</span>')
    elif e['sg'] and not e['hn']:
        out.append(f'<span>Saigon {E(e["sg"])}</span>')
    return ''.join(out)


def mark(sentence, start, n):
    """The sentence with syllables [start, start+n) in bold, its own text kept."""
    out, k, pos = [], 0, 0
    from vi import WORD as W
    spans = [m.span() for m in W.finditer(sentence)]
    if start + n > len(spans):
        return E(sentence)
    a, b = spans[start][0], spans[start + n - 1][1]
    return E(sentence[:a]) + '<b>' + E(sentence[a:b]) + '</b>' + E(sentence[b:])


def examples_html(exs):
    out = []
    for vs, en, (start, n) in exs:
        out.append(f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                   f'data-say="{E(vs)}"></span>{mark(vs, start, n)}</div>'
                   f'<div class="uc-exe">{E(en)}</div></div>')
    return ''.join(out)


def build(rows, lex, exs):
    cards, entries = [], []
    for r in rows:
        ents = entries_for(r, lex)
        if not ents:
            continue
        word = r['word']
        ex = exs.get(r['key'], [])
        cards.append({'sub': '', 'fields': {
            'Vietnamese': f'<div class="uc-word">{E(word)}</div>',
            'Word': word,
            'Tones': tones_line(word),
            'English': english(ents, word),
            'Notes': notes_line(ents),
            'Sound': sound_line(ents),
            'Examples': examples_html(ex),
        }})
        entries.append({'word': word, 'pos': ents[0]['pos'], 'source': r['source'],
                        'examples': len(ex), 'cls': '>classifier<' in cards[-1]['fields']['Notes'],
                        'sino': 'Sino-Vietnamese' in cards[-1]['fields']['Notes']})
    return cards, entries


WHO = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner',
       'b2': 'an upper-intermediate learner', 'c1': 'an advanced learner'}


def desc(entries, n):
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    ex3 = sum(1 for e in entries if e['examples'] == 3)
    ex0 = sum(1 for e in entries if e['examples'] == 0)
    ncls = sum(1 for e in entries if e['cls'])
    nsino = sum(1 for e in entries if e['sino'])
    SC = SCOPE[LEVEL]
    EX_NOTE = ('Every word carries three real example sentences' if ex3 == n else
               f'Real example sentences come with {n - ex0} of the {n} words, three apiece for '
               f'{ex3} of them')
    return (
        "Both study directions in one deck: Vietnamese → English (see the Vietnamese, recall the "
        "meaning) and English → Vietnamese (see an English meaning, recall the Vietnamese). Each "
        "direction is a card of its own with its own schedule, so recognising a word and producing "
        f"it are learnt separately. {n} words for {WHO[LEVEL]}, aligned to {LEVEL.upper()} of the "
        f"Common European Framework of Reference, whose global descriptor begins '{SC['quote']}' — "
        f"a learner here is {SC['gloss']}. " +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: Vietnam's own framework for learners of "
        "Vietnamese publishes no graded word list, and neither does any exam board, so this deck is "
        "not any examination's vocabulary and does not claim to be. It is assembled from two things "
        f"that can be stated. {from_inv} of the {n} come from a vocabulary written for the level's "
        f"scope — {SC['topics']} — and the other {n - from_inv} are the commonest remaining words of "
        "everyday Vietnamese, counted in film and television subtitles. Vietnamese writes a space "
        "between syllables rather than between words, so the subtitles were divided into words "
        "against the dictionary first, and a two-syllable word such as học sinh (pupil) is counted "
        "as one word. The cards are dealt by that frequency, so the words you meet most often come "
        "first. Beneath every headword its tones are named, one per syllable — ngang (no mark), "
        "huyền (à), sắc (á), hỏi (ả), ngã (ã) and nặng (ạ) — read off the marks the word is spelt "
        f"with. {ncls} nouns show their classifier, the word that stands between a number and the "
        f"noun (hai con mèo, two cats), and {nsino} words borrowed from Chinese show the characters "
        "they come from. The pronunciation is given in IPA for Hanoi and, where it differs, for "
        "Saigon. " + EX_NOTE + ", with the word picked out in colour and a speaker beside the "
        "sentence and the headword. Spellings are Wiktionary's, which often puts the tone mark in "
        "the older place (hoà, khoẻ); the newer (hòa, khỏe) is equally correct. Sources. Level: the "
        "Common European Framework of Reference (Council of Europe), global scale. Meanings, "
        "classifiers, characters and pronunciation: English Wiktionary, via the kaikki.org "
        "extraction (CC BY-SA 4.0). Frequency: the OpenSubtitles 2018 Vietnamese text "
        "(opensubtitles.org, via the OPUS corpus collection), counted here. Example sentences: "
        "Tatoeba (tatoeba.org), CC BY 2.0 FR."
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
        'tags': ['vietnamese', 'vocabulary', LEVEL, NAMES[LEVEL].lower()],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Vietnamese vocabulary', 'speechLang': 'vi-VN',
            'fields': FIELDS,
            'cards': [
                {'name': 'Vietnamese → English', 'front': FRONT_VI, 'back': BACK_VI},
                {'name': 'English → Vietnamese', 'front': FRONT_EN, 'back': BACK_EN},
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
    st = dg.dedupe(deck, 'Vietnamese')
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
