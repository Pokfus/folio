#!/usr/bin/env python3
"""Every Old English lemma, compacted, with a LEMMA frequency: writes `lex.json`.

    python3 extract.py      (from the cache directory, by run.py)

Reads `kaikki-ang.jsonl` (English Wiktionary via kaikki.org, CC BY-SA 4.0) and
`corpus.txt` (corpus.py).  A LEMMA is a canonical headword as Wiktionary prints
it (stān, iċ, sē), and its entries are every part of speech filed under that
spelling; names, letters, prefixes and suffixes are not lemmas.

THE VERB TABLES ARE READ BY POSITION, NOT BY TAG.  kaikki's parse of Old
English's `ang-conj` table loses the mood headers: the subjunctive's rows come
out tagged like the indicative's minus a person (`sīe` = ['present',
'singular']), and the two participles come out tagged ['imperative', 'present']
and ['imperative', 'past'].  The rows are always in the template's order, so
`verb_table` walks them in order and names each slot itself; a verb whose rows
do not walk cleanly gets no table rather than a wrong one.

THE PERSONAL PRONOUNS SHARE ONE TABLE.  Wiktionary's `l-self` table under iċ,
þū, hē, hēo, hit, wē, ġē, hīe is the WHOLE paradigm, so each lemma keeps only
the rows of its own person, number and (third singular) gender -- otherwise
`his` is a form of iċ, and the frequency split hands iċ a share of every his.

THE FREQUENCY IS COUNTED BY LEMMA.  Each corpus token is folded (oe.fold) and
looked up among every form of every lemma -- its own spelling (OWN), its table
and every entry that says it is a form of it (FORM), its alternative spellings
(ALT).  A token several lemmas claim is split between them; the rules, each
found by reading the ranking:

  1. A FUNCTION WORD'S OWN SPELLING IS ITS OWN (the Hindi rule).  When a
     preposition, conjunction, adverb, pronoun, determiner or particle is spelt
     exactly as the token, only such words share it: `for` had gone to faran
     "to go" (whose past is fōr), `æt` to etan, `ēac` to īeċan.
  2. A SPELLING THAT IS SOME LEMMA'S OWN OR TABLE FORM IS NOT ALSO ANOTHER'S
     DIALECT VARIANT: bearn "child" is listed among bereærn's spellings.
  3. A LEMMA THAT IS ANOTHER'S ALTERNATIVE SPELLING AND SHARES MOST OF ITS
     MEANING IS THAT LEMMA (hīo is hēo; Ælfric's sylf absorbs self).
  4. What is left is split by a prior on HOW each lemma claims the token times
     the lemma's own estimated frequency, re-estimated for a few rounds only --
     run to convergence the split is winner-takes-all.
  5. A CAPITAL MID-SENTENCE is a noun's: Thorpe capitalises God, Crist, Drihten,
     and without it "god" went to gōd "good".
  6. `FORCE` gives the few tokens that are still wrong to one lemma by hand, each
     with its reason (wesan and bēon are one verb in two stems; wolde is willan's,
     not wiellan "to boil"'s), and `LATIN` keeps Thorpe's Latin rubrics out.
"""
import json, os, re, sys
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from oe import fold, nfc, tokens

KEEP = {'noun', 'verb', 'adj', 'adv', 'pron', 'det', 'article', 'prep', 'conj', 'num',
        'intj', 'particle', 'phrase', 'prep_phrase', 'proverb'}
