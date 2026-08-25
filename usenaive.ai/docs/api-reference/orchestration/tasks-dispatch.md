> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Dispatch Tasks

> POST /v1/tasks/dispatch — Auto-assign pending tasks to available employees.

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
  curl -X POST https://api.usenaive.ai/v1/tasks/dispatch \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "dispatched": [
      { "task_id": "task-def-456", "assignee": "Jordan Kim" },
      { "task_id": "task-ghi-789", "assignee": "Alex Rivera" }
    ],
    "count": 2
  }
  ```
</ResponseExample>

## Behavior

Triggers the kanban dispatcher to assign all pending (`ready`) tasks to available employees based on skills and current capacity. The dispatcher matches tasks to employees using role-skill affinity and current workload.

This happens automatically on a timer, but this endpoint lets you force it immediately.

<Note>
  Dispatch runs on two clocks, and only one of them is in this repository: the agent container runs a **30-second safety-net poll** (`DISPATCH_INTERVAL_MS`), on top of the legacy gateway's own embedded dispatcher, whose interval lives in the gateway and is not verifiable here. Treat dispatch latency as *tens of seconds*, and use the explicit dispatch/run endpoints when you need it now.
</Note>
