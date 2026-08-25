# PostHog Integration

AVELIN API works with PostHog — Developer tools designed to help product engineers build successful products with AI-powered analytics.

PostHog is an open-source product analytics platform that has added AI-powered insights to its already comprehensive toolkit. Its killer feature is AI-generated product insights — PostHog doesn't just show you dashboards, it uses AI to surface patterns, anomalies, and actionable recommendations from your user behavior data. Ask "why did retention drop last week?" and PostHog's AI analyzes the data and gives you a hypothesis.

Built for product engineers, growth teams, and startup founders who want analytics without a dedicated data team. PostHog combines session recordings, feature flags, A/B testing, and funnels with AI that helps you understand what the data means. Use AVELIN as the AI backbone for PostHog's insight generation engine.

> **Why AVELIN + PostHog?** Monitor and optimize your AVELIN API usage with powerful observability tools — track costs, latency, and model performance in real-time.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install/Configure PostHog

Refer to the PostHog documentation for installation and setup instructions.

### Step 3: Point PostHog to AVELIN

Configure PostHog to monitor your AVELIN API calls:

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

## Why AVELIN for PostHog?

- **Rich metadata**: AVELIN provides detailed request/response data for analysis
- **Multi-model tracking**: Monitor all 9 AVELIN models from one dashboard
- **Cost visibility**: See exact token usage and costs per request
- **Automatic failover**: PostHog sees seamless provider switching

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **No data showing** | Verify PostHog is configured with correct AVELIN endpoint |
| **Missing metadata** | Check that request/response logging is enabled |
| **High latency in dashboard** | This may reflect PostHog's processing, not AVELIN's actual latency |
| **Cost discrepancies** | Verify token counting matches AVELIN's usage reporting |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [API Reference](../../api/index.md) — Full endpoint documentation
- [Model Catalog](../../models/README.md) — Full comparison
