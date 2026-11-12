"""Shared helpers for the Arabic decks' generator (`.claude/arabic/`).

THE FOLD.  Arabic is written with its short vowels left out, and every corpus here
mixes vowelled and bare text (Tatoeba's sentences are mostly bare, a few fully
vowelled; the subtitle list is bare; Wiktionary's headwords are fully vowelled).
So matching and counting go through `fold`: the harakat, shadda, sukun, tanwin,
dagger alif and tatweel are removed, and the hamza seats on alif (أ إ آ ٱ) are
read as a bare alif, since a bare text often writes them so.  The CARDS always
print the vowelled form — that is what an A1 learner reads by.
"""
import json, os, re, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "..", "arabic-cache")
ROOT = os.path.join(HERE, "..", "..")
DECKS = os.path.join(ROOT, "decks")

# U+064B..U+0652 harakat/tanwin/shadda/sukun, U+0670 dagger alif, U+0640 tatweel,
# U+0653..U+065F the rarer combining marks, U+06E1 the Quranic small sukun
MARKS = re.compile("[ً-ٰٟـۡ]")
ALIFS = str.maketrans({"أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا"})
# the clitics written joined to a word's front: and, so, with, for, like, the article
PREFIXES = ["", "و", "ف", "ب", "ل", "ك", "ال", "وال", "فال", "بال", "كال", "لل", "ولل", "وب", "ول", "فب", "فل"]
WORD = re.compile("[ء-غف-يً-ٰٟٱ]+")


def bare(s):
    """The word without its vowel marks, hamza seats kept (the spelling a card names)."""
    return MARKS.sub("", unicodedata.normalize("NFC", s))


def fold(s):
    """The matching key: no vowel marks, every alif seat read as a bare alif."""
    return bare(s).translate(ALIFS)


def tokens(text):
    return WORD.findall(text)


def load_dict():
    return json.load(open(os.path.join(CACHE, "dict.json"), encoding="utf-8"))


