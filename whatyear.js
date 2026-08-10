/* WHAT YEAR? — the daily game's own pool of dated historical events.
   `window.WHATYEAR = [{ y: <year, negative for BCE>, e: "<one sentence>" }]`, the sibling of
   `truefalse.js` and `quotes.js`: a minigame with a pool of its own rather than one drawn from the cards.

   WHY IT IS NOT BUILT ON THE CARDS (Aug 2026, on request). It was, and the card corpus is the wrong shape
   for it twice over. A card names a TERM and this game wants an EVENT — Timeline already had to call the
   cards "events" in its own prose and be slightly wrong about it. And the game needs FIVE things sharing
   one exact year, which is a demand almost no corpus of terms meets: of 409 cards only 19 years carried
   five, and once the minigames were narrowed to well-known terms only ONE did, so the game would have
   asked about c. 700 BCE every day for ever. An event pool is the natural material, and it is cheap:
   fifteen years of five to eight events each is a few kilobytes.

   THE RULES FOR AN ENTRY, all of which the game or the house style forces:

   · ONE SENTENCE, plain text, and NO MARKUP. The clue list renders through `esc()`, so an `<i>` around a
     book title prints as the characters. Write the title bare: `Common Sense`, not `<i>Common Sense</i>`.
     This is the one place on the site where a title is not italicised, and it is a rendering fact rather
     than a change of mind about the house style.
   · IT MAY NOT NAME ITS OWN YEAR, or any year — the year is the answer. It may not name a nearby one
     either: "weeks after the peace signed the previous December" is fine, "signed in December 1814" is
     the puzzle solved for the reader.
   · THE EVENT IS DATED TO THE YEAR AND THE DATING IS NOT IN DISPUTE. A guessing game cannot be built on a
     contested date, so nothing here rests on one; where an event is conventionally dated, say the thing
     that happened rather than the anniversary it acquired.
   · IT IS RECOGNISABLE. The game shows five clues and asks for a year with three guesses, so a reader who
     recognises none of the five has no way in. This is the same reasoning behind `card.difficulty` and the
     minigames' pool filter: a round dealt cold has to be answerable cold.
   · A YEAR NEEDS AT LEAST `WY_EVENTS` (5) ENTRIES or the game skips it — silently, since it simply never
     appears in the ring. Adding a sixth or seventh to a year that already has five is not waste: the game
     draws five at random, so the extras are what stop a repeated year being a repeated puzzle.

   FIFTEEN YEARS, 96 events. Every one was checked against a reference source when it was written; the
   house rule against inventing dates binds here exactly as it binds a card. The spread is deliberate
   rather than incidental — the years run from the 11th century to the 20th, and each year's five reach
   past whichever country the year is famous in, so 1453 carries Mainz as well as Constantinople and 1945
   carries San Francisco as well as Hiroshima.

   NOT TRANSLATED, like every content file written since the `MULTILANG` gate went up. When translations
   resume this pool belongs in `i18n/games-<lang>.js` beside the other two, keyed by its English sentence
   — NOT inline here, which is the mistake `quotes.js` made once and paid 27 KB → 312 KB for.
   Eagerly loaded, like the two pools it sits beside; it is ~12 KB, smaller than either. */
