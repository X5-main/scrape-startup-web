> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List CEO Sessions

> GET /v1/companies/:companyId/ceo/sessions — List all past and current CEO sessions.

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
  curl https://api.usenaive.ai/v1/companies/:companyId/ceo/sessions?limit=20 \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "sessions": [
      {
        "run_id": "run-abc-123",
        "prompt": "Launch a SaaS product with email outreach",
        "status": "completed",
        "started_at": "2026-01-15T10:00:00Z",
        "completed_at": "2026-01-15T10:15:00Z",
        "tasks_created": 5,
        "employees_hired": 2
      }
    ],
    "count": 15
  }
  ```
</ResponseExample>

## Query Parameters

| Param   | Type    | Default | Description                          |
| ------- | ------- | ------- | ------------------------------------ |
| `limit` | integer | 20      | Maximum number of sessions to return |

## Response Fields

| Field      | Type    | Description                 |
| ---------- | ------- | --------------------------- |
| `sessions` | array   | List of CEO session objects |
| `count`    | integer | Total number of sessions    |

Each session includes `run_id`, `prompt`, `status`, timestamps, and summary counts of work performed.
