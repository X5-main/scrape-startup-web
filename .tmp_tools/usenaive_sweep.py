#!/usr/bin/env python3
"""usenaive.ai residual sweep on port 8960 (parallel, path-deduped).

Classifies every non-200 replica reference against the LIVE origin:
  DEAD-LIVE: live returns the same non-200 (acceptable residue)
  GAP:       live returns 200 (replica defect -> must fix -> fetch)
"""
import re, urllib.request, urllib.parse, os, glob, sys
from concurrent.futures import ThreadPoolExecutor

ROOT = "/Users/x5labs/Desktop/pi-agent/omp/scrape-startup-web"
SITE, PORT = "usenaive.ai", 8960
LIVE = "https://usenaive.ai"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"
P = 16

def fetch(base, path):
    quoted = urllib.parse.quote(path, safe="/:/?=&%()'!@$*")
    req = urllib.request.Request(base + quoted, headers={"User-Agent": UA})
    try:
        r = urllib.request.urlopen(req, timeout=30)
        r.read()
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
    for m in re.finditer(r'(?:src|href|data-src|poster)="([^"]+)"|srcset="([^"]+)"', html):
        u = m.group(1) or m.group(2)
        cands = [c.strip().split()[0] for c in u.split(",")] if "srcset" in m.group(0) else [u]
        for cu in cands:
            nrefs += 1
            if cu.startswith(("data:", "mailto:", "tel:", "javascript:", "#",
                              "http://", "https://")):
                continue
            if "<" in cu or "\\" in cu:
                continue
            res = urllib.parse.urljoin(BASE + up, cu)
            sp = urllib.parse.urlsplit(res)
            if sp.netloc != f"127.0.0.1:{PORT}":
                continue
            uniq.setdefault(sp.path, (cu, up))

print(f"usenaive: pages={npages} html refs={nrefs} unique_paths={len(uniq)}", flush=True)

paths = sorted(uniq)
with ThreadPoolExecutor(P) as ex:
    sts = list(ex.map(lambda p: fetch(BASE, p), paths))
resid = [p for p, s in zip(paths, sts) if s != 200]
print(f"replica non-200 uniq={len(resid)}", flush=True)

def classify(path):
    cu, src = uniq[path]
    live_path = path[:-10] if path.endswith("/index.html") else path
    live = fetch(LIVE, live_path)
    rep = fetch(BASE, path)
    return path, live_path, live, rep, cu, src

gaps, deadlive = [], []
with ThreadPoolExecutor(P) as ex:
    for path, live_path, live, rep, cu, src in ex.map(classify, resid):
        if live != 200:
            deadlive.append(path)
            print(f"  [DEAD-LIVE] replica={rep} live={live} {live_path!r} (from {src} ref={cu!r})", flush=True)
        else:
            gaps.append(path)
            print(f"  [GAP] replica={rep} live={live} {live_path!r} (from {src} ref={cu!r})", flush=True)

print(f"\nSUMMARY: gaps={len(gaps)} dead-live={len(deadlive)}", flush=True)
sys.exit(1 if gaps else 0)
