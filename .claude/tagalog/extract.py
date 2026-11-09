#!/usr/bin/env python3
"""Every Tagalog lemma in Wiktionary, compacted, with a LEMMA frequency each.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-tl.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0), `tl_full.txt` (hermitdave/FrequencyWords, OpenSubtitles 2018,
CC BY-SA 4.0) and `tgl_sentences_detailed.tsv` (Tatoeba, CC BY 2.0 FR), and
writes `lex.json`.  Level-independent: built once and kept.

TWO FREQUENCY LISTS, AVERAGED PER MILLION.  OpenSubtitles holds very little
Tagalog: hermitdave's list is 10,665 forms over about 95 thousand tokens, too
thin to rank a level on alone.  Tatoeba's Tagalog sentences are about 611
thousand tokens of everyday sentences.  Each list is turned into counts per
million and the two are averaged, so neither outweighs the other by its size;
both are stated in the deck's description.

WHAT A LEMMA EARNS.  Tagalog has no case or gender, and Wiktionary files each
AFFIXED verb as a lemma of its own (`kumain` "to eat", `kainin` "to eat
(something)", the root `kain` a noun), so a lemma's frequency is its own
spelling's count, plus the three aspect forms an affixed verb's headword line
gives (completed `kumain`, ongoing `kumakain`, contemplated `kakain`), plus an
adjective's plural (`magaganda`), plus every entry that is only a pointer to it
(`'yan` -> `iyan`, `pwede` -> `puwede`, `meron` -> `mayroon`).  A lemma's own
spelling is always its own (see `main`); any other form two lemmas claim is split in proportion to what each earns alone, plus one, over
two rounds (the Russian / Hindi / Romanian rule).

POINTERS WRITTEN AS PROSE.  Besides kaikki's `form_of` / `alt_of`, Tagalog
Wiktionary writes many pointers only as a gloss: "superseded, pre-2007 spelling
of puwede", "pronunciation spelling of mayroon", "contraction of hindi ba",
"progressive aspect of kumain" (an aspect form filed as an entry of its own).
`pointer_target` reads those, and an entry whose every sense is one is a
pointer, not a lemma.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches; never a
letter, an affix, a proper name (`name`) or a Baybayin spelling.  A capitalised
NOUN is kept (the days and the months, `Lunes`, `Linggo`) under a key of its own,
`cap:` and its fold (`key_of`): `linggo` "week" is not `Linggo` "Sunday".  Its
frequency is Tatoeba's count of it written capitalised inside a sentence (the
folded count belongs to the lowercase word), halved as the average with a
subtitle list that cannot tell the two apart.
"""
import collections, csv, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tl import fold, nfc, is_tl, tokens, unmark

DUMP, FREQ, TATOEBA, OUT = 'kaikki-tl.jsonl', 'tl_full.txt', 'tgl_sentences_detailed.tsv', 'lex.json'
csv.field_size_limit(10 ** 8)

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'phrase', 'num', 'prep', 'pron',
            'conj', 'particle', 'det', 'proverb', 'prep_phrase', 'article', 'contraction'}

# A sense carrying one of these is not a meaning a learner's card should open on.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'regional', 'uncommon',
        'poetic', 'historical', 'vulgar', 'derogatory', 'nonstandard', 'misspelling',
        'Batangas', 'Marinduque', 'Bulacan', 'Rizal', 'Quezon', 'Bataan', 'Morong',
        'Christianity', 'Biblical', 'Internet', 'Gay-lingo', 'Philippine-English'}
MONTHS = {'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
          'September', 'October', 'November', 'December'}
KEEP_TAGS = {'formal', 'informal', 'colloquial', 'figuratively', 'transitive', 'intransitive',
             'idiomatic', 'slang', 'familiar', 'polite'}


def key_of(w):
    """A lemma's key: its fold, and a capitalised noun's under `cap:` -- `Linggo`
    "Sunday" and `linggo` "week", `Lunes` "Monday" and `lunes` "odd" are two words."""
    return ('cap:' if w[:1].isupper() else '') + fold(w)


def ipa_of(e):
    """The first phonemic (slashed) IPA, Standard Tagalog's where it is marked."""
    ss = [s for s in e.get('sounds') or [] if s.get('ipa')]
    for s in ss:
        if s['ipa'].startswith('/'):
            return s['ipa']
    return ss[0]['ipa'] if ss else ''


