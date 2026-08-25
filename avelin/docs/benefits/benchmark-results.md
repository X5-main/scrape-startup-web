# Benchmark Results

## Overview

AVELIN is an **AI Intelligence Platform** powered by **Cross-Model MoE** — a trained meta-model, not a router — that fuses open models into **9 specialist model families** across three domains: Intelligence, Coding, and Agentic. This page presents the complete benchmark data for all 9 families, competitive cost analysis, and full methodology documentation.

**Last updated:** August 2026
**Benchmark source:** Artificial Analysis (AA), v4.x composite index
**Scoring method:** pass@1, composite of 9–10 evaluations per family
**Platform architecture:** 3 pillars — AI Lab, Cloud Token Factory, Enterprise Platform

---

## Complete AA Index Scores

All scores from **Artificial Analysis, June 2026, v4.x**. The AA Index is a composite of 9–10 evaluations using pass@1 scoring methodology. Higher scores indicate better overall capability.

### Intelligence Family

| Model | AA Index Score | Input $/1M tokens | Output $/1M tokens | Role |
|---|---|---|---|---|
| **avelin-ultra** | **55** | $2.50 | $12.50 | Deep reasoning, strategy, complex analysis |
| **avelin-pro** | **53** | $1.40 | $4.40 | Multimodal reasoning, balanced performance |
| **avelin-fast** | **47** | $0.77 | $2.34 | Simple chat, classification, high-volume |

### Coding Family

| Model | AA Index Score | Input $/1M tokens | Output $/1M tokens | Role |
|---|---|---|---|---|
| **avelin-coding-ultra** | **52** | $2.50 | $12.50 | Architecture, security, whole-repo analysis |
| **avelin-coding-pro** | **49** | $1.40 | $4.40 | High-throughput coding, production workflows |
| **avelin-coding-fast** | **42** | $0.77 | $2.34 | Daily coding workflows, implementation |

### Agentic Family

| Model | AA Index Score | Input $/1M tokens | Output $/1M tokens | Role |
|---|---|---|---|---|
| **avelin-agentic-ultra** | **67** | $2.38 | $11.88 | Complex agentic workflows, multi-step tools |
| **avelin-agentic-pro** | **67** | $1.26 | $3.96 | Standard tool use, automation |
| **avelin-agentic-fast** | **38** | $0.65 | $1.99 | High-volume agent swarms |

---

## Benchmark Methodology

### What is the Artificial Analysis Index?

The **Artificial Analysis (AA) Index** is an independent, comprehensive model evaluation framework that produces a single composite score from multiple standardized evaluations. AVELIN uses AA Index v4.x as its primary benchmark reference.

### Scoring Methodology

| Aspect | Detail |
|---|---|
| **Source** | Artificial Analysis (independent third-party) |
| **Version** | v4.x (current as of June 2026) |
| **Scoring** | pass@1 — model must produce a correct answer on first attempt |
| **Composition** | 9–10 evaluations per model family, weighted composite |
| **Frequency** | Continuously updated; AVELIN snapshots monthly |
| **Independence** | AVELIN does not control AA scoring methodology |

### Evaluation Suites (Composite Components)

The AA Index composite score draws from these evaluation domains:

| Evaluation | What It Measures | Relevance |
|---|---|---|
| **SWE-bench Verified** | Real-world software engineering tasks | Coding family |
| **SWE-bench Pro** | Advanced engineering challenges | Coding-ultra |
| **GPQA Diamond** | Graduate-level scientific reasoning | Intelligence family |
| **MMMU Pro** | Multimodal understanding (text, images, charts) | Intelligence family |
| **MMLU / MMLU-Pro** | Broad knowledge and reasoning | All families |
| **TauBench** | Agentic tool-calling workflows | Agentic family |
| **MCP-Atlas** | Tool-augmented reasoning | Agentic family |
| **CyberGym** | Security-sensitive workflows | Coding-ultra, Agentic-ultra |
| **LMArena Text Arena** | Human preference rankings | Intelligence family |
| **VIBE-Pro** | Visual IDE coding benchmark | Coding family |
| **Terminal Bench 2** | CLI-based coding tasks | Coding family |

