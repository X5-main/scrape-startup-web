# Browser Use Integration

AVELIN API works with [Browser Use](https://browser-use.com) — an open-source browser automation agent driven by LLMs via Chrome DevTools Protocol. With 92K+ GitHub stars and YC W25 backing, Browser Use lets any LLM execute real web tasks autonomously.

Browser Use is not a simulated browser or a scraping library — it drives a real Chrome instance via CDP (Chrome DevTools Protocol), clicking buttons, filling forms, navigating pages, and extracting data from live websites. Any LLM can be the "brain": you point it at Browser Use and it figures out the DOM, plans multi-step actions, and executes them. The killer feature is universality — if a human can do it in Chrome, Browser Use can automate it. With 92K GitHub stars and YC W25 backing, it's the most popular open-source browser automation framework, and it works with any OpenAI-compatible model.

> **Why AVELIN + Browser Use?** Give Browser Use access to frontier reasoning models with 1M-token context windows, automatic failover, and competitive pricing — all through a single OpenAI-compatible endpoint.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Browser Use

```bash
pip install browser-use
playwright install chromium
```

### Step 3: Configure Browser Use

Set AVELIN as your LLM provider via environment variables:

```bash
export OPENAI_API_BASE=https://api.avelin.ai/v1
export OPENAI_API_KEY=*** Step 4: Run Your First Task

```python
from langchain_openai import ChatOpenAI
from browser_use import Agent
import asyncio

llm = ChatOpenAI(
    base_url="https://api.avelin.ai/v1",
    api_key="***,
    model="avelin-agentic-ultra",
)

async def main():
    agent = Agent(
        task="Go to Hacker News and summarize the top 5 stories",
        llm=llm,
    )
    result = await agent.run()
    print(result)

asyncio.run(main())
```

---

## Recommended Models

### Primary: `avelin-agentic-ultra`

| Feature | avelin-agentic-ultra | Why it matters for Browser Use |
|---|---|---|
| **Context window** | **1M tokens** | Track complex multi-page navigation |
| **Reasoning** | Top-tier | Understand page structure, plan multi-step tasks |
| **Tool calling** | First-class | Reliable CDP action selection |

### Alternatives

| Model | When to use |
|---|---|
| `avelin-agentic-pro` | Standard automation tasks — lower cost |
| `avelin-agentic-fast` | High-volume simple tasks — lowest cost |
| `avelin-coding-pro` | Code-heavy web scraping and data extraction |
| `avelin-ultra` | Complex multi-step research workflows |

---

## Why AVELIN for Browser Use?

- **Agentic models**: Purpose-built for tool-calling and multi-step planning
- **Automatic failover**: Browser tasks keep running even if a provider is down
- **1M context**: Track entire browsing sessions without losing context
- **Cost optimization**: Prompt caching reduces repeated system prompt costs by ~80%

---

## Example Workflows

### Web Research

```python
agent = Agent(
    task="Research the top 5 competitors in the AI code editor space. For each, find: name, pricing, key features, and target audience.",
    llm=llm,
)
```

### Form Filling & Data Entry

```python
agent = Agent(
    task="Log into the dashboard at example.com and fill out the monthly report form with the provided data.",
    llm=llm,
)
```

### Monitoring & Alerts

```python
agent = Agent(
    task="Check the status page at status.example.com. If any service shows degraded, summarize which ones and when.",
    llm=llm,
)
```

---

## Advanced Configuration

### Using LangChain

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    base_url="https://api.avelin.ai/v1",
    api_key="***,
    model="avelin-agentic-ultra",
    temperature=0.1,  # low for reliable automation
    max_tokens=65536,
)
```

### Cost Management

For high-volume automation, use tiered model selection:

```python
# Simple tasks — fast/cheap
simple_llm = ChatOpenAI(
    base_url="https://api.avelin.ai/v1",
    api_key="***,
    model="avelin-agentic-fast",
)

# Complex tasks — powerful
complex_llm = ChatOpenAI(
    base_url="https://api.avelin.ai/v1",
    api_key="***,
    model="avelin-agentic-ultra",
)
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **Agent loops endlessly** | Lower temperature to 0.0-0.1, use `avelin-agentic-ultra` |
| **Slow page actions** | Add explicit waits in task description |
| **Token limit reached** | Break task into smaller steps |
| **API key error** | Verify `OPENAI_API_BASE` includes `/v1` |
| **Tool call failures** | Use `avelin-agentic-ultra` for best tool-calling reliability |

---

## Related

- [API Quickstart](../api/quickstart.md) — First API call in 5 minutes
- [OpenClaw Guide](coding/openclaw.md) — Multi-service automation
- [Agentic Models](../models/avelin-agentic-ultra.md) — Model details
- [Browser Use Docs](https://docs.browser-use.com) — Official documentation
