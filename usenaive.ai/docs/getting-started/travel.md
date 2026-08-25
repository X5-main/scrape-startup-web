> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Travel

> Travel discovery and hotel intelligence from Google Hotels and TripAdvisor.

Travel is the primitive for discovering hotels, restaurants, and places across major travel datasets. Use it for destination discovery, hotel comparison, and place research workflows. Google hotel endpoints return live data instantly, while TripAdvisor search uses async task retrieval.

<Info>
  Travel is a use-case view over [Business Data](/docs/api-reference/business-data/overview) — there is no separate `/v1/travel` route. Every call below maps to a `/v1/business/...` endpoint (Google Hotels + TripAdvisor). There is no dedicated SDK sub-client; use the CLI (`naive business ...`) or the Business Data REST/MCP surface.
</Info>

## CLI First

```bash theme={"theme":"css-variables"}
# Search hotels (live)
naive business google hotel-searches --keyword "hotels manhattan" --location-code 2840

# Get specific hotel details (live)
naive business google hotel-info --hotel-id "ChIJN1t_tDeuEmsRUsoyG83frY4"

# Search TripAdvisor places (async)
naive business tripadvisor search --keyword "restaurants paris"
```

## Endpoints

| Platform      | Endpoint         | Description                                   | Speed            | Cost                           |
| ------------- | ---------------- | --------------------------------------------- | ---------------- | ------------------------------ |
| Google Hotels | `hotel-searches` | Search hotels by query + location             | Live             | 0.1 credits (0.07 via `/task`) |
| Google Hotels | `hotel-info`     | Detailed hotel data (profile/rates/amenities) | Live             | 0.1 credits (0.07 via `/task`) |
| TripAdvisor   | `search`         | Find places and listings                      | Standard (async) | 0.85 credits                   |

## Google Hotels (Live)

Google hotel endpoints return immediate results via:

* `POST /v1/business/google/hotel-searches`
* `POST /v1/business/google/hotel-info`

### Parameters

| Param              | Type   | Required               | Default | Description                            |
| ------------------ | ------ | ---------------------- | ------- | -------------------------------------- |
| `keyword`          | string | Yes (`hotel-searches`) | —       | Hotel search query                     |
| `hotel_identifier` | string | Yes (`hotel-info`)     | —       | Google hotel identifier (CID/place ID) |
| `location_code`    | number | No                     | —       | Location code                          |
| `language_code`    | string | No                     | —       | Language code                          |
| `check_in`         | string | No                     | —       | Check-in date (YYYY-MM-DD)             |
| `check_out`        | string | No                     | —       | Check-out date (YYYY-MM-DD)            |
| `adults`           | number | No                     | —       | Number of adults                       |

## TripAdvisor Search (Async)

TripAdvisor discovery uses async workflow:

1. **Submit** via `POST /v1/business/tripadvisor/search/task`
2. **Check** via `GET /v1/business/tripadvisor/search/tasks-ready`
3. **Retrieve** via `GET /v1/business/tripadvisor/search/task/:id`

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  # Step 1: Submit search task
  curl -X POST https://api.usenaive.ai/v1/business/tripadvisor/search/task \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "keyword": "hotels lisbon", "location_code": 2840 }'

  # Step 2: Check ready tasks
  curl https://api.usenaive.ai/v1/business/tripadvisor/search/tasks-ready \
    -H "Authorization: Bearer nv_sk_your_key"

  # Step 3: Retrieve results
  curl https://api.usenaive.ai/v1/business/tripadvisor/search/task/TASK_ID \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const submit = await fetch("https://api.usenaive.ai/v1/business/tripadvisor/search/task", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ keyword: "hotels lisbon", location_code: 2840 }),
  }).then((r) => r.json());

  const ready = await fetch(
    "https://api.usenaive.ai/v1/business/tripadvisor/search/tasks-ready",
    { headers: { "Authorization": "Bearer nv_sk_your_key" } },
  ).then((r) => r.json());

  const results = await fetch(
    `https://api.usenaive.ai/v1/business/tripadvisor/search/task/${submit.task_id}`,
    { headers: { "Authorization": "Bearer nv_sk_your_key" } },
  ).then((r) => r.json());
  ```
</CodeGroup>

## Typical Workflow

```
Agent receives task: "Find mid-range hotels in Lisbon"
    │
    ├─ POST /v1/business/google/hotel-searches
    │   { keyword: "hotels lisbon", location_code: 2840 }
    │   → Immediate hotel candidates
    │
    ├─ POST /v1/business/google/hotel-info
    │   { hotel_identifier: "<selected-hotel-id>" }
    │   → Detailed profile and rates
    │
    └─ POST /v1/business/tripadvisor/search/task
        { keyword: "hotels lisbon" }
        → Broader place discovery from TripAdvisor
```
