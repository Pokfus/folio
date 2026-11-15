#!/usr/bin/env python3
"""The hand-written topic inventory of each Burmese level.

Each level is a list of (topic, words): space-separated headwords in the Myanmar
script as English Wiktionary files them, and `:pos` (several joined by `+`) where
the spelling has entries of several parts of speech and only those are meant --
which in Burmese is most of the short words: ကို is a form of address, the object
particle and "to"; တစ် is "to cut" and "one"; ငါး "fish" and "five".  The card then
shows only the entries of that part of speech.  A word not in Wiktionary is
reported by select.py and dropped -- never invented, never glossed by hand.

THE SPOKEN LANGUAGE.  Burmese has two registers: the written, literary one
(သည်, ၏, နှင့်, ဤ) and the spoken one (တယ်, ရဲ့, နဲ့, ဒီ).  A1 teaches the SPOKEN
words, which a beginner says and hears; the Wikipedia that orders the cards is
written in the literary one, so `select.EXCLUDE` keeps its particles out of A1's
fill (they are a reader's words, for a later level).

A1 IS SCOPED TO THE CEFR A1 DESCRIPTOR (`burmese_level.SCOPE`).  Every word below
was looked up in the extract before it was written here (2026-11-15).

WHAT A1 WOULD HAVE AND ENGLISH WIKTIONARY HAS NOT GOT (2026-11-15), so the deck
cannot teach it: ဖေဖေ "dad" (မေမေ "mum" is there), ယောက်ျားလေး "boy", ကုတင် /
ခုတင် "bed", ရေချိုးခန်း "bathroom", ဆိုင်ကယ် "motorcycle", ဗိုက်နာ "to have a
stomach ache", ဘာကြောင့် "why" (ဘာလို့ is taught), ဒါကြောင့် "so, therefore",
ဈေးပေါ "cheap" (ပေါ is taught), the phrases မဟုတ်ဘူး "no, it isn't" and
နေကောင်းလား "how are you?" (a phrases deck's matter), and the names မြန်မာ
"Myanmar, Burmese" and ရန်ကုန် "Yangon".
"""

