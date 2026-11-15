#!/usr/bin/env python3
"""Write the Cantonese Jyutping and Tones deck -- the first deck of the collection.

    python3 .claude/cantonese/sounds.py     (reads .claude/cantonese-cache/lex.json)

WHY THIS DECK AND NOT A SCRIPT DECK.  Chinese characters are not an alphabet: there is no short list
of letters that unlocks the rest, and the characters are taught where they belong, one word at a
time, in the level decks.  What a learner CAN learn first, and cannot do without, is the
romanisation every card in the collection prints -- Jyutping -- and above all its six TONES, because
a Cantonese syllable said on the wrong tone is a different word (si1 poem, si2 history, si3 to try,
si4 time, si5 market, si6 matter).

WHAT IS IN IT.  The six tones, on the one syllable si; the rule for a syllable ending in p, t or k
(the "checked" syllables, which take only tones 1, 3 and 6); the initials Jyutping spells unlike
English (b and p, d and t, g and k, gw, kw, ng, j, z, c); and the vowels and endings an English
reader would mispronounce.  The initials that sound as in English (f, h, l, m, n, s, w) are left
out.  Each note asks both ways -- the spelling, then its sound; the sound, then the spelling -- and
gives one word that shows it, its Jyutping and its meaning, with a speaker button.

SOURCES.  The sound descriptions are the standard description of Hong Kong Cantonese phonology, as in
every grammar of the language; the IPA under each example is derived from its Jyutping by that same
standard correspondence (`ipa` below), not looked up.  Each example word's Jyutping must be a reading
CC-CEDICT's Cantonese readings or CC-Canto give it, and its meaning must be one of their own glosses:
the script stops if either is not.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from yue import syllables

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'cantonese-cache'))
OUT = os.path.abspath(os.path.join(HERE, '..', '..', 'decks', 'Cantonese-Jyutping-and-Tones.folio-deck.json'))
STAMP = '2026-11-15T00:00:00.000Z'
DECK = 'yuesounds'
TYPE_ID = 'cantonese-sounds'
COLOR = '#86522A'
E = html.escape

# (spelling, kind, how it sounds, example word, its Jyutping, its meaning)
NOTES = [
    # THE SIX TONES, on one syllable, so the tone is the only thing that changes
    ('si1', 'tone 1: high level', 'high and level, at the top of the voice (some speakers let it fall a little)',
     '詩', 'si1', 'poem'),
    ('si2', 'tone 2: high rising', 'rising from the middle of the voice to the top, as an English question rises',
     '史', 'si2', 'history'),
    ('si3', 'tone 3: mid level', 'level, in the middle of the voice', '試', 'si3', 'to try'),
    ('si4', 'tone 4: low falling', 'low and falling to the bottom of the voice', '時', 'si4', 'time'),
    ('si5', 'tone 5: low rising', 'rising from low to the middle of the voice', '市', 'si5', 'market'),
    ('si6', 'tone 6: low level', 'level, low in the voice, just under tone 3', '事', 'si6', 'matter'),
    ('-p -t -k', 'checked syllables',
     'a syllable ending in p, t or k stops short, the lips or tongue closing without a puff of air; '
     'it takes only tone 1, 3 or 6 (Cantonese grammars call these tones 7, 8 and 9)',
     '一', 'jat1', 'one'),
    # INITIALS spelt unlike English
    ('b', 'initial', 'p without a puff of air, as in "spin" (never the English b)', '杯', 'bui1', 'cup'),
    ('p', 'initial', 'p with a puff of air, as in "pin"', '怕', 'paa3', 'to be afraid'),
    ('d', 'initial', 't without a puff of air, as in "stop" (never the English d)', '打', 'daa2', 'to hit'),
    ('t', 'initial', 't with a puff of air, as in "top"', '太', 'taai3', 'too (much)'),
    ('g', 'initial', 'k without a puff of air, as in "skin" (never the English g)', '家', 'gaa1', 'home'),
    ('k', 'initial', 'k with a puff of air, as in "kin"', '卡', 'kaa1', '(loanword) card'),
    ('gw', 'initial', 'g with rounded lips, as in "Guatemala", without a puff of air', '國', 'gwok3', 'country; nation; state'),
    ('kw', 'initial', 'k with rounded lips, as in "queen"', '群', 'kwan4', 'group'),
    ('ng', 'initial', 'ng, as in "singer", even at the start of a word', '我', 'ngo5', 'I; me; my'),
    ('j', 'initial', 'y, as in "yes" (never the English j)', '有', 'jau5', 'to have; there is'),
    ('z', 'initial', 'ts without a puff of air, as in "cats are" said quickly, or dz', '字', 'zi6', 'character'),
    ('c', 'initial', 'ts with a puff of air, as in "it\'s hot" run together, or ch', '茶', 'caa4', 'tea'),
    # VOWELS AND ENDINGS
    ('aa', 'vowel', 'a long a, as in "father"', '花', 'faa1', 'flower'),
    ('a', 'vowel (short)', 'a short vowel, as the u in "but"; never alone, always before an ending (ai, au, am, an, ang, ap, at, ak)',
     '米', 'mai5', 'uncooked rice'),
    ('e', 'vowel', 'e, as in "bet", held long', '車', 'ce1', 'car'),
    ('i', 'vowel', 'ee, as in "see"; shorter, as in "sit", before ng and k', '二', 'ji6', 'two'),
    ('o', 'vowel', 'aw, as in British "law"', '坐', 'co5', 'to sit'),
    ('u', 'vowel', 'oo, as in "food"; shorter, as in "foot", before ng and k', '六', 'luk6', 'six'),
    ('yu', 'vowel', 'ee said with rounded lips, like French u or German ü', '書', 'syu1', 'book'),
    ('oe', 'vowel', 'e said with rounded lips, like French eu or German ö', '靴', 'hoe1', 'boots'),
    ('eo', 'vowel (short)', 'a short rounded vowel, as in French "peu" said quickly; never alone (eoi, eon, eot)',
     '春', 'ceon1', 'spring (season)'),
    ('eoi', 'vowel + i', 'the short rounded eo gliding to a rounded ee', '去', 'heoi3', 'to go'),
    ('ei', 'vowel + i', 'ay, as in "day"', '你', 'nei5', 'you (informal, as opposed to courteous 您)'),
    ('ou', 'vowel + u', 'oh, as in "go"', '好', 'hou2', 'good'),
    ('oi', 'vowel + i', 'oy, as in "boy"', '愛', 'oi3', 'to love'),
    ('ui', 'vowel + i', 'oo gliding to ee, as in "phooey"', '會', 'wui5', 'will'),
    ('iu', 'vowel + u', 'ee gliding to oo, as in "few" without the f', '少', 'siu2', 'few'),
    ('aai', 'vowel + i', 'a long a gliding to ee, as in "aisle" with the a drawn out', '買', 'maai5', 'to buy'),
    ('aau', 'vowel + u', 'a long a gliding to oo, as in "ouch" with the a drawn out', '教', 'gaau3', 'to teach'),
    ('au', 'vowel + u', 'the short a gliding to oo, as in "out" said quickly', '狗', 'gau2', 'dog'),
    ('m (alone)', 'syllable', 'm alone, hummed, as a whole syllable', '唔', 'm4', 'not'),
    ('ng (alone)', 'syllable', 'ng alone, hummed at the back of the mouth, as a whole syllable', '五', 'ng5', 'five'),
]

INI = [('gw', 'kʷ'), ('kw', 'kʷʰ'), ('ng', 'ŋ'), ('b', 'p'), ('p', 'pʰ'), ('d', 't'), ('t', 'tʰ'), ('g', 'k'),
       ('k', 'kʰ'), ('z', 'ts'), ('c', 'tsʰ'), ('s', 's'), ('j', 'j'), ('w', 'w'), ('m', 'm'), ('n', 'n'),
       ('l', 'l'), ('f', 'f'), ('h', 'h')]
FIN = {'aa': 'aː', 'aai': 'aːi', 'aau': 'aːu', 'aam': 'aːm', 'aan': 'aːn', 'aang': 'aːŋ', 'aap': 'aːp̚',
       'aat': 'aːt̚', 'aak': 'aːk̚', 'ai': 'ɐi', 'au': 'ɐu', 'am': 'ɐm', 'an': 'ɐn', 'ang': 'ɐŋ', 'ap': 'ɐp̚',
       'at': 'ɐt̚', 'ak': 'ɐk̚', 'e': 'ɛː', 'ei': 'ei', 'eng': 'ɛːŋ', 'ek': 'ɛːk̚', 'i': 'iː', 'iu': 'iːu',
       'im': 'iːm', 'in': 'iːn', 'ing': 'ɪŋ', 'ip': 'iːp̚', 'it': 'iːt̚', 'ik': 'ɪk̚', 'o': 'ɔː', 'oi': 'ɔːy',
       'ou': 'ou', 'on': 'ɔːn', 'ong': 'ɔːŋ', 'ot': 'ɔːt̚', 'ok': 'ɔːk̚', 'oe': 'œː', 'oeng': 'œːŋ',
       'oek': 'œːk̚', 'eoi': 'ɵy', 'eon': 'ɵn', 'eot': 'ɵt̚', 'u': 'uː', 'ui': 'uːy', 'un': 'uːn',
       'ung': 'ʊŋ', 'ut': 'uːt̚', 'uk': 'ʊk̚', 'yu': 'yː', 'yun': 'yːn', 'yut': 'yːt̚', 'm': 'm̩', 'ng': 'ŋ̍'}
TONE = {'1': '˥', '2': '˧˥', '3': '˧', '4': '˨˩', '5': '˩˧', '6': '˨'}


def ipa(jp):
    out = []
    for syl in syllables(jp):
        body, tone = syl[:-1], syl[-1]
        if body in ('m', 'ng'):
            out.append(FIN[body] + TONE[tone])
            continue
        head = ''
        for a, b in INI:
            if body.startswith(a) and body[len(a):] in FIN:
                head, body = b, body[len(a):]
                break
        out.append(head + FIN[body] + TONE[tone])
    return '[' + ' '.join(out) + ']'


def main():
    lex = json.load(open(os.path.join(CACHE, 'lex.json'), encoding='utf-8'))
    sys.path.insert(0, HERE)
    os.environ.setdefault('CANTONESE_LEVEL', 'a1')
    from build_deck import gloss_list
    cards, sounds = [], {}
    for i, (sym, kind, how, word, jp, mean) in enumerate(NOTES, 1):
        ent = next((e for e in lex.get(word, []) if e['j'] == jp), None)
        if not ent:
            raise SystemExit(f'{word} {jp}: not a reading the dictionaries give')
        gl = gloss_list(ent)
        if mean not in gl and not all(m in gl for m in mean.split('; ')):
            raise SystemExit(f'{word} {jp}: "{mean}" is not one of its glosses: {gl}')
        snd = f'<div class="uc-pos">{E(kind)}</div><div class="uc-gl">{E(how)}</div>'
        if snd in sounds:
            raise SystemExit(f'{sym} shares its sound side with {sounds[snd]}')
        sounds[snd] = sym
        cards.append({'sub': '', 'id': f'u_{DECK}_{i}', 'type': TYPE_ID, 'fields': {
            'Spelling': E(sym), 'Word': E(word), 'Sound': snd,
            'Example': f'<b>{E(word)}</b> <span class="uc-exr">{E(jp)}</span> <span class="uc-exe">{E(mean)}</span>',
            'IPA': E(ipa(jp)),
        }})
    n = len(cards)
    tones = sum(1 for x in NOTES if x[1].startswith('tone'))
    desc = (
        "The first deck of the Cantonese collection, and a short one. Chinese characters are not an "
        "alphabet, so there is no script to learn before the words: the characters are taught where "
        "they belong, a word at a time, in the level decks. What every card in the collection does "
        "print is Jyutping, the Linguistic Society of Hong Kong's romanisation, and this deck is the "
        "key to it. First the six TONES, all on the one syllable si — si1 poem, si2 history, si3 to "
        "try, si4 time, si5 market, si6 matter — because in Cantonese the tone changes the word, and "
        "the digit at the end of every Jyutping syllable names it; then the syllables ending in p, t "
        "or k, which take only three of the six. Then the letters Jyutping spells unlike English: b, "
        "d and g are said without a puff of air (as in spin, stop, skin) and p, t and k with one; j is "
        "an English y; z and c are ts sounds; ng can begin a word; and the vowels yu, oe and eo are "
        "rounded vowels English lacks. The letters that sound as in English (f, h, l, m, n, s, w) are "
        "left out. Each card asks both ways — the spelling, then its sound; the sound, then the "
        "spelling — and gives one word that shows it, with its meaning, its IPA and a speaker button. "
        "Sources: the sounds are the standard description of Hong Kong Cantonese phonology, and the "
        "IPA follows from the Jyutping by the same standard correspondence; the example words' "
        "Jyutping and meanings are CC-Canto's and CC-CEDICT's (Pleco and MDBG, CC BY-SA)."
    )
    meta = {
        'id': DECK, 'title': 'Cantonese Jyutping and Tones',
        'subtitle': f'{n} tones, letters and endings · both directions, as two cards each',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['cantonese', 'jyutping', 'tones', 'pronunciation'],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Cantonese sounds', 'speechLang': 'zh-HK',
            'fields': ['Spelling', 'Word', 'Sound', 'Example', 'IPA'],
            'cards': [
                {'name': 'Spelling → sound',
                 'front': '<div class="uc-word">{{Spelling}}</div>',
                 'back': '{{FrontSide}}<hr><div class="uc-field">{{Sound}}</div><div class="uc-exs uc-exz">'
                         '<span class="uc-tts uc-exsay" data-say="{{Word}}"></span>{{Example}}</div>'
                         '{{#IPA}}<div class="uc-ipa">{{IPA}}</div>{{/IPA}}'},
                {'name': 'Sound → spelling',
                 'front': '<div class="uc-ask">Which tone, letter or ending?</div><div class="uc-field">{{Sound}}</div>',
                 'back': '{{FrontSide}}<hr><div class="uc-word">{{Spelling}}</div><div class="uc-exs uc-exz">'
                         '<span class="uc-tts uc-exsay" data-say="{{Word}}"></span>{{Example}}</div>'
                         '{{#IPA}}<div class="uc-ipa">{{IPA}}</div>{{/IPA}}'},
            ],
            'css': open(os.path.join(HERE, 'card.css'), encoding='utf-8').read() +
                   '.uc-ipa {\n  margin-top: 6px;\n  font-size: 13px;\n  opacity: 0.6;\n}\n',
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    with open(OUT, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print(f'  wrote {OUT}: {n} notes ({tones} tones)')


if __name__ == '__main__':
    main()
