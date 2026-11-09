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

INVENTORY = {'a1': A1}
