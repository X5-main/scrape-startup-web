> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# The durable runtime

> The team-and-tenant runtime surface — how a board is addressed, which operations read real rows today, and which refuse.

The **durable runtime** is where new agent work belongs. It replaces the legacy
orchestration runtime ([event router](/docs/architecture/event-router), `runtime.pool()`)
with a different unit of address: a team, per tenant. Legacy orchestration is frozen,
not removed — every existing route, CLI command and config keeps answering.

## The address is a pair

A team is declared once and instantiated per tenant, so every runtime operation carries
both:

```
/v1/teams/{team}/tenants/{tenantUserId}/…
```

The tenant is part of the address, so one customer's board cannot be reached with
another customer's id by forgetting a filter.

```ts theme={"theme":"css-variables"}
import { team, agent, runtime, brain } from "@usenaive-sdk/iac";

const acme = brain({ retention: { beliefs: "180d" }, writes: { mode: "review" }, partitions: { support: {} } });

export default {
  company: { brain: acme },
  teams: {
    support: team({
      runtime: runtime.durable({ sleepAfter: "5m" }),
      brain: acme.partition("support"),
      lead: agent({ can: ["email"], brain: acme.view({ partition: "support", can: ["recall"] }) }),
      agents: { tier1: agent({ can: ["email"] }) },
      edges: [["lead", "tier1"]],
    }),
  },
};
```

`runtime.durable()` and `runtime.hermes()` are a closed two-member union;
`runtime.hermes()` is the legacy runtime, declarable and deprecated. `runtime.pool()`
is untouched.

## Which runtime is this tenant on?

Every answer below depends on it. The decision is per tenant, a single column —
`company_containers.sidecar_url` — with no third state and no global switch.

Exactly one production path points that column at the durable runtime: `naive up`
placing a newly declared team (`registerVettaRuntime()`, called only from
`services/placement.ts` when a `teams:` block declares `runtime.durable(...)` and the
operator supplies `NAIVE_DURABLE_CREDENTIAL_<TEAM>` out of band). Every other tenant
reads `provider: "hermes"`. Placement permits only two states — no container row (place
destroys nothing) or already durable (converge, never re-register) — and refuses a
claim in flight or a live legacy container, because registering overwrites the tenant's
legacy coordinates. Moving an *existing* tenant is a runbook, not a request:
`POST …/migrate` refuses on both runtimes.

Every response on this surface carries `provider` (`"durable"` or `"hermes"`), and
every refusal carries `error.details.runtime` — read every claim on this page against
one tenant.

### Is the durable runtime on this deployment?

<Warning>
  **Not on `api.usenaive.ai`.** The credential is the **last** of three checks, not the
  first, and on production the first one already refuses. `services/placement.ts` decides
  in this order, before any query:

  | Order | Code                            | What it means                                                                                                                                                                  |
  | ----- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | 1     | `runtime_not_configured`        | this deployment has **no `VETTA_CONTROL_URL`**, so no tenant on it can be on the durable runtime. A fact about the deployment — no credential and no per-tenant act changes it |
  | 2     | `runtime_cutover_not_permitted` | it has one, but the cutover prerequisites are not signed off; `error.details.missing` names each                                                                               |
  | 3     | `runtime_credential_required`   | everything else is ready and `NAIVE_DURABLE_CREDENTIAL_<TEAM>` was not exported                                                                                                |

  **As of 2026-08-06 this is no longer the state.** `VETTA_CONTROL_URL` is set on the
  production API (`infra/api/main.tf`), both cutover prerequisites are signed off
  (`durable-readiness.ts`), and a `runtime.durable(...)` team applied against
  `api.usenaive.ai` with its operator credential comes back `placed` — measured, with real
  tasks admitted, routed to a member, and run to a terminal state. So (1) and (2) no longer
  fire in production; **(3) `runtime_credential_required` is the refusal to expect**, and
  the fix is exporting `NAIVE_DURABLE_CREDENTIAL_<TEAM>` before `naive up`.

  Read `result.teams[].placement.code` and report the code you actually got — that advice
  outlives any particular deployment state. What has NOT changed: `naive init` still
  scaffolds `runtime.hermes()`, so a fresh project is on the legacy lane until its config
  says otherwise.
</Warning>

## What reads real rows today

Of the 33 operations on this surface, a **durable** tenant is served **25** and a **hermes**
tenant is served **14**. Eight are refused on both. The 14 a hermes tenant is served answer
from real tables (`tasks_mirror`, `task_runs_mirror`, `task_events_mirror`, `agents`,
`tenant_spend_events`) with keyset cursors, and that count is pinned by
`ci/runtime-surface-counts.test.ts`.

