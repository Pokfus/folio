#!/usr/bin/env python3
"""Everything one note is made of, shared by every Japanese deck: the senses, the furigana, the romaji, the
kanji rows, the compounds and the example sentences.  Nothing here is level-specific.

THE RULE FOR EVERY FIELD: what a source does not give, the card does not show.  No gloss, reading, part or
sentence is composed here; a field with nothing behind it is left empty and its template section vanishes.
"""
import html, re
from collections import defaultdict
from common import load, kata2hira, is_kana, is_kanji, romaji

JM = load('jmdict.json')
KJ = load('kanji.json')
FURI = load('furigana.json')
FREQ = load('freq.json')
TAT = load('tatoeba.json')

esc = lambda s: html.escape(s or '', quote=True)

# ------------------------------------------------------------------------------ parts of speech
# JMdict's own entity names, said in plain English.  A verb's CLASS is the part a learner needs (it is how
# the verb conjugates), so it is named; transitivity is added from vt/vi.
POS = {
 'n': 'noun', 'n-adv': 'adverbial noun', 'n-t': 'noun (time)', 'n-suf': 'noun, used as a suffix',
 'n-pref': 'noun, used as a prefix', 'n-pr': 'proper noun', 'pn': 'pronoun', 'num': 'numeral', 'ctr': 'counter',
 'adj-i': 'i-adjective', 'adj-ix': 'i-adjective (yoi/ii)', 'adj-na': 'na-adjective', 'adj-no': 'takes の',
 'adj-pn': 'pre-noun adjectival', 'adj-t': 'taru adjective', 'adj-f': 'used before a noun',
 'adv': 'adverb', 'adv-to': 'adverb, takes と', 'conj': 'conjunction', 'int': 'interjection',
 'prt': 'particle', 'aux': 'auxiliary', 'aux-v': 'auxiliary verb', 'aux-adj': 'auxiliary adjective',
 'cop': 'copula', 'exp': 'expression', 'pref': 'prefix', 'suf': 'suffix', 'unc': '',
 'v1': 'ichidan verb', 'v1-s': 'ichidan verb (kureru)', 'vk': 'irregular verb (kuru)',
 'vs': 'takes する', 'vs-i': 'irregular verb (suru)', 'vs-s': 'suru verb', 'vz': 'ichidan verb (-zuru)',
 'vs-c': 'su verb', 'v5aru': 'godan verb (-aru)', 'v5k-s': 'godan verb (iku/yuku)', 'v5r-i': 'godan verb, irregular',
 'v5u-s': 'godan verb, irregular', 'vn': 'irregular nu verb', 'vr': 'irregular ru verb',
}
for k in 'bgkmnrstu':
    POS['v5' + k] = 'godan verb'
VT = {'vt': 'transitive', 'vi': 'intransitive'}
DROP_MISC = {'arch', 'obs', 'rare', 'obsc', 'dated'}
REG = {'hon': 'honorific', 'hum': 'humble', 'pol': 'polite', 'col': 'colloquial', 'sl': 'slang',
       'fam': 'familiar', 'male': 'used by men', 'fem': 'used by women', 'vulg': 'vulgar', 'derog': 'derogatory',
       'form': 'formal', 'abbr': 'abbreviation', 'on-mim': 'onomatopoeia', 'yoji': 'four-character idiom',
       'id': 'idiom', 'proverb': 'proverb', 'chn': "children's language", 'joc': 'jocular', 'poet': 'poetic'}


def pos_label(pos, misc):
    names, extra = [], []
    for p in pos:
        if p in VT:
            extra.append(VT[p])
        elif POS.get(p):
            if POS[p] not in names:
                names.append(POS[p])
    names += extra
    names += [REG[m] for m in misc if m in REG and REG[m] not in names]
    return ', '.join(names)


def senses(seq, form, reading, cap=3):
    """The senses that apply to this spelling and reading, archaic and rare ones dropped, at most `cap`."""
    out = []
    for s in JM[seq]['s']:
        if s['stagk'] and form and form not in s['stagk']:
            continue
        if s['stagr'] and reading not in s['stagr']:
            continue
        if set(s['misc']) & DROP_MISC or not s['gloss']:
            continue
        out.append(s)
        if len(out) >= cap:
            break
    if not out:
        # AN ENTRY WHOSE EVERY SENSE IS MARKED RARE still has a meaning; better its rare sense than no card
        out = [s for s in JM[seq]['s'] if s['gloss'] and (not s['stagr'] or reading in s['stagr'])][:cap]
    return out


