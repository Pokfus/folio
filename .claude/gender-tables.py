"""A GENDERED NOUN'S FORMS ARE A TABLE, NOT A ROW.

Aug 2026, on request: "For nouns, instead of summing up their conjugations horizontally
(plural, feminine, a.an) when it includes a gender conjugation, present them in table format
with the genders as columns and singular/plural as rows."

`il ragazzo` used to print its three forms as one horizontal run -- PLURAL i ragazzi,
FEMININE la ragazza, A, AN un ragazzo -- which sets four words of one paradigm side by side
and leaves the reader to work out that two of them differ in NUMBER and two in GENDER. Laid
out as a grid the two axes are the two axes:

              MASCULINE      FEMININE
    SINGULAR  il ragazzo     la ragazza
    PLURAL    i ragazzi      --

WHY THIS IS A PASS OVER THE DECK FILES. `merge-directions.py`'s reason exactly: a third of the
shelf was supplied ready-made (the German B2/C1/C2, the Italian Core, the French and Portuguese
phrase decks) and no pipeline here can rebuild it, so the transformation has to exist as a pass
whatever else happens -- and each `emit.py` therefore CALLS THIS as its last step rather than
building the grid itself, which is what keeps a fresh pipeline run and a shipped file provably
the same shape.

IT IS A GRID OF DIVS AND NEVER A `<table>`. `SANITIZE_TAGS` carries no `table`/`tr`/`td`, and an
unknown tag is UNWRAPPED rather than dropped -- so a real table would reach the reader as one
run-on line of words with every relation between them gone. The existing `uc-cjg` conjugation
paradigm is the precedent.

WHAT QUALIFIES, AND WHY THE TEST IS THE HEADWORD'S OWN ARTICLE. A grid with a MASCULINE column
asserts that the headword is masculine, so it is drawn only where the headword actually says so
-- `<span class="uc-art uc-m">` -- and where a `feminine` form exists to fill the other column.
Measured over the shelf: 1,137 nouns carry a feminine form and 1,116 of them carry that article.
The 21 that do not keep the horizontal run, and reading them is the argument for leaving them
alone: they are `das Kalb` and `die Krähe` and `die Terroristin` -- a neuter and two feminines,
whose "feminine" form is in several cases not a word anyone says. A grid would state a gender
those entries do not have, confidently, over data that is already doubtful.

THE FEMININE PLURAL IS A DASH BECAUSE THE DATA HAS NOT GOT ONE. Not one qualifying noun on the
shelf states one (the three `feminine plural` forms anywhere are French determiners and
pronouns), and deriving `le ragazze` from `la ragazza` would be inventing content -- which for a
language deck is the one thing this repo must never do. A muted dash is the house convention for
a figure that is not stated, as the Atlas panel's tiles and the Consolation's defective verb use
it. Where there is no plural at all the row disappears and the grid is two labelled cells.

WHAT STAYS BELOW. `a, an` and `with un/une` are ARTICLE VARIANTS rather than cells of a
gender/number paradigm, so they stay in the horizontal `uc-forms` run under the grid, which is
also where anything this pass does not recognise stays. Nothing is ever dropped.

THE CSS IS OWNED HERE, not in any `emit.py`. Appended to a type only when absent, so the pass is
safe to re-run and a generated deck and a patched ready-made one carry byte-identical rules.
"""

import json
import re
import sys

FORMS = re.compile(r'^<div class="uc-forms">(.*)</div>$', re.S)
ITEM = re.compile(r'<span class="uc-fi[^"]*">(.*?)</span>\s*(?=<span class="uc-fi|$)', re.S)
LABEL = re.compile(r'^<span class="uc-fl">(.*?)</span>(.*)$', re.S)
POS = re.compile(r'<div class="uc-pos">(.*?)</div>', re.S)
MASC = re.compile(r'<span class="uc-art uc-m"[^>]*>')
TAG = re.compile(r'<[^>]+>')

# The first field of a language deck's type is the headword; naming them is what lets the pass
# refuse a deck whose type it does not recognise rather than silently reading the wrong field.
HEADWORD = ('Italian', 'German', 'French', 'Portuguese', 'Spanish', 'Simplified', 'Word')

CSS = """
/* A GENDERED NOUN'S PARADIGM IS A GRID, its columns the genders and its rows the numbers.
   Divs rather than a table: `SANITIZE_TAGS` has no `table`/`tr`/`td` and unwraps what it does
   not know, so a real table would arrive as one run-on line.  See `.claude/gender-tables.py`. */
.uc-gt {
  display: grid;
  gap: 3px 14px;
  margin-top: 8px;
  font-size: 15px;
  align-items: baseline;
  grid-template-columns: auto minmax(0, 1fr) minmax(0, 1fr);
}
.uc-gt.uc-gt2 {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}
.uc-gth,
.uc-gtl {
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.5;
}
.uc-gtl {
  padding-right: 2px;
}
.uc-gtx {
  opacity: 0.35;
}
"""


