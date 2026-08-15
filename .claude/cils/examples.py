#!/usr/bin/env python3
"""Pick up to three Tatoeba example sentences for each word.

A port of the DELE and Goethe stages' shape.  Italian drops the two things that
made the German one hard -- there are no separable verbs and no capitalised
nouns -- and brings three of its own:

  · **THE FORMS ARE SPELLED WRONG IN THE DICTIONARY.**  Every form in the dump
    carries a tonic stress mark Italian does not write (`pàrlo`, `parlàvano`),
    so an index built straight off them matches nothing at all in a corpus of
    real Italian.  Everything goes through `destress` on the way in.  It is a
    LOUD failure if forgotten -- every word comes back with no examples -- which
    is the good kind, and it is asserted below rather than left to be noticed.

  · **A REFLEXIVE'S FORMS ARE TWO TOKENS AND THE CLITIC IS PART OF THE FORM.**
    Wiktionary files `chiamarsi` with its pronouns already attached (`mi
    chiamo`, `ti chiami`), which is exactly what the German stage had to
    reconstruct by hand for `sich freuen` -- so the pair is simply matched as an
    adjacent string.  It also does the job the German rule was written for: the
    bare verb `chiamare` means "to call" and only the pronoun makes it "to be
    called", so requiring the clitic keeps the two apart.

  · **ITALIAN VERB FORMS COLLIDE WITH NOUNS CONSTANTLY** -- `porta` is a door
    and "he carries", `stato` a state and "been", `sono` "I am" and "they are",
    `casa` a house and a form of `casare`.  There is no capitalisation to tell
    them apart as there is in German, so the ambiguity PENALTY in `score` is
    doing much more work here: a sentence whose matched form belongs to more
    than one word in the deck is pushed down the list, and a word with better
    candidates never sees it.

Tatoeba is a general corpus and carries adult, violent and graphic sentences,
which a vocabulary deck sat an exam candidate in front of must not deal out; the
two blocklists below are the sibling stages', translated and extended.
"""
import json, re, sys
from collections import defaultdict

from cils_level import f as lvlf
from italian import destress

entries = json.load(open(lvlf('entries.json')))
W = json.load(open(lvlf('wikt.json')))

KEYS = [e['key'] for e in entries]
BYKEY = {e['key']: e for e in entries}

# `auxiliary` is the killer of these, and it is the same one the German stage
# records: an Italian verb's table names `avere` or `essere` as the auxiliary
# its compound tenses take, as a form row of its own carrying nothing but that
# word.  Indexed as a form, it makes EVERY verb in the deck match EVERY sentence
# containing `ho`, `hai`, `è` or `sono`.
SKIP_TAGS = {'table-tags', 'inflection-template', 'error-unrecognized-form',
             'auxiliary', 'class', 'multiword-construction'}


def forms_of(lemma, pos=''):
    """Every inflected form Wiktionary lists for a lemma, destressed, lowercased.

    A form may carry a space -- a reflexive's `mi chiamo` -- so it comes back
    with its tag set and the two shapes are told apart by the caller.

    **RESTRICTED TO THE PART OF SPEECH THE CARD IS ABOUT**, which is the fix for
    the worst example fault this deck has had.  A lemma's records are pooled per
    SPELLING, not per word: `fatto` is a noun ("fact") and the past participle
    of `fare` ("made"), and the participle record brings `fatta`, `fatte` and
    `fatti` with it.  Indexed together, the noun `il fatto` came out illustrated
    by "I biscotti FATTI in casa sono i migliori" (home-made biscuits), "Le
    bottiglie di birra sono FATTE di vetro" and "Quella coppia era FATTA una per
    l'altro" -- three sentences, none of them about a fact, every count healthy
    and the card perfectly formed.  Found by looking at it.

    The fallback is deliberate: a part of speech with no forms of its own (an
    adverb, a preposition) keeps the whole pool, since for those the pool is the
    headword and there is nothing to confuse it with.
    """
    recs = W.get(lemma, [])
    same = [r for r in recs if r.get('pos') == pos] if pos else []
    out = {}
    for r in (same or recs):
        for f in r.get('forms', []):
            s = destress((f.get('form') or '').strip()).lower()
            tags = set(f.get('tags') or [])
            if not s or s in ('-', '—') or (tags & SKIP_TAGS):
                continue
            if len(s) < 2 or s.count(' ') > 1:
                continue
            out.setdefault(s, set()).update(tags)
    return out


# The reflexive clitics, which is what a two-token form has to START with to be
# a reflexive pair rather than a compound tense.  `ci` and `vi` are on the list
# because they are the first and second person plural (`ci chiamiamo`), not
# because of their locative senses.
CLITICS = {'mi', 'ti', 'si', 'ci', 'vi'}

