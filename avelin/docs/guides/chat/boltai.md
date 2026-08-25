# BoltAI Integration

AVELIN API is compatible with [BoltAI](https://boltai.com) — a native Mac app for chatting with AI. BoltAI lets you instantly switch between 300+ models from a single polished interface, and works seamlessly with AVELIN's frontier models.

> **Why AVELIN + BoltAI?** A beautiful native macOS experience with instant model switching, connected to AVELIN's governed API with automatic failover and competitive pricing.

BoltAI is a native Mac app that gives you instant access to 300+ AI models from a single, beautifully designed interface. It's optimized from the ground up for Apple Silicon — no cross-platform abstraction layer, no web-based UI pretending to be native. The result is an app that feels like it was designed in Cupertino: fast launches, smooth animations, proper menu bar integration, and a global hotkey that summons the chat window from anywhere in macOS with a single keystroke.

The killer feature is the combination of massive model breadth and best-in-class Mac UX. Switch from Claude to GPT to Gemini to AVELIN in one click, compare responses side by side, and pull it all up with a hotkey while working in any other app. It also supports document uploads, prompt templates, and conversation organization. It's for Mac power users who refuse to compromise on native feel and want every major AI provider — plus custom endpoints like AVELIN — in one place.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install BoltAI

Download from [boltai.com](https://boltai.com) or the Mac App Store.

### Step 3: Configure AVELIN

1. Open BoltAI
2. Go to **Settings** > **AI Services**
3. Click **Add Custom Provider**
4. Enter your credentials:

| Field | Value |
|---|---|
| **Provider Name** | AVELIN |
| **API Base URL** | `https://api.avelin.ai/v1` |
| **API Key** | `sk-a...` |
| **API Type** | OpenAI Compatible |

### Step 4: Add Models

In the model picker, add your preferred AVELIN models:

```
avelin-pro
avelin-ultra
avelin-fast
avelin-coding-pro
avelin-coding-ultra
```

---

## Recommended Models

| Use case | Model | Why |
|---|---|---|
| Daily conversation | `avelin-pro` | Balanced quality and speed |
| Complex analysis | `avelin-ultra` | Flagship reasoning |
| Quick questions | `avelin-fast` | Lowest latency |
| Code tasks | `avelin-coding-pro` | 1M context, deep reasoning |

---

## Why AVELIN for BoltAI?

- **Native Mac + governed API**: Best desktop UX with enterprise-grade backend
- **Instant model switching**: Try `avelin-pro` then `avelin-ultra` side by side
- **Prompt caching**: ~80% cost reduction on repeated prompts
- **Automatic failover**: Uninterrupted conversations

---

## Example Workflows

### Compare Models Side by Side

1. Open two BoltAI conversations
2. Set one to `avelin-pro`, the other to `avelin-ultra`
3. Ask the same question in both — compare quality and speed

### Document Q&A

1. Switch to `avelin-coding-pro` (1M context)
2. Paste or attach a long document
3. Ask detailed questions about the content

### Quick Research

1. Use `avelin-fast` for rapid-fire questions
2. Switch to `avelin-ultra` when you need deeper analysis

---

## Advanced Configuration

### Keyboard Shortcuts

BoltAI supports global keyboard shortcuts to summon the chat window from anywhere in macOS. Pair with AVELIN for an always-available AI assistant.

### Custom Prompts

Create reusable prompts in BoltAI's prompt library:
- **Code Review**: Use `avelin-coding-pro` with review system prompt
- **Summarize**: Use `avelin-fast` for quick document summaries
- **Deep Think**: Use `avelin-ultra` with thinking enabled

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **"Invalid API key"** | Verify key starts with `sk-ave` |
| **Connection failed** | Check base URL is `https://api.avelin.ai/v1` |
| **Slow responses** | Try `avelin-fast` for lower latency |
| **Model not showing** | Add it manually in Settings > AI Services |
| **Streaming issues** | Ensure streaming is enabled in BoltAI settings |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Chatbox Guide](chatbox.md) — Cross-platform alternative
- [LibreChat Guide](librechat.md) — Self-hosted chat option
- [Model Catalog](../../models/README.md) — Full comparison
- [BoltAI Website](https://boltai.com) — Download and docs
