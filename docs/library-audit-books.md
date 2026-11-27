# The Library audit of November 2026 — what was found in each book

Generated from the reviewers' verdict files of the audit (see `library-audit.md` for the method, the
tools and what to do with a new book). One section per book, in shelf order. **Applied** is the number of
rows in `.claude/book-emend.json` (every one is in the shipped file); **held** is the number waiting in
`.claude/book-emend-probable.json` for a page to be read; **links off** is what `.claude/book-gloss-off.json`
switches off, book-wide + in particular chapters. The notes under each book are the reviewer's own: the
faults that repeat (and would want a rule or a better source, not a row), and how the sampled pages read.
A count in a note is the reviewer's measurement at the time; the rows applied since have lowered many.

**Read it by grepping for a book id.** Not part of the site.

## `seneca-letters` — Letters from a Stoic, Seneca

Applied: **32** · held: 3 · links off: 10 + 2 per chapter

**How it reads.** Four samples (letters 33, 74, 92, 117) read cleanly: section numbers are in place, quotation marks curly and consistent, italics kept. One stray comma found by reading. The faults are concentrated in the notes (typos and collapsed verse quotations), not in the letters.

**What repeats.**

- Verse quoted in the editor's notes lost its line breaks, gluing the last word of one line to the first of the next (and the quotation to the prose around it): 10 notes, 24 joins, all in ch41 n1, ch77 n5, ch88 n30, ch90 n3/n8/n13/n27, ch91 n12, ch100 n3, ch102 n6 — e.g. 'priusquamTellus', 'pinumPlaustra', 'Oluspraedia', 'laetus sumlaudari'. All are listed above with a space restored; the better repair is in the importer (keep a <br> for a line break inside a note's block quotation). The letters' own text is free of it.
- The editor's (Gummere's) notes carry a layer of modern typing slips not in the letters themselves: artifically, indispensible, preceeded, prominant, inadvertantly (5, all listed).

**Looks wrong and is right.** Latin quoted in notes is otherwise sound: 'Sed fortuna fuit', 'laudato viro', 'quid, mea cum pugnat sententia secum?', 'Flava Ceres, tibi sit …', 'diurna mercedula', 'patefacta vias' · major-domo, longsuffering, sausageman, richlier (verse) are the translator's forms · ch92 §30 'But He in whose body virtue dwells, and spirit E'er present is equal to the gods' is a verse quotation run into the sentence by design · So-and-so / So-and-So and Fellow-Men / FELLOW-MEN differ only in capitals (a title against running text) · Scan list (wards, hound, lakes a-din, dally, marrow, iudex, Plaut., Celts, bills and coos …) — all correct

**Links.** Few faults: Seneca's 'Caesar' is whichever Caesar the anecdote needs (six of fourteen chapters are Caligula, Tiberius or Drusus), and a handful of namesakes and capitalised common words. The Loeb footnotes are in the linked text but raise nothing further.

## `marcus-aurelius-meditations` — Meditations, Marcus Aurelius

Applied: **10** · held: 0 · links off: 2 + 3 per chapter · 1 link(s) left open

**How it reads.** Both samples (Book V 20-31, Book X 33-38) read cleanly: section numbers in bk-n spans, italics for the quoted speech, Greek intact in the notes. An apostrophe is stored as the entity &#39; in a few places ('Tis, 'thyself'), which renders correctly. A light scattering of scan misreadings, all found by the candidate lists plus two real-word ones ('heaver', 'limit from limb').

**Looks wrong and is right.** Old spellings inside quotations from Florio's Montaigne in the notes: returne, seene, contemne — correct as quoted · Haines's vocabulary: unthwartable, descensive / ascensive, etherialized, usedst, congiaria, 'an abject', shew, quotha · goodnatured (twice, ch10 and ch11), truthteller, cowdung stand without a hyphen — consistent, so left as the edition's forms (possibly lost hyphens; not certain enough to list) · Abbreviations in the notes (cp., sc., Capit., Vit. Mar., Nab., mss.) are followed by lower case by design; '=' in notes is the editor's own sign; square brackets in the text are his supplements ([From Plato.], [as is the case with the Christians]) · Scan list (night, mariner, shore, hound, abject, beard, qualifies) — all correct

**Links.** 53 keys read. The emperors, philosophers and places are the right ones; the faults are two namesakes, a verb and a family name.

**Links left open.** `Atom` — "Either Providence or Atoms" (ch4, ch8) is the Epicurean doctrine of atoms and chance; the entry describes the modern atom of nucleus and electrons. Same word and ancestor idea, but the entry would ne

## `sun-tzu-art-of-war` — The Art of War, Sun Tzu

Applied: **5** · held: 0 · links off: 0 + 0 per chapter

**How it reads.** The thirteen chapters' main text reads cleanly apart from the two typos in ch6; the slips are a typist's, mostly in Giles's notes. Verse numbers and footnote markers are regular.

**What repeats.**

- Romanisation is mixed: the edition has been converted to pinyin (Zhang Yu x129, Cao Cao, Cao Gong, Guan Zhong) but Wade-Giles survivors remain in the notes, e.g. 'Ch‘ang Yü’s' (ch11 n35, the same man as Zhang Yu), 'Chuang Tzŭ’s' / 'Lao Tzŭ’s' (ch9 n22, ch12 n18), 'Liu Pei' (ch7 n11), 'Fu Yen-ch‘ing', 'Hsieh An', 'Ching-hsing pass'. Not listed as fixes - it needs a decision by rule, not word by word.

**Looks wrong and is right.** French and German quotations in the notes (Maximes de Guerre; Frederick: 'Zu allem diesem...') are correct · 'sqq.', 'li', Chinese characters and transliterations are correct · 'impassible for chariots' (ch9 n30) is Giles's word · ch6 v.20 the exclamation mark after 'li' is stored as the entity &#33; - it renders as '!' and is harmless, but is the only such entity in the book

**Links.** All 4 keys read; none wrong.

## `plato-republic` — The Republic, Plato

Applied: **86** · held: 15 · links off: 1 + 0 per chapter · 1 link(s) left open

**How it reads.** The three samples (Books III, VI, IX) read cleanly as prose: one stranded full stop ('political. service') and two unpunctuated question-ends in 13,500 characters, nothing in the Stephanus numbering or the dialogue layout. The translation text is nearly clean (13 faults found in all, five of them lost end-punctuation); the notes are where the transcription is careless.

**What repeats.**

- Data-entry slips in Shorey's NOTES (the Perseus transcription was keyed by hand, not scanned): about 60 misspelt English words and names in the notes of all ten books, all listed as fixes — e.g. charcteristic, temperamnets, understandiong; 'defintion(s)' alone 7 times. They are each different, so no rule fixes them; a dictionary pass over the notes for words seen 3+ times found only 'defintion'.
- Capital I for small l in the notes, 15 instances (all listed): French 'Ia' for 'la' 11 times (Ia faiblesse, Ia République, Ia sphère), and DieIs, ApeIt, radicaIs, pIebem. A rule '\bIa\b -> la' in the notes is safe for this book: 'Ia' occurs nowhere else.
- Closing punctuation lost at the end of a speech, 5 instances in Books VI and IX (all listed): three questions with no question mark before a note marker (void of sense / evil surroundings / a neutral state) and two replies with no stop (Precisely so / It seems so).
- French and German quotations in the notes are printed without most of their accents and with slips (ches, livée, sonterrain, pent, not gouvernements, nic); the nine plain ones are listed, the missing accents (reflechi, Pensees, commodite, Staats-Altertumer) are left as the edition's.

**Looks wrong and is right.** Shorey's own coinages and technical words in the text: boniform, doxophilists, timarchy, pempad, periact, shipcraft, storymakers, undergirders, unselfcontrolled, intelligibles, chastize(d), wasn't — all right. · American spelling throughout (honor, favor, practise/practice, judgement beside judgment) — the edition's. · Old English and French quoted in notes as printed: Chaucer (telle, neighe, speke, cosin, dede), Basilicon Doron (meete yee, militarie, Mathematickes), Rabelais and Montaigne (beste, sceur, communicquer, deport, blecées, Ainsin). · Latin, French and German quotations and abbreviated titles (De divin., De benef., De myst., An seni resp., Acad., ppl., leit-motif, epistates, trittys, daimonion) — right. · Names that look like slips but are real: Tayler Lewis, Ziller, J. A. K. Thomson, Norvin, Mozley, Havet, Heraclitus beside Heracleitus (both stand in the edition). · 'little by little by thrift' (ch8) and 'goes wrong goes wrong' (ch1) are grammatical repetitions, not dittography. · 'millenium' (ch4 note), 'Cf.' capitalised in mid-sentence, '(102 cf.)', 'Budé e.', the garbled Lucilius line 'nolueris et debueris te si minu' (ch6 note 193) and the half-quoted 'the ’how.’' (ch3 text): doubtful or the source's own; not changed.

**Links.** A clean book: Shorey's translation names the poets, gods, heroes and cities the glossary means, and the people of the dialogue with entries (Socrates, Lysias, Nicias as Niceratus's father, Thrasymachus's Chalcedon) are the right ones.

**Links left open.** `Lydia` — ch2 'Gyges the Lydian' is right; in ch3 the word is the name of musical modes ('the mixed Lydian', 'the tense or higher Lydian') — named after the country, but not about it. The same holds for the sin

## `plato-dialogues` — The Dialogues, Plato

Applied: **19** · held: 1 · links off: 21 + 4 per chapter · 3 link(s) left open

**How it reads.** The ten samples (Phaedo, Sophist, Philebus, Phaedrus, Euthydemus, Gorgias, Timaeus, Laws x2, Letters) read cleanly — no garbage, no stray numbers beyond the styled Stephanus page spans, American spelling of the Perseus Loeb text throughout. The faults are isolated typist's slips (concentrated in the Sophist and the Letters' notes) plus the inline 'Hom. Il. 14.291'-style references left in the prose.

**What repeats.**

- Inline source references of the Perseus edition are printed in the running prose straight after a quotation, usually with no space after the closing quote: about 62 in the text of 20 dialogues (Cratylus 9, Laws 8, Protagoras-group chapters 14/22/26/27 several each). Examples: ch5 'gods call Xanthus, but men call Scamander</q>Hom. Il. 20.74?'; ch19 'shame is no good mate for a needy man.</q> Hom. Od. 17.347 So let us not mind'; ch5 'guardians of mortal men.</q>Hes. WD 122 ff</p>'. They are the edition's <bibl> tags flattened into the sentence (regex: (Hom/Hes/Pind/Aesch/Soph/Eur/Aristoph/Theog)\w*\. (Il/Od/WD/…)\.? \d[\d.]*). They should become notes or at least be set off (space + brackets/small type); not listed one by one.
- Speaker labels are abbreviated and unstyled in the prose ('Theaet.', 'Str.', 'Soc.', 'Pro.', 'Ath.', 'Clin.') and each Stephanus page number is followed by a repeated label ('<span class="bk-n">106</span> Phaedo.' where 'Phaedo.' is the narrator label repeated at every page) — consistent, the edition's own, no fix proposed; noted only as a formatting fact.

