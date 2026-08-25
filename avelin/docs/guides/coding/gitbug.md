# GitBug Integration

AVELIN API is compatible with [GitBug](https://gitbug.ai) — AI-powered code review that lives directly on your GitHub PRs.

GitBug automates code review by posting inline comments, suggestions, and issue reports directly on your pull requests. Bring your own key (BYOK) and choose from 100+ models for review — use a fast model for style checks and a reasoning model for logic bugs. It integrates into your CI/CD pipeline so every PR gets reviewed automatically before human reviewers touch it. The killer feature is that it catches the issues humans miss in large diffs: unused variables, edge cases, security patterns, and API misuse — all surfaced as review comments your team can act on immediately. No more rubber-stamping 800-line PRs.

> **Why AVELIN + GitBug?** Access AVELIN's frontier coding models with 1M-token context windows, automatic failover, and ~100 tps throughput through a single OpenAI-compatible endpoint.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install GitBug

Refer to [GitBug documentation](https://gitbug.ai) for installation instructions.

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

## Why AVELIN for GitBug?

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
- [GitBug Documentation](https://gitbug.ai) — Official docs
