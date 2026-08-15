#!/usr/bin/env python3
"""Settle each word's lemma and part of speech, and decide where it comes.

THE DECK TEACHES THE WHOLE BAND, so there is nothing to select in the DELE
sense: that pipeline draws 500 words out of an inventory of thousands, where
this list is closed and the deck is that list.  What this stage does is decide,
for each entry, WHICH Wiktionary lemma it is, what part of speech to treat it
as, and WHERE IT COMES in the deck.

**THE ORDER IS THE ONE THING THAT MAKES THIS BAND USABLE, and it is why the
stage matters more here than in either sibling.**  `cils_level` records the
measurement: this list is a written-register frequency band wearing a CEFR
label, so it carries `amministrativo` and `valutazione` and does not carry
`pane` or `madre`.  Dealt in the order it is printed -- alphabetically -- a
learner meets `accadere`, `accesso`, `accettare`, `accogliere` as their first
four Italian words.  Ordered by how common the word actually is in everyday
spoken Italian, they meet `essere`, `avere`, `fare`, `dire`, `andare` first and
`amministrativo` at card nine hundred.  The band is what it is; the order is
what a reader actually experiences.

THE COUNT IS TAKEN OFF THE HEADWORD'S OWN SURFACE FORM.  Summing a lemma's
inflected forms looks like the rigorous answer and is worse -- the DELE pipeline
records why, and Italian is a good example of the same trap: `stato` is a noun
and the participle of `essere`, `sono` is `I am` and `they are`, `la` is an
article and a pronoun and a musical note, and every regular verb's third-person
singular collides with something.  So a word is ranked by how often its own
dictionary form turns up in a list built from film and television subtitles,
which for an Italian noun means the singular and for a verb the infinitive.

A PHRASE CANNOT APPEAR IN A SEGMENTED LIST AT ALL, so the handful of them are
counted in the Tatoeba corpus and that count is calibrated onto the frequency
list's own scale through the single words that carry both -- the Goethe stage's
arrangement, and for its reason: giving a phrase the rank of its rarest word is
a true ceiling on how often it can be said and a hopeless estimate of it, since
a phrase built out of very common words gets a very low one.

A WORD THE FREQUENCY LIST HAS NEVER SEEN goes to the END rather than to the
front, since a missing count must not read as a count of zero.
"""
import json, re
from collections import Counter

from cils_level import LEVEL, f as lvlf, words_below
from italian import fold, phrase_in
from wikt import real_senses, letter_name, pointer_targets

wl = json.load(open(lvlf('wordlist.json')))
W = json.load(open(lvlf('wikt.json')))

# ------------------------------------------------------------------ merge
below = words_below()
entries, dropped = [], []
for e in wl:
    if e['word'].lower() in below:
        dropped.append(e['display'])
        continue
    entries.append(e)
if dropped:
    print(f'  already taught by a lower level: {len(dropped)} -- ' + ', '.join(dropped))
else:
    print('  nothing to drop: no lower level shares a word with this band')


# ------------------------------------------------------------------ lemma
def says_something(recs, others=()):
    """Whether any of these records glosses the word as something OTHER than
    itself.  `others` is the folded set of this entry's OTHER candidate lemmas.

    **A GLOSS EQUAL TO ITS OWN HEADWORD IS USUALLY CORRECT AND OCCASIONALLY
    EMPTY**, which is why this is a tie-break and not a filter.  Measured over
    both bands, six records gloss the word with the word: `no`, `me`, `idea`,
    `internet` and `volume` are true cognates and that IS the translation, so
    refusing them would strip five right answers to fix one.  The sixth is
    `zaire`, whose lower-case entry is a bare currency stub reading "zaire"
    while `Zaire` carries the country, the river and the Angolan province.
    What separates it is not the circularity but the existence of a better
    record under the other surface -- so that, and only that, is what is tested.
    """
    for r in recs:
        for s in real_senses(r):
            g = (s.get('glosses') or [''])[0]
            if fold(g) != fold(r.get('word', '')):
                return True
    # **A POINTER WHOSE TARGET EXISTS SAYS SOMETHING TOO**, because `build_deck`
    # can now follow it -- see `pointer_targets`.  Without this the search falls
    # past a perfectly good lower-case entry to a differently-cased proper noun:
    # `altissimo` ("superlative of alto"), `carissimo`, `santissimo`, `obbiettivo`
    # and `ghetto` all came out headed as names, and `mila` -- the `mila` of
    # `duemila` -- as a female given name.
    #
    # THE ONE WORD THIS COSTS IS `usa`, whose lower-case entry really is a form
    # of `usare` and whose list entry really is the country; it is in AUTHORED,
    # which is what that table is for.  A rule right six times with one written
    # exception beats a rule wrong six times.
    #
    # **A POINTER AT ONE OF THIS ENTRY'S OWN CANDIDATES SAYS NOTHING**, because
    # it is the entry being redirected to itself.  `menu` is glossed "menu" --
    # circular, so the test above declines it -- while the accented `menù`, which
    # the accent rule offers as a candidate, is filed as "alternative spelling of
    # menu"; so this promoted the pointer over the word it points at and the card
    # was re-spelt for no reason.  Both spellings are Italian and the list prints
    # `menu`.
    for t in pointer_targets(recs):
        if fold(t) in others:
            continue
        if any(real_senses(r) for r in (W.get(t) or [])):
            return True
    return False


