#!/usr/bin/env python3
"""Build a Czech deck, end to end.

    python3 .claude/czech/run.py                 # A1
    python3 .claude/czech/run.py --level a2      # on top of the shipped A1
    python3 .claude/czech/run.py --no-fetch      # reuse whatever is cached

ONE LEVEL PER RUN, built on top of the SHIPPED decks below it
(`cs_level.taught_below`).  Caches in `.claude/czech-cache/` (~300 MB,
gitignored).  The plan and the findings: `docs/czech-decks-plan.md`.

THE STAGES, in order, each writing into the cache for the next:

    soupis.py       the official A1/A2 word list (NPI ČR), from its search tool
    extract.py      the whole Czech Wiktionary, reduced
    select.py       the level's words: the list resolved, the A1 supplement, frequency order
    examples.py     three Tatoeba sentences each
    build_deck.py   meanings, forms rows, sentence markup, the deck file
"""
import argparse, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "..", "czech-cache")
FETCH = {
    "kaikki-cs.jsonl": "https://kaikki.org/dictionary/Czech/kaikki.org-dictionary-Czech.jsonl",
    "cs_full.txt": "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/cs/cs_full.txt",
    "ces_sentences.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/ces/ces_sentences.tsv.bz2",
    "eng_sentences.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2",
    "ces-eng_links.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/ces/ces-eng_links.tsv.bz2",
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
    if not os.path.exists(os.path.join(CACHE, "soupis.json")):
        run("soupis.py")
    if not os.path.exists(os.path.join(CACHE, "dict.json")):
        run("extract.py")
    run("select.py", "--level", a.level)
    run("examples.py", "--level", a.level)
    run("build_deck.py", "--level", a.level)


if __name__ == "__main__":
    main()
