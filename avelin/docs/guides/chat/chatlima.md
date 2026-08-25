# ChatLima Integration

AVELIN API is compatible with [ChatLima](https://chatlima.ai) — Feature-rich, MCP-powered chatbot with multi-model support, image input, PDF export. ChatLima works seamlessly with AVELIN's OpenAI-compatible API endpoint.

> **Why AVELIN + ChatLima?** Access AVELIN's frontier models with 1M-token context windows, automatic failover, and competitive pricing through a polished desktop interface.

ChatLima is a feature-rich chatbot built around the Model Context Protocol (MCP) — an open standard that lets AI connect directly to your tools and data. Instead of copy-pasting context into prompts, you connect MCP servers for Google Calendar, Gmail, your file system, databases, or any MCP-compatible service, and the AI interacts with them natively during conversation. Think of it as giving your chat window hands.

The killer feature is that native MCP integration: ask ChatLima to "check my calendar for tomorrow and draft an email to reschedule the 2pm" and it actually does it — reading your calendar, composing the email, all in one flow. Beyond MCP, it handles PDF export of conversations, image input for vision models, and comprehensive API key management for juggling multiple providers. It's built for people who want their AI chat to be more than a text box — they want it wired into their actual workflow.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install ChatLima

Download from [ChatLima](https://chatlima.ai) and install for your platform.

### Step 3: Configure AVELIN

1. Open ChatLima
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

## Why AVELIN for ChatLima?

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
- [ChatLima Website](https://chatlima.ai) — Official documentation
