# openrouter-rs Integration

AVELIN API is compatible with openrouter-rs — Community-maintained Rust SDK and companion CLI for OpenRouter-compatible APIs like AVELIN.

openrouter-rs is a community-maintained Rust SDK and companion CLI for any OpenRouter-compatible API. Its killer feature is zero-cost abstractions in Rust — you get type-safe AI integration with no runtime overhead, plus a CLI tool for quick experimentation from the terminal. Every request and response is strongly typed, every error is handled at compile time, and the companion CLI lets you test prompts and models without writing code.

Built for Rust developers who refuse to compromise on type safety and performance. If you're building AI-powered systems in Rust — game engines, embedded devices, high-throughput services — openrouter-rs gives you idiomatic, ergonomic access to AVELIN's full model catalog.

> **Why AVELIN + openrouter-rs?** Build production-grade AI applications with AVELIN's governed API, automatic failover, and 9 specialized models through a single endpoint.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install openrouter-rs

Refer to the openrouter-rs documentation for installation instructions.

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

## Why AVELIN for openrouter-rs?

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
