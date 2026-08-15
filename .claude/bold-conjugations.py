#!/usr/bin/env python3
"""Mark the CONJUGATED PART of every form in a deck's conjugation tables.

    python3 .claude/bold-conjugations.py [deck.json …]        # default: decks/*

Shared by all three vocabulary generators (Italian, Spanish, German), which call
`mark_deck(deck)` on the dict just before they write it, and usable on its own
over a SHIPPED file -- one implementation, two ways in, so a deck patched today
and a deck rebuilt next year cannot come out different.  Idempotent: an existing
marking is stripped before a fresh one is made, so re-running is safe and a rule
change re-marks rather than double-marking.

**WHAT "THE CONJUGATED PART" IS, AND WHY IT IS NOT THE STEM OF THE VERB.**  The
obvious rule is to take the stem off the infinitive and bold what follows, and it
was measured before it was rejected: over the shipped decks it holds for regular
verbs and collapses on exactly the verbs a learner needs it for.  A verb's own
stem occurs in 21% of `sprechen`'s forms (spr*a*ch-, ge-spr*o*chen), 38% of
`poder`'s (p*ue*d-, p*u*d-), 32% of `gehen`'s and 4% of `essere`'s -- so on a
strong or suppletive verb almost every cell would be bolded whole, which is not a
highlight but a wall of red.

What a conjugation table actually teaches is **what changes from cell to cell**,
so that is what is marked: within one tense block the invariant part is left in
the ordinary ink and everything else is bold.  It falls out right on every shape
the shipped decks contain --

    parlare, presente     parl|o parl|i parl|a parl|iamo …    the endings
    avere, presente       ho hai ha abbiamo avete hanno       every cell whole,
                                                              which is honest:
                                                              it IS suppletive
    sprechen, präteritum  sprach sprach|st sprach|en …        the endings
    haben, perfekt        hab|e gehabt / ha|st gehabt         the auxiliary
                                                              alone, the
                                                              participle plain
    essere, pass. pross.  sono stat|o/a … siamo stat|i/e      the agreement

**A FORM IS COMPARED WORD BY WORD, WHICH IS WHAT MAKES THE COMPOUND TENSES
WORK.**  `ho fatto` against `abbiamo fatto` share nothing as strings, so a
whole-string comparison bolds both entirely; compared position by position the
auxiliaries vary (bold) and the participle does not (plain) -- and Spanish's
negative imperative `no seas` keeps its `no` in the ordinary ink for free,
because `no` is the same in every cell of the block.

**THE VERB'S OWN STEM IS DELIBERATELY NOT USED TO WIDEN A SHORT COMMON PREFIX**,
which was tried first and is worth recording because it looks obviously right.
`sprechen`'s present is spreche / sprichst / spricht / sprechen, whose common
prefix is only `spr`, so a form beginning with the verb's stem was given `sprech`
instead -- and that splits ONE paradigm two ways, `sprech|e` beside `spr|ichst`,
with the ich form left carrying no mark at all because it IS the stem.  Italian
came out worse (`parl|o` beside `parla|te`) and `habe` lost its ending entirely.
Requiring the widening to apply to a whole block or not at all fixes the
inconsistency and makes the rule provably inert: if every form in a block begins
with the stem, the block's own common prefix is already at least that long.  So
it is gone, and a block is measured against itself alone.

**AND THE NON-FINITE FORMS HAVE NO BLOCK TO VARY WITHIN**, an infinitive and a
participle being different things rather than cells of one paradigm, so those
are marked against the lemma stem alone (parl|are, parl|ato, parl|ando).

One rule is stated on the search rather than on the split: the stem is looked for
at the FRONT of a word and then, failing that, after a prefix of at most three
letters -- which is what marks German's participle circumfix (**ge**hab**t**) and
is short enough that it cannot find the stem by coincidence in the middle of a
long form.  A word the stem is not in at all is bold whole, which is the honest
answer for a suppletive cell.

**AND AN ACCENT IS NOT A DIFFERENT LETTER FOR THE PURPOSE OF MEASURING WHAT
VARIES.**  Spanish writes the stress on the 1st and 2nd person plural of most
tenses, and `matábamos` shares nothing with `mataba` as a string -- so one
accented cell erased the stem for its whole block and every cell in it went
wholly red.  Measured before it was fixed: **43.5% of the Spanish blocks**, the
whole imperfect of nearly every verb, against 0.1% of the Italian and 1.8% of the
German.  The comparison is therefore made on an accent-folded copy and the
ORIGINAL is sliced by the length agreed on, so `éra|mos` keeps its accent in the
ordinary ink.  The cost is that a German umlaut stops being highlighted
(`fahr|e` / `fähr|st` rather than `f|ahre` / `f|ährst`) -- eleven blocks in the
German deck, where the letter is still there to be seen and the alternative was a
one-letter stem that bolded nearly the whole cell.  A fold that changes a word's
LENGTH is refused, so `ß` is left exactly as it is and the slicing stays aligned.

Declension tables are deliberately NOT touched: a noun's plural and an
adjective's agreement are not conjugation, and the request was about the verbs.
"""
import json, os, re, sys, unicodedata

