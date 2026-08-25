# Web Intelligence API (Firecrawl-compatible)

AVELIN exposes a web data layer — **scrape, search, map, crawl, and extract** — through
the same governed endpoint and API key you already use for chat and reasoning. The
surface is **drop-in compatible with the Firecrawl API and SDK**, so existing Firecrawl
integrations and agent frameworks work by changing only the host they point at.

Just as AVELIN is wire-compatible with the OpenAI and Anthropic formats for model calls,
it is wire-compatible with the Firecrawl v2 format for web access — one key, one bill,
one governed surface for both your models and the data they read.

---

## Why use it

- **One key, one bill.** No separate web-scraping account or second vendor. Web usage is
  authenticated, rate-limited, spend-tracked, and logged on the same AVELIN key as your
  model usage, under one invoice.
- **Drop-in SDK compatibility.** The official Firecrawl SDK and any tool built on it work
  unchanged — you only repoint the host at AVELIN. No code rewrite.
- **Governed and observable.** Every request runs through AVELIN's auth and policy layer,
  with per-key spend limits and full request logging, so web access is as auditable as
  model access.
- **Agent-ready.** Designed for retrieval and research agents that need live web content
  alongside reasoning — give an agent one AVELIN key and it can both think and read the
  web.

---

## Base URL

```
https://api.avelin.ai
```

The web endpoints are served under the `/v2` path prefix (mirroring the Firecrawl v2
API), unlike the model endpoints which live under `/v1`.

## Authentication

The same bearer token as the rest of the API:

```
Authorization: Bearer sk-avelin-xxxxxxxxxxxxxxxx
```

Request and response bodies follow the **Firecrawl v2** schema exactly — this is a
transparent compatibility surface, not a reshaped API. The full field reference for each
operation is the Firecrawl v2 API documentation; the sections below cover the common
fields and a representative response for each endpoint.

---

## Endpoints

### `POST /v2/scrape`

Fetch a single URL and return clean, model-ready content (markdown, HTML, links, and
metadata).

**Request**

```bash
curl https://api.avelin.ai/v2/scrape \
  -H "Authorization: Bearer sk-avelin-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown"]
  }'
```

**Common parameters**

| Field | Type | Description |
|---|---|---|
| `url` | string | The URL to scrape (required). |
| `formats` | array | Desired output formats, e.g. `["markdown"]`, `["html"]`, `["links"]`. |
| `onlyMainContent` | boolean | Strip nav, footers, and boilerplate (default `true`). |

**Response**

```json
{
  "success": true,
  "data": {
    "markdown": "# Example Domain\n\nThis domain is for use in documentation examples...",
    "metadata": {
      "title": "Example Domain",
      "statusCode": 200,
      "sourceURL": "https://example.com"
    }
  }
}
```

---

### `POST /v2/search`

Search the web and return ranked results; optionally scrape the result pages in the same
call.

**Request**

```bash
curl https://api.avelin.ai/v2/search \
  -H "Authorization: Bearer sk-avelin-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "vendor-neutral AI platforms",
    "limit": 5
  }'
```

**Common parameters**

| Field | Type | Description |
|---|---|---|
| `query` | string | The search query (required). |
| `limit` | integer | Maximum number of results (defaults to 5). |
| `scrapeOptions` | object | When set, scrapes each result and includes its content. |

**Response**

```json
{
  "success": true,
  "data": {
    "web": [
      {
        "url": "https://example.com/",
        "title": "Example Domain",
        "description": "Example Domain. This domain is for use in documentation examples...",
        "position": 1
      }
    ]
  }
}
```

---

### `POST /v2/map`

Discover the URLs on a site quickly — a fast link map without scraping each page.

**Request**

```bash
curl https://api.avelin.ai/v2/map \
  -H "Authorization: Bearer sk-avelin-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{ "url": "https://example.com" }'
```

**Response**

```json
{
  "success": true,
  "links": [
    { "url": "https://example.com/" }
  ]
}
```

---

### `POST /v2/crawl`

Start an asynchronous crawl of a site. Returns a job id; poll the crawl status endpoint
to retrieve results.

**Request**

```bash
curl https://api.avelin.ai/v2/crawl \
  -H "Authorization: Bearer sk-avelin-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "limit": 100
  }'
```

**Response**

```json
{
  "success": true,
  "id": "a1b2c3d4-....",
  "url": "https://api.avelin.ai/v2/crawl/a1b2c3d4-...."
}
```

---

### `POST /v2/extract`

Extract structured data from one or more URLs using a natural-language prompt or schema.
Asynchronous; returns a job id.

**Request**

```bash
curl https://api.avelin.ai/v2/extract \
  -H "Authorization: Bearer sk-avelin-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://example.com"],
    "prompt": "What is this page about?"
  }'
```

**Response**

```json
{
  "success": true,
  "id": "e5f6g7h8-...."
}
```

---

## Using the Firecrawl SDK

Because the surface matches the Firecrawl v2 API, the official SDK works by pointing its
host at AVELIN and using your AVELIN key. Set two environment variables:

```bash
export FIRECRAWL_API_URL=https://api.avelin.ai
export FIRECRAWL_API_KEY=sk-avelin-xxxxxxxxxxxxxxxx
```

```python
from firecrawl import Firecrawl

client = Firecrawl()  # reads FIRECRAWL_API_URL and FIRECRAWL_API_KEY

doc = client.scrape("https://example.com", formats=["markdown"])
print(doc.markdown)

results = client.search("vendor-neutral AI platforms", limit=5)
```

Any tool or agent framework that drives the Firecrawl SDK (for web search and page
reading) can be redirected to AVELIN the same way — set those two variables and its web
calls flow through your AVELIN key with unified billing and logging.

---

## Pricing

Web requests are billed per request to the calling key, alongside your model usage. See
[Pricing](../pricing.md#web-intelligence) for the current rates.

| Endpoint | Price (per request) |
|---|---|
| `POST /v2/scrape` | $0.001 |
| `POST /v2/map` | $0.001 |
| `POST /v2/search` | $0.005 |
| `POST /v2/crawl` | $0.010 |
| `POST /v2/extract` | $0.005 |

`crawl` and `extract` are asynchronous jobs; the per-request price is charged once when
the job is started.

---

## Related

- [API Reference](index.md) — chat, reasoning, embeddings, and more
- [Quickstart](quickstart.md) — your first AVELIN call
- [Pricing](../pricing.md) — full price list
