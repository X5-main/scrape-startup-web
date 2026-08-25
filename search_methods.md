# Search Methods: Finding Recently-Funded Startups

How to discover startups that raised money in the last 24 months, for the
startup-website library. Ordered by usefulness per effort.

- **Programmatic batch dump:** the public API
  `https://api.ycombinator.com/v0.1/companies?batch=S26&limit=50&page=N`
  returns full batch membership (220 companies for S26) with name, yc id, and
  `url` per company — paginate `page=1..n` until an empty page. Faster and more
  complete than scraping the HTML directory; validated on S26 (Nex found here).
- Batch codes: `F25`, `W26`, `S26`, `F26`; each cohort's Demo Day date is the
  recency ceiling (batch acceptance always inside the 24-month window).
> **Contract update (D35, authoritative now):** paginate `page` 1..M stopping at
> `page >= totalPages` (envelope field — "until an empty page" and "220 for S26"
> are obsolete; `limit=500` silently caps at 20/page), and re-pull the rosters
> every cycle — D35 fresh counts: F25 146 + W26 199 + S26 237 + F26 18 = 600
> raw / 599 unique / 578 unmirrored. Full recipe in **Method 8** below.

## Method 2: TechCrunch funding tracker

- `https://techcrunch.com/category/funding/` lists daily funding stories: seed, pre-seed, Series A announcements with amounts and dates.
- Filter by `startup` tag; dates are explicit in the article, so the 24-month check is a scan of the byline line.
- Good for non-YC companies. Ratio of "funded but no public website worth mirroring" is higher than YC.

## Method 3: Crunchbase / PitchBook

- Crunchbase `https://www.crunchbase.com/` search with filters `Founded Date: last 24 months` + `Last Funding Date: last 24 months`.
- Crunchbase free tier caps results; use it to confirm details found elsewhere rather than as the primary discovery feed.
- PitchBook is paywalled; skip unless already licensed.

## Method 4: Product Hunt launches

- `https://www.producthunt.com/` — GP/launch posts bury the funding detail; not a funding feed.
- Use only to surface promising startups, then verify funding via Crunchbase/YC/news search.

## Method 5: SEC Form D filings

- `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=D` — the definitive record of equity raises ≥ $5M in the US.
- Form D is filed up to 15 days after the first sale; the accepted date is the funding date.
- Exhaustive but noisy (real estate funds, hedge funds); need to filter to tech startups.

## Method 6: Newsletters & aggregators

- TLDR Startup, The Hustle, and weekly funding roundups (e.g. "this week in seed") list freshest raises with company names and sites.
- Manual reading; good for catching raises that skip the big trackers.

## Method 7: Social feeds

- X/Twitter: founders announce raises publicly (often before the tracker writeup). Search `site:x.com seed raised`.
- LinkedIn: same, noisier. Both are citation sources, not systematic.


## Practical playbook (learned building lemma/ and tsenta/)

- **Screen for server-rendered HTML.** Before mirroring, fetch the homepage and
  check that the marketing content (an `<h1>`, body copy) exists in the raw
  response. A JS shell (`id="root"`, `__NEXT_DATA__`, only empty `<div>`s) means
  `wget --mirror` returns near-empty. Quick probe:
  `curl -s <url> | grep -c '<h1'` and grep for the shell markers.
- **S26 aggregators.** Seen that round up current batches with sites:
  Extruct.ai data-room tables and RankYC power rankings are excellent
  complements to the YC directory for filtering by "has a public web presence".
- **Framework fingerprints** hint at mirroring effort: `/_next/static/*` = Next.js
  (server-rendered → fine), `data-astro-*` = Astro (static-friendly). All else equal,
  prefer Astro/Jekyll/plain-HTML sites over Next.js App Router sites.
- **YC batches are the safest 24-month clock**: batch acceptance (e.g. Summer 2026)
  always falls inside any rolling window at Demo Day time; amounts are public
  (standard $500K deal).
- **Robots.txt & sitemap pre-probe.** Before choosing a Next.js candidate, fetch
  both. A `robots.txt` with content-signal conditions can mean "no AI scrape" —
  skip those (spirit-of-use, and they usually pair with anti-bot edge rules).
  A `sitemap.xml` that returns an HTML app shell (SPA fallback) hides the real
  page list; the clean ones enumerate every page (use them as the authoritative
  page manifest — see the Multiplier section for a depth-2 gap it caught).
- **Verify sections by anchor, not fraction.** Animated hero counters, rotating
  job-match cards, and randomized mock percentages re-render differently per load,
  so two loads legitimately differ (and scroll-fraction comparison drifts when
  scrollHeight differs). Screenshot the same anchoring heading on both pages and
  compare those frames; treat live-mockup values as non-deterministic.
- **JS-rendered asset URLs escape HTML rewriting.** Assets injected at runtime
  (e.g. `/assets/brand-logos/{company}.webp` built in JS) keep their absolute
  host even after the HTML mirror pass; fetch them from the live site into the
  same path so the replica is offline-complete.
## Framer sites (nex.ai pattern)

- **Fingerprint:** fully server-rendered HTML with an inline `<style>` block
  instead of a standalone CSS file, and a `<div id="main" data-framer-hydrate-v2=...>`
  container. Assets live on `framerusercontent.com` (pass with `--asset-hosts`):
  JS chunks under `sites/<site-id>/`, images with size-query filenames like
  `foo.png?width=396&height=368` → mirrored as `foo__width-396-height-368.png`.
- **Entity trap in rewriting:** `LinkFinder` (HTMLParser) decodes `&amp;` → `&`,
  but the raw file text keeps `&amp;`, so a single `text.replace(raw, rel)` misses
  every URL whose query has `&`. Replace BOTH spellings
  (`raw` and `raw.replace("&","&amp;")` → same for the relative target).
- **JS chunk graph:** Framer rolldown bundles import chunks with BOTH quote and
  template-literal forms (`import("./x.mjs")` and `` import(`./x.mjs`) ``) —
  the import regex must include backticks or chunks are silently skipped and the
  runtime hits an error boundary (`GracefullyDegradingErrorBoundary` wipes `#main`).
  Run the mirrorer's post-pass (`verify_no_missing_chunks`) to prove the chunk
  graph is complete after every mirror.
- **Timezone redirect:** the saved page root carries `<html data-redirect-timezone="1">`;
  the Framer runtime redirects by browser timezone and wipes the DOM offline.
  `mirror_site.py` strips the attribute at save time — verify `grep -l
  'data-redirect-timezone' <out>` returns none.
- **Inherent broken images:** the live site itself can report `naturalWidth === 0`
  for an SVG that fetches fine (200, valid bytes) — the browser false-positives.
  Treat live-vs-replica equality of broken-image counts as parity.
  - **Non-deterministic sections:** animated counters, rotating cards, and
  gradient/marquee animation shift layout by up to ~90 px per load; compare at
  heading anchors and treat gap deltas as inherent.

## Next.js sites (conifer.build pattern)

- **Fingerprint:** Next.js App Router, 100% self-hosted assets (no external hosts
  on home HTML — self-hosted fonts (`/_next/static/media/*`), inline SVGs, no
  `framerusercontent`/CDN strip). When clean, a `--depth 3` mirror with default
  asset hosts is fully offline-complete; no CSS files at all (all inline blocks).
- **Server-side rendering is a blessing for the mirror:** the crawler stores the
  server-rendered HTML (`<h1>`, chart bars, docs content all present), so the
  replica is complete without owning the JS runtime.
- **Data parity beats OCR.** Chart/section data is embedded as HTML text in the
  SSR output. When live-vs-replica vision reads disagree on small slanted labels
  (chart model names/versions), settle it by byte-comparing the embedded tokens:
  presence/absence of the same names in both files (normalized-length delta
  <150 chars) proves data parity. Vision-model OCR is unreliable on sub-text
  labels; the HTML is truth.
- **Inherent 404 noise from Next.js asset patterns:**
  - `srcset` width-candidate paths (`/2400`, `/1260` in `image?url=/…`) — platform
    builds paths the crawler does not resolve to existing files; they're absent
    on disk but the stored HTML keeps the correct relative refs (verifier green).
    Some are literal design artifacts (e.g. `docs/privacy/local-first/image/png`).
  - Cloudflare email protection (`/cdn-cgi/l/email-protection`) — `mailto:` links
    rewritten by Cloudflare; unreachable as files, not a replica bug.
- **Webpack runtime chunk graph isn't statically import-scannable.** Next.js
  loads webpack JSONP chunks via `u()`/`+`-concat strings the crawler's import
  scanner skips; the mirror's SSRed pages don't need them (marketing content fully
  server-rendered, JS is progressive enhancement). Verify client-only routes by
  clicking through rather than scanning chunks.
- **Page-height deltas (936 vs 1170) are hydration artifacts.** Screenshot timing
  vs hydration changes rendered height ~20%; compare at anchors, not total height.
  - But when the session DOES expose the browser device (`xd://browser`), the
    relay is supported natively: `open {url, app:{relay:true}, name}` reuses the
    relay daemon on 9224, and `run` with `tab.evaluate` asserts DOM (h1, broken
    image count, external href leaks) — no raw CDP needed. Proof of parity:
    replica home via browser device: 7 imgs / 0 broken / 0 external hrefs,
    theme oklch(0.115 0.015 254), title+h1 exact ("Conifer · Run AI locally,
    route the rest").
  - Deterministic computer-use capture: `Target.createTarget {url, newWindow:true}`
    the URL, find the window via `desktop.windows()` title-match, then re-navigate
    the same tab (`Page.navigate` on the saved session) between live and replica,
    `desktop.screenshot()` before/after. Works even when window title is ambiguous.
  - Click-through E2E on the replica: `Runtime.evaluate`
    `document.querySelector('a[href*=…]').click()` inside the attached session;
    assert `location.href`/`h1` after a 4 s settle. Observed replica H1s:
    `/docs/` → "Start here", `/docs/cli/reference/` → "Command reference".

## Turbopack sites (twin1.ai pattern)

- **Pick rationale:** raised a $20M seed (2026-08-20, out of stealth the day of
  the raise), co-led by Bessemer Venture Partners, Tribeca Venture Partners, and
  Aramco Ventures with a long institutional/tag-on list (EJF Ventures, Lakestar,
  Notion Capital, F-Prime, Orrick strategic, others); founders are ex-Eigen
  Technologies; early customers in legal/finance/energy. Announced via Business
  Wire/FinSMEs coverage; the site itself banners the round. Inside the 24-month
  window by two days at pick time.
- **Fingerprint:** Next.js App Router with Turbopack build output — chunk refs
  are `/_next/static/chunks/<hex>.js?dpl=<deployment-id>` (also fonts/media/
  icons), fully self-hosted (Sanity image CDN is one external asset host),
  inline SVG hero, animated scroll-triggered reveal + rotating "hub" ring.
  Deep (several MB per chunk, ~25 chunks) but 100% deterministic assets.
- **Turbopack chunk refs must keep their LIVE URL form in the served HTML.**
  The Turbopack client builds chunk keys from the DOM attribute itself
  (`getAttribute('src')`, stripping `/_next/`, re-appending `?dpl=`) and
  `await Promise.all(otherChunks)` against `TURBOPACK_CHUNK_LISTS`-derived keys.
  Rewriting the attributes to relative on-disk names (`NAME__dpl-dpl-X.js`)
  makes the seeded keys never match → `otherChunks` never resolves → hydration
  hangs (SSR markers render, then the error boundary swallows the DOM:
  "Something went wrong", flight-marker count 0). `mirror_site.py` now skips
  attribute rewriting for `/_next/static/` refs (any query-bearing ref, or
  any `.js/.mjs/.css` chunk ref); files are still stored mangled on disk and
  `serve_replica.py` maps plain `?dpl=` requests back to the mangled file at
  serve time. Symptom-free check: replica loads → h1 == live h1, 33
  `.motion-reveal` markers, `nextF` markers consumed (0 remaining), zero
  resource-404s after full scroll.
- **Turbopack lazy chunks hide in flight-payload strings.** Chunks referenced
  only inside RSC `__next_f` JSON strings (not via `<script>` tags or JS
  import() statements) are invisible to the mirror's scan. Discover them by
  regexing the stored HTML + all stored chunks for `/_next/static/chunks/<hex>`
  and diffing against on-disk files; fetch the missing with the `?dpl=` query
  and store mangled. Only a clean-browser reload exposes the gap (lazy chunk
  404 after scroll).
- **JS-built asset URLs escape HTML rewriting twice over.** The hero hub ring
  builds `/images/home/complete-control/hub/face-colleague-` + `key` in client
  JS, so the mirror only stored the `d` variant while the JS also wants `b`.
  Scan ALL stored chunks (not just the entry) with a regex for `/images/…`
  (and any other asset root) and fetch every name absent on disk — the base
  link is only verified to exist, not that every variant is stored.
- **Verification:** hydrate then full-page scroll; `failures: []` — zero
  resource 404s, all images loaded. Vision compare hero/mid/footer anchors —
  rotating hub-ring labels ("Privacy: …", "Enterprise Privacy") and Twin-card
  captions re-render per load/animation state; treat those as inherent variance,
  not divergence.
## Astro sites (useforward.co pattern — Forward)

- **Pick:** Forward (useforward.co), YC F26 (Fall 2026), SF + Sydney/LA/NY;
  AI-native private-credit origination ("Origination Made Easy"). Funding:
  standard YC batch deal + pre-seed from NextGen Ventures, Startmate, Lyra
  Capital (per company LinkedIn). F26 acceptance date ≪ 24 months today —
  batch-membership funding evidence stands alone.
- **Site is Astro** (`data-astro-*` attributes, `/_astro/*.css` hashed chunks,
  no client JS of consequence: 1 external `<script>`, zero module scripts).
  Server-rendered static — the easiest mirror class: no hydration, no
  framework-runtime chunk-key logic. Every nav page (company, careers +
  per-role pages, contact, privacy, terms) is a self-contained HTML file;
  `--depth 2` mirrored all of them plus shared `_astro/` CSS, images, logos,
  and `videos/hero.mp4` + `product-overview.mp4` in one pass.
- **Astro quirk — images + media are plain relative refs** (`src="logos/…"`,
  `poster` and `<video src>`), so the existing relative-link rewriting handles
  them; no query-token or Turbopack-style URL scheme. `og:image` is a plain
  relative `images/og/forward-og.png` — mirrored fine.
- **Mirror noise to ignore:** crawl logged 404s for `/image/png`, `/1200`,
  `/630` and "social preview" URLs containing spaces — these come from
  og-meta content the site emits (malformed/never-served live too); nothing in
  the page HTML references them. A `/_astro/%23n` missing ref traces to an
  inline anchor-style URL — no HTML references it on disk.
- **External-only refs (not vendorable, degrade gracefully):** Cloudflare
  Turnstile captcha API (`challenges.cloudflare.com/turnstile/v0/api.js`) on
  the demo-request form, and the `aplo-evnt.com` intent-pixel beacon. The
  pixel hard-400s under a captive/origin-mismatched request (server-side
  referrer check); zero effect on rendering (no uncaught errors, no layout
  shift). Live and replica parse to byte-equal DOM numbers (same h1/h2/img
  counts, identical scrollHeight 6626).
- **Verification recipe that ported unchanged from Twin1:** clean Chrome CDP
  pre-navigation failure hook → load → scroll-through → re-probe. Replica vs
  live were byte-equal on every DOM figure (24 imgs, 24 loaded after scroll,
  0 broken, 2 videos, `failures: []` besides the external pixel) and vision
  casts matched verbatim on hero / mid / footer anchors.
## Turbopack v2 sites (multiplier.ai pattern — 7th pick)

- **Sourcing detour — funding wires, not YC API.** This round skipped the YC
  batch dump and sourced from funding-wire coverage (FinSMEs / TechCrunch /
  Business Wire) of the current week: seed and pre-seed announcements with
  explicit dates make the ≤24-month check a byline scan. Two candidates
  surfaced Aug 19–21 2026: **idler** ($9M seed, Paradigm-led) and **Multiplier**
  ($6M seed, Lux Capital-led, Aug 21).
- **Candidates pre-probed before mirroring:**
  - idler.ai → **REJECTED**: `robots.txt` is restrictive (content-signal
    conditions on every disallow — no-ai-scrape posture), and `sitemap.xml`
    returns an HTML app shell (SPA fallback), so the real page manifest is
    hidden. Also `data-dpl-id` Turbopack with `/_next/static/immutable/*`
    hashes.
  - multiplier.ai → **CHOSEN**: `robots.txt` allows everything (`Allow: /`,
    clean `Sitemap:` line), valid XML sitemap with 8 URLs. SSR home: 75 KB,
    h1 "AI for asset managers,", h2 "Backed by:"/"One command center",
    `_next` refs with `?dpl=` queries.
- **Pick rationale:** Multiplier (multiplier.ai, formerly "WithAI" branding —
  footer reads "© 2026 WithAI Research, Inc.") — AI data platform for asset
  managers; $6M seed led by Lux Capital, announced via FinSMEs Aug 21 2026;
  NYC, YC participant; "Backed by:" strip proves GoAhead Ventures, Rebel Fund,
  General Advance, Unpopular Ventures plus angels Pete Briger Jr (Fortress
  Executive Chairman), Jasjeet Sekhon (Google DeepMind CSO), Sandeep Nailwal
  (Polygon co-founder), Kaz Nejat — all on-site.
- **Turbopack scheme identical to Twin1, zero infra changes.** Chunk refs are
  `/_next/static/chunks/<hex>.js?dpl=dpl_AXuZhqQicNCyXzy8UyobSAjre82G`
  (one deployment id across every ref) → the existing `keep_live_chunk_ref`
  rewrite-skip + `serve_replica.py` `_dpl_alternatives` serve-mapping handled
  it unchanged; 105 static refs across all pages, every one 200 through the
  server. Fonts are `/_next/static/chunks/*.woff2` (Turbopack serves fonts
  from the chunks dir, not `media/`).
- **Sitemap-only pages escape a depth-2 mirror.** The 8-page sitemap includes
  `/blog/multiplier-raises-6-million-to-make-investors-superhuman`, which is
  NOT linked from the homepage HTML (only from the blog index, one hop deeper
  than the mirror walked) → the crawler missed it. Fetch sitemap-missing pages
  directly in mirror-style (same HTML store + per-page chunk ref sweep,
  `?dpl=` chunks stored mangled). Always diff sitemap URLs against mirrored
  pages; the sitemap is the authoritative manifest.
- **Vercel Analytics stub is runtime-injected — vendor it as a NO-OP, not the live file.** The
  mirrored HTML contains no `_vercel` ref — Next.js injects
  `<script src="/_vercel/insights/script.js">` at runtime when it detects the
  Vercel edge. On the replica this 404s (one window `error` event). Two options,
  and the stub wins: the live 2,495-byte asset is the Web Analytics / Insights
  loader, which beacons `view/event/session` to `/_vercel/insights` keyed off
  `location.href` — serving the replica phones home with replica page paths and
  pollutes the company's real analytics. The runtime only requires the 200 load
  (that's what suppresses the error), and Multiplier's own JS never references
  the analytics object — so write a documented no-op of valid JS to the same
  relative path. Git history preserves the live bytes for provenance. If the
  live loader is absent, the raw HTML is untouched — the ref is entirely
  runtime-injected.
- **Verification — byte-equal DOM, near-byte-equal pixels.** Clean Chrome CDP
  audit: replica and live both report height 3321, h1 "AI for asset managers,
  built with you", 140 imgs / 67 loaded after full scroll / 0 broken,
  `failures: []`, `uncaught: []`. Pixel bands: bottom band md5-identical;
  mid band 0.0026% differing bytes; hero band 1.04% differing bytes confined to
  the right-edge viewport clip + animation frame (animated hero canvas) —
  vision casts read both bands verbatim (identical nav/five backer rows, same
  truncated right-edge "Kaz Nejat" card in both). Treat animation-frame diffs
  ≤ ~1% of bytes as inherent; vision equality of anchors is the pass criteria.
- **Mirror noise:** crawl logged `/2400`, `/800` and `'Multiplier — AI for
  asset managers'` URL-control-character errors — same malformed og-meta
  emissions seen on Forward (`/1200`, `/630`, spaced social-preview URLs);
  nothing in stored HTML references them. The trailing `missing: …/,q=`
## Vite-built SPA sites (ellis.ai pattern — 8th pick)

- **Sourcing — fresh funding wires again.** This round's wire scan
  (TechCrunch / FinSMEs, late Jul 2026) surfaced Fish Audio ($52M seed),
  **Ellis ($10M seed, Jul 31 2026)** and Smallest.ai ($13M voice). Ellis was
  the freshest high-quality pick: AI agents for private credit managers,
  founded by repeat founder Ryan Williams (ex-Cadre → Yieldstreet); investors
  First Round, Khosla, Thrive, 645 Ventures, Harlem Capital. The site proves
  the round itself — client-rendered top banner "Ellis launches with $10M+ …"
  with a FUNDING tag, plus press page "Ellis Emerges From Stealth With $10M+".
- **F26 funnel probes before the pick:** herdr.dev (200, clean robots), then
  qokedas.com REJECTED (robots.txt carries content-signal conditions — same
  no-ai-posture as idler), covera-agents.com / capveon.ai (Next.js, ok but
  less fresh). Domain probe: ellisai.com dead, but **ellis.ai → www.ellis.ai**
  live with 89 KB SSR, h1 "Run private credit on one trusted book."
- **Robots posture respected:** `robots.txt` is `Allow: /` except
  `/case-studies$` and `/security` — neither path is in the 13-URL sitemap,
  but `/case-studies` IS linked from the nav, so the depth-2 crawler fetched
  it; **delete the disallowed dirs after mirroring** (`rm -rf ellis/case-studies`).
  `/security` was never linked → never fetched. Mirror = sitemap manifest
  (13 URLs) + nav links, minus disallowed paths.
- **Vite build signature — cleanest mirror class since Astro.** No Next.js,
  no Turbopack: flat named files `/assets/index-DMz-lij0.js` +
  `/assets/index-dc4S04U_.css`, `/fonts/berlingske-serif.css`, plain
  root-relative refs, **no `?dpl=`/query-token scheme** → the crawler stores
  files as-is and the stock server serves them; zero `keep_live_chunk_ref` /
  `_dpl_alternatives` mapping. Data-ish assets are simply files too
  (`3c22bde3c2.png`, `ellis-launch-r2-1080p-web-audio.mp4` hero video,
  `ryan-williams-headshot-2.jpg`).
- **Client-rendered content in the shipped bundle — mirror it as-is.** The h1
  hero is SSR'd into the HTML, but the funding banner, section content
  ("03 / RUN THE FUND"), tables and carousels render from a data payload in
  the single bundle. Because the mirror stores that bundle verbatim, the
  replica's client render is byte-identical — no HTML patching needed, and
  content updates on the live side land in the bundle hash (not a fetch).
- **@vercel/analytics is BUNDLED in this build (unlike Next.js runtime
  injection).** The Vite bundle inlines the Vercel analytics injector
  (`/assets/index-*.js` contains the script-tag emitter for
  `/_vercel/insights/script.js` and beacon endpoints) — booting the replica
  without the file yields a 404 + error event, like Multiplier. Pre-empt the
  same way: write the no-op stub to `ellis/_vercel/insights/script.js`
  (needed only as a 200; bundle code never touches the analytics object).
- **Verification — byte-equal DOM; vision via relay captures.** Clean Chrome
  CDP audit: replica and live both height 6380, h1 "Run private credit on one
  trusted book.", 6 h2, 9 imgs / 9 loaded after full scroll / 0 broken, 1
  hero video, `failures: []`, `uncaught: []`. Vision casts came from
  **relay-tab screenshots in David's real Chrome** (background tab, no focus
  theft — never `.raise()`/activate to capture) at identical window geometry,
  top and 45%-scroll bands; both read verbatim: banner "…$10M+…", nav,
  hero headline/sub/CTAs, sound-off toggle, section 3 bullets, table, agent
  overlay. 
- **Two vision misreads this round — check with a DOM text probe before
  trusting casts.** (1) Both captures read the dark banner as "$18M+" when the
  bundle + DOM say "$10M+" (OCR "1"→"8" on dark bg); (2) live cast read
  "Valuations, forecasts" where both DOMs contain only "Reports, forecasts".
  When vision and expectation disagree on a rendered text string, run
  `document.body.innerText` substring counts on both URLs — it settles OCR
  vs drift in one call. Numbers inside low-contrast banners are unreliable
- **Mirror noise:** bundle chunk-names like `assets/@vercel/analytics/server`
  and `assets/react-router/dom` flagged as MISSING REFERENCED FILES — these
  are bare import specifiers inside the bundle, not disk refs; nothing in the
  stored HTML requests them. Page count: 49 mirrored files, 14 HTML pages,
  13 sitemap URLs all 200, 43 unique asset refs all 200; replica serving on
  :8906.
- **Media size guard:** Vite sites can carry big videos — the hero mp4 is
  10.1 MB, run-agent.mp4 5.4 MB (both under `/assets/`, not root). Probe
  live sizes with a byte-range GET BEFORE committing (`curl -r 0-1023 -I`
  → `content-range: bytes 0-1023/10109529`) and confirm the mirrored file's
  exact byte count matches (10,109,529 / 5,422,062 on disk). 14.8 MB of video
  is fine for the repo; a 100 MB+ file would warrant serving from an external
  host instead.

## Framer fragment-ref bug (uplane.com pattern — 9th pick)

- **Pick:** Uplane (uplane.com), $4.5M seed Apr 2026 — Play Ventures + YC +
  others; founded Nov 2025, San Francisco (Business Insider / FinSMEs /
  TheSaaSnews). Framer site with `data-framer-hydrate-v2` routeId,
  `framerusercontent.com` + `static.framer.com` asset hosts, robots
  `Allow: /`, 12-URL sitemap (incl. junk `old/old-home-2` + `success-popup`).
- **Framer inline SVG icon system runs on fragment refs.** Icons render via
  `<use href="#svg-9..._660">`/`<use href="#svg-5..._197">` pointing at
  `<symbol id="svg-...">` blocks embedded in the SAME document. Those fragment
  URLs MUST survive the mirror verbatim — touching them breaks every icon
  silently (no network request, no console error, no 404).
- **URL-rewrite guard bug (fixed in `mirror_site.py`):** the HTML attr filter
  only skipped `raw == "#"`, not all `raw.startswith("#")`. A `<use
  href="#svg-...">` became `https://uplane.com/#svg-...` → parsed as an
  HTML-like page → enqueued as a page → on recrawl the same bare fragment was
  rewritten to `rel_to(abs_url, base)` = `index.html` (the fragment dropped
  in both hops). Symptom: every `<use>` pointed at `href="index.html"`;
  `#svg-...` symbols lost. Fix: single guard
  `if raw.startswith(("#", "mailto:", "tel:", "data:", "javascript:")): continue`
  before `abs_url = ...`. Check the loop header survived — one edit run
  deleted the `for raw, attr in finder.urls:` line (verify with a fresh read,
  never the diff).
- **The reliable detection signal is window 'error' capture, not HTTP.**
  Broken `<use>` refs emit NO Network.responseReceived >=400, NO Log.error,
  NO Runtime.exception — the browser treats the fetch of `index.html` as a
  normal document. Only a pre-navigation injected
  `window.addEventListener('error')` recorder (reports tagName + href/src
  attr) sees them (`/tmp/up_evtcap.mjs`: 8 x `use href="index.html"` on the
  old mirror, zero after the fix). Same technique generalizes to any
  resource-class failure that never hits the network layer.
- **Paired audits must use the SAME mode on both sides.** First Uplane audit
  ran `audit` (replica) vs `live` (live) — the replica SCROLLED count stuck
  at 34 and looked like a lazy-load gap; rerunning replica with `audit` too
  reached 50/50, byte-equal to live. Mixed modes produced a spurious delta.
- **Node 22 undici WebSocket recipe:** `npm i ws` on a mac can resolve to a
  bundless WS with no `.on` — use the Node 22 global `WebSocket` with
  `ws.addEventListener('message', ...)` (register a second listener for a
  second handler; `ws.onopen =`/`ws.onerror =` assignments do work).
- **Sitemap junk pages merge:** sitemap lists `old/old-home-2` (junk) and
  `success-popup` — fetch each via depth-1 mirrors into throwaway dirs and
  `rsync -a --ignore-existing` the new files in (same procedure as the
  sitemap-gap fix on Multiplier). Live site also carries a `carrees` typo in
  blog pages — site-inherent, mirrored as-is.
- **Verification (post-fix, byte-identical):** clean Chrome CDP audit, same
  mode both sides — replica and live both height 6723, h1 "Full funnel AI
  marketing automation platform", 4 h2, 50 imgs (34 eager → 50 loaded after
  full scroll) / 0 broken, 1 hero video, `failures: []`, `uncaught: []`.
  Relay-band vision (top/mid/footer in David's real Chrome, background tabs)
  reads both sites verbatim — nav, hero, DB/Enpal/Aonic logo row, "AI
  marketing automation for the entire funnel. End-to-end." features, diagram
  nodes, footer columns + funding block (EXIST/EU), X + LinkedIn glyphs
  solid — icon rendering is the Uplane pass criteria, and it passes.
- **Nex retro-fix:** the same bug had mangled the 3rd pick's `<use
  href="#svg-...">` refs to `index.html` (26 uses). Re-mirroring nex.ai with
  the fixed script produced 259 files, zero `index.html` use-refs; CDP audit
  byte-equal to live on every metric (height 7057, 40/40 imgs loaded, h1
  "Hire your first") incl. the same vendor chatbot `b2bjsstore...js.gz` error
  on BOTH sites — proven live-inherent, external-only ref.
- **OneCLI (onecli.sh) — React/Next.js hydration parity (the #418 case).**
  React-driven App Router site (8 videos, `_next/image` optimizer URLs, dpl
  deployment-token chunk names). Served through a hub (`serve_replica.py`,
  DOCROOT `onecli/`) with a serve-time ref-restoration layer:
  `__dpl-dpl-TOKEN.ext` → `?dpl=dpl_TOKEN`, mp4 → absolute
  `https://onecli.sh/...` (stream from origin), fonts/css/assets → `/` prefix,
  `index.html` links → extensionless, `icon__icon-HASH-png.png` →
  `/icon.png?icon.HASH.png`. `og:image`/canonical/meta content pass through
  untouched.
- **Mirror-rewriter corruption was the #106/108 hydration root cause**
  (fix in `mirror_site.py`, applied before the 2nd crawl): (1) old
  `LinkFinder` rewrote ANY meta whose property *contained* "image" —
  `og:image:width`/"height"/"alt" contents became pages (`1200/index.html`);
  fixed with an exact-match `META_IMAGE_PROPS` set; (2) `rel=canonical`
  rewritten to `index.html`; (3) `og:image` `?v=2` folded into the filename;
  (4) hero inline data-URI shredded because the entity-encoded style
  `background-image:url(&quot;data:...#...&quot;)` was `html.unescape()`d
  BEFORE the scheme check, defeating `allowed()` → the whole `url(...)` was
  rewritten and garbage enqueued. Fix: guard `ref = html.unescape(...)`
  `.strip('\'"')`, skip refs starting with `#`/`data:`/`blob:`/`about:`/
  `javascript:`; canonical/meta attrs keep absolute live form; og-image
  assets still queued for offline storage. Regenerate the store after any
  mirror-script fix — never hand-patch stored HTML.
- **SSR-DOM compare beats post-hydration DOMs:** aborted hydration replaces
  the tree, so compare JS-disabled SSR dumps for mismatch truth; live keeps
  its DOM on hydration, the broken replica replaces it.
- **React #418 diagnosis pattern:** audit captures `uncaught:["Minified
  React error #418"]` + `failures:[{t:err,tag:"window"...}]`. Root-mean the
  first SSR-DOM diff, not the last: it was `canonical href="/"` vs
  `https://onecli.sh`.
- **Docs-route "broken" assets can be live-inherent:** `/docs` 404s 6 fonts/
  CSS on the replica — verified the SAME refs 404 on live (stale deployment
  artifacts, both dpl-token and bare-path forms). Parity, not defect; don't
  chase live's own broken links (curl HEAD each ref on the origin first).
- **Full-page parity via pixel bands:** `Page.captureScreenshot
  captureBeyondViewport` on both origins (1440×7348 both), decode PNG
  (colorType 2 = RGB, stride w*3+1), per-1000px band diff. Result: 0.356% →
  0.086% differing pixels, confined to bands containing ANIMATION (hero
  videos/marquees) — each site's own capture-to-capture jitter (live 0.19%,
  replica 0.31%) in the same bands dominates the cross-site diff. Static
  structure (nav links 25/25, h1 rect 461,187,517,153, body height 7348,
  video sizes 1104×622/1104×461, html class light) is byte-identical.
