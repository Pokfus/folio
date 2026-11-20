# Ancient Egypt — the 1000-card plan

The running order for the `egypt` collection. Every card has a number, a topic and a deck, fixed in
advance, so the collection can be grown one card at a time across many sessions without anyone having
to remember where it had got to.

Not part of the site.

**This plan created its collection.** Rome, Russia and India were empty nodes waiting for a tree; China
had a tree already; Ancient Egypt had nothing at all, so the collection itself, its tree and its
signature colour ship with this file. What that involved is set out under "Making the collection" below.

## How to use this (the whole point of the file)

**"Generate the next Ancient Egypt card" means: take the lowest `eg-NNN` that is not yet in `data.js`,
read its topic and deck from the list below, research it, and add it.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));
      for(let i=1;i<=1000;i++){const id='eg-'+String(i).padStart(3,'0');
      if(!h.has(id)){console.log('next:',id);break}}"

There is deliberately **no separate progress file**. `data.js` is the record of what exists, this file
is the record of what is planned, and the next card is whatever falls between them — so the two can
never disagree about where the work has got to.

Then write the card to the rules in CLAUDE.md ("Generating cards & glossary entries") and add it with:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** `add-card.js` falls back to the first leaf in the whole tree when it is
omitted, which is `cn-myth`, in the China collection.

Note that the numbering runs past 999, so ids are **not** all the same length: `eg-001` … `eg-999`,
then `eg-1000`. The command above pads to three digits, which is right for every id but the last.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer
term. `eg-266 Battle of Megiddo` is already an answer term; `eg-027 Badarian culture` is a topic whose
answer is settled and `eg-114 How the pyramids were built` is an area, and the card's actual answer —
the word that gets blanked — is chosen while writing it, from what the sources will support.

So: **a topic may be renamed, split, merged or dropped when the research is done.** Some will turn out
to be thinner than they look, and a few will turn out to be two cards. When that happens, change the
line here in the same commit as the card, and say so — this file is only useful while it is true.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never
invent a date, a name or a definition. If a topic cannot be sourced, say so and replace the line.

Card ids run `eg-001` … `eg-1000`, in the order below. Numbering follows the tree, and the first six
decks follow chronology, so their running order is roughly chronological — which also means an early
card and a late card in the same deck sort together on the study page, since cards are ordered by
`cardYears(answerDate)` and not by id. The last three decks are thematic and their order is a reading
order rather than a claim about dates.

## Retitled while writing

A line is a subject to research, and three of the first ten turned out to want a different answer term.
Each was changed here in the same commit as the card that changed it.

**`eg-001` Ancient Egypt → Kemet, the Black Land.** `Ancient_Egypt` has been a cited glossary term since
Phase 3 of the citation pass and `wh-201` already cards it at survey altitude, so the line had no term of
its own left to teach. **Kemet** is the word the Egyptians used for their own country, and it sets up the
Black Land / Red Land frame the whole deck rests on — which is the `ww2-133` reason: a line named after
something the glossary already holds wants the thing beside it, not the thing itself.

**`eg-007` The Egyptian deserts → The Western Desert.** There is no term for "the Egyptian deserts" taken
together: the Egyptian word for the desert is *deshret*, and `Deshret` is Wikipedia's article on the RED
CROWN of Lower Egypt, so keying a term there would have pointed a reader at a hat. The Eastern Desert is
`eg-008` and the oases `eg-009`, so what this line genuinely lacked was the Western Desert itself — much
the larger of the two, and the flank the oasis chain runs down.

**`eg-009` The oases of the Western Desert → Kharga Oasis and the oasis chain.** A card is answered by a
term, and "the oases" is not one. Kharga is the southernmost of the chain and the one classical writers
called simply the Great Oasis; the card carries the chain, the ten-day spacing Herodotus gives it and the
fossil aquifer under all of them.

**`eg-011`–`eg-100` (written together) retitled 49 lines**, and the list below now shows the term each
card actually answers. The reasons fall into four kinds:

- **The plan's term was already taken** by a World History card or an earlier line, so the card took the
  term beside it: Palaeolithic (`wh-046`) → Wadi Kubbaniya; Saharan rock art (`wh-152`) → Gilf Kebir;
  Nabta Playa (`wh-154`) → Gebel Ramlah; African cattle pastoralism (`wh-153`) → Bir Kiseiba; Neolithic
  (`wh-111`) → El Omari; emmer (`wh-202`) → barley; Naqada culture (`wh-203`) → the Naqada expansion;
  unification (`wh-205`) → Menes; Egyptian hieroglyphs (`wh-206`) → Tomb U-j; Memphis (`gr-719`) →
  Inebu-hedj; the Two Lands (`eg-004`) → Sema-tawy; cylinder seal (`wh-176`) → jar sealings; Old Kingdom
  (`wh-210`) → the Egyptian pyramids; the Step Pyramid (`wh-211`) → the serdab, with `eg-096` taking the
  Heb-sed court so the two stay apart.
- **The line named an area, not a term**: `eg-013`, `eg-020`, `eg-022`, `eg-023` (written from
  linguistics, archaeology and ancient DNA as the "Race and Egypt" paragraph asks), `eg-024`, `eg-025`,
  `eg-032`, `eg-033`, `eg-042`, `eg-043`, `eg-044`, `eg-077`, `eg-083`, `eg-086`, `eg-088`, `eg-089`,
  `eg-090`.
- **A later line already owns the general term**: the king lists → the Turin King List (Abydos is
  `eg-340`); Manetho → his *Aegyptiaca* (the man is `eg-598`); the calendar → the epagomenal days
  (`eg-980`/`eg-981` hold the civil calendar and the Sothic cycle); ivory carving → Tell el-Farkha, whose
  votive deposit is the best-sourced body of Early Dynastic ivories (the U-j tags are `eg-046`, the year
  labels `eg-047`).
- **Two subjects on one line**: Peribsen and Khasekhemwy → Peribsen (Khasekhemwy carries `eg-069`); the
  Red and White Crowns → Pschent, which wears both (so `eg-796 Crowns of Egypt` needs another answer);
  the royal tombs at Abydos → Djet, one tomb, since `eg-063` is the cemetery.

**`eg-101`–`eg-200` (written together, in ten parallel batches) retitled 56 lines**, and the list below
shows the term each card answers. The same four kinds again:

- **Already taken**: the Great Pyramid (`wh-212`) → Hemiunu, its probable overseer; the Great Sphinx
  (`wh-213`) → Khafre Enthroned, from the valley temple beside it (the Sphinx Temple has no article); the
  First Intermediate Period (`wh-217`) → Heracleopolis Magna; the Middle Kingdom (`wh-218`) → the
  Prophecy of Neferti; the cult of Ra (Ra is `eg-663`) → the Westcar Papyrus; the rise of Thebes (Thebes
  is `eg-391`) → Intef the Elder; the mortuary temple of Mentuhotep II (Deir el-Bahari is `eg-414`) →
  Kawit, buried inside it. The Instruction of Amenemhat moved up to `eg-178`, which had no term of its
  own for the assassination it tells, and `eg-179` took the Satire of the Trades beside it.
- **The line named an area**: `eg-113`, `eg-114`, `eg-117`, `eg-135`–`eg-138`, `eg-140`, `eg-142`,
  `eg-144`, `eg-148`, `eg-149`, `eg-151`–`eg-155`, `eg-157`–`eg-159`, `eg-164`–`eg-166`, `eg-169`,
  `eg-170`, `eg-172`, `eg-185`, `eg-189`–`eg-192`, `eg-198`.
- **Two subjects on one line**: the Seventh and Eighth Dynasties → the Seventh at `eg-142` and the Eighth
  at `eg-143`; the Ninth and Tenth → the Tenth (the Ninth through its founder, Meryibre Khety, `eg-144`);
  Mentuhotep III and IV → Mentuhotep IV; Hawara and the Labyrinth → the Labyrinth.
- **Wikipedia's head word differs**: Harkhuf and Weni → their Autobiographies; Yam keys as `Yam_(Nubia)`
  so the bare word cannot auto-link; Lahun → El Lahun; the Lahun papyri key as `Kahun_Papyri`; the
  Merikare and Ba texts take Wikipedia's titles. `Heit_el-Ghurab` has no Wikipedia article and keys under
  the excavators' name for the site.

Two answer terms collided between batches before import and were moved: Wawat stays at `eg-191`, so
`eg-166` took the Medjay; the Prophecy of Neferti stays at `eg-171`, so `eg-170` took Hatnub.

`Naqada_culture` gave up its bare `Naqada`, `Amratian` and `Gerzean` aliases in the same commit, to the
new `Naqada` (the site), `Naqada_I` and `Naqada_II` terms.

**`eg-201`–`eg-300` (written together, in ten parallel batches) retitled 66 lines**, and the list below
shows the term each card answers. The same kinds again:

- **Already taken**: Hyksos (`wh-219`) → Khyan; New Kingdom (`wh-220`) → Ahhotep I; Hatshepsut (`wh-221`)
  → the Speos Artemidos; Thutmose III (`wh-222`) → his Festival Hall; Akhenaten (`wh-223`) → KV55; the
  Amarna letters (`wh-270`) → Rib-Hadda; Mitanni (`wh-200`) → Tushratta; the Hittites (`wh-266`) →
  Suppiluliuma I; Punt (`wh-422`) → Henenu and myrrh; the composite bow (`wh-586`) → the recurve bow; the
  chariot (`wh-261`) → the Egyptian chariot; the Thirteenth Dynasty (`eg-200`) → Neferhotep I; Sobekneferu
  (`eg-199`) → Amenemhat IV; Byblos (a glossary term) → its royal necropolis.
- **The line named an area**: `eg-201`, `eg-205`, `eg-207`, `eg-208`, `eg-211`–`eg-219`, `eg-225`,
  `eg-227`, `eg-230`, `eg-231`, `eg-234`, `eg-237`, `eg-239`, `eg-241`, `eg-243`, `eg-245`, `eg-247`,
  `eg-249`, `eg-250`, `eg-256`, `eg-259`, `eg-261`, `eg-263`, `eg-264`, `eg-268`–`eg-270`, `eg-280`,
  `eg-284`–`eg-290`, `eg-292`–`eg-295`, `eg-297`. Two are weak fits and say so in their notes:
  Menkheperraseneb I for the Aegean (his tomb shows the chief of Keftiu) and Yuya for the army.
- **Two subjects on one line**: the Sixteenth and Abydos Dynasties → the Sixteenth (the Abydos Dynasty is
  left free).
- **Wikipedia's head word differs**: Shabti → Ushabti (so `eg-776 The duties of the shabti` needs another
  answer); Kingdom of Kerma → Kerma culture (so `eg-480` needs a term other than Kerma culture); Ahmose son
  of Ibana → Ahmose, son of Ebana; the siege of Sharuhen → Sharuhen.

