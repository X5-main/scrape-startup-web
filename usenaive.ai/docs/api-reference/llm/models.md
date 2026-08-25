> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Models

> GET /v1/llm/models — list the models OpenRouter can route to.

Lists every model OpenRouter can route to, optionally filtered by keyword. Free
(no credits). Mirrors OpenRouter's [models endpoint](https://openrouter.ai/docs/api/api-reference/models/get-models).

<ParamField query="search" type="string">
  Filter models by `id`/`name` keyword, e.g. `claude` or `gpt`.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/llm/models?search=claude \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "count": 1,
    "models": [
      {
        "id": "anthropic/claude-sonnet-4.6",
        "name": "Anthropic: Claude Sonnet 4.6",
        "context_length": 200000,
        "pricing": { "prompt": "0.000003", "completion": "0.000015" }
      }
    ]
  }
  ```
</ResponseExample>

**Cost:** Free.
