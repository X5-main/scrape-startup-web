# Pricing

AVELIN is an **AI Laboratory** that builds and deploys **Cross-Model MoE** — trained Mixture-of-Experts intelligence available through two models:

1. **Enterprise Licensing** (Primary) — sovereign deployment on your own GPUs
2. **Cloud API** (Secondary) — usage-based access via API

Both deliver frontier-class intelligence at up to 85% lower cost than closed frontier providers. The same Cross-Model MoE models power both options.

All prices are in USD. Enterprise licensing is per-GPU per year. Cloud API billing is per token for text models, per image for image generation, per minute for audio transcription, and per character for text-to-speech.

---

## Enterprise Licensing (Primary)

**Deploy AVELIN on your own GPUs. Complete sovereignty. No data leaves your perimeter.**

| | Details |
|---|---|
| **Pricing** | $8,000–$18,000 per GPU per year |
| **Gross Margin** | ~83% |
| **Hardware** | Customer provides GPUs |
| **Deployment** | On-premises, private cloud, or air-gapped |
| **Includes** | Full Cross-Model MoE portfolio (all 9 specialist families) |
| **Updates** | Continuous — new models integrated within 48 hours |
| **Support** | Dedicated enterprise support and SLA |

### Why Enterprise Licensing

- **Complete data sovereignty** — your data never leaves your infrastructure
- **Air-gapped operation** — full functionality without external connectivity
- **Compliance-ready** — designed for HIPAA, SOX, FedRAMP, and GDPR
- **Predictable costs** — fixed per-GPU pricing, no usage surprises
- **Full portfolio** — all Intelligence, Coding, and Agentic families included
- **No vendor lock-in** — runs on your hardware, your terms

### Who Uses Enterprise Licensing

- Financial services requiring data residency
- Government and defense (air-gapped environments)
- Healthcare organizations under HIPAA
- Enterprises with existing GPU infrastructure
- Organizations that cannot send data to third-party APIs

**Contact sales@avelin.ai for enterprise licensing discussions.**

---

## Cloud API Pricing (Secondary)

**Usage-based access to the same Cross-Model MoE models. No infrastructure to manage.**

For organizations that prefer pay-as-you-go consumption, the full AVELIN model portfolio is available via OpenAI-compatible API — just 2 lines of code to switch.

Transparent, usage-based pricing. No minimums, no commitments, no hidden fees.

All token prices below are **per 1M tokens**. Prompt caching has two rates: **Cache Write** (writing a prefix into the cache, 1.25× the input price) and **Cache Read** (reusing a cached prefix — roughly 80% cheaper than fresh input).

### Intelligence Family

> **Up to 85% cheaper than GPT-5.5** for general intelligence, reasoning, and analysis workloads.

| Model | AA Index Score | Input | Output | Cache Read | Cache Write |
|-------|---------------|-------|--------|------------|-------------|
| **avelin-ultra** | 55 | $2.50 | $12.50 | $0.52 | $3.13 |
| **avelin-pro** | 53 | $1.40 | $4.40 | $0.26 | $1.75 |
| **avelin-fast** | 47 | $0.77 | $2.34 | $0.13 | $0.96 |

### Coding Family

> **Up to 86% cheaper than Claude Opus** for code generation, refactoring, and architecture workloads.

| Model | AA Index Score | Input | Output | Cache Read | Cache Write |
|-------|---------------|-------|--------|------------|-------------|
| **avelin-coding-ultra** | 52 | $2.50 | $12.50 | $0.52 | $3.13 |
| **avelin-coding-pro** | 49 | $1.40 | $4.40 | $0.26 | $1.75 |
| **avelin-coding-fast** | 42 | $0.77 | $2.34 | $0.13 | $0.96 |

### Agentic Family

> **Up to 87% cheaper than GPT-5.5** for autonomous agents, tool use, and multi-step workflows.

| Model | AA Index Score | Input | Output | Cache Read | Cache Write |
|-------|---------------|-------|--------|------------|-------------|
| **avelin-agentic-ultra** | 67 | $2.38 | $11.88 | $0.49 | $2.98 |
| **avelin-agentic-pro** | 67 | $1.26 | $3.96 | $0.23 | $1.58 |
| **avelin-agentic-fast** | 38 | $0.65 | $1.99 | $0.11 | $0.81 |

