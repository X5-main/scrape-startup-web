> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Employees

> GET /v1/employees — List all AI employees with runtime status.

<Warning>
  **Deprecated — `naive employees` and `/v1/employees`.** It drives the legacy orchestration runtime, which is FROZEN — it accepts no new capabilities. The durable runtime enforces policy at the tool boundary, not only at the gateway, and it is the only runtime new work is built on.

  **Use instead:** `naive teams roster`

  These routes keep answering. Nothing is removed and no response shape changes: the
  deprecation is announced in headers only, which are purely additive. Every response
  from this router carries `Deprecation` ([RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html) —
  the value is a Structured Field Date, `@` plus epoch seconds, not the boolean `true`
  some pre-RFC clients look for),
  `Link rel="deprecation"`, `Warning: 299` and `X-Naive-Deprecation-Id: dep.primitive.employees`.
  There is **no `Sunset` header**, because this is frozen with no sunset date — a
  `Sunset` on a frozen row would be a date the platform has not promised.

  Announced 2026-07-29. Level `frozen`. The freeze ends when
  `company_containers with provider='hermes' and status='running' reaches zero` — not on a date.

  Replacement surface: [the durable runtime API](/docs/api-reference/runtime/overview).
</Warning>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/employees \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "employees": [
      {
        "id": "emp-abc-123",
        "name": "Jordan Kim",
        "role": "engineer",
        "title": "Lead Engineer",
        "department": "engineering",
        "status": "idle",
        "enabled": true,
        "created_at": "2026-01-10T09:00:00Z"
      },
      {
        "id": "emp-def-456",
        "name": "Alex Rivera",
        "role": "writer",
        "title": "Content Marketer",
        "department": "marketing",
        "status": "working",
        "enabled": true,
        "created_at": "2026-01-10T09:05:00Z"
      }
    ],
    "count": 2
  }
  ```
</ResponseExample>

## Response Fields

| Field       | Type    | Description              |
| ----------- | ------- | ------------------------ |
| `employees` | array   | List of employee objects |
| `count`     | integer | Total employees          |

Employee statuses: `idle`, `working`, `offline`, `error`.
