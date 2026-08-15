#!/usr/bin/env python3
"""Choose this level's words from the validated pool, and order them.

WHICH words the level teaches and WHAT ORDER they come in are two questions, and
only the first is answered by the cascade.  That cascade exists to stop the
closed classes and the verbs competing with nouns on raw frequency -- a 500-word
A1 list without `eu` and `tu` is not an A1 list -- so it deliberately does NOT
rank the list as a whole.  The chosen words are then re-sorted for OUTPUT, most
frequent first, and nothing about the selection moves.

THE ORDER IS FREQUENCY IN EUROPEAN PORTUGUESE, from the `pt` half of
hermitdave/FrequencyWords rather than the `pt_br` half -- see the measurement in
`caple_level.py`, which is decisive.  It counts SURFACE FORMS, not lemmas, which
costs two classes of word and each is repaired rather than lived with: a
REFLEXIVE is filed under its base verb's rank (`chamar-se` is not a string a
subtitle corpus contains, and the paradigm the card teaches is `chamar`'s
anyway), and a PHRASE cannot appear in a segmented list at all, so it is counted
in the Tatoeba corpus and that count is calibrated onto the subtitle list's own
scale through the single words that carry both.

What is NOT done is summing a lemma's inflected forms, which looks like the
rigorous answer and is worse: a paradigm routinely holds a form that is common
for another reason entirely.  In Portuguese `a` is the feminine article, a
preposition and a form of nothing at all, and `é` is both the verb and a letter.
Hence "roughly", which is what the ordering claims and all it claims.
"""
import bisect
import json
import re
import statistics
from collections import Counter

import supplement as S
from caple_level import (LEVEL, TARGET, FREQ_FILE, BR_FREQ_FILE, f as lvlf,
                         words_below)
from reflexives import GLOSS as REFL_GLOSS, base as refl_base

W = json.load(open(lvlf('wikt.json')))
REF = json.load(open(lvlf('referencial_candidates.json')))
SUPP = json.load(open(lvlf('supplement.json')))
suppset = set(SUPP)
nocoes = {k for k, v in REF.items() if 'nocoes' in v}

freq = {}
freq_count = {}          # the raw hits, for the variety measurement below
for i, line in enumerate(open(FREQ_FILE, encoding='utf-8')):
    t = line.split()
    if t:
        freq.setdefault(t[0], i)
    if len(t) == 2:
        freq_count.setdefault(t[0], int(t[1]))

GOOD_POS = {'noun', 'verb', 'adj', 'adv', 'pron', 'num', 'intj', 'det', 'prep',
            'conj', 'article', 'particle', 'contraction'}

CLOSED = set(S.ESSENTIAL_LIST) | set(S.CLITICS) | set(S.QUANTIFIER)


def lemma_records(recs):
    """Records that define the word, not ones that merely inflect another word.

    Nearly every Portuguese noun collides with some verb form -- `casa` is a
    house and the third person of `casar`, `come` is a form of `comer`, `fala`
    is speech and a form of `falar`.  So a lemma is only an inflected form if
    NOT ONE of its records carries a sense of its own.
    """
    out = []
    for r in recs:
        if r.get('pos') not in GOOD_POS:
            continue
        for s in r.get('senses', []):
            if not (s.get('form_of') or s.get('alt_of')):
                out.append(r)
                break
    return out


# plural-only words a learner meets in the plural; Wiktionary files them under a
# singular that is rare or non-existent in use
LEXICAL_PLURALS = {'óculos', 'férias', 'calças', 'matemática', 'pais', 'anos'}

# A word whose entry opens on an INFLECTION of another word is that other word
# wearing an ending.  The test is on the WORDING of the form-of gloss, because
# the distinction that matters is inflection against derivation: a comparative,
# an alternative form and a clipping are all words a learner has to know in
# their own right.
INFLECTION_RX = re.compile(
    r'^(plural of|feminine plural of|masculine plural of|female equivalent of|'
    r'male equivalent of|singular of|masculine singular of|feminine singular of|'
    r'(first|second|third)-person|inflection of|'
    r'.*\b(indicative|subjunctive|imperative) of)\b', re.I)

BAD_SENSE_TAGS = {'form-of', 'alt-of', 'vulgar', 'slang', 'offensive',
                  'derogatory', 'archaic', 'obsolete', 'dated', 'historical',
                  'uncommon', 'rare', 'poetic', 'literary', 'euphemistic',
                  'abbreviation', 'ellipsis', 'humorous', 'childish',
                  'dialectal', 'obscure'}


