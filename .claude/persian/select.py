#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`hindi_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fa import fold
from persian_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    'رو': 'its count is the spoken را (the object marker), which the inventory teaches, not "face"',
    'می': 'its count is the verb prefix می- written apart by the subtitles, not "wine"',
    'ای': 'its count is the ending -ای written apart and the vocative, not a word to teach alone',
    'منو': 'its count is spoken من رو "me (object)", not "menu"',
    'بهت': 'its count is spoken به تو "to you", not "consternation"',
    'موندن': 'the spoken form of ماندن, which the inventory teaches',
    'واسه': 'the spoken form of برای, which the inventory teaches',
    'آختن': 'its count is آخه "but, after all" (spoken), whose forms it shares',
    'می‌گم': 'a form of گفتن, not a lemma',
    'اینا': 'the spoken form of اینها',
    'تر': 'its count is the comparative suffix -تر written apart',
    'دار': 'its count is the suffix -دار written apart',
    'دریدن': 'its count is دری and other shapes it shares, not the verb',
    'بهترین': 'Wiktionary\'s entry is a pointer, not the superlative of خوب, which that card shows',
    'یکم': 'its count is spoken یه کم "a little", not "first"',
    'آش': 'its count is -اش "his, her" written apart, folded with آ',
    'نبود': 'a form of بودن, taught on its card',
    'بلی': 'the formal spelling of بله, which the inventory teaches',
    'اره': 'its count is آره "yeah" written without the madda (the inventory teaches آره), not "saw"',
    'کل': 'two words share the spelling, kal "bald" and kol "whole"; the count cannot say which',
    'همش': 'a spoken form (همه‌اش "all of it"), not a lemma of the written language',
    'یارو': 'slang, and pejorative',
    'ها': 'its count is the plural suffix -ها written apart by the subtitles, not the interjection',
    'کشتن': 'to kill: the subtitles\' crime drama, not a beginner\'s word',
    'لعنت': 'a curse, counted from subtitles',
    'لعنتی': 'damned, counted from subtitles',
    'اوه': 'an exclamation the subtitles count from every scene',
    'آه': 'a sigh, counted from subtitles',
    'هی': 'hey, counted from subtitles',
    # Read off the A2 ranking (2026-11-12).
    'سکس': 'counted from subtitles; not a level word',
    'کون': 'vulgar ("arse"); its count is also spoken کن',
    'منی': 'its count is من + ی ("a me", "that I"), not "semen"',
    'هات': 'its count is -ات "your" written apart, and English "hot"',
    'جک': 'its count is the English name Jack, not "jack, jug"',
    'جین': 'its count is the English name Jean, Gene',
    'مری': 'its count is the English name Mary, not "oesophagus"',
    'لی': 'its count is the English names Lee, Leigh',
    'تی': 'its count is the English letter T and names',
    'مک': 'its count is the English Mac, Mc names',
    'بن': 'its count is the English name Ben',
    'هامون': 'its count is the name Hamun (and English names), not "plain"',
    'فرانک': 'its count is the English name Frank, not "franc"',
    'اس': 'the name of the letter S',
    'اف': 'the name of the letter F',
    'ان': 'the name of the letter N; its count is the ending -ان and آن written without the madda',
    'وی': 'its count is the English letter V and the ending; the pronoun is formal written Persian',
    'واو': 'the letter waw; its count is English "wow"',
    'آی': 'its count is English "I" and "hey" from subtitles',
    'پای': 'its count is پا + ی ("foot of"), not "pie"',
    'پی': 'its count is the English letter P and Pi, not "sinew"',
    'اوکی': 'English "okay" spelt in Persian letters',
    'زیرنویس': 'counted from the subtitle files\' own credits',
    'دنیدن': 'its count is دنی and other shapes it shares (the name Danny), not the verb',
    'یارستن': 'its count is یار and other shapes it shares, not the literary verb',
    'انگیختن': 'its count is انگیز- in compounds, not the literary verb',
    'جستن': 'its count is جست- shared with other words; literary',
    'تنیدن': 'its count is تن "body" in its forms, not "to spin"',
    'ساییدن': 'its count is سای- shared with other words, not "to grind"',
    'پاییدن': 'its count is پای "foot of" in its forms, not "to guard"',
    'قو': 'its count is spoken forms (قول, قوی written short), not "swan"',
    'توش': 'its count is spoken تو + ش "in it", not "strength"',
    'بدست': 'its count is به دست "by hand, to obtain" written as one, not "span"',
    'خبری': 'Wiktionary\'s sense is the grammatical "predicative"; its count is خبر + ی',
    'کارا': 'its count is spoken کارها "the jobs", not "efficient"',
    'لازمه': 'its count is spoken لازم + ه "is needed", not "requisite"',
    'خبره': 'its count is spoken خبر + ه "news is", not "expert"',
    'حالی': 'its count is حال + ی, a form of the A1 word',
    'زیاده': 'its count is spoken زیاد + ه "is a lot"',
    'لو': 'its count is spoken لو رفتن "be exposed", not "lip, hill"',
    'تره': 'its count is -تره "is more …" written apart, not "herb"',
    'بیل': 'its count is the English name Bill, not "shovel"',
    'برش': 'its count is بر + ش "on it", spoken, not "section"',
    'باری': 'its count is بار + ی, a form of the A1 word',
    'آدمی': 'its count is آدم + ی "a person", a form of the A1 word',
    'زمینی': 'its count is زمین + ی, a form of the A1 word',
    'تلف': 'its count is the spoken تلفن clipped and the verb تلف شدن; not a word alone',
    'گنده': 'slang "huge"; the written word is بزرگ',
    'بردار': 'its count is the imperative بردار "take!", not "vector"',
    'رأس': 'its count is "head of" in fixed phrases; the meaning is formal',
    'دریائی': 'the older spelling of دریایی',
    'الآن': 'A1 teaches الان, the spelling the subtitles use',
    'این‌ها': 'the plural of این, which A1 teaches',
    'مارک': 'its count is the English name Mark',
    'بزرگ‌تر': 'the comparative of بزرگ, shown on that A1 card',
    # Read off the B1 ranking (2026-11-12).
    'لرد': 'its count is the name or English word Lord spelt in Persian letters',
    'بانی': 'its count is the name or English word Bonnie, Barney spelt in Persian letters',
    'بابی': 'its count is the name or English word Bobby spelt in Persian letters',
    'جیک': 'its count is the name or English word Jake spelt in Persian letters',
    'دان': 'its count is the name or English word Dan spelt in Persian letters',
    'وین': 'its count is the name or English word Wayne spelt in Persian letters',
    'کری': 'its count is the name or English word Kerry, Carrie spelt in Persian letters',
    'دوک': 'its count is the name or English word Duke spelt in Persian letters',
    'الی': 'its count is the name or English word Ellie spelt in Persian letters',
    'سام': 'its count is the name or English word Sam spelt in Persian letters',
    'ویکی': 'its count is the name or English word Vicky spelt in Persian letters',
    'راب': 'its count is the name or English word Rob spelt in Persian letters',
    'کنت': 'its count is the name or English word Kent spelt in Persian letters',
    'راج': 'its count is the name or English word Raj spelt in Persian letters',
    'سو': 'its count is the name or English word Sue spelt in Persian letters',
    'رام': 'its count is the name or English word Ram spelt in Persian letters',
    'علی': 'its count is the name or English word Ali spelt in Persian letters',
    'کلر': 'its count is the name or English word Claire, colour spelt in Persian letters',
    'بک': 'its count is the name or English word back, Beck spelt in Persian letters',
    'راک': 'its count is the name or English word rock (music) spelt in Persian letters',
    'وال': 'its count is the name or English word Wall spelt in Persian letters',
    'هند': 'its count is the name or English word India (the name) spelt in Persian letters',
    'چین': 'its count is the name or English word China (the name) spelt in Persian letters',
    'گو': 'its count is the name or English word go spelt in Persian letters',
    'لا': 'its count is the name or English word La, the note spelt in Persian letters',
    'بت': 'its count is the name or English word Beth, Bet spelt in Persian letters',
    'لاک': 'its count is the name or English word lock, Locke spelt in Persian letters',
    'ور': 'its count is the verb prefix ور- (ور رفتن) and spoken forms, not "side"',
    'ون': 'its count is the spoken ending -ون (-ان) and English names, not "van"',
    'درو': 'its count is spoken در رو "run away", not "harvest"',
    'لولیدن': 'its count is لول- shared with other words, not "to wriggle"',
    'هشتن': 'its count is هشت "eight" in its forms; the verb is literary',
    'هرزه': 'an insult, as the subtitles use it',
    'خاییدن': 'its count is shared with a vulgar word, not "to chew"',
    'شید': 'its count is spoken forms of شدن (شید "you became"), not "bright"',
    'ال': 'the Arabic article, not a word',
    'زبون': 'the spoken form of زبان',
    'عاشقت': 'a form of عاشق ("in love with you"), not a lemma',
    'نون': 'its count is spoken نان "bread", not the letter',
    'کول': 'its count is English "cool" and spoken کول "back", not "pond"',
    'شبی': 'its count is شب + ی, a form of the A1 word',
    'هو': 'its count is an exclamation, not "pus"',
    'رستن': 'its count is رست- shared with other words; literary',
    'حقه': 'its count is hoqqe "trick", which Wiktionary\'s entry ("casket") does not give',
    'سان': 'its count is English names and the ending, not "kind, manner"',
    'پشتی': 'its count is پشت + ی, a form of the A1 word',
    'شیفتن': 'its count is شیفت (English "shift") and its shapes, not "to fall in love"',
    'رشتن': 'its count is رشت (the city) and its shapes, not "to spin"',
    'نازیدن': 'its count is ناز "sweet" and its shapes, not "to boast"',
    'نیا': 'its count is the imperative نیا "don\'t come", not "ancestor"',
    'سرده': 'its count is spoken سرد + ه "it\'s cold", not "genus"',
    'ارزشی': "its count is ارزش + ی; Wiktionary's sense is a political label",
    'لاس': 'its count is a vulgar sense and English names',
    'چش': 'the spoken form of چشم, which A1 teaches',
    'نشی': 'its count is spoken forms of شدن (نشی "you don\'t become"), not a wind',
    'میون': 'the spoken form of میان, not "muon"',
    'گر': 'its count is the suffix -گر written apart and spoken اگر',
    'نزده': 'its count is نزد + ه "didn\'t hit"; the Dari spelling of نوزده',
    'له': 'its count is spoken له "crushed" and the Arabic phrase',
    'هنگ': 'its count is English "hang" (a frozen computer), not "regiment"',
    'بل': 'its count is English "Bell" and بلکه written short',
    # Read off the B2 ranking (2026-11-12).
    'بوش': 'its count is the name or English word Bush spelt in Persian letters',
    'بنت': 'its count is the name or English word Bennett spelt in Persian letters',
    'کنگ': 'its count is the name or English word Kong spelt in Persian letters',
    'نزار': 'its count is the name or English word Nizar spelt in Persian letters',
    'رازی': 'its count is the name or English word Razi spelt in Persian letters',
    'پتی': 'its count is the name or English word Patty spelt in Persian letters',
    'دبی': 'its count is the name or English word Dubai spelt in Persian letters',
    'بنگ': 'its count is the name or English word bang spelt in Persian letters',
    'کلب': 'its count is the name or English word club spelt in Persian letters',
    'آل': 'its count is the name or English word Al spelt in Persian letters',
    'جبار': 'its count is the name or English word Jabbar spelt in Persian letters',
    'سعید': 'its count is the name or English word Saeed spelt in Persian letters',
    'حسن': 'its count is the name or English word Hassan spelt in Persian letters',
    'کرک': 'its count is the name or English word crack spelt in Persian letters',
    'کید': 'its count is the name or English word kid spelt in Persian letters',
    'کروز': 'its count is the name or English word cruise spelt in Persian letters',
    'کرن': 'its count is the name or English word Karen spelt in Persian letters',
    'لوید': 'its count is the name or English word Lloyd spelt in Persian letters',
    'بریک': 'its count is the name or English word break spelt in Persian letters',
    'ریو': 'its count is the name or English word Rio spelt in Persian letters',
    'پرو': 'its count is the name or English word Peru spelt in Persian letters',
    'گیتا': 'its count is the name or English word Gita spelt in Persian letters',
    'مینا': 'its count is the name or English word Mina spelt in Persian letters',
    'امین': 'its count is the name or English word Amin spelt in Persian letters',
    'رضا': 'its count is the name or English word Reza spelt in Persian letters',
    'کرت': 'its count is the name or English word Kurt spelt in Persian letters',
    'بم': 'its count is the name or English word Bam (the city) spelt in Persian letters',
    'هوی': 'its count is the name or English word hey, Huey spelt in Persian letters',
    'فی': 'its count is the name or English word fee, Fay spelt in Persian letters',
    'کان': 'its count is the name or English word can, Khan spelt in Persian letters',
    'بدر': 'its count is the name or English word Badr spelt in Persian letters',
    'پارس': 'its count is the name or English word Pars, bark spelt in Persian letters',
    'بان': 'its count is the suffix -بان written apart (نگهبان, باغبان)',
    'جر': 'its count is spoken جر دادن "to tear" and جرأت written short, not "cleft"',
    'بلوک': 'its count is "block (of flats)", which Wiktionary\'s entry does not give',
    'رقاص': 'Wiktionary\'s gloss is "erotic dancer"; the neutral word, رقصنده, is on this level',
    'پو': 'its count is spoken forms and English names, not "leg"',
    'همو': 'its count is spoken همون "the same", not the literary "that very one"',
    'الف': 'the name of the letter, taught by the alphabet deck',
    'ویر': 'its count is shapes of other words, not "whim"',
    'خور': 'its count is the suffix -خور written apart (خوردن\'s stem), not "sun"',
    'خوار': 'its count is the suffix -خوار written apart, not "easy, mean"',
    'نری': 'its count is spoken نرو "don\'t go"; Wiktionary\'s second sense is anatomical',
    'شق': 'its count is spoken shapes, not "alternative"',
    'چمیدن': 'its count is چم "way, knack" and its shapes; the verb is literary',
    'ستردن': 'its count is shared shapes; the verb is literary',
    'چسبوندن': 'the spoken form of چسباندن',
    'فهموندن': 'the spoken form of فهماندن',
    'گوزیدن': 'vulgar',
    'توپیدن': 'its count is توپ "ball" in its forms, not the verb',
    'گوجه': 'its count is گوجه for tomato (A2 teaches گوجه\u200cفرنگی), which Wiktionary glosses only "plum"',
    'پریش': "Wiktionary's entry is a stem, defined by a pointer",
    'دادا': 'a spoken word, counted from names and the nursery',
    'آبه': 'its count is spoken آب + ه "it is water", not "mother"',
    'خنگ': 'Wiktionary gives only "horse"; its count is spoken "dim-witted", which it does not give',
    'خو': 'its count is spoken خب and خوب written short, not "temper"',
    'بهر': 'literary; its count is shapes of other words',
    'بلو': 'its count is English "blue" and names, not "whetstone"',
    'پورن': 'not a level word',
    'چل': 'the spoken form of چهل, which A2 teaches',
    'حشری': 'vulgar',
    'اسپرم': 'its count is English "sperm", not the herb',
    'ممه': 'vulgar',
    'جلق': 'vulgar',
    'شاش': 'vulgar',
    'زنگی': 'Wiktionary\'s gloss is a racial term; its count is زنگ + ی "a call"',
    'چپت': 'its count is spoken چپ + ت "your left", not the shoe',
    'تکیدن': 'its count is تک and its shapes, not the verb',
    'آواره': 'Wiktionary\'s entry gives an archaic sense, not "homeless, displaced"',
    'پیشی': 'its count is spoken پیش + ی and the nursery word for cat, not "precedence"',
    'شیطانه': 'its count is spoken شیطان + ه "is a devil", not "she-devil"',
    'هول': 'its count is hol "panic, haste", which Wiktionary\'s entry does not give',
    'عن': 'its count is a vulgar spoken word and the Arabic preposition in fixed phrases',
    'پوتین': 'its count is the name Putin, not "boot"',
    # Read off the C1 ranking (2026-11-12).
    'ایر': 'its count is the name or English word air spelt in Persian letters',
    'موس': 'its count is the name or English word mouse spelt in Persian letters',
    'برک': 'its count is the name or English word Brick spelt in Persian letters',
    'دالی': 'its count is the name or English word Dolly spelt in Persian letters',
    'سوری': 'its count is the name or English word sorry spelt in Persian letters',
    'جید': 'its count is the name or English word Jade spelt in Persian letters',
    'کانا': 'its count is the name or English word Kana spelt in Persian letters',
    'اوان': 'its count is the name or English word Evan spelt in Persian letters',
    'یمن': 'its count is the name or English word Yemen spelt in Persian letters',
    'کروگر': 'its count is the name or English word Kruger spelt in Persian letters',
    'وون': 'its count is the name or English word Von spelt in Persian letters',
    'تم': 'its count is the name or English word Tom, theme spelt in Persian letters',
    'ارن': 'its count is the name or English word Aaron spelt in Persian letters',
    'کریپتون': 'its count is the name or English word Krypton spelt in Persian letters',
    'مام': 'its count is the name or English word Mom spelt in Persian letters',
    'اراک': 'its count is the name or English word Arak (the city) spelt in Persian letters',
    'دال': 'its count is the name or English word Dahl spelt in Persian letters',
    'مارکی': 'its count is the name or English word Marky spelt in Persian letters',
    'ماک': 'its count is the name or English word Mac spelt in Persian letters',
    'نانی': 'its count is the name or English word Nanny spelt in Persian letters',
    'مسی': 'its count is the name or English word Messi spelt in Persian letters',
    'مورا': 'its count is the name or English word Moira spelt in Persian letters',
    'ساری': 'its count is the name or English word Sari, sorry spelt in Persian letters',
    'لیان': 'its count is the name or English word Liam, Leon spelt in Persian letters',
    'پدرام': 'its count is the name or English word Pedram spelt in Persian letters',
    'راد': 'its count is the name or English word Rod spelt in Persian letters',
    'پیس': 'its count is the name or English word piece, peace spelt in Persian letters',
    'بیر': 'its count is the name or English word beer spelt in Persian letters',
    'کلون': 'its count is the name or English word clone spelt in Persian letters',
    'ثور': 'its count is the name or English word Thor spelt in Persian letters',
    'نازی': 'its count is the name or English word Nazi spelt in Persian letters',
    'دوریان': 'its count is the name or English word Dorian spelt in Persian letters',
    'تیان': 'its count is the name or English word Tian spelt in Persian letters',
    'انتر': 'its count is the name or English word Enter spelt in Persian letters',
    'مجتبی': 'its count is the name or English word Mojtaba spelt in Persian letters',
    'پینکی': 'its count is the name or English word Pinky spelt in Persian letters',
    'نورد': 'its count is the name or English word Nord spelt in Persian letters',
    'قر': 'slang',
    'میو': 'an animal sound',
    'جیش': 'nursery word; its count is also the Arabic "army"',
    'گرون': 'the spoken form of گران',
    'اور': 'its count is the prefix ور- and English "over", not "fist"',
    'ابن': 'part of Arabic names',
    'ابو': 'part of Arabic names',
    'سین': 'the name of a letter, and English "scene"',
    'غل': 'its count is spoken غلط and shapes of other words',
    'زناشویی': 'Wiktionary\'s first gloss is not the everyday "marriage, married life"',
    'منجی': 'Wiktionary\'s entry is the Munji language; its count is monji "saviour", which it does not give',
    'تلو': 'its count is the spoken تلوتلو "staggering"',
    'خطایی': 'its count is خطا + ی "a mistake", not "Cathayan"',
    'کمون': 'the spoken form of کمان',
    'دله': 'its count is spoken دل + ه "the heart is", not "stray"',
    'منوی': 'its count is spoken من + و and English "menu", not "intended"',
    'فاک': 'vulgar',
    'نیان': 'its count is spoken forms of آمدن (نیان "they don\'t come")',
    'اولیا': 'Wiktionary defines it by a pointer (the hamza-less form of اولیاء)',
    'پور': 'its count is the suffix -پور in surnames',
    'کمک\u200cهای': 'a form (کمک\u200cها + ezafe), not a lemma',
    'یوم': 'Arabic, in fixed phrases only',
    'تیلا': 'its count is names and shapes of other words',
    'کپ': 'its count is slang and English "cap"',
    'خودارضایی': 'not a level word',
    'پورنو': 'not a level word',
    'مالوندن': 'the spoken form of مالیدن',
    'شاشیدن': 'vulgar',
    'کتبی': 'Wiktionary gives only "bookseller"; its count is "written", which it does not give',
    'شونم': 'the Dari spelling of شبنم',
    'چس': 'vulgar',
    'خوروندن': 'the spoken form of خوراندن',
    'هستن': 'its count is spoken هستن "they are", a form of بودن',
    'مسلمون': 'the spoken form of مسلمان',
    'شروانی': 'a regional name',
    'هش': 'its count is shapes of other words, not "a slurp"',
    'خی': 'a Greek letter',
    'پش': 'the dialect form of شپش',
    'دویی': 'its count is spoken forms of دو and دویدن',
    'کژ': 'its count is spoken shapes, not "a silk"',
    'درا': 'its count is spoken در + ا and names, not "bell"',
    'خیری': 'its count is خیر + ی, not "wallflower"',
    'علاف': 'Wiktionary gives only the archaic "fodder-seller"',
    'مرید': 'Wiktionary\'s gloss is not the everyday "disciple"',
    'جانه': 'its count is spoken جان + ه, not "vital spirit"',
    'کوس': 'its count is a vulgar word spelt alike, not the drum',
    'لاخ': 'its count is spoken shapes, not "lock of hair"',
    'وایستادن': 'the spoken form of ایستادن, defined by a pointer',
    'مؤثری': 'a form of مؤثر (B2), defined by a pointer',
    'زاوش': 'its count is shapes of other words; the word is literary',
    'بابو': 'a spoken nursery word',
    'جوشوندن': 'the spoken form of جوشاندن',
    'لواط': 'a legal and insulting term, not a level word',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'کثافت', 'احمق', 'حرومزاده', 'حرامزاده', 'عوضی', 'لعنتی', 'گه', 'کس', 'کیر', 'جنده',
          'خفه'}


def usable(L):
    gl = [g for e in L['entries'] for g in e['glosses']]
    return any(not g['weak'] for g in gl)


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            item = item.replace('\u200c', '\u200c')
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = fold(w)
            if k in seen or k in below:
                continue
            L = lex.get(k)
            via = ''
            if L and 'alt_of' in L:
                # the common spelling of a word Wiktionary files under another (a spelling Wiktionary files under another):
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
        if len(k) < 2:
            continue
        # a MULTI-WORD lemma (کار کردن, دوست داشتن) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 1:
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
