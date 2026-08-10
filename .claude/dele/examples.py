#!/usr/bin/env python3
"""Pick three Tatoeba example sentences for each of the 500 words."""
import json, re, unicodedata
from collections import defaultdict

words = json.load(open('wordlist500.json'))
w = json.load(open('wikt.json'))
bases = json.load(open('wikt_bases.json'))
wordset = set(words)

# ---------------------------------------------------------------- forms index
# A verb's infinitive is rare in running text, so a sentence is matched on any
# inflected form.  Nouns and adjectives match their own surface plus plural and
# feminine.
def forms_of(k):
    out = {k}
    recs = w.get(k) or bases.get(k) or []
    for r in recs:
        for f in r.get('forms', []):
            s = f.get('form', '')
            tags = f.get('tags', [])
            if not s or s == '-' or 'table-tags' in tags or 'inflection-template' in tags:
                continue
            if 'combined-form' in tags:      # hablarme, háblame -- not what is being taught
                continue
            if len(s) < 2 or ' ' in s:
                continue
            out.add(s.lower())
    return out

FORM2WORD = defaultdict(set)
PHRASES = []
for k in words:
    if ' ' in k:
        PHRASES.append(k)
        continue
    src = k
    if k.endswith(('arse', 'erse', 'irse')) and k[:-2] in bases:
        src = k[:-2]                        # llamarse -> the forms of llamar
    for f in forms_of(src) | {k}:
        FORM2WORD[f].add(k)

print('distinct forms indexed:', len(FORM2WORD), ' phrases:', len(PHRASES))

