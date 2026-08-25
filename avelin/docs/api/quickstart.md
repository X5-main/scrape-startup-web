# API Quickstart

Make your first AVELIN API call in under five minutes. AVELIN is an **AI Laboratory** that builds Cross-Model MoE (Mixture-of-Experts) models — trained AI systems that fuse knowledge from multiple model architectures into single unified models. We don't just route; we build and fuse. The API serves these models through a single governed endpoint.

**Enterprise licensing available:** Deploy AVELIN models on your own GPUs with full data sovereignty. Contact us for enterprise licensing options.

The API is a **drop-in replacement**: change only **2 lines of code** (base URL and API key) to migrate from OpenAI or Anthropic.

## 1. Get an API key

Create a key from your AVELIN account. It will look like:

```
sk-ave...xxxx
```

Keep it secret. Set it as an environment variable so it never lands in code:

```bash
export AVELIN_API_KEY="sk-ave...xxxx"
```

---

## 2. Choose your track

| Track | When to use |
|---|---|
| [**OpenAI-compatible**](#openai-track) | You already use the OpenAI SDK, or your tool expects `/v1/chat/completions` |
| [**Anthropic-compatible**](#anthropic-track) | You already use the Anthropic SDK, or you want fine-grained thinking control via `/v1/messages` |

Both tracks are backed by the same models — pick whichever matches your stack.

---

## OpenAI track {#openai-track}

**Base URL:** `https://api.avelin.ai/v1`  
**Endpoint:** `POST /v1/chat/completions`

### cURL

```bash
curl https://api.avelin.ai/v1/chat/completions \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -d '{
    "model": "avelin-pro",
    "messages": [
      { "role": "user", "content": "Give me three productivity tips." }
    ]
  }'
```

### Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.avelin.ai/v1",
    api_key="sk-ave...xxxx",  # or os.environ["AVELIN_API_KEY"]
)

resp = client.chat.completions.create(
    model="avelin-pro",
    messages=[{"role": "user", "content": "Give me three productivity tips."}],
)
print(resp.choices[0].message.content)
```

### JavaScript / TypeScript (OpenAI SDK)

```ts
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.avelin.ai/v1",
  apiKey: process.env.AVELIN_API_KEY,
});

const resp = await client.chat.completions.create({
  model: "avelin-pro",
  messages: [{ role: "user", content: "Give me three productivity tips." }],
});
console.log(resp.choices[0].message.content);
```

### Response shape (OpenAI)

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "model": "avelin-pro",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "1. Time-block your calendar...",
        "reasoning_content": "The user wants practical tips..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 180,
    "total_tokens": 192
  }
}
```

### Streaming (OpenAI)

```python
stream = client.chat.completions.create(
    model="avelin-pro",
    messages=[{"role": "user", "content": "Write a haiku about sovereignty."}],
    stream=True,
)
for chunk in stream:
    delta = chunk.choices[0].delta
    if delta.content:
        print(delta.content, end="", flush=True)
```

---

## Anthropic track {#anthropic-track}

**Base URL:** `https://api.avelin.ai`  
**Endpoint:** `POST /v1/messages`  
**Header:** `anthropic-version: 2023-06-01`

### cURL

```bash
curl https://api.avelin.ai/v1/messages \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "avelin-pro",
    "max_tokens": 1024,
    "messages": [
      { "role": "user", "content": "Give me three productivity tips." }
    ]
  }'
```

### Python (Anthropic SDK)

```python
from anthropic import Anthropic

client = Anthropic(
    base_url="https://api.avelin.ai",
    api_key="sk-ave...xxxx",  # or os.environ["AVELIN_API_KEY"]
)

msg = client.messages.create(
    model="avelin-pro",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Give me three productivity tips."}],
)
print(msg.content[0].text)
```

### JavaScript / TypeScript (Anthropic SDK)

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  baseURL: "https://api.avelin.ai",
  apiKey: process.env.AVELIN_API_KEY,
});

const msg = await client.messages.create({
  model: "avelin-pro",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Give me three productivity tips." }],
});
console.log(msg.content[0].text);
```

### Response shape (Anthropic)

```json
{
  "id": "resp_...",
  "type": "message",
  "role": "assistant",
  "model": "avelin-pro",
  "content": [
    { "type": "text", "text": "1. Time-block your calendar..." }
  ],
  "stop_reason": "end_turn",
  "usage": { "input_tokens": 12, "output_tokens": 180, "total_tokens": 192 }
}
```

### System prompts (Anthropic)

The Anthropic surface uses a top-level `system` parameter instead of a system
message in the messages array:

```python
msg = client.messages.create(
    model="avelin-coding-fast",
    max_tokens=1024,
    system="You are a senior software engineer.",
    messages=[{"role": "user", "content": "Write a debounce decorator."}],
)
```

### Thinking control (Anthropic)

Extended thinking is enabled by default on reasoning-capable models. To disable:

```python
msg = client.messages.create(
    model="avelin-pro",
    max_tokens=1024,
    thinking={"type": "disabled"},
    messages=[{"role": "user", "content": "Summarize this document."}],
)
```

When thinking is enabled, the response includes a separate `thinking` content
block before the final `text` block.

### Streaming (Anthropic)

```python
with client.messages.stream(
    model="avelin-pro",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Write a haiku about sovereignty."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

---

## 3. Pick the right model

All models are built with AVELIN's Cross-Model MoE technology in our AI Lab. AA Index scores measure overall capability:

| If you need… | Use | AA Index |
|---|---|---|
| Fast, low-cost everyday responses | `avelin-fast` | 47 |
| Balanced speed and quality | `avelin-pro` | 53 |
| Deepest reasoning for high-stakes work | `avelin-ultra` | 55 |
| Tool-using agent workflows | `avelin-agentic-pro` / `avelin-agentic-ultra` | 67 |
| Software engineering | `avelin-coding-fast` / `avelin-coding-pro` / `avelin-coding-ultra` | 42–52 |

**Cost savings vs. direct providers:**
- Intelligence family: **up to 85% cheaper**
- Coding family: **up to 86% cheaper**
- Agentic family: **up to 87% cheaper**

Full descriptions: [Model Catalog](../models/README.md).

## Key differences between tracks

| | OpenAI track | Anthropic track |
|---|---|---|
| **Base URL** | `https://api.avelin.ai/v1` | `https://api.avelin.ai` |
| **Endpoint** | `/v1/chat/completions` | `/v1/messages` |
| **Auth header** | `Authorization: Bearer *** | `Authorization: Bearer *** |
| **Extra header** | — | `anthropic-version: 2023-06-01` |
| **`max_tokens`** | Optional | **Required** |
| **System prompt** | Message with `"role": "system"` | Top-level `"system"` parameter |
| **Thinking control** | `"reasoning_effort": "high"` | `"thinking": { "type": "disabled" }` |
| **Thinking output** | `reasoning_content` field | Separate `thinking` content block |
| **Tool format** | OpenAI function-calling | Anthropic `input_schema` |

## Next steps

- Full [API Reference](index.md) — every endpoint, parameter, and response shape
- [SDKs & Tools](sdks.md) — CLI and editor integration configuration
- [Model Catalog](../models/README.md) — capabilities and selection guidance
