#!/usr/bin/env python3
"""Every Japanese deck, in order:  PYTHONPATH=<fugashi + unidic_lite> python3 run.py [--no-extract]

  fetch      the downloads are listed in docs/lang-decks.md's `.claude/jlpt/` bullet (curl into .claude/jlpt-cache/)
  extract    extract.py   -> jmdict / kanji / furigana / tatoeba / freq JSON in the cache
  start      build_start.py, the first-words deck: the lowest deck, read by every level as the one below it
  levels     build_level.py n5 … n1, each on top of the shipped decks below it
  kanji      build_kanji.py, the N5 kanji (ordered by the first-words deck and N5, whose words are its examples)
  kana       build_kana.py (its example words are read out of the level decks)
  extras     build_extra.py phrases, idioms (they leave out what the decks above already card)

Card ids are pinned in ids.json (`common.note_ids`), which a builder rewrites only when a deck gains a note.
"""
import subprocess, sys
PY = sys.executable
steps = [] if '--no-extract' in sys.argv else [['extract.py']]
steps += [['build_start.py']] + [['build_level.py', l] for l in ('n5', 'n4', 'n3', 'n2', 'n1')]
steps += [['build_kanji.py'], ['build_kana.py'], ['build_extra.py', 'phrases'], ['build_extra.py', 'idioms']]
for s in steps:
    print('==', ' '.join(s), flush=True)
    subprocess.run([PY] + s, check=True)
