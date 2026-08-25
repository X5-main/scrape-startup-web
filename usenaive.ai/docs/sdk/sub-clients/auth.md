> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# auth

> End-user auth config and admin user management on a fullstack app's managed backend.

```ts theme={"theme":"css-variables"}
// Auth configuration — auto-resolves the user's single fullstack app (or pass { appId })
await naive.auth.getConfig();
await naive.auth.updateConfig({ site_url: "https://myapp.com", external_google_enabled: true });

// Admin user management
await naive.auth.users.create({ email: "user@example.com", password: "..." });
await naive.auth.users.list();
await naive.auth.users.get("user-uuid");
await naive.auth.users.delete("user-uuid");
```

Requires a `type: "fullstack"` [app](/docs/sdk/sub-clients/apps). Per-user and AccountKit-gated: `naive.auth` or `naive.forUser(id).auth`. Admin operations use the service-role key (privileged) — disable the `auth` primitive in an Account Kit to keep agents away from end-user accounts. See the [Auth guide](/docs/getting-started/auth).
