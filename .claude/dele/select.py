#!/usr/bin/env python3
"""Choose the 500 A1 words from the validated pool."""
import json, re
import supplement as S0

w = json.load(open('wikt.json'))
pcic = set(json.load(open('pcic_a1_candidates.json')).keys())
supp = json.load(open('supplement.json'))
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
LEXICAL_PLURALS = {'gafas', 'vacaciones', 'matemáticas', 'vaqueros', 'deberes', 'padres'}

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
CLOSED = set(S0.PRONOUNS + S0.QUESTION + S0.FUNCTION)

pool = {}
for k, recs in w.items():
    if k in BLOCK or re.search(r'[\[\]¿?]', k):
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

print('pool after cleaning:', len(pool))

# closed classes the inventory names but never writes out -- non-negotiable at A1
import supplement as S
ESSENTIAL = [x for x in (S.NUMBERS + S.ORDINALS + S.DAYS + S.MONTHS + S.SEASONS
                         + S.PRONOUNS + S.QUESTION + S.FUNCTION) if x in pool]

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
json.dump(final, open('wordlist500.json', 'w'), ensure_ascii=False, indent=0)
