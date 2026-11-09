#!/usr/bin/env python3
"""Every Latin lemma a deck could want, compacted, with two frequency measures.

    python3 extract.py         (run from the cache directory, by run.py)

Reads `kaikki-la.jsonl` (the kaikki.org extraction of English Wiktionary,
CC BY-SA 4.0), `dcc-core.csv` (the Dickinson College Commentaries Latin Core
Vocabulary, CC BY-SA 3.0) and `lat_sentences_detailed.tsv` (Tatoeba, CC BY 2.0
FR), and writes `lex.json`.  Level-independent: built once and kept.

TWO FREQUENCIES, AND WHY.  No subtitle list exists for Latin -- the one every
other language on the shelf is ordered by -- and the language a learner reads is
classical prose and verse, not conversation.  So:
  · `dcc` is the word's rank in the DCC Latin Core Vocabulary (1 = commonest),
    the thousand commonest lemmas of classical Latin, lemmatised by scholars
    (Francese et al., 2012-13).  It is the PRIMARY order wherever it exists;
  · `tat` is a lemma count over the Tatoeba Latin corpus (57,000 sentences),
    used only to order the words the DCC list does not hold.  Tatoeba counts
    WORD FORMS, and Latin spreads a word over dozens (`amō`, `amat`, `amāvit`
    ...), so a lemma's count is the sum over every form in its Wiktionary table;
    a form several lemmas share (`est`: `sum` and `edō`) is split in proportion
    to what each earns from the forms it holds alone, over two rounds -- the
    Russian and Hindi pipelines' rule.

WHAT IS KEPT.  Entries of a part of speech a vocabulary deck teaches, written in
lower case (a capital is a proper name) with at least one real sense; never an
affix, an enclitic or a form-of entry.  Only lemmas a deck could reach are
written out -- one in the DCC list or with any Tatoeba count -- which keeps
the file to tens of megabytes rather than the dump's 1.2 GB.
"""
import collections, csv, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from la import fold, nfc, tidy, is_latin, tokens

DUMP, DCC, TAT, OUT = 'kaikki-la.jsonl', 'dcc-core.csv', 'lat_sentences_detailed.tsv', 'lex.json'

KEEP_POS = {'noun', 'verb', 'adj', 'adv', 'intj', 'num', 'prep', 'pron', 'conj',
            'particle', 'det', 'phrase', 'proverb'}

# A sense carrying one of these is not a meaning a learner's card should open on:
# the deck teaches CLASSICAL Latin, so a later period's sense is weak too.
WEAK = {'rare', 'obsolete', 'archaic', 'dated', 'dialectal', 'poetic', 'uncommon',
        'Old-Latin', 'Late-Latin', 'Medieval-Latin', 'Ecclesiastical-Latin',
        'Early-Medieval-Latin', 'New-Latin', 'Renaissance-Latin', 'Vulgar-Latin',
        'Contemporary-Latin', 'Christianity', 'nonstandard', 'misspelling', 'vulgar',
        'hapax', 'figuratively-rare'}

SHOW_TAGS = {'transitive', 'intransitive', 'with-accusative', 'with-ablative',
             'with-dative', 'with-genitive', 'figuratively', 'impersonal', 'deponent',
             'plural', 'in-plural', 'reflexive'}

# "Adjective: Numeral" (`mīlle`) is Wiktionary's `num`, tested before the plain prefix
DCC_POS = {'Adjective: Numeral': 'num','Noun': 'noun', 'Verb': 'verb', 'Adjective': 'adj', 'Adverb': 'adv',
           'Preposition': 'prep', 'Conjunction': 'conj', 'Pronoun': 'pron',
           'Interjection': 'intj', 'Numeral': 'num', 'Particle': 'particle'}


