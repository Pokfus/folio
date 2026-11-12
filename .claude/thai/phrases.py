#!/usr/bin/env python3
"""The phrases deck's expressions: Thai set phrases, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the five level decks, writes `selected-phr.json` in the
shape `select.py` writes for a level, with three more fields: `sub`, `etym`
and `count`.

Not a CEFR level: an expression is a unit a frequency list of words cannot
see.  Three subdecks, the Hindi arrangement (`docs/hindi-decks-plan.md` §11):

  Phrases   an expression Wiktionary files as a phrase or an interjection and
            does NOT tag idiomatic -- the everyday formulas (สบายดีไหม,
            ยินดีต้อนรับ, สุขสันต์วันเกิด) and the signs (ห้ามสูบบุหรี่);
  Idioms    an expression with a sense Wiktionary TAGS idiomatic (หักหลัง
            "to betray", แพะรับบาป "scapegoat", วัวหายล้อมคอก);
  Proverbs  Wiktionary's part of speech `proverb`.

One subdeck per expression: a proverb outranks an idiom outranks a phrase.

"MORE THAN ONE WORD" IN A SCRIPT WITHOUT SPACES.  Hindi asks whether the
headword holds a space; Thai writes none.  Here an expression is a headword
that CUTS into two or more dictionary words (each of two letters or more,
none the headword itself), or holds a space -- the two halves of a proverb,
a repetition mark (ลม ๆ แล้ง ๆ).  This keeps out the 100-odd one-word
interjections, nearly all of them sounds (โฮ่ง a dog's bark, อู๊ด a pig's
oink); `INCLUDE` brings back the three set greetings it would lose
(อรุณสวัสดิ์ "good morning" cuts into nothing the dictionary holds).

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`thai_level.words_below`), a
weak sense is not a reason to include an expression, an entry that is only
"abstract noun of X" (การฆ่าช้างเอางา beside ฆ่าช้างเอางา) or only a pointer
is not one, and `EXCLUDE` names the rest, each with its reason.

THE ORDER is how many of Tatoeba's Thai sentences contain the expression on
the word cut, then its corpus frequency (both corpora count few phrases whole),
then its spelling.  Tatoeba's Thai is small, so most expressions are found in
no sentence; the description says so.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from functools import lru_cache
from th import fold
from thai_level import LEVEL, f, words_below
import examples

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'

ORDER = ['Phrases', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj', 'prep_phrase'}

# One-word set formulas the cut cannot see as two words.  Each says why.
INCLUDE = {
    'อรุณสวัสดิ์': 'the formal "good morning", a set greeting (อรุณ "dawn" + สวัสดิ์)',
    'ราตรีสวัสดิ์': 'the formal "good night", a set greeting (ราตรี "night" + สวัสดิ์)',
    'สายัณห์สวัสดิ์': 'the formal "good evening", a set greeting (สายัณห์ "evening" + สวัสดิ์)',
}

# Never taught, whatever the source says.  Each line says why.
EXCLUDE = {
    # PHRASEBOOK SENTENCES, NOT SET PHRASES (the Hindi rule)
    'ผมรักคุณ': 'a phrasebook sentence ("I love you", a man speaking) built from A1 words',
    'ฉันรักคุณ': 'a phrasebook sentence ("I love you") built from A1 words',
    'รับบัตรเครดิตไหม': 'a phrasebook question ("do you accept credit cards?") built from level words',
    # slogans
    'เรารักในหลวง': 'a royal slogan ("we love the king"), not a phrase of speech',
    # a word, not two: a loanword the cut splits by accident
    'โอเค': 'one loanword ("OK"), which the cut splits as โอ + เค',
    'แหวะ': 'one interjection (the sound of retching), which the cut splits as แห + วะ',
    # pointers and variants with no meaning of their own
    'ตักบาตร': 'defined only as "synonym of ใส่บาตร", which the deck teaches',
    'ดูก่อน': 'defined only as "synonym of ดูกร", which the deck teaches',
    'เจริญพวง': 'a variant of เจริญพร, the monk\'s greeting the deck teaches',
    # a learner would read it as a number
    'ห้าร้อย': '"criminal" is a slang sense of ห้าร้อย "five hundred"; the deck teaches โจรห้าร้อย',
    # THE SAME EXPRESSION TWICE: one form is taught, the commonest
    'สบายดีหรือ': 'the same question as สบายดีไหม "how are you?", with the other question particle',
    'เป็นต้นว่า': 'the same as เป็นต้น "for instance", which the deck teaches',
    'ทานให้อร่อย': 'the polite form of กินให้อร่อย "enjoy your meal", which the deck teaches',
    'ทานให้อร่อยนะ': 'กินให้อร่อย "enjoy your meal" again, politer and with นะ',
    'ออกเรือน': '"to get married" again; the deck teaches the idiom เป็นฝั่งเป็นฝา',
    'กลับตัว': 'the short form of กลับเนื้อกลับตัว "to turn over a new leaf", which the deck teaches',
    'กล้วย ๆ': '"easy" again; the deck teaches the idiom ปอกกล้วยเข้าปาก',
    'ขี้ราดโทษล่อง': "the same idiom as รำชั่วโทษพาทย์ (blaming another for one's own fault), coarser",
    'เก็บดอกไม้': 'the same euphemism as ยิงกระต่าย "to urinate", and literally "to pick flowers"',
    'เกลียดปลาไหลกินน้ำแกง': 'the same idiom as เกลียดตัวกินไข่, which the deck teaches',
    'บาปซ้ำกรรมซัด': 'one of five spellings of "misfortunes never come singly"; the deck teaches เคราะห์ซ้ำกรรมซัด',
    'ผีซ้ำกรรมซัด': 'one of five spellings of "misfortunes never come singly"; the deck teaches เคราะห์ซ้ำกรรมซัด',
    'ผีซ้ำด้ำพลอย': 'one of five spellings of "misfortunes never come singly"; the deck teaches เคราะห์ซ้ำกรรมซัด',
    'เวรซ้ำกรรมซัด': 'one of five spellings of "misfortunes never come singly"; the deck teaches เคราะห์ซ้ำกรรมซัด',
    'เสร็จศึกฆ่าขุนพล': 'the same proverb as เสร็จนาฆ่าโคถึก, which the deck teaches',
    'สอนจระเข้ให้ว่ายน้ำ': 'สอนจระเข้ว่ายน้ำ with ให้ added; the deck teaches the shorter form',
    'กบในกะลาครอบ': 'กบในกะลา "a frog under a coconut shell" with ครอบ added; the deck teaches the shorter form',
    'เอามะพร้าวห้าวไปขายสวน เอาแป้งนวลไปขายชาววัง': 'two idioms the deck teaches, joined',
    # sexual
    'เจาะไข่แดง': 'a sexual idiom ("to take a woman\'s virginity")',
    'กินไข่แดง': 'a sexual idiom ("to take a woman\'s virginity")',
}

BARE = re.compile(r'^(?:abstract noun of |synonym of [^\s(]+ \([^“”()]*\)$|alternative (?:form|spelling) of )')


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak'] and not BARE.match(g['g'])]


def splitter(lex):
    ok = lambda w: len(w) >= 2 and w in lex and 'entries' in lex[w]

    def parts(k):
        w = k.replace(' ', '')

        @lru_cache(None)
        def best(i):
            if i == len(w):
                return 0
            out = None
            for j in range(len(w), i + 1, -1):
                if j - i < len(w) and ok(w[i:j]):
                    r = best(j)
                    if r is not None and (out is None or r + 1 < out):
                        out = r + 1
            return out
        return best(0) or 0
    return parts


def classify(lex):
    parts = splitter(lex)
    rows = {}
    for k, L in lex.items():
        if 'entries' not in L or L.get('formonly'):
            continue
        if not (' ' in k or k in INCLUDE or parts(k) >= 2):
            continue
        for e in L['entries']:
            if e['pos'] == 'name':
                continue
            gl = good(e)
            if not gl:
                continue
            tags = {t for g in gl for t in g['tags']}
            if e['pos'] == 'proverb':
                sub = 'Proverbs'
            elif 'idiomatic' in tags:
                sub = 'Idioms'
            elif e['pos'] in PHRASE_POS:
                sub = 'Phrases'
            else:
                continue
            rank = ORDER.index(sub)
            if k not in rows or rank > rows[k][1]:
                rows[k] = (sub, rank, e['pos'], e.get('etym', ''))
    return rows


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    excl = {fold(s) for s in EXCLUDE}
    rows, noroman = [], []
    for k, (sub, _, pos, etym) in classify(lex).items():
        if k in below or k in excl:
            continue
        L = lex[k]
        if not any(e['roman'] for e in L['entries'] if e.get('etym', '') == etym):
            noroman.append(k)
            continue
        rows.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'],
                     'pos': pos, 'etym': etym,     # the chosen entry leads (เจอกัน: "see you")
                     'source': 'phrases', 'topic': '', 'sub': sub})
    # how many Tatoeba sentences hold each expression, on the word cut
    seg = examples.segmenter(lex)
    sents = []
    for _, th, _ in examples.load():
        text, coarse, fine = seg.boundaries(th)
        sents.append((text, coarse, fine))
    for r in rows:
        w = fold(r['word'])
        r['count'] = sum(1 for text, coarse, fine in sents
                         if w in text and (examples.spans_in(text, w, coarse)
                                           or examples.spans_in(text, w, fine)))
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['count'], -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f'  {len(rows)} expressions: ' + ', '.join(f'{by[s]} {s.lower()}' for s in ORDER) +
          f'; {sum(1 for r in rows if r["count"])} occur in a Tatoeba sentence')
    if noroman:
        print('  NO ROMANISATION (dropped):', ' '.join(noroman))


if __name__ == '__main__':
    main()
