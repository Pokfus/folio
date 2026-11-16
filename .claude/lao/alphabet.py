#!/usr/bin/env python3
"""Write the Lao alphabet deck: `decks/Lao-Alphabet.folio-deck.json`.

    python3 .claude/lao/alphabet.py

The first deck of the Lao collection, sorted before A1 by `levelRank`'s
"Alphabet" rule.  The level decks print a romanisation under every word, so
this deck is not a gate; it is where the script itself is learnt.  Thai's
`alphabet.py` is the model.

WHAT IS IN IT, in the order a Lao primer teaches it:
  · the 27 CONSONANTS in their traditional order, each with its CLASS (high,
    middle or low), its sound at the start of a syllable and at the end, and
    its NAME -- every Lao letter is named by a word that begins with it (ກ ໄກ່,
    "k as in chicken"), which is how the letters that sound alike are told
    apart: ຂ and ຄ both say kh, ສ and ຊ both say s;
  · the six LIGATURES of a silent ຫ with ງ ຍ ນ ມ ລ ວ, which move those low
    letters into the high class;
  · the VOWELS, each written on the dotted circle ◌ that stands for the
    consonant it sits on, short and long side by side, with the form a vowel
    takes inside a closed syllable where it changes;
  · the four TONE MARKS and two other signs (the silencer ◌໌, the repeat ໆ);
  · the three CLASS RULES -- with no tone mark, the tone of a syllable is
    decided by its first consonant's class, the length of its vowel and how it
    ends;
  · the ten Lao DIGITS.

WHERE EACH FACT COMES FROM.  The consonants -- order, names, the name words'
meanings, sounds at the start and end, classes -- the ligatures and their
sample words, the vowels and the names of the six vowel signs that have their
own, and the digits are English Wikipedia's "Lao script" (read 2026-11-15);
the class rules are the table of "Lao language" § Indication of tones (read
the same day), which also names the four tone marks.  The sounds are
described in English words, as learners' alphabets give them -- approximations,
not IPA.  The romanisation of every example word is the level decks' own,
`lo.romanise` over Wiktionary's Vientiane IPA (`lex.json`), so the decks agree;
ເຫງົາ "lonely", Wikipedia's sample for ຫງ, has no Wiktionary entry and is shown
without one (`NO_ROMAN`).  No corpus is read, so a re-run is byte-identical
whenever `lex.json` is.

THE SOUND SIDE IS UNIQUE (asserted): the reverse card shows a sound and asks
for the letter, and the name word is what makes ຂ (ໄຂ່ "egg") a different
answer from ຄ (ຄວາຍ "water buffalo").
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lo import fold

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-15T00:00:00.000Z'
TYPE_ID = 'lo-abc'
COLOR = '#426A43'

M, H, L = 'middle', 'high', 'low'
# (letter, class, initial sound, final sound or '', name word, its meaning) -- Wikipedia's chart
CONSONANTS = [
    ('ກ', M, 'k with no puff of breath, as in skin', 'k', 'ໄກ່', 'chicken'),
    ('ຂ', H, 'kh, a k with a puff of breath, as in kit', '', 'ໄຂ່', 'egg'),
    ('ຄ', L, 'kh, a k with a puff of breath, as in kit', '', 'ຄວາຍ', 'water buffalo'),
    ('ງ', L, 'ng, as in sing — also at the start of a syllable', 'ng', 'ງົວ', 'ox'),
    ('ຈ', M, 'ch with no puff of breath, between the ch of church and the j of jam', '', 'ຈອກ', 'glass'),
    ('ສ', H, 's, as in sun', '', 'ເສືອ', 'tiger'),
    ('ຊ', L, 's, as in sun', '', 'ຊ້າງ', 'elephant'),
    ('ຍ', L, 'ny, as in canyon', 'i (a y glide)', 'ຍຸງ', 'mosquito'),
    ('ດ', M, 'd, as in day', 't', 'ເດັກ', 'child'),
    ('ຕ', M, 't with no puff of breath, as in stop', '', 'ຕາ', 'eye'),
    ('ຖ', H, 'th, a t with a puff of breath, as in top (never the th of thin)', '', 'ຖົງ', 'bag'),
    ('ທ', L, 'th, a t with a puff of breath, as in top (never the th of thin)', '', 'ທຸງ', 'flag'),
    ('ນ', L, 'n, as in no', 'n', 'ນົກ', 'bird'),
    ('ບ', M, 'b, as in boy', 'p', 'ແບ້', 'goat'),
    ('ປ', M, 'p with no puff of breath, as in spin', '', 'ປາ', 'fish'),
    ('ຜ', H, 'ph, a p with a puff of breath, as in pin (never the f of phone)', '', 'ເຜິ້ງ', 'bee'),
    ('ຝ', H, 'f, as in fan', '', 'ຝົນ', 'rain'),
    ('ພ', L, 'ph, a p with a puff of breath, as in pin (never the f of phone)', '', 'ພູ', 'mountain'),
    ('ຟ', L, 'f, as in fan', '', 'ໄຟ', 'fire'),
    ('ມ', L, 'm, as in me', 'm', 'ແມວ', 'cat'),
    ('ຢ', M, 'y, as in yes', '', 'ຢາ', 'medicine'),
    ('ຣ', L, 'r, though most speakers say it as l; re-added for foreign names (ເອີຣົບ "Europe")',
     'n, rarely', 'ຣົຖ', 'car (now spelt ລົດ)'),
    ('ລ', L, 'l, as in look', '', 'ລີງ', 'monkey'),
    ('ວ', L, 'v or w — a sound between the two', 'o (a w glide)', 'ວີ', 'fan'),
    ('ຫ', H, 'h, as in hat; silent before ງ ຍ ນ ມ ລ ວ, where it makes them high class', '', 'ຫ່ານ', 'goose'),
    ('ອ', M, 'no sound of its own: the carrier a vowel is written on at the start of a word', '',
     'ໂອ', 'bowl'),
    ('ຮ', L, 'h, as in hat', '', 'ເຮືອນ', 'house'),
]

# (ligature, its sound, sample word, meaning) -- Wikipedia's ligature table; all high class
LIGATURES = [
    ('ຫງ', 'ng', 'ເຫງົາ', 'lonely'),
    ('ຫຍ', 'ny', 'ຫຍ້າ', 'grass'),
    ('ໜ', 'n', 'ໜູ', 'rat'),
    ('ໝ', 'm', 'ໝາ', 'dog'),
    ('ຫຼ', 'l', 'ຫຼັງ', 'back'),
    ('ຫວ', 'v or w', 'ແຫວນ', 'ring'),
]

# (shown, name, romanisation, description, example, meaning) -- Wikipedia's vowel tables.
# The name is "ສະຫຼະ" (sala, "vowel") before the vowel on ອ, except the six signs with
# names of their own.
VOWELS = [
    ('◌ະ', 'ສະຫຼະອະ', 'a', 'short a, as in cut, ending in a catch of the breath', 'ຈະ', 'will'),
    ('◌ັ◌', 'ໄມ້ກັນ', 'a', 'short a INSIDE a syllable — ◌ະ\'s form when a consonant follows', 'ມັກ', 'to like'),
    ('◌າ', 'ສະຫຼະອາ', 'aa', 'long a, as in father', 'ປາ', 'fish'),
    ('◌ິ', 'ສະຫຼະອິ', 'i', 'short i, as in bit', 'ກິນ', 'to eat'),
    ('◌ີ', 'ສະຫຼະອີ', 'ii', 'long i, as in see', 'ປີ', 'year'),
    ('◌ຶ', 'ສະຫຼະອຶ', 'ʉ', 'short ʉ: an oo said with the lips spread, not rounded', 'ໜຶ່ງ', 'one'),
    ('◌ື', 'ສະຫຼະອື', 'ʉʉ', 'long ʉʉ: an oo said with the lips spread, held', 'ມື', 'hand'),
    ('◌ຸ', 'ສະຫຼະອຸ', 'u', 'short u, as in put', 'ຍຸງ', 'mosquito'),
    ('◌ູ', 'ສະຫຼະອູ', 'uu', 'long u, as in food', 'ພູ', 'mountain'),
    ('ເ◌ະ', 'ສະຫຼະເອະ', 'e', 'short e, as in pet, ending in a catch of the breath; inside a syllable '
     'it is written ເ◌ັ◌ (ເດັກ "child")', 'ເຕະ', 'to kick'),
    ('ເ◌', 'ສະຫຼະເອ', 'ee', 'long e, as in they without the y', 'ເລກ', 'number'),
    ('ແ◌ະ', 'ສະຫຼະແອະ', 'ɛ', 'short ɛ, the a of cat said briefly', 'ແກະ', 'sheep'),
    ('ແ◌', 'ສະຫຼະແອ', 'ɛɛ', 'long ɛɛ, the a of cat held', 'ແມ່', 'mother'),
    ('ໂ◌ະ', 'ສະຫຼະໂອະ', 'o', 'short o, as in a clipped go, ending in a catch of the breath', 'ໂຕະ', 'table'),
    ('◌ົ◌', 'ໄມ້ກົງ', 'o', 'short o INSIDE a syllable — ໂ◌ະ\'s form when a consonant follows', 'ນົກ', 'bird'),
    ('ໂ◌', 'ສະຫຼະໂອ', 'oo', 'long o, as in go without the w', 'ໂມງ', 'hour'),
    ('ເ◌າະ', 'ສະຫຼະເອາະ', 'ɔ', 'short ɔ, as in the British hot', 'ເກາະ', 'island'),
    ('◌ໍ', 'ນິກຄະຫິດ', 'ɔɔ', 'long ɔɔ, as in law, at the END of a syllable; inside one it is written '
     '◌ອ◌ (ຈອກ "glass")', 'ຂໍ', 'to ask for'),
    ('ເ◌ິ', 'ສະຫຼະເອິ', 'ə', 'short ə, the e of the, said briefly', 'ເງິນ', 'money'),
    ('ເ◌ີ', 'ສະຫຼະເອີ', 'əə', 'long əə, as in her without the r', 'ເປີດ', 'to open'),
    ('ເ◌ຍ', 'ສະຫຼະເອຍ', 'ia', 'ia, as in the British near; inside a syllable it is written ◌ຽ◌, the '
     'sign called ວິລາມ (ຮຽນ "to study")', 'ເມຍ', 'wife'),
    ('ເ◌ືອ', 'ສະຫຼະເອືອ', 'ʉa', 'ʉa: the spread-lipped ʉʉ gliding to a', 'ເຮືອ', 'boat'),
    ('◌ົວ', 'ສະຫຼະອົວ', 'ua', 'ua, as in the British poor; inside a syllable it is written ◌ວ◌', 'ຜົວ',
     'husband'),
    ('ໄ◌', 'ໄມ້ມາຍ', 'ai', 'ai, as in Thai — written ໄ in most words', 'ໄປ', 'to go'),
    ('ໃ◌', 'ໄມ້ມ້ວນ', 'ai', 'ai, as in Thai — the second spelling, ໃ, used in fewer words', 'ໃຫຍ່',
     'big'),
    ('ເ◌ົາ', 'ສະຫຼະເອົາ', 'ao', 'ao, as in cow', 'ເກົ້າ', 'nine'),
    ('◌ຳ', 'ສະຫຼະອຳ', 'am', 'am, as in the British hum', 'ນ້ຳ', 'water'),
]

# (shown, name for the speaker, its romanisation or None, what it does, example, meaning).
# ◌່ and ◌້ are named by their Wiktionary entries; the rare two by their Unicode names (MAI TI,
# MAI CATAWA); the last two signs' Lao names are not in the sources, so the speaker reads the
# example word instead of a name.
SIGNS = [
    ('◌່', 'ໄມ້ເອກ', 'mai ek', 'tone mark 1: MID tone, whatever the consonant\'s class', 'ໄກ່', 'chicken'),
    ('◌້', 'ໄມ້ໂທ', 'mai tho', 'tone mark 2: LOW FALLING tone on a high-class consonant, HIGH FALLING on a '
     'middle- or low-class one', 'ບ້ານ', 'village; home'),
    ('◌໊', 'ອ໊ອດແອ໊ດ', 'mai ti', 'tone mark 3, rare: HIGH tone', 'ອ໊ອດແອ໊ດ', 'creak, squeak'),
    ('◌໋', 'ລູກເຕົ໋າ', 'mai catawa', 'tone mark 4, rare: RISING tone', 'ລູກເຕົ໋າ', 'dice'),
    ('◌໌', 'ໄຟລ໌', None, 'the silencer: the letter under it is not said — met in loanwords and names',
     'ໄຟລ໌', 'file (computer)'),
    ('ໆ', 'ໄວໆ', None, 'the repeat mark: say the word before it twice', 'ໄວໆ', 'quickly'),
]

# The three class rules: (shown, name for the speaker, rule, example, meaning) -- the table of
# "Lao language" § Indication of tones, row by row
CLASSES = [
    ('ສູງ', 'ອັກສອນສູງ', 'HIGH class, ຂ ສ ຖ ຜ ຝ ຫ and the six ligatures: with no tone mark, a long vowel '
     'or a syllable ending in m, n, ng, w or y is RISING; a long vowel ending in p, t or k is LOW '
     'FALLING; a short vowel is HIGH', 'ສາມ', 'three'),
    ('ກາງ', 'ອັກສອນກາງ', 'MIDDLE class, ກ ຈ ດ ຕ ບ ປ ຢ ອ: with no tone mark, a long vowel or a syllable '
     'ending in m, n, ng, w or y is LOW RISING; a long vowel ending in p, t or k is LOW FALLING; a '
     'short vowel is HIGH', 'ປາ', 'fish'),
    ('ຕ່ຳ', 'ອັກສອນຕ່ຳ', 'LOW class, ຄ ງ ຊ ຍ ທ ນ ພ ຟ ມ ຣ ລ ວ ຮ: with no tone mark, a long vowel or a '
     'syllable ending in m, n, ng, w or y is HIGH; a long vowel ending in p, t or k is HIGH FALLING; '
     'a short vowel is MID', 'ຄວາຍ', 'water buffalo'),
]
CLASS_NOTE = ('The tone marks override these: ◌່ makes a syllable MID, and ◌້ makes it LOW FALLING '
              'after a high-class consonant and HIGH FALLING after any other. Dialects differ, and '
              'the level decks show each word\'s Vientiane tones as Wiktionary records them.')

DIGITS = ['ສູນ', 'ໜຶ່ງ', 'ສອງ', 'ສາມ', 'ສີ່', 'ຫ້າ', 'ຫົກ', 'ເຈັດ', 'ແປດ', 'ເກົ້າ']

NO_ROMAN = {'ເຫງົາ'}      # Wikipedia's sample for ຫງ; no Wiktionary entry, so no IPA to read

FIELDS = ['Letter', 'Name', 'Sound', 'Example', 'Word']

SAY_NAME = '<span class="uc-tts uc-say" data-say="{{Name}}"></span>'
SAY_WORD = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
LETTER = '<div class="uc-letter">{{Letter}}' + SAY_NAME + '</div>'
DETAIL = ('<div class="uc-field"><div class="uc-pos">sound</div><div class="uc-gl">{{Sound}}</div>'
          '<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}'
          + SAY_WORD + '</div></div>')
ASK = ('<div class="uc-ask">Which letter is this?</div>'
       '<div class="uc-field"><div class="uc-gl">{{Sound}}</div></div>')
FRONT_L = LETTER
BACK_L = '{{FrontSide}}<hr>' + DETAIL
FRONT_S = ASK
BACK_S = '{{FrontSide}}<hr>' + LETTER + DETAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hindi', 'alphabet.py'),
           encoding='utf-8').read().split('CSS = """', 1)[1].split('"""', 1)[0]
# Lao stacks a vowel and a tone mark above a letter (ນ້ຳ, ທີ່): give the big letter room.
CSS = CSS.replace('  font-size: 60px;\n  font-weight: 400;\n  line-height: 1.3;',
                  '  font-size: 60px;\n  font-weight: 400;\n  line-height: 1.6;')
CSS += """.uc-cls {
  margin-left: 6px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.6;
}
"""


def main():
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lao-cache', 'lex.json')
    lex = json.load(open(cache, encoding='utf-8')) if os.path.exists(cache) else {}
    if not lex:
        raise SystemExit('alphabet.py reads the example words\' romanisation from lex.json: '
                         'run `python3 .claude/lao/run.py` once first')

    def roman(w):
        Lx = lex.get(fold(w)) or {}
        if 'entries' in Lx:
            return next((e['roman'][0] for e in Lx['entries'] if e.get('roman')), '')
        return (Lx.get('roman') or [''])[0]

    rows, missing = [], []

    def example(word, meaning):
        wr = roman(word)
        if not wr and word not in NO_ROMAN:
            missing.append(word)
        return (f'<span class="uc-ex">{E(word)}</span>'
                + (f'<span class="uc-exr">{E(wr)}</span>' if wr else '')
                + f'<span class="uc-exe">{E(meaning)}</span>')

    for ch, cls, sound, final, word, meaning in CONSONANTS:
        fin = (f'; at the end of a syllable: {final}' if final else
               ('; never ends a syllable' if ch != 'ອ' else ''))
        rows.append((ch, f'{ch} {word}',
                     f'<span class="uc-rm">{E(word)}</span> · “{E(meaning)}”'
                     f'<span class="uc-cls">{cls} class</span><br>{E(sound + fin)}',
                     example(word, meaning), word))
    for lig, sound, word, meaning in LIGATURES:
        base = {'ໜ': 'ນ', 'ໝ': 'ມ', 'ຫຼ': 'ລ'}.get(lig, lig[-1])
        rows.append((lig, word, f'<span class="uc-rm">{E(sound)}</span> · ຫ + {E(base)}: '
                     f'{E(sound)} said in the HIGH class (the ຫ is silent)'
                     f'<span class="uc-cls">high class</span>',
                     example(word, meaning), word))
    for shown, name, rom, sound, word, meaning in VOWELS:
        rows.append((shown, name, f'<span class="uc-rm">{E(rom)}</span> · {E(sound)}',
                     example(word, meaning), word))
    for shown, name, nrom, does, word, meaning in SIGNS:
        rows.append((shown, name, (f'<span class="uc-rm">{E(nrom)}</span> · ' if nrom else '') + E(does),
                     example(word, meaning), word))
    for shown, name, rule, word, meaning in CLASSES:
        rows.append((shown, name, E(rule) + '. ' + E(CLASS_NOTE), example(word, meaning), word))
    for i, w in enumerate(DIGITS):
        rows.append(('໐໑໒໓໔໕໖໗໘໙'[i], w, f'<span class="uc-rm">{i}</span> · the digit {i}, said '
                     f'{E(roman(w))}', example(w, str(i)), w))

    cards = []
    for i, (shown, name, sound, ex, word) in enumerate(rows, 1):
        cards.append({'sub': '', 'fields': {'Letter': E(shown), 'Name': E(name), 'Sound': sound,
                                            'Example': ex, 'Word': E(word)},
                      'id': f'u_laoabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two notes share a sound side: the reverse card is unanswerable'
    if missing:
        raise SystemExit('no romanisation for: ' + ' '.join(missing))
    desc = (
        f"The Lao script: {n} notes, in the order a Lao primer teaches it — the 27 consonants in "
        "their traditional order, the six ligatures of a silent ຫ, the vowels, the four tone marks "
        "and two other signs, the three consonant classes that decide a syllable's tone, and the ten "
        "Lao digits. The first deck of the Lao collection. Both directions: see a letter and recall "
        "its sound, or see a sound and recall the letter, each a card with its own schedule. Every "
        "consonant is given with its NAME — Lao letters are named by a word that starts with them "
        "(ກ ໄກ່, k as in chicken) — and the name is how the letters that sound alike are told apart, "
        "so the sound side names it too: ຂ and ຄ both say kh, ສ and ຊ both say s. Each consonant "
        "shows its CLASS, high, middle or low, which together with the tone marks and the length of "
        "the vowel decides the tone of every syllable, and its sound at the start and at the end of "
        "a syllable (ບ is b at the start and p at the end). Each vowel is written on ◌, the dotted "
        "circle standing for the consonant it sits on, since a Lao vowel can be written above, "
        "below, before or after its consonant, and several change shape inside a closed syllable. "
        "The sounds are described in English words — approximations, as every learner's alphabet "
        "gives them — with one everyday word that shows each, romanised as in the level decks, and "
        "a speaker beside the letter and the word. Sources: English Wikipedia's 'Lao script' (the "
        "consonants, ligatures, vowels and digits) and 'Lao language' (the tone rules), read "
        "2026-11-15 (CC BY-SA 4.0); the example words' pronunciations are English Wiktionary's, via "
        "the kaikki.org extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'laoabc', 'title': 'Lao Alphabet',
        'subtitle': f'{n} letters, vowels, tone marks and digits · both directions, as two cards each',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['lao', 'alphabet', 'script'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Lao letter', 'speechLang': 'lo-LA',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Lao-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
