# SDKs & Tools

AVELIN is an **AI Laboratory** that builds Cross-Model MoE (Mixture-of-Experts) models — trained AI systems that fuse knowledge from multiple model architectures into single unified models. We build and fuse models, we don't just route them. Our Cross-Model MoE technology delivers superior results while maintaining full compatibility with existing SDKs, CLIs, and editor integrations.

**Enterprise licensing available:** Deploy AVELIN models on your own GPUs with full data sovereignty. Contact us for enterprise licensing options.

Migration is a **drop-in replacement**: change only **2 lines of code** — the base URL and API key.

> In every example, replace `sk-ave...xxxx` with your own key, or
> read it from an environment variable such as `AVELIN_API_KEY`.

---

## OpenAI SDK (Python)

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.avelin.ai/v1",
    api_key="sk-avelin-xxxxxxxxxxxxxxxx",
)

resp = client.chat.completions.create(
    model="avelin-coding-fast",
    messages=[{"role": "user", "content": "Refactor this loop for readability."}],
)
print(resp.choices[0].message.content)
```

Embeddings with the same client:

```python
emb = client.embeddings.create(model="bge-m3", input="vector me")
print(len(emb.data[0].embedding))
```

## OpenAI SDK (JavaScript / TypeScript)

```ts
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.avelin.ai/v1",
  apiKey: process.env.AVELIN_API_KEY,
});

const resp = await client.chat.completions.create({
  model: "avelin-coding-fast",
  messages: [{ role: "user", content: "Refactor this loop for readability." }],
});
console.log(resp.choices[0].message.content);
```

## Anthropic SDK (Python)

Use the Anthropic-compatible surface for fine-grained thinking control.

```python
from anthropic import Anthropic

client = Anthropic(
    base_url="https://api.avelin.ai",
    api_key="sk-avelin-xxxxxxxxxxxxxxxx",
)

msg = client.messages.create(
    model="avelin-coding-fast",
    max_tokens=1024,
    system="You are a senior software engineer.",
    messages=[{"role": "user", "content": "Write a debounce decorator."}],
)
print(msg.content[0].text)
```

To disable extended thinking, add `thinking={"type": "disabled"}`.

---

## CLI tools

Many AI CLIs accept a custom OpenAI- or Anthropic-compatible endpoint. Point
them at `https://api.avelin.ai` with your key.

### Hermes Agent (Recommended)

[Hermes Agent](https://hermes-agent.nousresearch.com) by Nous Research is an
open-source CLI AI assistant with terminal-native workflows, persistent memory,
multi-agent delegation, and long-horizon agentic coding. AVELIN is the
recommended backend — see the full [Hermes integration guide](../guides/hermes.md)
for setup instructions.

```yaml
# ~/.hermes/config.yaml
model:
  default: avelin-coding-pro
  provider: custom
  base_url: https://api.avelin.ai
  context_length: 1000000
  max_tokens: 65536
```

We recommend `avelin-coding-pro` for long-term agentic coding sessions —
1M-token context, ~100 tps throughput, deep reasoning, and first-class tool calling.

### AI Code CLI

Anthropic-compatible configuration (recommended for thinking support):

```toml
[providers.avelin]
type = "anthropic"
base_url = "https://api.avelin.ai/v1"
api_key = "sk-avelin-xxxxxxxxxxxxxxxx"

[models.avelin-coding-ultra]
provider = "avelin"
model = "avelin-coding-ultra"
max_context_size = 1000000
capabilities = ["thinking"]

[models.avelin-coding-fast]
provider = "avelin"
model = "avelin-coding-fast"
max_context_size = 1000000
capabilities = ["thinking"]

default_model = "avelin-coding-ultra"
```

OpenAI-compatible configuration (legacy clients):

```toml
[providers.avelin]
type = "openai_legacy"
base_url = "https://api.avelin.ai/v1"
api_key = "sk-avelin-xxxxxxxxxxxxxxxx"

[models.avelin-coding-fast]
provider = "avelin"
model = "avelin-coding-fast"
max_context_size = 1000000
capabilities = ["thinking"]

default_model = "avelin-coding-fast"
```

### Generic OpenAI-compatible tools

For any tool that asks for an "OpenAI base URL" and key:

```
Base URL:  https://api.avelin.ai/v1
API Key:   sk-avelin-xxxxxxxxxxxxxxxx
Model:     avelin-pro   (or any public alias)
```

---

## Choosing a surface

| You are using… | Use this surface | Base URL |
|---|---|---|
| OpenAI SDK / OpenAI-compatible tool | OpenAI | `https://api.avelin.ai/v1` |
| Anthropic SDK / Claude-style client | Anthropic | `https://api.avelin.ai` |

Both are backed by the same Cross-Model MoE models built in our AI Lab — switching between surfaces is a **2-line change**.

## Model selection guide

| Model | AA Index | Best for | Context |
|-------|----------|----------|---------|
| `avelin-ultra` | 55 | Complex reasoning, strategic analysis | 256K |
| `avelin-pro` | 53 | Balanced performance and quality | 256K |
| `avelin-fast` | 47 | High-volume, low-latency tasks | 256K |
| `avelin-coding-fast` | 42 | Code generation | 1M |
| `avelin-coding-pro` | 49 | Agentic coding sessions | 1M |
| `avelin-coding-ultra` | 52 | System design, architecture | 1M |
| `avelin-agentic-pro` | 67 | Multi-step tool-use workflows | 256K |
| `avelin-agentic-ultra` | 67 | Complex automation, long-horizon tasks | 256K |
| `avelin-agentic-fast` | 38 | High-volume agentic workloads | 256K |

**Cost savings vs. direct providers:**
- Intelligence family (fast/pro/ultra): **up to 85% cheaper**
- Coding family (coding-fast/coding-pro/coding-ultra): **up to 86% cheaper**
- Agentic family (agentic-fast/agentic-pro/agentic-ultra): **up to 87% cheaper**

See the [API Reference](index.md) for the full parameter set and the [Model Catalog](../models/README.md) for detailed capabilities.
