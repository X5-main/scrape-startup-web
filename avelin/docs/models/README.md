# AVELIN Model Catalog

AVELIN is an **AI Laboratory** that builds **Cross-Model MoE** — a trained Mixture-of-Experts meta-model architecture with difficulty-based cascading that fuses open-weight models into **9 specialist families across 3 categories**: Intelligence, Coding, and Agentic.

This is not routing or pass-through. Cross-Model MoE is a **trained meta-model, not a router** — with learned gating and specialist weighting that synthesizes intelligence exceeding any single model. A prompt-vector classifier (trained on 1 year of production data, 90% accuracy) applies **difficulty-based cascading** and **cost-aware routing** across specialist layers. Routers pick one model via if/else rules. We cascade across trained experts and synthesize. New models are integrated within **48 hours** of release, ensuring the platform is continuously self-improving.

All models are available via **enterprise licensing** (deploy on your GPUs, $8K–$18K/GPU/year) or **cloud API** (usage-based, $0.65–$12.50 per 1M tokens). See the [API Reference](../api/reference.md) to start calling them.

Every family follows the same three-tier naming: **fast** (cost-efficient), **pro** (balanced), **ultra** (premium). Five models carried older names before this scheme — see [Legacy Model Names](#legacy-model-names) below; the old names keep working.

**New to AVELIN models?** Start with the [Model Families Overview](families.md) for detailed descriptions of each family's capabilities and use cases.

---

## Intelligence Family

**Frontier reasoning and multimodal intelligence — up to 85% cheaper than GPT-5.5.**

The Intelligence family delivers deep reasoning, strategic analysis, and multimodal understanding for the most demanding enterprise workloads. All models feature **256K token context windows** — enough to process entire documents, codebases, or conversation histories in a single request — and **native vision support**.

| Model | AA Index | Best For | Context Window | Max Output | Input/Output $/M |
|-------|----------|----------|----------------|------------|-------------------|
| [**avelin-ultra**](avelin-ultra.md) | **55** | Deep research, strategic analysis, complex decisions | **256K** | 65K | $2.50 / $12.50 |
| [**avelin-pro**](avelin-pro.md) | **53** | Daily workflows, multimodal tasks, production economics | **256K** | 65K | $1.40 / $4.40 |
| [**avelin-fast**](avelin-fast.md) | **47** | Real-time chat, classification, high-volume workloads | **256K** | 65K | $0.77 / $2.34 |

**Benchmark highlights:**
- avelin-ultra: 87.6% SWE-bench Verified, 94% computer-use automation
- avelin-pro: 90.4% GPQA Diamond, 81.2% MMMU Pro, 3x faster than premium
- avelin-fast: #1 LMArena (1483 Elo), 50% hallucination reduction

**Why 256K context transforms workflows:** Analyze entire legal contracts, process full research papers, or maintain context across days of conversation — all without chunking or summarization. This is intelligence that sees the complete picture.

---

## Coding Family

**Enterprise coding agents — up to 86% cheaper than Claude Opus.**

The Coding family is purpose-built for real software engineering work. All coding models feature **1M token context windows** — load entire repositories and understand cross-file dependencies without fragmentation.

| Model | AA Index | Best For | Context Window | Max Output | Input/Output $/M |
|-------|----------|----------|----------------|------------|-------------------|
| [**avelin-coding-ultra**](avelin-coding-ultra.md) | **52** | System design, security review, complex refactors | **1M** | 65K | $2.50 / $12.50 |
| [**avelin-coding-pro**](avelin-coding-pro.md) | **49** | Production workloads, CI/CD | **1M** | 65K | $1.40 / $4.40 |
| [**avelin-coding-fast**](avelin-coding-fast.md) | **42** | Daily coding workflows, debugging | **1M** | 65K | $0.77 / $2.34 |

**Benchmark highlights:**
- avelin-coding-ultra: 58.4% SWE-bench Pro, Top 1% Coding Index
- avelin-coding-pro: ~100 tokens/sec, Top 4% across all indices
- avelin-coding-fast: 56.22% SWE-Pro, 97% skill adherence across 40 complex skills

**The 1M context advantage:** This isn't just a large context window — it's whole-repository intelligence. Load your entire codebase, trace execution paths across modules, understand cross-file dependencies, and refactor with complete awareness. No more "I can only see 5 files at a time" limitations.

---

## Agentic Family

**Purpose-built for autonomous agents — up to 87% cheaper than GPT-5.5.**

The Agentic family is optimized for long-horizon agentic loops, tool calling, and parallel orchestration. All agentic models feature **256K token context windows** — enough for agents to maintain coherent state across hundreds of steps without losing track of goals, at economics tuned for many calls per workflow.

| Model | AA Index | Best For | Context Window | Max Output | Input/Output $/M |
|-------|----------|----------|----------------|------------|-------------------|
| [**avelin-agentic-ultra**](avelin-agentic-ultra.md) | **67** | Complex multi-step planning, security workflows | **256K** | 65K | $2.38 / $11.88 |
| [**avelin-agentic-pro**](avelin-agentic-pro.md) | **67** | Tool-calling agents, regulated industries | **256K** | 65K | $1.26 / $3.96 |
| [**avelin-agentic-fast**](avelin-agentic-fast.md) | **38** | High-volume agent swarms, bulk operations | **256K** | 65K | $0.65 / $1.99 |

**Benchmark highlights:**
- avelin-agentic-ultra: 77.8% SWE-bench Verified, 94.6% of frontier performance
- avelin-agentic-pro: Intelligence Index 58, matches/beats frontier on multiple benchmarks
- avelin-agentic-fast: The lowest-priced model on the platform. Optimized for high-volume workloads where per-token cost matters more than peak reasoning depth.

**Why context size matters for agents:** Autonomous workflows require sustained reasoning across hundreds of tool calls, API interactions, and decision points. With 256K context, your agents can maintain coherent state, remember complex goals, and execute multi-step plans without fragmentation or context loss.

---

## Legacy Model Names

Five models were renamed when the lineup adopted the uniform fast/pro/ultra scheme. The old names keep working indefinitely as server-side aliases — no client change required, billing follows the canonical tier. New integrations should use the canonical names.

| Legacy name | Canonical name |
|-------------|----------------|
| `avelin-coding` | [`avelin-coding-fast`](avelin-coding-fast.md) |
| `avelin-coding-plus` | [`avelin-coding-pro`](avelin-coding-pro.md) |
| `avelin-coding-architect` | [`avelin-coding-ultra`](avelin-coding-ultra.md) |
| `avelin-agentic` | [`avelin-agentic-pro`](avelin-agentic-pro.md) |
| `avelin-agentic-high` | [`avelin-agentic-ultra`](avelin-agentic-ultra.md) |

---

## Utility Models

Specialized models for specific tasks beyond conversational AI.

| Model | Type | Use Case |
|-------|------|----------|
| **bge-m3** | Embeddings | Semantic search, RAG, clustering |
| **whisper-large-v3** | Transcription | Maximum accuracy, batch processing |
| **whisper-large-v3-turbo** | Transcription | Real-time, high volume |
| **avelin-stt** | Transcription | Streaming-friendly speech-to-text |
| **tts-1** | Text-to-Speech | Low latency, cost-efficient voice |
| **tts-1-hd** | Text-to-Speech | Highest audio quality |
| **avelin-imagegen** | Image generation | Quick iterations, prototypes |
| **avelin-imagegen-pro** | Image generation | Production assets, high quality |

See [Utility Models](utility-models.md) for detailed API documentation.

---

## Quick Selection Guide

| Use Case | Recommended Model | Alternative |
|----------|-------------------|-------------|
| **Strategic analysis, executive decisions** | avelin-ultra | avelin-pro |
| **Daily business workflows** | avelin-pro | avelin-fast |
| **High-volume chat, classification** | avelin-fast | avelin-pro |
| **Software development** | avelin-coding-fast | avelin-coding-pro |
| **High-throughput coding pipelines** | avelin-coding-pro | avelin-coding-fast |
| **System architecture, security review** | avelin-coding-ultra | avelin-coding-pro |
| **Tool-calling agents** | avelin-agentic-pro | avelin-agentic-fast |
| **Complex agentic workflows** | avelin-agentic-ultra | avelin-agentic-pro |
| **High-volume agent swarms** | avelin-agentic-fast | avelin-agentic-pro |
| **Semantic search, RAG** | bge-m3 | — |
| **Audio transcription** | whisper-large-v3-turbo | whisper-large-v3 |
| **Text-to-speech** | tts-1 | tts-1-hd |
| **Image generation** | avelin-imagegen | avelin-imagegen-pro |

---

## Model Selection Strategy

For the best balance of quality, speed, and cost:

1. **Start with cost-efficient tiers** — Use `avelin-fast`, `avelin-agentic-fast`, or `avelin-coding-fast` for routine work
2. **Escalate when needed** — Use `avelin-ultra`, `avelin-coding-ultra`, or `avelin-agentic-ultra` for complex, high-stakes tasks
3. **Use specialized families** — Coding models for software engineering, agentic models for tool-calling workflows
4. **Leverage Cross-Model MoE** — AVELIN's trained meta-model automatically selects the optimal specialist pathway for your request

### Cost Optimization

- **68% of requests** can be handled by cost-efficient tiers (fast models)
- **20% of requests** benefit from balanced tiers (pro models)
- **12% of requests** require premium tiers (ultra models)

This difficulty-based cascading delivers **42% cost reduction** vs always-premium routing while maintaining quality. Combined with our Cross-Model MoE pricing advantage (up to 87% cheaper than frontier), enterprises see dramatic savings from day one — whether deployed via cloud API or on their own GPUs under enterprise license.

---

## Model Capabilities Matrix

| Model | Context | Max Output | Reasoning | Vision | Function Calling | Streaming | System Messages | Prompt Caching |
|-------|---------|------------|-----------|--------|------------------|-----------|-----------------|----------------|
| avelin-ultra | **256K** | 65K | ✅ Full | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| avelin-pro | **256K** | 65K | ✅ Full | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| avelin-fast | **256K** | 65K | ⚠️ Limited | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| avelin-coding-fast | **1M** | 65K | ✅ Full | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| avelin-coding-pro | **1M** | 65K | ✅ Full | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| avelin-coding-ultra | **1M** | 65K | ✅ Full | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| avelin-agentic-fast | **256K** | 65K | ✅ Full | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| avelin-agentic-pro | **256K** | 65K | ✅ Full | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| avelin-agentic-ultra | **256K** | 65K | ✅ Full | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

**Prompt Caching:** Cuts input costs by roughly 80% on cache hits (cache write is 1.25× input; cache read is ~5x cheaper than fresh input). Supported on models with ✅ Yes. See [Pricing](../pricing.md) for per-tier cache rates.

**Context Window Guide:**
- **1M tokens:** Whole-repository intelligence — load entire codebases, process massive documents, maintain state across 100+ step agent workflows
- **256K tokens:** Extended context — analyze full research papers, legal contracts, or days of conversation history

---

## Benchmark Methodology

All AA Index scores are sourced from the **Artificial Analysis Intelligence, Coding, and Agentic Indices** (0–100 scale). These are third-party, independently evaluated benchmarks — not self-graded.

- **Composite of 9–10 independent evaluations**, pass@1 averaged
- **AA Index v4.x**, June 2026
- Scores reflect real-world task performance across reasoning, coding, and agentic capabilities

Cost comparisons are measured against equivalent frontier-tier offerings (GPT-5.5 for Intelligence and Agentic, Claude Opus for Coding) at comparable quality levels.

---

## Pricing

See [Pricing](../pricing.md) for complete pricing information including enterprise licensing, cloud API rates, cost optimization strategies, and billing details.

---

## Related Documentation

- [Pricing](../pricing.md) - Complete pricing and billing information
- [Model Families Overview](families.md) - Detailed family descriptions
- [API Reference](../api/reference.md) - Complete API documentation
- [API Quickstart](../api/quickstart.md) - Get started in 5 minutes
- [How AVELIN Works](../systems/how-it-works.md) - Technical architecture
- [Benchmark Results](../benefits/benchmark-results.md) - Performance data
- [AVELIN-API Platform](../systems/avelin-api.md) - Platform overview
