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
| General Legal | `general-legal/` | Webflow site (general.legal, YC W26, AI-native law firm): 797 files / 58 MB, 124 HTML pages, **115/115 sitemap URLs covered** via new `--sitemap auto` seeding (zero-inbound orphans `/old-home`, `/compare/harvey`, `/features/contract-review`, `/ainlc-2026` are BFS-unreachable); served via `serve_replica.py` on 8912. Clean-room CDP audit home + article: byte-identical DOM both sides (71/71 imgs 0 broken, height 9391, scripts 37, `failures:[]` `uncaught:[]`); article screenshots md5-identical; home pixel diff 0.186% < replica self-jitter 0.207% = hero animation frames, not drift. Live's own dead refs (investors logos 404, Webflow plugins placeholder 403-to-all) mirrored faithfully as broken; Intellimize + Osano external runtimes documented as environmental (not stubbed); vision compare via relay CDP + computer-use Safari windows read hero/banner verbatim-identical. |
| Hilstart | `hilstart/` | Nuxt 3 SSR site (hilstart.io, YC S26, "Autonomous Hardware Testing"): 37 files fully self-hosted, BFS-only crawl (sitemap.xml returns the Nuxt SPA fallback shell — no XML seeding), CF Email Protection decrypted client-side by mirrored `email-decode.min.js`; served via `serve_replica.py` on 8913. Clean-room CDP audit live vs replica: title/h1/imgs 6/6 broken 0/bodyH 5874/docW 1440/textLen 4323/scripts 4/css 3 identical, `errs:[]` both; full-page pixel diff 0.133% (hero band only, < D14 self-jitter floor); relay vision + innerText specs byte-identical; OMP computer-use AX trees content-identical. RUM beacon `static.cloudflareinsights.com` external per precedent. |
| Kebra | `kebra/` | Next.js Turbopack site (kebra.com, YC S26, "Making the field queryable"): 64 files fully self-hosted incl. both hero mp4s + poster, real sitemap.xml seeded (`--sitemap auto`, 5 HTML pages), served via `serve_replica.py` on 8914. Served bytes == live bytes (66 983 == 66 983, `?dpl=` refs restored at serve time); clean-room CDP audit: title/h1/imgs 16/16 broken 0/bodyH 7189/docW 1440/textLen 1714/scripts 27 identical, `errs:[]` both; innerText byte-identical (1 737 B); pixel band-map: every differing row inside the two animated video blocks (hero + s3 demo), all ~13k static rows byte-identical (video codec-state delta is inherent); relay vision + cua-driver computer-use AX trees content-identical (110==110 elements, sole divergence = address-bar `kebra.com` vs `127.0.0.1:8914`). GA4 + Google Appointments embed external per precedent. |

| River | `river/` | Hand-rolled static SSR site (river.ai, raised $1.1B across Series Seed + Series A, announced 2026-08-11): 42 files (41 mirrored + `.origin`), 9/9 sitemap URLs, served via `serve_replica.py` on 8915. Query-versioned assets (`styles.css?v=49` etc.) restored at serve time via new generic `__v-` rule — `styles.css?v=49` byte-identical (74 745 B == live); resolved-URL parity bar: 7 syntactic byte diffs (abs/relative forms + 2 unrecoverable fragments) all resolve identically in-browser; 214-ref sweep, all real assets 200; relay vision + computer-use window leg content-identical (hero headline + subhead + nav API/Blog/Careers), sole divergence = address bar (`river.ai` vs `127.0.0.1:8915`); CF Web Analytics beacon runtime injection + hero-headline rotator = documented non-parity runtime classes. |
| Wispr | `wispr/` | Webflow site (wisprflow.ai, YC S26, AI voice-memo productivity app): 326 HTML pages / 127 MB, all three Webflow project CDN prefixes (`682f84b3…`/`682fa127…`/`6838259b…`) stored under URL path, served via `serve_replica.py` on 8916. Webflow asset-host recipe documented — `--asset-hosts` is host-only (`cdn.prod.website-files.com` suffices, project IDs are dead entries); BFS covered 308/308 sitemap URLs. Real gap found + fixed 2026-08-23: Rive animations embed `.riv` via `data-rive-url` (was missing from `LinkFinder.ATTRS` → 11 refs stayed absolute CDN); added to `ATTRS` + targeted in-place repair (7 `.riv` files, ~2.1 MB, fetched into mirror, refs rewritten pagedir-relative, `&`/space-decode identical to `url_path_key`); replica serves all rewritten refs 200. fswp3 whole-site sweep: 326 pages / 0 serve bugs; residual 3 = faithful live-404 trio (2× Webflow plugins placeholder svg + 1 workflow link); commented `<video poster>` refs are dead markup (inside `<!-- -->`). Visible-text parity spot-check live vs replica: home 16976==16976 chars, features 5198==5198 bytes-identical. Leftover external dep: `unpkg.com/@rive-app/canvas` runtime only (third-party, unvendored per precedent). See `search_methods.md` Webflow section. |
See `search_methods.md` for the mirroring replay log and verification recipes.
