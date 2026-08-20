#!/usr/bin/env python3
"""Build a UKBI Indonesian deck, end to end.

    python3 .claude/ukbi/run.py                      # level 1, Terbatas
    python3 .claude/ukbi/run.py --level 2            # Marginal, on top of 1
    python3 .claude/ukbi/run.py --no-fetch           # reuse whatever is cached

ONE LEVEL PER RUN.  `ukbi_level` reads the level once, at import, so a second
level in the same process would be built against the first one's settings.

THE LEVELS ARE NUMBERED FROM THE BOTTOM, which is the opposite of UKBI's own
peringkat I-VII: a learner starts at Terbatas, so Terbatas is level 1.  See
`ukbi_level.py`.

WHERE THE WORDS COME FROM.  **UKBI publishes no vocabulary list** -- it is a
proficiency test rather than a syllabus, and neither it nor the BIPA competency
standards (Permendikbud 27/2017) name the words a candidate is expected to know.
That is the one substantial difference from the sibling generators on this
shelf, which read an exam board's own published list: the Goethe decks read the
Wortliste and the DELE decks read the Instituto Cervantes' Plan curricular.
Here the list is assembled, and `select.py`'s header says exactly how and on
what evidence.  Nothing in the deck claims an official source it has not got.

THE STAGES, in order.  Each writes its output into the cache for the next:

    extract_kaikki.py  the whole Indonesian Wiktionary, reduced
    supplement.py      the survival vocabulary the level's descriptor names
    select.py          the words, and the affix family around each
    examples.py        three Tatoeba sentences each
    build_deck.py      meanings, forms rows, sentence markup
    emit.py            the .folio-deck.json

Downloads its sources into `.claude/ukbi-cache/` (gitignored) and leaves them
there, so a re-run costs nothing.  They come to about 175 MB, most of it the
English half of the Tatoeba corpus.  Not part of the site.

SOURCES AND LICENCES, which the deck's own description also states:
  · UKBI predicate descriptors -- ukbi.kemendikdasmen.go.id
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · Tatoeba sentence pairs -- CC BY 2.0 FR
  · Global Voices news articles via OPUS -- CC BY 3.0
  · A frequency list built from OpenSubtitles (hermitdave/FrequencyWords) -- CC BY-SA 4.0

WHY THERE ARE THREE SENTENCE SOURCES AND WHAT ORDER THEY GO IN.  Tatoeba is a
pair bank of everyday sentences and it runs out: it has 22,008 Indonesian
sentences with an English pair, which covers a survival vocabulary almost
completely (level 1: 498 of 500 words) and an academic one hardly at all (level
6: 404 of 2,500).  Raising the length cap does not help -- 110 characters
already admits 99% of that corpus -- because what is missing is not long
sentences but the words themselves.  So two more sources are read, strictly in
order of how much they can be trusted, and each word takes the best three it
can get:

  1. Tatoeba          human-written pairs, everyday register
  2. Wiktionary       the dictionary's own usage examples, same source and the
                      same licence as the definitions on the card
  3. Global Voices    human-translated news articles, sentence-aligned
                      AUTOMATICALLY by OPUS -- so the alignment can drift, and
                      that is why it is last

THE THIRD ONE IS A DELIBERATE TRADE AND ITS COST IS STATED RATHER THAN HIDDEN.
Reading thirty random pairs by hand found one where the two sides were different
sentences from the same article, so roughly one in thirty of the sentences that
come from it carries an English that does not translate the Indonesian beside
it.  A wrong translation teaches a wrong meaning, which is worse than no
example, and against that: it is reached only where the other two have nothing,
it is filtered (see `examples.py`), and it is what takes the stack from 5,602
words with no sentence at all to about 4,200.  The deck's own description says
which sources it used and that the last is automatically aligned.
"""
import os, sys, runpy, urllib.request, subprocess, shutil, json, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'ukbi-cache'))

TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'

# The Global Voices half of OPUS ships as a zip of two parallel line files, so
# it is the one source that is not a plain download.  `GV_MEMBERS` names both
# halves and the pair is only usable together -- a partial unzip would silently
# leave the two files a different length, which is a misalignment of every line
# after the join.  `examples.py` asserts they match.
GV_ZIP = ('https://object.pouta.csc.fi/OPUS-GlobalVoices/v2018q4/moses/'
          'en-id.txt.zip')
GV_MEMBERS = {'GlobalVoices.en-id.id': 'gv.id', 'GlobalVoices.en-id.en': 'gv.en'}

