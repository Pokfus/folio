#!/usr/bin/env python3
"""Choose the level's words.

WHERE THE WORDS COME FROM, and this is the honest half of the whole generator.

**UKBI PUBLISHES NO VOCABULARY LIST.**  It is a proficiency test, not a
syllabus: it reports a score from 251 to 800 and a predicate from Terbatas to
Istimewa, and the Badan Pengembangan dan Pembinaan Bahasa publishes descriptors
of what a candidate at each predicate can DO, never a list of the words they are
expected to know.  Neither does BIPA -- Permendikbud No. 27/2017 sets the
Standar Kompetensi Lulusan for the seven BIPA levels, and it too is written in
competences rather than in words.  This was checked before anything was built,
because the alternative was to imply an official list that does not exist.

That is a real difference from the sibling decks on this shelf.  The Goethe
decks read the exam board's own printed Wortliste, and the DELE decks read the
Instituto Cervantes' Plan curricular inventories -- in both, the exam board
chooses the vocabulary and the generator only has to read it.  Here nobody has
chosen it, so this file chooses it, and the deck's own description says outright
that it does.  What keeps that from being arbitrary is that the two inputs are
both stated:

  · the level's SCOPE is UKBI's own descriptor -- Terbatas is "berkomunikasi
    untuk keperluan sintas", survival communication -- which is what
    `supplement.py` is an inventory of;
  · the ORDER, and the fill up to the target, is corpus frequency, so that the
    words a learner meets most often come first.

THE CASCADE, in order.  Every step below was measured on the real data before it
was written, and the measurements are in the comments where they bite.
"""
import json, re, collections

from ukbi_level import LEVEL, f as lvlf, TARGET, words_below
from build_deck import meanings   # one implementation of "has this a meaning?"
import supplement

# --------------------------------------------------------------- the classes
# A part of speech that is not a word a deck can teach.  `root` is Wiktionary's
# own tag for a bare Indonesian/Malay root that occurs only affixed.
NOT_A_WORD = {'name', 'prefix', 'suffix', 'infix', 'interfix', 'circumfix',
              'root', 'character', 'punct', 'symbol'}

# TAGS THAT MARK A FORM AS OUTSIDE THE STANDARD LANGUAGE.  UKBI tests bahasa
# baku, so these do not earn a card.
#
# `informal` AND `colloquial` ARE NOT THE SAME THING HERE, and getting that
# wrong costs the deck its most important pronouns.  `kamu` and `aku` are tagged
# `informal`: they are the familiar register OF the standard language, they are
# in the KBBI, they are taught in the first lesson of every BIPA course and they
# are the first and thirty-first commonest words in the corpus.  `nggak`, `gue`
# and `banget` are tagged `colloquial`/`Jakarta`/`alt-of`: they are a different
# variety, and UKBI marks them wrong.  So `informal` is kept and the rest are
# dropped -- measured, the narrow rule drops 584 words of the 50,000 and the
# blanket one would additionally have taken `kamu`, `aku`, `saya` and `Anda`.
NONSTANDARD = {'alt-of', 'slang', 'Jakarta', 'nonstandard', 'misspelling',
               'abbreviation', 'contraction', 'archaic', 'obsolete',
               'dialectal', 'colloquial', 'rare', 'ellipsis', 'poetic'}

# A head-template type that says outright "this entry is a form of something".
DERIVED_HT = {'verbf', 'verb form', 'nounf', 'noun form', 'adjf', 'adj form'}

