> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# GEO/AEO

> AI search optimization data - LLM responses, mentions tracking, AI keyword volume, and ChatGPT scraping.

AEO (Answer Engine Optimization) gives your agent tools to understand and optimize for AI search. Track how LLMs like ChatGPT, Claude, Gemini, and Perplexity respond to queries, monitor brand mentions in AI responses, scrape ChatGPT Search results with citations, and analyze AI search volume trends.

## CLI First

```bash theme={"theme":"css-variables"}
# LLM response check
naive aeo llm-responses chatgpt --keyword "best project management software 2026"

# LLM mentions tracking
naive aeo llm-mentions search --keyword "project management software"

# AI keyword volume
naive aeo ai-keywords --keywords "project management software"
```

## SDK

```ts theme={"theme":"css-variables"}
import { Naive } from "@usenaive-sdk/server";
const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

// Your own account, or a tenant via naive.forUser(id).aeo
await naive.aeo.llmResponses("chatgpt", { user_prompt: "best project management software 2026", model_name: "gpt-4o-mini" });
await naive.aeo.aiKeywords({ keywords: ["project management software"] });
await naive.aeo.llmMentions("search", { /* params */ });
```

Per-user and AccountKit-gated; usage is metered against the tenant's plan (see [Customer Billing](/docs/getting-started/customer-billing)). Full surface in the [`aeo` sub-client](/docs/sdk/sub-clients/aeo); also available to agents via [`agentTools()`](/docs/sdk/agent-tools).

## Endpoints

| API           | Endpoint                                             | Description                                            | Speed          | Cost                    |
| ------------- | ---------------------------------------------------- | ------------------------------------------------------ | -------------- | ----------------------- |
| LLM Responses | `POST /v1/aeo/llm-responses/:platform`               | Get responses from ChatGPT, Claude, Gemini, Perplexity | Live (\~5-15s) | 1.2 credits             |
| LLM Responses | `POST /v1/aeo/llm-responses/:platform/task`          | Async task submission (chatgpt, claude, gemini only)   | Standard       | 1.2 credits             |
| LLM Responses | `GET /v1/aeo/llm-responses/:platform/task/:id`       | Retrieve async task results                            | GET            | Free                    |
| LLM Responses | `GET /v1/aeo/llm-responses/:platform/tasks-ready`    | Check for completed tasks                              | GET            | Free                    |
| LLM Responses | `GET /v1/aeo/llm-responses/:platform/models`         | List available models for a platform                   | GET            | Free                    |
| LLM Scraper   | `POST /v1/aeo/llm-scraper/chatgpt`                   | Scrape ChatGPT Search (advanced format)                | Live           | 0.16 credits            |
| LLM Scraper   | `POST /v1/aeo/llm-scraper/chatgpt/html`              | Scrape ChatGPT Search (HTML format)                    | Live           | 0.16 credits            |
| LLM Scraper   | `POST /v1/aeo/llm-scraper/chatgpt/task`              | Async scraper task submission                          | Standard       | 0.08 credits            |
| LLM Scraper   | `GET /v1/aeo/llm-scraper/chatgpt/task/:id`           | Retrieve scraper results (advanced)                    | GET            | Free                    |
| LLM Scraper   | `GET /v1/aeo/llm-scraper/chatgpt/task/:id/html`      | Retrieve scraper results (HTML)                        | GET            | Free                    |
| LLM Scraper   | `GET /v1/aeo/llm-scraper/chatgpt/tasks-ready`        | Check for completed scraper tasks                      | GET            | Free                    |
| AI Keywords   | `POST /v1/aeo/ai-keywords/search-volume`             | AI search volume estimates                             | Live           | 0.4 + 0.004 per keyword |
| LLM Mentions  | `POST /v1/aeo/llm-mentions/search`                   | Detailed mentions with counts and cited links          | Live           | 2.4 + 0.024 per row     |
| LLM Mentions  | `POST /v1/aeo/llm-mentions/aggregated-metrics`       | Consolidated metrics across dimensions                 | Live           | 2.4 + 0.024 per row     |
| LLM Mentions  | `POST /v1/aeo/llm-mentions/cross-aggregated-metrics` | Compare metrics across multiple targets                | Live           | 2.4 + 0.024 per row     |
| LLM Mentions  | `POST /v1/aeo/llm-mentions/top-domains`              | Most frequently mentioned domains                      | Live           | 2.4 + 0.024 per row     |
| LLM Mentions  | `POST /v1/aeo/llm-mentions/top-pages`                | Top mentioned pages for a keyword                      | Live           | 2.4 + 0.024 per row     |
| General       | `POST /v1/aeo/id-list`                               | List task IDs across all sub-APIs                      | POST           | Free                    |

