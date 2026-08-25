> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Runs

> GET …/runs, GET …/runs/{id}, GET …/runs/{id}/events — the run ledger for a (team, tenant). Streaming and stopping are refused in this build.

## List runs

```
GET /v1/teams/{team}/tenants/{tenantUserId}/runs
```

Real rows from the run mirror, newest first, keyset-paged (`limit` max 200,
`cursor` opaque).

<Note>
  **These runs are correctly scoped to your tenant.** The run mirror carries a
  company but not a tenant, so the route joins through the card to reach the tenant.
  This matters because the older company-scoped ledger at
  [`GET /v1/runs`](/docs/api-reference/orchestration/runs) is **not** tenant-scoped: under
  an operator key it returns every tenant's runs regardless of which team or tenant
  you asked about. Use this address, not that one.
</Note>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "items": [
      {
        "run_id": "run-abc-123",
        "task_id": "task-def-456",
        "role": "tier1",
        "model": null,
        "status": "running",
        "started_at": "2026-07-30T10:59:12.000Z",
        "ended_at": null,
        "trace_id": null
      }
    ],
    "next_cursor": null
  }
  ```
</ResponseExample>

`status` is the run's recorded outcome; where none is recorded it is `ended` if
the run has an end time and `running` if it does not. `model` is `null` on every
row — per-run model selection is a manifest field and no manifest is stored.

***

## One run

```
GET /v1/teams/{team}/tenants/{tenantUserId}/runs/{id}
```

Adds `summary`, `error`, and two URLs:

| field        | what it is                                              |
| ------------ | ------------------------------------------------------- |
| `events_url` | the paged transcript — **works today**                  |
| `stream_url` | the SSE transcript — **`501` in this build**, see below |

`stream_url` is emitted even though the address refuses, because the URL is the
correct one and hiding it would make the shape change when the stream lands.
Check the status code, not the presence of the field.

`404 not_found` means no run with that id belongs to this tenant.

***

## The paged transcript

```
GET /v1/teams/{team}/tenants/{tenantUserId}/runs/{id}/events
```

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "items": [
      {
        "seq": 8122,
        "source": "platform",
        "event_type": "run.output",
        "at": "2026-07-30T10:59:41.000Z",
        "payload": { "text": "…" },
        "trace_id": null
      }
    ],
    "next_cursor": "eyJrIjoi…"
  }
  ```
</ResponseExample>

Frames are returned **newest first** and the cursor pages backwards through
history. If you are rendering a transcript top-to-bottom, reverse each page.

`source` is always `platform`: these rows are written by the API from the runtime
mirror, never from a caller's request body.

***

## Streaming — refused, and why

```
GET /v1/teams/{team}/tenants/{tenantUserId}/runs/{id}/stream    → 501 not_configured
```

<Warning>
  This is refused rather than approximated, and the three missing pieces are named
  on the wire. Each one alone would make a stream dishonest:

  1. **`source` is not platform-set on the run-event table a stream would read.**
     That table takes `actor_type` / `actor_id` / `event_type` as free strings from
     the request body, so an agent key can append a frame claiming to be the owner.
     Rendering those as a live transcript is a forgery surface — and a stream is
     what a UI renders as *what happened*.
  2. **No `trace_id` column.** Every frame is supposed to carry one.
  3. **No metering on stream open.** Usage is recorded when a response finishes, so
     a stream held open for an hour bills at close and cannot be rate-limited.
     Shipping the stream before that ships an endpoint with no abuse ceiling.

  **Use `…/runs/{id}/events` and poll.** It reads a different table — the one whose
  rows the platform writes — which is why it is safe to serve while the stream is
  not.
</Warning>

## Stopping a run — refused

```
POST /v1/teams/{team}/tenants/{tenantUserId}/runs/{id}/stop   → 501 not_configured
```

A legacy run is stopped through the sidecar at
`POST /v1/companies/{id}/ceo/runs/{runId}/stop`, which is the frozen surface and
keeps answering. See [Orchestration](/docs/api-reference/orchestration/ceo-stream).
