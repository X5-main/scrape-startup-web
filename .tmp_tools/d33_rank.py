#!/usr/bin/env python3
"""d33_rank.py — D33 pool gate + design-signal rank (extends design_signal.py).

For each roster candidate: robots.txt gate (404/empty = allow-all; full-site
Disallow:/ or AI-crawler content-signal conditioning = skip; per-path disallows
OK) -> SSR footprint gate (>=1 h1 + >=1000 body text chars) -> design_signal
score on the live home HTML. Outputs a ranked JSON + console top-N.

Usage: python3 .tmp_tools/d33_rank.py /tmp/d33_pool.json [--top 25]
"""
import json, re, sys, urllib.request, concurrent.futures, time
from itertools import chain
sys.path.insert(0, __import__('os').path.dirname(__file__) or '.')
from design_signal import score  # reuse the 0-10 scorer

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
RE_ROBOTS_DISALLOW_ALL = re.compile(r"^(?:\s*User-agent\s*:\s*\*[\s\S]*?)?\s*Disallow\s*:\s*/\s*$", re.M | re.I)
RE_ROBOTS_CONTENT_SIGNAL = re.compile(r"(ChatGPT|Claude|GPTBot|OAI-SearchBot|Perplexity|AI-?Search|CCBot|cohere)\b", re.I)

def fetch_bytes(url, timeout=20, tries=2):
    last = None
    for _ in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.status, r.read()
        except urllib.error.HTTPError as e:
            return e.code, b""
        except Exception as e:
            last = e
            time.sleep(1.2)
    return 0, b""

def robots_gate(domain):
    status, body = fetch_bytes("https://" + domain + "/robots.txt")
    if status in (404, 0):   # 0 = transport error; treat like no-robots (allow)
        text = ""
    else:
        text = body.decode("utf-8", "replace")[:20000]
    if status == 401 or status == 403:
        return False, "robots-http-%d" % status
    if text.strip() == "":
        return True, "no-robots-body"
    if RE_ROBOTS_DISALLOW_ALL.search(text):
        return False, "disallow-all"
    if RE_ROBOTS_CONTENT_SIGNAL.search(text):
        return False, "ai-content-signal"
    return True, "ok"

def probe(rec):
    dom = rec["domain"]
    okr, rwhy = robots_gate(dom)
    if not okr:
        rec.update(status="SKIP", robots=rwhy); return rec
    status, body = fetch_bytes("https://" + dom + "/")
    if status != 200 or not body:
        rec.update(status="ERR", robots=rwhy, http=status); return rec
    try:
        html = body.decode("utf-8", "replace")
    except Exception:
        html = ""
    low = html.lower()
    h1 = len(re.findall(r"<h1[\s>]", low))
    if h1 < 1:
        rec.update(status="SKIP", robots=rwhy, why="no-h1"); return rec
    scrubbed = re.sub(r"<script[\s\S]*?</script>", " ", low, flags=re.I)
    scrubbed = re.sub(r"<style[\s\S]*?</style>", " ", scrubbed, flags=re.I)
    scrubbed = re.sub(r"<[^>]+>", " ", scrubbed)
    text_chars = len(re.sub(r"\s+", " ", scrubbed).strip())
    if text_chars < 1000:
        rec.update(status="SKIP", robots=rwhy, why="thin", text_chars=text_chars); return rec
    try:
        _stats, s, _verdict = score(html)
    except Exception:
        s = 0.0
    rec.update(status="RANK", robots=rwhy, h1=h1, text_chars=text_chars, signal=round(s, 2))
    return rec

def main():
    pool = json.load(open(sys.argv[1]))
    topn = 25
    if "--top" in sys.argv:
        topn = int(sys.argv[sys.argv.index("--top") + 1])
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as ex:
        for i, rec in enumerate(ex.map(probe, pool)):
            results.append(rec)
            if (i + 1) % 100 == 0:
                print("# %d/%d done" % (i + 1, len(pool)), flush=True)
    json.dump(results, open("/tmp/d33_ranked.json", "w"), indent=1)
    ranked = [r for r in results if r.get("status") == "RANK"]
    ranked.sort(key=lambda r: -r.get("signal", 0))
    print("\n== rankable: %d / pool %d ==" % (len(ranked), len(pool)))
    for r in ranked[:topn]:
        print("%5.2f  %-32s %-20s h1=%-3d txt=%-7d %s" % (
            r["signal"], r["domain"], r["name"][:20], r.get("h1", 0), r.get("text_chars", 0), r["oneLiner"][:48]))

if __name__ == "__main__":
    main()