## LLM Responses

Get responses from major AI models to see what they say about your brand, product, or topic.

| LLM        | Live Endpoint                           | Standard (async)            | Models                      |
| ---------- | --------------------------------------- | --------------------------- | --------------------------- |
| ChatGPT    | `POST /v1/aeo/llm-responses/chatgpt`    | task, task/:id, tasks-ready | `GET .../chatgpt/models`    |
| Claude     | `POST /v1/aeo/llm-responses/claude`     | task, task/:id, tasks-ready | `GET .../claude/models`     |
| Gemini     | `POST /v1/aeo/llm-responses/gemini`     | task, task/:id, tasks-ready | `GET .../gemini/models`     |
| Perplexity | `POST /v1/aeo/llm-responses/perplexity` | Live only — no async        | `GET .../perplexity/models` |

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  # Get ChatGPT's response to a query (live)
  curl -X POST https://api.usenaive.ai/v1/aeo/llm-responses/chatgpt \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "user_prompt": "best project management software 2026", "model_name": "gpt-4o-mini" }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/aeo/llm-responses/chatgpt", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_prompt: "best project management software 2026", model_name: "gpt-4o-mini" }),
  });
  const data = await response.json();
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "results": [
    {
      "keyword": "best project management software 2026",
      "model": "gpt-4o",
      "response": "Here are some of the best project management tools in 2026:\n\n1. **Asana** — Great for team collaboration...\n2. **Linear** — Developer-focused with fast UI...\n3. **Notion** — All-in-one workspace...",
      "cited_domains": ["asana.com", "linear.app", "notion.so"],
      "cited_urls": [
        "https://asana.com/product",
        "https://linear.app/features"
      ]
    }
  ],
  "credits_used": 1.2
}
```

### Parameters

| Param         | Type   | Required | Default | Description                                                                                         |
| ------------- | ------ | -------- | ------- | --------------------------------------------------------------------------------------------------- |
| `user_prompt` | string | Yes      | —       | Query to send to the LLM                                                                            |
| `model_name`  | string | Yes      | —       | Model to use. Each platform accepts only its own models — list them via `GET .../{platform}/models` |

<Note>
  The CLI maps `--keyword` to `user_prompt`. The model field is `model_name`, and each platform only accepts its own models (an OpenAI model name is rejected for Claude/Gemini/Perplexity). If `--model` is omitted, a valid per-platform default is used: chatgpt → `gpt-4o-mini`, claude → `claude-sonnet-4-5`, gemini → `gemini-2.5-flash`, perplexity → `sonar`. Perplexity is Live-only and supports only `sonar`, `sonar-pro`, `sonar-reasoning-pro`. Do not send location/language to LLM Responses.
</Note>

### When to use

* Monitoring what LLMs say about your brand or product
* Comparing how different AI models describe a topic
* Identifying which competitors get mentioned in AI responses
* Auditing AI search visibility across platforms

## LLM Scraper

Scrape ChatGPT Search results including citations, source links, and structured response data. Two output formats: advanced (structured JSON) and HTML (raw rendered output).

| Endpoint                                        | Description                             | Method   |
| ----------------------------------------------- | --------------------------------------- | -------- |
| `POST /v1/aeo/llm-scraper/chatgpt`              | Scrape ChatGPT Search (advanced format) | Live     |
| `POST /v1/aeo/llm-scraper/chatgpt/html`         | Scrape ChatGPT Search (HTML format)     | Live     |
| `POST /v1/aeo/llm-scraper/chatgpt/task`         | Submit async scraping task              | Standard |
| `GET /v1/aeo/llm-scraper/chatgpt/task/:id`      | Get results (advanced format)           | GET      |
| `GET /v1/aeo/llm-scraper/chatgpt/task/:id/html` | Get results (HTML format)               | GET      |
| `GET /v1/aeo/llm-scraper/chatgpt/tasks-ready`   | Check for completed tasks               | GET      |

### Parameters

| Param           | Type   | Required | Default | Description                     |
| --------------- | ------ | -------- | ------- | ------------------------------- |
| `keyword`       | string | Yes      | —       | Query to send to ChatGPT Search |
| `location_code` | number | No       | —       | Location code                   |
| `language_code` | string | No       | —       | Language code                   |

### When to use

* Getting full ChatGPT Search results with source citations
* Analyzing which sources ChatGPT cites for your keywords
* Comparing live ChatGPT output vs. LLM Responses API data

## AI Keyword Data

Get search volume estimates for keywords in AI search engines.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/aeo/ai-keywords/search-volume \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "keywords": ["best ai tools", "chatbot for business", "ai agent framework"] }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/aeo/ai-keywords/search-volume", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ keywords: ["best ai tools", "chatbot for business", "ai agent framework"] }),
  });
  const data = await response.json();
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "results": [
    { "keyword": "best ai tools", "ai_search_volume": 48200, "competition": "medium" },
    { "keyword": "chatbot for business", "ai_search_volume": 22100, "competition": "high" },
    { "keyword": "ai agent framework", "ai_search_volume": 8400, "competition": "low" }
  ],
  "credits_used": 0.8
}
```

