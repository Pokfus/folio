#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

Hebrew has no published graded word list (see `hebrew_level.py`), so a level's
CORE is written here, a topic at a time, for the scope its CEFR descriptor
sets; `select.py` resolves every word against Wiktionary (a word not found
there is reported and dropped, never invented a meaning) and tops the level up
with the commonest remaining words.

Words are written in the modern FULL spelling, unpointed, as Israelis write them
(`דיבר`, `שולחן`); verbs by their past "he" form, the form Wiktionary and every
Hebrew dictionary file them under (`כתב`, not `לכתוב`).  A multi-word entry is
written with underscores (`בוקר_טוב`).

ONE SPELLING, SEVERAL WORDS.  Unpointed Hebrew is full of homographs, so a word
may name the one it means, either by a part of speech after a colon
(`יכול:verb`) or by its POINTED form after an equals sign (`שם=שָׁם` "there",
`שם=שֵׁם` "name") -- the second lets one level teach two words spelt alike, each
its own card.  Without either, the reading whose own forms are commonest leads
(`extract.py`'s per-entry score).
"""

A1 = [
    ('pronouns', 'אני אתה את=אַתְּ הוא היא אנחנו אתם אתן הם הן זה זאת אלה=אֵלֶּה כל מישהו משהו כלום'),
    ('questions', 'מה מי איפה מתי למה איך כמה איזה לאן מאיפה האם'),
    ('prepositions', 'של עם על אל את=אֵת בלי אצל לפני אחרי ליד בין מתחת כמו בשביל עד'),
    ('conjunctions and particles', 'או אבל כי אם גם רק עוד כבר עדיין מאוד הרבה קצת יותר פחות '
                                   'אולי נכון בסדר כן לא אין יש'),
    ('greetings and politeness', 'שלום תודה בבקשה סליחה להתראות בוקר_טוב ערב_טוב לילה_טוב '
                                 'מה_נשמע ברוך_הבא'),
    ('numbers', 'אפס אחד שניים שלושה ארבעה חמישה שישה שבעה שמונה תשעה עשרה עשרים מאה אלף '
                'ראשון שני:adj שלישי חצי מספר'),
    ('time', 'זמן שעה דקה יום לילה בוקר ערב צהריים היום אתמול מחר עכשיו שבוע חודש שנה תמיד '
             'אף_פעם מוקדם מאוחר פעם'),
    ('days', 'יום_ראשון יום_שני יום_שלישי יום_רביעי יום_חמישי יום_שישי שבת=שַׁבָּת'),
    ('family', 'משפחה אמא אבא אח אחות בן בת בעל אישה ילד ילדה סבא סבתא דוד דודה איש גבר:noun חבר חברה תינוק'),
    ('people and yourself', 'שם=שֵׁם גיל ארץ עיר כפר שפה עברית אנגלית עבודה סטודנט מורה רופא '
                            'אדם ישראל'),
    ('food and drink', 'אוכל מים קפה תה חלב לחם ביצה בשר עוף דג פרי תפוח ירק=יָרָק מלח סוכר '
                       'ארוחה ארוחת_בוקר גבינה אורז עוגה מיץ'),
    ('shopping and money', 'כסף שקל מחיר חנות שוק זול יקר קנה מכר שילם'),
    ('the home', 'בית חדר דלת חלון שולחן כיסא מיטה מטבח מקלחת שירותים ספר עט טלפון מפתח דירה'),
    ('the town and getting about', 'רחוב כביש מכונית אוטובוס רכבת כרטיס תחנה מלון בית_חולים '
                                   'בית_ספר אוניברסיטה בנק ימין שמאל ישר שדה_תעופה שם=שָׁם פה כאן'),
    ('the body and feeling ill', 'ראש עין אוזן אף:noun פה=פֶּה יד רגל בטן שן לב חולה כאב תרופה חום'),
    ('weather', 'מזג_אוויר חם קר גשם שמש רוח שלג'),
    ('colours', 'צבע אדום כחול צהוב ירוק שחור לבן'),
    ('describing', 'טוב רע גדול קטן חדש ישן=יָשָׁן יפה שמח עצוב ארוך קצר קל קשה עייף רעב '
                   'מעניין חשוב'),
    ('everyday verbs', 'היה הלך בא אכל שתה ישן:verb ישב עמד ראה שמע אמר קרא כתב הבין ידע רצה '
                       'יכול:verb גר עבד מצא פתח סגר שאל ענה חשב הביא לקח נתן דיבר למד אהב '
                       'עשה נסע יצא נכנס חזר קם שם=שָׂם שכח זכר התחיל עזר לבש שיחק חיכה '
                       'צריך הרגיש'),
]

INVENTORY = {'a1': A1}
