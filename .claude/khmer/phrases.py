#!/usr/bin/env python3
"""Write the Khmer phrases deck: `decks/Khmer-Phrases-and-Expressions.folio-deck.json`.

    python3 .claude/khmer/phrases.py      (reads .claude/khmer-cache/; after the level decks)

Asked for on 2026-11-16 ("Add a phrases deck").  English Wiktionary files about forty Khmer
entries as phrases, two as proverbs and none as idioms, so -- the Amharic and Zulu
arrangement, not Thai's three subdecks -- the deck is Wiktionary's phrases, then Tatoeba's
short sentences, and it says it is small in the first half.  Not a CEFR level.  Two subdecks:

  Phrases    Wiktionary's phrase and proverb entries, its interjections of more than one
             word, and the one-word set formulas of `ONE_WORD` (ស្វាគមន៍ "welcome"), that
             the level decks do not teach, in the hand order of `PHRASES` -- greetings first,
             the phrasebook, wishes, then the proverbs.  The gloss is Wiktionary's; the
             romanisation is read off each entry's page (`romanise.fetch`), as the levels'.
             An entry Wiktionary defines only as another's variant is not a card (its gloss
             is a pointer); `LEFT_OUT` names every other entry not taught, with its reason,
             and the build fails on an entry in neither list, so a new one is decided by hand.
  Sentences  Tatoeba's Khmer sentences with their English translation, at most EIGHT
             dictionary words on the word cut (`km.Segmenter`), printed as Tatoeba has them
             (zero width spaces removed), each card giving the sentence's Tatoeba number.
             Fewest words first, then by Tatoeba number.

ONE ENGLISH SIDE PER CARD (the reverse card must have one answer).  Where Tatoeba has two
Khmer sentences for one English one ("I'm hungry": a man's and a woman's, or two wordings),
the first in that order is kept.  A sentence that is only a phrase above or a word a level
teaches is left out, and so is one holding Latin letters or digits; `DROP` names each other
sentence left out and why.

No corpus is counted, so a re-run is byte-identical whenever the cached sources are.

SOURCES: English Wiktionary via kaikki.org and the entries' pages (CC BY-SA 4.0); Tatoeba
(CC BY 2.0 FR).
"""
import html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from km import fold, key, nfc, Segmenter
import build_deck as B

E = lambda s: html.escape(s, quote=True)
CACHE = os.path.abspath(os.path.join(HERE, '..', 'khmer-cache'))
DECKS = os.path.abspath(os.path.join(HERE, '..', '..', 'decks'))
OUT = 'Khmer-Phrases-and-Expressions.folio-deck.json'
DECK = 'kmphrase'
MAX_WORDS = 8
LEVELS = ('Khmer-A1', 'Khmer-A2', 'Khmer-B1')

# The hand order: greetings and leave-taking, politeness, the phrasebook, wishes, signs,
# exclamations, the proverbs.
PHRASES = [
    'អរុណសួស្តី', 'សាយណ្ហសួស្តី', 'រាត្រីសួស្ដី', 'ស្វាគមន៍', 'លាសិនហើយ',
    'សូមទោស', 'មិនអ្វីទេ', 'អត់អី', 'អត់អ្វីទេ', 'គ្មានបញ្ហា',
    'ខ្ញុំឈ្មោះ', 'ខ្ញុំជាខ្មែរ', 'ខ្ញុំនៅលីវ', 'ខ្ញុំមិនយល់ទេ',
    'តើអ្នកនិយាយភាសាអង់គ្លេសទេ', 'ខ្ញុំមិនចេះនិយាយភាសាអង់គ្លេស',
    'តើអ្នកនិយាយភាសាខ្មែរទេ', 'ខ្ញុំមិនចេះនិយាយភាសាខ្មែរទេ',
    'តើអ្នកមានអាយុប៉ុន្មានហើយ', 'តើអ្នករៀបការហើយឬនៅ', 'ម៉ោងប៉ុន្មានហើយ', 'ថ្លៃទេ',
    'បងស្រឡាញ់អូន', 'អូនស្រឡាញ់បង',
    'សួស្ដីឆ្នាំថ្មី', 'រីករាយថ្ងៃខួបកំណើត', 'អញ្ជើញពិសាឲ្យបានឆ្ងាញ់', 'សុយាត្រា', 'អាយុវែង', 'ស្បើយ',
    'ហាមជក់បារី',
    'អនិច្ចា', 'ពុទ្ធោ', 'ឈប់និយាយ',
    'ចាបមួយនៅដៃប្រសើរក្រៃ ជាងចាបដប់នៅលើឈើ',
]
# One-word entries that are set formulas, not sounds: taught although they do not divide.
ONE_WORD = {'ស្វាគមន៍', 'អនិច្ចា', 'ពុទ្ធោ', 'ស្បើយ', 'សុយាត្រា', 'អាយុវែង', 'សូមទោស',
            'អរុណសួស្តី', 'សាយណ្ហសួស្តី', 'រាត្រីសួស្ដី'}

