#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

Persian has no published graded word list (see `persian_level.py`), so a
level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never invented a meaning) and tops the
level up with the commonest remaining words.

A word may carry a part of speech after a colon (`خوب:adj`) where the spelling
is shared and the level wants one reading first; without one, the word's
entries are all kept and the commonest reading leads the card.  A multi-word
entry is written with underscores (`کار_کردن`) -- Persian builds most of its
verbs that way, a noun or adjective with `کردن`, `شدن`, `زدن` or `داشتن`, and a
beginner learns the pair as one verb.  Spellings are the STANDARD written ones
(Iranian Persian, `ی` and `ک`), never the colloquial (`خونه`, `میرم`), which
each card shows beside the standard where Wiktionary gives it.  Matching is
through `fa.fold`, so a short vowel or a joiner written either way resolves.
"""

A1 = [
    ('pronouns', 'من تو او ما شما آنها آن این ایشان خود همه'),
    ('questions', 'چه چی کی کجا چرا چطور چند چقدر کدام آیا'),
    ('prepositions', 'در به از با برای تا بی روی:prep زیر پیش بعد قبل کنار بین نزدیک دور'),
    ('conjunctions and particles', 'و یا اما ولی که اگر چون پس هم را نه بله آره فقط خیلی هنوز دیگر'),
    ('greetings and politeness', 'سلام خداحافظ ممنون مرسی متشکر لطفاً ببخشید خواهش_می‌کنم خوش_آمدید صبح_بخیر شب_بخیر حال'),
    ('numbers', 'یک دو سه چهار پنج شش هفت هشت نه ده یازده دوازده بیست سی صد هزار اول دوم سوم نیم عدد'),
    ('time', 'وقت ساعت دقیقه روز شب صبح عصر ظهر امروز دیروز فردا الان حالا هفته ماه سال همیشه هرگز زود دیر'),
    ('days', 'شنبه یکشنبه دوشنبه سه‌شنبه چهارشنبه پنجشنبه جمعه'),
    ('family', 'خانواده مادر پدر برادر خواهر پسر دختر شوهر زن همسر بچه پدربزرگ مادربزرگ عمو خاله مرد دوست'),
    ('people and yourself', 'اسم سن کشور شهر روستا زبان فارسی انگلیسی کار دانشجو معلم دکتر مردم ایران'),
    ('food and drink', 'غذا آب چای شیر قهوه نان برنج گوشت مرغ ماهی میوه سیب پرتقال سبزی نمک شکر صبحانه ناهار شام'),
    ('shopping and money', 'پول تومان ریال قیمت مغازه بازار ارزان گران خریدن فروختن دادن گرفتن'),
    ('the home', 'خانه اتاق در پنجره میز صندلی تخت آشپزخانه حمام کتاب خودکار تلفن کلید'),
    ('the town and getting about', 'خیابان راه ماشین اتوبوس قطار بلیت ایستگاه هتل بیمارستان مدرسه دانشگاه اداره بانک راست چپ مستقیم فرودگاه'),
    ('the body and feeling ill', 'سر چشم گوش بینی دهان دست پا شکم دندان مریض بیمار درد دارو تب'),
    ('weather', 'هوا گرم سرد باران برف آفتاب باد'),
    ('colours', 'رنگ قرمز آبی زرد سبز سیاه سفید'),
    ('describing', 'خوب بد بزرگ کوچک نو جدید قدیمی زیبا قشنگ خوشحال بلند کوتاه آسان سخت زیاد کم همه چیز کسی'),
    ('everyday verbs', 'بودن داشتن کردن شدن رفتن آمدن خوردن نوشیدن خوابیدن نشستن دیدن شنیدن گفتن خواندن نوشتن '
                       'فهمیدن دانستن خواستن توانستن ماندن زندگی_کردن کار_کردن پیدا_کردن باز_کردن بستن پرسیدن '
                       'فکر_کردن آوردن بردن زدن گذاشتن شستن پوشیدن'),
]

INVENTORY = {'a1': A1}
