#!/usr/bin/env python3
"""Write the Khmer alphabet deck: `decks/Khmer-Alphabet.folio-deck.json`.

    python3 .claude/khmer/alphabet.py      (after run.py has built A1)

The first deck of the Khmer collection, sorted before A1 by `levelRank`'s
"Alphabet" rule.  The level decks print a romanisation under every word, so this
deck is not a gate; it is where the script itself is learnt.

WHAT IS IN IT, in the order a primer teaches it:
  · the 33 CONSONANTS of modern Khmer in their traditional order, each with its
    SERIES -- every Khmer consonant carries an inherent vowel, ɑː (the a-series)
    or ɔː (the o-series), and the series decides how every vowel sign after it is
    read -- its name (its sound with that inherent vowel), its sound as a
    consonant, and its SUBSCRIPT form, the shape it takes under another consonant
    in a cluster (ឡ has none).  The two obsolete letters ឝ and ឞ are left out;
  · the 16 DEPENDENT VOWELS, each on the dotted circle ◌ that stands for the
    consonant it is written with, each with its two readings -- after an
    a-series and after an o-series consonant;
  · the INDEPENDENT VOWELS, written alone (the obsolete ឨ left out);
  · the DIACRITICS -- the series-changing marks ៉ and ៊, the nasal ំ, the final
    h of ះ, the shortening ់, the silencer ៍ and the rest;
  · four PUNCTUATION marks (។ the full stop, ៗ the repeat sign, ៖, ៕);
  · the ten Khmer DIGITS.

WHERE IT COMES FROM.  Every sound, series, subscript, name and description is
read from the tables of the English Wikipedia's article "Khmer script", a pinned
revision (`REVID`, CC BY-SA 4.0), whose IPA follows Huffman (1970), the standard
description of Standard Khmer; nothing about a sound is typed here.  A letter's
position ("the 12th letter") is its place in that table, which is also how
English Wiktionary numbers the letters.  The EXAMPLE WORDS are the A1 deck's own:
for a consonant, the first A1 word that begins with it (the deck is dealt by
frequency); for a vowel, the first A1 word whose first consonant carries it, one
for each series where A1 has one.  Their romanisations and meanings are the A1
cards', so the two decks agree; a letter A1 has no word for takes the commonest
word of `lex.json` that begins with it, romanised from its Wiktionary page
(`romanise.fetch`).  The digits' names are the A1 number words.

THE SOUND SIDE IS UNIQUE (asserted): the reverse card shows a sound and asks
for the letter, and ឋ and ថ are both [tʰɑː] -- the position names which.
"""
import html, json, os, re, sys, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from km import key

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-15T00:00:00.000Z'
TYPE_ID = 'km-abc'
COLOR = '#76281C'
CACHE = os.path.abspath(os.path.join(HERE, '..', 'khmer-cache'))
DECKS = os.path.abspath(os.path.join(HERE, '..', '..', 'decks'))
REVID = 1370721954          # "Khmer script", 2026-08-22T19:00:03Z
WIKI = 'khmer-script-%d.wiki' % REVID
DC = '◌'               # the dotted circle a vowel sign is shown on

ORD = ['1st', '2nd', '3rd'] + [f'{i}th' for i in range(4, 21)] + ['21st', '22nd', '23rd'] + \
      [f'{i}th' for i in range(24, 31)] + ['31st', '32nd', '33rd']
RARE = {'ឋ', 'ឌ', 'ឍ'}      # the article: "rare, and occur only ... in a few Pali and Sanskrit loanwords"
DIACRITICS = ['ំ', 'ះ', 'ៈ', '៉', '៊', '់', '៍', '៌', '័', '៏', '៎']
PUNCT = ['។', 'ៗ', '៖', '៕']
DIGIT_WORDS = ['សូន្យ', 'មួយ', 'ពីរ', 'បី', 'បួន', 'ប្រាំ', 'ប្រាំមួយ', 'ប្រាំពីរ', 'ប្រាំបី', 'ប្រាំបួន']

