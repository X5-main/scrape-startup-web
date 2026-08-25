> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Objectives

> Manage strategic objectives — high-level goals that decompose into tasks on the kanban board.

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

`naive objectives` is a second noun for "a goal with tasks under it", on the frozen legacy
runtime. The durable runtime has one noun for work.

| Instead of                          | Use                                                              |
| ----------------------------------- | ---------------------------------------------------------------- |
| `naive objectives create "<title>"` | [`naive teams submit <team> "<goal>" --tenant <tu>`](/docs/cli/teams) |
| linking tasks to an objective       | [`naive teams submit <team> "<goal>" --task <id>`](/docs/cli/teams)   |
| `naive objectives list` / `show`    | [`naive teams board <team> --tenant <tu>`](/docs/cli/teams)           |

The banner id is `dep.objectives`.

## Overview

| Command                           | Description                      | Cost |
| --------------------------------- | -------------------------------- | ---- |
| `naive objectives list`           | List all objectives              | Free |
| `naive objectives create <title>` | Create a new objective           | Free |
| `naive objectives show <id>`      | Show full objective details      | Free |
| `naive objectives update <id>`    | Update status or progress        | Free |
| `naive objectives pause <id>`     | Pause an active objective        | Free |
| `naive objectives abandon <id>`   | Permanently abandon an objective | Free |

## How It Works

Objectives are the top-level unit of strategic planning — they represent weeks-to-months of work. The CEO decomposes objectives into tasks on the kanban board, then dispatches them to employees. Objectives can have a `pg_cron` schedule for automated advancement.

Statuses: `active` → `paused` | `completed` | `abandoned`

***

## List Objectives

```bash theme={"theme":"css-variables"}
naive objectives list
```

Returns all objectives with their status, progress, and linked task counts.

***

## Create an Objective

```bash theme={"theme":"css-variables"}
naive objectives create "Launch email marketing campaign"
naive objectives create "Build company website" --criteria "3 pages live, mobile responsive"
naive objectives create "Hire engineering team" --drive "Scale product development" --priority high
```

### Options

| Flag                 | Description                                     |
| -------------------- | ----------------------------------------------- |
| `--criteria <text>`  | Success criteria — how to know this is done     |
| `--drive <text>`     | Driving motivation or business rationale        |
| `--schedule <text>`  | Target timeline (e.g., "2 weeks", "2025-02-01") |
| `--priority <level>` | low, medium (default), high, critical           |

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "objectives.create",
  "result": {
    "id": "obj-abc-123",
    "title": "Build company website",
    "status": "active"
  },
  "next_steps": [
    { "command": "naive objectives show obj-abc-123", "description": "View the new objective" },
    { "command": "naive ceo run \"Decompose and execute objectives\"", "description": "Have the CEO start working on this" }
  ],
  "hints": [
    "Objective created: \"Build company website\" (id: obj-abc-123)",
    "The CEO will decompose this into tasks during its next run"
  ]
}
```

***

## Show Objective

```bash theme={"theme":"css-variables"}
naive objectives show obj-abc-123
```

Returns full details: title, status, progress, success criteria, driving rationale, schedule, and linked tasks.

***

## Update an Objective

```bash theme={"theme":"css-variables"}
naive objectives update obj-abc-123 --progress 75
naive objectives update obj-abc-123 --status completed
naive objectives update obj-abc-123 --status active --progress 50
```

### Options

| Flag                | Description                 |
| ------------------- | --------------------------- |
| `--status <status>` | active, paused, completed   |
| `--progress <n>`    | Progress percentage (0-100) |

***

## Pause an Objective

```bash theme={"theme":"css-variables"}
naive objectives pause obj-abc-123
```

Pausing an objective:

* Sets status to `paused`
* Existing in-progress tasks continue
* No new tasks are created or dispatched for this objective
* Resume with `naive objectives update <id> --status active`

***

## Abandon an Objective

```bash theme={"theme":"css-variables"}
naive objectives abandon obj-abc-123
```

Permanently abandons the objective. Cancels all pending/in-progress tasks linked to it. Completed tasks are preserved. **This cannot be undone.**

***

## Typical Workflow

```bash theme={"theme":"css-variables"}
# 1. Define a goal
naive objectives create "Launch product X" --criteria "Landing page live, 10 signups"

# 2. Let the CEO execute
naive ceo run "Decompose and execute objectives"

# 3. Monitor progress
naive objectives show obj-abc-123
naive tasks list --objective obj-abc-123

# 4. Track progress
naive objectives update obj-abc-123 --progress 50

# 5. Complete when done
naive objectives update obj-abc-123 --status completed
```
