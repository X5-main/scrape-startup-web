# analystOS Integration

AVELIN API works with analystOS — Web UI for AI-powered research with optional Notion automation. Features RAG, URL scraping, and 50+ model support.

analystOS is a web-based research platform purpose-built for deep, AI-assisted investigation. Its killer feature is the combination of RAG (Retrieval-Augmented Generation), automatic URL scraping, and optional Notion automation in one interface — feed it sources, and it builds a knowledge base you can query with natural language. With 50+ model support, you can pick the right model for extraction, summarization, or synthesis depending on the task.

Designed for researchers, analysts, journalists, and anyone who needs to synthesize information from many sources. analystOS turns scattered bookmarks and PDFs into a structured, queryable research library. Connect AVELIN for cost-effective access to frontier reasoning models that power deep analysis.

> **Why AVELIN + analystOS?** Monitor and optimize your AVELIN API usage with powerful observability tools — track costs, latency, and model performance in real-time.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install/Configure analystOS

Refer to the analystOS documentation for installation and setup instructions.

### Step 3: Point analystOS to AVELIN

Configure analystOS to monitor your AVELIN API calls:

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

## Why AVELIN for analystOS?

- **Rich metadata**: AVELIN provides detailed request/response data for analysis
- **Multi-model tracking**: Monitor all 9 AVELIN models from one dashboard
- **Cost visibility**: See exact token usage and costs per request
- **Automatic failover**: analystOS sees seamless provider switching

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **No data showing** | Verify analystOS is configured with correct AVELIN endpoint |
| **Missing metadata** | Check that request/response logging is enabled |
| **High latency in dashboard** | This may reflect analystOS's processing, not AVELIN's actual latency |
| **Cost discrepancies** | Verify token counting matches AVELIN's usage reporting |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [API Reference](../../api/index.md) — Full endpoint documentation
- [Model Catalog](../../models/README.md) — Full comparison
