# AVELIN Model Families

AVELIN is an **AI Laboratory** that builds and trains **Cross-Model MoE** — a proprietary Mixture-of-Experts meta-model architecture with difficulty-based cascading. We fuse open-weight models into **9 specialist families across 3 categories**, producing trained intelligence that exceeds any single model:

| Category | Families | Cost Advantage |
|----------|----------|----------------|
| **Intelligence** | fast, pro, ultra | up to 85% cheaper than GPT-5.5 |
| **Coding** | coding-fast, coding-pro, coding-ultra | up to 86% cheaper than Claude Opus |
| **Agentic** | agentic-fast, agentic-pro, agentic-ultra | up to 87% cheaper than GPT-5.5 |

Cross-Model MoE is not routing or pass-through — it is a **trained meta-model, not a router**. A prompt-vector classifier (trained on 1 year of production data, 90% accuracy) classifies each request and applies **difficulty-based cascading** and **cost-aware routing** across specialist layers. Routers pick one model via if/else rules. We cascade across trained experts and synthesize. The platform is continuously self-improving: new models are evaluated and integrated within **48 hours** of release.

Our models are available via **enterprise licensing** (sovereign deployment on your GPUs, $8K–$18K/GPU/year) or **cloud API** (usage-based, $0.65–$12.50 per 1M tokens).

