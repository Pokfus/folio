#!/usr/bin/env python3
"""Write the Lao phrases deck: `decks/Lao-Phrases-and-Expressions.folio-deck.json`.

    python3 .claude/lao/phrases.py      (reads the cache run.py fills)

Not a CEFR level: a companion to the level decks, in three subdecks, as Thai's
phrases deck is -- but its material differs, and the reason is the source.

WIKTIONARY HOLDS ALMOST NO LAO PHRASES.  Its whole Lao extraction has five
entries filed as phrases, two proverbs and ten interjections, and the level
decks already teach the commonest of them (ສະບາຍດີ, ຂໍໂທດ, ບໍ່ເປັນຫຍັງ).  A
deck of Wiktionary's expressions alone would be a handful of cards, so:

  Phrases    Wiktionary's own phrases and interjections that no level teaches
             (ຈັກໂມງ "what time is it?", ຂ້ອຍຊື່ "my name is ...");
  Sentences  Tatoeba's Lao sentences with their English translation -- real,
             attributed everyday sentences (ເຈົ້າຊື່ຫຍັງ? "What's your name?",
             ຂອບໃຈຫຼາຍ "Thank you very much"), short ones first;
  Proverbs   Wiktionary's part of speech `proverb`.

A SENTENCE'S ROMANISATION IS COMPOSED WORD BY WORD.  Tatoeba gives none, so a
sentence is cut into words (`lo.Segmenter`, the same cut the examples use) and
each word's own romanisation -- `lo.romanise` over its Wiktionary IPA -- is
joined in order, as the level decks compose ພາສາລາວ from its parts.  ONLY A
SENTENCE EVERY WORD OF WHICH HAS ONE IS TAKEN, and none whose cut uses a
syllable the level decks refuse (`select.EXCLUDE`): nothing
about the sound is typed by hand.  A word read in a sentence can sound slightly
different from the word alone (an unstressed syllable shortened); the card
prints each word as Wiktionary transcribes it alone, and the deck's description
says so.

WHAT IS LEFT OUT, and why: a sentence whose text, without punctuation, is a
word a level deck already teaches (ສະບາຍດີ, ຂອບໃຈ -- the level card is the
same thing); a second Tatoeba sentence with the same Lao or the same English
(the reverse card would have two answers); a sentence longer than `MAX_LEN`
letters; and a Wiktionary entry that is only a dated spelling or an extreme
honorific (`SKIP`).  The order is deterministic (subdeck, then length, then
Tatoeba id or headword), so a re-run is byte-identical.

Sources: English Wiktionary via kaikki.org (CC BY-SA 4.0); Tatoeba
(tatoeba.org), CC BY 2.0 FR.  Plan: `docs/lao-decks-plan.md` §9.
"""
import html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
os.environ.setdefault('LAO_LEVEL', 'phr')
from lo import fold, nfc, romanise, Segmenter, RUN

CACHE = os.path.abspath(os.path.join(HERE, '..', 'lao-cache'))
DECKS = os.path.abspath(os.path.join(HERE, '..', '..', 'decks'))
OUT = 'Lao-Phrases-and-Expressions.folio-deck.json'
DECK_ID = 'laophrase'
LEVEL_FILES = ['Lao-A1.folio-deck.json', 'Lao-A2.folio-deck.json', 'Lao-B1.folio-deck.json']
MAX_LEN = 40          # letters (Lao letters, punctuation and spaces not counted)
ORDER = ['Phrases', 'Sentences', 'Proverbs']

# Wiktionary entries left out, each with its reason.
SKIP = {
    'ອາໂຫລ': 'a dated spelling of ອາໂຫຼ "hello (on the telephone)", which A1 teaches',
    'ໂດຍຂ້ານ້ອຍ': 'an "extreme polite" affirmation; A1 teaches the everyday ໂດຍ and ເຈົ້າ',
}


