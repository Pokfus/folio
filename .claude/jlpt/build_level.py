#!/usr/bin/env python3
"""Build one JLPT level's deck:  python3 build_level.py n5   (n5 first; each level reads the shipped decks below it)

THE LIST.  The JLPT has published no vocabulary list since 2010 (its own FAQ says so).  The membership of each
level is Jonathan Waller's JLPT lists (tanos.co.uk, CC BY), taken from stephenmk/yomitan-jlpt-vocab (CC BY-SA
4.0), which joins every row to its JMdict entry and replaces a few rare spellings with the common ones.  The
deck says, in its description, that the list is unofficial.

A WORD IS ONE JMDICT ENTRY.  Where a level lists one entry twice (いく / ゆく, 川 / 河) it is one note, the other
readings and spellings shown as "also".  An entry already carded at a lower level is not carded again -- read
out of the SHIPPED lower decks (their notes' `jmdict` key), so the levels cannot drift apart.  The lowest deck
of all is the first-words deck (`build_start.py`), which cards the greetings and particles the lists file at N3
and above, so it is built first and every level reads it.

N5 IS NOT IN PLAIN FREQUENCY ORDER (Nov 2026; `sequence`).  It is the first word list a learner opens, and by
frequency alone it opened with する, いる, いる, 私 (わたくし), 私 (わたし), counted one to ten across 450 cards (一 at
29, 九 at 480) and met Monday at 615.  Closed sets are dealt together, and two words that answer one question
are kept apart.  N4 to N1 stay in frequency order.
"""
import csv, json, os, re, sys
from common import SRC, DECKS, STAMP, romaji, is_kana, note_ids
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


START = 'Japanese-First-Words.folio-deck.json'


def shipped_seqs(below):
    seen = set()
    for f in [START] + [FILE(lv) for lv in below]:
        p = os.path.join(DECKS, f)
        if not os.path.exists(p):
            raise SystemExit('build the decks in order: %s is not built yet' % f)
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            seen.add(c['jmdict'])
    return seen


# ------------------------------------------------------------------------------ N5's order
# SETS A LEARNER IS TAUGHT TOGETHER, each dealt as one run at the place its commonest member holds by frequency.
# A member is named by its written form, or its reading where the list gives it no kanji, or "form|reading" where
# two notes share a form; every name must find exactly one N5 note, or the build stops -- the table cannot rot.
SETS = [
    ['この', 'その', 'あの', 'どの'],
    ['これ', 'それ', 'あれ', 'どれ'],
    ['ここ', 'そこ', 'あそこ', 'どこ'],
    ['こちら', 'そちら', 'あちら', 'どちら'],          # こっち, そっち … are the same entries, shown as "also"
    ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
    ['百', '千', '万'],
    ['一つ', '二つ', '三つ', '四つ', '五つ', '六つ', '七つ', '八つ', '九つ'],
    ['一人', '二人'],
    ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'],
    ['一日|ついたち', '二日', '三日', '四日', '五日', '六日', '七日', '八日', '九日', '十日', '二十日'],
    ['お父さん', 'お母さん'],
    ['兄', '姉', '弟', '妹'],
    ['お兄さん', 'お姉さん'],
    ['おじいさん', 'おばあさん'],
]
# WHERE THE CORPUS COUNT IS KNOWN TO MISLEAD, the second word is dealt before the first.  UniDic reads every 私 as
# わたくし (`words.PLAIN_READING`), so the two notes written 私 tie and the formal one happened to come first; and
# it files よく and よかった, the forms いい borrows, under 良い, which put よい ahead of the word people say.
AFTER = [('私|わたくし', '私|わたし'), ('良い', 'いい')]
# TWO WORDS THAT ANSWER ONE QUESTION ARE KEPT THIS MANY NOTES APART: the same first gloss ("to do": する, やる) or
# the same written form (私, 何).  Met in one week they are learnt as one blur; the commoner goes first.
GAP = 40


