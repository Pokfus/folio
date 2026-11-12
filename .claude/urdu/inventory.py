#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

Urdu has no published graded word list for learners (see `urdu_level.py`), so a
level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never invented a meaning) and tops the
level up with the commonest remaining words.

A word may carry a part of speech after a colon (`کھانا:verb`) where the
spelling is shared and the level wants one reading first; without one, the
word's entries are all kept and the commonest reading leads the card.  An
underscore joins a multi-word entry (`کے_لیے`).  Spellings are written without
vowel marks, as Urdu is; matching is through `ur.fold`, so a mark, or an Arabic
yeh or kaf, written either way still resolves.

WIKTIONARY'S URDU IS THINNER THAN ITS HINDI, and the A1 list was cut to what it
defines (2026-11-09): it has no entry for `تک`, `دیر`, `چچا`, `ٹرین`, `رکنا`,
`مہربانی`, or the compound postpositions `کے سامنے`, `کے پیچھے`, `کے نیچے`, and
files several words under their other spelling (`کمرہ`, `پیسہ`, `اسپتال`,
`دوائی`, `کے لئے`, `گھنٹہ`), which the list uses.  `امی` is filed as a spelling of
`اما`, whose first entry is the conjunction "but", so the list has `اماں`.  A word is never given a meaning
Wiktionary does not give it.

