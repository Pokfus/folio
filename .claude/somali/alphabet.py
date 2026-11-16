#!/usr/bin/env python3
"""Write the Somali alphabet deck: `decks/Somali-Alphabet.folio-deck.json`.

    python3 .claude/somali/alphabet.py

Asked for by the owner on 2026-11-16: the first deck of the Somali collection,
sorted before A1 by `levelRank`'s "Alphabet" rule.  Somali has been written in
the Latin alphabet since the official orthography of 1972, and that is the
spelling every level deck uses; most of its letters are said as an English reader
expects, so this deck spends its notes on the ones that are NOT: x and c (the
throat sounds of the Arabic ḥ and ʿayn), dh, q, kh, the glottal stop written ',
the short and the doubled (long) vowels, and the diphthongs.

ONE NOTE PER LETTER, in the order Somali primers give the consonants (b t j x kh
d r s sh dh c g f q k l m n w h y), then the glottal stop, the five vowels, the
long vowels as one note, and five diphthongs.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's alphabets
give them, never IPA; where English has no equivalent the card says what the
throat or the tongue does.  The descriptions are the standard ones of Standard
Somali.  Each example word is a word of the A1 deck, shown with Wiktionary's
accented spelling where it has one (`lex.json`), so the two decks agree; no
corpus is read, so a re-run is byte-identical whenever `lex.json` is.

NO SPEAKER BUTTON, for the level decks' reason (`build_deck.py`).
"""
import html, json, os, re, sys, unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from so import key

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-16T00:00:00.000Z'
TYPE_ID = 'so-abc'
from build_deck import COLOR, ACCENT_ONLY   # one hue, one tone rule, for the whole collection

