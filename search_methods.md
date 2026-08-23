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
+
+## Parameter (parameter.ai — 27th pick)
+
+**Parameter** — Next.js Turbopack site (parameter.ai, **YC W26**, AI pentesting — "Security at the speed of development"). Discovery lane: same YC batch API lane as Trident, where Parameter was the held backup (permissive robots, clean SSR footprint); picked for D27 after Trident's D26 re-score kept the 26th slot. Served via `serve_replica.py` on **8925**; 287 files / 14 MB, **34 HTML pages** + fully vendored `parameter-assets/` (120 entries: JS chunks, woff2, avif) + `.origin` provenance file.
+
+1. **Crawl + asset vendoring**: Turbopack `?dpl=` chunk twins handled per the kebra/callosum precedent (restored at serve time). All scene-critical assets local — `parameter-assets/` holds the deployed JS/CSS/font/image tree; zero cross-origin runtime imports on the replica (logo + hero are local png/avif).
+2. **Sweep**: `pages=34 refs=3442 residual_uniq=0` — zero serve defects across all 34 HTML pages.
+3. **DOM-fact parity** (relay, same tab, live vs replica): h1 "Security at the speed of development" identical, bodyH identical, identical img counts (77/79 lazy-loaded present on both).
+4. **Visible-text parity via innerText line-set diff** (new variant of the parity recipe): dump `document.body.innerText` from both URLs in the SAME relay tab, then compare line SETS. Live 5126 B ⊂ replica 5244 B: every live line present in replica; the only replica-only lines are the cookie-consent banner ("We use cookies to measure how this site is used… Accept / Reject / Manage"). **Consent-banner origin artifact**: the banner renders ONLY on the fresh localhost origin — consent state is stored per-origin (live parameter.ai origin has stored consent; `127.0.0.1:8925` is a new origin), so the banner is expected environmental, not a mirror gap. Byte-equality of innerText is therefore NOT the right bar for per-origin-consent sites; line-set containment + witness of the delta class is.
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
