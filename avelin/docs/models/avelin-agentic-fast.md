# avelin-agentic-fast

## Model Positioning

`avelin-agentic-fast` is AVELIN's cost-optimized agentic tier — delivering reliable tool-calling and agent execution at the lowest price point in the Agentic family. Built with AVELIN's Cross-Model MoE technology in our AI Lab, it fuses multiple model architectures into a single trained system tuned for high-volume agent operations.

**Context window:** 256K tokens input, 65K tokens output

**Pricing:** $0.65 input / $1.99 output per 1M tokens (cache read $0.11, cache write $0.81) — see [Pricing](../pricing.md)

The right pick for agentic backends that need a cheap, fast, reliable workhorse behind the orchestration layer.

## Cross-Model MoE

Our Cross-Model MoE uses a prompt-vector classifier trained on 1 year of production data to predict the optimal specialist with 90% accuracy. It applies difficulty-based cascading (simple tasks → fast models, complex tasks → multi-expert fusion) and cost-aware routing (same quality, cheapest path). This is not a router — routers pick one model via if/else rules. We cascade across trained experts and synthesize output quality above any single expert.
Built with AVELIN's Cross-Model MoE technology in our AI Lab. Cross-Model MoE is a trained meta-model — not a router — that fuses knowledge from multiple model architectures into a single unified model. You call `avelin-agentic-fast` and get reliable agent execution at scale — the most cost-efficient model that meets your task requirements, without overpaying for unused reasoning capacity.

**Self-improving platform:** As new frontier models are released, AVELIN integrates them within 48 hours. Your `avelin-agentic-fast` endpoint gets more efficient over time — automatically, with zero code changes.

**Enterprise licensing:** AVELIN models are available for sovereign deployment on customer GPUs. Contact us for enterprise licensing — run AVELIN on your own infrastructure with full data sovereignty.

**Why 256K context for high-volume agents:** When you're firing thousands of requests per workflow — classification, extraction, re-ranking, routing — you need speed and cost efficiency without sacrificing quality. 256K context is optimized for these high-throughput scenarios: enough for complex tool use and multi-step reasoning, but lean enough to keep per-token costs minimal. This is the workhorse that makes agent economics work at scale.

## Capabilities at a Glance

| Capability | Detail |
| --- | --- |
| Context window | **256K tokens** |
| Max output | **65K tokens** |
| Reasoning | step-by-step (thinking) |
| Tools / function calling | yes (core strength) |
| Streaming | yes |

## Best-Fit Workloads

- High-volume agent swarms firing thousands of requests per workflow
- Bulk classification and retrieval re-ranking
- Prompt-routing and inner-loop tool calls
- Cost-sensitive agentic backends where every token counts

## When to Choose avelin-agentic-fast

- You're running high-volume agent orchestration
- Per-step cost matters more than peak reasoning depth
- The workload is standard agentic complexity
- You need reliable tool-calling at the lowest price point

For the most demanding agentic reasoning, use `avelin-agentic-ultra`.

## Example Business Requests

- "Classify these 10,000 support tickets by category."
- "Re-rank these 500 search results by relevance."
- "Extract entities from this batch of customer emails."
- "Route each of these queries to the appropriate downstream tool."

## Pricing

See [Pricing](../pricing.md) for complete pricing information. avelin-agentic-fast is the most cost-efficient agentic model in the AVELIN platform, optimized for high-volume workloads.

## Related

- [`avelin-agentic-pro.md`](avelin-agentic-pro.md)
- [`avelin-agentic-ultra.md`](avelin-agentic-ultra.md)
- [Model Catalog](README.md)
- [API Reference](../api/index.md)
