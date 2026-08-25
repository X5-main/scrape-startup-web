> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# LLM

> OpenRouter-backed LLM routing — chat completions across 300+ models through one Naive endpoint, billed in credits. Use Naive as a full wrapper over OpenRouter.

The `llm` primitive is a full wrapper over [OpenRouter](https://openrouter.ai). It gives your agent a single, OpenAI-compatible chat-completions endpoint that routes to **300+ models** across Anthropic, OpenAI, Google, Meta, Mistral, and more — with provider routing, fallbacks, and streaming. You don't manage an OpenRouter account or key: Naive holds the key and bills each call in **Naive credits** based on the exact cost OpenRouter returns.

There are two ways to use it:

1. **The typed primitive** — `naive.llm.chat()` / `naive.llm.stream()` / `naive.llm.models()` in the SDK (plus CLI, MCP, and the agent toolset).
2. **The drop-in proxy** — point any OpenAI or OpenRouter client's `baseURL` at Naive and keep your existing code.

<Note>
  **Routing requires a paid account.** This is the one primitive the 20 free signup credits do not
  buy. A company whose entire balance is free credit — the signup grant, or credit we comped — cannot
  spend it here. Either of these opens routing, permanently:

  * **buy credits** — `naive billing topup --pack small` (`POST /v1/billing/topup`), or
  * **subscribe** — `naive billing subscribe --plan pro` (`POST /v1/billing/subscribe`).

  It is the *provenance* of the credit that decides, not the amount: more free credit never helps,
  and once any purchase has settled the account stays entitled regardless of what the balance later
  does. An unpaid call answers `402 llm_routing_requires_payment` — its own code, carried again in
  `error.block_reason`, so a client that switches on either field needs no mapping.

  **Both ways in are covered** — the typed routes and the `/v1/proxy/*` passthroughs are the same
  product, so the drop-in is not a way around this. `GET /v1/llm/models` and `GET /v1/llm/generation`
  stay free and ungated, so you can browse and price models before paying. Every *other* primitive —
  agents, teams, email, browser, sandbox, brain, search — still runs on the free grant.

  Why this one and nothing else: routing's marginal cost is a third party's invoice rather than our
  own compute, so the trial subsidises the product instead of a resale of someone else's API.
</Note>

<Warning>
  **Both are OpenAI/OpenRouter-shaped. There is no Anthropic Messages API here, and it is not a coding
  agent's model endpoint.**

  `POST /v1/messages` is **not mounted** and answers `404`. A client that speaks the Anthropic Messages
  shape — Claude Code, the Claude Agent SDK, anything driven by `ANTHROPIC_BASE_URL` — cannot be
  repointed at Naive. **The blocker is the request shape, not streaming:** every route on this page
  streams, and `stream: true` pipes the provider's SSE stream straight through (see
  [Streaming](#streaming)). Anthropic models are reachable here the same way every other provider's
  are — as an OpenRouter model id such as `anthropic/claude-sonnet-4.6` in an OpenAI-shaped request.

  Do not route a coding agent's **own** reasoning loop through Naive even where the shape does match.
  Every token of every turn would settle against your credit balance at provider cost plus markup, for
  an extra network hop and worse latency, to obtain what talking to the provider directly already
  gives you. Use the `llm` primitive for the inference **your agent performs on a customer's behalf**,
  where the per-tenant metering, budget caps and audit trail are the point. Naive is the layer an
  agent **calls**; it is not the endpoint an agent **runs on**.
</Warning>

## CLI First

```bash theme={"theme":"css-variables"}
# Run a completion
naive llm chat -m anthropic/claude-sonnet-4.6 "Write a haiku about Paris"

# With a system prompt and a fallback model
naive llm chat -m openai/gpt-5.2 --system "You are terse." "Summarize REST in one line" --fallback anthropic/claude-sonnet-4.6

# Browse models (free)
naive llm models claude
```

## Endpoints

| Endpoint                        | Type              | Description                                  | Cost                                                |
| ------------------------------- | ----------------- | -------------------------------------------- | --------------------------------------------------- |
| `POST /v1/llm/chat/completions` | Sync or streaming | OpenAI/OpenRouter-compatible chat completion | Per-token (see [Credits](/docs/getting-started/credits)) |
| `GET /v1/llm/models`            | Sync              | List routable models (optionally filtered)   | Free                                                |
| `GET /v1/llm/generation?id=`    | Sync              | Usage/cost stats for a prior completion      | Free                                                |

The request and response bodies are exactly OpenRouter's (which are in turn OpenAI-compatible) — Naive forwards them through. See OpenRouter's [API reference](https://openrouter.ai/docs/api-reference/overview) for the full schema.

## Chat completions

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/llm/chat/completions \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "anthropic/claude-sonnet-4.6",
      "messages": [{ "role": "user", "content": "Summarize our Q3 strategy in 3 bullets." }]
    }'
  ```

  ```javascript SDK theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";
  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

  const res = await naive.llm.chat({
    model: "anthropic/claude-sonnet-4.6",
    messages: [{ role: "user", content: "Summarize our Q3 strategy in 3 bullets." }],
  });
  console.log(res.choices[0].message.content);
  console.log("credits:", res.credits_used);
  ```
</CodeGroup>

**Response** (OpenAI-shaped, plus `credits_used`):

```json theme={"theme":"css-variables"}
{
  "id": "gen-xxxxxxxx",
  "model": "anthropic/claude-sonnet-4.6",
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "finish_reason": "stop",
      "message": { "role": "assistant", "content": "1. ...\n2. ...\n3. ..." }
    }
  ],
  "usage": { "prompt_tokens": 18, "completion_tokens": 42, "total_tokens": 60, "cost": 0.00021 },
  "credits_used": 0.005,
  "credits_remaining": 999
}
```

### Key parameters

| Param                                                               | Type      | Description                                                                                                                                                                           |
| ------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`                                                             | string    | Model id with provider prefix, e.g. `anthropic/claude-sonnet-4.6`, `openai/gpt-5.2`.                                                                                                  |
| `messages`                                                          | array     | OpenAI-style chat messages. (Either `messages` or `prompt` is required.)                                                                                                              |
| `models`                                                            | string\[] | Optional fallback chain — OpenRouter tries them in order if earlier ones are unavailable.                                                                                             |
| `provider`                                                          | object    | OpenRouter [provider routing](https://openrouter.ai/docs/guides/routing/provider-selection) preferences (`order`, `only`, `ignore`, `sort`, `allow_fallbacks`, `data_collection`, …). |
| `stream`                                                            | boolean   | Stream the response as SSE.                                                                                                                                                           |
| `temperature`, `top_p`, `max_tokens`, `tools`, `response_format`, … | —         | Forwarded as-is to OpenRouter.                                                                                                                                                        |

### Provider routing & fallbacks

Because the body is OpenRouter's, you get its routing controls for free:

```javascript theme={"theme":"css-variables"}
await naive.llm.chat({
  model: "anthropic/claude-sonnet-4.6",
  models: ["anthropic/claude-sonnet-4.6", "openai/gpt-5.2"], // fallback chain
  provider: { sort: "throughput", data_collection: "deny" },
  messages: [{ role: "user", content: "Hello" }],
});
```

### Streaming

```javascript theme={"theme":"css-variables"}
for await (const chunk of naive.llm.stream({
  model: "openai/gpt-5.2",
  messages: [{ role: "user", content: "Write a haiku about Paris." }],
})) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}
```

Streaming is Server-Sent Events. The final chunk carries the `usage` object (including `cost`); Naive bills it after the stream closes.

## Use Naive instead of OpenRouter (drop-in proxy)

If you already use the OpenAI or OpenRouter SDK, you don't need to change your code — just change the `baseURL` and key. Naive injects the OpenRouter key server-side and bills your credits.

<CodeGroup>
  ```javascript OpenAI SDK theme={"theme":"css-variables"}
  import OpenAI from "openai";

  const client = new OpenAI({
    apiKey: process.env.NAIVE_API_KEY,                        // nv_sk_...
    baseURL: "https://api.usenaive.ai/v1/proxy/openrouter",   // was https://openrouter.ai/api/v1
  });

  const r = await client.chat.completions.create({
    model: "anthropic/claude-sonnet-4.6",
    messages: [{ role: "user", content: "Hello" }],
  });
  ```

  ```bash curl theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/proxy/openrouter/chat/completions \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "model": "openai/gpt-5.2", "messages": [{ "role": "user", "content": "Hello" }] }'
  ```
</CodeGroup>

<Info>
  The proxy is a transparent passthrough: every path under `/v1/proxy/openrouter/*` maps to `https://openrouter.ai/api/v1/*` (so `chat/completions`, `models`, `generation`, etc. all work). It is authenticated by your Naive api key and is **not** Account-Kit gated — use the typed `/v1/llm` routes when you want per-tenant AccountKit enforcement. It **is** subject to the paid-account rule above: the passthrough is the same product under another shape, and an unpaid account gets the same `402 llm_routing_requires_payment`.
</Info>

## Multi-tenant

Like other primitives, the typed routes are AccountKit-gated and per-user:

```javascript theme={"theme":"css-variables"}
const alice = await naive.users.create({ external_id: "alice" });
const res = await naive.forUser(alice.id).llm.chat({
  model: "openai/gpt-5.2",
  messages: [{ role: "user", content: "Draft a welcome email." }],
});
```

Toggle the `llm` primitive on/off per Account Kit in the dashboard (Account Kits → Primitives → Generation), or via `primitives_config.llm.enabled`. See [Account Kits](/docs/architecture/account-kits).

## Billing

Naive bills the **exact cost OpenRouter reports** for each request (`usage.cost`, in USD) times a small markup, converted to credits (\$0.05 = 1 credit). There's no per-model rate table to keep in sync — token-heavy models simply cost more. Costs are charged after the response completes (after the final chunk, for streams). Listing models is free. See [Credits](/docs/getting-started/credits#llm-calls).

The balance those costs settle against has to be a **paid** one — see the note at the top of this page. `naive billing status` tells you where you stand; a single credit pack or a subscription is enough, and it does not expire.

## Agent tools

The `llm` primitive is part of [`agentTools()`](/docs/sdk/agent-tools): the model can route its own sub-calls with `naive_run_primitive(primitive: "llm", method: "chat", arguments: { model, messages })`, or list models with `method: "models"`.

## Error Handling

| Error                          | Cause                                                           | Recovery                                                                                                                                                                                        |
| ------------------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `llm_routing_requires_payment` | The account has never paid, and free credits do not buy routing | Buy credits (`naive billing topup`) or subscribe (`naive billing subscribe`). Never retry: this is the one refusal here that is not transient, and `naive llm chat` marks it `retryable: false` |
| `insufficient_credits`         | Not enough credits                                              | Top up — see [Credits](/docs/getting-started/credits)                                                                                                                                                |
| `not_configured`               | OpenRouter key not set on the deployment                        | AgentProfile must set `OPENROUTER_API_KEY`                                                                                                                                                      |
| `provider_error`               | OpenRouter/upstream model error                                 | Inspect the message; retry or try another `model`                                                                                                                                               |
| `invalid_input`                | Missing `messages`/`prompt`                                     | Provide one                                                                                                                                                                                     |
| `forbidden`                    | `llm` disabled by the Account Kit                               | Enable it in the kit                                                                                                                                                                            |
