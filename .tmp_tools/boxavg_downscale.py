#!/usr/bin/env python3
"""Box-average Nx downscaler, pure stdlib (no PIL), for flush-parity judge inputs.

sips resampling amplifies sub-8 raw diffs to visible artifacts; box-average
keeps judge inputs lossless-exact vs the capture. PNG decode handles
RGBA/RGB, filter types 0-4. Encoder writes RGB or RGBA (from source).
Usage: python3 boxavg_downscale.py <in.png> <out.png> [factor=2]
"""
import binascii
import struct
import sys
import zlib


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
                pa = abs(b - c)
                pb = abs(a - c)
                pc = abs(a + b - 2 * c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 255
        out += line
        prev = line
    return w, h, ch, bytes(out)


def write_png(p, w, h, ch, rgb):
    def chunk(typ, data):
        c = struct.pack(">I", len(data)) + typ + data
        return c + struct.pack(">I", binascii.crc32(typ + data) & 0xffffffff)

    raw = b""
    stride = w * ch
    for y in range(h):
        raw += b"\x00" + rgb[y * stride:(y + 1) * stride]
    idat = zlib.compress(raw, 6)
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6 if ch == 4 else 2, 0, 0, 0)
    open(p, "wb").write(
        b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b""))


def main():
    inp, outp = sys.argv[1], sys.argv[2]
    factor = int(sys.argv[3]) if len(sys.argv) > 3 else 2
    w, h, ch, px = read_png(inp)
    assert w % factor == 0 and h % factor == 0, (w, h, factor)
    W, H = w // factor, h // factor
    out = bytearray(W * H * ch)
    for y in range(H):
        for x in range(W):
            for c in range(ch):
                v = 0
                for dy in range(factor):
                    for dx in range(factor):
                        v += px[((y * factor + dy) * w + (x * factor + dx)) * ch + c]
                out[(y * W + x) * ch + c] = v // (factor * factor)
    write_png(outp, W, H, ch, bytes(out))
    print(f"wrote {W}x{H} from {w}x{h} factor {factor}")


if __name__ == "__main__":
    main()