def pick_lemma(e):
    """The surface the dictionary actually carries.

    The list prints everything lower-cased, so a proper noun (`italia`) offers
    its capital as an alternative and is looked up under whichever form has a
    real entry.  A form with meanings of its own beats one that only points
    elsewhere, which is what keeps `italia` from resolving to nothing, and a
    form that says something beats one that only repeats itself.
    """
    for l in e['lemmas']:
        # by exact string, NOT by fold: the candidates that matter here are the
        # case and accent variants, which all fold to the same thing, so folding
        # both sides empties the set and the guard never fires
        others = {fold(x) for x in e['lemmas'] if x != l}
        if says_something(W.get(l) or [], others):
            return l
    for l in e['lemmas']:
        if any(real_senses(r) for r in (W.get(l) or [])):
            return l
    for l in e['lemmas']:
        if W.get(l):
            return l
    return e['lemmas'][0]


# WHAT TO TREAT A WORD AS, where the dictionary carries it under more than one
# part of speech.  The DEFAULT is the dictionary's own order -- the first record
# with real senses -- which is Wiktionary's page order and is right far more
# often than any priority table: `essere` is a verb before it is a noun, `bello`
# an adjective before a noun, `amico` a noun before an adjective, and a fixed
# ordering cannot get all three right at once.
#
# FORCE_POS is the exception list, and every row was read before it was written.
# The shape it catches is a word whose commonest sense is not the one Wiktionary
# prints first, usually because a participle or a noun has an etymology section
# of its own ahead of the word a learner means.
FORCE_POS = {
    'stato': 'noun',       # the state; ahead of the participle of essere
    'dato': 'noun',        # datum, data
    'fatto': 'noun',       # fact; ahead of the participle of fare
    'via': 'noun',         # street
    'stesso': 'adj',       # same
    'destra': 'noun',      # the right
    'sinistra': 'noun',
    'davanti': 'adv',
    'insieme': 'adv',
    'piano': 'noun',       # floor, plan
    'capo': 'noun',
    'genere': 'noun',
    'corso': 'noun',
    'campo': 'noun',
    'posto': 'noun',
    'colpo': 'noun',
    'segno': 'noun',
    'sogno': 'noun',
    'uso': 'noun',         # use; ahead of the adjective "accustomed"
    'bene': 'adv',         # well; ahead of the adjective "upper-class, posh"
    # its pronoun senses are ALL pointers ('accusative/dative of tu; you'), so
    # nothing but a forced choice reaches them; the noun records are the letter
    # of the alphabet and the musical note
    'ti': 'pron',
}

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'prep': 'preposition', 'conj': 'conjunction',
            'num': 'number', 'intj': 'interjection', 'det': 'determiner',
            'article': 'article', 'particle': 'particle', 'name': 'name',
            'phrase': 'phrase', 'proverb': 'phrase', 'prep_phrase': 'phrase'}


def pick_pos(e, lemma):
    forced = FORCE_POS.get(e['word'].lower())
    recs = W.get(lemma) or []
    if forced and any(r.get('pos') == forced for r in recs):
        return forced
    real = [r for r in recs if real_senses(r)]
    for r in real:
        if not letter_name(r):
            return r.get('pos') or 'other'
    if real:
        return real[0].get('pos') or 'other'
    return (recs[0].get('pos') if recs else
            ('phrase' if e['multiword'] else 'other'))


