#!/usr/bin/env python3
"""Residual sweep for a served mirror: every local URL referenced by any
mirrored HTML page must return 200; collect residuals. Usage:
  python3 .tmp_tools/residual_sweep.py <port> <site-dir>"""
import re, urllib.request, urllib.parse, os, glob, sys

ROOT = os.path.dirname(os.path.abspath(__file__)) + "/.."
PORT = sys.argv[1] if len(sys.argv) > 1 else "8973"
SITE = sys.argv[2] if len(sys.argv) > 2 else "micro1.ai"
LOG = os.environ.get("SWEEP_LOG", f"/tmp/d55_sweep.log")

def fetch(base, path):
    quoted = urllib.parse.quote(path, safe="/:/?=&%()'!@$*~")
    try:
        r = urllib.request.urlopen(base + quoted, timeout=25)
        return r.status
    except Exception as e:
        return getattr(e, "code", None) or -1

# Script/style bodies are runtime code, not markup: JS template literals and
# CSS url() builders byte-match src=/href= attributes but never resolve as
# static refs (live pages carry the identical strings). Blank them before
# scanning so only real markup refs are probed — the same span-mask
# serve_replica.py applies.
_NON_MARKUP_RE = re.compile(r"(<(?:script|style)\b[^>]*>)(.*?)(</(?:script|style)\s*>)", re.S)

d = os.path.join(ROOT, SITE)
BASE = f"http://127.0.0.1:{PORT}"
uniq = {}
nrefs = npages = 0
out = []

def scan(up, q, tag):
    if not q:
        return
    target = urllib.parse.urljoin(up, q)
    key = target
    if key in uniq:
        return
    uniq[key] = True
    global nrefs
    nrefs += 1
    st = fetch(BASE, key)
    if st != 200:
        out.append(f"{st}\t{key}" + (f"  [{tag}]" if tag else ""))

def is_external(u):
    return u.startswith(("http://", "https://", "//", "data:", "mailto:", "tel:", "javascript:", "#")) or u.startswith("{{")

def markup_attrs(html):
    '''Yield (kind, value) for src/href/data-src/poster/srcset attrs in real
    markup only — script/style bodies blanked, per the mask rationale.'''
    html = _NON_MARKUP_RE.sub(r"\1\3", html)
    for m in re.finditer(r'(?:src|href|data-src|poster)="([^"]+)"', html):
        yield ("attr", m.group(1))
    for m in re.finditer(r'srcset="([^"]+)"', html):
        for cand in m.group(1).split(","):
            cand = cand.strip()
            if not cand:
                continue
            u = re.sub(r"\s+\d+(?:w|x)\s*$", "", cand)
            if u.startswith(("data:", "//")):
                continue
            yield ("srcset", u)

for f in sorted(glob.glob(d + "/**/*.html", recursive=True), key=len):
    rd = os.path.relpath(os.path.dirname(f), d).replace(os.sep, "/")
    up = "/" if rd == "." else "/" + rd + "/"
    html = open(f, encoding="utf-8", errors="replace").read()
    npages += 1
    for tag, u in markup_attrs(html):
        if is_external(u):
            continue
        q = u.split("?")[0].split("#")[0]
        scan(up, q, tag)

with open(LOG, "w") as lf:
    lf.write(f"pages={npages} refs={nrefs} residual={len(out)}\n")
    for line in sorted(out):
        lf.write(line + "\n")
print(f"pages={npages} refs={nrefs} residual_uniq={len(out)} (see {LOG})")
for line in sorted(out)[:100]:
    print(" ", line)