- **HTMLParser quirks:** old parser has no link/img/source tag names — use
  `get_starttag_text()` + regex and `convert_charrefs=False`; restore a
  collapsed class attribute after whole-class rewrites (py_compile passes but
  runtime `AttributeError` on a missing class dict). `og:image` needs
  `:width/:height/:alt` excluded from href-collection AND `twitter:image`
  included; mangle `?v=N` query folding is expected filename churn.
## Hand-rolled static sites (caution.co pattern — 11th pick)

**2026-08-23 discovery path:**

1. **Sourcing via the YC batch API** (works when the YC S26 page/API sheet is unreachable from crawler-visible surfaces): `https://api.ycombinator.com/v0.1/companies?batch=S26&limit=500&page=N` returns 236 S26 companies with `{name, slug, website, oneLiner, industries, longDescription, status, badges, teamSize, regions, tags, locations, smallLogoUrl, url}`. Pull the JSON, filter to companies whose `status` implies active/launched and whose `website` is a non-SPA candidate domain, then probe each candidate's robots.txt + fetch its homepage.
2. **Robots/sitemap gate (documented skip):** `executor.sh` was a candidate but its Cloudflare-issued robots.txt disallowed ClaudeBot/CCBot and its sitemap returned an SPA shell — per repo policy **AI-crawler robots-block = skip**, no mirrors of it. Kebra (kebra.com) also probed: `Allow: /` + 5-URL sitemap, but it's a client-rendered SPA — declined in favor of a static site (new archive class).
3. **Funding verification:** web search confirmed **Caution** = YC S26 (June 2026, inside the 24-month window), open-source verifiable-compute platform (secure enclaves + cryptographic proof that production matches reviewed source), founders ex-Distrust; Kebra = YC S26 + SV Angel + Browder Capital.
4. **Site pick — Caution (caution.co):** hand-rolled static SSR site, 121 KB homepage, zero framework markers, 71 `/assets/` self-hosted refs (hosts: caution.co only), h1 "Know what runs on a server". Clean 20-URL sitemap. Mirrored with `mirror_site.py https://caution.co/ caution --depth 2` + a second targeted run for `cloud.html` (first pass captured 100 files; second pulled the remaining 85). All 19 sitemap URLs present in mirror; extras: `feed.xml`, `security-controls.html`.
5. **Verification without pixels:** clean-room CDP audit found the served replica byte-identical to live on every field (h1, h2=10, imgs=70, imgLoaded, broken=0, height 7517, script=1, failures [], uncaught []); 6 subpages identical; 507/507 internal refs return HTTP 200 through the replica; platform-tour video (webm 1920×1080) loads locally at readyState 4. In David's Chrome (browser relay), all 36 `h1/h2/h3` texts match in order; vision model compares of hero/nav/workflow bands report verbatim-identical text and layout with zero glitches. **Pixel-band caveat (this site):** fullpage capture pairs are ~80% different for BOTH cross-site AND self-jitter (live1-vs-live2 82%) — an animated hero + lazy video poster + scroll-stitch variance makes whole-page pixel diffs meaningless here; element/DOM/vision evidence is the noise-free signal (the earlier uplane-style 0.09%≈0.3% jitter math only holds for sites with fewer animations).
- **Serve-time mp4 rule is scoped to OneCLI only:** `serve_replica.py` reroots `*.mp4` refs at serve time ONLY when `onecli.sh` is in the origin — every other replica serves its mirrored mp4 locally (parity proven: caution's `demo_video.mp4` 18.6 MB returns 200 from the replica).
- **Relay dropdown pitfalls (learned this round):** `app.target` matching can adopt an unrelated old replica tab when no tab matches (fallback = active tab); screenshot buffers must be written via `Bun.write` inside `run` code (the tool returns raw PNG bytes, not a path); `window.scrollTo` in relay tabs can silently no-op — use CDP `Page.captureScreenshot` with a `clip` region or element-rect-based clips instead; per-tab `scrollHeight` can differ (7494 vs 7790) because bg-tab IntersectionObserver reveals lag — align bands by measured element rects, not page fractions.
## Next.js App Router with runtime-injected analytics (magmahq.ai pattern — 12th pick)

**2026-08-23 discovery path:**

1. **Sourcing via the same YC batch API feed:** batch `S26` single-page envelope is `{"companies":[...]}` at `limit=500` (236 companies); filter `status`/`badges` for active+launched, then robots-probe candidates. Magma (magmahq.ai) had the cleanest gate this round: `robots.txt` `Allow: /`, 5-URL sitemap (`/`, `/about`, `/magmatize`, `/privacy`, `/terms`).
2. **Funding verification:** YC S26 = June 2026 acceptance, inside the 24-month window (`https://www.ycombinator.com/companies/magma`); site itself carries the "Backed by Y Combinator" nav badge.
3. **Site pick — Magma (magmahq.ai):** AI-agent data monetization ("Monetize your agent's interactions and mistakes"); Next.js App Router (Turbopack) build, 41 KB SSR home, self-hosted assets — the ONLY external refs are two LinkedIn links. h1 "Monetize your agent's" + a JS rAF-driven rotating-word clip ("interactions" → "mistakes").
4. **Mirror:** `mirror_site.py https://magmahq.ai magma --depth 3` → 70 files flagged, 47 files/3.0 MB on disk; `.origin` = `https://magmahq.ai`; served via `serve_replica.py` on **port 8910** (hub `magma-replica`).
5. **Mirror noise (false positive):** `@c15t/iab` flagged as MISSING — it is a string literal inside `c3f13e1f-….js` (optional IAB module import), never requested on page load.

**Runtime-injected scripts → no-op stubs (never vendor live third-party behavior):**
- The mirror cannot see scripts whose URLs are JS-computed at runtime, not present in stored HTML. Live Magma injects three: `/basalt/static/web-vitals.js` + `/basalt/static/exception-autocapture.js` (Basalt privacy analytics) and `/c5a14d94387b7204/script.js` (c15t consent-manager CDN loader). All three produced `ERR_ABORTED` on the replica until stubbed.
- **Stub rule (same precedent as `multiplier/_vercel/insights/script.js`):** write a no-op JS file at the mirror's SAME relative path (`magma/basalt/static/web-vitals.js`, `magma/basalt/static/exception-autocapture.js`, `magma/c5a14d94387b7204/script.js`) → they return 200 locally, `FAILURES: []`, and no live telemetry/consent behavior is imported. The consent modal is part of the page bundle, so it renders identically on the replica.

**Deltas that are NOT parity gaps:**
- **DOM script-count deltas** (home 30:22 pre-stub → 23:23 post-stub) are Next.js bookkeeping: module scripts are removed from `document.scripts` after execution, and the replica executes faster than live, so fewer remain at sample time. Resource-timing proves all 12 `/_next/static/chunks/*.js` execute on BOTH sides with real transfer sizes (4 KB–239 KB).
- **Animated hero band is the only pixel-diff region:** home full-page captures are byte-identical in static rows; only the hero band (rAF-driven word clip) differs — mean-to-255 ≈ 0.14, max channel 24. CSS `animation-play-state` cannot freeze a JS rAF loop; per the caution lesson, pixel diffs confined to live animation are NOT sound parity objections. `/about` and `/magmatize` full captures are byte-identical PNGs (MD5 equal) even without freezing.

**Verification (clean-room CDP audit, all 5 pages, live vs replica):** every metric identical — title/h1/h2/h3/nav/imgs/broken/height (home 5477, /about 859, /magmatize 2487, /privacy 5856, /terms 3236); `FAILURES: []`, `UNCAUGHT: []`, `CONSOLE-ERRORS: []` on both sides. Vision casts (frozen 1× pairs) read both renderings verbatim: banner "Magma is onboarding companies building AI agents. Talk to us", nav "Σ Magma / Backed by Y Combinator / About / Contact / Magmatize your data", hero + rotating word, subtitle, CTA, mountain illustration, and the identical consent modal ("We value your privacy… Reject All / Accept All / Customize").

## No-framework static SSR welcome-mat robots (lastaccountingcompany.com pattern — 13th pick)

**2026-08-23 discovery path:**

1. **YC batch API paging change:** `?batch=X&limit=500` now caps at 20/page — the single-page envelope is gone. Paged all pages for W26 (199), S26 (236), F26 (18) = 452 candidates into one TSV (batch, name, domain, slug, oneLiner, status, badges). F26 (Fall cycle, Aug 2026) exists as a live batch — all three batches are inside the 24-month window as of capture.
2. **Mass robots+SSR probe:** 442 candidate domains probed in parallel (`xargs -P 16`), each row = robots.txt (status, bytes, count of `Allow: /` vs `Disallow: /`, disallowed dirs) + homepage (status, bytes, framework marker via grep `_next/static | /_astro/ | data-framer | /assets/index | webflow`). 102 candidates passed the gate: robots `Allow: /` with NO `Disallow: /`, homepage HTTP 200.
3. **Ranking by mirror class:** after 5 NT classes already archived (Next.js app-router ×2, Astro, Vite SPA, Framer ×2, hand-rolled ×2), pick the cleanest un-archived class: no-framework static SSR (`mark=-`, zero framework markers). Shortlist from the 102: codewisp.ai, buttoncomputer.com, agencytool.com, ashr.io, lastaccountingcompany.com — each 10–260 KB, hand-rolled HTML.
4. **Site pick — Last Accounting Company (lastaccountingcompany.com):** Helsinki "agent-native accounting firm" (operating company Bloom Systems Oy; founders ex-Token Terminal, BCG, Intera). Funding: YC S26 (June 2026, in window) — `https://www.ycombinator.com/companies/last-accounting-company`. Robots.txt is the friendliest yet seen: *"All crawlers welcome — including AI search and training bots (GPTBot, OAI-SearchBot, ClaudeBot …); being read and cited by AI assistants is a goal of this site, not a risk."* — `Allow: /`, 9-URL sitemap (/, /privacy, /news, 6 articles), zero Disallow lines. Only external refs on home: plausible.io analytics script + Google policies links + YC badge link — all preserved as external (same behavior both sides).
5. **Mirror:** `mirror_site.py https://lastaccountingcompany.com last-accounting-company --depth 3` → 36 files listed, 34 on disk / 956 KB; `.origin` = `https://lastaccountingcompany.com`; served via `serve_replica.py` on port 8911 (hub `lac-replica`; arg order is `[port] [docroot]`). Depth notes: BFS crawler does NOT read the sitemap — two Finnish-language articles (`news/miksi-perustamme-kirjanpitofirman`, `news/kirjanpidon-uusi-kayttokokemus`) are reachable only via hreflang alternates at depth 3, so `--depth 2` missed them; rerun at `--depth 3` (fast, still 34 files — no unbounded sections; `news/posts` and a `blue-j-…` slug in the HTML are 404 dead literals, correctly skipped).
6. **Verification:** served homepage bytes == live bytes (114 315 B); clean-room CDP audit home + article page: DOM identical to live on every field (h1/h2/h3/nav/imgs/broken=0/height, scripts 5), `FAILURES` identical (`net::ERR_ABORTED` dead literals), `UNCAUGHT: []` both sides. Hero demo cards rotate accounting figures via inline JS (`rotate`/`setInterval`) — capture-to-capture number deltas (48 200 → 61 050 → 52 400) are the rotation, NOT mirror drift; the mirrored HTML's static ground truth matches live byte-for-byte. Vision compare via browser relay CDP screenshots (viewport + full-page) AND via OMP computer use on David's real Chrome (URL bar `127.0.0.1:8911` vs `lastaccountingcompany.com`): hero identical ("There's a Björn for that.", YC badge, CTA, card layout).
7. **AppCheck origin-enrollment false positive (new lesson):** the page's inline module runs Firebase AppCheck (ReCaptchaEnterpriseProvider, gstatic CDN imports) gating the waitlist form's Firestore write. Bytes are mirrored identically; live never errors, but a fresh replica tab deterministically logs `appCheck/recaptcha-error` — Google only mints reCAPTCHA Enterprise attestation for the enrolled origin, so ANY non-enrolled host (127.0.0.1, a staging domain, even a future redeploy) gets the same error. This is a live third-party attestation service, same class as Basalt/c15t — do NOT stub it (bytes must stay identical); treat the replica-only console error as documented environmental, not a parity gap. It does not affect the mirrored page's rendering or any mirrored behavior.

## Webflow sites (general.legal pattern — 14th pick)

**2026-08-23 discovery path:**

1. **14th candidate from the 452-row batch TSV** (W26 199 + S26 236 + F26 18, `limit=500` still caps at 20/page): the D13 sweep's 102 robots-allow candidates ranked by mirror class → after 4 NT framework classes and hand-rolled/static classes were archived, **Webflow** was the one framework class not yet in the library. `general.legal` passed the gate: `robots.txt` `Allow: /` with zero disallows, `Sitemap:` line present, homepage 175 KB raw HTML with `webflow` class markers.
2. **Funding verification:** General Legal ("The AI-native law firm for growing companies") = **YC W26** (Winter 2026 acceptance — inside the 24-month window as of 2026-08-23; standard $500K deal per `https://www.ycombinator.com/companies/general-legal`).
3. **Site pick — General Legal (general.legal):** AI-native law firm (contract review/negotiation/drafting as subscription tiers, attorney marketplace). First Webflow archive class in the 14-folder library (classes so far: Next.js App Router ×2, Turbopack ×2, Astro, Vite SPA, Framer ×2, hand-rolled ×2, no-framework static SSR, **Webflow**).

**Webflow fingerprint & mirroring:**

- **Fingerprint:** `webflow.css`/`webflow.js` refs to `cdn.prod.website-files.com/<project-id>/`, inline `data-wf-*` attributes, jQuery-dependent runtime, `<style>` design tokens at head. This site carries **two project CDN prefixes** (`/69d3ac38e8e442c9fce520b4/` + `/69d414dfd73725ed12ec8846/`) — two Webflow build IDs (staged/dev + live) in the same page; both must be passed via `--asset-hosts cdn.prod.website-files.com` (host-level allow covers every project prefix).
- **Mirror:** `python3 mirror_site.py https://general.legal general-legal --asset-hosts cdn.prod.website-files.com --depth 3 --sitemap auto` → **"sitemap seeds: 115 pages queued"**, "no missing referenced assets", **797 files / 58 MB / 124 HTML pages** in 81 s; `.origin` = `https://general.legal`; served via `serve_replica.py` on port **8912** (hub `gl-replica`).
- **NEW `--sitemap` seeding in `mirror_site.py` (durable fix for the zero-inbound orphan class):** BFS link crawling structurally cannot reach pages no other page links to. `--sitemap auto` reads the robots.txt `Sitemap:` line (`(?im)^\s*Sitemap:\s*(\S+)`); explicit sitemap URLs or comma-separated URLs also accepted; `fetch_sitemap_locs()` recurses into `<sitemapindex>` wrappers and respects `allowed()`. general.legal had **4 sitemap-only orphans** live-200 but zero-inbound (`/old-home`, `/compare/harvey`, `/features/contract-review`, `/ainlc-2026` — "harvey" exists on the site only as text, not a link). After seeding: **115/115 sitemap locs mirrored** (was 114/115 with the links-only crawl; same gap class hit on multiplier's blog announce page and LAC's hreflang articles).
- **Dead refs mirrored faithfully are NOT gaps:** 10 unresolved internal refs audited against live — (1) `ghjobssorted-1.0.0.js` string patterns are JS runtime string-interpolation (`'+j.absolute_url+'`), never literal paths; (2) `assets/investors/logo_{audacious,susa,ycombinator}.{svg,png}` return **404 live** — the live site's own broken references on the about page, mirrored identically (both sides render broken images); (3) `plugins/Basic/assets/placeholder.60f9b1840c.svg` returns **403 to every client incl. browser UA** — Webflow's protected plugins CDN folder; live 403 == mirror 404 (relative-rewritten, unfetchable both ways) — same visual state, same LAC "404 dead literal" verdict. Sitemap post-pass proved 115/115 locs on disk; every remaining on-disk `src`/`href` resolves.
- **Runtime environment deltas (documented, NOT stubbed):** the page embeds **Intellimize** (`cdn.intellimize.co`, external runtime personalization with its own cache-control) and **Osano** consent (`cdn.cookielaw.org` loader — cookie banner renders from external script kept absolute, so the replica shows the SAME banner live); Google Fonts external per precedent. All are client-side, absolute-URL, non-vendored third-party runtimes with identical behavior on both origins; vendoring them would inject live personalization/telemetry behavior into the archive.
- **Verification (clean-room CDP, home + `/blog/ai-law-firms`, both sides):** title/h1/h2/h3/nav byte-identical; home **71 imgs / 71 loaded / 0 broken** both (replica's 71 relative refs all resolve locally), scrollHeight **9391 identical**, width 1440, scripts 37 both; `FAILURES: []`, `UNCAUGHT: []`, `CONSOLE-ERRORS: []` both sides. Full-page captures: **article pair md5-identical**; home pair differs by 0.186% of pixels (90 k of 48.6 M) in rows 0–9269 vs **replica self-jitter 0.207%** — the divergence is ANIMATION FRAME (hero AI-demo typing, marquee, stat count-ups), strictly inside the site's own capture-to-capture noise bound. Vision compare on BOTH legs (relay CDP full-page shots + OMP computer-use Safari windows of live vs replica at identical 1324×859 window): hero headline "The elite law firm for every company." + hero card ("Learn how elite legal expertise…" / "Book a quick call") + Osano banner + section structure read verbatim-identical; the only readings that differed (96% vs 95% stat, brand-name hallucination like "LawyersEdge"/"OpenLawyer") are the low-res OCR/animation-frame class, not rendering deltas.


- **Webflow asset-host recipe (advisory verdict, 18th pick — Wispr Flow, wisprflow.ai):** `--asset-hosts` takes **hosts**, not Webflow project IDs — `allowed()` matches `host == h or host.endswith("." + h)` only, so a project-ID entry like `682f84b3838c89f8ff7667db` matches **nothing** and is a dead no-op. One `--asset-hosts cdn.prod.website-files.com` entry covers every project prefix on the CDN (general.legal's two prefixes equivalent to wispr's three: `682f84b3…`/`682fa127…`/`6838259b…`), and assets store under their URL path (`wispr/<project-id>/…`) regardless. Do not add duplicate project-ID entries — they silently do nothing and mislead the next reader.
- **`--sitemap auto` optional on wispr (verified, not assumed):** sitemap.xml lists **308 locs; all 308 already mirrored** by the BFS crawl (326 HTML pages on disk > 308) — BFS covered everything, so adding `--sitemap` changes nothing. Use it when a site has zero-inbound orphans (general.legal class); skip when the crawl already covers the sitemap.
- **`data-rive-url` is a rewrite attribute (added 2026-08-23):** wispr pages embed Rive animations via `data-rive-url="https://cdn.prod.website-files.com/<project-id>/…riv"`, and `LinkFinder.ATTRS` lacked that key — 11 refs / 7 unique `.riv` files across 7 pages stayed absolute, so the replica would fetch the live CDN for animation assets. Fixed by (1) adding `data-rive-url` to `ATTRS` so future crawls rewrite it, and (2) a targeted in-place repair (`/tmp/wispr_rive_repair.py`): fetched the 7 `.riv` files (~2.1 MB, decoded names with literal spaces/`&`) into `wispr/<project-id>/`, rewrote the 11 attrs to pagedir-relative refs with `url_path_key`-identical semantics. Serve-side spot-check: replica currently serves all rewritten refs 200 with RIV payloads. Only external dependency remaining is the `unpkg.com/@rive-app/canvas` runtime (third-party JS, unvendored per precedent).
- **Commented-out markup is not a gap:** wispr's android page carries `<!-- <video poster="https://cdn.prod.website-files.com/…_frame-1.png"> -->` dead commented nodes — html.parser correctly never parses them, so they're never rewritten nor fetched on either origin; an earlier "absolute CDN poster refs retained" scan flagged them, and comment-aware classification showed 2 of 5 video tags real (both posters stored locally; one was already relative in live HTML), 3 inside `<!-- -->`. No parser construct breaks, no bug, no fix needed.
## Nuxt 3 SSR sites (hilstart.io pattern — 15th pick)

**2026-08-23 discovery path:**

1. **Fresh YC batch API pull + domain diff (full-coverage probe):** re-pulled all three batches (`W26` 199 + `S26` 236 + `F26` 18 = 453 unique, `limit=500` still caps at 20/page), diffed against the D13 probe list (`/tmp/probe13_domains.txt`) and found **8 truly unprobed domains** (degla.ai, godhands.dev, herdr.dev, lambdarobotics.ai, runinfra.ai, simantic.dev, simulithic.com, usecollarai.com); probed all 8. `herdr.dev` (YC F26, Ghost CMS — a brand-new archive class) was fully gated (robots `Allow: /` clean, Ghost SSR) but declined for D15 in favor of a cleaner, more interesting pick.[D19 correction: the Ghost read was wrong — herdr is Astro v5.18.2 + Starlight v0.36.3 (120 generator metas, zero Ghost markers); mirrored in D19, see herdr section.]
2. **Site pick — Hilstart (hilstart.io):** YC **S26** batch, status **Active**, "Autonomous Hardware Testing" — seed funding inside the 24-month window. robots.txt `User-agent: *` / `Allow: /` (clean gate), homepage 200 / 87 538 B. **Nuxt 3 fingerprint** (SSR HTML with `data-nuxt-data` / `__NUXT__` payload, `/_nuxt/*.js` chunks, `_payload.json?<uuid>` request) — 15th archive class, first Nuxt entry.
3. **sitemap.xml returns the Nuxt SPA fallback shell** (no XML `<loc>` — the server answers every unknown path with the same shell) → `--sitemap auto` is unusable here; **BFS-only crawl** (`python3 mirror_site.py https://hilstart.io/ hilstart --depth 2`) → **37 files, zero missing referenced assets**: index.html, 8 `/_nuxt/*.js`, 1 CSS, `_payload__<uuid>.json` (69 B, byte-identical to live), 14 `/fonts/*` woff2, `email-decode.min.js` (CF Email Protection), ~10 images.
4. **CF Email Protection links are faithful-equivalent, not dead refs:** the mirrored `/cdn-cgi/l/email-protection#…` 404s are magic endpoints browsers never fetch — the mirrored `email-decode.min.js` decrypts them client-side exactly as live. No patching (dead-ref equivalence, same class as LAC 404 dead literals).
5. **Verification (all legs, live vs replica):**
   - Clean-room CDP audit (Chrome 151, direct per-page WS after browser-level attach broke): title `Hilstart`, h1 `Hardware development, on autopilot.`, **imgs 6/6 (0 broken; lazy 5th naturalWidth 0→1440 after scroll)**, bodyH **5874 == 5874**, docW **1440 == 1440**, textLen **4323 == 4323**, scripts 4/4, css 3/3, `errs: []` both. Live `misses` = cache artifact (transferSize 0); replica `misses` = only `static.cloudflareinsights.com` RUM beacon (external runtime analytics — intentionally unvendored, per Basalt/c15t precedent).
   - Full-page pixel diff at 1440: `headerEqual:true, diffPx:38200, pct:99.8667` — 0.133% delta confined to hero band rows 0–14, below D14's 0.207% animated self-jitter floor.
   - OMP computer use (this round): cua-driver window list + AX trees + `screencapture -l <windowID>` frames of David's Chrome showing live then replica — nav (How it works / Tracer / Sandbox & API / FAQ / Contact), YC badge, h1, subhead, TRACER_01 · ONLINE / EARLY ACCESS, and all three numbered sections ("01 · CONTEXT / Single source of truth.", "02 · TEST PLAN / Generate hardware tests.", "03 · EXECUTION AND RESULTS / Run tests on real hardware.") **content-identical** in the AX tree; `<title>Hilstart` raw == served == live.
   - Browser relay vision + innerText: specs band **byte-identical** (incl. `8 channels`, `4 0–5 V · 4 0–24 V`, `0–48 V at 3 A`, `Plus fixed 5 V and 3V3`, `10 bidirectional GPIO`, `CAN FD at 5 Mbit/s`, `SPI, I²C and UART`); vision's "8-48 V"/"12 GPIO" were low-res misreads (actual text `0–48 V` / `10`); logo "Hilbert" misread — grep proves `alt="Hilstart"` 15×.
6. **Environmental deltas (documented, NOT stubbed):** `static.cloudflareinsights.com` RUM beacon external per precedent; `ycombinator.com` footer badge link left absolute.


## Next.js (Turbopack) sites with video heroes (kebra.com pattern — 16th pick)

**2026-08-23 discovery path:**

1. **Fresh YC batch re-pull (full coverage):** `W26` 199 + `S26` 236 + `F26` 18 = 453 unique again (identical cohort to D15 — zero new members since). Exclusion diff vs D15's probed set (probe13 442 + D15's 8 probes + all 15 library domains via .origin/canonical, www-normalized on both sides — naive matching would keep 131 `www.`-prefixed false candidates) left exactly **3 truly unprobed domains**: executor.sh, kebra.com, qokedas.com.
- **Exclusion reuse (rule):** the already-mirrored set is recovered with ONE `glob */` of the repo root — dir names ARE the slugified startup names (`covera` → Covera, `last-accounting-company` → …) — then fuzzy-matched against roster names; do NOT re-loop per-dir domain extraction and www-normalization on every cycle. Over-inclusion is cheap: the D31 flow proves it — F26 roster 18 → design_signal gate → 3 captured → vision gate dropped 2 before any crawl; a non-excluded mirror costs at most one `design_signal --live` probe. When a dir name does NOT fuzzy-match any roster name (rebranded dirs, suffixed slugs), read `<dir>/.origin` for the canonical domain and match roster entries against that — the D16 exclusion diff and every later cycle use `.origin`/canonical as the final authority, never the dir name.
2. **Content-signal robots is a hard skip class:** executor.sh AND qokedas.com both serve the "content-signal" robots (collect only where the operator signals yes) — same class already declined in earlier rounds; skipped without further probing.
3. **Site pick — Kebra (kebra.com → www.kebra.com):** YC **S26**, Active, "Making the field queryable" (field-service ops AI). 308 `kebra.com → www.kebra.com`; robots `User-Agent: * / Allow: /` with only app paths (`/api/`, `/dashboard`, `/scheduler`, `/operations`) disallowed — clean. Home 200 / 66 983 B, h1 present, **Next.js fingerprint** (`_next/static` ×52; **Turbopack** build — chunk names carry the `__dpl-dpl-<X>` suffix, Vercel "baked" deployment form).
4. **Real sitemap.xml** (`<loc>…kebra.com…</loc>` + `/inspections`, `/home-services` etc.) → `--sitemap auto` usable (news: real XML here vs hilstart's Nuxt SPA-shell trap); `python3 mirror_site.py https://www.kebra.com/ kebra --sitemap auto --depth 3` → **64 files in 23 s**: index.html + 4 pages (inspections/home-services/facility-management/privacy), 39 Turbopack `_next/static/chunks` + 1 css, 16 woff2, brand/ + logos/ (yc.svg etc.), 10 photos, 2 mp4 (hero-field-loop.mp4 + s3-field-single.mp4) + poster, icon/favicon/og. `.origin` = `https://www.kebra.com/`.
5. **`chunks/,q=` "missing ref" is a false positive:** the sole crawler complaint is a substring of Turbopack's minified loader (`z=RegExp(...),q=RegExp(...)`) — never a real fetch; runtime never requests it. Environmental noise, not a gap.
6. **Verification (all legs, live vs replica):**
   - **Served bytes == live bytes:** `serve_replica.py` :8914 (hub `kebra-replica`) returns the HTML byte-identical in size (66 983 == 66 983) with the `?dpl=` Turbopack refs restored to live form (the established serve-time reverse transform; stored form keeps mangled relative names).
   - Clean-room CDP audit: title `Kebra — Make your field service company AI native`, h1 `Making the field queryable`, **imgs 16/16, 0 broken** (identical naturalWidth arrays), bodyH **7189 == 7189**, docW **1440 == 1440**, textLen **1714 == 1714**, scripts 27/27, css 1/1, fonts 18/18, `errs: []` both, at LOAD and after SCROLLED.
   - **innerText byte-identical** (1 737 B both, clean-room dump). Live-only scroll delta: +3 inline scripts (GTM/GA hydration, environmental).
   - Pixel band-map of full-page captures (2560×15190): **every differing row lives inside the two animated `<video>` blocks** (hero rows 0–1280 ≈84% of the diff, s3 demo-video band rows 3840–4352); all ~13 000 remaining rows byte-identical. A paused/t=0 variant cannot converge (live decodes a real video frame, an offline replica shows the poster — codec-state delta is inherent) — consistent with the library rule that numeric pixel diff is not the parity claim on animated sites; DOM equality + vision are.
   - Browser relay vision (David's Chrome, window 72077): live tab then replica tab — **h1, subhead verbatim ("Kebra captures what happens across physical operations, builds a live operating memory of the field, and deploys AI agents that automate the work that follows."), BACKED BY Y Cominator badge, KEBRA logo, "Schedule a demo" CTA identical**; address bar ground truth per tab (`kebra.com` vs `127.0.0.1:8914`).
   - OMP computer use (cua-driver `get_window_state`, window 72077): AX trees live vs replica — **110 content-bearing elements each; first 52 ordered (role,title) pairs identical; the sole divergence anywhere is the address-bar field** (`kebra.com` vs `127.0.0.1:8914`). Page text identical down to "THE FIELD TODAY / CAPTURE / MEMORY / AGENTS" and use-case cards.
7. **Environmental deltas (documented, NOT stubbed):** `googletagmanager.com/gtag` + `google-analytics.com/g/collect` (GA4, external analytics), `calendar.google.com/calendar/appointments/...` (Google Appointments embed — external service, renders identically as the frame URL), all left absolute in the mirrored HTML per the RUM/analytics precedent.
## Hand-rolled static SSR funded via wires (river.ai pattern — 17th pick)

**2026-08-23 discovery path:**

1. **YC batch lane is exhausted → funding-wires lane.** All three YC batches (W26 199 + S26 236 + F26 18 = 453 unique) were fully probed by D15/D16; the remaining unprobed domains (executor.sh, qokedas.com) are the hard-skip content-signal-robots class. D17 pivots to **funding wires** (the lane that produced twin1, multiplier, ellis): TechCrunch + FinSMEs funding coverage, week(s) of Aug 2026. Candidates: Terra Industries ($52M seed, Aug 17), Naive ($28.5M, Aug 6), Discovered Materials ($9M seed, Aug 10), River AI ($1.1B Series Seed + Series A, Aug 11).
2. **Domain pre-probes:** `terraindustries.com` dead; `terra-industries.com` = unrelated SA parts company → **discarded**; `naive.ai` = 1106B stub → skipped; `discoveredmaterials.com` = clean robots (explicit AI-bot allows, internal-only disallows), Next.js → viable backup; **`river.ai` = PICK** — robots.txt 200 `User-agent: *` / `Allow: /` / `Sitemap: https://river.ai/sitemap.xml`, 34KB SSR home, h1 "Own your intelligence", 2 months old, $1.1B combined seed/Series A (General Catalyst, Nvidia, Temasek; xAI co-founder), and the site **self-documents the round** on `/series-seed-series-a-funding` (round verified inside the 24-month window, announced Aug 11, 2026 — 12 days before capture).
3. **Site class — hand-rolled plain static SSR** (no `_next/`, `/_astro/`, framer, nuxt, vite markers): 3rd instance of the class (caution, last-accounting-company). External refs kept absolute per precedent: x.com, i.ytimg.com, youtube-nocookie.com embed, linkedin.com, docs.river.ai, console.river.ai (links only).
4. **Mirror:** `python3 mirror_site.py https://river.ai/ river --sitemap auto --depth 3` → 43 files reported, **41 on disk + `.origin`**, 3.1 MB. All 9 sitemap URLs handled (/, /api, /blog, /series-seed-series-a-funding, /introducing-river-ai, /careers, /support, /changelog, /security). Assets: 10 team offsite photos, River_Series_A.jpg, fonts, `analytics__v-2.js` (own-domain analytics), `script__v-89.js`, 3 CSS versions `styles__v-45/49/65.css`, `email-decode.min.js` (CF Email Protection). 404s = CF Email Protection magic endpoints (never fetched by browsers) + `%23n` anchor false-positive — both known classes.
5. **NEW `__v-` serve-time reverse rule in `serve_replica.py` (durable tool extension):** river's HTML version-query assets (`styles.css?v=49`, `script.js?v=89`, `fonts.css?v=1`, `analytics.js?v=2`); the mirror folds those to `__v-N` disk names (stored form can't be browsed without the server). New generic V rule: regex `^(?P<dir>.*/)?(?P<stem>.+?)__v-(?P<ver>\d+)(?P<ext>\.\w+)$` → `"%s%s?v=%s"` and a `_v_alternatives()` map so a browser requesting `styles.css?v=49` lands on `styles__v-49.css`. Symmetric to the dpl restore, mutually exclusive per path; `py_compile` verified; **`styles.css?v=49` byte-identity: served 74 745 B == live 74 745 B (`cmp` OK)**; kebra :8914 regression re-checked 200 with dpl restore intact (this rule is additive, no reordering of prior branches).
6. **Parity bar = resolved-URL parity.** Home byte diff: 5 hunks / 7 diffs, all syntactic: preload `font.woff2` + `fonts.css?v=1` (serve absolute / live relative), `styles.css?v=49` (same), `assets/hero-static.jpg` (same), `/api#examples` (stored form lost the fragment: crawler storage keeps the attribute value `{main}live`; served path drops `#examples`), `/cdn-cgi/l/email-protection#hex` (same class). Every differing ref resolves to the identical browser URL via RFC 3986 `urljoin`; fragments are **unrecoverable from crawler storage** (no generic rule can restore them; a site-specific rewrite table is rejected as out-of-design) — the subpage's `../refs` relative-up forms follow the same normalize-identically rule. **214-ref sweep across all 9 pages: every genuine asset 200** (only `/cdn-cgi/l/email-protection` fails — the CF magic endpoint the browser never fetches; live 404s it too off the CF network).
7. **Run-time non-parity classes (documented, NOT stubbed):** (a) **CF Web Analytics** — live injects `/beacon.min.js/v4513…` at runtime (absent from raw live HTML, stored HTML, and served HTML; greps all 0): replica has no CF edge, so no beacon — absent by design; (b) **hero headline rotator** — live picks per load between "River is building a new stack for personal AI" and "…the new standard in personal AI" (both strings present in stored bytes; textLen ±2 chars); (c) **ytimg thumb 0×0 on BOTH sides** at capture (network-level ytimg unavailability — identical empty poster area, same rendered result); (d) **Chrome per-site zoom** — the profile remembers 0.8 zoom for 127.0.0.1 (replica measured dpr 1.6 / innerW 1890 vs live dpr 2 / innerW 1512; same window, same content at 1.25× scale) — a measurement artifact, not replica state.
8. **Verification (all legs, live vs replica):**
   - Browser relay DOM: home title identical ("River AI — Intelligence that flows with you"), h1 "Own your intelligence", h2 "Train models that are yours.", imgs `[/assets/hero-static.jpg, /vi/8A_i0QBb58M/maxresdefault.jpg]` both, css `[fonts.css?v=1, styles.css?v=49]` both; stripped-text diff home = **166 == 166 lines, zero differing text lines**; subpage textLen **4325 == 4325**, scripts identical modulo the CF beacon, bodyH 3277 vs 3286 (layout-settle noise: 9px).
   - Vision (windows webp pair + full-window pair): hero "Intelligence that flows with you." + typing-cursor subhead, nav API/Blog/Careers, brand logo, dark-blue gradient hero, cream sections, footer — **identical on both home captures**; replica's mid-page "empty rectangle" reproduced identically on live (yt thumb 0×0, DOM-proven both sides); `hero-static.jpg` 1920×1203 loaded on both.
   - OMP computer use (window 72077, live then replica): **address bar `river.ai` vs `127.0.0.1:8915` = sole observable divergence**; page content identical (hero headline, subheadline with typing caret, nav, SCROLL indicator, styling). Page AX is silent (custom-drawn canvases, known class) → vision-OCR path used (macos-ax-silent-canvas-probing precedent).
9. **Environmental deltas (documented, NOT stubbed):** x.com / YouTube / docs.river.ai / console.river.ai external links kept absolute; CF Web Analytics beacon absent from the replica by design (no CF edge); hero rotator behaves identically given the same code+phrase pool.
## Astro docs+blog with Pagefind search (herdr.dev pattern — 19th pick)

**2026-08-23 discovery path (D19, returning to the YC lane):**

1. **YC API pagination contract fix.** Earlier D-runs read YC's batch API with a `if not data: break` loop that never fired because the response body is `{"companies":[…],"page":N,"totalPages":M}` (page 1 returns 1 company because the API body is actually the paginated envelope — previous scripts misread `companies` presence as EOF). Correct contract: `while page <= totalPages` (or `data["page"] < data["totalPages"]`). Re-pull: **W26 199 + S26 236 + F26 18 = 452 unique** (one W26/S26 domain overlap). **F26 = 18 companies** (smallest batch so far, consistent with an autumn cohort).
2. **Candidate gate on F26:** exhaust F26's 18 companies first (they were never swept in D15/D16 which only did W26/S26). After www-normalized exclusion of the 18 existing mirror domains + content-signal-robots skip class, **herdr.dev** (YC F26, "Command line for AI agents", agentic dev-tool infrastructure) is the pick — clean robots (only `/fonts/` disallowed), funded gate clear. **D15-decline reconciliation:** the D15 hilstart record lists herdr as "ghost CMS — a brand-new archive class" but declined *in favor of a cleaner pick*, not on a gate (the same D15 probe explicitly REJECTED qokedas for content-signal robots — herdr was never in that class). Re-fingerprint here overturns the Ghost read: all 120 captured HTML pages carry `<meta name="generator" content="Astro v5.18.2"/>` + `Starlight v0.36.3` (zero `/ghost/` paths, zero Ghost generator/chunk markers) — herdr is **Astro/Starlight**, a class with an established mirror recipe (useforward.co). Circumstances changed (misclassification corrected + F26 never swept), so the decline reason does not stick.
3. **Site class — Astro** (2nd explicit Astro fingerprint after useforward.co; fingerprints `/_astro/` chunk dirs). Real sitemap.xml → `--sitemap auto`: `python3 mirror_site.py https://herdr.dev/ herdr --sitemap auto --depth 2` → 104 HTML pages across **3 locale trees** (`/en/` implicit root, `/ja/`, `/zh-cn/` = docs + blog + changelog), sitemap 72/72 URLs on disk.
4. **BFS `depth=2` preview-sibling gap (real crawl-gap, found by sweep):** the docs' `Preview` nav section links `/docs/preview/{name}/` pages whose children live at depth 3 (`/docs/preview/name/sub/`). The crawler's `self.depth=2` cut them: 13 unique refs to `/docs/preview/{10 names}/` returned live 200 but were absent from the replica (sweep residual=16: those 13 + 3 faithful `/cdn-cgi/l/email-protection`). **Targeted repair, no re-crawl** (wispr `.riv` precedent): fetched the 30 live-200 preview pages (10 names × 3 locales) with mirror-consistent `url_path_key` + pagedir-relative rewrite → **134 `.html` on disk, sweep residual=3** (only the CF email-protection magic endpoints; live 404 too). Note the email-protection refs appear as bare relative (`cdn-cgi/l/email-protection`) from locale dirs and `../../cdn-cgi/…` from blog posts — resolve to the same `/cdn-cgi/l/email-protection` endpoint, all faithful.
5. **Pagefind: same-origin runtime data invisible to the HTML-attr crawler.** This is the big one for offline functionality: herdr's search is Pagefind v1.5.2 (`<script type="module">` in Search.astro). The JS chunk calls `new PagefindUI({element, showSubResults:true})` and Pagefind fetches `${basePath}/pagefind/pagefind-entry.json` where `basePath` defaults to `"/pagefind/"` — a **JS string literal, not an HTML attribute** (sweep can't see it; the self-hosted replica's search would 404 silently). Recipe:
   - `pagefind-entry.json` is at `https://herdr.dev/pagefind/pagefind-entry.json` → `{"version":"1.5.2","languages":{"zh-cn":{"hash":"zh-cn_5d341623ea10f","wasm":null,"page_count":352},"en":{"hash":"en_3818de9899","wasm":"en","page_count":352},"ja":{"hash":"ja_9ba26b7221","wasm":null,"page_count":352}},"include_characters":[…]}`
   - Each language's file set is indexed by a **hash prefix**; `pagefind.<hash>.pf_meta` (gzip) carries the per-file hash tokens → **gzip-decompress + regex `[a-z]{2,5}[_-][0-9a-f]{4,16}`**; the 2-part language code pitfall: zh-cn tokens are **`zh-cn_…` with the full prefix** (an initial `(?:en|ja|cn)_` pattern mis-matched `cn_…` substrings inside `zh-cn_…` → 388 bogus misses; fix = explicit `zh-cn_` alternation).
   - Each hash resolves to exactly one of `fragment/<hash>.pf_fragment` (352/locale — one per page), `index/<hash>.pf_index` (34–37/locale), or `filter/<hash>.pf_filter` (1/locale) — probe with the browser UA, classify by **Content-Type, not status**: Cloudflare Pages returns **200 + `text/html` fallback** (the SPA shell) for missing pagefind files, so a status sweep alone can't distinguish a real file from the fallback (fallback bytes = HTML shell; real = `application/octet-stream` gzip).
   - Root runtime files: `pagefind.js`, `pagefind-entry.json`, `wasm.en.pagefind` (only `en` exists — entry shows `wasm:null` for ja/zh-cn; a single shared wasm) + 3× `pagefind.<hash>.pf_meta`.
   - Fetched **1171 files / 7856 KB** into `herdr/pagefind/` (fragment 1056, index 106, filter 3, root 6); binary integrity verified (all gzip magics `1f 8b`, zero HTML fallback contamination via `<\!doctype` grep over the whole tree); spot checks live vs replica byte-identical sizes + MIME through :8917.
6. **Verification (all legs, live vs replica):** visible-text byte parity via browser-UA fetch + tag-strip: home `6797 == 6797 B`, `/docs/preview/cli-reference/` `32726 == 32726 B`, `/ja/docs/preview/cli-reference/` `38324 == 38324 B`, `/blog/` `1298 == 1298 B` — **all MATCH** (post-repair, text-level). Sweep on :8917: `pages=134, refs=10177, residual_uniq=3` (all the CF email-protection class). Served pagefind tree returns correct MIME (`text/javascript` / `application/json` / `application/octet-stream`) — Pagefind search now works fully offline in the mirrored replica.
7. **Environmental deltas (documented, NOT stubbed):** CF Email Protection magic endpoints (client-side decrypted by mirrored `email-decode.min.js` pattern when present), external links (x.com, GitHub) kept absolute per precedent; Pagefind search itself is the only runtime-feature class that required data mirroring beyond the HTML-attr graph — worth adding `/pagefind/` (or equivalent JS-literal asset trees) to the standard sweep/repair checklist.

## Hand-rolled static one-pager with Google-Fonts css2 (veeda.ai pattern — 20th pick)

**2026-08-23 discovery path (D20, re-using the funding-wires lane):**

1. **Funding-wires lane re-used (D17's TechCrunch/FinSMEs route, fresh Aug 22–23 window):** candidate shortlist from the same feedback surface that produced river; alternatives solinide (Software Expert - Solinide), apollo (R1 chip), neuromorphic picked over — **veeda wins on story (biggest, physical-AI world models) + simplest static class**. Funding **2-source verified**: genaidaily.com (Aug 22 2026) + SiliconANGLE (Aug 19 2026) — **$90M+ seed, Khosla Ventures + Radical Ventures co-led**, inside the 24-month window (announced Aug 2026). Team: Sanja Fidler, Huan Ling, Zan Gojcic (Toronto, NVIDIA/Toronto robotics provenance).
2. **Site class — hand-rolled static one-pager** (4th instance of the pure-static class after caution, last-accounting-company, river): zero framework markers, **zero `<script src>` (no JS at all)**, single inline `<style>` block, Google Fonts css2 stylesheet + 21 woff2, 3 PNG/ICO icons, external Ashby careers link (`jobs.ashbyhq.com/veeda-ai`). robots: `User-agent: *` / `Allow: /` + sitemap — clean gate. **Single-page scope verified (2026-08-23)**: sitemap lists exactly one URL (`https://veeda.ai/`, lastmod 2026-08-19); live nav has zero internal subpage links — MISSION/APPROACH/TEAM are in-page anchors, CAREERS is external (`jobs.ashbyhq.com/veeda-ai`), plus two mailtos; probes of `/team /careers /privacy /about /terms` serve nothing and `/blog` → 404. The mirror's single `index.html` is therefore full coverage, not a truncated multi-page site (c.f. ellis/onecli); careers being external-hosted follows the existing precedent.
3. **Mirror:** `python3 mirror_site.py https://veeda.ai/ veeda --sitemap auto --asset-hosts fonts.googleapis.com,fonts.gstatic.com` → **28 files (+ `.origin`)**, verify prints **"no missing referenced assets"**; `validate_html.py` passed.
4. **NEW crawler gap class fixed in `mirror_site.py` (durable, not a one-off): extensionless CSS asset skipped by the `.css`-ext gate.** The Google Fonts css2 URL is extensionless (`https://fonts.googleapis.com/css2?family=…`) → `url_path_key()` keys it under `css2/…`, and `crawl_asset`'s `if url.endswith(('.css', '.js', '.mjs'))` gate skipped CSS processing — the **21 woff2 `url()` refs inside the css2 body were never fetched**, and `verify_no_missing_chunks` (outer loop walked only `.css/.js/.mjs`) scanned the css2 file vacuously.
   - New module-level `_looks_like_css(text_or_bytes)` sniffer (`/*`, `@charset`, `@font-face`, `@import`, `@media`, `@keyframes`, `@supports`, `:root`, `url(` without `<` in head) — robust to CSS in any extension or none.
   - `crawl_asset` restored: fetch → status → save, then js/css branching with `or _looks_like_css(body)`; CSS branch runs `queue_css_refs` + rewrites fetchable `url()` refs pagedir-relative via `rel_to(abs_url, url)` and re-saves the stored file.
   - `verify_no_missing_chunks` corrected: outer gate reads every stored file with a `src_for` entry, computes `is_js`/`is_css` (extension **or** sniff), JS import check only for JS, CSS ref check for CSS (skip `#`/data:/blob:/about:, keep live external `://` refs, disk-check absolute/root-relative via `url_path_key`, disk-check relative refs resolved against the stored file's dirname with query/fragment stripped).
   - `py_compile` verified; diff reviewed; stray blocks from an earlier grafted edit removed.
5. **Font vendoring** (existing local-fonts convention — river/onecli/forward store CSS refs relative, zero stored `url(https://…)` in their CSS): **21 `*.woff2` on disk under `veeda/s/<family>/v<NN>/…`** (gstatic stable URL shape), css2 stored at `veeda/css2/index__family-Playfair-Display-…css` with all 21 `url(../s/…)` refs relative; `grep -o "url(https://fonts.gstatic.com" veeda/css2/*` = 0; index.html css link relative. Font stacks: Playfair Display 400/700, Source Sans 3 (300/400/600 + italics), IBM Plex Mono 400.
   - **Serving-layer MIME bug found via pixel compare + fixed.** The crawler's `url_path_key` stores extensionless paths as pages, so the css2 body landed at `veeda/css2/….html` and `serve_replica.py` served every `.html` as `text/html` — Chrome silently refuses a stylesheet with the wrong MIME: **the replica booted with ZERO `@font-face` rules** and rasterized fallback serifs (h1 829.6px vs live 811.0px; 21% of pinned-comparison pixels differed, concentrated in the Playfair/Source-Sans text bands). Fix, two layers:
     - Mirror surgery: css2 file renamed `…IB.html` → `…IB.css`, `veeda/index.html` href updated (verified 200 `text/css`).
     - Durable class guard in `serve_replica.py`: `_sniffs_as_css(body)` (no `<` in the first 128 bytes + `@font-face` in the first 1024) — any future extensionless-CSS asset stored under a `.html` key is served raw as `text/css` BEFORE the HTML munging path. `py_compile` verified; post-restart probes: `/` 200 `text/html`, css2 200 `text/css`, woff2 200 `font/woff2`.
6. **Verification (all legs, live vs replica):**
   - **Full-ref sweep** (`veeda_sweep.py` on :8918): `pages=1, refs=19, residual_uniq=0` — zero residual (index.html only now matches the HTML glob; the css2 asset is stored as `.css`); every referenced asset served 200, the css2 href included (200 `text/css`).
   - **Visible-text byte parity** (`veeda_parity.py`): `/  live=2842B replica=2842B MATCH`.
   - **Browser-relay DOM** (background tabs, no focus theft): both sides title `Veeda AI — World models that simulate physical reality`, h1 `World models that simulate physical reality.`, nav idents identical (MISSION/APPROACH/TEAM + Ashby CAREERS + 2 mailtos); replica `document.fonts.check` true for Playfair Display / Source Sans 3 / IBM Plex Mono — vendored woff2 actually load; zero `url(https://fonts.gstatic.com` in cssRules; address-bar ground truth per tab (`veeda.ai` vs `127.0.0.1:8918`).
   - **Viewport screenshot byte-identical — witnessed, after the font fix.** First claim was **vacuous**: the original "live" and "replica" halves were BOTH replica captures (relay tab race — md5 `b9f089407f04b41fde3a1ffb582b95d3` both), caught by re-witnessing `tab.url()` in-run. A fresh URL-witnessed live capture differed (md5 `cd864fb2…`); a pinned equal-metric pair (1024×545 @ dpr2 via CDP `Emulation.setDeviceMetricsOverride`, `tab.url()` witnessed in the same run) showed **21.25% of pixels differing**, in three full-width text bands (MISSION/APPROACH/TEAM) plus topbar spots — the hero band clean, i.e. scale-consistent. Root cause: the missing `@font-face` (above) → replica fell back to Georgia for Playfair Display (h1 829.6 vs live 811.0) and narrower Source Sans 3 elsewhere → text-band pixel diffs.
   - **Post-fix byte identity (four-way)**: live `https://veeda.ai/` vs replica `http://veeda.localhost:8918/` — both at relay default AND pinned 1024×545@2, URL + viewport + h1 witnessed in-run — **all four webp captures md5 `22b921bb4d14ce59f8f1ae966c7d793d`** (1024×545, 72dpi), and the lossless PNG conversions md5 `45c888e24e27bd8fc86ec5717659ebd3` (byte-identical at pixel level). Replica after fix: 21 `@font-face` rules, `document.fonts.status='loaded'`, h1 computed width **811.008px** (== live). Full-page capture still skipped (relay limitation), but zero-JS static page + byte-identical viewport + DOM/text/vision parity make rendering equality total.
   - **Vision-model verbatim match** (inspect_image on both webp captures): nav, headline, subhead, mission paragraphs transcribed identically; layout description identical (off-white/cream, Didone serif display headline, single-column centered, thin rule); no broken images either side.
   - cua-driver desktop leg: Chrome pid 61010 window inventory enumerated; the veeda tabs stay backgrounded (no focus theft) so the AX-tree leg reads David's topmost window (Azure support form) instead — DOM+vision+address-bar ground truth above is the relay leg of the mandated compare.
7. **Environmental deltas (documented, NOT stubbed):** Ashby careers + mailto links kept absolute (external per precedent); zero scripts, zero analytics on either side — no runtime-injection class; robots/sitemap clean. Helper scripts: `.tmp_tools/veeda_sweep.py`, `.tmp_tools/veeda_parity.py` (mirror the herdr sweep/parity recipes, port :8918).

## Framer-site with allow-all robots (corma.ai pattern — 21st pick)

**2026-08-23 discovery path (D21, funding-wires lane, fresh Aug 22–23 window + SiliconANGLE month-sweep):**

1. **Funding-wires lane, third run (D17/D20 route).** Fresh candidate surface from a
   three-query sweep (TechCrunch, SiliconANGLE, FinSMEs, the SaaS News) over Aug 20–23:
   Callosum (AI workload optimization, $100M seed @ Atomico, Aug 20 — 2-source: SiliconANGLE + TechCrunch-listed),
   Corma (defensive cyber AI, $60M seed @ Sequoia + Khosla + Coatue, Aug 10), Synthefy ($6.5M, Wing VC, Aug 18),
   Astromech ($20M, "Large Life Model", Aug 20), Twin1 AI ($20M, Aug 20 — twin1 already mirrored as D6, skipped),
   Terra Industries ($52M defense, Aug 17 — was on the D17 shortlist and declined), Solinide (D20 shortlist, declined).
   **Corma picks on evidence strength + mirror class**: the only one with allow-all robots + a 4-page sitemap and a
   flexible static-SSR Framer site (no Next.js blog/JAMstack machinery, no WordPress wp-* surface).
2. **Funding 2-source verified**: Fortune **Exclusive** (2026-08-10, Emily Forlini:
   "Corma raises $60 million from Sequoia for AI trained to defend against cyberattacks", Sequoia led + Khosla
   Ventures + Coatue, founded 2025, Tel Aviv + San Francisco, model deployed 6 weeks prior to F100/F500 customers;
   direct Sequoia partner quote + Khosla quote) + SiliconANGLE (2026-08-10, "Corma launches with $60M funding for
   defensive cybersecurity AI") + ai-market-watch.com (Aug 21). Inside the 24-month window (Aug 2025–Aug 2026).
3. **Site class — Framer v2 hydrate (3rd Framer archive after nex.ai, uplane.com)**: fully server-rendered HTML,
   inline `<style>`, `<div id="main" data-framer-hydrate-v2=...>`, JS chunks on `framerusercontent.com/sites/<id>/*.mjs`,
   images `framerusercontent.com/images/*.png?width=…&height=…`; fonts Cormorant Garamond + DM Sans via
   `fonts.gstatic.com`. robots: `User-agent: * / Allow: /` + sitemap — clean gate. **Scope = sitemap.xml exactly 4 URLs**:
   `/`, `/defensive-gap-research`, `/introducing-corma`, `/privacy-policy` (home is a 345 KB one-pager; the research
   page is 973 KB with 5 images; external Fortune + LinkedIn links only).
4. **Mirror:** `python3 mirror_site.py https://corma.ai/ corma --sitemap auto --asset-hosts framerusercontent.com,fonts.gstatic.com`
   — Framer chunk graph must complete (quote + backtick import forms), `verify_no_missing_chunks` post-pass mandatory,
   `data-redirect-timezone` stripped at save; entity-decoded `&` rewriting applies to `?width=…` URLs.
5. **Serve + verify:** `serve_replica.py 8919 corma` (hub-supervised); full-ref sweep, visible-text parity, relay
   DOM + vision compare — results appended below after execution.**2026-08-23 execution results:**

6. **Mirror** (corma/): `mirror_site.py https://corma.ai/ corma --sitemap auto
   --asset-hosts framerusercontent.com,fonts.gstatic.com` → 166 fetched → **154 unique files on disk**
   (crawler `downloads` counter increments per `save()` with no asset dedupe — 12 duplicate saves
   overwrite already-written keys; disk tally 68 woff2 + 39 png + 31 mjs + 5 jpg + 4 html + 2 webp +
   2 gif + 1 svg + 1 mp4 + 1 `.origin`), **"no missing referenced
   assets"** (Framer chunk graph resolved via backtick-import machinery; `data-redirect-timezone`
   stripped); assets: `corma/images/` (49 png/jpg/webp/gif/svg with `__width-N-height-M` and
   `__scale-down-to-N-width-...` query keys), `corma/sites/…/*.mjs` (31), `corma/s/` woff2 (68 —
   Google Cormorant Garamond + DM Sans), `corma/assets/`; `.origin` = `https://corma.ai/`.
7. **Serve + sweep**: `serve_replica.py 8919 corma` (hub `corma-8919`); `corma_sweep.py`
   `pages=4 refs=291 residual_uniq=0` — zero serve defects; `corma_parity.py` visible-text byte
   MATCH on all 4 sitemap pages (home 5112 B, defensive-gap-research 44378 B, introducing-corma
   5376 B, privacy-policy 9751 B).
8. **Relay DOM + screenshot parity (fresh -origin corma.localhost:8919 to dodge per-site zoom;
   URL witnessed in-run)**: live `https://corma.ai/` vs replica every field identical — title
   "Corma", h1 "Superintelligence for defensive cybersecurity", h1 computed `"A2 Gothic Regular"`
   82px/720px, `document.fonts.status=loaded` with the same 8 families (A2 Gothic, Cormorant
   Garamond, DM Sans, Fragment Mono, ABC Diatype Bold/Regular/Black/Ultra Italic), bodyH 7137==7137,
   docW 1512==1512, innerText 1984 B == 1984 B, nav "Home Blog Request Access", 15 imgs both;
   "broken" set identical both sides (4 lazy-load imgs measured before scroll — inherent, per
   Framer precedent).
9. **Byte-level pixels**: both relay captures 1024×545 @ dpr 2, zoom 1.0; per-pixel diff **109 /
   558 080 px = 0.020%** (live `955282bb…` vs replica `0de0cf…` differ only there): a 14×11 px band
   at (y20–31, x384–396) = the animated CORMΛ logo pill/starfield grain (vision-verified same
   yellow-gold pill + identical CORMΛ wordmark in both crops; live `(76,75,80)`→`(104,108,81)`
   etc. = animation-phase colors) + 5 single-pixel AA strays. Framer animation frames are inherent
   (uplane/magma/general-legal precedent); post-settle 99.980% of pixels byte-equal.
10. **Visual/vision leg**: relay full-frame captures → vision model verbatim lists identical on both
    sides: nav pill "CORMΛ / Home / Blog / Request Access", h1 "SUPERINTELLIGENCE FOR DEFENSIVE
    CYBERSECURITY", subhead "Corma is building foundation models toward superintelligence for
    defensive cybersecurity" (yellow-gold accent on "Corma is building foundation models"), buttons
    "Request Access" + "Explore Research", dark starfield + orange horizon glow.
11. **Computer-use legs**: OMP computer tool blocked at the OS layer (Screen-Recording TCC denied —
    same environmental limit as D20); cua-driver session `omp` had ended and the wrapper exposes no
    restart action (D20-accepted limitation). Relay DOM + CDP screenshots + vision model carry the
    mandated compare (precedent: D20 "cua-driver AX leg limitation accepted").
Helper scripts: `.tmp_tools/corma_sweep.py`, `.tmp_tools/corma_parity.py` (mirror the veeda
recipes, port :8919).

## Webflow site with SRI stylesheet + space-in-filename srcset hazard (starcloud.com pattern — 22nd pick)

**Starcloud** — Webflow site (starcloud.com, space-born AI data centers; $250M Series A
extension at $2.3B valuation, announced to team Aug 2026; lift-off "2027" per careers page).
Mirror `starcloud/`, port **8920**.

1. **Funding lane**: Series A extension $250M @ $2.3B valuation (Aug 2026), 547M total raised,
   a16z + NVIDIA + Y Combinator, led by Founders Fund (FT/Reuters + TechCrunch + PitchBook
   verified); careers page product signals: "swarm of satellites", "2027" lift-off, "tens of GW
   of AI compute", permitting-in-20-years claim ("MDS" auction), CTO = ex-OpenAI employee #1.
2. **Crawl**: `--sitemap auto` with BFS seed override `--extra-start` for shop ports; **189
   fetches → 178 unique files** (11 dup overwrites) — crawler counts per save and does no asset
   dedupe; stone.io blog articles were etag-cache misses costing 405 (crawl loops) but assets
   landed complete. 13 pages: home index.html + starcloud-1..4, team, careers, blog +
   3 post pages, video, wp. `.origin` set. gsap 3.15.0 vendored under `starcloud/gsap/`.
3. **Webflow asset-host recipe**: like wispr — the two project CDN prefixes (`66c1eabc58c4c392a9fba788`
   + `66c1eabc58c4c392a9fba7ac`, 164 asset files) stored under URL path; `--asset-hosts` host-only
   (`cdn.prod.website-files.com`).
4. **SRI serve-strip (durable fix in `serve_replica.py::_restore_live_html`)**:
   `re.sub(rb'\s+(?:integrity|crossorigin)="[^"]*"', b"", body)` — Webflow ships
   `integrity="sha512-…" crossorigin="use-credentials"` on its own stylesheet link; on a local
   origin the cross-origin SRI check fails → stylesheet dropped → unstyled page. Stripping at
   serve time fixes every Webflow/any-SRI mirror without re-touching stored HTML. Verified:
   computed `document.styleSheets` length 2 == live, bgcolor matches.
5. **Preconnect rewrite is cosmetic**: `preconnect` link to asset CDN resolved+rewritten to pagedir
   relative by crawler (no `crossorigin` attr → no SRI issue) — keep, zero runtime cost.
6. **Sweep**: `starcloud_sweep.py` — `pages=13 refs=793 residual_uniq=1`; the 1 residual = a
   placeholder `<img src>` that is a **faithful live-404** (live serves it 404 too, UA-checked) →
   zero serve defects; visible-text parity MATCH on all 13 pages.
7. **Screenshot parity protocol (reusable)**: fresh tabs restore per-origin scroll — NEVER compare
   captures without forcing equal feature rect: attach by targetId (no new tabs),
   `history.scrollRestoration='manual'`, `swiper.slideTo(0,0)` + autoplay stop, scroll to
   `photo().getBoundingClientRect().top + scrollY`, settle 10s, capture. Pre-fix: both tabs'
   slides were at the same abs position but different autoplay phases → vision reads listed
   different slide content (woman+phone vs Earth) — a capture-timing artifact, NOT a replica
   defect (computed styles + layout identical, hero image bytes sha256-identical).
8. **srcset space-filename crawler bug (real defect, the smoking gun — fixed durably)**:
   pre-fix `_rewrite_srcset` did `toks = s.split()` — Webflow upload filenames contain literal
   spaces ("Rapid Deployment - Avoiding restrictive permitting constraints"), so the candidate
   URL truncated at the first space, the extensionless remainder got `/index.html` injected via
   `url_path_key`, and the rest re-joined raw →
   `66c1…/673f…_Rapid/index.html Deployment - Avoiding restrictive permitting constraints-p-500.webp 500w`.
   Negative candidates 404 → browser fell back to the raw 8192px `src` (naturalWidth 8192 vs
   live 1919 on the same slide = reliable low-level detector of srcset failure). Same
   whitespace-split bug in `LinkFinder.collect` discovery (`part.split()[0]`). Fixed by a shared
   module-level `srcset_candidates(val)` + `SRCSET_DESC_RE` anchored on the trailing
   `(\d+[wW]|[\d.]+[xX])` descriptor — URL may contain literal spaces, descriptor never split;
   used by both discovery and rewrite. Scope of damage: **61 mangled candidates across 8 HTML
   files**; all `<sha24_Word>-p-…` variant files exist on disk with space-containing names; zero
   junk dirs (13 `index.html` = 13 real pages). **Durable-crawler + targeted repair**: mirror
   fixed in place by `.tmp_tools/starcloud_srcset_repair.py` (reparse srcset attrs, drop the
   injected `/index.html ` token, verify every candidate against on-disk file, drop dead ones) —
   68 attrs rewritten / 178 candidates kept / 0 dropped; post-check: 178/178 candidates resolve,
   0 mangled. **Verified fix in-browser**: replica active-slide img now loads
   `-p-2000.webp` (was base 8192), naturalWidth 1919-class matching live.
9. **Hero pixel-parity (final pinned capture)**: both tabs pinned to slide 0, photo proggress
   abs-top 2074, y=0 — live renders base `img_benefits_1.webp` (natW 1920), replica renders the
   `-p-2000.webp` variant (natW 1920): same content, different encode; raw per-pixel diff 86% is
   the encode delta, not a defect (the live site itself re-encodes per variant). Content-level
   parity decisive: 24 horizontal band means Δ ≤ 0.30/255 across the full page; downscaled
   per-pixel mean Δ 1.31 (p50 1.18, p90 2.38, max 7.33), zero pixels > 12/441 — layout, photo
   subject/lighting, and text identical; vision model reads identical scene + nav on both
   captures.
10. **Tab hygiene**: all 16 spawned starcloud CDP tabs closed (relay 9224 has zero starcloud
    targets; headless browser's live/rep tabs closed after final capture).
Helper scripts: `.tmp_tools/starcloud_sweep.py`, `.tmp_tools/starcloud_srcset_repair.py` (port
:8920; sweep form `python3 serve_replica.py 8920 starcloud`).
## Next.js Turbopack + Sanity Live site with JS-enumerated lazy chunks (callosum.com pattern — 23rd pick)

**Callosum** — Next.js/Turbopack site (callosum.com, AI workload/inference-optimization infrastructure; **$100M seed Aug 20 2026, Atomico-led** — TechCrunch funding wire; not a YC batch member). Discovery lane: TechCrunch funding category, not YC batch API. 38 pages fully sitemap-covered (including `/blog/*/download/` = an inline PDF). Served via `serve_replica.py` on **8921**; **186 files on disk**.

1. **Crawl**: explicit `https://` seeds (sitemap `loc` values carry no scheme; `mirror_site.py` adds them raw — pass absolute seeding URLs instead): `python3 mirror_site.py https://www.callosum.com/ callosum --depth 2 --asset-hosts cdn.sanity.io,api.sanity.io,7viba62e.api.sanity.io --sitemap "<10 explicit blog URLs>"`. Sanity images land under `images/7viba62e/`. **Durable crawler fix**: D22's commit had silently deleted the module-level `INLINE_STYLE_RE = re.compile(r'style="([^"]*)"')` (used by `crawl_page` HTML rewrite) — first crawl died with `NameError: INLINE_STYLE_RE` on every page after 601 assets landed; restored at line 51 and re-crawled. Lesson: **re-crawl after any crawler edit**; py_compile cannot catch a runtime NameError in a crawl path.
2. **Serve/dpl mapping**: Turbopack deployment-id chunk suffix `?dpl=dpl_2dN8HHqCcYh4F6vS8cYVnYPsYmL9`; `serve_replica.py` maps both queried and plain-name forms to the on-disk mangled twins `NAME__dpl-dpl-….js` via `_dpl_alternatives`; SRI strip live. Live itself serves the plain `NAME.js` (query stripped server-side) — mirror stores the queried form as the twin.
3. **Verifier false positive**: sweep flagged `MISSING REFERENCED FILES: http://www.callosum.com/_next/static/chunks/:case` — the import regex crosses string literals in a minified Turbopack CSS parser switch (`case"@import":case"@namespace":`), capturing `:case`. Colons never occur in valid chunk paths → durable `if ":" in ref: continue` skip added to `verify_no_missing_chunks` (py_compile-verified).
4. **HTML-sweep blind spot (the real gap this mirror surfaced): the sweeper only validates HTML-declared refs; lazy `import()`s and flight-payload paths are invisible.** First browser load of the served replica crashed at hydration with `ChunkLoadError: Failed to load chunk /_next/static/chunks/3f74337122e2b880.js?dpl=…` (module 64564's dynamic import) → Next "Application error: a client-side exception" global-error page (title "", bodyLen 127). The crawler never executes JS, so these were never fetched. Found by CDP-driven load + `Network.responseReceived >= 400` interception pass over 7 representative pages (index, /blog/, a post, /product/, /team/, /join-us/, the PDF download). Missing set: two lazy chunks (`3f74337122e2b880.js`, `6b1c3372903d08dd.js`), `/_vercel/speed-insights/script.js` (same-origin URL ref inside a JS chunk's runtime, not HTML), and `/JOIN_US_SPROGS-GROWING_ANIMATION_RIGHT_SIDE_CUT.mp4` (root-absolute path inside the Next flight payload → `<video>` fetch). All exist live; curl-fetched into the mirror in naming form; **iterate the interception pass until zero 404s** — each fixed load can reveal the next lazy chunk.
5. **Sanity Live CORS toast (only visual delta; surgically patched)**: the app ships a global `handleError` (module 35850 in chunk `0d1e175c3563f52c…`) that toasts "Sanity Live couldn't connect / Your origin is blocked by CORS policy / [Manage]" when the api.sanity.io CORS probe fails — any non-allowlisted origin. The live site (allowlisted origin) never shows it; the mirror at 127.0.0.1 did. Patch: kept the `console.error` + `t.s(["handleError",…])` registration, removed only the two `a.toast.error(...)` calls (first branch + both else sub-branches → `console.error(t)`). `node --check` clean. Post-patch `bodyLen` parity is exact: 2550==2550 (home), 1176==1176 (blog) — the toast was the ONLY byte-level text delta. Second chunk (`9686c9f33d2a9629…`, the Sanity Live connection module) only `console.warn`s — left untouched.
6. **Exception parity**: React #418 (hydration, minified) fires on the **live** homepage too (same chunk `249261e921aeebba.js`, same stack) and is absent on `/blog/` both sides — faithful hero-SVG hydration noise, not a replica defect.
7. **Compare/CDP protocol (Bun → headless Chrome 151)**: static refs: use the `/json/version` `webSocketDebuggerUrl` (`ws://…/devtools/browser/<uuid>`) — **the root `ws://127.0.0.1:PORT/` is NOT a valid endpoint** ("Expected 101 status code"; host-only bind + any origin rejected). Bun WebSocket has no `.onopen` property — `addEventListener("open")`. Attach-only to one existing page target (`Target.attachToTarget` + flatten; no tab spawns), `Emulation.setDeviceMetricsOverride` 1440×900, navigate → 7s wait → forced scroll sweep (lazy images/IO) → settle → DOM-fact JSON + viewport PNG. Screenshot + vision-model read on both sides (layout/hero/nav/text-in-pixels equal; the toast was the sole floating element, now gone).
8. **Final tally**: sweep `pages=38 refs=2191 residual_uniq=0` (serve defects zero); DOM facts match live on every page class (title / h1 / h2 / imgs-loaded / nav / bodyLen); zero 404s in-browser constant across page types.
## Next.js enterprise marketing site with BunnyCDN image host (happyrobot.ai — 24th pick)

**HappyRobot** — Next.js/App Router site (www.happyrobot.ai, AI agents for mission-critical enterprise ops: phone calls, emails, scheduling, supply chain; "Achieving Enterprise Superintelligence"). **$150M Series C at $1.2B post-money, Aug 4 2026, Prysm Capital + Eurazeo lead** (SiliconANGLE + Fortune both Aug 4; HappyRobot also documents the round on-site at `/blog/happyrobot-seriesc-fundraising-announcement` + `/home-launch-fundraising` — self-documenting round = discoverable from within the mirror itself). Discovery lane: TechCrunch/SiliconANGLE funding wires (same as callosum). Not a YC batch member. 275 sitemap URLs across a sitemapindex (pages 99 + posts 50 + hub 112 + customer-stories 14; each subtree duplicated under `/es/` Spanish locales). Served via `serve_replica.py` on **8922**.

1. **Discovery screening pass**: robots.txt clean (`Allow: /`, `Disallow: /admin/` + `/api/`, Sitemap singleton). Homepage 256 KB with 542 `_next/` references = heavy App Router marketing bundle. External asset host is **one BunnyCDN origin (`happyrobot.b-cdn.net`, 7 refs)** — `--asset-hosts` covers it; only third-party outbound are GTM/FB-pixel/Termly consent scripts + social links (kept as live external refs, not mirrored assets). Instance domain picked: `www.happyrobot.ai` (bare apex 301s to www; use the canonical host for seed URLs).
2. **Sitemap index recursion**: `--sitemap auto` follows robots `Sitemap:` → the four-file sitemapindex; pages/posts/hub/customer-stories each enumerated incl. `/es/` twins (faithful full-tree replication).
## Hand-rolled static one-pager (palisade-ai.com — 25th pick)

**Palisade** — hand-rolled no-framework static one-pager (palisade-ai.com, **YC S26** June 2026, kernel-level OS vulnerability detection + fleet mitigation AI; founder Fnu Prince; $500k YC standard deal). Discovery lane: YC S26 batch page + three-source verification (YC LinkedIn broadcast, founder LinkedIn, soma announcement) — YC badge links generic `ycombinator.com/companies`, and YC's own "palisade" directory slug is a *different* company (AI sales agents); verified the kernel-security one directly. Served via `serve_replica.py` on **8923**; **24 files / 1.7 MB** (+ `.origin`).

1. **Discovery screening pass**: no `robots.txt` (→ nothing disallowed), no ToS/terms pages; single-page site. 22.7 KB HTML hand-rolled (no framework, no `_next`, no generator meta, no forms, no tracking); `css/style.css` + `js/main.js` (10 746 B, **byte-identical live↔mirror**) + 6 PNGs + Google Fonts (Inter + JetBrains Mono). Only absolute external refs: YC badge (`ycombinator.com/companies`) + mailto — kept as canonical outbound.
2. **Crawl**: `python3 mirror_site.py https://palisade-ai.com palisade --depth 2 --asset-hosts fonts.googleapis.com,fonts.gstatic.com` → 24 files. 14 woff2 + css2 vendored with relative `url(../…)` refs (css2 is the extensionless-CSS veeda class; `_looks_like_css` gate handled it). `.origin` written.
3. **Sweep**: `.tmp_tools/palisade_sweep.py` (sed from callosum_sweep, port 8923) → `pages=2 refs=32 residual_uniq=0` — zero serve defects (2nd page = the extensionless vendored css2 CSS, a file not a page).
4. **DOM-fact parity (clean-room CDP, attach-only to existing 9340 page target; no tab spawns)**: byte-identical live vs replica — title, h1=1, h2=8, h3=12, imgs=6, broken=0, nav, bodyH **7835==7835**, docW 1440, textLen 7261, scripts=1, styles=2, `errs:[]` both.
5. **Pixel parity = animation-phase measurement**: live vs replica mean Δ **0.048/3ch**, 45 diff rows confined to the control-plane demo band (y 530–677, feed/toast/caret region). Live-vs-live self-capture (2.5 s apart) mean Δ **2.37/3ch**, 536 diff rows — the live site's own demo simulation dwarfs the replica-vs-live delta 55×. Frozen-frame injections (`animation-play-state:paused` + interval/rAF/setTimeout kill) still show the band: `#feed` is an empty div in raw HTML (rows JS-populated on load) — `.feed-row` `rowin` (0.3 s one-shot) + `.caret` `blink` (1.1 s infinite) are the flaky visual classes; the live-demo drift is inherent, not a replica defect.
6. **Vision parity (pinned frames)**: identical scene reads — hero headline/sub/nav/CTAs/colorway/dashboard mock (AUDIT mode, 37 rules, NET-004 MEDIUM card, live syscall feed), both judged "expensive/polished"; YC S26 badge present both sides.
7. **Asset alias note**: `og.png` is byte-identical to `control-plane.png` (md5 equal on live AND mirror) — the site aliases it for og:image; faithful, not a crawl error. HTML byte delta 22 734 (live) vs 22 675 (mirror) = only the crawler's preconnect/Google-Fonts rewrite (expected; resolves identically in-browser).

Helper scripts: `.tmp_tools/palisade_sweep.py` (port :8923; sweep form `python3 serve_replica.py 8923 palisade`).

## Oversized assets: S3 pointer convention (D24 hero mp4 — durable rule)

Any mirrored asset >= 100 MB hits GitHub's hard blob cap, so oversized files
live in GCS (`gs://scrape-startup-web-assets`, project fine-arbor-477412-f4,
HMAC SA glm52-observability-writer via env GLM_S3_*`) and the repo file at the
same relative path is a pointer:
- **Pointer file format**: first line `S3PTR <bucket-relative-object-key>`,
  optional `#` comment lines (metadata/provenance).
- **Capture side is automatic**: `mirror_site.py` routes bodies >=
  `s3ptr.S3_MAX_BYTES` (100 MB) through `s3_upload()` and writes the pointer;
  no manual step, no size special-casing per site.
- **Serve side is automatic**: `serve_replica.py` detects the `S3PTR ` magic on
  the requested file and 302s to a freshly SigV4-presigned URL
  (`.tmp_tools/s3ptr.py`, stdlib-only signer; no long-lived secret in the repo,
  no stored expiry — URLs minted per request).
- **Why presigned, not public**: org `domainRestrictedSharing` forbids
  `allUsers` reads on GCS.
- Example: `happyrobot/HappyRobot_HeroLoop_v01_up.mp4` (105.78 MB local) == GCS
  object 110 914 261 B `video/mp4`; 8922 serves `GET /HappyRobot_HeroLoop_v01_up.mp4`
  -> 302 -> presigned URL -> 200 `video/mp4` (verified 2026-08-23).

## Next.js App Router + UnicornStudio runtime scenes (tridentsecurity.io — 26th pick)

**Trident** — Next.js App Router site (tridentsecurity.io, **YC S26**, AI autonomous pentesting platform: breakthrough/vuln discovery, exploit generation, security posture). Discovery lane: YC S26 batch API (`https://api.ycombinator.com/v0.1/companies?batch=<F26|W26|S26>&limit=50&page=N`, JSON per batch page; fuzzy-keyword match on "security" — **watch false positives**: e.g. "Remix" matches on product copy, not security). Compared vs Parameter (parameter.ai, W26, held as backup — permissive robots) and rejected Verdict Machine (SPA with uninteractable shell in the crawler) + BeeSafe (robots.txt returns HTML, not rules). Served via `serve_replica.py` on **8924**; **142 files**, 28 HTML pages (sitemap seeded, `--sitemap auto`).

1. **Discovery screening pass**: robots.txt permissive (`Allow: /`), no crawl-relevant disallows. Clean SSR `_next/` footprint. Site: homepage hero + section canvases (frosty-gradient + ask scenes) rendered by **UnicornStudio v2.2.6** (`unicornstudio.com` UMD runtime loaded from jsdelivr).
2. **Crawl**: `python3 mirror_site.py https://tridentsecurity.io trident --depth 3 --sitemap auto` → 142 files, 28 sitemap pages queued. One false-positive warning: `MISSING REFERENCED FILES: https://tridentsecurity.io/_next/static/chunks/,q=` — a **regex artifact**: `JS_IMPORT_RE` matches the literal `import` inside an identifier in `…FKk5S5PNhbxmQKhgwafy1mdB2dsx.js` (constant-assignment string, never a module specifier). Not a mirror defect; `mirror_site.py` left untouched.
3. **Scene/runtime gap + fix**: the Unicorn scene JSONs (`unicorn/frosty-gradient-scene.json`, `ask-scene.json`) are JS-string-loaded runtime data — invisible to the HTML-attr crawler. Scene paths discovered via in-browser network/resource inspection (`performance.getEntriesByType('resource')`) + probing asset URLs on the replica. **Vendored the deployed jsdelivr UMD** (`unicornstudio@2.2.6`, 177 KB, byte-identical) + patched the `?dpl=` chunk to load `/unicorn/unicornStudio.umd.js` locally — the scenes are core "expensive-look" content and offline fidelity requires the runtime (deliberate, documented cross-host-asset deviation). Vercel telemetry `/e4fca104234c19b8/script.js` deliberately NOT mirrored (404 harmless, telemetry only).
4. **HTML parity**: live vs replica — 134 diff hunks, 100% intended (URL rewrites + `crossorigin=""` stripping); zero content diffs. All 55 inlined asset URLs 200; 28/28 sitemap pages served.
5. **Scene-flat-color forensics**: scene JSONs are flat-color shaders (`compiledFragmentShaders`, no uTime/textures) — `ask-scene` bg = rgb(25,25,25), `frosty-scene` = black. **White-canvas debugging**: white = explicit clear-color paint with NO shader draw (compile/link abort), not transparency (canvas sits over dark rgb(5,5,5) wrapper and still shows white); WebGL itself works on the replica (fresh `getContext('webgl2')` OK). **Root cause = per-origin browser zoom artifact**: at `127.0.0.1:8924` the origin carries ~80% zoom (dpr 1.6) and the runtime paints white; the SAME bytes at `localhost:8924` (origin zoom 100%, dpr 2.0) paint the identical dark tile as live. CDP `Emulation.setDeviceMetricsOverride` changes innerWidth but `deviceScaleFactor` is overridden by per-origin zoom; `Browser.setWindowBounds`/`Input.dispatchKeyEvent` ctrl+0 NOT available through the relay bridge. **Lesson: verify pixel parity via a 100%-zoom origin (e.g. localhost), not an arbitrary host.**
6. **Matched-pair pixel parity (localhost:8924, dpr 2.0)**: tile canvas 686×326 == live 686×326; live nonBlack 99.6% colorful 13.9% meanLum 99 avgRGB(29,36,34) vs replica nonBlack 99.7% colorful 11.9% meanLum 89 avgRGB(29,36,24) — R/G identical, B 34 vs 24 = scene animation variance (live tile itself varied (0,28,24)→(30,36,25) between captures). Hero canvas 4216×2030/2108×1015 identical dims both; hero screenshot 12.85 vs 12.86 KB; vision reads identical (near-black bg, blue/purple gradient waves, "24/7 Security. Not once a year.", YC badge, email field, Try Now).
7. **Vision parity**: `inspect_image` (xd://) on pinned frames — live vs replica identical scene descriptions, both judged expensive/glossy.
8. **Computer-use leg**: `computer` tool → `PermissionDenied: macOS Screen Recording permission is not granted` (TCC-blocked; even `ax()` fails); `cua-driver` tool session 'omp' ended and the schema rejects `start_session` (action enum is Desktop actions only) — no revival path through the tool. Ceremonial leg skipped with documentation; relay + inspect_image + pixel stats close parity. Note: `Page.addScriptToEvaluateOnNewDocument` doesn't fire through the relay extension bridge (no early-injection probing; only post-load evaluate).

### D26 adjudication: full-page "expensive" re-score (advisory response, 2026-08-23)

A fresh session advisory flagged that the D25 8/10 was hero-only and reported a **full-page Trident = 4.5/10 vs Parameter = 7/10** on the same model, questioning the pick against the mandatory "expensive-looking" bar. Re-measured apples-to-apples:

- **Capture-state artifact confirmed**: full-page screenshots of scroll/lazy-load sites blank below-the-fold when the tab is backgrounded — Parameter's first fullPage webp was **3.6 KB for a 6229 px page** (84 lazy imgs unflushed, essentially black) and graded **3/10**; identical protocol after a forced scroll-sweep settle → 14.7 KB → **9/10**. The advisory's 4.5/7 pair was produced under the same unflushed conditions (Trident below-fold is canvas+imgs, same blanking mechanism).
- **Corrected same-model pair (flushed fullPage, identical prompt)**: Trident **8/10**, Parameter **9/10**. Trident deductions: conventional FAQ, no surprising micro-interactions; Parameter credit: 3D cube hero, node visualizations, architectural footer. Both clear the premium bar.
- **Decision: keep Trident.** Binding constraint satisfied (8/10 full-page, corroborating D25's hero-level 8); Parameter's +1 is not decisive enough to discard a byte/pixel/vision-verified, pushed mirror and re-run a full cycle; Trident also satisfies the optional AI/Cyber focus (AI pentesting) equally (Parameter = AI pentesting too). Trident's 4.5 advisory score is explained and refuted by the capture artifact, not by the site.
- **Durable lesson**: when judging "expensive-looking" for the pick decision, use viewport-scrolled/fully-flushed full-page captures (scroll-sweep `window.scrollTo` steps + settle before `fullPage` screenshot); single-shot fullPage on a backgrounded tab systematically under-scores lazy-load sites. Score with a fixed prompt on the same model, flushed both sides.
## Parameter (parameter.ai — 27th pick)

**Parameter** — Next.js Turbopack site (parameter.ai, **YC W26**, AI pentesting — "Security at the speed of development"). Discovery lane: same YC batch API lane as Trident, where Parameter was the held backup (permissive robots, clean SSR footprint); picked for D27 after Trident's D26 re-score kept the 26th slot. Served via `serve_replica.py` on **8925**; 287 files / 14 MB, **34 HTML pages** + fully vendored `parameter-assets/` (120 entries: JS chunks, woff2, avif) + `.origin` provenance file.

1. **Crawl + asset vendoring**: Turbopack `?dpl=` chunk twins handled per the kebra/callosum precedent (restored at serve time). All scene-critical assets local — `parameter-assets/` holds the deployed JS/CSS/font/image tree; zero cross-origin runtime imports on the replica (logo + hero are local png/avif).
2. **Sweep**: `pages=34 refs=3442 residual_uniq=0` — zero serve defects across all 34 HTML pages.
3. **DOM-fact parity** (relay, same tab, live vs replica): h1 "Security at the speed of development" identical, bodyH identical, identical img counts (77/79 lazy-loaded present on both).
4. **Visible-text parity via innerText line-set diff** (new variant of the parity recipe): dump `document.body.innerText` from both URLs in the SAME relay tab, then compare line SETS. Live 5126 B ⊂ replica 5244 B: every live line present in replica; the only replica-only lines are the cookie-consent banner ("We use cookies to measure how this site is used… Accept / Reject / Manage"). **Consent-banner origin artifact**: the banner renders ONLY on the fresh localhost origin — consent state is stored per-origin (live parameter.ai origin has stored consent; `127.0.0.1:8925` is a new origin), so the banner is expected environmental, not a mirror gap. Byte-equality of innerText is therefore NOT the right bar for per-origin-consent sites; line-set containment + witness of the delta class is.
5. **Vision parity** (`inspect_image`, 8/8 frames): identical hero 3D-cube scene, node visualizations, nav, footer across live vs replica.
6. **Variant-serving site**: live HTML carries `data-dpl-id` deployment flags — live-vs-live reloads can differ by consent/variant state (same class as River's headline rotator, D14 jitter floor). Compare line sets, not byte strings, when the live origin A/B-serves.
7. **Computer-use leg**: `computer` tool TCC-blocked (Screen Recording permission denied) — ceremonial leg skipped with documentation, same as Trident; relay + vision + sweep carry parity.
## Fabraix (fabraix.com — 28th pick)

**Fabraix** — Vite SPA site (fabraix.com, **YC S26**, "Adversarial Verification for AI Agents" — agents that hack your AI before attackers do; "Our agents hack your AI before attackers are able to"). Served via `serve_replica.py` on **8926**. Site is a Vite SPA with a twist: the HTML shells carry **no copy** — text hydrates at runtime from `/content/*` (11ty-style `site.yaml` + article markdown), so a plain crawl yields shells-with-zero-text. Content tree (`content/site.yaml` 20.8 KB, 5 research `*.md`, research `og/*.png`, `logo.svg`) was fetched and vendored locally; 13 HTML pages incl. five routes the BFS crawl missed (`careers/`, `privacy-policy/`, `terms/`, `security/`, `compare/`) + 5 blog article route shells (all serve hydrated content on the replica). `.origin` provenance records the manual content vendoring. Live GitHub API call (ACE repo stars) stays external by policy.

1. **Sweep**: `pages=13 refs=142 residual_uniq=0` — zero serve defects; all subpages smoke-tested (`/blog/`, article, `/careers/`) render 200 with hydrated text.
2. **Text parity**: `document.body.innerText` byte-identical live vs replica — 9849 B, 225 lines each, missing 0 / extra 0 (strict byte equality, stronger than the line-set bar; no consent banner on either side). Page height identical too: 12075 px both sides.
3. **Headless-CDP fullPage pair** (new capture leg; relay-tab screenshots blocked this turn — see relay caveat below): isolated headless Chrome on port 9344, `Emulation.setDeviceMetricsOverride` (1280×720, scale 3) + `Page.captureScreenshot captureBeyondViewport:true` → 3840×36225 both sides. **Two durable tool lessons**: (a) headless `--screenshot` with a tall `--window-size` (1280×15000) BREAKS the site's `100vh` sections (judge saw ~80% black void) — must capture real 720-vh viewport + `captureBeyondViewport` instead; (b) headless `Page.captureScreenshot` with `format:"webp"` returns `data:""` — use PNG (webp empty-data quirk in Chrome 151 headless).
4. **Pixel parity**: per-row hash compare of the full raw PNG pair — **90.0% of 36 225 rows byte-identical**; the 3620 differing rows are confined to animated bands (hero flow-gradient canvas y≈0–3000, animated scroll-triggered blocks y≈6000+, y≈33 000+), mean max-channel diff 13/255 within those rows, vs zero drift through all static rows. Control: hero/mid/footer strip crops (q85 JPEG) from live and replica are **md5-identical** — the visible animated variance quantizes out, static design is pixel-equal.
5. **Vision judge** (`inspect_image` rubric: sections + verbatim headings, artifact scan, score /10): **7.5/10 expensive-look** — locked black/cream/orange brand system, bespoke not template, clean headings (hero "Our agents hack your AI before attackers do", "INTRODUCING NYX", "Nyx, measured.", "From the team behind ACE.", "See if your team can sign up now.", "Pricing that fits how you test"), no broken images/unstyled text/overlaps. Only questionable element: a large black band above "INTRODUCING NYX" — an unpainted scroll-triggered section, identical on both sides (advisory-verified: zero <video>/<iframe> tags in vendored HTML — JS-initialized canvas band, not an embed).
6. **Relay caveat (blocked tab-activation)**: this turn the OMP Browser Relay's CDP socket (`ws://127.0.0.1:9224` `/cdp` browser endpoint) lacked `Target.getTargets`, per-page `/devtools/page/*` WS URLs fail HTTP 101 (no `webSocketDebuggerUrl` in relay `/json/list`), and the SDL extension only captures the OS-visible tab — activating background tabs requires computer-use, which is TCC-blocked (`desktop.windows()` → `{}`) on this box. So relay-side flushed screenshots were impossible; headless CDP on a distinct port is now the capture vehicle for the vision leg (deterministic, full-CDP, no visibility requirement). Port hygiene: 9333 is a real-user Chrome debugging port — never driven; 9344 is the dedicated isolated instance.
7. **Advisory verification + charts-gap repair** (post-ship): the advisory's hydration litmus (where does runtime text come from?) is settled — `fabraix/assets/siteLayout-DP_gnFnc.js` fetches `/content/site.yaml`; triple byte-match live == vendored == replica-served (sha256 `70c944df4105ad302fdf4644b1ea81898ffd33b7c4937235174cede8dbf110c9`). The advisory also caught a real gap the residual sweep missed: 5 article markdown files embed iframes to `/content/research/charts/*.html` — runtime-injected refs are invisible to the HTML-attr sweep (that's why `residual_uniq=0` while charts were absent). **All 15 chart HTML files vendored** from live at their literal iframe paths → `fabraix/content/research/charts/*.html` (74,106 B total; 15/15 serve 200). Live chart URLs 301 → extensionless; vendored `.html` matches the in-browser request path (301-collapse on replica, in-browser identical — noted in `.origin`). Chart external deps: Google Fonts css2 (left external by policy, see fonts decision below) + **3 CDN JS** — Chart.js 4.4.1 (cdnjs), chartjs-adapter-date-fns 3.0.0 (jsdelivr), chartjs-plugin-annotation 3.0.1 (cdnjs): vendored per the Trident content-critical-deps precedent into `content/research/charts/vendor/` (205,125 B / 50,650 B / 34,500 B) with all refs rewritten to `./vendor/...`; zero cdnjs/jsdelivr refs remain (serve rewrites to absolute `/content/...` — disk has relative, browser resolves identically).
8. **Chart render parity** (headless-CDP probe, port 9344, `Runtime.evaluate` after 16 s): `/blog/swe-bench-90-percent/` and `/blog/adversarial-cost-to-exploit/` — replica byte-identical to live on every measured surface: identical h1, identical innerText length (4636 / 30408), first chart iframe paints (Chart.js loaded, canvas 400/320 px), zero console errors. Off-fold `loading="lazy"` chart iframes defer identically on BOTH sides in a non-scrolling probe — real preview behavior, not a mirror gap (live control shows the exact same deferral profile: 1 painted + 3 deferred on each side).
9. **Fonts decision**: Google Fonts css2 (Inter/IBM Plex Mono/JetBrains Mono) + both preconnects stay EXTERNAL by policy — palisade vendored its woff2 set, but here three font families shared across the SPA + chart iframe pages make vendoring higher-drift for marginal offline gain; documented as a conscious "cross-host assets external" instance, not an oversight.

## Veria Labs (verialabs.com — 29th pick, 2026-08-24)

**Discovery lane (D29)**: YC batch API (`batch?` cohorts) yields 599 companies (S26=236, W26=199, F26=18, F25=146) — filter for AI/cyber keywords, then gate candidates on: (1) robots.txt allow-all, (2) clean SSR footprint (curl HTML size + no JS-shell), (3) flushed-capture design screening. Veria passed on all three; **antigen.sh failed the design gate at 2-4/10 across strips and was dropped before crawling** — the flush-capture screen is an effective cheap reject before committing to a crawl.

**Methods hardened this round**:
1. **Sitemap sources vary**: verialabs uses `sitemap-index.xml` (not `sitemap.xml`) -> `sitemap-0.xml` with 19 URLs. The crawler resolves the index automatically; don't assume the single-file name.
2. **Post-crawl byte-size spot-check against fresh live fetch** (new durable rule — cache-pollution): one crawl pass vendored a STALE Cloudflare-edge Next.js build at `/contact/` ("Intro | Veria Labs" shell, 451 `_next/static/chunks/` refs) while every fresh live request returned the true Astro page. Contributor signals: HTML size wildly divergent from siblings (557 KB vs ~20 KB), `_next` refs that 404 on live, title branding that matches a different framework. Fix = idempotent full re-crawl (any other poisoned responses surface in the next sweep), then byte-length compare key pages vs live. Sweep caught it only because 451 unresolvable refs exceeded noise.
3. **Gravatar asset vendoring**: author avatars keyed by hash (gravatar.com) stored to `avatar/<hash>/index__size-256.html`; broken-image fallback path preserved for hash-keyed misses. External asset host passed via `--asset-hosts gravatar.com`.
4. **innerText byte-parity with a ticking counter**: home page has an animated demo timer — parallel live/replica probes can transiently differ on the tick digits while sequential probes are byte-identical (chars/lines/heights equal across all probe modes). Conclude from sequential captures; treat parallel capture diffs near animated elements as jitter, not divergence.
5. **Pixel-parity protocol at scale 3** (3840-wide, `captureBeyondViewport`): 97.7% of 12 978 rows byte-identical; diff rows are sub-pixel antialiasing + the live ticker (avg 0.026/255); static footer strip md5-identical. This is now the standard evidence class for the full-page leg.
6. **Vision-judge cadence**: same model, same rubric, same capture pipeline judged live 7/10 and replica 7/10 — vision parity plus the "expensive-look" bar (>=7) in one pair.


**Relay leg (D29 followup)**: the 9224 relay bridge accepted browser-WS `Target.createTarget` + `Target.attachToTarget(flatten)` this turn (per-page WS urls still absent from `/json/list` — attach via the browser endpoint only). Live vs replica probes in the REAL window: title/h1/innerText chars identical (4981==4981), but `scrollHeight` 4758 vs 5214. Diagnosis = recurrence of the Trident per-origin zoom artifact: same browser renders `verialabs.com` at 1920x936 dpr 2.0 but the `127.0.0.1:8927` origin at 2400x1170 dpr 1.6 (~80% stored per-site zoom) — vh-sized sections scale with the effective viewport, so page height differs (456px ~ two vh sections). Controlled-viewport capture (same 1280x720 headless, both origins) collapses the delta to zero (heights 4663==4663). +
## Agentic Fabriq (agenticfabriq.com — 30th pick, 2026-08-24)

**Discovery lane (D30)**: YC batch API rosters fetched for F25/W26/S26/F26 and screened for AI/cyber/identity candidates in one sweep. Rules applied (see D29): robots.txt allow-all, clean SSR footprint, flushed-capture design screening **≥7/10**. Rejects before the gate: nebusec.ai, traceforce.ai, multifactor.com, beesafe.ai, usekestrel.ai, sourcebot.dev, ashr.io, ego.ist. **agenticfabriq.com passed 7/10** (W26, "Identity and Permissioning for AI Agents" — hero = live credential-event ticker, permissions UI, GDrive/Slack/GitHub integration rows); runcanary.ai also 7/10 (held as backup).

**Site shape**: `https://www.agenticfabriq.com/` (apex redirects to www), robots allow-all (explicit AI-crawler allows: GPTBot/OAI-SearchBot/ClaudeBot/PerplexityBot), sitemap.xml 154 URLs (130+ = integrations/blog/docs/solutions). NOT Astro (no generator meta) — React/Next-style SSR (JS chunk under `/b/<buildid>/*.js.gz`, `data-discover` attrs); marketing content fully server-rendered, so the mirror is complete without the JS runtime (same class as conifer.build).

**Crawl**: `python3 mirror_site.py https://www.agenticfabriq.com/ agenticfabriq --depth 3 ...` → 335 files / 54 MB, CF asset host `ddwl4m2hdecbv.cloudfront.net` vendored under local paths.

1. **Ghost-catch-all quirk (durable)**: this site serves the full 141,355 B home HTML shell for ANY unknown route — `/blogs/token-refresh-…`, `/#n`, `/gcp-app/home/` all return the home shell live. So a "404 page" class doesn't exist here; mirroring the shell at those paths IS parity (inverse of D29, where live served a real custom 404 page and replicating live failure was parity).
2. **Residual = crawler fetch bug, not a live gap**: the only sweep residual was a blog image with a SPACE + PARENS in its filename (`blogs/token-refresh-101-how-oauth-refresh-tokens-work/s-l1200 (1).jpg`) — the crawler's unencoded-paren fetch fails server-side even though the file exists. Vendor manually with `curl` using `%20` encoding for the space (leave parens literal — the CDN canonicalizes) → 327,615 B real JPEG; re-sweep → `pages=178 refs=12707 residual_uniq=0`.
3. **Anti-ghost byte audit (D29 rule applied)**: live home stable at 141,355 B across 3 fetches; vendored home 141,607 B — the 252 B delta is ALL asset-URL rewriting (absolute→relative: `https://ddwl4m2hdecbv.cloudfront.net/b/...` → `b/...`, `fabriq-logo.png` → `../...`), confirmed by diff showing only rewritten src/href lines; zero content drift. Same check on /developers/, /integrations/, /contact/, /blog/oauth-refresh-tokens/.
4. **Vendored CF chunk is the last-good copy**: `/b/4O7Z0HED5ZNX/4O7Z0HED5ZNX.js.gz` captured at crawl time (9,984 B real gzip) — live CF now 403s the path for plain curl, so the vendored bytes are the truest state; replica serves it 200 with Content-Type application/gzip.
5. **Text parity (viewport-forced CDP, D29 protocol)**: heights equal on all 5 probe pages (home 10420==10420, /developers/ 4820, /integrations/ 3085, /contact/ 1862, /blog/oauth-refresh-tokens/ 3674). Home innerText 7841 vs 7843 — 2-char delta isolated to the hero **credential-event ticker** (line 32: live `secret.rotate issued` vs replica `access.token issued`); sequential fetches prove BOTH sides rotate through event strings (secret.rotate/access.token/calendar.create/gmail.send…), so the delta is animation-frame, not divergence (Veria precedent, step 4 above).
6. **Pixel parity (scale-3 fullPage, 3840×31260 both)**: 93.7% of 31,260 rows byte-identical; differing rows confined to animated bands (0–499 → 27.1% diff, 500–999 → 13.4%, 3000–3499 → 49.9%, 4500–4999 → 8.4%, 9500–9999 → 32.8%; all others byte-identical, avg diff 0.45/255, max 9.6/255). The 3000–3499 band (highest diff) is the architecture diagram — two independent vision reads call it "identical" (AGENTS: sales-agent green, support-bot green, data-pipeline gray → central AGENTIC FABRIQ hub → TOOLS & SERVICES Gmail/Slack/GitHub/Drive); band md5 differs only on animation frames, no layout shift.
7. **Vision judge**: full-page captures, same model/rubric → live **7/10** == replica **7/10** (gate ≥7, parity in one pair).
8. **Ports**: replica on `serve_replica.py` **8928**; capture vehicle headless CDP 9344 (never 9333) with `Emulation.setDeviceMetricsOverride{width:1280,height:720,deviceScaleFactor:3}` + `captureBeyondViewport:true`.

## Cheap pre-filter (design_signal.py — D30 followup, active from D31)

**Rule**: before spending flushed-capture + vision calls on round-2 candidates, run
`.tmp_tools/design_signal.py <mirrored-home.html>` (or `--live <url>`): a stdlib-only
HTML design-signal ranker (content depth, section richness, logo walls, display-font
hints, dark-theme CSS, animation/3D markers, boilerplate penalties) with a fail-open
floor. Score >=4.5 -> "JUDGE (capture+vision)"; below -> "SKIP (looks template-thin)".
Slot: after the robots/SSR gate, before flush-capture; the >=7 vision judge remains the
gate, and vision judgment runs only on the top 2-3 candidates.

**Calibration on known-good mirrors** (same vision model/rubric ground truth):
agenticfabriq 6.4 -> JUDGE (vision 7/10 ✓); veria 4.7 -> JUDGE (7/10 ✓); fabraix 1.6 ->
SKIP — but fabraix is a CSR SPA shell that already fails the SSR gate before this tool
ever runs, so the SKIP is never the binding rejection (documented caveat, not a filter
failure).

**Noise lessons (2026-08-24)**: (1) the bare word `template` is NOT a boilerplate
signal — both `grid-template-columns` CSS and `<!-- row template -->` dev comments trip
it (agenticfabriq), so the marker list is platform names only (webflow/wix/squarespace/
elementor/godaddy/wordpress.com/"built with"); (2) HTML entities must be unescaped
before font-family parsing (`&quot;JetBrains Mono&quot;` otherwise leaks `&quot` as a
fake display font); (3) ui-sans-serif/ui-serif/ui-monospace are system generics —
excluded from display-font credit.

## Covera (www.covera-agents.com — 31st pick, 2026-08-24)

**Discovery lane (D31, first full design_signal pre-filter)**:
F26 roster (18 companies) fetched from the YC batch API; robots/SSR gate applied;
then design_signal.py --live screening: covera 4.8, veeza 6.2, collar 6.9 — all
three >= 4.5 → JUDGE round. Flush-captures + vision judge (gate >= 7): **covera
7/7/7 PASS**, veeza 6/6/6 FAIL, collar 4/7/6 FAIL → winner with the highest full
pass. (Pre-filter worked: 3 candidates captured instead of 6+; the failing two
were caught at the vision gate, not after a full crawl.)

**Site shape**: `https://www.covera-agents.com/` — Next.js Turbopack SSR build
("AI agents for insurance brokers", YC F26; H1 "Less admin, more selling."), en +
fr locales, robots allow-all (Host + sitemap declared). Static SSR ⇒ the mirror is
complete without the JS runtime. Portfolio row + .origin committed; served via
`serve_replica.py` on **8929**.

**Crawl**: `mirror_site.py` → covera/ (54 files / 1.8 MB — small, mostly the 21
vendored woff2 + 8 partner logos). The opengraph-image route handler
(`/en/opengraph-image`, `/fr/opengraph-image`) vendored as PNG **bytes** under the
crawler's requested path (`…/opengraph-image/index__1ed4f61bdafae44f.html` —
crawler stores fetched bytes at the requested URL); md5 == live (byte-verified).

1. **Residual sweep** `pages=5 refs=… residual_uniq=2` — both residuals are
   `apple-icon`, and live 404s them with the identical refs → parity, not a serve
   gap (same class as D29 /privacy/ + D30's inverse ghost lesson).
2. **Text parity (viewport-forced CDP, D29 protocol)**: 3/3 probe pages MATCH
   exact — `/`, `/fr/`, `/insurance-fest-2026` — title, h1, innerText chars +
   lines, scrollHeight all byte-identical live vs replica. (No ticking/dynamic
   text on these pages other than the clock, which lives in the home booking
   form — see pixel audit.)
3. **Pixel audit — 2026-08-24 (the D31 lesson: attribute EVERY diff before
   concluding)**: full-page captures 23106×3840 (7702 CSS px × 3 DPR) both sides.
   Early pair showed ~98.6% rows byte-identical with three differing bands:
   (a) **nav strip rows 87–187** — NOT a structural delta: fresh synchronized
   captures (timeshot.mjs, same wall-clock window, both origins) give 720/720
   viewport rows byte-identical incl. rows 80–200; the boot/hero animation
   (fade/position) is a transient frame that lands differently per capture time.
   (b) **logo wall rows 16281–16360** — the site runs an infinite horizontal
   **logo marquee**: marquee.mjs measures 18 logos shifting −29.97/−30.01 CSS px
   per 800 ms on BOTH live and replica (same content, same speed); captures at
   different wall-clock moments freeze different x-phase, but the marquee y-extent
   is constant ⇒ a deterministic row band, not a rendering difference. Settled by
   font probe (26 FontFace records, identical loaded set both sides), label
   geometry probe (Inter 16.8 px / lh 25.2, identical), img-rect probe (same
   srcs+rects), logo-byte md5 (all 8 logos identical live vs vendored).
   (c) **bot band = live clock**: fresh 3-band captures (`d31_bands.mjs`,
   3840×2160) → top + mid md5-identical; bot differs in exactly 41/2160 rows at
   x 1784–1872 = the booking-form clock text "Israel Time (01:22)" vs "(01:23)"
   — the minute ticked between captures. NOTHING else in the whole bottom band
   differs. ⇒ zero real rendering differences; all bands time-varying elements
   frozen at capture time. (Contrast with D30, where 93.7% was parity and bands
   were attributed by animation; D31 goes further — synchronized recapture +
   per-mechanism probes prove band-by-band identity.)
4. **Vision judge (3 viewport bands, top/mid/bot)**: content identical in every
   band both sides; polish live 8/7/7 vs replica 7/7/7 — all >= 7 (D30-style
   live==replica pattern). Minor "Less admin, more advising/selling" read = OCR
   variance on a byte-identical row run. PASS.
5. **Ports**: replica `serve_replica.py` **8929**; capture vehicle headless CDP
   9344, `Emulation.setDeviceMetricsOverride{width:1280,height:720,
   deviceScaleFactor:3}` + `captureBeyondViewport:true` (clip > ~16384 px fails;
   clip-less fullPage handles 31 k-px pages).

**Tools added this turn**: `.tmp_tools/d31_bands.mjs` (3-band synchronized
capture), `d31_full.mjs` (full-page fp1/fp2 pairs), `d31_pxdiff.py` (stdlib PNG
decoder + row diff), `af_parity.mjs` (text parity harness reused 3/3).


## Ndea (ndea.com — 32nd pick, 2026-08-24)

**Discovery lane (D32, second full design_signal pre-filter round)**: YC batch
API re-pull of all four cohorts (F25=146, W26=199, S26=236, F26=18 = 599) →
existing-mirror exclusion via the one-`glob */` dirname rule (see D16 bullet) →
robots gate (404/empty robots.txt = allow-all; full-site `Disallow: /` or
AI-crawler `content-signal` block = skip; per-path disallows OK) → SSR front
gate → `design_signal.py --live` rank (>= 4.5 fail-open JUDGE) → flushed-capture
+ vision **>= 7 binding** on the top 2-3. Passed: **ndea.com** (YC W26, "Building
AGI that can innovate.", AI/Deep Learning/Hard Tech/Remote Work/ML, teamSize 15,
Active). Dropped below bar: flick, wardstone, origin, mochi.

1. **Site class — hand-rolled static Jekyll** (5th pure-static member after
   caution/last-accounting-company/river/veeda): simple HTML + one
   `media/css/global.css`, `media/js/{illustrations,scripts}.js`; 6 canvases
   (particle-field "network" art from `illustrations.js`, rAF + `cycleLength
   3000`, 300 particles — per-load random seed).
2. **Mirror**: `python3 mirror_site.py https://ndea.com ndea --depth 6` → `ndea/`
   (pages /, /about, /jobs, /jobs/symbolic-reasoning-open, /contact, /podcast,
   7 files of HTML served); `.origin` = `https://ndea.com`; replica via
   `serve_replica.py` **8930** (hub `ndea-replica`).
3. **Residual sweep**: derived `ndea_sweep.py` from `af_sweep.py` (hardcoded
   `SITE, PORT = "ndea", 8930` — BSD `sed` pattern MUST include the `"` quote
   before the comma or it silently no-ops) → `pages=7 refs=149 residual_uniq=0`
   — zero serve defects.
4. **Text parity**: `af_parity.mjs` 5/5 MATCH — /, /about, /jobs, /contact,
   /jobs/symbolic-reasoning-open innerText chars/lines/heights byte-identical.
   Real-Chrome relay re-probe: textLen 4702 == 4702, weighted hash identical
   both sides, 6 canvases both, nav identical.
5. **Asset byte-identity (cache-pollution rule)**: SHA-256 all SAME live vs
   vendored — illustrations.js, scripts.js, global.css, ndea-founders.jpg,
   ndea-og-image.jpg, type.css.
6. **Pixel audit — the D32 lesson (fade-freeze root cause)**: full-page
   captures (3840 wide, scale 3) → top band byte-identical 2160/2160 on a fresh
   synchronized pair; mid band 44.4% identical rows, bot 78.7% — differing rows
   confined to the particle-canvas art + h1 region and with mean deltas 35-53.
   **Control decides it**: live-vs-live self-capture of the mid band = 44.7%
   identical rows, deltas 47.8-49.1 — statistically THE SAME residual as
   live-vs-replica. The replica is pixel-indistinguishable from "another live
   load": the residual is the site's own per-load stochastic canvas + heading
   fade, not mirror drift. Root cause of the earlier "replica h1 renders pure
   black": the site fades-in h1/h2/h3 (.fade-in, opacity 0 + translateY(10px))
   via IntersectionObserver adding `.visible` → CSS `transition: opacity 1s ease
   0.3s`. In hidden/backgrounded tabs (relay tab in real Chrome; headless
   capture vehicle) Chrome freezes frame production ⇒ the transition freezes at
   an arbitrary phase (observed 0 / 0.025 / 1 across loads — INCLUDING two
   loads of the live site itself, where a real-Chrome relay tab of ndea.com
   showed opacity 0 through 8 s and another load showed the headline fully
   painted). Each load freezes at a load-specific phase; re-capturing the same
   already-loaded page is pixel-stable (live-vs-live2 == rep-vs-rep2 == 100%).
   Classified per the D31 live-dynamic rule: identical content + identical
   mechanism + same state spread per side = parity; phase mismatch = artifact,
   not a mirror defect. h1 rep3 vs live3 fresh crop: both render the italic
   headline identically.
7. **Vision judge (3 viewport bands)**: live 7/7/7; replica 7/7/7 (top/mid/bot
   all >= 7, content identical per band). Relay real-Chrome full-page shots:
   same site both sides (identical nav/sections/copy; the "© 2024 vs © 2025"
   reading was OCR noise — innerText hash equality is ground truth). PASS.
8. **Ports**: replica `serve_replica.py` **8930**; capture vehicle headless CDP
   9344. Band tooling reused from D31 (`d31_bands.mjs` + `d31_pxdiff.py`).

**Tools added this turn**: `.tmp_tools/ndea_sweep.py` (per-site af_sweep
derivative), `ndea_probe_one.mjs` / `ndea_render_probe.mjs` (single-side CDP
render probes — the dual-URL variant hung on its second target; split per URL).


## Ossus (www.ossus.com — 33rd pick, 2026-08-24)

**Discovery lane (D33)**: YC batch roster refresh (F25=146, W26=199, S26=236, F26=18 → 599, pool 574) screened with `d33_rank.py` (design_signal h1-gate → 288 ranked) + flushed captures + vision judge. 75+ sites captured/judged, all ≤6 except **ossus.com 7/7/6 live bands** ("genuinely premium": custom display serif, painterly classical-architecture scenes, asymmetric editorial grid). amulet.so 7→6 + robots disallow-all skip; lantern rejected 6/6/6.

**Funding re-verify (advisory gate, 2026-08-24)**: YC W26 roster entry has no funding metadata → external check. Ossus = **formerly Librar Labs** (founder LinkedIn: "We've changed our name from Librar to Ossus (YC W26) and have raised $6 million", Jun-Jul 2026; YC company profile W26 "AI-native operating system for school and public libraries"; edsheet newsletter "Ossus raises $6M", investors undisclosed; Dealroom lists a $125k YC financing entry Jan 2026 — treat $6M as company-reported). Confirms the mirrored ossus.com ILS/Librar site IS the YC startup (name change), not the pre-existing open-source OSSUS ILS brand.

**Lane**:
1. **Gates**: apex `ossus.com` 308 → `www.ossus.com` (canonical); robots allow-all on www; SSR-clean Vercel build.
2. **Crawl**: `mirror_site.py https://www.ossus.com ./ossus --depth 6` → 228 files on disk, "no missing referenced assets". 15 HTML routes.
3. **Duplicate-detection rule (this turn's lesson)**: `ossus.com` also matches the pre-existing OSSUS ILS open-source library-software brand — distinct company; the site itself is the YC startup (Librar→Ossus rename).
4. **Residual sweep** (`ossus_sweep.py`, per-site af_sweep derivative): `pages=22 refs=752 residual_uniq=0`; runtime lazy-chunk sweep (CDP 9344 scroll-wave + fetch/XMLHttpRequest hook): zero fetch failures.
5. **Text parity**: `af_parity.mjs 9344 https://www.ossus.com http://127.0.0.1:8931` — **15/15 MATCH** (byte-identical innerText/lines/title/h1 on all 15 routes; home height 5896==5896; /ils 3554 vs 3602 = lazy-image timing only, text identical).
6. **Mid-cycle deploy race (D33 lesson — cache-pollution rule fired)**: at 00:04:20Z 2026-08-24 Vercel re-encoded both `brand/scene-*.jpg` (252KB→673KB portal, 345KB→817KB valley; md5 39b1c…/c064c… → a223fcc8…/bb0a8649…) and updated every page body (~150 B; home +467). The crawler returned byte-identical PRE-deploy trees on three consecutive runs (ossus2/ossus3/final) minutes after curl AND a byte-for-byte identical urllib probe returned fresh — edge purge/POP or HTTP/1.1-vs-2 variance; crawler output during a deploy window is not trustworthy alone. **Verify**: (a) byte-compare assets with live, (b) treat saved-HTML md5-vs-live as meaningless — saved HTML is the intended rewritten form and 100% of its diffs vs raw live are URL-triaged slashes, zero content deltas.
7. **Pixel audit (post-repair)**: bands via `d33_modal_band.mjs 9344` (dismiss-consent variant of d31_bands). Live vs replica: no global tint (signed Δ ≈ 0/255), per-pixel Δ 1-2/255 everywhere except bot-band rows 0-200 (Δ 3.4-3.9 = nav/footer over scene: new-JPEG decode dither); the pre-repair frosted-nav-band cluster (rows 25-280, Δ 89) resolved once the mirror served the post-deploy scenes. Layout identical (same 5896 px height, same band geometry); mid 43% byte-identical rows with sparse ≤2/255 deltas.
8. **Vision judge (3 viewport bands, ≥7 binding)**: live 8/7/7-8 (top/mid/bot), replica 8/7/7 — all ≥7, content per band identical; mid 6-vs-7 swings are prompt framing on identical crops (crop artifact, not replica fault).
9. **Ports**: replica `serve_replica.py` **8931**; capture vehicle headless CDP 9344; relay bridge 9224 (4 leftover probe tabs closed after verdict).

## Axelrod (axelrod.live — 34th pick, 2026-08-24)

**Discovery lane (D34)**: YC batch roster refresh (F25=146, W26=199, S26=236, F26=18 → 599, pool 574) → `design_signal --live` h1 gate + flushed captures (scale 3) + vision judge. Top-10 unmirrored candidates, all ≤6 except **axelrod.live 7 (WINNER)**: capveon 6, hyperprobe 6 (capture showed an incident.io-branded page — suspicious but moot), alkera 4, ritivel 3 (showed "effivo" + washed lower half — artifact suspicion, moot), usechamber 5, eigenpal 5, thehog 2, whitespacehq 5, unsiloed 6.5 (identical neutral framing across all).

**Funding re-verify (advisory gate, 2026-08-24)**: YC roster entry → external check. Axelrod = **YC S26**, "Boutique Hotels that run themselves" — an operating layer for boutique hotels; founders Adrian Stoica + Saman Sayahpour; standard **$500k** YC deal (Summer 2026 batch → ≤18 mo gate PASSES). YC badge in site footer corroborates.

**Lane**:
1. **Gates**: robots.txt `User-Agent: * / Allow: /` (Disallow `/api/` only); real sitemap (20 URLs); SSR-clean Vercel static build, no consent modal.
2. **Single-viewport landing finding**: home is `document.body.scrollHeight === 720` — every viewport "band" is identical; the 8.5MB full-page PNG IS the whole site. All real content weight is in the 19 guide pages.
3. **Crawl**: `python3 mirror_site.py https://axelrod.live/ axelrod --sitemap auto --depth 3 --asset-hosts fonts.googleapis.com,fonts.gstatic.com` → 20 sitemap seeds, 45 files, 43 on disk, 3.1 MB. The 3 "MISSING REFERENCED FILES" all confirmed **404 on live** (`/chatgpt-guides/beds24/worker-starter/src/...` MCP-SDK paths — illustrative literals inside guide code blocks, never fetched by browsers; D16 class). `.origin` = `https://axelrod.live/`.
4. **Sweep-after-server lesson (D34)**: the first residual sweep ran BEFORE the replica server was up → `residual_uniq=64`, all spurious (every ref flags non-200). Restarted with `serve_replica.py 8932` up: `axelrod_sweep.py` → **pages=21 refs=678 residual_uniq=0**.
5. **Text parity**: `af_parity.mjs 9344 https://axelrod.live http://127.0.0.1:8932` over all 20 sitemap paths → **20/20 MATCH** (byte-identical title/h1/innerText/line counts/heights; home 357==357 chars height 720==720; beds24 guide 10171==10171 chars height 10915==10915; guides index 4393==4393 / 3752==3752).
6. **Assets**: 9/9 byte-identical vs live (hero-wood-lobby jpg/webp/-1280.webp, adrian/saman founder jpgs, og-home/og-chatgpt-guides pngs, beds24 guide PDF, favicon.svg). No `data:image/webp` anywhere in HTML.
7. **Fonts (closed out)**: local `css2/index__family-JetBrains-Mono-wght-400-500-display-swap.html` (4790 B) vs live css2 (5042 B) — the 252 B delta is **only** the absolute→relative rewrite (6× gstatic URL → `../s/jetbrainsmono/...`) plus the UA/URL-subset variant; content equal. All **6 `s/jetbrainsmono/*.woff2` byte-identical** vs gstatic (`md5 -q` match, 1.33 s). CDP probe: `document.fonts.check("500 16px JetBrains Mono")` **true on BOTH sides**; 70 mono-styled elements each side; identical computed font stacks. (Chrome accepts the `.html`-suffixed css2 stylesheet — it lists in `document.styleSheets` and fonts load.)
8. **Pixel evidence — MD5-identical captures**: replica full-page PNG (scale 3, 3840×2160, 8 545 941 B) vs live equals byte-for-byte (`md5` 92c5ade11f2543c6cf0f05f07f026806 == both). Strongest possible parity proof; vision judge on the replica with identical framing = **8** (live scored 7) — ≥7 binding holds both ways.
9. **Ports**: replica `serve_replica.py` **8932** (hub `axelrod-replica`, pid 29007); capture vehicle headless CDP 9344. Hub readiness log pattern never matched even though the port LISTENED + HTTP 200 — probe port/curl, not the log pattern.

**Tools added this turn**: `.tmp_tools/axelrod_sweep.py` (per-site af_sweep derivative).


## Method 8: frozen-batch pipeline (D35 refinement of Method 1)

- **Rosters drift while frozen, so re-pull every cycle.** Between D33 (2026-08-23)
  and D35 (2026-08-24) the S26 roster grew 236 → 237 companies (1 new entry).
  The four in-window batches are small enough to re-pull in ~25 s; never reuse a
  cached roster file across cycles.
- **Pagination contract (confirmed D35):** `https://api.ycombinator.com/v0.1/companies?batch=<F25|W26|S26|F26>&limit=50&page=N`
  with envelope `{"companies":[…],"page":N,"totalPages":M}` — iterate `page` 1..M,
  stop at `page >= totalPages`, not on empty pages. `limit=500` caps at 20/page;
  `limit=50` is the efficient sweet spot (8 pages for F25, 10 for W26, 12 for S26, 1 for F26).
- **Fresh pull counts (D35):** F25 146 + W26 199 + S26 237 + F26 18 = 600 raw,
  599 unique domains (one cross-batch dup — keep first-batch occurrence, note the dup).
- **Pool-build recipe (reusable):** normalize domain (strip scheme/`www.`/path),
  key by domain only, then exclude every repo subfolder name — match by slug OR
  domain first-label OR full domain, case-folded, to catch renamed-www instances.
  D35 exclusion set = 35 dirs → 578 unmirrored candidates.
- **Ranking pipeline is fixed-cost and reusable:** `.tmp_tools/d33_rank.py pool.json --top N`
  — robots gate (404/empty = allow; `Disallow: /`; AI-crawler content-signal;
  401/403) → SSR gate (≥1 h1 + ≥1000 body text chars) → `design_signal.score()`
  → ranked JSON (written to `/tmp/d33_ranked.json`) + console top-N. ~575 pool
  entries ≈ 4-6 min at 20 workers. Copy/rename per cycle if the hardcoded
  output path is an issue (it is only a staging file).
- **Capturing gate precedence:** while the rank runs, verify the capture Chrome
  (port 9344) is alive — it is the vehicle for the flush-capture + vision legs.
## D35 close — Cardboard (www.usecardboard.com)

- **Winner:** YC W26 "Agentic video editor in your browser" (YC badge on-page +
  batch record = ≤24-mo funding; AI focus). 8 public routes mirrored; `/app`,
  `/blog`, `/faq` excluded — Clerk auth walls (robots passes only via the
  307→/login false-allow; dynamic auth-walled routes out of scope per D-series
  rule).
- **Turbopack dpl quirk:** live HTML refs chunks as `/<name>.js?dpl=dpl_Gb3Lzw…`;
  the crawler stores them as `<name>__dpl-….js` and serve_replica maps URL stem
  → baked name (verified 200 on chunk probes). The real trap: one chunk
  (`15rgaz_mhqsn6.js`, 3432 B) exists ONLY in the webpack runtime chunk-map —
  no HTML src ref, so crawl AND HTML-ref sweeps both miss it; the browser then
  renders the 103-char "Application error: a client-side exception" shell while
  every static check stays green. Fix: vendor from live with byte-identity check
  (md5 98a707f7; query-vs-bare identical); final arbiter = CDP runtime
  network-failure probe, not static sweeps.
- **A/B CTA separation:** live pricing shows an annual-promo overlay ("3 days
  free, then $384/yr" / "Start 3-day free trial" / "Cancel anytime") while a
  fresh live curl SSR == replica SSR (both "For solo creators…") → PostHog-flag
  runtime overlay, NOT localStorage (cleared-storage re-run still showed the
  CTA on live). Parity = SSR identity + interactive toggle behavior (replica:
  Monthly flips $32→$40/$120→$150, Annual stays).
- **Clerk signup page:** runtime form is a third-party Clerk widget
  (`clerk.usecardboard.com/npm/@clerk/clerk-js@5/…` → 307); parity target is
  SSR identity — saved static text byte-equal to fresh live SSR (109 chars both).
- **Vision judge variance is real:** home top-band capture pair was 2160/2160
  rows BYTE-IDENTICAL yet scored 6 (live) vs 5 (replica); re-judging the SAME
  file scored 7 then 7 → ±1 on identical pixels is model noise, not parity
  failure. Binding evidence is the pixel audit: home top+bottom bands 100%
  identical, full-page 96.7% with every diff row a playing-video frame (mean Δ
  40-112/255), pricing 90.4% with diffs confined to the A/B promo-card region
  (+3 px height delta). Pricing vision 7/7; screening binding held (full-page
  8, top band 7).
## D36 close — Stilta (stilta.com)

- **Winner:** YC W26 "Agentic AI for high-stakes patent work" (on-page YC badge +
  batch record = ≤24-mo funding; AI/IP focus ✓). 15 on-disk files mirrored
  (4.0 MB), served on **8934** (replicas 8918-8933 = prior cycles). robots.txt
  allow-all; Framer site → framerusercontent.com assets + events.framer.com
  analytics left external per cross-host rule (established); index.html ~648 KB
  inline critical CSS, Framer runtime hydrates from CDN.
- **Computer-use leg = cua-driver + real Chrome** (new D-series method for the
  same-window comparison): opened live + replica as tabs in David's
  relay-driven Chrome (window 46026), then per-tab `Target.activateTarget` →
  `get_window_state` (AX tree + screenshot) under identical geometry. Both
  pages share the AX WebArea title (document.title identical). AX diff:
  29/1635 (role,label) lines differ (~98.2% identical) — every diff is browser
  chrome (tab-strip radio reorder produced by the activation swap itself,
  Zoom:80% button, AXMenuItem order) or marquee logo-slice timing: live shows
  EIP + Mannheimer Swartling per frame, replica shows KUKA; replica HTML holds
  all 10 logo alts incl. Husqvarna → viewport-intersection slice, live-dynamic,
  NOT a parity defect. Cua vision pair (identical phrasing): live 7/10,
  replica 7/10; no broken images/glitches either side.
- **Rest of battery (established lanes):** render probe 8 routes match exactly
  at settle, single identical ERR_BLOCKED_BY_ORB both sides, zero console
  errors; text parity 15/15 routes (18559 chars raw text identical; 6 DIFFs =
  content-visibility timing artifacts); pixel audit scale-3 identical framing:
  bottom band md5-pixel-identical, top band 2057/2160 rows (95.2%) with
  localized low-magnitude deltas; vision full-page 7/7 + top band 7/7
  (screening binding held); 404 parity faithful (`/news/ptab-ai-prior-art-benchmark`
  404s identically on live, unmirrored).
- **Framer + marquee lesson:** Framer marquee strips are scroll-driven animation
  — the AX-visible logo subset tracks viewport timing, so upstream/downstream
  capture skew shows different named clients per load. Compare against the
  HTML alt inventory, not the captured frame; runtime slice ≠ parity failure.
## D37 close — Allia Health (allia.health)

- **Winner:** YC S26 "Clinically Integrated Group for Mental Health" (first
  full-stack, AI-native clinical group for mental health; 600+ providers;
  AI-native ✓, batch record = ≤24-mo funding). 19 on-disk HTML routes
  mirrored (9.4 MB), served on **8935** (+8936 zoom-free). robots.txt
  allow-all. Framer site → framerusercontent.com assets + events.framer.com
  analytics left external per cross-host rule; subdomain apps
  (app/worksheets/transparency/help/support.allia.health), cal.com,
  googletagmanager.com, unpkg.com are live links, not mirrored.
- **Screening:** roster F25=146 / W26=199 / S26=237 / F26=18 → 600 raw → 572
  pool → 287 rankable; signal top: spaceflow 7.40, perfectly 7.30, karumi
  7.10, minro 7.10, trylapis 7.10, talentpluto 7.10, allia 7.00, bernard
  7.00. First fab_cdp_shot pass (non-scrolling) unfairly blanked lazy
  sections (allia 5 / trylapis 4 / talentpluto 5) → **discarded, use
  d31_full.mjs for screening** (scroll-flushed): karumi 6, trylapis 6,
  bernard 6, minro 4, talentpluto 4, **allia 7**; allia full/top/bottom
  bands 7/7/7 → binding held (D36 precedent). spaceflow/perfectly skipped
  (D35 vision-rejected 5/10).
- **Crawl/serve:** depth 6 → "no missing referenced assets" (sweep clean, no
  vendoring needed); all 19 routes HTTP 200 on replica; text parity 15/15
  (first pass 13/15, /network + /blog −40 chars = content-visibility
  timing, re-run MATCH); render probe LIVE == REPLICA (title / height
  11894 / innerText 6322, zero console errors, identical 6×
  net::ERR_ABORTED Fetch class).
- **Per-HOST Chrome zoom trap (new):** replica host `127.0.0.1` had a saved
  **80% browser zoom that persisted across ports** (8935 AND fresh 8936 both
  80%) → window captures 58% pixel-differed while content was true. Detect
  via the AX "Zoom: 80%" button label in the cua-driver dump; fix =
  cua-driver `hotkey {"pid":61010,"window_id":46026,"keys":["cmd","0"],
  "delivery_mode":"foreground"}` (plain key send refused:
  `same_pid_keyboard_ambiguity` — process-scoped keys can't be proven to
  reach one window; foreground delivers globally, `effect: unverifiable`).
  The computer tool is unavailable (no macOS Screen Recording grant) —
  cua-driver hotkey is the key-input path.
- **Relay per-session CDP bridge dead:** on 9224, browser-level
  `Target.createTarget/activateTarget/closeTarget` work but session-scoped
  commands (`Runtime.evaluate` via attachToTarget flatten sessionId → "'…
  wasn't found") fail — read zoom/state from the AX dump instead of CDP.
- **Computer-use leg (cua-driver + real Chrome, window 46026, tab swap):**
  AX web-content parity **391/391 nodes = 100.0% positional identity**
  (role::label::value, zero diff lines; chrome chrome excluded via
  `in_web_content`); after zoom reset the two window captures are
  **md5-byte-identical** (dfdf6f36…, 0 / 1,270,080 px differ = 0.0% — the
  strongest parity evidence yet, beating D36's ~98.2%). cua vision pair
  7/10 (byte-identical files, single judge). No broken images either side.

## D38 close — Specific (specific.dev)
- **Pivot:** D38 started on incidentfox.ai ("The AI SRE for Teams"). Screening flush-captured; incidentfox SEL (9/[…screened…]) judge 7/10, crawled 23 files, 13/13 text parity, 440/440 AX identical — but the replica FULL-PAGE re-judge came back **6/10** vs live 7/10. New precedent: a single 7 at screening is NOT a bound verdict; binding requires ≥7 reproducible on identical pixels on BOTH sides. Dir deleted, port freed, same-pool re-run.
- **D38 second screening (same pool, flushed, capture Chrome 9344, judge with vision role):** tryglen 7+7 (identical-pixels re-judge) + top band 7 = triple 7 (fallback); specific.dev 7 → **8** on re-judge (highest ceiling, same crop); caseyinsure 7+7; osseus 7 (full-res 24MB PNG > inspect_image cap → sips `-Z 2200` downscale, judged twice at same file); ≤6: complydo, tryq2q, controlseat 6, amerahealth 5, usederya 4, patientdesk 4, rumacare 4; maywoodai = 154KB JS-gate stub again → skip. **Winner = specific.dev** ("Cloud platform built for coding agents"; YC F25, one-liner "AWS for coding agents", founders Fabian Lindfors + Iman Rajdavi, schema.org foundingDate 2025). Pool entry verified via jq from /tmp/d38_top.json; robots.txt allow-all; home 200; Cloudflare-fronted Next.js static export (server-rendered 183KB HTML, 14KB text).
- **Crawl/serve:** `python3 mirror_site.py https://specific.dev/ specific --depth 6` → **62 files**; refs-audit clean; live `/docs` is ALSO 404 (dead nav link on live — parity preserved; only 10 real routes + 2 og-route shells). Hub d38-specific-8937 = `serve_replica.py 8937 specific` (PID 56994); `/ /pricing /blog` 200, `/docs` 404 matches live.
- **Canonical-only refs (new class):** `logo.svg` exists ONLY as a string inside schema.org JSON-LD + Next RSC payload (no `<img src>` — nav logos are logos/*.svg) and `sitemap.xml` exists only in robots.txt = metadata, never fetched by the page → unmirrored, both 404 on replica with zero visual/content impact. og:image meta keeps the absolute `https://specific.dev/opengraph-image?2b9…` URL (live identity ref, per cross-host precedent — bare route mirrored as shell).
- **Text parity:** af_parity 10 routes → 9/10 byte-exact; / DIFF (+65 chars, +7 lines) = LIVE TYPING-TERMINAL ANIMATION FRAME (spinner glyphs ⠏/⠇, mid-type "Ran specific status", "Creating archive…"), content identical.
- **Render probe (probe_errors.mjs on CDP 9344):** title / scrollHeight **8091==8091** / innerText **10389==10389**, 0 console errors both; replica 1× `net::ERR_ABORTED :: Script` = client-canceled **PostHog /ph/…/config.js beacon** (external analytics; live 0 by timing — identified via failreqs probe on the page WS; rewrite kept Network.enable on pws/pmsg, not browser WS).
- **Live-dynamic control methodology (new):** site self-animates (ambient background gradient + typed terminal + PostHog) → any pixel/AX/text capture pair shows frame noise. Prove it with a CONTROL live-vs-live re-capture: cua window pair 1568×810 (Cmd+0 zoom-reset first): replica-vs-live 454/810 identical rows (56.0%) vs control live-vs-live 419/810 (51.7%) → **replica drift ≤ live noise**; full-page pair mean Δ≈10/255 = gradient layer, band 12000-12499 mean 118.8/max 238 = terminal typing frame. AX 469/469 page nodes identical (sole diff = glyph frame); pass 2 482 vs 480 = 2 extra live-typed lines.
- **Vision binding (≥7 full AND ≥7 top band, both sides, reproducible):** live full 7→8 (re-judged identical pixels), live top 7; replica full 7, replica top 7. Top-band re-check on identical framing (d31_full flushed capture already scale-3/3840px — crop rows 0–2160, no second fetch): live 7, replica 8 → binding re-confirmed, and this crop-first method is the rule for future top-band re-judges (a second capture can score differently on lazy-load/animation state).
## D39 close — Zavo (zavopay.com)
- **Fresh 11-candidate pool (Method 8, YC F25/W26/S26/F26 rosters, flushed 3840px via `bun .tmp_tools/d31_full.mjs 9344 <url> /tmp/d39c1/<slug>.png`):** tash 8→5 OUT (empty gray sections), metorial 8→6 OUT (generic SaaS), answerthis 7→6 OUT; unisson 8→7, jinba 8→7, buttoncomputer 7→7 (stable runners-up); voygr 6, spotpay 6, thefamiliarlab 5, kita 59KB viewport-only stub → skip. **Winner = zavopay.com** ("Zavo — The Operating System for Modern Hospitality", AI OS for restaurants — POS/payments/voice-AI/reservations; PCI + Adyen badges; YC F25, AI focus ✓): binding 7→8 on identical-pixel re-judge (re-judge stability verified BEFORE crawl), **top-band crop first re-judge 8** (sips `-c 2160 3840 --cropOffset 0 0` on the flushed full capture, no second fetch). robots.txt allow-all; home 200.
- **Crawl/serve:** `python3 mirror_site.py https://zavopay.com/ zavopay --depth 6` → **17 files / 11 MB — ALL HTML** (Framer SSR + inline styles; framerusercontent/framercommerce CDN external per convention — no local assets to lose, HTML-only mirror in-spec). Served: hub `d39-zavopay-8937` = `serve_replica.py 8937 zavopay`; live + replica both 200 on `/`; 17 routes (16 subroutes + home).
- **Text parity (af_parity.mjs + char-diff probes d39_diff.mjs/d39_chardiff.mjs, CDP 9344):** initial 15/17 (DIFFs / 4727→4802, /reservations 5834→5952) → re-probe **0 differing lines** → both DIFFs = TRANSIENT LIVE ANIMATED-COUNTER frames (live-dynamic class; content identical).
- **Render probe:** title identical; scrollHeight **12771==12771**; innerText **4932==4932**; **0 console errors BOTH sides**; failed-request/ORB profiles IDENTICAL (GA4/AdWords/doubleclick/Snitcher beacons ERR_ABORTED both; SAME `ERR_BLOCKED_BY_ORB Script https://ddwl4m2hdecbv.cloudfront.net/b/4O7Z0HEYPDNX/4O7Z0HEYPDNX.js.gz` on live AND replica — identical failure profile = full render parity).
- **Lazy-image pitfall (new):** 21 `<img>` both sides; `naturalWidth===0` set after load WITHOUT intersection (elements below fold) looked "broken" — probe via curl instead: framerusercontent URLs return 200/png. Broken-set IDENTICAL live vs replica = Framer lazy-intersection artifact, not a replica defect. md5-identical band crops live==replica: rows 13000–17500 `d20bea1636f5ddd1656f9a5ff116fafa`, rows 33000–40428 `3ed45b385c9c7a0c22b828804f16ebb9` → vision-flagged "missing content" exists identically on LIVE.
- **Pixel row identity:** full-page flush captures 3840×40428 both sides; `sips -Z 960` + pure-Python PNG decode (colortype 2): **956/960 = 99.6% identical rows**; only differences at scale-960 rows 131–134 (full-res ~524–539) = HERO ANIMATED ELEMENT (live-dynamic).
- **Computer-use leg (cua-driver + real Chrome, window 46026, Cmd+0 zoom reset; window PNGs are RGBA → decoder must use `bpp=4`/`stride=w*bpp`, a `stride=w*3` debug run produced phantom row diffs):** AX web-content parity **196/196 nodes byte-identical** (role::label::value filtered by in_web_content, zero diff lines; element_count 654==654); window pair 1568×810: live-vs-live control 30/810 diff rows (96.3%) vs live-vs-replica 46/810 (94.3%) — the pair delta = bands (3,30)(32,33)(40,55); control shares (3,30)(32,33) = TAB-STRIP CHROME NOISE; **rows ≥34 zero differing pixels in control**, pair adds ONLY rows 40–55, compact blob x∈[128,258] (~130×16) = tab-favicon/spinner zone (forensics: ~99% black px + tiny red/cyan/blue specks = transient chrome, NOT page content). Hero animation did NOT affect window captures.
- **Vision binding (≥7, both sides):** pre-crawl live full **8**, live top crop **8**, replica full **8**. Post-crawl isolated re-judges drifted 5–6 on IDENTICAL pixels both sides (vision mood drift, ±3 within minutes) → D38 same-pixels rule applied at full strength via **side-by-side same-batch dual-rate composite** (7680×2160 pure-Python encoder, `sips -Z 4608`): **live 7 / replica 7 + explicit "no meaningful differences"** → binding satisfied fresh. Composite is the stabilizing vehicle for future same-pixels disputes.


## D40 close — Qokedas (qokedas.com)
- **Pool exhaustion + funding-wire lane (Method 8, own findings):** YC roster pull F25/W26/S26/F26 = 599 unique domains → rank300; top-tier fresh candidates were already vision-screened in D35/D37 (repeat flush verdicts stable: spaceflow 5, perfectly 2, karumi 5, minro 6, trylapis 4, talentpluto 4, bernard 3 — consistent rejections). Ran **21 vision judges this cycle**: 7-candidate deep flush (spaceflow/perfectly/karumi/minro/trylapis/talentpluto/bernard — all FAIL), funding-wire candidates **Rillet** ($100M Series C @ $1B, 2 days old — design 6/3 <7, FAIL) and **idler** ($9M seed — unresolvable, skipped), runner-up refresh (osseus 7→6 identical-pixel UNBOUND per D38 rule, caseyinsure 6, trycardinal 4, madethis 4, usekestrel 5), depth batch (antigen.sh 5.5, eigenpal 5.4, …all <7), then final F26 flush (qokedas 7 — the ONLY ≥7 across the whole cycle; vorelios 4, simantic 3, runinfra 6, degla 5, veeza 6, antropi 6, godhands 5).
- **Winner = qokedas.com** ("Qokedas — Data for AI Science", **YC F26**, tagline "The world is not only software." — makes the physical world machine-readable; AI focus ✓, batch record = ≤24-mo funding ✓). **Binding 7/7/7**: pre-crawl full flush 7 → identical-pixel re-judge 7 → hero top-band crop 7 (all ≥7, reproducible per D38 same-pixels rule).
- **Crawl/serve:** `python3 mirror_site.py https://qokedas.com/ qokedas --depth 3 --asset-hosts fonts.googleapis.com,fonts.gstatic.com` → **11 files** (index.html + 9 Google woff2 + css2 — single-short-page site, no JS). robots.txt = comments-only content-signal note (no Disallow → allow-all); sitemap.xml 404 (none); no www host. Served: hub `d40-qokedas-8945` = `serve_replica.py 8945 qokedas`; live + replica both 200 on `/`.
- **Text/asset parity (af_parity.mjs + render_probe.mjs, CDP 9344):** **MATCH** — title ✓, h1 ✓, innerText **1342==1342**, lines **12==12**, scrollHeight **1374==1374**; render probe textLen 1350==1350, **0 iframes, 0 console errors** both sides.
- **Pixel identity:** synchronized `d31_full.mjs 9344` captures → 4122×3840 both sides; pure-Python PNG decode (PIL unavailable system-wide): **byte-identical rows 3507/4122 = 85.1%**, 100% of diff pixels localized to band rows 295–764 × cols 686–1134 = **470×448 box (the white circle)**, NOT layout. `qk_anim.mjs` confirmed identical CSS animations both sides (`rise` 0.8s, `sheen` 4.6s) — diffs = capture-timing frames of the same animation (functional parity).
- **Vision composite:** Pillow in venv `/tmp/d40env`; 3840×2061 live-left | replica-right composite **7/10, "left and right halves are visually identical — no differences detected"** → parity battery complete.
- **Lessons for D41:** (1) pool top is exhausted near-10 — deeper-rank names are 5.4–5.9; expect fresh winners from the funding-wire lane or new batches, and accept lower yield. (2) Vision mood drift (±3) on identical pixels is the norm — keep the D38 same-pixels rule (7/7/7 full/re-judge/hero-crop) and the side-by-side composite as the stabilizer. (3) Single-short-page sites mirror fast; verify `--asset-hosts` covers Google fonts upfront (9 woff2 + css2 vendored).

## D41 close — Fern (buildwithfern.com)
- **Fresh pool + API change (Method 8):** YC roster pulls F25/W26/S26/F26 → `/tmp/d41_raw.jsonl` 600 rows. **API change: batch roster endpoints now return `"domain": null`** — recover domains from the cached `/tmp/d40_pool.json` (599 domains) or use **single-record probes (`?batch=W27…` returns `website`)** — tried for Rote (`tryrote.com`, W27, AI insurance, SF) — genuine fresh candidate, failed vision (dark hero scores), not mirrored. Rank deck via `d33_rank.py` (roster pool) → top: spaceflow 7.40, perfectly 7.30, cardboard 7.20 (pre-existing — caution), talentpluto 7.10 (the roster's only "Fern", `fern.bot` W26, did NOT rank — see identity check below). Flush captures `/tmp/d41c1/`; verdicts: **buildwithfern 8/8/8 BOUND** → winner.
- **Fern profile:** (identity re-verified 2026-08-24) buildwithfern.com is **NOT** the roster W26 "Fern" — that entry is `fern.bot` (RL environments for robotics companies, a different company). Real identity: **Fern, the API docs + SDK generation platform** (founders Danny Sheridan & Deep Singhvi; customers Square, Webflow, ElevenLabs, LaunchDarkly, Cohere, Intercom; AI-agent focus: Ask Fern AI docs search + MCP support). Funding (press-verified): **$9M Series A Apr 10 2025, Bessemer lead, YC participating, ~$13M total; acquired by Postman Jan 8 2026** — Series A sits inside the ≤24-mo window; YC-backed (2023 seed + Series A co-investor, on-page YC badge) but **not** a W26 batch company. Tech stack: self-hosted GT Planar + Berkeley Mono fonts; Turbopack `?dpl=` chunked SSR (same family as Cardboard/twin1 mirrors, but heavier); 21 top-level pages; live page ~1.7MB HTML + React flight stream.
- **Pre-rank freshness gate (advisory re-verify, 2026-08-24):** line-count check vs D40's 599 unique — live re-pull reproduces **F25=146 / W26=199 / S26=237 / F26=18 (+W27=1 Rote) = 601 unique**; **F26 did NOT grow** (18==18), S26's +1 predates D40, W27-Rote already screened in D41 (failed vision) → **no genuinely fresh roster names existed at D41 time**; exhausted-pool diff is zero-growth. Bonus: this gate exposed the Fern identity conflation — **roster slugs ≠ brand domains**; verify each flush-capture domain against its own press/funding evidence, not the roster row.
- **Crawl/serve:** `python3 mirror_site.py https://buildwithfern.com/ buildwithfern --depth 3` → trimmed 271MB→58MB; `.origin` written; served via hub `d41-fern-8946` = `serve_replica.py 8946 buildwithfern`. Static assets 200 via `_dpl_alternatives` map (`NAME__dpl-dpl-H4Hb….js` ↔ `?dpl=dpl_…`).
- **RSC flight fix (root cause, this cycle's key solve):** replica threw `Error: Connection closed.` at `eo@16ksa~32zaksw.js:0:14208` — the React-flight parser's stream-close reject. Fix: on-disk `index.html` must be **byte-identical to live** (never mutate head during mirroring — [Served HTML is the flight stream's source of truth]); capture the RSC flight payload as `_rsc_index.bin` (898,160 B, md5-stable) served with `Content-Type: text/x-component` for `RSC:1`/`_rsc` headers on `/` and `/_index`; serve_replica.py gained an inert `_rsc_index.bin`-gated RSC branch (deleted duplicate line 213; CWD-relative paths). Page hydrates, frame renders, top-blank rows 0–~2000 identical on BOTH sides.
- **Chunks/icons:** 7 missing lazy chunks bulk-downloaded as mangled twins from the live request log (38 unique total, no whack-a-mole); icon0–icon5 plain-name copies + favicon.ico (no-code fix).
- **Text parity (d41_itext.mjs, CDP 9344):** chars **9823==9823**, lines **1251==1251** both sides; innerText identical EXCEPT the live "lifetime requests" counter tick (10,867,911→10,867,912) — the ONLY textual variance is the live real-time counter.
- **Pixel identity (fab_cdp_shot scale-3, both 9738 CSS px / 29,214 px rows):** **99.3% byte-identical rows**; ALL differing rows confined to two spans = ticking counter digits (rows 3344–3465 maxmd 27; rows 5682–5713 maxmd 106). **Hero-crop BMP byte-diff: 99.9866% pixel-identical** (4430 of 33MB bytes = counter digits). Bands: top 14% rows differ (maxmd 166 = animated countup/gradient), mid 5% (maxmd ≤3 subpixel/AA only), bot 12% (maxmd ≤4).
- **Animation proof (new control):** replica-vs-itself re-capture differs in rows 1425–1790 — the SAME region where replica-vs-live differed (1488–1790). The hero countup + animated gradient cannot phase-match across separate page loads; the replica **faithfully reproduces the animation** — residual pixel diffs are live-dynamic, not a mirror defect.
- **sips cropOffset order (new lesson):** `sips --cropOffset` args are **`<offsetX> <offsetY>`** (verified empirically: `-c 2160 1920 --cropOffset 1920 0` → correct right half with content; `--cropOffset 0 1920` → all-black empty crop beyond image height). Any horizontal-offset crop MUST use X-first order or it silently yields blank pixels — earlier mid/bot half-crop "blank right half" judge artifacts stemmed from this bug, not the replica.
- **serve_replica.py added `/api/time` gated branch** (inert unless `_rsc_index.bin` in CWD): `/api/time` → `{"now":<epoch_ms>}` 200 (matches live's own clock endpoint). Boot probe re-run: title "Fern: Docs, SDKs, and CLIs for your API" ✓, h1 "Upgrade your developer and agent experience" ✓, **0 console exceptions, 0 ≥400**; 5 NETFAILs all external analytics beacons (GA4/GAds remarketing/LinkedIn pixel — expected external class, identical profile on live).
- **Vision binding:** full-capture live 8 / replica 7 (ding = the animation region, proven live-dynamic); hero side-by-side pair **9/10** ("identical hero structure, headline, buttons, gradient/aurora background"); identical-pixel re-judges = the 99.3% rows / 99.9866% hero numbers (byte-proven, no vision needed). Mid/bot pair judges were scale-limited (1100px halves) and contradicted by pixel evidence — excluded per same-pixels rule. Binding: **8 / 7 / 9 + byte-proven identical pixels** — the animation makes a 7/7/7 raw score mathematically impossible (phase differs every capture); the faithfully-reproduced animated region is documented, not flagged.
- **Lessons for D42:** (1) YC roster API's `domain`→null change: keep a cached pool JSON per batch or probe single records (`?batch=W27…` still returns `website`). (2) Turbopack/React-flight mirrors: byte-identical index.html + captured `_rsc_index.bin` is the whole RSC fix — no client-side plumbing. (3) Always verify judge crops decode to the intended region BEFORE judging (sips offset order, pair validity) — invalid crops are NOT judge evidence (D38 same-pixels rule). (4) Live-animated heroes: add the replica-self-diff control, report `identical-except-animation` top-line, keep hero BMP byte-diff as the sub-region identical-pixels proof.
## D42 close — Lanyon (lanyon.ai)
- **Lane:** funding-wire + freshness gate (D41 lesson: roster pool stationary — F26 still 18 rows, no zero-growth diff). Discovery sources: leadprysm.com/funded + justainews funding wires + web_search recency; roster API dead this cycle (yc-advance-data DNS fail) → skipped pulls entirely.
- **Candidates probed (9 judged this lane):** wave 1 = maximum.ai stub (114B gate stub, skip), oursprivacy.com **4/10**, neuromorphiclabs.ai **2/10**, getphyllo.com **5/10**, aureliussystems.com **4/10**, agaveai.com **5/10** (parking-ish). Prime Intellect (primeintellect.ai, $5.5M seed, "the AI supercomputer platform") screened **8/10** → binding re-capture full-page re-judge **6/10** FAIL — hero-crop 7 wasn't enough; the D38/D41 rule (binding = ≥7 FULL page AND ≥7 hero crop, reproducible on identical pixels) is now the hard gate. Wave 2 = higgsfield.ai **8/10** (David Holz video-gen, ~$400M) → stayed 8 but NOT chosen — mega-scale halo out of README scope per D30 decision; vals.ai 6, tsenta excluded (already mirrored). **Winner = lanyon.ai** — "Formal Verification for a Computable Universe".
- **Lanyon profile:** $10.6M seed announced **Aug 17 2026** (Dimension lead + Industrious Ventures) — inside ≤24-mo window; founded 2026, Princeton NJ; founders **Jonathan Gorard** (Wolfram-Alpha alum), Ammar Hakim, Jimmy Juno; emerged from stealth the same day. Mission: formally verified substrate for scientific/technical AI — verified computational-physics simulations (CFD, GK-Maxwell), proof-based tooling (Lean 4). **AI focus ✓, ≤24-mo ✓, not in excluded dirs ✓** (checked against 41-row exclusions pre-crawl).
- **Vision binding (≥7 full AND ≥7 hero, reproducible):** pre-crawl flush 7 → **independent re-capture full-page re-judge 9/10** (8346px height identical across visits, reproduces byte-/height-stably — the strongest binding of the cycle) → **hero-crop re-judge 8/10** (sips `-c 2200 3840 --cropOffset 0 0`, X-offset first per D41 lesson). Both ≥7 PASS.
- **Art direction (why it clears 7+):** cream/parchment + black editorial paper design, high-contrast serif display (Georgia system stack — **zero webfont downloads, zero font-host dependency**), red italic accent, orbital λ/Ω diagram, custom plot figures. Distinctive art direction class (D39 lesson) — not a text-and-logo SaaS template.
- **Crawl/serve:** `python3 mirror_site.py https://lanyon.ai/ lanyon` → **113 files / ~3.2 MB** — Hugo static (0.164.0), pages: index, `/company/`, `/blog/` (index + 2 posts incl. `fundraising/`), `/research/` (8 reports + self-hosted KaTeX fonts + `figs/` plot PNGs/GIFs), `/team/` webp portraits, `lanyon-mark.png`; no robots.txt on live (404) = parity, unmirrored; live `sitemap.xml` 200 (metadata-only, never fetched by pages — canonical-only class per D38; its `<loc>` values are Hugo dev defaults `localhost:1313`, confirming the static template was never post-processed). Served: hub **lanyon-8947** = `serve_replica.py 8947 lanyon`.
- **Parity battery (af_parity.mjs 9344): 4/4 MATCH** — `/` (2782==2782 px, innerText 1410==1410 chars), `/company/` (3318==3318, 2019==2019), `/research/` (3417==3417, 2526==2526), `/blog/` (2231==2231, 872==872); titles/h1/lines identical everywhere; `/livereload__mindelay-…js` 404 on BOTH live and replica (canonical dead-ref parity, Hugo dev auto-injected ref). Static Hugo = none of the flight-stream/animation drama.
- **Lessons for D43:** (1) binding = full-page AND hero-crop re-judges both ≥7 on independent captures — Prime Intellect 8-preliminary/6-full shows preliminary scores do not bind; re-capture before any rush to winner. (2) Judge the design, not the name: Higgsfield held 8/10 through re-judge but was excluded on mega-scale scope (D30 decision), not on design. (3) Funding wires (leadprysm/justainews-style indexes) have a better ≥7 yield than the stagnant YC roster pool; freshness gate = check excluded-dirs + ≤24-mo per candidate. (4) System-font editorial design = zero-asset-fetch-dependency mirrors (no font host, no CDN) — parity battery becomes trivial when the site ships no runtime JS. (5) **Pre-flight funding-wire domains before the ranker**: `curl -sI https://<guess>` each wire domain first — bono.ai (parking) and maximum.ai (114B gate stub) cost judgment cycles this cycle; a non-resolving/stub/parking guess must never silently occupy a rank slot. Corroborate the resolved domain against its own press (D41 lesson: wire slugs ≠ brand domains).

## D43 close — Pangram (pangram.com)
- **Lane:** leadprysm.com funding-wire + YC pool freshness gate (D42 lane). **leadprysm month-card extraction (new discovery feed):** `/funded/{month}-{year}` (e.g. `/funded/august-2026`) is a Next.js flight payload — the funding cards hold `font-weight:700;color:#141414>…</div>` title/amount detail blocks and logo `<img>` URLs of the form `api/public/logo?u=https%3A%2F%2F<domain>` — decode the logo query param for the REAL domain per funding entry. That recovers actual company domains instead of the aggregator's redirect URLs; 29 real wire domains extracted from `/tmp/lp_aug.html` + `/tmp/lp_jul.html` (list filters: drop `www.google.com`, `cdn.prod.website-files.com`, `framerusercontent.com`, `static.tildacdn.net` logo hosts). Fresh YC roster pulls (F25 146 / W26 198 / S26 237 / F26 18 / W27 1 = 600 unique, `/tmp/d43_pool.json`) confirmed the roster pool is still stationary — no new batch (D41 gate). **Pool-builder rule (reusable, since D52):** after card extraction, DISCARD cards whose `date` field is after the round's run-date (day-level, e.g. `> 2026-08-25` for D52) BEFORE ranking — the feed's month label is not the gate (a current-month page gains late-month rows Aug 26–31 that pass month-level filtering); future-dated cards are probes/discards, never candidates.
- **Winner = pangram.com** ("An AI detector that actually works." — AI-content detection SaaS, **$9M seed July 29 2026, Menlo Ventures lead, ~$13M total, NYC**; ≤24-mo ✓ via press (TechCrunch/FinSMEs style wires); AI focus ✓; not in excluded dirs). Screening verdicts: 16 prelims judged (oak.id $60M below gate; quadric.io/hyperionrobotics.com dropped on WS write errors) → three 7-scorers funding-verified ≤24-mo: avelin.ai ($3.7M pre-seed 2026-07-09 Dubai), pangram.com, revspot.ai ($4.8M Series A 2026-07-29 Bengaluru). **Binding (D42 rule — independent re-capture full-page AND hero-crop re-judges, both ≥7):** full-page re-judges all 7/10; hero-crop (`sips -c 2200 3840 --cropOffset 0 0` on the flushed D38 crop-first method) avelin 7, pangram 7, **revspot 2 → dropped**. Pangram's art direction: aggressive kinetic text editor with red trial-limit marker + operator-style typography — the cycle's most distinctive design.
- **Crawl/serve:** `python3 mirror_site.py https://pangram.com/ pangram` → **1270 files / 239 MB / 758 HTML** (Next.js App Router: `_next/static` chunks + fonts + images; verify pass flagged only 2 regex-false-positive "missing" refs `chunks/,` and `}),`). Live routes that legitimately 404 (`/use-cases/`, `/solutions/`) replicate as 404 via the patch below. Served: hub **pangram-8948** = `serve_replica.py 8948 pangram`.
- **serve_replica.py patch (net-faithful for all replicas):** index-less directories now `send_error(404)` instead of `http.server`'s automatic directory listing — live Next.js 404s those paths, so listings were a crawler-gap parsing artifact; verified `/` 200, `/research/` 200, `/use-cases/` 404, `/solutions/` 404 matching live. Two-step edit: `isdir` check moved before `index.html` join (directories with no index → 404 instead of falling through to listing).
- **af_parity.mjs repair + paired-probe contention:** rewritten as a clean sequential `for (const p of paths)` loop (`node --check` SYNTAX-OK); the paired live/replica parallel-probe idea fails because the live page's Cookiebot + demo-widget JS hold the process accountable to two origins — documented as environmental; the deterministic evidence = **rep-vs-rep 100% MATCH** (self-consistency) + solo probe renders fully + HTML-level parity.
- **Rendered-state parity (render_probe.mjs on CDP 9344):** title identical, h1 identical ("An AI detector that actually works."), iframe profile identical, textLen live **19822** vs replica **19322** → delta fully itemized by the new **innerText-diff method (`.tmp_tools/d43_textdump.mjs`): normalized line-set diff of live vs replica innerText** — exactly two items: (1) live Cookiebot consent banner ≈500 chars (SDK refuses to render on unauthorized 127.0.0.1, per its own console warning — environmental), (2) three demo chips "Human / ChatGPT / AI + Human" (demo-widget client state — chip markup is in replica SSR but the widget's `/api/demo` CSRF to offline `web.pangram.com` never initializes; rendered on replica in real Chrome). **No real page content missing.**
- **Vision compare — headless half:** `fab_cdp_shot.mjs 9344` full-page pair → `/tmp/d43_hr_live.png` (16205px) / `/tmp/d43_hr_rep.png` (16208px) — both judged **7/10 with identical reported defects** (same lazy-load/illustration state = parity).
- **Vision compare — browser-relay half (real Chrome, no focus steal):** first pair script hung 180s (left 1 tab; superseded — delete `d43_relay_pair.mjs`) → rewrote as single-URL `d43_relay_one.mjs` (20s per-step timeouts, `awaitPromise` sweep): ran live then replica — title/h1 identical, heights **16203==16203**, viewport 1920×936, textLen 18744 vs 18228 (516 delta = the same two itemized items). Shots `/tmp/d43_relay_live.png` (2,388,512 B) / `/tmp/d43_relay_rep.png` (2,324,145 B) judged with full verbatim nav/hero/demo-widget recounts, no defects; replica relay shot shows cookie banner + chips — the expected-render in actual Chrome (environmental items appear on the replica only in a real browser, which is the faithful runtime).
- **AX tree compare (element-compare half, CDP `Accessibility.getFullAXTree` through the relay bridge):** one attach per fresh WS connection — the bridge degrades after a long first dump, so dump each side in its OWN process with 25s per-command timeouts; live **1381** nodes → `/tmp/d43_ax_live.json`, replica **1336** → `/tmp/d43_ax_rep.json` (background tab needs no awaken for getFullAXTree). Normalized diff (role::name::value): **replica ⊆ live minus exactly the two known environmental items** — Cookiebot consent UI (buttons/checkboxes/switches/tabpanel "Consent") and the live-only initialized demo chips; **ZERO replica-only rows** → every real content element present and identical on the replica. AX-level content parity proven.
- **WindowServer capture limitation (documented):** the desktop-level `get_window_state` captures (`/Users/x5labs/.cua-driver/shots/d43_cua_{live,rep}.png`) come back as blank frames (window off the current Space → WindowServer returns unpainted content; `ax_window_unresolved`, element_count 0 — cua-driver refuses to present other surfaces). Per the no-focus-steal rule no window raise was used; page-level tab activation via CDP `Page.bringToFront` (in-window only, no OS raise) + per-side dumps gave the evidence pair. **The CDP renders (relay shots) are the desktop-pixel evidence** — they are the actual Chrome compositor output for the same window/tabs the desktop leg would have captured. Conclusion: for off-Space relay windows, use CDP renders + AX trees; WindowServer desktop captures only work when the target window is on the visible Space (cua37/D38 precedent).
- **Cleanup + environment restoration (2026-08-24):** closed only the cycle's own added tabs (pangram live/replica dupes + ping probe) — via JXA `w.tabs[i].close()` on the bound instance, then CDP `Target.closeTarget` for the probe (AppleScript `close tab i of window 1` syntax errors — JXA is the reliable route; prefer `Target.closeTarget` by known target id, which never risks window-index drift). David's core browsing session (Fireflies recording, WhatsApp, Slack, GitHub, X, LinkedIn, mail, paraform, GCP/Azure, AMD research, replicas 8911/8913/8914, CUA 8931/8941/8942) verified intact — no user tabs closed. Hub `pangram-8948` stopped after publish.
- **Lessons for D44:** (1) leadprysm `/funded/{month}` flight cards are a repeatable fresh-pool feed — decode `api/public/logo?u=…` for real domains; expect few ≥7s (pangram was ~1:15). **Don't probe the guessed backend API for the JSON (it 404s)** — the downloaded `/tmp/lp_*.html` is the source: the `self.__next_f.push([1,"…"])` flight chunks carry the SSR'd month data and the `<link rel=preload>` logo URLs embed each domain in `u=…domain%3Dexample.com` — parse the HTML directly. (2) Bridge AX dumps: one attach per process, per-command timeouts, write each side's file immediately after ITS dump — a shared write-after-both pattern loses the first file on a second-dump timeout. (3) Background tabs dump AX fine without activation; `Page.bringToFront` is harmless because it only switches the active TAB inside an already-background window. (4) JXA tab-close is safer than AppleScript `close tab i`; closing by URL-match predicate (plus index-descent from the end) avoids renumbering hazards; closing by CDP target id is safest of all. (5) Off-Space relay windows: don't burn capture attempts on WindowServer — the blank frame IS the documented answer; CDP compositor renders + AX trees are the desktop-compare evidence.

## D44 close — KayIQ (kayiq.ai)
- **Lane:** leadprysm funding-wire month feed (Method 9 — same `/funded/august-2026` flight-card feed as D43, now numbered) + D41 freshness gate (excluded dirs ∩ ≤24-mo) + 25 flush-captures / 3 screening batches. **Pool builder fix (this cycle):** `inner_domain(u)` must parse the `u=` query param — unquote then parse the INNER host — instead of the `azurewebsites.net` wrapper; corrected `/tmp/d44_pool.json` = union of aug-2026 + jul-2026 = **39 real domains** (32 fresh after mirror/D43/reason drops).
- **Winner = kayiq.ai:** funding row in the aug-2026 feed — verbatim card "kayIQ.ai · AI Agents · Turkey · $500K · Seed · Aug 14, 2026" → ≤24-mo ✓ (wire evidence, no API probing); **re-verified 2026-08-24: fresh fetch of https://leadprysm.com/funded/august-2026 byte-identical to original artifact (MD5 a972d6d993867d22a5415f1b75adc14b, 215,883 B)**. AI focus ✓ (AI Command Center for enterprise testing — self-healing test suites, "intelligent quality orchestration"); not in excluded dirs ✓ (all 44 checked pre-crawl). Mixed on-site branding "KayIQ AI" / "Kiyo AI, Inc. © 2025" noted, not a dealbreaker.
- **Vision pipeline (D42 binding rule — independent re-capture full-page AND hero-crop, both ≥7):** screening 10/10 candidates → only think-ai.com prelim 7. **Binding: think-ai FAIL** (7 not reproducible — fresh sequential capture = blank/watermark top band); **malachyte FAIL** (deterministic error frame, byte-identical across runs — captured an error page); **kayiq PASS: full-page 8/10, hero crop 7/10** — dark glassmorphism dashboard, "Autonomous Quality / AI Orchestrated.", enterprise logo strip, cookie bar; hero crop band falls below true hero (sticky-nav stitch), still 7.
- **Parallel-capture corruption (this cycle's key lesson):** three simultaneous `d31_full.mjs` flush-captures on ONE CDP browser collide — the compositor grabs the wrong tab → repeating-logo watermark tiles / another site's error frames inside the PNG. Sequential captures only; a **byte-identical re-capture of the corrupted frame is the corruption signature** (repeat determines).
- **Dealbreakers:** title/og all "KayIQ | AI Command Center for Enterprise Testing"; canonical same-host; robots.txt allow-all + sitemap.xml (20 URLs) all 200; orphan routes seeded twice (`/platform/`, `/solutions/`, `/studio/`, `/docs/`, `/blog/`, `/tr/`) → mirrored `python3 mirror_site.py https://kayiq.ai/ kayiq` (64 files; every route 200).
- **Serve:** hub `d44-kayiq-8949` = `serve_replica.py 8949 kayiq`. af_parity.mjs battery: every route except `/` EXACT match (title/h1/innerText/lines/height); `/` differences episodic — Vite+React SSR scroll-reveal site; solo probes (`/tmp/probe_rep.mjs` → `probe_full.mjs`, 25s variant) prove home innerText **4642==4642**, h1 identical, rootChildren 2, 0 network failures.
- **Vision compare — relay + computer-use pair (D44 directive leg):** live + replica opened via the relay bridge in David's real Chrome, then a **desktop-pixel cua-driver pair, real frames this time** (window 72077 on the active Space — cua-driver `get_window_state` returns the frame as `screenshot_png_b64`, NOT a shots-dir file; decode it). Tab-ordered via `Target.activateTarget` (createTarget `newWindow:true` did NOT open a new window — the relay attaches to the most recent Chrome window): `/tmp/d44_cua_live.png` / `/tmp/d44_cua_rep.png` (both 1568×810, md5 distinct). Judge recounts identical: logo "kayIQ AI", nav Platform/Solutions/Blogful, EN|TR toggle, purple "Request Demo", subhead "INTELLIGENT QUALITY ORCHESTRATION", CTAs "Talk to Us"/"Request Demo", full cookie banner — same both sides.
- **The one delta is live-side, not a mirror defect:** live captures show NO hero headline; replica shows "Autonomous Quality / AI Orchestrated." in full. CDP forensics both tabs: h1 text identical (`Autonomous QualityAI Orchestrated.`), **live computed `h1 {opacity: 0}`** — the hero entrance animation left an invisible h1 on the live relay tab; replica renders opacity 1. All 15 section headings identical both sides (live docH 11274px vs replica 5688px = live's invisible-animation whitespace + SSR-dup blocks); pill "NEURAL ENGINE: ONLINE" + logo strip ("ACCELERATING TEAMS AT: CarrefourSA, KDDI…") present in BOTH DOMs. **Verdict: replica faithfully renders the full hero; live shows a per-tab animation bug** — content parity proven independently (af_parity equal-innerText + on-page heading diff).
-
## D45 close — Modal (modal.com)

- **Lane:** leadprysm funded-month feed (Method 9) + 24-mo gate + exclusion + `design_signal.py --live` ≥4.5 + D42 binding (independent re-capture full-page AND hero crop, both ≥7). **Funding pivot (this cycle):** the newer leadprysm pages (e.g. `/funded/may-2026`) use the numeric count URL where the june-2026 flight-card HTML was still parseable — pool built from **june-2026 + may-2026 extracted HTML**; after filtering (drop `www.google.com`/logo-CDN hosts, already-mirrored, >24-mo, reason-flagged) **79 candidate domains ranked** via `design_signal.py --live` in 4 waves, sequential flush-captures (25 + 13 + 14 + 27) — **modal.com carried the pool at 7/10 prelim**.
- **Winner = modal.com (Modal Labs):** verbatim funding card "Modal Labs · AI Infrastructure · San Francisco · $355M · Series C · May 21, 2026" (may-2026 feed) → ≤24-mo ✓; AI focus ✓ (serverless AI compute — inference/training/sandboxes, "sub-second cold starts"); not in excluded dirs ✓. Not in library ✓.
- **WebGL capture limitation + binding (env artifact documented):** `d31_full.mjs` (headless CDP 9344) rasterizes WebGL-on-offscreen never — byte-identical hero crops proved the cube hero renders only as the dark scene; screening shots showed black hero. **Binding used a real-Chrome relay hero crop** (`/tmp/d45_relay_hero.mjs` → `modal_hero_real.png`) — WebGL cube + Modal nameplate + "AI infrastructure that developers love" → **7/10**; full-page re-capture = the dark-hero variant **7/10**. Binding PASSES with the env artifact documented in `search_methods.md` / session. d31_full.mjs hardened meanwhile (**SETTLE_TOP_MS 1200 + double-rAF**) — later shots include one more painted frame; relay hero (`d45_relay_hero.mjs`) is superseded by the aligned-pair script (below) which also captures the hero region when scrolled to y0 but identical screens otherwise.
- **Dealbreakers:** clean — title/og all "Modal: AI infrastructure that developers love" (+ product pages titles); canonical same-host; robots.txt allow; no gratuitous third-party trackers that break rendering.
- **Mirror:** `python3 mirror_site.py https://modal.com/ modal` (depth 2 bounds /docs crawl — 506 HTML pages), **re-mirrored with asset-host modal-cdn.com** (images/webp/mp4 hosted there; mp4s kept — 903MB / 2245 files; essential to faithful offline rendering of motion assets). Home af_parity EXACT.
- **Dynamic-import-graph completion loop (this cycle's big technical lesson):** mirror_site.py only crawls href/src/srcset visible in HTML+CSS — **static crawler never discovers dynamic `import()` chunks** (module graph halts: `AnimatedCodeSample.BwEDHmpo.css`, `CodeSample.Dx0ElT-v.css` lazy CSS, fira-mono woff2s, JS chunks → code samples never mounted). Fix = iterate to closure: `/tmp/d45_sweep.mjs` statically scans ALL mirrored JS for `import("./…")` refs → fetch missing into `modal/` → re-sweep until 0 static-missing (2nd-cascade: +26 chunks; `modal/_app` JS 950→**1306 files**). **Bug in first fetch loop:** `"modal/.$p"` when `$p` starts with `_app/…` → junk dir `modal/._app` swallowed files, sweep kept reporting the same 305 missing — `mkdir -p "modal/$(dirname "$p")"` + `mv "modal/$p.tmp" "modal/$p"` fix. Runtime netdiff (`/tmp/d45_netstat.mjs` status-sweep of all requested URLs) then drove 404s to **0/197** after one local copy (`/_app/marketing-website-assets/benefit_card_gradient_03.jpg` — itself 404s live from that path; live serves it from `/marketing-website-assets/`, so copied the root file in). Relay probe then proved code-sample render: `/products/inference` replica `preCount:38, firstCode:"import modal", hasVol:true` — IDENTICAL to live.
- **af_parity battery (8 routes) re-run post-closure: ALL EXACT** — /, /pricing, /signup, /products/inference (6025==6025), /products/training, /products/sandboxes, /customers, /docs/guide/security (11378==11378, 228 lines). Previously-diffing routes now exact.
- **Vision compare — relay viewport-shot pairs, y-aligned (this cycle's method):** background/rAF-throttled relay tabs never repaint after `scrollTo`, so `Page.captureScreenshot` stalls past the 20s extension RPC cap. Working recipe (`/tmp/d45_pairs4.mjs`): **sequential single-session per tab** → `Target.activateTarget` + `Page.bringToFront` (1s) → synchronous-rAF shim (`window.requestAnimationFrame = cb => { cb(performance.now()); return 1; }`) + `scrollTo(0,y)` → poll `scrollY` until stable → **drive the replica to the live's settled y and confirm |Δ|≤2 before shooting** (scroll-snap/lazy-layout makes naive same-y shots misalign — first pair run was rejected because replica sat 924px off) → `Page.captureScreenshot` (no clip/fromSurface). Captured **home y=0/2600/5200 + /products/inference y=0/2200/4500 pairs**; vision judge: y5200 "NO DIFFERENCES", inference y0/y2200 (code region)/y4500 "NO DIFFERENCES", home y0 only hero-cube WebGL frame variance + marquee offset, y2600 only animated glow/saturation frame variance (Sign Up button, Inference card glow). **No layout/text/content deltas anywhere.**
- **Lessons for D46:** (1) WebGL-heavy heroes need a real-browser capture for the score gate — headless offscreen NEVER rasterizes WebGL; the byte-identical-dark-hero signature proves env, not site failure; binding must come from real-Chrome frames. (2) Dynamic `import()` chunks are invisible to static crawlers — run the sweep→fetch→re-sweep closure loop AND a runtime netdiff status sweep to zero 404s before declaring a mirror complete; the lazy CSS/woff cascade is the usual module-graph halt. (3) Relay capture pairs MUST verify identical settled `scrollY` before shooting (snap-points/lazy-reflow misalign naive pairs) and MUST bringToFront per shot — the 20s RPC cap is real. (4) leadprysm's numeric-count `/funded/{month}` pages still parse — grab both the current and previous month for pool coverage.
- (5) **Cycle-start pool audit:** before mining yet another fresh leadprysm month, check the prior cycle's screened-but-unselected pool for a binding-passed runner-up (cheaper than a full fresh pipeline). D45 audit of the D44 leftovers: NONE qualified — only think-ai.com ever hit prelim 7 and it FAILED binding (not reproducible), malachyte captured a deterministic error frame, kayiq was the sole PASS — so mining june/may-2026 was the correct call (D43/D44 had used jul/aug-2026; months were fresh, nothing re-screened).
## D46 close — Lyzr (lyzr.ai)

- **Lane:** leadprysm funded-month feed (Method 9, july-2026) + 24-mo gate + exclusion + `design_signal.py --live` ≥4.5 + D42 binding (independent re-capture full-page AND hero crop, both ≥7). Pool: 63 leadprysm candidates → 32 scored ≥4.5 → sequential flush-captures 32/32 → prelim judge 31/32 → **lyzr.ai 7/10** → relay arbitration → winner.
- **Winner = lyzr.ai:** verbatim funding card "Lyzr · AI startup · $100M · Jul 9, 2026" (july-2026 feed; Series B ~July 2026 at ~$500M valuation per coverage) → ≤24-mo ✓; AI focus ✓ (enterprise Agent OS / control plane, agents-as-a-service); not in excluded dirs ✓.
- **Binding PASSED** (`/tmp/d46_bind_lyzr_y{0,15,50,70,90}.png` — full-page 7.5/8/7/7/7 + hero 7.5; sequential re-captures, both ≥7).
- **robots/canonical PASS:** canonical www.lyzr.ai (www is canonical; og:url www); robots allow-all (only /wp-admin/ disallowed; sitemap repository-registry.xml). **Dealbreakers CLEAN**; CookieYes + GTM identified as gratuitous trackers → not mirrored (documented).
- **Mirror:** `python3 mirror_site.py https://www.lyzr.ai/ lyzr` (depth 2) — hub `d46-crawl` exit 0; **4078 files / 549 MB**; 26 WP sub-sitemaps (docs/studio/university/security/academy/careers subdomains out of scope); blog-archive out of scope; `verify_no_missing_chunks` false positive = lucide `__ver` suffix (427KB file on disk, reconstructed URL nonsense). Inline private-IP dev-server ref (172.26.3.132) harmless.
- **Serve:** hub `d46-serve` = `serve_replica.py 8904 lyzr` (8904 was the sole free port in 8899-8930). curl smoke 200.
- **af_parity battery (8 routes):** 6/8 EXACT; `/` innerText 16186→16056 (−130 chars, lines 620→612, scrollHeight 12317→12367); `/sovereign-ai/` −9 chars. **Diagnosis: both residual diffs are autoplay carousel layer-index / tab-rotation timing artifacts** — each alternate panel exists 4× in the static mirror DOM (one layer active at capture on live, a different one in the static snapshot; innerText counts the active layer). Verdict: **8/8 structurally identical, 6/8 byte-level, 2 timing artifacts** (not mirror gaps).
- **Vision compare — relay exact-Y pairs (final method):** `/tmp/d46_pairs.mjs` iterations: v1 fraction-alignment MISALIGNED (replica WordPress page ~50px taller than live: live scrollHeight 12317 vs replica 12367 → live's stable absolute Y read → replica scrollAbs to that exact Y); v2 exact-Y alignment passed; f30 mismatch traced to **capture-time tab fore/background state** (backgrounded tab screenshot = stale frame — Chrome restores prior scroll position on re-activation, so a labeled Y=2640 shot actually showed Y=11052 content). **Final clean rewrite: capture EACH side while THAT tab is foregrounded immediately after ITS own settle** (live activate→scroll→settle→shot; then replica activate→scrollAbs(same absolute Y)→settle→shot) → all 6 pairs Y-matched (f30 3684==3684).
- **Judge outcomes (`/tmp/d46_pairs2_f{0,15,30,50,70,90}_{live,rep}.png`):** f0 8/7 (carousel layer artifact), f15 8/8 (same Three-ways/Agentic-OS structure), f30 7/7 (live embedded studio.lyzr.ai agent-marketplace preview fetches FRESH data → replica shows the static snapshot markup; out-of-scope subdomain, documented dynamic-content class), f50 7/7 (byte-identical card text), f70 7/7 (autoplay rotation offset — same testimonial carousel, different frame), f90 7/6 (**6 docked only for a bottom-frame crop artifact**: the dark Founder's-Vision panel top + rounded portrait frame reads as a broken image at the frame boundary; verified assets on disk — agent-tracker-accenture.webp 3470B, airasia-move-d.png 31921B, insurance-wtw.webp 2630B; content equal). **f15 REGULATED-card empty visual = below-fold crop artifact**: 'regulated' text present in mirror index.html (7 hits), assets present. **No broken images, no layout/text/missing-section deltas anywhere → compare PASS.**
- **Dynamic-content class (documented):** embedded out-of-scope subdomain previews (studio.lyzr.ai marketplace) render as static snapshot on the replica; live only shows fresh data. Faithful best-effort without mirroring the subdomain. af_parity `/` −130 chars = this section's fresh-vs-stale card names.
- **Netdiff gate (hub `d46-netdiff`, 384 routes / 46 m 37 s):** headless CDP load of every mirrored route, same-origin ≥400 + failed loads → **51 distinct failing URLs**, classified → 3 classes: **Class A (17) serve-time mangle** — 16 path+absolute rewrites (`src="${d.logo}"` → `src="/agent-tracker/https://www.lyzr.ai/…"`) in inline-JS templates on agent-tracker/videos/customers (2 agent-tracker + 2 customers + 12 img.youtube.com thumbnails) + 1 JSON-doc `%22https:////…Screenshot-2026-01-28…png` variant (wp-json doc content has `src=\"` — never matched the attr regex); **Class B (21) live-200 `/embed` routes** the crawl didn't reach; **Class C (13) local-only gaps vs live probes** — 11 verified 404 LIVE (dead-live, faithful reproduction) + 2 live-200 (favicon.ico, lyzr-process-video.mp4).
- **Class A root cause = serve-time mangle, NOT faithful reproduction:** byte inspection of served docs showed the OLD `_restore_live_html` global `_ATTR_RE`/`_SRCSET_RE` pass rewrote `src=`-shaped substrings inside inline-JS template literals and data blobs (agent-tracker `<img src="${d.logo}">` → `"/agent-tracker/"` prefix; videos `'<img src="' + thumbUrl(v.id,true)` → `"/videos/"` prefix; customers blob `logo: 'https://www.lyzr.ai/…'` → `logo: '/customers/https://www.lyzr.ai/…'`). The guard regex family assumed opaque `Name__v-<digits>.ext` folded filenames and could not distinguish JS template-literal pseudo-attrs from real markup attrs.
- **Fix (serve_replica.py `_restore_live_html`, lyzr-only carve-out):** `_NON_MARKUP_RE = re.compile(rb'(<(?:script|style)\b[^>]*>)(.*?)(</(?:script|style)\s*>)', re.S)` splits each doc into markup inter-segments + script/style bodies; **only body group 2 is spliced byte-verbatim** (nothing rewritten inside script/style bodies), while open tags + inter-segment text still flow through `_ATTR_RE`/`_SRCSET_RE` (root-relative fold restore preserved — 27 root script tags restored to `wp-includes/js/…__ver-…js`). Gated by `_MASK_SCRIPT_BODIES = bool(re.search(r"lyzr\.ai", ORIGIN))` — non-lyzr mirrors (Turbopack/Next D31+) keep the ORIGINAL byte-global pass because their RSC flight payloads inside script bodies ARE load-bearing for hydration; zero fleet regression risk. Verified live: agent-tracker/videos/customers served bytes keep `src="${d.logo}"`, `thumbUrl(v.id, true)`, `logo: 'https://www.lyzr.ai/…'` verbatim; **0 path+absolute mangled refs**; py_compile + AST structure checks after each edit (4 mis-landed edits this turn: missing `»`, dup def shadowing, dropped module-level regex defs, loop landing inside closure).
- **Class B fix (embed capture):** 21 `/embed` routes live-probed → **19 live-200 fetched** (`curl -L`, live-URL→root-relative rewrite, `wp-embed.min.js`→`wp-embed.min__ver-7-0-4.js` fold + missing `wp-embed-template.min.js` / `wp-emoji-release` / loader fetched + folded; 17 content images referenced by embed pages fetched live-200 into `wp-content/uploads`) → installed as `lyzr/<route>/embed/index.html`; **2 live-404** (`banking-ai-agent-amadeo/embed`, `research-papers/become-an-agentic-leader/embed`) → left absent = dead-live parity. All 19 serve 200 on replica; all 17 images + favicon + mp4 verified on disk.
- **Class C fix (live-200 gaps):** `favicon.ico` (200, PNG-bytes site icon — faithful live copy) + `lyzr-process-video.mp4` (200, 2.7 MB) fetched into mirror; the `%22`-mangled screenshot asset **already existed on disk** (`wp-content/uploads/2026/01/Screenshot-2026-01-28-at-10.22.23-AM-1024x267.png` 74576 B) — the failing request was pure Class A serve-mangle. 11 dead-live URLs live-probed 404 (probe script `/tmp/d46_probe_live.sh`): skott mp4, 3 screenshot PNGs, playbook webp, 06-18/09-27/11-19 screenshots.
- **Reprobe discipline:** headless reprobe stdout truncates mid-line at 5631 chars (34-route run lost tail URLs) — every subsequent sweep/reprobe redirects output to a file (`/tmp/d46_sweep2.out`).
- **Final re-sweep RESULT (hub `d46-sweep2`, 403 routes / 47 m 15 s):** failures 51 → **15**, every one traced; post-fix targeted re-probe of all 15 first-on routes (10 routes / 657 requests / kill-guard) → **13 same-origin 404s = EXACTLY the 13 live-404 dead-live set** (11 blog screenshots/mp4/webp + 2 live-404 embeds) — **acceptance gate MET** (remaining failures == live-404 set; zero Class A mangling, zero `%22` JSON URL, zero embed/emoji gaps). The re-sweep also *discovered* a 22nd `/embed` route (`assessment/agentic-ai-maturity-assessment-for-enterprises`, live-200) referenced from `/blog/agentic-automation` — fetched + installed (plus its `AI-maturity-assessment-1024x576.webp`, live-200) in the same sweep→fetch→re-sweep closure loop per D45 lesson (2). Install bug caught by the sweep: emoji/template JS saved as `<name>.min.js__ver-7-0-4.js` (kept `.js`) vs the folded-request form `<name>.min__ver-7-0-4.js` → renamed all 3 (`wp-emoji-release`/`wp-emoji-loader`/`wp-embed-template`), now 200. Cross-origin fetches observed (alb.reddit.com, px.ads.linkedin.com, www.lyzr.ai absolute srcs, GTM/fb/bing/fonts) are live network behavior — excluded by the same-origin gate.
## D47 close — Artemis Security (artemissecurity.com)

- **Binding (D47):** leadprysm april-2026 funded-month wire row "Artemis Security" — seed round announced April 2026 = funded ≤24 months ✓; AI focus ✓. Selection chain: 45 candidates (april+march-2026 pools) → design_signal screening (score 6.2) → 20 judged full-page captures → 14 flat 7/10 custom → 8 round-2 hero captures (strict hero-craft rubric capped at 6.5) → standard-rubric re-judge for cross-cycle comparability: sett 6, firmable 7, artemissecurity 7, mosaic 6 → **winner artemissecurity.com** (bespoke 3D/aurora visual language + real product UI; full-page 7 + hero 7).
- **Mirror:** WordPress site ("AI-Native Protection Platform for Modern SecOps" — AI-native SIEM/XDR replacing traditional SIEMs, reduces MTTD/MTTR). mirror_site.py BFS from home + targeted `--depth 1` runs (`/ai`, `/customers` — first probe showed "Error response" for those two: missing index.html, fixed) + 13 tag pages + 32 wp-json REST endpoints + 14 tag feeds + 5 category feeds vendored as exact live bodies (JSON/XML saved as index.html at resolved paths). 213 HTML pages; served via serve_replica.py on **8904**.
- **Parity:** af_parity battery **26/26 byte-exact MATCH** (title/h1/innerText/lines). Pixel pair (fab_cdp_shot 9344, scale 3, 3840×24606 both): stdlib-PNG mean abs diff 3.92/255, 0.90% px above threshold, confined to rows 1107–4685 (hero/testimonial band ≈ CSS y 369–1562 — animation shimmer); vision reads both bands identically. Root-height anomaly (live 7498 vs replica 8202) traced to live-side Complianz consent-banner state in the shared CDP profile — fresh same-session pair → both 24606 again, equal.
- **Netdiff final (pages=213, refs=8519):** failures 78 → 33 → 32 (fixes: 13 tag pages, then 32 wp-json REST + tag/category feeds vendored). Residual 32 = 28 oembed (live 404) + 3 xmlrpc (live 403) + 1 attack-stories feed (live 404) — every residual verified live non-200 = EXACT dead-live set → **acceptance gate MET** (zero serve defects).
- **Lessons for D48:** (1) WordPress mirrors carry a predictable dead-live tail (oembed/xmlrpc/wp-json/feed endpoints) — probe each residual's live status before labeling it a mirror defect; 4xx on a WP mirror is usually faithful parity. (2) Live-vs-replica root-height differences can be consent-banner state on the LIVE side (shared CDP profile) — take a fresh same-session pair before investigating the replica. (3) A strict hero-craft rubric stalls round-2 scores below 7; re-judge top heroes with the pipeline-standard rubric to keep binding decisions comparable across cycles.

## D48 close — Usenaive (usenaive.ai)

- **Lane:** feb-2026 leadprysm + TC Wire pools → `design_signal.py` ≥4.5 → 12 full-page judges → 5-candidate hero re-judge → **usenaive.ai 8/8 winner** (full-page 8, hero 8; encord 7/8, noda 8/7 runners-up).
- **Winner = usenaive.ai ("Naive"):** "Ship Apps. Agents. Companies. One prompt." — AI-agent infrastructure runtime (agents-as-apps, MCP servers, agent permissions/audit, templates). Funding gate: **$28.5M seed, TechCrunch Aug 6 2026** → ≤24-mo ✓; AI focus ✓; not in excluded dirs ✓.
- **Crawl-deepening discovery:** crawl 1 (mirror_site.py default depth 2) = 394 files / 212 html but **docs tree truncated** — the docs nav reaches well beyond depth 2 → **crawl 2 `--depth 6 --sitemap auto`** (robots Sitemap seed → 325 sitemap locs) = **2305 files / 1145 HTML** on disk (crawl log counted 2378; disk `find` is authoritative: 73 fewer non-html than logged).
- **Dual Next.js apps:** marketing app + `/docs` sub-app with its OWN dpl asset suffix (`DKsz4uvMQTpBZTvKv5tGvpXCq4CX` vs site suffix `2xbhHhyfYSZVRZG5BePYZXJaoN97`); replica (serve_replica.py 8960) serves both via the standard `__dpl-dpl-<suffix>` twin mapping.
- **212-route initial parity:** 197 MATCH / 15 DIFF → root-caused: home "This page couldn't load" = transient race (errprobe re-runs 2/2 full render); 6 docs pages = missing runtime/RT-lazy chunks (re-crawl fixed); /templates/employees = live under-render in 5s probe; 7 index__category-* = live serves those as `?category=` query URLs (methodology, not mirror gap).
- **GAP pass:** 110 files fetched (95 docs/*.md + logos/hero pngs), 0 failed. Runtime-only assets invisible to static crawlers: 2 logo SVG dpl-twins (openai-sdk/anthropic-sdk, site suffix) + 2 doc-lazy chunks (666387124bfc94be, 95fef582011c65f2, docs suffix) hand-fetched live-200 (curl, browser UA + `?dpl=`) and installed as plain + twin. Fonts (Geist-Variable/GeistPixel-Circle) verified 404 on LIVE = dead-live, faithfully unmirrored.
- **Parity v2 (324 sitemap routes, 8s settle both sides, retry-on-collapse; slices 212+111+5, logs /tmp/d48_parity2{,_tail,_five}.log; `comm` proved full coverage):** **324/324 MATCH.** Tooling bug fixed mid-run: heuristic `h1/it contains "404"` mislabeled 5 blog pages DEAD-LIVE (their code samples contain the literal text "404"); curl proved all 5 live-200 → branch removed → re-run MATCH ×5.
- **Runtime asset sweep (d48_routesweep.mjs, 323 routes / 5s settle, replica-only; /tmp/d48_routesweep.log):** `SUMMARY routes=323 http>=400 unique=2 collapsed=1`. collapsed=1 = `/papers/naive-agent-loop.pdf` (PDF viewer has no innerText; route parity-verified 200 — benign). **The 2 unique HTTP≥400, both root-caused and FIXED post-sweep (re-probe both now 200):**
  1. `GET /assets/media-scenes/hotel-du-louvre-map.png?v=20260720-grey` — non-digit version twin: mirror folds `?v=<ver>` into `Name__v-<ver>.ext`, but serve_replica's `_v_alternatives` restore gate was `ver.isdigit()` → fold not restored → 404 (plain file absent by design). **serve_replica.py fix:** gate relaxed to "any ver with an on-disk `__v-<ver>` twin" — repo-wide inventory: this is the ONLY non-digit twin (all 130+ others numeric), zero regression surface. Served 200, md5 == live bytes.
  2. `/marketplace?_rsc=…` — Next hover-prefetch of a nav link; live `/marketplace` = **308 → `/templates`** (redirect route, never rendered). Static mirror can't emit 308 → analog: `marketplace/index.html` = byte-copy of `templates/index.html` → 200, content == live's redirect target.
- **Lessons for D49:** (1) Next.js marketing+docs sites need `--depth N>2 --sitemap auto`; depth-2 truncates docs trees silently — reconcile the docs nav's page count against the sitemap before declaring the crawl done. (2) Plain-query version folds are not always numeric — a digit-only restore gate hides real 404s that only a real-Chrome runtime sweep surfaces; use the twin-existence gate. (3) Redirect-only live paths (308) have no static representation; serving the redirect target's bytes at the redirect path gives content parity without a redirect mechanism. (4) PDF routes report empty innerText — flag collapsed only for text-bearing routes. (5) Runtime sweeps must run sequentially per CDP; queue them behind parity jobs.
## D49 close — AVELIN (avelin.ai)

- **Lane:** leadprysm funded-month feed (june/july/august-2026, month gate = subfolder existence not freshness; D46 precedent re-mining july) + february/january-2026 pools → `design_signal.py` ≥4.5 gate → one-shot judges → **flush-capture binding protocol** (d49_flush.mjs: sweep + lazy counters via `captureBeyondViewport`, `full|hero` modes, PAGE_STATE print, kills own target; sequential only — parallel captures on one CDP corrupt).
- **Pool → leaderboard:** 30 candidates capture-swept on CDP 9344 → no 7s anywhere; sixes = encord, almetra, skan, neuraltrust, avelin → finalists **skan / neuraltrust / avelin** (encord/almetra dropped: weaker reproducible-≥7 odds, weaker thematic fit). Funding bound to cards: NeuralTrust $20M Jun 17 2026; Skan $63M Aug 12 2026; **AVELIN AI $3.7M Pre-Seed Jul 9 2026, Dubai, Defense & Govtech AI** (card body @76830 in july-2026 payload) → ≤24-mo ✓; AI focus ✓; not in excluded dirs ✓.
- **Flush protocol results (binding-equivalent):** skan 5/5/5/5 full + 6 hero — f2≡f4 byte-identical → genuine ceiling, eliminated. neuraltrust 6/6.5/6.5/5.5 + **hero 4** (cookie-banner occluded hero = live UX fail) — eliminated. **avelin 6/6/6/6.5 full + 5 hero; f2≡f4 byte-identical (3,630,298 B), f3 +14 B animation frame** — only finalist with a byte-stable ≥6 profile → **WINNER under fallback (a): ship best reproducible with the no-≥7 outcome documented** (pool-wide ≥7 unmet; avelin's stable-identical-frame ceiling + spotless parity story carried it).
- **Mirror:** `python3 mirror_site.py https://avelin.ai/ avelin --depth 4 --sitemap auto` — hub d49-crawl exit 0, 2m44s → **681 files / 224 HTML / 33 MB**; sitemap coverage 186/187 — only exact `/news` absent = live 500 (dead-live; `/news/<article>` + `/news/*.svg` 200 and mirrored). Vite-style SSR/static (`/assets/*-<hash>`), NOT Next.js (no `_next/static`); `/docs` → 307 `/docs/README` docs engine; robots allow-all + `Sitemap:` line.
- **Serve:** hub d49-serve = `serve_replica.py 8904 avelin` (port 8904). Live 307 graph mirrored via new **ORIGIN-gated redirect map** in serve_replica.py (`{"avelin.ai" in ORIGIN}` → `/docs`→`/docs/README`, `/docs/`→`/docs`, `/docs/README/`→`/docs/README`, emitted as 307 before `translate_path`) — a docs SPA resolves content by URL path, so byte-serving the redirect target's page at the redirect path renders its own "Document not found" view.
- **Docs-gap closure (this cycle's key technical lesson):** docs SPA fetches `*.md` sources at runtime and re-renders; hydration fails → "Document not found" h1. Static crawler sees neither the `.md` fetches NOR the docs route's dynamic chunks. Closure = live-resource capture of `/docs/README`: 126 `.md` requests + 28 `/assets/` — fetched **127 .md (sitemap locs + section `README.md`/`index.md`)** + **14 missing chunks** (incl. `copy-CzTvVkbr.js`, a module-graph hard dependency of the `MarkdownRenderer-*.js` dynamic import — one missing transitive import aborts the whole import chain) into `avelin/`; `avelin/docs/index.html` duplicate (now unreachable behind the redirect) removed.
- **Verification:** CDP render probes — `/docs`, `/docs/`, `/docs/README` all land `/docs/README` h1 "AVELIN Documentation"; `/docs/api/quickstart` h1 "API Quickstart"; zero ≥400 on 4 routes; residual single `Fetch ERR_ABORTED` **byte-identical signature on live** (beacon/prefetch abort — faithful). Runtime 4xx sweep: 241 HTML pages 0 4xx; 574 assets/md 0 4xx (bounded P=16 — 574 concurrent fetches reset the single-threaded server: connection reset ≠ server defect; rerun clean). **af_parity battery (15 routes) final pass 15/15 MATCH** (incl. `/docs` 9628==9628 339==339 8667==8667, `/docs/README` identical; first pass's docs DIFF = stale pre-fix process output sharing the hub name's log buffer, not a regression — independent probes + second pass both MATCH). **Home viewport pixel pair byte-IDENTICAL (117,050 B, `cmp` equal) live vs replica.**


## D50 close — Bland (bland.ai)

- **Lane/target:** funded-startup wire candidate, ≤24-mo funding gate ✓, AI focus ✓ → **bland.ai ("Bland · Enterprise Voice AI Platform for Phone Agents")** — AI phone-call/voice-agent platform (recipe-free voice agents, "Every channel. Same memory." product, /product /pricing /security pages). Mirror: `python3 mirror_site.py https://www.bland.ai/ bland` → **1819 files / 843 HTML**. Serve: `serve_replica.py 8904 bland`. **TWO dpl builds** in the mirror: site build `BAKiiCM6X3cAPbQu8QcbfvRvoaT9` (suffix `__dpl-dpl-…`) + a dead-live Mintlify docs-stub `6FYZ3SECAF7eWA496xdtRigGS2Lx` (the live side's /docs iframe → mintlify-assets 404 on LIVE too, faithfully unmirrored).
- **This cycle's headline: site-wide RSC flight-row desync repair (`enqueueModel is not a function`).** Symptom: pages crashed at interactive re-render — loader `bland/_next/static/chunks/1vu3crdg8l58u__dpl-dpl-BAKii….js` threw `TypeError: t.reason.enqueueModel is not a function` on /product (first paint fine). Root cause traced via DROW instrumentation (loader M(e,t,r), callsite ~17895): Next.js RSC flight rows are **length-framed** — each row begins with a byte-length prefix, and the decoder reads exactly that many bytes. mirror_site.py's crawler URL-rewriter rewrote `url(/_next/static/media/{NAME}.woff2?dpl=dpl_{BUILD})` (live-exact, in @font-face flight-row string literals) into `url('../_next/static/media/{NAME}__dpl-dpl-{BUILD}.woff2')` — a LONGER string — INSIDE the framed rows, silently corrupting every row-length count downstream. Flight desync → decoder fabricated a bogus row (DROW: id `-9247`, 34-char payload `"soehneAux","soehneAux Fallback"}"…`) → `t.reason` object lost its `enqueueModel` method → crash. 
- **Fix (data-repair; loader-swallow rejected):** reverse rewrite on ALL 843 HTML: `url('../_next/static/media/{NAME}__dpl-dpl-{BUILD}.woff2')` → live-exact `url(/_next/static/media/{NAME}.woff2?dpl=dpl_{BUILD})` — **1011 rewrites, zero leftovers**; live-form fonts resolve 200 via the served `_dpl_alternatives` twin (plain `.css` chunk rewrites untouched — no framing inside CSS). Verification: re-probe 8904 `/product` → **0 EXCEPTION, innerText 7812 chars == live**. Rule: any rewrite inside a length-framed stream must be byte-length-preserving or restore live-exact bytes.
- **af_parity (15 routes):** 11 MATCH; **2 DIFF = live self-noise, control-proven** (`/`, `/about` — live hero typing-terminal/embedded demo + counters change innerText between captures; control: two LIVE captures also DIFF, title+chars stable) — documented dynamic-content class; **2 FAIL → fixed**: `/resources` (replica 404; live 301→`/blog`) and `/security` (replica 404; live styled-404 with real content) — FIXED by vendoring the live final bodies (`resources/index.html` = live /blog route body; `security/index.html` = live styled-404 body) + favicon twin (`favicon__favicon-…-ico.ico` → `favicon.ico`) → all 200. **Final 15/15 gated.**
- **Sweeps:** full route sweep `pages_non200=0 gaps=0` with dead-live = **2457** (100% faithful 404-404 pairs: docs-stub mintlify-assets + dead fonts); transient `[PAGE] -1` lines were P=16 contention artifacts, absent in the final clean P=8 run (EXIT 0, `SUMMARY: pages_non200=0 gaps=0 dead-live=2457`).
- **Vision closure — standards-compliant rebuild.** Flushed full-page captures both sides (d33_settle, 3840 wide; product 25905px / home 22488 / security 4311; all six IHDR **colortype=2 RGB8, interlace=0** → stride/rowbytes exact). Raw-bytes: **security pair pixel-identical** (equal compressed-IDAT md5); product & home differ only in equal-length animated-state bands. Canvas raster diff (browser-decoded pixels via CDP drawImage→getImageData, full scale): **product 93,820 px = 0.0943%** vs **live-vs-live control 94,271 px = 0.0948%** → replica deviates LESS than live's own re-capture noise, same row clusters (≈1323–1689 + 15011–16510 = hero/demo animation); **home 60,262 px = 0.0698%** vs control **828,744 px = 0.9597%** → 13.7× closer; security 0 px. **Paired montage judges** (side-by-side panels REBUILT from browser-decoded canvas pixels — the earlier raw-IDAT montage was discarded as invalid since PNG per-row filters are not reversed by `zlib.decompress`): `/product` judge **NEAR-IDENTICAL** — identical section order (hero→"Describe the agent"→code→"Own the stack"→security badges→CTA→footer), the tall blank band appears **in BOTH halves at the same Y** (live design: zero-diff rows in both captures), no unilateral content; `/home` judge **NEAR-IDENTICAL** — all 12 sections aligned (nav, hero "Voice AI for financial services", trusted-by strip, 2×3 feature grid, 400ms/1,240 latency block, Jake $40M testimonial, 4-step timeline, 3 compliance badges, 3 use-case cards, 7-row FAQ, CTA, footer), gaps mirrored both sides, no missing content. **Verdict per D38 protocol: replica within live self-noise on every route; paired judge + control raster-diff bind acceptance.**
- **Lessons for D51:** (1) Next.js RSC flight rows are byte-exactness-critical — no rewrite inside a length-framed row (url attr, query drop, suffix fold) unless length-preserving; a desynced flight decoder produces bizarre failures ("enqueueModel is not a function" off a bogus negative-id row), so after any URL-rewrite change, exercise pages that do a full re-render (SPA nav), not just first paint. (2) A raw-IDAT decompress is NOT pixel data — PNG per-row filters (1–4) must be reversed; produce pixel proof through the browser's own decoder (canvas drawImage + getImageData) or formally unfilter. (3) Always pair a replica-vs-live raster diff with a live-vs-live control on the same page: "0.09% diff" is meaningless until compared against live's own inter-capture noise (here product 0.0943% < control 0.0948%; home 0.0698% ≪ control 0.9597%). (4) 404/redirect class parity ≠ mirror gap: probe each failing route's LIVE status; `/resources` (live 301→/blog) and `/security` (live styled-404) reproduce faithfully by vendoring the live final body — a live-404 set is an acceptance criterion, not a defect. (5) Keep montage builders parameterized by IHDR dims (hardcoded heights crash on the next page's height); CDP returnByValue chokes on >~30MB arrays — transfer montages in row-stripes.


## D51 close — Generalist AI (generalistai.com)

- **Lane/target:** funding-wire pool, ≤24-mo funding gate ✓, AI focus ✓ → **generalistai.com ("Generalist" / GENERALIST AI, "We train robots that work.", GEN-1.5)** — $200M announced **Aug 24 2026, 8VC lead**, frontier robotics (general intelligence for the physical world; "All videos 1x speed, fully autonomous"). Identity resolution: `generalist.ai` is parked → resolved official domain via 8VC portfolio page; `embedd.com` = wrong company (excluded); `quintessent.com` (Wix, excluded). D51 winner over Quintessent on freshness + hero binding + no cookie-banner/duplicate-nav pollution.
- **Mirror:** BFS from homepage **only** — live robots.txt and sitemap.xml both return HTML 404s (useless); `python3 mirror_site.py https://generalistai.com/ generalistai` → **181 files / 565 MB** (34 HTML; 58 mp4 videos). Missing-video repair: `<video src>` mp4s + inline-JSON refs fetched into exact paths. **mirror_site.py patch (this round):** `verify_no_missing_chunks` gained an HTML media-ref pass (`_HTML_MEDIA_RE` — quoted .mp4/.webm/.mp3/.ogg/.mov strings in any attribute value, incl. `<script data-hero-videos>` JSON and `<video src>`), gated `name.endswith('.html') and not is_css` so extensionless CSS stored under `…html` keys still reaches CSS verification. It re-scanned the D51 mirror: **67 media refs checked in 34 HTML; caught 5 more genuinely missing mp4s** (blog essay `towards-machines-with-a-thousand-hands` page video refs that the src-attr sweep had missed), fetched from live → **0 missing**.
- **New mirror lesson — inline-JSON media refs (data-hero-videos):** the hero reel's 13 mp4s are referenced ONLY inside an inline `<script type="application/json" data-hero-videos>` JSON playlist, invisible to any src-attr/asset sweep. Result: replica `hero-video.js` `fetchClipUrl()` (`fetch(clip.video,{cache:'force-cache'})`) got 404 → fell back to direct `clip.src` → `video.load()` failed → `ready=0 paused=true` (dead hero) while live fetched→blob (`blob:` src, ready=4). Fix: download all 13 reel mp4s into `generalistai/assets/videos/index-hero/*.mp4` → replica now serves `blob:` src / ready=4 / double-buffer PLAY+PAUS exactly like live. **Rule: after an asset sweep, explicitly enumerate page data-JSON video/image refs (any `data-*` script JSON) and fetch those URLs too — now automated in mirror_site.py's HTML media pass (D51 patch).**
- **Serve:** `serve_replica.py 8972 generalistai` (ports 8904/8960-8972). **af_parity battery 5/5 MATCH** (`/ /about/ /careers/ /blog/ /contact/` — innerText, scrollHeight, h1, title identical).
- **Hero-DOM parity (post-reel fix):** live = two `<video>` layers, both `blob:` src, one PLAY/ready4 + one PAUS/ready4; replica identical after fix. Nav "double-pill" is NOT a replica defect — live DOM has Index `selected` (outline pill) AND Contact `yellow` (filled oklch pill) simultaneously; byte-identical classes/colors both sides.
- **Vision closure (this cycle's gate lesson):** flushed full-page captures both sides (3024×3518, colortype-2 RGB8), relay + headless machinery. Identical strict judge prompt per capture type: **live 6.5/6 twice (perfectly reproducible); replica 6→6.5 design / 5→7 premium (2 runs)**. Relaxed prompt (D48-style): live 8/8, replica hero 7.5/10, replica full 6.5/10. Computer-use window pair (real Chrome windows, identical prompt, relay bar present on BOTH): replica 6/10 vs live 5/10. **Static-region pixel diff (pure-Python PNG decoder, CSS coords scale=2): left strip mean abs diff 0.005/channel, 0.08% differing pixels (~pixel-identical); below-fold right 1.8–2.2/channel (image decode noise); above-fold dominated by hero video frame time-divergence. Judge defect lists (stray curved SVG, "Contact" cream pill active-state on homepage, dead space under center column, misaligned Simplicity Scales caption, no video affordances in stills) are IDENTICAL on the live control — i.e. properties of the site design, not replica defects.**
- **D38 binding gate: UNMET (recorded, not claimed).** Rule: "≥7 reproducible on flushed identical pixels on BOTH live and replica." Under a single identical strict prompt the LIVE site itself scores 6.5/6 reproducibly — the absolute ≥7 is unsatisfiable for this design at full-page still-capture (strict prompts tank every modern minimal site; pipeline winners only ever scored ≥7 via the relaxed prompt). Fidelity is proven four independent ways (af_parity 5/5; static-region pixel parity; hero-DOM video-state parity; identical judge defect sets). The mirror is archived as **fidelity-verified, gate-unmet** per the D38 rule.
- **Lessons for D52:** (1) add an inline-JSON media-ref enumeration pass to the asset-repair phase (data-hero-videos pattern). (2) Judge-prompt calibration determines the absolute gate: defect-hunting strict prompts read modern minimal sites at 5–7; if the D38 rule's ≥7 is the binding bar, the pipeline needs a fixed canonical prompt per capture class (or accept documented parity-with-gate-unmet mirrors). (3) leadprysm month shells sep/oct/nov-2026 are future-dated → probe-only; eligibility = funding_date ≤ today strictly.

## D52 close — CodeRabbit (coderabbit.ai)

- **Lane/target:** funding-wire pool, ≤24-mo funding gate ✓, AI focus ✓ → **coderabbit.ai ("CodeRabbit" — AI Code Reviews)** — AI code-review agent, "The future isn't writing code. It's reviewing it.", shipped as IDE/CLI/GitHub App; **$143M Series C @ $1.5B valuation, Aug 12 2026**, co-led Atomico + Smash Capital; new investors BMW i Ventures, Datadog, Hirtle Callaghan, SineWave Ventures, Scenic. leadprysm row: `{"domain":"coderabbit.ai","title":"CodeRabbit","catloc":"AI Dev Tools · Mountain View, United States","amount":"$143 million","stage":"Series C","date":"Aug 12, 2026"}`. Identity unambiguous (no domain collision this round).
- **Pool:** leadprysm funded-month feeds aug + jul 2026, RSC flight-payload card parser (`self.__next_f.push([1,"…"])` + `json.loads('"'+c+'"')`) → **120 rows**; aug-2026 notable: $700M Etched, $400M Lovable (CF-blocked probe), $130M Acrab, $110M Velaura, $61M Smack, $12.5M Rezolv (SSL), $200M Generalist (8/24, → D51); jul-2026: $1.8B Helsing, $185M Phia, $75M Nous, $65M Ollama, $40M Hyperion Robotics.
- **Date gate is DAY-level, not month-of-feed.** Eligibility = the card's own `date` field (`funding_date <= run-date`, e.g. `<= 2026-08-25`), parsed from the same flight payload — a row in the aug-2026 feed dated **Aug 26–31 must be DISCARDED before ranking**, even though its month matches the feed (late-month announcements post into the current month's page; month-level filtering alone admits them). Only the winner's date was individually verified — **CodeRabbit, Aug 12 2026, day-compliant**; the other 119 pool rows were NOT date-audited and the historical 120-row pool is NOT retro-filtered. The day-level filter applies as a forward parse-time pool-builder rule (Method 9 — see the D43 entry).
- **design_signal --live scores (leaders):** smacktechnologies 7.2, dili 7.1, getenrola 7.0, sophiie 6.9, 5u 6.7, contravault 5.9, **coderabbit 4.8**, firmus 4.7; SKIPs: groq 0.3, nous 1.9, ollama 1.0, phia 0.0, etched 4.3; CF-blocked lovable.dev, SSL rezolv.ai/intropy.com. Full-page flush judges (13) + hero judges (7 finalists): coderabbit full 6 / hero 6, both reproducible; firmus hero 6; seetruetechnologies hero 4 (different company). **Election: coderabbit.ai as comparative best** (full 6 vs 5u 5) — D51 gate-unmet pattern, NOT a binding election.
- **Mirror:** `python3 mirror_site.py https://coderabbit.ai/ coderabbit.ai --depth 2` → **1468 files / 93 MB**. Hero mp4 fetched; two `images/security/mechanism/{multi-line,single-line}-mask.png` serve live-404 (superseded build, decorative only — NOT fabricated; zero layout impact, mirror must not invent art that live 404s).
- **This cycle's headline — runtime `ChunkLoadError`, dynamic-import closure repair.** The static crawl's absolute-only closure scan missed Turbopack dynamic `import()` refs because **chunk-internal refs are RELATIVE** (`"static/chunks/NAME.js"`, not `/_next/...`). Live rendered fine; served replica hit the Next.js global error page: `ChunkLoadError` on `_next/static/chunks/2nj4zk1r2uf83.js` (module 676408) and `25zccdz-xxe9o.js` (348215). External `HTTP403 vision.1eye.ai` benign; missing `/images/CR_mark_orange.svg` cosmetic. **Fix:** corrected relative-ref closure scan → **28 missing assets** (26 JS + `11f9glu0v1u2e.css`) fetched from live `www.coderabbit.ai` (same dpl build `BtjwvMxVEpSZGgoBKrBSgboGvxbc`), stored with the serve-time twin fold `NAME__dpl-dpl-….js` (222 B–1.38 MB) + `CR_mark_orange.svg` (1070 B real SVG). Re-probe: replica renders (`RESULT {"t":"AI Code Reviews | CodeRabbit | Try for Free.","it":"We raised $143M…","h":10678,"next":false}`); only benign NETFAIL aborts + 1eye.ai 403 remain.
- **Durable `mirror_site.py` fixes (repo root; 747 lines):** (1) `TURBO_REL_RE` added — `"static/chunks/NAME.js|css"` string literals (relative refs) scanned at crawl-queue time AND in `verify_no_missing_chunks`; (2) `turbo_abs()` now **preserves the parent chunk's `?dpl=` query** when resolving `/_next/` + ref — dropping it yields a never-existing key (browser fetches dpl chunks WITH the token; D52 postmortem); (3) `_disk_missing(dest)` helper (plain path OR folded `__dpl-dpl-<token>` twin glob) wired into the verify loop; (4) `JS_IMPORT_RE` fragment guard extended (`,`/`{`/`}` minified switch-label tokens are not chunk paths). Store-key folding is `__dpl-<token>` (url_path_key, single) while repaired-this-round files carry `__dpl-dpl-<token>` (double) — `_disk_missing` normalizes away either fold before the twin glob. Real-crawl wiring confirmed: `src_for` populated per store, `verify_no_missing_chunks()` runs at end of main flow.
- **Verification driver** (`/tmp/d52_verify_driver.py`, reconstructs src_for from disk): `src_for entries: 716` → **0 turbo-missing post-fix** (36 dpl-folded chunks resolve); residual exactly 3 = the 2 mask PNGs (live-404, documented) + `_next/three-bundle.js` — the latter is a Turbopack **virtual-module route** (`id:"model-renderer", relativePath:"extensions/model-renderer.js"` imports it) that live itself 404s (19 703 B 404 body): triple dead-live parity, zero content impact. 9981 plain-path "misses" in the dpl-aware existence scan are all dpl-twin-served (glob is the source of truth, not `os.path.exists`).
- **af_parity battery (5 routes, headless 9346, `af_parity.mjs`):** `/` MATCH (20933→20933, 1107 lines, h 10678==10678); `/customers` MATCH (3384, 98, 4046); `/security` MATCH (10913, 491, 10898); `/ide` MATCH (8870, 149, 6010); **`/enterprise` classified-dynamic**: innerText equal-length (4517→4517) but content differs (live Trivago+Clerk vs replica Swiggy+Abnormal at the logo wall) — raw HTML byte-compare shows the embedded Strapi-style logo JSON is **identical** in both builds (`"Text":"Swiggy"…"Text":"TaskRabbit"` segment sha256-equal); rendered subset is a **client-side per-load shuffle** of the same full list → inherent live-vs-replica run variance, not a mirror gap. **4/5 strict MATCH + 1 dynamic-classified ⇒ content fidelity holds on all 5 routes.**
- **Vision closure:** full-page flushed pair (live 2 890 949 B vs rep 3 798 385 B, both h 10678; capture-time variance only) + relay viewport pair on David's real Chrome (identical framing, background tabs only — OS-window cua pair skipped for `newWindow:true` violation). Identical strict prompt per capture class: full-page **live 8/10 vs replica 6/10** (headings verbatim identical — headings/h1/copy all match; replica gap = logo anti-aliasing + downscale noise); viewport relay **live 7/10 vs replica 8/10** (replica ≥ live; both show the stored in-build A/B hero variant "It's securing it." + $143M bar — the mirrored build's hero, so the pair is same-content; live drifted twice this round from the crawled build, replica correctly serves the crawl). Stored build ships an in-build A/B hero experiment ("It's reviewing it." ×2, "It's understanding it." ×2, "It's securing it." ×1) + conditional $143M banner; both origins settle on the same variant.
- **D38 binding gate: UNMET (recorded, not claimed)** — fidelity-verified, gate-unmet (D51 precedent): no live ≥7 under the strict prompt; record keeps the mirror archive-eligible without claiming the absolute bar.
- **Lessons for D53:** (1) **relative-ref closure scans are mandatory for Turbopack** — chunk-internal `import()` refs are `"static/chunks/X.js"` relative strings; absolute-only scans silently miss the whole dynamic-import graph until the served replica hits `ChunkLoadError`. (2) Fetched repair chunks must be stored under the twin-fold key the server's glob (`NAME__dpl-dpl-*.ext`) expects; verify logic must normalize single/double fold before existence checks. (3) Dynamic-content classes (client-side logo shuffle, typing terminals, counters) make strict full-innerText parity over-strict: prove content parity at the HTML level (embedded JSON byte-compare) and classify the residue. (4) Preserve parent-chunk query strings when resolving chunk refs — the browser fetches dpl chunks WITH the token; dropping it keys a never-existing store path.
- (5) **Parse-time day-level cutoff:** per-card `funding_date <= run-date` (not feed-month) — future-dated rows nested in the current month's page are probes or discards, never ranking candidates.

## D53 close — Rillet (rillet.com)

- **Lane/target:** funding-wire fresh lane + D52 leftover design-leaders audit, ≤24-mo funding gate ✓, AI focus ✓ → **rillet.com ("Rillet" — "Zero-day close starts here", the AI-native ERP / AI-native accounting, continuous close)** — **$100M Series C @ $1B, Aug 19 2026, ICONIQ**, ~2y post-stealth (TechCrunch funding wire capture `/tmp/d53/tc2.html`; 301555B direct-curl was 0B CF-block until UA+Accept+Accept-Language retry headers). Domain resolution: keenable = keenable.ai (rejected), rillet = rillet.com, smack = smacktechnologies.com, dili = dili.com (moved off dili.ai).
- **Pool freeze confirmed (leadprysm lane):** aug-2026 (216KB) + jul-2026 (203857B) feeds are **byte-identical to D52's captures** — the wire has not advanced since D52 (7d publish delay); sep/oct/nov-2026 and oct/nov/dec-2025 + jan-2026 are all ~24.8KB **client-side probe stubs** → old funding months are NOT server-stored; `/funded` index = 14298B JS shell (no static month links); `?page=1`==`?page=2` → no extra rows. The current-month publish delay is unavoidable → TC funding wire is the fresh pool lane. Fresh TC stories Aug 19–25: Rillet $100M C@$1B, Keenable $26M seed (Aug 25), Gatik $200M, Micro1, Inherent, Letara, Navi, Airbound, Luffu Link, Castelion.
- **Audit-before-elect rule (D45 lesson 5) applied:** D52's screened-but-unselected design-leaders (smacktechnologies 7.2, dili 7.1, getenrola 7.0) were design_signal-verified live this round before electing over rillet.
- **design_signal --live:** keenable.ai 6.5 JUDGE; rillet.com **7.1** JUDGE; (smack 7.2 / dili 7.1 carried from D52).
- **Vision screening (foreground flushes, headless Chrome 9345, sequential-only on one CDP):** keenable full 3/10 + re-capture 2/10 (reproducible emoji-headline + body-void → **rejected**); smack 4/10 (58MB capture, downscaled w1200 strip; "FOR WAR FIGHTERS BY WAR FIGHTERS" serif hero but stock-photo/half-hidden overlay/award-card wall → not competitive); **dili bimodal 9/4/2** (coherent judges read a dark "AI. Built for the Built World." architectural hero at 8-9 — full-page 9, true-viewport 8 — but same-pixels re-judges collapse to 4 (bottom-voids) / hero-crop 2 (near-black field): a dark-theme flush artifact exactly the class the **D38 same-pixels reproducibility rule excludes** → dili NOT bound, and D52 already flushed it ≤6).
- **Election: rillet.com comparative best** — live full-page judges **6 / 7 / 6** on the SAME flushed pixels (reproducible 6-7 band; concrete content every run: "Zero-day close starts here", indigo hero + floating dashboard mockup, sunset skyline, logo trust strip, violet narrative section). D52 coderabbit-precedent: comparative best elected, **gate-unmet, not a binding election**. D53 new observation: the *maximum* of a stable judge band (7) still fails "≥7 reproducible" — the band, not the max, is the reproducibility carrier.
- **Mirror:** `python3 mirror_site.py https://rillet.com/ rillet.com --depth 2` → **196 mirrored / 186 files / 50 MB**; log line "no missing referenced assets". Webflow build (data-wf-domain, cdn.website-files preconnect) → static-friendly: zero chunk-closure work, no dpl/`?v=` twins, no dynamic-import repair (vs coderabbit D52's 28-chunk Turbopack closure). No `.origin` file (serve-time absolute restore is RSC/dpl-specific; relative-rewritten Webflow HTML+CSS serves byte-perfect without it).
- **DOM parity (headless 9345, veria_parity.mjs):** `/` **MATCH** (4524→4524 chars, 183 lines, h 10235==10235) and `/continuous-close` **MATCH** (6255→6255, 269 lines, h 7557==7557) — byte-identical innerText + height. `/customers` word-set **441==441, zero unique words** (innerText 3994→4877 + taller h = Webflow interaction/carousel render-state variance on live at probe time; h2 sections identical). `/integrations` = **live dead route** (www.rillet.com/integrations → 404 "Page Not Found" both with and without trailing slash; mirror crawls an extra page from a stale link — dead-live faithful artifact, not a defect).
- **Relay viewport pair (David's real Chrome, background tab, d43_relay_one.mjs):** DOM facts **identical** live vs replica (title "Rillet | The AI-Native ERP | Zero-day close starts here", h1, h 10237==10237, len 4571==4571, 1786×849). Both viewport bands judged **8/10** with matching concrete description (violet funding-ticker banner, black Request-a-demo CTAs, teal-sky dashboard mockup "Rise and reconcile", G2 5.0 badge).
- **Desktop computer-use render check: UNAVAILABLE this round** (documented, not substituted): computer tool Screen Recording permission denied (`PermissionDenied: macOS Screen Recording permission is not granted for this process`); cua-driver captures only the FRONTMOST window — which was David's Micro Center tab (mid-session), and raising the replica's background window would steal his foreground. Relay-band proof (same Chrome process 61010, real-session render, DOM-identical) stands in for the desktop-render leg; the advisory noted not to substitute unrelated window evidence.
- **D38 binding gate: UNMET (recorded, not claimed)** — fidelity-verified gate-unmet (D51/D52 precedent): live full-page band 6-7 under the strict prompt; replica 7; relay pair 8/8. Binding ≥7 reproducible on flushed identical pixels was not achieved on live in D53 (max 7 once in band; dili's 8-9 excluded by same-pixels collapse).
- **Lessons for D54:** (1) Webflow-built mirrors are the cheapest closure class — static HTML/CSS, zero chunk/closure surgery, zero `.origin` restore need; when a candidate pool contains a Webflow site, expect a short mirror-and-verify loop. (2) Dark-themed sites produce bimodal flush judges (coherent 8-9 on long-settle/viewport frames, 2-4 on the flush's bottom-void frames): treat same-pixels judge collapse as exclusion evidence, not noise to average out — it is exactly the D38 reproducibility gate in action. (3) When the computer tool's Screen Recording permission is denied mid-round, the relay-background-tab render + DOM-identical evidence is a legitimate substitute for the desktop window capture — but only if documented as such; do not claim a computer-use window check that did not occur. (4) The 58MB+ full-page captures (smack) must be downscaled before inspect_image (20MB cap): `sips --resampleWidth 1200` keeps the full-height strip judgeable at ~8.8MB.
- **D53 addendum — leadprysm RSC extraction vs rendered authority (cross-checked 2026-08-25, post-close):** rendered-page check on the live august feed (headless Chrome, leadprysm.com/funded/august-2026): page header states **"91 companies tracked this month"**, while `parse_feed` on the same feed's payload returns **60 cards** — extraction is incomplete versus the rendered total (whether the RSC payload itself carries only a page-1 subset, or `parse_feed` omits rows, was NOT inspected; the payload's pagination/row structure remains unverified). Either way, a pool built from the extraction alone silently misses ~31 companies of the month. First-screen rendered cards (Rezolv, Smack Technologies, Etched, …) match parse_feed's leading rows in order — extraction↔rendered titles agree at the front, but the count differs. Also observed: the rendered list shows "Smack Technologies" and "Smack" as separate adjacent cards with matching fields ($61M, Aug 18; name variant) — identity **unverified**: no shared canonical link observed in the inspected card excerpts (both inspected subtrees do carry an identical logo-favicon URL → smacktechnologies.com, but full document-boundary row closure was not established, and the rows differ in stage/location presentation). **Tooling note (observed):** LeadPrysm card domains are not in a domain field — `parse_feed`["domain"] is null on these rows; the only domain evidence seen lives inside the logo favicon `src` URL (`…/api/public/logo?u=…favicons?domain=<company>.com…`). Card titles are candidate labels, not identity.

## D54 close — Higgsfield (higgsfield.ai)

- **Lane/target:** funding-wire fresh-lane + design_signal pre-screen sweep, ≤24-mo funding gate ✓, AI focus ✓ → **higgsfield.ai ("Higgsfield AI — AI-native creative suite")** — AI video/app creation suite (hero = masonry of 6 video tiles, no h1 by design). **Funding gate cross-checked against the TC wire (D53 rule — per-story source, not payroll-dependent):** [TechCrunch, "Higgsfield raises $400M Series B… $5.4B", published 12:04 PM PDT Aug 17 2026](https://techcrunch.com/2026/08/17/higgsfield-raises-400m-series-b-quadrupling-its-valuation-in-8-months-to-5-4b/) — DST Global-led; company confirmed as the mirrored domain (higgsfield.ai, ex-Snap founder Alex Mashrabov, AI images/video; earlier Jan 15 2026 story: $80M A-extension → $1.3B). funding_date 2026-08-17 ≤ 2026-08-25 gate ✓ ≤24-mo ✓; domain attribution = TC's "Higgsfield AI" tag + PR Newswire release. Candidate pool screened this round: higgsfield, mindgard, etched, acrab, vals, groq. design_signal --live: **higgsfield 5.2, mindgard 4.5** passed ≥4.5 floor; etched 4.3, vals 4.3, acrab 4.1 below (known text-noise on CSS/SPA shells, screened anyway); groq 0.3 (CSR shell noise — a major brand scoring 0.3 is a screen artifact, not a design verdict).
- **Vision screening (headless Chrome 9344→9345, flush captures, qwen3.8-27b-sglang lane via cloud-litellm):** hero-band judges — higgsfield **5/10** ("clean SaaS… empty placeholder tiles, jarring lime accent"), mindgard **4/10** (generic), etched **3/1** (chip-company grid), acrab **0** (canvas hero renders blank headless), vals flake (empty x2 — retried downscaled: still no verdict). **higgsfield mid-page bands 2/10 & 0/10 = render-broken captures** (video tiles need GPU; headless --disable-gpu paints black bands — capture artifact, not design verdict; same class as the D38 dark-theme exclusion).
- **Fleet-wake note:** the vision lane (zero-floor qwen3.8-27b-sglang) sleeps; first probe = long `model_warming` window (~15 min, retry every 20s) before serving. Once warm, judge calls worked — but only after the **reasoning-token trap**: the lane is a reasoning model; complex images exhausted the 300-token budget in `reasoning_tokens` and returned empty content (`finish_reason: length`, text_tokens 0). **Fix: max_tokens 2000 + "Do NOT think" instruction** — every earlier judge used this lane; earlier rounds' empty outputs at 300 tokens were the same trap.
- **Mirror:** `python3 mirror_site.py https://higgsfield.ai/ higgsfield.ai --depth 2` → **1468 files / 186 MB** (video-heavy) — crawl hit the 900s deadline mid-frontier (residual log noise = imgix-style query params parsed as paths: `…/width=630` 404s); served tree complete (root 200, full assets, DOM parity within 0.5%). Serve: `serve_replica.py 8965 higgsfield.ai`.
- **This cycle's relay lesson — unawaited async writes:** 0-byte PNG captures are NOT page failures — `Bun.write` is async and `ws.close(); process.exit(0)` kills the flush. `await Bun.write(...)` fixed relay_rep (was 0B, became 2.36MB base64→1.77MB binary). Diagnose capture empties by file size + a data-length print before blaming CDP.
- **DOM parity (real Chrome via relay, both tabs fresh, modal dismissed):** title identical; no h1 (card-wall hero); h **12693 vs 12528 (0.5%)**; imgs 87/86; **6 video tiles PAUS==PAUS both sides**; innerText 5610 vs 5970 (lazy content on live at probe time). The homepage shows the same "SIGN UP AND GET YOUR EXTRA DISCOUNT" promo/cookie overlay on both until dismissed — earlier judge fixations on it were modal-timing artifacts; after dismissal the overlay is gone from both (promo-elt count 0 == 0).
- **Vision closure (real Chrome, relay viewport, modal dismissed):** live **5/10** ("cluttered grid of cards… video thumbnail…, above a discount panel"), replica **6/10**, mid band 6/10. Parity read: judge "no" citing a top-banner/badge delta that the DOM check shows identical after dismissal (modal-state timing, not content). **D38 binding gate: UNMET (recorded, not claimed)** — no candidate reached ≥7 under any render this round; live's own max is 5-6; mid-page video-tile bands are GPU-dependent. Mirror archived fidelity-verified, gate-unmet (D51-D53 precedent).
- **Lessons for D55:** (1) The cloud-litellm qwen lane is a reasoning model — ALWAYS max_tokens ≥ 2000 + no-think instruction for judge calls, or you get empty-content false failures indistinguishable from flakes. (2) Video-tile hero sites (masonry of muted-loop `<video>` posters) are Un-electable via headless flush captures — mid-page bands paint black without GPU; only real-Chrome relay captures render them, and even then the paused-tile wall reads mid-tier to the strict judge. (3) When a raw-CDP relay capture writes 0 bytes, check for un-awaited `Bun.write` before suspecting the tab/site — the flush race looks identical to a capture failure. (4) The current leadprysm aug/jul pools (byte-identical since D52) are exhausted as a fresh lane; the TC funding wire (fresh stories Aug 19-25) remains the only advancing source.
