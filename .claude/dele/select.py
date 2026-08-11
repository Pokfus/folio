#!/usr/bin/env python3
"""Choose this level's words from the validated pool."""
import json, re
import supplement as S0
from dele_level import LEVEL, TARGET, f as lvlf, words_below

w = json.load(open(lvlf('wikt.json')))
pcic = set(json.load(open(lvlf('pcic_candidates.json'))).keys())
supp = json.load(open(lvlf('supplement.json')))
suppset = set(supp)

freq = {}
for i, l in enumerate(open('es_50k.txt', encoding='utf-8')):
    t = l.split()
    if t:
        freq.setdefault(t[0], i)

GOOD_POS = {'noun', 'verb', 'adj', 'adv', 'pron', 'num', 'intj', 'det', 'prep',
            'conj', 'article', 'particle'}

def lemma_records(recs):
    """Records that define the word, not ones that merely inflect another word.

    Nearly every Spanish noun collides with some verb form -- `libro` is a book
    and the 1sg of `librar`, `vino` is wine and the preterite of `venir`, `casa`
    is a house and the 3sg of `casar`.  So a lemma is only an inflected form if
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
LEXICAL_PLURALS = {'gafas', 'vacaciones', 'matemáticas', 'vaqueros', 'deberes', 'padres',
                   'medias', 'urgencias'}

# A word whose entry opens on an INFLECTION of another word is that other word
# wearing an ending, and does not deserve a card of its own: `flores` is the
# plural of `flor`, `roja` the feminine of `rojo`, `clases` the plural of a word
# A1 already teaches.  They get through the lemma test above because Wiktionary
# also records some marginal homonym -- `roja` is "the Chile national football
# team" and `mala` is "a suitcase" -- so the card would have shown that.
#
# The test is on the WORDING of the form-of gloss, because the distinction that
# matters is inflection against derivation: `peor` is "comparative degree of
# malo", `quizás` an "alternative form of quizá" and `moto` a "clipping of
# motocicleta", and all three are words a learner has to know in their own
# right.  Neither has any clean sense at all, so a test on usable senses would
# have thrown out `peor` and kept `roja`.
INFLECTION_RX = re.compile(
    r'^(plural of|feminine plural of|masculine plural of|female equivalent of|'
    r'male equivalent of|singular of|masculine singular of|'
    r'(first|second|third)-person|inflection of|'
    r'.*\b(indicative|subjunctive|imperative) of)\b', re.I)

BAD_SENSE_TAGS = {'form-of', 'alt-of', 'vulgar', 'slang', 'offensive', 'derogatory',
                  'archaic', 'obsolete', 'dated', 'historical', 'uncommon', 'rare',
                  'poetic', 'literary', 'euphemistic', 'abbreviation', 'ellipsis',
                  'humorous', 'childish', 'dialectal', 'obscure'}

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
    """The words this entry opens by declaring itself an inflection OF.

    `first_only` looks at the word's FIRST record, which is the part of speech
    Wiktionary leads its entry with.  That is what separates `roja`, whose entry
    opens "female equivalent of rojo", from `trabajo`, whose entry opens on the
    noun and only mentions `trabajar` further down.
    """
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

    The test cannot be "some record calls it an inflection": NEARLY EVERY
    SPANISH NOUN COLLIDES WITH SOME VERB FORM, so `casa` is a house AND the
    third person of `casar`, and that reading threw `la casa`, `el libro` and
    `el agua` out of A1 while letting `el jersey` in.

    So a word goes only when its entry OPENS by declaring itself an inflection
    of a word we actually teach -- `roja` of `rojo`, `clases` of `clase` -- or
    when it declares itself an inflection anywhere and has no showable meaning
    of its own at all, which is `flores`, whose only non-form-of sense is tagged
    rare.  Reading every record instead of the first one costs `el trabajo`,
    `la cena` and `el vino`, whose entries open on the noun and mention
    `trabajar`, `cenar` and `venir` only lower down.  A derivation is not an
    inflection and stays: `peor` is the comparative of `malo`, `quizas` an
    alternative form of `quiza`, `moto` a clipping of `motocicleta`, and a
    learner needs all three as words.
    """
    if (k in LEXICAL_PLURALS or k in CLOSED
            or k.endswith(('arse', 'erse', 'irse'))):
        return False
    if not has_showable_sense(recs):
        # nothing can be put on the card but the inflection itself
        return bool(inflection_bases(recs, first_only=False))
    return any(b in vocab for b in inflection_bases(recs, first_only=True))

