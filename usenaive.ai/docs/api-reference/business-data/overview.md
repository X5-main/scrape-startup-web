> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Business Data API Reference

> All Business Data REST endpoints — Google Maps places & reviews, Google Business, Trustpilot, TripAdvisor, and Social Media.

## Overview

Company-scoped; requires `Authorization: Bearer nv_sk_…`. Pay-per-use via our data providers — there are two: Google Maps for the normalized `places` routes, and DataForSEO for everything else.

Credits are charged on the Live request or on the Standard task **submission** —
the provider bills only for setting a task, so `tasks-ready` and `task/:id` are
free. A review-heavy task can settle above the listed price when it costs us
more upstream; `credits_used` on the response is the amount charged.

Modes: Google My Business, Hotels, and Q\&A offer a **Live** route plus a **Standard (async)** `…/task` route; Google Reviews, Trustpilot, and TripAdvisor are **Standard** only (`…/task` → `…/tasks-ready` → `…/task/:id`); Social Media engagement is **Live**. MCP equivalents: `naive_business_discover` + `naive_business_execute(_async)`.

<Info>
  The **Travel** and **Reviews** primitives in the guides are use-case views over these same Business Data endpoints — there is no separate `/v1/travel` or `/v1/reviews` route. See [Travel](/docs/getting-started/travel) (Google Hotels + TripAdvisor) and [Reviews](/docs/getting-started/reviews) (Google/Trustpilot/TripAdvisor reviews + social engagement).
</Info>

## Places & Reviews (Google Maps)

A **second provider** on this primitive, and the only routes here that return normalized
objects rather than the data vendor's `tasks[]` envelope — see
[Places & Reviews](/docs/getting-started/business-places). Synchronous, and billed on 2× the
provider run's real cost rather than a flat per-call rate.

| Method | Path                          | Description                                    |
| ------ | ----------------------------- | ---------------------------------------------- |
| POST   | `/v1/business/places/search`  | Search local listings (normalized, Live)       |
| POST   | `/v1/business/places/reviews` | Reviews for known place ids (normalized, Live) |

MCP equivalents: `naive_business_places_search`, `naive_business_places_reviews`. Neither
returns contact people, and reviewer identity is never collected.

## Google My Business

| Method | Path                                                  | Description                 | Credits |
| ------ | ----------------------------------------------------- | --------------------------- | ------- |
| POST   | `/v1/business/google/my-business-info`                | Business details (Live)     | 0.13    |
| POST   | `/v1/business/google/my-business-info/task`           | Business details (Standard) | 0.09    |
| GET    | `/v1/business/google/my-business-info/tasks-ready`    | Check ready tasks           | Free    |
| GET    | `/v1/business/google/my-business-info/task/:id`       | Retrieve task results       | Free    |
| POST   | `/v1/business/google/my-business-updates/task`        | Business updates (Standard) | 3       |
| GET    | `/v1/business/google/my-business-updates/tasks-ready` | Check ready tasks           | Free    |
| GET    | `/v1/business/google/my-business-updates/task/:id`    | Retrieve task results       | Free    |

## Google Hotels

| Method | Path                                             | Description              | Credits |
| ------ | ------------------------------------------------ | ------------------------ | ------- |
| POST   | `/v1/business/google/hotel-searches`             | Search hotels (Live)     | 0.1     |
| POST   | `/v1/business/google/hotel-searches/task`        | Search hotels (Standard) | 0.07    |
| GET    | `/v1/business/google/hotel-searches/tasks-ready` | Check ready tasks        | Free    |
| GET    | `/v1/business/google/hotel-searches/task/:id`    | Retrieve task results    | Free    |
| POST   | `/v1/business/google/hotel-info`                 | Hotel info (Live)        | 0.1     |
| POST   | `/v1/business/google/hotel-info/task`            | Hotel info (Standard)    | 0.07    |
| GET    | `/v1/business/google/hotel-info/tasks-ready`     | Check ready tasks        | Free    |
| GET    | `/v1/business/google/hotel-info/task/:id`        | Retrieve task results    | Free    |

## Google Reviews

