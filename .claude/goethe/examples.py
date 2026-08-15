#!/usr/bin/env python3
"""Pick up to three Tatoeba example sentences for each word.

A port of the DELE stage's shape, with the three things German does that
Spanish does not:

  · A SEPARABLE VERB COMES APART IN THE SENTENCE.  `abfahren` is one word in
    the infinitive and two in a finite clause -- "der Zug fährt um acht Uhr AB"
    -- so matching the verb form alone matches `fahren` instead, and every
    example of `abfahren` would be an example of a different verb.  kaikki
    writes those forms with the particle after a space (`fährt ab`), which is
    the signal: a form with a space in it is matched as verb-form-then-particle
    with the rest of the clause allowed in between, and the particle has to be
    THERE.  111 of the list's verbs are separable, so this is not a corner.

  · A REFLEXIVE NEEDS ITS PRONOUN, AND THE PRONOUN HAS TO AGREE.  `sich freuen`
    is `freuen` plus a pronoun, and the bare verb means something else ("to
    gladden"), so a sentence is only an example of the reflexive when the
    pronoun is present and matches the person of the verb -- `ich freue mich`
    yes, `das freut mich` ("that pleases me") no, since there the pronoun is an
    object and the verb is third person.  The DELE stage learnt this on
    llamarse; German needs it on nine verbs.

  · UPPERCASE IS INFORMATION.  Every German noun is capitalised, so matching
    case-insensitively pulls a verb into a noun's examples (`essen` the verb
    against `das Essen` the meal).  A noun therefore prefers a capitalised hit,
    which is nearly free and rules the commonest collision out.

Tatoeba is a general corpus and carries adult, violent and graphic sentences,
which a vocabulary deck sat an exam candidate in front of must not deal out; the
two blocklists below are the DELE stage's, translated and extended.
"""
import json, re
from collections import defaultdict

from goethe_level import f as lvlf

entries = json.load(open(lvlf('entries.json')))
W = json.load(open(lvlf('wikt.json')))

KEYS = [e['key'] for e in entries]
BYKEY = {e['key']: e for e in entries}

# ---------------------------------------------------------------- forms index
# `auxiliary` is the killer of the four: a verb's conjugation table names haben
# or sein as the auxiliary its compound tenses take, as a form row of its own
# carrying nothing but that word.  Indexed as a form, it makes EVERY verb in the
# deck match EVERY sentence containing `haben`, `hat`, `ist` or `sind` -- which
# is how "Haben Sie schon die Zeitung von heute gelesen?" came back as an example
# of `einkaufen`, and why a perfectly good sentence for `abfahren` was picked out
# on the word `sind` rather than on `abgefahren`.
SKIP_TAGS = {'table-tags', 'inflection-template', 'error-unrecognized-form',
             'auxiliary', 'class'}

# what a two-token form has to be marked to be a separable verb and its particle
FINITE_TAGS = {'indicative', 'subjunctive', 'imperative'}


def forms_of(lemma):
    """Every inflected form Wiktionary lists for a lemma, as lowercase strings.

    A form may carry a space -- a separable verb's `fährt ab`, a compound
    tense's `hat gesagt` -- so the TAGS come back with it: the two are told apart
    below and only the first is a separable pair.
    """
    out = {}
    for r in W.get(lemma, []):
        for f in r.get('forms', []):
            s = (f.get('form') or '').strip()
            tags = set(f.get('tags') or [])
            if not s or s in ('-', '—') or (tags & SKIP_TAGS):
                continue
            if len(s) < 2 or s.count(' ') > 1:
                continue
            out.setdefault(s.lower(), set()).update(tags)
    return out


def finite_forms(lemma):
    """The forms of a VERB that carry a person and a number, and nothing else."""
    out = set()
    for r in W.get(lemma, []):
        if r.get('pos') != 'verb':
            continue
        for f in r.get('forms', []):
            tg = set(f.get('tags') or [])
            s = (f.get('form') or '').strip().lower()
            if not s or ' ' in s or (tg & SKIP_TAGS) or 'subjunctive' in tg:
                continue
            if tg & {'first-person', 'second-person', 'third-person'} and \
                    tg & {'singular', 'plural'}:
                out.add(s)
    return out


