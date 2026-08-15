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


# The corpus a level with no published Wortliste selects from.  Only the WORD
# FILE is kept -- rank, word, count -- and the tarball, which also carries the
# million sentences themselves, is deleted after it is opened: this pipeline
# takes a ranking from the corpus and never a sentence, so keeping a quarter of a
# gigabyte of somebody else's newspaper text would be storing what it has no use
# for.  See `c1_wordlist.py`.
CORPUS_NAME = 'leipzig-news-words.txt'
CORPUS_URL = ('https://downloads.wortschatz-leipzig.de/corpora/'
              'deu_news_2024_1M.tar.gz')
CORPUS_MEMBER = 'deu_news_2024_1M/deu_news_2024_1M-words.txt'


def fetch_corpus():
    out = os.path.join(CACHE, CORPUS_NAME)
    if os.path.exists(out) and os.path.getsize(out) > 0:
        print(f'  have  {CORPUS_NAME}')
        return
    print(f'  get   {CORPUS_NAME}  <- {CORPUS_URL}')
    import tarfile
    tmp = out + '.tar.gz'
    with urllib.request.urlopen(CORPUS_URL) as r, open(tmp, 'wb') as f:
        shutil.copyfileobj(r, f)
    with tarfile.open(tmp) as t, open(out + '.part', 'wb') as f:
        shutil.copyfileobj(t.extractfile(CORPUS_MEMBER), f)
    os.replace(out + '.part', out)
    os.remove(tmp)


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

    # A LEVEL WITH NO PUBLISHED WORTLISTE CHOOSES ITS OWN WORDS.  The
    # Goethe-Institut's lists stop at B1 and it says in the C1 brochure why; see
    # `WORTLISTE` and `c1_wordlist.py`.  Such a level reads no PDF and has no
    # Wortgruppenliste, so the two parsing stages are replaced by one selecting
    # stage -- and the branch is on the table rather than on the level's name, so
    # a level that gains a list later needs no change here.
    pdf = WORTLISTE.get(level)

    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch([(pdf[0], pdf[1], False)] if pdf else [])
        if not pdf:
            fetch_corpus()
    os.makedirs(CACHE, exist_ok=True)
    os.chdir(CACHE)

    print('word list:')
    if pdf:
        sys.argv = ['parse_goethe.py', pdf[0]]
        runpy.run_path(os.path.join(HERE, 'parse_goethe.py'), run_name='__main__')
        sys.argv = ['wordgroups.py', pdf[0]]
        runpy.run_path(os.path.join(HERE, 'wordgroups.py'), run_name='__main__')
    else:
        sys.argv = ['c1_wordlist.py']
        runpy.run_path(os.path.join(HERE, 'c1_wordlist.py'), run_name='__main__')

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
