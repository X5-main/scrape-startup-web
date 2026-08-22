# Search Methods: Finding Recently-Funded Startups

How to discover startups that raised money in the last 24 months, for the
startup-website library. Ordered by usefulness per effort.

## Method 1: Y Combinator batch pages (best signal)

- YC publishes every funded company per batch: `https://www.ycombinator.com/companies?batch=F25` (or `W26`, `S26`).
- Each company card lists amount raised, lead investor, and date. Sorted by batch date, the funding recency is already guaranteed.
- Scrape the batch listing, filter to companies whose site is a modern Next.js/React build (server-rendered, so a replica is feasible), and mirror.
- Lemma (`www.uselemma.ai`) was found here: YC Fall 2025, $2.3M pre-seed — comfortably inside the 24-month window.

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
 - **Verify sections by anchor, not fraction.** Animated hero counters, rotating
   job-match cards, and randomized mock percentages re-render differently per load,
   so two loads legitimately differ (and two worsely, scroll-fraction comparison
   drifts when scrollHeight differs). Screenshot the same anchoring heading on both
   pages and compare those frames; treat live-mockup values as non-deterministic.
 - **JS-rendered asset URLs escape HTML rewriting.** Assets injected at runtime
   (e.g. `/assets/brand-logos/{company}.webp` built in JS) keep their absolute
   host even after the HTML mirror pass; fetch them from the live site into the
   same path so the replica is offline-complete.
