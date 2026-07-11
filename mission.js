/* Mission-page intro copy (title + paragraphs; raw HTML — <b>/<i> allowed, glossary links are auto-added
   at render). Admins edit this in place on the Mission page: edits overlay via ADMIN_EDITS.mission and are
   baked back into this file by auto-save / "Save to project" (serializeMission). Loaded before app.js. */
window.MISSION = {
  "title": "Study history the way memory actually works",
  "paras": [
    "In 1885 Hermann Ebbinghaus measured how quickly we forget: sharply at first, then more slowly — the <b>forgetting curve</b>. He also found its remedy. Review something just as it is about to slip away and the curve flattens; each successful recall lets the next review wait longer. That is <b>spaced repetition</b>: a new fact returns within minutes, then a day, then days, weeks and months — a handful of well-timed encounters doing the work of a hundred re-readings.",
    "The second ingredient is <b>active recall</b>. Retrieving a memory strengthens it far more than looking at it again, which is why every card here poses its statement with the key term blanked out — you produce the answer before you see it. Grading yourself honestly (<i>Again, Hard, Good, Easy</i>) is not a score; it is the signal the scheduler uses to decide when you should meet that card again.",
    "History is where this method earns its keep. Names, dates, places, and the order of events are exactly the details that fade first — yet they are the scaffolding that lets the larger story mean anything. When you know <i>when</i> the Zhou fell and <i>who</i> came after, every new thing you read clicks into place instead of washing past. Folio keeps that scaffolding standing, and surrounds it with context: a glossary behind every term, an atlas that shows the borders of the year you are studying, and daily games that make you meet the same material from a different angle. Facts you encounter in several forms are facts you keep."
  ]
};
