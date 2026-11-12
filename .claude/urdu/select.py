#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`urdu_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ur import fold
from urdu_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    'ہے': 'its count is ہونا "to be" (ہے "is"); Wiktionary files the spelling only as a vocative particle',
    'ہیں': 'its count is ہونا "to be" (ہیں "are"); Wiktionary files the spelling only as an interjection',
    'گے': 'its count is the future ending -گے; the entry is the English loan "gay"',
    'پھرنا': 'its count is پھر "again, then", which Wiktionary has no Urdu entry for',
    'اسی': 'its count is اسی "this very", the emphatic of اس; the entry is the number eighty',
    'بے': 'a prefix (un-, -less), and the name of a letter',
    'سا': 'its count is a dozen shapes of the suffix -سا; taught as a word it misleads (as in Hindi)',
    'پہ': 'a synonym of پر, which the inventory teaches',
    'پتا': 'its count is پتا "knowledge, clue", the other spelling of پتہ, which the fill takes',
    'دار': 'its count is the suffix -دار (-holder); the entries are rare nouns',
    'افراد': 'a plural (of فرد, "individual"), glossed by Wiktionary as "kinds"',
    'چکنا': 'its count is the auxiliary چکا "already done", a construction taught after A1',
    'علی': 'its count is the name Ali; the entry is an Arabic preposition used only in set phrases',
    'خان': 'its count is a surname',
    'حسین': 'its count is the name Husain',
    'شیخ': 'its count is a surname and a title; the entry opens on "stingy"',
    'نوازنا': 'its count is the name Nawaz',
    'شریف': 'its count is a surname',
    'پوشیدہ': "counted from the subtitle files' own boilerplate: 251st there, 4,365th in written Urdu",
    # read off the A2 ranking (2026-11-12)
    'روپے': 'a form of روپیہ (A1), with no English of its own',
    'انتخابات': 'a plural (of انتخاب "election", which the fill takes), defined by pointing',
    'چھہ': 'another spelling of چھ "six" (A1)',
    'ہیک': 'its count is the English "hack"; the entry is "hiccup"',
    'بین': 'its count is بین "inter-" (بین الاقوامی); the entry is "word, speech"',
    'سنا': 'its count is سنا "heard", a form of سننا (A1); the entry is an adverb "always"',
    'سپر': 'its count is the English "super"; the entry is "shield"',
    'بندی': 'its count is the suffix -بندی (-ban, -making); the entry is "prisoner"',
    'او': 'its count is the vocative "O" and a dialect pronoun',
    'ملی': 'its count is ملی "met" (a form of ملنا, A1) and "national"; the entry is "jasmine"',
    'موتر': 'its count is the English "motor"; the entry is "urine"',
    'انکنا': 'its count is انکا "their" (ان کا, A1)',
    'بیگ': 'its count is the English "bag"; the entries are "bey" and "speed"',
    'سکا': 'its count is سکا "could", a form of سکنا (A1); the entry is "Scythian"',
    'من': 'its count is من "mind" and the Persian "I"; the entry is the maund',
    'بل': 'its count is the English "bill" and بل "twist"; the entry is "power"',
    'بازی': 'its count is the suffix -بازی; the entry is "bet"',
    'پور': 'its count is the place-name suffix -پور',
    'بیت': 'its count is بیت "passed" (بیتنا) and names (بیت المقدس); the entry is "couplet"',
    'گاہ': 'its count is the suffix -گاہ (place)',
    'پا': 'its count is پا "get", a form of پانا',
    'گزر': 'its count is گزر "passage" (گزرنا); the only entry is "carrot"',
    'ماہ': 'its count is ماہ "month"; the only entry is "moon"',
    'نہاد': 'its count is نام نہاد "so-called", a set phrase',
    'لا': 'an Arabic negative used only in set phrases',
    'ابن': 'its count is the "ibn" of names',
    'سید': 'its count is the name and title Syed',
    'سنگھ': 'its count is the name Singh',
    'دہلی': 'its count is Delhi; the entry is "threshold"',
    'حافظ': 'its count is خدا حافظ (A1) and the name Hafiz',
    'عطا': 'its count is the name Ata',
    'شاہد': 'its count is the name Shahid',
    'رضا': 'its count is the name Raza',
    'کریم': 'its count is the name Karim and the English "cream"',
    'مریم': 'its count is the name Maryam',
    'جاوید': 'its count is the name Javed',
    'خواجہ': 'its count is an honorific of names',
    'حدود': 'the plural of حد "limit", which the fill takes',
    # read off the B1 ranking (2026-11-12)
    'نگار': 'name',
    'ناصر': 'name',
    'اختر': 'name',
    'اسد': 'name',
    'ظفر': 'name',
    'احسن': 'name',
    'ریاض': 'name and Riyadh',
    'قمر': 'name',
    'آفریدی': 'surname',
    'امتیاز': 'name; the entry is "a surname"',
    'عابد': 'name',
    'رحیم': 'name',
    'طیب': 'name',
    'نوید': 'name',
    'شمس': 'name',
    'فراز': 'name',
    'نصرت': 'name',
    'نجم': 'name',
    'اصغر': 'name',
    'آدم': 'name',
    'جناح': 'Jinnah; the entry is "wing"',
    'گاندھی': 'Gandhi; the entry is "perfumer"',
    'مصر': 'Egypt; the entry is "a city"',
    'بدر': 'name and the battle; the entry is "outside"',
    'ناتھ': 'name suffix',
    'باز': 'the suffix -باز and باز آنا; the entry is "open"',
    'ساز': 'the suffix -ساز',
    'کشی': 'the suffix -کشی (خودکشی); the entry is "decay"',
    'گڑھ': 'place-name suffix',
    'باد': 'the suffix -آباد; the entry is "wind"',
    'گیر': 'the suffix -گیر',
    'پذیر': 'the suffix -پذیر',
    'یک': 'a prefix (یک طرفہ)',
    'صد': 'part of فیصد and صدر; the entry is an archaic "hundred"',
    'دہ': 'part of compounds; the entry is "village"',
    'وا': 'part of واپس and others; the entry is "open"',
    'کور': 'its count is "core", "cover"; the entry is "blind"',
    'منی': 'its count is "money", "mini"; the entry is "semen"',
    'گنا': 'its count is گنا "-fold" and گننا; the entry is "sugar cane"',
    'کرا': 'a form of کرنا',
    'گن': 'its count is "gun"',
    'لیپنا': 'its count is لیپ ٹاپ "laptop"',
    'گدا': 'its count is گدا "beggar"; the entry is anatomical',
    'تیج': 'its count is not the festival',
    'کھیلا': 'a form of کھیلنا',
    'ہل': 'its count is ہلنا "to move" and "hill"; the entry is "plough"',
    'کلو': 'its count is "kilo"; the entry is a slur',
    'بالی': 'its count is Bali and والی',
    'پانہ': 'its count is پانا',
    'منڈا': 'its count is the Punjabi "boy"',
    'عین': 'its count is عین "exactly"',
    'بلے': 'its count is بلا "bat" and بھلے',
    'بنتی': 'its count is بنتی "becomes" (بننا)',
    'سوری': 'its count is "sorry"; the entry is "Syrian"',
    'ڈیرہ': 'its count is the place Dera',
    'بیکر': 'its count is the name Baker',
    'اما': 'its count is اماں and امام; the entry is "but"',
    'اخبارات': 'the plural of اخبار (A2)',
    'کوٹ': 'its count is "coat" and place names',
    'ٹیکا': 'its count is ٹیکہ "vaccine"; the entry is the tilak',
    'وچ': 'Punjabi "in"; the entry is "sun parrot"',
    'خاقان': 'a historical title',
    'پول': 'its count is "poll", "pole"',
    'منا': 'its count is منع and مانا',
    'فیلہ': 'a chess piece; its count is elsewhere',
    'جوں': 'its count is جوں ہی "as soon as"; the entry is "louse"',
    'قمیض': 'another spelling of قمیص (A2)',
    'پٹ': 'a sound-word',
    'تارکین': 'a plural (تارکین وطن "emigrants")',
    'معبد': 'no romanisation and no English in the source',
    'سوموار': 'another word for پیر "Monday" (A1), defined by pointing',
    'نیم': 'its count is نیم "half, semi-"; the entries are "rule" and the neem',
    'بیل': 'its count is بیل "ox" and "bell"; the only entry is "creeper"',
    'بچی': 'its count is بچی "little girl"; the only entry is "girlfriend"',
    'تذکرہ': 'means "mention"; the only entry says "substantial"',
    'پٹھان': 'an ethnic name whose first gloss is "militant; quarrelsome"',
    'دھانا': 'its count is دھیان and دھان; the entry is "to attack"',
    'پیج': 'its count is the English "page"',
    'چاپ': 'its count is چھاپ and "chapter"; the entry is "bow"',
    'بیر': 'its count is "beer"; the entry is "hero"',
    'رعایا': 'a plural (of رعیت), defined by pointing',
    'کیش': 'its count is the English "cash"',
    'گرڈ': 'its count is the English "grid"; the entry is "eagle"',
    'ہیر': 'its count is the heroine Heer and "hair"',
    'مکا': 'its count is مکہ "Mecca" and مکا "punch"; the entry is "maize"',
    'نوشی': 'the suffix -نوشی (drinking: شراب نوشی)',
    # read off the B2 ranking (2026-11-12)
    'سکندر': 'its count is a name',
    'روی': 'its count is a name',
    'زین': 'its count is a name',
    'وید': 'its count is a name',
    'چندر': 'its count is a name',
    'اشفاق': 'its count is a name',
    'رانجھا': 'its count is a name',
    'کبیر': 'its count is a name',
    'نجیب': 'its count is a name',
    'سلمی': 'its count is a name',
    'بانو': 'its count is a name',
    'جواد': 'its count is a name',
    'کاشف': 'its count is a name',
    'کوثر': 'its count is a name',
    'پرکاش': 'its count is a name',
    'ہمایوں': 'its count is a name',
    'آنند': 'its count is a name',
    'پال': 'its count is a name',
    'لیلی': 'its count is a name',
    'طلعت': 'its count is a name',
    'لکشمی': 'its count is a name',
    'اشوک': 'its count is a name',
    'لقمان': 'its count is a name',
    'ثریا': 'its count is a name',
    'رستم': 'its count is a name',
    'ابراہام': 'its count is a name',
    'گیتا': 'its count is a name',
    'شبانہ': 'its count is a name',
    'رمزی': 'its count is a name',
    'سندر': 'its count is a name',
    'آشا': 'its count is a name',
    'شہلا': 'its count is a name',
    'اجیت': 'its count is a name',
    'بہرام': 'its count is a name',
    'زار': 'its count is the suffix -زار',
    'نوش': 'its count is the suffix -نوش',
    'ماندہ': 'its count is the suffix -ماندہ',
    'نویس': 'its count is the suffix -نویس',
    'زن': 'its count is the suffix -زن',
    'بہ': 'its count is the suffix -بہ',
    'برما': 'its count is Burma; the entry is "drill"',
    'بوم': 'its count is "boom" and بوم "owl"',
    'چھکا': 'its glosses include a slur',
    'کارن': 'its count is "corn", "Karen"',
    'لالہ': 'its count is the honorific Lala',
    'مخدوم': 'its count is a title of names',
    'ویر': 'its count is a name part',
    'دری': 'its count is Dari and the rug; the entry is "a big star"',
    'کری': 'its count is "curry"; the entry is "elephant"',
    'چرس': 'no romanisation; its count is the drug, the entry a waterskin',
    'مانو': 'its count is مانو "as if"',
    'تری': 'its count is تری "your" and "wet"; the entry is "three"',
    'جگ': 'its count is جگ "world"; the entry is "jug"',
    'کنور': 'a title of names',
    'اورنگ': 'its count is Aurangzeb',
    'مے': 'no romanisation in the source',
    'چپٹی': 'its count is چپٹی "flat"; the entry is "palm"',
    'فیل': 'its count is "fail"',
    'پاؤ': 'its count is پاؤں and pao bread',
    'پلی': 'its count is پلی "grew up" (پلنا)',
    'باسی': 'its count is باسی "stale"; the entry is "inhabitant"',
    'اولی': 'its count is not the entry',
    'ثم': 'an Arabic adverb of set phrases',
    'سمن': 'its count is "summon"',
    'مول': 'its count is مول لینا and names',
    'یاسمین': 'defined by pointing (a synonym of چنبیلی), and a name',
    'لیکھنی': 'a rare Hindi spelling',
    'تول': 'its count is تولنا',
    'بھون': 'its count is بھوننا and Bhavan',
    'نیر': 'its count is a name',
    'اسود': 'Arabic, in set phrases (حجر اسود)',
    'پتر': 'its count is Punjabi "son"',
    'چوں': 'its count is چوں کہ "since"',
    'ہون': 'its count is ہون "be" (ہونا)',
    'امیتابھ': 'defined by pointing; a name',
    'تماشہ': 'another spelling of تماشا, which the fill takes',
    'ادار': 'its count is ادارہ',
    'ٹک': 'its count is ٹک "a little"',
    'آگرہ': 'its count is Agra',
    'پت': 'its count is not the entry',
    'مقدسہ': 'a form of مقدس (B1)',
    'زبر': 'its count is the vowel mark zabar',
    'دھرمی': 'its count is a suffix (-دھرمی)',
    'مینو': 'its count is the English "menu"',
    'اوم': 'its count is not the syllable',
    'گنی': 'its count is گنی "counted" (گننا)',
    'انت': 'its count is not the entry',
    'اکا': 'its count is not the entry',
    'اتم': 'its count is not the entry',
    'قلع': 'used only in قلع قمع',
    'سہن': 'its count is not the entry',
    'بقرہ': "a surah's name",
    'ستیہ': 'its count is a name',
    'کج': 'its count is not the entry',
    'آزاری': 'its count is the suffix -آزاری',
    'انگ': 'its count is انگریزی',
    'کوفی': 'its count is Kufic',
    'ارشادات': 'a plural of ارشاد (B1)',
    'گور': 'its count is گورا (B1)',
    'ید': 'Arabic, in set phrases',
    'رائس': 'its count is the English "rice"',
    'پون': 'its count is پونے',
    'چولھا': 'another spelling of چولہا (B1)',
    'کلا': 'its count is کلا کار and کلاس',
    'تلا': 'its count is تلا "weighed"',
    'وتر': 'its count is not the entry',
    'وسنت': 'its count is a name',
    'نرد': 'its count is not the entry',
    'پیل': 'another spelling of فیل',
    'چغد': 'an insult',
    'چکمہ': 'its count is چکمہ "trick"; the entry is "boot"',
    'ڈکی': 'its glosses include "ass"',
    'گنگنا': 'its count is گنگنانا',
    'ارادیت': 'a philosophical term counted elsewhere',
    'ارتھ': 'its count is "earth"',
    'اسقاط': 'used in اسقاط حمل; counted elsewhere',
    'تھل': 'its count is the region Thal',
    'دیپ': 'its count is the English "deep"',
    'مانس': 'its count is "month" in Punjabi and names',
    'کوی': 'its count is کوئی "any"',
    'نسخ': 'a script name and a rare noun',
    'کھاتا': 'its count is کھاتا "eats" (کھانا)',
    'سگ': 'its count is not the entry',
    'چندا': 'its count is چندہ "donation"; the entry is "moon"',
    'چھائی': 'its count is چھائی "spread over" (چھانا)',
    'کھنڈ': 'its count is a place-name part',
    'گھن': 'its count is not the entry',
    'اگنی': 'its count is names',
    'کلیہ': 'its count is کلیہ "faculty"',
    'امرت': 'its count is a name',
    'مچھ': 'its count is مچھلی',
    'کھر': 'its count is not the entry',
    'کھرنا': 'its count is کھرا',
    'چول': 'its count is not the entry',
    'اموال': 'a plural of مال, defined by pointing',
    'حبشی': 'its gloss is a slur',
    'رون': 'its count is not the entry',
    'برت': 'its count is not the entry',
    'اتا': 'its count is not the entry',
    'برش': 'its count is the English "brush"',
    'عظم': 'its count is عظیم',
    'گاو': 'its count is گاؤں (A1)',
    'ربوہ': 'its count is the town Rabwah',
    'لنگ': 'its count is لنگر and names',
    'لٹ': 'its count is لوٹ',
    'ادی': 'its count is not the entry',
    'سوریہ': 'its count is Syria',
    'مٹھ': 'its count is مٹھی',
    'اشارات': 'a plural of اشارہ (A2)',
    'بعث': 'its count is the Baath party',
    'خمسہ': 'its count is not the entry',
    'نن': 'its count is not the entry',
    'عیار': 'its count is not the entry',
    'سامی': 'its count is not the entry',
    'مکھ': 'its count is مکھی and names',
    'دیول': 'its count is not the entry',
    'پرکھ': 'its count is پرکھنا',
    'حول': 'its count is not the entry',
    'ابھرتا': 'a form of ابھرنا',
    'زنگی': 'its gloss is a slur',
    'ساہتیہ': "its gloss misses the word's meaning (literature)",
    'حلم': 'its count is not the entry',
    'آمدہ': 'a participle of compounds (درآمدہ)',
    'بید': 'its count is بید "cane" and "Vedas"',
    'بابی': 'its count is not the religion',
    'رجل': 'Arabic, in set phrases',
    'گھوش': 'its count is a name',
    'حالا': 'its count is حالانکہ (B1)',
    'لجنہ': "a society's name",
    'طوبی': 'its count is a name',
    'چاق': 'used in چاق و چوبند',
    'گرنتھ': 'its count is the Granth Sahib; the entry is "a workbook"',
    'امل': 'its count is عمل',
    'کوکب': 'its count is a name',
    'ابصار': 'Arabic, in set phrases',
    'روان': 'another spelling of رواں (B1)',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'سالا', 'کمینہ', 'حرامی', 'کتیا', 'حرامزادہ', 'کمبخت', 'سالی', 'بیوقوف', 'الو', 'بکواس', 'گدھے'}


def usable(L):
    gl = [g for e in L['entries'] for g in e['glosses']]
    return any(not g['weak'] for g in gl)


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = fold(w)
            if k in seen or k in below:
                continue
            L = lex.get(k)
            via = ''
            if L and 'alt_of' in L:
                # the common spelling of a word Wiktionary files under another:
                # the card prints the spelling written here and the target's meanings
                via = L['alt_of']
                tgt = lex.get(via)
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            rows.append({'key': k, 'via': via, 'word': L['word'], 'freq': L['freq'], 'pos': pos or '',
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: -kv[1]['freq']):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if 'entries' not in L or L.get('formonly'):
            continue
        if k in seen or k in below or k in swears or k in excl:
            continue
        if len(k) < 2 and k not in ('و',):
            continue
        # a MULTI-WORD lemma (بات کرنا, کے بارے میں) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 0.5:
            continue
        # a lemma whose ONLY entries are phrases or proverbs belongs to the phrases deck
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        seen.add(k)
        fill.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
