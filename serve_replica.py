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

try:
    _TOOLSDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".tmp_tools")
    if _TOOLSDIR not in sys.path:
        sys.path.insert(0, _TOOLSDIR)
    from s3ptr import s3_presigned_url
    _S3_AVAILABLE = True
except ImportError:
    _S3_AVAILABLE = False

S3_PTR_MAGIC = b"S3PTR "

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

# avelin.ai redirect graph (live probes 2026-08-25: /docs ->307 /docs/README,
# /docs/ ->307 /docs, /docs/README/ ->307 /docs/README). The docs SPA needs
_REDIRECTS = {
    "/docs": "/docs/README",
    "/docs/": "/docs",
    "/docs/README/": "/docs/README",
}


def _ringg_redirect(path):
    """ringg.ai Next.js middleware graph (live probes 2026-08-26): every
    trailing-slash path 308s to its no-slash twin, and /blogs/<slug> 308s to
    /blog/<slug>. The sitemap's stale locs 404 terminal on live after the hop
    (blog/use-cases/industries slugs) — the mirror stores no file for them, so
    replicating the 308 keeps the terminal 404 exactly where live terminal-404s.
    Inert for other origins: caller gates on ORIGIN == "ringg.ai"."""
    if not path or path == "/":
        return None
    if path.endswith("/"):
        return path[:-1]
    if path.startswith("/blogs/"):
        return "/blog" + path[len("/blogs"):]
    return None


def _restore_ref(url, pagedir="/"):
    """Return the live-absolute byte form for a mirrored URL, or None to keep.

    Relative refs resolve against pagedir (the served page's directory under
    DOCROOT), NOT docroot: a nav ref stored as ``../marketing-to-building/``
    from page ``/post/series-b/`` must come back as ``/post/marketing-to-building``,
    never as the root-anchored ``/../marketing-to-building`` byte form (which a
    browser resolves to ``/marketing-to-building`` -> 404).
    """
    import posixpath

    if not url or url.startswith(("#", "?", "//")):
        return None
    if url.startswith(("/", "data:", "mailto:", "tel:", "javascript:")):
        return None
    if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", url):
        return None
    absu = posixpath.normpath(posixpath.join(pagedir, url))
    if not absu.startswith("/"):
        absu = "/" + absu
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
# Script/style bodies are opaque to attribute rewriting: JS template literals
# and CSS url() builders byte-match src=/href= attributes but are runtime
# code, not markup. Rewriting them corrupts JS-rendered refs (lyzr 2026-08-24:
# `<img src="${d.logo}">` became `/agent-tracker/https://www.lyzr.ai/...`,
# `'<img src="' + thumbUrl(id)` became `/videos/https://img.youtube.com/...`);
# the browser's own parser also ends a script/style at the first close tag, so
# a .*? span is byte-faithful.
# lyzr (D46) and micro1 (D55): JS builds <img>/<video> markup from template
# literals and data blobs holding URLs (`src="${d.logo}"`, `src="${b(s.src)}"`).
# A byte-global src=/href= rewrite corrupted those refs (`/agent-tracker/https://…`,
# `/benchmark/<page>/${…}`) into 404s. Span-mask script/style BODIES; the other
# mirrors keep the original global restore pass because their Next.js RSC
# payload contents were historically load-bearing for hydration — micro1 is
# Webflow static (no RSC), so on-disk script bodies ARE the live bytes.
_NON_MARKUP_RE = re.compile(rb'(<(?:script|style)\b[^>]*>)(.*?)(</(?:script|style)\s*>)', re.S)
_MASK_SCRIPT_BODIES = bool(re.search(r"lyzr\.ai", ORIGIN)) or os.path.basename(DOCROOT).startswith("micro1")


