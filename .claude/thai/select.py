#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining words.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by corpus frequency (the commonest first), each marked with where
it came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`thai_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a word whose every sense is weak (rare, archaic, slang, a bound morpheme
    ...) -- the corpus's count belongs to a commoner use it is spelt like;
  · a word with only proper-noun, phrase or proverb entries;
  · a word that is ALSO a proper noun's spelling keeps only its other entries'
    claim (the card drops the name, `build_deck.entries_for`);
  · the repetition mark ๆ, which the corpus counts as a word;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from th import fold
from thai_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking.  Each with its reason.
EXCLUDE = {
    'ฯ': 'the abbreviation mark, not a word',
    'ๆ': 'the repetition mark, not a word',
    'สา': 'rare ("a kind of tree", "dog", archaic); its count is most likely the syllable of อาสา, ศาสนา and the like',
    'กระ': 'its count is the prefix syllable of กระ- words (กระดาษ, กระเป๋า); the card was "hawksbill turtle"',
    'ระ': 'a syllable count (ระวัง, ระหว่าง); the card was "to scrape"',
    'ตะ': 'a syllable count (ตะวัน, ตะโกน); the card was "to encrust"',
    'ดา': 'a syllable count; the card was "bugs of the family Belostomatidae"',
    'กร': 'a syllable count, mostly from names; the card was "doer; (royal) hand"',
    'เอ': 'the Latin letter A, counted from loanwords and labels',
    'อ้าย': 'Wiktionary has only "used in อุ้ยอ้าย"',
    'เมีย': '"wife" is tagged as a register Wiktionary marks weak, so the card taught only "female"',
    'กลับบ้าน': 'Wiktionary\'s entry is "to go" plus a pointer; B1\'s inventory composes it instead',
    'ริ': 'a syllable count (ริม, ริเริ่ม); the card was "to initiate"',
    'ผู้ใช้': 'Wiktionary\'s only sense is "abettor"; B1\'s inventory composes "user" instead',
    'พลัง': 'shares "energy" with พลังงาน, B1\'s inventory word, and the shelf-wide label is Thai',
}

# A COMPOUND THE INVENTORY NEEDS AND WIKTIONARY HAS NO ENTRY FOR.  The days of
# the week are written วัน "day" + the day's own name (วันจันทร์ "Monday" is
# "day of the moon"), and Wiktionary files only the second half; likewise the
# language names (ภาษา "language" + ไทย).  Each is composed from its PARTS' own
# entries -- the romanisation is the parts' Paiboon readings joined, so nothing
# about the sound is typed here -- and only the English, the plain meaning of the
# compound, is written by hand.  The card is otherwise an ordinary card.
COMPOSE = {
    'วันจันทร์': ('วัน จันทร์', 'noun', 'Monday'),
    'วันอังคาร': ('วัน อังคาร', 'noun', 'Tuesday'),
    'วันพุธ': ('วัน พุธ', 'noun', 'Wednesday'),
    'วันพฤหัสบดี': ('วัน พฤหัสบดี', 'noun', 'Thursday'),
    'วันศุกร์': ('วัน ศุกร์', 'noun', 'Friday'),
    'วันเสาร์': ('วัน เสาร์', 'noun', 'Saturday'),
    'วันอาทิตย์': ('วัน อาทิตย์', 'noun', 'Sunday'),
    'ภาษาไทย': ('ภาษา ไทย', 'noun', 'Thai (the language)'),
    'ภาษาอังกฤษ': ('ภาษา อังกฤษ', 'noun', 'English (the language)'),
    'คนไทย': ('คน ไทย', 'noun', 'a Thai person; Thai people'),
    'ฝนตก': ('ฝน ตก', 'verb', 'to rain (literally "rain falls")'),
    # A2
    'ปีหน้า': ('ปี หน้า', 'noun', 'next year'),
    'ปีที่แล้ว': ('ปี ที่ แล้ว', 'noun', 'last year'),
    'อาทิตย์หน้า': ('อาทิตย์ หน้า', 'noun', 'next week'),
    'เนื้อวัว': ('เนื้อ วัว', 'noun', 'beef'),
    'คนอื่น': ('คน อื่น', 'noun', 'other people; someone else'),
    'ขับรถ': ('ขับ รถ', 'verb', 'to drive (a car)'),
    'จ่ายเงิน': ('จ่าย เงิน', 'verb', 'to pay (money)'),
    'แปรงฟัน': ('แปรง ฟัน', 'verb', 'to brush one\'s teeth'),
    'มีความสุข': ('มี ความสุข', 'verb', 'to be happy (literally "to have happiness")'),
    # B1
    'ตกงาน': ('ตก งาน', 'verb', "to lose one's job; to be out of work"),
    'ขาดทุน': ('ขาด ทุน', 'verb', 'to make a loss'),
    'ค่าใช้จ่าย': ('ค่า ใช้ จ่าย', 'noun', 'expenses; costs'),
    'ค่าครองชีพ': ('ค่า ครอง ชีพ', 'noun', 'the cost of living'),
    'ภาคเรียน': ('ภาค เรียน', 'noun', 'semester; school term'),
    'สอบผ่าน': ('สอบ ผ่าน', 'verb', 'to pass an exam'),
    'ติดคุก': ('ติด คุก', 'verb', 'to be in prison; to be jailed'),
    'ผิดกฎหมาย': ('ผิด กฎหมาย', 'adj', 'illegal; against the law'),
    'ถูกกฎหมาย': ('ถูก กฎหมาย', 'adj', 'legal; lawful'),
    'แก้ปัญหา': ('แก้ ปัญหา', 'verb', 'to solve a problem'),
    'โลกร้อน': ('โลก ร้อน', 'noun', 'global warming (literally "the world is hot")'),
    'ห้องฉุกเฉิน': ('ห้อง ฉุกเฉิน', 'noun', 'emergency room'),
    'เวียนหัว': ('เวียน หัว', 'verb', 'to feel dizzy'),
    'นอนไม่หลับ': ('นอน ไม่ หลับ', 'verb', 'to be unable to sleep; to have insomnia'),
    'อาหารเป็นพิษ': ('อาหาร เป็น พิษ', 'noun', 'food poisoning'),
    'ลดน้ำหนัก': ('ลด น้ำหนัก', 'verb', 'to lose weight; to go on a diet'),
    'สถานีขนส่ง': ('สถานี ขนส่ง', 'noun', 'bus terminal; bus station'),
    'ล้างจาน': ('ล้าง จาน', 'verb', 'to wash the dishes'),
    'ซักผ้า': ('ซัก ผ้า', 'verb', 'to do the laundry; to wash clothes'),
    'รีดผ้า': ('รีด ผ้า', 'verb', 'to iron clothes'),
    'ค่าไฟ': ('ค่า ไฟ', 'noun', 'the electricity bill'),
    'ค่าน้ำ': ('ค่า น้ำ', 'noun', 'the water bill'),
    'เครื่องใช้ไฟฟ้า': ('เครื่อง ใช้ ไฟฟ้า', 'noun', 'electrical appliance'),
    'เลี้ยงลูก': ('เลี้ยง ลูก', 'verb', 'to bring up children'),
    'ไหว้พระ': ('ไหว้ พระ', 'verb', 'to pay respects to the Buddha or to monks (as at a temple)'),
    'ขอพร': ('ขอ พร', 'verb', 'to ask for a blessing; to make a wish'),
    'ความแตกต่าง': ('ความ แตกต่าง', 'noun', 'difference'),
    'ส่วนใหญ่': ('ส่วน ใหญ่', 'noun', 'the majority; most; mostly'),
    'ส่วนน้อย': ('ส่วน น้อย', 'noun', 'the minority; a small part'),
    'เพิ่มขึ้น': ('เพิ่ม ขึ้น', 'verb', 'to increase; to rise'),
    'ลดลง': ('ลด ลง', 'verb', 'to decrease; to fall'),
    'มีชื่อเสียง': ('มี ชื่อเสียง', 'adj', 'famous; well known'),
    'มีประโยชน์': ('มี ประโยชน์', 'adj', 'useful'),
    'ไร้ประโยชน์': ('ไร้ ประโยชน์', 'adj', 'useless'),
    'หายาก': ('หา ยาก', 'adj', 'rare; hard to find'),
    'น่าตื่นเต้น': ('น่า ตื่นเต้น', 'adj', 'exciting'),
    'ยอดนิยม': ('ยอด นิยม', 'adj', 'most popular; best-selling'),
    'ไม่ยุติธรรม': ('ไม่ ยุติธรรม', 'adj', 'unfair; unjust'),
    'คาดว่า': ('คาด ว่า', 'verb', 'to expect that; to estimate that'),
    'เป็นเจ้าของ': ('เป็น เจ้าของ', 'verb', 'to own'),
    'แสดงความคิดเห็น': ('แสดง ความคิดเห็น', 'verb', 'to give an opinion; to comment'),
    'อย่างไรก็ตาม': ('อย่างไร ก็ ตาม', 'conj', 'however; nevertheless'),
    'นอกจากนี้': ('นอกจาก นี้', 'conj', 'besides; moreover; in addition'),
    'จนกระทั่ง': ('จน กระทั่ง', 'conj', 'until'),
    'ตัวอย่างเช่น': ('ตัวอย่าง เช่น', 'conj', 'for example'),
    'ยังไงก็ตาม': ('ยังไง ก็ ตาม', 'conj', 'anyway; however (colloquial)'),
    'ทันทีที่': ('ทันที ที่', 'conj', 'as soon as'),
    'อาหารเสริม': ('อาหาร เสริม', 'noun', 'dietary supplement'),
    'ประสบความสำเร็จ': ('ประสบ ความสำเร็จ', 'verb', 'to succeed; to be successful'),
    # B1: Wiktionary HAS these, but only as "abstract noun of X" with no meaning,
    # or (กลับบ้าน) as "to go" plus a pointer to the parts
    'การค้า': ('การ ค้า', 'noun', 'trade; commerce'),
    'การรักษา': ('การ รักษา', 'noun', 'treatment (medical); care; preservation'),
    'ความตั้งใจ': ('ความ ตั้งใจ', 'noun', 'intention; determination'),
    'ความรัก': ('ความ รัก', 'noun', 'love'),
    'กลับบ้าน': ('กลับ บ้าน', 'verb', 'to go home; to come home'),
    'ผู้ใช้': ('ผู้ ใช้', 'noun', 'user (of a service, a computer, a product)'),
}

LEAD_TOPICS = {'greetings and politeness', 'particles'}

# Swearing and insults are never in a level deck.
SWEARS = {'เหี้ย', 'ควาย', 'สัตว์', 'มึง', 'กู', 'ไอ้', 'อี', 'ส้นตีน', 'เย็ด', 'ห่า'}


# A word Wiktionary defines ONLY by pointing at another (synonym of หมา, an
# old spelling of ปกติ) is not a card -- `check-thai.js` refuses its gloss.  The
# fill skips it; read off the B1 ranking (สุนัข, ปรกติ, สา).
POINTER = re.compile(r'^(?:alternative|obsolete|dated|rare|archaic) (?:form|spelling) of '
                     r'|^(?:synonym|abbreviation) of [^;]*$', re.I)


def pointer_only(L):
    gl = [g['g'] for e in L['entries'] if e['pos'] != 'name' for g in e['glosses'] if not g['weak']]
    return bool(gl) and all(POINTER.match(g.rstrip(' .')) for g in gl)


def usable(L):
    return any(not g['weak'] for e in L['entries'] if e['pos'] != 'name' for g in e['glosses'])


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    freq = json.load(open('freq.json', encoding='utf-8'))     # extract.py's, for a compound
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = fold(w)
            if k in seen or k in below:
                continue
            L = lex.get(k)
            via = ''
            if w in COMPOSE:     # also overrides an entry that defines it only by pointer
                parts, cpos, gloss = COMPOSE[w]
                if all(fold(p) in lex and 'entries' in lex[fold(p)] for p in parts.split()):
                    seen.add(k)
                    rows.append({'key': k, 'via': '', 'word': w, 'freq': freq.get(k, 0), 'pos': cpos,
                                 'source': 'inventory', 'topic': topic,
                                 'compose': {'parts': parts.split(), 'gloss': gloss}})
                    continue
            if L and 'alt_of' in L:
                via = L['alt_of']
                tgt = lex.get(via)
                own = L.get('roman') or []
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
                if L is not None and not own:
                    L = None          # a pointer with no sound of its own is not carded
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            row = {'key': k, 'via': via, 'word': L['word'], 'freq': L['freq'], 'pos': pos or '',
                   'source': 'inventory', 'topic': topic}
            if via:
                row['roman'] = own[0]
            rows.append(row)
    n_inv = len(rows)
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if 'entries' not in L or L.get('formonly'):
            continue
        if k in seen or k in below or k in swears or k in excl:
            continue
        if ' ' in k or not usable(L) or L['freq'] <= 0 or pointer_only(L):
            continue
        if all(e['pos'] in ('phrase', 'proverb', 'name') for e in L['entries']):
            continue
        seen.add(k)
        fill.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    # THE FIRST DAY'S WORDS LEAD, then everything by frequency.  Both corpora are
    # written Thai, where สวัสดี "hello" and ขอบคุณ "thank you" are rare -- dealt by
    # frequency alone they came at about the 450th card of 500, behind ผู้ "person"
    # and ซึ่ง "which".  A learner says them on the first day, so the inventory's
    # greetings and particles are dealt first, in frequency order among themselves.
    rows.sort(key=lambda r: (r['topic'] not in LEAD_TOPICS, -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
