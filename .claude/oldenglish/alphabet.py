#!/usr/bin/env python3
"""Write the Old English alphabet deck: `decks/Old-English-Alphabet.folio-deck.json`.

    python3 .claude/oldenglish/alphabet.py      (after run.py has written lex.json once)

The first deck of the Old English collection, sorted before Level 1 by
`levelRank`'s "Alphabet" rule.  It is how to READ the level decks: their
headwords carry an editor's macrons and dots (stān, iċ, ġēar) and a line of IPA,
and there is no speaker, so this deck is the only place the sounds are taught.

ONE NOTE PER LETTER OR SPELLING, in the order a primer teaches them: the
vowels short and long, the diphthongs, the consonants that differ from modern
English, the rules that apply to every word (every letter is said, a double
consonant is long, ġe- is unstressed), the consonants that do not differ, and
the three manuscript letters a reader of facsimiles meets (wynn, insular g, the
abbreviation for þæt).

WHAT THE SOUNDS ARE.  The standard reconstruction of late West Saxon, as the
grammars give it (Sweet's Anglo-Saxon Primer, "Sounds"; Wiktionary's
pronunciation section, which the level decks print), described in English
words with the IPA in brackets.  Every sound side is unique, asserted below, so
the reverse card has one answer.  The example words are level-deck words, and
their IPA is read from `lex.json` (English Wiktionary, via kaikki.org), so the
two decks agree; no corpus is read, and a re-run is byte-identical whenever
`lex.json` is.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'oe-abc'
COLOR = '#004E30'
FIELDS = ['Letter', 'Name', 'Sound', 'Example', 'Word']

# (letter(s) shown, its name or what it is, the sound, [example words])
LETTERS = [
    # ---- vowels: a macron marks a long vowel (an editor's mark: the manuscripts have none)
    ('a', 'short a', 'a short a, between the a of "cat" and the a of "father" [ɑ]', ['habban']),
    ('ā', 'long a', 'the a of "father", held long [ɑː]', ['stān']),
    ('æ', 'ash (æsc)', 'the a of "cat" [æ]', ['dæġ']),
    ('ǣ', 'long ash', 'the a of "cat", held long [æː]', ['sǣ']),
    ('e', 'short e', 'the e of "bet" [e]', ['etan']),
    ('ē', 'long e', 'a long, pure e, like German "See" — without the glide of English "day" [eː]',
     ['hē']),
    ('i', 'short i', 'the i of "sit" [i]', ['iċ']),
    ('ī', 'long i', 'the ee of "feet" [iː]', ['līf']),
    ('o', 'short o', 'a short o, as in British "hot" but with rounder lips [o]', ['god']),
    ('ō', 'long o', 'a long, pure o, like German "so" — without the glide of English "go" [oː]',
     ['bōc']),
    ('u', 'short u', 'the u of "put" [u]', ['sunu']),
    ('ū', 'long u', 'the oo of "moon" [uː]', ['hūs']),
    ('y', 'short y', 'the i of "sit" said with rounded lips, like German ü or French u [y]',
     ['yfel']),
    ('ȳ', 'long y', 'the ee of "feet" said with rounded lips and held, like German "kühn" [yː]',
     ['fȳr']),
    # ---- diphthongs: two vowels in ONE syllable
    ('ea', 'short diphthong', 'æ gliding into a, in one syllable [æ͜ɑ]', ['eald']),
    ('ēa', 'long diphthong', 'æ gliding into a, held long [æ͜ɑː]', ['ēage']),
    ('eo', 'short diphthong', 'e gliding into o, in one syllable [e͜o]', ['heorte']),
    ('ēo', 'long diphthong', 'e gliding into o, held long [e͜oː]', ['dēofol']),
    ('ie', 'short diphthong (early West Saxon)',
     'i gliding into y, in one syllable; later scribes write i or y for it [i͜y]', ['ġiefan']),
    ('īe', 'long diphthong (early West Saxon)',
     'i gliding into y, held long; later scribes write ī or ȳ for it [i͜yː]', ['hīeran']),
    # ---- consonants unlike modern English
    ('c', 'c without a dot', 'always k, as in "king" — never s [k]', ['cuman', 'cyning']),
    ('ċ', 'c with a dot', 'ch, as in "church" — the dot is an editor\'s, the manuscripts write c [t͡ʃ]',
     ['ċild', 'iċ']),
    ('g', 'g without a dot',
     'g as in "go"; between back vowels a softer, rubbed g, like Dutch g [ɡ], [ɣ]', ['gōd']),
    ('ġ', 'g with a dot', 'y, as in "yes" — the dot is an editor\'s, the manuscripts write g [j]',
     ['ġēar', 'dæġ']),
    ('ċġ', 'cg', 'dg, as in "edge", held long; the manuscripts write cg [dd͡ʒ]', ['seċġan']),
    ('sċ', 'sc', 'sh, as in "ship"; the manuscripts write sc [ʃ]', ['sċip', 'sċēap']),
    ('h', 'h', 'h as in "house" at the start of a word; after a vowel, the ch of Scottish "loch" '
     'or German "ich" [h], [x], [ç]', ['hund', 'niht']),
    ('hw, hl, hn, hr', 'h before a consonant',
     'a breathed, voiceless w, l, n or r: hw like the wh of Scottish "which", hl an l said '
     'with a puff of breath [ʍ], [l̥]',
     ['hwæt', 'hlāf']),
    ('f', 'f', 'f as in "fit"; between voiced sounds, v as in "over" [f], [v]',
     ['fæder', 'heofon']),
    ('s', 's', 's as in "sit"; between voiced sounds, z as in "rise" [s], [z]',
     ['sāwol', 'rīsan']),
    ('þ, ð', 'thorn and eth',
     'th as in "thin"; between voiced sounds, th as in "this". The two letters are ONE sound, and '
     'scribes use either [θ], [ð]', ['þing', 'ōþer']),
    ('r', 'r', 'a trilled or tapped r, always said, after a vowel too [r]', ['rīċe', 'heorte']),
    ('x', 'x', 'ks, as in "axe" [ks]', ['weaxan']),
    ('ng', 'n before g', 'ng with the g sounded, as in "finger", never as in "singer" [ŋɡ]',
     ['singan', 'cyning']),
    # ---- rules for every word
    ('cn, gn, wr, wl', 'two consonants at the start',
     'every letter is said — no silent letters: the k of cniht, the w of wrītan [kn], [wr]',
     ['cniht', 'āwrītan']),
    ('bb, dd, ll, nn, tt …', 'double consonants',
     'a double consonant is held long, as in Italian or in "bookcase": hab-ban, sit-tan [bː], [tː]',
     ['habban', 'sittan']),
    ('ġe-', 'an unstressed prefix',
     'said lightly, "yeh": a word is stressed on its first syllable, but never on ġe-, be- or for- '
     '[je]', ['ġesēon', 'forġiefan']),
    ('b, d, l, m, n, p, t, w', 'the rest',
     'as in modern English: b, d, l, m, n, p, t, w [b], [d], [l], [m], [n], [p], [t], [w]',
     ['mōdor', 'wīf']),
    # ---- the manuscript letters
    ('ƿ', 'wynn', 'the manuscripts\' letter for w, taken from a rune; editions print w', ['wīf']),
    ('ᵹ', 'insular g (yogh)',
     'the manuscripts\' shape of g, said g or y as above; editions print g', ['ġēar']),
    ('ꝥ', 'the abbreviation for þæt',
     'a crossed thorn: the scribes\' shorthand for þæt "that", as & is for "and"', ['þæt']),
]


# The example's meaning, where Wiktionary's first gloss is not the one the note wants
# (þæt's first is the pronoun's long note; heorte's is "heart (muscle)").
GLOSS_BY_HAND = {'þæt': 'that', 'heorte': 'heart', 'forġiefan': 'to forgive, to give',
                 'āwrītan': 'to write', 'ōþer': 'other', 'sunu': 'son', 'dēofol': 'devil'}
LETTER = '<div class="uc-letter">{{Letter}}</div><div class="uc-name">{{Name}}</div>'
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
.uc-name {
  font-size: 13px;
  letter-spacing: 0.04em;
  opacity: 0.6;
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
.uc-exw + .uc-exw {
  margin-top: 4px;
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
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'oldenglish-cache',
                         'lex.json')
    if not os.path.exists(cache):
        raise SystemExit('alphabet.py reads the example words from lex.json: '
                         'run `python3 .claude/oldenglish/run.py` once first')
    lex = json.load(open(cache, encoding='utf-8'))
    cards = []
    for i, (shown, name, sound, words) in enumerate(LETTERS, 1):
        ex = []
        for w in words:
            L = lex.get(w)
            if not L:
                raise SystemExit(f'example word {w} is not a Wiktionary headword')
            ipa = next((e['ipa'] for e in L['entries'] if e['ipa']), '')
            gloss = GLOSS_BY_HAND.get(w) or L['entries'][0]['glosses'][0]['g'].split(';')[0]
            ex.append(f'<div class="uc-exw"><span class="uc-ex">{E(w)}</span>'
                      + (f'<span class="uc-exr">{E(ipa)}</span>' if ipa else '')
                      + f'<span class="uc-exe">{E(gloss)}</span></div>')
        cards.append({'sub': '', 'fields': {
            'Letter': E(shown),
            'Name': E(name),
            'Sound': E(sound),
            'Example': ''.join(ex),
            'Word': E(shown),
        }, 'id': f'u_oeabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two letters share a sound side: the reverse card is unanswerable'
    fronts = [c['fields']['Letter'] for c in cards]
    assert len(set(fronts)) == n, 'two notes share a letter side'
    desc = (
        f"How to read Old English: {n} notes, the first deck of the Old English collection. "
        "Both directions: see a letter and recall its sound, or see a sound and recall the letter, "
        "each a card with its own schedule. The vowels short and long — a macron (ā, ē, ī) marks a "
        "long one, an editor's mark the manuscripts do not have — then the diphthongs (ea, eo, ie), "
        "the consonants that are not said as in modern English (c always k, ċ ch, ġ y, sċ sh, h like "
        "the ch of 'loch' after a vowel, f s and þ voiced between vowels), the rules that hold for "
        "every word (every letter is said, a double consonant is held long, the prefix ġe- is never "
        "stressed), the letters said as today, and three letters a reader of the manuscripts meets: "
        "wynn (ƿ), the insular g and the abbreviation ꝥ for þæt. Each note describes the sound in "
        "English words with the IPA in brackets — the same IPA the level decks print under every "
        "headword — and gives one or two words from those decks that show it. There is no speaker, "
        "because no voice reads Old English; the sounds are the standard scholarly reconstruction of "
        "late West Saxon, the literary language of about the year 1000. Sources: H. Sweet, An "
        "Anglo-Saxon Primer, 8th ed. (1905), 'Sounds' (public domain); the example words and their "
        "pronunciations are English Wiktionary's, via the kaikki.org extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'oeabc', 'title': 'Old English Alphabet and Pronunciation',
        'subtitle': f'{n} letters, sounds and spelling rules · both directions, as two cards per note',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['old english', 'anglo-saxon', 'alphabet', 'pronunciation'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Old English letter',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Old-English-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
