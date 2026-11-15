#!/usr/bin/env python3
"""The first-words deck:  python3 build_start.py   (BEFORE the levels: they read it as the deck below them)

WHY IT EXISTS (Nov 2026, an audit of what a learner with no Japanese meets).  Waller's lists follow the pre-2010
test specification, whose first level carried its greetings in an appendix and its particles in the grammar
section -- so the word lists the JLPT decks are built from put こんにちは, ありがとう and すみません at N3,
おはよう and さようなら at N2, 円 and 日本 at N3, and です, だ, が, を and も nowhere at all.  A learner who
followed the shelf's own order (hiragana, katakana, N5, N4) reached "hello" after 1,300 words and never met the
copula, while every example sentence from the first card on is held together by particles nobody had named.

WHAT IS IN IT is the table below and nothing else: greetings and courtesies, the copula and the polite endings,
the particles, and the handful of words for people, time and money the levels file far too high.  EVERY ROW IS A
JMDICT ENTRY, named by its sequence number and checked against the spelling and reading written beside it (a
dictionary that renumbered an entry stops the build); every meaning, note and example is the sources', through
`words.make_note`, exactly as on a level's card.  What the dictionary has no entry for is not in the deck:
でした and ました are forms, not headwords, so they are not carded.

AN ENTRY N5 OR N4 ALREADY CARDS IS REFUSED HERE (はい, いいえ, どうぞ and the numbers are N5's, and N5's order now
brings them early); an entry the lists place at N3, N2 or N1 is carded HERE INSTEAD, because the levels read this
deck as the one below them (`build_level.shipped_seqs`) and a word is carded once, at the lowest deck that has it.

THE ORDER IS THE TABLE'S, a teaching order: it is not sorted by frequency, which would open with は, の and に.
"""
import csv, json, os
from common import SRC, DECKS, STAMP, note_ids
from deck_type import TYPE_ID, type_def
import words as W
from resolve import resolve

FILE = 'Japanese-First-Words.folio-deck.json'
DECK_ID = 'jafirst'
TITLE = 'Japanese — First Words'
PRT, AUX = ('助詞',), ('助動詞',)

