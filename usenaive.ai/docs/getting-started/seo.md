> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# SEO

> Keyword research, backlink analysis, and competitive intelligence covering Google, Bing, Amazon, and Google Trends.

SEO gives your agent search-optimization data through three sub-APIs — Keywords Data, Backlinks, and SEO Labs. Every live keyword endpoint also supports the Standard (async) method for batch workflows.

## CLI First

```bash theme={"theme":"css-variables"}
# Google keyword volume
naive seo keywords google search-volume --keywords "ai tools,chatbot software" --location 2840

# Backlink summary
naive seo backlinks summary --target example.com

# Labs keyword overview (location/language default to 2840/en if omitted)
naive seo labs google keyword-overview --keywords "project management software" --location 2840
```

## SDK

```ts theme={"theme":"css-variables"}
import { Naive } from "@usenaive-sdk/server";
const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

// Your own account, or a tenant via naive.forUser(id).seo
await naive.seo.searchVolume(["ai tools", "chatbot software"]);
await naive.seo.rankedKeywords("example.com");
await naive.seo.backlinksSummary("competitor.com");
await naive.seo.serpCompetitors(["ai agents"]);
```

Per-user and AccountKit-gated; usage is metered against the tenant's plan (see [Customer Billing](/docs/getting-started/customer-billing)). Full surface in the [`seo` sub-client](/docs/sdk/sub-clients/seo); also available to agents via [`agentTools()`](/docs/sdk/agent-tools).

## Sub-APIs

| API                           | Type    | Description                                                             | Speed         | Cost                           |
| ----------------------------- | ------- | ----------------------------------------------------------------------- | ------------- | ------------------------------ |
| Keywords Data — Google        | Core    | Search volume, keyword suggestions, ad traffic via Google Ads           | Fast (\~2s)   | 2 credits (1.5 via `/task`)    |
| Keywords Data — Bing          | Core    | Search volume, keyword suggestions, keyword performance via Bing        | Fast (\~2s)   | 2 credits (1.5 via `/task`)    |
| Keywords Data — Google Trends | Core    | Trend exploration for keywords over time                                | Fast (\~2s)   | 0.25 credits (0.2 via `/task`) |
| Backlinks                     | Core    | Backlink profiles, referring domains, anchor texts, competitor analysis | Fast (\~2-5s) | 1.8 credits                    |
| Backlinks — Bulk              | Core    | Bulk backlink counts, ranks, spam scores for up to 1000 targets         | Fast (\~3-8s) | 17 credits                     |
| SEO Labs — Google             | Core    | Keyword research, SERP analysis, competitor insights from Google data   | Fast (\~2-5s) | 0.75 credits                   |
| SEO Labs — Bing               | Core    | Keyword and competitor research from Bing data                          | Fast (\~2-5s) | 0.75 credits                   |
| SEO Labs — Amazon             | Core    | Product keyword research and competitor analysis on Amazon              | Fast (\~2-5s) | 0.75 credits                   |
| Labs — Bulk                   | Core    | Bulk keyword difficulty, bulk traffic estimation                        | Fast (\~3-8s) | 5.4 credits                    |
| Meta / Utility                | Utility | Locations, languages, categories, status                                | Fast (\~1s)   | Free                           |

