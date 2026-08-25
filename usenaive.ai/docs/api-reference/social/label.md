> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Label Account

> POST /v1/social/accounts/:id/label — Set a custom label on a social account.

<ParamField path="id" type="string" required>
  UUID of the social account to label.
</ParamField>

<ParamField body="label" type="string" required>
  Custom label for the account (e.g. "Company Page", "Personal", "Marketing").
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/social/accounts/acc-uuid/label \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "label": "Company Page"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "account_id": "acc-uuid",
    "label": "Company Page"
  }
  ```
</ResponseExample>
