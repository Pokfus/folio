#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining words.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, each marked with where it came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`khmer_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a word whose every sense is weak (rare, archaic, literary, slang ...) -- the
    count belongs to a commoner use it is spelt like;
  · a word with only proper-noun, phrase or proverb entries;
  · a word defined only by pointing at another;
  · the hand list `EXCLUDE`, each line with its reason -- mostly one-letter words
    whose count is the cut's leftovers: a Wikipedia word Wiktionary lacks is cut
    into the words it is spelt with, and a stray letter is the commonest piece.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from km import key
from khmer_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking.  Each with its reason.
EXCLUDE = {
    'រ': 'a one-letter count, the leftover of words the cut does not know; the card was "to move away"',
    'ស': 'a one-letter count; "white" is A1\'s inventory word (ស:adj) and kept there',
    'ង': 'a one-letter count; the card was a rare "to be dark"',
    'ត': 'a one-letter count (the card was "to continue"); the count is the syllable of names and loans',
    'ល': 'a one-letter count; the card was "to try out"',
    'ច': 'a one-letter count; the card was "to grow"',
    'វ': 'a one-letter count; the card was "to wind around"',
    'គ': 'a one-letter count; the card was "dumb, mute"',
    'ព': 'a one-letter count; the card was "to carry"',
    'ញ': 'a one-letter count; the card was "to tremble"',
    'ក': 'a one-letter count; "neck" is a body word for a later level, not the commonest word of Khmer',
    'អា': 'a prefix of familiarity before a name, counted from names and loans (អាមេរិក, អាស៊ី)',
    'តា': 'a syllable count from names (តាកែវ) as well as "grandfather"; the inventory keeps it under family',
    'រា': 'a syllable count; the card was "to spread out"',
    'នី': 'a syllable count from names and loans; the card was "this" (literary)',
    'កា': 'a syllable count from loans; the card was "to protect"',
    'មា': 'a syllable count from names; the card was "uncle" (a dialect word)',
    'ស៊ី': 'a syllable count from loans (អាស៊ី "Asia"); the card was "to eat" (of animals, and rude of people)',
    'លី': 'a syllable count from names and loans',
    'យោង': 'counted from the heading ឯកសារយោង "references" that closes almost every article',
    'ឯកសារ': 'counted from the same heading; "document" waits for a later level',
    'មេ': 'counted from compounds the cut leaves whole only in part (មេឃ "sky", មេដឹកនាំ "leader"); the card opened on "mother"',
    'ម៉ា': 'a syllable count from loans and names (ម៉ាឡេស៊ី "Malaysia"); the card was "grandmother", which A1 teaches as យាយ',
    # A2
    'ស្រ': 'a syllable count (ស្រុក, ស្រី); the card was "noisily"',
    'ត្រ': 'a syllable count (ត្រូវ, ត្រី); the card was "to wind thread on a spool"',
    'ដា': 'a syllable count; the card was "rock"',
    'សេ': 'a syllable count from loans; the card was "fast"',
    'វី': 'a syllable count from loans; the card was "to spread out (grain)"',
    'ហា': 'a syllable count (ហាង, ហាត់); the card was a literary "five"',
    'ជី': 'a syllable count (ជីវិត, ជីដូន); the card was a unit of weight',
    'រេ': 'a syllable count; the card was "to turn frequently"',
    'សី': 'a syllable count (សីហា); the card was "shuttlecock"',
    'គី': 'a syllable count (គីឡូ); the card was "shrimp paste"',
    'មី': 'a syllable count from names and loans; the card was a noodle',
    'អ៊ី': 'a syllable count from loans (អ៊ីតាលី, អ៊ីនធឺណិត); the card was "aunt"',
    'ប្រា': 'a syllable count (ប្រាសាទ, ប្រាក់); the card was a fish',
    'បេ': 'a syllable count from loans; the card was "package"',
    'ឡូ': 'a syllable count from loans; the card was "dozen"',
    'ខ': 'a one-letter count; the card was a stew',
    'រូ': 'a syllable count; the card was a literary "like"',
    'ម៉': 'a syllable count (ម៉ោង, ម៉ែ); the card was the sound a cow makes',
    'ដំ': 'a syllable count (ដំបូង, ដំណើរ); the card was "to pound"',
    'លប់': 'a syllable count; the card was a bird trap',
    'លោ': 'a syllable count (លោក); the card was "to leap forward"',
    'ទ័យ': 'the second half of ហឫទ័យ "heart" (royal), which the cut leaves in pieces',
    'ធី': 'a syllable count (ពិធី, វិធី); the card was "to take an examination"',
    'គណ': 'a syllable count (គណបក្ស); the card was an ecclesiastical district',
    'ទំ': 'a syllable count (ទំនាក់ទំនង, ទំហំ); the card was "to perch"',
    'រណ': 'a syllable count; the card was a literary "battle"',
    'បូ': 'a syllable count (បូព៌ា, បូជា); the card was "ribbon"',
    # B1
    'ម៉ៅ': 'counted as a name (Mao); the card was "mouse"',
    'ក្រចេះ': 'counted as the province of Kratié; the card was an aromatic tree',
    'ដង': 'counted mostly as "times" (ពីរដង "twice"), a sense Wiktionary does not list; the card taught "to draw water"',
}

LEAD_TOPICS = {'greetings and politeness'}

# Swearing and insults are never in a level deck.
SWEARS = {'ញី'}     # B1: "woman" used insultingly of loose women