MARK_CLASS = 'uc-cj-e'
CSS_RULE = ('.' + MARK_CLASS + '{font-weight:700;color:var(--zh, #C8453C);}')

# A row whose label names an auxiliary is naming ANOTHER verb (`ausiliare:
# avere`), so it is left exactly as printed -- marking it would bold a lemma
# that is not being conjugated here.
AUX_LABELS = {'ausiliare', 'auxiliary', 'auxiliar'}
NONFINITE_LABELS = {'infinito', 'infinitive', 'infinitivo',
                    'participio', 'past participle', 'participle',
                    'gerundio', 'gerund', 'partizip', 'partizip ii'}

# Longest first: a candidate is generated for every ending the infinitive
# actually carries, and the longest that the forms bear out is taken.
INF_ENDINGS = {
    'it': ['arsi', 'ersi', 'irsi', 'arre', 'orre', 'urre', 'rsi', 'are', 'ere',
           'ire', 'rre', 're', 'si'],
    'es': ['arse', 'erse', 'irse', 'írse', 'ar', 'er', 'ir', 'ír', 'se'],
    'de': ['ern', 'eln', 'en', 'n'],
}

ROW_RX = re.compile(
    r'(<span class="uc-cj-p">)([^<]*)(</span><span class="uc-cj-f">)([^<]*)(</span>)')
NFI_RX = re.compile(
    r'(<span class="uc-cj-nfi"><i>)([^<]*)(</i><b>)([^<]*)(</b></span>)')
# One block per tense, and each language spells its container differently:
# Italian `uc-cj`, German `uc-cj-b`, Spanish `uc-cj-t`.  Anchored on the closing
# quote, or `uc-cj-grid` and `uc-cj-nf` -- the wrappers AROUND the blocks -- match
# too and the whole table comes back as one block, which silently compares the
# present against the imperfect and bolds nearly every cell whole.
BLOCK_RX = re.compile(r'<div class="uc-cj(?:-[bt])?">')
STRIP_RX = re.compile(r'<span class="' + MARK_CLASS + r'">([^<]*)</span>')


def unmark(html):
    """Take an earlier marking back off, so this can be re-run."""
    return STRIP_RX.sub(r'\1', html or '')


def fold(w):
    """`éramos` -> `eramos`, for comparison only.

    A fold that changes the LENGTH is refused and the word comes back untouched,
    which keeps every index into the folded copy valid against the original --
    German's `ß` is the case that would otherwise slip.
    """
    d = unicodedata.normalize('NFD', w)
    out = ''.join(c for c in d if not unicodedata.combining(c))
    return out if len(out) == len(w) else w


def lcp(words):
    """The longest prefix every one of these shares, accents folded.

    Returned as a slice of a real word rather than of the folded copy, so the
    stem carries whatever the edition prints; nothing downstream reads it except
    through `fold`, and its length is what does the work.
    """
    ws = sorted(w for w in words if w)      # sorted, so a rebuild is byte-identical
    if not ws:
        return ''
    fs = [fold(w) for w in ws]
    a, b = min(fs), max(fs)
    i = 0
    while i < len(a) and i < len(b) and a[i] == b[i]:
        i += 1
    return ws[0][:i]


def lemma_stem(inf, lang):
    """The verb's own stem: its infinitive with the LONGEST ending it carries off.

    Longest and not shortest, because `-re` matches every Italian infinitive and
    strips only the `re` off `parlare`, leaving `parla` -- which then reads the
    3rd person singular as the bare stem and prints `parla|te` beside `parl|o`.
    Only the non-finite forms are measured against this; the finite blocks are
    measured against themselves.
    """
    if not inf:
        return ''
    # A phrasal infinitive is conjugated on its FIRST word (`fare affari`), so
    # the stem comes off that; the complement is invariant and is left to its own
    # column, which agrees on it and marks nothing.
    inf = inf.strip().lower().split(' ')[0]
    for e in sorted(INF_ENDINGS.get(lang, []), key=len, reverse=True):
        if inf.endswith(e) and len(inf) > len(e):
            return inf[:-len(e)]
    return inf


def mark_word(word, stem):
    """Bold everything in `word` that is not the invariant `stem`.

    Every comparison is made on the accent-folded copies and every slice on the
    original; `fold` preserves length, so the two stay aligned.
    """
    if not word:
        return word
    fw, fs = fold(word), fold(stem or '')
    if fs and fw == fs:
        return word                       # invariant in this block: nothing to show
    j = -1
    if fs:
        if fw.startswith(fs):
            j = 0
        elif len(fs) >= 2:
            # only just after a prefix, or it is a coincidence rather than a stem
            # -- and never for a one-letter stem, which `fare` has and which is
            # found inside almost any word (`a|f|fari`)
            k = fw.find(fs)
            if 0 < k <= 3:
                j = k
    if j < 0:
        return _b(word)                   # wholly irregular: the whole cell is the answer
    head, mid, tail = word[:j], word[j:j + len(fs)], word[j + len(fs):]
    return (_b(head) if head else '') + mid + (_b(tail) if tail else '')


