#!/usr/bin/env python3
"""Offline replica server for a mirrored startup website.

Serves the mirrored tree (docroot) faithfully:
- GET /            -> index.html
- GET /_next/*     -> static assets (exactly as the original paths)
- GET /_next/image?url=X&w=..&q=.. -> decodes X and serves the real file,
  replacing Next.js's image optimization endpoint offline
- POST *           -> index.html (Next.js App Router RSC refresh stub)
- /relay-fgLF/*    -> analytics (PostHog) stub, returns 204/200
- /_next/static/*  -> plain-name references (RSC flight manifest emits
  `NAME.js?dpl=dpl_X` while the mirror stored `NAME__dpl-dpl-<X>.js`) are
  resolved to the on-disk mangled file so client-side hydration completes.

Usage: python3 serve_replica.py [port] [docroot]
"""
import glob
import os
import re
import sys
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

DOCROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lemma")
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8899
if len(sys.argv) > 2:
    DOCROOT = sys.argv[2]

DPL_SUFFIX = "__dpl-dpl-"


def _dpl_alternatives(relpath):
    """Map a plain /_next/static/* reference to the dpl-mangled file the
    mirror persisted on disk (`NAME__dpl-dpl-<X>.js` for `NAME.js?dpl=dpl_X`)."""
    d, base = os.path.split(relpath)
    stem, ext = os.path.splitext(base)
    hits = sorted(
        p for p in glob.glob(os.path.join(d, stem + DPL_SUFFIX + "*" + ext))
        if os.path.isfile(p)
    )
    return hits[0] if hits else None


class ReplicaHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # keep SimpleHTTPRequestHandler's traversal-safe resolution against DOCROOT
        return super().translate_path(path)

    def do_GET(self):
        parsed = urllib.parse.urlsplit(self.path)
        if parsed.path.startswith("/_next/image"):
            # serve the underlying image file for next/image optimizer requests
            q = urllib.parse.parse_qs(parsed.query)
            target = urllib.parse.unquote(q.get("url", [""])[0])
            it = urllib.parse.urlsplit(target)
            if it.scheme in ("http", "https"):
                # absolute asset URL (e.g. cdn.sanity.io) -> path only
                target = it.path
            if target.startswith("/"):
                self.path = target
                return super().do_GET()
        if parsed.path.startswith("/relay-fgLF/"):
            self.send_response(200)
            self.end_headers()
            return
        if parsed.path.startswith("/_next/static/") and DPL_SUFFIX not in parsed.path:
            # Hydration-critical: RSC flight payloads reference chunks by their
            # plain name while the mirror stored them mangled. Resolve the
            # plain reference to the on-disk file.
            mapped = _dpl_alternatives(parsed.path.lstrip("/"))
            if mapped:
                self.path = "/" + mapped
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlsplit(self.path)
        if parsed.path.startswith("/relay-fgLF/"):
            self.send_response(200)
            self.end_headers()
            return
        # RSC router refresh: respond with the initial HTML document
        self.path = "/"
        return super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    os.chdir(DOCROOT)
    ThreadingHTTPServer(("127.0.0.1", PORT), ReplicaHandler).serve_forever()
