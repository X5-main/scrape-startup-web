> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Objective

> GET /v1/objectives/:id — Get objective details with linked tasks.

<Warning>
  **Deprecated — `naive objectives` and `/v1/objectives`.** It drives the legacy orchestration runtime, which is FROZEN — it accepts no new capabilities. The durable runtime enforces policy at the tool boundary, not only at the gateway, and it is the only runtime new work is built on.

  **Use instead:** `naive teams submit --task — a goal with tasks under it, not a second noun`

  These routes keep answering. Nothing is removed and no response shape changes: the
  deprecation is announced in headers only, which are purely additive. Every response
  from this router carries `Deprecation` ([RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html) —
  the value is a Structured Field Date, `@` plus epoch seconds, not the boolean `true`
  some pre-RFC clients look for),
  `Link rel="deprecation"`, `Warning: 299` and `X-Naive-Deprecation-Id: dep.primitive.objectives`.
  There is **no `Sunset` header**, because this is frozen with no sunset date — a
  `Sunset` on a frozen row would be a date the platform has not promised.

  Announced 2026-07-29. Level `frozen`. The freeze ends when
  `company_containers with provider='hermes' and status='running' reaches zero` — not on a date.

  Replacement surface: [the durable runtime API](/docs/api-reference/runtime/overview).
</Warning>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/objectives/obj-abc-123 \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "objective": {
      "id": "obj-abc-123",
      "title": "Launch email marketing campaign",
      "description": "Build and deploy 3 automated email sequences",
      "status": "active",
      "progress": 45,
      "success_criteria": [
        { "criterion": "3 sequences live", "met": true },
        { "criterion": "500 emails sent", "met": false }
      ],
      "drive": "Scale inbound leads by 3x",
      "created_at": "2026-01-10T09:00:00Z"
    },
    "tasks": [
      { "id": "task-def-456", "title": "Write sequence 1", "status": "done" },
      { "id": "task-ghi-789", "title": "Write sequence 2", "status": "in_progress" }
    ]
  }
  ```
</ResponseExample>

## Path Parameters

| Param | Type   | Description  |
| ----- | ------ | ------------ |
| `id`  | string | Objective ID |

## Response Fields

| Field       | Type   | Description                        |
| ----------- | ------ | ---------------------------------- |
| `objective` | object | Full objective details             |
| `tasks`     | array  | All tasks linked to this objective |