Four answer terms collided between batches before import and were moved: *Against Apion* stays at
`eg-227`, so `eg-247` took Tjaru; Tell el-Yahudiyeh ware stays at `eg-231`, so `eg-225` took Tell
el-Maskhuta; the Nine Bows stay at `eg-293`, so `eg-233` took the recurve bow; the Chapelle Rouge stays at
`eg-259`, so `eg-264` took the Seated Statue of Hatshepsut. Two more in the same batch, the Autobiography
of Ahmose Pen-Nekhebet and the Speos Artemidos, stay at `eg-256` and `eg-258`, so `eg-287` took Amenemhab
and `eg-288` the Temple of Amada.

**`eg-301`–`eg-400` (written together, in ten parallel batches) retitled 65 lines**, and the list below
shows the term each card answers. The same kinds again:

- **Already taken**: Tutankhamun (`wh-224`) → Ankhesenamun; the mask (`art-066`) → his meteoric iron
  dagger; Ramesses II (`wh-225`) → Ozymandias; the Battle of Kadesh (`wh-226`) → Muwatalli II; Karnak
  (`wh-228`) → the Temple of Khonsu; the Nefertiti Bust (`art-065`) → Thutmose, the sculptor in whose
  workshop it stood; the Sea Peoples (`wh-278`, `gr-108`) → the Peleset; the Late Bronze Age collapse
  (`wh-279`) → Alashiya.
- **The line named an area**: `eg-301`, `eg-304`, `eg-308`, `eg-310`–`eg-314`, `eg-316`, `eg-322`–`eg-324`,
  `eg-326`, `eg-328`, `eg-330`, `eg-333`–`eg-335`, `eg-341`, `eg-342`, `eg-347`, `eg-352`, `eg-353`,
  `eg-355`, `eg-356`, `eg-359`, `eg-360`, `eg-367`, `eg-370`–`eg-375`, `eg-378`, `eg-379`, `eg-381`–`eg-386`,
  `eg-388`, `eg-390`, `eg-395`–`eg-397`. Two are loose fits and say so in their notes: Maya for the return
  to Thebes, and Henotheism for the question whether Atenism was monotheism.
- **Wikipedia's head word differs**: the boundary stelae, the workmen's village, the royal tomb, the
  Deir el-Medina strikes, the harem conspiracy, the Great Hypostyle Hall, the Avenue of Sphinxes; Thebes
  keys as `Thebes,_Egypt` with no bare alias, so it cannot link Greek Thebes.

Two answer terms collided before import and were moved: Gempaaten (`eg-310`, keyed at
`Temple_of_Amenhotep_IV`) stays, so `eg-312` took Meryre, the high priest of the Aten; and the Wilbour
Papyrus is `eg-810`'s, so `eg-374` took the Mayer Papyri.

**`eg-401`–`eg-500` (written together, in ten parallel batches) retitled 64 lines** (eight more changed
only an article, a capital or a dynasty written as a numeral), and the list below shows the term each
card answers. The same kinds again:

- **Already taken**: the Valley of the Kings (`wh-227`) → Meretseger, the goddess of the peak above it;
  the Third Intermediate Period (`wh-230`) → Ramesses XI, whose death opens it; the Kingdom of Kush
  (`wh-416`) → El-Kurru, its royal cemetery; Nubia (`wh-229`) → the Nubians; the God's Wife of Amun
  (`eg-291`) → Nitocris I at `eg-438` and Shepenupet I at `eg-460`; Medinet Habu (`eg-365`) → the migdol
  its gate copies; Kerma culture (`eg-242`) → Kerma, the city; the Book of the Dead (`eg-764`) → the
  Greenfield Papyrus; Libu (`eg-367`) → Osorkon the Elder.
- **The line named an area**: `eg-402`, `eg-405`, `eg-406`, `eg-409`, `eg-412`, `eg-415`, `eg-417`,
  `eg-418`, `eg-420`–`eg-427`, `eg-429`, `eg-431`–`eg-433`, `eg-435`–`eg-437`, `eg-439`, `eg-440`,
  `eg-445`, `eg-448`, `eg-450`, `eg-454`, `eg-457`, `eg-459`, `eg-461`, `eg-462`, `eg-464`–`eg-470`,
  `eg-471`, `eg-475`, `eg-479`, `eg-481`, `eg-482`, `eg-486`, `eg-490`, `eg-495`, `eg-496`,
  `eg-498`–`eg-500`. The Levantine campaign of Shoshenq I has no term of its own (Wikipedia folds it into
  Shishak), so `eg-454` teaches it through Rehoboam, in whose fifth year the Bible dates it.
- **Two subjects on one line**: the 23rd and 24th Dynasties → the 23rd (the 24th through Tefnakht,
  `eg-459`, and Bakenranef, `eg-490`); Lower and Upper Nubia → Lower Nubia; Alara and Kashta → Kashta.
- **Wikipedia's head word differs**: the tombs of Rekhmire and Nakht key as `TT100` and `TT52`, KV35 as
  `Tomb_of_Amenhotep_II`, the Royal Cache keeps TT320 and DB320 as aliases; Djeme and the
  Autobiography of Ineni have no article of their own and show no Learn-more tile.

`eg-474` took the general term archaism, so `eg-524 Saite art and archaism` needs a narrower answer.
Three answer terms collided between batches before import and were moved: Tefnakht stays at `eg-459`,
so `eg-475` took Nimlot of Hermopolis; Kawa stays at `eg-486`, so `eg-495` took the Shrine of Taharqa;
Rehoboam stays at `eg-454`, so `eg-467` took Hoshea.