FIELDS = ['Letter', 'Sound', 'Example', 'Word']
LETTER = '<div class="uc-letter">{{Letter}}</div>'
DETAIL = ('<div class="uc-field"><div class="uc-pos">sound</div><div class="uc-gl">{{Sound}}</div>'
          '{{#Example}}<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}</div>'
          '{{/Example}}</div>')
ASK = ('<div class="uc-ask">Which letter is this?</div>'
       '<div class="uc-field"><div class="uc-gl">{{Sound}}</div></div>')
FRONT_L = LETTER
BACK_L = '{{FrontSide}}<hr>' + DETAIL
FRONT_S = ASK
BACK_S = '{{FrontSide}}<hr>' + LETTER + DETAIL

CSS = open(os.path.join(HERE, '..', 'hindi', 'alphabet.py'),
           encoding='utf-8').read().split('CSS = """', 1)[1].split('"""', 1)[0]
# Khmer stacks a subscript and a vowel below a letter: give the big letter room.
CSS = CSS.replace('  font-size: 60px;\n  font-weight: 400;\n  line-height: 1.3;',
                  '  font-size: 60px;\n  font-weight: 400;\n  line-height: 1.8;')
assert 'line-height: 1.8' in CSS
CSS += """.uc-ser {
  margin-left: 6px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.6;
}
"""


def wikitext():
    p = os.path.join(CACHE, WIKI)
    if not os.path.exists(p):
        u = 'https://en.wikipedia.org/w/index.php?oldid=%d&action=raw' % REVID
        req = urllib.request.Request(u, headers={'User-Agent': 'folio-deck-builder/1.0'})
        data = urllib.request.urlopen(req, timeout=60).read()
        open(p, 'wb').write(data)
    return open(p, encoding='utf-8').read()


def clean(c):
    c = re.sub(r'<ref[^>]*/>', '', c)
    c = re.sub(r'<ref.*?</ref>', '', c, flags=re.S)
    c = re.sub(r'\{\{(?:lang|transliteration)\|km\|([^{}]*)\}\}', r'\1', c)
    c = re.sub(r'\{\{IPA\|([^{}]*)\}\}', r'\1', c)
    c = re.sub(r'</?big>|</?small>|<br\s*/?>', ' ', c).replace("''", '')
    c = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', r'\1', c)
    return re.sub(r'\s+', ' ', c).strip()


def table(t, heading):
    i = t.index(heading)
    a = t.index('{|', i)
    b = t.index('\n|}', a)
    rows = []
    for r in t[a:b].split('\n|-')[1:]:
        cells = []
        for line in r.strip().split('\n'):
            if line.startswith('!'):
                cells = None
                break
            if line.startswith('|'):
                c = line[1:]
                attrs = ''
                m = re.match(r'\s*((?:colspan|rowspan|style|bgcolor|align)[^|]*)\|(.*)$', c)
                if m:
                    attrs, c = m.group(1), m.group(2)
                n = int(re.search(r'colspan="?(\d+)', attrs).group(1)) if 'colspan' in attrs else 1
                cells += [clean(c)] * n
            elif cells:
                cells[-1] += ' ' + clean(line)
        if cells:
            rows.append(cells)
    return rows


def no_see(s):
    """A description without its cross-references ("See Modification by diacritics.")."""
    s = re.sub(r'\s*\(?See (?:also )?[^.]*\.\)?', '', s)
    return s.strip()


