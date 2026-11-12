#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`tl_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal ...);
  · a one-letter lemma; a multi-word lemma (the inventory's to choose);
  · a capitalised noun (a day or a month is the inventory's; a capital the
    fill reaches is a name the subtitles say);
  · a word with its linker -ng (`tayong`, `pong`; see the rule in `main`);
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tl import fold
from tl_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    'di': "a clipping of hindi 'not', taught in the inventory",
    'niyo': "the colloquial spelling of ninyo, taught in the inventory",
    'kanya': "its entry is 'menstruation'; its count is the pronoun, taught as kaniya",
    'ilang': "its count is ilan 'how many, some' with its linker; the entry is 'desert'",
    'espada': "a sword, counted from one run of Tatoeba sentences",
    'buhusan': "counted from one run of Tatoeba sentences about pouring water",
    'yaong': "an archaic form of iyon, taught in the inventory",
    'igik': "a pig's grunt, counted from one run of Tatoeba sentences",
    'ika': "its count is the ordinal prefix ika- before a figure (ika-10), not the noun 'limp'",
    'maari': "the common misspelling of maaari 'may, can', whose count it shares",
    # read off the A2 ranking (2026-11-12)
    'duke': "a duke, counted from one run of Tatoeba sentences",
    'tiyera': "'earth, soil', a rare loan counted from one run of Tatoeba sentences",
    'ganiyan': "the 2007 spelling of ganyan 'like that', which the A2 inventory teaches",
    'retrato': "the older spelling of litrato 'photograph', which the A2 inventory teaches",
    'yaon': "an archaic form of iyon, taught in A1",
    'ya': "a cattle-driver's 'yah'; its count is the English and Spanish 'ya' in subtitles",
    'me': "a goat's bleat; its count is the English 'me' in subtitles",
    'so': "the English 'so', counted where subtitles mix English in",
    'on': "the English 'on' ('in a relationship'), counted where subtitles mix English in",
    'nones': "'odd (of a number)', none of whose count is its own",
    'pitsa': "a gambling chip, whose count is mostly another word's passed to it",
    'aling': "its count is alin 'which' with its linker; the entry is 'term of address of an elder woman'",
    'naglalakad': "the ongoing aspect of maglakad, taught in A1, filed as a noun 'pedestrian'",
    'bayag': "a vulgar word for a body part",
    # read off the B1 ranking (2026-11-12)
    'tita': "only a slang sense in Wiktionary (left out of the A2 inventory for it)",
    'daungan': "only 'place for making a big ship' (left out of the A2 inventory for it)",
    'tsaka': "its count is the colloquial spelling of saka 'and then'; the entry is 'ugly'",
    'palang': "its count is pa lang 'only, just'; the entry is a bolo knife",
    'kalang': "its count is ka lang 'you only'; the entry is 'wedge'",
    'balang': "its count is balang araw 'some day' and bala + -ng; the entry is 'locust'",
    'satin': "its count is satin, the contraction of sa atin 'to us'; the entry is the cloth",
    'tong': "its count is 'tong, the clipping of itong 'this'; the entry is 'bribe'",
    'kana': "its count is not 'deception'",
    'taga': "its count is the prefix taga- 'from, native of'; the entry is 'a big cut'",
    'aya': "its count is not 'pleasantness of the weather'",
    'kamo': "dialectal 'you (plural)'; its count is kamo 'you said'",
    'la': "a call to stop an animal; its count is the Spanish and English 'la'",
    'elf': "a delivery truck by brand name; its count is the English 'elf'",
    'korea': "its count is the country's name; the entry is a machine belt",
    'itik': "a duck, shown by a gloss 'Indian person' that is not the word's meaning",
    'hangal': "an insult ('a fool'), dealt under a homograph 'gasp'",
    'luko-luko': "its count is loko-loko 'crazy'; the entry is holy basil",
    'letse': "a swear (leche)",
    'gunggong': "an insult ('a fool')",
    'utot': "vulgar",
    'bala': "'bullet' is a weak sense in the extraction, so the card would read 'threat'",
    # read off the B2 ranking (2026-11-12)
    'boy': "the English 'boy', counted where subtitles mix English in",
    'am': "its count is the English 'am'; the entry is 'rice water'",
    'was': "its count is the English 'was'; the entry is 'nothing'",
    'look': "its count is the English 'look'; the entry is 'bay'",
    'park': "the English 'park', counted where subtitles mix English in",
    'pan': "its count is the English 'pan' as much as 'bread'",
    'asap': "its count is the English 'ASAP'; the entry is an eye irritation",
    'haha': "its count is laughter written 'haha'; the entry is 'a big rip'",
    'sharon': "its count is the name Sharon",
    'washington': "its count is the name Washington; the entry is a children's game",
    'teksas': "its count is Texas; the entry is a breed of fighting cock",
    'lisa': "its count is the name Lisa; the entry is 'nit'",
    'kristo': "its count is Kristo 'Christ'; the entry is a cockfight bet collector",
    'postmaster': "an English loan counted from one run of Tatoeba sentences",
    'sigay': "a cowrie shell, counted from one run of Tatoeba sentences",
    'yari': "its only entry is a note on a root, not a word's meaning",
    'paki': "its only entry is 'synonym of pakialam', a pointer",
    'isinama': "its only entry is 'complete aspect of isama', a pointer",
    'naganap': "its count is the verb 'happened'; the entry is the grammar term 'perfective'",
    'nagaganap': "its count is the verb 'happening'; the entry is the grammar term 'progressive'",
    'sinama': "its count is the verb 'brought along'; the entry is 'unlucky'",
    'iniba': "its count is the verb 'changed'; the entry is a banana",
    'masa': "its count is nasa and maaari passed to it (the A1 finding); the entry is 'dough'",
    'basang-basa': "'soaking wet' to a reader; the entry says 'very readable'",
    'lilang': "its count is not the entry's",
    'matae': "its count is not 'to cause to defecate'",
    'tae': "vulgar", 'tumae': "vulgar", 'umutot': "vulgar",
    'ogag': "an insult ('a fool')", 'engot': "an insult ('a moron')",
    'hunghang': "an insult ('a fool')", 'ungas': "an insult ('an ignoramus')",
    'pagkalalaki': "its entry's first sense is a vulgar one", 'magtae': "vulgar, like tae",
}

