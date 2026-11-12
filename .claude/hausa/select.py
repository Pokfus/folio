#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining Wiktionary words.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`hausa_level.words_below`).

THE FILL TAKES ONLY WIKTIONARY'S WORDS -- never a hand gloss, which exists for the
inventory alone -- and leaves out:
  · a proper name (a person, a place, a day: the days are the inventory's);
  · a word whose every sense is weak (rare, archaic, dialectal ...);
  · a multi-word entry, which is the phrases deck's;
  · the hand list `EXCLUDE`, each line with its reason -- read off the ranking.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ha import norm
from hausa_level import LEVEL, LEX, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    'mashi': 'its count is the dialect "mishi / mashi" (to him), not "spear"',
    'bana': 'its count is "ba na" (I do not) written as one word, not "this year"',
    'baka': 'its count is "ba ka" (you do not) written as one word, not "bow" or "mouth"',
    'dau': 'a short form of ɗauka, which the inventory teaches',
    'dari': 'its count is ɗari "hundred" typed without its hook',
    'guɗa': 'its count is "guda" (a single, one) matched without the hook, not "ululation"',
    'kanta': 'its count is "kanta" (herself; on her), the noun kai with a suffix',
    'maya': 'its count is not the weevil: a run of joined and mistyped words',
    'sako': 'its count is saƙo "message" typed without its hook, not the gourd pod',
    'tabo': 'its count is taɓo / taɓa "touch" typed without the hook, not "scar"',
    'mishi': 'its count is the dialect "mishi" (to him)',
    'miki': 'its count is the pronoun "miki" (to you, a woman), not "vulture"',
    'banda': 'its count is "banda" (apart from, except), not the dried meat',
    'fashe': 'its count is the verb "to burst, to break", not the children\'s game',
    'wau': 'its count is not the Arabic letter',
    'goge': 'its count is the verb "to rub, to polish", not the fiddle',
    'maye': 'its count is the verb "to replace", not "drunkenness"',
    'karuwa': 'its count is ƙaruwa "increase" typed without its hook',
    'aboka': 'its count is abokan, the plural abokai with the linker, cut to a wrong stem',
    'kafa': 'its count is ƙafa "foot" typed without its hook; ƙafa is taught',
    'ƴar': 'a spelling pointer (Niger standard spelling of \'yar), not a meaning',
    'ƴan': 'a spelling pointer (Niger standard spelling of \'yan), not a meaning',
    'matukar̃': 'a variant spelling of matuƙar, a conjunction better met in a sentence',
    'sin': 'the Arabic letter, counted from the Hausa word "sin" in running text',
    'bil': 'a rare loan ("bill, invoice") whose count is joined and mistyped words',
    'karama': 'its count is ƙarama, the feminine of ƙarami, typed without its hook',
    'shin': 'the question particle Wiktionary glosses only by its use; taught badly as a word',
    # Read off the A2 ranking (2026-11-12).  Each with its reason.
    'jim': 'its count is the English name Jim, not the Arabic letter',
    'wada': 'its count is "waɗan" (those) and joined words, not "wealth" or "dwarf"',
    'yari': 'its count is "gidan yari" (prison), not "earring"',
    'zara': 'its count is "da zarar" (as soon as), not the starling',
    'dina': 'its count is the possessive "dina" (my), not "dinner party"',
    'ƙala': 'its count is "kala" (colour) matched without the hook',
    'hadda': 'its count is "har da" (including) written as one word',
    'goyo': 'its count is "goyon baya" (support), not a child carried on the back',
    'kaso': 'its count is "kaso" (share, portion), not "prison"',
    'banga': 'its count is "ban ga" (I did not see) written as one word',
    'danga': 'its count is the verb "danganta" (to relate, to associate)',
    'danda': 'its count is "ɗanɗana" (to taste) typed without its hooks',
    'kaiwa': 'its count is the verbal noun of "kai" (taking, attacking), not a gift',
    'kanki': 'its count is "kanki" (yourself, a woman), the noun kai with a suffix',
    'kumallo': 'its count is "karin kumallo" (breakfast), not Wiktionary\'s "fasting"',
    'linzami': 'its count is "makami mai linzami" (missile), not "bridle"',
    'ice': 'its count is the English "ice cream"',
    'kam': 'its count is the particle "kam" (as for, indeed), not Wiktionary\'s "firmly"',
    'tasa': 'its count is the possessive "tasa" (his, hers), not the bowl',
    'girka': 'its count is Girka (Greece)',
    'makama': 'its count is "makamai" (weapons), the plural of makami',
    'goba': 'its count is "gobara" (fire), not the guava',
    'tambari': 'its count is "tambari" (a stamp), not the royal drum',
    'tim': 'its count is the English name Tim',
    'baiwa': 'its count is "baiwa" (a gift, a talent), not Wiktionary\'s "female slave"',
    'warƙa': 'its count is "warkar" (to cure) typed without its hook',
    'daƙiƙi': 'its count is "daƙiƙai" (seconds), the plural of daƙiƙa',
    'kishiya': 'its count is "kishiyar" (the opposite of), not "co-wife"',
    'komi': 'its count is "komai" (anything) spelt otherwise, not "canoe"',
    'kwal': 'its count is a run of loans and mistypings',
    'sura': 'its first entry is a chapter of the Qur\'an; its count is "sura" (form, looks)',
    'taska': 'its count is "taska" (treasure), not the householder\'s room',
    'salati': 'its count is the English "salad"',
    'sharo': 'its count is the English name Sharon',
    'shuri': 'its count is "shuri" (a kick), not the termite mound',
    "ƙa'imi": 'its count is "kaima" (you too) written as one word',
    'dubban': 'its count is "dubban" (thousands of), the linker form of dubu',
    'fes': 'its count is not the word: joined and mistyped words',
    'bori': 'its count is the idiom "bori ya hau", not the spirit religion',
    'sanka': 'its count is the verb "sanya" or "saka" in joined words, not tobacco',
    'kaca': 'its count is "kaca-kaca" (in pieces), not the bicycle chain',
    'kamala': 'its count is "kammala" (to complete) typed with one m',
    'kilishi': 'its count is the English "rug" in translation, not the dried meat',
    'kofur': 'its count is "corporal punishment" in translation',
    'laka': 'its first entry is the spinal cord; "mud" is a later one',
    'noti': 'a loan for a machine part, with a count of joined words',
    'rige': 'its count is "rige-rige" (a race to be first)',
    'tabbatarwa': 'a verbal noun of tabbatar, whose count is the verb',
    'tofa': 'taught as the verb "to spit" by the inventory, not elephant grass',
    'aya': 'its count is joined and mistyped words',
    'ca': 'its count is the English "cha cha"',
    'cif': 'its count is "cif" (exactly), and its first entry is the English "chief"',
    'diga': 'its count is not the pickaxe: joined and mistyped words',
    'gum': 'its count is the idiom "yi gum" (to keep silent), not "smelling bad"',
    'kafe': 'its count is not the verb: joined and mistyped words',
    'kasu': 'its count is not the verb: joined and mistyped words',
    'nun': 'its count is "nuna" (to show) in joined words, not the Arabic letter',
    'po': 'its count is the English "P.O. Box"',
    'raki': 'its count is the English "racket"',
    'ti': 'its count is the English "tin" in translation',
    'zi': 'its count is not the word: joined and mistyped words',
    'ƙirin': 'its count is "irin" (the kind of) matched without the hook',
    'mushe': 'its first entry is "mister"; its count is "mushe" (carrion)',
    'walau': 'its count is "walau" (whether), not "showing open palms"',
    'wuski': 'its first entry is "destitute person"; its count is the whisky',
    'kwamfyuta': 'another spelling of kwamfuta (computer), which the inventory teaches',
    'iblis': 'its count is "hodar iblis" (cocaine), and shaiɗan teaches "Satan"',
    'aljan': 'its count is aljanna (paradise), cut to a wrong stem',
    'rashawa': 'its count is Rashawa (Russians), not "bribe"',
    'ganuwa': 'its count is "ganuwa" (being seen, visible), not the town wall',
    'koko': 'its count is "kokon kai" (the skull)',
    'murza': 'its count is not the verb: joined and mistyped words',
    'gandu': 'its count is "gandun daji" (a national park)',
    'jadawali': 'its count is "jadawali" (a timetable), not the multiplication table',
    'cibiya': 'its count is "cibiya" (centre, institute), not "navel"',
    'mamaye': 'its count is the verb "mamaye" (to overrun), not the noun',
    'takunkumi': 'its count is "takunkumi" (a sanction, a mask), not "muzzle"',
    'manhaja': 'its count is "manhaja" (software), not "syllabus"',
    'ƙut': 'an ideophone with no sentence',
    'gam': 'its count is "gamsu" (to be satisfied), not "glue"',
    'bal': 'a loan for "ball"; the inventory teaches ƙwallo',
    'salka': 'a goatskin bottle with no sentence in the corpus',
    'wofi': 'an ideophone with no sentence',
    "el'e": 'an abbreviation (L.A., local authority) with no sentence',
    "jima'i": 'a sexual word, never in a level deck',
    'luwaɗi': 'a sexual word, and a slur, never in a level deck',
    'azzakari': 'a sexual word, never in a level deck',
    'tusa': 'a crude word ("fart"), never in a level deck',
}

# Swearing and insults are never in a level deck.
SWEARS = set()


def usable(L):
    return any(not g['weak'] for e in L['entries'] for g in e['glosses']) \
        and any(e['pos'] != 'name' for e in L['entries'])


def main():
    lex = json.load(open(LEX, encoding='utf-8'))
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = norm(w)
            if k in seen or k in below:
                continue
            L = lex.get(k)
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            rows.append({'key': k, 'word': L['word'], 'freq': L['freq'], 'pos': pos or '',
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    excl = {norm(s) for s in EXCLUDE} | {norm(s) for s in SWEARS}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if k in seen or k in below or k in excl or ' ' in k:
            continue
        if any(e['src'] == 'hand' for e in L['entries']):
            continue
        if L['word'][:1].isupper() or not usable(L) or L['freq'] < 1:
            continue
        seen.add(k)
        fill.append({'key': k, 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if len(rows) < TARGET[LEVEL]:
        print(f'  SHORT of the target {TARGET[LEVEL]}')
    if missing:
        print('  NOT IN WIKTIONARY OR hand.py (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
