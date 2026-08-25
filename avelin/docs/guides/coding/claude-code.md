# Claude Code Integration

[Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) is Anthropic's official CLI coding assistant. It provides terminal-native agentic workflows — reading/writing files, executing commands, searching codebases, and iterating on multi-step tasks. AVELIN works as a drop-in backend via the Anthropic API format.

> **Why AVELIN + Claude Code?** Claude Code's strength is long-running autonomous sessions (50–200+ turns). AVELIN delivers 1M-token context, ~100 tps throughput on `avelin-coding-pro`, and automatic provider failover — your session never dies mid-task.

---

## Quick Setup (2 minutes)

### Step 1: Get your AVELIN API key

Sign up at [avelin.ai](https://avelin.ai) and generate an API key. It looks like `sk-avelin-...`.

### Step 2: Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

*Requires Node.js 18+.*

### Step 3: Configure the Anthropic endpoint

Claude Code uses the **Anthropic Messages API**, which is AVELIN's recommended surface.

**Option A: Environment variables (recommended)**

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.config/fish/config.fish`):

```bash
export ANTHROPIC_BASE_URL="https://api.avelin.ai"
export ANTHROPIC_API_KEY="***
```

Then reload: `source ~/.bashrc` (or `source ~/.zshrc`).

**Option B: Inline when launching**

```bash
ANTHROPIC_BASE_URL="https://api.avelin.ai" \
ANTHROPIC_API_KEY="*** \
claude
```

### Step 4: Start Claude Code

```bash
claude
```

Claude Code will automatically route all requests through AVELIN.

### Step 5: Verify it works

Type:
```
What model are you using?
```

Expected response:
- Identifies as an AVELIN model (e.g., `avelin-coding-pro`)
- Streams token-by-token
- Shows reasoning before the answer for complex questions

If it errors, see [Troubleshooting](#troubleshooting).

---

## How Claude Code Uses AVELIN

Claude Code sends requests to the Anthropic Messages API at `/v1/messages`. AVELIN intercepts these and routes to the best available frontier model across multiple cloud providers, based on your selected model.

```
Claude Code CLI
    ↓ POST /v1/messages
AVELIN API (api.avelin.ai)
    ↓ Routes to best available frontier model
Frontier Model (auto-selected for quality & availability)
    ↓ Response with thinking blocks
Claude Code displays result
```

You don't need to know which backend is used — AVELIN handles failover, retry, and load balancing automatically.

---

## Recommended Models

### Primary: `avelin-coding-pro`

| Feature | avelin-coding-pro | Why it matters for Claude Code |
|---|---|---|
| **Context window** | **1M tokens** | Load entire repos without chunking |
| **Max output** | **65K tokens** | Generate large files, comprehensive tests |
| **Throughput** | **~100 tokens/sec** | 2× faster — tighter feedback loops |
| **Reasoning** | Deep step-by-step thinking | Catches subtle bugs, understands cross-file deps |
| **Tool calling** | First-class | Reliable file edits and command execution |

### Alternatives

| Model | When to use |
|---|---|
| `avelin-coding-fast` | Standard coding tasks, cost-efficient |
| `avelin-coding-ultra` | System design, architecture reviews, security audits |
| `avelin-pro` | Non-coding tasks — drafting docs, planning |
| `avelin-fast` | Quick lookups, classification — lowest cost |

### Set model in Claude Code

Claude Code uses the default model from your AVELIN account. To override:

```bash
claude --model avelin-coding-ultra
```

Or in an active session:

```
/model avelin-coding-ultra
```

---

## Claude Code Features with AVELIN

### Multi-Turn Sessions

Claude Code maintains context across turns. With AVELIN's 1M context, you can run long sessions:

```bash
$ claude

> Read the entire codebase and summarize the architecture
[Claude Code reads all files, builds mental model]

> Now refactor the auth module to use JWT
[Claude Code edits multiple files, updates tests]

> Run the tests and fix any failures
[Claude Code executes pytest, iterates until green]
```

### File Editing

Claude Code can read, write, and edit files:

```
> Create a new FastAPI endpoint at /api/users that:
  - Accepts POST with {name, email}
  - Validates with Pydantic
  - Saves to database
  - Returns the created user

[Claude Code creates users.py, updates main.py, adds tests]
```

### Command Execution

Claude Code can run terminal commands:

```
> Install pytest and httpx, then write tests for all endpoints

[Claude Code runs: pip install pytest httpx]
[Claude Code creates test files]
[Claude Code runs: pytest]
[Claude Code fixes failures until all tests pass]
```

### Codebase Search

Claude Code can search your repo:

```
> Find all places where we use Redis and add connection pooling

[Claude Code greps for redis imports]
[Claude Code identifies 5 files]
[Claude Code updates each with connection pooling]
```

### MCP Server Integration

Claude Code supports [Model Context Protocol](https://modelcontextprotocol.io) servers for extended tool access:

```json
// ~/.claude/claude_desktop_config.json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "***
      }
    }
  }
}
```

Then in Claude Code:

```
> List all open issues in the avelin-api repo