# (an interjection is not closed-class here: ēow "alas" would claim every ēow "you")
CLOSED = {'prep', 'conj', 'adv', 'pron', 'det', 'article', 'particle'}
ROUNDS = 4
MIN_EN = 3
# THORPE'S RUBRICS AND QUOTATIONS ARE LATIN, and a Latin word that happens to be an Old
# English spelling would be counted: `et` made ettan "to graze" a top-500 word.  These are
# the Latin words of the corpus that collide with an Old English form; they are not counted.
# (Never a word that is ALSO common Old English: se, me, sum, cum, ut stay counted.)
LATIN = {'et', 'est', 'ad', 'de', 'non', 'qui', 'quae', 'quod', 'sed', 'ex', 'per', 'autem',
         'enim', 'reliqua', 'dominus', 'domini', 'deus', 'dei', 'quia', 'ego', 'eius', 'eum',
         'nos', 'vos', 'sunt', 'erat', 'hoc', 'ipse', 'ab', 'pro', 'super', 'dixit', 'omnes',
         'omnia', 'filius', 'filii', 'mihi', 'apostoli', 'sancti', 'sanctus', 'sermo',
         'natale', 'dominica', 'ante'}
TOKEN_RX = re.compile(r"[^\W\d_]+(?:-[^\W\d_]+)*")

# THE FEW TOKENS THE ARITHMETIC CANNOT PLACE, given to one lemma by hand.
#  · wesan and bēon are one verb "to be" in two stems, and Wiktionary tables the
#    suppletive forms under both: the forms built on wes-/is-/s- are wesan's, those
#    on bēo-/bi- bēon's, as every grammar divides them.
#  · willan's forms are also tabled under wiellan "to boil" (wolde, wille).
#  · witan "to know" and wītan "to blame" share wāt / wiste in a macron-less text,
#    and Ælfric's are "know".
FORCE = {
    'wæs': 'wesan', 'wæron': 'wesan', 'wære': 'wesan', 'wæren': 'wesan', 'is': 'wesan',
    'sind': 'wesan', 'sindon': 'wesan', 'sint': 'wesan', 'sint': 'wesan', 'eom': 'wesan',
    'eart': 'wesan', 'si': 'wesan', 'sin': 'wesan', 'wes': 'wesan', 'wesan': 'wesan',
    'biþ': 'bēon', 'beoþ': 'bēon', 'beo': 'bēon', 'beon': 'bēon', 'bist': 'bēon',
    'wolde': 'willan', 'woldon': 'willan', 'wille': 'willan', 'wile': 'willan',
    'willaþ': 'willan', 'wolden': 'willan', 'wilt': 'willan', 'willan': 'willan',
    'þæs': 'sē',      # the genitive of sē, far oftener than the adverb "afterwards"
    'þe': 'þe',       # the relative particle, not þē "the (late variant)" nor þū's þē
    'hire': 'hēo', 'hyre': 'hēo',   # her; not hȳr "hire, wages"
    'eow': 'ġē',      # you (plural, accusative/dative); not the interjection ēow
    'mæg': 'magan', 'mihte': 'magan', 'mihton': 'magan', 'magon': 'magan',   # not mǣġ "kinsman"
    'seþe': 'sē',     # se þe "he who", written as one word
    'þan': 'sē',      # þām / þon, not þān "moist"
    'dæge': 'dæġ',    # the dative of "day", not dǣġe "female servant"
    'sceole': 'sċulan',
    'circan': 'ċiriċe', 'cyrcan': 'ċiriċe',  # "church" (dative), not ċirċan "to roar"
    'mare': 'māra', 'maran': 'māra',       # "more", not mare "nightmare"
    'lif': 'līf', 'life': 'līf',           # "life", not līefan "to allow"
    'leofaþ': 'libban', 'leofode': 'libban', 'leofodon': 'libban', 'lifaþ': 'libban',
    'hira': 'hīe', 'heora': 'hīe',         # "their", not hȳr
    'æhta': 'ǣht', 'æhtum': 'ǣht',         # "possessions" (Ælfric's spelling), not "eight"
    'timan': 'tīma',                       # "time" (dative), not tīeman "to give birth"
    'manna': 'mann', 'mannum': 'mann',     # mann's genitive and dative plural, not manna
    'stemn': 'stefn', 'stemne': 'stefn',   # "voice": Wiktionary files it under stefn, and
                                           # its own stemn is "stem (of a tree)"
    'wat': 'witan', 'wiste': 'witan', 'wiston': 'witan', 'witon': 'witan', 'witan': 'witan',
}
SKIP_TAGS = {'table-tags', 'inflection-template', 'class'}

