#!/usr/bin/env python3
"""Build the CILS Italian deck, end to end.

    python3 .claude/cils/run.py                 # A1
    python3 .claude/cils/run.py --level a2      # another band
    python3 .claude/cils/run.py --no-fetch      # reuse whatever is cached

ONE LEVEL PER RUN.  `cils_level` reads the level once, at import, so a second
level in the same process would be built against the first one's settings --
the arrangement `dele_level` and `goethe_level` already use.  A1 is the only
band with a shipped deck; the other five are a row apiece in that module's
tables and need no new code.

Downloads its sources into `.claude/cils-cache/` (gitignored) and leaves them
there, so a re-run costs nothing.  The largest is the Wiktionary dump at about
762 MB; the rest come to some 220 MB.  Not part of the site.

WHERE THE WORDS COME FROM, AND WHAT THAT MEANS.  Read `cils_level`'s header
before changing anything here: CILS publishes no word list, so unlike the Goethe
and DELE decks this one cannot say its vocabulary is the exam board's.  The list
is a third party's frequency band, it is named as one wherever a reader can see
it, and the ORDER the cards are dealt in is what does the pedagogical work.

THE STAGES, in order.  Each writes its output into the cache for the next:

    parse_cils.py     the published band          -> headwords
    extract_kaikki.py Wiktionary records for every candidate lemma
    select.py         lemma, part of speech, order by frequency
    examples.py       three Tatoeba sentences each
    build_deck.py     articles, plurals, feminines, paradigms, cards
    emit.py           the .folio-deck.json

SOURCES AND LICENCES, which the deck's own description also states:
  · The word list -- MindDory's Italian A1 band (minddory.com), the list only
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · Tatoeba sentence pairs -- CC BY 2.0 FR
  · A frequency list built from OpenSubtitles (hermitdave/FrequencyWords) -- CC BY-SA 4.0
  · De Mauro's nuovo vocabolario di base, via pettarin/nvdb -- public domain,
    used only as a reported cross-check and never as a filter
"""
import json, os, re, runpy, shutil, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'cils-cache'))

TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'

# (local name, url, bunzip2?)
SOURCES = [
    ('kaikki-it.jsonl',  'https://kaikki.org/dictionary/Italian/'
                         'kaikki.org-dictionary-Italian.jsonl',           False),
    ('it_50k.txt',       'https://raw.githubusercontent.com/hermitdave/FrequencyWords/'
                         'master/content/2018/it/it_50k.txt',             False),
    ('nvdb.words.txt',   'https://raw.githubusercontent.com/pettarin/nvdb/'
                         'master/nvdb.words.txt',                         False),
    ('ita_sentences_detailed.tsv', TATOEBA + 'ita/ita_sentences_detailed.tsv.bz2', True),
    ('eng_sentences.tsv',          TATOEBA + 'eng/eng_sentences.tsv.bz2',          True),
    ('ita-eng_links.tsv',          TATOEBA + 'ita/ita-eng_links.tsv.bz2',          True),
]


def fetch():
    os.makedirs(CACHE, exist_ok=True)
    for name, url, bz in SOURCES:
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
    os.environ['CILS_LEVEL'] = level          # read by cils_level, at import
    print('building level', level.upper())

    sys.path.insert(0, HERE)
    from cils_level import f as lvlf

    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch()
    os.makedirs(CACHE, exist_ok=True)
    os.chdir(CACHE)

    print('word list:')
    sys.argv = ['parse_cils.py']
    runpy.run_path(os.path.join(HERE, 'parse_cils.py'), run_name='__main__')

    # Every lemma any entry might be looked up under.  A REFLEXIVE'S BASE VERB
    # goes in here rather than being discovered later: `chiamarsi` is its own
    # Wiktionary lemma and carries its own conjugation, but its compound tenses
    # are built from `chiamare`'s past participle, and the dump is streamed once.
    # The test is the surface, not the part of speech, because the part of speech
    # is settled two stages further on and this file is what makes that possible.
    cands = set()
    for e in json.load(open(lvlf('wordlist.json'))):
        cands.update(e['lemmas'])
        m = re.search(r'^(.*[aei])rsi$', e['word'])
        if m:
            cands.add(m.group(1) + 're')
    json.dump(sorted(cands), open(lvlf('lookup.json'), 'w'), ensure_ascii=False)

    print('wiktionary:')
    sys.argv = ['extract_kaikki.py', lvlf('lookup.json'), lvlf('wikt.json'), 'kaikki-it.jsonl']
    runpy.run_path(os.path.join(HERE, 'extract_kaikki.py'), run_name='__main__')

    for stage in ('select.py', 'examples.py', 'build_deck.py', 'emit.py'):
        print(stage.split('.')[0] + ':')
        sys.argv = [stage]
        runpy.run_path(os.path.join(HERE, stage), run_name='__main__')


if __name__ == '__main__':
    main()