## Quick Examples

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  # Google keyword search volume (live)
  curl -X POST https://api.usenaive.ai/v1/seo/keywords/google/search-volume \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "keywords": ["ai tools", "chatbot software"], "location_code": 2840 }'

  # Backlink summary
  curl -X POST https://api.usenaive.ai/v1/seo/backlinks/summary \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "target": "example.com" }'

  # Labs keyword overview
  curl -X POST https://api.usenaive.ai/v1/seo/labs/google/keyword-overview \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "keywords": ["project management software"], "location_code": 2840 }'
  ```
</CodeGroup>

***

## Keywords Data API

Keywords Data provides search volume, keyword suggestions, and ad traffic estimates across Google, Bing, and Google Trends. Each data endpoint supports both **Live** (instant results via POST) and **Standard** (async task via POST + GET) modes.

### Google Endpoints

| Endpoint                | Route                                                  | Method          | Description                                                     |
| ----------------------- | ------------------------------------------------------ | --------------- | --------------------------------------------------------------- |
| search-volume           | `POST /v1/seo/keywords/google/search-volume`           | Live + Standard | Monthly search volume, CPC, competition for up to 1000 keywords |
| keywords-for-keywords   | `POST /v1/seo/keywords/google/keywords-for-keywords`   | Live + Standard | Related keywords based on seed keywords                         |
| keywords-for-site       | `POST /v1/seo/keywords/google/keywords-for-site`       | Live + Standard | Keywords a domain ranks for in Google Ads                       |
| keywords-for-category   | `POST /v1/seo/keywords/google/keywords-for-category`   | Live + Standard | Keywords for a Google Ads category                              |
| ad-traffic-by-keywords  | `POST /v1/seo/keywords/google/ad-traffic-by-keywords`  | Live + Standard | Estimated ad traffic and CPC for keywords                       |
| ad-traffic-by-platforms | `POST /v1/seo/keywords/google/ad-traffic-by-platforms` | Live + Standard | Ad traffic broken down by platform (mobile, desktop, tablet)    |

### Google Meta Endpoints

| Endpoint       | Route                                        | Method | Description                        |
| -------------- | -------------------------------------------- | ------ | ---------------------------------- |
| locations      | `GET /v1/seo/keywords/google/locations`      | GET    | Valid location codes for Google    |
| languages      | `GET /v1/seo/keywords/google/languages`      | GET    | Valid language codes for Google    |
| categories     | `GET /v1/seo/keywords/google/categories`     | GET    | Google Ads category list           |
| adwords-status | `GET /v1/seo/keywords/google/adwords-status` | GET    | Google Ads API availability status |

### Bing Endpoints

| Endpoint              | Route                                              | Method          | Description                                  |
| --------------------- | -------------------------------------------------- | --------------- | -------------------------------------------- |
| search-volume         | `POST /v1/seo/keywords/bing/search-volume`         | Live + Standard | Bing monthly search volume, CPC, competition |
| keywords-for-keywords | `POST /v1/seo/keywords/bing/keywords-for-keywords` | Live + Standard | Related keywords from Bing data              |
| keywords-for-site     | `POST /v1/seo/keywords/bing/keywords-for-site`     | Live + Standard | Keywords a domain ranks for in Bing Ads      |
| keywords-for-category | `POST /v1/seo/keywords/bing/keywords-for-category` | Live + Standard | Keywords for a Bing Ads category             |
| keyword-performance   | `POST /v1/seo/keywords/bing/keyword-performance`   | Live + Standard | Historical keyword performance data in Bing  |

### Bing Meta Endpoints

| Endpoint   | Route                                  | Method | Description                   |
| ---------- | -------------------------------------- | ------ | ----------------------------- |
| locations  | `GET /v1/seo/keywords/bing/locations`  | GET    | Valid location codes for Bing |
| languages  | `GET /v1/seo/keywords/bing/languages`  | GET    | Valid language codes for Bing |
| categories | `GET /v1/seo/keywords/bing/categories` | GET    | Bing Ads category list        |

### Google Trends Endpoints

| Endpoint | Route                                         | Method          | Description                                     |
| -------- | --------------------------------------------- | --------------- | ----------------------------------------------- |
| explore  | `POST /v1/seo/keywords/google-trends/explore` | Live + Standard | Trend data for keywords over time and by region |

### Google Trends Meta Endpoints

| Endpoint   | Route                                           | Method | Description                            |
| ---------- | ----------------------------------------------- | ------ | -------------------------------------- |
| locations  | `GET /v1/seo/keywords/google-trends/locations`  | GET    | Valid location codes for Google Trends |
| languages  | `GET /v1/seo/keywords/google-trends/languages`  | GET    | Valid language codes for Google Trends |
| categories | `GET /v1/seo/keywords/google-trends/categories` | GET    | Google Trends category list            |

### Utility

| Endpoint  | Route                            | Method | Description                                    |
| --------- | -------------------------------- | ------ | ---------------------------------------------- |
| endpoints | `GET /v1/seo/keywords/endpoints` | GET    | List all available Keywords Data API endpoints |

### Live vs Standard Mode

Every data endpoint (not meta) supports two modes:

* **Live** — `POST /v1/seo/keywords/{engine}/{endpoint}` — instant results in the response body.
* **Standard** — submit via `POST .../task`, check readiness via `GET .../tasks-ready`, retrieve via `GET .../task/:id`.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  # Live: instant results
  curl -X POST https://api.usenaive.ai/v1/seo/keywords/google/search-volume \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "keywords": ["ai tools", "chatbot software"], "location_code": 2840, "language_code": "en" }'

  # Standard: submit task
  curl -X POST https://api.usenaive.ai/v1/seo/keywords/google/search-volume/task \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "keywords": ["ai tools", "chatbot software"], "location_code": 2840 }'

  # Standard: retrieve results
  curl -G https://api.usenaive.ai/v1/seo/keywords/google/search-volume/task/TASK_ID \
    -H "Authorization: Bearer nv_sk_your_key"
  ```
