#!/usr/bin/env python3
"""The sounds table's two helpers: fill what is quoted from a source, and verify all of it.

    python3 .claude/swahili/sounds.py --fill      # writes the key's cells and A1's transcriptions into
                                                  # .claude/decks/swahili-sounds.json (needs the cache)
    python3 .claude/swahili/sounds.py --verify    # fetches the four pinned Wikipedia revisions and checks
                                                  # every cell and quotation (needs the network; not in CI)

The beginner pass of Nov 2026 (docs/lang-decks.md, "The Swahili beginner pass").  NOTHING IN THE TABLE IS
COMPOSED, and this script is how that is kept true:

  · A SOUND ROW names one symbol (`sym`) of the key of Wikipedia's Help:IPA/Swahili.  `--fill` reads that
    row of the key at the pinned revision and writes its three cells -- the symbol, the example word with
    its transcription and meaning, the English approximation with the letters the key prints in bold --
    and the footnote the row carries ("Only found in loanwords.").  No cell is typed.
  · A `says` is a list of quotations, each a run of consecutive words of the page named beside it in
    `src`, with a cut marked […].  They are typed, so `--verify` looks each one up in the page's text.
  · `ipa` is the English Wiktionary's own transcription of every Swahili A1 headword that has one (the
    first its entry gives), read from the kaikki.org extraction by `--fill`.

The pages are fetched with curl, as index.php?action=raw&oldid=<revision> (the API rate-limits shared
addresses), and kept in the cache under wiki/.
"""
import argparse, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'swahili-cache'))
TABLE = os.path.join(HERE, '..', 'decks', 'swahili-sounds.json')
DECKS = os.path.join(HERE, '..', '..', 'decks')


def page(name, src, fresh=False):
    """The wikitext of a source at its pinned revision."""
    os.makedirs(os.path.join(CACHE, 'wiki'), exist_ok=True)
    p = os.path.join(CACHE, 'wiki', '%s-%d.txt' % (name, src['revid']))
    if fresh or not os.path.exists(p) or not os.path.getsize(p):
        url = 'https://en.wikipedia.org/w/index.php?title=%s&action=raw&oldid=%d' % (
            src['title'].replace(' ', '_'), src['revid'])
        subprocess.run(['curl', '-sS', '--fail', '-A', 'deck-sources-check/1.0', '-o', p, url], check=True)
    return open(p, encoding='utf-8').read()


APOS = '\u0002'      # stands for an apostrophe that is a letter (ng'), while the quote marks are read


def bold(s):
    """Wikitext quotes to <b>: a run of five toggles bold and italic, three bold, two italic."""
    out, on = [], False
    for piece in re.split(r"('{2,})", s):
        if re.fullmatch(r"'{2,}", piece):
            n = len(piece)
            if n in (3, 5) or n > 5:
                out.append('</b>' if on else '<b>')
                on = not on
            continue
        out.append(piece)
    return ''.join(out)


def untemplate(t):
    """Innermost templates replaced by what they print: the last unnamed argument."""
    prev = None
    while prev != t:
        prev = t

        def rep(m):
            parts = m.group(1).split('|')
            name = parts[0].strip().lower()
            args = [a for a in parts[1:] if not re.match(r'\s*[a-z0-9]+\s*=', a)]
            if name in ('ipa blink', 'ipablink'):
                return '[' + (args[-1] if args else '') + ']'
            if name == "'":
                return APOS
            if name in ('citation needed', 'which', 'more citations needed section', 'expand section',
                        'see also', 'main', 'for'):
                return ''
            if not args and name in ('notelist', 'reflist') and len(parts) > 1:
                return parts[-1].split('=', 1)[-1]          # the notes a page defines in its list
            return args[-1] if args else ''
        t = re.sub(r'\{\{([^{}]*)\}\}', rep, t)
    return t


def plain(wikitext):
    """A page as running text, for looking a quotation up in."""
    t = re.sub(r"'<nowiki\s*/>", APOS, wikitext)        # a written apostrophe, not markup
    t = re.sub(r'<nowiki\s*/>', '', t)
    t = re.sub(r'<ref[^>]*?/>', '', t)
    t = re.sub(r'<ref[^>]*>.*?</ref>', '', t, flags=re.S)
    t = re.sub(r'\[\[(?:[^\[\]|]*\|)?([^\[\]]*)\]\]', r'\1', t)
    t = untemplate(t)
    t = re.sub(r"'{2,}", '', t).replace(APOS, "'")
    t = re.sub(r'</?(?:u|s|big|small|sup|sub|nowiki)>', '', t)
    t = t.replace('&nbsp;', ' ')
    return re.sub(r'\s+', ' ', t)


