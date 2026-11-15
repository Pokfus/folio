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
level and commonest first, with its romaji and first meaning: read straight out of the built decks.  IT IS
WRITTEN IN KANA, the kana being taught picked out, with the word's usual spelling beside its meaning (Nov 2026):
が used to be shown "as in 学校", the が nowhere but in the small furigana over a kanji the learner cannot read
yet -- 83 of the 98 hiragana examples were like that.  And THE KANA MUST BE SAID AS THE CARD SAYS IT: a word where
a small ゃ, ゅ or ょ follows is the combination, not the kana (き was shown "as in 今日 kyou", ち "as in ちょっと").

THE ORDER IS THE CHART'S, WITH THE RARE ONES LAST (Nov 2026): the basic chart, the voiced kana, the small っ (and
katakana's ー), then the combinations -- and after them the kana a beginner can leave: ぢ and づ (and katakana's
ヲ), which are almost always written another way, and the combinations no word of the JLPT lists contains.  The
card ids are pinned to the kana (`common.note_ids`), so the re-ordering moved nobody's progress.

TWO THINGS ARE ON THE BACK ONLY, never on the romaji → kana question, which they would answer: a TIP where the
kana is not said as it is spelled (は and へ as particles, う and い lengthening the vowel before them), and the
kana it is most often MISTAKEN FOR (シ / ツ, ソ / ン, ぬ / め).  The look-alike table is a judgement of shape,
not a fact from a source; the tips are the orthography's own rules, the ones the level decks' romaji relies on.
"""
import html, json, os, re
from common import DECKS, STAMP, romaji, hira2kata, kata2hira, note_ids

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

# not said as spelled: shown on the back of both cards
TIPS = {
    'は': 'as the topic particle it is said “wa”: わたしは watashi wa',
    'へ': 'as the direction particle it is said “e”: がっこうへ gakkou e',
    'う': 'after an “o” or “u” sound it usually lengthens that vowel instead: がっこう is said “gakkō”',
    'い': 'after an “e” sound it usually lengthens that vowel instead: せんせい is said “sensē”',
}
# kana most often mistaken for one another, by shape
LOOK = ['あお', 'いり', 'きさ', 'さち', 'ぬめ', 'ねれわ', 'はほ', 'るろ',
        'シツ', 'ソン', 'ウワ', 'クケ', 'コユ', 'スヌ', 'チテ']
RARE = set('ぢづヂヅヲ')
SMALL = 'ゃゅょャュョぁぃぅぇぉァィゥェォ'

TYPE_ID = 'kana'
FIELDS = ['Kana', 'Romaji', 'Note', 'Pair', 'Examples', 'Tip', 'Like']
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
.uc-egw b { font-weight: 600; color: var(--zh, #C8453C); }
.uc-egr { font-size: 13px; font-style: italic; opacity: 0.7; }
.uc-egg { font-size: 13px; opacity: 0.62; }
.uc-tip { margin: 10px auto 0; max-width: 30em; font-size: 13.5px; line-height: 1.5; opacity: 0.8; }
.uc-like { margin-top: 8px; font-size: 13px; opacity: 0.7; }
.uc-like b { font-size: 20px; font-weight: 400; margin: 0 3px 0 6px; }
"""
SAY = '<span class="uc-tts uc-say" data-say="{{Kana}}"></span>'  # beside the romaji on card 1, the kana on card 2
EXTRA = ('{{#Tip}}<div class="uc-tip">{{Tip}}</div>{{/Tip}}{{#Pair}}<div class="uc-pair">{{Pair}}</div>{{/Pair}}'
         '{{#Like}}<div class="uc-like">{{Like}}</div>{{/Like}}{{#Examples}}<div class="uc-eg">{{Examples}}</div>{{/Examples}}')
BACK_TAIL = '{{#Note}}<div class="uc-note">{{Note}}</div>{{/Note}}' + EXTRA


