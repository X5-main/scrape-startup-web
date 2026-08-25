> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# search

> Web search, URL extraction, and deep multi-source research with structured agent output.

## Overview

Three search modes, each with increasing depth and cost:

| Command                         | Description                           | Cost            |
| ------------------------------- | ------------------------------------- | --------------- |
| `naive search <query>`          | Quick web search                      | 0.2 credits     |
| `naive search url <url>`        | Extract content from a URL            | 0.05 credits    |
| `naive search research <query>` | Deep multi-source AI research (async) | 0.5–1.6 credits |

***

## Web Search

```bash theme={"theme":"css-variables"}
naive search "best project management tools 2026"
naive search "competitor analysis SaaS pricing" --count 10
```

### Options

| Flag          | Required | Description                             |
| ------------- | -------- | --------------------------------------- |
| `query`       | Yes      | Search query (positional argument)      |
| `--count <n>` | No       | Number of results (default: 5, max: 20) |

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "search",
  "result": {
    "results": [
      { "title": "Top PM Tools in 2026", "url": "https://example.com/article", "snippet": "A comprehensive look at...", "score": 0.95 },
      { "title": "Building Better Teams", "url": "https://blog.example.com/post", "snippet": "How to organize..." }
    ],
    "credits_used": 0.2,
    "credits_remaining": 989.8,
    "provider": "web"
  },
  "next_steps": [
    { "command": "naive search url https://example.com/article", "description": "Extract full content from the top result" },
    { "command": "naive search research \"best project management tools 2026\"", "description": "Run deep research on this topic" },
    { "command": "naive search \"best project management tools 2026\" --count 10", "description": "Get more results" }
  ],
  "hints": ["Found 5 results", "Use 'naive search url <url>' to extract full page content", "Cost: 0.2 credits"]
}
```

***

## URL Extraction

Fetches a URL and extracts content. Optionally uses AI to extract specific information.

```bash theme={"theme":"css-variables"}
naive search url https://example.com/pricing
naive search url https://news.ycombinator.com --extract "top 5 stories with links"
naive search url https://docs.example.com/api --extract "authentication methods"
```

### Options

| Flag                 | Required | Description                                   |
| -------------------- | -------- | --------------------------------------------- |
| `url`                | Yes      | URL to fetch and extract from                 |
| `--extract <prompt>` | No       | AI extraction prompt for targeted information |

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "search.url",
  "result": {
    "url": "https://example.com/pricing",
    "title": "",
    "content": "...(raw text content, up to 5000 chars)...",
    "extracted": "Free: $0/mo, Pro: $29/mo, Enterprise: custom",
    "credits_used": 0.05,
    "credits_remaining": 989.75
  },
  "next_steps": [
    { "command": "naive search url https://example.com/pricing --extract \"specific question\"", "description": "Re-extract with a different focus" },
    { "command": "naive search \"related topic\"", "description": "Search for related information" }
  ],
  "hints": ["Use --extract to focus on specific information from the page", "Cost: 0.05 credits"]
}
```

<Note>
  When `--extract` is provided and AI extraction is configured, an LLM extracts the specific information you requested from the page content. Without `--extract`, you get the raw text content.
</Note>

***

## Deep Research

Multi-source, AI-synthesized research. Runs synchronously for "quick" depth, asynchronously for thorough/exhaustive.

```bash theme={"theme":"css-variables"}
naive search research "market size for AI developer tools" --depth thorough
naive search research "competitive analysis: Figma vs Canva" --depth exhaustive --wait
naive search research "microservice auth best practices" --depth quick
```

### Options

| Flag              | Required | Description                                              |
| ----------------- | -------- | -------------------------------------------------------- |
| `query`           | Yes      | Research topic                                           |
| `--depth <level>` | No       | `quick` (default), `thorough`, or `exhaustive`           |
| `--wait`          | No       | Block until research completes (for thorough/exhaustive) |

### Depth Levels

| Level        | Sources | Behavior                         | Cost        |
| ------------ | ------- | -------------------------------- | ----------- |
| `quick`      | 5       | Synchronous (immediate response) | 0.5 credits |
| `thorough`   | 8       | Async job (\~45s)                | 1 credit    |
| `exhaustive` | 15      | Async job (\~90s)                | 1.6 credits |

### Output (quick — inline response)

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "search.research",
  "result": {
    "synthesis": "Based on analysis of 5 sources...",
    "sources": [
      { "url": "https://...", "title": "...", "relevance": 0.9 }
    ],
    "credits_used": 0.5,
    "credits_remaining": 989.25
  },
  "next_steps": [
    { "command": "naive search \"follow-up query\"", "description": "Quick search for additional context" }
  ],
  "hints": ["Research completed synchronously (quick depth)"]
}
```

### Output (thorough/exhaustive — submitted)

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "search.research.submitted",
  "result": { "job_id": "job-uuid-123", "status": "queued", "depth": "thorough" },
  "next_steps": [
    { "command": "naive jobs get job-uuid-123", "description": "Check research progress" },
    { "command": "naive jobs --status processing", "description": "List all active jobs" }
  ],
  "hints": [
    "Research job submitted (depth: thorough)",
    "Credits will be deducted only on successful completion",
    "Expected completion: ~45s"
  ]
}
```

### Output (completed — with `--wait`)

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "search.research.completed",
  "result": {
    "id": "job-uuid-123",
    "status": "completed",
    "type": "deep_research",
    "result": {
      "synthesis": "Based on analysis of 8 sources...",
      "sources": [
        { "url": "https://...", "title": "...", "relevance": 0.92 }
      ]
    },
    "credits_used": 1
  },
  "next_steps": [
    { "command": "naive search \"related topic\"", "description": "Search for additional information" },
    { "command": "naive search url <url>", "description": "Deep-dive into a specific source from the report" }
  ],
  "hints": ["Research completed successfully"]
}
```

**Credit behavior:** Credits are NOT deducted at submission. They are deducted only when the job completes successfully. Failed or cancelled research jobs cost nothing.
