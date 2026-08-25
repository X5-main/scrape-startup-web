> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Memory

> Manage persistent agent memory — add, list, and remove facts and preferences that persist across sessions.

<Warning>
  **Deprecated — the legacy orchestration runtime. It keeps working.** This page documents a
  command group that drives the frozen legacy runtime (also called: orchestration, warm pool,
  instance pool, Hermes, sidecar, container runtime, hosted runtime, `runtime.pool`). It keeps
  working for existing configs and accepts no new capabilities. Nothing here is disabled, refused
  or gated, and no route or CLI command on this page has been removed.

  Since **2026-08** each command on this page also prints a one-line banner on **stderr** and
  attaches a machine-readable `deprecation` object to the JSON envelope on **stdout**, which stays
  `JSON.parse`-able. There is **no sunset date**: the surface is frozen, not scheduled for
  removal.

  New work declares a **`team({ lead, agents })`** on **`runtime.durable()`** and submits work
  with **`naive teams submit`**. The per-subcommand replacement is in the table directly below.
</Warning>

## Replacement

`naive memory` is a per-agent fact store. "Memory" is a retired product noun: the **brain** is
the one memory. A company may hold several brains with one flagged as the default, and each is
sliced by partition and lane — rather than one file per agent.

| Instead of                                 | Use                                              |
| ------------------------------------------ | ------------------------------------------------ |
| `naive memory add "<fact>"`                | [`naive brain remember "<fact>"`](/docs/cli/brain)    |
| `naive memory list`                        | [`naive brain recall "<query>"`](/docs/cli/brain)     |
| `naive memory remove --text "<substring>"` | [`naive brain forget <scope> <ref>`](/docs/cli/brain) |

Two differences will bite on day one if you assume they are the same thing:

* **`brain forget` is approval-gated for an API key** and `memory remove` is not. Under an agent
  key `forget` can return `202 pending_approval` and erase nothing until a human approves.
* **`memory` is on by default; `brain` is opt-in.** A gated brain call from a tenant whose
  Account Kit has no `brain` entry is **denied**, where the same tenant's `memory` calls work.
  Check [`naive account-kits`](/docs/cli/account-kits) before migrating a tenant.

The banner id is `dep.memory`.

## Overview

| Command                      | Description                      | Cost |
| ---------------------------- | -------------------------------- | ---- |
| `naive memory add <content>` | Add a new memory entry           | Free |
| `naive memory list`          | List all stored memories         | Free |
| `naive memory remove`        | Remove a memory by matching text | Free |

## How It Works

Memories persist across agent sessions and are injected into agent context automatically. They map to Hermes' `MEMORY.md` and `USER.md` files.

**Important**: Hermes owns the memory files. When you use `naive memory add`, the content is sent as a message to the CEO agent, which naturally incorporates it into its memory. The sidecar then mirrors the updated `MEMORY.md` to the datastore for read access via `naive memory list`.

### Memory Targets

| Target   | File        | Purpose                                                                    |
| -------- | ----------- | -------------------------------------------------------------------------- |
| `memory` | `MEMORY.md` | Factual knowledge the agent should retain (company info, procedures, etc.) |
| `user`   | `USER.md`   | User interaction preferences (communication style, timezone, formatting)   |

***

## Add a Memory

```bash theme={"theme":"css-variables"}
naive memory add --target memory "Our primary domain is example.com"
naive memory add --target user "User is based in EST timezone"
naive memory add --target memory "Tech stack: Next.js, the managed database, payments" --agent-id engineer-1
```

### Options

| Flag              | Required | Description                                                 |
| ----------------- | -------- | ----------------------------------------------------------- |
| `--target <type>` | Yes      | `memory` (agent facts) or `user` (user preferences)         |
| `--agent-id <id>` | No       | Specific agent to store memory for (default: current agent) |

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "memory.add",
  "result": { "status": "memory_requested", "run": { "run_id": "run-abc-123" } },
  "hints": [
    "Memory sent to CEO for incorporation (target: memory)",
    "This will be included in agent context for future runs"
  ]
}
```

<Note>
  Memory writes go through the CEO agent — Hermes owns `MEMORY.md`. The CEO incorporates your content naturally into its memory during its next turn. Use `naive memory list` after a few seconds to verify it was stored.
</Note>

***

## List Memories

```bash theme={"theme":"css-variables"}
naive memory list
naive memory list --agent-id ceo-1
naive memory list --target user
```

### Options

| Flag              | Description                           |
| ----------------- | ------------------------------------- |
| `--agent-id <id>` | Filter by agent ID                    |
| `--target <type>` | Filter by target type: memory or user |

***

## Remove a Memory

Searches for the first memory containing the `--text` substring and removes it.

```bash theme={"theme":"css-variables"}
naive memory remove --target memory --text "brand color"
naive memory remove --target user --text "timezone"
naive memory remove --target memory --text "payments" --agent-id ceo-1
```

### Options

| Flag                 | Required | Description                         |
| -------------------- | -------- | ----------------------------------- |
| `--target <type>`    | Yes      | `memory` or `user`                  |
| `--text <substring>` | Yes      | Text to match                       |
| `--agent-id <id>`    | No       | Specific agent's memories to search |

***

## Typical Workflow

```bash theme={"theme":"css-variables"}
# 1. Store company facts
naive memory add --target memory "Our company brand color is #FF6B00"
naive memory add --target memory "We use Naive payments, account ID: acct_123"

# 2. Set user preferences
naive memory add --target user "User prefers concise bullet-point responses"
naive memory add --target user "Always address the user as 'Chief'"

# 3. Review stored memories
naive memory list

# 4. Remove outdated info
naive memory remove --target memory --text "brand color"
```
