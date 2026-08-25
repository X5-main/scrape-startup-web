> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Cron Jobs

> Schedule recurring jobs — create, list, trigger, pause, and remove automated scheduled tasks.

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

`naive cron` schedules work on the frozen legacy runtime.

| Instead of                              | Use                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------- |
| `naive cron create <schedule> <prompt>` | [`naive teams schedule <team> <cron> "<goal>" --tenant <tu>`](/docs/cli/teams) |
| `naive cron remove <id>`                | [`naive teams unschedule <team> <id> --tenant <tu>`](/docs/cli/teams)          |
| `naive cron list` / `trigger`           | [`naive teams show`](/docs/cli/teams) · [`naive teams submit`](/docs/cli/teams)     |

`naive cron pause` has **no replacement**: the durable runtime has no pause. Stop the team, or
unschedule. The banner id is `dep.cron`.

<Warning>
  **`naive cron` the CLI is deprecated. `/v1/cron/*` the URL prefix is not.**

  That prefix has two unrelated tenants. Nine of its routes are **platform reconcilers** invoked
  by the scheduler with a shared secret, not by you: `drain-events`, `reconcile-connections`,
  `reconcile-billing`, `reconcile-agent-profiles`, `reconcile-deliveries`,
  `reconcile-deployments`, `verify-domains`, `charge-phone-rentals` and `process-conversions`.
  None of them is deprecated, none carries a deprecation header, and none is affected by anything
  on this page. If you are looking at a `/v1/cron/…` request in a log, check which of the two it
  is before concluding anything.
</Warning>

## Overview

| Command                                 | Description                   | Cost                       |
| --------------------------------------- | ----------------------------- | -------------------------- |
| `naive cron create <schedule> <prompt>` | Create a new scheduled job    | Free (cost on each firing) |
| `naive cron list`                       | List all cron jobs            | Free                       |
| `naive cron trigger <id>`               | Manually trigger a job now    | Credits (based on work)    |
| `naive cron pause <id>`                 | Pause a cron job              | Free                       |
| `naive cron remove <id>`                | Delete a cron job permanently | Free                       |

## How It Works

Cron jobs are managed through the Hermes gateway's native **Jobs API** (`/api/jobs`). Each firing sends a prompt to the CEO, which creates tasks and dispatches them to employees. This enables automated recurring workflows like weekly reports, daily email checks, or scheduled social media content.

***

## Create a Cron Job

```bash theme={"theme":"css-variables"}
naive cron create "0 9 * * *" "Check email and respond to urgent messages"
naive cron create "0 */6 * * *" "Monitor social media mentions" --skill naive-social
naive cron create "0 0 * * 1" "Generate weekly analytics report" --name "Weekly Report"
```

### Options

| Flag             | Description                                       |
| ---------------- | ------------------------------------------------- |
| `--skill <name>` | Skill to invoke (e.g., naive-social, naive-email) |
| `--name <name>`  | Human-readable name for the job                   |

### Schedule Format (Cron Expression)

| Expression     | Meaning                              |
| -------------- | ------------------------------------ |
| `0 9 * * *`    | Every day at 9:00 AM UTC             |
| `0 */6 * * *`  | Every 6 hours                        |
| `0 9 * * 1`    | Every Monday at 9:00 AM UTC          |
| `0 0 1 * *`    | First day of every month at midnight |
| `*/30 * * * *` | Every 30 minutes                     |

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "cron.create",
  "result": {
    "id": "cron-abc-123",
    "schedule": "0 9 * * *",
    "name": "Weekly Report",
    "status": "active"
  },
  "hints": [
    "Cron job created (id: cron-abc-123)",
    "Schedule: 0 9 * * *",
    "The job will fire automatically at the next scheduled interval"
  ]
}
```

***

## List Cron Jobs

```bash theme={"theme":"css-variables"}
naive cron list
```

Returns all cron jobs with:

* ID, name, schedule (cron expression)
* Status (active, paused)
* Prompt that fires on each run
* Last run timestamp and result
* Next scheduled run time

***

## Trigger Manually

Fires the job immediately, regardless of schedule. The regular schedule is not affected.

```bash theme={"theme":"css-variables"}
naive cron trigger cron-abc-123
```

***

## Pause a Job

```bash theme={"theme":"css-variables"}
naive cron pause cron-abc-123
```

The job remains configured but will not fire on schedule. You can still trigger it manually with `naive cron trigger`.

***

## Remove a Job

```bash theme={"theme":"css-variables"}
naive cron remove cron-abc-123
```

Permanently deletes the cron job. Past executions remain in history. **Cannot be undone.**

***

## Typical Workflow

```bash theme={"theme":"css-variables"}
# 1. Create a recurring job
naive cron create "0 9 * * *" "Check inbox and summarize new emails"

# 2. Test it immediately
naive cron trigger cron-abc-123

# 3. View all jobs
naive cron list

# 4. Pause if needed
naive cron pause cron-abc-123

# 5. Delete when done
naive cron remove cron-abc-123
```
