#!/usr/bin/env python3
"""Offline replica server for a mirrored startup website.

Serves the mirrored tree (docroot) faithfully:
- GET /            -> index.html
- GET /_next/*     -> static assets (exactly as the original paths)
- GET /_next/image?url=X&w=..&q=.. -> decodes X and serves the real file,
  replacing Next.js's image optimization endpoint offline
- POST *           -> index.html (Next.js App Router RSC refresh stub)
- /relay-fgLF/*    -> analytics (PostHog) stub, returns 204/200

Usage: python3 serve_replica.py [port] [docroot]
"""
import os
import re
import sys
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

DOCROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lemma")
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8899
if len(sys.argv) > 2:
    DOCROOT = sys.argv[2]

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
            if target.startswith("/"):
                self.path = target
                return super().do_GET()
        if parsed.path.startswith("/relay-fgLF/"):
            self.send_response(200)
            self.end_headers()
            return
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
