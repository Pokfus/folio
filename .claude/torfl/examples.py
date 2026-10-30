#!/usr/bin/env python3
"""Three real Tatoeba sentences per note, matched on the note's whole paradigm.

Reads `selected-<level>.json`, `lex.json` and the three Tatoeba files; writes
`examples-<level>.json`: {note index: [{ru, en, hits}]}, where `hits` are the
token positions to bold.

MATCHED ON THE PARADIGM, NEVER ON THE HEADWORD'S LETTERS.  A Russian noun is
met in six cases and two numbers and a verb in some thirty forms; a sentence
matched on `книга` alone would miss `книгу` and `книги`, and one matched on a
prefix would take `книжный` (the adjective) -- the DELE audit's commonest fault,
an example showing a different word that shares the letters.  So a note's forms
are exactly the forms its Wiktionary paradigm lists (both verbs of an aspect
pair), folded (stress gone, ё -> е), and a sentence qualifies only by holding
one of them as a whole token.

A FORM ANOTHER WORD SHARES IS NOT EVIDENCE.  `стали` is "became" and "steel";
`мой` is "my" and "wash!"; `три` is "three" and "rub!".  A sentence whose only
hit is a form some other lemma also holds -- one at least a twentieth as common
as this note -- is not used for this note, since nothing on the card could say
which word the sentence shows.

WHICH THREE.  Short (four to ten words), plain (the other words common in
speech), never used for another note, and nothing violent, sexual or profane --
the filters the DELE batches had to add one by one, here from the start.  An
aspect pair's three show both verbs where the corpus allows.  Notes with the
fewest candidates choose first, so a rare word is not left with nothing because
a common one took its only sentence.

Tatoeba (tatoeba.org), CC BY 2.0 FR.
"""
import collections, json, math, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from russian import fold, tokens, paradigm
from torfl_level import f as lvlf

MIN_T, MAX_T, MAX_CHARS = 3, 10, 80

BAD_RU = {fold(w) for w in '''
убить убил убила убили убью убьёт убьют убийство убийца убийцы смерть смерти умереть умер умерла
умерли умру умрёт мёртв мёртвый мертвый труп трупа кровь крови секс сексом наркотики наркотик
пистолет пистолета застрелить застрелил стрелять повеситься самоубийство изнасилование
блядь бля хуй хуя пизда ебать ебал сука суки жопа жопу дерьмо говно чёрт черт проклятый
идиот идиотка дура дурак тупой ненавижу ненавидит голый голая пьяный пьяная
война войны бомба тюрьма тюрьме
'''.split()}
BAD_EN = re.compile(r"\b(kill\w*|murder\w*|dead|death|die[sd]?|dying|suicide|blood\w*|gun\w*|"
                    r"shoot\w*|shot|sex\w*|naked|drug\w*|drunk|fuck\w*|shit\w*|damn\w*|hell|"
                    r"bitch\w*|whore\w*|slut\w*|rape\w*|idiot\w*|stupid|hate[sd]?|war|bomb\w*|prison|jail|"
                    r"Tom|Mary|John|Alice)\b", re.I)
# The last names are Tatoeba's house characters: a third of its English sentences
# are about Tom and Mary, and a deck in which every third example is about Tom
# reads as a corpus artefact rather than as Russian.  They are not refused --
# only passed over while anything else is left (see `score`).
HOUSE = re.compile(r'\b(Tom|Mary|John|Alice|Том\w*|Мэри|Джон\w*|Алис\w*)\b')


