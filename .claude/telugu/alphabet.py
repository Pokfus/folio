#!/usr/bin/env python3
"""Write the Telugu alphabet deck: `decks/Telugu-Alphabet.folio-deck.json`.

    python3 .claude/telugu/alphabet.py

The first deck of the Telugu collection, sorted before A1 by `levelRank`'s
"Alphabet" rule -- the Hindi collection's arrangement (2026-11-09), carried
over.  The level decks print a romanisation under every word, so this deck is
not a gate; it is where the script itself is learnt.

ONE NOTE PER LETTER, IN THE TRADITIONAL ORDER (varṇamāla) -- the thirteen
vowels (Telugu tells a short e and o from a long ē and ō, as Hindi does not),
the three signs that sit on them, the consonants by their five rows (velar,
palatal, retroflex, dental, labial) and then the semivowels, sibilants and h;
then ళ (ḷa), the conjunct క్ష that primers teach with the alphabet, and ఱ, the
old r that Wiktionary still writes in some headwords.  A vowel's note shows it
standing alone AND as the sign (gunintam) it becomes after a consonant,
written on క; a reader meets the sign far more often.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's
alphabets give them, never IPA, with the romanisation the level decks use
(Wiktionary's, ISO 15919: ā ē ō, ṭ ḍ ṇ ḷ for the retroflex letters, ś ṣ, ṁ for
the sunna).  Where English has no equivalent -- the retroflex row, the
breathy (aspirated) consonants, the dental t and d -- the card says what to do
with the tongue or the breath instead of pretending.  The example words'
romanisations are English Wiktionary's (`lex.json`), so the two decks agree;
one by hand (`ROMAN_BY_HAND`).  No corpus is read for the content, so a
re-run is byte-identical whenever `lex.json` is.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from te import fold

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'te-abc'
COLOR = '#228122'

# (letter shown, what the speaker says, romanisation, sound, example word, its meaning)
LETTERS = [
    # the vowels: alone, and as the sign on క
    ('అ', 'అ', 'a', 'a short "a", like the u of cup; every consonant carries it unless a sign '
     'says otherwise, so it has no sign of its own', 'అమ్మ', 'mother'),
    ('ఆ · కా', 'ఆ', 'ā', '"a" as in father, long', 'ఆట', 'game, play'),
    ('ఇ · కి', 'ఇ', 'i', '"i" as in bit, short', 'ఇల్లు', 'house'),
    ('ఈ · కీ', 'ఈ', 'ī', '"ee" as in see, long', 'ఈగ', 'fly'),
    ('ఉ · కు', 'ఉ', 'u', '"u" as in put, short', 'ఉప్పు', 'salt'),
    ('ఊ · కూ', 'ఊ', 'ū', '"oo" as in food, long', 'ఊరు', 'village, town'),
    ('ఋ · కృ', 'ఋ', 'r̥', 'said "ru" in Telugu; found in words from Sanskrit', 'ఋషి', 'sage, seer'),
    ('ఎ · కె', 'ఎ', 'e', '"e" as in bed, short', 'ఎలుక', 'rat'),
    ('ఏ · కే', 'ఏ', 'ē', 'like the a of cake, long, but one pure vowel without the glide into "ee"',
     'ఏనుగు', 'elephant'),
    ('ఐ · కై', 'ఐ', 'ai', '"ai" as in aisle', 'ఐదు', 'five'),
    ('ఒ · కొ', 'ఒ', 'o', 'a short "o", as in the first sound of obey', 'ఒకటి', 'one'),
    ('ఓ · కో', 'ఓ', 'ō', 'like the o of go, long, but one pure vowel without the glide into "oo"',
     'ఓడ', 'ship, boat'),
    ('ఔ · కౌ', 'ఔ', 'au', '"ow" as in cow', 'ఔషధం', 'medicine'),
    # the signs
    ('అం · కం', 'సున్న', 'ṁ', 'sunna (anusvāra), the small circle: a nasal said as the n or m that '
     'suits the next consonant (n before d, m before b), and "m" at the end of a word, as in '
     'పుస్తకం pustakam "book"', 'అంగడి', 'shop'),
    ('అః', 'విసర్గ', 'ḥ', 'visarga, the two small circles: a breath of "h" after the vowel, in a '
     'few words from Sanskrit', 'దుఃఖం', 'sorrow'),
    ('క్', 'పొల్లు', '—', 'pollu (virāma), the tick above: the consonant has NO vowel after it. '
     'Inside a word the second consonant is usually written small beneath the first instead '
     '(an "ottu"), as the double k of అక్క', 'అక్క', 'elder sister'),
    # the velar row
    ('క', 'క', 'ka', '"k" as in skin — no puff of breath after it', 'కన్ను', 'eye'),
    ('ఖ', 'ఖ', 'kha', '"k" with a strong puff of breath, as in kit said firmly; found mostly in '
     'words from Sanskrit, Persian and Hindi', 'ఖరీదు', 'price'),
    ('గ', 'గ', 'ga', '"g" as in go', 'గది', 'room'),
    ('ఘ', 'ఘ', 'gha', '"g" followed by a breathy h, as in the middle of doghouse', 'ఘంట', 'a bell'),
    ('ఙ', 'ఙ', 'ṅa', '"ng" as in sing; rare, and usually written as the sunna instead', 'వాఙ్మయం',
     'literature'),
    # the palatal row
    ('చ', 'చ', 'ca', '"ch" as in church, with no puff of breath; in many native words before '
     'a, o or u it is said "ts", as in cats', 'చేప', 'fish'),
    ('ఛ', 'ఛ', 'cha', '"ch" with a strong puff of breath, as in the middle of church-hill',
     'ఛాతీ', 'chest'),
    ('జ', 'జ', 'ja', '"j" as in jam; in many native words before a, o or u it is said "dz", '
     'as in adze', 'జబ్బు', 'illness'),
    ('ఝ', 'ఝ', 'jha', '"j" followed by a breathy h, as in the middle of hedgehog; rare',
     'ఝిల్లి', 'cricket (the insect)'),
    ('ఞ', 'ఞ', 'ña', '"ny" as in canyon; met almost only in the joined letter జ్ఞ, said "gny"',
     'జ్ఞానం', 'knowledge'),
    # the retroflex row
    ('ట', 'ట', 'ṭa', 'a "t" made with the tip of the tongue curled back to the roof of the mouth '
     '(retroflex); the nearest English sound is the t of top', 'టోపీ', 'cap, hat'),
    ('ఠ', 'ఠ', 'ṭha', 'the curled-back (retroflex) t, with a strong puff of breath', 'ఠాణా',
     'police station'),
    ('డ', 'డ', 'ḍa', 'a "d" made with the tongue tip curled back (retroflex); the nearest '
     'English sound is the d of dog', 'డబ్బు', 'money'),
    ('ఢ', 'ఢ', 'ḍha', 'the curled-back (retroflex) d, followed by a breathy h', 'ఢంకా',
     'kettledrum'),
    ('ణ', 'ణ', 'ṇa', 'an "n" made with the tongue tip curled back (retroflex); never starts a '
     'word', 'వీణ', 'veena (a stringed instrument)'),
    # the dental row
    ('త', 'త', 'ta', 'a soft "t" with the tongue against the back of the upper teeth (dental), '
     'as in French or Spanish; no puff of breath', 'తల', 'head'),
    ('థ', 'థ', 'tha', 'the dental t with a strong puff of breath — not the "th" of thin',
     'కథ', 'story'),
    ('ద', 'ద', 'da', 'a soft "d" with the tongue against the back of the upper teeth (dental) — '
     'not the "th" of this', 'దారి', 'way, road'),
    ('ధ', 'ధ', 'dha', 'the dental d followed by a breathy h', 'ధర', 'price'),
    ('న', 'న', 'na', '"n" as in no', 'నీరు', 'water'),
    # the labial row
    ('ప', 'ప', 'pa', '"p" as in spin — no puff of breath after it', 'పని', 'work'),
    ('ఫ', 'ఫ', 'pha', '"p" with a strong puff of breath; many speakers say it as "f"', 'ఫలం',
     'fruit'),
    ('బ', 'బ', 'ba', '"b" as in bat', 'బడి', 'school'),
    ('భ', 'భ', 'bha', '"b" followed by a breathy h, as in the middle of clubhouse', 'భాష',
     'language'),
    ('మ', 'మ', 'ma', '"m" as in man', 'మనిషి', 'person'),
    # the semivowels, the sibilants and h
    ('య', 'య', 'ya', '"y" as in yes', 'యుద్ధం', 'war'),
    ('ర', 'ర', 'ra', 'a tapped "r", one flick of the tongue, as in Spanish pero', 'రోజు', 'day'),
    ('ల', 'ల', 'la', '"l" as in leaf, said with the tongue forward', 'లావు', 'fat, stout'),
    ('వ', 'వ', 'va', 'between "v" and "w": the lower lip only lightly touches the teeth',
     'వాన', 'rain'),
    ('శ', 'శ', 'śa', '"sh" as in ship', 'శరీరం', 'body'),
    ('ష', 'ష', 'ṣa', 'a second "sh", written in words from Sanskrit and made with the tongue '
     'curled back; most speakers say it just like శ', 'భాష', 'language'),
    ('స', 'స', 'sa', '"s" as in sun', 'సమయం', 'time'),
    ('హ', 'హ', 'ha', '"h" as in hand', 'హక్కు', 'right, claim'),
    # the letters after h
    ('ళ', 'ళ', 'ḷa', 'an "l" made with the tongue tip curled back to the roof of the mouth '
     '(retroflex); never starts a word', 'తాళం', 'a lock'),
    ('క్ష', 'క్ష', 'kṣa', 'a joined letter, క్ + ష, said "ksh"', 'క్షణం', 'moment'),
    ('ఱ', 'ఱ', 'ṟa', 'the old letter for a second r, in older spellings only; it is said, and '
     'now written, as ర (నోఱు is నోరు, "mouth")', 'నోఱు', 'mouth (old spelling)'),
]

FIELDS = ['Letter', 'Name', 'Sound', 'Example', 'Word']

# ఙ alone appears only in Sanskrit spellings that Wiktionary does not list as a Telugu
# headword; its example's romanisation is written here, in the same system.
ROMAN_BY_HAND = {'వాఙ్మయం': 'vāṅmayaṁ'}

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
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'telugu-cache', 'lex.json')
    lex = json.load(open(cache, encoding='utf-8')) if os.path.exists(cache) else {}
    if not lex:
        raise SystemExit('alphabet.py reads the example words\' romanisation from lex.json: '
                         'run `python3 .claude/telugu/run.py` once first')
    cards, missing = [], []
    for i, (shown, name, rom, sound, word, meaning) in enumerate(LETTERS, 1):
        L = lex.get(fold(word)) or {}
        wr = (L.get('spellings') or {}).get(word, '')
        if not wr and L.get('word') == word:
            wr = next((e['roman'] for e in L.get('entries', []) if e.get('roman')), '')
        if not wr and word.endswith('ం') and L.get('word') == word[:-1] + 'ము':
            # the -ం spelling of a word Wiktionary has only under -ము: its rule, applied
            r = next((e['roman'] for e in L.get('entries', []) if e.get('roman')), '')
            wr = r[:-2] + 'ṁ' if r.endswith('mu') else ''
        wr = wr or ROMAN_BY_HAND.get(word, '')
        if not wr:
            missing.append(word)
        cards.append({'sub': '', 'fields': {
            'Letter': E(shown),
            'Name': E(name),
            'Sound': (f'<span class="uc-rm">{E(rom)}</span> · ' if rom != '—' else '') + E(sound),
            'Example': (f'<span class="uc-ex">{E(word)}</span>'
                        + (f'<span class="uc-exr">{E(wr)}</span>' if wr else '')
                        + f'<span class="uc-exe">{E(meaning)}</span>'),
            'Word': E(word),
        }, 'id': f'u_teabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two letters share a sound side: the reverse card is unanswerable'
    if missing:
        raise SystemExit('no romanisation for: ' + ' '.join(missing))
    desc = (
        f"The Telugu script: {n} notes, in the traditional order — the thirteen vowels (Telugu "
        "tells a short e and o from a long ē and ō), the three signs that sit on them (the sunna, "
        "the visarga and the pollu), the thirty-three consonants row by row, then ళ, the joined "
        "letter క్ష that every primer teaches with the alphabet, and ఱ, an old letter for r still "
        "met in older spellings. The first deck of the Telugu collection. Both directions: see a "
        "letter and recall its sound, or see a sound and recall the letter, each a card with its "
        "own schedule. Each vowel is shown alone and as the sign it becomes after a consonant, "
        "written on క (ఆ · కా), since the sign is what a reader meets most. Every note gives the "
        "romanisation the level decks use, the sound described in English words, and one word "
        "that shows it, with a speaker beside the letter and the word. The sounds are "
        "approximations, as every learner's alphabet gives them; where English has no equivalent "
        "— the breathy consonants (kh, gh, bh …), the curled-back retroflex letters (ṭ, ḍ, ṇ, ḷ) "
        "against the soft dental t and d — the card says what to do with the tongue or the breath "
        "instead. Sources: the standard description of modern standard Telugu; the example words' "
        "romanisations are English Wiktionary's, via the kaikki.org extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'teabc', 'title': 'Telugu Alphabet',
        'subtitle': f'{n} letters and signs · both directions, as two cards per letter',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['telugu', 'alphabet', 'script'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Telugu letter', 'speechLang': 'te-IN',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Telugu-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