INVENTORY = {
    'a1': [
        ('greetings and politeness',
         'မင်္ဂလာပါ ကျေးဇူး ကျေးဇူးတင် ဆောရီး ဟုတ်ကဲ့ ဟုတ် ရပါတယ် တာ့တာ ခင်ဗျာ ရှင်:particle '
         'ပါ:particle ခွင့်ပြု'),
        ('pronouns and pointing words',
         'ကျွန်တော် ကျွန်မ ငါ နင် မင်း:pron ခင်ဗျား သူ:pron သူမ ကျွန်တော်တို့ ငါတို့ သူတို့ '
         'ဒီ ဟို ဒါ အဲဒါ အဲဒီ ဟိုဟာ ဒီမှာ ဟိုမှာ ကိုယ်:pron'),
        ('question words',
         'ဘာ ဘယ်သူ ဘယ်လို ဘယ်တော့ ဘယ်လောက် ဘယ်နှစ် ဘာလို့ လား:particle လဲ:particle'),
        ('the spoken particles',
         'တယ်:particle မယ်:particle ပြီ ဘူး:particle မ:particle နဲ့ ရဲ့ ကို:particle+postp '
         'မှာ က:particle+postp မှ:postp ပဲ:particle နော် ရင်:conj ပေမဲ့ ဒါပေမဲ့ ပြီးတော့ '
         'ဖို့:particle နေ:particle ခဲ့ ချင် နိုင်:verb တတ် ရ:verb လည်း ကြောင့်'),
        ('people and the family',
         'လူ ယောက်ျား မိန်းမ မိန်းကလေး ကလေး:noun မိသားစု အမေ အဖေ မေမေ အစ်ကို အစ်မ ညီ ညီမ '
         'မောင် သား သမီး ခင်ပွန်း ဇနီး အဘိုး အဘွား ဦးလေး အဒေါ် သူငယ်ချင်း မိတ်ဆွေ '
         'အမျိုးသမီး အမျိုးသား'),
        ('numbers and counting words',
         'သုည တစ်:num နှစ်:num+noun သုံး:num ငါး:num လေး:num ခြောက် ခုနစ် ရှစ် '
         'ကိုး:num ဆယ် ရာ:num ထောင်:num သောင်း သိန်း သန်း:num ယောက်:classifier '
         'ခု:classifier ကောင်:classifier လုံး:classifier'),
        ('time and the days',
         'အချိန် နာရီ မိနစ် နေ့ ရက်:noun ည မနက် ညနေ ဒီနေ့ မနက်ဖြန် မနေ့က ပတ်:classifier '
         'လ:noun အခု အမြဲ ခဏ စောစော နောက်ကျ ကြာ:verb တနင်္လာ အင်္ဂါ ဗုဒ္ဓဟူး ကြာသပတေး '
         'သောကြာ စနေ တနင်္ဂနွေ'),
        ('food and drink',
         'အစားအစာ ထမင်း ရေ:noun လက်ဖက်ရည် ကော်ဖီ နို့ ဘီယာ ပေါင်မုန့် မုန့် ဟင်း ငါး:noun '
         'အသား ကြက်သား ဝက်သား အမဲသား ကြက်ဥ ဆား သကြား ငရုတ် ဟင်းသီးဟင်းရွက် သစ်သီး '
         'ငှက်ပျော သရက် ခေါက်ဆွဲ မုန့်ဟင်းခါး ဆီ ရေခဲ မနက်စာ နေ့လယ်စာ ညစာ စား သောက် '
         'ချက်:verb ဗိုက်ဆာ ရေငတ် စားသောက်ဆိုင် အရသာ ချို:adj ချဉ် စပ်:adj ခါး:adj ငန် '
         'ဇွန်း ခက်ရင်း ပန်းကန် ခွက်:noun ပုလင်း'),
        ('money and shopping',
         'ပိုက်ဆံ ငွေ ကျပ် ဒေါ်လာ ဈေး ဆိုင် ဝယ် ရောင်း ဈေးဝယ် ဈေးကြီး ပေါ:adj ဘဏ်'),
        ('clothes',
         'အင်္ကျီ ဘောင်းဘီ လုံချည် ဖိနပ် ဦးထုပ် ဝတ်'),
        ('the home',
         'အိမ် အခန်း တံခါး ပြတင်းပေါက် စားပွဲ ကုလားထိုင် မီး အိမ်သာ မီးဖိုချောင် '
         'ရေခဲသေတ္တာ တီဗီ ရေဒီယို ဖုန်း ကွန်ပျူတာ အမှိုက်'),
        ('the town and getting about',
         'လမ်း မြို့ ရွာ နိုင်ငံ ကား:noun ဘတ်စ်ကား တက္ကစီ ရထား လေယာဉ် သင်္ဘော စက်ဘီး '
         'လေဆိပ် ဘူတာ ဆေးရုံ ဆေးခန်း ဟိုတယ် ဘုရား:noun ရဲ:noun ညာ ဘယ်:noun ရှေ့ '
         'နောက်:postp+adj အပေါ် အောက် ထဲ အပြင် ဝေး နီး အရှေ့ အနောက် မြောက်:noun '
         'တောင်:noun'),
        ('the body and feeling ill',
         'ခန္ဓာ ခေါင်း မျက်လုံး နား:noun နှာခေါင်း ပါးစပ် လက်:noun ခြေထောက် ဗိုက် '
         'နှလုံး ဆံပင် မျက်နှာ နာ:verb ဖျား:verb ခေါင်းကိုက် ဆေး:noun ဆရာဝန် ကျန်းမာ'),
        ('the weather and nature',
         'ရာသီဥတု မိုး:noun မိုးရွာ နေ:noun လေ:noun နွေ ဆောင်း:noun မိုးရာသီ ပူ အေး '
         'ချမ်း တိမ်:noun ကောင်းကင် ကြယ် ပန်း:noun သစ်ပင် မြစ်:noun ပင်လယ်'),
        ('colours',
         'အရောင် နီ ဖြူ မည်း ပြာ စိမ်း ဝါ:adj'),
        ('animals',
         'တိရစ္ဆာန် ခွေး ကြောင် ကြက် ငှက် နွား မြင်း ဆင်:noun ကျား:noun မြွေ ဝက် ကြွက် မျောက်'),
        ('school and work',
         'ကျောင်း ကျောင်းသား ဆရာ ဆရာမ စာ စာအုပ် ခဲတံ စာမေးပွဲ အလုပ် အလုပ်လုပ် ရုံး '
         'ဘာသာစကား စကား အင်္ဂလိပ် နာမည် ဓာတ်ပုံ ရုပ်ရှင် သီချင်း ဘောလုံး'),
        ('the everyday verbs',
         'သွား လာ ရှိ ဖြစ် လုပ် ပြော ကြည့် မြင် ကြား:verb နားထောင် ဖတ် ရေး အိပ် နိုး:verb '
         'ထ ထိုင် ရပ် လမ်းလျှောက် ပြေး သိ နားလည် ကြိုက် ချစ် လို:verb စောင့် ပြန် ဝင် '
         'ထွက် ရောက် ဖွင့် ပိတ် ခေါ် မေး ဖြေ ကူညီ သင်:verb သင်ယူ ပေး ယူ ထား ရှာ တွေ့ '
         'ကစား ရယ် ငို ပြုံး မေ့ စဉ်းစား ပို့ စ:verb ပြီး ကိုင် ရေချိုး တက်:verb '
         'ဆင်း:verb စီး:verb မောင်း:verb ဆက်:verb ပြ:verb ကြောက် ဝမ်းသာ'),
        ('the describing verbs and a few adverbs',
         'ကောင်း ဆိုး လှ ကြီး ငယ် သေး ရှည် တို မြင့် သစ် ဟောင်း မြန် နှေး များ နည်း:adj '
         'လွယ် ခက် ပျော် ဝမ်းနည်း ပင်ပန်း ဝ:adj ပိန် သန့်ရှင်း ညစ်ပတ် အရမ်း သိပ်:adv '
         'နည်းနည်း အများကြီး တကယ် အတူ တခြား'),
    ],
}
