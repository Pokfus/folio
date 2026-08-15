#!/usr/bin/env python3
"""Read one level's word list off its page.

The page is SERVER-RENDERED, which is the whole reason this stage is twenty
lines rather than a headless browser: the words are in the HTML that arrives,
one to a list item, as `<li>word <span>A1</span></li>`.  Nothing here executes
the page's JavaScript and nothing needs to.

TWO THINGS ARE ASSERTED RATHER THAN HOPED FOR, because a scrape that quietly
returns the wrong thing is the failure nobody reports: the words still look like
words, the deck still builds, and only a reader ever finds out.

  · **THE COUNT, against the page's own title.**  The title states the figure
    ("A1 Italian Vocabulary List: 961 Words"), so the page carries its own
    checksum and it is read and compared -- against the extracted count AND
    against the figure recorded in `cils_level.EXPECT`, which is what catches
    the list being rewritten under us rather than merely mis-parsed.

  · **THAT THE LIST SECTION IS THE ONE BEING READ.**  The page also prints
    prose above the list, and that prose contains list items of its own in
    other sections of the site's template.  Only items carrying the level
    `<span>` badge are taken, which is what a vocabulary row has and a
    paragraph does not.

WHAT A CANDIDATE LEMMA IS.  The list prints bare words, lower-cased throughout
-- `italia` and `italiano` sit side by side -- so a proper noun arrives without
its capital and would be looked up as a word Wiktionary does not have.  Every
entry therefore offers both its own surface and a capitalised variant, and
`select.py` takes whichever the dictionary actually carries.  That is the only
transformation made here; the words themselves are passed through exactly as
printed.
"""
import html, json, os, re, sys, urllib.request

from cils_level import LEVEL, EXPECT, LIST_URL, NVDB_FILE, f as lvlf

CACHE_HTML = f'list-{LEVEL}.html'

# the list's own misspellings -> the spelling the dictionary carries, as
# `(lemma, display)`.  See the comment where it is applied.
RESPELL = {
    'colonello': ('colonnello', 'colonnello'),   # C1; `colonello` is no word
    'milionare': ('milionario', 'milionario'),   # C1
}

# AN ACCENT THAT IS NOT ON THE LAST VOWEL, which the rule below cannot reach --
# it offers `città` for `citta` and has nothing to say about `élite` for
# `elite`.  Offered as one more candidate lemma and nothing else: the two fold
# equal, so `select`'s accent branch adopts the dictionary's spelling for the
# display exactly as it does for `assurdità`, and this table never states one.
ACCENTED = {'elite': 'élite'}                    # C1

# `<li>parola <span>A1</span></li>` -- the badge is what marks a vocabulary row
ROW = re.compile(r'<li>\s*([^<>]+?)\s*<span>\s*([ABC][12])\s*</span>\s*</li>', re.I)
TITLE_N = re.compile(r'<title>[^<]*?([\d,]+)\s+Words', re.I)


def fetch():
    """The page, from the cache if it is there and from the site if it is not."""
    if os.path.exists(CACHE_HTML) and os.path.getsize(CACHE_HTML) > 0:
        print(f'  have  {CACHE_HTML}')
        return open(CACHE_HTML, encoding='utf-8').read()
    url = LIST_URL[LEVEL]
    print(f'  get   {CACHE_HTML}  <- {url}')
    req = urllib.request.Request(url, headers={'User-Agent': 'folio-deck-build/1.0'})
    with urllib.request.urlopen(req) as r:
        page = r.read().decode('utf-8')
    open(CACHE_HTML, 'w', encoding='utf-8').write(page)
    return page


def core_words():
    """De Mauro's basic vocabulary, whole.

    The `core` level has no page to scrape and none of the assertions that go
    with one: its list is a published reference work read straight off disk, and
    the subtraction of what the six bands already teach is left to `select`,
    which is where the exclusion machinery lives and where it is reported.
    """
    if not os.path.exists(NVDB_FILE):
        raise SystemExit(f'{NVDB_FILE} is missing -- run without --no-fetch once')
    ws, seen = [], set()
    for line in open(NVDB_FILE, encoding='utf-8'):
        w = line.strip()
        if w and w not in seen:
            seen.add(w)
            ws.append(w)
    print(f'  read  {NVDB_FILE}: {len(ws)} words of basic vocabulary')
    return ws


def main():
    if LEVEL == 'core':
        return emit(core_words())

    page = fetch()

    rows = ROW.findall(page)
    if not rows:
        raise SystemExit('no vocabulary rows found -- the page markup has changed')

    words, badges, seen = [], set(), set()
    for w, badge in rows:
        w = html.unescape(w).strip()
        badges.add(badge.upper())
        if not w or w in seen:
            continue
        seen.add(w)
        words.append(w)

    # every row must carry THIS level's badge; a page serving a mixed list would
    # otherwise be filed whole under whichever level was asked for
    if badges != {LEVEL.upper()}:
        raise SystemExit(f'rows are badged {sorted(badges)}, expected {LEVEL.upper()!r}')

    m = TITLE_N.search(page)
    stated = int(m.group(1).replace(',', '')) if m else None
    if stated is None:
        raise SystemExit('the page title no longer states a word count to check against')
    if stated != len(words):
        raise SystemExit(f'the page says {stated} words and {len(words)} were extracted')
    if EXPECT.get(LEVEL) not in (None, stated):
        raise SystemExit(f'the page now says {stated} words, where this pipeline was '
                         f'written against {EXPECT[LEVEL]} -- the list has been revised, '
                         f'so re-read it before raising the number in cils_level.EXPECT')

    return emit(words, stated)


