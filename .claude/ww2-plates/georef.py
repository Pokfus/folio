"""georef.py — fit a plate of the US Army's WWII battle-front atlas to the globe.

The atlas states its projections: the war against Germany on an azimuthal equidistant projection centred on
Berlin (two bases: the whole of Europe to 15 Nov 1944, an enlarged central section from 1 Dec 1944), the war
against Japan on Mercator. A plate is that projection under a similarity transform (scale, rotation,
shift) in pixels, fitted to the printed city rings: `circles` finds ring-shaped marks, `georef` snaps each
named city (cities.py) to the nearest mark from seed guesses and refits, dropping outliers, four times.
`seed_by_vote` finds a plate's transform with no guesses at all (every city-and-mark pair votes for the shift
it implies, over a range of scales), for a new plate; the jobs in years.json carry the guesses it led to.

Needs numpy, scipy and Pillow (outside the repo). Not part of the site."""
import sys, json, math, numpy as np
from PIL import Image
from scipy import ndimage as ndi

def aeqd(lon, lat, lon0=13.405, lat0=52.52):
    l, p, l0, p0 = map(math.radians, (lon, lat, lon0, lat0))
    c = math.acos(max(-1, min(1, math.sin(p0)*math.sin(p) + math.cos(p0)*math.cos(p)*math.cos(l-l0))))
    k = c/math.sin(c) if c > 1e-9 else 1
    return k*math.cos(p)*math.sin(l-l0), -k*(math.cos(p0)*math.sin(p) - math.sin(p0)*math.cos(p)*math.cos(l-l0))
def aeqd_inv(x, y, lon0=13.405, lat0=52.52):
    y = -y; p0 = math.radians(lat0); c = math.hypot(x, y)
    if c < 1e-12: return lon0, lat0
    lat = math.asin(math.cos(c)*math.sin(p0) + y*math.sin(c)*math.cos(p0)/c)
    lon = math.radians(lon0) + math.atan2(x*math.sin(c), c*math.cos(p0)*math.cos(c) - y*math.sin(p0)*math.sin(c))
    return math.degrees(lon), math.degrees(lat)
def merc(lon, lat): return math.radians(lon), -math.log(math.tan(math.pi/4 + math.radians(lat)/2))
def merc_inv(x, y): return math.degrees(x), math.degrees(2*math.atan(math.exp(-y)) - math.pi/2)

PROJ = {"aeqd": (aeqd, aeqd_inv), "merc": (merc, merc_inv)}

def circles(gray):
    # stretch to the full range: the CARL PDF's pages are washed out, and its city rings fall under the threshold
    lo, hi = np.percentile(gray, 0.5), np.percentile(gray, 99.5)
    gray = np.clip((gray - lo) * 255.0 / max(1.0, hi - lo), 0, 255)
    yy, xx = np.mgrid[-7:8, -7:8]; rr = np.hypot(xx, yy)
    ring = ((rr >= 3.0) & (rr <= 5.0)).astype(float); ring /= ring.sum()
    core = (rr < 2.0).astype(float); core /= core.sum()
    sc = ndi.correlate(gray, core) - ndi.correlate(gray, ring)
    mx = ndi.maximum_filter(sc, size=9)
    ys, xs = np.nonzero((sc == mx) & (sc > 45))
    return np.c_[xs, ys].astype(float), sc

def fit_sim(P, Q):
    p = P[:, 0] + 1j*P[:, 1]; q = Q[:, 0] + 1j*Q[:, 1]
    A = np.c_[p, np.ones_like(p)]; sol, *_ = np.linalg.lstsq(A, q, rcond=None)
    return sol, np.abs(A @ sol - q)

def georef(img, proj, cities, guesses, radius=25, out=None):
    gray = np.asarray(Image.open(img).convert("L")).astype(float)
    cand, _ = circles(gray)
    f = PROJ[proj][0]
    names = list(guesses)
    P = np.array([f(*cities[n]) for n in names]); Q = np.array([guesses[n] for n in names], float)
    sol, res = fit_sim(P, Q)
    for it in range(4):
        pairs = []
        for n, ll in cities.items():
            z = sol[0]*complex(*f(*ll)) + sol[1]
            d = np.hypot(cand[:, 0]-z.real, cand[:, 1]-z.imag); i = int(np.argmin(d))
            if d[i] <= (radius if it == 0 else 12): pairs.append((n, cand[i]))
        if len(pairs) < 4: break
        P = np.array([f(*cities[n]) for n, _ in pairs]); Q = np.array([c for _, c in pairs])
        sol, res = fit_sim(P, Q)
        # drop the worst outliers and refit
        keep = res < max(6, 2.5*np.median(res))
        if keep.sum() >= 4 and (~keep).any():
            pairs = [p for p, k in zip(pairs, keep) if k]
            P = np.array([f(*cities[n]) for n, _ in pairs]); Q = np.array([c for _, c in pairs]); sol, res = fit_sim(P, Q)
    rms = float(np.sqrt((res**2).mean()))
    info = {"img": img, "proj": proj, "a": [sol[0].real, sol[0].imag], "b": [sol[1].real, sol[1].imag], "n": len(pairs), "rms": rms,
            "pairs": {n: [float(c[0]), float(c[1]), float(r)] for (n, c), r in zip(pairs, res)}}
    if out: json.dump(info, open(out, "w"), indent=1)
    return info
