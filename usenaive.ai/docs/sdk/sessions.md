> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Sessions

> Per-user MCP sessions via the SDK.

A session gives an agent a per-user MCP endpoint, scoped by the user's AccountKit.

```ts theme={"theme":"css-variables"}
const client = naive.forUser(alice.id);
const session = await client.session({ ttlMs: 15 * 60 * 1000 });

// session.mcp.url + session.mcp.headers — hand to any MCP client
// session.expires_at — default 15 min, max 24h

await client.sessions.revoke(session.id); // revoke early
```

`naive.session()` (root) is sugar for the default user. The bearer token is in
`session.mcp.headers.Authorization`, never in the URL. See
[Architecture → Sessions](/docs/architecture/sessions).
