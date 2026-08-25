> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# approvals

> Review & resolve agent-requested approvals from the CLI.

Sensitive actions (issue/fund a card, purchase a domain, KYC, form a company,
connect a 3rd-party service) can require human approval. When gated, the
command prints `status: "pending_approval"` with an `approval_id` instead of
running — resolve it here.

```bash theme={"theme":"css-variables"}
naive approvals list --status pending --user alice
naive approvals get <approval-id> --user alice
naive approvals approve <approval-id> --user alice   # replays the frozen action
naive approvals deny <approval-id> --reason "not now" --user alice
naive approvals watch <approval-id> --user alice     # poll until resolved
```

Omit `--user` to use the active user (`naive use <id>`) or the account's default user. Configure which actions are gated per primitive on the
[Account Kit](/docs/cli/account-kits) (`requiresApproval`); secure defaults are on.

Example pending output from a gated command:

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "cards.create",
  "result": { "status": "pending_approval", "approval_id": "uuid", "action": "cards.create" },
  "hints": ["This action requires human approval before it executes."],
  "next_steps": [{ "command": "naive approvals approve uuid", "description": "Approve & execute" }]
}
```