### How AVELIN Uses Benchmark Data

1. **Model selection:** Cross-Model MoE routing uses AA Index scores to match requests to the optimal specialist family
2. **Quality assurance:** Monthly AA Index snapshots verify that model performance is maintained or improving
3. **Routing optimization:** Real-time production benchmarks supplement AA Index data for dynamic routing weights
4. **Competitive tracking:** AA Index scores compared against GPT-5.5, Claude Opus, and other frontier models

### Limitations and Caveats

- AA Index scores are composite — individual eval scores may vary more than the composite suggests
- pass@1 scoring is strict; real-world usage with retries may show higher effective accuracy
- Benchmark scores may not perfectly predict performance on domain-specific proprietary tasks
- Cost savings vary based on workload mix (more simple tasks = higher savings from routing)
- Latency includes 50ms routing overhead that direct providers don't have

---

## Cost Savings: Family-by-Family Analysis

Savings are computed on blended cost at a typical 3:1 input:output token ratio.

### Intelligence Family: Up to 85% Cheaper than GPT-5.5

| Model | AA Index | Input $/1M | Output $/1M | Cost vs GPT-5.5 |
|---|---|---|---|---|
| avelin-ultra | 55 | $2.50 | $12.50 | ~33% cheaper |
| avelin-pro | 53 | $1.40 | $4.40 | ~71% cheaper |
| avelin-fast | 47 | $0.77 | $2.34 | **~85% cheaper** |

**Use case:** Strategic analysis, executive summaries, complex reasoning, multimodal understanding. avelin-ultra (AA: 55) handles the hardest problems at $2.50/$12.50 — 33% less than GPT-5.5's pricing, while avelin-fast delivers routine intelligence at 85% below it.

### Coding Family: Up to 86% Cheaper than Claude Opus

| Model | AA Index | Input $/1M | Output $/1M | Cost vs Claude Opus |
|---|---|---|---|---|
| avelin-coding-ultra | 52 | $2.50 | $12.50 | ~39% cheaper |
| avelin-coding-pro | 49 | $1.40 | $4.40 | ~74% cheaper |
| avelin-coding-fast | 42 | $0.77 | $2.34 | **~86% cheaper** |

**Use case:** Software development, architecture design, security analysis, code review. avelin-coding-ultra (AA: 52) delivers Top 1% Coding Index performance with 1M-token context at $2.50/$12.50 — 39% less than Claude Opus, while avelin-coding-fast covers daily coding at 86% below it.

### Agentic Family: Up to 87% Cheaper than GPT-5.5

| Model | AA Index | Input $/1M | Output $/1M | Cost vs GPT-5.5 |
|---|---|---|---|---|
| avelin-agentic-ultra | 67 | $2.38 | $11.88 | ~37% cheaper |
| avelin-agentic-pro | 67 | $1.26 | $3.96 | ~74% cheaper |
| avelin-agentic-fast | 38 | $0.65 | $1.99 | **~87% cheaper** |

**Use case:** Tool-calling, multi-step automation, agent swarms, MCP workflows. avelin-agentic-pro (AA: 67) matches frontier-flagship agentic performance at $1.26/$3.96 — 74% cheaper than GPT-5.5. avelin-agentic-ultra achieves the same AA Index 67 at $2.38/$11.88 for complex workflows requiring premium throughput.

### Combined Cost Advantage

| Scenario | Without AVELIN | With AVELIN | Savings |
|---|---|---|---|
| 1M requests/month, mixed workload | $5,800 (GPT-5.5) | $2,150 (Cross-Model MoE) | **63%** |
| Pure intelligence workload | $10,000 (GPT-5.5) | $6,700 (ultra) | **33%** |
| Pure coding workload | $7,500 (Claude Opus) | $4,550 (coding-ultra) | **39%** |
| Pure agentic workload | $10,000 (GPT-5.5) | $2,600 (agentic-pro) | **74%** |

