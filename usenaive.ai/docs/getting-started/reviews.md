> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Reviews

> Reputation and review intelligence from Google, Trustpilot, TripAdvisor, and social engagement signals.

Reviews is the primitive for reputation analysis across major review ecosystems. Use it to monitor customer sentiment, compare competitors, track rating changes, and correlate review trends with social engagement.

<Info>
  Reviews is a use-case view over [Business Data](/docs/api-reference/business-data/overview) — there is no separate `/v1/reviews` route. Every call below maps to a `/v1/business/...` endpoint (Google/Trustpilot/TripAdvisor reviews + social engagement). There is no dedicated SDK sub-client; use the CLI (`naive business ...`) or the Business Data REST/MCP surface.
</Info>

## CLI First

```bash theme={"theme":"css-variables"}
# Google business profile + review summary (live)
naive business google my-business-info --keyword "pizza new york" --location-code 1023191

# Trustpilot reviews (async)
naive business trustpilot reviews --domain "example.com"

# TripAdvisor reviews (async)
naive business tripadvisor reviews --url-path "Restaurant_Review-g60763-d12345-..."

# Social engagement metrics (live)
naive business social facebook --targets "https://example.com,https://blog.example.com"
```

## Endpoints

| Platform           | Endpoint                            | Description                               | Speed            | Cost                            |
| ------------------ | ----------------------------------- | ----------------------------------------- | ---------------- | ------------------------------- |
| Google My Business | `my-business-info`                  | Business profile details + rating context | Live             | 0.13 credits (0.09 via `/task`) |
| Google My Business | `my-business-updates`               | Recent posts and updates on a profile     | Standard (async) | 3 credits                       |
| Google Reviews     | `reviews`                           | Business review text and ratings          | Standard (async) | 1.5 credits                     |
| Google Q\&A        | `questions-and-answers`             | Business profile Q\&A content             | Live             | 0.3 credits (0.18 via `/task`)  |
| Trustpilot         | `search`                            | Discover businesses on Trustpilot         | Standard (async) | 0.34 credits                    |
| Trustpilot         | `reviews`                           | Retrieve domain reviews                   | Standard (async) | 0.85 credits                    |
| TripAdvisor        | `search`                            | Discover places and listings              | Standard (async) | 0.85 credits                    |
| TripAdvisor        | `reviews`                           | Retrieve listing reviews                  | Standard (async) | 1.25 credits                    |
| Social Media       | `facebook` / `pinterest` / `reddit` | URL-level engagement metrics              | Live             | 0.1 credits                     |

## Google Reputation Endpoints

| Endpoint                | Route                                            | Method           |
| ----------------------- | ------------------------------------------------ | ---------------- |
| `my-business-info`      | `POST /v1/business/google/my-business-info`      | Live             |
| `reviews`               | `POST /v1/business/google/reviews/task`          | Standard (async) |
| `questions-and-answers` | `POST /v1/business/google/questions-and-answers` | Live             |

### Parameters

| Param           | Type   | Required | Default        | Description              |
| --------------- | ------ | -------- | -------------- | ------------------------ |
| `keyword`       | string | Yes      | —              | Business query/name      |
| `location_code` | number | No       | —              | Location code            |
| `language_code` | string | No       | —              | Language code            |
| `depth`         | number | No       | 100            | Review depth (`reviews`) |
| `sort_by`       | string | No       | most\_relevant | Sort mode (`reviews`)    |

## Trustpilot + TripAdvisor (Async)

Both providers use submit/check/retrieve task flow:

1. **Submit** `POST /v1/business/{platform}/{endpoint}/task`
2. **Check** `GET /v1/business/{platform}/{endpoint}/tasks-ready`
3. **Retrieve** `GET /v1/business/{platform}/{endpoint}/task/:id`

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  # Trustpilot reviews
  curl -X POST https://api.usenaive.ai/v1/business/trustpilot/reviews/task \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "domain": "example.com" }'

  # TripAdvisor reviews
  curl -X POST https://api.usenaive.ai/v1/business/tripadvisor/reviews/task \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "url_path": "Restaurant_Review-g60763-d12345-..." }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const trustpilotTask = await fetch("https://api.usenaive.ai/v1/business/trustpilot/reviews/task", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ domain: "example.com" }),
  }).then((r) => r.json());

  const tripadvisorTask = await fetch("https://api.usenaive.ai/v1/business/tripadvisor/reviews/task", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url_path: "Restaurant_Review-g60763-d12345-..." }),
  }).then((r) => r.json());
  ```
</CodeGroup>

## Social Engagement Endpoints (Live)

| Platform  | Route                                | Purpose                                 |
| --------- | ------------------------------------ | --------------------------------------- |
| Facebook  | `POST /v1/business/social/facebook`  | Likes, shares, comments for target URLs |
| Pinterest | `POST /v1/business/social/pinterest` | Pin counts for target URLs              |
| Reddit    | `POST /v1/business/social/reddit`    | Submission metrics for target URLs      |

Request body for all platforms:

```json theme={"theme":"css-variables"}
{
  "targets": ["https://example.com", "https://blog.example.com"]
}
```

## Typical Workflow

```
Agent receives task: "Audit our online reputation"
    │
    ├─ POST /v1/business/google/my-business-info
    │   { keyword: "brand name city" }
    │   → Ratings baseline and business profile
    │
    ├─ POST /v1/business/google/reviews/task
    │   { keyword: "brand name city" }
    │   → Google review task ID
    │
    ├─ POST /v1/business/trustpilot/reviews/task
    │   { domain: "brand.com" }
    │   → Trustpilot task ID
    │
    ├─ POST /v1/business/tripadvisor/reviews/task
    │   { url_path: "Restaurant_Review-..." }
    │   → TripAdvisor task ID
    │
    └─ POST /v1/business/social/facebook
        { targets: ["https://brand.com"] }
        → Engagement context alongside reviews
```
