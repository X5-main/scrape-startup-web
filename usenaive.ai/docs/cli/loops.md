> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Loops

> First-class recurring agent runs — create, list, pause/resume, run now, and remove.

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

`naive loops` schedules recurring agent runs on the frozen legacy runtime.

| Instead of                                               | Use                                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------- |
| `naive loops create --schedule <cron> --prompt "<text>"` | [`naive teams schedule <team> <cron> "<goal>" --tenant <tu>`](/docs/cli/teams) |
| `naive loops remove <id>`                                | [`naive teams unschedule <team> <id> --tenant <tu>`](/docs/cli/teams)          |
| `naive loops run <id>`                                   | [`naive teams submit <team> "<goal>" --tenant <tu>`](/docs/cli/teams)          |

Note that `naive loops update --no-active` (pause) has no durable equivalent for the same reason
`naive cron pause` does not: the durable runtime has no pause. Unschedule and re-schedule.

The banner id is `dep.loops`.

## Overview

A **Loop** is a recurring agent run built on the [trigger
router](/docs/architecture/event-router): a `cron`-source subscription bound to an
agent. It's the governed, observable wrapper over a raw [cron
job](/docs/cli/cron-jobs) — creating a loop records the binding **and** creates the
backing cron job that executes it.

| Command                                                | Description                              | Cost                       |
| ------------------------------------------------------ | ---------------------------------------- | -------------------------- |
| `naive loops create --schedule <cron> --prompt <text>` | Create a recurring agent run             | Free (cost on each firing) |
| `naive loops list`                                     | List all loops                           | Free                       |
| `naive loops get <id>`                                 | Show one loop                            | Free                       |
| `naive loops update <id> [--no-active\|--active] ...`  | Pause/resume or edit a loop              | Free                       |
| `naive loops run <id>`                                 | Run once now                             | Credits (based on work)    |
| `naive loops remove <id>`                              | Delete a loop (and its backing cron job) | Free                       |

## Create a Loop

```bash theme={"theme":"css-variables"}
naive loops create \
  --schedule "0 9 * * *" \
  --prompt "Review overnight email and summarize what needs my attention" \
  --name "Morning inbox triage"
```

### Options

| Flag                | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `--schedule <cron>` | **Required.** Cron expression (see below)            |
| `--prompt <text>`   | **Required.** Prompt to run each time the loop fires |
| `--name <name>`     | Human-readable name for the loop                     |
| `--profile <name>`  | Agent profile to run as (defaults to the CEO)        |
| `--user <id>`       | Target a specific tenant user                        |

### Schedule Format (Cron Expression)

| Expression     | Meaning                      |
| -------------- | ---------------------------- |
| `0 9 * * *`    | Every day at 9:00 AM UTC     |
| `*/30 * * * *` | Every 30 minutes             |
| `0 */6 * * *`  | Every 6 hours                |
| `0 0 * * 1`    | Every Monday at midnight UTC |

### Output

The response includes the created loop and the `cron_job_id` of the backing
executor (`null` if no runtime is reachable yet — the binding still persists and
syncs later).

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "loops.create",
  "result": {
    "loop": {
      "id": "loop_01H...",
      "name": "Morning inbox triage",
      "schedule": "0 9 * * *",
      "active": true,
      "source": "cron",
      "kind": "loop",
      "target": { "prompt": "Review overnight email and summarize what needs my attention" }
    },
    "cron_job_id": "cron-abc-123"
  },
  "hints": [
    "Loop created (id: loop_01H...)",
    "Schedule: 0 9 * * *",
    "Name: Morning inbox triage",
    "Backing cron job: cron-abc-123"
  ]
}
```

***

## List Loops

```bash theme={"theme":"css-variables"}
naive loops list
```

Returns all loops with:

* `id`, `name`, `schedule` (cron expression), `active`
* `target` (prompt + optional `profileName`)
* `cronJobId` of the backing executor

***

## Get a Loop

```bash theme={"theme":"css-variables"}
naive loops get loop_01H...
```

Shows a single loop's full details.

***

## Update a Loop (pause / resume / edit)

Pausing and resuming a loop leaves the runtime untouched — only the binding row
changes.

```bash theme={"theme":"css-variables"}
naive loops update loop_01H... --no-active            # pause (won't fire on schedule)
naive loops update loop_01H... --active               # resume
naive loops update loop_01H... --prompt "New instructions"
naive loops update loop_01H... --name "Renamed loop" --profile support
```

### Options

| Flag                       | Description                   |
| -------------------------- | ----------------------------- |
| `--active` / `--no-active` | Resume / pause the loop       |
| `--name <name>`            | New human-readable name       |
| `--prompt <text>`          | New prompt to run each firing |
| `--profile <name>`         | New agent profile to run as   |
| `--user <id>`              | Target a specific tenant user |

***

## Run Now

Fires the loop immediately, regardless of schedule. The regular schedule is not
affected. Returns the `run_id` of the triggered run.

```bash theme={"theme":"css-variables"}
naive loops run loop_01H...
```

***

## Remove a Loop

```bash theme={"theme":"css-variables"}
naive loops remove loop_01H...
```

Permanently deletes the loop binding and best-effort removes the backing cron
job. **Cannot be undone.**

***

## Typical Workflow

```bash theme={"theme":"css-variables"}
# 1. Create a recurring agent run
naive loops create --schedule "0 9 * * *" --prompt "Summarize overnight email" --name "Morning triage"

# 2. Test it immediately
naive loops run loop_01H...

# 3. View all loops
naive loops list

# 4. Pause if needed
naive loops update loop_01H... --no-active

# 5. Delete when done
naive loops remove loop_01H...
```

## Loops vs. Cron Jobs

[`naive cron`](/docs/cli/cron-jobs) is a push-through to the runtime's scheduler. A
Loop wraps it with a binding-registry row and per-run
[delivery status](/docs/api-reference/events/delivery-status), and pauses/resumes
without touching the runtime. The executor is the cloud sidecar cron.

See [Loops](/docs/getting-started/loops) for the API-level reference.
