# Steps for every research agent (any wh- range)

Scratch: WH_S=/tmp/claude-0/-home-user-folio/605c94ed-4e6b-5a36-8f85-77939a9948da/scratchpad/wh (export it in every shell).
Repo /home/user/folio is READ-ONLY for you; run commands from it.

1. Read /home/user/folio/.claude/wh-refine/BRIEF.md, then $WH_S/ADDENDUM.md (the addendum wins). Follow both exactly.
2. Your cards as they stand: $WH_S/cur/<id>.json. Sibling index: $WH_S/index.tsv.
3. A previous agent on these cards may have been cut off by a usage limit: if $WH_S/out/<id>.json or
   $WH_S/pages/<id>-s*.txt already exist, you may reuse saved pages that are complete (check each is the right page and
   not empty), but re-verify every claim and finish the draft yourself. Overwrite freely.
4. Dates: grep /home/user/folio/docs/wh-chronology.md (never read it whole); agree with it, or give the source's figure and
   say in notes why it differs.
5. Related cards in other collections (read, compare, never edit): `node .claude/wh-refine/related.js "<regex>"` and
   `node .claude/wh-refine/related.js --card <id>`; for rm- cards also
   `node -e "global.window={};require('./data.js');window.CARD_DATA.filter(c=>/^rm-/.test(c.id)&&/<regex>/i.test(c.answer)).slice(0,30).forEach(c=>console.log(c.id,c.answer))"`.
6. Save every cited page to $WH_S/pages/<id>-s<N>.txt, write $WH_S/out/<id>.json, and run
   `WH_S=$WH_S node .claude/wh-refine/precheck.js <id>` until it prints OK. An I.duplicate FAIL caused by the CURRENT
   picture (which you may not change) is acceptable: say so in notes.
7. `pins` carries ONLY figures printed on the date line. A locator `name` is a place, never the card's answer term.
8. Final reply ≤ 120 words, one line per card (id, sources old→new, the main correction).
