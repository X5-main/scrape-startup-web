# avelin-coding-pro

> **Formerly `avelin-coding-plus`.** The legacy name keeps working as a server-side alias — no client change required.

## Model Positioning

`avelin-coding-pro` is AVELIN's high-throughput coding tier — delivering enhanced reasoning for complex engineering tasks at production speed. Built with AVELIN's Cross-Model MoE technology in our AI Lab, it fuses multiple model architectures into a single trained system that maximizes coding quality and workload capacity simultaneously.

**Context window:** 1M tokens input, 65K tokens output

**Pricing:** $1.40 input / $4.40 output per 1M tokens (cache read $0.26, cache write $1.75) — see [Pricing](../pricing.md)

Maximized throughput for high-volume agentic loops, large multi-file refactors, and latency-sensitive CI/code-review pipelines where waiting on tokens kills developer experience.

## Cross-Model MoE

Our Cross-Model MoE uses a prompt-vector classifier trained on 1 year of production data to predict the optimal specialist with 90% accuracy. It applies difficulty-based cascading (simple tasks → fast models, complex tasks → multi-expert fusion) and cost-aware routing (same quality, cheapest path). This is not a router — routers pick one model via if/else rules. We cascade across trained experts and synthesize output quality above any single expert.
Built with AVELIN's Cross-Model MoE technology in our AI Lab. Cross-Model MoE is a trained meta-model — not a router — that fuses knowledge from multiple model architectures into a single unified model. You call `avelin-coding-pro` and get high-quality code at production speed based on task complexity, language, and throughput requirements — without vendor lock-in.

**Self-improving platform:** As new frontier models are released, AVELIN integrates them within 48 hours. Your `avelin-coding-pro` endpoint gets more capable over time — automatically, with zero code changes.

**Enterprise licensing:** AVELIN models are available for sovereign deployment on customer GPUs. Contact us for enterprise licensing — run AVELIN on your own infrastructure with full data sovereignty.

**The 1M context advantage:** Process entire repositories without chunking. When you're refactoring across 50 files or analyzing a complex codebase, you need to see everything at once. This is whole-repository intelligence at production speed.

## Capabilities at a Glance

| Capability | Detail |
| --- | --- |
| Context window | **1M tokens** |
| Max output | **65K tokens** |
| Reasoning | deep step-by-step (thinking) |
| Tools / function calling | yes |
| Streaming | yes |

## Best-Fit Workloads

- Non-trivial feature implementation
- Multi-file refactoring with cross-cutting impact
- Tricky debugging that needs careful reasoning
- Code that must meet higher correctness and quality bars

## When to Choose avelin-coding-pro

- `avelin-coding-fast` is not producing the depth you need
- The change spans multiple files or has subtle edge cases
- Correctness matters more than raw speed

For system-level architecture and design, use `avelin-coding-ultra`.

## Example Business Requests

- "Implement this feature across the API and the client, with tests."
- "Track down this intermittent race condition and fix it safely."
- "Refactor this service to a cleaner pattern without breaking callers."

## Related

- [`avelin-coding-fast.md`](avelin-coding-fast.md)
- [`avelin-coding-ultra.md`](avelin-coding-ultra.md)
- [Model Catalog](README.md)
- [API Reference](../api/index.md)
