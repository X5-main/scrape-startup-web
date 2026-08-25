#!/usr/bin/env python3
"""usenaive.ai asset-closure sweep.

Scans EVERY mirrored file (html/js/css/json) for asset-like local URL
candidates that live code references but the crawler never fetched
(runtime dynamic imports / logo maps / font refs). For each candidate
missing from the replica, probes LIVE at the clean path; live-200 paths
are fetched into the mirror (plain + dpl-twin names) as GAPs.
"""
import re, urllib.request, urllib.parse, os, glob, sys, html as htmllib
from concurrent.futures import ThreadPoolExecutor

ROOT = "/Users/x5labs/Desktop/pi-agent/omp/scrape-startup-web"
SITE, PORT = "usenaive.ai", 8960
BASE = f"http://127.0.0.1:{PORT}"
LIVE = "https://usenaive.ai"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"
P = 16
ASSET_RE = re.compile(r"/[\w./~-]*(?:static/|logos/|assets/|fonts/|images/|icons/|favicon|audio/|video/)[\w./~-]*")
EXT_RE = re.compile(r"\.(?:svg|png|woff2?|ttf|otf|eot|js|css|json|webp|avif|gif|ico|mp4|webm|txt|xml|md)$")
SKIP = ("/docs/llms.txt",)

def fetch(base, path, q=""):
    p = path + q
    req = urllib.request.Request(base + urllib.parse.quote(p, safe="/:/?=&%()'!@$*"), headers={"User-Agent": UA})
    try:
        r = urllib.request.urlopen(req, timeout=30)
        data = r.read()
        return r.status, data
    except Exception as e:
        return (getattr(e, "code", None) or -1), None

d = os.path.join(ROOT, SITE)
cands = {}
for f in sorted(glob.glob(d + "/**/*", recursive=True)):
    if not os.path.isfile(f):
        continue
    ext = os.path.splitext(f)[1].lower()
    raw = open(f, encoding="utf-8", errors="replace").read()
    if ext in (".html",):
        mre = re.finditer(r'(?:src|href|data-src|poster)="([^"]+)"|srcset="([^"]+)"', raw)
        for m in mre:
            u = m.group(1) or m.group(2)
            for cu in ([c.strip().split()[0] for c in u.split(",")] if "srcset" in m.group(0) else [u]):
                if not cu.startswith(("data:", "mailto:", "tel:", "javascript:", "#", "http")) and "\\" not in cu and "<" not in cu:
                    cands.setdefault(cu, f)
    elif ext in (".js", ".css", ".json"):
        for m in re.finditer(r'["\']([^"\'\s)]{1,400})["\']', raw):
            cu = m.group(1)
            if cu.startswith("/") and not cu.startswith(("//",)) and EXT_RE.search(cu) and ASSET_RE.search(cu):
                cands.setdefault(cu, f)
            elif "url(" in raw:
                for m2 in re.finditer(r'url\(["\']?([^"\')]+)["\']?\)', raw):
                    cu2 = m2.group(1)
                    if cu2.startswith(("/", "_next", "fonts")):
                        cands.setdefault(cu2 if cu2.startswith("/") else "/" + cu2, f)

uniq_paths = sorted(set(u.split("?")[0] for u in cands))
print(f"asset candidates={len(cands)} unique_paths={len(uniq_paths)}", flush=True)

def rep_status(path):
    st, _ = fetch(BASE, path)
    return st

with ThreadPoolExecutor(P) as ex:
    sts = list(ex.map(rep_status, uniq_paths))
missing = [p for p, s in zip(uniq_paths, sts) if s != 200]
print(f"replica-missing={len(missing)}", flush=True)

def classify(path):
    live_path = path[:-10] if path.endswith("/index.html") else path
    st, data = fetch(LIVE, live_path)
    return path, st, data

gaps = []
with ThreadPoolExecutor(P) as ex:
    for path, st, data in ex.map(classify, missing):
        if st == 200 and data:
            # save plain + dpl twin
            rel = os.path.join(d, path.lstrip("/"))
            q = next((u.split("?", 1)[1] for u in cands if u.split("?")[0] == path and "dpl=" in u), None)
            os.makedirs(os.path.dirname(rel), exist_ok=True)
            open(rel, "wb").write(data)
            names = [rel]
            if q:
                import re as _re
                sm = _re.search(r"dpl=([^&]+)", q)
                if sm:
                    sfx = sm.group(1)
                    if sfx.startswith("dpl_"):
                        sfx = "dpl-" + sfx[4:]
                    twin = os.path.splitext(rel)[0] + "__dpl-" + sfx + os.path.splitext(rel)[1]
                    open(twin, "wb").write(data)
                    names.append(twin)
            gaps.append((path, st, len(data), names))
            print(f"  [GAP-FETCHED] live={st} {len(data)}B {path} -> {[os.path.relpath(n, ROOT) for n in names]}", flush=True)
        else:
            print(f"  [DEAD-LIVE] replica non-200, live={st} {path}", flush=True)

print(f"\nSUMMARY: gaps_fetched={len(gaps)} live-dead={len(missing)-len(gaps)}", flush=True)
