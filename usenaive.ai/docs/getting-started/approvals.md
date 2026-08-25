> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Approvals

> Human-in-the-loop approval for sensitive agent actions — the API freezes a gated request and replays it once a human approves.

**Approvals** put a human in the loop before an agent does anything high-stakes. When an
agent triggers a sensitive action, the API freezes the request and returns
`202 { status: "pending_approval", approval_id }` instead of executing. A human (the
developer, or the end-user in your app) approves or denies it; on approval the API
**replays the frozen action** and records the result.

Gating is configured per primitive on the [Account Kit](/docs/getting-started/account-kits),
and the queue is a first-class resource alongside `vault` and `logs`.

## CLI First

```bash theme={"theme":"css-variables"}
naive approvals list --status pending
naive approvals approve <approval-id>
naive approvals deny <approval-id> --reason "not authorized"
```

## Tools

| Tool                | Type | Description                                |
| ------------------- | ---- | ------------------------------------------ |
| `approvals_list`    | Core | List approvals (filter by status)          |
| `approvals_get`     | Core | Fetch a single approval + its result/error |
| `approvals_approve` | Core | Approve → API replays the frozen action    |
| `approvals_deny`    | Core | Deny with an optional reason               |

## What's gated by default

The full default-gated set (33 actions):

| Group       | `action_type`                                                                                                                                                                                | Why it is gated by default                                                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Cards       | `cards.create` · `cards.cardholder.create` · `cards.topup`                                                                                                                                   | issues or funds a real payment instrument                                                                                                      |
| Trading     | `trading.order.create` · `trading.order.cancel` · `trading.position.close`                                                                                                                   | moves real money or assets in a connected brokerage account                                                                                    |
| Domains     | `domains.purchase`                                                                                                                                                                           | spends money on a registrar                                                                                                                    |
| Identity    | `verification.start` · `formation.create` · `formation.submit`                                                                                                                               | starts KYC or incorporates a real legal entity                                                                                                 |
| Connections | `connections.connect` · `browser.signup`                                                                                                                                                     | creates a real third-party account under the user's identity and stores a credential                                                           |
| Compute     | `compute.create` · `compute.exec`                                                                                                                                                            | runs arbitrary containers; `exec` opens an interactive shell into a running task                                                               |
| Phone       | `phone.provision`                                                                                                                                                                            | spends credits and registers a 10DLC campaign against the business. **Sending an SMS is not gated** — it is a routine comms action, like email |
| Brain       | `brain.kb.delete` · `brain.document.delete` · `brain.forget` · `brain.proposal.accept`                                                                                                       | destroys company knowledge, or canonizes model-authored text                                                                                   |
| Mobile      | `mobile.provision` · `mobile.reboot` · `mobile.reset` · `mobile.terminate` · `mobile.run` · `mobile.stop` · `mobile.upload_app` · `mobile.call` · `mobile.set_proxy` · `mobile.remove_proxy` | drives real cloud devices and costs credits                                                                                                    |
| Sandbox     | `sandbox.create` · `sandbox.fork` · `sandbox.exec` · `sandbox.expose`                                                                                                                        | spends credits on a micro-VM and runs arbitrary shell commands in it; `expose` publishes a guest port at a public URL                          |

`phone.call` and `phone.voice_enable` are **not** gated by default; set
`requiresApproval: true` for `phone` on the kit if you need them gated.

Developers override this per primitive in the Account Kit
(`primitives_config.<primitive>.requiresApproval`, or
`connections_config.requiresApproval`). Set `true` to force approval, `false` to opt out.
Human (dashboard/session) callers bypass the gate, and so do agent calls on the
account's own **default** agent profile — only agent calls on real tenant users are gated.

## Lifecycle

<CodeGroup>
  ```javascript JavaScript theme={"theme":"css-variables"}
  import { isPendingApproval } from "@usenaive-sdk/server";
  const alice = naive.forUser("alice");

  // 1. Agent attempts a gated action → pending, not executed
  const res = await alice.cards.create({ name: "Ads", spendingLimitCents: 50000 });
  if (isPendingApproval(res)) {
    // res.approval_id — surface it to the human who can approve
  }

  // 2. A human approves → API replays the action
  await alice.approvals.approve(res.approval_id);

  // 3. Inspect the outcome
  const a = await alice.approvals.get(res.approval_id); // status: "executed" + result
  ```

  ```bash curl theme={"theme":"css-variables"}
  # 1. Gated action returns 202 with an approval_id
  # 2. Approve it (replays the frozen call)
  curl -X POST https://api.usenaive.ai/v1/users/{user_id}/approvals/{approval_id}/approve \
    -H "Authorization: Bearer nv_sk_your_key"

  # 3. Check status
  curl https://api.usenaive.ai/v1/users/{user_id}/approvals/{approval_id} \
    -H "Authorization: Bearer nv_sk_your_key"
  ```
</CodeGroup>

**Pending response (202):**

```json theme={"theme":"css-variables"}
{
  "status": "pending_approval",
  "approval_id": "65589c8b-e033-4a65-b16c-379211c94429",
  "action_type": "cards.create",
  "primitive": "cards",
  "title": "Issue virtual card \"Ads\""
}
```

A `pending` approval becomes `executed` (with the action's `result`), `failed` (with an
`error`), or `denied`.

## Error Handling

| Error           | Cause                                       | Recovery                                            |
| --------------- | ------------------------------------------- | --------------------------------------------------- |
| `not_found`     | Invalid `approval_id` / `user_id`           | Use `GET .../approvals?status=pending`              |
| `invalid_input` | Approval already resolved (executed/denied) | Fetch it to see the terminal status                 |
| `forbidden`     | Caller may not resolve this approval        | Approve as the developer (session or workspace key) |

## Typical Workflow

```
Agent tries to issue a card for Alice (gated by her Account Kit)
    │
    ├─ POST /v1/users/alice/cards                  → 202 pending_approval, approval_id
    │
    ├─ (your app shows Alice/developer the pending action)
    │
    ├─ POST /v1/users/alice/approvals/{id}/approve → API replays cards.create
    │   → status: executed, result: { card_id, checkout_url }
    │
    └─ GET  /v1/users/alice/approvals/{id}         → confirm executed + inspect result
```
