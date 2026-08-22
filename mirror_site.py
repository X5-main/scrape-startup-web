#!/usr/bin/env python3
"""Offline mirrorer for a website with cross-host assets.

Fetches all HTML pages (BFS, bounded depth) and every asset (scripts,
stylesheets, images, fonts) referenced from HTML, CSS, or JS import
graphs, from the site origin plus any --asset-hosts, storing them under
OUTPUT preserving URL paths, and rewriting absolute URLs in HTML/CSS to
relative paths so the folder browses offline with any static server.

Framer sites (nex.ai, ...) serve HTML fully server-rendered but keep
assets (images with size-query variants, JS chunks, fonts) on
framerusercontent.com / fonts.gstatic.com — pass those hosts with
--asset-hosts. Resulting HTML files keep rewriting working because the
file layout mirrors the URL path structure (JS `./chunk.mjs` imports
stay valid offline).

Usage: python3 mirror_site.py <start-url> <output-dir> [--depth N]
                            [--asset-hosts host1,host2]
"""

import argparse
import html
import html.parser
import os
import re
import sys
import urllib.parse
import urllib.request

DEFAULT_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"

CSS_URL_RE = re.compile(r"url\((['\"]?)([^)'\"]+)\1\)")
# import "./x" | import x from "./x" | import("./x") | import(`./x`)
# Backticks: Framer rolldown bundles use template-literal chunk imports.
JS_IMPORT_RE = re.compile(r"""(?:import(?:\(|\s+[^;'"]*?\s+from)?\s*["'`]([^"'`]+)["'`])""")
STYLE_BLOCK_RE = re.compile(r"<style[^>]*>(.*?)</style>", re.S)
INLINE_STYLE_RE = re.compile(r'style="([^"]*)"')


class LinkFinder(html.parser.HTMLParser):
    """Collect (url, attr-name) candidates from HTML."""

    ATTRS = ("href", "src", "srcset", "action", "poster", "data-src", "data-href")

    def __init__(self):
        super().__init__()
        self.urls = []

    def collect(self, tag, attrs):
        for k, v in attrs:
            if not v:
                continue
            if k == "srcset":
                for part in v.split(","):
                    url = part.strip().split(" ")[0]
                    if url:
                        self.urls.append((url, "srcset"))
            elif k in self.ATTRS:
                self.urls.append((v, k))
            elif k == "content" and tag == "meta":
                # og:image / twitter:image meta content refs
                for mk, mv in attrs:
                    if mk == "property" and "image" in mv.lower():
                        self.urls.append((v, "meta"))
                        break

    def handle_starttag(self, tag, attrs):
        self.collect(tag, attrs)


