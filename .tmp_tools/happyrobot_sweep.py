#!/usr/bin/env python3
"""happyrobot.com residual sweep on port 8922 (mirrors starcloud/corma semantics)."""
import re, urllib.request, urllib.parse, os, glob

ROOT = "/Users/x5labs/Desktop/pi-agent/omp/scrape-startup-web"
SITE, PORT = "happyrobot", 8922

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
    for m in re.finditer(r'(?:src|href|data-src|poster|srcset)="([^"]+)"', html):
        u = m.group(1)
        # srcset attrs hold multi-candidate lists: check each candidate
        cands = [c.strip().split()[0] for c in u.split(",")] if "srcset" in m.group(0) else [u]
        for cu in cands:
            nrefs += 1
            if cu.startswith(("data:", "mailto:", "tel:", "javascript:", "#",
                              "http://", "https://")):
                continue
            if "<" in cu or "\\" in cu or cu.startswith("([^"):
                continue
            res = urllib.parse.urljoin(BASE + up, cu)
            sp = urllib.parse.urlsplit(res)
            if sp.netloc != f"127.0.0.1:{PORT}":
                continue
            st = fetch(BASE, sp.path)
            if st != 200:
                uniq.setdefault(cu, {"resolved": sp.path, "from": up})

print(f"happyrobot: pages={npages} html refs={nrefs} residual_uniq={len(uniq)}")
for u, info in sorted(uniq.items()):
    print(f"  {u!r} -> {info['resolved']} (from {info['from']})")
