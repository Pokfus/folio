#!/usr/bin/env python3
"""Write the Russian alphabet deck: `decks/Russian-Alphabet.folio-deck.json`.

    python3 .claude/torfl/alphabet.py

Asked for by the owner on 2026-10-30, as the way into a set that has no
transliteration (docs/russian-decks-plan.md §4): the level decks are in
Cyrillic from their first card, so the alphabet comes first, as its own deck,
and the catalogue sorts it before A1 (`levelRank` in build-lang-decks.js).

THIRTY-THREE NOTES, ONE PER LETTER, IN ALPHABETICAL ORDER -- the order every
Russian learner and every Russian child recites, and the order a reader will
meet the letters in a dictionary.  Each note gives the letter in both cases, its
NAME (what a Russian calls it when spelling a word aloud: бэ, вэ, эль), its
SOUND described for an English speaker, and one everyday word that shows it,
with that word's stress and meaning.  Two cards a note, like every deck on the
shelf: letter -> sound, and sound -> letter.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's
alphabets give them, never IPA, which a beginner cannot read either.  Where
English has no near equivalent (ы, the rolled р, х) the card says so rather
than pretending.  Two notes say what spelling cannot: unstressed о is said
like а (молоко́ is "malakó"), and е, ё, ю, я soften the consonant before them.
Nothing here is sourced from a corpus; it is the standard description of the
modern alphabet of 1918 and every example word is in the A1 deck or plainly
basic.  No external data is read, so the file is reproduced byte for byte by
re-running this script.
"""
import html, json, os

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-10-30T00:00:00.000Z'
TYPE_ID = 'ru-abc'

# (capital, small, name, sound, example word stressed, its meaning)
LETTERS = [
    ('А', 'а', 'а', '"a" as in father', 'ма́ма', 'mum'),
    ('Б', 'б', 'бэ', '"b" as in bed', 'брат', 'brother'),
    ('В', 'в', 'вэ', '"v" as in van', 'вода́', 'water'),
    ('Г', 'г', 'гэ', '"g" as in go', 'го́род', 'city, town'),
    ('Д', 'д', 'дэ', '"d" as in dog', 'дом', 'house'),
    ('Е', 'е', 'е', '"ye" as in yes; after a consonant, "e" — and the consonant is softened',
     'есть', 'to eat'),
    ('Ё', 'ё', 'ё', '"yo" as in yonder; always stressed, and often printed as е', 'ёлка',
     'fir tree'),
    ('Ж', 'ж', 'жэ', '"zh", like the s in pleasure', 'жена́', 'wife'),
    ('З', 'з', 'зэ', '"z" as in zoo', 'зима́', 'winter'),
    ('И', 'и', 'и', '"ee" as in meet', 'и́мя', 'name'),
    ('Й', 'й', 'и кра́ткое', '"y" as in boy — a short и, always beside a vowel', 'мой', 'my'),
    ('К', 'к', 'ка', '"k" as in kite', 'кни́га', 'book'),
    ('Л', 'л', 'эль', '"l" as in ball, said with the tongue low', 'ле́то', 'summer'),
    ('М', 'м', 'эм', '"m" as in man', 'молоко́', 'milk'),
    ('Н', 'н', 'эн', '"n" as in no', 'нос', 'nose'),
    ('О', 'о', 'о', '"o" as in more when stressed; unstressed, it is said like а', 'окно́',
     'window'),
    ('П', 'п', 'пэ', '"p" as in pen', 'па́па', 'dad'),
    ('Р', 'р', 'эр', 'a rolled "r", made with the tip of the tongue; English has no equivalent',
     'ры́ба', 'fish'),
    ('С', 'с', 'эс', '"s" as in sun', 'сок', 'juice'),
    ('Т', 'т', 'тэ', '"t" as in top', 'там', 'there'),
    ('У', 'у', 'у', '"oo" as in boot', 'у́тро', 'morning'),
    ('Ф', 'ф', 'эф', '"f" as in fun', 'фо́то', 'photo'),
    ('Х', 'х', 'ха', '"kh", like the ch in Scottish loch', 'хлеб', 'bread'),
    ('Ц', 'ц', 'цэ', '"ts" as in cats', 'цвет', 'colour'),
    ('Ч', 'ч', 'че', '"ch" as in chair', 'чай', 'tea'),
    ('Ш', 'ш', 'ша', '"sh" as in shop, with the tongue pulled back', 'шко́ла', 'school'),
    ('Щ', 'щ', 'ща', 'a long, soft "sh", as in fresh sheep said quickly', 'ещё', 'still, more'),
    ('Ъ', 'ъ', 'твёрдый знак', 'the hard sign: no sound of its own; it keeps a consonant apart '
     'from the е, ё, ю or я after it', 'подъе́зд', 'entrance (to a block of flats)'),
    ('Ы', 'ы', 'ы', 'a vowel between the i of bit and the u of put, said with the tongue pulled '
     'back; English has no equivalent', 'мы', 'we'),
    ('Ь', 'ь', 'мя́гкий знак', 'the soft sign: no sound of its own; it softens the consonant '
     'before it', 'день', 'day'),
    ('Э', 'э', 'э', '"e" as in met', 'э́то', 'this, it'),
    ('Ю', 'ю', 'ю', '"yu" as in you', 'юг', 'south'),
    ('Я', 'я', 'я', '"ya" as in yard', 'я', 'I'),
]
assert len(LETTERS) == 33

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
    return s.replace('́', '')


def main():
    cards = []
    for i, (cap, small, name, sound, word, meaning) in enumerate(LETTERS, 1):
        cards.append({'sub': '', 'fields': {
            'Letter': f'{cap} {small}',
            'Name': E(name),
            'Sound': E(sound),
            'Example': f'<span class="uc-ex">{E(word)}</span><span class="uc-exe">{E(meaning)}</span>',
            'Word': E(bare(word)),
        }, 'id': f'u_ruabc_{i}', 'type': TYPE_ID})
    desc = (
        "The 33 letters of the Russian alphabet, in alphabetical order — the first deck of the "
        "Russian collection, since the level decks are written in Cyrillic from their first "
        "card and carry no transliteration. Both directions: see a letter and recall its sound, "
        "or see a sound and recall the letter, each a card with its own schedule. Every note "
        "gives the letter in capital and small, its name (what a Russian calls it when spelling "
        "a word aloud), its sound described in English words, and one everyday word that shows "
        "it, with its stress marked and a speaker beside it. The sounds are approximations, as "
        "every learner's alphabet gives them; where English has no near equivalent, as for ы, "
        "the rolled р and х, the card says so. Two things the spelling does not show are on the "
        "cards because a beginner meets them at once: an unstressed о is said like а, and е, ё, "
        "ю and я soften the consonant before them. The two signs, ъ and ь, have no sound of "
        "their own, and their cards say what they do instead."
    )
    meta = {
        'id': 'ruabc', 'title': 'Russian Alphabet',
        'subtitle': '33 letters · both directions, as two cards per letter',
        'desc': desc, 'author': '', 'language': 'en', 'color': '#2E5C9A',
        'tags': ['russian', 'alphabet', 'cyrillic'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Russian letter', 'speechLang': 'ru-RU',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Russian-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes')


if __name__ == '__main__':
    main()
