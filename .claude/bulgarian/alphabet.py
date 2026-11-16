#!/usr/bin/env python3
"""Write the Bulgarian alphabet deck: `decks/Bulgarian-Alphabet.folio-deck.json`.

    python3 .claude/bulgarian/alphabet.py

The way into a set that has no transliteration (the Russian and Ukrainian
precedent): the level decks are in Cyrillic from their first card, so the
alphabet comes first, as its own deck, and the catalogue sorts it before A1
(`levelRank` in build-lang-decks.js).

THIRTY LETTERS IN ALPHABETICAL ORDER, the order of the official Bulgarian
alphabet and of every dictionary.  Each note gives the letter in both cases,
its NAME (what a Bulgarian calls it when spelling a word aloud: бъ, въ, гъ --
a consonant is named with the vowel ъ after it; Й is "и кратко", Ъ "ер голям"
and Ь "ер малък"), its SOUND described for an English speaker, and one
everyday word that shows it, with its stress and meaning.  Two cards a note:
letter -> sound, and sound -> letter.

WHAT THE SOUNDS ARE.  Approximations in English words, as learner's alphabets
give them, never IPA.  Where English has no near equivalent (the rolled р, х)
the card says so.  The notes a Russian reader most needs are on the cards
because they are where the two alphabets part: щ is "sht", not "shch"; ъ is a
full vowel, the a of "about", not a hard sign; ь is written only before о; е
is never "ye"; and there are no ы, э or ё.  Nothing here is read from a corpus,
and every example word is in the A1 deck or plainly basic, so the file is
reproduced byte for byte by re-running this script.
"""
import html, json, os

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-16T00:00:00.000Z'
TYPE_ID = 'bg-abc'

# (capital, small, name, sound, example word stressed, its meaning)
LETTERS = [
    ('А', 'а', 'а', '"a" as in father; unstressed, nearer the a of about', 'ма́ма', 'mum'),
    ('Б', 'б', 'бъ', '"b" as in bed', 'брат', 'brother'),
    ('В', 'в', 'въ', '"v" as in van', 'вода́', 'water'),
    ('Г', 'г', 'гъ', '"g" as in go — always a hard g, never an h', 'град', 'town, city'),
    ('Д', 'д', 'дъ', '"d" as in dog', 'ден', 'day'),
    ('Е', 'е', 'е', '"e" as in met — never "ye"', 'де́сет', 'ten'),
    ('Ж', 'ж', 'жъ', '"zh", like the s in pleasure', 'жена́', 'woman'),
    ('З', 'з', 'зъ', '"z" as in zoo', 'зи́ма', 'winter'),
    ('И', 'и', 'и', '"ee" as in meet, but shorter', 'и́ме', 'name'),
    ('Й', 'й', 'и кра́тко', '"y" as in boy — a short i, always beside a vowel', 'чай', 'tea'),
    ('К', 'к', 'къ', '"k" as in kite', 'кола́', 'car'),
    ('Л', 'л', 'лъ', '"l" as in ball; before е and и, the lighter l of leaf', 'ля́то', 'summer'),
    ('М', 'м', 'мъ', '"m" as in man', 'море́', 'sea'),
    ('Н', 'н', 'нъ', '"n" as in no', 'нощ', 'night'),
    ('О', 'о', 'о', '"o" as in more, but shorter; unstressed, nearer the u of put', 'о́сем',
     'eight'),
    ('П', 'п', 'пъ', '"p" as in pen', 'пет', 'five'),
    ('Р', 'р', 'ръ', 'a rolled "r", made with the tip of the tongue; English has no equivalent',
     'ри́ба', 'fish'),
    ('С', 'с', 'съ', '"s" as in sun', 'сол', 'salt'),
    ('Т', 'т', 'тъ', '"t" as in top', 'та́тко', 'dad'),
    ('У', 'у', 'у', '"oo" as in boot, but shorter', 'у́тре', 'tomorrow'),
    ('Ф', 'ф', 'фъ', '"f" as in fun', 'филм', 'film'),
    ('Х', 'х', 'хъ', '"kh", like the ch in Scottish loch', 'хляб', 'bread'),
    ('Ц', 'ц', 'цъ', '"ts" as in cats', 'цвят', 'colour'),
    ('Ч', 'ч', 'чъ', '"ch" as in chair', 'час', 'hour'),
    ('Ш', 'ш', 'шъ', '"sh" as in shop', 'шест', 'six'),
    ('Щ', 'щ', 'щъ', '"sht", as in ashtray — not the "shch" of Russian', 'ще', 'will'),
    ('Ъ', 'ъ', 'ер голя́м', 'a vowel: the a of about or the u of but — a full vowel of its '
     'own, not a sign', 'път', 'road, way'),
    ('Ь', 'ь', 'ер ма́лък', 'no sound of its own; written only before о, where it softens the '
     'consonant before it, so ьо is said "yo"', 'шофьо́р', 'driver'),
    ('Ю', 'ю', 'ю', '"yu" as in you; after a consonant, "u" with the consonant softened', 'ю́ли',
     'July'),
    ('Я', 'я', 'я', '"ya" as in yard; after a consonant, "a" with the consonant softened',
     'я́бълка', 'apple'),
]
assert len(LETTERS) == 30

