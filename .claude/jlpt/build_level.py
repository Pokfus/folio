#!/usr/bin/env python3
"""Build one JLPT level's deck:  python3 build_level.py n5   (n5 first; each level reads the shipped decks below it)

THE LIST.  The JLPT has published no vocabulary list since 2010 (its own FAQ says so).  The membership of each
level is Jonathan Waller's JLPT lists (tanos.co.uk, CC BY), taken from stephenmk/yomitan-jlpt-vocab (CC BY-SA
4.0), which joins every row to its JMdict entry and replaces a few rare spellings with the common ones.  The
deck says, in its description, that the list is unofficial.

A WORD IS ONE JMDICT ENTRY.  Where a level lists one entry twice (いく / ゆく, 川 / 河) it is one note, the other
readings and spellings shown as "also".  An entry already carded at a lower level is not carded again -- read
out of the SHIPPED lower decks (their notes' `jmdict` key), so the levels cannot drift apart.
"""
import csv, json, os, sys
from common import SRC, DECKS, STAMP, romaji, is_kana
from deck_type import TYPE_ID, type_def
import words as W
from resolve import resolve

LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1']
FILE = lambda lv: 'JLPT-%s-Japanese.folio-deck.json' % lv.upper()
DECK_ID = lambda lv: 'jlpt' + lv
TITLE = lambda lv: 'Japanese — JLPT %s' % lv.upper()
SUMMARY = {   # the board's own one-line summary of each level, jlpt.jp/e/about/levelsummary.html
    'n5': 'The ability to understand some basic Japanese.',
    'n4': 'The ability to understand basic Japanese.',
    'n3': 'The ability to understand Japanese used in everyday situations to a certain degree.',
    'n2': 'The ability to understand Japanese used in everyday situations, and in a variety of circumstances to a certain degree.',
    'n1': 'The ability to understand Japanese used in a variety of circumstances.',
}
ORDINAL = {'n5': 'first', 'n4': 'second', 'n3': 'third', 'n2': 'fourth', 'n1': 'fifth and last'}


MOVED = {}


def rows(lv):
    """The level's rows, each row's JMdict join checked (`resolve.py`) and moved where it is plainly wrong."""
    with open(os.path.join(SRC, 'yomitan-jlpt-vocab', 'original_data', lv + '.csv'), encoding='utf-8') as fh:
        out = list(csv.DictReader(fh))
    for r in out:
        r['jmdict_seq'], old = resolve(r)
        if old:
            MOVED.setdefault(lv, set()).add(r['kanji'] or r['kana'])
    return out


def shipped_seqs(below):
    seen = set()
    for lv in below:
        p = os.path.join(DECKS, FILE(lv))
        if not os.path.exists(p):
            raise SystemExit('build the levels in order: %s is not built yet' % FILE(lv))
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            seen.add(c['jmdict'])
    return seen


