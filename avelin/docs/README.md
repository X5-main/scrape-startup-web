# AVELIN Documentation

Welcome to AVELIN — a sovereign AI platform that gives you access to the world's best AI models through a single, governed API.

This documentation helps you get started, choose the right model, integrate with your tools, and understand the platform.

---

## 🚀 Quick Start

New to AVELIN? Start here.

- **[API Quickstart](api/quickstart.md)** — Make your first API call in under 5 minutes
- **[Platform Overview](platform-overview.md)** — What AVELIN is and how it works
- **[Pricing](pricing.md)** — Transparent per-token pricing for all models

---

## 🤖 AI Models

AVELIN offers 9 specialized models across 4 families. Each model is optimized for specific use cases.

### [Model Catalog](models/README.md)
Complete model comparison with context windows, max output, capabilities, and selection guidance.

#### Intelligence Models (256K context)
For reasoning, analysis, and multimodal tasks.

- **[avelin-ultra](models/avelin-ultra.md)** — Flagship reasoning for complex decisions and strategic analysis
- **[avelin-pro](models/avelin-pro.md)** — High-efficiency reasoning for daily workflows and production economics
- **[avelin-fast](models/avelin-fast.md)** — Low-latency responses for real-time chat and high-volume workloads

#### Coding Models (1M context)
For software engineering, debugging, and code generation.

- **[avelin-coding-fast](models/avelin-coding-fast.md)** — Balanced engineering tier for daily development
- **[avelin-coding-pro](models/avelin-coding-pro.md)** — High-throughput coding for production workloads
- **[avelin-coding-ultra](models/avelin-coding-ultra.md)** — Deep reasoning for system design and architecture

#### Agentic Models (256K context)
For autonomous agents, tool calling, and multi-step workflows.

- **[avelin-agentic-pro](models/avelin-agentic-pro.md)** — Standard agentic tier for tool-calling workflows
- **[avelin-agentic-ultra](models/avelin-agentic-ultra.md)** — Top-tier reasoning for complex multi-step planning
- **[avelin-agentic-fast](models/avelin-agentic-fast.md)** — Cost-optimized for high-volume agent swarms

#### Utility Models
Specialized models for embeddings, transcription, text-to-speech, and image generation.

- **[Utility Models](models/utility-models.md)** — Embeddings (bge-m3), transcription (whisper, avelin-stt), text-to-speech (tts-1), and image generation

#### [Model Families Overview](models/families.md)
Deep dive into each model family's positioning, capabilities, and use cases.

---

## 🛠️ Developer Resources

Build applications with the AVELIN API. Compatible with OpenAI and Anthropic SDKs.

### API Documentation

- **[API Reference](api/index.md)** — Complete endpoint documentation for chat completions, embeddings, audio, and images
- **[Web Intelligence API](api/web-scraping.md)** — Firecrawl-compatible scrape, search, map, crawl, and extract on your AVELIN key
- **[API Quickstart](api/quickstart.md)** — Step-by-step guide to your first API call
- **[SDKs & Tools](api/sdks.md)** — Official SDKs, CLI tools, and editor integrations

### Integration Guides

Practical guides for integrating AVELIN with popular tools. We support 40+ OpenRouter-compatible apps.

#### Featured Integrations

- **[Browser Use](guides/browser-use.md)** — Browser automation (92K GitHub stars)
- **[Continue](guides/continue.md)** — Open-source VS Code/JetBrains assistant
- **[NanoClaw](guides/nanoclaw.md)** — Lightweight AI code analysis tool
- **[VT Code](guides/vt-code.md)** — Terminal-based AI coding assistant

#### Coding & IDE Tools

- **[Cursor](guides/coding/cursor.md)** — AI-first code editor
- **[Windsurf](guides/coding/windsurf.md)** — Codeium's AI-first IDE
- **[GitHub Copilot](guides/coding/github-copilot.md)** — BYOK Agent mode
- **[Cline](guides/coding/cline.md)** — VS Code autonomous coding agent
- **[Roo Code](guides/coding/roo-code.md)** — Autonomous VS Code coding agent
- **[Aider](guides/coding/aider.md)** — AI pair programming in terminal
- **[Claude Code](guides/coding/claude-code.md)** — Anthropic's CLI coding tool
- **[Codex](guides/coding/codex.md)** — OpenAI's terminal AI assistant
- **[OpenCode](guides/coding/opencode.md)** — Terminal-based coding assistant
- **[Kilo CLI](guides/coding/kilo-cli.md)** — Terminal AI coding tool
- **[More coding tools →](guides/coding/README.md)** — nanocode, Autohand, GitBug, Shakespeare, and more

#### Chat & Desktop Clients

- **[LibreChat](guides/chat/librechat.md)** — Self-hosted ChatGPT-style interface
- **[Chatbox](guides/chat/chatbox.md)** — Cross-platform desktop client
- **[BoltAI](guides/chat/boltai.md)** — Native macOS chat app
- **[SillyTavern](guides/chat/sillytavern.md)** — Power-user chat frontend
- **[More chat clients →](guides/chat/README.md)** — ChatLima, Chorus, Warden, Skales

