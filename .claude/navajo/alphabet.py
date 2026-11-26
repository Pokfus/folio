#!/usr/bin/env python3
"""Write the Navajo alphabet deck: `decks/Navajo-Alphabet.folio-deck.json`.

    python3 .claude/navajo/alphabet.py

Asked for by the owner on 2026-11-16 ("Alphabet & sounds deck"): the first deck
of the Navajo collection, sorted before A1 by `levelRank`'s "Alphabet" rule.
Navajo has been written in the Latin alphabet since Young and Morgan's practical
orthography (1937-1940), and that is the spelling every level deck uses.  Many
letters are NOT said as an English reader expects -- b, d, g are unaspirated p,
t, k; t and k carry a strong rasping puff -- and Navajo has sounds English has no
letter for: the ejectives (tʼ kʼ chʼ tsʼ tłʼ), the voiceless ł, the glottal stop,
and four vowel features writing marks: length (aa), high tone (á), nasality (ą)
and the falling and rising tones of a long vowel (áa, aá).

ONE NOTE PER LETTER OR DIGRAPH, in the order of the orthography table of
Wikipedia's "Navajo language" (ʼ a b ch chʼ d dl dz e g gh h hw i j k kʼ kw l ł m
n o s sh t tʼ tł tłʼ ts tsʼ w x y z zh), then the vowel features and the
syllabic n.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's alphabets
give them; where English has no equivalent -- the ejectives, ł, gh -- the card
says what the mouth does instead of pretending.  The descriptions follow
Wikipedia's "Navajo phonology" (CC BY-SA 4.0; read 2026-11-16), which cites
McDonough (2003), McDonough and Ladefoged (1993) and Young and Morgan (1987).
Each example word is a word of the A1 lexicon, shown with Wiktionary's IPA
(`lex.json`), so the two decks agree; a re-run is byte-identical whenever
`lex.json` is.

NO SPEAKER BUTTON, for the level decks' reason (`build_deck.py`).
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nv import norm

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-16T00:00:00.000Z'
TYPE_ID = 'nv-abc'
from build_deck import COLOR   # one hue for the whole collection

# (letter shown, sound, example word, its meaning)
LETTERS = [
    ('ʼ', "the GLOTTAL STOP, the catch in the middle of uh-oh — a letter of its own, written "
     "inside a word or at its end; a word that seems to begin with a vowel starts with one, "
     "unwritten", 'ahéheeʼ', 'thank you'),
    ('A a', 'the a of father', 'amá', 'mother'),
    ('B b', 'a p without the puff of air English puts after it — to an English ear between b '
     'and p, never a buzzing b', 'bááh', 'bread'),
    ('Ch ch', 'the ch of church, with a strong puff of air', 'chidí', 'car'),
    ('Chʼ chʼ', 'an EJECTIVE ch: the throat is shut and a burst of air is pushed out with the ch, '
     'giving a sharp popping sound — a different letter from ch', 'chʼil', 'plant'),
    ('D d', 'a t without the puff of air — to an English ear between d and t', 'dibé', 'sheep'),
    ('Dl dl', 'a t without the puff, released at once through the sides of the tongue into a short '
     'l — one sound, not d followed by l', 'dlǫ́ǫ́ʼ', 'prairie dog'),
    ('Dz dz', 'a ts without the puff of air — to an English ear close to the ds of beds', 'dził',
     'mountain'),
    ('E e', 'short, the e of bet; doubled (ee), longer and closer to the e of café', 'dibé', 'sheep'),
    ('G g', 'a k without the puff of air — to an English ear between g and k', 'gah', 'rabbit'),
    ('Gh gh', 'a soft sound made at the back of the mouth, between a gargled g and a w — '
     'before o it is nearly a w', 'hooghan', 'home, hogan'),
    ('H h', 'the h of hat; at the end of a syllable it is rougher, like the ch of Scottish loch',
     'hai', 'winter'),
    ('Hw hw', 'h said with rounded lips, like a breathy wh', 'hwiih', 'satisfaction'),
    ('I i', 'short, the i of bit; doubled (ii), longer and higher — never the i of kite', 'chidí',
     'car'),
    ('J j', 'a ch without the puff of air — to an English ear close to the j of jam', 'jį́', 'day'),
    ('K k', 'a k with a strong puff of air, often a rasp like k followed by the ch of loch',
     'kin', 'house, store'),
    ('Kʼ kʼ', 'an EJECTIVE k: the throat is shut and a burst of air is pushed out, a sharp popping '
     'k — a different letter from k', 'kʼad', 'now'),
    ('Kw kw', 'the rasping k with rounded lips, as in the qu of queen', 'kwii', 'here'),
    ('L l', 'the l of let', 'lá', 'oh! (on realising something)'),
    ('Ł ł', 'a VOICELESS l: breath hissed past the sides of the tongue with no voice, like the '
     'Welsh ll of Llanelli', 'łééchąąʼí', 'dog'),
    ('M m', 'the m of man; found in only a few Navajo words', 'mósí', 'cat'),
    ('N n', 'the n of no; it can also stand as a syllable of its own and carry a tone (ń, below)',
     'naaki', 'two'),
    ('O o', 'the o of so, said pure; Navajo has no u, and o never drifts to one', 'tó', 'water'),
    ('S s', 'the s of sun', 'sǫʼ', 'star'),
    ('Sh sh', 'the sh of shop, with the lips not rounded', 'shash', 'bear'),
    ('T t', 'a t with a strong puff of air, often a rasp like t followed by the ch of loch',
     'hastiin', 'man'),
    ('Tʼ tʼ', 'an EJECTIVE t: the throat is shut and a burst of air is pushed out, a sharp popping '
     't — a different letter from t', 'tʼáá', 'just, only'),
    ('Tł tł', 'a t released at once into the voiceless ł, with a puff of air — one sound', 'tłah',
     'ointment'),
    ('Tłʼ tłʼ', 'an EJECTIVE tł: the throat shut, the t released into ł with a pop', 'tłʼiish',
     'snake'),
    ('Ts ts', 'the ts of cats, with a puff of air — one sound', 'tsin', 'tree, wood'),
    ('Tsʼ tsʼ', 'an EJECTIVE ts: the throat shut, a sharp popping ts — a different letter from ts',
     'tsʼídá', 'really'),
    ('W w', 'the w of we', 'awééʼ', 'baby'),
    ('X x', 'the ch of Scottish loch, a rasp at the back of the mouth; written x in a few words, '
     'mostly after s', 'łitsxo', 'it is orange'),
    ('Y y', 'the y of yes', 'yas', 'snow'),
    ('Z z', 'the z of zoo, often with little voice', 'azis', 'bag'),
    ('Zh zh', 'the s of measure', 'azhéʼé', 'father'),
    ('aa · ee · ii · oo', 'a LONG vowel, written doubled and held about twice as long; length '
     'alone can tell two words apart', 'naaki', 'two'),
    ('á · é · í · ó', 'a HIGH TONE, marked with an acute accent and said on a higher pitch; a vowel '
     'with no mark has a low tone', 'tó', 'water'),
    ('áa · aá', 'a FALLING tone (áa) or a RISING tone (aá) across a long vowel — found mostly in '
     'contractions and in loanwords', 'béeso', 'money (from Spanish peso)'),
    ('ą · ę · į · ǫ', 'a NASAL vowel, marked with a hook beneath it and said partly through the '
     'nose, as in French; it can also carry a high tone (ą́)', 'naadą́ą́ʼ', 'corn'),
    ('ń', 'n standing as a syllable of its own, here with a high tone', 'ńléí', 'that one over there'),
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
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'navajo-cache', 'lex.json')
    if not os.path.exists(cache):
        raise SystemExit('alphabet.py reads the example words from lex.json: '
                         'run `python3 .claude/navajo/run.py` once first')
    D = json.load(open(cache, encoding='utf-8'))
    lex, ptr = D['lemmas'], D['pointers']
    cards, missing = [], []
    for i, (shown, sound, word, meaning) in enumerate(LETTERS, 1):
        k = norm(word)
        if k not in lex and k in ptr:
            k = ptr[k][0]['to']
        L = lex.get(k)
        if not L:
            missing.append(word)
            continue
        ipa = next((e['ipa'] for e in L['entries'] if e['ipa']), '')
        cards.append({'sub': '', 'fields': {
            'Letter': E(shown),
            'Sound': E(sound),
            'Example': (f'<span class="uc-ex">{E(word)}</span>'
                        + (f'<span class="uc-exr">{E(ipa)}</span>' if ipa else '')
                        + f'<span class="uc-exe">{E(meaning)}</span>'),
            'Word': E(word),
        }, 'id': f'u_nvabc_{len(cards) + 1}', 'type': TYPE_ID})
    if missing:
        raise SystemExit('not in the Wiktionary extract: ' + ' '.join(missing))
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two letters share a sound side: the reverse card is unanswerable'
    desc = (
        f"The Latin alphabet in which Navajo (Diné bizaad) is written: {n} notes, one per letter or "
        "digraph in the order of the standard orthography (Young and Morgan's, of 1937–1940), then "
        "the four things it marks on a vowel and the n that stands as a syllable. The first deck of "
        "the Navajo collection. Both directions: see a letter and recall its sound, or see a sound "
        "and recall the letter, each a card with its own schedule. The letters that matter are the "
        "ones an English reader would misread: b, d, g, j and dz are said WITHOUT the puff of air "
        "English gives p, t, k, ch and ts, while t, k, ch and ts have a strong one, t and k often a "
        "rasp; the EJECTIVES tʼ, kʼ, chʼ, tsʼ and tłʼ are said with the throat shut and a burst of "
        "air pushed out; ł is a voiceless l, like the Welsh ll; gh is a soft sound at the back of "
        "the mouth; and the apostrophe ʼ is a consonant, the glottal stop. On the vowels, ordinary "
        "Navajo writing marks a LONG vowel by doubling it (aa), a HIGH TONE with an acute accent "
        "(á; a low tone is unmarked), a NASAL vowel with a hook beneath it (ą), and the falling and "
        "rising tones of a long vowel (áa, aá). Each card gives one everyday word that shows the "
        "sound, from the Navajo A1 lexicon, with its pronunciation in the International Phonetic "
        "Alphabet as English Wiktionary gives it. The sounds are approximations, as every learner's "
        "alphabet gives them. There is no read-aloud button: no device carries a Navajo voice, and "
        "one without it reads the letter in English. Sources: Wikipedia, 'Navajo phonology' and "
        "'Navajo language' (orthography), read 2026-11-16, which follow McDonough (2003) and Young "
        "and Morgan (1987); the example words and their IPA are English Wiktionary's, via the "
        "kaikki.org extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'nvabc', 'title': 'Navajo Alphabet and Sounds',
        'subtitle': f'{n} letters and sounds · both directions, as two cards per letter',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['navajo', 'alphabet', 'pronunciation'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Navajo letter', 'speechLang': 'nv',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Navajo-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
