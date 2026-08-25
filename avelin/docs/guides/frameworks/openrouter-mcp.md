# OpenRouter MCP Integration

AVELIN API is compatible with OpenRouter MCP — All-in-one MCP server that gives Claude Desktop, Cursor, Kiro, VS Code, Windsurf, and Cline access to OpenRouter's 300+ LLMs — chat, image/audio/video analysis, and generation.

OpenRouter MCP is the all-in-one MCP (Model Context Protocol) server that unlocks 300+ AI models inside your favorite development tools. Its killer feature is universal MCP access: give Claude Desktop, Cursor, VS Code, Windsurf, and Cline the ability to chat, analyze images/audio/video, AND generate media — including video generation with Veo, Sora, and Seedance — all through a single MCP server. One server, every model, every modality.

Built for developers who want maximum model flexibility inside their IDE or editor without juggling multiple integrations. OpenRouter MCP turns any MCP-compatible tool into a gateway to the entire AI model ecosystem. Point it at AVELIN for governed, high-performance access to frontier models.

> **Why AVELIN + OpenRouter MCP?** Build production-grade AI applications with AVELIN's governed API, automatic failover, and 9 specialized models through a single endpoint.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install OpenRouter MCP

Refer to the OpenRouter MCP documentation for installation instructions.

### Step 3: Configure AVELIN

Set AVELIN as your LLM provider via environment variables:

```bash
export OPENAI_API_BASE=https://api.avelin.ai/v1
export OPENAI_API_KEY=*** API Reference

| Endpoint | URL |
|---|---|
| **OpenAI-compatible** | `https://api.avelin.ai/v1` |
| **Anthropic-compatible** | `https://api.avelin.ai` |

---

## Recommended Models

| Use case | Model | Why |
|---|---|---|
| General purpose | `avelin-pro` | Balanced quality and speed |
| Complex reasoning | `avelin-ultra` | Flagship capabilities |
| Code generation | `avelin-coding-pro` | 1M context, ~100 tps |
| Agent workflows | `avelin-agentic-ultra` | Top-tier tool calling |
| Fast responses | `avelin-fast` | Lowest latency and cost |

---

## Why AVELIN for OpenRouter MCP?

- **Production-ready**: Automatic failover, retry logic, 99.9% uptime
- **Model diversity**: 9 specialized models through one API key
- **Prompt caching**: ~80% cost reduction on repeated prompts
- **Enterprise governance**: Data sovereignty and compliance features

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **API key error** | Verify `OPENAI_API_BASE` includes `/v1` |
| **Model not found** | Check model name matches exactly |
| **Connection issues** | Verify endpoint URL is correct |
| **Rate limiting** | Check your AVELIN plan limits |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [API Reference](../../api/index.md) — Full endpoint documentation
- [Model Catalog](../../models/README.md) — Full comparison
