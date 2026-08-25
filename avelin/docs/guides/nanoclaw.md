1|# NanoClaw Integration
2|
AVELIN API is compatible with NanoClaw — Lightweight alternative to OpenClaw running agents in isolated containers. Supports WhatsApp, Telegram, Slack, Discord, Gmail.

NanoClaw is a lightweight alternative to OpenClaw that runs AI agents in isolated containers for maximum security. Its killer feature is container isolation combined with multi-platform messaging — each agent runs in its own sandboxed container, so a rogue action in one agent can't affect another, while still supporting WhatsApp, Telegram, Slack, Discord, and Gmail from a single deployment. It gives you the power of OpenClaw with a fraction of the resource footprint.

Built for security-conscious teams and self-hosters who want multi-platform AI automation without the overhead of a full OpenClaw deployment. NanoClaw's lighter footprint means you can run it on a single VPS while still connecting to every major messaging platform. Pair with AVELIN's agentic models for reliable tool-calling inside each isolated container.

> **Why AVELIN + NanoClaw?** Leverage AVELIN's frontier models with 1M-token context windows, automatic failover, and competitive pricing for automation workflows.
6|
7|---
8|
9|## Quick Setup
10|
11|### Step 1: Get your AVELIN API key
12|
13|Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.
14|
15|### Step 2: Configure AVELIN
16|
17|Most automation tools support OpenAI-compatible endpoints via environment variables:
18|
19|```bash
20|export OPENAI_API_BASE=https://api.avelin.ai/v1
21|export OPENAI_API_KEY=*** API Reference
22|
23|| Endpoint | URL |
24||---|---|
25|| **OpenAI-compatible** | `https://api.avelin.ai/v1` |
26|| **Anthropic-compatible** | `https://api.avelin.ai` |
27|
28|---
29|
30|## Recommended Models
31|
32|| Use case | Model | Why |
33||---|---|---|
34|| Complex automation | `avelin-agentic-ultra` | Top-tier reasoning for multi-step workflows |
35|| Standard tasks | `avelin-agentic-pro` | Balanced performance and cost |
36|| High-volume simple tasks | `avelin-agentic-fast` | Lowest cost, fastest response |
37|| Code-heavy automation | `avelin-coding-pro` | 1M context, code understanding |
38|| Research workflows | `avelin-ultra` | Flagship reasoning capabilities |
39|
40|---
41|
42|## Why AVELIN for NanoClaw?
43|
44|- **Agentic models**: Purpose-built for tool-calling and multi-step planning
45|- **Automatic failover**: Automation keeps running if a provider is down
46|- **1M context**: Track complex workflows without losing context
47|- **Cost optimization**: Prompt caching reduces costs by ~80% on repeated prompts
48|
49|---
50|
51|## Troubleshooting
52|
53|| Issue | Solution |
54||---|---|
55|| **API key error** | Verify `OPENAI_API_BASE` includes `/v1` |
56|| **Agent loops** | Lower temperature to 0.0-0.1, use `avelin-agentic-ultra` |
57|| **Token limit** | Break workflow into smaller steps |
58|| **Tool failures** | Use `avelin-agentic-ultra` for best tool-calling reliability |
59|
60|---
61|
62|## Related
63|
64|- [API Quickstart](../api/quickstart.md) — First API call in 5 minutes
65|- [Browser Use Guide](browser-use.md) — Browser automation
66|- [OpenClaw Guide](coding/openclaw.md) — Multi-service automation
67|- [Model Catalog](../models/README.md) — Full comparison
68|