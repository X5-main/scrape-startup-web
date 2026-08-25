# How AVELIN Works

## Technical Architecture Overview

AVELIN implements **API-level Mixture-of-Experts** — a specialist selection and fusion layer that automatically optimizes every request for cost, quality, and reliability. This page explains the technical flow from request to response.

## The 6-Stage Request Flow

```
User Request
    ↓
┌─────────────────────────────────────────────────────────┐
│ Stage 1: Semantic Router (50ms)                         │
│ - Classifies task type: code, reasoning, chat, etc.     │
│ - Embeds request using semantic transformer             │
│ - KNN classifier selects optimal model family           │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ Stage 2: Cross-Model MoE Classifier                     │
│ - Considers: cost, latency, quality, availability      │
│ - Selects specific model tier (ultra/pro/fast)         │
│ - Can route to multiple models in parallel (fusion)    │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ Stage 3: Model Fusion Layer (if enabled)                │
│ - Queries multiple frontier models in parallel         │
│ - Averages token probabilities or votes on answers     │
│ - Cross-verifies responses to reduce hallucinations    │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ Stage 4: Confidence Scoring                             │
│ - Evaluates model confidence in response               │
│ - High confidence (>0.8): return response              │
│ - Low confidence (<0.8): escalate to premium model     │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ Stage 5: Response Transformation                        │
│ - Sanitizes reasoning content (chain-of-thought)       │
│ - Applies AVELIN branding                              │
│ - Strips provider identifiers                          │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ Stage 6: Continuous Evaluation (background)             │
│ - Benchmarks all providers hourly                      │
│ - Tracks: accuracy, latency, cost per task type        │
│ - Auto-updates selection weights based on performance    │
└─────────────────────────────────────────────────────────┘
    ↓
Response Returned (3.5s average total latency)
```

## Stage 1: Semantic Routing (50ms Latency)

AVELIN's semantic router classifies every incoming request before it reaches a model. This is the key differentiator from basic multi-provider proxies.

**How it works:**
1. Request text is embedded using a lightweight semantic transformer model
2. KNN classifier matches to task type based on training data
3. Optimal model family is selected

**Task classification examples:**

| Request | Classification | Route To |
|---------|---------------|----------|
| "Write Python code for..." | CODE | avelin-coding-fast |
| "Solve this calculus problem..." | REASONING | avelin-ultra |
| "Tell me a joke..." | SIMPLE_CHAT | avelin-fast |
| "Analyze this contract..." | DOCUMENT_ANALYSIS | avelin-pro |
| "Debug this error..." | CODE_DEBUG | avelin-coding-fast |

**Impact:**
- 68% of requests routed to cost-efficient models
- 23% quality improvement on specialized tasks
- 50ms classification latency (negligible vs 2-5s model response)

**Training data:** Built from millions of real production requests, continuously updated.

## Stage 2: Intelligent Model Selection

Once the task type is classified, AVELIN's router selects the optimal model tier within that family.

**Selection criteria:**
- **Cost:** Prefer cheaper models for simple tasks
- **Latency:** Consider time-to-first-token requirements
- **Quality:** Match model capability to task complexity
- **Availability:** Route away from degraded providers
- **Context length:** Ensure model can handle request size

**Model tier mapping:**

| Family | Ultra (Premium) | Pro (Balanced) | Fast (Efficient) |
|--------|----------------|----------------|------------------|
| Intelligence | Complex reasoning, strategy | Daily workflows, analysis | Simple chat, classification |
| Coding | Architecture, security review | Feature development | Bug fixes, refactoring |
| Agentic | Long-horizon planning | Standard tool use | High-volume agent swarms |

## Stage 3: Multi-Model Fusion (Optional)

For critical requests, AVELIN can query multiple frontier models in parallel and aggregate their responses.

**Aggregation strategies:**

1. **Weighted token probability averaging**
   - Combine probability distributions from multiple models
   - Higher weight to models with better benchmark scores
   - Produces "average" response that's often better than any single model

2. **Voting**
   - Each model generates independent response
   - Pick most common answer (majority vote)
   - Effective for factual questions

3. **Synthesis**
   - Use a meta-model to merge responses
   - Extract best parts from each
   - Most expensive but highest quality

**Impact:**
- 17% hallucination reduction through cross-verification
- Stronger synthesis on ambiguous tasks
- Higher confidence in critical responses

**When enabled:** Automatically for avelin-ultra on high-stakes requests, or manually via API parameter.

## Stage 4: Confidence-Based Cascading

AVELIN doesn't always use the most expensive model. It starts with cost-efficient models and escalates only when needed.

**The cascading flow:**

