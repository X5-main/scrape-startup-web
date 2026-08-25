> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Configure / Fire Employee

> PATCH /v1/employees/:id and DELETE /v1/employees/:id — Update employee configuration or terminate.

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

## Configure Employee

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X PATCH https://api.usenaive.ai/v1/employees/emp-abc-123 \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Senior Jordan Kim",
      "title": "Senior Engineer",
      "enabled": true
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "employee": {
      "id": "emp-abc-123",
      "name": "Senior Jordan Kim",
      "title": "Senior Engineer",
      "role": "engineer",
      "enabled": true
    }
  }
  ```
</ResponseExample>

### Request Body

| Field        | Type    | Description                 |
| ------------ | ------- | --------------------------- |
| `name`       | string  | Updated display name        |
| `role`       | string  | Updated role                |
| `title`      | string  | Updated title               |
| `department` | string  | Updated department          |
| `enabled`    | boolean | Enable/disable the employee |
| `metadata`   | object  | Arbitrary metadata          |

All fields are optional. Changes take effect for the next task the employee picks up.

***

## Fire Employee

```bash theme={"theme":"css-variables"}
curl -X DELETE https://api.usenaive.ai/v1/employees/emp-abc-123 \
  -H "Authorization: Bearer nv_sk_live_..."
```

```json 200 theme={"theme":"css-variables"}
{
  "success": true,
  "id": "emp-abc-123"
}
```

### Behavior

Firing archives the employee (soft delete), returns active tasks to `ready` status, and deprovisions the Hermes profile. Historical task completions are preserved.