### Parameters

| Param           | Type      | Required | Default | Description                    |
| --------------- | --------- | -------- | ------- | ------------------------------ |
| `keywords`      | string\[] | Yes      | —       | Keywords to check (up to 1000) |
| `location_code` | number    | No       | 2840    | Location code (United States)  |
| `language_code` | string    | No       | en      | Language code                  |

<Note>
  DataForSEO requires both a location and a language. `location_code` (2840) and `language_code` (en) are applied automatically when omitted; the CLI's `--location`/`--language` flags override them.
</Note>

### When to use

* Estimating AI search demand before creating content
* Comparing traditional vs. AI search volume
* Prioritizing keywords for AEO optimization

## LLM Mentions

Track how often brands, domains, and keywords appear in LLM responses. All endpoints use Live method.

| Endpoint                   | Description                                        |
| -------------------------- | -------------------------------------------------- |
| `search`                   | Detailed mentions data with counts and cited links |
| `aggregated-metrics`       | Consolidated metrics across dimensions             |
| `cross-aggregated-metrics` | Compare metrics across multiple targets            |
| `top-domains`              | Most frequently mentioned domains for a keyword    |
| `top-pages`                | Top mentioned pages for a keyword                  |

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  # Track brand mentions in LLM responses
  curl -X POST https://api.usenaive.ai/v1/aeo/llm-mentions/search \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "target": [{ "domain": "salesforce.com" }] }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/aeo/llm-mentions/search", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ target: [{ domain: "salesforce.com" }] }),
  });
  const mentions = await response.json();
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "results": [
    {
      "keyword": "CRM software",
      "target": "salesforce.com",
      "mention_count": 47,
      "llm_platforms": ["chatgpt", "claude", "gemini", "perplexity"],
      "cited_urls": [
        "https://salesforce.com/products/crm",
        "https://salesforce.com/solutions/small-business"
      ],
      "context_snippets": [
        "Salesforce remains one of the most widely used CRM platforms..."
      ]
    }
  ],
  "credits_used": 4.8
}
```

### Parameters

| Param           | Type      | Required | Default | Description                                                                                                              |
| --------------- | --------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| `target`        | object\[] | Yes      | —       | Array of objects, each `{ "keyword": "..." }` or `{ "domain": "..." }`. A top-level `keyword`/`domain` string is invalid |
| `location_code` | number    | No       | 2840    | Location code                                                                                                            |
| `language_code` | string    | No       | en      | Language code                                                                                                            |
| `date_from`     | string    | No       | —       | Start date (YYYY-MM-DD)                                                                                                  |
| `date_to`       | string    | No       | —       | End date (YYYY-MM-DD)                                                                                                    |

<Note>
  The `target` array is the only accepted way to pass keywords/domains — DataForSEO rejects a top-level `keyword` or `domain` string with "POST Data Is Invalid". The CLI builds it automatically: `search`/`top-domains`/`top-pages` from `--keyword` (→ `target: [{ keyword }]`), `aggregated-metrics`/`cross-aggregated-metrics` from `--target <domain>` (→ `target: [{ domain }]`).
</Note>

### When to use

* Monitoring your brand's presence in AI-generated answers
* Benchmarking competitor visibility across LLMs
* Identifying which domains dominate AI search for your keywords
* Tracking mention trends over time

## Error Handling

| Error                  | Cause                                | Recovery                                                          |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| `insufficient_credits` | Not enough credits                   | Check balance with `GET /v1/status`                               |
| `invalid_llm`          | Unknown LLM platform name            | Use chatgpt, claude, gemini, or perplexity                        |
| `invalid_keywords`     | Empty or malformed keyword list      | Provide at least one keyword string                               |
| `invalid_input`        | Platform doesn't support async tasks | Perplexity is live-only; use chatgpt, claude, or gemini for tasks |
| `provider_error`       | Data provider returned an error      | Retry after a few seconds                                         |

<Tip>
  Perplexity only supports the Live method — no async task endpoints. For batch processing across multiple LLMs, submit async tasks for ChatGPT, Claude, and Gemini, then use live calls for Perplexity.
</Tip>

## Typical Workflow

```
Agent receives task: "Audit our brand visibility in AI search"
    │
    ├─ POST /v1/aeo/llm-responses/chatgpt             → Check ChatGPT's response
    │   { user_prompt: "best [product category]", model_name: "gpt-4o-mini" }
    │   → Full response with brand mentions, cited domains
    │
    ├─ POST /v1/aeo/llm-responses/claude               → Check Claude's response
    │   { user_prompt: "best [product category]", model_name: "claude-sonnet-4-5" }
    │   → Compare across models
    │
    ├─ POST /v1/aeo/llm-mentions/search                → Track mention frequency
    │   { target: [{ domain: "yourbrand.com" }] }
    │   → Mention count, cited URLs, context snippets
    │
    ├─ POST /v1/aeo/llm-mentions/top-domains           → See who dominates
    │   { target: [{ keyword: "product category" }] }
    │   → Ranked list of most-mentioned domains
    │
    └─ POST /v1/aeo/ai-keywords/search-volume          → Estimate AI search demand
        { keywords: ["product category", "brand name"] }
        → Volume estimates for AI search