**Looks wrong and is right.** Compounds the Loeb translators write solid are right: afterdays, bondsmaid, crosswalls, draughtsboard, eyesalve, firestream, harpstrings, housebuilders, landcircles, namemaker/namegiver(s), neckhold, seafight, terrorstricken, truthspeaking, snubnosedness · oftimes (Laws, Hesiod quotation) — archaic variant of ofttimes, leave · Transliterated Greek and coinages: mantike, oiesis, historia, oionoistic/oionoistike/oionistic, phix, chalcis, cymindis, pyrrhiche, emmeleia, plethron/plethrum, proxeni, prytanes/prytany, choes, amphidromia, citharoedic, theatrocracy, tridentry, imprescribable, quail-filliper, fellow-spherists, illuditas (the note's own Latin coinage beside unitas) · Latin and reference abbreviations in notes: De nat. deor., De caelo, foll., Soph. Phil., auri sacra fames, experientia docet, desultor, pupilla, volgus, per annum, hemi-cylindrical, circum-ambient · opisthotonus, dithyrambics, Mestor (Critias name) are correct · Scan-list real words all checked and right in context: tetters, hales, banes, cautions (Laws 917: 'laws and cautions of the market-stewards'), contentions, electron (amber), fractious, patent, concert, staves, goads

**Links.** Mostly Athenian namesakes among Socrates' circle (Thucydides son of Melesias, Aeschines of Sphettus, Antiphon, Lysimachus, the young Hippocrates, Hippias of Elis linked to the tyrant), mythical figures linked to moons, plays or a later politician, and capitalised common words (Dog, Month, Nomes, Elders).

**Links left open.** `Embassy` — an occasional deputation sent from Athens to Syracuse (Letter 7); the entry is the modern permanent mission and its building — same word, loosely the same idea · `Oracle_of_Ammon` — right in Alcibiades II and the Laws (the oracle); in the Statesman it is an oath 'by Ammon' and in the Phaedrus the god Ammon/Thamus at Egyptian Thebes — the god rather than the oracle at Siwa · `Academy` — in the Lysis Socrates walks from 'the Academy', the public gymnasium and grove, years before the school of c. 387 BCE that the entry describes — same place, different thing

## `ovid-metamorphoses` — Metamorphoses, Ovid

Applied: **21** · held: 2 · links off: 36 + 9 per chapter · 3 link(s) left open

**How it reads.** Both samples (the Lycian peasants and Marsyas in VI; Polyphemus's song in XIII) read as clean blank verse with Perseus line numbers at paragraph heads; one wrong word found by reading ('corners' for cornels). No apparatus, no garbage.

**What repeats.**

- Proper names lower-cased when they begin a verse line, 13 found by comparing line-initial words with the rest of the book (argus, bootes, actaeon, thisbe, leucothea's, perseus, aconteus, medusa, jove, antaeus, laomedon, daedalion, greek) — all listed. More's verse does not capitalise line heads, and whoever keyed it lower-cased these with them; a name that occurs nowhere else in the book could still be hiding.

**Looks wrong and is right.** Brookes More's poeticisms and coinages (1922): felicit, odourate, radescent, shadowous, ivorine, transpeciated, compellant, strickened, schemist, afterwhile, newformed, halfgoat, wingfoot, tearless orbed, mazey, margent, reguerdon, sware, wroth · Spellings that may be slips but recur or are attested variants, left alone: excell (x2), compell, skilfull, patroled, mirey, troup, ozier/oziers, mastick, ax · divedapper, sailyards, trabea, carchesian goblets, snaggle teeth, Northwind — real words · naiads and dryads in lower case (dryads is lower-case elsewhere too); River-god x1 beside River-God x4 · 'Ee-woh-ee-e!' is the Bacchic cry as More spells it; Leucothea (for Leucothoe) is More's form throughout Book IV · scan.txt: every pair is right as it stands except hones, Mereury and lanquid (fixed)

**Links.** Capitalised line-openings in the verse translation produce common-word links (Aha, Afar, Shouts, Forgetting, Month); otherwise the usual mythological namesakes, eponyms linked to their cities, and plays or battles linked from a hero's or river's name.

**Links left open.** `Titans` — every use is the singular 'Titan' as a name for the Sun god (and 'Titan's daughter' for Circe); the entry is the Titans as a generation — related, but it does not say who is meant · `Palace_of_Nestor` — 'the plains of Pylos' and Nestor's Pylos are linked to the excavated Mycenaean palace at Ano Englianos — the conventional identification, but an archaeological site rather than the legendary town · `Orchomenos` — 'fertile Orchomenus' stands in a list of mostly Peloponnesian cities (6.416); it may be the Arcadian town rather than the Boeotian one

## `suetonius-twelve-caesars` — The Twelve Caesars, Suetonius

Applied: **94** · held: 28 · links off: 26 + 16 per chapter · 2 link(s) left open

**How it reads.** The two set samples (Tiberius, Otho) and a third from Caligula read as clean Thomson/Forester prose, but the book is unevenly scanned: Julius, Galba, Otho, Vitellius and Titus are nearly clean, while parts of Augustus, Tiberius, Caligula, Claudius, Nero, Vespasian and Domitian carry dense OCR damage (non-words, split and fused words, stray punctuation, one Greek title left in beta code). Italic terms are followed by a space before the comma in plain text only because of the tags; that is not a fault.

**What repeats.**

- Stray punctuation from scan specks, about 45 places, concentrated in chapters 2-6 and 10-12 (Augustus to Nero, Vespasian, Domitian) and their notes: a full stop in the middle of a sentence before a lower-case word ('but. as Caius', 'gold. silver, gems. pearls', 'pleading the. cause'), a full stop, comma, hyphen or apostrophe glued to a word ('public.enemies', 'in ,cars', 'and- a party', "his'mouth"). No safe rule separates them from the notes' many abbreviations (Annal. xiv., Hist. ii.), so every one found is listed in fixes rather than five.
- '&c.' printed as a bare 'c.' — the ampersand was dropped by the source's markup — 8 places, all in notes (ch4 n41, n52; ch5 n8; ch6 n37; ch8 n12; ch9 n4; ch10 n48; ch11 n14), e.g. 'four hundred and ten panthers, c. A rhinoceros', 'Rhea, Ops, Vesta, Magna, Mater, c.', 'for aurum, gold, c.'. Elsewhere the same abbreviation appears as 'etc.' (12 times). All 8 are listed as probable fixes to 'etc.'.
- Compound words that lost their hyphen and now stand as one word, 8 places: stageplayers (ch2), letterspatent (ch3), lightarmed (ch4), gleegirls (ch6), lefthand (ch7), halfburnt, winterquarters (ch12), byeword (ch5 n75, left alone). The hyphenated forms stage-players, letters-patent, light-armed, left-hand stand elsewhere in the same book.
- The ligature Æ: the book writes it 'AE' (AEmilius, AEtna, AEnobarbi); four places misread it (',Elianus' ch2, 'aEsculapius' ch2, 'AFlius' ch3, ',Enobarbus' ch6) — all listed.

**Looks wrong and is right.** 'desight' (ch10, 'being a great desight to the city') is a real obsolete word for an eyesore — Thomson's own; not a slip for 'delight'. · Period spellings: aera, befal, journies, humourists, pretorium/pretorian, questorian, shewn, cotemporary, dispatch. · Latin and Greek in text and notes (familiae, vel, hunc, eris, capit, venit, morari, puerae, puelli, plostra/plostrum, orum for aurum, monopolium, bombi, crepide, decuriae, evocati, braccae, carceres, RHEDA, contubernium, juvenalis, municipia, the verse quotations) are correct as quoted. · 'Suetonius Lenis' (ch8) and 'Servius Georgius' (ch5 n32) are the translator's and annotator's own forms; 'angusticlavian tribune' is right. · Scan-file real words that are right in place: gamed (we gamed at supper), stale oil, clown, giants, dearly beloved, foiled, conceited, locking, Oppian law, Itium, Pales, contusion, block (the executioner's). · Spaces before '?' and '!' inside quotations ('Be it so !', 'who he was ?') and a space after an opening quotation mark are the source's typography, not listed. · Three citation numbers are visibly mis-scanned but the true figure cannot be recovered from the text: 'lib. ii. p. x6' (ch6 n65), 'cc. xxviii. and xciL' (ch4 n28), 'Hist. xi 24' (ch8 n17). Left alone. · ch6 text: "'Tis too late; and "Is this your loyalty ?" lacks a closing quotation mark after 'late;' — punctuation, not listed. ch12 'expelled -he having' is a dash printed as ' -', left alone.

**Links.** 272 keys read. The book's own subject causes its main fault: Caesar, Claudius, Nero, Titus and Germanicus are family names and titles in every Life before the one that bears them, and the reader links the first mention in each chapter — verified for Julius_Caesar, whose ten links are exactly the first "Caesar" of ten Lives. Where most chapters are wrong (Titus: seven of nine) the chapters are still listed, so the emperor's own Life keeps its link.

**Links left open.** `Otho` — in ch7 the first mention is "Salvius Otho, father to the emperor of that name"; the emperor himself fills the rest of that chapter, so switching it off there costs a right link later · `Tiberius` — in ch5 the first mention is Claudius' own name ("He was named Tiberius Claudius Drusus"); the emperor appears throughout the rest of the chapter

## `tacitus-annals` — The Annals, Tacitus

Applied: **1** · held: 0 · links off: 40 + 18 per chapter · 2 link(s) left open

**How it reads.** Both samples (Book 4 and Book 14) read cleanly, with section numbers in place and ligatures (Rhœmetalces, Poppæa) intact. A long book with one confirmed scan slip; the 33 scanner candidates are all right readings.

**Looks wrong and is right.** Church & Brodribb's spellings are right: pryed, scymitar, stupified, biassed, head-quarters, intrusted, freespoken / freespokenness, terrorstricken, neverending, goodnaturedly · Latin and technical words: ases, augurate, legatus, crupellarii · 'Senate-house' x9 beside 'Senate-House' x2 - capitalisation only · Veianius Niger, Caius Oppius, Liber are real names, not slips for Veranius / Appius / Tiber

**Links.** 257 keys read. As in Suetonius, a cognomen or praenomen that later became an emperor's name is the commonest fault (Nero, Vitellius, Otho, Nerva, Titus, Claudius), and Tacitus' senators carry famous republican and literary cognomina (Varro, Regulus, Camillus, Plautus, Ennius, Propertius, Strabo, Florus). Chapter numbers are book numbers (1–6, 11–16); verdicts go by the first mention in each.

**Links left open.** `Tiberius` — in ch5 the first mention is "Tiberius Nero", Livia's first husband and the emperor's father; the emperor follows at once and fills the chapter, so switching it off there costs a right link · `Augustales` — ch1 and ch2 mean the sodales Augustales, the senatorial priesthood of the deified Augustus founded in 14 CE (and, in ch1, the games called Augustales); the entry describes the Augustales of the Italia

## `plutarch-lives` — Parallel Lives, Plutarch

Applied: **141** · held: 21 · links off: 91 + 76 per chapter · 2 link(s) left open

**How it reads.** The ten samples read as clean, idiomatic Perrin (Loeb) prose; in about 45,000 characters they held three faults ('bade them keen quiet', 'He himself; however', a stray 'XIII'), which at the book's 4.2 million characters points to a few hundred small scan faults overall, concentrated in some Lives (Coriolanus, Pelopidas, Marcellus, Flamininus, Pyrrhus, Marius, Lysander, Lucullus, Nicias, Crassus, Antony) while others are nearly clean. Because most of the slips are real words (arid, hut, tile, be/he), the lists here come from pattern searches over the whole text rather than from the dictionary candidates, and they are certainly not complete. Quotation marks are carried by <q> tags and section numbers by bk-n spans; both behave consistently.

**What repeats.**

- Scan confusions that yield REAL words, so no spelling check sees them (about 65 found, listed singly; more certainly remain). The recurring ones could be swept by rule with a human eye on each hit: 'arid' for and (15; only 'waterless and arid' x2 is genuine), 'hut' for but (6 of 12 hits), 'tile' for the (4, all in Pyrrhus), 'riot' for not (3), 'hack' for back (3), 'bad' for had (4), 'be' for he (5) and 'he' for be (5), 'lull' for hill (2), 'air' for an (2), 'Cams' for Caius (2). Examples: 'bore him, arid her secret meetings', 'a hill which had hut one ascent', 'that it might he captured'.
- A comma after the letter f read as a semicolon (14 listed): 'He himself; however, did not abide', 'while he himself; with a few companions, rode', 'humiliated, if; contrary to his nature'. Worth a rule on '-self; however/who/with/after/marching' and a look at every 'f;' before a lower-case participle.
- Space lost after a full stop or comma (12 listed): 'slaying them.And', 'going to war.When', 'Peirithous,journeyed', 'success,he'. Four of them are in Marcellus (ch22).
- Line-break hyphens left with a space (12 listed, all of them): 'any- thing', 'over- whelmed', 'pro- visions'. The opposite fault, a compound whose hyphen was dropped at a line end, also occurs (about 12): socalled, bedsack, leatherworkers, lampstands, storymaker, townhall(s) are listed; cockpartridge, tabletalk, tentmate, archmime, inwardbound have no hyphened twin in the book and are left for a decision.
- A chapter's Roman numeral left after the section number in 5 places: '15 XV. A similar fortune', '13 XIII After the battle', '23 XXIII. It was evening', '20 XX, He was', '23 XXIII. Lucullus'.
- Formatting, not listed as fixes: 250 quotations open with '<q> ' and 250 close with ' </q>' (a space inside the tag, chiefly round verse: '<q> How shall a bird that preys on fellow bird', 'unperverted decrees. </q>', '<q> <i>peculium</i>,</q>'), which sets the quotation mark apart from its words wherever <q> draws one. One rule (trim the space after <q> and before </q>) would clear them.

**Looks wrong and is right.** Transliterated Greek and Latin quoted for their own sake, all correct: anekathen, anothen, akesis, auchmon lysis, anaschesis, ancylon, ankon, bakteriai, leitourgoi, leiton, laos, phylai, obai, archagetai, apellazein, phiditia/editia/philitia, pheido, kothon, krupteia, leschai, lycophon, oulamos/oulamoi, prodikoi, optilus, caddichus/caddished, hippikon, thesmothetai, parasitein, eiresione, kannathron/kannathra, tresantes, mothakes, klaria, machaeriones, promanteia, samaena, schinus, hestor, paidion/paidios, pai Dios, threskeuein, epoptos/epoptica, menoeikes, chairein, rhyntaces, rhopoperperethras, phainomerides, nympholepti, dorycnium, boulimia, scytalae, gelos, tragos, kerata, catus, cicer, dolo, decies, deliciae, optio, tesserarius, carcer, faustum, ruma. · Latin and French in the notes: De divinatione, pro domo sua, Pro Lege Manilia, De re rustica, De bigis, in libertatem reclamare, foenum habet in cornu, mansuetior, consul videret ne quid respublica detrimenti caperet, Val. Max. 5, 1, ext. 3, the Amyot quotations. · The translator's own coinages and comic renderings: shilly-shally-niciasize, Pit-wealthies, Cwemahk Theocwus / cwaven's (Alcibiades' lisp), spartanizing, medizing, chreocopidae, decadarchies, demesmen, paedonome, gymnopaediae, he'ld, they're. · Names the second scanner took for slips: Sparto, Sparton, Omisus, Democrates, Oreus, Mardion, Euthynus, Granius Petro, Picus, the Solii, Manius, Timon, Demetrias, Persis, Messanians, Libys, Tarantines (beside Tarentines), Babyce (beside Babyca), Tenteritae. · Real words the scanner doubted that are right where they stand: atone, dignify, baldness (of Galba's head), drown, fallow, certainty, notion(s), dearly, marrow, befit, dally, hound, paints, paving, religions, costing, curia, nought, mirror, superstitions, holdest, salty, stared, hallow(s), walling, petted, titled, barley-corns, overt, rapes, filly, hounded, warming, storied, tearless battle, tending, clipped, pointers, alloy; 'tiling' and 'tilings' for roof-tiles (ch32, ch54); 'lifting up a tile' (ch30); 'arid spot/regions' (ch35, ch36). · American spellings stand beside British ones chapter by chapter (honor/honour, neighbor, harbor, reconnoiter): the source text is mixed; not an error to fix here. · Grammatical doublings: 'had had' and 'that that'.

**Links.** Each key is linked once per chapter (= one Life), so I decided by chapter, looking at the first occurrence in each. The systematic faults are Roman praenomina and cognomina taken for emperors (Titus, Tiberius, Claudius, Galba, 'Caesar' = Augustus), Greek namesakes across centuries (Hipparchus, Hippias, Hippocrates, Leonidas, Demaratus, Cyrus the Younger, Lycurgus the orator, Antipater the Stoics), and place names linked to a 'Battle of …' entry where a different battle or just the place is meant (Thermopylae, Dyrrhachium, Granicus, Pharsalus, Thapsus, Himera, Asculum, Leuctra). Where a key in 'off' is right in a chapter or two, the why says which.

**Links left open.** `Mycenaean_Greece` — 'Olbians and Mycenaeans … settled in those parts by Heracles' (Sertorius 9) are legendary colonists from Mycenae in Africa; whether the Bronze Age culture entry serves is a matter of taste · `Tiberius_Gracchus` — in ch53 the first 'Tiberius Gracchus' is the father (censor, twice consul); every later use in ch53–55 is the tribune — it depends which occurrence carries the link

## `cassius-dio-roman-history` — Roman History, Cassius Dio

Applied: **16** · held: 1 · links off: 69 + 41 per chapter · 2 link(s) left open

**How it reads.** The nine samples read as clean, fluent Loeb prose with section numbers in place and no OCR garbage, page numbers or markup; but checked against the printed Loeb they hold six small transcriber's slips (dropped or changed words) that are real English words, so the book is less clean than its candidate list suggests — see the first systematic note.

**What repeats.**

- TRANSCRIPTION SLIPS NO SPELL-CHECK CAN SEE: the text was imported from a hand-typed web transcription of the Loeb (Cary) and reproduces its slips faithfully (I compared the doubtful places with the upstream page and with the printed Loeb volumes II, III, IV and IX: every one is in the upstream page and none is in the print). Nine samples of 4,500 characters (about 40,000 characters of a very long book) turned up 6 such slips that are real words and so are in no candidate list — a dropped 'not' (ch 23), a dropped 'only' (ch 78), 'him' for 'them' (ch 78), 'lieutenant' for 'lieutenants' and 'Furtius' for 'Furius' (ch 23), a repeated 'actual' (ch 40). At that rate the whole book carries several hundred. They cannot be fixed by rule; the only complete remedy is a word-level diff of each book against the printed Loeb (the archive.org OCR of the nine volumes is good enough to align).
- UNEXPANDED TYPIST'S SHORTHAND in the notes (3 found by the dictionary, all listed): 'crd' = carried (ch 42), 'mmy' = merely (ch 43), 'all rdkbd' = already described (ch 37). Any further consonant-only token in a note is the same fault.
- RUN-TOGETHER WORDS (4, all listed): 'wasa', 'campaignshould', 'heunderstood', 'others'burdens' — a space lost where the upstream page had a line break or a tag.

**Looks wrong and is right.** Latin and Greek terms are right: comitia tributa / centuriata, praetor urbanus, perduellio, pomerium, fiscus, aerarii, carpentum, comitium, rex sacrificulus, secutores, proquaestors, archon eponymus, periodos, cordax, candys, tamiai, krania (the translator's bracketed Greek gloss on Cranita), capita · 'Si male faxis vapulabis, si bene faxis rex eris' (ch 43 note) is the Latin jingle, correct · godfearing, horsebreeders, spearshafts, tireman, hartbeestes, hippotigris, citharoedic, centuriate, Corocotta: the translator's own words / names (tireman confirmed in the printed Loeb) · every word of the .scan list (stale, wards, soiled, haled, drave = the river Drave, Banno, Pollia, Tuscus, Heracleo, Magie, turba ...) is the right word in its sentence · 'Zonaras' standing alone between paragraphs of the fragment books is the edition's source label (a bk-head), not a stray running head

**Links.** 491 keys read. Chapter verdicts assume the reader links the first mention of a key in each chapter (the context shown); where a key is in `off` although some chapters are right, `rightIn` lists them, so that a per-chapter switch can be used instead. Systematic: (1) emperors' names are also republican praenomina and cognomina (Claudius, Titus, Nero, Tiberius, Galba, Nerva, Vitellius, Crassus…) and imperial titles (Caesar, Augustus, Germanicus, Britannicus, Augusta); (2) from book 45 Dio's plain "Caesar" is Octavian; (3) three keys are American or African capitals (Augusta, Concord, Juba) and five are people born after Dio wrote (Licinius, Crispus, Probus, Aurelian, Priscus); (4) "Ionian" is nearly always the Ionian Gulf and "Bosporus"/"Iberia" the Cimmerian and Caucasian ones.

**Links left open.** `Gnaeus_Domitius_Corbulo` — ch59 and ch60: the senator Corbulo who prosecuted the road commissioners under Gaius is usually taken to be the general's father (suffect consul 39 CE); ch61, 62, 65 are the general · `Africa` — Dio's Africa is the Roman province and the Carthaginian land, not the continent the entry describes (which he calls Libya); same place in a narrower sense, so left on

## `lucretius-nature-of-things` — On the Nature of Things, Lucretius

Applied: **4** · held: 1 · links off: 5 + 0 per chapter · 1 link(s) left open

**How it reads.** Both samples (Book III on the soul, Book VI on thunderbolts) read as clean blank verse with marginal line numbers in spans; the one fault met in reading was the broken compound 'wine- jar's'. The hyphen-for-dash convention is uniform through the book.

**What repeats.**

- Dashes are typed as a single hyphen glued to the preceding word, in the manner of the plain-text source: about 590 instances (279 in mid-line, 314 at a line end) — e.g. ch1 'And fruitful lands- for all of living things', ch3 'thou livest and lookest?- who in sleep', ch5 'Is verily- to dote', ch6 'bodies,- a fire 'gainst which'. A rule could turn 'word- ' / 'word-<br>' / ',- ' into a proper dash (—); the only two true hyphens caught by that pattern ('life- time's', 'wine- jar's') are listed above and must be fixed first.

**Looks wrong and is right.** Leonard's elisions and contractions: ev'r, ev'rywhere, heav'n, pow'rless, wand'ring, wand'rest, engin'ries, 'tmight, 'Thas / 'thas (seven times), markst, Thinkst, we'd, there'll, who'll, whatso'er, whereso'er, whosoe'er, ne'ertheless, moreo'er and all o'er- forms · His coinages and archaisms: primevals, smallmost, boundaried, densed, swervement, tumultuosity, soundlier, comradry, scriven, whitherso, strook, houghs, targe, northwind(s), southwind's, wildman's, homeomeria, baudels, 'imposante' · Square brackets ([But some hold], [fingers], [The crops] …) are the translator's supplements for lacunae; rows of dots mark gaps in the Latin; 'that is is limited', 'what now is is now create', 'for themselves themselves' are grammatical doublings · Scan list (cones, notions, steep, frees, hound, paint, cores, farest, houghs, hulks, out-drown, steeps, rooks) — all correct

**Links.** The translation is verse with every line capitalised, so the wrong links are ordinary words at the head of a line (Afar, Wheel, Forgetting, Dominion) plus 'Immortals' for the gods. Earth (the all-mother, i.e. the earth itself), Achaean lands, Cisterns and Oracles were looked at and left as right.

**Links left open.** `Italic_peoples` — 'the shores of the Italic mainland' means Italy as a place (against Sicily); the entry is the linguists' grouping of the peoples of ancient Italy — close, but not the same referent

## `aristotle-nicomachean-ethics` — Nicomachean Ethics, Aristotle

Applied: **3** · held: 1 · links off: 2 + 0 per chapter

**How it reads.** Both samples (Book IV and Book IX) read cleanly as Ross's translation, with Bekker numbers and chapter numbers in place and no garbage. The only faults found are the three candidates in Books IV and VI (two of them a Greek marginal gloss leaking into the prose) and a spacing fault in one note of Book V whose formula may also have lost an 'or' between its two equations.

**Looks wrong and is right.** scan-list words token, surety, safely, entirety, bottle ('the most beautiful ball or bottle … as a gift to a child') are all Ross's own words and correct · 'inirascibility', 'unambitiousness', 'ready-witted' are Ross's coinages, correct

## `sophocles-oedipus-rex` — Oedipus Rex, Sophocles

Applied: **2** · held: 1 · links off: 2 + 0 per chapter

**How it reads.** Both samples read cleanly: line numbers, speaker labels and stage directions regular; American spelling (the Perseus revision of Jebb).

**Looks wrong and is right.** 'the herdsman we have been looking for for a long time' (ch11) is grammatical · Iocasta, eye-balls, 'six month periods' as printed · all 9 scanner candidates are right readings

## `euripides-medea` — Medea, Euripides

Applied: **15** · held: 11 · links off: 1 + 0 per chapter

**How it reads.** Read in full. The verse-line numbers and speaker labels are sound; the faults are classic scan confusions (ray/my, roe/me, bom/born, fiom, fot, white/while, find/and, 1 for !, Greek Ο for O) plus a few lost full stops and stray commas.

**What repeats.**

- The whole play is an uncorrected scan (Coleridge via Perseus): 26 slips in about 77,000 characters, all listed above - I read the complete text, not only the samples.
- Two places where a bracketed (suspected) line was dropped leave a stray ', ;' before the note marker: ch3 'Some think me clever and hate me, ;' (line 304-5) and ch7 'and, that is well, ;' (line 778-80). They need the omitted words restored or one of the two marks removed - an editorial choice, so not listed as fixes.

**Looks wrong and is right.** Archaisms are Coleridge's: whenso, whoso, o'erreach, o'ertops, trafficks, afeard, 'the children thou hast born', 'her breathless counterfeit', 'Marry, then betray thee?' · Note 1 of ch13 'Tyrrwhitt' (for Tyrwhitt) may be the printed form - left · ch12: the reordered lines 1270a-1274 and the notes explaining them are the edition's own

## `sophocles-antigone` — Antigone, Sophocles

Applied: **0** · held: 0 · links off: 0 + 0 per chapter · 1 link(s) left open

**How it reads.** Both samples (an episode and a choral ode) read cleanly: line numbers, speaker labels and stage directions regular; American spelling (the Perseus revision of Jebb). No candidates and nothing found.

**Links.** Otherwise none wrong.

**Links left open.** `Antigone` — all 7 links are the character's name, and the entry is about the tragedy, not the woman; harmless here because this book is that tragedy, so I leave it to the owner (the same key in Oedipus Rex is rep

## `aristophanes-lysistrata` — Lysistrata, Aristophanes

Applied: **1** · held: 0 · links off: 4 + 0 per chapter

**How it reads.** Both samples read cleanly as prose dialogue with speaker labels; no scan slips in the text, one in a note.

**What repeats.**

- Apostrophes are mixed: most are curly (’Tis, you’ll) but a handful of speeches have straight ones (I'll x4, you'll, they'll, we'll - e.g. 'I'll trample you underfoot', 'I'll knock your eyes out'). Several of these sit in lines whose wording is blunter than the 1912 translation's manner, so they look like later re-wordings; typographic normalisation by rule would be safe, the wording is the edition's.

**Looks wrong and is right.** Phœbé, Hermæ, Thermopylæ, Myrrhiné and the stage directions in italics are right

**Links.** Everything else is the same city, god or person the text means.

## `kalidasa-shakuntala` — Sacontala, Kalidasa

Applied: **19** · held: 4 · links off: 3 + 0 per chapter

**How it reads.** Both samples (Acts III and VI) read cleanly as Jones's prose apart from the slips already listed ('seenes', 'Méghach' handa'); speaker labels are abbreviated italics (Dushm., Pri., Cham.) and stage directions open with '[' and often have no closing bracket, which is the edition's style, not a fault.

**What repeats.**

- No class above ~25, but the source transcription is typo-dense: 23 single slips in a short play (n/u, c/e, dropped letters). Expect a few more that neither scanner nor two samples reached.

**Looks wrong and is right.** Jones's 1789 spelling is the text: -ick endings (publick, magick, heroick, gigantick, authentick, cholerick, topicks, domesticks, rustick, frolick), errours, tremour, tyger, spight, lotos, buffalos, complection, faulters, benizon, interlineary, beest · langour (x3 in Act III, never 'languor') — consistent, left as the edition's spelling · practice as a verb, 'an hundred', Bráhmen, Hindû, Sacontalá/Dushmanta and all transliterated names with Jones's accents · scan.txt pairs that are right as they stand: chain, darting, token, stronger, month, certainty, stain

## `beowulf` — Beowulf

Applied: **14** · held: 1 · links off: 0 + 0 per chapter

**How it reads.** Both samples (Fitts 16 and 36) are sound Gummere with line numbers every fifth line; reading found one split word ('be wept' for bewept) and one full stop that should be a comma. The raw '&#32;' and '&#8195;' entities in the samples are spaces, not printed characters.

**What repeats.**

- Verse quoted inside the footnotes lost its line breaks: where the printed note set two lines of verse, the shipped note joins them with nothing between (6 found, all listed: comradesbe, fateshall, sorrowhe, pride!Mi, woman,wept, proved,folk-queen). A space is the minimal repair; the importer could instead keep the break.
- Not a reader-visible fault, for information: 269 numeric entities stand in the verse html — '&#32;' (a plain space) at the head of 250-odd lines, sometimes before the line-number span ('found out<br>&#32;<span class="bk-n">2630</span>'), and '&#8195;&#8195;' (two em-spaces) as Gummere's paragraph indent. A browser decodes both; any plain-text use of the html (search, the candidate scanner) sees them raw.

**Looks wrong and is right.** Gummere's archaisms and compounds: folkstead, burgstead, fenways, landsfolk, shieldsman, trothbreakers, march-riever, wounden gold, sentried, softlier, ofttime, knowst, darst, woful, sovran, targe, glaive, steaded him nought, agéd · Quoted Middle English, Old English, Middle High German and Old Irish in the notes: 'Lenten is comen with love to toune', 'Mi palefrey is of tre', 'Thæt fram hâm gefrægn Hygelâces thegn', 'Die rehten wazzersträze sint mir wol bekant', 'tuind mbroin', Nicor · 'he wailed their flight' (v. 2114), 'laved in blood', 'bidden', 'bides', 'hails you' — right as they stand; scan.txt otherwise only flght and walling are real

**Links.** Both keys read; none wrong.

## `herodotus-histories` — The Histories, Herodotus

Applied: **30** · held: 3 · links off: 31 + 17 per chapter · 6 link(s) left open

**How it reads.** The four samples read cleanly — the revised Godley translation in modern spelling, with numbered sections and sound notes. The faults are light and mechanical: a few doubled words, lost spaces after punctuation, and misplaced quotation marks, about one in 40,000 characters.

**What repeats.**

- A space lost after a full stop, comma or semicolon so that two words touch — 13 places (Books 1, 4, 5, 8; 'there.The Lydians', 'however,that', 'quivers;the'). All listed; a rule '[a-z][.,;][A-Za-z]{2}' finds them and nothing else in this book.
- Quotation marks with a stray space or turned the wrong way — 8 places (Book 5 x4, Book 7 x2, two notes). All listed.

**Looks wrong and is right.** The lettered sub-sections (121A–121F, 92A–92G, 86A–86D, 8A–8D, 9A–9C, 10A–10H, 16A–16C, 60A–60C, 68A–68C, 140A–B, 7A–B) are section numbers of the edition, set like the plain chapter numbers; not stray apparatus. · '<Pisidians>' (7.76) is the editor's restoration of a lost name, printed in angle brackets on purpose. · One-word compounds of the revised translation stand as they are: cheekplates, fawnskin, firebearer, footsoldiers (beside 'foot soldiers'), freightships, headstart, landfowl, palmwood, spearbearers, spearshafts, sunclock, watchposts, singlehandedly, ironworking. · Foreign words Herodotus glosses, and transliterated Greek: ledanon/ladanon, kiki, khampsae, artaba, dictys, borys, rhadinace, angareion, orguiae/orguiai, schoenus, perioikoi, autochthonoi, aegeae, phratria, naucraries, medize/medized, et cetera. · 'had had' (14) and 'that that' (3) are grammatical in every place. · A space before a full stop or comma in plain text ('commands them .', 'called Red ,') is where a note mark stood; not a fault. Verse oracles break lines inside sentences on purpose ('ransom cost them dear-' is a verse dash). · ch1 n53: the quotation from Anacreon opens and never closes ('“I would not... rule Tartessus for an hundred and fifty years.'); a missing mark, not listed. · Scan-file words right in place: horror, fir-cones, severity, wailed, silting, Temnos, banded, lauded, cleans, brood mares, entirety, farmed, locked, rapes, Eleon, fooled, roofed, wondered.

**Links.** 330 keys read. The systematic fault is Herodotus' own geography of the southern seas: his "Red Sea" is the Indian Ocean and Persian Gulf and his "Arabian Gulf" is the modern Red Sea, so both keys point the wrong way. Chapter verdicts assume the reader links the first mention in each chapter (the context shown); Lycurgus and Mount_Olympus are right later in a chapter whose first mention is a namesake.

**Links left open.** `Palace_of_Nestor` — the linked word is Pylos: for "the house of Pylos and Neleus" (ch5) and Melampus of Pylos (ch9) the palace is a fair gloss, but in ch7 the Corcyraeans anchor "off Pylos and Taenarus" — the classical h · `Kea` — ch4 (the Ceans' refectory on Delos) is the island; in ch8 the Persian ships "stationed at Ceos and Cynosura" before Salamis are at a point usually taken to be on or near Salamis, not the Cycladic isla · `Thera` — the island is right, but the alias "Theras" also links the man (Theras the regent, its founder) in ch4 — one would need to see which word carries the chapter's link · `Battus` — ch4 is the founder of Cyrene and right; in ch2 Ladice is "daughter of Battus", who by date must be a later king of the same name (Battus II), not the founder · `Moon` — the Egyptians sacrifice swine "to the Moon and Dionysus" — the moon as a deity; the entry is the astronomical body (same object, different sense) · `Battle_of_Thermopylae` — the linked word is the pass ("guard the pass of Thermopylae"); the entry is the battle fought there, which these chapters narrate — right in spirit, a battle entry for a place-name in form. The same h

## `confucius-analects` — The Analects, Confucius

Applied: **4** · held: 1 · links off: 2 + 0 per chapter

**How it reads.** Both samples (Books 9 and 17) read cleanly; chapter and paragraph numbers are regular; straight quotation marks throughout.

**Looks wrong and is right.** Legge's words are right: litanist, esteemer, 'a ch'i' (the horse), junzi, valourous, 'empty-like', 'the fang bird' · names are in pinyin by the edition's choice (Zilu, Zigong, Yan Yuan)

**Links.** 16 keys read. The two wrong keys are a disciple's personal name read as a dynasty and the short title of a Chinese classic read as an Egyptian god; everything else is the right referent.

## `mencius` — Mencius, Mencius

Applied: **21** · held: 0 · links off: 7 + 2 per chapter

**How it reads.** Both samples (Teng Wen Gong I on Xu Xing; Gaozi II 8–13) read as clean Legge with numbered sections; no fault in either. The seven word-level slips are single non-words the scanners caught; the rest is spacing.

**What repeats.**

- Spacing slips of the source transcription, 14 in all and all listed: a space before '?' or ',' (6: 'sword ?', 'bell ?', 'lifted ,', 'only ?', 'greatest ?', 'qi-willow ,') and no space between a comma and an opening quotation mark (8: 'replied,'In', 'said,'A great saying', 'saying,"You are you'). Two rules would cover them: ' ?' / ' ,' → '?' / ','; and ',' directly followed by an opening quote gets a space.

**Looks wrong and is right.** The text is Legge with the names converted to pinyin; three measures keep Legge's romanisation once each beside the pinyin form used elsewhere — 'five mau' (ch 13; 'mu' elsewhere), 'forty square lî' (ch 2; 'li' elsewhere), 'ten thousand chung' (ch 11; 'zhong' elsewhere). An inconsistency of the conversion, not a scan error; left · Legge's words and compounds: carriagewright, bowmaker's, taxgatherers, now-a-days, waggon-load, kind-heartedness, glib-tonguedness; gong, qing, da fu; Qi-lin, Feng-huang; ' - ' (spaced hyphen) is this source's dash throughout · The many long repeated passages (e.g. the 'frightened appearance' ox, 'the black-haired people suffering neither from hunger nor cold', the twice-told 'Good ministers … Robbers of the people') are Mencius repeating himself, not duplicated text · scan.txt: interior, farmer, tilled, wailing, wailed, failing are right; vears fixed

**Links.** Pinyin syllables written as separate words (Xia, Shu, Tao, Tien, Yu Gong) match inside other people's names.

## `machiavelli-prince` — The Prince, Niccolò Machiavelli

Applied: **54** · held: 8 · links off: 7 + 1 per chapter · 1 link(s) left open

**How it reads.** The two samples read as fluent Marriott with one slip each of the kind listed ('wax' for war in the second). Because the slips were so frequent, the whole book was then compared word by word with a second copy of the translation; every difference was read and only the scan faults kept.

**What repeats.**

- This is an uncorrected OCR text: 62 fixes in 169,000 characters, found by a dictionary pass over every word AND a word-by-word diff of the whole book against the Project Gutenberg text of the same translation (#1232, fetched from a mirror only as a second witness — it is a later, Americanised revision, so its readings were used to explain a fault, never to replace sound text). The signature misreading is 'li' read as 'h' or 'll' (simphcity, obhgations, estabhshed, hsten, warhke, Enghsh, Baghoni, Foghani, Sinigaha, he for lie); chapter 26 alone holds 16 fixes and two dropped phrases. Nothing systematic remains after these rows, but the book would be a fair candidate for re-fetching from a cleaner source.

**Looks wrong and is right.** The shipped text is the 1908 Marriott wording, which differs from the revised one in many sound readings — leave: addentellation (rev. 'toothing'), burthen, Achaians / Acheans, Pisanians, Fermanese, Romagnian, Marquis, aggrandise / recognise / organise / temporise, rased, ascendency, correspondencies, insolencies, corruptor, Pretorian, Castille, Carmignuola, Vaila, Alexandria (for Alessandria), sandjacks · 'cannot have their foundations' (ch 7), 'one pope should almost destroy the Colonnesi' (ch 11), 'a prince who is not experienced' (ch 23), 'if fortune changes' (ch 14), 'dread changes' (ch 22), 'should have where to shelter' (ch 3), 'I consider those are able to support themselves … who can' (ch 10), 'it is impossible that he should not with your assistance' (ch 21) — all the older edition's wording, some of it better than the revision's · Latin and Italian quotations otherwise sound: 'Res dura, et regni novitas…', Virtú, 'non é ancor morto' (accents as printed) · scan.txt: aimed, token, overcame, falls — right; estabhshed fixed

**Links.** The errors are Roman names that are also titles or common names (Caesar as a rank, Titus Quintius, Niger, the Pontiff, Praetor) and one same-named Italian town; the Greek, Roman and Italian places and rulers are otherwise the right ones (Commodus here is the son of Marcus; Achaians links to an entry that covers the Achaean League).

**Links left open.** `Capua` — ch5 is ancient Capua (right); in ch26 Capua stands in the list of Italian defeats (its sack by the French in 1501) — the medieval and modern town, which lies at ancient Casilinum a few kilometres from

## `caesar-gallic-war` — The Gallic War, Julius Caesar

Applied: **6** · held: 0 · links off: 9 + 1 per chapter

**How it reads.** Both samples (Books 4 and 7) read as a typed transcription with occasional typist's slips rather than scan noise; American spelling; chapter numbers in place. Six slips confirmed; in a book this long a few more unlisted typos of the same kind are likely.

**Looks wrong and is right.** McDevitte & Bohn's spellings are right: embassadors, negociating, approximity, can not, intrusted, maneuver, defenses · Latin kept by the translators: soldurii, uri · editorial square brackets ([other piles], [then]) are the translators'

**Links.** The pattern is Roman praenomen/cognomen namesakes among Caesar's officers and Gallic tribes that share a name with a better-known people or place.

## `livy-history-of-rome` — The History of Rome, Livy

Applied: **191** · held: 48 · links off: 93 + 28 per chapter · 3 link(s) left open

**How it reads.** The 16 samples read as a sound translation carrying a thin, steady scatter of faults: 9 hard errors in about 72,000 characters (grated, patty, Caiu, of tile, actual necessary, 'and. after', a a, right for light infantry, Philoppopolis) besides a line-break hyphen every 6,000 characters or so. Books 1–8 are much the worst (dropped letters leaving gaps, stray stops and apostrophes); Books 21–45 mostly show one-letter slips in words and names. Formatting: section numbers are run into the prose as bare numerals (by design, from the bk-n spans), paragraphs often break in mid-sentence, speeches carry <q> but the source's own quotation marks survive irregularly (an opening " or ' with no partner, e.g. ch10 §11, ch26 §22), and the notes hold raw Beta Code Greek. This book needs a second, closer pass than candidates can give.

**What repeats.**

- LINE-BREAK HYPHENS left inside words: 624 in all (533 in the text, 91 in the notes; pattern lower-case letter + "- " + lower-case letter), every one a fault — e.g. ch8 "obliter- ated", ch23 "accus- tomed", ch3 "notwithstand- ing", ch1 "sacri- fices", ch10 "tomor- row". Plus 5 in capitals inside inscriptions (ch26 "DE- FENCE", "IN- JUSTICE"; ch33 "IS- LAND"; ch41 "GRAC- CHUS", "COMME- MORATION"). Rule: delete "- "; BUT keep the hyphen (drop only the space) where both halves are whole words of a real compound: ch2 "four-and- twenty", ch3 and ch43 "lieutenant- general", ch3 "devoting- laws", ch4 "well- merited", ch8 and ch42 (twice) "senate- house", ch23 "twenty- two", ch26 "first- fruits", "body- politic", "commander-in- chief", ch28 "new- raised", ch34 "battering- rams", ch42 "scaling- ladders". Leave ch5 note 7 "Pop- li R- i" (a Latin abbreviation). Four hyphen cases that a rule would get wrong are listed as fixes (de- dare, Me- Metius, which- had, Demen- lius). Only 5 plain examples are in fixes.
- LETTER DROPPED, LEAVING A GAP inside a word ("th t", "ho e", "s ate", "o ice", "w re", "cou age", "him elf"): 42 found, 39 of them in the text of Books 1–8 (ch1–8) — all listed individually as kind "split word", because each needs its own letter and no rule can supply it. The same damage shows as short-word slips: th for the (x3), ha for had (x3), ad for had (x2), hi for his (x2), i for is (x2).
- REAL WORD ONE LETTER FROM THE RIGHT ONE, far too many to be the translator's: been printed as beer / beef / beet / bean / teen (5), he as lie (6), the as tile (4), plus grated, patty, yokel, lumber, mope, looting, Frog, rot, file, hell, bark, bang, lore, lease, owns, carve, quartets, soma, tame, lace, boot, luring, lesions, pence, ail, coning, tines, peeks … about 75 word slips listed individually (non-words such as procaimed, psssage, thraldrom among them); and about 25 proper names one letter off (Caiu, Titius, Menucius, Hasdrudal, Lalius, Maninissa, Lucinius, Veturnius, Tunius, Tarentius, Cicinius, Anetium, Claudium for Caudium, Veil for Veii x2, Liquria, Philoppopolis x2 …). They were found by searching for once-only words next to frequent ones; words that occur three or more times, or slips that produce a frequent word (he/be, of/or, on/in), cannot be found that way, so more remain — the density in the 16 samples was about one fault per 9,000 characters, i.e. several hundred in the whole book.
- STRAY FULL STOP in mid-sentence before a lower-case word: 31 in the text and 2 in the notes, listed individually (the stop is deleted where the phrase runs straight on — certain; replaced by a comma where a comma is wanted — probable). Not counted: ch4 "corresponding to his deserts that. when employing force" (the right pointing is unclear) and ch2 note 24 "ut. solet" (Latin). Also 3 doubled full stops (listed).
- STRAY APOSTROPHE after a word that is no possessive ("with' a garrison", "of' resentment", "their' dispositions"): 18, all listed. Also ch40 "enmities mortal. ' A roar" (a closing quotation mark set off by a space — left).
- STRAY SOURCE MARK-UP printed as characters: "$" before a name that began with the ligature Æ — 5 in the text (ch10 $Aequicolae, ch24 $Aecae, ch26 $Aeniadae, ch38 $Aequimaelium, ch39 $Etolia) and "$c." for "&c." in ch5 note 2; "_Aemilius" (ch38); "## thing" (ch42); two page-break tags of the source printed in the prose, ch41 "com- id="p.1946" n="1946"/> petitor" and ch45 "an id="p.2171" n="2171"/> apology" — all listed. NOT listed, needs a decision: ch1 note 24 prints TeX, "(\overline(2 × 22) + \overline(2 × 23) = 90,)"; and the Greek in 8 notes is raw Beta Code, not Greek letters — ch1 n8 "xqo/nios Qeo/s", n9 "qei/a/ tini tu/xh/", n16 (a whole sentence of Dionysius), n17 "apo\ paraskeuh=s", n47 "Thn u(/lhn kaloume/nhn Kakou=rgon", n61 "katapontismo/s", ch2 n6, ch3 n11 "Sarkw=n qrau/smata"; ch1 n19 and n26 carry fragments of the same.
- PARAGRAPHS BREAK IN MID-SENTENCE: 2,709 of the 19,192 <p> begin with a lower-case word ("…as you go down to the two </q></p><p><q> groves."). The source's numbered sub-sections were turned into paragraphs although they cut sentences (and <q> quotations) in two. A formatting fault of the importer, not of the text; nothing listed. The stray-full-stop fixes that sit on such a break keep the break.
- DOUBLED WORDS: 8 real ones listed (to to, which which, the the x2, his his, a a, in in ch34, contribution bution); ch5 "thrown in in addition" and ch7 "sent for for the purpose" are grammatical and left.

**Looks wrong and is right.** Period spellings of this nineteenth-century translation: negociation, gallopped, pallisades, filletted, targetteers, patrole, ospray, suttlers, befals, villany, intrusted, phrensy, palisado, alway, denariuses, quinariuses, cistophoruses, every thing / any thing / every where as two words. · The translators' own coinages: dictatorian, tribunitians / tribunitian / tribunitial / tribunician (all four occur), subitary, vicesimary, prodictator, subcenturion, horneteers, decurios, superimpending, redhot, scytheblades, co-optation, Suove-taurilia. · Latin quoted or glossed in text and notes is right: fori, hister / histriones, exodia, fecialis, pater patratus ad jusjurandum patrandum, trabea, lupercal, armilustrum, falarica, catapulta / catapultae, tolleno, spartum, ovile, lanistae, triumviri epulones, Io triumphe, vindicta, sarissas, and every Latin lemma of the notes (Subscribere actioni, calumniam jurare, judices selecti, variatio personarum, Pop- li R- i …). · Names that look like slips but are, as far as I can tell, Livy's own or the translators' consistent forms: Morcus (44.23), Olympio, Hiera Come, Paculla Minia, Ovius and Novius Calavii, Marius Blosius, Cloelius beside Claelius, Poetelius beside Paetelius, Statius Minacius, Quintus Victorius, Caius Persius (ch26), Comans, Urites, Tiso of Patrae, Priate, Sare, Teno, Mannus, Perses (ch9), Perseis, Recius, Papirus (a mountain), Cutina, Mutila, Abba, Savo, Aesquiline, Terentine tribe, Achaians, Corbia (possibly Corbio — left), Nolae, Cuma, Firma, Cannas x2 (left as the translator's). · Name forms left because a deliberate spelling cannot be ruled out: Bebius (ch39), Levinus (ch30), questors (ch2), Amilcar is listed only as probable. · From the scan list, all right in context: dignify, chase, hoard, adapt, dearly, locks, frees, overlook, felling, qualify, tails, repealing, cheek-pieces, tasting, Tellus, cautions, groin, fable, deterring, lions, Pales, gross, momentum, blundering (ch9), vigour and hue (ch28). · Editorial square brackets ([to see], [resolved,], [as a refuge], [proposing]) are the translators' supplements; the ellipses "…" in ch43–45 mark lacunae in Livy's text; the sums in ch10 notes (£1614. 11 s. 8 d.) are the translators' conversions.

**Links.** The reader links bare Roman praenomina and cognomina (Claudius, Tiberius, Servius, Crassus, Galba, Varro, Sulla, Caesar, Lucretius, Priscus) to the one famous bearer, almost always of a later age than Livy's surviving books (753–167 BCE); and a town named in a campaign is linked to a later battle fought there (Pharsalus, Munda, Thapsus, Dyrrachium, Thermopylae, Heraclea). Keys put in `off` although a few chapters are right name those chapters in `why`.

**Links left open.** `Moirai` — 'the Fates' are the Roman fata: ch1 is destiny personified (defensible), but ch42 'the books of the Fates' are the Sibylline libri fatales, not the Greek goddesses · `Imperator` — ch6 'the statue of Jupiter Imperator' brought from Praeneste uses the word as a cult epithet, not the military title the entry describes · `Tuscany` — the translator's 'Tuscany' for Etruria as a consular province in 212–190 BCE; the entry is the modern Italian region — the same land, anachronistically named

## `thucydides-peloponnesian-war` — The History of the Peloponnesian War, Thucydides

Applied: **6** · held: 0 · links off: 36 + 10 per chapter · 3 link(s) left open

**How it reads.** Three samples (2.64–65, 5.15–18, 8.16–21) read as clean Crawley with section numbers at paragraph heads (no space between the number span and the first word, by design of the markup). The five notes in the book are a modern transcriber's annotations (e.g. 'Crawley uses an alternative spelling…', 'Many scholars believe…'), not Crawley's — worth knowing, not a text error.

**What repeats.**

- Dashes are typed as two hyphens throughout, 182 times and never as a dash: 'the banished nobles--(it must be premised', 'unjust both to themselves and to their allies--projects whose success', 'the atraktos--that is, the arrow--would'. Rule: '--' → '—' (no '—' exists in the book, so the rule is safe).
- One city in two spellings inside Book 3: Mitylene/Mitylenian(s) x39 and Mytilene/Mytilenian(s) x26 (Books 4 and 8 have only Mityl-, x9). Crawley's form is Mitylene — the book's own note says so — so the 26 'Mytil-' in Book 3 are the transcriber's modernisation; a rule 'Mytil' → 'Mityl' in chapter 3 text would restore consistency (probable, not certain: left out of the fixes). The note itself ('more commonly known as Mytilene') must keep its spelling.

**Looks wrong and is right.** Grammatical doublings, not errors: 'stole in in a galley' (3.5), 'conferences went on on the subject' (4.119), 'what was going on on the other side' (8.104), 'those who come come with full powers', 'one one way, one another' (7.71), all 'had had' / 'that that' · in statu quo, atraktos, zanclon, thranitae, malversators, marshmen, poppyseed — Crawley's words · 'the little that they were possessed' (2.65) reads oddly but is the transmitted Crawley text; 'shall be the king's' with a small k in the treaty (8.18) · scan.txt pairs are all right except 'dearly'

**Links.** Nearly all the errors are homonymous Athenians, Spartans and Corinthians in lists of commanders and oath-takers linked to a famous namesake (Socrates, Aristotle, Xenophon, Euripides, Sophocles, Hippocrates), plus 'Battle of X' entries linked from the bare place name X and second cities of one name (Sicilian Naxos, Arcadian Orchomenos, Amphilochian Argos, Aetolian Chalcis, the Trojan Ida).

**Links left open.** `Pharnabazus` — in Book 2 (430 BCE) the envoys are to cross 'to Pharnabazus' — the Greek has Pharnaces son of Pharnabazus, so this is an elder of the family, not the satrap of 413–373 BCE; Book 8 is right. Would swit · `Argive_alliance` — the first use in Book 5 (5.30, Corinth's reply) is Argos's league of 421 BCE with Corinth, Elis and Mantinea; the entry is the treaty of 420 BCE with Athens, which the later uses in the same book lead · `Mycenaean_Greece` — 'the Mycenaeans' are simply the people of the town of Mycenae under Atreus in legend; the entry is the Bronze Age culture as a whole — broader, perhaps acceptable

## `polybius-histories` — The Histories, Polybius

Applied: **98** · held: 15 · links off: 81 + 19 per chapter · 3 link(s) left open

**How it reads.** The six samples read smoothly as Shuckburgh and are free of garbage, page numbers and broken markup, with section numbers and the editor's italic summaries in place; but four small real-word scan errors turned up in them ('cannot trust', 'included. in the truce', 'to the Romans, And being', a missing comma), which is what led to the full comparison described under systematic. After that comparison this book has by far the longest fix list of my six, almost all of it invisible to a dictionary.

**What repeats.**

- REAL-WORD SCAN ERRORS THAT NO SPELL-CHECK SEES — the main finding. The Perseus text this book was imported from is an uncorrected scan, and most of its slips are English words: 'cannot trust' (thrust), 'the open county' (country, 4 times), 'until be had forced' (he, 3 times), 'to write had Greek' (bad), 'points or vantage' (of, 3 times), 'the are subtended' (arc), 'fat too short' (far). The six samples showed four of them, so I word-diffed the whole shipped text against Project Gutenberg's independent transcription of the same 1889 Shuckburgh edition (ebooks 44125 and 44126) and read every 1-2 word difference: about 110 are errors on Folio's side and are ALL LISTED above (each checked in its sentence; where Gutenberg was the one in error — Plena for Pieria, Lyons for Lycus, earned for carried, tenor for terror, Calibrates — Folio is right and nothing is listed). The diff and its working files are in /tmp/claude-0/-home-user-folio/d1849b6f-1025-5324-9583-5c025d0cfcec/scratchpad/r9/pol/ (real.txt = word substitutions, one.txt = single words missing or extra, d.txt = the full diff). I did NOT read the ~900 longer hunks (3+ words), which are mostly Gutenberg's side-notes and footnote numbers but may hide a few more.
- WORDS DROPPED OR DISPLACED, 20 (listed): a word is missing from the sentence ('they would thus [shut] out Philip', 'their arms or their [tactics,] but', 'harping upon [them] soon', 'commenced the war [afresh.] He', 'themselves. [Being] therefore') or stands in the wrong line ('little short of With ten thousand ... houses. tears of joy'). They look like words that sat next to a page break or margin note in the Perseus XML.
- SPACE LOST AFTER A FULL STOP, 10 (listed): 'years.The', 'statements.But', 'him.He', 'Antiochus.With', 'Sparta.This' — the rule lower-case + '.' + capital + lower-case finds exactly these ten.
- HYPHENS LOST IN COMPOUNDS, about 25 (not listed; a rule or the Gutenberg text can restore them): the print's line-end hyphen was dropped with the break, giving 'batteringrams' (x2), 'hand-tohand', 'brother-inlaw', 'fiftythree', 'twentythree', 'twothirds', 'eightbanked', 'tenbanked', 'lettercarrier', 'fluteplayer(s)' (x3), 'towingropes', 'rowingcrews', 'dwellinghouses', 'fellowworkers', 'counterembassies', 'silverplate', 'seacourse', 'shortlived', 'allsufficient', 'buttend', 'lightarmed' (x5), 'siegeworks' (x3), 'wellfounded'. Gutenberg's transcription of the same edition has every one hyphenated ('battering-rams', 'hand-to-hand', 'fifty-three', 'flute-players', 'light-armed'). 'breastpiece' and 'bloodvessel' are solid in the print and stay.
- FRACTIONS FLATTENED IN NOTES: '151/2 oz', '81/2 gallons', and in Book 6 the text has '5 1/3 asses', '10 2/3' — the two in the notes read as wrong numbers and are listed.

**Looks wrong and is right.** the print's own spellings and misprints, confirmed in Gutenberg's independent transcription of the same edition, are left: disquistion, strategem (x2), hords, beleagured, catastrophies, reconnaisance (Book 10), sakbut, bloodvessel, breastpiece(s), vieing, befell/befel, balistae · names that look like slips but are right: Morcus (Genthius's envoy), Democrates (Philip's admiral, not Deinocrates), Horii, Arius, Oppius, Cleon, Eucleides, Menalchidas, Gerunium, Pieria, Lycus, Callicrates; 'Eumenes I.' is the print's · Latin and Greek terms: legati, legatus, praefectus, decurio, scutati, hemioliae, pristis, tebenna, xiphiae, metreta, plethrum, diolcos, stenoscope, demus, lacus Vadimonis, concilia, judices, lex judiciaria, pedites sociorum, praetoria cohors, toga praetexta, plebiscitum, quingentos passus; abbreviations in notes (Vit., epit., legg., chs., sqq., pts.) · 'fell in in front of the army' (Book 2) is 'fell in / in front', not a dittography; 'common stale', 'drave', 'personalty', 'noble ambitions' are right · differences from Gutenberg that are editorial, not slips, and are left: 'her general purpose' / 'the general catastrophe' (1.4), Archidamus / Nicagoras (5.37), 'battle in Libya', 'battle of Drepana', right / left wing (16.x), Philip / Antiochus (18.x), Ventilius / Villius, Eureas, Here (for Hera) · <q> ... </q> in the html is real quotation markup (811 pairs) and renders as quotation marks; it is not leaked markup

**Links.** Polybius's later books are full of 3rd–2nd century BCE Greeks, Macedonians and Romans who share a name with a famous classical figure (Hippias, Solon, Miltiades, Socrates, Isocrates, Nicias, Alcibiades, Lysias, Polycrates, the elder Gracchus, Sextus Caesar, Fabius Aemilianus); and three Athenian-institution entries (Strategos, Prytaneis, Archon) are linked from federal Achaean, Aetolian and Rhodian offices or from a man called Archon. Keys put in `off` although one or two chapters are right say so in `why`.

**Links left open.** `Cimmerians` — only ever in 'Cimmerian Bosporus' (ch4, ch34): the strait is named after the people, so the link is defensible, but it is a place name, not the people · `Medes` — ch5 and ch10 mean Media, the Seleucid satrapy of the 3rd century BCE; the entry is the people and their kingdom to 550 BCE — same land and people, three centuries on; ch16 and ch39 fit · `Vesta_(mythology)` — 'the altar of Vesta in the Homarium' is the translator's Latin name for the Greek Hestia at the Achaean federal sanctuary; the Roman goddess is not strictly meant

## `aesop-fables` — Aesop's Fables, Aesop

Applied: **2** · held: 2 · links off: 1 + 0 per chapter

**How it reads.** The two assigned samples are single short fables, so I also read fables 120-165 in full (46 fables). The text is clean Townsend with small typist's slips - about three in 46 fables - so the 250 unread fables probably hold a dozen more of the same minor kind.

**Looks wrong and is right.** capitalisation varies in compound animal names (House-dog / House-Dog, Sea-gull / Sea-Gull, Wild-Boar / Wild-boar) - left · 'onesided', 'clear toned bells', 'fagot', 'a-saying' are Townsend's · a few fables end without a final stop or with a comma between speeches (ch140 'easily get out"', ch144 'than he you," "Anything') - punctuation only, left

## `song-of-roland` — The Song of Roland

Applied: **5** · held: 0 · links off: 3 + 0 per chapter

**How it reads.** Two laisses read cleanly (107 and 243): accents, curly quotes and the AOI refrain are intact, laisse numbers in bk-n spans. The only fault is the invisible page-break marker, which the plain-text sample prints literally as '&#32;&#8203;' and the page shows as a blank line.

**What repeats.**

- A page-break marker of the source — the two entities '&#32;&#8203;' (a space and a zero-width space) on a line of their own — survives in 128 of the 291 laisses: 96 times between two verse lines ('<br>&#32;&#8203;<br>') where it shows as an empty line in mid-stanza, 32 times at the end of a laisse ('<br>&#32;&#8203;</p>'). Examples: ch3 after 'four hundred mules load high;', ch8 after 'the walls are tumbled down,', ch243 after 'long time I've fed you at my hand.' Never more than one in a chapter. Rule: delete every '<br>&#32;&#8203;' (five are listed above as samples).

**Looks wrong and is right.** Scott Moncrieff's deliberate archaisms and Old French forms: barun, felun, companioun, gonfaloun, bachelours, capitain, contenance, suffrance, heretick, topaze, jacynths, buccines, caland, faldstoel (beside fald-stool), alcalyph, almacour(s), dromedrays, javelots, mahumeries, rerewarden, vassalous, shadowful, pruff, Emperour, cloke, Sarrazin · Metrical elisions: tow'r, flow'r, pow'r, show'rs, embow'red, overpow'red, monast'ry, ha'berk, chos'n, yestre'en, take't, they'ld, who'ld, you'ld, I'ld, ye've, ye're, to 's people · 'gallopped' twice (ch202, ch228) is the edition's spelling; name forms vary by design with the assonance (Rollant / Rollanz, Guene / Guenes / Guenès, Marsile / Marsilies / Marsilie, Charles / Charlès / Carlun) · Rows of asterisks in ch35, ch41, ch52, ch187 mark lacunae in the manuscript — the translator's own; 'AOI.' at the foot of laisses belongs to the poem · Scan list (shalt, gross, beads, whale, baste, wroth, surety, chose, verity, gales) — all correct

## `epic-of-gilgamesh` — The Epic of Gilgamesh

Applied: **6** · held: 3 · links off: 3 + 0 per chapter

**How it reads.** Both samples (the Gate of the Forest; the Flood) read correctly as Thompson's bracketed hexameters; the only faults are typographic — the mis-directed quotation marks described under systematic, and line numbers that twice lost their markup ('30.0', '150.'). Spaces before punctuation in the plain-text samples ('Thirdly , ‘twas', 'the Igigi :') come from italic tags closing before the punctuation, not from the text.

**What repeats.**

- Apostrophe typed as an OPENING single quote at the head of an elided word, ~64 times (‘t 48, ‘T 13, ‘g 2, ‘S 1): '‘tis thou art young', '‘Tis I will challenge', '‘gainst the gods', '‘Scaped', '[‘t were human'. Rule: ‘ before tis/twas/twere/t /gainst/scaped (any case) → ’. Genuine opening single quotes of inner speech (‘O ye Gods!, ‘Hath any) must be kept, so the rule has to be by word.
- Opening double quote typed as a CLOSING one directly after a line number, 28 times: '<span class="bk-n">30</span> ”Shall we, O friend', '<span class="bk-n">10</span> ”Gilgamish, ‘tis thou', '<span class="bk-n">220</span> ”(Tell me), I pr’ythee'. Rule: '</span> ”' → '</span> “'.
- Closing double quote typed as an OPENING one after a space, 9 times (' “ ' x7, ' “<br>' x2): 'six . . . (?) . . . “', 'do thou mark it. “ (So straightway)', '[which hath seized him.] “'. Each needs a look (some sit in the editor's lists of broken half-lines in ch 11: '“fiercely blew . . . . “ “like a battle . . . “)').
- One line number without the bk-n span that the other line numbers have: ch 11 '<br>150 (Then) I a swallow put forth' (cosmetic).

**Looks wrong and is right.** Thompson's deliberate archaisms and metrical elisions: pleasaunce, curtleaxe, embattail'd, o'ermantled, o'erstrong, besmirchen (archaic participle), stoutheart, footsole, tow'reth, wand'rer, treach'rous, utt'rance, ev'ry, pr'y thee, se'nnight, certes, sooth, bent-kneed · Editorial restorations in square brackets and half-words: st[orm], por[tico (?)], [Props?], (?) queries, runs of dots for mutilated lines, 'understanding(? . . .' — all the editor's apparatus · Akkadian in text and notes: kappi, urnu, ipirani, ishshikku, sabitu, anaku, rabutum, shadadu, dall, Nin-makh, Belit-seri, Atra-hasis, Uta-naishtim (a note on the variant name), i-na be-ri-shu · Gilgamish, Erech, Uta-Napishtim, Ur-Shanabi are this edition's forms; Wine-Maker x1 beside Wine-maker x15 is harmless capitalisation · scan.txt: month, white, giant are all right

**Links.** The translator's Greek and English stand-ins for Babylonian things are the only problem.

## `bhagavad-gita` — The Bhagavad Gita, Vyasa

Applied: **0** · held: 0 · links off: 1 + 0 per chapter

**How it reads.** Both samples (discourses 6 and 16) read cleanly; verse numbers and colophons in place. No scan slips found.

**What repeats.**

- The long-vowel circumflex of Besant's transliteration is dropped in a minority of places: 'Yogi' x4 beside 'Yogî' x21 (e.g. ch6 v.27 'this Yogi whose mind', v.31 'that Yogi liveth', ch8 'the Yogi is nowise perplexed'); 'Kunti' x3 beside 'Kuntî' x10 (e.g. ch16 v.22, ch18 'O son of Kunti'). Probably the source transcription's; could be normalised by rule, not listed one by one.

**Looks wrong and is right.** Sanskrit terms are right: asuric, rakshasic, tamas, rajas, svarga, kusha, asamsayah · 'Buddhi-Yoga' / 'Buddhi-yoga' in two notes - capitalisation only · archaic verb forms (killeth, oughtest, abstaineth) are the translator's

## `classic-of-poetry` — The Classic of Poetry

Applied: **1** · held: 0 · links off: 4 + 0 per chapter

**How it reads.** Both samples (ode 237 The Mien; ode 290 The Zâi Shû, each with Legge's headnote) are clean: no misreadings, verse lineation intact. This is the cleanest text of the batch — one lower-case sentence opening is the only fault found.

**Looks wrong and is right.** This is Legge's Sacred Books of the East text with the SBE transliteration, which prints some consonants in italics: <i>K</i>âu (Zhou), <i>K</i>iang, <i>Kh</i>î, <i>Z</i>ui, <i>K</i>ieh. The italic letters are present in the html; a tag-stripping reader sees 'âu', 'iang', 'ieh's', 'ing-ning' and must not take them for broken words. Shăn-nung, Hsien-yun, Mî-hsü, Than-fû, Wăn, Thâi with their accents are right · 'did not get on on the road' (ode II.v.1) is grammatical: 'get on' + 'on the road'; 'that that was the proper time' likewise · Legge's words: displacency, sowthistles, farmsteadings, greenbeaks, auspicing, undeflected, unrebellious, præternatural, dryandra(s) cordifolia, rottlera(s), tribulus, phœnix · Cross-references to the pages of the printed volume ('a note on p. 316', 'pp. 300, 301') are Legge's own and point nowhere in this edition — not a text error · yüeh / Yüeh, the Latin of P. Lacharme quoted in notes (majestate, pulchritudine, coelos), &c. · scan.txt: farmer, tight, locks — all right

**Links.** Ode alone is 102 links, one per poem heading.

## `book-of-documents` — The Book of Documents

Applied: **16** · held: 0 · links off: 3 + 2 per chapter

**How it reads.** Both samples (The Charge to Yue ii; the Jun Chen with its headnote) read as clean Legge, apart from one mismatched quotation mark. The serious faults were found by sweeps, not samples: stray repeated lines glued into the songs of chapters 5 and 9.

**What repeats.**

- A source glitch in the verse blocks, 7 instances in two chapters, all listed: where a song is continued by another speaker, the previous song's last line is pasted — with no space — in front of the next block (ch 5 'fully discharged!'When the head is…' x2; ch 9 '…rotten reins.It is in the Lessons' x5). Worth a rule in the importer: a line that begins with a full sentence already printed earlier in the chapter, glued to the next word.
- Paragraph breaks inside notes are lost and the two sentences are joined with no space, 6 instances, all listed ('Zhili.Mount Chong', 'undefined.It would', 'courtyard.The palace'). A rule: in notes, '.'/'.'' directly followed by a capital letter gets a space.

**Looks wrong and is right.** Legge's spelling and terms: befal, downfal, enterprize(s), tranquillization, calendaric, sovereignship, pummeloes, dryandra, Rottlera Japonica, Achillea millefolium, bœhmerea, phœnix, dropt, spake · Romanised Chinese (the text is Legge converted to pinyin): chun trees, qiu jade, lin, lang-kan, yao and kun stones, the cyclical days dingsi, dingwei, Wu Wu. Four cyclical-day names in ch 5 keep Legge's older romanisation beside pinyin ('hsin, ren, kwei, and jia'; also 'hsing' in the notes) — an inconsistency of the conversion, not a scan error · Gaubil's French quoted in the notes: 'les huit règles du gouvernement', 'les cinq hing', 'les apparences', 'Selon les anciens documents' · The asterisks after some sentences ('take it as his pattern.*', 'irreverence;*') are Legge's own mark in the Sacred Books of the East for passages bearing on religion; brackets ( ) are his supplied words: (step-)mother, (sounding-)stone, high(-minded) · 'that that virtue', 'that that monarch', 'Wu Wu' are right; scan.txt pairs are all right

**Links.** The linker matches 'Yao' inside two-word names. Modern provinces and cities in Legge's notes are right.

## `book-of-rites` — The Book of Rites

Applied: **56** · held: 5 · links off: 7 + 0 per chapter

**How it reads.** Both samples read as Legge's translation with paragraph numbers and footnote markers in place and no garbage; the faults are small and of an OCR kind — lost apostrophes ('one years mourning', 'my mothers death'), a stray capital ('with Its two ends'), a space left before punctuation — and the text keeps the scan's hard line breaks inside every paragraph, which only shows where a word was hyphenated across a line.

**What repeats.**

- APOSTROPHES LOST IN THE SCAN (20 found and listed; more are likely): possessives print without their apostrophe — 'the rulers doors / horses / court / gate / kindred / vase' (7), 'one years mourning', 'three years mourning', 'five months mourning', 'my husbands father', '(his mothers) body', 'her fathers house', 'humbling ones self'. I found them by searching a fixed list of possessors before a noun; a possessor outside that list will have been missed, so a rule is worth writing: a plural-looking kin/rank word (ruler, father, mother, husband, elder, year, month, one) directly before a noun where the book elsewhere writes the same phrase with 's.
- SOURCE LINE BREAKS KEPT INSIDE PARAGRAPHS: the html carries the scanned edition's hard line breaks (a newline every ~55 characters). Harmless except after a hyphen, where the browser shows a space: 16 places in the text ('tortoise- shell', 'earthen- ware', 'twenty- seven', 'them- selves' ...), all listed, plus one in a note ('expe- dition'). A rule 'hyphen + newline + lower-case letter' finds exactly these 16; the two 'twenty-' and 'tortoise-' and probably 'smart-' keep the hyphen, the rest lose it.
- A SPACE BEFORE PUNCTUATION, 16 places: ' ;' x11 ('definite rules ; should serve', 'one such carriage ; as at', 'Sect, i, 8 ; and'), ' ?' x3 ('(with the living) ?"'), ' !' x1, and one ' .' after a footnote marker in ch 9. Not in Legge's print; a rule can close them.
- ROMANISATION CONVERSION LEFT UNEVEN (not listed as fixes except where plainly wrong): a few names kept Legge's spelling or were converted wrongly — 'hwo', 'jhze', 'lieh', 'lwan', 'hung (has crashed)', 'kwei', 'duke Hwan', lower-case 'zheng Xuan' (ch 9 note), 'Jia and yi' beside 'jia and yi'; and 'Sect, i' for 'Sect. i' four times in the notes of ch 8-9.

**Looks wrong and is right.** All the French of Callery and Biot and the Latin of Zottoli in the notes is quoted correctly apart from the twelve scan faults listed (acte, culte, souche, pourtour, vineuse, viri mulieresque, adhaerebant numini, confinia, subnuba, ejectos ...). 'acte official', 'Trés difficile', 'rigeurs', 'recompenses', 'predominance', 'maceration' may be the 1885 print's own and are left · Pinyin terms are right: beng, cun, qun, sheng, shou (cap), huan ju, Gai Xia, Chi Xing, zhai, weimao, zhangfu, moudui, neiqin, sanlao, wugeng, xinhai, luo, ang ji · Botanical and zoological Latin is right: hovenia dulcis, Euryale ferox, hibiscus syriacus, cicada viridis, rhinopithecus Roxellana, azarolus, sonchus, dolychos (Legge's spelling) · Legge's own words: ballaces (so printed; a bullace plum), pandean pipes, internuncius, representationists, Heaven-sonned, chisseling (quoted), tussel-pondweed, feastroom, mourningdress, peachwand, undermats, 'deported himself', Didis · '&#8195;' before verse lines is an em-space entity in the html and renders as a space; 'APPENDIX TO BOOK II.' is a real sub-heading (bk-head) · the rest of the .scan list (beard, farmer, severity, farmed, locks, beads, stare, Hunan, moles, inferred, mirror, halls, beams, waits, mariage) is correct

**Links.** The Tan Gong anecdotes are full of personal names that collide with entries.

## `prose-edda` — The Prose Edda, Snorri Sturluson

Applied: **10** · held: 5 · links off: 7 + 0 per chapter

**How it reads.** The two samples (Thor's fishing and Baldr's death; kennings for Christ and kings) read well as Brodeur's prose and verse, but each contained one misreading no scanner had flagged ('bow Thor flashed', 'had by, every king') — a fair sign of what is left.

**What repeats.**

- The scan behind this text misreads letters into real English words (and→arid x2, how→bow, he→be, sons→soils, Eyes→Eves, Norns→Norris) and scatters stray points ('dragged. away', 'had by, every', 'furiously .', 'kin. where'). 15 fixes are listed, found by scanners, regex sweeps and the two samples (each sample held one). Slips of the real-word kind cannot be found mechanically, and no second copy of Brodeur could be fetched for a collation, so more of them very probably remain, above all in the skaldic verse of Skáldskaparmál where nothing reads 'naturally'.

**Looks wrong and is right.** Brodeur's archaic diction and kenning compounds: boune, birnie(s), birnied, bitter-mooded, gray-sarked, browlights, threesquare, moisty-deep, thickling, honor-lessener, saters (those who sate) of hungry ravens, unminished, wightness, maintainedst, speirest, sward-sweeping, fallow fell-wall, and the -èd / -eth / -est forms · Old Norse, Old English, German, Greek and Latin in text and notes: bragr, drápa, kenningar, galdr, díar, lið / líð, hlíð, gesta hús, fyrgen, wearg, würgen, 'Non Angli sed angeli', ἅπ. λεγ., φεγγάρι · Capitalisation of kenning-names varies by line and is the edition's (Gold-top / Gold-Top, Elf-home / Elf-Home, Wide-blue / Wide-Blue, She-Wolf / She-wolf, All-Ruler's / All-Rulers, 'snow-Heaps'); Thóroddssen left as printed · 'King of Angles who governs England' is right (the note on Gregory's pun depends on it); 'had had', 'that that' are grammatical · Rows of spaced dots in the verse are the translator's lacunae; '&#8212;' is a dash entity that renders correctly · scan.txt: clown, sward, saving, tittle, slaver, haying, seals, steep, fears, paint, awake, bidden, tower, grave, pointed, stored, waiting, dearly, wails, fallow are right; norris and soils fixed

**Links.** Skaldic lists of capitalised common nouns in Skáldskaparmál are where the stray matches come from; note that 'Month' matches Montu's alias (also in the Quran).

## `poetic-edda` — The Poetic Edda

Applied: **9** · held: 3 · links off: 5 + 1 per chapter

**How it reads.** Three samples (Hymiskvitha introduction and stanzas, Helgakvitha Hundingsbana II, Atlakvitha) read well: half-lines separated by em-spaces, stanza numbers in spans, speaker lines in italics. The transcription has a typist's layer of slips (a dozen found), mostly in Bellows's introductions and notes; one punctuation slip found by reading.

**What repeats.**

- Quotation marks are straight (") throughout except two curly pairs in ch7 (Hymiskvitha stanza 6: “May we win … ” / “Aye, friend, we can … ”) — 2 lines, cosmetic; straighten or leave.

**Looks wrong and is right.** Old Norse words quoted in the notes are right: arma / aldna, hamr, sona / sofa, api, feigr, nifl, ragna rök, sekr, kartr, nauth, nitti / hlitti, fylgja, gunnfani, herathsthing, ægis-hjalmr, husfreyja, limrunar / lifrunar, loupgarou · Bellows's verse archaisms: badst, leavst, comst, makst, gavst, elfbeam, scather (of twigs), swordblade(s), gold-o'erlaid, o'erlapped, bewared, Strond (a river name) · Name variants Wise-Woman / Wise-woman, Hel-way / Hel-Way, Sun-Bright / Sun-bright, Victory-bringer / Victory-Bringer differ only in capitalisation between verse and notes — not slips · Rows of spaced dots (. . . .) mark lacunae in the manuscript — the edition's own convention, not garbage · Scan list (stain, bands, slaver, fells, wroth, coining, vogue, 'Manna' in the note on Nanna, farce …) — all correct in context

## `don-quixote` — Don Quixote, Miguel de Cervantes

Applied: **3** · held: 16 · links off: 16 + 1 per chapter

**How it reads.** All six samples read as clean Ormsby prose, faithful to the Gutenberg text line for line: no scan garbage, no stray numbers, verse and italics in place. The only faults are those Gutenberg's own transcription carries — three plain misprints, one proverb word spelled two ways, and compounds that lost a hyphen at a line end.

**What repeats.**

- HYPHENS LOST AT THE SOURCE'S LINE ENDS (14 listed as 'probable'): the Project Gutenberg file itself (I compared it) prints 'tillageland', 'sowgelder', 'loveletter', 'fishingrod', 'huntingcoat', 'woolcarders', 'pinprodding(s)', 'quickwitted' — each exactly where a compound fell at the end of one of its 70-character lines — while the same words keep their hyphen in mid-line ('pin-proddings', 'quick-witted', 'fishing-rod'). So the import is faithful and the slips are upstream. Only the ones that make a non-word can be found by spelling; a joined compound that is also a dictionary word (bonelace x2, brookside, wonderstruck) is left alone.

**Looks wrong and is right.** Sancho's and others' blunders are the joke and are corrected in the next line of dialogue: presonages, cackneys, estility, omecils, phlegmatics, logiquous / longinquous, cirimony / cirimonies, shylands, sagittarius, abernuncio, tortolites, gravelling · the Countess Trifaldi's mock superlatives: immaculatissimus, readissimus, servissimus, willissimus, Manchissima, Duenissima, squirissimus · Spanish, Moorish and Italian words Ormsby keeps: sayas, cuartos, cuartillos, sueldos, decimas, redondillas, manjar blanco, olla podrida, primera, patena, a la gineta / jineta, sambenito, tizona, cuatrero, zagals, albogue, berengenas, lelilies, lladres, carcajes, cianis, zoltanis, pasamaques, tameji, macange, Cava rumia, more turquesco, spilorceria, 'jur a Di', 'tus, tus', piace · Ormsby's English: blanketers / blanketeers (both forms are in the source), janizzaries, pannel, petrals, plaisance, pipkinful, processionists, unwalletted, stoodst, merry-andrew, dumbfoundered, 'heard to utter rational word' · 'fall in in line' (ch 112) is not a dittography: 'making his men fall in / in line' · the .vary pairs (Panza's / PANZA'S, Ill-advised / Ill-Advised) are chapter titles against running text; the whole .scan list is correct words (Tully, Foces, Sanchico, Torre di Nona, wroth ...) · 'neigbbour's' occurs only in Folio's own introduction, where it is quoted as an example of a slip

**Links.** A modern-place entry catching a saint, family or common word is the pattern (Santiago, St. Paul, Saint Martin, Providence, Medina, Israel, Paris once). The modern country entries for Spain, France, Greece, Turkey, Egypt and the rest are left as right for a book of 1605–15.

## `satyricon` — The Satyricon, Petronius

Applied: **28** · held: 13 · links off: 20 + 4 per chapter · 3 link(s) left open

**How it reads.** Both samples (the werewolf story's opening, the Civil War poem) read as clean Heseltine prose with no wrong words. The faults of this book are mechanical — joined line ends and the half-converted quotation marks — not misread letters; only four letter-level slips were found (dve, rrimalchio, Gitoii, arid).

**What repeats.**

- Quotation marks are in two systems at once: 422 speeches are wrapped in <q>…</q>, and about 70 literal straight double quotes are left in the text of 42 of the 141 chapters, usually half of a pair — a speech's second part opened with a bare " and closed with </q> ('…young man,</q> he said, "and what is most unusual…'), or a paragraph closed with " that was opened with nothing ('…pinches like a crab."'), or mixed marks ('shouted Eumolpus, "you dare threaten us.''). Needs one rule-based pass; not listed row by row.
- No space before an opening <q> 42 times ('and said,<q>Please, mother', 'I said.<q>Well, you fool', 'said Gitoii,<q>persuade') against 315 with the space; and twice none after </q> ('31st,</q>the other', 'rueleaf.</q>Rutae'). Fix by rule: a space between [a-z,.;:!?] and <q>.
- Line-end hyphens were dropped and the halves joined: 14 real compounds lost their hyphen (diningroom, fellowfreedmen, fortunehunters, winecup, planetrees, suckingpigs — these six are attested hyphenated elsewhere in the book and are 'certain'; hidingplace, olivebranch, senatehouse, vineleaves, waterpots x2, windingsheet, woodpigeon, seaspoils, pureminded, rueleaf are 'probable'), and 10 pairs of separate words were run together (chainson, formy, wayis, eleganttours, limbsto, andtook, shalldestroy, far-offland, cooking-poton, Stab-inthe-dark). All listed. More of the first kind may hide where the joined form happens to be a dictionary word.
- Capital in mid-sentence (With x3, Considered) and a full stop lost before a capital (2) — listed.

**Looks wrong and is right.** The Latin passages left untranslated by the Loeb editor (ch. 23–26, 79, 85–87, 113, 130, 132, 134, 140) and Latin words in the notes — correct; their quotation marks ('rogo' inquit 'domine, ubi est asturco?") share the general quote disorder · '/' in ch24 and ch132 marks a verse or page division inside the Latin; '. . .' marks the lacunae of the text — the edition's · 'becafico', 'peachick', 'oxherds', 'bathful', 'ma'am', 'hors d'oeuvres', 'tengomenas', 'antescholanus', 'ocliferius', 'Bacalusias', 'Barcala' — correct · 'bellyfull' (ch58): a slip for 'bellyful' (once elsewhere) or 'belly full'; not listed, the right form is not certain · 'He drew back his spear arid the belly of the horse' (ch89): 'arid' is a scan error, but for 'and' with a verb lost after it or for 'at' cannot be told without the source; not listed · 'rushed in in a fury', 'all that poor man is is nothing', 'had had', 'in you you will think' — grammatical · Scan-list pairs (bands, tying, fired, hoard, block, locks, month, check, aught) — all the right word · &AElig;neid in three notes is an entity and renders as Æneid

**Links.** The novel's characters carry famous names (Agamemnon, Lichas, Circe, Lycurgus, Gorgias, Ganymede, Croesus, Dionysus, Daedalus), so the high-count keys are namesakes; the mythological and geographical links in Eumolpus's poems are otherwise sound.

**Links left open.** `Augustus` — ch30/57/71 'priest of the college of Augustus' (a sevir Augustalis) is right; ch60's toast 'The gods bless Augustus, the father of his country' is to the reigning emperor under his title — whether tha · `Bosporus` — 'the conquered Sea of Bosporus' in the praise of Pompey (ch123): probably the Cimmerian Bosporus of Mithridates' kingdom rather than the strait at Byzantium; the translator's note only says 'he passed · `Africa` — Roman usage: the province / North Africa (Trimalchio's estates reaching to Africa, African figs, 'fowls from Africa') — the same land but the entry is the whole continent; switch off if Asia's contine

## `ramayana` — The Ramayana, Valmiki

Applied: **23** · held: 12 · links off: 19 + 2 per chapter

**How it reads.** The six samples (1.55, 2.45, 2.118, 3.65, 4.67, 6.70) read as clean verse with consistent diacritics (Ráma, Lakshmaṇ, Vaśishṭha) and correct line breaks; two faults a spell scan cannot see turned up in them ('When [they] the steps of Ráma viewed', 'wandering' for 'wondering'), which suggests a thin scatter of similar single-word misprints across the 500 cantos. The one serious fault is the split quotation markup described under systematic — the samples strip quotes, so it shows only in the html.

**What repeats.**

- QUOTATION MARKS ARE WRONG ON EVERY SPEECH LONGER THAN ONE VERSE LINE (about 1,900 speeches; ~3,250 of the book's 3,549 <q> elements). The importer balanced quotes line by line: a line that only OPENS a speech is closed at its end, the middle lines are bare, and the line that only CLOSES it is opened at its start. Examples: ch18 'And said, <q>Now speed away</q><br>To Kaśyap's son … <br><q>Show me the favour I have won.</q>' (source: “Now speed away / To Kaśyap's son … / Show me the favour I have won.”); ch18 '<q>The high-souled father of his bride</q><br>Had called thy son … <br><q>Thy noble child is come again.</q>'; ch310 'He who beyond tho month shall stay<br><q>Will with his life the forfeit pay.</q>'; ch111 '<q>Choose us, O glory of the throne,</q><br><q>Choose us, or Asamanj alone.</q>' (one speech shown as two). The reader sees a closing mark after the first line and an opening mark before the last. Fix by rule in the importer (let a <q> span <br>s, pairing an unbalanced “ line with the next unbalanced ” line); no <q> in the book currently contains a <br>. The same damage is in notes that quote verse (ch39 n4 Virgil, ch356 n1 Ariosto).
- The Gutenberg source reproduces the misprints of the 1870-74 Benares/London edition, so the residue is printer's and scanner's slips of single letters (about 30 found: brillant, disolate, saguine, streched, vanquised, latice, cheuries, 'was be', 'tho month', 'in tight', 'graves adorn', four 'the the'). Italic words are not reached by the spell scan — three slips sat inside <i> in one note (darhha, cerbena, plus the roman 'Pea').

**Looks wrong and is right.** Griffith's -t participles are deliberate: banisht, flusht, scorcht, astonisht, burnisht, fixt · All o'er- compounds (o'ercast, o'ertakes, o'erweening, o'erwatched, o'erarching …), whosoe'er, deemst, splitten, miened, braceleted, coralled, steelproof, winecup, midsky (Milton quoted), countryfolk, blackdeer's, flowret's · o'erspred (ch195) rhymes with 'shed' — the poet's spelling, leave; counsellers (ch187) is a period spelling, leave · anothers' hest (ch87) and foemens' might (ch42): the edition's own placing of the apostrophe, leave · 'beseiging' in ch186 note quotes Milton's own spelling ('beseeching or beseiging', P.L. v. 869) — leave; 'His owne two hands' quotes Spenser · Sanskrit, Persian, Latin and Italian in the notes are right as printed: Múlam utsṛijya kasmát tvam …, Yùnas andar-i-dihán-imáhi shud, turpissima bestia, Dea Fortuna, the Ariosto stanza (talor, stelle, tutte), Gorresio's Italian plant list (vitici, michelie, diospyri), botanical binomials (Borassus flabelliformis, Artocarpus integrifolia, Gracula religiosa, Bauhinea variegata, Bignonia suaveolens, Lythrum fruticosum), dherna, arbuda, munja, Vilva, khadira, Ka(m)bujia, Centicide · '&mdash;' in the ch1 note is a proper HTML entity in the shipped html, not printed markup · Name pairs: Hanumán/Hanúmán are both Griffith's (metre); Wind-Gods (ch41 note, plural), Self-Existent, Serpent-gods, Rose-Apple are capitalisation variants, leave · Scan-list real words right in context: laves, tabours, haled, hinds (labouring hinds), rifted, broad-wayed, 'Nor wanted lakes', glean, steeps, decoyed

**Links.** Verse with a capital at every line start, so many common words and verbs are caught (Afar, Touch, Sound, Gilds, Deserts, Shouts, Elder). Griffith also uses Greek words for Indian beings (Titans, Nymph, Immortals). Soma is mostly the Moon-god here; left on because the entry covers the god as well as the drink.

## `ptahhotep` — The Maxims of Ptahhotep, Ptahhotep

Applied: **0** · held: 1 · links off: 2 + 0 per chapter

**How it reads.** Read in full (it is short): clean, with the translator's brackets, queries and notes intact; one slip.

**Looks wrong and is right.** Gunn's archaisms are right: fivescore, elbowers, wouldest, 'none account', 'an happy moment' · 'thou may' (x3: §A, §24, §33) is a consistent subjunctive - left · 'Vezier' once (§B) beside 'Vizier' twice (§A) - left · the queried words '(?)', the ellipses and the square brackets are the translator's

**Links.** Six keys only; the other four (Vizier, Upper and Lower Egypt, Osiris, Horus) are right.

## `boethius-consolation` — The Consolation of Philosophy, Boethius

Applied: **2** · held: 4 · links off: 1 + 0 per chapter · 2 link(s) left open

**How it reads.** I read 12 samples (about a quarter of the book) after the first two each showed a slip. Prose and songs are otherwise clean and well formatted; the slips are real-word scan confusions (needfully, shall, Alva's) that no dictionary check finds, so a few more of the same kind probably remain in the unread three quarters.

**Looks wrong and is right.** Verse elisions and archaisms are right: whene'er, o'erclouded, o'erhasty, o'erwash, phrenzied, usedst, stablish, unstability, astonied, Guid'st · 'ex nihilo nihil', 'bks.' are right · Bootes, Phœbus, Timæus as printed

**Links.** A clean book: the philosophers, poets, Roman figures and places Boethius names are the glossary’s. The capitalised first words of verse lines are the only trap (Wheels as a verb; Gold and Tyrants are meant literally).

**Links left open.** `Philosophy` — x5: here Philosophy is the lady who appears to Boethius and speaks throughout (‘Philosophy appears to Boethius, drives away the Muses’) — a personification, but of the very thing the entry describes; · `Earth` — x3 in the verses: ‘Earth’s enclosing bounds how small’ beside the wide heaven is the globe in the cosmos (right in sense), while ‘Earth’s chains’ and ‘Earth’s conflict won’ mean earthly life — the sam

## `morte-darthur` — Le Morte d'Arthur, Thomas Malory

Applied: **3** · held: 5 · links off: 10 + 0 per chapter

**How it reads.** The five samples (Books IV, VIII, X, XIII, XX; 22,500 characters) read clean: no scan garbage, no stray page numbers or running heads, chapter numbers and Caxton's headings in place. The transcription is a careful proofread of the 1906 page; the eight faults listed are all that the candidates, pattern searches and samples turned up. Two of them (thy led, departtion) are certain whatever the print has; the scan images could not be fetched to see whether the others are the transcriber's or the compositor's.

**What repeats.**

- Straight apostrophes in Book I: 72 possessives are typed with a straight quote (Sir Ector's, King Uther's, men's, lords' — 67 in Book I, 2 in Book II, 3 in Book XX) where the other 1,200 in the book are curly. Not a wrong word; fixable by rule [a-z]'(s/\s) -> ’.
- Book I (and it alone) is one line per paragraph, while Books II–XXI keep the printed page's line breaks as newlines inside each paragraph (about 28,000 of them). Harmless in HTML, but any search for a phrase must allow a newline for a space in those twenty books.

**Looks wrong and is right.** The 268 dictionary candidates are Caxton spellings and Middle English that the Everyman text keeps on purpose (hool, eure, bycause, daunger, boyshe, lyth, enelid, beamous, armyvestal, rownsepyk, umberere, ubblye, matchecold, shaftmon, noseling, pelowres, gretys, lycours, orgulite/orgulyte/orgulity) — all right. · Words printed solid by the edition — 'knightcoward' was checked against the page scan (Vol. I p. 383) and stands so in print, and the rest are taken to be the print's as well: goodlady, foras, otherelse (twice), wormeaten (twice), leastway, morntide, morrowtide, woodside, garmake, withinforth/withoutforth. Not run-togethers of the importer. · 'With this this knight rode his way' (IX), 'all as it was it was rehearsed' (IX), 'that that' and 'had had' throughout: grammatical, not dittography. · Old comparatives and superlatives: courteoust, mischievoust, periloust/perilloust, wholer, wrother, wooder, sinfuller, falslier, traitorlier, largelier, richlier, valianter, shamefuler — right. · Names spelt more than one way are Caxton's own wavering and are left: Palamides/Palomides, Isould/Isoud, Lancelot (once)/Launcelot, Gawain's/Gawaine, Uwain's/Ewaine's/Uwaine, Merlyn's/Merlin, Agravine/Agravaine, Galiodin/Galihodin, Dodias/Dodinas, Kehidius/Kehydius, Dolorous Guard/Gard, Persaunt/Persant, Hermaunce/Hermance, Colgrevaunce/Colgrevance, Surleuse/Surluse, Tauleas/Tawleas, Reynold/Raynold. · Lower-case 'sir' twice in IX ('Then was sir Palomides abashed', 'then said sir Tristram'): possibly the transcriber's, but harmless and not verifiable — left. · The second scanner's list (broke, strake, arase, heated, savest, bated, foiled, assoiled, hough, croft …) is all sound Malory in context. · Latin and French tags: Hic jacet Arthurus Rex, quondam Rex que futurus; Lesses les aler; Explicit Liber Primus; Breuse Saunce Pité.

**Links.** Knights' names that collide with places and gods are the pattern; the long glossOff list had already caught the countries.

## `marco-polo` — The Travels of Marco Polo, Marco Polo

Applied: **11** · held: 0 · links off: 17 + 2 per chapter · 3 link(s) left open

**How it reads.** The 16 text samples and 10 further samples I drew from the notes (about 100,000 characters) read cleanly: no scan errors, no run-together or split words, no stray page numbers; this is a carefully proofed transcription and the only real faults found are one split name and ten orphaned sub-footnote markers in the notes. Formatting is consistent (Yule's ellipses for lacunae, e.g. 'the thousand they call...; the hundred Guz; the ten....', are the edition's).

**What repeats.**

- Dangling sub-footnote markers in the notes: 10 bracketed numbers ([1], [3], [5], [5], [1], [7], [10], [9], [1], [8]) stand after a quoted verse or inside a blockquote in the notes of chapters 24, 37 (two), 40, 42, 79 (two), 149, 168 and 176. They are Yule's footnotes to his own notes; elsewhere the importer folds such a footnote into the note in square brackets (e.g. ch156 note 3, '[See the mention of the I-ning Fang ... (See Note 3, above.)]'), but for these ten the footnote text is not in the shipped book at all and only the marker is left. Examples: 'Thou shalt find trowes[5] two', 'Fa spere[5] e in aqua poni', '(Longfellow.)[1]'. All ten are listed as fixes (remove the marker); restoring the ten footnote texts from the source would be the better repair.
- Not a fault, for information: ch156 note 3 ends 'The double lines represent streets, and the ‡ are gates.' — the caption of a plan that is not shown; and the same note carries a sub-footnote folded into the middle of a quoted sentence ('though the Fang, [See the mention ...] of which a few still exist'), which reads awkwardly but loses nothing.

**Looks wrong and is right.** All of the ~510 dictionary candidates but one are correct: they sit in quotations Yule and Cordier give in Middle English (Chaucer, Gower, Kyng Alisaunder, Maundevile, the Golden Legend of 1527: 'hundrod', 'mountas', 'buth', 'trowes', 'anguysshous', 'felawshyp'), Old French and Franco-Italian (the Geographic Text: 'couiereque', 'zinzinz', 'en fra tere'), Italian, Portuguese, Spanish, Latin and German. Leave every one. · Transliterated Chinese, Mongol, Persian, Arabic and Tibetan names and their parts (Hiung-nu, Si-hia, Tu-K’iu, P’u-erh, Ssŭ-mao, Tútíá-i-zard, Kun-tu-zang-po, K’harosḥṭhi printed with italic letters) are correct. · The 121 'names written two ways' are the different romanisations of Yule, Cordier and the authors they quote (Yun-nan / Yun-Nan / Yünnan, T’swan-chau / Ts’wan-chau, Kan-Suh / Kan-suh, Ning-hia / Ning-h’ia): none is a slip to correct. · Polo's own names in Yule's text are right as they stand: Cogatal (Prologue ch. 7) is a different person from Cogatai (II 23); 'Mongu Kaan' (II 46), 'Sinju-matu', 'Kian-suy', 'Togan', 'Conchi'. · Variant forms Yule cites on purpose: Cangigu, Ghinju, Unguem, Soucara, Chouka, Sandur, Sumotra, Cobinam, Caracoran, Canbaet, Pacen, Comori. · Period spellings: decyphered, checquer, cruize, equipt, befel, sammet, lechour, lignaloe, sendels, spitoons, rabdomancy, myrobolans / mirobolans, canework, smokehole, fogbank, waterspreads, supercession, interdivergence, undubitable, celibatary, desumed, amianth, salammoniac. · Abbreviations: drs., ozs., kil., kilom., kilog., diam., orig., herausg., Sep. abd., adj.; 'pic-nic', 'hocus pocus', 'mish-mash', 'fac-similes', 'papier-maché'. · Grammatical doublings: 'had had' (three times), 'that that', 'is is' ('what water there is is bitter'), 'long long Day', 'dont vous vous merveillez', Chinese 'kin kin', 'hui hui'. · Square brackets with a year or a number ([1294], [1886], '[25] days’ journey') and bracketed passages in the text are Yule's and Cordier's editorial insertions, not markers. · Two things I could not settle without the printed book and therefore left: 'the Great Khan' twice in II 4 (ch83) against 273 'Great Kaan' in the text, and 'though these who do not choose to do so' in II 24 (ch103), which may be the edition's own 'these'. Also 'Ya’úbkíy' (ch23 note 2), which looks like a transposition of Ya’ḳúbíy, and 'all of pure, silver!' (ch155 note 4).

**Links.** Yule's translation keeps Polo's medieval geography, so several famous names mean something else: the Levant is Mongol Persia, Babylon and Babylonia are Egypt, the Tigris is the Volga, Java the Less is Sumatra. Oriental names and titles also collide with classical entries (Barca, Melic, Samara).

**Links left open.** `Euphrates` — 'into it flows the great River Euphrates and many others' is said of the Sea of Ghel (the Caspian), a geographical error of Polo's — the text does name the Euphrates, but the river meant cannot be it · `Sovereignty` — 'right well did he maintain the Sovereignty they had given him' (Chinghis chosen lord) — lordship in the plain sense; the entry is the modern legal concept, already switched off in Rousseau · `Castle` — x5 on the generic word ('The Castle of the Fire-worshippers', the Old Man's Castle) — right in sense, though the entry is the European lord's castle

## `bede-history` — The Ecclesiastical History of the English People, Bede

Applied: **6** · held: 0 · links off: 15 + 3 per chapter · 3 link(s) left open

**How it reads.** Both samples (II, 19-20 and Drythelm's vision in V, 12) read as clean, carefully proofed Sellar: chapter headings, bracketed dates and footnote markers are in place and there is no scan damage. Apart from the six doubled words the book is the cleanest of my six.

**What repeats.**

- DOUBLED WORDS, 6 (all listed): 'the the' x3, 'of of' x2, 'in in' x1 — the only class of fault in the book; a search for any other immediately repeated word finds only two grammatical 'that that'.

**Looks wrong and is right.** every dictionary candidate is Latin or Old English quoted in Sellar's notes and is right: a vico Cataractone, de aeternitate animae, vir in rebus ecclesiasticis sublimiter institutus, reversus est ad insulam Hii, in provincia Undalum, ex synodica sanctione, Ventanus antistes, vir sine fraude bonus, De locis Sanctis, castellum muris cinctum, studeretur / sanari potuisset, Lucem tuam Ovino, Acceptum sacerdotii gradum, episcopum quem petierant, caeco carpitur igni, in oppido municipio, primicerius notariorum, stratus regaliter, villicus / vicus, dumetum, perdocuit, clauditur, juvenis; 'gebæd hus 7 ciricean', 'masse-preost', Colum-cille; S. Lorenzo fuori le Mura · 'archchanter' (IV, 18) is Sellar's word for archicantator · 'that that' (ch 1 and ch 4) is grammatical both times · the .scan list (beard, bands, atone, safely, fears, mouths, brake, stumbling-block, Torthere, Stokes ...) is all correct

**Links.** Late-antique and early-medieval namesakes of classical figures (Abbot Hadrian, Tiberius II and Maurice, Justinian II, the Pelagian Agricola, Lucius Verus as 'Commodus', King Ida), English place-names rendered in Latin or English (Cataract, Rutubi Portus, city of Legions, Goat's Head), and saints matched to American cities. The book's five chapters are Bede's five books.

**Links left open.** `Roman_legion` — the one link is on 'the city of Legions, which by the English is called Legacaestir' — a place-name (Chester), though it is named after the legions · `Huns` — chapter 1 (Bledla and Attila, kings of the Huns) is right; in chapter 5 'the Huns' stand in a list of Germanic peoples of the continent beside the Frisians, Danes and Old Saxons, where Bede probably m · `England` — x4: the translator's 'England' for the lands of the English in the 5th–7th centuries; the entry is the modern country of the United Kingdom — the same case as the switched-off Great_Britain and Irelan

## `rigveda` — The Rigveda

Applied: **467** · held: 62 · links off: 16 + 0 per chapter

**How it reads.** The five samples read well for long stretches and then trip: in 9,000 characters I met 'Viyu's' for Vayu's, 'PASSED through, the fleece', and a full stop in mid-clause ('sacrificed of old. hadst pleasure'); my own scans of the whole text then turned up the 529 listed faults, about one for every two hymns, plus one hymn with no text (1.179), one that is not Griffith's translation (10.34) and one with a foreign stanza (10.86). Formatting is otherwise regular (numbered stanzas, two lines each), but the text mixes two transcriptions — seven hymns with diacritics and footnotes among 1,021 in bare ASCII.

**What repeats.**

- THE WHOLE BOOK is an unproofed scan: Griffith's text as machine-read (the file's source is Wikisource; the '--JBH' note left in hymn 1.179 shows it descends from the sacred-texts.com e-text) with its errors intact. I found and list 529 separate faults in 1.7 million characters, and that is certainly not all of them — non-words and slips that the neighbouring words betray are covered, but a real word that still makes some sense can only be caught by reading the whole text against the print. No rule can repair these (each is a different word), so, against the brief's limit of 5 rows per class, every instance I verified is listed in `fixes` with an exact, unique `from`. A re-import from a proofed transcription would be the sounder repair; if that is not possible, these rows can be applied as they stand.
- b read for h and h for b — about 60 instances, all listed: 'he' for 'be' 24 times ('may we he lords', 'To us he born a son', 'he ye ready'), 'be' for 'he' 12 times ('For be is true', 'born be hath come'), 'bast' for 'hast' 5, 'beard' for 'heard' 3, and bad, bead, bard, bide, berd, bim, tbou, tby, hatb, migbty (3), bebaved, bealeth, Purandbi (2).
- li, di, tl read for h, th — 'lie' for 'he' 9 times ('hath lie held in check', 'lie is the sacrifice'; 'lie' is correct in ch162, 243, 602, 620, 649, 888, 922, 999), 'die' for 'the' 7 times ('of die meath of Soma', 'in die days of old'), Tle / Tlat / Tlou for The / That / Thou. All listed.
- c read for e — 'cat', 'cats' for 'eat', 'eats' 13 times ('thou didst cat a thousand buffaloes', 'what cats not and what cats'), 'cast' for 'east' 4 ('Come from the west, come from the cast'), 'cheek' for 'check' 3, and arc, scat, car (for ear), c'en, secm'st, Onc. All listed.
- Proper names misread — about 60, all listed: capital S and R of the print read as G / g (Gakra 2, Gatakratu, Turvaga 5, Etaga, Matarigvan, Syavagva, Dagadyu, gipivista, gunahotras, Gbhus, gcas); 'Sorna' for Soma 5; 'Sarya' for Surya 5; Viyu / Vaya for Vayu; Varuva, VaruVa, Varuina, Varuni3 for Varuna; Atvins (2), Nisatyas (2), Maruis, Martus, Visniu, Visinu, Adid (2), Aaiti, Aini, Agn;, Makhavan, Pasan, Aigiras, Jatayedas, Rbus, India for Indra.
- Digit for letter — 26, all listed: the digit 1 for the pronoun I 22 times ('1 call the Sage', 'Stronger am 1, O Stronger One', 'No Dame hath ampler charms than 1'), '1n' for In, 'Gods 1' for 'Gods!', 'f6r' for for, 'Varuni3'.
- Words run together or a hyphen lost — 68, all listed: 'fullof', 'favourof', 'tobattle', 'hewho', 'thejuices', 'splendoursmost'; and compounds whose hyphen fell out although the book hyphenates them elsewhere ('praisesong' against 19 'praise-song', 'oblationbearer' against 18, 'farspreading' against 11, 'WonderWorkers' against 23).
- Stray full stop inside a clause — about 200 (a point followed by a space and a small letter stands in 204 places in 175 hymns). Listed: the 20 that sit inside a compound or a word ('Soma. presser', 'praise. song', 'to. morrow', 'streng. then', 'plea. sure', 'Goddes. s'), the 3 'Indra. and Vayu / Brhaspati / Varuna', and 5 plain examples ('with. his sharp bull', 'The. princes who', 'Then. he who', 'have. praised thee', 'hath. cut piecemeal'). NOT listed: the other ~175. Deleting the point is right for roughly three in four ('And may he. duly bring', 'Indra. spares him', 'that Indra. grants'); in the rest it stands for a comma or colon ('riches, Indra. be thou no trafficker', 'sacrificed of old. hadst pleasure') — deleting it there leaves only a missing comma, so the rule 'drop a full stop that is followed by a space and a lower-case letter (not etc.)' is safe to apply to the whole book.
- Punctuation debris, listed except where the print is needed: two marks together 28 times ('keep us., O Soma', 'Maruts,, may', 'of old,. Navagvas', 'mounted..') — 22 listed; the 6 at a line end where I cannot tell which mark is the true one are ch640 'rain.,', ch679 'beheld.,', ch709 'heaven.,', ch767 'stream.,', ch689 'grass,,', ch741 'sieve,:'. A space before a stop 14 times ('O Indra , yield') — 11 listed (ch313 twice and ch331 also have a small letter after the stop). A comma or point in place of a space 13 times ('for,the singer', 'Dawn.is come'). A stray apostrophe 12 times ('worthy of' our wish', 'singers 'sip'). A stray hyphen 5 times ('who- prays').
- A line or stanza opening with a small letter or a garbled first word — about a dozen, listed ('give us not as a prey', 'rn all thy forms', 'lle strong man', ''nose who spin out the sacrifice', 'ne Deities').
- CONTENT MISSING OR FOREIGN (cannot be carried by a from/to row; needs the source): (a) ch179 (hymn 1.179) has no hymn at all — its whole text is the e-text editor's note '(The following Hymn was originally only found in the Appendix, with certain lines translated in Latin.--JBH.)'. (b) ch923 (10.86): stanza 13 has lost its second line, stanza 14 is not Griffith but two sentences of foreign matter ('The planets and satellites whose motion is seen to be destroyed in the sky are thirty-five. In the beginning, all the planets and satellites were dependent on the last part of Revati Tara...'), stanzas 16-17 are absent and the last stanza lacks the refrain. (c) ch871 (10.34, the Gambler's hymn) is not Griffith's wording but a modernised version with bracketed glosses, double quotation marks and diacritics ('[They say:] "I find no more use in a gambler than in an aged horse which is for sale."', '[= fellow-gamblers]', '[probably to steal]', 'Vibhīdaka', 'Mūjavant'). (d) ch934 (10.97) has an editor's alternative written into the verse, 'that Bipra/sage's name' (listed). (e) Two '[sic]' of the transcriber stand in ch192 and ch196 (listed) and a footnote asterisk in ch665 (listed).
- Stanza numbers lost, so that two stanzas print as one — 5: 1.91.18 (ch91), 5.44.14 (ch398), 5.55.8 (ch409), 10.48.7 (ch885), 10.132.5 (ch969). In ch713 the number 29 is printed as '2' followed by a section sign (listed). ch898 (10.61) jumps from stanza 4 to 10 and ch923 from 15 to 18: Griffith gave those stanzas in Latin in his appendix (as he did 1.126.6-7, which ARE present here in Latin) and the e-text dropped them.
- Markup left as characters: four lines that consist only of the entity '&#32;' (ch1, ch32 twice, ch355) — an empty line; and four 'ñ' written as the entity '&#241;' (Kara&#241;ja ch53, A&#241;jasi ch104, Mu&#241;ja ch161 and ch191), which display correctly only if the reader's page decodes entities.
- The book is two transcriptions mixed: hymns ch1, 32, 205, 323, 355, 419 and 637 (and the foreign ch871) are from a proofed text with diacritics, curly quotes and em-dashes (Vṛitra, Dâsas, Sûrya, Ṣushṇa, Varuṇa, Pṛidâkusânu) and three of them carry the only footnotes; the other 1,020 hymns write Vrtra, Dasas, Surya in bare ASCII with straight quotes and a hyphen for every dash (written ',-', '--', ' -word' or 'word- ' without system, some 150 times). Nothing to fix by hand, but the reader meets two spellings of every name.
- Seen but NOT listed because the true reading needs the printed book: ch336 'fans him m his way' (in / on), ch61 'high. exalted', ch177 'out. poured', ch214 'kind -prosperer', ch783 'through the fleece then: he runs', ch265 'thy overly storming Friends', ch164 'the sweep is seen, but his figure' (a word seems lost), ch863 'and arm and sure', ch936 'and I roaming among the herd'.

**Looks wrong and is right.** Griffith's contractions are right: o'er, e'en, ne'er, 'twere, 'tis, 'neath, whithersoe'er, whosesoe'er, and every o'er- compound (o'ercomes, o'ertops, o'erthrowing, o'erpast, o'erwhelms, o'ercamest, o'erwhelmedst, o'erthrewest). · Archaic verb forms: heldst, lovedst, guardedst, drave, clave, holpen, holpest, sate, wast, bare, wonnest, purchaseth; 'an hundred'. · Griffith's vocabulary: meath, biesting(s), rede, eld, guerdon, laud, felly / strong-fellied, the Brace (arm-guard, 6.75), the Fist of Indra (the drum, 6.47), filler (5.74, 6.49), cope of heaven, sate, brew, burthen, stedfast. · Names that look like slips but are not: Citra (8.21), Payu, Satri (5.34), Rat (5.46), Suna and Sira (4.57), Yami, Rama (10.93), Anu, Agnis, Pusans (1.184), Vayus (2.11), Go Sarya (8.8), Kapi, Vrsakapayi, Saryata, Krsanu. · The diacritic spellings of the seven proofed hymns (Vyansa, Ṣushṇa, Svaṣna, Rudhikrâs, Dṛibhîka in ch205; Vritra in ch52) belong to that transcription — leave. · The Latin of 1.126.6-7 ('[Ille loquitur]. Adhaerens, arcte adhaerens...') is Griffith's own rendering, not garbage. · Deliberate repetitions: 'again again born newly' (1.92.10), 'By Agni Agni is inflamed', 'Indra Indra, be ours', 'Far far away', 'with conquest conquest-sped', 'Thou, thou alone'. · Compounds: Three-naved, hundred-autumned, three-times-fifty, nine-and-ninety, car-borne, Thunder-armed, awe-inspiring, curry-comb, white-ant. · Every hit of the second scanner is a correct word (drought, staying, tilled, tinder, block, quest, tamed, mature, tires, smile, spoke, paint, goads, hounds, tearless, fender, groin, marred) except Jatayedas and the 'fall of plenteousness' that are listed. · The 17 'names written two ways' are differences of capitals only (Vrtra-slayer / Vrtra-Slayer, Wealth-giver / Wealth-Giver) and a hymn's first word in capitals (MITRA-VARUNA) — leave. · Left as possibly the edition's own: 'ye come electing' (2.39.2), 'With reference whereto' (8.13), 'for wealth' sake', 'all mens' eyes' (1.146), 'truely' (8.80), 'a hundredworth of juice' (4.18), 'the Raksasa.' (10.87), 'smelting like ore', 'house of clay'.

**Links.** Griffith's verse lines start with capitals, so imperative verbs (Taste, Touch, Compass, Crop, Desert) and names that collide with unrelated entries (Sudas, Manus, Sreni, Asvamedha) are the pattern. The big keys (Indra, Soma, Agni, Varuna, Earth) are right.

## `summa-theologica` — Summa Theologica, Thomas Aquinas

Applied: **146** · held: 53 · links off: 47 + 2 per chapter · 3 link(s) left open

**How it reads.** The ten samples read as clean, continuous scholastic prose with no scan garbage, no page numbers and no broken hyphens — this is a keyed text, not an OCR one — but with a steady drip of real-word typing slips (four in the 45,000 characters sampled: 'more perfect that the state', 'gives use to', 'before Cod', 'contained under prudence'), which is why the search was widened to the whole book. Formatting is uneven between the Parts: the First and Second Parts bold their labels and keep paragraphs on one line, the Third Part and Supplement keep the source's hard line breaks inside paragraphs (harmless in HTML), leave the labels plain and carry the 889 bracketed link serials.

**What repeats.**

- LINK SERIALS BEFORE CROSS-REFERENCES — 889 instances, only in ch423–614 (Third Part and Supplement): the source's footnote/link number is printed in square brackets in front of every internal reference. Rule: delete /\[\d{3,5}\](?=(?:FP/FS/SS/TP/XP/Q/A)\b/Q\[/A\[)/. Examples: ch430 'as was said above ([3959]Q[7], A[9])'; ch450 'stated in the [4134]SS, Q[88], A[6]'; ch613 '([5189]XP, Q[2], A[3])'. The First and Second Parts do not have them.
- WIKI-MARKUP APOSTROPHES PRINTED AS CHARACTERS — about 150 labels in 23 chapters (18, 184, 192, 199, 245, 246, 250, 251, 255, 261, 262, 267, 269, 271, 274, 275, 279, 292, 300, 302, 304, 306, 308): the bold/italic quote marks of the source survive beside the tags. Rule: strip every run of apostrophes that touches the label tags, i.e. /'+(?=<i>)/ before and /'+(?=<\/b><\/i>/<\/i>)/ inside. Examples: ch250 "<p>'<i><b>I answer that,'</b></i>" (x8); ch192 "'<i><b>Reply to Objection 3'</b></i>" (x10); ch304 "''''<i><b>On the contrary,''''</b></i>"; ch271/274/308 runs of 7 and 13 apostrophes.
- SPACE BEFORE THE COLON OR COMMA OF A LABEL OR REFERENCE — 2,299 'Reply to Objection N :' (the bold tag closes before the colon: '<b>Reply to Objection 2</b>: ' / 'Reply to Objection 1 :') against the normal 'Reply to Objection 1:', and 98 ' ,' such as '(Q[3], A[2] , ad 2' or 'On the contrary , It is written'. A rule can close them up. With it goes the inconsistent dress of the labels: 'Objection 1:' / 'I answer that,' / 'On the contrary,' are bold in some questions, plain in others, bold-italic in the 23 chapters above.
- CHAPTER TITLES CARRY APPARATUS — 14 titles hold a footnote, an article count or a bare asterisk that belong to the source's heading block, not to the title: ch130 'OF ENJOYMENT [*Or, Fruition], WHICH IS…'; ch274 'OF STRIFE (TWO ARTICLES) (Strife here denotes fighting between individuals)'; ch306 '(*or detraction)', ch307, ch308, ch346, ch358 'OF FEAR*', ch360 'OF DARING (*Excessive daring or foolhardiness' (unclosed), ch362, ch368, ch378, ch561, ch604, ch607. Rule: cut ' (N ARTICLES)', '(*…)', '[*…]' and a trailing '*' out of titles (the note can go to the chapter's notes). Three titles are a DIVISION heading instead of the question's own title: ch310 'BY SINS COMMITTED IN BUYING AND SELLING' (the question is 'Of cheating, which is committed in buying and selling'), ch311 'BY SINS COMMITTED IN LOANS' ('Of the sin of usury'), ch321 'OF SERVICE BY PROMISE' ('Of vows'); and ch146 has ch260's title (listed as a fix). 26 plain typos in titles are listed as fixes — the titles were clearly never proof-read.
- TREATISE RUNNING HEAD REPEATED IN 571 OF 614 CHAPTERS — every question opens with a bold line '<p><b>Treatise on …</b></p>' (the source's running head). It is consistent enough to keep or to drop by rule, but it is written a dozen different ways ('Treatise on The One God' / 'on the One God'; 'On The Last End' / 'on the Last End'; 'On The Cardinal Virtues' x74 / 'on the Cardinal Virtues' / 'on The Cardinal Virtues'), is missing from about 40 chapters (4, 15, 18, 50, 72, 95, 103, most of 124–155, 401, 511, 612–614) and is wrong in ch54 and ch425–427 (listed as fixes). If kept, normalise the capitalisation by rule.
- REAL-WORD TYPING SLIPS THROUGHOUT — this is a keyed e-text that was never proof-read, and its commonest fault is a real word one letter from the right one, which no dictionary catches: 'that' for 'than' (7 found), 'end' for 'and' (6), 'nol'/'nor'/'no'/'net'/'rot'/'nat' for 'not' (10), 'doe' for 'do' (3), 'ere'/'ate' for 'are' (4), 'form' for 'from' (2), 'Cod' for 'God' (2), 'say' for 'says' in the citation formula (4). About 150 are listed as fixes, found by comparing each three-word sequence with the book's own formulas ('It would seem that', 'more perfect than the', 'points of inquiry'); the weakest tier of that search still yielded about one real slip in twenty-five lines read, so some dozens more certainly remain, especially among it/is/if/in/of/or/on swaps.
- EDITORIAL DIAGRAM FLATTENED TO PROSE — ch448 ends with the editors' note 'ST. THOMAS AND THE IMMACULATE CONCEPTION (EDITORIAL NOTE)', whose table is run into one paragraph joined by ' . . . . . ' ('THE LAW AND THE COURSE OF ORIGINAL SIN UNDER THE LAW . . . . . all descendants from Adam . . . . . spring from Adam materially and seminally . . . . .'). It reads as garbage and wants either a real table or removal; the note itself belongs before III q.27 (ch449), not at the foot of q.26.

**Looks wrong and is right.** All bracketed and quoted Latin ([per accidens], [gratiarum actio], 'cum alio scientia', canon-law incipits such as 'cap. Non debent', 'can. Omnis oppressus') and the Greek in braces ({Theos}, {epieikeia}, {kyminopristes}) — the translators' own glosses; the braces are the edition's transliteration mark (274 of them), not garbage. · Scholastic English of the Dominican translation: deiformity, comprehender, equivocals, univocation, enunciables, consignification, supposits, substands, spirator, innascible, unibility, immute/immuter, cognoscitive, reminiscitive, elicitive, equiparance/equiparence, fenerate, veteration, aeviternities, resultance, indetractible, superexceeds, conglorified, prestigiation, spatulamancy, aruspicy. · Douay Bible wording: sicles, gomor, setim wood, buckgoats, charadrion, 'liers with mankind', 'sinned penally' (Augustine), 'savagery with verity' (a pun on saeva veritas), -eth verbs. · Middle English quoted in the note of ch36 (Gost, goste, gostes, wrestlynge, worde, 'Trubled gost') — quoted from Hampole, More and the Oxford Dictionary. · fictious (ch76) — an old form of fictitious, left; 'gainsayed', 'layfolk', 'hairshirt', 'longlived', 'follicules', 'pellicule' — the translators' spellings. · 'the subsequent lie was not meritorious' (ch343) — 'lie' is right (the midwives' lie). · '(Q(3), A(4))' in ch4 and '(Q. 51, A. 2)' in ch171 — a different reference style from 'Q[3], A[4]', consistent within those questions; not an error. · 'considium' (ch133), 'latitia' (ch150), 'efficium' (ch416), 'kleria' (ch336), 'vicia' (ch371), 'munium' (ch556) — coined or etymologising Latin forms that the argument itself needs. · ch126 'those in which the act is seem to be place and time' — right as it stands ('those [circumstances] in which the act is' is the subject). · ch432 'but than the infinite which is limited in some respect, nothing is greater' and ch317 'we ought now to adore towards the west' — both right in context, though they look like than/that and now/not slips. · Only-begotten / Only-Begotten, First-born / First-Born — capitalisation varies with the source quoted; no slip. · '---' for a dash (1,472) and inline translators' notes '[*…]' (1,698) are the source's conventions throughout; only 7 notes are real footnotes. Not errors, but worth knowing.

**Links.** 614 chapters of scholastic citations: most errors are abbreviations and titles inside references (Genes., Ant., Pastoral., Eunuch., Paradox., Peri Archon, Cur Deus Homo, De Officiis of Ambrose), Douay spellings of biblical names (Osee, Ammon, Seth), the popes as 'Pontiffs', and the translators' bracketed 'St. Augustine' linked to the city in Florida (46 times).

**Links left open.** `Tophet` — Is. 30:33, 'Tophet is prepared from yesterday', is the biblical place of burning outside Jerusalem; the entry is the Punic sanctuary type that modern scholars named after it · `Scribe` — 'the Scribes and Pharisees' are the Jewish teachers of the Law; the entry is the scribe as a writer and record-keeper in general — broader, probably acceptable · `Roman_legion` — 'My name is Legion' (Mk. 5:9), the demons' name, only alludes to a legion

## `confessions` — Confessions, Augustine of Hippo

Applied: **6** · held: 4 · links off: 4 + 0 per chapter · 2 link(s) left open

**How it reads.** Three samples (Books V, IX, XIII) read cleanly, with section numbers and the editor's chapter headings in place and no stray apparatus. The text is in good order: four slips in the text, six in the notes.

**What repeats.**

- None. The paragraph html keeps the source's hard line breaks (a newline inside <p>, every ~65 characters); browsers treat them as spaces, so nothing shows, but any tool that splits on newlines will see broken sentences.

**Looks wrong and is right.** French (Fénelon, Hugo, Rousseau) and Latin quotations in the editor's notes account for about 75 of the 92 candidates — correct as quoted. The French has the NPNF edition's own loose accents (mére, ésprit, Homerè, senateur, 'l’homme que avait perdu') — left, as the edition prints them · Pilkington's and the editor's English: 'decrepid', 'lentile', 'stiffneckedness', 'everstanding', 'unseeming', 'Monachism', 'Augustin', 'Manichæans' — period forms · Quoted 17th-century English in notes: 'rowling orbs', 'Cloathing', 'prefidence' (Jeremy Taylor) — verbatim · 'what now is is not future' (ch11), 'that that which may be corrupted' (ch7), 'in <i>in Ps.</i> cxxiii' (ch13 note) — grammatical · Reference abbreviations: dist., lec., lecs., lects., eleg., sec. ult., Carth., Concil. — correct · 'a giant knock while the door is shut' (ch10 note) is a quoted conditional, not a slip · Scan-list pairs (white/while, hooks/books, bidden/hidden, bands/hands, steep/sleep, goads/goods, Portian, months/mouths, wanders/wonders …) — every one is the right word in its sentence · 'Only-begotten' / 'Only-Begotten', 'Co-eternal' / 'Co-Eternal' — the edition's own wavering capitals

**Links left open.** `Jerusalem` — all four uses are the heavenly Jerusalem ('the eternal Jerusalem', 'Jerusalem my country'), a figure for the city of the blessed; the entry is the earthly city. Same name and the source of the figure, · `Africa` — Augustine's Africa is Roman North Africa (the provinces round Carthage), not the continent; the same key is already switched off in the Res Gestae. Narrower thing rather than a different one — owner's

## `city-of-god` — The City of God, Augustine of Hippo

Applied: **25** · held: 0 · links off: 33 + 7 per chapter · 3 link(s) left open

**How it reads.** The seven samples read clean — no wrong word, no garbage, chapter numbers and headings in place; the only faults met in reading are the mid-sentence paragraph breaks described above. Worth knowing for anyone matching strings: apostrophes, æ/Æ/œ and all Greek are numeric character references in the html (&#8217; 1,052 times, &#230; 199 times) while the double quotation marks are literal characters, and lines inside a paragraph are separated by newlines, not spaces — so several `from` strings here contain a newline. A handful of spacing oddities were left alone as possibly the edition's own (' :—' in ch5, 'me</i> ?”' in ch14, eight ' —' such as 'dine? —how').

**What repeats.**

- Paragraphs broken in the middle of a sentence, about 53 in all (the source's page boundaries). (a) 38 where a paragraph ends in a letter, comma, colon or dash and the next begins with a lower-case word — safe to join by rule (regex `[a-z,;:—-]</p>\s*<p>(?=[a-z])`; join with a space, or with nothing after a hyphen or dash): ch1 'How,</p><p>then, was she invoked', ch2 'high-</p><p>souled man' (inside a word), ch6 'cast off, rejected,</p><p>together with', ch19 'pleasure, repose,</p><p>pleasure and repose combined'. (b) about 15 more where the continuation begins with a capital, a figure or punctuation, which a rule cannot tell from verse and need a look each: ch5 'who abounded when ¶ Sallust wrote', ch10 'if you refer it to Christ ¶ , saying', ch15 'amounts to ¶ 360 days', ch17 'from the time of ¶ Rehoboam his son', ch20 'shorter, ¶ —or at least', ch22 'defeated by our martyrs as ¶ Pharaoh's magi'. Five are listed in `fixes`. The 14 lower-case openings that follow a verse quotation ('…bleed,”</p><p>he immediately exclaims,') are right and must not be joined.

**Looks wrong and is right.** Dods's own words: demonolators, suspectors, runcated, dowried, incomprehensibles, incredibles, old-wifeish, forthputting, 'Augustin'; 'christs' in lower case (Book XVII, 'Touch not my christs') is deliberate. · American spelling (honor, color, labor, neighboring, fulfill) is this edition's (the American Nicene and Post-Nicene Fathers printing) and consistent; '243d year', '72d Psalm' are its ordinals. · Compounds printed closed once and hyphenated elsewhere, not listed because either may be the edition's: stageplays (ch2; 'stage-plays' ch1), silverplate (ch5), wonderworkers (ch10), fourfooted (a Bible quotation). · Grammatical doublings: 'a way in in the direction of the gullet' (ch7), 'in all time time has been' (ch12), 'if they ate of it it would' (ch14), 'that that' (about 30), 'had had'. · Names: Leo (the Egyptian priest), Cleon, Trajan, bishop of Salon, Seventy-five / Seventy-Five (a title-case heading). · ch22 'shouting on all sides, “I have healed the people,”' looks wrong (Augustine wrote that he greeted the people) but it is what this edition prints — the translator's, not ours to correct. · Latin, Greek and French in the notes (ulla 'st, primum, inferos, monstrando, portendendo, meritorum, Magie, calor, 'plup.') is quoted text and clean. · Second scanner's real words are all right in context: hooks, fallow, notion, horrors, abject, wander, deifies, deify, chase, goads, lauds, minus, locked, bandage, frees, failing, grants, entirety, crass, penally, discard, lender, sanctify, mates, seditious, heating, grove(s), imported, warming, clogs, verify, impassibility, seals, foals, shook, locks, faint, staying, roofed, landed.

**Links.** 284 keys read. Three patterns: words of chapter headings, which the translation capitalises (Concord, Desert, Epochs, Sovereignty, Non-Intervention); the king-lists of Book 18, where Eusebius' legendary kings carry famous names (Xerxes, Leucippus, Apis); and biblical persons who share a name with a land or a god (Judah, Canaan, Seth, Nun).

**Links left open.** `Hittites` — the Hittites of Genesis 15 in a list of peoples of Canaan (with Perizzites and Amorites); the entry is the Bronze Age kingdom of Anatolia. Whether the biblical name means the same people is disputed — · `Moon` — one link, where Titus Tatius adds "Sun, Moon, Vulcan, Light" to Rome's gods — the Moon as the goddess Luna; the entry is the astronomical body · `The_City_of_God` — the links fall on "the City of God" as the heavenly city in chapter headings, and the entry is this book itself — circular rather than wrong

## `homer-iliad` — The Iliad, Homer

Applied: **85** · held: 6 · links off: 22 + 1 per chapter · 1 link(s) left open

**How it reads.** Sample 1 (Book IX, Phoenix's speech) had two faults in one page ('from may heart', 'Nay. it was thou'); sample 2 (Book XXI, the battle of the gods) read clean. Line numbers sit in bk-n spans at paragraph starts. Speeches carry no visible quotation marks in plain text because they are <q> elements.

**What repeats.**

- The text (Murray's prose, from a scanned source) is clean in Books I-VIII and badly scanned from Book IX on — 82 of the 91 rows above are in ch9-ch24, densest in ch16, ch22, ch23, ch24. The recurring confusions: l read as h (ahoud, bhack, chouds, choven, ohd, measurehess, vuhtures, hed for led, howl for bowl), y as v (bodv, trustv, slaving), m as nu (nuountain, hinu), comma as full stop (9), a space lost after , ; . (17), a hyphen lost in a fixed compound (10: battlegear, warcry, swiftfooted, turningpost …). One real-word slip was found in a 4,500-character sample ('from may heart'), so more real-word misreadings certainly remain in Books IX-XXIV; those books deserve a full proof-reading pass or a re-import from a cleaner copy.
- Speech is marked with <q>…</q> elements and no printed quotation marks; in the plain-text samples the speeches therefore run on unmarked ('…and spake winged words: Fool, not even yet…'). Check that the reader's stylesheet draws quotation marks for q — if it does not, every speech in the book is unmarked.

**Looks wrong and is right.** Murray's archaic and compound forms: whensoe'er, goaders (of horses), hieth, o'erleap, housefolk, vineland, 'mine ownself', forgat, clave, gat · Names the scanners flagged are right: Otreus, Mestor, Glauce, Arion, Mases, Iton, Elone, Megas (father of Perimus), Halië, Linos-song, the Troes · 'Athena' once in ch2 against 'Athene' 163 times — Books I-II follow a lightly revised wording (spoke / you); left as the edition's own · Square brackets in ch16 ('[And the lance of Aeneas … from his mighty hand.]') are the editor's mark for a suspected line, not garbage · 'had had our fill' (ch11, ch24 twice) is grammatical; Earth-Enfolder / Earth-enfolder differ only in a capital · Scan list: bottle, stain, atone, foiled, wails, ought, marred, failing, hulls, hoard, groin, clove, felling, aiming, beans — correct words

**Links.** The Iliad's minor warriors share names with famous figures (Orestes, Polites, Deucalion, Creon, Haemon, Lycurgus, Polyphemus, Prytanis, Maris) and its catalogues with better-known places (Samos, Miletus, Ithome, Schoenus, Cilicia). The gods, the main heroes and the mainland Greek places are right.

**Links left open.** `Argos` — x23: the word linked is mostly 'Argives', Homer's name for the whole Greek host (like Achaeans and Danaans), and 'Argos' is often Agamemnon's realm or the Peloponnese at large; the entry is the city o

## `homer-odyssey` — The Odyssey, Homer

Applied: **2** · held: 1 · links off: 11 + 0 per chapter · 1 link(s) left open

**How it reads.** Both samples (Books IX and XX) read cleanly: line numbers at paragraph heads, nested quotation marks correct. Three small slips in a very long text.

**Looks wrong and is right.** Murray's words are right: oarblades, cyanus, byblus, 'anvil block', 'cheek-piece' · all 18 scanner candidates (saving, stain, fears, smile, tails...) are right readings

**Links.** The usual Homeric namesakes: minor characters who share a name with a city or a later figure, and 'Earth' linked inside the hyphenated epithet Earth-shaker.

**Links left open.** `Palace_of_Nestor` — Homer's 'sandy Pylos', Nestor's city, is linked to the excavated Mycenaean palace at Ano Englianos: the identification is the conventional one and the entry is named for Nestor, so probably acceptable

## `virgil-aeneid` — The Aeneid, Virgil

Applied: **56** · held: 5 · links off: 43 + 3 per chapter · 1 link(s) left open

**How it reads.** Both samples (Book V boxing match, Book XI council) read as fluent verse but each shows the scan's faults within a page: 'how Iong delay? how Iong', 'Iook yonder', a lower-case sentence start ('foe. for, lo'), and the real-word misreading 'filth it bears'. Line numbers sit in bk-n spans at paragraph starts; no notes. The book needs more than candidate-fixing.

**What repeats.**

- This text (Williams's translation, from a scanned source) is the most damaged of the twelve books in this assignment: beyond the rows above it has four rule-fixable classes, and real-word misreadings (filth for tilth, foil for toil, wails for walls) that only a full read will find — the two 4,500-character samples alone gave three faults. A complete proof-reading pass, or a re-import from a cleaner source, is warranted.
- Capital I for lower-case l at the start of a word: 106 instances in every book except VI — Iong x18 (+ Iong-since, Iong-delayed), Ioud x12 (+ Ioudest), Iost x11, Iofty x10, Iook x8 (+ Iooking x3), Iord x7 (+ Iord's), Iying x7, Iove x5 (+ Ioved x3, Iove-sick, Iove's, Iovers, Ioving, Iovest, Iove-impelled), Iyre x2, Ioins x2, Ioaded, Ioading, Ioosely. E.g. ch2 'Shrill trumpets rang; Ioud shouting voices roared', ch5 'how Iong delay? how Iong beseems it', ch11 'Iook yonder where the Trojan chieftain waits'. Rule: a word beginning I + o/y + lower-case letter becomes l…, except the real names Io, Ionian, Ionic, Iopas, Iollas.
- Digit 0 for the letter O (the vocative): 45 instances, 44 of them in ch6 (Book VI), 1 in ch9 — e.g. ch6 '—0 pitiable sight!—', '0 Icarus, in such well-graven scene', 'No tribulations new, 0 Sibyl blest', 'But 0! remounting'. Rule: a 0 standing alone (not beside another digit) in the verse becomes O; the line numbers are in their own bk-n spans and are not touched.
- A sentence beginning in lower case at the head of a verse line, after a full stop: 28 instances (the book otherwise capitalises 1,071 such sentence starts) — e.g. ch1 'lofty ornament.<br>so busy bees', ch4 'From every side they come.<br>their canvas wooes the winds', ch9 '“'T is I, 't is I!” he said.<br>look on the man', ch11 'brave bosom to the foe.<br>for, lo, that Turnus'. Rule: in the pattern [a-z].<br>[a-z] capitalise the letter after the break (ch1 x1, ch2 x3, ch3 x5, ch4 x5, ch7 x1, ch8 x4, ch9 x5, ch10 x1, ch11 x2, ch12 x1). The 19 proper names lower-cased at a line head are listed one by one above.
- A space before a colon: 30 instances, 21 of them in ch6 — 'the virgin cried :', 'these words began :—', 'The Sibyl thus replied :'. The four spaces before a full stop or comma are listed above; the colons can be closed up by rule.
- Book VI (ch6) is set differently from the other eleven: every verse line begins with a capital (786 lines) where the rest of the book begins lines in lower case, and it alone carries the 0-for-O and spaced-colon faults — it came from a different transcription. Formatting inconsistency, not a text error.

**Looks wrong and is right.** Williams's elisions and archaisms: bidst, wooes, ev'ry, slumb'rous, vot'ries, engin'ry, surrend'ring, trav'ler, emprisons, swiftlier, nonesoe'er, sailyards, midcourt, bacchantic, phalaric, orichalch, and every o'er- compound · 'Garamant and Ind' (ch6) is right — Ind = India; only the line-head 'ind from the Parthian' in ch7 is a misreading · 'Bythinian-born' (ch5) left: possibly the translator's spelling of Bithynian · 'in her young month and crescent pale' (ch6), 'full thirty months shall reign' (ch1), 'a farmer's pole' (ch11), 'Down from the docks, my ships!' (ch4), 'the vast inane' (ch1), 'haled along' (ch2) — all sound · Scan list otherwise: saving, shares, block, brake, tilled, lowering, hinds, Actian, tiger, chair, dozed, relies, bored, eaves — correct words

**Links.** The catalogue of minor warriors in Books 9–12 is where the namesakes lie: a casualty with a famous name (Numa, Remus, Osiris, Sybaris, Hydaspes, Lichas, Lagus, Gylippus, Haemon, Prytanis, Clarus) is linked to the famous bearer. Three language entries (Latin, Oscan, Sabellic) catch the ethnic adjective, and two tragedy entries (Philoctetes, Hippolytus) catch the hero. Several Italian and Sicilian places share a Greek name (Megara, Thapsus, Amyclae, Velia, Ida).

**Links left open.** `Oracle_of_Ammon` — Iarbas is the son of the god Ammon (Hammon); the entry is about the god's oracle at Siwa — same god, but the oracle itself is not meant

## `journey-to-the-west` — Journey to the West, Wu Cheng'en

Applied: **540** · held: 22 · links off: 29 + 0 per chapter · 5 link(s) left open

**How it reads.** The six samples read as raw, unproofed OCR: the story is followable, but every sample has faults at a rate of about two per thousand characters — misread letters, run-together and split words, garbled quotation marks, stray hyphens and commas, and (ch3, ch58, ch98) symbol garbage where Chinese type stood; ch15 and ch77 (Richard's outline chapters) are the cleanest. Chapter titles had eight scan errors of their own (listed). Chapter heads and verse are otherwise formatted consistently.

**What repeats.**

- THE WHOLE BOOK IS UNPROOFED OCR (Timothy Richard's 1913 'A Mission to Heaven', with most names converted to pinyin afterwards). The class 'scan misreading' is far over the 25-row limit, but it cannot be fixed by rule (every word is damaged differently), so the 560-odd instances the machine lists, pattern searches and the samples surfaced are all listed in `fixes` rather than five of them. They are NOT all of it: in the six samples (27,000 characters) roughly half of the faults I met were not in any candidate list, so expect several hundred more (real-word misreadings such as 'Sim' for Sun, 'bis' for his, 'lie' for he, 'Pie' for He, 'stive' for save, 'blaster' for Master; stray punctuation). A full proof-read against the scan, or a cleaner source, is the only complete cure.
- Garbled quotation marks, by rule: the scan's double quote printed as two spaced single quotes or asterisks — `' '` 128 times, plus `* '`, `*'`, `' *`, `* *` 8 times; e.g. ch1 "Hence the saying, ' ' The winter solstice", ch5 "cried out, * ' You , Great Holy One", ch6 "K wanyin said , * * Your worth y". Also about 89 places where W was read as "W (ch14 '"When, greatty distressed', ch15 'Travelling "West', ch6 '"Wait a moment') — each needs a look, since some are real opening quotes.
- Stray hyphen before a word (the scan's rendering of this typeface's w and of specks), about 41 left after the listed fixes: ch1 'impregnates the -world', ch2 'Study -well', 'Conquer -wrong', ch3 'I -would give it you', ch77 'He -went to see Rulai', ch99 '-with an incorruptible body'. Rule: space + hyphen + letter -> space + letter (keep '-Tr.)').
- Space before punctuation and doubled or stray punctuation, about 80 of ' ,' / ' ;' alone: ch1 'ate and drank , but', ch6 'said , " Ho w can', ch3 'Sun,, the Searcher', 'Yanluo,. Prince', ch5 'invisible,, got on', ch99 'the four, pilgrims'. Safe to normalise by rule (' ,' -> ',').
- Garbage runs where the 1913 edition printed Chinese characters or tables (72 '^' characters and other symbol runs): ch58 the list of 18 sayings each ends in a run such as '^ ?§■ «/> ^.' or 'jua^"^^.'; ch98 the catalogue of the 35 scriptures is an unreadable interleaving of three columns ('rlka Sutra 10 30 Extatic meditation', 'jE .# ^ M', '■w^ mm'); ch3 '^^^"^^^^ (SeeChap. XL— Tr.)'; ch11 'Su Shi, \^'^ei '^^iei and others' and '7. The grinding men )iel!'; ch7 'seventy-two magic af^TTcah' outlive all kalpas'; ch62/63 'Immortal Plant ^ ^ (Ling Chih)', 'the M. ^ Ling Chili'. The symbol runs should be deleted; the ch98 table needs retyping from the scan or cutting.
- Text lost at the page margin in ch24 (start of each line cut off): 'e him two ginseng magic fruits', 'Confucius tells inot to be friendly', 'e belong to the Great Beginner', 'the chief god of the loists', 'When iomes, treat him well', 'leaving two di he Gi of the youngest at home', 'But the / disciples'. Only the words with one possible restoration are in `fixes`; the rest needs the scan. Likewise a lacuna in ch83 ('in his left palni' followed by a displaced footnote fragment and 'li",'').
- Translator's footnotes dumped into the middle of sentences (at least 8): ch37 'The King's son was not supposed to be Karshar. (See Beale.) Tr. permited to see his mother'; ch87 'the angel, whose duty / 'Does this mean Christmas day ?— Tr. / it was to report'; ch88 'had not sufficient strength / The Chinese name used here is the same as that used on the Nestorian monument ior Cliristianity.— Tr- to wield the pilgrims' heavy weapons'; ch66 '* li the Nestoriaiis taught…' after an unfinished sentence; ch83 'The Pagoda has a mystic meaning…'; ch100 'from the dead. That ol Higher Buddhism did after three days…'; ch12 '[This ia a chronological error… Tr. J'; ch26 '* Note. — The East Gate in Petin? ;s name'. Each should become a note or be moved to the paragraph end; the asterisk markers ('Holy* One', 'Tung Hwa*', 'Shakyamuni*.') are left dangling.
- The pinyin conversion of names missed every scan-damaged or variant instance, so one person has two names: Guanyin beside 'K wanyin', 'K-wanyin', 'ETKranyin', 'Ivwanyin', 'K-nanyin', 'Kwanjun', 'Kwan- 3'in' (7, listed as probable fixes to Guanyin); Bajie beside 'Pa kiei' x4 (ch29, 32, 36, 38), 'PaKiei' (ch20) and the titles of ch19 and ch32 (PA KIEI CONVERTED, PA KIEI NEGLECTS TO WATCH); Sha Seng beside 'Sa Ho Shang' (ch94) and 'Sa Sfeng'; Xuanzang beside the ch9 title HUEN CHWANG'S PARENTAGE; Sun the Practical beside 'Sun Hing Chieh' (ch14); 'Li Tuota' beside 'Li To-fa', 'Li To-Ta', 'Li To Ta'. Not scan errors in themselves — an editorial decision whether to finish the conversion.

**Looks wrong and is right.** Period/translator's words that are right: lassooed, candareens, catties, kow-towed/kowtowed, li, Taels, Sanscrit, Vermillion (both in text and in the edition), to-day, to-morrow, shew-type spellings, 'practice religion' as a verb. · Transliterations and names: Lao-tze, Shen, Luohans, Giete, Kia Lan, Mile Fo, Omito Fo, Chang Keng, Tsz chow, Kin Ping fu, Ling Chih, King-teh / King-Teh, Ox-headed / OX-HEADED, Nine-headed / NINE-HEADED (capitals are the edition's emphasis). · Compounds without their hyphen that may be the edition's own and were NOT listed: aweinspiring (ch57), doubleminded (ch58), studmaster (ch7), selfsacrifice (ch7), Pagodabearer (ch83). · Looks wrong, cannot be restored without the scan, so not listed: ch98 'some rithter way' (righter? other?), ch5 'then you stole mne' (wine?), ch5 'sensed the monkeys' (served?), ch100 'as clearh- as the wind' (clearly?), ch11 'men )iel!', ch21 'Whern', ch98 'From afar is was like', ch99 'attaint to truth', ch4 'my colleagues.,'. · '[outline.]' in italics (89 paragraphs) is the importer's own marker for Richard's summarised chapters, not scan debris. · Scan-file candidates that are right as they stand: cones, token, bands (of fairies), beads, tight, fried, wailing, purify, farms, wanders, wander, gross, seals, lasted, toiled, smell, failed, fasted, fooled, tearing.

**Links.** Timothy Richard's 1913 translation uses Western words for Chinese things (Hades, Chaos, Huns, Immortals, Elders, Labyrinth, Southern Ocean, Turkish) and romanised syllables collide with entries (Shang, Shu, Tien, Shun, Yao, Mali, Tung Shing, Feng Shan). The text is a raw scan, so OCR errors also make links (Plow for How). The real Chinese places, dynasties and Buddhist terms are right.

**Links left open.** `Ambassador` — x6: the translator's title for Xuanzang as the Tang emperor's envoy ('the Royal Ambassador', 'the Buddhist Ambassador') — the sense is the entry's, but it works as a character's epithet throughout · `Elephant` — x3: only in the name of a country, 'the Elephant Country / Elephant Kingdom' (Baoxiang) — the animal is the word's sense, but nothing about elephants is meant · `Crux` — 'the Spirit of the star of the Southern Cross' is the translator's rendering of the Star of Longevity, the Old Man of the South Pole (Canopus in Chinese star lore) — the English text does say Southern · `Four_Symbols` — 'the White Tiger Hall' is a hall of the palace, named after the creature of the entry but not about it · `Temple` — x9: Buddhist and Taoist temples in chapter headings ("Guanyin's Temple"); the entry opens generically but is about the Greek temple (the colonnaded form, the cult statue) — the right word, the wrong t

## `three-kingdoms` — Romance of the Three Kingdoms, Luo Guanzhong

Applied: **24** · held: 10 · links off: 49 + 11 per chapter · 4 link(s) left open

**How it reads.** The eight samples read cleanly as Brewitt-Taylor's prose in pinyin dress, with curly quotes, British spelling and the verse set off; no garbage or stray apparatus. Faults seen in reading were all small: a missing opening quotation mark (ch56), a name mis-converted (Xun Yi for Xu Yi, Zhan for Chan, Mo for Miao) and unconverted Wade-Giles ('Lung'); also a few spaces left before punctuation where Chinese characters were stripped ('the first year of Yanxing .').

**What repeats.**

- The Wikisource pinyin conversion of Brewitt-Taylor's Wade-Giles is not quite complete or consistent — a handful, not a class to fix by rule: remnants 'Xing Tao-yung' (ch52), 'Hung-yang’s' and 'An-shih’s' (ch23, = Sang Hongyang, Zhang Anshi), 'nien-hao' (ch105), 'into Lung' (ch40, = Long), 'said to Mo' (ch11); mis-conversions 'Xun Yi' for Xu Yi (ch116 x2), 'Zhan' for Chan (ch85); and split/solid pairs 'Wu Huan' x2 beside 'Wuhuan' x3. The clear ones are listed as probable fixes; the ch23 pair and 'Lung' are left because the right pinyin needs the Chinese text.
- Typist's slips of the Wikisource transcription run at roughly one every four chapters (27 found by the spell scan: abvance, adandoned, handhome, 'grou d', 'a sthey', 'con sciousness', fried for friend …); real-word slips of the same kind will exist that only a full read finds (one missing opening quotation mark turned up in 36,000 characters of samples).

**Looks wrong and is right.** Doubled words that are grammatical: 'in in force', 'came in in hot haste', 'got in in the confusion', 'fall in in their companies', 'hemmed in in Nanyang', 'going on on every side', 'by by-roads' (x2) · Period and translator's spellings: artizan, partizans, byeways, manoeuver, pleasaunce, transcendant, immeasureably, rigourously, tumourous, mediary, vaprous, thund’rous, t’avenge, t’encroach, 'is n’t' (spaced as printed), drave, madest, builded, prophesy (as noun), disrupture · counseller (ch66) and counsellers (ch83) — an old variant spelling, left; only 'councellor' is listed · ruseful, worldful, hookmen, fatling, feather-hatted, northmen’s, derring-do, fabian policy, chevaux de frise are right · Chinese names and terms checked and right: Jiangting (ch21), Dongling Pass (ch27), Tulong Ravine (ch89), Yongcheng (ch98), Huiling (ch85), wudong tree, Guannei/Guanwai, weiqi, 'the two Lüs' (plural, 6 times) · Capitalisation pairs Commander-in-chief / Commander-in-Chief (55/20) and Son-in-law / Son-in-Law are the edition's inconsistency, not slips

**Links.** Pinyin syllables are the systematic fault: a dynasty, sage or concept key (Shu, Yuan, Shang, Sui, Xia, Tao, Shun, Yao) fires on the one-syllable given name or surname of a Three Kingdoms figure, and two-syllable names collide with namesakes of other ages (Zhang Yi, Huang Quan, Liu Yan, Tao Qian, Zhong You, Wang Bi, Zhang Heng, Li Kui, Wang Chong, Chen Sheng). Aliases given to glossary entries (Bofu, Boyan, Beiyuan, Zhidao, Changcheng, Qiaojun, Yugong, Sishui) match unrelated places and style names. Brewitt-Taylor's 'Emperor Wu' after ch91 is Cao Cao.

**Links left open.** `Chang'an` — the entry describes the Sui–Tang city 'begun in 582 beside the worn-out Han capital of the same name' (dated 583–904); the novel's Chang'an is that Han capital — same name and site (Xi'an), but strict · `Earth` — 'Heaven and Earth' sworn to as cosmic powers (ch1, 26, 28, 80), 'Mother Earth' (ch4, 5), the Yellow Turban 'Duke of Earth' (ch2) — the earth as a power or title, against an entry on the planet; wrong · `Xuzhou` — the text's Xuzhou is the Han province (governor Tao Qian, seat at Tan then Xiapi); the entry is the modern city grown from Pengcheng — same name and region, different unit · `Feudalism` — 'Chief of the Feudal Lords' is the translator's phrase for the Chinese zhuhou; the entry is medieval European feudalism (c. 900–1300)

## `canterbury-tales` — The Canterbury Tales, Geoffrey Chaucer

Applied: **135** · held: 30 · links off: 17 + 3 per chapter

**How it reads.** Both samples read as fluent modern prose but carry visible OCR damage every few hundred words (sa;d, '0 alma', 'anon. I must', 'body >', "'tyrants!", porportional), and the pattern scans show the same in every one of the 25 chapters; there are no notes. The rubrics (Here beginneth ...) are sometimes italic and sometimes plain paragraphs, and verse passages are set one line per paragraph.

**What repeats.**

- THE WHOLE BOOK IS UNCORRECTED OCR. The two set samples (9,000 characters) hold 7 plain errors, which projects to several hundred in the 690,000 characters; the 165 fixes listed are only those a pattern scan could find and that have one sure correction. The book wants either a full proof-read against the printed Tatlock and MacKaye text or a re-fetch from a proofed source; nothing short of that will make it clean.
- Compounds hyphenated in print and broken at a line end are fused into one word, about 40: andforty, andtwenty, arrowwounds, bakedmeats, barleybread, boychild, casementwindow, castlewall, cyperusroot, dungcart, elfqueen, fleshhooks, goosequills, hoaryhead, honeysweet, householdthrift, illconditioned, illfavored, ivyleaf, lifedays, lilyflower, lovecharms, manchild, manorhouse, molartooth, neckbone, olivegroves, pencase, presencechamber, selfimportant, shortshouldered, shriftfathers, spurgelaurel, swordstroke, throstlecock, tightlyfastened, wellenough, almsdeeds. The hyphenated forms stand elsewhere in the book (elf-queen x3, neck-bone x2). Three are listed as fixes (elfqueen, one-andforty, four-andtwenty); the rest want the hyphen restored by the same rule.
- Page-foot debris inside sentences, about 20: a printer's signature letter, a page number or a speck, with a false paragraph break, where a page ended ('lean</p><p>H like a stick', 'his head</p><p>-278 from the sun', 'by</p><p>' 287 heaven’s Queen', an illustration caption in capitals in ch6). All found are listed. A paragraph that starts with a lower-case letter or ends without a stop is the mark of it (35 and 63 such places, most of them legitimate verse lines, so no blind rule).
- Quotation marks: the opening mark is often misread as a letter or sign (c, e, t, cc, f‘, (, *) and the closing one as j, r, ' or * — the 20 found are listed — and in many more places a mark is simply missing, so quotations open without closing or the reverse (ch1 'said, Hearken, lordings, if you will.', ch4 'Alas ! quoth John.', ch3 'No more of your prating ! the Reeve answered'). The missing ones are not listed: each needs the printed page.
- Stray full stops, commas, hyphens and apostrophes from scan specks in mid-sentence, about 30 ('and. eke', 'she. ever', 'are. right hot', 'by- the very name', 'hath ,the world', 'killed., though'); all found are listed.
- The source's spaced punctuation is kept throughout, thousands of places: a space before ; : ! ? and inside quotation marks ('‘ Alas ! ’ quoth he, ‘ my cousin'). It is consistent enough to be normalised by rule (remove the space before ; : ! ? and after ‘ “ / before ’ ”) if the Library wants modern spacing; it is not listed.
- Places where text is lost or too garbled to restore without the printed book (NOT in fixes): ch4 'Ill luck to thee, Alan, thou is a' — the sentence breaks off and the next paragraph ('These poor clerks ran ... and bade his wife go and knead it in a loaf I trow the clerks were afeared') has lost its quotation marks and stops; ch23 'the deceit which this wur anned, forthee* Thou canst not escape' (probably 'which this fox has planned for thee!'); ch15 'and that straightway f- quoth he, ‘Now dame'; ch25 'Jer. 6 0 State super vias' (probably 'Jer. 6°.') and '§ i.' for '§ 1.'; ch14 'old hoaryhead man'.

**Looks wrong and is right.** Chaucer's own or the modernisers' deliberate forms: astromy (the carpenter's word), Corpus Dominus (the Host's Latin), cok cok, chuk, leos (Greek, glossed in the text), Dane (Daphne), Sam-soun, rum ram ruf, 'My lief is faren in londe', governaille, octogamy, preambulation, descensories, citronizing, albification, annualer, sumner/sumners, constabless, soldaness, elfdom, earnestful, smockless, fiendly, uncunning, persever, syrop. · 'alickerous mouth' (ch15) may be 'a lickerous mouth' run together, but 'a likerous mouth' is Chaucer's phrase and the fused form cannot be told from the editors' spelling without the print — not listed. · Northern dialect in the Reeve's Tale is deliberate: sawl, sail, swa, alswa, wrangly, gaes, baith, nane, 'I is', 'thou is'. · Archaic verb forms (-est, -eth: knowest, makest, beginneth, endeth, stinteth) and Latin rubrics and tags (Explicit prima pars, Sequitur pars secunda, Qui cum Patre, In manus tuas, Questio quid juris, significavit, In principio, anni collecti / expansi, ignotum per ignotius, Mane techel phares, the Parson's Latin headings) are correct. · Rubrics without the possessive apostrophe ('Here beginneth Chaucers Tale of Thopas', 'the Nuns Priest's Tale', 'the Canon’s Yeomans Tale', 'the Second Nuns Tale') follow the manuscript rubrics the edition reproduces; left alone. · 'had had', 'cuckoo ! cuckoo !' are grammatical or deliberate doublings; '‘ Ah !,’' and 'alas !,' (exclamation mark followed by a comma) are the edition's punctuation. · Scan-file real words that are right in place: mariner, hound, tabor, targe, froth, lauds, lavers, broach, fallows, mites, staff-sling, savest, stale, dignify.

**Links.** As in the other books, modern-place entries catch older namesakes (St. Paul, Santiago, Dover, Paris once), and a saint or a character bears a famous name (Valerian, Claudius, Livia, Lycurgus, Placebo, St. Helen).

## `divine-comedy` — The Divine Comedy, Dante Alighieri

Applied: **2** · held: 0 · links off: 32 + 3 per chapter · 3 link(s) left open

**How it reads.** Purgatorio I and Paradiso XVIII read cleanly as Longfellow's verse, tercet numbers held in their own spans (bk-n), no stray apparatus, no garbage. Only the capitalised first word in cantos 1-37 is inconsistent with the rest.

**What repeats.**

- Inconsistent canto openings (formatting, not a text error): the first word of a canto is printed in capitals (the source's drop-cap word) in chapters 1-37 only — e.g. ch1 'MIDWAY upon the journey', ch15 'NOW bears us onward', ch19 'O SIMON MAGUS' — while chapters 38-100 open in ordinary case ('Whenever by delight'). 37 chapters; lower-casing them by rule would make the book uniform.

**Looks wrong and is right.** Latin hymn and Vulgate tags are all correct: Labia mea Domine, Miserere mei, Benedictus qui venis, Manibus o date lilia plenis, Modicum et non videbitis me, Te lucis ante, qui lugent, neque nubent, ad vocem tanti senis, Summae Deus clementiae, Virum non cognosco, Regina coeli, Regnum coelorum, Diligite justitiam, Deus venerunt gentes, O sanguis meus, sitio, Non si est dare primum motum esse · Longfellow's coinages and archaisms: alloyage, birdlet, counterstand, downweighs, sparhawk, circumcinct, desireful, ingemmest, transhumanise, transplendent, dolence, heardst, o'ercamest, o'ercomest and every o'er- form · Contractions who're / who've / they've / Thou'lt are Longfellow's own metre-savers · Italian and Provençal: 'pappo' and 'dindi', 'omo', Ubaldin dalla Pila, the Arnaut Daniel lines ('Tan m' abellis vostre cortes deman'), Papë Satàn · Scan list (mature, bands, Arius, drown, farce, sealed, gloss, tilled, brake, laved, rooks, Tully, groin, Trivia 'Smiles' …) — each is the right word in its line

**Links.** A verse translation capitalises every line, so common words at line heads get linked (Wheels, Touches, Confounding, Bird, Council); and Dante's myth and theology collide with namesake entries (moons of Jupiter, Greek plays named after their heroes, angelic orders, modern cities). 'Caesar' is mostly the imperial title here.

**Links left open.** `Pyrrhus_of_Epirus` — ch73 is the king of Epirus (right); the Pyrrhus of ch12, among the violent beside Sextus, is taken by commentators either as the king or as Achilles' son Neoptolemus — undecidable from the text · `Vexillum` — 'Vexilla regis prodeunt inferni' quotes the hymn of Venantius Fortunatus; the word means banners, but the entry is the Roman military flag — right as a gloss of the word, not of the allusion · `Equator` — ch38 'the mid-circle of supernal motion, which in some art is the Equator called' is the celestial equator; the entry is the Earth's — the same circle projected, so left on unless the entry is strictl

## `macbeth` — Macbeth, William Shakespeare

Applied: **1** · held: 8 · links off: 1 + 0 per chapter

**How it reads.** Both samples (II.iii–iv; V.i–iii) are clean: no misreadings, lineation and line numbers intact. Reading turned up the one unrecognised speaker label ('Macd.'), which no scanner had flagged.

**What repeats.**

- Line-break hyphens of the printed prose: 9 hyphen+<br> sites (the Porter scene and the sleep-walking scene), 8 of them a broken single word and listed as fixes (fur-ther, prim-rose, espe-cially, unpro-vokes, dis-heartens, after-wards, perform-ances, remem-brance); 'devil-<br>porter' is the real compound devil-porter and stays. Same caveat as in romeo-and-juliet: the <br> keeps the printed line, so the hyphen looks as on the page; apply by rule or not at all.

**Looks wrong and is right.** Shakespeare's forms in the Yale text: sweaten, chaudron, mansionry, underwrit, hurlyburly, sev'nnights, be'st, thou'dst, play'dst, 'bove, unwip'd, undivulg'd, unbatter'd, undeeded, slab, 'the heavens … Threatens', 'they eat each other' · the note quoting the First Folio misprint 'dis-eate' is quoting it on purpose · scan.txt: steep'd, white, clogs, grove — all right

## `romeo-and-juliet` — Romeo and Juliet, William Shakespeare

Applied: **4** · held: 18 · links off: 6 + 0 per chapter

**How it reads.** Both samples (II.iii–iv; IV.v) are clean Yale Shakespeare: no misreadings, verse lineation and line numbers intact. Formatting faults only: the line-end hyphens of the prose, and four speaker labels ('Nurse.', 'Rom.' twice, 'Pet.') that were not recognised and stand as plain text.

**What repeats.**

- Line-break hyphens of the printed prose, 18 in this book (19 hyphen+<br> sites; 'serving-<br>creature' is a real compound and stays). The Yale prose keeps its printed line breaks as <br>, so each shows as 're-' at a line end and 'member' on the next: faithful to the page on a wide screen, but wrong for search, copy, read-aloud and any narrower reflow. All 18 are listed as fixes (join the word, move the <br> after it; the lead may prefer to apply them by rule, or not at all). In two the line-number span stands between the halves ('with-<br><span class="bk-n">48</span>out', 'con-…<br><span class="bk-n">137</span>fidence') and in three a footnote marker does (con-[80]ceive, con-[99]fidence, senten-[123]tious); the proposed text puts the marker after the whole word and keeps the number at the head of the next line, with no space after the span, as everywhere in these plays. The same class exists in tempest (21 sites), macbeth (9) and julius-caesar (3).
- Speaker labels the importer did not recognise, 4 in this book (1 each in tempest and macbeth): the printed label ends in a full stop ('Nurse.', 'Rom.' x2, 'Pet.') and the speech was filed as a continuation paragraph (class bk-cont) with the label as plain text. All listed as fixes; a rule would be: a bk-cont paragraph that opens with a known speaker abbreviation + '. ' is a speech.

**Looks wrong and is right.** Shakespeare's and the Yale text's forms: prouds ('proud me no prouds'), becomed, chopt-logic, mista'en, o'erperch, untalk'd, fishified, fantasticoes, pardonnez-mois, be-rime, catch'd, and every -'d / -'st elision · Old-spelling quotations in the notes are quoted as printed: 'whereere thou tumblest in' (Q1), 'anie Englishman … anie button' (Silver), 'arres and barks', gleekman · Line numbers every fourth line but sometimes 73, 93, 97, 101 — the edition numbers the line it has room on; not an error · scan.txt: fears, grove, steep'd, stale, fails, drown'd, knack, lacks, beard — all right

## `julius-caesar` — Julius Caesar, William Shakespeare

Applied: **32** · held: 5 · links off: 6 + 0 per chapter

**How it reads.** Both samples (II.i–ii; IV.iii) read correctly word for word, but the second showed three full stops where the sentence plainly runs on ('face him there. / These people at our back', 'when it serves. / Or lose', 'obey necessity. / Which'), which led to the systematic check above. A word-level comparison with a second edition found no misread words beyond the two names in stage directions.

**What repeats.**

- A comma read as a FULL STOP at the end of a verse line, 30 times, plus one line that should have no stop at all — unlike the other three Yale plays, this one came from a weaker scan. Every case cuts a sentence in two: 'Have you climb'd up to walls and battlements. / To towers and windows', 'Go show your slaves how choleric you are. / And make your bondmen tremble', 'And we must take the current when it serves. / Or lose our ventures'. No rule can find them, so, although the class is over 25, all 31 are listed as fixes: they were found by reading every line-final full stop against the following line and by comparing line-final punctuation with a second edition (Project Gutenberg #1522, used only as a witness). Mid-line commas misread the same way cannot be found by either method and may remain.
- Line-break hyphens of the printed prose: 3 sites, all listed (Metel-lus, where-in, con-spirator). Same caveat as in romeo-and-juliet.
- Importer oddities worth a look, not text errors: the note on 'triumph' (I.i.35) is attached twice, as note 14 and again inside note 18 ('Pompey's blood: on line 35. triumph. …'); and at IV.iii.236 two speakers share one line through a printed brace, shipped as one continuation paragraph '<i>Tit.</i> &#160;&#160;} Good-night, Lord Brutus. <i>Mes.</i>' with both labels in italics instead of the bk-who markup.

**Looks wrong and is right.** Yale / Folio readings that differ from other editions and are right here: 'with awl' (I.i), 'wide walks' (I.ii), 'fought upon the clouds', 'Pluto's mine', 'bay not me', 'stricken', 'an I had been', swounded / swound, rime, masquer, corpse, Calpurnia, Thasos, 'March is wasted fourteen days' · be'st / beest, lov'dst, not'st, insuppressive, charactery, o'ershot, o'ersway, o'erswell and all elisions; 'dear dear love', 'pity pity', 'poor poor dumb mouths' are Shakespeare's repetitions · Notes quoting the Folio in old spelling ('Tradesmans matters, nor womens matters … old shooes'), the editor's proposed 'instranged' / 'enstranged', and the Latin februa / februare / februatus / februarius · scan.txt: clear, stain, beads, wander, became are right; trehonius and strata fixed

**Links.** Speech prefixes and minor characters with famous Roman names.

## `hamlet` — Hamlet, William Shakespeare

Applied: **5** · held: 4 · links off: 4 + 0 per chapter

**How it reads.** Both samples (II.ii players, V.i gravedigger) read as a faithful Yale text: verse and prose lineated as printed, line numbers in their own spans, footnote markers in place; no wrong word found in the dialogue beyond the two listed. The text is clean; the faults are in the glossary notes' lemmata and in the flattened braces of joint speeches.

**What repeats.**

- Prose keeps the Yale page's lineation: about 64 words are divided by a hyphen at a <br> ('nut-<br>shell', 'antici-<br>pation', 'maz-<br>zard', 'counte-<br>nance'). The candidate list's 44 'line-break hyphens' are all of this kind. They render as the printed page does (hyphen at the line end) and keep the line numbers true, so they are NOT errors as long as the <br> stays; they would become errors only if prose were ever reflowed. Not listed.
- Joint speeches lose their brace: 10 lines print as '<i>Mar</i>. &nbsp;&nbsp;&nbsp;} We do, my lord. <i>Ber</i>.' (class 'bk-sp bk-cont'; ch1 x7, ch2, ch3, ch4 — the ch4 one uses &#160; instead of &nbsp;). The edition's two names joined by a brace come out as first name, a stray '}', the speech, then the second name after it. A rule could rewrite them as 'Mar. and Ber.' in the bk-who style ('Hor. and Mar' is already so written once).
- Four notes print their lemma twice where the lemma ends in its own punctuation ('Long . . . king!', 'Between who?', 'se offendendo', ''While . . . grows''); listed as probable fixes — looks like a generator edge case.

**Looks wrong and is right.** All Elizabethan elisions and forms of the Yale/Oxford text: ha't, wh'er, e'il, op'd, o'ergrowth, o'erhasty, unanel'd, unhousel'd, ungor'd, barefac'd, befall'n, plurisy, leperous, persever, splenetive, scrimers, imponed, margent, out-herods, mallecho · Old-spelling quotations in the notes (betweene vs daie, alwaies haue, haire downe, drawe/laye/legg/sawe/lape up drinke, Whylst grass doth growe, screeking raven sits croking, Erode ragis in the pagond, ydle, aysell, vennie, Iohn-a-dreames) — quoted verbatim from 16th-century texts · Textual-note readings: 'sleaded pollax', 'inobled', 'peajock', 'her(o)nsew / her(o)nshaw', 'eale' · 'too too solid', 'night night', 'many many bodies', 'that that earth' — Shakespeare's own doublings · Speaker prefixes 'For' (IV.iv, twice) beside 'Fort' (V.ii), '[P] King / Queen', 'Other', '[First] Clo' — the edition's own · Scan-list pairs (stale/state, wards/words, lender/tender, marrow/morrow, brood/broad, locks/looks, stain'd/slain) — all the right word · ch4 '<b class="bk-who">A noise within</b> [Voices.] Let her come in.' — a stage direction set in the speaker style; harmless · ch3 note 26 lemma 'dispriz’d' has a curly apostrophe where the text has a straight one — cosmetic

## `tempest` — The Tempest, William Shakespeare

Applied: **3** · held: 18 · links off: 5 + 0 per chapter

**How it reads.** Both samples (II.i; V.i) are clean: verse lineation, shared lines and line numbers intact, no misreadings. The only faults in the book are the Dramatis Personæ's 'Sesastian', one unrecognised speaker label, and the prose line-end hyphens.

**What repeats.**

- Line-break hyphens of the printed prose: 21 hyphen+<br> sites, 18 of them a broken single word and listed as fixes (ad-vantage, blas-phemous, inso-lent, inacces-sible, brew-ing, deli-cate, Nea-politans, mon-ster x2, credu-lous, free-dom, in-terrupt, mur-rain, daugh-ter, vice-roys, gar-ment, an-other). Three are real compounds that happen to break at the hyphen and stay: 'thunder-<br>stroke' and 'moon-<br>calf's' (both hyphened elsewhere in the play) and 'five-<br>and-thirty'. In seven sites the line-number span stands between the halves ('ad-<br><span class="bk-n">37</span>vantage!'); the proposed text keeps the number at the head of the next line. Same caveat as in romeo-and-juliet: the <br> keeps the printed line, so on a wide screen the hyphen looks as it does on the page — the lead may apply these by rule, or not at all.
- Five curly apostrophes in a text that otherwise uses the straight one (cosmetic): 'there’s more work' (I), 'Gonzalo’s ear' and 'clust’ring filberts' (II), 'What’s dearest' (III), 'I’ll not swear' (V).

**Looks wrong and is right.** Shakespeare's and the Folio's forms kept by the Yale text: ow'd, ow'st, op'd, call'dst, strok'dst, unshrubb'd, o'erboard, Whe'r, 'Of it own kind', 'if heed me', scamels, Bermoothes, incharitable, flat-long, a-bat-fowling, discase · scan.txt: beard, tight ('tight and yare'), month, bands, safety — all right

## `classic-of-tea` — The Classic of Tea, Lu Yu

Applied: **0** · held: 0 · links off: 1 + 0 per chapter

**How it reads.** Read whole (it is 27,000 characters): the six set samples and then the rest of every part. The English is clean throughout, with no scan damage, and the eight notes are correct. One blemish lies outside the chapters, in the Library's own introduction: 'worked from . It is' has a space before the full stop.

**Looks wrong and is right.** All six machine candidates are correct: 'kua lu' and 'ta tsao li' are Chinese plant names, 'tous' the plural of the measure tou, 'Asparagus lucidus' and 'materia medica' Latin, 'Ch‘iu' part of the title Yen Tsu Ch‘un Ch‘iu. · Two small inconsistencies that may be the 1935 printing's own and are left: 'the Tang dynasty' (ch6) beside 'the T‘ang dynasty' (ch8), and 'Chih-li' (ch1) beside 'Chihli' (ch7). · '[in the province of Shansi] I Chou, Yu Chou' (ch1) lacks a comma after the bracket; punctuation of the source, not listed. · The bracketed insertions are the translator's and editor's glosses and belong to the text.

## `declaration-of-independence` — The Declaration of Independence, Thomas Jefferson

Applied: **0** · held: 0 · links off: 2 + 0 per chapter

**How it reads.** Read almost entire (the two samples overlap and cover two thirds): clean, in the broadside's capitalisation, with the signers and the order of Congress at the end.

**Looks wrong and is right.** Goddard broadside spellings and capitals are right: harrass, Connexions, Independency, Great-Britain · signers' abbreviations with superscripts (W<sup>m.</sup>, Tho<sup>s.</sup>, j<sup>r.</sup>, Benj<sup>a.</sup>) are intact in the html

## `magna-carta` — Magna Carta

Applied: **1** · held: 0 · links off: 0 + 0 per chapter

**How it reads.** Both samples (chapters 20 and 61) read cleanly; curly quotes round the kept Latin terms; one missing hyphen.

**Looks wrong and is right.** McKechnie keeps the technical words: halberget, kydells, contenement, wainage, amerced, 'foresaid'

**Links.** One key (Jews), and it is right: clauses 10 and 11 mean the Jews of England as moneylenders.

## `pausanias-description-of-greece` — Description of Greece, Pausanias

Applied: **94** · held: 10 · links off: 66 + 48 per chapter · 4 link(s) left open

**How it reads.** Four samples read as fluent Jones with section numbers and footnote markers in place, but each had one to three scan slips (Myirtilus, 'for then, at Cleonae', Axan, Baedalion, Calcus, 'treachery and riot in fair fight'), none of which the candidate list had caught — which is why a name scan and pattern searches were added. Verse oracles are sometimes run into the prose with their introducing colon lost ('to this effect My father cares for Pisa').

**What repeats.**

- SCAN SLIPS ARE SPREAD THROUGH THE WHOLE BOOK, about one in every 3,000–4,000 characters of a 1.5-million-character text (six in four samples): expect some 300–500 in all. The 104 rows listed are what the candidate lists, a rare-name scan and a dozen pattern searches found; a slip that makes a real English word and is not one of the patterns searched is still in there. The book wants either a better source or a second pass with a name list.
- Proper names one letter off, ~60 found and listed: C read as G (Galydon, Gephisus, Glymenus, Galaus, Cyges the other way), n/u (Thebaus, Antigouus, Peiraens), l/i/I (Cieomenes, Aetollans, Helianicus, CalIon, PalIantium, HeIlenium, kilIer, foIl.), m/rn/ni (Arternis, Cadnius), others (Sicyorians, Philepoemen, Mermesianax, Nermion, Baedalion, Axan, Calcus x2, Coroncia, Heraeleia).
- Real-word confusions, listed where found: 'lie' for 'he' (4), 'hut' for 'but' (3), 'tie'/'ah'/'riot'/'mail'/'dawn'/'will,'/'then,' for the/an/not/man/down/with/them.
- Words split in two, 19, ALL in Book 1 (Attica): 'him self' x5, 'them selves' x5, 'be cause' x3, 'after wards' x2, 'note worthy' x2, 'her self', 'with out' — fixable by rule in ch1.
- Sentences beginning lower-case after a full stop, 11 listed ('Priam. but even', 'howls. realizing', 'head. for this reason'); in two the capital itself is lost ('here is also' for There, 'bout the offering' for About).
- About 75 paragraph breaks fall in mid-sentence, after a comma or semicolon ('…until he waged war against the Romans,</p><p>being the first Greek…', '…Poseidon the wave,</p><p>and there are statues of Zeus…'). They come from the source's section boundaries; the next paragraph starts lower-case. Should be joined by rule: a <p> that ends in ',' or ';' followed by one that starts lower-case.
- Gaps in the text marked '...' ('Lysander at Aegospotami… Erianthes a Boeotian... above Mimas') are the manuscript lacunae of the edition, not faults.

**Looks wrong and is right.** Transliterated Greek glosses in brackets (aiges, chion, halme, phyta, myces, horoi, ballein, ekbrazein, pythesthai, kypselai, synoris …) — correct · Real names that sit one letter from a commoner one: Athene (the Argolic town), Therae, Eratus, Agesilas, Lysus, Sandion, Prias, Arieus, Syllis, Sillus, Polygius, Lathria, Carpia, Dasmon, Glenus, Pothaeus, Oeroe, Laonice, Camicus, Lysinus, Periclus, Saunium, Conius, Calaon, Geres, Pagasus, Lyncea, Corynthus, Didas, Thersius, Erochus, Termessus, Promne, Rhoeus, Alphius, Eudelus, Europas, Lycormas, Pyleus, Diagon, Sinoe, Scyras, Cranius, Coria, Olmus/Almus/Almones/Olmones — all Pausanias's · Jones's wavering forms, not slips: Darius/Dareius, Lebadea/Lebadeia, Cabiri/Cabeiri, Clytemnestra/Clytaemnestra, Aristogiton/Aristogeiton, Cheilon/Chilon, Charilaus/Charillus, Chrysis/Chryseis, and Greek -os beside Latin -us (Helios, Cronos, Taygetos, Pamisos, Cyzicos, Ambrossos, Rhianos, Icarios, Lebedos, Battos) · 'bustrophedon', 'pancration'/'pancratium', 'pentathlum', 'thesmothetae', 'orichalcum', 'agnus castus', American spellings (honor, color, neighboring) — the edition's · 'her her children', 'had had' — grammatical · NOT listed because the right reading could not be fixed without the source: 'in the reign of Artesilaus' (ch3; Agesilaus?), 'the tile image of Apollo' (ch8), 'a small proportion of Phocians and of Attics' (ch5), 'of the race of Arceas' (ch8), 'seapower' (ch4), note 'one stadion the second' (ch3, a semicolon lost) — all look like scan damage

**Links.** The reader links one occurrence per book, the first, and Pausanias's ten long books each hold many namesakes: books 5–6 (the Olympic victor statues) are full of athletes and sculptors called Xenophon, Herodotus, Socrates, Pythagoras, Leonidas, Telemachus; the royal pedigrees of books 2–4 and 8 hold earlier Archidamus, Agesilaus, Lycurgus, Cypselus, Peisistratus. Keys put in `off` although one or two books are right name them in `why`.

**Links left open.** `Palace_of_Nestor` — 'Pylos' in ch3 and ch4 is Nestor's Pylos of legend and Homer; the entry is the excavated Mycenaean palace named after it — defensible, but the text speaks of the town, which Pausanias places at Coryph · `Eleutheria` — ch9 'games called Eleutheria (Of Freedom)' is the Plataean festival; the entry is the word and the Hellenistic diplomatic status · `Sais,_Egypt` — ch9 'the Egyptian name of Sais' is given as a name of Athena, not the city, though the name comes from the city of Neith · `Taras` — ch10 'Taras the hero', son of Poseidon, the eponym of the city in the same sentence

## `strabo-geography` — Geography, Strabo

Applied: **216** · held: 58 · links off: 102 + 60 per chapter · 3 link(s) left open

**How it reads.** The samples read as raw OCR of the Bohn translation: sound sentences broken every page or so by a misread letter (tattle for battle, beads for heads, lie for he, leaving for having, a.d for and), a damaged name (Cepliallenia, Aplhidnae, Elsaea, Troglodytee) or lost punctuation; the notes are in the same state and their Greek is systematically garbled. Structure (books, sections, verse references, footnote markers) is intact and there are no page numbers or running heads in the prose.

**What repeats.**

- The whole English text is uncorrected OCR. The 16 samples (72,000 characters) held 22 plain errors the list above now carries, about one every 3,300 characters; over the 2.9 million characters of text and notes that is of the order of 700-900 errors, of which this file lists about 275. The rest can only be found by reading the book against the Bohn edition; a clean re-import is the real cure.
- Capital X printed as a digit 3-9 at the head of a name: 51 instances (rule: a digit 3-9 followed directly by two or more lower-case letters, other than the ordinals 3rd, 4th, 4ths, 6th, 7th, becomes X). 3anthus x6, 5anthus x4, 4anthus x2, 8anthus x2 (Xanthus), 4ucar x5 and 5ucar (Xucar), 7uthus x3 (Xuthus), 3erxes x2 and 5erxes (Xerxes), 3ylander x2 and 6ylander (Xylander), 3enophon x2, 7enophon, 3en., 3enoph., 3enocrates, 4enocrates x2, 5enarchus x2, 5enophanes, 3imene x2, 3imiera, 8anthii x2, 8andii, 9andii, 3anthians, 4ativa, 4elsa, 6ylophagos. Five are listed as fixes.
- The ae / oe ligatures of the names are misread in several ways, each listed singly above: as 'oe' (Achoeans, Heracleidoe, Aegoean, Cenchreoe, Minturnoe, Calydnoe, Athenoe, Hestioeotis, Moeotis, Moeotae, Poeonians, paloestra, armilloe; also Athenoeus x6 in notes, Perrhoebi x3, Groecia, Myloe, Canoe x2 not listed), as 'ee' or 'e' (Scenitee, Troglodytee, Pylee, Belge, Kelte, Bastarne, Sauromate, Sirenusse x2, Ozole, Milye), and as '$' with or without a letter (15 instances, all listed: C$esar, Ach$eans, $Etolians, $Oeniadae x4, Vard$sei ...).
- 'the' read as 'tile' 13 times and as 'tie' or 'tle' 3 times; 'he' read as 'lie' 6 times; 'modern' as 'modem' 4 times; 'having' as 'leaving' twice. All are listed.
- Words and names broken by a space, a stop or a line-break hyphen (about 30, all found ones listed): Mess nia, Philome lium, Cory bantes, De metrius, Chal cedon, Perga mum, impregna ble, Lacedae. monians, Etymolo. gicum, Macro- cephali, Cy- parissii.
- The Greek quoted in the text and notes is damaged by rule: rho is printed as omicron with a combining iota subscript (263 times: γεωγοͅαφικά for γεωγραφικά, κουοͅά for κουρά), and a word-initial breathing is printed as '?' plus a combining mark after the preceding word (37 times: τῶν?̓αγαθῶν). Not listed as fixes; both are rule-fixable.
- Four notes point at footnotes of the printed volumes that no longer exist under that number ('See note1, p. 13', 'note4, vol. i. p. 76', 'note9'): leftover print apparatus, not listed.

**Looks wrong and is right.** Strabo's own words, transliterated and glossed in the sentence: bria, ipes, cornopes / parnopes, erysibe / erythibe, laines, madaris, ginni, hirpos, peliae / pelii, peligones, timuchi, thripes, cebi, hyssus and sarissa, pacton, pallades, coccina, corsium, hyalus, acapniston, sagares, gangama, antacaeus, brastai, epichaerekaki / epichaeragathi, scelotyrbe and stomacacce · names that look like slips and are right: Tarne, Botton, Piasus, Teutheas, Pytna, Perias, Anias, Malaus, Parisus (the river), Baenis, Arbies, Zagrius (twice), Mantiane, Satioeis, Orminium, Epitaurus, Heleii, Aeclus, Polybus, Itium, Cartera-Come, Corean games, Peteus, Mén Carus, Apollo Ulius, Limera · variant spellings the translators use beside the usual one, left alone: Sirenusae, Sammonium, Pattalene, Palimbothra, Laodicea, Heraclaea, Histiea, Dareius, Esculapius, Eolians, Chaldeans, Aethiopia(ns), Cheledoniae, Thyria, Tralleis, Sperchius, Chalcideans, Megaraeans, Potidea, Meonians · the eleven 'names written two ways' differ only in the capital after a hyphen in a modern place-name (Criu-metopon / Criu-Metopon, Eski-hissar / Eski-Hissar ...): not errors · grammatical doublings: 'where there are many laws, there there will be law-suits'; 'fell in in consequence of an earthquake' · period forms: downfal, thunnies, farinacious, fossile salt, trowsers, connexion, soloecize, monolithe, subigneous, arbustive, romb-shaped, nomade tribes, hypothenuse · Latin, French and German quoted in the notes are clean enough to leave (Lunâ gens prior illa fuit; Terme saint du tourment d'Alphée; Ihr Erbauer war ...), apart from the two line-break hyphens listed · real words on the scan list that are right where they stand: stale urine, mimes low and bellow, welts, lavers of Indian copper, paints, grants, draught, wanders alone, smelt the copper, a wound healed · the section numbers inside the prose (6.2, 1.70) are marked up (span.bk-n), not stray apparatus

**Links.** Each key is linked once per Book, so I decided by Book from the first occurrence. Three systematic faults: (1) a place-name linked to a 'Battle of …' entry, which in a geography is nearly always the place (Issus, Mycale, Granicus, Hydaspes, Himera, Trebia, Metaurus, Pharsalus, Lade, Artemisium, Ilipa, Thermopylae) — I left the link where Strabo is speaking of the battle (Cannae, Munda, Thapsus, Raphia, Carrhae, Leuctra); (2) homonymous places, which Strabo collects on purpose (Samos, Argos, Chalcis, Antioch, Nicopolis, Olympus, Ida, Abydos, Selinus); (3) 'Caesar' for Augustus and 'Arabian Gulf' (the Red Sea) aliased to the Persian Gulf. Hipparchus the astronomer has no entry of his own and takes the tyrant's son's.

**Links left open.** `Aetolian_League` — 'Aetolians' in Strabo are the people at every period (under Thoas at Troy, as neighbours of the Aenianes); the entry is the federal state of the 3rd–2nd centuries BCE. Not a different referent, but na · `Sarno_(river)` — the ch14 link (alias 'Sarnos') stands in the account of Samos; I could not find the word in the shipped text to see what it is · `Mount_Dikte` — ch10 says 'Dicte is a spot in the Scepsian territory and a mountain in Crete' — one sentence names both

## `diodorus-library` — The Library of History, Diodorus Siculus

Applied: **31** · held: 10 · links off: 79 + 51 per chapter · 3 link(s) left open

**How it reads.** The nine samples are clean in form (chapter numbers styled, diacritics Cymê/Helicê/Achaïa, British spelling) and Books 17, 19, 20 read without a fault, but the samples from Books 1, 5, 12, 13 and 15 each contained wrong words that make nonsense where they stand; collation against Perseus confirmed every one I could check and showed the damage is general in Books 11-15. This book is the one in my set whose text cannot be trusted without a full collation.

**What repeats.**

- THE LACUSCURTIUS TRANSCRIPTION IS FULL OF REAL-WORD SLIPS THAT NO SPELL SCAN CAN SEE, worst in Books 11-15. I collated 40 chapters of Books 11-15 (about 14,900 words) and 11 chapters of Books 16-17 (3,900 words) against the Perseus transcription of the same Loeb text (Perseus:text:1999.01.0084, Books 9-17 only): Books 11-15 show about 27 genuine faults in the shipped text, i.e. ~1.8 per 1,000 words, which projects to roughly 300 in those five books; Books 16-17 run at about a third of that (mostly dropped small words: 'he [soon] met', 'being [far] superior', 'pursued [the] conflict'). Examples: 'nor garland in sufficient abundance' (gold), 'at this survey time' (very), 'unusually hot water' (weather), 'the statue of Athens' (Athena), 'cast shadows on the rather' (earth), a ten-word phrase dropped at 15.49.1. The slips look like dictation/auto-correct errors (also 'Adapted-nirari' for Adad-nirari in a note) and are in the source pages themselves. The 29 found by collation are listed as fixes because no rule can make them; the remedy for the class is to collate Books 11-17 whole against Perseus — the script used is /tmp/claude-0/-home-user-folio/d1849b6f-1025-5324-9583-5c025d0cfcec/scratchpad/r8/collate.js (word-level LCS diff per chapter, pages fetched by fetchp.sh). Perseus has its own slips (it drops 'pursued', 'fell', 'was' in 11.32 and prints 'tireme', 'Arcarnanian'), so each difference still needs a reader's eye. Books 1-5 and 18-20 have no Perseus counterpart; the samples of Books 1 and 5 gave three faults in 9,000 characters ('extorts the glory', 'sons's sons', 'in all any other'), Books 19 and 20 none.
- Notes keep LacusCurtius's house style for page references, with no stop or space: 'p120', 'pp380 f.', 'opp. p301', '1 p143' — 186 instances in the notes (regex \bpp?\d+). Cosmetic and consistent; fix by rule ('p120' -> 'p. 120') only if wanted.
- Plural possessives written with a second s occur twice in Book 1 ('sons's sons', 'suitors's souls'); the other 34 's's' are singular names (Dareius's, Agis's) and are right.

**Looks wrong and is right.** 'This stronghold was the capitol of all the other walled communities' (Book 14) — so in the source page; a citadel is meant, leave · Names as Diodorus/the Loeb print them: Spartacus king of the Bosporus (12.36; the note at 16 n121 explains Spartocus), Nittus Menenius, Doricus, Phormia, Spartaeus, Democrates, Molion, Amosis, Peteus, Mneves, Hesperoukeras, Tarantini, Baliaric, Dareius, Coele-Syria / Coelê-Syria · Loeb compounds and coinages: discoveress, triped, horographs, crosswall, fairminded, freespoken, goathorns, roadmenders, singlehanded, swordhand, warcry, chrysoliths, cotyls, choenices, sacrificant, nepenthic, iphicratids, zeugippae, kolumbethra, struthocameli, cynocephali, crocottas, cepus, anthredon · Scholarly apparatus in notes: var. lect., ext. (Valerius Maximus), Eng. transl., opp., Sin-shar-ishkun, the French and German quotations in Book 1 notes 261-262 (courtes, souvent, knifflich, kleinsten), De bello Lucanico …, mythographi, nauarch, synhedrion, hypomeiones, proscynesis, ostracophoria, cleruchists, appadana · '5&frasl;19' in a Book 2 note is a real HTML entity (fraction slash), not printed markup · 'roofs of tile', 'the Teans', 'a mature statesman', 'farmed out its territory', 'stave the enemy off', 'haled to prison', 'Sparto-Boeotian' — scan-list items, all right; verse elisions heav'n, list'ners, who'll are the translator's

**Links.** 526 keys read. Chapter verdicts assume the reader links the first mention of a key in each chapter (the context shown); where a key is in `off` although one or two chapters are right, `rightIn` lists them. Systematic: (1) the Athenian archon and Roman consul year-headings of ch11–20 are the main source of namesakes (Antipater, Conon, Lysimachus, Theophrastus, Tiberius, Claudius, Lucretius…), with Olympic victors second; (2) Diodorus' Red Sea / Arabian Gulf are the Erythraean Sea and the modern Red Sea, so both keys point the wrong way; (3) cities are linked to battles named after them (Himera, Thermopylae, Pharsalus, Heraclea, Thapsus, Raphia, Ecnomus, Hydaspes). Not reported: the Greek names Diodorus gives Egyptian gods in ch1 (Zeus, Hermes, Typhon, Demeter).

**Links left open.** `Oracle_of_Ammon` — ch1 means the god ("the Zeus who is called Ammon"), ch3 and ch5 a euhemerised King Ammon of Libya; ch2, 14, 17, 18 are the oracle. Whether the god may link to the entry on his oracle is a policy call · `Cassander` — ch17: "Thracian and Paeonian scouts with Cassander in command" at the crossing into Asia — commonly emended to Asander; the son of Antipater did not go on the expedition. Right in ch18–20 · `Tunis` — ch20: "White Tunis, as it is called", which Diodorus distinguishes from Tunis; and the entry is written about the modern capital

## `apollodorus-library` — The Library, Apollodorus

Applied: **29** · held: 5 · links off: 50 + 16 per chapter · 2 link(s) left open

**How it reads.** Three samples (Danaids, the Seven against Thebes, the sack of Troy) read as clean Frazer; section numbers sit in bk-n spans, notes are full and well-formed with Greek intact. Faults are few and mostly typographic: spaced quotation marks, em dashes for hyphens in three compounds, one dropped word ('His in-law').

**What repeats.**

- Quotation marks set off by a space on the inside — “ I would command him,” … “ to bring the Golden Fleece. ” — 16 opening and 5 closing marks, all in the translation's direct speech (ch1 x3, ch2 x3 + 2 notes, ch3 x2 + 1 note, ch4 x9), a residue of the source's quote markup. All are listed above; the importer could close them up by rule (delete a space after “ and before ”).
- ch2: the Shield of Heracles quotation is wrapped in a <q> element AND carries printed quotation marks (<q> “ But all his back … the kibisis. ” </q>); if the reader's stylesheet draws marks for q, they are doubled there.

**Looks wrong and is right.** Transliterated Greek and the etymologies are right: laos / laas, alcyon, ceyx, estraphe, anaphanenai, italus, haima, nartheca, meleagrides, kibisis, bouzygos · French, Latin and German titles in the notes: Le culte de Dionysos, En tribu, Voyage de la Perouse autour du Monde, Contes populaires, De dea Syria, De mensibus, De senectute, 'October equus', Ferula communis, [scil.], pp. xviiff. · Names the scanners flagged are right: Otreus, Pellas, Horus, Molion, Athenion, Melos, Pelian spear, Lyse, Leades, Bores, Opis, Hermiona (quoted variant), Iola (Iole), Athena Polias · horsekeeper(s), hammerfish (in a quoted comic line), 'bagged his game', 'banged him on the head' are the translator's words; angle brackets (<Menestheus>, < The Gorgon,>) mark an editor's supplement · Folk-Lore / Folk-lore differ only in a capital; 'The sons of Egyptus by Gorgo, cast lots' (ch2) has an odd comma, left as the edition's

**Links.** A mythographer's genealogies recycle names: the catalogues of the sons of Egyptus, Lycaon, Heracles and Priam and of Penelope's suitors produce most of the errors (Plato, Horus, Paris, Cerberus, Patroclus…), with eponyms and nymphs linked to their places, and four entries for plays or a poem linked from the hero's name. Only four chapters, so every key was judged on the first mention in each book.

**Links left open.** `Mycenaean_Greece` — 'the Mycenaeans' are the townspeople of Mycenae in the legends of Io and Atreus; the entry is the Bronze Age culture — broader, perhaps acceptable · `Tomb` — linked inside the place name 'the Bitch's Tomb' (Cynossema); it is Hecuba's tomb, so the common-noun entry is not wrong, only odd

## `anglo-saxon-chronicle` — The Anglo-Saxon Chronicle

Applied: **47** · held: 21 · links off: 20 + 3 per chapter · 1 link(s) left open

**How it reads.** Sample 1 (annals 943-958) had four faults in a page ('so be made', 'The year', 'Elfgiva'a', 'A. 951 This'); sample 2 (1100-1101) one ('flood queen'). Annals are one paragraph each, variant-manuscript annals marked bk-var, verse in blockquotes, notes present. The scan damage is real but lighter than in the Iliad or the Aeneid.

**What repeats.**

- The text (Giles's translation, from a scanned source) reads a comma as a full stop again and again: 22 places where a stop is followed by a lower-case continuation, 15 in prose and 7 in the verse (all listed). Real-word misreadings are present too — both samples gave some ('so be made', 'The year', 'flood queen') — so more remain than the candidates show; a full read of ch5-ch9 would repay.
- ch7 (annal 1065, the verses on Edward's death): the poem's block is cut off in mid-sentence and its continuation is set as an ordinary prose paragraph beginning in lower case — '…though he long erst<br>of land bereaved.</p><p>in exile dwelt wide o'er the earth, since Canute o'er…'. The lines from 'in exile dwelt' on belong inside the verse block; a structural fault for the importer rather than a one-string fix.

**Looks wrong and is right.** Old English and Latin words kept by the translator: Natan-leod, Ægels-threp, ceols, esks, 'gerrefa', 'godefrihte', ealdor, ealdordom, beorns, 'pada', mass-hackel, crucet-house, litsmen, wardmen, sester (a measure), godsib, sibbe, stepel / steopel, offaerd, 'thider', and the Latin of the long note in ch4 · Giles's spellings: bishoprick, abbat, stedfast, ne'ertheless, ganet's-bath, aftermass, Folkstone, Clugny, shewed · 'ealdormann' once (ch5, with a footnote) left: it is the Old English form and may be deliberate; only 'earldorman' and 'ealdonnan' are listed · Name variants are the manuscripts' own: Ethelstan / Athelstan, Agelric / Egelric, Eldred / Aldred, Berthwold / Berthwald, Algar / Elgar, Anlaf Curran (text) / Cuaran (note), Stanford-bridge, Romsey, Thame · Square brackets hold the translator's modern place-names ([Aylesford,] [Old Sarum]); 'that that he willed' and 'so that that shire' are grammatical · 'Borough,’ (burgus)' in ch4 note 5 has a closing quotation mark with no opening one — left, the opening cannot be placed with certainty · 'each monks who should fill' (ch5) reads oddly but may be the translator's; not listed

**Links.** English place-names collide with American and Caribbean capitals (Dover, Boston, Kingston, St. George's), saints' days with cities and events (St. Paul, St. Augustine, Ides of March), and Old English personal names in genealogies with unrelated entries (Ida, Wig, Alla, Nun, Bern, Seth). The Roman emperors of the opening annals (Claudius, Nero, Vespasian, Titus, Domitian) are the right ones.

**Links left open.** `Great_Britain` — x4 on 'Britain' and 'British': the island is the entry's referent, but 'a British hostage' (ch3) and the 'British' tongue (ch1) mean the Britons, i.e. the Welsh; the key is already switched off in Bed

## `treaty-of-versailles` — The Treaty of Versailles, The Allied and Associated Powers and Germany

Applied: **46** · held: 15 · links off: 7 + 1 per chapter

**How it reads.** Both samples (Arts. 148–158; 346–355) read correctly as treaty prose but each held slips the scanners had missed or under-counted ('Egyption' twice, 'Sections in and IV', 'Kiachow', the truncated 'MOSELLE' heading), which is why every non-dictionary word in the book was then checked in context. Structure (Article headings, lists, tables) is intact.

**What repeats.**

- This text is a hand-keyed / OCR transcript with far more slips than any other book in this batch: 61 fixes (46 certain) from a dictionary pass over every word plus two samples. Two classes dominate — keying slips in ordinary words (acordance, intruments, judical, evacuted, asigned …) and capital-letter misreadings in names (R→B/K/E: Bailways, Bheda, Kuthenians, Euttebiill; F→E: Ealkenberg, Ejord, Eor; ü→ii: Pulvermiihl, Ziilz). A slip that happens to make an English word, and a wrong digit in a figure or date, are invisible to both methods; the frontier articles (chapters 2–3) and the tables deserve a collation against a clean source.

**Looks wrong and is right.** Russstrom-Memel-Niemen with three s is right (German Rußstrom); so are Roumania, Esthonia, Hedjaz, Teneriffe, Luxemburg, Coblenz, Trèves, Posnania, Strasburg (West Prussia), Maghzen, semsars, 'associés agricoles', Moresnet neutre, procès-verbaux, ipso facto, bonâ fide, ad valorem, pharmacopœial · German without its umlaut, left as transmitted: Oberprasidenten, Regierungs-prasidenten, Leobschutz (x3, beside Leobschütz x4), Thuringen, Duren, Fohr · Signature block names without accents (Alsua, Mendez, Haidar) beside the accented forms in the preamble (Alsúa, Méndez, Haïdar); Veniselos / Venisélos · Answald (a ship in the list of German vessels), Fidlin, Lonken, Schleise, Gr. / Kl. (Gross, Klein) — real names and abbreviations · abovementioned, nightwork, 'viz.', a space before some colons ('following conditions :'), CZECHO-SLOVAK and RUSSSTROM in capital headings, Inter-allied x1 · 'that that Commission' (ch 12) is grammatical

**Links.** The country, city and institution links are right for a text of 1919; the faults are American namesakes of European towns (Frankfort, Dover), a word inside a longer name (Grand Duchy, South-West Africa, the Sound) and two entries dated after 1919 that the date rule did not stop (Minister of Defence 'from 1940'; Montgomery via a misprint).

## `russian-primary-chronicle` — The Russian Primary Chronicle

Applied: **10** · held: 4 · links off: 4 + 7 per chapter · 1 link(s) left open

**How it reads.** The six samples read cleanly; this text has already been proofed against the page images and it shows. What remains is a dozen small slips, mostly in the biblical citations and their punctuation, and the stray space after opening quotation marks. Notes are few and correct.

**What repeats.**

- A space after an opening quotation mark — 65 places, spread through the whole book ('said to them, “ Behold, we have found', 'Olga made this reply, “ Your proposal', 'the serpent said, ‘ You shall not die'). The rest of the book (several hundred quotations) has no space. A rule removing the space after “ or ‘ before a letter fixes all of them; not listed singly.
- The grey page numbers of Karski's edition stand inside the sentences on purpose (span class bk-n; the introduction explains them) and are not stray apparatus.

**Looks wrong and is right.** hundredmen (ch153), silverpiece (ch36), dogflies (ch53), lovingkindness: one-word compounds that may be Cross's own or may have lost a hyphen; no hyphenated twin stands in the book, so left alone. · The heading 6542–6543 (1034–1036) and the corrected misprints are accounted for in the book's own 'About this text'. · Biblical -eth/-est forms in the quotations, 'intemporally', 'reëntered', 'grivna', 'lepki', 'oh Lord' are the translator's. · 'Mstislav had had confidence' is grammatical. '(Apoc., ii, 8,9)' lacks a space after the comma; trivial, not listed. · Scan-file words right in place: wafer/wafers, token, horror-struck, haled, giant, atone, locked, lakes, wander, internal strife, draught, aimed.

**Links.** Most name problems were already handled by the per-chapter switches for the princes. What is left is biblical names in the catechism of ch53 colliding with Egyptian gods (Seth, Nun), and four people who share a name with a famous bearer in one annal each.

**Links left open.** `Russians` — 'we Russians', 'Christians and Russians' in the 10th-century treaties are the Rus'; the entry is the modern ethnic group of the Russian Federation. The country entry 'Russia' is already off for this b

## `novgorod-chronicle` — The Chronicle of Novgorod

Applied: **59** · held: 11 · links off: 18 + 4 per chapter · 3 link(s) left open

**How it reads.** The six samples read as sound translation with light OCR damage — about one slip per 4,000 characters ('‘Novgorod', 'Svyatoslavof', 'H0I3’ Ghost', a signature mark 'H2', 'de fence', full stops for commas round 'Sovereign Lady'). Annal entries are one paragraph per year with the bracketed editorial insertions kept; notes are short glosses and mostly clean.

**What repeats.**

- The possessive apostrophe is lost after 'Knyaz' and 'Vladyka', leaving a lone s — 9 places (ch3, ch4, ch5, ch7, ch8 x3 + one inside the 'lire' row, ch9): 'the Knyaz s Court', 'the Vladyka s absence', 'the Veliki Knyaz s patrimony'. All listed; a rule '(Knyaz/Vladyka) s ' → '’s ' covers them.
- 'pl.' (plural) printed 'pi.' or 'PI.' — 6 places (ch2 n29, ch5 n33, ch11 text x4), and 'lit.' printed 'ht.' — 2 places (ch1 n14, n30). All listed.
- 'year' printed 'j’ear' — 3 places (ch2, ch6, ch8), each in the formula 'The same j’ear'. All listed.
- Stray opening quotation marks before a capitalised word with nothing quoted — 4 places ('‘Novgorod', '‘21st', '‘Veliki Knyaz', '‘Nemtsy'). All listed.
- Three notes end in a hanging hyphen where the print has a dash or the note is cut short: ch4 n62 'Voroni Kamen-', ch7 n39 'Leontius-', ch7 n88 'sc. treaty, gramota-'. Not listed: what follows the hyphen, if anything, cannot be told from the text.
- Sentence stops lost or misread at a line end: a missing full stop before a capital (ch5 'two priests In the Nerev quarter', ch6 'ate it They burned'), a comma for the full stop at the end of an annal entry (ch1, ch6, ch8), and a full stop for the comma round a vocative (ch5 'chastised us. Lord', ch7 'Sovereign Lady' x3). All listed.

**Looks wrong and is right.** The chronicle's own shifting name forms, kept by the translators, are not slips: Afonasi/Afanasi, Volfromei/Valfromei, Yagoilo/Yagailo, Dubravna/Dubrovna, Rodokovitsi/Radokovitsi, Antonov/Ontonov, Ivanka/Ivanko, Domont/Dovmont, Ilmer/Ilmen, Fedos/Feodos/Feodosi, Tzargrad/Tsargrad, Kuril/Kyuril/Kiril, Konstyantin/Kostyantin, Suzdal/Suzhdal, Pleskov/Pskov, Lyudogoshcha/Lyudgoshcha, Danilovitch, Yurevich, Vasilevich, Olena/Elena. · Aigust (ch5) is a Lithuanian prince's name, not 'August'. · Russian terms and their glosses are correct: grivna, kuna/kunas/kuny, nogata/nogaty, rezana/rezany, denga/dengi, pochka/pochki, poltina, korobyas, berkovets, kadka, kad, osminka, chetveriki, artugs, lopatses, groshes, tamga, smerds, poprishche, zver, seni, shnek, lobtsi/lobki, tysyacha, zavoloche, reka, Vira dikaya, Po zubu, molodtsy. · Biblical -eth/-est forms in quotations (resisteth, beareth, diggeth, collecteth) and 'spake', 'disadvise' are the translators' English. · 'had had himself shorn' is grammatical; 'Vse . . .' (ch1) is a lacuna marked in the print; 'Alexi-s.' (ch3 n10) is the editor's gloss supplying the s. · Scan-file real words right in place: marry, boots, atone, chair, bearing (life-bearing), chase, wonted, rains, wailing, hound. · A space before a semicolon or comma after a note mark ('Beresti ;', 'Volok ,') appears only in plain text, where the note mark was; not a fault. 'ie. Petitioned.' (ch5 n22) and 'lifegiving', 'shieldmaker' were left as possibly the print's own.

**Links.** Princes' names recur for four centuries (Yaroslav, Svyatoslav, Oleg, Igor, Rurik, Mikhail, Simeon), and the glossary holds only the earliest or most famous bearer, so each link is right at most in one chapter. Saints named in feast days and church dedications also link to namesakes (St. Paul, Antony, Titus, Helen, Mina). Chapters are the book's eleven spans of years, as numbered in the input file.

**Links left open.** `Tyre` — 'a church to St. Theodore of Tyre' — the saint is Theodore Tiro ('the Recruit'), and 'of Tyre' is the translators' rendering of Tiron; the English does say Tyre, but the Phoenician city is not what th · `Kholop` — x4, always 'Kholop Street' in Novgorod — a street named after the class, so the entry explains the name but the link is on a street-name · `Veche` — right for Novgorod's assembly throughout; in chapters 9 and 10 the word is also used for the church council ('the Eighth Veche in Rome', 'the eighth Veche of Rome at Florence'), which is not the town

## `luther-ninety-five-theses` — The Ninety-five Theses, Martin Luther

Applied: **0** · held: 1 · links off: 0 + 0 per chapter

**How it reads.** The theses (both samples, about two thirds of the document) read cleanly, numbered 1-95 without gaps in the part read.

**Looks wrong and is right.** Thesis 27 'They preach man who say...' is right (Hominem praedicant) · Latin and edition sigla in the notes are right: gratia infusa, confessionalia, verbis evangelicis, 'op. var. arg.', 'Weimar Ed.', 'Erl. Ed.' · 'i. e.' with a space is the edition's style

**Links.** Three keys only (Martin Luther, Mainz as Albrecht’s see, Christian), all right.

## `king-james-bible` — The Bible

Applied: **12** · held: 4 · links off: 14 + 7 per chapter · 1 link(s) left open

**How it reads.** The ten samples (Exodus, Joshua, 1 Kings, Nehemiah, Ecclesiastes, Ezekiel, 2 Esdras, 1 Maccabees, Luke, Philemon) read clean: no wrong word, no stray number, italics for supplied words and the paragraph marks intact. Verse numbers run unbroken in all 1,362 chapters, the markup is uniform, and of 6,959 margin notes only one is garbled (2 Samuel 23:8, note 5 — listed as a probable fix).

**What repeats.**

- No systematic fault. All 15 text slips are in the Apocrypha (1 Esdras to 2 Maccabees, chapters 926-1104 of the file), which plainly comes from a separately keyed source: non-words such as 'husbundry', 'inhibitants', 'aforersaid', 'ambasadors', each standing once against the correct spelling many times. The 39 + 27 canonical books produced no slip at all in candidates or samples. If the Apocrypha matters, it deserves one pass against a printed Authorized Version, since real-word slips there cannot be found by machine (I found one dropped word, 2 Maccabees 14:9, only by pattern).

**Looks wrong and is right.** 1769 spellings, all correct: aul, fetcht, pluckt, crookbackt, instructer(s), pransing(s), putrifying, lowring, sodering/soder, cuckow, ospray, gier eagle, lign aloes, broided, horseleach, forborn, folden, strowed, lothe, vail, havock, garlick, lunatick, frantick, physick, magick, mastick, heretick, bishoprick, publickly, expence, unreproveable, unrebukeable, chrysoprasus. · 1611 spellings surviving in the Apocrypha, left as the text: governours (x2, against governors x40), therewithall (x2), traiterously, tred (Ecclus 33:16), goodturn (Ecclus 35:2). · Closed compounds are the Authorized Version's own: barnfloor, bondservice, churchrobber, covenantbreakers, eyeservice, fellowcitizens / fellowheirs / fellowprisoner…, gazingstock, lookingglass, mercyseat, shoelatchet, stonesquarers, threshingfloors, townclerk, winterhouse and the rest of that list. · Genuine doublings: 'cometh in in his season' (Job 5:26), 'for for a piece of bread' (Prov 28:21), 'he went in in my sight' (Ezek 10:2), 'for for these things' (Ecclus 22:22), 'Nebuchadnezzar Nebuchadnezzar dreamed' (Dan 2:1), 'laboureth laboureth' (Prov 16:26), 'that that', 'her her', 'a thousand thousand'. · Words the text really has: mighties (1 Chr 11:12), sackclothes (Neh 9:1), manservants (Neh 7:67), laidst (Ps 66:11), Dekar, Ephrain (2 Chr 13:19), Shophan, Shapham, Shallun, Abitub, Rechah, Nodab, Pelaliah, Jokmeam, Allom, Maked, Cades-Barne, and Cedrou (1 Macc 15:41 — the AV prints Cedrou there and Cedron two verses earlier). · Margin-note words that are right: burglers, broused, rhinocerots, pestils, manicles, chanelbone, aweth, porphyre, fivesquare, vaultbeams, statutemaker, jawteeth, lilyflower, tierce, fallings, Harid, Aminon, Hirom, Chimhan, almuggim, galgal, lethech. · Second scanner's real words, all right in context: rains, sanctity, comers (Heb 10:1), foals, sifteth, wailed, moles, stare, share, fatling, tasting, shock, lasted, stacks, forgot, sawed, smiling, warming, check (Job 20:3), felleth, concert, eared, gains, felling. · Lower-case verse openings in the Prayer of Manasses (verses 2-7, 9, 13, 14) are right: the prayer is one sentence cut into verses. 'Rest of Esther 10' beginning at verse 4 is right. · Lord's / LORD's and Meribah-Kadesh / Meribah-kadesh are the AV's own distinctions (small capitals for the divine name; text against margin).

**Links.** The pattern is biblical personal names in genealogies and lists that coincide with entries from Egypt, Greece, Korea, Japan and Russia (Nun, Seth, Ard, Dara, Resheph, Ares, Pelias, Hermes, Gozan, Sela), plus same-named cities (Caesarea Philippi, Pisidian Antioch, Cypriot Salamis). Chapter numbers are the book's running chapters as printed in the input file.

**Links left open.** `Kingdom_of_Judah` — x230 after the existing switch-off of chapters 1–236: from 1 Samuel on 'Judah' is still often the tribe or its territory before the division (men of Judah under Saul and David) and later the patriarch

## `quran` — The Quran

Applied: **4** · held: 5 · links off: 3 + 0 per chapter

**How it reads.** Three samples (6:104–128, 23:25–71, 57:11–29) read as clean Pickthall; verse numbers run unbroken in all 114 surahs. The only faults found beyond the scanner's doublings are two unbalanced quotation marks (every verse was checked for an odd count).

**Looks wrong and is right.** Pickthall's archaic and compound forms: therefor, trafficketh, traffick, jacynth, forthbringing, lightfooted, waterdrawer, fairseeming, watersprings, obeyedst, madest, evil-livers · truthteller / truthtellers (27:49, 29:29) beside truth-tellers (15:64): unhyphenated in the common Pickthall text, left · 'of nought' once (52:21) beside 'naught' x130; 'ought' in 2:219 is the verb and right · 'Then We sent our messengers' (23:44) with a small 'our' — as in the transmitted text · Titles with quotation marks (76 "Time" or "Man", 79, 80, 106) and with underdotted letters (Al-Ḥijr, Ṭâ Hâ, Ṣad, Fuṣilat) are Pickthall's own headings · All-knowing x1 beside All-Knowing x7; scan.txt pairs all right

**Links.** The owner's glossOff list had already taken the sura-title common words.

## `hobbes-leviathan` — Leviathan, Thomas Hobbes

Applied: **77** · held: 8 · links off: 13 + 3 per chapter · 1 link(s) left open

**How it reads.** The eight samples read cleanly as the 1651 text in original spelling; the only faults met in them were ones already in the candidate lists ('of of', 'asto', 'callod', 'becaue') plus one lost opening bracket ('in the next degree, in most men,)'). Hobbes's marginal notes are set as short run-in headings (class bk-head) between paragraphs, which is why phrases such as 'Rage.' or 'Melancholy.' stand alone before a paragraph; there are no notes, page numbers or scan garbage.

**What repeats.**

- No class needs a rule. The edition (a modern transcription of the 1651 text) keeps the original spelling, and its own slips are one-offs: about 85 of them, listed singly — letters confused in transcription (aud x4, hecause x2, bnt, bnsinesse, nothiug), dropped or transposed letters, 11 doubled words, 7 pairs run together or split.
- Not an error but a consistent feature: the 1651 printer's u/v and i/j habits survive in places and must not be normalised — 'whatsoeuer', 'whosoeuer', 'priuate', 'iustly', 'Iust', 'Vnjust', 'Iohn', 'Iosh.', 'Common-vvealth', 'VVitnesse', 'VVater', 'Jevves', 'Povver' (a few dozen instances).

**Looks wrong and is right.** Original 1651 spelling, all correct: final -e and doubled consonants (kinde, finde, warre, summe, equall, naturall, -nesse, -full), -y- for -i- (ayr, aym, claym, chayns, joynt, voyce, avoyd), -ie for -y (necessarie, industrie, usurie), -ed forms (weakned, darkned, enlightned, hearkning, remembring, rendred, surrendred, entreth, wandreth). · Period forms that look like slips but are not: divels, sive (sieve), sixt, stolne, sence, sute/sutes, debter, robbs, fraight, pursute, resistence, retrived, controwl, secundary, stirrop, interrement, conveighed, mongrill, ordeyned, susteine, reteine, deteined, conteined, enhansed, sindged, crasie, sliely, impatible, dommage, battaile, limetwiggs, sawcie, seldomer, accidentarily, authentique, intrinsecally, prophane, imploy, forraign/foraign/forain. · Joined or contracted by the author: assoon, assoone, adayes, therby, therof, wherof, wheras, somthing, somwhat, nevertheles, allready, inequallity, tollerating, hoodwinkt, overchargd, profest, exprest. · u/v, i/j and vv as printed in 1651: whatsoeuer, whosoeuer, priuate, iustly, Iust, Vnjust, InIustice, Iosh., Iohn, Ioseph, vvealth, VVhen, VVitnesse, VVater, Jevves, Povver. · Doubtful, left alone: 'coerceive Power' (ch15; elsewhere Coercive/coërcive), 'supperstitious' (ch3; elsewhere superstitious), 'unskilfullnesse', 'nerest', 'beleife', 'amongst the Israelite' (ch37) — each may be the 1651 printer's. · Real words the second scanner flagged that are right where they stand: Wafer, corne, Coine, Ports, Bands, Farmes, Vates, Sauls, Salomon, deerly, soure labour, aimes, haled, Nunc-stans. · Grammatical doublings: 'had had' (x9), 'that that' (x4).

**Links.** Much was already switched off for this book. What remains is mostly a common or technical word capitalised in 17th-century printing (Genus, Biles, Membrane, Logicians, Gentry, Elders, Dedi) and biblical names that collide with something else (St. Paul the city, Ammonites, Nun, Ammon, Arrian for Arian).

**Links left open.** `Scribe` — the 'Scribes and Pharisees' of the Gospels are the Jewish teachers of the Law; the entry is the scribe as record-keeper of the early states (Egypt) — right only if the entry is meant to cover the New

## `rousseau-social-contract` — The Social Contract, Jean-Jacques Rousseau

Applied: **0** · held: 0 · links off: 2 + 0 per chapter · 2 link(s) left open

**How it reads.** Both samples (II.x and IV.iv) read cleanly: no scan slips, no stray apparatus, British spelling consistent. All 13 dictionary candidates and the 6 scanner candidates are correct readings.

**Looks wrong and is right.** Latin terms in Cole's translation are right: princeps senatus, plebiscita, capite censi, curiones, decuriones, compitalia, paganalia, Sacer estod, gerontes, and the Latin quotations in the notes · 'Comitia Curiata' is capitalised once among lower-case 'comitia curiata/tributa/centuriata' (ch44) - inconsistent, not an error

**Links.** A clean book: Rousseau's Rome, Sparta, lawgivers and modern states are the ones the glossary means; 'Republic' is the form of state throughout (no reference to Plato's dialogue is linked), and 'Servius' is always Servius Tullius.

**Links left open.** `Catholic_Church` — the one link is on 'the Catholic King', the title of the King of Spain — part of a title, though the title does refer to the Church · `Latin` — 'the Phoenician Baal, the Greek Zeus, and the Latin Jupiter' — Latin as 'Roman', not the language; harmless but not the entry's sense

## `kant-critique-of-pure-reason` — Critique of Pure Reason, Immanuel Kant

Applied: **84** · held: 9 · links off: 2 + 0 per chapter

**How it reads.** The three samples read as clean, careful prose (the Project Gutenberg Meiklejohn) with a slip every few thousand words of the kinds listed: a doubled 'intuition. intuition.', a misplaced 'the', 'couceptions'. Headings inside chapters (TRANSCENDENTAL DOCTRINE ..., Section Third) are in place; notes marked '—Tr.' are the translator's.

**What repeats.**

- A full stop dropped into the middle of a sentence before a lower-case word — about 25 places in chapters 2, 9, 11-18 ('every external. experience', 'to whom. the word', 'the wings. of ideas', 'certain. conditions'). They look like a paging mark of the source read as a stop. All are listed; a rule '[a-z]\. [a-z]' minus the abbreviations (Liv. iii. ch., Pers.) finds them.
- At four of those places the stop is real and it is the FIRST WORD of the next sentence that is missing: ch13 n6 'sort. am far' (I), ch14 'necessary. follows that' (It), ch15 'closely. second asserts' (The) — listed as probable — and ch14 'empirical character.[note 22] then, in so far as it is to be ascribed to an intelligible cause, does not', where the lost words are probably 'An action,' — NOT listed, because the wording cannot be proved from the text.
- Words split in two by a space or by a line break left in the html — 16 places (repre/sentations, phæ/nomenon, in/tentions, In/asmuch, for/mer, dif/ficulties, uncondi/tioned, de/termine, leav/ing, transcen/dental, exist/ence, judg/ments, ma/terials, judg/ment, guid/ance, and '(c<i>onceptus'). All listed. Four of them (ch7, ch14 x3) are split by a raw newline inside the paragraph; the 'from' strings carry that newline.
- The translator's long notes (ch5 n1, ch7 n3, ch13 n1) have lost the space after sentence stops and commas — 9 places ('applied.Now Kant', 'misprint.Other errors,occurring'). All listed.
- 'à priori' and 'a priori' (also 'à posteriori') both stand (454 and 154 times), by chapter: the accent is kept in chapters 3-15 and dropped in 1-2 and 16-19. Not an error of words; a consistency point for the Library, not listed.

**Looks wrong and is right.** Meiklejohn's own spellings and terms: phænomenon/phænomena, cogitate, shew, connexion, incontestibly, irreconcileable, propedeutic (ch18, beside 'propædeutic'), philodoxy, noogony, elanguescence, mathema, episyllogisms, antinomial, architectonical, assertorically, subdivisibility, indiscernibles, indistinguishables, preposit/preposited, abovementioned, noninfinite, physicotheology, uninterfered. · Latin and German quoted in text and notes are correct as printed: in abstracto, substantia et accidens, communio, mundus phænomenon, arbitrium sensitivum, ein seyn, quantitas/realitas phænomenon, the verse tags (Tecum habita ...; Nil actum reputans ...; Quod sapio satis est mihi ...), the German phrases of ch7 n3. · 'that that' (ch4, ch17) is grammatical in both places. · Scan-file real words right in place: mariner, night (chaos and night), nation/nations, inter (inter se), fails, mirror, tower, hears, purify, armed. · The space before a comma or stop after an italic term ('à posteriori ,', 'Analytic ,') exists only in plain text, where the italic tag ends; not a fault.

## `augustus-res-gestae` — Res Gestae Divi Augusti, Augustus

Applied: **1** · held: 0 · links off: 0 + 1 per chapter

**How it reads.** Both samples (Parts III and V) read cleanly: section numbers in place, names and figures plausible, no scan slips in the text.

**What repeats.**

- Page references in the notes follow the source site's style with no stop or space - 'p11', 'pp39‑58', 'p73', 'p113', 'pp109‑117', 'pp119‑222', 'p157' (7 found). Consistent, so left; could be normalised to 'p. 11' by rule if wanted.

**Looks wrong and is right.** Latin is right: municipia, quindecemvirs, princeps iuventutis, Ob cives servatos

**Links.** The earlier glossOff list had already caught the province names; nothing else is wrong. 'Janus Quirinus' (ch2) links Quirinus inside Janus's title, which is harmless.

## `descartes-discourse-on-method` — Discourse on the Method, René Descartes

Applied: **0** · held: 0 · links off: 0 + 0 per chapter

**How it reads.** Both samples (Parts III and VI) read cleanly; British spelling consistent; no scan slips.

**Looks wrong and is right.** Veitch's words are right: byeway, incertitude, 'betook me'

**Links.** All 16 keys read; none wrong.

## `more-utopia` — Utopia, Thomas More

Applied: **0** · held: 0 · links off: 0 + 0 per chapter

**How it reads.** Both samples read cleanly; the running opening quotation marks of Raphael's discourse are regular; no scan slips.

**Looks wrong and is right.** Burnet's words are right: seldomer, overplus, 'had like to have been', Amaurot, Utopus

**Links.** All 38 keys read; none wrong.

## `darwin-origin-of-species` — On the Origin of Species, Charles Darwin

Applied: **4** · held: 3 · links off: 0 + 1 per chapter · 1 link(s) left open

**How it reads.** Both samples (the Summary of ch. V and the opening of ch. XIII) read as clean, accurate Darwin; chapter synopses are set as bk-head paragraphs, run-in section titles in italics. A well-transcribed text with a handful of typist's slips.

**Looks wrong and is right.** Darwin's own spellings of 1859: misseltoe (ch1) and missletoe (ch5, four times), swimbladder (eight times, beside swim-bladder twice), hybernating / hybernated, armadilloes, acaceas, malconformations, ourang-outang, experimentised, probosciformed · Latin names and terms are right: Primula veris and elatior, Trifolium pratense and incarnatum, Gallus bankiva, Lobelia fulgens, Hippeastrum aulicum, Crinum capense / revolutum, Mirabilis jalappa / longiflora, Nicotiana acuminata / glutinosa, Anagallis arvensis, Calceolaria integrifolia / plantaginea, Helix pomatia, Onites apelles, Tachytes nigra, C. oenas, A. cygnoides, P. torquatus, phascolomys, grallatores, hippobosca, sphex, ductus pneumaticus, camera lucida, Ruta baga, ovaria / ovarium, orthospermous, 'balancement of growth' · 'Alph. de Candolle', 'ten per cent. is', 'the Hon. and Rev.' are abbreviations, not sentence ends; Mr. Clift, Oswald Heer, azoic rocks are right · Run-in section heads keep a space before the dash in the plain-text view only ('Summary .—'): the head is in <i> tags in the html; not a fault · Scan list (adopted, safety, month, interior, doubled, hears, gross, property, hound, painter, hocks) — all correct

**Links.** Nothing systematic: the links are countries, continents, oceans, mountain ranges and naturalists, all meant as the glossary means them. Adjectives in breed names (Italian greyhound, Turkish dog, Swedish turnip, Java fantail, German Spitz) link to the country of origin, which is what the name says.

**Links left open.** `Isla_Grande_de_Tierra_del_Fuego` — x5: Darwin's 'Tierra del Fuego' is the whole archipelago at the tip of South America (its savages, its 'quiet Sounds'); the entry is the main island only — narrower, but hardly misleading

## `jerome-letters` — The Letters of St. Jerome, Jerome

Applied: **4** · held: 3 · links off: 39 + 4 per chapter · 2 link(s) left open

**How it reads.** The twelve samples (54,000 characters over Letters XV–CXLIV) read as clean, proofread prose with section numbers in place; they yielded three real faults the dictionary could not see (dull-wilted, courser for coarser, a stray comma) and the broken Greek in Letter LVII. Typographic quotes and dashes are stored as numeric character references (&#8220; &#8217; &#8212;) throughout, so a from-string that crosses one must carry the reference.

**What repeats.**

- Broken character reference inside Greek, 2 instances, both in Letter LVII §12 (both listed): the text prints '&amp; 208' followed by a raised dot where the letter ή stood (οἰ& 208·σει). A search for '&amp;' finds exactly these two in the book.

**Looks wrong and is right.** Solid compounds are the translator's (Fremantle, 1893): almshunters, ashmongers, bridechamber, brideswomen, doorhangings, farfamed, fosterchild, luteplayers, noonland, pinetrees, servantmen, servantmaids, servingmen, skinclad, toothpowder, whitelead, waterpot, claytowners. · Biblical English quoted from the Authorized Version: an hungred, highpriest, governour, highminded, stumblingstone, waterbrooks, fishgate, shew/shewed. · Hebrew names divided by a hyphen: Beth-horon, Timnath-serah, Kirjath-sepher, Adoni-zedec, Bar-anina, Beth-lehem; 'Mahershalal-hash-baz' beside 'Maher-shalal-hash-baz' is the edition's. · Latin and transliterated Greek in the notes (summum jus, cena dubia, tunica palmata, koinos bios, anachorein …) and abbreviations (accus., prol., s. v., Cic. pro Milon.) — right; 'Amphora caepit' (ch107 note) is an old spelling of coepit. · American spelling is the edition's: neighbors, labored, favor, endeavored, license; also rarified, ringletted, octoteuch/heptateuch, clairvoyante, co-adjutor, archpresbyter. · A space before a comma after three Greek words (ch33 note, ch57, ch84 note) and the mismatched quotation marks at 'new heavens and a new earth.’' in Letter CXXIV §3 are the source's pointing; not changed.

**Links.** 253 keys read. The Christian centuries reuse classical names, and the linker takes the classical bearer: saints, bishops, apologists and letter-carriers named Antony, Hippolytus, Titus, Aristides, Miltiades, Lucian, Eusebius, Ambrose, Athanasius. A second group is biblical persons and places (Seth, Nun, Ammon, Salem, Judah). Chapter numbers are letter numbers.

**Links left open.** `Hittites` — "Ephron the Hittite" and "Uriah the Hittite" — the Hittites of the Old Testament in Canaan; the entry is the Bronze Age kingdom of Anatolia. Whether these are one people is disputed; it depends on whe · `Temple` — the links fall on the Temple of Jerusalem ("twin Samuels bred in the Temple", "one Lord and one Temple"); the entry is the general account of a temple, written from the Greek case. Not a different thi

## `euclid-elements` — The Elements, Euclid

Applied: **79** · held: 3 · links off: 1 + 0 per chapter

**How it reads.** The six samples show a text that is mathematically readable but carries the marks of an uncorrected scan throughout: 'he' for 'be' in nearly every italic enunciation, words broken by line-break hyphens, run-together words ('Takeaway', 'maybe', 'inthe'), citation digits read as letters, stray apostrophes from wiki markup, and in Book VI several margin references glued to the wrong line. Nothing is garbage on the scale of a lost passage, but this is the least clean book of my six and needs the rule-based passes above before the single fixes.

**What repeats.**

- 'he' FOR 'be', 68 TIMES — every single 'he' in the book. The enunciations are set in italics and the scan read italic 'b' as 'h': 'If a straight line he bisected', 'there can he drawn', 'the first shall he to the second', 'If four straight lines he proportionals'. Euclid has no pronoun 'he' (I read all 68: each is the verb), so the rule \bhe\b -> be is safe for this book. The same misreading gives 'hy' for 'by' twice and 'hut' for 'but' once (listed).
- LINE-BREAK HYPHENS, 52: 46 where the html still has the source line break after the hyphen ('paral-<newline>lelogram', 'tri-<newline>angle', 'pro-<newline>duced', 'perpen-<newline>diculars', shown as 'paral- lelogram') and 6 with a plain space ('par- allelogram', 'dia- meter', 'ex- actly', 'four- sided', 'pro- portional', 'perpen- dicular'). All are true line-break hyphens to close up, except 'four- sided', which keeps its hyphen ('four-sided'). Five listed.
- MARGIN CITATIONS FUSED WITH THE NEXT LINE, 7 in Book VI Props 16-17: '[V. 7.therefore AB is to CD', '[Constr.But CH is equal', '[VI. 14.And these parallelograms' — the reference that belongs at the END of the previous line has been put at the start of the next with no space or break. Elsewhere the references sit at line ends as '[I. 47.' followed by a break.
- DIGITS READ AS LETTERS IN CITATIONS, 11 (all listed): 'Ax.l.' for Ax. 1, '[V.l.' for V. 1, 'Ax.ll', '[I.ll.', '[V.ll.', 'Def. ll.' for 11. One more, '[l.11.' in Book III, I could not resolve (probably '[I. 47.') and left.
- WIKI ITALIC MARKUP LEAKED AS APOSTROPHES, 16 places (all listed): 'FE', 'AB', G', GB', AG', EFGH', '['Hypothesis' — the source's '' '' markers survived as characters, sometimes leaving the label un-italicised.
- LABELS THAT LOST THEIR ITALICS, a handful: 'join EB,EC,ED', 'the diameter AGD', 'the triangle EAB', 'the angle CAD', 'AB is to AC as AC is to CB', 'the straight lines AB, CD' — cosmetic only.
- SPACE BEFORE ';' AND ':' about 90 times ('alternate angles ;', 'right angles :'): this is the 1860s print's own spacing, unevenly kept. Not a fault to fix one by one; a rule could normalise it.

**Looks wrong and is right.** 'shew', 'shewn', 'rectilineal', 'equimultiples', 'ex aequali', 'ex aequo', 'perturbate', 'q.e.d.', 'q.e.f.' are Todhunter's own · 'wards' in the .scan list is the tail of the line-break hyphen 'to- wards' · the fragments lel, paral, lelogram, verti, cally, trian, gle, mul, tiple, propor, tionals, portionals, dicular, diculars, ver, dia are all halves of line-break hyphens (the systematic class), not separate faults

## `voltaire-candide` — Candide, Voltaire

Applied: **2** · held: 1 · links off: 1 + 0 per chapter · 2 link(s) left open

**How it reads.** Both samples (ch14 and ch26) read cleanly apart from the missing quotation mark; dialogue paragraphs and curly quotes are regular.

**Looks wrong and is right.** Old translation's forms are right: Miss Cunegund, pattacoons, trellisses, mussulman, paroquets, Buenos Ayres, gaol, bouille · 'a tight pretty wench' (ch24) is the translator's phrase

**Links.** A clean book: the places of the travels, the peoples and the ancient names in Pococurante's library and the final list of fallen kings are all the ones the glossary means.

**Links left open.** `Israelites` — x2: 'an Israelite' is Voltaire's synonym for the Jew Don Issachar in 18th-century Lisbon; the entry is the ancient people of the southern Levant — not a namesake, but the ancient-history entry is not · `House_of_Medici` — the one link is on 'Venus of Medici', the antique statue named after the family's collection — part of a work's name

## `book-of-the-dead` — The Book of the Dead

Applied: **12** · held: 4 · links off: 2 + 1 per chapter · 3 link(s) left open

**How it reads.** Six samples read cleanly: Budge's archaic English, brackets, (?) queries and small-capital rubrics all intact, no garbage and no stray apparatus. The only faults seen were quotation-mark glyphs (ch37's four closing marks set as opening ones; two of the forty-two Negative Confession addresses lacking their opening mark).

**What repeats.**

- None that repeats beyond the rows listed. Four line-break hyphens in all (tri- umph, there- in, Gov- ernor, victo- rious).

**Looks wrong and is right.** All transliterated Egyptian names and their hyphenated parts (Ur-arit-s, An-arut-f, Neha-hau, Neheb-kau, Neheb-nefert, Khenti-khas, Ap-uat, Her-uatch-f, Setem-ansi-f, An-heri-ertaitsa, Kesemu-enenet / Kesemiu-enenet, Ta-tchesertet, Neter-khertet, Sekhet-neheh, Ari-nef-tchesef, Mut-restha, Rekhti-merti-neb-Maāti, Aba-āāiu) — Budge's forms · Editorial brackets and query marks: [A]ker, [Ta-]tunen, [Sau(?)], Ha-khebti(?), 'fouled (?) water' — the editor's · 'stablisher', 'stablished', 'stablishing', 'libationer', 'persea tree', 'uræi' — correct · 'He that goeth in in his own name' (ch44) and 'journeyed on on my legs' (ch68) — both parse (goeth in / in his own name; journeyed on / on my legs); left · 'I drink drink-offerings' (ch60) — correct · Names written two ways (Re-stau / Re-Stau, Sekhet-Hetepet / Sekhet-hetepet, Tem-Herukhuti / Tem-Heru-khuti; the capitals are rubrics) — Budge's own inconsistency, no slip · American spellings (labor, color, toward) — this edition's

**Links.** Budge's translation glosses its own Egyptian names (Abtu (Abydos), Annu (Heliopolis), Anpu (Anubis)), so the Egyptian gods and cities link correctly, and here Shu, Nut and Set-type names are the Egyptian ones meant. The capitalised materials of the rubrics (GOLD, IRON, COPPER, SILVER, WATER, NATRON, CEDAR) are meant literally. Only syllables inside other divine names go wrong.

**Links left open.** `Temple` — x15: Egyptian temples in rubrics and titles ('an inspection of the TEMPLES', 'designer in the Temples of Upper and Lower Egypt'); the entry opens generically but is about the Greek temple — the right · `Seshat` — ch36 'the goddess Sesheta' who builds the house is right; in ch44 the link is on 'child of the Seshet chamber', a title of the scribe Nebseni — a chamber's name, which may or may not be the goddess's · `Cat` — 'the Cat in the House of Hapt-re' (ch100) is the divine Cat of the sun-god myth — a cat, but a mythological one; the entry is the domestic animal

## `erman-egyptian-literature` — The Literature of the Ancient Egyptians, Adolf Erman

Applied: **266** · held: 69 · links off: 17 + 1 per chapter · 5 link(s) left open

**How it reads.** All six samples read as continuous, intelligible translation with the page numbers properly marked up, but not one was free of scan damage: '0 Net-crown', '(king X.)', '“Mistress of Alight/'', 'Kharmvese', 'I Las it paid for?', 'Unamiin', 'board (P)', 'The dog. he hearkeneth', 'awakened;;'. The verse is set one line per paragraph, with some lines broken mid-sentence at the scan's line ends ('O Sorceress, O' / 'Serpent!'); the notes are in far worse state than the text, the bibliographic ones especially.

**What repeats.**

- THE WHOLE FILE IS UNCORRECTED OCR — text, headings and the 1,769 notes alike. The 335 rows in `fixes` are what a dictionary pass over every token (any frequency, capitalised or not), a symbol/digit pass and six samples could establish with the book as its own witness; they are individual misreadings and cannot be made by rule. They are certainly not all: a real word in the wrong place ('line leeks' for fine, 'They belongeth'), a wrong tense ending ('nothing surpassed books', 'he burned a light' where the translation's -eth is expected) and any Egyptian name seen only once cannot be settled without the printed page. The honest remedy is a re-fetch from a cleaner source or a proof-reading against the page images; the rows here make the book readable, not clean.
- ZERO FOR THE VOCATIVE 'O' — 36 instances ('0 Rē', '0 king', '0 Thōth', '“0 high steward, my lord', '0 ye gods', '0 Amūn'), in ch10, 11, 13, 29, 30, 35, 36, 48, 50, 52, 64, 65, 67, 68, 73. Rule: /(^/[\s“(>])0 (?=[A-Za-z(])/ → 'O '. Four are among the fixes because the same phrase has another error (ch11 x2, ch50, ch52).
- 'ff.' MISREAD IN REFERENCES — 49 of the 122 page/line references end in 'fi.', 'ft.', 'If.', 'if.', 'tf.', 'rf.', 'fl.' or 'S.' instead of 'ff.' ('pp. 31 fi.', 'pp. 95 ft.', 'pp. 35 If.', 'pp. 29 tf.', 'pp. 177 rf.', 'Pap. Bologna, 1094, 5. 8 S.'), nearly all in notes. Rule: /(\d\.?) (fi/ft/If/if/tf/rf/fl/S)(?=[.,;:) ]/$)/ → '$1 ff'. With it: 'PI.' and 'Pis.' for 'Pl.' and 'Pls.' (plates), and years with S or & for 8 ('1S63', '1S74', '1S85', '1S90', '1S9S', '1&74' — the six found are listed as fixes).
- GERMAN AND FRENCH TITLES IN THE NOTES — several dozen bibliographic notes are garbled and every umlaut is lost. 'Zeitschr. für ägypt. Sprache' is cited 17 times and never once right ('Zeitschr. fiir dgypt. Sprache', 'fur agypt.', 'lur dgypt.', 'Zeitsckr. fur dgypt. Sptache', 'Zeitichr.', 'Zeitschv.', 'Zeihchi fin agypt.', 'Ztitsih. Jar ugypt. Spracltr'); likewise 'Urkunden zur Religion des alten Ägyptens' ('XJrkunden zur Religion des alien Agyptens'), 'Liebespoesie der alten Ägypter' ('der alien Agypier'), 'Ägyptische Sonnenlieder' ('Agyf'ti ~.ene Sonne nlteder', 'Ag. Sonnenheder'), 'Schülerhandschriften' ('Schiilerhandsschnften'), 'Abh. Berl. Akad.' ('Ahad.', 'Bert. Akad.', 'Bert. Ak.'), 'Recueil de travaux' ('Receuil'), 'Le conte du naufragé' ('naitfiage', 'naufragf'), 'Études égyptiennes' ('6tud.es égyptiennes'), 'Du genre épistolaire' ('eptstolatre', 'epzstolaire'), 'Pap. Anastasi' ('A nastasi', 'A r.astasi'), and the names Golénischeff ('Gol£xischeff', 'Golenischefi'), Dévaud ('DhvAUD'), Müller ('Muller'), Bergmann ('Bergmavn'), Erman ('Ermas'). A table of these dozen recurring titles and names would repair most of the class; only the handful that sit in otherwise English notes are listed as fixes.
- ASTERISK AND SUPERSCRIPT FOOTNOTE MARKS NOT LINKED — the edition used '*' beside the numbered notes. 9 asterisks stand in the text as characters (ch10 'they of the earth * their red blood', ch17 'preserved for us.*', ch32 'for us,*', ch39 'Nine Gods! * Art thou', ch43, ch57, ch60, ch64 'very* many'), and 31 notes carry a second note after ' * ' (ch39 note 34 'The king. * The bull.', ch62 note 9 'See p. 137, note 1. * The Euphrates.'). Three superscript numbers were read as '®' (ch39 'desired.®', ch62 'malignant ones.®', ch65 'The Shardana,®'). The book has 1,783 note markers and 1,769 notes, so 14 markers point at nothing. This needs the extractor, not a text fix.
- QUERY MARKS, BRACKETS AND SUB-HEADINGS — the translator's '(?)' is read '{?)' 6 times, '(:)', '{:)', '(P)' and '(>)' once each, and '(' as '{' or ')' as '}' in editorial brackets ('{A mutilated verse.)', '(of thy temple}'): all listed. The bracketed sub-headings ('[4. How he received the letter.]') have lost or changed a bracket in about a dozen places (listed), run over two paragraphs in ch52, ch64 and ch73 ('[9. It is not true, if thou art casting doubts on my' / 'Attainments.]' — the second line capitalised as if a new heading), and in ch20/21 carry the page number fused to the item number ('575.' is page 57 + item 5, '675.' page 66 + item 5: the page span is there, but with no space after it).
- PROPER NAMES: MACRON VOWELS AND N — the edition's ō, ē, ū were read as S, d, 5 or ii ('AmenemSpe', 'ApSphis', 'ThutmSsis', 'HyksSs', 'Sesdstris', 'S5th', 'Amiin', 'Unamiin') and capital N as X ('Xay, but', 'Xubia', 'Xun', 'Xenshi', '(king X.)'), rn as m ('Memeptah', 'El-Amamah', 'Homs'/'Horns' for Horus). All are listed where the book itself has the right form elsewhere. Names seen once could not be checked and are left: Iverke, Per-fioti, Nefemefrure, Earit, Ainen, Igedii, ryena, hetetapes, Segbain, Lake Neher, Kankeme, 'BibAn el-Muluk' and 'SakkArah' (â read as A).
- UNREADABLE WITHOUT THE PRINT — ch4 opening sentence ('THE Egyptian tvopl..- tx-c.-v.* known to our European world only in their dot use when tli.-y hud expended': a restoration is offered as two probable fixes); ch2 the date of the author's preface ('Pforta, January t, 1923'); ch7 the Coptic verse of Archellites; ch22 note 'As indefatigable as it collects honey. -1 iius d trailer?'; ch25 note 'Cairo 2053s i he ijuite obvious stanzas'; ch50 'First 2g,ooo loaves of bread' and '[pp. 2jo ff)'; ch62 note 'See above, p, xjcxiv.'; ch68 note 'See above, pp. 138, note 3. 5 yhe gast'; ch74 'Hieratic: see p. xxxivii.'; ch10 note 'Utterance 50s'; ch23 note 'Syntax, p. 12H'; ch27 note 'soils file meaning is'.

**Looks wrong and is right.** Egyptian and Semitic words the translator leaves untranslated: kau-fruit, nekut-fruit, iaa-plants, redemet-plants, teftef-flowers, sekeb-wood, sesenem-wood, berri-wood, kinnor, nezekh, anen, telek, kheber, khered, kakment-vessel, kyllestis, shedeh, pewer, deben, kherheb, tishepes, hekenu, iudeneb, khesait, akhy-bird, abu-bird, zewet-gnat, 'Abata kemo ari, mahir naem', 'Sopher yode'. · Transliterations in the chapter on writing (byn, nht, khpr, wr, mn, mr, iw, ro, zt, ḥwr, swr, wrś, wrryt, Szm) and the Coptic lines in ch7. · Editorial restorations and lacunae: 'Har[dedef … Har]dedef', 'Nefer(ke)re-teri', '(king N.)', '(?)', '...', '.. .', 'Mer ... re' — the editor's, not damage. · The translator's archaic English: -eth / -est verbs, drave, brake, spake, o’ertook, o’erspread, wheresoe’er, eventime, afluttering, chariotry, 'thou willst', 'an husbandman'. · Page numbers in the prose ('contained 68 in this Instruction', '183 they were') are marked-up <span class="bk-n"> page markers, not stray numbers. · 'millenium' (ch24) and 'tattoed' (ch22 note) — single-letter spellings that may be the printer's; left. · Scan-list candidates that are right as they stand: awoke, spoke, token (of grief), locked-up, spinal marrow, tight, adapted, stale, mirror, fable, giant, fails, fears, imparted, overcame, tilled, soils, steepest (ch52, probably 'sleepest' but not provable), stayeth. · 'Grasper-of-Horns' (ch10) and lower-case 'horns' are real horns; only the capitalised god-name 'Horns'/'Homs' is Horus. · Merneptah / Merenptah (ch66) and Nekhtamūn / Nekhtamun (ch73): the book itself varies; only the misread forms are corrected. · Food-Offerings / Food-offerings, God’s-land / God’s-Land: capitalisation varies in the print. · 'naïve', 'rôle', 'régime', 'formulæ', 'primæval', 'Archæology' — the edition's own accents and ligatures, correctly kept (and the model for restoring 'lacunæ', 'Uræus', 'Græcized').

**Links.** The texts are ancient but the book is dated 1923, so modern nation-state entries are linked throughout (Egypt alone 36 times); three of them are plainly a different referent and are in off (Ethiopia = Kush, Israel the tribe, Jordan the river). 'Month' is this translation's spelling of the god Montu, so that key is right here, unlike in other books. Personified abstractions (Truth = Maat, Perception = Sia) go to the modern concept.

**Links left open.** `Egypt` — 36 links to the modern-country entry ('Egypt is a country of 1,001,450 km² …') in a book that is wholly about pharaonic Egypt and mostly translated ancient texts; the reader's pre-1500 rule would have · `Syria` — same question: the modern-country entry linked from the Bronze Age region and its people ('the great Syrian sea', an Egyptian singer in Syria) · `Libya` — same question: 'the Libyans' who harass the Delta, linked to the modern country · `Greece` — same question: 'Greek forms', 'the Greeks', 'the Greek period' linked to the modern country · `Lebanon` — same question: cedar 'from Lebanon' (the mountain range) linked to the modern republic

## `james-principles-of-psychology` — The Principles of Psychology, William James

Applied: **9** · held: 6 · links off: 1 + 1 per chapter

**How it reads.** All sixteen samples read as clean, carefully transcribed text (the Project Gutenberg kind, not raw OCR): no garbage, no page numbers or running heads, italics, footnote markers and block quotations in place, figure references intact. The faults are isolated single-character slips, about one per two chapters; the samples yielded three the scanners could not see (a capital 'Of' mid-sentence, a comma for a full stop, 'Fig 61').

**Looks wrong and is right.** split-italic words are whole in the html and only look broken in the candidate list: in<i>clude</i> ('clude'), self-abneg<i>ation!</i> ('abneg'), in<i>con</i>ceivable ('ceivable'), <i>directly</i> co-ordinative · grammatical doublings: 'whatever integration there was was that', 'must again be appealed to to corroborate', 'cared for for their own sakes', 'where I was was very funny', 'And there there were in fact', 'what properties there were were ultimate'; and 'by an anæsthesia' is not a doubling · James's coinages and period forms: concreter, immaterials, pleasants, enjoyables, thinkables, feelable, reductives, darwinizing, decarnated, stuffists (mind-stuffists), platonizers, percented, quartpotsful, all-overishness, onesidedness, unindentable, introvision, solicitancy, transempiric, psychostatical, monoideism / mono-ideism, hypotaxy, planomania, lycanthropia, oviparation · period spellings: haschish, haschisch and hasheesh (three spellings, all period), strychnin, santonine, sirene, sylvian, scalenon and equicrural (Locke), noetical (Cudworth), h'd'k'f (the patient's own abbreviation of handkerchief) · anatomy and hyphenated compounds: fronto-temporal, calloso-marginal, cortico-petal / cortico-fugal, cutaneo-muscular, musculo-cutaneous, neuro-muscular, cerebro-mental, thermo-electric, hemi-blindness, hemilethargic, hemisomnambulic, corpora quadrigemina / geniculata, corpus callosum, bipenniform, haploscopic, pseudoscopic, atropinized, aphemia; 'gyri fornicatus and hippocampi' is James's own Latin · French, German and Latin in notes and quotations are clean apart from the two German words listed: tout-à-fait, dira-t-on, figurez-vous, idée fixe, votre sinapisme, Leur pas est si correct…, Obstupui steteruntque comæ…, the Latin scholastic note of ch. XXVIII · every word of the scan list except 'trams' and 'inpulsive' is the right word (abject superstition, tittle, terns and gannets, haying, wonted, apposite, apposition, goads, banged and pounded, new-comer, sealed chapter, …) · the 'names written two ways' are only section headings in capitals against the same term in running text

**Links.** Nothing systematic remains after the keys already switched off; the links are to the psychologists, places and sciences James names.

## `pavlov-conditioned-reflexes` — Conditioned Reflexes, Ivan Pavlov

Applied: **64** · held: 9 · links off: 0 + 0 per chapter

**How it reads.** Eight samples read as clean, well-formed prose and tables (tables flatten correctly); the only faults were the scan-speckle punctuation described above, which turned up in four of the eight samples ('in the: course', 'during- 30', 'at; the same time', 'varied. In magnitude', 'a, few', 'held of consciousness'), so a full sweep was made by pattern and everything found is listed.

**What repeats.**

- Scan speckle read as punctuation, about 45 in the book, concentrated after short words: a stray comma after the article 'a' (17: 'shows a, tendency', 'at a, loss', 'even now a, few'), a stray ; : . or - after 'the' and others ('of the; quinine', 'in the: course', 'contradict the. more', 'the- analyser', 'during- 30 seconds', 'at; the same time', 'becomes .involved'). All found are listed as fixes; a rule would be: delete [,;:.-] between a/the and a following lower-case word.
- Bibliography (ch24): 'vol,' for 'vol.' six times ('vol, iv. 1922', 'vol, iii. 1923', 'vol, i. Nos. 1-2') and 'Russian.'/'Russian,' before 'Jour.' three times; listed.
- Line-break hyphens left in a word, 15: 9 that close up ('ex- periment', 'pro- duced', 'reinforce- ment') and 6 real compounds that keep their hyphen but lose the space ('long- delayed', 'non- reinforcement', 'present- day'). All listed.
- A space before ; and : (' ;' about 20 times, e.g. 'the site chosen ; there', 'cross-shaped corridor ; the top') is the 1927 printer's spacing carried through unevenly; harmless, not listed. A rule could close it up.

**Looks wrong and is right.** Latin anatomy: bulbus olfactorius, gyrus pyriformis, sigmoideus, coronarius, ectosylvius, sylviaticus — correct · 'inhibitability', 'heterolateral', 'homolateral', 'skeleto-motor', 'neurotherapy', 'faiblesse irritable', 'point d'appui' — correct · 'intensifies a succeeding inhibition' (ch11) is the verb, not 'intensities' · 'had had', 'that that' — grammatical · French and German titles in the bibliography ('Matériaux pour a servir', 'conditionées', 'Über der Reaktion') are as the 1927 list prints them or a transcriber's slip in a foreign title — left · '28th December,* 1917' and '3,*' in tables are footnote asterisks, not garbage · c' c'' c''' F f" in ch13 tables are musical pitch notation

**Links.** All 15 keys read; none wrong.

## `darwin-expression-of-emotions` — The Expression of the Emotions in Man and Animals, Charles Darwin

Applied: **7** · held: 1 · links off: 0 + 0 per chapter · 1 link(s) left open

**How it reads.** Both samples (ch. V on monkeys, ch. XIII on blushing) read cleanly as Darwin's prose, one slip found by reading ('face of main'). Italic species names render with a space before the following punctuation in the plain-text view only (an artefact of the sampler, the html has <i> tags); nothing else of note.

**Looks wrong and is right.** All the French quoted from Duchenne, Gratiolet, Le Brun, Lemoine (c'est, dont, veines, voix, ploie, fussent …) is correct French apart from the three slips listed · ch10 note 6 Gratiolet quotation is printed without accents (fixee, interieure, a la) — the transcription's own state, not a scan error; left · Anatomical Latin and compounds are right: sterno-cleido-mastoid, occipito-frontalis, pneumo-gastric, pyramidalis nasi, arrectores, parotidean, pathognomic, adpression · Virgil line 'Obstupui, steteruntque comae, et vox faucibus haesit' is correct; cow'ring / op'ning are the poet's elisions; Cobras-de-capello, coalheaver, 'Sammlung wissenschaft. Vorträge' are right · Scan list (fears, tight, beard, Torres, stock, contusion, ticking, pointer, hound, concert …) — every one is the right word in its sentence

**Links.** Nothing wrong found beyond what is already switched off: the links are the countries and peoples of Darwin's correspondents, a handful of authors (Homer, Shakespeare, Plautus, Strabo, Hippocrates, Aesop) and animals named in chapter headings, all in the glossary's sense.

**Links left open.** `Isla_Grande_de_Tierra_del_Fuego` — x4: Darwin's 'Tierra del Fuego' is the archipelago and its natives as a whole; the entry is the main island only — narrower, but hardly misleading (the same note as for the Origin of Species)

## `freud-interpretation-of-dreams` — The Interpretation of Dreams, Sigmund Freud

Applied: **7** · held: 15 · links off: 3 + 1 per chapter · 2 link(s) left open

**How it reads.** The eight samples read cleanly: no scan garbage, no stray numbers, no impossible sentences beyond the one wrong word listed ('described to inattention'); italics, blockquotes and the bibliography numbers are intact in the text. The faults are confined to a handful of slips, a few lost hyphens, three scan misreadings in the French of chapter 1, and the notes' formatting (glued reference numbers, one [[1]] placeholder, one verse without line breaks). Page references such as 'p. 87' or 'cf. p. 12' point to the print edition's pages and belong to the book.

**What repeats.**

- Bibliography reference numbers in the NOTES are printed as plain digits glued to the name, where the chapter text sets the same numbers as <sup>NN</sup> (198 times): 16 instances in notes — e.g. ch1 n9 "Haffner32 made", ch1 n10 "Haffner32 and Spitta64.", ch2 n3 "Artemidoros2" and "Ferenczi87", ch5 n27 "Griesinger31", ch5 n46 "Otto Rank109.", ch6 n31 "Rank106" and "Stekel114"; also after punctuation: ch1 n7 "Chabaneix.11", ch3 n1 "Weygandt,75", ch5 n5 "Delage,16" and "Delbœuf,10", ch5 n53 "Rank,106". Rule: in notes, wrap a 1–3 digit number that follows a letter (or letter + comma/full stop) in <sup>.
- Unresolved cross-reference placeholder printed as text: 1 instance, ch5 note 45 "Cf. the "biographic" dream on p. [[1]]." — the page number was never filled in; it cannot be restored from the text (best dropped to "Cf. the "biographic" dream." or resolved against the source).
- Hyphen lost inside a compound (5 listed as fixes: wishfulfilment, wishfulfilling, dreamwork x2, muchtravelled) and a stray space after a hyphen (2 listed: "seventeen- year-old", "long- winded") — line-break residue of the source; not a large class, all instances listed.
- Verse quoted in notes has lost its line breaks (ch6 note 38, Heine: "PoetUnd", "ApolloVor", "fleht,'Halt"); no note in this book carries a <br>, so the three fixes that insert one need the note renderer to accept it — otherwise put a space (or " / ") there.

**Looks wrong and is right.** French quotations in ch1 (Maury, Delbœuf, Delage, Dugas, Tissié) and ch7 are printed with the edition's own careless accents and spellings — réve, etre, a l'état, á l'état, Evidement, meprendre, choreé, séparé, distingué, pénétre, ellesmêmes, bourreaus, du celle, periodiquement, memoire: left alone as the edition's own French; only three plain scan misreadings (II n'y, cont, parfoit eile) are listed. · Brill's own coinages and Germanisms are right: stairhouse, hypnogogic/hypnogogically (9 times, never hypnagogic), hypermnestic, phantastic/phantastical, regredient, endopsychic, endoptic, superconscious, masturbatic, exhibitional, demonomaniacal, Forec., Unc., niveau, stanniol, azetyl, sulfonal, capucines, extraord. · Dream words and word-play are deliberate: uclamparia, Too (l)ittle, Gir-affe, non-sensical, super-fluid (-fluous), Hollthurn, Hearsing, Autor, drei, schiff/Schiffbruch, vorfahren, Nachkommen, pisse-en-lit, coire, Non vixit / Non vivit, Kot. (Itlay is not one of these: it glosses Italy and is a slip.) · Latin and Italian quotations (Lucretius, Cicero, 'Moriamur pro rege nostro', 'Afflavit et dissipati sunt', Sante de Sanctis's title, Volkelt's Italian quotation) and the German titles of the bibliography (ch8) are correct. · 'One tread moves thousands of threads' (Faust) — tread is right; 'had had' x10 and 'that that' x1 are grammatical; mouths, wonted, apposition, atone, wailing, fired, new-comer from the scan list are all right. · 'salzstangeln (elongated rolls)' in ch5 note 26 opens a quotation mark that is never closed — the edition's punctuation, left.

**Links.** A clean book: the links are overwhelmingly modern places, authors and the classical figures Freud really means. The only errors are first names, a book title and compound names (Florence Hallam, Daudet's Sapho, Cologne water, Spanish flies).

**Links left open.** `Apollo` — "the candles of Apollo" in a students' song (ch5) is the Viennese candle brand (Apollokerzen), but Freud's own analysis then treats "Apollo" as the god's name beside Pallas — the link to the god is de · `Helen_of_Troy` — "the beautiful Helen von Offenbach" (ch6) is the heroine of Offenbach's operetta La belle Hélène — she is Helen of Troy as a stage character; right unless a stage character is to be kept apart

## `thorndike-animal-intelligence` — Animal Intelligence, Edward L. Thorndike

Applied: **0** · held: 0 · links off: 0 + 0 per chapter

**How it reads.** Both samples (monograph II and ch. VI) read cleanly: American spelling consistent, quotation marks regular, no scan slips or stray table matter in the prose sampled.

**Looks wrong and is right.** 'the thumb piece was was the door' and 'He got in in 36.00 minutes' are grammatical doublings · Thorndike's coinages and abbreviations are right: imitatee, subcurrent, infrascientific, unforetellable, hrs., 'jot or tittle' · children's mispronunciations quoted in ch7 (kissus, krismus, kimus...) are data

**Links.** All 16 keys read; none wrong.

## `petrie-egyptian-tales` — Egyptian Tales

Applied: **11** · held: 6 · links off: 0 + 0 per chapter

**How it reads.** Six samples, over a quarter of this short book, read cleanly: the tales in Petrie's plain biblical English, each followed by his Remarks under a heading. Apart from the slips listed the text is sound; there are no notes.

**What repeats.**

- Nothing repeats often enough to fix by rule. Three line-break hyphens are left inside names (Sene-feru, Heli-opolis, Sehetep-abra) and one inside a word (intimi-' dation); three sentence stops are missing before a capital (ch3 x1, ch6 x2). All are listed.

**Looks wrong and is right.** Hyphenated name forms in Petrie's Remarks are his own analysis of the names and stay: Hor-dedef, Bau-f-ra, Ded-sneferu, Sa-nehat, Aa-tenen, User-kaf, Sahu-ra, Nub-khesdeb, Kher-ahau, Amu-an-shi, Kenti-au-ush, Khenti-keshu, Nemau-sha/Nemau-shau. · Petrie's spellings: Lybia, guardrobe, councilled, poignard, overlayed, Tahuti, Usertesen, Sekhti/Hemti, ushabtis, menat, azrak. · Archaic second-person forms (knowest, sayedst, rowest, reviledst, embarkest) are the translation's style. · The nested closing marks in ch2 ('in its setting."'') and the opening '"'As for thee' in ch5 are correct nesting of a speech within a speech. · Scan-file words right in place: spoke (beside 'spake'), beard, horns (he breaks the horns).

**Links.** All 45 keys read; every one is the king, god, place or thing Petrie means (text and his remarks).

## `douglass-narrative` — Narrative of the Life of Frederick Douglass, Frederick Douglass

Applied: **1** · held: 0 · links off: 0 + 0 per chapter

**How it reads.** Both samples (chapters VI and XI) read cleanly; American spelling of 1845 kept; no scan slips.

**Looks wrong and is right.** prisonhouse, dearborns, calking, cowskin, 'pecked', 'saving-fodder time', staid are Douglass's · the parody hymn in the Appendix uses straight apostrophes like the rest of the book

**Links.** All 35 keys are right for this book: the American and Irish places, the documents and The Liberator are the ones Douglass, Garrison and Phillips mean. The namesakes were already switched off.

## `paine-common-sense` — Common Sense, Thomas Paine

Applied: **1** · held: 0 · links off: 0 + 0 per chapter

**How it reads.** Both samples (Thoughts on the present State; Appendix) read cleanly in the original spelling and capitalisation; one typist's slip found.

**Looks wrong and is right.** Paine's 1776 spellings are right: extention, threatned, administred, falshoods, farewel, indispensible, irresistably, medlers, negociate, pedling, encreases, descendents, shew, tye, æra, 'not yet began upon'

**Links.** All 33 keys read; none wrong.

## `us-constitution` — The Constitution of the United States, The Constitutional Convention

Applied: **0** · held: 0 · links off: 0 + 0 per chapter

**How it reads.** Both samples (Article I §8-10 and Article IV) read cleanly in the engrossed capitalisation.

**Looks wrong and is right.** engrossed spellings and forms are right: 'it's inspection Laws', Controul, Labour, 'Section. 9.', dock-Yards, chuse

**Links.** All 19 keys read; none wrong.

## `us-bill-of-rights` — The Bill of Rights, The First Congress of the United States

Applied: **0** · held: 0 · links off: 0 + 0 per chapter

**How it reads.** Read almost entire: the twelve proposed articles and the attestations are clean.

**Looks wrong and is right.** 'vizt', 'Sam A. Otis', 'offence' / 'defence' follow the engrossed text · Article the first reads 'nor more than one Representative for every fifty thousand' - the engrossed text's own famous wording, not a slip

**Links.** All 5 keys read; none wrong.

## `washington-farewell-address` — Washington's Farewell Address, George Washington

Applied: **0** · held: 0 · links off: 0 + 0 per chapter

**How it reads.** Both samples read cleanly; modernised spelling ('can not', '22d of April') consistent. No candidates and nothing found.

**Links.** All 7 keys read; none wrong.

## `marx-communist-manifesto` — The Communist Manifesto, Karl Marx and Friedrich Engels

Applied: **0** · held: 1 · links off: 0 + 0 per chapter

**How it reads.** Both samples (sections I and III) read cleanly in American spelling; headings of the subsections run on correctly.

**Looks wrong and is right.** 1888 edition spellings are right: ecstacies, 'high falutin', workpeople, Trades' Unions · 'Philosophie de la Misere' is printed without the accent - left

**Links.** All 36 keys read; none wrong (the glossOff list had already caught the common words).

## `ebbinghaus-memory` — Memory, Hermann Ebbinghaus

Applied: **2** · held: 4 · links off: 0 + 0 per chapter

**How it reads.** The six samples (27,000 characters) read clean; tables and formulae survive as HTML tables and superscripts (the exponent c in b = 100k/((log t)^c + k) is present in the html). Two scan misreadings (dearness for clearness, 1earning with a digit one) and one repeated word standing for a noun (complicated the complicated of the test) were found by reading; the three table figures by arithmetic.

**What repeats.**

- Three figures in the tables fail the table's own arithmetic (all listed as probable): in each the row difference and the printed column mean agree on the corrected figure (VII: 863 for 883 and 393 for 939; IX: 129 for 29). A check of every three-column difference table in the book found only these three; they may be the 1913 printer's rather than the transcriber's.

**Looks wrong and is right.** oftimes (II), singlefold (VII), mnemotechny / mnemotechnical (III), realise beside memorize (the translators mix -ise and -ize) — the edition's. · The French quotations from Delboeuf in the note to VII, including 'empeche' without its accent — as transcribed; not touched. · '100—b' with a dash for the minus sign after the formula in VII, and 'that that which is learned' in VIII — right. · The syllable alphabet in III (ch, sch, soft s, sz) is German and right.

**Links.** All 5 keys read; none wrong.

## `breasted-ancient-records` — Ancient Records of Egypt, James Henry Breasted

Applied: **134** · held: 5 · links off: 15 + 7 per chapter · 4 link(s) left open

**How it reads.** 24 samples of 4,500 characters read, and every paragraph scored by rule. Breasted's own prose (introductions, chapters 1–2, the commentary before each document) reads almost cleanly: chapters 36, 59, 1, 15, 2, 12, 40, 39 have 0.7–3.5 stumbles per 1,000 words. The translations do not: measured over the 4,840 body paragraphs of eight words or more, 67% carry no machine-detectable stumble, 25% carry one or two and 8% three or more (Vol. I 69% clean, II 74%, III 73%, IV 56%); the measure misses repeated slips (jorever, Anion, (fern.)) and free-standing line numbers, so a careful reader gets through about 60% of the paragraphs without stumbling — about half in Vol. IV — and meets something wrong every 80–100 words in the worst chapters. Almost all of it is apparatus, not wording: half-brackets left as r…1 or '…!, raised line numbers and note letters read as letters and signs, and the note marks. Worst chapters, by stumbles per 1,000 words: 3 (Chronological Table, 100 — a table in shreds), 89 (Tanutamon, 50, a plate read as text), 76 (Osorkon I, 27), 62 (Papyrus Harris, 21, and the four garbage notes), 21 (Siut, 21), 69 (Ramses XII, 20), 90 (Psamtik I, 19), then 88, 75, 64, 60, 84, 58, 44, 68, 61 (13–16). Structure faults a reader meets at once: 19 chapters end with the next chapter's heading, 23 running heads sit in the text, about 105 junk paragraphs from plates, 146 merged notes and about 33 footnotes left in the prose. The 434 unmarked § numbers matter because the § is the citation.

**What repeats.**

- SCALE. 94 chapters, 8,806 paragraphs (5,626 body + 3,180 headings), 5,416 notes. Of the 1,376 dictionary candidates about 38% are Breasted's own transliterations (correct), 6% fragments of his editorial restorations "[dec]ree" (correct), 16–20% a raised mark glued to a word (class 1 and 6), 9% halves of words broken by a line-end hyphen (class 4), 3–4% words inside garbage runs (class 2), 2% French/German in notes, and roughly 120–150 are real single-word slips (the fixes list holds the most certain 139). The four volumes were read by two engines and fail differently: Vols. I–III (chapters 1–59) give r/f/T…1 for half-brackets, "Denkmdler", "PI.", glued bullets; Vol. IV (chapters 60–94, Tesseract) gives '…! for half-brackets, "$" for "§", "?" for raised marks, ITT for III. Every rule below should be keyed on the volume.
- CLASS 1 — HALF-BRACKETS ⌈ ⌉ LEFT AS LETTERS: about 2,100 glyphs still misread. The text now holds 775 ⌈ but only 126 ⌉; 686 of the 775 ⌈ are never closed before the next ⌈ or the paragraph's end (348 of those have a recognisable misread closer within 40 characters). Left over, by shape — OPENERS: r glued before a dictionary word 128 (rfear1, rbackward, [rsent1], rwithin, rtowers]); f 77 (fday], fwhere, fwondered1, fmade1], fsouthern); T 25–38 (Tsilver1, Tgiven1, Tsetting1, Tcopper, Tsubjects!); a bullet •/■ with or without a quote 133, Vols. I–III only (•’made1, •'besides, •"revenues, •pastures1, ■authority1); in Vol. IV a quote, "!", l, I, T, V or F before the word, 408 pairs ('carry!, ‘gave!, l'altar!, [Fwho!/, Ithere … —/). CLOSERS: "1" glued after a word 400, Vols. I–III (rfear1, made1, part1, supply1, settings11); "3" 14 (alone3, things3, heaps3); "^" 29 (offering^], assum^ed, fhold^ing, purposes^); "l" 26 (wardrobel, commanderl, brandl, 'weakl, palacel]); "!" in Vol. IV about 625 of its 721 exclamation marks (the rest: 21 "(sic!)" and about 75 real exclamations). UNCERTAIN-WORD SIGNS ⌈—⌉ read in pieces: 218 (!—!, '—!, '—1, r — 1, r — \, I— — —1) plus 36 emptied to "r 1" / "f 1". A BRACKET READ AS A LETTER INSIDE A RESTORED WORD: about 20 — "]" as j/l// and "[" as f: [beholjd = [behol]d, [captijves, [enemjies, [honorjed, [reporjted, [robbejry, [founjded, injcense, daughtejr, burlial = bur]ial, comfmission] = com[mission], buiflding], smfiting], [begg/ing. Worst chapters: 42, 47, 51, 21, 44, 43, 41, 58 (r…1 shape); 62 (140), 61 (83), 68 (61), 90 (43), 84 (39), 73 (37) ('…! shape). RULES, with V = "is a word of the book's vocabulary or of a dictionary": (a) /(^/[\s\[(“"‘—])[•■]['’"^]?(?=[A-Za-z\[—])/ → "$1⌈": 133 hits, 0 false. (b) /(^/[\s\[(“"‘'—-])[rf](?=([A-Za-z]{3,}))/ → ⌈ when V($2) and not V(letter+$2): 205 hits, about 11 false (5%: French "rois", "rassembles", "fis", "fait" in notes; "ba[rge]", "[rea]dy" inside a restoration — exclude a match that follows "[" + letters). Same for T with a tail of 4+ letters: about 20 hits, 2 false ("Tere", a name). Do NOT extend to s/t/i/g/o prefixes: those are line numbers (class 6). (c) Vols. I–III: /(?<=[A-Za-z][,.;]?)1{1,2}(?=[\s,.;:)\]—-]/$)/ → ⌉: 400 hits, 0 false found (a figure touches a letter only in ordinals and "53a", which begin with the figure). Then /(?<=[a-z])\^(?=(?:ed/ing/s)?[\s,.;:)\]"]/$)/ → ⌉ (29) and a trailing "3" or "l" only where a ⌈ stands unclosed in the same clause (14 + 26; "l" also needs word+l not in V: 3 false, "(sic!)" read "sicl" twice and "Towl"). (d) Vol. IV: "!" → ⌉ unless it follows "sic", or is followed by the paragraph's end, a closing quote, or a space and a capital with no opener in the 30 characters before: 604 hits, 0 false in a sample of 40; of the 117 it keeps, about 20 are still brackets ('toward! Amon-Re, "invade! Egypt, 'staff! Hewn). Its opener: /(^/[\s\[(])(['"‘“!]{1,2}/[lITVF](?=[a-z]))(?=[A-Za-z][^.;!?]{0,40}!)/ → ⌈ (408). (e) /(?:⌈/(?<![A-Za-z])[rfTlI]/['"‘“!]) ?(—+(?: —+)*) ?(?:1/l/!/\\/3/X/\/)(?![A-Za-z0-9])/ → "⌈$1⌉": 218 hits, none false in 16 read; /(?<![A-Za-z0-9.])[rf] 1(?![0-9A-Za-z])/ → "⌈ ⌉": 36. (f) /\[([a-z]{2,})j([a-z]+)/ → "[$1]$2" when V($1+$2): 10 hits, 0 false; the f/l// forms are too few for a rule — fix by hand. NOT DECIDABLE FROM THE TEXT: "fday]" is either ⌈day⌉ or [day] — f is read for both "⌈" and "["; where the closer is "]" the rule should write "[".
- CLASS 2 — GARBAGE (plates, maps and sideways tables read as text): about 150 body paragraphs (1.7%) and 12 notes. Three kinds. (i) Tables printed sideways, read upside-down, sitting INSIDE notes after the real note text and before further notes that were merged in: chapter 62 notes 11, 13, 14, 16 (26 runs, about 600 tokens — the Papyrus Harris statistics, Vol. IV pp. 97–100) and chapter 60 notes 1–2 (4 runs); also chapter 90 paragraph 10 (the Saite table, "‘SHLIVS ALSVNA(] HLXIS-AIN3A,,"). Examples: "im q9gt'9g ojdooq abot p9gg‘S", "9uON uoN Kro49 € 1 V", "snorreA sie( 6t yepeys", "SITOdOl'I3]H SIH4X3]X sagan]", "uly ‘yəy €". The tables themselves are lost — removing the runs is the honest repair; chapter 62's note should say a table stood here. (ii) Figure, map and part-title pages read as text, in runs of one-to-six-token paragraphs: chapter 73 end (23 paragraphs: "A 2", "LL", "- e t"), 53 (13: "o o 2 5 — CO >>", "</) 5 ^ it c E"), 82 end (16), 55 (10, the Kadesh map: "wW.^yt J Ma? S/icrmsfn"), 89 (13, around "THE TWENTY-SIXTH DYNASTY"), 85 (7), 84 (6), 69 end, 60 start ("Du i, a mit Ent ]"), 70 and 74 starts ("* A N A", "wr ^"), 68 end ("wc m"). (iii) Tables read across their columns, real words in shreds: chapter 3 (the chronological table, 18 paragraphs: "Ramses XI.. X II2I-III8"), 44 (the tax lists, about 10: "0U U IHCI 1 I ti l d i l l"), 62 (paragraphs 266–267, the 268-word "heading" at 280 "Temple Balances h ,” in hich beat brought treasury i clean…", 356, 618), 93 ("Ny bw The The The date dat date of f of the th the death dopti"), 24, 70, 9. TEST A (a whole short paragraph, text or heading): at most 12 tokens, no token that is a 3+-letter word of the dictionary or occurring 3+ times in the book, no number of 2+ digits, AND (two or more "impossible" tokens — a lone letter other than a/A/I, a token holding one of / \ < > ^ ~ ` = ■ « », or a figure between letters — or every token of 1–2 characters): 85 paragraphs, 5 false ("(ll- 3-7)", "PL 4", "PL 5", "No: t. No. 2. No. 3.", "_ l j Senezem."). TEST B (a run inside a paragraph or note of 30+ tokens, after removing parentheses of up to 45 characters and counting "L." "P." "H." as words): any window of 10 tokens with 7+ tokens that are neither dictionary words, numbers nor words the book uses 3+ times, AND 3+ impossible tokens; delete the merged windows: 45 runs in 18 units (860 tokens), 3 false (a transliteration quoted in chapter 41 note 182, the Twenty-third Dynasty genealogy in chapter 84 note 85, one line of chapter 3's table). Dictionary share ALONE is not safe: at "under 35% dictionary words" it flags 199 units of which about 150 are sound (bibliographic notes, king lists, transliterations). Kind (iii) passes both tests because its shreds are real words; those dozen paragraphs need a hand list.
- CLASS 3 — HEADINGS AND RUNNING HEADS IN THE WRONG PLACE. (a) The NEXT chapter's part-title or first heading is the last paragraph (or last words) of 19 chapters: 1 ("… in the same way. CHRONOLOGY"), 3 ("THE PALERMO STONE FIRST TO THE FIFTH DYNASTIES"), 4 ("THE THIRD DYNASTY"), 5, 8 ("THE FIFTH DYNASTY"), 14, 20, 21, 23, 30 ("FROM THE THIRTEENTH DYNASTY TO / THE HYKSOS / )"), 69, 82, 84 ("THE TWENTY-FOURTH DYNASTY"), 85, 89, and — the heading split across the cut — 7 ("REIGN OF MENKURE / DEBHEN’S INSCRIPTION, RECOUNTING KING MENKURE’S", chapter 8 opening "ERECTION OF A TOMB FOR HIM"), 10→11 ("… CHIEF JUDGE," / "AND CHIEF ARCHITECT WESHPTAH"), 57→58 ("THE INVASION OF LIBYANS AND MEDITERRANEAN" / "PEOPLES"), 76→77 ("STATUE OF THE NILE-GOD DEDICATED BY THE HIGH" / "PRIEST SHESHONK?"). Rule: at a chapter's end, move a trailing all-capitals paragraph or trailing all-capitals words (/(?: [A-Z][A-Z’'-]+){2,}\s*$/ with DYNASTY/DYNASTIES or REIGN OF, or equal to the next title) to the next chapter: 12 of the 19 match, 0 false (no chapter of this book ends in capitals of its own); the other 7 end in garbage or in a one-word title and are found by comparing the chapter's last words with the next chapter's title in the plan. The reverse fault: chapters 16, 17, 18 open with the previous document's "[Continued §§ 306 ff.]" before their title, and 45 with "Then follows a final prayer, addressed to the living.". (b) RUNNING HEADS and page numbers in the text: 23 — 12 as paragraphs of their own, classed as headings ("EIGHTEENTH DYNASTY: THUTMOSE III [§" ×6, "NINETEENTH DYNASTY: MERNEPTAH [§" ×2, IKHNATON, TUTENKHAMON, HARMHAB), 11 inside prose, some cutting a word in two: "verthrow-i 26 EIGHTEENTH DYN.: THUTMOSE III & QUEEN [§ ing", "124 TWENTIETH DYNASTY: RAMSES III [§ 222", "278 TWENTIETH DYNASTY: RAMSES XII [$ 563", "recov- E. $ 597] RECORD OF INSTALLATION 389 ery", "$ 378] THE PIANKHI STELA 439", "$553] SERAPEUM STELA OF HARPESON 399", "88 NINTH AND TENTH DYNASTIES [§ 406". Rule: /(?:\b\d{1,3} )?[A-Z]+(?:[- ][A-Z]+)* (?:DYNASTY/DYN\./DYNASTIES):? ?[A-Z][A-Z .&]*?\[[§$8S]? ?\d*/ and /[§$] ?\d+[a-z]?\] [A-Z][A-Z’' .,-]{5,}?\d{2,3}/ → delete, then rejoin "x- y": 19 of the 23, 0 false (the four it misses are garbled: "IOO TWENTIETH DYNASTY: RAMSES III", "TWENT IETH DYNASTY: RAMSES III", "88 NINTH AND TENTH DYNASTIES [§ 406", "ee ATAN WAR: / 08"). (c) Breasted's own document headings run into the paragraph before or after them (not split out): about 30 ("behold,. VI. AGAINST ROBBING THE POOR OF DUES…", "Batile on the River They sailed down-stream"); and 24 "headings" of 25+ words are prose or table shreds classed as a heading (chapter 54: one of 555 words, "GREAT ABYDOS INSCRIPTION in hast increased…"; chapter 68: 205 words; chapter 48: the Hymn to Aton, 154 words). (d) Heading numerals misread: "HI." for "III." ×11, "n." / "Il." for "II." ×9, "m." / "in." for "III." ×4, "L" for "I."; three headings "Impost of Rush" in chapter 42 for "Impost of Kush" (identical, so not listed as fixes).
- CLASS 4 — LINE-BREAK HYPHENS LEFT IN WORDS: about 85. Glued, one half not a word: 41 (cen-tralization, discon-tinue, prac-tised, unmis-takably, com-menced, proba-bilities, per-petual, commu-nicate, posthu-mous, compre-hend, sym-metrical, cir-culates, bene-ficial, adja-cent, adju-tants, momen-tarily, em-ployees, appro-priating, blas-phemed, dispos-sessed); glued with the next word run on: 8 (announc-ingthe, mor-tuaryofferings, appoint-mentby, serv-icesto, immedi-atelynarrated, cham-pionof, hereto-foreconsidered, pos-sessionof); a suffix after the hyphen: 10 (burnish-ing, expend-ing, threaten-ing, poniard-ing, entomb-ing, dethrone-ment, raccord-ing, rbuild-ing); hyphen and space: 19 (par- ticular, neces- sary, unintel- ligible, exe- cuting, maj- esty, con- ducted, suc- cessive, trium- phant) plus 6 that also lost a letter (honey- ollectors, mek- inen, army- ists, Menmare- eti); with a second fault: Phar-raoh, occas-sion, con-ironts. Spread over all volumes; most in chapters 68, 73, 48, 55, 53, 1. Rule H1: /([A-Za-z]{2,})-([a-z]{2,})/ → joined, when the joined form is a dictionary word and at least one half is not: 53 hits, 12 false (major-domo ×10, socio-political, a transliteration "pri-nt") — add an allow list of real compounds. Rule H2: /([A-Za-z]{2,})- ([a-z]{2,})/ → always drop the space; drop the hyphen too only when a half is not a word: 19 hits (12 lose the hyphen; stone- work, metal- work, well- being, folk- tale, Twenty- first keep it), 0 false. Rule H3: word-(ing/ed/ment/tion/ance/ous) → joined when the joined form is a dictionary word: 17 hits, 0 false. THE OPPOSITE FAULT, same cause: 105 real compounds lost their hyphen at a line end (audiencehall, offeringtable, foodofferings, hundredthousand, twentyfourth, thirtyone, serpentcrest, watersupply, king'swife, Twentysecond) and about 30 hyphen-chain names lost one link (Life-ofthe-Two-Lands ×4, -inthe-House-of-Amon ×6, Ptah-Southof-His-Wall, Khonsuin-Thebes-Beautiful-Rest). Rule: split a non-dictionary token into two dictionary words when the hyphenated form stands elsewhere in the book: 105 hits, about 3 false.
- CLASS 5 — LETTER CONFUSIONS IN ORDINARY WORDS (counted as tokens whose one-letter change gives a frequent word; about 1,200 such tokens in all, most of them names and citations). j for italic f: about 260 (150 English: Bejore ×20, jather, Gijts, Lejt, Lije, Wije, chiej, jorever, ajter, jrom, Tejnakhte ×6, Intej, Menet-Khuju, Enekhnesnejeribre; 110 in German titles: Zeitschrijt ×61, jiir ×24, Inschrijten ×11, Tajel ×9) — Breasted sets his sub-headings and titles in italic, so chapters 42, 43, 62, 41, 53, 84 lead; plus 58 italic "of" still read oj / o] / 0] / 0f / 0/. c for e: 41, 37 of them in the notes of Vol. II, chapters 39–47 (Thcse, Inscribcd, tcmple, Mcaning, Comparc, Lcpsius, Hatshcpsut, Maspcro, Spiegclberg). i for t: about 17 (ihe ×3, Delia ×2, descripiives ×2, Batile, Casile, healih, peasanis, thai, Reienu, Kheia). i ↔ l: 13, half of them in citations (iiving, reiation, bulis, Namiot, Geselischaft, wichtlgsten, lbid). v for y: 9 (bodv, braverv, verv, vearlings, mortuarv, hvpostyle ×2, hvmn, Papvrus). v or \v for w: 6 (vhich, \vith, \vays, \Vhen, \Vhich, shov/s). h ↔ b: about 5 (Thehes, Amenbotep, tbe, bis). n for u: 4 (Tharn, Shasn, Sharnhen, Knsh). rn / ni / nt for m and the reverse: "(fern.)" for "(fem.)" ×41 (chapters 39–41), Anion ×21 / Anton ×5 / Avnon / Atnon for Amon (chapters 55, 53, 39, 41, 42), A mama ×4 for Amarna, Senniut, ernery, Horns. "the" read tne ×6, Hhe ×5, ihe ×3, tte, Tlie, tbe. Rules: (a) j → f in a token that is not a word when the result is a dictionary or vocabulary word of 3+ letters: about 260 hits, 0 false found (the transliterations "njr", "nj" are left alone because "nfr" is not in the dictionary — add nfr, Hr-nfr by list if wanted). (b) a fixed list: (fern.)→(fem.), Anion→Amon, Anton-Re→Amon-Re, Zeitschrijt→Zeitschrift, Inschrijten→Inschriften, tne/Hhe/ihe/tlie→the: 0 false ("Anion", "fern" and "tne" are never meant in this book). (c) c→e, v→y, i→l/t, h→b: one-letter change of a non-word to a word used 5+ times in the book — the existing book-scan rule; the 128 it lists are 80% right but need reading (it also offers bottle→battle, token→taken).
- CLASS 6a — GERMAN, FRENCH AND REFERENCE FORMS IN THE NOTES (Vols. I–III; Vol. IV reads them correctly). Umlauts read as "d" and "ii": Denkmdler ×225, dgyptische ×109, Miiller ×75, fiir ×71, Diimichen ×25, jiir ×24 (530); the same words with the umlaut merely dropped: Denkmaler ×160, fur ×110, agyptische ×90, Muller ×45, Dumichen ×37. "PI." for "Pl." ×176 (against 190 right). A line reference "l." read "1." / "I." / "L." ×97 and "ll." read "11." ×51 after the importer's own pass (", 1. 7.", "(III, 29, L. 19)", "(cf. 11. 4, 5)"). In Vol. IV "$" for "§": 282 ("($ 19)", "($$ 214, 472)") against 133 right. Rules: a fixed map (Denkmdler/Denkmaler→Denkmäler, [da]gyptische→ägyptische, [fj]iir/fur→für, Mi?iller/Muller→Müller, Di?imichen/Dumichen→Dümichen): 971 hits, 0 false ("fur" stands only in German titles in this book); /\bPI\.(?= ?[0-9IVXL])/ → "Pl.": 176, 0 false; /\$(?=\$? ?\d)/ → "§": 282, 0 false; /(?<=[,;(] ?)(?:1/I/L)\.(?= ?\d{1,2}\b)/ → "l.": 97, a handful false where "I." is a volume number.
- CLASS 6b — FIGURES AND NUMERALS. Letters for digits in about 200 numbers (old-style figures): 1o ×23, roo ×7, 5o ×6, 3o ×8, 6o, 7o, io,ooo, r6,ooo, 2,ooo, soo, r2, r9, i6, i56, I5,150, i8602 — worst in chapter 62 (84), 42, 47, 61, 3, 90; also "no deben" and "it blocks" for 110 and 11. Regnal numerals in Vol. IV: Ramses IIT ×6, ITI ×2, ITT, IT ×4, Psamtik IT ×4, Sheshonk IIT ×3, TII (30); "II's" read IPs / IBs / Ps ×49 (Ramses IPs, Khnumhotep IBs, Seti Ps). Rules: /(?<![A-Za-z0-9’'-])(?=[0-9oOlIrsi,]*\d)[0-9oOrsi][0-9oOlI,]*(?![A-Za-z0-9’'-])/ → o,O→0, l,I,i,r→1, s→5 — about 130 hits; the forms with no true digit (roo, soo, io,ooo) need the list; false: "3I", "4I" (a line number before the pronoun I, 75 of them — test for a following lower-case verb). /\b((?:Ramses/Psamtik/Sheshonk/Takelot/Osorkon/Amenhotep/Thutmose/Shepnupet/Pinodjem) \(?)(I[IT]{1,2}/TII?)\b/ → I for every letter: 30, 0 false. /\b([A-Z][a-z]+) I[PB]s\b/ → "$1 II’s": 44, 0 false.
- CLASS 6c — NOTE MARKS AND NOTES. 251 of the 3,180 headings still end in the note letter or its misreading (VICTORYb, TOMB OF HUYb, VESSELS a, ASSUAN INSCRIPTION*5, BIRTH AND CORONATION*, and in Vol. IV "RECORD OF TEMPLE GIFTS?", "THE REPORT OF WENAMON?"): /(?<=[A-Z’')]{2})(?:[a-h]/ [a-h£&]/[*?»«>]\d?/\d{1,2})$/ on a heading → delete: 251 hits (49 of them a final "?" in Vol. IV), 3 false found: "Tribute of Tunip?", "Overseers of Labor?" and "Reign of Sheshonk IV?" may be Breasted's own query. In the body a note letter stays glued to about 32 words (boltsd, bargea, fameg, sidesg, everg, citiesg, exaltedb, heartf) and raised marks read as symbols trail 287 words (* ×77, > ×62, ^ ×28, \ ×25, » ×15, £ ×12). In Vol. IV "?" is the usual reading of a raised mark: 283 "?" stand after a word in mid-sentence ("the hue? of the Sun", "installed? to be", "Scene?"), against about 35 real questions there: /(?<=[A-Za-z)\]])\?(?=[,;:)\]]/ [a-z(\[—])/ → delete: 283 hits in Vol. IV, under 10 false. MERGED NOTES: 146 notes hold a second or third note after a glued letter (". bIbid., C 2. cIbid., I 2.", ". aSee Annals", ". cSee 58, 6."): split at /(?<=[.”")] )[a-z](?=(?:See/Lit/Ibid/Read/The/Cf/Or/This/It/Text/Probably/Restored)\b)/. NOTES LEFT IN THE PROSE: about 33 paragraphs or sentences (chapter 62: 11; 76: "bIbid., C 2." "cIbid., I 2."; 77: "albid., § 44."; 34: "cOf the god; or possibly…"; 62 § 215: "See Piehl, Zeitschrift für ägyptische Sprache, 1885, 60, 61. Lit., behind them." cAn intoxicating drink…" in mid-sentence). A NOTE MARK THAT ATE A LETTER: 9 (its ^idth = width, chariotr^ = chariotry, ^ajesty, ^ispatched, ^reatly, ⌈^ake = lake, "^aid low" = laid low); 59 markers stand inside a word and 76 open a paragraph.
- CLASS 6d — LINE NUMBERS OF THE ORIGINALS (Breasted's raised figures) LEFT IN THE SENTENCE. Read as a symbol and glued before a word: 543, of them 351 in Vol. IV (? ×80, $ ×65, £ ×59, ° ×33, ™ ×25, @ ×20: "?King Ramses II", "$Behold them", "°People whom he gave", "™4People"); read as a letter before a capital: 109 (sHis, sSon, SUsermare, sPeople, rThen); before a lower-case word: 75 (sbut, sheaven, swhom, gdid, ohis, twith, irewards); a figure glued before a word: 108, and before the pronoun I: 75 (3I made, 4I satisfied, 5I hewed, 4A11 = "4 All"); a figure standing free between two words of a sentence: at least 67 by a strict test in Vols. I–III ("counseling 3 with them", "When it came to pass 4 his majesty", "strong-armed 5") and probably several hundred. Rules: /(^/[\s(\[“"‘'])[?$°™€£¢®©»«@%&+#/<>=~`]+\d*(?=[A-Za-z\[])/ → "$1": 543 hits; false: "£The", "=Bissing" in notes, where the sign is a note mark or "=" — apply to the text only (220 in Vol. IV, under 10 false). /(?<![A-Za-z0-9,.:§$-])\d{1,3}(?=[A-Z]?[a-z]{2})/ minus ordinals → delete: 108, about 5 false. /(?<![A-Za-z'’-])[sS](?=[A-Z][a-z])/ → delete when the word after it is in the vocabulary: 47, 0 false; the lower-case forms only where letter+word is not a word and the word is (75; "sbut", "sheaven" right, "shear" would be wrong — needs the dictionary). The free-standing figures cannot be told from quantities by rule.
- CLASS 6e — SECTIONS, CAPITALS, SMALL THINGS. Of about 3,500 § numbers 3,065 are marked; 434 are missing from the run (Vol. I 140, II 86, III 49, IV 159) and many of those stand unmarked in the prose in a misread form ("IQI. I dragged" = 191, "IOS. Year 11" = 105, "2 1 1.", "41 1. I had goodly ships", "o88B.", "958E."); Vol. II has 64 duplicated numbers. An italic capital stands apart from its word 39 times (T otal ×6, D ynasts ×6, A ppendix, A ppointment, T itle, A bydos, T emples, Re-H arakhte, A pis): /\b([B-HJ-Z]) ([a-z]{3,})/ → joined when the joined form is a word: 39, 0 false (A and I need the test "the tail alone is not a word"). Doubled words: 6 certain (in the fixes). Doubled or orphaned punctuation where a raised mark was dropped: 122 (",,", ",.", "( )"). 68 body paragraphs of four characters or fewer.

**Looks wrong and is right.** Everything in round brackets after a name is Breasted's transliteration and is right as printed: (N-h-r-n ), (Ht-wcr' /), (Yb-s > -k > -b >), (mr‘ t), (h^ty-) — about 38% of the dictionary candidates; the stray > ^ ‘ * in them are the machine's reading of his diacritics and cannot be restored from the text. · Fragments of editorial restorations are correct: m[ajesty], [bega]n, [dec]ree, [buil]t, f[ather] A[mon], Nefer[khepru]re, [coun]- tries, Pe[leset], w[ine], [rece]ived, s[tatues]. · Archaic second- and third-person verbs are Breasted's: arrivest, beautifiest, satisfiest, rejoicest, embracest, becomest, puttest, createdst, formest, madest, bearest, slayest, fillest, knoweth, willst (probable, left). · Breasted's spellings and coinages: skilful, inclosure, Bedwin, down-stream (×30), up-river, to-wit, major-domo, coregency, chariotry, bequeathes, nomarchical, birdlet(s), censerfuls, vesselfuls, hemispeos, ushebtis, schoinoi, epagomene, insignium, kyllestis, Oxyrrhyncus. · His English forms of Egyptian words and names: heket, khar, khet, stat, deben, kidet, heknu, khesyt, sonter, mesdet, meskhen, nemset, heset, enkhi, ekhu, turpu, urdu, kedet, khenmet, inkhu, menhet, shedeh, Zahi, Retenu, Naharin, Khenthennofer, Harmhab, Ikhnaton, Hrihor, Paynozem. · (sic!), (fem.) — but "(fern.)" ×41 is the scan's reading of "(fem.)" — L. P. H., B. C., q. v., op. cit., ibid., 16-fold, x+y years, (+x) are his. · French and German quoted in notes and in chapter 58 ("Le roi a donne que mes enfants soient rassembles…", "seines Vaters setzte"): accents are lost in Vols. I–III but the words are right; causee, legende, pylone, estampage, qualite, laterale, Vaters, ohne, einen, vollig are not slips. · Latin: ipsissima verba, eo ipso, in extenso, coivit cum ea, campus hostium, pedessequii, epitheton ornans, dramatis personae, status emphaticus, videri. · Variant capitals in the vary file (Nile-god / Nile-God, Khonsu-temple / Khonsu-Temple, Twenty-second / TWENTY-SECOND) are headings against prose, not slips; "Ptah-Southof-His-Wall", "Life-ofthe-Two-Lands", "inthe-House" are the lost-hyphen class. · From the scan file, real words that are right where they stand: bottle (a leathern bottle), token, farce, grave charges, volleys, capitol, vogue, shares, hails, locked, kills, begot, dwelt, staying, ought, scaling-ladders, stays, gaming a foothold (probable 'gaining', left), failing; and the names Koptos, Vyse, Khety, Pakht, Beket, Sehez, Syene, Lyons, Lange.

**Links.** 417 keys read (the 340 lower-count keys from their entry and linked words, with the text checked for every suspect). Chapter verdicts assume the reader links the first mention of a key in each chapter; `rightIn` on an `off` row lists the chapters that are right. This book is almost all Egyptian gods, kings and sites and they are the right ones; the faults are private persons who share a royal or famous name (Teti, Khamwese, Thutiy, Merire, Pentewere, Sehetepibre, Amenemopet), Breasted's "Buto" for the goddess, and a few accidents of capitals and misprints (Month, TIn, Akh-). Not reported: Egypt and Cyprus (modern-state entries, same land).

**Links left open.** `Syria` — the entry is the modern Syrian state ("a country of 185,180 km² … governed from Damascus"); Breasted's Syria is the whole ancient Levant of the Egyptian campaigns. The owner has already switched off L · `Israel` — the entry is the modern state; the text means the people "Israel" of Merneptah's stela (ch58) and the Iron Age kingdom (ch75). Same policy question as Syria · `Sesostris` — wherever "Sesostris" stands alone it is a historical 12th Dynasty king ("the young Sesostris", "As Sesostris lives", "one of the Sesostrises"); the entry is the legendary conqueror of Herodotus. Wrong · `Prophet` — mostly the Egyptian priestly rank ("Third Prophet of Amon", "Prophet of the House of Amenhotep"), not an inspired mouthpiece of a god; right in ch69 (the possessed youth at Byblos). I could not tell w

## `xunzi` — Xunzi, Xunzi

Applied: **52** · held: 3 · links off: 2 + 1 per chapter · 1 link(s) left open

**How it reads.** All six samples read as raw OCR: the sense is followable, but each has wrong letters, lost question marks, garbled glosses and footnote text fused into sentences. This is by a wide margin the worst text in this assignment; treat the listed fixes as a first pass and the systematic lines as the real finding.

**What repeats.**

- THE WHOLE BOOK IS AN UNCORRECTED SCAN. Every sample of six had between 8 and 25 faults; a fix list cannot make it clean — it needs a full proof-read against Dubs 1928 or a better source text. The 55 rows listed are a certain subset (at most ~5 per class), not the whole.
- Italic glosses misread, ~170: '(Too)' for '(Tao)' 95 times (always wrong; '(Tao)' 105 times) — fix by rule, with '[Too)', '(Tod)', '(Tap)', '(Telo)', '(not-Too)'; '(Tien)' x11 and '(THen)' x5 for '(T‘ien)'; and about 60 one-off wrecks of (Yi), (Li), (Jen): '(Y)', '(V)', '(K)', '(F)', '(Fi)', '(Ft)', '(Y-i)', '(Y i)', '(¥i)', '(lA)', '(JA)', '(ii)', '(£i)', '(L%)', '(Jin)', '(Jew)', '(J en)', '[Li)', '[Jen)', '(\m-Tao)'. The pair 'proper conduct (..) and justice (..)' fixes most by rule: the first is (Li), the second (Yi).
- Punctuation after a gloss misread: '(Tao)}' x3, '(Tao\' x3, '(Yi)\' x1, and a comma for a full stop before a capital — '(Yi), Now suppose', '(Tao), Hence', '(Tao), The soldiers' (dozens).
- 'he' read as 'be' (~15: 'because be thinks', 'if be practises', 'be becomes a merchant'), 'her' as 'ber', 'how' as 'bow', 'born' as 'bom' (7, all listed), 'the' as 'tRe/fKc', ff as 'fF' (3, listed).
- Question marks lost: read as ' 1' (17: 'very fine 1 Now', 'the potter’s nature 1 The workman') or ' %' (3), or dropped altogether ('Is not this extremely erroneous Yi and Feng-men', 'Why was that Because', 'what is to be done now Music is') — at least 40 in all.
- Footnotes and marginal summaries are fused into the prose mid-sentence, ~20: 'cannot converse with those who Being beggars. reach to the status of a Sage', 'he Study only orthodox teachings. becomes an artisan', 'When the Sage-Kings were on 1 Beggars, i.e., shallow thinking. the throne', 'In their actions they Duke Chuang, 693-602 B.c.', 'the stone chimes 1 Another quotation, Li-Ki XVII', 'This is how the superior man “inch, foot, length between outstretched hands, and ten-foot length." keeps his purposes'. Footnote reference marks survive as '/', "'" or a hyphen ('money-bags/', 'canopy/', 'Huai,’').
- Section headings (small capitals in print) sit unmarked and garbled at the head of a paragraph: 'The Desires oc Men For food…', 'The Methon oc Governing the Empire By serving…', 'The Arrajstg-emeht oc Officials The Master…', 'The GrRADES OF Men Their purposes…'. They should be their own heading lines (only 4 bk-head in the whole book).
- Words dropped at line ends and garbage runs: 'they are the of being majestic', 'imprisoned the Viscount of and invented', 'yet its army was almost Ch‘iao arose', 'then., _. t y /,. I IS it sharp', 'the burial % m ‘j-j 1 io magnify it', '9(i He 4:', 'The master, Ham dL'ing, said', 'sH Your master', 'Also Tze-cM both'. Sentences also start lower-case after a lost line ('questioner may say', 'prince is the lord of rule').
- Stray apostrophes, hyphens and commas from specks (~40): "do' not", 'If the’ ruler', "is'the", 'and- Wu-lai', '-wicked', 'organs -of', 'feed., For there, is. no sound', 'the mind s emptiness', ''What can be considered'.
- Blockquoted odes lose their closing quotation mark and the refrain 'this expresses my meaning' runs on from the verse (most odes).

**Looks wrong and is right.** Wade-Giles names with the ‘ aspirate (T‘i-bao, Ch‘ie, Ts‘u, T‘ang, Hsün Ch‘ing, Mo-hsie, Min-tiao, Fan-jo, Chü-shu, Fei-lien, Wu-lai, Feng-men) are right; 'Tsao-fu'/'Tsu' beside 'Ts‘ao-fu'/'Ts‘u' have lost the aspirate (scan) but are not listed · 'physiognomize(s)', 'filiality', 'birdlets', 'plumbline', 'summum bonum', 'Micion', 'embued', 'strategems', 'disemboweled' — the translator's words or period spellings · 'gathered in in the fall' (ch13), 'that that government' (ch14) — grammatical · 'obesiance' (ch16), 'minutise' (ch8, for minutiæ), 'humanking' (ch20, for humanizing?) are almost certainly scan slips but the right form could not be confirmed against the source; not listed · '* * * * *' section breaks (18) are the edition's

**Links left open.** `Book_of_Rites` — Xunzi's 'Book of Rites (Li)' is the ritual classic of his own day; the entry is the Liji, assembled from the 2nd century BCE, after him. Same tradition, different book — owner's call.

## `mozi` — Mozi, Mozi

Applied: **34** · held: 31 · links off: 3 + 2 per chapter

**How it reads.** The six samples read as intelligible Mei prose but are visibly raw OCR: every sample but one (Universal Love I, clean) had faults — stray letters and full stops, lost apostrophes, a king's name misread three times (Hanan for Hsüan), 'tamers' for tanners twice, 'he set free' for 'be set free', orphaned quotation marks. Paragraphing is sound and there are no notes; verse is not set off from the prose.

**What repeats.**

- THE WHOLE BOOK IS UNPROOFED OCR (Wikisource/HathiTrust page scans) and the spell scan saw almost none of it (10 candidates): reading 27,000 characters of samples turned up about 25 faults, i.e. roughly one per 1,000 characters, some 300-400 in the 363,000-character book. The 65 fixes listed are what the samples and a few pattern scans found; the book needs a full proof against the page images (or collation with the Chinese Text Project's copy of the same Mei translation) before it can be called clean.
- QUOTATION MARKS ARE UNRELIABLE THROUGHOUT (about 68 double and a dozen single marks, most of them unpaired). Mei's print quotes inner speeches; the OCR lost most opening marks and turned many closing marks into openers with a space before them. Examples: ch11 'Then can there be disorder in the state? “</p>'; ch19 'What is your explanation for this?' “”</p>'; ch31 'proclaim: Of course there are no spirits.' And from morning'; ch36 'Also” Shao Kung “in the same way'; ch49 'Wu Lii told Motse: “Righteousness is just righteousness. Wherefore all the verbosity? Motse asked him:' (never closed); ch16 'the Oath of Yu’’ and the Oath of T’ang'. Fix by rule only by re-proofing; a regex for '“</p>', '“”' and for a closing mark with no opener in the paragraph finds them.
- Specks and footnote marks read as characters (about 20): a full stop in mid-clause ('builds such. boats', 'hates. others', 'must have. something', 'Do. not place', 'victorious. he does'), a lone letter between words ('thousand, j which', 'white, j that', 'saying: b Now', 'unreason? f Motse', 'reach? V (This', 'state. a (The', 'liu t and', 'The Salvation V and'), stray ',.' ';-' 'it:' 'The:'. Regexes: \b[a-z]\. [a-z] and a single consonant standing alone.
- Sentence-final full stops dropped before a capital (ch7 'named Tseu Yu The reign', ch16 'Oath of T’ang T’ang said', 'Poems of Chou To quote', ch7 'the “Chin Chao King Wu conquered') and two passages too garbled to mend without the page: ch7 'called The Salvation V and also instituted the “Chin Chao King Wu conquered the Yin dynasty' and ch36 'Fate is born of the TO So, then,'.
- ü read as 'ii' or worse in names (11 x 'Lii' for Lü; 'Lh'; 'Hanan' x3 for Hsüan), apostrophes of aspirates lost or misread ('T ang', 'T ai', 'Kiung Mo', 'one s self'); the italic-free plain names give the spell scan nothing to hold on to.
- Verse quoted from the Odes and Documents is run into the prose with no line breaks, and at least one Ode has its lines tangled (ch9 'I am instructing you to take worries and cares of the world I as your own am teaching the order of ranks' — presumably '… of the world as your own; I am teaching …').

**Looks wrong and is right.** Wade-Giles names and terms are right as printed: Motse, T’ang, Chow (the tyrant), Ch’in, Ch’u, E Lai (惡來 — the lone 'E' is his name, three times), ting mao (cyclical day), hsing, liu, p’en, t’ung wood, ch’eng-huang, Ch’engtse, Kuan Ku, Kou Mang, Chuang Tse Yi, P’u T’ien, Tseu Yu, Chü Nien, Shu Nien · depossessed, luminating (ch9), unbreakability, un-magnanimous, un-understood, non-superior, cross-able, house-moving, swaddle-clothes, linch-pin, plowing/plow (the edition's own spelling beside British labourers, honoured) — the translator's words, leave · 'Ding ding, dong dong', 'Let those who can argue argue', 'if I had had it', 'Sung were offered you you would not take it' — doublings that are grammatical · K’ung Mo (13 times) beside K’ung Mou (4 times) in ch. 39, both for 孔某 — cannot be settled without the page images, leave both · Anti-fatalism / Anti-Fatalism is a capitalisation variant, leave

**Links.** Wade–Giles syllables matching inside names, as in the other Chinese classics.

