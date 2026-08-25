> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Orchestration

> AI workforce orchestration — CEO agent, kanban tasks, objectives, employees, cron scheduling, and persistent memory.

<Snippet file="legacy-runtime.mdx" />

Orchestration provides a **CEO agent** that decomposes high-level prompts into work across a kanban system — objectives, tasks, employees, cron jobs, and persistent memory.

## Replacement

Every command and route on this page keeps answering, but new work goes to the durable runtime — see [Teams](/docs/getting-started/teams).

| Instead of                           | Use                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `naive tasks create "<title>"`       | `naive teams submit <team> "<goal>" --tenant <tu>`                       |
| `naive tasks list`                   | `naive teams board <team> --tenant <tu>`                                 |
| `naive objectives create`            | `naive teams submit --task`                                              |
| `naive ceo run` / `naive ceo stream` | `naive teams say` / `naive teams watch`                                  |
| `naive employees hire`               | roles are declared in `naive.config.ts`; `naive teams roster` reads them |
| `naive cron create` / `naive loops`  | `naive teams schedule`                                                   |
| `naive memory add`                   | `naive brain remember`                                                   |

<Note>
  **These routes are company-scoped by your API key, not by a path segment.**
  `/v1/tasks`, `/v1/objectives`, `/v1/employees`, `/v1/cron` and `/v1/memory` take the
  company from the credential you present. Only the CEO surface has a company-addressed
  form (`/v1/companies/:companyId/ceo/…`); it is also mounted per tenant user at
  `/v1/users/:user_id/ceo/…`.
</Note>

## CLI First

```bash theme={"theme":"css-variables"}
# Set a strategic objective
naive objectives create "Launch product website" --criteria "Homepage live, 100 visitors"

# Let the CEO plan and execute
naive ceo run "Start working on our active objectives"
naive ceo stream <runId>

# Hire employees directly
naive employees hire --name "Jordan Kim" --role engineer --skills "typescript,react"

# Create a task (priority: low/medium/high/critical, assignee by name)
naive tasks create "Build landing page" --description "Create a responsive landing page with hero section" --assignee "Jordan Kim" --priority high

# Monitor progress
naive tasks list --status running
naive objectives show <objectiveId>

# Set up automated workflows
naive cron create "0 9 * * *" "Check email and summarize new messages"

# Store institutional knowledge
naive memory add --target memory "Our domain is example.com, brand color #FF6B00"
```

## Tools

| Tool                | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `ceo_run`           | Start a CEO run with a prompt — decomposes into objectives and tasks |
| `ceo_message`       | Send a message to steer an active CEO session                        |
| `ceo_status`        | Get the CEO agent's current state                                    |
| `ceo_sessions`      | List all CEO sessions                                                |
| `ceo_stream`        | Stream real-time output from a CEO run (SSE)                         |
| `objectives_list`   | List all strategic objectives                                        |
| `objectives_create` | Create a new objective with success criteria                         |
| `objectives_update` | Update objective status or progress                                  |
| `tasks_list`        | List kanban tasks with optional filters                              |
| `tasks_create`      | Create a new task on the board                                       |
| `tasks_run`         | Directly trigger execution of a specific assigned task               |
| `tasks_complete`    | Mark a task as completed                                             |
| `tasks_dispatch`    | Auto-assign pending tasks to employees                               |
| `employees_list`    | List all AI employees                                                |
| `employees_hire`    | Hire a new AI employee with a role and skills                        |
| `employees_fire`    | Terminate an employee                                                |
| `cron_create`       | Create a recurring scheduled job                                     |
| `cron_list`         | List all cron jobs                                                   |
| `memory_add`        | Store persistent knowledge for future sessions                       |
| `memory_list`       | List stored memories                                                 |

## CEO Agent

The CEO runs as a **Hermes gateway process** inside your company container. The interaction pattern is conversational: you send a prompt, the CEO proposes a plan (team composition + tasks), you approve in the chat, and the CEO executes by calling the `naive` CLI directly (e.g., `naive employees hire`, `naive tasks create`). Each interaction is a "run" that you can stream in real-time.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/companies/:companyId/ceo/run \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "prompt": "Analyze our competitors and draft a go-to-market strategy" }'
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "run_id": "run-abc-123",
  "status": "started"
}
```

### Streaming Output

Stream the CEO's real-time reasoning and actions via SSE:

```bash theme={"theme":"css-variables"}
curl -N https://api.usenaive.ai/v1/companies/:companyId/ceo/runs/run-abc-123/stream \
  -H "Authorization: Bearer nv_sk_your_key" \
  -H "Accept: text/event-stream"
```

Events include `thought`, `task_created`, `task_completed`, `message`, `done`, and `error`.

### Conversational Approval

When the CEO proposes a team or plan, it waits for your approval inside the conversation. There is no separate approval endpoint — you respond to the CEO's proposal via `ceo_message`:

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/companies/:companyId/ceo/message \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "run_id": "run-abc-123",
      "message": "Approved. Go ahead and hire the team."
    }'
  ```
