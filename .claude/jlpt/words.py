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


def english_html(ss, gl_cap=4, notes=False, last=None):
    """`notes`: JMdict's own note on the sense is printed after it.  For a grammar word the note IS the meaning
    -- で is "at; in" three times over, and what tells the senses apart is "indicates location of action",
    "indicates means of action" -- so the first-words deck, which is where the particles are, shows them."""
    rows = []
    for s in ss:
        lab = pos_label(s['pos'], s['misc'])
        gl = esc('; '.join(s['gloss'][:gl_cap]))
        if notes and s.get('inf'):
            gl += ' <span class="uc-inf">(%s)</span>' % esc('; '.join(s['inf']))
        head = '<div class="uc-pos">%s</div>' % esc(lab) if lab and lab != last else ''
        last = lab or last
        rows.append('<div class="uc-sense">%s<div class="uc-gl">%s</div></div>' % (head, gl))
    return ''.join(rows)


def first_gloss(seq, form, reading):
    ss = senses(seq, form, reading, cap=1)
    return ss[0]['gloss'][0] if ss else ''


# ------------------------------------------------------------------------------ the English -> Japanese question
def prompt_parts(ss, gl_cap=4, notes=False):
    """(the first sense, the other senses) as the card prints them.  The reverse card asks with the first alone."""
    if not ss:
        return '', ''
    # the other senses do not repeat a part of speech the question has just printed
    return (english_html(ss[:1], gl_cap, notes),
            english_html(ss[1:], gl_cap, notes, last=pos_label(ss[0]['pos'], ss[0]['misc']) or None))


_POS_RX = re.compile(r'(<div class="uc-pos">)([^<]*)(</div>)')


def _fold(eng, label):
    """Fold a label into the part-of-speech line the card already prints (`dedupe-glosses.py`'s own shape)."""
    def rep(m):
        return m.group(1) + (m.group(2).rstrip() + ', ' + label if m.group(2).strip() else label) + m.group(3)
    new, n = _POS_RX.subn(rep, eng, count=1)
    return new if n else '<div class="uc-pos">' + label + '</div>' + eng


def plain(h):
    return re.sub(r'<rt>.*?</rt>|<[^>]+>', '', h or '')


def label_prompts(notes, cap=3):
    """EVERY QUESTION HAS ONE ANSWER.  Two notes whose first gloss is the same word ("to do": する and やる; "one":
    一 and 一つ; "that": その, それ, あれ) ask the same question, and the reverse card for either is a coin toss.
    Nothing in the sources says how they differ, so each one's question names the others -- "not やる" -- which
    invents nothing and tells a learner the one thing worth knowing, that the language has another word for it.
    `notes` are dicts with fields; returns how many were labelled.  Asserts every Prompt is then unique."""
    def first(n):
        m = re.search(r'<div class="uc-gl">(.*?)</div>', n['fields']['Prompt'])
        # the gloss itself: without the dictionary's note on the sense, which differs where the gloss does not
        # (ません and ない are both "not")
        return (html.unescape(re.sub(r'<span class="uc-inf">.*?</span>|<[^>]+>', '', m.group(1)))
                .split(';')[0].strip().lower() if m else '')

    def name(n, others):
        w = plain(n['fields']['Word'])
        # two notes written alike are told apart by their readings
        return '%s (%s)' % (w, n['fields']['Reading']) if any(plain(o['fields']['Word']) == w for o in others) else w

    groups = defaultdict(list)
    for n in notes:
        groups[first(n)].append(n)
    done = 0
    for g in groups.values():
        if len(g) < 2:
            continue
        for n in g:
            rest = [o for o in g if o is not n]
            names = [name(o, [x for x in g if x is not o]) for o in rest]
            n['_full'] = 'not ' + ', '.join(esc(x) for x in names)
            lab = 'not ' + ', '.join(esc(x) for x in names[:cap]) + (' …' if len(names) > cap else '')
            n['_base'] = n['fields']['Prompt']
            n['fields']['Prompt'] = _fold(n['_base'], lab)
            done += 1
    seen = defaultdict(list)
    for n in notes:
        seen[n['fields']['Prompt']].append(n)
    for same in seen.values():
        if len(same) > 1:           # the capped label hid the difference: name every sibling
            for n in same:
                if '_base' in n:
                    n['fields']['Prompt'] = _fold(n['_base'], n['_full'])
    seen = defaultdict(list)
    for n in notes:
        seen[n['fields']['Prompt']].append(plain(n['fields']['Word']))
        n.pop('_base', None); n.pop('_full', None)
    left = [v for v in seen.values() if len(v) > 1]
    if left:
        raise SystemExit('label_prompts: %d questions still have two answers (e.g. %r)' % (len(left), left[0]))
    return done