def main():
    units = json.load(open(lvlf('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))

    # every folded form -> the lex entries holding it, and their frequencies
    holders = collections.defaultdict(set)
    for i, e in enumerate(lex):
        for w in [e['word']] + [x for x, _t in paradigm(e)]:
            x = fold(w)
            if ' ' not in x:
                holders[x].add(i)

    note_forms = []           # per note: {form: member index} for single words
    note_seq = []             # per note: token sequence, for a phrase
    for u in units:
        fs = {}
        seq = None
        for k, m in enumerate(u['entries']):
            e = lex[m]
            if ' ' in e['word']:
                seq = [fold(x) for x in tokens(e['word'])]
                continue
            for w in [e['word']] + [x for x, _t in paradigm(e)]:
                x = fold(w)
                if ' ' in x:
                    continue
                # A HEADWORD OWNS ITS OWN SPELLING (`хорошо` is the adverb, not
                # the short neuter of `хороший`; `в` the preposition, not the
                # volt), and an entry spelt the same as this one (`хлеб` bread,
                # `хлеб` grain) is the same word on the page.  Anything else that
                # holds the form, and is common enough to matter, disqualifies it.
                if x != fold(e['word']):
                    others = {o for o in holders.get(x, set()) - set(u['entries'])
                              if fold(lex[o]['word']) != fold(e['word'])}
                    if any(lex[o]['freq'] * 20 >= u['freq'] for o in others):
                        continue
                fs.setdefault(x, k)
        note_forms.append(fs)
        note_seq.append(seq)

    # ------------------------------------------------------------ corpus
    eng = {}
    for line in open('eng_sentences.tsv', encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) >= 3:
            eng[p[0]] = p[2]
    link = {}
    for line in open('rus-eng_links.tsv', encoding='utf-8'):
        a, b = line.split()[:2]
        if b in eng and (a not in link or int(b) < int(link[a])):
            link[a] = b
    count = collections.Counter()
    for line in open('ru_full.txt', encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and p[1].isdigit():
            count[fold(p[0])] += int(p[1])

    sents = []
    for line in open('rus_sentences_detailed.tsv', encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) < 3 or p[0] not in link:
            continue
        ru, en = p[2].strip(), eng[link[p[0]]].strip()
        if len(ru) > MAX_CHARS or re.search(r'[A-Za-z0-9]', ru):
            continue
        toks = tokens(ru)
        if not MIN_T <= len(toks) <= MAX_T:
            continue
        ft = [fold(t) for t in toks]
        if any(t in BAD_RU for t in ft) or BAD_EN.search(en):
            continue
        sents.append((ru, en, ft))
    print(f'  {len(sents)} usable sentence pairs')

    def score(ft, hit, ru, en):
        s = abs(len(ft) - 6) * 0.3
        for k, t in enumerate(ft):
            if k in hit:
                continue
            c = count.get(t, 0)
            s += 0 if c > 20000 else 0.5 if c > 3000 else 1.5 if c > 500 else 3
        if HOUSE.search(ru) or HOUSE.search(en):
            s += 2
        return s

    # candidates per note
    by_form = collections.defaultdict(list)
    for n, fs in enumerate(note_forms):
        for x in fs:
            by_form[x].append(n)
    cands = collections.defaultdict(list)
    for si, (ru, en, ft) in enumerate(sents):
        seen = set()
        for k, t in enumerate(ft):
            for n in by_form.get(t, ()):
                seen.add(n)
        for n in seen:
            hit = [k for k, t in enumerate(ft) if t in note_forms[n]]
            members = {note_forms[n][ft[k]] for k in hit}
            cands[n].append((score(ft, set(hit), ru, en), si, hit, members))
    for n, seq in enumerate(note_seq):
        if not seq:
            continue
        L = len(seq)
        for si, (ru, en, ft) in enumerate(sents):
            for a in range(len(ft) - L + 1):
                if ft[a:a + L] == seq:
                    hit = list(range(a, a + L))
                    cands[n].append((score(ft, set(hit), ru, en), si, hit, {0}))
                    break

    def near(si, hit, got):
        """Two of one note's sentences may not be one sentence twice -- `Не
        принимайте это на свой счёт` and `Не прими это на свой счёт`, or the same
        line in the masculine and the feminine.  More than half the words shared
        (folded, the hits aside) is the same sentence; a short pair sharing three of
        five words is one sentence twice too (`Дети и пьяные говорят правду` and
        `…не врут`, A2)."""
        # THE HITS ASIDE, AS THIS SAYS -- the code compared them too until the
        # phrases deck, where every pair of sentences holding one three-word
        # phrase looked like a duplicate and 233 of 484 notes went without one.
        def rest(si, hit):
            return {t for k, t in enumerate(sents[si][2]) if k not in hit}
        a = rest(si, hit)
        for c in got:
            b = rest(c[1], c[2])
            if len(a & b) * 2 >= min(len(a), len(b)) + 1:
                return True
        return False

    used, out = set(), {}
    order = sorted(range(len(units)), key=lambda n: len(cands.get(n, ())))
    for n in order:
        pool = sorted(cands.get(n, ()))
        got = []
        want_members = list(range(len(units[n]['entries'])))
        # first one per member (both verbs of a pair), then the best of the rest
        for m in want_members:
            for c in pool:
                if c[1] not in used and m in c[3] and c not in got and not near(c[1], c[2], got):
                    got.append(c)
                    used.add(c[1])
                    break
        for c in pool:
            if len(got) >= 3:
                break
            if c[1] not in used and not near(c[1], c[2], got):
                got.append(c)
                used.add(c[1])
        got.sort(key=lambda c: c[0])
        out[n] = [{'ru': sents[c[1]][0], 'en': sents[c[1]][1], 'hits': c[2]} for c in got[:3]]

    json.dump(out, open(lvlf('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    full = sum(1 for v in out.values() if len(v) == 3)
    none = [' / '.join(units[n]['words']) for n in range(len(units)) if not out.get(n)]
    print(f'  three sentences for {full} of {len(units)} notes; none for {len(none)}'
          + (': ' + ', '.join(none) if none else ''))


if __name__ == '__main__':
    main()
