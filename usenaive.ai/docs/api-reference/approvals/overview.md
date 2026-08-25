> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Approvals Overview

> Human-in-the-loop queue for sensitive agent actions.

Sensitive agent actions (cards, domains, KYC, formation, connecting services)
can require human approval. When gated, the originating endpoint returns
`202` with a pending-approval body instead of executing:

```json theme={"theme":"css-variables"}
{
  "status": "pending_approval",
  "approval_id": "uuid",
  "action": "cards.create",
  "primitive": "cards",
  "title": "Issue virtual card \"Ads\"",
  "message": "This action requires human approval before it executes."
}
```

Approve it (the API replays the frozen action) or deny it via the endpoints
below. Two mounts:

* **Per-user:** `/v1/users/:user_id/approvals` (the user's queue)
* **Cross-user:** `/v1/approvals` (developer dashboard, all users)

| Method | Path                     | Purpose                                               |
| ------ | ------------------------ | ----------------------------------------------------- |
| GET    | `/approvals?status=`     | [List approvals](/docs/api-reference/approvals/list)       |
| GET    | `/approvals/:id`         | [Get one](/docs/api-reference/approvals/get)               |
| POST   | `/approvals/:id/approve` | [Approve & execute](/docs/api-reference/approvals/approve) |
| POST   | `/approvals/:id/deny`    | [Deny](/docs/api-reference/approvals/deny)                 |

Which actions are gated is configured per primitive on the
[Account Kit](/docs/architecture/account-kits) (`requiresApproval`). See
[Architecture → Approvals](/docs/architecture/approvals) for the execution model.
