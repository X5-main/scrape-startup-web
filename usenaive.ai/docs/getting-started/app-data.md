> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Mobile App Data

> App rankings, reviews, and metadata from Google Play and the Apple App Store.

App Data is the primitive that gives your agent access to mobile application intelligence from Google Play and the Apple App Store. Search for apps by keyword, get detailed app metadata, collect user reviews, browse top charts, and search live app listings — all through a unified API. Most endpoints use the Standard (async) method; App Listings provides instant live results.

## CLI First

```bash theme={"theme":"css-variables"}
# Google Play app search
naive app-data google app-searches --keyword "fitness tracker" --location-code 2840

# Apple App Store listings
naive app-data apple app-listings --title "fitness" --location-code 2840 --language-code en
```

## Endpoints

| Endpoint     | Type     | Description                           | Speed           | Cost                    |
| ------------ | -------- | ------------------------------------- | --------------- | ----------------------- |
| app-searches | Standard | Search apps by keyword                | \~5-15s (async) | 0.85 credits            |
| app-list     | Standard | Top charts / category rankings        | \~5-15s (async) | 0.85 credits            |
| app-info     | Standard | Detailed app metadata and stats       | \~5-15s (async) | 0.05 credits            |
| app-reviews  | Standard | User reviews and ratings              | \~5-15s (async) | 6 credits               |
| app-listings | Live     | Search app listings — instant results | Fast (\~2s)     | 2.4 + 0.024 per listing |
| locations    | Meta     | Valid location codes for a platform   | Fast (\~1s)     | Free                    |
| languages    | Meta     | Valid language codes for a platform   | Fast (\~1s)     | Free                    |
| categories   | Meta     | App store category list               | Fast (\~1s)     | Free                    |
| id-list      | Utility  | List task IDs with status info        | Fast (\~1s)     | Free                    |

All Standard and Live endpoints are available for **both** Google Play and Apple App Store via the same route pattern: `/v1/app-data/{google|apple}/{endpoint}`.

## Google Play Endpoints

### Standard (Async) Endpoints

| Endpoint     | Route                                   | Description                                           |
| ------------ | --------------------------------------- | ----------------------------------------------------- |
| app-searches | `POST /v1/app-data/google/app-searches` | Search Google Play by keyword                         |
| app-list     | `POST /v1/app-data/google/app-list`     | Google Play top charts by category                    |
| app-info     | `POST /v1/app-data/google/app-info`     | Detailed app metadata (installs, rating, description) |
| app-reviews  | `POST /v1/app-data/google/app-reviews`  | User reviews with ratings and text                    |

### Live Endpoint

| Endpoint     | Route                                   | Description                                   |
| ------------ | --------------------------------------- | --------------------------------------------- |
| app-listings | `POST /v1/app-data/google/app-listings` | Search Google Play listings — instant results |

### Meta Endpoints

| Endpoint   | Route                                | Description                          |
| ---------- | ------------------------------------ | ------------------------------------ |
| locations  | `GET /v1/app-data/google/locations`  | Valid location codes for Google Play |
| languages  | `GET /v1/app-data/google/languages`  | Valid language codes for Google Play |
| categories | `GET /v1/app-data/google/categories` | Google Play category list            |

## Apple App Store Endpoints

### Standard (Async) Endpoints

| Endpoint     | Route                                  | Description                                        |
| ------------ | -------------------------------------- | -------------------------------------------------- |
| app-searches | `POST /v1/app-data/apple/app-searches` | Search App Store by keyword                        |
| app-list     | `POST /v1/app-data/apple/app-list`     | App Store top charts by category                   |
| app-info     | `POST /v1/app-data/apple/app-info`     | Detailed app metadata (rating, description, price) |
| app-reviews  | `POST /v1/app-data/apple/app-reviews`  | User reviews with ratings and text                 |

### Live Endpoint

| Endpoint     | Route                                  | Description                                 |
| ------------ | -------------------------------------- | ------------------------------------------- |
| app-listings | `POST /v1/app-data/apple/app-listings` | Search App Store listings — instant results |

### Meta Endpoints

| Endpoint   | Route                               | Description                        |
| ---------- | ----------------------------------- | ---------------------------------- |
| locations  | `GET /v1/app-data/apple/locations`  | Valid location codes for App Store |
| languages  | `GET /v1/app-data/apple/languages`  | Valid language codes for App Store |
| categories | `GET /v1/app-data/apple/categories` | App Store category list            |

