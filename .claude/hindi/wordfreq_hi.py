#!/usr/bin/env python3
"""The second frequency source, read from the pinned wordfreq wheel -- C1's ranking.

    load('wordfreq-3.1.1-py3-none-any.whl')  ->  {surface form: frequency per billion words}

WHY A SECOND SOURCE.  The subtitle list (`hi_full.txt`, 21,309 forms) runs out at B2:
its fill words there are counted 5 to 14 times, and the next 1,500 lemmas 2 to 5 times,
which is no frequency at all (`docs/hindi-decks-plan.md` §9).  wordfreq's Hindi list
(Robyn Speer, https://github.com/rspeer/wordfreq) is built from Wikipedia, web text
(ParaCrawl), Twitter and Reddit -- no subtitles -- and keeps every form that occurs
at least once per million words, so it still ranks words where the subtitles cannot.
Its data is CC BY-SA 4.0, the licence of the decks' other sources; the code is
Apache-2.0 and none of it ships (this reads only the data file).

THE FILE.  The wheel is a zip; `wordfreq/data/small_hi.msgpack.gz` inside it is a
gzipped msgpack list in wordfreq's "cBpack" format: a header map, then one list of
words per centibel, the i-th list (from 0) holding the words whose frequency is
10 ** (-i / 100).  Decoded here with a few lines of msgpack, so nothing has to be
installed.
"""
import gzip, io, struct, zipfile

MEMBER = 'wordfreq/data/small_hi.msgpack.gz'


def _unpack(b, i):
    """One msgpack value at offset i -> (value, next offset).  Only the types the file uses."""
    t = b[i]
    if t <= 0x7f:
        return t, i + 1
    if 0x80 <= t <= 0x8f:
        return _map(b, i + 1, t & 0x0f)
    if 0x90 <= t <= 0x9f:
        return _arr(b, i + 1, t & 0x0f)
    if 0xa0 <= t <= 0xbf:
        n = t & 0x1f
        return b[i + 1:i + 1 + n].decode('utf-8'), i + 1 + n
    if t == 0xc0:
        return None, i + 1
    if t in (0xc2, 0xc3):
        return t == 0xc3, i + 1
    if t == 0xcc:
        return b[i + 1], i + 2
    if t == 0xcd:
        return struct.unpack('>H', b[i + 1:i + 3])[0], i + 3
    if t == 0xce:
        return struct.unpack('>I', b[i + 1:i + 5])[0], i + 5
    if t in (0xd9, 0xda, 0xdb):
        w = {0xd9: 1, 0xda: 2, 0xdb: 4}[t]
        n = int.from_bytes(b[i + 1:i + 1 + w], 'big')
        s = i + 1 + w
        return b[s:s + n].decode('utf-8'), s + n
    if t in (0xdc, 0xdd):
        w = 2 if t == 0xdc else 4
        return _arr(b, i + 1 + w, int.from_bytes(b[i + 1:i + 1 + w], 'big'))
    if t in (0xde, 0xdf):
        w = 2 if t == 0xde else 4
        return _map(b, i + 1 + w, int.from_bytes(b[i + 1:i + 1 + w], 'big'))
    raise ValueError(f'msgpack type 0x{t:02x} at {i} is not one this reader knows')


def _arr(b, i, n):
    out = []
    for _ in range(n):
        v, i = _unpack(b, i)
        out.append(v)
    return out, i


def _map(b, i, n):
    out = {}
    for _ in range(n):
        k, i = _unpack(b, i)
        v, i = _unpack(b, i)
        out[k] = v
    return out, i


def load(wheel):
    with zipfile.ZipFile(wheel) as z:
        raw = gzip.decompress(z.read(MEMBER))
    data, end = _unpack(raw, 0)
    if end != len(raw) or not isinstance(data, list) or data[0].get('format') != 'cB':
        raise SystemExit(f'{wheel}: {MEMBER} is not the cBpack this reader expects')
    out = {}
    for cb, words in enumerate(data[1:]):
        f = 1e9 * 10 ** (-cb / 100)          # per billion words
        for w in words:
            out[w] = out.get(w, 0) + f
    return out


if __name__ == '__main__':
    import sys
    d = load(sys.argv[1])
    top = sorted(d.items(), key=lambda kv: -kv[1])
    print(len(d), 'forms;', ' '.join(w for w, _ in top[:20]))
