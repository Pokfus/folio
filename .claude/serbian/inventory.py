"""The hand-written topic inventory of each Serbian level.

No graded Serbian word list a deck could take whole was found, so each level
is ASSEMBLED, as the Ukrainian, Polish and Hindi decks are: these words
first, scoped to the CEFR global descriptor for the band
(`serbian_level.SCOPE`), then the commonest remaining lemmas by frequency
(`select.py`).

FORMAT: (topic, 'word word word ...'), IN GAJ'S LATIN, EKAVIAN (`mleko`, not
`mlijeko`).  `_` joins a multi-word entry (`laku_noć`); `:pos` picks one part
of speech of a homograph (`što:conj`).  A word Wiktionary does not have, or
has only as a regional (Croatian, Bosnian) word, is reported by `select.py`
and dropped.  Verbs are given in the aspect a beginner meets first.
"""

INVENTORY = {
    'a1': [
        ('greetings and politeness',
         'zdravo ćao hvala moliti izvinite dobar_dan dobro_jutro dobro_veče laku_noć '
         'doviđenja da ne dobro gospodin gospođa'),
        ('people and family',
         'čovek žena muškarac dete devojka momak dečak sin ćerka majka otac mama tata brat sestra '
         'baka deda porodica prijatelj drugarica komšija ime prezime učitelj nastavnik lekar '
         'student muž'),
        ('pronouns, question words and little words',
         'ja ti on ona ono mi vi oni sebe moj tvoj njegov njen naš vaš njihov svoj ovaj taj onaj '
         'sav svaki ko šta gde kuda odakle zašto kako koliko koji čiji '
         'ovde tamo sada onda uvek nikad ponekad često već još takođe isto '
         'vrlo veoma malo mnogo više manje samo zajedno može '
         'i a ali ili jer ako nego kad '
         'u na sa iz do od za bez o posle pre ispod iznad između kroz pored kod po:prep'),
        ('numbers',
         'jedan dva tri četiri pet šest sedam osam devet deset jedanaest dvadeset sto hiljada '
         'prvi drugi treći pola broj'),
        ('time, days and months',
         'vreme sat minut dan nedelja mesec godina jutro veče noć danas sutra juče '
         'ponedeljak utorak sreda četvrtak petak subota '
         'januar februar mart april maj jun jul avgust septembar oktobar novembar decembar '
         'proleće leto jesen zima'),
        ('food and drink',
         'hrana hleb mleko voda kafa čaj sok vino pivo meso riba piletina jaje sir puter '
         'šećer so supa povrće voće jabuka krompir paradajz doručak ručak večera '
         'restoran kafić meni račun ukusan'),
        ('shopping and money',
         'prodavnica pijaca novac pare dinar cena skup jeftin kupiti kupovati prodavati platiti '
         'koštati kartica'),
        ('the home',
         'kuća stan soba kuhinja kupatilo prozor vrata sto stolica krevet ključ telefon '
         'kompjuter televizor'),
        ('the town and getting about',
         'grad selo ulica trg park škola univerzitet banka bolnica apoteka pošta stanica '
         'aerodrom autobus voz tramvaj auto kola taksi karta put desno levo pravo daleko blizu '
         'zemlja jezik'),
        ('the body and feeling ill',
         'glava ruka noga oko uvo usta zub srce stomak bolestan boleti zdravlje zdrav'),
        ('weather and nature',
         'sunce kiša sneg vetar hladan topao vruć more reka planina drvo cvet pas mačka'),
        ('colours',
         'boja beo crn crven plav zelen žut'),
        ('describing things',
         'velik mal nov star mlad lep dug:adj kratak brz spor:adj lak težak srećan tužan umoran '
         'gladan zauzet slobodan otvoren zatvoren važan isti drugačiji'),
        ('everyday verbs',
         'biti imati hteti moći morati znati razumeti govoriti reći pitati odgovoriti '
         'ići doći dolaziti otići voziti živeti raditi učiti čitati pisati slušati videti '
         'gledati jesti piti spavati voleti želeti misliti kupiti dati uzeti čekati '
         'početi završiti otvoriti zatvoriti sedeti stajati igrati pevati kuvati zvati '
         'sviđati'),
    ],
}
