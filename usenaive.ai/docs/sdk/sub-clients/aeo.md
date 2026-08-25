> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# aeo

> AI-search / GEO visibility — LLM responses, mention metrics and AI keyword volume.

```ts theme={"theme":"css-variables"}
// How an LLM answers a prompt (chatgpt | claude | gemini | perplexity)
await naive.aeo.llmResponses("chatgpt", {
  user_prompt: "best project management software 2026",
  model_name: "gpt-4o-mini",
  web_search: true,
});

// AI keyword search volume
await naive.aeo.aiKeywords({ keywords: ["ai note taking app"] });

// GEO mention metrics (endpoint: search | aggregated-metrics | top-domains | top-pages)
await naive.aeo.llmMentions("search", { /* params */ });
```

Per-user and AccountKit-gated: `naive.aeo` or `naive.forUser(id).aeo`. Metered against the tenant's plan quota (see [Customer Billing](/docs/getting-started/customer-billing)). Also exposed to agents via [`agentTools()`](/docs/sdk/agent-tools). See the [AEO guide](/docs/getting-started/aeo).
