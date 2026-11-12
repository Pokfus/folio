"""The hand-written inventory of each level's topics -- Folio's own list.

WHY IT IS HAND-WRITTEN.  Poland's State Commission for the Certification of
Proficiency in Polish as a Foreign Language examines at all six CEFR levels,
but no word list of its own could be found (checked 2026-11-09; see
`docs/polish-decks-plan.md` §2), so each level's CORE is written here, a
topic at a time, for the topics the A1 exam is described as covering by the
University of Zielona Góra's certification centre: "człowiek, rodzina, życie
codzienne, wolny czas, mieszkanie, miejsca, środki transportu, kierunki, praca,
szkoła, jedzenie, zakupy, pieniądze, zdrowie, pory roku, pogoda, rośliny i
zwierzęta - nazwy podstawowe" -- plus the categories a beginner needs whole
(numbers, days, months, colours) and the closed classes every sentence is built
from (pronouns, question words, prepositions, conjunctions).

`select.py` resolves every word against Wiktionary (a word not found there is
reported and dropped -- never given a meaning here) and tops the level up with
the commonest remaining words.  The words are Folio's choice, not the
Commission's, and the deck's description says so.

A VERB is entered in BOTH aspects only where a beginner needs both (`robić` /
`zrobić`, `kupować` / `kupić`); the card names the partner either way.  A
reflexive verb is entered as its base verb (`nazywać`): Wiktionary files the
`się` sense under it, and the card shows that sense as "(się) to be called".
"""

A1 = [
    ("pronouns", "ja ty on ona ono my wy oni one pan pani państwo się mój twój jego jej nasz wasz ich swój "
                 "ten tamten to wszystko nic coś ktoś nikt każdy sam"),
    ("questions", "co kto gdzie kiedy dlaczego jak ile który jaki czyj skąd dokąd czy"),
    ("prepositions", "w na z do od po przy za przed pod nad między obok u o dla bez przez około koło"),
    ("conjunctions and particles", "i a ale lub albo bo że żeby jeśli kiedy więc też także tylko już jeszcze "
                                   "nie tak bardzo dość prawie może"),
    ("greetings and politeness", "cześć dzień_dobry dobry_wieczór do_widzenia dobranoc dziękuję proszę "
                                 "przepraszam przepraszać witać pozdrawiać"),
    ("the person", "człowiek mężczyzna kobieta chłopiec dziewczyna dziecko imię nazwisko wiek adres "
                   "telefon numer kraj miasto wieś język narodowość urodziny"),
    ("family", "rodzina matka mama ojciec tata brat siostra syn córka mąż żona dziadek babcia wnuk wnuczka "
               "wujek ciocia rodzic przyjaciel przyjaciółka kolega koleżanka"),
    ("daily life", "dzień rano wieczór noc południe śniadanie obiad kolacja budzić wstawać myć ubierać "
                   "jeść pić spać pracować uczyć wracać czekać zaczynać kończyć"),
    ("free time", "czas hobby sport piłka muzyka film kino teatr książka gazeta gra spacer wycieczka "
                  "urlop wakacje impreza koncert grać czytać słuchać oglądać tańczyć śpiewać pływać "
                  "biegać odpoczywać spotykać lubić kochać"),
    ("the home", "dom mieszkanie pokój kuchnia łazienka sypialnia okno drzwi ściana podłoga stół krzesło "
                 "łóżko szafa lampa klucz piętro winda balkon ogród"),
    ("places", "ulica sklep bank poczta szpital apteka szkoła uniwersytet biuro restauracja kawiarnia hotel "
               "dworzec lotnisko przystanek park kościół muzeum plac rynek"),
    ("transport and directions", "samochód autobus tramwaj pociąg samolot rower taksówka metro bilet "
                                 "droga prosto w_lewo w_prawo blisko daleko tutaj tam tu jechać iść "
                                 "przyjechać przyjść lecieć"),
    ("work and school", "praca pracownik szef firma zawód lekarz nauczyciel student uczeń inżynier "
                        "kierowca sprzedawca lekcja klasa egzamin zadanie zeszyt długopis ołówek "
                        "komputer pisać"),
    ("food and drink", "jedzenie chleb masło ser mleko jajko mięso ryba kurczak kiełbasa zupa ziemniak "
                       "ryż makaron warzywo owoc jabłko pomidor sól cukier woda kawa herbata sok "
                       "piwo wino ciasto"),
    ("shopping and money", "zakup pieniądz złoty grosz cena karta kasa sklep rozmiar kupować kupić "
                           "płacić sprzedawać kosztować drogi tani"),
    ("health and the body", "zdrowie ciało głowa oko ucho nos usta ząb ręka noga brzuch serce lekarstwo "
                            "lekarz chory zdrowy boleć ból gorączka"),
    ("seasons and weather", "pogoda słońce deszcz śnieg wiatr chmura zimno ciepło gorąco wiosna lato "
                            "jesień zima temperatura padać"),
    ("plants and animals", "kot pies koń krowa ptak zwierzę drzewo kwiat las góra rzeka morze jezioro"),
    ("numbers", "zero jeden dwa trzy cztery pięć sześć siedem osiem dziewięć dziesięć jedenaście "
                "dwanaście dwadzieścia trzydzieści sto tysiąc pierwszy drugi trzeci połowa"),
    ("time", "godzina minuta tydzień miesiąc rok dzisiaj jutro wczoraj teraz zawsze często czasem "
             "nigdy potem wcześnie późno weekend"),
    ("days", "poniedziałek wtorek środa czwartek piątek sobota niedziela"),
    ("months", "styczeń luty marzec kwiecień maj czerwiec lipiec sierpień wrzesień październik "
               "listopad grudzień"),
    ("colours", "kolor biały czarny czerwony zielony niebieski żółty szary brązowy"),
    ("describing", "dobry zły duży mały nowy stary młody ładny piękny wysoki niski długi krótki łatwy "
                   "trudny szczęśliwy smutny wolny zajęty miły ciekawy dobrze źle dużo mało więcej"),
    ("everyday verbs", "być mieć móc musieć chcieć wiedzieć znać rozumieć mówić powiedzieć pytać "
                       "odpowiadać robić zrobić widzieć patrzeć dać brać wziąć szukać mieszkać "
                       "nazywać otwierać zamykać pomagać myśleć"),
]

