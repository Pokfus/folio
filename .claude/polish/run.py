#!/usr/bin/env python3
"""Build a Polish deck, end to end.

    python3 .claude/polish/run.py                 # A1
    python3 .claude/polish/run.py --level a2      # on top of the shipped A1
    python3 .claude/polish/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/polish/run.py --level phr     # the phrases deck, on every level deck shipped

ONE LEVEL PER RUN, built on top of the SHIPPED decks below it
(`pl_level.taught_below`).  Caches in `.claude/polish-cache/` (~1 GB,
gitignored).  The plan and the findings: `docs/polish-decks-plan.md`.

THE STAGES, in order, each writing into the cache for the next:

    extract.py      the whole Polish Wiktionary, reduced
    select.py       the level's words: the inventory + frequency fill
                    (phrases.py instead, for --level phr)
    examples.py     three Tatoeba sentences each
    build_deck.py   meanings, forms rows, sentence markup, the deck file
"""
import argparse, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "..", "polish-cache")
FETCH = {
    "kaikki-pl.jsonl": "https://kaikki.org/dictionary/Polish/kaikki.org-dictionary-Polish.jsonl",
    "pl_full.txt": "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/pl/pl_full.txt",
    "pol_sentences.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/pol/pol_sentences.tsv.bz2",
    "eng_sentences.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2",
    "pol-eng_links.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/pol/pol-eng_links.tsv.bz2",
}


def run(script, *args):
    print("==", script, *args, flush=True)
    subprocess.run([sys.executable, os.path.join(HERE, script), *args], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--level", default="a1")
    ap.add_argument("--no-fetch", action="store_true")
    a = ap.parse_args()
    os.makedirs(CACHE, exist_ok=True)
    if not a.no_fetch:
        for name, url in FETCH.items():
            p = os.path.join(CACHE, name)
            if not os.path.exists(p):
                print("== fetch", url, flush=True)
                subprocess.run(["curl", "-sSfL", "-o", p, url], check=True)
    if not os.path.exists(os.path.join(CACHE, "dict.json")):
        run("extract.py")
    run("phrases.py" if a.level == "phr" else "select.py", "--level", a.level)
    run("examples.py", "--level", a.level)
    run("build_deck.py", "--level", a.level)


if __name__ == "__main__":
    main()
