#!/usr/bin/env python3
"""The Korean alphabet deck:  python3 build_hangul.py   (after the three stage decks, whose words are the examples)

Korean cannot be read at all until hangul is learnt, so this is the rung below Stage A and the catalogue ranks it
first (its title says "Alphabet").  A note is one letter (jamo) of the forty in use: the fourteen basic consonants,
the five doubled (tense) ones, the ten basic vowels and the eleven compound vowels.  The letters, their names and
their Revised Romanization are the writing system and the government's romanization rules, not anyone's data.

A CONSONANT HAS TWO ROMANIZATIONS where its sound changes at the end of a syllable (ㄱ is g at the start, k at
the end; ㄹ is r and l; ㅇ is silent at the start and ng at the end), and the card says both -- which is also what
keeps the English → hangul card answerable: no two letters share a romanization side.

THE EXAMPLE is a word from the stage decks whose first syllable starts with the consonant (or holds the vowel),
Stage A first and commonest first, with its romanization and first meaning: read out of the built decks.
"""
import html, json, os, re
from ko import DECKS, STAMP, COLOR, split, join

E = lambda s: html.escape(s, quote=True)
FILE = 'Korean-Alphabet-Hangul.folio-deck.json'
STAGES = ['A', 'B', 'C']

# letter, romanization at the start of a syllable, at the end ('' where it does not end one), its name
CONS = [('ㄱ', 'g', 'k', '기역'), ('ㄴ', 'n', 'n', '니은'), ('ㄷ', 'd', 't', '디귿'), ('ㄹ', 'r', 'l', '리을'),
        ('ㅁ', 'm', 'm', '미음'), ('ㅂ', 'b', 'p', '비읍'), ('ㅅ', 's', 't', '시옷'), ('ㅇ', '', 'ng', '이응'),
        ('ㅈ', 'j', 't', '지읒'), ('ㅊ', 'ch', 't', '치읓'), ('ㅋ', 'k', 'k', '키읔'), ('ㅌ', 't', 't', '티읕'),
        ('ㅍ', 'p', 'p', '피읖'), ('ㅎ', 'h', 't', '히읗')]
TENSE = [('ㄲ', 'kk', 'k', '쌍기역'), ('ㄸ', 'tt', '', '쌍디귿'), ('ㅃ', 'pp', '', '쌍비읍'), ('ㅆ', 'ss', 't', '쌍시옷'),
         ('ㅉ', 'jj', '', '쌍지읒')]
VOWELS = [('ㅏ', 'a'), ('ㅑ', 'ya'), ('ㅓ', 'eo'), ('ㅕ', 'yeo'), ('ㅗ', 'o'), ('ㅛ', 'yo'), ('ㅜ', 'u'), ('ㅠ', 'yu'),
          ('ㅡ', 'eu'), ('ㅣ', 'i')]
COMPOUND = [('ㅐ', 'ae', 'ㅏ + ㅣ'), ('ㅒ', 'yae', 'ㅑ + ㅣ'), ('ㅔ', 'e', 'ㅓ + ㅣ'), ('ㅖ', 'ye', 'ㅕ + ㅣ'),
            ('ㅘ', 'wa', 'ㅗ + ㅏ'), ('ㅙ', 'wae', 'ㅗ + ㅐ'), ('ㅚ', 'oe', 'ㅗ + ㅣ'), ('ㅝ', 'wo', 'ㅜ + ㅓ'),
            ('ㅞ', 'we', 'ㅜ + ㅔ'), ('ㅟ', 'wi', 'ㅜ + ㅣ'), ('ㅢ', 'ui', 'ㅡ + ㅣ')]

TYPE_ID = 'hangul'
FIELDS = ['Letter', 'Roman', 'Name', 'Note', 'Say', 'Examples']
CSS = """.card { text-align: center; font-size: 17px; line-height: 1.6; }
.uc-ask { margin-bottom: 14px; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.55; }
.uc-kana { font-size: 72px; line-height: 1.2; }
.uc-say { margin-left: 14px; vertical-align: middle; font-size: 15px; }
.uc-romaji { font-size: 26px; letter-spacing: 0.02em; }
.uc-name { margin-top: 4px; font-size: 15px; opacity: 0.75; }
.uc-note { margin-top: 4px; font-size: 13px; opacity: 0.65; }
.uc-eg { margin: 14px auto 0; width: fit-content; max-width: 100%; padding: 9px 15px; border: 1px solid var(--rule, rgba(0,0,0,0.12)); border-radius: 11px; }
.uc-egl { display: block; font-size: 9.5px; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.55; }
.uc-egw { font-size: 26px; line-height: 1.5; }
.uc-egw b { font-weight: 600; color: var(--zh, #C8453C); }
.uc-egr { font-size: 13px; font-style: italic; opacity: 0.7; }
.uc-egg { font-size: 13px; opacity: 0.62; }
"""
SAY = '<span class="uc-tts uc-say" data-say="{{Say}}"></span>'
TAIL = ('{{#Name}}<div class="uc-name">{{Name}}</div>{{/Name}}{{#Note}}<div class="uc-note">{{Note}}</div>{{/Note}}'
        '{{#Examples}}<div class="uc-eg">{{Examples}}</div>{{/Examples}}')
CARDS = [{'name': 'Hangul → romanization', 'front': '<div class="uc-kana">{{Letter}}</div>',
          'back': '{{FrontSide}}<hr><div class="uc-romaji">{{Roman}}' + SAY + '</div>' + TAIL},
         {'name': 'Romanization → hangul',
          'front': '<div class="uc-ask">Write it in hangul</div><div class="uc-romaji">{{Roman}}</div>',
          'back': '{{FrontSide}}<hr><div class="uc-kana">{{Letter}}' + SAY + '</div>' + TAIL}]


