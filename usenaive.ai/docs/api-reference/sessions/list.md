> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Sessions

> GET /v1/users/:user_id/sessions — a user's MCP sessions (tokens never returned).

Lists the most recent MCP sessions for a user with their lifecycle status. The bearer
token is **never** returned here — it is shown once at creation only.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/users/USER_ID/sessions" \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

Returns `{ sessions: [{ id, status, expires_at, revoked_at, created_at }] }` where
`status` is one of `active`, `expired`, `revoked`. Use `default` as the user id for the api
key's default user.
