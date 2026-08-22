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
- **Conifer (www.conifer.build) pick rationale:** YC S26; Next.js self-hosted;
  zero external hosts; docs tree (`docs/cli/reference/` etc.) → high value as a
  full-site mirror; home verifier green at `--depth 3` (43 HTML + 80 assets).
  Chart data parity proven live-vs-replica token-for-token (GPT-5.5, DeepSeek V4,
  Claude Opus 4.7 both present; both `snapshot Jul 2026`, 60 models, values
  59.9/55.7/54.8/53.5/… identical).