# Wiktionary's phrase, interjection and proverb entries NOT taught here, with the reason.
LEFT_OUT = {
    'អញ្ជើញ': 'a level deck teaches it (B1, by frequency)',
    'កុំដេកចាំស្លាប់ កុំអង្គុយចាំមាន': 'its headword is the first line of a poem whose gloss and romanisation on '
                                       'Wiktionary are the whole poem (five couplets), so the card would not match its side',
    'រៀបការហើយឬនៅ': 'the same question as តើអ្នករៀបការហើយឬនៅ "are you married?", without "you"',
    'ឯងរៀបការហើយឬនៅ': 'the same question as តើអ្នករៀបការហើយឬនៅ, to a friend; one English side per card',
    'អានរក': 'an expletive ("damn you!")',
    'ក្រាប': 'a command to soldiers ("get down!") under a word for "to bow"',
    'ស្វាហៈ': 'a ritual response at the end of a Brahmanic invocation',
    'ករុណា': 'the layperson\'s "yes" to royalty',
    'ក្តុក': 'a sound (of a falling object)', 'ក្រុកៗ': 'a sound (a hen clucking)',
    'ង៉ាវៗ': 'a sound (a cat\'s meow)',
    # THE SAME ENGLISH SIDE TWICE: one form is taught (the reverse card needs one answer)
    'អរុណសុវត្ថិ': '"good morning" again; the deck teaches អរុណសួស្តី',
    'សុភោជន': '"bon appétit" again; the deck teaches អញ្ជើញពិសាឲ្យបានឆ្ងាញ់',
    'សុរសភោជន': '"bon appétit" again; the deck teaches អញ្ជើញពិសាឲ្យបានឆ្ងាញ់',
    'សូមកុំជក់បារី': '"no smoking" again; the deck teaches ហាមជក់បារី',
}

# Tatoeba sentences left out, by Khmer sentence number, each with its reason.
DROP = {}


def taught():
    out = set()
    for f in LEVELS:
        for c in json.load(open(os.path.join(DECKS, f + '.folio-deck.json'), encoding='utf-8'))['cards']:
            out.add(key(c['fields']['Word']))
    return out


def wiktionary():
    """headword -> (pos, [gloss], pointer?) for every phrase, interjection and proverb."""
    out = {}
    for line in open(os.path.join(CACHE, 'kaikki-km.jsonl'), encoding='utf-8'):
        e = json.loads(line)
        if e.get('pos') not in ('phrase', 'intj', 'proverb'):
            continue
        w = nfc(e['word'])
        senses = e.get('senses', [])
        ptr = all('alt_of' in s or 'form_of' in s or 'alt-of' in (s.get('tags') or []) for s in senses)
        gl = [g for s in senses for g in s.get('glosses', [])[-1:]]
        rom = next((f['form'] for f in e.get('forms', []) if 'romanization' in (f.get('tags') or [])), '')
        if w not in out:
            out[w] = [e['pos'], gl, ptr, nfc(rom)]
        else:                             # a second entry (អរគុណ: intj and verb is not here)
            out[w][1] += gl
    return out


