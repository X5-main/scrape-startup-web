#!/usr/bin/env python3
"""Visible-text byte parity: live veeda.ai vs 127.0.0.1:8918 replica."""
import re, urllib.request, html

UA = {"User-Agent": "Mozilla/5.0"}

def get(url, ua=True):
    req = urllib.request.Request(url, headers=UA if ua else {})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read()

def visible(html_bytes):
    t = html_bytes.decode("utf-8", "replace")
    t = re.sub(r"<script.*?</script>", " ", t, flags=re.S | re.I)
    t = re.sub(r"<style.*?</style>", " ", t, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    t = html.unescape(t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()

paths = ["/"]
for p in paths:
    live = get("https://veeda.ai" + p)
    rep = get("http://127.0.0.1:8918" + p)
    vt, vr = visible(live), visible(rep)
    n_l, n_r = len(vt.encode()), len(vr.encode())
    eq = "MATCH" if vt == vr else "DIFF"
    print(f"{p:40s} live={n_l:7d}B replica={n_r:7d}B {eq}")
    if vt != vr:
        a = set(re.split(r"\s+", vt))
        b = set(re.split(r"\s+", vr))
        print("  only live:", sorted(a - b)[:12])
        print("  only replica:", sorted(b - a)[:12])
        for i, (x, y) in enumerate(zip(vt, vr)):
            if x != y:
                print(f"  first diff @ {i}: live ...{vt[max(0,i-40):i+40]}...")
                print(f"                rep ...{vr[max(0,i-40):i+40]}...")
                break
