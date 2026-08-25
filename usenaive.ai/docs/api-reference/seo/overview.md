> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# SEO API Reference

> All SEO REST endpoints — Keywords Data, Backlinks, and SEO Labs.

## Overview

All SEO endpoints are company-scoped and require an agent API key: `Authorization: Bearer nv_sk_…`. They are pay-per-use through our data provider (priced server-side).

Two execution modes:

* **Live** — POST returns results immediately. Used by Backlinks, SEO Labs, and the `…/…` keyword routes shown below.
* **Standard (async)** — for routes that expose a `/task` variant: POST to `…/task` to enqueue, poll `…/tasks-ready`, then fetch `…/task/:id`. Standard is cheaper for large/slow jobs.

Credits are charged on the Live request or on the Standard task **submission**;
`tasks-ready`, `…/task/:id` and the meta endpoints are free. See
[SEO credit costs](/docs/getting-started/seo#credit-costs) for the per-family table.

Agents that don't want to hand-pick a route can use the MCP meta-tools `naive_seo_discover` (natural-language → endpoint) and `naive_seo_execute` / `naive_seo_execute_async`.

## Keywords Data — Google

| Method | Path                                                          | Description                         |
| ------ | ------------------------------------------------------------- | ----------------------------------- |
| POST   | `/v1/seo/keywords/google/search-volume`                       | Google Ads search volume (Live)     |
| POST   | `/v1/seo/keywords/google/search-volume/task`                  | Google Ads search volume (Standard) |
| GET    | `/v1/seo/keywords/google/search-volume/tasks-ready`           | Check ready tasks                   |
| GET    | `/v1/seo/keywords/google/search-volume/task/:id`              | Retrieve task results               |
| POST   | `/v1/seo/keywords/google/keywords-for-keywords`               | Related keywords (Live)             |
| POST   | `/v1/seo/keywords/google/keywords-for-keywords/task`          | Related keywords (Standard)         |
| GET    | `/v1/seo/keywords/google/keywords-for-keywords/tasks-ready`   | Check ready tasks                   |
| GET    | `/v1/seo/keywords/google/keywords-for-keywords/task/:id`      | Retrieve task results               |
| POST   | `/v1/seo/keywords/google/keywords-for-site`                   | Keywords for a domain (Live)        |
| POST   | `/v1/seo/keywords/google/keywords-for-site/task`              | Keywords for a domain (Standard)    |
| GET    | `/v1/seo/keywords/google/keywords-for-site/tasks-ready`       | Check ready tasks                   |
| GET    | `/v1/seo/keywords/google/keywords-for-site/task/:id`          | Retrieve task results               |
| POST   | `/v1/seo/keywords/google/keywords-for-category`               | Keywords for a category (Live)      |
| POST   | `/v1/seo/keywords/google/keywords-for-category/task`          | Keywords for a category (Standard)  |
| GET    | `/v1/seo/keywords/google/keywords-for-category/tasks-ready`   | Check ready tasks                   |
| GET    | `/v1/seo/keywords/google/keywords-for-category/task/:id`      | Retrieve task results               |
| POST   | `/v1/seo/keywords/google/ad-traffic-by-keywords`              | Ad traffic estimates (Live)         |
| POST   | `/v1/seo/keywords/google/ad-traffic-by-keywords/task`         | Ad traffic estimates (Standard)     |
| GET    | `/v1/seo/keywords/google/ad-traffic-by-keywords/tasks-ready`  | Check ready tasks                   |
| GET    | `/v1/seo/keywords/google/ad-traffic-by-keywords/task/:id`     | Retrieve task results               |
| POST   | `/v1/seo/keywords/google/ad-traffic-by-platforms`             | Ad traffic by platform (Live)       |
| POST   | `/v1/seo/keywords/google/ad-traffic-by-platforms/task`        | Ad traffic by platform (Standard)   |
| GET    | `/v1/seo/keywords/google/ad-traffic-by-platforms/tasks-ready` | Check ready tasks                   |
| GET    | `/v1/seo/keywords/google/ad-traffic-by-platforms/task/:id`    | Retrieve task results               |
| GET    | `/v1/seo/keywords/google/locations`                           | Available locations                 |
| GET    | `/v1/seo/keywords/google/languages`                           | Available languages                 |
| GET    | `/v1/seo/keywords/google/categories`                          | Available categories                |
| GET    | `/v1/seo/keywords/google/adwords-status`                      | Google Ads API connection status    |

## Keywords Data — Bing

| Method | Path                                                      | Description                         |
| ------ | --------------------------------------------------------- | ----------------------------------- |
| POST   | `/v1/seo/keywords/bing/search-volume`                     | Bing search volume (Live)           |
| POST   | `/v1/seo/keywords/bing/search-volume/task`                | Bing search volume (Standard)       |
| GET    | `/v1/seo/keywords/bing/search-volume/tasks-ready`         | Check ready tasks                   |
| GET    | `/v1/seo/keywords/bing/search-volume/task/:id`            | Retrieve task results               |
| POST   | `/v1/seo/keywords/bing/keywords-for-keywords`             | Related keywords (Live)             |
| POST   | `/v1/seo/keywords/bing/keywords-for-keywords/task`        | Related keywords (Standard)         |
| GET    | `/v1/seo/keywords/bing/keywords-for-keywords/tasks-ready` | Check ready tasks                   |
| GET    | `/v1/seo/keywords/bing/keywords-for-keywords/task/:id`    | Retrieve task results               |
| POST   | `/v1/seo/keywords/bing/keywords-for-site`                 | Keywords for a domain (Live)        |
| POST   | `/v1/seo/keywords/bing/keywords-for-site/task`            | Keywords for a domain (Standard)    |
| GET    | `/v1/seo/keywords/bing/keywords-for-site/tasks-ready`     | Check ready tasks                   |
| GET    | `/v1/seo/keywords/bing/keywords-for-site/task/:id`        | Retrieve task results               |
| POST   | `/v1/seo/keywords/bing/keywords-for-category`             | Keywords for a category (Live)      |
| POST   | `/v1/seo/keywords/bing/keywords-for-category/task`        | Keywords for a category (Standard)  |
| GET    | `/v1/seo/keywords/bing/keywords-for-category/tasks-ready` | Check ready tasks                   |
| GET    | `/v1/seo/keywords/bing/keywords-for-category/task/:id`    | Retrieve task results               |
| POST   | `/v1/seo/keywords/bing/keyword-performance`               | Keyword performance data (Live)     |
| POST   | `/v1/seo/keywords/bing/keyword-performance/task`          | Keyword performance data (Standard) |
| GET    | `/v1/seo/keywords/bing/keyword-performance/tasks-ready`   | Check ready tasks                   |
| GET    | `/v1/seo/keywords/bing/keyword-performance/task/:id`      | Retrieve task results               |
| GET    | `/v1/seo/keywords/bing/locations`                         | Available locations                 |
| GET    | `/v1/seo/keywords/bing/languages`                         | Available languages                 |
| GET    | `/v1/seo/keywords/bing/categories`                        | Available categories                |

## Keywords Data — Google Trends

| Method | Path                                                 | Description                      |
| ------ | ---------------------------------------------------- | -------------------------------- |
| POST   | `/v1/seo/keywords/google-trends/explore`             | Google Trends explore (Live)     |
| POST   | `/v1/seo/keywords/google-trends/explore/task`        | Google Trends explore (Standard) |
| GET    | `/v1/seo/keywords/google-trends/explore/tasks-ready` | Check ready tasks                |
| GET    | `/v1/seo/keywords/google-trends/explore/task/:id`    | Retrieve task results            |
| GET    | `/v1/seo/keywords/google-trends/locations`           | Available locations              |
| GET    | `/v1/seo/keywords/google-trends/languages`           | Available languages              |
| GET    | `/v1/seo/keywords/google-trends/categories`          | Available categories             |

## Keywords Utility

| Method | Path                         | Description                |
| ------ | ---------------------------- | -------------------------- |
| GET    | `/v1/seo/keywords/endpoints` | List all keyword endpoints |

## Backlinks

All Backlinks endpoints use Live method (instant results) unless noted.

| Method | Path                                       | Description                            |
| ------ | ------------------------------------------ | -------------------------------------- |
| GET    | `/v1/seo/backlinks/index`                  | Backlink index summary                 |
| GET    | `/v1/seo/backlinks/available-filters`      | Available backlink filters             |
| POST   | `/v1/seo/backlinks/summary`                | Complete backlink profile              |
| POST   | `/v1/seo/backlinks/history`                | Historical backlink data               |
| POST   | `/v1/seo/backlinks/backlinks`              | Detailed backlink list                 |
| POST   | `/v1/seo/backlinks/anchors`                | Anchor texts and stats                 |
| POST   | `/v1/seo/backlinks/domain-pages`           | Pages on the target domain             |
| POST   | `/v1/seo/backlinks/domain-pages-summary`   | Summary of domain pages                |
| POST   | `/v1/seo/backlinks/referring-domains`      | Referring domain breakdown             |
| POST   | `/v1/seo/backlinks/referring-networks`     | Referring networks breakdown           |
| POST   | `/v1/seo/backlinks/competitors`            | Sites sharing backlink profile         |
| POST   | `/v1/seo/backlinks/domain-intersection`    | Domains linking to multiple targets    |
| POST   | `/v1/seo/backlinks/page-intersection`      | Pages linking to multiple targets      |
| POST   | `/v1/seo/backlinks/timeseries-summary`     | Time-series backlink summary           |
| POST   | `/v1/seo/backlinks/timeseries-new-lost`    | New/lost backlinks over time           |
| POST   | `/v1/seo/backlinks/bulk-backlinks`         | Backlink counts for up to 1000 targets |
| POST   | `/v1/seo/backlinks/bulk-referring-domains` | Referring domain counts in bulk        |
| POST   | `/v1/seo/backlinks/bulk-ranks`             | Domain ranks in bulk                   |
| POST   | `/v1/seo/backlinks/bulk-spam-score`        | Spam scores for multiple targets       |
| POST   | `/v1/seo/backlinks/bulk-new-lost`          | New/lost backlinks in bulk             |
| POST   | `/v1/seo/backlinks/bulk-pages-summary`     | Pages summary in bulk                  |
| POST   | `/v1/seo/backlinks/id-list`                | List backlink task IDs                 |

## SEO Labs — Google

<Info>
  Labs keyword endpoints (e.g. `keyword-overview`) take `keywords` (array of strings) and require both a location and a language. `location_code` (default `2840`, United States) and `language_code` (default `en`) are applied automatically when omitted, and can be overridden.
</Info>

### Keyword Research

| Method | Path                                          | Description                    |
| ------ | --------------------------------------------- | ------------------------------ |
| POST   | `/v1/seo/labs/google/keyword-overview`        | Keyword metrics overview       |
| POST   | `/v1/seo/labs/google/keyword-suggestions`     | Keyword suggestions            |
| POST   | `/v1/seo/labs/google/keyword-ideas`           | Keyword ideas                  |
| POST   | `/v1/seo/labs/google/related-keywords`        | Related keywords               |
| POST   | `/v1/seo/labs/google/keywords-for-site`       | Keywords a site ranks for      |
| POST   | `/v1/seo/labs/google/bulk-keyword-difficulty` | Difficulty scores for keywords |
| POST   | `/v1/seo/labs/google/search-intent`           | Search intent classification   |
| POST   | `/v1/seo/labs/google/historical-keyword-data` | Historical keyword metrics     |

### Market Categories

| Method | Path                                               | Description                    |
| ------ | -------------------------------------------------- | ------------------------------ |
| POST   | `/v1/seo/labs/google/categories-for-domain`        | Categories for a domain        |
| POST   | `/v1/seo/labs/google/keywords-for-categories`      | Keywords for market categories |
| POST   | `/v1/seo/labs/google/domain-metrics-by-categories` | Domain metrics by category     |
| POST   | `/v1/seo/labs/google/top-searches`                 | Top searches in a category     |

### Competitor Research

| Method | Path                                           | Description                      |
| ------ | ---------------------------------------------- | -------------------------------- |
| POST   | `/v1/seo/labs/google/ranked-keywords`          | Keywords a domain ranks for      |
| POST   | `/v1/seo/labs/google/serp-competitors`         | SERP competitors for keywords    |
| POST   | `/v1/seo/labs/google/competitors-domain`       | Competitor domains               |
| POST   | `/v1/seo/labs/google/domain-intersection`      | Keyword overlap between domains  |
| POST   | `/v1/seo/labs/google/subdomains`               | Subdomain analysis               |
| POST   | `/v1/seo/labs/google/relevant-pages`           | Most relevant pages for keywords |
| POST   | `/v1/seo/labs/google/domain-rank-overview`     | Domain ranking overview          |
| POST   | `/v1/seo/labs/google/historical-serps`         | Historical SERP data             |
| POST   | `/v1/seo/labs/google/historical-rank-overview` | Historical rank data             |
| POST   | `/v1/seo/labs/google/page-intersection`        | Page-level keyword overlap       |
| POST   | `/v1/seo/labs/google/bulk-traffic-estimation`  | Traffic estimates for domains    |

## SEO Labs — Bing

| Method | Path                                        | Description                      |
| ------ | ------------------------------------------- | -------------------------------- |
| POST   | `/v1/seo/labs/bing/related-keywords`        | Related keywords                 |
| POST   | `/v1/seo/labs/bing/ranked-keywords`         | Keywords a domain ranks for      |
| POST   | `/v1/seo/labs/bing/domain-rank-overview`    | Domain ranking overview          |
| POST   | `/v1/seo/labs/bing/serp-competitors`        | SERP competitors                 |
| POST   | `/v1/seo/labs/bing/domain-intersection`     | Keyword overlap between domains  |
| POST   | `/v1/seo/labs/bing/page-intersection`       | Page-level keyword overlap       |
| POST   | `/v1/seo/labs/bing/relevant-pages`          | Most relevant pages for keywords |
| POST   | `/v1/seo/labs/bing/competitors-domain`      | Competitor domains               |
| POST   | `/v1/seo/labs/bing/subdomains`              | Subdomain analysis               |
| POST   | `/v1/seo/labs/bing/bulk-keyword-difficulty` | Difficulty scores for keywords   |
| POST   | `/v1/seo/labs/bing/bulk-traffic-estimation` | Traffic estimates for domains    |

## SEO Labs — Amazon

| Method | Path                                                | Description                   |
| ------ | --------------------------------------------------- | ----------------------------- |
| POST   | `/v1/seo/labs/amazon/bulk-search-volume`            | Bulk search volume data       |
| POST   | `/v1/seo/labs/amazon/related-keywords`              | Related keywords              |
| POST   | `/v1/seo/labs/amazon/ranked-keywords`               | Keywords a product ranks for  |
| POST   | `/v1/seo/labs/amazon/product-rank-overview`         | Product ranking overview      |
| POST   | `/v1/seo/labs/amazon/product-competitors`           | Product competitors           |
| POST   | `/v1/seo/labs/amazon/product-keyword-intersections` | Product keyword intersections |

## Labs Utility

| Method | Path                                   | Description                       |
| ------ | -------------------------------------- | --------------------------------- |
| GET    | `/v1/seo/labs/locations-and-languages` | Available locations and languages |
| GET    | `/v1/seo/labs/categories`              | Available categories              |
| GET    | `/v1/seo/labs/status`                  | Labs API status                   |

## Common parameters

Most POST bodies accept: `keywords: string[]` (or `target: string` for domain/backlink endpoints), optional `location_code: number` (e.g. `2840` = United States), and optional `language_code: string` (e.g. `"en"`). Backlinks and Labs endpoints additionally accept `limit`, `offset`, `filters`, and `order_by`. See each endpoint's parameter notes in the [endpoint registry](https://github.com/usenaive).

## Examples

<CodeGroup>
  ```bash curl (Live — keyword search volume) theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/seo/keywords/google/search-volume \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "keywords": ["ai agents", "ai tools"], "location_code": 2840, "language_code": "en" }'
  ```

  ```bash curl (Live — backlink summary) theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/seo/backlinks/summary \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "target": "example.com" }'
  ```
</CodeGroup>
