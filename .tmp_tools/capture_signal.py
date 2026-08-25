#!/usr/bin/env python3
"""capture_signal.py — record FULL design_signal stats (not just the score)
into .tmp_tools/signals/<name>.json as round evidence, per advisory:
before mirroring, the actual signal outputs must be in the round record.

Usage:
    python3 .tmp_tools/capture_signal.py <name> <path-or-url>
        path  = local HTML file (e.g. mirror index.html — byte-faithful)
        url   = live page (--live not needed; http(s):// auto-fetches)

Writes:  .tmp_tools/signals/<name>.json   (stats + score + verdict + boilerplate + captured_at UTC)
Prints:  full stats + score (same as design_signal.py CLI).
"""
import json
import os
import sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import design_signal  # noqa: E402


def main(argv):
    if len(argv) != 3:
        print(__doc__)
        return 2
    name, path = argv[1], argv[2]
    html = design_signal.fetch(path)
    stats, score, verdict = design_signal.score(html)
    record = {
        "candidate": name,
        "source": path,
        "captured_at": datetime.now(timezone.utc).isoformat(),
        "html_bytes": stats["html_bytes"],
        "text_chars": stats["text_chars"],
        "h1": stats["h1"],
        "h2": stats["h2"],
        "h3": stats["h3"],
        "nav": stats["nav"],
        "footer": stats["footer"],
        "imgs": stats["imgs"],
        "canvas": stats["canvas"],
        "iframe": stats["iframe"],
        "logo_wall": stats["logo_wall"],
        "animation_hits": stats["animation_hits"],
        "font_links": stats["font_links"],
        "font_faces": stats["font_faces"],
        "display_fonts": stats["display_fonts"],
        "dark_scheme": stats["dark_scheme"],
        "bg_luminance": stats["bg_luminance"],
        "dark_body": stats["dark_body"],
        "boilerplate": stats["boilerplate"],
        "score": score,
        "verdict": verdict,
    }
    out = os.path.join(HERE, "signals", "%s.json" % name)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2, sort_keys=True)
    print(f"target: {path}")
    print(f"score:  {score}/10  ->  {verdict}")
    print(f"  html {stats['html_bytes']}B text {stats['text_chars']} chars | "
          f"h1 {stats['h1']} h2 {stats['h2']} h3 {stats['h3']}")
    print(f"  nav {stats['nav']} footer {stats['footer']} imgs {stats['imgs']} "
          f"canvas {stats['canvas']} iframe {stats['iframe']} logo-wall {stats['logo_wall']}")
    print(f"  fonts: links {stats['font_links']} @font-face {stats['font_faces']} "
          f"display: {stats['display_fonts'] or 'none'}")
    print(f"  dark: scheme {stats['dark_scheme']} body-bg-lum {stats['bg_luminance']} "
          f"dark_body {stats['dark_body']}")
    print(f"  animation: {stats['animation_hits'] or 'none'}")
    print(f"  boilerplate: {stats['boilerplate'] or 'none'}")
    print(f"saved: {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
