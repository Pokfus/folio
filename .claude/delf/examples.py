#!/usr/bin/env python3
"""Pick up to three Tatoeba example sentences for each word.

A port of the German stage's shape.  Two of the three things that made that one
hard do not arise in French -- there are no separable verbs, and capitalisation
carries no information, so the whole apparatus that kept `essen` out of `das
Essen`'s examples is simply not needed here.  What French adds instead:

  · A PRONOMINAL VERB NEEDS ITS PRONOUN, AND THE PRONOUN HAS TO AGREE.  `se
    lever` is `lever` plus a pronoun, and the bare verb means something else --
    `lever` is to raise something, `se lever` is to get up -- so a sentence is
    only an example of the pronominal verb when the pronoun is there and matches
    the person of the verb: `je me lève` yes, `il lève la main` no.  The German
    stage learnt this on `sich freuen`; French needs it on the five `se` entries,
    and needs it harder, because the pronoun ELIDES (`je m'appelle`) and so is
    not the same string twice.

  · ELISION IS THE TOKENISER'S FRIEND AND THE PHRASE-MATCHER'S ENEMY.  `l'arbre`
    tokenises to `l` + `arbre`, which finds the noun for nothing.  But a phrase
    is matched against the TEXT, and `sac à dos` survives elision while
    `tout le monde` sits next to `tout l'monde` in speech; the literal match is
    what the list means and is what is used.

  · THE COMMONEST FRENCH WORDS ARE ONE OR TWO LETTERS AND MOST OF THEM ARE TWO
    WORDS.  `a` is a form of `avoir` and the preposition is `à`; `est` is a form
    of `être` and the east; `suis` belongs to `être` and to `suivre`; `lit`,
    `porte`, `montre`, `danse`, `livre` and `court` are each a noun this deck
    teaches and a verb form of another word in it.  The ambiguity penalty in
    `score` is what keeps those apart, and it is heavier here than in German
    because the collisions are commoner.

Tatoeba is a general corpus and carries adult, violent and graphic sentences,
which a vocabulary deck sat an exam candidate in front of must not deal out; the
two blocklists below are the German stage's, translated and extended.
"""
import json, re
from collections import defaultdict

from delf_level import f as lvlf

entries = json.load(open(lvlf('entries.json')))
W = json.load(open(lvlf('wikt.json')))

KEYS = [e['key'] for e in entries]
BYKEY = {e['key']: e for e in entries}

# `table-tags` and `inflection-template` are kaikki's own scaffolding rows;
# `multiword-construction` is the compound-tense placeholder (`avoir + past
# participle`, `simple imperative of avoir + past participle`), which is a
# sentence about the paradigm rather than a form of the verb.  Indexed as forms
# they would make every verb in the deck match every sentence containing `avoir`.
SKIP_TAGS = {'table-tags', 'inflection-template', 'error-unrecognized-form',
             'multiword-construction', 'class'}

# THE FRENCH ALPHABET, AND WHY A FORM HAS TO BE TESTED AGAINST IT.  kaikki's
# French conjugation tables interleave the PRONUNCIATION into the forms list with
# the same tags as the spelling it belongs to: `parler` carries `paʁl` beside
# `parle`, tagged first-person singular present indicative, and `aimer`, `manger`
# and `penser` do the same.  Indexed as a form it can never match a sentence, so
# it is harmless there -- and it is NOT harmless where a form is read off the
# table to print on a card, which is where it would end up in a conjugation.
#
# THE OBVIOUS TEST IS TO LOOK FOR IPA CHARACTERS AND IT IS WRONG.  Written that
# way it also drops `sœurs` and `œufs`, because `œ` is a French LETTER and not an
# IPA symbol -- two of the plurals this very list needs.  So the test is positive:
# a form is a form when every character in it is one French orthography uses.
# Measured over the whole list, that keeps 4,023 forms and drops the 8 that are
# pronunciations.
FR_ALPHA = set("abcdefghijklmnopqrstuvwxyzàâäçéèêëîïôöùûüÿœæ-' ")


def spelled(s):
    return s and set(s.lower()) <= FR_ALPHA


