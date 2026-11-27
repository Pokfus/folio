"""Small Swahili helpers shared by every stage of `.claude/swahili/`.

THE NORMAL FORM.  Swahili is written in the Latin alphabet with no diacritics,
so matching needs only two things: lower case, and ONE apostrophe -- `ng'ombe`
"cow" is written with a straight quote, a curly one or a backtick in running
text, and the apostrophe is part of the letter `ng'`, never punctuation.

THE VERB PARSER (`verb_prefixes`).  A Swahili verb is agglutinative --
`a-li-ki-soma` "she read it", `ha-tu-ta-soma` "we will not read",
`wa-na-o-soma` "those who read" -- so a subtitle list of word FORMS never says
`soma` at all for most of its uses.  The lemma frequency (`extract.py`) credits
a token to a verb when the token is one of the verb's stems with a VALID
prefix string in front of it, the prefix strings being generated here from the
subject, negative, tense, relative and object markers of standard Swahili.  It
is an approximation, stated as one: it knows no extensions (`somea`,
`someshwa` are lemmas of their own in Wiktionary) and it can be fooled by a
noun that happens to look like prefix + stem; a token several lemmas could
claim is split between them (`extract.py`).
"""
import itertools, re

APOS = re.compile(r"[’‘`´ʼ]")
WORD = re.compile(r"[a-z]+(?:'[a-z]+)*")


def norm(s):
    return APOS.sub("'", (s or '').strip().lower())


def is_sw(s):
    """A Swahili headword: Latin letters, an apostrophe, spaces or hyphens."""
    s = norm(s)
    return bool(s) and bool(re.fullmatch(r"[a-z' -]+", s)) and bool(re.search(r'[a-z]', s))


def tokens(text):
    return WORD.findall(norm(text))


# ---- the verb parser ------------------------------------------------------------------
SUBJ = ['ni', 'u', 'a', 'tu', 'm', 'mu', 'wa', 'ki', 'vi', 'i', 'zi', 'li', 'ya', 'ku', 'pa', 'yu']
NEG_SUBJ = ['si', 'hu', 'ha', 'hatu', 'ham', 'hamu', 'hawa', 'haki', 'havi', 'hai', 'hazi',
            'hali', 'haya', 'haku', 'hapa', 'hayu']
TENSE = ['na', 'li', 'ta', 'me', 'ki', 'nge', 'ngali', 'ka', 'sha']
NEG_TENSE = ['ku', 'ta', 'ja', 'nge', 'ngali']
REL = ['', 'ye', 'o', 'cho', 'vyo', 'yo', 'zo', 'lo', 'po', 'ko', 'mo']
OBJ = ['', 'ni', 'ku', 'm', 'mw', 'mu', 'tu', 'wa', 'ki', 'vi', 'i', 'zi', 'li', 'ya', 'u',
       'ji', 'pa', 'mw']


def verb_prefixes():
    """(prefix, final) pairs: the prefix strings a verb stem may follow, and the
    final vowel that prefix asks for ('a' = the stem as it stands, 'e' = the
    subjunctive, 'i' = the negative present).  A MONOSYLLABIC stem keeps `ku`
    under a tense marker (`nilikula`), so each tensed prefix also comes with
    `ku` after it; the caller uses those only for a short stem."""
    out = set()
    for s, t, r, o in itertools.product(SUBJ, TENSE, REL, OBJ):
        if r and t not in ('na', 'li', 'ta', 'ngali'):
            continue
        out.add((s + t + r + o, 'a'))
        if not o:
            out.add((s + t + r + 'ku', 'a'))
    for s, o in itertools.product(SUBJ, OBJ):
        out.add((s + o, 'e'))                      # subjunctive: nisome, umwone
        out.add(('hu' + o, 'a'))                   # habitual: husoma
    for s, t, o in itertools.product(NEG_SUBJ, NEG_TENSE, OBJ):
        out.add((s + t + o, 'a'))
    for s, o in itertools.product(NEG_SUBJ, OBJ):
        out.add((s + o, 'i'))                      # negative present: hasomi, sisomi
    for s, o in itertools.product(SUBJ, OBJ):
        out.add((s + 'si' + o, 'e'))               # negative subjunctive: usiseme
    for o in OBJ:
        out.add(('ku' + o, 'a'))                   # infinitive: kusoma, kumwona
        out.add(('kuto' + o, 'a'))
    return out


class VerbParser:
    """Reads a token as prefix + verb stem.  `add(lemma)` for each verb lemma, then
    `lemmas(token)` gives the verbs the token can be a form of."""

    def __init__(self):
        self.stems = {}                        # stem variant -> {(lemma, final kind)}
        self.prefixes = {}
        for p, kind in verb_prefixes():
            self.prefixes.setdefault(p, set()).add(kind)

    def add(self, k):
        if k.endswith('a'):
            variants = [(k, 'a'), (k[:-1] + 'e', 'e'), (k[:-1] + 'i', 'i')]
        else:
            # A LOAN VERB keeps its vowel in every form (fikiri, jibu), so its
            # subjunctive is indistinguishable from subject + stem -- which is also
            # how a class 1, 7 or 11 noun derived from it is spelt: `uhalifu`
            # "crime" and `mhalifu` "criminal" made `-halifu` "to disobey" an A1
            # verb.  A loan verb is credited only through a tense, `ku-` or a
            # negative, never the bare subjunctive.
            variants = [(k, 'a'), (k, 'i')]
        for v, kind in variants:
            self.stems.setdefault(v, set()).add((k, kind))

    def lemmas(self, tok):
        out = set()
        for i in range(1, len(tok) - 1):
            pre, rest = tok[:i], tok[i:]
            kinds = self.prefixes.get(pre)
            if not kinds or rest not in self.stems:
                continue
            for lem, kind in self.stems[rest]:
                if kind not in kinds:
                    continue
                # A MONOSYLLABIC stem (la, wa, ja, nywa) keeps ku- under a tense:
                # `nilikula`, never `nilila`; without the rule `-la` claimed every
                # token ending in "-la".
                if len(re.findall(r'[aeiou]', lem)) < 2 and not pre.endswith('ku'):
                    continue
                out.add(lem)
        return out