def has_showable_sense(recs):
    for r in recs:
        for s in r.get('senses', []):
            if s.get('form_of') or s.get('alt_of'):
                continue
            if BAD_SENSE_TAGS & set(s.get('tags', [])):
                continue
            return True
    return False


def inflection_bases(recs, first_only):
    """The words this entry opens by declaring itself an inflection OF."""
    out = []
    for r in (recs[:1] if first_only else recs):
        for s in r.get('senses', []):
            g = (s.get('glosses') or [''])[0]
            if s.get('form_of') and INFLECTION_RX.match(g):
                out.append((s['form_of'][0] or {}).get('word', ''))
            break                       # only the record's FIRST sense declares it
    return [x for x in out if x]


def is_inflection(k, recs, vocab):
    """Is this word just another word wearing an ending?

    The test cannot be "some record calls it an inflection": nearly every
    Portuguese noun collides with a verb form, and that reading throws `a casa`
    and `o livro` out while letting junk in.  So a word goes only when its entry
    OPENS by declaring itself an inflection of a word we actually teach, or when
    it declares itself one anywhere and has no showable meaning of its own.
    """
    if k in LEXICAL_PLURALS or k in CLOSED or k.endswith('-se'):
        return False
    if not has_showable_sense(recs):
        return bool(inflection_bases(recs, first_only=False))
    return any(b in vocab for b in inflection_bases(recs, first_only=True))


# Fragments of the Referencial's own frames and headings that survive the parse
# and happen to be real Portuguese words.  Each is metalanguage in the source.
#
# THE VERBS ARE THE ONES WORTH EXPLAINING, because they do not look like
# metalanguage at all -- they are ordinary Portuguese verbs, and they reach the
# deck because the Referencial uses them to NAME its own functions and
# grammatical operations rather than to list them as vocabulary.  Each was read
# in context before being blocked, and the context is the evidence:
#
#   individualizar  "individualização/determinação do ser designado pelo nome"
#   introduzir      "para introduzir orações subordinadas substantivas"
#   situar          "situar no espaço" / "situar no tempo"   -- section headings
#   realizar        "acedendo a realizar o pedido"           -- a function label
#   recusar         "recusando a oferta/convite"             -- a function label
#   cumprir         "recusando-se a cumprir o pedido"        -- a function label
#   identificar     "identificar/definir alguém"             -- a function label
#   definir         "identificar/definir alguém"             -- a function label
#   bater           "cantar, bater, abrir  uso/valor em complexos verbais"
#                   -- a sample verb inside a grammar note, attested nowhere else
#
# Three that LOOK like the same thing and are not, so they stay: `significar`
# ("O que significa 'bicicleta'?" is the exponent the Referencial gives),
# `soletrar` ("Podes soletrar?", likewise) and `carregar` ("Tenho de carregar o
# passe", which is a real errand in Lisbon).  The test is whether the word is
# what the candidate SAYS or what the document says ABOUT what they say.
BLOCK = {
    'agente', 'dativo', 'beneficiário', 'instrumento', 'objeto', 'modo',
    'predicado', 'frase', 'coordenada', 'sujeito', 'complemento',
    'tratamento', 'designação', 'filiação', 'grau', 'nível', 'tipo',
    'individualizar', 'introduzir', 'situar', 'realizar', 'recusar',
    'cumprir', 'identificar', 'definir', 'bater',
}