# fragments of the inventory's own frames and section headings, not vocabulary
BLOCK = {
    'laos', 'bali', 'mozambique', 'okay', 'ser de', 'en grupos', 'en parejas',
    'grupos', 'parejas', 'herramientas', 'lugares', 'marítimo', 'fluvial',
    'administrativo', 'auxiliar', 'civil', 'ida', 'vuelta', 'doble', 'fijo',
    'acondicionado', 'comercial', 'solo', 'bajo', 'a',
    'huevos', 'ojos', 'manos', 'dientes', 'llaves', 'zapatos', 'pantalones',
}

def is_reflexive(k, recs):
    """A reflexive verb is a lemma here even though Wiktionary files it as a form.

    `llamarse` is given one sense -- "infinitive of llamar combined with se" --
    so the lemma test above throws it out, and with it every daily-routine verb
    the A1 inventory actually lists (`levantarse, ducharse`).  To a learner
    `llamarse` is a separate word with a separate meaning, and it is the verb
    the first lesson of any A1 course is built on.
    """
    return k.endswith(('arse', 'erse', 'irse')) and any(r['pos'] == 'verb' for r in recs)

# The Cervantes NOCIONES inventories are lists of topical vocabulary, so the
# grammar layer -- pronouns, articles, prepositions, conjunctions, `muy`,
# `pero`, `porque` -- is inventoried separately under Gramatica and appears in
# neither of the two pages read here.  A 500-word A1 list without `yo` and `tu`
# is not an A1 list, so the closed classes are carried in the same way the
# numbers and the days are, and like the reflexives they override the lemma
# test: Wiktionary calls `muy` an apocopic form of `mucho`.
CLOSED = set(S0.PRONOUNS + S0.QUESTION + S0.FUNCTION) | set(S0.ESSENTIAL_LIST)

# a word the level below already teaches is not a new word for this one
TAUGHT = words_below()
# every word this level might teach, plus every word the levels below already do
VOCAB = TAUGHT | set(w)

pool = {}
for k, recs in w.items():
    if k in BLOCK or k in TAUGHT or re.search(r'[\[\]¿?]', k):
        continue
    if is_inflection(k, recs, VOCAB):
        continue
    lr = lemma_records(recs)
    if not lr and k in CLOSED:
        lr = [r for r in recs if r.get('pos') in GOOD_POS]
    if not lr and is_reflexive(k, recs):
        lr = [r for r in recs if r['pos'] == 'verb']
    if not lr and k not in LEXICAL_PLURALS:
        continue
    if not lr:
        lr = [r for r in recs if r.get('pos') in GOOD_POS]
    if not lr:
        continue
    pool[k] = lr

print('level:', LEVEL, ' already taught below:', len(TAUGHT))
print('pool after cleaning:', len(pool))

# closed classes the inventory names but never writes out -- non-negotiable at A1
import supplement as S
ESSENTIAL = [x for x in S.ESSENTIAL_LIST if x in pool]

def rank(k):
    return freq.get(k, 60000)

def has_conj(k):
    return any(any(f.get('source') == 'conjugation' for f in r.get('forms', []))
               for r in pool.get(k, []) if r['pos'] == 'verb')

# every verb that carries a paradigm, and the reflexives whose paradigm is
# derived from a base verb -- the conjugation table is the point of the deck,
# so verbs are not left to compete with nouns on raw frequency
VERBS = [k for k in pool if has_conj(k)]
REFLEXIVE = [k for k in pool if k.endswith('se') and not has_conj(k)
             and k[:-2] in pool and has_conj(k[:-2])]

chosen, seen = [], set()
def take(words):
    for k in words:
        if k in pool and k not in seen:
            seen.add(k); chosen.append(k)

take(ESSENTIAL)
take(sorted(VERBS, key=rank))
take(sorted([k for k in pool if k.endswith(('arse','erse','irse'))], key=rank))
take(sorted(REFLEXIVE, key=rank))
take(sorted([k for k in pool if k in pcic], key=rank))
take(['huevo'])
take(sorted([k for k in pool if k in suppset], key=rank))
take(sorted(pool, key=rank))

final = chosen[:TARGET[LEVEL]]

