# avelin-fast

## Model Positioning

`avelin-fast` is AVELIN's low-latency, high-throughput tier — optimized for speed and cost efficiency in routine, high-volume work. Built with AVELIN's Cross-Model MoE technology in our AI Lab, it fuses multiple model architectures into a single trained system optimized for speed behind a single endpoint.

**Context window:** 256K tokens input, 65K tokens output

**Pricing:** $0.77 input / $2.34 output per 1M tokens (cache read $0.13, cache write $0.96) — see [Pricing](../pricing.md)

**Vision support:** When your request contains images, avelin-fast automatically routes to a vision-capable model behind the scenes. You send to `avelin-fast` — we handle the rest. No special model selection needed.

Choose this tier when you need quick, dependable answers at scale.

## Cross-Model MoE

Our Cross-Model MoE uses a prompt-vector classifier trained on 1 year of production data to predict the optimal specialist with 90% accuracy. It applies difficulty-based cascading (simple tasks → fast models, complex tasks → multi-expert fusion) and cost-aware routing (same quality, cheapest path). This is not a router — routers pick one model via if/else rules. We cascade across trained experts and synthesize output quality above any single expert.
Built with AVELIN's Cross-Model MoE technology in our AI Lab. Cross-Model MoE is a trained meta-model — not a router — that fuses knowledge from multiple model architectures into a single unified model. You call `avelin-fast` and get fast output based on task type and latency requirements. For image requests, vision capabilities are engaged automatically. No model selection needed.

**Self-improving platform:** As new frontier models are released, AVELIN integrates them within 48 hours. Your `avelin-fast` endpoint gets faster and smarter over time — automatically, with zero code changes.

**Enterprise licensing:** AVELIN models are available for sovereign deployment on customer GPUs. Contact us for enterprise licensing — run AVELIN on your own infrastructure with full data sovereignty.

## Capabilities at a Glance

| Capability | Detail |
| --- | --- |
| Context window | **256K tokens** |
| Max output | **65K tokens** |
| Reasoning | lightweight (optimized for speed) |
| Tools / function calling | yes |
| Streaming | yes |
| Vision | ✅ yes (auto-routed for image requests) |

## Best-Fit Workloads

- High-volume drafting and rewriting
- Classification, extraction, and tagging
- Chat and assistant interactions where latency matters
- Batch processing of routine requests

## When to Choose avelin-fast

- The task is routine and well-defined
- You are processing many requests and care about cost and speed
- Deep multi-step reasoning is not required

For ambiguous or high-stakes work, escalate to `avelin-pro` or `avelin-ultra`.

## Example Business Requests

- "Summarize these 50 support tickets into one line each."
- "Rewrite this paragraph in a friendlier tone."
- "Classify these messages as billing, technical, or sales."

## Related

- [Model Catalog](README.md)
- [API Reference](../api/index.md)
