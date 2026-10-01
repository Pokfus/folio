"""ringtrace.py — a binary mask's boundaries as rings (outer rings and holes), exact at diagonal pinch points."""
import numpy as np
from collections import defaultdict
RIGHT = {(1, 0): (0, 1), (0, 1): (-1, 0), (-1, 0): (0, -1), (0, -1): (1, 0)}
LEFT = {v: k for k, v in RIGHT.items()}
def trace(mask, step=1):
    """every boundary of a binary mask (outer rings and holes) as closed rings of pixel-corner coordinates.
    Boundary edges run with the ground on their right (y down); where two cells touch only at a corner the
    walk turns right, so they come out as separate rings rather than one ring crossing itself."""
    m = mask[::step, ::step]; H, W = m.shape
    p = np.pad(m, 1)
    out = defaultdict(list)
    ys, xs = np.nonzero(m)
    for y, x in zip(ys.tolist(), xs.tolist()):
        if not p[y, x + 1]: out[(x, y)].append((1, 0))          # top edge, east
        if not p[y + 1, x + 2]: out[(x + 1, y)].append((0, 1))  # right edge, south
        if not p[y + 2, x + 1]: out[(x + 1, y + 1)].append((-1, 0))  # bottom edge, west
        if not p[y + 1, x]: out[(x, y + 1)].append((0, -1))     # left edge, north
    rings = []
    for v0 in list(out):
        while out.get(v0):
            d = out[v0].pop(); v = v0; ring = [v0]
            while True:
                v = (v[0] + d[0], v[1] + d[1])
                if v == v0: break
                opts = out.get(v)
                ring.append(v)
                if not opts: break
                for nd in (RIGHT[d], d, LEFT[d]):
                    if nd in opts: opts.remove(nd); d = nd; break
                else:
                    d = opts.pop()
            # drop collinear corners
            r = [q for i, q in enumerate(ring) if not ((ring[i - 1][0] == q[0] == ring[(i + 1) % len(ring)][0]) or (ring[i - 1][1] == q[1] == ring[(i + 1) % len(ring)][1]))]
            if len(r) >= 4: rings.append([(x * step, y * step) for x, y in r])
    return rings
