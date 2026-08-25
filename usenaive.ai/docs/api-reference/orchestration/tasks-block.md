> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Block / Unblock Task

> POST /v1/tasks/:id/block and POST /v1/tasks/:id/unblock — Manage task blocking state.

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

## Block a Task

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/tasks/task-def-456/block \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "reason": "Waiting for domain DNS propagation" }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "task-def-456",
    "status": "blocked",
    "block_reason": "Waiting for domain DNS propagation"
  }
  ```
</ResponseExample>

### Request Body

| Field    | Type   | Required | Description             |
| -------- | ------ | -------- | ----------------------- |
| `reason` | string | Yes      | Why the task is blocked |

Blocked tasks are surfaced to the CEO for resolution or reassignment.

***

## Unblock a Task

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/tasks/task-def-456/unblock \
  -H "Authorization: Bearer nv_sk_live_..."
```

```json 200 theme={"theme":"css-variables"}
{
  "id": "task-def-456",
  "status": "in_progress"
}
```

Unblocking returns the task to `in_progress` status and makes it eligible for the dispatcher again.
