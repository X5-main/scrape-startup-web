> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Approval

> GET /v1/users/:user_id/approvals/:id — fetch one approval.

Returns a single approval, including its frozen `payload` and — once resolved —
the `result` (on `executed`) or `error` (on `failed`). Use this to poll a
pending approval after an agent received a `202`.

Cross-user variant: `GET /v1/approvals/:id`.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/users/USER_ID/approvals/APPROVAL_ID \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

<ResponseExample>
  ```json theme={"theme":"css-variables"}
  {
    "id": "uuid",
    "primitive": "cards",
    "action_type": "cards.create",
    "status": "executed",
    "payload": { "name": "Ads", "spendingLimitCents": 50000 },
    "result": { "card": { "id": "uuid" }, "checkout_url": "https://..." },
    "resolved_by": { "actor_type": "user", "actor_id": "usr_..." },
    "resolved_at": "2026-06-01T00:01:00.000Z"
  }
  ```
</ResponseExample>
