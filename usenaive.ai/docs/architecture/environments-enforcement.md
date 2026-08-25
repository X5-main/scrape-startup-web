> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Environments enforcement

> How sandbox is enforced — the governor's verdict carries the target, so a sandbox operator cannot reach production before promotion.

The [Environments primitive](/docs/getting-started/environments) is only as good as
its enforcement. A sandbox operator must be *unable* to cause a real-world
effect — not merely discouraged. That guarantee rests on **one closed
chokepoint**, which is not in the open plumbing: it lives in the enforcement
engine.

## The chokepoint — the governor

`environment` is an **input to every `evaluate` call** (`PROTOCOLS.md` §1). The
governor decides, and its `Verdict` carries a `target`:

* `target: "live"` — an allowed action routes to the real provider.
* `target: "sandbox"` — an allowed action routes to the sandbox adapter instead.

For a sandbox operator, allowed guarded actions come back `target: "sandbox"`.
The **open, per-primitive sandbox adapters** honor that verdict — they are
simply *where* a `sandbox` verdict is carried out, executing the documented
sandbox behavior of each primitive and writing synthetic resources stamped
`sandbox`. Policy still runs identically; approvals still freeze. The decision is
the governor's; the adapter only obeys the target it is handed.

### Per-primitive sandbox behavior

| Primitive                                                               | Sandbox behavior                                                                                                                                                                                                                                                      |
| :---------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **cards**                                                               | **Stripe test-mode** when an `sk_test_` key is configured; otherwise a **synthetic** card — a real stamped, listable row with `last4 0000`. (With only a live key present, the test-mode leg is `BLOCKED(stripe-test-key)` and synthetic is the documented behavior.) |
| **phone**                                                               | **Synthetic** provisioning — a `+1…5550100` number, `active_sandbox`, no carrier call.                                                                                                                                                                                |
| **formation**                                                           | **Synthetic** — `completed_sandbox` / `filed_sandbox`, no real filing.                                                                                                                                                                                                |
| **domains**                                                             | **Synthetic** — `registered_sandbox`, no registrar purchase.                                                                                                                                                                                                          |
| **verification**                                                        | **Synthetic** — `completed_sandbox`, no hosted KYC flow.                                                                                                                                                                                                              |
| **trading**                                                             | **Paper** — orders acknowledge (`accepted_sandbox`) but never route.                                                                                                                                                                                                  |
| **connections**                                                         | **Synthetic** — `connected_sandbox`, no OAuth handshake.                                                                                                                                                                                                              |
| **browser**                                                             | **Synthetic** — `signed_up_sandbox`, no real account created.                                                                                                                                                                                                         |
| **compute**                                                             | **Synthetic** — `running_sandbox`, no container started.                                                                                                                                                                                                              |
| **mobile**                                                              | **Synthetic** — `ok_sandbox` for every device action.                                                                                                                                                                                                                 |
| **search / LLM**                                                        | **Stay real reads.** These are non-mutating information calls with no real-world side effect, so sandbox does not synthesize them — you get real results.                                                                                                             |
| **email**                                                               | **Refused.** See below.                                                                                                                                                                                                                                               |
| **brain** (`kb.delete`, `document.delete`, `forget`, `proposal.accept`) | **Refused.** See below.                                                                                                                                                                                                                                               |

## Five actions refuse instead of synthesizing

A sandbox leg is **optional** on an executor registration, and its absence is a
deliberate statement rather than a gap. When a `sandbox` verdict reaches an action with
no sandbox leg, the action fails with **`501 not_configured` — "No sandbox adapter for
`<action>`"** and the hint *"Promote the operator to production, or add a sandbox
adapter for this primitive."* It never falls through to the live leg.

Five actions are in that state today:

* **`email.send`** — there is no defined "sandbox email" behavior. A synthetic
  acknowledgement would tell an operator their mail was accepted when nothing was
  queued, which is worse than a refusal.
* **`brain.kb.delete`**, **`brain.document.delete`**, **`brain.forget`**,
  **`brain.proposal.accept`** — a synthetic acknowledgement would report a corpus as
  destroyed when it was not, and accepting a proposal has no meaning without writing to
  the real brain.

<Warning>
  Plan for this when you write sandbox tests. A sandbox operator calling `email.send` gets
  a `501`, **not** a captured message — there is no catch-all inbox in sandbox. Assert the
  refusal, or promote the operator to `production` against a test provider.
</Warning>

Every other guarded primitive returns a synthetic acknowledgement. None can touch a real
provider, because a `sandbox` verdict never routes to the live adapter.

<Note>
  The chokepoint fails closed. Stop the governor and every gated action returns
  `403 enforcement_unavailable`. See [Open core](/docs/architecture/open-core).
</Note>