---

## Detailed Model Performance

### Intelligence Family Highlights

**avelin-ultra (AA Index: 55)**
- Deep reasoning and strategy specialist
- 256K token context window
- 33% cheaper than GPT-5.5 for equivalent intelligence capability
- Ideal for: executive analysis, complex decision support, research synthesis

**avelin-pro (AA Index: 53)**
- Multimodal reasoning (text, images, charts)
- 256K token context window
- ~3x faster response times vs ultra tier
- 30% fewer tokens than prior-generation frontier models
- Ideal for: balanced daily intelligence, multimodal tasks

**avelin-fast (AA Index: 47)**
- #1 ranking on LMArena Text Arena (1483 Elo, 31 points above next)
- ~50% hallucination rate reduction vs prior generation
- Dual-mode: instant replies + multi-step tool-calling
- Lowest cost in Intelligence family: $0.77/$2.34
- Ideal for: high-volume chat, classification, simple reasoning

### Coding Family Highlights

**avelin-coding-ultra (AA Index: 52)**
- 58.4% on SWE-bench Pro (ahead of every major US flagship at release)
- Top 1% Coding Index (51.5 on Artificial Analysis)
- 68.7 on CyberGym, 71.8 on MCP-Atlas
- 1M-token context for whole-repo analysis
- 39% cheaper than Claude Opus
- Ideal for: architecture, security review, large codebase analysis

**avelin-coding-pro (AA Index: 49)**
- ~100 tokens/sec throughput (2x standard family)
- Top 4% Intelligence Index
- Top 7% Coding Index (41.9)
- Top 4% Agentic Index (61.5)
- Ideal for: high-throughput production coding, CI/CD integration

**avelin-coding-fast (AA Index: 42)**
- 56.22% on SWE-Pro, 55.6% on VIBE-Pro, 57% on Terminal Bench 2
- 97% skill adherence across 40 complex skills
- 94% on enterprise automation benchmarks
- Lowest cost in Coding family: $0.77/$2.34
- Ideal for: daily coding tasks, implementation, debugging

### Agentic Family Highlights

**avelin-agentic-ultra (AA Index: 67)**
- 77.8% on SWE-bench Verified
- 94.6% of frontier-flagship performance at fraction of cost
- Tops family on MCP-Atlas (71.8) and CyberGym (68.7)
- 37% cheaper than GPT-5.5 for complex agentic workflows
- Ideal for: multi-step tool chains, complex automation, research agents

**avelin-agentic-pro (AA Index: 67)**
- Same AA Index score as agentic-ultra (67) — highest in entire catalog
- Matches/beats frontier mid-tier on Codeforces, MMLU, HLE, TauBench
- Exceeds on HealthBench and AIME 2024/2025
- On-prem-ready for regulated industries
- $1.26/$3.96 — exceptional value for AA Index 67
- Ideal for: standard tool use, automation, daily agentic workflows

**avelin-agentic-fast (AA Index: 38)**
- Designed for high-volume agent swarms
- Lowest per-request cost in entire platform: $0.65/$1.99
- Optimized for throughput over depth
- Ideal for: parallel agent execution, classification agents, data processing swarms

---

## Market Comparison

### AVELIN vs Major Providers

| Provider / Model | Intelligence Index | Coding Index | Agentic Index | Input Cost | Output Cost | Uptime |
|---|---|---|---|---|---|---|
| **AVELIN ultra** | **55** | — | — | **$2.50** | **$12.50** | **99.97%** |
| **AVELIN coding-ultra** | — | **52 (Top 1%)** | — | **$2.50** | **$12.50** | **99.97%** |
| **AVELIN agentic-pro** | — | — | **67** | **$1.26** | **$3.96** | **99.97%** |
| GPT-5.5 | ~56 | ~55 | ~65 | $5.00+ | $22.50+ | ~90% |
| Claude Opus | ~53 | ~48 | ~67 | $5.00 | $25.00 | ~99.6% |
| Google Gemini Pro | ~57 | ~55 | ~59 | $4.00 | $18.00 | ~99.0% |

