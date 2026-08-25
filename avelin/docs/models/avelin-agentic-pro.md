# avelin-agentic-pro

> **Formerly `avelin-agentic`.** The legacy name keeps working as a server-side alias — no client change required.

## Model Positioning

`avelin-agentic-pro` is AVELIN's standard agentic tier — purpose-built for long-horizon tool-calling workflows and autonomous agents. Built with AVELIN's Cross-Model MoE technology in our AI Lab, it fuses multiple model architectures into a single trained system optimized for sustained multi-tool execution.

**Context window:** 256K tokens input, 65K tokens output

**Pricing:** $1.26 input / $3.96 output per 1M tokens (cache read $0.23, cache write $1.58) — see [Pricing](../pricing.md)

The standard agentic workhorse for tool-calling agents, regulated industries (healthcare, finance), and workloads where data sovereignty is required.

## Cross-Model MoE

Our Cross-Model MoE uses a prompt-vector classifier trained on 1 year of production data to predict the optimal specialist with 90% accuracy. It applies difficulty-based cascading (simple tasks → fast models, complex tasks → multi-expert fusion) and cost-aware routing (same quality, cheapest path). This is not a router — routers pick one model via if/else rules. We cascade across trained experts and synthesize output quality above any single expert.
Built with AVELIN's Cross-Model MoE technology in our AI Lab. Cross-Model MoE is a trained meta-model — not a router — that fuses knowledge from multiple model architectures into a single unified model. You call `avelin-agentic-pro` and get reliable autonomous execution based on tool-calling complexity, context requirements, and reasoning depth — without vendor lock-in.

**Self-improving platform:** As new frontier models are released, AVELIN integrates them within 48 hours. Your `avelin-agentic-pro` endpoint gets more capable over time — automatically, with zero code changes.

**Enterprise licensing:** AVELIN models are available for sovereign deployment on customer GPUs. Contact us for enterprise licensing — run AVELIN on your own infrastructure with full data sovereignty.

**Why 256K context for agents:** Autonomous workflows require sustained reasoning across hundreds of tool calls, API interactions, and decision points. With 256K context, your agents can maintain coherent state, remember complex goals, and execute multi-step plans without fragmentation. This is the sweet spot for most production agent workflows — enough context for complexity, optimized for cost and speed.

## Capabilities at a Glance

| Capability | Detail |
| --- | --- |
| Context window | **256K tokens** |
| Max output | **65K tokens** |
| Reasoning | step-by-step (thinking) |
| Tools / function calling | yes (core strength) |
| Streaming | yes |

## Best-Fit Workloads

- Autonomous and semi-autonomous agents
- Multi-tool workflows (search, code, data, integrations)
- Task decomposition and sequential execution
- Orchestrated business automations via AVELIN-MCP

## When to Choose avelin-agentic-pro

- The task requires calling tools or APIs in a loop
- You need reliable planning and tool selection
- The workload is standard agentic complexity

For the most demanding agentic reasoning, use `avelin-agentic-ultra`.

## Example Business Requests

- "Plan and book a meeting, then email the attendees the agenda."
- "Research this account, then draft a tailored outreach sequence."
- "Pull the latest figures, build a table, and summarize the trend."

## Related

- [`avelin-agentic-ultra.md`](avelin-agentic-ultra.md)
- [Model Catalog](README.md)
- [API Reference](../api/index.md)
