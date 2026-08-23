#!/usr/bin/env python3
"""Offline replica server for a mirrored startup website.

Serves the mirrored tree (docroot) faithfully:
- GET /            -> index.html
- GET /_next/*     -> static assets (exactly as the original paths)
- GET /_next/image?url=X&w=..&q=.. -> decodes X and serves the real file,
  replacing Next.js's image optimization endpoint offline
- POST *           -> index.html (Next.js App Router RSC refresh stub)
 /relay-fgLF/*    -> analytics (PostHog) stub, returns 204/200
 /api/github-stars, /api/status -> mirror-time snapshots of the live API
  (footer badges render identically; values frozen at capture time)
 *                -> any plain-name ref whose `__dpl-dpl-`-mangled twin
  exists on disk is served from that file (Turbopack images under /assets/,
  /badges/ keep their live `?dpl=` URL form in the stored HTML; the server
  maps to the mangled file at serve time).

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
V_SUFFIX = "__v-"
# Serve-time reverse transform: the mirror rewrote every href/src/poster to a
# RELATIVE ref and baked Turbopack `?dpl=` filenames into /assets|/badges names
# (`NAME__dpl-dpl-<X>.ext`). React hydrates the DOM against the RSC flight
# payload, which carries the LIVE absolute forms (`/assets/NAME.png?dpl=dpl_X`,
# `/_next/static/media/...woff2`, full-origin video URLs) — so the served bytes
# must present live form or hydration fails (#418). This map reconstructs live
# form per ref; disk lookup for the served file is unchanged (_dpl_alternatives).
# Plain query-versioned refs (`styles.css?v=49`) are stored as `styles__v-49.css`
# and restored the same way, with the on-disk twin resolved by _v_alternatives.
ORIGIN = ""
_origin_file = os.path.join(DOCROOT, ".origin")
if os.path.isfile(_origin_file):
    ORIGIN = open(_origin_file, encoding="utf-8").read().strip()


def _restore_ref(url):
    """Return the live-absolute byte form for a mirrored URL, or None to keep."""
    import posixpath

    if not url or url.startswith(("#", "?", "//")):
        return None
    if url.startswith(("/", "data:", "mailto:", "tel:", "javascript:")):
        return None
    if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", url):
        return None
    absu = "/" + posixpath.normpath(url)
    base = absu.rsplit("/", 1)[-1]
    m = re.match(r"^(?P<dir>.*/)?(?P<stem>.+?)" + re.escape(DPL_SUFFIX) + r"(?P<tok>[A-Za-z0-9]+)(?P<ext>\.\w+)$", absu)
    if m:
        # group('dir') already carries the leading '/' (dir + stem = absu path).
        return "%s%s?dpl=dpl_%s" % (m.group("dir") or "/", m.group("stem") + m.group("ext"), m.group("tok"))
    m = re.match(r"^(?P<dir>.*/)?(?P<stem>.+?)" + re.escape(V_SUFFIX) + r"(?P<ver>\d+)(?P<ext>\.\w+)$", absu)
    if m:
        # query-folded refs (`styles.css?v=49` stored as `styles__v-49.css`)
        return "%s%s?v=%s" % (m.group("dir") or "/", m.group("stem") + m.group("ext"), m.group("ver"))
    # The onecli replica keeps live-origin mp4 refs (React flight payload parity);
    # every other site serves its mirrored mp4 from the replica itself.
    if base.endswith(".mp4") and "onecli.sh" in ORIGIN:
        return ORIGIN + absu if ORIGIN else absu
    if re.match(r"^onecli-full-logo(-dark)?\.png$", base):
        tok = "dpl_FDFXHVrLEJVFDWvwEtkNAZFRP8Gj"
        return "/_next/image?url=%%2F%s&amp;w=1920&amp;q=75&amp;dpl=%s" % (base, tok)
    if base == "icon__icon-2556a84e-png.png":
        return "/icon.png?icon.2556a84e.png"
    if absu.endswith("/index.html"):
        # `/product/index.html` -> `/product` (live nav links are extensionless,
        # no trailing slash); root `/index.html` -> `/`.
        return absu[: -(len("index.html"))].rstrip("/") or "/"
    return absu


_ATTR_RE = re.compile(rb'\b(href|src|poster)=("[^"]*"|\'[^\']*\')')
_SRCSET_RE = re.compile(rb'\bsrcSet=("[^"]*"|\'[^\']*\')')


def _restore_live_html(body):
    """Rewrite mirrored relative refs to live absolute form in an HTML body."""

    def _repl(m):
        attr = m.group(1)
        quote = m.group(2)[:1].decode("ascii")
        val = m.group(2)[1:-1].decode("utf-8", "replace")
        restored = _restore_ref(val)
        if restored is None:
            return m.group(0)
        return ('%s=%s%s%s' % (attr.decode(), quote, restored, quote)).encode()

    def _srcset_repl(m):
        quote = m.group(1)[:1].decode("ascii")
        raw = m.group(1)[1:-1].decode("utf-8", "replace")
        out = []
        for cand in raw.split(","):
            parts = cand.strip().split()
            if not parts:
                continue
            restored = _restore_ref(parts[0])
            if restored is None:
                out.append(cand)
            else:
                out.append(restored + (" " + " ".join(parts[1:]) if len(parts) > 1 else ""))
        return ('srcSet=%s%s%s' % (quote, ", ".join(out), quote)).encode()

    body = _ATTR_RE.sub(_repl, body)
    return _SRCSET_RE.sub(_srcset_repl, body)


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


def _v_alternatives(relpath, ver):
    """Map a query-versioned ref (`styles.css?v=49`) to the folded file the
    mirror stored on disk (`styles__v-49.css`)."""
    d, base = os.path.split(relpath)
    stem, ext = os.path.splitext(base)
    cand = os.path.join(d, "%s%s%s%s" % (stem, V_SUFFIX, ver, ext))
    return cand if os.path.isfile(cand) else None


class ReplicaHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # keep SimpleHTTPRequestHandler's traversal-safe resolution against DOCROOT
        return super().translate_path(path)

    def do_GET(self):
        parsed = urllib.parse.urlsplit(self.path)
        q = urllib.parse.parse_qs(parsed.query)
        ver = q.get("v", [""])[0]
        if ver and ver.isdigit():
            vmap = _v_alternatives(parsed.path.lstrip("/"), ver)
            if vmap:
                self.path = "/" + vmap
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
        if parsed.path == "/api/github-stars":
            body = b'{"stars":3368}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if parsed.path == "/api/status":
            body = b'{"operational":true}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        full = self.translate_path(self.path)
        if DPL_SUFFIX not in parsed.path and not full.lower().endswith((".html", ".htm")):
            # Hydration-critical: RSC flight payloads reference chunks by their
            # plain name while the mirror stored them mangled. Resolve the
            # plain reference to the on-disk file so those fetches 200.
            mapped = _dpl_alternatives(parsed.path.lstrip("/"))
            if mapped:
                self.path = "/" + mapped
        full = self.translate_path(self.path)
        if os.path.isdir(full):
            # SimpleHTTPRequestHandler serves index.html for a directory; we
            # must transform those bytes too, so resolve before the suffix check.
            full = os.path.join(full, "index.html")
        if full.lower().endswith((".html", ".htm")):
            try:
                with open(full, "rb") as fh:
                    body = fh.read()
            except OSError:
                return super().do_GET()
            body = _restore_live_html(body)
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
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
        return self.do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    os.chdir(DOCROOT)
    ThreadingHTTPServer(("127.0.0.1", PORT), ReplicaHandler).serve_forever()
