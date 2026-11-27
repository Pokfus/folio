#!/usr/bin/env python3
"""Build an Old English deck, end to end.

    python3 .claude/oldenglish/run.py                 # Level 1
    python3 .claude/oldenglish/run.py --level l2      # another level (built on the ones below)
    python3 .claude/oldenglish/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/oldenglish/run.py --snapshot-tatoeba   # rewrite tatoeba-ang.tsv from the cached exports
    python3 .claude/oldenglish/alphabet.py            # the alphabet deck
    node .claude/oldenglish/check-oldenglish.js       # the check

ONE LEVEL PER RUN (`oe_level` reads the level once, at import).  Downloads its
sources into `.claude/oldenglish-cache/` (gitignored, about 250 MB, the
Wiktionary extract and Tatoeba's English sentences being nearly all of it) and
leaves them there, so a re-run costs nothing.  Not part of the site.  The plan
is `docs/oldenglish-decks-plan.md`; read it before changing a stage.

THE STAGES, in order.  Each writes its output into the cache for the next:

    corpus.py       the Old English prose the frequencies are counted over
    extract.py      every lemma, compacted, with a LEMMA frequency (lex.json)
    thorpe.py       Ælfric's sentences paired with Thorpe's facing translation, by page
    select.py       the level's band of the frequency order
    examples.py     up to three sentences each -- Ælfric's first, then Tatoeba's -- with a reference
    build_deck.py   headword, IPA, glosses, forms, descendant, paradigm, sentences,
                    and the .folio-deck.json in decks/

SOURCES AND LICENCES, which the deck's own description also states:
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · Thorpe's Ælfric (1844) and Sweet's Primer (1905), Project Gutenberg -- public domain
  · Tatoeba sentences and translations -- CC BY 2.0 FR

TATOEBA IS PINNED IN THE REPOSITORY (`tatoeba-ang.tsv`, the beginner pass, 2026-11-27).  Its
Old English is a few hundred sentences and it is BOTH part of the corpus the words are ranked on
AND a source of the cards' sentences, so every sentence a contributor added moved the ranking:
between 2026-11-09 and 2026-11-27 it grew from 745 pairs to 805 and a rebuild swapped two words
of Level 1 for two others, moved 278 notes and changed the sentences of 39.  A band of
frequency that other levels are built on cannot move.  So the export is kept here as one small
file (id, Old English, the shortest English translation), `corpus.py` counts only the
sentences the ranking was first counted on (`corpus.TATOEBA_CUT`), and `examples.py` reads the
file.  `--snapshot-tatoeba` rewrites it from fresh exports -- a decision, not a routine step.
The English export is still fetched: `extract.py` counts English words in it to choose between
two descendants.

PROJECT GUTENBERG's main site answers 503 when it is down for maintenance; `fetch` then takes
the same book from its mirror, where the file is the Latin-1 original (`corpus.read` reads
either).
"""
import os, runpy, shutil, subprocess, sys, urllib.error, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'oldenglish-cache'))
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'
PG = 'https://www.gutenberg.org/cache/epub/'

# (local name, url, bunzip2?)
MIRROR = 'https://gutenberg.pglaf.org/'
# (local name, url, bunzip2?, a second url to try)
SOURCES = [
    ('kaikki-ang.jsonl', 'https://kaikki.org/dictionary/Old%20English/'
                         'kaikki.org-dictionary-OldEnglish.jsonl', False, None),
    ('pg38334.html', PG + '38334/pg38334-images.html', False,       # Thorpe's Ælfric, vol. 1
     MIRROR + '3/8/3/3/38334/38334-h/38334-h.htm'),
    ('pg34316.html', PG + '34316/pg34316-images.html', False,       # Sweet's Primer, 8th ed.
     MIRROR + '3/4/3/1/34316/34316-h/34316-h.htm'),
    ('eng_sentences.tsv', TATOEBA + 'eng/eng_sentences.tsv.bz2', True, None),
]
# only for --snapshot-tatoeba
TATOEBA_ANG = [
    ('ang_sentences.tsv', TATOEBA + 'ang/ang_sentences.tsv.bz2', True, None),
    ('ang-eng_links.tsv', TATOEBA + 'ang/ang-eng_links.tsv.bz2', True, None),
]
SNAPSHOT = os.path.join(HERE, 'tatoeba-ang.tsv')
STAGES = ['corpus.py', 'extract.py', 'thorpe.py', 'select.py', 'examples.py', 'build_deck.py']


def fetch(sources=SOURCES):
    os.makedirs(CACHE, exist_ok=True)
    for name, url, bz, second in sources:
        out = os.path.join(CACHE, name)
        if os.path.exists(out) and os.path.getsize(out) > 0:
            print(f'  have  {name}')
            continue
        tmp = out + ('.bz2' if bz else '.part')
        for u in filter(None, (url, second)):
            print(f'  get   {name}  <- {u}')
            try:
                with urllib.request.urlopen(u) as r, open(tmp, 'wb') as fh:
                    shutil.copyfileobj(r, fh)
                break
            except urllib.error.HTTPError as err:
                print(f'        {err}')
        else:
            raise SystemExit(f'could not fetch {name}')
        if bz:
            subprocess.run(['bunzip2', '-f', tmp], check=True)
        else:
            os.replace(tmp, out)


def snapshot_tatoeba():
    """Rewrite tatoeba-ang.tsv: id, Old English, the shortest English translation (or nothing)."""
    for name, *_ in TATOEBA_ANG:
        p = os.path.join(CACHE, name)
        if os.path.exists(p):
            os.remove(p)
    fetch(TATOEBA_ANG + [x for x in SOURCES if x[0] == 'eng_sentences.tsv'])
    ang, links = {}, {}
    for line in open(os.path.join(CACHE, 'ang_sentences.tsv'), encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) >= 3:
            ang[p[0]] = p[2]
    for line in open(os.path.join(CACHE, 'ang-eng_links.tsv'), encoding='utf-8'):
        p = line.split()
        if len(p) >= 2 and p[0] in ang:
            links.setdefault(p[0], []).append(p[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for line in open(os.path.join(CACHE, 'eng_sentences.tsv'), encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) >= 3 and p[0] in want:
            eng[p[0]] = p[2]
    with open(SNAPSHOT, 'w', encoding='utf-8') as fh:
        for aid in sorted(ang, key=int):
            en = sorted((eng[e] for e in links.get(aid, []) if e in eng), key=lambda t: (len(t), t))
            fh.write(f'{aid}\t{ang[aid]}\t{en[0] if en else ""}\n')
    print(f'  wrote {SNAPSHOT}: {len(ang)} sentences, '
          f'{sum(1 for a in ang if any(e in eng for e in links.get(a, [])))} with a translation')


def main():
    args = sys.argv[1:]
    if '--level' in args:
        os.environ['OE_LEVEL'] = args[args.index('--level') + 1].lower()
    if '--snapshot-tatoeba' in args:
        return snapshot_tatoeba()
    if '--no-fetch' not in args:
        fetch()
    os.chdir(CACHE)
    sys.path.insert(0, HERE)
    for st in STAGES:
        print(f'— {st}')
        runpy.run_path(os.path.join(HERE, st), run_name='__main__')


if __name__ == '__main__':
    main()