# a gloss that only points at another word ("alternative form of sēo") carries no meaning
POINTER = re.compile(r'^(?:alternative|obsolete|archaic|rare|late|early|nonstandard|'
                     r'West Saxon|Anglian|Mercian|Northumbrian|Kentish|Late West Saxon|'
                     r'Early West Saxon)?\s*(?:form|spelling) of\b|^(?:inflection|plural|'
                     r'genitive|dative|accusative|nominative|instrumental) (?:form )?of\b', re.I)


# a sense that names a letter, a rune or a scribal sign, not a word (ðæt "the letter Ð",
# dæġ's "the runic character ᛞ", ꝥ)
NOT_A_WORD = re.compile(r'^(?:the )?(?:letter|name of the letter|scribal abbreviation|'
                        r'runic spelling)|^Runic|runic character', re.I)


def headword(e):
    return nfc(_headword(e).rstrip('.'))       # one headword arrives as "ġehealdan."


def _headword(e):
    for f in e.get('forms', []):
        if 'canonical' in (f.get('tags') or []):
            return f['form']
    for h in e.get('head_templates', []):
        a = h.get('args', {})
        for k in ('head', '1'):
            v = a.get(k, '')
            if v and k == 'head' or (k == '1' and h.get('name', '').startswith('ang-') and
                                     h.get('name') not in ('ang-noun',) and v and len(v) > 1):
                if fold(v) == fold(e['word']):
                    return v
    return e['word']


def gender(e):
    for h in e.get('head_templates', []):
        if h.get('name') == 'ang-noun':
            g = h.get('args', {}).get('1', '')
            return g.replace(',', '').replace('-p', '')[:3]
        if h.get('name') == 'head' and h.get('args', {}).get('g'):
            return h['args']['g']
    for f in e.get('forms', []):
        t = set(f.get('tags') or [])
        if 'canonical' in t:
            for k, v in (('masculine', 'm'), ('feminine', 'f'), ('neuter', 'n')):
                if k in t:
                    return v
    return ''


def moderns(e):
    """The Modern English descendants Wiktionary traces through Middle English (cyning ->
    king): for each Middle English branch, the FIRST untagged English word under it --
    Wiktionary lists a branch's main descendant first and its obsolete or dialectal ones
    (tagged) after.  Returned as {word: number of branches that lead to it}."""
    out = {}
    for d in e.get('descendants', []):
        if d.get('lang_code') != 'enm':
            continue
        for x in d.get('descendants', []):
            w = x.get('word', '')
            if x.get('lang_code') == 'en' and w and not x.get('tags') and not x.get('raw_tags') \
                    and not w.startswith('-') and not w.endswith('-'):
                out[w] = out.get(w, 0) + 1
                break
    return out


def english_counts(words):
    """How often each word occurs in Tatoeba's English sentences -- the tie-breaker between
    descendants: iċ has two, the dialect `ich` and `I`, and the card should say `I`."""
    want = {w.lower() for w in words}
    c = Counter()
    for line in open('eng_sentences.tsv', encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) >= 3:
            for t in re.findall(r"[A-Za-z]+(?:'[a-z]+)?", p[2]):
                if t.lower() in want:
                    c[t.lower()] += 1
    return c


def ipa(e):
    """Wiktionary's pronunciation: the PHONETIC transcription where it gives one, since that is
    what is said -- heofon [ˈhe͜o.von], seċġan [ˈsed.d͡ʒɑn] -- else the phonemic one (/stɑːn/)."""
    ph = [s.get('ipa', '') for s in e.get('sounds', [])]
    return next((v for v in ph if v.startswith('[')), '') or next((v for v in ph if v.startswith('/')), '')


def table_rows(e):
    out = []
    for f in e.get('forms', []):
        t = f.get('tags') or []
        if not t or set(t) & SKIP_TAGS or 'canonical' in t or 'alternative' in t:
            continue
        if f['form'] in ('-', '—', ''):
            continue
        out.append((nfc(f['form']), t))
    return out


