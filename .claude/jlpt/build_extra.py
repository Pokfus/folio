#!/usr/bin/env python3
"""The two decks beside the levels:  python3 build_extra.py phrases|idioms   (after the five JLPT decks)

PHRASES are JMdict's expressions (part of speech `exp`) that the dictionary marks common (a priority tag) --
greetings, set phrases and the grammatical chunks a sentence is built from (お願いします, かもしれない,
ことができる) -- minus any already carded in a JLPT deck, and minus the ones made of nothing but particles and
auxiliaries (には, ですか, だった, のです): those are grammar points, not phrases, and ranked by how often the
corpus contains them they would fill the top of the deck.  IDIOMS are JMdict's four-character idioms (`yoji`,
一石二鳥, 以心伝心) and its proverbs (`proverb`).  NOT its "idiomatic expressions" (`id`): 花が咲く, 頭が痛い
and 手を出す are idioms with a literal twin, and the corpus's sentences for them are nearly all literal -- the
card would teach "the conversation livens up" over a sentence about flowers.

WHICH ONES: those Tatoeba actually uses, at least BAR times (a written form, or its kana where the dictionary
says the phrase is usually written in kana, found in that many sentences).  A phrase the sentence corpus never
says is not one a learner meets first, and it would also be a card with no example.  Commonest first.
Every field is the vocabulary decks' own (`words.py`), so a phrase card reads as a word card does.
"""
import json, os, sys
from common import DECKS, STAMP, romaji, is_kana
from deck_type import TYPE_ID, type_def
import words as W

LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1']
BAR = {'phrases': 3, 'idioms': 2}
FILES = {'phrases': 'Japanese-Phrases-and-Expressions.folio-deck.json',
         'idioms': 'Japanese-Idioms.folio-deck.json'}
IDS = {'phrases': 'japhr', 'idioms': 'jaidiom'}
TITLES = {'phrases': 'Japanese — Phrases and Expressions', 'idioms': 'Japanese — Idioms and Proverbs'}


def carded():
    seen = set()
    for lv in LEVELS:
        for c in json.load(open(os.path.join(DECKS, 'JLPT-%s-Japanese.folio-deck.json' % lv.upper()), encoding='utf-8'))['cards']:
            seen.add(c['jmdict'])
    return seen


def head(seq):
    """The entry's first common spelling and reading (else its first), as JMdict orders them."""
    e = W.JM[seq]
    ks = [k for k in e['k'] if not set(k['inf']) & {'iK', 'oK', 'ik', 'rK', 'sK'}]
    k = next((x for x in ks if x['pri']), ks[0] if ks else None)
    form = k['t'] if k else ''
    rs = [r for r in e['r'] if not r['nokanji'] and (not form or not r['restr'] or form in r['restr'])] or e['r']
    r = next((x for x in rs if x['pri']), rs[0])
    return form, r['t']


TOTAL = {}


def candidates(kind):
    done = carded()
    out = []
    for seq, e in W.JM.items():
        if seq in done:
            continue
        misc = {m for s in e['s'] for m in s['misc']}
        pos = set(e['s'][0]['pos']) if e['s'] else set()
        pri = any(x['pri'] for x in e['k'] + e['r'])
        if kind == 'phrases' and not ('exp' in pos and pri):
            continue
        if kind == 'idioms' and not (misc & {'yoji', 'proverb'}):
            continue
        out.append(seq)
    TOTAL[kind] = sum(1 for e in W.JM.values()
                      if (kind == 'idioms' and {m for s in e['s'] for m in s['misc']} & {'yoji', 'proverb'})
                      or (kind == 'phrases' and e['s'] and 'exp' in e['s'][0]['pos'] and any(x['pri'] for x in e['k'] + e['r'])))
    return out


_TAG = None


def grammar_only(text):
    global _TAG
    import fugashi
    if _TAG is None:
        _TAG = fugashi.Tagger()
    return all((w.feature.pos1 or '') in ('助詞', '助動詞') for w in _TAG(text))


def count(text):
    return sum(1 for r in W.TAT if text in r['ja']) if text else 0


def build(kind):
    known = set()
    import csv
    from common import SRC
    for lv in LEVELS:
        with open(os.path.join(SRC, 'yomitan-jlpt-vocab', 'original_data', lv + '.csv'), encoding='utf-8') as fh:
            for r in csv.DictReader(fh):
                known.update(x for x in (r['kanji'], r['kana']) if x)
    notes = []
    for seq in candidates(kind):
        form, reading = head(seq)
        uk = bool(form) and W.usually_kana(seq, form, reading)
        shown = reading if (uk or not form) else form
        if kind == 'phrases' and grammar_only(shown):
            continue
        n = count(shown)
        if n < BAR[kind]:
            continue
        ss = W.senses(seq, form, reading)
        eng = W.english_html(ss)
        if not eng:
            continue
        ex_html, nex = W.examples(form, reading, known, uk=uk)
        if not nex:
            continue      # attested by substring but never as the phrase itself: not a card worth having
        notes.append((n, seq, {
            'Word': W.esc(shown),
            'Furigana': W.furigana(form, reading) if not uk else W.esc(reading),
            'Reading': W.esc(reading),
            'Romaji': W.esc(W.romaji_phrase(shown, reading) or ''),
            'Also': ('usually written in kana · kanji: ' + W.esc(form)) if uk else '',
            'English': eng,
            'Kanji': W.kanji_html(form) if (kind == 'idioms' and not uk) else '',
            'Compounds': '',
            'Examples': ex_html,
        }))
    notes.sort(key=lambda x: (-x[0], int(x[1])))
    return notes


