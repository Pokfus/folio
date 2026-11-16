#!/usr/bin/env python3
"""The hand-written topic inventory of each Mongolian level.

Each level is a list of (topic, words): space-separated headwords in Cyrillic as
English Wiktionary files them (a verb by its dictionary form in -х, явах "to
go"), `_` for a space, and `:pos` where the word has entries of several parts of
speech and only one is meant.  A word that is only a pointer page (манай "our",
filed as a form of бид "we") resolves to the word it points to.  A word not in
Wiktionary is reported by select.py and dropped -- never invented, never glossed
by hand.

A1 IS SCOPED TO THE CEFR A1 DESCRIPTOR (`mongolian_level.SCOPE`).  Every word
below was looked up in the extract before it was written here (2026-11-16).

WHAT A1 WOULD HAVE AND ENGLISH WIKTIONARY HAS NOT GOT (2026-11-16), so the deck
cannot teach it: та нар "you (plural)", тэдгээр "those", аль "which",
хэчнээн "how many", үд "noon", хэзээ ч "never", удахгүй "soon", элсэн чихэр
"sugar", ундаа "soft drink", амттай "tasty", зарах "to sell", хямд "cheap", гал
тогоо "kitchen", угаалгын өрөө "bathroom", зогсоол "stop, car park", урд "in
front, south", доор "below", ойр "near", наана / цаана "this side / that
side", сэрүүн "cool", саарал "grey", ягаан "pink", хичээл "lesson", ажиллах
"to work", дуусах "to end", дуртай "fond of", хувцаслах "to dress", дуудах "to
call", буцах "to return", удаан "slow", хялбар "easy", хэцүү "difficult",
үзэсгэлэнтэй "beautiful", хөөрхөн "pretty", ядуу "poor", зөв "right,
correct", гэхдээ "but", эсвэл "or", тэгээд "and then", хэрэв "if".  дугуй is
filed only as "circle", so it is not taught for "bicycle, wheel".

A2 IS SCOPED TO THE CEFR A2 DESCRIPTOR, looked up the same way (2026-11-16).
Nine of the twelve months are here: English Wiktionary has no долдугаар сар
"July", арван нэгдүгээр сар "November" or арван хоёрдугаар сар "December".  Nor
these, which A2 would have: хормой "skirt", даашинз "dress", цүнх "bag",
цагаан сар "the lunar new year", төрсөн өдөр "birthday", сувилагч "nurse",
инженер "engineer", дарга "boss", нагац "maternal relative", хадам "in-law",
хүргэн "son-in-law", гэрлэх "to marry", айдас "fear", ичих "to be ashamed",
гуниг "sorrow", жаргал "happiness", вокзал "station", говь "Gobi, desert",
хашаа "fence, yard", ишиг "kid (goat)", эрүүл "healthy", эм сан "pharmacy",
халуурах "to have a fever", данх "kettle", шүүгээ "cupboard", ярилцах "to talk
together", шийдэх "to decide", утасдах "to phone", авчрах "to bring", хадгалах
"to keep", эвдрэх "to break", хэмжих "to measure", оролдох "to try",
үргэлжлэх "to continue", бэлтгэх "to prepare", гоё "nice", муухай "ugly",
ухаантай "clever", тэнэг "stupid", чимээгүй "quiet", аюулгүй "safe", ховор
"rare", амархан "easy", хүчтэй "strong".
"""

