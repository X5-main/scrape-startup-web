> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Update Objective

> PATCH /v1/objectives/:id — Update objective status, progress, or configuration.

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
  curl -X PATCH https://api.usenaive.ai/v1/objectives/obj-abc-123 \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "progress": 75,
      "status": "active"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "objective": {
      "id": "obj-abc-123",
      "title": "Launch email marketing campaign",
      "status": "active",
      "progress": 75
    }
  }
  ```
</ResponseExample>

## Path Parameters

| Param | Type   | Description  |
| ----- | ------ | ------------ |
| `id`  | string | Objective ID |

## Request Body

| Field              | Type    | Description                                  |
| ------------------ | ------- | -------------------------------------------- |
| `title`            | string  | Updated title                                |
| `description`      | string  | Updated description                          |
| `status`           | string  | `active`, `paused`, `completed`, `abandoned` |
| `progress`         | integer | Progress percentage (0-100)                  |
| `drive_mode`       | string  | `manual` or `scheduled`                      |
| `cron_schedule`    | string  | Cron expression (for scheduled mode)         |
| `success_criteria` | string  | Updated criteria                             |
| `metadata`         | object  | Arbitrary metadata                           |

All fields are optional — only provided fields are updated.
