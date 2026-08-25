# Cursor Integration

[Cursor](https://cursor.com) is an AI-first code editor built on a VS Code fork. It provides intelligent code completion (Tab), chat assistance (Cmd+L), Composer for multi-file editing (Cmd+I), and an Agent mode that can plan and execute multi-step coding tasks. AVELIN works as a drop-in backend for both Cursor's OpenAI and Anthropic wire formats.

> **Why AVELIN + Cursor?** Cursor's Agent mode shines with large context and fast throughput — AVELIN delivers 1M-token context windows, ~100 tps on `avelin-coding-pro`, and automatic provider failover. You get frontier-tier coding quality without Cursor's usage caps.

---

## Quick Setup (3 minutes)

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It looks like `sk-avelin-...`.

### Step 2: Open Cursor Settings

1. Open Cursor
2. Click the gear icon (top right) → **Cursor Settings**
3. Click **Models** in the left sidebar

   *Or press `Cmd+Shift+J` (Mac) / `Ctrl+Shift+J` (Windows) to jump straight to Models.*

### Step 3: Configure the Anthropic endpoint (RECOMMENDED)

We strongly recommend the **Anthropic** endpoint — it gives you structured thinking blocks, better streaming, and the full Agent mode experience.

In the Models panel:

1. **Anthropic API Key** → paste your key: `sk-avelin-...`
2. Toggle on **Override Anthropic Base URL**
3. Set it to: `https://api.avelin.ai`  ← **no `/v1` suffix for Anthropic**

| Field | Value |
|---|---|
| **Anthropic API Key** | `sk-avelin-...` |
| **Override Anthropic Base URL** | `https://api.avelin.ai` |

### Step 3 (alternative): Configure the OpenAI endpoint

Use this if a specific Cursor feature requires OpenAI-format responses (rare).

1. **OpenAI API Key** → paste your key: `sk-avelin-...`
2. Toggle on **Override OpenAI Base URL**
3. Set it to: `https://api.avelin.ai/v1`  ← **includes `/v1` for OpenAI**

| Field | Value |
|---|---|
| **OpenAI API Key** | `sk-avelin-...` |
| **Override OpenAI Base URL** | `https://api.avelin.ai/v1` |

> ⚠️ **Do NOT enable both overrides simultaneously.** If you use Anthropic, turn OFF the OpenAI override — otherwise Cursor routes Anthropic-model requests to the OpenAI endpoint and you'll get 404s. (Source: [Cursor forum thread #144899](https://forum.cursor.com/t/anthropic-models-break-when-override-openai-baseurl-is-set/144899))

### Step 4: Select a model

1. Open the chat panel (`Cmd+L`)
2. Click the model dropdown at the top
3. Disable **Auto**
4. Type or select: `avelin-coding-pro`

Cursor will remember this model for future sessions.

### Step 5: Verify it works

Type in the chat:

```
What model are you and what's your context window?
```

A correct response will:
- Identify as an AVELIN model (e.g. `avelin-coding-pro`)
- Stream token-by-token without hanging
- Show reasoning content if you ask a complex question

If it errors, see [Troubleshooting](#troubleshooting) below.

---

## Why Anthropic Endpoint is Recommended

| Feature | Anthropic (`api.avelin.ai`) | OpenAI (`api.avelin.ai/v1`) |
|---|---|---|
| **Thinking blocks** | ✅ Structured `thinking` content blocks | ⚠️ Flat `reasoning_content` field |
| **Agent mode** | ✅ Native Claude-style tool calls | ✅ Works via OpenAI tool format |
| **Streaming** | ✅ Typed SSE events | ✅ NDJSON chunks |
| **Cursor's default** | ✅ Matches Cursor's Anthropic routing | ⚠️ Requires override |
| **Thinking control** | ✅ `thinking: { type: "disabled" }` | ⚠️ Coarser `reasoning_effort` |

Cursor was designed with Anthropic's API as its primary backend. The Anthropic endpoint on AVELIN matches that expectation exactly.

---

## Available AVELIN Models

### Coding Models (1M context)

| Model | Context | Best for |
|---|---|---|
| `avelin-coding-pro` | 1M | **Daily driver** — fast, deep reasoning, large outputs |
| `avelin-coding-fast` | 1M | Standard coding tasks, cost-efficient |
| `avelin-coding-ultra` | 1M | System design, architecture reviews, security audits |

### General Models (256K context)

| Model | Context | Best for |
|---|---|---|
| `avelin-ultra` | 256K | Flagship reasoning — complex strategic problems |
| `avelin-pro` | 256K | General tasks, documentation, planning |
| `avelin-fast` | 256K | Quick lookups, classification, low-latency tasks |

### Agentic Models (256K context)

| Model | Context | Best for |
|---|---|---|
| `avelin-agentic-ultra` | 256K | Composer Agent mode — multi-file autonomous tasks |
| `avelin-agentic-pro` | 256K | Standard tool-calling workflows |
| `avelin-agentic-fast` | 256K | High-volume, cost-sensitive agent tasks |

---

## Recommended Models by Cursor Feature

| Cursor feature | Best model | Why |
|---|---|---|
| **Tab autocomplete** | `avelin-fast` | Lowest latency, cheapest per token |
| **Chat (Cmd+L)** | `avelin-coding-pro` | Best balance of speed + reasoning |
| **Composer edit (Cmd+I)** | `avelin-coding-pro` | Multi-file diffs need large context |
| **Composer Agent mode** | `avelin-agentic-ultra` | Purpose-built for autonomous tool chains |
| **Codebase questions (@codebase)** | `avelin-coding-pro` | 1M context handles large indexed codebases |
| **Documentation / planning** | `avelin-pro` | Good writing quality, lower cost than coding models |

---

## Cursor Features with AVELIN

### Tab Autocomplete

Tab completion fires on every keystroke. Use `avelin-fast` for lowest latency:

1. Switch model to `avelin-fast` in the dropdown
2. Start typing — Cursor will suggest completions inline
3. Press `Tab` to accept

*Tip:* You can set a separate model for Tab in **Cursor Settings → Models → Tab Model** (if your Cursor version supports it).

### Chat (Cmd+L)

Use `@` mentions to include context:

```
@file:src/auth.py Review this for security issues
@folder:src/ Summarize the architecture
@codebase How does the payment flow work?
@web Search for the latest FastAPI security advisories
```

### Composer (Cmd+I)

Composer edits multiple files in one shot. Select files with `@file:` and describe the change:

```
@file:user_service.py @file:user_repository.py @file:user_controller.py
Refactor to use the repository pattern. Add proper error handling.
```

Composer will show a diff preview — accept or reject each change.

### Agent Mode (Cmd+I → Agent tab)

Agent mode is Cursor's autonomous coding mode. It can:
- Read and write files
- Run terminal commands
- Search the web
- Iterate until the task is done

**Best model for Agent mode:** `avelin-agentic-ultra` — it's purpose-built for multi-step tool calling.

Example prompt:
```
Set up a FastAPI project with:
- User registration and login endpoints
- JWT authentication middleware
- SQLAlchemy models
- pytest tests for all endpoints
```

Agent will plan, create files, run tests, and fix issues until everything passes.

### Custom Instructions

Add project-level rules that apply to every chat:

1. Create `.cursorrules` in your project root:

```markdown
You are working on a Python FastAPI backend.
- Use async/await for all endpoints
- Use Pydantic v2 for data validation
- Follow PEP 8, line length 100
- Write tests with pytest and httpx
- Use repository pattern for database access
```

Cursor reads this file automatically — no settings change needed.

---

## HTTP Compatibility (Important!)

If you see connection errors with custom endpoints:

1. Go to **Cursor Settings → Network** (or **General**)
2. Find **HTTP Compatibility Mode**
3. Switch to **HTTP/1.1**

Custom endpoints (including AVELIN) often don't work well with HTTP/2. This is a known Cursor quirk. ([Source](https://forum.cursor.com/t/custom-model-provider-error/153948))

---

## Verification Checklist

After setup, run through these checks:

- [ ] **Chat responds:** Type "hello" in Cmd+L → get a reply within 5 seconds
- [ ] **Streaming works:** Tokens appear one by one, not in a single chunk
- [ ] **Thinking works:** Ask a hard question → see reasoning before the answer
- [ ] **Tab works:** Type code → get inline completions
- [ ] **Composer works:** Select a file, Cmd+I, ask to add a function → see diff preview
- [ ] **Agent mode works:** Cmd+I → Agent tab → give a multi-step task → Agent executes it

If any check fails, see [Troubleshooting](#troubleshooting).

---

## Performance Tips

### Speed
- Use `avelin-fast` for Tab autocomplete — lowest latency
- Use `avelin-coding-pro` for chat — best speed/quality tradeoff
- Use `avelin-agentic-ultra` only for Agent mode — it's slower but more capable

### Cost
- Tab autocomplete fires constantly — use `avelin-fast` to keep costs low
- Chat and Composer are less frequent — use `avelin-coding-pro` for quality
- AVELIN's prompt caching cuts repeated system prompt costs by ~80%

### Context
- AVELIN's 1M context means you can include entire codebases with `@codebase`
- For very large repos, use `.cursorignore` (gitignore syntax) to exclude noise:
  ```
  node_modules/
  dist/
  vendor/
  __pycache__/
  *.min.js
  ```

---

## Troubleshooting

### "Model not found" or "Invalid model"

**Cause:** You're using Auto mode, which only works with Cursor's built-in models.

**Fix:**
1. Click the model dropdown in the chat panel
2. Disable **Auto**
3. Select an AVELIN model from the list (or type the name)

### "API key invalid" or 401 error

**Fix:**
1. Verify key starts with `sk-avelin-`
2. Check the base URL:
   - Anthropic: `https://api.avelin.ai` (no `/v1`)
   - OpenAI: `https://api.avelin.ai/v1`
3. Re-paste the key — sometimes copy-paste adds whitespace

### 404 "Not Found" on Anthropic models

**Cause:** You have the OpenAI override enabled while using Anthropic models.

**Fix:** Turn OFF "Override OpenAI Base URL" when using Anthropic models. Only one override should be active at a time.

### Connection timeout or slow response

**Fix:**
1. Switch HTTP mode to HTTP/1.1: **Cursor Settings → Network → HTTP Compatibility Mode**
2. Try a different model: `avelin-fast` for speed
3. Check your internet connection to `api.avelin.ai`:
   ```bash
   curl -I https://api.avelin.ai/v1/models
   ```

### Tab autocomplete not working

**Fix:**
1. Make sure a model is selected (not Auto)
2. Use `avelin-fast` for Tab — it has the lowest latency
3. Check **Cursor Settings → Features → Tab** is enabled
4. Verify the file type is supported (most are)

### Composer shows no changes / empty diff

**Fix:**
1. Switch to `avelin-coding-pro` — smaller models may not generate valid diffs
2. Make sure files are saved before Composer runs
3. Try a more specific instruction (e.g. "Add error handling to the `processPayment` function" instead of "improve this code")

### Agent mode loops or fails

**Fix:**
1. Use `avelin-agentic-ultra` — it's built for this
2. Break the task into smaller steps
3. Add constraints: "Don't modify files in `tests/`" or "Use existing patterns in the codebase"

### "Cannot invoke added model" / feature locked

**Cause:** Cursor Free plan doesn't support BYOK models.

**Fix:** Upgrade to Cursor Pro or Business to use your own API keys.

---

## Example Workflow: Feature Development

```
1. Cmd+L (Chat): "Plan a REST API for a task tracker with users, projects, and tasks"
   → Uses avelin-coding-pro, returns architecture plan

2. Cmd+I (Composer Agent): "Implement the plan. Create FastAPI app with SQLAlchemy models,
   Pydantic schemas, and CRUD endpoints. Include auth."
   → Uses avelin-agentic-ultra, creates 8 files, runs tests

3. Cmd+L (Chat): "@file:main.py @file:models.py Review for security issues"
   → Uses avelin-coding-pro, finds 3 issues, suggests fixes

4. Tab autocomplete while fixing issues → uses avelin-fast

5. Cmd+I (Composer): "Add comprehensive tests for all endpoints"
   → Uses avelin-coding-pro, generates test file with 40+ tests
```

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Cline Guide](cline.md) — VS Code extension alternative
- [Continue Guide](continue.md) — Open-source VS Code/JetBrains alternative
- [Hermes Agent Guide](../hermes.md) — Terminal-based coding tool
- [Model Catalog](../../models/README.md) — Full model comparison
- [Cursor Docs](https://docs.cursor.com) — Official Cursor documentation