window.WHATYEAR = [
  /* ---------- 1066 ---------- */
  { y: 1066, e: "Edward the Confessor died childless and the Witan chose Harold Godwinson to succeed him." },
  { y: 1066, e: "Harold Godwinson destroyed a Norwegian invasion at Stamford Bridge, killing King Harald Hardrada." },
  { y: 1066, e: "William of Normandy defeated and killed Harold at the Battle of Hastings." },
  { y: 1066, e: "A comet later identified as Halley's was seen across Europe and stitched into the Bayeux Tapestry." },
  { y: 1066, e: "William the Conqueror was crowned king of England in Westminster Abbey on Christmas Day." },
  { y: 1066, e: "A Norman fleet sailed from the mouth of the Somme to begin the conquest of England." },

  /* ---------- 1215 ---------- */
  { y: 1215, e: "King John sealed Magna Carta at Runnymede under pressure from his rebel barons." },
  { y: 1215, e: "Pope Innocent III annulled Magna Carta within weeks, calling it extorted by force." },
  { y: 1215, e: "The Fourth Lateran Council met in Rome and called Christendom to a new crusade." },
  { y: 1215, e: "Mongol armies under Genghis Khan sacked Zhongdu, the Jin capital that stood where Beijing stands now." },
  { y: 1215, e: "Frederick II was crowned king of the Romans at Aachen." },
  { y: 1215, e: "Rebel barons entered London and took the city, and Robert Fitzwalter led them as Marshal of the Army of God." },

  /* ---------- 1453 ---------- */
  { y: 1453, e: "Ottoman forces under Mehmed II took Constantinople and the Byzantine Empire came to an end." },
  { y: 1453, e: "Constantine XI, the last Byzantine emperor, was killed in the fighting on the walls of his capital." },
  { y: 1453, e: "French artillery destroyed an English army at Castillon, effectively ending the Hundred Years' War." },
  { y: 1453, e: "Bordeaux fell to the French and England lost almost everything it still held in France." },
  { y: 1453, e: "Scribes in Mainz finished the Giant Bible by hand, in the city where Gutenberg was building his press." },
  { y: 1453, e: "Ladislaus the Posthumous was crowned king of Bohemia, ending an interregnum of fourteen years." },

  /* ---------- 1492 ---------- */
  { y: 1492, e: "Granada surrendered to Ferdinand and Isabella, ending the last Muslim rule in Iberia." },
  { y: 1492, e: "The Alhambra Decree ordered the Jews of Spain to convert to Christianity or leave the country." },
  { y: 1492, e: "Christopher Columbus sailed west from Palos with three ships to look for a route to Asia." },
  { y: 1492, e: "Columbus made landfall on a Bahamian island whose people called it Guanahani." },
  { y: 1492, e: "Lorenzo de' Medici died at Careggi, ending an ascendancy over Florence of more than two decades." },
  { y: 1492, e: "Rodrigo Borgia was elected pope and took the name Alexander VI." },

  /* ---------- 1517 ---------- */
  { y: 1517, e: "Martin Luther set out ninety-five theses against the sale of indulgences at Wittenberg." },
  { y: 1517, e: "Ottoman armies under Selim I entered Cairo and brought down the Mamluk Sultanate." },
  { y: 1517, e: "The last Abbasid caliph in Cairo was deported with his family to Constantinople." },
  { y: 1517, e: "The Ottoman Empire annexed Egypt, the Levant and the Hejaz, taking custody of Mecca and Medina." },
  { y: 1517, e: "A third outbreak of the sweating sickness swept England and emptied Oxford and Cambridge." },

  /* ---------- 1776 ---------- */
  { y: 1776, e: "The Continental Congress adopted the Declaration of Independence in Philadelphia." },
  { y: 1776, e: "Thomas Paine published Common Sense, arguing for a clean break with Britain." },
  { y: 1776, e: "Adam Smith published An Inquiry into the Nature and Causes of the Wealth of Nations." },
  { y: 1776, e: "Edward Gibbon published the first volume of The History of the Decline and Fall of the Roman Empire." },
  { y: 1776, e: "George Washington crossed the Delaware at night and captured the Hessian garrison at Trenton." },
  { y: 1776, e: "Spanish soldiers and Franciscan friars founded the presidio and mission that grew into San Francisco." },

  /* ---------- 1789 ---------- */
  { y: 1789, e: "A Paris crowd stormed the Bastille and killed its governor." },
  { y: 1789, e: "Deputies of the Third Estate swore the Tennis Court Oath not to disperse until France had a constitution." },
  { y: 1789, e: "The National Constituent Assembly proclaimed the Declaration of the Rights of Man and of the Citizen." },
  { y: 1789, e: "George Washington was sworn in as the first president of the United States at Federal Hall in New York." },
  { y: 1789, e: "Fletcher Christian seized HMS Bounty in the Pacific and set Captain Bligh adrift in an open boat." },
  { y: 1789, e: "William Herschel discovered Enceladus, a moon of Saturn." },
  { y: 1789, e: "The Estates-General of France met at Versailles for the first time in 175 years." },

  /* ---------- 1815 ---------- */
  { y: 1815, e: "Mount Tambora erupted in the Dutch East Indies, the largest volcanic eruption in recorded history." },
  { y: 1815, e: "Napoleon escaped from Elba and marched on Paris to begin the Hundred Days." },
  { y: 1815, e: "Wellington and Blücher defeated Napoleon at Waterloo." },
  { y: 1815, e: "Napoleon abdicated for the second time, four days after his last battle." },
  { y: 1815, e: "The Congress of Vienna signed its Final Act and redrew the map of Europe." },
  { y: 1815, e: "Andrew Jackson's men threw back a British assault at New Orleans, weeks after the peace had been signed." },
  { y: 1815, e: "Austria, Prussia and Russia bound themselves together in the Holy Alliance." },

  /* ---------- 1865 ---------- */
  { y: 1865, e: "Robert E. Lee surrendered to Ulysses S. Grant at Appomattox Court House." },
  { y: 1865, e: "Abraham Lincoln was shot at Ford's Theatre and died the next morning." },
  { y: 1865, e: "The Thirteenth Amendment was ratified and slavery was abolished throughout the United States." },
  { y: 1865, e: "Union troops proclaimed emancipation at Galveston, on the day now kept as Juneteenth." },
  { y: 1865, e: "Joseph Lister dressed a boy's compound fracture with carbolic acid in the first antiseptic surgery." },
  { y: 1865, e: "Gregor Mendel read his paper on plant hybridisation to the natural history society of Brno." },
  { y: 1865, e: "Lewis Carroll published Alice's Adventures in Wonderland." },

  /* ---------- 1914 ---------- */
  { y: 1914, e: "Gavrilo Princip shot Archduke Franz Ferdinand and his wife in Sarajevo." },
  { y: 1914, e: "Austria-Hungary declared war on Serbia and the First World War began." },
  { y: 1914, e: "German troops crossed into Belgium and Britain declared war on Germany." },
  { y: 1914, e: "The Panama Canal opened to shipping with the passage of the SS Ancon." },
  { y: 1914, e: "A French and British stand on the Marne halted the German advance on Paris." },
  { y: 1914, e: "German and British soldiers left their trenches to meet in no man's land on Christmas Day." },
  { y: 1914, e: "A German army surrounded and destroyed the Russian Second Army at Tannenberg." },

  /* ---------- 1945 ---------- */
  { y: 1945, e: "The Red Army reached Auschwitz and freed the prisoners left behind there." },
  { y: 1945, e: "Roosevelt, Churchill and Stalin met at Yalta to settle the shape of postwar Europe." },
  { y: 1945, e: "Germany surrendered unconditionally and the war in Europe ended." },
  { y: 1945, e: "An American bomber dropped an atomic bomb on Hiroshima, the first ever used in war." },
  { y: 1945, e: "A second atomic bomb was dropped on Nagasaki three days after the first." },
  { y: 1945, e: "Japan signed the instrument of surrender aboard the USS Missouri in Tokyo Bay." },
  { y: 1945, e: "Fifty nations signed the Charter of the United Nations at San Francisco." },
  { y: 1945, e: "Ho Chi Minh read out a declaration of independence in Hanoi and proclaimed the Democratic Republic of Vietnam." },

  /* ---------- 1947 ---------- */
  { y: 1947, e: "British India was partitioned and India and Pakistan became independent dominions." },
  { y: 1947, e: "Harry Truman told Congress that the United States would support free peoples resisting subjugation." },
  { y: 1947, e: "George Marshall proposed American aid for European recovery in a speech at Harvard." },
  { y: 1947, e: "Bedouin shepherds found the first of the Dead Sea Scrolls in a cave at Qumran." },
  { y: 1947, e: "Chuck Yeager flew a Bell X-1 past the speed of sound." },
  { y: 1947, e: "Bell Labs demonstrated the first working transistor." },
  { y: 1947, e: "Jackie Robinson took the field for the Brooklyn Dodgers and broke baseball's colour bar." },

  /* ---------- 1960 ---------- */
  { y: 1960, e: "Seventeen African colonies became independent states within a single year." },
  { y: 1960, e: "Nigeria became independent of Britain." },
  { y: 1960, e: "The Belgian Congo became independent and slid within weeks into civil war." },
  { y: 1960, e: "South African police fired on a crowd at Sharpeville and killed dozens of protesters." },
  { y: 1960, e: "Theodore Maiman built the first working laser." },
  { y: 1960, e: "A Soviet missile brought down an American U-2 spy plane and its pilot was captured alive." },
  { y: 1960, e: "Five oil-producing states founded OPEC at a meeting in Baghdad." },
  { y: 1960, e: "The most powerful earthquake ever recorded struck southern Chile." },

  /* ---------- 1969 ---------- */
  { y: 1969, e: "Neil Armstrong stepped onto the Moon while hundreds of millions watched." },
  { y: 1969, e: "Half a million people gathered for a music festival on a dairy farm near Bethel, in New York state." },
  { y: 1969, e: "The first message was sent between two computers over the ARPANET." },
  { y: 1969, e: "Concorde made its first flight, from Toulouse." },
  { y: 1969, e: "The Boeing 747 flew for the first time." },
  { y: 1969, e: "A police raid on the Stonewall Inn in New York set off days of protest." },

  /* ---------- 1989 ---------- */
  { y: 1989, e: "East Germany opened its border crossings and crowds broke through the Berlin Wall." },
  { y: 1989, e: "The Chinese army cleared the protesters out of Tiananmen Square." },
  { y: 1989, e: "Tim Berners-Lee circulated a proposal at CERN for what became the World Wide Web." },
  { y: 1989, e: "Riot police beat students marching in Prague and the Velvet Revolution began." },
  { y: 1989, e: "The tanker Exxon Valdez ran aground in Prince William Sound and spilled crude oil into Alaskan waters." },
  { y: 1989, e: "The last Soviet troops left Afghanistan after nine years of war." },
];
