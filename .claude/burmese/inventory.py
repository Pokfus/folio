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

A2 IS SCOPED TO THE CEFR A2 DESCRIPTOR, looked up the same way (2026-11-16).  It
carries both calendars' months: the Western, which Myanmar uses day to day, and the
twelve Burmese months the festivals are named by.  Not in English Wiktionary, so not
taught: မနှစ်က "last year", နောက်နှစ် "next year", ညနေစောင်း "dusk", မကြာခင် "soon",
အရင်က "before", တခါတလေ "sometimes", ဂျာကင် "jacket", ဒရိုင်ဘာ "driver" (ယာဉ်မောင်း
is taught), ဘိုးဘွား "grandparents", ပတ်စ်ပို့ "passport", တည်းခို "to stay (at a
hotel)", လမ်းမ "main road", စိတ်ညစ် "to be fed up", ပျော်ရွှင် "joyful", ခန္ဓာကိုယ်
"body", ခြေချောင်း "toe", ဆေးထိုး "injection", နံနံပင် "coriander", ခရမ်းချဉ်သီး
"tomato", လိမ္မော်သီး "orange", အုန်းသီး "coconut", ဖရဲသီး "watermelon", ဒယ်အိုး
"frying pan", ပန်းကန်ပြား "plate", ရေချိုးခန်း "bathroom", မွေ့ယာ "mattress", မီးလုံး
"light bulb", အစ္စလာမ် "Islam", သင်္ကြန် "Thingyan".  Left out for their entries:
ထီး (Wiktionary has only the royal parasol, not "umbrella") and အန္တရာယ် "danger"
(no reading).
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
    'a2': [
        ('the months',
         'ဇန်နဝါရီ ဖေဖော်ဝါရီ မတ်:noun ဧပြီ မေ:noun ဇွန်:noun ဇူလိုင် ဩဂုတ် စက်တင်ဘာ အောက်တိုဘာ '
         'နိုဝင်ဘာ ဒီဇင်ဘာ တန်ခူး ကဆုန် နယုန် ဝါဆို ဝါခေါင် တော်သလင်း သီတင်းကျွတ် တန်ဆောင်မုန်း '
         'နတ်တော် ပြာသို တပို့တွဲ တပေါင်း'),
        ('time',
         'သန်းခေါင် ရာစု ဆယ်စုနှစ် အပတ် ချက်ချင်း နောက်မှ ခဏခဏ ဘယ်တော့မှ အမြဲတမ်း အချိန်မီ'),
        ('clothes and things worn',
         'အဝတ် အဝတ်အစား ကုတ်:noun ခြေအိတ် ညှပ်ဖိနပ် မျက်မှန် လက်ပတ်နာရီ ခါးပတ် အိတ် '
         'လည်စည်း ရွှေ:noun လက်စွပ် နားကပ် ဆွဲကြိုး ချွတ်:verb'),
        ('work and jobs',
         'လယ်သမား ကုန်သည် စစ်သား သူနာပြု ယာဉ်မောင်း စာရေး:noun သတင်းထောက် အင်ဂျင်နီယာ ရှေ့နေ '
         'တရားသူကြီး ဝန်ထမ်း စားဖိုမှူး မန်နေဂျာ အလုပ်ရှင် အလုပ်သမား လခ လစာ ကုမ္ပဏီ စက်ရုံ'),
        ('relatives and the stages of life',
         'မိဘ မြေး တူ:noun တူမ ယောက္ခမ ချွေးမ သမက် ဝမ်းကွဲ:noun ညီအစ်ကို မောင်နှမ ညီအစ်မ လူပျို '
         'အိမ်ထောင် ကွာရှင်း မွေးနေ့ လက်ထပ် မင်္ဂလာဆောင် သေ:verb ဈာပန လူကြီး လူငယ် အဘိုးကြီး '
         'အဘွားကြီး'),
        ('feelings',
         'စိတ်:noun စိတ်ဆိုး ဒေါသ ဒေါသထွက် စိတ်ပူ ပျင်း ရှက် အံ့ဩ စိတ်ပျက် သနား မနာလို မျှော်လင့် '
         'ယုံ ယုံကြည် အချစ် စိတ်ချ အေးချမ်း'),
        ('travel',
         'ခရီး ခရီးသွား လက်မှတ် ဗီဇာ နယ်စပ် ဧည့်သည် ဧည့်ခန်း မြေပုံ လမ်းညွှန် ဆိပ်ကမ်း ကားဂိတ် '
         'ဘူတာရုံ မီးရထား လှေ ကုန်တင်ကား မော်တော်ကား လမ်းဆုံ တံတား မီးပွိုင့် ငှား ကြို:verb '
         'နှုတ်ဆက် အထုပ်'),
        ('the land and the weather',
         'တော:noun ကျွန်း:noun ကမ်း:noun ကမ်းခြေ ရေကန် ချောင်း:noun မြေ ကျောက်:noun သဲ မြက်:noun '
         'အပင် အရွက် ပန်းခြံ ဥယျာဉ် လယ်:noun စပါး ဆန်:noun နေရောင် မိုးကြိုး လျှပ်စီး မုန်တိုင်း '
         'ရေကြီး ငလျင် နှင်း:noun ကမ္ဘာ'),
        ('animals',
         'ဝံ ဝံပုလွေ ယုန် ဆိတ်:noun သိုး:noun ကျွဲ ဘဲ:noun ငန်း:noun ခို:noun ကြက်တူရွေး ပုစွန် '
         'ကဏန်း ခြင်:noun ယင် ပုရွက်ဆိတ် ပိုး:noun လိပ်ပြာ ပျား မိကျောင်း ကျားသစ်'),
        ('the body',
         'လည်ပင်း ပခုံး ရင်ဘတ် ကျော:noun လက်ချောင်း လက်မ ဒူး အရိုး အရေပြား သွေး:noun အသည်း '
         'ကျောက်ကပ် အဆုတ် ဦးနှောက် မျက်ခုံး နှုတ်ခမ်း လျှာ မေးစေ့ နားရွက်'),
        ('health',
         'ရောဂါ အအေးမိ ချောင်းဆိုး နှာစေး အဖျား ကိုက်:verb ဒဏ်ရာ ထိခိုက် ဆေးဆိုင် ဆေးလုံး လူနာ ကုသ '
         'သက်သာ:verb နေကောင်း ခွဲစိတ် အန်:verb ဝမ်းလျှော'),
        ('food and cooking',
         'ကြက်သွန် ကြက်သွန်ဖြူ ချင်း:noun အာလူး ခရမ်းသီး ဂေါ်ဖီ ကန်စွန်း မုန်လာ ငါးပိ ငံပြာရည် '
         'ပဲငံပြာရည် ပျားရည် ထောပတ် ဒိန်ခဲ ဒိန်ချဉ် ဟင်းချို ကြော်:verb ပြုတ်:verb ကင် လှီး '
         'ဖျော် ပန်းသီး စပျစ်သီး သင်္ဘောသီး နာနတ်သီး ဒူးရင်းသီး လက်ဖက်:noun လက်ဖက်သုပ် '
         'အုန်းနို့ခေါက်ဆွဲ ရှမ်းခေါက်ဆွဲ'),
        ('the kitchen and the home',
         'အိုး:noun ဓား ဇလုံ ပုံး ရေခွက် မီးဖို ဓာတ်ငွေ့ ရေနွေး အိပ်ခန်း ထမင်းစားခန်း လှေကား အမိုး '
         'နံရံ ကြမ်းပြင် ခြံ:noun သော့:noun ခေါင်းအုံး:noun စောင်:noun ခြင်ထောင် ပန်ကာ မှန်:noun+adj '
         'ဗီရို ဆပ်ပြာ သွားပွတ်တံ သွားတိုက်ဆေး တဘက် ဘီး ရေပိုက်'),
        ('talking and deciding',
         'ပြောဆို ဆွေးနွေး ရှင်းပြ ဘာသာပြန် မေးခွန်း အဖြေ သတင်း စာတိုက် တယ်လီဖုန်း အင်တာနက် '
         'အီးမေးလ် လိပ်စာ ဆုံးဖြတ် သဘောတူ ငြင်း:verb ကတိ ကတိပေး တောင်းပန် ချီးကျူး အကြံ '
         'အကြံပေး ကြေညာ ဖိတ်:verb ဖိတ်စာ'),
        ('the everyday verbs of doing',
         'ကြိုးစား ပြင်ဆင် စမ်း:verb စောင့်ရှောက် ပေါင်း:verb ခွဲ:verb ဖြတ် ဆွဲ:verb တွန်း:verb '
         'ချ:verb ပစ်:verb ထမ်း:verb သယ်:verb လက်ခံ:verb ရွေး:verb ဝေ ချေး:verb သိမ်း:verb ဖျက် '
         'ပျောက် မှတ်မိ သတိရ အိပ်ပျော် လေ့ကျင့် သင်ကြား ပူးပေါင်း စိုက် ပျိုး:verb ရိတ် ရေကူး '
         'ခုန် တီး:verb ပန်းချီ'),
        ('describing things and people',
         'တောက်ပ မှောင်:adj လင်း:adj ကျယ် ကျဉ်း:adj ထူ:adj ပေါ့:adj မာ ပျော့ ကြမ်း:adj လွတ်:verb '
         'စို:adj နွေး ဆူ:verb တိတ် ဆူညံ ငြိမ် လှပ ချမ်းသာ ဆင်းရဲ အားနည်း ထက်:conj လိမ္မာ ရိုးသား '
         'ဖော်ရွေ ယဉ်ကျေး ရိုင်း သတ္တိ အရေးကြီး လုံခြုံ'),
        ('the faith and the feasts',
         'ဗုဒ္ဓဘာသာ ခရစ်ယာန် ဟိန္ဒူ ဘုန်းကြီး:noun ကိုရင်:noun သီလရှင် ဘုန်းကြီးကျောင်း စေတီ ပုထိုး '
         'ဘုရားပွဲ ပွဲတော် ပွဲ:noun ဆွမ်း ဆုတောင်း နတ် ကံ ကုသိုလ် ဥပုသ် ဘုရားရှိခိုး အလှူ'),
    ],
}
