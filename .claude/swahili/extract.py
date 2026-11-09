#!/usr/bin/env python3
"""Every Swahili lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-sw.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0) and two corpora from OPUS -- `os-sw.txt.gz`, the Swahili
subtitles of OpenSubtitles 2024, and `gv-sw.txt.gz`, Global Voices' Swahili
articles (CC BY 3.0) -- and writes `lex.json`.  Level-independent: built once.

WHY TWO CORPORA.  No ready-made Swahili frequency list exists in the shape the
other decks use (hermitdave/FrequencyWords has no Swahili), so the counts are
made here.  The subtitles alone are 540,000 words, and most of them come from a
handful of dubbed historical dramas -- `mfalme` "king" and `malkia` "queen" in
the top thirty; Global Voices adds 660,000 words of everyday news writing.
Only the COUNTS are used; no sentence from either corpus ships.

WHY A LEMMA FREQUENCY.  A Swahili verb is almost never written as its stem
(`nilisoma`, `anasoma`, `hatutasoma`), so a lemma's count is the sum of: its own
spelling, its listed forms (a noun's plural, a verb's infinitive, an
adjective's agreeing forms), every entry that says it is a `form of` it, and
every token the verb parser (`sw.verb_prefixes`) reads as prefix + its stem.

A FORM SEVERAL LEMMAS SHARE IS SPLIT, NOT COUNTED TWICE -- in proportion to
what each earns alone, plus one, over two rounds (the Russian and Hindi rule) --
EXCEPT a closed-class word's own spelling, which is its own: `sana` "very" is
also the imperative of `-sana` "to forge", and `kwa` "for" the parser could
read as ku- + a stem.
"""
import collections, gzip, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sw import norm, is_sw, tokens, VerbParser

DUMP, OUT = 'kaikki-sw.jsonl', 'lex.json'
CORPORA = ['os-sw.txt.gz', 'gv-sw.txt.gz']

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase'}

WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'Kimvita', 'Kiunguja', 'Kiamu', 'slang'}

# THE DAYS OF THE WEEK are proper nouns in Wiktionary (`Jumatatu`), and A1 teaches them.
NAME_OK = {'jumatatu', 'jumanne', 'jumatano', 'alhamisi', 'ijumaa', 'jumamosi', 'jumapili',
           # and the months (A2); `Machi` shares its key with `machi` "a march", which it replaces
           'januari', 'februari', 'machi', 'aprili', 'mei', 'juni', 'julai', 'agosti', 'septemba',
           'oktoba', 'novemba', 'desemba'}

# A DERIVED VERB'S MEANING is written after its pointer: "Passive form of -elea: to
# understand" -- the colon's right side is the meaning (`-elewa` is the everyday word).
DERIVED = re.compile(r'^\w+ form of -?[a-z\']+: (.+)$', re.I)

KEEP_TAGS = {'formal', 'informal', 'colloquial', 'figuratively', 'transitive', 'intransitive',
             'idiomatic', 'Islam', 'Christianity', 'honorific', 'Kenya', 'Tanzania'}

# The noun class, from `{{sw-noun|<class>}}`, as a learner's book names it.
CLASS = {'wa': '1/2', 'm-wa': '1/2', 'mw-wa': '1/2', 'I': '1/2',
         'mi': '3/4', 'm-mi': '3/4', 'mw-mi': '3/4',
         'ma': '5/6', 'ji': '5/6', 'ji-ma': '5/6', '59': '9/10 or 5/6', 'ki': '7/8', 'vi': '7/8', 'ki-vi': '7/8', 'vy': '7/8', 'VIII': '7/8',
         'n': '9/10', 'u': '11', 'u-ma': '11/6', 'pa': '16', '15': '15', 'ku': '15'}

ROMAN = {'I': '1/2', 'III': '3/4', 'V': '5/6', 'VII': '7/8', 'IX': '9/10', 'XI': '11'}

# A gloss that is a POINTER, not a meaning: Wiktionary writes the agreeing forms of
# an adjective or a demonstrative as "[[Appendix:Swahili noun classes|n class (IX/X)]]
# inflected form of -zuri", and a verb form as "infinitive of -la".
POINTER = re.compile(r'\[\[Appendix|\binflected form of\b|^(?:infinitive|stative form|'
                     r'passive form|applicative form|causative form|reciprocal form|'
                     r'alternative form|alternative spelling|plural|augmentative|'
                     r'diminutive) of\b|\bsubject inflected\b|^used other than figuratively\b|\bclass form of\b|^class [ivx]+\b|^only used in\b|^(?:positive|negative)[^;]* of -', re.I)


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    if POINTER.search(g):
        return ''
    g = re.sub(r'\[+([^\[\]|]*\|)?([^\[\]]*)\]+', r'\2', g)
    return g.rstrip(' .') if g.endswith('.') and g.count('.') == 1 else g


