# avelin-coding-ultra

> **Formerly `avelin-coding-architect`.** The legacy name keeps working as a server-side alias — no client change required.

## Model Positioning

`avelin-coding-ultra` is AVELIN's deep-thinking architecture tier — the most capable model in the Coding family for system-level design decisions. Built with AVELIN's Cross-Model MoE technology in our AI Lab, it fuses multiple model architectures into a single trained system for whole-repository analysis and architectural planning.

**Context window:** 1M tokens input, 65K tokens output

**Pricing:** $2.50 input / $12.50 output per 1M tokens (cache read $0.52, cache write $3.13) — see [Pricing](../pricing.md)

The strongest pick for whole-repo reasoning, system-design decisions, and long-horizon refactors where one wrong call costs hours.

## Cross-Model MoE

Our Cross-Model MoE uses a prompt-vector classifier trained on 1 year of production data to predict the optimal specialist with 90% accuracy. It applies difficulty-based cascading (simple tasks → fast models, complex tasks → multi-expert fusion) and cost-aware routing (same quality, cheapest path). This is not a router — routers pick one model via if/else rules. We cascade across trained experts and synthesize output quality above any single expert.
Built with AVELIN's Cross-Model MoE technology in our AI Lab. Cross-Model MoE is a trained meta-model — not a router — that fuses knowledge from multiple model architectures into a single unified model. You call `avelin-coding-ultra` and get maximized architectural insight and design quality — system-level intelligence without vendor lock-in.

**Self-improving platform:** As new frontier models are released, AVELIN integrates them within 48 hours. Your `avelin-coding-ultra` endpoint gets more capable over time — automatically, with zero code changes.

**Enterprise licensing:** AVELIN models are available for sovereign deployment on customer GPUs. Contact us for enterprise licensing — run AVELIN on your own infrastructure with full data sovereignty.

**Why architects need 1M context:** System design requires understanding the entire codebase — dependencies, patterns, interfaces, and edge cases across hundreds of files. With 1M context, you can load your complete repository and reason about architecture holistically, not piecemeal. This is the difference between "let me check those 5 files" and "I understand your entire system."

## Capabilities at a Glance

| Capability | Detail |
| --- | --- |
| Context window | **1M tokens** |
| Max output | **65K tokens** |
| Reasoning | deepest step-by-step (thinking) |
| Tools / function calling | yes |
| Streaming | yes |

## Best-Fit Workloads

- System and API design decisions
- Architecture reviews and trade-off analysis
- Large-scale refactoring and migration planning
- High-stakes engineering work where design quality drives outcomes

## When to Choose avelin-coding-ultra

- The problem is about design and structure, not just implementation
- You need explicit trade-off analysis and a recommended approach
- The decision has long-lived architectural impact

For implementation once the design is set, `avelin-coding-pro` or
`avelin-coding-fast` are more cost-efficient.

## Example Business Requests

- "Design a scalable event-driven architecture for this workload."
- "Review this system design and identify risks and alternatives."
- "Plan a migration from monolith to services with a phased roadmap."

## Related

- [`avelin-coding-pro.md`](avelin-coding-pro.md)
- [`avelin-coding-fast.md`](avelin-coding-fast.md)
- [Model Catalog](README.md)
- [API Reference](../api/index.md)