The register is everyday Pakistani Urdu: `شکریہ`, `خدا_حافظ`, `ہفتہ` for the week
and for Saturday, `اتوار` and `پیر` for Sunday and Monday.
"""

A1 = [
    ('pronouns', 'میں تم آپ وہ یہ ہم تو میرا تمہارا آپ_کا اس_کا ہمارا ان_کا اپنا'),
    ('questions', 'کیا کون کہاں کب کیوں کیسے کتنا کون_سا'),
    ('postpositions', 'کا کو سے میں پر نے کے_لئے کے_ساتھ بعد پاس بغیر اوپر باہر اندر'),
    ('conjunctions and particles', 'اور یا لیکن مگر کہ تو بھی ہی نہیں نہ مت ہاں جی اگر کیونکہ'),
    ('greetings and politeness', 'سلام شکریہ معاف خوش_آمدید خدا_حافظ ٹھیک اچھا'),
    ('numbers', 'ایک دو تین چار پانچ چھ سات آٹھ نو دس گیارہ بارہ بیس پچاس سو ہزار پہلا دوسرا تیسرا آدھا'),
    ('time', 'وقت گھنٹہ منٹ دن رات صبح شام دوپہر آج کل پرسوں ابھی ہفتہ مہینا سال بجے جلدی ہمیشہ کبھی'),
    ('days', 'پیر منگل بدھ جمعرات جمعہ اتوار'),
    ('family', 'خاندان ماں اماں والد ابا باپ بھائی بہن بیٹا بیٹی شوہر بیوی دادا دادی نانا نانی بچہ لڑکا لڑکی آدمی عورت دوست'),
    ('people and yourself', 'نام عمر ملک شہر گاؤں زبان اردو انگریزی کام طالب_علم استاد ڈاکٹر لوگ'),
    ('food and drink', 'کھانا:noun پانی چائے دودھ کافی روٹی چاول دال سبزی پھل آم کیلا سیب انڈا گوشت مچھلی نمک چینی مٹھائی ناشتا'),
    ('shopping and money', 'پیسہ روپیہ قیمت دکان بازار سستا مہنگا خریدنا بیچنا دینا لینا'),
    ('the home', 'گھر کمرہ دروازہ کھڑکی میز کرسی بستر باورچی_خانہ کتاب قلم فون چابی'),
    ('the town and getting about', 'سڑک راستہ گاڑی بس ٹکٹ اسٹیشن ہوٹل اسپتال اسکول دفتر بینک دایاں بایاں دور پاس سیدھا'),
    ('the body and feeling ill', 'سر آنکھ کان ناک منہ ہاتھ پاؤں پیٹ دانت بیمار درد دوائی بخار'),
    ('weather', 'موسم گرمی سردی بارش دھوپ ہوا ٹھنڈا گرم'),
    ('colours', 'رنگ لال نیلا پیلا ہرا کالا سفید'),
    ('describing', 'بڑا چھوٹا نیا پرانا خوبصورت برا خوش لمبا موٹا آسان مشکل زیادہ کم بہت سب کچھ کوئی'),
    ('everyday verbs', 'ہونا کرنا جانا آنا کھانا:verb پینا سونا:verb اٹھنا بیٹھنا دیکھنا سننا بولنا کہنا پڑھنا لکھنا سمجھنا جاننا چاہنا سکنا رہنا چلنا ملنا کھولنا بند پوچھنا بتانا سوچنا'),
]

A2 = [
    ('relatives and people', 'رشتہ_دار چچی ماموں ممانی خالہ آنٹی تایا بھتیجا بھتیجی بھانجا پوتا سسر ساس داماد بہو جڑواں مہمان پڑوسی'),
    ('work and study', 'نوکری نوکر مالک چھٹی کالج جامعہ جماعت امتحان کاپی شاگرد سبق مضمون جواب سوال تنخواہ محنت'),
    ('jobs', 'پولس کسان سوداگر دکان_دار باورچی'),
    ('clothes and shopping', 'کپڑا قمیص پتلون پاجامہ جوتا موزہ ٹوپی گھڑی چشمہ انگوٹھی جیب دوپٹہ'),
    ('food and cooking', 'تیل مصالحہ مرچ پیاز لہسن آلو ٹماٹر مرغی دہی برف پلیٹ پیالہ گلاس چمچ چھری ذائقہ کھٹا کڑوا میٹھا بھوک پیاس'),
    ('the home', 'چھت دیوار فرش سیڑھی صحن الماری آئینہ پنکھا بتی تالا تکیہ'),
    ('the town', 'مسجد مندر گرجا دریا حوض پل چوک محلہ علاقہ تھانہ ہوائی_اڈہ ڈاک_خانہ'),
    ('the countryside and animals', 'کھیت درخت پھول پہاڑ جنگل سمندر آسمان بادل تارا چاند مٹی چڑیا کتا بلی گائے بکری گھوڑا'),
    ('seasons and directions', 'بہار خزاں برسات شمال جنوب مشرق مغرب'),
    ('numbers', 'تیرہ چودہ پندرہ سولہ سترہ اٹھارہ انیس تیس چالیس ساٹھ ستر اسی نوے لاکھ کروڑ درجن جوڑا'),
    ('travel', 'سفر ہوائی_جہاز جہاز کشتی رکشا پاسپورٹ نقشہ پتہ سامان'),
    ('health and the body', 'جسم گلا گردن کندھا کمر سینہ انگلی ناخن بال گھٹنا:noun خون دل کھانسنا زکام بیماری مریض چوٹ طبیعت'),
    ('feelings and character', 'غصہ خوشی دکھ شرم حیران اکیلا مہربان عقل سست ایماندار ڈر اداس'),
    ('free time', 'کھیل کرکٹ فوٹ_بال تصویر کہانی نظم شوق باغ تہوار عید سالگرہ تحفہ فلم'),
    ('telling what happened', 'اچانک دوبارہ روز کبھی_کبھار گزشتہ اگلا'),
    ('giving an opinion', 'شاید ضرور بالکل اصل_میں سچ جھوٹ رائے پسند'),
    ('describing', 'گہرا چوڑا پتلا بھاری ہلکا غریب امیر جوان گیلا تازہ مصروف خالی نرم سخت صاف گندہ'),
    ('everyday verbs', 'چلانا دوڑنا تیرنا پہنچنا چھوڑنا لوٹنا بھیجنا دھونا:verb پکانا پہننا کاٹنا توڑنا بنانا سیکھنا سکھانا بھولنا یاد کھونا ڈھونڈنا جیت ہار بھرنا انتظار_کرنا مدد شروع_کرنا کوشش جاگنا رونا ہنسنا ناچنا مارنا لگنا'),
]

B1 = [
    ('work and the economy', 'کاروبار صنعت آمدنی بے_روزگاری معیشت بچت قرض مزدور معاہدہ درخواست ملاقات نقصان تجارت'),
    ('education', 'تعلیم پڑھائی استاد نصاب سائنس ریاضی جغرافیہ تاریخ ادب تحقیق کتب_خانہ لائبریری نتیجہ'),
    ('the news, media and technology', 'خبر اخبار رسالہ ٹیلی_ویژن اشتہار صحافی انٹرنیٹ کمپیوٹر موبائل ای_میل پیغام'),
    ('government, law and society', 'حکومت انتخاب جمہوریت وزیر_اعظم وزیر سیاست عدالت جج قانون جرم گواہ سزا جرمانہ حق فرض شہری معاشرہ مسئلہ افلاس مذہب ذات آزادی تحریک'),
    ('the environment and weather', 'ماحول آلودگی آب_و_ہوا درجہ_حرارت سیلاب زلزلہ طوفان آندھی دھند شبنم قدرت توانائی'),
    ('health and medicine', 'صحت علاج گولی سوئی الرجی چکر قے اسہال وزن ورزش غذا'),
    ('travel and transport', 'مسافر پیٹرول رفتار حادثہ سرحد سیاح سیاحت'),
    ('the household and chores', 'صفائی جھاڑو برتن چولہا گیس مرمت'),
    ('relationships and life', 'رشتہ شادی نکاح طلاق منگنی پیدائش بچپن جوانی بڑھاپا موت نسل تعلق محبت دوستی جھگڑا بھروسہ عزت'),
    ('feelings and character', 'جذبہ فکر امید حسد غرور اطمینان صبر ہمت مزاج شخصیت اعتماد اضطراب گھبرانا'),
    ('religion and festivals', 'خدا اللہ مذہبی دعا جشن روایت رسم ثقافت زیارت'),
    ('ideas, reasons and plans', 'خیال وجہ مقصد منصوبہ ہدف تجربہ مشورہ استدلال اصول حقیقت مثال صورت_حال موقع کامیابی ترقی تبدیل اہمیت مطلب معنی'),
    ('connectors', 'تاہم یعنی کی_طرح بلکہ ورنہ حالانکہ البتہ'),
    ('describing', 'جدید قدیم عوامی نجی ضروری ممکن ناممکن مشہور مقبول کامیاب مناسب بیجا سیاسی اقتصادی'),
    ('verbs of thinking and changing', 'ماننا چننا بحث بدلنا سدھارنا بڑھنا گھٹنا:verb بچانا بچنا جستجو پانا کمانا خرچ ادھار بیچنا مانگنا یقین توجہ'),
]

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1}
