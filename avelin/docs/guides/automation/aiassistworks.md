# AiAssistWorks Integration

AVELIN API is compatible with AiAssistWorks — AI for Google Sheets, Slides & Docs. Process 100k+ rows with text commands and create charts/pivot tables using 100+ AI models.

AiAssistWorks brings AI natively into Google Workspace — Sheets, Slides, and Docs — so you never have to leave your spreadsheet to get intelligent work done. Its killer feature is the ability to process 100,000+ rows in Sheets using plain text commands: ask it to "summarize sales by region and create a pivot table" and it just works. With access to 100+ AI models, you can pick the right model for classification, summarization, chart generation, or data transformation.

Designed for analysts, marketers, and operations teams who live in Google Workspace, AiAssistWorks eliminates the copy-paste-to-ChatGPT workflow entirely. Connect it to AVELIN for fast, cost-effective model access across your entire Workspace stack.

> **Why AVELIN + AiAssistWorks?** Leverage AVELIN's frontier models with 1M-token context windows, automatic failover, and competitive pricing for automation workflows.

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

## Why AVELIN for AiAssistWorks?

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
