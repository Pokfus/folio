#!/usr/bin/env python3
"""Put the inflection marking into a deck file that has already shipped.

    python3 .claude/mark-shipped-decks.py decks/DELE-A1-Spanish.folio-deck.json ...

WHY THIS EXISTS RATHER THAN A REBUILD.  The German decks are regenerated from
`.claude/goethe/run.py`, which now marks as it builds; the four Spanish decks
cannot be, because the corpora `.claude/dele/run.py` works from are not on this
machine and CLAUDE.md's own warning applies -- a stage driven by hand can ship a
deck no clean run reproduces, which is how one B2 word came to differ from what
the pipeline actually produces.  So the shipped files are patched where they
stand, which is the precedent set for the `.uc-exst` typography change: the same
edit, made to the built file rather than to the builder, with the builder fixed
in the same commit so the next clean run agrees.

IT IS A TEXT EDIT, NOT A RE-SERIALISATION, and that is the whole care in it.
Loading 14 MB of JSON and writing it back rewrites every line of the file
whatever the change, so the diff would say nothing about what was done.  Instead
each `"Conjugation"` value is located, decoded on its own, marked, re-encoded and
written back in place; every other byte of the file is untouched.

Idempotent twice over: `mark()` hands back a field that already carries
`uc-infl`, and the CSS is inserted only where it is absent.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from inflect_mark import mark

FIELD = '"Conjugation":'
CSS_ANCHOR = '.uc-exz b {'
CSS_ADD = ('.uc-infl {\\n  font-weight: 600;\\n  color: var(--zh, #C8453C);\\n}\\n')

dec = json.JSONDecoder()


def patch(path):
    src = open(path, encoding='utf-8').read()
    out, at, marked, seen = [], 0, 0, 0
    while True:
        i = src.find(FIELD, at)
        if i < 0:
            break
        j = i + len(FIELD)
        while src[j] in ' \t\n\r':
            j += 1
        if src[j] != '"':                      # a null or an empty field
            out.append(src[at:j])
            at = j
            continue
        value, end = dec.raw_decode(src, j)
        seen += 1
        new = mark(value)
        out.append(src[at:j])
        out.append(json.dumps(new, ensure_ascii=False))
        at = end
        if new != value:
            marked += 1
    out.append(src[at:])
    body = ''.join(out)

    # The stylesheet, inside the type records -- matched in its ESCAPED form,
    # since what is being edited is the file rather than a parsed object.  The
    # guard is the whole CSS block and not the class name: by this point the class
    # is all over the card content, so testing for it would decide the stylesheet
    # had already been done.
    css = 0
    if CSS_ADD not in body:
        css = body.count(CSS_ANCHOR)
        body = body.replace(CSS_ANCHOR, CSS_ADD + CSS_ANCHOR)

    if body == src:
        print(f'  {os.path.basename(path)}: already marked')
        return
    open(path, 'w', encoding='utf-8').write(body)
    print(f'  {os.path.basename(path)}: {marked} of {seen} paradigms marked, '
          f'{css} stylesheets')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    for p in sys.argv[1:]:
        patch(p)
