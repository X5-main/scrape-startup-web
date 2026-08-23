#!/usr/bin/env python3
"""Row-wise pixel parity between two Chrome-native PNGs (stdlib only).
Usage: d31_pxdiff.py a.png b.png
Reports % byte-identical rows, differing-row bands (500-row buckets), and per-row
mean/max RGB delta for differing rows."""
import struct, sys, zlib

def decode(path):
    data = open(path, "rb").read()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", "not png"
    pos, idat, w = 8, b"", None
    while pos < len(data):
        ln, typ = struct.unpack(">I4s", data[pos:pos + 8])
        chunk = data[pos + 8:pos + 8 + ln]
        if typ == b"IHDR":
            w, h, bd, ct, comp, filt, inter = struct.unpack(">IIBBBBB", chunk)
            assert bd == 8, f"bitdepth {bd}"
            assert ct in (2, 6), f"colortype {ct} (want RGB/RGBA)"
            assert inter == 0, "interlaced unsupported"
            bpp = 3 if ct == 2 else 4
            stride = w * bpp
        elif typ == b"IDAT":
            idat += chunk
        elif typ == b"IEND":
            break
        pos += 12 + ln
    raw = zlib.decompress(idat)
    rows, prev, off = [], bytearray(stride), 0
    for _ in range(h):
        ft = raw[off]; off += 1
        line = bytearray(raw[off:off + stride]); off += stride
        if ft == 1:
            for i in range(bpp, stride): line[i] = (line[i] + line[i - bpp]) & 255
        elif ft == 2:
            for i in range(stride): line[i] = (line[i] + prev[i]) & 255
        elif ft == 3:
            for i in range(stride):
                a = line[i - bpp] if i >= bpp else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 255
        elif ft == 4:
            for i in range(stride):
                a = line[i - bpp] if i >= bpp else 0
                b = prev[i]
                c = prev[i - bpp] if i >= bpp else 0
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 255
        rows.append(bytes(line))
        prev = line
    return w, rows

wa, ra = decode(sys.argv[1])
wb, rb = decode(sys.argv[2])
assert wa == wb and len(ra) == len(rb), f"dims differ {wa}x{len(ra)} vs {wb}x{len(rb)}"

ident = sum(1 for a, b in zip(ra, rb) if a == b)
n = len(ra)
print(f"{sys.argv[1]} vs {sys.argv[2]}: {wa}px wide x {n} rows")
print(f"byte-identical rows: {ident}/{n} = {100.0 * ident / n:.1f}%")

bands = {}
for i, (a, b) in enumerate(zip(ra, rb)):
    if a == b:
        continue
    diffs = [abs(x - y) for x, y in zip(a, b) if abs(x - y) > 8]
    if not diffs:
        continue
    k = i // 500 * 500
    m = sum(diffs) / len(diffs)
    bands.setdefault(k, []).append((m, max(diffs)))
for k in sorted(bands):
    ms = [x[0] for x in bands[k]]
    print(f"  rows {k}-{k+499}: n_diff={len(ms)} mean_delta={sum(ms)/len(ms):.1f}/255 max_delta={max(x[1] for x in bands[k])}/255")
