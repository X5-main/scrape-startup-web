> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Task

> POST /v1/tasks — Create a new task on the kanban board.

<Warning>
  **Deprecated — `naive tasks` and `/v1/tasks`.** It drives the legacy orchestration runtime, which is FROZEN — it accepts no new capabilities. The durable runtime enforces policy at the tool boundary, not only at the gateway, and it is the only runtime new work is built on.

  **Use instead:** `naive teams submit <team> "<goal>" --tenant <tu>`

  These routes keep answering. Nothing is removed and no response shape changes: the
  deprecation is announced in headers only, which are purely additive. Every response
  from this router carries `Deprecation` ([RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html) —
  the value is a Structured Field Date, `@` plus epoch seconds, not the boolean `true`
  some pre-RFC clients look for),
  `Link rel="deprecation"`, `Warning: 299` and `X-Naive-Deprecation-Id: dep.primitive.tasks`.
  There is **no `Sunset` header**, because this is frozen with no sunset date — a
  `Sunset` on a frozen row would be a date the platform has not promised.

  Announced 2026-07-29. Level `frozen`. The freeze ends when
  `company_containers with provider='hermes' and status='running' reaches zero` — not on a date.

  Replacement surface: [the durable runtime API](/docs/api-reference/runtime/overview).
</Warning>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/tasks \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Write welcome email copy",
      "description": "Draft a 3-paragraph welcome email for new signups",
      "objective_id": "obj-abc-123",
      "assignee": "Jordan Kim",
      "priority": "high"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "id": "task-def-456",
    "title": "Write welcome email copy",
    "status": "ready",
    "objective_id": "obj-abc-123",
    "assignee": "Jordan Kim",
    "priority": 2,
    "created_at": "2026-01-15T10:00:00Z"
  }
  ```
</ResponseExample>

## Request Body

| Field          | Type   | Required    | Description                                                            |
| -------------- | ------ | ----------- | ---------------------------------------------------------------------- |
| `title`        | string | Yes         | Task title                                                             |
| `description`  | string | Recommended | Detailed task description — workers use this to understand assignments |
| `objective_id` | string | No          | Parent objective ID                                                    |
| `assignee`     | string | No          | Employee name (must match exactly, including case)                     |
| `priority`     | string | No          | `low`, `medium` (default), `high`, or `critical`                       |

## Behavior

Tasks are persisted in the central database immediately on creation, regardless of sidecar availability. If an assignee is specified and matches an engineer with a linked app, deployment instructions are automatically appended to the task description.

The kanban dispatcher polls for assigned tasks and auto-spawns worker processes.

<Note>
  Dispatch runs on two clocks, and only one of them is in this repository: the agent container runs a **30-second safety-net poll** (`DISPATCH_INTERVAL_MS`), on top of the legacy gateway's own embedded dispatcher, whose interval lives in the gateway and is not verifiable here. Treat dispatch latency as *tens of seconds*, and use the explicit dispatch/run endpoints when you need it now.
</Note>

## Errors

```json 404 theme={"theme":"css-variables"}
{
  "error": {
    "code": "employee_not_found",
    "message": "No employee found with name 'Jordan Kim'"
  }
}
```