def verb_table(rows):
    """Name each slot of an ang-conj table by walking it in order (see the header)."""
    slots = defaultdict(list)
    seen_inf = 0
    subj = False
    for form, t in rows:
        T = set(t)
        if T & {'comparative', 'superlative', 'adverb'}:
            continue
        if T == {'infinitive'}:
            slots['inf' if seen_inf == 0 else 'inf2'].append(form)
            seen_inf += 1
            continue
        if 'imperative' in T:
            if 'singular' in T:
                slots['imp_sg'].append(form)
            elif 'plural' in T:
                slots['imp_pl'].append(form)
            elif 'present' in T and 'past' not in T:
                slots['ptc_pres'].append(form)
            elif 'past' in T and 'present' not in T:
                slots['ptc_past'].append(form)
            continue
        tense = 'pres' if 'present' in T else 'past' if 'past' in T else None
        if not tense:
            continue
        person = next((p for p in ('first-person', 'second-person', 'third-person') if p in T), None)
        if person:
            slots[f'{tense}_{person[:3]}'].append(form)
            continue
        if 'singular' in T:
            subj = True
            slots[f'subj_{tense}_sg'].append(form)
        elif 'plural' in T:
            slots[(f'subj_{tense}_pl' if subj else f'{tense}_pl')].append(form)
    need = ('inf', 'pres_fir', 'pres_thi', 'past_thi', 'past_pl')
    if not all(slots.get(k) for k in need):
        return {}
    return {k: v for k, v in slots.items()}


def own_pronoun_rows(rows, head):
    """The l-self table is the whole paradigm: keep the lemma's own person/number/gender."""
    if not any('personal' in t for _, t in rows):
        return rows
    me = next((t for f, t in rows if fold(f) == fold(head) and 'nominative' in t), None)
    if not me:
        return []
    want = {x for x in me if x in ('first-person', 'second-person', 'third-person',
                                   'singular', 'plural', 'dual')}
    g = {x for x in me if x in ('masculine', 'feminine', 'neuter')}
    out = []
    for f, t in rows:
        T = set(t)
        if not want <= T:
            continue
        if g and not (g & T):
            continue
        out.append((f, t))
    return out


def senses(e):
    out, ptr = [], []
    for s in e.get('senses', []):
        tags = s.get('tags') or []
        gl = (s.get('glosses') or [''])[-1].strip()
        if s.get('form_of') or s.get('alt_of') or 'form-of' in tags or 'alt-of' in tags:
            for x in (s.get('form_of') or []) + (s.get('alt_of') or []):
                if x.get('word'):
                    ptr.append(nfc(x['word']))
            continue
        if not gl or POINTER.search(gl) or NOT_A_WORD.search(gl):
            continue
        out.append({'g': gl, 'tags': [t for t in tags if t not in ('form-of', 'alt-of')],
                    'weak': any(t in tags for t in ('rare', 'obsolete', 'archaic'))})
    return out, ptr


