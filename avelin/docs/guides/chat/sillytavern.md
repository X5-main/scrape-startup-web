# SillyTavern Integration

AVELIN API works with [SillyTavern](https://sillytavern.ai) — a local-first LLM frontend for power users. SillyTavern supports chat, character cards, roleplay, and creative writing with multiple AI providers.

> **Why AVELIN + SillyTavern?** A feature-rich local frontend connected to AVELIN's frontier models — full control over your experience with governed API access and prompt caching.

SillyTavern is a local-first LLM frontend built for power users who want total control over how AI chat works under the hood. It runs entirely on your machine (as a local Node.js server) and connects to any OpenAI-compatible API as a backend. The centerpiece is its character card system — rich, portable persona definitions that include personality, speech patterns, backstory, and scenario context. Cards can be shared, imported, and layered, making persistent AI personas trivial to manage.

The killer feature is the depth of customization paired with a massive extension ecosystem. You get granular control over samplers (temperature, top-p, top-k, repetition penalty, min-p, and dozens more), system prompt engineering per character, context management strategies for long conversations, and a plugin system that adds everything from image generation to emotion classification to TTS. It's the undisputed power-user choice for creative AI — roleplay, fiction writing, worldbuilding, and character-driven storytelling — where default chat UIs feel like working with one hand tied behind your back.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install SillyTavern

```bash
git clone https://github.com/SillyTavern/SillyTavern.git
cd SillyTavern
./start.sh    # Linux/macOS
start.bat     # Windows
```

Opens at `http://localhost:8000` by default.

### Step 3: Configure AVELIN

1. Open SillyTavern
2. Go to **API Connections** (plug icon)
3. Select **Text Completion** > **OpenAI**
4. Enter your credentials:

| Field | Value |
|---|---|
| **API URL** | `https://api.avelin.ai/v1` |
| **API Key** | `sk-a...` |

5. Click **Connect** — you should see a green checkmark

### Step 4: Select a Model

In the model dropdown, choose your AVELIN model:

```
avelin-pro
avelin-ultra
avelin-fast
avelin-coding-pro
```

---

## Recommended Models

| Use case | Model | Why |
|---|---|---|
| Creative chat & roleplay | `avelin-pro` | Balanced creativity and coherence |
| Complex narratives | `avelin-ultra` | Deepest reasoning, best story consistency |
| Quick responses | `avelin-fast` | Low latency for fast-paced chat |
| Worldbuilding | `avelin-coding-pro` | 1M context for large lore documents |

---

## Why AVELIN for SillyTavern?

- **Local-first + governed API**: Your SillyTavern instance stays local, AVELIN handles routing and reliability
- **Prompt caching**: Character cards and system prompts are cached — ~80% cost reduction on repeated context
- **Large context**: 256K-1M tokens for long roleplay sessions without losing story context
- **Model diversity**: Switch between models mid-conversation to optimize quality vs cost

---

## Configuration Tips

### Character Cards

When using character cards with long descriptions:
- Use `avelin-pro` or `avelin-ultra` for best character consistency
- Enable prompt caching (automatic with AVELIN) for repeated character prompts
- Set context size to match your model's window

### Temperature Settings

| Setting | Effect |
|---|---|
| 0.3-0.5 | Consistent character behavior, factual responses |
| 0.6-0.8 | Balanced creativity — recommended for most roleplay |
| 0.9-1.2 | High creativity — more unpredictable responses |

### Context Management

For long conversations:
- `avelin-pro`: 256K context — ~150K words of conversation history
- `avelin-coding-pro`: 1M context — ~600K words of history
- Use SillyTavern's context summary feature to compress older messages

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **"API key invalid"** | Verify key starts with `sk-ave` |
| **Connection timeout** | Check API URL is `https://api.avelin.ai/v1` |
| **Character breaks** | Lower temperature or use `avelin-ultra` |
| **Slow responses** | Switch to `avelin-fast` |
| **Context overflow** | Enable context summarization or switch to larger model |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Chatbox Guide](chatbox.md) — Desktop chat alternative
- [LibreChat Guide](librechat.md) — Self-hosted chat alternative
- [Model Catalog](../../models/README.md) — Full comparison
- [SillyTavern Docs](https://docs.sillytavern.app) — Official documentation