def usually_kana(seq, form, reading):
    ss = senses(seq, form, reading, cap=1)
    return bool(ss) and 'uk' in ss[0]['misc']


def english_html(ss, gl_cap=4):
    rows, last = [], None
    for s in ss:
        lab = pos_label(s['pos'], s['misc'])
        gl = '; '.join(s['gloss'][:gl_cap])
        head = '<div class="uc-pos">%s</div>' % esc(lab) if lab and lab != last else ''
        last = lab or last
        rows.append('<div class="uc-sense">%s<div class="uc-gl">%s</div></div>' % (head, esc(gl)))
    return ''.join(rows)


def first_gloss(seq, form, reading):
    ss = senses(seq, form, reading, cap=1)
    return ss[0]['gloss'][0] if ss else ''


# ------------------------------------------------------------------------------ furigana
def _align(surface, reading):
    """Ruby for one run whose reading is known: the kana it shares with its reading at either end stay bare,
    the middle carries the reading.  Never wrong -- at worst a group reading over several kanji."""
    h = kata2hira(surface)
    a = 0
    while a < len(h) and a < len(reading) and h[a] == reading[a] and not is_kanji(surface[a]):
        a += 1
    b = 0
    while b < len(h) - a and b < len(reading) - a and h[-1 - b] == reading[-1 - b] and not is_kanji(surface[-1 - b]):
        b += 1
    mid, rmid = surface[a:len(surface) - b], reading[a:len(reading) - b]
    if not mid or not rmid:
        return esc(surface)
    return esc(surface[:a]) + '<ruby>%s<rt>%s</rt></ruby>' % (esc(mid), esc(rmid)) + esc(surface[len(surface) - b:])


def furigana(form, reading):
    """The headword's furigana, from JmdictFurigana (character-by-character), else the aligned group form."""
    if not form or is_kana(form):
        return esc(form or reading)
    segs = FURI.get(form + '|' + reading)
    if segs:
        return ''.join('<ruby>%s<rt>%s</rt></ruby>' % (esc(r), esc(t)) if t else esc(r) for r, t in segs)
    return _align(form, reading)


# ------------------------------------------------------------------------------ kanji rows
def _kun(k):
    # KANJIDIC writes た.べる (stem.okurigana) and -か for a suffix form; shown as た(べる) and -か
    return k.replace('.', '(') + ')' if '.' in k else k


def kanji_html(form, cap=4):
    rows, seen = [], set()
    for ch in form or '':
        if not is_kanji(ch) or ch in seen or ch not in KJ or not KJ[ch]['m']:
            continue
        seen.add(ch)
        k = KJ[ch]
        rd = []
        if k['on']:
            rd.append('<span class="uc-kjl">on</span>' + esc('、'.join(k['on'][:3])))
        if k['kun']:
            rd.append('<span class="uc-kjl">kun</span>' + esc('、'.join(_kun(x) for x in k['kun'][:3])))
        parts = [p for p in k.get('p', []) if p in KJ and KJ[p]['m'] and p != ch]
        pt = ''
        if parts:
            pt = '<div class="uc-kjp"><span class="uc-kjl">parts</span>' + ' · '.join(
                '<b>%s</b> %s' % (esc(p), esc(KJ[p]['m'][0])) for p in parts) + '</div>'
        rows.append('<div class="uc-kj"><span class="uc-kjc">%s</span><div><div class="uc-kjm">%s</div>'
                    '<div class="uc-kjr">%s</div>%s</div></div>'
                    % (esc(ch), esc(', '.join(k['m'][:cap])), ' &nbsp; '.join(rd), pt))
        if len(rows) >= 4:
            break
    return ''.join(rows)


# ------------------------------------------------------------------------------ compounds
def compounds_html(ch, universe, own_seq, cap=4):
    """Words of the JLPT lists built on this one kanji (the deck's own vocabulary, lowest level first)."""
    picks = []
    for w in universe:
        if w['seq'] == own_seq or not w['form'] or ch not in w['form'] or len(w['form']) < 2:
            continue
        g = first_gloss(w['seq'], w['form'], w['reading'])
        if not g:
            continue
        picks.append(w)
        if len(picks) >= cap:
            break
    if not picks:
        return ''
    out = ['<span class="uc-cmplab">built on this kanji</span>']
    for w in picks:
        out.append('<div class="uc-cmpi"><span class="uc-cmpw">%s</span><span class="uc-cmpp">%s</span>'
                   '<span class="uc-cmpg">%s</span></div>'
                   % (esc(w['form']).replace(esc(ch), '<b>%s</b>' % esc(ch)), esc(w['reading']),
                      esc(first_gloss(w['seq'], w['form'], w['reading']))))
    return ''.join(out)


