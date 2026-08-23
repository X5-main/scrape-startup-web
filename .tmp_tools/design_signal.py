#!/usr/bin/env python3
"""design_signal.py — cheap HTML design-signal pre-filter (D30-followup rule).

Ranks a candidate's *marketing HTML* for "expensive-look" signals with ZERO
vision calls: content depth, section count, logo walls, display-font hints,
dark-theme CSS, animation/3D/JS-richness markers, boilerplate/template
penalties. Outputs a 0-10 score + fail-open verdict.

Placement in the D31 flow: robots.txt allow-all -> SSR footprint gate ->
`design_signal.py` rank on the (live or locally mirrored) home HTML ->
flush-capture + vision-judge ONLY the top 2-3. The >=7 vision judge remains
the gate; this filter only trims obviously-thin/template candidates, and any
ambiguous score still recommends capture (fail-open).

Usage:
  python3 .tmp_tools/design_signal.py <local.html>
  python3 .tmp_tools/design_signal.py --live <url>

Caveat: works on SERVER-RENDERED marketing HTML (the site class the library
mirrors). CSR/SPA shells (empty #root) fail the SSR gate before reaching this
tool, so its thin-page penalty is never the binding reason to reject.
"""
import html as _html
import re
import sys
import urllib.request
from itertools import chain

SYSTEM_FONTS = {
    "arial", "helvetica", "helvetica neue", "verdana", "tahoma", "trebuchet ms",
    "georgia", "times", "times new roman", "courier", "courier new", "monospace",
    "sans-serif", "serif", "system-ui", "ui-sans-serif", "ui-serif", "ui-monospace",
    "applesystem", "-apple-system", "blinkmacsystemfont", "segoe ui", "roboto",
    "inter", "open sans", "lato", "montserrat", "poppins", "pt sans", "noto sans",
    "noto serif", "source sans",
}
# Platform/template markers only. The bare word "template" is NOT a signal:
# CSS property `grid-template-*`, HTML `<template>` tags, and dev comments
# ("row template") all trip it — observed on agenticfabriq (2026-08-24).
BOILERPLATE = re.compile(r"\b(w-webflow|wix|squarespace|studiopress|elementor|godaddy|wordpress\.com|built with)\b", re.I)
LOGO_WALL = re.compile(r"\b(logo|partner|backed|investor|client|customers|powered by|as-seen|featured in)\b", re.I)
ANIMATION = re.compile(r"\b(three(\.js)?|r3f|gsap|framer-motion|motion-reveal|unicornstudio|rive|splide|swiper|lottie)\b", re.I)
FONT_LINK = re.compile(r"fonts\.(googleapis|gstatic)\.com/(css2?|css)", re.I)
FONT_FACE = re.compile(r"@font-face", re.I)
FONT_FAMILY = re.compile(r"font-family\s*:\s*([^;}{]+)", re.I)
COLOR_SCHEME = re.compile(r"color-scheme\s*:\s*([^;}{]+)", re.I)
RGB = re.compile(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)")
HEX = re.compile(r"#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b")