def main():
    os.chdir(CACHE)
    import build_deck as bd               # the level decks' templates, CSS and colour
    import examples                       # Tatoeba's pairs, loaded as the level decks load them
    lex = json.load(open('lex.json', encoding='utf-8'))
    raw = [json.loads(l) for l in open('kaikki-lo.jsonl', encoding='utf-8')]
    taught = set()
    for f in LEVEL_FILES:
        p = os.path.join(DECKS, f)
        if not os.path.exists(p):
            raise SystemExit(f'the phrases deck is built on the level decks, but {p} is missing')
        taught |= {fold(c['fields']['Word']) for c in json.load(open(p, encoding='utf-8'))['cards']}

    seg = Segmenter(set(lex))
    import importlib.util as ilu          # `select` by path: the name is also a standard module
    spec = ilu.spec_from_file_location('lao_select', os.path.join(HERE, 'select.py'))
    sel = ilu.module_from_spec(spec)
    spec.loader.exec_module(sel)
    refused = {fold(w) for w in sel.EXCLUDE}

    def word_roman(w):
        L = lex.get(fold(w)) or {}
        if 'entries' in L:
            return next((e['roman'][0] for e in L['entries'] if e['roman']), '')
        return (L.get('roman') or [''])[0]

    rows = []        # (subdeck, sort key, Lao, roman, English)
    seen_lo, seen_en = set(), set()

    # Wiktionary's phrases, interjections and proverbs
    for e in raw:
        pos, w = e.get('pos'), nfc(e.get('word', ''))
        if pos not in ('phrase', 'intj', 'proverb') or fold(w) in taught or w in SKIP:
            continue
        gl = [s['glosses'][-1] for s in e.get('senses') or [] if s.get('glosses')
              and 'form_of' not in s and 'alt_of' not in s]
        ipa = next((s['ipa'] for s in e.get('sounds') or [] if s.get('note') == 'Vientiane'
                    and s.get('ipa')), '')
        # a proverb's two halves are two IPA strings joined by a space
        rom = ' '.join(romanise(p) for p in ipa.split(' ')) if ipa else ''
        if not gl or not rom or '  ' in rom or rom.startswith(' ') or rom.endswith(' '):
            continue
        sub = 'Proverbs' if pos == 'proverb' else 'Phrases'
        en = '; '.join(dict.fromkeys(g.rstrip(' .') for g in gl[:2]))
        rows.append((sub, (len(fold(w)), w), w, rom, en))
        seen_lo.add(re.sub(r'[^຀-໿]', '', fold(w)))
        seen_en.add(en.lower().rstrip('.!?'))

    # Tatoeba's sentences
    for pid, lo, en in examples.load():
        t = fold(lo)
        bare = ''.join(RUN.findall(t))
        if not bare or len(bare) > MAX_LEN or bare in taught or bare in seen_lo:
            continue
        key_en = en.lower().rstrip('.!?')
        if key_en in seen_en:
            continue
        cut = seg.segment(t)
        roms = [word_roman(w) for w in cut]
        if not all(roms):
            continue
        # a piece the level decks REFUSE as a syllable count (select.EXCLUDE: ສາ, ກະ, ອາ ...)
        # is most likely a syllable of a word Wiktionary lacks, and its tone may not be that
        # word's -- so a sentence the cut breaks that way is left out (it removed three)
        if any(w in refused for w in cut):
            continue
        seen_lo.add(bare)
        seen_en.add(key_en)
        lo = nfc(lo).replace('\u00ad', '').replace('\u200b', '').strip()   # line-break hints, invisible
        rows.append(('Sentences', (len(bare), pid), lo, ' '.join(roms), en))

    rows.sort(key=lambda r: (ORDER.index(r[0]), r[1]))
    E = html.escape
    cards = []
    for i, (sub, _, lo, rom, en) in enumerate(rows, 1):
        cards.append({'sub': sub, 'fields': {
            'Lao': E(lo), 'Roman': E(rom), 'Word': lo,
            'English': f'<div class="uc-sense"><div class="uc-gl">{E(en)}</div></div>',
            'Forms': '', 'Examples': '',
        }, 'id': f'u_{DECK_ID}_{i}', 'type': bd.TYPE_ID})
    n = len(cards)
    by = {s: [c for c in cards if c['sub'] == s] for s in ORDER}
    eg = lambda s: ', '.join(c['fields']['Word'] for c in by[s][:3])
    desc = (
        f"{n} Lao phrases, sentences and proverbs, in three subdecks: {len(by['Phrases'])} everyday "
        f"phrases, {len(by['Sentences'])} short sentences and {len(by['Proverbs'])} proverbs. Both study "
        "directions come as two cards of one entry — Lao → English (see the Lao, recall the meaning) and "
        "English → Lao (see the English, recall the Lao) — each with a schedule of its own. This is a "
        "companion to the level decks, Lao A1 to B1, and not one of them; nothing here is a word a level "
        "deck already teaches, so the two can be studied together without repeating an entry. WHY "
        "SENTENCES: English Wiktionary, the source of every Lao meaning on this shelf, holds only a "
        "handful of Lao set phrases and two proverbs, and the levels already teach the commonest "
        f"greetings. So the PHRASES are the ones Wiktionary has that no level teaches ({eg('Phrases')} …), "
        "the PROVERBS are its two, and the SENTENCES are real everyday sentences from Tatoeba with "
        f"Tatoeba's own English translation ({eg('Sentences')} …), shortest first. Every entry is printed "
        "in Lao script with a romanisation beneath it, each syllable followed by its tone in Chao tone "
        "letters, as on the level cards. A sentence's romanisation is built word by word from each word's "
        "Wiktionary pronunciation — only sentences where every word has one are included — so it shows "
        "each word as said on its own; in running speech an unstressed syllable can be shorter. Sources. "
        "Phrases, proverbs, meanings and pronunciation: English Wiktionary, via the kaikki.org extraction "
        "(CC BY-SA 4.0). Sentences and their translations: Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )
    t = bd.TYPE_ID
    meta = {
        'id': DECK_ID, 'title': 'Lao Phrases and Expressions',
        'subtitle': (f"{n} entries · {len(by['Phrases'])} phrases, {len(by['Sentences'])} sentences, "
                     f"{len(by['Proverbs'])} proverbs · both directions"),
        'desc': desc, 'author': '', 'language': 'en', 'color': bd.COLOR,
        'tags': ['lao', 'phrases', 'sentences', 'proverbs'], 'glossMode': 'site',
        'types': {t: {
            'id': t, 'name': 'Lao vocabulary', 'speechLang': 'lo-LA', 'fields': bd.FIELDS,
            'cards': [{'name': 'Lao → English', 'front': bd.FRONT_TH, 'back': bd.BACK_TH},
                      {'name': 'English → Lao', 'front': bd.FRONT_EN, 'back': bd.BACK_EN}],
            'css': bd.CSS,
        }},
        'version': 1, 'createdAt': bd.STAMP, 'updatedAt': bd.STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': bd.STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.join(DECKS, OUT)
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, f'{n} notes', {s: len(v) for s, v in by.items()})


if __name__ == '__main__':
    main()