# ------------------------------------------------------------------------------ example sentences
# A KANJI SPELLING THAT TWO DIFFERENT WORDS SHARE, each common (今日 きょう / こんにち, 一日 いちにち / ついたち,
# 上手 じょうず / うわて).  Only for these must a sentence's reading agree before the sentence is used; for every
# other spelling the kanji ARE the word, and the analyser's reading is the less reliable of the two -- it reads
# the 母 of お母さん as はは and the 日 of 月曜日 as ひ.
_RD = defaultdict(set)
for _seq, _e in JM.items():
    for _k in _e['k']:
        if not _k['pri']:
            continue
        for _r in _e['r']:
            if not _r['restr'] or _k['t'] in _r['restr']:
                _RD[_k['t']].add((_seq, _r['t']))
HOMO = {k for k, v in _RD.items() if len({seq for seq, _ in v}) > 1 and len({r for _, r in v}) > 1}

AUX_TE = {'いる', 'ある', 'おく', 'みる', 'しまう', 'いく', 'くる', 'ゆく', 'もらう', 'あげる', 'くれる'}

SKIP_POS = {'助詞', '助動詞', '補助記号', '記号', '空白', '接頭辞', '接尾辞'}
LATIN = re.compile(r'[A-Za-zＡ-Ｚａ-ｚ]')

IDX = defaultdict(list)      # orthBase / lemma -> sentence indexes
for i, r in enumerate(TAT):
    for tk in r['t']:
        for key in {tk[1], tk[2]}:
            if not IDX[key] or IDX[key][-1] != i:
                IDX[key].append(i)


def _ok_sentence(r):
    ja, en = r['ja'], r['en']
    return 4 <= len(ja) <= 30 and len(en) <= 90 and not LATIN.search(ja) and ja[-1] in '。？！?!」'


def _match(r, cands, reading, form=''):
    """Token span(s) of the headword in sentence r, or None.  One token whose dictionary form is the word
    (with its reading agreeing), else a run of tokens that spells it exactly at token boundaries."""
    t = r['t']
    for i, (surf, lem, base, pos, kana) in enumerate(t):
        if base in cands or lem in cands:
            # A KANA SPELLING IS SHARED BY HOMOGRAPHS -- いる "to be" (居る) and いる "to need" (要る) -- and
            # UniDic's lemma carries the kanji that tells them apart, so a word matched on its kana must agree
            # with that lemma wherever the lemma is not itself kana.
            if form and base not in (form,) and lem != form and not is_kana(lem):
                continue
            if surf == base:
                if kana and kana != reading and not is_kana(surf) and surf in HOMO:
                    continue
            elif kana and reading and kana[:1] != reading[:1]:
                continue
            # いる, ある, みる, おく AFTER て/で are auxiliaries (作っている is "is making"), not the word itself
            if base in AUX_TE and i and t[i - 1][0] in ('て', 'で') and t[i - 1][3] == '助詞':
                continue
            return (i, i + 1)
    for i in range(len(t)):
        s, k = '', ''
        for j in range(i, min(i + 6, len(t))):
            s += t[j][0]; k += t[j][4]
            # A RUN OF TWO OR MORE TOKENS only: a single token was the loop above's to judge, and letting a lone
            # kana token through here is how いる "to need" collected every ている in the corpus
            if j > i and s in cands and (k == reading or (not is_kana(s) and s not in HOMO)):
                return (i, j + 1)
            if len(s) >= max(len(x) for x in cands):
                break
    return None


# UNIDIC READS 私 AS わたくし, its formal reading, in every sentence -- so a learner would meet the formal word
# in thousands of everyday sentences.  わたし is the reading those sentences use; both are dictionary readings.
PLAIN_READING = {'私': 'わたし'}
FORMAL = {'わたくし'}


