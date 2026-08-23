#!/usr/bin/env python3
"""Repair veria/contact/index.html: the crawler stored a rogue Next.js dev
shell (stale CDN response) for /contact/; live serves a clean Astro page.
Re-fetch live, rewrite through mirror_site's own machinery, fetch missing
same-origin assets, save."""
import html, os, re, sys, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import mirror_site as M

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "veria")
URL = "https://verialabs.com/contact/"
m = M.Mirror(URL, OUT, 3, ["gravatar.com"])

# 1) fetch live (retry on poison detection)
text = None
for attempt in range(4):
    status, body = M.fetch(URL)
    t = body.decode("utf-8", errors="replace")
    if status == 200 and "data-astro" in t and "_next/static" not in t:
        text = t; print("live OK", len(t)); break
    print(f"attempt {attempt}: status={status} astro={'data-astro' in t} next={'_next/static' in t} len={len(t)}")
    import time; time.sleep(2)
if text is None:
    sys.exit("ABORT: could not obtain clean live /contact/")
assert "Get a demo" in text, "h1 sanity"

# 2) rewrite exactly like crawl_page
finder = M.LinkFinder(); finder.feed(text)
rewrite = []
for raw, attr in finder.urls:
    if raw.startswith(("#", "mailto:", "tel:", "data:", "javascript:")):
        continue
    abs_url = m.absolute(URL, raw)
    if not m.allowed(abs_url):
        continue
    if attr in ("canonical", "meta"):
        continue
    rewrite.append((raw, attr, abs_url))
    if m.is_html_like(abs_url) and m.is_same_origin(abs_url):
        continue  # page refs stay absolute in stored page? no—skip queueing
    if abs_url not in m.assets_seen:
        m.assets_seen.add(abs_url)
for raw, attr, abs_url in rewrite:
    rel = m.rel_to(abs_url, URL)
    if attr == "srcset":
        escaped = re.compile(r'srcset\s*=\s*("([^"]*)"|\'([^\']*)\')', re.S)
        text = escaped.sub(lambda mm: m._rewrite_srcset(mm, URL), text)
    else:
        for q in ('"', "'"):
            for cand in ({raw, raw.replace("&", "&amp;")}):
                text = text.replace(attr + "=" + q + cand + q,
                                    attr + "=" + q + rel + q)
# inline styles
for block in M.STYLE_BLOCK_RE.findall(text):
    for cm in M.CSS_URL_RE.finditer(block):
        ref = html.unescape(cm.group(2)).strip("'\"")
        if not ref or ref.startswith(("#", "data:", "blob:", "about:", "javascript:")):
            continue
        abs_url = m.absolute(URL, ref)
        if m.allowed(abs_url):
            text = text.replace(cm.group(0), "url('" + m.rel_to(abs_url, URL) + "')")
for im in M.INLINE_STYLE_RE.finditer(text):
    new_attr = im.group(1)
    for cm in M.CSS_URL_RE.finditer(im.group(1)):
        ref = html.unescape(cm.group(2)).strip("'\"")
        if not ref or ref.startswith(("#", "data:", "blob:", "about:", "javascript:")):
            continue
        abs_url = m.absolute(URL, ref)
        if m.allowed(abs_url):
            new_attr = new_attr.replace(cm.group(0), "url('" + m.rel_to(abs_url, URL) + "')")
    if new_attr != im.group(1):
        text = text.replace('style="' + im.group(1) + '"', 'style="' + new_attr + '"')

# 3) ensure every same-origin ref it now contains is on disk; fetch missing
missing = set()
for mm2 in re.finditer(r'(?:src|href|poster|data-src)="([^"]+)"', text):
    u = mm2.group(1)
    if u.startswith(("#", "data:", "mailto:", "tel:", "javascript:")):
        continue
    abs_url = m.absolute(URL, u)
    if m.allowed(abs_url) and m.is_html_like(abs_url) is False:
        key = M.url_path_key(abs_url)
        dest = os.path.join(OUT, key)
        if not os.path.exists(dest):
            missing.add(abs_url)
for u in sorted(missing):
    try:
        st, b = M.fetch(u)
        if st == 200:
            m.save(u, b)
            print("fetched", M.url_path_key(u), len(b))
        else:
            print("skip (non-200)", u, st)
    except Exception as e:
        print("skip (err)", u, e)

dest = os.path.join(OUT, "contact/index.html")
with open(dest, "w", encoding="utf-8") as f:
    f.write(text)
print("WROTE", dest, len(text), "| queued-assets seen:", len(m.assets_seen))
