#!/usr/bin/env python3
"""Offline mirrorer for a same-origin website.

Fetches all HTML pages (BFS, bounded depth) and every same-host asset
(scripts, stylesheets, images, fonts) referenced from HTML or CSS,
stores them under OUTPUT preserving URL paths, and rewrites absolute
URLs in HTML to relative paths so the folder browses offline with any
static server (or file://).

Usage: python3 mirror_site.py <start-url> <output-dir> [--depth N]
"""

import argparse
import html.parser
import os
import re
import sys
import urllib.parse
import urllib.request

DEFAULT_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"

CSS_URL_RE = re.compile(r"url\((['\"]?)([^)'\"]+)\1\)")


class LinkFinder(html.parser.HTMLParser):
    """Collect href/src/srcset/action/meta-url candidates from HTML."""

    ATTRS = ("href", "src")

    def __init__(self):
        super().__init__()
        self.urls = []

    def collect(self, tag, attrs):
        for k, v in attrs:
            if k in self.ATTRS and v:
                self.urls.append(v)
            elif k == "srcset" and v:
                for part in v.split(","):
                    url = part.strip().split(" ")[0]
                    if url:
                        self.urls.append(url)

    def handle_starttag(self, tag, attrs):
        self.collect(tag, attrs)


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": DEFAULT_UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.status, r.read()


def url_path_key(url):
    """Filesystem-safe path for a same-origin URL."""
    p = urllib.parse.urlparse(url).path
    p = urllib.parse.unquote(p)
    if not p or p.endswith("/"):
        p += "index.html"
    else:
        last = p.split("/")[-1]
        if "." not in last:
            p += "/index.html"  # extensionless -> treat as HTML page
    return p.lstrip("/")


class Mirror:
    def __init__(self, origin, out, depth):
        self.origin = origin
        self.host = urllib.parse.urlparse(origin).netloc
        self.out = out
        self.depth = depth
        self.queue = []
        self.pages_seen = set()
        self.assets_seen = set()
        self.downloaded = 0

    # ---- URL handling -------------------------------------------------
    def is_same_origin(self, url):
        p = urllib.parse.urlparse(url)
        if not p.scheme:
            return True  # protocol-relative -> same origin
        return (p.netloc == self.host
                or p.netloc.replace("www.", "") == self.host.replace("www.", ""))

    def absolute(self, base, url):
        return urllib.parse.urljoin(base, url)

    def is_html_like(self, url):
        path = urllib.parse.urlparse(url).path
        if "?" in path or path.endswith((".js", ".css", ".png", ".jpg", ".jpeg",
                                         ".gif", ".svg", ".webp", ".ico", ".woff",
                                         ".woff2", ".ttf", ".eot", ".txt", ".pdf",
                                         ".json")):
            return False
        return True

    # ---- storage ------------------------------------------------------
    def save(self, url, body):
        key = url_path_key(url)
        dest = os.path.join(self.out, key)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "wb") as f:
            f.write(body)
        self.downloaded += 1
        return dest

    def relative_url(self, url):
        """Absolute URL -> relative filesystem path."""
        return url_path_key(url)

    # ---- crawling -----------------------------------------------------
    def crawl_page(self, url, depth):
        base = url
        status, body = fetch(url)
        if status != 200:
            return
        self.save(url, body)

        text = body.decode("utf-8", errors="replace")
        finder = LinkFinder()
        finder.feed(text)

        rewrite = []
        for raw in finder.urls:
            if raw.startswith(("mailto:", "tel:", "data:", "javascript:")) or raw == "#":
                continue
            abs_url = self.absolute(base, raw)
            if not self.is_same_origin(abs_url):
                continue  # external links stay absolute (mirror is same-origin)
            abs_pure = abs_url  # keep query string in fetch, strip in key
            rewrite.append((raw, abs_pure))
            if self.is_html_like(abs_pure) and depth < self.depth:
                if abs_pure not in self.pages_seen:
                    self.pages_seen.add(abs_pure)
                    self.queue.append((abs_pure, depth + 1))
            else:
                if abs_pure not in self.assets_seen:
                    self.assets_seen.add(abs_pure)
                    self.queue.append((abs_pure, -1))

        # rewrite HTML for offline browsing: absolute paths -> relative
        for raw, abs_url in rewrite:
            rel = self.relative_url(abs_url)
            text = text.replace(raw, rel)
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
            for m in CSS_URL_RE.finditer(text):
                ref = m.group(2)
                abs_url = self.absolute(url, ref)
                if self.is_same_origin(abs_url) and abs_url not in self.assets_seen:
                    self.assets_seen.add(abs_url)
                    self.queue.append((abs_url, -1))

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
        print(f"mirrored {self.downloaded} files into {self.out}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("out")
    ap.add_argument("--depth", type=int, default=2)
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    Mirror(args.url, args.out, args.depth).run()


if __name__ == "__main__":
    main()