# AN ESSENTIALLY PRONOMINAL VERB CARRIES ITS PRONOUN INSIDE ITS OWN FORMS, and
# every form-reader here drops anything with a space in it.  `se souvenir` does
# not exist without the pronoun, so Wiktionary conjugates it `me souviens`, `te
# souviens`, `se souvient` -- and all six persons were thrown away, leaving that
# card with no examples at all while `se laver`, whose bare verb is a real word,
# had three.  The pronoun is stripped back off and the bare form indexed, which
# costs nothing in precision because `reflexive_here` then requires the pronoun
# to be there and to agree.  Inert on every other verb: nothing else has a form
# beginning `me `.
DEPRON_RX = re.compile(r"^(?:me|te|se|nous|vous)[  ]|^[mts]'")


def depronoun(s):
    return DEPRON_RX.sub('', s).strip()


def forms_of(lemma):
    """Every inflected form Wiktionary lists for a lemma, as lowercase strings."""
    out = {}
    for r in W.get(lemma, []):
        for f in r.get('forms', []):
            s = depronoun((f.get('form') or '').strip())
            tags = set(f.get('tags') or [])
            if not s or s in ('-', '—') or (tags & SKIP_TAGS) or not spelled(s):
                continue
            if len(s) < 1 or ' ' in s:
                continue
            out.setdefault(s.lower(), set()).update(tags)
    return out


FORM2KEY = defaultdict(set)        # single-token form -> keys
PHRASES = {}                       # key -> the string to look for in the text

for e in entries:
    key, lemma = e['key'], e['lemma']
    # A HYPHENATED HEADWORD IS MATCHED AGAINST THE TEXT, NOT AGAINST A TOKEN.
    # `-` is not a word character, so `rendez-vous` never occurs as a token and
    # is not a `phrase` either, that test being a space -- which left eight cards
    # across the two levels (`là-bas`, `grand-mère`, `grand-père`, `après-midi`,
    # `peut-être`, `rendez-vous`, `petit-déjeuner`, `micro-ondes`) with no
    # examples at all, silently, since a word with none simply prints none.  It
    # is the mirror of `compound_here` one line down: that rule stops a HALF of a
    # compound matching, and this one lets the WHOLE of one match.
    if e['phrase'] or '-' in e['word']:
        PHRASES[key] = e['word'].lower()
        continue
    surfaces = dict(forms_of(lemma))
    surfaces.setdefault(e['word'].lower(), set())
    if e['reflexive']:
        # the pronoun is not part of any form Wiktionary lists, so the bare verb's
        # forms are what is indexed and `reflexive_here` is what decides
        surfaces.pop(e['word'].lower(), None)
    for s in surfaces:
        FORM2KEY[s].add(key)

PHRASE_RX = {k: re.compile(r'(?<![^\W\d_])' + re.escape(w) + r'(?![^\W\d_])',
                           re.I | re.UNICODE) for k, w in PHRASES.items()}
print('  distinct forms indexed:', len(FORM2KEY), ' phrases:', len(PHRASES))

