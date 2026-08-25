> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Plan & diagnostics

> GET …/plan and GET …/diagnostics — the honesty report for one team, and the findings the platform can actually compute.

## Plan

```
GET /v1/teams/{team}/tenants/{tenantUserId}/plan
```

`plan` is not a dry-run of a deployment. It is an **honesty report**: it prints
the mechanisms that claim a property the platform does not yet have, so that you
find out before you depend on one.

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "team": "support",
    "tenant_user_id": "8f1c…",
    "runtime": "hermes",
    "manifest_digest": null,
    "applied_digest": null,
    "snapshot_digest": null,
    "fence": null,
    "surface_honesty": {
      "idempotency": {
        "backend": "in-process Map",
        "shared_across_replicas": false,
        "caches_5xx": true,
        "body_fingerprint": false,
        "note": "…"
      },
      "revocation_on_reads": { "enforced": false, "note": "…" },
      "connections": { "mode": "open", "toolkits": "all", "governed_tools": 0, "note": "…" },
      "deprecation_headers": { "verified_at_edge": false, "note": "…" }
    },
    "spend": [],
    "unpriced_actions": [],
    "attestation_parity": {},
    "approvers": [],
    "declarative_only": [],
    "unavailable_because": { "…": "…" }
  }
  ```
</ResponseExample>

### The four honesty facts, and what to do about each

These are printed **all four or none**. A report that prints three is a report a
reader will trust for the fourth.

| Fact                                          | What it means for you                                                                                                                                                                                                                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `idempotency.shared_across_replicas: false`   | The idempotency store is an in-process map. A retry that lands on a different replica **will execute again**. It also caches 5xx and does not fingerprint the body, so the same key with a different body returns the first answer. Do not rely on `Idempotency-Key` for exactly-once on this API yet. |
| `revocation_on_reads.enforced: false`         | Revoking an operator stops its **writes** immediately. Its **reads keep answering**. If you revoke a credential for a security reason, rotate the key as well.                                                                                                                                         |
| `connections.mode: "open"`                    | Every Composio toolkit and every tool in it is reachable by a connected agent. The engine implements per-toolkit and per-tool filtering in full; nothing configures it, so nothing is filtered. See [connection policy](/docs/api-reference/governance/connections-policy).                                 |
| `deprecation_headers.verified_at_edge: false` | The `Deprecation` / `Sunset` / `Link` headers described on the [legacy pages](/docs/api-reference/orchestration/overview) may be stripped by the CDN before they reach you. The openapi `deprecated: true` mark is the channel with an in-repo proof.                                                       |

### The digests are all `null`

`manifest_digest`, `applied_digest`, `snapshot_digest` and `fence` have no
storage in this build. They are reported as `null` rather than as a
plausible-looking hash, because a synthesised digest is indistinguishable
downstream from a real one — which is exactly what the fence exists to prevent.

`spend`, `unpriced_actions`, `attestation_parity`, `approvers` and
`declarative_only` are empty for the same reason and each carries its own entry in
`unavailable_because`. **An empty array here does not mean "none".**

***

## Diagnostics

```
GET /v1/teams/{team}/tenants/{tenantUserId}/diagnostics?kind=stranded
```

Findings the platform can compute from real rows — and, explicitly, the ones it
cannot.

| `kind`       | severity | meaning                                                                                    |
| ------------ | -------- | ------------------------------------------------------------------------------------------ |
| `stranded`   | `warn`   | the card is claimed and its lease has lapsed — the worker that held it is not heartbeating |
| `unverified` | `info`   | the completion claim was accepted but no naive-owned ledger row could adjudicate it        |

`unverified` is surfaced as `info` rather than `warn` deliberately: it is a
**correct** outcome that an operator must still be able to see.

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "findings": [
      {
        "kind": "stranded",
        "severity": "warn",
        "refs": ["task-def-456"],
        "because": "the card is claimed and its lease has lapsed — the worker that held it is not heartbeating"
      }
    ],
    "kinds_not_computable": {
      "manifest": "no manifest is stored, so no card can be checked against one",
      "effect": "no effect ledger exists",
      "budget": "per-bucket caps are declared in naive.config.ts and have no server-side storage",
      "assignment": "requires the compiled roster to know which roles are declarable"
    }
  }
  ```
</ResponseExample>

`kinds_not_computable` is always present. Four finding kinds exist in the contract
and cannot be evaluated here; an empty `findings` array with no such block would
read as "this tenant is healthy" when the truth is "two of six checks ran".

Each finding lists at most 100 refs.
