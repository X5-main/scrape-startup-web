# AVELIN API Reference

Complete reference for all public AVELIN API endpoints.

AVELIN is an **AI Laboratory** that builds Cross-Model MoE (Mixture-of-Experts) models — trained AI systems that fuse knowledge from multiple model architectures into single unified models. We build and fuse models, we don't just route them. The API serves frontier AI through a single API-first endpoint with our **Cross-Model MoE** technology. The API is a **drop-in replacement**: change only 2 lines of code (base URL and API key) to migrate from OpenAI or Anthropic.

**Enterprise licensing available:** Deploy AVELIN models on your own GPUs with full data sovereignty. Contact us for enterprise licensing options.

## Base URL

```
https://api.avelin.ai
```

All endpoints are served under the `/v1` path prefix unless otherwise noted.

## Authentication

All API requests require a bearer token:

```
Authorization: Bearer ***
```

Keys are issued and managed from your AVELIN account. Use separate keys per application or environment for independent spend tracking and rotation.

---

## Chat Completions

### `POST /v1/chat/completions` (OpenAI-compatible)

Create a chat completion. This is the primary endpoint for conversational AI workloads.

**Request**

```bash
curl https://api.avelin.ai/v1/chat/completions \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -d '{
    "model": "avelin-pro",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Explain quantum computing."}
    ],
    "max_tokens": 2048,
    "temperature": 0.7
  }'
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Model alias (e.g., `avelin-pro`, `avelin-ultra`, `avelin-coding-fast`). See [Model Catalog](../models/README.md). |
| `messages` | array | Yes | Conversation messages. Each message has `role` (`system`, `user`, `assistant`) and `content` (string or array). |
| `max_tokens` | integer | No | Maximum tokens to generate. Model-specific limits apply. |
| `temperature` | float | No | Sampling temperature (0.0-2.0). Lower = more deterministic. |
| `top_p` | float | No | Nucleus sampling parameter (0.0-1.0). Alternative to temperature. |
| `stream` | boolean | No | If `true`, stream tokens as Server-Sent Events. |
| `tools` | array | No | Tool/function definitions for function calling. |
| `tool_choice` | string | No | `"auto"`, `"none"`, or specific tool name. |
| `reasoning_effort` | string | No | `"high"` for deeper reasoning on supported models. |
| `stop` | string/array | No | Stop sequences (up to 4). |
| `n` | integer | No | Number of completions to generate (default: 1). |
| `presence_penalty` | float | No | Penalize tokens based on presence (-2.0 to 2.0). |
| `frequency_penalty` | float | No | Penalize tokens based on frequency (-2.0 to 2.0). |

**Response**

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1704067200,
  "model": "avelin-pro",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Quantum computing leverages quantum mechanics...",
        "reasoning_content": "The user is asking about quantum computing..."
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

**Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique completion ID. |
| `object` | string | Always `"chat.completion"`. |
| `created` | integer | Unix timestamp. |
| `model` | string | Model used (matches request). |
| `choices` | array | Array of completion choices. |
| `choices[].message` | object | The generated message. |
| `choices[].message.content` | string | The response text. |
| `choices[].message.reasoning_content` | string | Model's reasoning (if enabled). |
| `choices[].finish_reason` | string | `"stop"`, `"length"`, `"tool_calls"`, or `"content_filter"`. |
| `usage` | object | Token usage statistics. |

---

### `POST /v1/messages` (Anthropic-compatible)

Create a message with explicit thinking control. Use this for Anthropic SDK compatibility or fine-grained reasoning control.

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
      {"role": "user", "content": "Write a Python function to debounce calls."}
    ]
  }'
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Model alias. |
| `max_tokens` | integer | Yes | Maximum tokens to generate. |
| `messages` | array | Yes | Conversation messages with `role` and `content`. |
| `system` | string | No | System prompt. |
| `thinking` | object | No | `{"type": "disabled"}` to turn off thinking. Enabled by default on supported models. |
| `tools` | array | No | Tool definitions with `input_schema`. |
| `stream` | boolean | No | If `true`, stream as Server-Sent Events. |
| `temperature` | float | No | Sampling temperature. |
| `top_p` | float | No | Nucleus sampling. |
| `top_k` | integer | No | Top-k sampling. |
| `stop_sequences` | array | No | Stop sequences. |

**Response**

```json
{
  "id": "msg_abc123",
  "type": "message",
  "role": "assistant",
  "model": "avelin-coding-fast",
  "content": [
    {"type": "text", "text": "Here is a debounce helper..."}
  ],
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 18,
    "output_tokens": 210,
    "total_tokens": 228
  }
}
```

---

## Models

### `GET /v1/models`

List all models available to your API key.

**Request**

```bash
curl https://api.avelin.ai/v1/models \
  -H "Authorization: Bearer ***
