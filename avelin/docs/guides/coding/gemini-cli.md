# Gemini CLI Integration

AVELIN API works with [Gemini CLI](https://github.com/google-gemini/gemini-cli) — Google's open-source terminal AI coding tool. While Gemini CLI is designed for Google's Gemini models, it supports custom OpenAI-compatible endpoints, letting you bring AVELIN's frontier coding models into the same powerful terminal workflow.

> **Why AVELIN + Gemini CLI?** Get the best of both worlds: Gemini CLI's multi-modal terminal experience and native Google integrations, paired with AVELIN's coding-optimized models, 1M-token context windows, 90% prompt caching, and automatic failover.

---

## What is Gemini CLI?

Gemini CLI is Google's open-source AI coding assistant that runs directly in your terminal. Its killer feature is the combination of a free tier with Gemini models and BYOK (Bring Your Own Key) support for any OpenAI-compatible API — plus native Google integrations for Search, Maps, and more. It also supports multi-modal input, letting you analyze images and screenshots right from the terminal.

Gemini CLI is ideal for developers who want a Google-backed terminal coding tool with the flexibility to use any model provider. It's particularly useful for teams already in the Google ecosystem who want AI coding assistance without leaving the command line.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Gemini CLI

```bash
# Install via npm
npm install -g @anthropic-ai/gemini-cli

# Or via Google's installer
npx @anthropic-ai/gemini-cli

# Verify installation
gemini --version
```

### Step 3: Configure Gemini CLI for AVELIN

Gemini CLI supports custom OpenAI-compatible endpoints. Set up AVELIN via environment variables:

```bash
# Point Gemini CLI to AVELIN's OpenAI-compatible endpoint
export OPENAI_API_BASE=https://api.avelin.ai/v1
export OPENAI_API_KEY=***
```

Or configure via the settings file at `~/.gemini/settings.json`:

```json
{
  "model": "avelin-coding-pro",
  "providers": {
    "avelin": {
      "type": "openai-compatible",
      "baseUrl": "https://api.avelin.ai/v1",
      "apiKey": "sk-ave...xxxx"
    }
  }
}
```

### Step 4: Start Gemini CLI

```bash
# Start an interactive session with AVELIN
gemini

# Or run a single prompt
gemini -p "Explain the authentication flow in this codebase"
```

---

## Recommended Models

### Primary Recommendation: `avelin-coding-pro`

For coding tasks in Gemini CLI:

| Feature | avelin-coding-pro | Why it matters for Gemini CLI |
|---|---|---|
| **Context window** | **1M tokens** | Load large codebases and multi-file contexts without truncation |
| **Max output** | **65K tokens** | Generate comprehensive code, tests, and documentation |
| **Throughput** | **~100 tokens/sec** | 2× faster than standard tiers — snappy terminal experience |
| **Reasoning** | Deep step-by-step thinking | Complex debugging and architectural analysis |
| **Tool calling** | First-class support | File operations, terminal commands, and code editing |

### Alternative Models

| Model | When to use |
|---|---|
| `avelin-coding-fast` | Lighter coding tasks, quick questions — saves cost on simple work |
| `avelin-coding-ultra` | System design, architecture reviews, large-scale planning |
| `avelin-pro` | General-purpose tasks with strong reasoning |
| `avelin-fast` | Quick lookups and simple tasks — lowest cost, fastest response |

---

## Why AVELIN for Gemini CLI?

### 1. **Beyond Gemini Models**

While Gemini CLI is built for Google's models, AVELIN gives you access to a broader range of frontier coding models optimized specifically for software engineering tasks — through the same familiar interface.

### 2. **Cost Optimization**

- **Prompt caching**: ~80% cost reduction on repeated system prompts
- **Competitive pricing**: Lower per-token costs than direct provider APIs
- **Pay-per-token**: No subscription lock-in — pay only for what you use

### 3. **1M Context Windows**

Gemini CLI sessions benefit from large context windows when analyzing codebases. AVELIN's 1M-token context means you can load entire repositories and work across many files without context loss.

### 4. **Automatic Failover**

- **Provider failover**: If one backend is slow or down, AVELIN switches to another
- **Retry logic**: Transient errors handled automatically
- **99.9% uptime**: Enterprise-grade infrastructure — no interrupted sessions

---

## Example Session

```bash
$ gemini

╭─ Gemini CLI ─────────────────────────────────────╮
│ Model: avelin-coding-pro (via AVELIN)           │
│ Provider: AVELIN (api.avelin.ai)                 │
╰──────────────────────────────────────────────────╯

You> Analyze the database schema in this project and suggest
     optimizations for query performance.

Gemini CLI> Let me examine your database schema and query patterns...

[Reads migrations/, models/, queries/]

I found 3 potential performance issues:

1. Missing index on users.email — used in 4 queries
2. N+1 query pattern in OrderService.getAllWithItems()
3. Unindexed foreign key on order_items.order_id

Here are the optimizations:

[Creates migration: add_users_email_index.sql]
[Refactors OrderService to use eager loading]
[Creates migration: add_order_items_fk_index.sql]

Want me to run the migrations?
```

---

## Using Google's Free Tier + AVELIN

Gemini CLI offers a free tier with Google's Gemini models. You can use both:

- **Free Gemini models** for quick questions and simple tasks
- **AVELIN models** for complex coding, large context, and production workloads

Switch between them by updating your configuration or environment variables as needed.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **"Provider not configured"** | Ensure `OPENAI_API_BASE` is set to `https://api.avelin.ai/v1` |
| **"Model not found"** | Use a valid AVELIN model name (e.g., `avelin-coding-pro`) |
| **"API key invalid"** | Verify your key starts with `sk-ave` and is active |
| **Slow responses** | Try `avelin-fast` for simpler tasks; check network connection |
| **Streaming issues** | Gemini CLI may have limited streaming support for non-Gemini providers |
| **Tool calls failing** | Use `avelin-coding-pro` which has first-class function calling |
| **Context overflow** | Start a new session or reduce the number of loaded files |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Hermes Agent Guide](../hermes.md) — Terminal-based agentic coding tool
- [Claude Code Guide](claude-code.md) — Anthropic's CLI coding tool
- [Aider Guide](aider.md) — AI pair programming in the terminal
- [Model Catalog](../../models/README.md) — Full model comparison
- [Gemini CLI GitHub](https://github.com/google-gemini/gemini-cli) — Official Gemini CLI repository
