> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Objective

> POST /v1/objectives — Create a new strategic objective.

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
  curl -X POST https://api.usenaive.ai/v1/objectives \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Launch email marketing campaign",
      "success_criteria": "3 sequences live, 500 emails sent",
      "drive": "Scale inbound leads by 3x",
      "status": "active"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "id": "obj-abc-123",
    "title": "Launch email marketing campaign",
    "status": "active",
    "success_criteria": [
      { "criterion": "3 sequences live", "met": false },
      { "criterion": "500 emails sent", "met": false }
    ]
  }
  ```
</ResponseExample>

## Request Body

| Field              | Type   | Required | Description                                                                       |
| ------------------ | ------ | -------- | --------------------------------------------------------------------------------- |
| `title`            | string | Yes      | Objective title                                                                   |
| `description`      | string | No       | Detailed description                                                              |
| `success_criteria` | string | No       | Comma-separated or newline-separated criteria (auto-parsed into structured array) |
| `drive`            | string | No       | Business rationale / driving motivation                                           |
| `drive_mode`       | string | No       | How the objective advances: `manual` or `scheduled`                               |
| `cron_schedule`    | string | No       | Cron expression for scheduled objectives (requires `drive_mode: "scheduled"`)     |
| `status`           | string | No       | Initial status (default: `active`)                                                |
| `metadata`         | object | No       | Arbitrary metadata                                                                |

## Behavior

The CEO decomposes objectives into tasks on the kanban board during its runs. If `drive_mode` is `scheduled`, a pg\_cron job fires at the specified interval to advance the objective automatically.

Statuses: `active` → `paused` | `completed` | `abandoned` | `archived`
