"""plates.py — reading a plate's colours, and drawing lon/lat rings onto it.

`classify` reads the atlas's fills: Allied ground PINK, Axis ground the paper's WHITE, neutral countries
GREY. Two sources of the same public-domain plates differ in colour, so there are rules for each: "commons"
(the Wikimedia Commons scans, full-strength colour), "pdf" (the 150-ppi PDF of the whole atlas, washed out,
where pink is only a little redder than paper) and "pdf-final" (the last plate, 15 Aug 1945, which draws the
ground surrendered by Japan in its own MEDIUM red; its deep red is the Soviet advance). Thresholds were read
off the plates themselves, sampled at known places (sea, Germany, Switzerland, Sweden, Turkey).

Needs numpy, scipy and Pillow (outside the repo). Not part of the site."""
import math, numpy as np
from PIL import Image, ImageDraw
from georef import PROJ

def classify(rgb, rule="commons"):
    R, G, B = [rgb[..., i].astype(int) for i in range(3)]
    if rule == "pdf":        # the CARL PDF's washed-out pages: pink is only a little redder than paper
        allied = (R - G >= 10) & (R - B >= 18)
        # neutral grey: greyer than paper, and not the sea's green tint (G − R ≥ 5)
        neutral = (G - R > -8) & (G - R < 4) & (np.abs(G - B) < 12) & (R > 105) & (R < 166)
        return allied, neutral, None
    if rule == "pdf-final":  # 15 Aug 1945: light pink = Allied control, MEDIUM red = territory surrendered by Japan, deep red = Soviet gains
        medium = (R - G >= 33) & (R >= 140)
        allied = (R - G >= 10) & (R - B >= 18) & ~medium
        neutral = (G - R > -8) & (G - R < 4) & (np.abs(G - B) < 12) & (R > 105) & (R < 166)
        return allied, neutral, medium
    allied = (R > 140) & (R - G > 40) & (R - B > 30)
    neutral = (np.abs(R - G) < 12) & (np.abs(G - B) < 14) & (R > 130) & (R < 218)
    return allied, neutral, None

def dp(pts, tol):
    if len(pts) < 3: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True; st = [(0, len(pts) - 1)]
    while st:
        a, b = st.pop(); ax, ay = pts[a]; dx, dy = pts[b][0] - ax, pts[b][1] - ay; L = dx * dx + dy * dy; best, bd = -1, tol * tol
        for i in range(a + 1, b):
            px, py = pts[i][0] - ax, pts[i][1] - ay
            if L: t = max(0, min(1, (px * dx + py * dy) / L)); px -= t * dx; py -= t * dy
            d = px * px + py * py
            if d > bd: bd, best = d, i
        if best >= 0: keep[best] = True; st += [(a, best), (best, b)]
    return [p for p, k in zip(pts, keep) if k]

def to_pixels(info, ring):
    """lon/lat ring -> plate pixels, or None where the projection cannot hold it (far side of the globe)"""
    a = complex(*info["a"]); b = complex(*info["b"]); f = PROJ[info["proj"]][0]
    out = []
    for lo, la in ring:
        if info["proj"] == "aeqd":
            if math.degrees(math.acos(max(-1, min(1, math.sin(math.radians(52.52)) * math.sin(math.radians(la)) + math.cos(math.radians(52.52)) * math.cos(math.radians(la)) * math.cos(math.radians(lo - 13.405)))))) > 75: return None
        else:
            if lo < -100: lo += 360          # the Pacific plates run past 180°E
            la = max(-80, min(80, la))
        z = a * complex(*f(lo, la)) + b; out.append((z.real, z.imag))
    xs = [p[0] for p in out]
    if max(xs) - min(xs) > 20000: return None
    return out

def raster(info, rings, W, H):
    im = Image.new("1", (W, H), 0); d = ImageDraw.Draw(im)
    for r in rings or []:
        if len(r) < 3: continue
        px = to_pixels(info, r)
        if px: d.polygon(px, fill=1)
    return np.asarray(im, bool)
