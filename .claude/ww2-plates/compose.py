"""compose.py — the Second World War's fronts for 1943, 1944 and 1945, one map a year, from the plates of
the US Army's "Atlas of the World Battle Fronts in Semimonthly Phases to August 15, 1945" (public domain:
PD-USGov-Military-Army; Wikimedia Commons, Category:WW2 Battlefront Atlas, and the whole atlas as a 150-ppi
PDF from the Combined Arms Research Library, https://cgsc.contentdm.oclc.org/digital/collection/p4013coll8/id/3173/).

    python3 .claude/ww2-plates/compose.py <workdir> <out.json>

`years.json` (beside this file) names, for each year, the plates it is built from — a wide plate first, a
detailed one over it — with each plate's projection, the seed positions of a few of its city rings, its
colour rule and the parts of the page that are not map (the header, the caption, an inset). The plates are
not in the repo: put them in <workdir> at the paths years.json gives (PDF pages rendered with
`pdftoppm -r 150 -f N -l N -png atlas.pdf pdfp/p`), and run `node .claude/ww2-plates/prep.js <control-dir>
<workdir>` first for the coast, lakes and 1942 map this reads.

HOW A YEAR IS BUILT, on a 0.1° lon/lat grid:
  · each plate is fitted (georef.py) and read (plates.py): Allied pink, Axis white, neutral grey. Water is not
    ground — by its tint, by world.js's coast (3 px in from it, the fit's error) and by lakes.js — so every
    water pixel takes the class of the nearest solid ground; a paper-white lake walled in by one other class
    takes that class.
  · inside a plate's frame the plate decides; outside every frame of the year the previous year carries on
    (1942's map from the vector source for 1943), except inside the year's `hand_back` boxes, where Axis
    ground no plate shows is ground it had lost (the Caucasus and North Africa in 1943, Lapland in 1944 —
    each named, never a default, because the frames also leave out ground the Axis still held).
  · each side's ground is then HELD (its own: the Axis set of December 1942, the Allied sets of 1939–42, the
    Empire of Japan's Japan, Korea, Taiwan, Karafuto and the Kurils; all Allied ground east of 65°E) or
    OCCUPIED — the four sets fronts.js carries.
  · classes are decided on land and carried three cells out to sea, so a ring's edge along a coast lies
    offshore where the atlas's land clip hides it; walled-in specks are absorbed; rings are traced exactly
    (ringtrace.py) and simplified at 0.06°.

KNOWN LIMITS — the source's and this method's: a plate is the situation on its DATE (years.json `date`), not
on 31 December; 1945 is the last plates (1 May in Europe, 15 Aug in the Pacific), the fronts at the
surrenders. Where a plate's frame cuts through a country (the USSR beyond Moscow; Siberia on the Pacific
plates) the cut is a straight line. Pockets under ~10,000 km² walled in by the other side (Budapest,
Breslau) are absorbed. Neutral ground carries no ring.

Needs numpy, scipy and Pillow (outside the repo). Not part of the site."""
import os, sys, json, math, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from georef import georef
from cities import EUROPE, PACIFIC
from plates import classify, dp, raster
from ringtrace import trace

WORK = "."
LON0, LAT1, R = -30.0, 80.0, 0.1
GW, GH = int((180 - LON0) / R), int((LAT1 + 50) / R)
gx = LON0 + (np.arange(GW) + 0.5) * R; gy = LAT1 - (np.arange(GH) + 0.5) * R
LON, LAT = np.meshgrid(gx, gy)

def grid_poly(rings):
    im = Image.new("1", (GW, GH), 0); d = ImageDraw.Draw(im)
    for r in rings or []:
        if len(r) >= 3: d.polygon([((p[0] - LON0) / R, (LAT1 - p[1]) / R) for p in r], fill=1)
    return np.asarray(im, bool)

def fit_for(job):
    return georef(os.path.join(WORK, job["img"]), job["proj"], EUROPE if job["proj"] == "aeqd" else PACIFIC, job["guesses"], 20)

