> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# seo

> Keyword research, rank tracking, backlinks and competitor analysis (DataForSEO-backed).

```ts theme={"theme":"css-variables"}
// Convenience wrappers
await naive.seo.searchVolume(["project management software", "gantt chart tool"]);
await naive.seo.rankedKeywords("ahrefs.com");      // keywords a domain ranks for
await naive.seo.backlinksSummary("ahrefs.com");    // backlink profile
await naive.seo.serpCompetitors(["crm software"]); // competing domains

// Generic passthroughs (mirror the route tree)
await naive.seo.keywords("google", "search-volume", { keywords: ["seo"] });
await naive.seo.backlinks("summary", { target: "example.com" });
await naive.seo.labs("google", "ranked-keywords", { target: "example.com" });

// Async keyword tasks
await naive.seo.keywordsTask("google", "search-volume", { keywords: ["seo"] });
await naive.seo.keywordsTaskResult("google", "search-volume", taskId);
await naive.seo.keywordsTasksReady("google", "search-volume");
```

Per-user and AccountKit-gated: `naive.seo` (default user) or `naive.forUser(id).seo`. Metered against the tenant's plan quota (see [Customer Billing](/docs/getting-started/customer-billing)). Also exposed to agents via [`agentTools()`](/docs/sdk/agent-tools). See the [SEO guide](/docs/getting-started/seo).
