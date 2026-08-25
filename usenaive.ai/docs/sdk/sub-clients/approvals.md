> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# approvals

> Human-in-the-loop queue for sensitive agent actions.

```ts theme={"theme":"css-variables"}
const client = naive.forUser(alice.id);

// Sensitive calls may defer to a human instead of executing:
const res = await client.cards.create({ name: "Ads", spendingLimitCents: 50000 });
if (isPendingApproval(res)) {
  console.log("Needs approval:", res.approval_id);
}

await client.approvals.list({ status: "pending" });
await client.approvals.get(res.approval_id);
await client.approvals.approve(res.approval_id);     // replays the frozen action
await client.approvals.deny(res.approval_id, { reason: "later" });
await client.approvals.wait(res.approval_id);         // poll until resolved
```

`isPendingApproval(res)` is a typed discriminator exported from the SDK. The
gated methods — `cards.create`, `cards.* (cardholder, top-up)`,
`domains.purchase`, `verification.start`, `formation.submit`,
`connections.connect` — resolve to either their normal result **or** a
`PendingApproval` (HTTP 202 is success, not a thrown error).

`naive.agentTools()` marks every sensitive method `sensitive: true` in the
registry `naive_search_primitives` returns, and `naive_run_primitive` relays the
`pending_approval` status verbatim — so an LLM agent can detect a frozen action
and ask the user to approve it. Reading or resolving the queue is done through
this sub-client (`naive.approvals.list()`), not through a tool.

Which actions are gated is set per primitive on the
[Account Kit](/docs/architecture/account-kits) (`requiresApproval`). See
[Approvals](/docs/getting-started/approvals).
