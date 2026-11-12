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

# A2 (2026-11-12): the topics of the CEFR A2 descriptor (`persian_level.SCOPE`),
# Hindi's A2 topic list carried over and rewritten for Iran.  Words A1 teaches
# are skipped by `select.py`, so a repeat here costs nothing.
A2 = [
    ('relatives and people', 'فامیل عمه دایی نوه پسرعمو دخترعمو عروس داماد پدرشوهر مادرشوهر دوقلو مهمان همسایه بزرگسال نوزاد'),
    ('work and study', 'شغل کارمند کارگر کارفرما مرخصی کلاس امتحان دفتر درس موضوع جواب سؤال حقوق تمرین دانش‌آموز رشته'),
    ('jobs', 'کشاورز فروشنده آشپز وکیل راننده پرستار مهندس پزشک نانوا آرایشگر خبرنگار'),
    ('clothes and shopping', 'پیراهن شلوار کفش جوراب کلاه کیف کت دامن روسری چادر عینک انگشتر جیب تخفیف اندازه'),
    ('food and cooking', 'روغن ادویه فلفل پیاز سیر سیب‌زمینی گوجه‌فرنگی ماست پنیر تخم_مرغ کره بستنی کباب خورش بشقاب لیوان قاشق چنگال چاقو مزه شیرین ترش تلخ تند گرسنه تشنه'),
    ('the home', 'سقف دیوار زمین:noun پله حیاط کمد آینه چراغ قفل اجاره بالش فرش یخچال کوچه'),
    ('the town', 'مسجد کلیسا رودخانه دریاچه پل میدان محله پارک اداره_پست کتابخانه رستوران سینما موزه داروخانه'),
    ('the countryside and animals', 'مزرعه درخت گل برگ کوه جنگل دریا آسمان ابر ستاره خورشید خاک پرنده گربه گاو گوسفند اسب مرغ'),
    ('seasons and directions', 'فصل بهار تابستان پاییز زمستان شمال جنوب شرق غرب'),
    ('months', 'فروردین اردیبهشت خرداد تیر مرداد شهریور مهر آبان آذر دی بهمن اسفند'),
    ('numbers', 'سیزده چهارده پانزده شانزده هفده هجده نوزده چهل پنجاه شصت هفتاد هشتاد نود میلیون جفت'),
    ('travel', 'سفر مسافرت هواپیما کشتی قایق تاکسی گذرنامه نقشه آدرس چمدان مسافر'),
    ('health and the body', 'بدن گلو گردن شانه کمر سینه انگشت ناخن مو زانو قلب سرفه سرما بیماری زخم'),
    ('feelings and character', 'عصبانی شادی غم خجالت تعجب تنها مهربان باهوش تنبل صادق آرام ترس ناراحت خسته'),
    ('free time', 'ورزش فوتبال آواز عکس داستان شعر سرگرمی باغ جشن عید تولد هدیه موسیقی'),
    ('telling what happened', 'ناگهان بعدا گاهی پارسال گذشته آینده'),
    ('giving an opinion', 'شاید حتما کاملا راستش دروغ نظر دوست_داشتن موافق مخالف'),
    ('describing', 'عمیق پهن لاغر چاق سنگین سبک فقیر ثروتمند جوان پیر خیس تازه شلوغ خالی نرم تمیز کثیف'),
    ('everyday verbs', 'راندن دویدن شنا_کردن رسیدن رها_کردن برگشتن فرستادن پختن بریدن شکستن درست_کردن یاد_گرفتن یاد_دادن '
                       'فراموش_کردن گم_کردن جستجو_کردن بردن:verb باختن کمک_کردن شروع_کردن سعی_کردن بیدار_شدن '
                       'گریه_کردن خندیدن رقصیدن پوشیدن نشان_دادن تمام_شدن خرج_کردن'),
]

