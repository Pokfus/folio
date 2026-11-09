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

INVENTORY = {"a1": A1}


def headwords(level):
    """(headword, topic) in the inventory's order, `_` read as a space."""
    for topic, words in INVENTORY[level]:
        for w in words.split():
            yield w.replace("_", " "), topic
