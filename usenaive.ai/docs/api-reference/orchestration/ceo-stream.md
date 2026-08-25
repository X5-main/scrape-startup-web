> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Stream CEO Run

> GET /v1/companies/:companyId/ceo/runs/:runId/stream — Stream real-time output from a CEO run via SSE.

<Warning>
  **Deprecated — `naive ceo` and `/v1/companies/:id/ceo`.** It drives the legacy orchestration runtime, which is FROZEN — it accepts no new capabilities. The durable runtime enforces policy at the tool boundary, not only at the gateway, and it is the only runtime new work is built on.

  **Use instead:** `naive teams say — the lead is a role now, not a fixed "ceo"`

  These routes keep answering. Nothing is removed and no response shape changes: the
  deprecation is announced in headers only, which are purely additive. Every response
  from this router carries `Deprecation` ([RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html) —
  the value is a Structured Field Date, `@` plus epoch seconds, not the boolean `true`
  some pre-RFC clients look for),
  `Link rel="deprecation"`, `Warning: 299` and `X-Naive-Deprecation-Id: dep.primitive.ceo`.
  There is **no `Sunset` header**, because this is frozen with no sunset date — a
  `Sunset` on a frozen row would be a date the platform has not promised.

  Announced 2026-07-29. Level `frozen`. The freeze ends when
  `company_containers with provider='hermes' and status='running' reaches zero` — not on a date.

  Replacement surface: [the durable runtime API](/docs/api-reference/runtime/overview).
</Warning>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -N https://api.usenaive.ai/v1/companies/:companyId/ceo/runs/run-abc-123/stream \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Accept: text/event-stream"
  ```
</RequestExample>

<ResponseExample>
  ```text 200 theme={"theme":"css-variables"}
  event: thought
  data: {"content": "Analyzing the objective. I'll need an engineer and a marketer."}

  event: task_created
  data: {"task_id": "task-def-456", "title": "Build landing page", "assignee": "Jordan Kim"}

  event: message
  data: {"content": "Team hired and tasks dispatched. Monitoring progress."}

  event: task_completed
  data: {"task_id": "task-def-456", "summary": "Landing page deployed"}

  event: done
  data: {"run_id": "run-abc-123", "tasks_created": 3, "tasks_completed": 3}

  data: [DONE]
  ```
</ResponseExample>

## Path Parameters

| Param   | Type   | Description              |
| ------- | ------ | ------------------------ |
| `runId` | string | The CEO run ID to stream |

## SSE Event Types

| Event            | Description                           |
| ---------------- | ------------------------------------- |
| `thought`        | CEO's reasoning steps                 |
| `task_created`   | A new task was created and dispatched |
| `task_completed` | An employee finished a task           |
| `message`        | CEO status updates or messages        |
| `done`           | Run completed successfully            |
| `error`          | Something went wrong                  |

The stream terminates with `data: [DONE]`. The run continues in the background if the connection is closed early.
