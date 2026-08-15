#!/usr/bin/env python3
"""Pick up to three Tatoeba example sentences for each word.

A port of the DELE stage's shape, with the four things Portuguese does that
Spanish does not:

  · TATOEBA'S PORTUGUESE IS BRAZILIAN, ABOUT TEN TO ONE, and this deck teaches
    the European standard.  Measured over the 443,625 sentences in the export:
    `ônibus` 1,023 against `autocarro` 51, `trem` 794 against `comboio` 67,
    `celular` 359 against `telemóvel` 66, `café da manhã` 319 against
    `pequeno-almoço` 26, and the Brazilian progressive `está fazendo` 18,313
    against the European `está a fazer` 1,770.  A deck that deals those out is
    teaching the wrong variety in its own examples while the headword above
    them says otherwise.
    So a sentence carrying a Brazilian marker is REJECTED (`BR_RX`), which costs
    5.7% of the corpus and leaves 418,131 sentences -- far more than three per
    word needs.  WHAT THIS CANNOT DO is make the rest European: most of what
    remains is simply variety-neutral, because most sentences are ("O livro está
    em cima da mesa" is the same in Lisbon and in São Paulo).  The filter removes
    what is positively wrong for the exam; it cannot add what is positively
    right, and the deck's own description says so rather than implying a
    European corpus that does not exist.

  · A REFLEXIVE IS NOT A LEMMA HERE.  Spanish files `llamarse` as a headword of
    its own and Wiktionary carries it; Portuguese writes `chamar-se` and
    Wiktionary carries NOTHING -- `chamar-se`, `levantar-se` and `sentar-se` are
    all absent, checked.  So a reflexive entry in this deck is the base verb's
    paradigm under an authored gloss, and an example of it has to be recognised
    from the sentence: the clitic must be THERE and must AGREE.  Without
    agreement "ele chama-me todos os dias" (he calls ME) comes back as an
    example of "to be called".

  · THE CLITIC IS ENCLITIC AND HYPHENATED.  European Portuguese writes
    `chamo-me`, `chama-se`, `levanto-me` where Brazil writes `me chamo`, and the
    hyphen is part of the word -- so the tokeniser keeps it and an enclitic is
    matched as one token, while proclisis (obligatory in European Portuguese
    after a negative or a question word: `não me chamo`, `como se chama`) is
    matched as two.  Both are European; only clause-initial proclisis is not.

  · THE FIRST PERSON PLURAL LOSES ITS -S BEFORE -NOS: `chamamos` + `nos` is
    written `chamamo-nos`, which is a form no paradigm lists and which a match on
    the bare verb form therefore never finds.

Tatoeba is a general corpus and carries adult, violent and graphic sentences,
which a vocabulary deck sat an exam candidate in front of must not deal out; the
two blocklists below are the DELE stage's, translated into Portuguese.
"""
import json, re
from collections import defaultdict

from caple_level import f as lvlf, FREQ_FILE
from reflexives import KEYWORDS as REFL_KEYWORDS

words = json.load(open(lvlf('wordlist.json')))
W = json.load(open(lvlf('wikt.json')))
wordset = set(words)

# ---------------------------------------------------------------- forms index
SKIP_TAGS = {'table-tags', 'inflection-template', 'error-unrecognized-form',
             'combined-form'}


def base_of(k):
    """`chamar-se` -> `chamar`.  A reflexive has no record of its own."""
    return k[:-3] if k.endswith('-se') else k


def forms_of(k):
    """Every inflected form Wiktionary lists for a lemma, lowercased.

    Brazil-tagged forms ARE indexed, deliberately: this is the index that finds
    a sentence, not the table that teaches one.  `falamos` is the Brazilian
    preterite and also the European present, so refusing to match it would lose
    every present-tense example of every -ar verb in the language.  What keeps
    the Brazilian variety off the card is the sentence filter below and the form
    filter in build_deck.py, each doing its own job.
    """
    src = base_of(k)
    out = {k.lower(), src.lower()}
    for r in W.get(src, []):
        for x in r.get('forms', []):
            s = (x.get('form') or '').strip()
            if not s or s in ('-', '—') or (set(x.get('tags') or []) & SKIP_TAGS):
                continue
            if len(s) < 2 or ' ' in s:
                continue
            out.add(s.lower())
    return out


