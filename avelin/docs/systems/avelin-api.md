# AVELIN-API

## 1) What This System Is

**AVELIN-API** is the intelligence orchestration core of the AVELIN **Cloud Token Factory** pillar.

It is the product that turns distributed model access into a governed business service by combining:

- Cross-Model MoE technology and difficulty-based cascading
- token and cost visibility
- policy-driven quality controls
- administrative operations controls
- reliable enterprise-scale integration entry points
- 48-hour integration for new model releases (self-improving platform)

In simple terms: AVELIN-API is the **brain-level control plane** that makes AVELIN-GPT, AVELIN-MCP, and Y-RAY work as one controlled system — delivering intelligence up to 85% cheaper for conversational workloads, up to 86% cheaper for coding, and up to 87% cheaper for agentic tasks compared to direct provider access.

## 2) Who Uses It

- Platform administrators and AI operations teams
- Product and engineering teams embedding AVELIN capabilities into internal products
- Security and governance stakeholders defining policy boundaries
- Business leadership monitoring usage, quality, and cost outcomes

## 3) Business Problem It Solves

- Multiple model providers create fragmented operating models
- Teams need one governance surface instead of many disconnected endpoints
- Intelligence spend can scale faster than value if usage is not measured and routed
- Response quality varies when model selection is unmanaged
- Enterprise adoption slows without operational control, traceability, and reliability

## 4) Core Capabilities and Features

### Unified Intelligence Gateway

Provides one managed entry point for business applications and user-facing products.

**What this enables**

- simpler integration architecture
- centralized policy enforcement
- consistent user and product experience

### Cross-Model MoE Specialist Selection

Routes requests across 9 specialist model families using Cross-Model MoE technology:

- **Intelligence family**: ultra (AA Index 55), pro (53), fast (47), plus (49)
- **Coding family**: coding (42), coding-plus, coding-architect (52)
- **Agentic family**: agentic (67), agentic-high (67), agentic-fast (38)

Specialist selection decisions are based on workload intent and policy, using a prompt-vector classifier with 90% accuracy.

**What this enables**

- best-fit model selection per task type
- less lock-in to a single provider path
- quality and speed balancing by scenario

Benchmark scores from Artificial Analysis (June 2026), composite of 9-10 evals, pass@1 scoring.

### Fused Intelligence Paths

Supports single-path and multi-path intelligence strategies for complex requests.

**What this enables**

- stronger synthesis on high-ambiguity tasks
- better option comparison and recommendation quality
- improved decision confidence for strategic workflows

### Smart Routing Economy

Dynamically allocates workloads so routine tasks use efficient routes while complex tasks use deeper reasoning routes.

**What this enables**

- better spend-to-value ratio
- more predictable scaling costs
- efficient use of premium reasoning capacity

### Token Counting and Cost Governance

Tracks usage signals for accountability, optimization, and planning.

**What this enables**

- workload-level and team-level usage transparency
- budget control by policy
- measurable optimization over time

### Administrative Control Interface

Provides operators with control over cascading behavior, governance settings, and service posture.

**What this enables**

- faster operational adjustments
- controlled rollout of new capabilities
- stronger oversight for regulated functions

### Output and Policy Alignment Layer

Ensures routed intelligence remains aligned to platform intent and governance policy.

**What this enables**

- more consistent response posture across model paths
- reduced policy drift at scale
- better brand and trust consistency

### Availability and Continuity Controls

Maintains service continuity when traffic patterns or external model conditions change.

**What this enables**

- stable user experience during variability
- lower disruption to business-critical workflows
- resilient intelligence delivery for enterprise operations

### Integration-Ready API Surface

Designed for product teams to embed AVELIN intelligence into business systems without duplicating governance logic.

**What this enables**

- faster time-to-integration
- lower maintenance overhead
- consistent enterprise controls across products

## 5) Major Benefits and Advantages

- Centralized control over distributed model intelligence
- Higher decision quality through policy-driven specialist selection
- Better cost efficiency via Smart Routing Economy: Intelligence up to 85% cheaper, Coding up to 86% cheaper, Agentic up to 87% cheaper than direct provider access
- Faster enterprise rollout with one governance surface
- Reduced operational risk in regulated and high-sensitivity workflows
- Stronger reliability and continuity for mission-critical usage
- Lower integration complexity for internal product teams
- Self-improving platform with 48-hour integration for new model releases

## 6) Typical Business Scenarios

### Scenario: Enterprise Cost and Quality Balancing

- **Trigger:** AI usage grows rapidly across departments.
- **Workflow:** AVELIN-API applies cascading policy tiers and token governance by workload profile.
- **Outcome:** routine traffic is handled efficiently while high-impact tasks keep premium quality.
- **Business benefit:** improved spend control without sacrificing outcome quality.

