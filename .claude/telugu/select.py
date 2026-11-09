#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`telugu_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from te import fold
from telugu_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-09).  Each with its reason.  THE SUBTITLE LIST IS
# MACHINE-TRANSLATED ENGLISH far more than Hindi's: "No." became `సంఖ్య` "number",
# "go" and "why" were transliterated (`గో` "cow", `వై` "the letter Y"), and the names
# came through as words (`సారా` "arrack" is Sarah, `జో` "hush" is Joe).  And Telugu's
# case endings make a pronoun's dative or genitive a homograph of a rare noun.
EXCLUDE = {
    'నాకు': 'its count is నాకు "to me", the dative of నేను, not the verb "to lick"',
    'మాకు': 'its count is మాకు "to us", not the noun "tree"',
    'వారి': 'its count is వారి "their", the genitive of వారు, not the noun "water"',
    'లో': 'its count is the locative ending "in" written apart; the entry is the adjective "inner"',
    'కు': 'its count is the dative ending written apart; the entry is a prefix "bad, vile"',
    'వరకు': 'its count is వరకు "until"; the entry is "thin plate, a foil"',
    'పాటు': 'its count is the పాటు of తో పాటు "along with"; the entry is "a fall"',
    'గత': 'its count is the adjective గత "last, past"; the entry is "cause, reason"',
    'సంఖ్య': 'its count is a machine translation of "No." in the subtitles',
    'గో': 'its count is English "go" transliterated; the entry is "cow"',
    'వై': 'its count is English "why" transliterated; the entry is the letter Y',
    'జో': 'its count is the name Joe; the entry is "hush!"',
    'సారా': 'its count is the name Sarah; the entry is "arrack"',
    'గని': 'its count is English "mine" (the pronoun) mistranslated; the entry is "a mine"',
    'కీలు': 'its count is English "keys" mistranslated; the entry is "a joint"',
    'ఉత్తర': 'the entry is a lunar mansion and a heroine of the Mahabharata',
    'ప్రణాళిక': 'its count is "plan"; Wiktionary has only "a channel from a pond, a drain"',
    'నాశనము': 'its count is the subtitles\' rendering of "damn", not "destruction"',
    'వెళ్ళండి': 'an imperative of వెళ్ళు, which the inventory teaches',
    'వెళ్ళడానికి': 'an infinitive of వెళ్ళు, which the inventory teaches',
    'చూచు': 'the older spelling of చూడు, which the inventory teaches',
    'ప్రజ': 'the singular of ప్రజలు, which the inventory teaches',
    'మార్పు': 'its count is "change", which Wiktionary files under మాఱ్పు; the entry left is "a kind of fish"',
    'లాగండి': 'an imperative, "pull!", filed as a noun',
    'గీతి': 'a literary word for "song", credited only with forms it shares',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.  `గాడిద` "donkey" is here because
# the subtitles' count is its use for "ass".
SWEARS = {'గాడిద', 'వెధవ', 'లంజ', 'ముండ'}


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
                # the common spelling of a word Wiktionary files under another (कुर्सी):
                # the card prints the spelling written here and the target's meanings
                via = L['alt_of']
                tgt = lex.get(via)
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            if via:
                seen.add(via)       # the spelling it points to is the same word (వద్ద, ఒద్ద)
            rows.append({'key': k, 'via': via, 'word': w if not via else L['word'], 'freq': L['freq'], 'pos': pos or '',
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    swears = {fold(s.replace('_', ' ')) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: -kv[1]['freq']):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if 'entries' not in L or L.get('formonly'):
            continue
        if k in seen or k in below or k in swears or k in excl:
            continue
        if len(k) < 2 and k not in ('ఈ', 'ఆ', 'ఏ'):     # this, that, which
            continue
        # a MULTI-WORD lemma (నాకు తెలుసు) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        # a lemma whose ONLY entries are phrases or proverbs belongs to the phrases deck
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        seen.add(k)
        fill.append({'key': k, 'via': '', 'word': L.get('spell', L['word']), 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
