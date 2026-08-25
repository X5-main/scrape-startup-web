# VT Code Integration

AVELIN API is compatible with [VT Code](https://vtcode.dev) — Semantic coding agent in the terminal that understands code structure via AST.

VT Code is a semantic coding agent that lives in your terminal and understands your code at the structural level using Abstract Syntax Trees (AST). Its killer feature is AST-aware code understanding — instead of treating your codebase as plain text, VT Code parses the syntax tree to understand function relationships, type hierarchies, import chains, and scope. When you ask it to refactor a function, it knows every caller, every type dependency, and every import that needs updating.

Built for developers who work in the terminal and want an AI coding partner that understands code like a compiler does, not like a search-and-replace tool. VT Code's semantic awareness means fewer broken edits and more accurate multi-file refactors. Connect AVELIN's `avelin-coding-pro` model for 1M-token context that sees your entire codebase and ~100 tps throughput for tight edit loops.

> **Why AVELIN + VT Code?** Access AVELIN's frontier coding models with 1M-token context windows, automatic failover, and ~100 tps throughput through a single OpenAI-compatible endpoint.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install VT Code

Refer to [VT Code documentation](https://vtcode.dev) for installation instructions.

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

## Why AVELIN for VT Code?

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

- [API Quickstart](../api/quickstart.md) — First API call in 5 minutes
- [Aider Guide](coding/aider.md) — Popular terminal coding tool
- [Claude Code Guide](coding/claude-code.md) — Anthropic's CLI coding tool
- [Model Catalog](../models/README.md) — Full comparison
- [VT Code Documentation](https://vtcode.dev) — Official docs