# ---------------------------------------------------------------- corpus
spa = {}
for line in open('spa_sent.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) >= 3:
        spa[p[0]] = p[2]
eng = {}
for line in open('eng_sent.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) >= 3:
        eng[p[0]] = p[2]
link = {}
for line in open('spa_eng_links.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) == 2 and p[0] not in link:
        link[p[0]] = p[1]
print('spa:', len(spa), 'eng:', len(eng), 'links:', len(link))

# frequency, to prefer sentences a beginner can actually read
freq = {}
for i, l in enumerate(open('es_50k.txt', encoding='utf-8')):
    t = l.split()
    if t:
        freq.setdefault(t[0], i)

TOKEN = re.compile(r"[a-záéíóúüñ]+", re.I)

# Tatoeba is a general corpus and carries adult, vulgar and graphic sentences.
# A vocabulary deck sat an exam candidate in front of must not deal them out:
# `millon` came back with "Would you have sex with me for a million dollars?".
# Word boundaries matter -- `sexo` must not also match `sexto`, which is "sixth".
BLOCK_RX = re.compile(
    r"\b(?:"
    r"sexo|sexual(?:es|mente)?|violaci[oó]n|violar|viol[oó]|desnud[oa]s?|porno\w*|"
    r"puta|putas|puto|zorra|mierda|joder|jodid[oa]|co[nñ]o|cabr[oó]n|gilipollas|"
    r"follar|polla|pene|vagina|tetas|culo|maric[oó]n|"
    r"droga|drogas|coca[ií]na|hero[ií]na|marihuana|borrach[oa]|"
    r"asesin\w*|suicid\w*|prostitu\w*|embarazada|"
    r"sex|sexy|fuck\w*|shit\w*|bitch|whore|slut|porn\w*|naked|nude|"
    r"rape|raped|rapist|penis|vagina|boobs|breasts|ass|asshole|damn|bastard|"
    r"drug|drugs|cocaine|heroin|marijuana|drunk|prostitute|pregnant"
    r")\b", re.I)

# not blocked, but a beginner's card reads better without them
SOFT_RX = re.compile(
    r"\b(?:matar|mat[oó]|muerte|muri[oó]|morir|muerto|guerra|arma|pistola|sangre|"
    r"kill(?:ed|s)?|death|died|dead|murder\w*|war|gun|weapon|blood|hate|"
    r"cancer|enfermedad|hospital)\b", re.I)

def hard_words(toks):
    return sum(1 for t in toks if freq.get(t, 99999) > 8000)

REFL = {'me', 'te', 'se', 'nos', 'os'}
REFLEXIVES = {k for k in words if k.endswith(('arse', 'erse', 'irse'))}

# which person/number each clitic marks; `se` covers both third-person numbers
CLITIC = {'me': {('1', 's')}, 'te': {('2', 's')}, 'nos': {('1', 'p')},
          'os': {('2', 'p')}, 'se': {('3', 's'), ('3', 'p')}}

# person/number of every form of a reflexive's base verb, to test agreement
FORM_PN = defaultdict(set)
for k in REFLEXIVES:
    base = k[:-2]
    for r in (bases.get(base) or []):
        if r.get('pos') != 'verb':
            continue
        for f in r.get('forms', []):
            tg = set(f.get('tags', []))
            if 'combined-form' in tg or not f.get('form'):
                continue
            p = ('1' if 'first-person' in tg else '2' if 'second-person' in tg
                 else '3' if 'third-person' in tg else None)
            n = 's' if 'singular' in tg else 'p' if 'plural' in tg else None
            if p and n:
                FORM_PN[(k, f['form'].lower())].add((p, n))

def reflexive_here(toks, i, form, k):
    """Is this occurrence actually the reflexive verb?

    A reflexive's forms are its base verb's, so matching on the form alone
    teaches the wrong word: every `llamarse` sentence came back as `llamar`
    "to phone", and `ducharse` matched the noun `ducha` in "cantar en la ducha".

    The pronoun has to be there AND has to agree.  Requiring it merely to be
    nearby is not enough -- in "el me llamara por telefono" the clitic is a
    dative object of a third-person verb, so "he will phone ME" came through as
    an example of "to be called".  Agreement rules that out: `me` marks first
    person singular and `llamara` is third.
    """
    if len(form) > 4:                       # enclitic: levantarse, levantate
        for p in REFL:
            if form.endswith(p) and form[:-len(p)] in ALLFORMS:
                return True
    pn = FORM_PN.get((k, form))
    for j in range(max(0, i - 2), i):
        c = toks[j]
        if c in REFL and pn and (CLITIC[c] & pn):
            return True
    return False

ALLFORMS = set(FORM2WORD)

# Wiktionary gives a reflexive no gloss of its own, so these are authored here --
# and they double as a filter on the English side.  `llamar` + a dative object is
# so common ("I asked her to call me") that the Spanish alone cannot settle
# whether an occurrence is reflexive; the aligned translation can.
REFL_EN = {
    'llamarse':    ('name', 'called'),
    'levantarse':  ('get up', 'gets up', 'got up', 'getting up', 'rise', 'rose', 'stand up'),
    'ducharse':    ('shower',),
    'lavarse':     ('wash', 'brush'),
    'bañarse':     ('bath', 'swim', 'swam'),
    'despertarse': ('wake', 'woke', 'awake'),
    'dedicarse':   ('devote', 'dedicat', 'for a living', 'do you do'),
}

# a noun sits after a determiner or a preposition; a verb form that collides
# with one ("Kate se vino a la casa" against `vino` = wine) does not
NOUNCTX = {'el','la','los','las','un','una','unos','unas','lo','al','del',
           'mi','tu','su','mis','tus','sus','nuestro','nuestra','vuestro',
           'este','esta','estos','estas','ese','esa','esos','esas','aquel',
           'de','en','con','sin','por','para','sobre','tanto','mucho','mucha',
           'muchos','muchas','otro','otra','poco','poca','algún','alguna'}
def real_pos(k):
    out = set()
    for r in w.get(k, []):
        for s_ in r.get('senses', []):
            if not (s_.get('form_of') or s_.get('alt_of')):
                out.add(r['pos']); break
    return out
# only a PURE noun: an adjective follows a verb ("la puerta esta cerrada"), so
# demanding a determiner in front of it rejects every real sentence -- which is
# what left `cerrado` with no examples at all.
NOUNS = {k for k in words
         if 'noun' in real_pos(k) and not ({'verb', 'adj'} & real_pos(k))}

cand = defaultdict(list)
for sid, text in spa.items():
    eid = link.get(sid)
    if not eid or eid not in eng:
        continue
    if '-' in text or '"' in text:
        continue
    if BLOCK_RX.search(text) or BLOCK_RX.search(eng[eid]):
        continue
    toks = [t.lower() for t in TOKEN.findall(text)]
    n = len(toks)
    if n < 3 or n > 14:
        continue
    hits = set()
    for i, t in enumerate(toks):
        for k in FORM2WORD.get(t, ()):
            if k in REFLEXIVES:
                if not reflexive_here(toks, i, t, k):
                    continue
                el = eng[eid].lower()
                if not any(m in el for m in REFL_EN.get(k, ())):
                    continue
            if (k in NOUNS and len(FORM2WORD.get(t, ())) > 1
                    and (i == 0 or toks[i - 1] not in NOUNCTX)):
                continue
            hits.add((k, t))
    low = text.lower()
    for p in PHRASES:
        if p in low:
            hits.add((p, p))
    if not hits:
        continue
    hw = hard_words(toks)
    for k, form in hits:
        if len(cand[k]) < 400:
            cand[k].append((sid, eid, form, n, hw))

print('words with at least one candidate:', len(cand))

# ---------------------------------------------------------------- choose three
def score(c, k):
    sid, eid, form, n, hw = c
    s = abs(n - 8) * 1.0        # around eight words reads best on a card
    s += hw * 2.5               # penalise rare vocabulary
    s += 0.5 * len(eng[eid].split()) / 8.0
    if SOFT_RX.search(spa[sid]) or SOFT_RX.search(eng[eid]):
        s += 6.0
    # A form shared with another word in the deck is very often the OTHER word:
    # `se` is both `ser`'s imperative and `saber`'s 1sg, `trabajo` is both the
    # noun and `trabajar`'s 1sg, `vino` is wine and the preterite of `venir`.
    # Nothing here can tell them apart, so an ambiguous form is used only when
    # the word has nothing better.
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
        sid, eid, form, n, hw = c
        t = spa[sid]
        if t in seen_txt:
            continue
        # three different inflected forms where the word has them, so the
        # sentences teach the paradigm rather than repeating one form
        if form in seen_forms and len(seen_forms) < 3 and len(out) < 3:
            continue
        out.append(c); seen_forms.add(form); seen_txt.add(t)
        if len(out) == 3:
            break
    if len(out) < 3:                      # relax the different-form rule
        for c in cs:
            if len(out) == 3:
                break
            if spa[c[0]] not in seen_txt:
                out.append(c); seen_txt.add(spa[c[0]])
    chosen[k] = [{'es': spa[c[0]], 'en': eng[c[1]], 'form': c[2], 'id': c[0]} for c in out]

n3 = sum(1 for v in chosen.values() if len(v) == 3)
print('words with 3 examples:', n3, '/', len(words))
missing = [k for k in words if len(chosen.get(k, [])) == 0]
print('words with NO example:', len(missing), missing[:30])
json.dump(chosen, open('examples.json', 'w'), ensure_ascii=False)