# (JMdict sequence, written form or '' for a kana word, reading, the part of speech an example's token must be)
ROWS = [
    # --- greetings and courtesies
    ('1289400', '今日は', 'こんにちは', None),
    ('1002340', 'お早うございます', 'おはようございます', None),
    ('1612820', 'お早う', 'おはよう', None),
    ('1289480', '今晩は', 'こんばんは', None),
    ('1291050', '左様なら', 'さようなら', None),
    ('2025400', '又ね', 'またね', None),
    ('1586820', '有難う', 'ありがとう', None),
    ('1541040', '有難うございます', 'ありがとうございます', None),
    ('1009030', 'どう致しまして', 'どういたしまして', None),
    ('1295060', '済みません', 'すみません', None),
    ('1270680', '御免なさい', 'ごめんなさい', None),
    ('1625780', '初めまして', 'はじめまして', None),
    ('2133750', 'よろしくお願いします', 'よろしくおねがいします', None),
    ('1001720', 'お願いします', 'おねがいします', None),
    ('1410800', '頂きます', 'いただきます', None),
    ('1005080', 'ご馳走様でした', 'ごちそうさまでした', None),
    ('1001780', 'お休みなさい', 'おやすみなさい', None),
    ('2020140', '行ってきます', 'いってきます', None),
    ('2088750', '行ってらっしゃい', 'いってらっしゃい', None),
    ('1538960', '只今', 'ただいま', None),
    ('1001740', 'お帰りなさい', 'おかえりなさい', None),
    ('1000930', '', 'いらっしゃいませ', None),
    ('1012550', '', 'もしもし', None),
    ('1270700', '御目出度う', 'おめでとう', None),
    ('2276200', '失礼します', 'しつれいします', None),
    ('2272760', 'お元気ですか', 'おげんきですか', None),
    # --- the copula and the polite endings
    ('1628500', '', 'です', AUX),
    ('2089020', '', 'だ', AUX),
    ('2457920', '', 'ですか', None),
    ('2837492', '', 'そうです', None),
    ('2210290', '', 'ます', AUX),
    ('2210320', '', 'ません', None),
    ('2210300', '', 'ましょう', None),
    ('1008420', '', 'でしょう', None),
    ('2257550', '', 'ない', AUX),
    # --- the particles
    ('2028920', '', 'は', PRT),
    ('2028930', '', 'が', PRT),
    ('2029010', '', 'を', PRT),
    ('1469800', '', 'の', PRT),
    ('2028990', '', 'に', PRT),
    ('2029000', '', 'へ', PRT),
    ('2028980', '', 'で', PRT),
    ('1008490', '', 'と', PRT),
    ('2028940', '', 'も', PRT),
    ('2028970', '', 'か', PRT),
    ('1002980', '', 'から', PRT),
    ('1525680', '迄', 'まで', PRT),
    ('2028960', '', 'や', PRT),
    ('2029080', '', 'ね', PRT),
    ('2029090', '', 'よ', PRT),
    ('1007340', '丈', 'だけ', PRT),
    ('1004200', '', 'けど', PRT),
    # --- people, time and money
    ('1005340', '', 'さん', None),
    ('1497610', '父', 'ちち', None),
    ('1514990', '母', 'はは', None),
    ('1582710', '日本', 'にほん', None),
    ('1464530', '日本語', 'にほんご', None),
    ('1464700', '日本人', 'にほんじん', None),
    ('1366410', '人', 'じん', None),
    ('2149890', '人', 'にん', None),
    ('1189100', '何人', 'なんにん', None),
    ('1294940', '歳', 'さい', None),
    ('1175570', '円', 'えん', None),
    ('2020680', '時', 'じ', None),
    ('1188770', '何時', 'なんじ', None),
    ('1502840', '分', 'ふん', None),
    ('2871532', '月', 'がつ', None),
    ('2084840', '年', 'ねん', None),
    ('1333450', '週', 'しゅう', None),
]
LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1']


def listed():
    """seq -> the level Waller's lists place it at (the lowest), each row's join checked as the levels check it."""
    out = {}
    known = set()
    for lv in LEVELS:
        with open(os.path.join(SRC, 'yomitan-jlpt-vocab', 'original_data', lv + '.csv'), encoding='utf-8') as fh:
            for r in csv.DictReader(fh):
                seq, _old = resolve(r)
                if seq and seq not in out:
                    out[seq] = lv
                if lv == 'n5':
                    known.update(x for x in (r['kanji'], r['kana']) if x)
    return out, known


def build():
    at, known = listed()
    for seq, form, reading, _p in ROWS:
        e = W.JM.get(seq)
        if not e or reading not in [r['t'] for r in e['r']] or (form and form not in [k['t'] for k in e['k']]):
            raise SystemExit('build_start: JMdict entry %s is no longer %s %s' % (seq, form, reading))
        if at.get(seq) in ('n5', 'n4'):
            raise SystemExit('build_start: %s is already a %s word' % (reading, at[seq].upper()))
        known.update(x for x in (form, reading) if x)
    notes = []
    for seq, form, reading, pos1 in ROWS:
        n = W.make_note(seq, form, reading, 'n5', known, pos1=pos1, sense_notes=True)
        n['from'] = at.get(seq)
        notes.append(n)
    clash = W.resolve_fronts(notes)
    lab = W.label_prompts(notes)
    return notes, clash, lab


SOURCES = (
    "Readings, meanings, notes on usage and the \"usually written in kana\" marks: JMdict (Electronic Dictionary "
    "Research and Development Group, CC BY-SA 4.0). Furigana: JmdictFurigana (CC BY-SA 4.0). Kanji: KANJIDIC2 "
    "(EDRDG, CC BY-SA 4.0) and KanjiVG (Ulrich Apel, CC BY-SA 3.0). The levels named above are those of Jonathan "
    "Waller's JLPT lists (tanos.co.uk, CC BY). Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR; the "
    "readings over them come from segmenting that corpus with MeCab and the UniDic dictionary, so a reading over "
    "an example sentence is a machine's and can occasionally be wrong — the headword's own reading is the "
    "dictionary's."
)

