#!/usr/bin/env python3
"""The hand-written topic inventory of each Somali level (`select.py` deals it first).

Scoped to the CEFR global descriptor of the level (`somali_level.SCOPE`): the
words a course for that band would teach, topic by topic.  A word is written in
its ordinary spelling (Wiktionary's page title), `:pos` naming the part of
speech to lead with where one spelling is two words, `_` for a space.  A word
English Wiktionary lacks is glossed in `hand.py`; a word neither has is LEFT OUT
and listed in the comment below its topic, so the gap is on record.

A1 (2026-11-16).  Left out, in neither source: the subject pronouns anigu, adigu,
isagu, iyadu (the deck teaches aniga ...), kuma "who", the goats and sheep ri'
and ido (genders and plurals unconfirmed), walaashay (a possessive form).  Left
out after reading the cards: dugsi "school" (Wiktionary has only an adjective
"warm"; iskuul is taught) and adhi "flock" (its English side was ari's).
"""

INVENTORY = {
    'a1': [
        ('yes, no and greetings', 'haa maya mahadsanid fadlan nabad salaan'),
        ('the pronouns', 'aniga adiga isaga iyada annaga innaga idinka iyaga'),
        ('question words', 'maxaa maxay yaa xaggee halkee goorma sidee imisa waayo kee'),
        ('joining words', 'iyo ama laakiin haddii oo:conj markii'),
        ('numbers', 'kow mid laba saddex afar shan lix toddoba siddeed sagaal toban labaatan '
                    'soddon afartan konton boqol kun'),
        ('people and the family', 'aabbe hooyo walaal wiil gabadh nin naag xaas carruur ilmo adeer '
                                  'eeddo abti habaryar awoowe ayeeyo qoys ehel qof dad saaxiib'),
        ('the body', 'madax il san af:noun dheg gacan lug cag far ilig timo wadne calool dhabar jidh'),
        ('feeling ill', 'xanuun cudur dhakhtar isbitaal daawo jiran'),
        ('time and the days', 'maalin habeen saacad daqiiqad toddobaad bil sanad maanta berri shalay '
                              'hadda subax galab fiid waqti isniin talaado arbaco khamiis jimco sabti axad'),
        ('food and drink', 'cunto biyo caano shaah kafee bun hilib kalluun bariis rooti ukun khudaar '
                           'miro sonkor cusbo saliid baasto muus liin'),
        ('money and shopping', 'lacag suuq dukaan qiimo iibso gad shilin'),
        ('the home and clothes', 'guri aqal qol albaab daaqad miis kursi sariir jiko musqul dhar shaati '
                                 'surwaal kab koofiyad macawis'),
        ('the town and getting about', 'magaalo tuulo jid waddo baabuur bas tareen diyaarad markab '
                                       'iskuul masjid'),
        ('the weather', 'roob qorrax dabayl kulul qabow cimilo daruur'),
        ('colours', 'midab cad madow cas cagaaran buluug jaalle bunni'),
        ('animals', 'geel ari lo\' sac faras dameer eey bisad shimbir libaax'),
        ('school and work', 'arday macallin bare buug qalin warqad fasal shaqo xafiis shaqee'),
        ('the everyday verbs', 'keen tag yimaad kaalay cun cab seexo kac fadhiiso istaag soco orod arag '
                               'maqal hadal qor akhri baro bar sheeg dheh samee sii qaad hel rab doon:verb '
                               'jecel fahan og cayaar joog gal bax fur xir sug wac eeg fiiri dhaq kari dhig'),
        ('describing things', 'weyn yar dheer gaaban wanaagsan fiican xun cusub adag fudud qurux nadiif '
                              'wasakh faraxsan buuxa madhan dhow fog badan kale'),
        ('the little words of place and manner', 'halkan halkaas mar aad kaliya weli hore gadaal dhex '
                                                 'hoos kor sare dhinac'),
    ],
    # A2 (2026-11-16).  Wiktionary's words where it has them (about 200), the rest in hand.HAND_A2.
    # Left out: the months A1's fill already dealt (oktoobar, abriil ...), luqun "neck" (qoor is
    # taught), aar "lion" (a male lion; libaax is taught), bataate "potato" (counted nowhere).
    'a2': [
        ('the months, the seasons and the times of day', 'jannaayo juunyo luuliyo sebteembar nofeembar '
         "jiilaal gu' dayr aroor kol dabadeed"),
        ('directions and places', 'koonfur bari xaafad dariiq derbi jaamacad maktabad garoon dekad dal '
         'gobol degmo makhaayad hudheel'),
        ('clothes', 'jaakad dirac shaal buste'),
        ('work and jobs', 'ganacsade darawal kalkaaliye askari tuug geesi tumaal injinyeer turjumaan'),
        ('people and the stages of life', 'oday cunug ciyaal barbaar dhalinyaro soddog abaayo aroos '
         'dhalasho geeri nolol'),
        ('feelings', 'farxad cabsi walwal xiiso murugo xanaaq jaceyl kibir xishood caajis yaab nasiib'),
        ('travel', 'baasaboor socdaal tigidh'),
        ('the land and the weather', 'abaar kulayl hawo ciid baraf caws dayax iftiin caleen ubax duur '
         'qiiq onkod biriq caad dambas'),
        ('animals', 'mas geri bakayle rah caaro kaneeco dibi orgi awr'),
        ('the body and health', 'waji qoor garab maskax jilib carrab suul cudud sambab ciddi '
         'caafimaad qandho dhaawac matag hindhis barar gaajo harraad'),
        ('food and the kitchen', 'quraac qado casho digaag basal saxan dheri fargeeto cabitaan canjeero '
         'malab subag maraq farmaajo tufaax cambe yaanyo khiyaar xabxab sarreen daqiiq toon qorfe mindi'),
        ('the things of a home', 'telefoon telefishan raadiyo kombiyuutar sanduuq furaash muraayad fure '
         'barkin shumac irbad saabuun shukumaan masaasad caday nal xarig ul'),
        ('talking and learning', "su'aal luqad cashar imtixaan aqoon qoraal sheeko qaamuus xisaab "
         'maahmaah kaftan tarjum waxbar wadahadal weydii'),
        ('the verbs of doing', 'raadi xasuuso ooy nadiifi shub dabaal gub dhaqaaq jar celi dadaal tiri '
         'dareen bixi aamin fuul tus riix jeex ogaan qas dhamee qosol lun gudbi feker shid noqo daa '
         'qaniin qaylo ilaali hilmaam kori caawi naso diyaari jooji iibi kaydi hagaaji taabo'),
        ('describing people and things', 'qurxoon daallan gaajaysan daacad caato buuran xariif sabool '
         'mugdi qadhaadh mac caydhiin qalalan jilicsan qaali jaban raqiis ballaran ciriiri duug'),
        ('the faith and the feasts', 'salaad soon ramadaan quraan tuko'),
        ('numbers and the ordinals', 'lixdan toddobaatan siddeetan sagaashan eber malyuun kowaad labaad '
         'saddexaad afraad shanaad'),
        ('joining words and the little words of time', 'ilaa sidoo_kale xitaa had_iyo_jeer marna '
         'mararka_qaarkood inta_badan sababtoo_ah bilaa saas haye raali'),
    ],
}
