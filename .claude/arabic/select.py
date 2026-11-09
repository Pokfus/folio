#!/usr/bin/env python3
"""Stage 2: join the inventory to Wiktionary, count each word, deal by frequency.

    python3 .claude/arabic/select.py --level a1

Writes `.claude/arabic-cache/wordlist-<level>.json`.

THE JOIN.  Each inventory line names a vowelled headword and a part of speech.
The entries under its bare spelling are scored: the vowelled head equal to the
line's (folded only for the hamzat al-wasl seat, which Wiktionary writes either
way) is worth most, then the part of speech, then a word of the line's English
found in the entry's glosses — so `بَيْت` "house" is the house and not the verse.
Every line whose best entry is not an exact head-and-pos match is PRINTED, and a
line with no entry at all stops the build: read the report, do not ignore it.

THE COUNT.  hermitdave's Arabic subtitle list counts bare surface forms, and an
Arabic surface carries its clitics: وَ "and", فَ "so", بِ "with", لِ "for",
كَ "like" and the article اَلْ are written joined to the word (`والكتاب`,
`بالبيت`).  So a surface is credited to a word when, with at most one such
prefix chain stripped, it is one of the word's own inflected forms
(Wiktionary's table, folded).  A surface that is the form of several inventory
words is split IN PROPORTION to their unambiguous counts (the Turkish rule: an
equal split made a rare word common on a commoner word's surface).  Pronoun
suffixes are not stripped — Wiktionary's tables do not carry them and guessing
at them credits `كتابه` to nothing rather than to the wrong word.
A multi-word greeting is ranked at the top whatever a film says: the greetings
are the first thing an A1 learner needs.  Any other multi-word line (a compound
or a numeral) is counted at its rarest word's surface, an upper bound.
"""
import argparse, json, os, re, sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ar, inventory

PREFIXES = ar.PREFIXES
SIZE = {"a1": 500}
POS_GROUPS = [{"noun", "name"}, {"particle", "adv", "intj"}, {"pron", "adv", "det"}, {"phrase", "intj", "adv"}]


def norm_head(s):
    return ar.fold(s).replace("ٱ", "ا")


def score(line, e):
    s = 0
    if ar.bare(e["head"]) == ar.bare(line["head"]) and e["head"].replace("ٱ", "ا") == line["head"].replace("ٱ", "ا"):
        s += 4
    if e["pos"] == line["pos"] or any(line["pos"] in g and e["pos"] in g for g in POS_GROUPS):
        s += 2
    words = set(re.findall(r"[a-z]{3,}", line["en"].lower())) - {"the", "and", "for", "one", "man", "woman"}
    if any(w in " ".join(e["gl"]).lower() for w in words):
        s += 1
    return s


