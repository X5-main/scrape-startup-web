> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Manage Cron Jobs

> Trigger, pause, and delete cron jobs — POST /v1/cron/:id/trigger, POST /v1/cron/:id/pause, DELETE /v1/cron/:id.

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

## Trigger Manually

Fires the job immediately, regardless of schedule. The regular schedule is not affected.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/cron/cron-abc-123/trigger \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "cron-abc-123",
    "triggered": true,
    "run_id": "run-xyz-789"
  }
  ```
</ResponseExample>

***

## Pause a Job

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/cron/cron-abc-123/pause \
  -H "Authorization: Bearer nv_sk_live_..."
```

```json 200 theme={"theme":"css-variables"}
{
  "id": "cron-abc-123",
  "status": "paused"
}
```

The job remains configured but will not fire on schedule. You can still trigger it manually.

***

## Delete a Job

```bash theme={"theme":"css-variables"}
curl -X DELETE https://api.usenaive.ai/v1/cron/cron-abc-123 \
  -H "Authorization: Bearer nv_sk_live_..."
```

```json 200 theme={"theme":"css-variables"}
{
  "success": true,
  "id": "cron-abc-123"
}
```

Permanently deletes the cron job. Past executions remain in history.

***

## Execution History

```bash theme={"theme":"css-variables"}
curl https://api.usenaive.ai/v1/cron/cron-abc-123/executions?limit=10 \
  -H "Authorization: Bearer nv_sk_live_..."
```

```json 200 theme={"theme":"css-variables"}
{
  "executions": [
    {
      "id": "exec-001",
      "cron_id": "cron-abc-123",
      "run_id": "run-xyz-789",
      "status": "completed",
      "started_at": "2026-01-15T09:00:00Z",
      "completed_at": "2026-01-15T09:03:00Z"
    }
  ],
  "count": 12
}
```