</CodeGroup>

**Response (Live — search-volume):**

```json theme={"theme":"css-variables"}
{
  "results": [
    {
      "keyword": "ai tools",
      "search_volume": 165000,
      "competition": 0.87,
      "competition_level": "HIGH",
      "cpc": 4.32,
      "monthly_searches": [
        { "year": 2026, "month": 4, "search_volume": 165000 },
        { "year": 2026, "month": 3, "search_volume": 148000 }
      ]
    },
    {
      "keyword": "chatbot software",
      "search_volume": 22200,
      "competition": 0.74,
      "competition_level": "HIGH",
      "cpc": 8.15,
      "monthly_searches": [
        { "year": 2026, "month": 4, "search_volume": 22200 },
        { "year": 2026, "month": 3, "search_volume": 20100 }
      ]
    }
  ],
  "credits_used": 1.5
}
```

### Parameters

| Param           | Type      | Required | Default | Description                                                  |
| --------------- | --------- | -------- | ------- | ------------------------------------------------------------ |
| `keywords`      | string\[] | Yes      | —       | Keywords to analyze (max varies by endpoint, typically 1000) |
| `location_code` | number    | No       | —       | Location code (e.g. 2840 for US)                             |
| `language_code` | string    | No       | —       | Language code (e.g. "en")                                    |
| `date_from`     | string    | No       | —       | Start date for historical data (YYYY-MM-DD)                  |
| `date_to`       | string    | No       | —       | End date for historical data (YYYY-MM-DD)                    |
| `sort_by`       | string    | No       | —       | Sort field (varies by endpoint)                              |
| `limit`         | number    | No       | —       | Max results to return                                        |
| `offset`        | number    | No       | 0       | Pagination offset                                            |

### When to use

* Estimating keyword search volume before creating content
* Discovering related keywords for topic clusters
* Analyzing ad traffic and CPC for paid campaigns
* Tracking keyword trends over time via Google Trends
* Comparing keyword performance across Google and Bing
* Finding keywords competitors are buying ads for

***

## Backlinks API

The Backlinks API provides instant backlink profile data — referring domains, anchor texts, competitors, and bulk analysis. All endpoints use the **Live** method (instant POST results).

### Live POST Endpoints

| Endpoint               | Route                                           | Description                               |
| ---------------------- | ----------------------------------------------- | ----------------------------------------- |
| summary                | `POST /v1/seo/backlinks/summary`                | Complete backlink profile overview        |
| history                | `POST /v1/seo/backlinks/history`                | Historical backlink count over time       |
| backlinks              | `POST /v1/seo/backlinks/backlinks`              | Detailed list of individual backlinks     |
| anchors                | `POST /v1/seo/backlinks/anchors`                | Anchor text distribution and stats        |
| domain-pages           | `POST /v1/seo/backlinks/domain-pages`           | Pages on the target domain with backlinks |
| domain-pages-summary   | `POST /v1/seo/backlinks/domain-pages-summary`   | Summary stats for domain pages            |
| referring-domains      | `POST /v1/seo/backlinks/referring-domains`      | Breakdown of referring domains            |
| referring-networks     | `POST /v1/seo/backlinks/referring-networks`     | Referring network (IP/subnet) analysis    |
| competitors            | `POST /v1/seo/backlinks/competitors`            | Sites sharing your backlink profile       |
| domain-intersection    | `POST /v1/seo/backlinks/domain-intersection`    | Domains linking to multiple targets       |
| page-intersection      | `POST /v1/seo/backlinks/page-intersection`      | Pages linking to multiple targets         |
| timeseries-summary     | `POST /v1/seo/backlinks/timeseries-summary`     | Time-series backlink metrics              |
| timeseries-new-lost    | `POST /v1/seo/backlinks/timeseries-new-lost`    | New and lost backlinks over time          |
| bulk-backlinks         | `POST /v1/seo/backlinks/bulk-backlinks`         | Backlink counts for up to 1000 targets    |
| bulk-referring-domains | `POST /v1/seo/backlinks/bulk-referring-domains` | Referring domain counts in bulk           |
| bulk-ranks             | `POST /v1/seo/backlinks/bulk-ranks`             | Domain/page rank scores in bulk           |
| bulk-spam-score        | `POST /v1/seo/backlinks/bulk-spam-score`        | Spam scores for multiple targets          |
| bulk-new-lost          | `POST /v1/seo/backlinks/bulk-new-lost`          | New/lost backlink counts in bulk          |
| bulk-pages-summary     | `POST /v1/seo/backlinks/bulk-pages-summary`     | Page-level summary in bulk                |