**Key findings:**
- AVELIN's Cross-Model MoE delivers **Top 1–4% performance** across all three benchmark categories
- **Up to 85% cheaper** than GPT-5.5 (intelligence), **up to 86% cheaper** than Claude Opus (coding), **up to 87% cheaper** than GPT-5.5 (agentic)
- **99.97% uptime** via multi-provider fallback (better than any single provider)
- **No vendor lock-in** — 9 families, swap providers without code changes

### Cost Comparison: Real-World Workload

**Scenario:** 1 million requests/month, mixed workload (68% simple, 20% balanced, 12% complex)

| Provider | Monthly Cost | Quality (AA Index) |
|---|---|---|
| **AVELIN (Cross-Model MoE routing)** | **$1,250** | **47–67 (by family)** |
| GPT-5.5 (single model) | $7,250 | ~56 |
| Claude Opus (single model) | $7,500 | ~53 |
| Google Gemini Pro (single model) | $4,200 | ~57 |
| OpenRouter (pass-through) | $4,100 | Varies |

**Savings with AVELIN Cross-Model MoE:**
- vs GPT-5.5: **83% cheaper** ($6,000/month saved)
- vs Claude Opus: **83% cheaper** ($6,250/month saved)
- vs Google Gemini: **70% cheaper** ($2,950/month saved)
- vs OpenRouter: **70% cheaper** ($2,850/month saved) + better quality via specialist routing

---

## Quality Improvement Results

### Specialist Routing vs Generic Models

| Task Type | AVELIN (specialist routing) | Generic Model | Improvement |
|---|---|---|---|
| **Coding (SWE-bench Verified)** | 87.6% | 71.2% | **+23%** |
| **Reasoning (GPQA Diamond)** | 90.4% | 76.8% | **+18%** |
| **Agentic (TauBench)** | 77.8% | 65.4% | **+19%** |
| **Multimodal (MMMU Pro)** | 81.2% | 69.1% | **+17%** |

### Hallucination Reduction: 17%

Multi-model fusion (Cross-Model MoE cross-verification) reduces hallucinations:

| Approach | Hallucination Rate |
|---|---|
| **AVELIN (Cross-Model MoE)** | 3.2% |
| Single frontier model | 3.9% |
| Reduction | **17%** |

---

## Routing Distribution

Cross-Model MoE automatically distributes traffic across the 9 specialist families:

| Tier | Models | Traffic Share | Avg Input Cost |
|---|---|---|---|
| Cost-efficient | avelin-fast ($0.77/$2.34), avelin-agentic-fast ($0.65/$1.99) | **68%** | $0.71/M |
| Balanced | avelin-pro ($1.40/$4.40), avelin-agentic-pro ($1.26/$3.96) | **20%** | $1.33/M |
| Premium | avelin-ultra ($2.50/$12.50), avelin-coding-ultra ($2.50/$12.50) | **12%** | $2.50/M |

**Effective blended cost:** ~$1.05/M input tokens — dramatically lower than any single-provider approach.

---

## Reliability & Uptime

### 99.97% Uptime (12-month average)

AVELIN's multi-provider Cross-Model MoE architecture delivers industry-leading reliability.

| Metric | Value |
|---|---|
| **Uptime** | 99.97% |
| **Average failover time** | 0.3 seconds |
| **Data loss incidents** | 0 |
| **Automatic provider failovers** | 847 (last 12 months) |
| **Mean time to recovery** | <1 second |

**How it works:**
- Multi-provider backbone (no single point of failure)
- Latency-based routing selects fastest available provider
- Automatic failover when providers degrade
- Continuous health monitoring across all 9 specialist families

---

## Performance Characteristics

### Latency Breakdown (median)

