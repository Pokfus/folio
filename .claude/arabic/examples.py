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
reading the deck is the check for those.  From A2 the LOWER LEVELS' words count as
words of the deck here (they are matched, never given sentences), so A2's آخَر
"other" takes a bare `آخر` only if A1's آخِر "last" does not share it.

WHICH THREE.  3–12 tokens; shortest first, then by Tatoeba id so a re-run is
identical; one sentence per Arabic text, none sharing an English text, none
opening with the same two words as one already taken.  An English more than
three times the Arabic's length, or under a third, is skipped as a mismatch.
"""
import argparse, bz2, json, os, sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ar, inventory
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

# ---- found reading the A2 deck (Nov 2026); applied from A2 up, so the shipped A1 deck is not re-dealt ----
# More words with a common homograph the deck cannot see: `قدم` "came, gave", `حيّا` "greeted, alive",
# `أعد` "repeat", `بني` "my son, built", `سلطة` "power", `ضعف` "weakness", `طرد` "expelled", `فرق` "teams".
VOWELLED_ONLY_A2 = {"قَدَم", "حَيّ", "أَعَدَّ", "بُنِّيّ", "سَلَطَة", "ضِعْف", "طَرْد", "فَرْق"}
# Arabic substrings a word's sentence may not contain: the matched token is another word.
REFUSE_A2 = {
    "دَعَا": ["دعينا", "دعنا", "دعني", "دعوني", "دعيني", "دعه", "دعها", "دعونا"],   # دَعْ "let", of وَدَعَ
    "قَادِم": ["القدوم"], "صَدَّقَ": ["الصدق"], "سَابِق": ["السباق"], "بَنَى": ["تبنوا", "تبنى", "تبني"],
    "وَظِيفَة": ["وظف"], "دِين": ["بدين"], "بَرِيد": ["برد"], "عَامِل": ["العملة"],
    "جَزِيرَة": ["جزائر"], "أَعَدَّ": ["أعِد"], "عَرَضَ": ["تعرض", "عارض"], "قِدْر": ["بقدر"], "عَدَّ": ["عُد"], "سَلَّمَ": ["مسلم"], "شَبَكَة": ["الشباك"],
    "كَرِيم": ["الكريمة"], "دَقِيق": ["دقائق"], "حَرْف": ["حرفي"], "دُبّ": ["دبي"],
    "سَاكِن": ["ساكنا", "ساكناً"], "حِزَام": ["حزم"], "عَرُوس": ["العرس"],
    # NO SENTENCE AT ALL, every candidate being the homograph: بُنِّيّ "brown" (`بُني` "was built" carries
    # the same marks), سَلَطَة "salad" (`السّلطات` "the authorities", the sun-letter shadda agreeing),
    # خَاصَّةً (`خاصّة` is A1's خَاصّ), حَيّ "district" (`حيّا` "alive", "greeted")
    "بُنِّيّ": ["بن"], "سَلَطَة": ["سلط"], "خَاصَّةً": ["خاص"], "حَيّ": ["حي"],
}
# English substrings, for the same fault where the Arabic is easier to name by its translation.
REFUSE_EN_A2 = {
    "ثَانِيَة": ["second chance", "again"], "دَرَجَة": ["stairs"], "قِدْر": ["God forbid", "as much as", "fate", "according to", "as neat", "Destiny", "great deal", "destination", "opportunity", "easy"],
    "رُوح": ["Taro"], "عَدَّ": ["back", "home", "Go ", "go ", "Come", "come"], "تَقَدَّمَ": ["serve food", "lecture"], "كُلِّيَّة": ["recovery", "kidney"],
    "كَرِيم": ["sunscreen", "cream"], "رِيف": ["The Rif"], "سَابِق": ["former Muslim"],
    "خِدْمَة": ["served two terms"], "دِين": ["Islam"], "حَقّ": ["Islam"], "جَمَال": ["Jamal"], "سَلِيم": ["Salima"], "مَخْرَج": ["director"],
}
# Refused everywhere from A2 up: drugs, suicide, violence, a political or a religious claim, vulgarity.
REFUSE_ANY_EN_A2 = ["drug", "suicide", "explosive", "carnage", "Palestinian", "Kaddafi", "Christmas", "opiate",
                    "pills", "crap", "oldest profession", "whip", "slapped", "sexual", "opium", "unite!",
                    "pussy", "fuck", "shit", "bitch", "dick"]

# ---- found reading the B1 deck (Nov 2026); applied from B1 up, so A1 and A2 are not re-dealt ----
REFUSE_B1 = {
    "حِينَ": ["الحين"], "أَصَابَ": ["مصيب"], "أَجَّلَ": ["لأجل"], "وَفِيّ": ["الوفيات"], "عَرَّفَ": ["التعرف"],
    "حَذَّرَ": ["حذرا"], "مَالِك": ["ملاك"], "مَثَّلَ": ["مثلنا"], "قَبَّلَ": ["مقبل"], "شَاهِد": ["شهد", "شاهدة"],
    "حَمَّلَ": ["حملي"], "رِيَاضِيّ": ["رياضيات"], "لَيْلِيّ": ["ليلي"], "دِيك": ["والديك", "لديك"],
    "حَكَم": ["حكمين"], "رَبَّى": ["المربى", "رب "], "سَرَطَان": ["السلطعون"], "مَزْرَعَة": ["المزارع"],
    "آلِيّ": ["الي"], "طَرَدَ": ["طارد"], "أَصَرَّ": ["مصر"], "سَئِمَ": ["سام"], "رَكَّبَ": ["الركبي"],
    "ثَرْوَة": ["الثراء"], "مُطَلَّق": ["مطلق"], "ذُرَة": ["الذرات"], "خَزَّنَ": ["المخزن"], "تُرَاب": ["التربة"],
    "لَبَن": ["كلبنا", "لبنان"], "عَدَس": ["عدسات"], "لَوْز": ["بلوز"], "وَزَنَ": ["الزنا"], "طَبْع": ["الطبعي"],
    "جَذْر": ["جذري"],
    "لَمَّا": ["لما"],   # every candidate is لِمَا "for what" or dialect "why": no sentence
}
REFUSE_EN_B1 = {
    "أَيُّهَا": ["Which", "fool", "Dirty", "coward"], "حِينَ": ["eyes"], "فُطْر": ["natural born", "Ramadan"], "أَطْلَقَ": ["shot", "fired"], "لَمَّا": ["Why", "why", "what happened"],
    "مَلِك": ["belongs", "owns"], "تَحَمَّلَ": ["carry", "easy"], "شَخْصِيَّة": ["diary"], "قَاعِدَة": ["baseball"],
    "مُسَاعِد": ["helpless"], "مُهِمَّة": ["important", "necessary", "matter"], "أَثَّرَ": ["high"], "قَطُّ": ["cat"],
    "مَحْكَمَة": ["airtight"], "نَفَّذَ": ["short of", "rock bottom", "run out", "ran out", "out of"], "تَرَاجَعَ": ["revised"],
    "كَبُرَ": ["exaggerating"], "تُهْمَة": ["matter", "devoured"], "غَاز": ["school"], "هَدَّدَ": ["life"],
    "شَرْعِيّ": ["forensic", "affair"], "سِيَاسِيّ": ["lie all"], "دَوْرَة": ["period", "cycle"],
    "جَدْوَل": ["creek"], "مُنْتَج": ["producer"], "جَسَدِيّ": ["temperature"], "حَسَّاس": ["Wokeism"],
    "سِبَاق": ["sports car", "Hatoyama"], "مَصْلَحَة": ["firefighters"], "خَيْط": ["clinging"],
    "يَوْمِيّ": ["My day", "Yumi"], "إِقَامَة": ["meeting", "charges"], "وِعَاء": ["wisdom"], "مَعْدِن": ["bottled"],
    "تَوَصَّلَ": ["convince", "picture"], "صِفَة": ["masculine"], "مُبَاشِر": ["masculine"],
    "مُصَوِّر": ["comic", "vlogging"], "إِعْلَام": ["noticed", "club"], "مِنْحَة": ["granted"],
    "تَسْلِيم": ["extradited"], "ثَبَتَ": ["froze", "pitched"], "تِنِس": ["forget"], "صِينِيَّة": ["Chinese"],
    "عُشّ": ["Live peacefully"], "مَوْرِد": ["HR"], "مُسْتَخْدِم": ["used car"], "رَقْمِيّ": ["number"],
    "قُطْب": ["frowned"], "تُرَاب": ["laid to rest"], "مُرَاسِل": ["writing to", "write to"],
    "نَسَخَ": ["sold out"], "عَنِيد": ["arrogant"], "بِيئَة": ["grew up"], "عَرَق": ["licorice"],
    "حَمْلَة": ["manhunt", "China is leading"], "جَزَر": ["islands"], "قُطْن": ["lives"],
    "فُرْشَاة": ["fork"], "جَوْز": ["coconut"], "قِسْط": ["sleep", "break"], "خَيْمَة": ["camped"],
    "صَارِم": ["Homer"], "رِيشَة": ["paint"], "مِطْرَقَة": ["sickle", "millstone"],
    "إِيصَال": ["clinic", "take Skura"], "عُود": ["lit matches"], "لَهْجَة": ["Kabyle", "All languages"],
    "سَطْر": ["Period"], "ظُلْم": ["Like father"], "لَوْز": ["sweatshirt"],
}
REFUSE_ANY_EN_B1 = ["Taliban", "Zelenskyy", "Putin", "Hitler", "Israel", "West Bank", "Islamophob", "Bouteflika", "terrorist",
                    "fascist", "bastard", "shahada", "assaulted", "Uyghur", "Morocco", "Gay marriage", "Islam",
                    "sentenced to death", "condemned him to death", "Yidir", "your ass", "Christianity",
                    "evangelical", "sexy", "guillotined", "communism", "Muslims should", "biblical", "Ukraine"]


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
    strict = a.level != "a1"
    b1 = inventory.LEVELS.index(a.level) >= 2
    vowelled_only = VOWELLED_ONLY | (VOWELLED_ONLY_A2 if strict else set())
    refuse = dict(REFUSE)
    refuse_en = dict(REFUSE_EN_A2) if strict else {}
    refuse_any_en = REFUSE_ANY_EN_A2 + (REFUSE_ANY_EN_B1 if b1 else [])
    for on, extra, into in ((strict, REFUSE_A2, refuse), (b1, REFUSE_B1, refuse), (b1, REFUSE_EN_B1, refuse_en)):
        if on:
            for k, v in extra.items():
                into[k] = into.get(k, []) + v
    words = json.load(open(os.path.join(ar.CACHE, "wordlist-%s.json" % a.level), encoding="utf-8"))["words"]
    nw = len(words)
    for lv in inventory.LEVELS[:inventory.LEVELS.index(a.level)]:
        p_ = os.path.join(ar.CACHE, "wordlist-%s.json" % lv)
        if not os.path.exists(p_):
            raise SystemExit("build %s first: its words are this level's competitors" % lv)
        words = words + json.load(open(p_, encoding="utf-8"))["words"]

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
        if strict and any(r_ in en[0] for r_ in refuse_any_en):
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
                # an adverb takes no article: `الخاصّة` is the feminine of A1's خَاصّ, not خَاصَّةً (A2 up)
                if strict and e["pos"] == "adv" and ("ال" in p or p.endswith("لل")):
                    continue
                # a prefix on a form of one or two letters finds other words: ب + ضع is بضع "a few",
                # ك + فا is كفا, ك + لنا is كلنا
                if p and len(f) < 3:
                    continue
                # from B1 a surface the count refuses for the word is no sentence's either (ar.NOT_FORMS)
                if b1 and p + f in ar.NOT_FORMS.get(w["head"], ()):
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
    for i, w in enumerate(words[:nw]):
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
                        if words[i]["head"] in vowelled_only and not ar.MARKS.search(tok[:-1]):
                            continue
                        # a VOWELLED token must agree with the word whoever else shares its surface:
                        # `مدرّسة` is a teacher, never مَدْرَسَة "school"
                        if ar.MARKS.search(tok[:-1]) and not agrees(i, tok):
                            continue
                        if len(owners[f]) > 1 and not ar.MARKS.search(tok[:-1]):
                            continue
                        # A VOWELLED TOKEN THAT AGREES WITH TWO WORDS SAYS NEITHER (A2 up): `مرّتين` carries
                        # only a shadda, which A1's مَرَّة "time" and مُرّ "bitter" both have; `عامًا` is A1's
                        # عَام "year" as well as عَامّ "general"
                        if strict and any(j != i and agrees(j, tok) for j in owners[f]):
                            continue
                        return tok
                return None
        got, seen_ar, seen_en, seen_open = [], set(), set(), set()
        for j in cand:
            p = pool[j]
            # from A2 a refused string is also looked for in the sentence without its marks: `بن` in `بُني`
            if any(r_ in p[4] or (strict and r_ in ar.bare(p[4])) for r_ in refuse.get(w["head"], ())):
                continue
            if any(r_ in p[5] for r_ in refuse_en.get(w["head"], ())):
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
        a.level, nw - none, nw, len(pool)))


if __name__ == "__main__":
    main()