# ------------------------------------------------------------------------------ a verb's forms
# DERIVED FROM THE VERB'S CLASS, AS ROMAJI IS FROM KANA: nothing here is looked up or composed.  JMdict names the
# class of every verb (it is the card's own part-of-speech line), and for these classes the class and the last
# kana fix the four forms a beginner meets before the dictionary form: polite (ます), て, negative (ない), past (た).
# A class not listed here gets NO forms -- the suru verbs in -ずる and -す, the archaic ones -- rather than a guess,
# and so does a word whose last kana is not its class's (`conjugate` returns None).
_GODAN = {'う': ('い', 'って', 'わ', 'った'), 'く': ('き', 'いて', 'か', 'いた'), 'ぐ': ('ぎ', 'いで', 'が', 'いだ'),
          'す': ('し', 'して', 'さ', 'した'), 'つ': ('ち', 'って', 'た', 'った'), 'ぬ': ('に', 'んで', 'な', 'んだ'),
          'ぶ': ('び', 'んで', 'ば', 'んだ'), 'む': ('み', 'んで', 'ま', 'んだ'), 'る': ('り', 'って', 'ら', 'った')}
_V5 = {'v5b': 'ぶ', 'v5g': 'ぐ', 'v5k': 'く', 'v5m': 'む', 'v5n': 'ぬ', 'v5r': 'る', 'v5s': 'す', 'v5t': 'つ', 'v5u': 'う'}
CONJ_LABELS = ('polite', 'て-form', 'negative', 'past')


def conjugate(word, cls):
    """(polite, te, negative, past) of a dictionary form written `word`, or None where the class is not one whose
    forms follow from it.  Works on the kana reading and on the written form alike: only the ending changes --
    except 来る, whose kanji is read き / こ, which is why the caller conjugates the reading separately."""
    if not word:
        return None
    if cls in ('v1', 'v1-s'):
        if word[-1] != 'る':
            return None
        st = word[:-1]
        return st + 'ます', st + 'て', st + 'ない', st + 'た'
    if cls in _V5:
        if word[-1] != _V5[cls]:
            return None
        i, te, a, ta = _GODAN[word[-1]]
        st = word[:-1]
        return st + i + 'ます', st + te, st + a + 'ない', st + ta
    if cls == 'v5k-s':                       # 行く: 行って, 行った
        if word[-1] != 'く':
            return None
        st = word[:-1]
        return st + 'きます', st + 'って', st + 'かない', st + 'った'
    if cls == 'v5aru':                       # いらっしゃる, くださる, なさる, おっしゃる: -います
        if word[-1] != 'る':
            return None
        st = word[:-1]
        return st + 'います', st + 'って', st + 'らない', st + 'った'
    if cls == 'v5r-i':                       # ある: its negative is ない
        if word[-2:] not in ('ある', '有る', '在る'):
            return None
        st = word[:-1]
        return st + 'ります', st + 'って', word[:-2] + 'ない', st + 'った'
    if cls == 'v5u-s':                       # 問う, 請う: 問うて, 問うた
        if word[-1] != 'う':
            return None
        st = word[:-1]
        return st + 'います', word + 'て', st + 'わない', word + 'た'
    if cls == 'vk':                          # 来る
        if word.endswith('来る'):
            st = word[:-1]
            return st + 'ます', st + 'て', st + 'ない', st + 'た'
        if word.endswith('くる'):
            st = word[:-2]
            return st + 'きます', st + 'きて', st + 'こない', st + 'きた'
        return None
    if cls == 'vs-i':                        # する
        if word[-2:] not in ('する', '為る'):
            return None
        st = word[:-2]
        return st + 'します', st + 'して', st + 'しない', st + 'した'
    return None