# ---- an agreeing word's table, class by class (the beginner pass, Nov 2026) -------------------
# Wiktionary's table (`sw-cl`) has a row for each pair of classes -- m-wa, m-mi, ji-ma, ki-vi,
# n -- and three locative cells after them.  kaikki flattens it to a list and DROPS a cell that
# repeats an earlier cell of the same column (`mzuri` stands for the m-wa singular and is not
# listed again for the m-mi singular), so the list is shorter than the table and its positions
# mean nothing on their own.  `extract.py` keeps the column of each form (`agree_t`), and the
# table is rebuilt here: a row's cell is the next form if it stands in that column, and
# otherwise the cell was dropped as a repeat.
CLASS_ROWS = ['m-wa', 'm-mi', 'ji-ma', 'ki-vi', 'n']


def class_cells(agree, cols):
    """{row: (first cell, second cell)} for the five class pairs, a cell None where the table
    cannot be read with certainty.  A DROPPED cell is a repeat of an earlier cell of its
    column, and it is filled only where one earlier cell can be meant:
      · the m-mi singular repeats the m-wa singular (the only cell before it);
      · the n singular repeats whichever earlier cell the n plural beside it spells
        (`kali`: n `kali · kali`, the ji-ma singular's spelling);
      · the ji-ma plural repeats the m-mi plural when it is not the m-wa plural's turn --
        a possessive's or the genitive's `ya`, which class 4 and class 6 share.
    A numeral's table has one column (`-moja` the first, `-tatu` the second): its cells are
    that column's, and the other is left empty."""
    if not agree or len(agree) != len(cols):
        return {}
    forms = list(agree)
    if cols == '00000111':
        # a plural numeral (-wili, -tatu ...): wa- mi- ma- vi- n-, then the three locatives
        return {r: (None, forms[i]) for i, r in enumerate(CLASS_ROWS)}
    if cols[0] != '1':
        return {}                                    # `kumi na moja` (000111): not this table
    if '0' not in cols:
        # a singular numeral (-moja): m-wa, [m-mi dropped], ji-ma, ki-vi, [n dropped], locatives
        if len(forms) == 5 and forms[2][:2] in ('ki', 'ch') and ' ' not in forms[0]:
            return {'m-wa': (forms[0], None), 'm-mi': (forms[0], None), 'ji-ma': (forms[1], None),
                    'ki-vi': (forms[2], None), 'n': (forms[1], None)}
        return {}
    i, out = 0, {}
    for row in CLASS_ROWS:
        pair = []
        for col in '10':
            if i < len(forms) and cols[i] == col:
                pair.append(forms[i])
                i += 1
            else:
                pair.append(None)                    # dropped as a repeat: filled below
        out[row] = pair
    if len(forms) - i > 3 or any(c != '1' for c in cols[i:]):
        return {}                                    # not the table this reads
    if out['m-mi'][0] is None:
        out['m-mi'][0] = out['m-wa'][0]
    if out['n'][0] is None and out['n'][1] in (out['m-wa'][0], out['m-mi'][0], out['ji-ma'][0], out['ki-vi'][0]):
        out['n'][0] = out['n'][1]
    if out['ji-ma'][1] is None and out['m-mi'][1] is not None and out['m-mi'][1] != out['m-wa'][1]:
        out['ji-ma'][1] = out['m-mi'][1]
    return {r: tuple(p) for r, p in out.items()}


# ---- a verb printed under its second infinitive (the beginner pass, Nov 2026) ------------------
# Wiktionary heads `-anza`, to begin, "infinitive kwanza" and lists `kuanza` beside it in the
# table.  `kwanza` is also "first" (`-a kwanza`, an A1 card of its own), and the three sentences
# the verb's card showed were all "first"; Tatoeba writes the verb `kuanza`, `alianza`.  The
# table's cells are built on the infinitive not used (`ninakwanza`, `-likwanza`) and are not
# shown.  The counts in lex.json are untouched: this is how the word is PRINTED and matched.
HEAD_INF = {'anza': 'kuanza'}


def infinitive(key, entry):
    """A verb's headword: its listed infinitive, `HEAD_INF`'s where one is named."""
    return HEAD_INF.get(key) or entry['inf']


def shown_forms(entry):
    """The agreeing forms a card SHOWS: the cells of the five class pairs.  The table's three
    locative cells are left out of the row and so of the sentences: `mwili` is the mu-class
    form of `-wili`, two, and is "body" in every sentence that has it."""
    return {x for pair in class_cells(entry['agree'], entry.get('agree_t', '')).values() for x in pair if x}