def canonical_of(e, w):
    """Wiktionary's marked spelling (`magandá`), when it differs from the plain one."""
    for f in e.get('forms') or []:
        if 'canonical' in (f.get('tags') or []) and not f.get('source'):
            c = nfc(f['form'])
            if is_tl(c) and fold(c) == fold(w) and c != w:
                return c
    return ''


def is_formof(s):
    t = s.get('tags') or []
    return 'form_of' in s or 'alt_of' in s or 'form-of' in t or 'alt-of' in t


PROSE = re.compile(r'^(?:[\w,\-() ]*?\b)?(?:form|spelling|contraction|abbreviation|clipping|'
                   r'short form|aspect|inflection|synonym)\s+of\s+([^\s;:,()]+(?:\s[^\s;:,()]+)?)\s*$', re.I)
POINTER = re.compile(r'\b(form|spelling|contraction|clipping|abbreviation|aspect) of\b', re.I)


def pointer_target(g):
    """'superseded, pre-2007 spelling of puwede' -> 'puwede'; '' when the gloss is a meaning."""
    m = PROSE.match((g or '').strip())
    if not m or m.group(0).lower().startswith('synonym'):
        return ''
    t = m.group(1)
    return t if is_tl(t) else ''


def clean_gloss(gs):
    gs = [re.sub(r'\s+', ' ', g or '').strip() for g in gs or []]
    gs = [g for g in gs if g]
    if not gs:
        return ''
    g = gs[-1]
    # A PARENT GLOSS THAT ENDS IN A COLON introduces its subsenses ("marks the core
    # participant ...: the patient ..."); the subsense alone is half a sentence.
    if len(gs) > 1 and gs[0].endswith(':'):
        g = gs[0].rstrip(':') + ': ' + g
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    if pointer_target(g) or POINTER.search(g) and len(g) < 60 and ' of ' in g[-40:]:
        return ''
    return g


