> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Query Logs

> GET /v1/users/:user_id/logs — per-user activity events. Also GET /v1/logs for cross-user.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  # per-user
  curl "https://api.usenaive.ai/v1/users/USER_ID/logs?action=vault.put&limit=50" \
    -H "Authorization: Bearer $NAIVE_API_KEY"

  # cross-user (agentProfile)
  curl "https://api.usenaive.ai/v1/logs?user_id=USER_ID&action=connection.execute" \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

Query params: `action`, `after` (ISO), `limit`. Returns `{ events }`.
