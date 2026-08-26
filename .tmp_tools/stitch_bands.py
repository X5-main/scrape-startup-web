#!/usr/bin/env python3
"""Stitch viewport-band PNGs (d56_bands.mjs output) into one full-page PNG.

Pure-stdlib PNG decode/encode (no PIL). Handles RGBA/RGB, filter types
0-4. The final band is cropped to the page height recorded in
<banddir>/state.json (the last clip runs past document height; band PNGs
render at device DPR, so the crop accounts for DPR).
Usage: python3 stitch_bands.py <banddir> <out.png>
"""
import glob
import json
import os
import struct
import sys
import zlib
import binascii


def read_png(p):
    d = open(p, "rb").read()
    assert d[:8] == b"\x89PNG\r\n\x1a\n"
    pos = 8
    idat = b""
    w = h = bitd = ct = None
    while pos < len(d):
        ln = struct.unpack(">I", d[pos:pos + 4])[0]
        typ = d[pos + 4:pos + 8]
        data = d[pos + 8:pos + 8 + ln]
        if typ == b"IHDR":
            w, h, bitd, ct = struct.unpack(">IIBB", data[:10])
        elif typ == b"IDAT":
            idat += data
        elif typ == b"IEND":
            break
        pos += 12 + ln
    raw = zlib.decompress(idat)
    ch = 3 if ct == 2 else (4 if ct == 6 else 1)
    stride = w * ch
    out = bytearray()
    prev = bytearray(stride)
    p = 0
    for _ in range(h):
        f = raw[p]
        p += 1
        line = bytearray(raw[p:p + stride])
        p += stride
        if f == 1:
            for i in range(ch, stride):
                line[i] = (line[i] + line[i - ch]) & 255
        elif f == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 255
        elif f == 3:
            for i in range(stride):
                a = line[i - ch] if i >= ch else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 255
        elif f == 4:
            for i in range(stride):
                a = line[i - ch] if i >= ch else 0
                b = prev[i]
                c = prev[i - ch] if i >= ch else 0
                pp = a + b - c
                pa, pb, pc = abs(pp - a), abs(pp - b), abs(pp - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 255
        out += line
        prev = line
    return w, h, ch, bytes(out)


def write_png(p, w, h, ch, raw):
    def chunk(t, d):
        c = struct.pack(">I", len(d)) + t + d
        return c + struct.pack(">I", binascii.crc32(t + d) & 0xffffffff)

    sig = b"\x89PNG\r\n\x1a\n"
    ct = 2 if ch == 3 else (6 if ch == 4 else 0)
    ihdr = struct.pack(">IIBBBBB", w, h, 8, ct, 0, 0, 0)
    out = sig + chunk(b"IHDR", ihdr)
    stride = w * ch
    data = bytearray()
    for y in range(h):
        data.append(0)  # filter type None; store raw bytes unfiltered
        data += raw[y * stride:(y + 1) * stride]
    out += chunk(b"IDAT", zlib.compress(bytes(data), 6))
    out += chunk(b"IEND", b"")
    open(p, "wb").write(out)


def _dpr(indir, st):
    """device scale of captured bands: first band PNG h / CSS viewport h."""
    first = glob.glob(os.path.join(indir, "band_000.png"))
    if not first:
        return 1.0
    _, bh, _, _ = read_png(first[0])
    return bh / float(st["ih"])


def main():
    indir, outp = sys.argv[1], sys.argv[2]
    sj = os.path.join(indir, "state.json")
    crop = None
    if os.path.exists(sj):
        st = json.load(open(sj))["state"]
        crop = int(st["h"] * _dpr(indir, st))  # device px = CSS * DPR
    bs = sorted(glob.glob(os.path.join(indir, "band_*.png")))
    imgs = [read_png(b) for b in bs]
    w = imgs[0][0]
    ch = imgs[0][2]
    H = sum(i[1] for i in imgs)
    raw = bytearray()
    for i in imgs:
        assert i[0] == w and i[2] == ch, (i[0], i[2], w, ch)
        raw += i[3]
    if crop is not None and crop < H:
        H = crop
        raw = raw[:H * w * ch]
        print("CROP to %dpx" % H)
    write_png(outp, w, H, ch, bytes(raw))
    print("STITCH %s %dx%d %d bands" % (outp, w, H, len(bs)))


if __name__ == "__main__":
    main()
