# Goose Integration

AVELIN API works seamlessly with [Goose](https://block.github.io/goose/) — an open-source AI coding agent built by Block (formerly Square). Goose is an extensible, plugin-based agent that can use MCP tools, automate your browser, run terminal commands, and tackle multi-step coding tasks with deep reasoning — all powered by AVELIN's frontier models.

> **Why AVELIN + Goose?** Goose's extensible agent architecture thrives on reliable tool calling and large context windows. AVELIN delivers 1M-token context, ~100 tps throughput, 90% prompt caching discounts, and automatic failover — all through a single OpenAI-compatible endpoint.

---

## What is Goose?

Goose is Block's open-source AI coding agent designed for developers who want a flexible, extensible assistant that goes beyond simple code completion. Its killer feature is a plugin architecture — you can add custom capabilities via MCP (Model Context Protocol) tools, browser automation, terminal access, and more. Built and backed by a publicly traded company, Goose combines enterprise reliability with open-source flexibility.

Goose is ideal for developers who want an agent that can reason across multiple steps, interact with external systems, and be customized to their specific workflow. Whether you're automating repetitive tasks, building integrations, or debugging complex systems, Goose's extensibility lets you shape it to your needs.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Goose

```bash
# macOS / Linux
curl -fsSL https://github.com/block/goose/releases/download/stable/download.sh | bash

# Or via Homebrew
brew install block/tap/goose

# Verify installation
goose --version
```

### Step 3: Configure Goose

Run the interactive configuration wizard:

```bash
goose configure
```

When prompted:

| Field | Value |
|---|---|
| **Provider** | OpenAI Compatible |
| **Base URL** | `https://api.avelin.ai/v1` |
| **API Key** | `sk-ave...xxxx` |
| **Model** | `avelin-coding-pro` |

You can also configure directly via environment variables:

```bash
export GOOSE_PROVIDER=openai
export OPENAI_API_BASE=https://api.avelin.ai/v1
export OPENAI_API_KEY=sk-ave...xxxx
export GOOSE_MODEL=avelin-coding-pro
```

Add these to your `~/.bashrc` or `~/.zshrc` for persistence.

### Step 4: Start Goose

```bash
# Start an interactive session
goose run

# Or start with a specific task
goose run "Add error handling to all API endpoints in this project"
```

---

## Recommended Models

### Primary Recommendation: `avelin-coding-pro`

For Goose's agentic workflows:

| Feature | avelin-coding-pro | Why it matters for Goose |
|---|---|---|
| **Context window** | **1M tokens** | Goose accumulates context across tool calls, file reads, and terminal output |
| **Max output** | **65K tokens** | Large multi-step plans and comprehensive code changes |
| **Throughput** | **~100 tokens/sec** | 2× faster than standard tiers — tighter agent loops |
| **Reasoning** | Deep step-by-step thinking | Better multi-step planning and tool orchestration |
| **Tool calling** | First-class support | Goose relies on reliable structured tool calls for MCP, terminal, and browser |

### Alternative Models

| Model | When to use |
|---|---|
| `avelin-agentic-pro` | Purpose-built for agentic workflows — best for complex multi-step Goose tasks |
| `avelin-agentic-ultra` | Extended reasoning for difficult debugging sessions and architecture decisions |
| `avelin-coding-ultra` | System design, large-scale refactors, security reviews |
| `avelin-fast` | Quick lookups and simple tasks — lowest cost, fastest response |

---

## Why AVELIN for Goose?

### 1. **Reliable Tool Calling**

Goose fires many tool calls per task — MCP integrations, terminal commands, browser actions, file operations. AVELIN's coding models provide first-class function calling with reliable structured outputs, minimizing retries and malformed calls that break agent loops.

### 2. **Cost Optimization**

Goose's agentic loops can consume significant tokens across planning, tool execution, and verification steps. AVELIN optimizes costs:

- **Prompt caching**: ~80% cost reduction on repeated system prompts and plugin schemas
- **Competitive pricing**: Lower per-token costs than direct provider APIs
- **Pay-per-token**: No subscription lock-in — pay only for what you use

### 3. **1M Context Windows**

Goose sessions accumulate context quickly — every tool result, file read, and terminal output adds to the conversation. AVELIN's 1M-token context windows mean longer autonomous sessions without losing track of earlier steps.

### 4. **Automatic Failover**

- **Provider failover**: If one backend is slow or down, AVELIN switches to another
- **Retry logic**: Transient errors are handled automatically
- **99.9% uptime**: Enterprise-grade infrastructure — no interrupted agent sessions

---

## Example Workflow

```bash
$ goose run

Goose> I'm ready. What would you like me to help with?

You> Set up a CI/CD pipeline with GitHub Actions for this Node.js project.
     Include linting, testing, and deployment to AWS.

Goose: Let me analyze your project structure first.

[Uses terminal: ls -la, cat package.json, cat tsconfig.json]

I can see this is a Node.js/TypeScript project with Jest tests.
Here's my plan:
1. Create .github/workflows/ci.yml with lint + test jobs
2. Create .github/workflows/deploy.yml with deployment to AWS
3. Add required secrets documentation in DEPLOYMENT.md

Let me build these out...

[Creates .github/workflows/ci.yml]
[Creates .github/workflows/deploy.yml]
[Creates DEPLOYMENT.md]
[Runs: npm run lint — passes]
[Runs: npm test — 42 tests pass]

Done! I've set up:
- CI pipeline: lint → test → build on every PR
- Deploy pipeline: triggered on main branch merge
- Deployment guide with required GitHub secrets

Want me to add anything else?
```

---

## Enabling Extensions

Goose's power comes from its plugin system. Enable built-in extensions to expand what Goose can do:

```bash
# Enable browser automation
goose extension enable browser

# Enable MCP tools
goose extension enable mcp

# List available extensions
goose extension list
```

Combine Goose extensions with AVELIN's reliable tool calling for powerful automated workflows.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **"Provider not supported"** | Ensure you selected "OpenAI Compatible" as the provider type during `goose configure` |
| **"Model not found"** | Verify the model name is exactly `avelin-coding-pro` (no prefix needed) |
| **"API key invalid"** | Check that your key starts with `sk-ave` and the base URL is `https://api.avelin.ai/v1` |
| **Tool calls failing** | Use `avelin-coding-pro` or `avelin-agentic-pro` — these have first-class function calling |
| **Slow agent loops** | Try `avelin-agentic-fast` for quicker iteration cycles on simple tasks |
| **Context overflow** | Start a new Goose session or use `goose compact` to summarize history |
| **MCP extension errors** | Ensure your MCP server is running and accessible; check `goose extension list` |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Hermes Agent Guide](../hermes.md) — Terminal-based agentic coding tool
- [Claude Code Guide](claude-code.md) — Anthropic's CLI coding tool
- [Cursor Guide](cursor.md) — AI-first code editor
- [Cline Guide](cline.md) — Autonomous VS Code agent
- [Model Catalog](../../models/README.md) — Full model comparison
- [Goose Docs](https://block.github.io/goose/) — Official Goose documentation