def main():
    t = wikitext()
    a1 = json.load(open(os.path.join(DECKS, 'Khmer-A1.folio-deck.json'), encoding='utf-8'))['cards']
    A1 = []
    for c in a1:
        F = c['fields']
        g = re.sub(r'<[^>]+>', '\n', F['English'])
        first = next((x.strip() for x in g.split('\n') if x.strip() and
                      not re.match(r'^(noun|verb|adjective|adverb|pronoun|preposition|conjunction|'
                                   r'particle|interjection|number|phrase|determiner|classifier|proper noun)\b',
                                   x.strip())), '')
        A1.append((F['Word'], html.unescape(F['Roman']), first.split(';')[0].split(',')[0].strip()))

    lex = json.load(open(os.path.join(CACHE, 'lex.json'), encoding='utf-8'))
    need = {}

    def fallback(pred):
        best = None
        for k, L in lex.items():
            if 'entries' not in L or L['freq'] <= 0 or not pred(L['word']):
                continue
            gl = [g['g'] for e in L['entries'] if e['pos'] != 'name' for g in e['glosses'] if not g['weak']]
            if not gl:
                continue
            cand = (-L['freq'], L['word'], gl[0])
            if best is None or cand < best:
                best = cand
        if best:
            need[best[1]] = best[2].split(';')[0].split(',')[0].strip()
            return best[1]
        return None

    def example(pred, plain=lambda w: True):
        # a single word whose letter stands plain first (ឆ្នាំ is the letter in a
        # cluster, មិនអីទេ a phrase), then any A1 word, then the commonest in lex
        for strict in (True, False):
            for w, r, m in A1:
                if pred(w) and (not strict or (' ' not in r and plain(w))):
                    return ('a1', w, r, m)
        w = fallback(pred)
        return ('lex', w, None, None) if w else None

    cons = [r for r in table(t, '== Consonants ==') if r[0] not in ('ឝ', 'ឞ')]
    assert len(cons) == 33, len(cons)
    series = {}
    rows, pending = [], []
    for i, r in enumerate(cons):
        ch, sub, name, val = r[0], r[1], r[5], r[9]
        ser = 'a-series' if name.endswith('ɑː]') else 'o-series' if name.endswith('ɔː]') else None
        assert ser, (ch, name)
        series[ch] = ser
        bits = [f'consonant {val}', f'subscript {sub}' if sub != 'none' else 'no subscript form',
                f'the {ORD[i]} letter']
        if ch in RARE:
            bits.append('rare: a few Pali and Sanskrit loanwords')
        sound = (f'<span class="uc-rm">{E(name)}</span><span class="uc-ser">{ser}</span><br>'
                 + E(' · '.join(bits)))
        pending.append((ch, sound, [example(lambda w, ch=ch: w.startswith(ch),
                                            lambda w: len(w) > 1 and w[1] != '\u17d2')]))

    for r in table(t, '== Dependent vowels =='):
        v = r[0]
        if v == '(none)':
            continue
        sound = f'after an a-series consonant <span class="uc-rm">{E(r[2])}</span> · ' \
                f'after an o-series consonant <span class="uc-rm">{E(r[3])}</span>'
        exs = []
        for ser in ('a-series', 'o-series'):
            x = example(lambda w, v=v, ser=ser: len(w) > len(v) and w[1:1 + len(v)] == v
                        and series.get(w[0]) == ser and (len(w) == 1 + len(v) or
                                                         not '\u17b6' <= w[1 + len(v)] <= '\u17d3'))
            if x and x not in exs:
                exs.append(x)
        pending.append((DC + v, sound, exs))

    for r in table(t, '==Independent vowels=='):
        if r[1].startswith('Obsolete'):
            continue
        letters = [x.strip() for x in r[0].split(',')]
        pending.append((' '.join(letters), f'<span class="uc-rm">{E(r[1])}</span> · an independent '
                        'vowel, written alone' + (' (two spellings of one letter)' if len(letters) > 1 else ''),
                        [example(lambda w, L=letters: any(w.startswith(x) for x in L))]))

    dia = {r[0]: r for r in table(t, '==Diacritics==')}
    for d in DIACRITICS:
        r = dia[d]
        name = r[1]
        km_name = ' '.join(x for x in name.split() if re.match(r'^[ក-៿]+$', x))
        lat = ' '.join(x for x in name.split() if not re.match(r'^[ក-៿]+$', x))
        desc = no_see(r[2])
        pending.append((DC + d, f'<span class="uc-rm">{E(km_name)}</span> {E(lat)} · {E(desc)}', []))

    for r in table(t, '== Spacing and punctuation =='):
        if r[0] in PUNCT:
            km_name = ' '.join(x for x in r[1].split() if re.match(r'^[ក-៿]+$', x))
            lat = ' '.join(x for x in r[1].split() if not re.match(r'^[ក-៿]+$', x))
            pending.append((r[0], f'<span class="uc-rm">{E(km_name)}</span> {E(lat)} · {E(no_see(r[2]))}', []))
    assert sum(1 for p in pending if p[0] in PUNCT) == len(PUNCT)

    digits = []
    for i, w in enumerate(DIGIT_WORDS):
        x = next(((w, r, m) for w_, r, m in A1 if w_ == w), None)
        assert x, w
        digits.append(('០១២៣៤៥៦៧៨៩'[i], i, x))

    # the fallback words' romanisations, from their Wiktionary pages
    tr = {}
    if need:
        cwd = os.getcwd()
        os.chdir(CACHE)
        import romanise
        tr = romanise.fetch(set(need))
        os.chdir(cwd)

    def ex_html(x):
        src, w, r, m = x
        if src == 'lex':
            r, m = tr.get(w, ''), need[w]
        return (f'<span class="uc-ex">{E(w)}</span>' + (f'<span class="uc-exr">{E(r)}</span>' if r else '')
                + f'<span class="uc-exe">{E(m)}</span>')

    for shown, sound, exs in pending:
        rows.append((shown, sound, '<br>'.join(ex_html(x) for x in exs if x)))
    for ch, i, (w, r, m) in digits:
        rows.append((ch, f'<span class="uc-rm">{i}</span> · the digit {i}',
                     f'<span class="uc-ex">{E(w)}</span><span class="uc-exr">{E(r)}</span>'
                     f'<span class="uc-exe">{i}</span>'))

    cards = []
    for i, (shown, sound, ex) in enumerate(rows, 1):
        word = shown.replace(DC, '')
        cards.append({'sub': '', 'fields': {'Letter': E(shown), 'Sound': sound, 'Example': ex,
                                            'Word': E(word)},
                      'id': f'u_kmabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two notes share a sound side: the reverse card is unanswerable'
    nv = sum(1 for p in pending if p[0].startswith(DC) and p[0][1:] not in DIACRITICS)
    ni = sum(1 for p in pending if 'independent' in p[1])
    desc = (
        f"The Khmer script, the writing of Cambodia: {n} notes, in the order a primer teaches it — "
        f"the 33 consonants of modern Khmer in their traditional order, the {nv} dependent vowels, "
        f"{ni} independent vowels, {len(DIACRITICS)} diacritics, {len(PUNCT)} punctuation marks and "
        "the ten Khmer digits. The first deck of the Khmer collection. Both directions: see a letter "
        "and recall its sound, or see a sound and recall the letter, each a card with its own "
        "schedule. Every Khmer consonant carries an inherent vowel, and the consonants fall into two "
        "SERIES by it: the a-series, named with ɑː (ក [kɑː]), and the o-series, named with ɔː (គ "
        "[kɔː]). The series decides how every vowel sign after the consonant is read — ា is [aː] "
        "after an a-series consonant and [iːə] after an o-series one — so each consonant shows its "
        "series, and each vowel, written on ◌ for the consonant it sits on, shows both readings. "
        "Each consonant also shows its SUBSCRIPT form, the shape it takes under another consonant "
        "in a cluster, and its place in the alphabet, which tells apart the letters that sound alike "
        "(ឋ and ថ are both [tʰɑː]). The diacritics include the two marks that move a consonant from "
        "one series to the other. Sounds are written in the International Phonetic Alphabet, as "
        "Huffman's description of Standard Khmer gives them; one everyday word from the Khmer A1 "
        "deck shows each letter, with its romanisation and meaning. There is no speaker button, "
        "since few devices have a Khmer voice. Sources: the tables of the English Wikipedia's "
        f"article \"Khmer script\" (revision {REVID}, CC BY-SA 4.0), after Huffman (1970); the "
        "example words' romanisations and meanings are English Wiktionary's (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'kmabc', 'title': 'Khmer Alphabet',
        'subtitle': f'{n} letters, vowels, signs and digits · both directions, as two cards each',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['khmer', 'cambodian', 'alphabet', 'script'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Khmer letter', 'speechLang': 'km-KH',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.join(DECKS, 'Khmer-Alphabet.folio-deck.json')
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
