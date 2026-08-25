# Maxim AI Integration

AVELIN API works with Maxim AI — Agent simulation, evaluation, and observability platform for deploying agents with quality and speed.

Maxim AI is an evaluation and observability platform specifically designed for AI agents — not just chatbots, but multi-step, tool-using agents. Its killer feature is pre-deploy quality gates: simulate, evaluate, and observe your AI agents before they reach production. Run test suites against your agent's behavior, measure accuracy across edge cases, and set pass/fail thresholds that block bad deployments automatically.

Built for teams shipping AI agents to production who can't afford to debug in front of users. Maxim AI catches regressions, hallucinations, and tool-calling failures before they impact customers. Pair with AVELIN's agentic models and use Maxim to validate that tool calls, multi-step reasoning, and response quality meet your standards.

> **Why AVELIN + Maxim AI?** Monitor and optimize your AVELIN API usage with powerful observability tools — track costs, latency, and model performance in real-time.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install/Configure Maxim AI

Refer to the Maxim AI documentation for installation and setup instructions.

### Step 3: Point Maxim AI to AVELIN

Configure Maxim AI to monitor your AVELIN API calls:

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

## Why AVELIN for Maxim AI?

- **Rich metadata**: AVELIN provides detailed request/response data for analysis
- **Multi-model tracking**: Monitor all 9 AVELIN models from one dashboard
- **Cost visibility**: See exact token usage and costs per request
- **Automatic failover**: Maxim AI sees seamless provider switching

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **No data showing** | Verify Maxim AI is configured with correct AVELIN endpoint |
| **Missing metadata** | Check that request/response logging is enabled |
| **High latency in dashboard** | This may reflect Maxim AI's processing, not AVELIN's actual latency |
| **Cost discrepancies** | Verify token counting matches AVELIN's usage reporting |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [API Reference](../../api/index.md) — Full endpoint documentation
- [Model Catalog](../../models/README.md) — Full comparison
