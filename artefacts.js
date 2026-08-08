/* ============================================================
   ARTEFACTS — the pool a level-up chest draws from
   ============================================================
   Every entry is a REAL historical object. The same rule the cards and the glossary run on applies here
   without exception: nothing is invented — not a date, not a museum, not a measurement — and where the
   scholarship is unsettled the description says so rather than picking a side.

   Shape:
     id      a stable slug. It is what the reader's own inventory (S.artefacts) is keyed by, so it must
             NEVER be reused for a different object and never renamed once shipped — a renamed id takes
             the artefact out of every collection that holds it.
     name    the title shown when it is looted.
     rarity  "common" | "rare" | "epic" | "legendary" — grey, blue, purple, orange. It decides the drop
             odds (60 / 25 / 12 / 3) and how expansive the chest animation and its sound are.
     date    a short date line, in the compact notation the cards use.
     origin  where it is from, and where it is now if that is worth knowing.
     image   optional { src, credit, alt } — a LINK, never an upload, exactly as a card's picture is.
             `credit` is required wherever `src` is set; an artefact with no picture draws a
             rarity-coloured placeholder rather than an empty frame.
     desc    exactly FIVE sentences, about 200 words (±10%), at the same reading level as a card's
             background. Rich HTML: <b> for the object's own name at its first mention, <i> for titles
             and foreign terms. Metric first with the imperial equivalent in brackets.

   Written and edited in Admin → Artefacts, which can also hand this whole file back as a JS literal. */
window.ARTEFACTS = [
  {
    id: "gladius",
    name: "Gladius",
    rarity: "common",
    date: "c. 3rd century BCE – 2nd century CE",
    origin: "The Roman world",
    desc: "The <b>gladius</b> was the short thrusting sword carried by Roman infantry from roughly the third century BCE to the second century CE, and Roman writers themselves called the best-known form the <i>gladius Hispaniensis</i>, crediting a Spanish origin picked up during the wars against Carthage. Its blade ran about 65 centimetres (26 inches) in the earliest pattern and shortened over the following centuries to nearer 45 centimetres (18 inches), double-edged and tapering to a long point, mounted with a wooden or bone grip and a heavy pommel that balanced the weight back towards the hand. Legionaries wore it high on the right hip so that a soldier standing shoulder to shoulder behind his shield could draw and stab without opening the line, while centurions wore theirs on the left. Polybius and Vegetius both stress that the weapon was made for the point rather than the edge, and Vegetius gives the reason plainly: a thrust of five centimetres (two inches) is generally fatal, where a cut may be turned by bone or armour. Archaeologists distinguish several successive patterns — Mainz, Fulham and Pompeii among them, each named after the place its defining find came from — and the straight, shortened blade of the Pompeii type is the form most often reproduced today.",
  },
  {
    id: "mask-of-agamemnon",
    name: "Mask of Agamemnon",
    rarity: "legendary",
    date: "c. 1600 – 1500 BCE",
    origin: "Grave Circle A, Mycenae — National Archaeological Museum, Athens",
    desc: "The <b>Mask of Agamemnon</b> is a funerary mask of beaten gold that Heinrich Schliemann lifted in 1876 from Grave Circle A at Mycenae, and it is now among the best-known objects in the National Archaeological Museum in Athens. It was one of several masks laid over the faces of men buried in the shaft graves, hammered from a single sheet and worked from behind, with a full beard, closed eyes and ears cut free of the surrounding metal. Schliemann believed he had found the burial of Agamemnon, the king Homer sends against Troy, and the name has stayed on the mask ever since, although the graves are now dated to about 1600 to 1500 BCE — three or four centuries before the destruction levels usually associated with the Trojan War. Its style sets it apart from the other masks of the same circle, which are flatter and less individually modelled, and a few scholars have argued that Schliemann had it improved or even manufactured outright, a charge most specialists reject on the evidence of the excavation records. Whatever the face was meant to say about the man beneath it, the mask remains the single most recognisable image of Mycenaean Greece.",
  },
];
