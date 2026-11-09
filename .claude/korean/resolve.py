#!/usr/bin/env python3
"""Which Wiktionary entry (and which of its senses) a row of the NIKL list means.

The NIKL list numbers its homographs as the Standard Korean Language Dictionary does (눈01 "eye", 눈04 "snow")
and gives each row a NOTE: the hanja of a Sino-Korean word (價格), a phrase it is used in (~이 내리다), or a
hint at its meaning (신체의 일부, "a part of the body").  Wiktionary files homographs as separate entries,
one per etymology.  The join is made in this order, each step only where the one before left a choice:

  1. the part of speech (NIKL's 명 is a noun, 동 a verb …);
  2. THE HANJA: an entry whose hanja contain every hanja character of the note;
  3. THE PHRASE: an entry whose usage examples contain the note's phrase with the word put in for ~;
  4. THE HAND TABLE, `picks.json`: a row named there takes the entry (and, where one Wiktionary entry
     covers two NIKL homographs, the senses) the table gives, each pick made by reading both sides;
  5. a single candidate left is the answer; more than one is REFUSED, never guessed, and reported.
"""
import json, os, re
from ko import HERE, is_hanja, load

HANJA = load('hanja.json')

POS = {'명': {'noun', 'name'}, '의': {'noun', 'counter'}, '고': {'name', 'noun'}, '동': {'verb'},
       '형': {'adj'}, '부': {'adv'}, '대': {'pron'}, '수': {'num'}, '관': {'det'}, '감': {'intj'},
       '보': {'verb', 'adj'}, '불': {'contraction', 'adv', 'verb', 'adj', 'pron', 'intj', 'conj', 'noun'}}
POS_NAME = {'noun': 'noun', 'name': 'proper noun', 'counter': 'counter', 'verb': 'verb', 'adj': 'adjective',
            'adv': 'adverb', 'pron': 'pronoun', 'num': 'numeral', 'det': 'determiner', 'intj': 'interjection',
            'particle': 'particle', 'contraction': 'contraction', 'conj': 'conjunction', 'phrase': 'phrase',
            'proverb': 'proverb'}
NIKL_POS = {'명': 'noun', '의': 'dependent noun', '고': 'proper noun', '동': 'verb', '형': 'adjective',
            '부': 'adverb', '대': 'pronoun', '수': 'numeral', '관': 'determiner', '감': 'interjection',
            '보': 'auxiliary', '불': 'contraction'}

PICKS = json.load(open(os.path.join(HERE, 'picks.json'), encoding='utf-8'))


def base(head):
    """'눈01' -> '눈', '도쿄(동경)' -> '도쿄', '년생80' -> '년생'"""
    return re.sub(r'\(.*\)$', '', re.sub(r'\d+$', '', head))


def usable(e):
    return any(ok_sense(s) for s in e['s'])


POINTER = re.compile(r'^(?:alternative form|alternative spelling|obsolete form|archaic form|nonstandard form|'
                     r'misspelling|eye dialect|abbreviation|short form|contraction|clipping|synonym|'
                     r'(?:\w+ )?(?:spelling|form)) of ', re.I)
SKIP_TAGS = {'obsolete', 'archaic', 'North-Korea', 'dialectal', 'Middle-Korean', 'historical', 'rare'}


# A POINTER THAT CARRIES ITS OWN ENGLISH is a meaning: "contraction of 이야기 (iyagi): talk; story" is 얘기's
# whole entry, and refusing it left 뭐, 얘기 and 드리다 off the first stage.  The English is the card's gloss and
# the pointer stays beside it, shortened ("talk; story (contraction of 이야기)"); a pointer with no English of
# its own ("alternative form of 것") is still not a meaning.
PTR = re.compile(r'^(?P<kind>[\w -]*?(?:form|spelling|contraction|abbreviation|clipping|short form)) of '
                 r'(?P<w>[\uac00-\ud7a3 ]+)\s*\((?P<r>[^,()“”]*)(?:,\s*“(?P<q>[^”]+)”)?\)\s*(?:[:;]\s*(?P<e>.+))?$')


PTR_KINDS = {'contraction', 'abbreviation', 'clipping', 'short form', 'alternative form', 'alternative spelling',
             'standard form', 'humble form', 'honorific form', 'polite form', 'informal form', 'formal form'}


def pointer_english(g):
    m = PTR.match(g.strip())
    if not m:
        return None
    # a grammatical form of another word (its substantive, passive, causative) is that word's, not a meaning
    if m.group('kind').strip().lower() not in PTR_KINDS:
        return None
    eng = m.group('e') or m.group('q')
    if not eng or re.search(r'[\uac00-\ud7a3]', eng):
        return None
    return '%s (%s of %s)' % (eng.strip(), m.group('kind').strip(), m.group('w').strip())


def ok_sense(s):
    g = s['g']
    if not g or 'hanja form of' in g or g.startswith('Used other than figuratively'):
        return False
    if POINTER.match(g) and not pointer_english(g):
        return False
    if set(s['tags']) & SKIP_TAGS:
        return False
    return True


def note_hanja(note):
    return [ch for ch in note if is_hanja(ch)]


def same_char(a, b):
    return a == b or b in HANJA.get(a, {}).get('v', ())


def hanja_match(hj, h):
    """Every hanja of the note is in the entry's hanja, a character's variant counting as the character."""
    return all(any(same_char(ch, x) for x in h) for ch in hj)


