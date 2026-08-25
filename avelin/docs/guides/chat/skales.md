# Skales Integration

AVELIN API is compatible with [Skales](https://skales.app) — Local AI desktop agent for Windows, macOS & Linux with 15+ providers, Desktop Buddy, and Browser Agent. Skales works seamlessly with AVELIN's OpenAI-compatible API endpoint.

> **Why AVELIN + Skales?** Access AVELIN's frontier models with 1M-token context windows, automatic failover, and competitive pricing through a polished desktop interface.

Skales is a local AI desktop agent for Windows, macOS, and Linux that ships with 15+ AI providers built in and a philosophy of "no Docker, no terminal." It's not just a chat client — it's a full desktop AI environment. The standout features include Desktop Buddy (a floating AI widget that sits on top of other apps so you can query AI without switching windows), a Discover Feed where the community shares pre-built workflows and prompts, Custom Skills for creating reusable AI actions, and a Browser Agent that can navigate the web on your behalf.

The killer feature is the zero-setup desktop-native experience. Where other tools make you configure Docker containers or wrangle API endpoints in a terminal, Skales installs like any other app and just works. Desktop Buddy alone sets it apart — imagine having an AI assistant that floats over your IDE, your browser, or your spreadsheet, always one click away. It's for people who want AI deeply integrated into their desktop workflow without the DevOps overhead.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Skales

Download from [Skales](https://skales.app) and install for your platform.

### Step 3: Configure AVELIN

1. Open Skales
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

## Why AVELIN for Skales?

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
- [Skales Website](https://skales.app) — Official documentation