# A SHORT WORD THAT IS NEVER WRITTEN ALONE IS A FRAGMENT (B1 on; `solo.py` says how
# it is measured).  A fill word of three code points or fewer must stand alone, between
# typed breaks, in at least this share of the articles it is counted in.  GATED from B1:
# A1 and A2 were built before it and are not rebuilt by it.
SOLO_MIN, SOLO_LEN, SOLO_FROM = 0.08, 3, ('b1', 'b2', 'c1')

# ...and "abstract noun of ប្រើប្រាស់ (praə prah)" with no meaning of its own (A2: ការប្រើប្រាស់)
POINTER = re.compile(r'^(?:alternative|obsolete|dated|rare|archaic) (?:form|spelling) of '
                     r'|^(?:synonym|abbreviation) of [^;]*$'
                     r'|^abstract noun of [^\s(]+ \([^()]*\)$'
                     # B1: a bound syllable -- ប្រាស់ "used in the compound ប្រើប្រាស់", បាល
                     # "guardian (mainly used in composition)"
                     r'|^used in the compound |\(mainly used in composition\)$', re.I)


def pointer_only(L):
    gl = [g['g'] for e in L['entries'] if e['pos'] != 'name' for g in e['glosses'] if not g['weak']]
    return bool(gl) and all(POINTER.match(g.rstrip(' .')) for g in gl)


def usable(L):
    return any(not g['weak'] for e in L['entries'] if e['pos'] != 'name' for g in e['glosses'])


# COMPOUNDS WIKTIONARY LACKS, composed from their parts' entries: the romanisation
# is the parts' own Wiktionary readings joined (nothing about the sound is typed
# here), only the English is written by hand.
COMPOSE = {
    'ភាសាខ្មែរ': ('ភាសា ខ្មែរ', 'noun', 'Khmer (the language)'),
    'ភាសាអង់គ្លេស': ('ភាសា អង់គ្លេស', 'noun', 'English (the language)'),
}


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            k = key(w)
            if k in seen or k in below:
                continue
            if w in COMPOSE:
                parts, cpos, gloss = COMPOSE[w]
                if all(key(p) in lex and 'entries' in lex[key(p)] for p in parts.split()):
                    seen.add(k)
                    rows.append({'key': k, 'via': '', 'word': w, 'freq': 0, 'pos': cpos,
                                 'source': 'inventory', 'topic': topic,
                                 'compose': {'parts': parts.split(), 'gloss': gloss}})
                    continue
            L = lex.get(k)
            via = ''
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
            seen.add(k)
            row = {'key': k, 'via': via, 'word': L['word'], 'freq': L['freq'], 'pos': pos or '',
                   'source': 'inventory', 'topic': topic}
            if via:
                row['roman'] = own[0]
            rows.append(row)
    # A WORD NO SOURCE ROMANISES IS NOT CARDED (A2): Wiktionary's own page prints an
    # empty romanisation for some entries (ប្ដូរ, បញ្ជូន, កើន, ថយ, ម្យ៉ាង), and the
    # extraction has none either, so the card would show the script alone.  The
    # pages are read here, before the choice (`romanise.fetch`, cached).
    import romanise

    def has_roman(r, tr):
        if r.get('compose') or tr.get(r['word']) or r.get('roman'):
            return True
        L = lex.get(r['via'] or r['key'], {})
        return any(e['roman'] for e in L.get('entries', []))
    tr = romanise.fetch({r['word'] for r in rows})
    noroman = [r['word'] for r in rows if not has_roman(r, tr)]
    rows = [r for r in rows if has_roman(r, tr)]
    n_inv = len(rows)
    swears = {key(s) for s in SWEARS}
    excl = {key(s) for s in EXCLUDE}
    solo = json.load(open('solo.json', encoding='utf-8')) if LEVEL in SOLO_FROM else {}
    fragments = []
    fill = []
    ranked = sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0]))
    for i, (k, L) in enumerate(ranked):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if L['word'] not in tr:       # the next 200 pages at a time
            tr = romanise.fetch({v['word'] for _, v in ranked[i:i + 200]})
        if 'entries' not in L or L.get('formonly'):
            continue
        if k in seen or k in below or k in swears or k in excl:
            continue
        if ' ' in k or not usable(L) or L['freq'] <= 0 or pointer_only(L):
            continue
        if all(e['pos'] in ('phrase', 'proverb', 'name') for e in L['entries']):
            continue
        if LEVEL in SOLO_FROM and len(k) <= SOLO_LEN and solo.get(k, 0) < SOLO_MIN * L['freq']:
            fragments.append(L['word'])
            continue
        row = {'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'], 'pos': '',
               'source': 'frequency', 'topic': ''}
        if not has_roman(row, tr):
            noroman.append(L['word'])
            continue
        seen.add(k)
        fill.append(row)
    rows += fill
    # THE FIRST DAY'S WORDS LEAD, then everything by frequency: an encyclopaedia
    # rarely says "hello" or "thank you", and dealt by its counts alone the
    # greetings came last.
    rows.sort(key=lambda r: (r['topic'] not in LEAD_TOPICS, -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))
    if fragments:
        print(f'  {len(fragments)} short fragments left out (solo.py):', ' '.join(fragments[:60]))
    if noroman:
        print('  NO ROMANISATION ON ITS PAGE (dropped):', ' '.join(noroman))


if __name__ == '__main__':
    main()