[Claude Code uses GitHub MCP server]
[Claude Code returns issue list]
```

---

## Thinking Mode

AVELIN supports extended thinking for deep reasoning. Claude Code displays thinking blocks before the final answer.

### Enable thinking (default)

Thinking is enabled by default for models that support it (`avelin-coding-pro`, `avelin-coding-ultra`, `avelin-ultra`).

You'll see:
```
[thinking]
Let me analyze the codebase structure...
The auth module uses session-based tokens...
JWT would be better because...

[answer]
I'll refactor the auth module to use JWT...
```

### Disable thinking for simple tasks

For quick questions, disable thinking to save tokens:

```bash
claude --no-thinking "What does this function do?"
```

Or in a session:

```
/thinking off
```

---

## Verification Checklist

After setup, run through these checks:

- [ ] **Basic chat works:** Type "hello" → get a reply within 5 seconds
- [ ] **Streaming works:** Tokens appear one by one
- [ ] **Thinking works:** Ask a hard question → see reasoning before answer
- [ ] **File reading works:** Ask "List files in this directory" → Claude Code reads them
- [ ] **File writing works:** Ask "Create a file called test.py with a hello function" → file is created
- [ ] **Command execution works:** Ask "Run `ls`" → Claude Code executes it
- [ ] **Multi-turn context works:** Ask "What's my name?" after telling it your name earlier

If any check fails, see [Troubleshooting](#troubleshooting).

---

## Advanced Configuration

### Custom Model Selection

Create `~/.claude.json` to set a default model:

```json
{
  "model": "avelin-coding-pro",
  "maxTokens": 65536
}
```

### Project-Level Configuration

Create `.claude.json` in your project root:

```json
{
  "model": "avelin-coding-ultra",
  "systemPrompt": "You are working on a Python FastAPI backend. Use async/await, Pydantic v2, and pytest."
}
```

### Disable Specific Tools

If you want to restrict Claude Code's capabilities:

```bash
claude --no-file-edit  # Prevent file modifications
claude --no-command    # Prevent command execution
```

### Use with Git Hooks

Add Claude Code to your pre-commit hook:

```bash
#!/bin/bash
# .git/hooks/pre-commit
claude --no-file-edit --no-command "Review staged changes for security issues"
```

---

## Example Workflow: Feature Development

```bash
$ claude

> I need to add user authentication to my FastAPI app.
  Currently it has no auth. Plan the implementation.

[Claude Code reads main.py, models.py, existing endpoints]

Here's my plan:
1. Add User model with email/password_hash fields
2. Create auth.py with JWT token generation/validation
3. Add /register and /login endpoints
4. Create auth middleware to protect routes
5. Write tests for all endpoints

Shall I proceed?

> yes

[Claude Code creates models/user.py]
[Claude Code creates auth.py]
[Claude Code updates main.py with new routes]
[Claude Code creates tests/test_auth.py]
[Claude Code runs: pytest]

All 12 tests pass. Here's what I created:
- User model with password hashing (bcrypt)
- JWT token generation/validation
- /register and /login endpoints
- Auth middleware for protected routes
- Comprehensive test suite

