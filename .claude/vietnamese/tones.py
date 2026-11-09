#!/usr/bin/env python3
"""The Vietnamese alphabet-and-tones deck: the six tones and the letters English lacks.

    python3 .claude/vietnamese/tones.py      (after run.py has built lex.json and A1)

Vietnamese is written in the Latin alphabet, so unlike the Hindi or Russian set
there is no script to learn -- but a learner from English meets two things the
alphabet does not tell them: SIX TONES, marked on the vowel, which change the
word (`ma` ghost, `mà` but, `má` cheek or mother, `mả` tomb, `mã` code, `mạ` rice
seedlings), and LETTERS AND PAIRS that do not sound as in English (`đ`, `d`,
`x`, `nh`, `ng`, `ph`, `tr`, and the seven vowels with marks).  This deck is
those, and only those: the letters that sound roughly as in English (b, h, l,
m, n) are left out, and the description says so.

WHAT IS AUTHORED AND WHAT IS READ.  The sound of each tone and letter is
written here, from the standard description of the Hanoi standard (with the
Saigon difference where the two part company: d, gi, r, s, tr, v, and the
hỏi / ngã merger); each claim is the textbook one.  The EXAMPLE WORD's
meaning and its IPA are read off Wiktionary (`lex.json`): the meaning from the
A1 deck's own card where the word is in it, else Wiktionary's first meaning;
the IPA from Wiktionary's Hanoi and Saigon transcriptions.  Nothing about an
example word is typed here except the word.

ONE NOTE, TWO CARDS: the letter or tone -> its sound, and the sound -> the
letter.  Every sound side is unique (asserted), so the reverse card has one
answer.
"""
import html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from vi import fold

CACHE = os.path.abspath(os.path.join(HERE, '..', 'vietnamese-cache'))
DECKS = os.path.abspath(os.path.join(HERE, '..', '..', 'decks'))
OUT = os.path.join(DECKS, 'Vietnamese-Alphabet-and-Tones.folio-deck.json')
DECK = 'viabc'
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'vietabc'
COLOR = '#14659F'
E = html.escape

# (shown, kind, sound, example word)
TONES = [
    ('ma', 'tone: ngang (no mark)', 'level, in the middle of the voice', 'ma'),
    ('mà', 'tone: huyền (grave accent)', 'low and gently falling, often breathy', 'mà'),
    ('má', 'tone: sắc (acute accent)', 'high and rising', 'má'),
    ('mả', 'tone: hỏi (hook above)', 'falling from the middle of the voice, in careful speech rising again; '
     'in the south it dips and rises, the same as ngã', 'mả'),
    ('mã', 'tone: ngã (tilde)', 'rising, broken by a catch in the throat, in the north; in the south the '
     'same as hỏi', 'mã'),
    ('mạ', 'tone: nặng (dot below)', 'low and heavy; in the north short, and cut off with a tightened throat',
     'mạ'),
]
VOWELS = [
    ('a', 'vowel', 'long open a, as in "father" [aː]', 'ba'),
    ('ă', 'vowel', 'short a, cut off quickly [a]', 'ăn'),
    ('â', 'vowel', 'short uh, as in "but" [ə]', 'cần'),
    ('e', 'vowel', 'open e, as in "bed" [ɛ]', 'mẹ'),
    ('ê', 'vowel', 'close e, as in "say" without the glide [e]', 'đêm'),
    ('i / y', 'vowel', 'ee, as in "see" [i]', 'hai'),
    ('o', 'vowel', 'open o, as in "law" [ɔ]', 'khó'),
    ('ô', 'vowel', 'close o, as in "go" without the glide [o]', 'số'),
    ('ơ', 'vowel', 'long uh, as in "sir" without the r [əː]', 'cơm'),
    ('u', 'vowel', 'oo, as in "food" [u]', 'ngủ'),
    ('ư', 'vowel', 'oo said with the lips spread, not rounded [ɨ]', 'mưa'),
]
CONSONANTS = [
    ('đ', 'consonant', 'd, as in "dog", said with the voice going in [ɗ]', 'đi'),
    ('d', 'consonant', 'z, as in "zoo", in the north; y, as in "yes", in the south', 'dễ'),
    ('gi', 'consonant pair', 'the same sound as d: z in the north, y in the south', 'giờ'),
    ('r', 'consonant', 'z in the north; an r, as in "run", in the south', 'rau'),
    ('s', 'consonant', 's, as in "see", in the north; sh, as in "she", in the south', 'sáu'),
    ('x', 'consonant', 's, as in "see", everywhere', 'xe'),
    ('ch', 'consonant pair', 'ch, as in "chin", but softer, with no puff of air [c]', 'chợ'),
    ('tr', 'consonant pair', 'the same as ch in the north; a ch with the tongue curled back in the south', 'trà'),
    ('kh', 'consonant pair', 'a rough h, as in Scottish "loch" [x]', 'khó'),
    ('g / gh', 'consonant', 'g made further back, almost a gargle [ɣ]; gh before e, ê, i', 'ghế'),
    ('ng / ngh', 'consonant pair', 'ng, as in "singer", even at the start of a word [ŋ]; ngh before e, ê, i', 'ngủ'),
    ('nh', 'consonant pair', 'ny, as in "canyon" [ɲ]', 'nhà'),
    ('ph', 'consonant pair', 'f, as in "fun" [f]', 'phở'),
    ('th', 'consonant pair', 't with a puff of air, as in "top" [tʰ]; never as in "thin"', 'thịt'),
    ('t', 'consonant', 't with no puff of air, as in "stop" [t]', 'tám'),
    ('c / k / q', 'consonant', 'k with no puff of air, as in "skin" [k]; k before e, ê, i, y, q before u', 'cá'),
    ('qu', 'consonant pair', 'kw, as in "queen", in the north; often just w in the south', 'quá'),
    ('v', 'consonant', 'v, as in "van", in the north; often y, as in "yes", in the south', 'và'),
]
ROWS = TONES + VOWELS + CONSONANTS


