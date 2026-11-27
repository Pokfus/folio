#!/usr/bin/env python3
"""The Latin sounds table's two ties to its sources.

    python3 .claude/latin/sounds.py --fill      # write each example word's two transcriptions from Wiktionary
    python3 .claude/latin/sounds.py --verify    # every cell and quotation is in its pinned Wikipedia revision

`.claude/decks/latin-sounds.json` is the table `build-latin-sounds.js` turns into
`decks/Latin-Sounds-and-Spelling.folio-deck.json`.  Nothing in it is composed but the short labels, and
this script is how that is kept true (the beginner pass of Nov 2026; docs/lang-decks.md, "The Latin
beginner pass").  The Turkish model (`.claude/turkish/sounds.py`).

--fill   reads `.claude/latin-cache/kaikki-la.jsonl` (the generator's own cache) and sets the two
         transcriptions beside every example word: the one the word's Latin entry tags Classical Latin,
         and the one it notes as modern Italianate Ecclesiastical.  The entry is the one whose HEADWORD,
         macrons and all, is the word as Latin A1 prints it (`mālum` the apple, never `malum`).  A word
         with none gets "".  No transcription is typed.
--verify fetches the four revisions the table names (curl, into the cache: Wikipedia answers Python's
         default client with 429, so the page is read as index.php?oldid=<rev>&action=raw) and checks:
           · every sound row that names a column (`col`) against THE KEY'S OWN ROWS: Help:IPA/Latin's
             tables are parsed, and a row passes only if one row of the key has that IPA cell, its letter
             in that column (Class., Eccl., or both) and that English approximation (the approximation
             may stand in the row above or below, where the key spans one cell over two rows);
           · every other cell and every quotation as a run of consecutive words of its page, the wiki
             markup stripped.  A cut is marked […] and each side of it is checked.  The notes under the
             key's tables are <ref> text, which is kept.

Both need the network or the cache, so neither is a CI step; `build-latin-sounds.js --check` is.
"""
import argparse, json, os, re, subprocess, sys, time, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '..', 'latin-cache')
TABLE = os.path.join(HERE, '..', 'decks', 'latin-sounds.json')
sys.path.insert(0, HERE)


def all_words(T):
    for g in ('rules', 'sounds', 'endings'):
        for r in T[g]:
            for p in r.get('words', []):
                yield p


def fill(T):
    os.environ.setdefault('LATIN_LEVEL', 'a1')
    import inserts
    from la import macronless
    want = {}
    for p in all_words(T):
        want.setdefault(macronless(p[0]), set()).add(p[0])
    probes = {t: '"word": ' + json.dumps(t, ensure_ascii=False) for t in want}
    got = {}
    with open(os.path.join(CACHE, 'kaikki-la.jsonl'), encoding='utf-8') as fh:
        for line in fh:
            if '"ipa"' not in line or not any(s in line for s in probes.values()):
                continue
            e = json.loads(line)
            if e.get('word') not in want:
                continue
            head = inserts.canon(e)
            if head not in want[e['word']] or head in got:
                continue
            cl = [s['ipa'] for s in e.get('sounds', []) if s.get('ipa') and 'Classical-Latin' in (s.get('tags') or [])]
            ec = [s['ipa'] for s in e.get('sounds', []) if s.get('ipa') and 'Ecclesiastical' in (s.get('note') or '')]
            if cl or ec:
                got[head] = [cl[0] if cl else '', ec[0] if ec else '']
    for p in all_words(T):
        p[1], p[2] = got.get(p[0], ['', ''])
    none = sorted({p[0] for p in all_words(T) if not p[1] or not p[2]})
    print('filled %d words; no Classical or no Church transcription in Wiktionary for: %s' % (len(got), ', '.join(none) or '-'))


def wikitext(rev):
    p = os.path.join(CACHE, 'wp-%d.wiki' % rev)
    if not os.path.exists(p):
        time.sleep(3)
        r = subprocess.run(['curl', '-sSf', '-A', 'deck-tooling/1.0',
                            'https://en.wikipedia.org/w/index.php?oldid=%d&action=raw' % rev],
                           check=True, capture_output=True)
        open(p, 'wb').write(r.stdout)
    return open(p, encoding='utf-8').read()


