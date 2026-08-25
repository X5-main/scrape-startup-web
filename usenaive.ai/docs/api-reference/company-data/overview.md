> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Company Data API Reference

> All Company Data REST endpoints — firmographics, funding, investors, tech stack, async batch and terms.

## Overview

Company-scoped; requires `Authorization: Bearer nv_sk_…`. Metered on provider spend:
3× the provider run's real spend on every operation; `include_signals` costs more because it
starts more runs. A no-match is billed too, because the run still happened.
Send `Idempotency-Key` on `search` and `enrich` so a retry is not billed twice.

Distinct from [Business Data](/docs/api-reference/business-data/overview), which covers a
company's reviews and local listings rather than the company itself. MCP equivalents are
`naive_company_*`.

## Endpoints

| Method | Path                         | Description                                                |
| ------ | ---------------------------- | ---------------------------------------------------------- |
| POST   | `/v1/company-data/search`    | Find companies by `industry` and `geo` (limit ≤ 50)        |
| POST   | `/v1/company-data/enrich`    | Resolve `domain`, `name` or `cb_id` into a company record  |
| POST   | `/v1/company-data/tasks`     | Async batch enrich, up to `PRIMITIVE_BATCH_MAX` identities |
| GET    | `/v1/company-data/tasks/:id` | Batch status and, once complete, the matched records       |
| GET    | `/v1/company-data/terms`     | Acceptable-use terms as JSON (unmetered)                   |

## Notes

* Search **refuses** `stage`, `funding_min` and `employee_count_min` before any provider run:
  the search dataset carries none of those fields, so honouring them would mean either
  enriching every candidate or dropping the filter silently.
* `include_signals` adds `stage`, `total_funding`, `funding_rounds`, `last_funding_date`,
  `investors` and `tech_stack`. Absent, not empty, when the funding lookup did not match.
* `provider` is the vendor (`apify`); `sources` names the datasets that contributed
  (`linkedin`, `crunchbase`).
* `recent_news`, `employee_growth_6m` and `tags` are on the schema and never populated.