# SURFACES THAT ARE ANOTHER WORD, read off the A2 and B1 reports (`via`, the surfaces each count came from): a
# cell of the word's table that is, in a film, nearly always something else.  `select.py` never counts
# them for the word; from B1 up `examples.py` never takes a sentence through them either.  `بان` is بِ + أَنْ, `ابني`
# "my son"; `اسمك` "your name", not سَمِيك's elative; `ارفع` "raise!"; `الفراش` "the bed"; `كاذبة` "false".
NOT_FORMS = {
    "بَنَى": {"بان", "ابني"},
    "سَمِيك": {"اسمك", "باسمك"},
    "رَفِيع": {"ارفع"},
    "فَرَاشَة": {"فراش", "الفراش", "للفراش", "بالفراش", "والفراش"},
    "ذُبَابَة": {"كاذبة"},
    # read off the B1 report: `اجل` "yes"; `الي` إليّ; `بالطبع` "of course"; `حسن` "good"; `لديك` "you
    # have"; `سام` the name Sam; `مطلقا` "absolutely"; `الغير` "others"; `البشر` A2's بَشَر; `تينا` Tina;
    # `الفقري` "vertebral"; `الملك` the king; `لاجل` "for the sake of", the noun; `كلا` "no!"; `اد` أَدِّ
    "أَجَّلَ": {"اجل", "واجل", "فاجل", "لاجل", "ولاجل"}, "كِلَا": {"كلا", "وكلا"}, "أَدَّى": {"اد"}, "أَجْل": {"اجل", "واجل", "فاجل"}, "آلِيّ": {"الي", "والي"},
    "طَبْع": {"بالطبع", "وبالطبع"}, "حَسَّنَ": {"حسن", "وحسن", "فحسن"}, "دِيك": {"لديك", "الديك", "ولديك"},
    "سَئِمَ": {"سام", "وسام"}, "مُطَلَّق": {"مطلقا"}, "غَيُور": {"الغير", "للغير"}, "بَشَرَة": {"البشر", "بشر"},
    "تِين": {"تينا"}, "فَقْر": {"الفقري"}, "مَالِك": {"الملك", "ملك"},
    # read off the B2 report: `لابد` "must" and `تبدين` "you seem" (بَدَا); `لمن` "for whom"; `يحدث`
    # A2's حَدَثَ; `بوسعي` "I can"; `الكلية` A2's كُلِّيَّة; `لاباس` "no matter"; `الزمن` "time"; `مولي`,
    # `انجي` names; `تشاد` Chad, `اشد` "stronger"; `اصغ` "listen!"; `الحق` "the truth"; `بشكل` A2's شَكْل;
    # `لندن` London; `باقي` "the rest"; `لعينة` "damned"; `خلف` "behind"; `العالم` "the world"; `المدعو`
    # "so-called"; `حرفيا` "literally"; `عوضا` "instead"
    "أَبْدَى": {"لابد", "تبدين", "يبدوا", "يبدو", "تبدو", "ابدو", "نبدو"}, "لَامَ": {"لمن", "الام"},
    "أَحْدَثَ": {"يحدث", "احداث"}, "وَسَّعَ": {"بوسعي", "بوسعنا", "بوسع", "بوسعك"},
    "كُلِّيّ": {"الكلية", "كلية"}, "بَائِس": {"لاباس"}, "أَلْزَمَ": {"الزمن", "بالزمن", "والزمن", "للزمن"},
    "مَوَّلَ": {"مولي", "مول"}, "أَشَادَ": {"اشد", "تشاد", "تشد"}, "صَاغَ": {"اصغ", "تصغ"},
    "أَلْحَقَ": {"الحق", "بالحق", "والحق"}, "شَكَّلَ": {"بشكل", "شكل", "الشكل"}, "أَدَانَ": {"لندن"},
    "نَجَا": {"انجي"}, "وَقَى": {"باقي", "الباقي"}, "عَيِّنَة": {"لعينة"}, "خَلَفَ": {"خلف"},
    "عَالِم": {"العالم", "بالعالم", "للعالم", "والعالم"}, "مُدَّعٍ": {"المدعو"}, "حِرَفِيّ": {"حرفيا"},
    "عَوَّضَ": {"عوضا"}, "فَصِيح": {"الفصح", "فصح"},   # `الفصح` Easter
    "جِين": {"جين"}, "حَدّ": {"وحدي", "وحدك", "وحده", "وحدها", "وحدنا", "وحدهم"},   # Jane; وَحْدِي "alone"
    # read off the C1 report: `اشعر` "I feel" (A1's شَعَرَ); `تحرك` "moves"; `فان`, `كيفن`, `بيرس`, `دونا`,
    # `جان`, `بولي`, `جوي` names; `شي` "thing"; `كوني` "be!"; `الظلام` "darkness"; `السير` "Sir, walking";
    # `العنف` B2's عُنْف; `وفقا` "according to"; `يسير` "walks"; `نخب` "a toast"; `بال` "mind"; `طرف` "side";
    # `سار` "walked"; `المعلومات` A2's مَعْلُومَات; `ابلغ` "inform"; `شبه` "semi-"; `نباح` "barking"
    "أَشْعَرَ": {"اشعر", "تشعر", "يشعر", "نشعر", "تشعرين", "تشعرون", "يشعرون", "تشعري"},
    "حَرَّكَ": {"تحرك", "تحركي", "تحركوا"}, "فَنِيَ": {"فان", "كيفن"}, "وَشَى": {"شي", "شين", "اش", "تشين"},
    "كَوْنِيّ": {"كوني"}, "ظَالِم": {"الظلام", "ظلام"}, "سِيرَة": {"السير", "سير"}, "جَوِّيّ": {"جوي"},
    "عَنِيف": {"العنف"}, "وَفَّقَ": {"وفقا", "وفق"}, "يَسِير": {"يسير"}, "نُخْبَة": {"نخب", "نخبا"},
    "أَرْسَى": {"بيرس", "فارس"}, "دَوَّنَ": {"دونا", "دوني"}, "بَالٍ": {"بال"}, "طُرْفَة": {"طرف", "الطرف", "طرفا"},
    "جَانٍ": {"جان"}, "سَارٍ": {"سار"}, "وَلِيّ": {"بولي"}, "مَعْلُومَة": {"المعلومات", "معلومات"},
    "بَلِيغ": {"ابلغ"}, "شُبْهَة": {"شبه"}, "أَبَاحَ": {"نباح"}, "وُدِّيّ": {"كودي"},
}


# ---- romanisation of a fully vowelled phrase, in Wiktionary's scheme (the phrases deck, Nov 2026) ----
# Wiktionary romanises most entries but not every phrase or proverb; a card must carry one
# (check-arabic.js).  This writes what the vowels say, the way Wiktionary's own module does for the
# entries it covers: the article assimilated to a sun letter (aš-šams) and its alif elided after a vowel
# (fī l-bayt, šāʔa llāhu), the clitics وَ فَ بِ لِ كَ hyphenated (wa-, bi-), ة as -a at a pause and -at
# before a vowel, tanwin as -an/-un/-in, long vowels ā ī ū.  `phrases.py` scores it against every phrase
# Wiktionary does romanise and prints the mismatches; it is used only where Wiktionary has no romanisation.
CONS = {"ء": "ʔ", "أ": "ʔ", "إ": "ʔ", "ؤ": "ʔ", "ئ": "ʔ", "ب": "b", "ت": "t", "ث": "ṯ", "ج": "j", "ح": "ḥ",
        "خ": "ḵ", "د": "d", "ذ": "ḏ", "ر": "r", "ز": "z", "س": "s", "ش": "š", "ص": "ṣ", "ض": "ḍ", "ط": "ṭ",
        "ظ": "ẓ", "ع": "ʕ", "غ": "ḡ", "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n", "ه": "h",
        "و": "w", "ي": "y"}
SUN = set("تثدذرزسشصضطظلن")
FATHA, DAMMA, KASRA, SUKUN, SHADDA = "َ", "ُ", "ِ", "ْ", "ّ"
TANWIN = {"ً": "an", "ٌ": "un", "ٍ": "in"}
DAGGER = "ٰ"
CLITICS = {"وَ": "wa", "فَ": "fa", "بِ": "bi", "لِ": "li", "كَ": "ka"}