def plate_sides(job, WORLD, LAKES):
    """the plate as Axis (1) / Allied (2) / neither (0) on its own pixels, and its frame"""
    info = fit_for(job)
    rgb = np.asarray(Image.open(os.path.join(WORK, job["img"])).convert("RGB"))
    allied, neutral, axis_colour = classify(rgb, job.get("rule", "commons"))
    H, W = allied.shape
    frame = np.ones((H, W), bool)
    frame[:16, :] = frame[-16:, :] = False; frame[:, :16] = frame[:, -16:] = False   # the page's own edge is shaded
    # SEA AND LAKES, by their green tint (the plates tint water a little greener than paper); they are not
    # ground, so each takes the class of the nearest land pixel — a lake inside a front's ground is that ground
    R_, G_, B_ = [rgb[..., i].astype(int) for i in range(3)]
    sea = (G_ - R_ >= 5) & (G_ - B_ >= 5) & ~allied
    # …and where the tint fails (the top of some PDF pages, where water is as pale as paper), the world's own
    # coast and lakes, projected onto the plate: off land, or in a lake, or within 3 px of a coast (the
    # registration's error), a pixel is not read at all
    sea |= ~ndi.binary_erosion(raster(info, [r for c in WORLD for r in c], W, H), iterations=3)
    sea |= raster(info, LAKES, W, H)
    for (x0, y0, x1, y1) in job.get("exclude", []): frame[y0:y1, x0:x1] = False
    allied = ndi.binary_opening(ndi.binary_closing(allied, iterations=3), iterations=2) & frame
    neutral = ndi.binary_opening(ndi.binary_closing(neutral, iterations=2), iterations=3) & frame
    axis = (axis_colour & frame) if axis_colour is not None else (frame & ~allied & ~neutral & ~sea)
    if axis_colour is not None: axis = ndi.binary_closing(axis, iterations=3)
    axis = ndi.binary_opening(axis, iterations=2)
    side = np.zeros((H, W), np.int8)
    for v, m in ((1, axis), (2, allied)):
        # a hole under ~400 px is a LABEL or a city ring punched into the fill, not ground of the other side
        hl, hn = ndi.label(ndi.binary_fill_holes(m) & ~m)
        if hn:
            hs = ndi.sum(np.ones_like(m), hl, range(1, hn + 1))
            m = m | np.isin(hl, [i + 1 for i, s in enumerate(hs) if s < 400])
        side[m & (side == 0)] = v
    # PAPER-WHITE LAKES: on a page whose water is untinted, a lake reads as the enemy's white. A white patch
    # walled in by a single other class (Allied pink, or a neutral's grey), under the job's `hole_px`, is that
    # class. (A real pocket — Budapest, Breslau — is far smaller than the Finnish lakes this is for, but the
    # cap is per page and stays at 400 px wherever no lake needs more.)
    cap = job.get("hole_px", 400)
    l, n = ndi.label(side == 1)
    if n:
        sz = ndi.sum(np.ones_like(l), l, range(1, n + 1)); objs = ndi.find_objects(l)
        for i in np.nonzero(sz < cap)[0]:
            o = objs[i]; ys = slice(max(0, o[0].start - 2), o[0].stop + 2); xs = slice(max(0, o[1].start - 2), o[1].stop + 2)
            comp = l[ys, xs] == i + 1; ring = ndi.binary_dilation(comp, iterations=2) & ~comp
            sv = side[ys, xs][ring]; nv = neutral[ys, xs][ring]
            if (sv == 2).mean() > 0.9: side[ys, xs][comp] = 2
            elif ((sv == 0) & nv).mean() > 0.9: side[ys, xs][comp] = 0; neutral[ys, xs][comp] = True
    # fill from KNOWN ground only: a side's own colour or a neutral country's solid grey, each opened or eroded
    # so that a lake's outline (ink, which reads as either) is not one — never from water
    known = (ndi.binary_opening(side == 1, iterations=3) | ndi.binary_opening(side == 2, iterations=3) | ndi.binary_erosion(neutral, iterations=4)) & ~sea
    _, (iy, ix) = ndi.distance_transform_edt(~known, return_indices=True)
    side = side[iy, ix]
    return info, side, frame

def to_grid(info, side, frame):
    """resample a plate onto the lon/lat grid: (values, covered)"""
    a = complex(*info["a"]); b = complex(*info["b"])
    lam, phi = np.radians(LON), np.radians(LAT)
    ok = np.ones(LON.shape, bool)
    if info["proj"] == "aeqd":
        l0, p0 = math.radians(13.405), math.radians(52.52)
        cc = np.clip(math.sin(p0) * np.sin(phi) + math.cos(p0) * np.cos(phi) * np.cos(lam - l0), -1, 1); c = np.arccos(cc)
        k = np.where(c > 1e-9, c / np.sin(np.maximum(c, 1e-9)), 1.0)
        x = k * np.cos(phi) * np.sin(lam - l0); y = -k * (math.cos(p0) * np.sin(phi) - math.sin(p0) * np.cos(phi) * np.cos(lam - l0))
        ok &= np.degrees(c) < 75
    else:
        x = lam; y = -np.log(np.tan(math.pi / 4 + np.clip(phi, -1.39, 1.39) / 2))
    z = a * (x + 1j * y) + b
    px = np.round(z.real).astype(int); py = np.round(z.imag).astype(int)
    H, W = side.shape
    ok &= (px >= 0) & (px < W) & (py >= 0) & (py < H)
    pxc, pyc = np.clip(px, 0, W - 1), np.clip(py, 0, H - 1)
    ok &= frame[pyc, pxc]
    return np.where(ok, side[pyc, pxc], 0).astype(np.int8), ok