# ---------------------------------------------------------------- corpus
fra, eng, link = {}, {}, {}
for line in open('fra_sentences_detailed.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) >= 3:
        fra[p[0]] = p[2]
for line in open('eng_sentences.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) >= 3:
        eng[p[0]] = p[2]
for line in open('fra-eng_links.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) == 2 and p[0] not in link:
        link[p[0]] = p[1]
print('  fra:', len(fra), 'eng:', len(eng), 'links:', len(link))

freq = {}
for i, l in enumerate(open('fr_50k.txt', encoding='utf-8')):
    t = l.split()
    if t:
        freq.setdefault(t[0], i)

# any letter, not just the ASCII ones: a tokeniser that splits on the accents
# loses `été` and `français` outright.  The apostrophe is deliberately NOT a word
# character, so `l'arbre` gives up `arbre` and `j'aime` gives up `aime`.
TOKEN = re.compile(r"[^\W\d_]+", re.UNICODE)

BLOCK_RX = re.compile(
    r"\b(?:"
    r"sexe|sexuel\w*|viol|viols|violer|violé\w*|nu|nue|nues|porno\w*|pute|"
    r"salope|merde|merdes|putain|cul|culs|bite|penis|pénis|vagin|seins|"
    r"drogue|drogues|cocaïne|héroïne|marijuana|ivre|bourré\w*|soûl\w*|"
    r"meurtre|assassin\w*|suicide|prostitué\w*|enceinte|"
    r"sexy|fuck\w*|shit\w*|bitch|whore|slut|porn\w*|naked|nude|"
    r"rape|raped|rapist|boobs|breasts|asshole|damn|bastard|"
    r"drug|drugs|cocaine|heroin|marijuana|drunk|prostitute|pregnant"
    r")\b", re.I)

SOFT_RX = re.compile(
    r"\b(?:tuer|tue|tué\w*|mort|morte|morts|mourir|meurt|guerre|arme|armes|"
    r"pistolet|sang|déteste|cancer|hôpital|"
    r"kill(?:ed|s)?|death|died|dead|murder\w*|war|gun|weapon|blood|hate|"
    r"cancer|hospital)\b", re.I)

# The pronominal pronouns, and what person and number each marks.  `se` covers
# both third persons and either number; `nous` and `vous` are also the subject
# pronouns, which is why agreement is tested rather than mere presence.
REFL_PN = {'me': {('1', 's')}, 'm': {('1', 's')},
           'te': {('2', 's')}, 't': {('2', 's')},
           'se': {('3', 's'), ('3', 'p')}, 's': {('3', 's'), ('3', 'p')},
           'nous': {('1', 'p')}, 'vous': {('2', 'p'), ('2', 's')}}

# ...AND IN AN IMPERATIVE IT IS A DIFFERENT WORD.  Behind the verb the pronoun is
# unstressed (`tu te laves`); in front of nothing, hooked on behind with a hyphen,
# French uses the STRESSED form instead -- `Lave-toi`, `Souviens-toi`, `Amuse-toi`
# -- and `toi` and `moi` are not in the table above at all, so `Lave-toi les
# mains` read as the plain verb and sat on `laver`'s card.  They are kept in a
# table of their own rather than added to that one, because before a verb `moi`
# and `toi` are ordinary stressed pronouns and mark nothing (`c'est à moi de
# jouer`).  Only 1s, 2s, 1p and 2p occur: French has no third-person imperative.
ENCL_PN = {'moi': {('1', 's')}, 'toi': {('2', 's')},
           'nous': {('1', 'p')}, 'vous': {('2', 'p'), ('2', 's')}}

FORM_PN = defaultdict(set)
PART_OF = defaultdict(set)         # key -> its past-participle forms
REFLEXIVE = {e['key'] for e in entries if e['reflexive']}
for key in REFLEXIVE:
    for r in W.get(BYKEY[key]['lemma'], []):
        if r.get('pos') != 'verb':
            continue
        for f in r.get('forms', []):
            tg = set(f.get('tags') or [])
            s = depronoun((f.get('form') or '').lower())
            if not s or ' ' in s or 'subjunctive' in tg or not spelled(s):
                continue
            p = ('1' if 'first-person' in tg else '2' if 'second-person' in tg
                 else '3' if 'third-person' in tg else None)
            n = 's' if 'singular' in tg else 'p' if 'plural' in tg else None
            if 'participle' in tg and 'past' in tg:
                PART_OF[key].add(s)
            if p and n:
                FORM_PN[(key, s)].add((p, n))

# WHERE THE LIST TEACHES BOTH MEMBERS OF A PAIR, A PRONOMINAL SENTENCE BELONGS TO
# THE PRONOMINAL CARD.  The A2 page prints `promener` and `se promener`, and
# `sentir` and `se sentir` -- and the two cards of each pair came out sharing an
# example word for word ("Ils se promenèrent le long de la plage" sat on both),
# because a reflexive occurrence matches the bare verb's forms as readily as the
# pronominal's.  `reflexive_here` already existed to REQUIRE the pronoun for the
# pronominal card; this is the same test read the other way to EXCLUDE it from
# the plain one, and it is safe only because the pronominal is on the list: where
# it is not, `se` before a plain verb is very often the ordinary passive-reflexive
# ("la porte se ferme", "ça se voit"), which illustrates that verb perfectly well
# and is deliberately left alone.  The two share a lemma, so the pronominal key's
# own person/number table answers for both.
#
# AND THE PAIR MUST BE TWO DIFFERENT ENTRIES, which is not the tautology it
# looks like: an ESSENTIALLY pronominal verb has no bare form, so kaikki files
# it under the phrase and its own lemma is its own word -- `se souvenir` mapped
# to itself, every occurrence was read as "belongs to the other card", and the
# card came out with no examples at all while the corpus held a thousand.
PAIRED = {}
_by_word = {e['word']: e['key'] for e in entries}
for e in entries:
    if e['reflexive'] and _by_word.get(e['lemma'], e['key']) != e['key']:
        PAIRED[_by_word[e['lemma']]] = e['key']


# A NOUN'S EXAMPLES MUST NOT BE SENTENCES WHERE THE SAME STRING IS A PARTICIPLE.
# This is the German deck's `essen` / `das Essen` collision arriving in a language
# that has no capitalisation to settle it.  `l'été` is the summer AND the past
# participle of `être`, so the card teaching `summer` was illustrated with "Tout
# le monde a ÉTÉ invité sauf moi" -- "everyone was invited" -- which is a
# grammatical, well-translated sentence that teaches the wrong word entirely.
# The ambiguity penalty in `score` cannot help, because EVERY occurrence of `été`
# is ambiguous and the penalty falls on all of them equally.
#
# What separates the two readings is the position: a past participle follows a
# conjugated form of `avoir` or `être`, and a noun there would need a determiner
# in between (`a été invité` against `a un été chaud`).  So a noun hit is declined
# when the word is a past participle of some verb AND the token before it is a
# finite form of one of the two auxiliaries.  Both sets are READ from the dump
# rather than written down.  It is deliberately narrow: `il est médecin`, a noun
# with no article after `est`, is the one shape it costs, which is a handful of
# candidates out of hundreds -- and under-marking beats mis-marking.
AUX_FINITE = set()
for _lemma in ('avoir', 'être'):
    for _r in W.get(_lemma, []):
        if _r.get('pos') != 'verb':
            continue
        for _f in _r.get('forms', []):
            _tg = set(_f.get('tags') or [])
            _s = (_f.get('form') or '').strip().lower()
            if _s and spelled(_s) and ' ' not in _s and not (_tg & SKIP_TAGS) and \
                    (_tg & {'first-person', 'second-person', 'third-person'}):
                AUX_FINITE.add(_s)

PAST_PART = set()
for _recs in W.values():
    for _r in _recs:
        if _r.get('pos') != 'verb':
            continue
        for _f in _r.get('forms', []):
            _tg = set(_f.get('tags') or [])
            _s = (_f.get('form') or '').strip().lower()
            if _s and spelled(_s) and ' ' not in _s and 'participle' in _tg and 'past' in _tg:
                PAST_PART.add(_s)

NOUNS = {e['key'] for e in entries if e['pos_hint'] == 'noun'}
print('  auxiliary finite forms:', len(AUX_FINITE), ' past participles:', len(PAST_PART))


# AN ADVERB COMES BETWEEN THE AUXILIARY AND THE PARTICIPLE, which is why the look
# back is a short scan rather than one token.  Written as "the word before it",
# the rule caught `a été invité` and walked straight past `n'ai jamais été` --
# which is what the card then showed instead, so the fault survived its own fix.
# A DETERMINER STOPS THE SCAN: `a un été chaud` is the auxiliary, an article and
# then the NOUN, and that is the shape the rule must not eat.
DETERMINER = set("le la les l un une des du de ce cet cette ces mon ma mes ton ta "
                 "tes son sa ses notre nos votre vos leur leurs quel quelle au aux "
                 "cet quelques plusieurs chaque".split())


# A HYPHEN EITHER ATTACHES A CLITIC OR BUILDS A COMPOUND WORD, and the tokeniser
# cannot tell the two apart because it treats `-` as a boundary exactly as it
# treats the apostrophe.  That is right half the time and wrong the other half:
# `Donnez-moi`, `pensez-vous`, `Amuse-toi` and `adresse-t-il` are the verb the
# card is teaching with its pronoun stuck on, and a French learner wants to see
# them -- while `passe-temps`, `porte-monnaie`, `couvre-feu`, `sèche-linge`,
# `après-midi`, `centre-ville` and `sous-entends` are single words that mean
# something the halves do not, so matching `temps` inside a hobby teaches the
# wrong word under the right headword.  Measured over both decks before the rule
# was written: 72 hyphen-adjacent matches, of which about fifteen are compounds.
#
# What separates them is a CLOSED CLASS.  Everything a hyphen legitimately
# attaches is a clitic pronoun or a deictic particle -- a list of two dozen words
# that has not grown since the seventeenth century -- so a match beside a hyphen
# is kept when either side of that hyphen is one of them and dropped otherwise.
# It is deliberately a test on the NEIGHBOUR rather than on the compound: asking
# whether `passe-temps` is "a word" would need a dictionary of compounds, and the
# one to hand holds only the five hundred headwords this deck teaches.
CLITIC = set("moi toi lui soi nous vous leur le la les y en je tu il elle on "
             "ils elles ce ci là t s m ledit".split())


def compound_here(text, spans, i):
    """Is this token half of a hyphenated compound rather than a word of its own?"""
    a, b = spans[i].span()
    for side, j in ((a - 1, i - 1), (b, i + 1)):
        if 0 <= side < len(text) and text[side] == '-':
            other = spans[j].group(0).lower() if 0 <= j < len(spans) else ''
            if spans[i].group(0).lower() not in CLITIC and other not in CLITIC:
                return True
    return False


def participle_here(toks, i, t):
    """Is this token a past participle sitting in its compound-tense slot?"""
    if t not in PAST_PART:
        return False
    for j in range(i - 1, max(-1, i - 4), -1):
        if toks[j] in DETERMINER:
            return False
        if toks[j] in AUX_FINITE:
            return True
    return False


def reflexive_here(toks, i, form, key, text='', spans=()):
    """Is this occurrence the pronominal verb, and not the plain one?

    The pronoun sits DIRECTLY before the verb in an ordinary clause (`je me
    lève`, `il s'appelle`) and directly before the auxiliary in a compound tense
    (`je me suis levé`), so the window is small and behind: a `se` three words
    the other side of the verb belongs to something else.  `m'`, `t'` and `s'`
    tokenise to `m`, `t` and `s`, which is why those are in REFL_PN.

    A PAST PARTICIPLE CARRIES NO PERSON, so there is nothing for the pronoun to
    agree WITH and the person test above cannot run on one -- which is why the
    compound tense this docstring claimed to handle did not in fact work: `Il
    s'est senti mis à l'écart` was invisible to it, and the sentence sat on the
    plain `sentir`'s card.  The auxiliary carries the person, and the pronoun
    stands in front of the auxiliary rather than the participle, so on a
    participle the window test runs on its own: any reflexive pronoun within the
    same three tokens is taken as marking it.  Looser than the finite case by
    exactly as much as the form itself is less informative.
    """
    pn = FORM_PN.get((key, form))
    if not pn and form not in PART_OF.get(key, ()):
        return False
    for j in range(max(0, i - 3), i):
        c = toks[j]
        if c in REFL_PN and (not pn or (REFL_PN[c] & pn)):
            return True
    # AND IN AN IMPERATIVE IT FOLLOWS, HYPHENATED: `Lave-toi les mains` is `se
    # laver` and sat on the plain verb's card, because a window that only ever
    # looks behind cannot see an enclitic.  One token forward, and only across a
    # hyphen, which is what makes it narrow -- `lave toi` is not French.
    if spans and i + 1 < len(spans):
        gap = text[spans[i].end():spans[i + 1].start()]
        c = toks[i + 1]
        if gap == '-' and c in ENCL_PN and (not pn or (ENCL_PN[c] & pn)):
            return True
    return False


cand = defaultdict(list)
for sid, text in fra.items():
    eid = link.get(sid)
    if not eid or eid not in eng:
        continue
    if '"' in text or '«' in text:
        continue
    if BLOCK_RX.search(text) or BLOCK_RX.search(eng[eid]):
        continue
    spans = list(TOKEN.finditer(text))
    toks = [m.group(0).lower() for m in spans]
    raw = [m.group(0) for m in spans]
    n = len(toks)
    if n < 3 or n > 14:
        continue
    hits = {}
    for i, t in enumerate(toks):
        part = participle_here(toks, i, t)
        if compound_here(text, spans, i):
            continue
        for key in FORM2KEY.get(t, ()):
            if key in REFLEXIVE and not reflexive_here(toks, i, t, key, text, spans):
                continue
            if key in PAIRED and reflexive_here(toks, i, t, PAIRED[key], text, spans):
                continue
            if part and key in NOUNS:
                continue
            hits.setdefault(key, raw[i])
    low = text.lower()
    for key, w in PHRASES.items():
        if w in low and PHRASE_RX[key].search(text):
            hits.setdefault(key, w)
    if not hits:
        continue
    hard = sum(1 for t in toks if freq.get(t, 99999) > 8000)
    for key, form in hits.items():
        if len(cand[key]) < 400:
            cand[key].append((sid, eid, form, n, hard))

print('  words with at least one candidate:', len(cand))


# ---------------------------------------------------------------- choose three
def score(c, key):
    sid, eid, form, n, hard = c
    s = abs(n - 8) * 1.0            # around eight words reads best on a card
    s += hard * 2.5                 # penalise rare vocabulary
    s += 0.5 * len(eng[eid].split()) / 8.0
    if SOFT_RX.search(fra[sid]) or SOFT_RX.search(eng[eid]):
        s += 6.0
    # A FORM SHARED WITH ANOTHER WORD IN THE DECK IS PROBABLY THE OTHER WORD.
    # French collides constantly -- `lit`, `porte`, `montre`, `danse`, `livre`,
    # `court`, `sale`, `est`, `a`, `suis` are all two entries here -- so a
    # sentence whose only hit is an ambiguous form is pushed a long way down.
    amb = len(FORM2KEY.get(form.lower(), ()))
    if amb > 1:
        s += 12.0 * (amb - 1)
    if form.lower() == BYKEY[key]['word'].lower():
        s -= 1.0
    return s


chosen = {}
for key, cs in cand.items():
    # THE TIE-BREAK IS WHAT MAKES THE BUILD REPRODUCIBLE.  Two candidates scoring
    # the same are ordered by whatever the sort was handed, and what it was handed
    # comes off a dict built from a SET of hits -- whose order depends on the hash
    # seed and therefore changes between runs.  The sentence id is unique, so
    # ordering on it as well makes the sort total.
    cs.sort(key=lambda c: (score(c, key), int(c[0])))
    out, seen_forms, seen_txt = [], set(), set()
    for c in cs:
        sid, eid, form, n, hard = c
        t = fra[sid]
        if t in seen_txt:
            continue
        # three different inflected forms teach more than the same one thrice
        if form.lower() in seen_forms and len(out) < 3 and len(cs) > 6:
            continue
        seen_forms.add(form.lower())
        seen_txt.add(t)
        out.append({'fr': t, 'en': eng[eid], 'form': form})
        if len(out) == 3:
            break
    if len(out) < 3:
        for c in cs:
            sid, eid, form, n, hard = c
            if fra[sid] in seen_txt:
                continue
            seen_txt.add(fra[sid])
            out.append({'fr': fra[sid], 'en': eng[eid], 'form': form})
            if len(out) == 3:
                break
    chosen[key] = out

three = sum(1 for v in chosen.values() if len(v) == 3)
print('  with three:', three, ' with any:', len(chosen), ' with none:', len(KEYS) - len(chosen))
json.dump(chosen, open(lvlf('examples.json'), 'w'), ensure_ascii=False)