#### Automation & Productivity

- **[Hermes Agent](guides/hermes.md)** — AI agent framework (recommended)
- **[OpenClaw](guides/coding/openclaw.md)** — Multi-agent orchestration
- **[More automation tools →](guides/automation/README.md)** — Agent Zero, AiAssistWorks, Ottex, and more

#### Creative Tools

- **[Creative tools →](guides/creative/README.md)** — Novelcrafter, Aventura, Project AIRI

#### Frameworks & SDKs

- **[Frameworks →](guides/frameworks/README.md)** — Mastra, openrouter-rs, OpenRouter MCP

#### Observability

- **[Observability tools →](guides/observability/README.md)** — Helicone, analystOS, Cloudflare AI Gateway, Maxim AI, PostHog

---

## 💼 Business Use Cases

See how organizations use AVELIN to transform workflows.

### [Use Cases Overview](use-cases/index.md)
Real-world scenarios and implementation patterns.

- **[Sales Intelligence](use-cases/sales-account-intelligence.md)** — Account research, outreach personalization, and deal intelligence
- **[Service Support](use-cases/service-support-resolution.md)** — Automated ticket resolution, knowledge base search, and customer support
- **[Executive Operations](use-cases/executive-operations-briefing.md)** — Meeting prep, decision support, and strategic analysis
- **[Personal Productivity](use-cases/personal-productivity-automation.md)** — Email drafting, task management, and workflow automation

---

## 🏢 Platform Architecture

Understand how AVELIN works under the hood.

### Core Components

- **[Platform Architecture](architecture.md)** — System design, routing logic, and data flow
- **[How It Works](systems/how-it-works.md)** — Technical overview of the model orchestration layer

### Platform Modules

- **[AVELIN-API](systems/avelin-api.md)** — The governed API layer with automatic failover and retry logic
- **[AVELIN-GPT](systems/avelin-conversational-interface.md)** — Conversational interface for non-technical users
- **[AVELIN-MCP](systems/mcp-integration-platform.md)** — Model Context Protocol for tool integrations
- **[Y-RAY](systems/document-intelligence-rag.md)** — Document search and RAG (retrieval-augmented generation)

### MCP Integrations

Connect AVELIN to your productivity tools via MCP (Model Context Protocol).

- **[MCP Overview](mcp/index.md)** — What MCP is and how it works
- **[Google Calendar](mcp/google-calendar.md)** — Create, update, and query calendar events
- **[Gmail](mcp/gmail.md)** — Send emails, search messages, manage drafts
- **[Google Tasks](mcp/google-tasks.md)** — Create and manage task lists
- **[Google Contacts](mcp/google-contacts.md)** — Search and manage contact information
- **[Cross-Service Workflows](mcp/cross-service-scenarios.md)** — Multi-tool automation examples
- **[Action Reference](mcp/action-reference.md)** — Complete list of MCP actions and parameters

---

## 📊 Benefits & Value

Why organizations choose AVELIN over direct provider APIs.

### [Benefits Overview](benefits/index.md)
Strategic, operational, and competitive advantages.

- **[Strategic Benefits](benefits/platform-strategic-benefits.md)** — Vendor neutrality, data sovereignty, and governance
- **[Operational Benefits](benefits/operational-benefits.md)** — Cost optimization, reliability, and simplified operations
- **[Competitive Advantages](benefits/competitive-advantages.md)** — How AVELIN compares to direct provider relationships
- **[Benchmark Results](benefits/benchmark-results.md)** — Performance data across industry-standard evaluations

---

## 🔒 Security & Operations

Enterprise-grade security, reliability, and operational control.

### [Operations Overview](operations/index.md)
Deployment, administration, and governance guidance.

- **[Security & Governance](operations/security-reliability-governance.md)** — Encryption, access control, and compliance
- **[Deployment & Administration](operations/deployment-and-administration.md)** — Installation, configuration, and management
- **[Troubleshooting & KPIs](operations/troubleshooting-and-kpis.md)** — Common issues, monitoring, and performance metrics

---

## 📚 Reference

### [Glossary](glossary.md)
Definitions of key terms and concepts used throughout the documentation.

---

## Need Help?

- **Getting started**: Read the [API Quickstart](api/quickstart.md)
- **Choosing a model**: See the [Model Catalog](models/README.md)
- **Integration questions**: Check [SDKs & Tools](api/sdks.md) or [Guides](guides/hermes.md)
- **Enterprise deployment**: Review [Operations](operations/index.md)

---

## Documentation Structure

```
docs/
├── api/              # API reference, quickstart, SDKs
├── models/           # Model catalog and family overviews
├── guides/           # Integration guides (Hermes, etc.)
├── use-cases/        # Business scenarios and workflows
├── systems/          # Platform modules and architecture
├── mcp/              # MCP integrations and actions
├── benefits/         # Value proposition and benchmarks
├── operations/       # Deployment, security, troubleshooting
└── README.md         # This file
```