DESC = {
 'phrases': ("The set phrases a learner needs beside the vocabulary: greetings and courtesies (お願いします, "
             "お邪魔します), and the fixed chunks Japanese grammar is built from (かもしれない, ことができる). {n} "
             "phrases, each ONE note with TWO cards (Japanese → English, English → Japanese), each scheduled on its "
             "own. THE SELECTION: every expression JMdict marks as common that is not already carded in the five "
             "JLPT decks and that the Tatoeba corpus uses in at least {bar} sentences, commonest first — less the "
             "ones made only of particles and auxiliaries (には, だった), which are grammar points rather than phrases. The card is "
             "the vocabulary decks' card: the phrase as it is written (in kana where the dictionary marks it usually "
             "kana), furigana and Hepburn romaji (a particle は written \"wa\", へ \"e\", を \"o\"), "
             "the meanings, and up to three real sentences with furigana and a speaker. — "),
 'idioms': ("Japanese idioms: four-character compounds (yojijukugo, 一石二鳥 \"killing two birds with one stone\") "
            "and proverbs — the counterpart of the Mandarin deck's chengyu. {n} idioms, each ONE note with TWO "
            "cards. THE SELECTION: every entry JMdict tags as a four-character idiom or a proverb, not already in "
            "the JLPT decks, that the Tatoeba corpus uses in at "
            "least {bar} sentences, commonest first — of the {total:,} the dictionary tags, most of which a "
            "learner never meets. Idiomatic phrases with a literal twin (花が咲く, 頭が痛い) are left out: the "
            "corpus's sentences for them are nearly all literal, so they would teach the idiom over the wrong "
            "sentence. Each card carries furigana, Hepburn romaji, the meanings, a row per kanji, and real "
            "sentences. — "),
}
SRCS = ("Phrases, readings and meanings: JMdict (Electronic Dictionary Research and Development Group, CC BY-SA 4.0). "
        "Furigana: JmdictFurigana (CC BY-SA 4.0). Kanji: KANJIDIC2 (EDRDG, CC BY-SA 4.0) and KanjiVG (CC BY-SA 3.0). "
        "Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR; the readings over them come from segmenting the "
        "corpus with MeCab and UniDic, so a reading over an example sentence is a machine's and can occasionally be "
        "wrong — the headword's own reading is the dictionary's.")
SUBS = {'phrases': '{n} set phrases and grammatical chunks — alongside any level',
        'idioms': '{n} four-character idioms and proverbs — after the levels'}

if __name__ == '__main__':
    kind = (sys.argv[1:] or ['phrases'])[0]
    notes = build(kind)
    did = IDS[kind]
    cards = [{'id': 'u_%s_%d' % (did, i), 'num': str(i), 'jmdict': seq, 'type': TYPE_ID, 'fields': f}
             for i, (_n, seq, f) in enumerate(notes, 1)]
    n = len(cards)
    meta = {'id': did, 'title': TITLES[kind], 'subtitle': SUBS[kind].format(n=n),
            'desc': DESC[kind].format(n=n, bar=BAR[kind], total=TOTAL[kind]) + SRCS, 'author': '', 'language': 'en', 'color': '#BC002D',
            'tags': ['japanese', kind, 'vocabulary'] + (['yojijukugo', 'proverbs'] if kind == 'idioms' else ['expressions']),
            'glossMode': 'site', 'types': {TYPE_ID: type_def()}, 'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP,
            'forkedFrom': None}
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    import importlib.util as iu
    sp = iu.spec_from_file_location('dg', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dedupe-glosses.py'))
    dg = iu.module_from_spec(sp); sp.loader.exec_module(dg)
    s = dg.dedupe(deck, 'Japanese')
    if s['groups']:
        print('  labelled %d notes in %d groups that shared an English side' % (s['labelled'], s['groups']))
    out = os.path.join(DECKS, FILES[kind])
    json.dump(deck, open(out, 'w', encoding='utf-8'), ensure_ascii=False)
    print('  wrote %s: %d notes / %d cards, %d bytes' % (FILES[kind], n, 2 * n, os.path.getsize(out)))