### Scenario: Regulated Function Enablement

- **Trigger:** legal, finance, or compliance function requires controlled AI usage.
- **Workflow:** AVELIN-API enforces governed routes, usage visibility, and policy-aligned operation.
- **Outcome:** controlled adoption path with strong oversight.
- **Business benefit:** faster enablement with lower governance risk.

### Scenario: Multi-Product Intelligence Standardization

- **Trigger:** multiple internal products need AI capabilities.
- **Workflow:** each product integrates with AVELIN-API instead of creating custom provider stacks.
- **Outcome:** one shared orchestration model across products.
- **Business benefit:** reduced duplication, faster rollout, and consistent controls.

### Scenario: Executive Decision Workload Prioritization

- **Trigger:** mixed stream of routine requests and high-stakes strategic requests.
- **Workflow:** AVELIN-API routes high-impact requests to deeper reasoning paths and routine ones to efficient paths.
- **Outcome:** predictable quality where it matters most.
- **Business benefit:** better strategic decisions and lower wasted spend.

### Scenario: New Capability Rollout

- **Trigger:** organization introduces a new intelligence route or profile.
- **Workflow:** AVELIN-API adds and governs the new route within existing control patterns.
- **Outcome:** controlled activation with minimal disruption.
- **Business benefit:** faster innovation with lower operational risk.

### Scenario: Reliability-Critical Operations Window

- **Trigger:** peak traffic period during critical business cycle.
- **Workflow:** AVELIN-API continuity controls stabilize specialist selection and preserve priority workflows.
- **Outcome:** stable service during demand spikes.
- **Business benefit:** reduced downtime impact and stronger business continuity.

## 7) Dependencies and Related Systems

- Serves [`avelin-conversational-interface.md`](avelin-conversational-interface.md) as the primary orchestration backend
- Works with [`document-intelligence-rag.md`](document-intelligence-rag.md) for evidence-rich intelligence paths
- Coordinates with [`mcp-integration-platform.md`](mcp-integration-platform.md) for action execution flows
- Operates under [`avelin-security-trust.md`](avelin-security-trust.md) governance controls
- Is observed and optimized through [`operations-and-observability.md`](operations-and-observability.md)

## 8) Success Indicators

- Token efficiency trend (cost per completed business workflow)
- Specialist selection quality trend for strategic and high-impact requests
- Time-to-enable new intelligence capabilities
- Adoption depth across business functions and internal products
- Continuity and uptime during high-demand periods
- Reduction of one-provider dependency risk
- Governance compliance trend for regulated workflows

## Model Profiles in Scope

### Conversational (reasoning + function calling + tool choice + streaming + system messages on all)

| Model | Context | Max Output | Vision | AA Index (v4.x) |
|-------|---------|------------|--------|-----------------|
| `avelin-ultra` | 256K | 65K | native | 55 |
| `avelin-pro` | 256K | 65K | native | 53 |
| `avelin-fast` | 256K | 65K | auto-routed | 47 |
| `avelin-plus` | 256K | 65K | native | 49 |
| `avelin-agentic-pro` | 256K | 65K | — | 67 |
| `avelin-agentic-fast` | 256K | 65K | — | 38 |
| `avelin-agentic-ultra` | 256K | 65K | — | 67 |
| `avelin-coding-fast` | 1M | 65K | — | 42 |
| `avelin-coding-pro` | 1M | 65K | — | — |
| `avelin-coding-ultra` | 1M | 65K | — | 52 |

### Utility

- `bge-m3` — embeddings, 8192-token context
- `whisper-large-v3` / `whisper-large-v3-turbo` — audio transcription
- `avelin-stt` — audio transcription (streaming-optimized)
- `tts-1` — text-to-speech (fast)
- `tts-1-hd` — text-to-speech (multilingual, high quality)
- `avelin-imagegen` / `avelin-imagegen-pro` — image generation

### Web Intelligence (Firecrawl-compatible, `/v2`)

Pass-through for `scrape`, `search`, `map`, `crawl`, and `extract`.

## Related Documentation

- Developer API reference: [`../api/index.md`](../api/index.md)
- API quickstart: [`../api/quickstart.md`](../api/quickstart.md)
- AVELIN-GPT: [`avelin-conversational-interface.md`](avelin-conversational-interface.md)
- AVELIN-MCP: [`mcp-integration-platform.md`](mcp-integration-platform.md)
- Y-RAY: [`document-intelligence-rag.md`](document-intelligence-rag.md)
- Security and Trust: [`avelin-security-trust.md`](avelin-security-trust.md)
- Deployment and administration: [`../operations/deployment-and-administration.md`](../operations/deployment-and-administration.md)
