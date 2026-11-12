#!/usr/bin/env python3
"""Stage 2 for the phrases deck: Hausa greetings, everyday phrases, exclamations and formulas.

    python3 .claude/hausa/run.py --level phr     # runs this in place of select.py

Not a CEFR level: an expression is a unit a word list cannot see.  The owner's plan
(`docs/hausa-decks-plan.md`, 2026-11-09) put it after the levels; on 2026-11-12, asked about
a B2 that would have been nearly all hand-glossed, the owner chose this deck instead.

THREE SUBDECKS, as the other phrases decks have, but NOT the idioms-and-proverbs pair of the
Bengali and Turkish decks: English Wiktionary has no Hausa proverb and Tatoeba's Hausa holds
none (searched 2026-11-12), and a proverb typed from memory would be a claim with no source.
So the subdecks are greetings and wishes, everyday phrases, and exclamations and set formulas.

WHERE THE EXPRESSIONS COME FROM: the religious formulas (`salamu alaikum`, `in sha Allahu`,
`alhamdulillahi` ...) are English Wiktionary's own entries and carry its tone line; every other
expression is glossed by Folio (`hand.HAND_PHR`), with no tone line, as the levels' hand
glosses are.  An entry is written as it is SHOWN, with its question mark or full stop; the
card's `Word` is the plain form (`plain`), and that is what Wiktionary and the hand glosses are
keyed by.

NOTHING A LEVEL DECK TEACHES IS REPEATED (`hausa_level.words_below`; BELOW['phr'] is every band).
THE ORDER is this list's: within a subdeck, the commonest and most useful come first (an
expression's corpus count is not measured: the frequency is counted per word).
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ha import norm
from hausa_level import LEVEL, LEX, f, words_below

SUBS = [
    ('Greetings and wishes', [
        'Ina kwana?',
        'Lafiya lau.',
        'Lafiya ƙalau.',
        'Ina wuni?',
        'Barka da safe.',
        'Barka da rana.',
        'Barka da yamma.',
        'Barka da zuwa.',
        'Sannu da zuwa.',
        'Maraba da zuwa.',
        'Sannu da aiki.',
        'Yaya aiki?',
        'Yaya gida?',
        'Yaya iyali?',
        'Ina gajiya?',
        'Ba gajiya.',
        'Yaya jiki?',
        'Da sauƙi.',
        'Ina labari?',
        'Labari sai alheri.',
        'Kana lafiya?',
        'Kina lafiya?',
        'Barka da Sallah.',
        'Barka da Kirsimeti.',
        'Barka da sabuwar shekara.',
        'Sai an jima.',
        'Sai gobe.',
        'Sai wani lokaci.',
        'Sai da safe.',
        'Mu kwana lafiya.',
        'A gaida gida.',
        'A sauka lafiya.',
        'Allah ya kiyaye hanya.',
        "Allah ya ba da sa'a.",
        'Allah ya ba ka lafiya.',
        'Allah ya kai mu.',
        'Allah ya raya.',
        'Allah ya jiƙansa.',
    ]),
    ('Everyday phrases', [
        'Na gode.',
        'Na gode ƙwarai.',
        'Don Allah.',
        'Yi haƙuri.',
        'Gafara dai.',
        'Ba laifi.',
        'Babu damuwa.',
        'Ban gane ba.',
        'Ban sani ba.',
        'Ina jin Hausa kaɗan.',
        'Kana jin Turanci?',
        'A hankali, don Allah.',
        'Nawa ne?',
        'Ya yi tsada.',
        'A rage mini.',
        'Ina banɗaki?',
        'A taimake ni!',
        'Ina jin yunwa.',
        'Ina jin ƙishirwa.',
        'Na gaji.',
        'Ba ni da lafiya.',
        'A kira likita.',
        'Mene ne sunanka?',
        'Mene ne sunanki?',
        'Daga ina kake?',
        'Daga ina kike?',
        'Ina son ka.',
        'Ina son ki.',
        'Me ya faru?',
        'Me ke faruwa?',
        'Me kake so?',
        'Ina zuwa.',
        'Mu je.',
        'Zo nan.',
        'Jira kaɗan.',
        'Ga shi.',
        'Ga ni.',
        'Haka ne.',
        'Ba haka ba.',
        'Ko ba haka ba?',
        'Shi ke nan.',
        'To, shi ke nan.',
        'Babu shakka.',
        'Ba ruwana.',
        'Ba ruwanka.',
        'Kada ka damu.',
        'Yau da kullum.',
        'Kowace rana.',
        'Da safe.',
        'Da yamma.',
        'Da dare.',
    ]),
    ('Exclamations and formulas', [
        'Allah ya kiyaye!',
        'Allah ya saka da alheri.',
        'Allah ya taimaka.',
        'Allah ya sauwaƙa.',
        'Allah ya sa.',
        'Allah sarki.',
        'Haba!',
        'Ayya!',
        'Wayyo!',
        'Kash!',
        'Madalla!',
        'Salamu alaikum.',
        'Alaikum salam.',
        'Alhamdulillahi.',
        'In sha Allahu.',
        'Ma sha Allahu.',
        'Bisimillahi.',
        'Bisimilla.',
        'Tubarkalla!',
    ]),
]

PUNCT = re.compile(r"[?!.,]")


def plain(show):
    """The expression without its punctuation, its first letter lower-cased (`Ina kwana?` ->
    `ina kwana`); `Allah` keeps its capital wherever it stands but first."""
    p = PUNCT.sub('', show).strip()
    return p[:1].lower() + p[1:]


def main():
    lex = json.load(open(LEX, encoding='utf-8'))
    below = words_below()
    rows, missing, dup, seen = [], [], [], set()
    for sub, items in SUBS:
        for show in items:
            k = norm(plain(show))
            if k in seen or k in below:
                dup.append(show)
                continue
            if k not in lex:
                missing.append(show)
                continue
            seen.add(k)
            rows.append({'key': k, 'word': lex[k]['word'], 'show': show, 'freq': 0, 'pos': '',
                         'source': 'phrases', 'topic': sub, 'sub': sub})
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    counts = {s: sum(1 for r in rows if r['sub'] == s) for s, _ in SUBS}
    print(f'  {len(rows)} expressions: ' + ', '.join(f'{n} {s.lower()}' for s, n in counts.items()))
    if missing:
        print('  NOT IN WIKTIONARY OR hand.py (dropped):', ' | '.join(missing))
    if dup:
        print('  SKIPPED (twice, or taught by a level):', ' | '.join(dup))


if __name__ == '__main__':
    assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'
    main()
