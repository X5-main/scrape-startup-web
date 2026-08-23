#!/usr/bin/env python3
"""herdr-only residual sweep on port 8917 (mirrors fswp3 semantics)."""
import re, urllib.request, urllib.parse, os, glob, json

ROOT = "/Users/x5labs/Desktop/pi-agent/omp/scrape-startup-web"
SITE, PORT = "herdr", 8917

def fetch(base, path):
    quoted = urllib.parse.quote(path, safe="/:/?=&%()'!@$*")
    try:
        r = urllib.request.urlopen(base+quoted, timeout=25)
        return r.status
    except Exception as e:
        return getattr(e, 'code', None) or -1

d = os.path.join(ROOT, SITE)
BASE = f"http://127.0.0.1:{PORT}"
uniq = {}
nrefs = npages = 0
for f in sorted(glob.glob(d + "/**/*.html", recursive=True)):
    rd = os.path.relpath(os.path.dirname(f), d).replace(os.sep, '/')
    up = "/" if rd == '.' else "/" + rd + "/"
    html = open(f, encoding='utf-8', errors='replace').read()
    npages += 1
    for m in re.finditer(r'(?:src|href|data-src|poster)="([^"]+)"', html):
        u = m.group(1)
        nrefs += 1
        if u.startswith(('data:', 'mailto:', 'tel:', 'javascript:', '#', 'http://', 'https://')):
            continue
        if '<' in u or '\\' in u or u.startswith('([^'):
            continue
        res = urllib.parse.urljoin(BASE + up, u)
        sp = urllib.parse.urlsplit(res)
        if sp.netloc != f"127.0.0.1:{PORT}":
            continue
        st = fetch(BASE, sp.path)
        if st != 200:
            uniq.setdefault(u, {"resolved": sp.path, "from": up})

print(f"herdr: pages={npages} html refs={nrefs} residual_uniq={len(uniq)}")
for u, v in sorted(uniq.items()):
    print(f"  {u} -> {v['resolved']} (from {v['from']})")
json.dump({"herdr": {"pages": npages, "refs": nrefs, "residual_uniq": len(uniq),
                     "items": sorted(uniq.items())}},
          open("/tmp/herdr_resids3.json", "w"), indent=1)
