> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# E-commerce Data

> Product listings, pricing, sellers, and reviews from Google Shopping and Amazon.

E-commerce Data provides access to product information from Google Shopping and Amazon. Get product listings, detailed product info, seller data, pricing comparisons, and product reviews — all via async task-based endpoints. Results are available in both structured JSON and raw HTML formats.

## CLI First

```bash theme={"theme":"css-variables"}
# Google Shopping product search (async task)
naive ecommerce google products --keyword "wireless headphones" --location-code 2840 --language-code en

# Amazon product search
naive ecommerce amazon products --keyword "wireless headphones"
```

## Endpoints

| Platform        | Endpoint               | Description                        | Speed    | Cost         |
| --------------- | ---------------------- | ---------------------------------- | -------- | ------------ |
| Google Shopping | `products`             | Search product listings by keyword | Standard | 0.15 credits |
| Google Shopping | `product-info`         | Detailed product information       | Standard | 0.14 credits |
| Google Shopping | `sellers`              | Seller list for a product          | Standard | 0.24 credits |
| Google Shopping | `sellers/ad-url/:aclk` | Get ad click URL for a seller      | GET      | Free         |
| Google Shopping | `reviews`              | Product reviews with ratings       | Standard | 2.2 credits  |
| Google Shopping | `locations`            | Available location codes           | GET      | Free         |
| Google Shopping | `languages`            | Available language codes           | GET      | Free         |
| Amazon          | `products`             | Search product listings by keyword | Standard | 0.14 credits |
| Amazon          | `asin`                 | Get product info by ASIN           | Standard | 0.04 credits |
| Amazon          | `sellers`              | Seller list for a product          | Standard | 0.14 credits |
| Amazon          | `locations`            | Available location codes           | GET      | Free         |
| Amazon          | `languages`            | Available language codes           | GET      | Free         |
| General         | `id-list`              | List task IDs across all sub-APIs  | POST     | Free         |

All Standard endpoints use the async task workflow. Google Shopping Sellers Ad URL is a direct GET.

## Async Workflow

1. **Submit** via `POST /v1/ecommerce/{platform}/{endpoint}/task`
2. **Check** via `GET /v1/ecommerce/{platform}/{endpoint}/tasks-ready`
3. **Retrieve** via `GET /v1/ecommerce/{platform}/{endpoint}/task/:id`
4. **HTML format** via `GET /v1/ecommerce/{platform}/{endpoint}/task/:id/html`

## Google Shopping

Search products, get detailed info, compare sellers, and collect reviews.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  # Submit a Google Shopping product search (async)
  curl -X POST https://api.usenaive.ai/v1/ecommerce/google/products/task \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "keyword": "wireless headphones", "location_code": 2840, "language_code": "en" }'

  # Retrieve results once ready
  curl https://api.usenaive.ai/v1/ecommerce/google/products/task/abc123 \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  // Submit a Google Shopping product search
  const taskResponse = await fetch("https://api.usenaive.ai/v1/ecommerce/google/products/task", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ keyword: "wireless headphones", location_code: 2840, language_code: "en" }),
  });
  const { task_id } = await taskResponse.json();

  // Retrieve results
  const resultResponse = await fetch(
    `https://api.usenaive.ai/v1/ecommerce/google/products/task/${task_id}`,
    { headers: { "Authorization": "Bearer nv_sk_your_key" } }
  );
  const products = await resultResponse.json();
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "results": [
    {
      "title": "Sony WH-1000XM5 Wireless Headphones",
      "price": 278.00,
      "currency": "USD",
      "seller": "Amazon.com",
      "rating": 4.7,
      "review_count": 18432,
      "product_id": "12942301985732419751",
      "url": "https://www.google.com/shopping/product/12942301985732419751",
      "image_url": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:..."
    },
    {
      "title": "Apple AirPods Max",
      "price": 449.00,
      "currency": "USD",
      "seller": "Apple",
      "rating": 4.5,
      "review_count": 8291,
      "product_id": "10234567890123456789",
      "url": "https://www.google.com/shopping/product/10234567890123456789",
      "image_url": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:..."
    }
  ],
  "credits_used": 0.15
}
```

### Endpoints

| Endpoint               | Description                        | Routes                                     |
| ---------------------- | ---------------------------------- | ------------------------------------------ |
| `products`             | Search product listings by keyword | task, task/:id, task/:id/html, tasks-ready |
| `product-info`         | Detailed product information       | task, task/:id, task/:id/html, tasks-ready |
| `sellers`              | Seller list for a product          | task, task/:id, task/:id/html, tasks-ready |
| `sellers/ad-url/:aclk` | Get ad click URL for a seller      | GET (direct)                               |
| `reviews`              | Product reviews with ratings       | task, task/:id, task/:id/html, tasks-ready |

### Parameters

| Param           | Type   | Required | Default | Description                                             |
| --------------- | ------ | -------- | ------- | ------------------------------------------------------- |
| `keyword`       | string | Yes      | —       | Product search keyword                                  |
| `location_code` | number | No       | —       | Location code                                           |
| `language_code` | string | No       | —       | Language code (e.g. "en")                               |
| `depth`         | number | No       | 100     | Number of results to retrieve                           |
| `product_id`    | string | Varies   | —       | Product identifier (for product-info, sellers, reviews) |

### Sellers Ad URL

Resolve a Google Shopping ad click URL to the actual seller destination. This is a direct GET — no task workflow needed.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/ecommerce/google/sellers/ad-url/DChcSEwi_example_aclk \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch(
    "https://api.usenaive.ai/v1/ecommerce/google/sellers/ad-url/DChcSEwi_example_aclk",
    { headers: { "Authorization": "Bearer nv_sk_your_key" } }
  );
  const adUrl = await response.json();
  ```