# The relation a gloss states.  Split in two, because the two behave differently
# and merging them would put a plural on the front of a card:
#   INFLECTIONAL -- `anak-anak` is the plural of `anak`, `seorang` the singular
#     of `orang`.  These join their base's family and may NEVER be its headword.
#   DERIVATIONAL -- `melihat` is the active of `lihat`.  These join the family
#     AND may be its headword, because in Indonesian the affixed verb is very
#     often the form a learner actually meets: `mengerti` is used 47,243 times
#     in the corpus against nineteen for its root `erti`, which is Malay and is
#     not Indonesian at all.
REL_INFLECTIONAL = re.compile(
    r'^(?:plural|singular form|alternative form|alternative spelling|'
    r'alternative letter-case form|contraction|abbreviation|ellipsis|'
    r'nonstandard form|informal form|misspelling|inflection)\s+of\s+([\w\- ]+)')
REL_DERIVATIONAL = re.compile(
    r'^(?:active|passive|actor focus|patient focus|accidental passive|'
    r'infinitive, imperative and colloquial|basic/imperative[\w/]*)\s+of\s+([\w\- ]+)')

# A LABEL IN THE id-verb PARADIGM THAT NAMES THE BASE.  The template writes
# label/value pairs and the labels vary between entries, so they are matched
# rather than indexed.
BASE_LABEL = re.compile(r'imperativ|^base|^basic|root', re.I)

# How a paradigm label or a relation gloss is said on the card.  Wiktionary's
# own wording is for lexicographers -- `basic-imperative-informal`,
# `accidental passive` -- and the deck is for a beginner, so each is reduced to
# the one word that says what the form DOES.  An unrecognised label is kept as
# it stands rather than dropped, and the run prints it, so a new one arrives
# visibly instead of silently losing a form.
LABEL_MAP = [
    (re.compile(r'imperativ|^base|^basic|root|infinitive', re.I), 'root'),
    (re.compile(r'accidental', re.I), 'accidental'),
    (re.compile(r'active|actor focus', re.I), 'active'),
    (re.compile(r'passive|patient focus', re.I), 'passive'),
    (re.compile(r'plural|reduplicat', re.I), 'plural'),
    (re.compile(r'singular', re.I), 'singular'),
    (re.compile(r'jussive|emphatic', re.I), 'emphatic'),
    (re.compile(r'superlative', re.I), 'superlative'),
    (re.compile(r'comparative', re.I), 'comparative'),
]
# the order forms are shown in, whatever order the source lists them
LABEL_ORDER = ['root', 'active', 'passive', 'accidental', 'emphatic', 'plural',
               'singular', 'comparative', 'superlative']


def say_label(lab):
    for rx, out in LABEL_MAP:
        if rx.search(lab):
            return out
    return lab.replace('-', ' ').strip().lower()

# ------------------------------------------------------- hand-checked overrides
# Measured false positives.  Each is here because the rules above get it wrong
# and the reason is written beside it; this is the same escape hatch the German
# generator's FORCE_POS and the Spanish one's AUTHORED table are.
EXCLUDE = {
    # `kan` is the tag-question particle and the `-kan` suffix, which is where
    # all of its corpus frequency comes from.  Its only surviving dictionary
    # senses are a rare noun ("jug, pot") and an apheretic form of `bukan`, so
    # a card for it would teach a beginner the word for a jug on the strength of
    # a particle's frequency.
    'kan',
    # same shape: the frequency belongs to the clitics, the surviving senses do
    # not.  `ku` survives as "Ang ku kueh, a Chinese sweet dumpling".
    'ku', 'mu', 'nya',
    # `dr` / `tn` / `s` are subtitle abbreviations that happen to have entries.
    'dr', 'tn', 's',
}

KEEP = {
    # `kereta` is the everyday word for a train and the rules drop it, because
    # the dictionary files it as an ellipsis of `kereta api`.  That is true and
    # it is still the word on the front of the train.
    'kereta',
}


# --------------------------------------------------------------- the dictionary
def load():
    ents = json.load(open(lvlf('wikt.json'), encoding='utf-8'))
    byword = collections.defaultdict(list)
    for e in ents:
        byword[e['w']].append(e)
    return byword


def sense_tags(s):
    return set(s.get('tags') or [])