def _restore_live_html(body, pagedir="/"):
    """Rewrite mirrored relative refs to live absolute form in an HTML body."""

    # The mirror rewrites url()/src refs inside stored CSS/JS, which invalidates
    # the SRI integrity hashes crawled from the live page; the browser then
    # blocks the whole stylesheet/script (starcloud 2026-08-23: fonts dead,
    # layout 45744px). Integrity/CORS are meaningless offline — drop both.
    body = re.sub(
        rb'\s+(?:integrity|crossorigin)="[^"]*"',
        b"",
        body,
    )

    def _repl(m):
        attr = m.group(1)
        quote = m.group(2)[:1].decode("ascii")
        val = m.group(2)[1:-1].decode("utf-8", "replace")
        restored = _restore_ref(val, pagedir)
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
            restored = _restore_ref(parts[0], pagedir)
            if restored is None:
                out.append(cand)
            else:
                out.append(restored + (" " + " ".join(parts[1:]) if len(parts) > 1 else ""))
        return ('srcSet=%s%s%s' % (quote, ", ".join(out), quote)).encode()

    if not _MASK_SCRIPT_BODIES:
        # Historical global pass for non-lyzr mirrors: Next.js RSC payload
        # bodies were rewritten too; keep that byte-for-byte.
        body = _ATTR_RE.sub(_repl, body)
        return _SRCSET_RE.sub(_srcset_repl, body)

    # Rewrite only markup segments; splice script/style bodies back untouched.
    out = []
    pos = 0
    for m in _NON_MARKUP_RE.finditer(body):
        seg = body[pos:m.start()] if m.start() > pos else b""
        if seg:
            seg = _ATTR_RE.sub(_repl, seg)
            seg = _SRCSET_RE.sub(_srcset_repl, seg)
        out.append(seg)
        # Open tag attrs (src=/href= on <script>/<style> itself) are still
        # markup: restore them exactly as the pre-2026-08-24 global pass did.
        # Only the tag BODY (JS/CSS runtime text) is kept byte-verbatim.
        tag = m.group(1)
        if tag:
            tag = _ATTR_RE.sub(_repl, tag)
            tag = _SRCSET_RE.sub(_srcset_repl, tag)
        out.append(tag + m.group(2) + m.group(3))
        pos = m.end()
    tail = body[pos:]
    if tail:
        tail = _ATTR_RE.sub(_repl, tail)
        tail = _SRCSET_RE.sub(_srcset_repl, tail)
    out.append(tail)
    return b"".join(out)



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


def _sniffs_as_css(body):
    """Tight sniff: no mark-up at the head and an @font-face rule inside."""
    return b"<" not in body[:128] and b"@font-face" in body[:1024]


class ReplicaHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # keep SimpleHTTPRequestHandler's traversal-safe resolution against DOCROOT
        p = super().translate_path(path)
        if not os.path.exists(p):
            # The mirror stored some Turbopack asset filenames verbatim, with a
            # literal `%20` in the on-disk name (`...gdocs%20(2).svg`). The base
            # lookup unquotes the request (`%20` -> space) and misses. Re-run
            # against the raw (double-encoded) path so the literal name resolves.
            raw = super().translate_path(urllib.parse.quote(path, safe="/"))
            if os.path.exists(raw):
                return raw
            # CSS url() inside a custom property (`mask:var(--lw-src)`) resolves
            # against the base of the STYLESHEET that consumes the var (a
            # /_next/static/chunks/*.css), not the page where --lw-src is set.
            # The mirror stores such CDN assets flat at DOCROOT root
            # (url_path_key keeps only the CDN URL's basename, e.g.
            # landing-logo-uber.svg?ver -> landing-logo-uber__ver.svg). If the
            # chunk-relative lookup misses, serve the root copy.
            root = os.path.join(DOCROOT, os.path.basename(p))
            if os.path.isfile(root):
                return root
        return p

    def do_GET(self):
        parsed = urllib.parse.urlsplit(self.path)
        q = urllib.parse.parse_qs(parsed.query)
        ver = q.get("v", [""])[0]
        if ver:
            # Version stamps are not always numeric (usenaive
            # `hotel-du-louvre-map.png?v=20260720-grey`); resolve the fold
            # whenever a `__v-<ver>` twin exists on disk, no twin -> unchanged.
            vmap = _v_alternatives(parsed.path.lstrip("/"), ver)
            if vmap:
                self.path = "/" + vmap
        # DOCROOT is relative and the server chdir'd into it at startup, so
        # resolve against CWD (like SimpleHTTPRequestHandler.translate_path).
        rsc_file = os.path.join(os.getcwd(), "_rsc_index.bin")
        if os.path.isfile(rsc_file) and (
            self.headers.get("RSC") == "1" or "_rsc" in q
        ):
            if parsed.path in ("/", "/_index"):
                with open(rsc_file, "rb") as fh:
                    body = fh.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/x-component")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
        if parsed.path == "/_not-found":
            # live serves 200 for the not-found doc; mirror so prefetch 200s
            self.path = "/"
            return super().do_GET()
        if parsed.path.startswith("/_next/image"):
            # serve the underlying image file for next/image optimizer requests
            raw = ""
            for part in parsed.query.split("&"):
                if part.startswith("url="):
                    raw = part[4:]
            # one decode, mirroring mirror_site.url_path_key's recursion
            target = urllib.parse.unquote(raw)
            it = urllib.parse.urlsplit(target)
            path = None
            if it.scheme in ("http", "https"):
                # absolute asset URL (e.g. cdn.sanity.io) -> path only
                path = urllib.parse.unquote(it.path)
            elif target.startswith("/"):
                path = target
            if path:
                # Version-query stamp on the CDN URL is folded into the stored
                # name (`name.png?ver` -> `name__ver.png`, mirror_site.url_path_key);
                # 38k optimizer refs carry such a query, so re-apply the fold or
                # the lookup 404s.
                if it.query and "." in path.rsplit("/", 1)[-1]:
                    safe = re.sub(r"[^A-Za-z0-9]+", "-", it.query).strip("-")[:80]
                    if safe:
                        dot = path.rfind(".")
                        path = path[:dot] + "__" + safe + path[dot:]
                self.path = path
                return super().do_GET()
        if parsed.path.startswith("/relay-fgLF/"):
            self.send_response(200)
            self.end_headers()
            return
        if parsed.path == "/api/users/me":
            body = b'{"user":null,"message":"Account"}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if parsed.path.startswith("/ingest/"):
            # PostHog telemetry beacon (config.js + config?_= + event POSTs).
            # Offline replica: no-op 200, real analytics are irrelevant here.
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(b"{}")))
            self.end_headers()
            self.wfile.write(b"{}")
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
        if parsed.path == "/api/time":
            import time as _time
            body = b'{"now":%d}' % int(_time.time() * 1000)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if "ringg.ai" in ORIGIN:
            loc = _ringg_redirect(parsed.path)
            if loc:
                self.send_response(308)
                self.send_header("Location", loc)
                self.send_header("Content-Length", "0")
                self.end_headers()
                return
        if parsed.path in _REDIRECTS and "avelin.ai" in ORIGIN:
            # avelin.ai: `/docs` (and trailing-slash/README variants) 307 on live;
            # the docs SPA resolves content by URL path, so serving the redirect
            # target's bytes at a redirect path makes the client render its own
            # "Document not found" view. Mirror the 307 chain for parity.
            self.send_response(307)
            self.send_header("Location", _REDIRECTS[parsed.path])
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        full = self.translate_path(self.path)
        if _S3_AVAILABLE and os.path.isfile(full) and self._s3_redirect(full):
            return
        if DPL_SUFFIX not in parsed.path and not full.lower().endswith((".html", ".htm")):
            # Hydration-critical: RSC flight payloads reference chunks by their
            # plain name while the mirror stored them mangled. Resolve the
            # plain reference to the on-disk file so those fetches 200.
            mapped = _dpl_alternatives(parsed.path.lstrip("/"))
            if mapped:
                self.path = "/" + mapped
        full = self.translate_path(self.path)
        if not os.path.exists(full) and os.path.isfile(full + ".html"):
            # Extensionless nav refs that name a bare file (`/index` -> the
            # root `index.html`, mintlify docs-home links) resolve that way on
            # live; the base dir lookup only covers `dir/index.html`.
            full = full + ".html"
        if os.path.isdir(full):
            # Directory without an index (mirror crawler never discovered the
            # route, e.g. a top-level index hidden behind a live redirect or a
            # live-404 nav route): 404 like live instead of the raw file
            # listing (parity, #d43). Faithful: live Next.js 404s these paths.
            if not os.path.isfile(os.path.join(full, "index.html")):
                self.send_error(404, "Not Found")
                return
            # SimpleHTTPRequestHandler serves index.html for a directory; we
            # must transform those bytes too, so resolve before the suffix check.
            full = os.path.join(full, "index.html")
        if full.lower().endswith((".html", ".htm")):
            try:
                with open(full, "rb") as fh:
                    body = fh.read()
            except OSError:
                return super().do_GET()
            # Extensionless external CSS (fonts.googleapis.com css2) is stored
            # under a .html key (url_path_key treats extensionless paths as pages).
            # Chrome refuses to apply a stylesheet served as text/html -- sniff so
            # it reaches the browser as text/css without the HTML munging below.
            if _sniffs_as_css(body):
                self.send_response(200)
                self.send_header("Content-Type", "text/css; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            rel_dir = os.path.relpath(os.path.dirname(full), DOCROOT)
            pagedir = "/" + rel_dir.replace(os.sep, "/") if rel_dir != "." else "/"
            body = _restore_live_html(body, pagedir)
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        return super().do_GET()


    def _s3_redirect(self, full):
        """If `full` is an oversized-asset pointer (``S3PTR <key>`` first line),
        302 to a freshly SigV4-presigned URL and return True."""
        try:
            with open(full, "rb") as fh:
                head = fh.read(64)
            if not head.startswith(S3_PTR_MAGIC):
                return False
            key = head[len(S3_PTR_MAGIC):].split(b"\n", 1)[0].decode("utf-8").strip()
            if not key:
                return False
            self.send_response(302)
            self.send_header("Location", s3_presigned_url(key))
            self.send_header("Content-Length", "0")
            self.end_headers()
            return True
        except OSError:
            return False

    def do_HEAD(self):
        full = self.translate_path(self.path)
        if _S3_AVAILABLE and os.path.isfile(full) and self._s3_redirect(full):
            return
        return super().do_HEAD()

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
