> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Toolkit Tools

> GET /v1/users/:user_id/connections/:toolkit/tools — tool schemas.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/users/USER_ID/connections/gmail/tools \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

Query params: `search`, `limit` (max 200). Returns `{ toolkit, tools }`.
