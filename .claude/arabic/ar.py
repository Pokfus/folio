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
