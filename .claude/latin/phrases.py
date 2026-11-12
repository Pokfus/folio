#!/usr/bin/env python3
"""The Latin Phrases and Mottos deck: the well-known phrases the levels leave.

    python3 .claude/latin/run.py --level phr      (runs this stage alone)

Not part of the site.  The plan is `docs/latin-decks-plan.md` §11.

WHERE THE PHRASES COME FROM.  Wiktionary's Latin section holds a few hundred
multi-word entries, mixed with anatomy, chemistry and inflected forms, and
nothing to rank them by.  English Wikipedia's *List of Latin phrases* is the
curated list a reader means by "Latin phrases": 2,383 rows of Latin, translation
and notes over twenty pages (A-V), CC BY-SA 4.0.  The pages are PINNED by
revision (`PAGES`), so a re-run builds the same deck.

WHICH ROWS (`well_known`).  The list's 2,240 multi-word rows include the mottos of
single schools and fine points of canon law, so a row is kept only on evidence
that the phrase is known beyond the list, any of:
  · it has a Wikipedia article of its own (the Latin cell links one);
  · it is a Latin entry in Wiktionary, spelt so;
  · it is a quotation of three or more words found verbatim in the classical
    corpus (`corpus.py`'s pages) -- a two-word phrase like `ad mortem` turns up in
    Livy by chance, so two words do not count.
A row whose Latin is not plain Latin text (quotation marks, brackets, an ellipsis,
Greek), whose translation is empty, or which runs past `MAX_WORDS`, is left out.

THE ORDER the cards are dealt in: the phrases with an article of their own first,
by how often that article was read over 60 days (`views`, cached in `views.json`) --
`carpe diem` before `ad quod damnum`; then the others by how often they occur in
Tatoeba's sentences and in the classical corpus, then alphabetically.

THE CARD: the phrase as the list spells it (without macrons: Wikipedia prints
none, and a word-by-word guess would mark some words and not others), the
translation, the first sentence of the list's note where it is short (`note`),
and up to three Tatoeba sentences containing the whole phrase.
"""
import collections, csv, glob, html, json, os, re, sys, time, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from la import fold, nfc, tokens, macronless

DIR = 'phrases'
UA = {'User-Agent': 'folio-latin-deck-builder/1.0 (offline deck generator)'}
API = 'https://en.wikipedia.org/w/api.php?action=parse&oldid={rev}&prop=wikitext|revid&format=json&formatversion=2'
QUERY = ('https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2'
         '&prop=pageviews&pvipdays=60&redirects=1&titles={t}')

# The revisions read on 2026-11-12, one per page of the list.
PAGES = {'A': 1380589466, 'B': 1382625422, 'C': 1379332072, 'D': 1374454837,
         'E': 1384841379, 'F': 1353581705, 'G': 1299013799, 'H': 1373356807,
         'I': 1381152042, 'L': 1379222483, 'M': 1362820538, 'N': 1383231961,
         'O': 1380565170, 'P': 1376906394, 'Q': 1356883512, 'R': 1384706654,
         'S': 1381433697, 'T': 1355575125, 'U': 1375072108, 'V': 1379123786}

MAX_WORDS = 14          # a longer quotation is a passage, not a phrase
NOTE_MAX = 180          # a note longer than this in its first sentence is left off
PLAIN = re.compile(r"^[A-Za-zÀ-ɏ̀-ͯ][A-Za-zÀ-ɏ̀-ͯ ,;:.!?'’-]*$")

# Read off the deck (2026-11-12).  Each with its reason.
EXCLUDE = {
}


# ---- fetching -----------------------------------------------------------------------------
def get(url, tries=6):
    for i in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA)).read()
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return b''
            if e.code != 429 or i == tries - 1:
                raise
            time.sleep(5 + 8 * i)       # Wikimedia's rate limit: back off and retry


def page(letter):
    p = os.path.join(DIR, f'{letter}-{PAGES[letter]}.json')
    if not os.path.exists(p):
        time.sleep(2)
        data = get(API.format(rev=PAGES[letter]))
        json.loads(data)
        open(p, 'wb').write(data)
    return json.load(open(p, encoding='utf-8'))['parse']['wikitext']


