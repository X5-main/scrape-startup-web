> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Approve Action

> POST /v1/users/:user_id/approvals/:id/approve — approve & execute.

Approves a `pending` approval. The API **replays the frozen action** through the
same service that would have run it live, then records the `result` and sets
status to `executed` (or `failed` with an `error`). Only `pending` approvals can
be approved.

Cross-user variant: `POST /v1/approvals/:id/approve`.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users/USER_ID/approvals/APPROVAL_ID/approve \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

<ResponseExample>
  ```json theme={"theme":"css-variables"}
  {
    "id": "uuid",
    "status": "executed",
    "action_type": "domains.purchase",
    "result": { "checkout_url": "https://...", "domain": "acme.com" },
    "resolved_by": { "actor_type": "user", "actor_id": "usr_..." }
  }
  ```
</ResponseExample>