The hermes 14 is a **frozen** number and is meant to stay one.
The durable runtime gaining eleven operations cost the legacy surface nothing: no route
it answered was moved, narrowed or re-pointed, and the gate above fails if that stops
being true.

It has moved exactly once, from 13 to 14, and the operation that moved it is
`GET /v1/teams`, which refused until the JSONB key naming a declared team was renamed
(`packages/db/migrations/065_agents_config_team_key.sql`). It reads `agents` and reaches
neither runtime, so both lanes gained it at once — and it cost the frozen runtime nothing
either, because it dispatches to no runtime at all.

| Operation                                          | What it returns                                                                         | where it reads          |
| :------------------------------------------------- | :-------------------------------------------------------------------------------------- | :---------------------- |
| `GET /v1/teams`                                    | every declared team of the company, with the `tenant_user_id` its other operations take | `agents`                |
| `GET …/tenants/{id}`                               | the tenant's runtime summary                                                            | **mirror**              |
| `GET …/board` · `GET …/board/{card}`               | the six-column board and one card                                                       | runtime · mirror        |
| `GET …/events`                                     | the tenant's event ledger                                                               | **mirror**              |
| `GET …/runs`                                       | the run list                                                                            | **mirror**              |
| `GET …/runs/{id}`                                  | one run                                                                                 | runtime · mirror        |
| `GET …/runs/{id}/events`                           | its paged transcript                                                                    | **mirror**              |
| `GET …/roster`                                     | the agents bound to this team for this tenant                                           | `agents`                |
| `GET …/cost`                                       | spend over the budget window                                                            | **mirror**              |
| `GET …/approvals` · `POST …/approvals/{id}/decide` | the approvals queue, and deciding one                                                   | naive's own `approvals` |
| `GET …/plan`                                       | declared vs observed                                                                    | `agents`                |
| `GET …/diagnostics`                                | findings, plus what could not be computed and why                                       | **mirror**              |

<Warning>
  **The rows marked "mirror" read naive's task mirror on BOTH runtimes, and a durable
  tenant has no rows in it.** The mirror is written by the legacy close path, so for a
  durable tenant those operations answer `200` with nothing in them: all-zero board
  counts and `spent_cents: 0` on `GET …/tenants/{id}`, empty `items` on `…/events`,
  `…/runs` and `…/runs/{id}/events`, empty `buckets` on `…/cost`, empty `findings` on
  `…/diagnostics` (so the `unverified` finding is unreachable on the durable runtime).
  `GET …/tenants/{id}` and `GET …/board` therefore disagree about the same tenant — the
  header counts mirror rows while the board is fetched from the runtime. Read the board
  for the board.
</Warning>

`POST …/approvals/{id}/decide` is a second address for one write path: it calls the
same `executeApproval` / `denyApproval` the existing approvals routes call.

`GET …/board?status=` filters in memory on both runtimes (on hermes the wire says
`filtered_in_memory: true`). The runtime's six states and this surface's six are
different partitions, so `?status=unverified` on a durable tenant is a valid query that
can only ever match nothing — see [Board & cards](/docs/api-reference/runtime/board). A
durable card carries `runtime_status` (`todo ready doing review done blocked`) beside
the mapped `status` (`open claimed awaiting_check done unverified blocked`) rather than
silently substituting one for the other.

## The eleven a durable tenant gets and a hermes tenant does not

These reach the durable runtime through the control-plane seam
(`${sidecar_url}/control/{company}/{tenant}{path}`). For a hermes tenant each answers
`501 not_configured` with `error.details.runtime: "hermes"` and the legacy route that
does the equivalent job.

