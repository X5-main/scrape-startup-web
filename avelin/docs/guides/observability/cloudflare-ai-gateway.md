# Cloudflare AI Gateway Integration

AVELIN API works with Cloudflare AI Gateway — Tools to monitor, control, and optimize your AI applications with caching, rate limiting, and analytics.

Cloudflare AI Gateway is an AI traffic management layer that sits between your application and your LLM providers. Its killer feature is edge-level caching, rate limiting, and analytics for AI requests — cache repeated queries at Cloudflare's global edge network and dramatically reduce your AI API costs. If ten users ask the same question, you pay for one LLM call, not ten. Built-in rate limiting protects against abuse and runaway costs.

Built for platform engineers and DevOps teams running AI at scale. Cloudflare AI Gateway gives you enterprise-grade traffic management — the same infrastructure that protects websites, now applied to AI workloads. Route AVELIN traffic through AI Gateway for caching, analytics, and cost control at the edge.

> **Why AVELIN + Cloudflare AI Gateway?** Monitor and optimize your AVELIN API usage with powerful observability tools — track costs, latency, and model performance in real-time.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install/Configure Cloudflare AI Gateway

Refer to the Cloudflare AI Gateway documentation for installation and setup instructions.

### Step 3: Point Cloudflare AI Gateway to AVELIN

Configure Cloudflare AI Gateway to monitor your AVELIN API calls:

```bash
# Example: Set AVELIN as the upstream provider
export OPENAI_API_BASE=https://api.avelin.ai/v1
export OPENAI_API_KEY=*** API Reference

| Endpoint | URL |
|---|---|
| **OpenAI-compatible** | `https://api.avelin.ai/v1` |
| **Anthropic-compatible** | `https://api.avelin.ai` |

---

## What to Monitor

| Metric | Why it matters |
|---|---|
| **Cost per request** | Track spending across models and identify cost optimization opportunities |
| **Latency (TTFT, total)** | Measure time-to-first-token and total response time |
| **Token usage** | Monitor input/output tokens to optimize prompts |
| **Error rates** | Track API failures and provider issues |
| **Model performance** | Compare quality across different AVELIN models |

---

## Why AVELIN for Cloudflare AI Gateway?

- **Rich metadata**: AVELIN provides detailed request/response data for analysis
- **Multi-model tracking**: Monitor all 9 AVELIN models from one dashboard
- **Cost visibility**: See exact token usage and costs per request
- **Automatic failover**: Cloudflare AI Gateway sees seamless provider switching

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **No data showing** | Verify Cloudflare AI Gateway is configured with correct AVELIN endpoint |
| **Missing metadata** | Check that request/response logging is enabled |
| **High latency in dashboard** | This may reflect Cloudflare AI Gateway's processing, not AVELIN's actual latency |
| **Cost discrepancies** | Verify token counting matches AVELIN's usage reporting |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [API Reference](../../api/index.md) — Full endpoint documentation
- [Model Catalog](../../models/README.md) — Full comparison
