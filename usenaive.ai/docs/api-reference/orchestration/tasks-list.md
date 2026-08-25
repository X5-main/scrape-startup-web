> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Tasks

> GET /v1/tasks — List kanban tasks with optional filters.

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
  curl "https://api.usenaive.ai/v1/tasks?status=in_progress&assignee=Jordan+Kim" \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "tasks": [
      {
        "id": "task-def-456",
        "title": "Build landing page",
        "status": "in_progress",
        "assignee": "Jordan Kim",
        "objective_id": "obj-abc-123",
        "priority": 2,
        "created_at": "2026-01-15T10:00:00Z",
        "updated_at": "2026-01-15T10:05:00Z"
      }
    ],
    "count": 1
  }
  ```
</ResponseExample>

## Query Parameters

| Param       | Type    | Default | Description                                                 |
| ----------- | ------- | ------- | ----------------------------------------------------------- |
| `status`    | string  | —       | Filter by status: `ready`, `in_progress`, `done`, `blocked` |
| `assignee`  | string  | —       | Filter by employee name                                     |
| `objective` | string  | —       | Filter by parent objective ID                               |
| `limit`     | integer | 50      | Maximum results                                             |
| `offset`    | integer | 0       | Pagination offset                                           |

## Response Fields

| Field   | Type    | Description          |
| ------- | ------- | -------------------- |
| `tasks` | array   | List of task objects |
| `count` | integer | Total matching tasks |
