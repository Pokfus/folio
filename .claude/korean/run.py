#!/usr/bin/env python3
"""Every Korean deck, in order:  PYTHONPATH=<xlrd + kiwipiepy> python3 run.py [--no-extract]

  fetch      curl these into .claude/korean-cache/src/ (gitignored):
               nikl.xls       https://www.korean.go.kr/common/download.do?file_path=etcData&c_file_name=5a4a2f5c-66c9-425d-88fb-854289ea2521_0.xls&o_file_name=x.xls
                              (send a browser User-Agent; the page is korean.go.kr etcDataView mn_id=46 etc_seq=71)
               kaikki.org-dictionary-Korean.jsonl   https://kaikki.org/dictionary/Korean/
               krdict.zip     https://krdict.korean.go.kr/dicBatchDownload?seq=220  (JSON; unzip into src/krdict/)
               Unihan.zip     https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip  (Unihan_Readings.txt, Unihan_Variants.txt)
               kor_sentences.tsv.bz2, eng_sentences.tsv.bz2, links.tar.bz2   https://downloads.tatoeba.org/exports/
  extract    extract.py   -> nikl / dict / phrases / hanja / krdict / krdict-phrases / tatoeba JSON in the cache
  stages     build_level.py a, b, c
  alphabet   build_hangul.py (its example words are read out of the stage decks)
  phrases    build_phrases.py (scoped by the stage decks' words)
then  node .claude/korean/check-korean.js  and  node .claude/build-lang-decks.js
"""
import os, subprocess, sys
PY = sys.executable
HERE = os.path.dirname(os.path.abspath(__file__))
steps = [] if '--no-extract' in sys.argv else [['extract.py']]
steps += [['build_level.py', s] for s in ('a', 'b', 'c')]
steps += [['build_hangul.py'], ['build_phrases.py']]
for s in steps:
    print('==', ' '.join(s), flush=True)
    subprocess.run([PY] + s, check=True, cwd=HERE)
