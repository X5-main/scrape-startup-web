> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Complete Task

> POST /v1/tasks/:id/complete — Submit a completion claim. The task closes only if it can be verified against a ledger the agent cannot author.

<Warning>
  **Deprecated — `naive tasks` and `/v1/tasks`.** It drives the legacy orchestration runtime, which is FROZEN — it accepts no new capabilities. The durable runtime enforces policy at the tool boundary, not only at the gateway, and it is the only runtime new work is built on.

  **Use instead:** `naive teams submit <team> "<goal>" --tenant <tu>`

  These routes keep answering. Nothing is removed and no response shape changes: the
  deprecation is announced in headers only, which are purely additive. Every response
  from this router carries `Deprecation` ([RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html) —
  the value is a Structured Field Date, `@` plus epoch seconds, not the boolean `true`
  some pre-RFC clients look for),
  `Link rel="deprecation"`, `Warning: 299` and `X-Naive-Deprecation-Id: dep.primitive.tasks`.
  There is **no `Sunset` header**, because this is frozen with no sunset date — a
  `Sunset` on a frozen row would be a date the platform has not promised.

  Announced 2026-07-29. Level `frozen`. The freeze ends when
  `company_containers with provider='hermes' and status='running' reaches zero` — not on a date.

  Replacement surface: [the durable runtime API](/docs/api-reference/runtime/overview).
</Warning>

Completion is a **claim**, not a state change. An agent reporting "done" is not
evidence that the work happened, so the API adjudicates the claim against
independent ledgers — a hosting deployment id, an email message id — that the
agent has no ability to write. The task closes only if the claim survives.

This means a call can return **409**, **202** or **503** as well as **200**.
Handle all four.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/tasks/task-def-456/complete \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "summary": "Landing page deployed at https://example-app.vercel.app",
      "metadata": { "url": "https://example-app.vercel.app", "pages": 3 }
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "task-def-456",
    "title": "Build landing page",
    "status": "done",
    "completed_at": "2026-01-15T12:00:00Z",
    "summary": "Landing page deployed at https://example-app.vercel.app",
    "verification_status": "verified"
  }
  ```
</ResponseExample>

## Verification outcomes

`verification_status` accompanies every outcome:

| Value        | Meaning                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------- |
| `verified`   | A ledger the agent cannot author confirms the work.                                      |
| `unverified` | No ledger applies to this kind of task. Accepted honestly rather than claimed as proven. |
| `rejected`   | A ledger contradicts the claim. The task is requeued.                                    |
| `pending`    | The ledger has not resolved yet (e.g. a deploy still building). Nothing changed — retry. |

## Status codes

**200 OK** — Accepted (`verified`, or honestly `unverified`). The task is `done`
and the board card is closed.

**202 Accepted** — Inconclusive. Deliberately neither a rejection nor a success:
the task is left **exactly as it was**, with no state change and no `attempts`
increment, so retrying once the ledger resolves is safe.

```json 202 theme={"theme":"css-variables"}
{
  "status": "pending",
  "message": "Deployment dpl_9xK2 is still building",
  "verification_status": "pending",
  "evidence": { "kind": "vercel_deployment", "deployment_id": "dpl_9xK2" },
  "task": { "id": "task-def-456", "status": "in_progress" }
}
```

**403 Forbidden** — The caller is not the task's assignee. Only the agent the
task is assigned to may complete it.

**409 Conflict** — The claim was contradicted. The task is **requeued** and
`attempts` is incremented; the agent is expected to try again, not to treat the
work as done.

<Note>
  A rejected completion is **requeued, not failed**. The card goes back to
  `status: "in_progress"` with `verification_status: "rejected"`, its lease is
  released, `attempts` is incremented, and the reason is posted as a comment on the
  card so the worker can self-correct. `task` in the 409 body is the requeued row —
  `todo` is not a status this API produces.
</Note>

```json 409 theme={"theme":"css-variables"}
{
  "error": {
    "code": "completion_rejected",
    "message": "No deployment found for this task",
    "verification_status": "rejected",
    "evidence": { "kind": "vercel_deployment", "deployment_id": null },
    "attempts": 2
  },
  "task": {
    "id": "task-def-456",
    "status": "in_progress",
    "attempts": 2,
    "verification_status": "rejected",
    "verification_reason": "No deployment found for this task"
  }
}
```

**503 Service Unavailable** — Verification passed, but the agent runtime was
unreachable so the board was **not** closed. The API returns 503 rather than
reporting a success it cannot back. The completion is durably queued and the
board closes automatically once the runtime returns.

```json 503 theme={"theme":"css-variables"}
{
  "error": {
    "code": "sidecar_unavailable",
    "message": "Verification passed, but the agent runtime is unavailable, so the task was NOT closed on the board.",
    "hint": "Check GET /v1/system/outbox for delivery status.",
    "details": { "command_id": "cmd_...", "last_error": "ECONNREFUSED" }
  },
  "verification_status": "verified"
}
```

## Path Parameters

| Param | Type   | Description                 |
| ----- | ------ | --------------------------- |
| `id`  | string | Task ID (UUID or Hermes ID) |

## Request Body

| Field      | Type   | Required | Description                                                                                                                         |
| ---------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `summary`  | string | No       | Completion summary                                                                                                                  |
| `metadata` | object | No       | Structured metadata. Fields referencing a real artifact (a deployment URL, a message id) are what verification adjudicates against. |
