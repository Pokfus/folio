#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining words.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by corpus frequency (the commonest first), each marked with where
it came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`thai_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a word whose every sense is weak (rare, archaic, slang, a bound morpheme
    ...) -- the corpus's count belongs to a commoner use it is spelt like;
  · a word with only proper-noun, phrase or proverb entries;
  · a word that is ALSO a proper noun's spelling keeps only its other entries'
    claim (the card drops the name, `build_deck.entries_for`);
  · the repetition mark ๆ, which the corpus counts as a word;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from th import fold
from thai_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking.  Each with its reason.
EXCLUDE = {
    'ฯ': 'the abbreviation mark, not a word',
    'ๆ': 'the repetition mark, not a word',
}

# A COMPOUND THE INVENTORY NEEDS AND WIKTIONARY HAS NO ENTRY FOR.  The days of
# the week are written วัน "day" + the day's own name (วันจันทร์ "Monday" is
# "day of the moon"), and Wiktionary files only the second half; likewise the
# language names (ภาษา "language" + ไทย).  Each is composed from its PARTS' own
# entries -- the romanisation is the parts' Paiboon readings joined, so nothing
# about the sound is typed here -- and only the English, the plain meaning of the
# compound, is written by hand.  The card is otherwise an ordinary card.
COMPOSE = {
    'วันจันทร์': ('วัน จันทร์', 'noun', 'Monday'),
    'วันอังคาร': ('วัน อังคาร', 'noun', 'Tuesday'),
    'วันพุธ': ('วัน พุธ', 'noun', 'Wednesday'),
    'วันพฤหัสบดี': ('วัน พฤหัสบดี', 'noun', 'Thursday'),
    'วันศุกร์': ('วัน ศุกร์', 'noun', 'Friday'),
    'วันเสาร์': ('วัน เสาร์', 'noun', 'Saturday'),
    'วันอาทิตย์': ('วัน อาทิตย์', 'noun', 'Sunday'),
    'ภาษาไทย': ('ภาษา ไทย', 'noun', 'Thai (the language)'),
    'ภาษาอังกฤษ': ('ภาษา อังกฤษ', 'noun', 'English (the language)'),
    'คนไทย': ('คน ไทย', 'noun', 'a Thai person; Thai people'),
    'ฝนตก': ('ฝน ตก', 'verb', 'to rain (literally "rain falls")'),
}

LEAD_TOPICS = {'greetings and politeness', 'particles'}

# Swearing and insults are never in a level deck.
SWEARS = {'เหี้ย', 'ควาย', 'สัตว์', 'มึง', 'กู', 'ไอ้', 'อี', 'ส้นตีน', 'เย็ด', 'ห่า'}


def usable(L):
    return any(not g['weak'] for e in L['entries'] if e['pos'] != 'name' for g in e['glosses'])


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    freq = json.load(open('freq.json', encoding='utf-8'))     # extract.py's, for a compound
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = fold(w)
            if k in seen or k in below:
                continue
            L = lex.get(k)
            via = ''
            if not L and w in COMPOSE:
                parts, cpos, gloss = COMPOSE[w]
                if all(fold(p) in lex and 'entries' in lex[fold(p)] for p in parts.split()):
                    seen.add(k)
                    rows.append({'key': k, 'via': '', 'word': w, 'freq': freq.get(k, 0), 'pos': cpos,
                                 'source': 'inventory', 'topic': topic,
                                 'compose': {'parts': parts.split(), 'gloss': gloss}})
                    continue
            if L and 'alt_of' in L:
                via = L['alt_of']
                tgt = lex.get(via)
                own = L.get('roman') or []
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
                if L is not None and not own:
                    L = None          # a pointer with no sound of its own is not carded
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            row = {'key': k, 'via': via, 'word': L['word'], 'freq': L['freq'], 'pos': pos or '',
                   'source': 'inventory', 'topic': topic}
            if via:
                row['roman'] = own[0]
            rows.append(row)
    n_inv = len(rows)
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if 'entries' not in L or L.get('formonly'):
            continue
        if k in seen or k in below or k in swears or k in excl:
            continue
        if ' ' in k or not usable(L) or L['freq'] <= 0:
            continue
        if all(e['pos'] in ('phrase', 'proverb', 'name') for e in L['entries']):
            continue
        seen.add(k)
        fill.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    # THE FIRST DAY'S WORDS LEAD, then everything by frequency.  Both corpora are
    # written Thai, where สวัสดี "hello" and ขอบคุณ "thank you" are rare -- dealt by
    # frequency alone they came at about the 450th card of 500, behind ผู้ "person"
    # and ซึ่ง "which".  A learner says them on the first day, so the inventory's
    # greetings and particles are dealt first, in frequency order among themselves.
    rows.sort(key=lambda r: (r['topic'] not in LEAD_TOPICS, -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
