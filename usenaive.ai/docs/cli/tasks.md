> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Tasks

> Kanban task management — list, create, complete, block, and dispatch tasks across your AI workforce.

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

`naive tasks` drives the legacy orchestration runtime's board, which is frozen.

| Instead of                     | Use                                                                         |
| ------------------------------ | --------------------------------------------------------------------------- |
| `naive tasks create "<title>"` | [`naive teams submit <team> "<goal>" --tenant <tu>`](/docs/cli/teams)            |
| `naive tasks list` / `stats`   | [`naive teams board <team> --tenant <tu>`](/docs/cli/teams)                      |
| `naive tasks show <id>`        | [`naive teams task <team> <id> --tenant <tu>`](/docs/cli/teams)                  |
| `naive tasks unblock <id>`     | [`naive teams unblock <team> <id> --tenant <tu> --because "…"`](/docs/cli/teams) |

**Three subcommands have no replacement**, and the reason is recorded rather than left implicit:

| No replacement for     | Because                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `naive tasks complete` | the durable runtime completes through the judge plus attestation, not an operator `POST` |
| `naive tasks dispatch` | the durable runtime dispatches from the board itself                                     |
| `naive tasks run`      | work is **submitted**, not run — `naive teams submit` is the one verb                    |

The banner id is `dep.tasks`.

<Note>
  For a tenant still on the legacy (hermes) runtime, `naive teams submit` answers
  `501 not_configured` — `naive tasks create` remains the working way to put work on that
  board, which is why this page is deprecated rather than removed.
</Note>

## Overview

| Command                           | Description                                 | Cost |
| --------------------------------- | ------------------------------------------- | ---- |
| `naive tasks list`                | List tasks with optional filters            | Free |
| `naive tasks create <title>`      | Create a new task                           | Free |
| `naive tasks show <id>`           | Show full task details                      | Free |
| `naive tasks run <id>`            | Trigger a worker to execute a specific task | Free |
| `naive tasks complete <id>`       | Mark a task as completed                    | Free |
| `naive tasks block <id>`          | Mark a task as blocked                      | Free |
| `naive tasks unblock <id>`        | Remove blocked status                       | Free |
| `naive tasks comment <id> <text>` | Add a comment to a task                     | Free |
| `naive tasks dispatch`            | Auto-assign pending tasks to employees      | Free |
| `naive tasks stats`               | Show board statistics                       | Free |

## How It Works

Tasks are the unit of work in the naive kanban system. The CEO creates objectives, which are broken into tasks, which are assigned to employees. Tasks flow through statuses: `pending` → `in_progress` → `completed` (or `blocked`).

The embedded kanban dispatcher in the Hermes gateway automatically spawns worker processes for assigned tasks every 15 seconds. Workers call `kanban_complete()` when done.

***

## List Tasks

```bash theme={"theme":"css-variables"}
naive tasks list
naive tasks list --status in_progress
naive tasks list --assignee "Dev Diana"
naive tasks list --objective obj-abc-123
```

### Options

| Flag                 | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `--status <status>`  | Filter by: pending, in\_progress, completed, blocked |
| `--assignee <agent>` | Filter by assignee name                              |
| `--objective <id>`   | Filter by parent objective ID                        |

***

## Create a Task

```bash theme={"theme":"css-variables"}
naive tasks create "Write blog post about AI trends"
naive tasks create "Deploy landing page" --assignee "Dev Diana" --priority high
naive tasks create "Research competitors" --description "Find top 5 competitors and analyze features" --objective obj-abc-123
```

### Options

| Flag                   | Description                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `--assignee <name>`    | Assign to an employee by **name** (e.g., `--assignee "Jordan Kim"`). Must match the employee name exactly. |
| `--objective <id>`     | Link to a parent objective                                                                                 |
| `--priority <level>`   | `low`, `medium` (default), `high`, or `critical`                                                           |
| `--description <text>` | Detailed task description (strongly recommended — workers need this to understand assignments)             |

<Note>
  The title is a **positional argument** (no `--title` flag needed). Task IDs can be either standard UUIDs or Hermes task IDs (e.g., `t_a2a1ae0c`) — both formats are accepted by all task commands.
</Note>

***

## Complete a Task

```bash theme={"theme":"css-variables"}
naive tasks complete abc-123 --summary "Blog post published at /blog/ai-trends"
naive tasks complete abc-123 --metadata '{"url": "https://example.com"}'
```

### Options

| Flag                | Description             |
| ------------------- | ----------------------- |
| `--summary <text>`  | Completion summary      |
| `--metadata <json>` | JSON metadata to attach |

***

## Block / Unblock

```bash theme={"theme":"css-variables"}
naive tasks block abc-123 --reason "Waiting for domain DNS propagation"
naive tasks unblock abc-123
```

Blocked tasks are surfaced to the CEO for resolution or re-assignment.

***

## Add a Comment

```bash theme={"theme":"css-variables"}
naive tasks comment abc-123 "Added SEO meta tags to the blog post"
```

Comments create an activity trail visible to all agents and the CEO.

***

## Run a Task

Directly trigger a worker to start executing a specific assigned task. The task must already have an assignee.

```bash theme={"theme":"css-variables"}
naive tasks run abc-123
naive tasks run t_a2a1ae0c
```

This triggers the kanban dispatcher to immediately spawn a worker for the specified task. Use it when you want to start work on a task without waiting for the periodic auto-dispatch.

<Note>
  The task must be assigned to an employee and not be in `done` or `blocked` status. If unassigned, use `naive tasks create` with `--assignee` or `PATCH` the task first.
</Note>

***

## Dispatch Tasks

Auto-assign pending tasks to available employees based on skills and capacity.

```bash theme={"theme":"css-variables"}
naive tasks dispatch
```

***

## Board Statistics

```bash theme={"theme":"css-variables"}
naive tasks stats
```

Returns task counts by status, employee utilization, and blocked task summary.

***

## Typical Workflow

```bash theme={"theme":"css-variables"}
# 1. Create a task with a description
naive tasks create "Write blog post" --assignee "Content Casey" --description "Write a 1500-word post about AI trends in 2026" --priority high

# 2. Monitor active work
naive tasks list --status in_progress

# 3. Add guidance
naive tasks comment <id> "Add SEO keywords"

# 4. Complete
naive tasks complete <id> --summary "Published to blog"

# 5. Review board health
naive tasks stats
```
