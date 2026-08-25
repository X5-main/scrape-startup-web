> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Grants

> GET /v1/grants, GET /v1/grants/{id}, POST /v1/grants/{id}/revoke — declared, addressable and refused in this build.

<Warning>
  **All three grant operations answer `501 not_configured` in this build.** There is
  no grants table. This page documents what a grant is and what the surface will
  report, so that you do not build a permission model around an object that does not
  exist yet.
</Warning>

```
GET  /v1/grants            → 501
GET  /v1/grants/{id}       → 501
POST /v1/grants/{id}/revoke → 501
```

```json 501 theme={"theme":"css-variables"}
{
  "error": {
    "code": "not_configured",
    "message": "Grants are not available in this build.",
    "details": {
      "surface": "governance",
      "missing": [
        "grant storage: no grants table exists. A Grant's five required properties (argument-bound `args_hash`, `single_use`, `redeemed_at`, `until`, `snapshot_digest`) each need a column, and a grant surface that cannot report them cannot be falsified by anyone."
      ]
    }
  }
}
```

## What a grant is

A grant is a **narrow, checkable permission to do one specific thing once**. It is
not a role and not a scope. Its five properties are five separate fields precisely
so that each can be falsified:

| Property        | Field             | Why it is separate                                                                                                        |
| --------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Argument-bound  | `args_hash`       | The grant covers *these arguments*. Approving a $240 transfer does not authorise a $2,400 one.                            |
| Single use      | `single_use`      | A grant that can be replayed is a standing permission wearing a narrow name.                                              |
| Redeemed        | `redeemed_at`     | You can tell "not yet used" from "used".                                                                                  |
| Time-boxed      | `until`           | Bounded by the `grant.maxUntil` ceiling reported by [`GET /v1/limits`](/docs/api-reference/governance/limits).                 |
| Snapshot-pinned | `snapshot_digest` | The grant is bound to the policy that was in force when it was issued, so a later policy change cannot silently widen it. |

A surface that reports a grant without all five cannot be audited — which is why
this one refuses rather than serving a partial object.

## What happens instead today

Approving an item on the [approvals queue](/docs/api-reference/runtime/approvals)
**replays the frozen payload** captured when the approval was created. That gives
you argument binding and single use in practice, but it is not a grant object: it
has no `until`, no `snapshot_digest`, and no id you can revoke independently.

`POST …/approvals/{id}/decide` reports this directly:

```json theme={"theme":"css-variables"}
{
  "grant": null,
  "grant_unavailable_because": "grants have no storage in this build; this approval replays the frozen payload rather than minting an argument-bound, snapshot-pinned grant"
}
```

## Revocation today

There is no grant to revoke. What you can do:

* **Revoke the agent profile** — this stops its writes immediately. Note that
  [reads keep answering](/docs/api-reference/governance/limits), so rotate the key too.
* **Deny the pending approval** with
  [`POST …/approvals/{id}/decide`](/docs/api-reference/runtime/approvals).
* **Disable the primitive** on the AccountKit.

## Related

* [`POST /v1/policy/break-glass`](/docs/api-reference/governance/policy) — also `501`, because break-glass mints a time-boxed grant
* [`GET /v1/limits`](/docs/api-reference/governance/limits) — reports `grant.maxUntil: null`, the ceiling that is not configured