| Operation                                    | On the durable runtime                                                                                                                                                                                                                                                                               | On hermes                                                                                                                                  |
| :------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `POST …/submit`                              | admits a card through the same intake a person's message takes                                                                                                                                                                                                                                       | `POST /v1/tasks` stays available                                                                                                           |
| `POST …/board/{card}/unblock`                | revives the card with a fresh attempt budget                                                                                                                                                                                                                                                         | `POST /v1/tasks/{id}/unblock` stays available                                                                                              |
| `POST …/sessions/{channel}/messages`         | posts into the channel; returns the `run_id` to watch                                                                                                                                                                                                                                                | no per-(team, tenant) session store exists                                                                                                 |
| `GET …/runs/{id}/stream`                     | proxies the transcript as SSE                                                                                                                                                                                                                                                                        | frames are caller-forgeable on the legacy store                                                                                            |
| `POST …/schedule` · `DELETE …/schedule/{id}` | registers or cancels recurring work, pinned to the model in force at registration                                                                                                                                                                                                                    | `POST /v1/cron` stays mounted, but answers `no_runtime_claimed` and HOLDS the command for a tenant with no claimed container               |
| `GET …/schedule`                             | what recurs: cadence, next firing, and the model each job is pinned to. Without it the id returned by `POST …/schedule` is the only handle that ever exists, and `DELETE` is addressed by that id                                                                                                    | `GET /v1/cron` lists `cron_jobs`, which carries no team column                                                                             |
| `POST …/stop`                                | the kill switch — see below                                                                                                                                                                                                                                                                          | a legacy run is stopped one at a time through the sidecar (`POST /v1/companies/{id}/ceo/runs/{runId}/stop`)                                |
| `GET …/audit`                                | the turn spine: seq, time, member, model, byte counts, digests, refusals and seal state for every model turn                                                                                                                                                                                         | the legacy runtime retains no transcript this API can reach                                                                                |
| `GET …/runs/{id}/audit`                      | one attempt's transcript (shown / replied / tool args); `?export=1&attempt=N` returns the sealed archive with its digest. Needs a **company-scoped** credential                                                                                                                                      | as above                                                                                                                                   |
| `POST …/apply`                               | binds a delivered manifest digest. `expected_digest` is REQUIRED — the two-step exists so a person names the surface they reviewed, and an apply with no digest would bind whatever the registry holds. A digest that has been overtaken is refused with the runtime's own 409 carrying BOTH digests | there is no applied digest to compare `expected_digest` against, so the 409 this operation exists to raise could never be raised correctly |

Three of the shared reads — `GET …/board`, `GET …/board/{card}`, `GET …/runs/{id}` —
serve both runtimes but from different stores: the mirror for a hermes tenant, the
runtime's own board for a durable one.

### `POST …/stop`

`POST …/stop` stops the team's dispatch loop and returns `cancelled` (scheduled ticks
removed), `in_flight` (attempts already running) and `is_pause_not_decommission: true`.
It marks the team stopped, cancels the recurring tick, and fences the tick so a board
transition arriving afterwards cannot re-arm it (the stop is recorded *before* the
cancel). It does **not** recall an attempt already handed to a member — that attempt
runs to its end and spends what it spends, which is why the answer carries `in_flight`.
`start-loop` is the way back. There is deliberately no per-run kill
(`POST …/runs/{id}/stop` refuses on the durable runtime).

`GET …/runs/{id}/stream` has no `trace_id` yet (`X-Naive-Trace-Unavailable`) and is not
metered on open; the runtime's own ceilings bound it (300s stream, 250ms poll, 120
reads/min at the front door).

## What is declared and refuses on both runtimes

The rest of the surface answers `501 not_configured` with `error.details.missing`
naming each absent dependency and `error.details.runtime` naming which runtime the
refusal is about. It never returns `{ items: [] }` for a refusal.

| Operation                                      | Missing on the durable runtime                                                                  | Missing on hermes                                                                 |
| :--------------------------------------------- | :---------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| `GET …/sessions` · `…/sessions/{channel}`      | has `channels` and `read`; no control-plane head                                                | no per-(team, tenant) session store                                               |
| `POST …/runs/{id}/stop`                        | no per-run kill, deliberately — `POST …/stop` is the interrupt                                  | the frozen sidecar route does this                                                |
| `GET …/effects` · `POST …/effects/{id}/settle` | has `effects` and `effect-decide`; no control-plane head                                        | no effects table exists                                                           |
| `POST …/model`                                 | has `model`; no control-plane head                                                              | per-role model is a manifest field, and no manifest is stored                     |
| `POST …/apply`                                 | has `apply`; no control-plane head. `GET …/plan` already reports the digests it would compare   | with no applied digest, `409 stale_expected_digest` can never be raised correctly |
| `POST …/migrate` · `POST …/rollback`           | migration is a control-plane act, deliberately not tenant-addressable; no snapshot store exists | same                                                                              |

<Warning>
  **A durable tenant has two approval queues and this surface shows one.**
  `GET …/approvals` and `POST …/approvals/{id}/decide` read naive's own `approvals`
  table. The durable runtime holds a separate queue gating tool calls inside the Durable
  Object, with no control-plane head — approving here does not release one waiting there.
</Warning>

## Governance is the same governance

Every operation sits behind the same session-or-key authentication and the same
approvals machinery as the rest of the API — no second policy engine and no
runtime-specific bypass. See [the governance gateway](/docs/architecture/governance-gateway)
and [Approvals](/docs/architecture/approvals).

## Related

* [The brain](/docs/architecture/brain) — what a team's `brain.partition()` binds
* [Approvals](/docs/architecture/approvals) — the queue `…/approvals` reads
* [The decision ledger](/docs/architecture/decision-ledger) — why `decision_id` is null here
* [Event & trigger router](/docs/architecture/event-router) — inbound events, still on the legacy lane
