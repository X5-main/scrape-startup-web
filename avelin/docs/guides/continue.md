# Continue Integration

AVELIN API is compatible with [Continue](https://continue.dev) — an open-source AI code assistant for VS Code and JetBrains. Continue provides inline completions, chat, and code editing powered by any OpenAI-compatible API.

Continue is the open-source alternative to GitHub Copilot and Cursor, living natively inside VS Code and JetBrains IDEs. Its killer feature is `@codebase` context: Continue indexes your entire repository for semantic search, then sends the most relevant code snippets to the model automatically. When you ask "how does authentication work?", it finds the auth middleware, the login handler, and the session store — without you manually copying files. Combined with tab autocomplete, chat (`Ctrl+L`), and inline edit (`Ctrl+I`), Continue gives you a full AI coding workflow inside the IDE you already use, with no vendor lock-in and your choice of model provider.

> **Why AVELIN + Continue?** Open-source, self-hostable, and IDE-native — paired with AVELIN's 1M-token context models and competitive per-token pricing.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Continue

- **VS Code**: Search "Continue" in Extensions and install
- **JetBrains**: Install from JetBrains Marketplace

### Step 3: Configure Continue

Open Continue's `config.json` (click the gear icon in the Continue panel) and add AVELIN:

```json
{
  "models": [
    {
      "title": "AVELIN Coding Plus",
      "provider": "openai",
      "model": "avelin-coding-pro",
      "apiBase": "https://api.avelin.ai/v1",
      "apiKey": "sk-a..."
    },
    {
      "title": "AVELIN Pro",
      "provider": "openai",
      "model": "avelin-pro",
      "apiBase": "https://api.avelin.ai/v1",
      "apiKey": "sk-a..."
    },
    {
      "title": "AVELIN Fast",
      "provider": "openai",
      "model": "avelin-fast",
      "apiBase": "https://api.avelin.ai/v1",
      "apiKey": "sk-a..."
    }
  ],
  "tabAutocompleteModel": {
    "title": "AVELIN Fast Autocomplete",
    "provider": "openai",
    "model": "avelin-fast",
    "apiBase": "https://api.avelin.ai/v1",
    "apiKey": "sk-a..."
  }
}
```

### Step 4: Start Coding

1. Select your AVELIN model from the Continue dropdown
2. Use `Ctrl+L` (chat) or `Ctrl+I` (inline edit) to start

---

## Recommended Models

### For Chat & Edit: `avelin-coding-pro`

| Feature | avelin-coding-pro | Why it matters for Continue |
|---|---|---|
| **Context window** | **1M tokens** | Full codebase awareness |
| **Max output** | **65K tokens** | Large file generation |
| **Throughput** | **~100 tokens/sec** | Fast inline edits |

### For Autocomplete: `avelin-fast`

| Feature | avelin-fast | Why it matters for Continue |
|---|---|---|
| **Latency** | **Low** | Instant tab completions |
| **Cost** | **Lowest tier** | Economical for high-volume autocomplete |

### All Models

| Use case | Model |
|---|---|
| Chat & inline edit | `avelin-coding-pro` |
| Architecture review | `avelin-coding-ultra` |
| Quick questions | `avelin-fast` |
| General reasoning | `avelin-pro` |

---

## Why AVELIN for Continue?

- **Open-source + open API**: Both Continue and AVELIN's API surface are open — no vendor lock-in
- **Prompt caching**: ~80% cost reduction on repeated system prompts and codebase context
- **1M context**: Continue's `@codebase` feature works best with large context windows
- **Fast autocomplete**: `avelin-fast` provides low-latency tab completions

---

## Advanced Configuration

### Embeddings for Codebase Search

Configure embeddings for better `@codebase` results:

```json
{
  "embeddingsProvider": {
    "provider": "openai",
    "model": "bge-m3",
    "apiBase": "https://api.avelin.ai/v1",
    "apiKey": "sk-a..."
  }
}
```

### Custom Slash Commands

```json
{
  "customSlashCommands": [
    {
      "name": "review",
      "description": "Review code for security and performance issues",
      "prompt": "Review this code for security vulnerabilities, performance issues, and best practices."
    }
  ]
}
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **"Model not found"** | Check model name matches exactly |
| **Autocomplete too slow** | Use `avelin-fast` for tab completion model |
| **Context errors** | Reduce context size or switch to `avelin-coding-pro` (1M) |
| **Connection failed** | Verify `apiBase` is `https://api.avelin.ai/v1` |

---

## Related

- [API Quickstart](../api/quickstart.md) — First API call in 5 minutes
- [Cursor Guide](coding/cursor.md) — AI-first editor alternative
- [Cline Guide](coding/cline.md) — Autonomous VS Code agent
- [Model Catalog](../models/README.md) — Full comparison
- [Continue Docs](https://docs.continue.dev) — Official documentation
