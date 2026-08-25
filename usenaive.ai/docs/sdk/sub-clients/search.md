> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# search

> Real-time web search, URL reading, and deep research.

Available on the root (default user) and `naive.forUser(id)`.

```ts theme={"theme":"css-variables"}
// Web search
await naive.search.web("naive agent governance", 10);

// Read one URL (optionally ask for a specific extraction)
await naive.search.readUrl("https://example.com/pricing", "the price table");

// Deep multi-source research
const quick = await naive.search.research("state of x402 adoption", "quick");
const deep  = await naive.search.research("state of x402 adoption", "thorough");
```

| Method                    | HTTP                     | Notes                                                        |
| ------------------------- | ------------------------ | ------------------------------------------------------------ |
| `web(query, count?)`      | `POST …/search`          | Real-time results.                                           |
| `readUrl(url, extract?)`  | `POST …/search/url`      | Fetch + read one page. `extract` is a natural-language hint. |
| `research(query, depth?)` | `POST …/search/research` | `depth` is `"quick" \| "thorough" \| "exhaustive"`.          |

<Warning>
  **`research` changes shape with `depth`.** `"quick"` answers inline; `"thorough"` and
  `"exhaustive"` are **asynchronous** and return a `job_id` — poll it through
  [jobs](/docs/sdk/sub-clients/jobs). Code that reads a result field directly will find it missing on
  the deep paths.
</Warning>

Per-user and AccountKit-gated by the `search` primitive. Also exposed to agents via
[`agentTools()`](/docs/sdk/agent-tools). See the [Search guide](/docs/getting-started/search).
