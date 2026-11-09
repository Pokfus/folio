#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

Thai has no published graded word list (see `thai_level.py`), so a level's
CORE is written here, a topic at a time, for the scope its CEFR descriptor
sets; `select.py` resolves every word against Wiktionary (a word not found
there is reported and dropped, never given an invented meaning) and tops the
level up with the commonest remaining words.

A word may carry a part of speech after a colon (`ถูก:adj`) where the
spelling is shared and the level wants one reading first; without one, every
entry is kept and the commonest reading leads the card.  Spellings are
Wiktionary's headwords.

THE CLASSIFIERS ARE A TOPIC OF THEIR OWN at A1: a Thai noun cannot be counted
without one (หมาสองตัว "dog two BODY", two dogs), and a beginner meets คน,
ตัว, อัน and ใบ in the first week.
"""

A1 = [
    ('pronouns', 'ผม ฉัน ดิฉัน คุณ เขา เธอ เรา พวกเรา พวกเขา มัน ท่าน หนู ตัวเอง'),
    ('questions', 'อะไร ใคร ที่ไหน เมื่อไร ทำไม อย่างไร เท่าไร กี่ ไหน ไหม หรือเปล่า'),
    ('particles', 'ครับ ค่ะ คะ นะ สิ ล่ะ'),
    ('greetings and politeness', 'สวัสดี:intj ขอบคุณ ขอโทษ ไม่เป็นไร ยินดี ลาก่อน โชคดี ขอ กรุณา:adv เชิญ'),
    ('yes, no and time words', 'ไม่ ใช่:intj ไม่ใช่ ได้ แล้ว ยัง เคย กำลัง จะ'),
    ('prepositions and conjunctions', 'และ กับ หรือ แต่ เพราะ ถ้า ว่า ก็ ด้วย ที่ ใน บน ใต้ ข้าง '
     'หน้า หลัง ระหว่าง ของ จาก ถึง ให้ สำหรับ ใกล้ ไกล'),
    ('numbers', 'ศูนย์ หนึ่ง สอง สาม สี่ ห้า หก เจ็ด แปด เก้า สิบ ยี่สิบ เอ็ด ร้อย พัน หมื่น แสน ล้าน ครึ่ง แรก'),
    ('classifiers', 'คน ตัว อัน ใบ เล่ม คัน ลูก ชิ้น แก้ว จาน ขวด'),
    ('time', 'เวลา โมง ทุ่ม ชั่วโมง นาที วัน คืน เช้า เย็น บ่าย กลางคืน วันนี้ พรุ่งนี้ เมื่อวาน ตอนนี้ '
     'สัปดาห์ อาทิตย์ เดือน ปี เร็ว ช้า สาย เสมอ บางครั้ง ก่อน'),
    ('days', 'วันจันทร์ วันอังคาร วันพุธ วันพฤหัสบดี วันศุกร์ วันเสาร์ วันอาทิตย์'),
    ('months', 'มกราคม:name กุมภาพันธ์:name มีนาคม:name เมษายน:name พฤษภาคม:name มิถุนายน:name '
     'กรกฎาคม:name สิงหาคม:name กันยายน:name ตุลาคม:name พฤศจิกายน:name ธันวาคม:name'),
    ('family', 'ครอบครัว พ่อ แม่ พี่ น้อง พี่ชาย พี่สาว น้องชาย น้องสาว ลูก ลูกชาย ลูกสาว สามี ภรรยา '
     'แฟน ปู่ ย่า ตา ยาย เด็ก ผู้ชาย ผู้หญิง เพื่อน'),
    ('people and yourself', 'ชื่อ อายุ ประเทศ เมือง ภาษา ภาษาไทย ภาษาอังกฤษ คนไทย งาน นักเรียน ครู หมอ ทำงาน'),
    ('food and drink', 'อาหาร ข้าว น้ำ ชา กาแฟ นม ผลไม้ ผัก เนื้อ หมู ไก่ ปลา กุ้ง ไข่ เกลือ น้ำตาล '
     'เผ็ด หวาน เค็ม เปรี้ยว อร่อย หิว อิ่ม ก๋วยเตี๋ยว มะม่วง กล้วย'),
    ('shopping and money', 'เงิน บาท ราคา แพง ถูก:adj ร้าน ตลาด ซื้อ ขาย จ่าย'),
    ('the home', 'บ้าน ห้อง ประตู หน้าต่าง โต๊ะ เก้าอี้ เตียง ห้องน้ำ ครัว หนังสือ ปากกา โทรศัพท์ กุญแจ'),
    ('the town and getting about', 'ถนน ทาง รถ รถเมล์ รถไฟ แท็กซี่ เครื่องบิน สนามบิน สถานี โรงแรม '
     'โรงพยาบาล โรงเรียน ธนาคาร ร้านอาหาร ซ้าย ขวา ตรง เลี้ยว'),
    ('the body and feeling ill', 'หัว ตา หู จมูก ปาก มือ เท้า ขา ท้อง ฟัน ป่วย เจ็บ ปวด ยา ไข้'),
    ('weather', 'อากาศ ร้อน หนาว ฝน ฝนตก แดด ลม'),
    ('colours', 'สี แดง น้ำเงิน เหลือง เขียว ดำ ขาว'),
    ('describing', 'ใหญ่ เล็ก ใหม่ เก่า สวย ดี สนุก ง่าย ยาก มาก น้อย ทุก บาง สูง ยาว สั้น ดีใจ เหนื่อย สบาย'),
    ('everyday verbs', 'เป็น อยู่ มี ทำ ไป มา กิน ดื่ม นอน ตื่น นั่ง ยืน ดู เห็น ฟัง พูด บอก อ่าน เขียน '
     'เข้าใจ รู้ รู้จัก อยาก ต้องการ ต้อง ช่วย เรียน สอน เดิน วิ่ง หยุด เปิด ปิด ถาม ตอบ คิด เล่น เอา รอ '
     'ลืม จำ ชอบ รัก อาบน้ำ'),
]

INVENTORY = {'a1': A1}