# A2's scope: the University of Zielona Góra certification centre's page for the A2 exam
# (certyfikatpolski.uz.zgora.pl, "Poziom A2", read 2026-11-12) gives no single topic list but describes the
# level: the speaker's intentions (thanking, apologising, inviting, wishes, congratulations, feelings and
# judgements); place, direction and time; quantity, quality and possession; politeness, table manners,
# Polish dishes and mealtimes; Poland in the European Union, its regions, name days and birthdays, visits,
# dress on official occasions, cultural and artistic life, travel in Poland and Europe; the roles of tourist,
# guest, pupil and teacher, customer and seller, tenant, caller, doctor and patient; describing people and
# events, telling a story, comparing; antonyms and synonyms; and in the grammar, nouns in -um (`muzeum`,
# `liceum`), the verbs of motion (`jechać`, `jeździć`), the modals (`trzeba`, `warto`, `należy`), feminine
# names from masculine ones (`student` - `studentka`) and the conjunctions `więc`, `dlatego`, `kiedy`, `gdy`,
# `jeśli`, `gdyby`.  The words below are written a topic at a time for those; a word A1 teaches is skipped.
A2 = [
    ("intentions and feelings", "dziękować prosić zapraszać zaproszenie życzyć życzenie gratulować gratulacje "
                                "przeprosić sto_lat smacznego na_zdrowie powodzenia uczucie radość strach złość "
                                "wstyd nadzieja miłość cieszyć martwić bać denerwować dziwić zdziwiony zadowolony "
                                "zmęczony zdenerwowany zakochany wesoły spokojny nerwowy samotny dumny"),
    ("opinions and judgements", "zdanie opinia uważać sądzić zgadzać zgodzić podobać woleć oczywiście chyba "
                                "naprawdę raczej właściwie niestety na_pewno prawda racja wspaniały świetny "
                                "okropny straszny nudny interesujący ważny możliwy niemożliwy prawdziwy dziwny "
                                "normalny"),
    ("place and direction", "miejsce strona góra dół przód tył środek róg koniec początek kierunek północ "
                            "południe wschód zachód naprzeciwko wokół wzdłuż dookoła wewnątrz zewnątrz gdzieś "
                            "nigdzie wszędzie stąd stamtąd tędy dalej skręcać skręcić przechodzić przejść"),
    ("time and sequence", "chwila moment sekunda wiek przyszłość przeszłość teraźniejszość pora wieczorem "
                          "przedwczoraj pojutrze wkrótce niedawno dawno zaraz najpierw następnie wreszcie nagle "
                          "znowu ciągle codziennie zwykle rzadko kiedyś dopiero od_razu w_końcu podczas zanim aż "
                          "gdy odkąd"),
    ("quantity and quality", "trochę kilka kilkanaście wiele najwięcej ilość liczba część cały pełny pusty ciężki "
                             "lekki szeroki wąski gruby cienki głęboki ostry miękki twardy czysty brudny cichy "
                             "głośny szybki szybko wolno powoli średni ogromny"),
    ("comparing", "lepiej podobny inny taki_sam różnica porównywać różny identyczny niż"),
    ("possession", "należeć własny właściciel posiadać rzecz"),
    ("describing people", "wygląd włos twarz broda okulary szczupły przystojny brzydki blondyn brunet charakter "
                          "cecha sympatyczny niesympatyczny inteligentny mądry głupi leniwy pracowity uprzejmy "
                          "grzeczny niegrzeczny wysportowany odważny nieśmiały zabawny poważny"),
    ("the body and health", "oko szyja ramię plecy palec kolano stopa skóra krew gardło żołądek pacjent "
                            "przychodnia wizyta recepta tabletka syrop przeziębienie grypa katar kaszel ból_głowy "
                            "alergia badanie choroba pielęgniarka dentysta karetka zachorować kaszleć czuć leczyć "
                            "badać"),
    ("at table: dishes and meals", "posiłek drugie_śniadanie podwieczorek danie przystawka deser pieróg bigos "
                                   "barszcz rosół kotlet schabowy gołąbek naleśnik sałatka surówka kapusta ogórek "
                                   "cebula czosnek marchew grzyb pieprz olej śmietana jogurt twaróg szynka "
                                   "wołowina wieprzowina pączek sernik lód czekolada talerz kubek szklanka "
                                   "filiżanka widelec nóż łyżka łyżeczka serwetka obrus nakrywać gotować smażyć "
                                   "piec kroić smakować smaczny pyszny słodki słony kwaśny gorzki głodny syty"),
    ("in the restaurant and shop", "kelner kelnerka menu rachunek napiwek zamawiać zamówić rezerwacja klient "
                                   "klientka sprzedawczyni ekspedientka kasjer paragon reszta promocja zniżka "
                                   "kolejka sklep_spożywczy supermarket targ piekarnia księgarnia kilogram litr "
                                   "paczka butelka puszka kawałek opakowanie wydawać zapłacić oddać wymienić "
                                   "przymierzać"),
    ("clothes and official dress", "ubranie ubiór strój garnitur marynarka koszula krawat spodnie spódnica "
                                   "sukienka bluzka sweter kurtka płaszcz czapka kapelusz szalik but skarpetka "
                                   "koszulka dżinsy elegancki modny wygodny nosić zakładać zdejmować"),
    ("visits, name days and holidays", "imieniny gość odwiedzać odwiedzić prezent kwiat bukiet tort świeca "
                                       "przyjęcie święto choinka ślub wesele rocznica obchodzić świętować "
                                       "składać całować ściskać taniec"),
    ("the flat and renting", "wynajmować wynająć czynsz właścicielka lokator sąsiad sąsiadka umowa kaucja "
                             "ogłoszenie przedpokój salon jadalnia piwnica strych garaż dach schód kawalerka blok "
                             "kamienica mebel kanapa fotel półka biurko lodówka kuchenka pralka zmywarka prysznic "
                             "wanna toaleta ogrzewanie prąd gaz sprzątać prać prasować przeprowadzać"),
    ("the telephone and messages", "komórka rozmowa wiadomość esemes e-mail list koperta znaczek zadzwonić "
                                   "dzwonić odebrać oddzwonić słucham halo połączenie hasło wysłać wysyłać dostać "
                                   "dostawać"),
    ("school and learning", "liceum przedszkole nauka przedmiot matematyka geografia fizyka chemia biologia ocena "
                            "świadectwo dyplom studia wykład ćwiczenie słownik podręcznik tablica przerwa "
                            "uczennica studentka nauczycielka nauczyć zdać zdawać powtarzać tłumaczyć literować "
                            "wymawiać pamiętać zapomnieć"),
    ("work", "urząd urzędnik dyrektor kierownik pracodawca pensja wynagrodzenie zarobić zarabiać spotkanie "
             "zebranie kariera bezrobotny emeryt emerytura zawodowy aktorka lekarka pielęgniarz policjant strażak "
             "fryzjer kucharz mechanik prawnik dziennikarz pisarz malarz muzyk architekt programista rolnik"),
    ("travel in Poland and Europe", "podróż podróżować turysta turystka zwiedzać zwiedzić przewodnik mapa walizka "
                                    "plecak bagaż paszport dowód_osobisty wiza granica zagranica zabytek zamek "
                                    "pałac katedra pomnik nocleg rezerwować zarezerwować peron tor "
                                    "odjazd przyjazd rozkład_jazdy przesiadka spóźnienie spóźniać lot odlot "
                                    "przylot statek prom autostrada stacja_benzynowa parking prawo_jazdy jeździć "
                                    "chodzić latać wyjeżdżać wyjechać przyjeżdżać wrócić zgubić"),
    ("Poland, its regions and Europe", "Polak Polka polski europejski państwo stolica region województwo wybrzeże "
                                       "wyspa mieszkaniec cudzoziemiec obcokrajowiec"),
    ("cultural and artistic life", "kultura sztuka artysta artystka obraz wystawa galeria opera filharmonia balet "
                                   "przedstawienie spektakl aktor reżyser pisarka poeta wiersz powieść dzieło "
                                   "kompozytor utwór piosenka zespół festiwal biblioteka premiera scena widz "
                                   "sławny znany słynny"),
    ("the weather and nature", "klimat burza mgła mróz upał pochmurny słoneczny deszczowy wietrzny stopień niebo "
                               "gwiazda księżyc ziemia pole łąka plaża trawa liść mysz świnia owca kura kaczka "
                               "niedźwiedź wilk lis zając"),
    ("modal and everyday verbs", "trzeba warto należy powinien potrzebować starać próbować spróbować zdążyć "
                                 "zostać zostawać stać siedzieć leżeć wstać usiąść położyć postawić wisieć nieść "
                                 "wieźć prowadzić zacząć skończyć przestać zmieniać zmienić decydować zdecydować "
                                 "planować obiecać pozwalać pozwolić pokazywać pokazać opowiadać opowiedzieć "
                                 "opisywać opisać wyjaśniać wyjaśnić spotkać poznać poznawać umawiać umówić "
                                 "przygotować przygotowywać kłaść wkładać zabierać znaleźć znajdować wierzyć "
                                 "przypominać wybierać wybrać"),
    ("conjunctions and connectors", "dlatego dlatego_że ponieważ gdyby chociaż ani czyli natomiast jednak wtedy "
                                    "również zamiast oprócz według dzięki mimo"),
    ("antonyms and synonyms", "prosty nietrudny skomplikowany bezpieczny niebezpieczny otwarty zamknięty wczesny "
                              "późny gorący zimny ciepły chłodny jasny ciemny bogaty biedny"),
]