FIELDS = ['Letter', 'Name', 'Sound', 'Example', 'Word']

SAY_NAME = '<span class="uc-tts uc-say" data-say="{{Name}}"></span>'
SAY_WORD = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
LETTER = '<div class="uc-letter">{{Letter}}' + SAY_NAME + '</div>'
DETAIL = ('<div class="uc-field"><div class="uc-pos">name</div><div class="uc-gl">{{Name}}</div>'
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


def bare(s):
    return s.replace('\u0301', '')


def main():
    cards = []
    for i, (cap, small, name, sound, word, meaning) in enumerate(LETTERS, 1):
        cards.append({'sub': '', 'fields': {
            'Letter': cap if cap == small else f'{cap} {small}',
            'Name': E(name),
            'Sound': E(sound),
            'Example': f'<span class="uc-ex">{E(word)}</span><span class="uc-exe">{E(meaning)}</span>',
            'Word': E(bare(word)),
        }, 'id': f'u_bgabc_{i}', 'type': TYPE_ID})
    desc = (
        "The 30 letters of the Bulgarian alphabet, in alphabetical order — the first deck of the "
        "Bulgarian collection, since the level decks are written in Cyrillic from their first card "
        "and carry no transliteration. Both directions: see a letter and recall its sound, or see a "
        "sound and recall the letter, each a card with its own schedule. Every note gives the "
        "letter in capital and small, its name (what a Bulgarian calls it when spelling a word "
        "aloud: a consonant is named with the vowel ъ after it, бъ, въ, гъ), its sound described "
        "in English words, and one everyday word that shows it, with its stress marked and a "
        "speaker beside it. The sounds are approximations, as every learner's alphabet gives "
        "them; where English has no near equivalent, as for the rolled р and х, the card says so. "
        "Five things a reader who knows Russian should unlearn are on the cards: щ is \"sht\", not "
        "\"shch\"; ъ is a full vowel, the a of about, and not a hard sign; ь is written only before "
        "о; е is never \"ye\"; and Bulgarian has no ы, э or ё. Bulgarian Cyrillic is also often "
        "printed in a rounded, handwriting-like typeface in which some small letters look "
        "different; this deck shows the letters in the reader's own font."
    )
    meta = {
        'id': 'bgabc', 'title': 'Bulgarian Alphabet',
        'subtitle': '30 letters · both directions, as two cards per letter',
        'desc': desc, 'author': '', 'language': 'en', 'color': '#813F8D',
        'tags': ['bulgarian', 'alphabet', 'cyrillic'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Bulgarian letter', 'speechLang': 'bg-BG',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Bulgarian-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes')


if __name__ == '__main__':
    main()