def entry_nonstandard(e):
    """True when EVERY sense of the entry is outside the standard language.

    Every sense, not the first -- which is the fault the first cut of this had.
    `bumi`, `kereta`, `pasukan`, `ratu` and `tangkap` all open on an alt-of or an
    ellipsis and carry the ordinary meaning further down, and a rule reading
    `senses[0]` threw all five out along with `Anda` and `kamu`.
    """
    return all(sense_tags(s) & NONSTANDARD for s in e['s'])


def entry_relation(e, word, byword):
    """(base, kind) this entry is a form of, or (None, None).

    kind is 'infl' or 'deriv'.  A base that is not itself in the dictionary is
    not a base at all -- Wiktionary occasionally names one that has no entry
    (`mulai` is glossed "basic/imperative/intransitive/colloquial of me"), and
    merging into it would lose the word entirely.
    """
    for s in e['s']:
        for b in (s.get('form_of') or []):
            if b != word and b in byword:
                t = sense_tags(s)
                kind = 'infl' if (t & {'plural', 'singular', 'form-of'}) else 'deriv'
                return b, kind
        g = (s.get('glosses') or [''])[0]
        for rx, kind in ((REL_INFLECTIONAL, 'infl'), (REL_DERIVATIONAL, 'deriv')):
            m = rx.match(g)
            if m:
                b = m.group(1).strip().split(' ')[0]
                if b != word and b in byword:
                    return b, kind
    if e.get('ht') in DERIVED_HT:
        for lab, val in e.get('pairs') or []:
            if val != word and val in byword and BASE_LABEL.search(lab):
                return val, 'deriv'
    return None, None


def classify(word, byword):
    """(state, base, kind) for a word.

    state is one of: 'notword', 'nonstandard', 'derived', 'headword'.

    A WORD WITH ANY LIVE ENTRY OF ITS OWN IS A HEADWORD, whatever else it also
    is, and that single line is what saves `mereka`.  `mereka` carries two
    entries -- the third-person plural pronoun, and a verb form glossed "active
    of reka" -- and a rule that merged on the existence of any derived entry
    would have filed the pronoun `they` under the root `reka`, "to devise", and
    deleted the commonest plural pronoun in the language from a beginners' deck.
    Measured on the top 1,500: 128 words carry a derived reading, and eleven of
    them also carry an unrelated live one.
    """
    ents = [e for e in byword.get(word, []) if e['pos'] not in NOT_A_WORD]
    if not ents:
        return 'notword', None, None
    live = [e for e in ents if not entry_nonstandard(e)]
    if not live:
        return 'nonstandard', None, None
    rels = [entry_relation(e, word, byword) for e in live]
    if all(b for b, _ in rels):
        base, kind = rels[0]
        # a form that is inflectional in EVERY reading is inflectional
        kind = 'deriv' if any(k == 'deriv' for _, k in rels) else 'infl'
        return 'derived', base, kind
    return 'headword', None, None


# ------------------------------------------------------------------ frequency
CLITIC = re.compile(r'^(.{3,}?)(ku|mu|nya)$')


