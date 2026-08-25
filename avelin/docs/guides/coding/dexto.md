# Dexto Integration

AVELIN API is compatible with [Dexto](https://dexto.ai) — an open agent harness that ships a production-ready coding agent, CLI, and Web UI in a single package.

Dexto is designed for developers and teams who want a coding agent they can deploy today and extend tomorrow. Out of the box, you get a full-featured coding agent accessible via terminal CLI and a browser-based Web UI — no assembly required. Under the hood, Dexto's harness architecture is fully extensible: add custom tools, define new agent workflows, plug in specialized models for different task types. It's the difference between a toy demo and something your team can rely on in production. For organizations building internal AI coding workflows, Dexto provides the extensible foundation without the months of infrastructure work.

> **Why AVELIN + Dexto?** Access AVELIN's frontier coding models with 1M-token context windows, automatic failover, and ~100 tps throughput through a single OpenAI-compatible endpoint.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Dexto

Refer to [Dexto documentation](https://dexto.ai) for installation instructions.

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

## Why AVELIN for Dexto?

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
- [Dexto Documentation](https://dexto.ai) — Official docs
