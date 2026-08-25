> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Approvals

> GET /v1/users/:user_id/approvals — list approvals for a user.

<ParamField query="status" type="string">Filter: `pending` | `executed` | `failed` | `denied` | `expired`.</ParamField>

Cross-user variant: `GET /v1/approvals?status=&user_id=` returns approvals
across every tenant user (developer dashboard).

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/users/USER_ID/approvals?status=pending \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

<ResponseExample>
  ```json theme={"theme":"css-variables"}
  {
    "approvals": [
      {
        "id": "uuid",
        "tenant_user_id": "uuid",
        "primitive": "domains",
        "action_type": "domains.purchase",
        "title": "Purchase domain acme.com",
        "payload": { "domain": "acme.com" },
        "status": "pending",
        "requested_by": { "actor_type": "agent", "actor_id": "agt_..." },
        "created_at": "2026-06-01T00:00:00.000Z"
      }
    ]
  }
  ```
</ResponseExample>
