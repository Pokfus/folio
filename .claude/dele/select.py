#!/usr/bin/env python3
"""Choose the 500 A1 words from the validated pool."""
import json, re
import supplement as S0
from dele_level import LEVEL, f as lvlf, words_below

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

final = chosen[:500]
print('essential   :', len(ESSENTIAL))
print('chosen      :', len(chosen), '-> taking', len(final))
src = lambda k: ('C' if k in pcic else '') + ('S' if k in suppset else '')
from collections import Counter
print('sources     :', Counter(src(k) for k in final))
pass
json.dump(final, open(lvlf('wordlist500.json'), 'w'), ensure_ascii=False, indent=0)
# the whole ranked order, so the driver can swap in a replacement for a word the
# sentence corpus turns out not to cover
json.dump(chosen, open(lvlf('ranked.json'), 'w'), ensure_ascii=False, indent=0)