| Method | Path                                      | Description             | Credits |
| ------ | ----------------------------------------- | ----------------------- | ------- |
| POST   | `/v1/business/google/reviews/task`        | Submit reviews task     | 1.5     |
| GET    | `/v1/business/google/reviews/tasks-ready` | Check ready tasks       | Free    |
| GET    | `/v1/business/google/reviews/task/:id`    | Retrieve review results | Free    |

## Google Q\&A

| Method | Path                                                    | Description           | Credits |
| ------ | ------------------------------------------------------- | --------------------- | ------- |
| POST   | `/v1/business/google/questions-and-answers`             | Q\&A data (Live)      | 0.3     |
| POST   | `/v1/business/google/questions-and-answers/task`        | Q\&A data (Standard)  | 0.18    |
| GET    | `/v1/business/google/questions-and-answers/tasks-ready` | Check ready tasks     | Free    |
| GET    | `/v1/business/google/questions-and-answers/task/:id`    | Retrieve task results | Free    |

## Trustpilot

| Method | Path                                          | Description              | Credits |
| ------ | --------------------------------------------- | ------------------------ | ------- |
| POST   | `/v1/business/trustpilot/search/task`         | Search businesses        | 0.34    |
| GET    | `/v1/business/trustpilot/search/tasks-ready`  | Check ready search tasks | Free    |
| GET    | `/v1/business/trustpilot/search/task/:id`     | Retrieve search results  | Free    |
| POST   | `/v1/business/trustpilot/reviews/task`        | Submit reviews task      | 0.85    |
| GET    | `/v1/business/trustpilot/reviews/tasks-ready` | Check ready review tasks | Free    |
| GET    | `/v1/business/trustpilot/reviews/task/:id`    | Retrieve review results  | Free    |

## TripAdvisor

| Method | Path                                           | Description              | Credits |
| ------ | ---------------------------------------------- | ------------------------ | ------- |
| POST   | `/v1/business/tripadvisor/search/task`         | Search businesses        | 0.85    |
| GET    | `/v1/business/tripadvisor/search/tasks-ready`  | Check ready search tasks | Free    |
| GET    | `/v1/business/tripadvisor/search/task/:id`     | Retrieve search results  | Free    |
| POST   | `/v1/business/tripadvisor/reviews/task`        | Submit reviews task      | 1.25    |
| GET    | `/v1/business/tripadvisor/reviews/tasks-ready` | Check ready review tasks | Free    |
| GET    | `/v1/business/tripadvisor/reviews/task/:id`    | Retrieve review results  | Free    |

## Social Media

| Method | Path                            | Description                 | Credits |
| ------ | ------------------------------- | --------------------------- | ------- |
| POST   | `/v1/business/social/facebook`  | Facebook engagement metrics | 0.1     |
| POST   | `/v1/business/social/pinterest` | Pinterest pin counts        | 0.1     |
| POST   | `/v1/business/social/reddit`    | Reddit submission data      | 0.1     |

## Utility

| Method | Path                                 | Description                     | Credits |
| ------ | ------------------------------------ | ------------------------------- | ------- |
| GET    | `/v1/business/google/locations`      | Available Google locations      | Free    |
| GET    | `/v1/business/google/languages`      | Available Google languages      | Free    |
| GET    | `/v1/business/tripadvisor/locations` | Available TripAdvisor locations | Free    |
| GET    | `/v1/business/tripadvisor/languages` | Available TripAdvisor languages | Free    |
| POST   | `/v1/business/id-list`               | List task IDs                   | Free    |

## Examples

<CodeGroup>
  ```bash curl (Live — Google Business profile) theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/business/google/my-business-info \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "keyword": "pizza new york", "location_code": 1023191 }'
  ```

  ```bash curl (Standard — Trustpilot reviews) theme={"theme":"css-variables"}
  # enqueue
  curl -X POST https://api.usenaive.ai/v1/business/trustpilot/reviews/task \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "keyword": "example.com" }'
  # then poll tasks-ready and fetch task/:id
  ```

  ```bash curl (Live — social engagement) theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/business/social/facebook \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "targets": ["https://example.com"] }'
  ```
</CodeGroup>