def _clusters(w):
    out = []
    for ch in unicodedata.normalize("NFC", w):
        if MARKS.match(ch) and out:
            out[-1][1] += ch
        else:
            out.append([ch, ""])
    return out


def _word(w, after_vowel, D=None):
    """One word.  `after_vowel`: the phrase's previous word ended in a vowel (a wasla alif is elided)."""
    w = w.replace("ٱ", "ا")
    V = {FATHA: "a", DAMMA: "u", KASRA: "i"}
    pre = ""
    if w[:2] in ("وَ", "فَ") and w[2:].startswith("لِل"):
        return CLITICS[w[:2]] + "-" + _word(w[2:], True, D)   # وَلِلشَّوَارِعِ: wa-li-š-šawāriʕi
    if w.startswith("لِل") and fold(w) not in ("لله",) and not fold(w).startswith("للهم"):
        w = "لِا" + w[2:]                         # لِلْحِيطَانِ = li- + al-ḥīṭāni: the article's alif is not written
    # a clitic is hyphenated before the article or a hamza (wa-l-, bi-ʔiḏni), as Wiktionary mostly does
    for c, r in CLITICS.items():
        if w.startswith(c) and len(bare(w)) > 2:
            rest = w[len(c):]
            if rest.startswith(("ال", "أ", "إ", "آ")):
                pre, w, after_vowel = r + "-", rest, True
                break
    # الله: allāh at the head of a phrase, llāh after a vowel (li-llāhi, ʔin šāʔa llāhu)
    b = fold(w)
    if b == "اللهم":
        return pre + ("llāhumma" if after_vowel else "allāhumma")
    if b in ("الله", "لله"):
        end = V.get(_clusters(w)[-1][1][-1:], "") if _clusters(w)[-1][1] else ""
        if b == "لله" and not pre:
            return "li-llāh" + end
        return pre + ("llāh" if after_vowel or b == "لله" else "allāh") + end
    cl = _clusters(w)
    out = []
    i = 0
    # the article: al- at the head of a phrase, l- after a vowel; a sun letter (with its shadda) assimilates it
    if len(cl) > 2 and cl[0][0] == "ا" and cl[1][0] == "ل" and not cl[0][1].strip(SUKUN + FATHA) and not cl[1][1].strip(SUKUN):
        nxt = cl[2][0]
        sun = nxt in SUN and SHADDA in cl[2][1]
        out.append(("" if after_vowel else "a") + (CONS[nxt] if sun else "l") + "-")
        if sun:
            cl[2][1] = cl[2][1].replace(SHADDA, "")
        i = 2
    elif cl and cl[0][0] == "ا":
        # hamzat al-wasl: its vowel is said only at the head of a phrase, and never with a glottal stop
        if not after_vowel:
            out.append(V.get(cl[0][1][:1], "i"))
        i = 1
    while i < len(cl):
        ch, mk = cl[i]
        prev = out[-1] if out else ""
        if ch == "آ":
            out.append("ʔā")
        elif ch in ("ا", "ى"):
            if prev.endswith("an") and not mk:
                pass                                   # the alif that carries tanwin -an
            elif prev.endswith("a"):
                out[-1] = prev[:-1] + "ā"
            elif prev and prev[-1] not in "aiuāīū":
                out[-1] = prev + "ā"                   # a long alif after a letter written without its fatha
            elif mk:
                out.append(V.get(mk[:1], ""))
        elif ch == "ة":
            v = "".join(TANWIN.get(m, "") or V.get(m, "") for m in mk)
            if prev.endswith("ā"):
                out.append("t" + v if v else "h")      # صَلَاة: ṣalātu, ṣalāh at a pause
            elif prev.endswith("a"):
                out.append("t" + v if v else "")
            else:
                out.append("a" + ("t" + v if v else ""))
        elif ch in ("و", "ي") and not mk.strip(SUKUN) and prev[-1:] == {"و": "u", "ي": "i"}[ch]:
            out[-1] = prev[:-1] + {"و": "ū", "ي": "ī"}[ch]
        elif ch in CONS:
            s_ = CONS[ch]
            if ch == "أ" and not mk:
                s_ += "a"
            if ch == "إ" and not mk:
                s_ += "i"
            if SHADDA in mk:
                s_ += s_ if ch not in "أإ" else ""
            for m in mk:
                if m in V:
                    s_ += V[m]
                elif m in TANWIN:
                    s_ += TANWIN[m]
                elif m == DAGGER:
                    s_ += "ā"
            out.append(s_)
        i += 1
    return (pre + "".join(out)).replace("aā", "ā").replace("āā", "ā")


def translit(text, D=None):
    words = [x for x in re.split(r"\s+", re.sub(r"[؟?!،.,]", "", text)) if x]
    out, after = [], False
    for w in words:
        r = _word(w, after, D)
        out.append(r)
        after = r[-1:] in "aiuāīū"
    return " ".join(out)
