# nanocode Integration

AVELIN API is compatible with [nanocode](https://github.com/nanocode-dev/nanocode) — the minimal Claude Code alternative that fits in a single Python file.

nanocode is the entire agentic coding loop in ~250 lines of Python with zero external dependencies. It gives you the full toolset — read, write, edit, glob, grep, and bash — the same capabilities as tools with 100x more code. The killer feature is radical simplicity: you can read the entire source, understand every decision, and fork it in an afternoon. No node_modules, no Docker images, no build step. Just one file you drop into any project. For developers who want to own their tooling — modify the prompt, change the tool behavior, add a feature — nanocode is the coding agent you can actually hold in your head.

> **Why AVELIN + nanocode?** Access AVELIN's frontier coding models with 1M-token context windows, automatic failover, and ~100 tps throughput through a single OpenAI-compatible endpoint.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install nanocode

Refer to [nanocode documentation](https://github.com/nanocode-dev/nanocode) for installation instructions.

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

## Why AVELIN for nanocode?

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
- [nanocode Documentation](https://github.com/nanocode-dev/nanocode) — Official docs
