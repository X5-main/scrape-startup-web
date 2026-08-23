#!/usr/bin/env python3
"""Fetch herdr.dev /pagefind/ tree into the mirror (offline search support)."""
import gzip, json, os, re, urllib.request, concurrent.futures

UA = {"User-Agent": "Mozilla/5.0"}
BASE = "https://herdr.dev/pagefind/"
DEST = "/Users/x5labs/Desktop/pi-agent/omp/scrape-startup-web/herdr/pagefind"
os.makedirs(DEST, exist_ok=True)

def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read()

def save(rel, data):
    p = os.path.join(DEST, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "wb").write(data)

# 1. static runtime + entry + wasm
static = ["pagefind.js", "pagefind-entry.json", "wasm.en.pagefind", "pagefind.css"]
for f in static:
    try:
        data = get(BASE + f)
        if data[:5] != b"<!doc" and len(data) > 0:
            save(f, data)
            print(f"OK {f} ({len(data)}B)")
        else:
            print(f"SKIP {f} (html fallback)")
    except Exception as e:
        print(f"FAIL {f}: {e}")

# 2. metas (gzip raw, verified) + their fragment hashes
entry = json.loads(get(BASE + "pagefind-entry.json"))
hashes = {}
for lang, meta in entry["languages"].items():
    h = meta["hash"]
    raw = get(f"{BASE}pagefind.{h}.pf_meta")
    save(f"pagefind.{h}.pf_meta", raw)
    gz = gzip.decompress(raw)
    hashes[lang] = sorted(set(re.findall(rb"(?:en|ja|cn)_[0-9a-f]{6,12}", gz)))
    print(f"meta {lang} {h}: {len(hashes[lang])} hashes")

# 3. fragment files (fetch all, keep only real octet-stream)
def fetch_one(args):
    lang, h, i, n = args
    rel = f"fragment/{h.decode()}.pf_fragment"
    try:
        data = get(BASE + rel)
        if data[:5] != b"<!doc" and len(data) > 0:
            return (rel, data, None)
        return (None, None, f"{rel} html-fallback")
    except Exception as e:
        return (None, None, f"{rel} {e}")

jobs = []
for lang, hh in hashes.items():
    for i, h in enumerate(hh):
        jobs.append((lang, h, i, len(hh)))

ok = miss = 0
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:
    for rel, data, err in ex.map(fetch_one, jobs):
        if data is not None:
            save(rel, data); ok += 1
        else:
            miss += 1
            print(f"MISS {err}")
print(f"\nfragments: {ok} saved, {miss} missing")

# 4. verify disk inventory
import subprocess
r = subprocess.run(["find", DEST, "-type", "f"], capture_output=True, text=True)
files = r.stdout.splitlines()
total = sum(os.path.getsize(p) for p in files)
print(f"disk: {len(files)} files, {total/1024:.0f} KiB")