def join(D, line):
    key = ar.bare(line["head"])
    cands = list(D.get(key, []))
    if key.startswith("ال") and not cands:          # Wiktionary files اَلْيَوْمَ under يوم
        cands = [e for e in D.get(key[2:], []) if e["pos"] == line["pos"]]
    if not cands:
        for k in (ar.fold(line["head"]), key.replace("ا", "أ", 1), key.replace("أ", "ا", 1), key.replace("إ", "ا", 1)):
            if k in D:
                cands = D[k]
                break
    # a form-of stub ("تفضل # تَفْضُلُ", no glosses) is never a card's entry
    cands = [e for e in cands if "#" not in e["head"] and e["gl"]]
    # THE PART OF SPEECH FILTERS BEFORE IT SCORES: `لِ` the preposition, not the empty verb page
    # that happens to share its exact spelling.  Kaikki files the days as names and `نَعَمْ` as an
    # adverb, so the groups below count as one part of speech.
    grp = next((g for g in POS_GROUPS if line["pos"] in g), {line["pos"]})
    same = [e for e in cands if e["pos"] in grp]
    cands = same or cands
    if not cands:
        return None, 0
    best = max(cands, key=lambda e: score(line, e))
    return best, score(line, best)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--level", default="a1")
    a = ap.parse_args()
    D = ar.load_dict()
    lines = inventory.entries()
    missing, loose = [], []
    for ln in lines:
        e, s = join(D, ln)
        if e is None:
            missing.append(ln)
            continue
        ln["e"] = e
        if s < 6:
            loose.append((ln, e, s))
    for ln, e, s in loose:
        print("  loose %d  %s (%s) -> %s (%s) %s" % (s, ln["head"], ln["pos"], e["head"], e["pos"], "; ".join(e["gl"][:2])[:80]))
    for ln in missing:
        print("  MISSING  %s | %s | %s" % (ln["head"], ln["pos"], ln["en"]))
    if missing:
        raise SystemExit("%d inventory lines have no Wiktionary entry" % len(missing))

    # duplicate headwords or English sides are faults in the inventory, not in the data
    seen_h, seen_e = {}, {}
    for ln in lines:
        h = ln["e"]["head"]
        if h in seen_h and ln["e"]["pos"] == seen_h[h]["e"]["pos"]:
            raise SystemExit("inventory: %s twice (%s / %s)" % (h, seen_h[h]["en"], ln["en"]))
        seen_h[h] = ln
        if ln["en"] in seen_e:
            raise SystemExit("inventory: English %r twice" % ln["en"])
        seen_e[ln["en"]] = ln

    # ---- the count ----
    freq = {}
    with open(os.path.join(ar.CACHE, "ar_full.txt"), encoding="utf-8") as fh:
        for row in fh:
            p = row.split()
            if len(p) == 2 and p[1].isdigit():
                k = ar.fold(p[0])
                freq[k] = freq.get(k, 0) + int(p[1])
    owners = defaultdict(set)                         # surface -> inventory indices
    for i, ln in enumerate(lines):
        e = ln["e"]
        if " " in ln["head"]:
            continue
        forms = set(e.get("folded") or []) | {ar.fold(e["head"])}
        for f in forms:
            if not f:
                continue
            for p in PREFIXES:
                if p.endswith("ال") and f.startswith("ال"):
                    continue
                owners[p + f].add(i)
    # A SURFACE THAT IS A WORD'S OWN HEADWORD IS THAT WORD'S FIRST (the Turkish rule): Wiktionary's
    # table for هٰذَا carries هٰذِهِ, ذٰلِكَ's carries تِلْكَ, and جَدّ's accusative is spelt جدا — so
    # without this هٰذِهِ, تِلْكَ and جِدًّا were counted at nothing and dealt last.  Two headwords
    # of one spelling (مَنْ "who" and مِنْ "from") still share it.
    own_head = defaultdict(set)
    for i, ln in enumerate(lines):
        if " " not in ln["head"]:
            own_head[ar.fold(ln["head"])].add(i)
            own_head[ar.fold(ln["e"]["head"])].add(i)
    shared_head = set()
    for s_, own in owners.items():
        mine = own & own_head.get(s_, set())
        if mine:
            owners[s_] = mine
            if len(mine) > 1:
                shared_head.add(s_)
    uniq = defaultdict(int)
    for s, own in owners.items():
        if len(own) == 1:
            uniq[next(iter(own))] += freq.get(s, 0)
    count = defaultdict(float)
    for s, own in owners.items():
        n = freq.get(s, 0)
        if not n:
            continue
        # two headwords of one spelling split it EQUALLY: in proportion, مِنْ's thousands of
        # unambiguous `منه` / `منها` would leave مَنْ "who" nothing at all
        tot = 0 if s in shared_head else sum(uniq[i] for i in own)
        for i in own:
            count[i] += n * (uniq[i] / tot if tot else 1.0 / len(own))

    for i, ln in enumerate(lines):
        ln["count"] = int(round(count[i]))
        ln["phrase"] = " " in ln["head"] and ln["topic"] == "greetings and politeness"
        if " " in ln["head"] and not ln["phrase"]:
            # a compound (`كُرَة الْقَدَم`, `أَحَدَ عَشَرَ`) is as common as its rarest word, at most
            ln["count"] = min(freq.get(ar.fold(w), 0) for w in ln["head"].split())
    # greetings first, then by count, then inventory order
    order = sorted(range(len(lines)), key=lambda i: (not lines[i]["phrase"], -lines[i]["count"], i))
    keep = order[:SIZE[a.level]]
    dropped = [lines[i] for i in order[SIZE[a.level]:]]
    words = []
    for i in keep:
        ln = lines[i]
        words.append({"head": ln["head"], "pos": ln["pos"], "en": ln["en"], "topic": ln["topic"],
                      "count": ln["count"], "key": ar.bare(ln["head"]), "e": ln["e"]})
    out = {"level": a.level, "inventory": len(lines), "words": words,
           "dropped": [{"head": d["head"], "en": d["en"], "count": d["count"]} for d in dropped]}
    json.dump(out, open(os.path.join(ar.CACHE, "wordlist-%s.json" % a.level), "w", encoding="utf-8"),
              ensure_ascii=False, indent=0)
    print("wordlist-%s.json: %d words of %d lines; dropped (least frequent): %s" % (
        a.level, len(words), len(lines), ", ".join("%s %s" % (d["head"], d["count"]) for d in dropped)))
    print("first 40:", " ".join(w["head"] for w in words[:40]))


if __name__ == "__main__":
    main()
