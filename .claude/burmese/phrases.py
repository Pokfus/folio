#!/usr/bin/env python3
"""Write the Burmese phrases deck: `decks/Burmese-Phrases-and-Expressions.folio-deck.json`.

    python3 .claude/burmese/phrases.py      (reads .claude/burmese-cache/: kaikki-my.jsonl and Tatoeba)

Asked for on 2026-11-16 ("Add a phrases deck").  Not a CEFR level; the Amharic and Zulu
arrangement, with a third subdeck because English Wiktionary has about forty Burmese proverbs:

  Phrases    Wiktionary's own phrase and interjection entries that the level decks do not
             teach, in the hand order of `PHRASES` (greetings first).  Wiktionary's gloss
             (up to two senses) and its IPA; the register Wiktionary gives (polite, informal,
             colloquial, slang), and `LABEL` where two phrases share an English meaning
             (plain or polite; said by a man or a woman; formal or familiar).
  Proverbs   Wiktionary's proverb entries, in its order, each with Wiktionary's explanation
             (and its literal translation, where Wiktionary gives one) and its IPA.
  Sentences  Tatoeba's Burmese sentences with their English translation, at most FIFTEEN
             syllables, printed as Tatoeba has them, each with its Tatoeba number.  Shortest
             first, then by Tatoeba number.  No reading: Tatoeba gives none.

ONE ENGLISH SIDE PER CARD (the reverse card must have one answer).  Tatoeba often has two or
three Burmese sentences for one English one, and Burmese marks who is speaking: where the
sentences differ by the pronoun they use, the card says so from that pronoun (`SPEAKER`:
ကျွန်တော် / ကျနော် said by a man, ကျွန်မ / ကျမ said by a woman, ငါ familiar).  Otherwise, and
for two sentences said by the same speaker, the shorter is kept.  A sentence that is a phrase
or proverb above, or a word a level teaches, is left out, and `DROP` names each other sentence
left out and why (mistyped, mistranslated, not everyday).

No corpus is counted, so a re-run is byte-identical whenever the cached sources are.

SOURCES: English Wiktionary via kaikki.org (CC BY-SA 4.0); Tatoeba (CC BY 2.0 FR), each
sentence's number on its card so it can be traced to its author.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('BURMESE_LEVEL', 'a1')     # build_deck reads a level at import; only its templates are used
from my import norm, syllables, runs, Cutter
import build_deck as B

E = lambda s: html.escape(s, quote=True)
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '..', 'burmese-cache')
DECKS = os.path.join(HERE, '..', '..', 'decks')
OUT = 'Burmese-Phrases-and-Expressions.folio-deck.json'
DECK = 'myphrase'
MAX_SYLLABLES = 15
LEVELS = ('Burmese-A1', 'Burmese-A2', 'Burmese-B1', 'Burmese-B2')

# The hand order: greetings and politeness, the phrasebook, wishes, exclamations.
PHRASES = [
    'စားပြီးပြီလား', 'နေကောင်းရဲ့လား', 'တွေ့ရတာ ဝမ်းသာပါတယ်', 'ကြိုဆိုပါ၏', 'ဟဲလို', 'အမိန့်ရှိပါ',
    'ဒါပါပဲ', 'ကျေးဇူးတင်ပါတယ်', 'ကိစ္စမရှိပါဘူး', 'ကိစ္စမရှိဘူး', 'နေပါစေ',
    'အင်း', 'ဟင့်အင်း', 'ဟုတ်လား', 'မသိဘူး', 'မသိပါဘူး',
    'အဲဒါဘာလဲ', 'ဘယ်လောက်လဲ', 'ကျွန်တော် မြန်မာပါ', 'ကျွန်မ မြန်မာပါ',
    'မင်းလက်ထပ်ပြီးပြီလား', 'မင်းအိမ်ထောင်ရှိလား', 'သင်လက်ထပ်ပြီးပြီလား', 'သင်အိမ်ထောင်ရှိလား',
    'အမဲသားမစားပါဘူး', 'ရေငတ်တယ်', 'ဆေးလိပ်မသောက်ရ',
    'မွေးနေ့မင်္ဂလာပါ', 'နှစ်သစ်ကူး မင်္ဂလာပါ',
    'ဪ', 'ဟ', 'ဟာ', 'ဟယ်', 'ဟင်', 'ဟိတ်', 'ကြံကြံစည်စည်', 'ပလပ်ကျွတ်',
]

# Wiktionary's interjection and phrase entries NOT taught here (beyond those a level teaches,
# which are left out as spelt), with the reason.
LEFT_OUT = {
    'ကျေးဇူးပြု၍': 'Wiktionary gives it no gloss',
    'ဗိုက်ဆာတယ်': 'Wiktionary glosses it "I\'m thirsty", the gloss of ရေငတ်တယ်; ဗိုက်ဆာ "to be hungry" is A1\'s',
    'စောက်': 'a vulgar interjection',
    'မအလ': 'an abbreviation of a vulgar insult',
    'မြန်မာလိုကြီး': 'derogatory internet slang',
    'နိုင်းကျော်တယ်': 'Wiktionary gives it no reading',
}

# Two phrases sharing an English meaning, told apart by what Wiktionary says of each.
LABEL = {
    'ကိစ္စမရှိပါဘူး': 'polite', 'ကိစ္စမရှိဘူး': 'plain',
    'မသိဘူး': 'plain',
    'ကျွန်တော် မြန်မာပါ': 'said by a man', 'ကျွန်မ မြန်မာပါ': 'said by a woman',
    'မင်းလက်ထပ်ပြီးပြီလား': 'familiar', 'မင်းအိမ်ထောင်ရှိလား': 'familiar',
    'သင်လက်ထပ်ပြီးပြီလား': 'formal', 'သင်အိမ်ထောင်ရှိလား': 'formal',
}

# Proverbs left out, with the reason.
PROVERBS_LEFT_OUT = {
    'မိုးရွာတုန်း ရေခံ': 'shares its gloss "make hay while the sun shines" with လသာတုန်း ဗိုင်းငင်, which is kept',
    'ကုလားမနိုင် ရခိုင်မဲ': 'turns on ကုလား, a word for people of South Asian descent widely held to be offensive',
    'ကုလားအချုပ်၊ တရုတ်အခြယ်': 'turns on ကုလား, a word widely held to be offensive',
    'ကုလားအချုပ်၊ တရုတ်အထည်': 'turns on ကုလား, a word widely held to be offensive',
}

REGISTER = {'polite': 'polite', 'informal': 'informal', 'colloquial': 'colloquial',
            'slang': 'slang', 'formal': 'formal', 'literary': 'literary'}

# Who is speaking, from the first-person pronoun a Tatoeba sentence uses.
SPEAKER = {'ကျွန်တော်': 'said by a man', 'ကျွန်တော့်': 'said by a man', 'ကျနော်': 'said by a man',
           'ကျနော့်': 'said by a man', 'ကျွန်တော်တို့': 'said by a man',
           'ကျွန်မ': 'said by a woman', 'ကျမ': 'said by a woman',
           'ငါ': 'familiar', 'ငါ့': 'familiar', 'ငါတို့': 'familiar'}

# Tatoeba sentences left out, by Burmese sentence number, each with its reason.
DROP = {
    '3189936': 'ကျေးဇူးတန်ပါတယ် is mistyped (ကျေးဇူးတင်ပါတယ် "thank you" is a phrase above)',
    '4455698': 'mistyped (ကျွန်တောတို့ for ကျွန်တော်တို့)',
    '4457436': 'mistyped (ကျောင်သား for ကျောင်းသား)',
    '8273631': 'mistyped (ကျေးဇူးပြပြီး for ကျေးဇူးပြုပြီး)',
    '8273929': 'mistyped (မင်က for မင်းက)',
    '5661809': 'mistyped (ပြော့ for ပျော့ "soft")',
    '5815241': 'mistyped (နုတ်ဆက် for နှုတ်ဆက်)',
    '8273967': 'mistyped (ဦ for ဦး)',
    '8274092': 'mistyped (ဦ for ဦး)',
    '8274032': 'mistyped (သေခြာ for သေချာ)',
    '8274055': 'mistyped (a doubled asat in ခွင့််)',
    '8274084': 'incomplete: "from on the bed" with no verb of getting out',
    '8289561': 'mistyped (လှည့်ဖို for လှည့်ဖို့)',
    '8274754': 'mistyped (ကင်စင်း for ကင်းစင်)',
    '8289588': 'mistyped (ပျော်ရွင် for ပျော်ရွှင်)',
    '8289643': 'mistyped (ထိုင်နိုင်ငံ for ထိုင်းနိုင်ငံ)',
    '8289646': 'mistyped (ခရီးဆန့် ခဲသည်)',
    '7239157': 'mistyped (ဥယျဉ် for ဥယျာဉ်); the sentence with the right spelling is kept',
    '5172789': 'says နက်ဖြန် "tomorrow", not the "now" of its English',
    '5172790': 'says နက်ဖြန် "tomorrow", not the "now" of its English',
    '5172791': 'says နက်ဖြန် "tomorrow", not the "now" of its English',
    '8273991': 'ပြုံးမယ် is "I will smile", not the imperative "Smile."',
    '8274027': 'is the imperative "Try!", not the "You tried." it is paired with',
    '8274443': 'says အမြဲတမ်း "always" where the English asks "ever"',
    '8274445': 'says အမြဲ "always" where the English asks "ever"',
    '8274385': 'is "whoever wins, I will be surprised", not "I\'m wondering who\'ll win"',
    '8274229': 'is "ask yourself the question", not "you just answered your own question"',
    '8274477': 'is "I must make myself able to play", not "I wish I could play"',
    '8274487': 'says ထင်တယ် "I think", not "is supposed to"',
    '8273973': 'a slang wording; ချီးယား, the toast, is kept',
    '8273998': '"Shoot!": not an everyday sentence',
    '8289575': '"Attack!": not an everyday sentence',
    '8289576': '"Attack!": not an everyday sentence',
    '10638004': '"Die!": a curse, not an everyday sentence',
    '13069399': '"Die.": a curse, not an everyday sentence',
    '10630849': '"I am ready to die": not an everyday sentence',
    '10630851': '"I am ready for death": not an everyday sentence',
    '10630856': '"Tom wasn\'t ready to die": not an everyday sentence',
    '12603478': '"Yanni was buried alive": not an everyday sentence',
    '12603513': 'mistyped (ထမင်းလုံးတစ္စေ) and not an everyday sentence',
    '10630798': 'a book\'s title in brackets, transliterated from Japanese',
    '8289633': 'the proverb ကုလားမနိုင် ရခိုင်မဲ, left out of the proverbs for ကုလား',
}


def bare(s):
    """A phrase or sentence as letters only: no spaces, punctuation or quotation marks."""
    return ''.join(runs(s))


def taught():
    out = set()
    for f in LEVELS:
        for c in json.load(open(os.path.join(DECKS, f + '.folio-deck.json'), encoding='utf-8'))['cards']:
            out.add(c['fields']['Word'])
    return out


def wiktionary():
    """headword -> [ipa, pos, [glosses], {tags}] for every phrase, interjection or proverb."""
    out = {}
    for line in open(os.path.join(CACHE, 'kaikki-my.jsonl'), encoding='utf-8'):
        e = json.loads(line)
        if e.get('pos') not in ('phrase', 'intj', 'proverb'):
            continue
        ipa = next((s['ipa'] for s in e.get('sounds', []) if s.get('ipa')), '')
        # a proverb's IPA can carry the Burmese comma ၊ between its halves: the reading takes a Latin one
        ipa = ipa.strip().strip('/[]').replace('၊', ',').replace('။', '.')
        w = out.setdefault(norm(e['word']).strip(), [ipa, e['pos'], [], set()])
        for s in e.get('senses', []):
            w[3].update(s.get('tags', []))
            if s.get('glosses'):
                w[2].append(s['glosses'][-1])
    return out


def tatoeba():
    links = {}
    for line in open(os.path.join(CACHE, 'mya-eng_links.tsv'), encoding='utf-8'):
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
    for line in open(os.path.join(CACHE, 'mya_sentences_detailed.tsv'), encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        en = sorted(int(b) for b in links.get(p[0], []) if b in eng)
        if en:
            out.append((p[0], norm(p[2]).strip(), eng[str(en[0])]))
    return out


def sense(pos, text):
    return (f'<div class="uc-sense"><div class="uc-pos">{E(pos)}</div>'
            f'<div class="uc-gl">{E(text)}</div></div>')


def card(sub, word, roman, side):
    return {'sub': sub, 'fields': {
        'Burmese': f'<div class="uc-word">{E(word)}</div>', 'Roman': E(roman), 'Word': word,
        'English': side, 'Forms': '', 'Examples': ''}}


def main():
    below = taught()
    W = wiktionary()
    for w, (_, pos, gl, _) in W.items():
        if pos == 'proverb' or w in PHRASES or w in LEFT_OUT or w in below:
            continue
        raise SystemExit(f'Wiktionary has a new {pos} entry, {w}: add it to PHRASES or LEFT_OUT')
    cards, seen, sides = [], set(), set()

    for w in PHRASES:
        ipa, pos, gl, tags = W[w]
        assert w not in below, w + ' is taught by a level deck'
        assert ipa, w + ' has no reading'
        if w == 'ကိစ္စမရှိဘူး':                       # "alternative form of ကိစ္စမရှိပါဘူး": its gloss
            gl = W['ကိစ္စမရှိပါဘူး'][2]
        lab = {'intj': 'interjection', 'phrase': 'phrase'}[pos]
        reg = [REGISTER[t] for t in ('polite', 'informal', 'colloquial', 'slang', 'formal') if t in tags]
        extra = LABEL.get(w)
        if extra:
            reg = [r for r in reg if r not in ('polite', 'formal')] + [extra]
        if reg:
            lab += ' · ' + ', '.join(reg)
        text = '; '.join(B.lower_first(g) for g in gl[:2])
        side = sense(lab, text)
        assert side not in sides, w
        sides.add(side)
        seen.add(bare(w))
        cards.append(card('Phrases', w, ipa, side))
    n_phr = len(cards)

    for w, (ipa, pos, gl, tags) in W.items():
        if pos != 'proverb' or w in PROVERBS_LEFT_OUT:
            continue
        assert ipa and gl, w
        side = sense('proverb', gl[0])
        assert side not in sides, w
        sides.add(side)
        seen.add(bare(w))
        cards.append(card('Proverbs', w, ipa, side))
    n_prov = len(cards) - n_phr

    cutter = Cutter(json.load(open(os.path.join(CACHE, 'lex.json'), encoding='utf-8'))['lemmas'].keys()
                    | set(SPEAKER))
    sents = []
    for mid, my, en in tatoeba():
        if mid in DROP:
            continue
        n = sum(len(syllables(r)) for r in runs(my))
        b = bare(my)
        if not n or n > MAX_SYLLABLES or b in seen or b in below:
            continue
        seen.add(b)
        who = next((SPEAKER[t] for t in cutter.tokens(my) if t in SPEAKER), None)
        sents.append((n, int(mid), my, en, who))
    groups = {}
    for s in sents:
        groups.setdefault(s[3], []).append(s)
    used = set()
    for n, mid, my, en, who in sorted(sents):
        whos = {x[4] for x in groups[en]}
        label = who if len(groups[en]) > 1 and len(whos) > 1 and who else None
        if (en, label) in used:
            continue                 # the same English, by the same speaker: the shorter is kept
        used.add((en, label))
        lab = f'sentence · Tatoeba #{mid}' + (f' · {label}' if label else '')
        cards.append(card('Sentences', my, '', sense(lab, en)))
    n_sen = len(cards) - n_phr - n_prov

    for i, c in enumerate(cards, 1):
        c['id'] = f'u_{DECK}_{i}'
        c['type'] = B.TYPE_ID
    n = len(cards)
    desc = (
        "Burmese said whole: greetings, the phrasebook questions a visitor needs, wishes and "
        "exclamations, the proverbs, and a set of short everyday sentences. Both study directions, "
        "each a card of its own: Burmese → English and English → Burmese. "
        f"{n_phr} PHRASES are the phrases and interjections English Wiktionary has for Burmese that "
        "the level decks do not teach, with Wiktionary's own meaning and its pronunciation in IPA: "
        "စားပြီးပြီလား 'have you eaten?' (an everyday 'hello'), နေကောင်းရဲ့လား 'how are you?', "
        "ကျေးဇူးတင်ပါတယ် 'thank you', ဘယ်လောက်လဲ 'how much?', မွေးနေ့မင်္ဂလာပါ 'happy "
        "birthday' — where two say the same thing the card says which is polite or plain, said "
        "by a man or a woman, formal or familiar. "
        f"{n_prov} PROVERBS are Wiktionary's Burmese proverbs with its explanation and, where it "
        "gives one, the literal meaning. "
        f"{n_sen} SENTENCES are Tatoeba's short Burmese sentences (fifteen syllables at most) with "
        "their English translation, printed as Tatoeba has them, each card giving the sentence's "
        "Tatoeba number; where two share an English one, the card says from the pronoun it uses "
        "whether a man or a woman is speaking, or a familiar ငါ. Sentences with a typing slip or a "
        "translation that does not match are left out. They carry no pronunciation (Tatoeba gives "
        "none): the Alphabet deck teaches the letters. "
        "THE DECK IS AS LARGE AS THE SOURCES: nothing here is invented and nothing is padded. It is "
        "not a CEFR level, and nothing the level decks teach is repeated (မင်္ဂလာပါ 'hello' and "
        "ရပါတယ် 'you're welcome' are in A1). There is no speaker button: few devices have a "
        "Burmese voice. Sources: English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0); "
        "Tatoeba (tatoeba.org), CC BY 2.0 FR."
    )
    meta = {
        'id': DECK, 'title': 'Burmese Phrases and Expressions',
        'subtitle': (f'{n} phrases, proverbs and sentences · {n_phr} phrases, {n_prov} proverbs, '
                     f'{n_sen} sentences · both directions'),
        'desc': desc, 'author': '', 'language': 'en', 'color': B.COLOR,
        'tags': ['burmese', 'phrases', 'proverbs', 'greetings', 'sentences'],
        'glossMode': 'site',
        'types': {B.TYPE_ID: {
            'id': B.TYPE_ID, 'name': 'Burmese vocabulary', 'speechLang': 'my-MM', 'fields': B.FIELDS,
            'cards': [
                {'name': 'Burmese → English', 'front': B.FRONT_MY, 'back': B.BACK_MY},
                {'name': 'English → Burmese', 'front': B.FRONT_EN, 'back': B.BACK_EN},
            ],
            'css': B.CSS,
        }},
        'version': 1, 'createdAt': B.STAMP, 'updatedAt': B.STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': B.STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(DECKS, OUT))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out)
    print(f'  notes {n} ({n_phr} phrases, {n_prov} proverbs, {n_sen} sentences) = cards {n * 2} '
          f'| bytes {os.path.getsize(out)}')


if __name__ == '__main__':
    main()
