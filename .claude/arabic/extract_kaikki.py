#!/usr/bin/env python3
"""Stage 1: the Arabic Wiktionary (kaikki.org's extract), reduced.

    python3 .claude/arabic/extract_kaikki.py

Reads `.claude/arabic-cache/kaikki-ar.jsonl` (~870 MB) and writes `dict.json`:
bare page title -> [entry], each entry carrying only what a card prints or a
matcher needs — the vowelled headword, its romanisation, gender, plural(s),
feminine, a verb's non-past, verbal noun, form number and its past and non-past
indicative cells, the root, the first glosses (for disambiguation only: the
cards' English is written by hand in `inventory.py`), and every inflected form
folded, for finding the word in a sentence.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ar

KEEP_POS = {"noun", "verb", "adj", "adv", "pron", "prep", "conj", "num", "particle", "intj", "phrase", "name", "det"}
PERSONS = ["first-person", "second-person", "third-person"]


def cells(forms, aspect):
    """past / non-past indicative active cells, keyed 'p|g|n' (person, gender, number)."""
    out = {}
    for f in forms:
        t = set(f.get("tags") or [])
        if aspect not in t or "active" not in t or "indicative" not in t:
            continue
        p = next((x for x in PERSONS if x in t), None)
        n = "singular" if "singular" in t else "plural" if "plural" in t else "dual" if "dual" in t else None
        g = "f" if "feminine" in t else "m"
        if p and n:
            out.setdefault("%s|%s|%s" % (p[0], g, n[0]), f["form"])
    return out


def main():
    D = {}
    n = 0
    with open(os.path.join(ar.CACHE, "kaikki-ar.jsonl"), encoding="utf-8") as fh:
        for line in fh:
            e = json.loads(line)
            if e.get("lang_code") != "ar" or e.get("pos") not in KEEP_POS:
                continue
            forms = e.get("forms") or []
            canon = [f for f in forms if "canonical" in (f.get("tags") or [])]
            head = canon[0]["form"] if canon else e["word"]
            ctags = set(canon[0].get("tags") or []) if canon else set()
            tag = lambda t: [f["form"] for f in forms if (f.get("tags") or []) == [t]]
            roman = tag("romanization")
            root = ""
            for t in e.get("etymology_templates") or []:
                a = t.get("args") or {}
                if t.get("name") == "ar-rootbox" and a.get("1"):
                    root = a["1"]
                elif t.get("name") == "etymon" and a.get("2") == ":root" and not root:
                    root = a.get("3", "").split("<")[0]
            glosses = []
            for s in e.get("senses") or []:
                for g in s.get("glosses") or []:
                    if g not in glosses:
                        glosses.append(g)
            r = {
                "pos": e["pos"], "head": head, "roman": roman[0] if roman else "",
                "g": "f" if "feminine" in ctags else "m" if "masculine" in ctags else "",
                "pl": tag("plural"), "fem": tag("feminine"), "root": root,
                "gl": glosses[:6],
                "folded": sorted({ar.fold(f["form"]) for f in forms if ar.WORD.fullmatch(ar.bare(f["form"]) or "-")}),
                # the vowelled forms themselves, for examples.py's test that a vowelled token agrees
                "vf": sorted({f["form"] for f in forms if ar.WORD.fullmatch(f["form"])} | {head}),
            }
            if e["pos"] == "adj":
                # an adjective's plural is filed as "common plural" or "masculine plural" (a broken plural
                # first where it has one), its comparative as "elative"
                r["apl"] = list(dict.fromkeys(f["form"] for f in forms if "plural" in (f.get("tags") or [])
                                              and set(f["tags"]) <= {"plural", "common", "masculine"}))
                r["elat"] = tag("elative")
            if e["pos"] == "verb":
                r["form"] = next((t[5:].upper() for t in ctags if t.startswith("form-")), "")
                r["np"] = tag("non-past")
                r["vn"] = tag("noun-from-verb")
                r["past"] = cells(forms, "past")
                r["pres"] = cells(forms, "non-past")
            D.setdefault(ar.bare(e["word"]), []).append(r)
            n += 1
    json.dump(D, open(os.path.join(ar.CACHE, "dict.json"), "w", encoding="utf-8"), ensure_ascii=False)
    print("dict.json: %d entries under %d titles" % (n, len(D)))


if __name__ == "__main__":
    main()
