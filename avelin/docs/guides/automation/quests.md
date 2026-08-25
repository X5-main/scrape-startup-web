# Quests Integration

AVELIN API is compatible with Quests — The open-source app builder for rapid prototyping and development.

Quests is an open-source app builder designed for rapid prototyping — go from a natural language prompt to a working application in minutes. Its killer feature is the speed of the prompt-to-app pipeline: describe what you want, and Quests scaffolds the frontend, backend, and database layer automatically. Unlike heavier app builders, it focuses on getting you to a functional prototype fast, which you can then iterate on or discard.

Perfect for indie hackers, startup founders, and developers who want to validate ideas quickly without spending days on boilerplate. Connect AVELIN for high-quality code generation and 1M-token context that understands your entire generated codebase.

> **Why AVELIN + Quests?** Leverage AVELIN's frontier models with 1M-token context windows, automatic failover, and competitive pricing for automation workflows.

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

## Why AVELIN for Quests?

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
