#!/usr/bin/env python3
"""Write the Icelandic alphabet deck: `decks/Icelandic-Alphabet.folio-deck.json`.

    python3 .claude/icelandic/alphabet.py

The first deck of the Icelandic collection, sorted before A1 by `levelRank`'s
"Alphabet" rule.  Icelandic is written in the Latin alphabet, so this deck is not
a gate the way Greek's or Hindi's is; it is where the LETTERS ENGLISH DOES NOT
HAVE and the SOUNDS are learnt -- the Finnish and Hungarian decks' reasoning.
Icelandic has thirty-two letters: þ and ð (the two "th" sounds), æ and ö, and an
accented partner for six vowels (á é í ó ú ý) that is a letter of its own with a
sound of its own -- `á` is the "ow" of cow, not a long a.  It has no c, q, w or z.

ONE NOTE PER LETTER OF THE ICELANDIC ALPHABET, IN ITS OWN ORDER -- a á b d ð e é
f g h i í j k l m n o ó p r s t u ú v x y ý þ æ ö, each with its Icelandic name;
then seven notes on what no single letter shows: the diphthongs ei/ey and au,
hv, ll, the breath before pp/tt/kk, the stress, and vowel length.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's alphabets
give them, never IPA.  Every sound side is unique (asserted), or the reverse card
would have two answers.  The example words are checked against English Wiktionary
(`lex.json`): one that is not a headword stops the build.  No corpus is read, so a
re-run is byte-identical whenever this file is.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from isl import fold

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-15T00:00:00.000Z'
TYPE_ID = 'is-abc'
COLOR = '#303696'          # the shelf's measured hue (app.js, `lang-icelandic`)

# (shown, its name -- what the speaker says, sound, example word, its meaning)
LETTERS = [
    ('A a', 'a', '"a" as in father — held long in a stressed syllable before one consonant',
     'vatn', 'water'),
    ('Á á', 'á', '"ow" as in cow — a letter of its own, not a kind of a', 'ár', 'year'),
    ('B b', 'bé', '"p" as in spin, without a puff of breath — never the full buzz of English b',
     'barn', 'child'),
    ('D d', 'dé', '"t" as in stop, without a puff of breath', 'dagur', 'day'),
    ('Ð ð', 'eð', '"th" as in this — never at the start of a word', 'maður', 'man; person'),
    ('E e', 'e', '"e" as in bed', 'epli', 'apple'),
    ('É é', 'é', '"ye" as in yes', 'ég', 'I'),
    ('F f', 'eff', '"f" as in fun at the start of a word; "v" between vowels and at the end of a '
     'word (hafa, "to have"); "p" before l or n (nafn, "name")', 'fiskur', 'fish'),
    ('G g', 'ge', '"k" as in skin, without a puff of breath, at the start of a word; between '
     'vowels it softens to a breathy sound made at the back of the mouth (saga, "story")',
     'gata', 'street'),
    ('H h', 'há', '"h" as in hat — and hv is said "kv" (hvað, "what")', 'hestur', 'horse'),
    ('I i', 'i', '"i" as in sit', 'litur', 'colour'),
    ('Í í', 'í', '"ee" as in see', 'ís', 'ice; ice cream'),
    ('J j', 'joð', '"y" as in yes — never the j of jam', 'jól', 'Christmas'),
    ('K k', 'ká', '"k" as in kit, with a puff of breath at the start of a word; "ky" before e, '
     'i, í, y, ý, æ and ei (kind, "sheep")', 'kona', 'woman'),
    ('L l', 'ell', '"l" as in leaf — and ll is said like "tl" (fjall, "mountain")', 'lest',
     'train'),
    ('M m', 'emm', '"m" as in man', 'matur', 'food'),
    ('N n', 'enn', '"n" as in net — and nn after an accented vowel or a diphthong is said like '
     '"tn" (steinn, "stone")', 'nef', 'nose'),
    ('O o', 'o', '"o" as in British hot, the lips rounded', 'ostur', 'cheese'),
    ('Ó ó', 'ó', '"o" as in go, gliding to "oo" — never the o of hot', 'sól', 'sun'),
    ('P p', 'pé', '"p" as in pen, with a puff of breath at the start of a word', 'pabbi', 'dad'),
    ('R r', 'err', 'a rolled or tapped "r", as in Scottish English — always said, wherever it '
     'stands', 'rauður', 'red'),
    ('S s', 'ess', '"s" as in see — never a z sound', 'sími', 'telephone'),
    ('T t', 'té', '"t" as in top, with a puff of breath at the start of a word', 'tími', 'time'),
    ('U u', 'u', 'no English sound: the German ü of hübsch — say "i" as in sit with the lips '
     'rounded', 'gulur', 'yellow'),
    ('Ú ú', 'ú', '"oo" as in food', 'hús', 'house'),
    ('V v', 'vaff', '"v" as in van', 'vinur', 'friend'),
    ('X x', 'ex', '"ks" as in box', 'lax', 'salmon'),
    ('Y y', 'ufsilon i', 'the same sound as i, "i" as in sit — the two letters are spelt apart '
     'for history, not sound', 'yfir', 'over'),
    ('Ý ý', 'ufsilon í', 'the same sound as í, "ee" as in see — spelt apart from í for history, '
     'not sound', 'nýr', 'new'),
    ('Þ þ', 'þorn', '"th" as in thin — met only at the start of a word', 'þrír', 'three'),
    ('Æ æ', 'æ', '"eye" — the i of ice', 'bær', 'town; farm'),
    ('Ö ö', 'ö', 'the German ö or the French eu: say "e" as in bed with the lips rounded',
     'hönd', 'hand'),
    # what no single letter shows
    ('ei ey', 'tvíhljóð ei', 'both spellings are one sound, "ay" as in day', 'eyra', 'ear'),
    ('au', 'tvíhljóð au', 'no English sound: ö gliding into í, the lips rounded at the start — '
     'never the "aw" of English', 'auga', 'eye'),
    ('hv', 'hv', 'said "kv", the k with a puff of breath', 'hvað', 'what'),
    ('ll', 'tvöfalt l', 'said "tl", the tongue held for the l (fjall "mountain", allur "all")',
     'fjall', 'mountain'),
    ('pp tt kk', 'aðblástur', 'a doubled p, t or k is said with a puff of breath BEFORE it, like '
     'an h: takk is said "tahk"', 'takk', 'thanks'),
    ('FJÖL-skyl-da', 'áhersla', 'the stress: every word is stressed on its FIRST syllable, '
     'whatever its length', 'fjölskylda', 'family'),
    ('a á — langt', 'lengd', 'a vowel is LONG in a stressed syllable before one consonant or none, '
     'and short before two: matur "food" (long a), takk "thanks" (short a)', 'matur', 'food'),
]

FIELDS = ['Letter', 'Name', 'Called', 'Sound', 'Example', 'Word']

SAY_NAME = '<span class="uc-tts uc-say" data-say="{{Name}}"></span>'
SAY_WORD = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
LETTER = '<div class="uc-letter">{{Letter}}' + SAY_NAME + '</div>'
DETAIL = ('<div class="uc-field">{{#Called}}<div class="uc-pos">name</div><div class="uc-gl">'
          '{{Called}}</div><div class="uc-pos uc-gap">sound</div>{{/Called}}'
          '{{^Called}}<div class="uc-pos">sound</div>{{/Called}}<div class="uc-gl">{{Sound}}</div>'
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

NOT_IN_WIKTIONARY = set()


def main():
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'icelandic-cache',
                         'lex.json')
    if not os.path.exists(cache):
        raise SystemExit('alphabet.py checks its example words against lex.json: '
                         'run `python3 .claude/icelandic/run.py` once first')
    lex = json.load(open(cache, encoding='utf-8'))
    missing = [w for _, _, _, w, _ in LETTERS if fold(w) not in lex and w not in NOT_IN_WIKTIONARY]
    if missing:
        raise SystemExit('not a Wiktionary headword: ' + ' '.join(missing))
    cards = []
    for i, (shown, name, sound, word, meaning) in enumerate(LETTERS, 1):
        letter = i <= 32
        cards.append({'sub': '', 'fields': {
            'Letter': E(shown),
            'Name': E(name),
            'Called': E(name) if letter else '',
            'Sound': E(sound),
            'Example': (f'<span class="uc-ex">{E(word)}</span>'
                        f'<span class="uc-exe">{E(meaning)}</span>'),
            'Word': E(word),
        }, 'id': f'u_isabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two letters share a sound side: the reverse card is unanswerable'
    desc = (
        f"The Icelandic alphabet and its sounds: {n} notes — the thirty-two letters in Icelandic "
        "alphabetical order, capital and small, with each one's Icelandic name; then seven notes on "
        "what no single letter shows: the diphthongs ei/ey and au, hv, ll, the breath before a "
        "doubled p, t or k, the stress, and vowel length. The first deck of the Icelandic collection. "
        "Icelandic uses the Latin alphabet with letters English does not have — þ and ð, the two "
        "\"th\" sounds of thin and this; æ, the i of ice; ö — and an accented partner for six "
        "vowels that is a letter of its own with a sound of its own (á is the \"ow\" of cow, é the "
        "\"ye\" of yes); it has no c, q, w or z. Both directions: see a letter and recall its sound, "
        "or see a sound and recall the letter, each a card with its own schedule. Every note "
        "describes the sound in English words and gives one word that shows it, with a speaker "
        "beside the letter and the word. The sounds are approximations, as every learner's "
        "alphabet gives them; where English has no equivalent — u, ö, au — the card says what to do "
        "instead. Sources: the standard description of Icelandic spelling and pronunciation; the "
        "example words are checked against English Wiktionary, via the kaikki.org extraction "
        "(CC BY-SA 4.0)."
    )
    meta = {
        'id': 'isabc', 'title': 'Icelandic Alphabet',
        'subtitle': f'The 32 letters and their sounds, then diphthongs, stress and length ({n} notes) · '
                    'both directions, as two cards each',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['icelandic', 'alphabet'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Icelandic letter', 'speechLang': 'is-IS',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Icelandic-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
