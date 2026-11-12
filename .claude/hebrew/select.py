#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`) and the POINTED word it teaches
(`choose.choose`), so two words of one spelling can be two cards.

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`hebrew_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, Biblical ...) -- the
    subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma (the prefix words ו ה ב כ ל מ ש);
  · a lemma of several words, which is the inventory's to choose;
  · the hand list `EXCLUDE`, each line with its reason, and swearing.
"""
import json, os, sys, unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from he import fold
from hebrew_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY
from choose import choose, usable, PICK


def pick_pos(L):
    """The part of speech a hand pick names (`PICK`), which the card then opens on."""
    return PICK.get(L['word'], '').partition(':')[2]

# Read off the A1 ranking (2026-11-12).  Each with its reason.
EXCLUDE = {
    'יא': 'a vocative particle used before slurs; its count is the subtitles\' Arabic "ya"',
    'אד': 'its count is the English name Ed, not "vapour"',
    'שש': 'Wiktionary has no number "six" under this spelling, only "linen" and "rejoice"',
    'שאת': 'its count is ש + את ("that you"), not "tumour"',
    'הכיל': 'its count is הכל "everything", which it shares, not "to contain"',
    'ביית': 'its count is לבית "to the house", which it shares, not "to tame"',
    'שוהם': 'its count is the name Shoham, not "onyx"',
    'קטון': 'its count is קטן "small" (the inventory\'s), whose forms it shares',
    'ברר': 'its count is ברור "clear", whose forms it shares, not "to sort"',
    'בז': 'its count is shapes of other words, not "to despise"',
    'אנוש': 'its count is shapes of אנשים and אנושי, not "mortal"',
    'שהה': 'its count is שהיה "that was", which it shares, not "to stay"',
    'אי': 'its count is אי in אי אפשר "impossible", not "island"',
    'זימן': 'its count is מזמן "long ago", which it shares, not "to summon"',
    'יידע': 'its count is יודע "knows", which it shares, not "to inform"',
    'לשם': 'Wiktionary\'s only entry is a precious stone; the count is לשם "(to) there"',
    'היינו': 'its count is "we were" (a form of היה), not "that is to say"',
    'ולא': 'ו + לא "and not", written as one word',
    'לדעת': 'its count is the infinitive "to know" (a form of ידע), not "according to"',
    'משנה': 'its count is לא משנה "it doesn\'t matter" (a form of שינה), not "deputy"',
    'אימת': 'its count is אמת "truth" and אימא, whose shapes it shares, not "to verify"',
    'הרג': 'to kill: the subtitles\' crime drama, not a beginner\'s word (the Persian rule)',
    'רצח': 'to murder: the subtitles\' crime drama',
    'ירה': 'to shoot: the subtitles\' crime drama',
    'דן': 'its count is the name Dan, not "to discuss"',
    # Read off the A2 ranking (2026-11-12).
    'האדים': 'its count is האדם "the man", not "to redden"',
    'שכל': 'its count is שכל "intellect" and ש + כל "that all", not "to be bereaved"',
    'נשה': 'its count is נשים "women", whose shapes it shares, not "to forget"',
    'זן': 'its count is shapes of זה and זאת, not "to nourish"',
    'שבע': 'Wiktionary has no number "seven" under this spelling, only "sated"',
    'מכל': 'its count is מ + כל "from all", not "container"',
    'אמה': 'its count is shapes of אמא, not "handmaid"',
    'דר': 'its count is shapes of other words, not "to dwell"',
    'בליל': 'its count is בלילה "at night", not "a mixture"',
    'עול': 'its count is shapes of other words, not "yoke"',
    'סיווג': 'its count is סוג "kind", whose shapes it shares, not "to classify"',
    'שיער': 'its count is "hair", which Wiktionary files under the defective spelling, not "to assume"',
    'שיהיה': 'its count is "that (it) will be", a form of היה',
    'עשר': 'the only entry is the "-teen" element; the count is "ten"',
    'גבירה': 'its count is גבירותיי "ladies", in a set phrase',
    'ליבן': 'its count is לבן "white", whose shapes it shares',
    'יישר': 'its count is ישר "straight", whose shapes it shares',
    'לן': 'its count is shapes of other words (לנו), not "to lodge"',
    'איווה': 'its count is shapes of other words, not "to desire"',
    'גיבה': 'its count is גבה "eyebrow, height", whose shapes it shares',
    'קס': 'its count is English names, not "inkwell"',
    'השים': 'its count is shapes of other words',
    'שימר': 'its count is שמר "kept", whose shapes it shares',
    'פול': 'its count is the English name Paul, not "broad bean"',
    'פי': 'a construct form of פה, written as one word in set phrases',
    'תייק': 'its count is תיק "bag", whose shapes it shares, not "to file"',
    'הוד': 'its count is הודו "India" and shapes of other words',
    'נמס': 'its count is shapes of other words, not "to melt"',
    'האט': 'its count is the English word "hat" and shapes of other words',
    'מולד': 'its count is מולדת "homeland" and shapes of other words',
    'כוון': 'its count is כיוון "direction" written short',
    'מיפה': 'its count is מפה "from here" written as one word',
    'ריס': 'its count is shapes of other words',
    'שיבט': 'its count is שבט "tribe", whose shapes it shares',
    'בעיר': 'ב + עיר "in the city"',
    'קדם': 'its count is קודם "before", whose shapes it shares',
    'הולדת': 'its count is יום הולדת "birthday", a set phrase the inventory teaches',
    'רוצח': 'a murderer: the subtitles crime drama, as רצח',
    'כינה': 'its count is the verb "called, nicknamed", which shares the spelling, not "louse"',
    'סרק': 'its count is shapes of other words',
    'סנט': 'its count is the English "cent" and saint names',
    'מן': 'the only Wiktionary entry is "manna"; the count is the preposition "from"',
    'בתר': 'its count is בתור "as", whose shapes it shares',
    'רבה': 'its count is הרבה "much", not "female rabbi"',
    'סנכרן': 'its count is shapes of other words',
    'הווריד': 'its count is הוריד "took down", spelt alike',
    'איתר': 'its count is איתו "with him", whose shapes it shares',
    'במה': 'its count is ב + מה "in what"',
    'אנס': 'its count is a verb of sexual violence spelt alike; not a level word',
    'השיר': 'its count is shapes of שיר "song"',
    'קלה': 'its count is the feminine of קל "easy", not "to toast"',
    'נעם': 'its count is shapes of נעים "pleasant"',
    # Read off the B1 ranking (2026-11-12).
    'ת׳': 'the letter tav as the number 400',
    'השתין': 'vulgar register; not a level word',
    'פרד': 'its count is נפרד "separate", whose shapes it shares, not "mule"',
    'בלילה': 'its count is ב + לילה "at night", not "a mixture"',
    'רחם': 'its count is רחמים "mercy", not "womb"',
    'הומו': 'used chiefly as a slur in the subtitles',
    'רום': 'its count is English names and "room"',
    'דמם': 'its count is shapes of דם "blood"',
    'צפן': 'its count is צפון "north", whose shapes it shares',
    'הודאג': 'its count is shapes of דאג',
    'הסב': 'its count is shapes of סבא and הסבר',
    'שיכול': 'its count is shapes of other words',
    'וילן': 'its count is shapes of other words',
    'שיטר': 'its count is שוטר "policeman", spelt alike',
    'מל': 'its count is shapes of other words, not "to circumcise"',
    'אומן': 'its count is shapes of אמן "artist" and אמון',
    'דאה': 'its count is shapes of other words',
    'רוק': 'its count is English "rock", not "saliva"',
    'השעה': 'its count is ה + שעה "the hour"',
    'אממ': 'a hesitation sound, counted from subtitles',
    'רישת': 'its count is רשת "net", whose shapes it shares',
    'איכף': 'its count is אכפת "care", spelt alike',
    'תשומה': 'its count is תשומת לב "attention", a set phrase',
    'ממזר': 'an insult as the subtitles use it',
    'וו': 'its count is the letter vav and shapes of other words',
    'הלבין': 'its count is shapes of לבן',
    'השרה': 'its count is ה + שרה (the minister, the name Sarah)',
    'שת': 'its count is shapes of other words',
    'זיווג': 'its count is זוג "pair", whose shapes it shares',
    'המליך': 'its count is shapes of מלך',
    'ייוון': 'its count is shapes of יוון "Greece"',
    'אוון': 'its count is the English name Owen',
    'הבריק': 'its count is shapes of other words',
    'נקב': 'its count is shapes of נקבה and נקודה',
    'הריץ': 'its count is shapes of רץ',
    'חרבן': 'vulgar',
    'זהר': 'its count is shapes of זהיר and זוהר',
    'סקסי': 'not a level word',
    'התאבד': 'suicide: refused by the sentence filter, not a level word',
    'נהרג': 'to be killed: the subtitles crime drama, as הרג',
    'חימש': 'its count is חמש "five", spelt alike',
    'הקשה': 'its count is ה + קשה "the hard one"',
    'נידה': 'its count is shapes of other words',
    'להט': 'its count is shapes of other words',
    'לש': 'its count is shapes of לשם and של',
    'פן': 'its count is shapes of other words',
    'באש': 'its count is ב + אש "in fire"',
    'מג': 'its count is English names',
    'כיפר': 'its count is shapes of כיפור and כפר',
    'אחי': 'its count is "my brother", a form of אח',
    'בדל': 'its count is shapes of הבדל',
    'שבה': 'its count is ש + בה "that in it"',
    'צרך': 'its count is צריך "must", whose shapes it shares',
    'הרע': 'its count is ה + רע "the bad"',
    'פיתה': 'its count is the pita, which the verb "entice" shares',
    'העלים': 'its count is ה + עלים "the leaves"',
    'דקר': 'to stab: the subtitles crime drama',
    'המית': 'to kill: as הרג',
    'נרצח': 'to be murdered: as רצח',
    'כנה': 'its count is כנה "sincere", which Wiktionary does not give',
    'שף': 'its count is "chef", which Wiktionary does not give',
    'שרה': 'its count is the name Sarah and ה + שר',
    'הרביץ': 'its first sense is "to herd"; the count is spoken "hit"',
    'תת': 'a bare infinitive of נתן',
    'דוק': 'its count is shapes of other words',
    'לח': 'its count is shapes of לך and other words',
    'דניס': 'its count is the English name Dennis',
    'השליש': 'its count is shapes of שליש and שלוש',
    'הקהיל': 'its count is shapes of קהל',
    'האחיד': 'its count is shapes of אחד',
    'גמל': 'its count is shapes of other words',
    'קיטע': 'its count is קטע "passage", spelt alike',
    'חמץ': 'its count is shapes of other words',
    'תחם': 'its count is shapes of other words',
    'פין': 'vulgar homonym',
    'בונה': 'its count is "builds", a form of בנה, not "beaver"',
    'אשל': 'its count is shapes of other words',
    'ביער': 'its count is ב + יער "in the forest"',
    'בול': 'its count is "exactly" (slang) and English names',
    'תווך': 'its count is shapes of תוך',
    'שמוק': 'an insult',
    'עביר': 'its count is shapes of עבר',
    'ט״ו': 'a number written in letters',
    'נאות': 'its count is shapes of נאה',
    'שיטח': 'its count is שטח "area", spelt alike',
    'צלב': 'its count is shapes of other words, not "to crucify"',
    'הזדיין': 'vulgar slang in the subtitles',
    'הלכנו': '"we went", a form of הלך',
    'והיה': 'ו + היה, a Biblical form',
    'עז': 'its count is shapes of other words, not "to seek shelter"',
    'מיני': 'its count is "kinds of" (construct of מין)',
    'יורה': 'a shooter: the subtitles crime drama, as ירה',
    'כוונת': 'its count is כוונה "intention", spelt alike',
    'מרט': 'its count is shapes of other words',
    'בל': 'its count is shapes of other words',
    'גבל': 'its count is גבול, spelt alike',
    'הוכשר': 'its count is כשר "kosher" and shapes of other words',
    'חיות': 'its count is "animals", the plural of חיה',
    'יקום': 'its count is "will rise", a form of קם',
    'מעה': 'its count is shapes of מה "what"',
    'שלה': 'its count is "hers" (של + ה)',
    'שעבד': 'its count is ש + עבד "that worked"',
    'גאל': 'its count is shapes of other words and names',
    'כלך': 'its count is כ + לך and כלכך written short, not the plant "ferula"',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'זין', 'כוס', 'חרא', 'זונה', 'מזדיין', 'לעזאזל', 'מטומטם', 'אידיוט', 'דפוק', 'תחת',
          'שרמוטה', 'בן זונה', 'זיין', 'דפק', 'מניאק', 'חארה'}


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pick = item.partition('=')
            pick = unicodedata.normalize('NFC', pick)
            w, _, pos = w.partition(':')
            w = w.replace('_', ' ')
            k = fold(w)
            L = lex.get(k)
            if not L or 'entries' not in L:
                missing.append(item)
                continue
            if pos and not any(e['pos'] == pos for e in L['entries']) or \
                    pick and not any(e['p'] == pick for e in L['entries']):
                missing.append(item)
                continue
            ents = choose(L, pos, pick)
            p = ents[0]['p']
            if (k, p) in seen or L['word'] + '|' + p in below:
                continue
            seen.add((k, p))
            rows.append({'key': k, 'pick': p, 'word': L['word'], 'freq': L['freq'],
                         'pos': pos or pick_pos(L),
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    keys = {k for k, _ in seen}
    # A SPELLING A LEVEL BELOW TEACHES IS NOT DEALT AGAIN BY THE FILL (A2, 2026-11-12): its count belongs
    # to the word already taught (גֶּבֶר "man"), not to another word spelt alike (גָּבַר "prevail").  The
    # inventory may still name one (`ספר=סַפָּר`, the barber).
    keys |= {fold(b.split('|')[0]) for b in below}
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if 'entries' not in L or L.get('formonly') or L.get('inv_only'):
            continue
        # a construct-only entry (`בעיני־`, `לצער־`, B1) is a bound form, not a headword
        if k in keys or k in swears or k in excl or len(k) < 2 or ' ' in k or '־' in L['word']:
            continue
        if not any(usable(e) for e in L['entries']) or L['freq'] < 1:
            continue
        ents = choose(L)
        if all(e['pos'] in ('phrase', 'proverb', 'name') for e in ents):
            continue
        p = ents[0]['p']
        if L['word'] + '|' + p in below:
            continue
        keys.add(k)
        fill.append({'key': k, 'pick': p, 'word': L['word'], 'freq': L['freq'], 'pos': pick_pos(L),
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key'], r['pick']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
