#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

No graded Swedish word list was found published (see `swedish_level.py`), so a
level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never invented a meaning) and tops the
level up with the commonest remaining words.

A word may carry a part of speech after a colon (`en:article`) where the
spelling is shared and the level wants one reading first.  An underscore joins
a two-word entry (`god_morgon`).  Spellings are Wiktionary's headwords: a verb
by its infinitive (`äta`), a noun in the indefinite singular (a plural-only
noun in the plural: `pengar`), an adjective in its common-gender form.
"""

A1 = [
    ('pronouns', 'jag du han hon den det vi ni de man:pron mig dig honom henne oss dem sig '
                 'min:pron din hans hennes vår er deras sin:pron'),
    ('articles', 'en:article'),
    ('questions', 'vad vem var:adv vart när varför hur vilken'),
    ('prepositions and place words', 'i på:prep till:prep från med:prep utan:prep för:prep av:prep om under över:prep efter:prep före hos '
                                     'bredvid mellan framför bakom vid:prep här där hem hemma ute inne '
                                     'upp ner bort nära'),
    ('conjunctions and little words', 'och eller men att som:pron eftersom så inte ja nej jo också bara '
                                      'mycket lite kanske alltid aldrig ofta ibland redan igen '
                                      'nu sedan snart'),
    ('greetings and politeness', 'hej hejdå tack varsågod förlåt ursäkta god_morgon god_natt '
                                 'välkommen okej'),
    ('numbers', 'noll två tre fyra fem sex sju åtta nio tio elva tolv tjugo trettio femtio hundra '
                'tusen första andra:adj tredje halv'),
    ('time', 'tid timme minut dag natt morgon kväll eftermiddag idag imorgon igår vecka månad år '
             'klocka tidig sen:adj'),
    ('days', 'måndag tisdag onsdag torsdag fredag lördag söndag'),
    ('months', 'januari februari mars april maj juni juli augusti september oktober november '
               'december'),
    ('family', 'familj mamma pappa mor far bror syster son dotter kvinna fru make barn pojke flicka '
               'mormor farmor morfar farfar vän kompis bebis'),
    ('people and yourself', 'namn ålder land stad språk svenska engelska arbete jobb elev student '
                            'lärare läkare människa person'),
    ('food and drink', 'mat vatten kaffe te mjölk bröd vin öl ost kött fisk ägg frukt äpple apelsin '
                       'tomat sallad socker salt frukost lunch middag potatis ris smör glass'),
    ('shopping and money', 'pengar krona pris affär butik köpa sälja betala kosta billig dyr'),
    ('the home', 'hus lägenhet rum dörr fönster bord stol säng kök badrum toalett bok penna telefon '
                 'nyckel'),
    ('the town and getting about', 'gata väg bil buss tåg taxi biljett station hotell sjukhus '
                                   'skola:noun kontor bank höger vänster rakt flygplats hav '
                                   'restaurang apotek cykel'),
    ('the body and feeling ill', 'huvud öga öra näsa mun hand arm ben fot mage tand sjuk frisk '
                                 'ont medicin feber'),
    ('weather', 'väder varm kall regn sol vind:noun snö regna'),
    ('colours', 'färg röd blå gul grön svart vit brun'),
    ('describing', 'stor liten ny gammal ung fin bra dålig glad ledsen lång kort lätt svår många '
                   'all varje ingenting trött hungrig'),
    ('everyday verbs', 'vara ha göra:verb gå komma äta dricka sova vakna sitta se höra prata säga läsa '
                       'skriva förstå veta kunna vilja:verb ska:verb måste få:verb bo heta tycka öppna stänga '
                       'fråga:verb svara tänka älska arbeta lära:verb titta lyssna ta ge åka resa:verb hjälpa '
                       'hitta'),
]

# A2 (2026-11-12): the CEFR A2 descriptor's "areas of most immediate relevance" --
# the Swahili A2 topic list adapted.  Words A1 teaches are skipped by `select.py`.
A2 = [
    ('seasons and dates', 'årstid vår:noun sommar höst vinter helg semester jul påsk födelsedag '
                          'kalender datum sekund kvart'),
    ('more numbers', 'fjorton femton sexton sjutton arton nitton fyrtio sextio sjuttio åttio nittio '
                     'miljon fjärde femte dubbel'),
    ('the land and nature', 'natur skog berg sjö flod älv strand ö fält träd blomma gräs sten '
                            'himmel stjärna måne jord landsbygd park'),
    ('weather', 'moln molnig blåsa:verb storm is grad temperatur kyla värme dimma åska blöt torr'),
    ('animals', 'djur hund katt häst ko gris får:noun höna fågel:noun mus kanin björn varg älg'),
    ('clothes', 'kläder tröja byxa kjol klänning skjorta jacka rock mössa sko strumpa '
                'hatt väska handske glasögon storlek klä'),
    ('the home and the kitchen', 'trädgård vägg golv tak trappa soffa lampa skåp hylla matta '
                                 'spis kylskåp ugn tallrik kopp glas kniv gaffel sked kastrull '
                                 'diska städa tvätta laga:verb hyra granne'),
    ('food and cooking', 'grönsak morot lök kyckling korv skinka gurka banan jordgubbe '
                         'soppa kaka tårta juice godis sås peppar olja mjöl smörgås '
                         'koka steka baka smaka god:adj söt sur'),
    ('work and jobs', 'chef kollega företag lön möte yrke sjuksköterska polis bonde kock '
                      'säljare ingenjör tjänst anställa arbetslös ansöka'),
    ('school and learning', 'klass lektion läxa prov kurs universitet fråga:noun svar ord mening '
                            'övning betyg papper dator plugga'),
    ('travel and transport', 'resa:noun flyg flygplan båt tunnelbana spårvagn hållplats '
                             'pass resväska karta semester turist utland ankomst avgång '
                             'försening missa landa stiga byta'),
    ('the town', 'centrum torg kyrka museum bibliotek bio teater post polisstation '
                 'bensinstation parkering hörn bro korsning kvarter förort'),
    ('health', 'kropp hjärta rygg hals finger knä blod tandläkare vårdcentral recept '
               'förkyld hosta värk skadad må vila'),
    ('feelings', 'känsla arg orolig nervös lycklig besviken förvånad rädsla kärlek '
                 'skratta gråta oroa sakna hata'),
    ('free time', 'fritid sport fotboll match musik sång film bild konst spel resa '
                  'simma springa dansa sjunga måla träna fiska promenad bok läsa vandra'),
    ('everyday verbs', 'bära visa:verb lägga:verb ställa vända vinna förlora börja sluta '
                       'tappa välja bestämma glömma minnas lova låna hyra skicka få:verb '
                       'ändra jämföra förklara beskriva boka beställa vänta stiga'),
    ('describing things and people', 'hög låg bred smal tjock tunn tung mjuk hård snabb '
                                     'långsam ren:adj smutsig tyst högljudd vacker ful snäll elak '
                                     'rolig tråkig intressant viktig vanlig konstig enkel '
                                     'mörk ljus:adj full tom öppen stängd blond trevlig'),
    ('time words', 'ofta sällan alltid ibland strax genast fortfarande senare '
                   'förut förr nyss medan ännu dagligen'),
    ('connectors', 'därför fast:conj trots om:conj innan när:conj medan också dessutom '
                   'alltså ändå kanske antingen varken utom'),
]

INVENTORY = {'a1': A1, 'a2': A2}
