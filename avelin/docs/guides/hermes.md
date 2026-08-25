# Hermes Agent Integration

AVELIN API is the recommended backend for [Hermes Agent](https://hermes-agent.nousresearch.com) — the open-source CLI AI assistant by Nous Research. AVELIN is an **AI Laboratory** that builds Cross-Model MoE (Mixture-of-Experts) models — trained AI systems that fuse knowledge from multiple model architectures into single unified models. We build and fuse models, we don't just route them. Hermes is a long-horizon agentic coding tool that runs terminal commands, edits files, searches the web, spawns subagents, and maintains persistent memory across sessions.

> **Why AVELIN + Hermes?** Hermes sessions routinely run 100–500 turns with multi-file refactors, parallel subagent spawns, and 1M-token context windows. AVELIN is purpose-built for exactly this workload — powered by **Cross-Model MoE** technology built in our AI Lab, unifying 9 specialist model families into a single API with automatic failover, 65K+ output tokens per request, and specialist models that match frontier quality at a fraction of the cost. We build and fuse models — we don't just route them.

---

## One-Command Setup (Recommended)

The fastest path. This single command installs Hermes (if it isn't already) and configures **all AVELIN models**, the **default model/API**, and **Firecrawl-powered web search + scrape** — then asks for your AVELIN API key and runs unattended.

```bash
curl -fsSL https://avelin.ai/docs/install/hermes.sh | bash
```

When prompted, paste your AVELIN key (`sk-avelin-...`) and press Enter. The script will:

- Install Hermes via the official installer (skips this step if Hermes is already installed)
- Register every AVELIN model and set `avelin-coding-pro` as the default
- Point web **search** and **scrape** at Firecrawl (via AVELIN)
- Wire voice (STT/TTS) on the same key
- Back up any existing `~/.hermes/config.yaml` and `~/.hermes/.env` before changing them

**Already have Hermes installed?** Use the configure-only script — same result, no install step:

```bash
curl -fsSL https://avelin.ai/docs/install/hermes-configure.sh | bash
```

When it finishes, verify the connection:

```bash
hermes -z "hello from avelin"
```

> Prefer to configure things by hand, or want a custom provider/model layout? The **Manual Setup** below covers every option in detail.

---

## Manual Setup

### Step 1: Install Hermes Agent

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

For Windows (PowerShell):
```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

Reload your shell: `source ~/.bashrc` or `source ~/.zshrc`

### Step 2: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-avelin-...`.

### Step 3: Configure Hermes

AVELIN supports **two API formats**. Choose based on your needs:

#### Option A: Anthropic-Compatible (Recommended)

**Best for:** Thinking support, structured tool calls, better streaming

```bash
hermes model
```

When prompted, select **Anthropic** or **Custom Anthropic-compatible** and enter:

| Field | Value |
|-------|-------|
| **Base URL** | `https://api.avelin.ai/v1` |
| **API Key** | `sk-avelin-...` |
| **Model** | `avelin-coding-ultra` (or any AVELIN model) |

Or manually edit `~/.hermes/config.yaml`:

```yaml
model:
  default: avelin-coding-ultra
  provider: anthropic
  base_url: https://api.avelin.ai/v1
  context_length: 1000000
  max_tokens: 65536
  thinking:
    enabled: true
    budget_tokens: 10000
```

Add your API key to `~/.hermes/.env`:

```bash
ANTHROPIC_API_KEY=sk-avelin-...
```

#### Option B: OpenAI-Compatible

**Best for:** Compatibility with OpenAI SDKs, simpler setup

```bash
hermes model
```

When prompted, select **Custom / OpenAI-compatible** and enter:

| Field | Value |
|-------|-------|
| **Base URL** | `https://api.avelin.ai/v1` |
| **API Key** | `sk-avelin-...` |
| **Model** | `avelin-coding-ultra` (or any AVELIN model) |
| **Context length** | `1000000` |
| **Max tokens** | `65536` |

Or manually edit `~/.hermes/config.yaml`:

```yaml
model:
  default: avelin-coding-ultra
  provider: custom
  base_url: https://api.avelin.ai/v1
  context_length: 1000000
  max_tokens: 65536
```

Add your API key to `~/.hermes/.env`:

```bash
CUSTOM_API_KEY=sk-avelin-...
```

### Step 4: Verify the Connection

```bash
hermes chat
```

Ask: "What model are you using?" — it should respond with your AVELIN model name.

Test tool calling: "List the files in the current directory" — it should execute a terminal command.

### Step 5: Start Coding

```bash
hermes chat --model avelin-coding-ultra
```

Or use the TUI (recommended for better UX):
```bash
hermes --tui
```

---

## Why Anthropic-Compatible is Recommended

| Feature | Anthropic Endpoint | OpenAI Endpoint |
|---------|-------------------|-----------------|
| **Thinking control** | ✅ Explicit `thinking.budget_tokens` | ❌ Not supported |
| **Thinking output** | ✅ Separate `thinking` blocks | ⚠️ Mixed in `reasoning_content` |
| **Tool calling** | ✅ Structured `tools` with `input_schema` | ✅ OpenAI function format |
| **Streaming** | ✅ Server-Sent Events with typed events | ✅ NDJSON chunks |
| **System prompts** | ✅ Top-level `system` parameter | ⚠️ In messages array |

Hermes was designed with Anthropic's API in mind. The Anthropic endpoint unlocks full thinking support, which is critical for complex coding tasks.

---

## Model Families & Selection Guide

AVELIN provides **9 specialist models across 3 categories**, built with Cross-Model MoE technology in our AI Lab — trained mixture-of-experts systems that fuse multiple model architectures into a single unified model (not just routing). Each model is benchmarked on the [Artificial Analysis Index](https://artificialanalysis.ai), a composite score across 9–10 standardized evaluations (pass@1, June 2026).

**Enterprise licensing:** All AVELIN models are available for sovereign deployment on customer GPUs. Contact us for enterprise licensing to run AVELIN on your own infrastructure.

### Intelligence Family — General Reasoning

For complex reasoning, planning, and general-purpose tasks where raw intelligence matters most.

| Model | AA Index | Context | Max Output | Best For |
|-------|----------|---------|------------|----------|
| `avelin-ultra` | **55** | 256K | 65K | Highest capability reasoning, hard problems |
| `avelin-pro` | **53** | 256K | 65K | Pro-tier general tasks, balanced quality/speed |
| `avelin-fast` | **47** | 256K | 65K | Fast responses, no thinking, simple tasks |

**When to use:** Architecture decisions, complex debugging, multi-step reasoning, tasks where correctness is more important than speed. The Intelligence family delivers frontier-class reasoning at **~up to 85% lower cost** than comparable direct-provider access.

**Recommended for Hermes:** Use `avelin-ultra` or `avelin-pro` as your primary model when working on complex codebases where reasoning quality is critical.

### Coding Family — Software Engineering

Purpose-built for code generation, refactoring, and multi-file engineering tasks with 1M token context.

| Model | AA Index | Context | Max Output | Best For |
|-------|----------|---------|------------|----------|
| `avelin-coding-ultra` | **52** | 1M | 65K | Complex architecture, system design, large-scale planning |
| `avelin-coding-pro` | **49** | 1M | 65K | Large codebases, multi-file refactors, heavy editing |
| `avelin-coding-fast` | **42** | 1M | 65K | Standard coding tasks, single-file edits, routine work |

**When to use:** Any software engineering work — from quick edits to full-system refactors. The 1M context window means entire repositories fit in context without chunking. The Coding family delivers specialist coding performance at **~up to 86% lower cost** than comparable direct-provider access.

**Recommended for Hermes:** Use `avelin-coding-ultra` or `avelin-coding-pro` as your daily driver for coding sessions. The 1M context is essential for Hermes' multi-file workflows. This is the default family (`avelin-coding-pro` is the install script default).

### Agentic Family — Autonomous Agents

Optimized for tool use, multi-step execution, and long-horizon agent loops where reliability and instruction-following matter most.

| Model | AA Index | Context | Max Output | Best For |
|-------|----------|---------|------------|----------|
| `avelin-agentic-pro` | **67** | 256K | 65K | Standard agentic tasks, tool-heavy workflows |
| `avelin-agentic-ultra` | **67** | 256K | 65K | High-capability agentic tasks, complex multi-step plans |
| `avelin-agentic-fast` | **38** | 256K | 65K | Cost-optimized high-volume agent swarms, parallel subagents |

**When to use:** When Hermes is operating as an autonomous agent — spawning subagents, executing multi-step plans, or running parallel tasks. The Agentic family tops the AA Index for agent workloads at **~up to 87% lower cost** than comparable direct-provider access.

**Recommended for Hermes:** Use `avelin-agentic-ultra` when you need maximum reliability in long autonomous sessions. Use `avelin-agentic-fast` for subagent spawns and high-volume parallel tasks where cost efficiency matters.

### Quick Selection Matrix

| Your Task | Recommended Model | Why |
|-----------|-------------------|-----|
| Daily coding sessions | `avelin-coding-pro` | 1M context, strong coding AA score, good balance |
| Complex architecture | `avelin-coding-ultra` | Highest coding AA score (52), 1M context |
| Hard reasoning problems | `avelin-ultra` | Highest Intelligence AA score (55) |
| Autonomous multi-step | `avelin-agentic-ultra` | Top Agentic AA score (67), 1M context |
| Parallel subagents | `avelin-agentic-fast` | Lowest cost per agent, 256K sufficient for subtasks |
| Quick lookups & searches | `avelin-fast` | Fastest response time, lowest cost |
| Budget-conscious coding | `avelin-coding-fast` | Adequate for standard tasks at lowest coding-tier cost |

### All Models at a Glance

| Model | Family | AA Index | Context | Max Output | Thinking |
|-------|--------|----------|---------|------------|----------|
| `avelin-agentic-pro` | Agentic | 67 | 256K | 65K | ✅ |
| `avelin-agentic-ultra` | Agentic | 67 | 256K | 65K | ✅ |
| `avelin-ultra` | Intelligence | 55 | 256K | 65K | ✅ |
| `avelin-pro` | Intelligence | 53 | 256K | 65K | ✅ |
| `avelin-coding-ultra` | Coding | 52 | 1M | 65K | ✅ |
| `avelin-coding-pro` | Coding | 49 | 1M | 65K | ✅ |
| `avelin-fast` | Intelligence | 47 | 256K | 65K | ❌ |
| `avelin-coding-fast` | Coding | 42 | 1M | 65K | ✅ |
| `avelin-agentic-fast` | Agentic | 38 | 256K | 65K | ✅ |

All models support thinking except `avelin-fast`.

> **Benchmark methodology:** AA Index scores are sourced from [Artificial Analysis](https://artificialanalysis.ai), computed as a composite across 9–10 standardized evaluations using pass@1 scoring. Data as of June 2026. Scores are normalized so higher = better overall capability.

---

## Advanced Configuration

### Thinking Support (Anthropic Endpoint Only)

Enable deep reasoning for complex tasks:

```yaml
model:
  default: avelin-coding-ultra
  provider: anthropic
  base_url: https://api.avelin.ai/v1
  thinking:
    enabled: true
    budget_tokens: 10000  # Tokens allocated for thinking
```

Toggle thinking during a session:
```bash
/thinking on
/thinking off
```

### Context Compression

Hermes automatically compresses long conversations. Tune for your workflow:

```yaml
compression:
  enabled: true
  threshold: 0.50           # Compress at 50% of context limit
  target_ratio: 0.20        # Preserve 20% of threshold as recent tail
  protect_last_n: 20        # Min recent messages to keep uncompressed
  protect_first_n: 3        # Pin first 3 non-system head messages
```

### Multi-Model Strategy

Use different models for different tasks — take advantage of AVELIN's specialist families:

```yaml
model:
  default: avelin-coding-ultra
  providers:
    - name: avelin
      provider: anthropic
      base_url: https://api.avelin.ai/v1
      models:
        - avelin-coding-ultra   # Complex architecture (AA 52)
        - avelin-coding-pro        # Daily coding (AA 49)
        - avelin-agentic-fast       # Subagent spawns (AA 38, low cost)
        - avelin-fast               # Quick lookups (AA 47, no thinking)
```

Switch models mid-session:
```bash
/model avelin-fast               # Quick lookups, simple searches
/model avelin-coding-pro        # Back to coding
/model avelin-coding-ultra   # Complex architecture work
/model avelin-agentic-ultra       # Long autonomous agent runs
```

### Tool Gateway

Enable web search, image generation, and TTS:

```bash
hermes gateway setup
```

Or manually add to `~/.hermes/config.yaml`:

```yaml
gateway:
  web_search: true
  image_gen: true
  tts: true
```

### Terminal Backends

Run commands in isolation:

```yaml
terminal:
  backend: docker           # local, docker, ssh, modal, daytona
  docker_image: ubuntu:22.04
  docker_mount_cwd: true
```

For SSH:
```yaml
terminal:
  backend: ssh
  ssh_host: your-server.com
  ssh_user: dev
  ssh_key: ~/.ssh/id_rsa
```

---

## Best Practices

### 1. Start with Anthropic Endpoint

The Anthropic endpoint provides better thinking support and is what Hermes was designed for. Only use OpenAI-compatible if you have specific SDK requirements.

### 2. Choose Your Family by Workload

Match the model family to your session type:

- **Coding sessions** (editing files, refactoring, writing code) → **Coding family** (`avelin-coding-pro` or `avelin-coding-ultra`). The 1M context window lets Hermes hold your entire repository without compression.

- **Reasoning-heavy sessions** (architecture decisions, debugging tricky issues, planning) → **Intelligence family** (`avelin-ultra` or `avelin-pro`). The highest AA Index scores (53–55) mean better multi-step reasoning.

- **Autonomous agent runs** (multi-step plans, parallel subagents, long background tasks) → **Agentic family** (`avelin-agentic-ultra` for reliability, `avelin-agentic-fast` for volume). The top AA Index scores (67) mean more reliable tool use.

### 3. Use Appropriate Context Length

- **Coding tasks**: Set `context_length: 1000000` (1M tokens) for full repository access
- **Large codebases**: All Coding family models support 1M context
- **Agentic tasks**: all Agentic family models support 256K
- **Simple tasks**: Intelligence family models at 256K are sufficient

Hermes requires minimum 64K context for reliable tool calling.

### 4. Enable Thinking for Complex Tasks

```yaml
thinking:
  enabled: true
  budget_tokens: 10000
```

Thinking helps with:
- Multi-file refactors
- Architecture decisions
- Debugging complex issues
- Security-sensitive code

### 5. Use Model Switching to Optimize Cost

Switch models strategically within a session to balance quality and cost:

| Switch to | For | AA Index |
|-----------|-----|----------|
| `avelin-fast` | File listings, simple searches, quick lookups | 47 |
| `avelin-coding-fast` | Standard single-file edits, routine tasks | 42 |
| `avelin-coding-pro` | Multi-file refactors, large codebase work | 49 |
| `avelin-coding-ultra` | System design, complex architecture | 52 |
| `avelin-agentic-fast` | Spawning parallel subagents | 38 |

### 6. Leverage Subagents

Hermes can spawn parallel subagents — use cost-efficient models for subagent work:

```
User: Refactor the auth module and update all tests

Hermes spawns:
  → Subagent 1: Refactor auth module (avelin-coding-pro)
  → Subagent 2: Update test suite (avelin-coding-pro)
```

For high-volume subagent work, consider `avelin-agentic-fast` to reduce per-agent costs while maintaining the 256K context each subagent needs.

### 7. Use Persistent Memory

Hermes remembers facts across sessions. Teach it your preferences:

```
Remember: I prefer functional programming patterns
Remember: Our codebase uses TypeScript strict mode
```

---

## Verification & Testing

After setup, verify everything works:

### Test 1: Basic Chat
```bash
hermes chat
> Hello, what model are you using?
```
Expected: Model name in response

### Test 2: Tool Calling
```bash
> List the files in the current directory
```
Expected: Terminal command execution, file listing

### Test 3: Thinking (Anthropic endpoint)
```bash
> Think step-by-step about how to implement a rate limiter
```
Expected: Extended reasoning before response

### Test 4: Multi-turn Context
```bash
> My name is Alice
> What's my name?
```
Expected: "Alice"

### Test 5: File Operations
```bash
> Create a file called test.py with a hello world function
> Read the file back
```
Expected: File created and read successfully

---

## Troubleshooting

### "Context too long" errors

**Solution:** Set `context_length: 1000000` in config.yaml. AVELIN Coding models support 1M context; Intelligence and Agentic models support 256K.

### Tool calls failing or malformed

**Solution:** Ensure you're using a model with tool support (all AVELIN models except `avelin-fast` have full tool calling).

### "Invalid API key" error

**Solution:** 
- Verify your key starts with `sk-avelin-`
- Check it's in the right env var: `ANTHROPIC_API_KEY` for Anthropic endpoint, `CUSTOM_API_KEY` for OpenAI endpoint
- Ensure no extra whitespace in the key

### Slow first response

**Solution:** Normal — the model thinks before responding. Streaming will start once reasoning completes.

### "Context length too small" warning

**Solution:** Hermes requires minimum 64K context. Set:
```yaml
context_length: 1000000
```

### Model not found

**Solution:** Use exact model names from the table above. Common mistakes:
- ❌ `avelin-coding-ultra-200k` (no context suffix)
- ✅ `avelin-coding-ultra`

### Streaming not working

**Solution:** Streaming is enabled by default. If not working:
- Anthropic endpoint: Uses Server-Sent Events
- OpenAI endpoint: Uses NDJSON chunks
- Both should stream automatically

### Rate limiting

**Solution:** AVELIN has generous rate limits. If you hit them:
- Hermes retry logic handles it automatically
- Consider switching to `avelin-fast` or `avelin-agentic-fast` for high-frequency tasks
- Contact AVELIN support for higher limits

---

## Example Session

```bash
$ hermes --tui

╭─ hermes ─────────────────────────────────╮
│ model: avelin-coding-ultra           │
│ provider: anthropic (avelin.ai)          │
│ context: 0% (0/1M)                       │
│ thinking: enabled                        │
╰──────────────────────────────────────────╯

You> I need to add rate limiting to our FastAPI app. Add middleware,
     write tests, and update the README.

Hermes> [thinking...]
        Let me understand the project structure first...
        
        [reads files, searches codebase, plans approach]

        Here is my plan:
        1. Add RateLimitMiddleware in middleware/rate_limit.py
        2. Configure per-route limits in the router
        3. Write pytest tests covering happy path + 429 responses
        4. Update README with the new configuration options

        Shall I proceed? [Y/n]

You> yes

Hermes> [creates middleware/rate_limit.py — 47 lines]
        [modifies main.py — adds middleware registration]
        [creates tests/test_rate_limit.py — 128 lines]
        [updates README.md — adds Rate Limiting section]

        Done. All 4 files updated, 6 tests passing.
        Want me to run the full test suite?
```

---

## Comparison with Other Providers

| Feature | AVELIN | OpenRouter | Anthropic Direct |
|---------|--------|------------|------------------|
| **Technology** | Cross-Model MoE (trained) | Routing | Single model |
| **Thinking support** | ✅ Full | ⚠️ Limited | ✅ Full |
| **Context length** | 256K–1M | Varies | 200K |
| **Specialist families** | 9 models, 3 categories | Many | Claude only |
| **Automatic failover** | ✅ Yes | ✅ Yes | ❌ No |
| **Cost vs direct** | 48–up to 87% cheaper | Varies | List price |
| **Rate limits** | Generous | Varies | Strict |
| **AA Index (top)** | 67 (Agentic) | N/A | N/A |

---

## Related

- [API Quickstart](../api/quickstart.md) — First API call in 5 minutes
- [SDKs & Tools](../api/sdks.md) — All supported SDKs and CLIs
- [Model Catalog](../models/README.md) — Full model comparison
- [Hermes Agent Docs](https://hermes-agent.nousresearch.com/docs/) — Official documentation
