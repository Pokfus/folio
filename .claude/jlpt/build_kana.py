#!/usr/bin/env python3
"""The two kana decks:  python3 build_kana.py   (after the JLPT decks, whose words are the examples)

Japanese cannot be read at all until its two syllabaries are learnt, so these are the rung below N5 and the
catalogue ranks them first.  A note is one kana: the 46 of the basic chart, the 25 with dakuten or handakuten,
the 33 combinations with a small や/ゆ/よ, and the small つ; the katakana deck adds the long-vowel mark and the
combinations loanwords are spelled with.  The kana themselves are the writing system, not anyone's data.

THE ROMAJI IS HEPBURN, the same `romaji()` the vocabulary decks use.  Three sounds are written by two kana
(じ / ぢ, ず / づ, お / を), so the English → kana card for the rarer one names which it asks for -- otherwise
"ji" would have two right answers and the reverse card none.

THE EXAMPLE is a word from the JLPT decks that begins with the kana (or, failing that, contains it), lowest
level and commonest first, with its furigana, romaji and first meaning: read straight out of the built decks.
"""
import json, os, re
from common import DECKS, STAMP, romaji, hira2kata, kata2hira

LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1']
FILE = lambda lv: 'JLPT-%s-Japanese.folio-deck.json' % lv.upper()

BASIC = list('あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん')
VOICED = list('がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ')
YOON = [a + b for a in 'きしちにひみりぎじびぴ' for b in 'ゃゅょ']
EXTRA_K = ['ヴ', 'ファ', 'フィ', 'フェ', 'フォ', 'ティ', 'ディ', 'トゥ', 'ドゥ', 'ウィ', 'ウェ', 'ウォ', 'シェ', 'ジェ', 'チェ']
# the second kana of each pair that shares a sound with a commoner one, and what tells it apart
SAME = {'ぢ': 'the voiced form of ち — usually written じ', 'づ': 'the voiced form of つ — usually written ず',
        'を': 'the object particle, sometimes written wo', 'ヂ': 'the voiced form of チ — usually written ジ',
        'ヅ': 'the voiced form of ツ — usually written ズ', 'ヲ': 'sometimes written wo; rare in katakana'}

TYPE_ID = 'kana'
FIELDS = ['Kana', 'Romaji', 'Note', 'Pair', 'Examples']
CSS = """.card { text-align: center; font-size: 17px; line-height: 1.6; }
.uc-ask { margin-bottom: 14px; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.55; }
.uc-kana { font-size: 72px; line-height: 1.2; }
.uc-say { margin-left: 14px; vertical-align: middle; font-size: 15px; }
.uc-romaji { font-size: 30px; letter-spacing: 0.04em; }
.uc-note { margin-top: 4px; font-size: 13px; opacity: 0.65; }
.uc-pair { margin-top: 10px; font-size: 14px; opacity: 0.75; }
.uc-pair b { font-size: 22px; font-weight: 400; margin-left: 6px; }
.uc-eg { margin: 14px auto 0; width: fit-content; max-width: 100%; padding: 9px 15px; border: 1px solid var(--rule, rgba(0,0,0,0.12)); border-radius: 11px; }
.uc-egl { display: block; font-size: 9.5px; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.55; }
.uc-egw { font-size: 24px; line-height: 1.7; }
.uc-egw rt { font-size: 0.45em; opacity: 0.75; }
.uc-egr { font-size: 13px; font-style: italic; opacity: 0.7; }
.uc-egg { font-size: 13px; opacity: 0.62; }
"""
SAY = '<span class="uc-tts uc-say" data-say="{{Kana}}"></span>'  # beside the romaji on card 1, the kana on card 2
BACK_TAIL = ('{{#Note}}<div class="uc-note">{{Note}}</div>{{/Note}}'
             '{{#Pair}}<div class="uc-pair">{{Pair}}</div>{{/Pair}}{{#Examples}}<div class="uc-eg">{{Examples}}</div>{{/Examples}}')


def cards_for(script):
    ask = 'Write it in ' + script
    return [{'name': script.capitalize() + ' → romaji', 'front': '<div class="uc-kana">{{Kana}}</div>',
             'back': '{{FrontSide}}<hr><div class="uc-romaji">{{Romaji}}' + SAY + '</div>' + BACK_TAIL},
            {'name': 'Romaji → ' + script, 'front': '<div class="uc-ask">' + ask + '</div><div class="uc-romaji">{{Romaji}}</div>'
                                                      '{{#Note}}<div class="uc-note">{{Note}}</div>{{/Note}}',
             'back': '{{FrontSide}}<hr><div class="uc-kana">{{Kana}}' + SAY + '</div>'
                     '{{#Pair}}<div class="uc-pair">{{Pair}}</div>{{/Pair}}{{#Examples}}<div class="uc-eg">{{Examples}}</div>{{/Examples}}'}]


def vocab():
    """(reading, furigana html, romaji, first meaning) for every JLPT word, lowest level and commonest first."""
    out = []
    for lv in LEVELS:
        p = os.path.join(DECKS, FILE(lv))
        if not os.path.exists(p):
            continue
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            f = c['fields']
            gl = re.sub(r'<[^>]+>', '', re.search(r'<div class="uc-gl">(.*?)</div>', f['English']).group(1)).split(';')[0]
            out.append((re.sub(r'<[^>]+>', '', f['Reading']), f['Furigana'], f['Romaji'], gl))
    return out


