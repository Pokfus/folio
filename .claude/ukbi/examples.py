#!/usr/bin/env python3
"""Three real Indonesian sentences for each word, with their English.

THREE SOURCES, IN ORDER OF HOW MUCH THEY CAN BE TRUSTED, and a word takes the
best three it can get.  Tatoeba (CC BY 2.0 FR) is a pair bank of everyday
sentences written and translated by people, and it is the first choice; it is
also small -- 28,192 Indonesian sentences, of which 22,008 carry an English
pair, against hundreds of thousands for Spanish -- so it runs out.  Measured
across the stack before anything was added: it covers 498 of level 1's 500
words and 404 of level 6's 2,500, because what a survival vocabulary needs is
exactly what a conversational pair bank has and an academic vocabulary is not.

  1. TATOEBA      human-written pairs, everyday register
  2. WIKTIONARY   the dictionary's own usage examples, carried through
                  `extract_kaikki.py`; the same source and the same CC BY-SA
                  4.0 as the definitions already on the card
  3. GLOBALVOICES human-translated news articles (CC BY 3.0), sentence-aligned
                  AUTOMATICALLY by OPUS

RAISING THE LENGTH CAP IS NOT THE ANSWER AND WAS MEASURED FIRST.  110 characters
already admits 99% of Tatoeba's Indonesian (p99 is 102), so the cap costs almost
nothing: lifting it to 150 recovers 55 words across the whole stack and lifting
it to 180 recovers 79, each of them a longer sentence on a card.  What is
missing is not long sentences, it is the words.

THE THIRD SOURCE IS LAST FOR A REASON AND THE REASON IS MEASURED.  OPUS aligns
Global Voices sentence by sentence with software rather than by hand, and
software drifts: reading thirty random pairs found one where the two sides were
different sentences from the same article -- both real, both fluent, and not
translations of each other.  A wrong English under a right Indonesian teaches a
wrong meaning, which is worse than teaching nothing, so it is reached ONLY where
the other two have nothing at all, which confines the risk to the words that
would otherwise have no example.  It is also filtered harder than the others
(see `gv_pairs`), and where several of its sentences carry the word the one
whose English contains the word's own dictionary gloss is preferred -- which is
a confirmation that the two sides really are about the same thing, and holds for
about half of them.

A SENTENCE MAY MATCH ANY MEMBER OF THE WORD'S AFFIX FAMILY, and that is the
point rather than a convenience.  The card for `melihat` teaches a lexeme whose
forms are `lihat`, `melihat` and `dilihat`; a sentence showing the passive is
showing the reader something the headword alone cannot, and Indonesian uses the
passive far more than English does.  So the three sentences are chosen to show
DIFFERENT members of the family where the corpus has them, which is the German
generator's rule about inflected forms carried over to a language that derives
rather than inflects.

...AND IT MAY CARRY A CLITIC, which is the same argument one suffix further on.
Indonesian writes `-ku`, `-mu` and `-nya` onto the end of the word, so a
sentence about `peradangannya` is a sentence about `peradangan` -- and a
whole-word match refuses it.  `select.py`'s `read_frequency` already strips
those for exactly this reason, and doing it here too recovers 72 words across
the stack.  The three are pure suffixes with no sound change, which is precisely
what the PREFIXES are not: nothing is stripped off the front anywhere in this
generator, because `meN-` assimilates and eats the root's first consonant.
"""
import json, re, collections

from ukbi_level import f as lvlf

MAX_LEN = 110          # characters; measured, not guessed -- see the header
MIN_LEN = 12
WANT = 3

# `-ku`, `-mu`, `-nya` written onto the word.  Only ever allowed AFTER the form,
# never before it, and only where what remains is long enough to be the word
# rather than a coincidence.
CLITIC = r'(?:ku|mu|nya)?'

# Source labels, kept on each row so the build can report where its sentences
# came from and a later reader can tell a hand-written pair from an
# automatically aligned one.
TATOEBA, WIKT, GV = 'tatoeba', 'wiktionary', 'globalvoices'


def token_rx(word):
    """Whole-word match, tolerant of the hyphen in a reduplication and of a
    possessive clitic on the end."""
    return re.compile(r'(?<![\w-])' + re.escape(word) + CLITIC + r'(?![\w-])',
                      re.I)


