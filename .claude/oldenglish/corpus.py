#!/usr/bin/env python3
"""The Old English text the frequencies are counted over: writes `corpus.txt`.

    python3 corpus.py      (from the cache directory, by run.py)

THREE PUBLIC-DOMAIN OR OPENLY LICENSED SOURCES, all Old English prose, and the
deck's description names them:

  · Benjamin Thorpe (ed.), The Homilies of the Anglo-Saxon Church: the Sermones
    Catholici, or Homilies of Ælfric, vol. 1 (London, 1844), Project Gutenberg
    ebook #38334 -- the Old English column only (`td.saxonice`), never Thorpe's
    facing translation.  About 99,000 words of late West Saxon, the standard
    literary Old English of c. 1000;
  · Henry Sweet, An Anglo-Saxon Primer, 8th edition (Oxford, 1905), Project
    Gutenberg ebook #34316 -- the six reading TEXTS only (Sweet's normalised early
    West Saxon), never the grammar or the glossary;
  · Tatoeba's Old English sentences (CC BY 2.0 FR), read from `tatoeba-ang.tsv` beside this
    script -- the export pinned in the repository (run.py's header says why) -- and only the
    sentences up to `TATOEBA_CUT`, the last id of the export of 2026-11-09 the ranking was
    first counted on.  A sentence added since is a card's example, never a count.

WHAT THIS MEANS FOR THE ORDER, said plainly in the plan: Ælfric is a preacher,
so God, Christ, heaven and the apostles are commoner here than in the poetry --
which is true of the surviving prose as a whole, most of which is religious.
"""
import html, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
TATOEBA_CUT = 14107058


def read(path):
    """A Project Gutenberg page as text.  gutenberg.org's own copy is UTF-8; the mirrors keep the
    file as it was submitted, in Latin-1 (run.py falls back to one when the main site is down)."""
    raw = open(path, 'rb').read()
    try:
        return raw.decode('utf-8')
    except UnicodeDecodeError:
        return raw.decode('latin-1')


def cells(path, rx):
    s = read(path)
    out = []
    for b in re.findall(rx, s, re.S):
        b = re.sub(r'<span class="(?:pagenum|linenum)">.*?</span>', ' ', b, flags=re.S)
        b = re.sub(r'<[^>]+>', ' ', b)
        b = re.sub(r'\{\d+\}|\[\d+\]', ' ', html.unescape(b))
        out.append(b)
    return out


def sweet_texts(path):
    """Sweet's six reading texts: everything between 'TEXTS.' and 'NOTES.'."""
    s = read(path)
    a = s.index('<h2>TEXTS.</h2>')
    b = s.index('<h2>NOTES.</h2>')
    body = s[a:b]
    body = re.sub(r'<span class="(?:pagenum|linenum)">.*?</span>', ' ', body, flags=re.S)
    body = re.sub(r'<h3>.*?</h3>', ' ', body, flags=re.S)
    body = re.sub(r'<[^>]+>', ' ', body)
    return [html.unescape(body)]


def tatoeba_rows():
    """(id, Old English, English or '') for every sentence of the pinned export."""
    out = []
    for line in open(os.path.join(HERE, 'tatoeba-ang.tsv'), encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) >= 3:
            out.append((int(p[0]), p[1], p[2]))
    return out


def tatoeba():
    return [oe for i, oe, _ in tatoeba_rows() if i <= TATOEBA_CUT]


def main():
    parts = {
        'thorpe': cells('pg38334.html', r'<td class="saxonice">(.*?)</td>'),
        'sweet': sweet_texts('pg34316.html'),
        'tatoeba': tatoeba(),
    }
    with open('corpus.txt', 'w', encoding='utf-8') as fh:
        for name, texts in parts.items():
            n = 0
            for t in texts:
                t = re.sub(r'\s+', ' ', t).strip()
                if t:
                    fh.write(t + '\n')
                    n += len(t.split())
            print(f'  corpus  {name:8} {n:7} words')


if __name__ == '__main__':
    main()
