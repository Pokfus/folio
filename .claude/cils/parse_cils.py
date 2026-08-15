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

from cils_level import LEVEL, EXPECT, LIST_URL, f as lvlf

CACHE_HTML = f'list-{LEVEL}.html'

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


def main():
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

    entries = []
    for w in words:
        lemmas = [w]
        # a proper noun arrives lower-cased; offer the capital as an alternative
        # rather than imposing it, and let the dictionary decide
        if w[:1].islower() and w.capitalize() not in lemmas:
            lemmas.append(w.capitalize())
        entries.append({
            'word': w,
            'display': w,
            'lemmas': lemmas,
            'multiword': ' ' in w,
        })

    json.dump(entries, open(lvlf('wordlist.json'), 'w'), ensure_ascii=False, indent=1)
    multi = sum(1 for e in entries if e['multiword'])
    print(f'  words {len(entries)} (the page states {stated}), of which {multi} are phrases')
    print('  first ten:', ', '.join(e['display'] for e in entries[:10]))


if __name__ == '__main__':
    main()
