> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Generation

> GET /v1/llm/generation — fetch usage and cost stats for a prior completion.

Fetch usage/cost stats for a completed request by its `id` (the `id` returned in
a chat completion). Useful for auditing or fetching cost asynchronously. Free.
Mirrors OpenRouter's [generation endpoint](https://openrouter.ai/docs/api/api-reference/generations/get-generation).

<ParamField query="id" type="string" required>
  The generation id from a prior chat completion response.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/llm/generation?id=gen-xxxxxxxx" \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "data": {
      "id": "gen-xxxxxxxx",
      "model": "anthropic/claude-sonnet-4.6",
      "total_cost": 0.00012,
      "tokens_prompt": 14,
      "tokens_completion": 16,
      "native_tokens_prompt": 14,
      "native_tokens_completion": 16
    }
  }
  ```
</ResponseExample>

**Cost:** Free.

<Info>
  Stats are populated by OpenRouter after a generation finishes accounting, so a
  lookup immediately after a completion may briefly return `provider_error` (404)
  until the record is available. For real-time cost you don't need this endpoint —
  every chat completion already returns `usage.cost` (and Naive `credits_used`)
  inline.
</Info>
