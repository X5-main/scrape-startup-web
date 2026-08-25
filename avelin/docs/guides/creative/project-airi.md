# Project AIRI Integration

AVELIN API is compatible with Project AIRI — Open-source virtual companion (inspired by Neuro-sama) capable of chatting, listening, speaking, and playing games.

Project AIRI is an open-source virtual companion inspired by Neuro-sama — the AI VTuber phenomenon. Its killer feature is multimodal presence: AIRI can chat, listen to your voice, speak back with natural TTS, and even play games alongside you. Unlike static chatbots, AIRI is designed to feel like a persistent companion with personality, memory, and the ability to interact across multiple modalities simultaneously.

Built for AI enthusiasts, VTuber fans, and anyone interested in the frontier of AI companionship. Project AIRI is fully open-source, so you can customize personality, voice, and behavior. Connect to AVELIN for high-quality conversational AI that powers AIRI's personality engine.

> **Why AVELIN + Project AIRI?** Leverage AVELIN's frontier models with large context windows and competitive pricing for creative workflows.

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

## Why AVELIN for Project AIRI?

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
