> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# sessions

> Mint, list and revoke short-lived per-user MCP credentials.

An MCP session is a short-lived, revocable credential (`nv_sess_…`) scoped to a
single tenant user. Hand the returned `mcp.url` and `mcp.headers` to an MCP
client instead of sharing a long-lived api key — the token expires on its own
and can be revoked early.

```bash theme={"theme":"css-variables"}
naive sessions create --ttl-ms 900000              # active user (naive use <id>) or the default user
naive sessions create --user <user_id> --ttl-ms 600000
naive sessions list --user <user_id>               # tokens are never returned
naive sessions revoke <session_id> --user <user_id>
```

| Option          | Verb     | Required | Notes                                                                                                           |
| --------------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `--user <id>`   | all      | No       | Target a specific tenant user. Omit to use the active user (`naive use <id>`), else the workspace default user. |
| `--ttl-ms <ms>` | `create` | No       | Session lifetime in milliseconds. Default `900000` (15 minutes), clamped to a maximum of 24 hours.              |

`create` returns the only copy of the token:

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "sessions.create",
  "result": {
    "id": "uuid",
    "expires_at": "2026-08-03T12:15:00.000Z",
    "mcp": {
      "url": "https://api.usenaive.ai/mcp/sse/uuid",
      "headers": { "Authorization": "Bearer nv_sess_…" },
      "expires_at": "2026-08-03T12:15:00.000Z"
    }
  }
}
```

Put the token in the `Authorization` header, never in the URL. `sessions list`
returns metadata only — a lost token cannot be recovered, mint a new session.

`sessions revoke` takes effect immediately; a revoked session stops
authenticating even before `expires_at`.

These verbs call the same `/v1/users/:user_id/sessions` routes the SDK and the
API reference expose ([create](/docs/api-reference/sessions/create),
[list](/docs/api-reference/sessions/list), [revoke](/docs/api-reference/sessions/revoke)),
so the subject rules are identical: a key sealed to an agent profile can only
mint sessions for its own subject.