def read_frequency(byword):
    """The corpus counts, folded onto dictionary words.

    TWO NORMALISATIONS, both of which recover counts that would otherwise be
    lost, and both of which are safe in a way that stripping `meN-` is not.

    · THE CLITICS.  Indonesian writes the possessive and object clitics onto the
      word: `ayahku` (my father), `padamu` (to you), `melihatnya` (to see it).
      A surface-frequency list counts each as a word of its own, and 342 of the
      top 1,500 are absent from the dictionary largely because of it.  Stripping
      them is mechanical and reversible -- they are pure suffixes with no sound
      change -- which is exactly what `meN-` is not: `menulis` drops the `t` of
      `tulis` and `menanti` keeps the `n` of `nanti`, so no rule can undo that
      prefix without a dictionary, and this generator never tries.  Affix
      families are read from the dictionary instead.

    · CASE.  The frequency list is lowercased and several headwords are not:
      `Anda`, `Senin`, `Januari`, `Indonesia`.  The count is looked up
      case-insensitively, so the capitalised headword is ranked on the real
      frequency of its lowercase surface rather than on nothing.
    """
    raw = {}
    for line in open('id_50k.txt', encoding='utf-8'):
        p = line.split()
        if len(p) == 2:
            raw[p[0]] = raw.get(p[0], 0) + int(p[1])
    folded = collections.Counter()
    for w, c in raw.items():
        if w in byword:
            folded[w] += c
            continue
        m = CLITIC.match(w)
        if m and m.group(1) in byword:
            folded[m.group(1)] += c
            continue
        for p in ('ku', 'kau'):
            if w.startswith(p) and len(w) - len(p) >= 3 and w[len(p):] in byword:
                folded[w[len(p):]] += c
                break
        else:
            folded[w] += c
    # case-insensitive view, so `Anda` can be ranked on `anda`
    lower = collections.Counter()
    for w, c in folded.items():
        lower[w.lower()] += c
    return folded, lower


TOKEN = re.compile(r"[a-z]+(?:-[a-z]+)?")


