# avelin-coding-fast

> **Formerly `avelin-coding`.** The legacy name keeps working as a server-side alias — no client change required.

## Model Positioning

`avelin-coding-fast` is AVELIN's standard software-engineering tier — the balanced entry point in the Coding family for everyday agentic development workflows. Built with AVELIN's Cross-Model MoE technology in our AI Lab, it fuses multiple model architectures into a single trained system optimized for cost and capability.

**Context window:** 1M tokens input, 65K tokens output

**Pricing:** $0.77 input / $2.34 output per 1M tokens (cache read $0.13, cache write $0.96) — see [Pricing](../pricing.md)

Balanced engineering tier for day-to-day coding at the strongest cost-per-capability ratio in the family.

## Cross-Model MoE

Our Cross-Model MoE uses a prompt-vector classifier trained on 1 year of production data to predict the optimal specialist with 90% accuracy. It applies difficulty-based cascading (simple tasks → fast models, complex tasks → multi-expert fusion) and cost-aware routing (same quality, cheapest path). This is not a router — routers pick one model via if/else rules. We cascade across trained experts and synthesize output quality above any single expert.
Built with AVELIN's Cross-Model MoE technology in our AI Lab. Cross-Model MoE is a trained meta-model — not a router — that fuses knowledge from multiple model architectures into a single unified model. You call `avelin-coding-fast` and get consistently strong code output based on language, complexity, and context requirements — without vendor lock-in.

**Self-improving platform:** As new frontier models are released, AVELIN integrates them within 48 hours. Your `avelin-coding-fast` endpoint gets more capable over time — automatically, with zero code changes.

**Enterprise licensing:** AVELIN models are available for sovereign deployment on customer GPUs. Contact us for enterprise licensing — run AVELIN on your own infrastructure with full data sovereignty.

**Why 1M context matters:** Load entire repositories into context. Understand cross-file dependencies, trace execution paths across modules, and refactor with complete codebase awareness. This isn't just a large context window — it's whole-repository intelligence.

## Capabilities at a Glance

| Capability | Detail |
| --- | --- |
| Context window | **1M tokens** |
| Max output | **65K tokens** |
| Reasoning | step-by-step (thinking) |
| Tools / function calling | yes |
| Streaming | yes |

## Best-Fit Workloads

- Writing and reviewing application code
- Refactoring and bug fixing
- Explaining unfamiliar code and writing tests
- Working across large files and multi-file context

## When to Choose avelin-coding-fast

- Day-to-day development tasks
- You want strong code quality without the heaviest tier
- The repository or context is large

For harder design work, use `avelin-coding-pro` or `avelin-coding-ultra`.

## Example Business Requests

- "Add input validation to this endpoint and write tests."
- "Find and fix the bug causing this stack trace."
- "Explain what this module does and suggest improvements."

## Related

- [`avelin-coding-pro.md`](avelin-coding-pro.md)
- [`avelin-coding-ultra.md`](avelin-coding-ultra.md)
- [Model Catalog](README.md)
- [API Reference](../api/index.md)
