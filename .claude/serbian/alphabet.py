#!/usr/bin/env python3
"""Write the Serbian alphabet deck: `decks/Serbian-Alphabet.folio-deck.json`.

    python3 .claude/serbian/alphabet.py

The way into the set: the level decks print every headword in Cyrillic, with
Wiktionary's accent marks, and the Latin spelling beneath -- so the alphabet
comes first, as its own deck, and the catalogue sorts it before A1
(`levelRank` in build-lang-decks.js).

THIRTY LETTERS IN THE CYRILLIC ORDER (Вук Караџић's азбука, а б в г д ђ ...),
EACH WITH ITS LATIN TWIN, then the five accent marks the level decks print,
then the syllabic r.  Every fact is from two Wikipedia articles at pinned
revisions: "Serbian Cyrillic alphabet" (oldid 1380570209) for the letters,
their Latin equivalents and their sounds (its IPA column, put into English
words as learner's alphabets give them), and "Serbo-Croatian phonology"
(oldid 1384903020) for the four accents, the long vowel after the accent and
the syllabic r.  The letters have NO NAMES (the first article says so:
consonants are said as themselves, or with a short schwa), so a note gives
the Latin letter where the Ukrainian deck gives a name.  Every example word
is an A1 card's, printed with the accent Wiktionary gives it, so the file is
reproduced byte for byte by re-running this script, which reads nothing.

Two cards a note: letter -> sound, and sound -> letter.
"""
import html, json, os, unicodedata

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-16T00:00:00.000Z'
TYPE_ID = 'sr-abc'
COLOR = '#1C4C0E'          # the measured hue, as build_deck.py's

# (Cyrillic capital, small, Latin, sound, example word with its accent, its meaning)
LETTERS = [
    ('А', 'а', 'A a', '"a" as in father', 'ма̏ма', 'mum'),
    ('Б', 'б', 'B b', '"b" as in bed', 'бра̏т', 'brother'),
    ('В', 'в', 'V v', '"v" as in van', 'во̀да', 'water'),
    ('Г', 'г', 'G g', '"g" as in go — always hard', 'гла́ва', 'head'),
    ('Д', 'д', 'D d', '"d" as in dog, the tongue against the teeth', 'да̑н', 'day'),
    ('Ђ', 'ђ', 'Đ đ', 'a soft "j": the j of jeep said with the tongue flat against the palate; '
     'softer than џ', 'ђа̑к', 'pupil'),
    ('Е', 'е', 'E e', '"e" as in met', 'сѐстра', 'sister'),
    ('Ж', 'ж', 'Ž ž', '"zh", like the s in pleasure', 'жѐна', 'woman'),
    ('З', 'з', 'Z z', '"z" as in zoo', 'зи́ма', 'winter'),
    ('И', 'и', 'I i', '"ee" as in meet, but short', 'ри̏ба', 'fish'),
    ('Ј', 'ј', 'J j', '"y" as in yes', 'ја̏бука', 'apple'),
    ('К', 'к', 'K k', '"k" as in kite', 'ку̏ћа', 'house'),
    ('Л', 'л', 'L l', '"l" as in ball', 'ле̏то', 'summer'),
    ('Љ', 'љ', 'Lj lj', '"ly", one sound, like the lli of million; written lj in Latin',
     'при̏јатељ', 'friend'),
    ('М', 'м', 'M m', '"m" as in man', 'мле́ко', 'milk'),
    ('Н', 'н', 'N n', '"n" as in no', 'но̑ћ', 'night'),
    ('Њ', 'њ', 'Nj nj', '"ny", one sound, like the ny of canyon; written nj in Latin',
     'ку̏хиња', 'kitchen'),
    ('О', 'о', 'O o', '"o" as in more, but short', 'о̀тац', 'father'),
    ('П', 'п', 'P p', '"p" as in pen', 'пи̑во', 'beer'),
    ('Р', 'р', 'R r', 'a rolled "r", made with the tip of the tongue; between consonants it is '
     'a vowel of its own', 'ре́ка', 'river'),
    ('С', 'с', 'S s', '"s" as in sun', 'си̑н', 'son'),
    ('Т', 'т', 'T t', '"t" as in top, the tongue against the teeth', 'та̏та', 'dad'),
    ('Ћ', 'ћ', 'Ć ć', 'a soft "ch": the ch of cheap said with the tongue flat against the '
     'palate; softer than ч', 'ћа̑о', 'hi, bye'),
    ('У', 'у', 'U u', '"oo" as in boot, but short', 'у̏лица', 'street'),
    ('Ф', 'ф', 'F f', '"f" as in fun', 'телѐфо̄н', 'telephone'),
    ('Х', 'х', 'H h', '"kh", like the ch in Scottish loch', 'хле̏б', 'bread'),
    ('Ц', 'ц', 'C c', '"ts" as in cats', 'цве̑т', 'flower'),
    ('Ч', 'ч', 'Č č', '"ch" as in church, the tongue curled back; harder than ћ', 'ча̏ј', 'tea'),
    ('Џ', 'џ', 'Dž dž', '"j" as in jam, the tongue curled back; harder than ђ; written dž in '
     'Latin', 'џе̏п', 'pocket'),
    ('Ш', 'ш', 'Š š', '"sh" as in shop', 'шко̑ла', 'school'),
]
assert len(LETTERS) == 30