## General Utility

| Endpoint | Route                       | Method | Description                               |
| -------- | --------------------------- | ------ | ----------------------------------------- |
| id-list  | `POST /v1/app-data/id-list` | POST   | List all task IDs with status information |

***

## Async Workflow (Standard Endpoints)

Standard endpoints use a three-step async pattern:

1. **Submit** a task via `POST /v1/app-data/{platform}/{endpoint}` — returns a task ID.
2. **Check** readiness via `GET /v1/app-data/{platform}/{endpoint}/tasks-ready` — returns ready task IDs.
3. **Retrieve** results via `GET /v1/app-data/{platform}/{endpoint}/:task_id` — returns full results.

Google Play standard endpoints also support an HTML format: `GET /v1/app-data/google/{endpoint}/:task_id/html`.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  # Step 1: Submit a search task
  curl -X POST https://api.usenaive.ai/v1/app-data/google/app-searches \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "keyword": "fitness tracker",
      "location_code": 2840,
      "language_code": "en",
      "depth": 50
    }'

  # Step 2: Check for ready tasks
  curl -G https://api.usenaive.ai/v1/app-data/google/app-searches/tasks-ready \
    -H "Authorization: Bearer nv_sk_your_key"

  # Step 3: Retrieve results (advanced format)
  curl -G https://api.usenaive.ai/v1/app-data/google/app-searches/TASK_ID \
    -H "Authorization: Bearer nv_sk_your_key"

  # Step 3 (alt): Retrieve results (HTML format — Google only)
  curl -G https://api.usenaive.ai/v1/app-data/google/app-searches/TASK_ID/html \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  // Step 1: Submit a search task
  const task = await fetch("https://api.usenaive.ai/v1/app-data/google/app-searches", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      keyword: "fitness tracker",
      location_code: 2840,
      language_code: "en",
      depth: 50,
    }),
  }).then((r) => r.json());

  // Step 2: Check for ready tasks
  const ready = await fetch(
    "https://api.usenaive.ai/v1/app-data/google/app-searches/tasks-ready",
    { headers: { "Authorization": "Bearer nv_sk_your_key" } },
  ).then((r) => r.json());

  // Step 3: Retrieve results
  const results = await fetch(
    `https://api.usenaive.ai/v1/app-data/google/app-searches/${task.task_id}`,
    { headers: { "Authorization": "Bearer nv_sk_your_key" } },
  ).then((r) => r.json());
  ```
</CodeGroup>

**Response (task submit):**

```json theme={"theme":"css-variables"}
{
  "task_id": "05241305-1535-0066-0000-c3a3f8e8e6a7",
  "status": "queued",
  "credits_used": 0.85
}
```

**Response (task get — app-searches):**

```json theme={"theme":"css-variables"}
{
  "task_id": "05241305-1535-0066-0000-c3a3f8e8e6a7",
  "status": "completed",
  "results": [
    {
      "title": "Fitbit: Health & Fitness",
      "app_id": "com.fitbit.FitbitMobile",
      "url": "https://play.google.com/store/apps/details?id=com.fitbit.FitbitMobile",
      "icon": "https://play-lh.googleusercontent.com/...",
      "rating": 3.8,
      "reviews_count": 1245000,
      "price": 0,
      "is_free": true,
      "rank_absolute": 1,
      "rank_group": 1
    },
    {
      "title": "Google Fit: Activity Tracking",
      "app_id": "com.google.android.apps.fitness",
      "rating": 4.1,
      "reviews_count": 890000,
      "price": 0,
      "is_free": true,
      "rank_absolute": 2,
      "rank_group": 2
    }
  ]
}
```

### Parameters (app-searches)

| Param           | Type   | Required | Default | Description                      |
| --------------- | ------ | -------- | ------- | -------------------------------- |
| `keyword`       | string | Yes      | —       | Search keyword                   |
| `location_code` | number | No       | —       | Location code (e.g. 2840 for US) |
| `language_code` | string | No       | —       | Language code (e.g. "en")        |
| `depth`         | number | No       | 100     | Number of results to retrieve    |

### When to use

* Finding apps that rank for a keyword on Google Play or App Store
* Competitive keyword research for ASO (App Store Optimization)
* Tracking which apps appear for your target keywords

***

## App Listings (Live)

Instant search across app listings — no async wait. Available for both platforms.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  # Google Play listings
  curl -X POST https://api.usenaive.ai/v1/app-data/google/app-listings \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "categories": ["HEALTH_AND_FITNESS"],
      "title": "fitness",
      "location_code": 2840,
      "language_code": "en"
    }'

  # App Store listings
  curl -X POST https://api.usenaive.ai/v1/app-data/apple/app-listings \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "categories": ["6013"],
      "title": "fitness",
      "location_code": 2840,
      "language_code": "en"
    }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  // Google Play listings
  const googleListings = await fetch("https://api.usenaive.ai/v1/app-data/google/app-listings", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      categories: ["HEALTH_AND_FITNESS"],
      title: "fitness",
      location_code: 2840,
      language_code: "en",
    }),
  }).then((r) => r.json());

  // App Store listings
  const appleListings = await fetch("https://api.usenaive.ai/v1/app-data/apple/app-listings", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      categories: ["6013"],
      title: "fitness",
      location_code: 2840,
      language_code: "en",
    }),
  }).then((r) => r.json());
  ```
