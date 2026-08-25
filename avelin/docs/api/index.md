# AVELIN API Reference

AVELIN is an **AI Laboratory** that builds Cross-Model MoE (Mixture-of-Experts) models — trained AI systems that fuse knowledge from multiple model architectures into single unified models. We don't just route; we build and fuse. The AVELIN API serves these models through a single governed endpoint, delivering superior results at every tier.

**Enterprise licensing available:** Deploy AVELIN models on your own GPUs with full data sovereignty. Contact us for enterprise licensing options.

The API is a **drop-in replacement** for both the OpenAI and Anthropic wire
formats — most existing SDKs and tools work by changing only **2 lines of code**:
the base URL and API key.

Supported workloads include chat, reasoning, agentic tool use, coding,
embedding, transcription, and image generation — with automatic model selection,
failover, and unified billing behind one API key.

- New here? Start with the [Quickstart](quickstart.md).
- Using an SDK or CLI? See [SDKs & Tools](sdks.md).
- Choosing a model? See the [Model Catalog](../models/README.md).
- Need live web data? See the [Web Intelligence API](web-scraping.md) — a Firecrawl-compatible scrape/search/crawl surface.

---

## Base URL

```
https://api.avelin.ai
```

Model endpoints are served under the `/v1` path prefix. The Firecrawl-compatible
[Web Intelligence API](web-scraping.md) is served under `/v2`.

## Authentication

Every request requires a bearer token:

```
Authorization: Bearer ***
```

Keys are issued and managed from your AVELIN account. Treat keys as secrets —
never embed them in client-side code or commit them to source control. Use
separate keys per application or environment so they can be rotated and
spend-tracked independently.

## Compatibility surfaces

| Surface | Endpoint | Best for |
|---|---|---|
| **OpenAI-compatible** | `/v1/chat/completions` | OpenAI SDKs, most third-party tools |
| **Anthropic-compatible** | `/v1/messages` | Anthropic SDKs, Claude-style clients, fine-grained thinking control |

Both surfaces are backed by the same models and return equivalent results —
pick whichever matches your existing stack. Switching is a **2-line change**:
update the base URL and API key.

For live web data — scrape, search, map, crawl, and extract — AVELIN also offers a
**Firecrawl-compatible** surface under `/v2`, usable from the official Firecrawl SDK with
your AVELIN key. See the [Web Intelligence API](web-scraping.md).

---

## Endpoints

### `POST /v1/chat/completions` (OpenAI-compatible)

Create a chat completion.

**Request**

```bash
curl https://api.avelin.ai/v1/chat/completions \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -d '{
    "model": "avelin-pro",
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "Summarize the benefits of vendor-neutral AI." }
    ],
    "max_tokens": 1024
  }'
```

**Common parameters**

| Field | Type | Description |
|---|---|---|
| `model` | string | A public model alias, e.g. `avelin-pro` (see [Model Catalog](../models/README.md)). |
| `messages` | array | Conversation messages with `role` (`system` / `user` / `assistant`) and `content`. |
| `max_tokens` | integer | Maximum tokens to generate. |
| `stream` | boolean | `true` to stream tokens as Server-Sent Events. |
| `tools` | array | Tool/function definitions (OpenAI function-calling format). |
| `tool_choice` | string | `"auto"` or `"none"`. |
| `reasoning_effort` | string | `"high"` to request deeper reasoning on models that support it. |

**Response**

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
        "content": "Vendor-neutral AI reduces lock-in by...",
        "reasoning_content": "The user wants a concise summary..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 180,
    "total_tokens": 204
  }
}
```

On reasoning-capable models, the model's thinking is returned in the
`reasoning_content` field, separate from the final `content`.

---

### `POST /v1/messages` (Anthropic-compatible)

Create a message with explicit thinking control.

**Request**

```bash
curl https://api.avelin.ai/v1/messages \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "avelin-coding-fast",
    "max_tokens": 1024,
    "system": "You are a senior software engineer.",
    "messages": [
      { "role": "user", "content": "Write a Python function to debounce calls." }
    ]
  }'
```

**Common parameters**

| Field | Type | Description |
|---|---|---|
| `model` | string | A public model alias. |
| `max_tokens` | integer | Maximum tokens to generate (required). |
| `messages` | array | Messages with `role` and `content`. |
| `system` | string | System prompt. |
| `thinking` | object | `{ "type": "disabled" }` to turn off extended thinking; enabled by default where supported. |
| `tools` | array | Tool definitions (Anthropic `input_schema` format). |
| `stream` | boolean | `true` for streaming. |

**Response**

```json
{
  "id": "resp_...",
  "type": "message",
  "role": "assistant",
  "model": "avelin-coding-fast",
  "content": [
    { "type": "text", "text": "Here is a debounce helper..." }
  ],
  "stop_reason": "end_turn",
  "usage": { "input_tokens": 18, "output_tokens": 210, "total_tokens": 228 }
}
```

---

### `GET /v1/models`

List the models available to your key.

```bash
curl https://api.avelin.ai/v1/models \
  -H "Authorization: Bearer ***
