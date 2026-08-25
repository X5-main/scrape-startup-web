> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Agent runs (legacy)

> GET/POST /v1/runs and the run ledger — the company-scoped agent run surface. Deprecated; use the (team, tenant)-addressed runs instead.

<Warning>
  **Deprecated** — this drives the legacy orchestration runtime, which is frozen. Use
  [`GET /v1/teams/:team/tenants/:tenantUserId/runs`](/docs/api-reference/runtime/runs) instead.

  These routes keep answering with unchanged shapes; the deprecation is announced in
  headers only (`Deprecation` per RFC 9745, `Link rel="deprecation"`, `Warning: 299`,
  `X-Naive-Deprecation-Id: dep.surface.runs`). There is no `Sunset` header — the freeze
  ends when the last legacy container stops, not on a date.
</Warning>

The company-scoped agent run ledger. Every run is a row; every row has an ordered
list of ledger events and a list of artifacts.

## Operations

| Method | Path                      | Notes                                                                                                            |
| ------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/v1/runs`                | `status`, `run_type`, `limit`. Newest first.                                                                     |
| `POST` | `/v1/runs`                | Opens a run. With an objective and `attach_brain` not `false`, an ambient brain capsule is attached best-effort. |
| `GET`  | `/v1/runs/{id}`           | The run plus every ledger event and artifact.                                                                    |
| `GET`  | `/v1/runs/{id}/events`    | The ledger.                                                                                                      |
| `POST` | `/v1/runs/{id}/events`    | Append a ledger event. Write-guarded.                                                                            |
| `GET`  | `/v1/runs/{id}/artifacts` | Artifacts.                                                                                                       |
| `POST` | `/v1/runs/{id}/complete`  | Terminal transition. Idempotent.                                                                                 |

## Scoping

<Warning>
  `GET /v1/runs` is scoped by the credential, not by the URL: an owner session or the
  config-root lead agent sees every run in the company, a sealed non-privileged key sees
  only its own, and an unsealed non-root key sees nothing. For a per-tenant view use
  [`GET /v1/teams/{team}/tenants/{tenantUserId}/runs`](/docs/api-reference/runtime/runs).
</Warning>

`GET /v1/runs/{id}` applies the same rule: a non-privileged agent key may read only
its own runs, and any other id returns `404` with the **same shape** as a genuinely
missing run — so the endpoint is not an oracle for which run ids exist.

## Completion is compare-and-set

`POST /v1/runs/{id}/complete` transitions the run to a terminal status exactly once
(a compare-and-set on the end timestamp). A repeat call is idempotent and returns
the run as the winner left it — it does not error and it does not overwrite.

## Appending events

`POST /v1/runs/{id}/events` is write-guarded. It is allowed for an owner or
operator session, the config-root lead agent, the sealed subject that owns the run,
or the agent whose id matches the run.

Frames on this ledger take `actor_type`, `actor_id` and `event_type` as free strings from
the request body — which is why the durable runtime's
[SSE transcript](/docs/api-reference/runtime/runs) is refused rather than served from here.
