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
    'วนเวียน': 'shares "to go around; to circle" with วน, word for word',
    'สมมุติ': 'a variant spelling of สมมติ, B2\'s inventory word',
    'อินทร์': '"chief; lord" beside a proper noun, Indra; the corpus counts the god\'s name',
    'ผู้จัดการ': 'Wiktionary\'s only sense is an estate\'s administrator, not "manager"',
    'โม': 'only "used in แตงโม"',
    'พี': 'rare ("fat"); the count is most likely an abbreviation or a syllable',
    'โด': 'the note "do"',
    'จัน': 'a persimmon species; the count is the syllable of จันทร์',
    'ยู': 'the Latin letter U',
    'กัง': 'a macaque species; a syllable count',
    'เส': 'a syllable count; "to slant"',
    'ชะ': 'a syllable count (ชะตา, ชะงัก); "to wash"',
    'กง': 'a syllable count; "rim, circle"',
    'ยอ': 'the beach mulberry; a syllable count (ยอม, ยอด)',
    'โขง': 'only "rancid" -- the count is the Mekong, a name',
    'คุ': 'only "live (of embers)"; a syllable count',
    'ท้าว': 'every sense of the everyday entry is tagged weak; the card taught only "shiveringly"',
    'สิริ': 'one etymology is weak, the other a pointer to ศรี',
    'ปิดบัง': 'shares "to conceal" with ปกปิด, word for word',
    'คงคา': 'its only sense is the river deity, written "(พระ~, พระแม่~ …)"',
    'มหาธาตุ': 'its only sense is a relic, written "(พระ~, พระศรี~ …)"',
    'ขาดใจ': 'shares "to die" with สิ้นชีวิต',
    'เส้นเลือด': 'shares "blood vessel" with หลอดเลือด, C1\'s inventory word',
    'มาน': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'ปุ': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'จี': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'ยี่': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'สง': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'นนท์': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'บ': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'ไน': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'บาย': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'สำ': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'ครุ': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'ยี': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'รณ': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'แอ': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'รามา': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'วดี': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'กน': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'สอ': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'มาย': 'a syllable, letter or name count; its card was a rare homograph (C1)',
    'เน็ต': '"the Internet" is a name-only pointer; the card taught "net (in tennis)"',
    'แป๊ะ': '"old Chinese man" is tagged weak; the card taught "a traditional song"',
    'ยวน': 'every usable sense is weak or "to arouse sexually"',
    'เชย': '"old-fashioned" is tagged weak; the card taught "used in ชดเชย"',
    'คอม': '"computer" is missing; the card was an unidentified plant',
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
    # B2
    'ลงคะแนน': ('ลง คะแนน', 'verb', 'to vote; to cast a vote'),
    'ข้อหา': ('ข้อ หา', 'noun', 'charge; accusation (in law)'),
    'ประกันตัว': ('ประกัน ตัว', 'verb', 'to bail out; to be released on bail'),
    'ปล่อยตัว': ('ปล่อย ตัว', 'verb', 'to release (a person); to set free'),
    'ฟื้นตัว': ('ฟื้น ตัว', 'verb', 'to recover; to rebound (of a person or an economy)'),
    'การเติบโต': ('การ เติบโต', 'noun', 'growth'),
    'อัตราแลกเปลี่ยน': ('อัตรา แลกเปลี่ยน', 'noun', 'exchange rate'),
    'ค่าเงิน': ('ค่า เงิน', 'noun', 'the value of a currency'),
    'ธนาคารกลาง': ('ธนาคาร กลาง', 'noun', 'central bank'),
    'ต้นทุน': ('ต้น ทุน', 'noun', 'cost (of production); outlay'),
    'ข้อสรุป': ('ข้อ สรุป', 'noun', 'conclusion'),
    'ผู้ติดตาม': ('ผู้ ติดตาม', 'noun', 'follower (as on social media); attendant'),
    'ของเสีย': ('ของ เสีย', 'noun', 'waste; waste matter'),
    'หมอกควัน': ('หมอก ควัน', 'noun', 'smog; haze'),
    'แหล่งน้ำ': ('แหล่ง น้ำ', 'noun', 'water source; body of water'),
    'พลังงานแสงอาทิตย์': ('พลังงาน แสงอาทิตย์', 'noun', 'solar energy'),
    'อุทยานแห่งชาติ': ('อุทยาน แห่ง ชาติ', 'noun', 'national park'),
    'ใกล้สูญพันธุ์': ('ใกล้ สูญพันธุ์', 'adj', 'endangered'),
    'การแพทย์': ('การ แพทย์', 'noun', 'medicine (the field); medical care'),
    'ฉีดวัคซีน': ('ฉีด วัคซีน', 'verb', 'to vaccinate; to be vaccinated'),
    'โรคซึมเศร้า': ('โรค ซึมเศร้า', 'noun', 'depression (the illness)'),
    'หัวใจวาย': ('หัวใจ วาย', 'noun', 'heart failure; heart attack'),
    'ข่าวปลอม': ('ข่าว ปลอม', 'noun', 'fake news'),
    'ชนชั้นกลาง': ('ชนชั้น กลาง', 'noun', 'the middle class'),
    'ประกันสังคม': ('ประกัน สังคม', 'noun', 'social security'),
    'พระพุทธรูป': ('พระ พุทธ รูป', 'noun', 'Buddha image; statue of the Buddha'),
    'จุดอ่อน': ('จุด อ่อน', 'noun', 'weak point; weakness'),
    'จุดแข็ง': ('จุด แข็ง', 'noun', 'strong point; strength'),
    'ภาพรวม': ('ภาพ รวม', 'noun', 'overview; the overall picture'),
    'องค์ประกอบ': ('องค์ ประกอบ', 'noun', 'component; element'),
    'ขอบเขต': ('ขอบ เขต', 'noun', 'scope; limits; boundary'),
    'ข้อบกพร่อง': ('ข้อ บกพร่อง', 'noun', 'flaw; defect; shortcoming'),
    'สาระสำคัญ': ('สาระ สำคัญ', 'noun', 'the gist; the essence'),
    'ว่าจ้าง': ('ว่า จ้าง', 'verb', 'to hire; to employ (formally)'),
    'ราคาขาย': ('ราคา ขาย', 'noun', 'selling price'),
    'ภาวะเศรษฐกิจ': ('ภาวะ เศรษฐกิจ', 'noun', 'economic conditions; the state of the economy'),
    'เสพติด': ('เสพ ติด', 'verb', 'to be addicted'),
    'ยุคสมัย': ('ยุค สมัย', 'noun', 'era; period'),
    # B2: "abstract noun of X" alone in Wiktionary
    'การคอร์รัปชัน': ('การ คอร์รัปชัน', 'noun', 'corruption'),
    'การปกครอง': ('การ ปกครอง', 'noun', 'government; administration; rule'),
    'การเผา': ('การ เผา', 'noun', 'burning (as of fields or rubbish)'),
    'การแสดง': ('การ แสดง', 'noun', 'performance; show'),
    'ความชอบธรรม': ('ความ ชอบธรรม', 'noun', 'legitimacy; righteousness'),
    'ความถูกต้อง': ('ความ ถูกต้อง', 'noun', 'correctness; accuracy'),
    'ความพิการ': ('ความ พิการ', 'noun', 'disability'),
    'ความเสมอภาค': ('ความ เสมอภาค', 'noun', 'equality'),
    'ความเหลื่อมล้ำ': ('ความ เหลื่อมล้ำ', 'noun', 'inequality; disparity'),
    # C1: compounds whose parts join with no linking vowel, so the parts' readings
    # are the compound's; a Pali compound that inserts one (จิตเวช jìt-dtà-wêet) is left out
    'เหตุผลนิยม': ('เหตุผล นิยม', 'noun', 'rationalism'),
    'ประสบการณ์นิยม': ('ประสบการณ์ นิยม', 'noun', 'empiricism'),
    'ความจริงแท้': ('ความจริง แท้', 'noun', 'absolute truth; the real truth'),
    'ปัจเจกบุคคล': ('ปัจเจก บุคคล', 'noun', 'an individual (person)'),
    'ปัจเจกชน': ('ปัจเจก ชน', 'noun', 'private individual; private person'),
    'ชะตากรรม': ('ชะตา กรรม', 'noun', 'fate; destiny; lot'),
    'แก่นสาร': ('แก่น สาร', 'noun', 'substance; essence; real worth'),
    'พระรัตนตรัย': ('พระ รัตนตรัย', 'noun', 'the Triple Gem (the Buddha, the Dharma and the Sangha)'),
    'จำพรรษา': ('จำ พรรษา', 'verb', 'to spend the rains retreat at a temple (of a monk)'),
    'ผ้าป่า': ('ผ้า ป่า', 'noun', 'pha pa: an offering of robes and goods to monks'),
    'วิชาการ': ('วิชา การ', 'adj', 'academic; scholarly'),
    'กรอบแนวคิด': ('กรอบ แนวคิด', 'noun', 'conceptual framework'),
    'ระเบียบวิธี': ('ระเบียบ วิธี', 'noun', 'methodology; method'),
    'ระเบียบวิธีวิจัย': ('ระเบียบ วิธี วิจัย', 'noun', 'research methodology'),
    'บทคัดย่อ': ('บท คัด ย่อ', 'noun', 'abstract (summary of a paper)'),
    'กรณีศึกษา': ('กรณี ศึกษา', 'noun', 'case study'),
    'ตัวชี้วัด': ('ตัว ชี้ วัด', 'noun', 'indicator; measure (of performance)'),
    'นัยสำคัญ': ('นัย สำคัญ', 'noun', 'significance (as statistical significance)'),
    'เชิงประจักษ์': ('เชิง ประจักษ์', 'adj', 'empirical'),
    'องค์ความรู้': ('องค์ ความรู้', 'noun', 'body of knowledge'),
    'เชิงปริมาณ': ('เชิง ปริมาณ', 'adj', 'quantitative'),
    'เชิงคุณภาพ': ('เชิง คุณภาพ', 'adj', 'qualitative'),
    'บทนิยาม': ('บท นิยาม', 'noun', 'definition (formal)'),
    'อำนาจอธิปไตย': ('อำนาจ อธิปไตย', 'noun', 'sovereign power; sovereignty'),
    'ระบอบประชาธิปไตย': ('ระบอบ ประชาธิปไตย', 'noun', 'democratic system; democracy (as a form of government)'),
    'องค์กรอิสระ': ('องค์กร อิสระ', 'noun', 'independent body (an independent constitutional organisation)'),
    'คณะกรรมการการเลือกตั้ง': ('คณะกรรมการ การเลือกตั้ง', 'noun', 'Election Commission'),
    'อภิปรายไม่ไว้วางใจ': ('อภิปราย ไม่ ไว้วางใจ', 'noun', 'no-confidence debate (in parliament)'),
    'ยุบสภา': ('ยุบ สภา', 'verb', 'to dissolve parliament'),
    'กฎกระทรวง': ('กฎ กระทรวง', 'noun', 'ministerial regulation'),
    'รัฐสวัสดิการ': ('รัฐ สวัสดิการ', 'noun', 'welfare state'),
    'กระจายอำนาจ': ('กระจาย อำนาจ', 'verb', 'to decentralise; to devolve power'),
    'รวมศูนย์': ('รวม ศูนย์', 'verb', 'to centralise'),
    'ส่วนภูมิภาค': ('ส่วน ภูมิภาค', 'noun', 'provincial administration (the regional tier of government)'),
    'ส่วนท้องถิ่น': ('ส่วน ท้องถิ่น', 'noun', 'local government (the local tier)'),
    'ทวิภาคี': ('ทวิ ภาคี', 'adj', 'bilateral'),
    'ภูมิภาคนิยม': ('ภูมิภาค นิยม', 'noun', 'regionalism'),
    'มูลค่าเพิ่ม': ('มูลค่า เพิ่ม', 'noun', 'added value; value added'),
    'ทุนมนุษย์': ('ทุน มนุษย์', 'noun', 'human capital'),
    'ความยั่งยืน': ('ความ ยั่งยืน', 'noun', 'sustainability; durability'),
    'เศรษฐกิจพอเพียง': ('เศรษฐกิจ พอเพียง', 'noun', 'sufficiency economy (the philosophy of moderation and self-reliance)'),
    'ภาวะเงินฝืด': ('ภาวะ เงินฝืด', 'noun', 'deflation'),
    'ดุลการค้า': ('ดุล การค้า', 'noun', 'balance of trade'),
    'ทุนสำรอง': ('ทุน สำรอง', 'noun', 'reserves (of a central bank or a firm)'),
    'การคลัง': ('การ คลัง', 'noun', 'public finance; fiscal affairs'),
    'นโยบายการเงิน': ('นโยบาย การเงิน', 'noun', 'monetary policy'),
    'นโยบายการคลัง': ('นโยบาย การ คลัง', 'noun', 'fiscal policy'),
    'ภาษีอากร': ('ภาษี อากร', 'noun', 'taxes and duties; taxation'),
    'การกระจายรายได้': ('การ กระจาย รายได้', 'noun', 'income distribution'),
    'บรรษัทข้ามชาติ': ('บรรษัท ข้ามชาติ', 'noun', 'multinational corporation'),
    'กึ่งผูกขาด': ('กึ่ง ผูกขาด', 'adj', 'quasi-monopolistic; oligopolistic'),
    'เก็งกำไร': ('เก็ง กำไร', 'verb', 'to speculate (for profit)'),
    'ประสาทวิทยา': ('ประสาท วิทยา', 'noun', 'neurology'),
    'แทรกซ้อน': ('แทรก ซ้อน', 'adj', 'complicating; secondary (of a medical condition)'),
    'ภาวะแทรกซ้อน': ('ภาวะ แทรก ซ้อน', 'noun', 'complication (medical)'),
    'เคมีบำบัด': ('เคมี บำบัด', 'noun', 'chemotherapy'),
    'รังสีรักษา': ('รังสี รักษา', 'noun', 'radiotherapy'),
    'พักฟื้น': ('พัก ฟื้น', 'verb', 'to convalesce; to recuperate'),
    'ปลูกถ่าย': ('ปลูก ถ่าย', 'verb', 'to transplant (an organ or tissue)'),
    'กฎหมายแพ่ง': ('กฎหมาย แพ่ง', 'noun', 'civil law'),
    'กฎหมายอาญา': ('กฎหมาย อาญา', 'noun', 'criminal law'),
    'ค่าสินไหม': ('ค่า สินไหม', 'noun', 'compensation; damages'),
    'ข้อกฎหมาย': ('ข้อ กฎหมาย', 'noun', 'point of law; legal provision'),
    'ลดหย่อน': ('ลด หย่อน', 'verb', 'to reduce; to grant an allowance (as on tax)'),
    'รอลงอาญา': ('รอ ลง อาญา', 'verb', 'to suspend a sentence'),
    'ทัณฑ์บน': ('ทัณฑ์ บน', 'noun', 'a bond of good behaviour; probation'),
    'สืบพยาน': ('สืบ พยาน', 'verb', 'to examine witnesses'),
    'ยกฟ้อง': ('ยก ฟ้อง', 'verb', 'to dismiss a case'),
    'ฟ้องแย้ง': ('ฟ้อง แย้ง', 'verb', 'to counterclaim; to countersue'),
    'เขตอำนาจ': ('เขต อำนาจ', 'noun', 'jurisdiction'),
    'ติดสินบน': ('ติด สินบน', 'verb', 'to bribe'),
    'คำนาม': ('คำ นาม', 'noun', 'noun (the part of speech)'),
    'คำกริยา': ('คำ กริยา', 'noun', 'verb (the part of speech)'),
    'คำวิเศษณ์': ('คำ วิเศษณ์', 'noun', 'modifier: adjective or adverb (the part of speech)'),
    'คำบุพบท': ('คำ บุพบท', 'noun', 'preposition (the part of speech)'),
    'คำสันธาน': ('คำ สันธาน', 'noun', 'conjunction (the part of speech)'),
    'คำอุทาน': ('คำ อุทาน', 'noun', 'interjection (the part of speech)'),
    'คำสรรพนาม': ('คำ สรรพนาม', 'noun', 'pronoun (the part of speech)'),
    'คำลักษณนาม': ('คำ ลักษณนาม', 'noun', 'classifier (the part of speech)'),
    'คำซ้อน': ('คำ ซ้อน', 'noun', 'paired compound: two words of like meaning joined (as เสื้อผ้า)'),
    'คำสมาส': ('คำ สมาส', 'noun', 'samasa: a compound of Pali or Sanskrit roots'),
    'ภาษาบาลี': ('ภาษา บาลี', 'noun', 'the Pali language'),
    'ภาษาเขียน': ('ภาษา เขียน', 'noun', 'written language; the written register'),
    'ระดับภาษา': ('ระดับ ภาษา', 'noun', 'register; level of language'),
    'นัยแฝง': ('นัย แฝง', 'noun', 'implied meaning; connotation'),
    'ร้อยกรอง': ('ร้อย กรอง', 'noun', 'verse; poetry (as against prose)'),
    'บทประพันธ์': ('บท ประพันธ์', 'noun', 'literary work; composition'),
    'แก่นเรื่อง': ('แก่น เรื่อง', 'noun', 'theme (of a story)'),
    'ผู้ประพันธ์': ('ผู้ ประพันธ์', 'noun', 'author; composer'),
    'ตื้นตัน': ('ตื้น ตัน', 'verb', 'to be deeply moved; to be overcome with emotion'),
    'โศกเศร้า': ('โศก เศร้า', 'adj', 'sorrowful; grief-stricken'),
    'เจ็บแค้น': ('เจ็บ แค้น', 'verb', 'to be bitterly resentful'),
    'อิจฉาริษยา': ('อิจฉา ริษยา', 'adj', 'envious and jealous'),
    'หวาดระแวง': ('หวาด ระแวง', 'adj', 'paranoid; suspicious; distrustful'),
    'หวาดหวั่น': ('หวาด หวั่น', 'adj', 'apprehensive; fearful'),
    'ดูแคลน': ('ดู แคลน', 'verb', 'to look down on; to belittle'),
    'เหยียดหยาม': ('เหยียด หยาม', 'verb', 'to insult; to humiliate; to treat with contempt'),
    'เจ้าเล่ห์': ('เจ้า เล่ห์', 'adj', 'cunning; crafty; wily'),
    'ถ่อมตน': ('ถ่อม ตน', 'adj', 'humble; modest; self-effacing'),
    'อ่อนน้อม': ('อ่อน น้อม', 'adj', 'deferential; respectful; meek'),
    'มักน้อย': ('มัก น้อย', 'adj', 'content with little; of few wants'),
    'กระบวนทัศน์': ('กระบวน ทัศน์', 'noun', 'paradigm'),
    'จิตสำนึก': ('จิต สำนึก', 'noun', 'conscience; consciousness; awareness'),
    'ขีดความสามารถ': ('ขีด ความสามารถ', 'noun', 'capability; capacity'),
    'ความโปร่งใส': ('ความ โปร่งใส', 'noun', 'transparency'),
    'เชิงรุก': ('เชิง รุก', 'adj', 'proactive; offensive'),
    'เชิงรับ': ('เชิง รับ', 'adj', 'reactive; defensive'),
    'เชิงโครงสร้าง': ('เชิง โครงสร้าง', 'adj', 'structural'),
    'เชิงระบบ': ('เชิง ระบบ', 'adj', 'systemic; systematic'),
    'ถ่องแท้': ('ถ่อง แท้', 'adv', 'thoroughly; fully (of understanding)'),
    'ลุ่มลึก': ('ลุ่ม ลึก', 'adj', 'profound; deep (of thought)'),
    'รัดกุม': ('รัด กุม', 'adj', 'tight; concise; well-secured'),
    'ถี่ถ้วน': ('ถี่ ถ้วน', 'adj', 'thorough; meticulous'),
    'รอบด้าน': ('รอบ ด้าน', 'adj', 'all-round; comprehensive; on every side'),
    'ขัดกัน': ('ขัด กัน', 'verb', 'to conflict; to contradict each other'),
    'สิ้นพระชนม์': ('สิ้น พระ ชนม์', 'verb', 'to die (of a royal person of high rank)'),
    'โปรดเกล้า': ('โปรด เกล้า', 'verb', 'to graciously command or permit (of the king)'),
    'ทูลเกล้า': ('ทูล เกล้า', 'verb', 'to present (something) to the king'),
    'กราบบังคมทูล': ('กราบ บังคม ทูล', 'verb', 'to address the king (most formally)'),
    'ทั้งนั้น': ('ทั้ง นั้น', 'adv', 'all; without exception'),
    'ประการหนึ่ง': ('ประการ หนึ่ง', 'adv', 'for one thing; in one respect'),
    'อีกประการหนึ่ง': ('อีก ประการ หนึ่ง', 'conj', 'moreover; another point is that'),
    'ซ้ำร้าย': ('ซ้ำ ร้าย', 'conj', 'worse still; to make matters worse'),
    'กอปรกับ': ('กอปร กับ', 'conj', 'coupled with; together with (formal)'),
    'ประกอบกับ': ('ประกอบ กับ', 'conj', 'combined with; added to which'),
    'ตราบที่': ('ตราบ ที่', 'conj', 'as long as'),
    'ตราบเท่าที่': ('ตราบ เท่า ที่', 'conj', 'insofar as; for as long as'),
    'ครั้นแล้ว': ('ครั้น แล้ว', 'conj', 'thereupon; and then (literary)'),
    'ครั้นเมื่อ': ('ครั้น เมื่อ', 'conj', 'when; at the time when (literary)'),
    'บัดนั้น': ('บัด นั้น', 'adv', 'at that moment; thereupon'),
    'ทันใดนั้น': ('ทันใด นั้น', 'adv', 'suddenly; all at once'),
    'ท้ายที่สุด': ('ท้าย ที่สุด', 'adv', 'ultimately; in the end'),
    'ประการสำคัญ': ('ประการ สำคัญ', 'adv', 'most importantly'),
    'โดยปริยาย': ('โดย ปริยาย', 'adv', 'implicitly; by implication'),
    'โดยสุจริต': ('โดย สุจริต', 'adv', 'in good faith; honestly'),
    'โดยประการทั้งปวง': ('โดย ประการ ทั้งปวง', 'adv', 'in every way; in all respects'),
    'กล่าวโดยสรุป': ('กล่าว โดย สรุป', 'adv', 'in summary; to sum up'),
    'สรุปได้ว่า': ('สรุป ได้ ว่า', 'phrase', 'it can be concluded that'),
    'อันที่จริง': ('อัน ที่ จริง', 'adv', 'in fact; actually'),
    'แท้จริงแล้ว': ('แท้จริง แล้ว', 'adv', 'in reality; in truth'),
    'ล้วนแต่': ('ล้วน แต่', 'adv', 'all, without exception; entirely'),
    'เฉกเช่น': ('เฉก เช่น', 'conj', 'just like; just as (literary)'),
    'ดุจดัง': ('ดุจ ดัง', 'conj', 'like; as though (literary)'),
    'ราวกับ': ('ราว กับ', 'conj', 'as if; as though'),
    'เพียงแต่': ('เพียง แต่', 'adv', 'only; merely; just'),
    'อย่างยิ่ง': ('อย่าง ยิ่ง', 'adv', 'extremely; most'),
    'เป็นอันมาก': ('เป็น อัน มาก', 'adv', 'a great deal; very much'),
    'อย่างแท้จริง': ('อย่าง แท้จริง', 'adv', 'truly; genuinely'),
    'โดยสิ้นเชิง': ('โดย สิ้น เชิง', 'adv', 'completely; entirely; utterly'),
    'ตามลำดับ': ('ตาม ลำดับ', 'adv', 'respectively; in order'),
}

LEAD_TOPICS = {'greetings and politeness', 'particles'}

# Swearing and insults are never in a level deck.
SWEARS = {'ฉิบหาย', 'เหี้ย', 'ควาย', 'สัตว์', 'มึง', 'กู', 'ไอ้', 'อี', 'ส้นตีน', 'เย็ด', 'ห่า'}


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
