#!/usr/bin/env python3
"""Stage 2 for the phrases deck: Bengali set phrases, idioms and proverbs.

    python3 .claude/bengali/run.py --level phr     # runs this in place of select.py

Not a CEFR level: an expression is a unit a list of words cannot see, which is why the level decks
teach so few of them.  Three subdecks, as the Turkish and Indonesian phrases decks have:

  Phrases   greetings and wishes (শুভ সকাল, ঈদ মোবারক, শুভ বিজয়া), the phrasebook formulas a
            learner needs whole (আপনি কেমন আছেন, আমি বুঝি না, আমার সাহায্য লাগবে), and the set
            everyday expressions Wiktionary files as phrases or multi-word lemmas (কিছু না, বার বার,
            দেখতে পাওয়া);
  Idioms    an expression whose meaning is not its words' (ঘোড়ার ডিম "nothing", চোখের বালি "an
            eyesore", মীর জাফর "a traitor");
  Proverbs  a complete saying, Wiktionary's part of speech `proverb`.

THE LIST IS CHOSEN BY HAND from every multi-word, phrase and proverb entry of English Wiktionary's
Bengali that no level deck teaches (361 on 2026-11-12), because most of those entries are compound
NOUNS -- bird and fish names, "laptop computer", "black hole" -- which are vocabulary, not expressions.
What else was left out, and why, is `LEFT_OUT` below.  Both standards: the Muslim and the Hindu
greetings and wishes are both taught, as the levels teach জল and পানি.

NOTHING A LEVEL DECK TEACHES IS REPEATED (`bengali_level.words_below`; BELOW['phr'] is every band).

THE ORDER within a subdeck is the subtitle frequency `extract.py` gives a multi-word lemma (its rarest
word's count, an estimate), then spelling: the commonest expressions come first.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bn import fold
from bengali_level import LEVEL, f, words_below

SUBS = [
    ('Phrases', [
        # greetings and wishes, both standards
        'শুভ সকাল', 'শুভ সন্ধ্যা', 'শুভ রাত্রি', 'শুভ জন্মদিন', 'শুভ নববর্ষ', 'শুভ বিজয়া',
        'ঈদ মোবারক', 'আসসালামু আলাইকুম', 'খোদা হাফেজ', 'খোশ আমদেদ',
        # the phrasebook formulas
        'আপনার নাম কি', 'তোমার নাম কি', 'আপনি কেমন আছেন', 'তুমি কেমন আছো', 'তুই কেমন আছিস',
        'আমি জানি না', 'আমি বুঝি না', 'আমি জানতে চাই', 'আমার প্রশ্ন আছে', 'আমার সাহায্য লাগবে',
        'আমার ডাক্তার লাগবে', 'আমি ইংরেজি বলতে পারি না', 'আমি তোমাকে ভালবাসি',
        'আমার তোমাকে মনে পড়ছে', 'যে আজ্ঞা', 'জো হুকুম', 'আপনার হুকুম শিরোধার্য',
        # exclamations and national slogans, both countries'
        'বাঃ বাঃ', 'হায় আল্লাহ', 'হায় ভগবান', 'জ্বী না', 'জয় বাংলা', 'জয় হিন্দ',
        # set everyday expressions
        'কিছু না', 'কিছু কিছু', 'কিছু না কিছু', 'কিছুতেই না', 'কেউ না', 'কোথাও না', 'সব জায়গা',
        'বার বার', 'কখনো সখনো', 'এর পর', 'গত পরশু', 'আপনা আপনি', 'কাছ থেকে', 'ভিতর দিয়ে',
        'ডান দিকে', 'বাঁ দিকে', 'দেখতে পাওয়া', 'ইচ্ছা হওয়া', 'বৃষ্টি পড়া', 'গন্ধ পাওয়া',
        'হাত ধরা', 'সাঁতার কাটা', 'ভিজে যাওয়া', 'রোজা রাখা', 'অঙ্ক কষা',
    ]),
    ('Idioms', [
        'মাথা থেকে পা পর্যন্ত', 'ঘোড়ার ডিম', 'চোখের বালি', 'না ফেরার দেশ', 'দয়ার সাগর',
        'কালো টাকা', 'কালো বাজার', 'কালো পতাকা', 'মগজ ধোলাই', 'অ আ ক খ', 'হাত জোড়',
        'অকর্মার শেষ', 'অকর্মার ধাড়ি', 'অকাজের কাজি', 'আকাশ পাতাল পার্থক্য', 'আসমান জমিন ফারাক',
        'এক ঢিলে দুই পাখি মারা', 'পয়সা উসুল', 'অক্কা পাওয়া', 'কাছা আলগা', 'অকালে কি না খায়',
        'অকস্মাৎ বজ্রাঘাত', 'অগ্নিশর্মা হয়ে ওঠা', 'নিজের ঢাক নিজে পিটানো', 'মীর জাফর',
        'জিলাপির প্যাঁচ', 'অকূল পাথার', 'অকূলে কূল পাওয়া', 'অকূলের ভেলা', 'অগতির গতি',
        'অঙ্কুরে বিনাশ করা', 'চোখ বোজা', 'উলুবনে মুক্তা ছড়ানো', 'খয়ের খাঁ', 'উজিরে খামাখা',
        'ভুজুং ভাজুং', 'অক্ষরে অক্ষরে', 'অক্ষরে অক্ষরে পালন করা', 'অক্ষয় ভাণ্ডার',
    ]),
    ('Proverbs', [
        'আয় বুঝে ব্যয় করা', 'নাচতে না জানলে উঠান বাঁকা', 'নিজের চরকায় তেল দাও', 'দিল্লি বহুদূর',
        'অকারণে কিছুই ঘটে না', 'যত গর্জে তত বর্ষে না', 'দুর্ভাগ্য অনেক স্থলে সৌভাগ্যের কারণ হয়',
        'ঘর পোড়া গরু সিঁদুরে মেঘ দেখে ডরায়', 'ইটটি মারলে পাটকেলটি খেতে হয়', 'দিল্লিকা লাড্ডু',
        'জহুরি জহর চেনে', 'ঝিকে মেরে বউকে শেখানো', 'কালীঘাটের মানুষ কালীদর্শন করে না',
    ]),
]

# What the 361 candidates held that is NOT taught, by kind, each with its reason.
LEFT_OUT = {
    'compound nouns': 'vocabulary, not expressions: bird, fish and plant names, "laptop computer", '
                      '"black hole", "sweet potato", "national anthem"',
    'second spellings': 'জানি না beside আমি জানি না, তার পর / এর পরে / এর বাদ beside এর পর, '
                        'নাচতে না জানলে উঠোন বাঁকা, ঈদ মুবারক and the other ঈদ spellings, যো হুকুম',
    'personal sentences': '"I\'m a Muslim / Hindu / Christian", "are you religious?", "I hate you", '
                          '"I am Indian / Bangladeshi": a learner builds these, and some are not '
                          'the deck\'s to suggest',
    'partisan slogans and news memes': 'জয় শ্রী রাম, লাভ জিহাদ, তৌহিদী জনতা, লাইলাতুল ইলেকশন, '
                                       'আওয়ামী লীগের ফাইনাল কল, মব প্রকাশের স্বাধীনতা',
    'religious formulas in Arabic': 'আল্লাহু আকবার, জাজাকাল্লাহু খাইরান, ওঁ নমঃ শিবায়: formulas of a '
                                    'faith rather than Bengali phrases (the everyday greetings stay)',
    'sadhu and dialect': 'বলিতে কি (sadhu), খোশবিয়ান, বত্ব',
    'smut, curses and a demeaning saying': 'হাত মারা, মাল ফেলা, ধুর বাল, কুত্তার বাচ্চা, ওতফ, the '
                                           'pornography and ejaculation entries, অবলার মুখই বল '
                                           '("none can control a woman\'s tongue")',
}


def own_roman(L):
    return (L or {}).get('roman') or next((e.get('roman') for e in (L or {}).get('entries', [])
                                           if e.get('roman')), '')


def composed_roman(w, lex):
    """A ROMANISATION BUILT FROM THE PARTS', where Wiktionary gives the expression none (বার বার:
    bar bar) -- a concatenation of each word's own, never a guess (`build_deck.SUFFIX_ROMAN` is the
    same rule).  Empty when any part has none: that expression is dropped, not romanised by hand
    (আসসালামু আলাইকুম, খয়ের খাঁ, দুর্ভাগ্য অনেক স্থলে সৌভাগ্যের কারণ হয় on 2026-11-12)."""
    parts = [own_roman(lex.get(fold(p))) for p in w.split()]
    return ' '.join(parts) if all(parts) else ''


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    rows, missing, dup, noroman = [], [], [], []
    seen = set()
    for sub, words in SUBS:
        part = []
        for w in words:
            k = fold(w)
            if k in seen:
                dup.append(w)
                continue
            L = lex.get(k)
            if not L or 'entries' not in L:
                missing.append(w)
                continue
            if k in below:
                dup.append(w + ' (taught by a level)')
                continue
            roman = ''
            if not own_roman(L):
                roman = composed_roman(w, lex)
                if not roman:
                    noroman.append(w)
                    continue
            seen.add(k)
            part.append({'key': k, 'via': '', 'word': w if fold(w) == fold(L['word']) else L['word'],
                         'roman': roman, 'freq': L['freq'], 'pos': '', 'source': 'phrases',
                         'topic': sub, 'sub': sub})
        part.sort(key=lambda r: (-r['freq'], r['key']))
        rows += part
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    counts = {s: sum(1 for r in rows if r['sub'] == s) for s, _ in SUBS}
    print(f'  {len(rows)} expressions: ' + ', '.join(f'{n} {s.lower()}' for s, n in counts.items()))
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' | '.join(missing))
    if dup:
        print('  SKIPPED (twice, or taught):', ' | '.join(dup))
    if noroman:
        print('  NO ROMANISATION, NOT EVEN FROM THE PARTS (dropped):', ' | '.join(noroman))


if __name__ == '__main__':
    assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'
    main()
