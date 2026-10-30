#!/usr/bin/env python3
"""Build a Turkish deck, end to end.

    python3 .claude/turkish/run.py                 # A1
    python3 .claude/turkish/run.py --level a2      # on top of the shipped A1
    python3 .claude/turkish/run.py --no-fetch      # reuse whatever is cached

ONE LEVEL PER RUN, and a level is built on top of the SHIPPED decks below it
(`select.taught_below`), the DELE / UKBI arrangement.  Caches in
`.claude/turkish-cache/` (~800 MB, gitignored).  See `docs/turkish-decks-plan.md`
for the plan and `docs/lang-decks.md` (`.claude/turkish/`) for the findings.

THE STAGES, in order, each writing into the cache for the next:

    extract_kaikki.py  the whole Turkish Wiktionary, reduced
    select.py          the level's words: the programme's inventory + frequency fill
    examples.py        three Tatoeba sentences each
    build_deck.py      meanings, forms rows, sentence markup, the deck file
"""
import argparse, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "..", "turkish-cache")
FETCH = {
    "kaikki-tr.jsonl": "https://kaikki.org/dictionary/Turkish/kaikki.org-dictionary-Turkish.jsonl",
    "tr_full.txt": "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/tr/tr_full.txt",
    "tur_sentences.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/tur/tur_sentences.tsv.bz2",
    "eng_sentences.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2",
    "tur-eng_links.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/tur/tur-eng_links.tsv.bz2",
    # the programme itself, READ for the inventory (supplement.py) and never committed
    "programme.pdf": "https://turkoloji.turkiyemaarif.org/uploads/2024/11/16436c12901a55.pdf",
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