def dcc_list():
    """fold(first headword) -> [(rank, display headword, pos)], every row of the list."""
    out = collections.defaultdict(list)
    for row in csv.DictReader(open(DCC, encoding='utf-8')):
        head = nfc(row['Headword']).strip()
        first = re.split(r'[\s,/:]+', head)[0]
        p = row['Part of Speech'].strip()
        pos = DCC_POS.get(p) or DCC_POS.get(p.split(':')[0].strip(), '')
        out[fold(first)].append((int(row['Frequency Rank']), head, pos))
    return out


def is_formof(s, pos=''):
    t = s.get('tags') or []
    g = ' '.join(s.get('glosses') or [])
    # A PARTICIPLE THAT IS ALSO AN ADJECTIVE (`sapiēns` "wise", `potēns` "powerful") is
    # tagged form-of with a real meaning; only "... participle of X" is a pointer.
    if 'participle' in t and not re.search(r'\bparticiple of\b|\bof \S+$', g):
        return False
    # A PRONOUN FILED AS A FORM (`nōs` "nominative/accusative plural of ego: we, us") is
    # a word a beginner learns as one; the meaning after the colon is kept (`clean_gloss`).
    if pos in ('pron', 'det') and re.match(r'^(?:nominative|genitive|dative|accusative|ablative|vocative)[^:]* of \S+: \S', g):
        return False
    return 'form_of' in s or 'alt_of' in s or 'form-of' in t or 'alt-of' in t


POINTER = re.compile(r'^(scribal abbreviation|alternative|obsolete|archaic|dated|rare|nonstandard|syncopated|'
                     r'contracted|abbreviation|misspelling)\b.*\b(form|spelling|of)\b')


LETTER = re.compile(r'\bname of the (?:Latin[- ]script )?letter\b|^The name of the Latin', re.I)


def clean_gloss(g):
    g = re.sub(r'\s+', ' ', g or '').strip()
    # a LETTER'S NAME (`ā` "the letter A", `ex` "a name of the letter X") is not the word
    if LETTER.search(g):
        return ''
    g = re.sub(r'\[+([^\[\]]*)\]+', r'\1', g)
    m = re.match(r'^(?:nominative|genitive|dative|accusative|ablative|vocative)[^:]* of \S+: (\S.*)$', g)
    if m:
        g = m.group(1)
    if POINTER.match(g):
        return ''
    return g


def canonical(e):
    """The headword as Wiktionary displays it, macrons and all: `rēx`, `amō`, `quis`."""
    for h in e.get('head_templates') or []:
        x = h.get('expansion') or ''
        if not x:
            continue
        x = x.split(' (')[0].split(' or ')[0]
        x = re.sub(r'\s+(m|f|n|c)(\s+(or|and)\s+(m|f|n))*(\s+(pl|sg|du))?$', '', x)
        x = re.sub(r'\s+(pl|sg)$', '', x)
        x = tidy(x)
        if fold(x) == fold(e['word']):
            return x
    return e['word']


def gender_of(e):
    for h in e.get('head_templates') or []:
        a = h.get('args') or {}
        gs = {x.replace('-p', '') for x in (a.get('g', ''), a.get('g2', '')) if x}
        if gs:
            return ''.join(x for x in 'mfnc' if x in gs)
        x = h.get('expansion') or ''
        m = re.match(r'^\S+\s+((?:m|f|n|c)(?:\s+(?:or|and)\s+(?:m|f|n))*)(?:\s+pl)?\b', x)
        if m:
            return re.sub(r'\s+(or|and)\s+', '', m.group(1))
    tags = collections.Counter(t for s in e.get('senses') or [] for t in s.get('tags') or [])
    return ''.join(g[0] for g in ('masculine', 'feminine', 'neuter') if tags[g])


def class_of(e):
    """`first declension`, `third conjugation, deponent` -- the tail of the head line."""
    for h in e.get('head_templates') or []:
        x = h.get('expansion') or ''
        if ');' in x:
            return x.split(');', 1)[1].strip()
        m = re.search(r';\s*(.+)$', x)
        if m and '(' not in m.group(1):
            return m.group(1).strip()
    return ''