if __name__ == '__main__':
    notes, clash, lab = build()
    n = len(notes)
    nums = note_ids(DECK_ID, [x['seq'] for x in notes])
    cards = [{'id': 'u_%s_%d' % (DECK_ID, num), 'num': str(i), 'jmdict': x['seq'], 'type': TYPE_ID,
              'fields': x['fields']} for i, (x, num) in enumerate(zip(notes, nums), 1)]
    moved = {lv: sum(1 for x in notes if x['from'] == lv) for lv in ('n3', 'n2', 'n1')}
    unlisted = sum(1 for x in notes if not x['from'])
    noex = sum(1 for x in notes if not x['nex'])
    desc = (
        "The words a beginner needs before any word list: greetings and courtesies (こんにちは, ありがとう, "
        "すみません), the copula and the polite endings (です, だ, ます), the particles every sentence is held "
        "together by (は, が, を, に, で, の…), and a handful of words for people, time and money (さん, 円, 時, 日本). "
        f"{n} notes, each with TWO cards (Japanese → English, English → Japanese), each scheduled on its own, in a "
        "teaching order rather than by frequency. Study after hiragana and before JLPT N5; five to ten new cards a "
        "day finishes it in three to six weeks. — WHY THESE ARE NOT IN THE N5 DECK: the JLPT lists the level decks "
        "are built from follow the pre-2010 test specification, which kept its greetings and particles outside "
        f"the word list. They place {moved['n3']} of these words at N3, {moved['n2']} at N2 and {moved['n1']} at N1, "
        f"and {unlisted} (です, が, を, も, 日本語, 母…) at no level at all. Each is carded here once and not again in "
        "the level it was listed at. Words N5 and N4 already card (はい, いいえ, どうぞ, the numbers) are left to "
        "them. — The card is the vocabulary decks' card: the word as it is written, furigana and Hepburn romaji "
        "(the particle は is \"wa\", へ \"e\", を \"o\", and the speaker says them so), the meanings with the "
        "dictionary's own note on each sense (for a particle the note is the meaning: \"indicates location of "
        "action\"), and up to three real sentences with furigana and a speaker"
        + (f"; {noex} have no usable sentence in the corpus" if noex else "") + ". A word whose kanji are not N5 "
        "kanji is asked in kana and written in kanji on the back. The reverse card asks with the first sense alone. "
        "Nothing here is composed: what the dictionary has no entry for (でした, ました) is not carded. — " + SOURCES)
    meta = {
        'id': DECK_ID, 'title': TITLE,
        'subtitle': '%d greetings, particles and everyday basics — after hiragana, before N5' % n,
        'desc': desc, 'author': '', 'language': 'en', 'color': '#BC002D',
        'tags': ['japanese', 'beginner', 'greetings', 'particles', 'vocabulary'], 'glossMode': 'site',
        'types': {TYPE_ID: type_def()}, 'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    import importlib.util as iu
    sp = iu.spec_from_file_location('dg', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dedupe-glosses.py'))
    dg = iu.module_from_spec(sp); sp.loader.exec_module(dg)
    s = dg.dedupe(deck, 'Japanese')
    out = os.path.join(DECKS, FILE)
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote %s: %d notes / %d cards, %d bytes | no examples %d | from N3 %d, N2 %d, N1 %d, unlisted %d | '
          'fronts with furigana %d | questions labelled %d | English sides labelled %d'
          % (FILE, n, 2 * n, os.path.getsize(out), noex, moved['n3'], moved['n2'], moved['n1'], unlisted, clash,
             lab, s.get('labelled', 0)))