def resolve(rows, D):
    """rows: the NIKL rows of one headword (one note per headword) -> (entries, sense filter, how) or (None, why)."""
    head = rows[0][1]
    w = base(head)
    note = next((r[3] for r in rows if r[3]), '')
    if head in PICKS:
        p = PICKS[head]
        if p == 'drop':
            return None, None, 'dropped by hand'
        ents = D.get(p.get('word', w), [])
        return [ents[i] for i in p['entries']], p.get('senses'), 'hand'
    cand = [e for e in D.get(w, []) if usable(e)]
    if not cand:
        return None, None, 'no Wiktionary entry'
    want = set().union(*(POS[r[2]] for r in rows))
    by_pos = [e for e in cand if e['pos'] in want]
    if by_pos:
        cand = by_pos
    # a common noun is not the surname or the district spelled alike, unless the list says proper noun
    if '고' not in {r[2] for r in rows} and any(e['pos'] != 'name' for e in cand):
        cand = [e for e in cand if e['pos'] != 'name']
    hj = note_hanja(note)
    if hj and len(cand) > 1:
        m = [e for e in cand if any(hanja_match(hj, h) for h in e.get('h', []))]
        if m:
            cand = m
        else:
            # a native word has no hanja: an entry carrying OTHER hanja is not it
            # and where the note IS hanja and no entry carries them, the one entry with no hanja at all is the
            # word whose hanja Wiktionary did not record (가구 家口 "household" beside 가구 家具 "furniture")
            m = [e for e in cand if not e.get('h')]
            if m and len(m) < len(cand) and (len(m) == 1 or not all(is_hanja(ch) or ch in '-.~ ' for ch in note)):
                cand = m
    if '~' in note and len(cand) > 1:
        frag = [x for x in re.split(r'[~\s]+', note) if x]
        m = [e for e in cand if any(all(f in x['t'] for f in frag) for s in e['s'] for x in s['ex'])]
        if len(m) >= 1:
            cand = m
    # A NOTE IN HANJA THAT NO CANDIDATE'S HANJA MATCH, where every candidate has hanja of its own, is a word
    # Wiktionary does not have: 관리 官吏 "official" is not 관리 管理 "management".  Refused, not glossed
    # wrongly.  (A candidate with NO hanja is let through: Wiktionary leaves most -하다 verbs' hanja out.)
    if hj and all(e.get('h') for e in cand) and not any(hanja_match(hj, h) for e in cand for h in e['h']):
        return None, None, 'hanja disagree'
    if len(cand) > 1:
        # entries of the SAME etymology split by part of speech are one word (가까이 adverb and noun)
        poss = {e['pos'] for e in cand}
        same_h = len({tuple(e.get('h', [])) for e in cand}) == 1 and cand[0].get('h')
        if len(poss) == len(cand) and (len(rows) > 1 or same_h):
            return cand, None, 'pos'
        return None, cand, 'ambiguous'
    return cand, None, 'rule'


# ------------------------------------------------------------------------------------------ the fallback
KR_POS = {'명': {'명사'}, '의': {'의존 명사'}, '고': {'명사', '', '품사 없음'}, '동': {'동사'}, '형': {'형용사'},
          '부': {'부사'}, '대': {'대명사'}, '수': {'수사'}, '관': {'관형사'}, '감': {'감탄사'},
          '보': {'보조 동사', '보조 형용사'}, '불': {'품사 없음', '', '부사', '감탄사', '동사', '형용사', '대명사'}}
KR_AS = {'명사': 'noun', '의존 명사': 'noun', '동사': 'verb', '형용사': 'adj', '부사': 'adv', '대명사': 'pron',
         '수사': 'num', '관형사': 'det', '감탄사': 'intj', '보조 동사': 'verb', '보조 형용사': 'adj',
         '품사 없음': 'phrase', '': 'phrase'}


def resolve_kr(rows, K):
    """A row Wiktionary could not give, looked up in KRDict (NIKL's own learner's dictionary), the same steps:
    the part of speech, then the hanja (KRDict's `origin`), then a single candidate -- or refused."""
    from ko import rr_from_pron
    head = rows[0][1]
    w = base(head)
    note = next((r[3] for r in rows if r[3]), '')
    want = set().union(*(KR_POS[r[2]] for r in rows))
    cand = [e for e in K.get(w, []) if e['pos'] in want and e['s']]
    hj = note_hanja(note)
    if hj:
        m = [e for e in cand if e['o'] and hanja_match(hj, e['o'])]
        cand = m if m else [e for e in cand if not e['o'] or not any(is_hanja(ch) for ch in e['o'])]
    elif note and len(cand) > 1:
        # a native word's note is no hanja: an entry whose origin is hanja is a homograph
        m = [e for e in cand if not any(is_hanja(ch) for ch in e['o'])]
        cand = m or cand
    if len(cand) != 1:
        return None
    e = cand[0]
    seen, senses = [], []
    for g in e['s']:
        if g not in seen:
            seen.append(g)
            senses.append({'g': g, 'tags': [], 'ex': [], 'alt': []})
    out = {'pos': KR_AS.get(e['pos'], 'noun'), 's': senses, 'src': 'krdict'}
    if e['o'] and any(is_hanja(ch) for ch in e['o']):
        out['h'] = [e['o']]
    if e['p']:
        out['p'] = e['p'].split('/')[0]
        r = rr_from_pron(w, e['p'])
        if r:
            out['r'] = r
    return [out]
