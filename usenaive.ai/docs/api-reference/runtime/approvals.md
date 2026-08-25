> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Approvals

> GET …/approvals and POST …/approvals/{id}/decide — the only write on the durable runtime surface that is not refused.

Approvals are real end to end on this surface, because the approvals table is
already keyed on `(company, tenant_user)` — which is exactly the address these
routes use.

## List pending approvals

```
GET /v1/teams/{team}/tenants/{tenantUserId}/approvals?status=pending&limit=50
```

| Name     | Description                     |
| -------- | ------------------------------- |
| `status` | Filter by status. Omit for all. |
| `limit`  | Max 200.                        |

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "items": [
      {
        "id": "apr-9c1…",
        "tenant_user_id": "8f1c…",
        "account_kit_id": "kit-…",
        "environment": "production",
        "primitive": "payments",
        "action_type": "payments.transfer",
        "title": "Transfer $240.00 to ACME Ltd",
        "payload": { "amount_cents": 24000, "to": "…" },
        "status": "pending",
        "result": null,
        "error": null,
        "requested_by": { "actor_type": "agent", "actor_id": "agt-…" },
        "resolved_by": null,
        "resolved_at": null,
        "reason": null,
        "created_at": "2026-07-30T10:12:00.000Z",
        "updated_at": "2026-07-30T10:12:00.000Z"
      }
    ],
    "next_cursor": null,
    "next_cursor_unavailable_because": "services/approvals.ts listApprovals() takes a limit, not a keyset cursor; adding one is a service change outside this router"
  }
  ```
</ResponseExample>

<Note>
  **`next_cursor` is always `null` here.** This list takes a limit, not a cursor. If
  you have more pending approvals than your limit, raise the limit (up to 200) —
  paging past that is not available on this address yet, and the response says so
  rather than minting a cursor the next call could not honour.
</Note>

***

## Decide

```
POST /v1/teams/{team}/tenants/{tenantUserId}/approvals/{id}/decide
```

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST "https://api.usenaive.ai/v1/teams/support/tenants/8f1c…/approvals/apr-9c1…/decide" \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "decision": "deny", "because": "vendor not on the approved list" }'
  ```
</RequestExample>

### Body

| Field      | Type                    | Required    | Description                                                                                                      |
| ---------- | ----------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| `decision` | `"approve"` \| `"deny"` | Yes         | Anything else is `400 invalid_input`.                                                                            |
| `because`  | string                  | **On deny** | Required when denying, optional when approving. A denial is the decision someone will later be asked to justify. |

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "approval_id": "apr-9c1…",
    "decision": "deny",
    "decided_by": { "type": "user", "id": "usr-…" },
    "status": "denied",
    "grant": null,
    "grant_unavailable_because": "grants have no storage in this build; this approval replays the frozen payload rather than minting an argument-bound, snapshot-pinned grant",
    "decision_id": null,
    "trace_id": null
  }
  ```
</ResponseExample>

## One write path, two addresses

This route calls the **same** service the existing
[`/v1/users/{user_id}/approvals/{id}/approve`](/docs/api-reference/approvals/approve)
and [`/deny`](/docs/api-reference/approvals/deny) routes call. It is a second address
for one write path, not a second write path — so these two rules hold identically
here:

* **A human must resolve.** An agent-authored resolution is rejected. Approving
  with an API key that authenticates an agent does not work.
* **No self-approval.** The actor that requested an approval cannot resolve it.

Approving **replays the frozen payload** captured when the approval was created.
It does not re-evaluate the request against current policy.

<Warning>
  **One rule that does NOT hold identically.** The legacy approval
  addresses re-check that the calling agent profile is still active before a
  mutating request; this address does not. A credential that has been revoked can
  still reach `POST …/decide` here after it has stopped working at
  `/v1/users/{user_id}/approvals/…`.

  This is the same class of gap that
  [`GET …/plan`](/docs/api-reference/runtime/plan) reports as
  `revocation_on_reads.enforced: false`, except that here it extends to a write. If
  you revoke an operator for a security reason, **rotate the key** — do not rely on
  revocation alone to close this surface.
</Warning>

## Why `grant` is null

A grant in the durable-runtime design is argument-bound, single-use and pinned to a
policy snapshot. Nothing here mints one: approving replays a stored payload. The
field is `null` with the reason beside it rather than absent, so a client written
against the eventual shape does not have to guess whether the key is missing or the
value is.

`decision_id` and `trace_id` are `null` for the same reason — there is no decision
ledger and no trace column in this build.
