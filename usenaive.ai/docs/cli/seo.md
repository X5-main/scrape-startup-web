> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# seo

> Keyword research, backlink analysis, and competitive intelligence from the CLI.

## Overview

Three sub-commands for core SEO data:

| Command                                  | Description                                         | Method          |
| ---------------------------------------- | --------------------------------------------------- | --------------- |
| `naive seo keywords <engine> <endpoint>` | Keyword research via Google, Bing, or Google Trends | Live + Standard |
| `naive seo backlinks <endpoint>`         | Backlink profile analysis                           | Live            |
| `naive seo labs <engine> <endpoint>`     | Keyword + competitor research from Labs             | Live            |

***

## Keywords Data

```bash theme={"theme":"css-variables"}
naive seo keywords google search-volume --keywords "ai tools,chatbot" --location 2840
naive seo keywords bing keywords-for-site --target "example.com" --location 2840
naive seo keywords google-trends explore --keywords "ai agents"
```

### Engines & Endpoints

| Engine        | Endpoints                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| google        | search-volume, keywords-for-keywords, keywords-for-site, keywords-for-category, ad-traffic-by-keywords, ad-traffic-by-platforms |
| bing          | search-volume, keywords-for-keywords, keywords-for-site, keywords-for-category, keyword-performance                             |
| google-trends | explore                                                                                                                         |

### Options

| Flag                | Required | Description                                                |
| ------------------- | -------- | ---------------------------------------------------------- |
| `--keywords <list>` | Varies   | Comma-separated keywords                                   |
| `--target <domain>` | Varies   | Target domain or URL                                       |
| `--category <id>`   | No       | Category ID                                                |
| `--location <code>` | No       | Location code                                              |
| `--language <code>` | No       | Language code                                              |
| `--json <body>`     | No       | Raw JSON body (overrides other options)                    |
| `--task`            | No       | Use Standard (async) mode — submit as task instead of Live |

***

## Backlinks

```bash theme={"theme":"css-variables"}
naive seo backlinks summary --target example.com
naive seo backlinks referring-domains --target example.com --limit 50
naive seo backlinks competitors --target example.com
naive seo backlinks bulk-backlinks --targets "a.com,b.com,c.com"
```

### Endpoints

| Endpoint            | Description                            |
| ------------------- | -------------------------------------- |
| summary             | Complete backlink profile              |
| history             | Historical backlink data               |
| backlinks           | Detailed backlink list                 |
| anchors             | Anchor texts and stats                 |
| referring-domains   | Referring domain breakdown             |
| competitors         | Sites sharing your backlink profile    |
| domain-intersection | Domains linking to multiple targets    |
| page-intersection   | Pages linking to multiple targets      |
| bulk-backlinks      | Backlink counts for up to 1000 targets |
| bulk-spam-score     | Spam scores for multiple targets       |

### Options

| Flag                 | Required | Description                                  |
| -------------------- | -------- | -------------------------------------------- |
| `--target <domain>`  | Yes      | Domain or URL to analyze                     |
| `--targets <list>`   | Varies   | Comma-separated targets (for bulk endpoints) |
| `--limit <n>`        | No       | Max results to return                        |
| `--offset <n>`       | No       | Pagination offset                            |
| `--order-by <field>` | No       | Sort field                                   |

***

## Labs

```bash theme={"theme":"css-variables"}
naive seo labs google keyword-overview --keywords "project management" --location 2840
naive seo labs google ranked-keywords --target competitor.com
naive seo labs google serp-competitors --keywords "ai tools" --location 2840
naive seo labs bing related-keywords --keywords "software" --location 2840
```

### Engines & Endpoints

| Engine | Keyword Research                                                                                                                                           | Competitor Research                                                                                                                                                                                                  | Categories                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| google | keyword-overview, keyword-suggestions, keyword-ideas, related-keywords, keywords-for-site, bulk-keyword-difficulty, search-intent, historical-keyword-data | ranked-keywords, serp-competitors, competitors-domain, domain-intersection, domain-rank-overview, relevant-pages, subdomains, historical-serps, historical-rank-overview, page-intersection, bulk-traffic-estimation | categories-for-domain, keywords-for-categories, domain-metrics-by-categories, top-searches |
| bing   | related-keywords, bulk-keyword-difficulty                                                                                                                  | ranked-keywords, domain-rank-overview, serp-competitors, domain-intersection, page-intersection, relevant-pages, competitors-domain, subdomains, bulk-traffic-estimation                                             | —                                                                                          |
| amazon | bulk-search-volume, related-keywords                                                                                                                       | ranked-keywords, product-rank-overview, product-competitors, product-keyword-intersections                                                                                                                           | —                                                                                          |

### Options

| Flag                | Required | Description                                 |
| ------------------- | -------- | ------------------------------------------- |
| `--keywords <list>` | Varies   | Comma-separated keywords                    |
| `--target <domain>` | Varies   | Target domain                               |
| `--targets <list>`  | Varies   | Comma-separated targets (for intersections) |
| `--location <code>` | No       | Location code (default: 2840)               |
| `--language <code>` | No       | Language code (default: en)                 |
| `--limit <n>`       | No       | Max results                                 |
| `--offset <n>`      | No       | Results offset                              |

<Note>
  DataForSEO Labs keyword endpoints (e.g. `keyword-overview`) require both a location and a language. When omitted, `--location` defaults to `2840` (United States) and `--language` to `en`; pass the flags to override.
</Note>

<Tip>
  Use the `naive_seo_discover` MCP tool to find the right endpoint for your use case — it supports natural language filtering.
</Tip>
