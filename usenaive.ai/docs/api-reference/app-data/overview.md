> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# App Data API Reference

> All App Data REST endpoints — Google Play and App Store.

## Overview

Company-scoped; requires `Authorization: Bearer nv_sk_…`. Pay-per-use via our data provider.

Credits are charged on the Standard task **submission** (app-searches 0.85,
app-list 0.85, app-info 0.05, app-reviews 6) — `tasks-ready` and `…/:task_id`
are free. Live `app-listings` is metered on the request's `limit`: 2.4 credits +
0.024 per listing returned (2.88 at the default limit of 20, 26.4 at the maximum
of 1000). See [App Data credit costs](/docs/getting-started/app-data#credit-costs).

Most App Data endpoints are **Standard (async)**: POST the search/info/reviews request to enqueue a task, poll `…/tasks-ready`, then fetch `…/:task_id` (some also offer `…/:task_id/html`). The `app-listings` route is **Live** (instant). Agents can also use `naive_app_data_discover` + `naive_app_data_execute(_async)` over MCP.

Common params: `keyword: string` (search), `app_id: string` (info/reviews — package name for Google Play, numeric ID for App Store), optional `location_code`, `language_code`, `depth`, and `sort_by` (reviews).

## Google Play

| Method | Path                                             | Description                 |
| ------ | ------------------------------------------------ | --------------------------- |
| POST   | `/v1/app-data/google/app-searches`               | Submit app search task      |
| GET    | `/v1/app-data/google/app-searches/tasks-ready`   | Check ready search tasks    |
| GET    | `/v1/app-data/google/app-searches/:task_id`      | Get search results          |
| GET    | `/v1/app-data/google/app-searches/:task_id/html` | Get search results (HTML)   |
| POST   | `/v1/app-data/google/app-list`                   | Submit top charts task      |
| GET    | `/v1/app-data/google/app-list/tasks-ready`       | Check ready list tasks      |
| GET    | `/v1/app-data/google/app-list/:task_id`          | Get list results            |
| GET    | `/v1/app-data/google/app-list/:task_id/html`     | Get list results (HTML)     |
| POST   | `/v1/app-data/google/app-info`                   | Submit app info task        |
| GET    | `/v1/app-data/google/app-info/tasks-ready`       | Check ready info tasks      |
| GET    | `/v1/app-data/google/app-info/:task_id`          | Get app info results        |
| GET    | `/v1/app-data/google/app-info/:task_id/html`     | Get app info results (HTML) |
| POST   | `/v1/app-data/google/app-reviews`                | Submit app reviews task     |
| GET    | `/v1/app-data/google/app-reviews/tasks-ready`    | Check ready review tasks    |
| GET    | `/v1/app-data/google/app-reviews/:task_id`       | Get review results          |
| GET    | `/v1/app-data/google/app-reviews/:task_id/html`  | Get review results (HTML)   |
| POST   | `/v1/app-data/google/app-listings`               | Search app listings (Live)  |
| GET    | `/v1/app-data/google/locations`                  | Available locations         |
| GET    | `/v1/app-data/google/languages`                  | Available languages         |
| GET    | `/v1/app-data/google/categories`                 | Available categories        |

## App Store

| Method | Path                                          | Description                |
| ------ | --------------------------------------------- | -------------------------- |
| POST   | `/v1/app-data/apple/app-searches`             | Submit app search task     |
| GET    | `/v1/app-data/apple/app-searches/tasks-ready` | Check ready search tasks   |
| GET    | `/v1/app-data/apple/app-searches/:task_id`    | Get search results         |
| POST   | `/v1/app-data/apple/app-list`                 | Submit top charts task     |
| GET    | `/v1/app-data/apple/app-list/tasks-ready`     | Check ready list tasks     |
| GET    | `/v1/app-data/apple/app-list/:task_id`        | Get list results           |
| POST   | `/v1/app-data/apple/app-info`                 | Submit app info task       |
| GET    | `/v1/app-data/apple/app-info/tasks-ready`     | Check ready info tasks     |
| GET    | `/v1/app-data/apple/app-info/:task_id`        | Get app info results       |
| POST   | `/v1/app-data/apple/app-reviews`              | Submit app reviews task    |
| GET    | `/v1/app-data/apple/app-reviews/tasks-ready`  | Check ready review tasks   |
| GET    | `/v1/app-data/apple/app-reviews/:task_id`     | Get review results         |
| POST   | `/v1/app-data/apple/app-listings`             | Search app listings (Live) |
| GET    | `/v1/app-data/apple/locations`                | Available locations        |
| GET    | `/v1/app-data/apple/languages`                | Available languages        |
| GET    | `/v1/app-data/apple/categories`               | Available categories       |

## Utility

| Method | Path                   | Description   |
| ------ | ---------------------- | ------------- |
| POST   | `/v1/app-data/id-list` | List task IDs |

## Example (async flow)

```bash theme={"theme":"css-variables"}
# 1. Enqueue a Google Play search task
curl -X POST https://api.usenaive.ai/v1/app-data/google/app-searches \
  -H "Authorization: Bearer nv_sk_your_key" \
  -H "Content-Type: application/json" \
  -d '{ "keyword": "fitness tracker", "location_code": 2840, "language_code": "en" }'

# 2. Poll for ready tasks
curl https://api.usenaive.ai/v1/app-data/google/app-searches/tasks-ready \
  -H "Authorization: Bearer nv_sk_your_key"

# 3. Fetch results by task id
curl https://api.usenaive.ai/v1/app-data/google/app-searches/TASK_ID \
  -H "Authorization: Bearer nv_sk_your_key"
```
