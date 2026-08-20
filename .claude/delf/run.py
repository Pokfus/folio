#!/usr/bin/env python3
"""Build the DELF French deck, end to end.

    python3 .claude/delf/run.py                  # A1
    python3 .claude/delf/run.py --level a2       # once A2 is wanted
    python3 .claude/delf/run.py --no-fetch       # reuse whatever is cached

ONE LEVEL PER RUN.  `delf_level` reads the level once, at import, so a second
level in the same process would be built against the first one's settings.  A1
is the only level with a deck so far; the same site publishes A2, B1 and B2, and
each would need a row in that module's tables plus a `BELOW` entry so that a
level is taught on top of the ones under it -- which is how the four DELE levels
and the three Goethe ones avoid teaching the same word twice.

Downloads its sources into `.claude/delf-cache/` (gitignored) and leaves them
there, so a re-run costs nothing.  The largest is the Wiktionary dump at about
574 MB; the rest come to some 190 MB.  Not part of the site.

WHERE THE WORDS COME FROM, AND WHY IT IS NOT AN EXAM BOARD'S LIST.  The
Goethe-Institut publishes a Wortliste for each of its exams and that deck teaches
it.  France Éducation international publishes nothing of the kind for the DELF --
only a syllabus of themes, with the word-level reference (Beacco et al., `Niveau
A1 pour le français`, Didier) sold as a book.  So this list is a third party's,
and because it has no authority to defer to, its defects are repaired rather than
shipped: see the head of wordlist.py, where the four entries that are not French
words and the four printed twice are named with the measurement that found them.
The deck's own description says all of this to the reader.

THE STAGES, in order.  Each writes its output into the cache for the next:

    wordlist.py       the published list  -> headwords, repaired
    extract_kaikki.py Wiktionary records for every candidate lemma
    select.py         settle each lemma and part of speech, order by frequency
    examples.py       three Tatoeba sentences each
    build_deck.py     articles, plurals, feminines, conjugations, IPA, cards
    emit.py           the .folio-deck.json

SOURCES AND LICENCES, which the deck's own description also states:
  · the A1 word list at minddory.com (the list of words only)
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · Tatoeba sentence pairs -- CC BY 2.0 FR
  · a frequency list built from OpenSubtitles (hermitdave/FrequencyWords) -- CC BY-SA 4.0
"""
import json, os, runpy, shutil, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'delf-cache'))

TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'

# (local name, url, bunzip2?)
SOURCES = [
    ('kaikki-fr.jsonl',   'https://kaikki.org/dictionary/French/'
                          'kaikki.org-dictionary-French.jsonl',            False),
    ('fr_50k.txt',        'https://raw.githubusercontent.com/hermitdave/FrequencyWords/'
                          'master/content/2018/fr/fr_50k.txt',             False),
    ('fra_sentences_detailed.tsv', TATOEBA + 'fra/fra_sentences_detailed.tsv.bz2', True),
    ('eng_sentences.tsv',          TATOEBA + 'eng/eng_sentences.tsv.bz2',          True),
    ('fra-eng_links.tsv',          TATOEBA + 'fra/fra-eng_links.tsv.bz2',          True),
]

# A browser User-Agent, because the word list is an ordinary web page rather than
# a published dataset and its host answers a bare urllib with a 403.
UA = ('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) '
      'Chrome/124.0 Safari/537.36')


def get(url, out, bz=False):
    tmp = out + ('.bz2' if bz else '.part')
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req) as r, open(tmp, 'wb') as f:
        shutil.copyfileobj(r, f)
    if bz:
        subprocess.run(['bunzip2', '-f', tmp], check=True)
    else:
        os.replace(tmp, out)


def fetch(extra):
    os.makedirs(CACHE, exist_ok=True)
    for name, url, bz in SOURCES + extra:
        out = os.path.join(CACHE, name)
        if os.path.exists(out) and os.path.getsize(out) > 0:
            print(f'  have  {name}')
            continue
        print(f'  get   {name}  <- {url}')
        get(url, out, bz)


def main():
    level = 'a1'
    if '--level' in sys.argv:
        level = sys.argv[sys.argv.index('--level') + 1].lower()
    os.environ['DELF_LEVEL'] = level          # read by delf_level, at import
    print('building level', level.upper())

    sys.path.insert(0, HERE)
    from delf_level import LISTS, f as lvlf

    # THE FIRST STAGE IS THE ONE THING THAT DIFFERS, and the branch is on whether
    # the level HAS a published list rather than on its name.  Six of the seven
    # read a page; the phrases deck has no page to read, because a vocabulary
    # list is a list of words and a set expression is not one -- so it chooses
    # its own headwords out of the dictionary instead.  Everything after this
    # point is shared, which is the whole reason the stages hand each other files
    # rather than calling one another.
    page, page_url = LISTS.get(level, (None, None))

    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch([(page, page_url, False)] if page else [])
    os.makedirs(CACHE, exist_ok=True)
    os.chdir(CACHE)

    if page:
        print('word list:')
        sys.argv = ['wordlist.py', page]
        runpy.run_path(os.path.join(HERE, 'wordlist.py'), run_name='__main__')
    else:
        print('phrase list:')
        sys.argv = ['phraselist.py']
        runpy.run_path(os.path.join(HERE, 'phraselist.py'), run_name='__main__')

    # every lemma any entry might be looked up under, plus the two auxiliaries.
    # AVOIR AND ÊTRE ARE ALWAYS FETCHED, whether or not this level teaches them:
    # the passé composé on every one of the deck's verbs is built out of their
    # présent, and from A2 upwards both have already been taught by a lower level
    # and so are not in `entries` at all.
    cands = {'avoir', 'être'}
    for e in json.load(open(lvlf('wordlist.json'))):
        cands.update(e['lemmas'])
        cands.add(e['word'])
    json.dump(sorted(cands), open(lvlf('lookup.json'), 'w'), ensure_ascii=False)

    print('wiktionary:')
    sys.argv = ['extract_kaikki.py', lvlf('lookup.json'), lvlf('wikt.json'), 'kaikki-fr.jsonl']
    runpy.run_path(os.path.join(HERE, 'extract_kaikki.py'), run_name='__main__')

    for stage in ('select.py', 'examples.py', 'build_deck.py', 'emit.py'):
        print(stage.split('.')[0] + ':')
        sys.argv = [stage]
        runpy.run_path(os.path.join(HERE, stage), run_name='__main__')


if __name__ == '__main__':
    main()