def build(lv):
    k = LEVELS.index(lv)
    below = LEVELS[:k]
    done = shipped_seqs(below)

    # every word of the lists, lowest level first: the compounds' universe and the "known" set
    universe, known = [], set()
    for j, l in enumerate(LEVELS):
        for r in rows(l):
            if not r['jmdict_seq']:
                continue
            w = {'seq': r['jmdict_seq'], 'form': r['kanji'], 'reading': r['kana'], 'lv': l}
            universe.append(w)
            if j <= k:
                known.update(x for x in (r['kanji'], r['kana']) if x)
    universe.sort(key=lambda w: (LEVELS.index(w['lv']), -W.freq_of(w['form'], w['reading'])))

    groups, order, no_entry = {}, [], []
    for r in rows(lv):
        seq = r['jmdict_seq']
        if not seq:
            no_entry.append(r['kanji'] or r['kana']); continue
        if seq in done:
            continue
        if seq not in groups:
            groups[seq] = []; order.append(seq)
        groups[seq].append(r)

    notes, ex0, ex3, ukn = [], 0, 0, 0
    for seq in order:
        g = groups[seq]
        form, reading = g[0]['kanji'], g[0]['kana']
        uk = bool(form) and W.usually_kana(seq, form, reading)
        ukn += uk
        ss = W.senses(seq, form, reading)
        if not ss:
            ss = W.senses(seq, '', reading)
        eng = W.english_html(ss)
        if not eng:
            raise SystemExit('no usable sense for %s %s (%s)' % (form, reading, seq))
        front = reading if (uk or not form) else form
        also = []
        if uk:
            also.append('usually written in kana · kanji: ' + W.esc(form))
        others = []
        for r in g[1:]:
            for x in (r['kanji'], r['kana']):
                if x and x not in (form, reading) and x not in others:
                    others.append(x)
        if others:
            also.append('also ' + ' / '.join(W.esc(x) for x in others))
        ex_html, nex = W.examples(form, reading, known, uk=uk)
        ex0 += nex == 0; ex3 += nex == 3
        # A WORD USUALLY WRITTEN IN KANA gets no kanji rows: its card never shows the kanji, and the compounds of
        # 為 (する) or 居 (いる) are not words a learner of する needs.
        single = [ch for ch in form if W.is_kanji(ch)] if form and not uk else []
        cmp = W.compounds_html(single[0], universe, seq) if len(single) == 1 else ''
        notes.append({
            'seq': seq, 'f': W.freq_of(form if not uk else '', reading) if uk else W.freq_of(form, reading),
            'fields': {
                'Word': W.esc(front),
                'Furigana': W.furigana(form, reading) if not uk else W.esc(reading),
                'Reading': W.esc(reading),
                'Romaji': W.esc(W.romaji_phrase(front, reading) or ''),
                'Also': ' · '.join(also),
                'English': eng,
                'Kanji': W.kanji_html(form) if not uk else '',
                'Compounds': cmp,
                'Examples': ex_html,
            }})

    # TWO NOTES WITH ONE FRONT are two different words spelled alike (私 わたし and 私 わたくし are separate JMdict
    # entries), and a front that cannot say which one it asks is unanswerable; only those show their furigana.
    fronts = {}
    for n in notes:
        fronts.setdefault(n['fields']['Word'], []).append(n)
    clash = 0
    for same in fronts.values():
        if len(same) > 1:
            for n in same:
                n['fields']['Word'] = n['fields']['Furigana']
                clash += 1

    # COMMONEST FIRST: the count of the word's dictionary form over the Tatoeba corpus, segmented here with
    # MeCab and UniDic (the subtitle list the other languages use splits Japanese verbs from their endings);
    # ties keep the list's own order.
    notes.sort(key=lambda n: -n['f'])
    did = DECK_ID(lv)
    cards = []
    for i, n in enumerate(notes, 1):
        cards.append({'id': 'u_%s_%d' % (did, i), 'num': str(i), 'jmdict': n['seq'], 'type': TYPE_ID,
                      'fields': n['fields']})
    return cards, {'moved': sorted(MOVED.get(lv, ())), 'listed': len(rows(lv)), 'lower': sum(1 for r in rows(lv) if r['jmdict_seq'] in done),
                   'no_entry': no_entry, 'ex0': ex0, 'ex3': ex3, 'uk': ukn, 'clash': clash,
                   'total_before': sum(len(json.load(open(os.path.join(DECKS, FILE(b)), encoding='utf-8'))['cards'])
                                       for b in below)}


SOURCES = (
    "Word list: Jonathan Waller's JLPT lists (tanos.co.uk, CC BY), as joined to JMdict by "
    "stephenmk/yomitan-jlpt-vocab (CC BY-SA 4.0). Readings, meanings, parts of speech and the "
    "\"usually written in kana\" marks: JMdict (Electronic Dictionary Research and Development Group, "
    "CC BY-SA 4.0). Furigana on the headword: JmdictFurigana (CC BY-SA 4.0). Kanji meanings and "
    "readings: KANJIDIC2 (EDRDG, CC BY-SA 4.0). The parts each kanji is drawn from: KanjiVG (Ulrich Apel, "
    "CC BY-SA 3.0). Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR; the readings over them and the "
    "frequency order come from segmenting that corpus with MeCab and the UniDic dictionary, so a reading over "
    "an example sentence is a machine's and can occasionally be wrong — the headword's own reading is the "
    "dictionary's."
)


