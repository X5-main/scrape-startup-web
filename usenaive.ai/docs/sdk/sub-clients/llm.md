> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# llm

> OpenRouter-backed chat completions — a full wrapper over OpenRouter.

```ts theme={"theme":"css-variables"}
// Non-streaming
const res = await naive.llm.chat({
  model: "anthropic/claude-sonnet-4.6",
  messages: [{ role: "user", content: "Hello" }],
  models: ["anthropic/claude-sonnet-4.6", "openai/gpt-5.2"], // optional fallback chain
  provider: { sort: "throughput", data_collection: "deny" }, // optional OpenRouter routing
});
res.choices[0].message.content;
res.credits_used;

// Streaming (SSE) — yields OpenAI-compatible chunks
for await (const chunk of naive.llm.stream({ model: "openai/gpt-5.2", messages })) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}

// List models (free) + per-generation stats
const { models } = await naive.llm.models("claude");
const stats = await naive.llm.generation("gen-xxxx");
```

The request/response shapes are OpenRouter's (OpenAI-compatible) — see the
[LLM primitive guide](/docs/getting-started/llm) and OpenRouter's
[API reference](https://openrouter.ai/docs/api-reference/overview). Billed in
Naive credits from OpenRouter's returned `usage.cost`. Per-user and
AccountKit-gated like other primitives (`naive.forUser(id).llm`).

<Note>
  **`chat` and `stream` require a paid account** — this is the one primitive the free signup credits
  do not buy. On an account that has never bought credits or subscribed, both throw a `NaiveError`
  with `code: "llm_routing_requires_payment"` (echoed as `details.block_reason`); branch
  on that rather than on the `402`, since it is not fixed by retrying or by more free credit. One
  credit purchase or one subscription clears it permanently. `models()` and `generation()` are free
  and never gated.
</Note>

<Info>
  Prefer the drop-in proxy (`baseURL: https://api.usenaive.ai/v1/proxy/openrouter`)
  if you want to keep using the OpenAI/OpenRouter SDK unchanged. See
  [LLM → Use Naive instead of OpenRouter](/docs/getting-started/llm#use-naive-instead-of-openrouter-drop-in-proxy).
</Info>
