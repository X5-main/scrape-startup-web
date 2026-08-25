# Stirrup Integration

AVELIN API is compatible with Stirrup — Lightweight framework for building agents using ChatCompletionsClient and your own API key.

Stirrup is a minimal agent framework built around the ChatCompletionsClient interface — the same interface every OpenAI-compatible API exposes. Its killer feature is radical simplicity: instead of pulling in a heavy framework with dozens of dependencies, Stirrup lets you build custom agents in minutes using just the standard chat completions API you already know. No abstraction layers, no vendor-specific SDKs.

Built for developers who want full control and zero bloat, Stirrup is the right choice when LangChain or CrewAI feel like overkill. Pair it with AVELIN's OpenAI-compatible endpoint and you have a production agent stack with minimal surface area for bugs.

> **Why AVELIN + Stirrup?** Leverage AVELIN's frontier models with 1M-token context windows, automatic failover, and competitive pricing for automation workflows.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Configure AVELIN

Most automation tools support OpenAI-compatible endpoints via environment variables:

```bash
export OPENAI_API_BASE=https://api.avelin.ai/v1
export OPENAI_API_KEY=*** API Reference

| Endpoint | URL |
|---|---|
| **OpenAI-compatible** | `https://api.avelin.ai/v1` |
| **Anthropic-compatible** | `https://api.avelin.ai` |

---

## Recommended Models

| Use case | Model | Why |
|---|---|---|
| Complex automation | `avelin-agentic-ultra` | Top-tier reasoning for multi-step workflows |
| Standard tasks | `avelin-agentic-pro` | Balanced performance and cost |
| High-volume simple tasks | `avelin-agentic-fast` | Lowest cost, fastest response |
| Code-heavy automation | `avelin-coding-pro` | 1M context, code understanding |
| Research workflows | `avelin-ultra` | Flagship reasoning capabilities |

---

## Why AVELIN for Stirrup?

- **Agentic models**: Purpose-built for tool-calling and multi-step planning
- **Automatic failover**: Automation keeps running if a provider is down
- **1M context**: Track complex workflows without losing context
- **Cost optimization**: Prompt caching reduces costs by ~80% on repeated prompts

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **API key error** | Verify `OPENAI_API_BASE` includes `/v1` |
| **Agent loops** | Lower temperature to 0.0-0.1, use `avelin-agentic-ultra` |
| **Token limit** | Break workflow into smaller steps |
| **Tool failures** | Use `avelin-agentic-ultra` for best tool-calling reliability |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Browser Use Guide](../browser-use.md) — Browser automation
- [OpenClaw Guide](../coding/openclaw.md) — Multi-service automation
- [Model Catalog](../../models/README.md) — Full comparison
