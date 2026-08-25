# Cline Integration

AVELIN API works with [Cline](https://github.com/cline/cline) — an open-source VS Code extension that transforms your editor into an autonomous AI coding agent. Cline can read and write files, execute terminal commands, use the browser, and work through complex tasks step-by-step with user approval.

> **Why AVELIN + Cline?** Cline's autonomous agentic workflow benefits from AVELIN's reliable tool calling, 1M-token context windows, and deep reasoning models — all at competitive per-token pricing. AVELIN supports both the Anthropic Messages API and OpenAI Chat Completions API, giving you flexibility in how you configure Cline.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration Methods](#configuration-methods)
  - [Method 1: Anthropic Provider (RECOMMENDED)](#method-1-anthropic-provider-recommended)
  - [Method 2: OpenAI Compatible Provider](#method-2-openai-compatible-provider)
- [Model Selection](#model-selection)
- [Model Configuration Options](#model-configuration-options)
- [Verification](#verification)
- [Cline-Specific Features with AVELIN](#cline-specific-features-with-avelin)
  - [Plan & Act Mode](#plan--act-mode)
  - [Auto-Approve & YOLO Mode](#auto-approve--yolo-mode)
  - [Checkpoints](#checkpoints)
  - [Memory Bank](#memory-bank)
  - [Custom Instructions](#custom-instructions)
  - [Subagents](#subagents)
  - [Context Management](#context-management)
- [Advanced Configuration](#advanced-configuration)
  - [Switching Models Mid-Session](#switching-models-mid-session)
  - [Multiple Model Strategy](#multiple-model-strategy)
  - [Extended Thinking](#extended-thinking)
  - [Using Cline CLI](#using-cline-cli)
- [Example Workflows](#example-workflows)
- [Troubleshooting](#troubleshooting)
- [Performance Tips](#performance-tips)
- [Why AVELIN for Cline?](#why-avelin-for-cline)
- [Related Guides](#related-guides)

---

## Quick Start

Get Cline working with AVELIN in under 3 minutes:

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key from your dashboard. Your key will look like:

```
sk-avelin-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 2: Install Cline in VS Code

1. Open VS Code
2. Press `Cmd+Shift+X` (macOS) or `Ctrl+Shift+X` (Windows/Linux) to open Extensions
3. Search for **Cline**
4. Click **Install**

### Step 3: Configure Cline with AVELIN (Anthropic — Recommended)

1. Click the **Cline** icon in the VS Code sidebar
2. Click the **⚙️ Settings** gear icon in the Cline panel
3. Select **Anthropic** from the "API Provider" dropdown
4. Check **"Use custom base URL"**
5. Enter the base URL: `https://api.avelin.ai`
6. Paste your AVELIN API key in the **Anthropic API Key** field
7. Select or type your model: `avelin-coding-pro`
8. Click **Done**

### Step 4: Verify the connection

Send a simple test message in the Cline chat panel:

```
Say "Hello from AVELIN!" and list the current working directory.
```

If Cline responds and executes the command, your setup is complete.

---

## Prerequisites

Before you begin, ensure you have:

| Requirement | Details |
|---|---|
| **VS Code** | Version 1.82.0 or later |
| **Cline extension** | Latest version from VS Code Marketplace |
| **AVELIN API key** | Generated from [avelin.ai](https://avelin.ai) dashboard |
| **Internet access** | Cline needs to reach `api.avelin.ai` |
| **Project workspace** | Open a folder in VS Code for Cline to work with |

> **Note:** Cline works on macOS, Windows, and Linux. All configuration is done through the Cline settings UI panel within VS Code — there is no separate configuration file to edit.

---

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to **Extensions** (`Cmd+Shift+X` / `Ctrl+Shift+X`)
3. Search for `Cline`
4. Install the extension by **Cline**
5. The Cline icon will appear in your Activity Bar (left sidebar)

### From Command Line

```bash
code --install-extension saoudrizwan.claude-dev
```

### Verify Installation

After installing, open the Cline panel by clicking its icon in the sidebar. You should see the initial setup screen prompting you to configure an API provider.

---

## Configuration Methods

Cline supports multiple API provider types. For AVELIN, you have two options:

| Method | Provider Type | Endpoint | Best For |
|---|---|---|---|
| **Anthropic (Recommended)** | Anthropic | `https://api.avelin.ai` | Full feature support, thinking, streaming |
| **OpenAI Compatible** | OpenAI Compatible | `https://api.avelin.ai/v1` | Simpler setup, broad compatibility |

> **Important:** Cline stores all settings (API keys, provider selection, model preferences) in VS Code's internal storage (`GlobalState` and `SecretStorage`). There is no external JSON configuration file to edit — all configuration is done through the Cline settings UI panel.

---

## Method 1: Anthropic Provider (RECOMMENDED)

The Anthropic provider type gives you the best experience with AVELIN because it enables full support for extended thinking, streaming responses, and Anthropic-native tool calling formats.

### Configuration Steps

1. **Open Cline Settings**
   - Click the Cline icon in the VS Code sidebar
   - Click the **⚙️** (gear) icon in the top-right of the Cline panel

2. **Select Provider**
   - In the "API Provider" dropdown, select **Anthropic**

3. **Configure Custom Base URL**
   - Check the box labeled **"Use custom base URL"**
   - In the URL field that appears, enter:
   ```
   https://api.avelin.ai
   ```

4. **Enter API Key**
   - Paste your AVELIN API key in the **Anthropic API Key** field:
   ```
   sk-avelin-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. **Select Model**
   - Choose from the dropdown or manually type: `avelin-coding-pro`

6. **Configure Model Settings** (optional but recommended)
   - **Max Output Tokens:** `65536`
   - **Context Window:** `1000000` (1M tokens)
   - **Image Support:** Enable if your model supports vision
   - **Computer Use:** Enable if your model supports browser automation

7. **Save**
   - Click **Done** to save your configuration

### Anthropic Provider — Complete Configuration Summary

| Field | Value |
|---|---|
| **API Provider** | `Anthropic` |
| **Use custom base URL** | ✅ Checked |
| **Base URL** | `https://api.avelin.ai` |
| **Anthropic API Key** | `sk-avelin-...` |
| **Model** | `avelin-coding-pro` |
| **Max Output Tokens** | `65536` |
| **Context Window** | `1000000` |

### Why Anthropic Provider is Recommended

- **Extended Thinking:** Full support for thinking/reasoning blocks, giving you visibility into the model's decision process
- **Streaming:** Token-by-token streaming works natively with the Anthropic Messages API format
- **Prompt Caching:** Anthropic's prompt caching protocol reduces costs on repeated system prompts (up to 90% savings)
- **Tool Calling:** Cline's tool use format is designed around Anthropic's native tool calling — fewer conversion layers means more reliable execution
- **Image Support:** Direct support for image inputs when using vision-capable models

---

## Method 2: OpenAI Compatible Provider

If you prefer a simpler configuration or need compatibility with OpenAI-specific features, use the OpenAI Compatible provider.

### Configuration Steps

1. **Open Cline Settings**
   - Click the Cline icon in the VS Code sidebar
   - Click the **⚙️** (gear) icon in the top-right of the Cline panel

2. **Select Provider**
   - In the "API Provider" dropdown, select **OpenAI Compatible**

3. **Set Base URL**
   - Enter the OpenAI-compatible base URL:
   ```
   https://api.avelin.ai/v1
   ```

4. **Enter API Key**
   - Paste your AVELIN API key in the **API Key** field:
   ```
   sk-avelin-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. **Set Model ID**
   - Enter the model identifier:
   ```
   avelin-coding-pro
   ```

6. **Configure Model Settings** (optional but recommended)
   - Click **Model Configuration** to expand advanced options
   - **Max Output Tokens:** `65536`
   - **Context Window:** `1000000`
   - **Image Support:** Enable if your model supports vision
   - **Computer Use:** Enable if needed
   - **Input Price:** Set your cost per million tokens (for tracking)
   - **Output Price:** Set your cost per million tokens (for tracking)

7. **Save**
   - Click **Done** to save your configuration

### OpenAI Compatible Provider — Complete Configuration Summary

| Field | Value |
|---|---|
| **API Provider** | `OpenAI Compatible` |
| **Base URL** | `https://api.avelin.ai/v1` |
| **API Key** | `sk-avelin-...` |
| **Model ID** | `avelin-coding-pro` |
| **Max Output Tokens** | `65536` |
| **Context Window** | `1000000` |

### How the OpenAI Compatible Provider Works

When you select "OpenAI Compatible," Cline sends requests to:

```
POST https://api.avelin.ai/v1/chat/completions
```

This is the standard OpenAI Chat Completions endpoint format. AVELIN's API translates internally to provide the same models through this interface.

---

## Model Selection

### Primary Recommendation: `avelin-coding-pro`

For autonomous coding workflows, `avelin-coding-pro` is the optimal choice:

| Feature | avelin-coding-pro | Why it matters for Cline |
|---|---|---|
| **Context window** | **1M tokens** | Cline accumulates context across many file reads and terminal outputs |
| **Max output** | **65K tokens** | Large file edits and comprehensive multi-step plans |
| **Throughput** | **~100 tokens/sec** | 2× faster than standard tiers — Cline loops complete faster |
| **Reasoning** | Deep step-by-step thinking | Better autonomous decision-making |
| **Tool calling** | First-class support | Cline relies on reliable structured tool calls for file ops and terminal |

### Alternative Models

| Model | Use Case | When to Choose |
|---|---|---|
| `avelin-coding-ultra` | Complex refactors, architecture changes, security reviews | Large-scale codebase restructuring, design decisions |
| `avelin-coding-fast` | General coding tasks, bug fixes, feature implementation | Everyday coding work, balanced cost/performance |
| `avelin-agentic-ultra` | Multi-step planning tasks, long autonomous workflows | When you need maximum reasoning for complex problems |
| `avelin-fast` | Quick lookups, simple tasks, code completion | Lowest cost, fastest response — good for trivial changes |

### Model Selection Strategy for Cline

Cline's autonomous loops generate many API calls. Consider this cost/performance strategy:

```
Planning Phase:      avelin-coding-pro or avelin-agentic-ultra
                     (Deep reasoning for architecture decisions)

Implementation:      avelin-coding-pro
                     (Reliable tool calling, fast iteration)

Quick Fixes:         avelin-coding-fast or avelin-fast
                     (Cost-effective for simple edits)

Review/Testing:      avelin-coding-ultra
                     (Thorough analysis of generated code)
```

---

## Model Configuration Options

Cline provides detailed model configuration in its settings panel. These settings help Cline understand your model's capabilities and limits.

### Available Settings

| Setting | Description | Recommended Value for AVELIN |
|---|---|---|
| **Max Output Tokens** | Maximum tokens the model can generate in one response | `65536` |
| **Context Window** | Total context size (input + output) | `1000000` |
| **Image Support** | Whether the model accepts image inputs | Enable for vision models |
| **Computer Use** | Whether the model supports browser/screen automation | Enable if supported |
| **Input Price** | Cost per million input tokens (for budget tracking) | Check AVELIN pricing page |
| **Output Price** | Cost per million output tokens (for budget tracking) | Check AVELIN pricing page |

### Configuring Model Settings

1. In the Cline settings panel, after selecting your provider and model
2. Expand the **Model Configuration** section
3. Adjust values as needed
4. These settings affect how Cline manages context and tracks costs

> **Tip:** Setting accurate context window and max output token values prevents Cline from sending requests that exceed model limits, reducing errors and wasted API calls.

---

## Verification

After configuring Cline, verify your setup works correctly before starting real work.

### Step 1: Connection Test

Send a simple test message:

```
Hello! Confirm you are connected and tell me what model you are using.
```

**Expected response:** Cline responds with a greeting and confirms the model name.

### Step 2: Tool Calling Test

Ask Cline to perform a basic file operation:

```
List the files in the current directory and tell me what kind of project this is.
```

**Expected behavior:**
1. Cline requests permission to run a terminal command (`ls` or `dir`)
2. Click **Approve** (or auto-approve handles it)
3. Cline reads the output and describes the project type

### Step 3: File Read Test

```
Read the main entry point file of this project and summarize what it does.
```

**Expected behavior:**
1. Cline identifies the entry file (e.g., `main.py`, `index.ts`, `app.go`)
2. Requests permission to read the file
3. Provides a summary of the file's purpose

### Step 4: File Write Test

```
Create a file called TEST_CLINE.txt with the text "Cline + AVELIN works!" and then delete it.
```

**Expected behavior:**
1. Cline creates the file (asks for approval)
2. Confirms creation
3. Deletes the file (asks for approval)
4. Confirms deletion

### Verification Checklist

- [ ] Cline responds to messages
- [ ] Terminal commands execute successfully
- [ ] File reads work
- [ ] File writes work
- [ ] Responses stream token-by-token
- [ ] No error messages in the Cline panel

---

## Cline-Specific Features with AVELIN

Cline offers powerful features that work particularly well with AVELIN's API.

---

### Plan & Act Mode

Cline has a dual-mode system for structured development:

- **Plan Mode:** Cline analyzes your codebase and creates a detailed plan without making changes. Uses a reasoning-focused approach.
- **Act Mode:** Cline executes the plan, making file changes and running commands.

#### Best Practices with AVELIN

```
1. Start in Plan Mode: Describe your goal
   "Plan how to add rate limiting to this FastAPI application"

2. Review the plan Cline generates
   - Check that it covers edge cases
   - Verify the approach matches your preferences

3. Switch to Act Mode to execute
   "Execute the plan"
```

**Recommended model pairing:**
- Plan Mode: `avelin-agentic-ultra` or `avelin-coding-ultra` (deep reasoning)
- Act Mode: `avelin-coding-pro` (fast, reliable tool calling)

---

### Auto-Approve & YOLO Mode

By default, Cline asks for your approval before every file write and terminal command. For trusted projects, you can enable auto-approval to speed up autonomous workflows.

#### Enabling Auto-Approve

1. Open Cline settings (⚙️ icon)
2. Look for the **Auto-Approve** section
3. Enable specific permissions:
   - **Read files** — Always safe, recommended to auto-approve
   - **Write files** — Enable for trusted projects
   - **Execute terminal commands** — Use with caution
   - **Browser actions** — Enable only if needed

#### YOLO Mode

YOLO mode auto-approves all actions without asking. Only enable this for:
- Sandbox/development environments
- Git-tracked projects (easy rollback)
- Well-understood codebases

#### Safety Recommendations

```
SAFE TO AUTO-APPROVE:
✅ Read files
✅ List directory contents
✅ Run tests (read-only operations)

USE CAUTION:
⚠️  Write/edit files (ensure git is initialized)
⚠️  Run build commands
⚠️  Install dependencies

NEVER AUTO-APPROVE:
❌ Commands that delete directories recursively
❌ Commands that push to production
❌ Commands that modify system configuration
```

With AVELIN's reliable tool calling, auto-approved actions execute predictably with fewer malformed commands.

---

### Checkpoints

Cline creates git checkpoints at each step, allowing you to roll back code changes while preserving the conversation history.

#### How Checkpoints Work

1. Before each file modification, Cline creates a git commit
2. If something goes wrong, you can restore to any previous checkpoint
3. Your conversation context is preserved even after rollback

#### Using Checkpoints with AVELIN

```
Cline Panel:

You> Refactor the authentication module to use JWT

Cline: [Creates checkpoint]
       [Modifies auth.py]
       [Modifies middleware.py]
       [Creates jwt_utils.py]

You> This broke the tests. Restore the last checkpoint.

Cline: [Restores to previous checkpoint]
       The changes have been reverted. The conversation
       history is preserved. Would you like me to try
       a different approach?
```

> **Tip:** Checkpoints rely on git. Always initialize a git repository in your project before enabling checkpoints: `git init && git add -A && git commit -m "Initial checkpoint"`

---

### Memory Bank

Cline's Memory Bank is a structured documentation system that helps maintain context across sessions. It stores project knowledge in markdown files that Cline reads at the start of each session.

#### Setting Up Memory Bank

1. Create a `.cline/` directory in your project root
2. Add documentation files:
   ```
   .cline/
   ├── projectbrief.md      # Project overview and goals
   ├── techContext.md        # Technology stack and decisions
   ├── activeContext.md      # Current work focus
   └── progress.md           # What's been done
   ```

3. Cline automatically reads these files when starting a new session

#### Example Memory Bank Entry

```markdown
<!-- .cline/projectbrief.md -->
# Project: AVELIN API Client Library

## Overview
Python client library for the AVELIN API with async support,
streaming, and automatic retry logic.

## Tech Stack
- Python 3.11+
- httpx for HTTP
- pytest for testing

## Architecture
- src/avelin/client.py - Main client class
- src/avelin/models.py - Pydantic models
- src/avelin/streaming.py - SSE stream handling
```

---

### Custom Instructions

Add project-specific instructions that Cline follows for every interaction.

#### Where to Set Custom Instructions

1. Open Cline settings (⚙️ icon)
2. Find the **Custom Instructions** text area
3. Enter your project-specific guidelines

#### Example Custom Instructions

```
You are working on a FastAPI application with the following conventions:

- All endpoints are async
- Use Pydantic v2 models for request/response validation
- Database access goes through SQLAlchemy async sessions
- Tests use pytest with httpx.AsyncClient
- Follow PEP 8 and use type hints for all function signatures
- Include docstrings for all public functions
- Use structlog for structured logging
- Error responses follow RFC 7807 Problem Details format

When writing new code:
- Always add corresponding tests
- Update the OpenAPI schema if adding endpoints
- Consider backwards compatibility for API changes
```

---

### Subagents

Cline can spawn parallel research agents that explore the codebase without filling the main agent's context window.

#### When to Use Subagents

- Exploring unfamiliar parts of a large codebase
- Researching how a specific pattern is used across the project
- Gathering context about dependencies before making changes

#### Example with AVELIN

```
You> Before refactoring the auth module, research how authentication
     is currently used across the entire codebase.

Cline: I'll spawn a research agent to explore authentication usage...

     [Subagent exploring: grep for auth imports, JWT usage,
      middleware configuration, test fixtures]

     Research complete. Found 14 files using authentication:
     - 8 API endpoints with auth dependencies
     - 3 middleware configurations
     - 2 test fixture files
     - 1 configuration module

     Summary: The codebase uses JWT-based auth with...
```

---

### Context Management

Cline's context window fills up quickly in autonomous sessions. Here's how to manage it effectively with AVELIN's 1M-token context:

#### Context Best Practices

1. **Use `@` mentions** to explicitly include relevant files:
   ```
   Look at @src/auth/jwt.py and fix the token expiration bug
   ```

2. **Start new tasks** for unrelated work:
   ```
   [Start new Cline task for each major feature]
   ```

3. **Monitor context usage:**
   - Cline shows token usage in the panel
   - With AVELIN's 1M context, you have more room before needing to reset

4. **Use `.clineignore`** to exclude irrelevant files:
   ```
   # .clineignore
   node_modules/
   __pycache__/
   .git/
   dist/
   *.pyc
   ```

---

## Advanced Configuration

---

### Switching Models Mid-Session

You can change models without restarting your Cline session:

1. Open the Cline panel
2. Click the model dropdown (or model name) at the top
3. Select a different AVELIN model
4. Continue your conversation with the new model

#### When to Switch Models

| Scenario | Switch To |
|---|---|
| Complex architecture decision | `avelin-coding-ultra` |
| Routine implementation work | `avelin-coding-pro` |
| Quick fix or lookup | `avelin-fast` |
| Need deeper reasoning | `avelin-agentic-ultra` |

> **Note:** Switching models mid-session preserves your conversation history and context. The new model receives the full conversation.

---

### Multiple Model Strategy

For cost optimization, consider using different models for different phases of work:

```
Phase 1 - Planning (avelin-coding-ultra):
  "Analyze the codebase and plan the microservice migration"

Phase 2 - Implementation (avelin-coding-pro):
  "Implement the user service according to the plan"

Phase 3 - Testing (avelin-coding-fast):
  "Write integration tests for the user service"

Phase 4 - Quick fixes (avelin-fast):
  "Fix the import error in test_user_service.py"
```

---

### Extended Thinking

When using the Anthropic provider with AVELIN, you can enable Extended Thinking for complex tasks:

1. In Cline settings, below the model selection
2. Check **"Enable Extended Thinking"**
3. Set the thinking budget (e.g., `10000` tokens)

Extended Thinking is particularly useful for:
- Multi-file refactoring decisions
- Debugging complex issues with many potential causes
- Architecture trade-off analysis
- Security vulnerability assessment

> **Note:** Extended thinking tokens are billed. Use judiciously for complex problems where the additional reasoning provides clear value.

---

### Using Cline CLI

Cline also offers a CLI/TUI for terminal-based workflows. The CLI can be configured to use AVELIN via environment variables or configuration:

```bash
# Install Cline CLI
npm install -g @anthropic-ai/cline

# Set environment variables
export ANTHROPIC_BASE_URL="https://api.avelin.ai"
export ANTHROPIC_API_KEY="sk-avelin-xxxxxxxxxxxxxxxx"

# Run Cline CLI
cline
```

For the OpenAI-compatible endpoint:

```bash
export OPENAI_BASE_URL="https://api.avelin.ai/v1"
export OPENAI_API_KEY="sk-avelin-xxxxxxxxxxxxxxxx"
```

---

## Example Workflows

### Example 1: Feature Implementation

```
Cline Panel:

You> Add pagination to the /api/users endpoint. Use cursor-based
     pagination with a default page size of 20.

Cline: I'll add cursor-based pagination to the users endpoint.
       Let me examine the current implementation.

       [Reads: src/routes/users.py]
       [Reads: src/models/user.py]
       [Reads: src/db/session.py]

       Here's my plan:
       1. Add pagination query parameters (cursor, limit)
       2. Create a PaginationResponse schema
       3. Update the query to use cursor-based pagination
       4. Add tests

       Shall I proceed?

You> Yes, implement it.

Cline: [Modifies: src/routes/users.py]
       [Creates: src/schemas/pagination.py]
       [Modifies: src/models/user.py]
       [Creates: tests/test_users_pagination.py]
       [Runs: pytest tests/test_users_pagination.py]

       All 8 tests pass. Here's what I implemented:
       - Cursor-based pagination with opaque cursors
       - Default limit of 20, max 100
       - Proper next_cursor generation
       - Empty results handling
       - Comprehensive test coverage
```

### Example 2: Debugging

```
You> The test suite is failing. Investigate and fix the failures.

Cline: Let me run the test suite to see what's failing.

       [Runs: pytest --tb=short]

       Found 3 failing tests:
       1. test_create_user_duplicate_email - AssertionError
       2. test_token_refresh - ConnectionError
       3. test_rate_limiter - TimeoutError

       Investigating each failure...
       [Reads test files, source code, configuration]

       Root causes identified:
       1. Missing unique constraint violation handler
       2. Redis connection not being mocked in tests
       3. Rate limiter test needs longer timeout

       Applying fixes...
       [Modifies 3 files, re-runs tests]

       All tests pass now. Here's what I fixed:
       ...
```

### Example 3: Code Review

```
You> Review the changes in the last commit for security issues.

Cline: Let me examine the recent changes.

       [Runs: git diff HEAD~1]
       [Analyzes changes across 5 files]

       Security findings:

       ⚠️ HIGH: SQL injection risk in src/queries/search.py:47
          The user input is concatenated directly into the query.
          Fix: Use parameterized queries.

       ⚠️ MEDIUM: Missing input validation in src/routes/upload.py:23
          File size limit not enforced server-side.

       ℹ️ LOW: Verbose error messages in src/middleware/error.py
          Stack traces exposed in production responses.

       Would you like me to fix these issues?
```

---

## Troubleshooting

### Common Issues and Solutions

---

#### "Invalid API Key"

**Error message:** `Authentication failed: Invalid API key`

**Causes:**
- API key not entered correctly
- Using an expired or revoked key
- Copy-paste introduced extra spaces

**Solutions:**
1. Re-copy your API key from [avelin.ai](https://avelin.ai) dashboard
2. Ensure no leading/trailing whitespace
3. Verify the key starts with `sk-avelin-`
4. Try pasting into a text editor first to verify the key is complete

---

#### "Model Not Found"

**Error message:** `model "avelin-coding-pro" not found` or `404 Not Found`

**Causes:**
- Model name typo
- Base URL incorrect
- Model not available on your plan

**Solutions:**
1. Verify model name exactly: `avelin-coding-pro` (lowercase, hyphens)
2. Check you're using the correct base URL:
   - Anthropic provider: `https://api.avelin.ai`
   - OpenAI Compatible: `https://api.avelin.ai/v1`
3. Verify your AVELIN account has access to the model

---

#### "Connection Refused" / "Network Error"

**Error message:** `ECONNREFUSED` or `Failed to fetch` or `Network error`

**Causes:**
- No internet connection
- Firewall blocking `api.avelin.ai`
- Proxy/VPN interference
- Incorrect base URL (e.g., missing `https://`)

**Solutions:**
1. Verify internet connectivity: `curl https://api.avelin.ai`
2. Check your base URL starts with `https://`
3. If behind a corporate proxy, ensure `api.avelin.ai` is allowlisted
4. Try disabling VPN temporarily to test

---

#### "Context Window Exceeded"

**Error message:** `prompt is too long` or `context_length_exceeded`

**Causes:**
- Too many files read in a single session
- Large terminal outputs accumulated
- Context window set incorrectly in model configuration

**Solutions:**
1. Start a new Cline task (clears context)
2. Ensure Context Window is set to `1000000` in model configuration
3. Use `.clineignore` to exclude unnecessary files
4. Use `@` mentions instead of letting Cline search broadly
5. Use subagents for research tasks to preserve main context

---

#### Tool Calls Failing / Malformed Output

**Error message:** Tool execution fails, or Cline generates invalid file paths/commands

**Causes:**
- Model doesn't support function calling well
- Extended thinking interfering with tool format
- Model configuration doesn't match actual capabilities

**Solutions:**
1. Use `avelin-coding-pro` or `avelin-coding-fast` — these have first-class tool calling
2. Ensure "Computer Use" is only enabled if the model actually supports it
3. Check that Max Output Tokens is set correctly (too low = truncated tool calls)
4. Try switching to the Anthropic provider for better tool calling compatibility

---

#### Streaming Not Working

**Symptom:** Response appears all at once instead of streaming token-by-token

**Causes:**
- Using OpenAI Compatible provider with a model that doesn't support streaming
- Network buffering issue
- VS Code rendering delay

**Solutions:**
1. Switch to the **Anthropic** provider — streaming is more reliable
2. Check that your network/proxy supports SSE (Server-Sent Events)
3. Ensure no antivirus is intercepting the connection

---

#### "Rate Limit Exceeded"

**Error message:** `429 Too Many Requests` or `Rate limit exceeded`

**Causes:**
- Too many requests in a short period
- Auto-approve causing rapid-fire tool calls
- Multiple Cline instances running simultaneously

**Solutions:**
1. Cline has built-in retry logic — wait for it to retry automatically
2. Reduce auto-approve settings to slow down the loop
3. Check if multiple VS Code windows have Cline active
4. Contact AVELIN support if rate limits are consistently hit

---

#### Responses Stop Mid-Generation

**Symptom:** Cline output stops abruptly, appears incomplete

**Causes:**
- Max Output Tokens set too low
- Network timeout
- Model hit its own generation limit

**Solutions:**
1. Increase Max Output Tokens in model configuration (set to `65536`)
2. Ask Cline to continue: "Continue from where you left off"
3. Check your internet connection stability
4. Try again — transient network issues resolve on retry

---

#### Cline Not Appearing in Sidebar

**Causes:**
- Extension not installed or disabled
- VS Code needs restart
- Extension compatibility issue

**Solutions:**
1. Check Extensions panel — search for "Cline" and ensure it's installed and enabled
2. Reload VS Code window: `Cmd+Shift+P` → "Developer: Reload Window"
3. Update VS Code to the latest version
4. Reinstall the Cline extension

---

### Debugging Connection Issues

To verify your AVELIN API connection directly:

```bash
# Test Anthropic-compatible endpoint
curl -X POST https://api.avelin.ai/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk-avelin-YOUR_KEY_HERE" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "avelin-coding-pro",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Say hello"}]
  }'

# Test OpenAI-compatible endpoint
curl -X POST https://api.avelin.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-avelin-YOUR_KEY_HERE" \
  -d '{
    "model": "avelin-coding-pro",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Say hello"}]
  }'
```

If these return valid responses but Cline still fails, the issue is in Cline's configuration — re-check your settings.

---

## Performance Tips

### Optimizing for Speed

1. **Use `avelin-fast` for simple tasks** — significantly lower latency for trivial operations
2. **Enable prompt caching** — reduces cost and latency on repeated system prompts (90% savings)
3. **Set realistic Max Output Tokens** — requesting fewer tokens when full output isn't needed speeds up response time
4. **Use `.clineignore`** — prevents Cline from scanning irrelevant files, reducing initial context time
5. **Keep one Cline session active** — avoid opening multiple windows running Cline simultaneously

### Optimizing for Cost

1. **Start with cheaper models** — use `avelin-fast` or `avelin-coding-fast` for initial exploration, switch to `avelin-coding-pro` only when needed
2. **Use Memory Bank** — prevents re-reading the same files every session
3. **Write clear, specific requests** — reduces the number of exploration steps Cline takes
4. **Monitor token usage** — Cline shows token counts; track spending per task
5. **Set up `.clineignore`** — avoids wasting tokens on `node_modules`, `dist`, etc.

### Optimizing for Quality

1. **Use Plan Mode first** — let the model think before acting
2. **Provide context with `@` mentions** — explicit file references reduce guesswork
3. **Set custom instructions** — project-specific conventions prevent rework
4. **Use checkpoints** — enables safe experimentation without losing progress
5. **Review and iterate** — use Cline's conversation to refine results

---

## Why AVELIN for Cline?

### 1. Reliable Tool Calling

Cline fires dozens of tool calls per task — file reads, writes, terminal commands, browser actions. AVELIN's coding models provide first-class function calling with reliable structured outputs, minimizing retries and malformed calls.

### 2. Cost Optimization

Cline's autonomous loops can consume significant tokens. AVELIN optimizes costs:

- **Prompt caching:** ~80% cost reduction on repeated system prompts
- **Competitive pricing:** Lower per-token costs than direct provider APIs
- **Pay-per-token:** No subscription lock-in
- **Model variety:** Choose the right model for each task's complexity

### 3. 1M Context Windows

Cline sessions accumulate context quickly — every file read, terminal output, and browser interaction adds to the context. AVELIN's 1M-token context windows mean longer autonomous sessions without context loss.

### 4. Dual API Support

AVELIN supports both Anthropic and OpenAI API formats:
- Use Anthropic provider for full feature access (thinking, caching, streaming)
- Use OpenAI Compatible for simpler setups or when migrating from other providers
- Same models, same key — just different endpoints

### 5. Automatic Failover

- **Provider failover:** If one backend is slow, AVELIN switches to another
- **Retry logic:** Transient errors handled automatically
- **99.9% uptime:** Enterprise-grade infrastructure
- **Global edge:** Low latency from regions worldwide

---

## Related Guides

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Hermes Agent Guide](../hermes.md) — Terminal-based agentic coding tool
- [Claude Code Guide](claude-code.md) — Anthropic's CLI tool
- [Cursor Guide](cursor.md) — AI-first code editor
- [Roo Code Guide](roo-code.md) — Cline fork with additional features
- [Model Catalog](../../models/README.md) — Full model comparison
- [Cline Official Documentation](https://docs.cline.bot) — Complete Cline docs
- [Cline GitHub Repository](https://github.com/cline/cline) — Source code and issues