# ------------------------------------------------------- the order they ship in
# WHICH words a level teaches and WHAT ORDER they come in are two questions, and
# only the first is answered by the cascade above.  That cascade exists to stop
# the closed classes and the verbs competing with nouns on raw frequency -- a
# 500-word A1 list without `yo` and `tu` is not an A1 list -- so it deliberately
# does NOT rank the list as a whole, and it left `uno` as the first card of A1
# and `de`, `que` and `no` several hundred cards in.
#
# So the chosen words are re-sorted for OUTPUT, most frequent first, and nothing
# about the selection moves: the same 500/500/1,000/2,000 words ship, so the
# exclusion sets the higher levels are built against are untouched and a rebuilt
# level cannot come out teaching something else.  Change `rank` above and the
# deck's CONTENTS change; change this and only the running order does.
#
# `es_50k.txt` counts SURFACE FORMS, not lemmas, which costs two classes of word
# and each is repaired rather than lived with.  A REFLEXIVE is filed under its
# own infinitive, which is rare in the corpus even when the verb is not
# (`llamarse` is 14,131st while `llamar` is 580th), so it takes its base verb's
# rank -- the paradigm the card teaches is the base's anyway.
#
# A PHRASE CANNOT APPEAR IN A SEGMENTED LIST AT ALL, and the obvious fallback is
# wrong in a way that is worth recording: giving `por consiguiente` the rank of
# its RAREST component is a true CEILING on how often the phrase can be said and
# a hopeless estimate of it, because a phrase built out of very common words
# gets a very low ceiling -- `si bien`, `con todo`, `es mas` and `ahora bien`
# all led the B2 deck ahead of `razon` and `problema`.  So a phrase is COUNTED
# instead, in the Tatoeba corpus this pipeline already downloads for its example
# sentences, and that count is calibrated onto the subtitle list's own scale
# through the level's single words, which have both a count and a rank.  It puts
# `es mas` 307th and `en la medida en que` last, which is the right shape.
# (The count is a running-text match, so a phrase that is also the opening of an
# ordinary string is over-counted -- `con todo` catches `con todo el mundo`.)
#
# What is NOT done is summing a lemma's inflected forms, which looks like the
# rigorous answer and is worse: a paradigm routinely contains a form that is
# common for another reason entirely, and `comer` would inherit the 1.6 million
# hits of `como` -- overwhelmingly "as, like" and not "I eat" -- and lead the
# deck.  Hence "roughly", which is what the ordering claims and all it claims.
UNRANKED = 10 ** 6
PHRASES = [k for k in final if ' ' in k]
phrase_rank = {}
if PHRASES:                      # A1 and A2 have none, and skip the corpus pass
    import bisect, statistics
    from collections import Counter
    pset, starts = set(PHRASES), {p.split()[0] for p in PHRASES}
    maxn = max(len(p.split()) for p in PHRASES)
    tok = re.compile(r'[a-záéíóúüñ]+', re.I)
    tcount, pcount = Counter(), Counter()
    for line in open('spa_sent.tsv', encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) < 3:
            continue
        ws = tok.findall(p[2].lower())
        tcount.update(ws)
        for i, x in enumerate(ws):
            if x in starts:      # most tokens start no phrase, so most cost nothing
                for n in range(2, maxn + 1):
                    if i + n <= len(ws) and ' '.join(ws[i:i + n]) in pset:
                        pcount[' '.join(ws[i:i + n])] += 1
    # the level's own single words are the calibration: each has a Tatoeba count
    # and a subtitle rank, so a phrase's count can be read off as a rank
    anchors = sorted((tcount[k], freq[k]) for k in final
                     if ' ' not in k and k in freq and tcount[k])
    counts = [c for c, _ in anchors]
    for p in PHRASES:
        c = pcount.get(p, 0)
        if not c or not anchors:
            phrase_rank[p] = UNRANKED
            continue
        i = bisect.bisect_left(counts, c)
        near = anchors[max(0, i - 4):i + 5]      # median of the nearest anchors
        phrase_rank[p] = int(statistics.median(r for _, r in near))
    print('phrases     :', len(PHRASES), 'of which counted:',
          sum(1 for p in PHRASES if phrase_rank[p] != UNRANKED))

def usage_rank(k):
    if k in phrase_rank:
        return phrase_rank[k]
    if k.endswith(('arse', 'erse', 'irse')) and k[:-2] in freq:
        return freq[k[:-2]]
    return freq.get(k, UNRANKED)

final.sort(key=usage_rank)   # stable, so equal ranks keep the cascade's order
# A short list is the one failure this stage can have that LOOKS like success:
# the deck builds, every card is well formed, and the level quietly teaches
# fewer words than it says it does.  Say so instead.
if len(final) < TARGET[LEVEL]:
    raise SystemExit(
        f'{LEVEL} wants {TARGET[LEVEL]} words and the pool yields only {len(final)}. '
        f'Widen the supplement or lower TARGET -- do not ship a short deck.')
print('essential   :', len(ESSENTIAL))
print('chosen      :', len(chosen), '-> taking', len(final))
src = lambda k: ('C' if k in pcic else '') + ('S' if k in suppset else '')
from collections import Counter
print('sources     :', Counter(src(k) for k in final))
pass
json.dump(final, open(lvlf('wordlist.json'), 'w'), ensure_ascii=False, indent=0)
# the whole ranked order, so the driver can swap in a replacement for a word the
# sentence corpus turns out not to cover
json.dump(chosen, open(lvlf('ranked.json'), 'w'), ensure_ascii=False, indent=0)
