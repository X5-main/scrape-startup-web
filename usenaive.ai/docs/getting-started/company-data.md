> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Company Data

> Private-company firmographics, funding, investors and technology stack — by domain or name.

Company Data answers *"what is this company?"* — headcount, industry, location, funding
rounds, investors, and the technologies its website runs on.

<Note>
  **Not the same primitive as [Reviews & Listings](/docs/getting-started/business).** That one
  covers a company's *reputation and local presence* — Google, Trustpilot and TripAdvisor
  reviews and listings. This one covers *the company itself*. They are siblings, not
  alternatives, and they share no routes.
</Note>

## CLI first

```bash theme={"theme":"css-variables"}
# Enrich a company you already know
naive company-data enrich --domain stripe.com
naive company-data enrich --domain stripe.com --include-signals   # + funding, investors, tech

# Find companies by industry and geography
naive company-data search --industry fintech --geo "San Francisco" --limit 10

# Async batch for a domain list
naive company-data batch --identities '[{"domain":"stripe.com"},{"domain":"ramp.com"}]'
naive company-data task <task-id>
```

## Operations

| Operation | Endpoint                       | Cost                                      |
| --------- | ------------------------------ | ----------------------------------------- |
| `search`  | `POST /v1/company-data/search` | 3× provider spend                         |
| `enrich`  | `POST /v1/company-data/enrich` | 3× provider spend                         |
| `batch`   | `POST /v1/company-data/tasks`  | 3× provider spend, every run in the batch |
| `terms`   | `GET /v1/company-data/terms`   | free                                      |

Every operation bills **3× the provider spend the request actually incurred**, read off the
run. Search costs less than enrich because it *is* less work — a search result is a strict
**subset** of an enrich result, with no funding, investors, tech stack or headcount — and
`include_signals` costs more because it really does start more provider runs.

A run that matches nothing is still billed, because we are invoiced for it; a run that
*fails* is not. Non-zero charges carry a **0.1-credit minimum**. Each charge records
`provider_usd`, its basis (`actual` or `projected`) and the multiplier, all returned by
`GET /v1/usage`.

## enrich

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/company-data/enrich \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{"identity": {"domain": "stripe.com"}, "include_signals": true}'
  ```

  ```typescript sdk theme={"theme":"css-variables"}
  const { data } = await naive.companyData.enrich({ domain: "stripe.com" }, true);
  ```
</CodeGroup>

Accepted identities are `domain`, `name`, or `cb_id`. A domain is the strongest match; a
bare name resolves against the provider's index and may return a near-miss, so check the
returned `domain` before acting on the record. `cb_id` is accepted so callers who stored
one are not broken, but it is **not used for lookup** — the funding actor keys on a slug,
not a uuid.

`include_signals` adds `stage`, `total_funding`, `funding_rounds`, `last_funding_date`,
`investors` and `tech_stack`. Without it you get firmographics only, and the signal fields
are **absent rather than empty** — an empty array would read as "we looked and there is no
funding", which is a different and false claim.

```json theme={"theme":"css-variables"}
{
  "data": {
    "id": "stripe.com",
    "name": "Stripe",
    "domain": "stripe.com",
    "industry": "financial services",
    "employee_count": 8000,
    "location": "South San Francisco, California, United States",
    "founded": 2010,
    "company_type": "Privately Held",
    "stage": "Series I",
    "total_funding": 8700000000,
    "funding_rounds": 22,
    "last_funding_date": "2023-03-15",
    "investors": ["Andreessen Horowitz", "Sequoia Capital"],
    "tech_stack": ["React", "Cloudflare", "Segment"]
  },
  "credits_used": 30,
  "credits_remaining": 4970,
  "provider": "apify",
  "sources": ["linkedin", "crunchbase"]
}
```

A no-match returns **404 with the charge in `credits_used`**: the run happened and is on our
provider invoice, so it is billed at the same 3×.

`provider` is the vendor — always `apify`, one token, one bill. `sources` is which
*datasets* contributed: LinkedIn for firmographics, Crunchbase for funding, investors and
the technology list. They are reported separately so a caller can tell an absent field
from an unattempted one — the funding lookup is keyed on a slug derived from the company
name, and a name whose slug diverges will not match.

Three fields sit on the schema and are never populated today: `recent_news` (no actor in
the set returns news), `employee_growth_6m` (needs two observations over time) and `tags`
(market categories — deliberately not conflated with `tech_stack`, which is real detected
technology).

### Technology stack failures are visible

The funding-and-tech lookup is a separate provider run from firmographics. If it fails for
a transient reason the record still returns, without those fields, and `sources` says so.
If it fails because the **provider account** is unauthorized or suspended, the whole call
errors instead — otherwise a lapsed credential would return an empty stack for every
company forever, which looks exactly like a company with no measurable stack.

## search

Billed on 3× what the run cost, matches or not.

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/company-data/search \
  -H "Authorization: Bearer nv_sk_your_key" \
  -H "Content-Type: application/json" \
  -d '{"filters": {"industry": "fintech", "geo": "San Francisco"}, "limit": 10}'
```

Filters are **`industry` and `geo` only**. `stage`, `funding_min` and `employee_count_min`
are accepted by the request contract and *refused before any actor starts*, rather than
ignored: the search provider does not return those fields,
so a headcount filter could only be honoured by enriching every candidate — which would
silently multiply the bill for the call — or by dropping the filter, which returns confident
wrong results. Filter after the fact by enriching the candidates you care about.

<Note>
  `limit` caps at 50. Above that, use `POST /v1/company-data/tasks`.
</Note>

## Batch

`POST /v1/company-data/tasks` takes up to `PRIMITIVE_BATCH_MAX` identities (1,000 by
default) and returns 202. Poll `GET /v1/company-data/tasks/{id}`.

Worst-case credits are held at submit and settled once against the records actually
matched. Unmatched, invalid and failed rows are counted separately, so a provider outage
never reports as "none of these companies exist".

## Retries and double-charging

Send an `Idempotency-Key` header on `search` and `enrich`. It deduplicates the response and
becomes the credit-ledger reference, so a retried call is not billed twice.

## Acceptable use

Company Data is firmographic, not personal — but funding and investor records name people,
and `GET /v1/company-data/terms` returns the prohibitions that apply. In short: this is not
a consumer report, and it may not be used for employment, credit, insurance or housing
decisions, nor to build a personal profile of a founder or investor.

## Retention

Sync `search` and `enrich` store nothing. Async batch results are the only store and are
pruned at 90 days.

## Related

* [People](/docs/getting-started/people) — the person, rather than the employer
* [Reviews & Listings](/docs/getting-started/business) — reputation and local presence
* [Data primitive status](/docs/getting-started/data-primitives-status) — what is verified live and what is not