def fetch(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": DEFAULT_UA,
        # image/webp first: Next.js image-optimizer responses must arrive as
        # real WebP.  With */* the optimizer serves the source's original
        # format (possibly PNG despite a .webp file name), whose bytes fail
        # to decode when the static server labels them image/webp by extension.
        "Accept": "image/webp,*/*"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.status, r.read()


def url_path_key(url):
    """Filesystem-safe storage path for a URL.

    - Extensionless or trailing-slash paths become `path/index.html`.
    - Asset-style paths (extension present) with a query string append a
      sanitized variant suffix so distinct size/crop variants never collide.
    """
    p = urllib.parse.urlparse(url)
    if p.path.startswith("/_next/image"):
        # Next.js image-optimizer URL: /_next/image?url=<asset>&w=..&q=..
        # Decode to the real asset and store under ITS key so files keep
        # their true extension (optimizer responses are image bytes), and
        # sibling width variants collapse onto one shared file.
        inner = (p.query or "").split("&")
        for part in inner:
            if part.startswith("url="):
                decoded = urllib.parse.unquote(part[4:])
                if decoded:
                    return url_path_key(decoded)
        # unparseable optimizer URL -> fall through to generic handling
    path = urllib.parse.unquote(p.path)
    if not path or path.endswith("/"):
        path += "index.html"
    else:
        last = path.split("/")[-1]
        if "." not in last:
            path += "/index.html"  # extensionless -> treat as HTML page
    if p.query and "." in path.split("/")[-1].split("?")[0]:
        safe = re.sub(r"[^A-Za-z0-9]+", "-", p.query).strip("-")[:80]
        if safe:
            dot = path.rfind(".")
            path = path[:dot] + "__" + safe + path[dot:]
    return path.lstrip("/")


class Mirror:
    def __init__(self, origin, out, depth, asset_hosts):
        self.origin = origin
        self.host = urllib.parse.urlparse(origin).netloc
        self.out = out
        self.depth = depth
        self.asset_hosts = asset_hosts
        self.queue = []
        self.pages_seen = set()
        self.assets_seen = set()
        self.downloaded = 0
        self.src_for = {}  # disk key -> source URL (for post-mirror verification)

    # ---- URL handling -------------------------------------------------
    def is_same_origin(self, url):
        p = urllib.parse.urlparse(url)
        if not p.scheme:
            return True  # protocol-relative -> same origin
        return (p.netloc == self.host
                or p.netloc.replace("www.", "") == self.host.replace("www.", ""))

    def allowed(self, url):
        """Same-origin page/asset, or an explicitly allowed asset host."""
        if self.is_same_origin(url):
            return True
        p = urllib.parse.urlparse(url)
        host = p.netloc
        if not host:
            return False
        return any(host == h or host.endswith("." + h) for h in self.asset_hosts)

    def absolute(self, base, url):
        return urllib.parse.urljoin(base, url)

    def is_html_like(self, url):
        path = urllib.parse.urlparse(url).path
        if "?" in path or path.endswith((".js", ".css", ".mjs", ".png", ".jpg",
                                         ".jpeg", ".gif", ".svg", ".webp", ".ico",
                                         ".woff", ".woff2", ".ttf", ".eot", ".txt",
                                         ".pdf", ".json")):
            return False
        return True

    def keep_live_chunk_ref(self, abs_url):
        """Next.js/Turbopack runtime refs under /_next/static/ keep their
        live URL form in the rewritten HTML instead of being rewritten to
        the mirror's relative on-disk key. The Turbopack client derives
        chunk keys from the element's src/href attribute (getAttribute)
        and awaits the matching TURBOPACK_CHUNK_LISTS/_next entry; mangling
        the attribute (NAME.js?dpl=X -> NAME__dpl-dpl-X.js) makes the key
        never match, so Promise.all over otherChunks never resolves and
        client-side hydration hangs. Files ARE still stored mangled on disk
        (url_path_key appends the query suffix); serve_replica.py maps the
        plain /_next/static/ request to the mangled file at serve time.
        Applies to any /_next/static/ ref that (a) carries a query (chunks,
        fonts, media — live form is root-absolute, so it resolves from any
        docroot level), or (b) is a .js/.mjs/.css chunk ref (stored under
        its exact URL path, absolute form works unchanged)."""
        p = urllib.parse.urlparse(abs_url)
        if not p.path.startswith("/_next/static/"):
            return False
        if p.query:
            return True
        return p.path.endswith((".js", ".mjs", ".css"))

    # ---- storage ------------------------------------------------------
    def save(self, url, body):
        key = url_path_key(url)
        dest = os.path.join(self.out, key)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        self.src_for[key] = url
        with open(dest, "wb") as f:
            f.write(body)
        self.downloaded += 1
        return dest

    def rel_to(self, abs_url, page_url):
        """Absolute URL -> filesystem path relative to the CURRENT page.

        Files are stored at their URL-derived key (e.g. images/X.png for
        https://nex.ai/images/X.png), so links inside a page at
        blog/post/index.html must be rewritten relative to that page:
        target key = blog/post/index.html, images key = ../../images/X.png.
        Root-level pages keep the plain key (images/X.png).
        """
        return os.path.relpath(
            url_path_key(abs_url), os.path.dirname(url_path_key(page_url))
        ).replace(os.sep, "/")

    def _rewrite_srcset(self, m, page_url):
        """Reparse one srcset="..." value, rewriting allowed candidates."""
        q = '"' if m.group(2) is not None else "'"
        val = m.group(2) if m.group(2) is not None else m.group(3)
        out = []
        for part in val.split(","):
            s = part.strip()
            if not s:
                continue
            toks = s.split()
            cand = html.unescape(toks[0])
            abs_c = self.absolute(page_url, cand)
            if self.allowed(abs_c):
                rest = " " + " ".join(toks[1:]) if len(toks) > 1 else ""
                out.append(self.rel_to(abs_c, page_url) + rest)
            else:
                out.append(s)
        return "srcset=" + q + ", ".join(out) + q

    # ---- asset discovery ----------------------------------------------
    def queue_css_refs(self, url, text):
        """CSS url() refs -> allowed assets."""
        for m in CSS_URL_RE.finditer(text):
            ref = m.group(2)
            abs_url = self.absolute(url, ref)
            if self.allowed(abs_url) and abs_url not in self.assets_seen:
                self.assets_seen.add(abs_url)
                self.queue.append((abs_url, -1))

    def queue_js_imports(self, url, text):
        """JS import()/import-from refs -> same-host chunk assets."""
        for m in JS_IMPORT_RE.finditer(text):
            ref = m.group(1)
            abs_url = self.absolute(url, ref)
            if self.allowed(abs_url) and abs_url not in self.assets_seen:
                self.assets_seen.add(abs_url)
                self.queue.append((abs_url, -1))

    # ---- crawling -----------------------------------------------------
    def crawl_page(self, url, depth):
        base = url
        status, body = fetch(url)
        if status != 200:
            return
        self.save(url, body)
        if not url_path_key(url).endswith(".html"):
            # Raw bytes already stored by save(); only true HTML pages get
            # link rewriting. Next.js optimizer responses (/_next/image?url=)
            # decode to extensioned image keys — treating them as pages would
            # corrupt image bytes via decode("utf-8", errors="replace").
            return

        text = body.decode("utf-8", errors="replace")
        finder = LinkFinder()
        finder.feed(text)

        rewrite = []
        for raw, attr in finder.urls:
            if raw.startswith(("#", "mailto:", "tel:", "data:", "javascript:")):
                continue
            abs_url = self.absolute(base, raw)
            if not self.allowed(abs_url):
                continue  # external links stay absolute
            rewrite.append((raw, attr, abs_url))
            if self.is_html_like(abs_url) and self.is_same_origin(abs_url):
                # page: enqueue only inside depth budget; never queue as asset
                # (an asset-crawl saves raw bytes and would clobber rewritten HTML)
                if depth < self.depth and abs_url not in self.pages_seen:
                    self.pages_seen.add(abs_url)
                    self.queue.append((abs_url, depth + 1))
            elif abs_url not in self.assets_seen:
                self.assets_seen.add(abs_url)
                self.queue.append((abs_url, -1))

        # rewrite HTML for offline browsing: href/src/srcset -> relative paths.
        # Attribute-context replacement ONLY: plain text.replace is unsafe with
        # prefix-colliding raws (e.g. "./" also prefixes "./pricing", and a
        # candidate "X.png" is a substring of its own "X.png?w=2000" srcset
        # variant). srcset values are reparsed candidate-by-candidate instead.
        for raw, attr, abs_url in rewrite:
            if self.keep_live_chunk_ref(abs_url):
                # Next.js/Turbopack assets stay in live form (see method doc)
                continue
            rel = self.rel_to(abs_url, url)
            if attr == "srcset":
                escaped = re.compile(
                    r"srcset\s*=\s*(\"([^\"]*)\"|'([^']*)')", re.S)
                text = escaped.sub(
                    lambda m: self._rewrite_srcset(m, url), text)
            else:
                attr_name = "content" if attr == "meta" else attr
                for q in ('"', "'"):
                    for cand in ({raw, raw.replace("&", "&amp;")}):
                        text = text.replace(
                            attr_name + "=" + q + cand + q,
                            attr_name + "=" + q + rel + q)

        # inline <style> blocks: rewrite url() refs to allowed assets
        for block in STYLE_BLOCK_RE.findall(text):
            for m in CSS_URL_RE.finditer(block):
                ref = html.unescape(m.group(2))
                abs_url = self.absolute(base, ref)
                if self.allowed(abs_url):
                    text = text.replace(m.group(0), "url('" + self.rel_to(abs_url, url) + "')")
                    if abs_url not in self.assets_seen and not abs_url.startswith("data:"):
                        self.assets_seen.add(abs_url)
                        self.queue.append((abs_url, -1))

        # inline style="..." attributes: rewrite url() refs to allowed assets
        for m in INLINE_STYLE_RE.finditer(text):
            attr = m.group(1)
            new_attr = attr
            for cm in CSS_URL_RE.finditer(attr):
                ref = html.unescape(cm.group(2))
                abs_url = self.absolute(base, ref)
                if self.allowed(abs_url):
                    rel = self.rel_to(abs_url, url)
                    new_attr = new_attr.replace(cm.group(0), "url('" + rel + "')")
                    new_attr = new_attr.replace(
                        cm.group(0).replace("&", "&amp;"), "url('" + rel + "')")
                    if abs_url not in self.assets_seen and not abs_url.startswith("data:"):
                        self.assets_seen.add(abs_url)
                        self.queue.append((abs_url, -1))
            if new_attr != attr:
                text = text.replace('style="' + attr + '"', 'style="' + new_attr + '"')

        # <html data-redirect-timezone="1">: Framer runtime redirects by browser
        # timezone and wipes the DOM offline — strip the flag so no redirect fires.
        text = re.sub(r"\s+data-redirect-timezone=\"1\"", "", text)

        dest = os.path.join(self.out, url_path_key(url))
        with open(dest, "w", encoding="utf-8") as f:
            f.write(text)

    def crawl_asset(self, url):
        try:
            status, body = fetch(url)
        except Exception:
            return
        if status != 200:
            return
        self.save(url, body)
        if url_path_key(url).endswith(".css"):
            text = body.decode("utf-8", errors="replace")
            self.queue_css_refs(url, text)
        elif url_path_key(url).endswith((".js", ".mjs")):
            text = body.decode("utf-8", errors="replace")
            self.queue_js_imports(url, text)

    def verify_no_missing_chunks(self):
        """Every relative JS/CSS ref in a stored asset must exist on disk."""
        missing = set()
        for root, _dirs, files in os.walk(self.out):
            for name in files:
                if not name.endswith((".js", ".mjs", ".css")):
                    continue
                path = os.path.join(root, name)
                key = os.path.relpath(path, self.out).replace(os.sep, "/")
                base = self.src_for.get(key)
                if not base:
                    continue
                try:
                    text = open(path, encoding="utf-8", errors="replace").read()
                except OSError:
                    continue
                for m in JS_IMPORT_RE.finditer(text):
                    ref = m.group(1)
                    nxt = text[m.end():m.end() + 1]
                    if "+" in ref or "${" in ref or nxt == "+":
                        # runtime-interpolated template (e.g. `+locationHref+`): not
                        # a static chunk path, cannot resolve
                        continue
                    abs_url = self.absolute(base, ref)
                    if self.allowed(abs_url):
                        dest = os.path.join(self.out, url_path_key(abs_url))
                        if not os.path.exists(dest):
                            missing.add(abs_url)
                if not name.endswith(".css"):
                    continue
                text = open(path, encoding="utf-8", errors="replace").read()
                for m in CSS_URL_RE.finditer(text):
                    ref = m.group(2)
                    if ref.startswith("#"):
                        # fragment identifier (e.g. url(#gradientId) SVG sprite ref):
                        # same-document, not a fetchable asset
                        continue
                    abs_url = self.absolute(base, ref)
                    if self.allowed(abs_url):
                        dest = os.path.join(self.out, url_path_key(abs_url))
                        if not os.path.exists(dest):
                            missing.add(abs_url)
        if missing:
            print("  !! MISSING REFERENCED FILES:")
            for u in sorted(missing):
                print(f"    {u}")
        else:
            print("  no missing referenced assets")

    def run(self):
        self.pages_seen.add(self.origin)
        self.queue.append((self.origin, 0))
        while self.queue:
            url, depth = self.queue.pop(0)
            try:
                if depth < 0:
                    self.crawl_asset(url)
                else:
                    self.crawl_page(url, depth)
            except Exception as e:
                print(f"  !! {url}: {e}", file=sys.stderr)
        self.verify_no_missing_chunks()
        print(f"mirrored {self.downloaded} files into {self.out}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("out")
    ap.add_argument("--depth", type=int, default=2)
    ap.add_argument("--asset-hosts", default="",
                    help="comma-separated extra hosts whose assets are mirrored")
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    asset_hosts = [h.strip() for h in args.asset_hosts.split(",") if h.strip()]
    Mirror(args.url, args.out, args.depth, asset_hosts).run()


if __name__ == "__main__":
    main()
