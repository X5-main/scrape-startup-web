# avelin-ultra

## Model Positioning

`avelin-ultra` is AVELIN's flagship reasoning tier — the highest-intelligence model in the Intelligence family. Built with AVELIN's Cross-Model MoE technology in our AI Lab, it fuses multiple model architectures into a single trained system for high-complexity business work.

**Context window:** 256K tokens input, 65K tokens output

**Pricing:** $2.50 input / $12.50 output per 1M tokens (cache read $0.52, cache write $3.13) — see [Pricing](../pricing.md)

Choose this tier when decision quality, rigor, and structured thinking are more important than raw speed.

## Cross-Model MoE

Our Cross-Model MoE uses a prompt-vector classifier trained on 1 year of production data to predict the optimal specialist with 90% accuracy. It applies difficulty-based cascading (simple tasks → fast models, complex tasks → multi-expert fusion) and cost-aware routing (same quality, cheapest path). This is not a router — routers pick one model via if/else rules. We cascade across trained experts and synthesize output quality above any single expert.
Built with AVELIN's Cross-Model MoE technology in our AI Lab. Cross-Model MoE is a trained meta-model — not a router — that fuses knowledge from multiple model architectures into a single unified model. You call `avelin-ultra` and get consistently top-tier output without model selection or vendor lock-in.

**Self-improving platform:** As new frontier models are released, AVELIN integrates them within 48 hours. Your `avelin-ultra` endpoint gets smarter over time — automatically, with zero code changes.

**Enterprise licensing:** AVELIN models are available for sovereign deployment on customer GPUs. Contact us for enterprise licensing — run AVELIN on your own infrastructure with full data sovereignty.

## Capabilities at a Glance

| Capability | Detail |
| --- | --- |
| Context window | **256K tokens** |
| Max output | **65K tokens** |
| Reasoning | deepest (high effort) |
| Tools / function calling | yes |
| Streaming | yes |
| Vision | yes |

## Best-Fit Workloads

- Strategic planning and scenario analysis
- Executive decision support
- Risk evaluation and trade-off analysis
- Complex synthesis from multiple information streams
- High-stakes communications that require precision

## Functional Strengths

### Deep Multi-Step Reasoning

Handles layered problems with multiple dependencies and constraints.

### Strong Synthesis Quality

Combines large context and mixed input types into coherent decision-ready outputs.

### Nuanced Decision Framing

Produces structured options, consequences, and recommendation logic for leadership use.

### High-Reliability Output Style

Optimized for quality and completeness in critical workflows.

## Business Benefits

- Better quality in strategic and high-impact decisions
- Reduced rework on complex deliverables
- Higher confidence in leadership-facing outputs
- Stronger consistency for policy-sensitive or risk-sensitive tasks

## When to Choose avelin-ultra

Use `avelin-ultra` when at least one of these is true:

- The decision has meaningful financial, legal, or reputational impact
- The task has ambiguity and no obvious single-path answer
- The output needs board, executive, or client-grade quality
- You need explicit option comparison and recommendation structure

## Prompting Guidance

- Ask for structured outputs (options, risks, recommendation, next actions)
- Provide constraints and success criteria up front
- Request confidence framing when decisions involve uncertainty

## Example Business Requests

- "Build a 90-day strategic options memo with risk matrix and recommendation."
- "Compare three operating models and propose the best path with trade-offs."
- "Create an executive brief with decision options and implementation sequence."

## Success Metrics

- Reduced revision cycles on strategic documents
- Higher stakeholder acceptance on first draft
- Faster decision closure for complex initiatives
