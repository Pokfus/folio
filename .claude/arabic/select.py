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
are the first thing an A1 learner needs.

THE LEVELS BELOW (A2 up).  Every line of a lower level's inventory is joined too:
a line whose entry is one a lower level already teaches STOPS the build (no
headword is taught twice), and the lower levels' words take part in the count as
competitors — a surface they share with this level's word is split with them —
but are not dealt.  "Taught" means DEALT: a lower line its deck left out
(`wordlist-<lower>.json`) is not taught, and from B1 such lines are CARRIED into
this level's own lines, competing on the same count, so a word is never lost
between levels (A2 dealt 600 of its 789 lines).  So `علم` is not all credited to عِلْم "science" when A1's
عَلَّمَ "to teach" is written the same.  Any other multi-word line (a compound
or a numeral) is counted at its rarest word's surface, an upper bound.
"""
import argparse, json, os, re, sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ar, inventory

PREFIXES = ar.PREFIXES
SIZE = {"a1": 500, "a2": 600, "b1": 800, "b2": 900, "c1": 700}
NOT_FORMS = ar.NOT_FORMS            # in ar.py since B1: examples.py reads it too
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
    rank = inventory.LEVELS.index(a.level)
    below, carried = [], []
    # DEALT BY ANY LOWER DECK: an A2 line that A2 left out but B1 took up is taught (found building B2)
    dealt = set()
    for lv in inventory.LEVELS[:rank]:
        p_ = os.path.join(ar.CACHE, "wordlist-%s.json" % lv)
        if not os.path.exists(p_):
            raise SystemExit("build %s first: its dealt words are this level's competitors" % lv)
        dealt |= {w["head"] for w in json.load(open(p_, encoding="utf-8"))["words"]}
    for lv in inventory.LEVELS[:rank]:
        for ln in inventory.entries(lv):
            ln["e"] = join(D, ln)[0]
            if ln["e"]:
                (below if ln["head"] in dealt else carried).append(ln)
    lines = inventory.entries(a.level)
    if rank >= 2:                  # B1 up: the lower lines their decks left out are this level's too
        lines = [dict(ln, carried=True) for ln in carried] + lines
    missing, loose = [], []
    for ln in lines:
        if ln.get("carried"):
            continue
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
    taught = {(ln["e"]["head"], ln["e"]["pos"]): ln for ln in below}
    twice = [(ln, taught[(ln["e"]["head"], ln["e"]["pos"])]) for ln in lines
             if (ln["e"]["head"], ln["e"]["pos"]) in taught]
    for ln, b in twice:
        print("  TAUGHT BELOW  %s (%s) %s = %s" % (ln["head"], ln["pos"], ln["en"], b["en"]))
    if twice:
        raise SystemExit("%d inventory lines are taught at a lower level" % len(twice))
    nl = len(lines)
    lines = lines + below          # the competitors: counted, never dealt

    # ---- the count ----
    # THREE RULES FOUND AT A2, NOT APPLIED TO A1: the shipped A1 deck's card ids are its positions, so
    # re-dealing it would hand readers' progress to other words.  (1) No prefix is credited on a form of
    # one or two letters (examples.py's rule): `لقد` was ل + قُدْ, قَادَ's imperative, and `بعد` ب + عُدْ.
    # (2) The article is never stripped from a VERB's form: `الامر` was ال + أَمُرُّ, a cell of مَرَّ.
    # (3) Two headwords whose folded spellings meet but whose written ones differ (كَانَ and كَأَنَّ, both
    # `كان` folded) split that surface by how often each written spelling occurs, not equally.
    strict = a.level != "a1"
    bare_freq = defaultdict(int)
    freq = {}
    with open(os.path.join(ar.CACHE, "ar_full.txt"), encoding="utf-8") as fh:
        for row in fh:
            p = row.split()
            if len(p) == 2 and p[1].isdigit():
                k = ar.fold(p[0])
                freq[k] = freq.get(k, 0) + int(p[1])
                bare_freq[ar.bare(p[0])] += int(p[1])
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
                if strict and p and (len(f) < 3 or ("ال" in p or p.endswith("لل")) and e["pos"] == "verb"):
                    continue
                if p + f in NOT_FORMS.get(ln["head"], ()):
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
    # B1 UP: A SPELLING THAT IS A LOWER LEVEL'S OWN HEADWORD IS THAT WORD'S ALONE.  Split equally, `قبل`
    # (A1's قَبْلَ "before") gave half its count to قَبَّلَ "to kiss" and `لكن` half to لٰكِنَّ, which then
    # led the B1 deal; the word a lower level teaches is the commoner reading of a spelling it owns.
    lower = set(range(nl, len(lines)))
    shared_head = set()
    for s_, own in owners.items():
        if rank >= 2:
            low = own & own_head.get(s_, set()) & lower
            if low:
                owners[s_] = low
                if len(low) > 1:
                    shared_head.add(s_)
                continue
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
    via = defaultdict(dict)                            # word -> surface -> credit, for the report
    for s, own in owners.items():
        n = freq.get(s, 0)
        if not n:
            continue
        # two headwords of one spelling split it EQUALLY: in proportion, مِنْ's thousands of
        # unambiguous `منه` / `منها` would leave مَنْ "who" nothing at all
        tot = 0 if s in shared_head else sum(uniq[i] for i in own)
        written = {i: bare_freq.get(ar.bare(lines[i]["head"]), 0) for i in own}
        if strict and s in shared_head and len({ar.bare(lines[i]["head"]) for i in own}) > 1 and sum(written.values()):
            for i in own:
                count[i] += n * written[i] / sum(written.values())
                via[i][s] = n * written[i] / sum(written.values())
            continue
        for i in own:
            count[i] += n * (uniq[i] / tot if tot else 1.0 / len(own))
            via[i][s] = n * (uniq[i] / tot if tot else 1.0 / len(own))

    for i, ln in enumerate(lines):
        ln["count"] = int(round(count[i]))
        ln["phrase"] = " " in ln["head"] and ln["topic"] == "greetings and politeness"
        if " " in ln["head"] and not ln["phrase"]:
            # a compound (`كُرَة الْقَدَم`, `أَحَدَ عَشَرَ`) is as common as its rarest word, at most
            ln["count"] = min(freq.get(ar.fold(w), 0) for w in ln["head"].split())
    # greetings first, then by count, then inventory order
    order = sorted(range(nl), key=lambda i: (not lines[i]["phrase"], -lines[i]["count"], i))
    keep = order[:SIZE[a.level]]
    dropped = [lines[i] for i in order[SIZE[a.level]:]]
    words = []
    for i in keep:
        ln = lines[i]
        words.append({"head": ln["head"], "pos": ln["pos"], "en": ln["en"], "topic": ln["topic"],
                      "count": ln["count"], "key": ar.bare(ln["head"]), "e": ln["e"],
                      "via": [[k, int(v)] for k, v in sorted(via[i].items(), key=lambda x: -x[1])[:3]]})
    out = {"level": a.level, "inventory": nl, "words": words,
           "dropped": [{"head": d["head"], "en": d["en"], "count": d["count"]} for d in dropped]}
    json.dump(out, open(os.path.join(ar.CACHE, "wordlist-%s.json" % a.level), "w", encoding="utf-8"),
              ensure_ascii=False, indent=0)
    print("wordlist-%s.json: %d words of %d lines; dropped (least frequent): %s" % (
        a.level, len(words), nl, ", ".join("%s %s" % (d["head"], d["count"]) for d in dropped)))
    print("first 40:", " ".join(w["head"] for w in words[:40]))


if __name__ == "__main__":
    main()
