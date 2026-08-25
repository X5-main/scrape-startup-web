> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Cron Job

> POST /v1/cron — Create a new recurring scheduled job.

<Warning>
  **Deprecated — `naive cron` and `/v1/cron`.** It drives the legacy orchestration runtime, which is FROZEN — it accepts no new capabilities. The durable runtime enforces policy at the tool boundary, not only at the gateway, and it is the only runtime new work is built on.

  **Use instead:** `naive teams schedule / naive teams unschedule — 5 of the 8 subcommands map`

  These routes keep answering. Nothing is removed and no response shape changes: the
  deprecation is announced in headers only, which are purely additive. Every response
  from this router carries `Deprecation` ([RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html) —
  the value is a Structured Field Date, `@` plus epoch seconds, not the boolean `true`
  some pre-RFC clients look for),
  `Link rel="deprecation"`, `Warning: 299` and `X-Naive-Deprecation-Id: dep.primitive.cron`.
  There is **no `Sunset` header**, because this is frozen with no sunset date — a
  `Sunset` on a frozen row would be a date the platform has not promised.

  Announced 2026-07-29. Level `frozen`. The freeze ends when
  `company_containers with provider='hermes' and status='running' reaches zero` — not on a date.

  **Not deprecated, same prefix.** `POST /v1/cron/reconcile-*`, `POST /v1/cron/drain-events` and `POST /v1/cron/process-conversions` are shared-secret platform reconcilers registered before this router. They are not part of `naive cron`, carry none of these headers, and are not going away.

  Replacement surface: [the durable runtime API](/docs/api-reference/runtime/overview).
</Warning>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/cron \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "schedule": "0 9 * * *",
      "prompt": "Check email and respond to urgent messages",
      "name": "Morning Email Check",
      "skill": "naive-email"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "id": "cron-abc-123",
    "name": "Morning Email Check",
    "schedule": "0 9 * * *",
    "prompt": "Check email and respond to urgent messages",
    "skill": "naive-email",
    "status": "active"
  }
  ```
</ResponseExample>

## Request Body

| Field         | Type   | Required | Description                                                    |
| ------------- | ------ | -------- | -------------------------------------------------------------- |
| `schedule`    | string | Yes      | Cron expression (e.g., `0 9 * * *` for daily at 9 AM UTC)      |
| `prompt`      | string | Yes      | Prompt sent to the CEO on each firing                          |
| `name`        | string | No       | Human-readable job name                                        |
| `skill`       | string | No       | Specific skill to invoke (e.g., `naive-social`, `naive-email`) |
| `skills`      | array  | No       | Multiple skills (alternative to single `skill`)                |
| `profileName` | string | No       | Hermes profile to use (default: `ceo`)                         |

## Behavior

Each firing sends the prompt to the CEO, which creates tasks and dispatches them to employees. If a `skill` is specified, the worker uses that skill's toolset.

## Common Schedules

| Expression     | Meaning                          |
| -------------- | -------------------------------- |
| `0 9 * * *`    | Every day at 9:00 AM UTC         |
| `0 */6 * * *`  | Every 6 hours                    |
| `0 9 * * 1`    | Every Monday at 9:00 AM UTC      |
| `0 0 1 * *`    | First of every month at midnight |
| `*/30 * * * *` | Every 30 minutes                 |
