"""fortnight.py — the Second World War's fronts, one set per PLATE (Atlas v2 Phase 2d, task 3): every plate of the US Army's
"Atlas of the World Battle Fronts in Semimonthly Phases to August 15, 1945", July 1943 – August 1945, read on its own.

    PYTHONPATH=<scipy> python3 .claude/ww2-plates/fortnight.py <workdir> <out.json> [--only=p-076,p-077] [--pages=a-b]

The atlas's pages (the PDF is pinned in .claude/atlas-build/sources.json, `us-army-battlefront-atlas`; render with
`pdftoppm -r 150 -f 10 -l 106 -png atlas.pdf <workdir>/pdfp/p`) alternate the war against Germany (even pages from 10 to 100,
one a fortnight: 1 July 1943, 15 July, 1 August … 15 May 1945) and the war against Japan (odd pages from 11 to 99, the same fortnights to
1 May 1945, then pages 101–106: to 1 June, 15 June, 1 July, 15 July, 1 August and 15 August 1945). The Germany plates use two printed bases
(the whole of Europe to 15 November 1944; from 1 December an enlarged central section — "Map scale has been enlarged"), both azimuthal
equidistant about Berlin; the Japan plates are Mercator. `compose.py` (the yearly maps of 2026-10-01) read seven plates seeded by hand with ten
city positions each; this reads ALL of them, each on its own and with no hand-placed seed: the transform of a reference page of its base (the
fit `compose.py`'s seeds gave) is moved to the new page by a vote — every printed city ring the page shows, against every city the reference
predicts, votes for the shift (and scale, 0.93–1.07) it implies — and `georef.georef` refits from the ten best-agreeing cities, four times.

WHAT A PLATE GIVES, AND NO MORE. compose.py carried the previous year's map on outside a plate's frame; a fortnightly plate does not: inside its
frame the plate decides, outside it nothing is said (a gap draws nothing). The frame's edge cuts a country in a straight line. Water is not ground;
the classes are decided on land and carried three cells out to sea; specks are absorbed — all as compose.py does. Each side's ground is then HELD
(its own: the Axis set of December 1942, the Allied sets of 1939–42, the Empire of Japan's Japan, Korea, Taiwan, Karafuto and the Kurils; all
Allied ground east of 65°E) or OCCUPIED — the four sets the earlier maps carry. A plate whose fit is not trustworthy (under 25 cities matched — 15 on the Pacific pages, which print fewer — or an
RMS over 9 px, 7 on the Pacific) is NOT read: it is listed in the output's `skipped` with the reason, never guessed.

Needs numpy, scipy and Pillow (outside the repo). Not part of the site."""
import os, sys, json, math, numpy as np
from PIL import Image
from scipy import ndimage as ndi
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import compose as C
from georef import georef, circles, PROJ
from cities import EUROPE, PACIFIC

REF = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "years.json")))
def job_of(year, img):
    for p in REF[year]["plates"]:
        if p["img"].endswith(img): return p
    raise KeyError(img)
# the reference pages of each printed base (years.json gives each its ten hand-placed seeds)
BASES = {
    "eur1": {"proj": "aeqd", "cities": EUROPE, "ref": job_of("1944", "p-076.png"), "pages": range(10, 77, 2), "rule": "pdf"},
    "eur2": {"proj": "aeqd", "cities": EUROPE, "ref": job_of("1944", "p-082.png"), "pages": range(78, 101, 2), "rule": "pdf"},
    "pac":  {"proj": "merc", "cities": PACIFIC, "ref": job_of("1944", "p-083.png"), "pages": list(range(11, 100, 2)) + list(range(101, 107)), "rule": "pdf"},
}
EXCL = [[0, 0, 2000, 178], [0, 1380, 2000, 2000]]
PAC_INSET = [[0, 1050, 310, 1360]]   # the locator inset on the later Pacific pages (p-083's own box)

def date_of(page):
    """the date a page's plate stands for: Germany (even, 10–100) and Japan (odd, 11–99) n half-months after 1 July 1943; pages 101–106 explicit"""
    if page >= 101: return ["1945-06-01", "1945-06-15", "1945-07-01", "1945-07-15", "1945-08-01", "1945-08-15"][page - 101]
    n = (page - 10) // 2 if page % 2 == 0 else (page - 11) // 2
    m = 6 + n // 2          # months after January 1943: July 1943 is 6
    y, mo = 1943 + m // 12, m % 12 + 1
    return "%04d-%02d-%02d" % (y, mo, 1 if n % 2 == 0 else 15)