# Swearing and insults are never in a level deck.
SWEARS = {'putang', 'puta', 'putangina', 'gago', 'gaga', 'tanga', 'bobo', 'ulol', 'tarantado',
          'leche', 'punyeta', 'pakshet', 'buwisit', 'hayop', 'peste', 'tangina', 'hindot',
          'kantot', 'puki', 'titi', 'burat', 'pokpok', 'bwisit', 'lintik', 'demonyo'}


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
            k = ('cap:' if w[:1].isupper() else '') + fold(w)
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
    # From B1 up (so A1 and A2 rebuild unchanged): a lemma that a word already
    # taught, or this level's inventory, is filed under (`sumbrero` -> `sombrero`,
    # `marumi` -> `madumi`, `gayunpaman` -> `gayumpaman`) is that word again in
    # another spelling, and is not dealt by the fill.
    if LEVEL not in ('a1', 'a2'):
        for k in list(below) + [r['key'] for r in rows]:
            t = lex.get(k, {}).get('alt_of')
            if t and t != k:
                seen.add(t)
        for r in rows:
            if r['via']:
                seen.add(r['via'])
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    fill, linked = [], []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if 'entries' not in L or L.get('formonly'):
            continue
        if k in seen or k in below or k in swears or k in excl:
            continue
        if len(k) < 2 or ' ' in k or "'" in k or k.startswith('cap:'):
            continue
        # A WORD WITH ITS LINKER: Tagalog joins a vowel-final word to the next with
        # -ng (`tayong`, `taong`, `bang`, `pong`), and the subtitles count the joined
        # spelling as a word.  Wiktionary's entry under it is another word entirely
        # (`tayong` "a suspension of work", `pong` the mahjong set), so a lemma whose
        # spelling is a commoner vowel-final lemma plus -ng is not dealt -- unless it
        # is a conjunction, preposition or adverb of its own (`nang` "when", `parang` "like").
        b = k[:-2]
        if k.endswith('ng') and b[-1:] in 'aeiou' and b and lex.get(b, {}).get('entries') \
                and lex[b]['freq'] > L['freq'] \
                and not any(e['pos'] in ('conj', 'prep', 'adv') for e in L['entries']):
            linked.append(k)
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        # a lemma whose ONLY entries are phrases, proverbs or contractions belongs elsewhere
        if all(e['pos'] in ('phrase', 'proverb', 'contraction') for e in L['entries']):
            continue
        seen.add(k)
        fill.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    print('  left out as a word with its linker:', ' '.join(linked))
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
