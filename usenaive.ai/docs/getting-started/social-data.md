> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Social Data

> Read public posts, comment threads and transcripts from X, Reddit, Instagram, TikTok, YouTube, Bluesky and Hacker News behind one normalized shape.

Social Data **reads** public posts. Two operations:

* **`discover`** — search a platform by keyword. *"What is being said about this?"*
* **`collect`** — fetch posts you already have ids for, optionally with their comment threads.

<Note>
  **Not the [Social](/docs/getting-started/social) primitive.** That one *publishes* to accounts
  you own and needs a connected account. This one only reads what is already public, and
  shares none of its routes.
</Note>

## Platforms

| Platform     | Provider                      | Credential        | Sync?               | `discover` searches | Comments | Transcripts |
| ------------ | ----------------------------- | ----------------- | ------------------- | ------------------- | -------- | ----------- |
| `bluesky`    | the platform's own public API | none              | yes                 | full text           | no       | no          |
| `hackernews` | the platform's own public API | none              | yes                 | full text           | yes      | no          |
| `x`          | Apify actor                   | `APIFY_API_TOKEN` | yes                 | full text           | no       | no          |
| `reddit`     | Apify actor                   | `APIFY_API_TOKEN` | **no — batch only** | full text           | yes      | no          |
| `instagram`  | Apify actor                   | `APIFY_API_TOKEN` | **no — batch only** | hashtag or profile  | yes      | no          |
| `tiktok`     | Apify actor                   | `APIFY_API_TOKEN` | **no — batch only** | keyword or hashtag  | yes      | no          |
| `youtube`    | Apify actor                   | `APIFY_API_TOKEN` | **no — batch only** | keyword             | yes      | **yes**     |

`linkedin` is in the shared platform union because the schema is shared with the posting
primitive, and is rejected at the routing layer rather than silently returning nothing.

An unsupported combination is **refused with `invalid_input` before the provider runs** —
never served thinner at the same price. Asking Bluesky for comments or TikTok for a
transcript is an error, not a quiet omission, because a caller cannot tell an empty
`comments` array caused by a post with no replies from one caused by a platform that never
had the capability.

### `query` does not mean the same thing everywhere

Search is what each platform gives us, and no amount of normalizing changes that. On X,
Reddit, Bluesky and Hacker News a `query` is full-text search. On Instagram there is no
public post search: a `query` is a **hashtag** (`#agents`) or a **profile** (`@openai`), and
which one is inferred from the prefix. It is read as that exact tag or profile — `ai agents`
reads `#aiagents`, not a ranked search for the phrase — so a query returns the same feed
every time rather than whatever a search engine ranked first. On TikTok and YouTube it is the platform's own
keyword search. Same field, honestly different reach — which is why the response always
names the platform it came from.

### Four platforms are asynchronous only

A live Reddit run took **53 to 219 seconds to return five posts**, and Instagram, TikTok and
YouTube drive a headless browser per post. That is not a slow sync case, it is a timeout —
and the expensive shape of one, because the actor run bills and the settle completes while
the client has already given up and retried. So both sync entry points refuse all four
outright, in `discover` as well as `collect`, and the refusal names the route that works:

```json theme={"theme":"css-variables"}
{
  "error": { "code": "invalid_input", "message": "Reddit reads are asynchronous only" },
  "hint": "Submit POST /v1/social-data/tasks with {\"platform\":\"reddit\",\"mode\":\"collect\"} …",
  "details": { "platform": "reddit", "sync_platforms": ["x", "bluesky", "hackernews"] }
}
```

The CLI and the SDK refuse it before the request leaves the process, and `naive_social_*`
MCP tools do not list any of the four as a sync option at all.

## CLI first

```bash theme={"theme":"css-variables"}
# Search public posts
naive social-data discover --platform x --query "ai agents" --limit 25
naive social-data discover --platform hackernews --query "postgres" --engagement-min 50

# Fetch known posts, with their comment threads
naive social-data collect --platform hackernews --post-ids 38975000,38975001 --include-comments

# Reddit, Instagram, TikTok, YouTube — batch only, in either mode
naive social-data batch --platform reddit --mode discover --query "self hosting" --limit 200
naive social-data batch --platform instagram --mode discover --query "#aiagents" --limit 100
naive social-data batch --platform tiktok --mode collect --post-ids 7301...,7302... --include-comments
naive social-data batch --platform youtube --mode discover --query "agent frameworks" --include-transcript
naive social-data task <task-id>

# Governance surfaces, both free
naive social-data terms
naive social-data erase --handle someone
```

