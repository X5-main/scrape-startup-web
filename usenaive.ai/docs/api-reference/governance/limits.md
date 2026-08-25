> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Limits

> GET /v1/limits — the ceilings that bound this API, and the four mechanisms that claim a property the platform does not have.

```
GET /v1/limits?tenant=<tenant_user_id>
```

Two real ceilings, two absent ones, the tenant's budget, and the four honesty
facts.

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "snapshot": { "notAfter": null },
    "grant": { "maxUntil": null },
    "snapshot_unavailable_because": "no snapshot lifetime is configured or enforced in this build",
    "grant_unavailable_because": "no grant lifetime is configured or enforced in this build",
    "pagination": {
      "max_limit": 200,
      "cursor": "opaque base64url keyset",
      "offset": "not supported"
    },
    "budget": { "capCents": 5000, "period": "month", "hard": true },
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
    }
  }
  ```
</ResponseExample>

## The ceilings that are real

| Ceiling                | Value                                                               |
| ---------------------- | ------------------------------------------------------------------- |
| `pagination.max_limit` | `200` — every list on the runtime, governance and brain surfaces    |
| `pagination.cursor`    | opaque base64url keyset. Treat it as a token; do not construct one. |
| `pagination.offset`    | **not supported** anywhere on these surfaces                        |

## The ceilings that are not configured

`snapshot.notAfter` and `grant.maxUntil` are reported as `null`. A ceiling
reported as a number nobody set is worse than a ceiling reported as absent, so
these are `null` with the reason beside them.

## `surface_honesty` — read this before you rely on any of the four

This block exists because four mechanisms in the product carry names that promise
more than they do. All four are printed, or none.

### `idempotency`

```json theme={"theme":"css-variables"}
{ "backend": "in-process Map", "shared_across_replicas": false, "caches_5xx": true, "body_fingerprint": false }
```

Three separate defects, each of which breaks a different assumption:

* **not shared across replicas** — a retry that lands on a different instance
  executes again. `Idempotency-Key` does not give you exactly-once on this API.
* **caches 5xx** — a request that failed with a server error is replayed from
  cache on retry, returning the failure instead of retrying it.
* **no body fingerprint** — the same key with a *different* body returns the first
  response. Reusing a key by accident silently returns the wrong answer.

Until this is a shared table with a body fingerprint and a 2xx-only filter, no new
endpoint advertises idempotency and no MCP tool sets `idempotentHint`.

### `revocation_on_reads`

```json theme={"theme":"css-variables"}
{ "enforced": false }
```

The active-profile check runs only for mutating methods. **Revoking an operator
stops its writes immediately; its reads keep answering.** If you revoke a
credential for a security reason, rotate the key as well.

### `connections`

```json theme={"theme":"css-variables"}
{ "mode": "open", "toolkits": "all", "governed_tools": 0 }
```

Both AccountKit creation paths hardcode `mode: "open"`, which omits the toolkit
list entirely. Every toolkit and every tool in it is reachable by a connected
agent. The engine implements per-toolkit and per-tool filtering in full; it is
inert because no kit ever names a toolkit. See
[connection policy](/docs/api-reference/governance/connections-policy).

### `deprecation_headers`

```json theme={"theme":"css-variables"}
{ "verified_at_edge": false }
```

`Deprecation`, `Sunset` and `Link` may be stripped by the CDN before they reach
your client. Do not build a client that depends on seeing them; the openapi
`deprecated: true` mark is the channel with an in-repo proof.

## `budget`

The tenant's AccountKit budget, or `null`. `hard: true` means the cap is
**reserved atomically before the action executes**; `hard: false` means it
escalates to approval. `capCents` is declared in whole cents but is compared
against a ledger that resolves fractions of one, so sub-cent primitive calls
count toward it. See [Spend](/docs/api-reference/governance/spend).