# B1 (2026-11-12): the topics of the CEFR B1 descriptor, Hindi's B1 list carried
# over and rewritten for Iran.  Words the levels below teach are skipped.
B1 = [
    ('work and the economy', 'تجارت صنعت کارخانه درآمد بیکار بیکاری مالیات بودجه اقتصاد سرمایه‌گذاری پس‌انداز وام بهره قرارداد استخدام مصاحبه تولید مشتری سود ضرر تورم بازنشسته'),
    ('education', 'آموزش تحصیل مدرک دبیرستان دبستان معلم ریاضی جغرافیا تاریخ ادبیات پژوهش مقاله نمره بورس کنکور'),
    ('the news, media and technology', 'اخبار روزنامه مجله رادیو تبلیغ مقاله خبرنگار اینترنت کامپیوتر رایانه موبایل سایت ایمیل پیام فناوری نرم‌افزار برنامه شبکه'),
    ('government, law and society', 'حکومت انتخابات دموکراسی مجلس رئیس‌جمهور وزیر سیاست دادگاه قاضی قانون جرم شاهد مجازات جریمه حق وظیفه شهروند جامعه فقر مذهب آزادی اعتراض انقلاب'),
    ('the environment and weather', 'محیط_زیست آلودگی آب‌وهوا دما سیل خشکسالی زلزله طوفان مه طبیعت زباله انرژی بازیافت'),
    ('health and medicine', 'سلامت درمان واکسن قرص آمپول جراحی حساسیت سرگیجه تهوع عفونت وزن رژیم ورزش پرستار مطب'),
    ('travel and transport', 'ترافیک بنزین سرعت تصادف رزرو_کردن مرز ویزا توریست جهانگرد گمرک مترو'),
    ('the household and chores', 'تمیز_کردن جارو ظرف ظرفشویی ماشین_لباسشویی اجاق قبض تعمیر'),
    ('relationships and life', 'رابطه ازدواج عروسی طلاق نامزد تولد کودکی جوانی پیری مرگ نسل عشق دوستی دعوا اعتماد آبرو'),
    ('feelings and character', 'احساس نگرانی امید ناامید حسادت غرور رضایت صبر شجاعت اخلاق شخصیت اعتماد_به_نفس اضطراب افسردگی'),
    ('religion and festivals', 'خدا دین مذهبی نماز روزه رمضان نوروز سنت رسم فرهنگ زیارت'),
    ('ideas, reasons and plans', 'فکر علت هدف برنامه رویا تجربه پیشنهاد استدلال نظریه واقعیت مثال شرط وضعیت فرصت موفقیت شکست پیشرفت توسعه تغییر اهمیت منظور معنی'),
    ('connectors', 'با_این_حال یعنی مثل تا_وقتی_که چون بلکه وگرنه اگرچه هرچند بنابراین ضمنا سپس سرانجام'),
    ('describing', 'مدرن باستانی سنتی عمومی خصوصی ضروری ممکن غیرممکن مفید مشهور محبوب موفق مسئول منصف اجتماعی سیاسی اقتصادی فرهنگی'),
    ('verbs of thinking and changing', 'قبول_کردن انتخاب_کردن بحث_کردن توضیح_دادن عوض_کردن بهبود افزایش_یافتن کاهش نجات_دادن فرار_کردن کشف_کردن به_دست_آوردن خرج_کردن قرض فروختن خواهش_کردن باور_کردن توجه_کردن تصمیم_گرفتن'),
]