def views(titles):
    """Each article's readers over the 60 days before it was first asked (the MediaWiki
    API's `pageviews`, 50 titles a request -- the per-article REST endpoint allowed 100
    titles in 20 minutes).  Cached in `views.json`, so a re-run reads the same counts;
    a title the cache lacks is asked for and added."""
    p = os.path.join(DIR, 'views.json')
    have = json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}
    todo = sorted(t for t in titles if t not in have)
    for i in range(0, len(todo), 50):
        batch = todo[i:i + 50]
        time.sleep(1)
        d = json.loads(get(QUERY.format(t=urllib.parse.quote('|'.join(batch), safe=''))))['query']
        alias = {}
        for kind in ('normalized', 'redirects'):
            for x in d.get(kind, []):
                alias[x['from']] = x['to']
        got = {pg['title']: sum(v or 0 for v in (pg.get('pageviews') or {}).values())
               for pg in d.get('pages', [])}
        for t in batch:
            u = t
            while u in alias:
                u = alias[u]
            have[t] = got.get(u, 0)
    have.setdefault('_read', time.strftime('%Y-%m-%d', time.gmtime()))
    json.dump(have, open(p, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    return have


# ---- the list's wikitext ------------------------------------------------------------------
def cells(row):
    """A table row's cells, split on `||` outside templates and links."""
    out, cur, depth, i = [], '', 0, 0
    while i < len(row):
        two = row[i:i + 2]
        if two in ('{{', '[['):
            depth += 1; cur += two; i += 2; continue
        if two in ('}}', ']]'):
            depth = max(0, depth - 1); cur += two; i += 2; continue
        if two == '||' and depth == 0:
            out.append(cur); cur = ''; i += 2; continue
        cur += row[i]; i += 1
    out.append(cur)
    return out


def clean(s):
    """Wikitext to plain text: references, comments, templates and links unwrapped."""
    s = re.sub(r'<ref[^>]*/>', '', s)
    s = re.sub(r'(?s)<ref[^>]*>.*?</ref>', '', s)
    s = re.sub(r'(?s)<!--.*?-->', '', s)
    for _ in range(4):
        s = re.sub(r'\{\{(?:lang|lank)chor\|([^{}|]+)(?:\|[^{}]*)?\}\}', r'\1', s)
        s = re.sub(r'\{\{visible anchor\|([^{}|]+)(?:\|[^{}]*)?\}\}', r'\1', s)
        s = re.sub(r'\{\{[Aa]nchor\|[^{}]*\}\}', '', s)
        s = re.sub(r'\{\{[Ll]ang\|[a-z-]+\|([^{}|]+)(?:\|[^{}]*)?\}\}', r'\1', s)
        s = re.sub(r'\{\{(?:var|em|ill|lang-la)\|([^{}|]+)(?:\|[^{}]*)?\}\}', r'\1', s)
        s = re.sub(r'\{\{[^{}]*\}\}', '', s)
    s = re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', r'\1', s)
    s = re.sub(r'\[https?://\S+ ([^\]]*)\]', r'\1', s)
    s = re.sub(r"'''?", '', s)
    s = re.sub(r'<br\s*/?>', ' / ', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s.replace('&nbsp;', ' '))
    return re.sub(r'\s+', ' ', s).strip()


def article(cell):
    """The Wikipedia article the Latin cell links, if any: `lankchor`'s second
    argument or the phrase itself, else the first plain wikilink."""
    m = re.search(r'\{\{lankchor\|([^{}|]+)(?:\|([^{}|]+))?', cell)
    if m:
        return (m.group(2) or m.group(1)).strip()
    m = re.search(r'\[\[([^\]|]+)', cell)
    return m.group(1).strip() if m else ''


def rows():
    out = []
    for letter in PAGES:
        t = page(letter)
        t = t[t.find('{|'):]
        for r in t.split('\n|-'):
            r = r.strip('\n')
            if not r.startswith('|') or r.startswith('|}'):
                continue
            c = cells(r[1:])
            if len(c) < 2:
                continue
            first = re.split(r'<small>|<br|\(|\s+or\s*<', c[0])[0]
            out.append({'latin': clean(first), 'en': clean(c[1]),
                        'notes': clean(c[2]) if len(c) > 2 else '', 'article': article(c[0])})
    return out


# ---- the evidence ---------------------------------------------------------------------------
def key_of(s):
    return ' '.join(fold(t) for t in tokens(s))


def wiktionary_phrases():
    out = set()
    for line in open('kaikki-la.jsonl', encoding='utf-8'):
        i = line.find('"word": "')
        w = line[i + 9:line.find('"', i + 9)]
        if ' ' in w:
            out.add(key_of(w))
    return out


def classical_text():
    parts = []
    for p in sorted(glob.glob(os.path.join('classical', '*'))):
        d = open(p, 'rb').read().decode('utf-8', 'replace')
        d = re.sub(r'(?is)<head>.*?</head>|<div class="footer">.*?</div>|<[^>]+>', ' ', d)
        parts.append(' ' + key_of(html.unescape(d)) + ' ')
    return ' '.join(parts)


def tatoeba():
    """Latin-English pairs, as `examples.py` reads them."""
    csv.field_size_limit(10 ** 8)
    lat = {}
    for row in csv.reader(open('lat_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            lat[row[0]] = nfc(row[2])
    links = collections.defaultdict(list)
    for row in csv.reader(open('lat-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in lat:
            links[row[0]].append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    all_lat = [(int(i), s, ' ' + key_of(s) + ' ') for i, s in lat.items()]
    pairs = []
    for i, s, k in sorted(all_lat):
        en = sorted((eng[e] for e in links.get(str(i), []) if e in eng), key=lambda x: (len(x), x))
        if en:
            pairs.append((i, s, en[0], k))
    return all_lat, pairs


def note(text):
    """The note's first sentence, when it is short and is prose (some rows' notes are
    nested tables or a bare author's name, which stays: "From Horace")."""
    if not text or text.startswith('{|') or '|' in text:
        return ''
    m = re.match(r'(.+?[.!?])(?:\s|$)', text)
    first = (m.group(1) if m else text).strip()
    return first if len(first) <= NOTE_MAX else ''


# ---- the deck -----------------------------------------------------------------------------
STAMP = '2026-11-12T00:00:00.000Z'
TYPE_ID = 'latinphrase'
FIELDS = ['Latin', 'Key', 'Word', 'English', 'Note', 'Examples']
SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = '<div class="uc-word uc-phrase">{{Latin}}' + SAY + '</div>'
ASK = '<div class="uc-ask">Say it in Latin</div><div class="uc-field">{{English}}</div>'
NOTE = '{{#Note}}<div class="uc-note">{{Note}}</div>{{/Note}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')
FRONT_LA = WORD
BACK_LA = '{{FrontSide}}<hr><div class="uc-field">{{English}}</div>' + NOTE + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + NOTE + TAIL
E = html.escape


def mark(sentence, phrase_toks):
    """The phrase's words picked out in the sentence."""
    hs = set(phrase_toks)
    return ''.join(f'<b>{E(p)}</b>' if p and fold(p) in hs else E(p)
                   for p in re.split(r"([A-Za-zÀ-ɏ̀-ͯ]+)", sentence))


def examples_for(k, pairs, used):
    """Up to three Tatoeba sentences holding the phrase's words in order, the
    shorter first, each used once in the deck."""
    want = ' ' + k + ' '
    hits = [p for p in pairs if want in p[3] and p[0] not in used]
    hits.sort(key=lambda p: (len(p[1]), p[0]))
    out = []
    for i, la, en, _ in hits[:3]:
        used.add(i)
        out.append((la, en))
    return out


def desc(n, n_art, n_ex3, n_ex0):
    return (
        "Both study directions in one deck: Latin → English (see the phrase, recall what it means) "
        "and English → Latin (see the meaning, recall the phrase). Each direction is a card of its "
        f"own with its own schedule. {n} Latin phrases, sayings and mottos — the well-known ones the "
        "Latin level decks leave, since those teach single words. "
        "WHERE THESE PHRASES COME FROM: English Wikipedia's List of Latin phrases, a curated list of "
        "some 2,400 rows, of which this deck keeps only the phrases with evidence that they are known "
        f"beyond the list: {n_art} have a Wikipedia article of their own, and the others are entries "
        "in Wiktionary's Latin dictionary or quotations of three words or more found word for word in "
        "the classical authors (Caesar, Cicero, Livy, Virgil, Horace, Ovid and others). The phrases "
        "with an article come first, ordered by how often that article was read over two months "
        "of 2026, so carpe diem comes long before a phrase of canon law; the rest follow by how often they appear in "
        "the Tatoeba corpus and in the classical authors. "
        "Each card gives the phrase as the list spells it — without macrons, as Wikipedia prints "
        "Latin — with its translation and, where the list's note opens with a short sentence, that "
        "sentence: who said it, whose motto it is, how it is used. "
        + (f"Example sentences from Tatoeba come with {n - n_ex0} of the {n} phrases, three apiece "
           f"for {n_ex3}, with the phrase picked out in colour. " if n_ex0 < n else "") +
        "The speaker reads Latin with an Italian voice, which gives the Italianate church "
        "pronunciation, because almost no device has a Latin voice. Sources. Phrases, translations "
        "and notes: Wikipedia, List of Latin phrases (pages A to V, revisions of November 2026), "
        "CC BY-SA 4.0. Order: Wikipedia pageviews, September to November 2026. Selection: English Wiktionary via the "
        "kaikki.org extraction (CC BY-SA 4.0) and The Latin Library's texts of the classical "
        "authors. Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )


def main():
    os.makedirs(DIR, exist_ok=True)
    print('  reading the list (20 pinned pages) ...')
    R = rows()
    wk = wiktionary_phrases()
    cls = classical_text()
    all_lat, pairs = tatoeba()
    tat_text = [k for _, _, k in all_lat]
    excl = {key_of(s) for s in EXCLUDE}
    kept, seen, why = [], set(), collections.Counter()
    for r in R:
        lat, en = r['latin'].strip(' ,;:'), r['en'].strip()
        k = key_of(lat)
        words = k.split()
        if len(words) < 2:
            continue
        if not PLAIN.match(lat) or not en or len(words) > MAX_WORDS:
            why['not plain Latin, no translation, or too long'] += 1
            continue
        if k in seen or k in excl:
            continue
        a = r['article'] if r['article'] and '#' not in r['article'] else ''
        has_art = bool(r['article'])
        in_wk = k in wk
        n_cls = cls.count(' ' + k + ' ')
        if not (has_art or in_wk or (len(words) >= 3 and n_cls)):
            why['no evidence beyond the list'] += 1
            continue
        seen.add(k)
        n_tat = sum(1 for t in tat_text if ' ' + k + ' ' in t)
        kept.append({'latin': lat, 'key': k, 'en': en, 'note': note(r['notes']), 'art': has_art,
                     'title': a, 'wk': in_wk, 'cls': n_cls, 'tat': n_tat})
    print(f'  {len(R)} rows; kept {len(kept)}; left out: ' +
          ', '.join(f'{v} {k}' for k, v in why.most_common()))
    print('  pageviews for the articles ...')
    pv = views({r['title'] for r in kept if r['title']})
    for r in kept:
        r['views'] = pv.get(r['title'], 0) if r['title'] else 0
    kept.sort(key=lambda r: (not r['art'], -r['views'], -r['tat'], -r['cls'], r['key']))

    used, cards, n3, n0 = set(), [], 0, 0
    for i, r in enumerate(kept, 1):
        exs = examples_for(r['key'], pairs, used)
        n3 += len(exs) == 3
        n0 += not exs
        cards.append({'id': f'u_laphrase_{i}', 'type': TYPE_ID, 'sub': '', 'fields': {
            'Latin': E(r['latin']), 'Key': r['key'], 'Word': macronless(r['latin']),
            'English': E(r['en']), 'Note': E(r['note']),
            'Examples': ''.join(
                f'<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" '
                f'data-say="{E(la)}"></span>{mark(la, r["key"].split())}</div>'
                f'<div class="uc-exe">{E(en)}</div></div>' for la, en in exs)}})
    n = len(cards)
    css = open(os.path.join(HERE, 'card.css'), encoding='utf-8').read() + (
        '\n.uc-phrase {\n  font-size: 30px;\n}\n'
        '.uc-note {\n  max-width: 100%;\n  margin: 10px auto 0;\n  font-size: 14px;\n'
        '  font-style: italic;\n  opacity: 0.75;\n}\n')
    from latin_level import TITLES, DECK_IDS, DECK_FILES
    import build_deck
    meta = {
        'id': DECK_IDS['phr'], 'title': TITLES['phr'],
        'subtitle': f'{n} phrases · both directions, as two cards per phrase',
        'desc': desc(n, sum(r['art'] for r in kept), n3, n0), 'author': '', 'language': 'en',
        'color': build_deck.COLOR, 'tags': ['latin', 'phrases', 'mottos', 'sayings'],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Latin phrase', 'speechLang': 'it-IT', 'fields': FIELDS,
            'cards': [{'name': 'Latin → English', 'front': FRONT_LA, 'back': BACK_LA},
                      {'name': 'English → Latin', 'front': FRONT_EN, 'back': BACK_EN}],
            'css': css}},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('dedupe_glosses', os.path.join(HERE, '..', 'dedupe-glosses.py'))
    dg = ilu.module_from_spec(spec)
    spec.loader.exec_module(dg)
    st = dg.dedupe(deck, 'Latin')
    if st['groups']:
        print('  labelled %d notes in %d groups that shared an English side' % (st['labelled'], st['groups']))
    out = os.path.abspath(os.path.join(HERE, '..', '..', 'decks', DECK_FILES['phr']))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    json.dump(kept, open('selected-phr.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('  wrote', out)
    print(f'  notes {n} = cards {n * 2} | bytes {os.path.getsize(out)} | '
          f'three sentences for {n3}, none for {n0}')


if __name__ == '__main__':
    main()