# (letter shown, sound, example word, its meaning)
LETTERS = [
    ('B b', 'b, as in English; between vowels it softens, the lips barely closing', 'buug', 'book'),
    ('T t', 't, said with the tongue against the teeth', 'toban', 'ten'),
    ('J j', 'the j of jam', 'jid', 'road'),
    ('X x', 'a breathy h squeezed from deep in the throat, the Arabic ḥ — never the x of box',
     'xun', 'bad'),
    ('Kh kh', 'the ch of Scottish loch, a rasp at the back of the mouth; one sound, written with '
     'two letters, found mostly in words from Arabic', 'khudaar', 'vegetables'),
    ('D d', 'd, said with the tongue against the teeth; between vowels it softens', 'dad', 'people'),
    ('R r', 'a rolled or tapped r, the tongue tip against the ridge behind the teeth, as in '
     'Spanish or Scottish speech', 'roob', 'rain'),
    ('S s', 's, as in English — never the z sound of rose', 'sac', 'cow'),
    ('Sh sh', 'the sh of shop; one sound, written with two letters', 'shan', 'five'),
    ('Dh dh', 'a d said with the tongue tip curled back against the roof of the mouth; between '
     'vowels it can sound close to an r', 'dhagax', 'stone'),
    ('C c', 'a voiced sound squeezed from deep in the throat, the Arabic ʿayn; never the c of '
     'cat or city', 'cag', 'foot'),
    ('G g', 'always the hard g of go — never the g of gem', 'gacan', 'hand'),
    ('F f', 'f, as in English', 'far', 'finger'),
    ('Q q', 'a k made at the very back of the mouth, the Arabic q; many speakers voice it, '
     'nearer a deep g', 'qalin', 'pen'),
    ('K k', 'k, as in English', 'kab', 'shoe'),
    ('L l', 'l, as in English', 'lug', 'leg'),
    ('M m', 'm, as in English', 'magac', 'name'),
    ('N n', 'n, as in English', 'nin', 'man'),
    ('W w', 'w, as in English', 'wiil', 'boy'),
    ('H h', 'h, as in English, and sounded at the end of a word too', 'hooyo', 'mother'),
    ('Y y', 'the y of yes', 'yar', 'small'),
    ("'", "the apostrophe is a letter: a GLOTTAL STOP, the catch in the middle of uh-oh; it is "
     "written inside or at the end of a word and left unwritten at the start of one", "lo'",
     'cattle'),
    ('A a', 'a short vowel near the u of cut or the a of cat', 'af', 'mouth'),
    ('E e', 'a short vowel like the e of bed', 'webi', 'river'),
    ('I i', 'a short vowel like the i of bit', 'il', 'eye'),
    ('O o', 'a short vowel like the o of British hot', 'qof', 'person'),
    ('U u', 'a short vowel like the u of put', 'cun', 'eat'),
    ('aa ee ii oo uu', 'a DOUBLED vowel is the same vowel held about twice as long; the length '
     'is part of the word', 'meel', 'place'),
    ('ay', 'a diphthong like the i of kite', 'dabayl', 'wind'),
    ('aw', 'a diphthong like the ow of cow', 'awoowe', 'grandfather'),
    ('ey', 'a diphthong like the ay of day', 'weyn', 'big'),
    ('ow', 'a diphthong like the o of go', 'qabow', 'cold'),
    ('oy', 'a diphthong like the oy of boy', 'qoys', 'family'),
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
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'somali-cache', 'lex.json')
    lex = json.load(open(cache, encoding='utf-8'))['lemmas'] if os.path.exists(cache) else {}
    if not lex:
        raise SystemExit('alphabet.py reads the example words\' accents from lex.json: '
                         'run `python3 .claude/somali/run.py` once first')
    a1 = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks',
                      'Somali-A1.folio-deck.json')
    taught = {c['fields']['Word'] for c in json.load(open(a1, encoding='utf-8'))['cards']}
    cards = []
    for i, (shown, sound, word, meaning) in enumerate(LETTERS, 1):
        assert word in taught, f'{word} is not a word of the A1 deck'
        L = lex.get(key(word)) or {}
        tone = next((e['tone'] for e in L.get('entries', []) if not e['hand'] and e['tone']), '')
        if tone and not ACCENT_ONLY.fullmatch(unicodedata.normalize('NFD', tone)):
            tone = ''
        cards.append({'sub': '', 'fields': {
            'Letter': E(shown),
            'Sound': E(sound),
            'Example': (f'<span class="uc-ex">{E(word)}</span>'
                        + (f'<span class="uc-exr">{E(tone)}</span>' if tone else '')
                        + f'<span class="uc-exe">{E(meaning)}</span>'),
            'Word': E(word),
        }, 'id': f'u_soabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two letters share a sound side: the reverse card is unanswerable'
    desc = (
        f"The Latin alphabet in which Somali has been written since 1972: {n} notes — the 21 "
        "consonants in the order Somali primers give them (b t j x kh d r s sh dh c g f q k l m n "
        "w h y), the glottal stop written with an apostrophe, the five vowels, the long vowels, "
        "and five diphthongs. The first deck of the Somali collection. Both directions: see a "
        "letter and recall its sound, or see a sound and recall the letter, each a card with its "
        "own schedule. Most of the letters sound as an English reader expects, and the cards say "
        "so in a line; the notes that matter are the ones English reads otherwise — X, a breathy "
        "h from deep in the throat, and C, the voiced throat sound of the Arabic ʿayn (neither is "
        "the English letter's sound); DH, a d with the tongue curled back; Q, a k at the very back "
        "of the mouth; KH, the ch of loch; the apostrophe, which is a consonant; and the doubled "
        "vowels, which are long. Each card gives one everyday word that shows the sound, from the "
        "Somali A1 deck, with, where English Wiktionary gives it, the same word with its accent "
        "(the high tone) marked — a mark ordinary writing leaves out. The sounds are "
        "approximations, as every learner's alphabet gives them, for Standard Somali. There is no "
        "read-aloud button: few devices carry a Somali voice, and one without it reads the letter "
        "in English. Sources: the standard description of Standard Somali; the example words' "
        "accents are English Wiktionary's, via the kaikki.org extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'soabc', 'title': 'Somali Alphabet',
        'subtitle': f'{n} letters and sounds · both directions, as two cards per letter',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['somali', 'alphabet'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Somali letter', 'speechLang': 'so-SO',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Somali-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
