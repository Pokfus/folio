#!/usr/bin/env python3
"""Pick out, in every paradigm, the part of the word that is actually changing.

A conjugation table is six spellings of one word, and what a learner has to take
away from it is the handful of letters that differ.  Printed flat -- `setze`,
`setzt`, `setzen` -- the eye has to find them; marked, the table says its own
lesson: setz<b>e</b>, setz<b>t</b>, setz<b>en</b>.  This wraps that part in
`<span class="uc-infl">`, which the decks style bold and in the same vermilion
the example sentences pick the headword out in.

ONE RULE, AND IT IS DELIBERATELY LANGUAGE-INDEPENDENT: within a block, the part
of a form that follows the longest prefix EVERY form in that block shares.  That
is the definition of "the part that changes", it needs no table of endings for
any particular language, and it is what lets the German and the Spanish decks use
one implementation.  An ending list was tried and is worse in both directions: it
cannot mark the article (`d`er / `d`es / `d`em / `d`en -- no German ending list
contains `er` as a form of `der`), and every language it is applied to needs its
own.

WHAT IT MARKS ON A STRONG VERB IS THE STEM CHANGE AS WELL AS THE ENDING, and
that is right rather than a limitation: `treffen` gives tr<b>effe</b> /
tr<b>iffst</b> / tr<b>ifft</b>, because tr- is genuinely all the six forms share.
A textbook would bold only the ending, and would then be silent about the vowel
alternation, which is the harder half of a German strong verb and the whole
difficulty of a Spanish stem-changing one (t<b>engo</b> / t<b>ienes</b>).

THREE GUARDS, each for a way the marking could say something untrue:

  · A block whose forms share NOTHING marks nothing.  `sein` is bin / bist / ist
    / sind / seid / sind and `ser` is soy / eres / es / somos: a suppletive
    paradigm has no stem to hold constant, so a rule that marks "what differs"
    would paint the whole table red and teach that every letter is an ending.
  · A block whose forms are ALL THE SAME marks nothing.  The past participle
    repeated down a compound tense (`habe gesetzt`, `hast gesetzt`) does not
    inflect, and marking it would say it does.
  · A form that IS the shared prefix marks nothing -- there is no tail to wrap.

THE ALIGNMENT IS BY WORD, NOT BY CELL, which is what makes a declension table
work.  `der Einsatz` / `des Einsatzes` / `dem Einsatz` / `den Einsatz` is two
paradigms side by side: the article declines and so does the noun, and comparing
whole cells would find `de` and stop.  Each cell is split into words, the nth
word of every cell is compared with the nth word of the others, and a word
carrying alternatives separated by a slash (`dem Einsatz/Einsatze`) contributes
each of them.

Not part of the site: this runs at build time and what ships is the marked HTML.
"""
import re

CLASS = 'uc-infl'

# a form cell in a conjugation block, and a cell in a declension table
FORM_RX = re.compile(r'(<span class="uc-cj-f">)([^<]*)(</span>)')
CELL_RX = re.compile(r'(<span class="uc-dtc">)([^<]*)(</span>)')
ROW_RX = re.compile(r'<div class="uc-dtr[^"]*">.*?</div>\s*(?=<div class="uc-dtr|</div>)',
                    re.S)
# a tense block: German writes `uc-cj-b`, Spanish `uc-cj-t`, and both hold rows
# of `uc-cj-f`.  The split is on the opening tag so that the non-finite header
# (`uc-cj-nf`, the infinitive and participle) falls outside every block and is
# never marked -- it is a list of three different words, not a paradigm.
BLOCK_SPLIT = re.compile(r'(?=<div class="uc-cj-[bt]")')
TABLE_SPLIT = re.compile(r'(?=<div class="uc-dt )')


def _words(cell):
    """The words of a cell, each as its list of slash-separated alternatives."""
    return [w.split('/') for w in cell.split(' ') if w]