# B2 (2026-11-12): the topics of the CEFR B2 descriptor, Hindi's B2 list carried
# over and rewritten for Iran.  Words the levels below teach are skipped.
B2 = [
    ('politics and administration', 'مدیریت حاکمیت قدرت ائتلاف رأی‌گیری رأی‌دهنده نامزد تبلیغ اکثریت اقلیت قانون_اساسی لایحه اصلاح بوروکراسی فساد رسوایی دیپلماسی سفیر سفارت استقلال حاکم'),
    ('the law and the courts', 'شکایت متهم شهادت مدرک حکم تجدید وثیقه بازداشت مجرم قربانی تخلف کیفر'),
    ('economy and finance', 'سرمایه رکود صادرات واردات یارانه بدهی مصرف تولید رقابت خصوصی‌سازی معامله ارز تحریم'),
    ('science and research', 'دانشمند آزمایش نتیجه_گرفتن تحلیل آمار نظرسنجی پژوهش کشف اختراع نظریه شیمی فیزیک زیست‌شناسی محاسبه اندازه_گرفتن مولکول سلول'),
    ('technology', 'فناوری ابزار دستگاه دیجیتال داده امنیت حریم کاربر هوش_مصنوعی'),
    ('environment and resources', 'محیط_زیست حفاظت آلودگی انتشار معدن تغییر_اقلیم گرمایش_زمین خشکسالی قحطی خورشیدی'),
    ('health and the mind', 'روانشناسی روانی افسردگی استرس اضطراب اعتیاد درمان تشخیص همه‌گیری ایمنی معلول'),
    ('arts, literature and media', 'هنر هنرمند نقاشی مجسمه موسیقی آهنگساز رمان رمان شاعر نویسنده شخصیت نقد منتقد بررسی انتشار ویرایش پخش خوشنویسی'),
    ('history and society', 'مورخ تمدن عصر امپراتوری مستعمره انقلاب شورش جنبش اصلاح‌طلب برابری نابرابری تبعیض جنسیت روستایی شهری مهاجرت مهاجر پناهنده'),
    ('argument and evaluation', 'استدلال شواهد نتیجه پیامد تأثیر علت جنبه دیدگاه طرف مزیت عیب سود زیان انتقاد حمایت مخالفت زمینه مفهوم برداشت فرض'),
    ('formal connectors', 'لذا بنابراین با_وجود بلکه نیز همچنین چنانچه یعنی وگرنه زیرا'),
    ('describing', 'مؤثر کافی بی‌طرف مغرض گسترده محدود دائمی موقت اجبار اختیاری نسبی پیوسته حساس شفاف'),
    ('verbs of reporting and analysing', 'تحلیل مقایسه_کردن نتیجه_گرفتن پذیرفتن انتقاد_کردن حمایت_کردن ارائه_دادن اشاره_کردن پیشنهاد_کردن تأکید_کردن افزودن کاستن'),
]

# C1 (2026-11-12): the topics of the CEFR C1 descriptor, Hindi's C1 list carried
# over and rewritten for Iran.  Written AFTER checking every candidate against
# the Wiktionary extract: only words it has are listed (the ones it lacks are in
# docs/persian-decks-plan.md §10), and words the levels below teach are left out.
C1 = [
    ('philosophy and ethics', 'فیلسوف هستی سعادت شناخت معرفت خرد'),
    ('religion and the inner life', 'عرفان صوفی تصوف توکل نیایش زهد تقوا قیامت آخرت دوزخ امام'),
    ('scholarly Persian', 'پژوهشگر پایان‌نامه ارجاع روش‌شناسی چکیده پیشینه'),
    ('government and the constitution', 'پارلمان استبداد دیکتاتوری نهاد'),
    ('economy and development', 'رفاه سرمایه‌داری سوسیالیسم زیرساخت پایداری'),
    ('medicine and the body', 'بافت دیابت'),
    ('law and rights', 'حقوق_بشر آزادی_بیان شهروندی'),
    ('language and literature', 'واژگان گویش نثر غزل قصیده رباعی مثنوی دیوان حماسه'),
    ('feeling and judgement', 'دلتنگی حسرت انزجار شوق کینه'),
    ('abstract nouns of formal prose', 'رویکرد ضرورت تعامل تقابل'),
    ('adjectives of formal prose', 'بنیادی پیچیده آشکار ضمنی صریح ذاتی عینی'),
    ('literary connectors and adverbs', 'گرچه'),
]

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1, 'b2': B2, 'c1': C1}
