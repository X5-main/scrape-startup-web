# Novelcrafter Integration

AVELIN API is compatible with Novelcrafter — All-in-one writing workspace blending a world-building wiki (Codex) with flexible, model-agnostic AI assistance for drafting novels.

Novelcrafter is a dedicated novel-writing workspace that combines a world-building wiki (the Codex) with model-agnostic AI assistance for drafting. Its killer feature is the Codex — a structured wiki of your world's lore, characters, magic systems, and locations that auto-injects relevant context into AI responses as you write. The AI doesn't just generate text; it knows your world. Mention a character in a scene and Novelcrafter automatically feeds the AI that character's personality, history, and relationships.

Built for fiction authors, worldbuilders, and creative writers who want AI assistance that respects narrative continuity. Unlike generic chat interfaces, Novelcrafter maintains story coherence across chapters. Pair with AVELIN's large-context models for deep awareness of your entire manuscript.

> **Why AVELIN + Novelcrafter?** Leverage AVELIN's frontier models with large context windows and competitive pricing for creative workflows.

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

## Why AVELIN for Novelcrafter?

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
