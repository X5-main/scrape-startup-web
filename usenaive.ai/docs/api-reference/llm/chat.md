> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Chat Completions

> POST /v1/llm/chat/completions — OpenAI/OpenRouter-compatible chat completions across 300+ models.

OpenAI-compatible chat completions, routed through OpenRouter. The request body
is OpenRouter's (a superset of OpenAI's) and is forwarded as-is — see
[OpenRouter's API reference](https://openrouter.ai/docs/api-reference/overview)
for every field. Set `stream: true` for Server-Sent Events.

<ParamField body="model" type="string" required>
  Model id with provider prefix, e.g. `anthropic/claude-sonnet-4.6`, `openai/gpt-5.2`.
</ParamField>

<ParamField body="messages" type="array">
  OpenAI-style chat messages: `[{ role, content }]`. Either `messages` or `prompt` is required.
</ParamField>

<ParamField body="prompt" type="string">
  Plain-text prompt (alternative to `messages`).
</ParamField>

<ParamField body="models" type="string[]">
  Optional fallback chain — OpenRouter tries these in order if earlier models are unavailable.
</ParamField>

<ParamField body="provider" type="object">
  OpenRouter [provider routing](https://openrouter.ai/docs/guides/routing/provider-selection) preferences (`order`, `only`, `ignore`, `sort`, `allow_fallbacks`, `data_collection`, …).
</ParamField>

<ParamField body="stream" type="boolean" default="false">
  Stream the response as SSE. The final chunk carries the `usage` (incl. cost).
</ParamField>

<ParamField body="temperature" type="number">
  Sampling temperature (0–2). `top_p`, `max_tokens`, `stop`, `seed`, `tools`, `tool_choice`, `response_format`, etc. are also forwarded.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/llm/chat/completions \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "model": "anthropic/claude-sonnet-4.6",
      "messages": [{ "role": "user", "content": "Summarize REST in one line." }],
      "models": ["anthropic/claude-sonnet-4.6", "openai/gpt-5.2"],
      "provider": { "sort": "throughput" }
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "gen-xxxxxxxx",
    "object": "chat.completion",
    "created": 1749600000,
    "model": "anthropic/claude-sonnet-4.6",
    "choices": [
      {
        "index": 0,
        "finish_reason": "stop",
        "message": { "role": "assistant", "content": "REST is a stateless, resource-oriented HTTP API style." }
      }
    ],
    "usage": { "prompt_tokens": 14, "completion_tokens": 16, "total_tokens": 30, "cost": 0.00012 },
    "credits_used": 0.003,
    "credits_remaining": 999
  }
  ```
</ResponseExample>

<Warning>
  **Detecting truncated output.** When a completion hits the token cap, the output is
  silently cut off and `choices[0].finish_reason` is `"length"`. In that case the
  response also carries a top-level **`"truncated": true`** flag — check it (or
  `finish_reason`) before treating the output as complete, and re-request with a
  higher `max_tokens` if needed. The flag is absent (not `false`) when the generation
  finished cleanly. The `naive llm chat` CLI additionally prints a warning to stderr.
</Warning>

**Cost:** per-token, derived from OpenRouter's returned `usage.cost` × markup (see [Credits](/docs/getting-started/credits#llm-calls)). Charged after completion (after the final SSE chunk for streams).

**Requires a paid account.** This is the one primitive the 20 free signup credits do not buy. Until the company has bought credits (`POST /v1/billing/topup`) or subscribed (`POST /v1/billing/subscribe`), this endpoint answers `402 llm_routing_requires_payment` — its own code, carried again in `error.block_reason`, and deliberately not `insufficient_credits`: more free credit never clears it. The body carries `credit_kind: "trial"`, the `balance` and a `balance_note` saying the balance is not the problem, plus `actions` naming both ways out. The proxy below is the same product and is gated the same way; `GET /v1/llm/models` and `GET /v1/llm/generation` are not gated. See [LLM](/docs/getting-started/llm).

<Info>
  Prefer to keep your existing OpenAI/OpenRouter SDK? Point its `baseURL` at
  `https://api.usenaive.ai/v1/proxy/openrouter` and authenticate with your Naive
  api key — a transparent, drop-in passthrough. See
  [Use Naive instead of OpenRouter](/docs/getting-started/llm#use-naive-instead-of-openrouter-drop-in-proxy).
</Info>