def main():
    global WORK
    WORK = sys.argv[1]; out = sys.argv[2]
    rd = lambda f: json.load(open(os.path.join(WORK, f)))
    cfg = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "years.json")))
    base, WORLD, LAKES = rd("base-1942-12.json"), rd("world-rings.json"), rd("lakes.json")
    land = grid_poly([r for c in WORLD for r in c])
    homes = {"eur": rd("homes-eur.json"), "pac": rd("homes-pac.json")}
    axisHome = grid_poly(homes["eur"]["axis"]) | grid_poly(homes["pac"]["axis"])
    alliedHome = grid_poly(homes["eur"]["allied"]) | (LON >= 65)
    # the 1942 map the plates carry on from
    cur = np.zeros((GH, GW), np.int8)
    cur[grid_poly(base[0] + base[1])] = 1; cur[grid_poly(base[2] + base[3])] = 2
    # beyond the band a few cells out to sea, nothing: the nearest LAND cell's class fills the band
    band = ndi.binary_dilation(land, iterations=3)
    _, (iy, ix) = ndi.distance_transform_edt(~land, return_indices=True)
    res = {}
    for yr in sorted(cfg):
        y = cfg[yr]; covered = np.zeros((GH, GW), bool); nxt = cur.copy()
        for job in y["plates"]:
            info, side, frame = plate_sides(job, WORLD, LAKES)
            v, ok = to_grid(info, side, frame)
            nxt[ok] = v[ok]; covered |= ok
            print(yr, job["img"].split("/")[-1], "fit", info["n"], "RMS", round(info["rms"], 2), "cells", int(ok.sum()))
        # HAND-BACK, only where named: Axis ground on the 1942 map, outside every plate of the year, inside a
        # box the year names as lost (the Caucasus and the Kuban, North Africa) — never by default, since the
        # plates' frames also leave out ground the Axis still held (Finland, northern Norway)
        for x0, y0, x1, y1 in y.get("hand_back", []):
            gone = ~covered & (nxt == 1) & (LON >= x0) & (LON <= x1) & (LAT >= y0) & (LAT <= y1); nxt[gone] = 2
        cur = nxt
        lab = np.zeros((GH, GW), np.int8)
        lab[(cur == 1) & axisHome] = 1; lab[(cur == 1) & ~axisHome] = 2
        lab[(cur == 2) & alliedHome] = 3; lab[(cur == 2) & ~alliedHome] = 4
        lab = np.where(land, lab, 0); lab = np.where(band, lab[iy, ix], 0)
        # SPECKS: a patch under ~150 cells (≈ 10,000 km²) walled in by land (a lake's ink, a label's ghost) takes the class
        # of the ground round it; an island, which touches open sea, keeps its own
        for _ in range(2):
            for k in range(0, 5):
                l, n = ndi.label((lab == k) & band)
                if not n: continue
                sz = ndi.sum(np.ones_like(l), l, range(1, n + 1))
                objs = ndi.find_objects(l)
                # ground of NEITHER side walled in by warring ground is a lake the plate left unread, up to
                # well under Switzerland's ~500 cells (the smallest real neutral enclave this map can show)
                for i in np.nonzero(sz < (300 if k == 0 else 150))[0]:
                    o = objs[i]; ys = slice(max(0, o[0].start - 1), o[0].stop + 1); xs = slice(max(0, o[1].start - 1), o[1].stop + 1)
                    comp = l[ys, xs] == i + 1; ring = ndi.binary_dilation(comp) & ~comp
                    if not band[ys, xs][ring].all(): continue
                    vals = lab[ys, xs][ring]
                    if vals.size: lab[ys, xs][comp] = np.bincount(vals, minlength=5).argmax()
        sets = []
        for k in range(1, 5):
            m = ndi.binary_opening(lab == k, iterations=1)
            l, n = ndi.label(m)
            if n:
                sz = ndi.sum(m, l, range(1, n + 1)); m = np.isin(l, [i + 1 for i, s in enumerate(sz) if s >= 12])
            rings = []
            for r in trace(m, 1):
                ll = [(LON0 + x * R, LAT1 - yy * R) for x, yy in r]
                ll = dp(ll + [ll[0]], 0.06)[:-1]
                if len(ll) >= 4: rings.append([[round(p[0], 2), round(p[1], 2)] for p in ll])
            sets.append(rings)
        res[yr] = sets
        print(yr, "rings per set", [len(s) for s in sets], "points", sum(len(r) for s in sets for r in s))
    res["_dates"] = {yr: [j["date"] for j in cfg[yr]["plates"]] for yr in cfg}
    json.dump(res, open(out, "w"))

if __name__ == "__main__": main()
