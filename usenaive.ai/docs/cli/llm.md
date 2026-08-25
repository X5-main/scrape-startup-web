> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# llm

> Run LLM chat completions through OpenRouter (300+ models) from the CLI.

```bash theme={"theme":"css-variables"}
# Run a completion
naive llm chat -m anthropic/claude-sonnet-4.6 "Write a haiku about Paris"

# With a system prompt
naive llm chat -m openai/gpt-5.2 --system "You are terse." "Summarize REST in one line"

# Fallback chain + sampling controls
naive llm chat -m meta-llama/llama-3.3-70b-instruct "Hi" \
  --fallback openai/gpt-5.2 anthropic/claude-sonnet-4.6 \
  --temperature 0.2 --max-tokens 500

# List routable models (free)
naive llm models
naive llm models claude
```

## `naive llm chat [prompt]`

| Option                   | Description                                                            |
| ------------------------ | ---------------------------------------------------------------------- |
| `-m, --model <model>`    | **Required.** OpenRouter model id, e.g. `anthropic/claude-sonnet-4.6`. |
| `--system <text>`        | Optional system prompt.                                                |
| `--fallback <models...>` | Fallback model chain (tried in order).                                 |
| `--temperature <n>`      | Sampling temperature (0–2).                                            |
| `--max-tokens <n>`       | Max tokens to generate.                                                |

Returns the OpenAI-shaped completion plus `credits_used`.

## `naive llm models [search]`

List the models OpenRouter can route to, optionally filtered by an `id`/`name`
keyword. Free.

## Billing

Billed in Naive credits based on the model's token cost (OpenRouter's returned
`usage.cost` × markup). Listing models is free. See
[Credits](/docs/getting-started/credits#llm-calls).
