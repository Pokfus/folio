#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by frequency (the commonest first), each marked with where it came from
(`inventory` or `frequency`) and, for an inventory word, the parts of speech meant.

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`burmese_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, royal, offensive ...);
  · a lemma with no reading (Wiktionary gives it no IPA);
  · a phrase, an interjection or a number the inventory does not teach;
  · A WORD OF ONE SYLLABLE (`my.syllables`).  Its count cannot be trusted: every
    syllable the word cut could not place -- the pieces of a name, a compound
    Wiktionary lacks, the noun prefix အ-, the title ဦး "U" -- is counted as a
    one-syllable token, so အ "to be mute", တ "to yearn" and ပ "to shine" ranked
    among the commonest words.  The everyday one-syllable words (most of Burmese's
    verbs) come through the inventory, which carries them by name;
  · the hand list `EXCLUDE`, each line with its reason -- above all the formulae of
    the Wikipedia's bot-written village stubs (ကိုးကား "References", the census
    lines, "village tract", "township"), which are most of its articles, and the
    particles of the LITERARY register, which A1 does not teach (inventory.py).
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from my import key, syllables
from burmese_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

LITERARY = 'a particle of the literary register; A1 teaches the spoken one'
MONTH = 'a month, counted from the articles\' dates; the months are a set, left for A2'
STUB = 'its count is the formulae of the Wikipedia\'s bot-written village and township stubs'

# Read off the A1 ranking (2026-11-15).  Each with its reason.
EXCLUDE = {
    'ကိုးကား': 'its count is the "ကိုးကား" (References) heading under the articles',
    'ကုတ်': 'its count is the "code" of the census and postcode lines, not "to scratch"',
    'သန်းခေါင်': 'its count is သန်းခေါင်စာရင်း "census" in the stubs, not "midnight"',
    'ကျေးရွာအုပ်စု': STUB, 'မြို့နယ်': STUB, 'ခရိုင်': STUB, 'တိုင်းဒေသကြီး': STUB,
    'ပြည်နယ်': STUB, 'လူဦးရေ': STUB, 'စုစုပေါင်း': STUB, 'တည်ရှိ': STUB, 'နေထိုင်': STUB,
    'စာရင်း': STUB,
    'ကျား': 'its count is ကျား "male" in the census lines, not "tiger" (A1 teaches it by name)',
    'ရှမ်း': 'a people\'s name (the Shan), from the stubs of Shan State',
    'သည်': LITERARY, '၏': LITERARY, '၌': LITERARY, '၍': LITERARY, 'သော': LITERARY,
    'သည့်': LITERARY, 'မည်': LITERARY, 'နှင့်': LITERARY, 'ဖြင့်': LITERARY, 'သို့': LITERARY,
    'ဤ': LITERARY, 'ထို': LITERARY, 'တွင်': LITERARY, '၎င်း': LITERARY, 'ခြင်း': LITERARY,
    'ဟု': LITERARY, 'သော်လည်း': LITERARY, 'ယင်း': LITERARY, 'အားဖြင့်': LITERARY,
    'လျက်': LITERARY, 'ရန်': LITERARY, 'သည်မှာ': LITERARY, 'စသည်': LITERARY,
    'လည်းကောင်း': LITERARY, 'သို့မဟုတ်': LITERARY, 'သို့သော်': LITERARY,
    'ယခု': 'the literary "now"; A1 teaches the spoken အခု',
    'မိမိ': 'the literary reflexive "oneself"; A1 teaches the spoken ကိုယ်',
    # the Western months, from the articles' dates: a set, left for A2
    'ဇန်နဝါရီ': MONTH, 'ဖေဖော်ဝါရီ': MONTH, 'မတ်': MONTH, 'ဧပြီ': MONTH, 'မေ': MONTH,
    'ဇွန်': MONTH, 'ဇူလိုင်': MONTH, 'ဩဂုတ်': MONTH, 'စက်တင်ဘာ': MONTH, 'အောက်တိုဘာ': MONTH,
    'နိုဝင်ဘာ': MONTH, 'ဒီဇင်ဘာ': MONTH,
    # Read off the A2 ranking (2026-11-16).
    'ရာမ': 'Wiktionary glosses only the drug "ya ba"; its count is Rama, of the Ramayana',
    'ရခိုင်': 'Wiktionary glosses only a banana; its count is Rakhine, the state and its people',
    'သီရိ': 'its count is the element Thiri of royal and personal names',
    'ရာဇ': 'its count is the element Raza of royal names and of ရာဇဝင် "chronicle"',
    'ယနေ့': 'the literary "today"; A1 teaches the spoken ဒီနေ့',
    'ယခင်': 'the literary "formerly"', 'ထို့ပြင်': LITERARY, 'ထို့အပြင်': LITERARY,
    'သို့ရာတွင်': LITERARY, 'လိမ့်မည်': LITERARY, 'ဟူသည်': LITERARY, 'နှင့်တကွ': LITERARY,
    'အကယ်၍': LITERARY, 'များသောအားဖြင့်': LITERARY,
    'မြန်မာ့': 'defined only as the induced creaky (possessive) form of မြန်မာ, a name', 'ကာ': LITERARY, 'လျှင်': LITERARY,
}


def usable(L):
    return any(not g['weak'] for e in L['entries'] for g in e['glosses'])


def has_reading(L):
    return any(e['ipa'] for e in L['entries'])


def main():
    D = json.load(open('lex.json', encoding='utf-8'))
    lex, ptr, pipa = D['lemmas'], D['pointers'], D['ptr_ipa']
    below = words_below()
    # a card the inventory headed by a pointer's spelling (A1's မနက်) teaches the lemma it
    # points to (နံနက်): that lemma is taught too, or A2 would teach "morning" again
    below |= {ptr[k] for k in below if k in ptr}
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            k = key(w)
            head, head_ipa = '', ''
            if k not in lex and k in ptr:
                head, head_ipa = w, pipa.get(k, '')      # the spelling asked for heads the card
                k = ptr[k]
            if k in seen or k in below:
                continue
            L = lex.get(k)
            want = [p for p in pos.split('+') if p]
            if not L or (want and not any(e['pos'] in want for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            rows.append({'key': k, 'word': head or L['word'], 'freq': L['freq'], 'pos': want,
                         'source': 'inventory', 'topic': topic, 'ipa': head_ipa})
    n_inv = len(rows)
    excl = {key(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if k in seen or k in below or k in excl:
            continue
        if not usable(L) or not has_reading(L) or L['freq'] < 1:
            continue
        if all(e['pos'] in ('phrase', 'intj', 'num') for e in L['entries']):
            continue
        if len(syllables(k)) < 2:
            continue
        seen.add(k)
        fill.append({'key': k, 'word': L['word'], 'freq': L['freq'], 'pos': [],
                     'source': 'frequency', 'topic': '', 'ipa': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
