> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Orchestration Overview

> AI workforce orchestration — CEO agent, kanban tasks, objectives, employees, cron scheduling, and persistent memory.

<Warning>
  **The whole orchestration surface is deprecated, and every route on it keeps
  answering.** It drives the legacy orchestration runtime, which is FROZEN — it accepts no new capabilities. The durable runtime enforces policy at the tool boundary, not only at the gateway, and it is the only runtime new work is built on.

  Nothing here is removed and no response shape changes. The announcement is carried
  in response headers only — `Deprecation` ([RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html)),
  `Link rel="deprecation"`, `Warning: 299`, `X-Naive-Deprecation-Id` and, for a
  `{kind:"use"}` row, `X-Naive-Replacement`. There is no `Sunset` header on any of
  them: every row is `frozen`, and a `Sunset` would be a date the platform has not
  promised.

  | Deprecation id                | What                                                   | Replacement                                                                                 |
  | ----------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
  | `dep.primitive.ceo`           | `naive ceo` and `/v1/companies/:id/ceo`                | `naive teams say — the lead is a role now, not a fixed "ceo"`                               |
  | `dep.primitive.tasks`         | `naive tasks` and `/v1/tasks`                          | `naive teams submit <team> "<goal>" --tenant <tu>`                                          |
  | `dep.primitive.objectives`    | `naive objectives` and `/v1/objectives`                | `naive teams submit --task — a goal with tasks under it, not a second noun`                 |
  | `dep.primitive.employees`     | `naive employees` and `/v1/employees`                  | `naive teams roster`                                                                        |
  | `dep.primitive.cron`          | `naive cron` and `/v1/cron`                            | `naive teams schedule / naive teams unschedule — 5 of the 8 subcommands map`                |
  | `dep.primitive.memory`        | `naive memory` and `/v1/memory`                        | `naive brain remember / naive brain forget`                                                 |
  | `dep.primitive.loops`         | `/v1/loops`                                            | `naive teams schedule — a loop is a schedule with a goal`                                   |
  | `dep.surface.runs`            | the company-scoped run ledger (`/v1/runs`)             | `GET /v1/teams/:team/tenants/:tenantUserId/runs — runs are addressed by (team, tenant) now` |
  | `dep.surface.company-channel` | the company channel (`/v1/company-channel`)            | `GET/POST /v1/teams/:team/tenants/:tenantUserId/sessions/:channel/messages`                 |
  | `dep.surface.agent-chat`      | per-agent chat (`/v1/companies/:id/agents/:agentId/*`) | `POST /v1/teams/:team/tenants/:tenantUserId/sessions/:channel/messages with `as\`\`         |

  Announced 2026-07-29. The freeze ends when
  `company_containers with provider='hermes' and status='running' reaches zero` — not on a date.

  **Two things on this page are NOT deprecated.** `POST /v1/cron/reconcile-*`,
  `POST /v1/cron/drain-events` and `POST /v1/cron/process-conversions` are
  shared-secret platform reconcilers that merely share the `/v1/cron` prefix; and
  the sidecar control API described in [API Overview](/docs/api-reference/overview) is
  the wire the legacy runtime is driven over, which stays frozen rather than
  deprecated.

  Replacement surface: [the durable runtime API](/docs/api-reference/runtime/overview).
</Warning>

The Orchestration API provides full lifecycle management of your AI workforce. It includes a CEO agent that interprets high-level prompts and decomposes them into actionable work across a kanban system — objectives, tasks, employees, cron jobs, and persistent memory.

## Endpoint Groups

### CEO Agent

| Method | Path                                              | Description             |
| ------ | ------------------------------------------------- | ----------------------- |
| `POST` | `/v1/companies/:companyId/ceo/run`                | Start a new CEO run     |
| `GET`  | `/v1/companies/:companyId/ceo/status`             | Get CEO runtime state   |
| `POST` | `/v1/companies/:companyId/ceo/message`            | Steer active session    |
| `GET`  | `/v1/companies/:companyId/ceo/sessions`           | List all sessions       |
| `GET`  | `/v1/companies/:companyId/ceo/runs/:runId/stream` | Stream run output (SSE) |
| `GET`  | `/v1/companies/:companyId/ceo/runs/:runId`        | Get run status          |
| `POST` | `/v1/companies/:companyId/ceo/runs/:runId/stop`   | Stop a run              |
| `POST` | `/v1/companies/:companyId/ceo/team/approve`       | Provision team + tasks  |

<Note>
  **There is no bare `/v1/ceo` mount.** The lead-agent router is mounted at
  `/v1/companies/{id}/ceo/*` and `/v1/users/{user_id}/ceo/*` only — the same router,
  reached through either subject. Both spellings are published in the OpenAPI spec,
  so the interactive "Endpoints" section addresses the routes that answer.
</Note>

### Tasks

| Method   | Path                     | Description               |
| -------- | ------------------------ | ------------------------- |
| `GET`    | `/v1/tasks`              | List tasks                |
| `POST`   | `/v1/tasks`              | Create a task             |
| `GET`    | `/v1/tasks/:id`          | Get task details          |
| `PATCH`  | `/v1/tasks/:id`          | Update a task             |
| `DELETE` | `/v1/tasks/:id`          | Delete a task             |
| `POST`   | `/v1/tasks/:id/complete` | Mark task done            |
| `POST`   | `/v1/tasks/:id/block`    | Block a task              |
| `POST`   | `/v1/tasks/:id/unblock`  | Unblock a task            |
| `POST`   | `/v1/tasks/:id/comments` | Add a comment             |
| `POST`   | `/v1/tasks/:id/run`      | Trigger task execution    |
| `POST`   | `/v1/tasks/dispatch`     | Auto-assign pending tasks |
| `GET`    | `/v1/tasks/stats`        | Board statistics          |

### Objectives

| Method   | Path                         | Description           |
| -------- | ---------------------------- | --------------------- |
| `GET`    | `/v1/objectives`             | List objectives       |
| `POST`   | `/v1/objectives`             | Create an objective   |
| `GET`    | `/v1/objectives/:id`         | Get objective details |
| `PATCH`  | `/v1/objectives/:id`         | Update objective      |
| `POST`   | `/v1/objectives/:id/pause`   | Pause objective       |
| `POST`   | `/v1/objectives/:id/abandon` | Abandon objective     |
| `DELETE` | `/v1/objectives/:id`         | Archive objective     |

### Employees

| Method   | Path                | Description          |
| -------- | ------------------- | -------------------- |
| `GET`    | `/v1/employees`     | List employees       |
| `POST`   | `/v1/employees`     | Hire an employee     |
| `GET`    | `/v1/employees/:id` | Get employee details |
| `PATCH`  | `/v1/employees/:id` | Configure employee   |
| `DELETE` | `/v1/employees/:id` | Fire an employee     |

### Cron Jobs

| Method   | Path                      | Description       |
| -------- | ------------------------- | ----------------- |
| `GET`    | `/v1/cron`                | List cron jobs    |
| `POST`   | `/v1/cron`                | Create cron job   |
| `PATCH`  | `/v1/cron/:id`            | Update cron job   |
| `POST`   | `/v1/cron/:id/trigger`    | Trigger manually  |
| `POST`   | `/v1/cron/:id/pause`      | Pause job         |
| `DELETE` | `/v1/cron/:id`            | Delete job        |
| `GET`    | `/v1/cron/:id/executions` | Execution history |

### Memory

| Method   | Path             | Description                 |
| -------- | ---------------- | --------------------------- |
| `GET`    | `/v1/memory`     | List memories               |
| `POST`   | `/v1/memory`     | Add memory                  |
| `DELETE` | `/v1/memory`     | Remove memory by text match |
| `DELETE` | `/v1/memory/:id` | Remove memory by ID         |

## Authentication

All endpoints require either a session cookie or a Bearer API key:

```bash theme={"theme":"css-variables"}
curl https://api.usenaive.ai/v1/tasks \
  -H "Authorization: Bearer nv_sk_live_..."
```

CEO endpoints use the company-scoped path (`/v1/companies/:companyId/ceo/*`). All other orchestration endpoints resolve the company from the API key or session automatically.