# B1's scope: the same centre's "Poziom B1" page (read 2026-11-12) lists the topics: the person (tastes); the
# family (its history, relatives, family occasions); daily and social life; sport (disciplines, equipment,
# events); places (town and country, public buildings and institutions); travel (travel agencies, documents,
# trips, luggage); work (the labour market and labour law); education (the system, classes and activities);
# food (recipes, dishes, ingredients, cooking); shopping (shops, goods, advertising, ways of paying); health
# (diet, way of life, accidents); the environment (protecting nature); the state and society (its
# organisation, national occasions, the political and economic situation, parties, living conditions,
# crime); science and technology (discoveries, inventions); the media (press, radio, television, the
# internet); culture; stereotypes; the roles of employer, employee, official, applicant, waiter, consumer,
# traveller and passenger; gestures and facial expressions; the sea, rivers and lakes; behaviour at
# religious, state, family, school and university occasions; and in the functions, expressing surprise,
# sadness, interest, certainty and doubt, possibility, need, sympathy, indifference and disappointment,
# criticism, argument, advice, and a toast.  A word an earlier level teaches is skipped.
B1 = [
    ("the person and tastes", "zainteresowanie upodobanie gust ulubiony pasja marzenie marzyć osobowość "
                              "zachowanie zachowywać cierpliwy niecierpliwy szczery ambitny towarzyski zazdrosny "
                              "wrażliwy uparty optymista pesymista ciekawość doświadczenie dorosły młodzież "
                              "dzieciństwo młodość starość pokolenie przyjazny wrogi życzliwy uczciwy nieuczciwy "
                              "hojny skąpy ostrożny spontaniczny dojrzały zarozumiały skromny kulturalny "
                              "lekkomyślny zaradny bezradny tchórz bohater sukces"),
    ("the family and its occasions", "krewny krewna kuzyn kuzynka teść teściowa zięć synowa szwagier bratowa "
                                     "prawnuk bliźniak przodek pochodzenie małżeństwo małżonek rozwód rozwodzić "
                                     "narzeczony narzeczona zaręczyny chrzest komunia pogrzeb uroczystość "
                                     "rodzinny wychowywać wychować opiekować urodzić rodzić ciąża wdowa sierota "
                                     "samotność"),
    ("daily and social life", "codzienność obowiązek zwyczaj tradycja towarzystwo znajomy znajomość spotykać "
                              "towarzyski zaprosić przyjaźń zaufanie kłótnia kłócić pogodzić rozmawiać plotka "
                              "żartować żart zaskoczenie zaskoczyć zaskoczony smutek obojętny rozczarowany "
                              "rozczarowanie współczucie współczuć zainteresowany pewność niepewność pewny "
                              "niepewny wątpić wątpliwość konieczność konieczny potrzeba odmawiać odmówić radzić "
                              "poradzić odradzać krytyka krytykować argument przykład toast wznosić"),
    ("sport", "dyscyplina mecz drużyna zawodnik zawodniczka trener kibic stadion boisko basen siłownia bramka gol "
              "wynik remis zwycięstwo porażka zwycięzca mistrz mistrzostwo medal puchar olimpiada sprzęt rakieta "
              "narta łyżwa rower_górski piłka_nożna siatkówka koszykówka tenis pływanie bieg trenować ćwiczyć "
              "wygrywać przegrać przegrywać kibicować strzelić"),
    ("town and country, public buildings", "miejscowość osiedle dzielnica centrum przedmieście okolica instytucja "
                                           "ratusz sąd ambasada konsulat komisariat straż oddział okienko kolej "
                                           "skrzyżowanie chodnik most rondo światło przejście zabudowa budynek "
                                           "budować wybudować gospodarstwo rolnictwo stodoła"),
    ("travel", "biuro_podróży wczasy wyjazd wypoczynek zakwaterowanie pensjonat schronisko kemping namiot "
               "ubezpieczenie dokument formularz wypełniać wypełnić pieczątka walizka kontrola odprawa celnik cło "
               "pasażer podróżny konduktor pilot stewardesa kierunkowy przewoźnik połączenie rozkład opóźnienie "
               "odwołać krajobraz widok pamiątka"),
    ("the sea, rivers and lakes", "brzeg wybrzeże fala zatoka półwysep port żaglówka żeglować kajak źródło "
                                  "strumień potok wodospad dolina wzgórze szczyt jaskinia piasek kamień"),
    ("work and the labour market", "bezrobocie oferta ogłaszać kandydat kandydatka rekrutacja "
                                   "rozmowa_kwalifikacyjna życiorys list_motywacyjny kwalifikacja umiejętność "
                                   "zatrudnić zatrudniać zwolnić zwalniać rzucić awans podwyżka etat nadgodzina "
                                   "urlop_macierzyński zwolnienie pracownica przełożony podwładny "
                                   "związek_zawodowy strajk przedsiębiorstwo przedsiębiorca spółka zakład fabryka "
                                   "produkcja termin wykonywać kierować zarządzać zmiana szkolenie praktyka staż "
                                   "usługa"),
    ("education", "edukacja szkolnictwo szkoła_podstawowa szkoła_średnia matura uczelnia wydział semestr sesja "
                  "stypendium indeks rektor dziekan profesor wykładowca zajęcie pozalekcyjny kółko wiedza "
                  "zdolność zdolny zapamiętać streszczenie notatka wypracowanie dyktando prezentacja praca_domowa "
                  "rozwiązywać rozwiązać zaliczyć oblać"),
    ("food and cooking", "przepis składnik potrawa mąka jajo drożdże przyprawa kminek majonez musztarda ocet sos "
                         "bułka pieczywo kasza fasola groch kalafior brokuł szpinak sałata papryka burak por "
                         "pietruszka seler dynia gruszka śliwka wiśnia czereśnia truskawka malina brzoskwinia "
                         "cytryna pomarańcza banan winogrono orzech miód dżem przetwór mrożonka surowy ugotować "
                         "usmażyć upiec obierać mieszać dodawać dodać posolić podgrzać"),
    ("shopping and paying", "towar produkt jakość marka reklama reklamacja gwarancja zwrot zwracać wyprzedaż "
                            "okazja gotówka przelew rata kredyt konto bankomat portfel karta_kredytowa płatność "
                            "terminal zamówienie dostawa kurier centrum_handlowe dział konsument klientela "
                            "sprzedaż oszczędzać wydać kupiec dług pożyczka oprocentowanie inwestycja cennik"),
    ("health and way of life", "dieta odchudzać schudnąć przytyć waga odżywiać witamina kaloria wysiłek kondycja "
                               "stres zmęczenie sen bezsenność palić papieros alkohol nałóg wypadek uraz rana "
                               "złamać złamanie opatrunek pogotowie operacja zabieg objaw zastrzyk szczepionka "
                               "wyzdrowieć ranny poszkodowany"),
    ("the environment", "środowisko przyroda natura ochrona chronić zanieczyszczenie zanieczyszczać śmieć odpad "
                        "segregować recykling ekologia ekologiczny ocieplenie susza powódź pożar zagrożenie "
                        "gatunek park_narodowy rezerwat energia elektrownia węgiel ropa zużywać oszczędność"),
    ("the state and society", "społeczeństwo obywatel obywatelstwo naród narodowy ojczyzna rząd premier prezydent "
                              "minister ministerstwo sejm senat poseł głosować kandydować partia polityka polityk "
                              "polityczny demokracja władza ustawa konstytucja gmina powiat samorząd petent "
                              "podatek gospodarka gospodarczy kryzys inflacja bezrobotny bieda dobrobyt emigracja "
                              "imigrant uchodźca przestępczość przestępstwo przestępca kradzież złodziej ukraść "
                              "policjantka więzienie kara sędzia adwokat flaga hymn godło podatnik wyborca głos "
                              "sondaż opozycja koalicja reforma przepis meldunek zameldować włamanie napad "
                              "morderstwo zabójstwo świadek śledztwo areszt prokurator wyrok skazać oskarżony "
                              "niewinny winny"),
    ("science and technology", "nauka_ścisła naukowiec badacz odkrycie odkryć wynalazek wynaleźć wynalazca "
                               "technika technologia urządzenie maszyna laptop oprogramowanie program aplikacja "
                               "ekran klawiatura drukarka sieć dane plik pobrać zainstalować wyłączyć włączyć "
                               "naładować bateria pomysłowy smartfon wyszukiwarka"),
    ("the media", "media prasa dziennik tygodnik miesięcznik czasopismo artykuł nagłówek reporter redakcja wywiad "
                  "audycja serial reklamówka nadawać transmisja kanał słuchacz czytelnik widownia portal "
                  "komentarz informować publikować nagranie nagrać dziennikarka nakład abonament"),
    ("culture and stereotypes", "dziedzina wydarzenie kulturalny literatura proza poezja rzeźba malarstwo "
                                "zabytkowy stereotyp uprzedzenie tolerancja tolerancyjny obcy religia wiara "
                                "wierzący msza ksiądz modlić"),
    ("gestures and expression", "gest mimika uśmiech uśmiechać kiwać machać mrugać marszczyć płakać łza krzyczeć "
                                "szeptać"),
    ("the roles", "pracodawczyni urzędniczka pasażerka obsługa recepcjonista recepcja"),
    ("verbs of a B1 conversation", "wyrażać wyrazić uzasadniać uzasadnić twierdzić przekonać przekonywać "
                                   "dyskutować dyskusja proponować zaproponować propozycja sugerować zauważyć "
                                   "zauważać wspominać wspomnieć ostrzegać ostrzec obawiać zależeć wpływać wpływ "
                                   "powodować spowodować przyczyna skutek rezultat rozwiązanie osiągnąć osiągać "
                                   "rozwijać rozwój wzrastać wzrost spadać spadek zwiększać zmniejszać tworzyć "
                                   "stworzyć utrzymywać utrzymać istnieć dotyczyć brakować brak uczestniczyć "
                                   "udział organizować zorganizować przedstawiać przedstawić"),
    ("certainty, degree and time", "jednak zatem toteż przy_tym poza_tym na_przykład po_pierwsze po_drugie "
                                   "przede_wszystkim ponadto wprawdzie mianowicie albowiem jakby jakoby żeby_nie "
                                   "szczęśliwie prawdopodobnie zapewne zwłaszcza szczególnie głównie niemal ledwo "
                                   "całkowicie zupełnie absolutnie kompletnie przypadkiem celowo specjalnie "
                                   "stopniowo jednocześnie równocześnie tymczasem dotychczas obecnie ostatnio "
                                   "przeciętny typowy wyjątkowy zwykły codzienny niezwykły"),
]


