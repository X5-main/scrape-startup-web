> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Execute Tool

> POST /v1/users/:user_id/connections/:toolkit/execute — run a toolkit tool.

<ParamField body="tool" type="string" required>Tool slug, e.g. `GMAIL_SEND_EMAIL`.</ParamField>
<ParamField body="arguments" type="object">Tool arguments.</ParamField>
<ParamField body="connected_account_id" type="string">Optional explicit account.</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users/USER_ID/connections/gmail/execute \
    -H "Authorization: Bearer $NAIVE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"tool":"GMAIL_SEND_EMAIL","arguments":{"recipient_email":"lead@example.com","subject":"Hi","body":"..."}}'
  ```
</RequestExample>

Gated by the kit's toolkit + per-tool filter. Returns `{ successful, error, data }`.
