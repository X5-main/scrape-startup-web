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