def main():
    # ---- the two frequency lists, each per million, averaged ----
    subs = collections.Counter()
    for line in open(FREQ, encoding='utf-8'):
        p = line.split()
        if len(p) == 2 and is_tl(p[0]):
            subs[fold(p[0]).strip("'")] += int(p[1])
    tat, tatcap = collections.Counter(), collections.Counter()
    for row in csv.reader(open(TATOEBA, encoding='utf-8'), delimiter='\t', quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            ts = tokens(row[2])
            for i, t in enumerate(ts):
                tat[fold(t)] += 1
                if i and t[:1].isupper():
                    tatcap[unmark(t)] += 1
    ns, nt = sum(subs.values()), sum(tat.values())
    counts = collections.Counter()
    for k in set(subs) | set(tat):
        counts[k] = (subs[k] * 1e6 / ns + tat[k] * 1e6 / nt) / 2
    print(f'  {ns:,} subtitle tokens, {nt:,} Tatoeba tokens; {len(counts):,} surfaces')

    lemmas, pointers, formonly = {}, [], {}
    for line in open(DUMP, encoding='utf-8'):
        e = json.loads(line)
        pos = e.get('pos')
        w = nfc(e.get('word', ''))
        if pos not in KEEP_POS | {'name'} or not is_tl(w) or w.startswith('-') or w.endswith('-'):
            continue
        if w[:1].isupper() and pos == 'name':
            # THE MONTHS are filed as proper names (`Enero` "January", also a surname);
            # one whose first sense is the month is kept as a noun with that sense alone
            g0 = ((e.get('senses') or [{}])[0].get('glosses') or [''])[0]
            if g0 not in MONTHS:
                continue
            pos = 'noun'
            e = dict(e, senses=e['senses'][:1])
        elif pos not in KEEP_POS:
            continue
        if w[:1].isupper() and (pos != 'noun' or ' ' in w):
            continue
        senses = e.get('senses') or []
        real = []
        for s in senses:
            tgts = [nfc(t.get('word', '')) for t in (s.get('form_of') or []) + (s.get('alt_of') or [])]
            g = clean_gloss(s.get('glosses'))
            pt = pointer_target((s.get('glosses') or [''])[-1])
            if pt:
                tgts.append(pt)
            for tw in tgts:
                if is_tl(tw):
                    pointers.append((fold(w), fold(tw)))
            # the NAME OF A LETTER ("the name of the Latin script letter N/n") is not
            # what `na` or `ka` means to a learner
            if g and re.search(r'\bletter\b', g) and re.search(r'\b(alphabet|script)\b', g):
                continue
            if not is_formof(s) and not pt and g:
                real.append((s, g))
        if not real:
            # NOT A LEMMA -- kept as a pointer for the inventory, so a word written
            # in its common spelling resolves to the entry that holds the meanings.
            tg = [fold(b) for a, b in pointers if a == fold(w)]
            if tg:
                formonly.setdefault(fold(w), {'word': w, 'alt_of': tg[-1]})
            continue
        gl = []
        for s, g in real:
            tags = set(s.get('tags') or [])
            gl.append({'g': g, 'weak': bool(tags & WEAK), 'tags': sorted(tags & KEEP_TAGS)})
        head = {}
        for f in e.get('forms') or []:
            t = f.get('tags') or []
            if f.get('source') or not is_tl(f.get('form', '')):
                continue
            for k in ('completive', 'progressive', 'contemplative', 'plural', 'root'):
                if k in t and k not in head:
                    head[k] = nfc(f['form'])
        for f in e.get('forms') or []:
            if 'root' in (f.get('tags') or []) and is_tl(f.get('form', '')) and 'root' not in head:
                head['root'] = nfc(f['form'])
        lemmas.setdefault(key_of(w), {'word': w, 'entries': []})['entries'].append({
            'pos': pos, 'etym': e.get('etymology_number', ''), 'ipa': ipa_of(e),
            'acc': canonical_of(e, w), 'glosses': gl, 'head': head,
            'etymtext': (e.get('etymology_text') or '').split('\n')[-1][:200]})

    for k, L in lemmas.items():
        if ' ' in k:
            parts = [counts.get(p, 0) for p in k.split()]
            L['multi'] = min(parts) / 2 if parts else 0

    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        if k.startswith('cap:'):
            continue
        claims[k].add(k)
        for ent in L['entries']:
            for hk in ('completive', 'progressive', 'contemplative', 'plural'):
                f = fold(ent['head'].get(hk, ''))
                if f and ' ' not in f:
                    claims[f].add(k)
    for surf, tgt in pointers:
        if tgt in lemmas and surf not in lemmas:
            claims[surf].add(tgt)
    # A LEMMA'S OWN SPELLING IS ITS OWN.  An affixed verb's aspect forms are often
    # another lemma's headword (`masa`'s completed form is `nasa` "is at";
    # `maari`'s contemplated form is `maaari` "may, can"), and split by weight the
    # rarer lemma took most of the commoner word's count.
    for surf in list(claims):
        if surf in lemmas:
            claims[surf] = {surf}
    alone = collections.Counter()
    for surf, who in claims.items():
        if len(who) == 1:
            alone[next(iter(who))] += counts.get(surf, 0)
    freq = collections.Counter(alone)
    for _ in range(2):
        nxt = collections.Counter(alone)
        for surf, who in claims.items():
            if len(who) < 2:
                continue
            c = counts.get(surf, 0)
            if not c:
                continue
            wts = {k: freq[k] + 1 for k in who}
            tot = sum(wts.values())
            for k in who:
                nxt[k] += c * wts[k] / tot
        freq = nxt

    out = {}
    for k, L in formonly.items():
        if k not in lemmas:
            L['freq'] = round(freq.get(L['alt_of'], 0), 2)
            L['own'] = round(counts.get(k, 0), 2)
            L['formonly'] = True
            out[k] = L
    for k, L in lemmas.items():
        if k.startswith('cap:'):
            # counted where Tatoeba writes it capitalised inside a sentence
            freq[k] = tatcap[unmark(L['word'])] * 1e6 / nt / 2
        L['freq'] = round(L.pop('multi', 0) or freq.get(k, 0), 2)
        L['own'] = round(counts.get(k, 0), 2)
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    top = sorted((L for L in out.values() if 'entries' in L), key=lambda L: -L['freq'])[:120]
    print(f'  {len(out)} lemmas; commonest:', ' '.join(L['word'] for L in top))


if __name__ == '__main__':
    main()
