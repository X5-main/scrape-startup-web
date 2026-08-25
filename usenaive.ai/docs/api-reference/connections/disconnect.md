> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Disconnect Toolkit

> DELETE /v1/users/:user_id/connections/:toolkit — soft-disable (or purge).

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X DELETE "https://api.usenaive.ai/v1/users/USER_ID/connections/gmail?purge=true" \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

Default soft-disables (reversible). `?purge=true` permanently deletes and revokes.
