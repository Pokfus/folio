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