def is_formof(s):
    tags = s.get('tags') or []
    return 'form_of' in s or 'alt_of' in s or 'form-of' in tags or 'alt-of' in tags


def forms_of(e):
    out = {'plural': [], 'inf': '', 'neginf': '', 'canon': '', 'agree': []}
    for f in e.get('forms') or []:
        t = f.get('tags') or []
        w = norm(f.get('form', ''))
        if 'table-tags' in t or 'inflection-template' in t:
            continue
        if 'canonical' in t:
            if w.startswith('-') and is_sw(w):
                out['canon'] = w
            continue
        if not is_sw(w) or re.fullmatch(r'[ivx]+', w):
            continue
        if 'error-unrecognized-form' in t:
            out['agree'].append(w)
        elif 'infinitive' in t and 'negative' in t:
            out['neginf'] = out['neginf'] or w
        elif 'infinitive' in t:
            out['inf'] = out['inf'] or w
        elif 'plural' in t and e.get('pos') == 'noun' and w not in out['plural']:
            out['plural'].append(w)
    return out


def noun_class(e):
    for h in e.get('head_templates') or []:
        if h.get('name') == 'sw-noun':
            a = h.get('args') or {}
            # the template's newer arguments name the class in Roman numerals: cl=III
            c = CLASS.get(a.get('1', ''), '') or ROMAN.get(a.get('cl', ''), '')
            return c, a.get('anim') == 'y', a.get('2') == 'plural'
    return '', False, False


