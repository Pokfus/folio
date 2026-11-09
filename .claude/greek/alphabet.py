#!/usr/bin/env python3
"""Write the Greek alphabet deck: `decks/Greek-Alphabet.folio-deck.json`.

    python3 .claude/greek/alphabet.py

The first deck of the Greek collection, sorted before A1 by `levelRank`'s
"Alphabet" rule (Hindi's arrangement).  The level decks print a romanisation
under every word, so this deck is not a gate; it is where the letters are learnt.

ONE NOTE PER LETTER, IN ALPHABETICAL ORDER -- the 24 letters, capital and small
(σ with its final form ς); then the two-letter spellings every primer teaches
with the alphabet, because Greek spells several single sounds with two letters
(ου, αι, ει, οι, υι, αυ, ευ, μπ, ντ, γκ, γγ, τσ, τζ); then the two signs, the
accent (τόνος) and the diaeresis (διαλυτικά).

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's
alphabets give them, never IPA, with the romanisation the level decks use
(Wiktionary's: β v, η i, υ y, χ ch, ου ou -- and μπ b or mp, ντ nt, γκ gk, which
romanise the spelling rather than the sound, so the sound side says the sound).  Modern Greek writes the sound
"ee" six ways (η ι υ ει οι υι) and "o" and "e" two ways each, so each of those
notes says what the spelling is FOR -- an ending, a stem, a learned word -- and
every sound side stays unique (asserted), or the reverse card would have two
answers.  The examples' romanisations are English Wiktionary's (`lex.json`),
so the two decks agree; no corpus is read, so a re-run is byte-identical
whenever `lex.json` is.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gr import fold, translit

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'el-abc'
COLOR = '#6F69D2'

# (shown, its name -- what the speaker says, romanisation, sound, example word, its meaning)
LETTERS = [
    ('Α α', 'άλφα', 'a', 'a clear, short "a", between the a of cat and the a of father',
     'άνθρωπος', 'person, human being'),
    ('Β β', 'βήτα', 'v', '"v" as in van — never a b', 'βιβλίο', 'book'),
    ('Γ γ', 'γάμμα', 'g', 'before a, o, ou and a consonant, a soft g made far back in the throat, '
     'almost gargled; before an e or ee sound, a "y" as in yes', 'γάλα', 'milk'),
    ('Δ δ', 'δέλτα', 'd', '"th" as in this — never a d', 'δέκα', 'ten'),
    ('Ε ε', 'έψιλον', 'e', '"e" as in bed — epsilon, the commoner of the two ways to write it',
     'ελιά', 'olive'),
    ('Ζ ζ', 'ζήτα', 'z', '"z" as in zoo', 'ζωή', 'life'),
    ('Η η', 'ήτα', 'i', '"ee" as in see — eta, the "ee" of the feminine words and endings '
     '(η, της, -η)', 'ήλιος', 'sun'),
    ('Θ θ', 'θήτα', 'th', '"th" as in thin', 'θάλασσα', 'sea'),
    ('Ι ι', 'γιώτα', 'i', '"ee" as in see — iota, the plain letter for it; before another vowel '
     'often a quick "y" (παιδιά)', 'ιδέα', 'idea'),
    ('Κ κ', 'κάπα', 'k', '"k" as in skin, without a puff of breath; before an e or ee sound, nearer '
     'the k of keep', 'καφές', 'coffee'),
    ('Λ λ', 'λάμδα', 'l', '"l" as in lamp', 'λάδι', 'oil'),
    ('Μ μ', 'μι', 'm', '"m" as in man', 'μήλο', 'apple'),
    ('Ν ν', 'νι', 'n', '"n" as in net', 'νερό', 'water'),
    ('Ξ ξ', 'ξι', 'x', '"x" as in box — a k and an s together, also at the start of a word',
     'ξένος', 'foreign; a stranger'),
    ('Ο ο', 'όμικρον', 'o', '"o" as in pot, short and round — omicron, the commoner of the two '
     'ways to write it', 'όνομα', 'name'),
    ('Π π', 'πι', 'p', '"p" as in spin, without a puff of breath', 'πόρτα', 'door'),
    ('Ρ ρ', 'ρο', 'r', 'a tapped or lightly rolled "r", as in Spanish or Scottish English',
     'ρύζι', 'rice'),
    ('Σ σ ς', 'σίγμα', 's', '"s" as in sit; written ς at the end of a word, σ everywhere else',
     'σπίτι', 'house, home'),
    ('Τ τ', 'ταυ', 't', '"t" as in stop, without a puff of breath', 'τρένο', 'train'),
    ('Υ υ', 'ύψιλον', 'y', '"ee" as in see — upsilon, romanised y, the "ee" of many words from '
     'Ancient Greek', 'ύπνος', 'sleep'),
    ('Φ φ', 'φι', 'f', '"f" as in fun', 'φίλος', 'friend'),
    ('Χ χ', 'χι', 'ch', 'a breathy rasp like the ch of Scottish loch; before an e or ee sound, '
     'softer, like the h of huge', 'χέρι', 'hand, arm'),
    ('Ψ ψ', 'ψι', 'ps', '"ps" as in lapse — also at the start of a word', 'ψωμί', 'bread'),
    ('Ω ω', 'ωμέγα', 'o', '"o" as in pot, the same sound as ο — omega, the "o" of the verb ending '
     '-ω and of many endings and stems', 'ώρα', 'hour, time'),
    # two letters, one sound
    ('ου', 'ου', 'ou', '"oo" as in food — always these two letters, the only way Greek writes it',
     'ουρανός', 'sky'),
    ('αι', 'αι', 'ai', '"e" as in bed, the same sound as ε, written with two letters (romanised ai) '
     '— the -αι of verb endings', 'και', 'and'),
    ('ει', 'ει', 'ei', '"ee" as in see, written with two letters (romanised ei) — the -ει of verb '
     'endings', 'είμαι', 'I am'),
    ('οι', 'οι', 'oi', '"ee" as in see, written with two letters (romanised oi) — the plural '
     'ending -οι', 'οικογένεια', 'family'),
    ('υι', 'υι', 'yi', '"ee" as in see, written with two letters (romanised yi) — rare, in a few '
     'learned words', 'υιοθετώ', 'to adopt (a child)'),
    ('αυ', 'αυ', 'av · af', '"av" before a vowel or a voiced sound (αύριο), "af" before a voiceless '
     'one: θ κ ξ π σ τ φ χ ψ (αυτός)', 'αύριο', 'tomorrow'),
    ('ευ', 'ευ', 'ev · ef', '"ev" before a vowel or a voiced sound (Ευρώπη), "ef" before a '
     'voiceless one (ευχαριστώ)', 'ευχαριστώ', 'thank you'),
    ('μπ', 'μπ', 'b · mp', '"b" as in bed at the start of a word; "mb" or "b" inside one — the only '
     'way Greek writes a b', 'μπίρα', 'beer'),
    ('ντ', 'ντ', 'nt', '"d" as in dog at the start of a word; "nd" or "d" inside one — the only '
     'way Greek writes a d', 'ντομάτα', 'tomato'),
    ('γκ', 'γκ', 'gk', '"g" as in go at the start of a word; "ng" (as in finger) or "g" inside '
     'one', 'γκρίζος', 'grey'),
    ('γγ', 'γγ', 'ng', '"ng" as in finger — never two g sounds', 'άγγελος', 'angel'),
    ('τσ', 'τσ', 'ts', '"ts" as in cats', 'τσάι', 'tea'),
    ('τζ', 'τζ', 'tz', '"dz" as in adze, or nearly the j of jam', 'τζάμι', 'windowpane'),
    # the signs
    ('ά έ ή ί ό ύ ώ', 'τόνος', '´', 'the accent (τόνος): marks the stressed syllable of every word '
     'of two or more syllables — and changes the word (πότε "when?", ποτέ "never")',
     'ποτέ', 'never'),
    ('ϊ ϋ', 'διαλυτικά', '¨', 'the diaeresis (διαλυτικά): the vowel is said apart from the one '
     'before it, not as one sound with it (οϊ is "o-ee", where οι is "ee")', 'κοροϊδεύω',
     'to tease, to make fun of'),
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
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'greek-cache', 'lex.json')
    lex = json.load(open(cache, encoding='utf-8')) if os.path.exists(cache) else {}
    if not lex:
        raise SystemExit('alphabet.py reads the example words\' romanisation from lex.json: '
                         'run `python3 .claude/greek/run.py` once first')
    cards, missing = [], []
    for i, (shown, name, rom, sound, word, meaning) in enumerate(LETTERS, 1):
        L = lex.get(fold(word)) or {}
        if 'alt_of' in L:
            L = {}
        wr = next((e['roman'] for e in L.get('entries', []) if e.get('roman')), '')
        if not wr:
            missing.append(word)
            wr = translit(word)
        letter = i <= 24
        cards.append({'sub': '', 'fields': {
            'Letter': E(shown),
            'Name': E(name),
            'Called': (f'{E(name)}<span class="uc-exr">{E(translit(name))}</span>' if letter else ''),
            'Sound': (f'<span class="uc-rm">{E(rom)}</span> · ' if rom not in ('´', '¨') else '')
                     + E(sound),
            'Example': (f'<span class="uc-ex">{E(word)}</span>'
                        f'<span class="uc-exr">{E(wr)}</span>'
                        f'<span class="uc-exe">{E(meaning)}</span>'),
            'Word': E(word),
        }, 'id': f'u_elabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two letters share a sound side: the reverse card is unanswerable'
    if missing:
        print('  not a Wiktionary headword, romanised by gr.translit:', ' '.join(missing))
    desc = (
        f"The Greek alphabet as Modern Greek uses it: {n} notes — the twenty-four letters in "
        "order, capital and small, with each one's Greek name; then the thirteen two-letter "
        "spellings every primer teaches with the alphabet, because Greek writes several single "
        "sounds with two letters (ου is \"oo\", μπ is \"b\", ντ is \"d\"); then the two signs, the "
        "accent and the diaeresis. The first deck of the Greek collection. Both directions: see a "
        "letter and recall its sound, or see a sound and recall the letter, each a card with its "
        "own schedule. Every note gives the romanisation the level decks use, the sound described "
        "in English words, and one everyday word that shows it, with a speaker beside the letter "
        "and the word. Modern Greek writes the sound \"ee\" six ways (η, ι, υ, ει, οι, υι) and "
        "\"o\" and \"e\" two ways each, so each of those notes says where that spelling is used — "
        "an ending, a stem, a learned word — which is also what tells them apart on the reverse "
        "card. The sounds are approximations, as every learner's alphabet gives them; where English "
        "has no equivalent — the throaty γ and χ — the card says what to do instead. Sources: the "
        "standard description of Modern Greek; the example words' romanisations are English "
        "Wiktionary's, via the kaikki.org extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'elabc', 'title': 'Greek Alphabet',
        'subtitle': f'{n} letters, letter pairs and signs · both directions, as two cards each',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['greek', 'alphabet'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Greek letter', 'speechLang': 'el-GR',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Greek-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
