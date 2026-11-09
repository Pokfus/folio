#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

Bengali has no published graded word list for learners (see `bengali_level.py`),
so a level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never invented a meaning) and tops the
level up with the commonest remaining words.

A word may carry a part of speech after a colon (`খাওয়া:verb`) where the
spelling is shared and the level wants one reading first; without one, the
word's entries are all kept and the commonest reading leads the card.  An
underscore joins a multi-word entry (`দয়া_করে`).  Spellings are Wiktionary's
headwords; matching is through `bn.fold`.

TWO STANDARDS.  Bengali is written alike on both sides of the border, but a
few everyday words differ between West Bengal and Bangladesh: water is `জল`
in Kolkata and `পানি` in Dhaka, a greeting `নমস্কার` or `সালাম`.  Where they
differ at this level the inventory takes BOTH, and Wiktionary's labels say
which is which.
"""

A1 = [
    ('pronouns', 'আমি তুমি আপনি তুই সে তিনি ও এ আমরা তোমরা আপনারা তারা ওরা আমার তোমার আপনার এটা ওটা সেটা এই ওই সেই নিজ'),
    ('questions', 'কী কে কোথায় কখন কেন কেমন কীভাবে কত কোন'),
    ('postpositions', 'জন্য থেকে সাথে সঙ্গে কাছে দিয়ে নিয়ে আগে পরে উপরে নিচে ভিতরে বাইরে সামনে পিছনে পর্যন্ত মধ্যে মতো'),
    ('conjunctions and particles', 'আর এবং বা কিন্তু তাই যদি কারণ তো না নেই হ্যাঁ আচ্ছা শুধু খুব আরও'),
    ('greetings and politeness', 'নমস্কার সালাম ধন্যবাদ দুঃখিত স্বাগত বিদায় ঠিক ভালো দয়া_করে'),
    ('numbers', 'এক দুই তিন চার পাঁচ ছয় সাত আট নয়:num দশ এগারো বারো বিশ পঞ্চাশ একশ হাজার প্রথম দ্বিতীয় তৃতীয়'),
    ('time', 'সময় ঘণ্টা মিনিট দিন রাত সকাল বিকাল সন্ধ্যা দুপুর আজ কাল পরশু এখন সপ্তাহ মাস বছর দেরি সবসময় কখনও তাড়াতাড়ি'),
    ('days', 'সোমবার মঙ্গলবার বুধবার বৃহস্পতিবার শুক্রবার শনিবার রবিবার'),
    ('family', 'পরিবার মা বাবা ভাই বোন ছেলে মেয়ে স্বামী স্ত্রী দাদা দিদি বাচ্চা লোক মানুষ বন্ধু'),
    ('people and yourself', 'নাম বয়স দেশ শহর গ্রাম ভাষা বাংলা কাজ ছাত্র শিক্ষক ডাক্তার'),
    ('food and drink', 'খাবার জল পানি চা দুধ কফি রুটি ভাত ডাল সবজি ফল আম কলা আপেল ডিম মাংস মাছ লবণ চিনি মিষ্টি'),
    ('shopping and money', 'টাকা দাম দোকান বাজার সস্তা কেনা বিক্রি দেওয়া নেওয়া'),
    ('the home', 'বাড়ি ঘর দরজা জানালা টেবিল চেয়ার বিছানা রান্নাঘর বই কলম ফোন চাবি'),
    ('the town and getting about', 'রাস্তা গাড়ি বাস ট্রেন টিকিট হোটেল হাসপাতাল স্কুল অফিস ব্যাংক ডান বাম দূর সোজা'),
    ('the body and feeling ill', 'মাথা চোখ কান নাক মুখ হাত পা পেট দাঁত অসুস্থ ব্যথা ওষুধ জ্বর'),
    ('weather', 'আবহাওয়া গরম ঠান্ডা বৃষ্টি রোদ বাতাস শীত'),
    ('colours', 'রং লাল নীল হলুদ সবুজ কালো সাদা'),
    ('describing', 'বড় ছোট নতুন পুরানো সুন্দর খারাপ খুশি লম্বা মোটা সহজ কঠিন বেশী কম অনেক সব কিছু কেউ'),
    ('everyday verbs', 'হওয়া আছে করা যাওয়া আসা খাওয়া:verb ঘুমানো ওঠা বসা দেখা শোনা বলা পড়া লেখা বোঝা জানা চাওয়া পারা থাকা চলা পাওয়া দাঁড়ানো খোলা বন্ধ জিজ্ঞাসা ভাবা কথা'),
]

INVENTORY = {'a1': A1}
