# Space Agent Integration

AVELIN API is compatible with Space Agent — Free, open-source AI agent that builds your workspace directly in the browser.

Space Agent is a browser-based AI agent that builds your entire workspace in the browser — no local installation required. Its killer feature is zero-setup productivity: open a tab, describe your workflow, and Space Agent constructs the tools, dashboards, and automations you need right there. It's the agent equivalent of a cloud IDE, but for general-purpose work rather than just code.

Designed for teams that want AI-powered workspace automation without IT overhead, and for individuals on managed devices where installing software is restricted. Point it at AVELIN for fast, reliable agent execution with automatic failover.

> **Why AVELIN + Space Agent?** Leverage AVELIN's frontier models with 1M-token context windows, automatic failover, and competitive pricing for automation workflows.

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

## Why AVELIN for Space Agent?

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