def plural_only(e):
    for h in e.get('head_templates') or []:
        x = h.get('expansion') or ''
        if re.match(r'^\S+\s+(?:m|f|n)(?:\s+(?:or|and)\s+(?:m|f|n))*\s+pl\b', x):
            return True
    return False


GOOD_FORM = re.compile(r"^[a-zà-ɏ̀-ͯ ]+$")


def main():
    # Tatoeba: every Latin sentence, linked or not, counted by folded word form
    counts = collections.Counter()
    for row in csv.reader(open(TAT, encoding='utf-8'), delimiter='\t', quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            for t in tokens(row[2]):
                counts[fold(t)] += 1
    dcc = dcc_list()

    lemmas = {}
    for line in open(DUMP, encoding='utf-8'):
        i = line.find('"pos": "')
        if i < 0 or line[i + 8:line.find('"', i + 8)] not in KEEP_POS:
            continue
        e = json.loads(line)
        w = nfc(e.get('word', ''))
        if e.get('pos') not in KEEP_POS or not is_latin(w):
            continue
        senses = e.get('senses') or []
        real = [s for s in senses if not is_formof(s, e['pos']) and s.get('glosses')]
        if not real:
            continue
        gl = []
        for s in real:
            tags = set(s.get('tags') or [])
            g = clean_gloss((s.get('glosses') or [''])[-1])
            if g:
                gl.append({'g': g, 'weak': bool(tags & WEAK), 'tags': sorted(tags & SHOW_TAGS)})
        if not gl:
            continue
        table, head = [], []
        for f in e.get('forms') or []:
            fm, tags = tidy(f.get('form', '')), f.get('tags') or []
            if 'table-tags' in tags or 'inflection-template' in tags or 'romanization' in tags:
                continue
            if f.get('source') in ('declension', 'conjugation', 'inflection'):
                if GOOD_FORM.match(fm.lower()) and '+' not in fm:
                    table.append({'f': fm, 't': tags})
            elif 'canonical' not in tags and fm:
                head.append({'f': fm, 't': tags})
        k = fold(w)
        ent = {'pos': e['pos'], 'etym': e.get('etymology_number', ''), 'canon': canonical(e),
               'gender': gender_of(e), 'cls': class_of(e), 'pl': plural_only(e),
               'glosses': gl, 'head': head, 'table': table,
               'cases': sorted({t[5:] for s in real for t in s.get('tags') or []
                                if t.startswith('with-')} |
                               {(h.get('args') or {}).get('2', '') for h in e.get('head_templates') or []
                                if h.get('name') == 'la-prep'} - {''})}
        lemmas.setdefault(k, {'word': w, 'entries': []})['entries'].append(ent)

    # which lemmas claim which surface (each lemma its own spelling and its table)
    claims = collections.defaultdict(set)
    for k, L in lemmas.items():
        if ' ' in k:
            continue
        claims[k].add(k)
        for ent in L['entries']:
            for row in ent['table']:
                if ' ' not in row['f']:
                    claims[fold(row['f'])].add(k)
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

    out = {}
    for k, L in lemmas.items():
        d = dcc.get(k)
        tat = round(freq.get(k, 0), 2)
        if not d and tat <= 0:
            continue
        L['dcc'] = min(r for r, _, _ in d) if d else 0
        L['dcc_rows'] = [[r, h, p] for r, h, p in sorted(d)] if d else []
        L['tat'] = tat
        out[k] = L
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    missing = sorted(k for k in dcc if k not in out)
    top = sorted((L for L in out.values() if L['dcc']), key=lambda L: L['dcc'])[:30]
    print(f'  {len(out)} lemmas kept ({sum(1 for L in out.values() if L["dcc"])} in the DCC list); '
          f'{sum(counts.values())} Tatoeba tokens')
    print('  DCC order:', ' '.join(L['word'] for L in top))
    if missing:
        print(f'  DCC headwords with no Wiktionary lemma ({len(missing)}):', ' '.join(missing))


if __name__ == '__main__':
    main()
