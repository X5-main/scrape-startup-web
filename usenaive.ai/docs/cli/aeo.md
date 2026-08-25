> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# aeo

> AI search optimization — LLM responses, mentions tracking, and AI keyword data via the CLI.

## Overview

| Command                             | Description                       | Method          |
| ----------------------------------- | --------------------------------- | --------------- |
| `naive aeo llm-responses <llm>`     | Get AI model responses to queries | Live + Standard |
| `naive aeo llm-scraper`             | Scrape ChatGPT Search results     | Live            |
| `naive aeo llm-mentions <endpoint>` | Track brand mentions in LLMs      | Live            |
| `naive aeo ai-keywords`             | AI search volume data             | Live            |

***

## LLM Responses

Query major AI models and capture their responses.

```bash theme={"theme":"css-variables"}
naive aeo llm-responses chatgpt --keyword "best project management software 2026"
naive aeo llm-responses claude --keyword "top CRM platforms"
naive aeo llm-responses gemini --keyword "ai tools for marketing"
naive aeo llm-responses perplexity --keyword "best web hosting 2026"
```

### Supported LLMs

| LLM        | Endpoint                           | Method          |
| ---------- | ---------------------------------- | --------------- |
| chatgpt    | `/v1/aeo/llm-responses/chatgpt`    | Live + Standard |
| claude     | `/v1/aeo/llm-responses/claude`     | Live + Standard |
| gemini     | `/v1/aeo/llm-responses/gemini`     | Live + Standard |
| perplexity | `/v1/aeo/llm-responses/perplexity` | Live only       |

### Options

| Flag               | Required | Description                                                                       |
| ------------------ | -------- | --------------------------------------------------------------------------------- |
| `--keyword <text>` | Yes      | Query to send to the LLM (sent as `user_prompt`)                                  |
| `--model <name>`   | No       | Model name (sent as `model_name`). Defaults per platform when omitted — see below |

<Note>
  `--keyword` is sent as `user_prompt` to the API. The model field is `model_name`, and **each platform only accepts its own models** — you cannot pass an OpenAI model name to Claude, Gemini, or Perplexity. List valid models with `naive aeo llm-responses models --platform <chatgpt|claude|gemini|perplexity>`.

  When `--model` is omitted, a valid per-platform default is used automatically: `chatgpt` → `gpt-4o-mini`, `claude` → `claude-sonnet-4-5`, `gemini` → `gemini-2.5-flash`, `perplexity` → `sonar`. Perplexity only supports Live mode and only the `sonar`, `sonar-pro`, and `sonar-reasoning-pro` models. Do not send location/language to `llm-responses`.
</Note>

***

## LLM Scraper

Scrape ChatGPT Search results including citations and source links.

```bash theme={"theme":"css-variables"}
naive aeo llm-scraper --keyword "best developer tools 2026"
```

### Options

| Flag               | Required | Description  |
| ------------------ | -------- | ------------ |
| `--keyword <text>` | Yes      | Search query |

***

## LLM Mentions

Track how frequently brands and domains appear in AI responses.

```bash theme={"theme":"css-variables"}
naive aeo llm-mentions search --keyword "CRM software"
naive aeo llm-mentions top-domains --keyword "ai tools"
naive aeo llm-mentions top-pages --keyword "web hosting"
naive aeo llm-mentions aggregated-metrics --target salesforce.com
naive aeo llm-mentions cross-aggregated-metrics --target salesforce.com
```

<Note>
  DataForSEO requires a `target` field that is an **array of objects**, each `{ "keyword": "..." }` or `{ "domain": "..." }`. A top-level `keyword`/`domain` string is invalid. The CLI builds this array for you: `search`, `top-domains`, and `top-pages` take `--keyword` (→ `target: [{ keyword }]`); `aggregated-metrics` and `cross-aggregated-metrics` take `--target <domain>` (→ `target: [{ domain }]`).
</Note>

### Endpoints

| Endpoint                 | Description                                    |
| ------------------------ | ---------------------------------------------- |
| search                   | Detailed mentions with counts and quoted links |
| aggregated-metrics       | Consolidated metrics across dimensions         |
| cross-aggregated-metrics | Compare metrics across multiple targets        |
| top-domains              | Most frequently mentioned domains              |
| top-pages                | Top mentioned pages for a keyword              |

### Options

| Flag                     | Required                                         | Description                              |
| ------------------------ | ------------------------------------------------ | ---------------------------------------- |
| `--keyword <text>`       | For search, top-domains, top-pages               | Topic keyword → `target: [{ keyword }]`  |
| `--target <domain>`      | For aggregated-metrics, cross-aggregated-metrics | Domain to track → `target: [{ domain }]` |
| `--location-code <code>` | No                                               | Location code (default: 2840)            |
| `--language-code <code>` | No                                               | Language code (default: en)              |

There is no date-range flag on `llm-mentions`. The CLI declares `--keyword`, `--target`,
`--location-code` and `--language-code` and nothing else; anything narrower has to be filtered
from the result.

***

## AI Keywords

Get search volume estimates for keywords in AI search engines.

```bash theme={"theme":"css-variables"}
naive aeo ai-keywords --keywords "best ai tools,chatbot for business"
```

### Options

| Flag                     | Required | Description                                               |
| ------------------------ | -------- | --------------------------------------------------------- |
| `--keywords <list>`      | Yes      | Comma-separated keywords (up to 1000), sent as `keywords` |
| `--location-code <code>` | No       | Location code (default: 2840)                             |
| `--language-code <code>` | No       | Language code (default: en)                               |

<Note>
  DataForSEO requires both a location and a language. When omitted, `location_code` defaults to `2840` (United States) and `language_code` to `en`; use `--location-code`/`--language-code` to override.
</Note>
