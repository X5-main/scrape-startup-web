> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Web Research

> Three research tools at different depths — web search, URL extraction, and multi-step deep research with citations.

Research is the primitive that gives your agent eyes on the live web. Naive exposes three tools at different levels of depth and cost — `web_search`, `read_url`, and `research` — so the agent picks the right one for the job: a quick fact lookup, a single-page extract, or a multi-step synthesis with citations. Use the lightest tool that meets your needs to keep latency and cost low.

## CLI First

```bash theme={"theme":"css-variables"}
# Web search
naive search "AI agent frameworks comparison 2026"

# Read a specific URL
naive search url https://example.com --extract "Main takeaways"

# Deep research
naive search research "Compare top AI agent frameworks in 2026" --depth thorough --wait
```

## Tools

| Tool         | Type | Description                                                                   | Speed           | Cost            |
| ------------ | ---- | ----------------------------------------------------------------------------- | --------------- | --------------- |
| `web_search` | Core | Search the web for current information — returns ranked results with snippets | Fast (\~1s)     | 0.2 credits     |
| `read_url`   | Core | Fetch a URL and extract main text content with optional AI focus              | Fast (\~2s)     | 0.05 credits    |
| `research`   | Core | Deep research — one broad search plus a cited LLM synthesis, at three depths  | Slow (\~10-90s) | 0.5–1.6 credits |

## web\_search

Real-time web search. Returns titles, URLs, and snippets — no page fetching.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/search \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "query": "AI agent frameworks comparison 2026",
      "count": 5
    }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/search", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: "AI agent frameworks comparison 2026", count: 5 }),
  });
  const results = await response.json();
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "results": [
    {
      "title": "The Best AI Agent Frameworks in 2026 - TechReview",
      "url": "https://techreview.com/ai-agent-frameworks-2026",
      "snippet": "We compared the top 10 AI agent frameworks across performance, ecosystem, and developer experience..."
    },
    {
      "title": "LangChain vs CrewAI vs AutoGen: A Developer's Guide",
      "url": "https://dev.to/comparison-langchain-crewai-autogen",
      "snippet": "After building production agents with all three frameworks..."
    }
  ],
  "credits_used": 0.2
}
```

### Parameters

| Param   | Type   | Required | Default | Description              |
| ------- | ------ | -------- | ------- | ------------------------ |
| `query` | string | Yes      | —       | Search query             |
| `count` | number | No       | 5       | Number of results (1-20) |

### When to use

* Quick fact checks
* Finding URLs to read in detail
* Getting recent news or pricing
* Time-sensitive information your training data might not cover

## read\_url

Fetch a webpage and extract the main text content. Optionally uses AI to focus on a specific topic.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/search/url \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "url": "https://techreview.com/ai-agent-frameworks-2026",
      "extract": "pricing and free tiers"
    }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/search/url", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: "https://techreview.com/ai-agent-frameworks-2026",
      extract: "pricing and free tiers",
    }),
  });
  const data = await response.json();
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "url": "https://techreview.com/ai-agent-frameworks-2026",
  "content": "# AI Agent Frameworks Pricing\n\nLangChain: Open source, free...\nCrewAI: Free tier available, Pro at $49/mo...",
  "credits_used": 0.05
}
```

### Parameters

| Param     | Type   | Required | Default | Description                                         |
| --------- | ------ | -------- | ------- | --------------------------------------------------- |
| `url`     | string | Yes      | —       | URL to fetch and extract                            |
| `extract` | string | No       | —       | Focus question — AI extracts relevant sections only |

### When to use

* Reading a specific article after `web_search`
* Extracting structured data from a known URL
* Getting documentation or pricing from a product page

<Warning>
  Local and private URLs (localhost, 127.*, 10.*, 192.168.\*) are blocked for security.
</Warning>

## research

