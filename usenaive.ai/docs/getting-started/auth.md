> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Auth

> End-user authentication for your app or your users' apps — auth config and admin user management on a fullstack app's managed backend.

The **Auth** primitive manages authentication for a [fullstack app's](/docs/getting-started/apps) managed backend: read/update the auth configuration (providers, redirect URLs, signup policy) and perform admin user management (create, list, delete end-users).

<Info>
  Requires a **fullstack app** (`naive.apps.create({ name, type: "fullstack" })`). Admin user management uses the project service-role key — privileged operations. Gate or disable the `auth` primitive per user in the Account Kit when you don't want an agent touching end-user accounts.
</Info>

## Two ways to use it

```ts theme={"theme":"css-variables"}
// Your own project (default user)
await naive.auth.getConfig();

// A specific end-user's project (your customer's own app + its end-users)
await naive.forUser(alice.id).auth.users.list();
```

Omit `{ appId }` to auto-resolve the user's single fullstack app; pass it when they own several.

## Auth configuration

```ts theme={"theme":"css-variables"}
await naive.auth.getConfig();
await naive.auth.updateConfig({
  site_url: "https://myapp.com",
  external_google_enabled: true,
});
```

## Admin user management

```ts theme={"theme":"css-variables"}
await naive.auth.users.create({ email: "user@example.com", password: "..." });
await naive.auth.users.list();
await naive.auth.users.get("user-uuid");
await naive.auth.users.delete("user-uuid");
```

This is the auth service's admin API — for an app's own runtime auth (sign-in, sessions) the deployed app uses the public anon key client-side; this primitive is the server-side admin surface.

## REST

```bash theme={"theme":"css-variables"}
# Auth config (management API)
curl "https://api.usenaive.ai/v1/apps/<app-id>/supabase/proxy/v1/projects/<ref>/config/auth" \
  -H "Authorization: Bearer nv_sk_live_..."

# Admin users
curl https://api.usenaive.ai/v1/apps/<app-id>/auth/proxy/admin/users \
  -H "Authorization: Bearer nv_sk_live_..."
```

Your own project uses `/v1/apps/<app-id>/…`; an end-user's project uses `/v1/users/<user-id>/apps/<app-id>/…`.

See the [Auth API reference](/docs/api-reference/auth/overview).

## Billing

Free — no per-operation credit cost. Account Kits can enable/disable the `auth` primitive per user.
