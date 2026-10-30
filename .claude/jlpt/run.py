#!/usr/bin/env python3
"""Every Japanese deck, in order:  PYTHONPATH=<fugashi + unidic_lite> python3 run.py [--no-extract]

  fetch      the downloads are listed in docs/lang-decks.md's `.claude/jlpt/` bullet (curl into .claude/jlpt-cache/)
  extract    extract.py   -> jmdict / kanji / furigana / tatoeba / freq JSON in the cache
  levels     build_level.py n5 … n1, each on top of the shipped decks below it
  kana       build_kana.py (its example words are read out of the level decks)
  extras     build_extra.py phrases, idioms (they leave out what the levels already card)
"""
import subprocess, sys
PY = sys.executable
steps = [] if '--no-extract' in sys.argv else [['extract.py']]
steps += [['build_level.py', l] for l in ('n5', 'n4', 'n3', 'n2', 'n1')]
steps += [['build_kana.py'], ['build_extra.py', 'phrases'], ['build_extra.py', 'idioms']]
for s in steps:
    print('==', ' '.join(s), flush=True)
    subprocess.run([PY] + s, check=True)