def _plain(html):
    """The headword as the other cells are written: its words, with its article, no markup.
    Keeping the coloured `uc-art` span would colour one cell of four and leave the rest bare."""
    return re.sub(r'\s+', ' ', TAG.sub('', html)).strip()


def _split(forms):
    m = FORMS.match(forms or '')
    if not m:
        return None
    out = []
    for it in ITEM.findall(m.group(1)):
        lm = LABEL.match(it)
        out.append((lm.group(1), lm.group(2)) if lm else (None, it))
    return out


def _run(items):
    return ('<div class="uc-forms">'
            + ''.join('<span class="uc-fi"><span class="uc-fl">%s</span>%s</span>' % (l, v)
                      if l else '<span class="uc-fi">%s</span>' % v
                      for l, v in items)
            + '</div>')


def _grid(masc_sg, fem_sg, masc_pl):
    cell = '<div class="uc-gtc">%s</div>'
    if masc_pl is None:
        return ('<div class="uc-gt uc-gt2">'
                '<div class="uc-gth">masculine</div><div class="uc-gth">feminine</div>'
                + cell % masc_sg + cell % fem_sg + '</div>')
    return ('<div class="uc-gt">'
            '<div class="uc-gth"></div>'
            '<div class="uc-gth">masculine</div><div class="uc-gth">feminine</div>'
            '<div class="uc-gtl">singular</div>' + cell % masc_sg + cell % fem_sg
            + '<div class="uc-gtl">plural</div>' + cell % masc_pl
            + '<div class="uc-gtc uc-gtx">&#x2014;</div>'
            + '</div>')


def tables(deck):
    """Rewrite `deck` in place. Returns {'nouns', 'gridded', 'skipped'}."""
    meta = deck['meta']
    types = meta.get('types') or {}
    if not types:
        raise SystemExit('gender-tables: the deck declares no card types')

    nouns = gridded = skipped = 0
    touched = set()
    for c in deck['cards']:
        f = c.get('fields') or {}
        forms = f.get('Forms', '')
        english = f.get('English', '')
        if not forms or not english:
            continue
        pm = POS.search(english)
        if not pm or not pm.group(1).startswith('noun'):
            continue
        if '<div class="uc-gt' in forms:
            # already gridded by an earlier run of this pass
            gridded += 1
            nouns += 1
            if c.get('type') in types:
                touched.add(c['type'])
            continue
        items = _split(forms)
        if items is None:
            raise SystemExit('gender-tables: a Forms field is not a uc-forms run: %r' % forms[:80])
        if not any(l == 'feminine' for l, _ in items):
            continue
        nouns += 1

        head = None
        for k in HEADWORD:
            if k in f:
                head = f[k]
                break
        if head is None:
            raise SystemExit('gender-tables: no headword field in %r' % sorted(f))
        # A MASCULINE column has to be true of the headword.  See the module docstring for the
        # 21 entries this leaves as they were, and for why leaving them is the point.
        if not MASC.search(head):
            skipped += 1
            continue

        fem = [v for l, v in items if l == 'feminine']
        plu = [v for l, v in items if l == 'plural']
        if len(fem) != 1 or len(plu) > 1:
            skipped += 1
            continue
        rest = [(l, v) for l, v in items if l not in ('feminine', 'plural')]

        out = _grid(_plain(head), fem[0], plu[0] if plu else None)
        if rest:
            out += _run(rest)
        f['Forms'] = out
        gridded += 1
        if c.get('type') in types:
            touched.add(c['type'])

    for tid in sorted(touched):
        t = types[tid]
        if '.uc-gt {' not in (t.get('css') or ''):
            t['css'] = (t.get('css') or '').rstrip('\n') + '\n' + CSS

    return {'nouns': nouns, 'gridded': gridded, 'skipped': skipped}


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('usage: gender-tables.py <deck.json>')
    path = sys.argv[1]
    with open(path, encoding='utf-8') as fh:
        deck = json.load(fh)
    st = tables(deck)
    if st['gridded']:
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(deck, fh, ensure_ascii=False)
    print('%s: %d gendered nouns, %d gridded, %d left as a row'
          % (path, st['nouns'], st['gridded'], st['skipped']))