def text(h):
    return re.sub(r'<[^>]+>', '', h)


def a1_gloss():
    out = {}
    p = os.path.join(DECKS, 'Vietnamese-A1.folio-deck.json')
    for c in json.load(open(p, encoding='utf-8'))['cards']:
        F = c['fields']
        m = re.search(r'<(?:div class="uc-gl"|li)>(.*?)</', F['English'])
        if m:
            out[fold(F['Word'])] = html.unescape(m.group(1))
    return out


def main():
    lex = json.load(open(os.path.join(CACHE, 'lex.json'), encoding='utf-8'))
    a1 = a1_gloss()
    cards, sounds = [], set()
    for i, (shown, kind, sound, ex) in enumerate(ROWS, 1):
        k = fold(ex)
        L = lex[k]
        ent = L['entries'][0]
        mean = a1.get(k) or next(g['g'] for e in L['entries'] for g in e['glosses'] if not g['weak'])
        ipa = ''.join(f'<span>{lbl} {E(v)}</span>' for lbl, v in
                      (('Hanoi', ent['hn']), ('Saigon', ent['sg'] if ent['sg'] != ent['hn'] else ''))
                      if v)
        side = f'<div class="uc-pos">{E(kind)}</div><div class="uc-gl">{E(sound)}</div>'
        assert side not in sounds, shown
        sounds.add(side)
        cards.append({'id': f'u_{DECK}_{i}', 'type': TYPE_ID, 'sub': '', 'fields': {
            'Letter': E(shown), 'Word': ex,
            'Sound': side,
            'Example': f'<b>{E(ex)}</b> <span class="uc-exe">{E(mean)}</span>',
            'IPA': ipa,
        }})
    CSS = open(os.path.join(HERE, 'card.css'), encoding='utf-8').read()
    FRONT_L = '<div class="uc-word">{{Letter}}</div>'
    BACK_L = ('{{FrontSide}}<hr><div class="uc-field">{{Sound}}</div>'
              '<div class="uc-exs uc-exz"><span class="uc-tts uc-exsay" data-say="{{Word}}"></span>{{Example}}</div>{{#IPA}}<div class="uc-ipa">{{IPA}}</div>{{/IPA}}')
    FRONT_S = '<div class="uc-ask">Which letter or tone?</div><div class="uc-field">{{Sound}}</div>'
    BACK_S = ('{{FrontSide}}<hr><div class="uc-word">{{Letter}}</div>'
              '<div class="uc-exs uc-exz"><span class="uc-tts uc-exsay" data-say="{{Word}}"></span>{{Example}}</div>{{#IPA}}<div class="uc-ipa">{{IPA}}</div>{{/IPA}}')
    n = len(cards)
    desc = (
        "The first deck of the Vietnamese collection, and a short one. Vietnamese is written in the "
        "Latin alphabet, so there is no script to learn, but two things in it do not work as in "
        "English. The first is the TONES: every syllable carries one of six, marked on its vowel, and "
        "the tone changes the word — ma ghost, mà but, má mother (in the south), mả tomb, mã code, "
        "mạ rice seedlings. The second is a set of letters and letter pairs that do not sound as an English "
        "reader expects: the seven vowels with marks (ă â ê ô ơ ư, and đ), and d, gi, r, s, x, ch, "
        "tr, kh, g, ng, nh, ph, th, t, c and qu. The letters that sound roughly as in English (b, h, "
        "l, m, n) are left out. Each card asks both ways — the letter or tone, then its sound; the "
        "sound, then the letter — and gives one word that shows it, with its meaning and its "
        "pronunciation. The sounds described are those of the Hanoi standard, with the Saigon "
        "difference where the two part company: in the south, d, gi and v are said as y, r as an "
        "English r, s as sh, and the hỏi and ngã tones are one tone. Every word in the A1 deck names "
        "its tones beneath it, so this deck is the key to them. Sources: the sounds are the standard "
        "description of Vietnamese phonology; the example words' meanings and their IPA are English "
        "Wiktionary's, via the kaikki.org extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': DECK, 'title': 'Vietnamese Alphabet and Tones',
        'subtitle': f'{n} tones, letters and letter pairs · both directions, as two cards each',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['vietnamese', 'alphabet', 'tones', 'pronunciation'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Vietnamese alphabet and tones', 'speechLang': 'vi-VN',
            'fields': ['Letter', 'Word', 'Sound', 'Example', 'IPA'],
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    with open(OUT, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print(f'  wrote {OUT}\n  notes {n} = cards {n * 2} | bytes {os.path.getsize(OUT)}')


if __name__ == '__main__':
    main()