</CodeGroup>

**Response (app-listings):**

```json theme={"theme":"css-variables"}
{
  "results": [
    {
      "title": "Strava: Run, Ride, Hike",
      "app_id": "com.strava",
      "url": "https://play.google.com/store/apps/details?id=com.strava",
      "icon": "https://play-lh.googleusercontent.com/...",
      "rating": 4.2,
      "reviews_count": 2340000,
      "installs_count": 100000000,
      "price": 0,
      "is_free": true,
      "category": "Health & Fitness",
      "developer": "Strava Inc.",
      "last_update_date": "2026-04-28"
    }
  ],
  "credits_used": 2.88
}
```

### Parameters (app-listings)

| Param           | Type      | Required | Default | Description              |
| --------------- | --------- | -------- | ------- | ------------------------ |
| `title`         | string    | No       | —       | Filter by app title      |
| `categories`    | string\[] | No       | —       | Filter by category codes |
| `location_code` | number    | No       | —       | Location code            |
| `language_code` | string    | No       | —       | Language code            |
| `limit`         | number    | No       | 100     | Max results              |
| `offset`        | number    | No       | 0       | Pagination offset        |
| `filters`       | array     | No       | —       | Filter conditions        |
| `order_by`      | array     | No       | —       | Sort order               |

### When to use

* Browsing apps in a category without waiting for async tasks
* Quick competitive scans of a market segment
* Finding apps by title or category in real time

***

## App Info

