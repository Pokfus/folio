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

INVENTORY = {"a1": A1, "a2": A2}


def headwords(level):
    """(headword, topic) in the inventory's order, `_` read as a space."""
    for topic, words in INVENTORY[level]:
        for w in words.split():
            yield w.replace("_", " "), topic