FORM2KEY = defaultdict(set)        # single-token form  -> keys
SEP2KEY = defaultdict(set)         # (verb form, particle) -> keys
PHRASES = {}                       # key -> the string to look for in the text
ADJACENT = set()                   # keys whose particle must follow the verb at once
LOWER_KEY = set()                  # keys whose own headword is lowercase

for e in entries:
    key, lemma = e['key'], e['lemma']
    surfaces = dict(forms_of(lemma))
    surfaces.setdefault(e['word'].lower(), set())
    if e.get('pair_lemma'):
        surfaces.update(forms_of(e['pair_lemma']))
        surfaces.setdefault(e['pair_lemma'].lower(), set())
    if not e['word'][:1].isupper():
        LOWER_KEY.add(key)
    # `an sein`, `auf sein`, `zu sein` -- a particle plus the verb `to be`, which
    # behaves in a sentence exactly like a separable verb ("das Licht ist AN"),
    # so it is indexed as one rather than as a phrase that never occurs.
    m = re.fullmatch(r'(\w+) sein', e['word'])
    if m:
        # THE FINITE FORMS ONLY, and this is the whole of it.  `sein` is two
        # words -- the verb `to be` and the possessive `his` -- and Wiktionary
        # carries both under the one headword, so every form of the possessive
        # (seiner, seinen, seinem) came in as a form of the verb: "So nahm sich
        # der Kapitän SEINER AN" was offered as an example of `an sein`, and "Er
        # ging SEINEN WEG" as one of `weg sein`.  The participle costs the same
        # way round -- "gewesen zu sein" is an infinitive, not `zu sein` -- so
        # what is indexed is `ist, bin, sind, war, waren` and their fellows.
        for s in finite_forms('sein'):
            SEP2KEY[(s, m.group(1).lower())].add(key)
        # and the particle has to sit RIGHT AFTER the verb.  Given the whole
        # clause to look in, "es ist spät und die Nacht bricht an" came back as
        # an example of `an sein` and "hören Sie mir zu" as one of `zu sein`:
        # both carry a form of sein and both end a clause on the particle, but
        # the particle belongs to anbrechen and zuhören.  `das Licht ist an` is
        # what the entry means, and adjacency is what says so.
        ADJACENT.add(key)
        continue
    # A HYPHEN IS NOT A WORD BOUNDARY IN GERMAN AND IS ONE TO A TOKENISER, so
    # `die S-Bahn` and `die E-Mail` are looked for in the TEXT rather than in the
    # token stream -- read as tokens they are `s`+`bahn` and `e`+`mail`.  The
    # test is on an INTERNAL hyphen: a stem is printed with a trailing one
    # (`dies-`, `welch-`), and sending those down this path looked for the
    # literal string "dies-" and left all fifteen with no examples at all.
    if (' ' in e['lemma'] or re.search(r'\w-\w', e['word'])) and not e['reflexive']:
        PHRASES[key] = (e['lemma'] if ' ' in e['lemma'] else e['word']).lower()
        continue
    for s, tags in surfaces.items():
        if ' ' in s:
            # A COMPOUND TENSE IS NOT A SEPARABLE VERB.  `hat gesagt` and
            # `fährt ab` are both two tokens, and treating them alike put the
            # AUXILIARY in bold on the card -- "Wer <b>hat</b> das gesagt?" for
            # `sagen` -- and made the build unreproducible, since a sentence
            # then hit one key under two forms and which of them was recorded
            # came off a set.  The participle is indexed on its own anyway, so
            # the sentence is still found and `gesagt` is what lights up.
            # …AND NEITHER IS A DECLINED ADJECTIVE, A SUPERLATIVE OR A QUOTE'S
            # AUTHOR.  Blacklisting the shapes was tried and is the wrong shape:
            # 4,779 of the deck's 5,301 distinct multiword forms are not
            # separable pairs at all, in at least four families -- Wiktionary's
            # `includes-article` declensions (`der gute`, 8,288 of them), the
            # two-word superlative (`am besten`), and names leaking out of
            # citation metadata into `forms` (`Sebastian Brant`, filed under
            # `sein`).  The article ones bit: the adjective `best-` resolves to
            # the lemma `gut`, so its card came out with three sentences bolding
            # `am`, `das` and `Die` and never `besten` -- every count healthy,
            # since the sentences really do contain the word.
            #
            # So the test is POSITIVE and about what a separable pair IS: a
            # FINITE verb form with its particle.  It keeps 522 forms and every
            # one is that -- `lade ein`, `höre auf`, `stelle vor`.  Nothing is
            # lost by dropping the rest, because the single-token forms (`beste`,
            # `besten`, `bester`) are indexed on their own line below.
            if 'multiword-construction' in tags or not (tags & FINITE_TAGS):
                continue
            a, b = s.split(' ', 1)
            if len(a) > 1 and len(b) > 1:
                SEP2KEY[(a, b)].add(key)
        else:
            FORM2KEY[s].add(key)