def estimate_phrases(byword, lower):
    """A frequency for the multi-word entries, calibrated onto the same scale.

    A PHRASE CANNOT APPEAR IN A SEGMENTED FREQUENCY LIST AT ALL, so every one of
    them scores zero and sorts last -- which put `terima kasih`, `selamat pagi`
    and `apa kabar` at the very bottom of a survival deck, behind `sialan`.  They
    are among the first things anybody learns to say.

    THE OBVIOUS FALLBACK IS WRONG and the Spanish generator has already measured
    why: giving a phrase the rank of its rarest component is a true ceiling on
    how often it can be said and a hopeless estimate of it, because a phrase
    built out of very common words gets a very high one.  `terima kasih` would
    inherit the count of `terima`.

    So the phrases are COUNTED in the Tatoeba corpus this pipeline already
    downloads for its example sentences, and that count is calibrated onto the
    subtitle scale through the single words, which carry both.  The factor is the
    MEDIAN ratio rather than the mean, so that one word whose two corpora
    disagree wildly -- and film subtitles and a sentence bank disagree about
    plenty -- cannot drag the whole scale with it.
    """
    grams = collections.Counter()
    for line in open('ind_sent.tsv', encoding='utf-8'):
        p = line.split('\t')
        if len(p) < 3:
            continue
        toks = TOKEN.findall(p[2].lower())
        grams.update(toks)
        grams.update(' '.join(toks[i:i + 2]) for i in range(len(toks) - 1))
        grams.update(' '.join(toks[i:i + 3]) for i in range(len(toks) - 2))
    ratios = sorted(lower[w] / grams[w] for w in grams
                    if ' ' not in w and grams[w] >= 20 and lower.get(w, 0) > 0)
    if not ratios:
        return {}, 0.0
    factor = ratios[len(ratios) // 2]
    est = {}
    for w in byword:
        if ' ' in w:
            c = grams.get(w.lower(), 0)
            if c:
                est[w] = int(c * factor)
    return est, factor


# ------------------------------------------------------------------- families
def family_forms(head, members, byword, state):
    """The affix family as [[form, label], ...], for the card's forms row.

    THIS IS INDONESIAN'S ANSWER TO A CONJUGATION TABLE, and it is the one thing
    a vocabulary card in this language most has to carry.  Indonesian marks no
    tense, no person and no number, so there is no paradigm to print -- what
    there is instead is a family of affixed words around a root, and knowing
    `lihat` without knowing that `melihat` is how you say it and `dilihat` is
    how it is said of you leaves a learner unable to read a sentence.

    The labels come from the dictionary's own id-verb paradigm where the entry
    has one, and from the relation stated in the gloss otherwise, so nothing
    here is derived by stripping affixes.  That matters: `meN-` assimilates and
    deletes the root's first consonant, so `menulis` is `tulis` but `menanti` is
    `nanti`, and no rule can tell those apart without a dictionary.
    """
    seen, out = {}, []
    for m in members:
        for e in byword.get(m, []):
            for lab, val in e.get('pairs') or []:
                if val in members or val == head:
                    l = say_label(lab)
                    if val not in seen:
                        seen[val] = l
    for m in members:
        if m in seen:
            continue
        for e in byword.get(m, []):
            for s in e['s']:
                g = (s.get('glosses') or [''])[0]
                mm = REL_INFLECTIONAL.match(g) or REL_DERIVATIONAL.match(g)
                if mm:
                    seen[m] = say_label(g[:mm.start(1)])
                    break
            if m in seen:
                break
    # AN UNLABELLED MEMBER THAT STANDS ON ITS OWN IS THE ROOT.  The paradigm
    # never labels its own base -- `ambil`'s template names the active and the
    # passive and says nothing about `ambil` -- so the root would otherwise be
    # the one form on the card with no label against it.
    for m in members:
        if m not in seen and state.get(m, ('',))[0] == 'headword':
            seen[m] = 'root'
    for m in members:
        seen.setdefault(m, '')
    for m in members:
        out.append([m, seen.get(m, '')])
    out.sort(key=lambda r: (LABEL_ORDER.index(r[1]) if r[1] in LABEL_ORDER
                            else len(LABEL_ORDER), r[0]))
    return out


class Union:
    def __init__(self):
        self.p = {}

    def find(self, a):
        self.p.setdefault(a, a)
        while self.p[a] != a:
            self.p[a] = self.p[self.p[a]]
            a = self.p[a]
        return a

    def join(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.p[ra] = rb


def main():
    byword = load()
    folded, lower = read_frequency(byword)
    phrase_est, factor = estimate_phrases(byword, lower)
    for p, c in phrase_est.items():
        lower[p.lower()] = max(lower.get(p.lower(), 0), c)
    freq = lambda w: lower.get(w.lower(), 0)

    # every word the dictionary knows, so the supplement can be resolved
    json.dump(sorted(byword), open(lvlf('known.json'), 'w'), ensure_ascii=False)
    supp_items, supp_missing = supplement.candidates(set(byword))
    supp = []
    seen = set()
    for w, _sec in supp_items:
        if w not in seen:
            seen.add(w)
            supp.append(w)

    # ---- classify every word that has any corpus presence, plus the supplement
    universe = set(w for w in byword if freq(w) > 0) | set(supp)
    state = {}
    for w in universe:
        state[w] = classify(w, byword)

    # ---- union the derived forms onto their bases
    #
    # THE RELATION POINTS BOTH WAYS IN THE SOURCE, which is why this is a
    # union-find and not a walk.  `mengirim`'s paradigm names `kirim` as its
    # base, and `kirim`'s own entry is glossed "infinitive, imperative and
    # colloquial of mengirim" -- a two-element cycle.  Chains occur too
    # (`kata` -> `katakan` -> `mengatakan`).  Union-find flattens both without
    # having to decide which direction is the true one, and the headword is then
    # chosen from the whole family on evidence rather than on the arrow.
    uf = Union()
    pending = list(state.items())
    while pending:
        w, (st, base, _k) = pending.pop()
        if st == 'derived' and base:
            uf.join(w, base)
            # a base may itself be derived (`kata` -> `katakan` -> `mengatakan`)
            # and may be outside the corpus universe entirely, so it is
            # classified and queued rather than assumed to be a root
            if base not in state:
                state[base] = classify(base, byword)
                pending.append((base, state[base]))
    fam = collections.defaultdict(set)
    for w in state:
        fam[uf.find(w)].add(w)

    # ---- pick each family's headword
    #
    # The most frequent member that may hold the front of a card: not
    # inflectional (a plural is never a headword), not outside the standard
    # language, and a word at all.  Ties and empties fall back to the base.
    heads = {}
    for root, members in fam.items():
        elig = []
        for m in members:
            st, _b, kind = state.get(m, ('notword', None, None))
            if st in ('notword', 'nonstandard'):
                continue
            if st == 'derived' and kind == 'infl':
                continue
            elig.append(m)
        if not elig:
            continue
        head = max(elig, key=lambda m: (freq(m), -len(m), m))
        heads[root] = head

    # ---- the ranked pool
    #
    # A WORD WHOSE WHOLE FAMILY ONLY EVER POINTS AT ANOTHER WORD IS NOT CHOSEN.
    # `memberitahu` is glossed "to inform" nowhere: every sense of it and of its
    # relatives is a cross-reference, so the card would have carried a headword,
    # a forms row, three sentences and no definition.  `build_deck.py` refuses to
    # write such a card -- and refusing it THERE leaves the level short, because
    # the count has already been struck.  So the same test is applied here, where
    # a refusal costs nothing but the next word in the ranking.
    pool = []
    for root, head in heads.items():
        if head in EXCLUDE:
            continue
        st = state.get(head, ('notword',))[0]
        if st in ('notword', 'nonstandard') and head not in KEEP:
            continue
        if not meanings(head, sorted(fam[root]), byword):
            continue
        total = sum(freq(m) for m in fam[root])
        pool.append((head, total, sorted(fam[root])))
    pool.sort(key=lambda r: (-r[1], r[0]))

    below = words_below()
    pool = [r for r in pool if r[0] not in below]

    # ---- the level: the supplement first, then frequency up to the target
    supp_heads = []
    for w in supp:
        h = heads.get(uf.find(w), w)
        if h not in supp_heads and h not in below and h not in EXCLUDE:
            supp_heads.append(h)
    chosen = list(supp_heads)
    have = set(chosen)
    for head, _t, _m in pool:
        if len(chosen) >= TARGET[LEVEL]:
            break
        if head not in have:
            have.add(head)
            chosen.append(head)

    # ordered by frequency for output, so the commonest words come first
    chosen.sort(key=lambda w: -freq(w))
    fams = {w: sorted(fam[uf.find(w)]) for w in chosen}
    labelled = {w: family_forms(w, fams[w], byword, state) for w in chosen}

    json.dump({'words': chosen, 'families': fams, 'forms': labelled,
               'freq': {w: freq(w) for w in chosen}},
              open(lvlf('wordlist.json'), 'w', encoding='utf-8'), ensure_ascii=False)

    # ------------------------------------------------------------- the numbers
    st_count = collections.Counter(s for s, _b, _k in state.values())
    from_supp = len([w for w in supp_heads if w in have])
    phr = [w for w in chosen if ' ' in w]
    print(f'    dictionary {len(byword)} words; corpus universe {len(universe)}')
    print(f'    phrases: {len(phrase_est)} estimated at x{factor:.1f} off the '
          f'sentence corpus, {len(phr)} of them chosen')
    for k, v in st_count.most_common():
        print(f'      {v:6d}  {k}')
    print(f'    families {len(fam)}; multi-word families '
          f'{sum(1 for m in fam.values() if len(m) > 1)}')
    print(f'    chose {len(chosen)} of a target {TARGET[LEVEL]}: '
          f'{from_supp} from the survival inventory, '
          f'{len(chosen) - from_supp} by frequency')
    if supp_missing:
        print(f'    supplement items the dictionary does not carry '
              f'({len(supp_missing)}): '
              + ', '.join(f'{w}[{s}]' for w, s in supp_missing))
    if len(chosen) < TARGET[LEVEL]:
        raise SystemExit(f'    SHORT: {len(chosen)} words for a target of '
                         f'{TARGET[LEVEL]} -- the pool has run out')


if __name__ == '__main__':
    main()
