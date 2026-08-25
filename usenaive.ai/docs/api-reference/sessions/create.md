> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Session

> POST /v1/users/:user_id/sessions — TTL'd per-user MCP session.

<ParamField body="ttl_ms" type="number">Session lifetime (default 15 min, max 24h).</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users/USER_ID/sessions \
    -H "Authorization: Bearer $NAIVE_API_KEY"
  ```
</RequestExample>

Returns `{ id, expires_at, mcp: { url, headers, expires_at } }`. The bearer is in
`mcp.headers.Authorization`, never the URL. See [Sessions](/docs/architecture/sessions).
