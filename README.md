# scrape-startup-web

## Purpose

This project builds a **library of all startups launched in the last 24 months** and, for each one, stores an **exact replica of its website** — a full offline mirror with complete assets — in this repository.

## How it works

For every startup in the library, this repository contains a subfolder that is a faithful, self-contained copy of that startup's public website:

- **One subfolder per startup** — named after the startup (e.g. `acme-ai/`).
- **Full assets** — HTML, CSS, JavaScript, images, fonts, and any other static resources required to render the site exactly as it appears online.
- **Exact replica** — each subfolder can be opened and browsed locally, reproducing the original site's look and behavior without network access to the original domain.

The goal is a durable, versioned archive: as startups launch, pivot, or shut down, their launch-time web presence remains preserved and reproducible here.

## Selecting and capturing startups

- **Prefer mostly static marketing sites.** Client-side-rendered apps (React/SPA) render little in initial HTML and are expensive to mirror faithfully. YC batch pages are a good source of simple launch sites; see `search_methods.md` for funding-discovery feeds.
- **Static sites:** capture with `wget --mirror --page-requisites --convert-links --adjust-extension -e robots=off`, then rewrite asset URLs to relative paths so the subfolder browses offline with no server.
- **Respect robots/ToS posture:** check `robots.txt` and terms before mirroring; prefer sites that permit fetching.
- **Exception (Lemma):** JS-heavy app-router sites need a byte-identical HTML + full API-path mapping; `lemma/` uses `serve_replica.py` (see its header) because `wget` would come back near-empty.

## Repository layout

```
<startup-name>/
  index.html        # entry point of the mirrored site
  assets/           # css, js, images, fonts, ...
  ...
```

Each subfolder is a complete, standalone snapshot of that startup's website at the time it was captured.

## Startups in the library (current)

| Lemma | `lemma/` | Next.js app-router exception: byte-identical HTML + full API-path mapping via `mirror_site.py`, served via `serve_replica.py`. |
| Tsenta | `tsenta/` | |
| Nex | `nex/` | Framer site; see `search_methods.md` Framer pattern. |
| Conifer | `conifer/` | Next.js site; hydration/mirror patterns in `search_methods.md`. |
| Twin1 | `twin1/` | Turbopack site. |
| Forward | `forward/` | Astro site (useforward.co pattern). |
| Multiplier | `multiplier/` | Vite/Turbopack v2 site. |
| Ellis | `ellis/` | Vite-built SPA (ellis.ai pattern). |
| Uplane | `uplane/` | Framer site; SVG `<use>` fragment-URL rewrite fix. |
| OneCLI | `onecli/` | React App Router site, mirrored via `mirror_site.py` (220 files), served via `serve_replica.py` serve-time ref restoration. Full-page parity with live: identical height (7348px), nav 25/25 links, byte-identical SSR DOM modulo intended rewrites, `uncaught:[]` (React #418 eliminated), 0 broken images, videos streamed from origin. |
| Caution | `caution/` | Hand-rolled static SSR site (caution.co, YC S26, verifiable compute): 507/507 internal refs return HTTP 200 through the replica, byte-identical DOM in clean-room CDP audit (h1/h2=10/imgs=70/broken=0/height 7517), 36/36 headings match in David's Chrome, vision-verified hero/nav/workflow parity, video plays locally (webm 1920×1080, mp4 18.6 MB). |
| Magma | `magma/` | Next.js App Router site (magmahq.ai, YC S26): runtime-injected Basalt analytics + c15t consent scripts vendored as documented no-op stubs; 5/5 pages byte-equal DOM in clean-room CDP audit (home h1/h2=7/imgs=6/broken=0/height 5477), static pages byte-identical PNGs (MD5-equal), animated hero band = inherent frame variance, no failures/errors either side. |
| Last Accounting Company | `last-accounting-company/` | Hand-rolled no-framework static SSR site (lastaccountingcompany.com, YC S26, Helsinki, "agent-native accounting firm"): robots.txt explicitly welcomes all crawlers incl. AI bots, 34 files / 956 KB, 9/9 sitemap pages mirrored. In-page Firebase AppCheck module (gstatic CDN, mirrored byte-identically) gates the waitlist form — Google origin-attestation only succeeds on the registered domain; replicated as-is, the origin-enrollment ReCAPTCHA failure is environmental (echoes on every non-enrolled host), documented in `search_methods.md`. Homepage servable bytes == live bytes (114 315 B); clean-room CDP audit live vs replica: DOM identical (h1/h2/h3/nav/broken=0/height), article page identical too, `uncaught:[]` both sides; hero demo-cards rotate numbers via inline JS (identical scripts both sides); vision compare via browser relay + OMP computer use both confirm identical hero rendering in real Chrome. |

See `search_methods.md` for the mirroring replay log and verification recipes.
