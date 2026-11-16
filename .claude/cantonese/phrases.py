#!/usr/bin/env python3
"""The phrases deck's expressions: Cantonese set phrases, slang, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json`, `freq.json` and the five level decks, and writes `selected-phr.json` in the shape
`select.py` writes for a level, with one more field, `sub`.  Not a CEFR level: an expression is a unit a
frequency list of words cannot see.

WHERE THE EXPRESSIONS COME FROM.  CC-Canto labels some of its own entries with what they are, and those
labels are the backbone: `slang` (277 entries -- 拗頸, 縮沙, 穿煲, 食死貓), `idiom`, `saying`,
`proverb` (口水多過茶, 山水有相逢), `metaphor`, `phrase` and `interjection`.  Two more sources add what
those labels miss: the four-character idioms CC-CEDICT marks "(idiom)" that people were heard SAYING
(HKCanCor or Tatoeba holds them -- of 4,670 such entries, 65), and the expressions HKCanCor's annotators
tagged as set expressions (`l`, `i`).  `INCLUDE` names a few everyday formulas none of these label.

FOUR SUBDECKS, one per expression, the first that applies:

  Proverbs  CC-Canto's `proverb`, or a CC-CEDICT gloss that says "(proverb)";
  Idioms    CC-Canto's `idiom` and `saying`, or a CC-CEDICT gloss that says "(idiom)";
  Slang     CC-Canto's `slang` and `metaphor`;
  Phrases   the rest: CC-Canto's `phrase` and `interjection`, HKCanCor's set expressions, `INCLUDE`.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN, and `EXCLUDE` names the rest, each with its reason: the
slang that is sexual, crude or a slur (CC-Canto files it beside the rest, untagged), and the ordinary
words CC-Canto also labels slang for one sense (牛皮 "cowhide", 熊貓 "panda"), whose card would lead with
the ordinary meaning and teach nothing as an expression.

THE ORDER within a subdeck is how often HKCanCor's speakers said the expression, then Tatoeba's count,
then the characters.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cantonese_level import LEVEL, f, words_below
from hand import EXCLUDE as LEVEL_EXCLUDE

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'

ORDER = ['Phrases', 'Slang', 'Idioms', 'Proverbs']
SUB_OF_POS = {'proverb': 'Proverbs', 'idiom': 'Idioms', 'saying': 'Idioms', 'slang': 'Slang',
              'metaphor': 'Slang', 'phrase': 'Phrases', 'interjection': 'Phrases'}

# Everyday formulas no label catches.  word: (jyutping, why)
INCLUDE = {
    '生日快樂': ('saang1 jat6 faai3 lok6', 'the birthday greeting'),
    '新年快樂': ('san1 nin4 faai3 lok6', 'the New Year greeting'),
    '聖誕快樂': ('sing3 daan3 faai3 lok6', 'the Christmas greeting'),
    '唔該晒': ('m4 goi1 saai3', '"thank you very much" for a service, A1\'s 唔該 with 晒'),
    '多謝晒': ('do1 ze6 saai3', '"thank you very much" for a gift, A1\'s 多謝 with 晒'),
}

EXCLUDE = {
    # sexual, crude or a slur
    '入肉': 'sexual', '春光': 'a sexual sense', '真空': 'a sexual sense', '賓州': 'a sexual pun',
    '軟腳蟹': 'a sexual sense', '鹹濕': 'sexual', '麻甩佬': 'sexual harassment', '青頭仔': 'sexual',
    '石罅米': 'prostitution', '索油': 'sexual harassment', '羊咩屎': 'crude', '狗屎垃圾': 'crude',
    '攪屎棍': 'crude', '蘇州屎': 'crude', '糯米屎窟': 'crude', '男盜女娼': '"whores"',
    '沙沙滾': 'womanising', '滾紅滾綠': 'womanising', '煲老藕': 'mocks a relationship by age',
    '黃面婆': 'derogatory', '黑古勒特': 'pejorative about skin colour', '老番': 'an ethnic label',
    '西洋菜': 'an ethnic label for women', '戴綠帽': 'infidelity', '犯賤': 'masochism',
    '食拖鞋飯': 'demeaning', '鐵嘴雞': 'demeaning to women', '八卦婆': 'demeaning to women',
    '三姑六婆': 'demeaning to women', '獐頭鼠目': 'demeaning about looks', '撞鬼': 'a curse',
    '媽媽聲': 'cursing', '折墮': 'a curse', '鬼妹': 'an ethnic label for women',
    # an ordinary word CC-Canto also labels slang for one sense: the card would lead with the word
    '偉大': 'an ordinary word', '冰山': 'an ordinary word', '千祈': 'an ordinary word',
    '大人': 'an ordinary word', '太空人': 'an ordinary word', '手指': 'an ordinary word',
    '檸檬': 'an ordinary word', '熊貓': 'an ordinary word', '牛皮': 'an ordinary word',
    '碼頭': 'an ordinary word', '黃金': 'an ordinary word', '雲吞': 'an ordinary word',
    '顏色': 'an ordinary word', '骨子': 'an ordinary word', '算數': 'an ordinary word',
    '萬歲': 'an ordinary word', '鵪鶉': 'an ordinary word', '通氣': 'an ordinary word',
    '小兒科': 'an ordinary word', '飯桶': 'an ordinary word', '霸王': 'an ordinary word',
    '無事': 'an ordinary word', '角落頭': 'an ordinary word', '奉旨': 'an ordinary word',
    '大食': 'an ordinary word', '撈起': 'an ordinary word', '豆泥': 'an ordinary word',
    '鬼混': 'an ordinary word', '掃興': 'an ordinary word', '埋單': 'an ordinary word',
    '同步': 'an ordinary word', '嗰便': 'an ordinary word', '埋便': 'an ordinary word', '途中': 'an ordinary word', '往時': 'an ordinary word',
    '神推鬼㧬': 'a rarer spelling of 神推鬼拱, which is kept',
    # a gloss that is not the expression's meaning
    '番鬼佬涼茶': 'its only gloss is "beer", the joke unexplained',
    '監人乃後': "CC-Canto's gloss misreads it ('force someone to accept')",
}


def hk(fr):
    return sum(sum(t.values()) for t in (fr.get('pos') or {}).values())


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    freq = json.load(open('freq.json', encoding='utf-8'))
    below = words_below()
    taught = {k.split('|')[0] for k in below}
    cands = {}          # word -> (sub, jp, source)

    def offer(w, sub, jp, why):
        if w in taught or w in EXCLUDE or w in LEVEL_EXCLUDE or len(w) < 2:
            return
        old = cands.get(w)
        if old is None or ORDER.index(sub) > ORDER.index(old[0]):
            cands[w] = (sub, jp, why)

    for w, L in lex.items():
        for e in L:
            if not e['g']:
                continue
            gl = ' '.join(e['g'])
            if e['pos'] in SUB_OF_POS:
                offer(w, SUB_OF_POS[e['pos']], e['j'], 'CC-Canto: ' + e['pos'])
            if len(w) >= 4 and '(proverb)' in gl and w in freq:
                offer(w, 'Proverbs', e['j'], 'CC-CEDICT proverb, heard')
            elif len(w) >= 4 and '(idiom)' in gl and w in freq and freq[w]['j'].get(e['j']):
                offer(w, 'Idioms', e['j'], 'CC-CEDICT idiom, heard')
    for w, fr in freq.items():
        for j, tags in (fr.get('pos') or {}).items():
            if (tags.get('l', 0) + tags.get('i', 0)) and w in lex and any(e['j'] == j and e['g'] for e in lex[w]):
                offer(w, 'Idioms' if tags.get('i') else 'Phrases', j, 'HKCanCor set expression')
    missing = []
    for w, (jp, why) in INCLUDE.items():
        if any(e['j'] == jp and e['g'] for e in lex.get(w, [])):
            offer(w, 'Phrases', jp, 'INCLUDE: ' + why)
        else:
            missing.append(w)

    rows = []
    for w, (sub, jp, why) in cands.items():
        fr = freq.get(w, {})
        rows.append({'key': f'{w}|{jp}', 'word': w, 'jp': jp, 'freq': fr.get('j', {}).get(jp, 0),
                     'hk': hk(fr), 'source': 'phrase', 'topic': '', 'sub': sub, 'why': why})
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['hk'], -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f"  {len(rows)} expressions: " + ', '.join(f'{v} {k.lower()}' for k, v in by.items()))
    if missing:
        print('  INCLUDE not in the dictionaries (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
