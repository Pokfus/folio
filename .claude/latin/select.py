#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, each marked with where it came from (`inventory` or `frequency`).

THE ORDER the cards are dealt in: the word's rank in the DCC Latin Core
Vocabulary first (the commonest classical words first), then -- for the
inventory words the DCC list does not hold (`fēlēs`, `ientāculum`, `caeruleus`)
-- their lemma count over the Tatoeba corpus.  FROM B1 ON (`CORPUS_LEVELS`) the DCC
list runs out, and the words beyond it come, and are dealt, by their lemma count
over classical texts (`corpus.py`, `classical.json`), before the Tatoeba count.

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`latin_level.words_below`).

WHICH ENTRIES A ROW KEEPS (`canon`, `pos`): an inventory word written with its
macrons keeps the Wiktionary entries whose headword is spelt exactly so; a fill
word keeps the entries matching its DCC headword's spelling and part of speech.
So `mālum` is the apple and never the evil, and the fill's `cum` is the
preposition AND the conjunction, as the DCC list has both.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from la import fold, tidy, nfc
from latin_level import LEVEL, TARGET, CORPUS_LEVELS, f, words_below, load_lex
from inventory import INVENTORY

# Read off the rankings.  Each with its reason.
EXCLUDE = {
    # B1 (2026-11-12), the classical count
    'utque': 'ut + -que, not a word of its own',
    'sīquis': 'sī quis written as one word',
    'ulter': 'only the positive behind ulterior and ultimus; "that is beyond"',
    'īnsidia': 'the singular of īnsidiae, which the count also offers',
    'tueō': 'the active of tueor, which the count also offers',
    'spōns': 'used in the ablative sponte, which the count also offers',
    'quantusque': 'quantus + -que, not a word of its own',
    'pennus': 'a rare adjective "sharp", counted off the forms of penna',
    # B2 (2026-11-12)
    'animāns': 'a participle filed as a noun with no genitive; animal (A1) is the word',
    'inlāta': 'a form of īnferō filed as a lemma, with no English sense left',
    'imitō': 'the active of imitor (B1)',
    'misereō': 'the active of misereor (A2)',
    'quibuscum': 'quibus + cum written as one word',
    'lātius': 'the comparative of lātē, glossed "lately"',
    'tenus': 'only "a stretched cord" here; the preposition "as far as" is not a lemma Wiktionary files',
    'minima': 'the medieval musical note',
    'pēnis': 'on a level deck; "tail" is cauda',
    'carinus': 'a rare "nut-brown", counted off the forms of carīna',
    'adgressus': 'the participle of aggredior, which the count also offers',
    'cora': 'a rare Greek "pupil of the eye", counted off the forms of cor',
    'ānus': '"ring" or "anus"; the common anus "old woman" is another word',
    'cohortō': 'the active of cohortor (B1)',
    'mōliō': 'the active of mōlior',
    'pessimō': 'a rare "to ruin", counted off the forms of pessimus',
    'citer': 'only the positive behind citerior and citimus',
    'nuo': 'a fragment of adnuō and abnuō',
    'uo': 'a fragment of induō and exuō',
    'bēluus': 'a rare adjective; the noun bēlua is the word',
    'aquilus': 'a rare "dark-coloured", counted off the forms of aquila',
    'dēlicia': 'a builder\'s beam; the word is the plural dēliciae',
    'sexus': 'on a level deck its one sense is dropped, leaving "division"',
    'ocellus': 'only "darling" here',
}


def shadow_of(L):
    """The folds of every form a lemma's tables and head lines print -- a corpus word
    spelt as one is that lemma's form (`oblītus`: `oblīvīscor`), not a word to teach."""
    out = set()
    for e in L['entries']:
        for row in e['table'] + e['head']:
            for w in row['f'].split():
                k = fold(w.strip(',;'))
                out.add(k)
                if k.endswith('um'):
                    out.add(k[:-2] + 'us')
    return out


def usable(L, canon=None):
    for e in L['entries']:
        if canon and e['canon'] not in canon:
            continue
        if any(not g['weak'] for g in e['glosses']):
            return True
    return False