def sequence(notes):
    """N5's teaching order: frequency, with the sets dealt together and look-alikes kept GAP notes apart."""
    notes = sorted(notes, key=lambda n: -n['f'])

    def find(name):
        hit = [n for n in notes if name in (n['form'], n['reading'], '%s|%s' % (n['form'], n['reading']))]
        if len(hit) != 1:
            raise SystemExit('sequence: "%s" names %d N5 notes' % (name, len(hit)))
        return hit[0]

    for late, early in AFTER:
        a, b = find(late), find(early)
        if notes.index(a) < notes.index(b):
            notes.remove(a)
            notes.insert(notes.index(b) + 1, a)
    block = {}
    for names in SETS:
        members = [find(x) for x in names]
        for m in members:
            if id(m) in block:
                raise SystemExit('sequence: %s is in two sets' % m['reading'])
            block[id(m)] = members
    items, emitted = [], set()
    for n in notes:
        b = block.get(id(n))
        if b is None:
            items.append([n])
        elif id(b) not in emitted:
            emitted.add(id(b)); items.append(b)

    def keys(n):
        m = re.search(r'<div class="uc-gl">(.*?)</div>', n['fields']['Prompt'])
        # unescaped before it is cut: "I&#x27;m sorry" must not become the gloss "i&#x27"
        return {'g:' + W.html.unescape(m.group(1)).split(';')[0].strip().lower(), 'w:' + (n['form'] or n['reading'])}

    out, held = [], 0
    while items:
        recent = set()
        for n in out[-GAP:]:
            recent |= keys(n)
        pick = next((i for i, it in enumerate(items) if not any(keys(n) & recent for n in it)), 0)
        held += pick > 0
        out.extend(items.pop(pick))
    return out, held


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

    notes, ex0, ex3, ukn, gated, verbs = [], 0, 0, 0, 0, 0
    for seq in order:
        g = groups[seq]
        form, reading = g[0]['kanji'], g[0]['kana']
        n = W.make_note(seq, form, reading, lv, known, universe=universe,
                        others=[x for r in g[1:] for x in (r['kanji'], r['kana'])])
        n['reading'] = reading
        ukn += n['uk']; gated += n['late']; verbs += bool(n['fields']['Conj'])
        ex0 += n['nex'] == 0; ex3 += n['nex'] == 3
        notes.append(n)

    clash = W.resolve_fronts(notes)
    labelled = W.label_prompts(notes)

    # COMMONEST FIRST: the count of the word's dictionary form over the Tatoeba corpus, segmented here with
    # MeCab and UniDic (the subtitle list the other languages use splits Japanese verbs from their endings);
    # ties keep the list's own order.  N5 alone is then re-dealt (`sequence`).
    held = 0
    if lv == 'n5':
        notes, held = sequence(notes)
    else:
        notes.sort(key=lambda n: -n['f'])
    did = DECK_ID(lv)
    # THE NUMBER IN THE ID IS PINNED TO THE WORD (`common.note_ids`), not to its place: `num` is the place.
    nums = note_ids(did, [n['seq'] for n in notes])
    cards = []
    for i, (n, num) in enumerate(zip(notes, nums), 1):
        cards.append({'id': 'u_%s_%d' % (did, num), 'num': str(i), 'jmdict': n['seq'], 'type': TYPE_ID,
                      'fields': n['fields']})
    kanji = set()
    for n in notes:
        kanji.update(ch for ch in W.plain(n['fields']['Word']) if W.is_kanji(ch) and ch not in '々〆ヶ')
    return cards, {'moved': sorted(MOVED.get(lv, ())), 'listed': len(rows(lv)), 'lower': sum(1 for r in rows(lv) if r['jmdict_seq'] in done),
                   'no_entry': no_entry, 'ex0': ex0, 'ex3': ex3, 'uk': ukn, 'clash': clash, 'gated': gated,
                   'verbs': verbs, 'labelled': labelled, 'held': held, 'kanji': len(kanji),
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
    gate = ''
    if lv in W.KANJI_FLOOR:
        gate = (f" A word whose kanji are not yet {lv.upper()} kanji is asked in kana instead ({st['gated']} of these), "
                f"which leaves {st['kanji']} different kanji on this deck's fronts: the measure is each kanji's "
                "former JLPT level in KANJIDIC2, from the pre-2010 test specification — the last list the board "
                "published. Its back still writes the word in kanji. Two words spelled alike are told apart on the "
                f"front by their kanji with the reading over them ({st['clash']} fronts).")
    forms = (f"a verb's polite, て, negative and past forms ({st['verbs']} verbs; derived from the verb class "
             "the dictionary gives, not looked up), " if st['verbs'] else '')
    order = ''
    if lv == 'n5':
        order = (" THE ORDER is commonest first by a count over the Tatoeba corpus, with three corrections a "
                 "beginner's deck needs: the closed sets are dealt together (この その あの どの, the numbers one "
                 "to ten, the days of the week and of the month, the family), two words that answer one question "
                 f"or are written alike are kept at least {GAP} notes apart, and わたし and いい come before the "
                 "formal わたくし and よい")
    else:
        order = " The order is commonest first, by a count over the Tatoeba corpus"
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
        f"word as usually written in kana ({st['uk']} of these).{gate} The back puts the reading over the kanji as "
        "furigana and the Hepburn romaji beneath it, spelled from the kana (so おう is \"ou\", not \"ō\": kana "
        "alone cannot say whether it is one long vowel or two; katakana's ー is a macron; a particle は is \"wa\"), "
        f"then the meanings, {forms}"
        "one row per kanji with its meanings, on and kun readings and the parts it is drawn from, the words "
        f"of the lists built on a single kanji, and a fold of real sentences. {ex}, with the word picked out "
        "in colour, furigana over the kanji, and a speaker beside each. The English → Japanese card asks with "
        "the word's first sense alone, the others waiting on the back"
        + (f"; where two words share that first gloss ({st['labelled']} here) each one's question names the "
           "other, so every question has one answer" if st['labelled'] else "") + f".{order} — " + SOURCES
    )


if __name__ == '__main__':
    lv = (sys.argv[1:] or ['n5'])[0].lower()
    if lv not in LEVELS:
        raise SystemExit('usage: build_level.py n5|n4|n3|n2|n1')
    cards, st = build(lv)
    n = len(cards)
    nxt = ('study after First Words' if lv == 'n5' else
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
    print('    shown in kana for the level %d | kanji on fronts %d | verbs with forms %d | questions labelled %d | times a look-alike was passed over %d | carded below %d'
          % (st['gated'], st['kanji'], st['verbs'], st['labelled'], st['held'], st['lower']))
