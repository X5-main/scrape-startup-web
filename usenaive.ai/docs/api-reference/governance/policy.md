> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Policy

> POST /v1/policy/explain, GET /v1/policy/snapshot, GET /v1/policy/statute — and the four operations that refuse.

## Explain

```
POST /v1/policy/explain?tenant=<tenant_user_id>
```

**Would this action be allowed for this tenant, and what decides?**

Pure — no side effect, nothing metered (`side_effects: []` is on the wire). It calls the
same helpers the enforcing path calls.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST "https://api.usenaive.ai/v1/policy/explain?tenant=8f1c…" \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "action": "cards.create" }'
  ```
</RequestExample>

### Body

| Field     | Type   | Required | Description                                                                    |
| --------- | ------ | -------- | ------------------------------------------------------------------------------ |
| `action`  | string | Yes      | An action id, e.g. `cards.create`. Empty or non-string is `400 invalid_input`. |
| `toolkit` | string | No       | For connection actions — the toolkit the call would run against.               |
| `payload` | object | No       | The arguments, if a rule keys on them.                                         |

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "action": "cards.create",
    "tenant_user_id": "8f1c…",
    "environment": "production",
    "verdict": "park",
    "because": {
      "layer": "platform",
      "rule": "DEFAULT_APPROVAL_ACTIONS",
      "detail": "sensitive_action_defaults_to_approval"
    },
    "primitive": "cards",
    "primitive_enabled": true,
    "capability_allowed": true,
    "requires_approval": true,
    "side_effects": [],
    "decision_id": null,
    "decision_id_unavailable_because": "there is no policy_decisions ledger in this build; a pure explain would not write to it in any case"
  }
  ```
</ResponseExample>

### Reading `because`

`rule` names the config path that decided:

| `detail`                                | `layer`    | `rule`                                                       |
| --------------------------------------- | ---------- | ------------------------------------------------------------ |
| `primitive_disabled_by_kit`             | `company`  | `account_kit.primitives_config.<primitive>.enabled`          |
| `capability_denied_by_kit`              | `company`  | `account_kit.primitives_config.<primitive>.capabilities`     |
| `sensitive_action_defaults_to_approval` | `platform` | `DEFAULT_APPROVAL_ACTIONS`                                   |
| `approval_required_by_kit`              | `company`  | `account_kit.primitives_config.<primitive>.requiresApproval` |
| `no rule refuses this action`           | `call`     | `null`                                                       |

`verdict` is `deny` when the primitive is off or the capability is denied, `park`
when approval is required, and `allow` otherwise. It is never `approve` — see the
[verdict vocabulary](/docs/api-reference/governance/overview#verdict-vocabulary).

***

## Snapshot

```
GET /v1/policy/snapshot?tenant=<tenant_user_id>
```

The resolved AccountKit — the tenant's authority as the gate sees it right now.

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "tenant_user_id": "8f1c…",
    "environment": "production",
    "kit": {
      "id": "kit-…",
      "name": "Default",
      "is_default": true,
      "primitives": { "…": "…" },
      "connections": { "mode": "open" },
      "budget": { "capCents": 5000, "period": "month", "hard": true }
    },
    "statute_actions": 31,
    "layers_represented": ["platform", "company", "call"],
    "layers_unrepresented": {
      "statute": "the built-in approval set is the closest thing; it is not separately stored or versioned",
      "team": "no team-layer policy storage exists",
      "agent": "per-agent policy is an AccountKit per agent; it is not a distinct layer in this schema"
    },
    "digest": null,
    "digest_unavailable_because": "no snapshot digest is computed or stored in this build"
  }
  ```
</ResponseExample>

`statute_actions` is a count — enumerate them with `GET /v1/policy/statute`.

***

## Statute

```
GET /v1/policy/statute
```

The actions that default to human approval.

These are **defaults**, not a statute (`"waivable": true` is on the response):
`primitives_config.<primitive>.requiresApproval = false` on an AccountKit opts a tenant
out of any of them. To know what a specific tenant does, use
[`POST /v1/policy/explain`](#explain).

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "actions": [
      { "action": "brain.forget", "primitive": "brain", "outcome": "approve" },
      { "action": "cards.create", "primitive": "cards", "outcome": "approve" }
    ],
    "count": 31,
    "waivable": true,
    "waivable_because": "these are DEFAULTS. AccountKit primitives_config.<primitive>.requiresApproval = false opts a tenant out of any of them. A genuinely non-waivable statute layer does not exist in this build."
  }
  ```
</ResponseExample>

`outcome` is `approve` on every row; the engine folds it to the `park` verdict when the
condition is unsatisfied. The set covers money movement, identity, infrastructure, mobile
device control, connections, and destructive brain operations — read the live list for
the current set.

<Warning>
  Two rows are reported but not enforced by the decision engine: `phone.voice_enable` and
  `phone.call` (the list has 31 actions, the engine 29; explain reads the same list, so it
  reports the same thing). If you need a human gate on those, set
  `requiresApproval: true` on the `phone` primitive in the AccountKit and confirm in
  sandbox.
</Warning>

***

## The four that refuse

| Operation                       | `missing`                                                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /v1/policy/decisions`      | `policy_decisions` table: no such table exists                                                                                                                           |
| `GET /v1/policy/decisions/{id}` | same                                                                                                                                                                     |
| `POST /v1/policy/waives`        | a statute layer to waive against; a decision ledger — a waiver that leaves no row is unauditable                                                                         |
| `POST /v1/policy/break-glass`   | grant storage — break-glass mints a time-boxed grant and there is no grant table; a decision ledger — an unlogged break-glass is the one thing worse than no break-glass |

`POST /v1/policy/waives` answers `501`, not `403 statute_not_waivable` — nothing was
evaluated, because no statute layer exists yet.