</CodeGroup>

### When to use

* Comparing product prices across Google Shopping sellers
* Getting detailed product specifications and descriptions
* Collecting product reviews for market research
* Resolving ad click URLs to actual seller pages

## Amazon

Search products, look up by ASIN, and analyze sellers.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  # Submit an Amazon product search (async)
  curl -X POST https://api.usenaive.ai/v1/ecommerce/amazon/products/task \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "keyword": "bluetooth speaker", "location_code": 2840, "language_code": "en" }'

  # Look up a specific ASIN
  curl -X POST https://api.usenaive.ai/v1/ecommerce/amazon/asin/task \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "asin": "B0CX23V2ZK" }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  // Submit an Amazon product search
  const taskResponse = await fetch("https://api.usenaive.ai/v1/ecommerce/amazon/products/task", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ keyword: "bluetooth speaker", location_code: 2840, language_code: "en" }),
  });
  const { task_id } = await taskResponse.json();

  // Look up a specific ASIN
  const asinResponse = await fetch("https://api.usenaive.ai/v1/ecommerce/amazon/asin/task", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ asin: "B0CX23V2ZK" }),
  });
  const asinTask = await asinResponse.json();
  ```
</CodeGroup>

### Endpoints

| Endpoint   | Description                        | Routes                                     |
| ---------- | ---------------------------------- | ------------------------------------------ |
| `products` | Search product listings by keyword | task, task/:id, task/:id/html, tasks-ready |
| `asin`     | Get product info by ASIN           | task, task/:id, task/:id/html, tasks-ready |
| `sellers`  | Seller list for a product          | task, task/:id, task/:id/html, tasks-ready |

### Parameters

| Param           | Type   | Required | Default | Description                               |
| --------------- | ------ | -------- | ------- | ----------------------------------------- |
| `keyword`       | string | Yes      | —       | Product search keyword                    |
| `location_code` | number | No       | —       | Location code                             |
| `language_code` | string | No       | —       | Language code                             |
| `depth`         | number | No       | 100     | Number of results                         |
| `asin`          | string | Varies   | —       | Amazon ASIN (for asin, sellers endpoints) |

### When to use

* Researching Amazon product listings and rankings
* Monitoring competitor pricing and seller landscape
* Looking up detailed product info by ASIN
* Comparing sellers for a specific product

## HTML Format

All Standard endpoints support an HTML format option. Append `/html` to the task-get URL to receive the raw rendered page HTML instead of structured JSON:

```
GET /v1/ecommerce/{platform}/{endpoint}/task/:id       → Structured JSON
GET /v1/ecommerce/{platform}/{endpoint}/task/:id/html   → Raw HTML
```

Use HTML format when you need the full page layout, or when structured parsing misses data you need.

## Error Handling

| Error                  | Cause                            | Recovery                                   |
| ---------------------- | -------------------------------- | ------------------------------------------ |
| `insufficient_credits` | Not enough credits               | Check balance with `GET /v1/status`        |
| `invalid_platform`     | Unknown platform name            | Use "google" or "amazon"                   |
| `invalid_input`        | Invalid endpoint for platform    | Check available endpoints for the platform |
| `task_not_found`       | Task ID doesn't exist or expired | Resubmit the task                          |
| `provider_error`       | Data provider returned an error  | Retry after a few seconds                  |

<Tip>
  Use `tasks-ready` polling to efficiently batch-retrieve results instead of checking individual task statuses. All task-get endpoints support both JSON and HTML format — append `/html` for the raw rendered page.
</Tip>

## Typical Workflow

```
Agent receives task: "Compare headphone pricing across platforms"
    │
    ├─ POST /v1/ecommerce/google/products/task          → Search Google Shopping
    │   { keyword: "wireless headphones" }
    │   → Task ID returned (202)
    │
    ├─ POST /v1/ecommerce/amazon/products/task          → Search Amazon
    │   { keyword: "wireless headphones" }
    │   → Task ID returned (202)
    │
    ├─ GET /v1/ecommerce/google/products/tasks-ready    → Poll for ready tasks
    │   → List of completed task IDs
    │
    ├─ GET /v1/ecommerce/google/products/task/:id       → Get Google results
    │   → Product listings with prices, ratings, sellers
    │
    ├─ GET /v1/ecommerce/amazon/products/task/:id       → Get Amazon results
    │   → Product listings with prices, ratings, sellers
    │
    ├─ POST /v1/ecommerce/google/reviews/task           → Get product reviews
    │   { product_id: "12942301985732419751" }
    │   → Task ID returned
    │
    └─ GET /v1/ecommerce/google/sellers/ad-url/:aclk   → Resolve ad URL
        → Actual seller destination URL
```

## Credit Costs

| Operation                                             | Credits |
| ----------------------------------------------------- | ------- |
| Task submission — google products                     | 0.15    |
| Task submission — google product-info                 | 0.14    |
| Task submission — google sellers                      | 0.24    |
| Task submission — google reviews                      | 2.2     |
| Task submission — amazon products                     | 0.14    |
| Task submission — amazon asin                         | 0.04    |
| Task submission — amazon sellers                      | 0.14    |
| Sellers ad URL GET                                    | Free    |
| Meta endpoints (locations, languages)                 | Free    |
| Task retrieval (task/:id, task/:id/html, tasks-ready) | Free    |
| id-list                                               | Free    |
