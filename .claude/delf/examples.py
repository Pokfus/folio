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


def forms_of(lemma):
    """Every inflected form Wiktionary lists for a lemma, as lowercase strings."""
    out = {}
    for r in W.get(lemma, []):
        for f in r.get('forms', []):
            s = (f.get('form') or '').strip()
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
    if e['phrase']:
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

FORM_PN = defaultdict(set)
REFLEXIVE = {e['key'] for e in entries if e['reflexive']}
for key in REFLEXIVE:
    for r in W.get(BYKEY[key]['lemma'], []):
        if r.get('pos') != 'verb':
            continue
        for f in r.get('forms', []):
            tg = set(f.get('tags') or [])
            s = (f.get('form') or '').lower()
            if not s or 'subjunctive' in tg or not spelled(s):
                continue
            p = ('1' if 'first-person' in tg else '2' if 'second-person' in tg
                 else '3' if 'third-person' in tg else None)
            n = 's' if 'singular' in tg else 'p' if 'plural' in tg else None
            if p and n:
                FORM_PN[(key, s)].add((p, n))


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


def reflexive_here(toks, i, form, key):
    """Is this occurrence the pronominal verb, and not the plain one?

    The pronoun sits DIRECTLY before the verb in an ordinary clause (`je me
    lève`, `il s'appelle`) and directly before the auxiliary in a compound tense
    (`je me suis levé`), so the window is small and behind: a `se` three words
    the other side of the verb belongs to something else.  `m'`, `t'` and `s'`
    tokenise to `m`, `t` and `s`, which is why those are in REFL_PN.
    """
    pn = FORM_PN.get((key, form))
    if not pn:
        return False
    for j in range(max(0, i - 3), i):
        c = toks[j]
        if c in REFL_PN and (REFL_PN[c] & pn):
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
    toks = [t.lower() for t in TOKEN.findall(text)]
    raw = TOKEN.findall(text)
    n = len(toks)
    if n < 3 or n > 14:
        continue
    hits = {}
    for i, t in enumerate(toks):
        part = participle_here(toks, i, t)
        for key in FORM2KEY.get(t, ()):
            if key in REFLEXIVE and not reflexive_here(toks, i, t, key):
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
