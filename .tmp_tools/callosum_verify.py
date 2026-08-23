#!/usr/bin/env python3
"""Run verify_no_missing_chunks against an existing mirror without re-crawling.

Crawl-discovered files record src_for[key] = source URL; rebuild that map
from the on-disk layout (key -> same-origin URL), then invoke the verifier.
This is the identical check that runs at the end of a full crawl.
"""
import os
import sys
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from mirror_site import Mirror  # noqa: E402

ORIGIN = "https://www.callosum.com/"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "callosum")

m = Mirror(ORIGIN, OUT, 2, [])
for root, _dirs, files in os.walk(OUT):
    for name in files:
        path = os.path.join(root, name)
        key = os.path.relpath(path, OUT).replace(os.sep, "/")
        m.src_for[key] = urllib.parse.urljoin(ORIGIN, key)
m.verify_no_missing_chunks()