# B2's scope: the same centre's "Poziom B2" page (read 2026-11-12) gives no topic list; it names roles (one
# who does sport, a fan, a viewer, a reader, a listener, a driver and vehicle owner, a witness, the victim of a
# crime, someone in a road accident or collision), texts of different intents (warning, protest, complaint,
# instruction, recommendation, advertising), colloquial expressions and idioms, the telephone (passing on a
# message), going over to `ty`, discussion (a point of view, arguments, definitions, conditions and
# consequences, quoting and answering someone, an interview), writing (a character sketch, an essay, a
# report, an official letter, a CV, a review), and in its grammar `żaden`, `każdy`, `wszyscy`, impersonal and
# passive forms, participles, the names of countries and their inhabitants, adjectives from nouns
# (`lekarz` - `lekarski`), abstract nouns from adjectives (`dojrzały` - `dojrzałość`) and diminutives.  The
# words below are written for those, with the abstract vocabulary such a discussion needs and B1's
# topics taken a level further (work, housing, the media, law, health, relationships, nature, the arts,
# travel).  A word an earlier level teaches is skipped.
B2 = [
    ("sport, fans and spectators", "uprawiać amator amatorski zawodowiec rozgrywka turniej liga sezon rekord "
                                   "rekordzista faworyt rywal rywalizacja konkurencja eliminacja finał półfinał "
                                   "kwalifikować trybuna doping dopingować oklaski klaskać publiczność tłum "
                                   "entuzjazm emocja kontuzja rozgrzewka wytrzymałość sprawność biegacz pływak "
                                   "kolarz kolarstwo narciarstwo lekkoatletyka szachy bokser sędziować faul rzut "
                                   "karny"),
    ("readers, listeners and reviews", "czytelniczka lektura bestseller wydawnictwo wydawca autor autorka "
                                       "bohaterka fabuła wątek postać narrator rozdział tytuł okładka recenzja "
                                       "recenzent krytyk ocenić polecać polecić zachwycać zachwyt rozczarowywać "
                                       "przereklamowany wciągający banalny oryginalny nadawca odbiorca prezenter "
                                       "prowadzący"),
    ("drivers and vehicles", "pojazd ciężarówka motocykl skuter hulajnoga rejestracja ubezpieczyciel polisa "
                             "przegląd mandat fotoradar prędkość ograniczenie znak_drogowy pas jezdnia pobocze "
                             "zakręt korek objazd remont wyprzedzać wyprzedzić hamować zahamować parkować "
                             "zaparkować holować paliwo benzyna tankować opona hamulec kierownica silnik zderzak "
                             "lusterko"),
    ("accidents, crime and witnesses", "kolizja zderzenie zderzyć potrącić potrącenie sprawca obrażenie ranić "
                                       "protokół zeznanie zeznawać zeznać oszust oszustwo oszukać okraść "
                                       "włamywacz kieszonkowiec zgłosić zgłoszenie zawiadomić zawiadomienie "
                                       "podejrzewać podejrzenie dochodzenie odcisk alibi oskarżyć oskarżenie "
                                       "obrona obrońca proces rozprawa grzywna ukarać zatrzymanie ochroniarz "
                                       "monitoring"),
    ("complaints, warnings and protests", "skarga skarżyć reklamować protest protestować sprzeciw sprzeciwiać "
                                          "demonstracja manifestacja petycja ostrzeżenie zakaz zakazywać zakazać "
                                          "nakaz zalecenie zalecać polecenie instrukcja wskazówka zastrzeżenie "
                                          "odszkodowanie rekompensata niezadowolenie niezadowolony usterka wada "
                                          "wadliwy uszkodzony uszkodzić zepsuć naprawa serwis infolinia"),
    ("the telephone and messages", "przekazywać wiadomość_głosowa połączyć rozłączyć zasięg abonent oddzwaniać "
                                   "nieobecny zastępca sekretariat sekretarka"),
    ("going over to ty", "bruderszaft tytułować uprzejmość grzeczność nietakt taktowny dystans"),
    ("discussion and argument", "punkt_widzenia stanowisko pogląd przekonanie teza hipoteza dowodzić argumentować "
                                "argumentacja rozważać rozważyć analizować analiza porównanie definicja "
                                "definiować określać określić wniosek wnioskować konsekwencja warunek zależność "
                                "cytat cytować przytaczać powoływać ustosunkować zaprzeczać zaprzeczyć "
                                "potwierdzać potwierdzić podkreślać podkreślić zwracać_uwagę stwierdzać "
                                "stwierdzić uogólniać przesadzać przesada kompromis negocjować negocjacja debata "
                                "polemika kontrowersyjny kontrowersja słuszny niesłuszny przekonujący wiarygodny "
                                "obiektywny subiektywny logiczny rzeczowy bezsporny wątpliwy"),
    ("interviews and writing", "rozmówca pytający ankieta ankietowany respondent charakterystyka rozprawka "
                               "sprawozdanie podanie pismo zażalenie załącznik adresat z_poważaniem podpis "
                               "podpisywać wykształcenie referencja recenzować opis opisowy wstęp rozwinięcie "
                               "zakończenie akapit konspekt szkic brudnopis poprawiać poprawka"),
    ("spelling and language", "ortografia ortograficzny interpunkcja przecinek kropka dwukropek nawias cudzysłów "
                              "wykrzyknik pytajnik litera samogłoska spółgłoska akcent wymowa sylaba wyraz "
                              "zdanie_złożone gramatyka składnia odmiana synonim antonim idiom przysłowie "
                              "powiedzenie frazeologizm potoczny zdrobnienie dialekt gwara"),
    ("countries and their peoples", "kontynent azjatycki afrykański amerykański australijski niemiecki francuski "
                                    "angielski brytyjski hiszpański włoski rosyjski ukraiński czeski słowacki "
                                    "litewski białoruski węgierski szwedzki norweski duński holenderski belgijski "
                                    "szwajcarski austriacki grecki turecki chiński japoński koreański indyjski "
                                    "arabski żydowski meksykański kanadyjski brazylijski zagraniczny "
                                    "międzynarodowy"),
    ("adjectives from nouns", "lekarski szkolny uniwersytecki miejski wiejski domowy kuchenny państwowy rządowy "
                              "prawny sądowy policyjny wojskowy morski górski leśny rzeczny zimowy letni wiosenny "
                              "jesienny nocny dzienny poranny wieczorny roczny miesięczny tygodniowy finansowy "
                              "handlowy przemysłowy rolniczy medyczny naukowy techniczny artystyczny muzyczny "
                              "literacki historyczny geograficzny ekonomiczny społeczny kulturowy religijny"),
    ("abstract nouns from adjectives", "dojrzałość mądrość głupota uczciwość szczerość odwaga tchórzostwo "
                                       "cierpliwość lenistwo pracowitość życzliwość wrażliwość obojętność "
                                       "samodzielność niezależność odpowiedzialność wolność równość "
                                       "sprawiedliwość niesprawiedliwość prawdziwość piękno brzydota dobroć "
                                       "złośliwość skromność pewność_siebie nieśmiałość szybkość powolność "
                                       "wielkość długość szerokość głębokość grubość ciężar trudność łatwość "
                                       "prostota złożoność różnorodność podobieństwo jedność"),
    ("diminutives", "domek kotek piesek ptaszek kwiatek łóżeczko rączka nóżka główka oczko serduszko synek "
                    "mamusia troszkę troszeczkę"),
    ("żaden, każdy, wszyscy and the impersonal", "niejeden jakikolwiek którykolwiek gdziekolwiek jakkolwiek "
                                                 "wiadomo słychać"),
    ("society, economy and the world", "globalizacja migracja integracja dyskryminacja nierówność ubóstwo "
                                       "bogactwo dochód wydatek budżet zadłużenie inwestor giełda waluta kurs "
                                       "euro terroryzm konflikt dyplomacja sankcja sojusz porozumienie traktat "
                                       "organizacja wolontariusz wolontariat fundacja stowarzyszenie działacz "
                                       "aktywista kampania referendum mniejszość prawa_człowieka wolność_słowa "
                                       "cenzura propaganda korupcja łapówka afera skandal"),
    ("science, health and environment", "eksperyment teoria laboratorium postęp sztuczna_inteligencja robot "
                                        "cyfrowy innowacja patent genetyka gen epidemia pandemia wirus bakteria "
                                        "odporność profilaktyka leczenie terapia rehabilitacja depresja psycholog "
                                        "psychiatra uzależnienie nadwaga otyłość emisja dwutlenek_węgla "
                                        "odnawialny wiatrak klimatyczny wymierać"),
    ("feelings and character, finer", "wzruszenie wzruszyć wzruszony zachwycony oburzony oburzenie przerażenie "
                                      "niepokój ulga zazdrość wdzięczność wdzięczny żal żałować tęsknota "
                                      "frustracja zniechęcony zniecierpliwiony podekscytowany zawstydzony "
                                      "skrępowany zakłopotany zdesperowany bezczelny złośliwy arogancki "
                                      "egoistyczny altruistyczny troskliwy opiekuńczy wyrozumiały apodyktyczny "
                                      "konsekwentny niezdecydowany zdecydowany"),
    ("verbs of a B2 text", "dostrzegać dostrzec uświadomić uświadamiać zdawać_sobie_sprawę przyczyniać przyczynić "
                           "wynikać wyniknąć skutkować ograniczać ograniczyć umożliwiać umożliwić uniemożliwić "
                           "ułatwiać utrudniać zapobiegać zapobiec wpłynąć oddziaływać polegać opierać wywoływać "
                           "wywołać powstawać powstać zanikać rozprzestrzeniać przyciągać zniechęcać zachęcać "
                           "zachęcić motywować inspirować doceniać docenić lekceważyć ignorować tolerować "
                           "akceptować zaakceptować odrzucać odrzucić popierać poprzeć ujawnić przyznawać domagać "
                           "żądać wymagać wymaganie"),
    ("connectors of a B2 text", "aczkolwiek mimo_że pomimo bowiem ażeby w_rezultacie w_przeciwieństwie_do "
                                "z_jednej_strony z_drugiej_strony innymi_słowy co_więcej tym_bardziej niemniej "
                                "jednakże owszem bynajmniej rzekomo zasadniczo ewentualnie ewentualny ostatecznie "
                                "względnie poniekąd"),
    ("the workplace", "obowiązkowy dobrowolny delegacja projekt wykonawca zleceniodawca zlecenie umowa_o_pracę "
                      "kontrakt wypowiedzenie wypowiedzieć rezygnacja zrezygnować kompetencja kompetentny "
                      "odpowiedzialny wydajność efektywny efektywność współpraca współpracownik współpracować "
                      "konkurent strategia zysk strata dochodowy marketing promować konferencja szkolić wdrożyć "
                      "wdrażać nadzorować kontrolować zarząd prezes dyrekcja administracja księgowa księgowość "
                      "biznes biznesmen"),
    ("home and housing", "nieruchomość lokal kredyt_hipoteczny hipoteka remontować wyremontować urządzać urządzić "
                         "wystrój dekoracja tapeta podłogowy dywan zasłona firanka parapet kran rura instalacja "
                         "hydraulik elektryk przeciekać zalać sąsiedztwo przestronny ciasny umeblowanie "
                         "wyposażenie czynszowy administrator zarządca spółdzielnia eksmisja bezdomny bezdomność"),
    ("the internet and media, B2", "internauta użytkownik logować zalogować wylogować rejestrować zarejestrować "
                                   "udostępniać udostępnić polubić komentować wpis fałszywy dezinformacja "
                                   "wiarygodność rzetelny dziennikarstwo publicystyka felieton reportaż relacja "
                                   "relacjonować sensacja tabloid nakręcić reżyserować scenariusz scenarzysta "
                                   "obsada ekranizacja"),
    ("law and the state, B2", "kodeks przestrzegać naruszać naruszyć nielegalny legalny zgodny sprzeczny "
                              "uprawnienie pozwolenie zezwolenie licencja urzędowy oficjalny nieoficjalny "
                              "formalny nieformalny procedura biurokracja rozpatrzyć decydent kadencja "
                              "ustawodawca parlament parlamentarny rządzić obywatelski patriotyzm patriota "
                              "niepodległość"),
    ("health and the body, B2", "samopoczucie dolegliwość przewlekły omdlenie zemdleć osłabienie wymioty "
                                "wymiotować biegunka zatrucie zapalenie infekcja zakażenie gorączkować kuracja "
                                "wyleczyć zalecić skierowanie specjalista chirurg chirurgia pediatra ginekolog "
                                "okulista ortopeda kardiolog szpitalny poprawa zdrowotny niepełnosprawny "
                                "niepełnosprawność wózek"),
    ("emotions and relationships, B2", "partnerka zdrada zdradzić zerwać rozstanie rozstać pojednanie przebaczyć "
                                       "zaangażowanie zaangażowany zakochać zauroczenie flirt flirtować romans "
                                       "uczuciowy emocjonalny czułość czuły namiętność namiętny samotnie "
                                       "wspólnota więź bliskość wsparcie wspierać wspomóc pomocny"),
    ("nature and landscape, B2", "nizina wyżyna równina pagórek przełęcz grań lodowiec wulkan trzęsienie "
                                 "trzęsienie_ziemi tsunami huragan tornado ulewa grad szron gołoledź odwilż "
                                 "zachmurzenie prognoza opad wilgotność ciśnienie bagno torfowisko puszcza dąb "
                                 "sosna brzoza świerk buk jodła kasztan krzew mech grzybobranie zbierać "
                                 "jeleń sarna dzik żubr bocian orzeł sowa wiewiórka jeż żaba wąż owad pszczoła "
                                 "mucha komar motyl"),
    ("culture and the arts, B2", "dzieło_sztuki arcydzieło twórca twórczość awangarda klasyczny współczesny "
                                 "nowoczesny tradycyjny ludowy folklor obrzęd obyczaj dziedzictwo mecenas sponsor "
                                 "wernisaż ekspozycja eksponat kustosz koneser inscenizacja reżyseria aktorstwo "
                                 "kostium musical orkiestra dyrygent skrzypce fortepian gitara perkusja "
                                 "koncertować nagrywać płyta album przebój"),
    ("travel and tourism, B2", "turystyka agroturystyka atrakcja atrakcyjny malowniczy zatłoczony odludny "
                               "egzotyczny sezonowy apartament rejs żegluga lotniczy kolejowy autokar autokarowy "
                               "ulgowy ambasador"),
    ("everyday adjectives, B2", "zasadniczy istotny nieistotny kluczowy podstawowy zaawansowany szczegółowy "
                                "ogólny konkretny abstrakcyjny praktyczny teoretyczny skuteczny efektowny "
                                "widoczny niewidoczny oczywisty zrozumiały niezrozumiały jednoznaczny niejasny "
                                "precyzyjny dokładny przybliżony stały tymczasowy chwilowy trwały kruchy "
                                "elastyczny sztywny gładki szorstki śliski wilgotny suchy mokry świeży nieświeży "
                                "zepsuty aktualny przestarzały rzadki powszechny popularny niepopularny kosztowny "
                                "opłacalny darmowy bezpłatny płatny"),
    ("everyday verbs, B2", "zawierać obejmować dzielić podzielić łączyć rozdzielić oddzielić gromadzić "
                           "porządkować uporządkować sortować zestawiać obliczać obliczyć szacować oszacować "
                           "mierzyć zmierzyć ważyć zważyć weryfikować naprawiać ulepszać ulepszyć poprawić "
                           "udoskonalić modernizować przekształcić przekształcać zamieniać zastąpić zastępować "
                           "usuwać usunąć uzupełnić uzupełniać pogarszać pogorszyć polepszyć przyspieszyć "
                           "opóźniać opóźnić przedłużyć skrócić rozszerzyć zawęzić unikać uniknąć wytrzymać "
                           "znosić ponosić odczuwać doznać doświadczać doświadczyć przeżywać reagować zareagować "
                           "reakcja"),
]

INVENTORY = {"a1": A1, "a2": A2, "b1": B1, "b2": B2}


def headwords(level):
    """(headword, topic) in the inventory's order, `_` read as a space."""
    for topic, words in INVENTORY[level]:
        for w in words.split():
            yield w.replace("_", " "), topic