## Operations

| Operation  | Endpoint                                   | Cost (scraped platforms) | Cost (Bluesky / HN)   |
| ---------- | ------------------------------------------ | ------------------------ | --------------------- |
| `discover` | `POST /v1/social-data/{platform}/discover` | 3× provider spend        | 1 credit / 100 posts  |
| `collect`  | `POST /v1/social-data/{platform}/collect`  | 3× provider spend        | 1, or 2 with comments |
| `batch`    | `POST /v1/social-data/tasks`               | 3× provider spend        | same block rate       |
| `terms`    | `GET /v1/social-data/terms`                | free                     | free                  |
| `erasure`  | `POST /v1/social-data/erasure`             | free                     | free                  |

### The scraped platforms bill what they cost, tripled

X, Reddit, Instagram, TikTok and YouTube run through a metered provider, and the meter is
**3× the provider spend the run actually incurred** — not a per-record list price. So a
20-post Instagram read costs what 20 Instagram rows cost, tripled, and a big YouTube job
costs proportionally more instead of paying a block rate that guessed wrong in one direction
or the other. `provider_usd`, whether it was the run's actual figure or a projection, and the
multiplier applied are all recorded on the ledger entry behind every charge.

* **An empty result is still billed**, because the run happened and we were invoiced for it.
  Scraped search is uneven — the same Reddit query can return three posts or none for the same
  money — and absorbing that would make an empty answer the cheapest thing to ask for.
* **A provider failure is not billed**: the settle happens after output exists.
* **Non-zero charges are at least 0.1 credits**, the platform-wide minimum.

Before the run, a *projection* from the actor's own listed per-event price is reserved
against your balance, so an unaffordable job is refused rather than half-run.

Bluesky and Hacker News keep a **flat rate per block of 100 posts, rounded up**, because
there is no vendor invoice to multiply — they are the platforms' own free read APIs. The rate
is keyed on the resolved **provider**, not the platform, so adding a paid provider for one
of them later cannot inherit the free price. Not free at all, deliberately: an unmetered
endpoint is an unmetered abuse surface.

Filters run after the provider does, so they narrow what you receive without narrowing the
bill — the run cost what it cost.

## discover

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/social-data/x/discover \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{"query": "ai agents", "limit": 25, "filters": {"engagement_min": 100}}'
  ```

  ```typescript sdk theme={"theme":"css-variables"}
  const { data } = await naive.socialData.discover("x", "ai agents", {
    limit: 25,
    filters: { engagement_min: 100 },
  });
  ```
</CodeGroup>

Filters are `date_from` (ISO 8601) and `engagement_min`. `limit` caps at 100 — above that,
use `POST /v1/social-data/tasks`.

## collect

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/social-data/hackernews/collect \
  -H "Authorization: Bearer nv_sk_your_key" \
  -H "Content-Type: application/json" \
  -d '{"post_ids": ["38975000", "38975001"], "include_comments": true}'
```

`include_comments` fetches reply threads. It costs more because it fetches more rows, and on
the scraped platforms that shows up directly in the provider spend the charge is derived
from. It is **not supported everywhere**, and where it is not it is refused rather than
billed at the higher rate for posts that would arrive without replies:

| Platform     | `include_comments`                                                          |
| ------------ | --------------------------------------------------------------------------- |
| `hackernews` | yes — threads flattened, up to 3 levels deep                                |
| `reddit`     | yes (batch only)                                                            |
| `instagram`  | yes (batch only)                                                            |
| `tiktok`     | yes (batch only)                                                            |
| `youtube`    | yes (batch only) — a second actor, so comments are billed as their own rows |
| `bluesky`    | refused — replies are a separate thread fetch                               |
| `x`          | refused — replies are a separate query the actor does not run               |

