# Augment Code Integration

AVELIN API integrates with [Augment Code](https://www.augmentcode.com) — an AI coding assistant for VS Code and JetBrains IDEs that ranks among the top AI coding tools in 2026. Augment Code understands your entire codebase through deep indexing and provides context-aware autocomplete, chat, and inline edits powered by AVELIN's frontier models.

> **Why AVELIN + Augment Code?** Augment Code's codebase-aware intelligence thrives on large context windows. AVELIN delivers 1M-token context, ~100 tps throughput, 90% prompt caching discounts, and enterprise-grade reliability — all through a single OpenAI-compatible endpoint.

---

## What is Augment Code?

Augment Code is an AI coding assistant that goes beyond simple autocomplete by indexing your entire repository and understanding cross-file dependencies. Its killer feature is codebase-aware AI — it doesn't just see the current file, it understands how your entire project fits together. With SOC 2 compliance and enterprise-grade security, it's trusted by teams that need both intelligence and compliance.

Augment Code is ideal for professional developers working on large, complex codebases where understanding the bigger picture matters. Whether you're navigating unfamiliar code, making architectural changes, or ensuring consistency across a large team, Augment Code's deep codebase understanding gives you an edge.

---

## Quick Setup

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It will look like `sk-ave...xxxx`.

### Step 2: Install Augment Code

**VS Code:**
1. Open VS Code
2. Go to Extensions (Cmd+Shift+X / Ctrl+Shift+X)
3. Search for **Augment Code**
4. Click **Install**

**JetBrains (IntelliJ, PyCharm, WebStorm, etc.):**
1. Open Settings/Preferences
2. Go to Plugins → Marketplace
3. Search for **Augment Code**
4. Click **Install** and restart your IDE

### Step 3: Configure Augment Code

Open Augment Code settings:

**VS Code:** Settings → Extensions → Augment Code

**JetBrains:** Settings → Tools → Augment Code

Set the custom API endpoint:

| Field | Value |
|---|---|
| **API Provider** | Custom / OpenAI Compatible |
| **Base URL** | `https://api.avelin.ai/v1` |
| **API Key** | `sk-ave...xxxx` |
| **Model** | `avelin-coding-pro` |

### Step 4: Start Coding

Augment Code will automatically index your repository and start providing intelligent suggestions:

- **Autocomplete**: Get context-aware code completions as you type
- **Chat**: Ask questions about your codebase in the sidebar
- **Inline Edits**: Select code and request changes with Cmd+K / Ctrl+K

---

## Recommended Models

### Primary Recommendation: `avelin-coding-pro`

For Augment Code's core features:

| Feature | avelin-coding-pro | Why it matters for Augment Code |
|---|---|---|
| **Context window** | **1M tokens** | Augment Code indexes entire repos — large context is essential |
| **Max output** | **65K tokens** | Comprehensive code generation and multi-file refactors |
| **Throughput** | **~100 tokens/sec** | 2× faster than standard tiers — snappy autocomplete experience |
| **Reasoning** | Deep step-by-step thinking | Understands cross-file dependencies and architectural patterns |
| **Tool calling** | First-class support | Reliable inline edits and code transformations |

### Alternative Models

| Model | When to use |
|---|---|
| `avelin-coding-fast` | Lighter coding tasks, quick questions — saves cost on simple completions |
| `avelin-coding-ultra` | Architecture reviews, system design, large-scale refactors |
| `avelin-fast` | Quick autocomplete and simple completions — lowest latency, lowest cost |

---

## Why AVELIN for Augment Code?

### 1. **Codebase-Aware Intelligence**

Augment Code's indexing generates rich context about your entire repository. AVELIN's 1M-token context windows ensure this information fits without truncation, giving the model a complete picture of your codebase.

### 2. **Cost Optimization**

Augment Code sends substantial context with each request to provide intelligent suggestions. AVELIN minimizes costs:

- **Prompt caching**: ~80% cost reduction on repeated system prompts and indexed codebase context
- **Competitive pricing**: Lower per-token costs than direct provider APIs
- **Pay-per-token**: No subscription lock-in — pay only for what you use

### 3. **Fast Autocomplete**

With ~100 tokens/sec throughput, AVELIN delivers suggestions fast enough to keep up with your typing speed. No lag, no waiting — just intelligent completions that flow with your work.

### 4. **Enterprise Reliability**

- **Automatic failover**: If one provider is slow or down, AVELIN switches to another
- **Retry logic**: Transient errors handled automatically
- **99.9% uptime**: Enterprise-grade infrastructure for professional development workflows

---

## Example Workflow

```
Augment Code Chat Panel:

You> Find all places where we're making API calls without proper error
     handling and suggest improvements.

Augment Code: Analyzing your codebase for API calls...

I found 12 API calls across 5 files. 4 of them lack proper error handling:

1. src/services/userService.ts:45
   - Issue: No try/catch around fetch call
   - Risk: Unhandled promise rejection on network failure

2. src/api/auth.ts:23
   - Issue: Only catches network errors, not HTTP errors
   - Risk: 4xx/5xx responses treated as success

3. src/hooks/useData.ts:18
   - Issue: No loading state or error boundary
   - Risk: UI shows stale data on failure

4. src/utils/api.ts:67
   - Issue: Timeout not configured
   - Risk: Requests can hang indefinitely

Would you like me to fix these issues? I'll add:
- Comprehensive error handling with retry logic
- Proper HTTP status code checking
- Loading and error states for React hooks
- Configurable timeouts with sensible defaults

You> Yes, fix them all

Augment Code: [Applies changes across all 4 files]
              [Adds error handling utilities in src/utils/errorHandler.ts]
              [Updates tests to cover error scenarios]

Done! I've added comprehensive error handling to all 12 API calls.
Run `npm test` to verify the changes.
```

---

## Advanced Configuration

### Model Selection by Feature

You can configure different models for different Augment Code features:

- **Autocomplete**: `avelin-fast` for lowest latency
- **Chat**: `avelin-coding-pro` for deep reasoning
- **Inline Edits**: `avelin-coding-pro` for accurate transformations

Check Augment Code's settings for per-feature model configuration options.

### Context Filtering

For very large repositories, configure which files and directories Augment Code should index:

1. Open Augment Code settings
2. Configure include/exclude patterns
3. Focus indexing on your source code, exclude generated files and dependencies

This ensures the most relevant context is available within the 1M-token window.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **"API endpoint unreachable"** | Verify base URL is `https://api.avelin.ai/v1` and check network connection |
| **"Model not found"** | Use a valid AVELIN model name (e.g., `avelin-coding-pro`) |
| **"API key invalid"** | Ensure your key starts with `sk-ave` and is active in your AVELIN dashboard |
| **Slow autocomplete** | Try `avelin-fast` for lower latency on simple completions |
| **Indexing fails** | Check that your repository is accessible and not too large; configure exclusions |
| **Context overflow** | Reduce indexed files or start a new chat session |
| **Suggestions not relevant** | Ensure Augment Code has finished indexing; check that relevant files are included |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Cursor Guide](cursor.md) — AI-first code editor
- [Cline Guide](cline.md) — Autonomous VS Code agent
- [Aider Guide](aider.md) — AI pair programming in the terminal
- [Model Catalog](../../models/README.md) — Full model comparison
- [Augment Code Docs](https://www.augmentcode.com/docs) — Official Augment Code documentation
