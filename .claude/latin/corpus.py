#!/usr/bin/env python3
"""A lemma count over classical Latin, for the levels the DCC list cannot fill.

    python3 corpus.py      (from the cache directory, by run.py, for B1 and above)

WHY.  The DCC Latin Core Vocabulary is a thousand lemmas; A1 and A2 between them
take it to rank 891, so B1 (1,000 notes) and above need another order for the
words beyond it.  Tatoeba is learners' Latin, not classical prose, so the order
is a count over CLASSICAL texts: the fixed list below from The Latin Library
(thelatinlibrary.com), whose texts are the public-domain editions of the
authors themselves.  Only the counts are used; no text enters a deck.

THE LIST IS PINNED (`TEXTS`), so a re-run counts the same words: the canon of a
reading course, prose and verse, Republic and early Empire -- Caesar, Cicero,
Sallust, Livy, Nepos, Seneca, Pliny, Tacitus, Quintilian; Plautus, Catullus,
Lucretius, Virgil, Horace, Propertius, Ovid, Juvenal.  Pages are cached under
`classical/` and fetched once.  A page that does not answer stops the run: a
silently shorter corpus would change the order.

THE COUNT is `extract.lemma_counts` -- the Tatoeba count's own rule: a lemma
earns the forms its Wiktionary table alone holds, and a shared form is split in
proportion -- with three guards, each read off the first count:
  · ONLY LOWER-CASE TOKENS COUNT.  A capital is a name (`Aenēās` made `aeneus`
    common, `Scīpiō` the staff `scīpiō`, `Augustus` the adjective); a sentence's
    first word is lost too, evenly across words, so the order holds;
  · A FORM A DCC LEMMA CLAIMS IS THE DCC LEMMA'S (`first`): every form of `bellum`
    is also a form of `bellus` "pretty", which therefore took the war's count;
  · A LEMMA SPELT AS A FORM OF A DCC LEMMA IS NOT OFFERED (`shadow`): `quod` is
    `quī`, `factus` is `faciō`'s participle, `maximus` is `magnus`'s superlative --
    the card of the DCC word already shows them.
The words the corpus reaches that `lex.json` lacks (it keeps only
lemmas with a DCC rank or a Tatoeba count) are written here too, so `select.py`
can offer them.

Writes `classical.json`: {texts, tokens, counts: {fold: count}, lex: {fold: lemma}}.
"""
import collections, html, json, os, re, sys, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from la import fold, tokens
import extract

BASE = 'https://www.thelatinlibrary.com/'
DIR, OUT = 'classical', 'classical.json'


def _r(fmt, a, b):
    return [fmt.format(i) for i in range(a, b + 1)]


TEXTS = (
    _r('caesar/gall{}.shtml', 1, 8) + _r('caesar/bc{}.shtml', 1, 3)
    + _r('cicero/cat{}.shtml', 1, 4) + _r('cicero/off{}.shtml', 1, 3)
    + ['cicero/amic.shtml', 'cicero/senectute.shtml', 'cicero/arch.shtml', 'cicero/milo.shtml',
       'cicero/fin1.shtml', 'cicero/tusc1.shtml']
    + ['sall.1.html', 'sall.2.html']
    + _r('livy/liv.{}.shtml', 1, 10)
    + ['nepos/nepos.' + n + '.shtml' for n in
       ('pr mil them aris paus cim lys alc thras con dion iph cha timo dat epam pel age eum '
        'phoc tim kings ham han cat att').split()]
    + _r('sen/seneca.ep{}.shtml', 1, 10)
    + _r('pliny.ep{}.html', 1, 10)
    + _r('tacitus/tac.ann{}.shtml', 1, 6) + ['tacitus/tac.hist1.shtml', 'tacitus/tac.agri.shtml',
                                             'tacitus/tac.ger.shtml']
    + ['quintilian/quintilian.institutio1.shtml']
    + ['plautus/amphitruo.shtml', 'catullus.shtml']
    + _r('lucretius/lucretius{}.shtml', 1, 6)
    + _r('vergil/aen{}.shtml', 1, 12) + _r('vergil/ec{}.shtml', 1, 10) + _r('vergil/geo{}.shtml', 1, 4)
    + _r('horace/carm{}.shtml', 1, 4) + ['horace/serm1.shtml', 'horace/epist1.shtml']
    + ['propertius1.html']
    + _r('ovid/ovid.met{}.shtml', 1, 15)
    + ['juvenal/1.shtml']
)


def page(path):
    local = os.path.join(DIR, path.replace('/', '__'))
    if not os.path.exists(local):
        req = urllib.request.Request(BASE + path, headers={'User-Agent': 'folio-latin-count'})
        with urllib.request.urlopen(req) as r:
            data = r.read()
        with open(local, 'wb') as f:
            f.write(data)
    return open(local, 'rb').read().decode('utf-8', 'replace')


def text_of(doc):
    """The body without the head, the footer's links or the markup."""
    doc = re.sub(r'(?is)<head>.*?</head>|<div class="footer">.*?</div>|<script.*?</script>', ' ', doc)
    return html.unescape(re.sub(r'<[^>]+>', ' ', doc))


def main():
    os.makedirs(DIR, exist_ok=True)
    counts = collections.Counter()
    for p in TEXTS:
        for t in tokens(text_of(page(p))):
            if not t[:1].isupper():
                counts[fold(t)] += 1
    lemmas = extract.read_lemmas()
    have = json.load(open('lex.json', encoding='utf-8'))
    first = {k for k, L in have.items() if L['dcc']}
    freq = extract.lemma_counts(lemmas, counts, first)
    shadow = set()
    for k in first:
        for ent in lemmas[k]['entries']:
            for row in ent['table'] + ent['head']:
                for w in row['f'].split():
                    f = fold(w.strip(',;'))
                    shadow.add(f)
                    if f.endswith('um'):             # the supine `factum`: `factus`
                        shadow.add(f[:-2] + 'us')
    shadow -= first
    out = {k: round(v, 2) for k, v in freq.items() if v > 0 and k not in shadow}
    extra = {}
    for k, L in lemmas.items():
        if k in out and k not in have and ' ' not in k:
            L['dcc'], L['dcc_rows'], L['tat'] = 0, [], 0
            extra[k] = L
    json.dump({'texts': TEXTS, 'tokens': sum(counts.values()), 'counts': out, 'lex': extra},
              open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    print(f'  {len(TEXTS)} pages, {sum(counts.values())} tokens; {len(out)} lemmas counted, '
          f'{len(extra)} beyond lex.json')


if __name__ == '__main__':
    main()
