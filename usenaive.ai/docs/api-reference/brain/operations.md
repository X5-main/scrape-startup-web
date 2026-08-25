> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Brain Operations

> Operator surface — run ledger writebacks, the memory proposal review queue, promoted objects, and production gates.

These endpoints power the operational substrate: agent work is captured as writeback envelopes, routed through the Memory Gateway into a reviewable proposal queue, and promoted to canonical brain objects. They are primarily operator/dashboard-facing (surfaced in Mission Control) rather than day-to-day agent tools.

<Note>
  The Memory Gateway runs in one of three modes via `BRAIN_MEMORY_GATEWAY_MODE`: `shadow` (proposals recorded, nothing auto-promoted), `proposal` (new agent memory routed through proposals), `enforced` (canonical writes require promotion). Default is `shadow`.
</Note>

## Writebacks

Agent-run memory intake envelopes.

* `POST /v1/brain/writebacks` — submit a writeback envelope (idempotency-keyed).
* `GET /v1/brain/writebacks` — list writebacks.
* `GET /v1/brain/writebacks/:id` — a writeback and its derived proposals.

## Memory proposals

The human-review queue. Proposals are routed by the Memory Gateway (`auto_promote`, `human_review`, `merge`, `reject`, `quarantine`, `tombstone`, `needs_evidence`).

* `GET /v1/brain/proposals` — list proposals.
* `GET /v1/brain/proposals/:id` — a single proposal.
* `GET /v1/brain/proposals/:id/events` — proposal audit trail.
* `PATCH /v1/brain/proposals/:id` — edit a proposal's payload/metadata.
* `POST /v1/brain/proposals/:id/accept` — accept + promote. Body: `{ reason?, edited_payload? }`.
* `POST /v1/brain/proposals/:id/reject` — reject. Body: `{ reason? }`.
* `POST /v1/brain/proposals/:id/merge` — merge into a target. Body: `{ merge_target_id, reason? }`.
* `POST /v1/brain/proposals/:id/quarantine` — quarantine. Body: `{ reason? }`.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/brain/proposals/prop-uuid/accept \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "reason": "verified against CRM" }'
  ```
</RequestExample>

## Canonical objects

`GET /v1/brain/objects` and `GET /v1/brain/objects/:id` — promoted canonical memory objects (decision, runbook, task\_outcome, skill, approval, artifact).

## Operator status & gates

* `GET /v1/brain/ops-status` — gateway mode, proposal counts, recent runs, runtime.
* `GET /v1/brain/prod-gates?scope=&scope_ref=` — production-readiness gates: deletion proof, projection health, bake-off registration, golden thresholds.
* `POST /v1/brain/bakeoff/runs` and `POST /v1/brain/bakeoff/runs/:id/run` — register and execute an engine bake-off.

## Maintenance

`POST /v1/brain/maintenance/librarian` — run the librarian sweep: age out stale
candidates and re-verify claims that are due. Optional body:

| Field                      | Type   | Description                                                                |
| -------------------------- | ------ | -------------------------------------------------------------------------- |
| `candidate_stale_after_ms` | number | How long a `candidate` claim may sit before it is treated as stale.        |
| `reverify_after_ms`        | number | How long a claim may go unchecked before it is queued for re-verification. |

Both fall back to the server's defaults when omitted or non-numeric.

<Note>
  This sweep does **not** delete anything on a retention schedule. There is no
  retention storage in this build — see
  [`GET /v1/brain/retention`](/docs/api-reference/brain/beliefs#retention).
</Note>

## Metrics

`GET /v1/brain/metrics` — brain counters.

<Warning>
  These counters are process-wide, not scoped to your company — do not bill or chart per
  tenant from them. For per-tenant spend use
  [`GET /v1/spend`](/docs/api-reference/governance/spend); for brain plan-quota usage use
  [`GET /v1/usage`](/docs/api-reference/status/usage).
</Warning>