for e in entries:
    e['lemma'] = pick_lemma(e)
    e['pos'] = pick_pos(e, e['lemma'])
    e['key'] = e['display']
    # **A PROPER NOUN IS CAPITALISED IN ITALIAN EXACTLY AS IT IS IN ENGLISH, AND
    # THE LIST PRINTS EVERYTHING LOWER-CASED.**  Left alone the card teaches a
    # learner to write `italia`, `firenze` and `new york` -- which is not a
    # near-miss but simply wrong, and wrong on the one line of the card the
    # reader is being asked to reproduce.  Eighteen words across the two shipped
    # bands, and every count reads healthy either way.
    #
    # The spelling is READ rather than composed, which is what makes this safe:
    # `pick_lemma` already resolved `usa` to `Usa` and `firenze` to `Firenze`,
    # because the lower-case records for those are all pointers and it prefers a
    # form with senses of its own.  So the right orthography is a fact the
    # dictionary states and the entry is already carrying.  A rule instead would
    # have to decide what to do with an acronym (`USA` or `Usa`?) and with the
    # inner words of a compound name, and would be guessing at both.
    #
    # The test is CASE ALONE, so it can fire on nothing else: the only
    # alternative surface the lookup ever offers is `w.capitalize()`.  `key` is
    # deliberately set above this and stays lower-cased -- it is what
    # `examples.py` matches Tatoeba sentences on.
    #
    # PROPOSED here and APPLIED after the corpus count below, because it is not
    # always right -- see `recase` there.
    #
    # **AN ACCENT IS TAKEN OUTRIGHT WHERE A CAPITAL IS ARGUED ABOUT.**  `fold`
    # ignores case AND diacritics, so this catches `assurdita` -> `assurdità`
    # as well as `italia` -> `Italia`; but the corpus test below is about
    # CAPITALISATION and has nothing to say about an accent, so a difference
    # that is only an accent is adopted here and never questioned.  Italian
    # writes the accent, there is no second reading to weigh, and the card must
    # show the spelling a learner is meant to reproduce.
    if fold(e['lemma']) == fold(e['display']):
        if e['lemma'].lower() != e['display'].lower():
            e['display'] = e['lemma']       # an accent: settled
            e['_cap'] = ''
        elif e['lemma'] != e['display']:
            e['_cap'] = e['lemma']          # a capital: weighed below
        else:
            e['_cap'] = ''                  # identical: nothing to weigh
    else:
        e['_cap'] = ''
    # **AND THE CAPITAL MAY BE ONE `pick_lemma` DECLINED**, which is the other
    # half of the same question and needs the opposite burden of proof.
    #
    # The rule above promoted a pointer over a differently-cased proper noun, so
    # that `carissimo` would not be headed as a surname -- and it costs the
    # proper nouns whose OWN lower-case spelling is also an inflected form of
    # something: `africa` is the feminine of `africo`, `capri` the plural of
    # `capro`, `toscana` of `toscano`, `bretagna` and `india` and `marche` the
    # same, so six continents, islands and regions came out as goats and brands.
    # The two shapes are IDENTICAL in the dictionary -- a pointer-only lower-case
    # record against a capitalised one with real senses -- and nothing but the
    # corpus separates them, which is what it is asked below.
    #
    # PROPOSED here and, unlike `_cap`, adopted only on POSITIVE evidence: the
    # dictionary has already argued for the lower-case reading, so silence must
    # leave it standing.  That is what keeps `carissimo` (0 capitalised, 3 lower)
    # and `usa` (21 against 274) where they are.
    e['_capalt'] = ''
    if not e['_cap'] and not any(real_senses(r) for r in (W.get(e['lemma']) or [])):
        for l in e['lemmas']:
            if l[:1].isupper() and l.lower() == e['display'].lower() \
                    and any(real_senses(r) for r in (W.get(l) or [])):
                e['_capalt'] = l
                break
    # **A PRONOMINAL VERB IS HEADED BY ITS PRONOMINAL FORM**, which is what the
    # `+si` candidate in `parse_cils` resolves to and what every dictionary
    # prints.  The list gives `imbattere` and `attendare`; those forms do not
    # occur -- the verb is `imbattersi`, and the card is being built as a
    # reflexive two lines below whatever the head says, so a head reading
    # `imbattere` would sit above `mi imbatto, ti imbatti`.  It fires only where
    # the bare form resolved to nothing of its own, since `pick_lemma` prefers a
    # candidate that says something.
    # The test reconstructs the two candidates `parse_cils` offers and nothing
    # else, so it cannot fire on a word that merely ends in `-si`.
    #
    # **AND A TRUNCATED INFINITIVE IS HEADED BY THE WHOLE ONE**, for the same
    # reason and with the same test.  The C1 list prints eleven of them --
    # `risolver`, `convincer`, `preveder` -- which are the elisions verse and
    # song use, not forms anybody writes; the card headed `risolver` above a
    # paradigm whose own first row read `infinito  risolvere`, which is the head
    # contradicting the panel under it.
    if e['lemma'] in (e['display'][:-1] + 'si', e['display'][:-2] + 'si',
                      e['display'] + 'e'):
        e['display'] = e['lemma']
        e['key'] = e['lemma']
    # a reflexive infinitive is its own lemma in Italian (`chiamarsi`), and the
    # base verb is what its compound tenses are built from
    e['reflexive'] = bool(re.search(r'[aei]rsi$', e['lemma']))
    e['base'] = (e['lemma'][:-2] + 'e') if e['reflexive'] else ''

