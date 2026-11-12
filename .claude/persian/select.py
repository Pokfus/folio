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
