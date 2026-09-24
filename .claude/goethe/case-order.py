#!/usr/bin/env python3
"""Put every German case table in the order Nominativ, Genitiv, Dativ, Akkusativ.

    python3 .claude/goethe/case-order.py            # rewrite the German decks in place
    python3 .claude/goethe/case-order.py --check    # exit 1 if any table is out of order

WHY THIS EXISTS BESIDE THE GENERATOR.  `build_deck.py` sets the order at the
source (`CASES`, `PRON_CASES` and the composed pronoun rows), which is what a
re-run of A1 or B1 will print.  But four of the six German decks -- B2, C1, C2
and Phrases & expressions -- were supplied ready-made and no `--level` run makes
them, and the two that ARE generated cannot be rebuilt here byte for byte: the
Wiktionary extraction they read is fetched fresh from kaikki.org, which moves
daily, so a rebuild would change a great deal more than the rows.  So the shipped
files are reordered by this instead, and it is written to do NOTHING else.

WHAT IT TOUCHES AND WHAT IT CANNOT.  Only a `<div class="uc-dt …">` grid inside a
card field, and only two shapes of it:
  · a table whose ROW LABELS are case names (a noun, an adjective, a determiner,
    the article, a genderless pronoun) -- those rows are permuted;
  · a table whose COLUMN HEADS are case names (the personal and reflexive
    pronouns) -- the heads and every row's cells are permuted together.
Every row and every cell is moved WHOLE, as the exact bytes it already was, and
the script asserts that the multiset of rows (and of each row's cells) is
unchanged before it writes.  A table carrying a case name more than once, or a
case name mixed with some other label, is REFUSED rather than guessed at.  Prose
that merely mentions a case -- an example sentence, a gloss -- is never a grid
and is never touched.

The files are re-serialised the way `emit.py` writes them (compact, UTF-8), and
the script first proves that re-serialising the UNTOUCHED file reproduces it byte
for byte, so the only diff it can produce is the reordering.  Idempotent.
Re-run `node .claude/build-lang-decks.js` afterwards: the content revision moves.
Not part of the site.
"""
import glob, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ORDER = ['Nominativ', 'Genitiv', 'Dativ', 'Akkusativ']
RANK = {c: i for i, c in enumerate(ORDER)}

TABLE_OPEN = re.compile(r'<div class="uc-dt uc-dt\d+">')
ROW_OPEN = re.compile(r'<div class="uc-dtr(?: uc-dth)?">')
LABEL = re.compile(r'^<span class="uc-dtl">(.*?)</span>')


def element_end(s, i, tag):
    """Index just past the element opening at s[i], counting nested `tag`s."""
    depth = 0
    pat = re.compile(r'<(/?)' + tag + r'\b[^>]*>')
    for m in pat.finditer(s, i):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return m.end()
    raise ValueError('unbalanced <%s> at %d' % (tag, i))


def split_spans(inner):
    """A row's inner HTML as its top-level <span> elements, exactly."""
    out, i = [], 0
    while i < len(inner):
        if not inner.startswith('<span', i):
            raise ValueError('row holds something other than spans: %r' % inner[i:i + 60])
        j = element_end(inner, i, 'span')
        out.append(inner[i:j])
        i = j
    return out


def perm_for(names):
    """The permutation that sorts these case names, or None if not a case set."""
    if not names or any(n not in RANK for n in names):
        return None
    if len(set(names)) != len(names):
        raise ValueError('a case named twice: %r' % names)
    return sorted(range(len(names)), key=lambda k: RANK[names[k]])


def fix_table(tbl):
    """Reorder one `uc-dt` grid; return (new html, changed?)."""
    head_open = TABLE_OPEN.match(tbl).group(0)
    body = tbl[len(head_open):-len('</div>')]
    rows, i = [], 0
    while i < len(body):
        m = ROW_OPEN.match(body, i)
        if not m:
            raise ValueError('table holds something other than rows: %r' % body[i:i + 60])
        j = element_end(body, i, 'div')
        rows.append((m.group(0), body[m.end():j - len('</div>')]))
        i = j
    changed = False

    # column heads that are cases: permute every row's value cells together
    heads = [r for r in rows if 'uc-dth' in r[0]]
    if heads:
        hcells = split_spans(heads[0][1])
        names = [re.sub(r'<[^>]+>', '', c) for c in hcells[1:]]
        p = perm_for(names)
        if p is not None and p != sorted(p):
            new = []
            for op, inner in rows:
                cells = split_spans(inner)
                lab, vals = cells[0], cells[1:]
                if len(vals) != len(p):
                    raise ValueError('row width %d against %d case heads' % (len(vals), len(p)))
                moved = [vals[k] for k in p]
                assert sorted(moved) == sorted(vals)
                new.append((op, lab + ''.join(moved)))
            rows, changed = new, True

    # row labels that are cases: permute those rows, leaving any others in place
    labels = []
    for op, inner in rows:
        m = LABEL.match(inner)
        labels.append(m.group(1) if m else None)
    idx = [k for k, l in enumerate(labels) if l in RANK]
    if idx:
        others = [l for k, l in enumerate(labels)
                  if k not in idx and 'uc-dth' not in rows[k][0]]
        if others:
            raise ValueError('case rows mixed with other labels: %r' % labels)
        p = perm_for([labels[k] for k in idx])
        if p != sorted(p):
            moved = [rows[idx[k]] for k in p]
            new = list(rows)
            for slot, r in zip(idx, moved):
                new[slot] = r
            assert sorted(new) == sorted(rows)
            rows, changed = new, True

    return head_open + ''.join(op + inner + '</div>' for op, inner in rows) + '</div>', changed


def fix_html(s):
    out, i, n = [], 0, 0
    for m in TABLE_OPEN.finditer(s):
        if m.start() < i:
            continue
        j = element_end(s, m.start(), 'div')
        new, ch = fix_table(s[m.start():j])
        out.append(s[i:m.start()])
        out.append(new)
        n += ch
        i = j
    out.append(s[i:])
    return ''.join(out), n


def out_of_order(s):
    """True if any case grid in s is not in ORDER (the --check test)."""
    return fix_html(s)[1] > 0


def main():
    check = '--check' in sys.argv
    files = sorted(f for f in glob.glob(os.path.join(ROOT, 'decks', '*.folio-deck.json'))
                   if 'goethe' in (json.load(open(f, encoding='utf-8'))['meta'].get('types') or {}))
    bad = 0
    for f in files:
        raw = open(f, encoding='utf-8').read()
        d = json.loads(raw)
        if json.dumps(d, ensure_ascii=False, separators=(',', ':')) != raw:
            sys.exit('%s does not round-trip; refusing to rewrite it' % f)
        cards = tables = 0
        for c in d['cards']:
            hit = 0
            for k, v in list((c.get('fields') or {}).items()):
                if isinstance(v, str) and 'uc-dt ' in v:
                    nv, n = fix_html(v)
                    if n:
                        c['fields'][k] = nv
                        tables += n
                        hit = 1
            cards += hit
        name = os.path.relpath(f, ROOT)
        print('%-48s %5d cards  %5d tables %s' % (
            name, cards, tables, 'out of order' if check else 'reordered'))
        bad += cards
        if not check and cards:
            with open(f, 'w', encoding='utf-8') as fh:
                fh.write(json.dumps(d, ensure_ascii=False, separators=(',', ':')))
    if check and bad:
        sys.exit(1)


if __name__ == '__main__':
    main()