def vocab():
    """(word, romanization, first meaning) of every stage word, Stage A first and in deck (frequency) order."""
    out = []
    for st in STAGES:
        p = os.path.join(DECKS, 'Korean-Stage-%s.folio-deck.json' % st)
        if not os.path.exists(p):
            raise SystemExit('build the stage decks first: %s is missing' % p)
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            f = c['fields']
            m = re.search(r'<(?:div class="uc-gl"|li)>(.*?)</(?:div|li)>', f['English'])
            gl = re.sub(r'\s*\([^)]*\)', '', html.unescape(re.sub(r'<[^>]+>', '', m.group(1)))).split(';')[0].strip() if m else ''
            out.append((html.unescape(f['Word']), html.unescape(f['Roman']), gl))
    return out


def example(test, words):
    for w, ro, gl in words:
        if not w or not ro or ' ' in w:
            continue
        s = split(w[0])
        if s and test(s):
            return ('<span class="uc-egl">as in</span><div class="uc-egw"><b>%s</b>%s</div><div class="uc-egr">%s</div>'
                    '<div class="uc-egg">%s</div>' % (E(w[0]), E(w[1:]), E(ro), E(gl)))
    return ''


def build():
    words = vocab()
    notes = []
    for letter, ini, fin, name in CONS + TENSE:
        if not ini:
            ro = 'silent · ng at the end'
            note = 'holds the place of a missing consonant at the start of a syllable (아 a); sounds ng at the end (강 gang)'
        elif fin and fin != ini:
            ro = '%s · %s at the end' % (ini, fin)
            note = 'at the end of a syllable it sounds %s' % fin
        else:
            ro = ini
            note = '' if fin else 'never ends a syllable'
        if letter in dict((t[0], 1) for t in TENSE):
            note = ('a tense (doubled) consonant, said with a tight throat and no puff of air' +
                    ('; ' + note if note else ''))
        notes.append({'Letter': letter, 'Roman': E(ro), 'Name': E(name), 'Note': E(note), 'Say': E(name),
                      'Examples': example(lambda s, l=letter: s[0] == l, words)})
    for letter, ro in VOWELS:
        notes.append({'Letter': letter, 'Roman': E(ro), 'Name': '', 'Note': E('written with a silent ㅇ when it starts a '
                      'syllable: %s' % join('ㅇ', letter)), 'Say': join('ㅇ', letter),
                      'Examples': example(lambda s, l=letter: s[1] == l, words)})
    for letter, ro, parts in COMPOUND:
        note = 'built from %s' % parts
        if letter in ('ㅐ', 'ㅔ'):
            note += '; ㅐ and ㅔ sound alike in most of Seoul\'s speech today'
        if letter in ('ㅙ', 'ㅚ', 'ㅞ'):
            note += '; ㅙ, ㅚ and ㅞ sound nearly alike'
        notes.append({'Letter': letter, 'Roman': E(ro), 'Name': '', 'Note': E(note), 'Say': join('ㅇ', letter),
                      'Examples': example(lambda s, l=letter: s[1] == l, words)})
    return notes


DESC = ("The first thing to learn in Korean, before any word: hangul, the alphabet King Sejong's scholars "
        "promulgated in 1446, in which every syllable is a block of letters (한 = ㅎ + ㅏ + ㄴ). {n} notes, one per "
        "letter in use, each with TWO cards (hangul → romanization, romanization → hangul), each scheduled on its "
        "own: the fourteen basic consonants, the five doubled (tense) ones, the ten basic vowels and the eleven "
        "compound vowels. The romanization is the Revised Romanization of Korean, the official system, and a "
        "consonant whose sound changes at the end of a syllable gives both (ㄱ is g, and k at the end). Each card "
        "gives the letter's Korean name or how a vowel is written on its own, and a word from the Stage A–C decks "
        "that begins with the letter, with its romanization and meaning. Study before Stage A. — Example words: the "
        "National Institute of the Korean Language's vocabulary list for learners (KOGL Type 1), meanings from "
        "English Wiktionary (CC BY-SA 4.0) and KRDict (NIKL, CC BY-SA 2.0 KR).")

if __name__ == '__main__':
    notes = build()
    cards = [{'id': 'u_korhangul_%d' % i, 'num': str(i), 'type': TYPE_ID, 'fields': n} for i, n in enumerate(notes, 1)]
    n = len(cards)
    seen = {}
    for c in cards:
        if c['fields']['Roman'] in seen:
            raise SystemExit('two letters with one romanization side: %s %s' % (seen[c['fields']['Roman']], c['fields']['Letter']))
        seen[c['fields']['Roman']] = c['fields']['Letter']
    meta = {'id': 'korhangul', 'title': 'Korean Alphabet (Hangul)',
            'subtitle': 'The %d letters of hangul — start here, before any word' % n,
            'desc': DESC.format(n=n), 'author': '', 'language': 'en', 'color': COLOR,
            'tags': ['korean', 'hangul', '한글', 'alphabet', 'writing'], 'glossMode': 'site',
            'types': {TYPE_ID: {'id': TYPE_ID, 'name': 'Korean alphabet', 'speechLang': 'ko-KR', 'fields': FIELDS,
                                'cards': CARDS, 'css': CSS}},
            'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None}
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.join(DECKS, FILE)
    json.dump(deck, open(out, 'w', encoding='utf-8'), ensure_ascii=False)
    print('  wrote %s: %d notes, %d without an example, %d bytes'
          % (FILE, n, sum(1 for c in cards if not c['fields']['Examples']), os.path.getsize(out)))