```

```json
{
  "object": "list",
  "data": [
    { "id": "avelin-ultra", "object": "model", "owned_by": "avelin" },
    { "id": "avelin-pro",   "object": "model", "owned_by": "avelin" },
    { "id": "avelin-fast",  "object": "model", "owned_by": "avelin" }
  ]
}
```

See the [Model Catalog](../models/README.md) for descriptions and capabilities.

---

### `POST /v1/embeddings`

Generate vector embeddings (model: `bge-m3`).

```bash
curl https://api.avelin.ai/v1/embeddings \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -d '{
    "model": "bge-m3",
    "input": "AVELIN is a sovereign AI platform."
  }'
```

```json
{
  "object": "list",
  "data": [
    { "object": "embedding", "index": 0, "embedding": [0.0123, -0.0456, "..."] }
  ],
  "model": "bge-m3",
  "usage": { "prompt_tokens": 9, "total_tokens": 9 }
}
```

---

### `POST /v1/audio/transcriptions`

Transcribe audio to text (models: `whisper-large-v3`, `whisper-large-v3-turbo`).

```bash
curl https://api.avelin.ai/v1/audio/transcriptions \
  -H "Authorization: Bearer *** \
  -F model="whisper-large-v3-turbo" \
  -F file="@meeting.mp3"
```

---

### `POST /v1/images/generations`

Generate images (models: `avelin-imagegen`, `avelin-imagegen-pro`).

```bash
curl https://api.avelin.ai/v1/images/generations \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -d '{
    "model": "avelin-imagegen",
    "prompt": "A minimalist logo for a sovereign AI platform"
  }'
```

---

## Streaming

Set `stream: true` to receive tokens incrementally.

**OpenAI format** (`/v1/chat/completions`) — newline-delimited `data:` lines:

```
data: {"id":"...","object":"chat.completion.chunk","model":"avelin-pro","choices":[{"index":0,"delta":{"reasoning_content":"The"}}]}
data: {"id":"...","object":"chat.completion.chunk","model":"avelin-pro","choices":[{"index":0,"delta":{"content":"Vendor"}}]}
data: [DONE]
```

**Anthropic format** (`/v1/messages`) — Server-Sent Events with `event:` prefixes:

```
event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"thinking","thinking":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":1,"delta":{"type":"text_delta","text":"Hi"}}
```

Thinking/reasoning content streams separately from the final answer text.

---

## Tool & function calling

Both surfaces support tool calling. OpenAI format:

```json
{
  "model": "avelin-agentic-pro",
  "messages": [{ "role": "user", "content": "What's the weather in Abu Dhabi?" }],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {
          "type": "object",
          "properties": { "city": { "type": "string" } },
          "required": ["city"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}
```

The Anthropic surface uses the equivalent `tools` array with `input_schema`.

---

## Reasoning & thinking control

| Goal | OpenAI surface | Anthropic surface |
|---|---|---|
| Request deeper reasoning | `"reasoning_effort": "high"` | enabled by default on supported models |
| Read the model's thinking | `reasoning_content` field in the response | separate `thinking` content block |
| Disable thinking | not applicable (reasoning enabled by default on supported models) | `"thinking": { "type": "disabled" }` |

---

## Errors

Errors follow the OpenAI error shape:

```json
{ "error": { "message": "Invalid API key", "type": "authentication_error", "code": 401 } }
```

| Status | Meaning |
|---|---|
| `400` | Malformed request (bad JSON, missing required field). |
| `401` | Missing or invalid API key. |
| `404` | Unknown model alias or endpoint. |
| `429` | Rate or budget limit reached — back off and retry. |
| `5xx` | Transient inference issue — the platform retries and fails over automatically; retry with backoff. |

---

## Notes & behavior

- Reasoning/thinking is enabled by default on models that support it.
- The platform automatically retries and fails over on transient inference
  errors, so occasional latency spikes are smoothed for you.
- `max_tokens` is respected; responses report `finish_reason: "length"` when the
  limit is reached.
- Pick the model by **capability tier** (see the [Model Catalog](../models/README.md));
  AVELIN's Cross-Model MoE models handle inference with fused intelligence for you.

## Related

- [Quickstart](quickstart.md)
- [SDKs & Tools](sdks.md)
- [Model Catalog](../models/README.md)
- [AVELIN-API platform overview](../systems/avelin-api.md)
