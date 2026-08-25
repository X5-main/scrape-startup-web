# Octomind Integration

AVELIN API is compatible with [Octomind](https://octomind.dev) — a session-based AI development assistant with MCP tool execution and persistent session state.

Octomind treats your development session as a first-class concept. It remembers your project context, file history, test results, and conversation state across interactions — not just within a single prompt, but across your entire working session. The killer feature is MCP (Model Context Protocol) tool execution within that session context: when Octomind runs a tool, it does so with full awareness of what happened before. Ran tests that failed? Octomind remembers which ones and why. Edited a file three messages ago? It knows the current state. This persistent session awareness eliminates the "repeat yourself every prompt" problem that plagues stateless coding assistants.

> **Why AVELIN + Octomind?** Access AVELIN's frontier coding models with 1M-token context windows, automatic failover, and ~100 tps throughput through a single OpenAI-compatible endpoint.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Octomind

Refer to [Octomind documentation](https://octomind.dev) for installation instructions.

### Step 3: Configure AVELIN

Set AVELIN as your LLM provider. Most tools support OpenAI-compatible endpoints via environment variables or config files:

```bash
export OPENAI_API_BASE=https://api.avelin.ai/v1
export OPENAI_API_KEY=*** Common config file pattern:

```yaml
provider: openai
api_base: https://api.avelin.ai/v1
api_key: sk-ave...xxxx
model: avelin-coding-pro
```

### Step 4: Select your model

---

## Recommended Models

### Primary: `avelin-coding-pro`

| Feature | avelin-coding-pro | Why it matters |
|---|---|---|
| **Context window** | **1M tokens** | Full codebase awareness without truncation |
| **Max output** | **65K tokens** | Large multi-file diffs and refactors |
| **Throughput** | **~100 tokens/sec** | 2x faster — tighter edit loops |
| **Reasoning** | Deep step-by-step | Understands cross-file dependencies |
| **Tool calling** | First-class | Reliable structured edits |

### Alternatives

| Model | When to use |
|---|---|
| `avelin-coding-fast` | Lighter tasks, quick questions — lower cost |
| `avelin-coding-ultra` | System design, architecture reviews |
| `avelin-fast` | Quick lookups, simple fixes — lowest cost, fastest response |
| `avelin-agentic-ultra` | Complex multi-step agent workflows |

---

## Why AVELIN for Octomind?

- **1M context windows**: Large codebases fit without aggressive exclusions
- **Prompt caching**: ~80% reduction on repeated system prompts and repo-maps
- **Automatic failover**: Coding sessions keep running if a provider is down
- **Model diversity**: Multiple frontier models through one API

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **"Model not found"** | Prefix model with `openai/` if required |
| **"API key invalid"** | Check key starts with `sk-ave` and base URL is `https://api.avelin.ai/v1` |
| **Slow responses** | Try `avelin-fast` for simpler tasks |
| **Context overflow** | Reduce context or switch to `avelin-coding-pro` (1M) |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Aider Guide](aider.md) — Popular terminal coding tool
- [Claude Code Guide](claude-code.md) — Anthropic's CLI coding tool
- [Model Catalog](../../models/README.md) — Full comparison
- [Octomind Documentation](https://octomind.dev) — Official docs