# ------------------------------------------------------------------ variety
# THE REFERENCIAL DESCRIBES PORTUGUESE, NOT ONLY EUROPEAN PORTUGUESE, and where
# the two varieties differ it writes both with a slash: `uma chávena/xícara de`.
# `segments` splits on that slash because the slash is overwhelmingly used for
# ANTONYMS AND NEAR-SYNONYMS -- measured over the whole document, 1,553 distinct
# pairs, almost all of them `alto/baixo`, `abrir/fechar`, `achar/pensar` -- so
# splitting is right and a rule that always took the left-hand side would throw
# away a legitimate word in nearly every case.  The variety pairs come through
# with it, and B1's `xícara` is one: a Brazilian teacup in a deck for an exam
# set in Lisbon, which is the one thing this pipeline exists to prevent.
#
# IT IS REPORTED AUTOMATICALLY AND DROPPED BY HAND, and the measurement below is
# why round.  A word markedly commoner in the Brazilian frequency list than in
# the European one is the obvious test and it separates the known pairs cleanly
# -- xícara 19x, trem 18x, ônibus 31x, celular 25x, geladeira 26x, banheiro 26x,
# garota 22x against chávena 0.1x, comboio 0.2x, autocarro 0.1x, rapariga 0.1x.
# Run as an automatic DROP over the three levels' finished word lists it takes
# ONE right answer and FOUR wrong ones: `você`, which is ordinary European
# Portuguese and which this deck teaches on purpose; `hidratar`, absent from a
# small subtitle corpus rather than absent from Portugal; and `policial` and
# `conexão`, both standard here and merely commoner there.  A ratio measures how
# often Brazilians say a word, which is not the same question as whether the
# word is Brazilian.
# (The gerunds it flags in the CANDIDATE pool -- `dando`, `indo`, `agradecendo`,
# a dozen more, Brazil using the gerund where Portugal uses `a` + infinitive --
# never reach a word list: `is_inflection` has already dropped them.  So the
# report stays short enough to read.)
BR_RATIO, BR_MIN = 12, 200

# word -> the European word the deck teaches instead.  Each is a claim being
# made here rather than read, so each names its counterpart and each was
# checked against both frequency lists.
BRAZILIAN = {
    'xícara': 'chávena',      # B1 Noções, written `uma chávena/xícara de`
}


def br_freq():
    d = {}
    for line in open(BR_FREQ_FILE, encoding='utf-8'):
        t = line.split()
        if len(t) == 2:
            d.setdefault(t[0], int(t[1]))
    return d


def is_reflexive_ok(k):
    """A `-se` word is admitted only if a gloss is written for it and its base
    verb really has a paradigm to lend.  That is what keeps the inflected forms
    the parser picks up out of the deck -- `chama-se` and `sente-se` are
    sentences rather than headwords, and their `base` is not an infinitive."""
    if k not in REFL_GLOSS:
        return False
    b = refl_base(k)
    return any(r.get('pos') == 'verb'
               and any(f.get('source') == 'conjugation'
                       for f in r.get('forms', []))
               for r in W.get(b, []))


TAUGHT = words_below()
VOCAB = TAUGHT | set(W)

pool = {}
for k, recs in W.items():
    if k in BLOCK or k in TAUGHT or k in BRAZILIAN or re.search(r'[\[\]?]', k):
        continue
    if is_inflection(k, recs, VOCAB):
        continue
    lr = lemma_records(recs)
    if not lr and k in CLOSED:
        lr = [r for r in recs if r.get('pos') in GOOD_POS]
    if not lr and k not in LEXICAL_PLURALS:
        continue
    if not lr:
        lr = [r for r in recs if r.get('pos') in GOOD_POS]
    if not lr:
        continue
    pool[k] = lr

# the reflexives are not in `W` at all -- Wiktionary has no record for any of
# them -- so they are added on the strength of their base verb
for k in REFL_GLOSS:
    if k in TAUGHT:
        continue
    if is_reflexive_ok(k) and (k in REF or k in suppset):
        pool[k] = []

print('  level:', LEVEL, ' already taught below:', len(TAUGHT))
print('  pool after cleaning:', len(pool))

ESSENTIAL = [x for x in S.ESSENTIAL_LIST if x in pool]


def rank(k):
    return freq.get(k, 60000)


def has_conj(k):
    return any(any(f.get('source') == 'conjugation' for f in r.get('forms', []))
               for r in pool.get(k, []) if r.get('pos') == 'verb')


# Every verb that carries a paradigm.  The conjugation table is a large part of
# what this deck is for -- Portuguese has a personal infinitive and a living
# future subjunctive, and neither is guessable -- so verbs are not left to
# compete with nouns on raw frequency.
VERBS = [k for k in pool if has_conj(k)]
REFLEXIVE = [k for k in pool if k.endswith('-se')]

chosen, seen = [], set()


def take(ws):
    for k in ws:
        if k in pool and k not in seen:
            seen.add(k)
            chosen.append(k)