Run `pytest tests/test_auth.py` to verify.

> Run the tests and show me the output

[Claude Code runs: pytest tests/test_auth.py -v]

12 passed in 0.85s

All tests pass. Your auth system is ready.
```

---

## Performance Tips

### Speed
- Use `avelin-fast` for simple questions — lowest latency
- Use `avelin-coding-pro` for coding tasks — best speed/quality tradeoff
- Use `avelin-coding-ultra` only for complex design decisions — slower but deeper

### Cost
- Disable thinking for simple tasks: `--no-thinking`
- Use `avelin-fast` for classification/lookup tasks
- AVELIN's prompt caching cuts repeated system prompt costs by ~80%

### Context Management
- For very large repos, use `.claudeignore` (gitignore syntax) to exclude noise:
  ```
  node_modules/
  dist/
  vendor/
  __pycache__/
  *.min.js
  ```
- Start a new session (`/clear`) if context gets too large
- Use `/compact` to summarize and compress the conversation

---

## Troubleshooting

### "API key invalid" or 401 error

**Fix:**
1. Verify `ANTHROPIC_API_KEY` starts with `sk-avelin-`
2. Check `ANTHROPIC_BASE_URL` is `https://api.avelin.ai` (no `/v1`)
3. Re-export the variables:
   ```bash
   export ANTHROPIC_BASE_URL="https://api.avelin.ai"
   export ANTHROPIC_API_KEY="***  ```

### "Model not found" or 404 error

**Fix:**
1. Use a valid AVELIN model name: `avelin-coding-pro`, `avelin-coding-fast`, `avelin-pro`, etc.
2. Check you're not using Anthropic model names (e.g., `claude-3-opus`)
3. Verify the model in `~/.claude.json` is correct

### Connection timeout or slow response

**Fix:**
1. Test connectivity:
   ```bash
   curl -I https://api.avelin.ai/v1/messages
   ```
2. Try a faster model: `avelin-fast`
3. Check your network/firewall

### Claude Code hangs after first message

**Cause:** Claude Code is waiting for thinking to complete.

**Fix:**
- This is normal for complex questions — thinking can take 10-30 seconds
- For faster responses, disable thinking: `claude --no-thinking`

### File edits fail or produce invalid diffs

**Fix:**
1. Use `avelin-coding-pro` — smaller models may not generate valid diffs
2. Make sure files are saved before Claude Code edits them
3. Try a more specific instruction (e.g., "Add error handling to the `processPayment` function" instead of "improve this code")

### Command execution fails

**Fix:**
1. Check the command is valid in your shell
2. Verify Claude Code has permission to run commands (not started with `--no-command`)
3. Check the command output for errors

### "Context window exceeded" error

**Fix:**
1. Start a new session: `/clear`
2. Use `/compact` to summarize the conversation
3. Exclude large files with `.claudeignore`
4. Break the task into smaller steps

### MCP servers not working

**Fix:**
1. Verify `~/.claude/claude_desktop_config.json` is valid JSON
2. Check the MCP server command exists:
   ```bash
   npx -y @modelcontextprotocol/server-filesystem /tmp
   ```
3. Restart Claude Code after editing the config

---

## Comparison with Other CLI Tools

| Feature | Claude Code | Hermes Agent | OpenCode |
|---|---|---|---|
| **Anthropic API** | ✅ Native | ✅ Supported | ✅ Supported |
| **OpenAI API** | ⚠️ Via proxy | ✅ Native | ✅ Native |
| **MCP servers** | ✅ Yes | ✅ Yes | ❌ No |
| **File editing** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Command execution** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Multi-turn context** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Subagent spawning** | ❌ No | ✅ Yes | ❌ No |
| **Persistent memory** | ❌ No | ✅ Yes | ❌ No |

---

## Related

- [API Quickstart](../../api/quickstart.md) — First API call in 5 minutes
- [Hermes Agent Guide](../hermes.md) — Alternative CLI with subagents and persistent memory
- [OpenCode Guide](opencode.md) — Another terminal-based coding tool
- [Model Catalog](../../models/README.md) — Full model comparison
- [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code/overview) — Official documentation