### include\_transcript — YouTube only

`include_transcript` returns the video's caption track as plain text on the post, which is
what makes YouTube a *text* source rather than a metadata source: a 40-minute talk becomes
something [Brain](/docs/getting-started/brain) can answer from and [Clips](/docs/getting-started/clips)
can cut against.

It is refused on every other platform. TikTok's provider can transcribe, but it bills per
**minute** of audio rather than per row — a price this primitive's per-row spend derivation
would systematically under-project — so it is not exposed rather than exposed and
mis-metered. YouTube's captions arrive as part of the same billed result, at no extra event
cost.

```bash theme={"theme":"css-variables"}
naive social-data batch --platform youtube --mode collect \
  --post-ids dQw4w9WgXcQ --include-transcript
```

A video with captions disabled returns the post without a transcript. That is a property of
the video, not an error, and it is not charged differently.

## One shape, seven platforms

```json theme={"theme":"css-variables"}
{
  "data": [
    {
      "id": "1745...",
      "platform": "x",
      "author": "someone",
      "text": "…",
      "url": "https://x.com/someone/status/1745…",
      "created_at": "2026-02-01T12:00:00Z",
      "metrics": { "likes": 412, "retweets": 55, "comments_count": 18 },
      "comments": []
    }
  ],
  "credits_used": 10,
  "credits_remaining": 4990,
  "provider": "apify"
}
```

`metrics.comments_count` is present everywhere; `retweets` is X-only, `upvotes` is
Reddit-only, and `views`/`plays` arrive on the video platforms — absent rather than zeroed
elsewhere, so you can tell "none" from "not measured". Anything the canonical schema does
not model stays available under `raw`, which is where an Instagram carousel's children or a
TikTok's music metadata live.

`provider` reports which vendor actually served the call — `apify`, `bluesky` or
`hackernews`.

### prefer\_official

Kept in the request contract and still meaningful. For Bluesky and Hacker News it is
already satisfied — those *are* the official APIs. For X, Reddit, Instagram, TikTok and YouTube it is
**refused explicitly**, because claiming a ToS-clean route that does not exist would be
worse than saying so.

## Batch

`POST /v1/social-data/tasks` accepts either mode:

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/social-data/tasks \
  -H "Authorization: Bearer nv_sk_your_key" \
  -H "Content-Type: application/json" \
  -d '{"platform": "reddit", "mode": "discover", "query": "self hosting", "limit": 500}'
```

`mode: "discover"` requires `query`; `mode: "collect"` requires `post_ids`. Up to
`PRIMITIVE_BATCH_MAX` posts (1,000 by default). Returns 202 — poll
`GET /v1/social-data/tasks/{id}`. Results are pruned at 90 days.

## Retries and double-charging

Send an `Idempotency-Key` header on `discover` and `collect`. It deduplicates the response
and becomes the credit-ledger reference, so a retried call is not billed twice.

## Acceptable use

`GET /v1/social-data/terms` returns the prohibitions as JSON. Public does not mean
unrestricted: posts are personal data, and you are the controller of what you retain.

You may not use this primitive to build a personal profile of an individual, to monitor
people rather than topics, to identify or track individuals on sensitive characteristics,
or to feed employment, credit, insurance or housing decisions. Each platform's own terms
continue to apply to what you do with its content.

## Retention and erasure

Sync `discover` and `collect` store nothing. Async batch results are the only store, pruned
at 90 days.

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/social-data/erasure \
  -H "Authorization: Bearer nv_sk_your_key" \
  -d '{"handle": "someone"}'
```

Erasure accepts a `handle`, `email` or `linkedin` and is unmetered.

<Warning>
  Erasure clears a subject from **Naive's** stored results only. The posts remain public on
  the platform, and a later collection of the same thread would return them again.
</Warning>

## Related

* [Social](/docs/getting-started/social) — publishing to accounts you own
* [People](/docs/getting-started/people) — B2B people search and enrichment
* [Reviews & Listings](/docs/getting-started/business-places) — local listings and reviews
* [Data primitive status](/docs/getting-started/data-primitives-status) — what is verified live and what is not
