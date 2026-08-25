> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Governance API

> /v1/policy, /v1/grants, /v1/limits, /v1/spend, /v1/attestations and /v1/connections — what decides, in what order, and which of it is real.

Seven top-level prefixes that answer one question: **what is this tenant allowed
to do, and what decides?**

<Note>
  **Start with `POST /v1/policy/explain`.** It is pure — no side effect, no ledger
  row, nothing enqueued, nothing metered — and it calls the same helpers the
  enforcing path calls. It is the thing to run *before* you decide whether to act.
</Note>

## What is real, and what refuses

| Operation                                                                | State    | Page                                                              |
| ------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------- |
| `POST /v1/policy/explain`                                                | **live** | [Policy](/docs/api-reference/governance/policy)                        |
| `GET /v1/policy/snapshot`                                                | **live** | [Policy](/docs/api-reference/governance/policy)                        |
| `GET /v1/policy/statute`                                                 | **live** | [Policy](/docs/api-reference/governance/policy)                        |
| `GET /v1/policy/decisions` · `GET /v1/policy/decisions/{id}`             | 501      | [Policy](/docs/api-reference/governance/policy)                        |
| `POST /v1/policy/waives` · `POST /v1/policy/break-glass`                 | 501      | [Policy](/docs/api-reference/governance/policy)                        |
| `GET /v1/grants` · `GET /v1/grants/{id}` · `POST /v1/grants/{id}/revoke` | 501      | [Grants](/docs/api-reference/governance/grants)                        |
| `GET /v1/limits`                                                         | **live** | [Limits](/docs/api-reference/governance/limits)                        |
| `GET /v1/spend`                                                          | **live** | [Spend](/docs/api-reference/governance/spend)                          |
| `GET /v1/attestations` · `GET /v1/attestation-parity`                    | 501      | [Attestations](/docs/api-reference/governance/attestations)            |
| `GET /v1/connections/policy`                                             | **live** | [Connection policy](/docs/api-reference/governance/connections-policy) |
| `GET /v1/connections/toolkits`                                           | **live** | [Connection policy](/docs/api-reference/governance/connections-policy) |
| `GET /v1/connections/toolkits/{toolkit}/tools`                           | **live** | [Connection policy](/docs/api-reference/governance/connections-policy) |

Seven of seventeen serve real data. The other ten answer `501 not_configured` and
name the missing table — see the
[durable runtime refusal contract](/docs/api-reference/runtime/not-wired) for why that
shape, not `{"items": []}`.

## Naming the tenant

Every tenant-scoped operation here takes an optional `?tenant=<tenant_user_id>`.
Omit it and the caller's own subject answers.

<Warning>
  `?tenant=` is **not** an authority bypass. It resolves through the same subject
  resolver as every other route, so a key sealed to one tenant cannot read another
  tenant's resolved policy by naming it. An explain endpoint that leaked a peer's
  authority would be an oracle for exactly the thing it exists to describe.
</Warning>

## Verdict vocabulary

The engine's verdicts, and the one word that is **not** one of them:

| Verdict       | Meaning                         |
| ------------- | ------------------------------- |
| `allow`       | nothing refuses this action     |
| `deny`        | a rule refuses it               |
| `park`        | it needs a human decision first |
| `attest`      | it needs evidence attached      |
| `unavailable` | the decision could not be made  |

`approve` is **not** a verdict. It is what a rule *author* writes; when the
condition is unsatisfied it folds to `park`. Rendering `approve` as an outcome is
how a UI ends up showing a state the engine never produces.

## The layers, and which of them exist here

The design has six policy layers. This build represents three, and the snapshot
says which:

| Layer      | Represented?                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------- |
| `platform` | yes — the built-in approval defaults                                                              |
| `company`  | yes — the AccountKit                                                                              |
| `call`     | yes — per-request arguments                                                                       |
| `statute`  | no — the built-in approval set is the closest thing, and it is not separately stored or versioned |
| `team`     | no — no team-layer policy storage exists                                                          |
| `agent`    | no — per-agent policy is an AccountKit per agent, not a distinct layer                            |

## Related

* [Durable runtime API](/docs/api-reference/runtime/overview) — `/v1/teams`
* [Approvals](/docs/api-reference/approvals/overview) — the queue policy parks work into
* [AccountKits](/docs/api-reference/account-kits/list) — where company-layer policy is written
