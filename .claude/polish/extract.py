#!/usr/bin/env python3
"""Stage 1: the whole Polish Wiktionary (kaikki.org extraction), reduced.

    python3 .claude/polish/extract.py

Reads `.claude/polish-cache/kaikki-pl.jsonl` (~900 MB) and writes
`.claude/polish-cache/dict.json`: word -> [entry], each entry carrying only what
the later stages read -- part of speech, the head template's first argument
(a noun's GENDER, `m-in` / `f` / `n` / `m-pr`; a verb's ASPECT, `impf` / `pf`),
the aspect partner(s) with their tags (`perfective`, `imperfective`, and for a verb of motion
`determinate` / `indeterminate`: `chodzić`'s are `iść` and `pójść`), senses (glosses, tags, the word a form-of sense points at)
and the FIRST inflection table, in its own order.

ONLY THE FIRST TABLE.  Wiktionary gives many words a second, MIDDLE POLISH
table after the modern one (`kobieta`'s second table has `kobietę` as a
genitive and dashes for every form the period did not attest).  A table begins
at a `table-tags` row, so the forms are cut at the second one.

MIDDLE AND OLD POLISH SENSES ARE DROPPED HERE, at the source: they are tagged
`Middle` + `Polish` (or `Old` + `Polish`), and `robić`'s second etymology is
"to use, to apply" in that register.  A sense tagged so is never taught.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "..", "polish-cache")
SKIP_POS = {"character", "symbol", "name", "affix", "prefix", "suffix", "infix", "interfix", "abbrev",
            "romanization", "punct"}


def old(tags):
    t = set(tags or [])
    return "Polish" in t and ("Middle" in t or "Old" in t)


GRAMMATICAL = {"masculine", "feminine", "neuter", "inanimate", "animate", "person", "countable", "uncountable",
               "imperfective", "perfective", "transitive", "intransitive", "plural", "singular", "in-plural"}


def reduce(e):
    senses = []
    for s in e.get("senses", []):
        g = s.get("glosses") or s.get("raw_glosses") or []
        if not g:
            continue
        if old(s.get("tags")):
            # ...BUT ITS PARENT IS NOT.  kaikki emits only leaf senses, so a Middle Polish sub-sense carries
            # the modern parent gloss above it: `drzewo`'s "tree (large woody plant)" and `brzuch`'s "belly,
            # abdomen, stomach" exist ONLY as parents of Middle Polish leaves.  The parent is kept with the
            # grammatical tags alone, the register tags having been the leaf's.
            if len(g) > 1:
                senses.append({"g": [g[0]], "t": [t for t in s.get("tags", []) if t in GRAMMATICAL], "f": []})
            continue
        fo = [x.get("word") for x in (s.get("form_of") or []) + (s.get("alt_of") or []) if x.get("word")]
        senses.append({"g": g, "t": s.get("tags", []), "f": fo})
    forms, tables, partner = [], 0, []
    for f in e.get("forms", []):
        tg = f.get("tags", [])
        if "table-tags" in tg:
            tables += 1
            if tables > 1:
                break
            continue
        if tables == 0:
            # before the table: the aspect partner, diminutives, related adjectives ...
            if set(tg) & {"perfective", "imperfective"} and not set(tg) & {"dialectal", "obsolete", "archaic",
                                                                            "rare", "frequentative"}:
                partner.append([f.get("form", ""), [t for t in tg if t in ("perfective", "imperfective",
                                                                         "determinate", "indeterminate")]])
            if "comparative" in tg or "superlative" in tg:
                forms.append([f.get("form", ""), tg])
            continue
        forms.append([f.get("form", ""), tg])
    head = ""
    for h in e.get("head_templates") or []:
        if h.get("name", "").startswith("pl-"):
            head = (h.get("args") or {}).get("1", "")
            break
    return {"pos": e.get("pos"), "head": head, "partner": partner, "senses": senses, "forms": forms}


# A WORD THE DUMP CANNOT CARRY.  English Wiktionary splits its largest pages ("mammoth pages") across
# subpages, and the kaikki extraction of 2026-11 has no Polish entry from them: `i` ("and"), the
# commonest conjunction of the language, is missing.  Its senses are copied here from the Polish section of
# https://en.wiktionary.org/wiki/i/languages_M_to_Z (read 2026-11-09), the glosses only, in Wiktionary's
# words and order; nothing is added.  Same licence as the rest of the dictionary (CC BY-SA).
SUPPLIED = {
    "i": [{"pos": "conj", "head": "", "partner": [], "forms": [],
           "senses": [{"g": [g], "t": [], "f": []} for g in ("and", "even", "also, too", "so, so that")]}],
}


def main():
    src = os.path.join(CACHE, "kaikki-pl.jsonl")
    out, n = {}, 0
    with open(src, encoding="utf-8") as fh:
        for line in fh:
            e = json.loads(line)
            if e.get("lang_code") != "pl" or e.get("pos") in SKIP_POS:
                continue
            r = reduce(e)
            if not r["senses"]:
                continue
            out.setdefault(e["word"], []).append(r)
            n += 1
    for w, entries in SUPPLIED.items():
        if w not in out:
            out[w] = entries
            n += len(entries)
    with open(os.path.join(CACHE, "dict.json"), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False)
    print("dict.json: %d entries over %d words" % (n, len(out)), file=sys.stderr)


if __name__ == "__main__":
    main()