def _prefix(strings):
    """The longest prefix every one of them shares."""
    if not strings:
        return ''
    p = strings[0]
    for s in strings[1:]:
        i = 0
        while i < len(p) and i < len(s) and p[i] == s[i]:
            i += 1
        p = p[:i]
        if not p:
            break
    return p


def _mark_group(cells):
    """Mark one paradigm.  `cells` are the raw texts; returns them marked."""
    split = [_words(c) for c in cells]
    width = max((len(w) for w in split), default=0)
    # the shared prefix of each word position, over every alternative at it
    prefixes = []
    for i in range(width):
        alts = [a for w in split if i < len(w) for a in w[i]]
        distinct = {a for a in alts if a}
        # nothing shared, or nothing varying: mark neither
        prefixes.append('' if len(distinct) < 2 else _prefix(sorted(distinct)))
    out = []
    for w in split:
        parts = []
        for i, alts in enumerate(w):
            p = prefixes[i] if i < len(prefixes) else ''
            marked = []
            for a in alts:
                if p and a.startswith(p) and len(a) > len(p):
                    marked.append(f'{p}<span class="{CLASS}">{a[len(p):]}</span>')
                else:
                    marked.append(a)
            parts.append('/'.join(marked))
        out.append(' '.join(parts))
    return out


def _mark_spans(html, rx):
    """Mark every form the pattern finds in `html`, as one paradigm."""
    hits = list(rx.finditer(html))
    if len(hits) < 2:
        return html
    marked = _mark_group([m.group(2) for m in hits])
    out, at = [], 0
    for m, text in zip(hits, marked):
        out.append(html[at:m.start()])
        out.append(m.group(1) + text + m.group(3))
        at = m.end()
    out.append(html[at:])
    return ''.join(out)


def _mark_table(html):
    """A declension table declines DOWN each column, so the paradigm is the
    column: the nominative, accusative, dative and genitive of one number or
    gender.  Read across a row instead and the comparison is between the
    masculine and the neuter, which share an ending precisely where the lesson
    is that they differ."""
    rows = ROW_RX.findall(html)
    body = [r for r in rows if 'uc-dth' not in r[:60]]
    if len(body) < 2:
        return html
    cols = [CELL_RX.findall(r) for r in body]
    width = min((len(c) for c in cols), default=0)
    if not width:
        return html
    # EVERY COLUMN IS MARKED FIRST AND EACH ROW REWRITTEN ONCE.  Writing a column
    # back before computing the next one cannot work: the marked cell now holds a
    # nested span, and `CELL_RX` reads a cell as `[^<]*`, so the second pass finds
    # fewer cells than there are and silently skips every column but the first --
    # which is what happened, and which looks exactly like a table whose plural
    # simply has nothing to mark.
    marked = [_mark_group([cols[r][i][1] for r in range(len(body))])
              for i in range(width)]
    for r, row in enumerate(body):
        n, out, at = 0, [], 0
        for m in CELL_RX.finditer(row):
            out.append(row[at:m.start()])
            text = marked[n][r] if n < width else m.group(2)
            out.append(m.group(1) + text + m.group(3))
            at, n = m.end(), n + 1
        out.append(row[at:])
        new = ''.join(out)
        if new != row:
            html = html.replace(row, new, 1)
    return html


def mark(html):
    """Mark every paradigm in a Conjugation field.  Idempotent: a field that has
    already been marked carries `uc-infl` and is handed back untouched, so a
    build that runs the pass twice cannot nest one span inside another."""
    if not html or CLASS in html:
        return html
    out = []
    for seg in BLOCK_SPLIT.split(html):
        out.append(_mark_spans(seg, FORM_RX) if 'uc-cj-f' in seg else seg)
    html = ''.join(out)
    return ''.join(_mark_table(seg) if 'uc-dtc' in seg else seg
                   for seg in TABLE_SPLIT.split(html))