REFLEXIVES = {k for k in words if k.endswith('-se')}
FORM2WORD = defaultdict(set)
PHRASES = []
for k in words:
    if ' ' in k:
        PHRASES.append(k)
        continue
    for form in forms_of(k):
        FORM2WORD[form].add(k)
ALLFORMS = set(FORM2WORD)
print('  distinct forms indexed:', len(FORM2WORD), ' phrases:', len(PHRASES),
      ' reflexives:', len(REFLEXIVES))

# person/number of every form of a reflexive's base verb, to test agreement
FORM_PN = defaultdict(set)
for k in REFLEXIVES:
    for r in W.get(base_of(k), []):
        if r.get('pos') != 'verb':
            continue
        for x in r.get('forms', []):
            tg = set(x.get('tags') or [])
            if (tg & SKIP_TAGS) or not x.get('form'):
                continue
            p = ('1' if 'first-person' in tg else '2' if 'second-person' in tg
                 else '3' if 'third-person' in tg else None)
            n = 's' if 'singular' in tg else 'p' if 'plural' in tg else None
            if p and n:
                FORM_PN[(k, x['form'].lower())].add((p, n))

# which person and number each clitic marks; `se` covers both third persons
CLITIC = {'me': {('1', 's')}, 'te': {('2', 's')}, 'nos': {('1', 'p')},
          'vos': {('2', 'p')}, 'se': {('3', 's'), ('3', 'p')}}
REFL_PRON = set(CLITIC)