# (local name, url, bunzip2?)
SOURCES = [
    ('id_50k.txt',       'https://raw.githubusercontent.com/hermitdave/FrequencyWords/'
                         'master/content/2018/id/id_50k.txt',                  False),
    ('kaikki-id.jsonl',  'https://kaikki.org/dictionary/Indonesian/'
                         'kaikki.org-dictionary-Indonesian.jsonl',             False),
    ('ind_sent.tsv',     TATOEBA + 'ind/ind_sentences_detailed.tsv.bz2',       True),
    ('eng_sent.tsv',     TATOEBA + 'eng/eng_sentences.tsv.bz2',                True),
    ('ind_eng_links.tsv', TATOEBA + 'ind/ind-eng_links.tsv.bz2',               True),
]


def fetch_globalvoices():
    outs = [os.path.join(CACHE, v) for v in GV_MEMBERS.values()]
    if all(os.path.exists(p) and os.path.getsize(p) > 0 for p in outs):
        print('  have  gv.id / gv.en')
        return
    print(f'  get   gv.id / gv.en  <- {GV_ZIP}')
    tmp = os.path.join(CACHE, 'gv.zip')
    with urllib.request.urlopen(GV_ZIP) as r, open(tmp, 'wb') as fh:
        shutil.copyfileobj(r, fh)
    with zipfile.ZipFile(tmp) as z:
        for member, local in GV_MEMBERS.items():
            with z.open(member) as src, open(os.path.join(CACHE, local), 'wb') as fh:
                shutil.copyfileobj(src, fh)
    os.remove(tmp)


def fetch():
    os.makedirs(CACHE, exist_ok=True)
    for name, url, bz in SOURCES:
        out = os.path.join(CACHE, name)
        if os.path.exists(out) and os.path.getsize(out) > 0:
            print(f'  have  {name}')
            continue
        print(f'  get   {name}  <- {url}')
        tmp = out + ('.bz2' if bz else '.part')
        with urllib.request.urlopen(url) as r, open(tmp, 'wb') as fh:
            shutil.copyfileobj(r, fh)
        if bz:
            subprocess.run(['bunzip2', '-f', tmp], check=True)
        else:
            os.replace(tmp, out)
    fetch_globalvoices()


def main():
    # `--phrases` builds the companion deck of phrases, idioms and proverbs
    # rather than a level.  It is NOT an eighth predicate -- UKBI has seven --
    # and it runs `phrases.py` where a level runs `select.py`; everything after
    # that is the same four stages, because a phrase is carded exactly like a
    # word.  Its level key is 'p', which keeps its intermediates out of the
    # numbered levels' way in the shared cache.
    phrases = '--phrases' in sys.argv
    level = 'p' if phrases else '1'
    if '--level' in sys.argv:
        level = sys.argv[sys.argv.index('--level') + 1]
    os.environ['UKBI_LEVEL'] = level       # read by ukbi_level, at import
    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch()
    os.makedirs(CACHE, exist_ok=True)
    os.chdir(CACHE)
    sys.path.insert(0, HERE)               # so a stage can `import supplement`
    from ukbi_level import PREDICATES, TARGET, f as lvlf
    if phrases:
        STAGES = ('phrases.py', 'examples.py', 'build_deck.py', 'emit_phrases.py')
        print('building the companion deck of phrases, idioms and proverbs '
              '(not a UKBI predicate — there are seven, and this is not one)')
    else:
        STAGES = ('select.py', 'examples.py', 'build_deck.py', 'emit.py')
        name, peringkat, band = PREDICATES[level]
        print(f'building level {level}: {name} (peringkat {peringkat}, score {band}), '
              f'target {TARGET[level]} words')

    # THE DICTIONARY IS REDUCED ONCE AND REUSED.  It is the same file whatever
    # level is being built, so a second level costs nothing here -- but it IS
    # rewritten per level, because a level's file name carries the level and a
    # stale one from a different Wiktionary dump would be read in silence.
    print('--- extract_kaikki.py')
    sys.argv = ['extract_kaikki.py', 'kaikki-id.jsonl', lvlf('wikt.json')]
    runpy.run_path(os.path.join(HERE, 'extract_kaikki.py'), run_name='__main__')

    for stage in STAGES:
        print(f'--- {stage}')
        runpy.run_path(os.path.join(HERE, stage), run_name='__main__')


if __name__ == '__main__':
    main()
