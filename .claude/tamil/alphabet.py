#!/usr/bin/env python3
"""Write the Tamil alphabet deck: `decks/Tamil-Alphabet.folio-deck.json`.

    python3 .claude/tamil/alphabet.py

The first deck of the Tamil collection, sorted before A1 by `levelRank`'s
"Alphabet" rule -- Hindi's arrangement (the owner's decision for Hindi,
2026-11-09, "a Devanagari deck, yes", followed here).  The level decks print a
romanisation under every word, so this deck is not a gate; it is where the
script itself is learnt.

ONE NOTE PER LETTER, IN THE TRADITIONAL ORDER -- the twelve vowels (uyir,
"life"), the āytam, the puḷḷi, the eighteen consonants (mey, "body") in the
order Tamil primers teach them, then the Grantha letters borrowed for words
from Sanskrit and English.  A vowel's note shows it standing alone AND as the
sign it becomes after a consonant, written on க (ஆ · கா), since the sign is what
a reader meets most; the 216 consonant-vowel letters (uyirmey) are those signs
on those consonants, so they are not notes of their own.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's
alphabets give them, never IPA, with the romanisation the level decks use
(Wiktionary's, ISO 15919: ā ī ū ē ō, ṭ ṇ ḷ ḻ for the retroflex sounds, ṉ ṟ for
the alveolar n and r, ḥ for the āytam).  Tamil script writes no difference
between k and g, t and d, p and b: one letter is said one way at the start of a
word or doubled and another between vowels or after a nasal, and the card says
so instead of pretending a letter has one sound.  The examples are the
romanisations of English Wiktionary (`lex.json`) where the word is there, so
the two decks agree; the descriptions are the standard ones of modern standard
Tamil.  No corpus is read for the content, so a re-run is byte-identical
whenever `lex.json` is.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ta import fold

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'ta-abc'
COLOR = '#CF3F57'

# (letter shown, what the speaker says, romanisation, sound, example word, its meaning)
LETTERS = [
    # the vowels: alone, and as the sign on க
    ('அ', 'அ', 'a', 'a short "a", like the u of cup or the a of about; every consonant carries it '
     'unless a sign or the puḷḷi says otherwise, so it has no sign of its own', 'அம்மா', 'mother'),
    ('ஆ · கா', 'ஆ', 'ā', '"a" as in father, long', 'ஆண்', 'man, male'),
    ('இ · கி', 'இ', 'i', '"i" as in bit, short', 'இரவு', 'night'),
    ('ஈ · கீ', 'ஈ', 'ī', '"ee" as in see, long', 'ஈட்டி', 'spear'),
    ('உ · கு', 'உ', 'u', '"u" as in put, short; at the end of a word often said with the lips '
     'unrounded, almost swallowed. Its sign changes shape from consonant to consonant '
     '(கு, டு, மு), so each is learnt by sight', 'உப்பு', 'salt'),
    ('ஊ · கூ', 'ஊ', 'ū', '"oo" as in food, long; its sign too changes shape with the consonant',
     'ஊர்', 'town, village'),
    ('எ · கெ', 'எ', 'e', '"e" as in bed, short; its sign is written BEFORE the consonant it '
     'follows in speech', 'எட்டு', 'eight'),
    ('ஏ · கே', 'ஏ', 'ē', 'like the a of cake held long, one pure vowel without the glide into '
     '"ee"; its sign too is written before the consonant', 'ஏழு', 'seven'),
    ('ஐ · கை', 'ஐ', 'ai', '"ai" as in aisle; its sign is written before the consonant',
     'ஐந்து', 'five'),
    ('ஒ · கொ', 'ஒ', 'o', 'a short pure "o", between the o of hot and the o of go; its sign is '
     'written around the consonant, one part before it and one after', 'ஒன்று', 'one'),
    ('ஓ · கோ', 'ஓ', 'ō', 'like the o of go held long, one pure vowel without the glide into '
     '"oo"; its sign too is written around the consonant', 'ஓடு', 'to run'),
    ('ஔ · கௌ', 'ஔ', 'au', '"ow" as in cow; the rarest vowel, its sign written around the '
     'consonant', 'ஔவை', 'elderly woman; the name of the poet Auvaiyar'),
    # the two signs
    ('ஃ', 'ஆய்தம்', 'ḥ', 'āytam, the three dots: a rare sign, a soft breath of "h" in a few old '
     'words; before ப it writes the f of English words (ஃப = f)', 'எஃகு', 'steel'),
    ('க்', 'புள்ளி', '—', 'puḷḷi, the dot above: the consonant has NO vowel after it (க் = k); '
     'a consonant without it carries a (க = ka)', 'இல்லை', 'no'),
    # the consonants (mey), in the primers' order
    ('க', 'க', 'ka', '"k" at the start of a word and when doubled (க்க); a "g" after ங (ங்க); '
     'between vowels a soft g, often almost h (மகன் makaṉ, said "magan")', 'கடை', 'shop'),
    ('ங', 'ங', 'ṅa', '"ng" as in sing; almost always just before க (ங்க), and never starts a word',
     'சிங்கம்', 'lion'),
    ('ச', 'ச', 'ca', 'at the start of a word an "s" in most speech, or "ch"; "ch" when doubled '
     '(ச்ச); a "j" after ஞ (ஞ்ச); between vowels an "s"', 'சாவி', 'key'),
    ('ஞ', 'ஞ', 'ña', '"ny" as in canyon; mostly before ச (ஞ்ச), and at the start of a few words',
     'ஞாயிறு', 'Sunday; the sun'),
    ('ட', 'ட', 'ṭa', 'a "t" with the tongue tip curled back to the roof of the mouth (retroflex); '
     'never starts a Tamil word; between vowels it becomes a curled-back "d" '
     '(வீடு vīṭu, said "veedu")', 'வீடு', 'house'),
    ('ண', 'ண', 'ṇa', 'an "n" with the tongue tip curled back (retroflex); never starts a word',
     'கண்', 'eye'),
    ('த', 'த', 'ta', 'a soft "t" with the tongue against the back of the upper teeth (dental), as '
     'in French or Spanish; between vowels a soft dental "d", near the th of this',
     'தண்ணீர்', 'water'),
    ('ந', 'ந', 'na', 'an "n" with the tongue against the upper teeth (dental); the n that starts '
     'a word, and the one before த (ந்த)', 'நாள்', 'day'),
    ('ப', 'ப', 'pa', '"p" at the start of a word and when doubled (ப்ப); a "b" after ம (ம்ப) and, '
     'softly, between vowels', 'பால்', 'milk'),
    ('ம', 'ம', 'ma', '"m" as in man', 'மழை', 'rain'),
    ('ய', 'ய', 'ya', '"y" as in yes', 'யார்', 'who?'),
    ('ர', 'ர', 'ra', 'a single tap of the tongue, like the r of Spanish pero; never starts a '
     'Tamil word (the English "rail" is written இரயில், with a vowel first)', 'மரம்', 'tree'),
    ('ல', 'ல', 'la', '"l" as in leaf, the tongue tip on the ridge behind the teeth', 'பல்',
     'tooth'),
    ('வ', 'வ', 'va', 'between "v" and "w": the lower lip only lightly touches the teeth', 'வா',
     'come!'),
    ('ழ', 'ழ', 'ḻa', 'the sound Tamil is known for: the tongue tip curled far back and held '
     'without touching the roof of the mouth, near an American r said with the tongue turned up; '
     'often written zh in English (Tamizh)', 'தமிழ்', 'Tamil'),
    ('ள', 'ள', 'ḷa', 'an "l" with the tongue tip curled back to the roof of the mouth '
     '(retroflex)', 'பள்ளி', 'school'),
    ('ற', 'ற', 'ṟa', 'a firmer r than ர, tapped or trilled further forward; doubled (ற்ற) it is '
     'said "ttr", or as a hard t; never starts a word', 'ஆறு', 'six; river'),
    ('ன', 'ன', 'ṉa', 'an "n" as in English, the tongue tip on the ridge behind the teeth '
     '(alveolar); never starts a word, and ends very many', 'மகன்', 'son'),
    # the Grantha letters, for words from Sanskrit and English
    ('ஜ', 'ஜ', 'ja', '"j" as in jam — a Grantha letter, borrowed for words from Sanskrit and '
     'English', 'ஜன்னல்', 'window'),
    ('ஷ', 'ஷ', 'ṣa', '"sh" as in ship — a Grantha letter', 'கஷ்டம்', 'difficulty'),
    ('ஸ', 'ஸ', 'sa', '"s" as in sun — a Grantha letter', 'பஸ்', 'bus'),
    ('ஹ', 'ஹ', 'ha', '"h" as in hand — a Grantha letter', 'ஹோட்டல்', 'hotel'),
    ('க்ஷ', 'க்ஷ', 'kṣa', 'a joined Grantha letter, க் + ஷ, said "ksh"', 'அக்ஷரம்',
     'letter, syllable'),
    ('ஸ்ரீ', 'ஸ்ரீ', 'śrī', 'a joined Grantha letter, ஸ் + ர + ீ, said "shree" or "sree": the '
     'honorific Sri, written as one shape', 'ஸ்ரீலங்கா', 'Sri Lanka'),
]

FIELDS = ['Letter', 'Name', 'Sound', 'Example', 'Word']

# The one example that is not a Wiktionary headword, romanised by hand in the same
# system (ISO 15919, as Wiktionary's Tamil entries are).
ROMAN_BY_HAND = {'ஸ்ரீலங்கா': 'śrīlaṅkā'}

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
  font-size: 60px;
  font-weight: 400;
  line-height: 1.3;
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
.uc-rm {
  font-weight: 600;
}
.uc-ex {
  font-size: 21px;
}
.uc-exr {
  margin-left: 6px;
  font-size: 14px;
  opacity: 0.62;
}
.uc-exe {
  margin-left: 6px;
  opacity: 0.62;
}
"""


