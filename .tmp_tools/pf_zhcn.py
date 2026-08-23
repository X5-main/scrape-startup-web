#!/usr/bin/env python3
"""Re-run classification for zh-cn with correct full-prefix hashes."""
import concurrent.futures, gzip, json, os, re, urllib.request

UA = {"User-Agent": "Mozilla/5.0"}
BASE = "https://herdr.dev/pagefind/"
DEST = "/Users/x5labs/Desktop/pi-agent/omp/scrape-startup-web/herdr/pagefind"

def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read()

entry = json.loads(get(BASE + "pagefind-entry.json"))
h = entry["languages"]["zh-cn"]["hash"]
raw = gzip.decompress(get(f"{BASE}pagefind.{h}.pf_meta"))
toks = sorted(set(re.findall(rb"zh-cn_[0-9a-f]{6,12}", raw)))
print(f"zh-cn: {len(toks)} unique full-prefix hashes")

def work(args):
    lang, hh, i, n = args
    for cls in ("fragment", "filter", "index"):
        rel = f"{cls}/{hh.decode()}.pf_{cls}"
        try:
            data = get(BASE + rel)
        except Exception:
            continue
        if data[:5] != b"<!doc" and len(data) > 0:
            p = os.path.join(DEST, rel)
            os.makedirs(os.path.dirname(p), exist_ok=True)
            open(p, "wb").write(data)
            return f"{rel} ok ({len(data)}B)"
    return f"{hh.decode()} MISS"

jobs = [(None, t, i, len(toks)) for i, t in enumerate(toks)]
ok = miss = 0
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as ex:
    for res in ex.map(work, jobs):
        if res.endswith("ok") or "MISS" not in res:
            ok += 1
        else:
            miss += 1
            print(res)
print(f"zh-cn: {ok} ok, {miss} miss")
