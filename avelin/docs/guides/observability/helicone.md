# Helicone Integration

AVELIN API works with Helicone — Observability and evaluation platform to supercharge inference. Monitor costs, latency, and model performance with your API key.

Helicone is an AI observability platform that gives you complete visibility into your LLM usage with a single line of code. Its killer feature is the drop-in proxy architecture — add Helicone as a proxy layer in front of your AI API calls, and it automatically logs every request and response with cost, latency, token usage, and error tracking. No SDK changes, no code rewrites. One configuration change and you have a full analytics dashboard.

Built for AI engineers and platform teams who need to control costs, debug failures, and optimize performance across multiple models. Helicone makes it trivial to answer "which model gives the best quality per dollar?" for your specific use case. Pair with AVELIN to monitor all 9 specialized models from a single pane of glass.

> **Why AVELIN + Helicone?** Monitor and optimize your AVELIN API usage with powerful observability tools — track costs, latency, and model performance in real-time.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install/Configure Helicone

Refer to the Helicone documentation for installation and setup instructions.

### Step 3: Point Helicone to AVELIN

Configure Helicone to monitor your AVELIN API calls:

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

## Why AVELIN for Helicone?

- **Rich metadata**: AVELIN provides detailed request/response data for analysis
- **Multi-model tracking**: Monitor all 9 AVELIN models from one dashboard
- **Cost visibility**: See exact token usage and costs per request
- **Automatic failover**: Helicone sees seamless provider switching

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **No data showing** | Verify Helicone is configured with correct AVELIN endpoint |
| **Missing metadata** | Check that request/response logging is enabled |
| **High latency in dashboard** | This may reflect Helicone's processing, not AVELIN's actual latency |
| **Cost discrepancies** | Verify token counting matches AVELIN's usage reporting |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [API Reference](../../api/index.md) — Full endpoint documentation
- [Model Catalog](../../models/README.md) — Full comparison
