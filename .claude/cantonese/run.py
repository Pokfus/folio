#!/usr/bin/env python3
"""Build a Cantonese deck, end to end.

    python3 .claude/cantonese/run.py                 # A1
    python3 .claude/cantonese/run.py --level a2      # another level (inventory first: inventory.py)
    python3 .claude/cantonese/run.py --level phr     # the phrases deck (phrases.py in place of select.py)
    python3 .claude/cantonese/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/cantonese/run.py --re-extract    # rebuild lex.json / freq.json / tat.json
    python3 .claude/cantonese/sounds.py              # the Jyutping and Tones deck (reads lex.json)

ONE LEVEL PER RUN (`cantonese_level` reads the level once, at import).  Downloads its sources into
`.claude/cantonese-cache/` (gitignored, about 160 MB, most of it Tatoeba's English sentences) and
leaves them there, so a re-run costs nothing.  Not part of the site, and it needs no library: HKCanCor
is read straight out of the PyCantonese wheel, which is unzipped, never installed.  The plan is
`docs/cantonese-decks-plan.md`; read it before changing a stage.

THE STAGES, in order.  Each writes its output into the cache for the next:

    extract.py      every headword with its Jyutping and English; spoken frequency from HKCanCor
                    and Tatoeba; Tatoeba's pairs cut into words (built once for all levels)
    select.py       the inventory, then the commonest remaining words
    examples.py     up to three Tatoeba sentences each
    build_deck.py   headword, Jyutping, simplified form, English, sentences, and the .folio-deck.json

SOURCES AND LICENCES, which the deck's own description also states:
  · CC-CEDICT (MDBG) -- CC BY-SA 4.0
  · CC-Canto and its Cantonese readings of CC-CEDICT (Pleco) -- CC BY-SA 3.0
  · HKCanCor, the Hong Kong Cantonese Corpus (Luke Kang Kwong), from PyCantonese 5.0.0 -- CC BY 4.0
  · Tatoeba sentence pairs and transcriptions -- CC BY 2.0 FR
"""
import os, runpy, shutil, subprocess, sys, urllib.request, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'cantonese-cache'))
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'
CANTO = 'https://cantonese.org/'
# PINNED: PyCantonese 5.0.0's manylinux wheel, for the HKCanCor files inside it (data only).
WHEEL = ('https://files.pythonhosted.org/packages/ee/fe/ee179a7336935d71d1db34183008a5362457d657e59c7a4c63e20c0b7852/'
         'pycantonese-5.0.0-cp310-abi3-manylinux_2_17_x86_64.manylinux2014_x86_64.whl')

# (local name, url, how to unpack: None | 'bz2' | 'gz' | 'zip')
SOURCES = [
    ('cccanto-webdist.txt', CANTO + 'cccanto-170202.zip', 'zip'),
    ('cccedict-canto-readings-150923.txt', CANTO + 'cccedict-canto-readings-150923.zip', 'zip'),
    ('cedict.txt', 'https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz', 'gz'),
    ('yue_sentences_detailed.tsv', TATOEBA + 'yue/yue_sentences_detailed.tsv.bz2', 'bz2'),
    ('yue_transcriptions.tsv', TATOEBA + 'yue/yue_transcriptions.tsv.bz2', 'bz2'),
    ('yue-eng_links.tsv', TATOEBA + 'yue/yue-eng_links.tsv.bz2', 'bz2'),
    ('eng_sentences.tsv', TATOEBA + 'eng/eng_sentences.tsv.bz2', 'bz2'),
]


def get(url, path):
    with urllib.request.urlopen(url) as r, open(path, 'wb') as fh:
        shutil.copyfileobj(r, fh)


def fetch():
    os.makedirs(CACHE, exist_ok=True)
    for name, url, how in SOURCES:
        out = os.path.join(CACHE, name)
        if os.path.exists(out) and os.path.getsize(out) > 0:
            print(f'  have  {name}')
            continue
        print(f'  get   {name}  <- {url}')
        tmp = os.path.join(CACHE, os.path.basename(url))
        get(url, tmp)
        if how == 'zip':
            zipfile.ZipFile(tmp).extract(name, CACHE)
            os.remove(tmp)
        elif how == 'gz':
            subprocess.run(['gunzip', '-f', tmp], check=True)
            os.replace(tmp[:-3], out)
        elif how == 'bz2':
            subprocess.run(['bunzip2', '-f', tmp], check=True)
    hk = os.path.join(CACHE, 'hkcancor')
    if os.path.isdir(hk) and any(f.endswith('.cha') for f in os.listdir(hk)):
        print('  have  hkcancor/')
        return
    print(f'  get   hkcancor/  <- {WHEEL}')
    tmp = os.path.join(CACHE, 'pycantonese.whl')
    get(WHEEL, tmp)
    os.makedirs(hk, exist_ok=True)
    with zipfile.ZipFile(tmp) as z:
        for n in z.namelist():
            if n.startswith('pycantonese/data/hkcancor/') and (n.endswith('.cha') or n.endswith('LICENSE.txt')):
                with z.open(n) as src, open(os.path.join(hk, os.path.basename(n)), 'wb') as dst:
                    shutil.copyfileobj(src, dst)
    os.remove(tmp)


def main():
    level = 'a1'
    if '--level' in sys.argv:
        level = sys.argv[sys.argv.index('--level') + 1].lower()
    os.environ['CANTONESE_LEVEL'] = level            # read by cantonese_level, at import
    print('building level', level.upper())
    sys.path.insert(0, HERE)
    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch()
    os.chdir(CACHE)
    stages = ['phrases.py' if level == 'phr' else 'select.py', 'examples.py', 'build_deck.py']
    if not os.path.exists('lex.json') or '--re-extract' in sys.argv:
        stages.insert(0, 'extract.py')
    for stage in stages:
        print(stage.split('.')[0] + ':')
        sys.argv = [stage]
        runpy.run_path(os.path.join(HERE, stage), run_name='__main__')


if __name__ == '__main__':
    main()
