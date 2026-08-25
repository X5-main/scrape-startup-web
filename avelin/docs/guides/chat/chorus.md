# Chorus Integration

AVELIN API is compatible with [Chorus](https://chorus.app) — macOS desktop app providing unified access to multiple AI models. Chorus works seamlessly with AVELIN's OpenAI-compatible API endpoint.

> **Why AVELIN + Chorus?** Access AVELIN's frontier models with 1M-token context windows, automatic failover, and competitive pricing through a polished desktop interface.

Chorus is a macOS-native desktop app that gives you a single unified interface to talk to multiple AI providers at once. Rather than bouncing between different apps or browser tabs for different models, Chorus lets you send the same prompt to several models simultaneously and compare their responses side-by-side in real time. It's built specifically for macOS — not a web wrapper — so you get native performance, proper window management, and system integration.

The killer feature is side-by-side model comparison: ask a question once and watch three or four models answer it in parallel. This is invaluable when you're evaluating which model handles your use case best, or when you want a second opinion on a complex answer without re-typing anything. It's for Mac users who work with multiple AI providers daily and are tired of the tab-switching dance.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Chorus

Download from [Chorus](https://chorus.app) and install for your platform.

### Step 3: Configure AVELIN

1. Open Chorus
2. Go to **Settings** or **API Configuration**
3. Select **OpenAI Compatible** or **Custom Provider**
4. Enter your credentials:

| Field | Value |
|---|---|
| **API Base URL** | `https://api.avelin.ai/v1` |
| **API Key** | `sk-a...` |
| **API Type** | OpenAI Compatible |

### Step 4: Add Models

Add your preferred AVELIN models:

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

## Why AVELIN for Chorus?

- **Governed API**: Enterprise-grade backend with automatic failover
- **Prompt caching**: ~80% cost reduction on repeated prompts
- **Large context**: 256K-1M token windows for long conversations
- **Model diversity**: 9 specialized models through one API key

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **"Invalid API key"** | Verify key starts with `sk-ave` |
| **Connection failed** | Check base URL is `https://api.avelin.ai/v1` |
| **Slow responses** | Try `avelin-fast` for lower latency |
| **Model not showing** | Add it manually in settings |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Chatbox Guide](chatbox.md) — Cross-platform chat alternative
- [LibreChat Guide](librechat.md) — Self-hosted chat option
- [Model Catalog](../../models/README.md) — Full comparison
- [Chorus Website](https://chorus.app) — Official documentation
