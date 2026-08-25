# Agent Swarm Integration

AVELIN API is compatible with [Agent Swarm](https://agentswarm.dev) — a multi-agent coordination platform for parallel coding tasks with Docker-isolated workers.

Agent Swarm orchestrates multiple AI coding agents working simultaneously on different parts of a problem, each running in its own Docker container. This isolation means agents can execute shell commands, install packages, run tests, and modify files without interfering with each other — or with your host machine. The coordination layer decomposes large tasks (refactor this module, write tests, update docs) into parallel workstreams and merges the results. For teams tackling large-scale migrations, monorepo refactors, or multi-service updates, Agent Swarm turns a day-long task into an hour by running agents in parallel with full environmental isolation.

> **Why AVELIN + Agent Swarm?** Access AVELIN's frontier coding models with 1M-token context windows, automatic failover, and ~100 tps throughput through a single OpenAI-compatible endpoint.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Agent Swarm

Refer to [Agent Swarm documentation](https://agentswarm.dev) for installation instructions.

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

## Why AVELIN for Agent Swarm?

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
- [Agent Swarm Documentation](https://agentswarm.dev) — Official docs