### GET Endpoints

| Endpoint          | Route                                     | Description                               |
| ----------------- | ----------------------------------------- | ----------------------------------------- |
| index             | `GET /v1/seo/backlinks/index`             | Current backlink index size and freshness |
| available-filters | `GET /v1/seo/backlinks/available-filters` | List of available filter fields           |

### Other

| Endpoint | Route                            | Method | Description                           |
| -------- | -------------------------------- | ------ | ------------------------------------- |
| id-list  | `POST /v1/seo/backlinks/id-list` | POST   | List task IDs with status information |

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  # Backlink summary for a domain
  curl -X POST https://api.usenaive.ai/v1/seo/backlinks/summary \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "target": "example.com", "mode": "as_is" }'

  # Bulk spam scores
  curl -X POST https://api.usenaive.ai/v1/seo/backlinks/bulk-spam-score \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "targets": ["example.com", "competitor.com", "another.com"] }'
  ```
</CodeGroup>

**Response (summary):**

```json theme={"theme":"css-variables"}
{
  "results": [
    {
      "target": "example.com",
      "total_backlinks": 284530,
      "total_referring_domains": 12847,
      "total_referring_main_domains": 8421,
      "total_referring_ips": 9103,
      "total_referring_subnets": 7842,
      "nofollow_backlinks": 98200,
      "dofollow_backlinks": 186330,
      "spam_score": 12,
      "rank": 482,
      "broken_backlinks": 3240,
      "first_seen": "2018-03-15",
      "last_visited": "2026-05-01"
    }
  ],
  "credits_used": 17
}
```

### Parameters

| Param                   | Type      | Required   | Default  | Description                                                  |
| ----------------------- | --------- | ---------- | -------- | ------------------------------------------------------------ |
| `target`                | string    | Yes        | —        | Domain or URL to analyze                                     |
| `targets`               | string\[] | Yes (bulk) | —        | Multiple domains/URLs for bulk endpoints (max 1000)          |
| `limit`                 | number    | No         | 100      | Max results to return                                        |
| `offset`                | number    | No         | 0        | Pagination offset                                            |
| `mode`                  | string    | No         | "as\_is" | Target matching: `as_is`, `one_per_domain`, `one_per_anchor` |
| `filters`               | array     | No         | —        | Filter conditions (see available-filters endpoint)           |
| `order_by`              | array     | No         | —        | Sort order for results                                       |
| `backlinks_status_type` | string    | No         | "all"    | Filter by status: `all`, `live`, `lost`                      |

### When to use

* Auditing your own backlink profile for toxic links
* Analyzing competitor link-building strategies
* Finding link prospects via domain/page intersection
* Bulk-checking spam scores for link cleanup campaigns
* Tracking new/lost backlinks over time
* Comparing referring domain counts across competitors

***

## SEO Labs API

Labs endpoints provide keyword research, competitor analysis, and SERP insights using a proprietary SEO database. All use the **Live** method — instant POST results. Available for Google, Bing, and Amazon.

### Google Endpoints (23)

| Endpoint                     | Route                                                   | Description                                                  |
| ---------------------------- | ------------------------------------------------------- | ------------------------------------------------------------ |
| keywords-for-site            | `POST /v1/seo/labs/google/keywords-for-site`            | Keywords a domain ranks for organically                      |
| related-keywords             | `POST /v1/seo/labs/google/related-keywords`             | Semantically related keywords                                |
| keyword-suggestions          | `POST /v1/seo/labs/google/keyword-suggestions`          | Keyword ideas based on a seed keyword                        |
| keyword-ideas                | `POST /v1/seo/labs/google/keyword-ideas`                | Broad keyword ideas from multiple seeds                      |
| bulk-keyword-difficulty      | `POST /v1/seo/labs/google/bulk-keyword-difficulty`      | Difficulty scores for up to 1000 keywords                    |
| search-intent                | `POST /v1/seo/labs/google/search-intent`                | Classify keyword intent (informational, transactional, etc.) |
| keyword-overview             | `POST /v1/seo/labs/google/keyword-overview`             | Comprehensive keyword metrics overview                       |
| historical-keyword-data      | `POST /v1/seo/labs/google/historical-keyword-data`      | Historical search volume and metrics                         |
| categories-for-domain        | `POST /v1/seo/labs/google/categories-for-domain`        | Categories a domain is associated with                       |
| keywords-for-categories      | `POST /v1/seo/labs/google/keywords-for-categories`      | Keywords for specific categories                             |
| domain-metrics-by-categories | `POST /v1/seo/labs/google/domain-metrics-by-categories` | Domain performance by category                               |
| top-searches                 | `POST /v1/seo/labs/google/top-searches`                 | Trending and top search queries                              |
| ranked-keywords              | `POST /v1/seo/labs/google/ranked-keywords`              | Keywords a domain currently ranks for                        |
| serp-competitors             | `POST /v1/seo/labs/google/serp-competitors`             | Domains competing in SERPs for given keywords                |
| competitors-domain           | `POST /v1/seo/labs/google/competitors-domain`           | Competitor domains based on keyword overlap                  |
| domain-intersection          | `POST /v1/seo/labs/google/domain-intersection`          | Keywords shared between multiple domains                     |
| subdomains                   | `POST /v1/seo/labs/google/subdomains`                   | Subdomains with organic rankings                             |
| relevant-pages               | `POST /v1/seo/labs/google/relevant-pages`               | Top-ranking pages for a domain                               |
| domain-rank-overview         | `POST /v1/seo/labs/google/domain-rank-overview`         | Domain authority, traffic, and ranking summary               |
| historical-serps             | `POST /v1/seo/labs/google/historical-serps`             | Historical SERP snapshots for keywords                       |
| historical-rank-overview     | `POST /v1/seo/labs/google/historical-rank-overview`     | Historical rank tracking for a domain                        |
| page-intersection            | `POST /v1/seo/labs/google/page-intersection`            | Keywords shared between specific pages                       |
| bulk-traffic-estimation      | `POST /v1/seo/labs/google/bulk-traffic-estimation`      | Traffic estimates for multiple domains                       |

### Bing Endpoints (11)

| Endpoint                | Route                                            | Description                                   |
| ----------------------- | ------------------------------------------------ | --------------------------------------------- |
| related-keywords        | `POST /v1/seo/labs/bing/related-keywords`        | Semantically related keywords from Bing data  |
| ranked-keywords         | `POST /v1/seo/labs/bing/ranked-keywords`         | Keywords a domain ranks for in Bing           |
| domain-rank-overview    | `POST /v1/seo/labs/bing/domain-rank-overview`    | Domain authority and ranking summary for Bing |
| serp-competitors        | `POST /v1/seo/labs/bing/serp-competitors`        | SERP competitors in Bing results              |
| domain-intersection     | `POST /v1/seo/labs/bing/domain-intersection`     | Keywords shared between domains in Bing       |
| page-intersection       | `POST /v1/seo/labs/bing/page-intersection`       | Keywords shared between pages in Bing         |
| relevant-pages          | `POST /v1/seo/labs/bing/relevant-pages`          | Top-ranking pages in Bing                     |
| competitors-domain      | `POST /v1/seo/labs/bing/competitors-domain`      | Competitor domains in Bing                    |
| subdomains              | `POST /v1/seo/labs/bing/subdomains`              | Subdomains with Bing rankings                 |
| bulk-keyword-difficulty | `POST /v1/seo/labs/bing/bulk-keyword-difficulty` | Bulk keyword difficulty for Bing              |
| bulk-traffic-estimation | `POST /v1/seo/labs/bing/bulk-traffic-estimation` | Bulk traffic estimates from Bing data         |

### Amazon Endpoints (6)

| Endpoint                      | Route                                                    | Description                             |
| ----------------------------- | -------------------------------------------------------- | --------------------------------------- |
| bulk-search-volume            | `POST /v1/seo/labs/amazon/bulk-search-volume`            | Search volume for keywords on Amazon    |
| related-keywords              | `POST /v1/seo/labs/amazon/related-keywords`              | Related keywords on Amazon              |
| ranked-keywords               | `POST /v1/seo/labs/amazon/ranked-keywords`               | Keywords a product ranks for on Amazon  |
| product-rank-overview         | `POST /v1/seo/labs/amazon/product-rank-overview`         | Product ranking overview on Amazon      |
| product-competitors           | `POST /v1/seo/labs/amazon/product-competitors`           | Competing products on Amazon            |
| product-keyword-intersections | `POST /v1/seo/labs/amazon/product-keyword-intersections` | Keywords shared between Amazon products |

### Utility GET Endpoints

| Endpoint                | Route                                      | Description                              |
| ----------------------- | ------------------------------------------ | ---------------------------------------- |
| locations-and-languages | `GET /v1/seo/labs/locations-and-languages` | Valid location + language pairs for Labs |
| categories              | `GET /v1/seo/labs/categories`              | SEO Labs category list                   |
| status                  | `GET /v1/seo/labs/status`                  | Labs API availability status             |

<Note>
  Labs keyword endpoints (e.g. `keyword-overview`) require both a location and a language. `location_code` (default `2840`, United States) and `language_code` (default `en`) are applied automatically when omitted; pass them (or the CLI's `--location`/`--language`) to override.
</Note>

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  # Keyword overview
  curl -X POST https://api.usenaive.ai/v1/seo/labs/google/keyword-overview \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "keywords": ["project management software"],
      "location_code": 2840,
      "language_code": "en"
    }'

  # Domain rank overview
  curl -X POST https://api.usenaive.ai/v1/seo/labs/google/domain-rank-overview \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "target": "notion.so", "location_code": 2840 }'

  # Amazon product competitors
  curl -X POST https://api.usenaive.ai/v1/seo/labs/amazon/product-competitors \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "asin": "B09V3KXJPB", "location_code": 2840 }'
  ```
