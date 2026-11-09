#!/usr/bin/env python3
"""Build the Arabic decks, end to end.

    python3 .claude/arabic/run.py                 # Arabic A1
    python3 .claude/arabic/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/arabic/alphabet.py            # the Arabic Alphabet deck (hand-written, no cache)

Caches in `.claude/arabic-cache/` (~1.4 GB, gitignored).  See
`docs/arabic-decks-plan.md` for the plan and the findings.

THE STAGES, in order, each writing into the cache for the next:

    extract_kaikki.py  the whole Arabic Wiktionary, reduced to dict.json
    select.py          the inventory (inventory.py) joined to it, counted, dealt
    examples.py        three Tatoeba sentences each
    build_deck.py      forms rows, conjugation tables, markup, the deck file

A re-run reproduces the shipped deck byte for byte; read the diff if it does not.
"""
import argparse, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "..", "arabic-cache")
FETCH = {
    "kaikki-ar.jsonl": "https://kaikki.org/dictionary/Arabic/kaikki.org-dictionary-Arabic.jsonl",
    "ar_full.txt": "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/ar/ar_full.txt",
    "ara_sentences.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/ara/ara_sentences.tsv.bz2",
    "eng_sentences.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2",
    "ara-eng_links.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/ara/ara-eng_links.tsv.bz2",
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
        run("extract_kaikki.py")
    run("select.py", "--level", a.level)
    run("examples.py", "--level", a.level)
    run("build_deck.py", "--level", a.level)


if __name__ == "__main__":
    main()
