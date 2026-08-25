# Replit Agent Integration

AVELIN API is compatible with Replit Agent — the popular AI app builder that takes you from prompt to deployed application in minutes.

Replit Agent is an AI-powered development platform by Replit that builds full-stack applications from natural language descriptions. Its killer feature is the prompt-to-deployed-app pipeline: describe what you want, and Replit Agent builds the frontend, backend, and database layer, then deploys it to a live URL — all automatically. Unlike code editors with AI assistants, Replit Agent handles the entire development lifecycle, from scaffolding to deployment, with zero manual intervention required.

Built for entrepreneurs, indie hackers, product managers, and developers who need to ship fast, Replit Agent eliminates the gap between idea and live product. BYOK (Bring Your Own Key) support lets you choose your model provider. Connect AVELIN for high-quality code generation with 1M-token context that understands your entire generated codebase.

> **Why AVELIN + Replit Agent?** Leverage AVELIN's frontier models with 1M-token context windows, automatic failover, and competitive pricing for rapid prototyping and full-stack app development.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Open Replit Agent

Go to [replit.com](https://replit.com) and access Replit Agent from your workspace or create a new project.

### Step 3: Configure AVELIN as the API provider

In Replit's settings, navigate to the AI/Model configuration section and add a custom API endpoint:

- **API Endpoint**: `https://api.avelin.ai/v1`
- **API Key**: Your AVELIN key (`sk-ave...xxxx`)
- **Model**: Choose from AVELIN's model catalog (see recommendations below)

### Step 4: Build your app

Describe your application in natural language. Replit Agent will scaffold, code, and deploy using AVELIN's models.

```
Example: "Build a task management app with user authentication, 
a kanban board interface, and real-time updates. Use React 
for the frontend and Node.js with PostgreSQL for the backend."
```

---

## API Reference

| Endpoint | URL |
|---|---|
| **OpenAI-compatible** | `https://api.avelin.ai/v1` |
| **Anthropic-compatible** | `https://api.avelin.ai` |

---

## Recommended Models

| Use case | Model | Why |
|---|---|---|
| Complex full-stack apps | `avelin-coding-pro` | 1M context, deep code understanding across entire codebase |
| Standard web apps | `avelin-pro` | 256K context, balanced performance for most projects |
| Quick prototypes | `avelin-fast` | Fastest response for simple apps and MVPs |
| Complex architecture | `avelin-agentic-ultra` | Top-tier reasoning for multi-service applications |
| Iterative development | `avelin-agentic-pro` | Balanced for ongoing feature development and debugging |

---

## Why AVELIN for Replit Agent?

- **1M context window**: Understand your entire generated codebase — frontend, backend, and database schemas — in a single context
- **Coding-optimized models**: `avelin-coding-pro` is purpose-built for code generation and understanding
- **Automatic failover**: Your build process continues even if a provider is down
- **Cost optimization**: Prompt caching reduces costs by ~80% on repeated prompts during iterative development
- **Full-stack capability**: Generate frontend, backend, and database code with consistent quality

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **API key error** | Verify the endpoint is `https://api.avelin.ai/v1` (includes `/v1`) |
| **Model not recognized** | Use exact model names from AVELIN's catalog (e.g., `avelin-coding-pro`) |
| **Code generation fails** | Try `avelin-coding-pro` for complex apps or `avelin-pro` for standard projects |
| **Slow responses** | Switch to `avelin-fast` for quick prototypes, `avelin-agentic-fast` for simple iterations |
| **Context limit errors** | Use `avelin-coding-pro` for 1M context on large codebases |
| **Deployment issues** | These are Replit-side; AVELIN only handles code generation |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Quests Guide](quests.md) — Alternative rapid prototyping tool
- [Cursor Guide](../coding/cursor.md) — AI-powered code editor
- [Model Catalog](../../models/README.md) — Full comparison
