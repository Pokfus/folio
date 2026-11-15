#!/usr/bin/env python3
"""ONE-OFF (2026-11-15): write ids.json from the decks as shipped on 2026-10-30, before the first re-ordering.

A card's id is what a reader's schedule hangs on (`S.cards` is keyed by it, and the Update press merges by it),
and until now it was the note's POSITION in the deck -- so any change of order, even one caused by a newer
Tatoeba export moving two frequency counts past each other, would have handed every reader's progress to a
different word.  ids.json pins each note's number to what identifies it (its JMdict entry, or its kana), and
every builder reads it (`common.note_ids`).  This script only ever needs running again if ids.json is lost: it
reads the numbers back out of the shipped decks.
"""
import glob, json, os
from common import DECKS, HERE

out = {}
for p in sorted(glob.glob(os.path.join(DECKS, '*Japanese*.folio-deck.json'))):
    d = json.load(open(p, encoding='utf-8'))
    did = d['meta']['id']
    m = {}
    for c in d['cards']:
        key = c.get('jmdict') or c['fields'].get('Kana') or (c['type'] == 'kanji' and c['fields']['Kanji'])
        n = int(c['id'].rsplit('_', 1)[1])
        assert key and key not in m, (did, key)
        m[key] = n
    out[did] = m
    print(did, len(m), 'max', max(m.values()))
json.dump(out, open(os.path.join(HERE, 'ids.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
