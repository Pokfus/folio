# Answer-steer audit — cards that avoided their famous term because another collection had it

Not part of the site. Written 2026-11-26, when the owner ruled that **an answer is unique within its collection,
never across the site** (`CLAUDE.md`, "Generating cards"; `add-card.js` refuses only a same-collection twin). Before
that, writers followed "`ww2-133`'s rule" ("the line has no term of its own left to teach") and steered away from a
famous term whenever ANOTHER collection's card, an unwritten plan line elsewhere, or merely a glossary key held it.
This file lists the cards steered that way, so the owner can choose which to rewrite to the plain term.

**Method.** Every plan, ledger, refinement audit and `china-card-findings.md` was searched for the steer phrases, and
every card's plan line was compared with its answer by script; each row was checked against the current data. Russia
`ru-701`–`ru-800` are not listed: their thirteen steers were rewritten the day the rule changed. **⚠ marks a rewrite
that would make a twin inside the same collection**; "one of" marks a group steered off the same term, of which only
one card can take it back (or the second needs `--allow-twin` with a qualified answer). Rewriting a card is a real
rewrite — new questions and background on the new term, `add-card.js --replace` — not a rename.

## A — needless (the famous term was avoided only because another collection or the glossary had it)

### Russia

| id | plan line | current answer | famous term | caused by |
|---|---|---|---|---|
| ru-119 | What the Mongol conquest did to Rus' | tamga | yam | eg-133 (Egypt's Nubian Yam) — **rewritten 2026-11-26** |
| ru-289 | The founding of Saint Petersburg | Peter and Paul Fortress | Saint Petersburg | gru-004 — ⚠ ru-782 now answers it — **skipped 2026-11-26** (twin) |
| ru-345 | Enlightened absolutism in Russia | Free Economic Society | enlightened absolutism | wh-752 — **rewritten 2026-11-26** |
| ru-409 | Russia at the Congress of Vienna | Polish–Saxon crisis | Congress of Vienna | wh-766 — **rewritten 2026-11-26** |
| ru-433 | Russia and the revolutions of 1848 | Convention of Balta Liman | Revolutions of 1848 | wh-773 — **rewritten 2026-11-26** |
| ru-443 | Emancipation reform of 1861 | Editing Commissions | Emancipation reform of 1861 | wh-811 — **rewritten 2026-11-26** |
| ru-462 | The founding of Vladivostok | Convention of Peking | Vladivostok | gru-527 — **rewritten 2026-11-26** |
| ru-504 | Bolsheviks and Mensheviks | Mensheviks | Bolsheviks | wh-898 — **rewritten 2026-11-26** |
| ru-531 | Russia and the July Crisis | Period Preparatory to War | July Crisis | wh-874 — **rewritten 2026-11-26** |
| ru-537 | Nicholas II takes command | Mogilev | Stavka | ww2-285 — **rewritten 2026-11-26** |
| ru-565 | Red Guards | Petrograd Red Guard | Red Guards | cnh-671 (China's, a different thing) — **rewritten 2026-11-26** |
| ru-600 | White Terror | Atamanshchina | White Terror | cnh-694, pea-137 (different White Terrors) — **rewritten 2026-11-26** |
| ru-628 | First five-year plan | Great Break | First five-year plan | cnh-660 (China's plan), wh-902 — **rewritten 2026-11-26** |
| ru-663 | Battle of Smolensk, 1941 | Yelnya offensive | Battle of Smolensk | ww2-272 — **rewritten 2026-11-26** |
| ru-669 | Soviet partisans | Central Headquarters of the Partisan Movement | Soviet partisans | ww2-292 — **rewritten 2026-11-26** |
| ru-671 | The Holocaust in the Soviet Union | Black Book of Soviet Jewry | Holocaust in the Soviet Union | ww2-731, ww2-771, wh-934 — **rewritten 2026-11-26** |

**Done 2026-11-26**: fifteen of the sixteen rows were rewritten to the famous term, written from the Russian or Soviet
side (`add-card.js --replace`; the old answer stays a sentence of twelve of the backgrounds). **`ru-289` was skipped**: its
famous term, *Saint Petersburg*, is already `ru-782`'s answer, and the founding is not a different thing that shares
the name, so it keeps the Peter and Paul Fortress. `ru-663` answers *Battle of Smolensk* beside `ru-399`'s *1812 Battle
of Smolensk* (different battles, different answers). Four glossary terms were new: `Yam_(route)`, `Red_Guards_(Russia)`
and `White_Terror_(Russia)` (the bare names belong to Egypt's Yam, China's Red Guards and Taiwan's White Terror, so
none takes the bare alias), and `First_five-year_plan_(Soviet_Union)` (`First_five-year_plan` is a disambiguation
page). `ru-119`'s Wikipedia link was set by hand to *Yam (route)*; the resolver had picked *Yam (Nubia)*.

### Ancient Greece (the Rome-and-the-East deck, steered off Ancient Rome's cards)

| id | plan line | current answer | famous term | caused by |
|---|---|---|---|---|
| gr-821 | Archimedes at the siege of Syracuse | claw of Archimedes | siege of Syracuse | rm-222 — ⚠ gr-556 answers the siege of 415 BCE |
| gr-849 | The Illyrian Wars | Teuta | Illyrian Wars | rm-237 |
| gr-850 | The First Macedonian War | Peace of Phoenice | First Macedonian War | rm-238 |
| gr-852 | The Second Macedonian War | siege of Abydos | Second Macedonian War | rm-240 |
| gr-854 | Flamininus | Nabis | Titus Quinctius Flamininus | rm-242 |
| gr-855 | The declaration at the Isthmus | eleutheria | freedom of the Greeks | rm-243 |
| gr-856 | The Roman–Seleucid War | siege of Ambracia | Roman–Seleucid War | rm-245 |
| gr-857 | Battle of Magnesia | Eumenes II | Battle of Magnesia | rm-247 |
| gr-859 | The Third Macedonian War | Callicrates of Leontium | Third Macedonian War | rm-249 |
| gr-861 | Battle of Pydna | monument of Aemilius Paullus | Battle of Pydna | rm-251 |
| gr-862 | The province of Macedonia | Via Egnatia | province of Macedonia | rm-257 |
| gr-863 | The Achaean War | Diaeus | Achaean War | rm-255 |
| gr-868 | The bequest of Attalus III | Attalus III | bequest of Attalus III | rm-259 |
| gr-869 | The Mithridatic Wars | Archelaus | Mithridatic Wars | rm-310, rm-333 |
| gr-872 | Battle of Pharsalus | Thessaly | Battle of Pharsalus | rm-362 |
| gr-873 | Battle of Philippi | Philippi | Battle of Philippi | rm-377 |

### Ancient Rome

| id | plan line | current answer | famous term | caused by |
|---|---|---|---|---|
| rm-439 | Nero | Britannicus | Nero | wh-366 and the glossary |
| rm-494 | Trajan | optimus princeps | Trajan | wh-367 and the glossary |
| rm-515 | Marcus Aurelius | Avidius Cassius | Marcus Aurelius | wh-369 |
| rm-619 | The papacy in late antiquity | Damasus I | Papacy | wh-494 |
| rm-912 | Saturn | Temple of Saturn | Saturn | astro-148 (the planet) |
| rm-988 | Roman aqueduct | Aqua Marcia | Roman aqueduct | wh-361 |

### World History

| id | plan line | current answer | famous term | caused by |
|---|---|---|---|---|
| wh-543 | The Tale of Genji | Genji Monogatari | Tale of Genji | jp-146 |
| wh-586 | Eurasian steppe | composite bow | Eurasian Steppe | ru-001 |
| wh-587 | Nomadic pastoralism | yurt | pastoral nomadism | ru-003 |
| wh-588 | Xiongnu | Yuezhi | Xiongnu | cnh-225 (also hs-102) |

### Korea

| id | plan line | current answer | famous term | caused by |
|---|---|---|---|---|
| ko-124 | King Yeongyang and the Sui invasions | Yeongyang | Goguryeo–Sui War | cnh-351 |

### China

The China batches checked a suggested answer "against every card answer, glossary key and alias, and plan line of
every plan", so they steered even away from **unwritten** plan lines of Philosophy, Architecture and Astronomy. The
plan line now reads the new answer; the original subject is the findings file's (`docs/china-card-findings.md`).

| id | original subject | current answer | caused by |
|---|---|---|---|
| cnh-722 | Great Wall | Shanhai Pass | wh-407 |
| cnh-704 | imperial examination | Jiangnan Examination Hall | wh-525 |
| cnh-783 | Tibet | Golden Urn | gc-031 |
| cnh-785 | Xinjiang | Xinjiang Production and Construction Corps | gc-021 |
| cnh-728 | Hall of Supreme Harmony | Hall of Mental Cultivation | arch-355 (unwritten) |
| cnh-875 | Temple of Heaven | Mingtang | arch-356 (unwritten) |
| cnh-963 | Dougong | Nanchan Temple | arch-346 (unwritten) |
| cnh-826 | Chinese philosophy | Huang–Lao | phi-286 (unwritten) |
| cnh-827 | Hundred Schools of Thought | Lüshi Chunqiu | phi-287 (unwritten) |
| cnh-828 | Confucius | Yan Hui | wh-399, phi-288 |
| cnh-829 | Analects | Zilu | phi-289 (unwritten) |
| cnh-830 | Ren | Shu | phi-290 (unwritten) |
| cnh-831 | Li | Liji | phi-291 (unwritten) |
| cnh-832 | Junzi | Zhongyong | phi-292 (unwritten) |
| cnh-833 | Confucianism | Wenmiao | wh-400 |
| cnh-834 | Mencius | Four Beginnings | phi-295 (unwritten) |
| cnh-835 | Xunzi | Discourse on Heaven | phi-297 (unwritten) |
| cnh-837 | Laozi | Hangu Pass | phi-300 (unwritten) |
| cnh-839 | Dao | Heshang Gong | phi plan line (unwritten) |
| cnh-840 | Wu wei | Cook Ding | phi plan line (unwritten) |
| cnh-842 | Zhuangzi | Qiwulun | phi-304 (unwritten) |
| cnh-841 | Taoism | Liezi | wh-401 |
| cnh-844 | Mohism | Gongshu Ban | phi plan line (unwritten) |
| cnh-845 | Legalism | Shen Buhai | wh-402 |
| cnh-846 | Han Feizi | Two Handles | phi plan line (unwritten) |
| cnh-847 | School of Names | Hui Shi | phi plan line (unwritten) |
| cnh-848 | Yin and yang | He Tu and Luo Shu | phi plan line (unwritten) |
| cnh-867 | New Confucianism | Science and Metaphysics debate | phi-336 (unwritten) |
| cnh-882 | Chinese Buddhism | Liu Ying | wh-415 |
| cnh-890 | Chan | Platform Sutra | wh-539 Zen |
| cnh-976 | Woodblock printing | Diamond Sutra | wh-526 |
| cnh-978 | Gunpowder | Wujing Zongyao | wh-530 |
| cnh-980 | Compass | Dream Pool Essays | wh-531 |

### Ancient Egypt

Steered off World History, Greece, Rome and Visual Art cards, from the "already taken" lists in
`docs/egypt-card-plan.md`. Format: id, plan subject → current answer (the card that caused it).

- eg-001 Ancient Egypt → Kemet (wh-201)
- eg-012 Palaeolithic → Wadi Kubbaniya (wh-046)
- eg-014 Saharan rock art → Gilf Kebir (wh-152)
- eg-015 Nabta Playa → Gebel Ramlah (wh-154)
- eg-016 African cattle pastoralism → Bir Kiseiba (wh-153)
- eg-017 Neolithic → El Omari (wh-111)
- eg-021 emmer → barley (wh-202)
- eg-028 Naqada culture → Naqada expansion (wh-203)
- eg-046 Egyptian hieroglyphs → Tomb U-j (wh-206) — one of, with eg-892 Ptolemaic hieroglyphs
- eg-052 unification → Menes (wh-205)
- eg-070 Memphis → Inebu-hedj (gr-719)
- eg-078 cylinder seal → jar sealing (wh-176)
- eg-091 Old Kingdom → Egyptian pyramids (wh-210)
- eg-094 Step Pyramid → serdab (wh-211)
- eg-104 Great Pyramid → Hemiunu (wh-212)
- eg-110 Great Sphinx → Khafre Enthroned (wh-213)
- eg-141 First Intermediate Period → Heracleopolis Magna (wh-217)
- eg-171 Middle Kingdom → Prophecy of Neferti (wh-218)
- eg-211 Punt → Henenu (wh-422) — one of, with eg-888 Mersa Gawasis
- eg-226 Hyksos → Khyan (wh-219)
- eg-232 chariot → Egyptian chariot (wh-261)
- eg-233 composite bow → recurve bow (wh-586)
- eg-251 New Kingdom → Ahhotep I (wh-220)
- eg-258 Hatshepsut → Speos Artemidos (wh-221)
- eg-265 Thutmose III → Festival Hall of Thutmose III (wh-222)
- eg-281 Amarna letters → Rib-Hadda (wh-270) — one of, with eg-821 Gilukhipa
- eg-282 Mitanni → Tushratta (wh-200)
- eg-283 Hittites → Suppiluliuma I (wh-266)
- eg-296 Akhenaten → KV55 (wh-223)
- eg-307 Nefertiti Bust → Thutmose (art-065)
- eg-321 Tutankhamun → Ankhesenamun (wh-224)
- eg-327 the mask of Tutankhamun → Tutankhamun's meteoric iron dagger (art-066)
- eg-343 Ramesses II → Ozymandias (wh-225)
- eg-344 Battle of Kadesh → Muwatalli II (wh-226)
- eg-366 Sea Peoples → Peleset (wh-278, gr-108)
- eg-371 Late Bronze Age collapse → Alashiya (wh-279)
- eg-392 Karnak → Temple of Khonsu (wh-228)
- eg-404 Valley of the Kings → Meretseger (wh-227)
- eg-441 Third Intermediate Period → Ramesses XI (wh-230)
- eg-476 Nubia → Nubians (wh-229)
- eg-483 Kingdom of Kush → El-Kurru (wh-416)
- eg-503 Meroë → Arakamani (wh-417)
- eg-512 Naucratis → Hellenion (gr-221)
- eg-532 Cambyses II → Psamtik III (gr-385)
- eg-535 Darius I → Statue of Darius (gr-386)
- eg-540, eg-541, eg-738 Herodotus → Sesostris, Rhampsinit, Diodorus Siculus (gr-440, wh-331) — one of
- eg-561 Ptolemaic Egypt → Ptolemais Hermiou (gr-767)
- eg-562 Alexander the Great → Cleomenes of Naucratis (gr-701)
- eg-563 the oracle of Ammon → Siwa Oasis (gr-721)
- eg-564 the founding of Alexandria → Rhakotis (gr-720)
- eg-565 Ptolemy I Soter → Alexander IV (gr-766)
- eg-567 Hellenistic kingship → Ptolemaic cult of Alexander the Great (gr-773)
- eg-571 Alexandria → Lake Mareotis (rm-766) — one of, with eg-615 Letter of Claudius
- eg-572 Library of Alexandria → Aristophanes of Byzantium (gr-802)
- eg-573 Lighthouse of Alexandria → Sostratus of Cnidus (gr-804)
- eg-581 cleruchy → Kerkeosiris (gr-482)
- eg-583 Arsinoe II → Great Mendes Stela (gr-776)
- eg-584 Syrian Wars → Battle of Panium (gr-793)
- eg-587 Battle of Raphia → Ptolemy IV Philopator (gr-794)
- eg-590, eg-591 Rosetta Stone → Ptolemy V Epiphanes, Raphia Decree (wh-207) — one of
- eg-603, eg-604 Cleopatra VII → Ptolemy XIII, Papyrus Bingen 45 (gr-876, rm-384) — one of
- eg-605 Actium and Caesarion → death of Cleopatra (rm-387, gr-874, gr-875)
- eg-606 Roman Egypt → epistrategos (rm-765)
- eg-607 annexation → Battle of Alexandria (rm-388)
- eg-609 prefect of Egypt → Aelius Gallus (rm-811)
- eg-610 the grain supply → embole (rm-767)
- eg-612 Roman census → house-by-house census (rm-073)
- eg-637 Antonine Plague → Plague of Cyprian (rm-518)
- eg-639 Zenobia → Palmyrene invasion of Egypt (rm-562)
- eg-640 Diocletian → Pompey's Pillar (rm-566)
- eg-643 Diocletianic Persecution → Era of the Martyrs (rm-573)
- eg-648, eg-651 Christian monasticism, Desert Fathers → Kellia, Apophthegmata Patrum (wh-492, rm-613)
- eg-661 Ancient Egyptian religion → interpretatio graeca (wh-216)
- eg-685 cult image → naos (gr-969)
- eg-692 oracle → Dakhla Stela (gr-977)
- eg-694 votive offering → ear stela (gr-976)
- eg-753 mummification → per-nefer (wh-214)
- eg-764 Book of the Dead → Papyrus of Ani (wh-215) — one of, with eg-465 Greenfield Papyrus
- eg-791, eg-825 pharaoh → prenomen, netjer nefer (wh-209) — one of
- eg-901 papyrus → Prisse Papyrus (wh-208)

## C — unclear (reason undocumented, the line broad, or the cause mixed)

| id | plan line | current answer | possible famous term | why unclear |
|---|---|---|---|---|
| ru-660 | The Soviet annexation of the Baltic states | State continuity of the Baltic states | Soviet occupation of the Baltic states (ww2-161) | steer reasons were in `notes`, not kept |
| ru-679 | Lend-Lease to the Soviet Union | ALSIB | Lend-Lease (ww2-204, us-827) | same |
| ru-682 | The Warsaw Uprising and the Red Army | Battle of Radzymin | Warsaw Uprising (ww2-351) | same |
| ru-347 | Catherine and the philosophes | Denis Diderot | Voltaire (wh-749) | a group line |
| ru-424 | Censorship under Nicholas I | cast-iron statute | censorship (rm-117) | the statute is a real term |
| ru-399 | Battle of Smolensk, 1812 | 1812 Battle of Smolensk | Battle of Smolensk (ww2-272) | a qualifier only |
| ru-042 | The seizure of Kyiv | Askold and Dir | Kyiv (glossary, gw-541) | an event line |
| ru-062 | Hilarion of Kyiv | Sermon on Law and Grace | Hilarion | glossary-only cause |
| gr-524 | The Corcyra affair | Epidamnus | Corcyra (glossary only) | |
| gr-570 | The fleet at Samos | Athenian fleet at Samos | Samos (glossary only) | near-equivalent |
| rm-454 | The death of Nero | Hostis | death of Nero / Nero | ⚠ twins rm-439 if that becomes *Nero* |
| cnh-312 | Buddhism in the northern kingdoms | Fotudeng | Buddhism (wh-381) | broad line |
| cnh-975, cnh-977 | Papermaking / Movable type | Fangmatan / Hua Sui | papermaking (wh-412) / movable type (wh-532) | cause cited as cnh-262 / cnh-439, which answer other terms |
| cnh-903, 906, 937, 958 | Chinese language / Seal script / Dunhuang manuscripts / Jingdezhen | four tones of Middle Chinese / small seal script / Wang Yuanlu / d'Entrecolles | the line's own words | steered off prose in other China cards, none answering the term |
| cnh-962, 964, 965, 966, 946, 955, 982, 984, 796 | architecture / pagoda / garden / tombs / painting / ceramics / astronomy / comets and supernovae / Mongolia | Fujian tulou / Giant Wild Goose Pagoda / Yuanye / Wu Liang Shrine / Wu Daozi / Ding ware / Dunhuang Star Chart / SN 185 / Lifan Yuan | the line's own words | broad lines; collisions were other plans' unwritten lines or gw-133 |
| ww2-141 | Invasion of Poland | Fall Weiss | invasion of Poland (wh-918) | reason undocumented |
| us-009 | The Archaic period in North America | North American Archaic | Archaic period | the Greek glossary key |
| ko-154 or ko-156 | Baekje and Japan | Seven-Branched Sword | toraijin (jp-055) | the Korea ledger does not name the card |

## B — valid (about 45, not listed in full)

The steered term is answered in the card's OWN collection (ru-543 → ru-529 Rasputin, ru-569 → ru-333 Winter Palace,
ru-644 → ru-642 Gulag, gr-534 → gr-467 Pericles, many Rome and China cards), the line was a broad process given a
concrete term on its merits, or the answer is simply the standard name (Kadets ru-508, Temporary Rules on the Press
ru-453, Russian invasion of Manchuria ru-490, Battle of Baekgang ko-160, Great Retreat of 1915 ru-536).

**Unrelated finding**: jp-085 and jp-131 both answer *kentōshi*, a twin inside Japan.
