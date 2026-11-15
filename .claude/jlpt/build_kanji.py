#!/usr/bin/env python3
"""The N5 kanji deck:  python3 build_kanji.py   (after the first-words deck and N5, whose words are its examples)

WHY IT EXISTS (Nov 2026).  The level decks teach a kanji only in passing, as a row on the back of a word; a
learner's first sight of 行 was the question "what is 行く?".  Since N5's fronts were limited to the kanji of its
own level (`words.beyond`) those kanji are a small, closed set, and this deck is that set: one note per kanji.

WHICH KANJI.  The ones KANJIDIC2 marks with the former JLPT level 4, the first level of the pre-2010 test
specification (now N5) -- the same field that decides which words N5 writes in kana.  That list is the board's
last published one; the deck's description says so, as every level's says its word list is unofficial.

THE ORDER IS THE ORDER THE WORDS NEED THEM IN: a kanji stands where the first-words deck and then N5 first put
it on a front, so a learner taking a few cards a day from each meets the kanji before, or with, its first word.
The kanji of the level that no front of those two decks uses come last, commonest first by KANJIDIC2's own
newspaper-frequency rank.

EVERY FIELD IS A SOURCE'S: meanings, on and kun readings and the stroke count are KANJIDIC2's, the parts are
KanjiVG's, the words are the two decks' own notes (so their readings and glosses are JMdict's).  Stroke ORDER is
not shown: KanjiVG has it, but as drawings, and a deck's cards cannot carry a drawing.
"""
import html, json, os, re
from common import DECKS, STAMP, note_ids, load, is_kanji