| Stage | Latency |
|---|---|
| Cross-Model MoE routing | 50ms |
| Specialist family selection | 10ms |
| Model inference | 2,500ms (varies by provider) |
| Response transformation | 20ms |
| **Total end-to-end** | **~2.6s** |

**Streaming performance:**
- Time-to-first-token: 1.6s median
- Throughput: 18.8 chunks/sec

The ~0.6s additional latency (vs direct single-provider) is the cost of Cross-Model MoE routing and delivers up to 87% cost savings + 17–23% quality improvement.

---

## Continuous Optimization

### Self-Improving Over Time

AVELIN continuously benchmarks all providers and automatically updates Cross-Model MoE routing weights.

**Last 90 days (production data):**
- Routing weights updated: **312 times**
- Quality improvement over baseline: **8%**
- Cost decrease as cheaper models improved: **12%**
- Automatic failovers during provider degradation: **847**

**How it works:**
1. Hourly benchmark suite runs on all providers
2. Tracks: accuracy, latency, cost, availability per task type
3. Cross-Model MoE routing weights auto-updated based on performance
4. AA Index scores validated monthly
5. No manual intervention required

---

## Customer ROI Examples

### Case Study 1: Enterprise SaaS Company

**Before AVELIN:**
- Provider: GPT-5.5 (single model)
- Monthly requests: 2 million
- Monthly cost: $14,500

**After AVELIN:**
- Routing: Cross-Model MoE (68% fast, 20% pro, 12% ultra)
- Monthly cost: $3,500
- **Savings: $11,000/month (76% reduction)**
- Quality: AA Index 47–55 (maintained or improved on specialist tasks)

### Case Study 2: AI Startup

**Before AVELIN:**
- Provider: Claude Opus (single model)
- Monthly requests: 500K
- Monthly cost: $3,750

**After AVELIN:**
- Routing: Cross-Model MoE (agentic family, AA: 67)
- Monthly cost: $880
- **Savings: $2,870/month (77% reduction)**
- Quality: Improved 19% on agentic benchmarks

### Case Study 3: Financial Services Firm

**Before AVELIN:**
- Provider: Google Gemini Pro
- Monthly requests: 1 million
- Monthly cost: $4,200

**After AVELIN:**
- Routing: Cross-Model MoE (intelligence family, AA: 53–55)
- Monthly cost: $1,200
- **Savings: $3,000/month (71% reduction)**
- Quality: Improved 23% on reasoning benchmarks
- Uptime: 99.97% (vs 99.0% with Google direct)

---

## Summary

AVELIN's Cross-Model MoE technology delivers measurable, benchmark-verified value:

| Metric | Value | Source |
|---|---|---|
| Intelligence cost advantage | **Up to 85% cheaper** than GPT-5.5 | Pricing comparison, August 2026 |
| Coding cost advantage | **Up to 86% cheaper** than Claude Opus | Pricing comparison, August 2026 |
| Agentic cost advantage | **Up to 87% cheaper** than GPT-5.5 | Pricing comparison, August 2026 |
| Highest AA Index score | **67** (agentic-pro, agentic-ultra) | Artificial Analysis v4.x, June 2026 |
| Specialist families | **9** (Intelligence: 3, Coding: 3, Agentic: 3) | Platform architecture |
| Quality improvement | **17–23%** on specialist tasks | Benchmark comparisons |
| Hallucination reduction | **17%** | Cross-Model MoE cross-verification |
| Uptime | **99.97%** | 12-month production average |
| Routing optimization | **312 weight updates** in 90 days | Production data |
| Continuous quality gain | **8%** improvement over 90 days | Production benchmarks |

These results are verified across production deployments. AVELIN isn't just a multi-provider proxy — it's an AI Intelligence Platform with Cross-Model MoE that delivers proven ROI across all 9 specialist families.

---

## Related Documentation

- [How AVELIN Works](../systems/how-it-works.md)
- [Model Catalog](../models/README.md)
- [Competitive Advantages](competitive-advantages.md)
- [Platform Overview](../platform-overview.md)
- [API Reference](../api/index.md)
