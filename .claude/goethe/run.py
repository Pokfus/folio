#!/usr/bin/env python3
"""Build the Goethe German deck, end to end.

    python3 .claude/goethe/run.py                 # A1
    python3 .claude/goethe/run.py --no-fetch      # reuse whatever is cached

ONE LEVEL PER RUN.  `goethe_level` reads the level once, at import, so a second
level in the same process would be built against the first one's settings.  A1
is the only level with a deck so far; A2 and B1 have published Wortlisten of
their own and would each take a row in that module's tables, plus a `BELOW`
entry so that a level is taught on top of the ones under it -- which is how the
four DELE levels avoid teaching the same word twice.

Downloads its sources into `.claude/goethe-cache/` (gitignored) and leaves them
there, so a re-run costs nothing.  The largest is the Wiktionary dump at about
1.1 GB; the rest come to some 200 MB.  Not part of the site.

WHERE THE WORDS COME FROM.  Unlike the DELE, the Goethe-Institut publishes an
actual word list for this exam, so there is no inventory to interpret and
nothing to select: the deck teaches the list.  What the pipeline has to do is
read it off a two-column PDF, work out for each headword which Wiktionary lemma
it is, and build the German a card needs -- the gender, the plural, the feminine,
the paradigm.

WHAT IS TAKEN FROM THAT PDF AND WHAT IS NOT.  The list of words is the exam's
scope, and that is what is read.  The PDF also prints an example sentence under
almost every entry; not one of them is taken.  Those are the Goethe-Institut's
own authored prose, where this deck's sentences come from Tatoeba and its
meanings from Wiktionary.  The sentences ARE read while the pipeline is being
written -- they are the evidence for which sense of `aus` or `laut` the list
means -- but they do not travel into the deck.

THE STAGES, in order.  Each writes its output into the cache for the next:

    parse_goethe.py   the alphabetical list  -> headwords
    wordgroups.py     the numbers, days, months, colours the alphabet omits
    extract_kaikki.py Wiktionary records for every candidate lemma
    select.py         merge, settle each lemma and part of speech, order by frequency
    examples.py       three Tatoeba sentences each
    build_deck.py     articles, plurals, feminines, paradigms, cards
    emit.py           the .folio-deck.json

SOURCES AND LICENCES, which the deck's own description also states:
  · Goethe-Zertifikat A1 Start Deutsch 1 Wortliste -- goethe.de (the word list only)
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · Tatoeba sentence pairs -- CC BY 2.0 FR
  · A frequency list built from OpenSubtitles (hermitdave/FrequencyWords) -- CC BY-SA 4.0
"""
import json, os, runpy, shutil, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'goethe-cache'))

TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'

# (local name, url, bunzip2?)
SOURCES = [
    ('kaikki-de.jsonl',   'https://kaikki.org/dictionary/German/'
                          'kaikki.org-dictionary-German.jsonl',            False),
    ('de_50k.txt',        'https://raw.githubusercontent.com/hermitdave/FrequencyWords/'
                          'master/content/2018/de/de_50k.txt',             False),
    ('deu_sentences_detailed.tsv', TATOEBA + 'deu/deu_sentences_detailed.tsv.bz2', True),
    ('eng_sentences.tsv',          TATOEBA + 'eng/eng_sentences.tsv.bz2',          True),
    ('deu-eng_links.tsv',          TATOEBA + 'deu/deu-eng_links.tsv.bz2',          True),
]


def fetch(extra):
    os.makedirs(CACHE, exist_ok=True)
    for name, url, bz in SOURCES + extra:
        out = os.path.join(CACHE, name)
        if os.path.exists(out) and os.path.getsize(out) > 0:
            print(f'  have  {name}')
            continue
        print(f'  get   {name}  <- {url}')
        tmp = out + ('.bz2' if bz else '.part')
        with urllib.request.urlopen(url) as r, open(tmp, 'wb') as f:
            shutil.copyfileobj(r, f)
        if bz:
            subprocess.run(['bunzip2', '-f', tmp], check=True)
        else:
            os.replace(tmp, out)


def main():
    level = 'a1'
    if '--level' in sys.argv:
        level = sys.argv[sys.argv.index('--level') + 1].lower()
    os.environ['GOETHE_LEVEL'] = level          # read by goethe_level, at import
    print('building level', level.upper())

    sys.path.insert(0, HERE)
    from goethe_level import WORTLISTE, f as lvlf
    pdf, pdf_url = WORTLISTE[level]

    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch([(pdf, pdf_url, False)])
    os.makedirs(CACHE, exist_ok=True)
    os.chdir(CACHE)

    print('word list:')
    sys.argv = ['parse_goethe.py', pdf]
    runpy.run_path(os.path.join(HERE, 'parse_goethe.py'), run_name='__main__')
    sys.argv = ['wordgroups.py', pdf]
    runpy.run_path(os.path.join(HERE, 'wordgroups.py'), run_name='__main__')

    # every lemma any entry might be looked up under, plus the halves of a pair
    cands = set()
    for f in (lvlf('wortliste.json'), lvlf('wordgroups.json')):
        for e in json.load(open(f)):
            cands.update(e['lemmas'])
            if e.get('pair_lemma'):
                cands.add(e['pair_lemma'])
            cands.add(e['word'])
    cands.add('sein')            # the phrases `an sein`, `zu sein` are indexed off it
    json.dump(sorted(cands), open(lvlf('lookup.json'), 'w'), ensure_ascii=False)

    print('wiktionary:')
    sys.argv = ['extract_kaikki.py', lvlf('lookup.json'), lvlf('wikt.json'), 'kaikki-de.jsonl']
    runpy.run_path(os.path.join(HERE, 'extract_kaikki.py'), run_name='__main__')

    for stage in ('select.py', 'examples.py', 'build_deck.py', 'emit.py'):
        print(stage.split('.')[0] + ':')
        sys.argv = [stage]
        runpy.run_path(os.path.join(HERE, stage), run_name='__main__')


if __name__ == '__main__':
    main()
