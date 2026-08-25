> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# AEO API Reference

> All AEO/GEO REST endpoints — LLM Responses, Scraper, AI Keywords, and LLM Mentions.

## Overview

Answer-Engine / Generative-Engine Optimization. Company-scoped; requires `Authorization: Bearer nv_sk_…`. Pay-per-use via our data provider. MCP equivalents: `naive_aeo_discover` + `naive_aeo_execute(_async)`.

LLM Responses (ChatGPT/Claude/Gemini) offer **Live** + **Standard** `…/task`; Perplexity is Live-only. LLM Scraper, AI Keywords, and LLM Mentions are **Live**.

<Info>
  REST callers: LLM Responses require `user_prompt` (string, ≤500 chars) and `model_name`; the CLI maps `--keyword` → `user_prompt`. Each platform accepts only its own models — use `GET .../{platform}/models` to list them — and when `--model` is omitted the CLI supplies a valid per-platform default (chatgpt→`gpt-4o-mini`, claude→`claude-sonnet-4-5`, gemini→`gemini-2.5-flash`, perplexity→`sonar`). Do not send location/language to LLM Responses. LLM Mentions require `target` as an ARRAY OF OBJECTS, each `{ "keyword": "..." }` or `{ "domain": "example.com" }`, e.g. `{ "target": [{ "domain": "example.com" }] }`; a top-level `keyword` or `domain` string is invalid.
</Info>

## LLM Responses

| Method | Path                                        | Description                     |
| ------ | ------------------------------------------- | ------------------------------- |
| POST   | `/v1/aeo/llm-responses/chatgpt`             | ChatGPT response (Live)         |
| POST   | `/v1/aeo/llm-responses/chatgpt/task`        | ChatGPT response (Standard)     |
| GET    | `/v1/aeo/llm-responses/chatgpt/tasks-ready` | Check ready tasks               |
| GET    | `/v1/aeo/llm-responses/chatgpt/task/:id`    | Retrieve task results           |
| GET    | `/v1/aeo/llm-responses/chatgpt/models`      | Available ChatGPT models        |
| POST   | `/v1/aeo/llm-responses/claude`              | Claude response (Live)          |
| POST   | `/v1/aeo/llm-responses/claude/task`         | Claude response (Standard)      |
| GET    | `/v1/aeo/llm-responses/claude/tasks-ready`  | Check ready tasks               |
| GET    | `/v1/aeo/llm-responses/claude/task/:id`     | Retrieve task results           |
| GET    | `/v1/aeo/llm-responses/claude/models`       | Available Claude models         |
| POST   | `/v1/aeo/llm-responses/gemini`              | Gemini response (Live)          |
| POST   | `/v1/aeo/llm-responses/gemini/task`         | Gemini response (Standard)      |
| GET    | `/v1/aeo/llm-responses/gemini/tasks-ready`  | Check ready tasks               |
| GET    | `/v1/aeo/llm-responses/gemini/task/:id`     | Retrieve task results           |
| GET    | `/v1/aeo/llm-responses/gemini/models`       | Available Gemini models         |
| POST   | `/v1/aeo/llm-responses/perplexity`          | Perplexity response (Live only) |
| GET    | `/v1/aeo/llm-responses/perplexity/models`   | Available Perplexity models     |

## LLM Scraper

| Method | Path                                        | Description                       |
| ------ | ------------------------------------------- | --------------------------------- |
| POST   | `/v1/aeo/llm-scraper/chatgpt`               | Scrape ChatGPT Search (Live)      |
| POST   | `/v1/aeo/llm-scraper/chatgpt/html`          | Scrape ChatGPT Search HTML (Live) |
| POST   | `/v1/aeo/llm-scraper/chatgpt/task`          | Scrape ChatGPT Search (Standard)  |
| GET    | `/v1/aeo/llm-scraper/chatgpt/tasks-ready`   | Check ready tasks                 |
| GET    | `/v1/aeo/llm-scraper/chatgpt/task/:id`      | Retrieve task results             |
| GET    | `/v1/aeo/llm-scraper/chatgpt/task/:id/html` | Retrieve task results (HTML)      |

## AI Keyword Data

| Method | Path                                | Description                       |
| ------ | ----------------------------------- | --------------------------------- |
| POST   | `/v1/aeo/ai-keywords/search-volume` | AI search volume estimates (Live) |

## LLM Mentions

| Method | Path                                            | Description                            |
| ------ | ----------------------------------------------- | -------------------------------------- |
| POST   | `/v1/aeo/llm-mentions/search`                   | Detailed mentions data (Live)          |
| POST   | `/v1/aeo/llm-mentions/aggregated-metrics`       | Aggregated mention metrics (Live)      |
| POST   | `/v1/aeo/llm-mentions/cross-aggregated-metrics` | Cross-target metrics comparison (Live) |
| POST   | `/v1/aeo/llm-mentions/top-domains`              | Most mentioned domains (Live)          |
| POST   | `/v1/aeo/llm-mentions/top-pages`                | Top mentioned pages (Live)             |

## Utility

| Method | Path              | Description   |
| ------ | ----------------- | ------------- |
| POST   | `/v1/aeo/id-list` | List task IDs |

## Examples

<CodeGroup>
  ```bash curl (Live — ChatGPT response) theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/aeo/llm-responses/chatgpt \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "user_prompt": "best CRM for startups", "model_name": "gpt-4o" }'
  ```

  ```bash curl (Live — brand mentions across LLMs) theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/aeo/llm-mentions/search \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "target": [{ "keyword": "best CRM" }] }'
  ```
</CodeGroup>
