> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Loops

> First-class recurring agent runs — a cron-source trigger bound to an agent.

<Warning>
  **Deprecated — `/v1/loops`.** It drives the legacy orchestration runtime, which is FROZEN — it accepts no new capabilities. The durable runtime enforces policy at the tool boundary, not only at the gateway, and it is the only runtime new work is built on.

  **Use instead:** `naive teams schedule — a loop is a schedule with a goal`

  These routes keep answering. Nothing is removed and no response shape changes: the
  deprecation is announced in headers only, which are purely additive. Every response
  from this router carries `Deprecation` ([RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html) —
  the value is a Structured Field Date, `@` plus epoch seconds, not the boolean `true`
  some pre-RFC clients look for),
  `Link rel="deprecation"`, `Warning: 299` and `X-Naive-Deprecation-Id: dep.primitive.loops`.
  There is **no `Sunset` header**, because this is frozen with no sunset date — a
  `Sunset` on a frozen row would be a date the platform has not promised.

  Announced 2026-07-29. Level `frozen`. The freeze ends when
  `company_containers with provider='hermes' and status='running' reaches zero` — not on a date.

  Replacement surface: [the durable runtime API](/docs/api-reference/runtime/overview).
</Warning>

A **Loop** is a recurring agent run: a `cron`-source [trigger
subscription](/docs/api-reference/triggers/overview) bound to an agent. Creating a Loop
records the binding **and** creates the backing cron job that executes it — the
cloud sidecar cron.

### List

```bash theme={"theme":"css-variables"}
curl https://api.usenaive.ai/v1/loops \
  -H "Authorization: Bearer nv_sk_live_..."
```

```json 200 theme={"theme":"css-variables"}
{ "loops": [ { "id": "loop_01H...", "schedule": "0 9 * * *" } ], "count": 1 }
```

### Create

| Parameter     | Type   | Required | Description                  |
| ------------- | ------ | -------- | ---------------------------- |
| `schedule`    | string | Yes      | Standard cron expression     |
| `prompt`      | string | Yes      | The prompt fired on each run |
| `name`        | string | No       | Friendly name                |
| `profileName` | string | No       | Agent profile to run as      |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/loops \
    -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
    -d '{
      "name": "Morning inbox triage",
      "schedule": "0 9 * * *",
      "prompt": "Review overnight email + SMS and summarize what needs my attention."
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "id": "loop_01H...",
    "schedule": "0 9 * * *",
    "active": true,
    "cron_job_id": "cron_01H..."
  }
  ```
</ResponseExample>

### Get, update, run, delete

| Method   | Path                 | Description                              |
| -------- | -------------------- | ---------------------------------------- |
| `GET`    | `/v1/loops/{id}`     | Get one loop                             |
| `PATCH`  | `/v1/loops/{id}`     | Update / pause (`active:false`) / resume |
| `POST`   | `/v1/loops/{id}/run` | Run once now (schedule unaffected)       |
| `DELETE` | `/v1/loops/{id}`     | Delete the loop and its backing cron job |

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/loops/loop_01H.../run \
  -H "Authorization: Bearer nv_sk_live_..."
```

See [Loops](/docs/getting-started/loops) and the
[event router](/docs/architecture/event-router).
