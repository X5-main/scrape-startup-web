> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Run Task

> POST /v1/tasks/:id/run — Trigger immediate execution of a specific task.

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
  curl -X POST https://api.usenaive.ai/v1/tasks/task-def-456/run \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "task": {
      "id": "task-def-456",
      "title": "Build landing page",
      "status": "in_progress",
      "assignee": "Jordan Kim"
    },
    "run_triggered": true,
    "dispatch_result": {
      "worker_pid": 54321,
      "started_at": "2026-01-15T10:05:00Z"
    }
  }
  ```
</ResponseExample>

## Path Parameters

| Param | Type   | Description                 |
| ----- | ------ | --------------------------- |
| `id`  | string | Task ID (UUID or Hermes ID) |

## Behavior

Triggers the kanban dispatcher to immediately spawn a worker for the specified task. The task must already have an assignee and not be in `done` or `blocked` status. Use this when you want to start work on a task without waiting for the auto-dispatch cycle.

<Note>
  Dispatch runs on two clocks, and only one of them is in this repository: the agent container runs a **30-second safety-net poll** (`DISPATCH_INTERVAL_MS`), on top of the legacy gateway's own embedded dispatcher, whose interval lives in the gateway and is not verifiable here. Treat dispatch latency as *tens of seconds*, and use the explicit dispatch/run endpoints when you need it now.
</Note>

## Errors

```json 400 theme={"theme":"css-variables"}
{
  "error": {
    "code": "task_not_assignable",
    "message": "Task must have an assignee and be in ready or in_progress status"
  }
}
```