def cards_for(script):
    ask = 'Write it in ' + script
    return [{'name': script.capitalize() + ' → romaji', 'front': '<div class="uc-kana">{{Kana}}</div>',
             'back': '{{FrontSide}}<hr><div class="uc-romaji">{{Romaji}}' + SAY + '</div>' + BACK_TAIL},
            {'name': 'Romaji → ' + script, 'front': '<div class="uc-ask">' + ask + '</div><div class="uc-romaji">{{Romaji}}</div>'
                                                      '{{#Note}}<div class="uc-note">{{Note}}</div>{{/Note}}',
             'back': '{{FrontSide}}<hr><div class="uc-kana">{{Kana}}' + SAY + '</div>' + EXTRA}]


def vocab():
    """(reading, usual spelling, romaji, first meaning) for every JLPT word, lowest level and commonest first."""
    out = []
    for lv in LEVELS:
        p = os.path.join(DECKS, FILE(lv))
        if not os.path.exists(p):
            continue
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            f = c['fields']
            # the first gloss: unescaped BEFORE it is cut at the semicolon, or "one&#x27;s" is cut inside its entity
            gl = html.unescape(re.sub(r'<[^>]+>', '', re.search(r'<div class="uc-gl">(.*?)</div>', f['English']).group(1)))
            gl = html.escape(gl.split(';')[0].strip(), quote=True)
            out.append((re.sub(r'<[^>]+>', '', f['Reading']), re.sub(r'<rt>.*?</rt>|<[^>]+>', '', f['Furigana']),
                        f['Romaji'], gl))
    return out


def example(kana, words, katakana):
    def at(rd, i):
        """Is the kana at position i of the reading said as the card says it?  Not where a small kana follows a
        single kana (きょ is not き), and not a は or へ a word ends on (こんにちは)."""
        if rd[i:i + len(kana)] != kana:
            return False
        nxt = rd[i + len(kana):i + len(kana) + 1]
        if len(kana) == 1 and nxt and nxt in SMALL:
            return False
        return True

    def pick(where):
        for rd, sp, ro, gl in words:
            if katakana != any('ァ' <= ch <= 'ヺ' for ch in rd) or not ro:
                continue
            i = where(rd)
            if i is None:
                continue
            shown = rd[:i] + '<b>%s</b>' % kana + rd[i + len(kana):]
            return ('<span class="uc-egl">as in</span><div class="uc-egw">%s</div><div class="uc-egr">%s</div>'
                    '<div class="uc-egg">%s%s</div>' % (shown, ro, gl, ' · written %s' % sp if sp != rd else ''))
        return ''
    first = lambda rd: 0 if at(rd, 0) else None
    inside = lambda rd: next((i for i in range(1, len(rd)) if at(rd, i)), None)
    if kana in ('ん', 'ン', 'っ', 'ッ', 'ー'):
        return pick(inside)
    return pick(first) or pick(inside)


def look_alikes(k):
    for grp in LOOK:
        if k in grp:
            return 'easily mistaken for' + ' ·'.join(' <b>%s</b>%s' % (o, romaji(o)) for o in grp if o != k)
    return ''


def build(script):
    words = vocab()
    kat = script == 'katakana'
    conv = hira2kata if kat else (lambda s: s)
    other = (lambda s: kata2hira(s)) if kat else hira2kata
    rows = ([conv(k) for k in BASIC + VOICED] + [conv('っ')] + (['ー'] if kat else [])
            + [conv(k) for k in YOON] + (EXTRA_K if kat else []))
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
        notes.append({'Kana': k, 'Romaji': ro, 'Note': note, 'Pair': pair, 'Examples': example(k, words, kat),
                      'Tip': TIPS.get(k, ''), 'Like': look_alikes(k)})
    # THE RARE ONES LAST, in chart order: the kana almost always written another way, and the combinations (not
    # the basic or voiced kana, which are the chart) that no word of the lists contains
    core = set(conv(k) for k in BASIC + VOICED) | {conv('っ'), 'ー'}
    late = lambda n: n['Kana'] in RARE or (n['Kana'] not in core and not n['Examples'])
    return [n for n in notes if not late(n)] + [n for n in notes if late(n)], sum(1 for n in notes if late(n))