# The marks a level deck prints on a headword, and the r that is a vowel.  The letter
# field shows the mark on а (or the r itself); the Latin field names the mark.
MARKS = [
    ('а̏', 'double grave', 'the accent mark ȁ: a SHORT stressed vowel with a FALLING tone',
     'ку̏ћа', 'house'),
    ('а̑', 'inverted breve', 'the accent mark ȃ: a LONG stressed vowel with a FALLING tone',
     'пи̑во', 'beer'),
    ('а̀', 'grave', 'the accent mark à: a SHORT stressed vowel with a RISING tone', 'во̀да',
     'water'),
    ('а́', 'acute', 'the accent mark á: a LONG stressed vowel with a RISING tone', 'мле́ко',
     'milk'),
    ('а̄', 'macron', 'the mark ā: a LONG vowel after the stressed syllable, which only a '
     'dictionary marks', 'дѐво̄јка', 'girl'),
    ('р', 'syllabic r', 'r as a vowel: between two consonants it carries the syllable, and '
     'can carry the accent', 'ср̏це', 'heart'),
]

FIELDS = ['Letter', 'Latin', 'Sound', 'Example', 'Word']

SAY_WORD = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
LETTER = '<div class="uc-letter">{{Letter}}</div>'
DETAIL = ('<div class="uc-field"><div class="uc-pos">in Latin</div><div class="uc-gl">{{Latin}}</div>'
          '<div class="uc-pos uc-gap">sound</div><div class="uc-gl">{{Sound}}</div>'
          '<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}'
          + SAY_WORD + '</div></div>')
ASK = ('<div class="uc-ask">Which letter is this?</div>'
       '<div class="uc-field"><div class="uc-gl">{{Sound}}</div></div>')
FRONT_L = LETTER
BACK_L = '{{FrontSide}}<hr>' + DETAIL
FRONT_S = ASK
BACK_S = '{{FrontSide}}<hr>' + LETTER + DETAIL

CSS = """.card {
  text-align: center;
  font-size: 17px;
  line-height: 1.6;
}
.uc-ask {
  margin-bottom: 14px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.55;
}
.uc-letter {
  font-size: 64px;
  font-weight: 400;
  line-height: 1.15;
}
.uc-say {
  margin-left: 14px;
  vertical-align: middle;
  font-size: 15px;
}
.uc-field {
  display: block;
  width: fit-content;
  min-width: min(300px, 100%);
  max-width: 100%;
  margin: 14px auto 0;
  padding: 11px 15px;
  border: 1px solid var(--rule, rgba(0,0,0,0.12));
  border-radius: 11px;
  text-align: left;
  background: color-mix(in srgb, var(--paper-2, #EFEDE6) 58%, var(--card, #FFFFFF));
}
.uc-pos {
  margin-bottom: 3px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint, #6C6A63);
}
.uc-gap {
  margin-top: 10px;
}
.uc-gl {
  line-height: 1.5;
}
.uc-ex {
  font-size: 19px;
}
.uc-exe {
  margin-left: 6px;
  opacity: 0.62;
}
"""

_ACC = '̏́̀̑̄'


def bare(s):
    s = unicodedata.normalize('NFD', s)
    s = ''.join(ch for ch in s if ch not in _ACC)
    return unicodedata.normalize('NFC', s)


def main():
    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from sr import lat as to_lat
    rows = [(f'{c} {s}', la, snd, w, m) for c, s, la, snd, w, m in LETTERS] + \
           [(mk, name, snd, w, m) for mk, name, snd, w, m in MARKS]
    cards = []
    for i, (letter, latin, sound, word, meaning) in enumerate(rows, 1):
        cards.append({'sub': '', 'fields': {
            'Letter': E(letter),
            'Latin': E(latin),
            'Sound': E(sound),
            'Example': (f'<span class="uc-ex">{E(word)}</span><span class="uc-exe">'
                        f'{E(to_lat(bare(word)))} · {E(meaning)}</span>'),
            'Word': E(bare(word)),
        }, 'id': f'u_srabc_{i}', 'type': TYPE_ID})
    desc = (
        "The 30 letters of the Serbian Cyrillic alphabet in their own order, each with its twin "
        "in the Latin alphabet, then the five accent marks the level decks print and the r that "
        "is a vowel — the first deck of the Serbian collection. Serbian is written in both "
        "alphabets, letter for letter, and every level deck prints its headwords in Cyrillic "
        "with the Latin beneath. Both directions: see a letter and recall its sound, or see a "
        "sound and recall the letter, each a card with its own schedule. Every note gives the "
        "letter in capital and small, its Latin equivalent (three Cyrillic letters, љ њ џ, are "
        "two Latin ones, lj nj dž), its sound described in English words, and one everyday word "
        "that shows it, with a speaker. The letters have no names: a Serbian says a consonant as "
        "itself when spelling. The spelling follows Vuk Karadžić's rule of 'write as you speak "
        "and read as it is written', so a word is read letter by letter. The sounds are approximations, as every learner's alphabet gives them, and the "
        "cards for ђ and џ, ћ and ч say how each pair differs. The accent marks are not part of "
        "everyday spelling; dictionaries print them, and so do the level decks, because Serbian "
        "stress can fall on any syllable, though rarely the last, and carries a falling or a rising tone on "
        "a short or a long vowel: four accents, and a fifth mark for a long vowel after the "
        "stress. Sources: Wikipedia, \"Serbian Cyrillic alphabet\" (revision 1380570209) and "
        "\"Serbo-Croatian phonology\" (revision 1384903020), CC BY-SA 4.0; the example words "
        "and their accents are English Wiktionary's, via the kaikki.org extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'srabc', 'title': 'Serbian Alphabet',
        'subtitle': '30 letters, their Latin twins and the accent marks · both directions, as two '
                    'cards per letter',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['serbian', 'alphabet', 'cyrillic'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Serbian letter', 'speechLang': 'sr-RS',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Serbian-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes')


if __name__ == '__main__':
    main()