```

**Response**

```json
{
  "object": "list",
  "data": [
    {
      "id": "avelin-ultra",
      "object": "model",
      "created": 1704067200,
      "owned_by": "avelin"
    },
    {
      "id": "avelin-pro",
      "object": "model",
      "created": 1704067200,
      "owned_by": "avelin"
    },
    {
      "id": "avelin-fast",
      "object": "model",
      "created": 1704067200,
      "owned_by": "avelin"
    }
  ]
}
```

See the [Model Catalog](../models/README.md) for detailed descriptions and capabilities.

### Model Tiers & AA Index Scores

All models are built with AVELIN's Cross-Model MoE technology in our AI Lab. AA Index scores measure overall capability across reasoning, coding, and agentic tasks:

**Intelligence Family** (up to 85% cost reduction vs. direct providers):
- `avelin-ultra` — AA Index: **55** — Deepest reasoning, strategic analysis
- `avelin-pro` — AA Index: **53** — Balanced performance and quality
- `avelin-fast` — AA Index: **47** — High-volume, low-latency tasks

**Coding Family** (up to 86% cost reduction vs. direct providers):
- `avelin-coding-fast` — AA Index: **42** — Software development, code generation
- `avelin-coding-pro` — AA Index: **49** — Extended context, agentic coding
- `avelin-coding-ultra` — AA Index: **52** — System design, architecture

**Agentic Family** (up to 87% cost reduction vs. direct providers):
- `avelin-agentic-pro` — AA Index: **67** — Multi-step workflows, tool use
- `avelin-agentic-ultra` — AA Index: **67** — Complex automation, long-horizon tasks
- `avelin-agentic-fast` — AA Index: **38** — High-volume agentic workloads

---

## Embeddings

### `POST /v1/embeddings`

Generate vector embeddings for text. Useful for semantic search, clustering, and RAG applications.

**Request**

```bash
curl https://api.avelin.ai/v1/embeddings \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -d '{
    "model": "bge-m3",
    "input": "AVELIN is a sovereign AI platform."
  }'
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Embedding model (`bge-m3`). |
| `input` | string/array | Yes | Text to embed. Can be a single string or array of strings. |
| `encoding_format` | string | No | `"float"` (default) or `"base64"`. |

**Response**

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [0.0123, -0.0456, 0.0789, "..."]
    }
  ],
  "model": "bge-m3",
  "usage": {
    "prompt_tokens": 9,
    "total_tokens": 9
  }
}
```

**bge-m3 Specifications:**
- Dimensions: 1024
- Max tokens: 8192
- Multilingual support
- Optimized for retrieval tasks

---

## Audio

### `POST /v1/audio/transcriptions`

Transcribe audio to text using Whisper models.

**Request**

```bash
curl https://api.avelin.ai/v1/audio/transcriptions \
  -H "Authorization: Bearer *** \
  -F model="whisper-large-v3-turbo" \
  -F file="@meeting.mp3" \
  -F language="en"
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | `whisper-large-v3` or `whisper-large-v3-turbo`. |
| `file` | file | Yes | Audio file (mp3, mp4, mpeg, mpga, m4a, wav, webm). Max 25MB. |
| `language` | string | No | ISO-639-1 language code for improved accuracy. |
| `prompt` | string | No | Optional prompt to guide style/continuation. |
| `response_format` | string | No | `"json"` (default), `"text"`, `"srt"`, `"verbose_json"`, `"vtt"`. |
| `temperature` | float | No | Sampling temperature (0.0-1.0). |

**Response (JSON)**

```json
{
  "text": "The full transcription of the audio file..."
}
```