PACE = ("At the app's default of five new cards a day the {c} cards take about {d} days; raising this deck's "
        "daily new-card limit to fifteen or twenty in its options brings that to {d3} or {d4}. The reading cards "
        "({s} → romaji) all come before the writing cards unless the deck is set to deal both directions together.")
DESC = {
 'hiragana': ("The first thing to learn in Japanese, before any word: hiragana, the syllabary Japanese uses for its "
              "grammar — particles, verb endings — and for words with no kanji, and the script of every reading. "
              "{n} notes, each with TWO cards (hiragana → romaji, romaji → hiragana), each scheduled on its own: the 46 "
              "of the basic chart, the 25 voiced with ゛ and ゜, the small っ that doubles a consonant, and the 33 "
              "combinations with a small ゃ, ゅ or ょ — in that order, with the {late} a beginner can leave for last "
              "at the end (ぢ and づ, almost always written じ and ず, and the combinations no word of the JLPT lists "
              "contains). The romaji is Hepburn. Three sounds are written two ways (じ and ぢ, ず and づ, お and を), "
              "and the card for the rarer one says which it asks for. The back shows the matching katakana, the "
              "kana it is most easily mistaken for (ぬ and め, は and ほ), a note where the kana is not said as it is "
              "spelled (は and へ as particles, う and い lengthening a vowel), and a word from the JLPT N5 and N4 "
              "decks written in kana with the kana picked out, its usual spelling beside its meaning. {pace} Study "
              "before the first words and JLPT N5. — Example words: Jonathan Waller's JLPT lists (CC BY) and JMdict "
              "(EDRDG, CC BY-SA 4.0)."),
 'katakana': ("The second syllabary, learnt after hiragana: katakana, used for words borrowed from other languages "
              "(コーヒー, テレビ), foreign names, and emphasis. {n} notes, each with TWO cards (katakana → romaji, "
              "romaji → katakana): the same 104 sounds as the hiragana deck, the long-vowel mark ー, and the 15 "
              "combinations used only to spell loanwords (ファ, ティ, ウィ…) — the basic chart first, then the voiced "
              "kana, ッ and ー, then the combinations, with the {late} a beginner can leave for last at the end (ヲ, "
              "ヂ and ヅ, and the combinations no loanword of the JLPT lists contains). The romaji is Hepburn. The "
              "back shows the matching hiragana, the kana it is most easily mistaken for (シ and ツ, ソ and ン) and, "
              "where the JLPT decks have one, a loanword with the kana picked out, its reading and meaning. {pace} "
              "Study after hiragana; the first words and JLPT N5 can begin alongside it. — Example words: Jonathan "
              "Waller's JLPT lists (CC BY) and JMdict (EDRDG, CC BY-SA 4.0)."),
}
FILES = {'hiragana': 'Japanese-Hiragana.folio-deck.json', 'katakana': 'Japanese-Katakana.folio-deck.json'}
SUBS = {'hiragana': 'The {n} hiragana — start here, before any word',
        'katakana': 'The {n} katakana, for loanwords — study after hiragana'}

if __name__ == '__main__':
    for script in ('hiragana', 'katakana'):
        notes, late = build(script)
        did = 'ja' + script[:4]
        nums = note_ids(did, [x['Kana'] for x in notes])
        cards = [{'id': 'u_%s_%d' % (did, num), 'num': str(i), 'type': TYPE_ID, 'fields': x}
                 for i, (x, num) in enumerate(zip(notes, nums), 1)]
        n = len(cards)
        days = lambda per: -(-2 * n // per)
        pace = PACE.format(c=2 * n, d=days(5), d3=days(15), d4=days(20), s=script)
        meta = {'id': did, 'title': 'Japanese — ' + script.capitalize(), 'subtitle': SUBS[script].format(n=n),
                'desc': DESC[script].format(n=n, late=late, pace=pace), 'author': '', 'language': 'en', 'color': '#BC002D',
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
        print('  wrote %s: %d notes, %d without an example, %d left for last, %d bytes'
              % (FILES[script], n, sum(1 for c in cards if not c['fields']['Examples']), late, os.path.getsize(out)))
