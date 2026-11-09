#!/usr/bin/env python3
"""Stage 3: up to three Tatoeba sentences for each word.

    python3 .claude/arabic/examples.py --level a1

Writes `.claude/arabic-cache/examples-<level>.json`: index -> [{ar, en, hit}],
`hit` being the token as written in the sentence, for the markup.

A WORD IS FOUND BY ITS OWN FORMS, folded (no vowels, alif seats merged), each
with the clitic prefixes `ar.PREFIXES` allows — `بالسيارة` finds سَيَّارَة.
A greeting is matched as consecutive tokens.

A SURFACE THAT IS ONE DECK WORD'S OWN HEADWORD IS THAT WORD'S (select.py's
rule), so `هذه` is هٰذِهِ and `لكن` لٰكِنْ.  BEYOND THAT, A HOMOGRAPH IS FOUND
ONLY WHERE THE SENTENCE IS VOWELLED.  Tatoeba's Arabic is
mostly written bare, and a bare `من` is "from" or "who" — `عَلِمَ` and `عَلَم`
look alike, and so on.  When a surface is the form of two words of the deck, a
sentence is attached to one of them only if the token carries vowels that agree
with that word's own vowelled forms; a bare token is left to neither.  A word
that loses every sentence to this has none, which is better than a wrong one.
Surfaces shared with a word OUTSIDE the deck cannot be seen and are not caught;
reading the deck is the check for those.

WHICH THREE.  3–12 tokens; shortest first, then by Tatoeba id so a re-run is
identical; one sentence per Arabic text, none sharing an English text, none
opening with the same two words as one already taken.  An English more than
three times the Arabic's length, or under a third, is skipped as a mismatch.
"""
import argparse, bz2, json, os, sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ar
PREFIXES = ar.PREFIXES

MIN_W, MAX_W, PER = 3, 12, 3

# WORDS WITH A COMMON HOMOGRAPH OUTSIDE THE DECK, found by reading the built deck: a bare sentence is
# not taken for them, only a vowelled one that agrees.  `علم` is knowledge or "he knew" far oftener than
# عَلَّمَ "to teach"; `آخر` is "another" (آخَر) oftener than آخِر "last"; `كتب` is "books"; `رجل` "a man";
# `قبل` "accepted"; `خافت` "faint"; `أظهر` "showed"; `جد` "very" or "find"; `كلما` "whenever"; `الشعر` poetry; a bare `انها` is إِنَّهَا.
VOWELLED_ONLY = {"عَلَّمَ", "آخِر", "أُمّ", "قَبْلَ", "رِجْل", "كَتَبَ", "كَلِمَة", "ظَهْر", "خَافَ",
                 "طَائِرَة", "فَضَّلَ", "صَفّ", "جَدّ", "سُكَّر", "شَعْر", "أَنَّ"}
# Sentences refused for one word, each read and found to use the spelling for another word (a name,
# a homograph) or to be unsuited to a first deck.  Matched as a substring of the Arabic.
REFUSE = {
    "كَانَ": ["مج بطول كن"],
    "عَلَى": ["لعلي"],
    "سَأَلَ": ["المسألة"],
    "جَاءَ": ["فاجأ"],
    "صَارَ": ["أصِرَّ"],
    "نَهْر": ["انهار"],
    "كُوب": ["كوبي"],
    "سَكَنَ": ["مسكون"],
    "جَار": ["تحر جار"],
    "دِينَار": ["الديناري"],
    "دَفَعَ": ["دافِع"],
    "بَيْنَ": ["بينها لي"],
    "رِجْل": ["رجلًا"],
}
# Sentences refused everywhere: political or violent, or a garbled pairing.
REFUSE_ANY = ["إسرائيل فوق القانون", "هَاجَمَ اْلإرْهَابِيُّونَ", "علاقات جنسيّة", "رد ديما", "صفّ كليتيّ"]


def read_tsv(name):
    with bz2.open(os.path.join(ar.CACHE, name), "rt", encoding="utf-8") as fh:
        for line in fh:
            yield line.rstrip("\n").split("\t")


