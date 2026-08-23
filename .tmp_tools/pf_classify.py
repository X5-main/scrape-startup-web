#!/usr/bin/env python3
"""Classify+fetch remaining hashes as filter or fragment."""
import concurrent.futures, os, urllib.request, urllib.error

UA = {"User-Agent": "Mozilla/5.0"}
BASE = "https://herdr.dev/pagefind/"
DEST = "/Users/x5labs/Desktop/pi-agent/omp/scrape-startup-web/herdr/pagefind"

def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read()

def try_save(rel, data):
    if data[:5] != b"<!doc" and len(data) > 0:
        p = os.path.join(DEST, rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        open(p, "wb").write(data)
        return True
    return False

def work(args):
    lang, h, i, n = args
    h = h.decode()
    for cls in ("fragment", "filter"):
        url = f"{BASE}{cls}/{h}.pf_{cls}"
        try:
            data = get(url)
        except Exception as e:
            continue
        if try_save(f"{cls}/{h}.pf_{cls}", data):
            return f"{cls}/{h} ok"
    # try index as last resort
    try:
        data = get(f"{BASE}index/{h}.pf_index")
        if try_save(f"index/{h}.pf_index", data):
            return f"index/{h} ok"
    except Exception:
        pass
    return f"{h} MISS"

lines = []
with open("/tmp/pf_all_hashes.txt") as f:
    for line in f:
        line = line.strip()
        if line:
            lines.append(line)
jobs = [(None, h.encode(), i, len(lines)) for i, h in enumerate(lines)]
ok = miss = 0
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as ex:
    for res in ex.map(work, jobs):
        if res.endswith("ok"):
            ok += 1
        else:
            miss += 1
            print(res)
print(f"done: {ok} ok, {miss} miss")
