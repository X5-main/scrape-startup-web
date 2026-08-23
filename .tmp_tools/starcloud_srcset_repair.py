#!/usr/bin/env python3
"""Targeted repair of Webflow srcset URLs corrupted by space-in-filename
candidates (mirror_site.py pre-fix: whitespace split truncated the URL at
the first space; the extensionless remainder got `/index.html` injected and
the filename rest re-joined raw).

Repair: parse every srcset attribute with the fixed candidate parser,
reconstruct the intended relative path (drop the injected `/index.html `
token), verify each candidate resolves to an on-disk file, and drop
candidates that cannot.  Bytes outside srcset attributes stay untouched.

Run: python3 starcloud_srcset_repair.py   (from repo root)
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from mirror_site import srcset_candidates  # fixed parser

SRCSET_ATTR_RE = re.compile(r'srcset\s*=\s*("[^"]*"|\'[^\']*\')', re.S)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIRROR = os.path.join(ROOT, "starcloud")

# One injected path token: <sha24>_<Word>/index.html <Rest...>
INJECT_RE = re.compile(r"/([a-f0-9]{24}_[^/\s]+)/index\.html(?=\s)")


def repair_file(path):
    text = open(path, encoding="utf-8").read()
    new_text = text
    changed = 0
    dropped = 0
    kept = 0
    checked_files = 0

    def repair_attr(m):
        nonlocal changed, dropped, kept, checked_files
        q = m.group(1)[0]
        val = m.group(1)[1:-1]
        out = []
        for cand, suffix in srcset_candidates(val):
            url = cand
            if INJECT_RE.search(url):
                # mangled:  <...>/<sha24>_<Word>/index.html <Rest> [desc]
                url = INJECT_RE.sub(lambda mm: "/" + mm.group(1), url, count=1)
                url = re.sub(r"\s{2,}", " ", url)
            target = os.path.normpath(os.path.join(os.path.dirname(path), url))
            if os.path.isfile(target):
                out.append(url + suffix)
                kept += 1
            else:
                dropped += 1  # dead candidate: base src still renders the asset
        if out:
            changed += 1
        return "srcset=" + q + ", ".join(out) + q

    new_text = SRCSET_ATTR_RE.sub(repair_attr, new_text)
    if new_text != text:
        open(path, "w", encoding="utf-8").write(new_text)
        return (changed, dropped, kept)
    return (0, dropped, kept)


def main():
    total_c = total_d = total_k = 0
    affected = []
    for dirpath, _dirs, files in os.walk(MIRROR):
        for fn in files:
            if not fn.endswith(".html"):
                continue
            p = os.path.join(dirpath, fn)
            c, d, k = repair_file(p)
            total_c, total_d, total_k = total_c + c, total_d + d, total_k + k
            if c or d:
                rel = os.path.relpath(p, ROOT)
                affected.append((rel, c, d, k))
                print(f"  {rel}: attrs_rewritten={c} candidates_kept={k} dropped={d}")
    print(f"\ntotal srcset attrs rewritten: {total_c}; candidates kept {total_k}; dropped {total_d}")
    if not affected:
        print("no corruption remaining")


if __name__ == "__main__":
    main()
