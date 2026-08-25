> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Durable Runtime API

> /v1/teams — the (team, tenant)-addressed runtime surface. What it serves today, what it refuses, and how to tell the difference before you write code against it.

<Warning>
  33 operations are mounted, and what each does depends on which runtime the tenant is on:

  * a **durable** tenant is served **25**; **8** refuse.
  * a **hermes** tenant is served **14**; **19** refuse.

  A tenant is durable only if `naive up` placed it there — placement is an
  operator act, not a request, and there is no route a tenant can call to switch.

  A refusal names the missing dependency and the runtime it is about
  (`error.details.runtime`, `error.details.missing`); every success carries `provider`.
</Warning>

## What this surface is

`/v1/teams` addresses work by a **pair**: a team and a tenant.

```
/v1/teams/{team}/tenants/{tenantUserId}/…
```

Every operation except `GET /v1/teams` is scoped to that pair. `tenantUserId` is a
`tenant_users.id` — the same id `POST /v1/users` returns and the same id the
legacy `/v1/users/{user_id}/…` routes take.

`{team}` is validated as a routing segment and echoed back; it is not used as a storage
key in this build. These routes use the same `Authorization: Bearer nv_sk_...` key and
base URL as every other endpoint.

## Authentication and gating

* **Auth:** session cookie or API key (`requireSessionOrAuth`).
* **Idempotency:** the mount carries the idempotency middleware. Read
  [`GET /v1/limits`](/docs/api-reference/governance/limits) before relying on it — the
  store is an in-process Map with no cross-replica sharing and no body
  fingerprint, and the API prints that fact rather than advertising a guarantee it
  does not have.
* **AccountKit gate:** every operation addressed to a `(team, tenant)` pair calls
  `assertPrimitiveEnabled(kit, "tasks")`. A kit that disables `tasks` is refused here
  exactly as it is at `/v1/users/{id}/tasks`:

  ```json 403 theme={"theme":"css-variables"}
  {
    "error": {
      "code": "forbidden",
      "message": "Not allowed by AccountKit \"Default\": primitive_disabled_by_kit",
      "details": { "reason": "primitive_disabled_by_kit", "primitive": "tasks" }
    }
  }
  ```

  The one exception is `GET /v1/teams`, which is company-scoped, resolves no
  tenant and therefore reads no kit — there is no tenant AccountKit to consult,
  so it is gated on authentication alone.

## Runtime provider is reported on every answer

A tenant runs on one of two runtimes, and mixed mode is the normal state. Every response
that could be aggregated carries `provider`:

| value     | meaning                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| `hermes`  | the legacy orchestration runtime (frozen; see the [Orchestration API](/docs/api-reference/orchestration/overview)) |
| `durable` | the durable runtime                                                                                           |

An aggregate that omits `provider` lets a reader average a durable tenant and a
hermes tenant into one number. None of these responses omit it.

## The 33 operations

Legend:

* **live** — serves real rows on BOTH runtimes (from different stores where the store
  differs).
* **durable** — served for a durable tenant, `501` for a hermes one.
* **501** — refused on both, with `error.details.missing` naming the absent
  dependency *for that tenant's runtime*.

### Company-scoped

|      | Operation       | Page                                  |
| ---- | --------------- | ------------------------------------- |
| live | `GET /v1/teams` | [Teams](/docs/api-reference/runtime/teams) |

### The team at a tenant

