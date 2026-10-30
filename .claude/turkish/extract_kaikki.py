#!/usr/bin/env python3
"""Stage 1: the whole Turkish Wiktionary (kaikki.org extraction), reduced.

    python3 .claude/turkish/extract_kaikki.py

Reads `.claude/turkish-cache/kaikki-tr.jsonl` (~460 MB) and writes
`.claude/turkish-cache/dict.json`: word -> [entry], each entry carrying only
what the later stages read -- part of speech, senses (glosses, tags, the word a
form-of sense points at) and the inflection table in its own ORDER.

THE ORDER IS KEPT BECAUSE THE VERB TAGS ARE WRONG.  In this extraction a
`tr-conj` table's person tags are shifted by one row -- `giderim` is tagged
third person singular -- so a verb's forms are later picked by their position
in the table and their tense tag, never by their person tag.  See
`build_deck.py` `verb_row`.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "..", "turkish-cache")
SKIP_POS = {"character", "symbol"}


def reduce(e):
    senses = []
    for s in e.get("senses", []):
        g = s.get("glosses") or s.get("raw_glosses") or []
        if not g:
            continue
        fo = [x.get("word") for x in (s.get("form_of") or []) + (s.get("alt_of") or []) if x.get("word")]
        senses.append({"g": g, "t": s.get("tags", []), "f": fo})
    forms = [[f.get("form", ""), f.get("tags", [])] for f in e.get("forms", [])]
    return {"pos": e.get("pos"), "senses": senses, "forms": forms}


def main():
    src = os.path.join(CACHE, "kaikki-tr.jsonl")
    out = {}
    n = 0
    with open(src, encoding="utf-8") as fh:
        for line in fh:
            e = json.loads(line)
            if e.get("lang_code") != "tr" or e.get("pos") in SKIP_POS:
                continue
            r = reduce(e)
            if not r["senses"]:
                continue
            out.setdefault(e["word"], []).append(r)
            n += 1
    with open(os.path.join(CACHE, "dict.json"), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False)
    print("dict.json: %d entries over %d words" % (n, len(out)), file=sys.stderr)


if __name__ == "__main__":
    main()