# ---------------------------------------------------------------- corpus
por, eng, link = {}, {}, {}
for line in open('por_sentences_detailed.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) >= 3:
        por[p[0]] = p[2]
for line in open('eng_sentences.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) >= 3:
        eng[p[0]] = p[2]
for line in open('por-eng_links.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) == 2 and p[0] not in link:
        link[p[0]] = p[1]
print('  por:', len(por), 'eng:', len(eng), 'links:', len(link))

freq = {}
for i, l in enumerate(open(FREQ_FILE, encoding='utf-8')):
    t = l.split()
    if t:
        freq.setdefault(t[0], i)

# a token may carry a hyphen: `pequeno-almoço` is one word and so is `chamo-me`
TOKEN = re.compile(r"[a-zà-öø-ÿ]+(?:-[a-zà-öø-ÿ]+)*", re.I)

# ------------------------------------------------------- the variety filter
# Words that are simply not the European standard.  A sentence carrying one is
# not an example a CAPLE candidate should be shown, whatever else is in it.
# Each is either a different word for the same thing (`ônibus` for `autocarro`)
# or the same string meaning something else in Portugal (`banheiro` is a
# lifeguard there, and Wiktionary marks both senses).
BR_LEX = (
    r"ônibus|trem|trens|celular(?:es)?|geladeira|banheiro?s?|garoto?s?|garota?s?|"
    r"sanduíche?s?|bonde|açougue|xícara?s?|calcinha|sorvete|carona|aeromoça|"
    r"caminhão|caminhões|café da manhã|papai|mamãe|vovô|vovó|grana|bagunça|"
    r"delegacia|rodoviária|bacana|legal(?=[,.!?\s]|$)|"
    r"times?(?=[,.!?\s]|$)|torcida|goleiro|esportes?|pedestre|fazendeiro"
)
# The Brazilian progressive.  `estar` + gerund is how Brazil says what Portugal
# says with `estar a` + infinitive, and it is the commonest single marker in the
# corpus -- 18,313 sentences, ten times the European construction.
BR_GERUND = r"\b(?:est\w+|and\w+|continu\w+|vi(?:nha|nham))\s+\w{2,}ndo\b"
BR_RX = re.compile(r"\b(?:" + BR_LEX + r")\b|" + BR_GERUND, re.I)

# Not rejected, but a European sentence is preferred where there is a choice.
EP_RX = re.compile(
    r"\b(?:comboio|autocarro|telemóvel|pequeno-almoço|casa de banho|frigorífico|"
    r"sandes|rapariga|miúdos?|giro|fixe|apanhar|"
    r"est(?:ás|ão)\s+a\s+\w+r|\w+-(?:me|te|se|nos|vos)\b)", re.I)

# Tatoeba is a general corpus and carries adult, vulgar and graphic sentences.
# Word boundaries matter: `sexo` must not also match `sexto`, which is "sixth".
BLOCK_RX = re.compile(
    r"\b(?:"
    r"sexo|sexual(?:is|mente)?|viola(?:ção|r|ram|da)|nu[ao]s?|pornô\w*|porno\w*|"
    r"puta|putas|puto|merda|foder|fodid[oa]|caralho|cabrão|cona|pénis|pênis|"
    r"vagina|mamas|peitos|cu|rabo|bicha|prostitut\w*|"
    r"droga|drogas|coca[ií]na|hero[ií]na|marijuana|maconha|bêbad[oa]|"
    r"assassin\w*|suicíd\w*|suicid\w*|grávida|"
    r"sex|sexy|fuck\w*|shit\w*|bitch|whore|slut|porn\w*|naked|nude|"
    r"rape|raped|rapist|penis|vagina|boobs|breasts|asshole|damn|bastard|"
    r"drug|drugs|cocaine|heroin|marijuana|drunk|prostitute|pregnant"
    r")\b", re.I)

# not blocked, but a beginner's card reads better without them
SOFT_RX = re.compile(
    r"\b(?:matar|mat(?:ou|aram)|morte|morreu|morrer|mort[oa]|guerra|arma|"
    r"pistola|sangue|cancro|câncer|doença|hospital|"
    r"kill(?:ed|s)?|death|died|dead|murder\w*|war|gun|weapon|blood|hate|"
    r"cancer|illness|disease|hospital)\b", re.I)


def hard_words(toks):
    return sum(1 for t in toks if freq.get(t, 99999) > 8000)


def reflexive_here(toks, i, form, k):
    """Is this occurrence actually the reflexive verb?

    Two shapes, both European.  ENCLISIS is one token -- `chamo-me`, `chama-se`,
    and `chamamo-nos`, where the first person plural drops its -s -- so the
    token is split at the hyphen and the halves checked.  PROCLISIS is the
    clitic standing up to two tokens in front, which European Portuguese
    requires after a negative, a question word or certain adverbs (`não me
    chamo`, `como se chama`), and there the pronoun must AGREE with the verb:
    `me` marks the first person singular, so "ele chama-me" (he calls me) is a
    third-person verb with a first-person object and is not this word.
    """
    pn = FORM_PN.get((k, form))
    if '-' in form:
        stem, _, cl = form.rpartition('-')
        if cl in REFL_PRON:
            # `chamamo-nos` : the -s of `chamamos` is dropped before -nos
            cand = {stem, stem + 's'} if cl == 'nos' else {stem}
            if cand & ALLFORMS:
                for s in cand:
                    if not pn or (FORM_PN.get((k, s)) or set()) & CLITIC[cl] or not FORM_PN.get((k, s)):
                        return True
    # PROCLISIS IS ADJACENT.  European Portuguese puts the pronoun immediately
    # in front of the verb -- `não me chamo`, `como se chama` -- with nothing
    # between, so a window of two tokens takes a clitic that belongs to another
    # verb entirely: `Me deixa voltar a dormir` is `me` on `deixa`, and read
    # loosely it made that sentence an example of `voltar-se`.
    if i and toks[i - 1] in REFL_PRON and pn and (CLITIC[toks[i - 1]] & pn):
        return True
    return False


def real_pos(k):
    out = set()
    for r in W.get(base_of(k), []):
        for s in r.get('senses', []):
            if not (s.get('form_of') or s.get('alt_of')):
                out.add(r['pos'])
                break
    return out


# a noun sits after a determiner or a preposition; a verb form that collides
# with one does not.  Portuguese contracts its prepositions with its articles,
# so the list is long: de+o=do, em+o=no, a+o=ao, por+o=pelo, and their
# feminines and plurals.
NOUNCTX = {
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
    'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas',
    'ao', 'à', 'aos', 'às', 'pelo', 'pela', 'pelos', 'pelas',
    'num', 'numa', 'dum', 'duma', 'deste', 'desta', 'nesse', 'nessa',
    'de', 'em', 'com', 'sem', 'por', 'para', 'sobre', 'entre',
    'meu', 'minha', 'teu', 'tua', 'seu', 'sua', 'nosso', 'nossa',
    'este', 'esta', 'esse', 'essa', 'aquele', 'aquela', 'isto', 'isso',
    'muito', 'muita', 'muitos', 'muitas', 'pouco', 'pouca', 'outro', 'outra',
    'cada', 'algum', 'alguma', 'todo', 'toda', 'todos', 'todas', 'qual',
}

NOUNS = {k for k in words
         if 'noun' in real_pos(k) and not ({'verb', 'adj'} & real_pos(k))}

cand = defaultdict(list)
seen_br = seen_block = 0
for sid, text in por.items():
    eid = link.get(sid)
    if not eid or eid not in eng:
        continue
    if '"' in text:
        continue
    if BLOCK_RX.search(text) or BLOCK_RX.search(eng[eid]):
        seen_block += 1
        continue
    if BR_RX.search(text):
        seen_br += 1
        continue
    toks = [t.lower() for t in TOKEN.findall(text)]
    n = len(toks)
    if n < 3 or n > 14:
        continue
    elow = eng[eid].lower()
    hits = set()
    for i, t in enumerate(toks):
        for k in FORM2WORD.get(t, ()):
            if k in REFLEXIVES and not reflexive_here(toks, i, t, k):
                continue
            # THE CLITIC AGREES AND THE VERB IS STILL THE WRONG ONE, on the
            # handful whose base verb is common and means something else:
            # `tornar` is to make and `tornar-se` is to become, `divertir` is
            # to amuse somebody and `divertir-se` is to enjoy yourself.  Both
            # translate a sentence carrying `torna-se`, and only the ENGLISH
            # tells them apart -- so where a keyword is written for a
            # reflexive, the translation has to carry it.
            if k in REFL_KEYWORDS and not any(w in elow for w in REFL_KEYWORDS[k]):
                continue
            if (k in NOUNS and len(FORM2WORD.get(t, ())) > 1
                    and (i == 0 or toks[i - 1] not in NOUNCTX)):
                continue
            hits.add((k, t))
        # an enclitic token also contains the bare verb form: `chamo-me` is an
        # example of `chamar` as well as of `chamar-se`
        if '-' in t:
            stem, _, cl = t.rpartition('-')
            if cl in REFL_PRON:
                for k in FORM2WORD.get(stem, ()):
                    if k not in REFLEXIVES:
                        hits.add((k, t))
    low = text.lower()
    for p in PHRASES:
        if p in low:
            hits.add((p, p))
    if not hits:
        continue
    hw = hard_words(toks)
    ep = bool(EP_RX.search(text))
    for k, form in hits:
        if len(cand[k]) < 400:
            cand[k].append((sid, eid, form, n, hw, ep))

print(f'  rejected: {seen_block} adult/graphic, {seen_br} carrying a Brazilian marker')
print('  words with at least one candidate:', len(cand))


# ---------------------------------------------------------------- choose three
def score(c, k):
    sid, eid, form, n, hw, ep = c
    s = abs(n - 8) * 1.0        # around eight words reads best on a card
    s += hw * 2.5               # penalise rare vocabulary
    s += 0.5 * len(eng[eid].split()) / 8.0
    if SOFT_RX.search(por[sid]) or SOFT_RX.search(eng[eid]):
        s += 6.0
    if ep:
        s -= 3.0                # a positively European sentence, where there is one
    # A form shared with another word in the deck is very often the OTHER word.
    amb = len(FORM2WORD.get(form, ()))
    if amb > 1:
        s += 12.0 * (amb - 1)
    if form == k:
        s -= 1.0                # the headword itself is always unambiguous
    return s


chosen = {}
for k, cs in cand.items():
    cs.sort(key=lambda c: score(c, k))
    out, seen_forms, seen_txt = [], set(), set()
    for c in cs:
        t = por[c[0]]
        if t in seen_txt:
            continue
        # three different inflected forms where the word has them, so the
        # sentences teach the paradigm rather than repeating one form
        if c[2] in seen_forms and len(seen_forms) < 3 and len(out) < 3:
            continue
        out.append(c)
        seen_forms.add(c[2])
        seen_txt.add(t)
        if len(out) == 3:
            break
    if len(out) < 3:                      # relax the different-form rule
        for c in cs:
            if len(out) == 3:
                break
            if por[c[0]] not in seen_txt:
                out.append(c)
                seen_txt.add(por[c[0]])
    chosen[k] = [{'pt': por[c[0]], 'en': eng[c[1]], 'form': c[2], 'id': c[0]}
                 for c in out]

n3 = sum(1 for v in chosen.values() if len(v) == 3)
nep = sum(1 for v in chosen.values() for e in v if EP_RX.search(e['pt']))
missing = [k for k in words if not chosen.get(k)]
print('  words with 3 examples:', n3, '/', len(words))
print('  sentences carrying a positively European marker:', nep)
print('  words with NO example:', len(missing), missing[:30])
json.dump(chosen, open(lvlf('examples.json'), 'w'), ensure_ascii=False)