def flat(w):
    """Wiki markup to the words a reader sees, near enough to find a quotation in."""
    w = re.sub(r'<ref[^>]*/>', '', w)
    w = re.sub(r'</?ref[^>]*>', ' ', w)                  # a note's text stays: the key's notes are refs
    w = re.sub(r'<br\s*/?>', ' ', w)
    for _ in range(6):                                   # innermost templates first
        w = re.sub(r'\{\{(?:IPAslink|IPA link|IPAlink)\|([^{}|]*)(?:\|[^{}]*)?\}\}', r'\1', w)
        w = re.sub(r'\{\{IPAblink\|([^{}|]*)(?:\|[^{}]*)?\}\}', r'[\1]', w)
        w = re.sub(r'\{\{angbr(?: IPA)?\|([^{}|]*)\}\}', r'⟨\1⟩', w)
        w = re.sub(r'\{\{(?:lang|transliteration|wikt-lang)\|(?:[^{}|]*\|)+([^{}|=]*)(?:\|[a-z]+=[^{}|]*)*\}\}', r'\1', w)
        w = re.sub(r'\{\{abbr\|([^{}|]*)\|[^{}]*\}\}', r'\1', w)
        w = re.sub(r'\{\{IPA\|([^{}|]*)\}\}', r'\1', w)
        w = re.sub(r'\{\{(?:sfnp?|Harvnb|Harv|Harvcoltxt|Clarify|cite|Cite|citation|efn|main|see also)[^{}]*\}\}', '', w)
    w = re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', r'\1', w)
    w = re.sub(r"'{2,}", '', w)
    w = re.sub(r'<[^>]+>', '', w)
    w = re.sub(r'^[*#]+\s*', '', w, flags=re.M)
    w = w.replace('&nbsp;', ' ')
    return re.sub(r'\s+', ' ', w)


def norm(s):
    s = re.sub(r'<[^>]+>', '', s)
    return unicodedata.normalize('NFC', re.sub(r'\s+', ' ', s).strip())


def key_rows(w):
    """The rows of the key's tables: [{ipa, col, text}], a spanned IPA cell carried down."""
    rows, ipa = [], ''
    # a cell's own words, without the note hung on it (`Scottish<ref>…</ref> made`)
    w = re.sub(r'<ref[^>]*/>', '', w)
    w = re.sub(r'<ref[^>]*>.*?</ref>', '', w, flags=re.S)
    for chunk in re.split(r'\n\|-', w):
        cells = [c for c in re.split(r'\n[|!]', '\n' + chunk.strip()) if c.strip()]
        m = re.search(r'<big>\s*\{\{IPA(?:link)?\|([^{}|]*)\}\}\s*</big>', cells[0]) if cells else None
        if m:
            ipa, cells = m.group(1), cells[1:]
        letters = [i for i, c in enumerate(cells) if '<big>' in c]
        gray = [i for i, c in enumerate(cells) if 'darkgray' in c and '<big>' not in c]
        if not letters:
            col = 'both'                                  # its letter cell is spanned from the row above
        elif re.search(r'colspan="?2', cells[letters[0]]) or len(letters) > 1:
            col = 'both'
        elif gray and gray[0] < letters[0]:
            col = 'eccl'
        else:
            col = 'class'
        rows.append({'ipa': unicodedata.normalize('NFC', ipa), 'col': col,
                     'text': unicodedata.normalize('NFC', flat('\n|'.join(cells)))})
    return rows


def verify(T):
    raw = {k: wikitext(v['revid']) for k, v in T['sources'].items() if 'revid' in v}
    pages = {k: unicodedata.normalize('NFC', flat(v)) for k, v in raw.items()}
    key = key_rows(raw['key'])
    bad = n = 0

    def want(what, text, src):
        nonlocal bad, n
        for part in norm(text).split('[…]'):
            part = part.strip()
            if not part:
                continue
            n += 1
            if part not in pages[src]:
                bad += 1
                print('FAIL  %s: not in %s (revision %d): %s' % (what, T['sources'][src]['title'], T['sources'][src]['revid'], part[:120]))

    for g in ('rules', 'sounds', 'endings'):
        for r in T[g]:
            for row in r.get('rows', []):
                ipa, like = unicodedata.normalize('NFC', row['ipa']), norm(row['like'])
                if row.get('src'):
                    want(r['key'] + ' ipa', ipa, row['src'])
                    want(r['key'] + ' like', like, row['src'])
                    continue
                n += 1
                ok = any(k['ipa'] == ipa and k['col'] == row['col'] and
                         any(like in key[j]['text'] for j in (i - 1, i, i + 1) if 0 <= j < len(key))
                         for i, k in enumerate(key))
                if not ok:
                    bad += 1
                    print('FAIL  %s: the key has no row with IPA %s in column %s and the approximation "%s"' % (r['key'], ipa, row['col'], like))
            if len(r.get('says', [])) != len(r.get('src', [])):
                raise SystemExit(r['key'] + ': says and src differ in length')
            for q, src in zip(r.get('says', []), r.get('src', [])):
                want(r['key'] + ' says', q, src)
    if bad:
        raise SystemExit('%d of %d cells and quotations are not in their page' % (bad, n))
    print('sounds --verify: %d cells and quotations, each in its pinned revision (%s)' % (
        n, ', '.join('%s %d' % (v['title'], v['revid']) for v in T['sources'].values() if 'revid' in v)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--fill', action='store_true')
    ap.add_argument('--verify', action='store_true')
    a = ap.parse_args()
    T = json.load(open(TABLE, encoding='utf-8'))
    if a.fill:
        fill(T)
        with open(TABLE, 'w', encoding='utf-8') as fh:
            json.dump(T, fh, ensure_ascii=False, indent=1)
            fh.write('\n')
    if a.verify or not a.fill:
        verify(T)


if __name__ == '__main__':
    main()