```
Request arrives
    ↓
avelin-fast tries (cost-efficient tier, $0.0005/request)
    ↓
Confidence score calculated (0.0 to 1.0)
    ↓
┌──────────────────────────────────────┐
│ If confidence > 0.8:                 │
│   Return response (cheap path)       │
│                                      │
│ If confidence < 0.8:                 │
│   Escalate to avelin-ultra           │
│   ($0.004/request)                   │
│   Return premium response            │
└──────────────────────────────────────┘
```

**Impact:**
- up to 85% cost savings on routine workloads
- Premium quality preserved for complex tasks
- Automatic optimization based on model uncertainty

**Escalation rate:** ~20% of requests escalate (80% handled by efficient models).

## Stage 5: Response Transformation

Before returning the response to the user, AVELIN applies several transformations:

1. **Reasoning sanitization:** Strips chain-of-thought that might reveal backend providers
2. **Branding:** Ensures consistent AVELIN identity
3. **Error handling:** Sanitizes error messages to prevent information leakage
4. **Format normalization:** Ensures consistent API response format

## Stage 6: Continuous Evaluation (Background)

AVELIN continuously benchmarks all providers and automatically updates selection weights.

**Evaluation process:**
1. Every hour, run benchmark suite on all providers
2. Track: accuracy, latency, cost, availability per task type
3. Update selection weights based on performance
4. Deploy updated weights (no restart required)

**Real-world results (last 90 days):**
- Routing weights updated 312 times
- 8% quality improvement over baseline
- 12% cost decrease as cheaper models improved
- Automatic failover when providers degraded

**Benchmark categories:**
- Coding: SWE-bench, HumanEval, MBPP
- Reasoning: MMLU, GPQA, GSM8K
- Agentic: TauBench, AgentBench
- Multilingual: Various language tasks

## Performance Characteristics

**Latency breakdown (median):**
- Prompt-vector classifier: 50ms
- Model selection: 10ms
- Model inference: 2,500ms (varies by provider)
- Response transformation: 20ms
- **Total: ~2.6s average**

**Streaming throughput:** 18.8 chunks/sec

**Time-to-first-token:** 1.6s median

**Reliability:**
- 99.97% uptime (multi-provider fallback)
- 0.3s average failover time
- 0 data loss incidents in 12 months

## Cost Optimization

**Average cost per request:** $0.003 (varies by model tier)

**Cost breakdown by specialist selection:**
- 68% requests → efficient models ($0.0002-$0.0005)
- 20% requests → balanced models ($0.001-$0.002)
- 12% requests → premium models ($0.002-$0.007)

**vs alternatives:**
- vs single-provider direct access: 42% cheaper
- vs always-premium selection: up to 85% cheaper
- vs manual model selection: 23% better quality on specialized tasks

## Comparison to Traditional Approaches

| Approach | How It Works | Limitations |
|----------|--------------|-------------|
| **Single provider** | All requests to one model | Expensive, single point of failure, vendor lock-in |
| **Manual selection** | User picks model per request | Requires expertise, suboptimal, high cognitive load |
| **Static rules** | "Code requests → coding model" | No adaptation, no optimization over time |
| **Basic proxy** | Round-robin or weighted traffic splitting | No task classification, no quality optimization |
| **AVELIN** | Prompt-vector classifier + fusion + difficulty-based cascading + continuous evaluation | **Optimal cost, quality, and reliability** |

## Technical Specifications

**Supported protocols:**
- OpenAI-compatible API (chat completions, embeddings)
- Function calling / tool use
- Streaming responses
- Batch processing

**Model families:**
- Intelligence: ultra, pro, fast
- Coding: coding, coding-plus, coding-architect
- Agentic: agentic-high, agentic, agentic-fast
- Utility: embeddings (bge-m3), transcription (whisper), image generation

**Infrastructure:**
- Kubernetes-based (k3s cluster)
- Multi-region deployment (Hetzner, OVHcloud)
- Horizontal pod autoscaling (3-10 replicas)
- Redis for distributed state
- PostgreSQL for persistence

**Security:**
- TLS encryption in transit
- API key authentication
- Request/response sanitization
- PII stripping (configurable)
- Zero data retention policy (configurable)

## Getting Started

AVELIN is OpenAI-compatible. Switch in 5 minutes:

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.avelin.ai/v1",
    api_key="your-avelin-api-key"
)

response = client.chat.completions.create(
    model="avelin-pro",  # or ultra, fast, coding, etc.
    messages=[{"role": "user", "content": "Hello!"}]
)
```

No code changes needed if you're already using the OpenAI SDK. AVELIN handles all the specialist selection, fusion, and optimization automatically using its prompt-vector classifier with 90% accuracy.

## Related Documentation

- [Platform Overview](../platform-overview.md)
- [Model Catalog](../models/README.md)
- [API Reference](../api/index.md)
- [Competitive Advantages](../benefits/competitive-advantages.md)
