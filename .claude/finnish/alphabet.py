#!/usr/bin/env python3
"""Write the Finnish alphabet deck: `decks/Finnish-Alphabet.folio-deck.json`.

    python3 .claude/finnish/alphabet.py

The first deck of the Finnish collection, sorted before A1 by `levelRank`'s
"Alphabet" rule.  Finnish is written in the Latin alphabet, so this deck is not
a gate the way Greek's or Hindi's is; it is where the SOUNDS are learnt -- the
Hungarian deck's reasoning.  Finnish spelling is close to one letter, one sound,
and what a learner most needs is what English spelling does not do: `y` is a
vowel, `ä` is the a of cat, `j` is the y of yes, and a DOUBLED letter is a
LONGER sound that makes another word (`tuli` "fire", `tuuli` "wind"; `kuka`
"who", `kukka` "flower").

ONE NOTE PER LETTER OF THE FINNISH ALPHABET, IN ITS OWN ORDER -- the 29 letters,
a to z and then å, ä, ö, each with its Finnish name; then five notes on what no
single letter shows: ng, the stress, the long vowel, the long consonant and the
diphthong.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's alphabets
give them, never IPA.  b, c, f, q, w, x, z and å are in the alphabet but met in
loanwords and names, and their notes say so.  Every sound side is unique
(asserted), or the reverse card would have two answers.  The example words are
checked against English Wiktionary (`lex.json`): one that is not a headword stops
the build.  No corpus is read, so a re-run is byte-identical whenever this file is.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fi import fold

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-15T00:00:00.000Z'
TYPE_ID = 'fi-abc'
COLOR = '#907227'          # the shelf's measured hue (app.js, `lang-finnish`)

# (shown, its name -- what the speaker says, sound, example word, its meaning)
LETTERS = [
    ('A a', 'aa', '"a" as in father, but short — doubled (aa) it is the same sound held long',
     'talo', 'house'),
    ('B b', 'bee', '"b" as in bed — only in loanwords and names', 'bussi', 'bus'),
    ('C c', 'see', 'a "k" or an "s", as in the language the word came from — only in loanwords '
     'and names', 'celsius', 'Celsius (degrees)'),
    ('D d', 'dee', '"d" as in dog, but softer — the tongue only taps; met mostly where a t '
     'softens inside a word (katu, kadulla)', 'sade', 'rain'),
    ('E e', 'ee', '"e" as in bed — a pure vowel, never the "ee" of see', 'eilen', 'yesterday'),
    ('F f', 'äf', '"f" as in fun — only in loanwords', 'filmi', 'film'),
    ('G g', 'gee', '"g" as in go — only in loanwords; in Finnish words g is met only as part '
     'of ng', 'golf', 'golf'),
    ('H h', 'hoo', '"h" as in hat — and also said before a consonant, breathed out (lahti, '
     '"bay")', 'hei', 'hi'),
    ('I i', 'ii', '"ee" as in see, but short', 'isä', 'father'),
    ('J j', 'jii', '"y" as in yes — never the j of jam', 'joki', 'river'),
    ('K k', 'koo', '"k" as in skin, without a puff of breath', 'kala', 'fish'),
    ('L l', 'äl', '"l" as in leaf, always clear', 'lumi', 'snow'),
    ('M m', 'äm', '"m" as in man', 'maa', 'country; earth'),
    ('N n', 'än', '"n" as in net', 'nimi', 'name'),
    ('O o', 'oo', '"o" as in British sort, but short and with the lips rounded — a pure vowel, '
     'never the "ow" of English go', 'olla', 'to be'),
    ('P p', 'pee', '"p" as in spin, without a puff of breath', 'pöytä', 'table'),
    ('Q q', 'kuu', 'a "k" — only in foreign names and a few loanwords', 'squash', 'squash (the game)'),
    ('R r', 'är', 'a rolled or tapped "r", as in Spanish or Scottish English — always said, '
     'wherever it stands', 'ruoka', 'food'),
    ('S s', 'äs', '"s" as in see — never a z sound, even between vowels', 'sauna', 'sauna'),
    ('T t', 'tee', '"t" as in stop, without a puff of breath, the tongue against the teeth',
     'tee', 'tea'),
    ('U u', 'uu', '"oo" as in food, but short, the lips rounded', 'uusi', 'new'),
    ('V v', 'vee', '"v" as in van, softly', 'vesi', 'water'),
    ('W w', 'kaksois-vee', 'a "v" — in a few loanwords and old names', 'watti', 'watt'),
    ('X x', 'äks', '"ks" as in box — in loanwords', 'xerokopio', 'photocopy (also spelt kserokopio)'),
    ('Y y', 'yy', 'a VOWEL: the German ü or the French u — say "ee" with the lips rounded',
     'yksi', 'one'),
    ('Z z', 'tset', '"ts" as in cats — in loanwords', 'pizza', 'pizza'),
    ('Å å', 'ruotsalainen oo', 'an "o" — the Swedish letter, in Swedish names and a few words '
     'from Swedish', 'ångström', 'ångström'),
    ('Ä ä', 'ää', '"a" as in cat — a letter of its own, never a kind of a', 'äiti', 'mother'),
    ('Ö ö', 'öö', 'the German ö or the French eu: say "e" as in bed with the lips rounded',
     'yö', 'night'),
    # what no single letter shows
    ('ng nk', 'äng', 'ng is one sound, the "ng" of singer held long, never with a g after it '
     '(kengät, "shoes"); nk is that sound and a k, as in think', 'kenkä', 'shoe'),
    ('KA-la-kuk-ko', 'paino', 'the stress: every word is stressed on its FIRST syllable, whatever '
     'its length', 'kalakukko', 'a fish pie baked in a rye crust'),
    ('aa ee ii', 'pitkä vokaali', 'a doubled vowel is the same vowel held about twice as long, '
     'and it makes another word: tuli "fire", tuuli "wind"', 'tuuli', 'wind'),
    ('kk pp tt', 'pitkä konsonantti', 'a doubled consonant is held for longer, with a short '
     'stop before it, and it makes another word: kuka "who", kukka "flower"', 'kukka', 'flower'),
    ('ie uo yö', 'diftongi', 'two different vowels side by side glide into one another in one '
     'syllable, each sound kept: ie as in "ee-eh", uo as in "oo-oh"', 'tie', 'road'),
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
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'finnish-cache',
                         'lex.json')
    if not os.path.exists(cache):
        raise SystemExit('alphabet.py checks its example words against lex.json: '
                         'run `python3 .claude/finnish/run.py` once first')
    lex = json.load(open(cache, encoding='utf-8'))
    missing = [w for _, _, _, w, _ in LETTERS if fold(w) not in lex and w not in NOT_IN_WIKTIONARY]
    if missing:
        raise SystemExit('not a Wiktionary headword: ' + ' '.join(missing))
    cards = []
    for i, (shown, name, sound, word, meaning) in enumerate(LETTERS, 1):
        letter = i <= 29
        cards.append({'sub': '', 'fields': {
            'Letter': E(shown),
            'Name': E(name),
            'Called': E(name) if letter else '',
            'Sound': E(sound),
            'Example': (f'<span class="uc-ex">{E(word)}</span>'
                        f'<span class="uc-exe">{E(meaning)}</span>'),
            'Word': E(word),
        }, 'id': f'u_fiabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two letters share a sound side: the reverse card is unanswerable'
    desc = (
        f"The Finnish alphabet and its sounds: {n} notes — the twenty-nine letters in Finnish "
        "alphabetical order, capital and small, with each one's Finnish name; then five notes on "
        "what no single letter shows: ng, the stress, the long vowel, the long consonant and the "
        "diphthong. The first deck of the Finnish collection. Finnish uses the Latin alphabet and "
        "spells close to one letter, one sound, but its letters do not all say what they say in "
        "English — y is a vowel, the French u; ä is the a of cat; j is the y of yes — and a doubled "
        "letter is a longer sound that makes another word (tuli \"fire\", tuuli \"wind\"; kuka "
        "\"who\", kukka \"flower\"). Both directions: see a letter and recall its sound, or see a "
        "sound and recall the letter, each a card with its own schedule. Every note describes the "
        "sound in English words and gives one word that shows it, with a speaker beside the letter "
        "and the word. b, c, f, g (outside ng), q, w, x, z and å belong to the alphabet but are met "
        "in loanwords and names, and their notes say so. The sounds are approximations, as every "
        "learner's alphabet gives them; where English has no equivalent — y, ö — the card says what "
        "to do instead. Sources: the standard description of Finnish spelling and pronunciation; "
        "the example words are checked against English Wiktionary, via the kaikki.org extraction "
        "(CC BY-SA 4.0)."
    )
    meta = {
        'id': 'fiabc', 'title': 'Finnish Alphabet',
        'subtitle': f'The 29 letters and their sounds, then stress and long sounds ({n} notes) · '
                    'both directions, as two cards each',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['finnish', 'alphabet'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Finnish letter', 'speechLang': 'fi-FI',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Finnish-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