Deep research: runs one broad web search and synthesizes the returned sources into an answer with inline citations. Depth controls how many sources are gathered and how strong the synthesis model is — it does not fetch the pages themselves, so pair it with `read_url` when you need a full page body.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/search/research \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "query": "What are the most effective go-to-market strategies for AI developer tools in 2026?",
      "depth": "thorough"
    }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const response = await fetch("https://api.usenaive.ai/v1/search/research", {
    method: "POST",
    headers: {
      "Authorization": "Bearer nv_sk_your_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: "What are the most effective go-to-market strategies for AI developer tools in 2026?",
      depth: "thorough",
    }),
  });
  const result = await response.json();
  ```
</CodeGroup>

### Depth Levels

| Depth        | Behavior                                        | Credits | Time  |
| ------------ | ----------------------------------------------- | ------- | ----- |
| `quick`      | Inline response (5 sources + synthesis)         | 0.5     | \~5s  |
| `thorough`   | Async job, 8 sources, stronger synthesis model  | 1       | \~45s |
| `exhaustive` | Async job, 15 sources, stronger synthesis model | 1.6     | \~90s |

An unrecognised `depth` is rejected with `invalid_input` rather than being run
and billed as `quick`. An async job whose providers return no sources and no
synthesis is marked `failed` and costs nothing.

For `thorough` and `exhaustive`, you'll get a `202` response with a job ID:

```json theme={"theme":"css-variables"}
{
  "job_id": "job-uuid",
  "status": "processing",
  "estimated_seconds": 45,
  "hint": "Poll GET /v1/jobs/job-uuid for results."
}
```

**Completed result:**

```json theme={"theme":"css-variables"}
{
  "summary": "Based on analysis of current market trends...\n\n1. **Developer-first content marketing** — [1][2]\n2. **Open-source core with managed cloud** — [3]\n3. **Community-driven growth** — [4][5]",
  "sources": [
    { "title": "GTM Playbook for Dev Tools", "url": "https://a16z.com/gtm-dev-tools" },
    { "title": "How Dev Tools Scale to $3B", "url": "https://techcrunch.com/dev-tools-growth" }
  ]
}
```

## Choosing the Right Tool

<Tabs>
  <Tab title="Quick answer needed">
    Use `web_search` → scan snippets for the answer.

    ```
    POST /v1/search { "query": "OpenAI API pricing 2026" }
    ```

    Cost: 0.2 credits. Time: \~1 second.
  </Tab>

  <Tab title="Need detail from a specific source">
    Use `web_search` → `read_url` on the best result.

    ```
    POST /v1/search { "query": "payments API changelog" }
    → Found: https://docs.example.com/changelog

    POST /v1/search/url { "url": "...", "extract": "May 2026 changes" }
    ```

    Cost: 0.25 credits. Time: \~3 seconds.
  </Tab>

  <Tab title="Comprehensive analysis">
    Use `research` for end-to-end synthesis.

    ```
    POST /v1/search/research {
      "query": "How are B2B SaaS companies using AI agents for support in 2026?",
      "depth": "thorough"
    }
    ```

    Cost: 1 credit. Time: \~45 seconds.
  </Tab>
</Tabs>

## Error Handling

| Error                  | Cause                             | Recovery                                |
| ---------------------- | --------------------------------- | --------------------------------------- |
| `insufficient_credits` | Not enough credits                | Check balance with `GET /v1/status`     |
| `url_blocked`          | Target is a private/local address | Use a public URL                        |
| `fetch_failed`         | Could not reach the target URL    | Try a different URL or use `web_search` |
| `provider_error`       | Search provider error             | Retry after a few seconds               |

<Tip>
  Start with `web_search`. If snippets aren't enough, follow up with `read_url`. Only use `research` when you need a synthesized multi-source answer — it's significantly more expensive but produces better results for complex questions.
</Tip>

## Typical Workflow

```
Agent receives task: "Research competitor pricing for our Q3 strategy"
    │
    ├─ POST /v1/search                         → Find relevant sources
    │   { query: "competitor SaaS pricing 2026" }
    │   → 5 results with URLs
    │
    ├─ POST /v1/search/url                     → Deep dive on best result
    │   { url: "https://competitor.com/pricing",
    │     extract: "pricing tiers and features" }
    │   → Extracted pricing details
    │
    └─ POST /v1/search/research                → Comprehensive analysis
        { query: "How does our pricing compare?",
          depth: "thorough" }
        → Synthesized report with citations
```
