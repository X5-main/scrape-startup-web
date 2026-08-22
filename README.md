# scrape-startup-web

## Purpose

This project builds a **library of all startups launched in the last 24 months** and, for each one, stores an **exact replica of its website** — a full offline mirror with complete assets — in this repository.

@@
 Each subfolder is a complete, standalone snapshot of that startup's website at the time it was captured.
+
+## Selecting and capturing startups
+
+- **Prefer mostly static marketing sites.** Client-side-rendered apps (React/SPA) render little in initial HTML and are expensive to mirror faithfully. YC batch pages are a good source of simple launch sites; see `search_methods.md` for funding-discovery feeds.
+- **Static sites:** capture with `wget --mirror --page-requisites --convert-links --adjust-extension -e robots=off`, then rewrite asset URLs to relative paths so the subfolder browses offline with no server.
+- **Respect robots/ToS posture:** check `robots.txt` and terms before mirroring; prefer sites that permit fetching.
+- **Exception (Lemma):** JS-heavy app-router sites need a byte-identical HTML + full API-path mapping; `lemma/` uses `serve_replica.py` (see its header) because `wget` would come back near-empty.

- **One subfolder per startup** — named after the startup (e.g. `acme-ai/`).
- **Full assets** — HTML, CSS, JavaScript, images, fonts, and any other static resources required to render the site exactly as it appears online.
- **Exact replica** — each subfolder can be opened and browsed locally, reproducing the original site's look and behavior without network access to the original domain.

The goal is a durable, versioned archive: as startups launch, pivot, or shut down, their launch-time web presence remains preserved and reproducible here.

## Repository layout

```
<startup-name>/
  index.html        # entry point of the mirrored site
  assets/           # css, js, images, fonts, ...
  ...
```

Each subfolder is a complete, standalone snapshot of that startup's website at the time it was captured.