*AA Index scores from the [AA Index v4.x](https://aa-index.org) benchmark (June 2026). Higher scores indicate stronger performance.*

### Legacy Model Names

Five models were renamed when the lineup moved to a uniform fast/pro/ultra naming scheme. The old names keep working indefinitely — they are server-side aliases, billed at the canonical tier's prices. No client change is required, but new integrations should use the canonical names.

| Legacy name | Canonical name |
|-------------|----------------|
| `avelin-coding` | `avelin-coding-fast` |
| `avelin-coding-plus` | `avelin-coding-pro` |
| `avelin-coding-architect` | `avelin-coding-ultra` |
| `avelin-agentic` | `avelin-agentic-pro` |
| `avelin-agentic-high` | `avelin-agentic-ultra` |

### Utility Models

| Model | Type | Price |
|-------|------|-------|
| **bge-m3** | Embeddings | $0.020 per 1M tokens |
| **whisper-large-v3** | Transcription | $0.006 per minute |
| **whisper-large-v3-turbo** | Transcription | $0.006 per minute |
| **avelin-stt** | Transcription | $0.006 per minute |
| **avelin-imagegen** | Image Generation | $0.030 per image |
| **avelin-imagegen-pro** | Image Generation | $0.075 per image |
| **tts-1** | Text-to-Speech | $0.120 per 1K characters |
| **tts-1-hd** | Text-to-Speech | $0.240 per 1K characters |

---

## Web Intelligence

The Firecrawl-compatible [Web Intelligence API](api/web-scraping.md) is billed per
request to the calling key. `crawl` and `extract` are asynchronous jobs; the price is
charged once when the job is started.

| Endpoint | Operation | Price (per request) |
|---|---|---|
| `POST /v2/scrape` | Scrape a single URL | $0.001 |
| `POST /v2/map` | Map a site's links | $0.001 |
| `POST /v2/search` | Web search | $0.005 |
| `POST /v2/crawl` | Start a crawl job | $0.010 |
| `POST /v2/extract` | Start an extract job | $0.005 |

---

## Competitor Comparison

See how AVELIN compares to frontier models on pricing for equivalent workloads:

| Workload | AVELIN Model | AVELIN (Input/Output) | Competitor | Competitor (Input/Output) | Savings |
|----------|-------------|----------------------|------------|--------------------------|---------|
| General Intelligence | avelin-fast | $0.77 / $2.34 | GPT-5.5 | $5.00 / $15.00 | **85%** |
| Code Generation | avelin-coding-fast | $0.77 / $2.34 | Claude Opus | $6.00 / $15.00 | **86%** |
| Autonomous Agents | avelin-agentic-pro | $1.26 / $3.96 | GPT-5.5 | $6.00 / $19.00 | **79%** |

*Savings calculated on blended cost for typical workload patterns, including intelligent routing optimization. Actual savings vary by use case.*

### Full Provider Comparison

| Provider | Model | Input (per 1M) | Output (per 1M) | vs AVELIN Pro |
|----------|-------|----------------|-----------------|---------------|
| **AVELIN** | avelin-pro | $1.40 | $4.40 | **Baseline** |
| OpenAI | GPT-5.5 | $5.00 | $15.00 | +257% / +241% more expensive |
| Anthropic | Claude Opus | $6.00 | $15.00 | +329% / +241% more expensive |
| Google | Gemini 3.1 Pro | $4.00 | $18.00 | +186% / +309% more expensive |

**Why AVELIN costs less:**
- **Cross-Model MoE** — trained specialist layers synthesize intelligence at lower compute cost
- Difficulty-based cascading sends simple tasks to cost-efficient tiers automatically
- No single-provider dependency prevents expensive vendor lock-in
- Prompt caching cuts the cost of repeated context by ~80%
- Enterprise licensing: fixed per-GPU cost regardless of usage volume

---

## Cost Optimization

### How Difficulty-Based Cascading Works

AVELIN's Cross-Model MoE meta-model classifies every request by complexity and activates the optimal specialist pathway:

1. **68% of requests** route to cost-efficient tiers (fast tiers across all three families)
2. **20% of requests** use balanced tiers (pro tiers)
3. **12% of requests** require premium tiers (ultra tiers)

This means the majority of your traffic runs at the lowest possible cost, while complex tasks still receive full frontier-class intelligence.

### Prompt Caching

Supported models cut input costs by roughly **80% on cache hits**. Prompt caching has two rates:

- **Cache Write** — 1.25× the input price, charged when a prompt prefix is written into the cache
- **Cache Read** — roughly 5x cheaper than fresh input, charged when a cached prefix is reused

When you send the same system message or context across multiple requests, the first request pays the cache-write rate — every subsequent request pays the much lower cache-read rate.

**Example (avelin-pro, 10K-token system prompt):**
- Fresh input, no caching: $0.014 per request (at $1.40/M)
- First request with caching: $0.0175 (cache write at $1.75/M)
- Every subsequent request: $0.0026 (cache read at $0.26/M)
- **Savings: ~81% per request after the first**

---

## Typical Monthly Costs

### Enterprise License

- **8-GPU cluster**: $64,000–$144,000/year ($8K–$18K per GPU)
- **Includes**: Full model portfolio, continuous updates, enterprise support
- **Unlimited usage**: No per-token charges — use as much as your hardware handles
- **ROI**: Typically 3–6 months vs equivalent cloud API spend at scale

### Cloud API

#### Small Team (1M requests/month)
- **avelin-fast** for customer support: $250/month
- **avelin-pro** for internal tools: $450/month
- **Total: ~$700/month**

#### Mid-Size Company (10M requests/month)
- **avelin-fast** (60% of traffic): $1,400/month
- **avelin-pro** (30% of traffic): $2,650/month
- **avelin-ultra** (10% of traffic): $2,900/month
- **Total: ~$7,000/month**

#### Large Scale (100M requests/month)
- Intelligent routing across all tiers
- **Total: ~$45,000–$70,000/month** (varies by workload mix)
- **At this scale, enterprise licensing typically delivers better economics**

---

## Billing

### Enterprise Licensing
- **Annual contracts** — per-GPU pricing locked for contract term
- **Volume discounts** — multi-GPU and multi-year commitments
- **Invoice billing** — quarterly or annual invoicing

### Cloud API
- **No minimum spend** — pay only for what you use
- **No commitments** — cancel anytime
- **Real-time usage tracking** — monitor costs in the dashboard
- **Automatic alerts** — get notified when approaching budget limits
- **Invoice billing** — monthly invoices with detailed usage breakdown

---

## Free Tier

New cloud API accounts receive:
- **$10 free credit** to explore all models
- **No credit card required** to start
- **Full access** to all features and models

*Enterprise licensing trials available upon request — contact sales@avelin.ai.*

---

## Questions?

- **Enterprise licensing:** Contact sales@avelin.ai for sovereign deployment pricing
- **Technical questions:** See [API Reference](api/index.md)
- **Model selection:** See [Model Catalog](models/README.md)
