> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Backend Proxy

> ANY /v1/apps/:id/supabase/proxy/* — Call any backend management API operation, scoped to the app's own managed backend.

Generic passthrough to the underlying [backend management API](https://supabase.com/docs/reference/api) for **fullstack** apps. Naive injects its backend access token and forwards your request, so **any operation the management API supports** can be performed against the app's project — database queries and migrations, auth configuration, storage, edge functions, secrets, REST settings, and more.

The upstream path goes after `/supabase/proxy/`. The HTTP method, query parameters, and JSON body are forwarded as-is; the upstream status code and body are returned verbatim.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  # Get the project's auth configuration
  curl "https://api.usenaive.ai/v1/apps/094cdfb5-c4dc-494d-91dc-8a0c1c3e94c2/supabase/proxy/v1/projects/abcdefghijklmnop/config/auth" \
    -H "Authorization: Bearer nv_sk_live_..."

  # Update auth config (e.g. set the site URL)
  curl -X PATCH "https://api.usenaive.ai/v1/apps/:id/supabase/proxy/v1/projects/abcdefghijklmnop/config/auth" \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{"site_url": "https://myapp.com"}'

  # Run SQL directly
  curl -X POST "https://api.usenaive.ai/v1/apps/:id/supabase/proxy/v1/projects/abcdefghijklmnop/database/query" \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{"query": "select * from users limit 10"}'

  # List edge functions
  curl "https://api.usenaive.ai/v1/apps/:id/supabase/proxy/v1/projects/abcdefghijklmnop/functions" \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "site_url": "https://myapp.com",
    "jwt_exp": 3600,
    "disable_signup": false,
    "external_email_enabled": true,
    "external_google_enabled": false
  }
  ```
</ResponseExample>

## Scoping Rules

Naive holds an org-wide backend access token, so every request is validated against the app before it is forwarded:

| Path pattern           | Rule                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `v1/projects/{ref}/**` | `{ref}` must be this app's backend project ref (visible as `supabase.projectRef` on [`GET /v1/apps/:id`](/docs/api-reference/apps/get)). |

**Blocked:**

* `DELETE` on the project itself — use [`DELETE /v1/apps/:id`](/docs/api-reference/apps/delete) so all linked infrastructure is cleaned up together.
* All org/account-level paths (listing organizations, creating projects, other projects) — `403 forbidden`.

Requires a fullstack app — `frontend_only` apps have no managed backend and return `501 feature_not_configured`.

## Methods

`GET`, `POST`, `PATCH`, `PUT`, `DELETE`, with JSON bodies.

## Useful Operations

| Operation                 | Method + path                                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Run SQL                   | `POST v1/projects/{ref}/database/query`                                                                                       |
| Apply a tracked migration | `POST v1/projects/{ref}/database/migrations`                                                                                  |
| Auth config               | `GET` / `PATCH v1/projects/{ref}/config/auth`                                                                                 |
| Storage config            | `GET` / `PATCH v1/projects/{ref}/config/storage`                                                                              |
| Edge functions            | `GET v1/projects/{ref}/functions` · `POST …/functions` (JSON `body`) · `POST …/functions/deploy` (JSON `files[]` → multipart) |
| Project secrets           | `GET` / `POST v1/projects/{ref}/secrets`                                                                                      |
| REST config               | `GET` / `PATCH v1/projects/{ref}/postgrest`                                                                                   |
| API keys                  | `GET v1/projects/{ref}/api-keys`                                                                                              |
| Project health            | `GET v1/projects/{ref}/health`                                                                                                |

Consult the [backend management API reference](https://supabase.com/docs/reference/api) for the complete catalog, parameters, and response shapes.

## Data Plane Passthrough

Beyond the management API (`api.supabase.com`), four **data-plane** passthroughs hit the app's own backend project URL with the service-role key injected. Each backs a first-class primitive:

| Route                                | Forwards to                     | Primitive                                           |
| ------------------------------------ | ------------------------------- | --------------------------------------------------- |
| `ANY /v1/apps/:id/db/rest/*`         | `{projectUrl}/rest/v1/*` (REST) | [Database](/docs/api-reference/database/overview)        |
| `ANY /v1/apps/:id/storage/proxy/*`   | `{projectUrl}/storage/v1/*`     | [Storage](/docs/api-reference/storage/overview)          |
| `ANY /v1/apps/:id/auth/proxy/*`      | `{projectUrl}/auth/v1/*` (auth) | [Auth](/docs/api-reference/auth/overview)                |
| `ANY /v1/apps/:id/functions/proxy/*` | `{projectUrl}/functions/v1/*`   | [Edge Functions](/docs/api-reference/functions/overview) |

```bash theme={"theme":"css-variables"}
# REST: select rows (Prefer makes inserts return the created row)
curl "https://api.usenaive.ai/v1/apps/:id/db/rest/users?select=id,email&limit=10" \
  -H "Authorization: Bearer nv_sk_live_..."

# Storage: list buckets
curl "https://api.usenaive.ai/v1/apps/:id/storage/proxy/bucket" \
  -H "Authorization: Bearer nv_sk_live_..."

# Auth (admin): list end-users
curl "https://api.usenaive.ai/v1/apps/:id/auth/proxy/admin/users" \
  -H "Authorization: Bearer nv_sk_live_..."

# Functions: invoke
curl -X POST "https://api.usenaive.ai/v1/apps/:id/functions/proxy/hello" \
  -H "Authorization: Bearer nv_sk_live_..." -d '{"name":"world"}'
```

All forward with the app's service-role key, bypassing RLS — treat as admin access. REST behavior headers (`Prefer`, `Range`, `Accept`, `Accept-Profile`, `Content-Profile`) are forwarded on `db/rest`.

## Project ref in the path

The app id in the URL already scopes the call, so the `{ref}` segment is
**rewritten to this app's own project ref** before the request is forwarded.
Pasting a stale, example, or someone else's ref does not reach that project —
it silently targets yours. Read the response against the app you named, not
against the ref you typed.

An empty `{ref}` is still rejected:

```json 403 theme={"theme":"css-variables"}
{
  "error": {
    "code": "forbidden",
    "message": "Path must reference this app's backend project (v1/projects/abcdefghijklmnop/...)"
  }
}
```

## Errors

Upstream errors (4xx/5xx) are passed through with their original status code and body.
Failures on `…/functions*` paths are wrapped into the Naive error envelope
(`{ error: { code, message, http_status } }`) so the upstream message survives.

## Path rewrites

| You call                                                      | Actually sent                                                     | Why                                                                                           |
| ------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `POST v1/projects/{ref}/storage/buckets`                      | `POST storage/v1/bucket` on the project's Storage API             | The Management API has no bucket-create route (GET only)                                      |
| `GET v1/projects/{ref}/auth/users`                            | `GET auth/v1/admin/users` on the project's Auth API               | The Management API has no user-list route; users live on the project's GoTrue admin endpoint  |
| `POST v1/projects/{ref}/functions/deploy` with JSON `files[]` | the same path as `multipart/form-data`, one `file` part per entry | Deploy requires multipart file parts; a zip is rejected with "Entrypoint path does not exist" |
| `POST v1/projects/{ref}/functions` with no `body`             | the same call with a hello-world Deno source                      | Create with no source fails opaquely upstream                                                 |