print('  parts of speech:', dict(Counter(e['pos'] for e in entries).most_common()))
no_rec = [e['display'] for e in entries if not W.get(e['lemma'])]
if no_rec:
    show = ', '.join(no_rec[:20]) + (' …' if len(no_rec) > 20 else '')
    print(f'  no Wiktionary record at all: {len(no_rec)} -- {show}')

# ------------------------------------------------------------------ order
freq = {}
for line in open('it_50k.txt', encoding='utf-8'):
    t = line.split()
    if len(t) == 2 and t[0] not in freq:
        freq[t[0]] = int(t[1])

phrases = [e for e in entries if e['multiword']]
counts, scale = Counter(), 1.0
cap_seen, low_seen = Counter(), Counter()
cap_cand = {e['key']: (e['_cap'] or e['_capalt'])
            for e in entries if e['_cap'] or e['_capalt']}
if phrases or cap_cand:
    plook = {e['word'].lower(): e['key'] for e in phrases}
    singles = {e['word'].lower(): e['key'] for e in entries
               if not e['multiword'] and freq.get(e['word'].lower())}
    tok = re.compile(r"[a-zàèéìíòóùú']+")
    # a word is only evidence of its own case where it does not open the sentence
    capt = re.compile(r"[A-Za-zÀ-ÿ']+")
    for line in open('ita_sentences_detailed.tsv', encoding='utf-8'):
        p = line.split('\t')
        if len(p) < 3:
            continue
        txt_ = p[2]
        low = txt_.lower()
        for w, k in plook.items():
            # `w in low` counted `a vita` inside `la vita` -- see `phrase_in`
            if phrase_in(low, w):
                counts[k] += 1
        for t in set(tok.findall(low)):
            k = singles.get(t)
            if k:
                counts[k] += 1
        if cap_cand:
            for m in capt.finditer(txt_):
                w = m.group(0)
                if w.lower() in cap_cand and m.start() and txt_[m.start() - 1] not in '.!?"«»(':
                    (cap_seen if w[:1].isupper() else low_seen)[w.lower()] += 1
    ratios = sorted(freq[w] / counts[k] for w, k in singles.items()
                    if counts.get(k, 0) >= 5)
    scale = ratios[len(ratios) // 2] if ratios else 1.0
    print(f'  {len(phrases)} phrases counted in Tatoeba; calibration {scale:.0f} subtitle '
          f'hits per corpus hit, from {len(ratios)} words carrying both')


# ------------------------------------------------------------------ recase
# **THE CAPITAL IS PROPOSED BY THE DICTIONARY AND CONFIRMED BY THE CORPUS**, and
# it takes both because either alone gets a real word wrong.
#
# The dictionary alone promoted `tour` to `Tour`: Italian Wiktionary has no
# lower-case entry for the ordinary borrowing at all, only the cycling race, so
# the B1 card for "a tour" came out headed `Tour` and glossed "the Tour de
# France" -- above three example sentences all using the common noun, which is
# what made it visible.
#
# The corpus alone gets `Usa` wrong in the other direction: it is written
# lower-case 274 times against 21, because `usa` is also the third person of
# `usare`.  So the lower-case hits are only evidence about THIS word when the
# lower-case spelling is NOT SOME OTHER WORD -- which is precisely the `tour`
# case and not the `Usa` one.
#
# **THAT TEST WAS FIRST WRITTEN AS "the lower-case spelling has no entry at
# all", WHICH IS ONE NOTCH TOO COARSE and let `Ghetto` through**: `ghetto` has an
# entry of its own, glossed "ghetto" -- a true cognate, the case
# `says_something` already documents -- so the corpus's seven lower-case hits
# were thrown away as evidence about a different word, and the C1 card came out
# headed `Ghetto` and glossed "a small area of Venice where the Jews of the city
# were confined".  What makes the `usa` hits inadmissible is not that the
# spelling has an entry but that the entry is a POINTER AT SOMETHING ELSE, so
# that is what is tested.
#
# "No lower-case entry" is NOT usable on its own either, and it was tried:
# `Italia`, `Firenze` and `Londra` have none, because for a proper noun that is
# the norm rather than the exception.  Thirty-seven of the forty-two would have
# been un-capitalised by it.
def other_word(k):
    """Whether the lower-case spelling is an inflected form of a DIFFERENT lemma,
    which is what makes its corpus hits say nothing about this entry."""
    recs = W.get(k) or []
    return bool(recs) and not any(real_senses(r) for r in recs)
recased, refused, adopted, declined = [], [], [], []
for e in entries:
    alt = e.pop('_capalt', '')
    if alt:
        n_cap, n_low = cap_seen[e['key']], low_seen[e['key']]
        # any evidence at all, and clearly one-sided.  `Capri` is carried by a
        # single corpus hit and by the dictionary agreeing with it, which is two
        # weak signals pointing the same way; `Marche` (0 against 6) is not, and
        # ships as the plural of `marca`, which is what the corpus shows.
        if n_cap >= 1 and n_cap > 3 * n_low:
            e['lemma'] = e['display'] = e['key'] = alt
            e['pos'] = pick_pos(e, alt)
            e['reflexive'], e['base'] = False, ''
            adopted.append(f'{alt} ({n_cap} capitalised, {n_low} lower-case)')
        else:
            # REPORTED rather than passed over: the dictionary carries a proper
            # noun under this spelling and the card is about to teach a common
            # one, which is a decision and not a detail.  `Marche` is the case
            # to read -- the region against the plural of `marca`, and the
            # corpus writes it lower-case six times and never capitalised.
            declined.append(f'{alt} ({n_low} lower-case, {n_cap} capitalised)')
    cap = e.pop('_cap', '')
    if not cap or cap == e['display']:
        continue
    k = e['key']
    n_cap, n_low = cap_seen[k], low_seen[k]
    common = n_cap + n_low >= 5 and n_low > n_cap and not other_word(k)
    if common:
        refused.append(f'{cap} (corpus: {n_low} lower-case, {n_cap} capitalised)')
    else:
        e['display'] = cap
        recased.append(cap)
if recased:
    print(f'  capitalised from the dictionary: {len(recased)} -- ' + ', '.join(recased))
if adopted:
    print('  capitalised on the corpus, over a pointer: ' + '; '.join(adopted))
if declined:
    print('  a capitalised entry the corpus declined: ' + '; '.join(declined))
if refused:
    print('  left lower-case, the corpus says a common noun: ' + '; '.join(refused))

for e in entries:
    f_ = freq.get(e['word'].lower(), 0) or freq.get(e['lemma'].lower(), 0)
    if not f_ and e['multiword']:
        f_ = counts.get(e['key'], 0) * scale
    e['freq'] = f_

entries.sort(key=lambda e: (-e['freq'], e['display'].lower()))
# ------------------------------------------------------------------ duplicates
# **A REPAIR CAN COLLIDE WITH A WORD THE LIST ALREADY PRINTS CORRECTLY**, and
# then the band teaches it twice.  C1 lists `oscurita` AND `oscurità`, `assurdita`
# and `assurdità`, `incastrar` and `incastrare`, `milionare` and `milionario` --
# the list carries both the broken spelling and the right one -- so once the
# accent rule, the truncated-infinitive rule and RESPELL have done their work,
# eleven pairs of entries resolve to one word.  Two cards with the same front,
# the same meaning and two separate schedules is the reader answering one
# question twice, and nothing else in this pipeline can see it: every count is
# healthy, both cards are perfectly formed, and `parse_cils` deduped correctly on
# what the page prints.
#
# The FIRST is kept, which after the ordering above is the commoner spelling, and
# a pair that is not really the same word is reported rather than merged.
#
# **THE KEY IS THE EXACT SPELLING AND MUST NEVER BE FOLDED.**  Written with
# `fold`, which ignores diacritics, this deleted `sì`, `lì`, `là`, `né` and `sé`
# from A1 -- five of the commonest words in the language -- because in Italian
# the accent on a monosyllable is precisely what distinguishes two different
# words: `si` is the reflexive pronoun and `sì` is yes, `ne` is "of it" and `né`
# is "nor", `se` is "if" and `sé` is "oneself".  The A1 list prints both members
# of each pair and is right to.  What this is deduping is two spellings that the
# repairs have already made IDENTICAL, so equality is the whole test; the
# disagreement warning below is what caught it.
seen_disp, dupes, odd = {}, [], []
for e in list(entries):
    k = e['display']
    first = seen_disp.get(k)
    if first is None:
        seen_disp[k] = e
        continue
    if (first['lemma'], first['pos']) != (e['lemma'], e['pos']):
        odd.append(f"{e['display']} ({first['lemma']}/{first['pos']} vs {e['lemma']}/{e['pos']})")
    dupes.append(f"{first['word']} + {e['word']} -> {e['display']}")
    entries.remove(e)
if dupes:
    print(f'  the list printed the same word twice, once misspelt: {len(dupes)} -- '
          + '; '.join(dupes))
if odd:
    print('  ⚠ merged entries that disagree about lemma or part of speech: ' + '; '.join(odd))

# **AND NOW THE LOWER LEVELS AGAIN, ON THE SPELLING THAT ACTUALLY SHIPS.**  The
# pass at the top of this file tests the word as the LIST PRINTS IT, which is
# right for a word that arrives already spelt correctly and useless for one this
# pipeline has repaired: C1 prints `risolver`, no band carries that, so it passes
# -- and the truncated-infinitive rule then adopts `risolvere`, which A1 has
# taught since the day it was built.  Eight words shipped twice that way
# (`risolvere`, `dimostrare`, `convincere`, `impedire`, `interrogare`,
# `seppellire`, `assicurare`, `abbattere`), each as two cards with the same
# front, the same meaning and two schedules.
#
# **NOTHING IN A SINGLE BAND CAN SEE IT.**  The six MindDory bands are strictly
# disjoint, so every in-band count is healthy and both cards are perfectly
# formed; the collision exists only BETWEEN two files, and the only artefact that
# holds two bands at once is the combined deck.  `check-combined.js` is what
# found it and is what will find the next one.
#
# The first pass is kept rather than replaced: it is what stops a word that was
# never going to survive being looked up, ordered and given example sentences.
late = []
for e in list(entries):
    if e['display'].lower() in below:
        late.append(e['display'])
        entries.remove(e)
if late:
    print(f'  …and {len(late)} more once the spelling settled, which the printed '
          f'form hid: ' + ', '.join(late))

unseen = sum(1 for e in entries if not e['freq'])
print(f'  ordered by frequency; {unseen} words the subtitle list has never seen, '
      'which go to the end')
print('  first fifteen:', ', '.join(e['display'] for e in entries[:15]))
print('  last five:', ', '.join(e['display'] for e in entries[-5:]))

# ------------------------------------------------- what kind of list this is
# A MEASUREMENT REPORTED ON EVERY RUN, not a filter.  De Mauro's *nuovo
# vocabolario di base della lingua italiana* is the standard reference for what
# the core of the language actually is -- the roughly 7,000 words an Italian
# adult uses and understands without effort.  Reporting how much of a band falls
# inside it is the cheapest honest check there is on a list that calls itself
# A1, and it is printed rather than acted on: the band is the one that was
# asked for, and the number simply says what kind of list it is.
try:
    nvdb = set(fold(w.strip()) for w in open('nvdb.words.txt', encoding='utf-8') if w.strip())
except FileNotFoundError:
    nvdb = set()
if nvdb:
    for e in entries:
        e['nvdb'] = fold(e['word']) in nvdb        # `emit` states this figure
    inside = [e for e in entries if e['nvdb']]
    top = entries[:200]
    inside_top = [e for e in top if e['nvdb']]
    print(f'  De Mauro basic vocabulary: {len(inside)} of {len(entries)} '
          f'({100 * len(inside) // max(1, len(entries))}%) of the band, '
          f'{len(inside_top)} of the first {len(top)} by frequency')

json.dump(entries, open(lvlf('entries.json'), 'w'), ensure_ascii=False, indent=1)
print('  words:', len(entries))