def load_tatoeba():
    ind = {}
    for line in open('ind_sent.tsv', encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) >= 3 and p[1] == 'ind':
            ind[p[0]] = p[2]
    links = collections.defaultdict(list)
    for line in open('ind_eng_links.tsv', encoding='utf-8'):
        p = line.split()
        if len(p) == 2:
            links[p[0]].append(p[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for line in open('eng_sent.tsv', encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) >= 3 and p[0] in want:
            eng[p[0]] = p[2]
    pairs = []
    for sid, txt in ind.items():
        if not (MIN_LEN <= len(txt) <= MAX_LEN):
            continue
        for e in links.get(sid, []):
            if e in eng:
                pairs.append((txt, eng[e]))
                break
    return pairs


def load_wiktionary(entries):
    """The dictionary's own examples, already filtered by `extract_kaikki`."""
    out = []
    seen = set()
    for e in entries:
        for s in e['s']:
            for t, en in s.get('ex') or []:
                if t not in seen:
                    seen.add(t)
                    out.append((t, en))
    return out


def rough_glosses(family, byword):
    """Every English word the dictionary uses about this family, roughly.

    DELIBERATELY CRUDE, and only ever used as a PREFERENCE.  `build_deck` does
    this properly -- dropping cross-references, following pointers, choosing
    between homographs -- and it runs after this stage, so its answer is not
    available here.  Reproducing it would be a second copy of a hundred lines
    that must then be kept in step.  What this feeds is a tie-break between
    several Global Voices sentences that all contain the word, where being
    roughly right raises the chance the two sides match and being wrong costs
    nothing but the ordering.
    """
    out = []
    for m in family:
        for e in byword.get(m, []):
            for s in e['s']:
                out.extend(s.get('glosses') or [])
    return ' '.join(out)


# Page furniture OPUS keeps: a headline carries the site's name, and a photo
# credit is a sentence about the photograph rather than about anything a reader
# is trying to learn.
GV_DROP = re.compile(r'· Global Voices|^Foto |^Gambar |^Cuplikan |^Digunakan dengan izin',
                     re.I)
GV_NUM = re.compile(r'\d[\d.,]*')


def gv_pairs():
    """Global Voices, filtered hard because its alignment is automatic.

    Each test is here because the corpus fails it somewhere.  A pair must be two
    complete sentences (OPUS keeps headlines and list fragments, which end on no
    stop); it must not carry a URL; the two sides must be within a factor of two
    in length, since a wild ratio is what a swallowed or duplicated line looks
    like; and where BOTH sides state a number they must state the same one,
    which is the cheapest reliable check on a shifted alignment -- a proper noun
    is not, because a translated one changes form (`Korea Utara` against `North
    Korea`, `Eropa` against `Europe`) and a rule keyed on those threw away 28%
    of the corpus of which almost all was correctly aligned.
    """
    try:
        ind = [l.strip() for l in open('gv.id', encoding='utf-8')]
        eng = [l.strip() for l in open('gv.en', encoding='utf-8')]
    except FileNotFoundError:
        return []
    if len(ind) != len(eng):
        raise SystemExit(f'globalvoices: {len(ind)} indonesian lines against '
                         f'{len(eng)} english -- the pair is unusable')
    out = []
    for i, e in zip(ind, eng):
        if not i or not e or GV_DROP.search(i) or GV_DROP.search(e):
            continue
        if 'http' in i or 'http' in e:
            continue
        if not (i.endswith(('.', '!', '?')) and e.endswith(('.', '!', '?'))):
            continue
        if not (MIN_LEN <= len(i) <= MAX_LEN) or len(i.split()) < 3:
            continue
        if not (0.5 <= len(e) / len(i) <= 2.0):
            continue
        # A LINE CUT MID-QUOTATION IS STILL A SENTENCE AND STILL LOOKS WRONG.
        # OPUS splits an article into lines and 1.5% of them open a quotation
        # that closes on the next one, so the card would show a dangling `“`
        # before the first word -- `“Al-Zaidi adalah seorang jurnalis.`  The
        # words are fine and the punctuation is debris, and there is no shortage
        # of alternatives, so they go.
        if any(i.count(a) != i.count(b) for a, b in (('(', ')'), ('“', '”'))):
            continue
        ni = {n.replace('.', '').replace(',', '') for n in GV_NUM.findall(i)}
        ne = {n.replace('.', '').replace(',', '') for n in GV_NUM.findall(e)}
        if ni and ne and not (ni & ne):
            continue
        out.append((i, e))
    return out


def index(pairs):
    """Inverted index on lowercased tokens, so each word is not swept over the
    whole corpus.  A clitic-carrying token is indexed under its stem too, or a
    sentence saying `peradangannya` would never be looked at for `peradangan`.
    """
    idx = collections.defaultdict(list)
    for i, (ind, _eng) in enumerate(pairs):
        toks = set(re.findall(r"[a-z]+(?:-[a-z]+)?", ind.lower()))
        for t in list(toks):
            m = re.match(r'(.+?)(?:ku|mu|nya)$', t)
            if m and len(m.group(1)) >= 3:
                toks.add(m.group(1))
        for t in toks:
            idx[t].append(i)
    return idx


def candidates(family, pairs, idx):
    """(form, index) for every sentence carrying any member of the family.

    Longest form first, so a sentence containing `melihat` is credited to
    `melihat` and not to the `lihat` inside it.
    """
    cands, seen = [], set()
    for form in sorted(family, key=len, reverse=True):
        head = form.split(' ')[0].lower()
        rx = token_rx(form)
        for i in idx.get(head, ()):
            if i in seen:
                continue
            if rx.search(pairs[i][0]):
                seen.add(i)
                cands.append((form, i))
    return cands


STOP = {'a', 'an', 'the', 'to', 'of', 'in', 'on', 'be', 'is', 'or', 'and',
        'for', 'that', 'with', 'used', 'as', 'it', 'one', 'from', 'by', 'at',
        'not', 'any', 'someone', 'something', 'which', 'who'}


def stems(text):
    """Crude 5-character stems, enough to see `give` in `given` and `giving`."""
    return {m[:5] for m in re.findall(r'[A-Za-z]{4,}', text.lower())
            if m not in STOP}


def pick(cands, pairs, want, prefer=None):
    """Up to `want` sentences: short ones first, a different family member each
    time where the corpus allows it, and `prefer` (a set of stems) satisfied
    first where it is given."""
    cands = sorted(cands, key=lambda c: len(pairs[c[1]][0]))
    if prefer:
        cands.sort(key=lambda c: 0 if (prefer & stems(pairs[c[1]][1])) else 1)
    picked, shown = [], set()
    for form, i in cands:
        if len(picked) >= want:
            break
        if form in shown and len(cands) > want:
            continue
        shown.add(form)
        picked.append((form, i))
    if len(picked) < want:                       # top up, repeats allowed
        have = {j for _f, j in picked}
        for form, i in cands:
            if len(picked) >= want:
                break
            if i not in have:
                picked.append((form, i))
                have.add(i)
    return picked


def main():
    wl = json.load(open(lvlf('wordlist.json'), encoding='utf-8'))
    words, fams = wl['words'], wl['families']
    entries = json.load(open(lvlf('wikt.json'), encoding='utf-8'))
    byword = collections.defaultdict(list)
    for e in entries:
        byword[e['w']].append(e)

    sources = [(TATOEBA, load_tatoeba()), (WIKT, load_wiktionary(entries)),
               (GV, gv_pairs())]
    built = [(name, ps, index(ps)) for name, ps in sources]

    out = {}
    stats = collections.Counter()
    for w in words:
        family = fams.get(w, [w])
        rows = []
        for name, pairs, idx in built:
            if len(rows) >= WANT:
                break
            # the gloss preference is for the automatically aligned source only:
            # it is a check that the two sides are about the same thing, and the
            # hand-written sources do not need one.
            prefer = stems(rough_glosses(family, byword)) if name == GV else None
            for form, i in pick(candidates(family, pairs, idx), pairs,
                                WANT - len(rows), prefer):
                ind, eng = pairs[i]
                rows.append({'id': ind, 'en': eng, 'form': form, 'src': name})
                stats[name] += 1
        out[w] = rows
        stats[min(len(rows), 3)] += 1
        if len({r['form'] for r in rows}) > 1:
            stats['multi-form'] += 1

    json.dump(out, open(lvlf('examples.json'), 'w', encoding='utf-8'),
              ensure_ascii=False)
    tot = sum(len(ps) for _n, ps in sources)
    print(f'    sentences: {tot} usable pairs '
          f'({len(sources[0][1])} tatoeba, {len(sources[1][1])} wiktionary, '
          f'{len(sources[2][1])} globalvoices); '
          f'{stats[3]} words with three, {stats[2]} with two, {stats[1]} with one, '
          f'{stats[0]} with none; {stats["multi-form"]} show more than one form '
          'of the word')
    print(f'      drawn from: {stats[TATOEBA]} tatoeba, {stats[WIKT]} wiktionary, '
          f'{stats[GV]} globalvoices')


if __name__ == '__main__':
    main()
