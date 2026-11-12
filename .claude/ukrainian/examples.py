#!/usr/bin/env python3
"""Three Tatoeba sentences for each word, matched on its forms.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json` and the Tatoeba exports
(`ukr_sentences.tsv`, `ukr-eng_links.tsv`, `eng_sentences.tsv`, CC BY 2.0 FR)
and writes `examples-<level>.json`: word key -> up to three
[Ukrainian, English, [matched tokens]] triples.

A sentence matches a word when one of its tokens is the word or a form in its
table (`роблю́`, `ро́бить` for `роби́ти`), compared through `uk.fold` (no stress,
no apostrophe, lower case).  A multi-word entry (будь ласка) matches its words
in sequence.  The choice is deterministic -- the headword's own spelling first,
then sentences of four to ten words, then the shorter, then the lower sentence
id -- so a re-run is byte-identical.  A sentence with several English
translations takes the shortest.  Each sentence is used at most once per deck.

A SENTENCE WITH A LETTER UKRAINIAN DOES NOT HAVE (ы э ъ ё) IS SKIPPED: Tatoeba
files a few Russian sentences under `ukr`.
"""
import csv, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uk import fold, nfc, tokens, NOT_UK
from ukrainian_level import LEVEL, f

csv.field_size_limit(10 ** 8)


def load():
    ukr = {}
    for row in csv.reader(open('ukr_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and not NOT_UK.search(row[2]):
            ukr[row[0]] = nfc(row[2])
    links = {}
    for row in csv.reader(open('ukr-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in ukr:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    pairs = []
    for uid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng), key=lambda s: (len(s), s))
        if en:
            pairs.append((int(uid), ukr[uid], en[0]))
    pairs.sort()
    return pairs


def forms_of(row, lex):
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    out = {fold(row['word'])}
    for e in L.get('entries', []):
        if row['pos'] and e['pos'] != row['pos']:
            continue
        for t in e['table']:
            if ' ' not in t['f']:
                out.add(fold(t['f']))
    return out


# THE PHRASES DECK ONLY: an expression that IS a verb (`ма́ти на ува́зі`) is matched with
# its last word in any form of that verb... and since a Ukrainian verb phrase usually puts
# the verb FIRST (`ма́ти рацію`, `да́ти ра́ду`), the verb word is whichever word is a verb
# lemma ending -ти / -тися, in any of its forms; every other word is matched as written.
# The level decks keep their exact matching, so they rebuild byte-identical.
def phrase_parts(row, lex):
    words = [fold(t) for t in tokens(row['word'])]
    alts = [{w} for w in words]
    L = lex.get(row['key'], {})
    if any(e['pos'] == 'verb' for e in L.get('entries', [])):
        for i, w in enumerate(words):
            if not (w.endswith('ти') or w.endswith('тися') or w.endswith('тись')):
                continue
            V = lex.get(w, {})
            if 'alt_of' in V:
                V = lex.get(V['alt_of'], {})
            for e in V.get('entries', []):
                if e['pos'] == 'verb':
                    alts[i] |= {fold(t['f']) for t in e['table'] if ' ' not in t['f']}
            if len(alts[i]) > 1:
                break
    return words, alts


# THE PHRASES DECK ONLY: a sentence that holds the expression's words in their LITERAL
# sense teaches the wrong thing on the card ("Вона має довгі руки та ноги" for "to be
# light-fingered"), so it is skipped for that expression.  Read off the first build.
LITERAL = {
    'нема за що': {'Нема за що вибачатися.'},
    'з іншого боку': {'Церква з іншого боку вулиці.',
                      'Пані, чоловік якої відомий вчений, підійшла з іншого боку.',
                      'Речі іноді бувають красивішими, коли дивишся на них з іншого боку.',
                      'Одні сусіди казали: «Ви — це не ви, а те ж саме, що ми. Тож ось вам наші '
                      'порядки, наші школи, наша мова, бо ваша мова така ж, як і наша, тільки ви '
                      'її зіпсували». Те ж саме казали сусіди з іншого боку, але тільки на свій лад.'},
    'є таке': {'У вас є таке саме, але більшого розміру?',
               'Для шляхетної людини ніщо не є таке важке, як пишний бенкет, особливо коли перші '
               'місця на ньому займають пустомудрі.'},
    'мати довгі руки': {'Вона має довгі руки та ноги.'},
    'христос народився': {'Христос народився у 1940 році до різдва Чака Норіса.'},  # a joke
    'дуже приємно': {'Мені було дуже приємно.', 'Було дуже приємно побачити тебе знов.',
                     'На цьому стільці дуже приємно сидіти.'},
    'в руках': {'У Тома в руках була сумка.'},
    'добрий день': {'У мене був дуже добрий день.'},
    'відкрити америку': {'Колумб відкрив Америку в 1492 році.',
                         'Христофор Колумб відкрив Америку в 1492 році.',
                         'Хто відкрив Америку?', 'Він відкрив Америку.'},
}


def seq_hit(ft, words, alts):
    n = len(words)
    for j in range(len(ft) - n + 1):
        if all(ft[j + k] in alts[k] for k in range(n)):
            return ft[j:j + n]
    return None


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    pairs = load()
    toks = [(pid, s, en, [fold(t) for t in tokens(s)]) for pid, s, en in pairs]
    index = {}
    for i, (_, _, _, ft) in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    used, out = set(), {}
    for row in rows:
        words = fold(row['word']).split()
        cands = []
        if LEVEL == 'phr' and len(words) > 1:
            pw, alts = phrase_parts(row, lex)
            first = sorted(alts[0])
            seen = set()
            for fm in first:
                for i in index.get(fm, []):
                    if i in seen:
                        continue
                    seen.add(i)
                    hit = seq_hit(toks[i][3], pw, alts)
                    if hit:
                        cands.append((i, 0, hit))
        elif len(words) > 1:
            for i in index.get(words[0], []):
                ft = toks[i][3]
                for j in range(len(ft) - len(words) + 1):
                    if ft[j:j + len(words)] == words:
                        cands.append((i, 0, words))
                        break
        else:
            forms = forms_of(row, lex)
            seen = set()
            for fm in sorted(forms):
                for i in index.get(fm, []):
                    if i in seen:
                        continue
                    seen.add(i)
                    hit = [t for t in toks[i][3] if t in forms]
                    cands.append((i, 0 if words[0] in hit else 1, hit))

        def rank(c):
            i, own, _ = c
            n = len(toks[i][3])
            return (own, 0 if 4 <= n <= 10 else 1, len(toks[i][1]), toks[i][0])
        picked = []
        skip = LITERAL.get(row['key'], ()) if LEVEL == 'phr' else ()
        for c in sorted(cands, key=rank):
            if c[0] in used or toks[c[0]][1] in skip:
                continue
            used.add(c[0])
            _, s, en, _ = toks[c[0]]
            picked.append([s, en, sorted(set(c[2]))])
            if len(picked) == 3:
                break
        out[row['key']] = picked
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    n3 = sum(1 for v in out.values() if len(v) == 3)
    n0 = sum(1 for v in out.values() if not v)
    print(f'  {len(pairs)} sentence pairs; three sentences for {n3} words, none for {n0}')


if __name__ == '__main__':
    main()