```

## Credit Costs

| Operation                              | Credits                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| LLM Responses live                     | 1.2                                                                                      |
| LLM Responses task\_post               | 1.2                                                                                      |
| LLM Scraper live                       | 0.16                                                                                     |
| LLM Scraper task\_post                 | 0.08                                                                                     |
| AI Keywords live                       | 0.4 + 0.004 per keyword (0.8 for 100 keywords)                                           |
| LLM Mentions live                      | 2.4 + 0.024 per returned row (4.8 at the default 100 rows, 26.4 at the 1000-row maximum) |
| Models GET                             | Free                                                                                     |
| Task retrieval (task/:id, tasks-ready) | Free                                                                                     |
| id-list                                | Free                                                                                     |

LLM Mentions and AI Keywords are metered, not flat: the provider bills us per
returned row and per keyword, so the price is computed from the request's own
`limit` / `keywords`. `limit` accepts 1–1000 and defaults to 100. LLM Responses
passes the model provider's token cost through, so a long answer on an expensive
model can settle above the list price — `credits_used` on the response is always
the amount charged.

## See also (blog)

* [How agents run SEO keyword research loops](https://usenaive.ai/blog/how-agents-run-seo-keyword-research-loops) — governed per-tenant research loop on `/seo`
* [How agents track brand mentions in AI search](https://usenaive.ai/blog/how-agents-track-brand-mentions-in-ai-search) — AEO mention tracking on `/aeo`
* [How to build a usage-metered SEO SaaS](https://usenaive.ai/blog/how-to-build-a-usage-metered-seo-saas) — Customer Billing + Account Kits for tier enforcement
