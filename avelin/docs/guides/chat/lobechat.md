# LobeChat Integration

AVELIN API works seamlessly with [LobeChat](https://lobehub.com) — a modern, feature-rich chat interface with over 40K GitHub stars. LobeChat combines a beautiful UI with a powerful plugin ecosystem, connecting to AVELIN's frontier models via both OpenAI and Anthropic-compatible endpoints.

> **Why AVELIN + LobeChat?** A stunning, plugin-extensible chat interface that deploys in one Docker command, connected to AVELIN's governed API with 200+ plugins for search, code execution, image generation, and more.

LobeChat is a modern, open-source chat client available as a self-hosted Docker deployment or via LobeChat Cloud. With over 40K GitHub stars, it stands out for its polished, contemporary UI and its extensive plugin system featuring 200+ community-built plugins. It supports text-to-speech, vision, multi-modal inputs, conversation management, prompt templates, and model switching — all in a single, beautifully designed interface that feels like a premium product rather than an open-source project.

The killer feature is the plugin marketplace combined with effortless deployment. Install a web search plugin, a calculator, an image generator, or a code executor — all from within the UI — and your AI assistant gains those capabilities instantly. Deploy with one `docker run` command and you have a ChatGPT-quality interface that connects to any OpenAI or Anthropic-compatible API. It's for developers and teams who want a modern, extensible chat experience with rich plugin integrations and the flexibility to self-host or use the cloud version.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install LobeChat

```bash
# Self-hosted via Docker
docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-ave...xxxx \
  -e OPENAI_PROXY_URL=https://api.avelin.ai/v1 \
  --name lobe-chat \
  lobehub/lobe-chat
```

Or use [LobeChat Cloud](https://chat.lobehub.com) and configure in-app.

LobeChat runs at `http://localhost:3210` by default.

### Step 3: Configure AVELIN

**Via Docker environment variables** (recommended for self-hosted):

```bash
# OpenAI-compatible endpoint
OPENAI_API_KEY=sk-ave...xxxx
OPENAI_PROXY_URL=https://api.avelin.ai/v1

# Or Anthropic-compatible endpoint
ANTHROPIC_API_KEY=sk-ave...xxxx
ANTHROPIC_PROXY_URL=https://api.avelin.ai
```

**Via UI** (for cloud or existing deployments):

1. Open LobeChat and go to **Settings** (gear icon)
2. Navigate to **Language Model** > **OpenAI**
3. Set **API Proxy** to `https://api.avelin.ai/v1`
4. Enter your **API Key**: `sk-ave...xxxx`

### Step 4: Add Models and Start Chatting

1. In **Settings** > **Language Model** > **OpenAI**, enable your preferred models
2. Or add custom model names manually:

```
avelin-pro
avelin-ultra
avelin-fast
avelin-coding-pro
avelin-coding-fast
avelin-coding-ultra
avelin-agentic-pro
avelin-agentic-ultra
avelin-agentic-fast
```

3. Return to the chat, select your model, and start chatting

---

## Recommended Models

### For General Chat: `avelin-pro`

| Feature | avelin-pro | Why it matters for LobeChat |
|---|---|---|
| **Context window** | **256K tokens** | Long conversations with plugin context |
| **Max output** | **65K tokens** | Detailed responses with rich formatting |
| **Speed** | **Fast** | Smooth streaming in the modern UI |

### For Plugins & Tools: `avelin-agentic-ultra`

| Feature | avelin-agentic-ultra | Why it matters for LobeChat |
|---|---|---|
| **Tool use** | Excellent | Leverages LobeChat's 200+ plugins effectively |
| **Context window** | **256K tokens** | Room for plugin results and conversation |
| **Function calling** | Native | Seamless integration with plugin system |

### Quick Reference

| Use case | Model |
|---|---|
| Daily chat & questions | `avelin-pro` |
| Complex reasoning | `avelin-ultra` |
| Code generation & review | `avelin-coding-pro` |
| Architecture & design | `avelin-coding-ultra` |
| Fast responses | `avelin-fast` |
| Plugin-heavy workflows | `avelin-agentic-ultra` |
| Quick tool calls | `avelin-agentic-fast` |

---

## Why AVELIN for LobeChat?

- **Dual endpoint support**: Connect via OpenAI (`/v1`) or Anthropic (`/`) compatible endpoints
- **Plugin synergy**: AVELIN's agentic models excel at LobeChat's function-calling plugin system
- **Prompt caching**: ~80% cost reduction on repeated system prompts across conversations
- **Automatic failover**: Never interrupted by provider outages — your plugins keep working
- **Vision & multi-modal**: AVELIN models support vision inputs through LobeChat's upload interface

---

## Advanced Configuration

### Anthropic Endpoint

LobeChat natively supports Anthropic's API format. You can use AVELIN through the Anthropic-compatible endpoint:

```bash
ANTHROPIC_API_KEY=sk-ave...xxxx
ANTHROPIC_PROXY_URL=https://api.avelin.ai
```

This gives you access to AVELIN models through LobeChat's Anthropic integration path, which may enable additional UI features specific to Anthropic-style conversations.

### Plugins

LobeChat's plugin marketplace includes 200+ plugins. Pair them with AVELIN's agentic models for best results:

- **Web Search** — Give AVELIN models real-time internet access
- **Code Runner** — Execute code generated by `avelin-coding-pro`
- **Image Generation** — Combine text analysis with image creation
- **Calculator** — Mathematical precision alongside reasoning

### TTS (Text-to-Speech)

Enable TTS in LobeChat settings to have AVELIN responses read aloud. Works with any AVELIN model.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **No models showing** | Verify API Proxy URL is `https://api.avelin.ai/v1` (with `/v1`) |
| **"Invalid API key"** | Check key starts with `sk-ave` and has no trailing spaces |
| **Slow responses** | Switch to `avelin-fast` for lower latency |
| **Plugins not triggering** | Use `avelin-agentic-ultra` — it has the strongest function calling |
| **Streaming errors** | Ensure model name matches exactly (no typos) |
| **Anthropic endpoint fails** | Use `https://api.avelin.ai` (without `/v1`) for Anthropic format |
| **Docker can't connect** | Check container networking; ensure outbound HTTPS is allowed |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Open WebUI Guide](open-webui.md) — Self-hosted alternative with Ollama support
- [LibreChat Guide](librechat.md) — Another self-hosted chat option
- [Model Catalog](../../models/README.md) — Full model comparison
- [LobeChat Docs](https://lobehub.com/docs) — Official documentation
