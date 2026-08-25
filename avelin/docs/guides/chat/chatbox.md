# Chatbox Integration

AVELIN API works seamlessly with [Chatbox](https://chatboxai.app) — a cross-platform desktop AI client available on Windows, macOS, Linux, iOS, and Android. Chatbox provides a polished, native chat experience with support for OpenAI-compatible APIs.

> **Why AVELIN + Chatbox?** A sleek desktop client that runs on every platform, connected to AVELIN's frontier models with 1M-token context windows — all with your own API key.

Chatbox is a cross-platform desktop AI client with native apps for Windows, macOS, Linux, iOS, and Android — the same polished experience on every device you own. It connects to any OpenAI-compatible API and provides a clean, modern chat interface with features like markdown rendering, code syntax highlighting, conversation export, custom system prompts, and image generation support. Your API keys and conversations sync across devices so you can start a conversation on your phone and continue on your desktop.

The killer feature is genuine cross-platform parity with a native feel on each OS. Most AI chat apps are either web-only or Mac-only; Chatbox ships real native clients everywhere. The mobile apps aren't afterthoughts — they're first-class experiences with the same model management, prompt templates, and conversation history as the desktop versions. It's for people who live across multiple devices and want one AI client that follows them everywhere without resorting to a browser tab.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Chatbox

Download from [chatboxai.app](https://chatboxai.app) or install via:

```bash
brew install --cask chatbox    # macOS
winget install chatbox         # Windows
```

### Step 3: Configure Chatbox

1. Open Chatbox
2. Go to **Settings** (gear icon)
3. Under **Model Provider**, select **OpenAI API Compatible**
4. Enter your credentials:

| Field | Value |
|---|---|
| **API Host** | `https://api.avelin.ai/v1` |
| **API Key** | `sk-a...` |

### Step 4: Add Models

In the **Model** dropdown, click **Manage** and add:

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

---

## Recommended Models

| Use case | Model | Why |
|---|---|---|
| Daily conversation | `avelin-pro` | Balanced quality and speed |
| Complex analysis | `avelin-ultra` | Flagship reasoning capabilities |
| Quick questions | `avelin-fast` | Lowest latency, lowest cost |
| Code tasks | `avelin-coding-pro` | 1M context, deep reasoning |
| Architecture | `avelin-coding-ultra` | System design expertise |

---

## Why AVELIN for Chatbox?

- **Cross-platform**: Same AVELIN key works on desktop and mobile
- **Prompt caching**: ~80% cost reduction on repeated prompts
- **Automatic failover**: Never interrupted by provider outages
- **256K-1M context**: Long conversations and large document analysis

---

## Example Workflows

### Document Analysis

1. Paste a long document into the chat
2. Select `avelin-pro` (256K context) or `avelin-coding-pro` (1M context)
3. Ask questions about the content

### Code Review

1. Switch to `avelin-coding-pro`
2. Paste code snippets or entire files
3. Ask for review, refactoring, or bug analysis

### Multi-Model Comparison

1. Create separate chat sessions for each model
2. Ask the same question in each
3. Compare responses to find the best answer

---

## Advanced Configuration

### System Prompts

Set custom system prompts in Chatbox Settings > Advanced:

```
You are a senior software engineer. Provide concise, accurate code
with explanations. Include error handling in all examples.
```

### Temperature Control

| Setting | Use case |
|---|---|
| 0.0-0.3 | Factual Q&A, code generation |
| 0.4-0.7 | General conversation, analysis |
| 0.8-1.0 | Creative writing, brainstorming |

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **"Invalid API key"** | Verify key starts with `sk-ave` |
| **"Network error"** | Check API Host is `https://api.avelin.ai/v1` |
| **Slow responses** | Switch to `avelin-fast` for lower latency |
| **Context too long** | Start a new conversation or use a larger-context model |
| **Model not in list** | Add it manually in Model > Manage |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [LibreChat Guide](librechat.md) — Self-hosted chat alternative
- [BoltAI Guide](boltai.md) — Native Mac chat client
- [Model Catalog](../../models/README.md) — Full model comparison
- [Chatbox Website](https://chatboxai.app) — Download and docs