def emit(words, stated=None):
    # the accented spellings a bare final vowel may stand for; `à` and `ù` are
    # the ones that actually occur in these lists (`città`, `più`), but the
    # others cost nothing and cannot fire unless the dictionary has the word
    ACCENTS = {'a': 'à', 'e': 'èé', 'i': 'ì', 'o': 'òó', 'u': 'ù'}

    entries = []
    for w in words:
        # **THE LIST'S OWN MISSPELLINGS, hand-read, one row each.**  The accent
        # rule below is a RULE because a lost final accent has one repair; these
        # have none that is safe to generalise -- a "try doubling a consonant"
        # rule would fire on hundreds of words and could silently swap in a
        # different lemma.  Each of these was looked up in the dump and in the
        # subtitle and Tatoeba corpora before it was written, and each is a word
        # the list plainly meant: `colonnello` (13,506 subtitle hits, De Mauro
        # basic) for `colonello`, which is not an Italian word at all.
        #
        # The DISPLAY moves with the lemma, unlike the accent case: `select`'s
        # recasing can only adopt a spelling that FOLDS equal to the printed one,
        # so `colonello` would otherwise be headed as printed and glossed
        # "colonel" -- teaching the misspelling with a correct definition, which
        # is worse than dropping it.
        w, disp = RESPELL.get(w, (w, w))
        lemmas = [w]
        if w in ACCENTED:
            lemmas.append(ACCENTED[w])
        # a proper noun arrives lower-cased; offer the capital as an alternative
        # rather than imposing it, and let the dictionary decide
        if w[:1].islower() and w.capitalize() not in lemmas:
            lemmas.append(w.capitalize())
        # **THE LIST HAS LOST SOME FINAL ACCENTS, AND ITALIAN WRITES THEM.**
        # C1 prints `assurdita`, `mentalita`, `dignita`, `oscurita`, `perlopiu`,
        # `elite` and `cliche` -- none of which is an Italian word: they are
        # `assurdità`, `mentalità` and the rest, and the accent is not optional
        # in the way an English one might be.  Unfound, they were dropped, so a
        # deck claiming 2,842 words taught neither the word nor its spelling.
        # OFFERED rather than imposed, exactly like the capital above: the
        # accented form is one more thing to look up, the dictionary decides,
        # and a word whose bare form has an entry is never touched.
        if w[-1:] in 'aeiou':
            lemmas += [w[:-1] + a for a in ACCENTS[w[-1]]]
        # …AND TWO TRUNCATED INFINITIVES.  `convincer` and `incastrar` are the
        # elided forms poetry and song use for `convincere` and `incastrare`.
        if w[-2:] in ('ar', 'er', 'ir'):
            lemmas.append(w + 'e')
        # **A PRONOMINAL VERB'S CITATION FORM CARRIES ITS CLITIC, AND THE LIST
        # PRINTS IT WITHOUT.**  C1 lists `imbattere` and `attendare`; Italian has
        # only `imbattersi` ("to run into, come across") and `attendarsi` ("to
        # pitch camp"), which is where Wiktionary files both, so the bare form
        # matched nothing and two verbs were dropped.  OFFERED, like everything
        # else here -- a verb whose bare infinitive has a real entry never
        # reaches this candidate, since `pick_lemma` prefers the form that says
        # something.  The DISPLAY stays as printed: that is already how the
        # feminine adjectives this list prints are treated, and `select` reads
        # `-rsi` off the resolved lemma anyway, so the card is built as the
        # reflexive it is.
        if w[-3:] in ('are', 'ere', 'ire'):
            lemmas.append(w[:-1] + 'si')
        elif w.endswith('rre'):                     # porre -> porsi
            lemmas.append(w[:-2] + 'si')
        # **AN ABSOLUTE SUPERLATIVE IS FILED UNDER ITS MASCULINE.**  The list
        # prints `importantissima` and `stranissima`; Wiktionary carries neither
        # and carries both masculines, glossed "superlative degree of importante
        # (very important)".  Narrowed to `-issim-` rather than every `-a`: the
        # suffix is unambiguous, where a general feminine-to-masculine rule would
        # gloss a feminine noun with no entry as some unrelated adjective.
        if w[-6:] in ('issima', 'issime', 'issimi'):
            lemmas.append(w[:-1] + 'o')
        entries.append({
            'word': w,
            'display': disp,
            'lemmas': lemmas,
            'multiword': ' ' in w,
        })

    json.dump(entries, open(lvlf('wordlist.json'), 'w'), ensure_ascii=False, indent=1)
    multi = sum(1 for e in entries if e['multiword'])
    src = f'the page states {stated}' if stated is not None else f'read from {NVDB_FILE}'
    print(f'  words {len(entries)} ({src}), of which {multi} are phrases')
    print('  first ten:', ', '.join(e['display'] for e in entries[:10]))


if __name__ == '__main__':
    main()
