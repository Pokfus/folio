#!/usr/bin/env python3
"""Regenerate .claude/fsrs-vectors.json — the reference vectors test-scheduler.js checks Folio's FSRS against.

WHY A FIXTURE RATHER THAN A READING OF THE MATHS. FSRS-6 is somebody else's algorithm, and an
implementation reconstructed from prose is exactly the thing that looks right and quietly schedules every
reader worse — the one failure a study site cannot afford. So Folio's arithmetic is compared against numbers
produced by the reference implementation itself, and the comparison is committed so it runs on every change
without needing Python or a network.

    python3 -m venv /tmp/fsrsenv && /tmp/fsrsenv/bin/pip install fsrs
    /tmp/fsrsenv/bin/python .claude/gen-fsrs-vectors.py > .claude/fsrs-vectors.json

`fsrs` is a DEV dependency and must not enter the repo (the zero-dependency rule) — install it in a scratch
venv, as Playwright is. Re-run this only when the reference or the default parameters actually move, and say
so in the commit: if test-scheduler.js section 10 fails after an app.js change, app.js is wrong, not this.

Fuzzing is off and every timestamp is fixed, so the output is deterministic and a regenerated file should be
byte-identical unless something real has changed.
"""
import json, itertools
from datetime import datetime, timedelta, timezone
from fsrs import Scheduler, Card, Rating, State

try:                                    # which reference produced the file — the one thing that dates it
    from importlib.metadata import version
    REF = "py-fsrs " + version("fsrs")
except Exception:
    REF = "py-fsrs (version unknown)"

W = list(Scheduler().parameters)
# `ref` is recorded so "regenerate only when the reference moves" has something to compare against: a
# fixture with no provenance cannot tell a deliberate version bump from a fixture edited to fit a bug.
out = {"ref": REF, "params": W, "cases": [], "curve": [], "intervals": []}

# --- the pure pieces, sampled over a wide grid
sch = Scheduler(enable_fuzzing=False)
for s in [0.001, 0.5, 1, 3, 21, 100, 365, 3650]:
    for el in [0, 1, 2, 7, 30, 365]:
        c = Card(); c.stability = s; c.difficulty = 5.0
        c.last_review = datetime(2026, 1, 1, tzinfo=timezone.utc)
        out["curve"].append({"s": s, "elapsed": el,
                             "r": (1 + sch._FACTOR * el / s) ** sch._DECAY})
for s in [0.4, 1, 5, 40, 400, 4000]:
    for r in [0.7, 0.8, 0.9, 0.95, 0.98]:
        sc = Scheduler(enable_fuzzing=False, desired_retention=r)
        out["intervals"].append({"s": s, "retention": r, "days": sc._next_interval(stability=s)})

# --- the state machine, driven exactly as Folio drives it
T0 = datetime(2026, 3, 1, 9, 0, 0, tzinfo=timezone.utc)
RAT = {"again": Rating.Again, "hard": Rating.Hard, "good": Rating.Good, "easy": Rating.Easy}
def snap(c):
    return {"state": c.state.name, "step": c.step, "stability": c.stability,
            "difficulty": c.difficulty,
            "due_min": None if c.due is None else round((c.due - c.last_review).total_seconds() / 60, 6)}

# every sequence of up to 4 grades, with a realistic gap between reviews
for seq in itertools.product(["again", "hard", "good", "easy"], repeat=3):
    for gap_min in [0, 30, 1440, 1440 * 9]:
        sch = Scheduler(enable_fuzzing=False)
        c = Card()
        t = T0
        steps = []
        for g in seq:
            c, _ = sch.review_card(c, RAT[g], t)
            steps.append({"grade": g, **snap(c)})
            t = t + timedelta(minutes=gap_min if gap_min else 1)
        out["cases"].append({"seq": list(seq), "gap_min": gap_min, "steps": steps})
print(json.dumps(out))