</CodeGroup>

Once approved, the CEO executes the plan — hiring employees, creating tasks, and assigning work — all through the `naive` CLI.

<Note>
  The kanban dispatcher is **embedded in the Hermes gateway**, not a separate daemon. Once tasks are assigned to employees, the dispatcher automatically picks them up every 15 seconds and spawns worker processes to execute them. You do not need to manually start workers.
</Note>

## Objectives

Objectives are strategic goals (weeks-to-months of work) that the CEO decomposes into tasks.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/objectives \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Launch email marketing campaign",
      "criteria": "3 sequences live, 500 emails sent",
      "priority": 4
    }'
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "id": "obj-abc-123",
  "title": "Launch email marketing campaign",
  "status": "active",
  "criteria": "3 sequences live, 500 emails sent"
}
```

### Parameters

| Param      | Type    | Required | Default | Description                                   |
| ---------- | ------- | -------- | ------- | --------------------------------------------- |
| `title`    | string  | Yes      | —       | Objective title                               |
| `criteria` | string  | No       | —       | Success criteria — how to know it's done      |
| `drive`    | string  | No       | —       | Business rationale                            |
| `schedule` | string  | No       | —       | Target timeline (e.g., "2 weeks")             |
| `priority` | integer | No       | `3`     | 1=lowest, 2=low, 3=medium, 4=high, 5=critical |

Statuses: `active` → `paused` | `completed` | `abandoned`

## Tasks

Tasks are the unit of execution on the kanban board (hours-to-days of work). The CEO creates them from objectives and assigns them to employees. The **kanban dispatcher** embedded in the Hermes gateway polls every 15 seconds for assigned tasks and auto-spawns worker processes to execute them. Workers call `kanban_complete()` when finished.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/tasks \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Write welcome email copy",
      "description": "Draft a 3-paragraph welcome email for new signups. Tone: friendly, professional. Include a CTA to the onboarding guide.",
      "objective_id": "obj-abc-123",
      "assignee": "Jordan Kim",
      "priority": "high"
    }'
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "id": "task-def-456",
  "title": "Write welcome email copy",
  "status": "ready",
  "objective": "obj-abc-123",
  "assignee": "Jordan Kim"
}
```

### Parameters

| Param          | Type   | Required    | Default    | Description                                                                              |
| -------------- | ------ | ----------- | ---------- | ---------------------------------------------------------------------------------------- |
| `title`        | string | Yes         | —          | Task title                                                                               |
| `description`  | string | Recommended | —          | Detailed task description — workers need this to understand assignments                  |
| `objective_id` | string | No          | —          | Parent objective ID                                                                      |
| `assignee`     | string | No          | —          | Employee **name** (e.g., `"Jordan Kim"`) — must match exactly, including spaces and case |
| `priority`     | string | No          | `"medium"` | `"low"`, `"medium"`, `"high"`, or `"critical"`                                           |

Statuses: `ready` → `in_progress` → `done` (or `blocked`)

Task IDs can be standard UUIDs or Hermes task IDs (e.g., `t_a2a1ae0c`); all task endpoints accept both. Tasks persist in the central database immediately on creation, regardless of sidecar availability.

### Listing Tasks

Filter tasks by status, assignee, or parent objective:

```bash theme={"theme":"css-variables"}
curl "https://api.usenaive.ai/v1/tasks?status=running&objective=obj-abc-123" \
  -H "Authorization: Bearer nv_sk_your_key"
```

## Employees

Employees are AI agents that execute tasks. Each has a role, model configuration, and skills for task routing. The CEO proposes teams automatically, but you can also hire manually.

When an employee is hired, a **Hermes profile** is created on disk containing `config.yaml`, `SOUL.md`, and `.env`. The `.env` includes LLM proxy credentials and Naive CLI credentials so the worker can call tools and report back. You do not need to start workers manually — the kanban dispatcher spawns them automatically when assigned tasks are ready.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/employees \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "role": "engineer",
      "name": "Jordan Kim",
      "skills": ["typescript", "react", "devops"]
    }'
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "id": "emp-abc-123",
  "name": "Jordan Kim",
  "role": "engineer",
  "status": "idle",
  "skills": ["typescript", "react", "devops"]
}
```

### Parameters

| Param    | Type      | Required | Description                                                                              |
| -------- | --------- | -------- | ---------------------------------------------------------------------------------------- |
| `role`   | string    | Yes      | `engineer`, `marketer`, `writer`, `sales`, `designer`, `researcher`, `support`           |
| `name`   | string    | Yes      | Display name — also used as the kanban assignee (must match exactly when creating tasks) |
| `skills` | string\[] | No       | Skill tags for task routing                                                              |
| `model`  | string    | No       | LLM model override (auto-selected by role if omitted)                                    |

Employee names are used as kanban assignees — `--assignee` must match the hired name exactly, including spaces and case.

## Cron Jobs

Cron jobs automate recurring workflows. Each firing sends a prompt to the CEO, which creates and dispatches tasks. Cron jobs are managed via the Hermes gateway's Jobs API, proxied through the sidecar.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/cron \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "schedule": "0 9 * * *",
      "prompt": "Check email and respond to urgent messages",
      "name": "Morning Email Check"
    }'
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "id": "cron-abc-123",
  "schedule": "0 9 * * *",
  "name": "Morning Email Check",
  "status": "active"
}
```