INVENTORY = {
    'a1': [
        ('greetings and politeness',
         'сайн_байна_уу баярлалаа уучлаарай баяртай тийм:particle үгүй:particle за болно гуйх'),
        ('people and the family',
         'хүн эрэгтэй эмэгтэй хүүхэд нялх ээж эх:noun аав эцэг ах эгч дүү нөхөр эхнэр гэр_бүл '
         'найз нэр охин хүү эмээ өвөө хөрш зочин'),
        ('the pronouns and pointing words',
         'би чи та тэр тэд бид энэ эдгээр өөр миний чиний түүний манай танай'),
        ('question words',
         'юу хэн хаана хэзээ яагаад яаж хэд хэдэн ямар уу вэ'),
        ('numbers',
         'тэг нэг хоёр гурав дөрөв тав зургаа долоо найм ес арав хорь гуч дөч тавь жар дал ная ер '
         'зуу мянга сая хагас нэгдүгээр'),
        ('time and the calendar',
         'цаг минут секунд өдөр шөнө өглөө орой долоо_хоног сар жил он өнөөдөр маргааш өчигдөр '
         'одоо дараа өмнө үргэлж заримдаа эрт даваа мягмар лхагва пүрэв баасан бямба ням хавар '
         'зун намар өвөл'),
        ('food and drink',
         'хоол ус цай сүү талх мах будаа гурил өндөг загас жимс ногоо алим давс шар_айраг архи '
         'кофе айраг бууз хуушуур идэх уух өлсөх цангах'),
        ('money and shopping',
         'мөнгө төгрөг:noun үнэ дэлгүүр зах худалдах худалдаж_авах төлөх үнэтэй'),
        ('the home',
         'гэр байшин байр өрөө хаалга цонх ширээ сандал ор:noun жорлон түлхүүр гэрэл'),
        ('the town and getting about',
         'хот тосгон гудамж зам зочид_буудал эмнэлэг банк ресторан музей талбай гүүр машин '
         'автобус галт_тэрэг нисэх_онгоц такси морь буудал'),
        ('where things are',
         'баруун зүүн хойд дээр дотор гадна хол энд тэнд'),
        ('the body and feeling ill',
         'бие толгой нүүр нүд чих хамар ам шүд гар хөл хуруу үс зүрх гэдэс өвдөх өвчин эмч эм:noun '
         'ханиад'),
        ('the weather',
         'цаг_агаар нар бороо цас салхи үүл халуун хүйтэн дулаан тэнгэр'),
        ('colours',
         'өнгө улаан цагаан хар шар ногоон хөх:adj цэнхэр бор'),
        ('animals',
         'амьтан нохой муур үхэр хонь ямаа тэмээ шувуу мал'),
        ('school and work',
         'сургууль анги багш оюутан сурагч ном үзэг харандаа цаас шалгалт ажил ажилчин оффис '
         'компани'),
        ('languages',
         'хэл монгол англи орос хятад үг өгүүлбэр'),
        ('the everyday verbs',
         'байх болох явах ирэх очих гарах орох суух зогсох унтах сэрэх үзэх харах сонсох ярих '
         'хэлэх асуух хариулах мэдэх ойлгох сурах заах унших бичих хийх тоглох хүсэх хайх олох '
         'өгөх авах тавих хүлээх нээх хаах эхлэх туслах хайрлах чадах угаах алхах гүйх амрах '
         'санах мартах эргэх'),
        ('describing things',
         'том жижиг их бага сайн муу шинэ хуучин:adj залуу хөгшин урт богино өндөр намхан хүнд '
         'хөнгөн хурдан сайхан баян буруу олон цөөн бүх бүр ганц'),
        ('joining words',
         'ба болон бас мөн харин буюу учир гэж ч л маш хамт биш:verb'),
    ],
    'a2': [
        ('clothes',
         'хувцас гутал малгай цамц өмд дээл бээлий оймс хүрэм пальто товч:noun халаас'),
        ('the months and the holidays',
         'нэгдүгээр_сар хоёрдугаар_сар гуравдугаар_сар дөрөвдүгээр_сар тавдугаар_сар '
         'зургаадугаар_сар наймдугаар_сар есдүгээр_сар аравдугаар_сар наадам баяр'),
        ('work and jobs',
         'жолооч цагдаа тогооч худалдагч зураач дуучин тариачин малчин ажилтан цалин албан_газар'),
        ('relatives and the stages of life',
         'авга бэр ач зээ өнчин хурим салах үхэх'),
        ('feelings',
         'уур инээх уйлах баярлах уурлах айх аз жаргалтай хайр'),
        ('travel',
         'аялал жуулчин паспорт виз тасалбар нисэх_буудал газрын_зураг гааль ачаа чемодан'),
        ('the countryside and the herds',
         'хөдөө нуур ой цэцэг өвс чулуу элс мөс худаг адуу үнээ тугал унага хурга чоно үнэг '
         'баавгай туулай хулгана могой бүргэд'),
        ('the body and health',
         'өвчтэй шарх цус яс нуруу хөлрөх хоолой тариа'),
        ('food and the kitchen',
         'шөл гоймон төмс лууван байцаа сонгино сармис тос цөцгий тараг бяслаг ааруул чихэр '
         'жигнэмэг аяга таваг халбага сэрээ хутга тогоо'),
        ('the things of a home',
         'тавилга хивс толь зурагт:noun радио утас компьютер хөргөгч зуух:noun шал хана дээвэр шат'),
        ('talking and deciding',
         'хэлэлцэх сонгох татгалзах тайлбарлах итгэх бодох мэдээ захидал'),
        ('the everyday verbs of doing',
         'унах засах цэвэрлэх хаях нэмэх хасах тоолох үнэрлэх дуусгах хүлээн_авах'),
        ('describing things',
         'цэвэр бохир зузаан нимгэн хуурай нойтон хатуу зөөлөн хөгжилтэй аюултай энгийн сул'),
    ],
}
