# frozen/ — what the deleted v1 files still gave the site

Atlas v2 Phase 5 (`docs/atlas-v2-phase5-plan.md`) deleted `world.js`, `us-states.js`, `china-provinces.js`, `russia-subjects.js`, `world-capitals.js`, `us-cities.js`, `state-capitals.js`, `timeline.js`,
`polities.js` and the rest of v1's data. A few scripts that remain used them as INPUTS. Their data was read one last time, by two scripts that are not kept (they cannot run now their sources are gone), and
committed here. **Do not edit these by hand and do not regenerate them: there is nothing to regenerate from.** The last commit that held the source files is **`f7aca62`**
(`git show f7aca62:world.js`, `…:timeline.js`, `…:polities.js` and the others), and the two scripts are at `9beee04` (`.claude/atlas-build/freeze-v1.js`, `freeze-findit.js`).

| file | what | read by |
|---|---|---|
| `layers.json` | per layer (`us-states`, `china-provinces`, `russia-subjects`, `world`): the card-facing words (`what`, `plural`, `cell`), every shape's name `n`, short code `a`, label point `c`, the box of its rings near that point `box`, for the world the largest ring's bounding-box area, the old dot tables (capitals, cities) and the **neighbours** of every shape and of every key list a card uses (a grid-proximity rule, two shared cells to count) | `build-card-faces.js` → `atlas/data/card-faces.js` and `card-neighbours.js`; `add-card.js` |
| `v1-names.json` | every name the old maps carried: the world's and each of the thirteen eras' | `card-war.js` (checks an old `war` field against them) |
| `state-capitals.json` | `{ retrieved, table }`: the US state capitals Wikidata gave, with the date they were retrieved | `build-history.js`, `check-history.js` (the pilot polities' period capitals) |

`atlas/data/findit-areas.js` (Find it's dated area rings, 103 areas) and `atlas/data/country-names.js` (built by `build-country-names.js`, which can be re-run) are the same kind of thing
outside this folder. When a map card's layer needs a NEW shape, add it to `layers.json` by hand (the rows are plain JSON) and run `build-card-faces.js`.