|         | Operation                                                                                                                                | Page                                                                                                        |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| live    | `GET …/{tenantUserId}`                                                                                                                   | [Teams](/docs/api-reference/runtime/teams)                                                                       |
| live    | `GET …/roster`                                                                                                                           | [Roster](/docs/api-reference/runtime/roster)                                                                     |
| live    | `GET …/plan`                                                                                                                             | [Plan & diagnostics](/docs/api-reference/runtime/plan)                                                           |
| live    | `GET …/diagnostics`                                                                                                                      | [Plan & diagnostics](/docs/api-reference/runtime/plan)                                                           |
| 501     | `POST …/apply` — the runtime has `apply`; no control-plane head                                                                          | [Refusals](/docs/api-reference/runtime/not-wired)                                                                |
| 501     | `POST …/migrate` · `POST …/rollback` · `POST …/model`                                                                                    | [Refusals](/docs/api-reference/runtime/not-wired)                                                                |
| durable | `POST …/stop` — the kill switch. A **pause**: `is_pause_not_decommission: true`, and `in_flight` counts the attempts it could not recall | [Durable runtime](/docs/architecture/durable-runtime#the-ten-a-durable-tenant-gets-and-a-hermes-tenant-does-not) |

### The board

|         | Operation                                                                                                                                   | Page                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| live    | `GET …/board` — the runtime's board for a durable tenant, `tasks_mirror` for a hermes one                                                   | [Board](/docs/api-reference/runtime/board)        |
| live    | `GET …/board/{card}` — carries `runtime_status` beside `status` for a durable tenant                                                        | [Board](/docs/api-reference/runtime/board)        |
| live    | `GET …/events`                                                                                                                              | [Board](/docs/api-reference/runtime/board)        |
| durable | `POST …/board/{card}/unblock`                                                                                                               | [Refusals](/docs/api-reference/runtime/not-wired) |
| durable | `POST …/submit`                                                                                                                             | [Refusals](/docs/api-reference/runtime/not-wired) |
| durable | `POST …/schedule` · `GET …/schedule` · `DELETE …/schedule/{id}` — the GET is what makes the DELETE addressable after you close the terminal | [Refusals](/docs/api-reference/runtime/not-wired) |

### Runs

|         | Operation                                                   | Page                                |
| ------- | ----------------------------------------------------------- | ----------------------------------- |
| live    | `GET …/runs` · `GET …/runs/{id}` · `GET …/runs/{id}/events` | [Runs](/docs/api-reference/runtime/runs) |
| durable | `GET …/runs/{id}/stream`                                    |                                     |
| 501     | `POST …/runs/{id}/stop` — no per-run kill on either runtime | [Runs](/docs/api-reference/runtime/runs) |

### Approvals, cost, sessions, effects

|         | Operation                                                                                                | Page                                          |
| ------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| live    | `GET …/approvals` · `POST …/approvals/{id}/decide`                                                       | [Approvals](/docs/api-reference/runtime/approvals) |
| live    | `GET …/cost`                                                                                             | [Cost](/docs/api-reference/runtime/cost)           |
| durable | `POST …/sessions/{channel}/messages`                                                                     |                                               |
| 501     | `GET …/sessions` · `GET …/sessions/{channel}` — the runtime has `channels`/`read`; no control-plane head | [Sessions](/docs/api-reference/runtime/sessions)   |
| 501     | `GET …/effects` · `POST …/effects/{id}/settle`                                                           | [Refusals](/docs/api-reference/runtime/not-wired)  |

## How a refusal reads

```json 501 theme={"theme":"css-variables"}
{
  "error": {
    "code": "not_configured",
    "message": "Submitting work to a team is not available in this build.",
    "hint": "This operation is declared and addressable; its backing store does not exist in this build.",
    "details": {
      "surface": "durable-runtime",
      "missing": [
        "durable dispatcher: no seam exists to hand a goal to; forwarding to the legacy Hermes dispatcher would be a second write path into a FROZEN runtime",
        "manifest digest: the response contract returns `manifest_digest` and `required_attestations`, neither of which has storage",
        "idempotency: `middleware/idempotency.ts` is an in-process Map with no cross-replica sharing, no body fingerprint and no 2xx filter, so `idempotency_key` cannot be honoured honestly"
      ]
    }
  }
}
```

`501` is used on purpose: only it says "the request is well-formed and the server does
not implement it".

## Fields that are `null` on purpose

Several responses carry a `null` beside a sibling `*_unavailable_because` string — no
field on this API is filled with a plausible-looking placeholder.

| field                                | why it is null everywhere today                                                        |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| `digests`, `fence`                   | no manifest or snapshot digest is stored in this build                                 |
| `stop`                               | a team-level stop is a durable-runtime state; the legacy runtime has no equivalent row |
| `rubric`                             | there is no per-card check list in `tasks_mirror`                                      |
| `required_attestations`              | the list is empty because nothing can be recorded, not because nothing is required     |
| `can` / `approve` / `view` on a role | compiled authority lives in the manifest; none is stored                               |
| `decision_id`, `trace_id`            | there is no `policy_decisions` ledger and no trace column                              |

## Related

* [Governance API](/docs/api-reference/governance/overview) — policy, grants, limits, spend
* [Brain API](/docs/api-reference/brain/overview) — the company knowledge surface
* [Orchestration API](/docs/api-reference/orchestration/overview) — the frozen legacy runtime, still answering
