#!/usr/bin/env python3
"""Write the Ukrainian alphabet deck: `decks/Ukrainian-Alphabet.folio-deck.json`.

    python3 .claude/ukrainian/alphabet.py

The way into a set that has no transliteration (the Russian precedent,
`docs/russian-decks-plan.md` §4): the level decks are in Cyrillic from their
first card, so the alphabet comes first, as its own deck, and the catalogue
sorts it before A1 (`levelRank` in build-lang-decks.js).

THIRTY-THREE LETTERS IN ALPHABETICAL ORDER, THEN THE APOSTROPHE -- the order
of the Ukrainian orthography (Правопис, 2019) and of every dictionary.  The
apostrophe is not a letter, but it is written inside words (`пʼять`, `сімʼя`)
and changes how they are said, so it has a note of its own, last.  Each note
gives the letter in both cases, its NAME (what a Ukrainian calls it when
spelling a word aloud: бе, ве, ге), its SOUND described for an English
speaker, and one everyday word that shows it, with its stress and meaning.
Two cards a note: letter -> sound, and sound -> letter.

WHAT THE SOUNDS ARE.  Approximations in English words, as learner's alphabets
give them, never IPA.  Where English has no near equivalent (и, the rolled р,
the voiced г, х) the card says so.  The notes a Russian reader most needs are
on the cards because they are where the two alphabets part: г is an h, not a
g (ґ is the g); и is not і; е is not "ye" (є is); and an unstressed о keeps
its o.  Nothing here is read from a corpus, and every example word is in the
A1 deck or plainly basic, so the file is reproduced byte for byte by
re-running this script.
"""
import html, json, os

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'uk-abc'

# (capital, small, name, sound, example word stressed, its meaning)
LETTERS = [
    ('А', 'а', 'а', '"a" as in father', 'ма́ма', 'mum'),
    ('Б', 'б', 'бе', '"b" as in bed', 'брат', 'brother'),
    ('В', 'в', 'ве', '"v" as in van; at the end of a syllable, nearer the w of how', 'вода́',
     'water'),
    ('Г', 'г', 'ге', 'a voiced "h", like the h of ahead said with the voice on — never the g of go',
     'гора́', 'mountain'),
    ('Ґ', 'ґ', 'ґе', '"g" as in go; a letter of few words', 'ґа́нок', 'porch'),
    ('Д', 'д', 'де', '"d" as in dog', 'дім', 'house, home'),
    ('Е', 'е', 'е', '"e" as in met — never "ye"', 'сестра́', 'sister'),
    ('Є', 'є', 'є', '"ye" as in yes; after a consonant, "e" with the consonant softened', 'є',
     'there is, is'),
    ('Ж', 'ж', 'же', '"zh", like the s in pleasure', 'жі́нка', 'woman'),
    ('З', 'з', 'зе', '"z" as in zoo', 'зима́', 'winter'),
    ('И', 'и', 'и', 'a short vowel near the i of bit, said a little further back; not the same '
     'as і', 'ми', 'we'),
    ('І', 'і', 'і', '"ee" as in meet', 'ніч', 'night'),
    ('Ї', 'ї', 'ї', '"yee" as in yeast — always a y and an i', 'ї́жа', 'food'),
    ('Й', 'й', 'йот', '"y" as in boy — a short i, always beside a vowel', 'мій', 'my'),
    ('К', 'к', 'ка', '"k" as in kite', 'кіт', 'cat'),
    ('Л', 'л', 'ел', '"l" as in ball', 'лі́жко', 'bed'),
    ('М', 'м', 'ем', '"m" as in man', 'молоко́', 'milk'),
    ('Н', 'н', 'ен', '"n" as in no', 'ніс', 'nose'),
    ('О', 'о', 'о', '"o" as in more, but shorter — and still o when unstressed', 'вікно́',
     'window'),
    ('П', 'п', 'пе', '"p" as in pen', 'парк', 'park'),
    ('Р', 'р', 'ер', 'a rolled "r", made with the tip of the tongue; English has no equivalent',
     'ри́ба', 'fish'),
    ('С', 'с', 'ес', '"s" as in sun', 'сік', 'juice'),
    ('Т', 'т', 'те', '"t" as in top', 'та́то', 'dad'),
    ('У', 'у', 'у', '"oo" as in boot', 'суп', 'soup'),
    ('Ф', 'ф', 'еф', '"f" as in fun', 'фільм', 'film'),
    ('Х', 'х', 'ха', '"kh", like the ch in Scottish loch', 'хліб', 'bread'),
    ('Ц', 'ц', 'це', '"ts" as in cats', 'цу́кор', 'sugar'),
    ('Ч', 'ч', 'че', '"ch" as in chair', 'чай', 'tea'),
    ('Ш', 'ш', 'ша', '"sh" as in shop', 'шко́ла', 'school'),
    ('Щ', 'щ', 'ща', '"shch", the sh and ch of fresh cheese said together', 'що', 'what'),
    ('Ь', 'ь', 'мʼяки́й знак', 'the soft sign: no sound of its own; it softens the consonant '
     'before it', 'день', 'day'),
    ('Ю', 'ю', 'ю', '"yu" as in you; after a consonant, "u" with the consonant softened', 'лю́ди',
     'people'),
    ('Я', 'я', 'я', '"ya" as in yard', 'я', 'I'),
    ('ʼ', 'ʼ', 'апостро́ф', 'the apostrophe, not a letter: no sound of its own; before я, ю, є '
     'or ї it keeps the consonant hard and lets their y be heard', 'пʼять', 'five'),
]
assert len(LETTERS) == 34

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
        }, 'id': f'u_ukabc_{i}', 'type': TYPE_ID})
    desc = (
        "The 33 letters of the Ukrainian alphabet, in alphabetical order, and the apostrophe — "
        "the first deck of the Ukrainian collection, since the level decks are written in "
        "Cyrillic from their first card and carry no transliteration. Both directions: see a "
        "letter and recall its sound, or see a sound and recall the letter, each a card with its "
        "own schedule. Every note gives the letter in capital and small, its name (what a "
        "Ukrainian calls it when spelling a word aloud), its sound described in English words, "
        "and one everyday word that shows it, with its stress marked and a speaker beside it. "
        "The sounds are approximations, as every learner's alphabet gives them; where English "
        "has no near equivalent, as for и, the rolled р and х, the card says so. Four things a "
        "reader who knows Russian should unlearn are on the cards: г is a voiced h and ґ is the "
        "g; и and і are two different vowels; е is never \"ye\" (є is); and an unstressed о is "
        "still said as o. The soft sign ь and the apostrophe have no sound of their own, and "
        "their cards say what they do instead."
    )
    meta = {
        'id': 'ukabc', 'title': 'Ukrainian Alphabet',
        'subtitle': '33 letters and the apostrophe · both directions, as two cards per letter',
        'desc': desc, 'author': '', 'language': 'en', 'color': '#9F4500',
        'tags': ['ukrainian', 'alphabet', 'cyrillic'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Ukrainian letter', 'speechLang': 'uk-UA',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Ukrainian-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes')


if __name__ == '__main__':
    main()