def main():
    per_corpus = []
    for c in CORPORA:
        cc = collections.Counter()
        for line in gzip.open(c, 'rt', encoding='utf-8'):
            cc.update(tokens(line))
        per_corpus.append(cc)
    counts = per_corpus[0] + per_corpus[1]

    lemmas, pointers = {}, []
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = norm(e.get('word', ''))
        proper = pos == 'name' and w in NAME_OK
        if proper:
            pos = 'noun'
        if pos not in KEEP_POS or not is_sw(w) or w.startswith('-') or w.endswith('-'):
            continue
        senses = e.get('senses') or []
        for s in senses:
            for t in (s.get('form_of') or []) + (s.get('alt_of') or []):
                tw = norm(t.get('word', '')).lstrip('-')
                if is_sw(tw):
                    pointers.append((w, tw))
        gl = []
        for s in senses:
            if not s.get('glosses'):
                continue
            m = DERIVED.match(re.sub(r'\s+', ' ', s['glosses'][-1]).strip())
            if is_formof(s) and not m:
                continue
            tags = set(s.get('tags') or [])
            g = m.group(1) if m else clean_gloss(s['glosses'][-1])
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK), 'tags': sorted(tags & KEEP_TAGS)})
        if not gl:
            continue
        fo = forms_of(e)
        cls, anim, pl_only = noun_class(e) if pos == 'noun' else ('', False, False)
        ent = {'pos': pos, 'etym': e.get('etymology_number') or '', 'glosses': gl,
               'cls': cls, 'anim': anim, 'plonly': pl_only, 'plural': fo['plural'],
               'inf': fo['inf'], 'neginf': fo['neginf'], 'canon': fo['canon'],
               'agree': fo['agree'], 'proper': proper}
        # THE CASE IS WIKTIONARY'S: `Kiswahili`, `Mungu`, `Jumatatu` are written with a
        # capital; a lower-case entry of the same spelling wins (`mungu` "a god").
        word = e['word'].strip()
        L = lemmas.setdefault(w, {'word': word, 'entries': []})
        if proper:
            L['proper_word'] = word
        elif word == w:
            L['word'] = w
        L['entries'].append(ent)

    # A PROPER NOUN THE LEVELS TEACH REPLACES A COMMON NOUN OF ITS SPELLING: `machi` "a march
    # (rhythmic walk)" is not what a learner looking for the month needs to meet first.
    for k, L in lemmas.items():
        if any(e['proper'] for e in L['entries']):
            L['entries'] = [e for e in L['entries'] if e['proper']]
            L['word'] = L['proper_word']

    # which lemmas claim which surface
    claims = collections.defaultdict(set)
    parser = VerbParser()
    for k, L in lemmas.items():
        claims[k].add(k)
        for ent in L['entries']:
            for s in ent['plural'] + ent['agree'] + [ent['inf'], ent['neginf']]:
                if s and ' ' not in k:
                    claims[s].add(k)
            if ent['pos'] == 'verb' and ' ' not in k:
                parser.add(k)
    for surf, tgt in pointers:
        if tgt in lemmas and surf not in lemmas:
            claims[surf].add(tgt)

    for tok in counts:
        for lem in parser.lemmas(tok):
            claims[tok].add(lem)

    # THE GENITIVE PARTICLE'S AGREEING FORMS ARE ITS OWN.  `-a` "of" is written `wa`,
    # `ya`, `la`, `cha`, `za` by class, and two of those are also verb stems'
    # imperatives: given the rule below, `la` "to eat" took every "of" of class 5
    # and `wa` "to be" every "of" of class 1 and 2.
    for k, L in lemmas.items():
        for ent in L['entries']:
            if ent['pos'] == 'particle':
                for s_ in ent['agree']:
                    # ...but `kwa` "for, by, with" is a word in its own right
                    if s_ != k and s_ in lemmas and any(
                            e['pos'] in ('particle', 'prep', 'conj') for e in lemmas[s_]['entries']):
                        continue
                    claims[s_] = {k}
    CLOSED = {'adv', 'conj', 'particle', 'pron', 'det', 'num', 'intj', 'prep'}
    for surf in list(claims):
        if surf in lemmas and len(claims[surf]) > 1 \
                and any(e['pos'] in CLOSED for e in lemmas[surf]['entries']):
            claims[surf] = {surf}
    def lemma_freq(counts):
        alone = collections.Counter()
        for surf, who in claims.items():
            if len(who) == 1:
                alone[next(iter(who))] += counts.get(surf, 0)
        freq = collections.Counter(alone)
        for _ in range(2):
            nxt = collections.Counter(alone)
            for surf, who in claims.items():
                c = counts.get(surf, 0)
                if len(who) < 2 or not c:
                    continue
                wts = {k: freq[k] + 1 for k in who}
                tot = sum(wts.values())
                for k in who:
                    nxt[k] += c * wts[k] / tot
            freq = nxt
        return freq

    # THE RANK IS THE GEOMETRIC MEAN OF THE TWO CORPORA'S RATES PER MILLION, so a word
    # must be common in BOTH to rank: summed, the dramas' `mfalme` "king", `malkia`
    # "queen" and `sultani` and the news site's `blogu`, `mwanablogu` "blogger" and
    # `mtandaoni` "online" all reached A1's fill.  A word absent from either scores 0.
    per = [lemma_freq(c) for c in per_corpus]
    tot = [sum(c.values()) for c in per_corpus]
    freq = {}
    for k in lemmas:
        r = [per[i].get(k, 0) * 1e6 / tot[i] for i in range(len(per))]
        freq[k] = (r[0] * r[1]) ** 0.5

    # A MULTI-WORD LEMMA'S OWN COUNT (`seq`): the geometric mean, per million, of how often
    # its words occur IN SEQUENCE in each corpus.  The parts rule below (its rarest word's
    # count, halved) gave `kwa sababu` "because", `chuo kikuu` "university" and `juu ya`
    # "about" a 0 -- `ya` and `kikuu` are not lemmas -- so they were dealt last.  `seq` is a
    # field of its own because A1 was SHIPPED on `freq`, and a deck's card ids are
    # positional: re-dealing A1 would remap its readers' progress.  `select.py` ranks
    # levels from A2 up on `seq` where a multi-word lemma has one.  A verb (`wa na`, "to
    # have") is never written in sequence (`nina`, `ana`), so it has none.
    multi = {tuple(k.split()) for k, L in lemmas.items()
             if ' ' in k and not any(e['pos'] == 'verb' for e in L['entries'])}
    firsts = {m[0] for m in multi}
    seq_counts = []
    for c in CORPORA:
        sc = collections.Counter()
        for line in gzip.open(c, 'rt', encoding='utf-8'):
            t = tokens(line)
            for i, w0 in enumerate(t):
                if w0 in firsts:
                    for m in multi:
                        if m[0] == w0 and tuple(t[i:i + len(m)]) == m:
                            sc[m] += 1
        seq_counts.append(sc)

    out = {}
    for k, L in lemmas.items():
        L.pop('proper_word', None)
        for e in L['entries']:
            e.pop('proper', None)
        m = tuple(k.split())
        if m in multi:
            r = [seq_counts[i][m] * 1e6 / tot[i] for i in range(len(tot))]
            L['seq'] = round((r[0] * r[1]) ** 0.5, 2)
        if ' ' in k:
            parts = [freq.get(p, 0) for p in k.split()]
            L['freq'] = round(min(parts) / 2, 2) if parts else 0
        else:
            L['freq'] = round(freq.get(k, 0), 2)
        L['own'] = counts.get(k, 0)
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    top = sorted(out.values(), key=lambda L: (-L['freq'], L['word']))[:60]
    print(f'  {sum(counts.values())} corpus words; {len(out)} lemmas; commonest:',
          ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
