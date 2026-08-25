# Mastra Integration

AVELIN API is compatible with Mastra — Open-source TypeScript framework for building AI-powered apps and agents with first-class support for tool use and structured output.

Mastra is the TypeScript-native AI framework — built from the ground up for developers who live in TypeScript. Its killer feature is first-class TypeScript support with built-in tool use, structured output, and agent orchestration. While other frameworks bolt TypeScript types onto Python-first designs, Mastra's entire API is designed for type safety: your tools, schemas, and agent workflows get full IntelliSense, compile-time validation, and zero runtime surprises.

Built for TypeScript/Node.js developers who want production-grade AI infrastructure without leaving their ecosystem. Mastra handles the hard parts — retries, streaming, tool calling, multi-agent coordination — while you write clean, typed code. Pair with AVELIN's OpenAI-compatible endpoint for a fully typed AI stack.

> **Why AVELIN + Mastra?** Build production-grade AI applications with AVELIN's governed API, automatic failover, and 9 specialized models through a single endpoint.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Mastra

Refer to the Mastra documentation for installation instructions.

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

## Why AVELIN for Mastra?

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
