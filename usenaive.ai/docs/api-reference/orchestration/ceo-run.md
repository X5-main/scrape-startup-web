> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Start CEO Run

> POST /v1/companies/:companyId/ceo/run — Start a new CEO run with a prompt.

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
  curl -X POST https://api.usenaive.ai/v1/companies/:companyId/ceo/run \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "prompt": "Analyze our competitors and draft a go-to-market strategy"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "run_id": "run-abc-123",
    "pid": 12345,
    "status": "started"
  }
  ```
</ResponseExample>

## Request Body

| Field          | Type   | Required | Description                                    |
| -------------- | ------ | -------- | ---------------------------------------------- |
| `prompt`       | string | Yes      | The instruction or goal for the CEO to execute |
| `conversation` | array  | No       | Prior conversation context (message objects)   |
| `history`      | array  | No       | Previous run history for continuity            |

## Behavior

The CEO interprets the prompt, proposes a plan (team composition + task breakdown), and after approval executes by hiring employees, creating tasks, and assigning work. The run operates asynchronously — use the stream endpoint to watch progress.

All LLM calls are proxied through the API and charged against your credit balance.

<Warning>
  **The CEO's own reasoning needs a paid account.** Those proxied LLM calls are LLM routing, which the
  free signup credits do not buy, and the CEO gateway runs on the ordinary company key — it is not
  covered by the exemption that protects work the runtime dispatches to an agent. So on an account
  that has never bought credits or subscribed, the 5-credit pre-check passes, the run starts, and its
  first model call comes back `402 llm_routing_requires_payment`. Buy credits (`naive billing topup`)
  or subscribe before starting a run. See [Credits](/docs/getting-started/credits).
</Warning>

## Errors

```json 402 theme={"theme":"css-variables"}
{
  "error": {
    "code": "insufficient_credits",
    "message": "Not enough credits for CEO run"
  }
}
```

```json 402 theme={"theme":"css-variables"}
{
  "error": {
    "code": "llm_routing_requires_payment",
    "message": "Free trial credit cannot be spent on LLM routing. Every other primitive accepts it — model routing needs a paid account.",
    "block_reason": "llm_routing_requires_payment",
    "credit_kind": "trial",
    "balance": 20
  }
}
```

```json 503 theme={"theme":"css-variables"}
{
  "error": {
    "code": "container_unavailable",
    "message": "Company container is unreachable"
  }
}
```
