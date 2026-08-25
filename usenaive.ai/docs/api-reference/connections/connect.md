> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Connect Toolkit

> POST /v1/users/:user_id/connections/connect — start a hosted connect-link flow.

<ParamField body="toolkit" type="string" required>Toolkit slug, e.g. `gmail`.</ParamField>
<ParamField body="callback_url" type="string">Where the user is returned after auth.</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users/USER_ID/connections/connect \
    -H "Authorization: Bearer $NAIVE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"toolkit":"gmail","callback_url":"https://app.example.com/oauth"}'
  ```
</RequestExample>

Returns `{ toolkit, connectedAccountId, redirectUrl, status }`. Blocked with `forbidden`
if the user's AccountKit doesn't allow the toolkit.

<Note>
  **May require approval.** If the user's Account Kit gates `connections.connect`
  (`connections_config.requiresApproval`, or per-toolkit `approvalToolkits`), an
  agent (API-key) call returns `202 { "status": "pending_approval", "approval_id" }`
  instead of starting the connect flow. A human approves it via
  [Approvals](/docs/api-reference/approvals/overview); the connection starts on replay.
  See [Approvals](/docs/getting-started/approvals).
</Note>
