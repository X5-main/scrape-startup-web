# Open WebUI Integration

AVELIN API is fully compatible with [Open WebUI](https://openwebui.com) — the most popular self-hosted AI chat interface with over 60K GitHub stars. Open WebUI gives you a polished ChatGPT-like experience while connecting to both local models and AVELIN's frontier API simultaneously.

> **Why AVELIN + Open WebUI?** Mix local privacy with frontier intelligence — run small models locally via Ollama for sensitive tasks, then switch to AVELIN's 1M-token context models for complex work, all from the same beautiful interface.

Open WebUI (formerly Ollama WebUI) is a self-hosted, feature-rich AI chat platform that supports both local models through Ollama and remote OpenAI-compatible APIs at the same time. With over 60K GitHub stars, it's the most widely adopted self-hosted chat interface in the AI ecosystem. It includes built-in RAG with document upload and retrieval, web search integration, a model playground for comparing outputs, pipeline support for chaining operations, and function calling — all wrapped in a clean, responsive UI that rivals commercial offerings.

The killer feature is dual-mode operation: local and cloud simultaneously. Run Llama 3 on your own hardware for private conversations, then switch to `avelin-coding-pro` when you need to analyze an entire codebase with 1M-token context. Your data stays local when it matters, and you tap frontier capability when you need it. It's for developers, researchers, teams, and privacy-conscious users who want a self-hosted ChatGPT-quality experience without sacrificing access to the most capable models available.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Open WebUI

```bash
# Docker (recommended)
docker run -d -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

Open WebUI runs at `http://localhost:3000` by default.

### Step 3: Configure AVELIN as a Provider

1. Log in and open the **Admin Panel** (shield icon)
2. Go to **Settings** > **Connections**
3. Under **OpenAI API**, click **Add**
4. Enter your credentials:

| Field | Value |
|---|---|
| **URL** | `https://api.avelin.ai/v1` |
| **API Key** | `sk-ave...xxxx` |

5. Click **Save**

### Step 4: Start Chatting

1. Open the model selector in the chat interface
2. Choose an AVELIN model (e.g., `avelin-pro`)
3. Start chatting — or mix with your local Ollama models

---

## Recommended Models

### For General Chat: `avelin-pro`

| Feature | avelin-pro | Why it matters for Open WebUI |
|---|---|---|
| **Context window** | **256K tokens** | Long conversations with full context retention |
| **Max output** | **65K tokens** | Detailed, thorough responses |
| **Speed** | **Fast** | Responsive streaming in the WebUI |

### For Code & RAG: `avelin-coding-pro`

| Feature | avelin-coding-pro | Why it matters for Open WebUI |
|---|---|---|
| **Context window** | **1M tokens** | Ingest entire repos via RAG document upload |
| **Max output** | **65K tokens** | Generate complete files and implementations |
| **Reasoning** | Deep step-by-step | Reliable code generation and analysis |

### Quick Reference

| Use case | Model |
|---|---|
| Daily chat & questions | `avelin-pro` |
| Complex reasoning | `avelin-ultra` |
| Code generation & review | `avelin-coding-pro` |
| Architecture & design | `avelin-coding-ultra` |
| Fast responses | `avelin-fast` |
| Agent/tool workflows | `avelin-agentic-ultra` |
| Quick tool calls | `avelin-agentic-fast` |

---

## Why AVELIN for Open WebUI?

- **Local + cloud hybrid**: Keep Ollama for private tasks, add AVELIN for frontier capability
- **Prompt caching**: ~80% cost reduction on repeated system prompts and RAG contexts
- **Automatic failover**: AVELIN switches providers if one is slow or down — your WebUI stays responsive
- **Model diversity**: 9 specialized models through one API key, all available in the model selector
- **Function calling**: AVELIN's agentic models support Open WebUI's tools and pipelines

---

## Advanced Configuration

### Pipelines

Open WebUI supports pipelines for chaining operations. Use AVELIN's agentic models for complex multi-step workflows:

1. Go to **Admin Panel** > **Settings** > **Pipelines**
2. Configure a pipeline with `avelin-agentic-ultra` as the reasoning model
3. Chain with local models for cost optimization on simpler steps

### Web Search

Enable web search to give AVELIN models real-time context:

1. Go to **Admin Panel** > **Settings** > **Web Search**
2. Configure your search provider (Google, Bing, DuckDuckGo, etc.)
3. AVELIN models will use retrieved results as context automatically

### Model Comparison (Playground)

Use Open WebUI's playground to compare AVELIN models side by side:

1. Open the **Playground** from the sidebar
2. Add `avelin-pro` and `avelin-ultra` as two separate models
3. Send the same prompt to both and compare outputs

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **No AVELIN models showing** | Verify URL is `https://api.avelin.ai/v1` in Connections settings |
| **"Invalid API key"** | Check key starts with `sk-ave` and has no extra whitespace |
| **Slow responses** | Switch to `avelin-fast` for quicker replies |
| **Streaming not working** | Ensure streaming is enabled in Admin Panel > Settings > General |
| **RAG not finding documents** | Check document was fully indexed; try `avelin-coding-pro` for 1M context |
| **Function calling fails** | Use `avelin-agentic-ultra` which has strong tool-use support |
| **Connection timeout** | Check Docker networking; ensure container can reach external APIs |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [LibreChat Guide](librechat.md) — Another self-hosted chat alternative
- [LobeChat Guide](lobechat.md) — Modern self-hosted option with plugins
- [Model Catalog](../../models/README.md) — Full model comparison
- [Open WebUI Docs](https://docs.openwebui.com) — Official documentation
