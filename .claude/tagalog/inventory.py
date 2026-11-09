#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

No openly licensed graded Tagalog word list was found (see `tl_level.py`), so a
level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never invented a meaning) and tops the
level up with the commonest remaining words.

A word may carry a part of speech after a colon (`mahal:adj`) where the
spelling is shared and the level wants one reading first.  VERBS ARE WRITTEN AS
THE AFFIXED VERB A LEARNER SAYS (`kumain` "to eat", `mag-aral` "to study"),
never the bare root, which Wiktionary files as a noun (`kain` "act of
eating").  Multi-word entries join with `_`.  Spellings are the plain ones
ordinary writing uses (`maganda`, not `magandá`), the 2007 orthography's
(`puwede`, whose older `pwede` the subtitles still write and which counts
towards it).
"""

A1 = [
    ('pronouns', 'ako ikaw ka siya kami tayo kayo sila ko mo niya namin natin ninyo nila '
                 'akin iyo kaniya:pron atin amin inyo kanila ito iyan iyon'),
    ('markers and particles', 'ang ng sa si ni kay mga ay na:adv pa lang din rin naman nga ba po '
                              'opo oo hindi huwag talaga sana kasi daw siguro'),
    ('questions', 'ano sino saan kailan paano bakit ilan magkano alin nasaan kumusta'),
    ('places and pointing', 'dito diyan doon nandito nandiyan nandoon'),
    ('conjunctions', 'at o pero kung dahil para kaya kapag habang bago:prep pagkatapos'),
    ('having and wanting', 'may mayroon wala gusto ayaw kailangan dapat puwede alam kilala'),
    ('greetings and politeness', 'salamat paalam ingat:intj sige pasensiya patawad tuloy:intj '
                                 'magandang_umaga magandang_hapon magandang_gabi walang_anuman'),
    ('numbers', 'isa dalawa tatlo apat lima anim pito walo siyam sampu dalawampu daan libo '
                'una ikalawa kalahati numero'),
    ('time', 'oras minuto araw:noun gabi umaga tanghali hapon ngayon kahapon bukas mamaya kanina '
             'linggo buwan taon lagi minsan maaga huli:adj palagi'),
    ('days and months', 'Lunes Martes Miyerkoles Huwebes Biyernes Sabado Linggo Enero Pebrero Marso '
                        'Abril Mayo Hunyo Hulyo Agosto Setyembre Oktubre Nobyembre Disyembre'),
    ('family', 'pamilya nanay tatay ina ama magulang kapatid kuya ate anak asawa lolo lola bata '
               'lalaki babae tao kaibigan tito pinsan'),
    ('people and yourself', 'pangalan edad bansa lungsod bayan probinsiya wika Pilipino '
                            'trabaho estudyante guro doktor kapitbahay tirahan'),
    ('food and drink', 'pagkain tubig kanin bigas tinapay karne isda manok baboy itlog gulay prutas '
                       'saging mangga kape gatas asukal asin sabaw almusal tanghalian hapunan '
                       'ulam meryenda serbesa'),
    ('shopping and money', 'pera piso presyo tindahan palengke mura mahal:adj bumili magbayad sukli'),
    ('the home', 'bahay kuwarto kusina banyo pinto bintana mesa upuan kama libro telepono susi '
                 'damit sapatos'),
    ('the town and getting about', 'kalye daan kotse bus dyip tren eroplano barko tiket istasyon '
                                   'hotel ospital paaralan opisina simbahan kaliwa kanan malayo '
                                   'malapit diretso'),
    ('the body and feeling ill', 'katawan ulo mata tainga ilong bibig kamay paa tiyan ngipin buhok '
                                 'sakit masakit gamot lagnat'),
    ('weather', 'panahon ulan hangin mainit malamig bagyo'),
    ('colours', 'kulay pula asul dilaw berde itim puti'),
    ('describing', 'malaki maliit bago:adj luma maganda pangit mabuti masama masaya malungkot '
                   'mahaba maikli madali mahirap marami kaunti masarap mabait mabilis mabagal '
                   'pagod gutom uhaw busog malinis marumi bukas:adj sarado'),
    ('everyday verbs', 'kumain uminom matulog gumising pumunta dumating umalis umuwi bumalik '
                       'pumasok lumabas umupo tumayo maglakad tumakbo magtrabaho mag-aral '
                       'magbasa sumulat magsalita magtanong sumagot makinig manood makita '
                       'marinig maintindihan magluto maligo magbihis maglaro kumanta sumayaw '
                       'tumawag maghintay maghanap magbigay kumuha magdala gumawa tumulong '
                       'magsimula matapos magustuhan mahalin tumira buksan isara'),
]

INVENTORY = {'a1': A1}