def main():
    lex = {}
    pointers = defaultdict(set)        # folded spelling -> target headwords (unfolded)
    for line in open('kaikki-ang.jsonl', encoding='utf-8'):
        e = json.loads(line)
        if e.get('pos') not in KEEP:
            continue
        head = headword(e)
        if re.search('[\u16a0-\u16ff]', head):      # a runic spelling is a pointer, never a card
            continue
        gl, ptr = senses(e)
        for p in ptr:
            pointers[fold(e['word'])].add(p)
            pointers[fold(head)].add(p)
        if not gl:
            continue
        rows = table_rows(e)
        if e['pos'] == 'pron':
            rows = own_pronoun_rows(rows, head)
        ent = {'pos': e['pos'], 'etym': str(e.get('etymology_number', '')), 'gender': gender(e),
               'glosses': gl, 'ipa': ipa(e), 'moderns': moderns(e), 'rows': rows,
               'alts': [nfc(f['form']) for f in e.get('forms', [])
                        if 'alternative' in (f.get('tags') or [])],
               'head_forms': {k: [nfc(f['form']) for f in e.get('forms', [])
                                  if k in (f.get('tags') or []) and 'table-tags' not in f.get('tags')]
                              for k in ('comparative', 'superlative', 'adverb')},
               'cls': next((f['form'] for f in e.get('forms', []) if 'class' in (f.get('tags') or [])), ''),
               'strength': next((f['form'] for f in e.get('forms', [])
                                 if 'table-tags' in (f.get('tags') or []) and f['form'] in
                                 ('strong', 'weak', 'irregular', 'preterite-present', 'anomalous')), '')}
        if e['pos'] == 'verb':
            ent['vt'] = verb_table(rows)
        L = lex.setdefault(head, {'word': head, 'entries': []})
        L['entries'].append(ent)

    # THE DESCENDANT A CARD SHOWS: the one most branches lead to (mann: man by five, the
    # reshaped "me" by three), then the one commonest in English today (iċ: I, not the
    # dialect ich) -- and none at all when it is a word modern English has lost (hǣlend's
    # "healand", þēod's "theed"), counted as fewer than MIN_EN uses in Tatoeba's English.
    allw = {w for L in lex.values() for e in L['entries'] for w in e['moderns']}
    ec = english_counts(allw)
    for L in lex.values():
        for e in L['entries']:
            ms = e.pop('moderns')
            best = max(ms, key=lambda w: (ms[w], ec[w.lower()], w)) if ms else ''
            e['modern'] = best if best and ec[best.lower()] >= MIN_EN else ''

    # every spelling that can stand for each lemma, and HOW it stands for it:
    # OWN (the headword's own spelling), FORM (a table form, or an entry that says it
    # is a form of this lemma) or ALT (an alternative spelling Wiktionary lists)
    index = defaultdict(dict)
    rank = {'own': 3, 'form': 2, 'alt': 1}

    def put(sp, h, how):
        if rank[how] > rank.get(index[sp].get(h, 'alt'), 0) or h not in index[sp]:
            index[sp][h] = how
    for h, L in lex.items():
        put(fold(h), h, 'own')
        for ent in L['entries']:
            for f, _ in ent['rows']:
                put(fold(f), h, 'form')
            for k in ('ptc_past', 'ptc_pres', 'inf2'):
                for f in ent.get('vt', {}).get(k, []):
                    put(fold(f), h, 'form')
            for a in ent['alts']:
                put(fold(a), h, 'alt')
    for sp, targets in pointers.items():
        for t in targets:
            if t in lex:                          # the exact headword it names, never a fold-twin
                put(sp, t, 'form')

    # A LEMMA THAT IS ANOTHER'S ALTERNATIVE SPELLING IS THAT LEMMA (hīo is hēo): when Y lists
    # X among its alternatives, X's parts of speech are all Y's AND the two share a meaning,
    # X's spellings count for Y and X is marked `alt_of`, never dealt as a card of its own.
    # The shared meaning is load-bearing: mān "crime" lists mann among its spellings, and
    # without it mann "person" -- one of the commonest nouns there is -- vanished into it.
    # And most of X's meaning, not a word of it: bearn "child" also means "barn", and
    # bereærn "barn" lists it.
    def meaning(L):
        return {w for e in L['entries'] for g in e['glosses']
                for w in re.findall(r'[a-z]{3,}', g['g'].lower())} - {'the', 'and', 'for', 'with'}
    # Of a pair that list each other, the one whose own spelling the corpus uses more
    # survives (Ælfric writes sylf, not self).
    raw = Counter(fold(t) for line in open('corpus.txt', encoding='utf-8') for t in tokens(line))
    for y, L in sorted(lex.items(), key=lambda kv: (-raw[fold(kv[0])], kv[0])):
        ypos = {e['pos'] for e in L['entries']}
        for e in L['entries']:
            for a in e['alts']:
                if a in lex and a != y and 'alt_of' not in L and 'alt_of' not in lex[a] \
                        and {x['pos'] for x in lex[a]['entries']} <= ypos \
                        and len(meaning(lex[a]) & meaning(L)) >= 0.6 * len(meaning(lex[a]) or {0}):
                    if raw[fold(a)] > raw[fold(y)]:
                        L['alt_of'] = a
                        break
                    lex[a]['alt_of'] = y
            if 'alt_of' in L:
                break

    def root(x):
        while lex[x].get('alt_of'):
            x = lex[x]['alt_of']
        return x
    for x in lex:
        if lex[x].get('alt_of'):
            lex[x]['alt_of'] = root(x)
    for sp in list(index):
        for x in list(index[sp]):
            y = lex[x].get('alt_of')
            if y:
                how = index[sp].pop(x)
                put(sp, y, how if how != 'own' else 'form')

    counts = Counter()
    total = 0
    for line in open('corpus.txt', encoding='utf-8'):
        prev = '.'
        for m in TOKEN_RX.finditer(line):
            tok = m.group(0)
            mid = not re.search(r'[.!?:;"\'“‘(]\s*$', line[max(0, m.start() - 3):m.start()]) and prev != '.'
            cap = tok[:1].isupper() and mid
            if tok.lower() in LATIN:
                continue
            counts[(fold(tok), cap)] += 1
            total += 1
            prev = 'x'
    cands = {}
    for (t, cap), c in counts.items():
        if t not in index:
            continue
        hs = dict(index[t])
        if t in FORCE:
            hs = {FORCE[t]: 'own'}
        owners = [h for h, how in hs.items() if how == 'own']
        closed = [h for h in owners if set(e['pos'] for e in lex[h]['entries']) & CLOSED]
        if closed:
            hs = {h: 'own' for h in closed}        # a function word's own spelling is its own
        elif any(how != 'alt' for how in hs.values()):
            # a spelling that is some lemma's own or one of its table forms is not ALSO
            # another's dialect variant (bearn "child" is listed among bereærn's spellings)
            hs = {h: how for h, how in hs.items() if how != 'alt'}
        if cap:                                    # Thorpe capitalises God, Crist, Drihten
            nouns = {h: how for h, how in hs.items()          # a lemma that is FIRST a noun:
                     if lex[h]['entries'][0]['pos'] == 'noun'}    # gōd is first "good", then "goods"
            hs = nouns or hs
        cands[(t, cap)] = hs
    covered = sum(counts[k] for k in cands)
    print(f'  lemmas {len(lex)} | corpus tokens {total}, {len(counts)} distinct; '
          f'{covered / total:.1%} of tokens match a lemma')

    # A shared token is split by a prior on HOW each lemma claims it (its own spelling
    # weighs more than a table form, a table form more than an alternative spelling) times
    # the lemma's own estimated frequency, re-estimated for ROUNDS rounds.  Few rounds,
    # deliberately: run to convergence the split is winner-takes-all, and a big paradigm
    # (a strong verb's) takes every short word it happens to contain.
    W = {'own': 2.0, 'form': 1.0, 'alt': 0.3}
    est = defaultdict(lambda: 1.0)
    for _ in range(ROUNDS):
        new = defaultdict(float)
        for k, hs in cands.items():
            w = {h: W[how] * est[h] for h, how in hs.items()}
            z = sum(w.values())
            for h in hs:
                new[h] += counts[k] * w[h] / z
        est = defaultdict(float, new)
    for h, L in lex.items():
        L['freq'] = round(est.get(h, 0.0), 3)
    json.dump(lex, open('lex.json', 'w', encoding='utf-8'), ensure_ascii=False)
    json.dump({f'{t}{"^" if cap else ""}': [counts[(t, cap)], hs] for (t, cap), hs in cands.items()},
              open('freq.json', 'w', encoding='utf-8'), ensure_ascii=False)
    unknown = Counter()
    for (t, cap), c in counts.items():
        if t not in index:
            unknown[t] += c
    print('  commonest unmatched:', ', '.join(f'{t} {c}' for t, c in unknown.most_common(40)))


if __name__ == '__main__':
    main()