def tatoeba():
    """[(khmer id, khmer, english)] -- each sentence once, with its shortest English."""
    links = {}
    for line in open(os.path.join(CACHE, 'khm-eng_links.tsv'), encoding='utf-8'):
        p = line.split()
        if len(p) == 2:
            links.setdefault(p[0], []).append(p[1])
    want = {b for v in links.values() for b in v}
    eng = {}
    for line in open(os.path.join(CACHE, 'eng_sentences.tsv'), encoding='utf-8'):
        i, _, t = line.rstrip('\n').split('\t', 2)
        if i in want:
            eng[i] = t
    out = []
    for line in open(os.path.join(CACHE, 'khm_sentences_detailed.tsv'), encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        en = sorted((eng[b] for b in links.get(p[0], []) if b in eng), key=lambda s: (len(s), s))
        if en:
            out.append((p[0], fold(p[2]), en[0]))
    return out


def sense(pos, text):
    return f'<div class="uc-sense"><div class="uc-pos">{E(pos)}</div><div class="uc-gl">{E(text)}</div></div>'


def main():
    below = taught()
    W = wiktionary()
    lex = json.load(open(os.path.join(CACHE, 'lex.json'), encoding='utf-8'))
    seg = Segmenter(lex)
    for w, (pos, gl, ptr, _) in W.items():
        if ptr or key(w) in below or w in PHRASES or w in LEFT_OUT:
            continue
        if pos == 'intj' and len(seg.segment(w)) < 2 and w not in ONE_WORD:
            continue                      # a one-word interjection: a sound or a level word
        raise SystemExit(f'Wiktionary has a new {pos} entry, {w}: add it to PHRASES or LEFT_OUT')
    cwd = os.getcwd()
    os.chdir(CACHE)
    import romanise
    tr = romanise.fetch(set(PHRASES))
    os.chdir(cwd)

    cards, seen, sides = [], set(below), set()
    for w in PHRASES:
        pos, gl, ptr, rom = W[w]
        assert not ptr and key(w) not in below, w + ' is a pointer or taught by a level deck'
        lab = {'intj': 'interjection', 'phrase': 'phrase', 'proverb': 'proverb'}[pos]
        g = re.sub(r'\s*\(Classifier[^)]*\)', '', gl[0]).strip()
        side = sense(lab, g)
        assert side not in sides, w + ' shares its English side'
        sides.add(side)
        seen.add(key(w.replace(' ', '')))
        cards.append({'sub': 'Phrases', 'fields': {
            'Khmer': E(w), 'Roman': E(tr.get(w) or rom), 'Word': w,
            'English': side, 'Forms': '', 'Examples': ''}})
    n_phr = len(cards)

    sents = []
    for kid, km_, en in tatoeba():
        if kid in DROP or re.search(r'[^ក-៝ ?!]', km_) or re.search(r'[០-៩]', km_):
            continue
        words = seg.segment(km_)
        if not words or len(words) > MAX_WORDS:
            continue
        bare = key(re.sub(r'[\s?!។]', '', km_))
        if bare in seen:
            continue
        seen.add(bare)
        sents.append((len(words), int(kid), km_, en))
    used_en = set()
    for _, kid, km_, en in sorted(sents):
        if en in used_en:
            continue                      # one English side per card: the first is kept
        used_en.add(en)
        cards.append({'sub': 'Sentences', 'fields': {
            'Khmer': E(km_), 'Roman': '', 'Word': km_,
            'English': sense(f'sentence · Tatoeba #{kid}', en), 'Forms': '', 'Examples': ''}})
    n_sen = len(cards) - n_phr
    for i, c in enumerate(cards, 1):
        c['id'] = f'u_{DECK}_{i}'
        c['type'] = B.TYPE_ID
    n = len(cards)
    desc = (
        "Khmer said whole: greetings, the phrasebook questions a visitor needs, wishes, signs, a "
        "few exclamations, a proverb, and a large set of short everyday sentences. Both study "
        "directions, each a card of its own: Khmer → English and English → Khmer. "
        f"{n_phr} PHRASES are the phrases, set greetings and proverbs English Wiktionary has for "
        "Khmer that the level decks do not teach, with Wiktionary's own meaning and romanisation: "
        "អរុណសួស្តី 'good morning' and រាត្រីសួស្ដី 'good night', ស្វាគមន៍ 'welcome', គ្មានបញ្ហា 'no "
        "problem', តើអ្នកនិយាយភាសាអង់គ្លេសទេ? 'do you speak English?', ថ្លៃទេ? 'how much does it "
        "cost?', រីករាយថ្ងៃខួបកំណើត 'happy birthday', ហាមជក់បារី 'no smoking', and the "
        "proverb ចាបមួយនៅដៃប្រសើរក្រៃ ជាងចាបដប់នៅលើឈើ, 'a bird in the hand is worth two in the bush'. "
        f"{n_sen} SENTENCES are Tatoeba's short Khmer sentences (eight words at most) with their "
        "English translation, printed as Tatoeba has them, each card giving the sentence's Tatoeba "
        "number so it can be traced to its author; where two Khmer sentences share an English one, "
        "only the first is a card, so every English side has one answer. They carry no "
        "romanisation (Tatoeba gives none): the Khmer Alphabet deck teaches the script, and the "
        "level decks the words. THE PHRASES ARE FEW BECAUSE THE SOURCE IS: Wiktionary files about "
        "forty Khmer entries as phrases and none as idioms, so nothing here is invented and the "
        "deck is not padded. It is not a CEFR level, and nothing the level decks teach is "
        "repeated. There is no speaker button: few devices have a Khmer voice. Sources: English "
        "Wiktionary, via the kaikki.org extraction and the entries' pages (CC BY-SA 4.0); Tatoeba "
        "(tatoeba.org), CC BY 2.0 FR."
    )
    meta = {
        'id': DECK, 'title': 'Khmer Phrases and Expressions',
        'subtitle': f'{n} phrases and sentences · {n_phr} phrases, {n_sen} sentences · both directions',
        'desc': desc, 'author': '', 'language': 'en', 'color': B.COLOR,
        'tags': ['khmer', 'cambodian', 'phrases', 'greetings', 'sentences'],
        'glossMode': 'site',
        'types': {B.TYPE_ID: {
            'id': B.TYPE_ID, 'name': 'Khmer vocabulary', 'speechLang': 'km-KH', 'fields': B.FIELDS,
            'cards': [
                {'name': 'Khmer → English', 'front': B.FRONT_KM, 'back': B.BACK_KM},
                {'name': 'English → Khmer', 'front': B.FRONT_EN, 'back': B.BACK_EN},
            ],
            'css': B.CSS,
        }},
        'version': 1, 'createdAt': B.STAMP, 'updatedAt': B.STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': B.STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.join(DECKS, OUT)
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out)
    print(f'  notes {n} ({n_phr} phrases, {n_sen} sentences) = cards {n * 2} | bytes {os.path.getsize(out)}')


if __name__ == '__main__':
    main()
