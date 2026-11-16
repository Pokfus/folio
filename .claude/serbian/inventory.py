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
    'a2': [
        ('people and relatives',
         'unuk unuka sestrić ujak stric tetka rođak rođaka supruga suprug verenik '
         'beba tinejdžer penzioner kolega šef klijent gost stranac građanin '
         'poznanik'),
        ('jobs and study',
         'zanimanje inženjer pravnik advokat policajac prodavač kuvar vozač medicinska_sestra '
         'radnik seljak direktor sekretarica računovođa plata firma preduzeće '
         'fabrika nezaposlen gimnazija fakultet razred predavanje ispit ocena sveska rečnik '
         'kurs diploma učenik'),
        ('clothes',
         'odeća haljina suknja pantalone košulja bluza majica džemper jakna kaput cipela '
         'čizma čarapa šešir kapa rukavica šal odelo kaiš džep veličina obuća naočare '
         'obući skinuti nositi'),
        ('food and cooking',
         'svinjetina govedina luk beli_luk šargarepa kupus krastavac salata paprika pasulj '
         'grašak pečurka pomorandža limun grožđe kruška jagoda trešnja banana torta kolač '
         'čokolada sladoled keks ulje med jogurt brašno sos kobasica testenina pirinač '
         'tanjir čaša kašika viljuška nož šerpa kuvati pržiti seći ukus glad '
         'sladak slan gorak kiseo svež sit'),
        ('the home',
         'sprat stepenište terasa balkon dvorište bašta zid pod plafon krov hodnik '
         'nameštaj ormar polica kauč fotelja tepih zavesa ogledalo lampa '
         'frižider tuš lavabo peškir sapun jastuk ćebe preseliti čistiti '
         'prati'),
        ('the town and its services',
         'centar kraj muzej pozorište bioskop biblioteka crkva policija most ugao semafor '
         'raskrsnica trotoar pumpa knjižara pekara bar hotel stadion mapa '
         'adresa'),
        ('travel and holidays',
         'putovanje odmor raspust izlet prtljag kofer pasoš viza carina granica rezervacija '
         'turist vodič plaža jezero ostrvo šuma polje brdo dolina trolejbus bicikl motor '
         'brod avion luka dolazak polazak let putovati posetiti '
         'odmarati'),
        ('nature, seasons and the compass',
         'sever jug istok zapad nebo oblak zvezda priroda trava lišće list '
         'temperatura stepen oluja magla led oblačan sunčan vlažan suv mraz'),
        ('animals',
         'životinja konj krava ovca svinja ptica patka medved vuk lisica zec miš zmija insekt '
         'pčela muva kokoška'),
        ('health and the body',
         'telo lice kosa vrat rame prst koleno leđa krv kost koža bolest prehlada kašalj grip '
         'rana alergija tableta lek recept zubar lečiti kašljati'),
        ('feelings and character',
         'radost tuga strah bes nada iznenađenje ljut miran veseo smeo lenj vredan pametan '
         'ljubazan iskren darežljiv strpljiv ponosan dosadan plašiti nervirati smejati '
         'plakati sekirati'),
        ('free time and sport',
         'hobi tenis košarka fudbal plivanje utakmica tim igrač lopta koncert '
         'predstava izložba fotografija crtež žurka pozivnica rođendan venčanje '
         'svadba plivati trčati crtati pozvati slaviti'),
        ('time and sequence',
         'prošlost budućnost savremen vek datum kalendar prekjuče prekosutra uskoro nedavno '
         'kasnije prvo konačno obično retko nekad dok'),
        ('numbers and quantity',
         'trideset četrdeset pedeset šezdeset sedamdeset osamdeset devedeset dvesto milion '
         'četvrtina kilogram gram litar metar kilometar centimetar komad paket flaša kutija '
         'grupa količina'),
        ('everyday verbs',
         'uključiti isključiti popeti spustiti ulaziti izlaziti vraćati zaustaviti parkirati '
         'gubiti pobediti izgubiti pozajmiti dobijati zvoniti objasniti ponoviti prevesti '
         'izabrati odlučiti obećati sećati zapamtiti sanjati rasti roditi umirati čestitati '
         'upoznati deliti menjati popraviti graditi slomiti čuvati sakriti bacati naručiti '
         'probati šetati žuriti zakasniti navići obući'),
    ],
    'b1': [
        ('work and a career',
         'karijera posao zaposlenje poslodavac zaposlen plata intervju iskustvo veština '
         'sposobnost obuka sastanak projekt zadatak rok ugovor otkaz penzija štrajk sindikat '
         'kancelarija odeljenje uspeh napredovanje konkurencija zaraditi zaposliti otpustiti '
         'upravljati sarađivati'),
        ('education and learning',
         'obrazovanje škola student studija diplomirati upisati znanje nauka '
         'istraživanje predmet lekcija domaći zadatak test rezultat stipendija profesor '
         'nastava učionica ponavljati vežbati'),
        ('the media and technology',
         'novine časopis vest članak novinar emisija program kanal reklama internet '
         'mreža sajt imejl lozinka poruka aplikacija ekran tastatura uređaj tehnologija '
         'preuzeti instalirati pretraživati objaviti snimiti'),
        ('the environment',
         'otpad smeće klima energija struja gas '
         'ugalj nafta sunčev zaštita šuma vazduh ekološki zagaditi štedeti'),
        ('society and politics',
         'društvo država vlada vlast politika političar stranka glasati demokratija '
         'zakon pravo sloboda jednakost ministar parlament predsednik grad opština '
         'stanovništvo stanovnik manjina siromaštvo bogatstvo nezaposlenost problem rešenje'),
        ('law and crime',
         'zločin kriminal lopov krađa ubistvo napad policija sud sudija advokat svedok kazna '
         'zatvor dokaz žrtva optužiti uhapsiti osuditi ukrasti prevara'),
        ('money and banking',
         'račun štednja kredit kamata dug porez novčanik gotovina kartica kurs evro '
         'trošak uštedeti potrošiti pozajmiti zaduživati'),
        ('health and a way of life',
         'zdravlje ishrana dijeta vežba trening teretana cigareta alkohol '
         'stres umor san bolnica pregled operacija pacijent oporaviti povrediti'),
        ('relationships and feelings',
         'odnos veza prijateljstvo ljubav brak razvod svađa poverenje osećaj emocija sreća '
         'ljubomora razočaranje zahvalan zabrinut iznenađen ljubomoran zaljubiti '
         'venčati svađati poštovati'),
        ('culture and the arts',
         'kultura umetnost umetnik slika slikar pisac pesnik roman priča pesma pevač glumac '
         'režiser scena publika tradicija običaj praznik festival kompozitor'),
        ('the problems of travel',
         'putnik smeštaj gužva saobraćaj nesreća kvar gubitak osiguranje '
         'otkazati propustiti prijaviti rezervisati'),
        ('opinions and connectives',
         'mišljenje stav razlog posledica prednost mana primer činjenica uostalom međutim '
         'zato stoga dakle naime zapravo inače takođe osim ukoliko iako mada jer slagati '
         'tvrditi verovati sumnjati složiti'),
        ('describing people and things',
         'izgled visina težina mršav debeo zgodan ružan elegantan moderan staromodan '
         'udoban neudoban skup ozbiljan pristojan uljudan hrabar sebičan zanimljiv uzbudljiv '
         'opasan siguran korisno'),
        ('the verbs of deciding, changing and making',
         'odlučivati odabrati menjati promeniti poboljšati razviti stvoriti '
         'proizvoditi pripremiti organizovati planirati ostvariti postići uporediti '
         'opisati predložiti preporučiti zahtevati sprečiti uticati'),
    ],
}