Retrieve detailed metadata for a specific app.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  # Google Play app info
  curl -X POST https://api.usenaive.ai/v1/app-data/google/app-info \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "app_id": "com.strava" }'

  # App Store app info
  curl -X POST https://api.usenaive.ai/v1/app-data/apple/app-info \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "app_id": "426826491" }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  // Google Play app info
  const googleApp = await fetch("https://api.usenaive.ai/v1/app-data/google/app-info", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ app_id: "com.strava" }),
  }).then((r) => r.json());

  // App Store app info
  const appleApp = await fetch("https://api.usenaive.ai/v1/app-data/apple/app-info", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ app_id: "426826491" }),
  }).then((r) => r.json());
  ```
</CodeGroup>

**Response (task get — app-info, Google Play):**

```json theme={"theme":"css-variables"}
{
  "task_id": "05241305-1535-0066-0000-d4b4g9f9f7b8",
  "status": "completed",
  "results": [
    {
      "app_id": "com.strava",
      "title": "Strava: Run, Ride, Hike",
      "url": "https://play.google.com/store/apps/details?id=com.strava",
      "description": "Track your running, cycling, and hiking activities...",
      "icon": "https://play-lh.googleusercontent.com/...",
      "rating": 4.2,
      "reviews_count": 2340000,
      "installs": "100,000,000+",
      "installs_count": 100000000,
      "price": 0,
      "is_free": true,
      "category": "Health & Fitness",
      "developer": "Strava Inc.",
      "developer_email": "support@strava.com",
      "minimum_os_version": "7.0",
      "size": "45M",
      "released_date": "2012-08-29",
      "last_update_date": "2026-04-28",
      "content_rating": "Everyone",
      "screenshots": [
        "https://play-lh.googleusercontent.com/screenshot1...",
        "https://play-lh.googleusercontent.com/screenshot2..."
      ]
    }
  ]
}
```

### Parameters (app-info)

| Param           | Type   | Required | Default | Description                                                                     |
| --------------- | ------ | -------- | ------- | ------------------------------------------------------------------------------- |
| `app_id`        | string | Yes      | —       | App package name (Google: "com.example.app") or numeric ID (Apple: "426826491") |
| `location_code` | number | No       | —       | Location code                                                                   |
| `language_code` | string | No       | —       | Language code                                                                   |

### When to use

* Getting full metadata for a specific app (installs, ratings, screenshots)
* Building competitive intelligence reports
* Monitoring app store listing changes over time

***

## Task Retrieval Formats

Google Play standard endpoints support two retrieval formats via the task-get URL:

| Format             | URL Pattern                                        | Description                        |
| ------------------ | -------------------------------------------------- | ---------------------------------- |
| Advanced (default) | `GET /v1/app-data/google/{endpoint}/:task_id`      | Structured JSON with parsed fields |
| HTML               | `GET /v1/app-data/google/{endpoint}/:task_id/html` | Raw HTML from the app store page   |

Apple App Store endpoints only support the advanced (default) format.

***

## Credit Costs

| Operation                    | Endpoints                                 | Cost                                                                                              |
| ---------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Task submission (task\_post) | app-searches                              | 0.85 credits                                                                                      |
| Task submission (task\_post) | app-list                                  | 0.85 credits                                                                                      |
| Task submission (task\_post) | app-info                                  | 0.05 credits                                                                                      |
| Task submission (task\_post) | app-reviews                               | 6 credits                                                                                         |
| Live                         | app-listings                              | 2.4 + 0.024 per listing returned — 2.88 at the default `limit` of 20, 26.4 at the maximum of 1000 |
| Task retrieval (task\_get)   | All standard endpoints                    | Free (included with submission)                                                                   |
| Tasks ready check            | All standard endpoints                    | Free                                                                                              |
| Meta / Utility               | locations, languages, categories, id-list | Free                                                                                              |

`app-listings` is metered rather than flat: the provider bills us per returned
item, so its price is computed from the request's own `limit` (1–1000, default
20\). `credits_used` on every response is the amount actually charged.

## Error Handling

| Error                  | Cause                                | Recovery                                                    |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------- |
| `insufficient_credits` | Not enough credits for the operation | Check balance with `GET /v1/status`                         |
| `invalid_platform`     | Unknown platform slug                | Use `"google"` or `"apple"`                                 |
| `invalid_app_id`       | Missing or malformed app identifier  | Provide a valid package name (Google) or numeric ID (Apple) |
| `task_not_found`       | Task ID doesn't exist or has expired | Resubmit the task                                           |
| `task_not_ready`       | Task is still processing             | Poll `tasks-ready` or wait and retry                        |
| `provider_error`       | Data provider returned an error      | Retry after a few seconds                                   |

<Tip>
  Google Play endpoints support HTML format for task retrieval — append `/html` to the task-get URL to receive raw app store HTML instead of parsed JSON. This is useful when you need the full page layout or want to extract fields not covered by the advanced format.
</Tip>

## Typical Workflow

```
Agent receives task: "Analyze our fitness app competitors"
    │
    ├─ POST /v1/app-data/google/app-searches              → Find competitor apps
    │   { keyword: "fitness tracker", location_code: 2840 }
    │   → Task ID returned
    │
    ├─ GET /v1/app-data/google/app-searches/:task_id       → Get search results
    │   → List of apps with rankings and ratings
    │
    ├─ POST /v1/app-data/google/app-info                   → Get full app details
    │   { app_id: "com.strava" }
    │   → Task ID → installs, rating, description, screenshots
    │
    ├─ POST /v1/app-data/google/app-reviews                → Read user reviews
    │   { app_id: "com.strava", depth: 100 }
    │   → Task ID → reviews with ratings and text
    │
    ├─ POST /v1/app-data/apple/app-listings                → Cross-platform check
    │   { title: "fitness tracker", categories: ["6013"] }
    │   → Instant App Store listing results
    │
    └─ POST /v1/app-data/apple/app-info                    → App Store details
        { app_id: "426826491" }
        → Task ID → price, rating, App Store metadata
```
