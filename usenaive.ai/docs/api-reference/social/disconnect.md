> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Disconnect Account

> DELETE /v1/social/accounts/:id — Disconnect a social account.

<ParamField path="id" type="string" required>
  UUID of the social account to disconnect.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X DELETE https://api.usenaive.ai/v1/social/accounts/acc-uuid \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "disconnected": true,
    "account_id": "acc-uuid"
  }
  ```
</ResponseExample>