KJ = load('kanji.json')
esc = lambda s: (s or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
LEVEL = 4                         # KANJIDIC2's former JLPT level for the first level
SOURCES_OF_WORDS = ['Japanese-First-Words.folio-deck.json', 'JLPT-N5-Japanese.folio-deck.json']
FILE = 'Japanese-Kanji-N5.folio-deck.json'
DECK_ID = 'jakanji5'
TITLE = 'Japanese — Kanji for JLPT N5'
TYPE_ID = 'kanji'
FIELDS = ['Kanji', 'Meaning', 'Readings', 'Strokes', 'Parts', 'Words']

BACK = ('<div class="uc-kmean">{{Meaning}}</div>'
        '{{#Readings}}<div class="uc-kread">{{Readings}}</div>{{/Readings}}')
REST = ('{{#Strokes}}<div class="uc-kst">{{Strokes}}</div>{{/Strokes}}'
        '{{#Parts}}<div class="uc-kparts">{{Parts}}</div>{{/Parts}}'
        '{{#Words}}<div class="uc-kwords">{{Words}}</div>{{/Words}}')
CARDS = [
    {'name': 'Kanji → meaning', 'front': '<div class="uc-kanji1">{{Kanji}}</div>',
     'back': '{{FrontSide}}<hr>' + BACK + REST},
    # THE QUESTION GIVES THE READINGS WITH THE MEANINGS: "day, sun" is 日 and nothing else once ニチ and ひ stand
    # under it, and a learner writing a kanji from memory is recalling a shape, not guessing which synonym is meant
    {'name': 'Meaning → kanji', 'front': '<div class="uc-ask">Write the kanji</div>' + BACK,
     'back': '{{FrontSide}}<hr><div class="uc-kanji1">{{Kanji}}</div>' + REST},
]
CSS = """.card { text-align: center; font-size: 17px; line-height: 1.6; }
.uc-ask { margin-bottom: 14px; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.55; }
.uc-kanji1 { font-size: 84px; line-height: 1.2; }
.uc-kmean { font-size: 21px; line-height: 1.4; }
.uc-kread { margin-top: 6px; font-size: 15px; opacity: 0.8; }
.uc-kl { margin: 0 5px 0 12px; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.55; }
.uc-kl:first-child { margin-left: 0; }
.uc-kst { margin-top: 6px; font-size: 12.5px; opacity: 0.62; }
.uc-kparts { margin-top: 4px; font-size: 13px; opacity: 0.75; }
.uc-kparts b { font-weight: 500; }
.uc-kwords { margin: 14px auto 0; width: fit-content; max-width: 100%; padding: 8px 15px; border: 1px solid var(--rule, rgba(0,0,0,0.12)); border-radius: 11px; text-align: left; }
.uc-kwl { display: block; margin-bottom: 2px; font-size: 9.5px; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.55; text-align: center; }
.uc-kw { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 10px; padding: 3px 0; font-size: 14px; }
.uc-kww { font-size: 19px; line-height: 1.9; }
.uc-kww rt { font-size: 0.5em; opacity: 0.7; }
.uc-kwr { font-style: italic; opacity: 0.7; }
.uc-kwg { opacity: 0.62; }
.uc-say { margin-right: 4px; font-size: 13px; }
"""


def kun(k):
    return k.replace('.', '(') + ')' if '.' in k else k


def words_using():
    """kanji -> the notes of the two decks whose FRONT writes it, in the decks' own order; and that order."""
    by, order = {}, []
    for f in SOURCES_OF_WORDS:
        for c in json.load(open(os.path.join(DECKS, f), encoding='utf-8'))['cards']:
            fl = c['fields']
            front = re.sub(r'<rt>.*?</rt>|<span class="uc-hint">.*?</span>|<[^>]+>', '', fl['Word'])
            # the first gloss: unescaped BEFORE it is cut at the semicolon, or "I&#x27;m off" is cut inside its entity
            gl = html.unescape(re.sub(r'<[^>]+>', '', re.search(r'<div class="uc-gl">(.*?)</div>', fl['English']).group(1)))
            gl = esc(gl.split(';')[0].strip())
            for ch in dict.fromkeys(front):
                if is_kanji(ch) and KJ.get(ch, {}).get('j') == LEVEL:
                    if ch not in by:
                        by[ch] = []; order.append(ch)
                    by[ch].append((fl['Furigana'], fl['Reading'], fl['Romaji'], gl))
    return by, order


def build():
    by, order = words_using()
    level = [ch for ch, k in KJ.items() if k.get('j') == LEVEL]
    unused = sorted((ch for ch in level if ch not in by), key=lambda ch: (KJ[ch]['f'] or 9999, ch))
    notes = []
    for ch in order + unused:
        k = KJ[ch]
        rd = []
        if k['on']:
            rd.append('<span class="uc-kl">on</span>' + esc('、'.join(k['on'][:3])))
        if k['kun']:
            rd.append('<span class="uc-kl">kun</span>' + esc('、'.join(kun(x) for x in k['kun'][:3])))
        parts = [p for p in k.get('p', []) if p in KJ and KJ[p]['m'] and p != ch]
        ws = ''
        if ch in by:
            ws = '<span class="uc-kwl">words written with it</span>' + ''.join(
                '<div class="uc-kw"><span class="uc-kww"><span class="uc-tts uc-say" data-say="%s"></span>%s</span>'
                '<span class="uc-kwr">%s</span><span class="uc-kwg">%s</span></div>' % (r, fu, ro, gl)
                for fu, r, ro, gl in by[ch][:4])
        notes.append({
            'Kanji': ch,
            'Meaning': esc(', '.join(k['m'][:4])),
            'Readings': ''.join(rd),
            'Strokes': ('%d strokes' % k['sc']) if k['sc'] > 1 else ('1 stroke' if k['sc'] == 1 else ''),
            'Parts': ('<span class="uc-kl">parts</span>' + ' · '.join(
                '<b>%s</b> %s' % (esc(p), esc(KJ[p]['m'][0])) for p in parts)) if parts else '',
            'Words': ws,
        })
    return notes, len(order), unused


if __name__ == '__main__':
    notes, used, unused = build()
    n = len(notes)
    seen = {}
    for x in notes:
        key = x['Meaning'] + '|' + x['Readings']
        if key in seen:
            raise SystemExit('two kanji with one question: %s %s' % (seen[key], x['Kanji']))
        seen[key] = x['Kanji']
    nums = note_ids(DECK_ID, [x['Kanji'] for x in notes])
    cards = [{'id': 'u_%s_%d' % (DECK_ID, num), 'num': str(i), 'type': TYPE_ID, 'fields': x}
             for i, (x, num) in enumerate(zip(notes, nums), 1)]
    desc = (
        f"The kanji of the first level, one note each: {n} notes, each with TWO cards (kanji → meaning and "
        "readings; meaning and readings → kanji, to write from memory), each scheduled on its own. THE ORDER is the "
        "order the first words need them in: a kanji stands where the First Words deck and then JLPT N5 first "
        f"write it, so studied a few cards a day beside those decks it arrives before, or with, its first word. "
        f"{used} of the {n} are written on a front of those two decks"
        + (f"; the other {len(unused)} ({'、'.join(unused[:6])}{'…' if len(unused) > 6 else ''}) close the deck, "
           "commonest first" if unused else "") + ". — WHICH KANJI, and the list is not official: the JLPT has "
        "published no kanji list since its 2010 revision. These are the kanji KANJIDIC2 marks with the former "
        "level 4, the first level of the pre-2010 test specification — the same measure that decides which words "
        "the N5 deck writes in kana. — The back gives the meanings, up to three on (Chinese-derived, in katakana) "
        "and three kun (native, in hiragana, the part written in kana in brackets) readings, the stroke count, "
        "the parts the kanji is drawn from, and up to four words from the first two decks that use it, with "
        "furigana, romaji, a meaning and a speaker. Stroke order is not shown. — Meanings, readings, stroke "
        "counts and levels: KANJIDIC2 (Electronic Dictionary Research and Development Group, CC BY-SA 4.0). Parts: "
        "KanjiVG (Ulrich Apel, CC BY-SA 3.0). Words: Jonathan Waller's JLPT lists (CC BY) and JMdict (EDRDG, "
        "CC BY-SA 4.0), furigana JmdictFurigana (CC BY-SA 4.0).")
    meta = {'id': DECK_ID, 'title': TITLE,
            'subtitle': 'The %d kanji of the first level — alongside the first words and N5' % n,
            'desc': desc, 'author': '', 'language': 'en', 'color': '#BC002D',
            'tags': ['japanese', 'kanji', 'jlpt', 'n5', 'writing'], 'glossMode': 'site',
            'types': {TYPE_ID: {'id': TYPE_ID, 'name': 'Japanese kanji', 'speechLang': 'ja-JP', 'fields': FIELDS,
                                'cards': CARDS, 'css': CSS}},
            'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None}
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.join(DECKS, FILE)
    json.dump(deck, open(out, 'w', encoding='utf-8'), ensure_ascii=False)
    print('  wrote %s: %d notes / %d cards, %d on a front of the first two decks, %d not (%s), %d bytes'
          % (FILE, n, 2 * n, used, len(unused), ''.join(unused), os.path.getsize(out)))
