# Paperclip Integration

AVELIN API is compatible with Paperclip — an open-source AI agent management platform for running teams of AI agents as structured companies.

Paperclip is an open-source platform that treats AI agents like employees in a real organization. Its killer feature is the corporate governance layer: org charts, budgets, goals, and reporting structures for AI agent teams. You can run "zero-human companies" where agents have defined roles, report to manager agents, follow budgets, and work toward company goals — all without human intervention. There's also a community OpenRouter adapter on GitHub that makes it easy to plug in any compatible provider.

Designed for researchers, AI enthusiasts, and forward-thinking operators experimenting with autonomous business operations and multi-agent coordination, Paperclip turns abstract agent swarms into manageable, auditable organizations. Point it at AVELIN's agentic models for reliable multi-step reasoning and tool-calling across your entire agent hierarchy.

> **Why AVELIN + Paperclip?** Leverage AVELIN's frontier models with 1M-token context windows, automatic failover, and competitive pricing for multi-agent company simulations and automated business operations.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Paperclip

Clone the repository and install dependencies:

```bash
git clone https://github.com/paperclip-org/paperclip
cd paperclip
# Follow the README for installation instructions
```

### Step 3: Configure AVELIN as the API provider

Paperclip uses an OpenRouter-compatible API. Set the base URL to AVELIN and provide your API key. If using the community OpenRouter adapter, configure it to point to AVELIN:

```bash
export OPENROUTER_BASE_URL=https://api.avelin.ai/v1
export OPENROUTER_API_KEY=*** API Reference

| Endpoint | URL |
|---|---|
| **OpenAI-compatible** | `https://api.avelin.ai/v1` |
| **Anthropic-compatible** | `https://api.avelin.ai` |

---

## Recommended Models

| Use case | Model | Why |
|---|---|---|
| CEO / strategic agents | `avelin-agentic-ultra` | Top-tier reasoning for complex decision-making |
| Manager agents | `avelin-agentic-pro` | Balanced performance and cost for coordination |
| Worker agents (high volume) | `avelin-agentic-fast` | Lowest cost, fastest response for routine tasks |
| Research / analyst agents | `avelin-coding-pro` | 1M context for processing large datasets and reports |
| Planning agents | `avelin-ultra` | Flagship reasoning capabilities for long-horizon goals |

---

## Why AVELIN for Paperclip?

- **Agentic models**: Purpose-built for tool-calling and multi-step planning across agent hierarchies
- **Automatic failover**: Your agent company keeps running if a provider is down — no single point of failure
- **1M context**: Agents can process large documents, reports, and conversation histories without losing track
- **Cost optimization**: Prompt caching reduces costs by ~80% on repeated prompts — critical when running many agents simultaneously
- **Model variety**: Mix high-reasoning models for leadership agents with fast models for worker agents to optimize spend

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **API key error** | Verify `OPENROUTER_BASE_URL` is set to `https://api.avelin.ai/v1` |
| **Agent stuck in loop** | Lower temperature to 0.0-0.1, use `avelin-agentic-ultra` for strategic agents |
| **Budget overruns** | Use `avelin-agentic-fast` for worker agents, reserve expensive models for managers |
| **Multi-agent coordination failures** | Ensure all agents use the same AVELIN endpoint for consistent behavior |
| **Token limit exceeded** | Break complex goals into smaller tasks; use `avelin-coding-pro` for 1M context |
| **OpenRouter adapter errors** | Check the community adapter repo for compatibility updates with AVELIN's API |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Agent Zero Guide](agent-zero.md) — Visual agent builder
- [Quests Guide](quests.md) — Rapid app prototyping
- [Model Catalog](../../models/README.md) — Full comparison
