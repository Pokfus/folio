#!/usr/bin/env python3
"""Write the Burmese alphabet deck: `decks/Burmese-Alphabet.folio-deck.json`.

    python3 .claude/burmese/alphabet.py

The first deck of the Burmese collection, sorted before A1 by `levelRank`'s
"Alphabet" rule.  The level decks print a reading under every word, so this deck is
not a gate; it is where the script itself is learnt.

THE SCRIPT IS AN ABUGIDA: a consonant letter carries the vowel a, and every other
vowel, the tone, a medial consonant (y, w, the breathy h) and a final are marks
written around it.  So the deck teaches, in this order:
  · THE 33 CONSONANTS in the traditional order (the five groups of five, then the
    eight "without a group"), each with its sound, its traditional NAME (ကကြီး "big
    ka") -- which is also what keeps the sound sides apart, since several letters say
    the same sound (ယ ရ are both y; the ten letters kept for Pali and Sanskrit words
    double others) -- and an example word;
  · THE FOUR TONES, each on the minimal set the Burmese language article gives
    (ခါ ခါး ခ ခတ်), because the reading under every word marks them -- the front shows
    the set with the tone's own word in bold;
  · THE SEVEN VOWELS of an open syllable, each in its three tones on က;
  · THE FOUR MEDIALS (ျ ြ ွ ှ);
  · THE CLOSED SYLLABLES: the finals that end in a glottal stop and those that end
    in a nasal, each spelt on က, as the alphabet article tables them;
  · the asat, the anusvara and the stacking sign, the independent vowel letters, the
    digits and the punctuation.

WHERE IT COMES FROM.  Every letter, name, sound, spelling and rhyme is transcribed
from Wikipedia's "Burmese alphabet" (§ Consonant letters, Vowel letters, Medial
diacritics, Tone and vowel diacritics, Final diacritics, Syllable rhymes, Numerals,
Punctuation) and the tones from "Burmese language" § Tones, both read 2026-11-15.
The IPA is written as the level decks' readings (English Wiktionary's) write it --
the nasal final as ɴ where the alphabet article writes ɰ̃.  The descriptions in
English words are the usual learner's approximations, never more.

EACH CONSONANT'S EXAMPLE WORD is the first word of the A1 deck (dealt by frequency)
that begins with that letter, as A1 prints it, else the commonest such word of English
Wiktionary (`lex.json`).  A digit's word is A1's number card.  A re-run is
byte-identical whenever `lex.json` and the A1 deck are.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from my import syllables

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-15T00:00:00.000Z'
TYPE_ID = 'my-abc'

# (letter, MLC, IPA, name, name IPA, group, description), Wikipedia's table in its order.
INDIC = 'a letter kept for words from Pali and Sanskrit'
CONSONANTS = [
    ('က', 'k', 'k', 'ကကြီး', 'ka̰ dʑí', 'ka group', 'k without a puff of breath, as in "skin"'),
    ('ခ', 'kh', 'kʰ', 'ခခွေး', 'kʰa̰ ɡwé', 'ka group', 'k with a puff of breath, as in "kin"'),
    ('ဂ', 'g', 'ɡ', 'ဂငယ်', 'ɡa̰ ŋɛ̀', 'ka group', 'g, as in "go"'),
    ('ဃ', 'gh', 'ɡ', 'ဃကြီး', 'ɡa̰ dʑí', 'ka group', 'g, said exactly as ဂ; ' + INDIC),
    ('င', 'ng', 'ŋ', 'င', 'ŋa̰', 'ka group', 'ng, as in "singer" -- in Burmese also at the start of a word'),
    ('စ', 'c', 's', 'စလုံး', 'sa̰ lóʊɴ', 'sa group', 's without a puff of breath'),
    ('ဆ', 'ch', 'sʰ', 'ဆလိမ်', 'sʰa̰ lèɪɴ', 'sa group', 's with a puff of breath after it'),
    ('ဇ', 'j', 'z', 'ဇကွဲ', 'za̰ ɡwɛ́', 'sa group', 'z, as in "zoo"'),
    ('ဈ', 'jh', 'z', 'ဈမျဉ်းဆွဲ', 'za̰ mjɪ̀ɴ zwɛ́', 'sa group', 'z, said exactly as ဇ; ' + INDIC),
    ('ည', 'ny', 'ɲ', 'ညကြီး', 'ɲa̰ dʑí', 'sa group', 'ny, as in "canyon"; written ဉ in some words'),
    ('ဋ', 'ṭ', 't', 'ဋသန်လျင်းချိတ်', 'ta̰ təlɪ́ɴ dʑeɪʔ', 'ṭa group', 't, said as တ; ' + INDIC),
    ('ဌ', 'ṭh', 'tʰ', 'ဌဝမ်းဘဲ', 'tʰa̰ wʊ́ɴ bɛ́', 'ṭa group', 't with a puff of breath, said as ထ; ' + INDIC),
    ('ဍ', 'ḍ', 'd', 'ဍရင်ကောက်', 'da̰ jɪ̀ɴ ɡaʊʔ', 'ṭa group', 'd, said as ဒ; ' + INDIC),
    ('ဎ', 'ḍh', 'd', 'ဎရေမှုတ်', 'da̰ jè m̥oʊʔ', 'ṭa group', 'd, said as ဒ; ' + INDIC),
    ('ဏ', 'ṇ', 'n', 'ဏကြီး', 'na̰ dʑí', 'ṭa group', 'n, said as န; ' + INDIC),
    ('တ', 't', 't', 'တဝမ်းပူ', 'ta̰ wʊ́ɴ bù', 'ta group', 't without a puff of breath, as in "stop"'),
    ('ထ', 'th', 'tʰ', 'ထဆင်ထူး', 'tʰa̰ sʰɪ̀ɴ dú', 'ta group', 't with a puff of breath, as in "top" (never the th of "thin")'),
    ('ဒ', 'd', 'd', 'ဒထွေး', 'da̰ dwé', 'ta group', 'd, as in "do"'),
    ('ဓ', 'dh', 'd', 'ဓအောက်ခြိုက်', 'da̰ ʔaʊʔ tɕʰaɪʔ', 'ta group', 'd, said as ဒ; ' + INDIC),
    ('န', 'n', 'n', 'နငယ်', 'na̰ ŋɛ̀', 'ta group', 'n, as in "no"; written with a shorter tail when a mark goes below it (နု)'),
    ('ပ', 'p', 'p', 'ပစောက်', 'pa̰ zaʊʔ', 'pa group', 'p without a puff of breath, as in "spin"'),
    ('ဖ', 'ph', 'pʰ', 'ဖဦးထုပ်', 'pʰa̰ ʔóʊʔ tʰoʊʔ', 'pa group', 'p with a puff of breath, as in "pin"'),
    ('ဗ', 'b', 'b', 'ဗထက်ခြိုက်', 'ba̰ tɛʔ tɕʰaɪʔ', 'pa group', 'b, as in "boy"'),
    ('ဘ', 'bh', 'b', 'ဘကုန်း', 'ba̰ ɡóʊɴ', 'pa group', 'b, said as ဗ; Indic in origin, but common in Burmese words too'),
    ('မ', 'm', 'm', 'မ', 'ma̰', 'pa group', 'm, as in "me"'),
    ('ယ', 'y', 'j', 'ယပက်လက်', 'ja̰ pɛʔ lɛʔ', 'without a group', 'y, as in "yes"'),
    ('ရ', 'r', 'j', 'ရကောက်', 'ja̰ ɡaʊʔ', 'without a group', 'y, as in "yes", like ယ -- but often r in words from Pali or English'),
    ('လ', 'l', 'l', 'လငယ်', 'la̰ ŋɛ̀', 'without a group', 'l, as in "let"'),
    ('ဝ', 'w', 'w', 'ဝ', 'wa̰', 'without a group', 'w, as in "wet"'),
    ('သ', 's', 'θ', 'သ', 'θa̰', 'without a group', 'th, as in "thin" (and as in "this" when voiced inside a word)'),
    ('ဟ', 'h', 'h', 'ဟ', 'ha̰', 'without a group', 'h, as in "hat"'),
    ('ဠ', 'ḷ', 'l', 'ဠကြီး', 'la̰ dʑí', 'without a group', 'l, said as လ; ' + INDIC),
    ('အ', 'a', 'ʔ', 'အ', 'ʔa̰', 'without a group',
     'a glottal stop, the catch in "uh-oh": the letter that carries a vowel when a syllable has no other consonant'),
]

# The four tones, from "Burmese language" § Tones (the minimal set on ခ kʰ).
TONES = [
    ('ခါ', 'kʰà', 'low', 'à', 'modal voice, a low and level or slightly rising pitch, medium length', 'shake'),
    ('ခါး', 'kʰá', 'high', 'á', 'a high pitch, long, sometimes slightly breathy, often falling before a pause', 'be bitter'),
    ('ခ', 'kʰa̰', 'creaky', 'a̰', 'tense or creaky voice, high and often slightly falling, sometimes with a light catch', 'to wait upon'),
    ('ခတ်', 'kʰaʔ', 'checked', 'aʔ', 'short, high, ending in a glottal stop, the vowel a little centralised', 'to beat, to strike'),
]

# The open-syllable vowels, each (creaky, low, high) spelt on က, with the IPA vowel.
VOWELS = [
    ('a', ('က', 'ကာ', 'ကား'), 'a, as in "father"', 'no mark (the inherent vowel); ာ (written ါ after ခ ဂ င ဒ ပ ဝ); ား'),
    ('ɛ', ('ကဲ့', 'ကယ်', 'ကဲ'), 'e, as in "bed"', 'ဲ့; ယ်; ဲ'),
    ('i', ('ကိ', 'ကီ', 'ကီး'), 'ee, as in "see"', 'ိ; ီ; ီး'),
    ('u', ('ကု', 'ကူ', 'ကူး'), 'oo, as in "food"', 'ု; ူ; ူး'),
    ('e', ('ကေ့', 'ကေ', 'ကေး'), 'e, as in French "été": one pure vowel, no glide into "ee"', 'ေ့; ေ; ေး (ေ is written before the consonant and said after it)'),
    ('ɔ', ('ကော့', 'ကော်', 'ကော'), 'aw, as in "law"', 'ော့; ော်; ော'),
    ('o', ('ကို့', 'ကို', 'ကိုး'), 'o, as in "go", but one pure vowel', 'ို့; ို; ိုး'),
]
TONE_NAMES = ('creaky', 'low', 'high')
TONE_MARKS = {'a': ('a̰', 'à', 'á'), 'ɛ': ('ɛ̰', 'ɛ̀', 'ɛ́'), 'i': ('ḭ', 'ì', 'í'), 'u': ('ṵ', 'ù', 'ú'),
              'e': ('ḛ', 'è', 'é'), 'ɔ': ('ɔ̰', 'ɔ̀', 'ɔ́'), 'o': ('o̰', 'ò', 'ó')}

MEDIALS = [
    ('ျ', 'ya pin', 'ယပင့်', 'y after the consonant (မျ mj); after က ခ ဂ it makes them ch- and j-like (ကျ tɕ, ချ tɕʰ, ဂျ dʑ)', ['မျ', 'ပျ', 'ကျ', 'ချ']),
    ('ြ', 'ya yit', 'ရရစ်', 'y after the consonant, as ျ does: မြ mj, and ကြ ခြ ဂြ are said tɕ tɕʰ dʑ', ['မြ', 'ပြ', 'ကြ', 'ခြ']),
    ('ွ', 'wa hswe', 'ဝဆွဲ', 'w after the consonant (မွ mw); in a closed syllable the vowel ʊ', ['မွ', 'ကွ', 'သွ', 'ဆွ']),
    ('ှ', 'ha hto', 'ဟထိုး', 'makes m n ng ny l voiceless, a breathy h-sound (မှ m̥, နှ n̥, လှ l̥); ယှ and ရှ are said sh', ['မှ', 'နှ', 'လှ', 'ရှ']),
]

# Closed syllables, spelt on က: (spellings, IPA rhyme).
CHECKED = [
    (('ကက်',), 'ɛʔ'), (('ကစ်',), 'ɪʔ'), (('ကတ်', 'ကပ်'), 'aʔ'), (('ကွတ်', 'ကွပ်'), 'ʊʔ'),
    (('ကိတ်', 'ကိပ်'), 'eɪʔ'), (('ကုတ်', 'ကုပ်'), 'oʊʔ'), (('ကောက်',), 'aʊʔ'), (('ကိုက်',), 'aɪʔ'),
]
NASAL = [
    (('ကင်', 'ကဉ်'), 'ɪɴ'), (('ကန်', 'ကမ်', 'ကံ'), 'aɴ'), (('ကိန်', 'ကိမ်', 'ကိံ'), 'eɪɴ'),
    (('ကုန်', 'ကုမ်', 'ကုံ'), 'oʊɴ'), (('ကောင်',), 'aʊɴ'), (('ကိုင်',), 'aɪɴ'), (('ကွန်', 'ကွမ်'), 'ʊɴ'),
]

INDEP = [('ဣ', 'ʔḭ', 'အိ'), ('ဤ', 'ʔì', 'အီ'), ('ဥ', 'ʔṵ', 'အု'), ('ဦ', 'ʔù', 'အူ'),
         ('ဧ', 'ʔè', 'အေ'), ('ဩ', 'ʔɔ́', 'အော'), ('ဪ', 'ʔɔ̀', 'အော်')]

# ာ is written tall, ါ, after these (so ဒါ is not read ဓ): the alphabet article
TALL_AA = 'ခဂငဒပဝ'

DIGIT_WORD = ['သုည', 'တစ်', 'နှစ်', 'သုံး', 'လေး', 'ငါး', 'ခြောက်', 'ခုနစ်', 'ရှစ်', 'ကိုး']

FIELDS = ['Letter', 'Row', 'Sound', 'Example']

LETTER = '<div class="uc-letter">{{Letter}}</div>'
DETAIL = ('<div class="uc-row">{{Row}}</div>'
          '<div class="uc-field"><div class="uc-pos">sound</div><div class="uc-gl">{{Sound}}</div>'
          '{{#Example}}<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}</div>'
          '{{/Example}}</div>')
ASK = ('<div class="uc-ask">Which letter is this?</div>'
       '<div class="uc-field"><div class="uc-gl">{{Sound}}</div></div>')
FRONT_L = LETTER
BACK_L = '{{FrontSide}}<hr>' + DETAIL
FRONT_S = ASK
BACK_S = '{{FrontSide}}<hr>' + LETTER + DETAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hindi', 'alphabet.py'),
           encoding='utf-8').read().split('CSS = """', 1)[1].split('"""', 1)[0] + """.uc-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 14px;
  margin-top: 6px;
}
.uc-ri {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 38px;
}
.uc-rc {
  font-size: 30px;
  line-height: 1.7;
}
.uc-rr {
  font-size: 13px;
  opacity: 0.62;
}
.uc-letter {
  line-height: 1.6;
}
"""


def row_html(pairs):
    return ''.join(f'<span class="uc-ri"><span class="uc-rc">{E(c)}</span>'
                   f'<span class="uc-rr">{E(r)}</span></span>' for c, r in pairs)


def first_gloss(h):
    m = re.search(r'class="uc-(?:gl|gls)">(?:<li>)?([^<]*)', h)
    return html.unescape(m.group(1)) if m else ''


def ex_html(w, rom, gl):
    gl = re.split(r'[;(]', gl)[0].strip().rstrip(',')
    return (f'<span class="uc-ex">{E(w)}</span><span class="uc-exr">{E(rom)}</span>'
            f'<span class="uc-exe">{E(gl)}</span>')


def example(lex, letter, used, a1, onset=''):
    """The first A1 word that begins with this letter followed by no medial, asat or
    stacking sign (ကျ is said tɕ, not k), and SAID with the letter's sound (ဘုရား is
    pʰəjá, so it is not ဘ's example), as A1 prints it; else
    the commonest such word in Wiktionary that has a reading."""
    plain = lambda w: w[:1] == letter and w[1:2] not in 'ျြွှ္်'
    for w, rom, gl in a1:
        if plain(w) and w not in used and rom and gl and rom.startswith(onset):
            used.add(w)
            return ex_html(w, rom, gl)
    best = None
    for k, L in lex.items():
        w = L['word']
        if not plain(w) or w in used or len(syllables(w)) > 3:
            continue
        ents = [e for e in L['entries'] if e['ipa'] and e['glosses'] and e['ipa'].strip('/').startswith(onset)
                and e['pos'] in ('noun', 'verb', 'adj', 'adv', 'num', 'pron')
                and not e['glosses'][0]['weak']]
        if not ents:
            continue
        cand = (-L['freq'], w, ents[0])
        if best is None or cand[:2] < best[:2]:
            best = cand
    if not best:
        return ''
    _, w, e = best
    used.add(w)
    return ex_html(w, e['ipa'].strip('/'), e['glosses'][0]['g'])


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    cache = os.path.join(here, '..', 'burmese-cache', 'lex.json')
    if not os.path.exists(cache):
        raise SystemExit('alphabet.py reads its example words from lex.json: '
                         'run `python3 .claude/burmese/run.py` once first')
    lex = json.load(open(cache, encoding='utf-8'))['lemmas']
    A1 = json.load(open(os.path.join(here, '..', '..', 'decks', 'Burmese-A1.folio-deck.json'),
                        encoding='utf-8'))
    color = A1['meta']['color']
    a1 = [(c['fields']['Word'], html.unescape(c['fields']['Roman']), first_gloss(c['fields']['English']))
          for c in A1['cards']]
    a1_by_word = {w: (w, r, g) for w, r, g in a1}
    cards, used = [], set()
    for ch, mlc, ipa, name, name_ipa, group, desc in CONSONANTS:
        cards.append({'Letter': E(ch),
                      'Row': row_html([(ch + ('ါ' if ch in TALL_AA else 'ာ'), ipa + 'à'),
                                       (ch + 'ီ', ipa + 'ì'), (ch + 'ူ', ipa + 'ù')]),
                      'Sound': (f'<span class="uc-rm">{E(mlc)}</span> · /{E(ipa)}/ · named {E(name)} '
                                f'({E(name_ipa)}), {E(group)} · {E(desc)}'),
                      'Example': example(lex, ch, used, a1, ipa)})
    for word, ipa, name, mark, desc, gloss in TONES:
        # the front shows the whole set with this tone's word in bold: ခ alone is the consonant's note
        front = ' '.join(f'<b>{E(t[0])}</b>' if t[0] == word else E(t[0]) for t in TONES)
        cards.append({'Letter': front, 'Row': row_html([(word, ipa)]),
                      'Sound': (f'<span class="uc-rm">{E(mark)}</span> · the {name} tone: {E(desc)}. '
                                f'{E(word)} {E(ipa)} means "{E(gloss)}"'),
                      'Example': ''})
    for v, forms, sound, marks in VOWELS:
        rows = [(f, 'k' + t) for f, t in zip(forms, TONE_MARKS[v])]
        cards.append({'Letter': E(forms[1]),
                      'Row': row_html(rows),
                      'Sound': (f'<span class="uc-rm">{E(v)}</span> · the vowel {E(sound)}, in its three tones '
                                f'(creaky, low, high), written {E(marks)}'),
                      'Example': ''})
    for mark, name, bname, desc, shown in MEDIALS:
        cards.append({'Letter': E('◌' + mark),
                      'Row': row_html([(s, '') for s in shown]),
                      'Sound': (f'<span class="uc-rm">{E(name)}</span> · the medial {E(bname)}: {E(desc)}'),
                      'Example': ''})
    for spells, rhyme in CHECKED:
        cards.append({'Letter': E(spells[0]), 'Row': row_html([(s, 'k' + rhyme) for s in spells]),
                      'Sound': (f'<span class="uc-rm">-{E(rhyme)}</span> · a closed syllable ending in a '
                                f'glottal stop (the checked tone), spelt {E(" or ".join(spells))}: the '
                                'written final consonant is no longer said, only the catch'),
                      'Example': ''})
    for spells, rhyme in NASAL:
        low = rhyme[0] + '\u0300' + rhyme[1:]
        cards.append({'Letter': E(spells[0]), 'Row': row_html([(s, 'k' + low) for s in spells]),
                      'Sound': (f'<span class="uc-rm">-{E(rhyme)}</span> · a syllable ending in a nasal '
                                f'(written ɴ: the vowel nasalised, no clear n or m), spelt {E(" or ".join(spells))}; '
                                'in the low tone as written, creaky with ့, high with း'),
                      'Example': ''})
    cards.append({'Letter': E('◌်'), 'Row': row_html([('ကက်', 'kɛʔ'), ('ကန်', 'kàɴ'), ('ကယ်', 'kɛ̀')]),
                  'Sound': ('<span class="uc-rm">asat</span> · အသတ်, "no vowel": it kills the inherent a '
                            'and makes the letter a final; on ယ and ော it marks the low tone'),
                  'Example': ''})
    cards.append({'Letter': E('◌ံ'), 'Row': row_html([('ကံ', 'kàɴ'), ('ကုံ', 'kòʊɴ')]),
                  'Sound': ('<span class="uc-rm">anusvara</span> · သေးသေးတင်: a nasal final, like မ် '
                            '(low tone; with ့ or း creaky or high), and in a longer word a nasal before the next consonant'),
                  'Example': ''})
    cards.append({'Letter': E('◌္'), 'Row': row_html([('မင်္ဂလာ', 'mɪ̀ɴɡəlà'), ('ဗုဒ္ဓ', 'boʊʔda̰')]),
                  'Sound': ('<span class="uc-rm">stacking</span> · a consonant written small under '
                            'another (ဒ္ဓ) is the final of one syllable and the start of the next; '
                            'the kinzi င်္, a small mark above, is an ng final; both mostly in words from Pali'),
                  'Example': ''})
    cards.append({'Letter': E(' '.join(c for c, _, _ in INDEP[:3])),
                  'Row': row_html([(c, r) for c, r, _ in INDEP]),
                  'Sound': ('<span class="uc-rm">independent vowels</span> · seven letters that write a '
                            'vowel with no consonant, mostly in words from Pali and Sanskrit: '
                            + E(', '.join(f'{c} = {eq}' for c, _, eq in INDEP))),
                  'Example': ''})
    for d in range(10):
        ch = chr(0x1040 + d)
        w = DIGIT_WORD[d]
        ex = a1_by_word.get(w)
        cards.append({'Letter': E(ch), 'Row': '',
                      'Sound': f'<span class="uc-rm">{d}</span> · the digit {d}',
                      'Example': ex_html(*ex) if ex else ''})
    cards.append({'Letter': E('၊ ။'), 'Row': '',
                  'Sound': ('<span class="uc-rm">, .</span> · the punctuation: ၊ is a comma (a break '
                            'inside a sentence) and ။ ends a sentence, a full stop'),
                  'Example': ''})
    cards.append({'Letter': E('၏ ၍ ၌'), 'Row': row_html([('၏', 'ʔḭ'), ('၍', 'jwḛ'), ('၌', 'n̥aɪʔ'), ('၎င်း', 'ləɡáʊɴ')]),
                  'Sound': ('<span class="uc-rm">literary signs</span> · single signs for particles of '
                            'written Burmese: ၏ "of" (also a full stop after a verb), ၍ "and", ၌ "at", '
                            'and ၎င်း "ditto, the same"'),
                  'Example': ''})
    out_cards = []
    for n, F in enumerate(cards, 1):
        out_cards.append({'sub': '', 'fields': F, 'id': f'u_myabc_{n}', 'type': TYPE_ID})
    n = len(out_cards)
    sounds = [c['fields']['Sound'] for c in out_cards]
    assert len(set(sounds)) == n, 'two notes share a sound side: the reverse card is unanswerable'
    letters = [c['fields']['Letter'] for c in out_cards]
    assert len(set(letters)) == n, 'two notes share a letter side'
    desc = (
        f"The Myanmar script in which Burmese is written: {n} notes. The first deck of the "
        "Burmese collection. The script is an abugida: a consonant letter carries the vowel a, "
        "and every other vowel, the tone, a medial consonant and a final are marks written "
        "around it. The deck teaches the 33 consonants in the traditional order (the five groups "
        "of five, then the eight without a group), each with its sound, its traditional name "
        "(ကကြီး 'big ka') and the commonest word that begins with it; then the four tones (low "
        "à, high á, creaky a̰, checked aʔ — the marks the reading under every word in the level "
        "decks uses), the seven vowels in their three tones, the four medials (ျ ြ ွ ှ), the "
        "closed syllables that end in a glottal stop or a nasal, the asat, the anusvara and the "
        "stacking sign, the independent vowel letters, the digits and the punctuation. Both "
        "directions: see a letter and recall its sound, or see a sound and recall the letter, "
        "each a card with its own schedule. Several letters say the same sound (ယ and ရ are both "
        "y; ten letters kept for words from Pali and Sanskrit double others), so the sound side "
        "names each letter too. The sounds are given in IPA, as the level decks give them, and "
        "in the usual learner's approximations in English words. There is no speaker button: "
        "few devices have a Burmese voice. Sources: Wikipedia, 'Burmese alphabet' (the letters, "
        "names, sounds, spellings and rhymes) and 'Burmese language' § Tones, read 2026-11-15; "
        "the example words, their readings and meanings are English Wiktionary's, via the "
        "kaikki.org extraction (CC BY-SA 4.0), chosen by their frequency in the Burmese "
        "Wikipedia."
    )
    meta = {
        'id': 'myabc', 'title': 'Burmese Alphabet',
        'subtitle': f'{n} letters, tones and signs · both directions, as two cards each',
        'desc': desc, 'author': '', 'language': 'en', 'color': color,
        'tags': ['burmese', 'alphabet', 'myanmar script'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Burmese letter', 'speechLang': 'my-MM',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': out_cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(here, '..', '..', 'decks', 'Burmese-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
