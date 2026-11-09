#!/usr/bin/env python3
"""Write the Bengali alphabet deck: `decks/Bengali-Alphabet.folio-deck.json`.

    python3 .claude/bengali/alphabet.py

The first deck of the Bengali collection, sorted before A1 by `levelRank`'s
"Alphabet" rule -- the Hindi collection's arrangement.  The level decks print
a romanisation under every word, so this deck is not a gate; it is where the
script itself is learnt.

ONE NOTE PER LETTER, IN THE TRADITIONAL ORDER (bôrnomala) -- the eleven
vowels, the five signs that sit on or beside them, the consonants by their
five rows (velar, palatal, retroflex, dental, labial) and then the semivowels,
sibilants and h; then the three dotted letters (ড় ঢ় য়); then the two
conjuncts every primer teaches with the alphabet (ক্ষ, জ্ঞ) and the three
"phola" signs (য-ফলা, র-ফলা, ব-ফলা) a reader meets on almost every page.
A vowel's note shows it standing alone AND as the sign (kar) it becomes after
a consonant, written on ক; a beginner meets the sign far more often.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's
alphabets give them, never IPA, with the romanisation the level decks use
(Wiktionary's: ô for the open o, ṭ ḍ for the retroflex row, ś for শ, ṛ for
the flap, ẏ for the glide).  Bengali spelling keeps distinctions its
pronunciation lost -- ই and ঈ are one sound, as are উ and ঊ, শ ষ and
(mostly) স, ন and ণ, জ and য -- and the card says so rather than invent a
difference.  Where English has no equivalent -- the breathy consonants, the
dental t and d against the curled-back row -- the card says what to do with
the tongue or the breath instead.  The examples' romanisations are English
Wiktionary's (`lex.json`), so the two decks agree; the descriptions are the
standard ones of Standard Colloquial Bengali.  No corpus is read for the
content, so a re-run is byte-identical whenever `lex.json` is.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bn import fold

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'bn-abc'
COLOR = '#574518'

# (letter shown, what the speaker says, romanisation, sound, example word, its meaning)
LETTERS = [
    # the vowels: alone, and as the sign on ক
    ('অ', 'অ', 'ô', 'an open "o", like the o of British hot; every consonant carries it unless '
     'a sign says otherwise, so it has no sign of its own — and at the end of most words it is '
     'not said at all (নাম is nam)', 'অনেক', 'many'),
    ('আ · কা', 'আ', 'a', '"a" as in father, but short — Bengali has no long vowels', 'আম', 'mango'),
    ('ই · কি', 'ই', 'i', '"i", between the i of bit and the ee of see; its sign is written '
     'BEFORE the consonant it follows in speech', 'ইচ্ছা', 'wish, desire'),
    ('ঈ · কী', 'ঈ', 'i', 'said exactly like ই — the "long i" survives only in spelling, mostly in '
     'words from Sanskrit', 'ঈশ্বর', 'God'),
    ('উ · কু', 'উ', 'u', '"u", between the u of put and the oo of food', 'উত্তর', 'answer; north'),
    ('ঊ · কূ', 'ঊ', 'u', 'said exactly like উ — the "long u" survives only in spelling', 'ঊরু',
     'thigh'),
    ('ঋ · কৃ', 'ঋ', 'ri', 'said "ri" as in rip; found in words from Sanskrit', 'ঋতু', 'season'),
    ('এ · কে', 'এ', 'e', 'like the a of cake, without the glide into "ee" — or, in many words, '
     'like the a of cat (এক is said æk)', 'এক', 'one'),
    ('ঐ · কৈ', 'ঐ', 'ōi', '"oi" as in boy', 'ঐতিহাসিক', 'historic'),
    ('ও · কো', 'ও', 'ō', 'like the o of go, but one pure vowel, without the glide into "oo"',
     'ওষুধ', 'medicine'),
    ('ঔ · কৌ', 'ঔ', 'ōu', '"o" gliding into "u", like the ow of low said slowly', 'ঔষধ',
     'medicine (formal)'),
    # the signs
    ('কং', 'অনুস্বার', 'ṅ', 'anusvar, the small circle after the letter: "ng" as in sing',
     'বাংলা', 'Bengali, Bangla'),
    ('কঃ', 'বিসর্গ', 'ḥ', 'bisorgo, the two dots: inside a word it doubles the consonant after '
     'it (দুঃখ is said dukkho); rare', 'দুঃখ', 'sorrow'),
    ('কঁ', 'চন্দ্রবিন্দু', '̃', 'chondrobindu, the moon and dot above: the vowel is said through '
     'the nose, as in French bon', 'চাঁদ', 'moon'),
    ('ক্', 'হসন্ত', '—', 'hoshonto, the stroke below: the consonant has NO vowel after it; '
     'usually two such consonants are joined into one shape instead (ক্ + ত = ক্ত)', 'রক্ত',
     'blood'),
    ('ৎ', 'খণ্ড ত', 't', 'khondo to, "half t": a t with no vowel after it, closing a syllable',
     'হঠাৎ', 'suddenly'),
    # the velar row: the back of the tongue against the soft palate
    ('ক', 'ক', 'kô', '"k" as in skin — no puff of breath after it', 'কলম', 'pen'),
    ('খ', 'খ', 'khô', '"k" with a strong puff of breath, as in kit said firmly', 'খাবার', 'food'),
    ('গ', 'গ', 'gô', '"g" as in go', 'গাড়ি', 'car'),
    ('ঘ', 'ঘ', 'ghô', '"g" followed by a breathy h, as in the middle of doghouse', 'ঘর',
     'room, house'),
    ('ঙ', 'ঙ', 'ṅô', '"ng" as in sing; never starts a word', 'ব্যাঙ', 'frog'),
    # the palatal row
    ('চ', 'চ', 'cô', '"ch" as in church, but with no puff of breath after it', 'চা', 'tea'),
    ('ছ', 'ছ', 'chô', '"ch" with a strong puff of breath, as in the middle of church-hill',
     'ছেলে', 'boy'),
    ('জ', 'জ', 'jô', '"j" as in jam', 'জল', 'water'),
    ('ঝ', 'ঝ', 'jhô', '"j" followed by a breathy h, as in the middle of hedgehog', 'ঝড়', 'storm'),
    ('ঞ', 'ঞ', 'ñô', 'said as a plain "n", and found almost only joined to চ or জ (ঞ্চ, ঞ্জ)',
     'অঞ্চল', 'region'),
    # the retroflex row: the tongue tip turned up and back
    ('ট', 'ট', 'ṭô', 'a "t" made with the tip of the tongue turned up behind the gum ridge '
     '(retroflex); the nearest English sound is the t of top', 'টাকা', 'taka, money'),
    ('ঠ', 'ঠ', 'ṭhô', 'the turned-back (retroflex) t, with a strong puff of breath', 'ঠান্ডা',
     'cold'),
    ('ড', 'ড', 'ḍô', 'a "d" made with the tongue tip turned up behind the gum ridge (retroflex); '
     'the nearest English sound is the d of dog', 'ডান', 'right (side)'),
    ('ঢ', 'ঢ', 'ḍhô', 'the turned-back (retroflex) d, followed by a breathy h', 'ঢোল', 'drum'),
    ('ণ', 'ণ', 'ṇô', 'written in words from Sanskrit, but said exactly like ন, a plain "n"',
     'কারণ', 'reason, because'),
    # the dental row: the tongue against the back of the upper teeth
    ('ত', 'ত', 'tô', 'a soft "t" with the tongue against the back of the upper teeth (dental), '
     'as in French or Spanish; no puff of breath', 'তিন', 'three'),
    ('থ', 'থ', 'thô', 'the dental t with a strong puff of breath — not the "th" of thin', 'থাকা',
     'to stay'),
    ('দ', 'দ', 'dô', 'a soft "d" with the tongue against the back of the upper teeth (dental) — '
     'not the "th" of this', 'দশ', 'ten'),
    ('ধ', 'ধ', 'dhô', 'the dental d followed by a breathy h', 'ধন্যবাদ', 'thank you'),
    ('ন', 'ন', 'nô', '"n" as in no', 'নাম', 'name'),
    # the labial row
    ('প', 'প', 'pô', '"p" as in spin — no puff of breath after it', 'পানি', 'water'),
    ('ফ', 'ফ', 'phô', '"p" with a strong puff of breath; many speakers say it as "f"', 'ফল',
     'fruit'),
    ('ব', 'ব', 'bô', '"b" as in bat', 'বই', 'book'),
    ('ভ', 'ভ', 'bhô', '"b" followed by a breathy h, as in the middle of clubhouse; some '
     'speakers say it nearly as "v"', 'ভাত', 'cooked rice'),
    ('ম', 'ম', 'mô', '"m" as in man', 'মা', 'mother'),
    # the semivowels, the sibilants and h
    ('য', 'য', 'jô', 'said like জ, a "j" as in jam, at the start of a word; joined after a '
     'consonant it is the য-ফলা below', 'যদি', 'if'),
    ('র', 'র', 'rô', 'a tapped "r", one flick of the tongue, as in Spanish pero', 'রাত', 'night'),
    ('ল', 'ল', 'lô', '"l" as in leaf, said with the tongue forward', 'লাল', 'red'),
    ('শ', 'শ', 'śô', '"sh" as in ship', 'শহর', 'city'),
    ('ষ', 'ষ', 'ṣô', 'a second "sh", written in words from Sanskrit; said just like শ', 'ভাষা',
     'language'),
    ('স', 'স', 'śô', 'usually a third "sh", like শ — but a true "s" as in sun before ত, থ, ন, র, '
     'ল and in English words (স্কুল, school)', 'সাত', 'seven'),
    ('হ', 'হ', 'hô', '"h" as in hand', 'হাত', 'hand'),
    # the dotted letters
    ('ড়', 'ড়', 'ṛô', 'a flap: the tongue tip turns back and flicks forward against the roof of '
     'the mouth, a sound between d and r; never starts a word', 'বড়', 'big'),
    ('ঢ়', 'ঢ়', 'ṛhô', 'the same flap with a breath of h after it, in a few words from Sanskrit; '
     'most speakers say it just like ড়', 'গাঢ়', 'thick, condensed'),
    ('য়', 'য়', 'ẏô', 'a glide between vowels, "y" as in yes or "w" as in we, by the vowels '
     'around it (খাওয়া is said khawa)', 'ভয়', 'fear'),
    # the conjuncts taught with the alphabet
    ('ক্ষ', 'ক্ষ', 'kkhô', 'a joined letter, ক্ + ষ: said "kh" at the start of a word and "kkh" '
     'inside one (পরীক্ষা, porikkha)', 'ক্ষমা', 'forgiveness'),
    ('জ্ঞ', 'জ্ঞ', 'ggô', 'a joined letter, জ্ + ঞ: said "g" at the start of a word, the vowel after '
     'it turned to æ and nasal (জ্ঞান is said gæn), and "gg" inside one', 'জ্ঞান', 'knowledge'),
    # the phola signs
    ('ক্য', 'য-ফলা', '—', 'jo-phola, the hook after a consonant: inside a word it doubles the '
     'consonant; at the start it turns a following a into æ (ব্যথা is said bætha)', 'ব্যথা',
     'pain'),
    ('ক্র', 'র-ফলা', '—', 'ro-phola, the stroke below: an "r" straight after the consonant, as in '
     'pr, tr, kr', 'প্রথম', 'first'),
    ('ক্ব', 'ব-ফলা', '—', 'bo-phola, the small ব below: inside a word it doubles the consonant '
     '(বিশ্বাস is said bishshash); at the start it is silent', 'বিশ্বাস', 'trust, belief'),
]

FIELDS = ['Letter', 'Name', 'Sound', 'Example', 'Word']

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
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'bengali-cache', 'lex.json')
    lex = json.load(open(cache, encoding='utf-8')) if os.path.exists(cache) else {}
    if not lex:
        raise SystemExit('alphabet.py reads the example words\' romanisation from lex.json: '
                         'run `python3 .claude/bengali/run.py` once first')
    cards, missing = [], []
    for i, (shown, name, rom, sound, word, meaning) in enumerate(LETTERS, 1):
        L = lex.get(fold(word)) or {}
        wr = next((e['roman'] for e in L.get('entries', []) if e.get('roman')), '') or L.get('roman', '')
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
        }, 'id': f'u_bnabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two letters share a sound side: the reverse card is unanswerable'
    if missing:
        raise SystemExit('no Wiktionary romanisation for: ' + ' '.join(missing))
    desc = (
        f"The Bengali script (Bangla lipi) in which Bengali is written: {n} notes, in the "
        "traditional order — the eleven vowels, the five signs that sit on or beside them, the "
        "consonants row by row, the three dotted letters (ড়, ঢ়, য়), the two joined letters every "
        "primer teaches with the alphabet (ক্ষ, জ্ঞ) and the three phola signs (য-ফলা, র-ফলা, "
        "ব-ফলা) met on almost every page. The first deck of the Bengali collection. Both "
        "directions: see a letter and recall its sound, or see a sound and recall the letter, "
        "each a card with its own schedule. Each vowel is shown alone and as the sign it becomes "
        "after a consonant, written on ক (আ · কা), since the sign is what a reader meets most. "
        "Every note gives the romanisation the level decks use, the sound described in English "
        "words, and one everyday word that shows it, with a speaker beside the letter and the "
        "word. The sounds are approximations, as every learner's alphabet gives them. Bengali "
        "spelling keeps distinctions its speech has lost — ই and ঈ are one sound, as are উ and "
        "ঊ, শ and ষ, ন and ণ — and the cards say so; where English has no equivalent — the "
        "breathy consonants (kh, gh, bh …), the turned-back retroflex row (ṭ, ḍ) against the soft "
        "dental t and d — the card says what to do with the tongue or the breath instead. "
        "Sources: the standard description of Standard Colloquial Bengali; the example words' "
        "romanisations are English Wiktionary's, via the kaikki.org extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'bnabc', 'title': 'Bengali Alphabet (Bangla script)',
        'subtitle': f'{n} letters and signs · both directions, as two cards per letter',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['bengali', 'bangla', 'alphabet', 'script'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Bengali letter', 'speechLang': 'bn-IN',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Bengali-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
