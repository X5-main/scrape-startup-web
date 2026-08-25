# LibreChat Integration

AVELIN API is fully compatible with [LibreChat](https://librechat.ai) — a free, open-source, self-hosted chat interface that supports multiple AI providers. LibreChat gives you a ChatGPT-like experience while connecting to AVELIN's frontier models.

> **Why AVELIN + LibreChat?** Self-host your chat UI, keep full data sovereignty, and access AVELIN's 1M-token context models — all with a familiar ChatGPT-style interface.

LibreChat is a free, open-source, self-hosted chat interface that replicates and extends the ChatGPT experience — but on your own infrastructure, with your own data, connected to any AI provider you choose. It supports multi-provider routing (talk to OpenAI, Anthropic, Google, and custom endpoints like AVELIN from one interface), conversation branching, file uploads, code interpretation, and a plugin system for extending functionality. It's the most popular self-hosted ChatGPT alternative with over 20k GitHub stars.

The killer feature is true data sovereignty with a zero-compromise UI. Unlike ChatGPT, your conversation history never leaves your server. Unlike raw API calls, you get a polished interface with conversation management, shared prompts, multi-user support, and model switching. It deploys with a single `docker compose up` and connects to AVELIN as a custom OpenAI-compatible endpoint. It's for teams, organizations, and privacy-minded individuals who want a ChatGPT-quality experience they fully own and control.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install LibreChat

```bash
git clone https://github.com/danny-avila/LibreChat.git
cd LibreChat
cp .env.example .env
docker compose up -d
```

LibreChat runs at `http://localhost:3080` by default.

### Step 3: Configure AVELIN as a Provider

Edit your `.env` file and add AVELIN as a custom OpenAI-compatible endpoint:

```env
# Custom endpoint for AVELIN
CUSTOM_NAME_1="AVELIN"
CUSTOM_BASE_URL_1="https://api.avelin.ai/v1"
***

### Step 4: Start Chatting

1. Restart LibreChat: `docker compose up -d`
2. Open `http://localhost:3080`
3. Select **AVELIN** from the endpoint dropdown
4. Choose your model and start chatting

---

## Recommended Models

### For Chat: `avelin-pro`

| Feature | avelin-pro | Why it matters for LibreChat |
|---|---|---|
| **Context window** | **256K tokens** | Long conversations without losing context |
| **Max output** | **65K tokens** | Detailed, thorough responses |
| **Speed** | **Fast** | Responsive chat experience |

### For Coding: `avelin-coding-pro`

| Feature | avelin-coding-pro | Why it matters for LibreChat |
|---|---|---|
| **Context window** | **1M tokens** | Paste entire codebases for review |
| **Max output** | **65K tokens** | Generate large code files |
| **Reasoning** | Deep step-by-step | Catches subtle bugs |

### Quick Reference

| Use case | Model |
|---|---|
| Daily chat & questions | `avelin-pro` |
| Complex reasoning | `avelin-ultra` |
| Code generation & review | `avelin-coding-pro` |
| Architecture & design | `avelin-coding-ultra` |
| Fast responses | `avelin-fast` |
| Agent/tool workflows | `avelin-agentic-ultra` |

---

## Why AVELIN for LibreChat?

- **Data sovereignty**: Self-hosted UI + governed API = full control over your data
- **Prompt caching**: ~80% cost reduction on repeated system prompts
- **Automatic failover**: AVELIN switches providers if one is slow or down
- **Model diversity**: 9 specialized models through one API key

---

## Advanced Configuration

### Conversation Titles

LibreChat auto-generates conversation titles. Use `avelin-fast` to minimize cost:

```yaml
titleConvo: true
titleModel: "avelin-fast"
```

### Streaming

Enable streaming for real-time token delivery:

```yaml
endpoints:
  custom:
    - name: "AVELIN"
      # ... other config
      stream: true
```

### Presets

Create presets in LibreChat for common workflows:
- **"Code Review"** — `avelin-coding-pro` with coding system prompt
- **"Quick Answers"** — `avelin-fast` with low temperature
- **"Deep Analysis"** — `avelin-ultra` with high max tokens

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **"Model not found"** | Check model name spelling in `librechat.yaml` |
| **Slow responses** | Switch to `avelin-fast` for quicker replies |
| **Connection refused** | Verify `CUSTOM_BASE_URL_1` is `https://api.avelin.ai/v1` |
| **No models showing** | Ensure `fetch: false` and models are listed in `default` |
| **Streaming not working** | Add `stream: true` to endpoint config |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Chatbox Guide](chatbox.md) — Desktop chat client alternative
- [Model Catalog](../../models/README.md) — Full model comparison
- [LibreChat Docs](https://www.librechat.ai/docs) — Official documentation
