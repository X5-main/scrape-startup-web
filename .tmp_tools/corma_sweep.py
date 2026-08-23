#!/usr/bin/env python3
"""corma.ai residual sweep on port 8919 (mirrors veeda/herdr semantics)."""
import re, urllib.request, urllib.parse, os, glob

ROOT = "/Users/x5labs/Desktop/pi-agent/omp/scrape-startup-web"
SITE, PORT = "corma", 8919

def fetch(base, path):
    quoted = urllib.parse.quote(path, safe="/:/?=&%()'!@$*")
    try:
        r = urllib.request.urlopen(base + quoted, timeout=25)
        return r.status
    except Exception as e:
        return getattr(e, "code", None) or -1

d = os.path.join(ROOT, SITE)
BASE = f"http://127.0.0.1:{PORT}"
uniq = {}
nrefs = npages = 0
for f in sorted(glob.glob(d + "/**/*.html", recursive=True)):
    rd = os.path.relpath(os.path.dirname(f), d).replace(os.sep, "/")
    up = "/" if rd == "." else "/" + rd + "/"
    html = open(f, encoding="utf-8", errors="replace").read()
    npages += 1
    for m in re.finditer(r'(?:src|href|data-src|poster)="([^"]+)"', html):
        u = m.group(1)
        nrefs += 1
        if u.startswith(("data:", "mailto:", "tel:", "javascript:", "#",
                         "http://", "https://")):
            continue
        if "<" in u or "\\" in u or u.startswith("([^"):
            continue
        res = urllib.parse.urljoin(BASE + up, u)
        sp = urllib.parse.urlsplit(res)
        if sp.netloc != f"127.0.0.1:{PORT}":
            continue
        st = fetch(BASE, sp.path)
        if st != 200:
            uniq.setdefault(u, {"resolved": sp.path, "from": up})

print(f"corma: pages={npages} html refs={nrefs} residual_uniq={len(uniq)}")
for u, info in sorted(uniq.items()):
    print(f"  {u!r} -> {info['resolved']} (from {info['from']})")
