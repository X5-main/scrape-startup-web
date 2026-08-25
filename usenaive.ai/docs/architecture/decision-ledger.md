> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# The decision ledger

> What records a governance decision today, and why the designed policy_decisions ledger is not one of them yet.

A governance decision is *made* by the closed governor
([the gateway](/docs/architecture/governance-gateway)). This page is about where it is
**written down**, which is a separate question with a separate answer per record.

## The three records that exist

| Record                              | Table                   | Guarantee                                              | Read it at                                                                  |
| :---------------------------------- | :---------------------- | :----------------------------------------------------- | :-------------------------------------------------------------------------- |
| **A frozen action and its outcome** | `approvals`             | **Authoritative.** Committed before anything executes. | `GET /v1/users/{id}/approvals`, `GET …/teams/{team}/tenants/{id}/approvals` |
| **What an agent did**               | `activity_events`       | **Best-effort.** See below.                            | `GET /v1/users/{id}/logs`, `GET /v1/logs`                                   |
| **What a run emitted**              | the run + event ledgers | Per-run transcript                                     | `GET …/runs/{id}/events`                                                    |

Live, all three fan out over the company SSE stream at `GET /v1/events`.

<Warning>
  **`activity_events` is not an audit ledger, by design.** `logTenantEvent` catches its own
  insert failure, logs a warning, and returns `false` — deliberately, so that an
  audit-log write can never fail the business action it describes. That is the right
  trade-off for a *log* and the wrong property for a *ledger*: an absent row does not prove
  an absent act.

  Reconcile against `approvals`, which is committed on the transaction path, not against
  the activity log. If you need a complete count of gated actions, count approvals.
</Warning>

## What `policy_decisions` is, and why it answers 501

The design calls for one ledger — `policy_decisions` — carrying every verdict with its
inputs, its `trace_id` and a stable `decision_id`, so that "why was this denied?" is a
lookup rather than a reconstruction. **That table does not exist in this build.** Nothing
writes it and nothing reads it.

Rather than fabricate a `decision_id`, the operations that would return one return
`null` beside a sibling field naming the reason:

```jsonc theme={"theme":"css-variables"}
{
  "verdict": "park",
  "because": { "layer": "platform", "rule": "DEFAULT_APPROVAL_ACTIONS", "detail": "sensitive_action_defaults_to_approval" },
  "side_effects": [],
  "decision_id": null,
  "decision_id_unavailable_because":
    "there is no policy_decisions ledger in this build; a pure explain would not write to it in any case"
}
```

A fabricated id would be indistinguishable downstream from a real one, which is precisely
the failure a ledger exists to prevent.

Operations that refuse for this reason:

| Operation                                      | Why                                                                                                    |
| :--------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| `GET /v1/policy/decisions` · `/decisions/{id}` | no such table                                                                                          |
| `GET /v1/brain/decisions`                      | it is a *view* over `policy_decisions` filtered to brain resources, and a view needs something to view |
| `POST /v1/policy/waives`                       | a waiver that leaves no ledger row is unauditable                                                      |
| `POST /v1/policy/break-glass`                  | an unlogged break-glass is the one thing worse than no break-glass                                     |

<Note>
  `POST /v1/policy/waives` answers **501, not 403.** A 403 would tell you the platform
  refused to waive something it never evaluated — there is no statute layer to waive
  against. The 403 becomes the correct answer the day a statute exists.
</Note>

## What you can answer today without the ledger

`POST /v1/policy/explain` is **pure** (it declares `side_effects: []` on the wire so you
do not have to take this page's word for it) and calls the same
`isPrimitiveEnabled` / `capabilityAllowed` / `resolveApprovalRequirement` the gate calls.
It reports the engine's verdict vocabulary — `park`, never "approve" — plus the **layer**
that decided and the exact config path:

* `layer: "company"` → an AccountKit field, named (`account_kit.primitives_config.<p>.enabled`)
* `layer: "platform"` → the built-in `DEFAULT_APPROVAL_ACTIONS`
* `layer: "call"` → nothing refuses this action

`GET /v1/policy/statute` enumerates that built-in set — and reports `waivable: true`,
because it is a set of **defaults** a kit can opt out of with `requiresApproval: false`,
not a statute. Calling it a statute without saying so would overstate what cannot be
waived.

## Related

* [Approvals](/docs/architecture/approvals) — the authoritative record and its lifecycle
* [The governance gateway](/docs/architecture/governance-gateway) — who decides, in what order
* [The durable runtime](/docs/architecture/durable-runtime) — where `decision_id: null` surfaces
