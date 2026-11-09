#!/usr/bin/env python3
"""Write the Thai alphabet deck: `decks/Thai-Alphabet.folio-deck.json`.

    python3 .claude/thai/alphabet.py

The first deck of the Thai collection, sorted before A1 by `levelRank`'s
"Alphabet" rule.  The level decks print a romanisation under every word, so
this deck is not a gate; it is where the script itself is learnt.

WHAT IS IN IT, in the order a Thai primer teaches it:
  · the 44 CONSONANTS in their traditional order, each with its CLASS (mid,
    high or low), its sound at the start of a syllable and at the end, and its
    NAME -- every Thai letter is named by a word that begins with it (ก ไก่ "g
    as in chicken"), and the name is how Thais tell apart the letters that
    sound alike: five letters say k, six say t.  ฃ and ฅ are obsolete and say
    so;
  · the VOWELS, each written on the dotted circle ◌ that stands for the
    consonant it sits on (a Thai vowel is written above, below, before or after
    its consonant, or around it), short and long side by side;
  · the four TONE MARKS and the other signs (the silencer ์, the repeat ๆ, the
    abbreviation ฯ);
  · the three CLASS RULES -- the tone of a syllable with no tone mark is
    decided by its first consonant's class and whether the syllable is "live"
    (ends in a long vowel or m, n, ng, w, y) or "dead" (ends in a short vowel or
    p, t, k);
  · the ten Thai DIGITS, which prices and dates still use.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's
alphabets give them, never IPA, with the Paiboon romanisation the level decks
use (bp and dt for the unaspirated p and t, which English has only after s:
spin, stop).  The descriptions are the standard ones of Central Thai.  The
example words' romanisations are English Wiktionary's (`lex.json`), so the two
decks agree; a letter's NAME is romanised by the rule (its consonant + ɔɔ, on
a rising tone for the high class), and two example compounds Wiktionary has no
entry for are romanised from their parts (`COMPOSE`).  No corpus is read for
the content, so a re-run is byte-identical whenever `lex.json` is.

THE SOUND SIDE IS UNIQUE (asserted): the reverse card shows a letter's name
and sound and asks for the letter, and the name is what makes ข (kɔ̌ɔ kài,
"egg") a different answer from ค (kɔɔ kwaai, "buffalo").
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from th import fold

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'th-abc'
COLOR = '#014764'

M, H, L = 'mid', 'high', 'low'
# (letter, class, onset, initial sound, final sound, name word, its meaning)
CONSONANTS = [
    ('ก', M, 'g', 'k with no puff of breath, as in skin; Paiboon writes it g', 'k', 'ไก่', 'chicken'),
    ('ข', H, 'k', 'k with a puff of breath, as in kit', 'k', 'ไข่', 'egg'),
    ('ฃ', H, 'k', 'k with a puff of breath — OBSOLETE, still recited in the alphabet', '', 'ขวด', 'bottle'),
    ('ค', L, 'k', 'k with a puff of breath, as in kit', 'k', 'ควาย', 'water buffalo'),
    ('ฅ', L, 'k', 'k with a puff of breath — OBSOLETE, still recited in the alphabet', '', 'คน', 'person'),
    ('ฆ', L, 'k', 'k with a puff of breath, in words from Sanskrit and Pali', 'k', 'ระฆัง', 'bell'),
    ('ง', L, 'ng', 'ng as in sing — and Thai lets it START a word', 'ng', 'งู', 'snake'),
    ('จ', M, 'j', 'between j and ch, with no puff of breath; Paiboon writes it j', 't', 'จาน', 'plate'),
    ('ฉ', H, 'ch', 'ch as in chip, with a puff of breath', '', 'ฉิ่ง', 'small cymbals'),
    ('ช', L, 'ch', 'ch as in chip, with a puff of breath', 't', 'ช้าง', 'elephant'),
    ('ซ', L, 's', 's as in sun', 't', 'โซ่', 'chain'),
    ('ฌ', L, 'ch', 'ch as in chip; rare, in words from Sanskrit and Pali', None, 'เฌอ', 'tree, wood'),
    ('ญ', L, 'y', 'y as in yes', 'n', 'หญิง', 'woman'),
    ('ฎ', M, 'd', 'd as in dog; rare, in words from Sanskrit and Pali', 't', 'ชฎา', 'headdress'),
    ('ฏ', M, 'dt', 't with no puff of breath, as in stop; rare, in words from Sanskrit and Pali',
     't', 'ปฏัก', 'goad'),
    ('ฐ', H, 't', 't with a puff of breath, as in top; rare, in words from Sanskrit and Pali',
     't', 'ฐาน', 'base, pedestal'),
    ('ฑ', L, 't', 't with a puff of breath, sometimes d; rare, in words from Sanskrit and Pali',
     't', 'มณโฑ', 'Montho, a queen of the Ramakien'),
    ('ฒ', L, 't', 't with a puff of breath; rare, in words from Sanskrit and Pali', 't',
     'ผู้เฒ่า', 'elder'),
    ('ณ', L, 'n', 'n as in no; in words from Sanskrit and Pali', 'n', 'เณร', 'novice monk'),
    ('ด', M, 'd', 'd as in dog', 't', 'เด็ก', 'child'),
    ('ต', M, 'dt', 't with no puff of breath, as in stop; Paiboon writes it dt', 't', 'เต่า', 'turtle'),
    ('ถ', H, 't', 't with a puff of breath, as in top', 't', 'ถุง', 'bag'),
    ('ท', L, 't', 't with a puff of breath, as in top', 't', 'ทหาร', 'soldier'),
    ('ธ', L, 't', 't with a puff of breath, as in top; in words from Sanskrit and Pali', 't',
     'ธง', 'flag'),
    ('น', L, 'n', 'n as in no', 'n', 'หนู', 'mouse'),
    ('บ', M, 'b', 'b as in bat', 'p', 'ใบไม้', 'leaf'),
    ('ป', M, 'bp', 'p with no puff of breath, as in spin; Paiboon writes it bp', 'p', 'ปลา', 'fish'),
    ('ผ', H, 'p', 'p with a puff of breath, as in pin', '', 'ผึ้ง', 'bee'),
    ('ฝ', H, 'f', 'f as in fan', '', 'ฝา', 'lid'),
    ('พ', L, 'p', 'p with a puff of breath, as in pin', 'p', 'พาน', 'offering tray'),
    ('ฟ', L, 'f', 'f as in fan', 'p', 'ฟัน', 'tooth'),
    ('ภ', L, 'p', 'p with a puff of breath, as in pin; in words from Sanskrit and Pali', 'p',
     'สำเภา', 'junk (sailing ship)'),
    ('ม', L, 'm', 'm as in man', 'm', 'ม้า', 'horse'),
    ('ย', L, 'y', 'y as in yes', 'i (it closes the vowel, as in ai)', 'ยักษ์', 'giant'),
    ('ร', L, 'r', 'a tapped or trilled r — in casual speech often said as l', 'n', 'เรือ', 'boat'),
    ('ล', L, 'l', 'l as in leaf', 'n', 'ลิง', 'monkey'),
    ('ว', L, 'w', 'w as in wet', 'o (it closes the vowel, as in ao)', 'แหวน', 'ring'),
    ('ศ', H, 's', 's as in sun; in words from Sanskrit and Pali', 't', 'ศาลา', 'pavilion'),
    ('ษ', H, 's', 's as in sun; in words from Sanskrit and Pali', 't', 'ฤๅษี', 'hermit'),
    ('ส', H, 's', 's as in sun', 't', 'เสือ', 'tiger'),
    ('ห', H, 'h', 'h as in hat; written silent before a low-class letter (หนู, หญิง) to give '
     'it the high class\'s tones', '', 'หีบ', 'chest, box'),
    ('ฬ', L, 'l', 'l as in leaf; rare, in words from Sanskrit and Pali', 'n', 'จุฬา', 'star kite'),
    ('อ', M, '', 'no sound of its own: it carries a vowel that begins a syllable, and is a '
     'vowel itself (ɔɔ) after a consonant', '', 'อ่าง', 'basin'),
    ('ฮ', L, 'h', 'h as in hat', '', 'นกฮูก', 'owl'),
]

# (shown on ◌, the vowel's name in Thai for the speaker, Paiboon, sound, example word, meaning)
VOWELS = [
    ('◌ะ', 'สระอะ', 'a', 'short a, as in the u of cut', 'จะ', 'will (future)'),
    ('◌า', 'สระอา', 'aa', 'long a, as in father', 'มา', 'to come'),
    ('◌ิ', 'สระอิ', 'i', 'short i, as in bit', 'กิน', 'to eat'),
    ('◌ี', 'สระอี', 'ii', 'long ee, as in see', 'ดี', 'good'),
    ('◌ึ', 'สระอึ', 'ʉ', 'short ʉ: say i as in bit with the lips spread and the tongue pulled '
     'back; English has no such vowel', 'ถึง', 'to arrive'),
    ('◌ือ', 'สระอือ', 'ʉʉ', 'long ʉʉ, the same unrounded vowel held; written ◌ื with อ when no '
     'consonant follows', 'มือ', 'hand'),
    ('◌ุ', 'สระอุ', 'u', 'short u, as in put; written BELOW the consonant', 'คุณ', 'you'),
    ('◌ู', 'สระอู', 'uu', 'long oo, as in food; written below the consonant', 'ดู', 'to look'),
    ('เ◌ะ', 'สระเอะ', 'e', 'short e, as in bed; เ is written BEFORE the consonant it follows in speech',
     'เตะ', 'to kick'),
    ('เ◌', 'สระเอ', 'ee', 'long e, like the a of cake held without the glide into ee', 'เพลง', 'song'),
    ('แ◌ะ', 'สระแอะ', 'ɛ', 'short ɛ, as in the a of cat, clipped', 'และ', 'and'),
    ('แ◌', 'สระแอ', 'ɛɛ', 'long ɛɛ, as in the a of cat, held', 'แม่', 'mother'),
    ('โ◌ะ', 'สระโอะ', 'o', 'short o, like the o of go cut short, with no glide', 'โต๊ะ', 'table'),
    ('โ◌', 'สระโอ', 'oo', 'long o, as in go held without the glide into oo', 'โลก', 'world'),
    ('เ◌าะ', 'สระเอาะ', 'ɔ', 'short ɔ, as in the o of hot', 'เกาะ', 'island'),
    ('◌อ', 'สระออ', 'ɔɔ', 'long ɔɔ, as in law', 'พ่อ', 'father'),
    ('เ◌อะ', 'สระเออะ', 'ə', 'short ə, as in the u of fur, clipped', 'เยอะ', 'a lot'),
    ('เ◌อ', 'สระเออ', 'əə', 'long əə, as in fur with no r', 'เธอ', 'you; she'),
    ('เ◌ีย', 'สระเอีย', 'iia', 'ee gliding into a, as in the ia of Mia', 'เสียง', 'sound, voice'),
    ('เ◌ือ', 'สระเอือ', 'ʉʉa', 'the unrounded ʉʉ gliding into a', 'เรือ', 'boat'),
    ('◌ัว', 'สระอัว', 'uua', 'oo gliding into a, as in the ua of truant', 'ตัว', 'body'),
    ('◌ำ', 'สระอำ', 'am', 'short a followed by m, as in the um of hum', 'ทำ', 'to do'),
    ('ใ◌', 'สระใอไม้ม้วน', 'ai', 'ai, as in Thai; this spelling (mái múan) is used in only twenty '
     'words, which primers learn by heart', 'ใจ', 'heart'),
    ('ไ◌', 'สระไอไม้มลาย', 'ai ', 'ai, as in Thai; the usual spelling (mái má-laai)', 'ไป', 'to go'),
    ('เ◌า', 'สระเอา', 'ao', 'ao, as in the ow of cow', 'เขา', 'he; she'),
    ('◌ั', 'ไม้หันอากาศ', 'a ', 'mái hǎn-aa-gàat: short a, written this way when a final '
     'consonant follows (กัน = g + a + n)', 'กัน', 'together'),
    ('◌็', 'ไม้ไต่คู้', '(short)', 'mái dtài-kúu: SHORTENS the vowel of the syllable it sits on '
     '(เป็น is bpen, not bpeen)', 'เป็น', 'to be'),
    ('ฤ', 'ฤ', 'rʉ', 'a vowel letter from Sanskrit, said rʉ (sometimes ri or rəə)', 'ฤดู', 'season'),
]

# (shown, its name, the name's Paiboon, what it does, example, meaning)
SIGNS = [
    ('◌่', 'ไม้เอก', 'mái èek', 'tone mark 1: LOW tone on a mid- or high-class consonant '
     '(ไก่ gài), FALLING on a low-class one (ไม่ mâi)', 'ไก่', 'chicken'),
    ('◌้', 'ไม้โท', 'mái too', 'tone mark 2: FALLING tone on a mid- or high-class consonant '
     '(บ้าน bâan), HIGH on a low-class one (ม้า máa)', 'บ้าน', 'house'),
    ('◌๊', 'ไม้ตรี', 'mái dtrii', 'tone mark 3: HIGH tone; written only on mid-class consonants',
     'โต๊ะ', 'table'),
    ('◌๋', 'ไม้จัตวา', 'mái jàt-dtà-waa', 'tone mark 4: RISING tone; written only on mid-class '
     'consonants', 'ก๋วยเตี๋ยว', 'noodles'),
    ('◌์', 'การันต์', 'gaa-ran', 'the silencer (thanthakhat): the letter under it is not '
     'pronounced — ศุกร์ is sùk, the ร silent', 'ศุกร์', 'Friday (in วันศุกร์)'),
    ('ๆ', 'ไม้ยมก', 'mái yá-mók', 'the repeat mark: say the word before it twice', 'เด็กๆ',
     'children'),
    ('ฯ', 'ไปยาลน้อย', 'bpai-yaan-nɔ́ɔi', 'the abbreviation mark: the rest of a long name is left '
     'out (กรุงเทพฯ for the city\'s full ceremonial name)', 'กรุงเทพฯ', 'Bangkok'),
]

# The three class rules: (shown, name for the speaker, rule, example, meaning)
CLASSES = [
    ('กลาง', 'อักษรกลาง', 'MID class, the nine letters ก จ ฎ ฏ ด ต บ ป อ: with no tone mark, a '
     'live syllable is MID tone and a dead one LOW; they alone take all four tone marks',
     'จาก', 'from'),
    ('สูง', 'อักษรสูง', 'HIGH class, the eleven letters ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห: with no tone mark, a '
     'live syllable is RISING tone and a dead one LOW', 'สาม', 'three'),
    ('ต่ำ', 'อักษรต่ำ', 'LOW class, the other twenty-four: with no tone mark, a live syllable is MID '
     'tone; a dead one is HIGH if its vowel is short and FALLING if it is long', 'รถ', 'car'),
]
CLASS_NOTE = ('A syllable is LIVE when it ends in a long vowel or in m, n, ng, w or y, and DEAD '
              'when it ends in a short vowel or in p, t or k.')

DIGITS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']

# Example compounds with no Wiktionary entry of their own, romanised from their parts.
COMPOSE = {'นกฮูก': ['นก', 'ฮูก'], 'เด็กๆ': ['เด็ก', 'เด็ก']}

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

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hindi', 'alphabet.py'),
           encoding='utf-8').read().split('CSS = """', 1)[1].split('"""', 1)[0]
# Thai stacks a vowel and a tone mark above a letter (ปี่, น้ำ): give the big letter room.
CSS = CSS.replace('  font-size: 60px;\n  font-weight: 400;\n  line-height: 1.3;',
                  '  font-size: 60px;\n  font-weight: 400;\n  line-height: 1.6;')
CSS += """.uc-cls {
  margin-left: 6px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.6;
}
"""

ONSET_TONE = {M: 'ɔɔ', L: 'ɔɔ', H: 'ɔ̌ɔ'}


def main():
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'thai-cache', 'lex.json')
    lex = json.load(open(cache, encoding='utf-8')) if os.path.exists(cache) else {}
    if not lex:
        raise SystemExit('alphabet.py reads the example words\' romanisation from lex.json: '
                         'run `python3 .claude/thai/run.py` once first')

    def roman(w):
        if w in COMPOSE:
            return '-'.join(roman(p) for p in COMPOSE[w])
        Lx = lex.get(fold(w)) or {}
        if 'entries' in Lx:
            return next((e['roman'][0] for e in Lx['entries'] if e.get('roman')), '')
        return (Lx.get('roman') or [''])[0]

    rows, missing = [], []

    def example(word, meaning):
        wr = roman(word)
        if not wr:
            missing.append(word)
        return (f'<span class="uc-ex">{E(word)}</span>'
                + (f'<span class="uc-exr">{E(wr)}</span>' if wr else '')
                + f'<span class="uc-exe">{E(meaning)}</span>')

    for ch, cls, onset, sound, final, word, meaning in CONSONANTS:
        name_rom = f'{onset}{ONSET_TONE[cls]} {roman(word)}'
        # a final of None says nothing: ฌ ends a syllable in too few words to state a rule
        fin = (f'; at the end of a syllable: {final}' if final else
               ('; never ends a syllable' if final == '' and 'OBSOLETE' not in sound
                and ch != 'อ' else ''))
        rows.append((ch, f'{ch} {word}',
                     f'<span class="uc-rm">{E(name_rom)}</span> · “{E(meaning)}”'
                     f'<span class="uc-cls">{cls} class</span><br>{E(sound + fin)}',
                     example(word, meaning), word))
    for shown, name, rom, sound, word, meaning in VOWELS:
        rows.append((shown, name, f'<span class="uc-rm">{E(rom.strip())}</span> · {E(sound)}',
                     example(word, meaning), word))
    for shown, name, nrom, does, word, meaning in SIGNS:
        rows.append((shown, name, f'<span class="uc-rm">{E(nrom)}</span> · {E(does)}',
                     example(word, meaning), word))
    for shown, name, rule, word, meaning in CLASSES:
        rows.append((shown, name, E(rule) + '. ' + E(CLASS_NOTE), example(word, meaning), word))
    for i, w in enumerate(DIGITS):
        rows.append(('๐๑๒๓๔๕๖๗๘๙'[i], w, f'<span class="uc-rm">{i}</span> · the digit {i}, said '
                     f'{E(roman(w))}', example(w, str(i)), w))

    cards = []
    for i, (shown, name, sound, ex, word) in enumerate(rows, 1):
        cards.append({'sub': '', 'fields': {'Letter': E(shown), 'Name': E(name), 'Sound': sound,
                                            'Example': ex, 'Word': E(word)},
                      'id': f'u_thabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two notes share a sound side: the reverse card is unanswerable'
    if missing:
        raise SystemExit('no romanisation for: ' + ' '.join(missing))
    desc = (
        f"The Thai script: {n} notes, in the order a Thai primer teaches it — the 44 consonants in "
        "their traditional order, the vowels, the four tone marks and three other signs, the three "
        "consonant classes that decide a syllable's tone, and the ten Thai digits. The first deck "
        "of the Thai collection. Both directions: see a letter and recall its sound, or see a sound "
        "and recall the letter, each a card with its own schedule. Every consonant is given with "
        "its NAME — Thai letters are named by a word that starts with them (ก ไก่, g as in "
        "chicken) — and the name is how Thais tell apart the letters that sound alike, so the "
        "sound side names it too: five letters say k and six say t. Each consonant shows its "
        "CLASS, mid, high or low, which together with the tone marks decides the tone of every "
        "syllable, and its sound at the start and at the end of a syllable (บ is b at the start "
        "and p at the end). Each vowel is written on ◌, the dotted circle standing for the "
        "consonant it sits on, since a Thai vowel can be written above, below, before or after "
        "its consonant. Every sound is given in the Paiboon romanisation the level decks use — bp "
        "and dt for the unaspirated p and t of spin and stop — and described in English words, "
        "with one everyday word that shows it and a speaker beside the letter and the word. The "
        "sounds are approximations, as every learner's alphabet gives them. Sources: the standard "
        "description of Central Thai; the example words' romanisations are English Wiktionary's, "
        "via the kaikki.org extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'thabc', 'title': 'Thai Alphabet',
        'subtitle': f'{n} letters, vowels, tone marks and digits · both directions, as two cards each',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['thai', 'alphabet', 'script'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Thai letter', 'speechLang': 'th-TH',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Thai-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