def fit_cache(base):
    b = BASES[base]
    if "info" not in b:
        ref = b["ref"]; b["info"] = georef(ref["img"], ref["proj"], b["cities"], ref["guesses"], 20)
    return b["info"]

def seed_by_vote(img, base):
    """guesses {city: (x, y)} for a new page of `base`: the reference transform, moved by the shift and scale most city rings agree on"""
    b = BASES[base]; ref = fit_cache(base); f = PROJ[b["proj"]][0]
    gray = np.asarray(Image.open(img).convert("L")).astype(float)
    cand, _ = circles(gray)
    H, W = gray.shape; c0 = complex(W / 2, H / 2)
    a = complex(*ref["a"]); bb = complex(*ref["b"])
    names = list(b["cities"]); Z = np.array([a * complex(*f(*b["cities"][n])) + bb for n in names])
    best = (-1, None)
    for k in np.arange(0.93, 1.0701, 0.01):
        Zk = c0 + k * (Z - c0)
        # keep the cities that lie on the page
        on = (Zk.real > 20) & (Zk.real < W - 20) & (Zk.imag > 200) & (Zk.imag < H - 200)
        if on.sum() < 8: continue
        dx = (cand[:, 0][None, :] - Zk[on].real[:, None]).ravel(); dy = (cand[:, 1][None, :] - Zk[on].imag[:, None]).ravel()
        m = (np.abs(dx) < 280) & (np.abs(dy) < 280)
        if not m.any(): continue
        hist, xe, ye = np.histogram2d(dx[m], dy[m], bins=[np.arange(-280, 281, 3), np.arange(-280, 281, 3)])
        # smooth over one bin each way: a ring's centre is found to ±1 px
        hist = ndi.uniform_filter(hist, size=2) * 4
        i, j = np.unravel_index(np.argmax(hist), hist.shape); sc = hist[i, j]
        if sc > best[0]: best = (sc, (k, (xe[i] + xe[i + 1]) / 2, (ye[j] + ye[j + 1]) / 2))
    k, ox, oy = best[1]
    Zk = c0 + k * (Z - c0) + complex(ox, oy)
    guesses = {}
    for n, z in zip(names, Zk):
        if not (20 < z.real < W - 20 and 200 < z.imag < H - 200): continue
        d = np.hypot(cand[:, 0] - z.real, cand[:, 1] - z.imag); i = int(np.argmin(d))
        if d[i] <= 6: guesses[n] = (float(cand[i, 0]), float(cand[i, 1]))
    return guesses, best[0], k

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    C.WORK = args[0]; out = args[1]
    only = None
    for a in sys.argv[1:]:
        if a.startswith("--only="): only = set(a[7:].split(","))
    rd = lambda f: json.load(open(os.path.join(C.WORK, f)))
    WORLD, LAKES = rd("world-rings.json"), rd("lakes.json")
    land = C.grid_poly([r for c in WORLD for r in c])
    homes = {"eur": rd("homes-eur.json"), "pac": rd("homes-pac.json")}
    axisHome = C.grid_poly(homes["eur"]["axis"]) | C.grid_poly(homes["pac"]["axis"])
    alliedHome = C.grid_poly(homes["eur"]["allied"]) | (C.LON >= 65)
    band = ndi.binary_dilation(land, iterations=3)
    _, (iy, ix) = ndi.distance_transform_edt(~land, return_indices=True)
    plates, skipped = [], []
    todo = []
    for base, b in BASES.items():
        for page in b["pages"]: todo.append((page, base))
    todo.sort()
    for page, base in todo:
        name = "p-%03d" % page
        if only and name not in only: continue
        b = BASES[base]; img = "pdfp/%s.png" % name; date = date_of(page)
        if not os.path.exists(os.path.join(C.WORK, img)): skipped.append({"page": page, "date": date, "why": "page image missing"}); continue
        guesses, votes, k = seed_by_vote(os.path.join(C.WORK, img), base)
        if len(guesses) < 6: skipped.append({"page": page, "date": date, "why": "seed: %d city rings agree (vote %.0f)" % (len(guesses), votes)}); print(name, date, "SKIPPED: seed", len(guesses)); continue
        names = sorted(guesses, key=lambda n: 0)[:10]
        job = {"img": img, "proj": b["proj"], "rule": b["rule"], "date": date, "guesses": {n: guesses[n] for n in names},
               "exclude": EXCL + (PAC_INSET if base == "pac" and page >= 81 else []), "hole_px": 3000 if base == "eur1" else 400}
        if page == 106: job["rule"] = "pdf-final"
        try:
            info, side, frame = C.plate_sides(job, WORLD, LAKES)
        except Exception as e:
            skipped.append({"page": page, "date": date, "why": "read failed: %s" % e}); print(name, date, "SKIPPED:", e); continue
        scale = abs(complex(*info["a"]))
        rms_km = info["rms"] * 6371.0 / scale / (1.0 if b["proj"] == "aeqd" else 1.0 / math.cos(math.radians(30)))
        if info["n"] < (15 if base == "pac" else 25) or info["rms"] > (7 if base == "pac" else 9):   # the Pacific list is shorter (the ocean prints fewer city rings): 24–26 matched is its normal
            skipped.append({"page": page, "date": date, "why": "fit: %d cities, RMS %.1f px" % (info["n"], info["rms"])}); print(name, date, "SKIPPED: fit", info["n"], info["rms"]); continue
        v, ok = C.to_grid(info, side, frame)
        cur = np.zeros((C.GH, C.GW), np.int8); cur[ok] = v[ok]
        lab = np.zeros((C.GH, C.GW), np.int8)
        lab[(cur == 1) & axisHome] = 1; lab[(cur == 1) & ~axisHome] = 2
        lab[(cur == 2) & alliedHome] = 3; lab[(cur == 2) & ~alliedHome] = 4
        lab = np.where(land & ok, lab, 0); lab = np.where(band & ok, lab[iy, ix], 0)
        for _ in range(2):
            for kk in range(0, 5):
                l, n = ndi.label((lab == kk) & band & ok)
                if not n: continue
                sz = ndi.sum(np.ones_like(l), l, range(1, n + 1)); objs = ndi.find_objects(l)
                for i in np.nonzero(sz < (300 if kk == 0 else 150))[0]:
                    o = objs[i]; ys = slice(max(0, o[0].start - 1), o[0].stop + 1); xs = slice(max(0, o[1].start - 1), o[1].stop + 1)
                    comp = l[ys, xs] == i + 1; ring = ndi.binary_dilation(comp) & ~comp
                    if not (band & ok)[ys, xs][ring].all(): continue
                    vals = lab[ys, xs][ring]
                    if vals.size: lab[ys, xs][comp] = np.bincount(vals, minlength=5).argmax()
        sets = []
        for kk in range(1, 5):
            m = ndi.binary_opening(lab == kk, iterations=1)
            l, n = ndi.label(m)
            if n:
                sz = ndi.sum(m, l, range(1, n + 1)); m = np.isin(l, [i + 1 for i, s in enumerate(sz) if s >= 12])
            rings = []
            for r in C.trace(m, 1):
                ll = [(C.LON0 + x * C.R, C.LAT1 - yy * C.R) for x, yy in r]
                ll = C.dp(ll + [ll[0]], 0.06)[:-1]
                if len(ll) >= 4: rings.append([[round(p[0], 2), round(p[1], 2)] for p in ll])
            sets.append(rings)
        plates.append({"page": page, "date": date, "theatre": "pac" if base == "pac" else "eur", "base": base, "rule": job["rule"],
                       "fit": {"cities": info["n"], "rms_px": round(info["rms"], 2), "rms_km": round(rms_km, 1), "scale": round(scale, 1), "seed_votes": float(votes), "seed_scale": round(float(k), 3)},
                       "cells": int(ok.sum()), "sets": sets})
        print(name, date, base, "fit", info["n"], "RMS", round(info["rms"], 2), "px ≈", round(rms_km, 1), "km; rings", [len(s) for s in sets], "points", sum(len(r) for s in sets for r in s), flush=True)
    json.dump({"plates": plates, "skipped": skipped}, open(out, "w"))

if __name__ == "__main__": main()
