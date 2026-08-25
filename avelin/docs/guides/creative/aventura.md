# Aventura Integration

AVELIN API is compatible with Aventura — Free, open-source AI adventure and creative writing application.

Aventura is a free, open-source interactive fiction engine powered by AI. Its killer feature is AI-driven narrative branches — rather than following pre-written paths, Aventura generates unique story branches in real time based on your choices, creating genuinely unpredictable adventures. Every playthrough is different because the AI is composing the story as you go, adapting to your decisions and building on earlier choices.

Perfect for game masters looking for inspiration, interactive fiction enthusiasts, and creative writers who want to explore narrative possibilities. Aventura turns storytelling into a collaborative game between you and the AI. Connect AVELIN for fast, creative model access that keeps the story flowing.

> **Why AVELIN + Aventura?** Leverage AVELIN's frontier models with large context windows and competitive pricing for creative workflows.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Configure AVELIN

Most creative tools support OpenAI-compatible endpoints via environment variables or settings:

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
| Creative writing | `avelin-pro` | Balanced creativity and coherence |
| Complex narratives | `avelin-ultra` | Deepest reasoning for story consistency |
| Quick responses | `avelin-fast` | Low latency for rapid iteration |
| Long documents | `avelin-coding-pro` | 1M context for entire novels |

---

## Why AVELIN for Aventura?

- **Large context**: 256K-1M tokens for long creative works
- **Prompt caching**: ~80% cost reduction on repeated character/world context
- **Model diversity**: Switch between models for different creative needs
- **Competitive pricing**: Lower per-token costs than direct providers

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **API key error** | Verify `OPENAI_API_BASE` includes `/v1` |
| **Character inconsistencies** | Use `avelin-ultra` for better narrative coherence |
| **Slow responses** | Switch to `avelin-fast` for quicker iteration |
| **Context overflow** | Enable context summarization or use larger model |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Chatbox Guide](../chat/chatbox.md) — Desktop chat for creative brainstorming
- [Model Catalog](../../models/README.md) — Full comparison
