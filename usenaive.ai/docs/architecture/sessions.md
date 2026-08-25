> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Sessions

> TTL'd, revocable per-user MCP sessions — bearer in header, never URL.

A **session** gives an agent a per-user MCP endpoint. Created via
`POST /v1/users/:user_id/sessions`, it returns:

```json theme={"theme":"css-variables"}
{
  "id": "sess_...",
  "expires_at": "2026-01-01T00:15:00Z",
  "mcp": {
    "url": "https://api.usenaive.ai/mcp/sse/sess_...",
    "headers": { "Authorization": "Bearer nv_sess_..." },
    "expires_at": "2026-01-01T00:15:00Z"
  }
}
```

Security properties:

* The bearer token lives in the **Authorization header**, never the URL. The URL path
  carries only the non-secret session id.
* **Default TTL 15 minutes** (configurable up to 24h via `ttl_ms`).
* **Revocable** immediately via `DELETE /v1/users/:user_id/sessions/:id`.
* Logged by session id only — the bearer is never written to any log.

The session's tool list is the fused native + third-party toolset, filtered by the user's
AccountKit.
