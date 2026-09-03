#!/usr/bin/env python3
"""contact-sheet.py — tile a fetched image batch into one sheet, so every picture in it can be LOOKED AT.

    python3 .claude/contact-sheet.py <batch.json> <out.png> [--cols=5] [--cell=300]

The standing rule for every image helper here is that a candidate is read by eye before it is applied —
"a name match is confidently wrong in exactly the way this site must not be" — and that rule does not
scale past a handful of files one at a time. A sheet does: fifty thumbnails, each captioned with its card
id and the subject it is CLAIMED to be, is one picture to read, and a wrong one shows up instantly (a
photograph of New York captioned "geo-525 Phoenix" is not subtle).

Downloads through Special:FilePath, which serves the file when upload.wikimedia.org is rate-limiting.
Not part of the site.
"""
import json, sys, io, os, re, urllib.parse, urllib.request
from PIL import Image, ImageDraw

args = [a for a in sys.argv[1:] if not a.startswith("--")]
opts = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
if len(args) < 2:
    sys.exit("usage: contact-sheet.py <batch.json> <out.png> [--cols=5] [--cell=300]")
COLS = int(opts.get("cols", 5)); CELL = int(opts.get("cell", 300)); CAP = 26
batch = json.load(open(args[0], encoding="utf-8"))
cards = batch.get("cards", batch)
UA = {"User-Agent": "folio-dev/1.0 (contact sheet)"}

def grab(src, name):
    cache = os.path.join("/tmp/folio-cs", re.sub(r"[^A-Za-z0-9._-]", "_", name)[:110] + ".img")
    os.makedirs("/tmp/folio-cs", exist_ok=True)
    if os.path.exists(cache) and os.path.getsize(cache) > 800:
        return open(cache, "rb").read()
    # the file name out of the URL, fetched through Special:FilePath at a small width
    m = re.search(r"/([^/]+)$", src)
    fn = urllib.parse.unquote(m.group(1)) if m else ""
    fn = re.sub(r"^\d+px-", "", fn)
    urls = ["https://commons.wikimedia.org/wiki/Special:FilePath/" + urllib.parse.quote(fn) + "?width=%d" % (CELL * 2), src]
    for u in urls:
        try:
            with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40) as r:
                b = r.read()
            if len(b) > 800:
                open(cache, "wb").write(b); return b
        except Exception:
            continue
    return None

ids = list(cards.keys())
rows = (len(ids) + COLS - 1) // COLS
sheet = Image.new("RGB", (COLS * CELL, rows * (CELL + CAP)), "#1b1a17")
d = ImageDraw.Draw(sheet)
missing = []
for i, cid in enumerate(ids):
    e = cards[cid]
    x = (i % COLS) * CELL; y = (i // COLS) * (CELL + CAP)
    b = grab(e.get("src", ""), cid + "-" + e.get("title", ""))
    if b:
        try:
            im = Image.open(io.BytesIO(b)).convert("RGB")
            im.thumbnail((CELL - 6, CELL - 6))
            sheet.paste(im, (x + (CELL - im.width) // 2, y + (CELL - im.height) // 2))
        except Exception as ex:
            missing.append((cid, str(ex))); d.rectangle([x+4, y+4, x+CELL-4, y+CELL-4], outline="#c8453c", width=2)
    else:
        missing.append((cid, "download failed")); d.rectangle([x+4, y+4, x+CELL-4, y+CELL-4], outline="#c8453c", width=2)
    d.text((x + 6, y + CELL + 6), (cid + "  " + str(e.get("title", "")))[:44], fill="#f2efe6")
sheet.save(args[1])
print("wrote %s  (%d cells, %d cols)" % (args[1], len(ids), COLS))
for m in missing:
    print("  missing:", m[0], m[1])
