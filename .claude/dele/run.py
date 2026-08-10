#!/usr/bin/env python3
"""Build the DELE Spanish deck, end to end.

    python3 .claude/dele/run.py            # build decks/DELE-A1-Spanish.folio-deck.json
    python3 .claude/dele/run.py --no-fetch # reuse whatever is already cached

Downloads its four sources into `.claude/dele-cache/` (gitignored) and leaves
them there, so a re-run costs nothing.  The largest is the Wiktionary dump at
about 1 GB; the rest come to some 180 MB.  Not part of the site.

WHERE THE WORDS COME FROM.  There is no published official DELE word list, so
the vocabulary is taken from the body that sets the exam: the A1 column of the
Instituto Cervantes' own Plan curricular.  Its two Nociones inventories are
printed as an A1 column beside an A2 one, so the A1 half can be read off on its
own.  Those inventories list NOTIONS rather than words, though, so a whole
closed class can appear as one bracketed label -- `[números cardinales]`,
`[día de la semana]` -- and the grammar layer (pronouns, articles,
prepositions, conjunctions) is inventoried separately under Gramática and
appears in neither page.  Those are supplied by `supplement.py`; the rest of the
500 is filled from the A1 column in order of frequency.

THE STAGES, in order.  Each writes its output into the cache for the next:

    parse_pcic.py     the A1 cells   -> candidate lemmas
    supplement.py     the closed classes the inventory names but never writes out
    extract_kaikki.py Wiktionary records for every candidate
    select.py         the 500, weighted to the Cervantes column
    examples.py       three Tatoeba sentences each
    build_deck.py     articles, glosses, conjugation tables, cards
    emit.py           the .folio-deck.json

SOURCES AND LICENCES, which the deck's own description also states:
  · Plan curricular del Instituto Cervantes -- cvc.cervantes.es
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · Tatoeba sentence pairs -- CC BY 2.0 FR
  · A frequency list built from OpenSubtitles (hermitdave/FrequencyWords) -- CC BY-SA 4.0
"""
import os, sys, runpy, urllib.request, subprocess, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '..', 'dele-cache')
CACHE = os.path.abspath(CACHE)

PCIC = 'https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/'
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'

# (local name, url, bunzip2?)
SOURCES = [
    ('pcic_a1a2.htm',      PCIC + '09_nociones_especificas_inventario_a1-a2.htm', False),
    ('pcic_gen_a1a2.htm',  PCIC + '08_nociones_generales_inventario_a1-a2.htm',   False),
    ('es_50k.txt',         'https://raw.githubusercontent.com/hermitdave/FrequencyWords/'
                           'master/content/2018/es/es_50k.txt',                   False),
    ('kaikki-es.jsonl',    'https://kaikki.org/dictionary/Spanish/'
                           'kaikki.org-dictionary-Spanish.jsonl',                 False),
    ('spa_sent.tsv',       TATOEBA + 'spa/spa_sentences_detailed.tsv.bz2',        True),
    ('eng_sent.tsv',       TATOEBA + 'eng/eng_sentences.tsv.bz2',                 True),
    ('spa_eng_links.tsv',  TATOEBA + 'spa/spa-eng_links.tsv.bz2',                 True),
]

STAGES = ['parse_pcic.py', 'select.py', 'examples.py', 'build_deck.py', 'emit.py']


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
    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch()
    os.makedirs(CACHE, exist_ok=True)
    os.chdir(CACHE)
    sys.path.insert(0, HERE)          # so a stage can `import supplement`
    # the candidate list the Wiktionary extraction is run over is the union of
    # the inventory's own words and the closed classes; both stages write it
    runpy.run_path(os.path.join(HERE, 'parse_pcic.py'), run_name='__main__')
    runpy.run_path(os.path.join(HERE, 'supplement.py'), run_name='__main__')
    import json
    cands = json.load(open('pcic_a1_candidates.json'))
    supp = json.load(open('supplement.json'))
    json.dump(sorted(set(list(cands) + supp)), open('lookup.json', 'w'), ensure_ascii=False)
    sys.argv = ['extract_kaikki.py', 'lookup.json', 'wikt.json']
    runpy.run_path(os.path.join(HERE, 'extract_kaikki.py'), run_name='__main__')
    # the base verbs behind the reflexives, whose paradigms are derived from them
    json.dump(['bañar', 'dedicar', 'despertar', 'duchar', 'levantar', 'llamar', 'lavar'],
              open('bases.json', 'w'), ensure_ascii=False)
    sys.argv = ['extract_kaikki.py', 'bases.json', 'wikt_bases.json']
    runpy.run_path(os.path.join(HERE, 'extract_kaikki.py'), run_name='__main__')
    for s in STAGES[1:]:
        print(f'--- {s}')
        runpy.run_path(os.path.join(HERE, s), run_name='__main__')


if __name__ == '__main__':
    main()
