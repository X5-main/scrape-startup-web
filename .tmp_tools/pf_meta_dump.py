import gzip, re, urllib.request, json

UA = {"User-Agent": "Mozilla/5.0"}

def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read()

entry = json.loads(get("https://herdr.dev/pagefind/pagefind-entry.json"))
for lang, meta in entry["languages"].items():
    h = meta["hash"]
    raw = gzip.decompress(get(f"https://herdr.dev/pagefind/pagefind.{h}.pf_meta"))
    print("=" * 40, lang, h, "raw", len(raw))
    # hexdump first 96 bytes
    print(raw[:96])
    # find all 7-char-ish tokens near 'en_/ja_/cn_'
    for m in re.finditer(rb"[a-z]{2}[_-][0-9a-f]{4,16}", raw):
        s = max(0, m.start() - 14)
        print("   ctx:", raw[s:m.end() + 6])
