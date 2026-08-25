> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Sessions

> Short-lived, revocable MCP sessions scoped to a single tenant user — hand an agent a fused native + third-party toolset without sharing your workspace key.

A **session** is a short-lived, revocable credential that lets an MCP client connect
**as a single [tenant user](/docs/getting-started/users)**. Instead of handing an agent your
workspace API key, you mint a session: it returns an MCP URL plus a bearer token (an
`nv_sess_…` token) that expires and can be revoked at any time. The session's tool list is
the fused native + third-party toolset, filtered by that user's
[Account Kit](/docs/getting-started/account-kits). See
[Architecture → Sessions](/docs/architecture/sessions).

## Tools

| Tool              | Type       | Description                               |
| ----------------- | ---------- | ----------------------------------------- |
| `sessions_create` | Core       | Mint a TTL-limited MCP session for a user |
| `sessions_list`   | Core       | List a user's sessions and their status   |
| `sessions_revoke` | Management | Revoke a session immediately              |

## Creating a Session

The token travels in the `Authorization` header — never in the URL. The returned
`mcp.url` + `mcp.headers` are everything an MCP client needs to connect.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users/{user_id}/sessions \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "ttl_ms": 900000 }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  // Scoped to a specific user…
  const session = await naive.forUser(alice.id).sessions.create({ ttlMs: 15 * 60 * 1000 });
  // …or the default user (sugar):
  const s = await naive.session();

  // session.mcp.url + session.mcp.headers → hand to your MCP client
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "id": "8db5b930-12cb-4563-8e40-5aebb100f28f",
  "expires_at": "2026-06-04T07:05:07Z",
  "mcp": {
    "url": "https://api.usenaive.ai/mcp/sse/8db5b930-12cb-4563-8e40-5aebb100f28f",
    "headers": { "Authorization": "Bearer nv_sess_…" },
    "expires_at": "2026-06-04T07:05:07Z"
  }
}
```

### Parameters

| Param    | Type   | Required | Default         | Description                      |
| -------- | ------ | -------- | --------------- | -------------------------------- |
| `ttl_ms` | number | No       | 900000 (15 min) | Session lifetime in ms (max 24h) |

<Info>
  The MCP connection is bound to the session's tenant user: multi-tenant tools
  (connections, vault, logs) default to that user, and execution stays gated by the user's
  Account Kit. Revoke a session and the connection is rejected immediately.
</Info>

## Listing & Revoking

```bash theme={"theme":"css-variables"}
# List a user's sessions (tokens are never returned)
curl https://api.usenaive.ai/v1/users/{user_id}/sessions \
  -H "Authorization: Bearer nv_sk_your_key"

# Revoke immediately
curl -X DELETE https://api.usenaive.ai/v1/users/{user_id}/sessions/{session_id} \
  -H "Authorization: Bearer nv_sk_your_key"
```

A session is `active`, `expired` (past its TTL), or `revoked`.

## Error Handling

| Error           | Cause                                                         | Recovery                             |
| --------------- | ------------------------------------------------------------- | ------------------------------------ |
| `not_found`     | Invalid `session_id` / `user_id`                              | Use `GET .../sessions` for valid ids |
| `unauthorized`  | The `nv_sess_…` token is expired or revoked (at connect time) | Mint a fresh session                 |
| `invalid_input` | `ttl_ms` out of range                                         | Use 1ms–24h                          |

## Typical Workflow

```
Give a user's agent scoped MCP access without sharing your key
    │
    ├─ POST /v1/users/alice/sessions          → mint session
    │   { ttl_ms: 900000 }
    │   → mcp.url + Authorization: Bearer nv_sess_…
    │
    ├─ MCP client connects to mcp.url with the bearer header
    │   → tools fused (native + connections), gated by Alice's Account Kit
    │
    └─ DELETE /v1/users/alice/sessions/{id}    → revoke when done (connection drops)
```