take(ESSENTIAL)                                        # the closed classes
take(sorted(REFLEXIVE, key=lambda k: rank(refl_base(k))))
take(sorted(VERBS, key=rank))                          # verbs, by frequency
take(sorted([k for k in pool if k in nocoes], key=rank))   # the Noções inventory
take(sorted([k for k in pool if k in suppset], key=rank))  # the supplement
take(sorted([k for k in pool if k in REF], key=rank))      # Funções, Gramática
take(sorted(pool, key=rank))                               # anything else

final = chosen[:TARGET[LEVEL]]

# WHAT THE VARIETY MEASUREMENT SAYS ABOUT THE LIST THAT IS ACTUALLY SHIPPING.
# Reported rather than acted on -- see the note above `BRAZILIAN` for why a
# ratio cannot be trusted to drop a word by itself -- and reported over `final`
# rather than over the pool, so it names the handful a person has to look at
# instead of the gerunds `is_inflection` was going to remove anyway.
_br = br_freq()
_flag = sorted(((_br.get(k, 0) / (freq_count.get(k, 0) + 1), k) for k in final
                if _br.get(k, 0) >= BR_MIN
                and _br.get(k, 0) >= BR_RATIO * (freq_count.get(k, 0) + 1)),
               reverse=True)
print(f'  dropped as Brazilian: {len(BRAZILIAN)} '
      f'({", ".join(f"{a} -> {b}" for a, b in sorted(BRAZILIAN.items()))})')
if _flag:
    print('  ! commoner in Brazilian Portuguese than in European, READ THESE: '
          + ', '.join(f'{k} x{r:.0f}' for r, k in _flag))

# ----------------------------------------------------- the order they ship in
UNRANKED = 10 ** 6
PHRASES = [k for k in final if ' ' in k]
phrase_rank = {}
if PHRASES:
    pset = set(PHRASES)
    starts = {p.split()[0] for p in PHRASES}
    maxn = max(len(p.split()) for p in PHRASES)
    tok = re.compile(r"[a-zà-öø-ÿ]+", re.I)
    tcount, pcount = Counter(), Counter()
    for line in open('por_sentences_detailed.tsv', encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) < 3:
            continue
        ws = tok.findall(p[2].lower())
        tcount.update(ws)
        for i, x in enumerate(ws):
            if x in starts:     # most tokens start no phrase, so most cost nothing
                for n in range(2, maxn + 1):
                    if i + n <= len(ws) and ' '.join(ws[i:i + n]) in pset:
                        pcount[' '.join(ws[i:i + n])] += 1
    anchors = sorted((tcount[k], freq[k]) for k in final
                     if ' ' not in k and k in freq and tcount[k])
    counts = [c for c, _ in anchors]
    for p in PHRASES:
        c = pcount.get(p, 0)
        if not c or not anchors:
            phrase_rank[p] = UNRANKED
            continue
        i = bisect.bisect_left(counts, c)
        near = anchors[max(0, i - 4):i + 5]
        phrase_rank[p] = int(statistics.median(r for _, r in near))
    print('  phrases     :', len(PHRASES), 'of which counted:',
          sum(1 for p in PHRASES if phrase_rank[p] != UNRANKED))


def usage_rank(k):
    if k in phrase_rank:
        return phrase_rank[k]
    if k.endswith('-se'):
        return freq.get(refl_base(k), UNRANKED)
    return freq.get(k, UNRANKED)


final.sort(key=usage_rank)   # stable, so equal ranks keep the cascade's order

# A short list is the one failure this stage can have that LOOKS like success:
# the deck builds, every card is well formed, and the level quietly teaches
# fewer words than it says it does.  Say so instead.
if len(final) < TARGET[LEVEL]:
    raise SystemExit(
        f'{LEVEL} wants {TARGET[LEVEL]} words and the pool yields only '
        f'{len(final)}. Widen the supplement or lower TARGET -- do not ship a '
        f'short deck.')

src = lambda k: (('N' if k in nocoes else '')
                 + ('S' if k in suppset else '')
                 + ('F' if k in REF and k not in nocoes else ''))
print('  essential   :', len(ESSENTIAL))
print('  chosen      :', len(chosen), '-> taking', len(final))
print('  sources     :', dict(Counter(src(k) for k in final).most_common()))
print('  first fifteen:', ', '.join(final[:15]))
json.dump(final, open(lvlf('wordlist.json'), 'w'), ensure_ascii=False, indent=0)
json.dump(chosen, open(lvlf('ranked.json'), 'w'), ensure_ascii=False, indent=0)