</CodeGroup>

**Response (keyword-overview):**

```json theme={"theme":"css-variables"}
{
  "results": [
    {
      "keyword": "project management software",
      "search_volume": 74000,
      "keyword_difficulty": 82,
      "cpc": 12.45,
      "competition_level": "HIGH",
      "search_intent": "commercial",
      "serp_info": {
        "featured_snippet": true,
        "knowledge_panel": false,
        "local_pack": false,
        "top_stories": false
      },
      "avg_backlinks_top_10": 1240,
      "avg_domain_rating_top_10": 78
    }
  ],
  "credits_used": 0.75
}
```

### Parameters

| Param           | Type      | Required | Default | Description                                      |
| --------------- | --------- | -------- | ------- | ------------------------------------------------ |
| `keywords`      | string\[] | Varies   | —       | Keywords to analyze                              |
| `keyword`       | string    | Varies   | —       | Single seed keyword (for suggestion endpoints)   |
| `target`        | string    | Varies   | —       | Target domain or URL                             |
| `targets`       | string\[] | Varies   | —       | Multiple domains for intersection/bulk endpoints |
| `asin`          | string    | Varies   | —       | Amazon product ASIN (Amazon endpoints only)      |
| `location_code` | number    | No       | —       | Location code                                    |
| `language_code` | string    | No       | —       | Language code                                    |
| `limit`         | number    | No       | 100     | Max results to return                            |
| `offset`        | number    | No       | 0       | Pagination offset                                |
| `filters`       | array     | No       | —       | Filter conditions                                |
| `order_by`      | array     | No       | —       | Sort order                                       |

