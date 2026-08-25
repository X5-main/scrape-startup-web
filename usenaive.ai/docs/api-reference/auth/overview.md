> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Auth Overview

> End-user auth config and admin user management on a fullstack app's managed backend.

The Auth primitive operates on a [fullstack app's](/docs/api-reference/apps/overview) managed backend. Auth configuration uses the backend management API (via the apps backend proxy); admin user management uses the auth service (`/auth/v1/admin`) with the service-role key. App-scoped, on both the company mount and per-user mount; the kit must enable the `auth` primitive on per-user mounts.

<Warning>
  Admin user operations use the project service-role key — privileged. Disable the `auth` primitive in an Account Kit to keep agents away from end-user accounts.
</Warning>

## Endpoints

| Method          | Path                                                        | Description                                                   |
| --------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| `GET` / `PATCH` | `/v1/apps/:id/supabase/proxy/v1/projects/{ref}/config/auth` | Read / update auth config (management API)                    |
| `ANY`           | `/v1/apps/:id/auth/proxy/*`                                 | Auth service passthrough (`/auth/v1/*`, incl. `/admin/users`) |

```bash theme={"theme":"css-variables"}
# Auth config
curl "https://api.usenaive.ai/v1/apps/<app-id>/supabase/proxy/v1/projects/<ref>/config/auth" \
  -H "Authorization: Bearer nv_sk_live_..."

# Admin: list users
curl https://api.usenaive.ai/v1/apps/<app-id>/auth/proxy/admin/users \
  -H "Authorization: Bearer nv_sk_live_..."

# Admin: create user
curl -X POST https://api.usenaive.ai/v1/apps/<app-id>/auth/proxy/admin/users \
  -H "Authorization: Bearer nv_sk_live_..." -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"...","email_confirm":true}'
```

## SDK

```ts theme={"theme":"css-variables"}
await naive.auth.updateConfig({ site_url: "https://myapp.com" });
await naive.forUser(userId).auth.users.create({ email: "u@example.com", password: "..." });
```

See the [Auth guide](/docs/getting-started/auth) and the [`auth` sub-client](/docs/sdk/sub-clients/auth).
