#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`mongolian_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, Inner Mongolian ...);
  · a key of two letters or fewer: a short word takes its count from the
    endings the fallback peels more than from its use;
  · a multi-word entry, a phrase, an interjection or a numeral (the numbers are
    the inventory's, the phrases a phrases deck's);
  · a name of a people or a language the inventory does not teach (the
    encyclopaedia's history articles rank them high);
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mn import key, verb_stem
from mongolian_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-16).  Each with its reason.
EXCLUDE = {
    'нийх': 'its count is нийслэл "capital" and нийт "total" peeled, not "to blow (one\'s nose)"',
    'тул': 'its count is тулд "in order to, because", not the taimen (a fish)',
    'хув': 'its count is хувь "share" and хувьсгал "revolution" peeled, not "amber"',
    'хур': 'its count is хурал "meeting" and хурд "speed" peeled, not "precipitation"',
    'гэдэг': 'a participle of гэх "to say" ("called"), which A1 teaches',
    'ирсэн': 'the past participle of ирэх "to come", which A1 teaches',
    'үүний': 'the genitive of энэ "this", which A1 teaches',
    'дэлхийн': 'the genitive of дэлхий "earth, world", a word of its own',
    'үндэсний': 'the genitive of үндэс "root, nation", a word of its own',
    'хүрээлэн': 'Wiktionary glosses "garden"; its count is хүрээлэн "institute" in the names of '
                'institutions',
    'хэмээх': 'the formal "to say", a second word for гэх, which A1 teaches',
    'онгоц': 'Wiktionary glosses "trough" first; its count is нисэх онгоц "aeroplane" and усан '
             'онгоц "ship", and A1 teaches нисэх онгоц',
    # Read off the A2 ranking (2026-11-16).
    'сур': 'its count is сурах "to learn" and сургууль "school" peeled, not "sling, strap"',
    'ром': 'its count is Ром, Rome, not "rum"',
    'авс': 'its count is авсан "took" (авах) peeled, not "coffin"',
    'дайр': 'its count is дайрах "to attack" and дайралт peeled, not "abrasion"',
    'дайх': 'its count is дайн "war" peeled, not "to haul off"',
    'шах': 'its count is шахах "to press" peeled, not the knucklebone or the shah',
    'сал': 'its count is салах "to separate", which A2 teaches, not "raft"',
    'хаш': 'its count is хашаа "fence" peeled, not "jade"',
    'тэс': 'its count is тэсэх "to endure" peeled, not "rowan"',
    'байц': 'its count is байцаа "cabbage" and байцаах peeled, not "attendance"',
    'хүснэг': 'its count is хүснэгт "table, chart", which Wiktionary lacks',
    'болд': 'its count is the given name Болд, not "steel"',
    'дов': 'its count is довтлох "to gallop, to charge" peeled, not "hill"',
    'мэс': 'its count is мэс засал "surgery", which Wiktionary lacks, not "knife"',
    'лал': 'glossed "muslim; heretic", the second sense offensive',
    'ойрад': 'a people\'s name (the Oirats), from the history articles',
    'зүүнгар': 'a people\'s name (the Dzungars), from the history articles',
    'хасаг': 'a people\'s name (the Kazakhs), from the history articles',
    'хошууч': 'an abolished noble title, from the history articles',
    'шадар': 'an old court title ("minion"), from the history articles',
    'хиа': 'an old court title ("aide, page"), from the history articles',
    'үхсэн': 'the past participle of үхэх "to die", which A2 teaches',
    # Read off the B1 ranking (2026-11-16).
    'байна': 'Wiktionary\'s only sense is a usage note; it is the present of байх "to be", taught at A1',
    'чүдэнз': 'a spelling of шүдэнз "match", which B1 teaches',
    'сумо': 'a spelling of сүмо "sumo", which B1 teaches',
    'больниц': 'a Russian loan; the Mongolian word, эмнэлэг "hospital", is taught at A1',
    'масло': 'a Russian loan; the Mongolian word, тос "butter, oil", is taught at A2',
    'констракшн': 'an English loan of slang; барилга "building, construction" is taught at A2',
    'үеэ': 'its count is үе "time, period" with the reflexive -ээ, not "in earlier times"',
    'секс': 'sexual vocabulary the level does not need',
    'гомосекс': 'sexual vocabulary the level does not need',
    'үтрээ': 'anatomical vocabulary the level does not need',
    'янхан': 'an offensive word the level does not need',
    'новш': 'a vulgar word the level does not need',
    'хүчиндэх': 'vocabulary of sexual violence the level does not need',
    'баас': 'a vulgar sense first ("shit"); the level does not need it',
    'берилли': 'a chemical element, from the encyclopaedia\'s science articles',
    'сканди': 'a chemical element, from the encyclopaedia\'s science articles',
    'неон': 'a chemical element, from the encyclopaedia\'s science articles',
    'аргон': 'a chemical element, from the encyclopaedia\'s science articles',
    'лити': 'a chemical element, from the encyclopaedia\'s science articles',
    'гели': 'a chemical element, from the encyclopaedia\'s science articles',
    'радий': 'a chemical element, from the encyclopaedia\'s science articles',
    'кали': 'a chemical element, from the encyclopaedia\'s science articles',
    'натри': 'a chemical element, from the encyclopaedia\'s science articles',
    'магни': 'a chemical element, from the encyclopaedia\'s science articles',
    'хлор': 'a chemical element, from the encyclopaedia\'s science articles',
    'фтор': 'a chemical element, from the encyclopaedia\'s science articles',
    'фосфор': 'a chemical element, from the encyclopaedia\'s science articles',
    'титан': 'a chemical element, from the encyclopaedia\'s science articles',
    'кальци': 'a chemical element, from the encyclopaedia\'s science articles',
    'нанометр': 'a scientific unit, from the encyclopaedia\'s science articles',
    'микрометр': 'a scientific unit, from the encyclopaedia\'s science articles',
    'микрон': 'a scientific unit, from the encyclopaedia\'s science articles',
    'зүй': 'its count is the "-logy" of the names of sciences, not "rule, principle"',
}