def fetch(path):
    if path.startswith(("http://", "https://")):
        req = urllib.request.Request(path, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.read().decode("utf-8", "replace")
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()


def luminance(rgb):
    r, g, b = [c / 255.0 for c in rgb]
    return 0.299 * r + 0.587 * g + 0.114 * b


def first_bg(hay):
    m = re.search(r"background(-color)?\s*:\s*([^;}]+)", hay, re.I)
    if not m:
        return None
    val = m.group(2).strip()
    m2 = RGB.search(val)
    if m2:
        return luminance(tuple(int(x) for x in m2.groups()))
    m3 = HEX.search(val)
    if m3:
        h = m3.group(1)
        h = "".join(c * 2 for c in h) if len(h) == 3 else h
        return luminance(tuple(int(h[i:i+2], 16) for i in (0, 2, 4)))
    return None


def score(text):
    low = text.lower()
    stats = {}
    stats["html_bytes"] = len(text)
    stats["h1"] = len(re.findall(r"<h1[\s>]", low))
    stats["h2"] = len(re.findall(r"<h2[\s>]", low))
    stats["h3"] = len(re.findall(r"<h3[\s>]", low))
    stats["nav"] = len(re.findall(r"<nav[\s>]", low))
    stats["footer"] = len(re.findall(r"<footer[\s>]", low))
    stats["canvas"] = len(re.findall(r"<canvas[\s>]", low))
    stats["iframe"] = len(re.findall(r"<iframe[\s>]", low))
    imgs = re.findall(r"<img[^>]*?(?:alt|src)=[\"']([^\"']*)[\"']", low, re.I)
    stats["imgs"] = len(imgs)
    stats["logo_wall"] = len(set(m.group(0) for m in
                                 chain(LOGO_WALL.finditer(" ".join(imgs)),
                                       LOGO_WALL.finditer(low))))
    stats["animation_hits"] = sorted(set(ANIMATION.findall(low)))
    stats["font_links"] = len(FONT_LINK.findall(low))
    stats["font_faces"] = len(FONT_FACE.findall(low))
    families = {_html.unescape(f).split(",")[0].strip().strip("'\"").lower()
                for f in FONT_FAMILY.findall(low)}
    stats["display_fonts"] = sorted(f for f in families if f and f not in SYSTEM_FONTS)
    cs = COLOR_SCHEME.findall(low)
    stats["dark_scheme"] = any("dark" in c for c in cs)
    bg = first_bg(low)
    stats["bg_luminance"] = round(bg, 3) if bg is not None else None
    stats["dark_body"] = bg is not None and bg < 0.6
    body = re.sub(r"<script[\s\S]*?</script>", " ", low, flags=re.I)
    body = re.sub(r"<style[\s\S]*?</style>", " ", body, flags=re.I)
    body = re.sub(r"<[^>]+>", " ", body)
    stats["text_chars"] = len(re.sub(r"\s+", " ", body).strip())
    stats["boilerplate"] = sorted(set(BOILERPLATE.findall(low)))

    # ---- weighted 0-10 ----
    s = 0.0
    # content depth (text chars, log-scaled), 0-2
    s += min(2.0, stats["text_chars"] / 4000.0)
    # section richness, 0-2
    sections = stats["h1"] + 0.8 * stats["h2"] + 0.4 * stats["h3"]
    s += min(2.0, sections / 6.0)
    # logo wall / social proof, 0-1.5
    s += min(1.5, stats["logo_wall"] / 5.0)
    # display fonts + woff2/face links, 0-1.5
    s += min(1.5, (len(stats["display_fonts"]) + stats["font_links"] + stats["font_faces"]) / 4.0)
    # dark theme (cheap premium signal, small weight)
    s += 0.5 if stats["dark_scheme"] or stats["dark_body"] else 0.25
    # animation/3D richness, 0-1
    s += min(1.0, len(stats["animation_hits"]) * 0.35 + (0.3 if stats["canvas"] else 0.0))
    # nav/footer presence (non-thin structure), 0-0.5
    s += 0.25 * (1 if stats["nav"] else 0) + 0.25 * (1 if stats["footer"] else 0)
    # boilerplate penalty, 0..-1
    s -= min(1.0, len(stats["boilerplate"]) * 0.35)
    # thin penalty, 0..-2 (mostly the fail-open floor)
    if stats["text_chars"] < 1500:
        s -= 1.0
    s = max(0.0, min(10.0, s))

    verdict = "JUDGE (capture+vision)" if s >= 4.5 else "SKIP (looks template-thin)"
    return stats, round(s, 1), verdict


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    path = argv[2] if len(argv) > 1 and argv[1] == "--live" else argv[1]
    html = fetch(path)
    stats, s, verdict = score(html)
    print(f"target: {path}")
    print(f"score:  {s}/10  ->  {verdict}")
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
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