def _b(s):
    return '<span class="' + MARK_CLASS + '">' + s + '</span>'


def mark_conjugation(html, lang):
    """Mark one card's Conjugation field."""
    html = unmark(html)
    if 'uc-cj' not in html:
        return html

    inf = ''
    m = NFI_RX.search(html)
    if m and m.group(2).strip().lower() in ('infinitive', 'infinitivo'):
        inf = m.group(4)
    if not inf:
        for _, lbl, _, form, _ in ROW_RX.findall(html):
            if lbl.strip().lower() == 'infinito':
                inf = form
                break
    stem = lemma_stem(inf, lang)

    # ---- the finite blocks, each marked against its own variation
    pieces, last = [], 0
    bounds = [m.start() for m in BLOCK_RX.finditer(html)] + [len(html)]
    for i in range(len(bounds) - 1):
        a, b = bounds[i], bounds[i + 1]
        pieces.append(html[last:a])
        pieces.append(_mark_block(html[a:b], stem))
        last = b
    pieces.append(html[last:])
    out = ''.join(pieces)

    # ---- and the non-finite items, which have no block to vary within

    def nf(m):
        if m.group(2).strip().lower() in AUX_LABELS:
            return m.group(0)
        return m.group(1) + m.group(2) + m.group(3) + mark_word(m.group(4), stem) + m.group(5)

    return NFI_RX.sub(nf, out)


def _mark_block(block, stem):
    rows = ROW_RX.findall(block)
    live = [(lbl.strip().lower(), form) for _, lbl, _, form, _ in rows]
    live = [(l, f) for l, f in live if l not in AUX_LABELS]
    if not live:
        return block

    # A block of non-finite forms is a list of different things rather than one
    # paradigm, and a block holding a single form has nothing to vary against;
    # both are measured against the verb's own stem instead.
    by_lemma = (all(l in NONFINITE_LABELS for l, _ in live)
                or len({f for _, f in live}) < 2)

    # per WORD POSITION, so a compound tense's auxiliary and its participle are
    # judged separately -- see the module docstring
    cols = {}
    for _, f in live:
        for i, w in enumerate(f.split(' ')):
            cols.setdefault(i, []).append(w)
    col_stem = {i: lcp(set(ws)) for i, ws in cols.items()}

    def row(m):
        lbl, form = m.group(2).strip().lower(), m.group(4)
        if lbl in AUX_LABELS:
            return m.group(0)
        # The lemma stem answers for the word that is CONJUGATED, which is the
        # first; a complement (`fare affari` -> `affari`) is invariant and is
        # left to its own column, which agrees on it and marks nothing.
        out = [mark_word(w, stem if (by_lemma and i == 0) else col_stem.get(i, ''))
               for i, w in enumerate(form.split(' '))]
        return m.group(1) + m.group(2) + m.group(3) + ' '.join(out) + m.group(5)

    return ROW_RX.sub(row, block)


def mark_deck(deck):
    """Mark every conjugation in a deck dict, in place.  Returns how many."""
    types = (deck.get('meta') or {}).get('types') or {}
    langs = {tid: ((t.get('speechLang') or '')[:2]).lower() for tid, t in types.items()}
    if not langs:
        return 0
    only = set(langs.values())
    lang = langs[sorted(langs)[0]] if len(only) == 1 else None
    n = 0
    for c in deck.get('cards') or []:
        f = c.get('fields') or {}
        cj = f.get('Conjugation')
        if not cj or 'uc-cj' not in cj:
            continue
        lg = lang or langs.get(c.get('type'), '')
        if lg not in INF_ENDINGS:
            continue
        new = mark_conjugation(cj, lg)
        if new != cj:
            f['Conjugation'] = new
            n += 1
    # The rule goes in only where something wears it: a deck with no conjugations
    # at all (Mandarin) is left byte-identical rather than carrying a style for a
    # class it can never use.
    if n:
        for t in types.values():
            if t.get('css') and MARK_CLASS not in t['css']:
                t['css'] = t['css'].rstrip() + '\n' + CSS_RULE + '\n'
    return n


def patch_file(path):
    """Mark a shipped deck in place.  A deck with nothing to mark is not written.

    Not merely an optimisation: the Mandarin decks are built by a JavaScript
    generator, and `json.dump` separates a key from its value with a space where
    `JSON.stringify` does not -- so writing one back reformats all 21 MB of it and
    reports as a change to every card in the file.
    """
    deck = json.load(open(path, encoding='utf-8'))
    n = mark_deck(deck)
    if n:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(deck, f, ensure_ascii=False)
    return n


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args:
        here = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'decks')
        args = sorted(os.path.join(here, f) for f in os.listdir(here)
                      if f.endswith('.folio-deck.json'))
    for p in args:
        print(f'{os.path.basename(p):44s} {patch_file(p):6d} conjugations marked')