FORM2KEY = defaultdict(set)        # single-token form -> keys
PAIRS = {}                         # key -> [(clitic, verb form), ...]
PHRASES = {}                       # key -> the string to look for in the text

for e in entries:
    key, lemma = e['key'], e['lemma']
    surfaces = dict(forms_of(lemma, e['pos']))
    surfaces.setdefault(destress(e['word']).lower(), set())
    if e['multiword']:
        PHRASES[key] = destress(e['word']).lower()
        continue
    pair = []
    for s, tags in surfaces.items():
        if ' ' in s:
            a, b = s.split(' ', 1)
            # a reflexive's clitic, and nothing else: any other two-token form
            # in an Italian table is a compound tense (`ho parlato`), whose
            # participle is indexed on its own line anyway
            if a in CLITICS:
                pair.append((a, b))
        else:
            FORM2KEY[s].add(key)
    if pair:
        PAIRS[key] = pair

PHRASE_RX = {k: re.compile(r'(?<![^\W\d_])' + re.escape(w) + r'(?![^\W\d_])',
                           re.I | re.UNICODE) for k, w in PHRASES.items()}

# every reflexive pair, indexed by its verb form, so a sentence is walked once
PAIR_BY_VERB = defaultdict(list)
for key, ps in PAIRS.items():
    for a, b in ps:
        PAIR_BY_VERB[b].append((a, key))

print('  distinct forms indexed:', len(FORM2KEY), ' reflexive pairs:',
      sum(len(v) for v in PAIRS.values()), ' phrases:', len(PHRASES))

# THE INDEX IS ASSERTED, not hoped for.  If `destress` were dropped, every form
# in here would carry an accent no Italian sentence has and the whole stage
# would come back empty -- which reads as "Tatoeba has no Italian" rather than
# as a spelling bug.
_stressed = [f for f in FORM2KEY if re.search(r'[àáèéìíòóùú]', f[:-1])]
if _stressed:
    raise SystemExit(f'{len(_stressed)} indexed forms still carry a non-final stress '
                     f'mark ({", ".join(_stressed[:5])}) -- destress is not being applied')

