> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Social Data API Reference

> All Social Data REST endpoints — public post discovery and collection on X, Reddit, Instagram, TikTok, YouTube, Bluesky and Hacker News.

## Overview

Company-scoped; requires `Authorization: Bearer nv_sk_…`. **Read-only**, and distinct from
the [Social](/docs/getting-started/social) primitive, which publishes to accounts you own.

Scraped platforms (X, Reddit, Instagram, TikTok, YouTube) bill 3× the provider run's real
spend, empty results included; failed runs are never billed. Bluesky and Hacker News keep a
flat 1 credit (2 with comments) per block of 100 posts — they are the platforms' own free APIs
and need no credential. Send
`Idempotency-Key` on `discover` and `collect`. MCP equivalents are `naive_social_data_*` —
NOT `naive_social_*`, which is the posting primitive.

## Endpoints

| Method | Path                                 | Description                                                                                               |
| ------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| POST   | `/v1/social-data/:platform/discover` | Keyword search — `bluesky`, `hackernews`, `x` (limit ≤ 100)                                               |
| POST   | `/v1/social-data/:platform/collect`  | Fetch posts by id, optionally with comment threads                                                        |
| POST   | `/v1/social-data/tasks`              | Async read, `mode: discover \| collect` — the only route to `reddit`, `instagram`, `tiktok` and `youtube` |
| GET    | `/v1/social-data/tasks/:id`          | Task status and, once complete, the posts                                                                 |
| GET    | `/v1/social-data/terms`              | Acceptable-use terms as JSON (unmetered)                                                                  |
| POST   | `/v1/social-data/erasure`            | Data-subject erasure by `handle`, `email` or `linkedin` (unmetered)                                       |

## Notes

* **`reddit`, `instagram`, `tiktok` and `youtube` are asynchronous only** — all four, not
  Reddit alone. Both sync routes refuse them with `invalid_input` and a hint naming
  `/v1/social-data/tasks`. A live Reddit run took 53–219 seconds for five posts; the three
  video platforms render pages behind anti-bot defences and have never been timed here, and
  shipping a sync path whose latency is unmeasured is how a primitive ships 504s. The list is
  `ASYNC_ONLY_PLATFORMS` and it shrinks as each platform is timed live, so the synchronous
  set is whatever `details.sync_platforms` on that refusal reports.
* `include_comments` is refused on `bluesky` and `x`: replies are a separate fetch neither
  adapter performs, and billing the higher rate for posts without replies would be wrong.
* `prefer_official` is already satisfied for `bluesky` and `hackernews` and refused with
  `feature_not_configured` for all five scraped platforms — `x`, `reddit`, `instagram`,
  `tiktok` and `youtube` — where no official-API adapter exists.
* `linkedin` is in the shared platform union (the schema is shared with the posting
  primitive) and rejected at the routing layer.