_VERB = set(_V5) | {'v1', 'v1-s', 'v5k-s', 'v5aru', 'v5r-i', 'v5u-s', 'vk', 'vs-i'}


def conj_html(ss, shown, reading):
    """The four forms of a verb, written as the card's front writes the word (`shown`), each over its romaji."""
    cls = next((p for p in (ss[0]['pos'] if ss else []) if p in _VERB), None)
    if not cls:
        return ''
    rd = conjugate(reading, cls)
    wr = conjugate(shown, cls) if shown != reading else rd
    if not rd or not wr:
        return ''
    out = []
    for lab, w, r in zip(CONJ_LABELS, wr, rd):
        ro = romaji(r)
        out.append('<div class="uc-cj"><span class="uc-cjl">%s</span>%s%s</div>'
                   % (lab, _align(w, r) if any(is_kanji(ch) for ch in w) else esc(w),
                      '<span class="uc-cjr">%s</span>' % esc(ro) if ro else ''))
    return ''.join(out)


# ------------------------------------------------------------------------------ kanji a level has not reached
# THE FRONT IS IN KANA WHERE THE WORD'S KANJI ARE NOT YET THE LEVEL'S (N5 and N4, Nov 2026).  N5's 667 words are
# written with 411 different kanji and 256 of them occur in one word each (喫茶店, 鉛筆, 鍵), which made the first
# deck a kanji course nobody had planned.  KANJIDIC2 carries each kanji's FORMER JLPT level -- the pre-2010
# specification, the last time the board said which kanji belong where and the source Waller's word lists were
# built from: 103 at the old level 4 (now N5) and 181 more at level 3 (N4).  A word any of whose kanji is above
# its deck's level is asked in kana; its back still writes it in kanji, furigana over them, with the kanji rows.
# From N3 on nothing is gated: the old level 2 was split between N3 and N2 with no list saying how.
KANJI_FLOOR = {'n5': 4, 'n4': 3}


def beyond(form, lv):
    """The kanji of `form` that the level has not reached, in order; empty from N3 on."""
    floor = KANJI_FLOOR.get(lv)
    if not floor or not form:
        return []
    out = []
    for ch in form:
        if ch in '々〆ヶ' or not is_kanji(ch):
            continue
        if KJ.get(ch, {}).get('j', 0) < floor and ch not in out:
            out.append(ch)
    return out


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


# A TATOEBA PAIR WHOSE ENGLISH SAYS THE OPPOSITE OF ITS JAPANESE.  The corpus links sentences by hand and a few
# links are wrong; nothing here can find them, so the ones a reader has reported are listed by the Japanese
# sentence's Tatoeba id and never used.  80500: 明日の天気は良くなるだろう against "The weather outlook for
# tomorrow is not good." (found on the N5 card for なる, 2026-11-15).
BAD_PAIRS = {80500}


def _ok_sentence(r):
    ja, en = r['ja'], r['en']
    return (4 <= len(ja) <= 30 and len(en) <= 90 and not LATIN.search(ja) and ja[-1] in '。？！?!」'
            and r['id'] not in BAD_PAIRS)


def _match(r, cands, reading, form='', pos1=None):
    """Token span(s) of the headword in sentence r, or None.  One token whose dictionary form is the word
    (with its reading agreeing), else a run of tokens that spells it exactly at token boundaries.
    `pos1` (the grammar words of the first-words deck): the token must be WRITTEN as the word and be that part of
    speech -- は the particle and not は the tooth, だ and not its forms で and な."""
    t = r['t']
    for i, (surf, lem, base, pos, kana) in enumerate(t):
        if pos1:
            if surf in cands and pos in pos1:
                return (i, i + 1)
            continue
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
    if pos1 and all(len(x) == 1 for x in cands):
        return None
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


def examples(form, reading, known, uk=False, n=3, pos1=None):
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
        span = _match(r, cands, reading, form, pos1)
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
    # THE KANA BETWEEN TWO PARTICLES ARE ROMANISED AS ONE RUN, never token by token (Nov 2026): the analyser cuts
    # 行ってきます as 行っ + て + き + ます, and a small っ at the end of a token has no consonant after it to
    # double -- so the phrase came out "itekimasu".
    out, run = [], ''
    for s, p, k in toks + [('', '助詞', '')]:
        if p == '助詞' and s in ('は', 'へ', 'を', ''):
            if run:
                r = romaji(run)
                if r is None:
                    return romaji(reading)
                out.append(r)
                run = ''
            if s:
                out.append({'は': 'wa', 'へ': 'e', 'を': 'o'}[s])
        else:
            run += k
    # the words are run together as the kana are: the reading is one unit on the card
    return ''.join(out)