def main():
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tamil-cache', 'lex.json')
    lex = json.load(open(cache, encoding='utf-8')) if os.path.exists(cache) else {}
    if not lex:
        raise SystemExit('alphabet.py reads the example words\' romanisation from lex.json: '
                         'run `python3 .claude/tamil/run.py` once first')
    cards, missing = [], []
    for i, (shown, name, rom, sound, word, meaning) in enumerate(LETTERS, 1):
        L = lex.get(fold(word)) or {}
        wr = L.get('roman') or next((e['roman'] for e in L.get('entries', []) if e.get('roman')), '') \
            or ROMAN_BY_HAND.get(word, '')
        if not wr:
            missing.append(word)
        cards.append({'sub': '', 'fields': {
            'Letter': E(shown),
            'Name': E(name),
            'Sound': (f'<span class="uc-rm">{E(rom)}</span> · ' if rom not in ('—', '̃') else '')
                     + E(sound),
            'Example': (f'<span class="uc-ex">{E(word)}</span>'
                        + (f'<span class="uc-exr">{E(wr)}</span>' if wr else '')
                        + f'<span class="uc-exe">{E(meaning)}</span>'),
            'Word': E(word),
        }, 'id': f'u_taabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two letters share a sound side: the reverse card is unanswerable'
    if missing:
        print('  no Wiktionary romanisation for:', ' '.join(missing))
    desc = (
        f"The Tamil script: {n} notes, in the traditional order — the twelve vowels, the āytam "
        "(ஃ) and the puḷḷi (the dot that silences a consonant's vowel), the eighteen consonants "
        "in the order Tamil primers teach them, and the six Grantha letters borrowed for words "
        "from Sanskrit and English (ஜ, ஷ, ஸ, ஹ, க்ஷ, ஸ்ரீ). The first deck of the Tamil collection. "
        "Both directions: see a letter and recall its sound, or see a sound and recall the "
        "letter, each a card with its own schedule. Each vowel is shown alone and as the sign it "
        "becomes after a consonant, written on க (ஆ · கா), since the sign is what a reader meets "
        "most: every one of the 216 consonant-vowel letters is one of those signs on one of "
        "these consonants. Every note gives the romanisation the level decks use, the sound "
        "described in English words, and one everyday word that shows it, with a speaker beside "
        "the letter and the word. The sounds are approximations, as every learner's alphabet "
        "gives them. Tamil script writes no difference between k and g, t and d, or p and b — one "
        "letter is said one way at the start of a word and another between vowels — and it has "
        "three n's, three l's and two r's that English does not tell apart; where English has no "
        "equivalent, the card says what to do with the tongue instead. Sources: the standard "
        "description of modern standard Tamil; the example words' romanisations are English "
        "Wiktionary's, via the kaikki.org extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'taabc', 'title': 'Tamil Alphabet',
        'subtitle': f'{n} letters and signs · both directions, as two cards per letter',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['tamil', 'alphabet', 'script'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Tamil letter', 'speechLang': 'ta-IN',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Tamil-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