**Model Comparison:**

| Model | Speed | Accuracy | Use Case |
|-------|-------|----------|----------|
| `whisper-large-v3` | Standard | Highest | Maximum accuracy, batch processing |
| `whisper-large-v3-turbo` | Fast | High | Real-time transcription, high volume |

---

## Images

### `POST /v1/images/generations`

Generate images from text prompts.

**Request**

```bash
curl https://api.avelin.ai/v1/images/generations \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -d '{
    "model": "avelin-imagegen",
    "prompt": "A minimalist logo for a sovereign AI platform",
    "n": 1,
    "size": "1024x1024"
  }'
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | `avelin-imagegen` or `avelin-imagegen-pro`. |
| `prompt` | string | Yes | Text description of the image to generate. |
| `n` | integer | No | Number of images to generate (1-4, default: 1). |
| `size` | string | No | Image size: `"256x256"`, `"512x512"`, `"1024x1024"`, `"1024x1792"`, `"1792x1024"`. |
| `quality` | string | No | `"standard"` or `"hd"` (pro model only). |
| `style` | string | No | `"vivid"` or `"natural"`. |
| `response_format` | string | No | `"url"` (default) or `"b64_json"`. |

**Response**

```json
{
  "created": 1704067200,
  "data": [
    {
      "url": "https://..."
    }
  ]
}
```

**Model Comparison:**

| Model | Quality | Speed | Use Case |
|-------|---------|-------|----------|
| `avelin-imagegen` | Standard | Fast | Quick iterations, prototypes |
| `avelin-imagegen-pro` | High | Standard | Production assets, high quality |

See [Pricing](../pricing.md) for current pricing.

---

## Web Intelligence (Firecrawl-compatible)

AVELIN exposes a Firecrawl-compatible web data layer under `/v2` — `scrape`, `search`,
`map`, `crawl`, and `extract` — authenticated with the same AVELIN key and billed per
request. It is drop-in compatible with the official Firecrawl SDK (point
`FIRECRAWL_API_URL` at AVELIN).

```bash
curl https://api.avelin.ai/v2/scrape \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -d '{ "url": "https://example.com", "formats": ["markdown"] }'
```

See the [Web Intelligence API](web-scraping.md) for the full endpoint reference, SDK
usage, and pricing.

---

## Streaming

Set `stream: true` to receive tokens incrementally as they're generated.

### OpenAI Format (`/v1/chat/completions`)

Server-Sent Events with `data:` lines:

```
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","created":1704067200,"model":"avelin-pro","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","created":1704067200,"model":"avelin-pro","choices":[{"index":0,"delta":{"reasoning_content":"The user"},"finish_reason":null}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","created":1704067200,"model":"avelin-pro","choices":[{"index":0,"delta":{"content":"Vendor-neutral"},"finish_reason":null}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","created":1704067200,"model":"avelin-pro","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

**Usage:** Each chunk contains a `delta` object with incremental content. Concatenate `delta.content` and `delta.reasoning_content` to build the full response.

### Anthropic Format (`/v1/messages`)

Server-Sent Events with `event:` prefixes:

```
event: message_start
data: {"type":"message_start","message":{"id":"msg_...","type":"message","role":"assistant","content":[],"model":"avelin-coding-fast","stop_reason":null,"usage":{"input_tokens":18,"output_tokens":1}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"thinking","thinking":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"thinking_delta","thinking":"The user wants"}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: content_block_start
data: {"type":"content_block_start","index":1,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":1,"delta":{"type":"text_delta","text":"Here is a debounce helper..."}}

event: content_block_stop
data: {"type":"content_block_stop","index":1}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":210}}

event: message_stop
data: {"type":"message_stop"}
```

**Usage:** Parse events to build the complete message. Thinking content comes first, followed by text content.

---

## Tool & Function Calling

Both OpenAI and Anthropic surfaces support tool calling for structured outputs and external integrations.

### OpenAI Format

```json
{
  "model": "avelin-agentic-pro",
  "messages": [
    {"role": "user", "content": "What's the weather in Abu Dhabi?"}
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {
          "type": "object",
          "properties": {
            "city": {
              "type": "string",
              "description": "City name"
            }
          },
          "required": ["city"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}
```

**Response with tool call:**

```json
{
  "id": "chatcmpl-...",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call_abc123",
            "type": "function",
            "function": {
              "name": "get_weather",
              "arguments": "{\"city\": \"Abu Dhabi\"}"
            }
          }
        ]
      },
      "finish_reason": "tool_calls"
    }
  ]
}
```

### Anthropic Format

```json
{
  "model": "avelin-agentic-pro",
  "max_tokens": 1024,
  "messages": [
    {"role": "user", "content": "What's the weather in Abu Dhabi?"}
  ],
  "tools": [
    {
      "name": "get_weather",
      "description": "Get current weather for a city",
      "input_schema": {
        "type": "object",
        "properties": {
          "city": {
            "type": "string",
            "description": "City name"
          }
        },
        "required": ["city"]
      }
    }
  ]
}
```

**Response with tool use:**

```json
{
  "id": "msg_...",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "tool_use",
      "id": "toolu_abc123",
      "name": "get_weather",
      "input": {"city": "Abu Dhabi"}
    }
  ],
  "stop_reason": "tool_use"
}
```

---

## Reasoning & Thinking Control

AVELIN models support extended reasoning for complex tasks. Our Cross-Model MoE technology optimizes reasoning paths across multiple model architectures fused in our AI Lab. Control reasoning depth and access the model's thinking process.

### Requesting Deeper Reasoning

**OpenAI surface:**
```json
{
  "model": "avelin-ultra",
  "messages": [...],
  "reasoning_effort": "high"
}
```

**Anthropic surface:**
Thinking is enabled by default on supported models. Disable with:
```json
{
  "model": "avelin-coding-fast",
  "max_tokens": 1024,
  "messages": [...],
  "thinking": {"type": "disabled"}
}
```

### Accessing Reasoning Content

**OpenAI surface:**
```json
{
  "choices": [
    {
      "message": {
        "content": "Final answer...",
        "reasoning_content": "Step-by-step thinking process..."
      }
    }
  ]
}
```

**Anthropic surface:**
```json
{
  "content": [
    {"type": "thinking", "thinking": "Step-by-step thinking process..."},
    {"type": "text", "text": "Final answer..."}
  ]
}
```

### Model Reasoning Support

| Model | AA Index | Reasoning Support | Default |
|-------|----------|-------------------|---------|
| avelin-ultra | 55 | ✅ Full | Enabled |
| avelin-pro | 53 | ✅ Full | Enabled |
| avelin-fast | 47 | ❌ Not supported | Disabled |
| avelin-coding-fast | 42 | ✅ Full | Enabled |
| avelin-coding-pro | 49 | ✅ Full | Enabled |
| avelin-coding-ultra | 52 | ✅ Full | Enabled |
| avelin-agentic-pro | 67 | ✅ Full | Enabled |
| avelin-agentic-ultra | 67 | ✅ Full | Enabled |
| avelin-agentic-fast | 38 | ✅ Full | Enabled |

---

## Error Handling

All errors follow the OpenAI error format:

```json
{
  "error": {
    "message": "Invalid API key provided",
    "type": "authentication_error",
    "code": 401
  }
}
```

### HTTP Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| `200` | Success | Process response. |
| `400` | Bad Request | Check request format and parameters. |
| `401` | Unauthorized | Verify API key is valid and has access. |
| `403` | Forbidden | API key lacks permission for this operation. |
| `404` | Not Found | Unknown model or endpoint. |
| `429` | Rate Limited | Back off and retry with exponential delay. |
| `500` | Server Error | Retry with backoff. Platform handles failover automatically. |
| `502` | Bad Gateway | Retry with backoff. |
| `503` | Service Unavailable | Retry with backoff. |
| `504` | Gateway Timeout | Retry with backoff. |

### Common Errors

**Invalid API Key**
```json
{
  "error": {
    "message": "Invalid API key provided",
    "type": "authentication_error",
    "code": 401
  }
}
```

**Model Not Found**
```json
{
  "error": {
    "message": "The model 'invalid-model' does not exist",
    "type": "invalid_request_error",
    "code": 404
  }
}
```

**Rate Limited**
```json
{
  "error": {
    "message": "Rate limit reached. Please try again later.",
    "type": "rate_limit_error",
    "code": 429
  }
}
```

**Context Length Exceeded**
```json
{
  "error": {
    "message": "This model's maximum context length is 256000 tokens, but you requested 300000 tokens",
    "type": "invalid_request_error",
    "code": 400
  }
}
```

### Retry Strategy

For `429` and `5xx` errors, implement exponential backoff:

```python
import time
import random

def retry_with_backoff(func, max_retries=5):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            
            # Exponential backoff with jitter
            delay = (2 ** attempt) + random.uniform(0, 1)
            time.sleep(delay)
```

---

## Rate Limits

Rate limits are applied per API key and vary by model and plan.

### Default Limits

| Model | AA Index | Requests per Minute | Tokens per Minute |
|-------|----------|---------------------|-------------------|
| avelin-ultra | 55 | 60 | 100,000 |
| avelin-pro | 53 | 120 | 200,000 |
| avelin-fast | 47 | 240 | 400,000 |
| avelin-coding-fast | 42 | 120 | 200,000 |
| avelin-coding-pro | 49 | 120 | 200,000 |
| avelin-coding-ultra | 52 | 60 | 100,000 |
| avelin-agentic-pro | 67 | 120 | 200,000 |
| avelin-agentic-ultra | 67 | 60 | 100,000 |
| avelin-agentic-fast | 38 | 240 | 400,000 |
| bge-m3 | — | 600 | 1,000,000 |
| whisper-large-v3 | — | 60 | N/A |
| avelin-imagegen | — | 60 | N/A |

### Rate Limit Headers

When rate limited, check response headers:

```
X-RateLimit-Limit-Requests: 120
X-RateLimit-Remaining-Requests: 0
X-RateLimit-Reset-Requests: 1704067260
```

### Handling Rate Limits

1. **Check headers** for remaining quota
2. **Implement backoff** on 429 responses
3. **Distribute load** across multiple API keys if needed
4. **Use appropriate model tier** for your workload (e.g., `avelin-fast` for high-volume, simple tasks)

---

## Best Practices

### Model Selection

- **avelin-ultra** (AA Index: 55): Complex reasoning, strategic analysis, high-stakes decisions
- **avelin-pro** (AA Index: 53): Balanced performance and quality, daily workflows
- **avelin-fast** (AA Index: 47): High-volume, simple tasks, real-time applications
- **avelin-coding-fast** (AA Index: 42): Software development, code generation
- **avelin-agentic-pro** (AA Index: 67): Multi-step workflows, tool use, automation

### Cost Optimization

AVELIN delivers significant cost savings through Cross-Model MoE:
- **Intelligence family**: up to 85% cheaper than direct providers
- **Coding family**: up to 86% cheaper than direct providers
- **Agentic family**: up to 87% cheaper than direct providers

1. **Use the right model tier** - Don't use `avelin-ultra` for simple Q&A
2. **Enable prompt caching** - Reduces costs for repeated prompts (supported models only)
3. **Optimize token usage** - Be concise in prompts, use appropriate `max_tokens`
4. **Monitor usage** - Track spend per API key and model

### Performance Optimization

1. **Enable streaming** for interactive applications
2. **Use appropriate temperature** - Lower for deterministic tasks, higher for creative tasks
3. **Leverage system messages** - Set context once, reuse across conversations
4. **Batch requests** when possible (embeddings support batch input)

### Error Handling

1. **Always check HTTP status codes** before processing responses
2. **Implement retry logic** with exponential backoff for transient errors
3. **Log errors** with request IDs for debugging
4. **Monitor rate limits** and adjust request patterns accordingly

### Security

1. **Never expose API keys** in client-side code or public repositories
2. **Use environment variables** for key storage
3. **Rotate keys regularly** and use separate keys per environment
4. **Monitor usage** for unexpected patterns

---

## Related Documentation

- [Quickstart](quickstart.md) - Get started in 5 minutes
- [SDKs & Tools](sdks.md) - Integration guides for popular SDKs
- [Model Catalog](../models/README.md) - Detailed model descriptions
- [How AVELIN Works](../systems/how-it-works.md) - Technical architecture
- [Benchmark Results](../benefits/benchmark-results.md) - Performance data
