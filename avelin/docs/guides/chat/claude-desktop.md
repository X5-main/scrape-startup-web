# Claude Desktop Integration

AVELIN API can be used with [Claude Desktop](https://claude.ai/download) — Anthropic's official desktop application and the reference client for the Model Context Protocol (MCP). While Claude Desktop natively connects to Anthropic's API, it can be extended with AVELIN models through MCP adapters, giving you access to frontier intelligence with deep tool integration.

> **Why AVELIN + Claude Desktop?** The definitive MCP client connected to AVELIN's frontier models — access tools, databases, file systems, and APIs directly from the chat interface, powered by governed API access with automatic failover.

Claude Desktop is Anthropic's official native desktop application for macOS and Windows, offering a polished chat experience with a focus on productivity and deep system integration. Its defining feature is first-class support for the Model Context Protocol (MCP) — an open standard that lets AI models connect to external tools, databases, file systems, web APIs, and custom services directly from the conversation. MCP transforms the chat from a simple Q&A interface into a full-featured agent workspace where the model can read your files, query your databases, call your APIs, and interact with your development environment.

The killer feature is MCP integration as a first-class citizen. While other chat apps bolt on tool support as an afterthought, Claude Desktop was designed around it. Add an MCP server for your Postgres database, and the model can query it. Add one for your GitHub repos, and it can read PRs and issues. Add one for your file system, and it can work with your documents directly. Combined with AVELIN as a backend via MCP adapters, you get this powerful tool ecosystem with AVELIN's frontier models and governed API infrastructure.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Claude Desktop

Download from [claude.ai/download](https://claude.ai/download) for macOS or Windows.

### Step 3: Configure MCP Adapter for AVELIN

Claude Desktop uses a configuration file to register MCP servers. Open the config:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add an OpenAI-compatible MCP adapter pointing to AVELIN:

```json
{
  "mcpServers": {
    "avelin-adapter": {
      "command": "npx",
      "args": [
        "-y",
        "@anthropic/mcp-adapter",
        "--provider", "openai",
        "--base-url", "https://api.avelin.ai/v1",
        "--api-key", "sk-ave...xxxx",
        "--model", "avelin-pro"
      ]
    }
  }
}
```

### Step 4: Start Chatting

1. Restart Claude Desktop after editing the config
2. Open a new conversation
3. The AVELIN adapter appears as an available MCP server
4. Claude can now route tasks through AVELIN models when appropriate

---

## Recommended Models

### For Tool Use: `avelin-agentic-ultra`

| Feature | avelin-agentic-ultra | Why it matters for Claude Desktop |
|---|---|---|
| **Tool use** | Excellent | Excels at MCP tool calls and multi-step workflows |
| **Context window** | **256K tokens** | Room for tool results and extended conversations |
| **Function calling** | Native | Seamless integration with MCP server protocol |

### For Analysis: `avelin-coding-pro`

| Feature | avelin-coding-pro | Why it matters for Claude Desktop |
|---|---|---|
| **Context window** | **1M tokens** | Process large files from MCP filesystem servers |
| **Max output** | **65K tokens** | Generate comprehensive analysis and code |
| **Reasoning** | Deep step-by-step | Complex multi-tool reasoning chains |

### Quick Reference

| Use case | Model |
|---|---|
| Tool-heavy workflows | `avelin-agentic-ultra` |
| Code generation & review | `avelin-coding-pro` |
| General conversation | `avelin-pro` |
| Complex reasoning | `avelin-ultra` |
| Fast tool responses | `avelin-agentic-fast` |
| Architecture & design | `avelin-coding-ultra` |

---

## Why AVELIN for Claude Desktop?

- **MCP synergy**: AVELIN's agentic models are designed for tool use, matching MCP's philosophy
- **Prompt caching**: ~80% cost reduction on repeated contexts across long sessions
- **Automatic failover**: MCP workflows continue even if a provider has issues
- **1M-token context**: Process large files and datasets surfaced by MCP servers
- **Governed access**: Enterprise-grade reliability for production MCP workflows

---

## Advanced Configuration

### Multiple MCP Servers

Combine AVELIN with other MCP servers for powerful workflows:

```json
{
  "mcpServers": {
    "avelin-adapter": {
      "command": "npx",
      "args": [
        "-y",
        "@anthropic/mcp-adapter",
        "--provider", "openai",
        "--base-url", "https://api.avelin.ai/v1",
        "--api-key", "sk-ave...xxxx",
        "--model", "avelin-agentic-ultra"
      ]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/you/Documents"
      ]
    },
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://user:pass@localhost:5432/mydb"
      ]
    }
  }
}
```

### Model Selection via MCP

Different MCP servers can use different AVELIN models:

```json
{
  "mcpServers": {
    "avelin-coding-fast": {
      "command": "npx",
      "args": [
        "-y",
        "@anthropic/mcp-adapter",
        "--provider", "openai",
        "--base-url", "https://api.avelin.ai/v1",
        "--api-key", "sk-ave...xxxx",
        "--model", "avelin-coding-pro"
      ]
    },
    "avelin-fast-tools": {
      "command": "npx",
      "args": [
        "-y",
        "@anthropic/mcp-adapter",
        "--provider", "openai",
        "--base-url", "https://api.avelin.ai/v1",
        "--api-key", "sk-ave...xxxx",
        "--model", "avelin-agentic-fast"
      ]
    }
  }
}
```

### Using AVELIN as Anthropic-Compatible Endpoint

Claude Desktop natively speaks Anthropic's API protocol. You can point certain MCP adapters to AVELIN's Anthropic-compatible endpoint:

| Endpoint | Base URL |
|---|---|
| OpenAI-compatible | `https://api.avelin.ai/v1` |
| Anthropic-compatible | `https://api.avelin.ai` |

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **MCP server not appearing** | Restart Claude Desktop after editing config |
| **"Invalid API key"** | Verify key starts with `sk-ave` in the config JSON |
| **Adapter fails to start** | Ensure Node.js is installed; run `npx` manually to check |
| **Tool calls timing out** | Switch to `avelin-agentic-fast` for lower latency |
| **Config syntax error** | Validate JSON at jsonlint.com before saving |
| **Permission denied** | On macOS, grant Claude Desktop Full Disk Access in System Settings |
| **Model not responding** | Check model name spelling; valid names are in the [Model Catalog](../../models/README.md) |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [OpenRouter MCP Guide](../frameworks/openrouter-mcp.md) — MCP framework integration
- [Open WebUI Guide](open-webui.md) — Self-hosted chat alternative
- [Model Catalog](../../models/README.md) — Full model comparison
- [Claude Desktop](https://claude.ai/download) — Download the app
- [MCP Specification](https://modelcontextprotocol.io) — Protocol documentation