PHRASE_RX = {k: re.compile(r'(?<![^\W\d_])' + re.escape(w) + r'(?![^\W\d_])',
                           re.I | re.UNICODE) for k, w in PHRASES.items()}

SEPBY = defaultdict(list)          # verb form -> [(particle, key), ...]
for (a, b), keys in SEP2KEY.items():
    for key in keys:
        SEPBY[a].append((b, key))

print('  distinct forms indexed:', len(FORM2KEY), ' separable pairs:', len(SEP2KEY),
      ' phrases:', len(PHRASES))

# ---------------------------------------------------------------- corpus
deu, eng, link = {}, {}, {}
for line in open('deu_sentences_detailed.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) >= 3:
        deu[p[0]] = p[2]
for line in open('eng_sentences.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) >= 3:
        eng[p[0]] = p[2]
for line in open('deu-eng_links.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) == 2 and p[0] not in link:
        link[p[0]] = p[1]
print('  deu:', len(deu), 'eng:', len(eng), 'links:', len(link))

freq = {}
for i, l in enumerate(open('de_50k.txt', encoding='utf-8')):
    t = l.split()
    if t:
        freq.setdefault(t[0], i)

# any letter, not just the ASCII ones plus umlauts: `das Café` came back with no
# examples at all because the é split it into two tokens
TOKEN = re.compile(r"[^\W\d_]+", re.UNICODE)
# the last word of a clause -- one that ends on punctuation, or on the sentence
CLAUSE_END = re.compile(r"([^\W\d_]+)\s*(?:[.,;:!?…]|$)", re.UNICODE)

BLOCK_RX = re.compile(
    r"\b(?:"
    r"sex|sexuell\w*|vergewaltig\w*|nackt|porno\w*|nutte|hure|schlampe|"
    r"schei[sß]\w*|fick\w*|arsch\w*|penis|vagina|titten|schwanz|"
    r"droge|drogen|kokain|heroin|marihuana|betrunken|besoffen|"
    r"mord\w*|ermord\w*|selbstmord|prostituier\w*|schwanger|"
    r"sexy|fuck\w*|shit\w*|bitch|whore|slut|porn\w*|naked|nude|"
    r"rape|raped|rapist|boobs|breasts|asshole|damn|bastard|"
    r"drug|drugs|cocaine|heroin|marijuana|drunk|prostitute|pregnant"
    r")\b", re.I)

SOFT_RX = re.compile(
    r"\b(?:t[öo]ten|t[öo]tete|tot|starb|sterben|gestorben|krieg|waffe|pistole|blut|"
    r"hasse|krebs|krankenhaus|"
    r"kill(?:ed|s)?|death|died|dead|murder\w*|war|gun|weapon|blood|hate|"
    r"cancer|hospital)\b", re.I)

REFL_PRON = {'mich', 'dich', 'sich', 'uns', 'euch', 'mir', 'dir'}
# which person and number each reflexive pronoun marks
REFL_PN = {'mich': {('1', 's')}, 'mir': {('1', 's')}, 'dich': {('2', 's')},
           'dir': {('2', 's')}, 'uns': {('1', 'p')}, 'euch': {('2', 'p')},
           'sich': {('3', 's'), ('3', 'p')}}

# person/number of every finite form of each reflexive verb, to test agreement
FORM_PN = defaultdict(set)
REFLEXIVE = {e['key'] for e in entries if e['reflexive']}
for key in REFLEXIVE:
    for r in W.get(BYKEY[key]['lemma'], []):
        if r.get('pos') != 'verb':
            continue
        for f in r.get('forms', []):
            tg = set(f.get('tags') or [])
            s = (f.get('form') or '').lower()
            if not s or 'subjunctive' in tg:
                continue
            p = ('1' if 'first-person' in tg else '2' if 'second-person' in tg
                 else '3' if 'third-person' in tg else None)
            n = 's' if 'singular' in tg else 'p' if 'plural' in tg else None
            if p and n:
                FORM_PN[(key, s.split(' ')[0])].add((p, n))


def reflexive_here(toks, i, form, key):
    """Is this occurrence actually the reflexive verb, and not the plain one?"""
    pn = FORM_PN.get((key, form))
    if not pn:
        return False
    for j in range(max(0, i - 3), min(len(toks), i + 6)):
        if j == i:
            continue
        c = toks[j]
        if c in REFL_PRON and (REFL_PN[c] & pn):
            return True
    return False


NOUNS = {e['key'] for e in entries if e['pos_hint'] == 'noun'}

cand = defaultdict(list)
for sid, text in deu.items():
    eid = link.get(sid)
    if not eid or eid not in eng:
        continue
    if '"' in text or '„' in text:
        continue
    if BLOCK_RX.search(text) or BLOCK_RX.search(eng[eid]):
        continue
    raw = TOKEN.findall(text)
    toks = [t.lower() for t in raw]
    n = len(toks)
    if n < 3 or n > 14:
        continue
    # the words this sentence's clauses end on: what a separable particle has to be
    enders = {m.group(1).lower() for m in CLAUSE_END.finditer(text)}
    lowtoks = {t for t, r in zip(toks, raw) if r[:1].islower()}
    hits = {}
    for i, t in enumerate(toks):
        cap = raw[i][:1].isupper() and i > 0      # capitalised mid-sentence
        for key in FORM2KEY.get(t, ()):
            if key in REFLEXIVE and not reflexive_here(toks, i, t, key):
                continue
            # A GERMAN NOUN IS CAPITALISED, WHICH CUTS BOTH WAYS.  A lowercase
            # hit on a noun key is nearly always the verb or adjective that
            # shares the string; and a hit that is capitalised mid-sentence is a
            # NOUN, so it cannot be an example of the lowercase word -- without
            # which `fernsehen` was illustrated by "dass Fernsehen schlecht für
            # Kinder ist" (the television set) and the adverb `morgen`
            # ("tomorrow") by "heute Morgen" (this morning).
            if key in NOUNS and not cap and i > 0:
                continue
            if cap and key in LOWER_KEY:
                continue
            # …AND AT THE HEAD OF A SENTENCE IT CUTS NEITHER WAY, which is the
            # hole the `i > 0` above leaves.  Every first word is capitalised, so
            # the capital is no evidence of a noun at all -- and `die Bitte` came
            # out illustrated by "BITTE erklären Sie, warum Sie nicht kommen
            # können", which is the particle `bitte` and is the other entry in
            # this very deck.  So where the deck ALSO teaches a lowercase word of
            # the same spelling, the noun reading is declined in first position
            # and the lowercase one keeps the sentence.  Under-marking beats
            # mis-marking again: the noun has its other sentences, and this only
            # bites on the handful of words that are two words (bitte/Bitte,
            # essen/Essen, morgen/Morgen).
            if i == 0 and key in NOUNS and any(k in LOWER_KEY for k in FORM2KEY.get(t, ())):
                continue
            hits.setdefault(key, raw[i])
        # A SEPARABLE VERB'S PARTICLE GOES TO THE END OF ITS CLAUSE, and that is
        # the test rather than "the particle is somewhere after the verb".  Every
        # one of this deck's particles is also an ordinary preposition or an
        # article -- ab, an, auf, aus, ein, mit, vor, zu -- so the loose test
        # matched "Es bringt nichts, MIT ihm zu reden" as `mitbringen` and "Er
        # kaufte seiner Tochter EIN neues Kleid" as `einkaufen`.  A particle is
        # taken only where the clause ENDS on it, which is where German puts it.
        # Under-marking beats mis-marking: a verb that loses a sentence this way
        # still has two others, and a wrong example teaches the wrong word.
        for b, key in SEPBY.get(t, ()):
            # a separable particle is never capitalised, where the noun it
            # collides with always is: `Er ging seinen WEG` is not `weg sein`
            if b not in enders or b not in lowtoks:
                continue
            if key in ADJACENT:
                # adjacent in the TEXT, not merely in the token stream: the
                # tokeniser drops punctuation, so `... wenn du in der Stadt
                # BIST, AN!` (which is anrufen) read as `bist an`
                if not re.search(re.escape(raw[i]) + r'\s+' + re.escape(b),
                                 text, re.I):
                    continue
            elif b not in toks[i + 1:i + 12]:
                continue
            if key in REFLEXIVE and not reflexive_here(toks, i, t, key):
                continue
            hits.setdefault(key, raw[i])
    # matched against the TEXT rather than the token stream, since a hyphen is
    # exactly what the tokeniser takes apart and what these keys are made of
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
    if SOFT_RX.search(deu[sid]) or SOFT_RX.search(eng[eid]):
        s += 6.0
    amb = len(FORM2KEY.get(form.lower(), ()))
    if amb > 1:
        s += 12.0 * (amb - 1)
    if form.lower() == BYKEY[key]['word'].lower():
        s -= 1.0
    return s


def own_stem_only(key, cs):
    """A STEM ENTRY IS ILLUSTRATED BY ITS OWN FORM OR NOT AT ALL.

    The Goethe list gives `best-` an entry beside `gut` precisely because the
    superlative is suppletive -- and `best-` resolves to the LEMMA `gut`, so its
    three sentences came out identical to `gut`'s and not one held a
    superlative.  Every other stem here (`ein-`, `dies-`, `jed-`, `lieb-`) has
    its own word as its lemma and is already satisfied.

    It is a BAR rather than a penalty, which is this file's standing rule that
    under-marking beats mis-marking: as a penalty `Lieblings-` still took
    `Liebling, ich kann es dir erklären!` for its third slot, which is the noun
    `Liebling` and a different word from the prefix.  Measured over all fifteen
    stems it costs NOTHING -- every one keeps the count it had, `Lieblings-`
    included, because barring the wrong sentence let a lower-scoring right one
    through (`Wer ist dein Lieblings-DJ?`); `nächst-` had none to begin with.
    """
    w = BYKEY[key]['word'].lower()
    if not w.endswith('-'):
        return cs
    return [c for c in cs if c[2].lower().startswith(w[:-1])]


chosen = {}
for key, cs in cand.items():
    # THE TIE-BREAK IS WHAT MAKES THE BUILD REPRODUCIBLE.  Two candidates
    # scoring the same are ordered by whatever the sort was handed, and what it
    # was handed comes off a SET of hits per sentence -- whose iteration order
    # depends on the hash seed and therefore changes between runs.  Twenty-seven
    # cards came out with a different third sentence each build.  The sentence
    # id is unique, so ordering on it as well makes the sort total.
    cs = own_stem_only(key, cs)
    cs.sort(key=lambda c: (score(c, key), int(c[0])))
    out, seen_forms, seen_txt = [], set(), set()
    for c in cs:
        sid, eid, form, n, hard = c
        t = deu[sid]
        if t in seen_txt:
            continue
        # three different inflected forms teach more than the same one thrice
        if form.lower() in seen_forms and len(out) < 3 and len(cs) > 6:
            continue
        seen_forms.add(form.lower())
        seen_txt.add(t)
        out.append({'de': t, 'en': eng[eid], 'form': form})
        if len(out) == 3:
            break
    if len(out) < 3:
        for c in cs:
            sid, eid, form, n, hard = c
            if deu[sid] in seen_txt:
                continue
            seen_txt.add(deu[sid])
            out.append({'de': deu[sid], 'en': eng[eid], 'form': form})
            if len(out) == 3:
                break
    chosen[key] = out

three = sum(1 for v in chosen.values() if len(v) == 3)
print('  with three:', three, ' with any:', len(chosen), ' with none:', len(KEYS) - len(chosen))
json.dump(chosen, open(lvlf('examples.json'), 'w'), ensure_ascii=False)
