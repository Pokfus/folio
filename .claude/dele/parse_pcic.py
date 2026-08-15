#!/usr/bin/env python3
"""Turn this level's Instituto Cervantes inventory cells into candidate lemmas.

The cells are not a word list: they mix vocabulary with collocation frames
(`ser ~ alto/bajo`), metalinguistic labels (`[números cardinales]`),
cross-references (`[v. Gramática 9.1.1.]`) and worked example sentences
(`Hay mucha gente en la calle.`).  Everything here is about separating those.
"""
import json, re, sys, html as _html
from dele_level import COLUMN, PAGES, f as lvlf

def cells(fn):
    """This level's half of a two-column inventory page.

    Each notion is a table with one level's column beside the next one's -- A1
    beside A2, B1 beside B2 -- and the cells are tied to their column by a
    `headers` attribute ending in a1/a2/b1/b2, which is the only thing on the
    page that separates the two.
    """
    s = open(fn, encoding='utf-8').read()
    out = []
    for m in re.finditer(r'<td[^>]*headers="[^"]*%s"[^>]*>(.*?)</td>' % COLUMN, s, re.S):
        for li in re.findall(r'<li>(.*?)</li>', m.group(1), re.S):
            t = _html.unescape(re.sub(r'<[^>]+>', '', li))
            t = re.sub(r'\s+', ' ', t).strip()
            if t:
                out.append(t)
    return out

P = PAGES[COLUMN]
items = ([('esp', x) for x in cells(f'pcic_{P}.htm')] +
         [('gen', x) for x in cells(f'pcic_gen_{P}.htm')])

CAP = r'[A-ZÁÉÍÓÚÜÑ]'

def strip_examples(t):
    """Cut a worked example sentence off the end of a cell.

    An example starts on a capitalised word and carries sentence punctuation.
    A cell that merely opens on a capital (`Internet, libro`) or carries an
    inline heading (`Lugares de trabajo empresa`) has no such punctuation and
    is left alone -- cutting there would take real vocabulary with it.
    """
    for m in re.finditer(CAP, t):
        i = m.start()
        if i == 0:
            continue
        # a capital mid-cell only starts an example if a sentence follows it
        if re.search(r'[.?!¿¡]', t[i:]):
            return t[:i]
    return t

def clean(t):
    t = strip_examples(t)
    t = re.sub(r'\[[^\]]*\]', ' ', t)      # [números cardinales], [v. Gramática 1.2.]
    t = re.sub(r'\([^)]*\)', ' ', t)       # (no) haber -> haber ; quizá(s) -> quizá
    t = t.replace('~', ' ').replace('+', ' ')
    t = re.sub(r'\s+', ' ', t).strip()
    return t

# words that are pure grammar scaffolding in these frames, never the vocabulary item
SCAFFOLD = {
    'el','la','los','las','un','una','unos','unas','de','del','al','a','en',
    'y','o','u','e','que','se','lo','su','mi','tu','me','te','nos',
}

def segments(t):
    """Split a cleaned cell into candidate items, keeping multi-word units."""
    out = []
    for part in re.split(r'[,;]', t):
        part = part.strip()
        if not part:
            continue
        for alt in part.split('/'):
            alt = alt.strip(' .·')
            if alt:
                out.append(alt)
    return out

def is_affix(t):
    """A DERIVATIONAL AFFIX IS NOT A WORD, and the C levels list them.

    The Nociones inventories turn morphological at C1 and C2 -- `-ecer`, `-ote`,
    `-ón`, `-ado`, `mega-`, `post-`, `requete-` -- which are a notion the way a
    suffix is, and are not vocabulary a card can ask for.  `select.py`'s
    `GOOD_POS` would drop them a stage later, Wiktionary filing them as
    `suffix`/`prefix`, but that is an indirect guard over a table kept for
    another purpose; a thing that is not a word should not become a candidate at
    all.

    MEASURED BEFORE IT WAS KEPT, and it is NOT inert everywhere, which is worth
    saying rather than claiming a clean sweep.  A1 and A2 are byte-identical.
    B1 and B2 are not: B1 loses `-ito`, `-ísimo` and a frame reading `-ito
    buenísima librito [v`, and with that frame the two words reachable only
    inside it (`buenísima`, `librito`, which are the printed EXAMPLES of the
    diminutive and the superlative rather than vocabulary); B2 loses `ex-`,
    `super-` and a stray `-¿`.  None of the seven is in the shipped B1 or B2 --
    checked against the deck files, not assumed -- so the candidate lists move
    and the decks do not.
    """
    return t.startswith('-') or t.endswith('-')

cands = {}   # lowercased candidate -> set of source files
for src, raw in items:
    for seg in segments(clean(raw)):
        seg = seg.lower().strip()
        if not seg or re.search(r'\d', seg) or is_affix(seg):
            continue
        cands.setdefault(seg, set()).add(src)
        # also offer the individual words, in case the segment is a frame
        # rather than a unit ("tener el pelo" -> tener, pelo)
        ws = [w for w in re.split(r'\s+', seg) if w and w not in SCAFFOLD]
        if len(ws) > 1 or (len(ws) == 1 and ws[0] != seg):
            for w in ws:
                if not is_affix(w):
                    cands.setdefault(w, set()).add(src)

print('cells        :', len(items))
print('candidates   :', len(cands))
multi = [c for c in cands if ' ' in c]
print('multi-word   :', len(multi))
json.dump({k: sorted(v) for k, v in sorted(cands.items())},
          open(lvlf('pcic_candidates.json'), 'w'), ensure_ascii=False, indent=0)
for c in sorted(cands)[:40]:
    print('  ', c)
