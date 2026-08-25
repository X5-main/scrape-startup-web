> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# CEO Agent

> Communicate with the CEO agent — run prompts, send messages, stream real-time output, and monitor sessions.

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

`naive ceo` drives the legacy orchestration runtime's lead agent, which is frozen.

| Instead of                            | Use                                                               |
| ------------------------------------- | ----------------------------------------------------------------- |
| `naive ceo run` / `naive ceo message` | [`naive teams say <team> --tenant <tu>`](/docs/cli/teams)              |
| `naive ceo status`                    | [`naive teams show <team> --tenant <tu>`](/docs/cli/teams)             |
| `naive ceo sessions`                  | [`naive teams runs <team> --tenant <tu>`](/docs/cli/teams)             |
| `naive ceo stream <runId>`            | [`naive teams watch <team> --run <id> --tenant <tu>`](/docs/cli/teams) |

The banner id is `dep.ceo`. It is the one string that identifies this deprecation across the
CLI banner, the JSON envelope and the API's response headers, so grep for that rather than for
the wording.

## Overview

| Command                    | Description                                      | Cost                    |
| -------------------------- | ------------------------------------------------ | ----------------------- |
| `naive ceo run <prompt>`   | Start a new CEO run with a prompt                | Credits (based on work) |
| `naive ceo message <text>` | Send a message to an active CEO session          | Free                    |
| `naive ceo status`         | Get the CEO's current state                      | Free                    |
| `naive ceo sessions`       | List all CEO sessions                            | Free                    |
| `naive ceo stream <runId>` | Stream real-time output from a CEO run (SSE)     | Free                    |
| `naive ceo team-approve`   | Approve a CEO-proposed team and provision agents | —                       |

## How It Works

The CEO is a persistent **Hermes gateway** process that runs continuously in your company container. When you send it a prompt via `naive ceo run`, it:

1. Interprets the prompt and identifies objectives
2. Proposes a team composition and task breakdown
3. After user approves in chat, hires employees and creates tasks via CLI
4. Workers are spawned automatically per task by the kanban dispatcher
5. Reports back with results

You can steer the CEO mid-run with `naive ceo message` or watch output live with `naive ceo stream`.

All LLM calls from the CEO are proxied through the API (the container only holds the `nv_sk_*` token, never raw provider keys) and charged against your credit balance.

***

## Run a Prompt

```bash theme={"theme":"css-variables"}
naive ceo run "Analyze our competitors and draft a strategy"
```

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "ceo.run",
  "result": {
    "run_id": "run-abc-123",
    "pid": 12345,
    "status": "started"
  },
  "next_steps": [
    { "command": "naive ceo stream run-abc-123", "description": "Stream real-time output from this run" },
    { "command": "naive ceo status", "description": "Check the CEO's current status" },
    { "command": "naive tasks list", "description": "See tasks the CEO has created" }
  ],
  "hints": [
    "CEO run started (id: run-abc-123)",
    "The CEO is now decomposing your prompt into actionable tasks",
    "Use 'naive ceo stream' to watch progress in real-time"
  ]
}
```

***

## Send a Message

Sends a real-time message to the active CEO session. Use to steer priorities or request updates.

```bash theme={"theme":"css-variables"}
naive ceo message "Focus on the marketing tasks first"
```

***

## Check Status

```bash theme={"theme":"css-variables"}
naive ceo status
```

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "ceo.status",
  "result": {
    "state": "running",
    "active_run_id": "run-abc-123",
    "profileName": "ceo",
    "lastHeartbeat": "2025-01-15T10:30:00Z"
  },
  "hints": ["CEO is currently: running"]
}
```

Possible states: `idle`, `running`, `error`, `stopped`.

***

## List Sessions

```bash theme={"theme":"css-variables"}
naive ceo sessions
```

Returns a list of all CEO sessions (past and current) including run IDs, prompts, statuses, and timestamps.

***

## Stream Output (SSE)

Opens a Server-Sent Events connection to stream the CEO's real-time output.

```bash theme={"theme":"css-variables"}
naive ceo stream <runId>
```

Events include:

* `thought` — CEO's reasoning steps
* `task_created` — new task dispatched
* `task_completed` — employee finished a task
* `message` — CEO status updates
* `done` — run completed
* `error` — something went wrong

Press `Ctrl+C` to stop streaming (the run continues in the background).

***

## Typical Workflow

```bash theme={"theme":"css-variables"}
# 1. Start a CEO run
naive ceo run "Launch a new product line"

# 2. Watch output live
naive ceo stream <runId>

# 3. CEO proposes a team — approve via message
naive ceo message "Looks good, go ahead and hire them"

# 4. Steer mid-run
naive ceo message "Prioritize the SEO analysis"

# 5. Check status later
naive ceo status

# 6. Review sessions
naive ceo sessions
```