def main():
    lex = load_lex()
    cls = {}
    if LEVEL in CORPUS_LEVELS:
        cls = json.load(open('classical.json', encoding='utf-8'))['counts']
    below = words_below()
    rows, seen, missing, loose = [], set(), [], []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = nfc(w.replace('_', ' '))
            k = fold(w)
            if k in seen or k in below:
                continue
            L = lex.get(k)
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            exact = [e['canon'] for e in L['entries'] if e['canon'] == w]
            if not exact:
                loose.append(f"{w} ({'/'.join(sorted({e['canon'] for e in L['entries']}))})")
            if not usable(L, exact or None):
                missing.append(item + ' (only weak senses)')
                continue
            seen.add(k)
            rows.append({'key': k, 'word': exact[0] if exact else L['word'], 'canon': exact[:1],
                         'pos': pos or '', 'dccpos': sorted({p for _, _, p in L['dcc_rows'] if p}),
                         'source': 'inventory', 'topic': topic,
                         'dcc': L['dcc'], 'tat': L['tat'], **({'cls': cls.get(k, 0)} if cls else {})})
    n_inv = len(rows)
    excl = {fold(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(((k, L) for k, L in lex.items() if L['dcc']), key=lambda kv: kv[1]['dcc']):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if k in seen or k in below or k in excl or ' ' in k:
            continue
        heads = [tidy(h.split()[0].rstrip(',')) for _, h, _ in L['dcc_rows']]
        canon = sorted({e['canon'] for e in L['entries'] if e['canon'] in heads})
        dpos = sorted({p for _, _, p in L['dcc_rows'] if p})
        if not usable(L, canon or None):
            continue
        # THE DCC ROW MUST BE THIS LEMMA: "ā ab abs" (preposition) is filed under its
        # first spelling, and Wiktionary's `ā` is the letter and an interjection
        if dpos and not any(e['pos'] in dpos for e in L['entries']):
            continue
        seen.add(k)
        fill.append({'key': k, 'word': canon[0] if canon else L['word'], 'canon': canon,
                     'pos': '', 'dccpos': dpos, 'source': 'frequency', 'topic': '',
                     'dcc': L['dcc'], 'tat': L['tat'], **({'cls': cls.get(k, 0)} if cls else {})})
    n_dcc = len(fill)
    # BEYOND THE DCC LIST: the commonest remaining lemmas of the classical count.  A
    # candidate spelt as a form of a word taught below or chosen here is that word's
    # form; the forms of each chosen word join the shadow as it is chosen, and the
    # whole pass is repeated until no chosen word is another's form.
    if cls:
        base = set()
        for k in below | seen:
            if k in lex:
                base |= shadow_of(lex[k])
        drop = set()
        while True:
            shadow, extra = set(base), []
            for k, c in sorted(cls.items(), key=lambda kv: (-kv[1], kv[0])):
                if len(rows) + len(fill) + len(extra) >= TARGET[LEVEL]:
                    break
                L = lex.get(k)
                if (not L or L['dcc'] or k in seen or k in below or k in excl or k in drop
                        or ' ' in k or k in shadow or not usable(L)):
                    continue
                extra.append({'key': k, 'word': L['word'], 'canon': [], 'pos': '', 'dccpos': [],
                              'source': 'corpus', 'topic': '', 'dcc': 0, 'tat': L['tat'], 'cls': c})
                shadow |= shadow_of(L) - {k}
            late = {r['key'] for r in extra} & shadow
            if not late:
                break
            drop |= late
        fill += extra
        seen |= {r['key'] for r in extra}
    rows += fill
    if cls:
        rows.sort(key=lambda r: (r['dcc'] or 10 ** 6, -r['cls'], -r['tat'], r['key']))
    else:
        rows.sort(key=lambda r: (r['dcc'] or 10 ** 6, -r['tat'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {n_dcc} from the DCC list'
          + (f', {len(fill) - n_dcc} from the classical count' if cls else ''))
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))
    if loose:
        print('  MATCHED ONLY WITHOUT MACRONS (check the spelling):', '; '.join(loose))


if __name__ == '__main__':
    main()