# ---------------------------------------------------------------- corpus
ita, eng, link = {}, {}, {}
for line in open('ita_sentences_detailed.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) >= 3:
        ita[p[0]] = p[2]
for line in open('eng_sentences.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) >= 3:
        eng[p[0]] = p[2]
for line in open('ita-eng_links.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) == 2 and p[0] not in link:
        link[p[0]] = p[1]
print('  ita:', len(ita), 'eng:', len(eng), 'links:', len(link))

freq = {}
for i, l in enumerate(open('it_50k.txt', encoding='utf-8')):
    t = l.split()
    if t:
        freq.setdefault(t[0], i)

# any letter, not just the ASCII ones: an apostrophe is a token boundary in
# Italian, which is what makes `l'acqua` findable as `acqua`
TOKEN = re.compile(r"[^\W\d_]+", re.UNICODE)

BLOCK_RX = re.compile(
    r"\b(?:"
    r"sesso|sessuale|sessuali|stupr\w*|nud[oaie]|porno\w*|puttana|troia|"
    r"cazz\w*|merd\w*|fott\w*|culo|pene|vagina|tette|scopare|"
    r"droga|droghe|cocaina|eroina|marijuana|ubriac\w*|"
    r"omicidi\w*|assassin\w*|suicidi\w*|prostitut\w*|incinta|"
    r"sexy|fuck\w*|shit\w*|bitch|whore|slut|porn\w*|naked|nude|"
    r"rape|raped|rapist|boobs|breasts|asshole|damn|bastard|"
    r"drug|drugs|cocaine|heroin|marijuana|drunk|prostitute|pregnant"
    r")\b", re.I)

SOFT_RX = re.compile(
    r"\b(?:uccid\w*|ucciso|mort[eoai]|morir\w*|morto|guerra|arma|armi|pistola|sangue|"
    r"odio|odiare|cancro|ospedale|malatt\w*|"
    r"kill(?:ed|s)?|death|died|dead|murder\w*|war|gun|weapon|blood|hate|"
    r"cancer|hospital|illness)\b", re.I)

# **AN ITALIAN NOUN ALMOST ALWAYS CARRIES A DETERMINER**, and that is this language's
# equivalent of the capital letter the German stage leans on.  Where a form is shared
# between a noun and a verb -- which in Italian is most of them -- the word in front of it
# is the strongest cheap signal of which one a sentence is using: `i fatti sono chiari` is
# the noun, `i biscotti fatti in casa` is not.  It is a PREFERENCE and not a bar, because a
# noun after a bare preposition takes no article at all (`in casa`, `a scuola`).
DETERMINER = {
    'il', 'lo', 'la', 'i', 'gli', 'le', "l'", 'un', 'uno', 'una', "un'",
    'del', 'dello', 'della', 'dei', 'degli', 'delle', "dell'",
    'al', 'allo', 'alla', 'ai', 'agli', 'alle', "all'",
    'dal', 'dallo', 'dalla', 'dai', 'dagli', 'dalle', "dall'",
    'nel', 'nello', 'nella', 'nei', 'negli', 'nelle', "nell'",
    'sul', 'sullo', 'sulla', 'sui', 'sugli', 'sulle', "sull'",
    'col', 'coi', 'questo', 'questa', 'questi', 'queste', 'quel', 'quello',
    'quella', 'quei', 'quegli', 'quelle', 'mio', 'mia', 'miei', 'mie', 'tuo',
    'tua', 'suo', 'sua', 'nostro', 'nostra', 'vostro', 'vostra', 'loro',
    'ogni', 'qualche', 'molti', 'molte', 'alcuni', 'alcune', 'tanti', 'tante',
    'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
}
NOUNS = {e['key'] for e in entries if e['pos'] == 'noun'}

# THE CLOSED CLASS AN INFLECTED FORM CAN COLLIDE WITH, whichever band the
# function word itself happens to be filed in.  Deliberately narrower than
# DETERMINER above, which also holds the possessives and demonstratives: those
# are ordinary words a card may legitimately be teaching, where nothing in this
# set is ever the headword of a content word.  Articles, the nine simple
# prepositions, every articulated preposition and the clitics.
FUNC_FORMS = {
    'il', 'lo', 'la', 'i', 'gli', 'le', "l'", 'un', 'uno', 'una', "un'",
    'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
    'del', 'dello', 'della', 'dei', 'degli', 'delle', "dell'",
    'al', 'allo', 'alla', 'ai', 'agli', 'alle', "all'",
    'dal', 'dallo', 'dalla', 'dai', 'dagli', 'dalle', "dall'",
    'nel', 'nello', 'nella', 'nei', 'negli', 'nelle', "nell'",
    'sul', 'sullo', 'sulla', 'sui', 'sugli', 'sulle', "sull'",
    'col', 'collo', 'colla', 'coi', 'cogli', 'colle',
    'mi', 'ti', 'si', 'ci', 'vi', 'ne', 'li', 'me', 'te', 'se', 'ce', 've',
}

cand = defaultdict(list)
for sid, text in ita.items():
    eid = link.get(sid)
    if not eid or eid not in eng:
        continue
    if '"' in text or '«' in text:
        continue
    if BLOCK_RX.search(text) or BLOCK_RX.search(eng[eid]):
        continue
    raw = TOKEN.findall(text)
    toks = [t.lower() for t in raw]
    n = len(toks)
    if n < 3 or n > 14:
        continue
    low = text.lower()
    hits, bare_noun = {}, set()
    for i, t in enumerate(toks):
        prev = toks[i - 1] if i else ''
        det = prev in DETERMINER
        for key in FORM2KEY.get(t, ()):
            hits.setdefault(key, raw[i])
            if key in NOUNS and det:
                bare_noun.discard(key)
            elif key in NOUNS:
                bare_noun.add(key)
        # a reflexive: the clitic sits immediately before its verb in every
        # finite clause, so the pair is required to be adjacent in the TEXT --
        # the tokeniser drops the punctuation that would otherwise let
        # "...aiuta mi, chiamo un taxi" read as `chiamarsi`
        for a, key in PAIR_BY_VERB.get(t, ()):
            if i and toks[i - 1] == a:
                hits.setdefault(key, f'{raw[i - 1]} {raw[i]}')
    for key, w in PHRASES.items():
        if w in low and PHRASE_RX[key].search(text):
            hits.setdefault(key, w)
    if not hits:
        continue
    hard = sum(1 for t in toks if freq.get(t, 99999) > 8000)
    for key, form in hits.items():
        if len(cand[key]) < 400:
            cand[key].append((sid, eid, form, n, hard, key in bare_noun))

print('  words with at least one candidate:', len(cand))


# ---------------------------------------------------------------- choose three
def same_en(s):
    """**TWO SENTENCES WITH ONE TRANSLATION ARE ONE EXAMPLE.**

    Tatoeba links several Italian renderings to the same English, so a card
    could show "Dio mio, Dio mio, perche mi hai abbandonato?" and "Mio Dio, mio
    Dio, perche mi hai abbandonato?" as two of its three examples -- with the
    same gloss printed under each, which is what makes it visible.  Measured
    over the two shipped bands before it was written: 320 cards did this, a
    sixth of them, each spending a slot on a sentence it was already showing.
    The Italian was already deduped; the English was not.

    Folded rather than compared outright, since the pairs differ by case and
    final punctuation as often as not.
    """
    return re.sub(r'[^a-z0-9 ]+', '', (s or '').lower()).strip()


def score(c, key):
    sid, eid, form, n, hard, bare = c
    s = abs(n - 8) * 1.0            # around eight words reads best on a card
    s += hard * 2.5                 # penalise rare vocabulary
    s += 0.5 * len(eng[eid].split()) / 8.0
    if SOFT_RX.search(ita[sid]) or SOFT_RX.search(eng[eid]):
        s += 6.0
    # THE AMBIGUITY PENALTY, which matters far more in Italian than in German:
    # `porta` is a door and a form of `portare`, and nothing in the spelling
    # says which.  A form belonging to several of the deck's words is pushed
    # down, so a word with better candidates never shows an ambiguous one.
    amb = len(FORM2KEY.get(form.lower(), ()))
    if amb > 1:
        s += 12.0 * (amb - 1)
    # **AND THE AMBIGUITY THAT MATTERS MOST IS WITH A WORD THE BAND HAS NOT GOT.**
    # `FORM2KEY` can only see collisions INSIDE this band, and the bands are
    # strictly disjoint -- so `dei`, which is the plural of `dio` and also `di` +
    # `i`, scored as unambiguous in A2 because `di` lives in A1.  The card came
    # out bolding the partitive article in "Ha tradito i suoi amici per dei
    # soldi" and calling it the plural of `dio`, which is not a near-miss but a
    # different word.  Two forms across the two bands do this (`dio` -> `dei`,
    # `dare` -> `dai`), and it is a PENALTY rather than a ban because both really
    # are forms of their word and may be all Tatoeba offers.
    if form.lower() in FUNC_FORMS and form.lower() != BYKEY[key]['word'].lower():
        s += 20.0
    if form.lower() == BYKEY[key]['word'].lower():
        s -= 1.0
    if bare:
        s += 5.0        # a noun with nothing in front of it is probably a verb
    return s


chosen = {}
for key, cs in cand.items():
    # THE TIE-BREAK IS WHAT MAKES THE BUILD REPRODUCIBLE -- the Goethe stage's
    # finding: two candidates scoring the same are ordered by whatever the sort
    # was handed, and that comes off a dict built from a set of hits, whose
    # order moves with the hash seed.  The sentence id is unique, so ordering on
    # it as well makes the sort total.
    cs.sort(key=lambda c: (score(c, key), int(c[0])))
    out, seen_forms, seen_txt, seen_en = [], set(), set(), set()
    for c in cs:
        sid, eid, form, n, hard, bare = c
        t = ita[sid]
        if t in seen_txt or same_en(eng[eid]) in seen_en:
            continue
        # …AND THE VARIETY RULE BELOW MUST NOT OUTRANK THAT PENALTY, which is how
        # `dei` survived it: `dio` has only two forms in the corpus, so once a
        # `Dio` sentence was taken the variety rule declined every other one and
        # the partitive was the only unseen form left to reach.  The scorer had
        # pushed it to the back and the selector fetched it anyway.  Refused
        # outright here and left to the top-up pass below, which is the whole
        # meaning of "a penalty, not a ban".
        if form.lower() in FUNC_FORMS and form.lower() != BYKEY[key]['word'].lower():
            continue
        # three different inflected forms teach more than the same one thrice
        if form.lower() in seen_forms and len(out) < 3 and len(cs) > 6:
            continue
        seen_forms.add(form.lower())
        seen_txt.add(t)
        seen_en.add(same_en(eng[eid]))
        out.append({'it': t, 'en': eng[eid], 'form': form})
        if len(out) == 3:
            break
    if len(out) < 3:
        for c in cs:
            sid, eid, form, n, hard, bare = c
            if ita[sid] in seen_txt or same_en(eng[eid]) in seen_en:
                continue
            # …and the top-up pass refuses it as well, which is what "a penalty,
            # not a ban" turned out to be worth on its own: NOTHING scores badly
            # enough to be left out of a pass that ignores the score.  `li` came
            # out illustrated by "Lo studio non è davvero una cosa facile" and
            # "Si è sposata con Tom lo scorso mese" -- the definite article,
            # twice, on a card teaching the pronoun "them".  One example with
            # the right word in it beats three with the wrong one.
            if form.lower() in FUNC_FORMS and form.lower() != BYKEY[key]['word'].lower():
                continue
            seen_txt.add(ita[sid])
            seen_en.add(same_en(eng[eid]))
            out.append({'it': ita[sid], 'en': eng[eid], 'form': form})
            if len(out) == 3:
                break
    chosen[key] = out

three = sum(1 for v in chosen.values() if len(v) == 3)
print('  with three:', three, ' with any:', len(chosen), ' with none:', len(KEYS) - len(chosen))
json.dump(chosen, open(lvlf('examples.json'), 'w'), ensure_ascii=False)