def usable(L):
    return any(not g['weak'] for e in L['entries'] for g in e['glosses'])


GENITIVE = ('гийн', 'ийн', 'ын', 'ний', 'ны')
PEOPLE = re.compile(r"^[A-Z][a-z]+(?:$|,| \(| people\b| person\b)")


def genitive_twin(k, L, lex):
    """From B1 on: a lemma that is only another lemma's genitive (аймгийн "provincial" is аймаг
    "province" + -ийн, төрийн is төр + -ийн): an adjective or noun ending in a genitive ending
    whose stem, or the stem with its dropped vowel, is a lemma of its own.  A bare -н is not
    read (саван "soap" is no genitive of сава).  A1 and A2 shipped without the rule."""
    if not all(e['pos'] in ('adj', 'noun', 'pron') for e in L['entries']):
        return False
    for g in GENITIVE:
        if k.endswith(g) and len(k) - len(g) >= 2:
            st = k[:-len(g)]
            if any(x in lex for x in (st, st + 'а', st + 'э', st + 'о', st + 'ө', st + 'ь')):
                return True
    return False


def people_name(L):
    """From B1 on, the A1/A2 capital rule made strict: every ordinary gloss is a capitalised name
    standing alone ("German", "Khalkha (a subgroup …)", "Manchu people") -- not "To stay the
    night", "Eurasian magpie" or "Przewalski's horse", which A2's rule would have dropped."""
    gl = [g['g'] for e in L['entries'] for g in e['glosses'] if not g['weak']]
    return bool(gl) and all(PEOPLE.match(g) and not g.startswith('To ') for g in gl)


def main():
    D = json.load(open('lex.json', encoding='utf-8'))
    lex, ptr = D['lemmas'], D['pointers']
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = key(w)
            if k not in lex and k in ptr:
                k = ptr[k]
            if k in seen or k in below:
                continue
            L = lex.get(k)
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            rows.append({'key': k, 'word': L['word'], 'freq': L['freq'], 'pos': pos,
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    excl = {key(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if k in seen or k in below or k in excl or ' ' in k or len(k) <= 2:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        if all(e['pos'] in ('phrase', 'intj', 'num') for e in L['entries']):
            continue
        if LEVEL not in ('a1', 'a2'):
            if genitive_twin(k, L, lex) or people_name(L):
                continue
        elif all(g['g'][:1].isupper() for e in L['entries'] for g in e['glosses'] if not g['weak']):
            continue                     # a people, a language, a name: "German", "Han Chinese"
        seen.add(k)
        fill.append({'key': k, 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