### Parameters

| Param      | Type   | Required | Default | Description                                               |
| ---------- | ------ | -------- | ------- | --------------------------------------------------------- |
| `schedule` | string | Yes      | —       | Cron expression (e.g., `0 9 * * *` for daily at 9 AM UTC) |
| `prompt`   | string | Yes      | —       | Prompt sent to the CEO on each firing                     |
| `name`     | string | No       | —       | Human-readable job name                                   |
| `skill`    | string | No       | —       | Specific skill to invoke (e.g., `naive-social`)           |

### Common Schedules

| Expression    | Meaning                          |
| ------------- | -------------------------------- |
| `0 9 * * *`   | Every day at 9:00 AM UTC         |
| `0 */6 * * *` | Every 6 hours                    |
| `0 9 * * 1`   | Every Monday at 9:00 AM UTC      |
| `0 0 1 * *`   | First of every month at midnight |

## Memory

Memory provides persistent context that survives across sessions. Under the hood, memory is owned by **Hermes** — each agent profile stores knowledge in `MEMORY.md` files on disk. The sidecar mirror syncs these files to the managed database for durability and cross-session access. Memory writes go through the CEO agent, which incorporates content into the appropriate profile's `MEMORY.md`.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/memory \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "target": "memory",
      "content": "Our primary domain is example.com, brand color #FF6B00"
    }'
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "status": "memory_requested",
  "run": { "run_id": "run-abc-123" },
  "hint": "Memory sent to CEO for incorporation. Verify with GET /v1/memory."
}
```

### Parameters

| Param      | Type   | Required | Description                                         |
| ---------- | ------ | -------- | --------------------------------------------------- |
| `target`   | string | Yes      | `memory` (agent facts) or `user` (user preferences) |
| `content`  | string | Yes      | The knowledge to store                              |
| `agent_id` | string | No       | Specific agent to store memory for (default: CEO)   |

Use `GET /v1/memory` after a few seconds to verify storage.

## Error Handling

| Error                   | Cause                                          | Recovery                                                                               |
| ----------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| `container_unavailable` | Company container is unreachable               | Wait and retry — the container may be spinning up                                      |
| `ceo_not_running`       | CEO agent is not active in the container       | The container needs to be provisioned (ECS task warm pool or local `dev-container.sh`) |
| `objective_not_found`   | Objective ID doesn't exist                     | Use `GET /v1/objectives` to list valid IDs                                             |
| `task_not_found`        | Task ID doesn't exist                          | Use `GET /v1/tasks` to list valid IDs                                                  |
| `employee_not_found`    | Employee name doesn't match any hired employee | Use `GET /v1/employees` to list valid names                                            |
| `insufficient_credits`  | Not enough credits for CEO run or cron firing  | Check balance with `GET /v1/status`, then top up                                       |

## Typical Workflow

```
User sends prompt: "Launch a SaaS product with email outreach"
    │
    ├─ POST /v1/objectives         → Create strategic objective
    │   { title: "Launch SaaS product",
    │     criteria: "Landing page live, 50 signups" }
    │   → obj-abc-123
    │
    ├─ POST /v1/companies/:companyId/ceo/run            → CEO plans and proposes team
    │   { prompt: "Execute our active objectives" }
    │   → run-abc-123
    │
    ├─ GET .../ceo/runs/run-abc-123/stream              → Stream CEO reasoning
    │   CEO proposes: "I suggest hiring Alice (Engineer)
    │   and Bob (Marketer). Shall I proceed?"
    │
    ├─ POST /v1/companies/:companyId/ceo/message        → Approve in conversation
    │   { run_id: "run-abc-123",
    │     message: "Approved. Hire them and start." }
    │   → CEO runs `naive employees hire` + `naive tasks create`
    │
    │   ┌─ Kanban dispatcher (embedded, polls every 15s)
    │   │  auto-spawns worker processes for assigned tasks
    │   │  workers call kanban_complete() when done
    │   └─────────────────────────────────────────────
    │
    ├─ GET /v1/tasks?status=running → Monitor task progress
    │   → 3 tasks running
    │
    ├─ POST /v1/cron               → Automate recurring work
    │   { schedule: "0 9 * * *",
    │     prompt: "Check email and follow up on leads" }
    │   → cron-abc-123
    │
    └─ POST /v1/memory             → Store institutional knowledge
        { target: "memory",
          content: "Product URL: https://acme.com" }
        → Memory written to MEMORY.md, synced to the datastore
```
