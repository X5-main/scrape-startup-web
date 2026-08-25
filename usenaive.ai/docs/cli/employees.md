> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Employees

> Manage AI employees — hire, fire, configure, and list your autonomous workforce.

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

`naive employees` drives the frozen legacy runtime's roster and its provisioning verbs.

| Instead of             | Use                                                     |
| ---------------------- | ------------------------------------------------------- |
| `naive employees list` | [`naive teams roster <team> --tenant <tu>`](/docs/cli/teams) |

**The provisioning verbs — `hire`, `fire`, `configure` — have no replacement, by design.** On
the durable runtime a role is **declared** in `naive.config.ts` as an `agent()` inside a
`team()`, and the runtime refuses an undeclared role with a `409`. There is deliberately no
imperative equivalent: a workforce you can change with a one-off command is a workforce whose
current shape is not written down anywhere.

The banner id is `dep.employees`.

## Overview

| Command                          | Description                   | Cost             |
| -------------------------------- | ----------------------------- | ---------------- |
| `naive employees list`           | List all employees            | Free             |
| `naive employees hire`           | Hire a new AI employee        | Per-plan pricing |
| `naive employees fire <id>`      | Terminate an employee         | Free             |
| `naive employees configure <id>` | Update model, skills, or name | Free             |

## How It Works

Employees are AI agents that execute tasks on the kanban board. Each employee has a role, a model configuration, and a set of skills that determine which tasks they can handle.

When an employee is hired, a Hermes profile is created with a `config.yaml`, `SOUL.md`, and `.env` file containing LLM proxy credentials and Naive CLI access. The employee name becomes the kanban assignee identifier — task assignment uses names (e.g., `--assignee "Dev Diana"`), not UUIDs.

**Recommended flow**: Let the CEO propose a team based on your objective. When you approve in chat, the CEO hires employees and assigns tasks automatically using CLI commands. You can also hire employees manually using the commands below.

***

## List Employees

```bash theme={"theme":"css-variables"}
naive employees list
```

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "employees.list",
  "result": {
    "employees": [
      {
        "id": "emp-abc-123",
        "name": "Dev Diana",
        "role": "engineer",
        "status": "idle",
        "skills": ["typescript", "react", "devops"],
        "tasks_completed": 12
      }
    ]
  },
  "hints": ["3 employees in your company", "1 currently working on tasks"]
}
```

Possible employee statuses: `idle`, `working`, `offline`, `error`.

***

## Hire an Employee

```bash theme={"theme":"css-variables"}
naive employees hire --role engineer --name "Dev Diana"
naive employees hire --role marketer --name "Marketing Max" --skills "seo,content,social"
naive employees hire --role writer --name "Content Casey" --model gpt-4o
```

### Options

| Flag                | Required | Description                                 |
| ------------------- | -------- | ------------------------------------------- |
| `--role <role>`     | Yes      | Employee role (see below)                   |
| `--name <name>`     | Yes      | Display name                                |
| `--skills <skills>` | No       | Comma-separated skill tags                  |
| `--model <model>`   | No       | AI model (auto-selected by role if omitted) |

### Available Roles

| Role         | Specialization                                    |
| ------------ | ------------------------------------------------- |
| `engineer`   | Coding, deployment, infrastructure                |
| `marketer`   | SEO, social media, content marketing, ads         |
| `writer`     | Blog posts, copy, documentation, emails           |
| `sales`      | Outreach, lead generation, proposals              |
| `designer`   | Branding, visual assets, UI mockups               |
| `researcher` | Market research, competitive analysis, reports    |
| `support`    | Customer service, ticket handling, FAQ management |

***

## Fire an Employee

```bash theme={"theme":"css-variables"}
naive employees fire emp-abc-123
```

What happens:

1. Employee is marked as archived (soft delete)
2. Active tasks are returned to `pending` status
3. The employee can no longer receive new tasks
4. Historical task completions are preserved

***

## Configure an Employee

```bash theme={"theme":"css-variables"}
naive employees configure emp-123 --model gpt-4o
naive employees configure emp-123 --skills "typescript,react,nextjs,devops"
naive employees configure emp-123 --name "Senior Dev Diana" --model claude-sonnet-4-20250514
```

### Options

| Flag                | Description                          |
| ------------------- | ------------------------------------ |
| `--model <model>`   | Change the AI model                  |
| `--skills <skills>` | Replace skill tags (comma-separated) |
| `--name <name>`     | Update display name                  |

Changes take effect for the next task the employee picks up.

***

## Typical Workflow

```bash theme={"theme":"css-variables"}
# 1. Hire employees
naive employees hire --role engineer --name "Alice"
naive employees hire --role marketer --name "Bob" --skills "seo,social"

# 2. View your team
naive employees list

# 3. Dispatch tasks to them
naive tasks dispatch

# 4. Configure as needed
naive employees configure emp-123 --model gpt-4o --skills "typescript,react"

# 5. Terminate if no longer needed
naive employees fire emp-123
```
