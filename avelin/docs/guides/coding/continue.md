---
title: "Configure Continue for AVELIN"
description: "Connect the Continue IDE extension (VS Code and JetBrains) to the AVELIN API. Covers both the Anthropic-compatible and OpenAI-compatible endpoints, chat, Agent mode, tab autocomplete, and embeddings."
keywords: [continue, continue.dev, vscode, jetbrains, avelin, anthropic, openai, autocomplete, embeddings]
sidebar_position: 30
---

# Configure Continue for AVELIN

[Continue](https://continue.dev) is an open-source AI coding assistant for VS Code and JetBrains. It supports chat, Agent mode, inline edits, tab autocomplete, and codebase-aware retrieval. This guide walks through connecting Continue to AVELIN so you can use AVELIN models directly inside your IDE.

## What you will set up

- **Chat and Agent mode** powered by AVELIN
- **Tab autocomplete** (optional, requires a fast FIM-capable model)
- **Embeddings** for codebase search and the `@code` context provider
- Both the **Anthropic-compatible** and **OpenAI-compatible** AVELIN endpoints

---

## AVELIN endpoints at a glance

AVELIN exposes two compatible wire formats. Pick one — both point at the same models.

| Format | Provider in Continue | Base URL |
| --- | --- | --- |
| **Anthropic (RECOMMENDED)** | `anthropic` | `https://api.avelin.ai` |
| OpenAI | `openai` | `https://api.avelin.ai/v1` |

- **Anthropic-compatible (recommended):** `https://api.avelin.ai/v1/messages`
  Use `provider: anthropic` and override `apiBase` to `https://api.avelin.ai`. This is the recommended path: Continue's Anthropic integration is mature, supports streaming, prompt caching, tool use, and the full Agent/Apply/Edit workflow.
- **OpenAI-compatible:** `https://api.avelin.ai/v1/chat/completions`
  Use `provider: openai` and override `apiBase` to `https://api.avelin.ai/v1`. Use this when your team already standardizes on the OpenAI wire format, or when you need the legacy `/completions` endpoint for tab autocomplete.

Your API key has the form `sk-avelin-...`. Get one from the AVELIN dashboard. The same key works for both endpoints.

---

## Quick start (5 steps)

1. **Install Continue.**
   - VS Code: install [Continue from the Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=Continue.continue).
   - JetBrains (IntelliJ, PyCharm, WebStorm, GoLand, ...): `Settings → Plugins → Marketplace`, search for **Continue**, install, and restart the IDE.
2. **Open the Continue sidebar.**
   - VS Code: click the Continue icon in the Activity Bar or press `Cmd/Ctrl + L`.
   - JetBrains: `Cmd/Ctrl + J`.
3. **Open the local config file.**
   In the chat input's model dropdown, click the **cog** icon next to *Local Config*. This opens `~/.continue/config.yaml` in your editor.
4. **Paste an AVELIN configuration.** Use one of the full examples below (Anthropic recommended, or OpenAI compatible).
5. **Save the file.** Continue hot-reloads the configuration automatically. Pick the new AVELIN model from the model dropdown and send a message.

That's it. The rest of this page covers advanced setups, autocomplete, embeddings, and troubleshooting.

---

## Where the config file lives

Continue uses **`config.yaml`** as its primary configuration format (the older `config.json` is deprecated; a [migration guide](https://docs.continue.dev/reference/yaml-migration) is available upstream).

| OS | Path |
| --- | --- |
| macOS / Linux | `~/.continue/config.yaml` |
| Windows | `%USERPROFILE%\.continue\config.yaml` |

You can also open this file from the Continue sidebar: open the model dropdown above the chat input and click the **cog** icon next to *Local Config*. The editor has autocomplete for valid field names, and Continue reloads the file as soon as you save.

### Minimum file skeleton

Every `config.yaml` needs these top-level keys:

```yaml
name: My Config
version: 0.0.1
schema: v1

models: []
```

All other top-level sections (`context`, `rules`, `prompts`, `docs`, `mcpServers`, `data`) are optional.

---

## Option A — Anthropic-compatible endpoint (RECOMMENDED)

This is the configuration we recommend for AVELIN. It uses Continue's native `anthropic` provider with the base URL overridden to AVELIN's Anthropic-compatible gateway.

```yaml
name: AVELIN (Anthropic)
version: 0.0.1
schema: v1

models:
  - name: AVELIN Claude Sonnet
    provider: anthropic
    model: claude-sonnet-4-20250514
    apiBase: https://api.avelin.ai
    apiKey: sk-avelin-REPLACE_WITH_YOUR_KEY
    roles:
      - chat
      - edit
      - apply
      - summarize

  - name: AVELIN Claude Opus
    provider: anthropic
    model: claude-opus-4-20250514
    apiBase: https://api.avelin.ai
    apiKey: sk-avelin-REPLACE_WITH_YOUR_KEY
    roles:
      - chat
      - edit
      - apply
```

### What each field does

| Field | Meaning |
| --- | --- |
| `name` | Label shown in the Continue model dropdown. Pick anything. |
| `provider` | Must be `anthropic` for the Anthropic wire format. |
| `model` | The model id. Use whichever id AVELIN exposes (e.g. `claude-sonnet-4-20250514`). |
| `apiBase` | **Required for AVELIN.** Override to `https://api.avelin.ai`. Without this, Continue talks to `api.anthropic.com`. |
| `apiKey` | Your AVELIN key in the form `sk-avelin-...`. |
| `roles` | Which Continue features this model handles. See the Roles section below. |

### Enable prompt caching (optional, saves tokens on long chats)

Anthropic's prompt caching lets Claude cache the system message and prior conversation turns between requests. Continue exposes it via `defaultCompletionOptions.promptCaching`:

```yaml
  - name: AVELIN Claude Sonnet (cached)
    provider: anthropic
    model: claude-sonnet-4-20250514
    apiBase: https://api.avelin.ai
    apiKey: sk-avelin-REPLACE_WITH_YOUR_KEY
    roles:
      - chat
    defaultCompletionOptions:
      promptCaching: true
```

---

## Option B — OpenAI-compatible endpoint

Use this if you prefer the OpenAI wire format, or if AVELIN has told you to use `/v1/chat/completions` specifically.

```yaml
name: AVELIN (OpenAI)
version: 0.0.1
schema: v1

models:
  - name: AVELIN Chat
    provider: openai
    model: claude-sonnet-4-20250514
    apiBase: https://api.avelin.ai/v1
    apiKey: sk-avelin-REPLACE_WITH_YOUR_KEY
    roles:
      - chat
      - edit
      - apply
      - summarize
```

### What each field does

| Field | Meaning |
| --- | --- |
| `provider` | Must be `openai` for the OpenAI wire format. |
| `apiBase` | **Required for AVELIN.** Override to `https://api.avelin.ai/v1`. Note the trailing `/v1` — Continue appends `/chat/completions` to this base. |
| `model` | The model id AVELIN routes to. Use the same ids you would use on the Anthropic endpoint. |
| `apiKey` | Your AVELIN key, `sk-avelin-...`. |

### Disable the Responses API for newer OpenAI model ids

Continue defaults some newer OpenAI ids (o-series, `gpt-5`) to the `/responses` endpoint. AVELIN does not implement `/responses`, so if you use one of those ids you must force the classic chat path:

```yaml
  - name: AVELIN GPT-5 class
    provider: openai
    model: gpt-5
    apiBase: https://api.avelin.ai/v1
    apiKey: sk-avelin-REPLACE_WITH_YOUR_KEY
    useResponsesApi: false
```

### Force the legacy `/completions` endpoint (autocomplete)

For tab autocomplete with an OpenAI-compatible server you may need the legacy `POST /v1/completions` endpoint rather than `/chat/completions`:

```yaml
  - name: AVELIN Autocomplete
    provider: openai
    model: qwen2.5-coder-1.5b
    apiBase: https://api.avelin.ai/v1
    apiKey: sk-avelin-REPLACE_WITH_YOUR_KEY
    useLegacyCompletionsEndpoint: true
    roles:
      - autocomplete
```

---

## Understanding roles

Every model entry declares a `roles` array. A role tells Continue *what this model is allowed to do*. One model can fill several roles; you can also split roles across several models.

| Role | Used for | Typical model size |
| --- | --- | --- |
| `chat` | The Chat panel and Agent mode. | Large, reasoning-capable. |
| `edit` | Inline edits (`Cmd/Ctrl + I`). | Large. |
| `apply` | Applying diffs suggested by the chat or Agent. | Medium-large. |
| `summarize` | Summarizing long context before sending it to the chat model. | Small-medium. |
| `autocomplete` | Tab autocomplete suggestions. | **Small, FIM-trained** (≤10B). |
| `embed` | Producing vectors for codebase search (`@code`). | Embedding model. |
| `rerank` | Re-ordering retrieved chunks for `@code`/`@docs`. | Reranker model. |

If you omit `roles`, Continue defaults to `[chat, edit, apply, summarize]`. For AVELIN, always be explicit.

---

## Full recommended configuration

A single file that wires chat, Agent mode, tab autocomplete, and embeddings to AVELIN.

```yaml
name: AVELIN Full
version: 0.0.1
schema: v1

# -----------------------------------------------------------------------------
# Models
# -----------------------------------------------------------------------------
models:
  # Primary chat + Agent model (Anthropic-compatible — RECOMMENDED)
  - name: AVELIN Claude Sonnet
    provider: anthropic
    model: claude-sonnet-4-20250514
    apiBase: https://api.avelin.ai
    apiKey: sk-avelin-REPLACE_WITH_YOUR_KEY
    capabilities:
      tool_use: true
      image_input: true
    roles:
      - chat
      - edit
      - apply
      - summarize
    defaultCompletionOptions:
      contextLength: 200000
      maxTokens: 16384
      temperature: 0.2
      promptCaching: true

  # Heavier model for hard problems
  - name: AVELIN Claude Opus
    provider: anthropic
    model: claude-opus-4-20250514
    apiBase: https://api.avelin.ai
    apiKey: sk-avelin-REPLACE_WITH_YOUR_KEY
    capabilities:
      tool_use: true
      image_input: true
    roles:
      - chat
      - edit
      - apply

  # Tab autocomplete — small, FIM-trained, fast
  - name: AVELIN Autocomplete
    provider: openai
    model: qwen2.5-coder-1.5b
    apiBase: https://api.avelin.ai/v1
    apiKey: sk-avelin-REPLACE_WITH_YOUR_KEY
    useLegacyCompletionsEndpoint: true
    roles:
      - autocomplete
    autocompleteOptions:
      disable: false
      maxPromptTokens: 1024
      debounceDelay: 250
      modelTimeout: 150
      maxSuffixPercentage: 0.2
      prefixPercentage: 0.3
      onlyMyCode: true

  # Embeddings for @code codebase search
  - name: AVELIN Embeddings
    provider: openai
    model: text-embedding-3-small
    apiBase: https://api.avelin.ai/v1
    apiKey: sk-avelin-REPLACE_WITH_YOUR_KEY
    roles:
      - embed
    embedOptions:
      maxChunkSize: 512
      maxBatchSize: 100

# -----------------------------------------------------------------------------
# Context providers (what @ mentions pull in)
# -----------------------------------------------------------------------------
context:
  - provider: code     # codebase search, uses the embed model above
  - provider: docs     # index external doc sites listed under `docs:`
  - provider: file     # attach a specific file
  - provider: diff     # staged / unstaged git diff
  - provider: terminal # current terminal contents
  - provider: web      # live web search

# -----------------------------------------------------------------------------
# Rules (injected into the system prompt for chat / Agent / edit)
# -----------------------------------------------------------------------------
rules:
  - You are AVELIN, a precise and senior-level coding assistant.
  - Prefer small, targeted edits over full rewrites unless asked.
  - When a file is large, edit only the relevant region.
  - Always preserve existing code style and formatting conventions.

# -----------------------------------------------------------------------------
# External documentation to index (used by @docs)
# -----------------------------------------------------------------------------
docs:
  - name: AVELIN Docs
    startUrl: https://docs.avelin.ai/
```

> **Do not commit this file** if it contains a real `apiKey`. Either use the Hub's secrets syntax (`apiKey: ${{ secrets.AVELIN_API_KEY }}`) or keep the file out of source control.

---

## Chat and Agent mode

With the configuration above, AVELIN appears in the Continue model dropdown. The three modes in the chat input work out of the box:

- **Chat** — conversational Q&A over the codebase and the attached context.
- **Agent** — the model can invoke tools (file read/write, terminal, MCP servers). This requires `capabilities.tool_use: true` on the model, which AVELIN's Anthropic-compatible endpoint supports.
- **Plan** — read-only reasoning over a task before writing code.

Switch between them from the mode picker next to the chat input. The base system message for each mode is configurable via `chatOptions`:

```yaml
    chatOptions:
      baseSystemMessage: "You are AVELIN. Answer concisely and show your work."
      baseAgentSystemMessage: "You are AVELIN Agent. Use tools aggressively to verify facts."
      basePlanSystemMessage: "You are AVELIN Planner. Produce a step-by-step plan, no code."
```

---

## Tab autocomplete

Tab autocomplete streams a completion suggestion as you type. It is **not** the same model as chat — it needs a small, FIM-trained (Fill-In-the-Middle) code model, typically ≤10B parameters. Larger chat models (Claude, GPT-5) produce poor autocomplete because they are not trained on the FIM prompt format Continue sends.

### Recommended model choices for AVELIN autocomplete

- `qwen2.5-coder-1.5b` (fastest, good for laptops)
- `qwen2.5-coder-7b` (better quality, still fast)
- `codestral-latest` (Mistral, closed)
- `mercury-coder` (if AVELIN exposes it)

### Configuration

```yaml
  - name: AVELIN Autocomplete
    provider: openai
    model: qwen2.5-coder-1.5b
    apiBase: https://api.avelin.ai/v1
    apiKey: sk-avelin-REPLACE_WITH_YOUR_KEY
    useLegacyCompletionsEndpoint: true
    roles:
      - autocomplete
    autocompleteOptions:
      disable: false
      maxPromptTokens: 1024
      debounceDelay: 250
      modelTimeout: 150
      maxSuffixPercentage: 0.2
      prefixPercentage: 0.3
      onlyMyCode: true
```

The OpenAI-compatible endpoint is used here because Continue's autocomplete path is built around the FIM `/completions` wire format. Set `useLegacyCompletionsEndpoint: true` so Continue calls `POST /v1/completions` instead of `/v1/chat/completions`.

### Autocomplete options reference

| Field | Default | Meaning |
| --- | --- | --- |
| `disable` | `false` | Turn autocomplete off entirely. |
| `maxPromptTokens` | `1024` | Maximum tokens in the FIM prompt sent to the model. |
| `debounceDelay` | `250` | Milliseconds to wait after the last keystroke before requesting. |
| `modelTimeout` | `150` | Milliseconds to wait for the model before giving up. |
| `maxSuffixPercentage` | `0.2` | Fraction of prompt budget reserved for suffix context. |
| `prefixPercentage` | `0.3` | Fraction of prompt budget reserved for prefix context. |
| `onlyMyCode` | `true` | Restrict context to files in your workspace. |

### IDE-level autocomplete settings

In addition to the YAML, Continue exposes per-user settings in the IDE:

- **VS Code:** `Settings → Continue`:
  - `Continue: Multiline Completions` — `auto` (default), `always`, or `never`.
  - `Continue: Disable Autocomplete in Files` — comma-separated glob patterns (e.g. `**/*.md, **/*.txt`).
  - Also ensure `editor.inlineSuggest.enabled` is `true` in VS Code settings.
- **JetBrains:** `Settings → Tools → Continue → Enable Tab Autocomplete`.

### Keyboard shortcuts

| Action | VS Code | JetBrains |
| --- | --- | --- |
| Accept suggestion | `Tab` | `Tab` |
| Dismiss suggestion | `Esc` | `Esc` |
| Toggle autocomplete | `Cmd/Ctrl + K`, `Cmd/Ctrl + A` | Settings |
| Manual trigger (if `inlineSuggest.enabled = false`) | bind `editor.action.inlineSuggest.trigger` | — |

To accept one line at a time in VS Code, bind `editor.action.inlineSuggest.acceptNextLine` to `Tab` with the when-clause `inlineSuggestionVisible && !editorReadonly`.

### Disabling autocomplete temporarily

- **VS Code:** click the Continue icon in the bottom-right status bar, or uncheck *Enable Tab Autocomplete* in settings.
- **JetBrains:** `Settings → Tools → Continue → uncheck Enable Tab Autocomplete`.

---

## Embeddings and codebase search

The `@code` context provider lets chat search your workspace by meaning, not just text. It requires an embedding model with the `embed` role.

### Configure an embedding model

AVELIN serves OpenAI-compatible embeddings at `POST https://api.avelin.ai/v1/embeddings`. Any embedding model AVELIN exposes works; the examples below use `text-embedding-3-small`.

```yaml
  - name: AVELIN Embeddings
    provider: openai
    model: text-embedding-3-small
    apiBase: https://api.avelin.ai/v1
    apiKey: sk-avelin-REPLACE_WITH_YOUR_KEY
    roles:
      - embed
    embedOptions:
      maxChunkSize: 512     # minimum 128
      maxBatchSize: 100     # minimum 1
```

### How it works

1. The first time you use `@code` (or on re-index), Continue chunks every file in your workspace, sends them to the embed model, and stores the vectors locally.
2. On each chat request that uses `@code`, Continue embeds your query, finds the nearest chunks, and injects them as context.
3. If you also configure a `rerank` model, the top-k chunks are re-ordered before being injected.

### Re-indexing

If embeddings look stale (renamed files, deleted code), trigger a re-index from the Continue sidebar: open the `@code` provider and choose *Re-index codebase*.

### Ignored files

Continue respects your `.gitignore` and `.continueignore` files. Add paths to `.continueignore` (same syntax as `.gitignore`) to exclude generated code, `node_modules`, build outputs, etc.

---

## External docs with `@docs`

Continue can also index external documentation sites and expose them via `@docs`. This is useful for feeding AVELIN the AVELIN docs themselves, or any library reference you use daily.

```yaml
docs:
  - name: AVELIN Docs
    startUrl: https://docs.avelin.ai/
  - name: Continue Docs
    startUrl: https://docs.continue.dev/
  - name: FastAPI
    startUrl: https://fastapi.tiangolo.com/
```

Continue crawls these sites, chunks them, and embeds them with your configured embed model. In chat, type `@docs AVELIN` to scope retrieval to the AVELIN docs only.

---

## Rules — shaping AVELIN's behavior in your project

Rules are concatenated into the system message for chat, Agent, and edit requests. They are the easiest way to give AVELIN project-specific conventions.

### Inline rules

```yaml
rules:
  - Prefer small, targeted edits over full rewrites unless asked.
  - Always preserve existing code style.
  - When editing Python, follow PEP 8 and prefer type hints.
```

### Rules from files

For larger rule sets, keep them in Markdown files with frontmatter:

```md
---
name: Project conventions
---
- Use `uv` for Python dependency management.
- Prefer dataclasses over raw dicts.
- Every public function has a docstring.
```

Reference them:

```yaml
rules:
  - file://./.continue/rules/conventions.md
```

---

## Prompt files (slash commands)

Custom slash commands are defined as Markdown prompt files and invoked as `/name` in the chat input. Example:

```md
---
name: review
description: Review the staged diff as a senior engineer
invokable: true
---
Read the staged git diff and produce a concise senior-engineer code review.
Flag correctness issues first, then performance, then style.
```

Save under `.continue/prompts/review.md` and call it as `/review` in chat.

---

## Using MCP servers with AVELIN

Agent mode can call tools via the Model Context Protocol. AVELIN supports tool use on the Anthropic-compatible endpoint, so any MCP server Continue supports works.

```yaml
mcpServers:
  - name: filesystem
    command: npx
    args:
      - -y
      - "@modelcontextprotocol/server-filesystem"
      - "/Users/you/Devs/your-project"

  - name: postgres
    command: npx
    args:
      - -y
      - "@modelcontextprotocol/server-postgres"
      - "postgresql://user:pass@localhost:5432/db"
    env:
      PGSSLMODE: disable
```

Make sure your AVELIN chat model has `capabilities.tool_use: true` (set explicitly) and the `chat` role, or Agent mode will refuse to invoke tools.

---

## Verification steps

After saving `config.yaml`, run through this checklist to confirm everything is wired correctly.

1. **The config file reloaded.**
   Open the Continue sidebar. The model dropdown should show the `name` values from your YAML (e.g. *AVELIN Claude Sonnet*). If not, Continue failed to parse the file — open Developer Tools (VS Code: `Cmd/Ctrl + Shift + P → Toggle Developer Tools`, *Console* tab) and look for YAML errors.
2. **Chat works.**
   Select the AVELIN chat model, type `ping`, and send. You should see a streamed reply. The model name AVELIN routed to should match the `model` id in your YAML.
3. **Agent mode works.**
   Switch the chat input to *Agent* mode and ask: *list the files in the current directory*. AVELIN should call the filesystem tool and return the listing.
4. **Inline edit works.**
   Select a function, press `Cmd/Ctrl + I`, describe a change, and hit Enter. AVELIN should return a diff you can accept or reject.
5. **Autocomplete works.**
   In any code file, type a partial line and wait ~250 ms. A ghost completion should appear; press `Tab` to accept. If nothing appears, verify the autocomplete model entry has `roles: [autocomplete]` and that `Continue: Enable Tab Autocomplete` is on in IDE settings.
6. **Embeddings work.**
   Type `@code` in chat and pick a query about your codebase. The first call indexes; subsequent calls should return relevant chunks within a second or two.
7. **The key is accepted.**
   If you see `401 Unauthorized`, your `apiKey` is not in the `sk-avelin-...` form or has been revoked — generate a new one from the AVELIN dashboard.

---

## Troubleshooting

### 401 Unauthorized

```
Error: 401 Unauthorized from https://api.avelin.ai/v1/messages
```

- Check that `apiKey` starts with `sk-avelin-` and has no stray whitespace or quotes.
- If you stored the key in an environment variable, reference it via the Hub secrets syntax: `apiKey: ${{ secrets.AVELIN_API_KEY }}`.
- Regenerate the key from the AVELIN dashboard if it may have been rotated.

### 404 Not Found

```
Error: 404 Not Found on https://api.avelin.ai/v1/chat/completions
```

- On the OpenAI-compatible path, `apiBase` must be `https://api.avelin.ai/v1` (with the trailing `/v1`). Without it, Continue posts to `https://api.avelin.ai/chat/completions` which does not exist.
- On the Anthropic path, `apiBase` must be `https://api.avelin.ai` (no `/v1`). Continue appends `/v1/messages` itself.
- Check that the `model` id you wrote is one AVELIN actually routes to.

### "Organization must be verified" / Responses API error

```
Error: Your organization must be verified to use the Responses API
```

Continue defaults some OpenAI model ids to the newer `/responses` endpoint. AVELIN does not implement that endpoint. Force the classic chat path:

```yaml
    useResponsesApi: false
```

### Autocomplete returns nothing, or only single lines

- Confirm the autocomplete model has `roles: [autocomplete]`.
- Confirm `useLegacyCompletionsEndpoint: true` is set (AVELIN's autocomplete uses the FIM `/completions` wire format).
- In VS Code, make sure `editor.inlineSuggest.enabled` is `true`.
- Try `multilineCompletions: always` in `autocompleteOptions` if you only ever see single-line suggestions.
- Large chat models (Claude, GPT-5) are **not** suitable autocomplete models — switch to a FIM-trained model like `qwen2.5-coder-1.5b`.

### Chat streams but Agent mode refuses to call tools

- The chat model must have `capabilities.tool_use: true` in its YAML entry.
- Agent mode requires the `chat` role (which is included in the default role set).
- On the Anthropic-compatible endpoint, tool use works out of the box. On the OpenAI-compatible endpoint, confirm AVELIN has told you tool use is enabled for your key.

### Embeddings fail or time out

```
Error: connection to https://api.avelin.ai/v1/embeddings timed out
```

- Check the network path. If you are behind a proxy, set `requestOptions.proxy` on the embed model.
- Reduce `embedOptions.maxBatchSize` (e.g. to `20`) to send smaller batches.
- A huge workspace may take several minutes on the first index — that is normal. Subsequent indexes are incremental.

### Continue ignores my edits to config.yaml

- Confirm you are editing the right file (`~/.continue/config.yaml`, **not** a workspace `.continuerc.json` unless you intend the workspace override).
- Continue reloads on save. If the YAML is invalid, the previous config stays in effect and an error is logged — check Developer Tools console.
- If you are using the Hub, a Hub-managed config takes precedence over the local file for the properties it defines. Switch to a local agent from the model dropdown to use your local file.

### YAML parse errors

Common mistakes:

- Forgetting the leading `-` on list items under `models:`.
- Indenting `apiKey:` at the wrong level (it must line up with `name:`).
- Using tabs instead of spaces.
- Unquoted colons in `name:` (wrap the name in quotes: `name: "AVELIN: Sonnet"`).

### JetBrains-specific: logs

JetBrains writes Continue's core log to `~/.continue/logs/core.log`. Tail it while reproducing the problem:

```bash
tail -f ~/.continue/logs/core.log
```

### VS Code-specific: developer tools

`Cmd/Ctrl + Shift + P → Toggle Developer Tools`, then the *Console* tab. Network errors, YAML parse errors, and streaming failures all surface here.

---

## Best practices

1. **Prefer the Anthropic-compatible endpoint** for chat and Agent mode. It gives you streaming, prompt caching, tool use, and the full Edit/Apply pipeline.
2. **Split roles across models.** Use a large model for chat/Agent, a small FIM model for autocomplete, and a dedicated embedding model for `@code`. Do not ask one model to do all four.
3. **Keep `apiKey` out of source control.** Either use the Hub's secrets syntax or add `config.yaml` to `.gitignore`.
4. **Add project rules.** A few well-written rules in YAML or a `file://` rule file dramatically improve AVELIN's output on your codebase.
5. **Index your own docs.** Adding your product's documentation under `docs:` and querying it with `@docs` lets AVELIN answer API questions without hallucinating.
6. **Use `.continueignore`.** Keep `node_modules`, build output, generated code, and vendored dependencies out of the embedding index to keep retrieval fast and relevant.
7. **Tune autocomplete.** `debounceDelay` around `200–300` ms and `modelTimeout` around `150` ms give a good balance between responsiveness and quality. If suggestions feel slow, lower `maxPromptTokens` before switching models.
8. **Scope Agent mode with MCP.** Give Agent only the tools it needs (`filesystem` for the project root, a database MCP for the dev DB, etc.). Avoid pointing it at production.
9. **Pin model ids.** Don't use `latest` aliases in production configs — pin a specific id (e.g. `claude-sonnet-4-20250514`) so behavior is reproducible.
10. **Re-index after large refactors.** If you rename a lot of files or move code between modules, trigger a re-index so `@code` stops returning stale chunks.

---

## Advanced configuration patterns

### Using YAML anchors to avoid repetition

If you have multiple AVELIN models that share the same `apiBase` and `apiKey`, use YAML anchors to keep the config DRY:

```yaml
%YAML 1.1
---
name: AVELIN DRY Config
version: 0.0.1
schema: v1

# Define defaults once
avelin_defaults: &avelin_defaults
  provider: anthropic
  apiBase: https://api.avelin.ai
  apiKey: sk-ave..._KEY

models:
  - name: AVELIN Sonnet
    <<: *avelin_defaults
    model: claude-sonnet-4-20250514
    roles:
      - chat
      - edit
      - apply

  - name: AVELIN Opus
    <<: *avelin_defaults
    model: claude-opus-4-20250514
    roles:
      - chat

  - name: AVELIN Haiku
    <<: *avelin_defaults
    model: claude-3-5-haiku-20241022
    roles:
      - summarize
```

The `%YAML 1.1` header is required to enable anchors and aliases.

### Workspace-level overrides with `.continuerc.json`

For project-specific tweaks that don't affect your global config, create a `.continuerc.json` in your project root:

```json
{
  "mergeBehavior": "merge",
  "rules": [
    "This project uses TypeScript strict mode.",
    "Prefer async/await over callbacks."
  ],
  "context": [
    {
      "provider": "file",
      "params": {
        "paths": ["src/types/api.ts"]
      }
    }
  ]
}
```

`mergeBehavior` can be `"merge"` (default, arrays and objects are combined) or `"overwrite"` (top-level properties replace the global config).

### Hub-managed configurations

If your team uses Continue's Hub, you can pull shared configurations and override only what you need locally:

```yaml
name: My Local Override
version: 0.0.1
schema: v1

models:
  - uses: team/avelin-standard
    with:
      AVELIN_API_KEY: ${{ secrets.AVELIN_API_KEY }}
    override:
      defaultCompletionOptions:
        temperature: 0.3
        maxTokens: 8192
```

The `uses` syntax pulls a named config from the Hub, `with` injects secrets, and `override` lets you customize specific fields without duplicating the entire model definition.

---

## Performance tuning

### Reducing latency

If AVELIN responses feel slow:

1. **Lower `contextLength`** in `defaultCompletionOptions`. Sending 200k tokens of context takes longer to process than 50k.
2. **Reduce `maxTokens`** for chat if you don't need long responses. `maxTokens: 4096` is often sufficient for Q&A.
3. **Enable prompt caching** on the Anthropic endpoint (see the prompt caching section above). Cached turns are noticeably faster.
4. **Use a smaller model** for summarization. The `summarize` role condenses long context before it reaches the chat model — a fast model like `claude-3-5-haiku` works well here.

### Reducing token usage

- **Use `@code` selectively.** Attaching the entire codebase to every query burns tokens. Instead, use `@file` for specific files or `@folder` for a subdirectory.
- **Write concise rules.** Every rule is injected into the system prompt on every request. Keep them focused.
- **Limit `maxPromptTokens` for autocomplete.** Autocomplete doesn't need 4k tokens of context — 1024 is usually plenty.

### Handling large codebases

For repositories with hundreds of thousands of lines:

1. **Add a `.continueignore`** at the project root. Exclude `node_modules`, `dist`, `build`, `.git`, and any generated code.
2. **Increase `embedOptions.maxBatchSize`** to speed up initial indexing (if your network can handle it).
3. **Use `@code` with a scope.** Instead of `@code find the auth middleware`, try `@code in src/middleware find the auth handler`.
4. **Re-index after major refactors.** Continue's index is incremental, but large renames or moves can leave stale chunks.

---

## Migration from `config.json`

If you have an old `config.json` from a previous Continue version, migrate it to `config.yaml`. The [official migration guide](https://docs.continue.dev/reference/yaml-migration) covers all the field renames, but here's a quick example:

### Old `config.json` (deprecated)

```json
{
  "models": [
    {
      "title": "AVELIN Chat",
      "provider": "openai",
      "model": "claude-sonnet-4-20250514",
      "apiBase": "https://api.avelin.ai/v1",
      "apiKey": "sk-ave..."
    }
  ],
  "tabAutocompleteModel": {
    "title": "AVELIN Autocomplete",
    "provider": "openai",
    "model": "qwen2.5-coder-1.5b",
    "apiBase": "https://api.avelin.ai/v1",
    "apiKey": "sk-ave..."
  },
  "embeddingsProvider": {
    "provider": "openai",
    "model": "text-embedding-3-small",
    "apiBase": "https://api.avelin.ai/v1",
    "apiKey": "sk-ave..."
  }
}
```

### New `config.yaml`

```yaml
name: AVELIN
version: 0.0.1
schema: v1

models:
  - name: AVELIN Chat
    provider: openai
    model: claude-sonnet-4-20250514
    apiBase: https://api.avelin.ai/v1
    apiKey: sk-ave...
    roles:
      - chat
      - edit
      - apply

  - name: AVELIN Autocomplete
    provider: openai
    model: qwen2.5-coder-1.5b
    apiBase: https://api.avelin.ai/v1
    apiKey: sk-ave...
    roles:
      - autocomplete

  - name: AVELIN Embeddings
    provider: openai
    model: text-embedding-3-small
    apiBase: https://api.avelin.ai/v1
    apiKey: sk-ave...
    roles:
      - embed
```

Key changes:

- `title` → `name`
- `tabAutocompleteModel` → a model entry with `roles: [autocomplete]`
- `embeddingsProvider` → a model entry with `roles: [embed]`
- All models are now in a single flat `models:` list, differentiated by their `roles`.

Delete `config.json` after migrating to avoid confusion.

---

## Security considerations

### API key management

- **Never commit `config.yaml` with a real API key** to a public or shared repository. Add it to `.gitignore`:

  ```
  ~/.continue/config.yaml
  ```

- **Use the Hub's secrets syntax** if your team shares configs:

  ```yaml
  apiKey: ${{ secrets.AVELIN_API_KEY }}
  ```

  Each developer sets `AVELIN_API_KEY` in their Hub account, and the secret is injected at runtime.

- **Rotate keys regularly.** If you suspect a key has been exposed, revoke it immediately from the AVELIN dashboard and generate a new one.

### Network security

- **Verify SSL by default.** Continue verifies SSL certificates for all HTTPS requests. If you are behind a corporate proxy that intercepts TLS, you may need to set:

  ```yaml
  requestOptions:
    verifySsl: false
  ```

  or point to your corporate CA bundle:

  ```yaml
  requestOptions:
    caBundlePath: /path/to/corporate-ca.pem
  ```

- **Use a proxy if required.** If your network requires all outbound traffic to go through a proxy:

  ```yaml
  requestOptions:
    proxy: http://proxy.corp.local:8080
    noProxy: localhost,127.0.0.1
  ```

### MCP server security

MCP servers run as local processes and can access your filesystem, terminal, and network. Only add MCP servers you trust. For example, the `filesystem` MCP server should be pointed at your project directory, not `/`:

```yaml
mcpServers:
  - name: filesystem
    command: npx
    args:
      - -y
      - "@modelcontextprotocol/server-filesystem"
      - "/Users/you/Devs/my-project"  # NOT "/"
```

---

## Team workflows

### Sharing a team configuration

If your team uses Continue's Hub, you can publish a shared AVELIN configuration:

1. Sign in to [continue.dev](https://continue.dev).
2. Create a new config and name it (e.g., `team/avelin-standard`).
3. Add your AVELIN models, rules, and context providers.
4. Publish it. Team members can now reference it with `uses: team/avelin-standard`.

### Workspace-specific rules

For project-specific conventions, create a `.continue/rules/` directory in your repo:

```
.continue/
  rules/
    python.md
    typescript.md
    testing.md
```

Each file is a Markdown file with frontmatter:

```md
---
name: Python conventions
---
- Use `uv` for dependency management.
- Prefer dataclasses over raw dicts.
- Every public function has a docstring.
- Use type hints everywhere.
```

Reference them in your workspace's `.continuerc.json`:

```json
{
  "mergeBehavior": "merge",
  "rules": [
    "file://./.continue/rules/python.md",
    "file://./.continue/rules/typescript.md"
  ]
}
```

### CI/CD integration

Continue can run as a CLI for automated code reviews or test generation. Install the CLI:

```bash
npm install -g @continuedev/cli
```

Then use it in your CI pipeline:

```yaml
# .github/workflows/continue-review.yml
name: Continue Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Continue review
        env:
          AVELIN_API_KEY: ${{ secrets.AVELIN_API_KEY }}
        run: |
          continue review --model claude-sonnet-4-20250514
```

---

## Frequently asked questions

### Can I use AVELIN with Continue's free tier?

Yes. Continue itself is free and open-source. You only pay for the AVELIN API usage. There is no Continue subscription required.

### Does AVELIN work with Continue's Agent mode?

Yes, on the Anthropic-compatible endpoint. Make sure your chat model has `capabilities.tool_use: true` and the `chat` role. Agent mode lets AVELIN call tools (file read/write, terminal, MCP servers) to complete tasks.

### Why is autocomplete using the OpenAI endpoint instead of Anthropic?

Continue's autocomplete path is built around the FIM (Fill-In-the-Middle) `/completions` wire format, which is part of the OpenAI-compatible API. The Anthropic Messages API does not have a FIM endpoint, so autocomplete always uses the OpenAI-compatible path.

### Can I use different AVELIN models for different roles?

Yes. You can define multiple model entries, each with a different `model` id and `roles` array. For example:

```yaml
models:
  - name: AVELIN Opus (hard problems)
    provider: anthropic
    model: claude-opus-4-20250514
    apiBase: https://api.avelin.ai
    apiKey: sk-ave...
    roles:
      - chat

  - name: AVELIN Haiku (fast summarization)
    provider: anthropic
    model: claude-3-5-haiku-20241022
    apiBase: https://api.avelin.ai
    apiKey: sk-ave...
    roles:
      - summarize
```

Switch between them from the model dropdown in the Continue sidebar.

### How do I know if my AVELIN key is working?

Send a simple `ping` message in the Continue chat panel. If you get a response, the key is valid and the endpoint is reachable. If you see `401 Unauthorized`, the key is invalid or revoked. If you see `404 Not Found`, the `apiBase` or `model` is misconfigured.

### Can I use AVELIN with Continue's `@docs` provider?

Yes. Add your documentation site to the `docs:` section of your config:

```yaml
docs:
  - name: AVELIN Docs
    startUrl: https://docs.avelin.ai/
```

Continue will crawl and index the site, and you can query it with `@docs AVELIN` in chat.

### Is there a rate limit on AVELIN API calls from Continue?

AVELIN's rate limits apply regardless of the client. If you hit a rate limit, Continue will surface an error like `429 Too Many Requests`. You can reduce the frequency of requests by increasing `autocompleteOptions.debounceDelay` or by using a smaller model for summarization.

---

## Reference links

- [Continue — `config.yaml` reference](https://docs.continue.dev/reference)
- [Continue — Model providers overview](https://docs.continue.dev/customize/model-providers/overview)
- [Continue — OpenAI configuration](https://docs.continue.dev/customize/model-providers/top-level/openai)
- [Continue — Anthropic configuration](https://docs.continue.dev/customize/model-providers/top-level/anthropic)
- [Continue — Autocomplete deep dive](https://docs.continue.dev/customize/deep-dives/autocomplete)
- [Continue — Configuration management](https://docs.continue.dev/customize/deep-dives/configuration)
- [Continue — YAML migration guide (from `config.json`)](https://docs.continue.dev/reference/yaml-migration)
- [AVELIN API documentation](https://docs.avelin.ai/)