def key_rows(wikitext):
    """Help:IPA/Swahili's key: symbol -> its row's cells."""
    refs = {}
    for m in re.finditer(r'<ref name="?([^">/]+)"?\s*>(.*?)</ref>', wikitext, flags=re.S):
        refs[m.group(1)] = plain(m.group(2)).strip()
    rows = {}
    for chunk in wikitext.split('\n|-'):
        chunk = chunk.split('\n|}')[0]                  # a table's last row: nothing after its end
        cells = [c[1:].strip() for c in chunk.split('\n') if c.startswith('|')]
        if len(cells) != 3:
            continue
        sym = ' ~ '.join(re.findall(r'\{\{IPA ?link\|([^}]+)\}\}', cells[0]))
        if not sym:
            continue
        note = ''
        m = re.search(r'<ref name="?([^">/]+)"?\s*/?>', cells[1]) or re.search(r'<ref name="?([^">/]+)"?\s*/?>', cells[2])
        if m:
            note = refs.get(m.group(1), '')
        m = re.search(r'<ref>(.*?)</ref>', cells[2], flags=re.S)
        if m:
            note = plain(m.group(1)).strip()
        ex = re.sub(r'<ref[^>]*?/>|<ref[^>]*>.*?</ref>', '', cells[1], flags=re.S)
        ex = re.sub(r"'<nowiki\s*/>", APOS, ex)
        m = re.match(r"\s*(.*?)\s*\{\{IPA\|(\[[^\]]*\])\}\}\s*'([^']*)'", ex)
        if not m:
            raise SystemExit('the key\'s row for %s is not word, transcription, meaning: %s' % (sym, cells[1]))
        word_b = bold(m.group(1))
        like = re.sub(r'<ref[^>]*?/>|<ref[^>]*>.*?</ref>', '', cells[2], flags=re.S)
        like = re.sub(r'\[\[(?:[^\[\]|]*\|)?([^\[\]]*)\]\]', r'\1', like)
        word_b = word_b.replace(APOS, "'")
        rows[sym] = {'word': re.sub(r'</?b>', '', word_b), 'wordB': word_b,
                     'ipa': re.sub(r"'{2,}", '', m.group(2)), 'gloss': m.group(3),
                     'like': bold(like).strip(), 'note': note}
    return rows


def a1_ipa():
    """Wiktionary's transcription of each Swahili A1 headword that has one: the first of its entry."""
    a1 = json.load(open(os.path.join(DECKS, 'Swahili-A1.folio-deck.json'), encoding='utf-8'))
    heads = {}
    for c in a1['cards']:
        shown = re.sub(r'<[^>]+>', '', c['fields']['Swahili'])
        heads[c['fields']['Word']] = shown
    first = {}
    for line in open(os.path.join(CACHE, 'kaikki-sw.jsonl'), encoding='utf-8'):
        e = json.loads(line)
        ipa = [s['ipa'] for s in e.get('sounds') or [] if s.get('ipa')]
        if not ipa:
            continue
        first.setdefault(e.get('word', ''), ipa[0])
    out = {}
    for word, shown in heads.items():
        # a verb's entry is its stem and its transcription the stem's: only a headword printed as its entry
        if word in first and shown in (word, '-' + word):
            out[word] = first[word]
    return dict(sorted(out.items()))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--fill', action='store_true')
    ap.add_argument('--verify', action='store_true')
    a = ap.parse_args()
    T = json.load(open(TABLE, encoding='utf-8'))
    S = T['sources']
    if a.fill:
        rows = key_rows(page('ipa', S['ipa']))
        for r in T['sounds']:
            if r['sym'] not in rows:
                raise SystemExit('%s: the key has no row for %s' % (r['key'], r['sym']))
            r['cells'] = rows[r['sym']]
        T['ipa'] = a1_ipa()
        with open(TABLE, 'w', encoding='utf-8') as fh:
            json.dump(T, fh, ensure_ascii=False, indent=1)
            fh.write('\n')
        print('swahili-sounds.json: %d key rows filled; %d A1 transcriptions' % (len(T['sounds']), len(T['ipa'])))
        return
    if a.verify:
        bad = n = 0
        rows = key_rows(page('ipa', S['ipa'], fresh=True))
        for r in T['sounds']:
            n += 1
            if rows.get(r['sym']) != r.get('cells'):
                bad += 1
                print('FAIL  %s: its cells are not the key\'s row for %s' % (r['key'], r['sym']))
        text = {k: plain(page(k, S[k], fresh=k != 'ipa')) for k in S if 'revid' in S[k]}
        for r in T['sounds'] + T['rules']:
            for q, src in zip(r.get('says', []), r.get('src', [])):
                for part in q.split(' […] '):
                    n += 1
                    if re.sub(r'\s+', ' ', part) not in text[src]:
                        bad += 1
                        print('FAIL  %s: not in %s at revision %d: %s' % (r['key'], S[src]['title'], S[src]['revid'], part))
            if len(r.get('says', [])) != len(r.get('src', [])):
                bad += 1
                print('FAIL  %s: says and src are not the same length' % r['key'])
        if bad:
            raise SystemExit('%d of %d cells and quotations are not in their source' % (bad, n))
        print('sounds --verify: all %d cells and quotations are in their pinned revisions' % n)
        return
    ap.print_help()


if __name__ == '__main__':
    main()
