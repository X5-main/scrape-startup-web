# Warden Integration

AVELIN API is compatible with [Warden](https://warden.app) — Native Swift macOS app supporting multiple AI providers via BYOK. Warden works seamlessly with AVELIN's OpenAI-compatible API endpoint.

> **Why AVELIN + Warden?** Access AVELIN's frontier models with 1M-token context windows, automatic failover, and competitive pricing through a polished desktop interface.

Warden is a native Swift macOS app built on the BYOK (Bring Your Own Key) model. It's written entirely in Swift — no Electron, no web views — which means it launches instantly, uses minimal memory, and feels like a first-party Apple app. The BYOK architecture means Warden never proxies your requests through a middleman server: your API keys stay on your machine, and the only network calls go directly to the AI provider you've configured.

The killer feature is the combination of native Swift performance and zero-trust privacy design. There's no Warden cloud, no telemetry phone-home, no middle layer that could see your prompts. Your conversation data lives exclusively on your Mac. It's for privacy-conscious Mac users — developers, researchers, anyone handling sensitive information — who want a chat client that's as fast as Notes.app and as private as a local text file.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Warden

Download from [Warden](https://warden.app) and install for your platform.

### Step 3: Configure AVELIN

1. Open Warden
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

## Why AVELIN for Warden?

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
- [Warden Website](https://warden.app) — Official documentation