def _sentence_html(r, span, form, reading):
    out = []
    t = r['t']
    head = ''.join(tk[0] for tk in t[span[0]:span[1]])
    for i, (surf, lem, base, pos, kana) in enumerate(t):
        if span[0] <= i < span[1]:
            if i == span[0]:
                # THE HEADWORD'S OWN READING, from the dictionary, wherever the sentence spells it exactly
                out.append('<b>' + (furigana(form, reading) if head == form else
                                    ''.join(_align(x[0], x[4]) if x[4] and any(is_kanji(ch) for ch in x[0]) else esc(x[0])
                                            for x in t[span[0]:span[1]])) + '</b>')
            continue
        kana = PLAIN_READING.get(surf, kana) if kana in FORMAL else kana
        out.append(_align(surf, kana) if kana and any(is_kanji(ch) for ch in surf) else esc(surf))
    return ('<div class="uc-exi"><div class="uc-exz"><span class="uc-tts uc-exsay" data-say="%s"></span>%s</div>'
            '<div class="uc-exe">%s</div></div>' % (esc(r['ja']), ''.join(out), esc(r['en'])))


def examples(form, reading, known, uk=False, n=3):
    """Up to n Tatoeba sentences using the word, preferring those whose other words the learner already has
    (`known`: dictionary forms at this level and below), then the shortest; ties by Tatoeba id."""
    cands = {x for x in (form, reading if (uk or not form) else None) if x}
    if not cands:
        return '', 0
    pool = set()
    for x in cands:
        pool.update(IDX.get(x, ()))
    # A WORD THE ANALYSER SPLITS (映画館 is 映画 + 館, お母さん is お + 母 + さん) is no token's lemma, so the
    # index cannot find it; those are looked for as a run of tokens in every sentence that contains the spelling.
    if len(pool) < 3 * n:
        for x in cands:
            if len(x) >= 2:
                pool.update(i for i, r in enumerate(TAT) if x in r['ja'])
    scored = []
    for i in pool:
        r = TAT[i]
        if not _ok_sentence(r):
            continue
        span = _match(r, cands, reading, form)
        if not span:
            continue
        content = [tk for tk in r['t'] if tk[3] not in SKIP_POS]
        unk = sum(1 for tk in content if tk[2] not in known and tk[1] not in known)
        # FEWEST UNKNOWN WORDS FIRST, then the length nearest 14 characters: a three-character 食べた。 shows the
        # word but not how it is used, and a forty-character sentence buries it.
        scored.append((unk, abs(len(r['ja']) - 14), r['id'], i, span))
    scored.sort()
    picks, seen = [], set()
    for unk, _l, _id, i, span in scored:
        # TWO SENTENCES WITH THE SAME CONTENT WORDS are one example (何作ったの / 何を作ったの), so the second is skipped
        key = tuple(sorted({tk[1] for tk in TAT[i]['t'] if tk[3] not in SKIP_POS}))
        en = TAT[i]['en'].lower().rstrip('.!?')
        if key in seen or en in seen:
            continue
        seen.add(key); seen.add(en)
        picks.append(_sentence_html(TAT[i], span, form, reading))
        if len(picks) >= n:
            break
    return ''.join(picks), len(picks)


def freq_of(form, reading):
    return max(FREQ.get(form or '', 0), FREQ.get(reading, 0) if not form else 0)


# ------------------------------------------------------------------------------ a phrase's romaji
# A PHRASE'S PARTICLES ARE SPELLED BY HOW THEY SOUND in Hepburn: は "wa", へ "e", を "o" -- which kana alone
# cannot see, since は is "ha" everywhere else.  So a phrase is segmented, and only where the analyser's kana for
# the whole phrase agrees with the dictionary's reading is it trusted to say which は is the particle; otherwise
# the romaji stays letter for letter.  The two greetings whose final は is the old particle fused into a single
# word, so no segmenter calls it one, are written as every Hepburn text writes them.
FUSED = {'こんにちは': 'konnichiwa', 'こんばんは': 'konbanwa'}
_TAG = None


def romaji_phrase(shown, reading):
    global _TAG
    if reading in FUSED:
        return FUSED[reading]
    try:
        import fugashi
    except ImportError:
        return romaji(reading)
    if _TAG is None:
        _TAG = fugashi.Tagger()
    toks = [(w.surface, w.feature.pos1 or '', kata2hira(w.feature.kana or w.surface)) for w in _TAG(shown)]
    if ''.join(k for _s, _p, k in toks) != reading:
        return romaji(reading)
    out = []
    for s, p, k in toks:
        if p == '助詞' and s in ('は', 'へ', 'を'):
            out.append({'は': 'wa', 'へ': 'e', 'を': 'o'}[s])
        else:
            r = romaji(k)
            if r is None:
                return romaji(reading)
            out.append(r)
    # the words are run together as the kana are: the reading is one unit on the card
    return ''.join(out)
