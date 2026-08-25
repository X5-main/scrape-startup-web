> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Send CEO Message

> POST /v1/companies/:companyId/ceo/message — Send a message to steer an active CEO session.

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
  curl -X POST https://api.usenaive.ai/v1/companies/:companyId/ceo/message \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "text": "Focus on the marketing tasks first, then move to engineering"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "run_id": "run-abc-123",
    "status": "message_delivered"
  }
  ```
</ResponseExample>

## Request Body

| Field  | Type   | Required | Description                    |
| ------ | ------ | -------- | ------------------------------ |
| `text` | string | Yes      | The message to send to the CEO |

## Behavior

Sends a real-time message to the active CEO session. Use this to steer priorities, approve proposed plans, or request updates. The CEO incorporates the message into its current reasoning context.

If no CEO session is active, the message starts a new lightweight run.
