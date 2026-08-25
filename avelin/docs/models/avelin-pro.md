# avelin-pro

## Model Positioning

`avelin-pro` is AVELIN's high-efficiency reasoning tier — delivering strong intelligence with faster turnaround and lower cost. Built with AVELIN's Cross-Model MoE technology in our AI Lab, it fuses multiple model architectures into a single trained system optimized for production economics.

**Context window:** 256K tokens input, 65K tokens output

**Pricing:** $1.40 input / $4.40 output per 1M tokens (cache read $0.26, cache write $1.75) — see [Pricing](../pricing.md)

Choose this tier when throughput, responsiveness, and routine workflow acceleration are the primary goals.

## Cross-Model MoE

Our Cross-Model MoE uses a prompt-vector classifier trained on 1 year of production data to predict the optimal specialist with 90% accuracy. It applies difficulty-based cascading (simple tasks → fast models, complex tasks → multi-expert fusion) and cost-aware routing (same quality, cheapest path). This is not a router — routers pick one model via if/else rules. We cascade across trained experts and synthesize output quality above any single expert.
Built with AVELIN's Cross-Model MoE technology in our AI Lab. Cross-Model MoE is a trained meta-model — not a router — that fuses knowledge from multiple model architectures into a single unified model. You call `avelin-pro` and get consistently strong output at production-friendly pricing without vendor lock-in.

**Self-improving platform:** As new frontier models are released, AVELIN integrates them within 48 hours. Your `avelin-pro` endpoint gets smarter over time — automatically, with zero code changes.

**Enterprise licensing:** AVELIN models are available for sovereign deployment on customer GPUs. Contact us for enterprise licensing — run AVELIN on your own infrastructure with full data sovereignty.

## Capabilities at a Glance

| Capability | Detail |
| --- | --- |
| Context window | **256K tokens** |
| Max output | **65K tokens** |
| Reasoning | high effort |
| Tools / function calling | yes |
| Streaming | yes |
| Vision | yes |

## Best-Fit Workloads

- Daily communication drafting
- Meeting preparation and recap generation
- Task planning and follow-up sequencing
- Internal knowledge Q&A
- Repetitive operational workflows at scale

## Functional Strengths

### Fast Response Performance

Delivers quick turnaround for iterative workflows and high request volume.

### Strong Day-to-Day Utility

Excellent for practical business tasks that need speed and consistency.

### Workflow Throughput

Supports large volumes of routine prompts without sacrificing usability.

### Cost-Efficient Execution

Well suited for Smart Routing Economy policies in AVELIN-API. At 60% less than GPT-5.5, `avelin-pro` is the go-to tier for high-volume production workloads.

## Business Benefits

- Higher team productivity in daily operations
- Faster communication and coordination cycles
- Lower cost per routine workflow
- Better scalability for organization-wide adoption

## When to Choose avelin-pro

Use `avelin-pro` when these conditions apply:

- The task is routine, repeatable, and operational in nature
- Speed and turnaround are critical
- Output is important but does not require deep strategic reasoning
- You are processing large volumes of similar requests

## Prompting Guidance

- Keep instructions clear and action-oriented
- Specify output format to reduce revision cycles
- For complex ambiguity, escalate to `avelin-ultra`

## Example Business Requests

- "Draft a customer follow-up email from these meeting notes."
- "Summarize this conversation into five action items and owners."
- "Generate tomorrow's priority plan from this task list."

## Success Metrics

- Faster average completion time for routine tasks
- Increased daily workflow throughput per user
- Lower spend for operational prompt volume