### When to use

* Getting keyword difficulty scores before targeting terms
* Finding competitor keywords you're missing (domain-intersection)
* Analyzing SERP competition for specific terms
* Estimating traffic potential for domains in bulk
* Classifying search intent for content strategy
* Researching Amazon product keyword opportunities

***

## Credit Costs

| Category                        | Endpoints                                                                                                                                                                                                     | Cost               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Keywords Data — Live            | All Google Ads and Bing Ads data endpoints                                                                                                                                                                    | 2 credits          |
| Keywords Data — Standard (task) | All Google Ads and Bing Ads data endpoints via task workflow                                                                                                                                                  | 1.5 credits        |
| Google Trends — Live / Standard | explore                                                                                                                                                                                                       | 0.25 / 0.2 credits |
| Backlinks — Standard            | summary, history, backlinks, anchors, domain-pages, domain-pages-summary, referring-domains, referring-networks, competitors, domain-intersection, page-intersection, timeseries-summary, timeseries-new-lost | 1.8 credits        |
| Backlinks — Bulk                | bulk-backlinks, bulk-referring-domains, bulk-ranks, bulk-spam-score, bulk-new-lost, bulk-pages-summary                                                                                                        | 17 credits         |
| Labs — Standard                 | All Google (23), Bing (11), Amazon (6) endpoints except bulk and the two below                                                                                                                                | 0.75 credits       |
| Labs — Bulk                     | bulk-keyword-difficulty, bulk-traffic-estimation, bulk-search-volume                                                                                                                                          | 5.4 credits        |
| Labs — Historical               | historical-rank-overview, domain-metrics-by-categories                                                                                                                                                        | 10 credits         |
| Meta / Utility                  | locations, languages, categories, adwords-status, endpoints, status, available-filters, index, locations-and-languages                                                                                        | Free               |
| Task retrieval                  | `…/task/:id`, `…/tasks-ready`, `id-list`                                                                                                                                                                      | Free               |

