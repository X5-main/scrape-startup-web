#!/usr/bin/env python3
"""Stitch cap5/patch2 band stacks by LOGGED ys (overlap-crop), emit full + topband,
then boxavg downscale (factor 2) for judge inputs. Pure stdlib, reuses boxavg codec."""
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tmp_tools"))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".tmp_tools"))
from boxavg_downscale import read_png, write_png

def stitch(banddir, out_prefix):
    ys = json.load(open(os.path.join(banddir, "ys.json")))
    # determine total height from last band: last_y + ih = H  (band images same size)
    w, ih, ch, _ = read_png(os.path.join(banddir, "band_000.png"))
    last_y = ys[-1]
    H = last_y + ih
    canvas = bytearray(w * H * ch)
    for i, y in enumerate(ys):
        _, bh, bch, px = read_png(os.path.join(banddir, f"band_{i:03d}.png"))
        assert bch == ch and bh == ih
        # crop overlap: rows of this band that fall below H are dropped;
        # rows above band start y that duplicate previous band are skipped by paste-at-y
        row0 = 0
        # band i pasted at y; band start y may be < previous band end? no, ys monotonically +
        keep_rows = ih
        if y + ih > H:
            keep_rows = H - y
        for r in range(keep_rows):
            src = px[r * w * ch:(r + 1) * w * ch]
            canvas[(y + r) * w * ch:(y + r + 1) * w * ch] = src
    full = os.path.join(banddir, out_prefix + "_full.png")
    write_png(full, w, H, ch, bytes(canvas))
    top = os.path.join(banddir, out_prefix + "_topband.png")
    write_png(top, w, ih, ch, bytes(canvas[:w * ih * ch]))
    print(f"{banddir}: stitched {len(ys)} bands -> {w}x{H}; topband {w}x{ih}")
    # round-trip test on both outputs
    for p in (full, top):
        w2, h2, c2, px2 = read_png(p)
        # re-encode and compare decode
        import tempfile
        tf = tempfile.mktemp(suffix=".png")
        write_png(tf, w2, h2, c2, px2)
        _, _, _, px3 = read_png(tf)
        assert px2 == px3, f"round-trip mismatch {p}"
        assert w2 == w and h2 == (H if p == full else ih)
        print(f"  round-trip OK {p} ({w2}x{h2})")
        os.unlink(tf)
    return full, top

for side in ("rep", "live"):
    d = f"/tmp/d57_{side}3" if side == "live" else f"/tmp/d57_{side}4"
    stitch(d, "s")