# ------------------------------------------------------------------------------ one note
SAY_AS = {'は': 'わ', 'へ': 'え'}       # the two particles a speech engine would read as the letter


def make_note(seq, form, reading, lv, known, universe=(), others=(), pos1=None, sense_notes=False,
              kanji_rows=True):
    """Every field of one word's note, the same for every deck that cards words.  `lv` is the level whose kanji
    the front may use (`beyond`); `others` the entry's other spellings and readings on the list."""
    uk = bool(form) and usually_kana(seq, form, reading)
    ss = senses(seq, form, reading) or senses(seq, '', reading)
    eng = english_html(ss, notes=sense_notes)
    if not eng:
        raise SystemExit('no usable sense for %s %s (%s)' % (form, reading, seq))
    late = [] if uk else beyond(form, lv)
    front = reading if (uk or not form or late) else form
    also = []
    if uk:
        also.append('usually written in kana · kanji: ' + esc(form))
    elif late:
        also.append('shown in kana: %s %s after %s' % ('、'.join(esc(x) for x in late),
                                                      'comes' if len(late) == 1 else 'come', lv.upper()))
    oth = []
    for x in others:
        if x and x not in (form, reading) and x not in oth:
            oth.append(x)
    if oth:
        also.append('also ' + ' / '.join(esc(x) for x in oth))
    ex_html, nex = examples(form, reading, known, uk=uk, pos1=pos1)
    # A WORD USUALLY WRITTEN IN KANA gets no kanji rows: its card never shows the kanji, and the compounds of
    # 為 (する) or 居 (いる) are not words a learner of する needs.
    single = [ch for ch in form if is_kanji(ch)] if form and not uk else []
    prompt, more = prompt_parts(ss, notes=sense_notes)
    prt = bool(ss) and 'prt' in ss[0]['pos']
    return {
        'seq': seq, 'form': form, 'uk': uk, 'late': bool(late), 'nex': nex,
        'f': freq_of('' if uk else form, reading),
        'fields': {
            'Word': esc(front),
            'Furigana': furigana(form, reading) if not uk else esc(reading),
            'Reading': esc(reading),
            # THE TAGGER IS GIVEN THE WORD AS IT IS WRITTEN, never the kana of a word shown in kana for its
            # level: a bare はし is as likely to be segmented は + し, and its は then spelled "wa"
            'Romaji': esc(romaji_phrase(reading if (uk or not form) else form, reading) or ''),
            'Also': ' · '.join(also),
            'English': eng,
            'Prompt': prompt,
            'More': more,
            'Conj': conj_html(ss, front, reading),
            'Kanji': kanji_html(form) if (kanji_rows and not uk) else '',
            'Compounds': compounds_html(single[0], universe, seq) if (len(single) == 1 and universe) else '',
            'Examples': ex_html,
            'Say': esc(SAY_AS.get(reading, reading) if prt else reading),
        }}


def resolve_fronts(notes):
    """TWO NOTES WITH ONE FRONT are two different words spelled alike (私 わたし and 私 わたくし are separate JMdict
    entries), and a front that cannot say which one it asks is unanswerable; only those show their furigana.
    Two KANA words spelled alike (いる "to be", いる "to need") have no furigana to show, so each carries its
    kanji spelling small beside it -- the one thing the dictionary gives that tells them apart."""
    fronts = defaultdict(list)
    for n in notes:
        fronts[n['fields']['Word']].append(n)
    clash = 0
    for same in fronts.values():
        if len(same) < 2:
            continue
        for n in same:
            n['fields']['Word'] = n['fields']['Furigana']
            clash += 1
        again = defaultdict(list)
        for n in same:
            again[n['fields']['Word']].append(n)
        for still in again.values():
            if len(still) > 1:
                for n in still:
                    if n['form']:
                        n['fields']['Word'] += '<span class="uc-hint">（%s）</span>' % esc(n['form'])
    return clash
