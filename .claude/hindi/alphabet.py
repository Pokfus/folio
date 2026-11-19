#!/usr/bin/env python3
"""Write the Hindi alphabet deck: `decks/Hindi-Alphabet.folio-deck.json`.

    python3 .claude/hindi/alphabet.py

Asked for by the owner on 2026-11-09 ("a Devanagari deck, yes"): the first
deck of the Hindi collection, sorted before A1 by `levelRank`'s "Alphabet"
rule.  The level decks print a romanisation under every word, so this deck is
not a gate as Russian's is; it is where the script itself is learnt.

SINCE NOV 2026 (the Hindi beginner pass, docs/lang-decks.md) the deck also holds ऑ and eleven
READING RULES, one card each, of card type `hi-read` (`RULES` below has what they are and where
every word of them comes from), and its notes are numbered by `hindi-fix.js` from the pin
`hindi-ids.json`: run that after this script.

ONE NOTE PER LETTER, IN THE TRADITIONAL ORDER (varṇamālā) -- the vowels, the
signs that sit on them, the consonants by their five rows (velar, palatal,
retroflex, dental, labial) and then the semivowels, sibilants and h; then the
two flapped letters Hindi added, the four conjuncts every primer teaches with
the alphabet, and the five nukta letters of Persian, Arabic and English words.
A vowel's note shows it standing alone AND as the sign (mātrā) it becomes
after a consonant, written on क; a beginner meets the sign far more often.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's
alphabets give them, never IPA, with the romanisation the level decks use
(Wiktionary's: ā ī ū, ṭ ḍ ṇ for the retroflex row, ś ṣ, x ġ q z f for the
nukta letters).  Where English has no equivalent -- the retroflex row, the
breathy (aspirated) consonants, the dental t and d -- the card says what to do
with the tongue or the breath instead of pretending.  The examples are the
romanisations of English Wiktionary (`lex.json`) where the word is there, so
the two decks agree; the descriptions are the standard ones of modern
standard Hindi.  No corpus is read for the content, so a re-run is
byte-identical whenever `lex.json` is.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hi import fold

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'hi-abc'
COLOR = '#9F51B4'

# (letter shown, what the speaker says, romanisation, sound, example word, its meaning)
V = 'vowel'
LETTERS = [
    # the vowels: alone, and as the sign on क
    ('अ', 'अ', 'a', 'a short, neutral "a", like the a of about; every consonant carries it '
     'unless a sign says otherwise, so it has no sign of its own — but at the end of a word it '
     'is not said (अब is ab), which the reading rules in this deck take up', 'अब', 'now'),
    ('आ · का', 'आ', 'ā', '"a" as in father, long', 'आम', 'mango'),
    ('इ · कि', 'इ', 'i', '"i" as in bit, short; its sign is written BEFORE the consonant '
     'it follows in speech', 'इधर', 'here, this way'),
    ('ई · की', 'ई', 'ī', '"ee" as in see, long', 'ईश्वर', 'God'),
    ('उ · कु', 'उ', 'u', '"u" as in put, short', 'उम्र', 'age'),
    ('ऊ · कू', 'ऊ', 'ū', '"oo" as in food, long', 'ऊपर', 'up, above'),
    ('ऋ · कृ', 'ऋ', 'ŕ', 'said "ri" as in rip; found in words from Sanskrit', 'ऋषि', 'sage, seer'),
    ('ए · के', 'ए', 'e', 'like the a of cake, but one pure vowel, without the glide into "ee"',
     'एक', 'one'),
    ('ऐ · कै', 'ऐ', 'ai', 'in standard Hindi like the a of bat held long, between the e of bed '
     'and the a of bad — not the "ai" of aisle', 'ऐनक', 'spectacles'),
    ('ओ · को', 'ओ', 'o', 'like the o of go, but one pure vowel, without the glide into "oo"',
     'ओर', 'side, direction'),
    ('औ · कौ', 'औ', 'au', 'like the aw of law — not the "ow" of cow', 'औरत', 'woman'),
    # ऑ (Nov 2026, the beginner pass): डॉक्टर and कॉफ़ी are A1 words and no note showed the sign.
    # Wikipedia, "Devanagari", revision 1385113141: ऑ represents "[ɒ], similar to the RP
    # pronunciation of <o> in cot. These vowels are sometimes used in Hindi too, as in डॉलर".
    ('ऑ · कॉ', 'ऑ', 'ŏ', 'the "o" of British English cot; written only in words taken from '
     'English', 'डॉक्टर', 'doctor'),
    # the signs
    ('अं · कं', 'अनुस्वार', 'ṃ', 'anusvāra, the dot above: a nasal before the next consonant, '
     'said as the n or m that suits it (n before d, m before b)', 'अंदर', 'inside'),
    ('अँ · काँ', 'चंद्रबिंदु', '̃', 'chandrabindu, the moon and dot: the vowel is said through the '
     'nose, as in French bon; often written as a plain dot instead', 'माँ', 'mother'),
    ('अः', 'विसर्ग', 'ḥ', 'visarga, the two dots: a breath of "h" after the vowel, in a few words '
     'from Sanskrit', 'दुःख', 'sorrow'),
    ('क्', 'हलंत', '—', 'halant (virāma), the stroke below: the consonant has NO vowel after it; '
     'usually two such consonants are joined into one shape instead (क् + य = क्य)', 'क्या',
     'what?'),
    # the velar row: the back of the tongue against the soft palate
    ('क', 'क', 'ka', '"k" as in skin — no puff of breath after it', 'कमरा', 'room'),
    ('ख', 'ख', 'kha', '"k" with a strong puff of breath, as in kit said firmly', 'खाना', 'food'),
    ('ग', 'ग', 'ga', '"g" as in go', 'गाँव', 'village'),
    ('घ', 'घ', 'gha', '"g" followed by a breathy h, as in the middle of doghouse', 'घर', 'house, home'),
    ('ङ', 'ङ', 'ṅa', '"ng" as in sing; never starts a word, and is usually written as the dot '
     'above (anusvāra) instead', 'गङ्गा', 'the Ganges'),
    # the palatal row
    ('च', 'च', 'ca', '"ch" as in church, but with no puff of breath after it', 'चाय', 'tea'),
    ('छ', 'छ', 'cha', '"ch" with a strong puff of breath, as in the middle of church-hill',
     'छोटा', 'small'),
    ('ज', 'ज', 'ja', '"j" as in jam', 'जल्दी', 'quickly'),
    ('झ', 'झ', 'jha', '"j" followed by a breathy h, as in the middle of hedgehog', 'झूठ', 'a lie'),
    ('ञ', 'ञ', 'ña', '"ny" as in canyon; rare, and usually written as the dot above instead',
     'व्यञ्जन', 'consonant'),
    # the retroflex row: the tongue tip curled back to the roof of the mouth
    ('ट', 'ट', 'ṭa', 'a "t" made with the tip of the tongue curled back to the roof of the mouth '
     '(retroflex); the nearest English sound is the t of top', 'टमाटर', 'tomato'),
    ('ठ', 'ठ', 'ṭha', 'the curled-back (retroflex) t, with a strong puff of breath', 'ठंडा', 'cold'),
    ('ड', 'ड', 'ḍa', 'a "d" made with the tongue tip curled back (retroflex); the nearest '
     'English sound is the d of dog', 'डर', 'fear'),
    ('ढ', 'ढ', 'ḍha', 'the curled-back (retroflex) d, followed by a breathy h', 'ढोल', 'drum'),
    ('ण', 'ण', 'ṇa', 'an "n" made with the tongue tip curled back (retroflex); rarely starts '
     'a word', 'कारण', 'reason, cause'),
    # the dental row: the tongue against the back of the upper teeth
    ('त', 'त', 'ta', 'a soft "t" with the tongue against the back of the upper teeth (dental), '
     'as in French or Spanish; no puff of breath', 'तीन', 'three'),
    ('थ', 'थ', 'tha', 'the dental t with a strong puff of breath — not the "th" of thin',
     'थोड़ा', 'a little'),
    ('द', 'द', 'da', 'a soft "d" with the tongue against the back of the upper teeth (dental) — '
     'not the "th" of this', 'दो', 'two'),
    ('ध', 'ध', 'dha', 'the dental d followed by a breathy h', 'धन्यवाद', 'thank you'),
    ('न', 'न', 'na', '"n" as in no', 'नाम', 'name'),
    # the labial row
    ('प', 'प', 'pa', '"p" as in spin — no puff of breath after it', 'पानी', 'water'),
    ('फ', 'फ', 'pha', '"p" with a strong puff of breath; many speakers say it as "f"', 'फल',
     'fruit'),
    ('ब', 'ब', 'ba', '"b" as in bat', 'बात', 'talk, matter'),
    ('भ', 'भ', 'bha', '"b" followed by a breathy h, as in the middle of clubhouse', 'भाई',
     'brother'),
    ('म', 'म', 'ma', '"m" as in man', 'मछली', 'fish'),
    # the semivowels, the sibilants and h
    ('य', 'य', 'ya', '"y" as in yes', 'यह', 'this'),
    ('र', 'र', 'ra', 'a tapped "r", one flick of the tongue, as in Spanish pero', 'रात', 'night'),
    ('ल', 'ल', 'la', '"l" as in leaf, said with the tongue forward', 'लाल', 'red'),
    ('व', 'व', 'va', 'between "v" and "w": the lower lip only lightly touches the teeth',
     'वक़्त', 'time'),
    ('श', 'श', 'śa', '"sh" as in ship', 'शहर', 'city'),
    ('ष', 'ष', 'ṣa', 'a second "sh", written in words from Sanskrit; in Hindi said just like श',
     'भाषा', 'language'),
    ('स', 'स', 'sa', '"s" as in sun', 'साल', 'year'),
    ('ह', 'ह', 'ha', '"h" as in hand, often voiced and breathy', 'हाथ', 'hand'),
    # the two flaps
    ('ड़', 'ड़', 'ṛa', 'a flap: the tongue tip curls back and flicks forward against the roof '
     'of the mouth, a sound between d and r; never starts a word', 'लड़का', 'boy'),
    ('ढ़', 'ढ़', 'ṛha', 'the same flap followed by a breathy h; never starts a word', 'पढ़ना',
     'to read, to study'),
    # the conjuncts taught with the alphabet
    ('क्ष', 'क्ष', 'kṣa', 'a joined letter, क् + ष, said "ksh"', 'कक्षा', 'class, classroom'),
    ('त्र', 'त्र', 'tra', 'a joined letter, त् + र, said "tr" with the soft dental t', 'मित्र',
     'friend'),
    ('ज्ञ', 'ज्ञ', 'jña', 'a joined letter, ज् + ञ, said "gy" in Hindi', 'ज्ञान', 'knowledge'),
    ('श्र', 'श्र', 'śra', 'a joined letter, श् + र, said "shr"', 'श्री', 'Mr, Shri'),
    # the nukta letters
    ('ज़', 'ज़', 'za', '"z" as in zoo — ज with a dot (nukta) below; many speakers say it as ज',
     'ज़रूर', 'certainly'),
    ('फ़', 'फ़', 'fa', '"f" as in fan — फ with a dot (nukta) below', 'फ़ैसला', 'decision'),
    ('क़', 'क़', 'qa', 'a "k" made further back, in the throat (from Arabic); many speakers say '
     'it as क', 'क़लम', 'pen'),
    ('ख़', 'ख़', 'xa', 'like the ch of Scottish loch — ख with a dot (nukta) below', 'ख़ुश',
     'happy'),
    ('ग़', 'ग़', 'ġa', 'a gargled "g", like the French r — ग with a dot (nukta) below',
     'ग़लत', 'wrong'),
]

FIELDS = ['Letter', 'Name', 'Sound', 'Example', 'Word']

# ---- THE READING RULES (Nov 2026, the Hindi beginner pass) ------------------------------------
# The letters alone do not get a reader to A1's first words: 218 of A1's 491 one-word headwords
# end in a consonant whose a is silent, 105 drop one inside the word, 68 hold a joined consonant
# (50 different ones, of which the deck taught four), and nothing said so.  One note per rule,
# ONE CARD each (a rule has no "sound → letter" side), card type `hi-read`.
#
# NOTHING HERE IS WRITTEN FROM MEMORY.  `quote` is copied from the English Wikipedia article
# named, at the revision named (read 2026-11-19, wiki markup removed, nothing else changed);
# `say` is that quote in a beginner's words and claims nothing the quote does not.  The example
# is an A1 card, its romanisation the generator's (lex.json), so the rule is seen on a word the
# reader is about to learn.
W_SCHWA = 'Wikipedia, "Schwa deletion in Indo-Aryan languages", revision 1381118256'
W_DEVA = 'Wikipedia, "Devanagari", revision 1385113141'
W_PHON = 'Wikipedia, "Hindustani phonology", revision 1386279681'
# (key, after which block, the question, what is shown, the answer in plain words, the quote,
#  its source, the example word, its meaning)
RULES = [
    ('rule: final a', 'consonants', 'The last letter has no vowel sign. Is its a said?', 'नाम',
     'No: nām, not nāma. The a that every consonant carries is dropped at the end of a word.',
     'the schwa (/ə/) implicit in each consonant of the script is "obligatorily deleted" at the '
     'end of words and in certain other contexts, unlike in Sanskrit.', W_SCHWA, 'नाम', 'name'),
    ('rule: medial a', 'consonants', 'Three letters: ka, ra, nā. How is the word said?', 'करना',
     'karnā: the a of the middle letter is dropped too. The script does not show where; the '
     'romanisation under every word of the level decks does.',
     'when a schwa-succeeded consonant (itself preceded by another vowel) is followed by a '
     'vowel-succeeded consonant, the schwa inherent in the first consonant is deleted.',
     W_SCHWA, 'करना', 'to do'),
    ('rule: vowel length', 'consonants', 'One sign apart. Are these the same word?', 'कम · काम',
     'No: kam is "less", kām is "work". a, i and u are short; every other vowel is long.',
     'The vowels /ə ɪ ʊ/ are always short in length, while all others are usually considered '
     'long', W_PHON, 'काम', 'work'),
    ('rule: half letter', 'nukta', 'Two letters are joined here. Which, and what is missing?', 'स्त',
     'स and त with no vowel between them: st. The first letter has lost its upright stroke; the '
     'second is whole.',
     '24 out of the 36 consonants contain a vertical right stroke (य ya, न na, ग ga etc.). As '
     'first or middle fragments/members of a cluster (when letters are to be written as '
     'half-pronounced), they lose that stroke.', W_DEVA, 'दोस्त', 'friend'),
    ('rule: joined to क', 'nukta', 'क has no upright stroke to lose. How does it join?', 'क्य',
     'Its hook is cut short and the next letter is fastened to it: kya.',
     'क ka, छ cha, and फ pha shorten their right hooks and join them directly to the following '
     'member.', W_DEVA, 'क्या', 'what?'),
    ('rule: doubled letter', 'nukta', 'The same letter twice, joined. How is it said?', 'च्च',
     'As one sound held longer: baccā, not bacā.',
     'Most native consonants may occur geminate (doubled in length; exceptions are /ɽ, ɽʱ, ɦ/). '
     'Geminate consonants are always medial and preceded by one of the short vowels (that is, '
     '/ə/, /ɪ/ or /ʊ/).', W_PHON, 'बच्चा', 'child'),
    ('rule: r before', 'nukta', 'What is the hook above the letter?', 'र्द',
     'An r, said BEFORE the letter it sits on: rd.',
     'र ra as a first member takes the form of a curved upward dash above the final character '
     'or its ā- diacritic.', W_DEVA, 'दर्द', 'pain'),
    ('rule: r after', 'nukta', 'What is the stroke under each letter?', 'प्र · ट्र',
     'An r, said AFTER the letter: pra, ṭra. Under ट, ठ, ड and ढ it is a small pointed mark; '
     'under the other letters a slanting stroke.',
     'As a final member with ट ṭa, ठ ṭha, ड ḍa, ढ ḍha, ड़ ṛa, छ cha, it is two lines together '
     'below the character pointed downwards. […] Elsewhere, as a final member, it is a diagonal '
     'stroke extending leftwards and down.', W_DEVA, 'प्रिय', 'dear'),
    ('rule: ru', 'conjuncts', 'Where have the signs of u and ū gone?', 'रु · रू',
     'On र they are written at its side, not below: ru, rū.',
     'There are non-regular formations of रु ru, रू rū, and हृ hṛ.', W_DEVA, 'रुकना', 'to stop'),
    ('rule: nasal dot', 'conjuncts', 'A plain dot above, and no consonant after it. How is it read?',
     'में',
     'As a vowel said through the nose: mẽ. Where a vowel sign already stands above the line, the '
     'moon of the moon-and-dot is left out and only the dot is written.',
     'When an akṣara has a vowel diacritic above the top line, that leaves no room for the candra '
     '("moon") stroke candrabindu, which is dispensed with in favour of the lone dot: हूँ [ɦũ] '
     '"am", but हैं [ɦɛ̃] "are".', W_DEVA, 'में', 'in'),
    ('rule: stress', 'conjuncts', 'Which syllable of a Hindi word is stressed?', 'किताब',
     'The heaviest one, here tāb; but stress counts for much less than in English.',
     'Hindustani has a stress accent, but it is not as important as in English. […] Stress is on '
     'the heaviest syllable of the word, and in the event of a tie, on the last such syllable.',
     W_PHON, 'किताब', 'book'),
]
RULE_TYPE = 'hi-read'
RULE_FIELDS = ['Key', 'Ask', 'Show', 'Rule', 'Quote', 'Source', 'Example', 'Word']
# where each block of LETTERS ends: the rules are dealt after the block they need
BLOCKS = [('vowels', 'अः'), ('halant', 'क्'), ('consonants', 'ह'), ('flaps', 'ढ़'), ('conjuncts', 'श्र'),
          ('nukta', 'ग़')]

# ङ and ञ appear alone only in spellings that modern Hindi usually writes with the dot
# (गंगा, व्यंजन), so the conjunct spellings are not Wiktionary headwords; their
# romanisations are written here, in the same system.
ROMAN_BY_HAND = {'गङ्गा': 'gaṅgā', 'व्यञ्जन': 'vyañjan'}

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
FRONT_R = '<div class="uc-ask">{{Ask}}</div><div class="uc-letter uc-show">{{Show}}</div>'
BACK_R = ('{{FrontSide}}<hr><div class="uc-field"><div class="uc-pos">how it is read</div>'
          '<div class="uc-gl">{{Rule}}</div><div class="uc-pos uc-gap">as in</div>'
          '<div class="uc-gl">{{Example}}' + SAY_WORD + '</div>'
          '<div class="uc-pos uc-gap">the source says</div>'
          '<div class="uc-gl uc-quote">“{{Quote}}”</div><div class="uc-src">{{Source}}</div></div>')
CSS_R = """.uc-show {
  font-size: 46px;
}
.uc-quote {
  font-size: 13.5px;
  opacity: 0.8;
}
.uc-src {
  margin-top: 4px;
  font-size: 11px;
  opacity: 0.6;
}
"""

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
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hindi-cache', 'lex.json')
    lex = json.load(open(cache, encoding='utf-8')) if os.path.exists(cache) else {}
    if not lex:
        raise SystemExit('alphabet.py reads the example words\' romanisation from lex.json: '
                         'run `python3 .claude/hindi/run.py` once first')
    cards, missing = [], []
    for i, (shown, name, rom, sound, word, meaning) in enumerate(LETTERS, 1):
        L = lex.get(fold(word)) or {}
        wr = next((e['roman'] for e in L.get('entries', []) if e.get('roman')), '') \
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
        }, 'id': f'u_hiabc_{i}', 'type': TYPE_ID})
    letters = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == letters, 'two letters share a sound side: the reverse card is unanswerable'

    def roman(word):
        L = lex.get(fold(word)) or {}
        return next((e['roman'] for e in L.get('entries', []) if e.get('roman')), '')

    # THE ORDER: the letters in the traditional order, the conjunct letters after the dotted ones
    # (they are read by the rules that now stand before them), each rule after the block it needs.
    shown_at = {html.unescape(c['fields']['Letter']): i for i, c in enumerate(cards)}
    cut, start = {}, 0
    for name, last in BLOCKS:
        cut[name] = cards[start:shown_at[last] + 1]
        start = shown_at[last] + 1
    assert start == letters, 'BLOCKS does not cover LETTERS'
    rules = {}
    for key, after, ask, show, say, quote, src, word, meaning in RULES:
        wr = roman(word)
        assert wr, f'{word} has no romanisation in lex.json'
        rules.setdefault(after, []).append({'sub': '', 'fields': {
            'Key': E(key), 'Ask': E(ask), 'Show': E(show), 'Rule': E(say), 'Quote': E(quote),
            'Source': E(src),
            'Example': (f'<span class="uc-ex">{E(word)}</span><span class="uc-exr">{E(wr)}</span>'
                        f'<span class="uc-exe">{E(meaning)}</span>'),
            'Word': E(word),
        }, 'type': RULE_TYPE})
    cards = (cut['vowels'] + cut['halant'] + cut['consonants'] + rules['consonants'] + cut['flaps']
             + cut['nukta'] + rules['nukta'] + cut['conjuncts'] + rules['conjuncts'])
    # numbered by position here; hindi-fix.js gives every note back its pinned number
    for i, c in enumerate(cards, 1):
        c['id'] = f'u_hiabc_{i}'
    n = len(cards)
    nrules = n - letters
    ncards = letters * 2 + nrules
    days = -(-ncards // 10)
    if missing:
        print('  no Wiktionary romanisation for:', ' '.join(missing))
    desc = (
        f"The Devanagari script in which Hindi is written: {n} notes — {letters} letters and signs "
        f"and {nrules} reading rules. The first deck of the Hindi collection, and the one to finish "
        "before Hindi A1. THE LETTERS come in the traditional order: the twelve vowels, the four "
        "signs that sit on them, the thirty-three consonants row by row, the two flapped letters "
        "Hindi added (ड़, ढ़), the five dotted (nukta) letters of words from Persian, Arabic and "
        "English, and the four joined letters every primer teaches with the alphabet (क्ष, त्र, ज्ञ, "
        "श्र). Each is two cards with their own schedules: see a letter and recall its sound, or "
        "see a sound and recall the letter. Each vowel is shown alone and as the sign it becomes "
        "after a consonant, written on क (आ · का), since the sign is what a reader meets most. "
        "THE READING RULES are what the letters alone do not tell you, and each is one card: that "
        "the a every consonant carries is silent at the end of a word (नाम is nām) and often "
        "inside it (करना is karnā), that a short vowel and a long one are different sounds, how "
        "two consonants are joined into one shape and how a doubled one is said, the three shapes "
        "of र beside another letter, the plain dot that makes a vowel nasal, and where the stress "
        "falls. Each rule is shown on a word of Hindi A1 and quotes its source. "
        "Every note gives the romanisation the level decks use, the sound described in English "
        "words, and one everyday word that shows it, with a speaker beside the letter and the "
        "word. The sounds are approximations, as every learner's alphabet gives them; where "
        "English has no equivalent — the breathy consonants (kh, gh, bh …), the curled-back "
        "retroflex row (ṭ, ḍ, ṇ) against the soft dental t and d — the card says what to do with "
        "the tongue or the breath instead. "
        f"AT TEN NEW CARDS A DAY, the default for a language deck, the {ncards} cards take "
        f"{days} days. "
        "Sources: the letters, the standard description of modern standard Hindi; the reading "
        "rules and ऑ, the English Wikipedia articles each card names, quoted at the revision it "
        "names (CC BY-SA 4.0); the example words' romanisations are English Wiktionary's, via the "
        "kaikki.org extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'hiabc', 'title': 'Hindi Alphabet (Devanagari)',
        'subtitle': f'{letters} letters and signs, two cards each · {nrules} reading rules',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['hindi', 'alphabet', 'devanagari'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Hindi letter', 'speechLang': 'hi-IN',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }, RULE_TYPE: {
            'id': RULE_TYPE, 'name': 'Hindi reading rule', 'speechLang': 'hi-IN',
            'fields': RULE_FIELDS,
            'cards': [{'name': 'Rule', 'front': FRONT_R, 'back': BACK_R}],
            'css': CSS + CSS_R,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Hindi-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