> **Renamed models:** `avelin-coding`, `avelin-coding-plus`, `avelin-coding-architect`, `avelin-agentic`, and `avelin-agentic-high` are legacy names for `avelin-coding-fast`, `avelin-coding-pro`, `avelin-coding-ultra`, `avelin-agentic-pro`, and `avelin-agentic-ultra`. The old names keep working as server-side aliases. See the [Model Catalog](README.md#legacy-model-names).

---

## Intelligence Family

**Frontier reasoning and multimodal intelligence — up to 85% cheaper than GPT-5.5.**

The Intelligence family is built for analysis, strategy, knowledge work, research synthesis, and customer-facing assistants where answer quality, reasoning depth, and multimodal understanding come first. Through Cross-Model MoE, these models deliver frontier-tier intelligence under a single API with difficulty-based cascading for resilience and SLA-grade uptime.

### Models in this family

| Model | AA Index | Positioning | Context Window | Max Output | Input/Output $/M |
|-------|----------|-------------|----------------|------------|-------------------|
| [avelin-ultra](avelin-ultra.md) | **55** | Flagship reasoning | **256K tokens** | 65K | $2.50 / $12.50 |
| [avelin-pro](avelin-pro.md) | **53** | High-efficiency reasoning | **256K tokens** | 65K | $1.40 / $4.40 |
| [avelin-fast](avelin-fast.md) | **47** | Low-latency, high-throughput | **256K tokens** | 65K | $0.77 / $2.34 |

**Why 256K context matters:** Process entire codebases, lengthy documents, or extended conversations in a single request. No chunking, no context loss, no compromises.

### Key Capabilities

- **Deep multi-step reasoning** for complex problem solving
- **Multimodal understanding** (text, images, charts, documents)
- **Vision support on all three tiers** for image analysis and document understanding
- **System messages** for custom behavior and context
- **Function calling** for structured outputs and tool integration
- **Streaming** for real-time applications

### When to use the Intelligence family

- Strategic planning and executive decision support
- Complex document analysis and synthesis
- Customer-facing assistants requiring high quality
- Research and knowledge work
- Multimodal tasks involving images, charts, or documents
- Tasks where accuracy and reasoning depth are critical

### Pricing

See [Pricing](../pricing.md) for complete pricing information including enterprise licensing and cloud API rates.

---

## Coding Family

**Enterprise coding agents — up to 86% cheaper than Claude Opus.**

The Coding family is purpose-built for software development workflows — from live debugging and root-cause analysis to multi-file refactors and whole-system design. These models are optimized specifically for software engineering benchmarks, with thinking and tool-use always enabled. They're built for IDE plugins, autonomous coding agents, code-review pipelines, and engineering productivity platforms.

### Models in this family

| Model | AA Index | Positioning | Context Window | Max Output | Throughput | Input/Output $/M |
|-------|----------|-------------|----------------|------------|------------|-------------------|
| [avelin-coding-fast](avelin-coding-fast.md) | **42** | Balanced engineering | **1M tokens** | 65K | ~50 tps | $0.77 / $2.34 |
| [avelin-coding-pro](avelin-coding-pro.md) | **49** | High-throughput | **1M tokens** | 65K | ~100 tps | $1.40 / $4.40 |
| [avelin-coding-ultra](avelin-coding-ultra.md) | **52** | Deep architecture | **1M tokens** | 65K | ~50 tps | $2.50 / $12.50 |

**Why 1M context is a game-changer:** Load entire repositories into context. Understand cross-file dependencies, trace execution paths across modules, and refactor with complete codebase awareness. This isn't just a large context window — it's whole-repository intelligence.

### Key Capabilities

- **Whole-repository understanding** with 1M-token context windows
- **Multi-file refactoring** with cross-cutting impact analysis
- **Live debugging** and root-cause analysis
- **Code generation** across multiple languages and frameworks
- **Test generation** and code review
- **Security analysis** and vulnerability detection
- **Architecture design** and system planning
- **Tool use** for IDE integration and automation

### When to use the Coding family

- Software development and engineering tasks
- Code generation, refactoring, and optimization
- Bug fixing and debugging
- Code review and security analysis
- System architecture and design decisions
- IDE plugin development
- Autonomous coding agents
- CI/CD pipeline integration

### Benchmark Highlights

- **avelin-coding-ultra**: 58.4% on SWE-bench Pro (ahead of every major US flagship at release)
- **avelin-coding-fast**: 56.22% on SWE-Pro, 97% skill adherence across 40 complex skills
- **avelin-coding-pro**: ~100 tokens/sec throughput, Top 4% across all indices

### Pricing

See [Pricing](../pricing.md) for complete pricing information including enterprise licensing and cloud API rates.

---

## Agentic Family

**Purpose-built for autonomous agents — up to 87% cheaper than GPT-5.5.**

The Agentic family is optimized for cost-effective agent workflows that fire thousands of model calls per workflow. Through Cross-Model MoE, these models maintain frontier reasoning quality while keeping per-step economics low, making them ideal for agent teams, research pipelines, RAG systems, and orchestration layers. They support on-prem deployment for data sovereignty and air-gapped environments.

### Models in this family

| Model | AA Index | Positioning | Context Window | Max Output | Input/Output $/M |
|-------|----------|-------------|----------------|------------|-------------------|
| [avelin-agentic-pro](avelin-agentic-pro.md) | **67** | Standard workhorse | **256K tokens** | 65K | $1.26 / $3.96 |
| [avelin-agentic-ultra](avelin-agentic-ultra.md) | **67** | Top-tier agentic | **256K tokens** | 65K | $2.38 / $11.88 |
| [avelin-agentic-fast](avelin-agentic-fast.md) | **38** | Cost-optimized | **256K tokens** | 65K | $0.65 / $1.99 |

**The agentic advantage:** Purpose-built for autonomous workflows that think, plan, and execute across hundreds of steps. With 256K context, your agents can maintain coherent state across complex, long-running tasks without losing track of goals or context.

### Key Capabilities

- **Long-horizon planning** across multiple steps and tools
- **Reliable tool calling** with structured outputs
- **Parallel task orchestration** for agent swarms
- **Configurable reasoning effort** for cost optimization
- **On-prem deployment** for regulated industries
- **High throughput** for volume workloads

### When to use the Agentic family

- Autonomous and semi-autonomous agents
- Multi-tool workflows requiring planning and execution
- Research pipelines with iterative refinement
- RAG systems with retrieval and synthesis
- Orchestration layers managing multiple agents
- High-volume classification and extraction
- Regulated industries requiring data sovereignty
- Cost-sensitive agent backends

### Benchmark Highlights

- **avelin-agentic-ultra**: 77.8% on SWE-bench Verified, 94.6% of frontier-flagship performance
- **avelin-agentic-pro**: Intelligence Index 58 (Artificial Analysis), matches/beats frontier on Codeforces, MMLU, HLE
- **avelin-agentic-fast**: The lowest-priced model on the platform. Optimized for high-volume workloads where per-token cost matters more than peak reasoning depth.

### Pricing

See [Pricing](../pricing.md) for complete pricing information including enterprise licensing and cloud API rates.

---

## Utility Models

Specialized models for specific tasks beyond conversational AI.

### Embeddings

**bge-m3** - Multilingual embedding model optimized for retrieval tasks.

- **Dimensions**: 1024
- **Max tokens**: 8,192
- **Languages**: 100+ languages supported
- **Use cases**: Semantic search, clustering, RAG, similarity matching

See [Pricing](../pricing.md) for current pricing.

**Example:**
```bash
curl https://api.avelin.ai/v1/embeddings \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -d '{
    "model": "bge-m3",
    "input": "AVELIN is a sovereign AI platform."
  }'
```

### Transcription

**whisper-large-v3**, **whisper-large-v3-turbo**, and **avelin-stt** - Speech-to-text models.

| Model | Speed | Accuracy | Use Case |
|-------|-------|----------|----------|
| whisper-large-v3 | Standard | Highest | Maximum accuracy, batch processing |
| whisper-large-v3-turbo | Fast | High | Real-time transcription, high volume |
| avelin-stt | Fast | High | Streaming-friendly speech-to-text |

- **Languages**: 100+ languages with automatic detection
- **Formats**: mp3, mp4, mpeg, mpga, m4a, wav, webm (max 25MB)

See [Pricing](../pricing.md) for current pricing.

**Example:**
```bash
curl https://api.avelin.ai/v1/audio/transcriptions \
  -H "Authorization: Bearer *** \
  -F model="whisper-large-v3-turbo" \
  -F file="@meeting.mp3"
```

### Text-to-Speech

**tts-1** and **tts-1-hd** - Voice synthesis with OpenAI-compatible model and voice names.

| Model | Latency | Quality | Use Case |
|-------|---------|---------|----------|
| tts-1 | Low | Standard | Real-time voice, cost-efficient narration |
| tts-1-hd | Standard | Highest | Production voice assets |

- **Voices**: OpenAI-compatible voice names (alloy, onyx, ...)
- **Formats**: mp3, opus, pcm

See [Pricing](../pricing.md) for current pricing.

**Example:**
```bash
curl https://api.avelin.ai/v1/audio/speech \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-1",
    "voice": "alloy",
    "input": "Welcome to AVELIN."
  }' --output speech.mp3
```

### Image Generation

**avelin-imagegen** and **avelin-imagegen-pro** - Text-to-image models.

| Model | Quality | Speed | Use Case |
|-------|---------|-------|----------|
| avelin-imagegen | Standard | Fast | Quick iterations, prototypes |
| avelin-imagegen-pro | High | Standard | Production assets, high quality |

See [Pricing](../pricing.md) for current pricing.

- **Sizes**: 256x256, 512x512, 1024x1024, 1024x1792, 1792x1024
- **Styles**: Vivid, natural
- **Quality**: Standard, HD (pro only)

**Example:**
```bash
curl https://api.avelin.ai/v1/images/generations \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -d '{
    "model": "avelin-imagegen",
    "prompt": "A minimalist logo for a sovereign AI platform"
  }'
```

---

## Choosing the Right Model

### By Use Case

| Use Case | Recommended Model | Alternative |
|----------|-------------------|-------------|
| Strategic analysis, executive decisions | avelin-ultra | avelin-pro |
| Daily business workflows | avelin-pro | avelin-fast |
| High-volume chat, classification | avelin-fast | avelin-pro |
| Software development | avelin-coding-fast | avelin-coding-pro |
| High-throughput coding pipelines | avelin-coding-pro | avelin-coding-fast |
| System architecture, security review | avelin-coding-ultra | avelin-coding-pro |
| Tool-calling agents | avelin-agentic-pro | avelin-agentic-fast |
| Complex agentic workflows | avelin-agentic-ultra | avelin-agentic-pro |
| High-volume agent swarms | avelin-agentic-fast | avelin-agentic-pro |
| Semantic search, RAG | bge-m3 | — |
| Audio transcription | whisper-large-v3-turbo | whisper-large-v3 |
| Text-to-speech | tts-1 | tts-1-hd |
| Image generation | avelin-imagegen | avelin-imagegen-pro |

### By Priority

**Quality first:** avelin-ultra, avelin-coding-ultra, avelin-agentic-ultra

**Cost first:** avelin-fast, avelin-agentic-fast, avelin-coding-fast

**Speed first:** avelin-fast, avelin-coding-pro, avelin-agentic-fast

**Balanced:** avelin-pro, avelin-coding-pro, avelin-agentic-pro

---

## Model Capabilities Matrix

| Model | Reasoning | Vision | Function Calling | Streaming | System Messages | Prompt Caching |
|-------|-----------|--------|------------------|-----------|-----------------|----------------|
| avelin-ultra | ✅ Full | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| avelin-pro | ✅ Full | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| avelin-fast | ⚠️ Limited | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| avelin-coding-fast | ✅ Full | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| avelin-coding-pro | ✅ Full | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| avelin-coding-ultra | ✅ Full | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| avelin-agentic-fast | ✅ Full | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| avelin-agentic-pro | ✅ Full | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| avelin-agentic-ultra | ✅ Full | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

---

## Benchmark Methodology

All AA Index scores are sourced from the **Artificial Analysis Intelligence, Coding, and Agentic Indices** (0–100 scale). These are **third-party, independently evaluated benchmarks** — not self-graded.

- **Composite of 9–10 independent evaluations**, pass@1 averaged
- **AA Index v4.x**, June 2026
- Scores reflect real-world task performance across reasoning, coding, and agentic capabilities

Cost comparisons are measured against equivalent frontier-tier offerings (GPT-5.5 for Intelligence and Agentic categories, Claude Opus for Coding) at comparable quality levels. AVELIN's Cross-Model MoE architecture enables these savings by training specialist layers that synthesize the strengths of multiple models rather than relying on a single expensive frontier model for all tasks.

---

## Related Documentation

- [Pricing](../pricing.md) - Complete pricing and billing information
- [API Reference](../api/reference.md) - Complete API documentation
- [Quickstart](../api/quickstart.md) - Get started in 5 minutes
- [How AVELIN Works](../systems/how-it-works.md) - Technical architecture
- [Benchmark Results](../benefits/benchmark-results.md) - Performance data