**`eg-501`–`eg-600` (written together, in ten parallel batches) retitled 72 lines** (some only an article,
a year or a dynasty's "of Egypt"), and the list below shows the term each card answers. The same kinds:

- **Already taken**: Meroë (`wh-417`) → Arakamani, the first king buried there; Naucratis (`gr-221`) → the
  Hellenion; Abu Simbel (`eg-349`) → Potasimto, the general its graffiti name; Cambyses II (`gr-385`) → Psamtik
  III; Darius I (`gr-386`) → the Statue of Darius; Herodotus (`gr-440`) → Sesostris at `eg-540` and Rhampsinit at
  `eg-541`; archaism (`eg-474`) → the Tomb of Ibi (TT36); Apis, Mnevis, Bubastis and the Serapeum → Buchis and Tuna
  el-Gebel; Ptolemaic Egypt (`gr-767`) → Ptolemais Hermiou; Alexander, the Oracle of Ammon and the founding of
  Alexandria (`gr-701`, `gr-721`, `gr-720`) → Cleomenes of Naucratis, Siwa Oasis and Rhakotis; Ptolemy I Soter
  (`gr-766`) → Alexander IV, the boy pharaoh he governed for; Hellenistic kingship (`gr-773`) → the Ptolemaic cult of
  Alexander; Alexandria, its Library and its Lighthouse (`rm-766`, `gr-802`, `gr-804`) → Lake Mareotis, Aristophanes
  of Byzantium and Sostratus of Cnidus; Cleruchy (`gr-482`) → Kerkeosiris; Arsinoe II (`gr-776`) → the Great Mendes
  Stela; the Syrian Wars (`gr-793`) → the Battle of Panium; Raphia (`gr-794`) → Ptolemy IV Philopator; the Rosetta
  Stone (`wh-207`) → Ptolemy V Epiphanes at `eg-590` and the Raphia Decree at `eg-591`; Dendera (`eg-154`) → the
  Dendera zodiac.
- **The line named an area**: `eg-504`, `eg-509`, `eg-511`, `eg-513`, `eg-516`, `eg-517`, `eg-523`, `eg-525`,
  `eg-526`, `eg-531`, `eg-534`, `eg-536`, `eg-539`, `eg-543`, `eg-548`, `eg-550`–`eg-560`, `eg-562`, `eg-566`,
  `eg-568`, `eg-574`–`eg-577`, `eg-579`, `eg-588`, `eg-592`, `eg-597`, `eg-599`, `eg-600`. The codification of the
  law under Darius has no term of its own, so `eg-536` teaches it through the Demotic Chronicle, on whose back it is
  copied.
- **Two subjects on one line**: Tantamani and the withdrawal → Tantamani; the 28th and 29th Dynasties → the 29th
  (the 28th is Amyrtaeus, `eg-545`).
- **Wikipedia's head word differs**: the Canal of the Pharaohs, Horwennefer (Hugronaphor), the Temple of Kom Ombo;
  the Canopus Decree keys as `Decree_of_Canopus`, the Temple of Onias as `Land_of_Onias`, the Statue of Darius as
  `Egyptian_statue_of_Darius_the_Great`, the Zenon Archive as `Zenon_of_Kaunos`; Pefnefdineit and the Petition of
  Peteese have no article of their own and show no Learn-more tile.

Two answer terms collided between batches before import and were moved: the Demotic Chronicle stays at `eg-536`,
so `eg-557` took Khabash; Rhakotis stays at `eg-564`, so `eg-574` took Agathocles of Egypt.
`eg-597` took the House of Life, which was also the unwritten line `eg-924`; that line now reads the House of
Books at Edfu, the temple library room whose wall lists its books, a subject to research when it is written.

**`eg-601`–`eg-700` (written together, in ten parallel batches) retitled 68 lines** (a few only an article,
a spelling or Wikipedia's full head word), and the list below shows the term each card answers. The same kinds:

- **Already taken**: Cleopatra VII (`gr-876`, `rm-384`) → Ptolemy XIII Theos Philopator and Papyrus Bingen 45, her
  ordinance for a Roman; Actium and Caesarion (`rm-387`, `gr-874`, `gr-875`) → the death of Cleopatra; Roman Egypt
  (`rm-765`) → the epistrategos; the annexation (`rm-388`) → the Battle of Alexandria of 30 BCE; the prefect (`rm-811`) →
  Aelius Gallus; the grain supply (`rm-767`) → the embole; the Roman census (`rm-073`) → the house-by-house census;
  Alexandria (`gr-801`, `rm-766`) → the Letter of Claudius to the Alexandrians; Zenobia (`rm-562`) → the Palmyrene
  invasion of Egypt; Diocletian (`rm-566`) → Pompey's Pillar; the Antonine Plague (`rm-518`) → the Plague of Cyprian;
  the Diocletianic persecution (`rm-573`) → the Era of the Martyrs; Christian monasticism and the Desert Fathers
  (`wh-492`, `rm-613`) → Kellia and the Apophthegmata Patrum; Philae (`eg-595`) → the Blemmyes; Roman Egypt again →
  the Apion family for Byzantine Egypt; Ancient Egyptian religion (`wh-216`) → interpretatio graeca; Amun-Ra (an alias
  of `Amun`) → the Theban Triad; the cult image (`gr-969`) → the naos; the Opet, Valley and Sed festivals (`eg-399`,
  `eg-434`, `eg-076`) → the Festival of Bubastis; the Chapelle Rouge and White Chapel → the barque shrine; the oracle
  (`gr-977`) and the Banishment and Bentresh stelae → the Dakhla Stela; the votive offering (`gr-976`) → the ear stela;
  the animal mummy, Apis, Mnevis, Buchis and the Serapeum → the sacred ibis and the sacred bull.
- **The line named an area**: `eg-601`, `eg-608`, `eg-611`, `eg-613`–`eg-615`, `eg-618`, `eg-620`, `eg-622`–`eg-625`,
  `eg-627`, `eg-630`, `eg-631`, `eg-634`–`eg-636`, `eg-638`, `eg-641`, `eg-642`, `eg-645`, `eg-647`, `eg-655`,
  `eg-656`, `eg-660`, `eg-683`, `eg-686`, `eg-687`, `eg-689`, `eg-697`, `eg-699`. Two are loose fits and say so in
  their notes: interpretatio graeca for Egyptian religion, and the Theban Triad for Amun-Ra.
- **Two subjects on one line**: Nut and Geb → Nut; Shu and Tefnut → Tefnut (a bare `Shu` surface would link Shu Han and
  Shu brocade); Bes and Taweret → Taweret, with Bes carrying household religion at `eg-683`.
- **Wikipedia's head word differs**: Set keys as `Set_(deity)`, case-sensitive, answered as Seth; Nut as
  `Nut_(goddess)`; Heka as `Heka_(god)`; Pachomius as `Pachomius_the_Great`; Theophilus as `Theophilus_I_of_Alexandria`;
  the apotropaic wand as `Birth_tusk`; Kom el-Shoqafa as `Catacombs_of_Kom_El_Shoqafa`. The laographia, the
  house-by-house census, the Gnomon of the Idios Logos, the Letter of Claudius, the embole, the hem-netjer, the wab priest,
  the Festival of Bubastis, the Dakhla Stela, the offering formula and the ear stela have no article of their own and show
  no Learn-more tile.

Two answer terms collided between batches before import and were moved: the Gnomon of the Idios Logos stays at
`eg-613`, so `eg-625` took Soknopaiou Nesos; Isis stays at `eg-668`, so `eg-636` took the Navigium Isidis.

**`eg-701`–`eg-800` (written together, in ten parallel batches) retitled 80 lines** (a few only an article, a
spelling or a plural), and the list below shows the term each card answers. The same kinds:

- **Already taken**: the Metternich Stela (`eg-556`) → the cippus of Horus; the Dream Stele (`eg-274`) → the Dream
  Book; the Great Hypostyle Hall (`eg-394`) → the hypostyle hall; Ra (`eg-663`) → Khepri; Amun-Ra (an alias of
  `Amun`) → Ra-Horakhty; Atenism (`eg-299`) → the democratisation of the afterlife; Seth (`eg-670`) → Byblos; Nut
  (`eg-679`) → the Book of Nut; the royal titulary (`eg-072`) → Son of Ra; Herodotus (`wh-331`, `gr-440`) → Diodorus
  Siculus; mummification (`wh-214`) → the per-nefer; the Book of the Dead (`wh-215`) → the Papyrus of Ani; the
  Amduat and its companions (`eg-407`–`eg-409`) → the Books of the Netherworld; the false door and the mastaba
  (`eg-137`, `eg-065`) → the Tomb of Perneb; the Tomb of Kha and Merit and Yuya (`eg-423`, `eg-286`) → Senebtisi;
  the ushabti (`eg-206`) → the overseer shabti; Meketre (`eg-172`) → the servant statue; the South Tombs Cemetery
  (`eg-316`) → the soul house; the Giza West Field (`eg-138`) and the Theban Necropolis → the Memphite Necropolis;
  the Abbott and Mayer papyri (`eg-373`, `eg-374`) → the Leopold-Amherst Papyrus; the Royal Cache and Bab el-Gasus →
  coffin reuse; the Fayum portraits (`eg-626`) → the Books of Breathing; pharaoh (`wh-209`) → the prenomen; the
  pschent (`eg-075`) → the Deshret; Maat (`eg-681`) → the presentation of Maat; the God's Wife of Amun (`eg-291`) →
  the Great Royal Wife.
- **The line named an area**: most of the rest — `eg-702`–`eg-711`, `eg-713`, `eg-715`, `eg-721`, `eg-725`,
  `eg-730`–`eg-740`, `eg-742`, `eg-747`, `eg-750`, `eg-754`, `eg-756`, `eg-759`, `eg-760`, `eg-765`, `eg-767`,
  `eg-768`, `eg-771`–`eg-775`, `eg-778`, `eg-783`–`eg-785`, `eg-787`–`eg-789`, `eg-792`, `eg-793`, `eg-795`,
  `eg-800`. The Destruction of Mankind is the first part of the Book of the Heavenly Cow (`eg-726`), so `eg-725`
  took the Festival of Drunkenness that re-enacted its end; the democratisation of the afterlife is a modern model
  and its card says that many now reject it.
- **Two subjects on one line**: the name and the shadow → the ren; the king as Horus and son of Ra → Son of Ra.
- **Wikipedia's head word differs**: Nun keys as `Nu_(mythology)`, the Ka and Ba as `Ka_(Egyptian_soul)` and
  `Ba_(Egyptian_soul)`, the Leopold-Amherst Papyrus as `Papyrus_Leopold_II`, Pott's disease as `Pott_disease`, Reshep
  as `Resheph`. The serpent is keyed `Apep`, not `Apophis`, because Apophis is already an alias of the king Apepi
  (`eg-229`). Thirty-nine of the hundred have no article of their own and show no Learn-more tile.

Two answer terms collided between batches before import and were moved: the Bremner-Rhind Papyrus stays at
`eg-711`, so `eg-740` took the historiola; the Tomb of Perneb stays at `eg-770`, so `eg-773` took the offering list.
`eg-705` took the hypostyle hall, which was also the unwritten line `eg-956`; that line now carries `eg-705`'s old
subject, the temple as a model of the cosmos, to research when it is written.

**`eg-801`–`eg-900` (written together, in ten parallel batches) retitled 90 lines** to the term each card
answers; ten kept their line (`eg-805`, `eg-810`, `eg-851`, `eg-868`, `eg-870`, `eg-876`, `eg-891`, `eg-895`,
`eg-897`, `eg-899`). Almost all of them named an area — kingship's administration, law and army, the whole of
everyday life, the economy — and took a concrete term inside it. The ones that had to move for another reason:

- **Already taken**: the female kings Hatshepsut, Sobekneferu, Twosret and Merneith → Nitocris; the Amarna letters
  (`wh-270`) and the Egyptian–Hittite treaty (`eg-346`) → Gilukhipa; pharaoh (`wh-209`) → netjer nefer; the Land
  of Punt (`wh-208`) → Mersa Gawasis; Egyptian hieroglyphs (`wh-206`) → Ptolemaic hieroglyphs; Demotic (`eg-527`)
  → Old Coptic; Middle Egyptian (`eg-203`) → Late Egyptian; papyrus and the ostracon (`eg-901`, `eg-902`) → the
  scribal palette; Nome, Nomarch, Buhen, Semna, the chariot, the khopesh and the Medjay → Metjen, Uronarti, the
  mace and the Sherden; the Satire of the Trades (`eg-179`) → the Turin Satirical-Erotic Papyrus.
- **Collided between batches before import** and moved: the kenbet stays at `eg-812`, so `eg-862` took the
  oracle of Amenhotep I; *niwt* stays at `eg-839`, so `eg-864` took *whyt*; Metjen stays at `eg-814`, so `eg-871`
  took the *basilike ge*; the pefsu stays at `eg-842`, so `eg-874` took the hekat; the Heqanakht papyri stay at
  `eg-861` and the Tomb of Nebamun and Ipuky at `eg-879`, so `eg-828` took the harvest scene and `eg-829` the
  overseer of craftsmen.

**`eg-901`–`eg-1000` (written together, in ten parallel batches) retitled most lines** to the term each card
answers; the lines in the list now read as the answers. Area lines (poetry, tools, timekeeping, the column)
took a concrete term inside them, and the ones that had to move for another reason were:

- **Already taken**: papyrus (`wh-208`) and *Cyperus papyrus* (`eg-881`) → the Prisse Papyrus; Kemit, the Late
  Egyptian Miscellanies' neighbours, Letters to the Dead, the Heqanakht papyri, Demotic, the Demotic Chronicle and
  Ankhsheshonq → the model letter, the Calendar of Lucky and Unlucky Days, the Inaros–Petubastis cycle and the
  Oracle of the Potter; Sinuhe, Wenamun, Two Brothers, the Shipwrecked Sailor and Papyrus Harris 500 → the Taking
  of Joppa, the Punt reliefs and the Cairo Vase; the Great Sphinx, Khafre Enthroned, the Seated Scribe, the serdab
  and the Tomb of Nebamun → Rahotep and Nofret, Kaaper and the copper statues of Pepi I; the mastaba, the hypostyle
  hall, the benben, the sacred lake, Abu Simbel and Malkata → the cavetto cornice, the primeval mound, the dromos,
  the Temple of Derr and the Palace of Apries; the hekat, deben and seked → the aroura; the Khufu ship and the
  Abydos boats → the Dahshur boats; Heka, Thoth and the House of Life → Papyrus Berlin 3027 and the Book of Thoth.
- **`eg-917` answers the Cairo Vase**, the name the published translation uses, rather than "the Cairo Love
  Songs", which none of the card's sources uses.

## Making the collection

Four things had to be decided because nothing existed to inherit them from.

**The collection id is `egypt`, not `col-44`.** `china` set the precedent for a readable collection id,
and the `col-N` sequence is a poor place to add one: `col-1`–`col-39` are China's internal decks, and
`col-44`–`col-64` were a set of empty World History period decks removed on 2026-08-04. Reusing a number
that recently meant something else is a trap for whoever next greps for it.

**The card prefix is `eg-`**, matching the two-letter country-code convention `gr-` / `ru-` / `in-`
already use. Deck ids are `eg-*` too; there is no collision, since cards and nodes live in different
maps, and the pattern is the one Greece already runs (`gr-001` beside `gr-crete`).

**The signature hue is `#1F6F5C`, a malachite green**, added to `COLL_THEME`. It was **measured rather
than picked**: the green quarter of the colour space was entirely unused, and in CIELAB this sits
**33.3 from its nearest neighbour** (Greece's Aegean blue) against a tightest existing pair of 12.9
(China's vermilion against Russia's lacquer red). It happens also to be the right colour — malachite was
Egypt's green pigment and its eye paint — but the numbers led there first. A collection with no
`COLL_THEME` row renders on the generic indigo fallback, so this is one line and worth it.

**There is deliberately NO entry in `COLLECTION_NUMERALS`.** Egyptian hieroglyphic numerals are a real
additive system and the obvious thing to reach for, and reaching for it would be a mistake: no
hieroglyphic webfont is loaded, and CLAUDE.md's font note is explicit that none should be added lightly.
A level badge that renders as a row of tofu boxes on most machines is worse than a digit. Egypt uses
Western numerals, like World History and the United States. If a hieroglyphic font is ever shipped for
another reason, this is a five-line addition to `numeralIn`.

## What this collection is about

**The Nile valley from the Palaeolithic to the Arab conquest of 641 CE**, and the ending is the
decision worth arguing.

Most courses stop at 30 BCE, when Rome annexed Egypt, and treat everything after as somebody else's
history. That is wrong for this collection in a specific way: **Egyptian religion, Egyptian writing and
Egyptian temple building all outlive Egyptian independence by centuries.** Roman emperors are shown as
pharaohs on temple walls they paid for. The last dated hieroglyphic inscription is of 394 CE, at Philae,
and Philae's temple was still working into the sixth century. A collection that ends at Cleopatra ends
three hundred years before its subject does.

So Ptolemaic, Roman and Christian Egypt get 100 cards between them, and the collection closes where
ancient Egyptian religion actually closes — with `eg-655 The end of the Egyptian temples`, `eg-656 The
last hieroglyphic inscription`, `eg-657 The closing of Philae` and `eg-660 What survived of ancient
Egypt`. It does not attempt Islamic or modern Egypt, which are a different course.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Before the Pharaohs | The Nile before the pharaohs | 25 | eg-001–025 |
| | Predynastic Egypt | 30 | eg-026–055 |
| The Old Kingdom | Early Dynastic Egypt | 35 | eg-056–090 |
| | The Old Kingdom | 50 | eg-091–140 |
| | The First Intermediate Period | 30 | eg-141–170 |
| The Middle Kingdom | The Middle Kingdom | 50 | eg-171–220 |
| | The Second Intermediate Period | 30 | eg-221–250 |
| The New Kingdom | The early Eighteenth Dynasty | 45 | eg-251–295 |
| | Akhenaten and Amarna | 40 | eg-296–335 |
| | The Ramesside age | 55 | eg-336–390 |
| | Thebes, Karnak and the royal tombs | 50 | eg-391–440 |
| The Later Periods | The Third Intermediate Period | 35 | eg-441–475 |
| | Kush and the Twenty-fifth Dynasty | 30 | eg-476–505 |
| | The Late Period | 55 | eg-506–560 |
| Greco-Roman Egypt | Ptolemaic Egypt | 45 | eg-561–605 |
| | Roman Egypt | 35 | eg-606–640 |
| | Christian Egypt and the end | 20 | eg-641–660 |
| Gods and the Dead | Gods and religion | 50 | eg-661–710 |
| | Myth and cosmology | 30 | eg-711–740 |
| | Death, burial and the afterlife | 50 | eg-741–790 |
| Kingship, State and Society | Kingship and the state | 35 | eg-791–825 |
| | Society and everyday life | 40 | eg-826–865 |
| | Land, trade and the economy | 25 | eg-866–890 |
| Writing, Art and Knowledge | Writing and literature | 40 | eg-891–930 |
| | Art and architecture | 40 | eg-931–970 |
| | Science, medicine and technology | 30 | eg-971–1000 |

Deck totals: Before the Pharaohs 55 · The Old Kingdom 115 · The Middle Kingdom 80 ·
The New Kingdom 190 · The Later Periods 120 · Greco-Roman Egypt 100 · Gods and the Dead 130 ·
Kingship, State and Society 100 · Writing, Art and Knowledge 110. **1000.**

## What the weighting is arguing

**The New Kingdom takes 190 and that is the one allocation nobody will argue with** — it is where the
evidence, the monuments and the teaching weight all sit, and it is what most readers arrive for. What
they may not expect is that Amarna gets 40 of it and the Ramesside age 55: the seventeen years of
Akhenaten produce more argument per year than any other stretch of Egyptian history, and Ramesses II
alone reigned for sixty-six.

**Everything before the Middle Kingdom keeps 170 cards.** The Predynastic and Early Dynastic are
usually a paragraph on the way to the pyramids, and they are where the Egyptian state, Egyptian writing
and Egyptian kingship were actually invented. Fifty-five cards run before the First Dynasty.

**Kush gets a subdeck of its own.** See the decisions below; it is the collection's version of the
argument the Russia, India and China plans each make in their own terms.

**A third of the collection — 340 cards — sits outside the narrative.** For Egypt that is not a
generosity to "culture": religion, mortuary practice, writing and art *are* the subject, and the
political narrative is comparatively thin. There are stretches of Egyptian history where almost nothing
is known but a king list and a building programme.

**Death gets 50 cards, which is not morbid — it is where the evidence is.** See the decisions.

## Six decisions this plan forced on the tree

**Death is 50 cards because the record is a record of the dead, and that bias is itself a card.**
Egyptian tombs were built of stone in the desert and Egyptian towns of mud brick on the floodplain,
which the river has been rebuilding on top of ever since — so what survives is overwhelmingly funerary,
and a course that simply follows the evidence will teach a civilisation apparently obsessed with dying.
`eg-789 Why the Egyptian record is a record of the dead` exists so the reader is told this outright, and
`eg-440` makes the same point about Thebes. It also governs how the daily-life cards are written: they
lean on Deir el-Medina, the papyri and Amarna precisely because those are the exceptions.

**Kush gets 30 cards and Nubia runs through the collection.** The standard treatment makes Nubia a
place Egypt raided for gold and the Twenty-fifth Dynasty an interruption to be got past. Egypt was ruled
from Napata for the better part of a century by kings who restored its temples and copied its Old
Kingdom art more carefully than the Egyptians had; Kerma was a rival state powerful enough to make the
Second Intermediate Period a war on two fronts. `eg-kush` covers the Kushite kingdom on its own terms
and follows it past Egypt to Meroë. Same argument as `ru-peoples`, India's south and China's conquest
dynasties.

**Monuments live with their builders; technique lives in `eg-art`.** The Great Pyramid is `eg-104`,
under Khufu; Abu Simbel is `eg-349`, under Ramesses II; Karnak has fifty cards of its own because it was
built and rebuilt for two thousand years and belongs to no single reign. What `eg-art` carries is what
no reign owns — the canon of proportions, sunk and raised relief, the column, the pylon, mudbrick,
surveying. This is the rule the Rome plan states and Greece follows for the Parthenon.

**Thebes is a subdeck, and it is the one place-deck in the collection.** Karnak, Luxor, the Valley of
the Kings, Deir el-Bahari, the Tombs of the Nobles and Deir el-Medina are one continuous monumental and
documentary complex, they are almost entirely a New Kingdom phenomenon, and between them they are the
single largest body of evidence Egypt has left. Splitting them across three reign-decks would bury the
one place a reader most wants to understand.

**Amarna is a subdeck, not a chapter of the Eighteenth Dynasty.** Forty cards for seventeen years is
out of all proportion to the time and exactly in proportion to the argument: whether Atenism was
monotheism, what happened to the empire, who Smenkhkare and Neferneferuaten were, what Tutankhamun's
tomb does and does not prove. `eg-313 Was Atenism monotheism?` is written as a question because it is
one.

**The Ptolemies appear as pharaohs, not as Greeks in Egypt.** `eg-568 The Ptolemies as pharaohs`,
`eg-591 The Memphis decrees and the priestly synods` and the temple cards from Edfu to Philae are the
point of the Ptolemaic subdeck: the dynasty that built more surviving Egyptian temple than any other was
Macedonian. The Greek side of the same three centuries — Alexandria's Library, the Museum, the Syrian
Wars, Cleopatra as the last Hellenistic monarch — belongs to `col-13` and is written there. See the
pairs table below.

## History, not archaeology — and this is the collection where that bites hardest

**The rule itself lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN ARCHAEOLOGY SITE") and the
site-wide rewrite pass is `docs/history-focus-plan.md`. Do not restate either here; what follows is
only what is specific to this collection, and it needs saying more firmly than anywhere else on the
site.

**Everything known about Egypt arrived through excavation and decipherment, and the popular literature
is about the arriving.** Carter at the tomb, Champollion and the stone, Belzoni and the battering ram —
these are the stories the accessible sources tell, and a card written from them will be about
nineteenth-century Europeans rather than about Egypt. The test is the one the house rule sets: **the
question must be answerable from the past, not from the dig.**

Concretely: **Tutankhamun gets cards and Howard Carter does not.** `eg-321`, `eg-325`, `eg-326`,
`eg-327` and `eg-328` are a king, a tomb, its contents, a mask and what the assemblage tells us about a
royal burial — the last of those being the historically valuable one, because Tutankhamun matters far
less as a king than as the only royal burial to survive substantially intact.

**Modern scholars are capped at two in the thousand and this plan spends ONE.** `eg-899 The decipherment
of Egyptian hieroglyphs` earns its place on the same ground as Greece's `gr-075` and China's oracle
bones: before 1822 a civilisation that wrote continuously for three and a half thousand years was mute,
and the recovery of its voice is the event, not the biography of the man who managed it. **The second
slot is deliberately left unspent**, and that is a signal rather than an oversight — in a collection
where the pull towards excavation history is this strong, an empty slot is a standing reminder that the
bar was not lowered.

Two other pulls:

**Mystification.** Egypt attracts pseudo-archaeology more than any subject on the site — lost
civilisations, impossible construction, alignments that carry messages. The plan's answer is to card the
real questions properly, because they are more interesting than the invented ones: `eg-114 How the
pyramids were built` and `eg-115 The Diary of Merer` (a genuine logbook kept by a man who hauled
limestone to Giza), `eg-963 Egyptian surveying and orientation` and `eg-964 The astronomical alignment
of Egyptian monuments`, written from the archaeology and the papyri. A card that debunks is a card about
the nonsense; a card that explains is a card about Egypt.

**Race and Egypt.** Egypt's population, and the relationship between Egypt and the rest of Africa, have
been argued about for two centuries in terms that were usually about the arguer. `eg-023 Egypt and its
African context` and the Kush subdeck are written from the archaeology, the linguistics and the ancient
DNA, and they state what the evidence supports and where it runs out. Neither a nineteenth-century
framing nor its mirror image is the register here.

## Dates, names and spellings

**Dates are approximate, and Egyptian chronology is a construct rather than a record.** It is built from
king lists, regnal-year notations, a handful of astronomical observations and radiocarbon, and reputable
scholars date the Old Kingdom decades apart. **Use one published conventional chronology, say that it is
conventional, and give ranges.** Never present a single year for anything before the Late Period as
though it were fixed. Two related cards exist for this: `eg-054 The Egyptian king lists` and `eg-055
Manetho and the dynasties` — the dynasties themselves are a scheme devised in Greek in the third century
BCE, which is worth a reader knowing before the tree files everything by them.

**Names.** The Egyptian script wrote no vowels, so every familiar name is a modern convention. **Use the
Egyptian form as the head word and the Greek or Latin form as an alias** — Khufu not Cheops, Djoser not
Zoser, Amenhotep not Amenophis — except where the Greek form is overwhelmingly the English one
(Thebes, Memphis, Osiris, Isis, the Nile). Ramesses is the spelling used here, with Rameses and Ramses as
aliases. **Alias rows are mandatory the day a term ships**; this collection will need almost as many as
China's.

**Places take the name the scholarship uses, and the card says which is which.** Modern Arabic names
(Giza, Saqqara, Amarna, Deir el-Medina) are the site names; ancient names (Waset, Akhetaten, Men-nefer)
are the Egyptian ones; and Greek names (Thebes, Memphis, Heliopolis) are the ones a reader has met. Where
the choice carries weight, say so in a clause rather than making the point by orthography.

## Sourcing

Egypt is exceptionally well served by open scholarship, and the reason is worth knowing: the field's
foundational corpora are out of copyright and its museums publish. Three notes.

**Reach for museum object records first.** The British Museum, the Metropolitan, the Egyptian Museum in
Cairo, the Petrie Museum, Turin, Leiden and Berlin all publish per-object records with measurements,
provenance and inventory numbers — and for an `object` card that record is usually better than a journal
article, because it is kept by the people holding the thing. This is the site's own batch-8b rule, and
Egypt is where it pays best.

**The nineteenth-century corpora are open and still cited.** The *Description de l'Égypte*, Lepsius's
*Denkmäler*, Petrie's excavation reports and Breasted's *Ancient Records of Egypt* are on archive.org in
full. They are indispensable and they are also period pieces: cite them for what they record — a wall
now lost, an object as found — and not for what they conclude.

**Two kinds of number need a range rather than a figure.** Dates, for the reason above; and population,
where estimates for pharaonic Egypt vary by a factor of two or more between scholars working from
different assumptions about arable land and yield.

## Living beside the other collections

**World History is the survey and never waits for this collection.** Ancient Egypt gets 30 cards there
(`wh-201`–`wh-230`), at survey altitude. Ten sentences on the Old Kingdom is a different card from ten
sentences on the Fifth Dynasty sun temples.

**Egypt meets Greece and Rome head-on in its last four centuries, and both sides are already planned.**
These are the pairs to write deliberately differently:

| subject | in Greece / Rome | here |
|---|---|---|
| Alexander in Egypt | `gr-719`, `gr-721` — the campaign, and an oracle that told a Macedonian he was a god | `eg-562`, `eg-563` — the arrival of a liberator from Persia, and a pharaoh crowned at Memphis |
| Alexandria | `gr-720`, `gr-801`–`gr-804` — a Greek city, its Library and its Museum | `eg-564`, `eg-571` — a capital that governed Egypt and never quite belonged to it |
| the Ptolemies | `gr-766`, `gr-767` — a Macedonian successor kingdom | `eg-565`, `eg-568` — a dynasty of pharaohs who built more surviving temple than any other |
| Cleopatra VII | `gr-876` — the last Hellenistic monarch; `rm-384` — Antony's ally | `eg-603`, `eg-604` — the last pharaoh, and the first Ptolemy said to have learned Egyptian |
| the annexation | `rm-388` — Rome acquires a province | `eg-607` — Egypt acquires an owner, and keeps its temples |
| the grain fleet | `rm-767` — how Rome was fed | `eg-610` — what Egypt was made to grow, and for whom |

Write the card its own collection needs. A reader who has both meets the pair and sees one set of years
from two ends, which is the point.

## Cross-listing

A card may belong to several decks; `subtreeCardIds` dedupes with a `Set` at every branch, so the
collection total stays honest. Each card is listed **once** below, in its primary deck. Cross-list a
second home at writing time where it genuinely earns one — the obvious cases:

- `eg-127 Pyramid Texts`, `eg-156 Coffin Texts`, `eg-764 Book of the Dead` → each other's decks; the
  three are one tradition and the reader should meet them together
- `eg-159`–`eg-163`, the First Intermediate Period literature → also `eg-writing`
- `eg-181 The Story of Sinuhe`, `eg-377 The Report of Wenamun` → also `eg-writing`
- `eg-419`–`eg-425`, Deir el-Medina → also `eg-society`, which is largely written from it
- `eg-590 Rosetta Stone` → also `eg-writing`, beside the decipherment
- `eg-753 Mummification` → also `eg-971`'s neighbours in `eg-science`, for the chemistry

Do not cross-list wholesale. A deck that contains everything relevant is a deck nobody finishes.

## Glossary

The site rule stands: **a new card ships with a cited glossary entry for its own answer term, in the
same commit** (`docs/card-glossary-pairing.md`).

The glossary has **`Egypt` and nothing else** — one country term, written and cited in Phase 3 of the
citation pass. There is no `Pharaoh`, no `Hieroglyph`, no `Mummy`, no `Nile`. Write those **cited from
the start**, at the `GLOSS_SRC_TARGET` bar of 2, rather than opening a backlog to be closed later.

Three traps. **Alias rows are mandatory** — see the naming rule above, and note that the Greek and
Egyptian forms of the same king are both surfaces a reader will type. **A term whose surface is an
ordinary English word** (`Set`, `Nut`, `Ba`, `Ka`, `Aten`, `Maat`) needs `GLOSSARY_CASESENSITIVE` or a
narrower head word, and this collection has a bad case of it: `Set` and `Nut` are gods whose names are
common English words, and `Ba` and `Ka` are two-letter surfaces that would match inside other words
entirely. **And a two-letter or three-letter term should probably not be a head word at all** — prefer
`Ba (Egyptian soul)` or the fuller phrase, and let the short form be an alias only if it can be made
safe.
---

# The list

## Before the Pharaohs

### The Nile before the pharaohs — `eg-prehistory`

    eg-001  Kemet, the Black Land
    eg-002  The Nile
    eg-003  The Nile flood
    eg-004  Upper and Lower Egypt
    eg-005  The Nile Delta
    eg-006  The Faiyum
    eg-007  The Western Desert
    eg-008  The Eastern Desert and the Red Sea
    eg-009  Kharga Oasis and the oasis chain
    eg-010  The African Humid Period
    eg-011  The Sahara
    eg-012  Wadi Kubbaniya
    eg-013  Nazlet Khater
    eg-014  The Gilf Kebir
    eg-015  Gebel Ramlah
    eg-016  Bir Kiseiba
    eg-017  El Omari
    eg-018  Faiyum A culture
    eg-019  Merimde Beni Salama
    eg-020  Kom K and Kom W
    eg-021  Barley
    eg-022  The donkey
    eg-023  Afroasiatic languages
    eg-024  The Levantine corridor
    eg-025  State formation

### Predynastic Egypt — `eg-predynastic`

    eg-026  The Predynastic period
    eg-027  Badarian culture
    eg-028  The Naqada expansion
    eg-029  Naqada I
    eg-030  Naqada II
    eg-031  Naqada III
    eg-032  Contracted burial
    eg-033  Black-topped pottery
    eg-034  Predynastic figurines
    eg-035  The Gebelein predynastic mummies
    eg-036  Hierakonpolis
    eg-037  Tomb 100 at Hierakonpolis
    eg-038  Naqada
    eg-039  Cemetery U at Abydos
    eg-040  Buto
    eg-041  Maadi
    eg-042  Tell es-Sakan
    eg-043  Gebel el-Arak Knife
    eg-044  The ripple-flaked knife
    eg-045  Egyptian faience
    eg-046  Tomb U-j
    eg-047  The year label
    eg-048  Scorpion Macehead
    eg-049  Ceremonial palettes
    eg-050  Narmer Palette
    eg-051  Narmer
    eg-052  Menes
    eg-053  Dynasty 0
    eg-054  Turin King List
    eg-055  Manetho's Aegyptiaca

## The Old Kingdom

### Early Dynastic Egypt — `eg-early-dynastic`

    eg-056  Early Dynastic Period of Egypt
    eg-057  First Dynasty of Egypt
    eg-058  Hor-Aha
    eg-059  Djer
    eg-060  Den
    eg-061  Merneith
    eg-062  Djet
    eg-063  Umm el-Qa'ab
    eg-064  Retainer sacrifice in the First Dynasty
    eg-065  Mastaba
    eg-066  Saqqara
    eg-067  Second Dynasty of Egypt
    eg-068  Peribsen
    eg-069  Shunet el-Zebib
    eg-070  Inebu-hedj, the White Walls of Memphis
    eg-071  Sema-tawy, the Union of the Two Lands
    eg-072  Ancient Egyptian royal titulary
    eg-073  Serekh
    eg-074  The Horus name
    eg-075  Pschent, the Double Crown
    eg-076  Sed festival
    eg-077  The Following of Horus
    eg-078  Jar sealings
    eg-079  Nome
    eg-080  Egyptian stone vessels
    eg-081  Tell el-Farkha and its ivories
    eg-082  Palermo Stone
    eg-083  The cattle count
    eg-084  The epagomenal days
    eg-085  Nilometer
    eg-086  Reed boats
    eg-087  The Abydos boats
    eg-088  Wadi Hammamat
    eg-089  Wadi Maghareh
    eg-090  Gisr el-Mudir

### The Old Kingdom — `eg-old-kingdom`

    eg-091  The Egyptian pyramids
    eg-092  Third Dynasty of Egypt
    eg-093  Djoser
    eg-094  The serdab
    eg-095  Imhotep
    eg-096  The Heb-sed court
    eg-097  Sekhemkhet and the unfinished pyramids
    eg-098  Fourth Dynasty of Egypt
    eg-099  Sneferu
    eg-100  Meidum Pyramid
    eg-101  Bent Pyramid
    eg-102  Red Pyramid
    eg-103  Khufu
    eg-104  Hemiunu
    eg-105  Giza pyramid complex
    eg-106  Khufu ship
    eg-107  Djedefre
    eg-108  Khafre
    eg-109  Pyramid of Khafre
    eg-110  Khafre Enthroned
    eg-111  Menkaure
    eg-112  Pyramid of Menkaure
    eg-113  Heit el-Ghurab
    eg-114  The construction of the Egyptian pyramids
    eg-115  Diary of Merer
    eg-116  Hetepheres I
    eg-117  Khentkaus I
    eg-118  Fifth Dynasty of Egypt
    eg-119  Userkaf
    eg-120  Abu Gorab
    eg-121  Westcar Papyrus
    eg-122  Sahure
    eg-123  Abusir
    eg-124  Abusir Papyri
    eg-125  Nyuserre Ini
    eg-126  Unas
    eg-127  Pyramid Texts
    eg-128  Sixth Dynasty of Egypt
    eg-129  Teti
    eg-130  Pepi I
    eg-131  Pepi II
    eg-132  Autobiography of Harkhuf
    eg-133  Yam
    eg-134  Autobiography of Weni
    eg-135  Overseer of Upper Egypt
    eg-136  Nomarch
    eg-137  False door
    eg-138  Giza West Field
    eg-139  4.2-kiloyear event
    eg-140  Coptos Decrees

### The First Intermediate Period — `eg-first-intermediate`

    eg-141  Heracleopolis Magna
    eg-142  Seventh Dynasty of Egypt
    eg-143  Eighth Dynasty of Egypt
    eg-144  Meryibre Khety
    eg-145  Tenth Dynasty of Egypt
    eg-146  Intef the Elder
    eg-147  Eleventh Dynasty of Egypt
    eg-148  Intef II
    eg-149  Tefibi
    eg-150  Ankhtifi
    eg-151  Khety I
    eg-152  Gebelein
    eg-153  Societal collapse
    eg-154  Dendera
    eg-155  Ancient Egyptian funerary texts
    eg-156  Coffin Texts
    eg-157  Qaw el-Kebir
    eg-158  MMA 507
    eg-159  Complaints of Khakheperraseneb
    eg-160  Admonitions of Ipuwer
    eg-161  Dispute Between a Man and His Ba
    eg-162  Teaching for King Merykara
    eg-163  The Eloquent Peasant
    eg-164  Wepwawet
    eg-165  Aamu
    eg-166  Medjay
    eg-167  C-Group culture
    eg-168  Mentuhotep II
    eg-169  Thinis
    eg-170  Hatnub

## The Middle Kingdom

### The Middle Kingdom — `eg-middle-kingdom`

    eg-171  Prophecy of Neferti
    eg-172  Meketre
    eg-173  Kawit
    eg-174  Mentuhotep IV
    eg-175  Twelfth Dynasty of Egypt
    eg-176  Amenemhat I
    eg-177  Itjtawy
    eg-178  Instructions of Amenemhat
    eg-179  Satire of the Trades
    eg-180  Senusret I
    eg-181  Story of Sinuhe
    eg-182  White Chapel
    eg-183  Amenemhat II
    eg-184  Senusret II
    eg-185  Lake Moeris
    eg-186  El Lahun
    eg-187  The Lahun papyri
    eg-188  Senusret III
    eg-189  Khnumhotep III
    eg-190  Djehutihotep
    eg-191  Wawat
    eg-192  Mirgissa
    eg-193  Buhen
    eg-194  Semna
    eg-195  Semna Despatches
    eg-196  Amenemhat III
    eg-197  Labyrinth of Egypt
    eg-198  Tanite sphinxes
    eg-199  Sobekneferu
    eg-200  Thirteenth Dynasty of Egypt
    eg-201  Loyalist Teaching
    eg-202  The Tale of the Shipwrecked Sailor
    eg-203  Middle Egyptian
    eg-204  Beni Hasan
    eg-205  Meir
    eg-206  Ushabti
    eg-207  Sithathoriunet
    eg-208  Sebek-khu Stele
    eg-209  Execration texts
    eg-210  Royal necropolis of Byblos
    eg-211  Henenu
    eg-212  Serabit el-Khadim
    eg-213  Wah-Sut
    eg-214  Heliopolis
    eg-215  Ikhernofret
    eg-216  Mysteries of Osiris
    eg-217  Dramatic Ramesseum Papyrus
    eg-218  Block statue
    eg-219  Papyrus Brooklyn 35.1446
    eg-220  Amenemhat IV

### The Second Intermediate Period — `eg-second-intermediate`

    eg-221  Second Intermediate Period
    eg-222  Neferhotep I
    eg-223  Fourteenth Dynasty of Egypt
    eg-224  Avaris
    eg-225  Tell el-Maskhuta
    eg-226  Khyan
    eg-227  Against Apion
    eg-228  Fifteenth Dynasty of Egypt
    eg-229  Apepi
    eg-230  Salitis
    eg-231  Tell el-Yahudiyeh Ware
    eg-232  Egyptian chariot
    eg-233  Recurve bow
    eg-234  Khopesh
    eg-235  Sixteenth Dynasty of Egypt
    eg-236  Seventeenth Dynasty of Egypt
    eg-237  Quarrel of Apophis and Seqenenre
    eg-238  Seqenenre Tao
    eg-239  Dra' Abu el-Naga
    eg-240  Kamose
    eg-241  Carnarvon Tablet
    eg-242  Kerma culture
    eg-243  Tombos
    eg-244  The Western Deffufa
    eg-245  Cusae
    eg-246  Ahmose I
    eg-247  Tjaru
    eg-248  Ahmose, son of Ebana
    eg-249  Sharuhen
    eg-250  Pyramid of Ahmose

## The New Kingdom

### The early Eighteenth Dynasty — `eg-early-18th`

    eg-251  Ahhotep I
    eg-252  Eighteenth Dynasty of Egypt
    eg-253  Ahmose-Nefertari
    eg-254  Amenhotep I
    eg-255  Thutmose I
    eg-256  Autobiography of Ahmose Pen-Nekhebet
    eg-257  Thutmose II
    eg-258  Speos Artemidos
    eg-259  Chapelle Rouge
    eg-260  Mortuary Temple of Hatshepsut
    eg-261  Myrrh
    eg-262  Senenmut
    eg-263  Obelisk ship
    eg-264  Seated Statue of Hatshepsut
    eg-265  Festival Hall of Thutmose III
    eg-266  Battle of Megiddo
    eg-267  The Annals of Thutmose III
    eg-268  Retjenu
    eg-269  Djehuty
    eg-270  Kurgus
    eg-271  Viceroy of Kush
    eg-272  Amenhotep II
    eg-273  Thutmose IV
    eg-274  Dream Stele
    eg-275  Amenhotep III
    eg-276  Malkata
    eg-277  Colossi of Memnon
    eg-278  Tiye
    eg-279  Amenhotep, son of Hapu
    eg-280  Kadashman-Enlil I
    eg-281  Rib-Hadda
    eg-282  Tushratta
    eg-283  Suppiluliuma I
    eg-284  Menkheperraseneb I
    eg-285  Burna-Buriash II
    eg-286  Yuya
    eg-287  Amenemhab
    eg-288  Temple of Amada
    eg-289  Puimre
    eg-290  Hapuseneb
    eg-291  God's Wife of Amun
    eg-292  Menhet, Menwi and Merti
    eg-293  Nine Bows
    eg-294  Tomb of Kheruef
    eg-295  Commemorative scarabs of Amenhotep III

### Akhenaten and Amarna — `eg-amarna`

    eg-296  KV55
    eg-297  Tomb of Ramose
    eg-298  Aten
    eg-299  Atenism
    eg-300  Great Hymn to the Aten
    eg-301  Akhetaten
    eg-302  Amarna
    eg-303  Boundary Stelae of Akhenaten
    eg-304  North Riverside Palace
    eg-305  Great Temple of the Aten
    eg-306  Nefertiti
    eg-307  Thutmose
    eg-308  Meritaten
    eg-309  Amarna art
    eg-310  Gempaaten
    eg-311  Mnevis
    eg-312  Meryre
    eg-313  Henotheism
    eg-314  Aziru
    eg-315  Amarna Workmen's Village
    eg-316  South Tombs Cemetery
    eg-317  Royal Tomb of Akhenaten
    eg-318  Kiya
    eg-319  Smenkhkare
    eg-320  Neferneferuaten
    eg-321  Ankhesenamun
    eg-322  Restoration Stela
    eg-323  Maya
    eg-324  KV54
    eg-325  KV62
    eg-326  Anubis Shrine
    eg-327  Tutankhamun's meteoric iron dagger
    eg-328  Chariots of Tutankhamun
    eg-329  Ay
    eg-330  Zannanza
    eg-331  Horemheb
    eg-332  Edict of Horemheb
    eg-333  talatat
    eg-334  Inscription of Mes
    eg-335  Osarseph

### The Ramesside age — `eg-ramesside`

    eg-336  Nineteenth Dynasty of Egypt
    eg-337  Ramesses I
    eg-338  Seti I
    eg-339  Temple of Seti I at Abydos
    eg-340  Abydos King List
    eg-341  KV17
    eg-342  Shasu
    eg-343  Ozymandias
    eg-344  Muwatalli II
    eg-345  Kadesh inscriptions
    eg-346  Egyptian–Hittite peace treaty
    eg-347  Maathorneferure
    eg-348  Pi-Ramesses
    eg-349  Abu Simbel
    eg-350  Ramesseum
    eg-351  Nefertari
    eg-352  QV66
    eg-353  Khaemweset
    eg-354  KV5
    eg-355  Statue of Ramesses II
    eg-356  Mortuary Temple of Merneptah
    eg-357  Merneptah
    eg-358  Merneptah Stele
    eg-359  Battle of Perire
    eg-360  Siptah
    eg-361  Twosret
    eg-362  Twentieth Dynasty of Egypt
    eg-363  Setnakhte
    eg-364  Ramesses III
    eg-365  Medinet Habu
    eg-366  Peleset
    eg-367  Libu
    eg-368  Deir el-Medina strikes
    eg-369  Harem conspiracy
    eg-370  Ramesses VI
    eg-371  Alashiya
    eg-372  Beth Shean
    eg-373  Abbott Papyrus
    eg-374  Mayer Papyri
    eg-375  Ramessesnakht
    eg-376  Herihor
    eg-377  Story of Wenamun
    eg-378  Piankh
    eg-379  Papyrus Anastasi I
    eg-380  Tale of Two Brothers
    eg-381  Papyrus Harris 500
    eg-382  Late Ramesside Letters
    eg-383  Ostracon BM EA 5634
    eg-384  Younger Memnon
    eg-385  Wadi es-Sebua
    eg-386  Nauri Decree
    eg-387  Papyrus Harris I
    eg-388  Beit el-Wali
    eg-389  Turin Papyrus Map
    eg-390  Bentresh Stela

### Thebes, Karnak and the royal tombs — `eg-thebes`

    eg-391  Thebes
    eg-392  Temple of Khonsu
    eg-393  Precinct of Amun-Re
    eg-394  Great Hypostyle Hall
    eg-395  Lateran Obelisk
    eg-396  Sacred lake
    eg-397  Karnak King List
    eg-398  Luxor Temple
    eg-399  Opet Festival
    eg-400  Avenue of Sphinxes
    eg-401  Precinct of Mut
    eg-402  Montu
    eg-403  Theban Necropolis
    eg-404  Meretseger
    eg-405  KV2
    eg-406  KV57
    eg-407  Amduat
    eg-408  Book of Gates
    eg-409  Book of Caverns
    eg-410  KV20
    eg-411  Valley of the Queens
    eg-412  Mortuary temple
    eg-413  Mortuary Temple of Amenhotep III
    eg-414  Deir el-Bahari
    eg-415  Sheikh Abd el-Qurna
    eg-416  Tomb of Rekhmire
    eg-417  Tomb of Nakht
    eg-418  Autobiography of Ineni
    eg-419  Deir el-Medina
    eg-420  Servant in the Place of Truth
    eg-421  Sennedjem
    eg-422  Medical Ostraca of Deir el-Medina
    eg-423  Tomb of Kha and Merit
    eg-424  Naunakhte
    eg-425  Papyrus Salt 124
    eg-426  plumb bob
    eg-427  Gebel el-Silsila
    eg-428  Unfinished obelisk
    eg-429  seked
    eg-430  Royal Cache
    eg-431  KV35
    eg-432  Pentawer
    eg-433  Sokar
    eg-434  Beautiful Festival of the Valley
    eg-435  Migdol
    eg-436  Djeme
    eg-437  Mentuemhat
    eg-438  Nitocris I
    eg-439  Thebaid
    eg-440  El Qurn

## The Later Periods

### The Third Intermediate Period — `eg-third-intermediate`

    eg-441  Ramesses XI
    eg-442  21st Dynasty of Egypt
    eg-443  Tanis
    eg-444  Smendes
    eg-445  El Hiba
    eg-446  Pinedjem I
    eg-447  Psusennes I
    eg-448  Amenemope
    eg-449  silver coffin of Psusennes I
    eg-450  Osorkon the Elder
    eg-451  Meshwesh
    eg-452  22nd Dynasty of Egypt
    eg-453  Shoshenq I
    eg-454  Rehoboam
    eg-455  Bubastite Portal
    eg-456  Osorkon II
    eg-457  Takelot II
    eg-458  23rd Dynasty of Egypt
    eg-459  Tefnakht
    eg-460  Shepenupet I
    eg-461  High Priest of Amun
    eg-462  Sons of Horus
    eg-463  Bab el-Gasus
    eg-464  Cartonnage
    eg-465  Greenfield Papyrus
    eg-466  Statue of Karomama
    eg-467  Hoshea
    eg-468  Osorkon Bust
    eg-469  Battle of Qarqar
    eg-470  Banishment Stela
    eg-471  Bubastis
    eg-472  Serapeum of Saqqara
    eg-473  Apis
    eg-474  archaism
    eg-475  Nimlot of Hermopolis

### Kush and the Twenty-fifth Dynasty — `eg-kush`

    eg-476  Nubians
    eg-477  Lower Nubia
    eg-478  A-Group culture
    eg-479  Ta-Seti
    eg-480  Kerma
    eg-481  Amara West
    eg-482  Heqanefer
    eg-483  El-Kurru
    eg-484  Napata
    eg-485  Jebel Barkal
    eg-486  Kawa
    eg-487  Kashta
    eg-488  Piye
    eg-489  Victory Stele of Piye
    eg-490  Bakenranef
    eg-491  25th Dynasty of Egypt
    eg-492  Shabaka
    eg-493  Shabaka Stone
    eg-494  Taharqa
    eg-495  Shrine of Taharqa
    eg-496  Abar
    eg-497  Nubian pyramids
    eg-498  Sphinx of Taharqo
    eg-499  Eltekeh
    eg-500  Esarhaddon
    eg-501  Sack of Thebes
    eg-502  Tantamani
    eg-503  Arakamani
    eg-504  Amanirenas
    eg-505  Meroitic script

### The Late Period — `eg-late-period`

    eg-506  Late Period of ancient Egypt
    eg-507  Twenty-sixth Dynasty of Egypt
    eg-508  Psamtik I
    eg-509  Necho I
    eg-510  Sais
    eg-511  Tahpanhes
    eg-512  Hellenion
    eg-513  Rhodopis
    eg-514  Necho II
    eg-515  Canal of the Pharaohs
    eg-516  Erythraean Sea
    eg-517  Ashur-uballit II
    eg-518  Battle of Carchemish
    eg-519  Psamtik II
    eg-520  Potasimto
    eg-521  Apries
    eg-522  Amasis II
    eg-523  Neith
    eg-524  Tomb of Ibi
    eg-525  Pefnefdineit
    eg-526  Petition of Peteese
    eg-527  Demotic
    eg-528  Buchis
    eg-529  Tuna el-Gebel
    eg-530  Animal mummy
    eg-531  Battle of Pelusium
    eg-532  Psamtik III
    eg-533  27th Dynasty of Egypt
    eg-534  Aryandes
    eg-535  Statue of Darius
    eg-536  Demotic Chronicle
    eg-537  Temple of Hibis
    eg-538  Udjahorresnet
    eg-539  Inaros II
    eg-540  Sesostris
    eg-541  Rhampsinit
    eg-542  Elephantine papyri
    eg-543  Mibtahiah
    eg-544  Twenty-ninth Dynasty
    eg-545  Amyrtaeus
    eg-546  Thirtieth Dynasty
    eg-547  Nectanebo I
    eg-548  Behbeit el-Hagar
    eg-549  Nectanebo II
    eg-550  Alexander Romance
    eg-551  Thirty-first Dynasty of Egypt
    eg-552  Mentor of Rhodes
    eg-553  Harpocrates
    eg-554  Boston Green Head
    eg-555  Instruction of Ankhsheshonq
    eg-556  Metternich Stela
    eg-557  Khabash
    eg-558  Petosiris
    eg-559  Sonchis of Sais
    eg-560  Mazaces

## Greco-Roman Egypt

### Ptolemaic Egypt — `eg-ptolemaic`

    eg-561  Ptolemais Hermiou
    eg-562  Cleomenes of Naucratis
    eg-563  Siwa Oasis
    eg-564  Rhakotis
    eg-565  Alexander IV
    eg-566  Tomb of Alexander the Great
    eg-567  Ptolemaic cult of Alexander the Great
    eg-568  High Priest of Ptah
    eg-569  Serapis
    eg-570  Serapeum of Alexandria
    eg-571  Lake Mareotis
    eg-572  Aristophanes of Byzantium
    eg-573  Sostratus of Cnidus
    eg-574  Agathocles of Egypt
    eg-575  Machimoi
    eg-576  Menches
    eg-577  Papyrus Revenue Laws
    eg-578  Ptolemaic coinage
    eg-579  Arsinoite nome
    eg-580  Zenon Archive
    eg-581  Kerkeosiris
    eg-582  Ptolemy II Philadelphus
    eg-583  Great Mendes Stela
    eg-584  Battle of Panium
    eg-585  Ptolemy III Euergetes
    eg-586  Canopus Decree
    eg-587  Ptolemy IV Philopator
    eg-588  Great Theban Revolt
    eg-589  Horwennefer
    eg-590  Ptolemy V Epiphanes
    eg-591  Raphia Decree
    eg-592  Mammisi
    eg-593  Temple of Edfu
    eg-594  Dendera zodiac
    eg-595  Philae
    eg-596  Temple of Kom Ombo
    eg-597  House of Life
    eg-598  Manetho
    eg-599  Temple of Onias
    eg-600  Ptolemy VIII Physcon
    eg-601  Ptolemy XI Alexander II
    eg-602  Ptolemy XII Auletes
    eg-603  Ptolemy XIII Theos Philopator
    eg-604  Papyrus Bingen 45
    eg-605  Death of Cleopatra

### Roman Egypt — `eg-roman`

    eg-606  Epistrategos
    eg-607  Battle of Alexandria
    eg-608  Tiberius Julius Alexander
    eg-609  Aelius Gallus
    eg-610  Embole
    eg-611  Laographia
    eg-612  House-by-house census
    eg-613  Gnomon of the Idios Logos
    eg-614  Antinoopolis
    eg-615  Letter of Claudius to the Alexandrians
    eg-616  Alexandrian riots of 38 CE
    eg-617  Kitos War
    eg-618  Periplus of the Erythraean Sea
    eg-619  Berenice Troglodytica
    eg-620  Mons Porphyrites
    eg-621  Mons Claudianus
    eg-622  Legio XXII Deiotariana
    eg-623  Temple of Esna
    eg-624  Temple of Dendur
    eg-625  Soknopaiou Nesos
    eg-626  Fayum mummy portraits
    eg-627  Kom el-Shoqafa
    eg-628  Oxyrhynchus
    eg-629  Oxyrhynchus Papyri
    eg-630  Papyrus Oxyrhynchus 119
    eg-631  Arnouphis
    eg-632  Greek Magical Papyri
    eg-633  Hermeticism
    eg-634  Zosimos of Panopolis
    eg-635  Temple of Isis at Pompeii
    eg-636  Navigium Isidis
    eg-637  Plague of Cyprian
    eg-638  Mussius Aemilianus
    eg-639  Palmyrene invasion of Egypt
    eg-640  Pompey's Pillar

### Christian Egypt and the end — `eg-late-antique`

    eg-641  Rylands Library Papyrus P52
    eg-642  Patriarch of Alexandria
    eg-643  Era of the Martyrs
    eg-644  Coptic language
    eg-645  Shenoute
    eg-646  Nag Hammadi library
    eg-647  Basilides
    eg-648  Kellia
    eg-649  Anthony the Great
    eg-650  Pachomius
    eg-651  Apophthegmata Patrum
    eg-652  Athanasius of Alexandria
    eg-653  Cyril of Alexandria
    eg-654  Coptic Orthodox Church
    eg-655  Theophilus of Alexandria
    eg-656  Graffito of Esmet-Akhom
    eg-657  Blemmyes
    eg-658  Apion family
    eg-659  Muslim conquest of Egypt
    eg-660  Hieroglyphica

## Gods and the Dead

### Gods and religion — `eg-religion`

    eg-661  Interpretatio graeca
    eg-662  Ancient Egyptian deities
    eg-663  Ra
    eg-664  Amun
    eg-665  Theban Triad
    eg-666  Ptah
    eg-667  Osiris
    eg-668  Isis
    eg-669  Horus
    eg-670  Seth
    eg-671  Nephthys
    eg-672  Anubis
    eg-673  Thoth
    eg-674  Hathor
    eg-675  Sekhmet
    eg-676  Bastet
    eg-677  Sobek
    eg-678  Khnum
    eg-679  Nut
    eg-680  Tefnut
    eg-681  Maat
    eg-682  Taweret
    eg-683  Bes
    eg-684  Egyptian temple
    eg-685  Naos
    eg-686  Kyphi
    eg-687  Hem-netjer
    eg-688  Lector priest
    eg-689  Wab priest
    eg-690  Festival of Bubastis
    eg-691  Barque shrine
    eg-692  Dakhla Stela
    eg-693  Offering formula
    eg-694  Ear stela
    eg-695  Sacred ibis
    eg-696  Sacred bull
    eg-697  Djed
    eg-698  Scarab
    eg-699  Apotropaic wand
    eg-700  Heka
    eg-701  Cippus of Horus
    eg-702  Dream Book
    eg-703  Personal piety
    eg-704  Instruction of Kagemni
    eg-705  Hypostyle hall
    eg-706  Khepri
    eg-707  Ra-Horakhty
    eg-708  Daily temple ritual
    eg-709  Reshep
    eg-710  Democratisation of the afterlife

### Myth and cosmology — `eg-myth`

    eg-711  Bremner-Rhind Papyrus
    eg-712  Nun
    eg-713  Benben
    eg-714  Ennead
    eg-715  Shu
    eg-716  Memphite theology
    eg-717  Ogdoad
    eg-718  Atum
    eg-719  Osiris myth
    eg-720  Byblos
    eg-721  Great Hymn to Osiris
    eg-722  Contendings of Horus and Seth
    eg-723  Eye of Horus
    eg-724  Eye of Ra
    eg-725  Festival of Drunkenness
    eg-726  Book of the Heavenly Cow
    eg-727  Solar barque
    eg-728  Apep
    eg-729  Duat
    eg-730  Book of Nut
    eg-731  Akhet
    eg-732  Bigeh
    eg-733  Divine birth
    eg-734  Son of Ra
    eg-735  Isis and the Secret Name of Ra
    eg-736  Distant Goddess
    eg-737  Horus of Behdet
    eg-738  Diodorus Siculus
    eg-739  On Isis and Osiris
    eg-740  Historiola

### Death, burial and the afterlife — `eg-death`

    eg-741  Ancient Egyptian funerary practices
    eg-742  Ib
    eg-743  Ka
    eg-744  Ba
    eg-745  Akh
    eg-746  Ren
    eg-747  Imperishable stars
    eg-748  Aaru
    eg-749  Weighing of the heart
    eg-750  Hall of the Two Truths
    eg-751  Negative Confession
    eg-752  Ammit
    eg-753  Per-nefer
    eg-754  Ritual of Embalming
    eg-755  Natron
    eg-756  Paraschistes
    eg-757  Canopic jar
    eg-758  Opening of the Mouth
    eg-759  Tekenu
    eg-760  Mummy board
    eg-761  Anthropoid coffin
    eg-762  Sarcophagus
    eg-763  Mummy mask
    eg-764  Papyrus of Ani
    eg-765  Heart scarab
    eg-766  Books of the Netherworld
    eg-767  Funerary cone
    eg-768  Pyramid complex
    eg-769  Rock-cut tomb
    eg-770  Tomb of Perneb
    eg-771  Slab stela
    eg-772  Djefaihapi
    eg-773  Offering list
    eg-774  Raemkai
    eg-775  Senebtisi
    eg-776  Overseer shabti
    eg-777  Servant statue
    eg-778  Abutiu
    eg-779  Soul house
    eg-780  Memphite Necropolis
    eg-781  Leopold-Amherst Papyrus
    eg-782  Coffin reuse
    eg-783  Schistosomiasis
    eg-784  Pott's disease
    eg-785  Djeret
    eg-786  Letters to the dead
    eg-787  Akh iqer en Ra
    eg-788  Ancestor bust
    eg-789  House of eternity
    eg-790  Books of Breathing

## Kingship, State and Society

### Kingship and the state — `eg-kingship`

    eg-791  Prenomen
    eg-792  Window of Appearance
    eg-793  Nebty name
    eg-794  Cartouche
    eg-795  Crook and flail
    eg-796  Deshret
    eg-797  Uraeus
    eg-798  Presentation of Maat
    eg-799  Smiting scene
    eg-800  Great Royal Wife
    eg-801  Nitocris
    eg-802  Iry-pat
    eg-803  Coregency
    eg-804  Royal harem
    eg-805  Vizier (Ancient Egypt)
    eg-806  Overseer of the Treasury
    eg-807  Papyrus Lansing
    eg-808  Overseer of the Granaries
    eg-809  Tomb of Menna
    eg-810  The Wilbour Papyrus
    eg-811  Legal Code of Hermopolis
    eg-812  Kenbet
    eg-813  Rhinocolura
    eg-814  Metjen
    eg-815  Haty-a
    eg-816  Walls of the Ruler
    eg-817  Uronarti
    eg-818  Sherden
    eg-819  Mace
    eg-820  Battle of the Delta
    eg-821  Gilukhipa
    eg-822  TT40
    eg-823  Usurpation of monuments
    eg-824  Topographical list
    eg-825  Netjer nefer

### Society and everyday life — `eg-society`

    eg-826  Egyptian kinship system
    eg-827  Gold of honour
    eg-828  Harvest scene
    eg-829  Overseer of craftsmen
    eg-830  Meret
    eg-831  Adoption Papyrus
    eg-832  Nebet per
    eg-833  Brother–sister marriage
    eg-834  Papyrus Turin 2021
    eg-835  Sidelock of youth
    eg-836  Kemit
    eg-837  Beautiful name
    eg-838  Lit clos
    eg-839  Niwt
    eg-840  Headrest
    eg-841  Onion
    eg-842  Pefsu
    eg-843  Zythos
    eg-844  Shendyt
    eg-845  Wig
    eg-846  Kohl
    eg-847  Broad collar
    eg-848  Sistrum
    eg-849  Muu dancers
    eg-850  Hounds and jackals
    eg-851  Senet
    eg-852  Throwstick
    eg-853  Hippopotamus
    eg-854  Cat
    eg-855  Sycamore fig
    eg-856  Baris
    eg-857  Abu Ballas Trail
    eg-858  Wag festival
    eg-859  Head cone
    eg-860  Turin Satirical-Erotic Papyrus
    eg-861  Heqanakht papyri
    eg-862  Oracle of Amenhotep I
    eg-863  Caromemphites
    eg-864  Whyt
    eg-865  Life expectancy

### Land, trade and the economy — `eg-economy`

    eg-866  Redistribution
    eg-867  Ard
    eg-868  Basin irrigation
    eg-869  Peret
    eg-870  Shaduf
    eg-871  Basilike ge
    eg-872  Satrap Stela
    eg-873  Emmer
    eg-874  Hekat
    eg-875  Kite
    eg-876  Deben
    eg-877  Hacksilver
    eg-878  Shuty
    eg-879  Tomb of Nebamun and Ipuky
    eg-880  Flax
    eg-881  Cyperus papyrus
    eg-882  Potter’s wheel
    eg-883  Tura
    eg-884  Wadi el-Hudi
    eg-885  Wadi Allaqi
    eg-886  Timna Valley
    eg-887  Cedar of Lebanon
    eg-888  Mersa Gawasis
    eg-889  Elephantine
    eg-890  Oxhide ingot

## Writing, Art and Knowledge

### Writing and literature — `eg-writing`

    eg-891  Egyptian language
    eg-892  Ptolemaic hieroglyphs
    eg-893  Phonetic complement
    eg-894  Determinative
    eg-895  Hieratic
    eg-896  Old Coptic
    eg-897  Coptic alphabet
    eg-898  Late Egyptian
    eg-899  The decipherment of Egyptian hieroglyphs
    eg-900  Scribal palette
    eg-901  Prisse Papyrus
    eg-902  Ostracon
    eg-903  scribe
    eg-904  sebayt
    eg-905  literacy
    eg-906  Immortality of Writers
    eg-907  wisdom literature
    eg-908  Maxims of Ptahhotep
    eg-909  Instruction of Any
    eg-910  Instruction of Amenemope
    eg-911  Taking of Joppa
    eg-912  Tale of the Doomed Prince
    eg-913  Punt reliefs
    eg-914  Harper's Songs
    eg-915  Hymns to Senusret III
    eg-916  Hymn to the Nile
    eg-917  Cairo Vase
    eg-918  Lamentations of Isis and Nephthys
    eg-919  Bakenkhonsu
    eg-920  Königsnovelle
    eg-921  model letter
    eg-922  Calendar of Lucky and Unlucky Days
    eg-923  Onomasticon of Amenope
    eg-924  House of Books
    eg-925  colophon
    eg-926  papyrus roll
    eg-927  Inaros–Petubastis cycle
    eg-928  Setne Khamwas and Si-Osire
    eg-929  Oracle of the Potter
    eg-930  Ramesseum Papyri

### Art and architecture — `eg-art`

    eg-931  Ancient Egyptian art
    eg-932  hierarchical proportion
    eg-933  canon of proportions
    eg-934  Mastaba of Ti
    eg-935  sunk relief
    eg-936  Meidum Geese
    eg-937  Egyptian blue
    eg-938  Rahotep and Nofret
    eg-939  copper statues of Pepi I
    eg-940  Kaaper
    eg-941  Egyptian colossal sculpture
    eg-942  Sphinx
    eg-943  Figured ostraca and artists' sketches
    eg-944  Egyptian woodwork
    eg-945  Egyptian metalwork
    eg-946  Egyptian glass
    eg-947  Egyptian glazed ware
    eg-948  Egyptian furniture as art
    eg-949  The Egyptian artist and the workshop
    eg-950  Style and change in Egyptian art
    eg-951  cavetto cornice
    eg-952  mudbrick
    eg-953  sandstone
    eg-954  Hathor column
    eg-955  Pylon
    eg-956  primeval mound
    eg-957  obelisk
    eg-958  dromos
    eg-959  Temple of Derr
    eg-960  Palace of Apries
    eg-961  Kumma
    eg-962  foundation deposit
    eg-963  Seshat
    eg-964  merkhet
    eg-965  winged sun
    eg-966  lapis lazuli
    eg-967  Bek
    eg-968  Trajan’s Kiosk
    eg-969  Pyramid of Cestius
    eg-970  Egyptomania

### Science, medicine and technology — `eg-science`

    eg-971  Egyptian mathematics
    eg-972  Egyptian numerals
    eg-973  Egyptian fraction
    eg-974  Rhind Mathematical Papyrus
    eg-975  Moscow Mathematical Papyrus
    eg-976  aroura
    eg-977  Ancient Egyptian units of measurement
    eg-978  Cubit
    eg-979  Egyptian astronomy
    eg-980  Egyptian civil calendar
    eg-981  Sothic cycle
    eg-982  Decan
    eg-983  water clock
    eg-984  unequal hours
    eg-985  Ancient Egyptian medicine
    eg-986  swnw
    eg-987  Edwin Smith Papyrus
    eg-988  Ebers Papyrus
    eg-989  splint
    eg-990  castor oil
    eg-991  Hesy-Ra
    eg-992  Papyrus Berlin 3027
    eg-993  bow drill
    eg-994  adze
    eg-995  mortise and tenon
    eg-996  Dahshur boats
    eg-997  cobalt glass
    eg-998  electrum
    eg-999  Chaeremon of Alexandria
    eg-1000 Book of Thoth
