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
}