def describe(lv, n, st):
    cum = st['total_before'] + n
    lower = (" %d of the list's rows for this level are words already carded at a lower level and are not "
             "carded twice." % st['lower']) if st['lower'] else ''
    noent = (" %d rows have no entry in JMdict (single-character prefixes such as %s) and are left out rather "
             "than glossed from nowhere." % (len(st['no_entry']), '、'.join(st['no_entry'][:3]))) if st['no_entry'] else ''
    moved = (" %d of its joins to the dictionary pointed at the wrong homograph (%s) and are corrected here, each "
             "checked against the list's own English." % (len(st['moved']), '、'.join(st['moved']))) if st['moved'] else ''
    ex = ("Every word carries up to three example sentences" if st['ex0'] == 0 else
          "%d of the %d words carry example sentences, up to three apiece; Tatoeba has nothing usable for the "
          "other %d, which are kept because a word is on the list for being worth knowing" % (n - st['ex0'], n, st['ex0']))
    return (
        "Both study directions in one deck: Japanese → English (see the word as it is written, recall its "
        "reading and meaning) and English → Japanese. Each word is ONE note with TWO cards, each scheduled on "
        f"its own. {n} words for JLPT {lv.upper()}, the {ORDINAL[lv]} level of the Japanese-Language Proficiency "
        f"Test (the board's own summary: \"{SUMMARY[lv]}\"), taking you to about {cum:,} words in all. — "
        "THE LIST IS UNOFFICIAL, and that has to be said first: the JLPT has published no vocabulary list since "
        "its 2010 revision — its FAQ says a list \"was not necessarily appropriate\" — so every JLPT word list is "
        "someone's compilation. This one is the most widely used, Jonathan Waller's, built from the pre-2010 "
        "test specifications and mapped onto the five levels; words from it do turn up a level higher or lower "
        f"in the real test.{moved}{lower}{noent} — "
        "The front shows the word as a Japanese reader writes it: kanji, or kana where the dictionary marks the "
        f"word as usually written in kana ({st['uk']} of these). The back puts the reading over the kanji as "
        "furigana and the Hepburn romaji beneath it, spelled from the kana (so おう is \"ou\", not \"ō\": kana "
        "alone cannot say whether it is one long vowel or two; katakana's ー is a macron; a particle は is \"wa\"), "
        "then the meanings, "
        "one row per kanji with its meanings, on and kun readings and the parts it is drawn from, the words "
        f"of the lists built on a single kanji, and a fold of real sentences. {ex}, with the word picked out "
        "in colour, furigana over the kanji, and a speaker beside each. — " + SOURCES
    )


if __name__ == '__main__':
    lv = (sys.argv[1:] or ['n5'])[0].lower()
    if lv not in LEVELS:
        raise SystemExit('usage: build_level.py n5|n4|n3|n2|n1')
    cards, st = build(lv)
    n = len(cards)
    nxt = ('start here once you can read kana' if lv == 'n5' else
           'study after %s' % LEVELS[LEVELS.index(lv) - 1].upper())
    meta = {
        'id': DECK_ID(lv), 'title': TITLE(lv),
        'subtitle': ('The first %d words — %s' % (n, nxt)) if lv == 'n5' else
                    ('%s more words, taking you to about %s — %s' % (format(n, ','), format(st['total_before'] + n, ','), nxt)),
        'desc': describe(lv, n, st), 'author': '', 'language': 'en', 'color': '#BC002D',
        'tags': ['japanese', 'jlpt', lv, 'vocabulary'], 'glossMode': 'site',
        'types': {TYPE_ID: type_def()}, 'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    import importlib.util as iu
    sp = iu.spec_from_file_location('dg', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dedupe-glosses.py'))
    dg = iu.module_from_spec(sp); sp.loader.exec_module(dg)
    s = dg.dedupe(deck, 'Japanese')
    if s['groups']:
        print('  labelled %d notes in %d groups that shared an English side' % (s['labelled'], s['groups']))
    out = os.path.join(DECKS, FILE(lv))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote %s: %d notes / %d cards, %d bytes | no examples %d | three %d | usually kana %d | no JMdict %d | fronts with furigana %d | joins corrected %d'
          % (FILE(lv), n, 2 * n, os.path.getsize(out), st['ex0'], st['ex3'], st['uk'], len(st['no_entry']), st['clash'], len(st['moved'])))
