#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining words.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json`, `freq.json` and `inventory.py`, writes `selected-<level>.json`:
one row per note, each marked with where it came from (`inventory` or
`frequency`).  Thai's `select.py`, re-keyed to Lao; its rules are this file's.

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`lao_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a word whose every sense is weak (rare, archaic, slang ...);
  · a word with only proper-noun, phrase or proverb entries;
  · a word Wiktionary defines only by pointing at another;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lo import fold
from lao_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking.  Each with its reason.
EXCLUDE = {
    'ໆ': 'the repetition mark, not a word',
    'ແມ່ແບບ': '"template" -- counted from Wikipedia\'s own markup pages, not its prose',
    'ວິກິພີເດຍ': '"Wikipedia" -- counted from the encyclopedia naming itself',
    'ເອີລົບ': 'a variant spelling of ເອີຣົບ "European", which the fill already deals',
    # A ONE-SYLLABLE HOMOGRAPH WHOSE COUNT BELONGS TO SOMETHING ELSE: the syllable of
    # longer words Wiktionary lacks (the segmenter only counts runs it covers whole,
    # but a run of headwords can still be a longer word cut wrongly), or a name.
    # Each card taught the rare sense, given here.
    'ສາ': 'the card was "stork"; the count is the syllable of ສາທາລະນະ-, ສາດ and the like',
    'ປະ': 'the card was "to leave, divorce"; the count is the prefix syllable of ປະ- words',
    'ຕິ': 'the card was "to blame"; a syllable count',
    'ກະ': 'the card was "to suppose"; the count is the prefix syllable of ກະ- words',
    'ລາ': 'the card was "donkey"; a syllable count',
    'ອາ': 'the card was "aunt"; the count is the syllable of ອາ- loanwords (ອາຊີ, ອາເມລິກາ)',
    'ກາ': 'the card was "crow"; a syllable count',
    'ສານ': 'the card was "to weave"; a syllable count (ສານ "court" is not in Wiktionary)',
    'ມາດ': 'the card was "sulphur"; a syllable count (ມາດຕາ, ສາມາດ)',
    'ວີ': 'the card was "fan"; a syllable count',
    'ຖານ': 'the card was "toilet"; a syllable count (ຖານະ, ສະຖານ-)',
    'ສົມ': 'the card was "to add (mathematics)"; a syllable count and a name',
    'ລັດ': 'the card was "to straighten"; the count is ລັດ "state", which Wiktionary lacks',
    'ພັກ': 'the card was "to rest"; the count is ພັກ "party", which Wiktionary lacks',
    'ໄຊ': 'the card was "victory"; the count is names (ໄຊຍະບູລີ, ໄຊສົມບູນ)',
    'ຊຽງ': 'the card was "city; prince"; the count is place names (ຊຽງຂວາງ, ຊຽງໃໝ່)',
    'ພູມ': 'the card was "place, house"; a syllable count (ພູມສາດ, ພູມີ)',
    'ຂົນ': 'the card was "feather"; the count is ຂົນສົ່ງ "transport", cut in two',
    'ໄຕ': 'the card was "gizzard; kidney"; the count is the last syllable of ປະຊາທິປະໄຕ "democracy" where it is spelt apart',
    'ກມ': 'the abbreviation "km", not a word to learn',
    'ທິດຕາເວັນຕົກ': 'shares "west" with ຕາເວັນຕົກ, which the fill deals first',
    'ທິດຕາເວັນອອກ': 'shares "east" with ຕາເວັນອອກ, which the fill deals first',
    'ໂອ': 'the card was "bowl"; the count is the syllable of ໂອ- loanwords',
    'ມຸມ': 'the card was "gray-headed emperor pigeon"; the count is ມຸມ "corner", which Wiktionary lacks',
    'ອາຟຣິກກາ': 'a variant spelling of ອາຟຣິກາ "African", which A1 teaches',
    'ພຣະເຈົ້າ': 'the older spelling of ພະເຈົ້າ "god; Buddha", which the fill deals first',
    'ອັງຕາກຕິກ': '"Antarctican", a demonym nobody needs at A2',
    'ກີລາ': 'a variant spelling of ກິລາ "sport", which A2\'s inventory teaches',
    'ນູແວນເຊລັງ': '"New Zealander", a demonym counted from encyclopedia articles',
    'ລັດຖະ': '"state (in compounds)", a bound form, not a word said alone',
    'ອານາ': '"authority", a bound form of ອານາເຂດ, ອານາຈັກ and the like',
    'ຈຳປາ': 'the card was a tree; the count is the name Champasak (ຈຳປາສັກ)',
    'ກຳ': 'the card was "to fist"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ບຸ': 'the card was "to intrude"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ຄານ': 'the card was "to creep"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ທານ': 'the card was "to protect"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ຊອຍ': 'the card was "to dice"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ໄຂ': 'the card was "fat"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ອັດ': 'the card was "att (a coin)"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ຂ້າ': 'the card was "slave, servant"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ແລນ': 'the card was "Bengal monitor"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ຈຸ': 'the card was "capacity"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ເປ': 'the card was "hammock"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ກົງ': 'the card was "wheel"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ສິງ': 'the card was "lion"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ຫົງ': 'the card was "swan"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ໂພນ': 'the card was "mound"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ຊອງ': 'the card was "bed"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ເກີ': 'the card was "heart"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ຄິງ': 'the card was "king"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ລິງ': 'the card was "sex, gender"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ສາກ': 'the card was "pestle"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ໂສ': 'the card was "to discuss; horse"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ຄຸ': 'the card was "bucket"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
    'ຫຼາ': 'the card was "spinning wheel"; read off the A2 ranking, the count is most likely a syllable of longer words or names',
}

# A COMPOUND THE INVENTORY NEEDS AND WIKTIONARY HAS NO ENTRY FOR, composed from
# its PARTS' own entries: the romanisation is the parts' readings joined, so
# nothing about the sound is typed here, and only the English -- the plain
# meaning of the compound -- is written by hand (Thai's arrangement).
COMPOSE = {
    'ພາສາລາວ': ('ພາສາ ລາວ', 'noun', 'Lao (the language)'),
    'ພາສາອັງກິດ': ('ພາສາ ອັງກິດ', 'noun', 'English (the language)'),
}

LEAD_TOPICS = {'greetings and politeness', 'pronouns'}

# Swearing and insults are never in a level deck.
SWEARS = {'ກູ', 'ມຶງ'}   # the rude "I" and "you"


# A word Wiktionary defines ONLY by pointing at another ("synonym of ...", an
# old spelling) is not a card -- `check-lao.js` refuses its gloss.  The fill skips it.
# "abstract noun of ຮັກ (hak)" with no meaning of its own is a pointer too (A2:
# ຄວາມຮັກ, ການຕາຍ, ຄວາມໄວ -- the card printed the bare pointer).
POINTER = re.compile(r'^abstract noun of [^\s(]+ \([^(),“”]*\)$|'
                     r'^(?:alternative|obsolete|dated|rare|archaic) (?:form|spelling) of '
                     r'|^(?:synonym|abbreviation) of [^;]*$', re.I)


def pointer_only(L):
    gl = [g['g'] for e in L['entries'] if e['pos'] != 'name' for g in e['glosses'] if not g['weak']]
    return bool(gl) and all(POINTER.match(g.rstrip(' .')) for g in gl)


# A WORD WITH NO PRONUNCIATION IS NOT CARDED: the romanisation is read off
# Wiktionary's IPA (`lo.romanise`), and an entry without one (ຍ້ອນ, ຄືກັນ) would
# be a card with no reading under its word.  Reported, like a missing word.
def has_roman(L):
    return any(e['roman'] for e in L['entries'])


def usable(L):
    return any(not g['weak'] for e in L['entries'] if e['pos'] != 'name' for g in e['glosses'])


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    freq = json.load(open('freq.json', encoding='utf-8'))     # extract.py's, for a compound
    below = words_below()
    rows, seen, missing, silent = [], set(), [], []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = fold(w)
            if k in seen or k in below:
                continue
            L = lex.get(k)
            via = ''
            if w in COMPOSE:     # also overrides an entry that defines it only by pointer
                parts, cpos, gloss = COMPOSE[w]
                if all(fold(p) in lex and 'entries' in lex[fold(p)] for p in parts.split()):
                    seen.add(k)
                    rows.append({'key': k, 'via': '', 'word': w, 'freq': freq.get(k, 0), 'pos': cpos,
                                 'source': 'inventory', 'topic': topic,
                                 'compose': {'parts': parts.split(), 'gloss': gloss}})
                    continue
            if L and 'alt_of' in L:
                via = L['alt_of']
                tgt = lex.get(via)
                own = L.get('roman') or []
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
                if L is not None and not own:
                    L = None          # a pointer with no sound of its own is not carded
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            if not via and not has_roman(L):
                silent.append(item)
                continue
            seen.add(k)
            row = {'key': k, 'via': via, 'word': L['word'], 'freq': L['freq'], 'pos': pos or '',
                   'source': 'inventory', 'topic': topic}
            if via:
                row['roman'] = own[0]
            rows.append(row)
    n_inv = len(rows)
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if 'entries' not in L or L.get('formonly'):
            continue
        if k in seen or k in below or k in swears or k in excl:
            continue
        if ' ' in k or not usable(L) or L['freq'] <= 0 or pointer_only(L) or not has_roman(L):
            continue
        if all(e['pos'] in ('phrase', 'proverb', 'name') for e in L['entries']):
            continue
        seen.add(k)
        fill.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    # THE FIRST DAY'S WORDS LEAD, then everything by frequency.  Lao Wikipedia is
    # encyclopedic prose, where ສະບາຍດີ "hello" and ຂອບໃຈ "thank you" are rare; a
    # learner says them on the first day, so the inventory's greetings and pronouns
    # are dealt first, in frequency order among themselves.
    rows.sort(key=lambda r: (r['topic'] not in LEAD_TOPICS, -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))
    if silent:
        print('  NO PRONUNCIATION IN WIKTIONARY (dropped):', ' '.join(silent))


if __name__ == '__main__':
    main()
