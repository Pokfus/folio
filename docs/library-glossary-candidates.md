# Library glossary candidates

The names and terms the Library's 101 books use that the glossary cannot answer, sorted for an editor: 198 entries worth writing, the forms that only need an alias on an entry that exists, and what to leave alone.
**How it was made (Nov 2026):** one run of `node .claude/book-gloss-candidates.js --top=900`, then every one of its 900 rows read by hand, checked against `glossary.js` (keys, titles, aliases) and, where a name has more than one bearer, against the books' own text.
**To regenerate the raw list:** `node .claude/book-gloss-candidates.js --top=900 --json=<file>` (the script's header lists the other switches, `--book=<id>` among them).
**Limits.** The machine counts a capitalised string. It cannot tell two men of one name apart, a person from a place, or a translator's spelling from the modern one. **Books** and **Cards** below are its counts of that string: a card counts when its answer or background contains the word, so "Paul" counts every Paul. Mention counts quoted in a note are the machine's too (mid-sentence uses only).
A name that lives in one book ranks too low to be here at all: the cast of Three Kingdoms, the Ramayana or the Eddas needs its own `--book=<id>` run.
This is a list of what to add, not the entries: it holds no definitions and no dates.

## New entries

None of these has a key, a title or an alias in `glossary.js`. An existing key is written `in code`. **≈** marks spellings merged under one row (the largest count is shown); **≤** marks a string shared with other bearers, so the entry's own share is smaller. "Most in" is the three books that use the string most. Rows are ranked by books, then cards, then mentions.

### People

| Entry | Books | Cards | Most in | Note |
|---|---|---|---|---|
| Jesus | ≈25 | ≈62 | Summa, King James Bible, City of God | No key at all (only `Society_of_Jesus`, `Foolishness_for_Christ`). Needs the aliases Christ, Jesus Christ, Christ Jesus, Lord Jesus. |
| Adam and Eve | 21 | 37 | Summa, City of God, King James Bible | Only `Y-chromosomal_Adam` and `Mitochondrial_Eve` hold the names; a bare alias must not go to either. |
| David (king of Israel) | 18 | 96 | King James Bible, Primary Chronicle, Summa | In the Primary Chronicle most of the 134 are a prince of Rus' called David, so no bare alias for that book; the card count is of the bare word (`David_Hume`, `David_Lloyd_George`). |
| Moses | 18 | 18 | King James Bible, Leviathan, Summa | No key, title or alias; Leviathan alone names him 206 times. |
| Mary, mother of Jesus | ≤17 | ≤64 | Summa, King James Bible, Quran | Alias 'Virgin Mary' (7 books). The Quran's Mary is the same figure. The card count is of the bare word (`Mary_Leakey`, `Mary_Wollstonecraft`). |
| Dionysius I of Syracuse | ≤16 | ≤109 | Summa, Diodorus, Plutarch | Diodorus's tyrant (287 mentions). Plutarch's Dion and Plato's letters mostly mean his son, Dionysius II, who needs his own entry. The Summa's 579 are the Areopagite (see Works and authors). |
| Antiochus IV Epiphanes | ≤16 | ≤46 | Livy, Polybius, Cassius Dio | `Antiochus_III_the_Great` is the only Antiochus. The Maccabees' king ('Antiochus surnamed Epiphanes') is the fourth. |
| Paul the Apostle | ≤15 | ≤148 | King James Bible, Summa, Jerome's Letters | Collision: `St._Paul` and its alias 'Saint Paul' are the city in Minnesota, so the apostle would link there today. |
| Joseph (son of Jacob) | ≤14 | ≤134 | King James Bible, Summa, City of God | The Bible's other Joseph, the husband of Mary, shares the string; the Quran's sura is the patriarch's. |
| Solomon | 14 | 25 | King James Bible, City of God, Summa | Only `Solomon_Islands` holds the name. |
| Jacob | 13 | 22 | King James Bible, Summa, City of God |  |
| Samuel (prophet) | ≤12 | ≤65 | King James Bible, Summa, Leviathan | Leviathan cites him 21 times. |
| Memnon of Rhodes | ≤12 | ≤9 | Diodorus, Pausanias, Strabo | Diodorus 17 names him so. The Memnon of Pausanias and Diodorus 2 is the hero (see Gods, heroes and myth). |
| Elijah | ≈12 | ≈6 | King James Bible, Summa, Jerome's Letters | 'Elias' is the form of the New Testament and the Summa, so it must be an alias; the Elias of Le Morte Darthur is a knight. |
| Daniel (prophet) | ≤11 | ≤55 | King James Bible, Summa, Jerome's Letters | The Primary Chronicle's ten are not checked; `Daniel_of_Moscow` and `Daniel_of_Galicia` exist. |
| Metellus Numidicus | ≤11 | ≤22 | Plutarch, Cassius Dio, Pausanias | Plutarch's 'Caecilius Metellus the consul', sent against Jugurtha. The same string is Metellus Pius (the war with Sertorius), the Metellus of Pausanias 7 and Metellus Scipio; no Metellus has a key. |
| Cain and Abel | ≈11 | ≈3 | City of God, King James Bible, Primary Chronicle | The City of God names them 54 and 21 times. |
| Isaac | ≤10 | ≤20 | King James Bible, City of God, Summa | The card count is of the bare word (`Isaac_Newton`). |
| Saul | 10 | 6 | King James Bible, Leviathan, City of God |  |
| Antigonus II Gonatas | ≤9 | ≤30 | Diodorus, Plutarch, Polybius | Pausanias's 'Antigonus, son of Demetrius'. `Antigonus_I_Monophthalmus` is the only Antigonus and owns the alias 'Antigonus I'. |
| Antigonus III Doson | ≤9 | ≤30 | Diodorus, Plutarch, Polybius | The Antigonus whom Aratus brings in against Cleomenes (Polybius 2, Pausanias 2). |
| Artaxerxes II | ≤9 | ≤26 | Diodorus, Plutarch, King James Bible | The king Cyrus marches against ('Artaxerxes his brother', Diodorus) and the subject of Plutarch's Life. The Artaxerxes whom Themistocles meets is another, and Ezra has one too; the only use of the name today is the alias 'Artaxerxes V' on `Bessus`. |
| Attalus I | ≤9 | ≤16 | Livy, Polybius, Diodorus | The 'king Attalus' who fights Philip beside the Rhodians (Livy 31 and 32, Polybius 16). Only `Attalus_III` exists; the Attalus who is Eumenes's brother (Polybius 32) is a third man. |
| Aaron | 9 | 13 | King James Bible, Summa, Leviathan | `Aaron_Burr` is the only key with the name. |
| Agathocles of Syracuse | ≤9 | ≤10 | Diodorus, Polybius, Pausanias | Diodorus 19 and 20. `Agathocles_of_Egypt`, the minister of Polybius 15, is the only key with the name. |
| Joshua | 9 | 7 | King James Bible, Leviathan, Jerome's Letters | `Book_of_Joshua` exists; the man does not. |
| Titus Manlius Torquatus | ≈9 | ≈7 | Livy, Plutarch, Cassius Dio | Livy 7 ('Titus Manlius, son of Lucius'); Livy 26 has a later bearer. The Manlius brought to trial in Plutarch's Camillus is another; no Manlius has a key. |
| Judas Iscariot | ≤9 | ≤3 | King James Bible, Summa, Jerome's Letters | This King James Bible includes the Apocrypha, whose Judas ('Judas and his brethren') is Judas Maccabeus: a second entry the same string hides. |
| Samson | 9 | 2 | King James Bible, Don Quixote, Canterbury Tales | Don Quixote has both the biblical Samson and the bachelor Samson Carrasco. |
| Publius Sulpicius Rufus | ≤8 | ≤17 | Livy, Plutarch, Cassius Dio | The Sulpicius who acts with Marius against Sulla in Plutarch. Livy's are consuls of the same family name. |
| Clodius Albinus | ≤8 | ≤9 | Livy, Cassius Dio, The Prince | Severus's rival in the West (Cassius Dio 74 to 76; The Prince, ch. 19). The Albinus of Cassius Dio 11 is a Postumius; Livy's are not checked. |
| Octavia the Younger | ≤8 | ≤7 | Tacitus, Plutarch, Cassius Dio | Plutarch's 'Octavia, the sister of Augustus'. Tacitus 12 to 14 have a younger Octavia, betrothed under Claudius, who needs a second entry. |
| King Cheng of Zhou | ≤7 | ≤42 | Three Kingdoms, Documents, Rites | The Documents' 'king Cheng'. The same syllable is 'Cheng Tang' (`Tang_of_Shang`); Three Kingdoms' 100 are not checked. |
| Augustine of Canterbury | ≤7 | ≤32 | Summa, Bede, Jerome's Letters | Bede and the Chronicle ('Pope Gregory sent Augustine to Britain'). The Summa's 2,899 are `Augustine_of_Hippo`. |
| Theodosius of the Caves | ≤7 | ≤28 | Primary Chronicle, Bede, City of God | The Primary Chronicle's 'Theodosius the Prior of the Crypt Monastery' (51 mentions). `Theodosius_I` is the emperor; the Antonius of the same pages is likewise not `Anthony_the_Great`. |
| Duke of Shao | ≤7 | ≤20 | Three Kingdoms, Classic of Poetry, Documents | The Documents: 'the dukes of Shao and Zhou'. In Three Kingdoms the syllable is `Yuan_Shao`. |
| Marcus Livius Salinator | ≤7 | ≤19 | Livy, Plutarch, Cassius Dio | The consul 'Marcus Livius' of Livy 27, with Gaius Claudius. Livy 36 has a Gaius Livius Salinator; `Livius_Andronicus` and the alias 'Titus Livius' on `Livy` exist. |
| Hasdrubal Barca | ≤7 | ≤12 | Livy, Polybius, Cassius Dio | Hannibal's brother ('his brother Hasdrubal'): `Hasdrubal's_march_into_Italy` exists, the man does not. Livy and Polybius also mean Hamilcar's successor in Spain and 'Hasdrubal, son of Gisgo'. |
| Publius Quinctilius Varus | ≤7 | ≤11 | Tacitus, Cassius Dio, Livy | Tacitus's 'Quintilius Varus and his army' (both spellings occur). Livy's and the earlier Varuses in Cassius Dio are other men. |
| Astyages | 7 | 7 | Herodotus, Ovid, Diodorus | Herodotus 1: 'Astyages son of Cyaxares'. |
| Tigranes the Great | 7 | 4 | Plutarch, Cassius Dio, Tacitus | The king of Armenia whom Lucullus and Pompey fight (Plutarch). Tacitus's Tigranes are later kings set over Armenia by Rome. |
| Pontius Pilate | 7 | 4 | King James Bible, Summa, Primary Chronicle | The books say only 'Pilate'. |
| Dion of Syracuse | 7 | 2 | Plutarch, Plato, Diodorus | Plutarch's Life and Plato's letters. The alias 'Dion of Prusa' on `Dio_Chrysostom` is a different man. |
| Publius Valerius Publicola | 7 | 1 | Plutarch, Livy, Summa | Plutarch's Life, which compares him with Solon; also Livy. |
| Theodore of Tarsus | ≤6 | ≤55 | Bede, Anglo-Saxon Chronicle, Primary Chronicle | Bede's 'Archbishop Theodore', 'a native of Tarsus'. The card count is of the bare word (`Theodore_Roosevelt`). |
| Kang Shu | ≤6 | ≤23 | Three Kingdoms, Documents, Analects | The Documents' prince Feng, 'generally spoken of as Kang Shu'. The Analects' 'Ji Kang' and the Documents' 'Tai Kang' and king Kang are three other men. |
| Publius Decius Mus | 6 | 13 | Livy, Cassius Dio, Julius Caesar | Father and son of one name in Livy 7 to 10 ('he called on his father, Publius Decius, by name'). The emperor Decius has no key either. |
| Maecenas | 6 | 9 | Cassius Dio, Seneca, Suetonius | Cassius Dio 49 to 55, and Seneca's letters. |
| Scipio Nasica Serapio | 6 | 6 | Plutarch, Livy, Cassius Dio | Plutarch's 'Publius Nasica', the enemy of Tiberius Gracchus. The Nasica at Pydna, 'a son-in-law of Scipio Africanus', is an earlier bearer. |
| Titus Labienus | 6 | 5 | Gallic War, Cassius Dio, Plutarch | Caesar's lieutenant in the Gallic War (36 mentions); also Cassius Dio and Plutarch. |
| Philopoemen | 6 | 3 | Plutarch, Polybius, Pausanias | Plutarch's Life, Polybius ('Philopoemen of Megalopolis') and Pausanias. |
| Mago (brother of Hannibal) | 6 | 3 | Livy, Cassius Dio, Polybius | Livy 21 to 30, Polybius 3 ('his brother Mago'). Hanno (5 books, 6 cards) is the same case with several bearers. |
| Drusus the Younger | ≤5 | ≤20 | Tacitus, Cassius Dio, Suetonius | Tacitus's Drusus, the son of Tiberius. `Nero_Claudius_Drusus` (the Elder) and `Marcus_Livius_Drusus_(tribune)` exist. |
| Valens (emperor) | 5 | 13 | Plutarch, Bede, City of God | Bede's 'his uncle Valens'. Plutarch's eight are Fabius Valens, the general of Vitellius. Gratian (6 books, 11 cards) is the same gap. |
| Gaius Laelius | 5 | 9 | Livy, Polybius, Cassius Dio | Scipio's lieutenant in Livy 26 to 30. Seneca's 'Laelius the Wise' is not checked against him. |
| Gaius Flaminius | 5 | 9 | Livy, Polybius, Cassius Dio | The consul at Ariminum in Livy 21 and 22. Not `Titus_Quinctius_Flamininus`: the two spellings differ by one syllable. |
| Gyges | 5 | 7 | Herodotus, Strabo, Pausanias | Herodotus 1: 'Gyges son of Dascylus'. |
| Honorius (emperor) | ≤4 | ≤16 | Bede, Anglo-Saxon Chronicle, City of God | Bede I. The same book has a Pope Honorius and an Archbishop Honorius. |
| Craterus | 4 | 14 | Plutarch, Diodorus, Strabo | Alexander's officer in Plutarch and Diodorus; Plutarch also cites a writer 'Craterus the Macedonian'. |
| Zengzi | 3 | 18 | Mencius, Analects, Three Kingdoms | 'The philosopher Zeng' of the Analects and Mencius. |
| Vsevolod I of Kiev | ≤2 | ≤13 | Novgorod Chronicle, Primary Chronicle | The Vsevolod of 'Izyaslav, Svyatoslav, and Vsevolod' in both chronicles. `Vsevolod_the_Big_Nest` is later. |

Second tier, the same gap, 4 to 12 books each. Bible: Esau, Ishmael, Simeon, Lazarus, Esther, Judith, Rachel, Sarah, Josiah, Gideon, Jonathan, Nathan, Jesse, and the later Herod of the Gospels. Kings of the Hellenistic East: Pharnaces, Ariarathes, Nicomedes, Cotys, Arsaces, and the later Prusias of Polybius (only `Prusias_I_of_Bithynia` exists). Greek and Persian: Leotychides, Cleombrotus, Megacles, Xanthippus (Pericles's father in Plutarch, a Lacedaemonian in Polybius 1), Callias, Artabanus, Artabazus, Amyntas. Roman: Catulus, Lentulus, Hortensius, Fabricius, Papirius, Messala, Gratian. Church: Paulinus, Arius, Rufinus.

### Places and regions

| Entry | Books | Cards | Most in | Note |
|---|---|---|---|---|
| Lycia | ≈19 | ≈9 | Iliad, Strabo, Polybius | Homer's Lycians under Sarpedon and Glaucus, and Strabo's region. |
| Phrygia | ≈16 | ≈15 | Strabo, Diodorus, Herodotus |  |
| Lemnos | 15 | 14 | Strabo, Herodotus, Iliad |  |
| Mount Parnassus | 15 | 4 | Strabo, Pausanias, Herodotus |  |
| Sardinia | 14 | 45 | Livy, Polybius, Cassius Dio | Only `Seizure_of_Sardinia_and_Corsica` holds the name; Corsica (6 books, 13 cards) is in the same case. |
| Caria | ≈14 | ≈21 | Strabo, Diodorus, Herodotus | `Artemisia_I_of_Caria` and the alias 'Carians of Memphis' exist; the region does not. |
| Cappadocia | ≈14 | ≈21 | Strabo, Plutarch, Cassius Dio |  |
| Rhegium | ≈14 | ≈14 | Diodorus, Livy, Thucydides |  |
| Adriatic Sea | ≈13 | ≈36 | Strabo, Polybius, Diodorus |  |
| Epirus | 13 | 31 | Livy, Polybius, Strabo | `Pyrrhus_of_Epirus` exists; the region does not. |
| Sicyon | ≈13 | ≈19 | Pausanias, Plutarch, Polybius | `Aratus_of_Sicyon` and `Cleisthenes_of_Sicyon` exist; the city does not. |
| Illyria | ≈13 | ≈12 | Livy, Polybius, Strabo | `Illyrian_Wars` exists. Illyricum (Suetonius, Livy, Tacitus) could be an alias or a second entry. |
| Pamphylia | 13 | 6 | Strabo, Livy, Polybius |  |
| Locris | ≈13 | ≈4 | Diodorus, Livy, Thucydides | Locri in Italy (9 books; Livy's siege of Locri) is a different place and a second entry. |
| Smyrna | 12 | 15 | Strabo, Livy, Herodotus |  |
| Apollonia (Illyria) | ≤12 | ≤9 | Strabo, Livy, Polybius | Strabo's 'Apollonia in Epirus', where the Egnatian Way begins, and Livy's. Other towns share the name. |
| Cyzicus | 12 | 9 | Strabo, Plutarch, Diodorus | `Battle_of_Cyzicus` exists; the city does not. |
| Apulia | 12 | 6 | Livy, Cassius Dio, Diodorus |  |
| Tegea | ≈11 | ≈15 | Pausanias, Herodotus, Polybius |  |
| Orontes | 11 | 13 | Breasted, Strabo, Diodorus | The river. The alias 'Antioch on the Orontes' exists. |
| Messene | 11 | 11 | Pausanias, Polybius, Diodorus | Collision inside one book: Polybius 1 uses 'Messene' for the Sicilian city opposite Rhegium, which is `Messana`. `Messenia` and `Liberation_of_Messenia` exist. |
| Samothrace | 11 | 8 | Diodorus, Livy, Strabo |  |
| Mount Helicon | 11 | 7 | Strabo, Pausanias, Ovid |  |
| Gaza | 10 | 22 | King James Bible, Diodorus, Polybius | `Siege_of_Gaza` exists; the city of the Bible and of Diodorus 19 does not. |
| Pergamon | ≈10 | ≈17 | Livy, Pausanias, Polybius | `Pergamon_Altar`, `Library_of_Pergamon` and `Attalid_dynasty` exist; the city does not. Aliases Pergamum and Pergamus, but Homer's Pergamus is the citadel of Troy. |
| Mount Athos | 10 | 14 | Herodotus, Strabo, Thucydides | `Athos_canal` exists. |
| Ravenna | 10 | 13 | Strabo, Tacitus, Suetonius | Tacitus: the fleets 'at Misenum and at Ravenna'. |
| Colchis | ≈10 | ≈7 | Strabo, Herodotus, Pausanias |  |
| Strymon | 10 | 7 | Herodotus, Strabo, Thucydides |  |
| Halicarnassus | 9 | 43 | Herodotus, Strabo, Pausanias | 43 cards name it; only `Siege_of_Halicarnassus` and `Dionysius_of_Halicarnassus` hold the name. |
| Nicaea | 9 | 21 | Strabo, Diodorus, Plutarch | `First_Council_of_Nicaea` exists. Strabo names more than one Nicaea. |
| Cnidus | 9 | 16 | Strabo, Thucydides, Diodorus | `Battle_of_Cnidus` exists. |
| Numidia | ≈9 | ≈15 | Livy, Polybius, Cassius Dio | `Masinissa` and `Jugurtha` exist; their country does not. |
| Misenum | 9 | 15 | Tacitus, Strabo, Suetonius |  |
| Pella | 9 | 13 | Livy, Strabo, Plutarch |  |
| Thurii | 9 | 12 | Diodorus, Strabo, Plutarch |  |
| Naupactus | 9 | 10 | Thucydides, Pausanias, Diodorus | `Conference_of_Naupactus` exists. |
| Thracian Chersonese | ≤9 | ≤9 | Herodotus, Livy, Thucydides | Herodotus 6 ('tyranny in the Chersonese'). Herodotus 4 and Strabo 7 also have the Tauric Chersonese, which is `Crimea`. |
| Sinope | 9 | 9 | Strabo, Plutarch, Diodorus | `Diogenes_of_Sinope` exists; the alias 'Battle of Sinope' points at `Battle_of_Sinop`. |
| Thames | 8 | 16 | Anglo-Saxon Chronicle, Cassius Dio, Morte Darthur |  |
| Kingdom of Kent | 7 | 12 | Bede, Anglo-Saxon Chronicle, Strabo | Bede's 'province of Kent'. `Kent_State_shootings` is the only key with the word. |
| Ecbatana | 7 | 9 | Diodorus, Strabo, Herodotus |  |
| Brundisium | 7 | 7 | Cassius Dio, Plutarch, Polybius | `Pact_of_Brundisium` exists. |
| Normandy | 6 | 42 | Anglo-Saxon Chronicle, The Prince, Divine Comedy | The duchy of the Anglo-Saxon Chronicle. The 42 cards use the bare word, which includes `Normandy_landings`. |
| Elbe | 6 | 18 | Strabo, Tacitus, Treaty of Versailles | `Elbe_Day` exists; the river does not (Strabo, Tacitus, the Treaty of Versailles). |
| Galilee | 6 | 9 | King James Bible, Summa, Jerome's Letters |  |
| Canterbury | 6 | 5 | Anglo-Saxon Chronicle, Bede, Canterbury Tales |  |
| Coele-Syria | 5 | 13 | Polybius, Diodorus, Strabo | Polybius: 'the war for the possession of Coele-Syria'. |
| Ctesiphon | 5 | 11 | Cassius Dio, Strabo, Tacitus |  |
| Hermopolis | 4 | 15 | Breasted, Erman, Strabo | Breasted's 'Khmunu (Hermopolis, Eshmunen)'. `Legal_Code_of_Hermopolis` and `Nimlot_of_Hermopolis` exist. |
| Vistula | 3 | 22 | Treaty of Versailles, Primary Chronicle, Candide | Few books but 22 cards; `Vistula–Oder_offensive` exists. |
| Kadesh (city) | 3 | 19 | Breasted, King James Bible, Erman | `Battle_of_Kadesh` exists. The King James Bible's Kadesh ('the wilderness of Zin, which is Kadesh') is another place. |

Second tier, 5 to 14 books each and no key: Tenedos, Cythera, Zacynthus, Achelous, Eryx, Galatia, Mysia, Propontis, Acarnania, Leucas, Leontini, Patrae, Paeonia, Cephallenia, Pelion, Larissa, Phthia, Pherae, Demetrias, Abdera, Teos, Lampsacus, Olynthus, Sestos, Maeander, Halys, Troad, Paphlagonia, Ariminum, Cremona, Placentia, Umbria, Clusium, Tibur, Corsica, Bethlehem, Hebron, Zion, Edom, Sodom, Eden, Joppa, Edessa, Lombardy, Flanders.

### Peoples, states and dynasties

| Entry | Books | Cards | Most in | Note |
|---|---|---|---|---|
| Celts | ≈12 | ≈21 | Polybius, Diodorus, Pausanias | Polybius's word (96 mentions) where Livy's translator says Gauls; `Gaul` and `Cisalpine_Gauls` exist. `Britons_(Celtic_people)` is the only key with the word. |
| Chaldeans | ≈9 | ≈1 | King James Bible, City of God, Diodorus | Two senses to cover: the people and army of Babylon (King James Bible, Strabo) and the priests 'called Chaldaeans by the Babylonians' (Diodorus). `Neo-Babylonian_Empire` exists. |
| Getae | 8 | 3 | Strabo, Cassius Dio, Herodotus |  |
| Saracens | 8 | 2 | Marco Polo, Morte Darthur, Primary Chronicle | Marco Polo's word (70 mentions). |
| Allobroges | 7 | 2 | Gallic War, Cassius Dio, Strabo |  |
| Molossians | 7 | 2 | Plutarch, Diodorus, Pausanias | The people of the kings of Epirus in Plutarch's Pyrrhus. |
| Scots (early medieval) | 6 | 12 | Bede, Anglo-Saxon Chronicle, Morte Darthur | Bede's 'nation of the Scots' is met in Ireland as well as Britain, so an alias to `Scotland` would mislead. |
| Sicels | 6 | 3 | Thucydides, Polybius, Diodorus |  |
| San Miao | ≤5 | ≤7 | Documents, Three Kingdoms, Mozi | The Documents' 'San Miao' and 'people of Miao'. `Miao_people` exists and may or may not be the right home for them. |
| Quadi | 5 | 7 | Cassius Dio, Meditations, Tacitus | Named with the Marcomanni, who have no key either. |
| Franks | 4 | 16 | Song of Roland, Poetic Edda, Primary Chronicle | The Song of Roland's 'Franks' and 'Frankish host'; the Edda's notes use 'Frankish' of the Volsung story. |
| Teng (state) | ≤4 | ≤13 | Three Kingdoms, Mencius, Xunzi | Mencius: 'Teng is a small kingdom', and its duke Wen. Three Kingdoms' 45 are not checked. |
| Rong (people) | ≤3 | ≤33 | Three Kingdoms, Rites, Analects | The Book of Rites: 'the Rong on the west'. Three Kingdoms' 16 are not checked. |

Also without a key: Danes (5 books; the Chronicle's invaders and Beowulf's people are not one thing), Curetes, Dardanians, Dolopians, Magnesians.

### Gods, heroes and myth

| Entry | Books | Cards | Most in | Note |
|---|---|---|---|---|
| Menelaus | 21 | 14 | Iliad, Odyssey, Strabo |  |
| Priam | 21 | 11 | Iliad, Aeneid, Strabo |  |
| Diana | 17 | 9 | Ovid, Livy, Strabo | The Roman goddess has no key, though `Minerva`, `Juno_(mythology)` and `Mars_(mythology)` do. Chaucer writes 'Dian'. |
| Nestor | 16 | 22 | Iliad, Strabo, Odyssey | `Palace_of_Nestor` and `Nestor's_Cup` exist; the hero does not. `Nestor_Makhno` is the only person. |
| Orpheus | 16 | 8 | Diodorus, Pausanias, Ovid |  |
| Thetis | 15 | 8 | Iliad, Apollodorus, Pausanias |  |
| Pelops | 15 | 5 | Pausanias, Apollodorus, Diodorus |  |
| Tantalus | 15 | 1 | Pausanias, Plato, Strabo |  |
| Glaucus | 14 | 4 | Iliad, Pausanias, Apollodorus | Chiefly the Lycian captain of the Iliad; Strabo also cites a historian and a tragedy of the name. |
| Hermione | 13 | 3 | Pausanias, Strabo, Plutarch | Pausanias has both the daughter of Menelaus and 'Hermione, a city'. |
| Satan | 13 | 2 | King James Bible, Jerome's Letters, Summa |  |
| Acheron | 13 | 1 | Lucretius, Aeneid, Pausanias | With Styx (11 books) and Cocytus (8), none of which has a key; `Greek_underworld` exists. |
| Tartarus | 12 | 10 | Plato, Apollodorus, Ovid |  |
| Busiris | 12 | 10 | Diodorus, Erman, Breasted | Diodorus: the king whom Heracles kills, and a governor of the name. Erman's Busiris is the town in the Delta, so the entry has two senses. |
| Memnon | ≤12 | ≤9 | Diodorus, Pausanias, Strabo | 'Memnon the son of Tithonus' (Diodorus 2). `Colossi_of_Memnon` exists; see also Memnon of Rhodes under People. |
| Hecuba | 12 | 4 | Ovid, Apollodorus, Aeneid |  |
| Proteus | 12 | 3 | Herodotus, Ovid, Apollodorus |  |
| Niobe | 12 | 1 | Pausanias, Ovid, Diodorus |  |
| Lucifer | 12 | 0 | Ovid, Jerome's Letters, Plato | In Ovid, Lucifer is the morning star; in Jerome he 'fell from heaven'. The entry must cover both. |
| Neoptolemus | ≤11 | ≤7 | Plutarch, Pausanias, Diodorus | The son of Achilles. Pausanias 1 and Plutarch's Pyrrhus also have kings of the Molossians called Neoptolemus. |
| Laius | 11 | 4 | Oedipus Rex, Pausanias, Apollodorus | 31 of the mentions are Oedipus Rex. |
| Vulcan | 11 | 3 | City of God, Livy, Aeneid | The Roman god; `Hephaestus` exists. |
| Midas | 11 | 2 | Ovid, Herodotus, Strabo |  |
| Castor and Pollux | ≈10 | ≈10 | Pausanias, Apollodorus, Plutarch | `Temple_of_Castor_and_Pollux` exists; the twins do not. Alias Dioscuri. |
| Meleager | 10 | 4 | Diodorus, Ovid, Apollodorus |  |
| Ascanius | ≈10 | ≈3 | Aeneid, Strabo, Livy | Alias Iulus (the Aeneid uses both). |
| Erechtheus | 10 | 3 | Pausanias, Apollodorus, Diodorus |  |
| Cecrops | 10 | 3 | Pausanias, Apollodorus, City of God |  |
| Aegeus | 10 | 1 | Pausanias, Plutarch, Apollodorus |  |
| Hecate | 10 | 1 | Pausanias, City of God, Macbeth |  |
| Diomedes | ≈9 | ≈12 | Iliad, Apollodorus, Pausanias | Alias Diomede (the City of God, Strabo). |
| Leto | ≈9 | ≈10 | Pausanias, Ovid, Iliad | Alias Latona (Ovid, Strabo). |
| Helios | ≈9 | ≈8 | Diodorus, Pausanias, Odyssey | Alias Helius (Diodorus, Pausanias). `Alexander_Helios` is the only key with the name. |
| Baal | 9 | 5 | King James Bible, Breasted, Erman | The King James Bible's god and a simile for the king in Breasted ('mighty-hearted like Baal'). The biblical count includes names such as Baal-hanan. |
| Sisyphus | 9 | 4 | Pausanias, Apollodorus, Ovid |  |
| Semiramis | 9 | 3 | Diodorus, Strabo, City of God | Diodorus 2, with Ninus (9 books), who has no key either. |
| Andromeda | 8 | 6 | Apollodorus, Ovid, Herodotus | Collision: `Andromeda_Galaxy` owns the alias 'Andromeda galaxy' and may be what the six cards mean. |
| Eurystheus | 8 | 5 | Diodorus, Apollodorus, Pausanias |  |
| Cassandra | 8 | 2 | Pausanias, Apollodorus, Aeneid |  |
| Turnus | 8 | 1 | Aeneid, Livy, Ovid | 137 of the mentions are the Aeneid. |
| Rama | 5 | 2 | Ramayana, Shakuntala, Bhagavad Gita | Griffith's Ramayana writes 'Ráma' (1,654 times); `Ramayana` exists, its hero does not. |
| Mount Meru | ≤4 | ≤8 | Ramayana, Erman, Bhagavad Gita | The Ramayana's mountain. Erman's 15 are an Egyptian, 'Rensi, the son of Meru'. |
| King Arthur | ≤2 | ≤71 | Morte Darthur, Divine Comedy | Le Morte Darthur. The 71 cards use the bare word (`Chester_A._Arthur`, `Arthur_Evans`). |

Second tier, 7 to 13 books each, few or no cards: Marsyas, Dardanus, Sarpedon, Pandion, Telephus, Danae, Phaethon, Amphitryon, Amphion, Tydeus, Aeolus, Boreas, Argus, Themis, Priapus, Silenus, Polydorus, Idomeneus, Aeacus, Laomedon, Admetus, Agenor, Iphigenia, Adonis, Adrastus, Neleus, Teucer, Leda, Evander, Atalanta, Calchas, Ixion, Rhadamanthus, Geryon, Lavinia, Danaus, Thyestes, Tyndareus, Pentheus, Icarus, Oceanus, Alcinous, Electra, Semele, Triptolemus, Peirithous, Aegisthus (only `Tomb_of_Aegisthus`), Bellona, Gabriel.

### Works and authors

| Entry | Books | Cards | Most in | Note |
|---|---|---|---|---|
| Pseudo-Dionysius the Areopagite | ≤16 | ≤109 | Summa, Diodorus, Plutarch | The Summa's 'Dionysius says (Div. Nom.)', 579 times. Collision: the alias 'Areopagite' points at `Areopagus`. |
| Gospel of Luke | 9 | 7 | Summa, Jerome's Letters, Leviathan | The Summa cites 'Luke' as the book and as the evangelist. |
| Isaiah | 9 | 5 | Jerome's Letters, King James Bible, City of God | The prophet and the book; Jerome's letters comment on him at length. |
| Pittacus | 8 | 3 | Plato, Strabo, Summa | Plato names him 20 times. The Seven Sages of Greece have no entry: only `Seven_Sages_of_the_Bamboo_Grove`. |
| Pope Gregory I | 7 | 34 | Summa, Bede, Jerome's Letters | The Summa's Gregory (Moralia, Homilies) and Bede's 'blessed Pope Gregory'. |
| Aristobulus (historian of Alexander) | ≤7 | ≤16 | Strabo, Plutarch, Cassius Dio | Strabo's source for India and Hyrcania. Cassius Dio's Aristobulus is one of two ruling brothers in Palestine. |
| Menander (playwright) | ≤7 | ≤12 | Plutarch, Strabo, Jerome's Letters | Jerome and Strabo quote him. `Menander_I`, the Indo-Greek king, is the Menander of Strabo 11; Plutarch's is an Athenian general. |
| Jeremiah | 7 | 7 | King James Bible, Jerome's Letters, City of God | Ezekiel (7 books) is in the same case. |
| Gospel of Matthew | 6 | 16 | Summa, Jerome's Letters, City of God | As Luke. The alias 'Matthew Ricci' on `Matteo_Ricci` is the only use of the name. |
| Theopompus (historian) | ≤6 | ≤11 | Plutarch, Pausanias, Strabo | Strabo's and most of Plutarch's. Pausanias 3 and 4 and Plutarch ('Kings Polydorus and Theopompus') have a Spartan king of the name. |
| Lucilius (Seneca's correspondent) | 6 | 8 | Seneca, Julius Caesar, Plutarch | Collision: `Gaius_Lucilius` is the satirist, and Seneca's 92 'Lucilius' must not link to him. |
| Posidonius | 6 | 6 | Strabo, Seneca, Herodotus | Strabo's constant source (44 mentions) and one of Seneca's Stoics. |
| Bernard of Clairvaux | ≤5 | ≤8 | Summa, Canterbury Tales, Anglo-Saxon Chronicle | The Summa cites his De Consideratione. |
| Jerome | 4 | 35 | Summa, Jerome's Letters, City of God | No key, though the Library holds his letters and `Vulgate` exists. |
| John Chrysostom | 4 | 9 | Summa, Don Quixote, Divine Comedy | The Summa's Chrysostom. Don Quixote's Chrysostom is a student-shepherd, and `Dio_Chrysostom` is another man. |
| Ephorus | 4 | 7 | Strabo, Diodorus, Polybius | Cited by Strabo, Diodorus and Polybius. |
| C. Lloyd Morgan | ≤3 | ≤29 | Thorndike, Morte Darthur, James | Thorndike's 'Lloyd Morgan'. The card count is of the bare word (`J._P._Morgan`). |
| Quintilian | 3 | 16 | Jerome's Letters, Cassius Dio, James | Few book mentions but 16 cards. |
| George Berkeley | ≤3 | ≤12 | James, Kant, Anglo-Saxon Chronicle | James ('the ridiculous theory of Hume and Berkeley') and Kant. The only key with the name is `University_of_California,_Berkeley`. |
| Isidore of Seville | 3 | 8 | Summa, Jerome's Letters, Divine Comedy | The Summa's 'Isidore says (Etym.)'. `Isidore_of_Kiev` is another man. |

Also: Ezekiel, Antisthenes, Musaeus, Euthydemus (Plato's dialogue), Theodorus (58 mentions in Plato).

### Institutions, offices and concepts

| Entry | Books | Cards | Most in | Note |
|---|---|---|---|---|
| Easter | 14 | 41 | Bede, Anglo-Saxon Chronicle, Summa | Bede's Easter controversy is 100 of the mentions; `Pentecost` has a key, Easter has none. |
| Nemean Games | ≈10 | ≈6 | Pausanias, Plutarch, Thucydides | `Nemean_lion` and `Battle_of_Nemea` exist; the sanctuary and its games do not. |
| Olympiad | 9 | 27 | Polybius, Pausanias, Diodorus | The dating unit ('the 140th Olympiad' in Polybius). `Olympic_Games` exists but is not the same thing. |
| Pleiades | 9 | 9 | Diodorus, Ovid, Strabo | The star cluster as a season mark (Strabo 15: 'the setting of the Pleiades'). |
| Arcturus | 9 | 2 | Strabo, Aeneid, King James Bible | As the Pleiades: 'the rising of Arcturus'. `Sirius` has a key. |
| Christendom | 8 | 6 | Morte Darthur, Anglo-Saxon Chronicle, Marco Polo | Malory's and Marco Polo's word. |
| Panathenaea | ≈7 | ≈12 | Plato, Thucydides, Plutarch | Thucydides: 'the great feast of the Panathenaea'. |
| Etesian winds | 7 | 2 | Strabo, Herodotus, Polybius |  |
| Antichrist | 6 | 5 | City of God, Summa, Leviathan |  |

## Aliases, not entries

The glossary already answers these under another key; the books would link if the form were added to `GLOSSARY_ALIASES`. Every target was checked to exist. An alias applies to every book and card at once, so the verdict is one of three: **Add**, **With care** (right in the books named, wrong somewhere else), or **No bare alias**.

### Translators' and older spellings

| In the books | Existing key | Books | Verdict and caution |
|---|---|---|---|
| Hercules | `Heracles` | 27 | Add. `Pillars_of_Hercules` and `Farnese_Hercules` keep their own keys. |
| Bacchus, Bacchic | `Dionysus` | ≈18 | Add. |
| Phoebus | `Apollo` | 18 | Add. |
| Ulysses | `Odysseus` | 18 | With care. `Ulysses_S._Grant` is a full key and may be what the 20 cards mean; add the alias only if the full name wins. |
| Jove | `Jupiter_(god)` | 14 | Add. Ovid, the Aeneid and the City of God. |
| Athene | `Athena` | 8 | Add. 'Pallas Athene' is already an alias; the bare form (130 in this Iliad) is not. |
| Cronos | `Cronus` | 5 | Add. 'Kronos' is already an alias. |
| Pluto | `Hades` | 13 | With care. The Astronomy cards use the word for the dwarf planet, which has no entry: write that first, or the alias will send astronomy readers to the underworld. |
| Cæsar | `Julius_Caesar` | 18 | With care. The ligature form. In the King James Bible ('tribute unto Cæsar') and Tacitus it is the reigning emperor, so `Caesar_(title)` is the safer target; the existing alias 'Caesar' has the same fault. |
| Tully | `Cicero` | 6 | Add. The Summa's name for him (159 times). |
| Mahomet | `Muhammad` | 8 | Add. |
| Peiraeus | `Piraeus` | 9 | Add. |
| Aetna | `Etna` | 12 | Add. |
| Ister | `Danube` | 9 | Add. |
| Marseilles | `Massalia` | 9 | Add. Strabo's translator writes the modern name 61 times. |
| Agrigentum | `Acragas` | 7 | Add. `Siege_of_Agrigentum` already uses the Latin form. |
| Kiev | `Kyiv` | 2 | Add. Thirteen keys spell it Kiev (`Olga_of_Kiev`) but the bare word is not an alias. |
| Syene | `Aswan` | 8 | Add. |
| Panormus | `Palermo` | 8 | With care. Polybius 1: 'the strongest town of all the Carthaginian province'. Other harbours share the name. |
| Argolis | `Argolid` | 8 | Add. |
| Hellas, Hellenes, Hellenic, Grecian | `Greece` | ≈14 | Add. 'Greek' and 'Greeks' already point there; `Ancient_Greece` may be the better home for all of them. |
| Neapolis | `Naples` | 11 | With care. Strabo 7 and Cassius Dio 47 have the Neapolis near Philippi. |
| Achaia | `Achaea_(Roman_province)` | 17 | With care. Right for Suetonius; in Polybius and Pausanias it is the region of the `Achaean_League`. |
| Judea | `Judaea_(Roman_province)` | 7 | With care. The King James Bible's Judea is not always the Roman province. |
| Pylus | `Palace_of_Nestor` | 7 | With care. The existing alias 'Pylos' points there, but Strabo 8 argues over three places of the name. |
| Bráhman, Bráhmans | `Brahmin` | ≈5 | Add. Griffith's accented spelling in the Ramayana and Rigveda. |
| Shou | `Di_Xin` | 3 | With care. The Documents: 'Shou, the king of Shang'. Three Kingdoms' 13 are not checked. |
| Chou | `Zhou_dynasty` | 7 | **No bare alias.** In this translation of Xunzi 'Chou' is the tyrant (`Di_Xin`) as often as the house of Zhou, and in Mozi 'Duke Chou' is `Duke_of_Zhou`. |
| Octavius | `Augustus` | 10 | With care. Right in Julius Caesar and for Plutarch's 'Octavius Caesar'; Plutarch also has a Gnaeus and a Marcus Octavius. |
| Charybdis | `Scylla` | 15 | Add. 'Scylla and Charybdis' is already an alias. |
| Eumenides | `Erinyes` | 6 | Add. |
| Pytho, Delphic, Delphian | `Delphi` | ≈12 | Add. `Delphic_oracle` and `Delphic_maxims` keep their own keys. |
| Olympian Zeus | `Zeus` | 9 | Add. |
| Pythian Apollo | `Apollo` | 8 | Add. |
| Dionysia | `City_Dionysia` | 6 | Add. |
| Asiatics, Asiatic | `Aamu` | ≈17 | With care. Right only in Breasted and Erman; elsewhere 'Asiatic' is the plain adjective. |

### Short forms of places and peoples

| In the books | Existing key | Books | Verdict and caution |
|---|---|---|---|
| Taurus | `Taurus_Mountains` | 15 | With care. Cassius Dio's Statilius Taurus is a man. |
| Alba, Alban | `Alba_Longa` | ≈13 | With care. `Alban_Hills` exists, and Bede's Alban is the martyr. |
| Capitoline | `Capitoline_Hill` | 8 | Add. 35 cards use the bare word. |
| Parthians, Parthian, Parthia | `Parthian_Empire` | ≈16 | Add. |
| Dacia | `Roman_Dacia` | 3 | With care. Not checked whether all of Cassius Dio's 17 are the province. |
| Chernigov | `Principality_of_Chernigov` | 2 | Add. |
| Baltic | `Baltic_Sea` | 3 | With care. 166 cards use the word; `Baltic_languages` and the Baltic states have keys of their own. |
| Aetolia | `Aetolian_League` | 11 | Add. |
| Liguria | `Ligurians` | 9 | Add. |
| Numantia | `Numantine_War` | 9 | Add. |
| Volscians | `Volsci` | 6 | Add. Livy's translator mostly writes 'Volscians' (180 mentions). |
| Cimbri | `Cimbri_and_the_Teutones` | 8 | Add. |
| Amphictyons | `Delphic_amphictyony` | 5 | Add. |
| Arians | `Arianism` | 7 | With care. Herodotus's three are a people ('the Medes were formerly called by everyone Arians'). |
| Genoese | `Genoa` | 6 | Add. |
| Thebans, Theban | `Thebes,_Greece` | ≈22 | With care. In Breasted 'Theban' is `Thebes,_Egypt`. |
| Syracusans, Syracusan | `Syracuse` | ≈12 | Add. |
| Phocians, Phocian | `Phocis` | ≈10 | Add. |
| Chians, Aeginetans, Corcyraeans, Delians, Thasians, Sidonians | `Chios`, `Aegina`, `Corcyra`, `Delos`, `Thasos`, `Sidon` | 6–8 | Add. |
| Tyrians, Tyrian | `Tyre` | ≈12 | Add. |
| Ephesians | `Ephesus` | 14 | With care. In the King James Bible it is also the epistle. |
| Chalcidians, Chalcidian | `Chalcis` | ≈7 | **No bare alias.** Thucydides's are 'the Chalcidians in the direction of Thrace', not the city in Euboea. |
| Turks, Turk | `Ottoman_Empire` | ≈9 | With care. The Turk of Don Quixote and The Prince is the Ottoman; `Turkic_peoples` is the wider entry. |
| Pydna, Mylae, Chaeronea, Coronea, Tanagra, Lilybaeum, Beneventum, Carchemish, Munychia, Mutina, Ambracia | (one each, see the caution) | 4–9 | With care. Each is a place the glossary has only as its battle or siege (`Battle_of_Mylae`, `Battle_of_Chaeronea`, `Battle_of_Coronea`, `Battle_of_Tanagra`, `Siege_of_Lilybaeum`, `Battle_of_Beneventum_(275_BC)`, `Battle_of_Carchemish`, `Battle_of_Munychia`, `War_of_Mutina`, `Siege_of_Ambracia`). An alias is honest only where the books mean the event. |
| Doric | `Doric_order` | 8 | With care. Also the dialect and the `Dorians`. |
| Ptolemaic | `Ptolemaic_Egypt` | 3 | Add. 92 cards use the adjective. |
| Punic | `Punic_Wars` | 10 | Add. |
| Gallic | `Gaul` | 16 | Add. `Gallic_Wars` keeps its own key. |

### A bare name the glossary has under a fuller key

| In the books | Existing key | Books | Verdict and caution |
|---|---|---|---|
| Seneca | `Seneca_the_Younger` | 13 | Add. |
| Gellius | `Aulus_Gellius` | 5 | Add. 51 cards say only 'Gellius'. |
| Flamininus | `Titus_Quinctius_Flamininus` | 5 | Add. |
| Marius | `Gaius_Marius` | 12 | Add. The alias 'Gaius Marius' also sits on `Marius_and_Sulla`. |
| Nebuchadnezzar | `Nebuchadnezzar_II` | 4 | Add. |
| Seti | `Seti_I` | 2 | Add. 68 cards use the bare name. |
| Alexander of Macedon | `Alexander_the_Great` | 6 | Add. |
| Philip of Macedon | `Philip_II_of_Macedon` | 6 | Add. |
| Africanus | `Scipio_Africanus` | 11 | With care. `Sextus_Julius_Africanus` and `Australopithecus_africanus` also carry the word. |
| Amasis | `Amasis_II` | 5 | With care. `Amasis_Painter` exists. |
| Necho | `Necho_II` | 3 | With care. `Necho_I` exists. |
| Psammetichus | `Psamtik_I` | 3 | With care. 'Psammetichus I', 'II' and 'III' are already aliases of the three kings; the bare name is Herodotus's. |
| Darius, King Darius | `Darius_I` | ≈22 | With care. Right for Herodotus. Diodorus 17 and Plutarch's Alexander mean `Darius_III`, and the Darius of the Book of Daniel is not safely either. |
| Mithridates | `Mithridates_VI_Eupator` | 15 | With care. Right for Plutarch and Cassius Dio; most of Tacitus's are later kings of the name. |
| Seleucus | `Seleucus_I_Nicator` | 10 | With care. The Seleucus of 2 Maccabees ('after the death of Seleucus, when Antiochus, called Epiphanes, took the kingdom') is a later king. |
| Hiero | `Hiero_II_of_Syracuse` | 12 | With care. Right for Livy and Polybius; `Hiero_I_of_Syracuse` exists. |
| Agrippa | `Marcus_Agrippa` | 10 | With care. Livy and Cassius Dio 4 have Menenius Agrippa, and Acts has 'king Agrippa'. |
| Marcellus | `Marcus_Claudius_Marcellus` | 15 | With care. Right for Livy and Plutarch; other Marcelli are not checked. |
| Severus | `Septimius_Severus` | 10 | With care. `Severus_Alexander` exists. |
| Constantine | `Constantine_the_Great` | 10 | With care. The Primary Chronicle also has later emperors of the name. |
| Augustine | `Augustine_of_Hippo` | 7 | With care. Bede's and the Chronicle's is Augustine of Canterbury. Worse: the existing aliases 'St. Augustine' and 'Saint Augustine' point at the city in Florida. |
| Pliny | `Pliny_the_Elder` | 4 | With care. Pliny the Younger has no entry. |
| Diogenes | `Diogenes_of_Sinope` | 12 | With care. Not checked book by book; other men bear the name. |
| Brutus | `Marcus_Junius_Brutus` | 18 | With care. Livy 1 and 2 mean `Lucius_Junius_Brutus`; Julius Caesar has a Decius Brutus too. |
| Cassius | `Gaius_Cassius_Longinus` | 11 | With care. Cassius Dio also has Spurius Cassius and `Avidius_Cassius`. |
| Fabius, Quintus Fabius | `Quintus_Fabius_Maximus` | ≈9 | With care. Livy's 'Quintus Fabius' is at least three men across books 2 to 30. |
| Paulus, Paullus, Lucius Aemilius | `Lucius_Aemilius_Paullus_Macedonicus` | ≈10 | With care. Not checked which Aemilius Paullus each book means. |
| Tarquin, Tarquinius, Tarquins | `Tarquinius_Superbus` | ≈14 | With care. `Tarquinius_Priscus` exists, with 'Tarquin the Elder' and 'Tarquin the Proud' already aliases. |
| Herod | `Herod_the_Great` | 14 | With care. The Herod who hears of John, and to whom Pilate sends Jesus, is not the Herod of the birth story; that later Herod has no entry. |
| Aurelius | `Marcus_Aurelius` | 9 | With care. The Canterbury Tales' Aurelius (13 mentions) is a squire. |
| Sextus | `Sextus_Pompey` | 9 | With care. Right for Cassius Dio 48 and 49 only; book 2 has another Sextus. |

### Bare names to leave unlinked

| In the books | Existing key | Books | Verdict and caution |
|---|---|---|---|
| Alexander | `Alexander_the_Great` | 36 | **No bare alias.** In 36 books, more than any other name here, but several ancient kings and commanders bear it and about thirty keys already contain it (`Alexander_Nevsky`, `Severus_Alexander`, `Alexander_Hamilton`); the machine cannot say which a sentence means. |
| Philip | `Philip_II_of_Macedon` | 22 | **No bare alias.** Most of Polybius's 471 and Livy's 454 are `Philip_V_of_Macedon` ('Philip, son of Demetrius and father of Perseus'). |
| Cato, Marcus Cato | `Cato_the_Elder`, `Cato_the_Younger` | ≈21 | **No bare alias.** Livy's Marcus Cato is the Elder, Seneca's is `Cato_the_Younger`, and Seneca names both in one sentence. |
| Scipio, Publius Scipio, Publius Cornelius, Scipios | `Scipio_Africanus` and others | ≈19 | **No bare alias.** `Scipio_Aemilianus`, the father and uncle of `Spanish_campaigns_of_the_Scipios`, Nasica and Metellus Scipio share it. |
| Ptolemy | `Ptolemy_I_Soter` | 16 | **No bare alias.** Nine Ptolemies have keys. The astronomer has none, though the Astronomy cards name him and his Almagest. |
| Antiochus, King Antiochus | `Antiochus_III_the_Great` | ≈16 | **No bare alias.** Until Antiochus IV has an entry. |
| Demetrius | `Demetrius_I_Poliorcetes` | 14 | **No bare alias.** `Demetrius_of_Phalerum` shares it, and Polybius's Demetrius is not checked. |
| Antigonus, Eumenes, Cleomenes, Agis, Attalus | (several each) | 7–9 | **No bare alias.** For all five: each is two or three kings split by book (`Eumenes_of_Cardia` and `Eumenes_II`; `Cleomenes_I` and `Cleomenes_III`; Thucydides's Agis, son of Archidamus, is not `Agis_IV`). |
| Gracchus, Drusus, Lepidus, Appius Claudius | (several each) | 5–9 | **No bare alias.** Each has two or more keys already. |
| Antoninus | `Antoninus_Pius` | 7 | **No bare alias.** Cassius Dio's 'Severus' son Antoninus' is `Caracalla`. |
| Theodosius | `Theodosius_I` | 7 | **No bare alias.** 51 of the mentions are the abbot of the Primary Chronicle. |
| Apollodorus, Aristarchus, Philo | (several each) | 7–10 | **No bare alias.** Each has two or three keys. |

## Not worth an entry

A large part of the raw list is not a term at all, and the next reader need not decide these again.
**Bare Roman first names and family names** (Lucius, Gaius, Caius, Marcus, Publius, Quintus, Gnaeus, Aulus, Manius, Julius, Cornelius, Valerius, Servilius, Junius, Postumius, Caecilius, Pomponius) and **surnames dozens of men share** (Maximus, Rufus, Gallus, Flaccus, Sabinus, Felix, Magnus, Pius, Silanus, Balbus): the entry belongs to the full name, which the glossary usually has.
**Modern first names** that rank only because the cards are full of presidents and tsars (James, Henry, Charles, George, Thomas, Richard, Robert, Edward, Louis, Nicholas, Ivan, Anna, Stephen).
**Adjectives and words of nationality** (English, Jewish, Chinese, American, Germanic, Gothic, Tuscan, Spaniards, Frenchmen, Englishmen, Saxon), except the few above that have one obvious home.
**Calendar and feast words used as dates** (Christmas, Sundays; `Christmas_Eve` already exists), and **Roman numerals** cut from a king's name (VIII, XIII).
**A translator's capitals and contractions** (Blest, Ne'er, Whate'er), though Plato's "Isles of the Blest" would be a fair entry on its own.
**Halves of longer names** (Zealand, Hampshire, Marco, Kong, Leon, Kara, Luna).
**Bare Chinese syllables** (Wang, Zhang, Chen, Huang, Liang, Jing, Shan, Shen, Huai, Ying, Yong, Zhen, Sheng, Xiao, Ling, Peng, Xing, Heng, Chang, Ming, Qian): each is a family name or part of several names, and the people behind them (`Sima_Yi`, `Guan_Yu`, `Zhuge_Liang`) mostly have entries under the full name.
**Third-tier place names** from Pausanias and Strabo with seven to nine books and no card (Pheneus, Helice, Asine, Oenoe, Olenus, Onchestus, Panopeus, Myus, Myndus), and **shared surnames of modern scholars** (Müller, Herbert).

## By collection

- **Ancient Greece:** the Hellenistic kings (Antigonus Gonatas and Doson, Attalus I, Antiochus IV), the Sicilians (Dionysius I, Dion, Agathocles), Philopoemen; the regions and cities of Asia Minor and the Peloponnese (Lycia, Caria, Phrygia, Cappadocia, Halicarnassus with 43 cards, Sicyon, Tegea, Pergamon, Cnidus); the epic cast (Menelaus, Priam, Nestor, Thetis, Diomedes); Olympiad, Nemean Games, Panathenaea.
- **Ancient Rome:** the Punic Wars (Hasdrubal Barca, Mago, Flaminius, Laelius, Livius Salinator, Numidia, Sardinia with 45 cards); the Republic (Metellus, Torquatus, Decius Mus, Publicola, Sulpicius Rufus, Nasica); the age of Caesar and Augustus (Labienus, Maecenas, Octavia, Varus, Drusus the Younger); the late emperors (Clodius Albinus, Valens, Honorius); Ravenna, Misenum, Brundisium, Illyria, Epirus; Diana, Vulcan, Turnus, Ascanius.
- **World History:** the figures of the Hebrew Bible and the New Testament (Jesus, Moses, David, Solomon, Paul, Mary), the largest single hole in the glossary; the Church writers (Jerome, Gregory I, John Chrysostom, Isidore); Easter and Christendom; Celts, Franks, Saracens, Chaldeans; the Persians (Astyages, Artaxerxes II, Ecbatana, Ctesiphon); Normandy, Kent, Canterbury.
- **Ancient Egypt:** Kadesh the city (19 cards), Hermopolis (15), Busiris, Gaza, and the aliases Psammetichus, Necho, Amasis, Seti, Syene and Asiatics.
- **China:** Zengzi, King Cheng of Zhou, the Duke of Shao, Kang Shu, Teng, the Rong and San Miao, with the alias Shou. The Three Kingdoms cast is outside this list: Jiang Wei alone is named 235 times in the novel and has no key.
- **Russia and India:** Theodosius of the Caves and Vsevolod I, with the aliases Kiev and Chernigov; Rama and Mount Meru, with the alias for Griffith's "Bráhman". Sita, Ravana and Ayodhya have no key either, but live in one book.
- **The Second World War:** only place names help (Normandy with 42 cards, Vistula 22, Elbe 18, and the alias Baltic).
- **Philosophy and Psychology:** George Berkeley, C. Lloyd Morgan, Posidonius, Pittacus, Pseudo-Dionysius, and Seneca's Lucilius.
- **Astronomy:** Pleiades and Arcturus from the books. Found in passing and not from the books: the dwarf planet Pluto and the astronomer Ptolemy have no entries, though the cards name both.
- **United States, Japan, Korea, Biology, Economics:** the Library's books add nothing of weight; their rows in the raw list are bare first names.
