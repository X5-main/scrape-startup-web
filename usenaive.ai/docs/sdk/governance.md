> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Governance from the SDK

> The typed vocabulary of a denial, the allow/park decision, and an honest map of what the policy surface does and does not expose to this client.

Governance is enforced **server-side**, on every path, regardless of which client you hold.
What the SDK gives you is a typed way to *read* the outcome — and an honest statement of which
parts of the policy surface it can reach today.

## Three outcomes, not two

A governed call resolves one of three ways. Only one of them throws.

| Outcome   | How it arrives                                                | What to do                                  |
| --------- | ------------------------------------------------------------- | ------------------------------------------- |
| **allow** | the normal result                                             | proceed                                     |
| **park**  | body `{ status: "pending_approval", approval_id }` (HTTP 202) | a human must decide; poll or wait           |
| **deny**  | a thrown `NaiveError`                                         | read `err.code` — it is not retryable as-is |

A park is **success-with-deferral**. It does not throw, and reading its result as if the work
had happened is the single most common governance bug.

```ts theme={"theme":"css-variables"}
import { asDecision } from "@usenaive-sdk/server";

const outcome = asDecision(await client.cards.create({ name: "Ads", spendingLimitCents: 50000 }));

if (outcome.decision === "park") {
  console.log(outcome.approvalId, outcome.action, outcome.primitive, outcome.message);
  await client.approvals.wait(outcome.approvalId);
} else {
  outcome.value;   // executed
}
```

<Note>
  `asDecision` folds on the **body** discriminator (`status: "pending_approval"`), not the HTTP
  status — `Http.request` discards the status code, so 202-vs-200 is not observable from this
  client at all. The body discriminator is the only signal that survives the transport, and the
  API sends it on every gated route.

  For a boolean check without the fold, `isPendingApproval(res)` is exported too. See
  [Errors](/docs/sdk/errors) and [Approvals](/docs/sdk/sub-clients/approvals).
</Note>

## `brain.forget` is the sharp case

```ts theme={"theme":"css-variables"}
const res = await naive.brain.forget({ scope: "entity", scope_ref: "Acme Corp" });
if (res.decision === "park") {
  // 🔴 NOTHING WAS ERASED. A human must approve it first.
} else {
  // erased
}
```

A human caller executes the erase immediately; an agent caller **parks** it and the erase does
**not** happen. `BrainHandle.forget` returns a `Decision<T>` precisely so those two cannot be
confused. The legacy `BrainClient.forget` returns `Promise<unknown>` and a resolved promise
there reads as "it happened" — it does not.

## The denial vocabulary

`NaiveError.code` stays typed as `string` — narrowing it would break every existing
`e.code === "…"` comparison in customer code. The closed union ships **alongside** it:

```ts theme={"theme":"css-variables"}
import { NaiveError, isNaiveErrorCode, denialOf } from "@usenaive-sdk/server";
import type { NaiveErrorCode } from "@usenaive-sdk/server";

try {
  await support.runs.start({ /* … */ });
} catch (err) {
  if (err instanceof NaiveError && isNaiveErrorCode(err.code)) {
    const code: NaiveErrorCode = err.code;   // narrowed
    const detail = denialOf(err);            // structured denial, when the API sent one
  }
}
```

The 36 members of `NAIVE_ERROR_CODES`, by family:

* **Governance** — `capability_denied`, `approval_required`, `approval_expired`,
  `budget_exceeded`, `unpriceable`, `statute_denied`, `grant_expired`, `grant_spent`,
  `unnamed_approver`, `approver_set_empty`, `pending_limit_exceeded`,
  `enforcement_unavailable`, `snapshot_stale`, `unknown_action`, `unknown_resource`,
  `residency_violation`, `outside_active_window`, `rate_limited`, `concurrency_limited`
* **Deploy** — `manifest_stale`, `company_block_conflict`, `brain_retention_unsupported`,
  `residency_unsupported_on_runtime`, `plan_required`
* **Brain** — `brain_not_permitted`, `brain_not_bound`, `brain_invalid_input`
* **Transport** — `unauthorized`, `not_found`, `conflict`, `server_error`,
  `malformed_response`, `network`, `timeout`, `contract_version_mismatch`, `not_implemented`

`NAIVE_ERROR_CODES` is exported as a runtime array, so you can switch exhaustively without
transcribing the list.

## What the SDK cannot reach yet

<Warning>
  **There is no policy, grants, limits, spend or attestation client on this SDK.** Those REST
  operations exist and answer — `GET /v1/policy/snapshot`, `POST /v1/policy/explain`,
  `GET /v1/policy/statute`, `GET /v1/grants`, `GET /v1/limits`, `GET /v1/spend`,
  `GET /v1/attestations`, `GET /v1/connections/policy` — but no namespace on `NaiveClient` maps
  to them.

  Both audit methods are **wired**, to `GET /v1/policy/decisions` and
  `GET /v1/policy/decisions/{id}` — the published address of the ledger reader. (An earlier
  version of this client named `/v1/audit/decisions`, which has never been mounted.) Both routes
  answer `501 not_configured` on this build, because `policy_decisions` has no table yet, and the
  refusal says so on the wire rather than being guessed at client-side.

  `naive.forTenant(id).logs` is a **different table** — primitive call events, not governance
  decisions — so do not substitute one for the other.

  There is no CLI group for them either — `naive policy`, `naive grants`, `naive limits` and
  `naive spend` are not registered commands. Until a client lands, reach the mounted governance
  routes over REST, or through the untyped escape hatch on the same credential and host:

  ```ts theme={"theme":"css-variables"}
  const snapshot = await naive.legacy.invoke("GET", "/v1/policy/snapshot");
  const why = await naive.legacy.invoke("POST", "/v1/policy/explain", {
    action: "payments.transfer",
    subject: alice.id,
  });
  ```
</Warning>

<Info>
  **`POST /v1/policy/explain` reports the engine's verdict vocabulary** — it says `park`, never
  `approve` — plus the layer and the config path that decided. It is the fastest way to answer
  "why was this denied" without reading a ledger that has no reader.
</Info>

## The manifest-digest fence is not implemented

`defineConfig` returns your config by identity and computes no digest, so there is nothing for
the client to send and nothing to compare against the applied manifest. The
`onDigestMismatch` option is **absent** rather than accepted-and-ignored. `digestsOf(err)` is
exported and will decode a `manifest_stale` error if the API ever sends one; today nothing
does.

See also: [Teams & the durable runtime](/docs/sdk/teams) · [Errors](/docs/sdk/errors) ·
[Account Kits](/docs/architecture/account-kits) ·
[Governance gateway](/docs/architecture/governance-gateway).