Credits are charged when a request is made (or a task submitted) — the provider
bills only for setting a task, so collecting the results is free.

The figures above are list prices. Backlinks and Labs bill the provider per
returned row, so an unusually large response settles above the list price; the
`credits_used` field on every response is the amount actually charged.

## Error Handling

| Error                  | Cause                                  | Recovery                                                        |
| ---------------------- | -------------------------------------- | --------------------------------------------------------------- |
| `insufficient_credits` | Not enough credits for the operation   | Check balance with `GET /v1/status`                             |
| `invalid_location`     | Unknown location code                  | Use `GET /v1/seo/keywords/google/locations` to find valid codes |
| `invalid_keywords`     | Empty or malformed keyword list        | Provide at least one keyword string                             |
| `invalid_target`       | Missing or malformed target domain/URL | Provide a valid domain (e.g. "example.com") or full URL         |
| `too_many_targets`     | Exceeded max targets for bulk endpoint | Reduce to 1000 targets or fewer                                 |
| `provider_error`       | SEO data provider returned an error    | Retry after a few seconds                                       |

<Tip>
  Use the `naive_seo_discover` MCP tool to find the right endpoint for your use case — it supports natural language filtering across all 90+ SEO endpoints.
</Tip>

## Typical Workflow

```
Agent receives task: "Find keyword opportunities for our blog"
    │
    ├─ POST /v1/seo/keywords/google/search-volume         → Check current volumes
    │   { keywords: ["ai agents", "llm tools"] }
    │   → Volume, CPC, competition data
    │
    ├─ POST /v1/seo/labs/google/keyword-suggestions        → Expand keyword list
    │   { keyword: "ai agents", location_code: 2840 }
    │   → Related keywords with difficulty scores
    │
    ├─ POST /v1/seo/labs/google/search-intent              → Classify intent
    │   { keywords: ["ai agents", "buy ai agent"] }
    │   → informational, commercial, transactional labels
    │
    ├─ POST /v1/seo/labs/google/serp-competitors           → Analyze competition
    │   { keywords: ["ai agents"], location_code: 2840 }
    │   → Top-ranking domains and their metrics
    │
    ├─ POST /v1/seo/labs/google/domain-intersection        → Find gaps
    │   { targets: ["yourdomain.com", "competitor.com"] }
    │   → Keywords competitor ranks for that you don't
    │
    └─ POST /v1/seo/backlinks/summary                      → Audit competitor links
        { target: "competitor.com" }
        → Backlink count, referring domains, spam score
```

## See also (blog)

* [How agents run SEO keyword research loops](https://usenaive.ai/blog/how-agents-run-seo-keyword-research-loops) — per-tenant volume + SERP competitor loop
* [How to build a usage-metered SEO SaaS](https://usenaive.ai/blog/how-to-build-a-usage-metered-seo-saas) — meter `seo` calls per customer plan