def strip_final_mark(s):
    while s and ar.MARKS.match(s[-1]):
        s = s[:-1]
    return s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--level", default="a1")
    a = ap.parse_args()
    words = json.load(open(os.path.join(ar.CACHE, "wordlist-%s.json" % a.level), encoding="utf-8"))["words"]

    ara = {r[0]: r[2] for r in read_tsv("ara_sentences.tsv.bz2") if len(r) >= 3}
    links = defaultdict(list)
    for r in read_tsv("ara-eng_links.tsv.bz2"):
        if len(r) >= 2 and r[0] in ara:
            links[r[0]].append(r[1])
    need = {e for v in links.values() for e in v}
    eng = {r[0]: r[2] for r in read_tsv("eng_sentences.tsv.bz2") if len(r) >= 3 and r[0] in need}

    pool = []
    for sid, text in ara.items():
        en = [eng[e] for e in sorted(links.get(sid, []), key=int) if e in eng]
        if not en:
            continue
        toks = ar.tokens(text)
        if not (MIN_W <= len(toks) <= MAX_W):
            continue
        r = len(en[0]) / max(1, len(text))
        if r > 3 or r < 1 / 3:
            continue
        if any(r_ in text for r_ in REFUSE_ANY):
            continue
        pool.append((len(toks), int(sid), toks, [ar.fold(t) for t in toks], text, en[0], set()))
    pool.sort(key=lambda x: (x[0], x[1]))
    # A WORD INSIDE ONE OF THE DECK'S COMPOUNDS IS THE COMPOUND'S: `اثنا` in إثنا عشر is twelve, not two;
    # `عيد` in عيد ميلاد is the birthday card's
    compounds = [[ar.fold(x) for x in ar.tokens(w["head"])] for w in words if " " in w["head"]]
    for p in pool:
        for c in compounds:
            for k in range(len(p[3]) - len(c) + 1):
                if p[3][k:k + len(c)] == c:
                    p[6].update(range(k, k + len(c)))
    index = defaultdict(list)
    for i, p in enumerate(pool):
        for t in set(p[3]):
            index[t].append(i)

    # each word's surfaces, and its vowelled forms (bare of prefix) for the homograph test
    surf, seats = [], []
    for w in words:
        e = w["e"]
        clitic = e["head"].endswith("ـ") or len(ar.bare(w["head"])) == 1
        if e["pos"] == "pron":
            # A PRONOUN IS ITS OWN HEADWORD ONLY: Wiktionary's table for أَنْتَ carries إِيَّاكَ, and
            # هٰذَا's carries the feminine and the plural, which are other cards
            vf = [e["head"], w["head"]]
        else:
            vf = list(e.get("vf") or []) + [e["head"], w["head"]]
        s, b = set(), set()
        for v in vf:
            f = ar.fold(v)
            if not f:
                continue
            for p in ([""] if clitic else PREFIXES):
                if p.endswith("ال") and f.startswith("ال"):
                    continue
                # a prefix on a form of one or two letters finds other words: ب + ضع is بضع "a few",
                # ك + فا is كفا, ك + لنا is كلنا
                if p and len(f) < 3:
                    continue
                s.add(p + f)
                b.add(p + ar.bare(v))
        surf.append(s)
        seats.append(b)
    owners = defaultdict(set)
    for i, s in enumerate(surf):
        if " " not in words[i]["head"]:
            for x in s:
                owners[x].add(i)
    # a surface that is ONE deck word's own headword is that word's alone (select.py's rule): `هذه` is
    # هٰذِهِ, not a cell of هٰذَا's table; `لكن` is لٰكِنْ, not لِ + a form of كَانَ
    heads = defaultdict(set)
    for i, w in enumerate(words):
        if " " not in w["head"]:
            heads[ar.fold(w["head"])].add(i)
    for x, own in owners.items():
        mine = own & heads.get(x, set())
        if len(mine) == 1:
            owners[x] = mine
    full = []                                   # every vowelled form of the entry, for agreement
    for w in words:
        forms = {strip_final_mark(v) for v in w["e"].get("vf", [])} | {strip_final_mark(w["e"]["head"])}
        for k in ("past", "pres"):
            forms |= {strip_final_mark(v) for v in (w["e"].get(k) or {}).values()}
        full.append(forms)

    def clusters(x):
        out = []
        for ch in x:
            if ar.MARKS.match(ch):
                if out:
                    out[-1][1].add(ch)
            else:
                out.append([ar.fold(ch), set()])
        return out

    def agrees(i, tok):
        """A vowelled token agrees with word i if its last letters are one of i's vowelled forms and
        every mark it carries is a mark that form has on that letter (a sentence is often vowelled
        only in part: `الحمّام` carries the shadda alone).  The last letter's marks are the case
        ending and are not compared."""
        tc = clusters(tok)
        for f in full[i]:
            fc = clusters(f)
            if not fc or len(tc) < len(fc):
                continue
            tail = tc[-len(fc):]
            if all(a[0] == b[0] and (k == len(fc) - 1 or a[1] <= b[1]) for k, (a, b) in enumerate(zip(tail, fc))):
                return True
        return False

    out = {}
    none = 0
    for i, w in enumerate(words):
        if " " in w["head"]:
            parts = [ar.fold(x) for x in ar.tokens(w["head"])]
            cand = sorted(set(index.get(parts[0], [])))

            def hit_of(p, parts=parts):
                n = len(parts)
                for k in range(len(p[3]) - n + 1):
                    if p[3][k:k + n] == parts:
                        return " ".join(p[2][k:k + n])
                return None
        else:
            cand = sorted({j for x in surf[i] for j in index.get(x, [])})

            def hit_of(p, i=i):
                for k, (tok, f) in enumerate(zip(p[2], p[3])):
                    if k in p[6]:
                        continue
                    if f in surf[i] and i in owners[f]:
                        # A WRITTEN HAMZA SEAT MUST BE THE WORD'S: folding reads إ and أ as one alif, so
                        # `إنه` matched أَنَّ and `للأسف` آسِف; a bare alif is still read as any seat
                        if any(c in ar.bare(tok) for c in "\u0623\u0625\u0622") and ar.bare(tok) not in seats[i]:
                            continue
                        # tanwin on a word whose forms never carry it is another word: `إذاً` is not إِذَا
                        if any(c in tok for c in "\u064B\u064C\u064D") and not any(
                                c in v for v in full[i] for c in "\u064B\u064C\u064D") and not any(
                                c in w_["head"] for w_ in [words[i]] for c in "\u064B\u064C\u064D"):
                            continue
                        if words[i]["head"] in VOWELLED_ONLY and not ar.MARKS.search(tok[:-1]):
                            continue
                        # a VOWELLED token must agree with the word whoever else shares its surface:
                        # `مدرّسة` is a teacher, never مَدْرَسَة "school"
                        if ar.MARKS.search(tok[:-1]) and not agrees(i, tok):
                            continue
                        if len(owners[f]) > 1 and not ar.MARKS.search(tok[:-1]):
                            continue
                        return tok
                return None
        got, seen_ar, seen_en, seen_open = [], set(), set(), set()
        for j in cand:
            p = pool[j]
            if any(r_ in p[4] for r_ in REFUSE.get(w["head"], ())):
                continue
            h = hit_of(p)
            if not h or p[4] in seen_ar or p[5] in seen_en or tuple(p[3][:2]) in seen_open:
                continue
            seen_ar.add(p[4]); seen_en.add(p[5]); seen_open.add(tuple(p[3][:2]))
            got.append({"ar": p[4], "en": p[5], "hit": h})
            if len(got) == PER:
                break
        if not got:
            none += 1
        out[str(i)] = got
    json.dump(out, open(os.path.join(ar.CACHE, "examples-%s.json" % a.level), "w", encoding="utf-8"),
              ensure_ascii=False, indent=0)
    print("examples-%s.json: %d of %d words have a sentence (%d sentences in the pool)" % (
        a.level, len(words) - none, len(words), len(pool)))


if __name__ == "__main__":
    main()
