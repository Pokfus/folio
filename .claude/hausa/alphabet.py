#!/usr/bin/env python3
"""Write the Hausa alphabet deck: `decks/Hausa-Alphabet.folio-deck.json`.

    python3 .claude/hausa/alphabet.py

Asked for by the owner on 2026-11-09 ("Alphabet (Boko)"): the first deck of the
Hausa collection, sorted before A1 by `levelRank`'s "Alphabet" rule.  Hausa has
been written in the Latin alphabet (Boko) since the colonial period, and that is
the spelling every level deck uses; most of its letters are said as an English
reader expects, so this deck is short and spends its notes on the ones that are
NOT: the hooked letters ɓ ɗ ƙ and 'y (ƴ), the ejective ts, c for "ch", the two
r sounds writing does not tell apart, the glottal stop, the vowels and
diphthongs, and the w / y digraphs (kw, gw, ƙw, ky).

ONE NOTE PER LETTER OR DIGRAPH, in the order Nigerian primers give the alphabet
(a b ɓ c d ɗ e f g h i j k ƙ l m n o r s sh t ts u w y 'y z), then the glottal
stop, the second r, the two diphthongs and the digraphs.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's alphabets
give them, never IPA; where English has no equivalent -- the implosives, the
ejectives, the glottalised y -- the card says what the throat does instead of
pretending.  The descriptions are the standard ones of Standard (Kano) Hausa.
Each example word is a word of the A1 deck, shown with Wiktionary's toned form
(`lex.json`), so the two decks agree; no corpus is read, so a re-run is
byte-identical whenever `lex.json` is.

NO SPEAKER BUTTON, for the level decks' reason (`build_deck.py`): a device without
a Hausa voice reads the letter in English.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ha import norm

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'ha-abc'
from build_deck import COLOR   # one hue for the whole collection

# (letter shown, sound, example word, its meaning)
LETTERS = [
    ('A a', 'a vowel said long as the a of father, or short, close to the u of cut — '
     'writing does not show which', 'abu', 'thing'),
    ('B b', 'b, as in English', 'babba', 'big'),
    ('Ɓ ɓ', 'an IMPLOSIVE b: the voice box drops as the lips part, so the air is drawn '
     'slightly inward — a hollow, gulping b, a different sound from plain b', 'ɓarawo', 'thief'),
    ('C c', 'always the ch of church — never the c of cat or city', 'ci', 'to eat'),
    ('D d', 'd, as in English', 'dogo', 'tall'),
    ('Ɗ ɗ', 'an IMPLOSIVE d: like ɓ, made with the voice box dropping and the air drawn '
     'slightly inward — a different sound from plain d', 'ɗaya', 'one'),
    ('E e', 'a pure vowel like the e of café, long or short, without the glide into "ee" '
     'of English day', 'kare', 'dog'),
    ('F f', 'an f made with both lips, as in blowing out a candle; many speakers say an '
     'English f, and some a p', 'fari', 'white'),
    ('G g', 'always the hard g of go — never the g of gem', 'gida', 'home'),
    ('H h', 'h, as in English', 'hanci', 'nose'),
    ('I i', 'a vowel said long as the ee of see, or short as the i of bit', 'ido', 'eye'),
    ('J j', 'the j of jam', 'jiki', 'body'),
    ('K k', 'k, as in English', 'kifi', 'fish'),
    ('Ƙ ƙ', 'an EJECTIVE k: the throat is shut and a puff of air is pushed out with the k, '
     'giving a sharp popping k, a different sound from plain k', 'ƙasa', 'land, ground'),
    ('L l', 'l, as in English', 'launi', 'colour'),
    ('M m', 'm, as in English', 'mace', 'woman'),
    ('N n', 'n, as in English; at the end of a syllable it takes the sound of the next '
     'consonant, and at the end of a word it can sound like the ng of sing', 'nama', 'meat'),
    ('O o', 'a pure vowel like the o of so, long or short, without the glide into "oo"',
     'doki', 'horse'),
    ('R r', 'usually a FLAP made with the tongue tip curled back and flicked forward, close '
     'to the tt of American butter; ordinary writing does not tell it from the rolled r '
     '(r̃, below)', 'ruwa', 'water'),
    ('S s', 's, as in English — never the z sound of rose', 'sabo', 'new'),
    ('Sh sh', 'the sh of shop; one sound, written with two letters', 'shekara', 'year'),
    ('T t', 't, as in English', 'taga', 'window'),
    ('Ts ts', 'an EJECTIVE s (or ts): said with the throat shut and a puff of air pushed out, '
     'a hard hissing sound with a catch in it — one sound, not t followed by s', 'tsoho', 'old'),
    ('U u', 'a vowel said long as the oo of food, or short as the u of put', 'uku', 'three'),
    ('W w', 'w, as in English', 'wasa', 'game, sport'),
    ('Y y', 'the y of yes', 'yaro', 'boy'),
    ("'Y 'y · Ƴ ƴ", "a GLOTTALISED y: a y with a catch in the throat; written 'y in Nigeria and "
     "ƴ in Niger, the same letter", "'ya", 'daughter'),
    ('Z z', 'z, as in English; some speakers say it close to the j of jam before i and e',
     'zafi', 'heat'),
    ("'", "the apostrophe is a letter: a GLOTTAL STOP, the catch in the middle of uh-oh; it is "
     "written inside a word (sa'a) and left unwritten at the start of one, where every Hausa "
     "word that seems to begin with a vowel has it", "sa'a", 'hour'),
    ('r̃', 'the ROLLED r, a trill or tap of the tongue tip like a Spanish or Scottish r; '
     'ordinary writing spells it r, and only dictionaries mark it r̃, as the tone lines in '
     'these decks do', 'karanta', 'to read'),
    ('ai', 'a diphthong like the i of kite; in Kano speech often nearer the ay of say',
     'aiki', 'work'),
    ('au', 'a diphthong like the ow of cow; in Kano speech often nearer the o of so',
     'zauna', 'to sit'),
    ('kw', 'k with rounded lips, as in the qu of queen — one sound, with gw and ƙw beside it',
     'kwana', 'to spend the night'),
    ('gw', 'g with rounded lips, as in the gu of penguin — one sound', 'gwiwa', 'knee'),
    ('ƙw', 'the ejective ƙ with rounded lips — one sound', 'ƙwai', 'egg'),
    ('ky', 'k followed closely by y, as in the c of cute — one sound', 'kyau', 'beauty, goodness'),
]

FIELDS = ['Letter', 'Sound', 'Example', 'Word']

LETTER = '<div class="uc-letter">{{Letter}}</div>'
DETAIL = ('<div class="uc-field"><div class="uc-pos">sound</div><div class="uc-gl">{{Sound}}</div>'
          '<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}</div></div>')
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
  font-size: 52px;
  font-weight: 400;
  line-height: 1.3;
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


def main():
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hausa-cache', 'lex.json')
    lex = json.load(open(cache, encoding='utf-8')) if os.path.exists(cache) else {}
    if not lex:
        raise SystemExit('alphabet.py reads the example words\' tones from lex.json: '
                         'run `python3 .claude/hausa/run.py` once first')
    cards, missing = [], []
    for i, (shown, sound, word, meaning) in enumerate(LETTERS, 1):
        L = lex.get(norm(word)) or {}
        tone = next((e['toned'] for e in L.get('entries', [])
                     if e['src'] == 'wiktionary' and e['toned'] and e['pos'] != 'name'), '')
        if not tone:
            missing.append(word)
        cards.append({'sub': '', 'fields': {
            'Letter': E(shown),
            'Sound': E(sound),
            'Example': (f'<span class="uc-ex">{E(word)}</span>'
                        + (f'<span class="uc-exr">{E(tone)}</span>' if tone else '')
                        + f'<span class="uc-exe">{E(meaning)}</span>'),
            'Word': E(word),
        }, 'id': f'u_haabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two letters share a sound side: the reverse card is unanswerable'
    if missing:
        raise SystemExit('no Wiktionary tone for: ' + ' '.join(missing))
    desc = (
        f"The Latin alphabet in which Hausa is written (Boko): {n} notes, one per letter, in the "
        "order Nigerian primers give it, then the glottal stop, the rolled r that dictionaries "
        "mark r̃, the two diphthongs (ai, au) and the four digraphs with w and y (kw, gw, ƙw, ky). "
        "The first deck of the Hausa collection. Both directions: see a letter and recall its "
        "sound, or see a sound and recall the letter, each a card with its own schedule. Most of "
        "the letters sound as an English reader expects, and the cards say so in a line; the "
        "notes that matter are the ones English has no letter for — the IMPLOSIVES ɓ and ɗ, said "
        "with the air drawn slightly inward; the EJECTIVES ƙ and ts, said with the throat shut and "
        "a puff of air pushed out; the glottalised 'y (written ƴ in Niger); c, which is always the "
        "ch of church; and the apostrophe, which is a consonant. Each card gives one everyday word "
        "that shows the sound, from the Hausa A1 deck, with the same word beneath it with its "
        "tones and vowel length marked as English Wiktionary gives them (a grave accent for a low "
        "tone, a circumflex for a falling one, a macron for a long vowel; a high tone is "
        "unmarked) — marks that ordinary writing leaves out. The sounds are approximations, as "
        "every learner's alphabet gives them, for Standard (Kano) Hausa. There is no read-aloud "
        "button: few devices carry a Hausa voice, and one without it reads the letter in English. "
        "Sources: the standard description of Standard Hausa; the example words' tones are "
        "English Wiktionary's, via the kaikki.org extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'haabc', 'title': 'Hausa Alphabet (Boko)',
        'subtitle': f'{n} letters and sounds · both directions, as two cards per letter',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['hausa', 'alphabet', 'boko'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Hausa letter', 'speechLang': 'ha-NG',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Hausa-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
