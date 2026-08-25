> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Deny Action

> POST /v1/users/:user_id/approvals/:id/deny — deny a pending action.

Denies a `pending` approval. The frozen action is **never executed**; status
becomes `denied`. Only `pending` approvals can be denied.

<ParamField body="reason" type="string">Optional note recorded on the approval.</ParamField>

Cross-user variant: `POST /v1/approvals/:id/deny`.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users/USER_ID/approvals/APPROVAL_ID/deny \
    -H "Authorization: Bearer $NAIVE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"reason":"Not now"}'
  ```
</RequestExample>

<ResponseExample>
  ```json theme={"theme":"css-variables"}
  { "id": "uuid", "status": "denied", "reason": "Not now" }
  ```
</ResponseExample>
