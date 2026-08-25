# avelin-agentic-ultra

> **Formerly `avelin-agentic-high`.** The legacy name keeps working as a server-side alias — no client change required.

## Model Positioning

`avelin-agentic-ultra` is AVELIN's top-tier agentic reasoning model — the most capable model in the Agentic family for the most demanding tool-using and long-horizon tasks. Built with AVELIN's Cross-Model MoE technology in our AI Lab, it fuses multiple model architectures into a single trained system for complex autonomous workflows.

**Context window:** 256K tokens input, 65K tokens output

**Pricing:** $2.38 input / $11.88 output per 1M tokens (cache read $0.49, cache write $2.98) — see [Pricing](../pricing.md)

The strongest pick in the agentic family for security-sensitive tool-augmented workflows, deep research agents, and complex multi-step planning where quality matters more than per-step cost.

## Cross-Model MoE

Our Cross-Model MoE uses a prompt-vector classifier trained on 1 year of production data to predict the optimal specialist with 90% accuracy. It applies difficulty-based cascading (simple tasks → fast models, complex tasks → multi-expert fusion) and cost-aware routing (same quality, cheapest path). This is not a router — routers pick one model via if/else rules. We cascade across trained experts and synthesize output quality above any single expert.
Built with AVELIN's Cross-Model MoE technology in our AI Lab. Cross-Model MoE is a trained meta-model — not a router — that fuses knowledge from multiple model architectures into a single unified model. You call `avelin-agentic-ultra` and get maximized planning accuracy and tool-calling reliability — enterprise-grade autonomous intelligence without vendor lock-in.

**Self-improving platform:** As new frontier models are released, AVELIN integrates them within 48 hours. Your `avelin-agentic-ultra` endpoint gets more capable over time — automatically, with zero code changes.

**Enterprise licensing:** AVELIN models are available for sovereign deployment on customer GPUs. Contact us for enterprise licensing — run AVELIN on your own infrastructure with full data sovereignty.

**Why 256K context for complex agents:** When your agent needs to orchestrate 100+ tool calls, maintain state across hours of autonomous work, or reason about complex systems with many moving parts, you need generous context. With 256K tokens, your agents can execute marathon workflows without losing coherence, forgetting goals, or fragmenting state. This is enterprise-grade autonomous intelligence.

## Capabilities at a Glance

| Capability | Detail |
| --- | --- |
| Context window | **256K tokens** |
| Max output | **65K tokens** |
| Reasoning | deep step-by-step (thinking) |
| Tools / function calling | yes (core strength) |
| Streaming | yes |

## Best-Fit Workloads

- Long-running agents that span many steps and tools
- Tasks over very large inputs (document sets, logs, data extracts)
- Complex orchestration where planning quality is critical
- High-stakes automations that must not lose context

## When to Choose avelin-agentic-ultra

- The agent must reason over a large amount of context at once
- Task complexity exceeds what `avelin-agentic-pro` handles comfortably
- Planning accuracy matters more than raw speed

## Example Business Requests

- "Audit this entire repository and propose a refactoring plan."
- "Coordinate a multi-step migration across these systems."
- "Analyze a quarter of meeting notes and produce an action roadmap."

## Related

- [`avelin-agentic-pro.md`](avelin-agentic-pro.md)
- [Model Catalog](README.md)
- [API Reference](../api/index.md)