def example(kana, words, katakana):
    def pick(test):
        for rd, fu, ro, gl in words:
            if katakana != any('ァ' <= ch <= 'ヺ' for ch in rd):
                continue
            if test(rd):
                return ('<span class="uc-egl">as in</span><div class="uc-egw">%s</div><div class="uc-egr">%s</div>'
                        '<div class="uc-egg">%s</div>' % (fu.replace(kana, '<b>%s</b>' % kana) if '<ruby>' not in fu else fu, ro, gl))
        return ''
    if kana in ('ん', 'ン', 'っ', 'ッ', 'ー'):
        return pick(lambda rd: kana in rd[1:])
    return pick(lambda rd: rd.startswith(kana)) or pick(lambda rd: kana in rd)


def build(script):
    words = vocab()
    kat = script == 'katakana'
    conv = hira2kata if kat else (lambda s: s)
    other = (lambda s: kata2hira(s)) if kat else hira2kata
    rows = [conv(k) for k in BASIC + VOICED + YOON] + [conv('っ')] + (['ー'] + EXTRA_K if kat else [])
    notes = []
    for k in rows:
        if k in ('っ', 'ッ'):
            ro, note = '(small tsu)', 'doubles the consonant after it: きって kitte, ' + ('ベッド beddo' if kat else 'がっこう gakkou')
        elif k == 'ー':
            ro, note = '(long mark)', 'lengthens the vowel before it: コーヒー kōhī'
        else:
            ro = romaji(k)
            note = SAME.get(k, '')
            if k in ('ん', 'ン'):
                ro = 'n'
        pair = ''
        if k not in EXTRA_K and k != 'ー':
            pair = ('in hiragana' if kat else 'in katakana') + ' <b>%s</b>' % other(k)
        notes.append({'Kana': k, 'Romaji': ro, 'Note': note, 'Pair': pair, 'Examples': example(k, words, kat)})
    return notes


DESC = {
 'hiragana': ("The first thing to learn in Japanese, before any word: hiragana, the syllabary Japanese uses for its "
              "grammar — particles, verb endings — and for words with no kanji, and the script of every reading. "
              "{n} notes, each with TWO cards (hiragana → romaji, romaji → hiragana), each scheduled on its own: the 46 "
              "of the basic chart, the 25 voiced with ゛ and ゜, the 33 combinations with a small ゃ, ゅ or ょ, and "
              "the small っ that doubles a consonant. The romaji is Hepburn. Three sounds are written two ways (じ and "
              "ぢ, ず and づ, お and を), and the card for the rarer one says which it asks for. Each card shows the "
              "matching katakana and a word that begins with the kana, taken from the JLPT N5 and N4 decks, with its "
              "reading and meaning. Study before JLPT N5. — Example words: Jonathan Waller's JLPT lists (CC BY) and "
              "JMdict (EDRDG, CC BY-SA 4.0), furigana JmdictFurigana (CC BY-SA 4.0)."),
 'katakana': ("The second syllabary, learnt after hiragana: katakana, used for words borrowed from other languages "
              "(コーヒー, テレビ), foreign names, and emphasis. {n} notes, each with TWO cards (katakana → romaji, "
              "romaji → katakana): the same 104 sounds as the hiragana deck, the long-vowel mark ー, and the 15 "
              "combinations used only to spell loanwords (ファ, ティ, ウィ…). The romaji is Hepburn. Each card shows "
              "the matching hiragana and, where the JLPT decks have one, a loanword that begins with the kana, with "
              "its reading and meaning. Study before JLPT N5, after hiragana. — Example words: Jonathan Waller's JLPT "
              "lists (CC BY) and JMdict (EDRDG, CC BY-SA 4.0)."),
}
FILES = {'hiragana': 'Japanese-Hiragana.folio-deck.json', 'katakana': 'Japanese-Katakana.folio-deck.json'}
SUBS = {'hiragana': 'The {n} hiragana — start here, before any word',
        'katakana': 'The {n} katakana, for loanwords — study after hiragana'}

if __name__ == '__main__':
    for script in ('hiragana', 'katakana'):
        notes = build(script)
        did = 'ja' + script[:4]
        cards = [{'id': 'u_%s_%d' % (did, i), 'num': str(i), 'type': TYPE_ID, 'fields': n}
                 for i, n in enumerate(notes, 1)]
        n = len(cards)
        meta = {'id': did, 'title': 'Japanese — ' + script.capitalize(), 'subtitle': SUBS[script].format(n=n),
                'desc': DESC[script].format(n=n), 'author': '', 'language': 'en', 'color': '#BC002D',
                'tags': ['japanese', script, 'kana', 'writing'], 'glossMode': 'site',
                'types': {TYPE_ID: {'id': TYPE_ID, 'name': 'Japanese kana', 'speechLang': 'ja-JP', 'fields': FIELDS,
                                    'cards': cards_for(script), 'css': CSS}},
                'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None}
        deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
        seen = {}
        for c in cards:
            key = c['fields']['Romaji'] + '|' + c['fields']['Note']
            if key in seen:
                raise SystemExit('two kana with one romaji side: %s %s' % (seen[key], c['fields']['Kana']))
            seen[key] = c['fields']['Kana']
        out = os.path.join(DECKS, FILES[script])
        json.dump(deck, open(out, 'w', encoding='utf-8'), ensure_ascii=False)
        print('  wrote %s: %d notes, %d without an example, %d bytes'
              % (FILES[script], n, sum(1 for c in cards if not c['fields']['Examples']), os.path.getsize(out)))
